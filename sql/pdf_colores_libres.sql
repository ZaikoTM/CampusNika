-- Colores libres en el Lector NikaMed (paleta de favoritos).
-- La tabla pdf_subrayados solo aceptaba 4 colores con nombre (amarillo, verde, rosa, azul).
-- Ahora el lector guarda también colores en formato #rrggbb: hay que sacar esa restricción.
-- Ejecutar una sola vez en el SQL Editor de Supabase (es re-ejecutable).
-- Sin esto el sitio sigue andando: los 4 colores clásicos se guardan igual, y los colores nuevos quedan solo en ese dispositivo.

alter table public.pdf_subrayados drop constraint if exists pdf_subrayados_color_check;

-- Nueva regla: un nombre clásico o un color hexadecimal de 6 dígitos
alter table public.pdf_subrayados add constraint pdf_subrayados_color_check
    check (color in ('amarillo', 'verde', 'rosa', 'azul') or color ~* '^#[0-9a-f]{6}$');

-- Verificación: debe devolver la regla nueva
select conname, pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'public.pdf_subrayados'::regclass and contype = 'c';
