// supabase/functions/evaluar-simulacion/index.ts
//
// CAMPUS NIKA — Sprint 4
//   · Módulo A: Telemetría de IA y Sistema de Créditos (cobro por caso completo
//     + bypass admin, este último vive en la RPC descontar_creditos)
//   · Módulo B: Modo Final y Motor de Evaluación por 4 Pilares
//   · Módulo C (nuevo): 2 usos de cortesía gratis por simulador para usuarios
//     sin créditos, validados en el SERVIDOR (RPC consumir_uso_gratis) — ver
//     nota más abajo, junto a LIMITE_USOS_GRATIS_CORTESIA.
// ----------------------------------------------------------------------------
// Despacha un turno de simulación (Pase de Sala / Shock Room / Consultorio) a
// Gemini, pero ANTES verifica y descuenta créditos del usuario autenticado, y
// DESPUÉS de una respuesta exitosa registra el consumo real en ai_usage_logs.
//
// FIX (post-Sprint 4): esta función se había quedado "pensando" sin devolver
// nada — a diferencia de evaluar-examen-escrito, NO tenía timeout propio ni
// reintentos sobre el fetch a Gemini, así que un cuelgue de la API (o un modelo
// con "thinking" habilitado consumiendo el presupuesto de tokens) la dejaba
// colgada hasta que el cliente cortaba a los 45s sin ninguna respuesta limpia.
// Ahora el fetch a Gemini tiene su propio AbortController con timeout (20s) y
// hace hasta 3 intentos con backoff, igual que evaluar-examen-escrito.
//
// Contrato con el cliente (examen.html / llamarEdgeFunctionSimulador):
//   Request  body: {
//     modo, submodo, tematica?, system_prompt, historial, mensaje,
//     es_primer_turno?: boolean,   // true = arranque de caso (cobra), false = turno de continuación (gratis)
//     accion?: 'evaluar_caso',     // cierre/evaluación final del caso (siempre gratis)
//     es_cortesia_gratis?: boolean,// pista informativa del cliente (ver nota de seguridad abajo) — NO es la fuente de verdad
//   }
//   Response 200 : { texto: string }  — turno de diálogo en texto plano, o el JSON
//                                        de evaluación de 4 pilares si el caso cerró
//                                        (según parsearEvaluacionFinalSimulador del cliente)
//   Response 402 : { error: "creditos_insuficientes", mensaje: string }
//   Response 401 : { error: "no_autenticado", mensaje: string }
//   Response 5xx : { error: string, mensaje?: string }
//
// Variables de entorno esperadas (Project Settings → Edge Functions → Secrets):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY  (ya las inyecta
//   Supabase automáticamente en todo Edge Function), y GEMINI_API_KEY.
//   Opcional: GEMINI_MODEL (default "gemini-flash-lite-latest" — modelo estable
//   y rápido de la familia 2.x, sin "thinking"). Si preferís forzar la familia
//   3.x (más lenta por el razonamiento interno, aunque "minimal"), configurá
//   GEMINI_MODEL="gemini-3.5-flash-lite" a propósito.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCors } from "../_shared/cors.ts";
// [Sprint 3] Modelo por plan y cupo de Gemini compartidos con el tribunal escrito (ver _shared/evaluador.ts).
import { consultarPlan, MODEL as MODELO_PREMIUM, MODELO_GRATIS, MODELO_RESPALDO, reservarCupo, limitesDe } from "../_shared/evaluador.ts";

// CORS (orígenes permitidos, preflight OPTIONS, cabeceras en todas las respuestas y captura de
// errores no controlados) lo maneja ../_shared/cors.ts. Acá solo queda el Content-Type.
const JSON_HEADERS = { "Content-Type": "application/json" };

// ---------------------------------------------------------------------------
// Costo por simulador, en créditos. Los submodos "simples" (sin systemPrompt
// pesado, o turnos menores tipo choice/escrito que no pasan por acá) caen al
// valor por defecto de 1 crédito.
// ---------------------------------------------------------------------------
const COSTO_POR_SIMULADOR: Record<string, number> = {
    'ecoe_final': 3, // <-- AGREGAR ESTA LÍNEA
    'pase_sala': 3,
    'shock_room': 3,
    'consultorio_legales': 3,
    'caso_pfo': 0,   // práctica con el evaluador en los casos clínicos de la PFO: exclusivo NikaMed+, no descuenta créditos (ver el chequeo de plan más abajo)
};
const COSTO_DEFAULT = 1;

