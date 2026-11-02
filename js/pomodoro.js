// js/productivity/pomodoro.js
// UI del Pomodoro. El temporizador en sí vive en js/pomodoroEngine.js (motor global
// que sigue corriendo al cambiar de pestaña o de página y muestra el tiempo en el
// título del navegador). Este módulo solo dibuja el panel y le manda órdenes al motor.

const PomodoroModule = (() => {
  const engine = () => window.PomodoroEngine;

  let currentView = 'timer';
  let currentModuleId = null;
  let currentUpId = null;
  let currentUpLabel = null;
  let containerEl = null;
  let unsubTick = null;
  let unsubChange = null;

  // Valores derivados del motor
  const isRunning = () => engine().getState().status === 'running';
  const getMode = () => engine().getState().mode;          // 'work' | 'break'
  const getSecondsLeft = () => engine().getRemainingSeconds();
  const getWorkMinutes = () => engine().getMinutes('work');
  const getBreakMinutes = () => engine().getMinutes('break');

  // BUSCADOR ROBUSTO DE SUPABASE
  function getDbClient() {
    return window.NikaSupabase?.client || window.NikaSupabase?.supabase || window.supabaseClient || window.supabase;
  }

  async function getSessionUser() {
    try {
      const client = getDbClient();
      if (client && client.auth) {
        const { data: { session } } = await client.auth.getSession();
        if (session && session.user) return session.user;
      }
    } catch (e) {}
    return null;
  }

  // Descarga el historial de sesiones desde la nube
  async function syncStatsFromSupabase() {
    try {
      const client = getDbClient();
      if (!client) return;
      
      const user = await getSessionUser();
      if (!user) return;

      const { data, error } = await client
        .from('study_sessions')
        .select('modulo, up_id, duration_minutes')
        .eq('user_id', user.id);

      if (!error && data) {
        let grouped = {};
        
        data.forEach(row => {
          const key = `nika_time_${row.modulo}_${row.up_id}`;
          grouped[key] = (grouped[key] || 0) + (row.duration_minutes || 0);
        });
        
        Object.keys(grouped).forEach(k => {
          localStorage.setItem(k, grouped[k].toString());
        });
        // La nube manda: una clave local que ya no tiene sesiones (por ejemplo, tras descontar horas duplicadas) se borra
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.indexOf('nika_time_') === 0 && !(k in grouped)) localStorage.removeItem(k);
          }
        } catch (_) {}

        if (currentView === 'stats') {
            render();
        }
      }
    } catch(err) {
      console.error('[Pomodoro] Error sincronizando stats desde Supabase:', err);
    }
  }

  function buildUpSelectorOptions() {
    const hasEstudioState = typeof EstudioState !== 'undefined' && EstudioState.data && EstudioState.data.units;
    const upInList = hasEstudioState && EstudioState.data.units.some(u => u.id === currentUpId);
    if (!hasEstudioState || !upInList) {
      const label = currentUpLabel || currentUpId || 'Sin UP';
      return `<option value="${currentUpId || ''}" selected>${label}</option>`;
    }
    return EstudioState.data.units.map(unit => {
      const selected = unit.id === currentUpId ? 'selected' : '';
      return `<option value="${unit.id}" ${selected}>UP${unit.number} · ${unit.title}</option>`;
    }).join('');
  }

  function switchUpContext(newUpId) {
    if (!newUpId || newUpId === currentUpId) return;
    const hasEstudioState = typeof EstudioState !== 'undefined' && EstudioState.unitsById;
    const unit = hasEstudioState ? EstudioState.unitsById[newUpId] : null;
    currentUpId = newUpId;
    currentUpLabel = unit ? unit.title : newUpId;
    engine().reset(undefined, { moduleId: currentModuleId, upId: currentUpId, upLabel: currentUpLabel });
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function getStats() {
    if (!currentModuleId || !currentUpId) return { unit: 0, module: 0 };
    const unitKey = `nika_time_${currentModuleId}_${currentUpId}`;
    const unitMinutes = parseInt(localStorage.getItem(unitKey) || '0', 10);
    
    let moduleMinutes = 0;
    const modulePrefix = `nika_time_${currentModuleId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(modulePrefix)) {
        const val = parseInt(localStorage.getItem(key) || '0', 10);
        if (!isNaN(val)) moduleMinutes += val;
      }
    }
    return { unit: unitMinutes, module: moduleMinutes };
  }

  function shouldShowNotifBanner() {
    if (!("Notification" in window)) return false;
    if (Notification.permission !== "default") return false;
    if (localStorage.getItem('nika_pomo_notif_hidden') === 'true') return false;
    return true;
  }

  // ---- Animaciones y microanimaciones ----
  let lastView = null, lastGoalPct = 0;
  (function injectAnimCss() {
    if (document.getElementById('nika-pomo-anim-css')) return;
    const st = document.createElement('style');
    st.id = 'nika-pomo-anim-css';
    st.textContent = `
      .pomo-enter { animation: pomoEnter .28s ease both; }
      @keyframes pomoEnter { from { opacity: 0; transform: translateY(6px) scale(.985); } to { opacity: 1; transform: none; } }
      [id^="pomodoro-"], [id^="pomo-mode-"], [id^="pomo-view-"], #pomo-presets button, #pomo-save-custom, #pomo-save-config { transition: transform .15s ease, box-shadow .2s ease, filter .2s ease, background .2s ease; }
      [id^="pomodoro-"]:not(:disabled):hover, [id^="pomo-mode-"]:hover, [id^="pomo-view-"]:hover, #pomo-presets button:hover, #pomo-save-config:hover { transform: translateY(-1px); box-shadow: 0 6px 14px -6px rgba(0,0,0,.35); filter: brightness(1.04); }
      [id^="pomodoro-"]:not(:disabled):active, [id^="pomo-mode-"]:active, [id^="pomo-view-"]:active, #pomo-presets button:active, #pomo-save-config:active { transform: scale(.95); box-shadow: none; }
      #pomodoro-finish, #pomodoro-skip-break, #pomodoro-extend-break { animation: pomoPopIn .35s cubic-bezier(.2,1.3,.4,1) both; }
      @keyframes pomoPopIn { from { opacity: 0; transform: translateY(8px) scale(.92); } to { opacity: 1; transform: none; } }
      #pomo-time.pomo-corre { animation: pomoRespira 2.4s ease-in-out infinite; }
      @keyframes pomoRespira { 0%, 100% { text-shadow: 0 0 0 transparent; } 50% { text-shadow: 0 0 18px currentColor; } }
      .pomo-goal-fill { transition: width .9s cubic-bezier(.2,.8,.2,1); position: relative; overflow: hidden; }
      .pomo-goal-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%); transform: translateX(-100%); animation: pomoBrillo 2.6s ease-in-out infinite; }
      @keyframes pomoBrillo { 60%, 100% { transform: translateX(100%); } }
      .pomo-confeti { position: fixed; top: 0; left: 0; width: 100%; height: 0; z-index: 99999; pointer-events: none; }
      .pomo-confeti i { position: absolute; top: -12px; width: 9px; height: 14px; border-radius: 2px; opacity: 0; animation: pomoCae 2.2s ease-out forwards; }
      @keyframes pomoCae { 0% { opacity: 1; transform: translate3d(0,0,0) rotate(0); } 100% { opacity: 0; transform: translate3d(var(--dx), 105vh, 0) rotate(var(--rot)); } }
      @media (prefers-reduced-motion: reduce) { .pomo-enter, #pomodoro-finish, #pomodoro-skip-break, #pomodoro-extend-break, #pomo-time.pomo-corre, .pomo-goal-fill, .pomo-goal-fill::after { animation: none !important; transition: none !important; } .pomo-confeti { display: none; } }`;
    document.head.appendChild(st);
  })();

  function confeti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div');
    box.className = 'pomo-confeti';
    const colores = ['#f43f5e', '#fbbf24', '#22c55e', '#38bdf8', '#a78bfa', '#fb923c'];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colores[i % colores.length];
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 220) + 'px');
      p.style.setProperty('--rot', ((Math.random() - 0.5) * 900) + 'deg');
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3200);
  }
  window.addEventListener('nika:meta-diaria', confeti);

  function render() {
    if (!containerEl) return;
    const viewChanged = lastView !== currentView;
    lastView = currentView;
    renderInner();
    const root = containerEl.firstElementChild;
    if (root && viewChanged) root.classList.add('pomo-enter');
    const time = containerEl.querySelector('#pomo-time');
    if (time && isRunning()) time.classList.add('pomo-corre');
    const fill = containerEl.querySelector('.pomo-goal-fill');
    if (fill) {
      const pct = parseFloat(fill.dataset.pct) || 0;
      fill.style.width = lastGoalPct + '%';
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct + '%'; }));
      lastGoalPct = pct;
    }
  }

  function renderInner() {
    if (!containerEl) return;
    const mode = getMode();
    const secondsLeft = getSecondsLeft();
    const running = isRunning();
    const isWork = mode === 'work';

    // FIX: estas constantes se declaraban DESPUES de sharedNoteHtml, cuya plantilla las usaba antes
    // de inicializarlas (ReferenceError) cuando habia sesion compartida: render() explotaba y el
    // panel del Pomodoro no aparecia.
    const cardBg = isWork 
      ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' 
      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
    const borderColor = isWork ? 'rgba(244, 63, 94, 0.25)' : 'rgba(34, 197, 94, 0.25)';
    const primaryColor = isWork ? '#e11d48' : '#16a34a';
    const titleColor = isWork ? '#9f1239' : '#166534';

    // Sesión compartida: el Invitado ve el reloj pero NO tiene controles (solo el Host manda).
    const stShared = engine().getState().shared;
    const bloqueado = !!(stShared && stShared.role === 'guest');
    const escHtml = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const sharedNoteHtml = stShared ? `
        <div style="background: rgba(255,255,255,0.7); border: 1px dashed ${borderColor}; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 0.72rem; font-weight: 700; color: ${titleColor}; line-height: 1.3;">
                ${bloqueado ? '🔒' : '🧉'} Sesión compartida ${(() => { const g = (stShared.guests || []).filter(x => x.joined); return g.length > 1 ? 'con ' + g.map(x => '@' + escHtml(x.username)).join(', ') : (stShared.partner ? 'con @' + escHtml(stShared.partner) : '(esperando invitado)'); })()}${bloqueado ? ' · el Host controla el reloj' : ''}
            </span>
            <button id="pomo-shared-leave" style="background: transparent; border: 1px solid ${borderColor}; color: ${titleColor}; border-radius: 6px; padding: 3px 8px; font-size: 0.68rem; font-weight: 700; cursor: pointer; white-space: nowrap;">Salir</button>
        </div>` : '';

    if (currentView === 'timer') {
      const bannerHtml = shouldShowNotifBanner() ? `
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span style="font-size: 0.72rem; color: #1e3a8a; font-weight: 700; line-height: 1.3;">
                🔔 Activá las notificaciones para que el sistema te avise en segundo plano.
            </span>
            <div style="display: flex; gap: 6px; align-items: center;">
                <button id="pomo-notif-enable" style="background: #2563eb; color: white; border: none; border-radius: 6px; padding: 5px 10px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap;">Permitir</button>
                <button id="pomo-notif-dismiss" style="background: transparent; color: #64748b; border: none; font-size: 1.1rem; cursor: pointer; padding: 0 4px; line-height: 1;">×</button>
            </div>
        </div>
      ` : '';

      const stNow = engine().getState();
      const activo = stNow.status === 'running' || stNow.status === 'paused';
      const btnStyle = 'flex: 1; border-radius: 8px; padding: 8px; font-weight: 700; font-size: 0.76rem; cursor: pointer;';
      let extraBtnsHtml = '';
      if (!bloqueado && isWork && activo) {
        extraBtnsHtml = `<button id="pomodoro-finish" style="${btnStyle} margin-top: 6px; width: 100%; background: #ecfdf5; color: #047857; border: 1px solid #6ee7b7;" title="Corta el bloque y guarda todo lo que llevás estudiado">✔ Terminar y guardar lo estudiado</button>`;
      } else if (!bloqueado && !isWork) {
        extraBtnsHtml = `<div style="display: flex; gap: 6px; margin-top: 6px;">
            ${activo ? `<button id="pomodoro-extend-break" style="${btnStyle} background: #f0fdf4; color: #166534; border: 1px solid #86efac;" title="Suma 5 minutos al descanso">＋5 min</button>` : ''}
            <button id="pomodoro-skip-break" style="${btnStyle} flex: 2; background: #fff7ed; color: #c2410c; border: 1px solid #fdba74;" title="Salta el descanso sin perder tus estadísticas de estudio">⏭ Saltar descanso</button>
          </div>`;
      }
      const prefs = engine().getPrefs();
      let goalHtml = '';
      if (prefs.goalMin > 0) {
        const hoy = engine().getTodayMinutes();
        const pct = Math.min(100, Math.round(hoy / prefs.goalMin * 100));
        const fmtH = (m) => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`;
        goalHtml = `<div style="margin-top: 10px;" title="Se cuenta lo estudiado hoy en este dispositivo. Al cumplirla suma a tu racha y a la Liga.">
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: ${titleColor}; margin-bottom: 3px;"><span>🎯 Meta de hoy</span><span>${fmtH(hoy)} / ${fmtH(prefs.goalMin)}${pct >= 100 ? ' ✅' : ''}</span></div>
            <div style="height: 7px; background: rgba(0,0,0,0.08); border-radius: 99px; overflow: hidden;"><div class="pomo-goal-fill" data-pct="${pct}" style="width: ${pct}%; height: 100%; border-radius: 99px; background: ${pct >= 100 ? '#16a34a' : primaryColor};"></div></div>
          </div>`;
      }

      containerEl.innerHTML = `
        <div style="background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 14px; padding: 18px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04); font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; box-sizing: border-box; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 800; color: ${titleColor}; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                ⏱️ Pomodoro (${isWork ? 'Estudio' : 'Descanso'})
              </span>
              <div style="display: flex; gap: 6px;">
                <button id="pomo-view-stats" style="background: rgba(0,0,0,0.06); border: none; border-radius: 6px; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;" title="Métricas">📊</button>
                <button id="pomo-view-settings" style="background: rgba(0,0,0,0.06); border: none; border-radius: 6px; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;" title="Configuración">⚙️</button>
              </div>
            </div>

            ${bannerHtml}
            ${sharedNoteHtml}

            <div style="display: flex; gap: 6px; margin-bottom: 10px;">
              <button id="pomo-mode-work" ${bloqueado ? 'disabled' : ''} style="flex: 1; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; background: ${isWork ? primaryColor : 'rgba(0,0,0,0.06)'}; color: ${isWork ? '#fff' : '#475569'}; transition: 0.2s;">Estudio</button>
              <button id="pomo-mode-break" ${bloqueado ? 'disabled' : ''} style="flex: 1; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; background: ${!isWork ? primaryColor : 'rgba(0,0,0,0.06)'}; color: ${!isWork ? '#fff' : '#475569'}; transition: 0.2s;">Descanso</button>
            </div>

            <div style="display:flex; align-items:center; gap:6px; margin-bottom: 6px;">
              <span style="font-size: 0.72rem; color: #475569; font-weight: 700; white-space: nowrap;">Estudiando:</span>
              <select id="pomo-up-selector" ${(running || bloqueado) ? 'disabled' : ''} style="flex:1; min-width:0; font-size: 0.72rem; font-weight: 700; color: ${titleColor}; background: rgba(255,255,255,0.7); border: 1px solid ${borderColor}; border-radius: 6px; padding: 3px 6px; cursor: ${(running || bloqueado) ? 'not-allowed' : 'pointer'}; font-family: 'Plus Jakarta Sans', sans-serif;" title="${bloqueado ? 'El tema lo define el Host' : (running ? 'Pausá el temporizador para cambiar de UP' : '')}">
                ${buildUpSelectorOptions()}
              </select>
            </div>
          </div>

          <div id="pomo-time" style="text-align: center; font-size: 2.6rem; font-weight: 900; color: ${primaryColor}; letter-spacing: 1px; margin: 8px 0; font-variant-numeric: tabular-nums;">${formatTime(secondsLeft)}</div>

          <div style="display: flex; gap: 6px; justify-content: center;">
            <button id="pomodoro-start" style="flex: 1; background: ${primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.2s;" ${(running || bloqueado) ? 'disabled' : ''}>${running ? 'En marcha' : (engine().getState().status === 'paused' ? 'Continuar' : 'Iniciar')}</button>
            <button id="pomodoro-pause" style="background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 9px 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;" ${(!running || bloqueado) ? 'disabled' : ''}>Pausar</button>
            <button id="pomodoro-reset" ${bloqueado ? 'disabled' : ''} style="background: rgba(255,255,255,0.7); color: ${primaryColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 9px 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;">Reiniciar</button>
          </div>
          ${extraBtnsHtml}
          ${goalHtml}
        </div>
      `;

      if (shouldShowNotifBanner()) {
        containerEl.querySelector('#pomo-notif-enable').addEventListener('click', async () => {
          await Notification.requestPermission();
          render(); 
        });
        containerEl.querySelector('#pomo-notif-dismiss').addEventListener('click', () => {
          localStorage.setItem('nika_pomo_notif_hidden', 'true');
          render();
        });
      }

      containerEl.querySelector('#pomo-up-selector').addEventListener('change', (e) => { switchUpContext(e.target.value); });
      containerEl.querySelector('#pomo-view-stats').addEventListener('click', () => { currentView = 'stats'; render(); });
      containerEl.querySelector('#pomo-view-settings').addEventListener('click', () => { currentView = 'settings'; render(); });
      containerEl.querySelector('#pomo-mode-work').addEventListener('click', () => { engine().reset('work', { moduleId: currentModuleId, upId: currentUpId, upLabel: currentUpLabel }); });
      containerEl.querySelector('#pomo-mode-break').addEventListener('click', () => { engine().reset('break', { moduleId: currentModuleId, upId: currentUpId, upLabel: currentUpLabel }); });
      containerEl.querySelector('#pomodoro-start').addEventListener('click', start);
      containerEl.querySelector('#pomodoro-pause').addEventListener('click', pause);
      containerEl.querySelector('#pomodoro-reset').addEventListener('click', resetTimer);
      const skipBtn = containerEl.querySelector('#pomodoro-skip-break');
      if (skipBtn) skipBtn.addEventListener('click', () => engine().skipBreak());
      const extBtn = containerEl.querySelector('#pomodoro-extend-break');
      if (extBtn) extBtn.addEventListener('click', () => engine().extendBreak(5));
      const finBtn = containerEl.querySelector('#pomodoro-finish');
      if (finBtn) finBtn.addEventListener('click', () => { engine().finishAndSave(); }); // el motor avisa cuánto guardó
      const leaveBtn = containerEl.querySelector('#pomo-shared-leave');
      if (leaveBtn) leaveBtn.addEventListener('click', () => engine().leaveShared({ reason: 'manual' }));

    } else if (currentView === 'stats') {
      const stats = getStats();
      containerEl.innerHTML = `
        <div style="background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 14px; padding: 18px; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; box-sizing: border-box; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 800; color: ${titleColor}; font-size: 0.88rem;">📊 Métricas Aisladas</span>
              <button id="pomo-back-from-stats" style="background: rgba(0,0,0,0.06); border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; color: #334155;">← Volver</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem; color: #334155;">
              <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.7); padding: 9px 12px; border-radius: 8px;">
                <span>📌 En esta Unidad (${String(currentUpId || '').toUpperCase()}):</span>
                <strong style="color: ${primaryColor};">${stats.unit} min</strong>
              </div>
              <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.7); padding: 9px 12px; border-radius: 8px;">
                <span>📚 Total en ${String(currentModuleId || '').toUpperCase()}:</span>
                <strong>${stats.module} min</strong>
              </div>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 0.78rem; color: #334155; background: rgba(255,255,255,0.7); padding: 9px 12px; border-radius: 8px;">
            <div style="font-weight: 800; margin-bottom: 4px;">☕ Descansos</div>
            ${(() => { const b = engine().getBreakStats(); return `<div style="display:flex; justify-content:space-between;"><span>Hoy: ${b.today.taken} tomados</span><strong style="color:${b.today.skipped ? '#c2410c' : '#16a34a'};">${b.today.skipped} salteados</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>Últimos 7 días: ${b.week.taken} tomados</span><strong style="color:${b.week.skipped > b.week.taken ? '#c2410c' : '#334155'};">${b.week.skipped} salteados</strong></div>
              ${b.week.skipped > b.week.taken && b.week.skipped >= 3 ? '<div style="margin-top:4px; font-size:0.7rem; color:#c2410c;">Estás salteando más descansos de los que tomás: descansar también rinde.</div>' : ''}`; })()}
          </div>
          <div style="font-size: 0.68rem; color: #64748b; text-align: center; margin-top: 8px;">Datos sincronizados con la nube.</div>
        </div>
      `;
      containerEl.querySelector('#pomo-back-from-stats').addEventListener('click', () => { currentView = 'timer'; render(); });

    } else if (currentView === 'settings') {
      const prefs = engine().getPrefs();
      const custom = engine().getCustomPreset();
      const chipStyle = `background: rgba(255,255,255,0.8); color: ${titleColor}; border: 1px solid ${borderColor}; border-radius: 99px; padding: 4px 10px; font-size: 0.74rem; font-weight: 800; cursor: pointer;`;
      containerEl.innerHTML = `
        <div style="background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 14px; padding: 18px; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; box-sizing: border-box; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 800; color: ${titleColor}; font-size: 0.88rem;">⚙️ Configurar Tiempos</span>
              <button id="pomo-back-from-settings" style="background: rgba(0,0,0,0.06); border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; color: #334155;">← Volver</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem; color: #334155;">
              <div id="pomo-presets" style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${engine().PRESETS.map((p) => `<button data-w="${p.w}" data-b="${p.b}" style="${chipStyle}">${p.w}/${p.b}</button>`).join('')}
                ${custom ? `<button data-w="${custom.w}" data-b="${custom.b}" style="${chipStyle}" title="Tu preset guardado">⭐ ${custom.w}/${custom.b}</button>` : ''}
                <button id="pomo-save-custom" style="${chipStyle} border-style: dashed;" title="Guarda los minutos de abajo como tu preset">＋ Guardar el mío</button>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;">
                <span>Estudio (min):</span>
                <input type="number" id="input-work-min" value="${getWorkMinutes()}" min="1" max="720" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;">
                <span>Descanso (min):</span>
                <input type="number" id="input-break-min" value="${getBreakMinutes()}" min="1" max="240" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
              <label style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px; cursor: pointer;">
                <span>Descanso automático al terminar</span>
                <input type="checkbox" id="input-auto-break" ${prefs.autoBreak ? 'checked' : ''}>
              </label>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;" title="Solo en bloques de 3 h o más. 0 = desactivadas">
                <span>Micro-pausa cada (min):</span>
                <input type="number" id="input-micro-min" value="${prefs.microMin}" min="0" max="180" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;" title="0 = sin meta">
                <span>Meta diaria (horas):</span>
                <input type="number" id="input-goal-h" value="${prefs.goalMin ? +(prefs.goalMin / 60).toFixed(2) : 0}" min="0" max="24" step="0.5" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
            </div>
          </div>
          <button id="pomo-save-config" style="background: ${primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 0.8rem; cursor: pointer; width: 100%;">Guardar y Reiniciar</button>
        </div>
      `;
      containerEl.querySelector('#pomo-back-from-settings').addEventListener('click', () => { currentView = 'timer'; render(); });
      
      containerEl.querySelectorAll('#pomo-presets button[data-w]').forEach((btn) => btn.addEventListener('click', () => {
        containerEl.querySelector('#input-work-min').value = btn.dataset.w;
        containerEl.querySelector('#input-break-min').value = btn.dataset.b;
      }));
      containerEl.querySelector('#pomo-save-custom').addEventListener('click', () => {
        const w = parseInt(containerEl.querySelector('#input-work-min').value, 10);
        const b = parseInt(containerEl.querySelector('#input-break-min').value, 10);
        if (engine().setCustomPreset(w, b)) { if (typeof showToast === 'function') showToast(`⭐ Preset ${w}/${b} guardado.`, 'success'); render(); }
        else if (typeof showToast === 'function') showToast(`Estudio 1–${engine().MAX_WORK_MIN} min y descanso 1–${engine().MAX_BREAK_MIN} min.`, 'info');
      });

      containerEl.querySelector('#pomo-save-config').addEventListener('click', () => {
        const w = parseInt(containerEl.querySelector('#input-work-min').value, 10);
        const b = parseInt(containerEl.querySelector('#input-break-min').value, 10);
        engine().setPrefs({
          autoBreak: containerEl.querySelector('#input-auto-break').checked,
          microMin: parseInt(containerEl.querySelector('#input-micro-min').value, 10) || 0,
          goalMin: Math.round((parseFloat(containerEl.querySelector('#input-goal-h').value) || 0) * 60),
        });
        const E = engine();
        if (w > 0) localStorage.setItem('nika_pomo_w_mins', Math.min(w, E.MAX_WORK_MIN));
        if (b > 0) localStorage.setItem('nika_pomo_b_mins', Math.min(b, E.MAX_BREAK_MIN));
        currentView = 'timer';
        resetTimer();
      });
    }
  }

  function start() {
    engine().start({ moduleId: currentModuleId, upId: currentUpId, upLabel: currentUpLabel });
  }
  function pause() { engine().pause(); }
  function resetTimer() {
    engine().reset(undefined, { moduleId: currentModuleId, upId: currentUpId, upLabel: currentUpLabel });
  }

  // Solo refresca los números (cada segundo), sin redibujar todo el panel
  function updateClock() {
    if (!containerEl) return;
    const el = containerEl.querySelector('#pomo-time');
    if (el) el.textContent = formatTime(getSecondsLeft());
  }

  function open(moduleId, upId, upLabel, containerId = 'pomodoro-placeholder') {
    containerEl = document.getElementById(containerId);
    if (!containerEl) return;
    if (!window.PomodoroEngine) { console.error('[Pomodoro] Falta cargar js/pomodoroEngine.js'); return; }

    currentModuleId = moduleId;
    currentUpId = upId;
    currentUpLabel = upLabel || upId;
    currentView = 'timer';

    // Si hay un Pomodoro en marcha o en pausa (por ejemplo iniciado en otra UP
    // o en otra página), lo mostramos tal cual, sin reiniciarlo.
    const st = engine().getState();
    if (st.status !== 'idle' && st.upId) {
      currentModuleId = st.moduleId || moduleId;
      currentUpId = st.upId;
      currentUpLabel = st.upLabel || st.upId;
    } else {
      engine().reset('work', { moduleId: currentModuleId, upId: currentUpId, upLabel: currentUpLabel });
    }

    if (unsubTick) unsubTick();
    if (unsubChange) unsubChange();
    unsubTick = engine().on('tick', updateClock);
    unsubChange = engine().on('change', () => {
      if (containerEl && document.body.contains(containerEl)) {
        try { render(); } catch (e) { console.error('[Pomodoro] render:', e); }
      }
    });

    // Un fallo al dibujar NO debe cortar el resto de la página (notas, cronograma).
    try { render(); } catch (e) { console.error('[Pomodoro] render inicial:', e); }
    syncStatsFromSupabase();
  }

  // Ya NO frena el timer: solo suelta la UI. El motor sigue corriendo.
  function destroy() {
    if (unsubTick) { unsubTick(); unsubTick = null; }
    if (unsubChange) { unsubChange(); unsubChange = null; }
    containerEl = null;
  }

  return { open, destroy };
})();
