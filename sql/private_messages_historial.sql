-- =====================================================================
-- CAMPUS NIKA · Chats privados con historial permanente  (PROPUESTA: NO EJECUTADO)
-- Ejecutá cada bloque por separado. Es idempotente: se puede correr más de una vez.
-- Compatible con js/chatManager.js actual (usa from_username / to_username / content / shared_question /
-- delivered_at / read_at): el código viejo sigue andando y la seguridad pasa a basarse en UUID.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BLOQUE 0 · DIAGNÓSTICO (solo lectura): ¿por qué se borran de un día para otro?
-- Si aparece un job de pg_cron o un trigger/función que borra private_messages, ESE es el culpable.
-- ---------------------------------------------------------------------
-- select jobid, schedule, command from cron.job where command ilike '%private_messages%';
-- select tgname, pg_get_triggerdef(oid) from pg_trigger where tgrelid = 'public.private_messages'::regclass and not tgisinternal;
-- select count(*), min(created_at) from public.private_messages;   -- si min(created_at) es de hoy, hay un borrado

-- ---------------------------------------------------------------------
-- BLOQUE 1 · Tabla (si no existía) + columnas por UUID
-- ---------------------------------------------------------------------
create table if not exists public.private_messages (
    id              uuid primary key default gen_random_uuid(),
    from_username   text not null,
    to_username     text not null,
    content         text,                 -- = "message" del pedido; se mantiene el nombre que usa el front
    shared_question jsonb,
    created_at      timestamptz not null default now(),
    delivered_at    timestamptz,
    read_at         timestamptz
);

alter table public.private_messages add column if not exists sender_id   uuid references public.profiles(id) on delete cascade;
alter table public.private_messages add column if not exists receiver_id uuid references public.profiles(id) on delete cascade;

-- profiles.id ya es el mismo uuid que auth.users.id, por eso la FK va a profiles (cascada si se borra la cuenta).
-- Las restricciones se crean NOT VALID: se aplican a los mensajes NUEVOS y no revisan los viejos (que todavía tienen
-- los uuid en NULL hasta el relleno de abajo). Después se validan en el BLOQUE 1b.
alter table public.private_messages drop constraint if exists pm_no_a_si_mismo;
alter table public.private_messages add  constraint pm_no_a_si_mismo
    check (sender_id is null or receiver_id is null or sender_id <> receiver_id) not valid;
alter table public.private_messages drop constraint if exists pm_largo;
alter table public.private_messages add  constraint pm_largo check (content is null or char_length(content) <= 4000) not valid;
alter table public.private_messages drop constraint if exists pm_con_contenido;
alter table public.private_messages add  constraint pm_con_contenido check (content is not null or shared_question is not null) not valid;

-- Completa los mensajes que ya existen
update public.private_messages m set sender_id = p.id from public.profiles p
 where m.sender_id is null and lower(p.username) = lower(m.from_username);
update public.private_messages m set receiver_id = p.id from public.profiles p
 where m.receiver_id is null and lower(p.username) = lower(m.to_username);

-- ---------------------------------------------------------------------
-- BLOQUE 1b · (opcional, después del relleno) ver si quedaron mensajes sin emisor/receptor y validar restricciones
-- ---------------------------------------------------------------------
-- select count(*) as sin_uuid from public.private_messages where sender_id is null or receiver_id is null;   -- usuarios borrados/renombrados
-- alter table public.private_messages validate constraint pm_no_a_si_mismo;   -- falla si hay mensajes de alguien a sí mismo
-- alter table public.private_messages validate constraint pm_largo;
-- alter table public.private_messages validate constraint pm_con_contenido;

-- ---------------------------------------------------------------------
-- BLOQUE 2 · Trigger: el servidor decide quién es el emisor (no se puede falsificar) y completa los UUID
-- ---------------------------------------------------------------------
create or replace function public.nika_pm_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
    new.sender_id := auth.uid();
    select username into new.from_username from public.profiles where id = new.sender_id;
    if new.receiver_id is null then
        select id into new.receiver_id from public.profiles where lower(username) = lower(new.to_username);
    else
        select username into new.to_username from public.profiles where id = new.receiver_id;
    end if;
    if new.sender_id is null or new.receiver_id is null or new.from_username is null then
        raise exception 'emisor o receptor invalido' using errcode = '42501';
    end if;
    new.created_at := now();
    new.delivered_at := null; new.read_at := null;
    return new;
end $$;
drop trigger if exists nika_pm_before_insert on public.private_messages;
create trigger nika_pm_before_insert before insert on public.private_messages
for each row execute function public.nika_pm_before_insert();

