-- =====================================================================
-- CAMPUS NIKA · Links cortos para compartir casos de Recetarios
-- Ejecutá TODO este archivo junto en el SQL Editor (son 3 sentencias simples).
-- Guarda el caso clínico compartido y devuelve un link corto:
--   nikamed.com.ar/recetarios.html?doc=receta&k=a1b2c3d4
-- en lugar del link larguísimo con todo el caso adentro.
-- =====================================================================

create table if not exists public.casos_compartidos (
    id         text primary key check (length(id) between 6 and 12),
    doc        text not null,
    caso       jsonb not null check (pg_column_size(caso) < 4000),
    creado_por uuid default auth.uid() references auth.users(id) on delete set null,
    creado_en  timestamptz not null default now()
);

alter table public.casos_compartidos enable row level security;

-- Cualquiera con el link puede abrir el caso (es un caso simulado, no hay datos reales)
drop policy if exists "casos_compartidos_leer" on public.casos_compartidos;
create policy "casos_compartidos_leer" on public.casos_compartidos
    for select to anon, authenticated using (true);

-- Solo usuarios con sesión pueden crear links, y a su nombre
drop policy if exists "casos_compartidos_crear" on public.casos_compartidos;
create policy "casos_compartidos_crear" on public.casos_compartidos
    for insert to authenticated with check (creado_por = auth.uid());
