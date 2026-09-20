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

  function render() {
    if (!containerEl) return;
    const mode = getMode();
    const secondsLeft = getSecondsLeft();
    const running = isRunning();
    const isWork = mode === 'work';
    const cardBg = isWork 
      ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' 
      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
    const borderColor = isWork ? 'rgba(244, 63, 94, 0.25)' : 'rgba(34, 197, 94, 0.25)';
    const primaryColor = isWork ? '#e11d48' : '#16a34a';
    const titleColor = isWork ? '#9f1239' : '#166534';

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

            <div style="display: flex; gap: 6px; margin-bottom: 10px;">
              <button id="pomo-mode-work" style="flex: 1; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; background: ${isWork ? primaryColor : 'rgba(0,0,0,0.06)'}; color: ${isWork ? '#fff' : '#475569'}; transition: 0.2s;">Estudio</button>
              <button id="pomo-mode-break" style="flex: 1; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; background: ${!isWork ? primaryColor : 'rgba(0,0,0,0.06)'}; color: ${!isWork ? '#fff' : '#475569'}; transition: 0.2s;">Descanso</button>
            </div>

            <div style="display:flex; align-items:center; gap:6px; margin-bottom: 6px;">
              <span style="font-size: 0.72rem; color: #475569; font-weight: 700; white-space: nowrap;">Estudiando:</span>
              <select id="pomo-up-selector" ${running ? 'disabled' : ''} style="flex:1; min-width:0; font-size: 0.72rem; font-weight: 700; color: ${titleColor}; background: rgba(255,255,255,0.7); border: 1px solid ${borderColor}; border-radius: 6px; padding: 3px 6px; cursor: ${running ? 'not-allowed' : 'pointer'}; font-family: 'Plus Jakarta Sans', sans-serif;" title="${running ? 'Pausá el temporizador para cambiar de UP' : ''}">
                ${buildUpSelectorOptions()}
              </select>
            </div>
          </div>

          <div id="pomo-time" style="text-align: center; font-size: 2.6rem; font-weight: 900; color: ${primaryColor}; letter-spacing: 1px; margin: 8px 0; font-variant-numeric: tabular-nums;">${formatTime(secondsLeft)}</div>

          <div style="display: flex; gap: 6px; justify-content: center;">
            <button id="pomodoro-start" style="flex: 1; background: ${primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.2s;" ${running ? 'disabled' : ''}>${running ? 'En marcha' : (engine().getState().status === 'paused' ? 'Continuar' : 'Iniciar')}</button>
            <button id="pomodoro-pause" style="background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 9px 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;" ${!running ? 'disabled' : ''}>Pausar</button>
            <button id="pomodoro-reset" style="background: rgba(255,255,255,0.7); color: ${primaryColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 9px 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;">Reiniciar</button>
          </div>
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
          <div style="font-size: 0.68rem; color: #64748b; text-align: center;">Datos sincronizados con la nube.</div>
        </div>
      `;
      containerEl.querySelector('#pomo-back-from-stats').addEventListener('click', () => { currentView = 'timer'; render(); });

    } else if (currentView === 'settings') {
      containerEl.innerHTML = `
        <div style="background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 14px; padding: 18px; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; box-sizing: border-box; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 800; color: ${titleColor}; font-size: 0.88rem;">⚙️ Configurar Tiempos</span>
              <button id="pomo-back-from-settings" style="background: rgba(0,0,0,0.06); border: none; border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; color: #334155;">← Volver</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem; color: #334155;">
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;">
                <span>Estudio (min):</span>
                <input type="number" id="input-work-min" value="${getWorkMinutes()}" min="1" max="120" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;">
                <span>Descanso (min):</span>
                <input type="number" id="input-break-min" value="${getBreakMinutes()}" min="1" max="60" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
            </div>
          </div>
          <button id="pomo-save-config" style="background: ${primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 0.8rem; cursor: pointer; width: 100%;">Guardar y Reiniciar</button>
        </div>
      `;
      containerEl.querySelector('#pomo-back-from-settings').addEventListener('click', () => { currentView = 'timer'; render(); });
      
      containerEl.querySelector('#pomo-save-config').addEventListener('click', () => {
        const w = parseInt(containerEl.querySelector('#input-work-min').value, 10);
        const b = parseInt(containerEl.querySelector('#input-break-min').value, 10);
        if (w > 0) localStorage.setItem('nika_pomo_w_mins', w);
        if (b > 0) localStorage.setItem('nika_pomo_b_mins', b);
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
    unsubChange = engine().on('change', () => { if (containerEl && document.body.contains(containerEl)) render(); });

    render();
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
