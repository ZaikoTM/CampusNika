// js/syncManager.js
// ============================================================================
// CAMPUS NIKA — Orquestador de sincronización (Modo Guardia Offline-First)
// ----------------------------------------------------------------------------
// Qué hace:
//  1. Detecta cambios de conectividad (online/offline + "señal de mentira":
//     el navegador dice online pero las peticiones fallan).
//  2. Muestra un badge en el navbar:  🟢 Online · 🟡 Modo Guardia (Offline) ·
//     🔄 Sincronizando (N)  ·  ⚠️ N sin subir.
//  3. Procesa la cola `sync_queue` (IndexedDB) de forma SECUENCIAL:
//       resultado_examen  -> tabla exam_results
//       progreso_estudio  -> tabla study_sessions
//       errata            -> NikaSupabase.reportarErrata()
//  4. Reintentos: errores de RED no consumen intentos (se espera a tener señal);
//     errores 5xx / 4xx sí, con backoff exponencial y máximo 3 intentos. Al
//     agotarse, el item queda "fallido" (NO se borra) y se reintenta a mano
//     tocando el badge.
//  5. Migra la cola vieja de localStorage (nika_pending_exam_results).
//  6. Background Sync: registra el tag 'nika-sync'; el Service Worker avisa
//     a la pestaña abierta cuando vuelve la señal.
//
// Uso desde otros módulos:
//   await SyncManager.encolar('errata', { preguntaTexto, justificacion });
//   SyncManager.on((estado) => ...);   SyncManager.sincronizarAhora();
//
// Requiere: js/offlineStorage.js y supabaseClient.js (window.NikaSupabase).
// ============================================================================

