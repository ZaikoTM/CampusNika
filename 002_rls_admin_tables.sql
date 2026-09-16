-- ============================================================
-- CAMPUS NIKA — Fase A.1: Tablas de Admin + RBAC
-- Migración 002 — requiere que 001_auth_profiles.sql ya esté aplicada
-- ------------------------------------------------------------
-- Estructura tomada del uso real en index.html:
--   - erratas: reportadas por usuarios, con status pending/fixed/rejected
--   - bancos_json: banco de preguntas por unidad (UP), subido por admin
--   - novedades: anuncios globales del admin (feed de "N novedades")
-- ============================================================

-- Función helper reutilizable: ¿el usuario logueado es admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
    select exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    );
$$;

-- ============================================================
-- 1. TABLA: erratas
-- ============================================================
create table if not exists public.erratas (
    id uuid primary key default gen_random_uuid(),
    reporter_id uuid not null references public.profiles(id) on delete cascade,
    reporter_username text not null,           -- copia denormalizada, evita join para listar
    question_text text not null,                -- antes "q"
    justification text not null,                 -- antes "justif"
    status text not null default 'pending' check (status in ('pending', 'fixed', 'rejected')),
    created_at timestamptz not null default now(),
    resolved_at timestamptz
);

alter table public.erratas enable row level security;

drop policy if exists "erratas_select_authenticated" on public.erratas;
create policy "erratas_select_authenticated"
    on public.erratas for select
    to authenticated
    using (true);

drop policy if exists "erratas_insert_own" on public.erratas;
create policy "erratas_insert_own"
    on public.erratas for insert
    to authenticated
    with check (auth.uid() = reporter_id);

drop policy if exists "erratas_update_admin" on public.erratas;
create policy "erratas_update_admin"
    on public.erratas for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "erratas_delete_admin" on public.erratas;
create policy "erratas_delete_admin"
    on public.erratas for delete
    to authenticated
    using (public.is_admin());

-- ============================================================
-- 2. TABLA: bancos_json (banco de preguntas por Unidad Problema)
-- ============================================================
create table if not exists public.bancos_json (
    id uuid primary key default gen_random_uuid(),
    unit_code text not null unique,              -- ej: '06', '07' ... '11'
    questions jsonb not null,
    question_count int generated always as (jsonb_array_length(questions)) stored,
    uploaded_by uuid references public.profiles(id),
    updated_at timestamptz not null default now()
);

alter table public.bancos_json enable row level security;

drop policy if exists "bancos_json_select_authenticated" on public.bancos_json;
create policy "bancos_json_select_authenticated"
    on public.bancos_json for select
    to authenticated
    using (true);

drop policy if exists "bancos_json_insert_admin" on public.bancos_json;
create policy "bancos_json_insert_admin"
    on public.bancos_json for insert
    to authenticated
    with check (public.is_admin());

drop policy if exists "bancos_json_update_admin" on public.bancos_json;
create policy "bancos_json_update_admin"
    on public.bancos_json for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "bancos_json_delete_admin" on public.bancos_json;
create policy "bancos_json_delete_admin"
    on public.bancos_json for delete
    to authenticated
    using (public.is_admin());

-- ============================================================
-- 3. TABLA: novedades (anuncios globales del admin)
-- ============================================================
create table if not exists public.novedades (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

alter table public.novedades enable row level security;

drop policy if exists "novedades_select_authenticated" on public.novedades;
create policy "novedades_select_authenticated"
    on public.novedades for select
    to authenticated
    using (true);

drop policy if exists "novedades_insert_admin" on public.novedades;
create policy "novedades_insert_admin"
    on public.novedades for insert
    to authenticated
    with check (public.is_admin());

drop policy if exists "novedades_update_admin" on public.novedades;
create policy "novedades_update_admin"
    on public.novedades for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "novedades_delete_admin" on public.novedades;
create policy "novedades_delete_admin"
    on public.novedades for delete
    to authenticated
    using (public.is_admin());

-- ============================================================
-- NOTA IMPORTANTE (no requiere acción SQL, es un aviso):
-- Crear estas tablas NO migra automáticamente initMockErratas(),
-- adminProcessQuestionBankUpload() ni adminPublishNews() en index.html —
-- esas funciones van a seguir escribiendo en localStorage hasta que
-- reescribamos ese JS para que hable con estas tablas (igual que hicimos
-- con el login). Avisame cuando quieras encarar esa parte.
-- ============================================================
