// js/pomodoroBar.js
// CAMPUS NIKA — Barra superior persistente del Pomodoro (host e invitado)
//
// Muestra el estado real de PomodoroEngine en una barra fija arriba de la
// página, en CUALQUIER página que cargue este script (campus.html, examen.html,
// etc.). Como PomodoroEngine calcula el tiempo contra una hora de fin real
// (targetEnd) persistida en localStorage, esta barra sigue mostrando el tiempo
// correcto aunque se pierda la conexión, se recargue la página o se navegue
// a otra sección — nunca depende de que el socket de Supabase siga vivo.

const NikaPomoBar = (() => {
    const PARTNER_KEY = 'nika_pomo_sync_partner';
    let bar = null;
    let collapsed = false;

    function setSyncPartner(username) {
        try {
            if (username) localStorage.setItem(PARTNER_KEY, username);
            else localStorage.removeItem(PARTNER_KEY);
        } catch (_) {}
        _render();
    }
    function getSyncPartner() {
        try { return localStorage.getItem(PARTNER_KEY); } catch (_) { return null; }
    }

    // Se inyecta en runtime (no depende de que la página tenga styles.css
    // enlazado, como es el caso de examen.html) y se salta si ya existe.
    function _inyectarCss() {
        if (document.getElementById('nika-pomo-bar-css')) return;
        const style = document.createElement('style');
        style.id = 'nika-pomo-bar-css';
        style.textContent = `
            body.nika-has-pomo-bar { padding-top: 40px; }
            .nika-pomo-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 2500; background: linear-gradient(90deg, #e11d48, #fb7185); color: #fff; box-shadow: 0 4px 12px -4px rgba(225,29,72,0.5); transition: left .22s ease, right .22s ease, width .22s ease, transform .22s ease, border-radius .22s ease; }
            .nika-pomo-bar--paused { background: linear-gradient(90deg, #64748b, #94a3b8); }
            .nika-pomo-bar-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 10px; padding: 7px 16px; font-size: 0.82rem; font-weight: 800; font-family: inherit; }
            .barra-enfoque { display: flex; justify-content: center; align-items: center; width: 100%; flex: 1 1 auto; gap: 10px; min-width: 0; }
            .nika-pomo-bar-logo { font-size: 1rem; }
            .nika-pomo-bar-time { font-variant-numeric: tabular-nums; font-size: 0.92rem; }
            .nika-pomo-bar-partner { opacity: 0.92; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .nika-pomo-bar-spacer { flex: 1; }
            .nika-pomo-bar-btn { background: rgba(255,255,255,0.22); border: none; color: #fff; width: 26px; height: 26px; border-radius: 7px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; }
            .nika-pomo-bar-btn:hover { background: rgba(255,255,255,0.35); }
            @media (max-width: 640px) { .nika-pomo-bar-inner { font-size: 0.74rem; padding: 6px 10px; gap: 7px; } }

            /* ---- Modo minimizado: píldora fina centrada en el borde superior ----
               En vez de desaparecer (nika-pomo-bar--collapsed de antes), la barra
               se encoge a una píldora chica y centrada con el tiempo restante.
               Pasar el mouse por arriba (hover) la despliega de vuelta de forma
               temporal; hacerle click la despliega de forma permanente. */
            .nika-pomo-bar.is-collapsed {
                left: 50%;
                right: auto;
                width: auto;
                min-width: 0;
                transform: translateX(-50%);
                border-radius: 0 0 14px 14px;
            }
            .nika-pomo-bar.is-collapsed .nika-pomo-bar-inner { display: none; }
            .nika-pomo-bar-pill {
                display: none;
                align-items: center;
                gap: 7px;
                padding: 5px 18px;
                font-size: 0.74rem;
                font-weight: 800;
                font-family: inherit;
                white-space: nowrap;
                cursor: pointer;
                user-select: none;
            }
            .nika-pomo-bar.is-collapsed .nika-pomo-bar-pill { display: flex; }
            .nika-pomo-bar-pill-time { font-variant-numeric: tabular-nums; }

            /* Hover (o foco por teclado) sobre la píldora: se despliega a tamaño
               completo mientras el mouse siga encima, sin perder el estado
               "minimizado" (al sacar el mouse, vuelve a encogerse). */
            .nika-pomo-bar.is-collapsed:hover,
            .nika-pomo-bar.is-collapsed:focus-within {
                left: 0;
                right: 0;
                width: auto;
                transform: none;
                border-radius: 0;
            }
            .nika-pomo-bar.is-collapsed:hover .nika-pomo-bar-inner,
            .nika-pomo-bar.is-collapsed:focus-within .nika-pomo-bar-inner { display: flex; }
            .nika-pomo-bar.is-collapsed:hover .nika-pomo-bar-pill,
            .nika-pomo-bar.is-collapsed:focus-within .nika-pomo-bar-pill { display: none; }
        `;
        document.head.appendChild(style);
    }

    function _crear() {
        _inyectarCss();
        bar = document.createElement('div');
        bar.className = 'nika-pomo-bar';
        bar.innerHTML = `
            <div class="nika-pomo-bar-inner">
                <div class="barra-enfoque">
                    <span class="nika-pomo-bar-logo">🍅</span>
                    <span class="nika-pomo-bar-phase" id="nika-pomo-bar-phase">Enfoque</span>
                    <span class="nika-pomo-bar-time" id="nika-pomo-bar-time">25:00</span>
                    <span class="nika-pomo-bar-partner" id="nika-pomo-bar-partner"></span>
                </div>
                <button type="button" class="nika-pomo-bar-btn" id="nika-pomo-bar-toggle" title="Pausar / reanudar">⏸️</button>
                <button type="button" class="nika-pomo-bar-btn" id="nika-pomo-bar-min" title="Minimizar">—</button>
            </div>
            <button type="button" class="nika-pomo-bar-pill" id="nika-pomo-bar-pill" title="Click para volver a mostrar la barra completa">
                <span id="nika-pomo-bar-pill-icon">⏱️</span>
                <span id="nika-pomo-bar-pill-label">Enfoque activo</span>
                <span class="nika-pomo-bar-pill-time" id="nika-pomo-bar-pill-time">25:00</span>
            </button>
        `;
        document.body.prepend(bar);

        document.getElementById('nika-pomo-bar-toggle').addEventListener('click', () => {
            if (!window.PomodoroEngine) return;
            const st = window.PomodoroEngine.getState();
            if (st.status === 'running') window.PomodoroEngine.pause();
            else window.PomodoroEngine.start();
        });
        // Minimizar: en vez de ocultar la barra sin dejar forma de volver a
        // abrirla, la encoge a la píldora central (.is-collapsed).
        document.getElementById('nika-pomo-bar-min').addEventListener('click', () => {
            _setCollapsed(true);
        });
        // Click en la píldora: despliega la barra de forma permanente (hasta
        // que se vuelva a minimizar). El hover/focus (CSS puro, arriba) ya
        // la despliega de forma temporal sin tocar este estado.
        document.getElementById('nika-pomo-bar-pill').addEventListener('click', () => {
            _setCollapsed(false);
        });

        // Si la barra se había minimizado y luego se recreó (ej. arrancó un
        // Pomodoro nuevo después de que el anterior terminó), respeta el
        // último estado elegido en vez de volver a abrirse sola.
        bar.classList.toggle('is-collapsed', collapsed);
    }

    function _setCollapsed(valor) {
        collapsed = valor;
        if (bar) bar.classList.toggle('is-collapsed', collapsed);
    }

    function _render() {
        if (!window.PomodoroEngine) return;
        const st = window.PomodoroEngine.getState();

        if (st.status === 'idle') {
            if (bar) { bar.remove(); bar = null; document.body.classList.remove('nika-has-pomo-bar'); }
            return;
        }
        if (!bar) _crear();

        const esDescanso = st.mode === 'break';
        const tiempoFormateado = window.PomodoroEngine.formatTime(st.remainingSeconds);

        document.getElementById('nika-pomo-bar-phase').textContent = esDescanso ? '☕ Descanso' : '📚 Enfoque';
        document.getElementById('nika-pomo-bar-time').textContent = tiempoFormateado;
        const partner = getSyncPartner();
        const partnerEl = document.getElementById('nika-pomo-bar-partner');
        partnerEl.textContent = partner ? `· Sincronizado con @${partner}` : (st.upLabel ? `· ${st.upLabel}` : '');
        document.getElementById('nika-pomo-bar-toggle').textContent = st.status === 'running' ? '⏸️' : '▶️';
        bar.classList.toggle('nika-pomo-bar--paused', st.status !== 'running');
        document.body.classList.add('nika-has-pomo-bar');

        // Píldora minimizada: mismo dato que la barra completa, en formato corto
        // ("⏱️ Enfoque activo: mm:ss" / "☕ Descanso: mm:ss"), para que se pueda
        // seguir el tiempo sin necesidad de desplegar la barra.
        const pillIcon = document.getElementById('nika-pomo-bar-pill-icon');
        const pillLabel = document.getElementById('nika-pomo-bar-pill-label');
        const pillTime = document.getElementById('nika-pomo-bar-pill-time');
        if (pillIcon) pillIcon.textContent = esDescanso ? '☕' : '⏱️';
        if (pillLabel) pillLabel.textContent = st.status === 'running'
            ? (esDescanso ? 'Descanso activo' : 'Enfoque activo')
            : (esDescanso ? 'Descanso en pausa' : 'Enfoque en pausa');
        if (pillTime) pillTime.textContent = tiempoFormateado;
    }

    function _init() {
        if (!window.PomodoroEngine) { setTimeout(_init, 300); return; }
        _render();
        window.PomodoroEngine.on('tick', _render);
        window.PomodoroEngine.on('change', _render);
        window.PomodoroEngine.on('complete', () => { setSyncPartner(null); _render(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();

    return { setSyncPartner, getSyncPartner };
})();

window.NikaPomoBar = NikaPomoBar;
