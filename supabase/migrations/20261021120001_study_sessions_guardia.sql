-- Guardia permanente contra sesiones de estudio duplicadas (Liga Pomodoro).
-- Una misma cuenta no puede tener dos bloques del mismo módulo/UP y la misma duración que se solapen en el tiempo:
-- si completed_at difiere en menos que la duración, es la MISMA sesión y la segunda inserción se descarta en silencio.
-- Es seguro repetirlo. (La limpieza de las duplicadas históricas está en 20261021120000_study_sessions_antiduplicado.sql)

create or replace function public.study_sessions_antiduplicado()
returns trigger
language plpgsql
as $$
begin
  -- serializa inserciones concurrentes de la misma cuenta/firma (dos clientes guardando a la vez)
  perform pg_advisory_xact_lock(hashtextextended(new.user_id || '|' || coalesce(new.modulo, '') || '|' || coalesce(new.up_id, ''), 0));
  if exists (
    select 1 from public.study_sessions s
    where s.user_id = new.user_id
      and s.modulo = new.modulo and s.up_id = new.up_id
      and s.duration_minutes = new.duration_minutes
      and coalesce(s.completed, true) = coalesce(new.completed, true)
      and abs(extract(epoch from (s.completed_at - new.completed_at))) < new.duration_minutes * 60
  ) then
    return null;   -- ya existe esa sesión: se descarta en silencio (el cliente la ve como guardada)
  end if;
  return new;
end $$;

drop trigger if exists study_sessions_antiduplicado_trg on public.study_sessions;
create trigger study_sessions_antiduplicado_trg
  before insert on public.study_sessions
  for each row execute function public.study_sessions_antiduplicado();
