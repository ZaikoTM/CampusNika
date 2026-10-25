-- ============================================================================
-- NikaPlay — base de datos: perfil de juego, ELO por juego y general, rangos, niveles (XP),
-- historial de partidas, retos por enlace, salas multijugador (con chat y reacciones),
-- invitaciones entre amigos, buscador de usuarios y rankings.
--
-- PROPUESTA PARA REVISAR: no se ejecutó en ninguna base. Es re-ejecutable (create if not exists / create or replace).
-- Ejecutar una vez en el SQL Editor de Supabase, de arriba hacia abajo.
--
-- Principios (mismos que liga_pomodoro.sql):
--  * Las tablas NO aceptan escrituras directas de los clientes para puntos, ELO ni XP: todo pasa por funciones
--    SECURITY DEFINER que validan y calculan en el servidor (el cliente no puede inventarse puntos ni ELO).
--  * Los ids de usuario de las tablas nuevas son uuid (auth.users.id). profiles.id y friendships.* se comparan con ::text
--    porque en esta base no comparten tipo en todas las tablas.
--  * Reutiliza lo que ya existe: public.friendships (status 'pending'/'accepted'), public.user_blocks (blocker_id,
--    blocked_id), public.profiles (username, fullname/full_name/nombre, avatar/avatar_url) y public.nika_notificar().
--  * Los Duelos 1vs1 (versus_*, user_ranking) NO se tocan.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0) Catálogo de juegos (habilita/deshabilita un juego sin tocar el código)
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_juegos (
  clave       text primary key check (clave ~ '^[a-z0-9_]{2,24}$'),
  nombre      text not null,
  habilitado  boolean not null default false,
  multijugador boolean not null default false,
  orden       smallint not null default 0
);
insert into public.nikaplay_juegos (clave, nombre, habilitado, multijugador, orden) values
  ('nikaword',   'NikaWord',   true,  true,  1),
  ('farmamatch', 'FarmaMatch', false, false, 2)
on conflict (clave) do update set nombre = excluded.nombre;   -- no pisa "habilitado" si ya lo cambiaste

-- ---------------------------------------------------------------------------
-- 1) Rangos por ELO (jerarquía médica, coherente con la Liga Pomodoro)
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_rangos (
  clave    text primary key,
  nombre   text not null,
  elo_min  integer not null unique,
  orden    smallint not null,
  color    text not null default '#64748b'
);
insert into public.nikaplay_rangos (clave, nombre, elo_min, orden, color) values
  ('estudiante', 'Estudiante',            0,    1, '#94a3b8'),
  ('ciclo',      'Ciclo Clínico',         1000, 2, '#38bdf8'),
  ('pfo',        'Practicante PFO',       1150, 3, '#22c55e'),
  ('r1',         'Residente R1',          1300, 4, '#eab308'),
  ('r3',         'Residente Superior',    1450, 5, '#f97316'),
  ('jefe',       'Jefe de Residentes',    1600, 6, '#ef4444'),
  ('maestro',    'Maestro Nika',          1800, 7, '#a855f7')
on conflict (clave) do update set nombre = excluded.nombre, elo_min = excluded.elo_min, orden = excluded.orden, color = excluded.color;

create or replace function public.np_rango(p_elo integer)
returns table (clave text, nombre text, orden smallint, color text, siguiente_elo integer)
language sql stable security definer set search_path = public as $$
  select r.clave, r.nombre, r.orden, r.color,
         (select min(r2.elo_min) from public.nikaplay_rangos r2 where r2.elo_min > p_elo)::integer
  from public.nikaplay_rangos r
  where r.elo_min <= coalesce(p_elo, 0)
  order by r.elo_min desc limit 1
$$;

-- Nivel por XP: nivel 1 con 0 XP, 2 con 50, 3 con 200, 4 con 450, ... (nivel = floor(sqrt(xp/50)) + 1)
create or replace function public.np_nivel(p_xp integer)
returns integer language sql immutable as $$ select floor(sqrt(greatest(coalesce(p_xp, 0), 0) / 50.0))::integer + 1 $$;

-- ---------------------------------------------------------------------------
-- 2) Perfil de juego y ELO
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_perfil (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  xp               integer not null default 0 check (xp >= 0),
  nivel            integer not null default 1,
  partidas         integer not null default 0,
  racha_dias       integer not null default 0,
  mejor_racha_dias integer not null default 0,
  ultimo_dia       date,
  creado_at        timestamptz not null default now(),
  actualizado_at   timestamptz not null default now()
);

create table if not exists public.nikaplay_elo (
  user_id    uuid not null references auth.users(id) on delete cascade,
  juego      text not null check (juego ~ '^[a-z0-9_]{2,24}$'),   -- un juego real o 'general'
  elo        integer not null default 1000 check (elo between 0 and 4000),
  pico       integer not null default 1000,
  partidas   integer not null default 0,
  victorias  integer not null default 0,
  derrotas   integer not null default 0,
  empates    integer not null default 0,
  racha      integer not null default 0,        -- >0 victorias seguidas, <0 derrotas seguidas
  actualizado_at timestamptz not null default now(),
  primary key (user_id, juego)
);
create index if not exists nikaplay_elo_ranking_idx on public.nikaplay_elo (juego, elo desc);

