// ============================================================
// CAMPUS NIKA — supabase/functions/crear-preferencia/index.ts
// ------------------------------------------------------------
// Llamada por nikamed-plus.html (con el JWT del usuario logueado) para
// generar una preferencia de Checkout Pro y devolver la URL a la que
// redirigir. NUNCA se llama desde Mercado Pago — esa es webhook-mercadopago.
//
// Deploy: supabase functions deploy crear-preferencia --no-verify-jwt
//   (el usuario se valida acá adentro con supabaseAdmin.auth.getUser(token)).
// Secreto: SITE_URL = https://nikamed.com.ar  (para los back_urls de Mercado Pago)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCors } from "../_shared/cors.ts";

// ------------------------------------------------------------
// CORS: lo maneja ../_shared/cors.ts (nikamed.com.ar, www, Vercel y localhost).
// withCors responde el preflight OPTIONS, agrega las cabeceras CORS a todas las
// respuestas y convierte cualquier excepción no controlada en un 500 con CORS.
// ------------------------------------------------------------
const jsonHeaders = { "Content-Type": "application/json" };

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// URL pública de tu sitio, para los back_urls de MP y la URL del webhook.
const SITE_URL = (Deno.env.get("SITE_URL") || "https://nikamed.com.ar").replace(/\/+$/, "");

// plan -> { días (debe coincidir con PLAN_DIAS del webhook), precio en ARS,
// título mostrado en el checkout de MP }.
const PLANES: Record<string, { dias: number; precio: number; titulo: string }> = {
    mensual:   { dias: 30,  precio: 5000,  titulo: "NikaMed+ · Mensual" },
    semestral: { dias: 183, precio: 25000, titulo: "NikaMed+ · 6 meses" },
    anual:     { dias: 365, precio: 45000, titulo: "NikaMed+ · Anual" },
};

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

Deno.serve(withCors(async (req: Request): Promise<Response> => {
    const headers = jsonHeaders;

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers });
    }

    // ------------------------------------------------------------
    // Autenticación: el frontend manda "Authorization: Bearer <access_token>"
    // (ver obtenerTokenSesion() en nikamed-plus.html). Lo validamos contra
    // Supabase Auth ACÁ, en el servidor — nunca confiar en un user_id que
    // venga en el body.
    // ------------------------------------------------------------
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
        return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401, headers });
    }
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401, headers });
    }
    const userId = userData.user.id;
    const email = userData.user.email;

    // Confirmamos que el perfil exista antes de generar cualquier cobro.
    const { data: perfil, error: perfilError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
    if (perfilError || !perfil) {
        return new Response(JSON.stringify({ error: "profile_not_found" }), { status: 404, headers });
    }

    let body: { plan?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers });
    }
    const plan = body.plan;
    const config = plan ? PLANES[plan] : undefined;
    if (!config) {
        return new Response(JSON.stringify({ error: "invalid_plan" }), { status: 400, headers });
    }

    // ------------------------------------------------------------
    // Preferencia de Checkout Pro. external_reference = userId y
    // metadata.plan = plan: son los dos datos que webhook-mercadopago lee del
    // PAGO YA CONFIRMADO por la API de MP (no del webhook en sí) para saber a
    // quién y qué extender.
    // ------------------------------------------------------------
    const preferencia = {
        items: [
            {
                title: config.titulo,
                quantity: 1,
                unit_price: config.precio,
                currency_id: "ARS",
            },
        ],
        payer: { email },
        external_reference: userId,
        metadata: { plan },
        back_urls: {
            success: `${SITE_URL}/nikamed-plus.html?status=approved`,
            pending: `${SITE_URL}/nikamed-plus.html?status=pending`,
            failure: `${SITE_URL}/nikamed-plus.html?status=failure`,
        },
        auto_return: "approved",
        notification_url: `${SUPABASE_URL}/functions/v1/webhook-mercadopago`,
    };

    const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencia),
    });

    if (!mpResp.ok) {
        const detalle = await mpResp.text();
        console.error("[crear-preferencia] Mercado Pago rechazó la preferencia:", mpResp.status, detalle);
        return new Response(JSON.stringify({ error: "mp_error" }), { status: 502, headers });
    }

    const data = await mpResp.json();
    return new Response(JSON.stringify({ init_point: data.init_point }), { status: 200, headers });
}));
