"""
Configuración centralizada del backend de suscripciones NikaMed+.

Todas las claves sensibles se leen SIEMPRE de variables de entorno.
Nunca hardcodees el Access Token de MercadoPago ni la Service Role Key
de Supabase en el código fuente.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# --- Cargar archivo .env ---------------------------------------------------
# Se ubica explícitamente en el mismo directorio que este archivo config.py
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# --- Supabase --------------------------------------------------------------
SUPABASE_URL = os.environ["SUPABASE_URL"]

# La Service Role Key bypassea RLS: SOLO se usa en el backend (nunca en el
# frontend) y es la que nos permite escribir tipo_cuenta/fechas de
# suscripción en `profiles`, que el propio usuario no puede tocar por RLS.
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# JWT secret de Supabase, para validar el token del usuario que llega desde
# el frontend en el header Authorization al pedir una preferencia de pago.
SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

# --- Mercado Pago ------------------------------------------------------------
MP_ACCESS_TOKEN = os.environ["MP_ACCESS_TOKEN"]          # Access Token PRIVADO (server-side)

# Secreto de firma del webhook, se obtiene en:
# Tus integraciones > [Tu app] > Webhooks > Detalles de configuración
MP_WEBHOOK_SECRET = os.environ["MP_WEBHOOK_SECRET"]

# URLs a las que MP redirige al usuario según el resultado del pago,
# y URL pública del webhook (debe ser HTTPS en producción).
MP_BACK_URL_SUCCESS = os.environ.get(
    "MP_BACK_URL_SUCCESS", 
    "https://nikamed-campus.vercel.app/nikamed-plus.html?status=approved"
)
MP_BACK_URL_PENDING = os.environ.get(
    "MP_BACK_URL_PENDING", 
    "https://nikamed-campus.vercel.app/nikamed-plus.html?status=pending"
)
MP_BACK_URL_FAILURE = os.environ.get(
    "MP_BACK_URL_FAILURE", 
    "https://nikamed-campus.vercel.app/nikamed-plus.html?status=failure"
)
MP_NOTIFICATION_URL = os.environ.get(
    "MP_NOTIFICATION_URL", 
    "https://api.campusnikamed.com/api/webhooks/mercadopago"
)

# --- Catálogo de planes ------------------------------------------------------
# Espejo de la tabla `planes_nikamed` (SQL). Tenerlo también acá permite
# armar la preferencia sin una consulta extra, pero el backend SIEMPRE
# valida contra la base antes de otorgar acceso (ver subscription_manager).
PLANES = {
    "mensual":   {"nombre": "NikaMed+ Mensual",  "meses": 1,  "precio": 5000.00},
    "semestral": {"nombre": "NikaMed+ 6 Meses",  "meses": 6,  "precio": 25000.00},
    "anual":     {"nombre": "NikaMed+ Anual",    "meses": 12, "precio": 45000.00},
}