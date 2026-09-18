// js/productivity/pomodoro.js
// Módulo Pomodoro Profesional Sincronizado en la Nube (Blindado + Campana por Hardware Inbloqueable)

const PomodoroModule = (() => {
  // Leemos la configuración guardada por el usuario (o usamos 25/5 por defecto)
  let workMinutes = parseInt(localStorage.getItem('nika_pomo_w_mins') || '25', 10);
  let breakMinutes = parseInt(localStorage.getItem('nika_pomo_b_mins') || '5', 10);
  
  let secondsLeft = workMinutes * 60;
  let mode = 'work';
  let currentView = 'timer';
  let intervalId = null;
  let isRunning = false;

  let currentModuleId = null;
  let currentUpId = null;
  let currentUpLabel = null;
  let containerEl = null;

  // 1. MOTOR DE AUDIO POR HARDWARE (Anti-Bloqueo de Pestañas en Segundo Plano)
  let audioCtx = null;

  function initAudio() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {}
  }

  function playAlertSound() {
    try {
        initAudio();
        const t = audioCtx.currentTime;
        
        // Frecuencias armónicas para simular una campana de escritorio/boxeo
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; 
        
        // PRIMER GOLPE DE CAMPANA
        frequencies.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = index === 0 ? 'sine' : 'triangle'; 
            osc.frequency.setValueAtTime(freq, t);
            
            // Volumen: Ataque instantáneo muy fuerte y desvanecimiento progresivo (eco)
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(1.2 / frequencies.length, t + 0.02); 
            gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5); 
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(t);
            osc.stop(t + 3.0);
        });
        
        // SEGUNDO GOLPE RÁPIDO (Ding-Ding)
        setTimeout(() => {
            if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            const t2 = audioCtx.currentTime;
            frequencies.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = index === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, t2);
                gain.gain.setValueAtTime(0, t2);
                gain.gain.linearRampToValueAtTime(1.2 / frequencies.length, t2 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t2 + 2.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(t2);
                osc.stop(t2 + 3.0);
            });
        }, 300);

    } catch (e) {
        console.warn("Error en el audio nativo:", e);
    }
  }

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
    if (!hasEstudioState) {
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
    resetTimer();
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

  function registerStudyTime(secondsToAdd) {
    if (!currentModuleId || !currentUpId) return;
    const key = `nika_time_${currentModuleId}_${currentUpId}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const addedMins = Math.floor(secondsToAdd / 60);
    
    localStorage.setItem(key, (prev + addedMins).toString());
    registerStudySessionInSupabase(addedMins);
  }

  async function registerStudySessionInSupabase(durationMinutes) {
    try {
      const client = getDbClient();
      if (!client) return;
      
      const user = await getSessionUser();
      if (!user) return; 

      const { error } = await client
        .from('study_sessions')
        .insert({
          user_id: user.id,
          modulo: currentModuleId,
          up_id: currentUpId,
          duration_minutes: durationMinutes,
          completed_at: new Date().toISOString()
        });

      if (error) console.error('[Pomodoro] Error al subir registro a Supabase:', error);
    } catch (err) {
      console.error('[Pomodoro] Excepción al registrar sesión en la nube:', err);
    }
  }

  function shouldShowNotifBanner() {
    if (!("Notification" in window)) return false;
    if (Notification.permission !== "default") return false;
    if (localStorage.getItem('nika_pomo_notif_hidden') === 'true') return false;
    return true;
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
        if (w > 0) {
            workMinutes = w;
            localStorage.setItem('nika_pomo_w_mins', w);
        }
        if (b > 0) {
            breakMinutes = b;
            localStorage.setItem('nika_pomo_b_mins', b);
        }
        currentView = 'timer';
        resetTimer();
      });
    }
  }

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

    // Inicializa y desbloquea el hardware de audio al hacer clic
    initAudio();

    isRunning = true;
    render();
    _reportarPresence(true);

    intervalId = setInterval(() => {
      secondsLeft--;
      render();

      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        isRunning = false;
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
    const wasWork = mode === 'work';
    
    // Ejecuta la campana generada por la placa de sonido
    playAlertSound();

    if (wasWork) {
      registerStudyTime(workMinutes * 60);
      if (typeof showToast === 'function') showToast('🔔 ¡Tiempo finalizado! Inicia tu descanso.', 'success');
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("¡Tiempo de estudio finalizado!", { body: "Buen trabajo. Es hora de tu descanso." });
      }
      mode = 'break';
    } else {
      if (typeof showToast === 'function') showToast('🔔 ¡Descanso terminado! Volvemos al estudio.', 'success');
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("¡Descanso terminado!", { body: "Volvé a la pestaña de Campus Nika para seguir enfocándote." });
      }
      mode = 'work';
    }
    
    secondsLeft = (mode === 'work' ? workMinutes : breakMinutes) * 60;
    render();
    _reportarPresence(false);

    // Arranca la siguiente fase en automático después de 2 segundos
    setTimeout(() => {
      start();
    }, 2000);
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
    
    syncStatsFromSupabase();
  }

  function destroy() {
    clearInterval(intervalId);
    isRunning = false;
    containerEl = null;
    _reportarPresence(false);
  }

  return { open, destroy };
})();