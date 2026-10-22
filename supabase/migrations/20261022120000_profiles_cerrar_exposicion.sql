-- Cierra la exposición de datos privados en public.profiles.
--  * anon podía leer TODAS las filas (política "Perfiles visibles para todos" using (true)) y,
--    por el GRANT SELECT de tabla, también email, is_banned, ids de pago, etc.
--  * Ahora: anon no ve filas de profiles (la vista profiles_public, de owner postgres, sigue andando);
--    authenticated lee solo columnas de perfil social, sin email / is_banned / ids de Mercado Pago.
--  * El panel de admin lee email/is_banned por la RPC admin_listar_perfiles() (valida is_admin()).
--  * El login por usuario no usa profiles.email: lo resuelve la Edge Function login-usuario (service role).
-- Idempotente.

-- 1) Sin política de lectura total (queda: autenticados, propio, admin).
drop policy if exists "Perfiles visibles para todos" on public.profiles;

-- 2) Permisos de tabla: sacar lo que no corresponde y reemplazar SELECT de tabla por SELECT por columna.
revoke all on table public.profiles from anon;
revoke truncate, references, trigger on table public.profiles from authenticated;
revoke select on table public.profiles from authenticated;

-- anon: solo id/role, porque la política eventos_uso_select_admin ({public}) consulta profiles.
-- Sin ninguna política de filas aplicable a anon, no devuelve filas.
grant select (id, role) on table public.profiles to anon;

-- authenticated: columnas del perfil social. Quedan afuera: email, is_banned,
-- id_transaccion_mp, mp_subscriber_external_ref.
grant select (
  id, username, fullname, full_name, nombre, avatar, avatar_url, banner_url, bio,
  faculty, especialidad, anio_cursada, cursada, instagram, whatsapp, redes,
  role, tipo_cuenta, plan_activo, fecha_inicio_suscripcion, fecha_fin_suscripcion, nikamed_vence_en,
  campus_tema, onboarding_completado, terms_accepted_at, usos_simuladores,
  created_at, updated_at, last_login_at, last_seen_at
) on table public.profiles to authenticated;

-- 3) Lista de perfiles para el panel de admin (única vía para leer email e is_banned).
create or replace function public.admin_listar_perfiles()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(t))
    from (
      select id, username, fullname, avatar, role, tipo_cuenta, plan_activo,
             fecha_inicio_suscripcion, fecha_fin_suscripcion, created_at,
             email, anio_cursada, is_banned, last_seen_at, last_login_at
      from public.profiles
      order by fullname asc
      limit 3000
    ) t
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.admin_listar_perfiles() from public, anon;
grant execute on function public.admin_listar_perfiles() to authenticated;
