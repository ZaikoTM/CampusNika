-- =====================================================================
-- CAMPUS NIKA · Sprint 2 · Cola de corrección asíncrona (tribunal IA)
-- ---------------------------------------------------------------------
-- Modelo: el alumno entrega -> se guarda UN envío + N trabajos (1 por lote de
-- 3 preguntas) en UNA transacción -> responde 202 al instante -> workers
-- (Edge Function worker-correccion) toman trabajos con FOR UPDATE SKIP LOCKED,
-- llaman a Gemini y guardan el resultado -> el navegador consulta el estado.
--
-- Por qué tablas propias y no la extensión pgmq: mismas garantías (reparto sin
-- duplicados, visibility timeout, reintentos) pero sin depender de exponer la
-- API de Queues, y con el estado visible para la UI (lotes_hechos/total_lotes).
-- Si más adelante preferís pgmq, el worker no cambia: solo cambian estas funciones.
--
-- Ejecutar en el SQL Editor (todo junto está bien: no usa CONCURRENTLY).
-- Es seguro repetirlo. No toca ninguna tabla existente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tablas
-- ---------------------------------------------------------------------
create table if not exists public.correccion_envios (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  modulo           text not null,
  idempotency_key  text not null,
  estado           text not null default 'en_cola'
                     check (estado in ('en_cola', 'procesando', 'finalizando', 'completado', 'error')),
  total_lotes      int  not null,
  lotes_hechos     int  not null default 0,
  resultado        jsonb,
  error            text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now(),
  completado_en    timestamptz,
  unique (user_id, idempotency_key)
);

create table if not exists public.correccion_jobs (
  id              bigserial primary key,
  envio_id        uuid not null references public.correccion_envios(id) on delete cascade,
  lote_idx        int  not null,
  entradas        jsonb not null,                      -- [{ id, respuesta }]
  estado          text not null default 'pendiente'
                    check (estado in ('pendiente', 'procesando', 'hecho', 'fallido')),
  intentos        int  not null default 0,
  visible_desde   timestamptz not null default now(),  -- "visibility timeout": lease o backoff
  evaluaciones    jsonb,
  ultimo_error    text,
  actualizado_en  timestamptz not null default now(),
  unique (envio_id, lote_idx)
);

create index if not exists idx_correccion_envios_user on public.correccion_envios (user_id, creado_en desc);
create index if not exists idx_correccion_jobs_cola   on public.correccion_jobs (visible_desde, id)
  where estado in ('pendiente', 'procesando');
create index if not exists idx_correccion_jobs_envio  on public.correccion_jobs (envio_id);

-- ---------------------------------------------------------------------
-- 2) Seguridad: el alumno solo LEE sus envíos. Todo lo demás lo hacen las
--    Edge Functions con la service role (que saltea RLS).
-- ---------------------------------------------------------------------
alter table public.correccion_envios enable row level security;
alter table public.correccion_jobs   enable row level security;   -- sin políticas: nadie del cliente accede

drop policy if exists correccion_envios_select_propios on public.correccion_envios;
create policy correccion_envios_select_propios on public.correccion_envios
  for select using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 3) Funciones (solo service_role puede ejecutarlas)
-- ---------------------------------------------------------------------

