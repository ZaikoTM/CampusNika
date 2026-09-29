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
//  6. POMODORO COMPARTIDO (Host / Invitado). El Host es el único dueño del reloj:
//     cada Start / Pause / Stop / fin de fase se publica como un "snapshot" por el
//     canal de la sala (ver pomodoroSyncManager.js) y se repite cada 5 s (latido)
//     para autocorregir mensajes perdidos. El Invitado NO tiene controles: aplica
//     los snapshots del Host (con el tiempo restante RELATIVO, así no depende de
//     que los relojes de los dos dispositivos coincidan). Al cerrar una fase el
//     Host decide los minutos y AMBOS guardan su propia fila en study_sessions
//     (ver NikaRendimiento.registrarSesionCompartida).

const PomodoroEngine = (() => {
  const STATE_KEY = 'nika_pomo_state';
  const DONE_KEY = 'nika_pomo_last_done';   // evita doble registro entre pestañas
  const GRACE_MS = 2 * 60 * 1000;           // pasado este margen el fin se registra en silencio (sin campana)
  const RESCATE_MAX_MS = 12 * 60 * 60 * 1000; // un bloque que terminó hasta 12 h antes de volver igual se contabiliza
  const AUTO_NEXT_DELAY_MS = 2000;
  const MIN_PARTIAL_MIN = 5;                // un bloque de estudio interrumpido se guarda si llegó a >= 5 min
  const SHARED_SYNC_MS = 5000;              // latido del Host hacia el Invitado
  const SHARED_DRIFT_MS = 1500;             // el Invitado solo se reajusta si se desvía más que esto
  const SHARED_DONE_KEY = 'nika_pomo_shared_done'; // sesiones compartidas ya guardadas (anti-duplicado)

  const baseTitle = document.title;
  const listeners = { tick: [], change: [], complete: [], shared: [] };

  let worker = null;
  let fallbackInterval = null;
  let audioCtx = null;
  let lastSharedSync = 0;

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
      shared: (ctx && ctx.shared) || null,   // sesión compartida: sobrevive entre fases
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.mode && s.status) { if (!s.shared) s.shared = null; return s; }
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
    try { window.dispatchEvent(new CustomEvent('nika:alerta-sonido')); } catch (_) {} // NikaMusic baja el volumen un momento
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
    const cacheado = getCachedUserId();
    if (cacheado) return cacheado;             // sin esperar a la red: el insert usa la sesión viva igualmente
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
    return (window.SyncManager && typeof window.SyncManager.estaOffline === 'function') ? window.SyncManager.estaOffline() : !navigator.onLine;
  }

  // Cola de respaldo en localStorage. estudio.html (donde se usa el Pomodoro) NO carga SyncManager,
  // así que si el insert fallaba la sesión se perdía. Esta cola es independiente y se drena sola.
  const PENDING_KEY = 'nika_pending_sessions';
  function readPending() { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') || []; } catch (_) { return []; } }
  function writePending(list) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch (_) {} }
  function addPending(row) {
    const list = readPending();
    if (!list.some((r) => r.completed_at === row.completed_at && r.modulo === row.modulo && r.up_id === row.up_id)) {
      list.push({ ...row, synced: false });
      writePending(list);
    }
    console.log('[PomodoroEngine] 💾 Sesión guardada LOCAL (synced:false):', row.completed_at, row.duration_minutes + ' min · pendientes:', list.length);
    renderPendingBadge();
  }

  async function insertRow(client, row) {
    // Idempotente: si ya está en Supabase (respuesta perdida en un intento previo) no se duplica
    try {
      const ya = await client.from('study_sessions').select('user_id', { head: true, count: 'exact' })
        .eq('user_id', row.user_id).eq('completed_at', row.completed_at).eq('modulo', row.modulo).eq('up_id', row.up_id);
      if (!ya.error && (ya.count || 0) > 0) return { error: null };
    } catch (_) {}
    let { error } = await client.from('study_sessions').insert(row);
    if (error && /completed/i.test(error.message || '')) {
      if (!row.completed) return { error: null };
      const { completed: _o, ...sinFlag } = row;
      ({ error } = await client.from('study_sessions').insert(sinFlag));
    }
    if (error && String(error.code) === '23505') return { error: null };   // índice único: ya estaba guardada
    return { error };
  }

  // Aviso visible (esquina inferior izquierda) cuando hay sesiones sin subir. Click = reintentar ahora.
  function renderPendingBadge() {
    try {
      const n = readPending().length;
      let b = document.getElementById('nika-pending-badge');
      if (!n) { if (b) b.remove(); return; }
      if (!document.body) return;
      if (!b) {
        b = document.createElement('button');
        b.id = 'nika-pending-badge';
        b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99999;background:#b45309;color:#fff;border:0;border-radius:20px;padding:8px 14px;font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)';
        b.onclick = () => { b.textContent = '⏳ Reintentando…'; flushPending(); };
        document.body.appendChild(b);
      }
      b.textContent = `⚠️ ${n} sesión${n === 1 ? '' : 'es'} sin subir · tocá para reintentar`;
    } catch (_) {}
  }

  let flushing = false;
  async function flushPending() {
    if (flushing) return;
    const list = readPending();
    renderPendingBadge();
    if (!list.length) return;
    // Cola unificada: si la página tiene el SyncManager real, le pasamos todo y él se ocupa (backoff, badge, IndexedDB).
    if (window.SyncManager && typeof window.SyncManager.encolar === 'function') {
      try {
        for (const r of list) { const { synced: _s, ...row } = r; await window.SyncManager.encolar('progreso_estudio', { row }); }
        writePending([]); renderPendingBadge();
        console.log('[PomodoroEngine] ♻️ Sesiones locales pasadas a la cola de SyncManager:', list.length);
        return;
      } catch (_) { /* si falla seguimos con el flush propio */ }
    }
    if (!navigator.onLine) return;
    const client = getDbClient();
    if (!client || !client.auth) return;
    flushing = true;
    try {
      const { data } = await client.auth.getSession();
      const uid = data && data.session && data.session.user && data.session.user.id;
      if (!uid) return;
      const restantes = [];
      let subidas = 0;
      for (const r of list) {
        if (r.user_id && r.user_id !== uid) { restantes.push(r); continue; }
        const { synced: _s, ...row } = r;
        const { error } = await insertRow(client, { ...row, user_id: uid });
        if (error) { console.warn('[PomodoroEngine] ❌ Reintento falló, sigue synced:false:', error.message); restantes.push(r); }
        else { subidas++; console.log('[PomodoroEngine] ✅ Confirmada en Supabase (rescatada del local):', r.completed_at, r.duration_minutes + ' min'); }
      }
      writePending(restantes);
      renderPendingBadge();
      if (subidas) avisarRendimiento({ origen: 'flush', minutes: 0 });
    } catch (e) { console.warn('[PomodoroEngine] flushPending:', e && e.message); }
    finally { flushing = false; }
  }
  window.addEventListener('online', () => flushPending());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) flushPending(); });
  setInterval(flushPending, 60000);
  setTimeout(flushPending, 2500);
  if (window.SyncManager && typeof window.SyncManager.encolar !== 'function') {
    console.warn('[PomodoroEngine] window.SyncManager existe pero NO es el de syncManager.js. Claves:', Object.keys(window.SyncManager));
  }

  // Modo Guardia: si no se puede subir ahora, la sesión queda en sync_queue (IndexedDB) y se sube sola.
  // Si SyncManager no está en la página (estudio.html) o falla, cae a la cola local de respaldo.
  async function queueStudySession(row) {
    if (window.SyncManager && typeof window.SyncManager.encolar === 'function') {
      try {
        await window.SyncManager.encolar('progreso_estudio', { row });
        console.log('[PomodoroEngine] 💾 Sesión en cola offline (synced:false):', row.completed_at, row.duration_minutes + ' min');
        if (typeof showToast === 'function') showToast('📴 Sesión guardada en el dispositivo. Se sube sola al volver la señal.', 'success');
        return true;
      } catch (e) {
        console.warn('[PomodoroEngine] No se pudo encolar la sesión:', e && e.message);
      }
    }
    addPending(row);
    return true;
  }

  // completed = false -> bloque interrumpido (Pomodoro parcial)
  // Avisa a la UI (esta pestaña y las demás) que cambió el rendimiento. Se llama SIEMPRE al
  // terminar el guardado: si subió a Supabase, si quedó en la cola offline o si falló.
  function avisarRendimiento(detail) {
    try {
      if (window.NikaRendimiento && window.NikaRendimiento.avisarCambio) { window.NikaRendimiento.avisarCambio(detail); return; }
      window.dispatchEvent(new CustomEvent('nika:rendimiento-changed', { detail: detail || {} }));
      window.dispatchEvent(new CustomEvent('nika:estudio-guardado', { detail: detail || {} }));
      // Página sin rendimiento.js (p. ej. sala de estudio): igual avisamos a campus.html en otras pestañas.
      const bc = new BroadcastChannel('nika-rendimiento'); bc.postMessage({ t: Date.now() }); bc.close();
    } catch (_) {}
  }

  async function registerStudySession(moduleId, upId, minutes, completed = true) {
    if (!minutes) return;
    // Un Pomodoro iniciado sin Unidad Problema asignada igual cuenta como tiempo de estudio
    const modulo = moduleId || 'general';
    const up = upId || 'general';
    const completedAt = new Date().toISOString();
    // 1) Se suma al instante en las tarjetas; 2) se guarda; 3) se avisa con el dato real
    let optId = null;
    try { if (window.NikaRendimiento && window.NikaRendimiento.registrarOptimista) optId = window.NikaRendimiento.registrarOptimista({ modulo, up_id: up, duration_minutes: minutes, completed, completed_at: completedAt }); } catch (_) {}
    try { await registerStudySessionCore(modulo, up, minutes, completed, completedAt); }
    finally {
      try { if (optId && window.NikaRendimiento) window.NikaRendimiento.resolverOptimista(optId); } catch (_) {}
      avisarRendimiento({ origen: 'pomodoro', minutes });
    }
  }

  async function registerStudySessionCore(moduleId, upId, minutes, completed = true, completedAt) {
    if (!moduleId || !upId || !minutes) return;

    // Copia local (la usa la vista de métricas del Pomodoro)
    const key = `nika_time_${moduleId}_${upId}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(prev + minutes));

    try {
      const userId = await resolveUserId();
      if (!userId) {
        console.warn('[PomodoroEngine] Sin user_id todavía: se guarda local y se asigna al iniciar sesión.');
        addPending({ modulo: moduleId, up_id: upId, duration_minutes: minutes, completed, completed_at: completedAt || new Date().toISOString() });
        return;
      }
      const row = {
        user_id: userId,
        modulo: moduleId,
        up_id: upId,
        duration_minutes: minutes,
        completed,
        completed_at: completedAt || new Date().toISOString(),
      };

      // Sin conexión: directo a la cola
      if (isOfflineNow()) { await queueStudySession(row); return; }

      const client = getDbClient();
      if (!client || !client.auth) { await queueStudySession(row); return; }

      const { error } = await insertRow(client, row);
      if (error) {
        console.error('[PomodoroEngine] Error al guardar la sesión, queda en cola:', error);
        await queueStudySession(row);
      } else {
        console.log('[PomodoroEngine] ✅ Sesión confirmada en Supabase:', row.completed_at, row.duration_minutes + ' min');
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
  // Pomodoro compartido: helpers
  // ------------------------------------------------------------
  const isGuest = () => !!(state.shared && state.shared.role === 'guest');
  const isHost = () => !!(state.shared && state.shared.role === 'host');
  const sm = () => window.PomodoroSyncManager || null;
  const myUsername = () => (window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername()) || null;

  function newSessionId() {
    try { if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID(); } catch (_) {}
    return 'ps-' + Date.now().toString(36) + '-' + Math.random().toString(16).slice(2, 10);
  }

  // "UP6 · Hemorragias digestivas" — el tema que se muestra en el banner y en Presence.
  // El texto sale de lo que la UI de estudio cargó desde la base (upId + upLabel).
  function formatTema(st) {
    const s = st || state;
    const m = s.upId ? String(s.upId).trim().match(/^(?:up)?\s*0*(\d+)$/i) : null;
    const upCorto = m ? `UP${parseInt(m[1], 10)}` : (s.upId ? String(s.upId) : '');
    const label = s.upLabel && String(s.upLabel) !== String(s.upId) ? String(s.upLabel) : '';
    if (m && label) return `${upCorto} · ${label}`;
    return label || upCorto || '';
  }

  // Anti-duplicado: una sesión compartida (sala + fase + rol) se guarda una sola vez por dispositivo.
  function claimSharedKey(key) {
    if (!key) return true;
    let map = {};
    try { map = JSON.parse(localStorage.getItem(SHARED_DONE_KEY) || '{}') || {}; } catch (_) {}
    if (map[key]) return false;
    map[key] = Date.now();
    const limite = Date.now() - 14 * 24 * 60 * 60 * 1000;
    Object.keys(map).forEach((k) => { if (map[k] < limite) delete map[k]; });
    try { localStorage.setItem(SHARED_DONE_KEY, JSON.stringify(map)); } catch (_) {}
    return true;
  }

  // Delegado en rendimiento.js (dueño de las métricas). Si esa página no lo carga,
  // cae al guardado normal del motor con el mismo anti-duplicado.
  function registerSharedSession(p) {
    if (window.NikaRendimiento && typeof window.NikaRendimiento.registrarSesionCompartida === 'function') {
      return window.NikaRendimiento.registrarSesionCompartida(p).catch((e) => console.error('[PomodoroEngine] Sesión compartida:', e));
    }
    if (!claimSharedKey(p.sharedKey)) return Promise.resolve();
    return registerStudySession(p.moduleId, p.upId, p.minutes, p.completed);
  }

  // Guarda ESTA fase para el usuario local, con las reglas de la sesión compartida:
  //  - Host: minutos reales de la fase.
  //  - Invitado: los mismos minutos, menos lo que llegó tarde (lateMin), para no
  //    acreditarle tiempo que no estudió. Si entró en el primer minuto lateMin = 0
  //    y los dos quedan con EXACTAMENTE los mismos números.
  // Devuelve los minutos que efectivamente se acreditaron (0 = nada).
  function registerSharedPhase(sh, p) {
    if (!p.moduleId || !p.upId || !(p.minutes > 0)) return 0;
    let mins = p.minutes;
    let done = !!p.completed;
    if (sh.role === 'guest' && sh.lateMin > 0) { mins = Math.max(0, mins - sh.lateMin); done = false; }
    if (mins <= 0) return 0;
    if (!done && mins < MIN_PARTIAL_MIN) return 0;
    const phaseSeq = p.phaseSeq != null ? p.phaseSeq : sh.phaseSeq;
    registerSharedSession({
      sharedKey: `${sh.sessionId}:${phaseSeq}:${sh.role}`,
      moduleId: p.moduleId, upId: p.upId, minutes: mins, completed: done,
      role: sh.role, hostUsername: sh.hostUsername, partner: sh.partner,
    });
    return mins;
  }

  // ------------------------------------------------------------
  // Presence (Modo Biblioteca) + publicación a la sala compartida
  // ------------------------------------------------------------
  function currentRemainingMs() {
    return state.status === 'running' ? Math.max(0, state.targetEnd - Date.now()) : Math.max(0, state.remainingMs || 0);
  }

  function buildSnapshot(type, extra) {
    const sh = state.shared;
    return Object.assign({
      sessionId: sh.sessionId,
      seq: Date.now(),                       // orden de mensajes (reloj del Host, siempre creciente)
      phaseSeq: sh.phaseSeq || 0,            // n° de fase: identifica la sesión al guardar
      type,                                  // start | pause | stop | complete | sync
      status: state.status,
      mode: state.mode,
      remainingMs: currentRemainingMs(),     // tiempo RELATIVO: no depende de relojes sincronizados
      durationMin: state.durationMin,
      moduleId: state.moduleId,
      upId: state.upId,
      upLabel: state.upLabel,
      tema: formatTema(),
      hostUsername: sh.hostUsername,
    }, extra || {});
  }

  function publishShared(type, extra) {
    if (!isHost()) return;
    const m = sm();
    if (!m || typeof m.emitirComando !== 'function') return;
    lastSharedSync = Date.now();
    try {
      const p = m.emitirComando(buildSnapshot(type, extra));
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  }

  function reportPresence(type, extra) {
    if (window.PomodoroSyncManager) {
      const p = window.PomodoroSyncManager.actualizarEstado({
        pomodoroActivo: state.status === 'running',
        faseActual: state.mode === 'work' ? 'Enfoque' : 'Descanso',
        tiempoTotal: state.durationMin,          // minutos configurados por el host para esta fase
        tiempoRestante: getRemainingSeconds(),   // segundos que le quedan AHORA MISMO
        tema: formatTema(),
        salaCompartida: state.shared ? state.shared.sessionId : null,
        rolPomodoro: state.shared ? state.shared.role : null,
      });
      if (p && p.catch) p.catch(() => {});
    }
    if (type) publishShared(type, extra);
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
    if (isHost() && Date.now() - lastSharedSync >= SHARED_SYNC_MS) publishShared('sync'); // latido: repara mensajes perdidos
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
    const sh = state.shared ? { ...state.shared } : null;
    const finished = { mode: state.mode, minutes: state.durationMin, moduleId: state.moduleId, upId: state.upId };

    playAlertSound();

    if (wasWork) {
      if (sh) registerSharedPhase(sh, { moduleId: finished.moduleId, upId: finished.upId, minutes: finished.minutes, completed: true });
      else registerStudySession(finished.moduleId, finished.upId, finished.minutes);
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
    // El Host informa el cierre con los minutos oficiales: el Invitado guarda contra ese mismo dato.
    reportPresence('complete', {
      finishedMode: finished.mode, minutes: finished.minutes, completed: true,
      phaseSeq: sh ? sh.phaseSeq : 0, finishedModuleId: finished.moduleId, finishedUpId: finished.upId,
    });
    emit('complete', finished);

    // Estudio -> Descanso: arranca solo a los 2 segundos (lo dispara SOLO el Host o un usuario en solitario;
    // el Invitado recibe ese 'start' por la sala).
    // Descanso -> Estudio: NO arranca solo; el usuario lo inicia manualmente.
    if (wasWork && !isGuest()) {
      setTimeout(() => {
        if (state.status === 'idle' && state.mode === nextMode && !isGuest()) start();
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
    if (isGuest()) return;                 // el Invitado no controla el reloj: solo escucha al Host
    if (state.status === 'running') return;
    initAudio();

    if (ctx) {
      state.moduleId = ctx.moduleId || state.moduleId;
      state.upId = ctx.upId || state.upId;
      state.upLabel = ctx.upLabel || state.upLabel;
    }
    const wasIdle = state.status === 'idle';
    const remainingMs = state.status === 'paused' ? state.remainingMs : getMinutes(state.mode) * 60 * 1000;
    state.durationMin = getMinutes(state.mode);
    state.targetEnd = Date.now() + remainingMs;
    state.status = 'running';
    if (isHost() && wasIdle) state.shared.phaseSeq = (state.shared.phaseSeq || 0) + 1; // fase nueva
    saveState();
    updateTitle();
    startTicking();
    reportPresence('start');
  }

  // Arranca el motor ya en curso, con la duración y el tiempo restante que
  // reportó el host (Modo Biblioteca). A diferencia de start(), no recalcula
  // los minutos desde configuración: usa los valores reales que le pasan.
  // (Legado: el flujo nuevo usa joinShared()).
  function startSynced(totalMin, restanteSec, ctx) {
    if (isGuest()) return;
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
    reportPresence('start');
  }

  function pause() {
    if (isGuest()) return;
    if (state.status !== 'running') return;
    state.remainingMs = Math.max(0, state.targetEnd - Date.now());
    state.targetEnd = null;
    state.status = 'paused';
    saveState();
    updateTitle();
    stopTicking();
    reportPresence('pause');
  }

  // Si se interrumpe un bloque de ESTUDIO (reiniciar, cambiar de fase o de UP, cerrar
  // sesión, salir de una sesión compartida) con al menos MIN_PARTIAL_MIN minutos cumplidos,
  // ese tiempo se guarda igual. Devuelve los minutos acreditados (0 = nada).
  function savePartialIfNeeded() {
    if (state.mode !== 'work' || (state.status !== 'running' && state.status !== 'paused')) return 0;
    if (!state.moduleId || !state.upId) return 0;
    const totalMs = (state.durationMin || getMinutes('work')) * 60 * 1000;
    const remainingMs = state.status === 'running'
      ? Math.max(0, state.targetEnd - Date.now())
      : Math.max(0, state.remainingMs || 0);
    const minutes = Math.floor((totalMs - remainingMs) / 60000);
    if (minutes < MIN_PARTIAL_MIN) return 0;

    let credited = minutes;
    if (state.shared) credited = registerSharedPhase(state.shared, { moduleId: state.moduleId, upId: state.upId, minutes, completed: false });
    else registerStudySession(state.moduleId, state.upId, minutes, false);
    if (credited > 0 && typeof showToast === 'function') showToast(`⏱ Se guardaron ${credited} min de estudio.`, 'success');
    return credited;
  }

  // Reinicia la fase actual. `mode` opcional para cambiar Estudio/Descanso.
  function reset(mode, ctx) {
    if (isGuest()) return;                 // el Invitado no puede frenar ni reiniciar el reloj
    const prev = { mode: state.mode, moduleId: state.moduleId, upId: state.upId, phaseSeq: state.shared ? state.shared.phaseSeq : 0 };
    const savedMin = savePartialIfNeeded();
    const nextMode = mode || state.mode;
    state = idleState(nextMode, { ...state, ...(ctx || {}) });
    saveState();
    updateTitle();
    stopTicking();
    reportPresence('stop', {
      finishedMode: prev.mode, minutes: savedMin, completed: false,
      phaseSeq: prev.phaseSeq, finishedModuleId: prev.moduleId, finishedUpId: prev.upId,
    });
  }

  function setContext(ctx) {
    if (isGuest()) return;                 // el tema lo dicta el Host
    state.moduleId = ctx.moduleId || state.moduleId;
    state.upId = ctx.upId || state.upId;
    state.upLabel = ctx.upLabel || state.upLabel;
    saveState(true);
  }

  // ------------------------------------------------------------
  // Sesión compartida: alta / baja de roles
  // ------------------------------------------------------------

  // Convierte este cliente en HOST de una sala (sin arrancar el reloj).
  function becomeHost(partner) {
    if (isGuest()) return { ok: false, reason: 'guest' };
    if (isHost() && state.shared.partner && state.shared.partner !== partner && state.shared.partnerOnline) {
      return { ok: false, reason: 'occupied', partner: state.shared.partner };
    }
    if (!isHost()) {
      state.shared = {
        sessionId: newSessionId(), role: 'host', partner: partner || null,
        hostUsername: myUsername(), phaseSeq: 0, lateMin: 0, partnerOnline: false,
      };
    } else {
      state.shared.partner = partner || state.shared.partner;
    }
    // Sin UP elegida la sesión igual se guarda, bajo un contexto genérico.
    if (!state.moduleId || !state.upId) {
      state.moduleId = 'biblioteca';
      state.upId = 'General';
      state.upLabel = state.upLabel || 'Estudio libre';
    }
    saveState();
    const m = sm();
    if (m && typeof m.abrirSala === 'function') { const p = m.abrirSala(state.shared); if (p && p.catch) p.catch(() => {}); }
    reportPresence('sync');
    return { ok: true, sessionId: state.shared.sessionId, tema: formatTema() };
  }

  // Opción A del menú: "Invitar a estudiar (Host)". Si no hay Pomodoro en marcha, arranca uno.
  function hostSharedSession(partner) {
    const r = becomeHost(partner);
    if (!r.ok) return r;
    if (state.status === 'idle') {
      if (state.mode !== 'work') state = idleState('work', state);
      start();
    }
    return { ok: true, sessionId: state.shared.sessionId, tema: formatTema() };
  }

  // Opción B del menú / aceptar una invitación: entra como INVITADO a la sala de un Host.
  function joinShared(info) {
    const sessionId = info && info.sessionId;
    const hostUsername = info && info.hostUsername;
    if (!sessionId || !hostUsername) return { ok: false, reason: 'datos' };
    if (isHost() && state.shared.partnerOnline) return { ok: false, reason: 'is_host' };
    if (isGuest() && state.shared.sessionId === sessionId) return { ok: true, ya: true };

    if (state.shared) leaveShared({ notify: true });
    savePartialIfNeeded(); // si estaba estudiando por su cuenta, ese tiempo se guarda antes de seguir al Host

    state = idleState('work', {
      ...state,
      shared: {
        sessionId, role: 'guest', partner: hostUsername, hostUsername,
        phaseSeq: 0, lastSeq: 0, lateMin: 0, partnerOnline: false,
      },
    });
    saveState();
    updateTitle();
    stopTicking();
    reportPresence();
    const m = sm();
    if (m && typeof m.abrirSala === 'function') { const p = m.abrirSala(state.shared); if (p && p.catch) p.catch(() => {}); }
    return { ok: true };
  }

  // Sale de la sesión compartida (cualquiera de los dos roles).
  //  - Host: el reloj sigue corriendo en solitario; el Invitado se desvincula.
  //  - Invitado: se guarda lo que estudió y su reloj se libera (idle).
  function leaveShared(opts) {
    opts = opts || {};
    const sh = state.shared;
    if (!sh) return;

    if (sh.role === 'guest') savePartialIfNeeded(); // todavía con state.shared: aplica la regla de "llegó tarde"

    const m = sm();
    if (m && typeof m.salirDeSala === 'function') {
      try { const p = m.salirDeSala(opts.notify !== false); if (p && p.catch) p.catch(() => {}); } catch (_) {}
    }

    state.shared = null;
    if (sh.role === 'guest') state = idleState('work', state);
    saveState();
    updateTitle();
    if (state.status !== 'running') stopTicking();
    reportPresence();
    emit('shared', { tipo: 'left', reason: opts.reason || 'manual', role: sh.role, username: sh.partner });
  }

  // El manager avisa si el otro extremo está conectado a la sala.
  function setPartnerOnline(online, username) {
    const sh = state.shared;
    if (!sh) return;
    const prevOnline = sh.partnerOnline;
    const prevPartner = sh.partner;
    sh.partnerOnline = !!online;
    if (sh.role === 'host' && online && username) sh.partner = username;
    if (prevOnline !== sh.partnerOnline || prevPartner !== sh.partner) saveState();
  }

  // El Invitado avisó que se fue (bye): el Host queda libre para invitar a otra persona.
  function partnerLeft(username) {
    const sh = state.shared;
    if (!sh || sh.role !== 'host') return;
    sh.partner = null;
    sh.partnerOnline = false;
    saveState();
    emit('shared', { tipo: 'guest_left', username });
  }

  function notifyShared(evt) { emit('shared', evt); }

  function getSharedInfo() { return state.shared ? { ...state.shared } : null; }
  function getSharedSnapshot(type) { return isHost() ? buildSnapshot(type || 'sync') : null; }

  // Aplica un snapshot publicado por el Host (solo Invitado).
  function applyRemoteCommand(snap) {
    if (!isGuest() || !snap || snap.sessionId !== state.shared.sessionId) return;

    if (snap.type === 'end') { // el Host terminó la sesión compartida
      const host = state.shared.hostUsername;
      leaveShared({ reason: 'host_ended', notify: false });
      emit('shared', { tipo: 'host_ended', username: host });
      return;
    }

    if (!(snap.seq > (state.shared.lastSeq || 0))) return; // mensaje viejo o repetido
    state.shared.lastSeq = snap.seq;
    if (snap.hostUsername) { state.shared.hostUsername = snap.hostUsername; state.shared.partner = snap.hostUsername; }
    state.shared.partnerOnline = true;

    const adoptCtx = () => {
      if (snap.moduleId) state.moduleId = snap.moduleId;
      if (snap.upId) state.upId = snap.upId;
      if (snap.upLabel !== undefined && snap.upLabel !== null) state.upLabel = snap.upLabel;
    };

    // ---- Cierre de fase: fin natural o Stop del Host ----
    if (snap.type === 'complete' || snap.type === 'stop') {
      const hayFase = state.status === 'running' || state.status === 'paused';
      if (snap.type === 'complete' && state.status === 'running') {
        state.targetEnd = Date.now(); // cierre normal: campana + guardado + evento 'complete' (una sola vez)
        completePhase();
      } else if (hayFase && (snap.finishedMode || state.mode) === 'work' && snap.minutes > 0) {
        registerSharedPhase(state.shared, {
          moduleId: snap.finishedModuleId || state.moduleId, upId: snap.finishedUpId || state.upId,
          minutes: snap.minutes, completed: snap.type === 'complete', phaseSeq: snap.phaseSeq,
        });
      }
      adoptCtx();
      state = idleState(snap.mode || state.mode, state);
      saveState();
      updateTitle();
      stopTicking();
      reportPresence();
      return;
    }

    // Un 'running' casi terminado que llega con el Invitado ya en idle es un latido viejo: se ignora.
    if (snap.status === 'running' && state.status === 'idle' && snap.remainingMs < 1500) { saveState(true); return; }

    const antes = JSON.stringify([state.status, state.mode, state.durationMin, state.moduleId, state.upId, state.upLabel]);
    const dur = snap.durationMin || state.durationMin;

    // Primera vez que veo esta fase: cuánto llegó tarde (para acreditar solo lo que estudió).
    if ((snap.status === 'running' || snap.status === 'paused') && (snap.phaseSeq !== state.shared.phaseSeq || state.status === 'idle')) {
      state.shared.phaseSeq = snap.phaseSeq;
      state.shared.lateMin = snap.mode === 'work' ? Math.max(0, Math.floor((dur * 60000 - snap.remainingMs) / 60000)) : 0;
    }

    adoptCtx();
    state.mode = snap.mode || state.mode;
    state.durationMin = dur;

    if (snap.status === 'running') {
      const objetivo = Date.now() + snap.remainingMs;
      if (state.status !== 'running' || Math.abs(objetivo - state.targetEnd) > SHARED_DRIFT_MS) state.targetEnd = objetivo;
      state.status = 'running';
      state.remainingMs = snap.remainingMs;
    } else if (snap.status === 'paused') {
      state.targetEnd = null;
      state.remainingMs = snap.remainingMs;
      state.status = 'paused';
    } else if (state.status !== 'idle') { // el Host está en idle y este cliente se perdió el Stop
      savePartialIfNeeded();
      state = idleState(snap.mode || state.mode, state);
    } else {
      state = idleState(snap.mode || state.mode, state);
    }

    const despues = JSON.stringify([state.status, state.mode, state.durationMin, state.moduleId, state.upId, state.upLabel]);
    saveState(antes === despues); // el latido sin cambios no repinta la UI
    updateTitle();
    if (state.status === 'running') startTicking(); else stopTicking();
    if (antes !== despues) reportPresence();
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
        // El bloque terminó mientras la página no estaba activa (PC dormida, pestaña cerrada). Si era de estudio y
        // terminó hace poco, se registra igual (una sola vez, con el mismo antibloqueo entre pestañas) y sin campana.
        const eraEstudio = state.mode === 'work' && state.durationMin > 0;
        if (eraEstudio && overdue <= RESCATE_MAX_MS && localStorage.getItem(DONE_KEY) !== String(state.targetEnd) && !state.shared) {
          localStorage.setItem(DONE_KEY, String(state.targetEnd));
          const previo = { moduleId: state.moduleId, upId: state.upId, minutes: state.durationMin };
          setTimeout(() => {
            registerStudySession(previo.moduleId, previo.upId, previo.minutes);
            if (typeof showToast === 'function') showToast('✅ Se registró el Pomodoro que terminó mientras no estabas.', 'success');
          }, 800);
        }
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

  return {
    start, pause, reset, setContext, getState, getRemainingSeconds, getMinutes, on, initAudio, formatTime: fmt, startSynced,
    // Pomodoro compartido
    formatTema, becomeHost, hostSharedSession, joinShared, leaveShared,
    getSharedInfo, getSharedSnapshot, applyRemoteCommand, setPartnerOnline, partnerLeft, notifyShared,
    // Solo para pruebas (tests/)
    _test: { registerStudySession, flushPending, readPending },
  };
})();

window.PomodoroEngine = PomodoroEngine;
