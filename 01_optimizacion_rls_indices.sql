-- =====================================================================
-- CAMPUS NIKA · Sprint 1 · Optimización de RLS + índices
-- Ejecutar primero en STAGING. Son 3 pasos, cada uno en una ejecución
-- separada del SQL Editor de Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASO 0 (solo lectura) · Mirá qué políticas tenés hoy
-- ---------------------------------------------------------------------
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('exam_results', 'study_sessions')
order by tablename, policyname;


-- ---------------------------------------------------------------------
-- PASO 1 · Envolver auth.uid() en (select auth.uid())
-- Postgres evalúa la subconsulta UNA vez por query (initPlan) en lugar de
-- una vez por fila. Reescribe las políticas EXISTENTES in-place (no cambia
-- nombre, rol ni lógica), así no hace falta conocer su definición.
-- Es idempotente: las que ya están optimizadas se saltan.
-- Para otras tablas, agregarlas a la lista 'tablas'.
-- ---------------------------------------------------------------------
do $$
declare
  p record;
  nuevo_using text;
  nuevo_check text;
  tablas text[] := array['exam_results', 'study_sessions'];
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public' and tablename = any (tablas)
  loop
    nuevo_using := p.qual;
    nuevo_check := p.with_check;

    if nuevo_using is not null and nuevo_using !~* 'select\s+auth\.uid' then
      nuevo_using := replace(nuevo_using, 'auth.uid()', '(select auth.uid())');
    end if;
    if nuevo_check is not null and nuevo_check !~* 'select\s+auth\.uid' then
      nuevo_check := replace(nuevo_check, 'auth.uid()', '(select auth.uid())');
    end if;

    if nuevo_using is distinct from p.qual or nuevo_check is distinct from p.with_check then
      execute format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename)
        || coalesce(format(' using (%s)', nuevo_using), '')
        || coalesce(format(' with check (%s)', nuevo_check), '');
      raise notice 'Optimizada: %.% -> %', p.tablename, p.policyname, p.policyname;
    end if;
  end loop;
end $$;

-- Verificación: debería mostrar "( SELECT auth.uid() AS uid)" en qual / with_check
select tablename, policyname, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('exam_results', 'study_sessions');


-- ---------------------------------------------------------------------
-- PASO 2 · Índices (CONCURRENTLY: no bloquea escrituras)
-- IMPORTANTE: el SQL Editor envuelve varios statements en una transacción y
-- CREATE INDEX CONCURRENTLY no puede correr dentro de una. Ejecutá CADA
-- statement por separado (seleccioná uno y "Run").
-- ---------------------------------------------------------------------

-- exam_results: "Mi Rendimiento" y Recetarios filtran por user_id y ordenan por created_at desc
create index concurrently if not exists idx_exam_results_user_created
  on public.exam_results (user_id, created_at desc);

-- exam_results: filtro like 'recetario_%' por usuario
create index concurrently if not exists idx_exam_results_user_mode
  on public.exam_results (user_id, mode text_pattern_ops);

-- study_sessions: ya tiene el único (user_id, completed_at, modulo, up_id)
-- (sql/study_sessions_unico.sql), que cubre user_id + completed_at. Solo
-- hace falta este si NO ejecutaste ese script:
-- create index concurrently if not exists idx_study_sessions_user_completed
--   on public.study_sessions (user_id, completed_at desc);


-- ---------------------------------------------------------------------
-- PASO 3 · Verificación (un INVALID indica que un CONCURRENTLY falló:
-- borralo con DROP INDEX y repetí)
-- ---------------------------------------------------------------------
select c.relname as indice, i.indisvalid as valido
from pg_index i join pg_class c on c.oid = i.indexrelid
where c.relname in ('idx_exam_results_user_created', 'idx_exam_results_user_mode');

-- Comprobá que se usan:
-- explain (analyze, buffers)
--   select created_at from public.exam_results
--   where user_id = '<un-uuid-real>' order by created_at desc limit 50;
