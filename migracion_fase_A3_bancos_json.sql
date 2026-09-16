-- ============================================================
-- CAMPUS NIKA — Fase A.3: Gestor Dinámico de Bancos JSON Multi-Área
-- Migración para public.bancos_json (proyecto pswjmouuyaxueaqqglko)
-- Idempotente: se puede correr más de una vez sin romper nada.
-- Ejecutar en Supabase → SQL Editor.
-- ============================================================

-- 0. Extensión necesaria para gen_random_uuid() (normalmente ya está
--    habilitada por defecto en Supabase; el IF NOT EXISTS la hace inofensiva).
create extension if not exists pgcrypto;

-- 1. Tabla base (si ya existía de la Fase A con otro shape, este CREATE
--    no la toca; los ALTER de abajo completan lo que falte).
create table if not exists public.bancos_json (
    id uuid primary key default gen_random_uuid(),
    modulo text not null,
    up_id text not null,
    data jsonb not null,
    actualizado_por uuid references public.profiles(id),
    updated_at timestamptz not null default now()
);

-- 2. Columnas exigidas por la Fase A.3, por si la tabla ya existía
--    con un subconjunto distinto.
alter table public.bancos_json add column if not exists modulo text;
alter table public.bancos_json add column if not exists up_id text;
alter table public.bancos_json add column if not exists data jsonb;
alter table public.bancos_json add column if not exists actualizado_por uuid references public.profiles(id);
alter table public.bancos_json add column if not exists updated_at timestamptz not null default now();

-- 3. Restricción única (modulo, up_id): es la que permite el upsert
--    "insertar o actualizar" desde guardarBancoJSON() en supabaseClient.js.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'bancos_json_modulo_up_id_key'
    ) then
        alter table public.bancos_json
            add constraint bancos_json_modulo_up_id_key unique (modulo, up_id);
    end if;
end $$;

-- 4. Trigger para mantener updated_at al día en cada UPDATE
--    (el upsert de Postgres, al chocar con la unique, dispara un UPDATE).
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bancos_json_updated_at on public.bancos_json;
create trigger trg_bancos_json_updated_at
    before update on public.bancos_json
    for each row execute function public.set_updated_at();

-- 5. RLS: lectura pública (el simulador y el modo demo sin login consultan
--    bancos_json), escritura (insert/update) restringida a is_admin(),
--    reutilizando la función ya creada en la Fase A.
alter table public.bancos_json enable row level security;

drop policy if exists "bancos_json_select_public" on public.bancos_json;
create policy "bancos_json_select_public"
    on public.bancos_json for select
    using (true);

drop policy if exists "bancos_json_insert_admin" on public.bancos_json;
create policy "bancos_json_insert_admin"
    on public.bancos_json for insert
    with check (public.is_admin());

drop policy if exists "bancos_json_update_admin" on public.bancos_json;
create policy "bancos_json_update_admin"
    on public.bancos_json for update
    using (public.is_admin())
    with check (public.is_admin());

-- ============================================================
-- Verificación rápida post-migración (opcional, correr aparte):
-- select conname from pg_constraint where conrelid = 'public.bancos_json'::regclass;
-- select policyname, cmd from pg_policies where tablename = 'bancos_json';
-- ============================================================
