-- Apariencia del campus (tema premium / clásico / oscuro) guardada en la cuenta, para que siga al usuario entre dispositivos.
-- La política profiles_update_own ya permite que cada usuario actualice su propia fila, así que no hace falta otra política.
-- Ejecutar una sola vez en el SQL Editor de Supabase. Copiar solo las sentencias (sin los comentarios) si el editor se queja.

alter table public.profiles add column if not exists campus_tema text;

alter table public.profiles drop constraint if exists profiles_campus_tema_check;
alter table public.profiles add constraint profiles_campus_tema_check
    check (campus_tema is null or campus_tema in ('premium', 'clasico', 'oscuro'));

-- Verificación: debe devolver la columna
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name = 'campus_tema';
