-- Portada de perfil: URL de la imagen (se sube al bucket "avatars", carpeta <uid>/banner-*.jpg)
alter table public.profiles add column if not exists banner_url text;
