-- ============================================================
-- CAMPUS NIKA — Integridad de exámenes (anti-cheat + corrección en servidor)
-- Ejecutar UNA vez en Supabase → SQL Editor. Es idempotente.
-- Requiere: 001_auth_profiles.sql, 002_rls_admin_tables.sql (is_admin) y migracion_fase_A3_bancos_json.sql.
--
-- Qué hace:
--   1. examenes_intentos      → un intento por examen (started_at en el servidor, estado, modo estricto, tiempos).
--   2. examen_incidencias     → auditoría (cambio de pestaña, copia bloqueada, tiempos sospechosos…).
--   3. examen_preguntas / examen_claves → banco normalizado. Las CLAVES (correcta + justificación) viven en
--      una tabla que ningún cliente puede leer: solo las funciones security definer la consultan.
--   4. RPC examen_iniciar / examen_abrir_intento / examen_entregar → aleatoriza, cronometra y corrige en el servidor.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Umbral de incidencias a partir del cual un intento queda "en_revision" (editable acá)
-- ------------------------------------------------------------
create or replace function public.examen_umbral_incidencias() returns int
language sql immutable as $$ select 5 $$;

-- ------------------------------------------------------------
-- 1. Intentos
-- ------------------------------------------------------------
create table if not exists public.examenes_intentos (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references auth.users(id) on delete cascade,
    modulo             text not null,
    modo               text,
    estricto           boolean not null default false,          -- "Bloquear retroceso de preguntas"
    origen             text not null default 'legado' check (origen in ('seguro', 'legado')),
    estado             text not null default 'en_curso'
                       check (estado in ('en_curso', 'entregado', 'en_revision', 'expirado', 'abandonado')),
    total_preguntas    int,
    tiempo_limite_seg  int,
    started_at         timestamptz not null default now(),
    finished_at        timestamptz,
    preguntas          jsonb,       -- (seguro) orden entregado: [{pregunta_id, unidad, opciones:[opcion_id…]}]
    respuestas         jsonb,       -- respuestas + timestamp_inicio / timestamp_respuesta por ítem
    aciertos           int,
    puntaje            numeric,
    incidencias_count  int not null default 0,
    motivos_revision   text[] not null default '{}'
);
create index if not exists examenes_intentos_user_idx on public.examenes_intentos (user_id, started_at desc);
create index if not exists examenes_intentos_estado_idx on public.examenes_intentos (estado) where estado = 'en_revision';

alter table public.examenes_intentos enable row level security;
drop policy if exists "intentos_select_own" on public.examenes_intentos;
create policy "intentos_select_own" on public.examenes_intentos for select
    using (user_id = auth.uid() or public.is_admin());
-- Sin policies de insert/update/delete: solo las funciones security definer los modifican.

-- ------------------------------------------------------------
-- 2. Incidencias (auditoría)
-- ------------------------------------------------------------
create table if not exists public.examen_incidencias (
    id                 uuid primary key default gen_random_uuid(),
    examen_intento_id  uuid references public.examenes_intentos(id) on delete cascade,
    user_id            uuid references auth.users(id),
    tipo_incidencia    text not null,     -- 'cambio_pestana', 'foco_perdido', 'copia_bloqueada', 'tiempo_sospechoso', …
    detalles           jsonb default '{}'::jsonb,
    created_at         timestamptz default now()
);
create index if not exists examen_incidencias_intento_idx on public.examen_incidencias (examen_intento_id);

alter table public.examen_incidencias enable row level security;
drop policy if exists "incidencias_select" on public.examen_incidencias;
create policy "incidencias_select" on public.examen_incidencias for select
    using (user_id = auth.uid() or public.is_admin());
-- El alumno solo puede registrar incidencias de SU intento y mientras está en curso
drop policy if exists "incidencias_insert_own" on public.examen_incidencias;
create policy "incidencias_insert_own" on public.examen_incidencias for insert
    with check (
        user_id = auth.uid()
        and exists (select 1 from public.examenes_intentos i
                    where i.id = examen_intento_id and i.user_id = auth.uid() and i.estado = 'en_curso')
    );

-- Mantiene el contador del intento
create or replace function public.examen_incidencia_contar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
    update public.examenes_intentos set incidencias_count = incidencias_count + 1 where id = new.examen_intento_id;
    return new;
