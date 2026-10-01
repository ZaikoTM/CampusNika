-- =====================================================================
-- CAMPUS NIKA · Seguridad · Límite de consultas de IA por usuario y por hora
-- Lo usan chat-flotante (10 por hora) y chat-nika (60 por hora). Ejecutar ANTES de desplegar esas funciones.
-- Es seguro repetirlo. Pegá cada bloque por separado si el editor se queja.
-- =====================================================================

-- Bloque 1: tabla (solo service_role; sin políticas)
create table if not exists public.ia_uso_usuario (
  user_id uuid        not null,
  funcion text        not null,
  hora    timestamptz not null,
  usadas  int         not null default 0,
  primary key (user_id, funcion, hora)
);
alter table public.ia_uso_usuario enable row level security;

-- Bloque 2: función. Devuelve 0 = permitido · >0 = segundos hasta que empiece la próxima hora.
create or replace function public.ia_reservar_usuario(p_user uuid, p_funcion text, p_max int)
returns int
language plpgsql security definer set search_path = public as $$
declare
  v_hora timestamptz := date_trunc('hour', now());
begin
  if random() < 0.01 then delete from ia_uso_usuario where hora < now() - interval '2 days'; end if;

  insert into ia_uso_usuario (user_id, funcion, hora, usadas) values (p_user, p_funcion, v_hora, 1)
  on conflict (user_id, funcion, hora)
  do update set usadas = ia_uso_usuario.usadas + 1 where ia_uso_usuario.usadas < p_max;

  if found then return 0; end if;
  return greatest(1, ceil(extract(epoch from (v_hora + interval '1 hour' - now())))::int);
end $$;

-- Bloque 3: permisos
revoke all on function public.ia_reservar_usuario(uuid, text, int) from public, anon, authenticated;
grant execute on function public.ia_reservar_usuario(uuid, text, int) to service_role;
