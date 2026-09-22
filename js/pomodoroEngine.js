// js/pomodoroEngine.js
// Motor GLOBAL del Pomodoro de Campus Nika.
//
// Se carga en TODAS las páginas del campus (campus.html, estudio.html, etc.).
// Es el único dueño del temporizador: la UI (js/productivity/pomodoro.js) solo
// dibuja y le manda órdenes (iniciar / pausar / reiniciar).
//
// Qué resuelve:
//  1. El tiempo se calcula contra una HORA DE FIN (targetEnd) y no restando 1
//     por tick, así que no se atrasa aunque el navegador frene la pestaña.
//  2. El estado vive en localStorage: sigue corriendo al cambiar de página o
//     de pestaña dentro de Campus Nika, y se recupera al recargar.
//  3. Muestra el tiempo restante en el título de la pestaña del navegador.
//  4. Al terminar una fase suena la campana, avisa y (si era estudio) registra
//     la sesión en Supabase (tabla study_sessions), esté la UI abierta o no.
//     Si un bloque de estudio se interrumpe con >= 5 min cumplidos, también se guarda
//     (como sesión parcial, completed = false).
//  5. El tick corre en un Web Worker: Chrome/Brave/Edge reducen los timers de
//     las pestañas ocultas (hasta 1 vez por minuto), los workers no.

