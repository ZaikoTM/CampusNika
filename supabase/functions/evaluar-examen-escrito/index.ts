// ============================================================================
// CAMPUS NIKA — Edge Function: evaluar-examen-escrito
// ----------------------------------------------------------------------------
// El navegador manda SOLO { modulo, respuestas: [{ id, respuesta_alumno }] }.
// La función:
//   1. Verifica la sesión del usuario (JWT real; la anon key sola no alcanza).
//   2. Carga data/escrito_<modulo>.json desde tu sitio (misma fuente que usa el
//      simulador) y toma de ahí la pregunta, los puntos_clave y el error_peligroso.
//      El alumno no puede alterarlos porque nunca viajan desde el cliente.
//   3. Le pide a Gemini un CHECKLIST estricto: por cada punto clave, si está
//      cubierto / parcial / ausente, con una cita textual de la respuesta del alumno.
//      Además: si cayó en el error_peligroso y qué afirmaciones falsas escribió.
//   4. Calcula la nota POR CÓDIGO (no la inventa el modelo):
//        cobertura = (cubiertos + 0,5·parciales) / evaluables
//        nota      = 1 + 9·cobertura − 0,5 por afirmación falsa (máx. −2)
//        error peligroso cometido → nota máxima 5
//      y verifica que la cita del modelo exista en la respuesta del alumno
//      (si no existe, un punto "cubierto" baja a "parcial").
//
// Deploy:   supabase functions deploy evaluar-examen-escrito --no-verify-jwt
//           (--no-verify-jwt: tu proyecto usa claves nuevas "sb_publishable_…"; el
//            usuario se valida acá adentro con auth.getUser()).
// Secretos: GEMINI_API_KEY (ya existe, la usan las otras funciones).
//   Opcionales: SITE_URL (por defecto https://nikamed.com.ar),
//               GEMINI_MODEL_EVAL (por defecto gemini-3.5-flash-lite).
// IMPORTANTE sobre SITE_URL: esta función corre en los servidores de Supabase, NO en tu
// máquina. Tiene que ser un dominio PÚBLICO donde `${SITE_URL}/data/escrito_<modulo>.json`
// responda 200 con el JSON real (probalo abriendo esa URL exacta en el navegador, sin login).
// Un Live Server en 127.0.0.1 o localhost nunca va a ser alcanzable desde acá.
// Si cambiás este secreto, redeployá la función para que tome el nuevo valor:
//   supabase secrets set SITE_URL=https://tu-dominio-real.com
//   supabase functions deploy evaluar-examen-escrito --no-verify-jwt
// ============================================================================

// [Sprint 2] Toda la lógica del corrector (prompt, Gemini, banco, cálculo de nota) vive ahora en
// ../_shared/evaluador.ts y se comparte con worker-correccion. Este endpoint sigue igual, como
// camino síncrono de respaldo.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCors } from "../_shared/cors.ts";
import {
  cargarBanco, evaluacionNula, evaluarLote, excedeLimite, generarResumen, indexarBanco, LOTE,
  MAX_PREGUNTAS, MAX_RESPUESTA, MODEL, PILARES, promedio, redondear1, SITE_URL, texto,
} from "../_shared/evaluador.ts";
import type { Entrada, Evaluacion, ItemBanco } from "../_shared/evaluador.ts";

