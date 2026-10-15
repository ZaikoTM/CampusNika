-- Notas y marcadores sobre videos y materiales (gratis para todos los usuarios).
-- RLS: cada persona ve y escribe solo las suyas. Idempotente.
create table if not exists public.notas_estudio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recurso text not null,            -- URL del video o material (clave del recurso)
  recurso_titulo text,
  modulo text,                      -- cirugia, ginecologia, siam, ...
  up_id text,
  tipo text not null default 'material',   -- 'video' | 'material'
  posicion numeric,                 -- segundos (video) o numero de pagina (material)
  texto text not null default '',
  color text not null default 'amarillo',
  creado_en timestamptz not null default now()
);

create index if not exists notas_estudio_user_idx on public.notas_estudio (user_id, creado_en desc);
create index if not exists notas_estudio_recurso_idx on public.notas_estudio (user_id, recurso);

alter table public.notas_estudio enable row level security;

drop policy if exists "notas_estudio_select_own" on public.notas_estudio;
drop policy if exists "notas_estudio_insert_own" on public.notas_estudio;
drop policy if exists "notas_estudio_update_own" on public.notas_estudio;
drop policy if exists "notas_estudio_delete_own" on public.notas_estudio;

create policy "notas_estudio_select_own" on public.notas_estudio for select using (auth.uid() = user_id);
create policy "notas_estudio_insert_own" on public.notas_estudio for insert with check (auth.uid() = user_id);
create policy "notas_estudio_update_own" on public.notas_estudio for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notas_estudio_delete_own" on public.notas_estudio for delete using (auth.uid() = user_id);
