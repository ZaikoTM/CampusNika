-- Pomodoros duplicados (Liga): una misma sesión se guardaba dos veces con una diferencia de milisegundos
-- (la fila que acredita el Anfitrión al Invitado + la que guardaba el propio Invitado sin la clave compartida).
-- Dos bloques de la misma cuenta, mismo módulo/UP y misma duración no pueden solaparse en el tiempo: si
-- completed_at difiere en menos que la duración, es la MISMA sesión.
-- Es seguro repetirlo.

-- 1) Respaldo de las filas duplicadas (se pueden restaurar desde esta tabla)
create table if not exists public.study_sessions_duplicadas_respaldo (like public.study_sessions including defaults);
alter table public.study_sessions_duplicadas_respaldo add column if not exists respaldado_at timestamptz default now();
alter table public.study_sessions_duplicadas_respaldo enable row level security;   -- sin políticas: solo service role / panel

-- Gana la fila que tiene shared_key; a igualdad, la más antigua (y por id si empatan).
with dup as (
  select b.id
  from public.study_sessions b
  where exists (
    select 1 from public.study_sessions a
    where a.user_id = b.user_id and a.id <> b.id
      and a.modulo = b.modulo and a.up_id = b.up_id
      and a.duration_minutes = b.duration_minutes
      and coalesce(a.completed, true) = coalesce(b.completed, true)
      and abs(extract(epoch from (a.completed_at - b.completed_at))) < a.duration_minutes * 60
      and (
        (a.shared_key is not null and b.shared_key is null)
        or ((a.shared_key is null) = (b.shared_key is null)
            and (a.completed_at < b.completed_at or (a.completed_at = b.completed_at and a.id < b.id)))
      )
  )
)
insert into public.study_sessions_duplicadas_respaldo
select s.*, now() from public.study_sessions s join dup on dup.id = s.id
where not exists (select 1 from public.study_sessions_duplicadas_respaldo r where r.id = s.id);

-- Quita de study_sessions solo las filas que quedaron respaldadas
delete from public.study_sessions s using public.study_sessions_duplicadas_respaldo r where r.id = s.id;

-- 2) Guardia permanente en la base: ningún cliente (anfitrión, invitado, cola offline, rescate) puede volver a duplicar.
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
