-- ============================================================================
-- Archivos adjuntos en los chats (chat normal y chat de la sala de estudio)
-- Ejecutar una vez en el SQL Editor de Supabase (es re-ejecutable).
-- Sin esto, los chats igual dejan adjuntar imágenes y PDF (usan el bucket forum-files);
-- con esto se suman Word, Excel, PowerPoint, texto, audio, video corto y ZIP (hasta 15 MB).
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-files', 'chat-files', true, 15728640, array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/zip', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/wav', 'video/mp4', 'video/webm'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat_files_select" on storage.objects;
create policy "chat_files_select" on storage.objects
  for select using (bucket_id = 'chat-files');

drop policy if exists "chat_files_insert_own" on storage.objects;
create policy "chat_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "chat_files_delete_own" on storage.objects;
create policy "chat_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'chat-files' and (storage.foldername(name))[1] = auth.uid()::text);
