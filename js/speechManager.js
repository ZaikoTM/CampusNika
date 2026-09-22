/**
 * Campus Nika — Speech Manager (Sprint 2 · Inmersión)
 * ----------------------------------------------------------------------------
 * Módulo standalone y reutilizable para dictado por voz en cualquier <textarea>
 * de los simuladores (Shock Room, Pase de Sala, Consultorio, Escrito, etc.).
 *
 * Uso básico:
 *   <textarea id="mi-textarea"></textarea>
 *   <div id="mic-slot"></div>
 *   <script src="js/speechManager.js"></script>
 *   <script>
 *     const mic = SpeechManager.attach({
 *       textareaId: 'mi-textarea',
 *       mountId: 'mic-slot',      // dónde inyectar el botón
 *       lang: 'es-AR',
 *       onFinal: (textoCompleto) => console.log('Transcripción final:', textoCompleto),
 *     });
 *     // mic.start() / mic.stop() / mic.toggle() / mic.destroy()
 *   </script>
 *
 * No depende de ningún CSS externo: inyecta sus propios estilos una sola vez
 * (prefijo `nika-speech-*`) para no chocar con la estética de cada pantalla.
 * Si el navegador no soporta Web Speech API, `attach()` devuelve null y no
 * monta nada (el textarea sigue funcionando a mano con normalidad).
 */