end $$;
drop trigger if exists trg_examen_incidencia_contar on public.examen_incidencias;
create trigger trg_examen_incidencia_contar after insert on public.examen_incidencias
    for each row execute function public.examen_incidencia_contar();

-- Vista para revisar (solo admins ven filas por RLS de las tablas base)
create or replace view public.v_examenes_en_revision with (security_invoker = true) as
    select i.id, i.user_id, p.username, p.fullname, i.modulo, i.modo, i.estricto, i.origen, i.started_at, i.finished_at,
           i.aciertos, i.total_preguntas, i.incidencias_count, i.motivos_revision
    from public.examenes_intentos i left join public.profiles p on p.id = i.user_id
    where i.estado = 'en_revision' order by i.finished_at desc nulls last;

-- ------------------------------------------------------------
-- 3. Banco normalizado: enunciado/opciones (sin clave) y claves aparte
-- ------------------------------------------------------------
create table if not exists public.examen_preguntas (
    id          uuid primary key default gen_random_uuid(),
    modulo      text not null,
    unidad      text not null,                 -- '01' (Cirugía) o 'UP3_sec_2' (Ginecología): igual que bancos_json.up_id
    enunciado   text not null,
    opciones    jsonb not null,                -- [{"id":"a","texto":"…"}, …]  ← SIN indicar cuál es correcta
    activa      boolean not null default true,
    origen_ref  text unique                    -- 'modulo:up_id:indice' → import idempotente
);
create index if not exists examen_preguntas_mod_uni_idx on public.examen_preguntas (modulo, unidad) where activa;

create table if not exists public.examen_claves (
    pregunta_id          uuid primary key references public.examen_preguntas(id) on delete cascade,
    opcion_correcta_id   text not null,
    justificacion        text
);

-- RLS activada y SIN policies para alumnos: ni el enunciado ni la clave se leen por la API directa
alter table public.examen_preguntas enable row level security;
alter table public.examen_claves enable row level security;
drop policy if exists "preguntas_admin" on public.examen_preguntas;
create policy "preguntas_admin" on public.examen_preguntas for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "claves_admin" on public.examen_claves;
create policy "claves_admin" on public.examen_claves for all using (public.is_admin()) with check (public.is_admin());

-- Importa/actualiza el banco desde public.bancos_json (solo admin). Se puede correr cuantas veces haga falta.
--   select public.examen_importar_bancos();            -- todos los módulos
--   select public.examen_importar_bancos('cirugia');
create or replace function public.examen_importar_bancos(p_modulo text default null) returns int
language plpgsql security definer set search_path = public as $$
declare
    b record; q jsonb; idx int; n int := 0;
    v_enun text; v_opts jsonb; v_corr text; v_just text; v_ref text; v_pid uuid; v_arr jsonb;
    letras text[] := array['a','b','c','d','e','f'];
begin
    if not public.is_admin() then raise exception 'Solo administradores'; end if;
    for b in select modulo, up_id, data from public.bancos_json where p_modulo is null or modulo = p_modulo loop
        v_arr := case when jsonb_typeof(b.data) = 'array' then b.data else coalesce(b.data->'preguntas', b.data->'questions', '[]'::jsonb) end;
        idx := 0;
        for q in select * from jsonb_array_elements(v_arr) loop
            idx := idx + 1;
            v_enun := coalesce(q->>'q', q->>'enunciado', q->>'pregunta', q->>'texto');
            v_corr := lower(trim(coalesce(q->>'correct', q->>'correcta', q->>'respuesta_correcta', q->>'respuestaCorrecta', q->>'respuesta', q->>'answer', '')));
            v_just := coalesce(q->>'verificacion', q->>'feedback', q->>'justificacion', q->>'justificación', q->>'explicacion');
            -- opciones: objeto {a,b,c,d} o array
            v_opts := coalesce(q->'options', q->'opciones', q->'alternativas', q->'respuestas', q->'choices');
            continue when v_enun is null or v_opts is null;
            if jsonb_typeof(v_opts) = 'array' then
                select jsonb_agg(jsonb_build_object('id', letras[o.i::int], 'texto',
                       case when jsonb_typeof(o.v) = 'object' then coalesce(o.v->>'texto', o.v::text) else trim(both '"' from o.v::text) end) order by o.i)
                  into v_opts from jsonb_array_elements(v_opts) with ordinality as o(v, i) where o.i <= 6;
            else
                select jsonb_agg(jsonb_build_object('id', k, 'texto', v_opts->>k) order by k)
                  into v_opts from jsonb_object_keys(v_opts) as k;
            end if;
            -- la correcta puede venir como texto de la opción en vez de letra
            if v_corr <> '' and v_corr not in ('a','b','c','d','e','f') then
                select o->>'id' into v_corr from jsonb_array_elements(v_opts) o where lower(trim(o->>'texto')) = v_corr limit 1;
            end if;
            continue when v_corr is null or v_corr = '';
            v_ref := b.modulo || ':' || b.up_id || ':' || idx;
            insert into public.examen_preguntas (modulo, unidad, enunciado, opciones, origen_ref)
                values (b.modulo, b.up_id, v_enun, v_opts, v_ref)
                on conflict (origen_ref) do update set enunciado = excluded.enunciado, opciones = excluded.opciones, unidad = excluded.unidad
                returning id into v_pid;
            insert into public.examen_claves (pregunta_id, opcion_correcta_id, justificacion)
                values (v_pid, v_corr, v_just)
                on conflict (pregunta_id) do update set opcion_correcta_id = excluded.opcion_correcta_id, justificacion = excluded.justificacion;
            n := n + 1;
        end loop;
    end loop;
    return n;
