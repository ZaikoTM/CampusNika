"""
Lógica de negocio de las suscripciones: otorgar acceso premium tras un
pago aprobado, y hacer downgrade automático cuando vencen.

Todo pasa por acá — el webhook llama a `otorgar_acceso_premium`, y tanto
el login como el cron job llaman a las funciones de downgrade.
"""

from datetime import datetime, timedelta, timezone

from config import PLANES
from db import get_db


# Orden de los planes: si alguien renueva con otro plan mientras tiene uno vigente,
# plan_activo conserva el de mayor nivel (la fecha de fin suma ambos períodos igual).
_NIVEL_PLAN = {"mensual": 1, "semestral": 2, "anual": 3}


def _parse_fecha(valor):
    if not valor:
        return None
    try:
        return datetime.fromisoformat(str(valor).replace("Z", "+00:00"))
    except ValueError:
        return None


def otorgar_acceso_premium(user_id: str, plan_key: str, mp_payment_id: str) -> dict:
    """
    Otorga (o extiende) el acceso premium de un usuario tras un pago
    APROBADO y ya validado por el webhook.

    Reglas:
      - Los días sumados salen de PLANES[plan]["dias"] (30 / 183 / 365).
      - Si el usuario ya es premium y su suscripción sigue vigente, el
        nuevo período se SUMA a partir de la fecha de fin actual (no se
        pisa) y se conserva su fecha de inicio original.
      - Si no es premium o ya venció, arranca desde `ahora`.
    """
    if plan_key not in PLANES:
        raise ValueError(f"Plan desconocido: {plan_key}")

    plan = PLANES[plan_key]
    db = get_db()

    perfil = (
        db.table("profiles")
        .select("tipo_cuenta, plan_activo, fecha_inicio_suscripcion, fecha_fin_suscripcion")
        .eq("id", user_id)
        .single()
        .execute()
        .data
    ) or {}

    ahora = datetime.now(timezone.utc)
    fin_previo = _parse_fecha(perfil.get("fecha_fin_suscripcion"))
    vigente = perfil.get("tipo_cuenta") == "premium" and fin_previo is not None and fin_previo > ahora

    base = fin_previo if vigente else ahora
    nueva_fecha_fin = base + timedelta(days=plan["dias"])

    inicio = (_parse_fecha(perfil.get("fecha_inicio_suscripcion")) or ahora) if vigente else ahora
    plan_final = plan_key
    if vigente and _NIVEL_PLAN.get(perfil.get("plan_activo"), 0) > _NIVEL_PLAN[plan_key]:
        plan_final = perfil["plan_activo"]

    db.table("profiles").update({
        "tipo_cuenta": "premium",
        "plan_activo": plan_final,
        "fecha_inicio_suscripcion": inicio.isoformat(),
        "fecha_fin_suscripcion": nueva_fecha_fin.isoformat(),
        "nikamed_vence_en": nueva_fecha_fin.isoformat(),
        "id_transaccion_mp": mp_payment_id,
    }).eq("id", user_id).execute()

    return {"fecha_fin_suscripcion": nueva_fecha_fin.isoformat(), "meses_otorgados": plan["meses"]}


def verificar_y_downgrade_si_corresponde(user_id: str) -> bool:
    """
    Se llama EN CADA LOGIN (ver app.py /api/auth/post-login). Si la
    suscripción del usuario ya venció, la función SQL hace el downgrade
    ahí mismo y devuelve True. Es la doble red de seguridad además del
    cron job, para que un usuario nunca vea privilegios premium
    "fantasma" aunque el cron todavía no haya corrido.
    """
    db = get_db()
    resultado = db.rpc("fn_downgrade_si_vencido", {"p_user_id": user_id}).execute()
    return bool(resultado.data)


def job_downgrade_masivo() -> int:
    """
    Cron job (correr cada 1 hora, por ejemplo vía APScheduler, Render Cron
    Jobs, GitHub Actions o pg_cron directamente en Supabase — ver el SQL).
    Baja a 'free' a TODOS los usuarios premium cuya fecha_fin_suscripcion
    ya pasó, sin depender de que ese usuario haga login.
    """
    db = get_db()
    resultado = db.rpc("fn_downgrade_suscripciones_vencidas").execute()
    filas_afectadas = resultado.data or 0
    print(f"[cron] downgrade masivo: {filas_afectadas} cuenta(s) bajadas a free.")
    return filas_afectadas


if __name__ == "__main__":
    # Permite correr este archivo directo como cron job standalone:
    #   python subscription_manager.py
    job_downgrade_masivo()
