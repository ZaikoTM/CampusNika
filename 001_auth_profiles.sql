-- ============================================================
-- CAMPUS NIKA — Fase A.2: Supabase Auth completo
-- Migración 001: tabla profiles + RLS + trigger
-- ------------------------------------------------------------
-- Ejecutar en el SQL Editor de Supabase (proyecto pswjmouuyaxueaqqglko)
-- ============================================================

-- 1. Tabla de perfiles públicos, 1:1 con auth.users
--    (auth.users es privada y gestionada por Supabase; acá guardamos
--    todo lo que hoy vive en localStorage: username, fullname, avatar, role)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    fullname text not null,
    email text not null,
    avatar text,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);
-- Nota sobre "email" duplicada acá (ya vive en auth.users, privada):
-- la copiamos a profiles porque el login acepta username O email, y para
-- resolver "username -> email" antes de llamar a signInWithPassword
-- necesitamos poder LEERLA con una policy pública controlada (ver abajo),
-- cosa que auth.users nunca permite.

-- Índice para búsquedas case-insensitive por username (login por username)
create unique index if not exists profiles_username_lower_idx
    on public.profiles (lower(username));

-- 2. Row Level Security
alter table public.profiles enable row level security;

-- Nadie puede leer la tabla profiles completa directamente (bloquea
-- enumeración de emails). El directorio/amigos/versus deben leer desde
-- la vista profiles_public (sin email) creada más abajo. Cada usuario sí
-- puede leer su propia fila completa (incluido su email).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
    on public.profiles for select
    to authenticated
    using (auth.uid() = id);

-- Un usuario solo puede insertar SU PROPIO perfil (el trigger de abajo lo
-- hace automáticamente, pero dejamos la policy por si se llama desde el cliente)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
    on public.profiles for insert
    to authenticated
    with check (auth.uid() = id);

-- Un usuario solo puede actualizar SU PROPIO perfil (fullname, avatar).
-- El campo "role" NO se puede tocar desde acá (ver policy siguiente).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- 3. Trigger: al crear un usuario en auth.users (supabase.auth.signUp),
--    crear automáticamente su fila en profiles usando los datos que
--    mandamos en options.data del signUp (fullname, username, avatar).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, username, fullname, avatar, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'fullname', new.email),
        new.raw_user_meta_data->>'avatar',
        'user'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 4. Vista pública SIN email, para directorio de usuarios / amigos / versus.
--    Esto es lo que el resto de la app (fuera del login) debe consultar.
create or replace view public.profiles_public as
    select id, username, fullname, avatar, role
    from public.profiles;

grant select on public.profiles_public to authenticated, anon;

-- 5. Función RPC: resuelve username -> email SOLO para el paso de login,
--    sin exponer la tabla completa. security definer = corre con permisos
--    elevados, pero solo devuelve un email (no filas enteras), y solo si
--    el username existe.
create or replace function public.resolve_email_by_username(p_username text)
returns text
language sql
security definer set search_path = public
as $$
    select email from public.profiles where lower(username) = lower(p_username) limit 1;
$$;

-- Se puede invocar sin estar logueado (es el paso previo al login)
grant execute on function public.resolve_email_by_username(text) to anon, authenticated;

-- 6. (Opcional pero recomendado) Rate limiting nativo de Supabase Auth:
--    Authentication → Rate Limits en el dashboard. Los valores por defecto
--    ya limitan intentos de login/signup por IP; ajustalos ahí, no hay
--    SQL para esto.
