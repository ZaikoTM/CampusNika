// ============================================================================
// CAMPUS NIKA — Edge Function: worker-correccion   [Sprint 2]
// ----------------------------------------------------------------------------
// CONSUMIDOR de la cola. Se invoca con el header x-worker-secret (desde
// entregar-examen-escrito, desde el cron de rescate o encadenándose a sí mismo).
// En cada invocación:
//   0. Barrido: cierra envíos que quedaron con todos los lotes hechos pero sin cerrar.
//   1. Toma hasta WORKER_LOTES trabajos (FOR UPDATE SKIP LOCKED: sin duplicados entre workers).
//   2. Corrige cada lote con el MISMO corrector que el endpoint síncrono (_shared/evaluador.ts).
//   3. Si Gemini falla, el trabajo vuelve a la cola con backoff + jitter (máx. MAX_INTENTOS);
//      agotados los intentos queda 'fallido' y esas preguntas se muestran como "reintentá".
//   4. El worker que termina el último lote de un envío arma el resultado final y lo guarda.
//   5. Repite mientras le quede tiempo; si queda trabajo, se vuelve a invocar.
// Un worker que muere a mitad de camino no pierde nada: el lease (visible_desde) vence y el
// trabajo lo toma otro.
//
// Deploy:   supabase functions deploy worker-correccion --no-verify-jwt
// Secretos: WORKER_SECRET, GEMINI_API_KEY (ya existe), SITE_URL (ya existe).
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCors } from "../_shared/cors.ts";
import {
  cargarBanco, construirRespuestaFinal, evaluacionNula, evaluarEntradas, MODEL, MODELO_RESPALDO, reservarCupo,
} from "../_shared/evaluador.ts";
import type { Entrada, Evaluacion, ItemBanco } from "../_shared/evaluador.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined;

const WORKER_LOTES = 4;             // trabajos en paralelo por ronda
const LEASE_SEG = 180;              // si el worker muere, el trabajo reaparece a los 3 min
const MAX_INTENTOS = 4;
const SEGUNDOS_POR_INVOCACION = 45; // no arrancar rondas nuevas pasado este tiempo

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type Job = { id: number; envio_id: string; lote_idx: number; intentos: number; entradas: Entrada[]; modulo: string; modelo: string | null };

const esperaBackoff = (intentos: number) =>
  Math.round(Math.min(120, 10 * 2 ** (intentos - 1)) * (0.5 + Math.random()));   // 5-15 s, 10-30 s, 20-60 s…

const SIN_CORREGIR = "No se pudo corregir esta pregunta en este intento. Volvé a entregar el examen para reintentar.";

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Elige el modelo del trabajo y reserva 1 pedido de su cupo. Si el modelo está al tope por minuto y la
// espera es corta, espera acá mismo; si hay un modelo de respaldo con cupo, lo usa. Devuelve modelo=null
// cuando hay que devolver el trabajo a la cola (y cuántos segundos esperar).
async function elegirModelo(job: Job): Promise<{ modelo: string | null; espera: number }> {
  const principal = job.modelo || MODEL;
  let r = await reservarCupo(admin, principal);
  if (r === 0) return { modelo: principal, espera: 0 };

  if (MODELO_RESPALDO && MODELO_RESPALDO !== principal && (await reservarCupo(admin, MODELO_RESPALDO)) === 0) {
    return { modelo: MODELO_RESPALDO, espera: 0 };
  }
  if (r > 0 && r <= 20) {              // tope por minuto: casi siempre alcanza con esperar al próximo minuto
    await dormir(r * 1000 + Math.random() * 1500);
    r = await reservarCupo(admin, principal);
    if (r === 0) return { modelo: principal, espera: 0 };
  }
  // Tope diario agotado (-1) o fila larga: se devuelve a la cola y se reintenta más tarde
  return { modelo: null, espera: r < 0 ? 900 : Math.max(r, 5) + Math.round(Math.random() * 10) };
}

// Devuelve false si el trabajo no se pudo procesar ahora por falta de cupo.
async function procesarJob(apiKey: string, job: Job): Promise<boolean> {
  try {
    const { modelo, espera } = await elegirModelo(job);
    if (!modelo) {
      await admin.rpc("correccion_reintentar_job", { p_job: job.id, p_espera_seg: espera, p_error: "esperando cupo de Gemini", p_sin_gastar_intento: true });
      return false;
    }
    const banco = await cargarBanco(job.modulo);
    const evals = await evaluarEntradas(apiKey, banco, job.entradas, modelo);

    // evaluarEntradas no lanza si Gemini falla: devuelve notas nulas. Las detectamos para reintentar
    // el trabajo completo (son 3 preguntas) en vez de entregarle "no se pudo corregir" al alumno.
    const fallaron = job.entradas.some((e, i) => {
      const it = banco.get(e.id);
      return !!it && it.puntos.length > 0 && !!e.respuesta && evals[i].nota === null;
    });
    if (fallaron && job.intentos < MAX_INTENTOS) {
      await admin.rpc("correccion_reintentar_job", { p_job: job.id, p_espera_seg: esperaBackoff(job.intentos), p_error: "Gemini no devolvió todas las evaluaciones" });
      return true;
    }
    await terminar(job, evals, false, fallaron ? "Gemini no devolvió todas las evaluaciones" : null);
    return true;
  } catch (err) {
    const msg = String((err as Error)?.message ?? err).slice(0, 300);
    console.error(`[worker-correccion] job ${job.id} (intento ${job.intentos}):`, msg);
    if (job.intentos < MAX_INTENTOS) {
      await admin.rpc("correccion_reintentar_job", { p_job: job.id, p_espera_seg: esperaBackoff(job.intentos), p_error: msg });
    } else {
      const nulas = job.entradas.map((e) => evaluacionNula(e.id, SIN_CORREGIR));
      await terminar(job, nulas, true, msg);
    }
    return true;
  }
}

