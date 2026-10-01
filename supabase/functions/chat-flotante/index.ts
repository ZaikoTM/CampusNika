// ============================================================================
// CAMPUS NIKA — Edge Function: chat-flotante   (asistente Nika del campus)
// ----------------------------------------------------------------------------
// Abierta a todos los alumnos CON SESIÓN (gratuitos incluidos), pero protegida:
//   · exige una sesión real (la clave pública "anon" ya no sirve),
//   · máximo LIMITE_HORA consultas por usuario por hora,
//   · tope de largo de la consulta,
//   · pasa por el contador de cupo de Gemini usando solo una parte del tope (deja lugar a los exámenes),
//   · los gratuitos usan GEMINI_MODEL_GRATIS (si existe) y NikaMed+/admin el modelo principal.
// Deploy: supabase functions deploy chat-flotante --no-verify-jwt   (la sesión se valida acá adentro)
// ============================================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { withCors } from '../_shared/cors.ts';
import {
  autenticar, consultarPlan, generarTexto, limitarUsuario, MODEL, MODELO_GRATIS, MODELO_RESPALDO, reservarCupo, texto,
} from '../_shared/evaluador.ts';

const jsonHeaders = { 'Content-Type': 'application/json' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const LIMITE_HORA = 10;          // consultas por usuario por hora
const MAX_CONSULTA = 500;        // caracteres
const FRACCION_CUPO = 0.4;       // parte del tope de Gemini que este chat puede ocupar
const ESPERA_CUPO_MAX_S = 5;

const SYSTEM_PROMPT_BASE = `Sos Nika, la tutora virtual del Campus Nika, una plataforma de estudio para estudiantes de medicina de la UNER.
Tu tono es amable, cercano y motivador, como una compañera de residencia con experiencia.
Tu prioridad es ORIENTAR LA NAVEGACIÓN de la plataforma (dónde están las notas, el Pomodoro, el progreso, el material de estudio, el foro, el modo Versus).
Si te preguntan algo de contenido médico puntual, podés dar una orientación general breve, pero siempre aclarando que para la bibliografía oficial de la cátedra conviene consultar el material cargado en cada Unidad Problema.
Respondé siempre en español, en 2 a 4 oraciones como máximo, sin tecnicismos innecesarios.`;

serve(withCors(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'metodo_no_permitido' }, 405);
  try {
    const sesion = await autenticar(req);
    if (!sesion) return json({ error: 'no_autenticado', mensaje: 'Iniciá sesión para usar el asistente.' }, 401);
    const { user, supaUser, admin } = sesion;

    const body = await req.json().catch(() => null);
    const query = texto(body?.query, MAX_CONSULTA);
    if (!query) return json({ error: 'consulta_vacia', mensaje: 'Escribí tu consulta.' }, 400);
    const modulo = texto(body?.modulo, 40);
    const upId = texto(body?.upId, 40);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) { console.error('[chat-flotante] Falta GEMINI_API_KEY'); return json({ error: 'config' , mensaje: 'Asistente no disponible por ahora.' }, 500); }

    // Límite por usuario
    const espera = await limitarUsuario(admin, user.id, 'chat-flotante', LIMITE_HORA);
    if (espera > 0) {
      const min = Math.max(1, Math.ceil(espera / 60));
      return json({ error: 'limite_usuario', mensaje: `Llegaste al límite de ${LIMITE_HORA} consultas por hora al asistente. Probá de nuevo en ${min} min.`, reintentar_en: espera }, 429);
    }

    // Modelo según el plan (solo se consulta el plan si los modelos difieren)
    let modelo = MODEL;
    if (MODELO_GRATIS !== MODEL) {
      const plan = await consultarPlan(supaUser);
      if (plan.ok && !plan.ilimitado) modelo = MODELO_GRATIS;
    }

    // Cupo global de Gemini (con prioridad baja respecto de los exámenes)
    let r = await reservarCupo(admin, modelo, 1, FRACCION_CUPO);
    if (r !== 0 && MODELO_RESPALDO && MODELO_RESPALDO !== modelo && (await reservarCupo(admin, MODELO_RESPALDO, 1, FRACCION_CUPO)) === 0) { modelo = MODELO_RESPALDO; r = 0; }
    if (r > 0 && r <= ESPERA_CUPO_MAX_S) {
      await new Promise((ok) => setTimeout(ok, r * 1000 + 300));
      r = await reservarCupo(admin, modelo, 1, FRACCION_CUPO);
    }
    if (r !== 0) return json({ error: 'cupo_ia', mensaje: 'El asistente tiene mucha demanda en este momento. Probá de nuevo en un minuto.' }, 429);

    const contexto = modulo ? `[Contexto del estudiante: módulo "${modulo}"${upId ? `, unidad "${upId}"` : ''}]` : '';
    const userText = `${contexto}\n\nConsulta del estudiante: ${query}`.trim();

    let answer = '';
    try {
      answer = await generarTexto(GEMINI_API_KEY, modelo, SYSTEM_PROMPT_BASE, userText, { temperature: 0.6, maxOutputTokens: 1000 });
    } catch (_) {
      return json({ error: 'fallo_ia', mensaje: 'Error comunicándose con el motor de IA. Probá de nuevo en unos segundos.' }, 502);
    }
    return json({ answer: answer || 'No pude generar una respuesta clara para esa consulta. Probá reformularla.' });
  } catch (err) {
    console.error('Error inesperado en chat-flotante:', err);
    return json({ error: 'interno', mensaje: 'Error interno del servidor.' }, 500);
  }
}));
