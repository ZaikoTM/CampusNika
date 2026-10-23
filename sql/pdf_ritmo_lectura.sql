-- Tiempo estimado de lectura (Lector NikaMed + sala de materiales).
-- Ejecutar una vez en el SQL Editor de Supabase (es re-ejecutable). Sin esto el sitio sigue andando:
-- el ritmo se guarda solo en el navegador y no hay promedio de la comunidad.

-- 1) Ritmo propio: segundos activos por página, por usuario y archivo (se sincroniza entre dispositivos)
create table if not exists public.pdf_ritmo (
    user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
    file_id    text not null,
    segs       jsonb not null default '{}',     -- { "pagina": segundos }
    updated_at timestamptz not null default now(),
    primary key (user_id, file_id)
);
alter table public.pdf_ritmo enable row level security;
drop policy if exists pdf_ritmo_own on public.pdf_ritmo;
create policy pdf_ritmo_own on public.pdf_ritmo for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.pdf_ritmo from anon;
grant select, insert, update, delete on public.pdf_ritmo to authenticated;

-- 2) Promedio de la comunidad por archivo: solo agregados, sin ningún dato personal
create table if not exists public.pdf_ritmo_comunidad (
    file_id        text primary key,
    total_paginas  int,
    segs_total     bigint not null default 0,
    paginas        bigint not null default 0,
    aportes        int    not null default 0,
    updated_at     timestamptz not null default now()
);
alter table public.pdf_ritmo_comunidad enable row level security;
drop policy if exists pdf_ritmo_comunidad_leer on public.pdf_ritmo_comunidad;
create policy pdf_ritmo_comunidad_leer on public.pdf_ritmo_comunidad for select to authenticated using (true);
revoke all on public.pdf_ritmo_comunidad from anon;
grant select on public.pdf_ritmo_comunidad to authenticated;

-- 3) Aporte anonimizado (con tope por llamada para que nadie distorsione el promedio)
create or replace function public.pdf_ritmo_aportar(p_file text, p_segs int, p_pags int, p_total int default null)
returns void language plpgsql security definer set search_path = public as $$
declare
    pags int := least(greatest(coalesce(p_pags, 0), 0), 60);
    segs int := least(greatest(coalesce(p_segs, 0), 0), pags * 600);
begin
    if auth.uid() is null or p_file is null or length(p_file) > 200 or pags = 0 then return; end if;
    insert into public.pdf_ritmo_comunidad as c (file_id, total_paginas, segs_total, paginas, aportes)
    values (p_file, nullif(p_total, 0), segs, pags, 1)
    on conflict (file_id) do update set
        total_paginas = coalesce(nullif(p_total, 0), c.total_paginas),
        segs_total = c.segs_total + excluded.segs_total,
        paginas = c.paginas + excluded.paginas,
        aportes = c.aportes + 1,
        updated_at = now();
end $$;
revoke all on function public.pdf_ritmo_aportar(text, int, int, int) from public, anon;
grant execute on function public.pdf_ritmo_aportar(text, int, int, int) to authenticated;

-- 4) Lectura por día (meta diaria y racha de lectura)
create table if not exists public.pdf_lectura_dia (
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    dia     date not null,
    segs    int  not null default 0,
    primary key (user_id, dia)
);
alter table public.pdf_lectura_dia enable row level security;
drop policy if exists pdf_lectura_dia_own on public.pdf_lectura_dia;
create policy pdf_lectura_dia_own on public.pdf_lectura_dia for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.pdf_lectura_dia from anon;
grant select, insert, update, delete on public.pdf_lectura_dia to authenticated;

select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('pdf_ritmo', 'pdf_ritmo_comunidad', 'pdf_lectura_dia');
