-- Novedades en tiempo real: habilita el aviso (banner + badge) al publicar una novedad.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'novedades') then
    alter publication supabase_realtime add table public.novedades;
  end if;
end $$;
