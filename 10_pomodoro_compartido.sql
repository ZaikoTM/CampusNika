-- =====================================================================
-- CAMPUS NIKA · Pomodoro compartido: que el tiempo se acredite a LOS DOS
-- Ejecutá cada bloque por separado (seleccioná solo ese bloque y Run).
--
-- Problema: cada persona registraba SU sesión cuando le llegaba el aviso en vivo del fin de fase. Si el
-- invitado tenía la pestaña en otra página o figuraba "sin conexión", ese aviso no llegaba y solo se le
-- sumaba el tiempo al anfitrión. Ahora el anfitrión también acredita al invitado; una clave única evita
-- que se cuente dos veces si el invitado igual lo registra por su cuenta.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BLOQUE 1 · Clave de sesión compartida (anti-duplicado) en study_sessions
-- ---------------------------------------------------------------------
alter table public.study_sessions add column if not exists shared_key text;
create unique index if not exists study_sessions_shared_key_uq
    on public.study_sessions (user_id, shared_key) where shared_key is not null;

-- ---------------------------------------------------------------------
-- BLOQUE 2 · El anfitrión acredita al invitado (solo entre amigos confirmados)
-- Devuelve true si se creó la sesión, false si ya existía o los datos no son válidos.
-- ---------------------------------------------------------------------
create or replace function public.nika_acreditar_sesion_compartida(
    p_invitado text, p_modulo text, p_up text, p_minutos integer, p_completed boolean, p_key text
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
    v_inv uuid;
    v_n integer;
begin
    if auth.uid() is null then raise exception 'sin sesion'; end if;
    v_inv := (select id from public.profiles where lower(username) = lower(p_invitado) limit 1);
    if v_inv is null or v_inv = auth.uid() then return false; end if;
    if p_minutos is null or p_minutos < 1 or p_minutos > 180 then return false; end if;
    if p_key is null or length(p_key) > 120 or p_modulo is null or p_up is null then return false; end if;
    if not exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and ((f.requester_id = auth.uid() and f.addressee_id = v_inv)
            or (f.requester_id = v_inv and f.addressee_id = auth.uid()))
    ) then
        raise exception 'no son amigos';
    end if;

    insert into public.study_sessions (user_id, modulo, up_id, duration_minutes, completed_at, shared_key)
    values (v_inv, p_modulo, p_up, p_minutos, now(), p_key)
    on conflict (user_id, shared_key) where shared_key is not null do nothing;
    get diagnostics v_n = row_count;

    -- Si la tabla tiene la columna "completed", se marca según la fase
    if v_n > 0 and exists (select 1 from information_schema.columns
                           where table_schema = 'public' and table_name = 'study_sessions' and column_name = 'completed') then
        execute 'update public.study_sessions set completed = $1 where user_id = $2 and shared_key = $3'
            using coalesce(p_completed, true), v_inv, p_key;
    end if;
    return v_n > 0;
end $$;

revoke all on function public.nika_acreditar_sesion_compartida(text, text, text, integer, boolean, text) from public, anon;
grant execute on function public.nika_acreditar_sesion_compartida(text, text, text, integer, boolean, text) to authenticated;

-- ---------------------------------------------------------------------
-- OPCIONAL · Recuperar la sesión de hoy que no se le acreditó a Euge
-- Primero mirá qué se va a copiar (solo lectura):
-- ---------------------------------------------------------------------
-- select s.modulo, s.up_id, s.duration_minutes, s.completed_at
-- from public.study_sessions s
-- where s.user_id = (select id from public.profiles where lower(username) = 'aguswei7')
-- order by s.completed_at desc limit 3;

-- Si la primera fila es la sesión compartida, copiala a Euge (cambiá el username si hace falta):
-- insert into public.study_sessions (user_id, modulo, up_id, duration_minutes, completed_at)
-- select (select id from public.profiles where lower(username) = 'eugeniorauldalmeida'),
--        s.modulo, s.up_id, s.duration_minutes, s.completed_at
-- from public.study_sessions s
-- where s.user_id = (select id from public.profiles where lower(username) = 'aguswei7')
-- order by s.completed_at desc limit 1;