// CORS lo maneja ../_shared/cors.ts. Acá solo queda el Content-Type.
const jsonHeaders = { "Content-Type": "application/json" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

// ----------------------------------------------------------------------------
// Handler
// ----------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  // El preflight OPTIONS ya lo respondió withCors (204) antes de llegar a este handler.
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  try {
    // 1. Usuario autenticado
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autenticado." }, 401);
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supa.auth.getUser();
    if (userError || !user) return json({ error: "Sesión inválida o vencida. Iniciá sesión de nuevo." }, 401);
    if (excedeLimite(user.id)) return json({ error: "Demasiadas correcciones seguidas. Esperá unos minutos y reintentá." }, 429);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) { console.error("[evaluar-examen-escrito] Falta el secreto GEMINI_API_KEY."); return json({ error: "Función mal configurada." }, 500); }

    // 2. Entrada mínima: solo ids y respuestas
    const body = await req.json().catch(() => null);
    const modulo = String(body?.modulo ?? "cirugia").toLowerCase();
    if (!/^[a-z0-9_-]{1,30}$/.test(modulo)) return json({ error: "Módulo inválido." }, 400);
    const crudas = Array.isArray(body?.respuestas) ? body.respuestas : null;
    if (!crudas || crudas.length === 0) return json({ error: "No llegaron respuestas para evaluar." }, 400);
    if (crudas.length > MAX_PREGUNTAS) return json({ error: `Máximo ${MAX_PREGUNTAS} preguntas por examen.` }, 400);

    const entradas: Entrada[] = crudas.map((r: any) => ({ id: texto(r?.id, 80), respuesta: texto(r?.respuesta_alumno, MAX_RESPUESTA) }));
    if (entradas.some((e) => !e.id)) return json({ error: "Hay respuestas sin id de pregunta." }, 400);

    // 3. El banco se lee del servidor (el cliente no puede alterar puntos clave ni errores).
    //    Fallback de emergencia: si el body trae `banco_local` (array con el mismo shape
    //    que data/escrito_<modulo>.json), se usa SOLO cuando el fetch a SITE_URL falla —
    //    pensado para desarrollo local (127.0.0.1), donde Supabase nunca puede alcanzar
    //    tu máquina. Ver nota de seguridad más abajo antes de usar esto en producción.
    let banco: Map<string, ItemBanco>;
    try {
      banco = await cargarBanco(modulo);
    } catch (err) {
      const detalle = (err as Error).message;
      console.error("[evaluar-examen-escrito] banco:", detalle);

      const bancoLocal = Array.isArray(body?.banco_local) ? body.banco_local : null;
      if (bancoLocal && bancoLocal.length > 0) {
        console.warn("[evaluar-examen-escrito] usando banco_local del payload (fallback) tras fallar SITE_URL.");
        banco = indexarBanco(bancoLocal);
      } else {
        // 500, no 502: esto NO es un error de gateway/proxy, es un fallo controlado y
        // atrapado por este mismo try/catch — la función respondió, solo que no pudo
        // conseguir el banco. El detalle (URL exacta, status HTTP, timeout, etc.) viaja
        // en la respuesta para no tener que ir a mirar los logs de Supabase cada vez:
        // sacalo del client si en algún momento te molesta exponerlo.
        return json({
          error: "No se pudo cargar el banco de preguntas para corregir.",
          detalle,
          ayuda: `Esta función corre en la nube de Supabase, no en tu computadora: no puede hacer` +
            ` fetch a localhost/127.0.0.1. Para producción, configurá el secreto SITE_URL con un` +
            ` dominio público donde ${SITE_URL}/data/escrito_${modulo}.json responda 200 (probalo` +
            ` en el navegador, sin login). Para probar en local, mandá el JSON del banco en` +
            ` \`banco_local\` dentro del body de este mismo POST.`,
        }, 500);
      }
    }

    const evaluables: { item: ItemBanco; entrada: Entrada }[] = [];
    const listas = new Map<string, Evaluacion>();
    for (const e of entradas) {
      const item = banco.get(e.id);
      if (!item || item.puntos.length === 0) { listas.set(e.id, evaluacionNula(e.id, "Esta pregunta no está disponible para corrección (sin puntos clave cargados).")); continue; }
      if (!e.respuesta) { listas.set(e.id, { ...evaluacionNula(e.id, "Sin respuesta."), nota: 1 }); continue; }
      evaluables.push({ item, entrada: e });
    }

    // 4. Corrección por lotes en paralelo
    const lotes: typeof evaluables[] = [];
    for (let i = 0; i < evaluables.length; i += LOTE) lotes.push(evaluables.slice(i, i + LOTE));
    for (const ev of (await Promise.all(lotes.map((l) => evaluarLote(apiKey, l)))).flat()) listas.set(ev.id, ev);

    const evaluaciones = entradas.map((e) => listas.get(e.id)!);

    // 5. Nota final y promedios por pilar (por código)
    const notas = evaluaciones.map((e) => e.nota).filter((n): n is number => n !== null);
    const notaFinal = redondear1(promedio(notas));
    const promediosPilares: Record<string, number | null> = {};
    for (const p of PILARES) {
      promediosPilares[p] = redondear1(promedio(evaluaciones.map((e) => e.pilares[p]).filter((v): v is number => v !== null)));
    }
    const resumen = notas.length ? await generarResumen(apiKey, evaluaciones, banco, notaFinal) : { comentario: "", fortalezas: [], a_reforzar: [] };

    return json({
      evaluaciones,
      resumen_general: { nota_final: notaFinal, promedios_pilares: promediosPilares, ...resumen },
      sin_corregir: evaluaciones.filter((e) => e.nota === null).length,
      modelo: MODEL,
    });
  } catch (err) {
    console.error("[evaluar-examen-escrito] Error inesperado:", err);
    return json({ error: "Error interno." }, 500);
  }
}

Deno.serve(withCors(handler));
