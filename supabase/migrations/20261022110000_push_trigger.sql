-- Web Push: cada notificación nueva dispara la Edge Function `enviar-push` (aviso con la app cerrada).
-- El secreto compartido NO va en el repositorio: vive en la tabla privada _nika_config (sin políticas = solo accesible desde funciones de la base).
create extension if not exists pg_net with schema extensions;

create table if not exists public._nika_config (clave text primary key, valor text not null);
alter table public._nika_config enable row level security;

create or replace function public.nika_push_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  secreto text;
begin
  select valor into secreto from public._nika_config where clave = 'push_webhook_secret';
  if secreto is null then return new; end if;   -- sin configurar: no hace nada
  perform net.http_post(
    url := 'https://pswjmouuyaxueaqqglko.supabase.co/functions/v1/enviar-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', secreto),
    body := jsonb_build_object('record', to_jsonb(new)),
    timeout_milliseconds := 4000
  );
  return new;
exception when others then
  return new;   -- el push nunca puede impedir que se guarde la notificación
end;
$$;

drop trigger if exists nika_push_trigger on public.notificaciones;
create trigger nika_push_trigger after insert on public.notificaciones
  for each row execute function public.nika_push_trigger();
