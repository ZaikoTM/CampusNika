-- Solicitudes de acceso a "Mi Spotify" (NikaMusic) de cuentas NikaMed+.
-- La app de Spotify está en modo de prueba: solo funcionan las cuentas que el administrador agrega en
-- developer.spotify.com > tu app > User Management. Cada solicitud trae el email de Spotify que quiere usar la persona.
-- RLS: cada persona crea y ve solo las suyas; el administrador (profiles.role = 'admin') ve y resuelve todas. Idempotente.
create table if not exists public.spotify_solicitudes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  username text,
  fullname text,
  email_spotify text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'agregada', 'rechazada')),
  creado_en timestamptz not null default now(),
  resuelto_en timestamptz
);
create index if not exists spotify_solicitudes_estado_idx on public.spotify_solicitudes (estado, creado_en desc);
alter table public.spotify_solicitudes enable row level security;

create or replace function public.es_admin_spotify() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin');
$$;

drop policy if exists "spotify_sol_select" on public.spotify_solicitudes;
drop policy if exists "spotify_sol_insert" on public.spotify_solicitudes;
drop policy if exists "spotify_sol_update_admin" on public.spotify_solicitudes;
drop policy if exists "spotify_sol_delete_admin" on public.spotify_solicitudes;
create policy "spotify_sol_select" on public.spotify_solicitudes for select using (auth.uid() = user_id or public.es_admin_spotify());
create policy "spotify_sol_insert" on public.spotify_solicitudes for insert with check (auth.uid() = user_id and estado = 'pendiente');
create policy "spotify_sol_update_admin" on public.spotify_solicitudes for update using (public.es_admin_spotify()) with check (public.es_admin_spotify());
create policy "spotify_sol_delete_admin" on public.spotify_solicitudes for delete using (public.es_admin_spotify());

-- Aviso en tiempo real al administrador (si la publicación realtime existe)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'spotify_solicitudes') then
    alter publication supabase_realtime add table public.spotify_solicitudes;
  end if;
end $$;
