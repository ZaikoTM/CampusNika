"""
Lógica de negocio de las suscripciones: otorgar acceso premium tras un
pago aprobado, y hacer downgrade automático cuando vencen.

Todo pasa por acá — el webhook llama a `otorgar_acceso_premium`, y tanto
el login como el cron job llaman a las funciones de downgrade.
"""

from datetime import datetime, timedelta, timezone

from config import PLANES
from db import get_db


def otorgar_acceso_premium(user_id: str, plan_key: str, mp_payment_id: str) -> dict:
    """
    Otorga (o extiende) el acceso premium de un usuario tras un pago
    APROBADO y ya validado por el webhook.

    Reglas:
      - Si el usuario ya es premium y su suscripción sigue vigente, el
        nuevo período se SUMA a partir de la fecha de fin actual (no se
        pisa), para que renovar antes de que venza no le "robe" días.
      - Si no es premium o ya venció, arranca desde `ahora`.
    """
    if plan_key not in PLANES:
        raise ValueError(f"Plan desconocido: {plan_key}")

    meses = PLANES[plan_key]["meses"]
    db = get_db()

    perfil = (
        db.table("profiles")
        .select("tipo_cuenta, fecha_fin_suscripcion")
        .eq("id", user_id)
        .single()
        .execute()
        .data
    )

    ahora = datetime.now(timezone.utc)
    fecha_fin_actual = perfil.get("fecha_fin_suscripcion") if perfil else None

    if perfil and perfil.get("tipo_cuenta") == "premium" and fecha_fin_actual:
        fin_previo = datetime.fromisoformat(fecha_fin_actual.replace("Z", "+00:00"))
        base = fin_previo if fin_previo > ahora else ahora
    else:
        base = ahora

    nueva_fecha_fin = base + timedelta(days=30 * meses)  # ~30 días por mes contratado

    db.table("profiles").update({
        "tipo_cuenta": "premium",
        "plan_activo": plan_key,
        "fecha_inicio_suscripcion": ahora.isoformat(),
        "fecha_fin_suscripcion": nueva_fecha_fin.isoformat(),
        "id_transaccion_mp": mp_payment_id,
    }).eq("id", user_id).execute()

    return {"fecha_fin_suscripcion": nueva_fecha_fin.isoformat(), "meses_otorgados": meses}


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
