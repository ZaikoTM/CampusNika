/* CAMPUS NIKA · Conversiones en segundo plano (PowerPoint/Word → PDF para el Lector Nika)
   · La cola vive en IndexedDB: el archivo original y cada hoja ya convertida se guardan a medida que avanza.
     Si la persona cambia de página o cierra la pestaña, al volver (en cualquier página con este script) la conversión retoma donde quedó.
   · Una sola pestaña convierte a la vez (navigator.locks); las demás ven el avance por BroadcastChannel.
   · Un cartel flotante muestra el avance, la cola y los archivos que faltan convertir (con botón para convertirlos de una vez).
   API: NikaConv.encolar({id, title, bytes?}) · escuchar(fn) · estado(id) · enCurso(id) · pdfDe(id) · mirar(id) · cancelar(id) · iniciarAvisos() */
(function () {
  'use strict';
  if (window.NikaConv) return;

  const API_KEY = 'AIzaSyB0MSmTC-gBB7hiw-MUqst1-m1iN8e-eDQ';
  const DRIVE = 'https://www.googleapis.com/drive/v3/files/';
  const LS_SCAN = 'nika_conv_scan', LS_NO = 'nika_conv_no', LS_OCULTO = 'nika_conv_oculto';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmtMB = (b) => b >= 1e9 ? (b / 1e9).toFixed(2).replace('.', ',') + ' GB' : Math.max(1, Math.round(b / 1e6)) + ' MB';
  const ls = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const aviso = (m) => { if (typeof window.showToast === 'function') window.showToast(m); };

  // ------------------------------------------------------------------ almacenamiento (IndexedDB)
  let _db = null;
  const db = () => _db || (_db = new Promise((res, rej) => {
    const r = indexedDB.open('nika-conv', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('jobs', { keyPath: 'id' }); d.createObjectStore('src'); d.createObjectStore('pags'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  async function tx(store, modo, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(store, modo); let rq;
      try { rq = fn(t.objectStore(store)); } catch (e) { rej(e); return; }
      t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  }
  const jobsTodos = () => tx('jobs', 'readonly', (s) => s.getAll()).then((l) => (l || []).sort((a, b) => a.ts - b.ts));
  const limpiarJob = async (id) => {
    await tx('jobs', 'readwrite', (s) => s.delete(id)).catch(() => {});
    await tx('src', 'readwrite', (s) => s.delete(id)).catch(() => {});
    await tx('pags', 'readwrite', (s) => s.delete(IDBKeyRange.bound(id + '|', id + '|￿'))).catch(() => {});
  };

  // ------------------------------------------------------------------ avisos entre pestañas y a quien escucha
  const oyentes = new Set(), vivo = new Map(), mirando = new Set(), ultimo = new Map();
  let BC = null; try { if ('BroadcastChannel' in window) BC = new BroadcastChannel('nika-conv'); } catch (_) {}
  function recibir(m) {
    if (!m || !m.id) return;
    if (m.k === 'fin' || m.k === 'err' || m.k === 'quitado') vivo.delete(m.id);
    else { const v = vivo.get(m.id) || { id: m.id, i: 0, t: 0 }; if (m.title) v.title = m.title; if (m.k === 'prog') { v.i = m.i; v.t = m.t; v.run = true; v.fase = ''; } if (m.k === 'fase') { v.run = true; v.fase = m.a; v.det = m.b; } if (m.k === 'baja') { v.run = true; v.fase = 'Descargando de Drive…'; v.det = m.det; } vivo.set(m.id, v); }
    oyentes.forEach((f) => { try { f(m); } catch (_) {} });
    pintar();
    if (m.k === 'fin' || m.k === 'err' || m.k === 'quitado') setTimeout(() => { if (window.NikaConv) refrescarPend(); }, 300);
  }
  function emitir(m) { recibir(m); if (BC) { try { BC.postMessage(m); } catch (_) {} } }
  if (BC) BC.onmessage = (e) => recibir(e.data);

  // ------------------------------------------------------------------ módulos que se cargan solo cuando hace falta
  function cargarJs(src, listo) {
    if (listo()) return Promise.resolve(listo());
    return new Promise((ok) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(listo()); s.onerror = () => ok(null); document.head.appendChild(s); });
  }
  const cargarOffline = () => cargarJs('js/estudio/pdfOffline.js?v=5', () => window.NikaPdfOffline);
  const cargarConv = () => cargarJs('js/estudio/pdfConvertir.js?v=4', () => window.NikaPdfConvertir);

  // ------------------------------------------------------------------ cola y ejecución
  let _corriendo = false, _pidiendo = false, _actual = null; const _cancel = new Set();

  async function bajar(j) {
    let r = await fetch(`${DRIVE}${encodeURIComponent(j.id)}?alt=media&supportsAllDrives=true&key=${API_KEY}`);
    if (!r.ok) throw new Error('Drive respondió ' + r.status);
    const total = Number(r.headers.get('content-length') || 0);
    if (total > 2e9) throw new Error('El archivo es demasiado grande para convertirlo en este dispositivo.');
    const partes = []; let n = 0, ult = 0;
    const rd = r.body.getReader();
    for (;;) {
      const { done, value } = await rd.read(); if (done) break;
      if (_cancel.has(j.id)) { try { rd.cancel(); } catch (_) {} throw new Error('cancelado'); }
      partes.push(value); n += value.length;
      if (Date.now() - ult > 400) { ult = Date.now(); emitir({ k: 'baja', id: j.id, title: j.title, det: fmtMB(n) + (total ? ' de ' + fmtMB(total) : '') }); }
    }
    return new Uint8Array(await new Blob(partes).arrayBuffer());
  }

  async function correr(j) {
    _actual = j.id;
    try {
      if (j.intentos >= 3) throw new Error('No se pudo convertir este archivo en este dispositivo (se cortó varias veces). Se muestra con el visor de Drive.');
      j.intentos = (j.intentos || 0) + 1; await tx('jobs', 'readwrite', (s) => s.put(j));
      emitir({ k: 'fase', id: j.id, title: j.title, a: 'Preparando…', b: '' });
      let bytes = await tx('src', 'readonly', (s) => s.get(j.id));
      if (!bytes) { bytes = await bajar(j); await tx('src', 'readwrite', (s) => s.put(bytes, j.id)).catch(() => {}); }
      if (_cancel.has(j.id)) throw new Error('cancelado');
      const [NC, OFF] = await Promise.all([cargarConv(), cargarOffline()]);
      if (!NC) throw new Error('No se pudo cargar el conversor.');
      if (!NC.tipo(bytes)) throw new Error('Este tipo de archivo no se puede convertir.');
      const pdf = await NC.convertir(bytes, {
        titulo: j.title,
        cp: { leer: (i) => tx('pags', 'readonly', (s) => s.get(j.id + '|' + i)), guardar: (i, u) => tx('pags', 'readwrite', (s) => s.put(u, j.id + '|' + i)) },
        alAvance: (i, t) => emitir({ k: 'prog', id: j.id, title: j.title, i, t }),
        alFase: (a, b) => emitir({ k: 'fase', id: j.id, title: j.title, a, b }),
        cancelado: () => _cancel.has(j.id),
      });
      ultimo.set(j.id, pdf);
      if (OFF) await OFF.guardarConv(j.id, j.title, pdf);
      await limpiarJob(j.id);
      if (!mirando.has(j.id)) aviso('«' + j.title + '» ya está convertido ✅ Abrilo con el Lector NikaMed');
      emitir({ k: 'fin', id: j.id, title: j.title });
    } catch (e) {
      const msg = (e && e.message) || 'Error';
      await limpiarJob(j.id);
      if (msg === 'cancelado') emitir({ k: 'quitado', id: j.id });
      else {
        if (/antiguo|pesa demasiado|demasiado grande|no se puede convertir/i.test(msg)) { const no = ls(LS_NO, []); if (!no.includes(j.id)) { no.push(j.id); lsSet(LS_NO, no); } }
        if (!mirando.has(j.id)) aviso('No se pudo convertir «' + j.title + '»: ' + msg);
        emitir({ k: 'err', id: j.id, title: j.title, msg });
      }
    } finally { _cancel.delete(j.id); _actual = null; }
  }

  async function bucle() {
    _corriendo = true;
    try { for (;;) { const j = (await jobsTodos())[0]; if (!j) break; await correr(j); } } finally { _corriendo = false; }
  }
  function procesar() {
    if (_pidiendo) return; _pidiendo = true;
    const fin = () => { _pidiendo = false; jobsTodos().then((l) => { if (l.length) procesar(); }).catch(() => {}); };
    if (navigator.locks && navigator.locks.request) navigator.locks.request('nika-conv-runner', () => bucle()).then(fin, fin);   // si otra pestaña convierte, esta espera su turno (y retoma sola si esa se cierra)
    else bucle().then(fin, fin);
  }

  async function encolar(op) {
    const ya = (await jobsTodos()).find((x) => x.id === op.id);
    if (!ya) {
      if (op.bytes) await tx('src', 'readwrite', (s) => s.put(op.bytes, op.id));
      await tx('jobs', 'readwrite', (s) => s.put({ id: op.id, title: op.title || 'Documento', ts: Date.now(), intentos: 0 }));
      const no = ls(LS_NO, []).filter((x) => x !== op.id); lsSet(LS_NO, no);
      emitir({ k: 'cola', id: op.id, title: op.title });
    }
    procesar();
  }

  // ------------------------------------------------------------------ archivos que faltan convertir (se revisan de a poco en segundo plano)
  const claseMime = (m) => /presentationml|wordprocessingml/.test(m) ? 'o' : 'x';
  let _escaneando = false;
  async function escanear() {
    if (_escaneando || navigator.onLine === false) return; _escaneando = true;
    try {
      const OFF = await cargarOffline(); if (!OFF) return;
      const S = ls(LS_SCAN, { v: {}, o: {} }); let n = 0;
      for (const f of OFF.FUENTES) {
        let cat; try { cat = await OFF.catalogo(f); } catch (_) { continue; }
        for (const u of cat.unidades) for (const a of u.archivos) {
          if (S.v[a.id]) continue;
          let m = OFF.metaCache(a.id); if (!m || !m.mime) { m = await OFF.metaDrive(a.id, 6000); await dormir(120); }
          if (!m || !m.mime) continue;
          S.v[a.id] = claseMime(m.mime);
          if (S.v[a.id] === 'o') S.o[a.id] = { t: a.titulo, m: f.nombre, u: u.titulo, s: m.size || 0 };
          if (++n % 10 === 0) { lsSet(LS_SCAN, S); pintar(); }
        }
      }
      lsSet(LS_SCAN, S);
    } catch (_) {} finally { _escaneando = false; pintar(); }
  }
  async function pendientes() {
    const S = ls(LS_SCAN, { v: {}, o: {} }), no = ls(LS_NO, []), OFF = window.NikaPdfOffline, out = [];
    for (const id of Object.keys(S.o)) {
      if (no.includes(id) || vivo.has(id)) continue;
      if (OFF && await OFF.tieneConv(id)) continue;
      out.push(Object.assign({ id }, S.o[id]));
    }
    return out;
  }

  // ------------------------------------------------------------------ cartel flotante
  let _pend = [], _panel = false, _css = false;
  function estilos() {
    if (_css) return; _css = true;
    const st = document.createElement('style');
    st.textContent = `#nkc{position:fixed;left:14px;bottom:14px;z-index:99990;font-family:inherit;max-width:min(380px,calc(100vw - 28px))}
@media(max-width:700px){#nkc{bottom:78px}}
#nkc .nkc-pill{display:flex;align-items:center;gap:8px;border:1px solid rgba(124,58,237,.5);background:linear-gradient(120deg,#1e1b4b,#4c1d95);color:#fff;border-radius:999px;padding:8px 14px;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;box-shadow:0 8px 22px rgba(30,27,75,.4);max-width:100%}
#nkc .nkc-pill span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#nkc .nkc-gira{display:inline-block;animation:nkcg 1.6s linear infinite}@keyframes nkcg{to{transform:rotate(360deg)}}
#nkc .nkc-panel{position:absolute;left:0;bottom:46px;width:min(380px,calc(100vw - 28px));max-height:60vh;overflow:auto;background:#fff;color:#1e293b;border-radius:16px;border:1px solid #c4b5fd;box-shadow:0 18px 44px rgba(15,23,42,.35);padding:12px 14px;font-size:.78rem}
#nkc h5{margin:8px 0 6px;font-size:.8rem;color:#4c1d95}#nkc h5:first-child{margin-top:0}
#nkc .nkc-f{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #eef2f7}
#nkc .nkc-f b{flex:1;min-width:0;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#nkc .nkc-f small{display:block;color:#64748b;font-weight:500;white-space:normal}
#nkc .nkc-barra{height:6px;border-radius:99px;background:#e9d5ff;overflow:hidden;margin-top:4px}#nkc .nkc-barra i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#a855f7)}
#nkc button.nkc-b{border:1px solid #7c3aed;background:#7c3aed;color:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:.72rem;font-weight:700;cursor:pointer;white-space:nowrap}
#nkc button.nkc-b.g{background:transparent;color:#6d28d9}
#nkc .nkc-x{border:0;background:transparent;color:#cbd5e1;cursor:pointer;font-size:1rem;padding:0 2px}`;
    document.head.appendChild(st);
  }
  function pintar() {
    if (!document.body) return;
    let el = document.getElementById('nkc');
    const act = [...vivo.values()], cur = act.find((v) => v.run) || null, ocultoHasta = ls(LS_OCULTO, 0);
    const mostrarPend = _pend.length && Date.now() > ocultoHasta;
    if (!act.length && !mostrarPend) { if (el) el.remove(); return; }
    estilos();
    if (!el) {
      el = document.createElement('div'); el.id = 'nkc'; el.innerHTML = '<div class="nkc-panel" hidden></div><button type="button" class="nkc-pill"></button>';
      el.querySelector('.nkc-pill').addEventListener('click', () => { _panel = !_panel; pintar(); });
      el.addEventListener('click', alClick);
      document.body.appendChild(el);
    }
    const pill = el.querySelector('.nkc-pill'), panel = el.querySelector('.nkc-panel');
    let txt;
    if (cur) { const resto = act.length - 1; txt = '<b class="nkc-gira">⚙️</b><span>Convirtiendo «' + esc(cur.title || 'documento') + '»' + (cur.t ? ' · ' + Math.min(cur.i + 1, cur.t) + '/' + cur.t : '') + (resto ? ' · +' + resto + ' en cola' : '') + '</span>'; }
    else if (act.length) txt = '<b>⏳</b><span>' + act.length + ' en cola para convertir</span>';
    else txt = '<b>📄</b><span>' + _pend.length + ' archivo' + (_pend.length === 1 ? '' : 's') + ' sin convertir</span>';
    if (pill.dataset.t !== txt) { pill.innerHTML = txt; pill.dataset.t = txt; }
    panel.hidden = !_panel;
    if (_panel) panel.innerHTML = htmlPanel(act, cur);
  }
  function htmlPanel(act, cur) {
    let h = '';
    if (act.length) {
      h += '<h5>Convirtiendo en segundo plano</h5>';
      act.forEach((v) => {
        const pct = v.t ? Math.round((v.i / v.t) * 100) : 0;
        h += '<div class="nkc-f"><b>' + esc(v.title || 'Documento') + '<small>' + (v.run ? (v.t ? 'Página ' + Math.min(v.i + 1, v.t) + ' de ' + v.t : esc((v.fase || '') + (v.det ? ' · ' + v.det : ''))) : 'En cola') + '</small>' + (v.run ? '<div class="nkc-barra"><i style="width:' + Math.max(4, pct) + '%"></i></div>' : '') + '</b><button class="nkc-x" data-c="' + esc(v.id) + '" title="Cancelar" aria-label="Cancelar">✕</button></div>';
      });
      h += '<small style="display:block;color:#64748b;margin-top:6px">Podés seguir usando la página: si cambiás de sección o cerrás, retoma sola al volver.</small>';
    }
    if (_pend.length) {
      h += '<h5>Archivos que faltan convertir (' + _pend.length + ')</h5>';
      _pend.slice(0, 40).forEach((p) => { h += '<div class="nkc-f"><b>' + esc(p.t) + '<small>' + esc(p.m) + (p.s ? ' · ' + fmtMB(p.s) : '') + '</small></b><button class="nkc-b g" data-p="' + esc(p.id) + '">Convertir</button></div>'; });
      if (_pend.length > 40) h += '<small>…y ' + (_pend.length - 40) + ' más</small>';
      h += '<div style="display:flex;gap:8px;margin-top:10px"><button class="nkc-b" data-todos="1">Convertir todos</button><button class="nkc-b g" data-oculto="1">Recordármelo después</button></div>';
      h += '<small style="display:block;color:#64748b;margin-top:6px">Convertirlos ahora ahorra espera: después abren al instante y también sin conexión.</small>';
    }
    return h;
  }
  async function alClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.c) { cancelar(b.dataset.c); return; }
    if (b.dataset.p) { const p = _pend.find((x) => x.id === b.dataset.p); if (p) { await encolar({ id: p.id, title: p.t }); await refrescarPend(); } return; }
    if (b.dataset.todos) { for (const p of _pend.slice()) await encolar({ id: p.id, title: p.t }); await refrescarPend(); return; }
    if (b.dataset.oculto) { lsSet(LS_OCULTO, Date.now() + 3 * 864e5); _panel = false; pintar(); }
  }
  async function refrescarPend() { try { _pend = await pendientes(); } catch (_) { _pend = []; } pintar(); }

  async function cancelar(id) {
    if (_actual === id) { _cancel.add(id); return; }
    await limpiarJob(id); emitir({ k: 'quitado', id });
  }

  // ------------------------------------------------------------------ arranque
  const lista = (async () => {
    try {
      if (!window.indexedDB) return;
      (await jobsTodos()).forEach((j) => vivo.set(j.id, { id: j.id, title: j.title, i: 0, t: 0 }));
      if (vivo.size) { pintar(); setTimeout(procesar, 1500); }   // quedó algo a medias: se retoma solo
    } catch (_) {}
  })();

  window.addEventListener('beforeunload', (e) => { if (_corriendo) { e.preventDefault(); e.returnValue = 'Hay un documento convirtiéndose. Si salís, se pausa y sigue cuando vuelvas.'; } });

  window.NikaConv = {
    encolar, cancelar, pendientes,
    escuchar(fn) { oyentes.add(fn); return () => oyentes.delete(fn); },
    estado: (id) => vivo.get(id) || null,
    enCurso: async (id) => { await lista; return vivo.has(id); },
    mirar(id) { mirando.add(id); return () => mirando.delete(id); },
    pdfDe: async (id) => { if (ultimo.has(id)) return ultimo.get(id); const OFF = await cargarOffline(); return OFF ? OFF.leerConv(id) : null; },
    iniciarAvisos() {
      const ir = () => { refrescarPend(); setTimeout(() => escanear().then(refrescarPend), 4000); };
      if ('requestIdleCallback' in window) requestIdleCallback(ir, { timeout: 6000 }); else setTimeout(ir, 3000);
      window.addEventListener('nika-pdf-offline', refrescarPend);
    },
  };
  if (/estudio|sala_estudio/i.test(location.pathname)) window.NikaConv.iniciarAvisos();
})();
