"""
Seguridad server-side: NADA de esto depende del cliente.

Contiene:
  1) validar_firma_webhook_mp: valida el header x-signature que manda MP,
     según la documentación oficial de "Validación de origen".
  2) requiere_login: valida el token del usuario llamando directamente a
     Supabase Auth (GET /auth/v1/user vía el SDK), en vez de decodificar
     el JWT en local. Esto evita el 401 que rompía con el esquema nuevo
     de firmas asimétricas (ES256 / JWKS) de Supabase: no nos importa
     con qué algoritmo esté firmado el token, porque es el propio
     servidor de Supabase el que lo valida por nosotros.
  3) requiere_premium: decorador que, ADEMÁS de requerir login, verifica
     en la base de datos (no en el token, no en localStorage) si el
     usuario tiene privilegios premium activos AHORA MISMO.
"""

import hmac
import hashlib
from functools import wraps

from flask import request, jsonify, g

from config import MP_WEBHOOK_SECRET
from db import get_db


# =============================================================================
# 1) VALIDACIÓN DE FIRMA DEL WEBHOOK DE MERCADO PAGO
# =============================================================================

def validar_firma_webhook_mp(request) -> bool:
    """
    Verifica que la notificación realmente provenga de Mercado Pago,
    siguiendo el esquema oficial de x-signature / x-request-id.

    Manifest a firmar: "id:{data_id};request-id:{x-request-id};ts:{ts};"
    Comparación con HMAC-SHA256 usando el Webhook Secret de tu integración.

    Referencia: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
    """
    x_signature = request.headers.get("x-signature", "")
    x_request_id = request.headers.get("x-request-id", "")

    if not x_signature or not x_request_id:
        return False

    # x-signature viene como "ts=173...,v1=abcdef..."
    partes = dict(p.split("=", 1) for p in x_signature.split(",") if "=" in p)
    ts = partes.get("ts")
    v1_recibido = partes.get("v1")

    if not ts or not v1_recibido:
        return False

    # El data.id puede venir en query string (?data.id=XXXX) o en el body.
    data_id = request.args.get("data.id") or request.args.get("id") or ""
    if not data_id:
        body = request.get_json(silent=True) or {}
        data_id = str(body.get("data", {}).get("id", ""))

    manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"

    firma_calculada = hmac.new(
        key=MP_WEBHOOK_SECRET.encode("utf-8"),
        msg=manifest.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    # Comparación en tiempo constante: evita timing attacks.
    return hmac.compare_digest(firma_calculada, v1_recibido)


# =============================================================================
# 2) AUTENTICACIÓN: resolver el usuario real validando contra Supabase Auth
# =============================================================================
#
# Por qué NO decodificamos el JWT nosotros mismos:
#   Supabase ahora puede firmar los tokens de sesión con claves asimétricas
#   (ES256) publicadas vía JWKS, en vez del HS256 simétrico de antes. Un
#   `jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])` rompe
#   apenas el proyecto usa ese esquema nuevo, porque el secreto simétrico
#   ya no sirve para verificar la firma. En vez de mantener un cache de
#   JWKS nosotros mismos, delegamos la validación directamente al propio
#   servidor de Auth de Supabase: es la fuente de verdad y funciona sin
#   importar qué algoritmo de firma esté usando el proyecto.

def _resolver_user_id_desde_token() -> str | None:
    """
    Extrae el Bearer token del header Authorization y lo valida llamando
    a `auth.get_user(token)` sobre el cliente de Supabase (equivalente a
    GET /auth/v1/user con ese token). Si el token es válido y no expiró,
    Supabase nos devuelve el usuario real; devolvemos su `id`.

    Nunca se acepta un user_id que venga suelto en el body o en query
    params: la única fuente de verdad es la respuesta de Supabase Auth.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None

    try:
        db = get_db()
        respuesta = db.auth.get_user(token)
        usuario = getattr(respuesta, "user", None)
        return usuario.id if usuario else None
    except Exception as e:
        # Cubre token expirado, malformado, revocado, o cualquier error
        # de red/HTTP contra el servidor de Auth de Supabase.
        print(f"[auth] Token inválido o expirado: {e}")
        return None


def requiere_login(f):
    """Exige un token de sesión de Supabase válido. Inyecta g.user_id con el ID real."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = _resolver_user_id_desde_token()
        if not user_id:
            return jsonify({"error": "No autenticado."}), 401
        g.user_id = user_id
        return f(*args, **kwargs)
    return wrapper


# =============================================================================
# 3) DECORADOR ANTI-BYPASS: requiere premium ACTIVO, verificado en la DB
# =============================================================================

def requiere_premium(f):
    """
    Decorador para proteger cualquier endpoint/acción exclusiva de
    NikaMed+ (por ejemplo: generar un caso de Shock Room, usar el
    Asistente Nika con NotebookLM, iniciar el Examen Final ECOE, etc.).

    Por diseño:
      - No confía en ningún valor mandado por el cliente (ni un flag
        "premium: true" en el body, ni una cookie, ni localStorage).
      - Vuelve a consultar la base de datos en cada llamada, invocando
        la función SQL `fn_es_premium_activo`, que además hace
        "self-healing": si la suscripción venció, la baja a free ahí
        mismo antes de contestar.
      - Es imposible de saltear inspeccionando elementos o manipulando
        el frontend, porque el frontend nunca decide esto: solo el
        backend, contra la base de datos, en cada request.

    Uso:
        @app.route("/api/premium/shock-room/nuevo-caso", methods=["POST"])
        @requiere_login
        @requiere_premium
        def nuevo_caso_shock_room():
            ...
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = getattr(g, "user_id", None)
        if not user_id:
            # Defensa extra por si algún día se usa este decorador solo,
            # sin @requiere_login antes.
            return jsonify({"error": "No autenticado."}), 401

        db = get_db()
        resultado = db.rpc("fn_es_premium_activo", {"p_user_id": user_id}).execute()
        es_premium = bool(resultado.data)

        if not es_premium:
            return jsonify({
                "error": "Esta función es exclusiva de NikaMed+.",
                "codigo": "PREMIUM_REQUIRED",
            }), 403

        return f(*args, **kwargs)
    return wrapper

