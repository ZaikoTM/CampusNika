import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { withCors } from "../_shared/cors.ts";

// CORS (preflight OPTIONS + cabeceras en todas las respuestas) lo maneja ../_shared/cors.ts
const jsonHeaders = { 'Content-Type': 'application/json' };

serve(withCors(async (req: Request): Promise<Response> => {
  try {
    const { pregunta, modulo, unidad } = await req.json();

    // Verificamos que tengas configurada tu clave en Supabase Secrets
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("Falta configurar GEMINI_API_KEY en el servidor");

    const genAI = new GoogleGenerativeAI(apiKey);

    // ORDEN ESTRICTA: SOLO GEMINI 3.5 FLASH-LITE
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash-lite",
        systemInstruction: `Actúa como un médico especialista (jefe de guardia o instructor de residentes) en un hospital público de Argentina. Tu objetivo es orientar a estudiantes de medicina avanzados y rotantes.
    
    REGLAS ESTRICTAS DE FORMATO Y TONO:
    1. PROHIBIDO EL MARKDOWN: No uses asteriscos (*), numerales (#), ni guiones bajos. Usa texto plano absoluto. Para separar ideas, usa saltos de línea (doble enter), letras MAYÚSCULAS para los títulos, o guiones simples (-) para las listas.
    2. TONO ARGENTINO: Háblale de 'vos' al estudiante. Usá un tono pragmático y términos locales (ej. 'en la guardia', 'el paciente', 'pase de sala', 'interconsulta', 'ojo con este detalle'). Sé directo, sin introducciones largas ni saludos robóticos (nada de 'Estimado colega').
    3. RIGOR CIENTÍFICO (10/10): Basate en consensos argentinos (SAC, SAM, SAP, SADI, Ministerio de Salud) y libros clásicos (Farreras, Harrison, Schwartz). 
    4. No inventes. Si es un tema debatido, marcalo. Sé resolutivo, como un médico enseñando al pie de la cama del paciente.`
    });

    // Armamos el mensaje del alumno con el contexto de módulo/unidad para que
    // la IA sepa en qué materia está parada, sin depender de ningún PDF adjunto.
    const mensajeDelUsuario = `Módulo actual: ${modulo}. Unidad temática: ${unidad}.

Pregunta del alumno: ${pregunta}`;

    // Ejecutar la IA (sin fileUri, sin catálogos de PDFs: solo el mensaje del usuario)
    const result = await model.generateContent(mensajeDelUsuario);
    const response = await result.response;
    const textoRespuesta = response.text();

    // Devolver al frontend
    return new Response(
      JSON.stringify({ respuesta: textoRespuesta }),
      { headers: jsonHeaders }
    );

  } catch (error) {
    console.error("Error en NikaMed Chat:", error);
    return new Response(
      JSON.stringify({ error: "Ocurrió un error al procesar la consulta." }),
      { status: 500, headers: jsonHeaders }
    );
  }
}));
