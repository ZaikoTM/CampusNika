"""
Servicio de integración con Mercado Pago (SDK oficial de Python).

Responsable de:
  - Crear la Preferencia de Pago (Checkout Pro) para un plan dado.
  - Consultar un pago puntual por su ID (usado por el webhook).

pip install mercadopago
"""

import uuid
import mercadopago

from config import (
    MP_ACCESS_TOKEN,
    MP_BACK_URL_SUCCESS,
    MP_BACK_URL_PENDING,
    MP_BACK_URL_FAILURE,
    MP_NOTIFICATION_URL,
    PLANES,
)

sdk = mercadopago.SDK(MP_ACCESS_TOKEN)


class PlanInvalidoError(Exception):
    """El plan solicitado no existe en nuestro catálogo server-side."""


def crear_preferencia_pago(user_id: str, mp_external_ref: str, plan_key: str) -> dict:
    """
    Crea una Preferencia de Pago (Checkout Pro) para el plan indicado.

    IMPORTANTE — anti-manipulación de precios:
    El monto y el nombre del plan se leen del diccionario PLANES definido
    en config.py (server-side). Nunca se recibe el precio desde el
    frontend, así que es imposible que alguien pague $1 por un plan
    inspeccionando y modificando el request en el navegador.

    `mp_external_ref` es el `profiles.mp_subscriber_external_ref` del
    usuario (un UUID separado de su id real), que viaja en
    `external_reference` y es lo que usamos en el webhook para saber a
    quién otorgarle el acceso — sin depender de nada que el cliente
    pueda mandar directamente sobre sí mismo.
    """
    if plan_key not in PLANES:
        raise PlanInvalidoError(f"Plan desconocido: {plan_key}")

    plan = PLANES[plan_key]

    # idempotency key: evita que un doble click / reintento de red cree
    # dos preferencias (y por lo tanto dos cobros) para la misma acción.
    idempotency_key = str(uuid.uuid4())

    preference_data = {
        "items": [
            {
                "id": f"nikamed-plus-{plan_key}",
                "title": plan["nombre"],
                "description": "Suscripción premium Campus Nika MED",
                "category_id": "education",
                "quantity": 1,
                "currency_id": "ARS",
                "unit_price": float(plan["precio"]),
            }
        ],
        # external_reference: la clave que atamos al usuario. Va y vuelve
        # intacta en la notificación del webhook.
        "external_reference": mp_external_ref,
        "metadata": {
            "user_id": user_id,
            "plan": plan_key,
        },
        "back_urls": {
            "success": MP_BACK_URL_SUCCESS,
            "pending": MP_BACK_URL_PENDING,
            "failure": MP_BACK_URL_FAILURE,
        },
        "auto_return": "approved",
        "notification_url": MP_NOTIFICATION_URL,
        "statement_descriptor": "CAMPUSNIKAMED",
        "binary_mode": True,  # evita estados intermedios raros: o approved o rejected
    }

    request_options = mercadopago.config.RequestOptions()
    request_options.custom_headers = {"x-idempotency-key": idempotency_key}

    result = sdk.preference().create(preference_data, request_options)

    if result["status"] not in (200, 201):
        raise RuntimeError(f"Error creando preferencia en MP: {result}")

    body = result["response"]
    return {
        "preference_id": body["id"],
        "init_point": body["init_point"],  # URL de Checkout Pro para redirigir al usuario
    }


def obtener_pago(payment_id: str) -> dict:
    """Consulta un pago por ID directamente contra la API de MP (fuente de verdad)."""
    result = sdk.payment().get(payment_id)
    if result["status"] != 200:
        raise RuntimeError(f"No se pudo obtener el pago {payment_id} de MP: {result}")
    return result["response"]
