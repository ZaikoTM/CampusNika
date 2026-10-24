-- =====================================================================
-- CAMPUS NIKA · Llamadas · canales de Realtime PRIVADOS   (ejecutar DESPUÉS de sql/llamadas.sql; idempotente)
-- La señalización WebRTC de cada llamada 1 a 1 viaja por el canal  ateneo:c-<id sin guiones>.
-- Con estas políticas sobre realtime.messages, solo la persona que llama y la que recibe pueden entrar a ese canal
-- (leer y enviar), y solo mientras la llamada está sonando o en curso. Las salas públicas de ateneo no cambian.
-- El front (js/voiceManager.js) abre estas llamadas con { private: true }; si el proyecto no tiene Realtime Authorization
-- activo, cae solo al canal común.
-- =====================================================================

create or replace function public.llamada_puede_canal(p_topic text)
returns boolean language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.llamadas l
         where 'ateneo:' || l.sala = p_topic
           and auth.uid() in (l.caller_id, l.callee_id)
           and l.estado in ('llamando', 'aceptada')
    );
$$;
revoke all on function public.llamada_puede_canal(text) from public, anon;
grant execute on function public.llamada_puede_canal(text) to authenticated;

drop policy if exists llamadas_realtime_leer on realtime.messages;
create policy llamadas_realtime_leer on realtime.messages for select to authenticated
    using ( public.llamada_puede_canal(realtime.topic()) );

drop policy if exists llamadas_realtime_enviar on realtime.messages;
create policy llamadas_realtime_enviar on realtime.messages for insert to authenticated
    with check ( public.llamada_puede_canal(realtime.topic()) );

-- Verificación (solo lectura):
-- select policyname, cmd from pg_policies where schemaname = 'realtime' and tablename = 'messages';
