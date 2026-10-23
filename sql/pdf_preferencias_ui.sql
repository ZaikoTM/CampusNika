-- Preferencias de interfaz del Lector NikaMed en la cuenta: tamaño de la barra, ocultar al bajar,
-- barra vertical flotante y su posición. Ejecutar una sola vez en el SQL Editor de Supabase (es re-ejecutable).
-- Sin esto el lector sigue andando y guarda igual los colores y el tamaño del pincel; estas preferencias quedan solo en cada navegador.

alter table public.pdf_preferencias add column if not exists ui jsonb;

select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'pdf_preferencias' order by ordinal_position;
