/* CAMPUS NIKA · PDFs para leer sin conexión en el Lector Nika (js/estudio/pdfLector.js)
   · Los PDFs siguen en Google Drive: cada persona los descarga a SU dispositivo (Cache Storage del navegador) y el lector los abre
     desde ahí, con sus subrayados, notas y progreso de siempre. No se sube nada a ningún sitio nuevo.
   · Se puede bajar un archivo, una unidad o la materia entera (se ve el peso antes y se pide confirmación).
   · Con conexión, antes de usar la copia guardada se pregunta a Drive si el archivo cambió (md5): si cambió, se vuelve a bajar.
   · La interfaz de descargas vive dentro del Modo Sin conexión (js/guardiaModal.js) y el lector tiene un botón «Sin conexión» por archivo.
   · También guarda en el dispositivo las librerías del lector (pdf.js, pdf-lib) y el logo, para que abra sin señal.
   API: NikaPdfOffline.estado(id) · leer(id) · guardarBuffer(id, titulo, bytes, meta) · descargar(id, titulo, {alProgreso, signal})
        quitar(id) · lista() · espacio() · borrarTodo() · pintar(contenedor, {red}) · asegurarLibs() · libUrl(nombre) */
(function () {
  'use strict';
  if (window.NikaPdfOffline) return;

  const CACHE = 'pdf-offline';                                   // sin el prefijo «nika-»: el service worker nunca lo limpia al actualizar la app
  const API_KEY = 'AIzaSyB0MSmTC-gBB7hiw-MUqst1-m1iN8e-eDQ';     // clave pública de Drive (restringida por dominio), la misma del lector
  const DRIVE = 'https://www.googleapis.com/drive/v3/files/';
  const LIBS = {
    'pdf.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'pdf.worker.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'pdf-lib.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  };
  const FUENTES = [
    { id: 'cir', icono: '🔪', nombre: 'Cirugía', sub: '5.° año', url: 'data/cirugia.json', et: 'UP' },
    { id: 'gin', icono: '🤰', nombre: 'Ginecología y Obstetricia', sub: '5.° año', url: 'data/gineco_data.json', et: 'UP' },
    { id: 'siam', icono: '🫀', nombre: 'S.I.A.M.', sub: '5.° año', url: 'data/siam_data.json', et: 'UP' },
    { id: 'ml', icono: '⚖️', nombre: 'Medicina Legal', sub: '5.° año', url: 'data/medicinalegal.json', et: 'Unidad' },
    { id: 'md', icono: '🏃', nombre: 'Medicina Deportiva', sub: '5.° año', url: 'data/medicinadeportiva.json', et: 'Unidad' },
    { id: 'pfo', icono: '🎓', nombre: 'PFO · Práctica Final', sub: '6.° año', url: 'data/pfo_data.json', et: 'Módulo' },
  ];
  const KB = 1024, MB = KB * KB;
  const LS_META = 'nika_pdf_off_meta';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (n >= 1e9 ? (n / 1e9).toFixed(2).replace('.', ',') + ' GB' : n >= MB ? (n / MB).toFixed(n >= 100 * MB ? 0 : 1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / KB)) + ' KB');
  const llave = (id) => new Request(location.origin + '/__pdf_offline/' + encodeURIComponent(id));
  const llaveConv = (id) => new Request(location.origin + '/__pdf_conv/' + encodeURIComponent(id));   // PDFs convertidos desde PowerPoint/Word (js/estudio/pdfConvertir.js)
  const hayCache = () => typeof caches !== 'undefined' && !!caches.open;
  const hayRed = () => navigator.onLine !== false;

  // ------------------------------------------------------------------ tamaños y datos de Drive (se recuerdan para no volver a preguntar)
  let _meta = null;
  const metaTodos = () => { if (!_meta) { try { _meta = JSON.parse(localStorage.getItem(LS_META) || '{}') || {}; } catch (_) { _meta = {}; } } return _meta; };
  const guardarMetaLS = () => { try { localStorage.setItem(LS_META, JSON.stringify(_meta || {})); } catch (_) {} };

  function conTope(ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return { signal: c.signal, fin: () => clearTimeout(t) }; }

  // Datos del archivo en Drive: tamaño, md5 y última modificación. null si no se pudo consultar.
  async function metaDrive(id, ms) {
    const tp = conTope(ms || 8000);
    try {
      const r = await fetch(`${DRIVE}${encodeURIComponent(id)}?fields=id,name,size,md5Checksum,modifiedTime,mimeType&supportsAllDrives=true&key=${API_KEY}`, { signal: tp.signal });
      if (!r.ok) return null;
      const d = await r.json();
      const m = { size: Number(d.size) || 0, md5: d.md5Checksum || '', mod: d.modifiedTime || '', name: d.name || '', mime: d.mimeType || '' };
      metaTodos()[id] = m; guardarMetaLS();
      return m;
    } catch (_) { return null; } finally { tp.fin(); }
  }

  // ------------------------------------------------------------------ archivos guardados
  const datosDe = (resp, id) => {
    const h = resp.headers;
    return { id, titulo: decodeURIComponent(h.get('x-nika-titulo') || ''), size: Number(h.get('x-nika-size')) || 0, ts: Number(h.get('x-nika-ts')) || 0, md5: h.get('x-nika-md5') || '', mod: h.get('x-nika-mod') || '' };
  };
  async function estado(id) {
    if (!hayCache()) return null;
    try { const c = await caches.open(CACHE); const r = await c.match(llave(id)); return r ? datosDe(r, id) : null; } catch (_) { return null; }
  }
  async function lista() {
    if (!hayCache()) return [];
    try {
      const c = await caches.open(CACHE); const out = [];
      for (const rq of await c.keys()) {
        const m = /\/__pdf_offline\/([^/?#]+)$/.exec(rq.url); if (!m) continue;
        const r = await c.match(rq); if (r) out.push(datosDe(r, decodeURIComponent(m[1])));
      }
      return out;
    } catch (_) { return []; }
  }
  async function espacio() {
    try {
      if (!(navigator.storage && navigator.storage.estimate)) return { disponible: false };
      const e = await navigator.storage.estimate();
      return { disponible: true, usado: e.usage || 0, cuota: e.quota || 0, libre: Math.max(0, (e.quota || 0) - (e.usage || 0)) };
    } catch (_) { return { disponible: false }; }
  }
  async function pedirPersistencia() { try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (_) {} }

  async function guardarBuffer(id, titulo, datos, meta) {
    if (!hayCache()) throw new Error('Este navegador no permite guardar archivos sin conexión.');
    const blob = datos instanceof Blob ? datos : new Blob([datos], { type: 'application/pdf' });
    const m = meta || metaTodos()[id] || {};
    const c = await caches.open(CACHE);
    await c.put(llave(id), new Response(blob, { headers: {
      'Content-Type': 'application/pdf', 'Content-Length': String(blob.size),
      'x-nika-titulo': encodeURIComponent(titulo || m.name || 'PDF'), 'x-nika-size': String(blob.size), 'x-nika-ts': String(Date.now()),
      'x-nika-md5': m.md5 || '', 'x-nika-mod': m.mod || '',
    } }));
    pedirPersistencia();
    avisarCambio();
    return blob.size;
  }

  // Si el archivo ya estaba guardado y se vuelve a bajar (porque cambió en Drive), se renueva la copia sin preguntar.
  async function refrescarSiGuardado(id, titulo, bytes) {
    try { if (await estado(id)) { const md = await metaDrive(id, 4000); await guardarBuffer(id, titulo, bytes, md || undefined); } } catch (_) {}
  }

  // Lo que usa el lector al abrir: devuelve los bytes guardados si siguen vigentes (o si no hay conexión); si no, null.
  async function leer(id) {
    if (!hayCache()) return null;
    let r;
    try { const c = await caches.open(CACHE); r = await c.match(llave(id)); } catch (_) { return null; }
    if (!r) return null;
    if (hayRed()) {
      const md = await metaDrive(id, 3500);
      const md5 = r.headers.get('x-nika-md5') || '', mod = r.headers.get('x-nika-mod') || '';
      if (md && ((md.md5 && md5 && md.md5 !== md5) || (!md.md5 && md.mod && mod && md.mod !== mod))) return null;   // cambió en Drive: se baja de nuevo
    }
    try { return new Uint8Array(await r.arrayBuffer()); } catch (_) { return null; }
  }

  const avisarCambio = () => { try { window.dispatchEvent(new CustomEvent('nika-pdf-offline')); } catch (_) {} };
  // Versión convertida (PowerPoint/Word → PDF) de un archivo de Drive: se reutiliza mientras el original no cambie
  async function leerConv(id) {
    if (!hayCache()) return null;
    let r; try { const c = await caches.open(CACHE); r = await c.match(llaveConv(id)); } catch (_) { return null; }
    if (!r) return null;
    if (hayRed()) {
      const md = await metaDrive(id, 3500), md5 = r.headers.get('x-nika-md5') || '', mod = r.headers.get('x-nika-mod') || '';
      if (md && ((md.md5 && md5 && md.md5 !== md5) || (!md.md5 && md.mod && mod && md.mod !== mod))) return null;
    }
    try { return new Uint8Array(await r.arrayBuffer()); } catch (_) { return null; }
  }
  async function guardarConv(id, titulo, bytes) {
    if (!hayCache()) return;
    try {
      const m = metaTodos()[id] || await metaDrive(id, 4000) || {}, blob = new Blob([bytes], { type: 'application/pdf' });
      const c = await caches.open(CACHE);
      await c.put(llaveConv(id), new Response(blob, { headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(blob.size), 'x-nika-titulo': encodeURIComponent(titulo || ''), 'x-nika-ts': String(Date.now()), 'x-nika-md5': m.md5 || '', 'x-nika-mod': m.mod || '' } }));
      pedirPersistencia();
    } catch (_) {}
  }
  async function quitar(id) { try { const c = await caches.open(CACHE); const r = await c.delete(llave(id)); avisarCambio(); return r; } catch (_) { return false; } }
  async function borrarTodo() { try { await caches.delete(CACHE); } catch (_) {} avisarCambio(); }

  // Baja un archivo de Drive y lo guarda. alProgreso(bytes, total). Cancelable con AbortController.
  async function descargar(id, titulo, op) {
    op = op || {};
    const md = metaTodos()[id] || await metaDrive(id, 8000) || {};
    const sp = await espacio();
    if (sp.disponible && md.size && sp.libre && md.size * 1.1 > sp.libre) throw new Error('No hay espacio suficiente en este dispositivo para ' + fmt(md.size) + '.');
    let r = await fetch(`${DRIVE}${encodeURIComponent(id)}?alt=media&supportsAllDrives=true&key=${API_KEY}`, { signal: op.signal });
    if (!r.ok) r = await fetch(`${DRIVE}${encodeURIComponent(id)}/export?mimeType=application%2Fpdf&key=${API_KEY}`, { signal: op.signal });   // presentaciones y documentos de Google
    if (!r.ok) throw new Error('Drive respondió ' + r.status);
    const total = Number(r.headers.get('content-length')) || md.size || 0;
    if (total > 2e9) throw new Error('El archivo es demasiado grande para guardarlo.');
    const partes = []; let n = 0;
    if (r.body && r.body.getReader) {
      const rd = r.body.getReader();
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        partes.push(value); n += value.length; if (op.alProgreso) op.alProgreso(n, total);
      }
    } else { const b = new Uint8Array(await r.arrayBuffer()); partes.push(b); n = b.length; }
    const blob = new Blob(partes, { type: 'application/pdf' });
    const cab = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(cab[0], cab[1], cab[2], cab[3]) !== '%PDF') throw new Error('Drive no devolvió un PDF.');
    await guardarBuffer(id, titulo, blob, md);
    return n;
  }

  // ------------------------------------------------------------------ librerías del lector, para que abra sin señal
  async function asegurarLibs() {
    if (!hayCache() || !hayRed()) return;
    try {
      const c = await caches.open(CACHE);
      const urls = Object.values(LIBS).concat([location.origin + '/assets/n-nika.svg', location.origin + '/assets/nika-texto.svg']);
      for (const u of urls) { if (!(await c.match(u))) { try { const r = await fetch(u, { mode: u.startsWith(location.origin) ? 'same-origin' : 'cors' }); if (r.ok) await c.put(u, r); } catch (_) {} } }
    } catch (_) {}
  }
  const _urlsLib = {};
  async function libUrl(nombre) {
    if (_urlsLib[nombre]) return _urlsLib[nombre];
    try { const c = await caches.open(CACHE); const r = await c.match(LIBS[nombre]); if (!r) return null; return (_urlsLib[nombre] = URL.createObjectURL(await r.blob())); } catch (_) { return null; }
  }

  // ------------------------------------------------------------------ catálogo: qué PDFs tiene cada materia y unidad
  const _cat = {};
  const idDe = (u) => { const m = /\/file\/d\/([A-Za-z0-9_-]{10,})/.exec(u || '') || /[?&]id=([A-Za-z0-9_-]{10,})/.exec(u || ''); return m ? m[1] : null; };
  async function catalogo(f) {
    if (_cat[f.id]) return _cat[f.id];
    const r = await fetch(f.url);
    if (!r.ok) throw new Error('No se pudo leer la lista de materiales.');
    const d = await r.json();
    const vistos = new Set(), unidades = [];
    (d.units || []).forEach((u, i) => {
      const archivos = [];
      const visitar = (o) => {
        if (!o || typeof o !== 'object') return;
        if (Array.isArray(o)) { o.forEach(visitar); return; }
        if (typeof o.url === 'string' && (o.type === 'pdf' || /drive\.google\.com\/file\/d\//.test(o.url)) && o.type !== 'video') {
          const id = idDe(o.url);
          if (id && !archivos.some((a) => a.id === id)) archivos.push({ id, titulo: String(o.title || 'PDF').replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'PDF' });
        }
        Object.keys(o).forEach((k) => { if (typeof o[k] === 'object') visitar(o[k]); });
      };
      visitar(u.materiales); visitar(u.sections); visitar(u.secciones);
      if (archivos.length) unidades.push({ id: u.id || ('u' + i), titulo: `${f.et} ${u.number != null ? u.number : i + 1} · ${u.title || ''}`.trim(), archivos });
      archivos.forEach((a) => vistos.add(a.id));
    });
    return (_cat[f.id] = { unidades, ids: [...vistos] });
  }

  // ------------------------------------------------------------------ interfaz (dentro del Modo Sin conexión)
  let _ocupado = false, _cancelar = null, _estados = new Map(), _red = true, _root = null;

  function css() {
    if (document.getElementById('pdfo-css')) return;
    const st = document.createElement('style'); st.id = 'pdfo-css';
    st.textContent = `
.pdfo-nota{margin:0 0 10px;font-size:.78rem;color:var(--text-muted,#64748b);line-height:1.5}
.pdfo-mat{border:1px solid var(--border,#e2e8f0);border-radius:14px;margin-bottom:8px;background:var(--card-bg,#fff);overflow:hidden}
.pdfo-mat>summary,.pdfo-up>summary{display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer;list-style:none;font-weight:800;font-size:.86rem}
.pdfo-mat>summary::-webkit-details-marker,.pdfo-up>summary::-webkit-details-marker{display:none}
.pdfo-mat>summary::after,.pdfo-up>summary::after{content:'▾';margin-left:auto;transition:transform .2s;color:var(--text-muted,#64748b)}
.pdfo-mat:not([open])>summary::after,.pdfo-up:not([open])>summary::after{transform:rotate(-90deg)}
.pdfo-t{flex:1;min-width:0}.pdfo-t small{display:block;font-weight:600;font-size:.72rem;color:var(--text-muted,#64748b);margin-top:2px}
.pdfo-cuerpo{padding:0 12px 12px}
.pdfo-up{border:1px dashed var(--border,#cbd5e1);border-radius:12px;margin-top:8px;background:var(--bg-body,#f8fafc)}
.pdfo-up>summary{font-size:.8rem;padding:9px 11px}
.pdfo-arch{display:flex;align-items:center;gap:10px;padding:8px 11px;border-top:1px solid var(--border,#e2e8f0);font-size:.78rem}
.pdfo-arch .n{flex:1;min-width:0;font-weight:700;line-height:1.35}.pdfo-arch .n small{display:block;font-weight:600;color:var(--text-muted,#64748b);font-size:.7rem}
.pdfo-ok{color:#15803d;font-weight:800;font-size:.72rem;white-space:nowrap}
.pdfo-acc{display:flex;gap:6px;flex:none;flex-wrap:wrap;justify-content:flex-end}
.pdfo-prog{position:sticky;top:0;z-index:3;margin:0 0 10px;padding:10px 12px;border-radius:12px;background:var(--card-bg,#fff);border:1px solid var(--nika-primary,#0284c7);box-shadow:0 8px 20px -12px rgba(2,132,199,.7);display:none;font-size:.78rem}
.pdfo-prog.on{display:block}.pdfo-prog b{display:block;margin-bottom:6px;font-size:.8rem}
.pdfo-pb{height:6px;border-radius:6px;background:var(--border,#e2e8f0);overflow:hidden}.pdfo-pb i{display:block;height:100%;width:0;background:linear-gradient(90deg,#0ea5e9,#6366f1);transition:width .2s}
.pdfo-prog .f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;color:var(--text-muted,#64748b)}
.pdfo-vacio{padding:10px;font-size:.78rem;color:var(--text-muted,#64748b)}
.pdfo-total{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px;font-size:.78rem}
`;
    document.head.appendChild(st);
  }

  function resumen(cat) {
    const ids = cat.ids, guard = ids.filter((i) => _estados.has(i));
    const bytes = guard.reduce((a, i) => a + ((_estados.get(i) || {}).size || 0), 0);
    return { total: ids.length, guardados: guard.length, bytes };
  }
  const pend = (archivos) => archivos.filter((a) => !_estados.has(a.id));
  const sizeDe = (id) => (_estados.get(id) || {}).size || (metaTodos()[id] || {}).size || 0;

  function filaArchivo(a, deshab) {
    const g = _estados.get(a.id), sz = sizeDe(a.id);
    return `<div class="pdfo-arch" data-id="${esc(a.id)}"><div class="n">${esc(a.titulo)}<small>${sz ? fmt(sz) : 'Tamaño al descargar'}</small></div>
      <div class="pdfo-acc">${g
        ? `<span class="pdfo-ok">✓ Guardado</span><button class="gm-mini" data-pdfo="quitar" data-id="${esc(a.id)}" title="Quitar de este dispositivo" ${deshab ? 'disabled' : ''}>🗑️</button>`
        : `<button class="gm-mini dl" data-pdfo="uno" data-id="${esc(a.id)}" data-t="${esc(a.titulo)}" ${deshab || !_red ? 'disabled' : ''}>⬇ Descargar</button>`}</div></div>`;
  }

  function htmlMateria(f, cat) {
    const r = resumen(cat), deshab = _ocupado;
    const ups = cat.unidades.map((u) => {
      const k = u.archivos.filter((a) => _estados.has(a.id)).length, faltan = pend(u.archivos).length;
      return `<details class="pdfo-up" data-u="${esc(u.id)}"><summary><span class="pdfo-t">${esc(u.titulo)}<small>${u.archivos.length} archivo${u.archivos.length === 1 ? '' : 's'}${k ? ' · ' + k + ' guardado' + (k === 1 ? '' : 's') : ''}</small></span>
          <span class="pdfo-acc" onclick="event.preventDefault()">${faltan ? `<button class="gm-mini dl" data-pdfo="unidad" data-m="${f.id}" data-u="${esc(u.id)}" ${deshab || !_red ? 'disabled' : ''}>⬇ Unidad</button>` : '<span class="pdfo-ok">✓ Completa</span>'}${k ? `<button class="gm-mini" data-pdfo="quitar-unidad" data-m="${f.id}" data-u="${esc(u.id)}" title="Quitar los archivos de esta unidad" ${deshab ? 'disabled' : ''}>🗑️</button>` : ''}</span></summary>
        ${u.archivos.map((a) => filaArchivo(a, deshab)).join('')}</details>`;
    }).join('');
    const faltan = r.total - r.guardados;
    return `<details class="pdfo-mat" data-m="${f.id}"><summary><span style="font-size:1.3rem">${f.icono}</span><span class="pdfo-t">${esc(f.nombre)}<small>${f.sub} · ${r.total} PDF${r.total === 1 ? '' : 's'}${r.guardados ? ' · ' + r.guardados + ' guardado' + (r.guardados === 1 ? '' : 's') + ' (' + fmt(r.bytes) + ')' : ''}</small></span>
        <span class="pdfo-acc" onclick="event.preventDefault()">${faltan ? `<button class="gm-mini dl" data-pdfo="materia" data-m="${f.id}" ${deshab || !_red ? 'disabled' : ''}>⬇ Toda la materia</button>` : '<span class="pdfo-ok">✓ Completa</span>'}${r.guardados ? `<button class="gm-mini" data-pdfo="quitar-materia" data-m="${f.id}" title="Quitar todos los PDFs de esta materia" ${deshab ? 'disabled' : ''}>🗑️</button>` : ''}</span></summary>
      <div class="pdfo-cuerpo">${ups || '<div class="pdfo-vacio">Esta materia no tiene PDFs cargados todavía.</div>'}</div></details>`;
  }

  // Repinta solo las materias ya cargadas, conservando cuáles están desplegadas
  async function repintar() {
    if (!_root) return;
    const matDe = (d) => d.dataset.m || (d.closest('.pdfo-mat') || {dataset: {}}).dataset.m || '';
    const abiertos = new Set([...(_root.querySelectorAll('details[open]') || [])].map((d) => matDe(d) + '|' + (d.dataset.u || '')));
    const tot = [..._estados.values()].reduce((a, x) => a + (x.size || 0), 0);
    const t = _root.querySelector('.pdfo-total'); if (t) t.innerHTML = `<span><b>${_estados.size}</b> PDF${_estados.size === 1 ? '' : 's'} guardado${_estados.size === 1 ? '' : 's'} · <b>${fmt(tot)}</b> en este dispositivo</span>`;
    for (const f of FUENTES) {
      const det = _root.querySelector(`.pdfo-mat[data-m="${f.id}"]`); if (!det || !_cat[f.id]) continue;
      const tmp = document.createElement('div'); tmp.innerHTML = htmlMateria(f, _cat[f.id]);
      const nuevo = tmp.firstElementChild;
      if (abiertos.has(f.id + '|')) nuevo.setAttribute('open', '');
      nuevo.querySelectorAll('.pdfo-up').forEach((u) => { if (abiertos.has(f.id + '|' + u.dataset.u)) u.setAttribute('open', ''); });
      det.replaceWith(nuevo);
    }
  }
  async function refrescarEstados() { _estados = new Map((await lista()).map((x) => [x.id, x])); }

  function avance(txt, pct, extra) {
    const p = _root && _root.querySelector('.pdfo-prog'); if (!p) return;
    p.classList.add('on'); p.querySelector('b').textContent = txt; p.querySelector('.pdfo-pb i').style.width = Math.max(2, Math.min(100, pct)) + '%'; p.querySelector('.f span').textContent = extra || '';
  }
  const quitarAvance = () => { const p = _root && _root.querySelector('.pdfo-prog'); if (p) p.classList.remove('on'); };
  const aviso = (m) => { const e = document.getElementById('gm-msg'); if (e) e.textContent = m; };

  // Descarga una lista de archivos: calcula el peso, pide confirmación y baja de a uno con progreso
  async function descargarLote(archivos, nombre) {
    if (_ocupado) return;
    const falt = archivos.filter((a, i, v) => !_estados.has(a.id) && v.findIndex((x) => x.id === a.id) === i);
    if (!falt.length) { aviso('Todo eso ya está guardado ✓'); return; }
    _ocupado = true; const ctl = new AbortController(); _cancelar = () => ctl.abort(); await repintar();
    try {
      // 1) peso total (consulta liviana a Drive, 5 a la vez)
      let hechos = 0, total = 0, i = 0;
      avance('Calculando el peso de ' + falt.length + ' archivo' + (falt.length === 1 ? '' : 's') + '…', 3, '');
      await Promise.all(Array.from({ length: Math.min(5, falt.length) }, async () => {
        while (i < falt.length && !ctl.signal.aborted) {
          const a = falt[i++]; const m = metaTodos()[a.id] || await metaDrive(a.id, 8000);
          hechos++; avance('Calculando el peso… ' + hechos + '/' + falt.length, 3 + (hechos / falt.length) * 12, '');
        }
      }));
      if (ctl.signal.aborted) throw new DOMException('cancelado', 'AbortError');
      falt.forEach((a) => { total += sizeDe(a.id); });
      const sp = await espacio();
      if (sp.disponible && sp.libre && total > sp.libre * 0.9) { alert('Estos archivos pesan ' + fmt(total) + ' y en este dispositivo quedan ' + fmt(sp.libre) + ' libres. Elegí menos unidades o liberá espacio.'); throw new DOMException('sin espacio', 'AbortError'); }
      quitarAvance();
      if (!confirm(`Vas a descargar ${falt.length} PDF${falt.length === 1 ? '' : 's'} de ${nombre} (${total ? fmt(total) : 'peso a confirmar'}).\nQuedan guardados en este dispositivo para leerlos sin conexión en el Lector Nika.\n\n¿Descargar?`)) throw new DOMException('no confirmado', 'AbortError');
      // 2) descarga
      await asegurarLibs();
      let ok = 0, falla = [], acum = 0;
      for (const a of falt) {
        if (ctl.signal.aborted) break;
        const n0 = acum;
        try {
          await descargar(a.id, a.titulo, { signal: ctl.signal, alProgreso: (b, t) => avance(`Descargando ${ok + falla.length + 1} de ${falt.length} · ${a.titulo}`, total ? ((n0 + b) / total) * 100 : ((ok + falla.length) / falt.length) * 100, `${fmt(b)}${t ? ' de ' + fmt(t) : ''}`) });
          ok++; acum += sizeDe(a.id) || 0; await refrescarEstados();
        } catch (e) { if (e && e.name === 'AbortError') break; falla.push(a.titulo); }
      }
      await refrescarEstados();
      aviso(ctl.signal.aborted ? `Descarga cancelada: ${ok} guardado${ok === 1 ? '' : 's'}.` : `✅ ${ok} PDF${ok === 1 ? '' : 's'} guardado${ok === 1 ? '' : 's'} para leer sin conexión.` + (falla.length ? ` No se pudieron bajar ${falla.length}: ${falla.slice(0, 3).join(', ')}${falla.length > 3 ? '…' : ''}.` : ''));
    } catch (e) { if (!(e && e.name === 'AbortError')) aviso('No se pudo descargar: ' + ((e && e.message) || e)); else aviso('Descarga cancelada.'); }
    _ocupado = false; _cancelar = null; quitarAvance(); await repintar();
  }

  async function cargarMateria(det) {
    const f = FUENTES.find((x) => x.id === det.dataset.m); if (!f || _cat[f.id]) return;
    const cuerpo = det.querySelector('.pdfo-cuerpo'); if (cuerpo) cuerpo.innerHTML = '<div class="pdfo-vacio">Cargando la lista de PDFs…</div>';
    try { await catalogo(f); await repintar(); const d = _root.querySelector(`.pdfo-mat[data-m="${f.id}"]`); if (d) d.setAttribute('open', ''); }
    catch (e) { if (cuerpo) cuerpo.innerHTML = '<div class="pdfo-vacio">No se pudo cargar la lista. Revisá tu conexión.</div>'; }
  }

  async function alClick(e) {
    const b = e.target.closest('[data-pdfo]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.dataset.pdfo, mat = FUENTES.find((x) => x.id === b.dataset.m), cat = mat && _cat[mat.id];
    if (a === 'cancelar') { if (_cancelar) _cancelar(); return; }
    if (_ocupado) return;
    if (a === 'uno') return descargarLote([{ id: b.dataset.id, titulo: b.dataset.t }], 'un archivo');
    if (a === 'unidad' && cat) { const u = cat.unidades.find((x) => x.id === b.dataset.u); if (u) descargarLote(u.archivos, 'la unidad «' + u.titulo + '»'); return; }
    if (a === 'materia' && cat) return descargarLote(cat.unidades.flatMap((u) => u.archivos), mat.nombre);
    if (a === 'quitar') { await quitar(b.dataset.id); await refrescarEstados(); return repintar(); }
    if (a === 'quitar-unidad' && cat) { const u = cat.unidades.find((x) => x.id === b.dataset.u); if (u && confirm('¿Quitar de este dispositivo los PDFs de «' + u.titulo + '»?')) { for (const x of u.archivos) await quitar(x.id); await refrescarEstados(); repintar(); } return; }
    if (a === 'quitar-materia' && cat) { if (confirm('¿Quitar de este dispositivo todos los PDFs de ' + mat.nombre + '?')) { for (const id of cat.ids) await quitar(id); await refrescarEstados(); repintar(); } return; }
  }

  // Dibuja la sección en el contenedor indicado (idempotente: se puede llamar cada vez que el Modo Sin conexión se repinta)
  async function pintar(cont, op) {
    if (!cont) return;
    css(); _red = !(op && op.red === false);
    if (!cont.querySelector('.pdfo-root')) {
      _root = document.createElement('div'); _root.className = 'pdfo-root';
      _root.innerHTML = `<section class="gm-grupo" id="gm-g-pdf">
        <div class="gm-gh"><span class="ic">📄</span><h4>PDFs de las materias<small>para leer sin conexión en el Lector Nika</small></h4></div>
        <p class="pdfo-nota">Descargá solo lo que vayas a estudiar: un archivo, una unidad o la materia entera. Se guardan en <b>este dispositivo</b> (no se suben a ningún lado) y el lector los abre con tus subrayados, notas y progreso de siempre.</p>
        <div class="pdfo-total"></div>
        <div class="pdfo-prog"><b></b><div class="pdfo-pb"><i></i></div><div class="f"><span></span><button class="gm-mini" data-pdfo="cancelar">Cancelar</button></div></div>
        <div class="pdfo-lista">${FUENTES.map((f) => `<details class="pdfo-mat" data-m="${f.id}"><summary><span style="font-size:1.3rem">${f.icono}</span><span class="pdfo-t">${esc(f.nombre)}<small>${f.sub} · tocá para ver los PDFs</small></span></summary><div class="pdfo-cuerpo"></div></details>`).join('')}</div></section>`;
      cont.appendChild(_root);
      _root.addEventListener('click', alClick);
      _root.addEventListener('toggle', (ev) => { const d = ev.target; if (d.classList && d.classList.contains('pdfo-mat') && d.open && !_cat[d.dataset.m]) cargarMateria(d); }, true);
    } else _root = cont.querySelector('.pdfo-root');
    await refrescarEstados();
    if (!_ocupado) repintar();
    else { const t = _root.querySelector('.pdfo-total'); if (t) repintar(); }
  }

  // ------------------------------------------------------------------ marca «✓ Sin conexión» en la lista de materiales de la sala de estudio
  let _ids = new Set(), _obsMat = null, _tMat = null;
  function decorarLista() {
    document.querySelectorAll('.resource-item[data-url]').forEach((el) => {
      const id = idDe(el.dataset.url); if (!id) return;
      const info = el.querySelector('.resource-info'); if (!info) return;
      let b = info.querySelector('.pdfo-badge'); const guardado = _ids.has(id);
      if (guardado && !b) { b = document.createElement('span'); b.className = 'pdfo-badge'; b.textContent = '✓ Sin conexión'; b.title = 'Guardado en este dispositivo: se abre aunque no haya internet'; info.appendChild(b); }
      else if (!guardado && b) b.remove();
    });
  }
  async function refrescarMarcas() { _ids = new Set((await lista()).map((x) => x.id)); decorarLista(); }
  function iniciarMarcas() {
    if (_obsMat || !document.body || !hayCache()) return;
    if (!document.getElementById('pdfo-badge-css')) {
      const st = document.createElement('style'); st.id = 'pdfo-badge-css';
      st.textContent = '.pdfo-badge{display:inline-block;margin:3px 0 0 8px;padding:2px 8px;border-radius:999px;background:rgba(22,163,74,.14);color:#16a34a;font-size:.66rem;font-weight:800;vertical-align:middle;white-space:nowrap}';
      document.head.appendChild(st);
    }
    _obsMat = new MutationObserver(() => { clearTimeout(_tMat); _tMat = setTimeout(decorarLista, 250); });
    _obsMat.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('nika-pdf-offline', refrescarMarcas);
    refrescarMarcas();
  }
  if (/estudio|sala_estudio/i.test(location.pathname)) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarMarcas); else iniciarMarcas(); }

  window.NikaPdfOffline = {
    estado, leer, leerConv, guardarConv, guardarBuffer, descargar, quitar, lista, espacio, borrarTodo, pintar, asegurarLibs, libUrl, refrescarSiGuardado, metaDrive,
    ocupado: () => _ocupado, fmt, FUENTES, catalogo,
  };
})();
