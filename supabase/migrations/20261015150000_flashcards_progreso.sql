-- Progreso de las flashcards ("Me lo sé"), sincronizado entre dispositivos.
-- RLS: cada persona ve y escribe solo lo suyo. Idempotente.
create table if not exists public.flashcards_progreso (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ficha_id text not null,
  actualizado_en timestamptz not null default now(),
  primary key (user_id, ficha_id)
);
alter table public.flashcards_progreso enable row level security;
drop policy if exists "fc_prog_select_own" on public.flashcards_progreso;
drop policy if exists "fc_prog_insert_own" on public.flashcards_progreso;
drop policy if exists "fc_prog_update_own" on public.flashcards_progreso;
drop policy if exists "fc_prog_delete_own" on public.flashcards_progreso;
create policy "fc_prog_select_own" on public.flashcards_progreso for select using (auth.uid() = user_id);
create policy "fc_prog_insert_own" on public.flashcards_progreso for insert with check (auth.uid() = user_id);
create policy "fc_prog_update_own" on public.flashcards_progreso for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fc_prog_delete_own" on public.flashcards_progreso for delete using (auth.uid() = user_id);