(function (global) {
    'use strict';

    const SR = global.SpeechRecognition || global.webkitSpeechRecognition;

    function soportado() {
        return !!SR;
    }

    // -------------------------------------------------------------------
    // Estilos: se inyectan una sola vez, sin importar cuántos botones se
    // monten en la página (Shock Room puede tener uno por turno).
    // -------------------------------------------------------------------
    let estilosInyectados = false;
    function inyectarEstilos() {
        if (estilosInyectados) return;
        estilosInyectados = true;
        const css = `
            .nika-speech-wrap { display: inline-flex; align-items: center; gap: 10px; }
            .nika-speech-btn {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 46px;
                height: 46px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                color: #fff;
                box-shadow: 0 4px 14px -2px rgba(2, 132, 199, 0.5);
                transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
                flex-shrink: 0;
            }
            .nika-speech-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 18px -2px rgba(2, 132, 199, 0.6); }
            .nika-speech-btn:active { transform: scale(0.96); }
            .nika-speech-btn svg { width: 20px; height: 20px; }
            .nika-speech-btn.is-recording {
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55);
                animation: nikaSpeechPulseBtn 1.4s ease-out infinite;
            }
            .nika-speech-btn.is-disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(0.6); animation: none; }
            .nika-speech-btn.is-disabled:hover { transform: none; box-shadow: 0 4px 14px -2px rgba(2, 132, 199, 0.5); }
            @keyframes nikaSpeechPulseBtn {
                0%   { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55); }
                70%  { box-shadow: 0 0 0 14px rgba(220, 38, 38, 0); }
                100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
            }
            .nika-speech-bars { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; pointer-events: none; }
            .nika-speech-btn.is-recording .nika-speech-bars span {
                display: block; width: 3px; height: 6px; border-radius: 2px; background: rgba(255,255,255,0.9);
                animation: nikaSpeechBar 0.9s ease-in-out infinite;
            }
            .nika-speech-btn.is-recording .nika-speech-bars span:nth-child(1) { animation-delay: 0s; }
            .nika-speech-btn.is-recording .nika-speech-bars span:nth-child(2) { animation-delay: 0.15s; }
            .nika-speech-btn.is-recording .nika-speech-bars span:nth-child(3) { animation-delay: 0.3s; }
            .nika-speech-btn:not(.is-recording) .nika-speech-bars { display: none; }
            @keyframes nikaSpeechBar { 0%, 100% { height: 6px; } 50% { height: 16px; } }
            .nika-speech-status { font-size: 0.78rem; font-weight: 700; color: var(--text-muted, #64748b); }
            .nika-speech-status.is-recording { color: #dc2626; }
        `;
        const style = document.createElement('style');
        style.setAttribute('data-nika', 'speech-manager');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function iconoMic() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>`;
    }

    /**
     * Monta un botón de micrófono junto a un textarea y devuelve un controlador.
     * @param {object} cfg
     * @param {string} cfg.textareaId - id del <textarea> destino
     * @param {string} [cfg.mountId] - id de un contenedor vacío donde insertar el botón.
     *        Si se omite, el botón se inserta justo después del textarea.
     * @param {string} [cfg.lang='es-AR']
     * @param {boolean} [cfg.showStatus=true] - muestra un texto "Escuchando…" al lado del botón
     * @param {function} [cfg.onStart]
     * @param {function} [cfg.onStop]
     * @param {function} [cfg.onInterim] - (textoParcial) => void, en cada resultado provisorio
     * @param {function} [cfg.onFinal] - (textoAcumuladoFinal) => void, cuando se agrega texto definitivo
     * @param {function} [cfg.onError] - (error) => void
     * @returns {null|{start:Function, stop:Function, toggle:Function, destroy:Function, disable:Function, enable:Function}}
     */
    function attach(cfg) {
        if (!soportado()) {
            console.warn('[SpeechManager] Web Speech API no soportada en este navegador.');
            return null;
        }
        const ta = document.getElementById(cfg.textareaId);
        if (!ta) {
            console.warn('[SpeechManager] No se encontró el textarea #' + cfg.textareaId);
            return null;
        }
        inyectarEstilos();

        const lang = cfg.lang || 'es-AR';
        const showStatus = cfg.showStatus !== false;

        const wrap = document.createElement('div');
        wrap.className = 'nika-speech-wrap';
        wrap.innerHTML = `
            <button type="button" class="nika-speech-btn" title="Dictar por voz" aria-label="Dictar por voz">
                ${iconoMic()}
                <span class="nika-speech-bars"><span></span><span></span><span></span></span>
            </button>
            ${showStatus ? '<span class="nika-speech-status">Micrófono listo</span>' : ''}
        `;

        const mount = cfg.mountId ? document.getElementById(cfg.mountId) : null;
        if (mount) mount.appendChild(wrap);
        else ta.insertAdjacentElement('afterend', wrap);

        const btn = wrap.querySelector('.nika-speech-btn');
        const status = wrap.querySelector('.nika-speech-status');

        let rec = null;
        let activo = false;
        let deshabilitado = false;
        let base = '';
        let acumulado = '';

        function setStatus(texto, recording) {
            if (!status) return;
            status.textContent = texto;
            status.classList.toggle('is-recording', !!recording);
        }

        function pintar(interino) {
            const sep = base && !/\s$/.test(base) ? ' ' : '';
            const valor = (base + sep + acumulado + (interino ? ' ' + interino : ''));
            ta.value = cfg.maxChars ? valor.slice(0, cfg.maxChars) : valor;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            if (interino && typeof cfg.onInterim === 'function') cfg.onInterim(interino);
        }

        function start() {
            if (deshabilitado || activo) return;
            base = ta.value; acumulado = '';
            rec = new SR();
            rec.lang = lang;
            rec.continuous = true;
            rec.interimResults = true;

            rec.onresult = (e) => {
                let interino = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    const txt = e.results[i][0].transcript;
                    if (e.results[i].isFinal) acumulado += (acumulado ? ' ' : '') + txt.trim();
                    else interino += txt;
                }
                pintar(interino);
                if (typeof cfg.onFinal === 'function' && acumulado) cfg.onFinal((base + (base ? ' ' : '') + acumulado).trim());
            };
            rec.onerror = (e) => {
                console.warn('[SpeechManager] error de reconocimiento:', e.error);
                if (typeof cfg.onError === 'function') cfg.onError(e);
                if (e.error === 'not-allowed' || e.error === 'service-not-allowed') stop();
            };
            rec.onend = () => {
                // Si el usuario no lo detuvo manualmente, Chrome puede cortar solo: reintentar.
                if (activo && !deshabilitado) { try { rec.start(); } catch (_) { /* ya arrancado */ } }
            };

            try {
                rec.start();
                activo = true;
                btn.classList.add('is-recording');
                setStatus('Escuchando…', true);
                if (typeof cfg.onStart === 'function') cfg.onStart();
            } catch (err) {
                console.warn('[SpeechManager] no se pudo iniciar el reconocimiento:', err);
            }
        }

        function stop() {
            if (!activo) return;
            activo = false;
            try { rec && rec.stop(); } catch (_) { /* noop */ }
            btn.classList.remove('is-recording');
            setStatus('Micrófono listo', false);
            if (typeof cfg.onStop === 'function') cfg.onStop();
        }

        function toggle() { activo ? stop() : start(); }

        function disable(motivo) {
            deshabilitado = true;
            stop();
            btn.classList.add('is-disabled');
            btn.disabled = true;
            setStatus(motivo || 'Micrófono deshabilitado', false);
        }

        function enable() {
            deshabilitado = false;
            btn.classList.remove('is-disabled');
            btn.disabled = false;
            setStatus('Micrófono listo', false);
        }

        function destroy() {
            stop();
            wrap.remove();
        }

        btn.addEventListener('click', toggle);

        return { start, stop, toggle, disable, enable, destroy };
    }

    global.SpeechManager = { attach, soportado };
})(typeof window !== 'undefined' ? window : this);
