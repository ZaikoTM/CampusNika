// js/examen.js
// CAMPUS NIKA — Motor de Simulacro Rápido con Ranking ELO (Frente 3, Fase Final)
//
// IMPORTANTE — Cómo convive con el simulador ya existente en examen.html:
// examen.html ya tiene un motor de examen completo y maduro (modos Parcial,
// Final, Residencia, UP Específica, Flash), con su propio estado global
// (currentExam, currentIndex, timerInterval, etc.) y su propia lógica de
// puntaje en % + penalización. Para NO romper nada de eso, este archivo NO
// toca esas variables ni esas funciones: define un motor 100% independiente
// y namespaced bajo `SimuladorElo`, que arma su propia UI por DOM (mismo
// patrón que assistant.js) y que se dispara con UNA sola línea:
//
//     SimuladorElo.iniciar();                 // 10 preguntas de cualquier módulo
//     SimuladorElo.iniciar({ modulo: 'cirugia' }); // filtrado por módulo
//
// Pensado como el "Duelo Rápido" / calentamiento con impacto en ELO —
// complementario al simulacro largo, no un reemplazo.

const SimuladorElo = (() => {

    const CONFIG = {
        preguntasUrl: 'preguntas.json',
        cantidadPreguntas: 10,
        segundosPorPregunta: 30,
        puntosPorAcierto: 10,
        puntosPorError: -3,
        eloPorVictoria: 15,
        eloPorDerrota: -10,
        // Proporción mínima de aciertos para que el simulacro cuente como
        // "victoria" a los efectos del ELO (>=60% de las preguntas).
        umbralVictoria: 0.6
    };

    let state = null; // se reinicia en cada iniciar()
    let els = {};

    // ============ Carga y muestreo del banco de preguntas ============

    async function cargarBancoPreguntas() {
        const res = await fetch(CONFIG.preguntasUrl);
        if (!res.ok) throw new Error(`No se pudo cargar ${CONFIG.preguntasUrl} (HTTP ${res.status})`);
        return res.json();
    }

    function barajar(array) {
        const copia = [...array];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }

    // ============ UI (inyectada por DOM, no depende de markup previo) ============

    function injectStyles() {
        if (document.getElementById('simulador-elo-styles')) return;
        const style = document.createElement('style');
        style.id = 'simulador-elo-styles';
        style.textContent = `
            #simulador-elo-overlay {
                position: fixed; inset: 0; z-index: 10000; background: rgba(2,6,23,0.65);
                display: none; align-items: center; justify-content: center; padding: 16px;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            #simulador-elo-overlay.open { display: flex; }
            #simulador-elo-card {
                background: #fff; border-radius: 18px; width: 100%; max-width: 560px;
                max-height: 90vh; overflow-y: auto; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.4);
                padding: 26px 26px 22px 26px;
            }
            .se-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
            .se-header h3 { font-size: 1.15rem; font-weight: 800; color:#0f172a; margin:0; }
            .se-close { background:#f1f5f9; border:none; width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:1rem; }
            .se-progressbar { width:100%; height:8px; background:#e2e8f0; border-radius:6px; overflow:hidden; margin-bottom:6px; }
            .se-progressbar-fill { height:100%; background:linear-gradient(90deg,#0284c7,#38bdf8); transition: width 0.25s ease; }
            .se-meta-row { display:flex; justify-content:space-between; font-size:0.78rem; color:#475569; font-weight:700; margin-bottom:18px; }
            .se-timer.warn { color:#dc2626; }
            .se-question { font-size:1.02rem; font-weight:700; color:#0f172a; margin-bottom:16px; line-height:1.5; }
            .se-options { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
            .se-option { text-align:left; padding:12px 14px; border:2px solid #e2e8f0; border-radius:10px; background:#f8fafc; cursor:pointer; font-size:0.9rem; color:#0f172a; transition: all 0.15s ease; }
            .se-option:hover { border-color:#38bdf8; }
            .se-option.correct { border-color:#16a34a; background:#dcfce7; font-weight:700; }
            .se-option.incorrect { border-color:#dc2626; background:#fef2f2; font-weight:700; }
            .se-option[disabled] { cursor: default; }
            .se-footer-note { font-size:0.78rem; color:#64748b; text-align:center; }
            .se-result-score { font-size:2.4rem; font-weight:900; text-align:center; margin: 6px 0; }
            .se-result-elo { text-align:center; font-size:0.95rem; font-weight:800; margin-bottom:18px; }
            .se-result-elo.up { color:#16a34a; }
            .se-result-elo.down { color:#dc2626; }
            .se-btn { width:100%; padding:12px; border:none; border-radius:10px; font-weight:800; font-size:0.92rem; cursor:pointer; }
            .se-btn.primary { background:#0284c7; color:#fff; }
            .se-btn.secondary { background:#e2e8f0; color:#334155; margin-top:8px; }
        `;
        document.head.appendChild(style);
    }

    function buildOverlay() {
        if (document.getElementById('simulador-elo-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'simulador-elo-overlay';
        overlay.innerHTML = `
            <div id="simulador-elo-card">
                <div class="se-header">
                    <h3>⚡ Simulacro Rápido</h3>
                    <button class="se-close" id="se-btn-cerrar" aria-label="Cerrar">✕</button>
                </div>
                <div id="se-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#se-btn-cerrar').addEventListener('click', cerrar);

        els.overlay = overlay;
        els.body = overlay.querySelector('#se-body');
    }

    function abrir() { els.overlay.classList.add('open'); }
    function cerrar() {
        els.overlay.classList.remove('open');
        if (state && state.timerInterval) clearInterval(state.timerInterval);
        if (window.PomodoroSyncManager) {
            window.PomodoroSyncManager.actualizarEstado({ up: null, pomodoroActivo: false, faseActual: null });
        }
    }

    // ============ Flujo del simulacro ============

    async function iniciar(opciones = {}) {
        injectStyles();
        buildOverlay();

        state = {
            preguntas: [],
            indice: 0,
            puntaje: 0,
            aciertos: 0,
            errores: 0,
            timerInterval: null,
            segundosRestantes: 0,
            respondida: false,
            modulo: opciones.modulo || null,
            detalle: [] // { modulo, up, ok, blank } por pregunta, para guardar el resultado por materia y UP
        };

        els.body.innerHTML = `<p style="text-align:center; color:#64748b; padding: 30px 0;">Cargando preguntas…</p>`;
        abrir();

        try {
            const banco = await cargarBancoPreguntas();
            let pool = Array.isArray(banco) ? banco : [];
            if (opciones.modulo) pool = pool.filter(p => p.modulo === opciones.modulo);
            if (opciones.up) pool = pool.filter(p => String(p.up) === String(opciones.up));

            if (pool.length === 0) throw new Error('No hay preguntas disponibles para ese filtro.');

            state.preguntas = barajar(pool).slice(0, Math.min(CONFIG.cantidadPreguntas, pool.length));
            renderPregunta();
        } catch (err) {
            console.error('[SimuladorElo] Error al iniciar:', err);
            els.body.innerHTML = `<p style="text-align:center; color:#dc2626; padding: 30px 0;">${err.message || 'No se pudo iniciar el simulacro.'}</p>`;
        }
    }

    function renderPregunta() {
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.respondida = false;
        state.segundosRestantes = CONFIG.segundosPorPregunta;

        const total = state.preguntas.length;
        const q = state.preguntas[state.indice];
        const pct = Math.round((state.indice / total) * 100);

        if (window.PomodoroSyncManager) {
            window.PomodoroSyncManager.actualizarEstado({ up: `UP${q.up}`, pomodoroActivo: false, faseActual: null });
        }

        els.body.innerHTML = `
            <div class="se-progressbar"><div class="se-progressbar-fill" style="width:${pct}%;"></div></div>
            <div class="se-meta-row">
                <span>Pregunta ${state.indice + 1} de ${total}</span>
                <span id="se-puntaje">Puntaje: ${state.puntaje}</span>
                <span id="se-timer" class="se-timer">⏱ ${state.segundosRestantes}s</span>
            </div>
            <div class="se-question">${q.enunciado}</div>
            <div class="se-options" id="se-options"></div>
            <div class="se-footer-note">UP ${q.up} · +${CONFIG.puntosPorAcierto} por acierto, ${CONFIG.puntosPorError} por error</div>
        `;

        const optionsEl = document.getElementById('se-options');
        Object.entries(q.opciones).forEach(([key, texto]) => {
            const btn = document.createElement('button');
            btn.className = 'se-option';
            btn.textContent = texto;
            btn.dataset.key = key;
            btn.addEventListener('click', () => responder(key));
            optionsEl.appendChild(btn);
        });

        state.timerInterval = setInterval(() => {
            state.segundosRestantes--;
            const timerEl = document.getElementById('se-timer');
            if (timerEl) {
                timerEl.textContent = `⏱ ${state.segundosRestantes}s`;
                timerEl.classList.toggle('warn', state.segundosRestantes <= 10);
            }
            if (state.segundosRestantes <= 0) {
                clearInterval(state.timerInterval);
                if (!state.respondida) responder(null); // tiempo agotado = error
            }
        }, 1000);
    }

    function responder(keyElegida) {
        if (state.respondida) return;
        state.respondida = true;
        clearInterval(state.timerInterval);

        const q = state.preguntas[state.indice];
        const esCorrecta = keyElegida === q.correcta;

        if (esCorrecta) { state.puntaje += CONFIG.puntosPorAcierto; state.aciertos++; }
        else { state.puntaje += CONFIG.puntosPorError; state.errores++; }
        state.detalle.push({ modulo: q.modulo || state.modulo || 'cirugia', up: q.up, ok: esCorrecta, blank: keyElegida === null });

        document.querySelectorAll('.se-option').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.key === q.correcta) btn.classList.add('correct');
            else if (btn.dataset.key === keyElegida) btn.classList.add('incorrect');
        });

        const puntajeEl = document.getElementById('se-puntaje');
        if (puntajeEl) puntajeEl.textContent = `Puntaje: ${state.puntaje}`;

        if (q.justificacion) {
            const nota = document.createElement('div');
            nota.style.cssText = 'margin-top:14px; padding:10px 12px; background:#f8fafc; border-left:3px solid #0284c7; border-radius:6px; font-size:0.82rem; color:#334155;';
            nota.textContent = q.justificacion;
            document.getElementById('se-options').insertAdjacentElement('afterend', nota);
        }

        setTimeout(() => {
            if (state.indice < state.preguntas.length - 1) {
                state.indice++;
                renderPregunta();
            } else {
                finalizar();
            }
        }, esCorrecta ? 1400 : 2600);
    }

    async function finalizar() {
        const total = state.preguntas.length;
        const proporcionAciertos = state.aciertos / total;
        const gano = proporcionAciertos >= CONFIG.umbralVictoria;
        const eloDelta = gano ? CONFIG.eloPorVictoria : CONFIG.eloPorDerrota;

        if (window.PomodoroSyncManager) {
            window.PomodoroSyncManager.actualizarEstado({ up: null, pomodoroActivo: false, faseActual: null });
        }

        els.body.innerHTML = `
            <div style="text-align:center;">
                <div class="se-result-score">${state.puntaje} pts</div>
                <p style="color:#64748b; font-size:0.9rem; margin-bottom:16px;">${state.aciertos} aciertos / ${state.errores} errores de ${total} preguntas</p>
                <div id="se-elo-status" class="se-result-elo">Actualizando tu ELO…</div>
                <button class="se-btn primary" id="se-btn-repetir">Otro Simulacro Rápido 🔁</button>
                <button class="se-btn secondary" id="se-btn-cerrar-final">Cerrar</button>
            </div>
        `;
        document.getElementById('se-btn-repetir').addEventListener('click', () => iniciar());
        document.getElementById('se-btn-cerrar-final').addEventListener('click', cerrar);

        const eloStatusEl = document.getElementById('se-elo-status');

        // Guarda el resultado por materia y por UP (Rendimiento, Radar Clínico, Curva del Olvido)
        guardarResultadoRapido();

        try {
            if (typeof NikaSocial === 'undefined') throw new Error('Módulo social no disponible.');

            let userId = null;
            if (window.NikaAuth && window.NikaAuth.ready) userId = await window.NikaAuth.ready;
            if (!userId) {
                eloStatusEl.textContent = 'Iniciá sesión para que este resultado sume a tu ELO.';
                return;
            }

            const res = await NikaSocial.actualizarElo(userId, gano, eloDelta);
            if (!res.ok) {
                eloStatusEl.textContent = `No se pudo actualizar tu ELO (${res.error || 'error desconocido'}).`;
                return;
            }

            eloStatusEl.classList.add(gano ? 'up' : 'down');
            eloStatusEl.textContent = `${gano ? '📈' : '📉'} ELO: ${eloDelta > 0 ? '+' : ''}${eloDelta} → ahora tenés ${res.data.elo_score} puntos`;
        } catch (err) {
            console.error('[SimuladorElo] Error al actualizar ELO:', err);
            eloStatusEl.textContent = 'No se pudo actualizar tu ELO en este momento.';
        }
    }

    // Un renglón en exam_results por cada materia que apareció en el simulacro
    function guardarResultadoRapido() {
        if (!window.NikaRendimiento || !state || !state.detalle.length) return;
        const porModulo = {};
        state.detalle.forEach((d) => {
            const m = porModulo[d.modulo] = porModulo[d.modulo] || { total: 0, correct: 0, blank: 0, byUp: {} };
            m.total++;
            if (d.ok) m.correct++;
            if (d.blank) m.blank++;
            const up = String(d.up);
            m.byUp[up] = m.byUp[up] || { total: 0, correct: 0 };
            m.byUp[up].total++;
            if (d.ok) m.byUp[up].correct++;
        });
        Object.entries(porModulo).forEach(([modulo, m]) => {
            window.NikaRendimiento.guardarExamen({
                modulo,
                mode: 'rapido',
                total: m.total,
                correct: m.correct,
                blank: m.blank,
                score: m.correct,
                scorePct: Math.round((m.correct / m.total) * 100),
                durationSeconds: null,
                byUp: m.byUp
            });
        });
    }

    return { iniciar, cerrar };
})();
