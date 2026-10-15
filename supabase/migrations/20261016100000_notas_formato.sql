-- Notas: título propio y texto con formato (negrita, colores, tipografía, etc.). Idempotente.
alter table public.notas_estudio add column if not exists titulo text;
alter table public.notas_estudio add column if not exists contenido_html text;