-- ---------------------------------------------------------------------------
-- 3) Historial de partidas (solo se escribe vía nikaplay_guardar_partida)
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_partidas (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  juego      text not null references public.nikaplay_juegos(clave),
  n          smallint not null check (n between 1 and 50),
  ritmo      text not null check (ritmo in ('justo', 'intenso', 'libre')),
  puntos     integer not null check (puntos between 0 and 20000),
  aciertos   smallint not null check (aciertos >= 0),
  errores    smallint not null check (errores >= 0),
  tiempo_ms  integer not null default 0 check (tiempo_ms >= 0),
  semilla    bigint,
  reto_id    uuid,
  sala_id    uuid,
  created_at timestamptz not null default now()
);
create index if not exists nikaplay_partidas_user_idx  on public.nikaplay_partidas (user_id, created_at desc);
create index if not exists nikaplay_partidas_rank_idx  on public.nikaplay_partidas (juego, created_at desc, puntos desc);

-- ---------------------------------------------------------------------------
-- 4) Retos por enlace (el que desafía fija la semilla; los amigos juegan los mismos términos)
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_retos (
  id             uuid primary key default gen_random_uuid(),
  creador_id     uuid not null references auth.users(id) on delete cascade,
  juego          text not null references public.nikaplay_juegos(clave),
  semilla        bigint not null,
  n              smallint not null check (n between 1 and 50),
  ritmo          text not null check (ritmo in ('justo', 'intenso', 'libre')),
  puntos_creador integer not null default 0,
  created_at     timestamptz not null default now(),
  expira_at      timestamptz not null default now() + interval '30 days'
);
create table if not exists public.nikaplay_reto_resultados (
  reto_id    uuid not null references public.nikaplay_retos(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  puntos     integer not null,
  created_at timestamptz not null default now(),
  primary key (reto_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 5) Salas multijugador (+ chat y reacciones)
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_salas (
  id            uuid primary key default gen_random_uuid(),
  codigo        text not null unique check (codigo ~ '^[A-Z0-9]{6}$'),
  juego         text not null references public.nikaplay_juegos(clave),
  anfitrion_id  uuid not null references auth.users(id) on delete cascade,
  estado        text not null default 'espera' check (estado in ('espera', 'jugando', 'fin', 'cancelada')),
  config        jsonb not null default '{}'::jsonb,          -- {"n": 5, "ritmo": "justo"}
  semilla       bigint,
  max_jugadores smallint not null default 4 check (max_jugadores between 2 and 8),
  privada       boolean not null default true,                -- privada = solo entra con invitación o código
  puntuable     boolean not null default true,                -- si suma/resta ELO
  creada_at     timestamptz not null default now(),
  inicio_at     timestamptz,
  fin_at        timestamptz
);
create index if not exists nikaplay_salas_estado_idx on public.nikaplay_salas (estado, creada_at desc);

create table if not exists public.nikaplay_sala_jugadores (
  sala_id      uuid not null references public.nikaplay_salas(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  listo        boolean not null default false,
  puntos       integer,
  aciertos     smallint,
  errores      smallint,
  tiempo_ms    integer,
  terminado_at timestamptz,
  posicion     smallint,
  elo_antes    integer,
  elo_despues  integer,
  xp_ganada    integer,
  unido_at     timestamptz not null default now(),
  primary key (sala_id, user_id)
);
create index if not exists nikaplay_sala_jug_user_idx on public.nikaplay_sala_jugadores (user_id, unido_at desc);

create table if not exists public.nikaplay_sala_mensajes (
  id         bigint generated always as identity primary key,
  sala_id    uuid not null references public.nikaplay_salas(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  texto      text not null check (char_length(texto) between 1 and 200),
  created_at timestamptz not null default now()
);
create index if not exists nikaplay_sala_msj_idx on public.nikaplay_sala_mensajes (sala_id, id);

create table if not exists public.nikaplay_sala_reacciones (
  id         bigint generated always as identity primary key,
  sala_id    uuid not null references public.nikaplay_salas(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null check (emoji in ('👏', '🔥', '😮', '😂', '💪', '🤔', '😭', '🎉', '👍', '❤️')),
  created_at timestamptz not null default now()
);
create index if not exists nikaplay_sala_reac_idx on public.nikaplay_sala_reacciones (sala_id, id);

-- ---------------------------------------------------------------------------
-- 6) Invitaciones entre amigos
-- ---------------------------------------------------------------------------
create table if not exists public.nikaplay_invitaciones (
  id           uuid primary key default gen_random_uuid(),
  de_id        uuid not null references auth.users(id) on delete cascade,
  para_id      uuid not null references auth.users(id) on delete cascade,
  sala_id      uuid references public.nikaplay_salas(id) on delete cascade,
  juego        text not null references public.nikaplay_juegos(clave),
  mensaje      text check (mensaje is null or char_length(mensaje) <= 120),
  estado       text not null default 'pendiente' check (estado in ('pendiente', 'aceptada', 'rechazada', 'cancelada', 'expirada')),
  creada_at    timestamptz not null default now(),
  expira_at    timestamptz not null default now() + interval '15 minutes',
  respondida_at timestamptz,
  check (de_id <> para_id)
);
create unique index if not exists nikaplay_inv_unica_idx on public.nikaplay_invitaciones (de_id, para_id, sala_id) where estado = 'pendiente';
create index if not exists nikaplay_inv_para_idx on public.nikaplay_invitaciones (para_id, estado, creada_at desc);

-- ============================================================================
-- 7) Funciones auxiliares
-- ============================================================================
create or replace function public.np_son_amigos(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id::text = a::text and f.addressee_id::text = b::text)
        or (f.requester_id::text = b::text and f.addressee_id::text = a::text))
  )
$$;

create or replace function public.np_bloqueados(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_blocks x
    where (x.blocker_id::text = a::text and x.blocked_id::text = b::text)
       or (x.blocker_id::text = b::text and x.blocked_id::text = a::text)
  )
$$;

create or replace function public.np_en_sala(p_sala uuid, p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.nikaplay_sala_jugadores j where j.sala_id = p_sala and j.user_id = p_user)
$$;

-- Crea las filas de perfil y ELO si no existen
create or replace function public.np_asegurar(p_user uuid, p_juego text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.nikaplay_perfil (user_id) values (p_user) on conflict do nothing;
  insert into public.nikaplay_elo (user_id, juego) values (p_user, 'general') on conflict do nothing;
  if p_juego is not null and p_juego <> 'general' then
    insert into public.nikaplay_elo (user_id, juego) values (p_user, p_juego) on conflict do nothing;
  end if;
end $$;

-- Suma XP, recalcula el nivel y actualiza la racha de días jugados
create or replace function public.np_dar_xp(p_user uuid, p_xp integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_hoy date := (now() at time zone 'America/Argentina/Buenos_Aires')::date; v_ult date; v_racha integer;
begin
  select ultimo_dia, racha_dias into v_ult, v_racha from public.nikaplay_perfil where user_id = p_user for update;
  if v_ult is null or v_ult < v_hoy - 1 then v_racha := 1;
  elsif v_ult = v_hoy - 1 then v_racha := v_racha + 1;
  end if;
  update public.nikaplay_perfil set
    xp = xp + greatest(p_xp, 0), nivel = public.np_nivel(xp + greatest(p_xp, 0)), partidas = partidas + 1,
    racha_dias = v_racha, mejor_racha_dias = greatest(mejor_racha_dias, v_racha), ultimo_dia = v_hoy, actualizado_at = now()
  where user_id = p_user;
end $$;

-- ============================================================================
-- 8) Partidas individuales, retos y XP
-- ============================================================================
-- Tope de puntos plausible para n términos: 100 base + 75 por intentos + 40 velocidad = 215 por término (+ racha 40 + bono tiempo)
create or replace function public.np_tope_puntos(p_n integer, p_tiempo_ms integer)
returns integer language sql immutable as $$ select p_n * 255 + (greatest(p_tiempo_ms, 0) / 2000) + 100 $$;

create or replace function public.nikaplay_guardar_partida(
  p_juego text, p_n integer, p_ritmo text, p_puntos integer, p_aciertos integer, p_errores integer,
  p_tiempo_ms integer default 0, p_semilla bigint default null, p_reto uuid default null)
returns table (partida_id bigint, xp_ganada integer, xp_total integer, nivel integer, es_record boolean)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id bigint; v_xp integer; v_mejor integer; v_perfil record;
begin
  if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
  if not exists (select 1 from public.nikaplay_juegos where clave = p_juego and habilitado) then raise exception 'Juego no disponible'; end if;
  if p_n not between 1 and 50 or p_ritmo not in ('justo', 'intenso', 'libre') then raise exception 'Configuración inválida'; end if;
  if p_aciertos < 0 or p_aciertos > p_n or p_errores < 0 or p_errores > p_n * 20 then raise exception 'Resultado inválido'; end if;
  if p_puntos < 0 or p_puntos > public.np_tope_puntos(p_n, p_tiempo_ms) then raise exception 'Puntaje fuera de rango'; end if;
  -- freno básico: máximo 1 partida cada 8 segundos por usuario
  if exists (select 1 from public.nikaplay_partidas x where x.user_id = v_uid and x.created_at > now() - interval '8 seconds') then
    raise exception 'Demasiado rápido, esperá unos segundos';
  end if;

  perform public.np_asegurar(v_uid, p_juego);
  select coalesce(max(puntos), 0) into v_mejor from public.nikaplay_partidas
   where user_id = v_uid and juego = p_juego and n = p_n and ritmo = p_ritmo;
  insert into public.nikaplay_partidas (user_id, juego, n, ritmo, puntos, aciertos, errores, tiempo_ms, semilla, reto_id)
  values (v_uid, p_juego, p_n, p_ritmo, p_puntos, p_aciertos, p_errores, greatest(p_tiempo_ms, 0), p_semilla, p_reto)
  returning id into v_id;

  if p_reto is not null and exists (select 1 from public.nikaplay_retos r where r.id = p_reto and r.expira_at > now()) then
    insert into public.nikaplay_reto_resultados (reto_id, user_id, puntos) values (p_reto, v_uid, p_puntos)
    on conflict (reto_id, user_id) do update set puntos = greatest(public.nikaplay_reto_resultados.puntos, excluded.puntos);
  end if;

  v_xp := least(150, 15 + p_puntos / 10 + case when p_ritmo = 'libre' then 0 else 10 end);
  perform public.np_dar_xp(v_uid, v_xp);
  select pf.xp, pf.nivel into v_perfil from public.nikaplay_perfil pf where pf.user_id = v_uid;
  return query select v_id, v_xp, v_perfil.xp, v_perfil.nivel, (p_ritmo <> 'libre' and p_puntos > v_mejor);
end $$;

create or replace function public.nikaplay_crear_reto(p_juego text, p_semilla bigint, p_n integer, p_ritmo text, p_puntos integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
  if not exists (select 1 from public.nikaplay_juegos where clave = p_juego and habilitado) then raise exception 'Juego no disponible'; end if;
  if p_n not between 1 and 50 or p_ritmo not in ('justo', 'intenso', 'libre') or p_puntos not between 0 and public.np_tope_puntos(p_n, 0) + 5000 then raise exception 'Datos inválidos'; end if;
  insert into public.nikaplay_retos (creador_id, juego, semilla, n, ritmo, puntos_creador) values (v_uid, p_juego, p_semilla, p_n, p_ritmo, p_puntos) returning id into v_id;
  return v_id;
end $$;

-- Datos del reto para quien abre el enlace (más el marcador de quienes ya lo jugaron)
create or replace function public.nikaplay_ver_reto(p_id uuid)
returns table (reto_id uuid, creador_id uuid, creador text, avatar text, juego text, semilla bigint, n smallint, ritmo text, puntos_creador integer, jugadores integer, mejor_puntaje integer)
language sql stable security definer set search_path = public as $$
  select r.id, r.creador_id,
         coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Un compañero')::text,
         coalesce(p.avatar, p.avatar_url)::text,
         r.juego, r.semilla, r.n, r.ritmo, r.puntos_creador,
         (select count(*)::int from public.nikaplay_reto_resultados x where x.reto_id = r.id),
         (select coalesce(max(x.puntos), r.puntos_creador)::int from public.nikaplay_reto_resultados x where x.reto_id = r.id)
  from public.nikaplay_retos r
  left join public.profiles p on p.id::text = r.creador_id::text
  where r.id = p_id and r.expira_at > now() and auth.uid() is not null
$$;

-- ============================================================================
-- 9) Salas multijugador
-- ============================================================================
create or replace function public.np_codigo_sala() returns text language plpgsql volatile as $$
declare c text; chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  loop
    c := ''; for i in 1..6 loop c := c || substr(chars, 1 + floor(random() * length(chars))::int, 1); end loop;
    exit when not exists (select 1 from public.nikaplay_salas where codigo = c);
  end loop;
  return c;
end $$;

create or replace function public.nikaplay_crear_sala(p_juego text, p_config jsonb default '{"n":5,"ritmo":"justo"}', p_max integer default 4, p_privada boolean default true, p_puntuable boolean default true)
returns table (sala_id uuid, codigo text)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_cod text; v_n integer := coalesce((p_config ->> 'n')::int, 5); v_r text := coalesce(p_config ->> 'ritmo', 'justo');
begin
  if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
  if not exists (select 1 from public.nikaplay_juegos where clave = p_juego and habilitado and multijugador) then raise exception 'Este juego no tiene modo multijugador'; end if;
  if v_n not between 1 and 20 or v_r not in ('justo', 'intenso') then raise exception 'Configuración inválida (las salas usan reloj)'; end if;
  -- una sola sala activa por anfitrión
  update public.nikaplay_salas set estado = 'cancelada', fin_at = now() where anfitrion_id = v_uid and estado = 'espera';
  v_cod := public.np_codigo_sala();
  insert into public.nikaplay_salas (codigo, juego, anfitrion_id, config, max_jugadores, privada, puntuable, semilla)
  values (v_cod, p_juego, v_uid, jsonb_build_object('n', v_n, 'ritmo', v_r), greatest(2, least(coalesce(p_max, 4), 8)), p_privada, p_puntuable, floor(random() * 4294967296)::bigint)
  returning id into v_id;
  insert into public.nikaplay_sala_jugadores (sala_id, user_id, listo) values (v_id, v_uid, true);
  perform public.np_asegurar(v_uid, p_juego);
  return query select v_id, v_cod;
end $$;

create or replace function public.nikaplay_unirse_sala(p_codigo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s public.nikaplay_salas%rowtype;
begin
  if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
  select * into s from public.nikaplay_salas where codigo = upper(trim(p_codigo));
  if not found or s.estado <> 'espera' then raise exception 'La sala no existe o ya empezó'; end if;
  if public.np_bloqueados(v_uid, s.anfitrion_id) then raise exception 'No podés unirte a esta sala'; end if;
  if s.privada and not exists (select 1 from public.nikaplay_invitaciones i where i.sala_id = s.id and i.para_id = v_uid and i.estado in ('pendiente', 'aceptada'))
     and not public.np_son_amigos(v_uid, s.anfitrion_id) and not public.np_en_sala(s.id, v_uid) then
    raise exception 'Sala privada: necesitás una invitación';
  end if;
  if not public.np_en_sala(s.id, v_uid) then
    if (select count(*) from public.nikaplay_sala_jugadores where sala_id = s.id) >= s.max_jugadores then raise exception 'La sala está llena'; end if;
    insert into public.nikaplay_sala_jugadores (sala_id, user_id) values (s.id, v_uid);
  end if;
  update public.nikaplay_invitaciones set estado = 'aceptada', respondida_at = now() where sala_id = s.id and para_id = v_uid and estado = 'pendiente';
  perform public.np_asegurar(v_uid, s.juego);
  return s.id;
end $$;

create or replace function public.nikaplay_salir_sala(p_sala uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s public.nikaplay_salas%rowtype;
begin
  select * into s from public.nikaplay_salas where id = p_sala;
  if not found then return; end if;
  if s.estado = 'espera' then
    delete from public.nikaplay_sala_jugadores where sala_id = p_sala and user_id = v_uid;
    if s.anfitrion_id = v_uid then
      update public.nikaplay_salas set estado = 'cancelada', fin_at = now() where id = p_sala;
    end if;
  end if;   -- una vez empezada, abandonar equivale a no enviar resultado (puntos 0 al cerrar)
end $$;

create or replace function public.nikaplay_sala_listo(p_sala uuid, p_listo boolean default true)
returns void language sql security definer set search_path = public as $$
  update public.nikaplay_sala_jugadores set listo = p_listo
  where sala_id = p_sala and user_id = auth.uid()
    and exists (select 1 from public.nikaplay_salas s where s.id = p_sala and s.estado = 'espera')
$$;

-- El anfitrión inicia: hacen falta al menos 2 jugadores y todos listos
create or replace function public.nikaplay_iniciar_sala(p_sala uuid)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s public.nikaplay_salas%rowtype; v_ini timestamptz := now() + interval '5 seconds';
begin
  select * into s from public.nikaplay_salas where id = p_sala for update;
  if not found or s.anfitrion_id <> v_uid or s.estado <> 'espera' then raise exception 'No podés iniciar esta sala'; end if;
  if (select count(*) from public.nikaplay_sala_jugadores where sala_id = p_sala) < 2 then raise exception 'Hacen falta al menos 2 jugadores'; end if;
  if exists (select 1 from public.nikaplay_sala_jugadores where sala_id = p_sala and not listo) then raise exception 'Todos tienen que estar listos'; end if;
  update public.nikaplay_salas set estado = 'jugando', inicio_at = v_ini where id = p_sala;
  return v_ini;     -- cuenta regresiva común: todos arrancan en este instante
end $$;

-- Cada jugador envía su resultado; si ya enviaron todos, se cierra la sala y se calcula el ELO
create or replace function public.nikaplay_sala_enviar(p_sala uuid, p_puntos integer, p_aciertos integer, p_errores integer, p_tiempo_ms integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s public.nikaplay_salas%rowtype; v_n integer;
begin
  select * into s from public.nikaplay_salas where id = p_sala;
  if not found or s.estado <> 'jugando' then raise exception 'La sala no está en juego'; end if;
  if not public.np_en_sala(p_sala, v_uid) then raise exception 'No sos parte de esta sala'; end if;
  v_n := (s.config ->> 'n')::int;
  if p_aciertos < 0 or p_aciertos > v_n or p_errores < 0 or p_errores > v_n * 20 or p_puntos < 0 or p_puntos > public.np_tope_puntos(v_n, p_tiempo_ms) then raise exception 'Resultado inválido'; end if;
  if now() < s.inicio_at + interval '5 seconds' then raise exception 'Resultado demasiado temprano'; end if;
  update public.nikaplay_sala_jugadores set puntos = p_puntos, aciertos = p_aciertos, errores = p_errores, tiempo_ms = greatest(p_tiempo_ms, 0), terminado_at = now()
   where sala_id = p_sala and user_id = v_uid and terminado_at is null;
  perform public.nikaplay_cerrar_sala(p_sala, false);
end $$;

-- Tiempo máximo de una partida en sala: reloj total (n × segundos por término) + 2 minutos de margen.
create or replace function public.np_limite_sala(p_config jsonb)
returns interval language sql immutable as $$
  select make_interval(secs => coalesce((p_config ->> 'n')::int, 5) * case when p_config ->> 'ritmo' = 'intenso' then 30 else 45 end + 120)
$$;

-- Cierra la sala (cuando todos enviaron, o por tiempo vencido con p_forzar = true) y reparte ELO/XP.
-- ELO: se compara cada jugador contra cada rival (mayor puntaje gana; empate por puntaje = menos tiempo; igual = empate).
-- K = 40 para quien lleva menos de 10 partidas en ese juego, 24 desde entonces. Se aplica al ELO del juego y al ELO general.
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

-- Mensajes y reacciones: solo miembros de la sala, con freno de ritmo
create or replace function public.nikaplay_sala_mensaje(p_sala uuid, p_texto text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_t text := trim(coalesce(p_texto, ''));
begin
  if v_uid is null or not public.np_en_sala(p_sala, v_uid) then raise exception 'No sos parte de esta sala'; end if;
  if char_length(v_t) not between 1 and 200 then raise exception 'Mensaje vacío o demasiado largo'; end if;
  if (select count(*) from public.nikaplay_sala_mensajes where sala_id = p_sala and user_id = v_uid and created_at > now() - interval '10 seconds') >= 5 then
    raise exception 'Estás escribiendo muy rápido';
  end if;
  insert into public.nikaplay_sala_mensajes (sala_id, user_id, texto) values (p_sala, v_uid, v_t);
end $$;

create or replace function public.nikaplay_sala_reaccion(p_sala uuid, p_emoji text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.np_en_sala(p_sala, v_uid) then raise exception 'No sos parte de esta sala'; end if;
  if (select count(*) from public.nikaplay_sala_reacciones where sala_id = p_sala and user_id = v_uid and created_at > now() - interval '5 seconds') >= 6 then return; end if;
  insert into public.nikaplay_sala_reacciones (sala_id, user_id, emoji) values (p_sala, v_uid, p_emoji);   -- el check de la tabla valida el emoji
end $$;

-- ============================================================================
-- 10) Invitaciones a amigos
-- ============================================================================
create or replace function public.nikaplay_invitar(p_para uuid, p_sala uuid default null, p_juego text default 'nikaword', p_mensaje text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_nombre text;
begin
  if v_uid is null then raise exception 'Necesitás iniciar sesión'; end if;
  if v_uid = p_para then raise exception 'No podés invitarte a vos mismo'; end if;
  if not public.np_son_amigos(v_uid, p_para) then raise exception 'Solo podés invitar a tus amigos'; end if;
  if public.np_bloqueados(v_uid, p_para) then raise exception 'No se puede invitar a este usuario'; end if;
  if p_sala is not null and not exists (select 1 from public.nikaplay_salas s where s.id = p_sala and s.anfitrion_id = v_uid and s.estado = 'espera') then
    raise exception 'La sala no está disponible';
  end if;
  if (select count(*) from public.nikaplay_invitaciones where de_id = v_uid and creada_at > now() - interval '1 minute') >= 10 then raise exception 'Demasiadas invitaciones seguidas'; end if;
  update public.nikaplay_invitaciones set estado = 'expirada' where estado = 'pendiente' and expira_at < now();
  insert into public.nikaplay_invitaciones (de_id, para_id, sala_id, juego, mensaje) values (v_uid, p_para, p_sala, p_juego, nullif(trim(p_mensaje), ''))
  on conflict (de_id, para_id, sala_id) where estado = 'pendiente' do update set expira_at = now() + interval '15 minutes'
  returning id into v_id;
  select coalesce(fullname, full_name, nombre, username, 'Un amigo') into v_nombre from public.profiles where id::text = v_uid::text;
  begin
    perform public.nika_notificar(p_para::text, 'nikaplay_invitacion', v_nombre || ' te invitó a jugar', 'Entrá a NikaPlay para aceptar el desafío.', jsonb_build_object('invitacion', v_id, 'sala', p_sala, 'juego', p_juego));
  exception when others then null;   -- si el sistema de notificaciones cambia, la invitación igual queda registrada
  end;
  return v_id;
end $$;

create or replace function public.nikaplay_responder_invitacion(p_id uuid, p_aceptar boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); i public.nikaplay_invitaciones%rowtype;
begin
  select * into i from public.nikaplay_invitaciones where id = p_id and para_id = v_uid for update;
  if not found or i.estado <> 'pendiente' or i.expira_at < now() then raise exception 'La invitación ya no está disponible'; end if;
  if not p_aceptar then
    update public.nikaplay_invitaciones set estado = 'rechazada', respondida_at = now() where id = p_id;
    return null;
  end if;
  if i.sala_id is not null then
    perform public.nikaplay_unirse_sala((select codigo from public.nikaplay_salas where id = i.sala_id));
  end if;
  update public.nikaplay_invitaciones set estado = 'aceptada', respondida_at = now() where id = p_id;
  return i.sala_id;
end $$;

create or replace function public.nikaplay_cancelar_invitacion(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.nikaplay_invitaciones set estado = 'cancelada', respondida_at = now() where id = p_id and de_id = auth.uid() and estado = 'pendiente'
$$;

-- Invitaciones recibidas vigentes (con quién invita)
create or replace function public.nikaplay_mis_invitaciones()
returns table (id uuid, de_id uuid, de text, avatar text, sala_id uuid, juego text, mensaje text, creada_at timestamptz, expira_at timestamptz)
language sql stable security definer set search_path = public as $$
  select i.id, i.de_id, coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Un amigo')::text, coalesce(p.avatar, p.avatar_url)::text,
         i.sala_id, i.juego, i.mensaje, i.creada_at, i.expira_at
  from public.nikaplay_invitaciones i
  left join public.profiles p on p.id::text = i.de_id::text
  where i.para_id = auth.uid() and i.estado = 'pendiente' and i.expira_at > now()
  order by i.creada_at desc
$$;

-- ============================================================================
-- 11) Buscador de usuarios (para sumar amigos y desafiar)
--     Las solicitudes de amistad siguen usando public.friendships como hoy (friendsManager.js).
-- ============================================================================
create or replace function public.nikaplay_buscar_usuarios(p_q text, p_limite integer default 20)
returns table (user_id text, username text, nombre text, avatar text, elo integer, rango text, nivel integer, relacion text)
language sql stable security definer set search_path = public as $$
  with q as (select trim(coalesce(p_q, '')) as t)
  select p.id::text, p.username::text,
         coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Estudiante Nika')::text,
         coalesce(p.avatar, p.avatar_url)::text,
         coalesce(e.elo, 1000)::int,
         (select rr.nombre from public.np_rango(coalesce(e.elo, 1000)) rr)::text,
         coalesce(pf.nivel, 1)::int,
         case
           when exists (select 1 from public.friendships f where f.status = 'accepted' and ((f.requester_id::text = auth.uid()::text and f.addressee_id::text = p.id::text) or (f.requester_id::text = p.id::text and f.addressee_id::text = auth.uid()::text))) then 'amigo'
           when exists (select 1 from public.friendships f where f.status = 'pending' and f.requester_id::text = auth.uid()::text and f.addressee_id::text = p.id::text) then 'enviada'
           when exists (select 1 from public.friendships f where f.status = 'pending' and f.requester_id::text = p.id::text and f.addressee_id::text = auth.uid()::text) then 'recibida'
           else 'ninguna' end
  from public.profiles p cross join q
  left join public.nikaplay_elo e on e.user_id::text = p.id::text and e.juego = 'general'
  left join public.nikaplay_perfil pf on pf.user_id::text = p.id::text
  where auth.uid() is not null and char_length(q.t) >= 2 and p.id::text <> auth.uid()::text
    and (p.username ilike '%' || replace(replace(q.t, '%', ''), '_', '') || '%' or coalesce(p.fullname, p.full_name, p.nombre, '') ilike '%' || replace(replace(q.t, '%', ''), '_', '') || '%')
    and not exists (select 1 from public.user_blocks b where (b.blocker_id::text = auth.uid()::text and b.blocked_id::text = p.id::text) or (b.blocker_id::text = p.id::text and b.blocked_id::text = auth.uid()::text))
  order by (p.username ilike replace(replace(q.t, '%', ''), '_', '') || '%') desc, p.username
  limit least(greatest(coalesce(p_limite, 20), 1), 50)
$$;

-- ============================================================================
-- 12) Rankings
-- ============================================================================
-- Ranking ELO por juego o general. p_alcance: 'global' | 'amigos'. Incluye mi posición aunque no esté en el top.
create or replace function public.nikaplay_ranking_elo(p_juego text default 'general', p_alcance text default 'global', p_limite integer default 50)
returns table (posicion bigint, user_id text, username text, nombre text, avatar text, elo integer, rango text, color text, partidas integer, victorias integer, racha integer, soy_yo boolean)
language sql stable security definer set search_path = public as $$
  with base as (
    select e.user_id, e.elo, e.partidas, e.victorias, e.racha
    from public.nikaplay_elo e
    where e.juego = p_juego and e.partidas > 0 and auth.uid() is not null
      and (p_alcance <> 'amigos' or e.user_id = auth.uid() or public.np_son_amigos(auth.uid(), e.user_id))
  ), ord as (
    select b.*, rank() over (order by b.elo desc, b.victorias desc) as pos from base b
  )
  select o.pos, o.user_id::text, p.username::text, coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Estudiante Nika')::text, coalesce(p.avatar, p.avatar_url)::text,
         o.elo, rr.nombre::text, rr.color::text, o.partidas, o.victorias, o.racha, (o.user_id = auth.uid())
  from ord o
  left join public.profiles p on p.id::text = o.user_id::text
  left join lateral public.np_rango(o.elo) rr on true
  where o.pos <= least(greatest(coalesce(p_limite, 50), 1), 200) or o.user_id = auth.uid()
  order by o.pos, p.username
$$;

-- Ranking de progreso: XP o puntos jugados en el período (semana | mes | total)
create or replace function public.nikaplay_ranking_progreso(p_periodo text default 'semana', p_alcance text default 'global', p_limite integer default 50)
returns table (posicion bigint, user_id text, username text, nombre text, avatar text, puntos integer, partidas integer, nivel integer, soy_yo boolean)
language sql stable security definer set search_path = public as $$
  with desde as (
    select case p_periodo when 'semana' then now() - interval '7 days' when 'mes' then now() - interval '30 days' else null::timestamptz end as d
  ), base as (
    select x.user_id, sum(x.puntos)::int as puntos, count(*)::int as partidas
    from public.nikaplay_partidas x, desde
    where (desde.d is null or x.created_at >= desde.d) and auth.uid() is not null
      and (p_alcance <> 'amigos' or x.user_id = auth.uid() or public.np_son_amigos(auth.uid(), x.user_id))
    group by x.user_id
  ), ord as (
    select b.*, rank() over (order by b.puntos desc, b.partidas desc) as pos from base b
  )
  select o.pos, o.user_id::text, p.username::text, coalesce(p.fullname, p.full_name, p.nombre, p.username, 'Estudiante Nika')::text, coalesce(p.avatar, p.avatar_url)::text,
         o.puntos, o.partidas, coalesce(pf.nivel, 1)::int, (o.user_id = auth.uid())
  from ord o
  left join public.profiles p on p.id::text = o.user_id::text
  left join public.nikaplay_perfil pf on pf.user_id = o.user_id
  where o.pos <= least(greatest(coalesce(p_limite, 50), 1), 200) or o.user_id = auth.uid()
  order by o.pos, p.username
$$;

-- Mi perfil de juego: nivel, XP, rango por ELO general, ELO por juego, racha de días y posición global
create or replace function public.nikaplay_mi_perfil()
returns table (xp integer, nivel integer, xp_nivel_actual integer, xp_nivel_siguiente integer, racha_dias integer, mejor_racha_dias integer, partidas integer,
               elo_general integer, rango text, rango_color text, elo_siguiente integer, posicion_global bigint, elo_por_juego jsonb)
language sql stable security definer set search_path = public as $$
  with yo as (select coalesce((select pf.xp from public.nikaplay_perfil pf where pf.user_id = auth.uid()), 0) as xp),
       g as (select coalesce((select e.elo from public.nikaplay_elo e where e.user_id = auth.uid() and e.juego = 'general'), 1000) as elo)
  select yo.xp, public.np_nivel(yo.xp),
         (power(public.np_nivel(yo.xp) - 1, 2) * 50)::int, (power(public.np_nivel(yo.xp), 2) * 50)::int,
         coalesce((select pf.racha_dias from public.nikaplay_perfil pf where pf.user_id = auth.uid()), 0),
         coalesce((select pf.mejor_racha_dias from public.nikaplay_perfil pf where pf.user_id = auth.uid()), 0),
         coalesce((select pf.partidas from public.nikaplay_perfil pf where pf.user_id = auth.uid()), 0),
         g.elo, rr.nombre::text, rr.color::text, rr.siguiente_elo,
         (select count(*) + 1 from public.nikaplay_elo e2 where e2.juego = 'general' and e2.partidas > 0 and e2.elo > g.elo),
         coalesce((select jsonb_object_agg(e3.juego, jsonb_build_object('elo', e3.elo, 'pico', e3.pico, 'partidas', e3.partidas, 'victorias', e3.victorias, 'derrotas', e3.derrotas, 'racha', e3.racha))
                   from public.nikaplay_elo e3 where e3.user_id = auth.uid() and e3.juego <> 'general'), '{}'::jsonb)
  from yo, g left join lateral public.np_rango(g.elo) rr on true
  where auth.uid() is not null
$$;

-- ============================================================================
-- 13) Seguridad (RLS) y permisos
-- ============================================================================
alter table public.nikaplay_juegos            enable row level security;
alter table public.nikaplay_rangos            enable row level security;
alter table public.nikaplay_perfil            enable row level security;
alter table public.nikaplay_elo               enable row level security;
alter table public.nikaplay_partidas          enable row level security;
alter table public.nikaplay_retos             enable row level security;
alter table public.nikaplay_reto_resultados   enable row level security;
alter table public.nikaplay_salas             enable row level security;
alter table public.nikaplay_sala_jugadores    enable row level security;
alter table public.nikaplay_sala_mensajes     enable row level security;
alter table public.nikaplay_sala_reacciones   enable row level security;
alter table public.nikaplay_invitaciones      enable row level security;

drop policy if exists np_juegos_ver on public.nikaplay_juegos;
create policy np_juegos_ver on public.nikaplay_juegos for select to authenticated using (true);
drop policy if exists np_rangos_ver on public.nikaplay_rangos;
create policy np_rangos_ver on public.nikaplay_rangos for select to authenticated using (true);

drop policy if exists np_perfil_mio on public.nikaplay_perfil;
create policy np_perfil_mio on public.nikaplay_perfil for select to authenticated using (user_id = auth.uid());
drop policy if exists np_elo_mio on public.nikaplay_elo;
create policy np_elo_mio on public.nikaplay_elo for select to authenticated using (user_id = auth.uid());
drop policy if exists np_partidas_mias on public.nikaplay_partidas;
create policy np_partidas_mias on public.nikaplay_partidas for select to authenticated using (user_id = auth.uid());
drop policy if exists np_retos_mios on public.nikaplay_retos;
create policy np_retos_mios on public.nikaplay_retos for select to authenticated using (creador_id = auth.uid());
drop policy if exists np_reto_res_mios on public.nikaplay_reto_resultados;
create policy np_reto_res_mios on public.nikaplay_reto_resultados for select to authenticated using (user_id = auth.uid());

-- Salas: las veo si soy miembro o anfitrión (el lobby de salas públicas se lee por función en una etapa posterior)
drop policy if exists np_salas_miembro on public.nikaplay_salas;
create policy np_salas_miembro on public.nikaplay_salas for select to authenticated
  using (anfitrion_id = auth.uid() or public.np_en_sala(id, auth.uid()));
drop policy if exists np_sala_jug_ver on public.nikaplay_sala_jugadores;
create policy np_sala_jug_ver on public.nikaplay_sala_jugadores for select to authenticated using (public.np_en_sala(sala_id, auth.uid()));
drop policy if exists np_sala_msj_ver on public.nikaplay_sala_mensajes;
create policy np_sala_msj_ver on public.nikaplay_sala_mensajes for select to authenticated
  using (public.np_en_sala(sala_id, auth.uid()) and not public.np_bloqueados(auth.uid(), user_id));
drop policy if exists np_sala_reac_ver on public.nikaplay_sala_reacciones;
create policy np_sala_reac_ver on public.nikaplay_sala_reacciones for select to authenticated using (public.np_en_sala(sala_id, auth.uid()));
drop policy if exists np_inv_ver on public.nikaplay_invitaciones;
create policy np_inv_ver on public.nikaplay_invitaciones for select to authenticated using (de_id = auth.uid() or para_id = auth.uid());

-- Ninguna tabla acepta INSERT/UPDATE/DELETE directo de clientes: solo las funciones de arriba.
revoke insert, update, delete on
  public.nikaplay_juegos, public.nikaplay_rangos, public.nikaplay_perfil, public.nikaplay_elo, public.nikaplay_partidas,
  public.nikaplay_retos, public.nikaplay_reto_resultados, public.nikaplay_salas, public.nikaplay_sala_jugadores,
  public.nikaplay_sala_mensajes, public.nikaplay_sala_reacciones, public.nikaplay_invitaciones
  from anon, authenticated;

-- Funciones: se ejecutan como el usuario logueado; anon no puede llamarlas
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as firma from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like 'nikaplay\_%' or p.proname like 'np\_%') loop
    execute format('revoke all on function %s from public, anon', f.firma);
    execute format('grant execute on function %s to authenticated', f.firma);
  end loop;
end $$;

-- ============================================================================
-- 14) Tiempo real (chat, reacciones, estado de sala, invitaciones)
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array['nikaplay_salas', 'nikaplay_sala_jugadores', 'nikaplay_sala_mensajes', 'nikaplay_sala_reacciones', 'nikaplay_invitaciones'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
             when undefined_object then null;
    end;
  end loop;
end $$;

-- ============================================================================
-- NOTAS
-- 1) Antes de ejecutar: confirmar que existen public.friendships, public.user_blocks, public.profiles y public.nika_notificar.
-- 2) ELO general: se aplica con el mismo desplazamiento que el ELO del juego (suficiente mientras haya un solo juego
--    multijugador; cuando haya varios se puede recalcular contra el ELO general de cada rival).
-- 3) Las tablas nikaplay_* no aceptan escritura directa (solo lectura por RLS); todo pasa por las funciones nikaplay_*.
-- 4) Salas abandonadas: ver sql/nikaplay_parche_1.sql (abandonar al salir en plena partida + limpieza automática).
-- ============================================================================
