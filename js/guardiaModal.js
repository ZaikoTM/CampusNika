// js/guardiaModal.js
// ============================================================================
// CAMPUS NIKA — Modal "Descargar para Guardia" (descarga por lotes offline)
// ----------------------------------------------------------------------------
// Permite elegir qué llevarse sin conexión:
//   • UP 1 a 11 (bancos de preguntas)  -> IndexedDB (store bancos_up), desde Supabase (bancos_json)
//   • Vademécum NikaFarma (~4 MB)      -> IndexedDB (store nikafarma) + Cache del Service Worker
//   • Bancos locales (Trauma y Suturas) y datos de respaldo del simulador (preguntas.json,
//     db_cirugia_organizado.json) + páginas de la app -> Cache del Service Worker
// Muestra progreso, espacio usado (navigator.storage.estimate) y permite borrar descargas.
//
// Uso:  GuardiaModal.abrir();     o cualquier elemento con  data-guardia-open
// Requiere: js/offlineStorage.js, supabaseClient.js (window.NikaSupabase)
// ============================================================================

const GuardiaModal = (() => {
  const UPS = Array.from({ length: 11 }, (_, i) => i + 1);
  const EST_UP_BYTES = 150 * 1024;          // estimación hasta conocer el tamaño real
  const EST_FARMA_BYTES = 4.0 * 1024 * 1024;
  const EST_LOCALES_BYTES = 230 * 1024;
  const EST_RESPALDO_BYTES = 400 * 1024;

  const URLS_LOCALES = ['data/banco_trauma_superior.js', 'data/banco_trauma_inferior.js', 'data/banco_suturas.js'];
  const URLS_RESPALDO = ['preguntas.json', 'db_cirugia_organizado.json'];
  const URLS_APP = ['campus.html', 'examen.html', 'nikafarma.html', 'styles.css', 'supabaseClient.js',
    'js/rendimiento.js', 'js/examen.js', 'js/offlineStorage.js', 'js/syncManager.js', 'js/guardiaModal.js'];
  const URL_FARMA = 'data/nikafarma_api.json';

  let _montado = false;
  let _ocupado = false;
  let _titulos = {};                         // upNumber -> título (data/<modulo>.json)
  let _locales = {};                         // upId -> metadatos de lo ya descargado
  let _farmaInfo = null;

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const modulo = () => new URLSearchParams(location.search).get('modulo') || 'cirugia';
  const fmt = (n) => (window.OfflineStorage ? OfflineStorage.formatearBytes(n) : `${Math.round(n / 1024)} KB`);
  const upId = (n) => String(n).padStart(2, '0');

  // ------------------------------------------------------------
  // CSS + HTML (se inyectan una sola vez)
  // ------------------------------------------------------------
  function _css() {
    if (document.getElementById('guardia-modal-css')) return;
    const st = document.createElement('style');
    st.id = 'guardia-modal-css';
    st.textContent = `
      #guardia-overlay{position:fixed;inset:0;z-index:9500;background:rgba(2,6,23,.66);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:14px}
      #guardia-overlay.on{display:flex}
      #guardia-box{width:min(620px,100%);max-height:92vh;overflow:auto;background:var(--card-bg,#fff);color:var(--text-main,#1e293b);border:1px solid var(--border,#e2e8f0);
        border-radius:20px;padding:20px 20px 16px;box-shadow:0 30px 70px -20px rgba(0,0,0,.55);font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:gmIn .3s both}
      @keyframes gmIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      .gm-h{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
      .gm-h h3{margin:0;font-size:1.15rem;font-weight:800}
      .gm-h p{margin:4px 0 0;font-size:.8rem;color:var(--text-muted,#64748b)}
      .gm-x{border:1px solid var(--border,#e2e8f0);background:var(--bg-body,#f8fafc);color:inherit;border-radius:10px;width:34px;height:34px;cursor:pointer;font-size:1rem}
      .gm-store{margin:14px 0 4px;padding:10px 12px;border:1px solid var(--border,#e2e8f0);border-radius:12px;background:var(--bg-body,#f8fafc);font-size:.78rem}
      .gm-bar{height:8px;border-radius:8px;background:var(--border,#e2e8f0);overflow:hidden;margin-top:6px}
      .gm-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--nika-primary,#0284c7),#38bdf8);transition:width .25s}
      .gm-sec{margin-top:16px}
      .gm-sec h4{margin:0 0 8px;font-size:.72rem;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-muted,#64748b);font-weight:800;display:flex;justify-content:space-between;align-items:center}
      .gm-link{border:0;background:none;color:var(--nika-primary,#0284c7);font-weight:700;font-size:.74rem;font-family:inherit;cursor:pointer;text-transform:none;letter-spacing:0}
      .gm-list{display:flex;flex-direction:column;gap:6px}
      .gm-row{display:flex;align-items:center;gap:10px;padding:9px 11px;border:1px solid var(--border,#e2e8f0);border-radius:12px;cursor:pointer;transition:.2s;font-size:.84rem}
      .gm-row:hover{border-color:var(--nika-primary,#0284c7)}
      .gm-row input{accent-color:var(--nika-primary,#0284c7);width:18px;height:18px;flex:none}
      .gm-row .t{flex:1;min-width:0;line-height:1.25}
      .gm-row .t b{display:block;font-weight:700}
      .gm-row .t small{display:block;color:var(--text-muted,#64748b);font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .gm-tag{font-size:.66rem;font-weight:800;padding:3px 8px;border-radius:20px;background:rgba(22,163,74,.13);color:#15803d;white-space:nowrap}
      .gm-tag.ko{background:rgba(220,38,38,.12);color:#b91c1c} .gm-tag.wait{background:rgba(2,132,199,.12);color:var(--nika-primary,#0284c7)}
      .gm-foot{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:16px}
      .gm-btn{border:1px solid var(--border,#e2e8f0);background:var(--card-bg,#fff);color:inherit;font-weight:700;font-size:.84rem;font-family:inherit;padding:11px 16px;border-radius:12px;cursor:pointer;min-height:44px}
      .gm-btn.pri{background:var(--nika-primary,#0284c7);border-color:var(--nika-primary,#0284c7);color:#fff}
      .gm-btn[disabled]{opacity:.5;cursor:not-allowed}
      .gm-msg{font-size:.78rem;color:var(--text-muted,#64748b);margin-top:10px;min-height:1.2em}
      .gm-warn{margin-top:10px;padding:9px 12px;border-radius:12px;background:rgba(234,179,8,.15);border:1px solid rgba(234,179,8,.45);color:#a16207;font-size:.78rem;font-weight:600}
      body.dark-mode .gm-warn{color:#facc15}
    `;
    document.head.appendChild(st);
  }

  function _html() {
    const ov = document.createElement('div');
    ov.id = 'guardia-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Descargar para Guardia');
    ov.innerHTML = `
      <div id="guardia-box">
        <div class="gm-h">
          <div><h3>🛡️ Descargar para Guardia</h3>
            <p>Llevate lo que necesitás para estudiar y rendir sin señal. Tu progreso se sube solo cuando vuelva la conexión.</p></div>
          <button class="gm-x" data-gm="cerrar" aria-label="Cerrar">✕</button>
        </div>
        <div class="gm-store" id="gm-store">Calculando espacio…</div>
        <div id="gm-warn"></div>

        <div class="gm-sec">
          <h4><span>Unidades Problema (<span id="gm-mod"></span>)</span><button class="gm-link" data-gm="todas">Seleccionar todas</button></h4>
          <div class="gm-list" id="gm-ups"></div>
        </div>

        <div class="gm-sec">
          <h4><span>Más para llevar</span></h4>
          <div class="gm-list">
            <label class="gm-row"><input type="checkbox" id="gm-farma"><span class="t"><b>💊 Vademécum NikaFarma completo</b><small id="gm-farma-s">~4 MB · fármacos, síndromes, patógenos y calculadoras</small></span><span id="gm-farma-t"></span></label>
            <label class="gm-row"><input type="checkbox" id="gm-locales"><span class="t"><b>🦴 Bancos de Traumatología y Suturas</b><small>Bancos locales del simulador (~0,2 MB)</small></span><span id="gm-locales-t"></span></label>
            <label class="gm-row"><input type="checkbox" id="gm-respaldo" checked><span class="t"><b>⚡ Respaldos del simulador</b><small>Simulacro rápido ELO y base de emergencia de Cirugía</small></span><span id="gm-respaldo-t"></span></label>
          </div>
        </div>

        <div class="gm-msg" id="gm-msg"></div>
        <div class="gm-bar" id="gm-bar-wrap" style="display:none"><i id="gm-bar"></i></div>

        <div class="gm-foot">
          <button class="gm-btn" data-gm="borrar">🗑️ Borrar descargas</button>
          <div style="display:flex;gap:8px;align-items:center"><span id="gm-est" style="font-size:.76rem;color:var(--text-muted,#64748b)"></span>
            <button class="gm-btn pri" data-gm="descargar" id="gm-go">Descargar</button></div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => {
      if (e.target === ov && !_ocupado) return cerrar();
      const b = e.target.closest('[data-gm]');
      if (!b) return;
      const a = b.dataset.gm;
      if (a === 'cerrar' && !_ocupado) cerrar();
      if (a === 'todas') _toggleTodas();
      if (a === 'descargar') descargar();
      if (a === 'borrar') borrar();
    });
    ov.addEventListener('change', _actualizarEstimado);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on') && !_ocupado) cerrar(); });
  }

  // ------------------------------------------------------------
  // Estado / render
  // ------------------------------------------------------------
  async function _cargarTitulos() {
    try {
      const r = await fetch(`data/${modulo()}.json`);
      if (!r.ok) return;
      const d = await r.json();
      (d.units || []).forEach((u) => { _titulos[u.number] = u.title; });
    } catch (_) {}
  }

  async function refrescar() {
    $('#gm-mod').textContent = modulo();
    try {
      const lista = await OfflineStorage.listarUPsLocales(modulo());
      _locales = {};
      lista.forEach((x) => { _locales[x.upId] = x; });
      _farmaInfo = await OfflineStorage.infoNikaFarmaLocal();
    } catch (e) {
      _locales = {}; _farmaInfo = null;
      $('#gm-warn').innerHTML = `<div class="gm-warn">⚠️ Este navegador no permite guardar datos sin conexión (IndexedDB no disponible). Probá fuera del modo privado.</div>`;
    }

    $('#gm-ups').innerHTML = UPS.map((n) => {
      const id = upId(n), loc = _locales[id];
      return `<label class="gm-row"><input type="checkbox" data-up="${id}" ${loc ? '' : ''}>
        <span class="t"><b>UP ${n}</b><small>${esc(_titulos[n] || 'Banco de preguntas')}</small></span>
        <span id="gm-up-${id}">${loc ? `<span class="gm-tag">✓ ${loc.total} preg · ${fmt(loc.bytes)}</span>` : ''}</span></label>`;
    }).join('');

    $('#gm-farma-t').innerHTML = _farmaInfo ? `<span class="gm-tag">✓ ${fmt(_farmaInfo.bytes)}</span>` : '';
    $('#gm-farma-s').textContent = _farmaInfo
      ? `Descargado ${new Date(_farmaInfo.updatedAt).toLocaleDateString('es-AR')} · ${_farmaInfo.farmacos} fármacos, ${_farmaInfo.fichas} fichas`
      : '~4 MB · fármacos, síndromes, patógenos y calculadoras';

    await _mostrarEspacio();
    _actualizarEstimado();
    _avisoConexion();
  }

  async function _mostrarEspacio() {
    const e = await OfflineStorage.estimarAlmacenamiento();
    if (!e.disponible || !e.quota) { $('#gm-store').textContent = 'Espacio: el navegador no informa la cuota disponible.'; return; }
    const pct = Math.min(100, Math.round((e.usage / e.quota) * 100));
    $('#gm-store').innerHTML = `💾 Espacio usado por Campus Nika: <b>${fmt(e.usage)}</b> de ${fmt(e.quota)} disponibles (${pct}%)
      <div class="gm-bar"><i style="width:${Math.max(2, pct)}%"></i></div>`;
  }

  function _avisoConexion() {
    const off = window.SyncManager ? SyncManager.estaOffline() : !navigator.onLine;
    const w = $('#gm-warn');
    if (off) {
      w.innerHTML = `<div class="gm-warn">🟡 Sin conexión: solo podés descargar cuando tengas señal. Lo que ya bajaste sigue disponible.</div>`;
      $('#gm-go').disabled = true;
    } else if (!w.innerHTML.includes('IndexedDB')) {
      w.innerHTML = '';
      $('#gm-go').disabled = _ocupado;
    }
  }

  function _seleccion() {
    return {
      ups: Array.from(document.querySelectorAll('#gm-ups input:checked')).map((c) => c.dataset.up),
      farma: $('#gm-farma').checked,
      locales: $('#gm-locales').checked,
      respaldo: $('#gm-respaldo').checked,
    };
  }

  function _toggleTodas() {
    const cbs = Array.from(document.querySelectorAll('#gm-ups input'));
    const marcar = cbs.some((c) => !c.checked);
    cbs.forEach((c) => { c.checked = marcar; });
    _actualizarEstimado();
  }

  function _actualizarEstimado() {
    const s = _seleccion();
    const conocidos = Object.values(_locales).map((x) => x.bytes).filter(Boolean);
    const promUP = conocidos.length ? conocidos.reduce((a, b) => a + b, 0) / conocidos.length : EST_UP_BYTES;
    const total = s.ups.length * promUP + (s.farma ? EST_FARMA_BYTES : 0) + (s.locales ? EST_LOCALES_BYTES : 0) + (s.respaldo ? EST_RESPALDO_BYTES : 0);
    $('#gm-est').textContent = total ? `≈ ${fmt(total)}` : '';
  }

  function _progreso(pct, msg) {
    $('#gm-bar-wrap').style.display = 'block';
    $('#gm-bar').style.width = `${Math.max(0, Math.min(100, pct))}%`;
    if (msg !== undefined) $('#gm-msg').textContent = msg;
  }

  // ------------------------------------------------------------
  // Service Worker: pedirle que cachee una lista de URLs
  // ------------------------------------------------------------
  async function _cachearConSW(urls, alProgreso) {
    if (!('serviceWorker' in navigator) || !urls.length) return { ok: false, fallidas: urls };
    try {
      const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, rej) => setTimeout(() => rej(new Error('sin SW')), 4000))]);
      const sw = reg.active;
      if (!sw) return { ok: false, fallidas: urls };
      return await new Promise((resolve) => {
        const canal = new MessageChannel();
        const t = setTimeout(() => resolve({ ok: false, fallidas: urls }), 60000);
        canal.port1.onmessage = (ev) => {
          const m = ev.data || {};
          if (m.type === 'progress' && alProgreso) alProgreso(m.hechas, m.total);
          if (m.type === 'done') { clearTimeout(t); resolve({ ok: m.ok, fallidas: m.fallidas || [] }); }
        };
        sw.postMessage({ type: 'CACHE_URLS', urls }, [canal.port2]);
      });
    } catch (_) { return { ok: false, fallidas: urls }; }
  }

  // ------------------------------------------------------------
  // Descarga
  // ------------------------------------------------------------
  async function _descargarFarma(alProgreso) {
    const r = await fetch(URL_FARMA, { cache: 'no-cache' });     // pasa por el SW: queda también en su caché
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    let json;
    if (r.body && r.body.getReader) {
      const reader = r.body.getReader(); const partes = []; let leidos = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        partes.push(value); leidos += value.length;
        alProgreso(Math.min(0.97, leidos / EST_FARMA_BYTES));
      }
      const buf = new Uint8Array(leidos); let o = 0;
      partes.forEach((p) => { buf.set(p, o); o += p.length; });
      json = JSON.parse(new TextDecoder('utf-8').decode(buf));
    } else {
      json = await r.json();
    }
    alProgreso(0.99);
    await OfflineStorage.guardarNikaFarmaLocal(json);
    alProgreso(1);
  }

  async function descargar() {
    if (_ocupado) return;
    const s = _seleccion();
    if (!s.ups.length && !s.farma && !s.locales && !s.respaldo) { $('#gm-msg').textContent = 'Elegí al menos algo para descargar.'; return; }
    if (!navigator.onLine) { $('#gm-msg').textContent = 'Necesitás conexión para descargar.'; return; }

    _ocupado = true; $('#gm-go').disabled = true; $('#gm-go').textContent = 'Descargando…';
    OfflineStorage.pedirAlmacenamientoPersistente();

    const pasos = s.ups.length + (s.farma ? 1 : 0) + ((s.locales || s.respaldo) ? 1 : 0) + 1;   // +1: páginas de la app
    let hechos = 0;
    const avanzar = (extra = 0, msg) => _progreso(((hechos + extra) / pasos) * 100, msg);
    let ok = 0; const errores = [];
    avanzar(0, 'Preparando descarga…');

    // 1) Bancos de UPs (Supabase -> IndexedDB)
    for (const id of s.ups) {
      avanzar(0, `Descargando UP ${Number(id)}…`);
      const marca = $(`#gm-up-${id}`);
      try {
        if (!window.NikaSupabase || !NikaSupabase.obtenerBancoJSON) throw new Error('Sin conexión con Supabase');
        const res = await NikaSupabase.obtenerBancoJSON({ modulo: modulo(), upId: id });
        if (res.error) throw new Error(res.error.message || 'Error de red');
        const preguntas = res.data && res.data.data;
        if (!Array.isArray(preguntas) || !preguntas.length) throw new Error('La UP todavía no tiene preguntas cargadas');
        const g = await OfflineStorage.guardarUPLocal(modulo(), id, preguntas);
        if (marca) marca.innerHTML = `<span class="gm-tag">✓ ${g.total} preg · ${fmt(g.bytes)}</span>`;
        ok++;
      } catch (e) {
        errores.push(`UP ${Number(id)}: ${e.message}`);
        if (marca) marca.innerHTML = `<span class="gm-tag ko">✕ error</span>`;
        if (window.SyncManager && /failed to fetch|network/i.test(String(e.message))) SyncManager.marcarRedCaida();
      }
      hechos++; avanzar(0);
    }

    // 2) Vademécum
    if (s.farma) {
      try {
        await _descargarFarma((f) => avanzar(f, `Descargando vademécum… ${Math.round(f * 100)}%`));
        $('#gm-farma-t').innerHTML = `<span class="gm-tag">✓ listo</span>`;
        ok++;
      } catch (e) {
        errores.push(`Vademécum: ${e.message}`);
        $('#gm-farma-t').innerHTML = `<span class="gm-tag ko">✕ error</span>`;
      }
      hechos++; avanzar(0);
    }

    // 3) Bancos locales + respaldos (caché del Service Worker)
    const urls = [];
    if (s.locales) urls.push(...URLS_LOCALES);
    if (s.respaldo) urls.push(...URLS_RESPALDO);
    if (urls.length) {
      avanzar(0, 'Guardando bancos locales…');
      const r = await _cachearConSW(urls, (h, t) => avanzar(h / t));
      if (r.ok) { ok++; if (s.locales) $('#gm-locales-t').innerHTML = `<span class="gm-tag">✓ listo</span>`; if (s.respaldo) $('#gm-respaldo-t').innerHTML = `<span class="gm-tag">✓ listo</span>`; }
      else errores.push('Algunos archivos locales no se pudieron guardar' + (r.fallidas.length ? ` (${r.fallidas.join(', ')})` : ''));
      hechos++; avanzar(0);
    }

    // 4) Páginas y scripts de la app (para abrir todo sin señal)
    avanzar(0, 'Guardando páginas de la app…');
    const app = await _cachearConSW(URLS_APP);
    if (!app.ok) console.warn('[GuardiaModal] No se cachearon algunas páginas:', app.fallidas);
    hechos++; avanzar(0);

    _progreso(100, errores.length
      ? `Listo con avisos: ${ok} descarga(s) ok. ${errores.join(' · ')}`
      : `✅ Todo listo (${ok} descarga${ok === 1 ? '' : 's'}). Ya podés usar Campus Nika sin conexión.`);

    _ocupado = false; $('#gm-go').textContent = 'Descargar'; $('#gm-go').disabled = false;
    await refrescar();
    _progreso(100);
    if (typeof window.showToast === 'function' && !errores.length) window.showToast('🛡️ Descarga para Guardia completa.');
  }

  async function borrar() {
    if (_ocupado) return;
    if (!confirm('¿Borrar los bancos y el vademécum descargados de este dispositivo? (Tu progreso pendiente de subir NO se borra.)')) return;
    try {
      for (const x of Object.values(_locales)) await OfflineStorage.eliminarUPLocal(x.modulo, x.upId);
      await OfflineStorage.eliminarNikaFarmaLocal();
      $('#gm-msg').textContent = '🗑️ Descargas borradas.';
    } catch (e) { $('#gm-msg').textContent = 'No se pudo borrar: ' + e.message; }
    await refrescar();
  }

  // ------------------------------------------------------------
  // Abrir / cerrar
  // ------------------------------------------------------------
  async function abrir() {
    if (!window.OfflineStorage) { alert('El módulo de almacenamiento offline no está cargado.'); return; }
    if (!_montado) { _css(); _html(); _montado = true; await _cargarTitulos(); }
    $('#gm-msg').textContent = '';
    $('#gm-bar-wrap').style.display = 'none';
    $('#guardia-overlay').classList.add('on');
    await refrescar();
  }
  function cerrar() { const o = $('#guardia-overlay'); if (o) o.classList.remove('on'); }

  // Cualquier elemento con data-guardia-open abre el modal
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-guardia-open]');
    if (t) { e.preventDefault(); abrir(); }
  });
  window.addEventListener('nika:sync-state', () => { if (_montado && $('#guardia-overlay').classList.contains('on')) _avisoConexion(); });

  return { abrir, cerrar, refrescar };
})();

window.GuardiaModal = GuardiaModal;
