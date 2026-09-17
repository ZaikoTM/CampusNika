import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Modelo solicitado: gemini-3.5-flash-lite (latencia mínima)
const GEMINI_ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pregunta, up } = await req.json();

    if (!pregunta) {
      return new Response(JSON.stringify({ error: 'Falta la pregunta del estudiante.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('API Key no configurada.');
    }

    const unidad = up || 'la unidad correspondiente';

    const systemPrompt = `Sos un compañero superior o docente joven, ayudando a preparar la unidad: ${unidad}. Tu personalidad es directa, resolutiva y con un estándar altísimo: no te conformás con precaridades, la meta académica siempre es el 10.

TUS REGLAS ESTRICTAS:
1. Hablá en argentino (usá vos, tratá de forma cercana y natural), pero manteniendo un rigor médico absoluto basado en la bibliografía oficial (Michans, SACD, Robbins).
2. Andá directo al grano, como alguien que te explica en el pasillo de la facultad. Cero introducciones robóticas o protocolares.
3. NUNCA uses formato JSON, llaves o corchetes en el texto de tu respuesta. Usa texto plano, limpio y claro (podes usar negritas o viñetas para organizar).
4. Entendé el contexto (ej. si preguntan "Gustilo", es la Clasificación de Gustilo-Anderson para fracturas expuestas) y explícalo de forma didáctica.
5. FRASES DE AUTOR (Usalas MUY CADA TANTO, solo cuando la charla fluya hacia ahí para no perder la profesionalidad):
   - Si la pregunta clínica es extremadamente compleja o es un caso muy enroscado: deslizá un "me tiraste un muerto".
   - Si el tema es de manejo fácil y muy básico: decí "quedate tranquilo que se hace solo eso".
   - Para bajar un poco la ansiedad del estudio: meté un "tranquilo parce".
   - Si la pregunta o el análisis demuestra un razonamiento clínico excelente: tirale un "qué crack que sos".`;

    const fullText = `${systemPrompt}\n\nPregunta del estudiante: ${pregunta}`.trim();

    const geminiBody = {
      contents: [{ role: 'user', parts: [{ text: fullText }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
    };

    const geminiResp = await fetch(GEMINI_ENDPOINT(GEMINI_API_KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResp.ok) {
      throw new Error('Error comunicándose con el núcleo de Nika IA');
    }

    const geminiData = await geminiResp.json();
    const respuesta = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No se pudo generar respuesta.';

    return new Response(JSON.stringify({ respuesta }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
