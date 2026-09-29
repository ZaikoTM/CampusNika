-- ============================================================================
-- Foro Académico — feed social: adjuntos, reacciones y comentarios anidados
-- Ejecutar una vez en el SQL Editor de Supabase (es re-ejecutable).
-- Requiere las tablas existentes forum_threads y forum_replies.
--
-- IMPORTANTE: al ejecutar, si Supabase muestra "Run and enable RLS" elegí
-- "Run without RLS": este script ya activa RLS y crea sus políticas, y el asistente
-- del editor rompe los scripts largos al reescribirlos.
-- (Sin bloques DO $$: todo son sentencias simples.)
-- ============================================================================

-- 1) Adjuntos (imagen o PDF) en cada publicación
alter table public.forum_threads
  add column if not exists attachment_url  text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text;   -- 'image' | 'pdf'

-- 2) Comentarios anidados: cada respuesta puede colgar de otra respuesta.
--    forum_replies.id es uuid en esta base, así que parent_id también.
alter table public.forum_replies
  add column if not exists parent_id uuid references public.forum_replies(id) on delete cascade;

create index if not exists forum_replies_parent_idx on public.forum_replies(parent_id);

-- (Solo si una ejecución anterior falló y dejó parent_id como bigint, correr ANTES estas dos líneas:)
-- alter table public.forum_replies drop column if exists parent_id;
-- y volver a ejecutar este script completo.

-- 3) Reacciones médicas: 'util' (👍 Útil) · 'excelente' (❤️ Excelente caso) · 'duda' (💡 Buena duda)
--    thread_id se guarda como texto (sirve para ids uuid o numéricos de forum_threads sin depender del tipo).
create table if not exists public.forum_reactions (
  thread_id  text not null,
  user_id    uuid not null default auth.uid(),
  tipo       text not null check (tipo in ('util', 'excelente', 'duda')),
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id, tipo)
);

alter table public.forum_reactions enable row level security;

drop policy if exists "forum_reactions_select" on public.forum_reactions;
create policy "forum_reactions_select" on public.forum_reactions
  for select to authenticated using (true);

drop policy if exists "forum_reactions_insert_own" on public.forum_reactions;
create policy "forum_reactions_insert_own" on public.forum_reactions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "forum_reactions_delete_own" on public.forum_reactions;
create policy "forum_reactions_delete_own" on public.forum_reactions
  for delete to authenticated using (user_id = auth.uid());

-- 4) Bucket público para los archivos adjuntos (imágenes y PDFs, máx. 8 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('forum-files', 'forum-files', true, 8388608,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "forum_files_select" on storage.objects;
create policy "forum_files_select" on storage.objects
  for select using (bucket_id = 'forum-files');

drop policy if exists "forum_files_insert_own" on storage.objects;
create policy "forum_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'forum-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "forum_files_delete_own" on storage.objects;
create policy "forum_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'forum-files' and (storage.foldername(name))[1] = auth.uid()::text);