end $$;
revoke all on function public.examen_importar_bancos(text) from public;
grant execute on function public.examen_importar_bancos(text) to authenticated;

-- ------------------------------------------------------------
-- 4a. Iniciar intento SEGURO: elige preguntas al azar, mezcla las opciones POR INTENTO y NO envía la clave
-- ------------------------------------------------------------
create or replace function public.examen_iniciar(
    p_modulo text, p_unidades text[] default null, p_cantidad int default 10,
    p_modo text default null, p_estricto boolean default false, p_limite_seg int default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
    v_uid uuid := auth.uid(); v_id uuid; v_preg jsonb; v_entrega jsonb; v_started timestamptz;
begin
    if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
    p_cantidad := greatest(1, least(coalesce(p_cantidad, 10), 400));
    p_limite_seg := case when p_limite_seg is null then null else greatest(60, least(p_limite_seg, 4 * 3600)) end;

    -- Preguntas al azar; cada una con sus opciones en orden aleatorio (distinto en cada intento)
    with elegidas as (
        select p.id, p.unidad, p.enunciado, p.opciones
        from public.examen_preguntas p
        where p.activa and p.modulo = p_modulo and (p_unidades is null or p.unidad = any (p_unidades))
        order by random() limit p_cantidad
    ), mezcladas as (
        select e.id, e.unidad, e.enunciado,
               (select jsonb_agg(o order by random()) from jsonb_array_elements(e.opciones) o) as ops
        from elegidas e
    )
    select jsonb_agg(jsonb_build_object('pregunta_id', id, 'unidad', unidad, 'enunciado', enunciado, 'ops', ops)) into v_preg from mezcladas;

    if v_preg is null then return jsonb_build_object('disponible', false); end if;

    -- Lo que se guarda en el intento (orden entregado) y lo que se manda al cliente (sin claves)
    select jsonb_agg(jsonb_build_object('pregunta_id', x->>'pregunta_id', 'unidad', x->>'unidad',
                                        'opciones', (select jsonb_agg(o->>'id') from jsonb_array_elements(x->'ops') o)))
      into v_entrega from jsonb_array_elements(v_preg) x;

    insert into public.examenes_intentos (user_id, modulo, modo, estricto, origen, total_preguntas, tiempo_limite_seg, preguntas)
        values (v_uid, p_modulo, p_modo, coalesce(p_estricto, false), 'seguro', jsonb_array_length(v_preg), p_limite_seg, v_entrega)
        returning id, started_at into v_id, v_started;

    return jsonb_build_object(
        'disponible', true, 'intento_id', v_id, 'started_at', v_started, 'server_now', now(),
        'estricto', coalesce(p_estricto, false), 'tiempo_limite_seg', p_limite_seg,
        'preguntas', (select jsonb_agg(jsonb_build_object(
            'pregunta_id', x->>'pregunta_id', 'unidad', x->>'unidad', 'enunciado', x->>'enunciado',
            'opciones', (select jsonb_agg(jsonb_build_object('opcion_id', o->>'id', 'texto', o->>'texto')) from jsonb_array_elements(x->'ops') o)))
            from jsonb_array_elements(v_preg) x)
    );
end $$;

-- ------------------------------------------------------------
-- 4b. Abrir intento LEGADO (bancos que aún se leen de JSON): solo registra started_at, modo y tope de tiempo
-- ------------------------------------------------------------
create or replace function public.examen_abrir_intento(
    p_modulo text, p_modo text default null, p_estricto boolean default false,
    p_total int default null, p_limite_seg int default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_started timestamptz;
begin
    if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
    -- Un intento anterior sin cerrar de este usuario/módulo pasa a "abandonado"
    update public.examenes_intentos set estado = 'abandonado', finished_at = now()
        where user_id = v_uid and estado = 'en_curso' and started_at < now() - interval '6 hours';
    insert into public.examenes_intentos (user_id, modulo, modo, estricto, origen, total_preguntas, tiempo_limite_seg)
        values (v_uid, p_modulo, p_modo, coalesce(p_estricto, false), 'legado', p_total,
                case when p_limite_seg is null then null else greatest(60, least(p_limite_seg, 4 * 3600)) end)
        returning id, started_at into v_id, v_started;
    return jsonb_build_object('intento_id', v_id, 'started_at', v_started, 'server_now', now());
end $$;

-- ------------------------------------------------------------
-- 4c. Entregar: valida tiempo, revisa tiempos por ítem, corrige (si es seguro) y fija el estado final
--   p_respuestas: [{pregunta_id, opcion_id, ms_inicio, ms_respuesta, largo}]  (ms desde el inicio del intento)
--   estados: entregado | en_revision (incidencias > umbral, tiempo excedido, tiempos sospechosos o entrega forzada)
-- ------------------------------------------------------------
create or replace function public.examen_entregar(
    p_intento uuid, p_respuestas jsonb default '[]'::jsonb, p_forzar_revision boolean default false,
    p_aciertos_cliente int default null, p_puntaje_cliente numeric default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
    v_uid uuid := auth.uid(); i public.examenes_intentos%rowtype;
    v_elapsed numeric; v_margen constant numeric := 30;            -- segundos de tolerancia por latencia de red
    v_motivos text[] := '{}'; v_estado text; v_aciertos int := 0; v_total int;
    v_detalle jsonb := '[]'::jsonb; v_resp_out jsonb := '[]'::jsonb;
    r jsonb; pq jsonb; v_rapidas int := 0; v_con_tiempo int := 0; v_ms_i numeric; v_ms_r numeric; v_largo int;
    v_correcta text; v_just text; v_elegida text; v_opts jsonb; v_valida boolean; v_sospecha boolean;
begin
    select * into i from public.examenes_intentos where id = p_intento for update;
    if not found or i.user_id <> v_uid then raise exception 'Intento inexistente'; end if;
    if i.estado <> 'en_curso' then
        return jsonb_build_object('estado', i.estado, 'yaEntregado', true, 'aciertos', i.aciertos, 'total', i.total_preguntas, 'motivos', to_jsonb(i.motivos_revision));
    end if;

    v_elapsed := extract(epoch from (now() - i.started_at));
    if i.tiempo_limite_seg is not null and v_elapsed > i.tiempo_limite_seg + v_margen then
        v_motivos := v_motivos || 'tiempo_excedido';
    end if;

    -- Tiempos por ítem + corrección
    for r in select * from jsonb_array_elements(coalesce(p_respuestas, '[]'::jsonb)) loop
        v_ms_i := nullif(r->>'ms_inicio', '')::numeric; v_ms_r := nullif(r->>'ms_respuesta', '')::numeric;
        v_largo := coalesce(nullif(r->>'largo', '')::int, 0);
        v_sospecha := false;
        if i.origen = 'seguro' then
            select length(coalesce(p.enunciado, '')) into v_largo from public.examen_preguntas p where p.id = nullif(r->>'pregunta_id', '')::uuid;
        end if;
        if v_ms_i is not null and v_ms_r is not null then
            v_con_tiempo := v_con_tiempo + 1;
            -- una respuesta en menos de 2 s sobre un enunciado largo (>200 caracteres) es sospechosa
            if v_ms_r - v_ms_i < 2000 and coalesce(v_largo, 0) > 200 then v_rapidas := v_rapidas + 1; v_sospecha := true; end if;
            -- ningún ítem puede terminar después de "ahora" (con margen)
            if v_ms_r > (v_elapsed + v_margen) * 1000 then v_motivos := array_append(v_motivos, 'tiempos_incoherentes'); end if;
        end if;
        v_resp_out := v_resp_out || jsonb_build_object(
            'pregunta_id', r->>'pregunta_id', 'opcion_id', r->>'opcion_id',
            'timestamp_inicio', case when v_ms_i is null then null else i.started_at + (v_ms_i || ' milliseconds')::interval end,
            'timestamp_respuesta', case when v_ms_r is null then null else i.started_at + (v_ms_r || ' milliseconds')::interval end,
            'sospechosa', v_sospecha);
    end loop;

    if v_rapidas >= 3 and v_rapidas >= greatest(3, ceil(v_con_tiempo * 0.3)) then
        v_motivos := array_append(v_motivos, 'tiempos_sospechosos');
        insert into public.examen_incidencias (examen_intento_id, user_id, tipo_incidencia, detalles)
            values (i.id, v_uid, 'tiempo_sospechoso', jsonb_build_object('respuestas_rapidas', v_rapidas, 'con_tiempo', v_con_tiempo));
    end if;

    if i.origen = 'seguro' then
        v_total := i.total_preguntas;
        for pq in select * from jsonb_array_elements(i.preguntas) loop
            select c.opcion_correcta_id, c.justificacion into v_correcta, v_just
                from public.examen_claves c where c.pregunta_id = (pq->>'pregunta_id')::uuid;
            select x->>'opcion_id' into v_elegida from jsonb_array_elements(coalesce(p_respuestas, '[]'::jsonb)) x
                where x->>'pregunta_id' = pq->>'pregunta_id' limit 1;
            -- la opción elegida tiene que ser una de las que se entregaron en ESTE intento
            v_valida := v_elegida is not null and (pq->'opciones') ? v_elegida;
            if not v_valida then v_elegida := null; end if;
            if v_elegida is not null and v_elegida = v_correcta then v_aciertos := v_aciertos + 1; end if;
            v_detalle := v_detalle || jsonb_build_object('pregunta_id', pq->>'pregunta_id', 'elegida', v_elegida,
                                                         'correcta', v_correcta, 'justificacion', v_just);
        end loop;
    else
        -- Banco legado: el servidor no conoce las claves; se guarda lo que informa el cliente (no es de confianza)
        v_total := i.total_preguntas; v_aciertos := coalesce(p_aciertos_cliente, 0);
    end if;

    if i.incidencias_count > public.examen_umbral_incidencias() then v_motivos := array_append(v_motivos, 'incidencias_sobre_umbral'); end if;
    if p_forzar_revision then v_motivos := array_append(v_motivos, 'entrega_forzada_por_infracciones'); end if;
    v_estado := case when array_length(v_motivos, 1) is null then 'entregado' else 'en_revision' end;

    update public.examenes_intentos set
        estado = v_estado, finished_at = now(), respuestas = v_resp_out, aciertos = v_aciertos,
        puntaje = case when i.origen = 'seguro' then case when v_total > 0 then round(v_aciertos::numeric * 100 / v_total, 2) end else p_puntaje_cliente end,
        motivos_revision = (select coalesce(array_agg(distinct m), '{}') from unnest(v_motivos) m)
    where id = i.id;

    return jsonb_build_object('estado', v_estado, 'aciertos', v_aciertos, 'total', v_total, 'motivos', to_jsonb(v_motivos),
                              'incidencias', i.incidencias_count, 'detalle', case when i.origen = 'seguro' then v_detalle else null end);
end $$;

revoke all on function public.examen_iniciar(text, text[], int, text, boolean, int) from public;
revoke all on function public.examen_abrir_intento(text, text, boolean, int, int) from public;
revoke all on function public.examen_entregar(uuid, jsonb, boolean, int, numeric) from public;
grant execute on function public.examen_iniciar(text, text[], int, text, boolean, int) to authenticated;
grant execute on function public.examen_abrir_intento(text, text, boolean, int, int) to authenticated;
grant execute on function public.examen_entregar(uuid, jsonb, boolean, int, numeric) to authenticated;
