-- "Unidades con más fallos" del panel admin: sale de exam_results (by_up) y por eso incluye
-- TODAS las materias (Ginecología, Cirugía, S.I.A.M., Clínica...) y todos los modos de simulacro.
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
  if not exists (select 1 from public.profiles pr where pr.id = auth.uid() and lower(pr.role::text) = 'admin') then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
    select x.k::text,
           x.m::text,
           sum(x.t)::bigint,
           sum(x.t - x.c)::bigint,
           round(100.0 * sum(x.t - x.c) / nullif(sum(x.t), 0), 1)
    from (
      select r.modulo::text as m, e.key as k,
             case when (e.value->>'total') ~ '^[0-9]+$' then (e.value->>'total')::bigint else 0 end as t,
             case when (e.value->>'correct') ~ '^[0-9]+$' then (e.value->>'correct')::bigint else 0 end as c
      from public.exam_results r
      cross join lateral jsonb_each(coalesce(to_jsonb(r.by_up), '{}'::jsonb)) e
      where jsonb_typeof(e.value) = 'object'
    ) x
    group by x.k, x.m
    having sum(x.t) >= 10
    order by 5 desc, 3 desc
    limit greatest(1, least(coalesce(p_limit, 12), 100));
end;
$$;

revoke all on function public.admin_up_stats(int) from public, anon;
grant execute on function public.admin_up_stats(int) to authenticated;
notify pgrst, 'reload schema';
