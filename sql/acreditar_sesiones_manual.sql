-- Acredita Pomodoros que un usuario hizo sin conexión y nunca llegaron a la nube.
-- Completar la lista de abajo (una fila por bloque) y ejecutar en el SQL Editor de Supabase.
-- Es seguro repetirlo: el índice único study_sessions_unico evita duplicados (misma cuenta + hora + módulo + UP).
-- La racha 🔥 se calcula sola a partir de estas filas (un día cuenta con 1 bloque completado).

with u as (select id from public.profiles where username = 'german11')
insert into public.study_sessions (user_id, modulo, up_id, duration_minutes, completed, completed_at)
select u.id, v.modulo, v.up_id, v.minutos, true, v.fin::timestamptz
from u, (values
  -- ('ginecologia', 'up1', 25, '2026-11-17 15:30:00-03'),
  -- ('ginecologia', 'up1', 25, '2026-11-17 16:00:00-03')
  ('', '', 0, '2000-01-01')   -- borrar esta fila de relleno al completar la lista
) as v(modulo, up_id, minutos, fin)
where v.minutos > 0
on conflict do nothing;
