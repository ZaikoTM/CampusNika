-- Preferencias del Lector NikaMed guardadas en la cuenta (se sincronizan entre todos los dispositivos):
-- los 6 colores favoritos (con su intensidad, brillo y opacidad) y el tamaño del pincel.
-- Ejecutar una sola vez en el SQL Editor de Supabase (es re-ejecutable).
-- Sin esto el sitio sigue andando: las preferencias quedan solo en el navegador.

create table if not exists public.pdf_preferencias (
    user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
    favs       jsonb,                    -- ["#rrggbb" x 6]: colores favoritos ya calculados
    cfg        jsonb,                    -- [{b,o,s,l} x 6]: color base y ajustes de opacidad, intensidad y brillo
    tam        int check (tam is null or (tam between 2 and 120)),
    updated_at timestamptz not null default now()
);

alter table public.pdf_preferencias enable row level security;
drop policy if exists pdf_preferencias_own on public.pdf_preferencias;
create policy pdf_preferencias_own on public.pdf_preferencias for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.pdf_preferencias from anon;
grant select, insert, update, delete on public.pdf_preferencias to authenticated;

select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = 'pdf_preferencias';
