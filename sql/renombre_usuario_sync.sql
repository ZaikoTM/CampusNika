-- =====================================================================
-- CAMPUS NIKA · Que un cambio de @usuario no rompa nada  (PROPUESTA: NO EJECUTADO)
-- Ejecutá cada bloque por separado, sin copiar líneas de comentario sueltas.
--
-- Auditoría: casi todo se identifica por UUID (study_sessions, calendario, exámenes, foro, friendships...) y no se rompe.
-- Se rompen las tablas que guardan el @usuario como TEXTO sin uuid:
--   versus_players.username   -> al renombrarse se crea un jugador NUEVO con ELO inicial y se pierde el historial/ranking
--   versus_answers.username, versus_badges.username, versus_history.winner_username (confirmadas con el diagnóstico)
--   versus_rooms.host_username / guest_username / winner_username, versus_queue.username,
--   versus_challenges.from_username / to_username, erratas.reporter_username
-- (private_messages ya se sincroniza con nika_pm_sync_username, ver private_messages_historial.sql, Bloque 6.)
--
-- Se usa un solo trigger en profiles que actualiza TODAS esas columnas. Solo toca tablas/columnas que existan,
-- así que no falla si alguna no está en tu base.
-- =====================================================================

-- BLOQUE 1 · Diagnóstico (solo lectura): ¿qué columnas de usuario-como-texto existen de verdad?
-- select table_name, column_name, data_type from information_schema.columns
-- where table_schema = 'public'
--   and (column_name like '%username%' or column_name in ('autor','author','usuario'))
--   and table_name <> 'profiles'
-- order by 1, 2;

-- BLOQUE 2 · Función + trigger de sincronización
create or replace function public.nika_sync_username_rename() returns trigger
language plpgsql security definer set search_path = public as $$
declare
    pares text[][] := array[
        ['versus_players','username'],
        ['versus_rooms','host_username'], ['versus_rooms','guest_username'], ['versus_rooms','winner_username'],
        ['versus_queue','username'],
        ['versus_challenges','from_username'], ['versus_challenges','to_username'],
        ['versus_answers','username'], ['versus_badges','username'], ['versus_history','winner_username'],
        ['erratas','reporter_username']
    ];
    i int;
begin
    if new.username is not distinct from old.username or old.username is null then return new; end if;
    for i in 1 .. array_length(pares, 1) loop
        if exists (select 1 from information_schema.columns
                   where table_schema = 'public' and table_name = pares[i][1] and column_name = pares[i][2]) then
            execute format('update public.%I set %I = $1 where lower(%I) = lower($2)', pares[i][1], pares[i][2], pares[i][2])
                using new.username, old.username;
        end if;
    end loop;
    return new;
end $$;

drop trigger if exists nika_sync_username_rename on public.profiles;
create trigger nika_sync_username_rename after update of username on public.profiles
for each row execute function public.nika_sync_username_rename();

-- BLOQUE 3 · Reparar renombres ya ocurridos (ejemplo: Eugenio pasó de eugeniorauldalmeida a rol).
-- Si "rol" ya jugó algo y creó un jugador nuevo en versus_players, primero mirá qué hay:
-- select * from public.versus_players where lower(username) in ('eugeniorauldalmeida', 'rol');
-- Si solo existe la fila vieja, este update la pasa al nombre nuevo (si existen las DOS filas, avisame antes de correrlo):
-- update public.versus_players set username = 'rol' where lower(username) = 'eugeniorauldalmeida';
