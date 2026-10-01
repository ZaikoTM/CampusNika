-- =====================================================================
-- CAMPUS NIKA · Panel de suscripciones (admin.html)
-- Ejecutá cada bloque por separado (seleccioná solo ese bloque y Run).
-- Requiere: is_admin() de 002_rls_admin_tables.sql y 07_rango_nikamed_plus.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BLOQUE 1 · El admin puede leer los pagos (el backend usa service_role,
-- que ignora RLS, así que activar RLS no lo afecta). Los usuarios comunes
-- NO podrán leer pagos ajenos ni propios.
-- Si alguna tabla no existe, saltá su par de líneas.
-- ---------------------------------------------------------------------
alter table public.pagos_mercadopago enable row level security;
drop policy if exists "pagos_mercadopago_select_admin" on public.pagos_mercadopago;
create policy "pagos_mercadopago_select_admin" on public.pagos_mercadopago
    for select to authenticated using (public.is_admin());

alter table public.pagos_procesados enable row level security;
drop policy if exists "pagos_procesados_select_admin" on public.pagos_procesados;
create policy "pagos_procesados_select_admin" on public.pagos_procesados
    for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- BLOQUE 2 · Activar / extender NikaMed+ a mano desde el panel.
-- Solo corre si quien llama es admin. Suma días desde el vencimiento vigente
-- (o desde ahora). Plan deducido de los días: 365 anual, 183 semestral, resto mensual.
-- ---------------------------------------------------------------------
create or replace function public.admin_extender_nikamed(p_user uuid, p_dias integer)
returns void
language plpgsql security definer set search_path = public as $$
begin
    if not public.is_admin() then
        raise exception 'forbidden';
    end if;
    if p_dias is null or p_dias < 1 or p_dias > 800 then
        raise exception 'dias invalidos';
    end if;

    update public.profiles
       set tipo_cuenta = 'premium',
           plan_activo = (case when p_dias >= 365 then 'anual'
                               when p_dias >= 183 then 'semestral'
                               else 'mensual' end)::plan_nikamed_enum,
           fecha_inicio_suscripcion = case when fecha_fin_suscripcion > now()
                                           then fecha_inicio_suscripcion else now() end,
           fecha_fin_suscripcion = greatest(now(), coalesce(fecha_fin_suscripcion, nikamed_vence_en, now()))
                                   + make_interval(days => p_dias),
           nikamed_vence_en = greatest(now(), coalesce(fecha_fin_suscripcion, nikamed_vence_en, now()))
                              + make_interval(days => p_dias)
     where id = p_user;
end $$;

revoke all on function public.admin_extender_nikamed(uuid, integer) from public, anon;
grant execute on function public.admin_extender_nikamed(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------
-- BLOQUE 3 · Quitar NikaMed+ a mano (vuelve a 'free'). Solo admin.
-- ---------------------------------------------------------------------
create or replace function public.admin_quitar_nikamed(p_user uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
    if not public.is_admin() then
        raise exception 'forbidden';
    end if;

    update public.profiles
       set tipo_cuenta = 'free',
           plan_activo = null,
           fecha_fin_suscripcion = null,
           nikamed_vence_en = null
     where id = p_user;
end $$;

revoke all on function public.admin_quitar_nikamed(uuid) from public, anon;
grant execute on function public.admin_quitar_nikamed(uuid) to authenticated;
