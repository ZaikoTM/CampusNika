-- Redes sociales extra del perfil (tiktok, youtube, x, ...): jsonb { red: usuario_o_link }
alter table public.profiles add column if not exists redes jsonb not null default '{}'::jsonb;
