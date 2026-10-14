-- Último lugar de estudio de cada persona (para "Continuá donde lo dejaste" en todos sus dispositivos).
-- Una fila por usuario; RLS: cada uno ve y escribe solo la suya. Es idempotente: se puede ejecutar más de una vez.
create table if not exists public.ultimo_estudio (
  user_id uuid primary key references auth.users(id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now()
);

alter table public.ultimo_estudio enable row level security;

drop policy if exists "ultimo_estudio_select_own" on public.ultimo_estudio;
drop policy if exists "ultimo_estudio_insert_own" on public.ultimo_estudio;
drop policy if exists "ultimo_estudio_update_own" on public.ultimo_estudio;
drop policy if exists "ultimo_estudio_delete_own" on public.ultimo_estudio;

create policy "ultimo_estudio_select_own" on public.ultimo_estudio for select using (auth.uid() = user_id);
create policy "ultimo_estudio_insert_own" on public.ultimo_estudio for insert with check (auth.uid() = user_id);
create policy "ultimo_estudio_update_own" on public.ultimo_estudio for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ultimo_estudio_delete_own" on public.ultimo_estudio for delete using (auth.uid() = user_id);