// ---------------------------------------------------------------------------
// Módulo C — 2 usos de cortesía gratis por simulador (Sprint "NikaMed+ Paso 2").
// ----------------------------------------------------------------------------
// El frontend (examen.html) ya lleva un contador propio en localStorage/cookie
// para mostrar el badge "2 usos gratis" / "1 uso restante" en las tarjetas —
// eso es solo COSMÉTICO. Confiar en el flag `es_cortesia_gratis` que manda el
// cliente para saltear el cobro de créditos sería trivial de falsificar desde
// la consola del navegador (cualquiera hace `fetch(...).body` a mano con ese
// campo en true). Por eso la fuente de verdad de la cortesía vive ACÁ, en una
// RPC con su propia tabla (usos_gratis_simulador), igual de "autoritativa" que
// descontar_creditos: solo se consulta cuando el usuario YA no tiene créditos
// reales (para no gastar cortesía de arriba si tiene saldo), y solo cuenta un
// uso una vez por simulador hasta el límite. Ver el SQL sugerido al final de
// este archivo (como comentario) para crear la tabla + la RPC en Postgres.
// ---------------------------------------------------------------------------
const LIMITE_USOS_GRATIS_CORTESIA = 2;

// Precios de Gemini Flash-Lite, en USD por millón de tokens.
const PRECIO_INPUT_POR_MILLON = 0.30;
const PRECIO_OUTPUT_POR_MILLON = 2.50;

// Modelo: por defecto "gemini-flash-lite-latest" (familia 2.x, sin "thinking",
// rápido y estable — el que veníamos usando cuando andaba bien). Se puede
// pisar con GEMINI_MODEL (o el nombre viejo GEMINI_MODEL_EVAL) en los secrets.
// [Sprint 3] El modelo ya no está fijo: NikaMed+/admin usan MODELO_BASE y los gratuitos MODELO_GRATIS
// (secreto GEMINI_MODEL_GRATIS; si no existe es el mismo). Antes el default era "gemini-flash-lite-latest",
// un modelo distinto del tribunal escrito, con su propio cupo y fuera del contador: ahora ambos usan
// GEMINI_MODEL_EVAL (default gemini-3.5-flash-lite) y comparten el limitador. GEMINI_MODEL, si está
// cargado, sigue teniendo prioridad para este simulador.
const MODELO_BASE = Deno.env.get("GEMINI_MODEL") || MODELO_PREMIUM;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

// Espera máxima (segundos) por cupo de Gemini antes de pedirle al cliente que reintente.
const CUPO_ESPERA_MAX_S = 10;

// Timeout + reintentos del fetch a Gemini (independiente del timeout que tiene
// el cliente en llamarEdgeFunctionSimulador). Si Gemini no contesta en este
// plazo abortamos y reintentamos, en vez de quedarnos colgados hasta que el
// cliente corte la conexión sin que nosotros hayamos hecho nada.
const GEMINI_TIMEOUT_MS = 28000;
const GEMINI_MAX_INTENTOS = 2;

function jsonResponse(status: number, body: unknown) {
    return new Response(JSON.stringify(body), {
        status,
        headers: JSON_HEADERS,
    });
}

// Cobro por CASO CLÍNICO COMPLETO, no por turno: el costo del simulador
// (3 créditos Pase de Sala, 4 Shock Room, etc.) se aplica únicamente en el
// primer turno del caso (es_primer_turno === true). Cualquier turno subsiguiente
// dentro del mismo caso activo cuesta 0 créditos.
//
// accion === 'evaluar_caso' (cierre/Módulo B) es SIEMPRE gratis: es la
// auditoría docente del caso, no un turno nuevo de simulación.
function costoSimulador(modo: string | null | undefined, esPrimerTurno: boolean, accion: string | null | undefined): number {
    if (accion === "evaluar_caso") return 0;
    if (!esPrimerTurno) return 0;
    if (!modo) return COSTO_DEFAULT;
    return COSTO_POR_SIMULADOR[modo] ?? COSTO_DEFAULT;
}

// Traduce el historial de chat del formato del frontend ({rol:'usuario'|'ia', texto})
// al formato de "contents" que espera la API de Gemini.
function historialAContents(historial: Array<{ rol: string; texto: string }>, mensaje: string) {
    const contents = (Array.isArray(historial) ? historial : []).map((m) => ({
        role: m.rol === "ia" ? "model" : "user",
        parts: [{ text: String(m.texto ?? "") }],
    }));
    contents.push({ role: "user", parts: [{ text: String(mensaje ?? "") }] });
    return contents;
}

