// supabase/functions/evaluar-simulacion/index.ts
//
// Campus Nika — Evaluación de Simuladores Clínicos Interactivos (Sprint 3)
// Modos soportados: pase_sala | shock_room | consultorio_legales
// Modelo: Google Gemini (REST API).
//
// IMPORTANTE (fix Sprint 3): esta función ya NO fuerza response_mime_type
// "application/json". El simulador es un chat multi-turno: durante el caso
// la IA tiene que poder responder en diálogo libre (texto plano, en
// personaje) y recién al cerrar el caso emite el JSON de evaluación como
// parte de ese mismo texto. Por eso acá siempre se devuelve la respuesta
// CRUDA del modelo tal cual, envuelta en { texto }, y es el frontend
// (parsearEvaluacionFinalSimulador en examen.html) quien decide si ese
// texto es diálogo o el JSON de cierre.

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Tipos del payload que envía el frontend (ClinicaEngine / ShockRoomEngine)
// ---------------------------------------------------------------------------
interface TurnoHistorial {
  rol: "alumno" | "paciente" | "usuario" | "ia" | "user" | "model";
  contenido?: string;
  texto?: string;
  mensaje?: string;
}

interface PayloadEntrada {
  modo: "pase_sala" | "shock_room" | "consultorio_legales" | string;
  submodo?: string;
  system_prompt?: string;
  historial?: TurnoHistorial[];
  mensaje?: string;
}

// ---------------------------------------------------------------------------
// Instrucciones generales del evaluador (Profesor Titular estricto)
// ---------------------------------------------------------------------------
const INSTRUCCIONES_GENERALES = `
Sos un Profesor Titular de Cirugía / Clínica Médica, evaluador sumamente
exigente de un residente/estudiante de medicina en un simulador clínico.

Reglas de calificación (aplican SIEMPRE, sin excepción, para cuando llegue
el momento de cerrar el caso con la evaluación final):
- NO regalás notas. El puntaje de 9 o 10 en cualquier pilar es exclusivo
  para un desempeño excelente, sin errores relevantes.
- Toda omisión diagnóstica relevante o cualquier iatrogenia terapéutica
  (indicación contraindicada, dosis peligrosa, conducta que daña al
  paciente) debe penalizarse con severidad, arrastrando la nota final
  hacia el desaprobado (por debajo de 6/10) sin importar lo bien
  presentado que esté el resto del caso.
- Exigís vocabulario técnico médico riguroso y preciso; el uso de
  lenguaje coloquial o impreciso en contextos clínicos formales resta
  puntos en el pilar "vocabulario".
- Sé objetivo, concreto y justificá cada puntaje con evidencia extraída
  del historial de la simulación (citá qué dijo o dejó de decir el
  alumno).

Mientras el caso siga en curso (no se haya decidido cerrarlo todavía),
respondé ÚNICAMENTE en diálogo libre, en el personaje que te toque según
las instrucciones de abajo (paciente, enfermero, jefe de guardia, etc.).
NUNCA mezcles diálogo con fragmentos de JSON ni adelantes la evaluación
mientras el caso sigue abierto.
`.trim();

