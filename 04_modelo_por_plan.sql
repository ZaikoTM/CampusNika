-- =====================================================================
-- CAMPUS NIKA · Sprint 3 · Modelo de IA por plan + cupo de Gemini por modelo
-- ---------------------------------------------------------------------
-- 1) Cada envío guarda con qué modelo se corrige (NikaMed+/admin vs. gratuitos).
-- 2) Tabla + función gemini_reservar: los workers "reservan" pedidos por minuto y por día de cada
--    modelo antes de llamar a Gemini, así nunca se pasan del tope (se esperan, no fallan con 429).
-- 3) El worker puede devolver un trabajo a la cola SIN gastarle un intento cuando solo esperaba cupo.
--
-- Ejecutar DESPUÉS de 02_cola_correccion.sql y ANTES de desplegar las funciones nuevas.
-- Se puede pegar completo de una vez. Es seguro repetirlo. No toca datos existentes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Columna del modelo en cada envío
-- ---------------------------------------------------------------------
alter table public.correccion_envios add column if not exists modelo text;

-- ---------------------------------------------------------------------
-- 2) Cupo por modelo (ventanas de 1 minuto y de 1 día)
-- ---------------------------------------------------------------------
create table if not exists public.gemini_cupo (
  modelo  text        not null,
  tipo    text        not null check (tipo in ('min', 'dia')),
  inicio  timestamptz not null,
  usadas  int         not null default 0,
  primary key (modelo, tipo, inicio)
);
alter table public.gemini_cupo enable row level security;   -- sin políticas: solo service_role

-- Devuelve 0 = reservado · >0 = segundos a esperar (tope por minuto) · -1 = tope diario agotado.
-- El día se cuenta en hora del Pacífico, que es cuando Google reinicia el cupo diario.
create or replace function public.gemini_reservar(p_modelo text, p_rpm int, p_rpd int default null, p_n int default 1)
returns int
language plpgsql security definer set search_path = public as $$
declare
  v_min timestamptz := date_trunc('minute', now());
  v_dia timestamptz := date_trunc('day', now() at time zone 'America/Los_Angeles') at time zone 'America/Los_Angeles';
begin
  if random() < 0.01 then delete from gemini_cupo where inicio < now() - interval '2 days'; end if;

  insert into gemini_cupo (modelo, tipo, inicio) values (p_modelo, 'min', v_min), (p_modelo, 'dia', v_dia)
  on conflict do nothing;

  if p_rpd is not null then
    update gemini_cupo set usadas = usadas + p_n
     where modelo = p_modelo and tipo = 'dia' and inicio = v_dia and usadas + p_n <= p_rpd;
    if not found then return -1; end if;
  end if;

  update gemini_cupo set usadas = usadas + p_n
   where modelo = p_modelo and tipo = 'min' and inicio = v_min and usadas + p_n <= p_rpm;
  if found then return 0; end if;

  -- sin cupo este minuto: se devuelve lo reservado del día y se informa cuánto esperar
  if p_rpd is not null then
    update gemini_cupo set usadas = greatest(0, usadas - p_n) where modelo = p_modelo and tipo = 'dia' and inicio = v_dia;
  end if;
  return greatest(1, ceil(extract(epoch from (v_min + interval '1 minute' - now())))::int);
end $$;

-- ---------------------------------------------------------------------
-- 3) Funciones de la cola con soporte de modelo
--    (se borran las versiones anteriores porque cambia su firma / tipo de retorno)
-- ---------------------------------------------------------------------
drop function if exists public.correccion_crear_envio(uuid, text, text, jsonb, int, int);
drop function if exists public.correccion_tomar_jobs(int, int);
drop function if exists public.correccion_reintentar_job(bigint, int, text);

create or replace function public.correccion_crear_envio(
  p_user uuid, p_modulo text, p_key text, p_lotes jsonb,
  p_modelo text default null, p_limite int default 8, p_ventana_min int default 10
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_n  int;
begin
  select id into v_id from correccion_envios where user_id = p_user and idempotency_key = p_key;
  if v_id is not null then return jsonb_build_object('id', v_id, 'nuevo', false); end if;

  select count(*) into v_n from correccion_envios
   where user_id = p_user and creado_en > now() - make_interval(mins => p_ventana_min);
  if v_n >= p_limite then return jsonb_build_object('error', 'rate_limit'); end if;

  insert into correccion_envios (user_id, modulo, idempotency_key, total_lotes, modelo)
  values (p_user, p_modulo, p_key, jsonb_array_length(p_lotes), p_modelo)
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_id;
  if v_id is null then
    select id into v_id from correccion_envios where user_id = p_user and idempotency_key = p_key;
    return jsonb_build_object('id', v_id, 'nuevo', false);
  end if;

  insert into correccion_jobs (envio_id, lote_idx, entradas)
  select v_id, (t.ord - 1)::int, t.lote
  from jsonb_array_elements(p_lotes) with ordinality as t(lote, ord);

  return jsonb_build_object('id', v_id, 'nuevo', true);
end $$;

create or replace function public.correccion_tomar_jobs(p_n int default 4, p_lease_seg int default 180)
returns table (id bigint, envio_id uuid, lote_idx int, intentos int, entradas jsonb, modulo text, modelo text)
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
  select upd.id, upd.envio_id, upd.lote_idx, upd.intentos, upd.entradas, e.modulo, e.modelo
  from upd join correccion_envios e on e.id = upd.envio_id;
end $$;

-- p_sin_gastar_intento = true: el trabajo solo esperaba cupo de Gemini, no falló; no consume un intento.
create or replace function public.correccion_reintentar_job(
  p_job bigint, p_espera_seg int, p_error text default null, p_sin_gastar_intento boolean default false
) returns void
language sql security definer set search_path = public as $$
  update correccion_jobs
     set estado = 'pendiente',
         visible_desde = now() + make_interval(secs => p_espera_seg),
         intentos = case when p_sin_gastar_intento then greatest(0, intentos - 1) else intentos end,
         ultimo_error = p_error, actualizado_en = now()
   where id = p_job;
$$;

-- Segundos hasta que el próximo trabajo pendiente esté disponible (null si no hay ninguno).
-- El worker lo usa para volver a invocarse solo cuando corresponde.
create or replace function public.correccion_segundos_hasta_proximo() returns int
language sql security definer set search_path = public as $$
  select greatest(0, ceil(extract(epoch from (min(visible_desde) - now())))::int)
  from correccion_jobs where estado in ('pendiente', 'procesando');
$$;

-- ---------------------------------------------------------------------
-- 4) Permisos: solo service_role
-- ---------------------------------------------------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'gemini_reservar(text,int,int,int)',
    'correccion_crear_envio(uuid,text,text,jsonb,text,int,int)',
    'correccion_tomar_jobs(int,int)',
    'correccion_reintentar_job(bigint,int,text,boolean)',
    'correccion_segundos_hasta_proximo()'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;
