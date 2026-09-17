import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Modelo solicitado: gemini-3.5-flash-lite, sin streaming.
const GEMINI_ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`;

const SYSTEM_PROMPT_BASE = `Sos Nika, la tutora virtual del Campus Nika, una plataforma de estudio para estudiantes de medicina de la UNER.
Tu tono es amable, cercano y motivador, como una compañera de residencia con experiencia.
Tu prioridad es ORIENTAR LA NAVEGACIÓN de la plataforma (dónde están las notas, el Pomodoro, el progreso, el material de estudio, el foro, el modo Versus).
Si te preguntan algo de contenido médico puntual, podés dar una orientación general breve, pero siempre aclarando que para la bibliografía oficial de la cátedra conviene consultar el material cargado en cada Unidad Problema.
Respondé siempre en español, en 2 a 4 oraciones como máximo, sin tecnicismos innecesarios.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, modulo, upId } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Falta la consulta del estudiante.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('API Key de Gemini no configurada en los secretos.');
    }

    const contextoTexto = modulo
      ? `[Contexto del estudiante: módulo "${modulo}"${upId ? `, unidad "${upId}"` : ''}]`
      : '';

    const fullText = `${SYSTEM_PROMPT_BASE}\n\n${contextoTexto}\n\nConsulta del estudiante: ${query}`.trim();

    const geminiBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: fullText }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1000,
      },
    };

    const geminiResp = await fetch(GEMINI_ENDPOINT(GEMINI_API_KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error('Error de Gemini API:', geminiResp.status, errText);
      return new Response(JSON.stringify({ error: 'Error comunicándose con el motor de IA.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResp.json();
    const answer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No pude generar una respuesta clara para esa consulta. Probá reformularla.';

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error inesperado en chat-flotante:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