// ---------------------------------------------------------------------------
// Enrutador: instrucciones extra por modo/submodo
// ---------------------------------------------------------------------------
function instruccionesPorModo(modo: string, submodo?: string): string {
  switch (modo) {
    case "pase_sala": {
      let extra = `
MODO: Pase de Sala.
Enfocate especialmente en:
- La calidad y el orden de la semiología: si el alumno recolectó los
  signos y síntomas de forma completa y metódica antes de avanzar.
- El razonamiento diagnóstico deductivo: si los diagnósticos
  diferenciales planteados se sostienen lógicamente en los hallazgos
  presentados, y si el plan de estudios complementarios está
  jerarquizado y justificado (no "pedir todo").
`.trim();

      if (submodo === "interrogatorio_ciego") {
        extra += `
Submodo Interrogatorio Ciego: evaluá además si el alumno logró
reconstruir el cuadro clínico completo únicamente a partir de las
respuestas del paciente, sin datos previos regalados. Penalizá
preguntas redundantes o mal dirigidas que evidencien falta de método.
`.trim();
      } else if (submodo === "casos_evolutivos") {
        extra += `
Submodo Casos Evolutivos: evaluá si el alumno ajustó correctamente su
conducta ante los cambios en la evolución del paciente a lo largo del
historial, y si detectó a tiempo signos de alarma o empeoramiento.
`.trim();
      } else if (submodo === "caza_iatrogenias") {
        extra += `
Submodo Caza de Iatrogenias: el foco central del pilar "terapéutica"
es si el alumno identificó y corrigió indicaciones iatrogénicas
presentes en el caso. No detectarlas es un error grave y debe bajar
la nota final por debajo del aprobado.
`.trim();
      } else if (submodo === "armado_soap") {
        extra += `
Submodo Armado de SOAP: evaluá específicamente la estructura
Subjetivo/Objetivo/Análisis/Plan entregada por el alumno: que cada
sección contenga lo que corresponde y que el Plan se desprenda
lógicamente del Análisis.
`.trim();
      } else if (submodo === "simulador_recetario") {
        extra += `
Submodo Simulador de Recetario: en el pilar "terapéutica" prestá
especial atención a la corrección formal y de seguridad de la receta
(droga, dosis, vía, frecuencia, duración, interacciones y
contraindicaciones).
`.trim();
      }
      return extra;
    }

    case "shock_room": {
      let extra = `
MODO: Shock Room.
Enfocate especialmente en:
- La velocidad de reacción: en emergencias, cada segundo de demora o
  cada orden fuera de secuencia cuenta como error grave. Penalizá con
  severidad la pérdida de tiempo o la indecisión.
- El apego estricto al ABCDE del trauma (Vía Aérea, Ventilación,
  Circulación, Déficit neurológico, Exposición) y al triage correcto
  del paciente crítico.
- Regla dura: si según el historial el paciente terminó fallecido, o
  el alumno tomó una decisión lenta o claramente errónea en un punto
  crítico del ABCDE, la nota final DEBE ser desaprobada
  automáticamente (menor a 6/10), sin importar el resto del desempeño.
`.trim();

      if (submodo === "time_attack") {
        extra += `
Submodo Time Attack: ponderá aún más la velocidad relativa de las
respuestas del alumno a lo largo del historial; cualquier vacilación
evidente en el texto debe reflejarse negativamente en "terapeutica".
`.trim();
      } else if (submodo === "triage") {
        extra += `
Submodo Triage: el foco central es si el alumno clasificó
correctamente la prioridad de atención del paciente (rojo/amarillo/
verde/negro o escala equivalente) en función de los signos vitales
presentados.
`.trim();
      } else if (submodo === "escenarios_caps") {
        extra += `
Submodo Escenarios CAPS: contextualizá la evaluación a los recursos
limitados de un Centro de Atención Primaria de Salud; evaluá si el
alumno adaptó su conducta y decidió correctamente cuándo derivar a un
centro de mayor complejidad.
`.trim();
      } else if (submodo === "plot_twists") {
        extra += `
Submodo Plot Twists: evaluá específicamente si el alumno supo
reaccionar y replantear su conducta ante el giro clínico inesperado
que aparece en el historial, sin aferrarse a su hipótesis inicial.
`.trim();
      }
      return extra;
    }

    case "consultorio_legales": {
      let extra = `
MODO: Consultorio y Legales.
Enfocate especialmente en:
- La calidad de la relación médico-paciente: empatía, escucha activa y
  comunicación clara, sin resignar rigor clínico.
- El resguardo médico-legal de las conductas del alumno (consentimiento
  informado, registro adecuado, indicaciones claras y trazables).
`.trim();

      if (submodo === "paciente_googleador") {
        extra += `
Submodo Paciente Googleador: evaluá cómo manejó el alumno las
objeciones o "contra-diagnósticos" de internet que trae el paciente,
sin descalificarlo pero sosteniendo el criterio médico correcto con
argumentos claros.
`.trim();
      } else if (submodo === "malas_noticias") {
        extra += `
Submodo Malas Noticias: evaluá la comunicación siguiendo el protocolo
EPICEE (Entorno, Percepción, Invitación, Conocimiento, Empatía,
Estrategia/resumen). Penalizá la falta de contención emocional, la
frialdad excesiva o dar la noticia de forma abrupta sin preparar el
terreno.
`.trim();
      } else if (submodo === "auditoria_hc") {
        extra += `
Submodo Auditoría de HC: el foco central es el resguardo médico-legal:
evaluá si la historia clínica reconstruida por el alumno a partir del
caso es completa, coherente y defendible ante una auditoría (fechas,
justificación de conductas, consentimientos, ausencia de
contradicciones).
`.trim();
      }
      return extra;
    }

    default:
      return `MODO: ${modo || "desconocido"}. Aplicá los criterios generales.`;
  }
}

