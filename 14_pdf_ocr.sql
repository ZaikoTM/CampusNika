-- ============================================================
-- CAMPUS NIKA · Texto OCR compartido para PDF escaneados (js/estudio/pdfOcr.js)
-- ------------------------------------------------------------
-- Los PDF de Drive que son escaneos no traen capa de texto. El archivo de Drive NO se modifica nunca:
-- el texto reconocido (OCR) se guarda acá, lo genera un administrador una sola vez y lo reciben todos.
--   · pdf_ocr_estado  : una fila por PDF (en qué estado está su OCR y cuántas páginas lleva).
--   · pdf_ocr_paginas : una fila por página, con las líneas y las palabras reconocidas y su posición.
-- Escribe solo is_admin() (002_rls_admin_tables.sql); leen todos los usuarios con sesión.
-- Se ejecuta una vez en el SQL Editor de Supabase. Es seguro repetirlo.
-- ============================================================

create table if not exists public.pdf_ocr_estado (
    file_id        text primary key,                    -- id del archivo en Drive
    titulo         text,
    total_paginas  int,
    paginas_ok     int not null default 0,
    estado         text not null default 'pendiente' check (estado in ('pendiente','procesando','pausado','listo','error')),
    con_texto      boolean,                              -- false = es un escaneo sin texto
    motor          text,
    conf_media     real,                                 -- confianza media del OCR de todo el PDF (0–100): permite detectar los de baja calidad
    actualizado_por uuid default auth.uid(),
    updated_at     timestamptz not null default now()
);

create table if not exists public.pdf_ocr_paginas (
    file_id    text not null,
    pagina     int  not null check (pagina >= 1),
    lineas     jsonb not null,                           -- [{ y:[arriba,abajo], w:[[palabra,x0,x1],…] }] en coordenadas relativas 0–1
    conf       real,                                     -- confianza media del reconocimiento (0–100)
    created_at timestamptz not null default now(),
    primary key (file_id, pagina)
);

-- por si la tabla ya existía de una ejecución anterior
alter table public.pdf_ocr_estado add column if not exists conf_media real;

alter table public.pdf_ocr_estado  enable row level security;
alter table public.pdf_ocr_paginas enable row level security;

-- lectura: cualquier usuario con sesión
drop policy if exists "pdf_ocr_estado_select"  on public.pdf_ocr_estado;
create policy "pdf_ocr_estado_select"  on public.pdf_ocr_estado  for select to authenticated using (true);
drop policy if exists "pdf_ocr_paginas_select" on public.pdf_ocr_paginas;
create policy "pdf_ocr_paginas_select" on public.pdf_ocr_paginas for select to authenticated using (true);

-- escritura: solo administradores
drop policy if exists "pdf_ocr_estado_admin"  on public.pdf_ocr_estado;
create policy "pdf_ocr_estado_admin"  on public.pdf_ocr_estado  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "pdf_ocr_paginas_admin" on public.pdf_ocr_paginas;
create policy "pdf_ocr_paginas_admin" on public.pdf_ocr_paginas for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.pdf_ocr_estado, public.pdf_ocr_paginas to authenticated;
grant insert, update, delete on public.pdf_ocr_estado, public.pdf_ocr_paginas to authenticated;   -- las políticas de arriba dejan pasar solo al admin

-- ------------------------------------------------------------
-- Auditoría de la biblioteca (panel admin): qué PDF ya se revisó y con qué resultado, para no repetirlo nunca.
--   resultado: 'texto' (ya trae texto), 'escaneo' (sin texto: va a OCR) u 'omitido' (no es PDF o Drive no lo dejó leer).
-- ------------------------------------------------------------
create table if not exists public.pdf_ocr_auditoria (
    file_id       text primary key,
    titulo        text,
    resultado     text not null check (resultado in ('texto','escaneo','omitido')),
    total_paginas int,
    motivo        text,
    revisado_en   timestamptz not null default now()
);
alter table public.pdf_ocr_auditoria enable row level security;
drop policy if exists "pdf_ocr_auditoria_admin" on public.pdf_ocr_auditoria;
create policy "pdf_ocr_auditoria_admin" on public.pdf_ocr_auditoria for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.pdf_ocr_auditoria to authenticated;   -- la política deja pasar solo al admin
