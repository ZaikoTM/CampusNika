-- =====================================================================
-- CAMPUS NIKA · Rango NikaMed+ visible para todos + activación por user_id
-- Ejecutá cada PASO por separado en el SQL Editor de Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASO 1 · Rango visible para cualquier usuario autenticado
-- No se abre SELECT sobre profiles (expondría email, fechas e id de
-- transacción de todos). Se amplía la vista profiles_public, que ya es
-- la lectura "pública" y no tiene email. Solo agrega 3 columnas al final:
--   tipo_cuenta, plan_activo y es_nikamed_plus (premium/vip NO vencido).
-- Las fechas de suscripción y el id de pago siguen privados.
-- ---------------------------------------------------------------------
create or replace view public.profiles_public as
    select id, username, fullname, avatar, role,
           tipo_cuenta,
           plan_activo,
           (tipo_cuenta::text in ('premium', 'vip')
            and (fecha_fin_suscripcion is null or fecha_fin_suscripcion > now())) as es_nikamed_plus
    from public.profiles;

grant select on public.profiles_public to authenticated, anon;

-- ---------------------------------------------------------------------
-- PASO 2 · El admin puede leer las filas completas de profiles
-- (el modal "Usuarios Registrados" muestra plan y vencimiento).
-- Policy ADITIVA: no toca las existentes. is_admin() viene de 002.
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
    on public.profiles for select
    to authenticated
    using (public.is_admin());

-- ---------------------------------------------------------------------
-- PASO 3 (opcional) · Ver cómo está definido hoy el RPC de acreditación
-- extender_nikamed_plus no está en el repo. Mirá qué escribe antes de
-- tocarlo; si ya setea tipo_cuenta='premium', plan_activo y fechas, saltá el PASO 4.
-- ---------------------------------------------------------------------
select pg_get_functiondef(oid) from pg_proc where proname = 'extender_nikamed_plus';

-- ---------------------------------------------------------------------
-- PASO 4 · NO EJECUTAR: la función ya existe en producción y plan_activo es un enum (mensual|semestral|anual).
-- Acredita por user_id (el external_reference del pago), nunca por email.
-- Suma días a partir del vencimiento vigente (o desde ahora si no hay).
-- Ejecutalo SOLO (seleccioná estas líneas y Run): el editor corta las funciones
-- si pegás todo el archivo junto. Si falla con "cannot change return type",
-- pasame el resultado del PASO 3.
-- ---------------------------------------------------------------------
create or replace function public.extender_nikamed_plus(p_user_id uuid, p_dias integer)
returns void
language sql security definer set search_path = public as $$
    update profiles
       set fecha_inicio_suscripcion = case when tipo_cuenta = 'premium' and fecha_fin_suscripcion > now()
                                           then fecha_inicio_suscripcion else now() end,
           fecha_fin_suscripcion = (case when tipo_cuenta = 'premium' and fecha_fin_suscripcion > now()
                                         then fecha_fin_suscripcion else now() end)
                                   + make_interval(days => p_dias),
           tipo_cuenta = 'premium',
           plan_activo = 'NikaMed+'
     where id = p_user_id
$$;

revoke all on function public.extender_nikamed_plus(uuid, integer) from public, anon, authenticated;
grant execute on function public.extender_nikamed_plus(uuid, integer) to service_role;

-- ---------------------------------------------------------------------
-- DIAGNÓSTICO · Victoria Lescano (solo lectura)
-- ---------------------------------------------------------------------
-- A) Su perfil. Se busca por username Y por email del campus Y por email de pago,
--    porque pudo registrarse con un email y pagar con otro.
select pr.id, pr.username, pr.fullname, u.email as email_campus,
       pr.tipo_cuenta, pr.plan_activo,
       pr.fecha_inicio_suscripcion, pr.fecha_fin_suscripcion, pr.id_transaccion_mp
from public.profiles pr
join auth.users u on u.id = pr.id
where pr.username = 'vlescano1998'
   or lower(u.email) in ('vlescano1998@gmail.com')
   or pr.fullname ilike '%lescano%';

-- B) Pagos que el webhook procesó para ella (por user_id, no por email)
select pp.*
from public.pagos_procesados pp
where pp.user_id in (select id from public.profiles where username = 'vlescano1998')
order by 1 desc;

-- C) Últimos pagos registrados (por si el pago llegó con otro user_id o sin él)
select * from public.pagos_procesados order by 1 desc limit 15;

-- D) Tabla del backend Python (solo si usás backend_pagos)
select estado, plan, monto, mp_payment_id, mp_external_reference, meses_otorgados, procesado_en, creado_en
from public.pagos_mercadopago order by creado_en desc limit 15;

-- Interpretación:
--  · B con fila + A premium y fecha futura  -> ya está activa.
--  · B con fila + A en 'free'               -> el RPC falló o el barrido la bajó: usar ACTIVACIÓN MANUAL.
--  · B sin fila y C sin su pago             -> el webhook no llegó: Edge Functions > webhook-mercadopago > Logs,
--                                              y en MP > Tu negocio > Notificaciones, reenviar la del pago.
--  · C muestra su pago con OTRO user_id     -> el external_reference no era el de ella: ACTIVACIÓN MANUAL.

-- ---------------------------------------------------------------------
-- ACTIVACIÓN MANUAL · Victoria Lescano (plan mensual = 30 días)
-- Ajustá p_dias: mensual 30 · semestral 183 · anual 365.
-- Si la fila de pagos_procesados ya existe, NO hace falta tocarla.
-- ---------------------------------------------------------------------
-- Opción 1 (usa la función del PASO 4, suma sobre el vencimiento vigente):
-- select public.extender_nikamed_plus(
--   (select id from public.profiles where username = 'vlescano1998'), 30);

-- Opción 2 (sin función, fija desde hoy):
-- update public.profiles
--    set tipo_cuenta = 'premium',
--        plan_activo = 'mensual',
--        fecha_inicio_suscripcion = now(),
--        fecha_fin_suscripcion = now() + interval '30 days'
--  where username = 'vlescano1998';
