-- =====================================================================
-- CAMPUS NIKA · Llamadas 1 a 1: fuente de verdad en el servidor   (PROPUESTA: NO EJECUTADO)
-- Fase 1 · pasos 1 y 3 del plan: tabla `llamadas`, RLS y operaciones atómicas del ciclo de vida.
-- NO toca private_messages ni el chat. Idempotente: se puede correr más de una vez.
-- Ejecutá cada BLOQUE por separado, en orden.
--
-- Qué resuelve:
--   · el servidor decide quién llama (auth.uid()), exige amistad aceptada y ausencia de bloqueos
--   · una sola llamada activa por persona (ocupado), rate-limit de intentos
--   · aceptar / rechazar / cancelar / finalizar son transiciones atómicas: gana una sola
--   · sin respuesta (45 s) y llamadas fantasma (sin latido) se cierran solas
--   · las invitaciones dejan de viajar por un canal público: el destinatario las recibe
--     por Realtime postgres_changes, que respeta RLS
--   · historial independiente del chat
-- =====================================================================

-- ---------------------------------------------------------------------
-- BLOQUE 1 · Tabla
-- ---------------------------------------------------------------------
create table if not exists public.llamadas (
    id              uuid primary key default gen_random_uuid(),
    caller_id       uuid not null references public.profiles(id) on delete cascade,
    callee_id       uuid not null references public.profiles(id) on delete cascade,
    tipo            text not null default 'voz' check (tipo in ('voz', 'video')),
    estado          text not null default 'llamando'
                    check (estado in ('llamando', 'aceptada', 'rechazada', 'cancelada', 'sin_respuesta', 'ocupado', 'finalizada')),
    sala            text not null,                       -- nombre del canal de medios; NO es una credencial
    creada_en       timestamptz not null default now(),
    atendida_en     timestamptz,
    finalizada_en   timestamptz,
    duracion_seg    integer,
    finalizada_por  uuid references public.profiles(id) on delete set null,
    latido_caller   timestamptz,                         -- última señal de vida de cada extremo
    latido_callee   timestamptz,
    constraint llamadas_no_a_si_mismo check (caller_id <> callee_id)
);
create index if not exists llamadas_callee_idx on public.llamadas (callee_id, creada_en desc);
create index if not exists llamadas_caller_idx on public.llamadas (caller_id, creada_en desc);
create index if not exists llamadas_activas_idx on public.llamadas (estado) where estado in ('llamando', 'aceptada');

-- ---------------------------------------------------------------------
-- BLOQUE 2 · RLS: solo participantes leen; NADIE escribe directo (todo pasa por las funciones de abajo)
-- ---------------------------------------------------------------------
alter table public.llamadas enable row level security;
drop policy if exists llamadas_select on public.llamadas;
create policy llamadas_select on public.llamadas for select to authenticated
    using (auth.uid() in (caller_id, callee_id));
revoke insert, update, delete on public.llamadas from anon, authenticated;
grant select on public.llamadas to authenticated;

-- ---------------------------------------------------------------------
-- BLOQUE 3 · Funciones (SECURITY DEFINER, la identidad sale SIEMPRE de auth.uid())
-- ---------------------------------------------------------------------

