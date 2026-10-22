-- Notificaciones globales (invitaciones, notas compartidas, desafíos...), preferencias, push y anotaciones sobre PDF.
-- Idempotente. Las notificaciones solo se crean por RPC (valida amistad y limita el ritmo).

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  para_id uuid not null references auth.users(id) on delete cascade,
  de_id uuid references auth.users(id) on delete set null,
  de_username text,
  tipo text not null,                 -- invitacion_pomodoro | nota_compartida | solicitud_amistad | mensaje | desafio | reto | sistema
  titulo text not null default '',
  cuerpo text not null default '',
  datos jsonb not null default '{}'::jsonb,
  leida boolean not null default false,
  creada_en timestamptz not null default now(),
  vence_en timestamptz
);
create index if not exists notificaciones_para_idx on public.notificaciones (para_id, creada_en desc);
create index if not exists notificaciones_no_leidas_idx on public.notificaciones (para_id) where leida = false;

alter table public.notificaciones enable row level security;
drop policy if exists "notif_select_own" on public.notificaciones;
drop policy if exists "notif_update_own" on public.notificaciones;
drop policy if exists "notif_delete_own" on public.notificaciones;
create policy "notif_select_own" on public.notificaciones for select using (auth.uid() = para_id);
create policy "notif_update_own" on public.notificaciones for update using (auth.uid() = para_id) with check (auth.uid() = para_id);
create policy "notif_delete_own" on public.notificaciones for delete using (auth.uid() = para_id);

-- Tiempo real (si ya estaba publicada, se ignora el error)
do $$ begin
  alter publication supabase_realtime add table public.notificaciones;
exception when others then null; end $$;

-- Preferencias de notificaciones y presencia
create table if not exists public.notif_preferencias (
  user_id uuid primary key references auth.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,   -- { sonido:{tipo:bool}, aviso:{tipo:bool}, silencio:bool, invisible:bool, push:bool }
  actualizada_en timestamptz not null default now()
);
alter table public.notif_preferencias enable row level security;
drop policy if exists "notif_pref_own" on public.notif_preferencias;
create policy "notif_pref_own" on public.notif_preferencias for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Suscripciones Web Push (una por navegador/dispositivo)
create table if not exists public.push_suscripciones (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  agente text,
  creada_en timestamptz not null default now()
);
create index if not exists push_susc_user_idx on public.push_suscripciones (user_id);
alter table public.push_suscripciones enable row level security;
drop policy if exists "push_susc_own" on public.push_suscripciones;
create policy "push_susc_own" on public.push_suscripciones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RPC: enviar una notificación. Los tipos "entre amigos" exigen amistad aceptada.
create or replace function public.nika_notificar(p_para text, p_tipo text, p_titulo text, p_cuerpo text default '', p_datos jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  yo uuid := auth.uid();
  mi_username text;
  destino uuid;
  son_amigos boolean;
  recientes int;
begin
  if yo is null then return jsonb_build_object('ok', false, 'reason', 'sin_sesion'); end if;
  if p_tipo not in ('invitacion_pomodoro','nota_compartida','solicitud_amistad','mensaje','desafio','reto','sistema') then
    return jsonb_build_object('ok', false, 'reason', 'tipo_invalido');
  end if;
  select id into destino from public.profiles_public where lower(username) = lower(p_para) limit 1;
  if destino is null then return jsonb_build_object('ok', false, 'reason', 'no_existe'); end if;
  if destino = yo then return jsonb_build_object('ok', false, 'reason', 'a_vos_mismo'); end if;
  select username into mi_username from public.profiles_public where id = yo;

  if p_tipo in ('invitacion_pomodoro','nota_compartida') then
    select exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = yo and f.addressee_id = destino) or (f.requester_id = destino and f.addressee_id = yo))
    ) into son_amigos;
    if not son_amigos then return jsonb_build_object('ok', false, 'reason', 'no_amigo'); end if;
  end if;

  select count(*) into recientes from public.notificaciones where de_id = yo and creada_en > now() - interval '1 minute';
  if recientes >= 30 then return jsonb_build_object('ok', false, 'reason', 'demasiadas'); end if;

  insert into public.notificaciones (para_id, de_id, de_username, tipo, titulo, cuerpo, datos, vence_en)
  values (destino, yo, mi_username, p_tipo, left(coalesce(p_titulo,''), 160), left(coalesce(p_cuerpo,''), 2000), coalesce(p_datos, '{}'::jsonb),
          case when p_tipo = 'invitacion_pomodoro' then now() + interval '5 minutes' else now() + interval '30 days' end);
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.nika_notificar(text, text, text, text, jsonb) from public;
grant execute on function public.nika_notificar(text, text, text, text, jsonb) to authenticated;

-- Anotaciones sobre el PDF (viven en notas_estudio: se sincronizan con Notas de lectura)
alter table public.notas_estudio add column if not exists anotacion text;          -- null | 'texto' | 'pin'
alter table public.notas_estudio add column if not exists pos_x numeric;           -- 0..1 sobre el ancho de la página
alter table public.notas_estudio add column if not exists pos_y numeric;           -- 0..1 sobre el alto de la página
alter table public.notas_estudio add column if not exists ancho numeric;           -- 0..1 sobre el ancho de la página (cajas de texto)
alter table public.notas_estudio add column if not exists tam numeric;             -- tamaño de letra relativo (1 = normal)
alter table public.notas_estudio add column if not exists etiquetas text[] not null default '{}';
create index if not exists notas_estudio_anot_idx on public.notas_estudio (user_id, recurso, posicion) where anotacion is not null;
