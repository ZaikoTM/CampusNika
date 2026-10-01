// ============================================================
// CAMPUS NIKA — supabase/functions/webhook-mercadopago/index.ts
// ------------------------------------------------------------
// Recibe la notificación de Mercado Pago cuando cambia el estado de un pago.
// Reglas de seguridad clave:
//   1. NUNCA se confía en el status/monto que venga en el body del webhook —
//      cualquiera puede simular un POST. Siempre se vuelve a consultar el
//      pago contra la API de MP con nuestro access token.
//   2. Idempotente: MP reintenta el mismo webhook varias veces; un payment_id
//      ya procesado no vuelve a aplicarse (tabla pagos_procesados, PK).
//   3. La suma de días es atómica en Postgres (RPC extender_nikamed_plus),
//      no un read-modify-write en TypeScript, para no perder actualizaciones
//      si dos notificaciones del mismo pago llegan casi juntas.
//
// Deploy: supabase functions deploy webhook-mercadopago --no-verify-jwt
//   (OBLIGATORIO: Mercado Pago llama sin JWT de Supabase; con la verificación
//    activada el gateway rechazaría todas las notificaciones con 401).
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
    "https://nikamed.com.ar",
    "https://www.nikamed.com.ar",
    "https://nikamed-campus.vercel.app",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
]);

function corsHeaders(origin: string | null) {
    // Mercado Pago llama a esta función server-to-server (sin Origin de
    // browser), así que esto en la práctica protege el caso de que alguien
    // intente pegarle desde un frontend ajeno con fetch(); no es la defensa
    // principal (esa es la re-verificación del pago contra la API de MP).
    const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
    return {
        "Access-Control-Allow-Origin": allow,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, x-signature, x-request-id",
        "Vary": "Origin",
    };
}

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Debe coincidir con los planes de crear-preferencia/index.ts.
const PLAN_DIAS: Record<string, number> = {
    mensual: 30,
    semestral: 183,
    anual: 365,
};

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

Deno.serve(async (req) => {
    const origin = req.headers.get("origin");
    const headers = { ...corsHeaders(origin), "Content-Type": "text/plain" };

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (req.method !== "POST") return new Response("method_not_allowed", { status: 405, headers });

    let body: any = {};
    try {
        body = await req.json();
    } catch {
        // Algunas notificaciones de MP llegan sin body (solo query string) —
        // no es un error todavía, seguimos y probamos con la URL.
    }

    const url = new URL(req.url);
    // MP manda distintas formas según el tipo de integración: webhooks nuevos
    // { type: 'payment', data: { id } } o IPN clásica ?topic=payment&id=...
    const type = body?.type || body?.topic || url.searchParams.get("type") || url.searchParams.get("topic");
    const paymentId = body?.data?.id || body?.id || url.searchParams.get("id") || url.searchParams.get("data.id");

    if (type !== "payment" || !paymentId) {
        // Ignoramos silenciosamente otros eventos (merchant_order, etc.) con
        // 200 para que MP no reintente algo que no vamos a procesar.
        return new Response("ok (evento ignorado)", { status: 200, headers });
    }

    // ------------------------------------------------------------
    // Única fuente de verdad: preguntarle a la API de MP por ESTE payment id,
    // con nuestro access token. Lo que haya llegado en el body del POST es
    // solo un "avisá que pasó algo" — nunca datos de pago confiables.
    // ------------------------------------------------------------
    const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!mpResp.ok) {
        console.error("[webhook-mercadopago] No se pudo verificar el pago en MP:", mpResp.status, paymentId);
        // 502 para que MP SÍ reintente (puede ser un problema transitorio nuestro o de MP).
        return new Response("no_se_pudo_verificar", { status: 502, headers });
    }
    const pago = await mpResp.json();

    if (pago.status !== "approved") {
        // Pendiente, rechazado, en revisión, etc.: todavía no hacemos nada.
        // Cuando MP vuelva a notificar con "approved", este mismo payment_id
        // entra de nuevo y recién ahí se procesa.
        return new Response(`ok (status=${pago.status})`, { status: 200, headers });
    }

    // La acreditación se guía SOLO por external_reference (el user_id del campus
    // que mandó crear-preferencia). El email/cuenta de MP del pagador NO se usa:
    // puede pagar un familiar, con saldo, tarjeta o débito.
    const userId: string | undefined = pago.external_reference;
    // Si MP no devolviera metadata.plan, se deduce del monto cobrado.
    const PLAN_POR_MONTO: Record<number, string> = { 5000: "mensual", 25000: "semestral", 45000: "anual" };
    const plan: string | undefined = pago.metadata?.plan || PLAN_POR_MONTO[Math.round(Number(pago.transaction_amount))];
    const dias = plan ? PLAN_DIAS[plan] : undefined;

    if (!userId || !dias) {
        console.error("[webhook-mercadopago] Pago aprobado sin external_reference/plan válido:", { paymentId, userId, plan });
        // 200 (no 4xx/5xx): el error es de datos, no algo que un reintento de
        // MP vaya a arreglar. Queda logueado para revisión manual.
        return new Response("ok (faltan datos del pago)", { status: 200, headers });
    }

    // ------------------------------------------------------------
    // Idempotencia: el INSERT falla con 23505 (unique_violation) si este
    // payment_id ya se procesó antes — así un reintento del mismo webhook
    // nunca vuelve a sumar días.
    // ------------------------------------------------------------
    const { error: dupeError } = await supabaseAdmin
        .from("pagos_procesados")
        .insert({ payment_id: String(paymentId), user_id: userId, plan });

    if (dupeError) {
        if (dupeError.code === "23505") {
            return new Response("ok (duplicado, ya procesado)", { status: 200, headers });
        }
        console.error("[webhook-mercadopago] Error registrando pago procesado:", dupeError);
        return new Response("error_interno", { status: 500, headers });
    }

    // Confirmamos que el perfil exista ANTES de tocar nada (maybeSingle: no
    // explota si no existe, simplemente data === null).
    const { data: perfil, error: perfilError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (perfilError || !perfil) {
        console.error("[webhook-mercadopago] Perfil no encontrado para userId:", userId, perfilError);
        // El pago quedó registrado en pagos_procesados con user_id inválido:
        // queda para revisión manual, pero no reintentamos infinito.
        return new Response("ok (perfil no encontrado)", { status: 200, headers });
    }

    // Suma de días 100% atómica en la base — ver comentario en la función SQL
    // (sql/03_pagos_mercadopago.sql) sobre por qué esto evita la race condition.
    const { error: extendError } = await supabaseAdmin.rpc("extender_nikamed_plus", {
        p_user_id: userId,
        p_dias: dias,
    });

    if (extendError) {
        console.error("[webhook-mercadopago] Error extendiendo NikaMed+:", extendError);
        // Sin esto el reintento de MP chocaría con el registro de idempotencia
        // ("duplicado, ya procesado") y el usuario pagaría sin recibir NikaMed+.
        await supabaseAdmin.from("pagos_procesados").delete().eq("payment_id", String(paymentId));
        return new Response("error_interno", { status: 500, headers });
    }

    console.log("[webhook-mercadopago] NikaMed+ acreditado", { paymentId, userId, plan, dias, metodo: pago.payment_method_id });

    return new Response("ok", { status: 200, headers });
});