const PomodoroEngine = (() => {
  const STATE_KEY = 'nika_pomo_state';
  const DONE_KEY = 'nika_pomo_last_done';   // evita doble registro entre pestañas
  const GRACE_MS = 2 * 60 * 1000;           // si al volver pasaron >2 min del fin, se descarta
  const AUTO_NEXT_DELAY_MS = 2000;
  const MIN_PARTIAL_MIN = 5;                // un bloque de estudio interrumpido se guarda si llegó a >= 5 min

  const baseTitle = document.title;
  const listeners = { tick: [], change: [], complete: [] };

  let worker = null;
  let fallbackInterval = null;
  let audioCtx = null;

  // ------------------------------------------------------------
  // Configuración de minutos (la edita el usuario en ⚙️)
  // ------------------------------------------------------------
  function getMinutes(mode) {
    const key = mode === 'work' ? 'nika_pomo_w_mins' : 'nika_pomo_b_mins';
    const def = mode === 'work' ? 25 : 5;
    const v = parseInt(localStorage.getItem(key) || String(def), 10);
    return v > 0 ? v : def;
  }

  // ------------------------------------------------------------
  // Estado persistido
  //   status: 'idle' | 'running' | 'paused'
  //   mode: 'work' | 'break'
  //   targetEnd: timestamp (ms) de fin, solo si running
  //   remainingMs: lo que faltaba al pausar, solo si paused
  //   durationMin: minutos configurados para esta fase
  //   moduleId / upId / upLabel: qué se está estudiando
  // ------------------------------------------------------------
  function idleState(mode, ctx) {
    return {
      status: 'idle',
      mode,
      targetEnd: null,
      remainingMs: getMinutes(mode) * 60 * 1000,
      durationMin: getMinutes(mode),
      moduleId: (ctx && ctx.moduleId) || null,
      upId: (ctx && ctx.upId) || null,
      upLabel: (ctx && ctx.upLabel) || null,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.mode && s.status) return s;
      }
    } catch (_) {}
    return idleState('work');
  }

  let state = loadState();

  function saveState(silent) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_) {}
    if (!silent) emit('change', getState());
  }

  function emit(evt, payload) {
    listeners[evt].forEach((cb) => { try { cb(payload); } catch (e) { console.error('[PomodoroEngine]', e); } });
  }

  function getState() { return { ...state, remainingSeconds: getRemainingSeconds() }; }

  function getRemainingSeconds() {
    if (state.status === 'running') return Math.max(0, Math.ceil((state.targetEnd - Date.now()) / 1000));
    return Math.max(0, Math.ceil((state.remainingMs || 0) / 1000));
  }

  // ------------------------------------------------------------
  // Audio (campana). initAudio() debe llamarse desde un clic del usuario
  // para que el navegador permita sonar después con la pestaña en segundo plano.
  // ------------------------------------------------------------
  function initAudio() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) {}
  }

  function playAlertSound() {
    try {
      initAudio();
      if (!audioCtx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      const strike = () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime;
        freqs.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(1.2 / freqs.length, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 3.0);
        });
      };
      strike();
      setTimeout(strike, 300);
    } catch (e) {
      console.warn('[PomodoroEngine] Error de audio:', e);
    }
  }

  // ------------------------------------------------------------
  // Supabase: registrar sesión de estudio completada
  // (usa la tabla que ya existe: user_id, modulo, up_id, duration_minutes, completed_at)
  // ------------------------------------------------------------
  function getDbClient() {
    return window.NikaSupabase?.client || window.NikaSupabase?.supabase || window.supabaseClient || null;
  }

  // Usuario cacheado en el dispositivo (sirve para registrar sesiones estando sin señal)
  function getCachedUserId() {
    try { return JSON.parse(localStorage.getItem('nika_currentUser') || '{}').id || null; } catch (_) { return null; }
  }

  async function resolveUserId() {
    const client = getDbClient();
    if (client && client.auth && navigator.onLine) {
      try {
        const res = await Promise.race([client.auth.getSession(), new Promise((r) => setTimeout(() => r(null), 3000))]);
        if (res && res.data && res.data.session && res.data.session.user) return res.data.session.user.id;
      } catch (_) {}
    }
    return getCachedUserId();
  }

  function isOfflineNow() {
    return window.SyncManager ? window.SyncManager.estaOffline() : !navigator.onLine;
  }

  // Modo Guardia: si no se puede subir ahora, la sesión queda en sync_queue (IndexedDB) y se sube sola.
  async function queueStudySession(row) {
    if (!window.SyncManager) return false;
    try {
      await window.SyncManager.encolar('progreso_estudio', { row });
      if (typeof showToast === 'function') showToast('📴 Sesión guardada en el dispositivo. Se sube sola al volver la señal.', 'success');
      return true;
    } catch (e) {
      console.warn('[PomodoroEngine] No se pudo encolar la sesión:', e && e.message);
      return false;
    }
  }

  // completed = false -> bloque interrumpido (Pomodoro parcial)
  async function registerStudySession(moduleId, upId, minutes, completed = true) {
    if (!moduleId || !upId || !minutes) return;

    // Copia local (la usa la vista de métricas del Pomodoro)
    const key = `nika_time_${moduleId}_${upId}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(prev + minutes));

    try {
      const userId = await resolveUserId();
      if (!userId) return;                                   // sin sesión ni usuario en el dispositivo
      const row = {
        user_id: userId,
        modulo: moduleId,
        up_id: upId,
        duration_minutes: minutes,
        completed,
        completed_at: new Date().toISOString(),
      };

      // Sin conexión: directo a la cola
      if (isOfflineNow()) { await queueStudySession(row); return; }

      const client = getDbClient();
      if (!client || !client.auth) { await queueStudySession(row); return; }

      let { error } = await client.from('study_sessions').insert(row);
      if (error && /completed/i.test(error.message || '')) {
        // La columna 'completed' todavía no existe (falta correr sql/rendimiento.sql):
        // los bloques completos se guardan igual; los parciales no se pueden distinguir, se omiten.
        if (!completed) return;
        const { completed: _omitida, ...sinFlag } = row;
        ({ error } = await client.from('study_sessions').insert(sinFlag));
      }
      if (error) {
        console.error('[PomodoroEngine] Error al guardar la sesión, queda en cola:', error);
        await queueStudySession(row);
      }
    } catch (err) {
      console.error('[PomodoroEngine] Excepción al guardar la sesión:', err);
      // Falla de red típica: intentamos dejarla en cola con el usuario cacheado
      const uid = getCachedUserId();
      if (uid) {
        await queueStudySession({ user_id: uid, modulo: moduleId, up_id: upId, duration_minutes: minutes, completed, completed_at: new Date().toISOString() });
      }
    }
  }

  // ------------------------------------------------------------
  // Presence (Modo Biblioteca)
  // ------------------------------------------------------------
  function reportPresence() {
    if (!window.PomodoroSyncManager) return;
    window.PomodoroSyncManager.actualizarEstado({
      pomodoroActivo: state.status === 'running',
      faseActual: state.mode === 'work' ? 'Enfoque' : 'Descanso',
      tiempoTotal: state.durationMin,          // minutos configurados por el host para esta fase
      tiempoRestante: getRemainingSeconds(),   // segundos que le quedan AHORA MISMO
    });
  }

  // ------------------------------------------------------------
  // Título de la pestaña
  // ------------------------------------------------------------
  function fmt(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateTitle() {
    if (state.status === 'idle') { document.title = baseTitle; return; }
    const icon = state.mode === 'work' ? '📚' : '☕';
    const label = state.mode === 'work' ? 'Estudio' : 'Descanso';
    const paused = state.status === 'paused' ? '⏸ ' : '';
    document.title = `${paused}(${fmt(getRemainingSeconds())}) ${icon} ${label} · Campus Nika`;
  }

  // ------------------------------------------------------------
  // Tick
  // ------------------------------------------------------------
  function startTicking() {
    if (worker || fallbackInterval) return;
    try {
      const code = 'setInterval(function(){postMessage(1)},1000)';
      worker = new Worker(URL.createObjectURL(new Blob([code], { type: 'application/javascript' })));
      worker.onmessage = onTick;
    } catch (_) {
      fallbackInterval = setInterval(onTick, 1000);
    }
  }

  function stopTicking() {
    if (worker) { worker.terminate(); worker = null; }
    if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; }
  }

  function onTick() {
    if (state.status !== 'running') { stopTicking(); return; }
    const remaining = getRemainingSeconds();
    updateTitle();
    emit('tick', remaining);
    if (state.targetEnd - Date.now() <= 0) completePhase();
  }

  // ------------------------------------------------------------
  // Fin de fase
  // ------------------------------------------------------------
  function completePhase() {
    const finishedEnd = state.targetEnd;

    // Otra pestaña de Campus Nika puede haber procesado ya este mismo fin.
    if (localStorage.getItem(DONE_KEY) === String(finishedEnd)) { syncFromStorage(); return; }
    localStorage.setItem(DONE_KEY, String(finishedEnd));

    const wasWork = state.mode === 'work';
    const finished = { mode: state.mode, minutes: state.durationMin, moduleId: state.moduleId, upId: state.upId };

    playAlertSound();

    if (wasWork) {
      registerStudySession(finished.moduleId, finished.upId, finished.minutes);
      if (typeof showToast === 'function') showToast('🔔 ¡Tiempo finalizado! Inicia tu descanso.', 'success');
      notify('¡Tiempo de estudio finalizado!', 'Buen trabajo. Es hora de tu descanso.');
    } else {
      if (typeof showToast === 'function') showToast('🔔 ¡Descanso terminado! Iniciá el estudio cuando quieras.', 'success');
      notify('¡Descanso terminado!', 'Cuando estés listo, iniciá un nuevo bloque de estudio en Campus Nika.');
    }

    const nextMode = wasWork ? 'break' : 'work';
    state = idleState(nextMode, state);
    saveState();
    updateTitle();
    stopTicking();
    reportPresence();
    emit('complete', finished);

    // Estudio -> Descanso: arranca solo a los 2 segundos.
    // Descanso -> Estudio: NO arranca solo; el usuario lo inicia manualmente.
    if (wasWork) {
      setTimeout(() => {
        if (state.status === 'idle' && state.mode === nextMode) start();
      }, AUTO_NEXT_DELAY_MS);
    }
  }

  function notify(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
    } catch (_) {}
  }

  // ------------------------------------------------------------
  // API pública
  // ------------------------------------------------------------
  function start(ctx) {
    if (state.status === 'running') return;
    initAudio();

    if (ctx) {
      state.moduleId = ctx.moduleId || state.moduleId;
      state.upId = ctx.upId || state.upId;
      state.upLabel = ctx.upLabel || state.upLabel;
    }
    const remainingMs = state.status === 'paused' ? state.remainingMs : getMinutes(state.mode) * 60 * 1000;
    state.durationMin = getMinutes(state.mode);
    state.targetEnd = Date.now() + remainingMs;
    state.status = 'running';
    saveState();
    updateTitle();
    startTicking();
    reportPresence();
  }

  // Arranca el motor ya en curso, con la duración y el tiempo restante que
  // reportó el host (Modo Biblioteca). A diferencia de start(), no recalcula
  // los minutos desde configuración: usa los valores reales que le pasan.
  function startSynced(totalMin, restanteSec, ctx) {
    if (state.status === 'running') return;
    initAudio();

    if (ctx) {
      state.moduleId = ctx.moduleId || state.moduleId;
      state.upId = ctx.upId || state.upId;
      state.upLabel = ctx.upLabel || state.upLabel;
    }

    const mins = Number.isFinite(totalMin) && totalMin > 0 ? totalMin : getMinutes('work');
    const remainingSec = Number.isFinite(restanteSec) && restanteSec >= 0 ? restanteSec : mins * 60;

    state.mode = 'work';
    state.durationMin = mins;
    state.targetEnd = Date.now() + remainingSec * 1000;
    state.status = 'running';
    saveState();
    updateTitle();
    startTicking();
    reportPresence();
  }

  function pause() {
    if (state.status !== 'running') return;
    state.remainingMs = Math.max(0, state.targetEnd - Date.now());
    state.targetEnd = null;
    state.status = 'paused';
    saveState();
    updateTitle();
    stopTicking();
    reportPresence();
  }

  // Si se interrumpe un bloque de ESTUDIO (reiniciar, cambiar de fase o de UP, cerrar
  // sesión) con al menos MIN_PARTIAL_MIN minutos cumplidos, ese tiempo se guarda igual.
  function savePartialIfNeeded() {
    if (state.mode !== 'work' || (state.status !== 'running' && state.status !== 'paused')) return;
    if (!state.moduleId || !state.upId) return;
    const totalMs = (state.durationMin || getMinutes('work')) * 60 * 1000;
    const remainingMs = state.status === 'running'
      ? Math.max(0, state.targetEnd - Date.now())
      : Math.max(0, state.remainingMs || 0);
    const minutes = Math.floor((totalMs - remainingMs) / 60000);
    if (minutes < MIN_PARTIAL_MIN) return;
    registerStudySession(state.moduleId, state.upId, minutes, false);
    if (typeof showToast === 'function') showToast(`⏱ Se guardaron ${minutes} min de estudio.`, 'success');
  }

  // Reinicia la fase actual. `mode` opcional para cambiar Estudio/Descanso.
  function reset(mode, ctx) {
    savePartialIfNeeded();
    const nextMode = mode || state.mode;
    state = idleState(nextMode, { ...state, ...(ctx || {}) });
    saveState();
    updateTitle();
    stopTicking();
    reportPresence();
  }

  function setContext(ctx) {
    state.moduleId = ctx.moduleId || state.moduleId;
    state.upId = ctx.upId || state.upId;
    state.upLabel = ctx.upLabel || state.upLabel;
    saveState(true);
  }

  function on(evt, cb) {
    if (listeners[evt]) listeners[evt].push(cb);
    return () => { listeners[evt] = listeners[evt].filter((f) => f !== cb); };
  }

  // Si otra pestaña cambió el estado, lo reflejamos acá.
  function syncFromStorage() {
    state = loadState();
    updateTitle();
    if (state.status === 'running') startTicking(); else stopTicking();
    emit('change', getState());
  }

  window.addEventListener('storage', (e) => { if (e.key === STATE_KEY) syncFromStorage(); });

  // Al volver a la pestaña recalculamos al instante (sin esperar al próximo tick)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) onTick(); });

  // ------------------------------------------------------------
  // Arranque: recuperar un timer que quedó corriendo
  // ------------------------------------------------------------
  (function init() {
    if (state.status === 'running') {
      const overdue = Date.now() - state.targetEnd;
      if (overdue > GRACE_MS) {
        // El navegador estuvo cerrado mucho después del fin: no contamos esa sesión.
        state = idleState(state.mode === 'work' ? 'break' : 'work', state);
        saveState(true);
      } else {
        startTicking();
        onTick();
        reportPresence();
        return;
      }
    }
    updateTitle();
  })();

  return { start, pause, reset, setContext, getState, getRemainingSeconds, getMinutes, on, initAudio, formatTime: fmt, startSynced };
})();

window.PomodoroEngine = PomodoroEngine;
