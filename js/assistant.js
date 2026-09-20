// js/assistant.js
// CAMPUS NIKA — Asistente Flotante (Fase D.6: FAQ+Saludos / Fase D.7: Nika IA Avanzada)
// Se inyecta 100% por DOM/JS, sin depender de markup previo en el HTML.
// Pensado para convivir con estudio.js (lee EstudioState si está disponible).

const NikaAssistant = (() => {

    // ============ TAREA 1: Configuración del proxy seguro (Edge Function) ============
    // La API Key de Gemini YA NO vive acá. El frontend le habla a la Edge
    // Function 'chat-flotante' de Supabase, que es quien guarda la clave
    // (Deno.env.get('GEMINI_API_KEY')) y llama a Gemini del lado del servidor.
    // Si por algún motivo el cliente global de Supabase no está disponible,
    // caemos a estas constantes fijas (mismo patrón que usa estudio.js).
    const FALLBACK_SUPABASE_URL = 'https://pswjmouuyaxueaqqglko.supabase.co';
    const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2ptb3V1eWF4dWVhcXFnbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDA2NzMsImV4cCI6MjEwNTAxNjY3M30.xZbJfZg9QR9jyT4ZcjeLi125Fzub33kajCYy2X_kwHk';

    const GEMINI_CONFIG = {
        timeoutMs: 15000,
        // Se resuelve en cada llamada (ver callGeminiFlash) para poder leer
        // el cliente global de Supabase si ya está inicializado en ese momento.
        getProxyEndpoint: () => {
            const client = window.supabaseClient || window.supabase || null;
            const supabaseUrl = client?.supabaseUrl || window.SUPABASE_URL || FALLBACK_SUPABASE_URL;
            return `${supabaseUrl}/functions/v1/chat-flotante`;
        },
        getProxyKey: () => {
            const client = window.supabaseClient || window.supabase || null;
            return client?.supabaseKey || window.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
        }
    };

    // ============ D.7: Configuración de Nika IA Avanzada (NotebookLM) ============
    // NOTA: NotebookLM no expone una API pública apta para llamarse directo
    // desde el frontend (CORS + auth de Google). Por eso este bloque NO habla
    // con Google: apunta a UN BACKEND PROPIO (proxy) que vos vas a levantar
    // más adelante, y que es quien realmente se comunica con el cuaderno.
    // Mientras ese backend no exista, el fetch de abajo va a fallar con un
    // error de red normal, y handleUserMessage() ya sabe mostrar un mensaje
    // de fallback amigable en ese caso (ver catch más abajo).
    const NIKA_IA_CONFIG = {
        // Reemplazá esta URL por la de tu backend/proxy real cuando lo tengas.
        proxyEndpoint: 'https://mi-backend.com/api/notebooklm',
        // URL del cuaderno de NotebookLM que actúa como base de conocimiento
        // (bibliografía de la cátedra). El backend la necesita para saber
        // contra qué cuaderno consultar.
        notebookUrl: 'https://notebook.google.com/notebook/35187342-8f7c-400f-bbfe-422b24ed42cc',
        // Tiempo máximo de espera antes de abortar el fetch (ms)
        timeoutMs: 15000
    };

    // ============ D.6: Base de FAQ (respuestas locales, sin costo de IA) ============
    // Cada entrada: patrones (keywords en minúscula) -> respuesta fija.
    const FAQ_DB = [
        {
            patterns: ['progreso', 'porcentaje', 'como veo mi progreso', 'avance'],
            answer: 'Tu progreso se ve como una barra con porcentaje arriba de los objetivos, en la pestaña "Temario y Objetivos" de cada Unidad Problema. Se actualiza solo al tildar cada objetivo.'
        },
        {
            patterns: ['nota', 'notas', 'donde estan las notas', 'apuntes'],
            answer: 'Tus notas están en el panel lateral derecho, dentro de cada Unidad Problema. Se guardan automáticamente mientras escribís (no hace falta ningún botón de guardar).'
        },
        {
            patterns: ['pomodoro', 'temporizador', 'tiempo de estudio', 'cronometro'],
            answer: 'El Pomodoro está en el panel lateral derecho. Podés elegir con qué UP contabilizar el tiempo desde el selector "Estudiando:", y cada ciclo completo de 25 minutos queda registrado automáticamente.'
        },
        {
            patterns: ['material', 'pdf', 'recursos', 'bibliografia'],
            answer: 'El material de estudio (PDFs, resúmenes, apuntes) está en la pestaña "Material de Estudio" de cada UP. Las clases y presentaciones están en "Clases y Videos".'
        },
        {
            patterns: ['sesion', 'cerrar sesion', 'login', 'logout'],
            answer: 'Podés cerrar sesión desde el menú de tu perfil en el Campus. Si no tenés sesión activa, algunas funciones (notas, progreso, pomodoro) quedan solo en modo local hasta que inicies sesión.'
        },
        {
            patterns: ['versus', '1 vs 1', 'duelo', 'modo competitivo', 'examen'],
            answer: 'El Modo Versus 1vs1 te deja competir con otro estudiante respondiendo preguntas de examen en simultáneo. Lo encontrás desde el Campus principal.'
        }
    ];

    // ============ Chat ligero: saludos y cortesías (D.7) ============
    // Se resuelve 100% local, antes que la FAQ y muy antes que la IA:
    // no tiene sentido gastar una consulta a NotebookLM para un "hola".
    const GREETING_DB = [
        { patterns: ['hola', 'buenas', 'que tal', 'hey', 'holis'], answers: ['¡Hola! 👋 Soy Nika, tu asistente del Campus. ¿En qué te puedo ayudar hoy?', '¡Buenas! ¿Qué necesitás? Puedo orientarte con el Campus o derivarte a Nika IA Avanzada si es algo médico.'] },
        { patterns: ['buenos dias'], answers: ['¡Buenos días! ☀️ ¿Arrancamos con las UP de hoy?'] },
        { patterns: ['buenas tardes'], answers: ['¡Buenas tardes! ¿En qué te doy una mano?'] },
        { patterns: ['buenas noches'], answers: ['¡Buenas noches! No estudies muy tarde 😉 ¿Te ayudo con algo puntual?'] },
        { patterns: ['gracias', 'muchas gracias', 'genial gracias', 'perfecto gracias'], answers: ['¡De nada! Cualquier otra duda, acá estoy.', '¡Un gusto ayudarte! 🙌'] },
        { patterns: ['chau', 'adios', 'nos vemos', 'hasta luego'], answers: ['¡Nos vemos! Éxitos con el estudio 📚'] },
        { patterns: ['como estas', 'que haces'], answers: ['¡Todo en orden por acá! Listo para ayudarte con el Campus o derivarte a Nika IA Avanzada.'] }
    ];

    function normalize(text) {
        return (text || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // saca tildes para matchear mejor
    }

    // Saludo: exige que el mensaje sea CORTO y esté compuesto casi enteramente
    // por el patrón, para no interceptar preguntas reales que solo empiezan
    // con "hola" (ej. "hola, tengo una duda sobre isquemia mesentérica" debe
    // seguir de largo hacia la FAQ / IA, no cortarse en el saludo).
    function findGreetingAnswer(query) {
        const q = normalize(query).trim();
        if (!q || q.length > 40) return null;

        for (const entry of GREETING_DB) {
            for (const pattern of entry.patterns) {
                const p = normalize(pattern);
                const isCloseMatch = q === p || q.startsWith(p + ' ') || q.startsWith(p + '!') || q.startsWith(p + ',');
                if (isCloseMatch) {
                    const answers = entry.answers;
                    return answers[Math.floor(Math.random() * answers.length)];
                }
            }
        }
        return null;
    }

    function findFaqAnswer(query) {
        const q = normalize(query);
        for (const entry of FAQ_DB) {
            for (const pattern of entry.patterns) {
                if (q.includes(normalize(pattern))) {
                    return entry.answer;
                }
            }
        }
        return null;
    }

    // ============ TAREA 1: Llamada a Gemini vía Edge Function (chat-flotante) ============
    // El frontend YA NO llama a Gemini directamente ni maneja ninguna clave.
    // Solo le pega a nuestra propia Edge Function, que arma el prompt del
    // lado del servidor y usa Deno.env.get('GEMINI_API_KEY') de forma segura.
    async function callGeminiFlash(query, context) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeoutMs);

        try {
            const proxyEndpoint = GEMINI_CONFIG.getProxyEndpoint();
            const proxyKey = GEMINI_CONFIG.getProxyKey();

            let authToken = proxyKey;
            try {
                const _c = window.NikaSupabase && window.NikaSupabase.client;
                if (_c) {
                    const { data: { session: _s } } = await _c.auth.getSession();
                    if (_s && _s.access_token) authToken = _s.access_token;
                }
            } catch (_) {}

            const response = await fetch(proxyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'apikey': proxyKey
                },
                body: JSON.stringify({
                    query,
                    modulo: context?.modulo ?? null,
                    upId: context?.upId ?? null
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errBody = await response.text().catch(() => '');
                console.error('Error de la Edge Function chat-flotante:', response.status, errBody);
                throw new Error(`Error HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            return data.answer || 'No pude generar una respuesta clara para esa consulta. Probá reformularla.';
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn('[NikaAssistant] callGeminiFlash() falló:', err.message);
            return 'Perdón, tuve un problema de conexión con el motor de IA. Intentá de nuevo en unos segundos.';
        }
    }

    // ============ D.7: Derivación a Nika IA Avanzada (NotebookLM vía backend propio) ============
    // Esta es la función pedida: consultarIAProfunda(query, context).
    // Arma el payload completo (consulta + contexto de estudio + cuaderno
    // objetivo) y lo manda a tu backend proxy. Vos solo tenés que:
    //   1) Levantar un servidor (Node/Express, Cloud Function, etc.) en la
    //      URL de NIKA_IA_CONFIG.proxyEndpoint.
    //   2) Hacer que ese servidor reciba este JSON y llame a la API/SDK que
    //      corresponda para consultar el cuaderno de NotebookLM.
    //   3) Devolver { answer: "..." } (o { error: "..." }) como respuesta.
    // Nada de esto requiere tocar el frontend de nuevo.
    async function consultarIAProfunda(query, context) {
        const payload = {
            query: query,
            modulo: context?.modulo ?? null,
            upId: context?.upId ?? null,
            notebookUrl: NIKA_IA_CONFIG.notebookUrl,
            timestamp: new Date().toISOString()
        };

        console.log('[NikaAssistant] consultarIAProfunda() → payload armado:', payload);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), NIKA_IA_CONFIG.timeoutMs);

        try {
            const response = await fetch(NIKA_IA_CONFIG.proxyEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`El backend de Nika IA Avanzada respondió con status ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            return {
                answer: data.answer || 'Nika IA Avanzada no encontró una respuesta clara para esa consulta en la bibliografía de la cátedra.',
                source: 'notebooklm-proxy'
            };
        } catch (err) {
            clearTimeout(timeoutId);
            // Mientras el backend real (mi-backend.com) no exista, este catch
            // es el que se va a ejecutar siempre (fetch falla o hace timeout).
            // Se loguea el motivo real para que sea fácil de debuggear el día
            // que conectes el backend de verdad.
            console.warn('[NikaAssistant] consultarIAProfunda() no pudo contactar al backend (¿ya conectaste el proxy?):', err.message);
            throw err;
        }
    }

    // Alias retrocompatible: el código anterior (Fase D.7 stub) exponía
    // callNotebookLM. Lo mantenemos apuntando a la implementación nueva por
    // si algo externo llegó a engancharse a ese nombre.
    async function callNotebookLM(query, context) {
        return consultarIAProfunda(query, context);
    }

    // ============ Estado interno del widget ============
    let isOpen = false;
    let panelEl = null;
    let messagesEl = null;
    let inputEl = null;
    let btnEl = null;

    function injectStyles() {
        if (document.getElementById('nika-assistant-styles')) return;
        const style = document.createElement('style');
        style.id = 'nika-assistant-styles';
        style.textContent = `
            #nika-assistant-btn {
                position: fixed; bottom: 22px; left: 22px; z-index: 9998;
                width: 56px; height: 56px; border-radius: 50%;
                background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                border: none; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.5rem; color: #fff;
                box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.45);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            #nika-assistant-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 14px 30px -5px rgba(2, 132, 199, 0.55); }

            #nika-assistant-panel {
                position: fixed; bottom: 90px; left: 22px; z-index: 9999;
                width: 320px; max-width: calc(100vw - 44px);
                height: 440px; max-height: calc(100vh - 130px);
                background: #ffffff; border-radius: 16px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25);
                display: none; flex-direction: column; overflow: hidden;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            #nika-assistant-panel.open { display: flex; }

            #nika-assistant-header {
                background: linear-gradient(135deg, #020617 0%, #0f172a 60%, #0369a1 100%);
                color: #fff; padding: 14px 16px;
                display: flex; align-items: center; justify-content: space-between;
            }
            #nika-assistant-header .title { font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
            #nika-assistant-close {
                background: rgba(255,255,255,0.12); border: none; color: #fff;
                width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;
            }

            #nika-assistant-messages {
                flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
                background: #f8fafc;
            }
            
            /* CORREGIDO: Soporte completo para que los textos largos no se corten */
            .nika-msg { 
                max-width: 85%; 
                padding: 9px 12px; 
                border-radius: 12px; 
                font-size: 0.82rem; 
                line-height: 1.45; 
                word-wrap: break-word; 
                word-break: break-word;
                overflow-wrap: break-word;
                height: auto;
            }
            
            .nika-msg.bot { background: #ffffff; border: 1px solid #e2e8f0; color: #0f172a; align-self: flex-start; border-bottom-left-radius: 4px; }
            .nika-msg.user { background: #0284c7; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
            .nika-msg.pending { background: #fef9c3; border: 1px solid rgba(202,138,4,0.3); color: #713f12; align-self: flex-start; font-style: italic; }

            #nika-assistant-inputbar {
                display: flex; gap: 8px; padding: 12px; border-top: 1px solid #e2e8f0; background: #fff;
            }
            #nika-assistant-input {
                flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px;
                font-size: 0.82rem; font-family: inherit; outline: none;
            }
            #nika-assistant-input:focus { border-color: #0284c7; }
            #nika-assistant-send {
                background: #0284c7; color: #fff; border: none; border-radius: 8px;
                padding: 0 14px; font-weight: 700; font-size: 0.82rem; cursor: pointer;
            }
            #nika-assistant-send:hover { background: #0369a1; }

            @media (max-width: 480px) {
                #nika-assistant-panel { left: 12px; right: 12px; width: auto; }
                #nika-assistant-btn { left: 16px; bottom: 16px; }
            }
        `;
        document.head.appendChild(style);
    }

    function appendMessage(text, role) {
        const msg = document.createElement('div');
        msg.className = `nika-msg ${role}`;
        msg.textContent = text;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return msg;
    }

    function getCurrentContext() {
        // EstudioState es global (definido en estudio.js). Si no está presente
        // (ej. el asistente corre en una página sin la suite de estudio abierta),
        // devolvemos un contexto vacío para no romper el flujo.
        const hasEstudioState = typeof EstudioState !== 'undefined';
        return {
            modulo: hasEstudioState ? EstudioState.modulo : null,
            upId: hasEstudioState ? EstudioState.currentUpId : null
        };
    }

    async function handleUserMessage(rawText) {
        const text = rawText.trim();
        if (!text) return;

        appendMessage(text, 'user');
        if (typeof inputEl !== 'undefined' && inputEl) {
            inputEl.value = '';
        }

        // 1) Chat ligero: saludos/cortesías, 100% local e instantáneo.
        const greeting = typeof findGreetingAnswer === 'function' ? findGreetingAnswer(text) : null;
        if (greeting) {
            appendMessage(greeting, 'bot');
            return;
        }

        // 2) FAQ local sobre el uso del Campus (instantáneo, sin costo de IA).
        const faqAnswer = typeof findFaqAnswer === 'function' ? findFaqAnswer(text) : null;
        if (faqAnswer) {
            appendMessage(faqAnswer, 'bot');
            return;
        }

        // 3) No matcheó ni saludo ni FAQ -> consulta real a Gemini:
        const pendingMsg = appendMessage('Pensando...', 'pending');
        const context = typeof getCurrentContext === 'function' ? getCurrentContext() : { modulo: 'General', upId: null };

        try {
            const result = await callGeminiFlash(text, context);
            
            // Eliminar de forma segura el mensaje de "Pensando..." si existe
            if (pendingMsg && typeof pendingMsg.remove === 'function') {
                pendingMsg.remove();
            }

            // Manejar si la respuesta viene como objeto ({ answer: '...' }) o como texto plano
            const answerText = (typeof result === 'object' && result !== null && result.answer) 
                ? result.answer 
                : (typeof result === 'string' ? result : 'No pude generar una respuesta clara.');

            appendMessage(answerText, 'bot');
        } catch (err) {
            if (pendingMsg && typeof pendingMsg.remove === 'function') {
                pendingMsg.remove();
            }
            console.error('[NikaAssistant] Error atrapado en handleUserMessage:', err);
            appendMessage('No pude procesar esa consulta en este momento. Probá de nuevo en unos segundos.', 'bot');
        }
    }

    function togglePanel(forceState) {
        isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
        panelEl.classList.toggle('open', isOpen);
        if (isOpen) inputEl.focus();
    }

    function buildWidget() {
        // Botón flotante
        btnEl = document.createElement('button');
        btnEl.id = 'nika-assistant-btn';
        btnEl.setAttribute('aria-label', 'Abrir asistente Nika');
        btnEl.textContent = '🤖';
        btnEl.addEventListener('click', () => togglePanel());
        document.body.appendChild(btnEl);

        // Panel de chat
        panelEl = document.createElement('div');
        panelEl.id = 'nika-assistant-panel';
        panelEl.innerHTML = `
            <div id="nika-assistant-header">
                <span class="title">🤖 Asistente Nika</span>
                <button id="nika-assistant-close" aria-label="Cerrar asistente">✕</button>
            </div>
            <div id="nika-assistant-messages"></div>
            <div id="nika-assistant-inputbar">
                <input id="nika-assistant-input" type="text" placeholder="Preguntame algo..." autocomplete="off">
                <button id="nika-assistant-send">Enviar</button>
            </div>
        `;
        document.body.appendChild(panelEl);

        messagesEl = panelEl.querySelector('#nika-assistant-messages');
        inputEl = panelEl.querySelector('#nika-assistant-input');

        panelEl.querySelector('#nika-assistant-close').addEventListener('click', () => togglePanel(false));
        panelEl.querySelector('#nika-assistant-send').addEventListener('click', () => handleUserMessage(inputEl.value));
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleUserMessage(inputEl.value);
        });

        // Mensaje de bienvenida
        appendMessage('¡Hola! Soy el asistente de Campus Nika. Preguntame sobre notas, progreso, Pomodoro o material de estudio. Si tu duda es más médica o específica, te derivo a Nika IA Avanzada.', 'bot');
    }

    function init() {
        injectStyles();
        buildWidget();
    }

    document.addEventListener('DOMContentLoaded', init);

    // Exponemos las funciones por si otro módulo necesita derivar consultas
    // directamente (ej. desde un botón de "preguntarle a Nika sobre esta UP").
    return { consultarIAProfunda, callNotebookLM, callGeminiFlash };
})();
