/* NikaPdf — lector de PDFs de Drive dentro de NikaMed, con subrayado y progreso de lectura por usuario.
   - El PDF se descarga desde la API de Drive (clave restringida a nikamed.com.ar) y se dibuja con pdf.js: no se sube nada a NikaMed.
   - Subrayados y progreso se guardan en Supabase (sql/pdf_lector.sql) con RLS: cada usuario ve solo lo suyo. Sin sesión, quedan en el navegador.
   - Si el archivo no se puede abrir así (descarga bloqueada, no es PDF, sin conexión), se vuelve al visor de Drive de siempre.
   Uso: NikaPdf.abrir({ wrapper, fileId, title, fallback }) / NikaPdf.cerrar() */
(function () {
  'use strict';
  const API_KEY = 'AIzaSyB0MSmTC-gBB7hiw-MUqst1-m1iN8e-eDQ';   // clave pública de Drive, restringida por dominio (https://nikamed.com.ar/*)
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const COLORES = { amarillo: '#fde047', verde: '#86efac', rosa: '#f9a8d4', azul: '#93c5fd' };
  const ESCALAS = [0.6, 0.8, 1, 1.25, 1.5, 1.8, 2.2];

  let S = null;           // sesión de lectura actual
  let libPromesa = null;

  const $ = (sel, r) => (r || document).querySelector(sel);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const cliente = () => window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;

  function cargarLib() {
    if (window.pdfjsLib) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; return Promise.resolve(); }
    if (libPromesa) return libPromesa;
    libPromesa = new Promise((ok, mal) => {
      const s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js';
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; ok(); };
      s.onerror = () => { libPromesa = null; mal(new Error('No se pudo cargar pdf.js')); };
      document.head.appendChild(s);
    });
    return libPromesa;
  }

  function css() {
    if ($('#nkpdf-css')) return;
    const st = document.createElement('style'); st.id = 'nkpdf-css';
    st.textContent = `
.nkpdf{position:absolute;inset:0;display:flex;flex-direction:column;background:#e2e8f0;font-family:inherit}
.nkpdf-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;background:#0f172a;color:#e2e8f0;font-size:.78rem;font-weight:700}
.nkpdf-bar button{background:rgba(255,255,255,.12);border:0;color:#fff;border-radius:7px;padding:5px 10px;font:inherit;cursor:pointer;transition:background .15s,transform .15s}
.nkpdf-bar button:hover{background:rgba(255,255,255,.24);transform:translateY(-1px)}
.nkpdf-bar .sep{flex:1}
.nkpdf-bar input{width:46px;text-align:center;border-radius:6px;border:0;padding:4px;font:inherit;font-weight:800}
.nkpdf-prog{display:flex;align-items:center;gap:8px;min-width:120px}
.nkpdf-prog i{display:block;height:6px;flex:1;min-width:60px;border-radius:6px;background:rgba(255,255,255,.18);overflow:hidden}
.nkpdf-prog i b{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a855f7);transition:width .4s}
.nkpdf-scroll{flex:1;overflow:auto;padding:14px 0;scroll-behavior:auto;-webkit-overflow-scrolling:touch}
.nk-pg{position:relative;margin:0 auto 14px;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,.25);border-radius:3px}
.nk-pg canvas{display:block;width:100%;height:100%;border-radius:3px}
.nk-hl{position:absolute;inset:0;pointer-events:none}
.nk-hl i{position:absolute;mix-blend-mode:multiply;border-radius:2px;opacity:.62}
.nk-tx{position:absolute;inset:0;overflow:hidden;line-height:1}
.nk-tx span{position:absolute;white-space:pre;color:transparent;cursor:text;transform-origin:0 0}
.nk-tx ::selection{background:rgba(59,130,246,.35)}
.nk-pg .nk-leida{position:absolute;top:8px;right:8px;background:#16a34a;color:#fff;font-size:.7rem;font-weight:800;border-radius:999px;padding:2px 9px;opacity:.9;pointer-events:none}
.nk-pg .nk-num{position:absolute;bottom:6px;right:10px;font-size:.66rem;color:#94a3b8;pointer-events:none}
.nkpdf-pop{position:fixed;z-index:100002;display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:12px;background:#0f172a;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:nkpdfIn .15s ease both}
@keyframes nkpdfIn{from{opacity:0;transform:translateY(4px) scale(.96)}to{opacity:1;transform:none}}
.nkpdf-pop .c{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.7);cursor:pointer;transition:transform .15s}
.nkpdf-pop .c:hover{transform:scale(1.2)}
.nkpdf-pop .x{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:8px;padding:4px 9px;font:inherit;font-size:.74rem;font-weight:700;cursor:pointer}
.nkpdf-pop .x:hover{background:#dc2626}
.nkpdf-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#334155;font-weight:700;background:#f1f5f9;z-index:3}
.nkpdf-msg .sp{width:34px;height:34px;border:4px solid #cbd5e1;border-top-color:#0284c7;border-radius:50%;animation:nkpdfSp .8s linear infinite}
@keyframes nkpdfSp{to{transform:rotate(360deg)}}
.nkpdf-toast{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:4;display:flex;gap:10px;align-items:center;padding:9px 14px;border-radius:12px;background:#0f172a;color:#fff;font-size:.8rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:nkpdfIn .3s ease both}
.nkpdf-toast button{background:linear-gradient(135deg,#0ea5e9,#7c3aed);border:0;color:#fff;border-radius:8px;padding:5px 11px;font:inherit;cursor:pointer}
.nkpdf-toast .z{background:transparent;color:#94a3b8;padding:5px 6px}
@media (max-width:640px){.nkpdf-bar{gap:5px;padding:6px 8px}.nkpdf-prog{min-width:90px}}
@media (prefers-reduced-motion:reduce){.nkpdf-pop,.nkpdf-toast,.nkpdf-msg .sp{animation:none!important}}`;
    document.head.appendChild(st);
  }

  // ---------- persistencia (Supabase con RLS; sin sesión, localStorage) ----------
  async function usuarioId() {
    try { const c = cliente(); if (!c || !c.auth) return null; const { data } = await c.auth.getSession(); return (data && data.session && data.session.user && data.session.user.id) || null; } catch (_) { return null; }
  }
  const lsKey = (k, f) => `nika_pdf_${k}_${f}`;
  const lsGet = (k, f, def) => { try { const v = localStorage.getItem(lsKey(k, f)); return v ? JSON.parse(v) : def; } catch (_) { return def; } };
  const lsSet = (k, f, v) => { try { localStorage.setItem(lsKey(k, f), JSON.stringify(v)); } catch (_) {} };

  async function cargarMarcas(fileId) {
    const uid = await usuarioId(); S.uid = uid;
    if (!uid) { S.marcas = lsGet('hl', fileId, []); S.prog = lsGet('prog', fileId, null); return; }
    const c = cliente();
    try {
      const [a, b] = await Promise.all([
        c.from('pdf_subrayados').select('id,pagina,color,texto,rects').eq('file_id', fileId).order('created_at'),
        c.from('pdf_progreso').select('ultima_pagina,total_paginas,leidas').eq('file_id', fileId).maybeSingle(),
      ]);
      S.marcas = (a.data || []).map((m) => ({ id: m.id, pagina: m.pagina, color: m.color, texto: m.texto, rects: m.rects }));
      S.prog = b.data || null;
      S.remoto = !a.error;
    } catch (_) { S.marcas = lsGet('hl', fileId, []); S.prog = lsGet('prog', fileId, null); }
  }

  async function guardarMarca(m) {
    if (S.uid && S.remoto !== false) {
      try {
        const { data, error } = await cliente().from('pdf_subrayados').insert({ file_id: S.fileId, pagina: m.pagina, color: m.color, texto: m.texto, rects: m.rects }).select('id').single();
        if (!error && data) { m.id = data.id; return; }
      } catch (_) {}
    }
    m.id = m.id || ('l' + Date.now() + Math.random().toString(36).slice(2, 6)); m.local = true;
    lsSet('hl', S.fileId, S.marcas.filter((x) => x.local));
  }
  async function borrarMarca(m) {
    if (m.id && !m.local && S.uid) { try { await cliente().from('pdf_subrayados').delete().eq('id', m.id); } catch (_) {} }
    lsSet('hl', S.fileId, S.marcas.filter((x) => x.local && x !== m));
  }

  let _t = null;
  async function persistir(s) {
    if (!s || !s.n) return;
    const p = { ultima_pagina: s.actual, total_paginas: s.n, leidas: Array.from(s.leidas).sort((a, b) => a - b) };
    s.prog = p;
    if (s.uid && s.remoto !== false) {
      try { await cliente().from('pdf_progreso').upsert({ file_id: s.fileId, titulo: s.title, ...p, updated_at: new Date().toISOString() }, { onConflict: 'user_id,file_id' }); return; } catch (_) {}
    }
    lsSet('prog', s.fileId, p);
  }
  function guardarProgreso() {
    clearTimeout(_t);
    const s = S; _t = setTimeout(() => { if (S === s) persistir(s); }, 1500);
  }

  // ---------- render ----------
  function pintarMarcas(pg) {
    const capa = pg.el.querySelector('.nk-hl'); if (!capa) return;
    capa.innerHTML = '';
    S.marcas.filter((m) => m.pagina === pg.num).forEach((m) => {
      (m.rects || []).forEach((r) => {
        const i = document.createElement('i');
        i.style.cssText = `left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%;background:${COLORES[m.color] || COLORES.amarillo}`;
        capa.appendChild(i);
      });
    });
  }

  async function renderizar(pg) {
    if (pg.hecho || pg.cargando || !S) return;
    pg.cargando = true; const tok = S.tok;
    try {
      const page = await S.pdf.getPage(pg.num);
      if (!S || S.tok !== tok) return;
      const vp = page.getViewport({ scale: S.escala });
      pg.el.style.width = vp.width + 'px'; pg.el.style.height = vp.height + 'px';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cv = pg.el.querySelector('canvas'); cv.width = Math.floor(vp.width * dpr); cv.height = Math.floor(vp.height * dpr);
      await page.render({ canvasContext: cv.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
      const tx = pg.el.querySelector('.nk-tx'); tx.innerHTML = '';
      const contenido = await page.getTextContent();
      await window.pdfjsLib.renderTextLayer({ textContentSource: contenido, container: tx, viewport: vp, textDivs: [] }).promise;
      pg.hecho = true; pintarMarcas(pg); marcarLeida(pg);
    } catch (e) { console.warn('[NikaPdf] página', pg.num, e && e.message ? e.message : e); }
    pg.cargando = false;
  }
  function liberar(pg) {
    if (!pg.hecho) return;
    const cv = pg.el.querySelector('canvas'); cv.width = 1; cv.height = 1;
    pg.el.querySelector('.nk-tx').innerHTML = ''; pg.hecho = false;
  }

  function marcarLeida(pg) {
    const b = pg.el.querySelector('.nk-leida');
    if (S.leidas.has(pg.num) && !b) { const d = document.createElement('div'); d.className = 'nk-leida'; d.textContent = '✓ Leída'; pg.el.appendChild(d); }
    else if (!S.leidas.has(pg.num) && b) b.remove();
  }

  function actualizarBarra() {
    const n = S.n, l = S.leidas.size, pct = n ? Math.round((l / n) * 100) : 0;
    $('.nkpdf-prog i b', S.root).style.width = pct + '%';
    $('.nkpdf-prog span', S.root).textContent = `${l}/${n} págs · ${pct}%`;
    const inp = $('.nkpdf-pag', S.root); if (inp && document.activeElement !== inp) inp.value = S.actual;
    const bl = $('.nkpdf-leer', S.root); if (bl) bl.textContent = S.leidas.has(S.actual) ? '↺ Desmarcar leída' : '✓ Marcar leída';
  }

  function paginaActual() {
    const sc = S.scroll, r = sc.getBoundingClientRect(); let mejor = S.actual, area = -1;
    S.pags.forEach((pg) => {
      const b = pg.el.getBoundingClientRect(); const v = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top);
      if (v > area) { area = v; mejor = pg.num; }
    });
    return mejor;
  }

  function irA(n, suave) {
    n = Math.max(1, Math.min(S.n, n | 0)); const pg = S.pags[n - 1]; if (!pg) return;
    S.scroll.scrollTo({ top: pg.el.offsetTop - 10, behavior: suave ? 'smooth' : 'auto' });
  }

  function reconstruir() {
    // cambia el zoom: se vuelve a dimensionar y dibujar todo conservando la página actual
    const actual = S.actual; S.tok++;
    S.pags.forEach((pg) => { pg.hecho = false; pg.cargando = false; const w = S.base.w * S.escala, h = S.base.h * S.escala; pg.el.style.width = w + 'px'; pg.el.style.height = h + 'px'; });
    S.pags.forEach((pg) => S.io.unobserve(pg.el)); S.pags.forEach((pg) => S.io.observe(pg.el));
    requestAnimationFrame(() => irA(actual));
  }

  // ---------- subrayar / borrar ----------
  function cerrarPop() { const p = $('.nkpdf-pop'); if (p) p.remove(); }
  function popover(x, y, html, alClick) {
    cerrarPop();
    const p = document.createElement('div'); p.className = 'nkpdf-pop'; p.innerHTML = html;
    p.style.left = Math.max(8, Math.min(window.innerWidth - 230, x - 100)) + 'px'; p.style.top = Math.max(8, y) + 'px';
    p.addEventListener('mousedown', (e) => e.preventDefault());
    p.addEventListener('click', (e) => { const t = e.target.closest('[data-c],[data-x]'); if (t) alClick(t); });
    document.body.appendChild(p);
  }

  function seleccion() {
    if (!S) return;
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const rango = sel.getRangeAt(0);
    if (!S.scroll.contains(rango.commonAncestorContainer)) return;
    const texto = sel.toString().replace(/\s+/g, ' ').trim(); if (!texto) return;
    const porPagina = new Map();
    Array.from(rango.getClientRects()).forEach((r) => {
      if (r.width < 2 || r.height < 2) return;
      const pg = S.pags.find((p) => { const b = p.el.getBoundingClientRect(); const cy = r.top + r.height / 2, cx = r.left + r.width / 2; return cy >= b.top && cy <= b.bottom && cx >= b.left && cx <= b.right; });
      if (!pg) return;
      const b = pg.el.getBoundingClientRect();
      const q = { x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: r.width / b.width, h: r.height / b.height };
      if (!porPagina.has(pg.num)) porPagina.set(pg.num, []);
      porPagina.get(pg.num).push(q);
    });
    if (!porPagina.size) return;
    const fin = rango.getBoundingClientRect();
    popover(fin.left + fin.width / 2, fin.bottom + 8,
      Object.keys(COLORES).map((k) => `<span class="c" data-c="${k}" title="Subrayar" style="background:${COLORES[k]}"></span>`).join('') + '<button class="x" data-x="cancelar">✕</button>',
      async (t) => {
        if (t.dataset.x) { cerrarPop(); return; }
        const nuevas = [];
        porPagina.forEach((rects, num) => { nuevas.push({ pagina: num, color: t.dataset.c, texto: texto.slice(0, 600), rects }); });
        cerrarPop(); sel.removeAllRanges();
        for (const m of nuevas) { S.marcas.push(m); const pg = S.pags[m.pagina - 1]; if (pg) pintarMarcas(pg); await guardarMarca(m); }
      });
  }

  function clickEnMarca(e) {
    if (!S || !window.getSelection().isCollapsed) return;
    const pg = S.pags.find((p) => p.el.contains(e.target)); if (!pg) { cerrarPop(); return; }
    const b = pg.el.getBoundingClientRect(); const fx = (e.clientX - b.left) / b.width, fy = (e.clientY - b.top) / b.height;
    const m = S.marcas.find((m) => m.pagina === pg.num && (m.rects || []).some((r) => fx >= r.x && fx <= r.x + r.w && fy >= r.y && fy <= r.y + r.h));
    if (!m) { cerrarPop(); return; }
    popover(e.clientX, e.clientY + 10,
      Object.keys(COLORES).map((k) => `<span class="c" data-c="${k}" title="Cambiar color" style="background:${COLORES[k]}"></span>`).join('') + '<button class="x" data-x="borrar">🗑 Borrar</button>',
      async (t) => {
        cerrarPop();
        if (t.dataset.x === 'borrar') { S.marcas = S.marcas.filter((x) => x !== m); pintarMarcas(pg); await borrarMarca(m); return; }
        if (t.dataset.c && t.dataset.c !== m.color) {
          const viejo = m.color; m.color = t.dataset.c; pintarMarcas(pg);
          if (m.id && !m.local && S.uid) { try { await cliente().from('pdf_subrayados').update({ color: m.color }).eq('id', m.id); } catch (_) { m.color = viejo; pintarMarcas(pg); } }
          else lsSet('hl', S.fileId, S.marcas.filter((x) => x.local));
        }
      });
  }

  // ---------- UI ----------
  function toast(texto, boton, alClick) {
    const t = document.createElement('div'); t.className = 'nkpdf-toast';
    t.innerHTML = `<span>${esc(texto)}</span><button>${esc(boton)}</button><button class="z" aria-label="Cerrar">✕</button>`;
    t.querySelector('button').addEventListener('click', () => { alClick(); t.remove(); });
    t.querySelector('.z').addEventListener('click', () => t.remove());
    S.root.appendChild(t); setTimeout(() => t.remove(), 14000);
  }

  function mensaje(root, html) {
    let m = $('.nkpdf-msg', root); if (!m) { m = document.createElement('div'); m.className = 'nkpdf-msg'; root.appendChild(m); }
    m.innerHTML = html; return m;
  }

  async function abrir(op) {
    cerrar(); css();
    const { wrapper, fileId, title, fallback } = op;
    const iframe = $('iframe', wrapper); if (iframe) iframe.style.display = 'none';
    const root = document.createElement('div'); root.className = 'nkpdf'; wrapper.appendChild(root);
    mensaje(root, '<div class="sp"></div><div>Abriendo el PDF…</div>');
    S = { root, fileId, title, wrapper, fallback, tok: 1, escala: 1, leidas: new Set(), marcas: [], pags: [], actual: 1, segs: 0, uid: null };
    const mi = S;
    const volver = (motivo) => { if (S !== mi) return; const f = mi.fallback; cerrar(); if (iframe) iframe.style.display = ''; if (f) f(motivo); };
    try {
      await cargarLib();
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&key=${API_KEY}`);
      if (!resp.ok) throw new Error('drive ' + resp.status);
      const buf = new Uint8Array(await resp.arrayBuffer());
      if (String.fromCharCode(buf[0], buf[1], buf[2], buf[3]) !== '%PDF') throw new Error('no es un PDF');
      if (S !== mi) return;
      mi.pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      mi.n = mi.pdf.numPages;
      await cargarMarcas(fileId);
      if (S !== mi) return;
      mi.leidas = new Set((mi.prog && mi.prog.leidas) || []);
      const p1 = await mi.pdf.getPage(1); const v1 = p1.getViewport({ scale: 1 });
      const ancho = Math.max(280, wrapper.clientWidth - 28);
      mi.escala = Math.max(0.6, Math.min(1.8, ancho / v1.width)); mi.base = { w: v1.width, h: v1.height };
      armar(mi);
    } catch (e) {
      if (S === mi) volver(e && e.message);
    }
  }

  function armar(mi) {
    const root = mi.root; root.innerHTML = '';
    root.insertAdjacentHTML('beforeend', `
      <div class="nkpdf-bar">
        <button class="nkpdf-zm" title="Alejar">−</button><button class="nkpdf-zp" title="Acercar">＋</button>
        <span>pág. <input class="nkpdf-pag" type="number" min="1" max="${mi.n}" value="1"> / ${mi.n}</span>
        <button class="nkpdf-leer">✓ Marcar leída</button>
        <div class="nkpdf-prog"><i><b></b></i><span></span></div>
        <span class="sep"></span>
        <button class="nkpdf-drive" title="Ver con el visor de Drive">Visor Drive</button>
      </div>
      <div class="nkpdf-scroll"></div>`);
    mi.scroll = $('.nkpdf-scroll', root);
    for (let i = 1; i <= mi.n; i++) {
      const el = document.createElement('div'); el.className = 'nk-pg'; el.dataset.p = i;
      el.style.width = mi.base.w * mi.escala + 'px'; el.style.height = mi.base.h * mi.escala + 'px';
      el.innerHTML = '<canvas></canvas><div class="nk-hl"></div><div class="nk-tx"></div><span class="nk-num">' + i + '</span>';
      mi.scroll.appendChild(el); mi.pags.push({ num: i, el, hecho: false, cargando: false });
    }
    mi.io = new IntersectionObserver((es) => {
      es.forEach((en) => { const pg = mi.pags[+en.target.dataset.p - 1]; if (en.isIntersecting) renderizar(pg); else liberar(pg); });
    }, { root: mi.scroll, rootMargin: '700px 0px' });
    mi.pags.forEach((pg) => mi.io.observe(pg.el));

    mi.scroll.addEventListener('mouseup', () => setTimeout(seleccion, 10));
    mi.scroll.addEventListener('touchend', () => setTimeout(seleccion, 350));
    mi.scroll.addEventListener('click', clickEnMarca);
    mi.scroll.addEventListener('scroll', () => { cerrarPop(); const a = paginaActual(); if (a !== mi.actual) { mi.actual = a; mi.segs = 0; actualizarBarra(); guardarProgreso(); } }, { passive: true });

    const zoom = (d) => { const i = ESCALAS.reduce((b, v, k) => (Math.abs(v - mi.escala) < Math.abs(ESCALAS[b] - mi.escala) ? k : b), 0); mi.escala = ESCALAS[Math.max(0, Math.min(ESCALAS.length - 1, i + d))]; reconstruir(); };
    $('.nkpdf-zm', root).addEventListener('click', () => zoom(-1));
    $('.nkpdf-zp', root).addEventListener('click', () => zoom(1));
    $('.nkpdf-pag', root).addEventListener('change', (e) => irA(+e.target.value, true));
    $('.nkpdf-leer', root).addEventListener('click', () => {
      if (mi.leidas.has(mi.actual)) mi.leidas.delete(mi.actual); else mi.leidas.add(mi.actual);
      marcarLeida(mi.pags[mi.actual - 1]); actualizarBarra(); guardarProgreso();
    });
    $('.nkpdf-drive', root).addEventListener('click', () => { const f = mi.fallback; cerrar(); const ifr = $('iframe', mi.wrapper); if (ifr) ifr.style.display = ''; if (f) f('manual'); });

    // una página cuenta como leída si estuvo ~4 s como la principal en pantalla
    mi.reloj = setInterval(() => {
      if (S !== mi || document.hidden) return;
      mi.segs++;
      if (mi.segs === 4 && !mi.leidas.has(mi.actual)) { mi.leidas.add(mi.actual); marcarLeida(mi.pags[mi.actual - 1]); actualizarBarra(); guardarProgreso(); }
    }, 1000);

    actualizarBarra();
    const ult = mi.prog && mi.prog.ultima_pagina;
    if (ult && ult > 1 && ult <= mi.n) {
      toast(`Seguías en la página ${ult} de ${mi.n}`, 'Continuar', () => irA(ult, true));
    }
    mi.actual = 1;
  }

  function cerrar() {
    cerrarPop();
    if (!S) return;
    clearInterval(S.reloj); clearTimeout(_t); if (S.io) S.io.disconnect();
    const s = S; persistir(s); S = null; s.tok = -1;
    try { s.pdf && s.pdf.destroy(); } catch (_) {}
    if (s.root && s.root.parentNode) s.root.remove();
  }

  window.NikaPdf = { abrir, cerrar, activo: () => !!S };
})();
