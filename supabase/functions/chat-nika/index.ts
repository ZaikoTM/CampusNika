// ============================================================================
// CAMPUS NIKA — Edge Function: chat-nika   (asistente bibliográfico dentro de cada Unidad)
// ----------------------------------------------------------------------------
// Herramienta exclusiva NikaMed+ / admin, forzada en el SERVIDOR (antes solo la pantalla la ocultaba):
//   · exige sesión real,
//   · verifica el plan (simulador_usos: ilimitado = NikaMed+, vip o admin),
//   · máximo LIMITE_HORA consultas por usuario por hora, tope de largo,
//   · pasa por el contador de cupo de Gemini usando solo una parte del tope.
// Deploy: supabase functions deploy chat-nika --no-verify-jwt   (la sesión se valida acá adentro)
// ============================================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withCors } from "../_shared/cors.ts";
import {
  autenticar, consultarPlan, generarTexto, limitarUsuario, MODEL, MODELO_RESPALDO, reservarCupo, texto,
} from "../_shared/evaluador.ts";

const jsonHeaders = { 'Content-Type': 'application/json' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const LIMITE_HORA = 60;
const MAX_PREGUNTA = 800;
const FRACCION_CUPO = 0.6;
const ESPERA_CUPO_MAX_S = 5;

const SYSTEM_INSTRUCTION = `Actúa como un médico especialista (jefe de guardia o instructor de residentes) en un hospital público de Argentina. Tu objetivo es orientar a estudiantes de medicina avanzados y rotantes.

REGLAS ESTRICTAS DE FORMATO Y TONO:
1. PROHIBIDO EL MARKDOWN: No uses asteriscos (*), numerales (#), ni guiones bajos. Usa texto plano absoluto. Para separar ideas, usa saltos de línea (doble enter), letras MAYÚSCULAS para los títulos, o guiones simples (-) para las listas.
2. TONO ARGENTINO: Háblale de 'vos' al estudiante. Usá un tono pragmático y términos locales (ej. 'en la guardia', 'el paciente', 'pase de sala', 'interconsulta', 'ojo con este detalle'). Sé directo, sin introducciones largas ni saludos robóticos (nada de 'Estimado colega').
3. RIGOR CIENTÍFICO (10/10): Basate en consensos argentinos (SAC, SAM, SAP, SADI, Ministerio de Salud) y libros clásicos (Farreras, Harrison, Schwartz).
4. No inventes. Si es un tema debatido, marcalo. Sé resolutivo, como un médico enseñando al pie de la cama del paciente.`;

serve(withCors(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return json({ error: "metodo_no_permitido" }, 405);
  try {
    const sesion = await autenticar(req);
    if (!sesion) return json({ error: "no_autenticado", mensaje: "Iniciá sesión para usar el asistente." }, 401);
    const { user, supaUser, admin } = sesion;

    const body = await req.json().catch(() => null);
    const pregunta = texto(body?.pregunta, MAX_PREGUNTA);
    if (!pregunta) return json({ error: "consulta_vacia", mensaje: "Escribí tu consulta." }, 400);
    const modulo = texto(body?.modulo, 40);
    const unidad = texto(body?.unidad, 40);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) { console.error("[chat-nika] Falta GEMINI_API_KEY"); return json({ error: "config", mensaje: "Asistente no disponible por ahora." }, 500); }

    // Solo NikaMed+ / vip / admin. Si no se puede verificar el plan, se pide reintentar (no se regala el acceso).
    const plan = await consultarPlan(supaUser);
    if (!plan.ok) return json({ error: "plan_no_verificado", mensaje: "No pudimos verificar tu plan. Probá de nuevo en unos segundos." }, 503);
    if (!plan.ilimitado) return json({ error: "solo_premium", mensaje: "El Asistente Nika es exclusivo de NikaMed+." }, 403);

    const espera = await limitarUsuario(admin, user.id, "chat-nika", LIMITE_HORA);
    if (espera > 0) {
      const min = Math.max(1, Math.ceil(espera / 60));
      return json({ error: "limite_usuario", mensaje: `Llegaste al límite de ${LIMITE_HORA} consultas por hora. Probá de nuevo en ${min} min.`, reintentar_en: espera }, 429);
    }

    let modelo = MODEL;
    let r = await reservarCupo(admin, modelo, 1, FRACCION_CUPO);
    if (r !== 0 && MODELO_RESPALDO && MODELO_RESPALDO !== modelo && (await reservarCupo(admin, MODELO_RESPALDO, 1, FRACCION_CUPO)) === 0) { modelo = MODELO_RESPALDO; r = 0; }
    if (r > 0 && r <= ESPERA_CUPO_MAX_S) {
      await new Promise((ok) => setTimeout(ok, r * 1000 + 300));
      r = await reservarCupo(admin, modelo, 1, FRACCION_CUPO);
    }
    if (r !== 0) return json({ error: "cupo_ia", mensaje: "El asistente tiene mucha demanda en este momento. Probá de nuevo en un minuto." }, 429);

    // Contexto de módulo/unidad para que la IA sepa en qué materia está parada, sin PDF adjunto.
    const mensajeDelUsuario = `Módulo actual: ${modulo}. Unidad temática: ${unidad}.\n\nPregunta del alumno: ${pregunta}`;
    let respuesta = "";
    try {
      respuesta = await generarTexto(apiKey, modelo, SYSTEM_INSTRUCTION, mensajeDelUsuario, { temperature: 0.7, maxOutputTokens: 1500 });
    } catch (_) {
      return json({ error: "fallo_ia", mensaje: "Ocurrió un error al procesar la consulta." }, 502);
    }
    return json({ respuesta });
  } catch (error) {
    console.error("Error en NikaMed Chat:", error);
    return json({ error: "interno", mensaje: "Ocurrió un error al procesar la consulta." }, 500);
  }
}));
