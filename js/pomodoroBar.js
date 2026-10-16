// js/pomodoroBar.js
// CAMPUS NIKA — Barra superior persistente del Pomodoro (host e invitado)
//
// Muestra el estado real de PomodoroEngine en una barra fija arriba de la
// página, en CUALQUIER página que cargue este script (campus.html, examen.html,
// etc.). Como PomodoroEngine calcula el tiempo contra una hora de fin real
// (targetEnd) persistida en localStorage, esta barra sigue mostrando el tiempo
// correcto aunque se pierda la conexión, se recargue la página o se navegue
// a otra sección — nunca depende de que el socket de Supabase siga vivo.
//
// Sesión compartida: muestra "Estudiando: <Unidad/Tema> con @usuario", el rol
// (🧉 Host / 🔒 Invitado), los compañeros como avatares con su estado y el estado
// de la conexión. El Invitado no puede pausar/reanudar: solo el Host.
// Salir de la sala: botón con texto y confirmación (el tiempo estudiado se guarda).

const NikaPomoBar = (() => {
    const PARTNER_KEY = 'nika_pomo_sync_partner';
    let bar = null;
    // Por defecto la barra va MINIMIZADA (píldora): se despliega al pasar el mouse (modo automático) o queda abierta si la fijás (modo manual).
    const PIN_KEY = 'nika_pomo_bar_fija';
    let collapsed = (() => { try { return localStorage.getItem(PIN_KEY) !== '1'; } catch (_) { return true; } })();
    let ultimaFase = null;

    // (Legado) El compañero ahora vive en el estado del motor (PomodoroEngine.getState().shared).
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

    const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const COLORES = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c'];
    const colorDe = (n) => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORES[h % COLORES.length]; };
    const prefiereMenosMovimiento = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Se inyecta en runtime (no depende de que la página tenga styles.css
    // enlazado, como es el caso de examen.html) y se salta si ya existe.
    function _inyectarCss() {
        if (document.getElementById('nika-pomo-bar-css')) return;
        const style = document.createElement('style');
        style.id = 'nika-pomo-bar-css';
        style.textContent = `
            body.nika-has-pomo-bar { padding-top: 50px; }
            .nika-pomo-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 2500; color: #fff; font-family: inherit;
                background: linear-gradient(100deg, #e11d48, #ec4899 38%, #a855f7 72%, #6366f1); background-size: 220% 100%; animation: npbFluye 14s ease-in-out infinite alternate;
                box-shadow: 0 8px 22px -10px rgba(168, 85, 247, .75), 0 2px 0 rgba(255,255,255,.18) inset;
                transition: left .26s cubic-bezier(.22,1,.36,1), right .26s cubic-bezier(.22,1,.36,1), width .26s, transform .26s cubic-bezier(.22,1,.36,1), border-radius .26s, filter .3s; animation-fill-mode: both; }
            .nika-pomo-bar::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,.22) 50%, transparent 65%); transform: translateX(-120%); animation: npbBrillo 7s ease-in-out infinite; }
            @keyframes npbFluye { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
            @keyframes npbBrillo { 0%, 60% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
            .nika-pomo-bar--paused { background: linear-gradient(100deg, #475569, #64748b 55%, #7c8aa5); background-size: 100% 100%; animation: none; box-shadow: 0 6px 16px -10px rgba(71,85,105,.8); }
            .nika-pomo-bar--paused::after { display: none; }
            .nika-pomo-bar--break:not(.nika-pomo-bar--paused) { background: linear-gradient(100deg, #0ea5e9, #14b8a6 50%, #22c55e); background-size: 220% 100%; }
            .nika-pomo-bar-inner { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; box-sizing: border-box; padding-left: calc(var(--nika-sb-w, 0px) + 14px) !important; display: flex; align-items: center; gap: 10px; padding: 6px 14px; font-size: .82rem; font-weight: 800; }
            .barra-enfoque { display: flex; align-items: center; flex: 1 1 auto; gap: 10px; min-width: 0; }
            /* anillo de progreso */
            .nika-pomo-ring { --p: 0; position: relative; flex: 0 0 38px; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
                background: conic-gradient(#fff calc(var(--p) * 1%), rgba(255,255,255,.28) 0); transition: background .4s; }
            .nika-pomo-ring::before { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: rgba(40, 10, 70, .55); backdrop-filter: blur(4px); }
            .nika-pomo-ring span { position: relative; font-size: 1.05rem; }
            .nika-pomo-bar.is-running .nika-pomo-ring span { animation: npbLatido 1.8s ease-in-out infinite; }
            @keyframes npbLatido { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
            .nika-pomo-bar-time { font-variant-numeric: tabular-nums; font-size: 1.22rem; font-weight: 900; letter-spacing: .02em; text-shadow: 0 2px 8px rgba(0,0,0,.28); min-width: 3.4em; }
            .nika-pomo-bar-phase { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.35); border-radius: 999px; padding: 3px 11px 3px 9px; font-size: .74rem; white-space: nowrap; backdrop-filter: blur(6px); }
            .nika-pomo-bar-phase i { width: 8px; height: 8px; border-radius: 50%; background: #fde68a; box-shadow: 0 0 0 0 rgba(253,230,138,.8); }
            .nika-pomo-bar.is-running .nika-pomo-bar-phase i { animation: npbPulso 1.6s ease-out infinite; }
            @keyframes npbPulso { 0% { box-shadow: 0 0 0 0 rgba(253,230,138,.85); } 100% { box-shadow: 0 0 0 9px rgba(253,230,138,0); } }
            .nika-pomo-bar-role { background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.35); border-radius: 999px; padding: 3px 10px; font-size: .7rem; white-space: nowrap; flex-shrink: 0; }
            .nika-pomo-bar-partner { opacity: .96; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
            /* compañeros */
            .nika-pomo-team { display: flex; align-items: center; flex-shrink: 0; }
            .nika-pomo-av { position: relative; width: 28px; height: 28px; border-radius: 50%; margin-left: -8px; border: 2px solid rgba(255,255,255,.9); display: grid; place-items: center; font-size: .66rem; font-weight: 900; color: #fff; text-transform: uppercase;
                box-shadow: 0 3px 8px -3px rgba(0,0,0,.45); transition: transform .2s cubic-bezier(.34,1.56,.64,1); animation: npbAv .45s cubic-bezier(.34,1.56,.64,1) both; }
            .nika-pomo-av:first-child { margin-left: 0; } .nika-pomo-av:hover { transform: translateY(-3px) scale(1.12); z-index: 2; }
            .nika-pomo-av.off { filter: grayscale(1); opacity: .65; }
            .nika-pomo-av::after { content: ''; position: absolute; right: -2px; bottom: -2px; width: 9px; height: 9px; border-radius: 50%; background: #22c55e; border: 2px solid #fff; }
            .nika-pomo-av.off::after { background: #f59e0b; }
            .nika-pomo-av.mas { background: rgba(255,255,255,.25); } .nika-pomo-av.mas::after { display: none; }
            @keyframes npbAv { from { opacity: 0; transform: scale(.3) rotate(-20deg); } }
            /* conexión */
            button.nika-pomo-conn { border: 0; font-family: inherit; color: inherit; cursor: default; }
            .nika-pomo-conn.rec, .nika-pomo-conn.sin { cursor: pointer; transition: transform .15s, background .15s; }
            .nika-pomo-conn.rec:hover, .nika-pomo-conn.sin:hover { transform: translateY(-1px); background: rgba(255,255,255,.28); }
            .nika-pomo-conn.cargando i { animation: npbParpadeo .6s linear infinite; }
            .nika-pomo-conn { display: inline-flex; align-items: center; gap: 5px; font-size: .68rem; font-weight: 800; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,.2); white-space: nowrap; flex-shrink: 0; }
            .nika-pomo-conn i { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; }
            .nika-pomo-conn.rec { background: rgba(251,191,36,.28); } .nika-pomo-conn.rec i { background: #fbbf24; animation: npbParpadeo 1s ease-in-out infinite; }
            .nika-pomo-conn.sin { background: rgba(248,113,113,.3); } .nika-pomo-conn.sin i { background: #f87171; }
            @keyframes npbParpadeo { 50% { opacity: .25; } }
            /* botones */
            .nika-pomo-bar-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; min-width: 32px; padding: 0 9px; border: 1px solid rgba(255,255,255,.35); border-radius: 11px;
                background: rgba(255,255,255,.2); color: #fff; font: inherit; font-size: .74rem; font-weight: 800; cursor: pointer; backdrop-filter: blur(6px); overflow: hidden;
                transition: transform .18s cubic-bezier(.34,1.56,.64,1), background .18s, box-shadow .18s; }
            .nika-pomo-bar-btn:hover { background: rgba(255,255,255,.34); transform: translateY(-2px); box-shadow: 0 8px 16px -8px rgba(0,0,0,.5); }
            .nika-pomo-bar-btn:active { transform: scale(.92); }
            .nika-pomo-bar-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
            .nika-pomo-bar-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
            .nika-pomo-bar-btn.main { width: 36px; height: 36px; border-radius: 50%; padding: 0; background: #fff; color: #be185d; font-size: .95rem; border: 0; box-shadow: 0 6px 14px -6px rgba(0,0,0,.55); }
            .nika-pomo-bar-btn.main:hover { background: #fff; transform: scale(1.1); }
            .nika-pomo-bar-btn .lbl { white-space: nowrap; font-size: .72rem; font-weight: 800; line-height: 1; }
            .nika-pomo-bar-btn.leave, .nika-pomo-bar-btn.cancel { height: 30px; padding: 0 11px; border-radius: 999px; background: rgba(0,0,0,.26); border-color: rgba(255,255,255,.45); }
            .nika-pomo-bar-btn.leave:hover { background: #ef4444; border-color: #ef4444; }
            .nika-pomo-bar-btn.cancel:hover { background: #f59e0b; border-color: #f59e0b; color: #1c1917; }
            /* confirmación de salida */
            .nika-pomo-leave { display: none; position: absolute; top: calc(100% + 8px); right: 12px; width: min(320px, calc(100vw - 24px)); background: var(--card-bg, #fff); color: var(--text-main, #0f172a); border: 1px solid var(--border, #e2e8f0); border-radius: 16px; padding: 14px; box-shadow: 0 24px 50px -14px rgba(0,0,0,.55); z-index: 2600; font-weight: 700; }
            .nika-pomo-leave.is-open { display: block; animation: nikaCfgIn .2s cubic-bezier(.22,1,.36,1); }
            .nika-pomo-leave h4 { margin: 0 0 4px; font-size: .92rem; } .nika-pomo-leave p { margin: 0 0 12px; font-size: .78rem; font-weight: 600; color: var(--text-muted, #64748b); line-height: 1.4; }
            .nika-pomo-leave .fila { display: flex; gap: 8px; } .nika-pomo-leave button { flex: 1; border: 0; border-radius: 11px; padding: 9px; font: inherit; font-weight: 800; font-size: .8rem; cursor: pointer; transition: transform .15s, box-shadow .15s; }
            .nika-pomo-leave button:hover { transform: translateY(-1px); } .nika-pomo-leave .si { background: linear-gradient(135deg, #ef4444, #be123c); color: #fff; } .nika-pomo-leave .no { background: var(--bg-body, #f1f5f9); color: inherit; border: 1px solid var(--border, #cbd5e1); }
            .nika-pomo-cfg { display: none; position: absolute; top: calc(100% + 8px); right: 12px; width: min(300px, calc(100vw - 24px)); background: var(--card-bg, #fff); color: var(--text-main, #0f172a); border: 1px solid var(--border, #e2e8f0); border-radius: 14px; box-shadow: 0 20px 44px -12px rgba(0,0,0,.45); padding: 14px; font-weight: 700; z-index: 2600; }
            .nika-pomo-cfg.is-open { display: block; animation: nikaCfgIn .18s ease; }
            @keyframes nikaCfgIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
            .nika-pomo-cfg h4 { font-size: .86rem; font-weight: 800; margin: 0 0 10px; }
            .nika-pomo-cfg label { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: .8rem; margin-bottom: 8px; }
            .nika-pomo-cfg input, .nika-pomo-cfg select { background: var(--bg-body, #f1f5f9); color: inherit; border: 1px solid var(--border, #cbd5e1); border-radius: 8px; padding: 6px 8px; font: inherit; font-size: .8rem; }
            .nika-pomo-cfg input[type=number] { width: 70px; text-align: center; }
            .nika-pomo-cfg select { max-width: 170px; }
            .nika-pomo-cfg-ok { width: 100%; margin-top: 4px; background: linear-gradient(90deg, #e11d48, #a855f7); color: #fff; border: 0; border-radius: 10px; padding: 9px; font: inherit; font-size: .8rem; font-weight: 800; cursor: pointer; }
            .nika-pomo-cfg-nota { font-size: .68rem; font-weight: 600; color: var(--text-muted, #64748b); margin: 8px 0 0; }
            @media (max-width: 760px) {
                .nika-pomo-bar-inner { font-size: .74rem; padding: 5px 9px; gap: 6px; }
                .nika-pomo-bar-partner, .nika-pomo-bar-role .txt, .nika-pomo-bar-btn .lbl, .nika-pomo-conn .lbl { display: none; }
                .nika-pomo-bar-btn.leave, .nika-pomo-bar-btn.cancel { width: 32px; padding: 0; }
                .nika-pomo-bar-time { font-size: 1.05rem; }
                .nika-pomo-ring { flex-basis: 34px; width: 34px; height: 34px; }
                .nika-pomo-bar-phase { padding: 3px 8px; }
            }

            /* ---- Modo minimizado: píldora centrada en el borde superior (hover/foco la despliega) ---- */
            .nika-pomo-bar.is-collapsed { left: calc(var(--nika-sb-w, 0px) + (100% - var(--nika-sb-w, 0px)) / 2); right: auto; width: auto; min-width: 0; transform: translateX(-50%); border-radius: 0 0 18px 18px; }
            .nika-pomo-bar.is-collapsed .nika-pomo-bar-inner { display: none; }
            .nika-pomo-bar-pill { display: none; align-items: center; gap: 8px; padding: 5px 16px 5px 8px; font-size: .74rem; font-weight: 800; font-family: inherit; white-space: nowrap; cursor: pointer; user-select: none; position: relative; z-index: 1; background: none; border: 0; color: #fff; }
            .nika-pomo-bar-pill .mini { --p: 0; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#fff calc(var(--p) * 1%), rgba(255,255,255,.3) 0); font-size: .7rem; position: relative; }
            .nika-pomo-bar-pill .mini::before { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: rgba(40, 10, 70, .55); } .nika-pomo-bar-pill .mini b { position: relative; font-weight: 400; }
            .nika-pomo-bar.is-collapsed .nika-pomo-bar-pill { display: flex; }
            .nika-pomo-bar-pill-time { font-variant-numeric: tabular-nums; font-size: .9rem; }
            .nika-pomo-bar.is-collapsed:hover, .nika-pomo-bar.is-collapsed:focus-within { left: 0; right: 0; width: auto; transform: none; border-radius: 0; }
            .nika-pomo-bar.is-collapsed:hover .nika-pomo-bar-inner, .nika-pomo-bar.is-collapsed:focus-within .nika-pomo-bar-inner { display: flex; }
            .nika-pomo-bar.is-collapsed:hover .nika-pomo-bar-pill, .nika-pomo-bar.is-collapsed:focus-within .nika-pomo-bar-pill { display: none; }
            /* Fijar (📌) solo se ofrece cuando está abierta por hover; Minimizar (—) solo cuando está fijada */
            .nika-pomo-bar:not(.is-collapsed) #nika-pomo-bar-pin { display: none; }
            .nika-pomo-bar.is-collapsed #nika-pomo-bar-min { display: none; }
            @media (prefers-reduced-motion: reduce) { .nika-pomo-bar, .nika-pomo-bar::after, .nika-pomo-bar *, .nika-pomo-av { animation: none !important; transition: none !important; } }
        `;
        document.head.appendChild(style);
    }

    // Ancho de la barra lateral visible (escritorio): la barra de enfoque se centra en el área que queda a su derecha.
    function _medirLateral() {
        let w = 0;
        try {
            if (window.innerWidth > 900) {
                for (const id of ['appSidebar', 'ns-side']) {
                    const el = document.getElementById(id); if (!el) continue;
                    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
                    const r = el.getBoundingClientRect();
                    if (r.width > 100 && r.left > -4 && r.left < 20 && r.right > 80) { w = Math.round(r.right); break; }
                }
            }
        } catch (_) {}
        document.documentElement.style.setProperty('--nika-sb-w', w + 'px');
    }
    let _lateralObs = false;
    function _vigilarLateral() {
        if (_lateralObs) return; _lateralObs = true;
        const medir = () => _medirLateral();
        window.addEventListener('resize', medir);
        // la barra lateral se abre y se cierra con animación: se vuelve a medir durante la transición
        document.addEventListener('click', () => { const t0 = Date.now(); (function paso() { medir(); if (Date.now() - t0 < 700) requestAnimationFrame(paso); })(); }, true);
        ['appSidebar', 'ns-side'].forEach((id) => {
            const el = document.getElementById(id); if (!el) return;
            try { new MutationObserver(medir).observe(el, { attributes: true, attributeFilter: ['class', 'style'] }); } catch (_) {}
            el.addEventListener('transitionend', medir);
        });
        try { document.body && new MutationObserver(medir).observe(document.body, { attributes: true, attributeFilter: ['class'] }); } catch (_) {}
        medir();
    }

    function _crear() {
        _inyectarCss();
        _vigilarLateral();
        bar = document.createElement('div');
        bar.className = 'nika-pomo-bar';
        bar.innerHTML = `
            <div class="nika-pomo-bar-inner">
                <div class="barra-enfoque">
                    <div class="nika-pomo-ring" id="nika-pomo-ring" aria-hidden="true"><span id="nika-pomo-bar-logo">🍅</span></div>
                    <span class="nika-pomo-bar-time" id="nika-pomo-bar-time">25:00</span>
                    <span class="nika-pomo-bar-phase"><i></i><span id="nika-pomo-bar-phase">Enfoque</span></span>
                    <span class="nika-pomo-bar-role" id="nika-pomo-bar-role" style="display:none;"></span>
                    <span class="nika-pomo-team" id="nika-pomo-team"></span>
                    <span class="nika-pomo-bar-partner" id="nika-pomo-bar-partner"></span>
                </div>
                <button type="button" class="nika-pomo-conn" id="nika-pomo-conn" style="display:none;"><i></i><span class="lbl" id="nika-pomo-conn-t">Conectado</span></button>
                <button type="button" class="nika-pomo-bar-btn main" id="nika-pomo-bar-toggle" title="Pausar / reanudar" aria-label="Pausar o reanudar">⏸️</button>
                <button type="button" class="nika-pomo-bar-btn" id="nika-pomo-bar-room" title="Abrir la sala de estudio" style="display:none;">🍅<span class="lbl">Sala</span></button>
                <button type="button" class="nika-pomo-bar-btn cancel" id="nika-pomo-bar-cancel" title="Cancelar este Pomodoro" aria-label="Cancelar el Pomodoro" style="display:none;"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3"/></svg><span class="lbl">Cancelar</span></button>
                <button type="button" class="nika-pomo-bar-btn leave" id="nika-pomo-bar-leave" title="Salir de la sala compartida" aria-label="Salir de la sala compartida" style="display:none;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span class="lbl">Salir</span></button>
                <button type="button" class="nika-pomo-bar-btn" id="nika-pomo-bar-cfg" title="Configurar tiempos" aria-label="Configurar tiempos">⚙️</button>
                <button type="button" class="nika-pomo-bar-btn" id="nika-pomo-bar-pin" title="Fijar abierta (modo manual)" aria-label="Fijar la barra abierta">📌</button>
                <button type="button" class="nika-pomo-bar-btn" id="nika-pomo-bar-min" title="Minimizar (modo automático)" aria-label="Minimizar">—</button>
            </div>
            <div class="nika-pomo-leave" id="nika-pomo-leave" role="dialog" aria-label="Salir de la sala compartida">
                <h4>🚪 ¿Salir de la sala compartida?</h4>
                <p id="nika-pomo-leave-txt">Tu tiempo estudiado se guarda. Podés volver cuando te inviten de nuevo.</p>
                <div class="fila"><button type="button" class="no" id="nika-pomo-leave-no">Seguir estudiando</button><button type="button" class="si" id="nika-pomo-leave-si">Sí, salir</button></div>
            </div>
            <div class="nika-pomo-leave" id="nika-pomo-cancel" role="dialog" aria-label="Cancelar el Pomodoro">
                <h4>⏹ ¿Cancelar este Pomodoro?</h4>
                <p id="nika-pomo-cancel-txt">El reloj vuelve a cero. Si ya estudiaste unos minutos, se guardan en tu historial.</p>
                <div class="fila"><button type="button" class="no" id="nika-pomo-cancel-no">Seguir estudiando</button><button type="button" class="si" id="nika-pomo-cancel-si">Sí, cancelar</button></div>
            </div>
            <div class="nika-pomo-cfg" id="nika-pomo-cfg" role="dialog" aria-label="Configurar Pomodoro">
                <h4>⚙️ Configurar Pomodoro</h4>
                <label>Estudio (min) <input type="number" id="nika-cfg-work" min="1" max="120"></label>
                <label>Descanso (min) <input type="number" id="nika-cfg-break" min="1" max="60"></label>
                <label id="nika-cfg-up-row">Unidad <select id="nika-cfg-up"></select></label>
                <button type="button" class="nika-pomo-cfg-ok" id="nika-cfg-save">Guardar y reiniciar</button>
                <p class="nika-pomo-cfg-nota">Al guardar, el reloj se reinicia con los nuevos tiempos.</p>
            </div>
            <button type="button" class="nika-pomo-bar-pill" id="nika-pomo-bar-pill" title="Click para volver a mostrar la barra completa">
                <span class="mini" id="nika-pomo-mini"><b id="nika-pomo-bar-pill-icon">⏱️</b></span>
                <span id="nika-pomo-bar-pill-label">Enfoque activo</span>
                <span class="nika-pomo-bar-pill-time" id="nika-pomo-bar-pill-time">25:00</span>
            </button>
        `;
        document.body.prepend(bar);

        document.getElementById('nika-pomo-bar-cfg').addEventListener('click', _toggleCfg);
        document.getElementById('nika-pomo-conn').addEventListener('click', async (e) => {
            const chip = e.currentTarget, m = window.PomodoroSyncManager;
            if (!m || typeof m.reconectar !== 'function' || !chip.classList.contains('sin') && !chip.classList.contains('rec')) return;
            chip.classList.add('cargando');
            document.getElementById('nika-pomo-conn-t').textContent = 'Conectando…';
            try { await m.reconectar(); } catch (_) {}
            setTimeout(() => { chip.classList.remove('cargando'); _render(); }, 1800);
            if (typeof window.showToast === 'function') { try { window.showToast('🔄 Reconectando la sala…'); } catch (_) {} }
        });
        document.getElementById('nika-pomo-bar-room').addEventListener('click', () => { if (window.abrirSalaEstudio) window.abrirSalaEstudio(); });
        document.getElementById('nika-cfg-save').addEventListener('click', _guardarCfg);

        // Salir de la sala: botón con texto + confirmación (evita salidas por un toque accidental y deja claro que el tiempo se guarda)
        const panelSalir = document.getElementById('nika-pomo-leave');
        document.getElementById('nika-pomo-bar-leave').addEventListener('click', (e) => {
            e.stopPropagation();
            const cfg = document.getElementById('nika-pomo-cfg'); if (cfg) cfg.classList.remove('is-open');
            panelSalir.classList.toggle('is-open');
        });
        const panelCancelar = document.getElementById('nika-pomo-cancel');
        document.getElementById('nika-pomo-bar-cancel').addEventListener('click', (e) => {
            e.stopPropagation();
            const cfg = document.getElementById('nika-pomo-cfg'); if (cfg) cfg.classList.remove('is-open');
            panelSalir.classList.remove('is-open');
            const st = window.PomodoroEngine && window.PomodoroEngine.getState();
            const txt = document.getElementById('nika-pomo-cancel-txt');
            if (txt) txt.textContent = st && st.shared
                ? 'El reloj vuelve a cero para toda la sala y las personas invitadas quedan en espera. Lo que ya estudiaste se guarda.'
                : 'El reloj vuelve a cero. Si ya estudiaste unos minutos, se guardan en tu historial.';
            panelCancelar.classList.toggle('is-open');
        });
        document.getElementById('nika-pomo-cancel-no').addEventListener('click', () => panelCancelar.classList.remove('is-open'));
        document.getElementById('nika-pomo-cancel-si').addEventListener('click', () => {
            panelCancelar.classList.remove('is-open');
            if (window.PomodoroEngine) window.PomodoroEngine.reset();
        });
        document.getElementById('nika-pomo-leave-no').addEventListener('click', () => panelSalir.classList.remove('is-open'));
        document.getElementById('nika-pomo-leave-si').addEventListener('click', () => {
            panelSalir.classList.remove('is-open');
            if (window.PomodoroEngine) window.PomodoroEngine.leaveShared({ reason: 'manual', notify: true });
        });
        document.addEventListener('click', (e) => {
            if (panelSalir && panelSalir.classList.contains('is-open') && !e.target.closest('#nika-pomo-leave') && !e.target.closest('#nika-pomo-bar-leave')) panelSalir.classList.remove('is-open');
            if (panelCancelar && panelCancelar.classList.contains('is-open') && !e.target.closest('#nika-pomo-cancel') && !e.target.closest('#nika-pomo-bar-cancel')) panelCancelar.classList.remove('is-open');
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (panelSalir) panelSalir.classList.remove('is-open'); if (panelCancelar) panelCancelar.classList.remove('is-open'); } });

        document.getElementById('nika-pomo-bar-toggle').addEventListener('click', () => {
            if (!window.PomodoroEngine) return;
            const st = window.PomodoroEngine.getState();
            if (st.shared && st.shared.role === 'guest') return; // solo el Host controla el reloj
            if (st.status === 'running') window.PomodoroEngine.pause();
            else window.PomodoroEngine.start();
        });
        // Minimizar: en vez de ocultar la barra sin dejar forma de volver a
        // abrirla, la encoge a la píldora central (.is-collapsed).
        document.getElementById('nika-pomo-bar-min').addEventListener('click', () => { _setCollapsed(true); });
        document.getElementById('nika-pomo-bar-pin').addEventListener('click', () => { _setCollapsed(false); });
        document.getElementById('nika-pomo-bar-pill').addEventListener('click', () => { _setCollapsed(false); });

        // Si la barra se había minimizado y luego se recreó, respeta el último estado elegido.
        bar.classList.toggle('is-collapsed', collapsed);
    }

    // ---- Configuración rápida (⚙️): duración, descanso y unidad, sin volver a la Sala de Estudio ----
    const DATA_FILES = { cirugia: 'data/cirugia.json', ginecologia: 'data/gineco_data.json', siam: 'data/siam_data.json', medicinalegal: 'data/medicinalegal.json', medicinadeportiva: 'data/medicinadeportiva.json' };
    const _unidadesCache = {};
    async function _cargarUnidades(moduloId) {
        if (!moduloId) return [];
        if (window.EstudioState && EstudioState.data && EstudioState.data.units && EstudioState.modulo === moduloId) return EstudioState.data.units;
        if (_unidadesCache[moduloId]) return _unidadesCache[moduloId];
        try {
            const r = await fetch(DATA_FILES[moduloId] || `data/${moduloId}.json`);
            if (!r.ok) return [];
            const d = await r.json();
            return (_unidadesCache[moduloId] = d.units || []);
        } catch (_) { return []; }
    }

    async function _toggleCfg() {
        const panel = document.getElementById('nika-pomo-cfg'); if (!panel) return;
        const salir = document.getElementById('nika-pomo-leave'); if (salir) salir.classList.remove('is-open');
        if (panel.classList.contains('is-open')) { panel.classList.remove('is-open'); return; }
        const E = window.PomodoroEngine; if (!E) return;
        const st = E.getState();
        document.getElementById('nika-cfg-work').value = E.getMinutes('work');
        document.getElementById('nika-cfg-break').value = E.getMinutes('break');
        const sel = document.getElementById('nika-cfg-up'), fila = document.getElementById('nika-cfg-up-row');
        const units = await _cargarUnidades(st.moduleId);
        fila.style.display = units.length ? '' : 'none';
        sel.innerHTML = units.map(u => `<option value="${u.id}" ${u.id === st.upId ? 'selected' : ''}>UP${u.number} · ${String(u.title || '').trim()}</option>`).join('');
        panel.classList.add('is-open');
    }

    function _guardarCfg() {
        const E = window.PomodoroEngine; if (!E) return;
        const w = parseInt(document.getElementById('nika-cfg-work').value, 10);
        const b = parseInt(document.getElementById('nika-cfg-break').value, 10);
        if (!(w >= 1 && w <= 120) || !(b >= 1 && b <= 60)) { alert('Estudio: 1 a 120 min · Descanso: 1 a 60 min.'); return; }
        try { localStorage.setItem('nika_pomo_w_mins', String(w)); localStorage.setItem('nika_pomo_b_mins', String(b)); } catch (_) {}
        const st = E.getState();
        const sel = document.getElementById('nika-cfg-up');
        const upId = sel && sel.value ? sel.value : st.upId;
        const unit = upId && window.EstudioState && EstudioState.unitsById ? EstudioState.unitsById[upId] : null;
        const opt = sel && sel.selectedOptions[0];
        const upLabel = upId === st.upId ? st.upLabel : (unit ? unit.title : (opt ? opt.textContent.replace(/^UP\d+\s·\s/, '') : upId));
        E.reset(undefined, { moduleId: st.moduleId, upId, upLabel });
        document.getElementById('nika-pomo-cfg').classList.remove('is-open');
    }

    function _setCollapsed(valor) {
        collapsed = valor;
        try { localStorage.setItem(PIN_KEY, collapsed ? '0' : '1'); } catch (_) {}     // abierta = fijada por la persona
        if (bar) { bar.classList.toggle('is-collapsed', collapsed); bar.classList.toggle('is-fija', !collapsed); }
        if (collapsed && document.activeElement && bar && bar.contains(document.activeElement)) document.activeElement.blur();   // que no se quede abierta por el foco
    }

    // Compañeros de la sala como avatares (hasta 4 + "+n")
    function _equipo(sh, esInvitado) {
        let lista = [];
        if (!esInvitado) {
            lista = (sh.guests || []).filter((g) => g.joined).map((g) => ({ u: g.username, on: g.online !== false }));
        } else {
            const roster = Array.isArray(sh.roster) ? sh.roster : [];
            lista = roster.map((r) => (typeof r === 'string' ? { u: r, on: true } : { u: r.username || r.u, on: r.online !== false })).filter((x) => x.u);
            if (sh.hostUsername && !lista.some((x) => x.u === sh.hostUsername)) lista.unshift({ u: sh.hostUsername, on: !!sh.partnerOnline });
        }
        return lista;
    }

    function _render() {
        if (!window.PomodoroEngine) return;
        const st = window.PomodoroEngine.getState();
        const sh = st.shared;

        // Con una sesión compartida la barra queda visible aunque el reloj esté en espera
        // (el Invitado tiene que ver a qué sesión está atado y poder salir).
        if (st.status === 'idle' && !sh) {
            if (bar) { bar.remove(); bar = null; document.body.classList.remove('nika-has-pomo-bar'); }
            return;
        }
        if (!bar) _crear();
        _medirLateral();

        const esDescanso = st.mode === 'break';
        const enEspera = st.status === 'idle';
        const corriendo = st.status === 'running';
        const esInvitado = !!(sh && sh.role === 'guest');
        const tiempoFormateado = window.PomodoroEngine.formatTime(st.remainingSeconds);
        const tema = window.PomodoroEngine.formatTema ? window.PomodoroEngine.formatTema(st) : (st.upLabel || '');

        document.getElementById('nika-pomo-bar-phase').textContent = enEspera
            ? (esInvitado ? 'En espera' : (esDescanso ? 'Descanso' : 'Enfoque'))
            : (esDescanso ? 'Descanso' : 'Enfoque');
        document.getElementById('nika-pomo-bar-time').textContent = tiempoFormateado;

        // Anillo de progreso (tiempo transcurrido de la fase)
        const total = Math.max(1, (st.durationMin || (window.PomodoroEngine.getMinutes ? window.PomodoroEngine.getMinutes(st.mode) : 25)) * 60);
        const pct = enEspera ? 0 : Math.max(0, Math.min(100, Math.round((1 - st.remainingSeconds / total) * 100)));
        const ring = document.getElementById('nika-pomo-ring'); if (ring) ring.style.setProperty('--p', pct);
        const mini = document.getElementById('nika-pomo-mini'); if (mini) mini.style.setProperty('--p', pct);
        const logo = document.getElementById('nika-pomo-bar-logo'); if (logo) logo.textContent = esDescanso ? '☕' : '🍅';

        // Celebración suave al cambiar de fase
        const faseClave = st.mode + ':' + st.status;
        if (ultimaFase && ultimaFase !== faseClave && !prefiereMenosMovimiento() && bar.animate) {
            bar.animate([{ transform: 'translateY(-4px) scale(1.01)', filter: 'brightness(1.25)' }, { transform: 'none', filter: 'none' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        }
        ultimaFase = faseClave;

        // Rol dentro de la sesión compartida
        const roleEl = document.getElementById('nika-pomo-bar-role');
        if (sh) {
            roleEl.style.display = '';
            roleEl.innerHTML = esInvitado ? '🔒<span class="txt"> Invitado</span>' : '🧉<span class="txt"> Host</span>';
            roleEl.title = esInvitado ? 'Solo el Host controla el reloj' : 'Vos controlás el reloj de la sesión';
        } else {
            roleEl.style.display = 'none';
        }

        // Compañeros
        const teamEl = document.getElementById('nika-pomo-team');
        if (sh) {
            const eq = _equipo(sh, esInvitado);
            const clave = eq.map((x) => x.u + (x.on ? '1' : '0')).join('|');
            if (teamEl.dataset.k !== clave) {
                teamEl.dataset.k = clave;
                const vis = eq.slice(0, 4), resto = eq.length - vis.length;
                teamEl.innerHTML = vis.map((x) => `<span class="nika-pomo-av ${x.on ? '' : 'off'}" style="background:${colorDe(x.u)}" title="@${esc(x.u)}${x.on ? '' : ' (sin conexión)'}">${esc(String(x.u).slice(0, 2))}</span>`).join('')
                    + (resto > 0 ? `<span class="nika-pomo-av mas" title="${resto} más">+${resto}</span>` : '');
            }
        } else { teamEl.innerHTML = ''; teamEl.dataset.k = ''; }

        // Banner: "Estudiando: <Unidad/Tema> con @usuario"
        const partnerEl = document.getElementById('nika-pomo-bar-partner');
        if (sh) {
            const otro = sh.partner;
            const entraron = (sh.guests || []).filter(g => g.joined);
            let txt;
            if (!esInvitado && entraron.length > 1) {
                const nombres = entraron.slice(0, 2).map(g => '@' + g.username).join(', ');
                const resto = entraron.length - 2;
                const con = resto > 0 ? `${nombres} y ${resto} más` : nombres;
                txt = tema ? `Estudiando: ${tema} con ${con}` : `Estudiando con ${con}`;
                partnerEl.title = entraron.map(g => '@' + g.username + (g.online ? '' : ' (sin conexión)')).join(', ');
            } else if (otro) {
                txt = tema ? `Estudiando: ${tema} con @${otro}` : `Estudiando con @${otro}`;
                if (!sh.partnerOnline) txt += esInvitado ? ' (reconectando…)' : ' (esperando que se una)';
                if (esInvitado && enEspera) txt = `Esperando que @${otro} inicie el reloj` + (tema ? ` · ${tema}` : '');
            } else {
                txt = tema ? `Estudiando: ${tema} · esperando invitado…` : 'Esperando invitado…';
            }
            if (!esInvitado && enEspera) txt = `Sala de espera · ${entraron.length + 1} en la sala`;
            partnerEl.textContent = txt;
            if (!(!esInvitado && entraron.length > 1)) partnerEl.title = txt;
        } else {
            const legado = getSyncPartner();
            partnerEl.textContent = legado ? `· Sincronizado con @${legado}` : (tema ? `· ${tema}` : '');
            partnerEl.title = '';
        }

        // Estado de la conexión (solo importa en sesión compartida)
        const connEl = document.getElementById('nika-pomo-conn');
        if (connEl) {
            const m = window.PomodoroSyncManager;
            const est = sh && m && typeof m.estadoConexion === 'function' ? m.estadoConexion() : null;
            if (!sh || !est) connEl.style.display = 'none';
            else {
                connEl.style.display = '';
                connEl.className = 'nika-pomo-conn' + (est === 'ok' ? '' : est === 'reconectando' ? ' rec' : ' sin');
                if (!connEl.classList.contains('cargando')) document.getElementById('nika-pomo-conn-t').textContent = est === 'ok' ? 'Conectado' : est === 'reconectando' ? '↻ Reintentar' : '↻ Reconectar';
                connEl.title = est === 'ok' ? 'Conectado a la sala' : 'Tocá para reconectar la sala ahora. Tu cronómetro sigue corriendo.';
            }
        }

        const toggle = document.getElementById('nika-pomo-bar-toggle');
        toggle.textContent = corriendo ? '⏸️' : '▶️';
        toggle.disabled = esInvitado;
        toggle.style.display = (esInvitado && enEspera) ? 'none' : '';
        toggle.title = esInvitado ? `Controlado por @${sh.partner || 'el Host'}` : 'Pausar / reanudar';
        document.getElementById('nika-pomo-bar-leave').style.display = sh ? '' : 'none';
        document.getElementById('nika-pomo-bar-cancel').style.display = (!esInvitado && !enEspera) ? '' : 'none';
        document.getElementById('nika-pomo-bar-room').style.display = (sh && (enEspera || !esInvitado) && window.abrirSalaEstudio) ? '' : 'none';   // sala de espera abierta
        document.getElementById('nika-pomo-bar-cfg').style.display = esInvitado ? 'none' : '';   // el Invitado no toca el reloj del Host
        if (esInvitado) { const pc = document.getElementById('nika-pomo-cfg'); if (pc) pc.classList.remove('is-open'); }
        bar.classList.toggle('nika-pomo-bar--paused', !corriendo);
        bar.classList.toggle('nika-pomo-bar--break', esDescanso);
        bar.classList.toggle('is-running', corriendo);
        document.body.classList.add('nika-has-pomo-bar');

        // Píldora minimizada: mismo dato que la barra completa, en formato corto
        const pillIcon = document.getElementById('nika-pomo-bar-pill-icon');
        const pillLabel = document.getElementById('nika-pomo-bar-pill-label');
        const pillTime = document.getElementById('nika-pomo-bar-pill-time');
        if (pillIcon) pillIcon.textContent = esDescanso ? '☕' : '🍅';
        if (pillLabel) pillLabel.textContent = enEspera
            ? 'En espera'
            : (corriendo
                ? (esDescanso ? 'Descanso' : 'Enfoque')
                : (esDescanso ? 'Descanso en pausa' : 'Enfoque en pausa'));
        if (pillTime) pillTime.textContent = tiempoFormateado;
    }

    function _init() {
        if (!window.PomodoroEngine) { setTimeout(_init, 300); return; }
        try { localStorage.removeItem(PARTNER_KEY); } catch (_) {} // clave vieja: evita un "Sincronizado con" fantasma
        _render();
        window.PomodoroEngine.on('tick', _render);
        window.PomodoroEngine.on('change', _render);
        // El compañero de sesión vive ahora en el motor y sobrevive entre fases: ya no se borra al completar.
        window.PomodoroEngine.on('complete', _render);
        window.PomodoroEngine.on('shared', _render);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();

    return { setSyncPartner, getSyncPartner };
})();

window.NikaPomoBar = NikaPomoBar;
