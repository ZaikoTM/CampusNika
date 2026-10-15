-- ============================================================================
-- Retos entre compañeros (meta compartida)
--
-- Un reto tiene una meta COMÚN (minutos de estudio, sesiones Pomodoro, simulacros o días activos) en un período.
-- Todos los miembros suman a la misma meta: es cooperativo, no un ranking.
-- study_sessions y exam_results tienen RLS "solo lo mío", así que el progreso de los demás se calcula con una
-- función SECURITY DEFINER que solo devuelve agregados a quienes forman parte del reto.
-- Ejecutar una vez en el SQL Editor de Supabase (es re-ejecutable).
-- ============================================================================

create table if not exists public.retos (
  id uuid primary key default gen_random_uuid(),
  creador_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titulo text not null,
  tipo text not null check (tipo in ('minutos', 'sesiones', 'simulacros', 'dias')),
  meta integer not null check (meta > 0),
  modulo text,                              -- null = todas las materias
  modo text not null default 'todas',       -- 'todas' (cualquier sesión suma) | 'compartidas' (solo sesiones de la sala compartida)
  desde timestamptz not null default now(),
  hasta timestamptz not null,
  creado_en timestamptz not null default now()
);

alter table public.retos add column if not exists modo text not null default 'todas';
-- clave de las sesiones del Pomodoro compartido (ya la crea 10_pomodoro_compartido.sql; acá se asegura por si falta)
alter table public.study_sessions add column if not exists shared_key text;

create table if not exists public.retos_miembros (
  reto_id uuid not null references public.retos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  estado text not null default 'invitado' check (estado in ('invitado', 'aceptado', 'rechazado')),
  creado_en timestamptz not null default now(),
  primary key (reto_id, user_id)
);

create index if not exists retos_miembros_user_idx on public.retos_miembros (user_id, estado);

alter table public.retos enable row level security;
alter table public.retos_miembros enable row level security;

-- ¿Soy el creador o miembro (invitado/aceptado) de este reto?  (SECURITY DEFINER para evitar recursión de RLS)
create or replace function public.es_miembro_reto(p uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.retos r where r.id = p and r.creador_id = auth.uid())
      or exists (select 1 from public.retos_miembros m where m.reto_id = p and m.user_id = auth.uid() and m.estado in ('aceptado', 'invitado'));
$$;

drop policy if exists "retos_select" on public.retos;
drop policy if exists "retos_insert" on public.retos;
drop policy if exists "retos_update" on public.retos;
drop policy if exists "retos_delete" on public.retos;
create policy "retos_select" on public.retos for select using (public.es_miembro_reto(id));
create policy "retos_insert" on public.retos for insert with check (auth.uid() = creador_id);
create policy "retos_update" on public.retos for update using (auth.uid() = creador_id) with check (auth.uid() = creador_id);
create policy "retos_delete" on public.retos for delete using (auth.uid() = creador_id);

drop policy if exists "retos_miembros_select" on public.retos_miembros;
drop policy if exists "retos_miembros_insert" on public.retos_miembros;
drop policy if exists "retos_miembros_update" on public.retos_miembros;
drop policy if exists "retos_miembros_delete" on public.retos_miembros;
create policy "retos_miembros_select" on public.retos_miembros for select using (public.es_miembro_reto(reto_id));
create policy "retos_miembros_insert" on public.retos_miembros for insert with check (
  exists (select 1 from public.retos r where r.id = reto_id and r.creador_id = auth.uid())
);
create policy "retos_miembros_update" on public.retos_miembros for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "retos_miembros_delete" on public.retos_miembros for delete using (
  user_id = auth.uid() or exists (select 1 from public.retos r where r.id = reto_id and r.creador_id = auth.uid())
);

-- Progreso de cada integrante del reto (solo para quienes forman parte)
drop function if exists public.reto_progreso(uuid);
create or replace function public.reto_progreso(p_reto uuid)
returns table (
  user_id text,
  username text,
  fullname text,
  avatar text,
  estado text,
  valor integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.retos%rowtype;
begin
  select * into r from public.retos where id = p_reto;
  if not found then return; end if;
  if not public.es_miembro_reto(p_reto) then return; end if;

  return query
  select
    m.user_id::text,
    p.username::text,
    coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Estudiante Nika')::text,
    coalesce(p.avatar, p.avatar_url)::text,
    m.estado::text,
    (case r.tipo
      when 'minutos' then coalesce((
        select sum(s.duration_minutes) from public.study_sessions s
        where s.user_id::text = m.user_id::text and coalesce(s.completed, true) = true
          and s.completed_at >= r.desde and s.completed_at < r.hasta and (r.modulo is null or s.modulo = r.modulo)
          and (r.modo <> 'compartidas' or s.shared_key is not null)), 0)
      when 'sesiones' then coalesce((
        select count(*) from public.study_sessions s
        where s.user_id::text = m.user_id::text and coalesce(s.completed, true) = true
          and s.completed_at >= r.desde and s.completed_at < r.hasta and (r.modulo is null or s.modulo = r.modulo)
          and (r.modo <> 'compartidas' or s.shared_key is not null)), 0)
      when 'simulacros' then coalesce((
        select count(*) from public.exam_results e
        where e.user_id::text = m.user_id::text
          and e.created_at >= r.desde and e.created_at < r.hasta and (r.modulo is null or e.modulo = r.modulo)), 0)
      when 'dias' then coalesce((
        select count(distinct (s.completed_at at time zone 'America/Argentina/Buenos_Aires')::date) from public.study_sessions s
        where s.user_id::text = m.user_id::text and coalesce(s.completed, true) = true
          and s.completed_at >= r.desde and s.completed_at < r.hasta and (r.modulo is null or s.modulo = r.modulo)
          and (r.modo <> 'compartidas' or s.shared_key is not null)), 0)
      else 0
    end)::integer
  from public.retos_miembros m
  left join public.profiles p on p.id::text = m.user_id::text
  where m.reto_id = p_reto and m.estado in ('aceptado', 'invitado');
end;
$$;
