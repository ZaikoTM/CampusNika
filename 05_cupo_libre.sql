-- =====================================================================
-- CAMPUS NIKA · Sprint 3 · Mirar el cupo de Gemini SIN consumirlo
-- Lo usa evaluar-simulacion antes de cobrar créditos, para avisar "hay mucha demanda" sin haber cobrado.
-- Ejecutar DESPUÉS de 04_modelo_por_plan.sql (usa su tabla gemini_cupo) y ANTES de desplegar la función.
-- Es seguro repetirlo. Pegalo completo, o en los dos bloques de abajo si el editor se queja.
-- =====================================================================

-- Bloque 1
-- Devuelve 0 = hay cupo · >0 = segundos hasta el próximo minuto · -1 = cupo diario agotado.
create or replace function public.gemini_cupo_libre(p_modelo text, p_rpm int, p_rpd int default null)
returns int
language plpgsql security definer set search_path = public as $$
declare
  v_min timestamptz := date_trunc('minute', now());
  v_dia timestamptz := date_trunc('day', now() at time zone 'America/Los_Angeles') at time zone 'America/Los_Angeles';
  v_usadas int;
begin
  if p_rpd is not null then
    select usadas into v_usadas from gemini_cupo where modelo = p_modelo and tipo = 'dia' and inicio = v_dia;
    if coalesce(v_usadas, 0) >= p_rpd then return -1; end if;
  end if;

  select usadas into v_usadas from gemini_cupo where modelo = p_modelo and tipo = 'min' and inicio = v_min;
  if coalesce(v_usadas, 0) >= p_rpm then
    return greatest(1, ceil(extract(epoch from (v_min + interval '1 minute' - now())))::int);
  end if;
  return 0;
end $$;

-- Bloque 2
revoke all on function public.gemini_cupo_libre(text, int, int) from public, anon, authenticated;
grant execute on function public.gemini_cupo_libre(text, int, int) to service_role;
