"""
Campus Nika MED — Backend de suscripciones NikaMed+
=====================================================

pip install flask flask-cors mercadopago supabase pyjwt python-dotenv

Variables de entorno requeridas (ver config.py):
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET,
  MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET

Correr en desarrollo:
  python app.py
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS

from db import get_db
from security import requiere_login, requiere_premium, validar_firma_webhook_mp
from mercadopago_service import crear_preferencia_pago, obtener_pago, PlanInvalidoError
from subscription_manager import (
    otorgar_acceso_premium,
    verificar_y_downgrade_si_corresponde,
)

app = Flask(__name__)

# Habilita peticiones cruzadas (CORS) para permitir la comunicación
# fluida entre el frontend (Live Server / Vercel) y esta API de Flask.
CORS(app, resources={r"/api/*": {"origins": "*"}})


# =============================================================================
# 1) CREAR PREFERENCIA DE PAGO (llamado desde nikamed-plus.html)
# =============================================================================

@app.route("/api/suscripciones/crear-preferencia", methods=["POST"])
@requiere_login
def crear_preferencia():
    body = request.get_json(silent=True) or {}
    plan_key = body.get("plan")

    if plan_key not in ("mensual", "semestral", "anual"):
        return jsonify({"error": "Plan inválido."}), 400

    db = get_db()
    perfil = (
        db.table("profiles")
        .select("mp_subscriber_external_ref")
        .eq("id", g.user_id)
        .single()
        .execute()
        .data
    )
    if not perfil:
        return jsonify({"error": "Perfil no encontrado."}), 404

    try:
        preferencia = crear_preferencia_pago(
            user_id=g.user_id,
            mp_external_ref=perfil["mp_subscriber_external_ref"],
            plan_key=plan_key,
        )
    except PlanInvalidoError as e:
        return jsonify({"error": str(e)}), 400

    # Registramos el intento de pago (estado 'pending') para trazabilidad
    from config import PLANES
    db.table("pagos_mercadopago").insert({
        "user_id": g.user_id,
        "plan": plan_key,
        "mp_preference_id": preferencia["preference_id"],
        "mp_external_reference": perfil["mp_subscriber_external_ref"],
        "estado": "pending",
        "monto": PLANES[plan_key]["precio"],
    }).execute()

    return jsonify({"init_point": preferencia["init_point"]})


# =============================================================================
# 2) WEBHOOK DE MERCADO PAGO (IPN) — única vía que otorga acceso premium
# =============================================================================

@app.route("/api/webhooks/mercadopago", methods=["POST"])
@app.route("/api/suscripciones/webhook", methods=["POST"])
def webhook_mercadopago():
    """
    Mercado Pago llama a esta ruta cuando cambia el estado de un pago.
    Reglas de seguridad estrictas:
      1) Se valida SIEMPRE la firma (x-signature) antes de tocar nada.
      2) El estado del pago se vuelve a consultar contra la API de MP,
         para evitar falsificación de notificaciones.
      3) El otorgamiento de acceso es idempotente: si el mismo
         mp_payment_id ya fue procesado antes, no se vuelve a aplicar.
      4) Responde 200 siempre que procesó o descartó la notificación.
    """
    if not validar_firma_webhook_mp(request):
        return jsonify({"error": "Firma inválida."}), 401

    query_type = request.args.get("type") or request.args.get("topic")
    data_id = request.args.get("data.id") or request.args.get("id")

    body = request.get_json(silent=True) or {}
    tipo = query_type or body.get("type")
    payment_id = data_id or str(body.get("data", {}).get("id", ""))

    # Solo nos interesan las notificaciones de pagos.
    if tipo != "payment" or not payment_id:
        return jsonify({"status": "ignorado"}), 200

    # Fuente de verdad real: consultamos el pago directo a la API de MP
    pago = obtener_pago(payment_id)

    db = get_db()

    # Idempotencia: si ya procesamos este payment_id como aprobado, salimos.
    ya_procesado = (
        db.table("pagos_mercadopago")
        .select("id, estado")
        .eq("mp_payment_id", payment_id)
        .execute()
        .data
    )
    if ya_procesado and ya_procesado[0]["estado"] == "approved":
        return jsonify({"status": "ya procesado"}), 200

    external_reference = pago.get("external_reference")
    estado_mp = pago.get("status")  # approved | pending | rejected | ...
    metadata = pago.get("metadata") or {}
    plan_key = metadata.get("plan")
    user_id = metadata.get("user_id")

    if not external_reference or not plan_key or not user_id:
        return jsonify({"status": "sin referencia válida, ignorado"}), 200

    # Actualizamos o insertamos el registro de auditoría con el estado real.
    registro_existente = (
        db.table("pagos_mercadopago")
        .select("id")
        .eq("mp_external_reference", external_reference)
        .eq("plan", plan_key)
        .eq("estado", "pending")
        .order("creado_en", desc=True)
        .limit(1)
        .execute()
        .data
    )

    update_payload = {
        "mp_payment_id": payment_id,
        "mp_merchant_order_id": str(pago.get("order", {}).get("id", "")),
        "estado": estado_mp,
        "webhook_payload": pago,
    }

    if registro_existente:
        db.table("pagos_mercadopago").update(update_payload).eq(
            "id", registro_existente[0]["id"]
        ).execute()
    else:
        update_payload.update({
            "user_id": user_id,
            "plan": plan_key,
            "mp_external_reference": external_reference,
            "monto": pago.get("transaction_amount", 0),
        })
        db.table("pagos_mercadopago").insert(update_payload).execute()

    # SOLO si Mercado Pago confirma "approved" otorgamos el acceso premium.
    if estado_mp == "approved":
        resultado = otorgar_acceso_premium(user_id=user_id, plan_key=plan_key, mp_payment_id=payment_id)
        db.table("pagos_mercadopago").update({
            "meses_otorgados": resultado["meses_otorgados"],
            "procesado_en": "now()",
        }).eq("mp_payment_id", payment_id).execute()

    return jsonify({"status": "ok"}), 200


# =============================================================================
# 3) CHEQUEO DE EXPIRACIÓN EN CADA LOGIN (doble red de seguridad + cron)
# =============================================================================

@app.route("/api/auth/post-login", methods=["POST"])
@requiere_login
def post_login():
    """
    Revalida server-side si la suscripción del usuario venció
    y la baja a 'free' si corresponde antes de devolver el estado.
    """
    downgradeado = verificar_y_downgrade_si_corresponde(g.user_id)

    db = get_db()
    perfil = (
        db.table("profiles")
        .select("tipo_cuenta, plan_activo, fecha_fin_suscripcion")
        .eq("id", g.user_id)
        .single()
        .execute()
        .data
    )

    return jsonify({
        "tipo_cuenta": perfil["tipo_cuenta"],
        "plan_activo": perfil["plan_activo"],
        "fecha_fin_suscripcion": perfil["fecha_fin_suscripcion"],
        "downgrade_aplicado_ahora": downgradeado,
    })


# =============================================================================
# 4) EJEMPLO: endpoint exclusivo de NikaMed+, protegido de punta a punta
# =============================================================================

@app.route("/api/premium/shock-room/nuevo-caso", methods=["POST"])
@requiere_login
@requiere_premium
def nuevo_caso_shock_room():
    return jsonify({"caso": "Contenido exclusivo de NikaMed+ generado correctamente."})


if __name__ == "__main__":
    app.run(debug=True, port=5000)