-- Planificador: horas y estado de cada bloque en calendario_eventos.
alter table public.calendario_eventos
  add column if not exists hora_inicio time,
  add column if not exists hora_fin time,
  add column if not exists estado text not null default 'pendiente';

alter table public.calendario_eventos
  drop constraint if exists calendario_eventos_estado_check;
alter table public.calendario_eventos
  add constraint calendario_eventos_estado_check
  check (estado in ('pendiente','en_curso','completado','descartado'));
