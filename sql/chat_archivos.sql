-- ============================================================================
-- Archivos adjuntos en los chats (chat normal y chat de la sala de estudio)
-- Ejecutar una vez en el SQL Editor de Supabase (es re-ejecutable).
-- Sin esto, los chats igual dejan adjuntar imágenes y PDF (usan el bucket forum-files);
-- con esto se suman Word, Excel, PowerPoint, texto, audio, video corto y ZIP.
-- Cupo por persona (suma de sus archivos vigentes; los archivos se borran solos a los 30 días): 10 MB comunes, 50 MB con NikaMed+ o admin.
-- El cliente controla el cupo exacto antes de subir; esta función es la barrera del servidor: cuando ya se llegó al cupo, no deja subir más.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-files', 'chat-files', true, 52428800, array[
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

create or replace function public.chat_cupo_disponible(p_uid uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  v_tipo text; v_rol text; v_vence timestamptz; v_plus boolean; v_limite bigint; v_usado bigint;
begin
  select lower(coalesce(tipo_cuenta::text, 'free')), lower(coalesce(role::text, '')), nikamed_vence_en
    into v_tipo, v_rol, v_vence from public.profiles where id = p_uid;
  v_plus := v_rol = 'admin' or (v_tipo in ('vip', 'premium') and (v_vence is null or v_vence > now()));
  v_limite := case when v_plus then 52428800 else 10485760 end;
  select coalesce(sum((metadata->>'size')::bigint), 0) into v_usado
    from storage.objects
   where bucket_id in ('chat-files', 'forum-files')
     and (storage.foldername(name))[1] = p_uid::text
     and name like p_uid::text || '/chat\_%';
  return v_usado < v_limite;
end;
$$;
revoke all on function public.chat_cupo_disponible(uuid) from public;
grant execute on function public.chat_cupo_disponible(uuid) to authenticated;

drop policy if exists "chat_files_insert_own" on storage.objects;
create policy "chat_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-files' and (storage.foldername(name))[1] = auth.uid()::text and public.chat_cupo_disponible(auth.uid()));

drop policy if exists "chat_files_delete_own" on storage.objects;
create policy "chat_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'chat-files' and (storage.foldername(name))[1] = auth.uid()::text);
