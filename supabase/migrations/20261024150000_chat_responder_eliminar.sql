-- Chat privado: responder a un mensaje y eliminar (solo para mí / para todos). Idempotente.
--  * reply_to / reply_de / reply_texto: el mensaje al que se responde (se guarda una copia corta del texto).
--  * deleted_at: mensaje eliminado para todos (queda el aviso «Mensaje eliminado»; el texto se borra).
--  * hidden_for: usuarios que lo eliminaron solo para ellos.
-- El historial sigue sin política de DELETE: eliminar siempre pasa por nika_pm_borrar().

alter table public.private_messages add column if not exists reply_to    uuid references public.private_messages(id) on delete set null;
alter table public.private_messages add column if not exists reply_de    text;
alter table public.private_messages add column if not exists reply_texto text;
alter table public.private_messages add column if not exists deleted_at  timestamptz;
alter table public.private_messages add column if not exists hidden_for  uuid[] not null default '{}';

-- El guard de UPDATE deja pasar solo los cambios que hace nika_pm_borrar()
create or replace function public.nika_pm_before_update() returns trigger
language plpgsql as $$
begin
    if coalesce(current_setting('nika.pm_borrar', true), '') = '1' then
        return new;
    end if;
    if (new.content, new.shared_question, new.created_at, new.reply_to, new.reply_de, new.reply_texto, new.deleted_at, new.hidden_for)
       is distinct from (old.content, old.shared_question, old.created_at, old.reply_to, old.reply_de, old.reply_texto, old.deleted_at, old.hidden_for)
       or (old.sender_id   is not null and new.sender_id   is distinct from old.sender_id)
       or (old.receiver_id is not null and new.receiver_id is distinct from old.receiver_id) then
        raise exception 'solo se puede marcar entregado/leido' using errcode = '42501';
    end if;
    return new;
end $$;

-- Eliminar: p_todos = true  -> solo quien lo envió; se borra el texto para ambos
--           p_todos = false -> cualquiera de los dos lo oculta solo para sí
create or replace function public.nika_pm_borrar(p_id uuid, p_todos boolean default false)
returns boolean
language plpgsql security definer set search_path = public as $$
declare yo uuid := auth.uid(); m public.private_messages%rowtype;
begin
    if yo is null then raise exception 'sin sesion' using errcode = '42501'; end if;
    select * into m from public.private_messages where id = p_id;
    if not found or yo not in (m.sender_id, m.receiver_id) then
        raise exception 'mensaje inexistente' using errcode = '42501';
    end if;
    perform set_config('nika.pm_borrar', '1', true);
    if p_todos then
        if yo <> m.sender_id then raise exception 'solo quien lo envio puede eliminarlo para todos' using errcode = '42501'; end if;
        update public.private_messages
           set deleted_at = coalesce(deleted_at, now()), content = '', shared_question = null,
               reply_texto = null, read_at = coalesce(read_at, now())
         where id = p_id;
    else
        update public.private_messages set hidden_for = array_append(hidden_for, yo)
         where id = p_id and not (yo = any(hidden_for));
    end if;
    return true;
end $$;
revoke all on function public.nika_pm_borrar(uuid, boolean) from public, anon;
grant execute on function public.nika_pm_borrar(uuid, boolean) to authenticated;


notify pgrst, 'reload schema';
