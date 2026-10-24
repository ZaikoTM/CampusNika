-- "Unidades con más fallos" del panel admin: ahora sale de exam_results (by_up) y por eso incluye
-- TODAS las materias (Ginecología, Cirugía, S.I.A.M., Clínica...) y todos los modos de simulacro.
-- Antes solo veía las respuestas de Cirugía y Ginecología nunca aparecía.
-- Idempotente. Mínimo 10 respuestas por unidad.
drop function if exists public.admin_up_stats(int);

create or replace function public.admin_up_stats(p_limit int default 12)
returns table (up text, modulo text, total bigint, fallos bigint, pct_fallos numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
    select e.key::text as up,
           r.modulo::text,
           sum((e.value->>'total')::bigint) as total,
           sum((e.value->>'total')::bigint - (e.value->>'correct')::bigint) as fallos,
           round(100.0 * sum((e.value->>'total')::bigint - (e.value->>'correct')::bigint)
                 / nullif(sum((e.value->>'total')::bigint), 0), 1) as pct_fallos
    from public.exam_results r
    cross join lateral jsonb_each(coalesce(r.by_up, '{}'::jsonb)) e
    where jsonb_typeof(e.value) = 'object'
    group by e.key, r.modulo
    having sum((e.value->>'total')::bigint) >= 10
    order by pct_fallos desc, total desc
    limit greatest(1, least(coalesce(p_limit, 12), 100));
end;
$$;

revoke all on function public.admin_up_stats(int) from public, anon;
grant execute on function public.admin_up_stats(int) to authenticated;
