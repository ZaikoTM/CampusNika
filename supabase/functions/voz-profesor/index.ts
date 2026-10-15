// ============================================================================
// CAMPUS NIKA — Edge Function: voz-profesor
// ----------------------------------------------------------------------------
// Voz del profesor del "Simulador Examen oral". Convierte un texto corto en audio con la síntesis de voz de Gemini
// (modelo TTS), con 4 voces: femenina/masculina argentina y femenina/masculina internacional (español neutro).
// Funciona igual en cualquier navegador y dispositivo (a diferencia de la voz del sistema, que en Brave/otros no existe).
//
// Request  (POST, JSON): { texto: string (máx. 700 caracteres), voz: "ar_f"|"ar_m"|"int_f"|"int_m", animo?: "contento"|"cordial"|"serio"|"molesto" }
// Response 200: { audio: <base64 PCM 16-bit mono>, rate: 24000, mime: "audio/L16" }
// Seguridad: requiere sesión válida y plan NikaMed+ (o admin), igual que el simulador. Límite de pedidos por usuario.
//
// Deploy:   supabase functions deploy voz-profesor --no-verify-jwt --project-ref <ref>
// Secretos: GEMINI_API_KEY (ya existe). Opcional: GEMINI_MODEL_TTS (por defecto gemini-2.5-flash-preview-tts).
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCors } from "../_shared/cors.ts";
import { consultarPlan } from "../_shared/evaluador.ts";

const MODELO_TTS = Deno.env.get("GEMINI_MODEL_TTS") ?? "gemini-2.5-flash-preview-tts";
const MAX_TEXTO = 700;
const LIMITE = 80;                 // pedidos por usuario y ventana (mejor esfuerzo, por instancia)
const VENTANA_MS = 10 * 60_000;
const TIMEOUT_MS = 40_000;

// Voces prebuilt de Gemini TTS (nombres oficiales) asignadas a cada perfil.
const VOCES: Record<string, { voz: string; acento: string }> = {
  ar_f: { voz: "Kore", acento: "con acento argentino rioplatense (voseo, entonación de Buenos Aires)" },
  ar_m: { voz: "Charon", acento: "con acento argentino rioplatense (voseo, entonación de Buenos Aires)" },
  int_f: { voz: "Zephyr", acento: "con acento neutro latinoamericano internacional" },
  int_m: { voz: "Orus", acento: "con acento neutro latinoamericano internacional" },
};
const TONOS: Record<string, string> = {
  contento: "con entusiasmo y calidez, alentador y expresivo",
  cordial: "en un tono amable, profesional y sereno",
  serio: "en un tono seco, firme y exigente, sin calidez",
  molesto: "en un tono impaciente y severo, con fastidio contenido pero siempre respetuoso",
};

const pedidos = new Map<string, number[]>();
function excede(userId: string): boolean {
  const ahora = Date.now();
  const lista = (pedidos.get(userId) ?? []).filter((t) => ahora - t < VENTANA_MS);
  lista.push(ahora); pedidos.set(userId, lista);
  return lista.length > LIMITE;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "metodo_no_permitido" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "no_autenticado", mensaje: "Falta el token de sesión." }, 401);
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userError } = await supa.auth.getUser();
  if (userError || !user) return json({ error: "no_autenticado", mensaje: "Sesión inválida o vencida." }, 401);

  const plan = await consultarPlan(supa);
  if (!plan.ok) return json({ error: "plan_no_verificable", mensaje: "No pudimos verificar tu plan. Reintentá en unos segundos." }, 503);
  if (!plan.ilimitado) return json({ error: "requiere_nikamed_plus", mensaje: "La voz del profesor es exclusiva de NikaMed+." }, 403);
  if (excede(user.id)) return json({ error: "demasiados_pedidos", mensaje: "Demasiados pedidos de voz seguidos. Esperá unos minutos." }, 429);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) { console.error("[voz-profesor] Falta GEMINI_API_KEY"); return json({ error: "mal_configurada" }, 500); }

  const body = await req.json().catch(() => null);
  const texto = String(body?.texto ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXTO);
  if (!texto) return json({ error: "texto_requerido" }, 400);
  const cfg = VOCES[String(body?.voz ?? "ar_f")] ?? VOCES.ar_f;
  const tono = TONOS[String(body?.animo ?? "cordial")] ?? TONOS.cordial;

  const prompt = `Leé en voz alta, ${cfg.acento}, ${tono}, como un profesor examinador de Medicina que toma un examen oral. Hablá a ritmo natural, sin leer signos de puntuación ni indicaciones:\n\n${texto}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_TTS}:generateContent?key=${apiKey}`;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voz } } },
        },
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("[voz-profesor] Gemini:", resp.status, data?.error?.message);
      return json({ error: "tts_error", mensaje: data?.error?.message ?? `Gemini respondió HTTP ${resp.status}` }, 502);
    }
    const parte = data?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data);
    if (!parte) return json({ error: "sin_audio", mensaje: "La IA no devolvió audio." }, 502);
    const mime = String(parte.inlineData.mimeType ?? "audio/L16;codec=pcm;rate=24000");
    const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
    return json({ audio: parte.inlineData.data, rate, mime });
  } catch (e) {
    const abortado = (e as Error)?.name === "AbortError";
    console.error("[voz-profesor] fallo:", (e as Error)?.message);
    return json({ error: abortado ? "timeout" : "tts_error", mensaje: abortado ? "La voz tardó demasiado." : "No se pudo generar la voz." }, 504);
  } finally {
    clearTimeout(to);
  }
}

Deno.serve(withCors(handler));
