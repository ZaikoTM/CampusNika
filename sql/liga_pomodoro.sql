-- ============================================================================
-- Liga Pomodoro + estadísticas públicas de perfil
--
-- study_sessions y exam_results tienen RLS "solo lo mío" (auth.uid() = user_id),
-- así que un ranking entre usuarios NO se puede armar con un SELECT normal.
-- Estas funciones (SECURITY DEFINER) exponen únicamente agregados y sesiones
-- COMPLETADAS de estudio, que es justo lo que la Liga hace público a propósito.
--
-- Todas las comparaciones de ids se hacen con ::text porque en esta base
-- profiles.id y study_sessions.user_id / exam_results.user_id no comparten tipo
-- (uuid vs text). Los ids se devuelven como text; el frontend los usa como string.
-- Ejecutar una vez en el SQL Editor de Supabase (es re-ejecutable).
-- ============================================================================

drop function if exists public.liga_pomodoro(timestamptz);
drop function if exists public.liga_pomodoro_detalle(uuid, timestamptz);
drop function if exists public.liga_pomodoro_detalle(text, timestamptz);
drop function if exists public.perfil_stats_publicos(uuid);
drop function if exists public.perfil_stats_publicos(text);

-- 1) Ranking: minutos y sesiones por usuario dentro del período (p_desde NULL = histórico)
--    Devuelve también el rango de la jerarquía médica argentina, según las horas HISTÓRICAS:
--      < 10 h  Ciclo Clínico (1) | 10 h Practicante PFO (2) | 40 h Residente R1 (3)
--      100 h   Residente Superior (R3/R4) (4) | 250 h Jefe de Residentes (5)
create or replace function public.liga_pomodoro(p_desde timestamptz default null)
returns table (
  user_id text,
  username text,
  fullname text,
  avatar text,
  role text,
  minutos_periodo integer,
  sesiones_periodo integer,
  minutos_total integer,
  rango text,
  nivel_rango integer
)
language sql
stable
security definer
set search_path = public
as $$
  with agg as (
    select
      s.user_id::text as user_id,
      p.username::text as username,
      coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Estudiante Nika')::text as fullname,
      coalesce(p.avatar, p.avatar_url)::text as avatar,
      p.role::text as role,
      coalesce(sum(s.duration_minutes) filter (where p_desde is null or s.completed_at >= p_desde), 0)::int as minutos_periodo,
      (count(*) filter (where p_desde is null or s.completed_at >= p_desde))::int as sesiones_periodo,
      coalesce(sum(s.duration_minutes), 0)::int as minutos_total
    from public.study_sessions s
    join public.profiles p on p.id::text = s.user_id::text
    where coalesce(s.completed, true) = true
    group by s.user_id::text, p.username, p.fullname, p.full_name, p.nombre, p.avatar, p.avatar_url, p.role
  )
  select
    a.user_id, a.username, a.fullname, a.avatar, a.role,
    a.minutos_periodo, a.sesiones_periodo, a.minutos_total,
    case
      when a.minutos_total >= 15000 then 'Jefe de Residentes'
      when a.minutos_total >= 6000  then 'Residente Superior (R3/R4)'
      when a.minutos_total >= 2400  then 'Residente R1'
      when a.minutos_total >= 600   then 'Practicante PFO'
      else 'Ciclo Clínico'
    end as rango,
    case
      when a.minutos_total >= 15000 then 5
      when a.minutos_total >= 6000  then 4
      when a.minutos_total >= 2400  then 3
      when a.minutos_total >= 600   then 2
      else 1
    end as nivel_rango
  from agg a
  where a.minutos_periodo > 0
  order by a.minutos_periodo desc, a.sesiones_periodo desc
  limit 100;
$$;

-- 2) Auditoría: desglose de sesiones de un usuario en el período
create or replace function public.liga_pomodoro_detalle(p_user text, p_desde timestamptz default null)
returns table (
  modulo text,
  up_id text,
  duration_minutes integer,
  completed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select s.modulo::text, s.up_id::text, s.duration_minutes::int, s.completed_at
  from public.study_sessions s
  where s.user_id::text = p_user::text
    and coalesce(s.completed, true) = true
    and (p_desde is null or s.completed_at >= p_desde)
  order by s.completed_at desc
  limit 300;
$$;

-- 3) Estadísticas públicas para el modal "Ver perfil" (horas totales y simulacros aprobados >= 60 %)
create or replace function public.perfil_stats_publicos(p_user text)
returns table (
  minutos_total integer,
  sesiones_total integer,
  simulacros_total integer,
  simulacros_aprobados integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select coalesce(sum(duration_minutes), 0)::int from public.study_sessions
      where user_id::text = p_user::text and coalesce(completed, true) = true),
    (select count(*)::int from public.study_sessions
      where user_id::text = p_user::text and coalesce(completed, true) = true),
    (select count(*)::int from public.exam_results
      where user_id::text = p_user::text),
    (select count(*)::int from public.exam_results
      where user_id::text = p_user::text and coalesce(score_pct, 0) >= 60);
$$;

grant execute on function public.liga_pomodoro(timestamptz) to authenticated;
grant execute on function public.liga_pomodoro_detalle(text, timestamptz) to authenticated;
grant execute on function public.perfil_stats_publicos(text) to authenticated;