const SyncManager = (() => {
  const MAX_INTENTOS = 3;
  const BACKOFF_BASE_MS = 5000;               // 5 s, 10 s, 20 s
  const PING_CADA_MS = 15000;
  const LEGACY_QUEUE_KEY = 'nika_pending_exam_results';
  const BG_SYNC_TAG = 'nika-sync';

  let _redCaida = false;                      // navigator.onLine=true pero las peticiones fallan
  let _sincronizando = false;
  let _iniciado = false;
  let _timerReintento = null;
  let _timerPing = null;
  let _conteo = { pendientes: 0, fallidos: 0, total: 0 };
  let _badgeEl = null;
  const _oyentes = [];

  const OS = () => window.OfflineStorage;

  // ------------------------------------------------------------
  // Estado público
  // ------------------------------------------------------------
  function estaOffline() { return !navigator.onLine || _redCaida; }

  function estado() {
    return {
      offline: estaOffline(),
      sincronizando: _sincronizando,
      pendientes: _conteo.pendientes,
      fallidos: _conteo.fallidos,
    };
  }

  function on(cb) {
    _oyentes.push(cb);
    return () => { const i = _oyentes.indexOf(cb); if (i >= 0) _oyentes.splice(i, 1); };
  }

  function _emitir() {
    const e = estado();
    _renderBadge();
    _oyentes.forEach((cb) => { try { cb(e); } catch (err) { console.error('[SyncManager]', err); } });
    try { window.dispatchEvent(new CustomEvent('nika:sync-state', { detail: e })); } catch (_) {}
  }

  async function refrescarConteo() {
    try { _conteo = await OS().contarCola(); } catch (_) { _conteo = { pendientes: 0, fallidos: 0, total: 0 }; }
    _emitir();
    return _conteo;
  }

  function _toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
  }

  // ------------------------------------------------------------
  // Usuario / cliente Supabase
  // ------------------------------------------------------------
  function userIdCacheado() {
    try { return JSON.parse(localStorage.getItem('nika_currentUser') || '{}').id || null; } catch (_) { return null; }
  }

  async function _getClient() {
    if (window.NikaScriptsReady) { try { await window.NikaScriptsReady; } catch (_) {} }
    if (window.NikaSupabase && window.NikaSupabase.ready) { try { await window.NikaSupabase.ready; } catch (_) {} }
    return (window.NikaSupabase && window.NikaSupabase.client) || null;
  }

  async function _getSessionUserId(client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      return session && session.user ? session.user.id : null;
    } catch (_) { return null; }
  }

  // ------------------------------------------------------------
  // Clasificación de errores
  // ------------------------------------------------------------
  function _clasificar(error, status) {
    if (!error) return 'ok';
    const msg = String(error.message || error || '');
    const code = String(error.code || '');
    if (code === '23505') return 'ok';                                   // ya estaba guardado (duplicado)
    if (error instanceof TypeError || status === 0 || /failed to fetch|networkerror|network request|load failed|fetch failed|timeout/i.test(msg)) return 'red';
    if (status >= 500 || /^5\d\d$/.test(code)) return '5xx';
    if (status === 401 || status === 403 || /jwt|iniciar sesi[oó]n|not authenticated/i.test(msg)) return 'auth';
    return '4xx';
  }

  // ------------------------------------------------------------
  // Handlers por tipo de acción
  // ------------------------------------------------------------
  const HANDLERS = {
    async resultado_examen(item, ctx) {
      const fila = item.payload && item.payload.fila;
      if (!fila) return { descartar: true };
      if (fila.user_id && fila.user_id !== ctx.userId) return { omitir: true };   // es de otra cuenta
      const { error, status } = await ctx.client.from('exam_results').insert(fila);
      return { error, status };
    },

    async progreso_estudio(item, ctx) {
      const row = item.payload && item.payload.row;
      if (!row) return { descartar: true };
      if (row.user_id && row.user_id !== ctx.userId) return { omitir: true };
      let r = await ctx.client.from('study_sessions').insert(row);
      if (r.error && /completed/i.test(r.error.message || '')) {
        // La columna 'completed' todavía no existe (falta sql/rendimiento.sql)
        if (row.completed === false) return {};                     // parcial: no se puede distinguir, se omite
        const { completed: _omitida, ...sinFlag } = row;
        r = await ctx.client.from('study_sessions').insert(sinFlag);
      }
      return { error: r.error, status: r.status };
    },

    async errata(item, ctx) {
      if (item.userId && item.userId !== ctx.userId) return { omitir: true };
      const p = item.payload || {};
      if (!window.NikaSupabase || typeof window.NikaSupabase.reportarErrata !== 'function') {
        return { error: { message: 'reportarErrata no disponible', code: 'x' }, status: 400 };
      }
      const r = await window.NikaSupabase.reportarErrata(p.preguntaTexto, p.justificacion);
      if (r && r.error) return { error: r.error, status: r.error.status };
      return {};
    },
  };

  // ------------------------------------------------------------
  // Cola: encolar y procesar
  // ------------------------------------------------------------
  async function encolar(tipo, payload) {
    const item = await OS().encolarAccion(tipo, payload, { userId: userIdCacheado() });
    await refrescarConteo();
    if (!estaOffline()) setTimeout(() => sincronizarAhora(), 300);
    else _registrarBackgroundSync();
    return item;
  }

  function _programarReintento(ms) {
    clearTimeout(_timerReintento);
    _timerReintento = setTimeout(() => sincronizarAhora(), Math.max(1000, ms));
  }

  async function sincronizarAhora({ manual = false } = {}) {
    if (_sincronizando) return { ok: false, motivo: 'en_curso' };
    if (!navigator.onLine) return { ok: false, motivo: 'offline' };

    _sincronizando = true;
    _emitir();
    const resumen = { enviados: 0, fallidos: 0, omitidos: 0, motivo: null };

    try {
      // Reintento manual: los "fallidos" vuelven a la cola con intentos en 0
      if (manual) {
        for (const f of await OS().obtenerColaFallida()) {
          await OS().actualizarItemCola(f.id, { estado: 'pendiente', intentos: 0, proximoIntento: 0, ultimoError: null });
        }
      }

      const client = await _getClient();
      if (!client) { resumen.motivo = 'sin_cliente'; return resumen; }
      const userId = await _getSessionUserId(client);
      if (!userId) { resumen.motivo = 'sin_sesion'; return resumen; }   // no se pierde nada: espera al login

      const ctx = { client, userId };
      const items = await OS().obtenerColaPendiente();
      let proximo = Infinity;

      for (const item of items) {
        if (item.proximoIntento && item.proximoIntento > Date.now()) { proximo = Math.min(proximo, item.proximoIntento); continue; }
        const handler = HANDLERS[item.tipo];
        if (!handler) { await OS().eliminarDeCola(item.id); continue; }

        let res;
        try { res = await handler(item, ctx); }
        catch (e) { res = { error: e, status: 0 }; }

        if (res.omitir) { resumen.omitidos++; continue; }
        if (res.descartar) { await OS().eliminarDeCola(item.id); continue; }

        const clase = _clasificar(res.error, res.status);
        if (clase === 'ok') {
          await OS().eliminarDeCola(item.id);
          resumen.enviados++;
          _clearRedCaida();
          continue;
        }
        if (clase === 'red') {                       // sin señal real: se corta y se espera
          _marcarRedCaida();
          resumen.motivo = 'red';
          break;
        }
        if (clase === 'auth') { resumen.motivo = 'sin_sesion'; continue; }   // no consume intentos

        // 5xx / 4xx: backoff exponencial con tope de intentos
        const intentos = (item.intentos || 0) + 1;
        const msg = String((res.error && res.error.message) || res.error || 'Error').slice(0, 300);
        if (intentos >= MAX_INTENTOS) {
          await OS().actualizarItemCola(item.id, { intentos, estado: 'fallido', ultimoError: msg });
          resumen.fallidos++;
        } else {
          const espera = BACKOFF_BASE_MS * Math.pow(2, intentos - 1);
          await OS().actualizarItemCola(item.id, { intentos, ultimoError: msg, proximoIntento: Date.now() + espera });
          proximo = Math.min(proximo, Date.now() + espera);
        }
      }

      if (proximo !== Infinity) _programarReintento(proximo - Date.now());
      return resumen;
    } finally {
      _sincronizando = false;
      await refrescarConteo();
      if (resumen.enviados > 0) {
        _toast(`✅ ${resumen.enviados} ${resumen.enviados === 1 ? 'elemento sincronizado' : 'elementos sincronizados'} con la nube.`);
        try { window.dispatchEvent(new CustomEvent('nika:sync-done', { detail: resumen })); } catch (_) {}
      }
      if (resumen.fallidos > 0) _toast(`⚠️ ${resumen.fallidos} elemento(s) no se pudieron subir. Tocá el badge para reintentar.`);
    }
  }

  // ------------------------------------------------------------
  // Conectividad real
  // ------------------------------------------------------------
  function _marcarRedCaida() {
    if (_redCaida) return;
    _redCaida = true;
    _emitir();
    _iniciarPing();
  }
  function _clearRedCaida() {
    if (!_redCaida) return;
    _redCaida = false;
    clearInterval(_timerPing); _timerPing = null;
    _emitir();
  }
  // Otros módulos pueden avisar que una petición falló por red
  function marcarRedCaida() { _marcarRedCaida(); }

  function _iniciarPing() {
    if (_timerPing) return;
    _timerPing = setInterval(async () => {
      if (!navigator.onLine) return;
      if (await _ping()) { _clearRedCaida(); sincronizarAhora(); }
    }, PING_CADA_MS);
  }

  // El Service Worker deja pasar '?nika_ping' directo a la red (sin caché)
  async function _ping() {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 4000);
      const r = await fetch(`manifest.json?nika_ping=${Date.now()}`, { cache: 'no-store', signal: ctl.signal });
      clearTimeout(t);
      return r.ok;
    } catch (_) { return false; }
  }

  function _onOnline() {
    _emitir();
    _ping().then((ok) => {
      if (ok) { _clearRedCaida(); sincronizarAhora(); }
      else { _marcarRedCaida(); }
    });
  }
  function _onOffline() { _emitir(); _registrarBackgroundSync(); }

  // ------------------------------------------------------------
  // Background Sync + mensajes del Service Worker
  // ------------------------------------------------------------
  async function _registrarBackgroundSync() {
    try {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.sync) await reg.sync.register(BG_SYNC_TAG);
    } catch (_) { /* iOS/Safari no lo soportan: queda el listener 'online' */ }
  }

  async function _asegurarServiceWorker() {
    try {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) await navigator.serviceWorker.register('sw.js');
      navigator.serviceWorker.addEventListener('message', (ev) => {
        const t = ev.data && ev.data.type;
        if (t === 'NIKA_SYNC') sincronizarAhora();
        if (t === 'NIKA_UPDATE_AVAILABLE') _toast('✨ Hay una versión nueva de Campus Nika. Recargá cuando puedas.');
      });
    } catch (e) { console.warn('[SyncManager] Service Worker:', e && e.message); }
  }

  // ------------------------------------------------------------
  // Migración de la cola vieja (localStorage) -> IndexedDB
  // ------------------------------------------------------------
  async function migrarColaLegacy() {
    let viejos = [];
    try { viejos = JSON.parse(localStorage.getItem(LEGACY_QUEUE_KEY)) || []; } catch (_) { viejos = []; }
    if (!Array.isArray(viejos) || !viejos.length) return 0;
    try {
      for (const fila of viejos) {
        await OS().encolarAccion('resultado_examen', { fila }, { userId: fila.user_id || null });
      }
      localStorage.removeItem(LEGACY_QUEUE_KEY);
      return viejos.length;
    } catch (e) {
      console.warn('[SyncManager] No se pudo migrar la cola legacy:', e && e.message);
      return 0;
    }
  }

  // ------------------------------------------------------------
  // Badge visual
  // ------------------------------------------------------------
  function _inyectarCSS() {
    if (document.getElementById('nika-net-badge-css')) return;
    const st = document.createElement('style');
    st.id = 'nika-net-badge-css';
    st.textContent = `
      .nika-net-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border,#e2e8f0);background:var(--card-bg,#fff);
        color:var(--text-main,#1e293b);font:700 .74rem 'Plus Jakarta Sans',system-ui,sans-serif;padding:6px 11px;border-radius:999px;cursor:pointer;
        transition:.25s;white-space:nowrap;line-height:1.1}
      .nika-net-badge:hover{border-color:var(--nika-primary,#0284c7)}
      .nika-net-badge.flotante{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9000;box-shadow:0 8px 22px -8px rgba(0,0,0,.35)}
      .nika-net-badge.on{background:rgba(22,163,74,.10);border-color:rgba(22,163,74,.35);color:#15803d}
      .nika-net-badge.off{background:rgba(234,179,8,.16);border-color:rgba(234,179,8,.5);color:#a16207}
      .nika-net-badge.sync{background:rgba(2,132,199,.10);border-color:rgba(2,132,199,.4);color:var(--nika-primary,#0284c7)}
      .nika-net-badge.err{background:rgba(220,38,38,.10);border-color:rgba(220,38,38,.4);color:#b91c1c}
      .nika-net-badge .spin{display:inline-block;animation:nikaSpin 1s linear infinite}
      @keyframes nikaSpin{to{transform:rotate(360deg)}}
      body.dark-mode .nika-net-badge.on{color:#4ade80} body.dark-mode .nika-net-badge.off{color:#facc15}
      body.dark-mode .nika-net-badge.err{color:#f87171}
      @media (max-width:480px){.nika-net-badge.on .lbl{display:none}}
      @media (prefers-reduced-motion:reduce){.nika-net-badge .spin{animation:none}}
    `;
    document.head.appendChild(st);
  }

  function montarBadge() {
    if (_badgeEl && document.body.contains(_badgeEl)) return _badgeEl;
    _inyectarCSS();
    const el = document.createElement('button');
    el.type = 'button';
    el.id = 'nika-net-badge';
    el.className = 'nika-net-badge';
    el.setAttribute('aria-live', 'polite');
    el.addEventListener('click', () => {
      const e = estado();
      if ((e.pendientes > 0 || e.fallidos > 0) && !e.offline) sincronizarAhora({ manual: true });
      else if (window.GuardiaModal) window.GuardiaModal.abrir();
    });
    const slot = document.querySelector('[data-nika-net-slot]');
    if (slot) slot.appendChild(el);
    else { el.classList.add('flotante'); document.body.appendChild(el); }
    _badgeEl = el;
    _renderBadge();
    return el;
  }

  function _renderBadge() {
    if (!_badgeEl) return;
    const e = estado();
    let cls = 'on', html = '🟢 <span class="lbl">Online</span>', title = 'Conectado. Tocá para abrir el Modo Guardia (descargas sin conexión).';
    if (e.sincronizando) {
      cls = 'sync'; html = `<span class="spin">🔄</span> Sincronizando${e.pendientes ? ` (${e.pendientes})` : ''}`; title = 'Subiendo tu progreso…';
    } else if (e.offline) {
      cls = 'off'; html = `🟡 Modo Guardia (Offline)${e.pendientes ? ` · ${e.pendientes}` : ''}`;
      title = e.pendientes ? `${e.pendientes} pendiente(s): se suben solos al volver la señal.` : 'Sin conexión: usás lo que descargaste.';
    } else if (e.fallidos > 0) {
      cls = 'err'; html = `⚠️ ${e.fallidos} sin subir`; title = 'Tocá para reintentar la subida.';
    } else if (e.pendientes > 0) {
      cls = 'sync'; html = `🔄 ${e.pendientes} pendiente${e.pendientes === 1 ? '' : 's'}`; title = 'Tocá para sincronizar ahora.';
    }
    _badgeEl.className = 'nika-net-badge ' + cls + (_badgeEl.classList.contains('flotante') ? ' flotante' : '');
    _badgeEl.innerHTML = html;
    _badgeEl.title = title;
  }

  // ------------------------------------------------------------
  // Init
  // ------------------------------------------------------------
  async function init() {
    if (_iniciado) return;
    _iniciado = true;

    window.addEventListener('online', _onOnline);
    window.addEventListener('offline', _onOffline);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !estaOffline() && _conteo.pendientes > 0) sincronizarAhora();
    });

    montarBadge();
    _asegurarServiceWorker();

    try {
      await OS().abrir();
      await migrarColaLegacy();
    } catch (e) { console.warn('[SyncManager] IndexedDB no disponible:', e && e.message); }

    await refrescarConteo();
    if (navigator.onLine) setTimeout(() => sincronizarAhora(), 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return {
    init, estado, on, estaOffline, encolar, sincronizarAhora, refrescarConteo,
    marcarRedCaida, montarBadge, migrarColaLegacy, userIdCacheado,
    MAX_INTENTOS,
  };
})();

window.SyncManager = SyncManager;
