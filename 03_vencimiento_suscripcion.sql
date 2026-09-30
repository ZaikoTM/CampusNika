-- =====================================================================
-- CAMPUS NIKA · Vencimiento automático de NikaMed+
-- Pegá y ejecutá cada PASO por separado en el SQL Editor de Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASO A (solo lectura) · ¿Se registró el pago y cuánto dura la suscripción?
-- ---------------------------------------------------------------------
select p.id, p.estado, p.plan, p.monto, p.mp_payment_id, p.meses_otorgados, p.procesado_en, p.creado_en
from public.pagos_mercadopago p
order by p.creado_en desc
limit 10;

-- Tu perfil: fechas de inicio y fin (reemplazá el email por el de la cuenta con la que pagaste)
select pr.id, pr.tipo_cuenta, pr.plan_activo,
       pr.fecha_inicio_suscripcion, pr.fecha_fin_suscripcion,
       pr.fecha_fin_suscripcion - pr.fecha_inicio_suscripcion as duracion,
       pr.id_transaccion_mp
from public.profiles pr
join auth.users u on u.id = pr.id
where u.email = 'TU_EMAIL_DE_LA_CUENTA@ejemplo.com';

-- ---------------------------------------------------------------------
-- PASO B (solo lectura) · ¿Ya existen las funciones de baja automática y el cron?
-- Si la primera consulta devuelve las 2 funciones y la segunda un job activo, saltá al PASO E.
-- ---------------------------------------------------------------------
select proname from pg_proc
where proname in ('fn_downgrade_si_vencido', 'fn_downgrade_suscripciones_vencidas');

select jobname, schedule, active from cron.job;   -- si falla: pg_cron no está activada (ver PASO D)

-- ---------------------------------------------------------------------
-- PASO C · Crear las funciones SOLO si el PASO B no las mostró.
-- (Si ya existían con otra lógica, no ejecutes esto: pasame cómo están.)
-- ---------------------------------------------------------------------
create or replace function public.fn_downgrade_suscripciones_vencidas()
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update profiles
     set tipo_cuenta = 'free', plan_activo = null
   where tipo_cuenta = 'premium'
     and fecha_fin_suscripcion is not null
     and fecha_fin_suscripcion < now();
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function public.fn_downgrade_si_vencido(p_user_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update profiles
     set tipo_cuenta = 'free', plan_activo = null
   where id = p_user_id
     and tipo_cuenta = 'premium'
     and fecha_fin_suscripcion is not null
     and fecha_fin_suscripcion < now();
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Solo el backend (service_role) puede ejecutarlas
revoke all on function public.fn_downgrade_suscripciones_vencidas() from public, anon, authenticated;
revoke all on function public.fn_downgrade_si_vencido(uuid) from public, anon, authenticated;
grant execute on function public.fn_downgrade_suscripciones_vencidas() to service_role;
grant execute on function public.fn_downgrade_si_vencido(uuid) to service_role;

-- ---------------------------------------------------------------------
-- PASO D · Programar la baja automática cada hora con pg_cron
-- (Dashboard > Database > Extensions > activar "pg_cron" si no lo está)
-- ---------------------------------------------------------------------
select cron.schedule('downgrade-suscripciones-vencidas', '0 * * * *',
  $$ select public.fn_downgrade_suscripciones_vencidas() $$);

-- ---------------------------------------------------------------------
-- PASO E · Probar la baja sin esperar un mes (opcional, con UNA cuenta de prueba)
-- 1) Vencerla a propósito:
--    update public.profiles set fecha_fin_suscripcion = now() - interval '1 minute'
--     where id = (select id from auth.users where email = 'CUENTA_DE_PRUEBA@ejemplo.com');
-- 2) Ejecutar el barrido y ver que devuelve 1:
--    select public.fn_downgrade_suscripciones_vencidas();
-- 3) Comprobar que quedó en 'free':
--    select tipo_cuenta, plan_activo from public.profiles
--     where id = (select id from auth.users where email = 'CUENTA_DE_PRUEBA@ejemplo.com');
-- ---------------------------------------------------------------------