-- 3.1 Crea el envío + sus trabajos de forma ATÓMICA e IDEMPOTENTE.
--     p_lotes = [ [ {id, respuesta}, ... ], ... ]
--     Devuelve { id, nuevo } | { error: 'rate_limit' }
create or replace function public.correccion_crear_envio(
  p_user uuid, p_modulo text, p_key text, p_lotes jsonb,
  p_limite int default 8, p_ventana_min int default 10
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_n  int;
begin
  -- Reintento del mismo envío (doble clic, reconexión): devuelve el existente
  select id into v_id from correccion_envios where user_id = p_user and idempotency_key = p_key;
  if v_id is not null then return jsonb_build_object('id', v_id, 'nuevo', false); end if;

  -- Límite por usuario (antes: memoria por instancia, que no se comparte entre instancias)
  select count(*) into v_n from correccion_envios
   where user_id = p_user and creado_en > now() - make_interval(mins => p_ventana_min);
  if v_n >= p_limite then return jsonb_build_object('error', 'rate_limit'); end if;

  insert into correccion_envios (user_id, modulo, idempotency_key, total_lotes)
  values (p_user, p_modulo, p_key, jsonb_array_length(p_lotes))
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_id;
  if v_id is null then   -- carrera entre dos pedidos simultáneos
    select id into v_id from correccion_envios where user_id = p_user and idempotency_key = p_key;
    return jsonb_build_object('id', v_id, 'nuevo', false);
  end if;

  insert into correccion_jobs (envio_id, lote_idx, entradas)
  select v_id, (t.ord - 1)::int, t.lote
  from jsonb_array_elements(p_lotes) with ordinality as t(lote, ord);

  return jsonb_build_object('id', v_id, 'nuevo', true);
end $$;

-- 3.2 Un worker toma hasta p_n trabajos. SKIP LOCKED = dos workers nunca toman el mismo.
--     Un trabajo 'procesando' cuyo lease venció (worker caído) vuelve a estar disponible.
create or replace function public.correccion_tomar_jobs(p_n int default 4, p_lease_seg int default 180)
returns table (id bigint, envio_id uuid, lote_idx int, intentos int, entradas jsonb, modulo text)
language plpgsql security definer set search_path = public as $$
begin
  return query
  with cand as (
    select j.id from correccion_jobs j
    where j.estado in ('pendiente', 'procesando') and j.visible_desde <= now()
    order by j.id
    limit p_n
    for update skip locked
  ), upd as (
    update correccion_jobs j
       set estado = 'procesando',
           intentos = j.intentos + 1,
           visible_desde = now() + make_interval(secs => p_lease_seg),
           actualizado_en = now()
      from cand
     where j.id = cand.id
    returning j.id, j.envio_id, j.lote_idx, j.intentos, j.entradas
  )
  select upd.id, upd.envio_id, upd.lote_idx, upd.intentos, upd.entradas, e.modulo
  from upd join correccion_envios e on e.id = upd.envio_id;
end $$;

-- 3.3 Termina un trabajo. Bloquea la fila del envío para que dos workers que terminan los
--     dos últimos trabajos a la vez no se "crucen" y nadie cierre el envío.
--     Devuelve cuántos trabajos siguen pendientes (0 => hay que cerrar el envío).
create or replace function public.correccion_completar_job(
  p_job bigint, p_evals jsonb, p_fallido boolean default false, p_error text default null
) returns int
language plpgsql security definer set search_path = public as $$
declare
  v_envio uuid;
  v_pend  int;
begin
  select envio_id into v_envio from correccion_jobs where id = p_job;
  if v_envio is null then return 0; end if;
  perform 1 from correccion_envios where id = v_envio for update;

  update correccion_jobs
     set estado = case when p_fallido then 'fallido' else 'hecho' end,
         evaluaciones = p_evals, ultimo_error = p_error, actualizado_en = now()
   where id = p_job;

  update correccion_envios e
     set lotes_hechos = (select count(*) from correccion_jobs where envio_id = v_envio and estado in ('hecho', 'fallido')),
         estado = case when e.estado = 'en_cola' then 'procesando' else e.estado end,
         actualizado_en = now()
   where e.id = v_envio;

  select count(*) into v_pend from correccion_jobs where envio_id = v_envio and estado in ('pendiente', 'procesando');
  return v_pend;
end $$;

-- 3.4 Devuelve un trabajo a la cola para reintentarlo después de p_espera_seg (backoff).
create or replace function public.correccion_reintentar_job(p_job bigint, p_espera_seg int, p_error text default null)
returns void
language sql security definer set search_path = public as $$
  update correccion_jobs
     set estado = 'pendiente', visible_desde = now() + make_interval(secs => p_espera_seg),
         ultimo_error = p_error, actualizado_en = now()
   where id = p_job;
$$;

-- 3.5 Reclama el cierre del envío (solo UN worker lo consigue).
create or replace function public.correccion_reclamar_cierre(p_envio uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  update correccion_envios set estado = 'finalizando', actualizado_en = now()
   where id = p_envio and estado in ('en_cola', 'procesando')
  returning id into v_id;
  return v_id is not null;
end $$;

-- 3.6 Guarda el resultado final (o el error) del envío.
create or replace function public.correccion_guardar_resultado(p_envio uuid, p_resultado jsonb, p_error text default null)
returns void
language sql security definer set search_path = public as $$
  update correccion_envios
     set estado = case when p_error is null then 'completado' else 'error' end,
         resultado = p_resultado, error = p_error,
         completado_en = case when p_error is null then now() else null end,
         actualizado_en = now()
   where id = p_envio;
$$;

-- 3.7 Barrido de rescate: envíos que quedaron sin cerrar (worker caído justo al final).
create or replace function public.correccion_envios_sin_cerrar()
returns table (id uuid)
language plpgsql security definer set search_path = public as $$
begin
  -- 'finalizando' hace más de 5 min = el worker que cerraba murió: se reabre
  update correccion_envios set estado = 'procesando', actualizado_en = now()
   where estado = 'finalizando' and actualizado_en < now() - interval '5 minutes';

  return query
  select e.id from correccion_envios e
  where e.estado in ('en_cola', 'procesando')
    and not exists (select 1 from correccion_jobs j where j.envio_id = e.id and j.estado in ('pendiente', 'procesando'))
    and exists (select 1 from correccion_jobs j where j.envio_id = e.id);
end $$;

-- 3.8 ¿Queda trabajo listo para tomar? (el worker lo usa para auto-reinvocarse)
create or replace function public.correccion_hay_trabajo() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from correccion_jobs where estado in ('pendiente', 'procesando') and visible_desde <= now());
$$;

-- Permisos: cerradas para anon/authenticated, abiertas solo para service_role
do $$
declare f text;
begin
  foreach f in array array[
    'correccion_crear_envio(uuid,text,text,jsonb,int,int)',
    'correccion_tomar_jobs(int,int)',
    'correccion_completar_job(bigint,jsonb,boolean,text)',
    'correccion_reintentar_job(bigint,int,text)',
    'correccion_reclamar_cierre(uuid)',
    'correccion_guardar_resultado(uuid,jsonb,text)',
    'correccion_envios_sin_cerrar()',
    'correccion_hay_trabajo()'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 4) RED DE SEGURIDAD (recomendado, pero se puede hacer después de probar):
--    cada 30 s despierta al worker SOLO si hay trabajo pendiente o envíos sin cerrar.
--    Cubre workers caídos y trabajos en backoff. Requiere las extensiones pg_cron y pg_net
--    (Dashboard > Database > Extensions) y guardar el secreto en Vault:
--
--    select vault.create_secret('EL_MISMO_VALOR_QUE_WORKER_SECRET', 'worker_secret');
--
--    select cron.schedule('correccion-worker', '30 seconds', $cron$
--      select net.http_post(
--        url     := 'https://pswjmouuyaxueaqqglko.supabase.co/functions/v1/worker-correccion',
--        headers := jsonb_build_object('Content-Type', 'application/json',
--                     'x-worker-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'worker_secret')),
--        body    := '{}'::jsonb)
--      where public.correccion_hay_trabajo()
--         or exists (select 1 from public.correccion_envios where estado in ('en_cola', 'procesando', 'finalizando')
--                     and actualizado_en < now() - interval '2 minutes');
--    $cron$);
--
--    Limpieza (los envíos guardan las respuestas del alumno): borrar a los 30 días.
--    select cron.schedule('correccion-limpieza', '0 4 * * *',
--      $$ delete from public.correccion_envios where creado_en < now() - interval '30 days' $$);
-- ---------------------------------------------------------------------
