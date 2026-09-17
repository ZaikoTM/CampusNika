// js/productivity/pomodoro.js
// Módulo Pomodoro Profesional con Aislamiento Estricto de Métricas por Unidad y Módulo

const PomodoroModule = (() => {
  let workMinutes = 25;
  let breakMinutes = 5;
  let secondsLeft = workMinutes * 60;
  let mode = 'work'; // 'work' | 'break'
  let currentView = 'timer'; // 'timer' | 'stats' | 'settings'
  let intervalId = null;
  let isRunning = false;

  let currentModuleId = null;
  let currentUpId = null;
  let currentUpLabel = null;
  let containerEl = null;

  function playAlertSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const playTone = (freq, delay) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }, delay);
      };
      playTone(587.33, 0);
      playTone(880, 200);
    } catch (e) {}
  }

  // Arma las opciones del selector "Estudiando: [ UP X ▼ ]" a partir de las
  // unidades ya cargadas por estudio.js (EstudioState global). Si por algún
  // motivo estudio.js no está en la página, degradamos a una sola opción fija
  // con la UP actual para no romper el render.
  function buildUpSelectorOptions() {
    const hasEstudioState = typeof EstudioState !== 'undefined' && EstudioState.data && EstudioState.data.units;

    if (!hasEstudioState) {
      const label = currentUpLabel || currentUpId || 'Sin UP';
      return `<option value="${currentUpId || ''}" selected>${label}</option>`;
    }

    return EstudioState.data.units.map(unit => {
      const selected = unit.id === currentUpId ? 'selected' : '';
      return `<option value="${unit.id}" ${selected}>UP${unit.number} · ${unit.title}</option>`;
    }).join('');
  }

  // Cambia el contexto del temporizador a otra UP sin recargar la página.
  // Reinicia el conteo para no mezclar minutos de una UP con otra.
  function switchUpContext(newUpId) {
    if (!newUpId || newUpId === currentUpId) return;

    const hasEstudioState = typeof EstudioState !== 'undefined' && EstudioState.unitsById;
    const unit = hasEstudioState ? EstudioState.unitsById[newUpId] : null;

    currentUpId = newUpId;
    currentUpLabel = unit ? unit.title : newUpId;

    resetTimer();
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Aislamiento estricto de estadísticas: filtra únicamente por módulo y unidad actual
  function getStats() {
    if (!currentModuleId || !currentUpId) return { unit: 0, module: 0 };

    // 1. Tiempo específico de ESTA unidad problema
    const unitKey = `nika_time_${currentModuleId}_${currentUpId}`;
    const unitMinutes = parseInt(localStorage.getItem(unitKey) || '0', 10);

    // 2. Tiempo total acumulado de TODO el módulo actual (ej. todas las UPs de Cirugía)
    let moduleMinutes = 0;
    const modulePrefix = `nika_time_${currentModuleId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(modulePrefix)) {
        const val = parseInt(localStorage.getItem(key) || '0', 10);
        if (!isNaN(val)) moduleMinutes += val;
      }
    }

    return {
      unit: unitMinutes,
      module: moduleMinutes
    };
  }

  function registerStudyTime(secondsToAdd) {
    if (!currentModuleId || !currentUpId) return;
    const key = `nika_time_${currentModuleId}_${currentUpId}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const addedMins = Math.floor(secondsToAdd / 60);
    localStorage.setItem(key, (prev + addedMins).toString());

    // Persistencia real en Supabase, asociada al usuario autenticado
    registerStudySessionInSupabase(addedMins);
  }

  async function registerStudySessionInSupabase(durationMinutes) {
    try {
      if (typeof supabaseClient === 'undefined') return;
      if (!window.NikaAuth || !window.NikaAuth.ready) return;

      const userId = await window.NikaAuth.ready;
      if (!userId) {
        console.warn('[Pomodoro] Sin sesión activa, el ciclo no se registra en Supabase (solo local).');
        return;
      }

      const { error } = await supabaseClient
        .from('study_sessions')
        .insert({
          user_id: userId,
          modulo: currentModuleId,
          up_id: currentUpId,
          duration_minutes: durationMinutes,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('[Pomodoro] Error al registrar sesión en Supabase:', error);
      }
    } catch (err) {
      console.error('[Pomodoro] Excepción al registrar sesión:', err);
    }
  }

  function render() {
    if (!containerEl) return;
    const isWork = mode === 'work';
    const cardBg = isWork 
      ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' 
      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
    const borderColor = isWork ? 'rgba(244, 63, 94, 0.25)' : 'rgba(34, 197, 94, 0.25)';
    const primaryColor = isWork ? '#e11d48' : '#16a34a';
    const titleColor = isWork ? '#9f1239' : '#166534';

    if (currentView === 'timer') {
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

            <div style="display: flex; gap: 6px; margin-bottom: 10px;">
              <button id="pomo-mode-work" style="flex: 1; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; background: ${isWork ? primaryColor : 'rgba(0,0,0,0.06)'}; color: ${isWork ? '#fff' : '#475569'}; transition: 0.2s;">Estudio</button>
              <button id="pomo-mode-break" style="flex: 1; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer; background: ${!isWork ? primaryColor : 'rgba(0,0,0,0.06)'}; color: ${!isWork ? '#fff' : '#475569'}; transition: 0.2s;">Descanso</button>
            </div>

            <div style="display:flex; align-items:center; gap:6px; margin-bottom: 6px;">
              <span style="font-size: 0.72rem; color: #475569; font-weight: 700; white-space: nowrap;">Estudiando:</span>
              <select id="pomo-up-selector" ${isRunning ? 'disabled' : ''} style="flex:1; min-width:0; font-size: 0.72rem; font-weight: 700; color: ${titleColor}; background: rgba(255,255,255,0.7); border: 1px solid ${borderColor}; border-radius: 6px; padding: 3px 6px; cursor: ${isRunning ? 'not-allowed' : 'pointer'}; font-family: 'Plus Jakarta Sans', sans-serif;" title="${isRunning ? 'Pausá el temporizador para cambiar de UP' : ''}">
                ${buildUpSelectorOptions()}
              </select>
            </div>
          </div>

          <div style="text-align: center; font-size: 2.6rem; font-weight: 900; color: ${primaryColor}; letter-spacing: 1px; margin: 8px 0; font-variant-numeric: tabular-nums;">${formatTime(secondsLeft)}</div>

          <div style="display: flex; gap: 6px; justify-content: center;">
            <button id="pomodoro-start" style="flex: 1; background: ${primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.2s;" ${isRunning ? 'disabled' : ''}>${isRunning ? 'En marcha' : 'Iniciar'}</button>
            <button id="pomodoro-pause" style="background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 9px 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;" ${!isRunning ? 'disabled' : ''}>Pausar</button>
            <button id="pomodoro-reset" style="background: rgba(255,255,255,0.7); color: ${primaryColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 9px 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer;">Reiniciar</button>
          </div>
        </div>
      `;

      containerEl.querySelector('#pomo-up-selector').addEventListener('change', (e) => { switchUpContext(e.target.value); });
      containerEl.querySelector('#pomo-view-stats').addEventListener('click', () => { currentView = 'stats'; render(); });
      containerEl.querySelector('#pomo-view-settings').addEventListener('click', () => { currentView = 'settings'; render(); });
      containerEl.querySelector('#pomo-mode-work').addEventListener('click', () => { mode = 'work'; resetTimer(); });
      containerEl.querySelector('#pomo-mode-break').addEventListener('click', () => { mode = 'break'; resetTimer(); });
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
                <span>📌 En esta Unidad (${currentUpId.toUpperCase()}):</span>
                <strong style="color: ${primaryColor};">${stats.unit} min</strong>
              </div>
              <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.7); padding: 9px 12px; border-radius: 8px;">
                <span>📚 Total en ${currentModuleId.toUpperCase()}:</span>
                <strong>${stats.module} min</strong>
              </div>
            </div>
          </div>
          <div style="font-size: 0.68rem; color: #64748b; text-align: center;">Sin mezcla de datos entre unidades o materias.</div>
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
                <input type="number" id="input-work-min" value="${workMinutes}" min="1" max="120" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px;">
                <span>Descanso (min):</span>
                <input type="number" id="input-break-min" value="${breakMinutes}" min="1" max="60" style="width: 55px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: 700;">
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
        if (w > 0) workMinutes = w;
        if (b > 0) breakMinutes = b;
        currentView = 'timer';
        resetTimer();
      });
    }
  }

  // Traduce el modo interno ('work'/'break') a las etiquetas que espera
  // PomodoroSyncManager / campus.html ('Enfoque'/'Descanso').
  function _faseParaPresence() {
    return mode === 'work' ? 'Enfoque' : 'Descanso';
  }

  function _reportarPresence(pomodoroActivo) {
    if (window.PomodoroSyncManager) {
      window.PomodoroSyncManager.actualizarEstado({
        pomodoroActivo,
        faseActual: _faseParaPresence()
      });
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    render();
    _reportarPresence(true);

    intervalId = setInterval(() => {
      secondsLeft--;
      render();

      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        isRunning = false;
        playAlertSound();
        handleCycleComplete();
      }
    }, 1000);
  }

  function pause() {
    clearInterval(intervalId);
    isRunning = false;
    render();
    _reportarPresence(false);
  }

  function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    secondsLeft = (mode === 'work' ? workMinutes : breakMinutes) * 60;
    render();
    _reportarPresence(false);
  }

  function handleCycleComplete() {
    if (mode === 'work') {
      registerStudyTime(workMinutes * 60);
      alert('🔔 ¡Tiempo de estudio finalizado! Es hora de un descanso.');
      mode = 'break';
    } else {
      alert('🔔 ¡Descanso terminado! Volvemos al estudio.');
      mode = 'work';
    }
    secondsLeft = (mode === 'work' ? workMinutes : breakMinutes) * 60;
    render();
    // El ciclo recién completado deja el timer detenido hasta que el usuario
    // le dé Play a la fase siguiente.
    _reportarPresence(false);
  }

  function open(moduleId, upId, upLabel, containerId = 'pomodoro-placeholder') {
    currentModuleId = moduleId;
    currentUpId = upId;
    currentUpLabel = upLabel || upId;
    containerEl = document.getElementById(containerId);
    if (!containerEl) return;

    mode = 'work';
    currentView = 'timer';
    secondsLeft = workMinutes * 60;
    render();
    _reportarPresence(false);
  }

  function destroy() {
    clearInterval(intervalId);
    isRunning = false;
    containerEl = null;
    _reportarPresence(false);
  }

  return { open, destroy };
})();