-- NikaPlan · Prepará tu examen: planes de estudio por examen (gratis para todos los usuarios).
-- Un plan = una fila; el detalle (días, temas, checklist) vive en "datos" (jsonb) y solo lo ve su dueño.
-- La app funciona igual sin esta tabla (guarda en el dispositivo) y sincroniza apenas existe.

create table if not exists public.planes_examen (
  id             uuid primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  titulo         text not null,
  materia        text not null,
  fecha_examen   date not null,
  datos          jsonb not null default '{}'::jsonb,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists planes_examen_user_fecha_idx on public.planes_examen (user_id, fecha_examen);

alter table public.planes_examen enable row level security;

drop policy if exists "planes_examen_select_propios" on public.planes_examen;
create policy "planes_examen_select_propios" on public.planes_examen
  for select using (auth.uid() = user_id);

drop policy if exists "planes_examen_insert_propios" on public.planes_examen;
create policy "planes_examen_insert_propios" on public.planes_examen
  for insert with check (auth.uid() = user_id);

drop policy if exists "planes_examen_update_propios" on public.planes_examen;
create policy "planes_examen_update_propios" on public.planes_examen
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "planes_examen_delete_propios" on public.planes_examen;
create policy "planes_examen_delete_propios" on public.planes_examen
  for delete using (auth.uid() = user_id);
