-- Evita sesiones duplicadas en study_sessions (misma cuenta + mismo instante + mismo módulo/UP).
-- Ejecutar UNA vez en el SQL Editor de Supabase. Es seguro repetirlo.

-- 1) Borra duplicados existentes (deja una fila de cada grupo)
delete from public.study_sessions a
using public.study_sessions b
where a.ctid > b.ctid
  and a.user_id = b.user_id
  and a.completed_at = b.completed_at
  and a.modulo = b.modulo
  and a.up_id = b.up_id;

-- 2) Índice único: la base rechaza (23505) cualquier duplicado futuro;
--    el código lo trata como "ya guardado".
create unique index if not exists study_sessions_unico
  on public.study_sessions (user_id, completed_at, modulo, up_id);
