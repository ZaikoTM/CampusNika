-- ============================================================================
-- NikaPlay — parche 1: salas abandonadas.
--  * Al salir en plena partida el jugador "abandona": queda con 0 puntos y la sala se cierra apenas terminan los demás.
--  * Una sala en juego se puede cerrar a la fuerza cuando pasa su tiempo máximo (reloj total + 2 min), no a los 30 minutos.
--  * nikaplay_limpiar_salas(): cierra las salas vencidas y cancela las que quedaron en espera más de 2 horas.
--  * Si la extensión pg_cron está activa, la limpieza queda programada cada 5 minutos.
-- Ejecutar una vez en el SQL Editor, DESPUÉS de sql/nikaplay.sql (re-ejecutable). Si ya ejecutaste el archivo principal
-- actualizado, este parche igual se puede correr: vuelve a crear las mismas funciones.
-- ============================================================================

-- Tiempo máximo de una partida en sala: reloj total (n × segundos por término) + 2 minutos de margen.
create or replace function public.np_limite_sala(p_config jsonb)
returns interval language sql immutable as $$
  select make_interval(secs => coalesce((p_config ->> 'n')::int, 5) * case when p_config ->> 'ritmo' = 'intenso' then 30 else 45 end + 120)
$$;

create or replace function public.nikaplay_cerrar_sala(p_sala uuid, p_forzar boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
  s public.nikaplay_salas%rowtype; j record; r record; v_total integer; v_pend integer; v_pos integer := 0;
  v_tipo text; v_elo_i integer; v_elo_r integer; v_k integer; v_esp numeric; v_real numeric; v_suma numeric; v_delta integer; v_xp integer; v_gano boolean;
begin
  select * into s from public.nikaplay_salas where id = p_sala for update;
  if not found or s.estado <> 'jugando' then return; end if;
  select count(*), count(*) filter (where terminado_at is null) into v_total, v_pend from public.nikaplay_sala_jugadores where sala_id = p_sala;
  if v_pend > 0 and not (p_forzar and now() > s.inicio_at + public.np_limite_sala(s.config)) then return; end if;

  -- quien no envió resultado queda en 0 puntos
  update public.nikaplay_sala_jugadores set puntos = 0, aciertos = 0, errores = 0, tiempo_ms = 0 where sala_id = p_sala and puntos is null;

  -- posiciones: más puntos, luego menos tiempo
  for j in select user_id from public.nikaplay_sala_jugadores where sala_id = p_sala order by puntos desc, tiempo_ms asc, unido_at asc loop
    v_pos := v_pos + 1;
    update public.nikaplay_sala_jugadores set posicion = v_pos where sala_id = p_sala and user_id = j.user_id;
  end loop;

  for j in select * from public.nikaplay_sala_jugadores where sala_id = p_sala loop
    perform public.np_asegurar(j.user_id, s.juego);
    v_xp := 30 + least(60, j.puntos / 10) + case when j.posicion = 1 then 25 else 0 end;
    if s.puntuable and v_total >= 2 then
      foreach v_tipo in array array[s.juego, 'general'] loop
        select elo, case when partidas < 10 then 40 else 24 end into v_elo_i, v_k from public.nikaplay_elo where user_id = j.user_id and juego = v_tipo;
        v_suma := 0;
        for r in select user_id, puntos, tiempo_ms from public.nikaplay_sala_jugadores where sala_id = p_sala and user_id <> j.user_id loop
          select elo into v_elo_r from public.nikaplay_elo where user_id = r.user_id and juego = v_tipo;
          v_elo_r := coalesce(v_elo_r, 1000);
          v_esp := 1 / (1 + power(10, (v_elo_r - v_elo_i) / 400.0));
          v_real := case when j.puntos > r.puntos then 1 when j.puntos < r.puntos then 0
                         when j.tiempo_ms < r.tiempo_ms then 1 when j.tiempo_ms > r.tiempo_ms then 0 else 0.5 end;
          v_suma := v_suma + (v_real - v_esp);
        end loop;
        v_delta := round(v_k * v_suma / greatest(v_total - 1, 1));
        v_gano := j.posicion = 1;
        if v_tipo = s.juego then
          update public.nikaplay_sala_jugadores set elo_antes = v_elo_i, elo_despues = greatest(0, v_elo_i + v_delta) where sala_id = p_sala and user_id = j.user_id;
        end if;
      end loop;
    end if;
    update public.nikaplay_sala_jugadores set xp_ganada = v_xp where sala_id = p_sala and user_id = j.user_id;
  end loop;

  -- segundo paso: aplicar los ELO del juego y generales de forma consistente (calculados con los valores previos)
  if s.puntuable and v_total >= 2 then
    for j in select * from public.nikaplay_sala_jugadores where sala_id = p_sala loop
      v_gano := j.posicion = 1;
      update public.nikaplay_elo e set
        elo = coalesce(j.elo_despues, e.elo), pico = greatest(e.pico, coalesce(j.elo_despues, e.elo)), partidas = e.partidas + 1,
        victorias = e.victorias + case when v_gano then 1 else 0 end, derrotas = e.derrotas + case when v_gano then 0 else 1 end,
        racha = case when v_gano then greatest(e.racha, 0) + 1 else least(e.racha, 0) - 1 end, actualizado_at = now()
      where e.user_id = j.user_id and e.juego = s.juego;
      -- ELO general: mismo desplazamiento que el del juego (simplificación documentada; ver comentario al final del archivo)
      update public.nikaplay_elo e set
        elo = greatest(0, e.elo + (coalesce(j.elo_despues, 0) - coalesce(j.elo_antes, 0))), pico = greatest(e.pico, greatest(0, e.elo + (coalesce(j.elo_despues, 0) - coalesce(j.elo_antes, 0)))),
        partidas = e.partidas + 1, victorias = e.victorias + case when v_gano then 1 else 0 end, derrotas = e.derrotas + case when v_gano then 0 else 1 end,
        racha = case when v_gano then greatest(e.racha, 0) + 1 else least(e.racha, 0) - 1 end, actualizado_at = now()
      where e.user_id = j.user_id and e.juego = 'general';
    end loop;
  end if;
  for j in select user_id, xp_ganada from public.nikaplay_sala_jugadores where sala_id = p_sala loop
    perform public.np_dar_xp(j.user_id, j.xp_ganada);
  end loop;
  update public.nikaplay_salas set estado = 'fin', fin_at = now() where id = p_sala;
end $$;

create or replace function public.nikaplay_abandonar_sala(p_sala uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not exists (select 1 from public.nikaplay_salas where id = p_sala and estado = 'jugando') then return; end if;
  update public.nikaplay_sala_jugadores set puntos = 0, aciertos = 0, errores = 0, tiempo_ms = 0, terminado_at = now()
   where sala_id = p_sala and user_id = v_uid and terminado_at is null;
  perform public.nikaplay_cerrar_sala(p_sala, false);
end $$;

create or replace function public.nikaplay_limpiar_salas()
returns integer language plpgsql security definer set search_path = public as $$
declare s record; v_n integer := 0;
begin
  for s in select id from public.nikaplay_salas where estado = 'jugando' and inicio_at + public.np_limite_sala(config) < now() loop
    perform public.nikaplay_cerrar_sala(s.id, true); v_n := v_n + 1;
  end loop;
  update public.nikaplay_salas set estado = 'cancelada', fin_at = now() where estado = 'espera' and creada_at < now() - interval '2 hours';
  return v_n;
end $$;

-- permisos
revoke all on function public.nikaplay_abandonar_sala(uuid) from public, anon;
grant execute on function public.nikaplay_abandonar_sala(uuid) to authenticated;
revoke all on function public.nikaplay_limpiar_salas() from public, anon, authenticated;     -- solo el servidor (cron) o el administrador
revoke all on function public.np_limite_sala(jsonb) from public, anon;
grant execute on function public.np_limite_sala(jsonb) to authenticated;
revoke all on function public.nikaplay_cerrar_sala(uuid, boolean) from public, anon;
grant execute on function public.nikaplay_cerrar_sala(uuid, boolean) to authenticated;

-- limpieza automática cada 5 minutos (solo si pg_cron está habilitado en tu proyecto: Database > Extensions)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'nikaplay_limpiar_salas';
    perform cron.schedule('nikaplay_limpiar_salas', '*/5 * * * *', 'select public.nikaplay_limpiar_salas()');
  else
    raise notice 'pg_cron no está activo: la limpieza se dispara igual desde los clientes conectados a la sala.';
  end if;
end $$;
