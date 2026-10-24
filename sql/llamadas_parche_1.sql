-- =====================================================================
-- CAMPUS NIKA · Llamadas · parche 1  (ejecutar DESPUÉS de sql/llamadas.sql; idempotente)
-- Si quien llama corta mientras suena, a la otra persona le queda una "llamada perdida" (como en WhatsApp).
-- =====================================================================
create or replace function public.llamada_cancelar(p_id uuid)
returns public.llamadas language plpgsql security definer set search_path = public as $$
declare f public.llamadas; nom text;
begin
    select * into f from public.llamadas where id = p_id for update;
    if not found or f.caller_id <> auth.uid() then raise exception 'llamada inexistente' using errcode = '42501'; end if;
    if f.estado <> 'llamando' then return f; end if;
    update public.llamadas set estado = 'cancelada', finalizada_en = now(), finalizada_por = auth.uid()
     where id = p_id returning * into f;
    select username into nom from public.profiles where id = f.caller_id;
    insert into public.notificaciones (para_id, de_id, de_username, tipo, titulo, cuerpo, datos, vence_en)
    values (f.callee_id, f.caller_id, nom, 'llamada_perdida', 'Llamada perdida', 'Te llamó @' || nom,
            jsonb_build_object('llamada', f.id), now() + interval '1 day');
    return f;
end $$;
revoke all on function public.llamada_cancelar(uuid) from public, anon;
grant execute on function public.llamada_cancelar(uuid) to authenticated;
