"""
Avisos al administrador cuando alguien se suscribe a NikaMed+.

  1) Campanita del campus: una fila en `notifications` por cada perfil con role='admin'.
  2) Email vía Resend (https://resend.com), si hay RESEND_API_KEY y ADMIN_NOTIFY_EMAIL.

Nada de esto puede romper el otorgamiento del acceso premium: el webhook ya
acreditó al usuario cuando se llama acá, así que todo error se loguea y se ignora.
"""

import html
import json
import logging
import os
import urllib.request

from db import get_db

log = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "Campus Nika <onboarding@resend.dev>")


def _datos_suscriptor(user_id: str) -> dict:
    perfil = (
        get_db().table("profiles")
        .select("username, fullname")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return (perfil.data if perfil else None) or {}


def _notificar_campanita(user_id: str, texto: str) -> None:
    db = get_db()
    admins = db.table("profiles").select("id").eq("role", "admin").execute().data or []
    filas = [
        {"user_id": a["id"], "sender_id": user_id, "type": "suscripcion", "message": texto}
        for a in admins
    ]
    if filas:
        db.table("notifications").insert(filas).execute()


RESEND_FROM_SANDBOX = "Campus Nika <onboarding@resend.dev>"


def _enviar_email_desde(remitente: str, asunto: str, cuerpo_html: str) -> None:
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps({
            "from": remitente,
            "to": [ADMIN_NOTIFY_EMAIL],
            "subject": asunto,
            "html": cuerpo_html,
        }).encode("utf-8"),
        headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    urllib.request.urlopen(req, timeout=10).read()


def _enviar_email(asunto: str, cuerpo_html: str) -> None:
    if not (RESEND_API_KEY and ADMIN_NOTIFY_EMAIL):
        return
    try:
        _enviar_email_desde(RESEND_FROM, asunto, cuerpo_html)
    except Exception:
        # Típico mientras el dominio de RESEND_FROM todavía no está verificado en Resend:
        # se reintenta con el remitente de pruebas (solo entrega al email dueño de la cuenta).
        if RESEND_FROM == RESEND_FROM_SANDBOX:
            raise
        log.warning("[avisos_admin] Falló el envío desde %s; reintentando con el remitente de pruebas", RESEND_FROM)
        _enviar_email_desde(RESEND_FROM_SANDBOX, asunto, cuerpo_html)


def avisar_nueva_suscripcion(user_id: str, plan_key: str, monto, fecha_fin: str, mp_payment_id: str) -> None:
    try:
        datos = _datos_suscriptor(user_id)
        nombre = html.escape(datos.get("fullname") or "Un estudiante")
        alias = html.escape(datos.get("username") or "")
        monto_txt = f"${float(monto):,.0f}".replace(",", ".") if monto else "—"
        fin = (fecha_fin or "")[:10]

        # `message` se pinta como HTML en la campanita: todo dato de usuario va escapado.
        texto = (f"💳 <strong>{nombre}</strong> (@{alias}) se suscribió a NikaMed+ "
                 f"({html.escape(plan_key)}, {monto_txt}). Vence el {html.escape(fin)}.")
        try:
            _notificar_campanita(user_id, texto)
        except Exception:
            log.exception("[avisos_admin] No se pudo crear la notificación en la campanita")

        try:
            _enviar_email(
                f"Nueva suscripción NikaMed+: {datos.get('fullname') or alias}",
                f"<p>{texto}</p><p>ID de pago de Mercado Pago: {html.escape(str(mp_payment_id))}</p>",
            )
        except Exception:
            log.exception("[avisos_admin] No se pudo enviar el email")
    except Exception:
        log.exception("[avisos_admin] Error inesperado avisando la suscripción")
