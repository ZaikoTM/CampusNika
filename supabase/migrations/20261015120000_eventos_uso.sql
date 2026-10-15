-- Eventos de uso de la plataforma (métricas para el panel de admin).
-- Cada persona solo puede INSERTAR los suyos; únicamente las cuentas admin pueden LEER. No guarda datos personales ni textos.
-- Idempotente: se puede ejecutar más de una vez.
create table if not exists public.eventos_uso (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  seccion text not null,
  accion text not null default 'vista',
  extra jsonb not null default '{}'::jsonb,
  dispositivo text,
  creado_en timestamptz not null default now()
);

create index if not exists eventos_uso_creado_idx on public.eventos_uso (creado_en desc);
create index if not exists eventos_uso_seccion_idx on public.eventos_uso (seccion, creado_en desc);

alter table public.eventos_uso enable row level security;

drop policy if exists "eventos_uso_insert_own" on public.eventos_uso;
drop policy if exists "eventos_uso_select_admin" on public.eventos_uso;

create policy "eventos_uso_insert_own" on public.eventos_uso for insert with check (auth.uid() = user_id);
create policy "eventos_uso_select_admin" on public.eventos_uso for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
