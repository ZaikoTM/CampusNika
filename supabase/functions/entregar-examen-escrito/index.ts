// ============================================================================
// CAMPUS NIKA — Edge Function: entregar-examen-escrito   [Sprint 2]
// ----------------------------------------------------------------------------
// PRODUCTOR de la cola de corrección. Responde en milisegundos (202) sin esperar a la IA:
//   1. Verifica la sesión (JWT real, igual que evaluar-examen-escrito).
//   2. Valida la entrada y la parte en lotes de LOTE preguntas.
//   3. Crea el envío + los trabajos en UNA transacción (RPC correccion_crear_envio),
//      idempotente por (user_id, idempotency_key) y con límite de pedidos por usuario.
//   4. Despierta a worker-correccion (sin esperarlo). Si ese aviso se pierde, el cron de
//      rescate (02_cola_correccion.sql, sección 4) igual lo retoma.
// El navegador consulta después el estado en la tabla correccion_envios (RLS: solo los suyos).
//
// Deploy:   supabase functions deploy entregar-examen-escrito --no-verify-jwt
// Secretos: WORKER_SECRET (mismo valor que en worker-correccion).
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCors } from "../_shared/cors.ts";
import { consultarPlan, LOTE, MAX_PREGUNTAS, MAX_RESPUESTA, modeloParaPlan, texto } from "../_shared/evaluador.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined;

const JOBS_POR_WORKER = 4;      // debe coincidir con WORKER_LOTES de worker-correccion
const MAX_WORKERS = 5;          // invocaciones paralelas que dispara un solo envío

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autenticado." }, 401);
    const supaUser = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supaUser.auth.getUser();
    if (userError || !user) return json({ error: "Sesión inválida o vencida. Iniciá sesión de nuevo." }, 401);

    const body = await req.json().catch(() => null);
    const modulo = String(body?.modulo ?? "cirugia").toLowerCase();
    if (!/^[a-z0-9_-]{1,30}$/.test(modulo)) return json({ error: "Módulo inválido." }, 400);
    const key = String(body?.idempotency_key ?? "").trim();
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(key)) return json({ error: "Falta idempotency_key válida." }, 400);

    const crudas = Array.isArray(body?.respuestas) ? body.respuestas : null;
    if (!crudas || crudas.length === 0) return json({ error: "No llegaron respuestas para evaluar." }, 400);
    if (crudas.length > MAX_PREGUNTAS) return json({ error: `Máximo ${MAX_PREGUNTAS} preguntas por examen.` }, 400);
    const entradas = crudas.map((r: any) => ({ id: texto(r?.id, 80), respuesta: texto(r?.respuesta_alumno, MAX_RESPUESTA) }));
    if (entradas.some((e: { id: string }) => !e.id)) return json({ error: "Hay respuestas sin id de pregunta." }, 400);

    const lotes: unknown[][] = [];
    for (let i = 0; i < entradas.length; i += LOTE) lotes.push(entradas.slice(i, i + LOTE));

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Acceso por plan: NikaMed+ y admin sin límite; gratuitos solo con los usos de prueba que consumieron
    // al iniciar el simulador (cada entrega no fallida gasta uno). Un reintento de la MISMA entrega
    // (misma clave) siempre pasa. Si no se puede consultar el plan, se deja pasar para no frenar a un
    // suscriptor por una falla momentánea (queda en el log).
    const { data: previo } = await admin.from("correccion_envios").select("id")
      .eq("user_id", user.id).eq("idempotency_key", key).maybeSingle();
    let modelo = modeloParaPlan(true);   // si no se puede consultar el plan: modelo de NikaMed+
    if (!previo) {
      const plan = await consultarPlan(supaUser);
      if (plan.ok) modelo = modeloParaPlan(plan.ilimitado);
      if (!plan.ok) {
        console.warn("[entregar-examen-escrito] no se pudo consultar el plan de", user.id, "- se deja pasar");
      } else if (!plan.ilimitado) {
        const { count } = await admin.from("correccion_envios").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).neq("estado", "error");
        if (plan.usos <= (count ?? 0)) {
          return json({ error: "Ya usaste tus pruebas gratuitas del Simulador Escrito. Suscribite a NikaMed+ para seguir corrigiendo con IA.", codigo: "pruebas_agotadas" }, 403);
        }
      }
    }

    const { data, error } = await admin.rpc("correccion_crear_envio", {
      p_user: user.id, p_modulo: modulo, p_key: key, p_lotes: lotes, p_modelo: modelo,
    });
    if (error) { console.error("[entregar-examen-escrito] rpc:", error.message); return json({ error: "No se pudo registrar la entrega." }, 500); }
    if (data?.error === "rate_limit") return json({ error: "Demasiadas correcciones seguidas. Esperá unos minutos y reintentá." }, 429);

    if (data?.nuevo) despertarWorkers(lotes.length);
    return json({ envio_id: data.id, total_lotes: lotes.length, nuevo: !!data.nuevo }, 202);
  } catch (err) {
    console.error("[entregar-examen-escrito] Error inesperado:", err);
    return json({ error: "Error interno." }, 500);
  }
}

// Aviso "fire and forget": EdgeRuntime.waitUntil mantiene viva la petición sin hacer esperar al alumno.
function despertarWorkers(totalLotes: number) {
  const secret = Deno.env.get("WORKER_SECRET");
  if (!secret) { console.error("[entregar-examen-escrito] Falta WORKER_SECRET: solo el cron retomará los trabajos."); return; }
  const n = Math.min(MAX_WORKERS, Math.max(1, Math.ceil(totalLotes / JOBS_POR_WORKER)));
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/worker-correccion`;
  for (let i = 0; i < n; i++) {
    const p = fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-worker-secret": secret }, body: "{}" })
      .then((r) => r.body?.cancel())
      .catch((e) => console.error("[entregar-examen-escrito] no se pudo avisar al worker:", (e as Error).message));
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(p);
  }
}

Deno.serve(withCors(handler));