async function terminar(job: Job, evals: Evaluacion[], fallido: boolean, error: string | null) {
  const { data: pendientes, error: e } = await admin.rpc("correccion_completar_job", {
    p_job: job.id, p_evals: evals, p_fallido: fallido, p_error: error,
  });
  if (e) { console.error("[worker-correccion] completar_job:", e.message); return; }
  if (pendientes === 0) await cerrarEnvio(job.envio_id);
}

async function cerrarEnvio(envioId: string) {
  const { data: reclamado } = await admin.rpc("correccion_reclamar_cierre", { p_envio: envioId });
  if (!reclamado) return;   // otro worker ya lo está cerrando

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY")!;
    const { data: envio } = await admin.from("correccion_envios").select("modulo, modelo").eq("id", envioId).single();
    const { data: jobs, error } = await admin.from("correccion_jobs")
      .select("lote_idx, entradas, evaluaciones").eq("envio_id", envioId).order("lote_idx");
    if (error || !jobs) throw new Error(error?.message ?? "sin trabajos");

    const evaluaciones: Evaluacion[] = jobs.flatMap((j: any) =>
      Array.isArray(j.evaluaciones) ? j.evaluaciones as Evaluacion[]
        : (j.entradas as Entrada[]).map((e) => evaluacionNula(e.id, SIN_CORREGIR)));

    // El banco solo se usa para rotular las UP en el resumen; si no se puede leer, el resumen sigue
    let banco = new Map<string, ItemBanco>();
    try { banco = await cargarBanco(envio?.modulo ?? "cirugia"); } catch { /* sin rótulos de UP */ }

    // El resumen general también cuesta 1 pedido: se reserva cupo (esperando hasta ~25 s). Si no hay,
    // el examen se entrega igual con sus notas y feedback por pregunta, solo sin el comentario general.
    const modelo = envio?.modelo || MODEL;
    let conResumen = false;
    for (let i = 0; i < 2 && !conResumen; i++) {
      const r = await reservarCupo(admin, modelo);
      if (r === 0) conResumen = true;
      else if (r > 0 && r <= 25 && i === 0) await dormir(r * 1000 + 500);
      else break;
    }
    const resultado = await construirRespuestaFinal(apiKey, evaluaciones, banco, modelo, conResumen);
    await admin.rpc("correccion_guardar_resultado", { p_envio: envioId, p_resultado: resultado, p_error: null });
  } catch (err) {
    const msg = String((err as Error)?.message ?? err).slice(0, 300);
    console.error("[worker-correccion] cierre del envío falló:", msg);
    // Se deja en 'finalizando': el barrido lo reabre a los 5 min y otro worker lo reintenta.
  }
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  const secret = Deno.env.get("WORKER_SECRET");
  if (!secret || req.headers.get("x-worker-secret") !== secret) return json({ error: "No autorizado." }, 401);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) { console.error("[worker-correccion] Falta GEMINI_API_KEY."); return json({ error: "Función mal configurada." }, 500); }

  const t0 = Date.now();
  let procesados = 0;

  // 0. Rescate de envíos sin cerrar
  const { data: huerfanos } = await admin.rpc("correccion_envios_sin_cerrar");
  for (const h of (huerfanos ?? []) as { id: string }[]) await cerrarEnvio(h.id);

  // 1-5. Rondas de trabajo
  while ((Date.now() - t0) / 1000 < SEGUNDOS_POR_INVOCACION) {
    const { data: jobs, error } = await admin.rpc("correccion_tomar_jobs", { p_n: WORKER_LOTES, p_lease_seg: LEASE_SEG });
    if (error) { console.error("[worker-correccion] tomar_jobs:", error.message); break; }
    if (!jobs || jobs.length === 0) break;
    const hechos = await Promise.all((jobs as Job[]).map((j) => procesarJob(apiKey, j)));
    const ok = hechos.filter(Boolean).length;
    procesados += ok;
    if (ok === 0) break;   // todos esperaban cupo: no tiene sentido seguir pidiendo trabajos ahora
  }

  // Reinvocación encadenada: ya mismo si quedó trabajo listo; si no, cuando venza el próximo trabajo en
  // espera (cupo de Gemini, backoff o lease de un worker caído). Así no hace falta un cron para que la cola avance.
  const { data: hay } = await admin.rpc("correccion_hay_trabajo");
  let demora = 0;
  if (!hay) {
    const { data: seg } = await admin.rpc("correccion_segundos_hasta_proximo");
    if (typeof seg !== "number") demora = -1;                  // no queda nada pendiente: la cadena termina
    else demora = Math.min(seg, 150) + Math.random() * 3;
  }
  if (demora >= 0) {
    const p = dormir(demora * 1000).then(() => fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/worker-correccion`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-worker-secret": secret }, body: "{}",
    })).then((r) => r.body?.cancel()).catch(() => {});
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(p);
  }

  return json({ procesados, segundos: Math.round((Date.now() - t0) / 1000) });
}

Deno.serve(withCors(handler));
