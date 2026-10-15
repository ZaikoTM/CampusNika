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

const MODELOS_TTS = [Deno.env.get("GEMINI_MODEL_TTS"), "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"].filter((m, i, a) => m && a.indexOf(m) === i) as string[];
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

// Diagnóstico sin datos de usuario: prueba el servicio de voz con la palabra "Hola" y devuelve solo el estado (sin audio).
// El resultado se guarda 5 minutos para que no se pueda usar para gastar cuota.
let diagCache: { t: number; r: unknown } | null = null;
async function diagnostico(prueba: string): Promise<Response> {
  if (diagCache && Date.now() - diagCache.t < 5 * 60_000) return json(diagCache.r);
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const r: Record<string, unknown> = { clave_configurada: !!apiKey, modelos: [] as unknown[] };
  if (apiKey) {
    for (const modelo of MODELOS_TTS.slice(0, 1)) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prueba }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }),
        });
        const d = await resp.json().catch(() => ({}));
        const tiene = !!d?.candidates?.[0]?.content?.parts?.some((p: any) => p?.inlineData?.data || p?.inline_data?.data);
        const cand = d?.candidates?.[0];
        const resumen = JSON.stringify(d, (k, v) => (k === "data" && typeof v === "string" && v.length > 80 ? `<${v.length} chars>` : v)).slice(0, 700);
        (r.modelos as unknown[]).push({ modelo, http: resp.status, audio: tiene, finishReason: cand?.finishReason ?? null, partes: (cand?.content?.parts ?? []).map((p: any) => Object.keys(p)), error: d?.error?.message ?? null, resumen });
      } catch (e) { (r.modelos as unknown[]).push({ modelo, error: (e as Error).message }); }
    }
  }
  if ((r.modelos as any[]).some((m) => m.audio)) diagCache = { t: Date.now(), r };
  return json(r);
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "GET" && new URL(req.url).searchParams.get("diag") === "1") { return await diagnostico("Say: Hola, buenos días."); }
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
  const cuerpo = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voz } } },
    },
  });
  let ultimoError = "";
  for (const modelo of MODELOS_TTS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal, body: cuerpo });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        ultimoError = `${modelo}: HTTP ${resp.status} ${data?.error?.message ?? ""}`.trim();
        console.error("[voz-profesor] Gemini:", ultimoError);
        // modelo inexistente / sin acceso: se prueba el siguiente; errores de cuota u otros se informan igual al final
        continue;
      }
      const parte = data?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data || p?.inline_data?.data);
      const inline = parte?.inlineData ?? parte?.inline_data;
      if (!inline?.data) { ultimoError = `${modelo}: sin audio en la respuesta (${data?.candidates?.[0]?.finishReason ?? "?"})`; console.error("[voz-profesor]", ultimoError); continue; }
      const mime = String(inline.mimeType ?? inline.mime_type ?? "audio/L16;codec=pcm;rate=24000");
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
      return json({ audio: inline.data, rate, mime, modelo });
    } catch (e) {
      ultimoError = `${modelo}: ${(e as Error)?.name === "AbortError" ? "tiempo agotado" : (e as Error)?.message}`;
      console.error("[voz-profesor] fallo:", ultimoError);
    } finally {
      clearTimeout(to);
    }
  }
  return json({ error: "tts_error", mensaje: "No se pudo generar la voz con la IA.", detalle: ultimoError }, 502);
}

Deno.serve(withCors(handler));
