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
                // El servidor ahora exige sesión y limita el uso: sus mensajes ya vienen listos para el alumno
                // (401 sin sesión · 429 límite por hora / mucha demanda).
                if (response.status === 401 || response.status === 429) {
                    try { const j = JSON.parse(errBody); if (j && j.mensaje) { clearTimeout(timeoutId); return j.mensaje; } } catch (_) {}
                }
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
    let badgeEl = null;
    let unread = 0;
    let bienvenidaMostrada = false;

    function injectStyles() {
        if (document.getElementById('nika-assistant-styles')) return;
        const style = document.createElement('style');
        style.id = 'nika-assistant-styles';
        style.textContent = `
            #nika-assistant-btn {
                position: fixed; bottom: 162px; right: 14px; left: auto; z-index: 9998;
                width: 66px; height: 76px; padding: 0; border: none; border-radius: 22px;
                background: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
                animation: nkaEntra .6s cubic-bezier(.3,1.5,.5,1) both;
            }
            #nika-assistant-btn .nka { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 8px 14px rgba(2,20,50,.4)); transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
            #nika-assistant-btn:hover .nka { transform: scale(1.12) rotate(-3deg); }
            #nika-assistant-btn:active .nka { transform: scale(.94); }
            #nika-assistant-btn:focus-visible { outline: 3px solid #38bdf8; outline-offset: 3px; }
            @keyframes nkaEntra { from { opacity: 0; transform: translateY(40px) scale(.6); } to { opacity: 1; transform: none; } }
            .nka-todo { animation: nkaFlota 3.6s ease-in-out infinite; transform-origin: 100px 210px; }
            .nka-sombra { animation: nkaSombra 3.6s ease-in-out infinite; transform-origin: 100px 218px; }
            .nka-ojos { transform: translate(var(--ex, 0px), var(--ey, 0px)); transition: transform .12s ease-out; }
            .nka-ojo { transform-box: fill-box; transform-origin: 50% 100%; animation: nkaParpadeo 5s infinite; }
            .nka-cruz { animation: nkaLate 1.6s ease-in-out infinite; transform-origin: 100px 190px; }
            .nka-brazo-s { transform-origin: 138px 136px; } .nka-brazo-q { transform-origin: 62px 136px; animation: nkaRespira 3.6s ease-in-out infinite; }
            #nika-assistant-btn:hover .nka-brazo-s, #nika-assistant-btn.saluda .nka-brazo-s { animation: nkaSaluda .7s ease-in-out infinite; }
            #nika-assistant-btn.has-unread .nka-todo { animation: nkaSalto .9s ease-in-out infinite; }
            #nika-assistant-btn.feliz .nka-ojo { animation: nkaFeliz .7s ease-in-out; }
            @keyframes nkaFlota { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
            @keyframes nkaSombra { 0%,100% { transform: scale(1); opacity: .35; } 50% { transform: scale(.82); opacity: .22; } }
            @keyframes nkaParpadeo { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.08); } }
            @keyframes nkaLate { 0%,100% { transform: scale(1); } 50% { transform: scale(1.14); } }
            @keyframes nkaRespira { 0%,100% { transform: rotate(0); } 50% { transform: rotate(2.5deg); } }
            @keyframes nkaSaluda { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(-135deg); } }
            @keyframes nkaSalto { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-16px); } }
            @keyframes nkaFeliz { 0%,100% { transform: scale(1); } 50% { transform: scale(1.25,.55); } }
            @media (prefers-reduced-motion: reduce) { #nika-assistant-btn, #nika-assistant-btn * { animation: none !important; } }

            /* Badge rojo de mensaje sin leer, superpuesto sobre el ícono del robot */
            #nika-assistant-badge {
                position: absolute; top: -3px; right: -3px;
                min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box;
                border-radius: 999px; background: #ef4444; color: #fff;
                font-size: 0.72rem; font-weight: 800; line-height: 18px; text-align: center;
                border: 2px solid #fff; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5);
                display: none; pointer-events: none;
                animation: nikaBadgePop 0.35s cubic-bezier(.3,1.6,.5,1);
            }
            #nika-assistant-btn.has-unread #nika-assistant-badge { display: block; }
            @keyframes nikaBadgePop { from { transform: scale(0); } to { transform: scale(1); } }

            #nika-assistant-panel {
                position: fixed; bottom: 90px; right: 20px; left: auto; z-index: 9999;
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
            .nika-msg.bot h4 { margin: 8px 0 4px; font-size: 0.88rem; font-weight: 800; color: #0284c7; }
            .nika-msg.bot h4:first-child { margin-top: 0; }
            .nika-msg.bot strong { font-weight: 800; }
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
                #nika-assistant-btn { right: 10px; bottom: 162px; }
            }
        `;
        document.head.appendChild(style);
    }

    // ---- Parseador Markdown ligero (Asistente Nika) ----
    // Gemini a veces ignora la instrucción de "texto plano" y manda
    // **negritas** / ### títulos. En vez de pelear con el prompt,
    // lo convertimos acá a HTML real antes de inyectarlo en el chat.
    // Primero escapamos HTML (para no abrir una inyección si la IA
    // repite algo que el usuario mandó) y recién después aplicamos
    // los reemplazos de Markdown -> HTML.
    function escaparHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function parsearMarkdown(texto) {
        let html = escaparHtml(texto);

        // ### Título / #### Título  ->  <h4>Título</h4>  (uno o más '#')
        html = html.replace(/^#{1,6}\s*(.+)$/gm, '<h4>$1</h4>');

        // **texto**  ->  <strong>texto</strong>
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // saltos de línea -> <br>
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    function appendMessage(text, role) {
        const msg = document.createElement('div');
        msg.className = `nika-msg ${role}`;
        // Las respuestas de la IA ('bot') se parsean para convertir el
        // Markdown residual en HTML real; lo que escribe el usuario y los
        // mensajes de estado ('pending') se muestran como texto plano.
        if (role === 'bot') {
            msg.innerHTML = parsearMarkdown(text);
        } else {
            msg.textContent = text;
        }
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        // Respuesta del bot con el chat cerrado -> badge rojo sobre el ícono
        if (role === 'bot' && bienvenidaMostrada && !isOpen) marcarNoLeido();
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

    function marcarNoLeido() {
        unread++;
        if (!btnEl || !badgeEl) return;
        badgeEl.textContent = unread > 9 ? '9+' : String(unread);
        btnEl.classList.add('has-unread');
    }

    function limpiarNoLeido() {
        unread = 0;
        if (btnEl) btnEl.classList.remove('has-unread');
    }

    function togglePanel(forceState) {
        isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
        panelEl.classList.toggle('open', isOpen);
        if (isOpen) { limpiarNoLeido(); inputEl.focus(); messagesEl.scrollTop = messagesEl.scrollHeight; }
    }

    function buildWidget() {
        // Botón flotante
        btnEl = document.createElement('button');
        btnEl.id = 'nika-assistant-btn';
        btnEl.setAttribute('aria-label', 'Abrir asistente Nika');
        btnEl.innerHTML = '<svg viewBox="0 0 200 230" class="nka" aria-hidden="true" focusable="false"><defs><linearGradient id="nkaB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef2f7"/><stop offset="1" stop-color="#cdd7e3"/></linearGradient><linearGradient id="nkaC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9c5d3"/><stop offset=".5" stop-color="#e9eef4"/><stop offset="1" stop-color="#aebbca"/></linearGradient><linearGradient id="nkaV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16395f"/><stop offset=".55" stop-color="#0c2140"/><stop offset="1" stop-color="#08162b"/></linearGradient><radialGradient id="nkaG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#22d3ee" stop-opacity=".8"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient></defs><ellipse class="nka-sombra" cx="100" cy="222" rx="36" ry="6.5" fill="#020617" opacity=".32"/><g class="nka-todo"><g class="nka-brazo-q"><path d="M62 134 C48 136 38 152 40 172 C41 183 53 185 59 176 C66 162 68 146 68 138 Z" fill="url(#nkaB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M50 150 C48 160 49 168 51 174" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"/></g><g class="nka-brazo-s"><path d="M138 134 C152 136 162 152 160 172 C159 183 147 185 141 176 C134 162 132 146 132 138 Z" fill="url(#nkaB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M150 150 C152 160 151 168 149 174" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"/></g><path d="M62 152 C62 130 80 122 100 122 C120 122 138 130 138 152 C138 184 124 208 100 208 C76 208 62 184 62 152 Z" fill="url(#nkaB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M70 170 L91 170 L95 177 L116 177 L130 170" stroke="#b6c3d1" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="82" cy="146" rx="9" ry="16" fill="#fff" opacity=".7" transform="rotate(14 82 146)"/><g class="nka-cruz" opacity=".9"><circle cx="100" cy="190" r="6.5" fill="#38bdf8"/><path d="M100 186v8M96 190h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g><rect x="22" y="64" width="19" height="40" rx="9.5" fill="url(#nkaC)" stroke="#b3c0ce" stroke-width="1.4"/><rect x="159" y="64" width="19" height="40" rx="9.5" fill="url(#nkaC)" stroke="#b3c0ce" stroke-width="1.4"/><ellipse cx="100" cy="40" rx="24" ry="7" fill="#dfe6ee" stroke="#c4d0dd" stroke-width="1.4"/><rect x="32" y="38" width="136" height="90" rx="42" fill="url(#nkaB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M48 50 C60 42 84 40 100 40" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/><rect x="45" y="52" width="110" height="64" rx="30" fill="url(#nkaV)"/><path d="M58 60 C76 54 124 54 142 60" stroke="#fff" stroke-opacity=".16" stroke-width="5" stroke-linecap="round" fill="none"/><g class="nka-cara"><g class="nka-ojos"><path class="nka-ojo" d="M66 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path class="nka-ojo" d="M106 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path d="M71 86 a9 9 0 0 1 14 -3" stroke="#bff6ff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/><path d="M111 86 a9 9 0 0 1 14 -3" stroke="#bff6ff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/></g><path class="nka-boca" d="M91 99 Q100 112 109 99 Q100 103 91 99 Z" fill="#35e0f7" stroke="#35e0f7" stroke-width="2" stroke-linejoin="round"/></g></g></svg><span id="nika-assistant-badge"></span>';
        badgeEl = btnEl.querySelector('#nika-assistant-badge');
        btnEl.addEventListener('click', () => togglePanel());
        document.body.appendChild(btnEl);
        if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            document.addEventListener('pointermove', (e) => {
                const r = btnEl.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.4);
                const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
                btnEl.style.setProperty('--ex', (dx / d * 5 * k).toFixed(1) + 'px'); btnEl.style.setProperty('--ey', (dy / d * 3.5 * k).toFixed(1) + 'px');
            }, { passive: true });
            const saludar = () => { btnEl.classList.add('saluda'); setTimeout(() => btnEl.classList.remove('saluda'), 2200); };
            setTimeout(saludar, 1200); setInterval(() => { if (!document.hidden && !isOpen) saludar(); }, 45000);
            btnEl.addEventListener('click', () => { btnEl.classList.add('feliz'); setTimeout(() => btnEl.classList.remove('feliz'), 750); });
        }

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
        bienvenidaMostrada = true;
    }

    function init() {
        injectStyles();
        buildWidget();
    }

    document.addEventListener('DOMContentLoaded', init);

    // Exponemos las funciones por si otro módulo necesita derivar consultas
    // directamente (ej. desde un botón de "preguntarle a Nika sobre esta UP").
    // notificar(): permite que otro módulo deje un mensaje del bot (con badge si el chat está cerrado)
    function notificar(texto) {
        if (!messagesEl) return;
        appendMessage(texto, 'bot');
    }

    return { consultarIAProfunda, callNotebookLM, callGeminiFlash, notificar };
})();