-- El receptor solo puede cambiar delivered_at / read_at (nunca el texto ni los participantes)
create or replace function public.nika_pm_before_update() returns trigger
language plpgsql as $$
begin
    if (new.sender_id, new.receiver_id, new.content, new.shared_question, new.created_at, new.from_username, new.to_username)
       is distinct from
       (old.sender_id, old.receiver_id, old.content, old.shared_question, old.created_at, old.from_username, old.to_username) then
        raise exception 'solo se puede marcar entregado/leido' using errcode = '42501';
    end if;
    return new;
end $$;
drop trigger if exists nika_pm_before_update on public.private_messages;
create trigger nika_pm_before_update before update on public.private_messages
for each row execute function public.nika_pm_before_update();

-- ---------------------------------------------------------------------
-- BLOQUE 3 · Índices para el historial por par de usuarios y la bandeja de no leídos
-- ---------------------------------------------------------------------
create index if not exists pm_par_idx     on public.private_messages (least(sender_id, receiver_id), greatest(sender_id, receiver_id), created_at desc);
create index if not exists pm_receptor_idx on public.private_messages (receiver_id, created_at desc);
create index if not exists pm_no_leidos_idx on public.private_messages (receiver_id, sender_id) where read_at is null;
create index if not exists pm_no_entregados_idx on public.private_messages (receiver_id) where delivered_at is null;

-- ---------------------------------------------------------------------
-- BLOQUE 4 · RLS estricta: solo emisor y receptor; escribir solo entre amigos confirmados; NADIE borra
-- ---------------------------------------------------------------------
alter table public.private_messages enable row level security;

drop policy if exists pm_select on public.private_messages;
create policy pm_select on public.private_messages for select to authenticated
    using (auth.uid() in (sender_id, receiver_id));

drop policy if exists pm_insert on public.private_messages;
create policy pm_insert on public.private_messages for insert to authenticated
    with check (
        exists (select 1 from public.friendships f
                where f.status = 'accepted'
                  and ((f.requester_id = auth.uid() and f.addressee_id = receiver_id)
                    or (f.requester_id = receiver_id and f.addressee_id = auth.uid())))
    );

drop policy if exists pm_update_receptor on public.private_messages;
create policy pm_update_receptor on public.private_messages for update to authenticated
    using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- Sin política de DELETE: el historial es permanente (el borrado solo ocurre en cascada si se elimina la cuenta).
drop policy if exists pm_delete on public.private_messages;

-- Si había policies viejas con otros nombres, listalas y quitalas para que no ensanchen el acceso:
-- select policyname, cmd, qual from pg_policies where tablename = 'private_messages';

-- ---------------------------------------------------------------------
-- BLOQUE 5 · Realtime (postgres_changes) — RLS también filtra lo que cada uno recibe
-- ---------------------------------------------------------------------
do $$ begin
    alter publication supabase_realtime add table public.private_messages;
exception when duplicate_object then null; end $$;

-- =====================================================================
-- BLOQUE 6 · Cambios de nombre de usuario (ejecutar cada sub-bloque por separado)
-- El historial se identifica por UUID (inmutable). Los usernames guardados en cada mensaje son solo una copia para
-- que el front actual siga funcionando: al renombrarse un perfil, se actualizan solos.
-- =====================================================================

-- 6a · Corrige el guard de UPDATE: ahora deja completar uuid vacíos y sincronizar usernames; sigue protegiendo el contenido
create or replace function public.nika_pm_before_update() returns trigger
language plpgsql as $$
begin
    if (new.content, new.shared_question, new.created_at)
       is distinct from (old.content, old.shared_question, old.created_at)
       or (old.sender_id   is not null and new.sender_id   is distinct from old.sender_id)
       or (old.receiver_id is not null and new.receiver_id is distinct from old.receiver_id) then
        raise exception 'solo se puede marcar entregado/leido' using errcode = '42501';
    end if;
    return new;
end $$;

-- 6b · Cuando un perfil cambia de username, se actualizan sus mensajes
create or replace function public.nika_pm_sync_username() returns trigger
language plpgsql security definer set search_path = public as $$
begin
    if new.username is distinct from old.username then
        update public.private_messages set from_username = new.username where sender_id   = new.id;
        update public.private_messages set to_username   = new.username where receiver_id = new.id;
    end if;
    return new;
end $$;
drop trigger if exists nika_pm_sync_username on public.profiles;
create trigger nika_pm_sync_username after update of username on public.profiles
for each row execute function public.nika_pm_sync_username();

-- 6c · Reparar los 9 mensajes de "eugeniorauldalmeida" (ahora "rol")
update public.private_messages m set sender_id = p.id, from_username = p.username
  from public.profiles p where lower(p.username) = 'rol' and lower(m.from_username) = 'eugeniorauldalmeida';
update public.private_messages m set receiver_id = p.id, to_username = p.username
  from public.profiles p where lower(p.username) = 'rol' and lower(m.to_username) = 'eugeniorauldalmeida';
-- debe dar 0:
select count(*) as sin_uuid from public.private_messages where sender_id is null or receiver_id is null;