function esperar(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mira (sin consumir) si el modelo tiene cupo ahora. 0 = hay · >0 = segundos hasta el próximo minuto ·
// -1 = cupo diario agotado. Si la base falla, se asume que hay cupo.
async function cupoLibre(admin: any, modelo: string): Promise<number> {
    const { rpm, rpd } = limitesDe(modelo);
    try {
        const { data, error } = await admin.rpc("gemini_cupo_libre", { p_modelo: modelo, p_rpm: rpm, p_rpd: rpd });
        if (error || typeof data !== "number") { console.error("[evaluar-simulacion] gemini_cupo_libre falló:", error?.message); return 0; }
        return data;
    } catch (e) {
        console.error("[evaluar-simulacion] gemini_cupo_libre excepción:", (e as Error).message);
        return 0;
    }
}

// Un solo intento de fetch a Gemini, con AbortController propio: si no contesta
// en GEMINI_TIMEOUT_MS, aborta la request (evita quedarnos "pensando" para
// siempre) y tira un error claro para que el caller decida si reintentar.
async function intentarLlamarGemini(modelo: string, systemPrompt: string, historial: any[], mensaje: string, esEvaluacion: boolean) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_API_KEY}`;
    const generationConfig: Record<string, unknown> = {
        temperature: esEvaluacion ? 0.35 : 0.9,
        maxOutputTokens: esEvaluacion ? 4096 : 2048,   // la evaluación incluye la revisión detallada y la respuesta modelo
    };
    // La familia Gemini 3.x tiene "thinking" habilitado por defecto y el
    // razonamiento interno consume el mismo presupuesto de maxOutputTokens: si
    // no lo acotamos, puede comerse todo el budget pensando y devolver texto
    // vacío (o tardar mucho más). La familia 2.x (gemini-flash-lite-latest,
    // gemini-2.5-flash-lite, etc.) no entiende este campo, así que solo lo
    // mandamos si el modelo configurado es de la familia 3.
    if (/^gemini-3/.test(modelo)) {
        generationConfig.thinkingConfig = { thinkingLevel: "minimal" };
    }
    const body = {
        system_instruction: { parts: [{ text: systemPrompt || "" }] },
        contents: historialAContents(historial, mensaje),
        generationConfig,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            const msg = data?.error?.message || `Gemini respondió con HTTP ${resp.status}`;
            throw new Error(msg);
        }

        const texto = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
        const usage = data?.usageMetadata || {};
        return {
            texto,
            inputTokens: Number(usage.promptTokenCount) || 0,
            outputTokens: Number(usage.candidatesTokenCount) || 0,
        };
    } finally {
        clearTimeout(timer);
    }
}

// Reintenta con backoff simple (700ms, 1400ms) ante timeouts/abortos o errores
// 5xx/de red de Gemini. Errores claramente "de configuración" (API key,
// argumentos inválidos) no se reintentan porque van a fallar siempre igual.
async function llamarGemini(modelo: string, systemPrompt: string, historial: any[], mensaje: string, esEvaluacion = false) {
    let ultimoError: unknown;
    for (let intento = 1; intento <= GEMINI_MAX_INTENTOS; intento++) {
        try {
            return await intentarLlamarGemini(modelo, systemPrompt, historial, mensaje, esEvaluacion);
        } catch (err) {
            ultimoError = err;
            const esAbort = err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message));
            const mensajeErr = err instanceof Error ? err.message : String(err);
            const esNoReintentable = /API key|invalid argument|400|403/i.test(mensajeErr) && !esAbort;
            console.error(`[evaluar-simulacion] intento ${intento}/${GEMINI_MAX_INTENTOS} falló${esAbort ? " (timeout)" : ""}:`, mensajeErr);
            if (esNoReintentable || intento === GEMINI_MAX_INTENTOS) break;
            await esperar(intento * 700); // backoff: 700ms, 1400ms
        }
    }
    throw ultimoError instanceof Error ? ultimoError : new Error("No se pudo contactar a Gemini.");
}

function calcularCostoUsd(inputTokens: number, outputTokens: number): number {
    const costo = (inputTokens / 1_000_000) * PRECIO_INPUT_POR_MILLON
                + (outputTokens / 1_000_000) * PRECIO_OUTPUT_POR_MILLON;
    return Math.round(costo * 1_000_000) / 1_000_000; // redondeo a 6 decimales (numeric(10,6))
}

Deno.serve(withCors(async (req: Request) => {
    // El preflight OPTIONS ya lo respondió withCors (204) antes de llegar a este handler.
    if (req.method !== "POST") return jsonResponse(405, { error: "metodo_no_permitido" });

    // ---- Auth: extraer y verificar el JWT del usuario ------------------------
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
        return jsonResponse(401, { error: "no_autenticado", mensaje: "Falta el token de sesión." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(jwt);
    if (userErr || !userData?.user) {
        return jsonResponse(401, { error: "no_autenticado", mensaje: "Tu sesión no es válida. Volvé a iniciar sesión." });
    }
    const userId = userData.user.id;

    // Cliente con service_role — para descontar créditos y guardar telemetría
    // sin depender de las policies de RLS.
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // ---- Body -----------------------------------------------------------------
    let payload: any;
    try {
        payload = await req.json();
    } catch (_) {
        return jsonResponse(400, { error: "body_invalido", mensaje: "El body no es JSON válido." });
    }
    const { modo, submodo, tematica, system_prompt, historial, mensaje, es_primer_turno, accion } = payload || {};
    if (typeof mensaje !== "string" || !mensaje.trim()) {
        return jsonResponse(400, { error: "mensaje_requerido", mensaje: "Falta el mensaje del turno." });
    }
    // ---- Práctica de casos clínicos de la PFO: EXCLUSIVO NikaMed+ (o admin), forzado en el servidor ----
    // No hay usos de cortesía ni créditos para este modo: si la cuenta no es ilimitada, se rechaza antes de tocar a Gemini.
    if (modo === "caso_pfo") {
        const planPfo = await consultarPlan(supabaseAuth);
        if (!planPfo.ok) {
            return jsonResponse(503, { error: "plan_no_verificable", mensaje: "No pudimos verificar tu plan. Reintentá en unos segundos." });
        }
        if (!planPfo.ilimitado) {
            return jsonResponse(403, { error: "requiere_nikamed_plus", mensaje: "La práctica con el evaluador es exclusiva de NikaMed+." });
        }
        // Topes de tamaño para que nadie use el endpoint como un chat libre.
        if (typeof system_prompt !== "string" || system_prompt.length > 30000 || mensaje.length > 4000 || (Array.isArray(historial) && historial.length > 70)) {
            return jsonResponse(400, { error: "solicitud_excedida", mensaje: "La solicitud supera los límites de la práctica." });
        }
    }

    // Nota: `es_cortesia_gratis` (si vino) se ignora a propósito como fuente de
    // verdad — es solo una pista informativa del cliente. Quién decide si hay
    // cortesía disponible es siempre el servidor (ver más abajo).

    // accion === 'evaluar_caso': cierre de caso (Módulo B) — el alumno apretó
    // "Finalizar y Evaluar" o se llegó al límite de turnos.
    const esEvaluacionDeCierre = accion === "evaluar_caso";

    // El frontend manda es_primer_turno según si ya había historial previo en el
    // caso (true = arranque del caso, false = turno de continuación). Si por algún
    // motivo no llega, asumimos "true" para no regalar turnos gratis por accidente.
    const esPrimerTurno = es_primer_turno !== false;

    // ---- [Sprint 3] Modelo según el plan + chequeo de cupo SIN consumirlo -----------
    // Va ANTES de cobrar créditos: si no hay cupo se responde 429/503 sin haber cobrado nada, y el
    // reintento automático del cliente no duplica el cobro. Mirar sin reservar tampoco permite que
    // alguien sin créditos gaste el cupo de los suscriptores (el 402 sale antes de reservar).
    let modelo = MODELO_BASE;
    if (MODELO_GRATIS !== MODELO_PREMIUM) {   // solo vale la pena consultar el plan si los modelos difieren
        const plan = await consultarPlan(supabaseAuth);
        if (plan.ok && !plan.ilimitado) modelo = MODELO_GRATIS;
    }
    let libre = await cupoLibre(supabaseAdmin, modelo);
    if (libre !== 0 && MODELO_RESPALDO && MODELO_RESPALDO !== modelo && (await cupoLibre(supabaseAdmin, MODELO_RESPALDO)) === 0) {
        modelo = MODELO_RESPALDO;
        libre = 0;
    }
    if (libre === -1) {
        return jsonResponse(503, { error: "cupo_ia_diario", mensaje: "El simulador alcanzó su límite diario de uso. Volvé a intentar más tarde." });
    }
    if (libre > CUPO_ESPERA_MAX_S) {
        return jsonResponse(429, { error: "cupo_ia", reintentar_en: libre, mensaje: "El simulador tiene mucha demanda en este momento. Reintentamos en unos segundos." });
    }

    // ---- Validación previa: descontar créditos ANTES de llamar a Gemini -------
    const costo = costoSimulador(modo, esPrimerTurno, accion);

    if (costo > 0) {
        const { data: alcanzo, error: rpcErr } = await supabaseAdmin.rpc("descontar_creditos", {
            p_user_id: userId,
            p_cantidad: costo,
        });

        if (rpcErr) {
            console.error("[evaluar-simulacion] Error al invocar descontar_creditos:", rpcErr);
            return jsonResponse(500, { error: "error_creditos", mensaje: "No se pudo verificar tu saldo de créditos." });
        }

        if (!alcanzo) {
            // Sin créditos reales: antes de bloquear, se revisa si todavía le queda
            // algún uso de cortesía gratis PARA ESTE SIMULADOR PUNTUAL. Esto es lo
            // que resuelve el choque que reportaba el frontend (la tarjeta del
            // Paso 2 mostraba "2 usos gratis" pero acá se rechazaba igual): ahora el
            // servidor conoce y honra esos 2 usos, en vez de exigir siempre créditos
            // reales desde el primer intento.
            const { data: huboLugarCortesia, error: cortesiaErr } = await supabaseAdmin.rpc("consumir_uso_gratis", {
                p_user_id: userId,
                p_modo: modo,
                p_limite: LIMITE_USOS_GRATIS_CORTESIA,
            });

            if (cortesiaErr) {
                // Si la RPC no existe todavía (falta la migración) u otro error de
                // infraestructura, no le regalamos el intento: cae al 402 normal, pero
                // se loguea fuerte porque probablemente falta correr el SQL de abajo.
                console.error("[evaluar-simulacion] Error al invocar consumir_uso_gratis (¿falta la migración?):", cortesiaErr);
            }

            if (!huboLugarCortesia) {
                return jsonResponse(402, {
                    error: "creditos_insuficientes",
                    mensaje: "Te quedaste sin créditos de simulación.",
                });
            }
            // huboLugarCortesia === true: se consumió 1 uso de cortesía server-side.
            // Se sigue de largo SIN haber descontado créditos reales para este turno.
        }
    }

    // ---- [Sprint 3] Reservar cupo (esperando hasta CUPO_ESPERA_MAX_S) ---------------
    let reserva = await reservarCupo(supabaseAdmin, modelo);
    if (reserva > 0 && reserva <= CUPO_ESPERA_MAX_S) {
        await esperar(reserva * 1000 + 300);
        reserva = await reservarCupo(supabaseAdmin, modelo);
    }
    if (reserva !== 0) {
        if (costo === 0) {   // turno gratis: es seguro pedir reintento
            return jsonResponse(429, { error: "cupo_ia", reintentar_en: reserva > 0 ? reserva : 30, mensaje: "El simulador tiene mucha demanda en este momento. Reintentamos en unos segundos." });
        }
        // Ya se cobró el arranque del caso: no se lo hacemos perder, se llama igual (sobrepasar un poco el
        // tope por minuto es preferible a cobrar y no responder).
        console.warn("[evaluar-simulacion] sin cupo reservado tras cobrar; se llama igual a Gemini.");
    }

    // ---- Llamada a Gemini (con timeout + reintentos) -----------------------------
    try {
        const { texto, inputTokens, outputTokens } = await llamarGemini(modelo, system_prompt, historial, mensaje, esEvaluacionDeCierre);

        // ---- Telemetría: se guarda de forma asíncrona, sin bloquear la respuesta
        const costoUsd = calcularCostoUsd(inputTokens, outputTokens);
        const registrar = supabaseAdmin.from("ai_usage_logs").insert({
            user_id: userId,
            simulador: modo || null,
            submodo: submodo || null,
            tematica: tematica || null,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            costo_estimado_usd: costoUsd,
        }).then(({ error }: { error: any }) => {
            if (error) console.error("[evaluar-simulacion] No se pudo guardar la telemetría:", error);
        });
        // @ts-ignore — EdgeRuntime existe en el runtime de Supabase Edge Functions
        if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
            // @ts-ignore
            EdgeRuntime.waitUntil(registrar);
        } else {
            registrar.catch(() => {});
        }

        return jsonResponse(200, { texto });
    } catch (err) {
        console.error("[evaluar-simulacion] Falló la llamada a Gemini tras reintentos:", err);
        // Nota: los créditos ya se descontaron. Si preferís devolverlos cuando
        // Gemini falla, se puede sumar una RPC 'acreditar_creditos' simétrica.
        const timeoutOAbort = err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message));
        return jsonResponse(502, {
            error: timeoutOAbort ? "timeout_ia" : "fallo_ia",
            mensaje: timeoutOAbort
                ? "El simulador no respondió a tiempo después de varios intentos. Probá de nuevo en un momento."
                : (err instanceof Error ? err.message : "No se pudo contactar al simulador."),
        });
    }
}));
