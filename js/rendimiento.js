// js/rendimiento.js
// CAMPUS NIKA — Resultados de simulacros y analítica de rendimiento (Supabase).
//
//  - guardarExamen(): guarda cada simulacro en la tabla exam_results (con el
//    desglose por Unidad Problema). Si no hay conexión (Modo Guardia), lo encola en
//    IndexedDB (sync_queue, ver js/syncManager.js) y se sube solo al volver la señal.
//    Devuelve { ok, queued, offline }.
//  - cargarDatos(): trae tus sesiones Pomodoro (study_sessions) y tus
//    simulacros (exam_results).
//  - analizar(): calcula todo lo que muestra "Mi Rendimiento Académico":
//    KPIs, racha, Radar Clínico y Curva del Olvido (por área y por UP).
//
// Requiere: window.NikaSupabase.client (supabaseClient.js) y las tablas de
// sql/rendimiento.sql. Las funciones de analizar() son puras (sin red).

const NikaRendimiento = (() => {
  const QUEUE_KEY = 'nika_pending_exam_results';
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Umbrales de la Curva del Olvido (días sin actividad)
  const FRESCO_MAX = 3;      // 0-3 días  -> Memoria fresca
  const DECAIMIENTO_MAX = 6; // 4-6 días  -> Repaso recomendado ; 7+ -> Riesgo de olvido

  const ETIQUETAS = {
    cirugia: 'Cirugía General',
    ginecologia: 'Ginecología',
    siam: 'S.I.A.M.',
    pediatria: 'Pediatría',
    clinica: 'Clínica Médica',
  };

  function labelModulo(m) {
    if (!m) return 'Sin área';
    if (ETIQUETAS[m]) return ETIQUETAS[m];
    return String(m).charAt(0).toUpperCase() + String(m).slice(1);
  }

  // 'up4' | 'UP04' | 4 | '04' -> 'UP4'. Otros textos (ej. "Trauma - MMSS") quedan tal cual.
  function normUp(u) {
    if (u === null || u === undefined || u === '') return null;
    const m = String(u).trim().match(/^(?:up)?\s*0*(\d+)$/i);
    return m ? `UP${parseInt(m[1], 10)}` : String(u).trim();
  }

  // ------------------------------------------------------------
  // Acceso a Supabase
  // ------------------------------------------------------------
  async function getClient() {
    if (window.NikaScriptsReady) await window.NikaScriptsReady;
    if (window.NikaSupabase && window.NikaSupabase.ready) {
      try { await window.NikaSupabase.ready; } catch (_) {}
    }
    const c = window.NikaSupabase && window.NikaSupabase.client;
    if (!c) throw new Error('No hay conexión con Supabase.');
    return c;
  }

  async function getUserId() {
    const c = await getClient();
    const { data: { session } } = await c.auth.getSession();
    return session && session.user ? session.user.id : null;
  }

  // Sin señal el SDK puede tardar o fallar al leer la sesión: usamos el usuario cacheado en el dispositivo.
  function _userIdCacheado() {
    try { return JSON.parse(localStorage.getItem('nika_currentUser') || '{}').id || null; } catch (_) { return null; }
  }
  async function _getUserIdRapido(ms) {
    try {
      return await Promise.race([getUserId(), new Promise((res) => setTimeout(() => res(null), ms))]);
    } catch (_) { return null; }
  }
  function _estaOffline() {
    return window.SyncManager ? window.SyncManager.estaOffline() : !navigator.onLine;
  }

  // ------------------------------------------------------------
  // Guardar un simulacro
  // payload: { modulo, mode, total, correct, incorrect, blank, score, scorePct,
  //            durationSeconds, byUp: { '1': {total, correct}, ... } }
  // ------------------------------------------------------------
  function _colaLeer() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (_) { return []; }
  }
  function _colaEscribir(arr) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(arr)); } catch (_) {}
  }

  function _filaDesdePayload(p, userId) {
    const total = Math.max(1, parseInt(p.total, 10) || 0);
    const correct = Math.min(total, Math.max(0, parseInt(p.correct, 10) || 0));
    const blank = Math.min(total - correct, Math.max(0, parseInt(p.blank, 10) || 0));
    const incorrect = total - correct - blank;
    const byUp = {};
    Object.entries(p.byUp || {}).forEach(([k, v]) => {
      const key = normUp(k);
      if (!key) return;
      byUp[key] = { total: v.total || 0, correct: v.correct || 0 };
    });
    return {
      user_id: userId,
      modulo: p.modulo || 'cirugia',
      mode: p.mode || null,
      total_questions: total,
      correct_count: correct,
      incorrect_count: incorrect,
      blank_count: blank,
      score: Math.max(0, Number(p.score) || 0),
      score_pct: Math.min(100, Math.max(0, Math.round(Number(p.scorePct) || 0))),
      duration_seconds: p.durationSeconds != null ? Math.max(0, Math.round(p.durationSeconds)) : null,
      by_up: byUp,
      created_at: p.createdAt || new Date().toISOString(),
    };
  }

  async function _insertar(fila) {
    const c = await getClient();
    const { error } = await c.from('exam_results').insert(fila);
    if (error) throw error;
  }

  // Encola en IndexedDB (sync_queue). Si el módulo offline no está cargado, usa la cola vieja de localStorage.
  async function _encolar(fila) {
    if (window.SyncManager) {
      try { await window.SyncManager.encolar('resultado_examen', { fila }); return true; }
      catch (e) { console.warn('[NikaRendimiento] No se pudo encolar en IndexedDB:', e && e.message); }
    }
    const cola = _colaLeer();
    cola.push(fila);
    _colaEscribir(cola);
    return true;
  }

  async function guardarExamen(payload) {
    const offline = _estaOffline();
    // Online: sesión real. Offline: usuario cacheado (no esperamos a la red).
    let userId = await _getUserIdRapido(offline ? 1500 : 6000);
    if (!userId) userId = _userIdCacheado();
    if (!userId) return { ok: false, error: 'Sin sesión iniciada.' };

    const fila = _filaDesdePayload(payload, userId);

    if (!offline) {
      try {
        await _insertar(fila);
        return { ok: true };
      } catch (err) {
        console.warn('[NikaRendimiento] No se pudo guardar el simulacro, queda en cola:', err && err.message);
        if (window.SyncManager && /failed to fetch|network|load failed|timeout/i.test(String(err && err.message))) {
          window.SyncManager.marcarRedCaida();
        }
      }
    }

    await _encolar(fila);
    return { ok: false, queued: true, offline: offline || _estaOffline() };
  }

  // Vacía la cola: primero migra la vieja de localStorage y luego delega en SyncManager.
  async function reintentarPendientes() {
    if (window.SyncManager) {
      try {
        await window.SyncManager.migrarColaLegacy();
        return await window.SyncManager.sincronizarAhora();
      } catch (_) { return; }
    }
    return _reintentarLegacy();
  }

  async function _reintentarLegacy() {
    const cola = _colaLeer();
    if (!cola.length) return;
    let userId = null;
    try { userId = await getUserId(); } catch (_) { return; }
    if (!userId) return;

    const restantes = [];
    for (const fila of cola) {
      if (fila.user_id !== userId) { restantes.push(fila); continue; } // es de otra cuenta
      try { await _insertar(fila); } catch (_) { restantes.push(fila); }
    }
    _colaEscribir(restantes);
  }

  // ------------------------------------------------------------
  // Cargar datos del usuario
  // ------------------------------------------------------------
  async function cargarDatos() {
    const c = await getClient();
    const userId = await getUserId();
    if (!userId) throw new Error('Sin sesión iniciada.');

    // No bloqueamos la pantalla más de 4 s si la cola tarda (señal floja)
    await Promise.race([reintentarPendientes(), new Promise((res) => setTimeout(res, 4000))]);

    // 'completed' puede no existir si todavía no corriste sql/rendimiento.sql
    let sesiones = [];
    let r = await c.from('study_sessions')
      .select('modulo, up_id, duration_minutes, completed, completed_at')
      .eq('user_id', userId).order('completed_at', { ascending: false }).limit(5000);
    if (r.error) {
      r = await c.from('study_sessions')
        .select('modulo, up_id, duration_minutes, completed_at')
        .eq('user_id', userId).order('completed_at', { ascending: false }).limit(5000);
      if (r.error) throw r.error;
    }
    sesiones = r.data || [];

    let examenes = [];
    const e = await c.from('exam_results')
      .select('modulo, mode, total_questions, correct_count, score, score_pct, by_up, created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(5000);
    if (!e.error) examenes = e.data || [];
    else console.warn('[NikaRendimiento] exam_results no disponible (¿corriste sql/rendimiento.sql?):', e.error.message);

    return { sesiones, examenes };
  }

  // ------------------------------------------------------------
  // Analítica (funciones puras)
  // ------------------------------------------------------------
  function _diaLocal(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function _inicioDia(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function _diasEntre(desde, hasta) {
    return Math.round((_inicioDia(hasta) - _inicioDia(desde)) / DAY_MS);
  }
  function _estadoPorDias(dias) {
    if (dias <= FRESCO_MAX) return { clave: 'fresco', emoji: '🟢', texto: 'Memoria fresca', color: '#16a34a' };
    if (dias <= DECAIMIENTO_MAX) return { clave: 'decaimiento', emoji: '🟡', texto: 'Repaso recomendado', color: '#d97706' };
    return { clave: 'critico', emoji: '🔴', texto: 'Riesgo de olvido', color: '#dc2626' };
  }

  function analizar(datos, ahora = new Date()) {
    const sesiones = (datos && datos.sesiones) || [];
    const examenes = (datos && datos.examenes) || [];

    const completas = sesiones.filter((s) => s.completed !== false);
    const totalMin = sesiones.reduce((a, s) => a + (s.duration_minutes || 0), 0);

    const porModulo = {};
    const porUp = {};
    const dias = new Set();
    const hoyStr = _diaLocal(ahora);
    let tiempoHoyMin = 0;
    let pomodorosHoy = 0;

    const mod = (m) => (porModulo[m] = porModulo[m] || {
      modulo: m, label: labelModulo(m), minutos: 0, pomodoros: 0, examenes: 0,
      puntaje: 0, preguntas: 0, ultima: null,
    });
    const tocarUp = (m, up, fecha) => {
      if (!up) return;
      const k = `${m}|${up}`;
      const o = (porUp[k] = porUp[k] || { modulo: m, up, ultima: null });
      if (!o.ultima || fecha > o.ultima) o.ultima = fecha;
    };
    const tocarUltima = (o, fecha) => { if (!o.ultima || fecha > o.ultima) o.ultima = fecha; };

    sesiones.forEach((s) => {
      const m = s.modulo || 'otros';
      const f = new Date(s.completed_at);
      if (isNaN(f)) return;
      const o = mod(m);
      o.minutos += s.duration_minutes || 0;
      if (s.completed !== false) {
        o.pomodoros += 1;
        dias.add(_diaLocal(f)); // la racha solo cuenta sesiones terminadas
        if (_diaLocal(f) === hoyStr) {
          tiempoHoyMin += s.duration_minutes || 0;
          pomodorosHoy += 1;
        }
      }
      tocarUltima(o, f);
      tocarUp(m, normUp(s.up_id), f);
    });

    let puntajeTotal = 0;
    let preguntasTotal = 0;
    examenes.forEach((x) => {
      const m = x.modulo || 'otros';
      const f = new Date(x.created_at);
      if (isNaN(f)) return;
      const o = mod(m);
      o.examenes += 1;
      o.puntaje += Number(x.score) || 0;
      o.preguntas += x.total_questions || 0;
      puntajeTotal += Number(x.score) || 0;
      preguntasTotal += x.total_questions || 0;
      dias.add(_diaLocal(f));
      tocarUltima(o, f);
      Object.keys(x.by_up || {}).forEach((up) => tocarUp(m, normUp(up), f));
    });

    // Racha: días consecutivos con al menos 1 simulacro o 1 Pomodoro terminado.
    // Sigue viva si hoy todavía no hiciste nada pero ayer sí.
    let racha = 0;
    let cursor = _inicioDia(ahora);
    if (!dias.has(_diaLocal(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
    while (dias.has(_diaLocal(cursor))) {
      racha += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    // Área favorita: la que más Pomodoros completados tiene (desempata por minutos)
    const conPomodoros = Object.values(porModulo).filter((o) => o.pomodoros > 0)
      .sort((a, b) => (b.pomodoros - a.pomodoros) || (b.minutos - a.minutos));
    const favorita = conPomodoros[0] || null;

    // Radar Clínico: tiempo de estudio vs % de aciertos, por área
    const maxMin = Math.max(0, ...Object.values(porModulo).map((o) => o.minutos));
    const radar = Object.values(porModulo)
      .filter((o) => o.minutos > 0 || o.preguntas > 0)
      .map((o) => ({
        modulo: o.modulo,
        label: o.label,
        minutos: o.minutos,
        tiempoPct: maxMin > 0 ? Math.round((o.minutos / maxMin) * 100) : 0,
        aciertosPct: o.preguntas > 0 ? Math.round((o.puntaje / o.preguntas) * 100) : null,
        preguntas: o.preguntas,
      }))
      .sort((a, b) => b.minutos - a.minutos);

    // Insight del radar
    let insight = null;
    const totalRadarMin = radar.reduce((a, r) => a + r.minutos, 0);
    for (const r of radar) {
      const share = totalRadarMin > 0 ? r.minutos / totalRadarMin : 0;
      if (radar.length > 1 && share >= 0.5 && r.aciertosPct !== null && r.aciertosPct < 60) {
        insight = `Le dedicás el ${Math.round(share * 100)}% de tu tiempo a ${r.label}, pero tu efectividad ahí es del ${r.aciertosPct}%. Revisá cómo estás estudiando esa área.`;
        break;
      }
    }
    if (!insight) {
      const sinPractica = radar.find((r) => r.minutos > 0 && r.aciertosPct === null);
      if (sinPractica) insight = `Estudiaste ${sinPractica.label}, pero todavía no hiciste ningún simulacro de esa área para medir tu efectividad.`;
    }

    // Curva del Olvido: por área y por Unidad Problema
    const olvidoAreas = Object.values(porModulo).filter((o) => o.ultima).map((o) => {
      const d = _diasEntre(o.ultima, ahora);
      return { modulo: o.modulo, label: o.label, dias: d, ultima: o.ultima, estado: _estadoPorDias(d) };
    }).sort((a, b) => b.dias - a.dias);

    const olvidoUps = Object.values(porUp).filter((o) => o.ultima).map((o) => {
      const d = _diasEntre(o.ultima, ahora);
      return { modulo: o.modulo, label: labelModulo(o.modulo), up: o.up, dias: d, ultima: o.ultima, estado: _estadoPorDias(d) };
    }).sort((a, b) => b.dias - a.dias);

    const masOlvidada = olvidoUps.find((u) => u.dias > FRESCO_MAX) || null;

    return {
      kpis: {
        simulacros: examenes.length,
        efectividad: preguntasTotal > 0 ? Math.round((puntajeTotal / preguntasTotal) * 100) : null,
        racha,
        tiempoTotalMin: totalMin,
        pomodoros: completas.length,
        tiempoHoyMin,
        pomodorosHoy,
        favorita: favorita ? { modulo: favorita.modulo, label: favorita.label, pomodoros: favorita.pomodoros, minutos: favorita.minutos } : null,
      },
      radar,
      insight,
      olvido: { areas: olvidoAreas, ups: olvidoUps, masOlvidada },
    };
  }

  function formatearTiempo(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }

  return {
    guardarExamen, cargarDatos, analizar, reintentarPendientes,
    formatearTiempo, labelModulo, normUp,
    UMBRALES: { FRESCO_MAX, DECAIMIENTO_MAX },
  };
})();

window.NikaRendimiento = NikaRendimiento;