-- Cierra lo vencido de las dos personas indicadas (o de todas si son null). Interna.
create or replace function public._llamadas_limpiar(p_a uuid, p_b uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
    -- timbre vencido → sin respuesta (+ aviso de llamada perdida para el destinatario)
    for r in
        update public.llamadas set estado = 'sin_respuesta', finalizada_en = now()
         where estado = 'llamando' and creada_en < now() - interval '45 seconds'
           and (p_a is null or caller_id in (p_a, p_b) or callee_id in (p_a, p_b))
        returning id, caller_id, callee_id
    loop
        insert into public.notificaciones (para_id, de_id, de_username, tipo, titulo, cuerpo, datos, vence_en)
        select r.callee_id, r.caller_id, p.username, 'llamada_perdida', 'Llamada perdida',
               'Te llamó @' || p.username, jsonb_build_object('llamada', r.id), now() + interval '1 day'
          from public.profiles p where p.id = r.caller_id;
    end loop;
    -- llamada aceptada sin latidos de alguno de los extremos por 90 s → finalizada (fantasma)
    update public.llamadas
       set estado = 'finalizada', finalizada_en = now(),
           duracion_seg = greatest(0, extract(epoch from (now() - atendida_en))::int)
     where estado = 'aceptada'
       and greatest(coalesce(latido_caller, atendida_en), coalesce(latido_callee, atendida_en)) < now() - interval '90 seconds'
       and least(coalesce(latido_caller, atendida_en), coalesce(latido_callee, atendida_en)) < now() - interval '90 seconds'
       and (p_a is null or caller_id in (p_a, p_b) or callee_id in (p_a, p_b));
end $$;

-- Crear. Devuelve la fila. Si el destinatario está en otra llamada queda registrada como 'ocupado'.
create or replace function public.llamada_crear(p_callee uuid, p_tipo text default 'voz')
returns public.llamadas language plpgsql security definer set search_path = public as $$
declare
    yo uuid := auth.uid();
    fila public.llamadas;
    ocupado boolean;
    id_nuevo uuid := gen_random_uuid();
    nom text;
begin
    if yo is null then raise exception 'sesion requerida' using errcode = '42501'; end if;
    if p_callee is null or p_callee = yo then raise exception 'destinatario invalido' using errcode = '22023'; end if;
    if p_tipo not in ('voz', 'video') then p_tipo := 'voz'; end if;

    -- serializa a las dos personas para que dos llamadas simultáneas no se crucen
    perform pg_advisory_xact_lock(hashtextextended(least(yo, p_callee)::text, 0));
    perform pg_advisory_xact_lock(hashtextextended(greatest(yo, p_callee)::text, 0));

    -- solo amigos confirmados
    if not exists (select 1 from public.friendships f where f.status = 'accepted'
                    and ((f.requester_id = yo and f.addressee_id = p_callee) or (f.requester_id = p_callee and f.addressee_id = yo))) then
        raise exception 'solo podes llamar a tus amigos' using errcode = '42501';
    end if;
    -- bloqueos en cualquiera de los dos sentidos
    if to_regclass('public.user_blocks') is not null then
        execute 'select exists (select 1 from public.user_blocks where (blocker_id = $1 and blocked_id = $2) or (blocker_id = $2 and blocked_id = $1))'
           into ocupado using yo, p_callee;
        if ocupado then raise exception 'no se puede llamar a este usuario' using errcode = '42501'; end if;
    end if;
    -- límite de intentos: 6 por minuto por persona
    if (select count(*) from public.llamadas where caller_id = yo and creada_en > now() - interval '1 minute') >= 6 then
        raise exception 'demasiados intentos, esperá un momento' using errcode = '54000';
    end if;

    perform public._llamadas_limpiar(yo, p_callee);

    -- quien llama no puede estar ya en otra llamada
    if exists (select 1 from public.llamadas where estado in ('llamando', 'aceptada') and yo in (caller_id, callee_id)) then
        raise exception 'ya estas en una llamada' using errcode = '55000';
    end if;

    ocupado := exists (select 1 from public.llamadas where estado in ('llamando', 'aceptada') and p_callee in (caller_id, callee_id));

    insert into public.llamadas (id, caller_id, callee_id, tipo, estado, sala, finalizada_en, latido_caller)
    values (id_nuevo, yo, p_callee, p_tipo, case when ocupado then 'ocupado' else 'llamando' end,
            'c-' || replace(id_nuevo::text, '-', ''), case when ocupado then now() end, now())
    returning * into fila;

    if not ocupado then
        select username into nom from public.profiles where id = yo;
        -- el insert dispara el push existente (enviar-push) con la app cerrada
        insert into public.notificaciones (para_id, de_id, de_username, tipo, titulo, cuerpo, datos, vence_en)
        values (p_callee, yo, nom, 'llamada_entrante', '📞 @' || nom || ' te está llamando', 'Abrí NikaMed para atender.',
                jsonb_build_object('llamada', fila.id, 'url', 'campus.html?llamada=' || fila.id), now() + interval '45 seconds');
    end if;
    return fila;
end $$;

-- Aceptar: solo el destinatario, solo si sigue sonando.
create or replace function public.llamada_aceptar(p_id uuid)
returns public.llamadas language plpgsql security definer set search_path = public as $$
declare f public.llamadas;
begin
    select * into f from public.llamadas where id = p_id for update;
    if not found or f.callee_id <> auth.uid() then raise exception 'llamada inexistente' using errcode = '42501'; end if;
    if f.estado <> 'llamando' or f.creada_en < now() - interval '45 seconds' then
        raise exception 'la llamada ya no esta disponible' using errcode = '55000';
    end if;
    update public.llamadas set estado = 'aceptada', atendida_en = now(), latido_callee = now()
     where id = p_id returning * into f;
    return f;
end $$;

-- Rechazar: solo el destinatario.
create or replace function public.llamada_rechazar(p_id uuid)
returns public.llamadas language plpgsql security definer set search_path = public as $$
declare f public.llamadas;
begin
    select * into f from public.llamadas where id = p_id for update;
    if not found or f.callee_id <> auth.uid() then raise exception 'llamada inexistente' using errcode = '42501'; end if;
    if f.estado <> 'llamando' then return f; end if;      -- ya definida: no se pisa
    update public.llamadas set estado = 'rechazada', finalizada_en = now(), finalizada_por = auth.uid()
     where id = p_id returning * into f;
    return f;
end $$;

-- Cancelar: solo quien llamó, solo mientras suena.
create or replace function public.llamada_cancelar(p_id uuid)
returns public.llamadas language plpgsql security definer set search_path = public as $$
declare f public.llamadas;
begin
    select * into f from public.llamadas where id = p_id for update;
    if not found or f.caller_id <> auth.uid() then raise exception 'llamada inexistente' using errcode = '42501'; end if;
    if f.estado <> 'llamando' then return f; end if;
    update public.llamadas set estado = 'cancelada', finalizada_en = now(), finalizada_por = auth.uid()
     where id = p_id returning * into f;
    return f;
end $$;

-- Finalizar: cualquiera de los dos, solo si estaba aceptada. Termina para ambos.
create or replace function public.llamada_finalizar(p_id uuid)
returns public.llamadas language plpgsql security definer set search_path = public as $$
declare f public.llamadas;
begin
    select * into f from public.llamadas where id = p_id for update;
    if not found or auth.uid() not in (f.caller_id, f.callee_id) then raise exception 'llamada inexistente' using errcode = '42501'; end if;
    if f.estado <> 'aceptada' then return f; end if;
    update public.llamadas
       set estado = 'finalizada', finalizada_en = now(), finalizada_por = auth.uid(),
           duracion_seg = greatest(0, extract(epoch from (now() - atendida_en))::int)
     where id = p_id returning * into f;
    return f;
end $$;

-- Latido: el cliente lo llama cada ~20 s mientras está en la llamada (y devuelve el estado vigente).
create or replace function public.llamada_latido(p_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare f public.llamadas;
begin
    select * into f from public.llamadas where id = p_id for update;
    if not found or auth.uid() not in (f.caller_id, f.callee_id) then return null; end if;
    if f.estado = 'aceptada' then
        update public.llamadas set latido_caller = case when auth.uid() = caller_id then now() else latido_caller end,
                                   latido_callee = case when auth.uid() = callee_id then now() else latido_callee end
         where id = p_id;
    end if;
    perform public._llamadas_limpiar(f.caller_id, f.callee_id);
    select estado into f.estado from public.llamadas where id = p_id;
    return f.estado;
end $$;

-- Autorización de entrada a la sala de medios: el cliente la consulta antes de unirse
-- (y la futura Edge Function de TURN la usa para emitir credenciales solo a participantes de una llamada vigente).
create or replace function public.llamada_puede_unirse(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.llamadas l
                    where l.id = p_id and auth.uid() in (l.caller_id, l.callee_id)
                      and (l.estado = 'aceptada' or (l.estado = 'llamando' and l.caller_id = auth.uid() and l.creada_en > now() - interval '45 seconds')));
$$;

-- Solo usuarios con sesión pueden ejecutarlas
revoke all on function public._llamadas_limpiar(uuid, uuid) from public, anon, authenticated;
do $$ declare fn text; begin
    foreach fn in array array['llamada_crear(uuid,text)', 'llamada_aceptar(uuid)', 'llamada_rechazar(uuid)', 'llamada_cancelar(uuid)',
                              'llamada_finalizar(uuid)', 'llamada_latido(uuid)', 'llamada_puede_unirse(uuid)'] loop
        execute 'revoke all on function public.' || fn || ' from public, anon';
        execute 'grant execute on function public.' || fn || ' to authenticated';
    end loop;
end $$;

-- ---------------------------------------------------------------------
-- BLOQUE 4 · Realtime (postgres_changes respeta RLS: cada uno recibe solo sus llamadas)
-- ---------------------------------------------------------------------
do $$ begin
    alter publication supabase_realtime add table public.llamadas;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- BLOQUE 5 · Limpieza periódica (opcional, requiere la extensión pg_cron; si no la tenés, _llamadas_limpiar
--            ya corre en cada latido y en cada llamada nueva, así que nada queda bloqueado para siempre)
-- ---------------------------------------------------------------------
-- select cron.schedule('llamadas-limpieza', '* * * * *', $$select public._llamadas_limpiar(null, null)$$);

-- ---------------------------------------------------------------------
-- BLOQUE 6 · (PASO SIGUIENTE, no ejecutar todavía) Señalización WebRTC privada
-- La tabla anterior ya cierra el descubrimiento de invitaciones. Falta que los eventos offer/answer/ice del canal
-- `ateneo:c-<id>` solo los pueda leer y escribir quien participa de esa llamada. Eso se hace con Realtime privado:
--   · el cliente abre el canal con { config: { private: true } }
--   · una política sobre realtime.messages que solo permita topics 'ateneo:c-<uuid sin guiones>' cuando
--     exista una fila en public.llamadas con ese id, estado aceptada/llamando y auth.uid() en (caller_id, callee_id)
-- Las salas públicas de ateneo (canal-general-N, etc.) quedan en canales no privados, sin cambios.
-- Se redacta junto con el cambio de front, porque una política mal puesta cortaría las salas actuales.
-- ---------------------------------------------------------------------

-- Verificación rápida (solo lectura):
-- select policyname, cmd, qual from pg_policies where tablename = 'llamadas';
-- select proname, prosecdef from pg_proc where proname like 'llamada%';
