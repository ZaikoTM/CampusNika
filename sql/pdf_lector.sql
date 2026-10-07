-- Lector de PDFs con subrayado y progreso de lectura (sala de estudio).
-- Los PDFs siguen en Google Drive; acá solo se guardan las marcas de cada usuario.
-- AISLAMIENTO: cada fila lleva user_id = auth.uid() y las políticas RLS solo dejan ver / crear / editar / borrar las filas propias.
-- Ejecutar una sola vez en el SQL Editor de Supabase (copiar solo las sentencias si el editor se queja por los comentarios).

-- 1) Subrayados
create table if not exists public.pdf_subrayados (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
    file_id     text not null,                 -- id del archivo de Drive
    pagina      int  not null check (pagina >= 1),
    color       text not null default 'amarillo' check (color in ('amarillo', 'verde', 'rosa', 'azul')),
    texto       text,                          -- texto subrayado (para listarlo / buscarlo)
    rects       jsonb not null,                -- rectángulos como fracción de la página: [{x,y,w,h}, ...]
    created_at  timestamptz not null default now()
);
create index if not exists pdf_subrayados_user_file_idx on public.pdf_subrayados (user_id, file_id, pagina);

-- 2) Progreso de lectura (una fila por usuario y archivo)
create table if not exists public.pdf_progreso (
    user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
    file_id       text not null,
    titulo        text,
    ultima_pagina int  not null default 1 check (ultima_pagina >= 1),
    total_paginas int,
    leidas        int[] not null default '{}',
    updated_at    timestamptz not null default now(),
    primary key (user_id, file_id)
);

-- 3) RLS: cada usuario solo accede a lo suyo
alter table public.pdf_subrayados enable row level security;
alter table public.pdf_progreso   enable row level security;

drop policy if exists pdf_subrayados_own on public.pdf_subrayados;
create policy pdf_subrayados_own on public.pdf_subrayados
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

drop policy if exists pdf_progreso_own on public.pdf_progreso;
create policy pdf_progreso_own on public.pdf_progreso
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Sin sesión (rol anon) no hay ningún acceso
revoke all on public.pdf_subrayados from anon;
revoke all on public.pdf_progreso   from anon;
grant select, insert, update, delete on public.pdf_subrayados to authenticated;
grant select, insert, update, delete on public.pdf_progreso   to authenticated;

-- Verificación: debe devolver las dos tablas con rowsecurity = true
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('pdf_subrayados', 'pdf_progreso');
