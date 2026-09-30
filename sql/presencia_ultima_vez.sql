-- Última vez activo + usuarios en línea (últimos N minutos).
-- Ejecutar UNA vez en el SQL Editor de Supabase. Es seguro repetirlo.
-- Requiere 001_auth_profiles.sql y la tabla friendships.
-- Sin esto, campus.html sigue funcionando pero sin "activo hace X" ni el contador global.

alter table public.profiles add column if not exists last_seen_at timestamptz;
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);

-- Latido: cada usuario actualiza SOLO su propia fila. Una función security definer no permite tocar
-- ningún otro campo (la policy profiles_update_own exige no cambiar "role" y es más frágil).
create or replace function public.nika_heartbeat() returns void
language sql security definer set search_path = public as $$
    update public.profiles set last_seen_at = now() where id = auth.uid();
$$;

-- Cuántos usuarios estuvieron activos en los últimos p_minutos (incluye a quien consulta)
create or replace function public.nika_conteo_en_linea(p_minutos int default 5) returns int
language sql stable security definer set search_path = public as $$
    select count(*)::int from public.profiles
    where last_seen_at > now() - make_interval(mins => greatest(1, least(p_minutos, 60)));
$$;

-- Quiénes (nombre, avatar, última actividad): solo datos que ya son públicos en profiles_public
create or replace function public.nika_usuarios_en_linea(p_minutos int default 5, p_limite int default 40)
returns table (id uuid, username text, fullname text, avatar text, last_seen_at timestamptz)
language sql stable security definer set search_path = public as $$
    select p.id, p.username, p.fullname, p.avatar, p.last_seen_at from public.profiles p
    where p.last_seen_at > now() - make_interval(mins => greatest(1, least(p_minutos, 60)))
    order by p.last_seen_at desc
    limit greatest(1, least(p_limite, 100));
$$;

-- Última actividad SOLO de mis amigos confirmados
create or replace function public.nika_ultima_vez_amigos()
returns table (id uuid, last_seen_at timestamptz)
language sql stable security definer set search_path = public as $$
    select p.id, p.last_seen_at from public.profiles p
    where p.id in (
        select case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
        from public.friendships f
        where f.status = 'accepted' and auth.uid() in (f.requester_id, f.addressee_id)
    );
$$;

revoke all on function public.nika_heartbeat() from public;
revoke all on function public.nika_conteo_en_linea(int) from public;
revoke all on function public.nika_usuarios_en_linea(int, int) from public;
revoke all on function public.nika_ultima_vez_amigos() from public;
grant execute on function public.nika_heartbeat() to authenticated;
grant execute on function public.nika_conteo_en_linea(int) to authenticated;
grant execute on function public.nika_usuarios_en_linea(int, int) to authenticated;
grant execute on function public.nika_ultima_vez_amigos() to authenticated;