// ---------------------------------------------------------------------------
// Mapeo del historial del frontend al formato Gemini (contents: user/model)
// ---------------------------------------------------------------------------
function mapearHistorialAGemini(historial: TurnoHistorial[] = []) {
  return historial
    .map((turno) => {
      const texto = turno.contenido ?? turno.texto ?? turno.mensaje ?? "";
      if (!texto) return null;

      const rolOriginal = (turno.rol || "").toLowerCase();
      const esAlumno = ["alumno", "usuario", "user"].includes(rolOriginal);
      const role = esAlumno ? "user" : "model";

      return {
        role,
        parts: [{ text: texto }],
      };
    })
    .filter((t): t is { role: string; parts: { text: string }[] } => t !== null);
}

// ---------------------------------------------------------------------------
// Llamada a Gemini
// ---------------------------------------------------------------------------
const GEMINI_MODEL = "gemini-3.5-flash-lite";

async function llamarGemini(systemInstructionTexto: string, contents: unknown[]) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("Falta configurar el secret GEMINI_API_KEY en el proyecto de Supabase.");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent` +
    `?key=${apiKey}`;

  // TODO: Integrar llamada a la API de Gemini / NotebookLM para grounding
  // científico de la respuesta. Acá iría, antes de armar `contents`, una
  // consulta a la base de conocimiento (NotebookLM / RAG propio) para traer
  // fragmentos de bibliografía relevantes al caso y agregarlos como contexto
  // adicional (por ejemplo, un turno "user" extra con el texto recuperado,
  // o dentro de systemInstructionTexto) antes de generar la respuesta.

  const body = {
    system_instruction: {
      parts: [{ text: systemInstructionTexto }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      // Sin response_mime_type: el modelo responde en diálogo libre durante
      // el caso, y en JSON (como texto plano) recién cuando decide cerrarlo.
    },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const detalle = await resp.text();
    throw new Error(`Error de la API de Gemini (${resp.status}): ${detalle}`);
  }

  const data = await resp.json();

  const textoRespuesta: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textoRespuesta) {
    throw new Error(
      `Respuesta de Gemini sin contenido utilizable: ${JSON.stringify(data)}`,
    );
  }

  return textoRespuesta;
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido. Usá POST." }, 405);
  }

  try {
    const payload: PayloadEntrada = await req.json();
    const { modo, submodo, system_prompt, historial = [], mensaje } = payload;

    if (!modo) {
      return jsonResponse({ error: "Falta el campo 'modo' en el body." }, 400);
    }

    // System prompt final: base propia del submodo (viene del frontend,
    // definido en examModesConfig.js, y ya incluye ahí mismo el formato de
    // cierre FORMATO_EVALUACION_FINAL) + instrucciones generales del
    // evaluador + instrucciones específicas por modo/submodo.
    const systemInstructionTexto = [
      system_prompt?.trim(),
      INSTRUCCIONES_GENERALES,
      instruccionesPorModo(modo, submodo),
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const contents = mapearHistorialAGemini(historial);

    // Si además viene un `mensaje` suelto (turno del alumno, o el mensaje de
    // arranque automático que dispara la presentación del caso), se agrega
    // como último turno "user".
    if (mensaje && mensaje.trim()) {
      contents.push({ role: "user", parts: [{ text: mensaje.trim() }] });
    }

    if (contents.length === 0) {
      return jsonResponse(
        { error: "No hay historial ni mensaje para procesar en este turno." },
        400,
      );
    }

    const textoRespuesta = await llamarGemini(systemInstructionTexto, contents);

    // Se devuelve SIEMPRE la respuesta cruda del modelo, tal cual, envuelta
    // en { texto }. El frontend (parsearEvaluacionFinalSimulador) es quien
    // decide si ese texto es diálogo de la simulación o el JSON de cierre.
    return new Response(JSON.stringify({ texto: textoRespuesta }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("evaluar-simulacion error:", err);
    const mensajeError = err instanceof Error ? err.message : "Error desconocido.";
    return jsonResponse({ error: mensajeError }, 500);
  }
});
