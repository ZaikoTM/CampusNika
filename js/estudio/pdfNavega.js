/* CAMPUS NIKA · Navegación del Lector NikaMed (js/estudio/pdfLector.js)
   · 🔗 Vínculos clicables: los enlaces internos del PDF (índice impreso, «ver cuadro 23-2», notas al pie…) llevan a su destino, como en Adobe.
     Funcionan en modo Seleccionar y no molestan al seleccionar texto. Los enlaces a páginas web se abren en otra pestaña.
   · ← → Historial: cada salto (vínculo, índice, miniatura, búsqueda, marcador) recuerda de dónde venías; «Volver» (Alt+←) y «Adelante» (Alt+→).
   · 📑 Ir al índice: detecta la página del índice del libro (por el índice interno o por el título) y salta ahí.
   · 🔖 Marcadores propios (K): una página con nombre y posición exacta; se guardan como una nota más (etiqueta «marcador») y se sincronizan.
   · 🎓 Resumen de sesión al salir del modo teatro: páginas leídas, subrayados, notas, marcadores y cuánto falta de la meta del día. */
(function () {
  'use strict';
  if (window.NikaPdfNav) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = () => window.NikaPdf;
  const NP = () => window.NikaPdfNotas;
  const aviso = (t) => { try { if (L() && L().aviso) L().aviso(t); } catch (_) {} };
  const SEG_ETQ = 'marcador';

  function css() {
    if ($('#nkv-css')) return;
    const st = document.createElement('style'); st.id = 'nkv-css';
    st.textContent = `
.nk-lk-hl{position:absolute;pointer-events:none;z-index:3;border:2px solid rgba(124,58,237,.85);background:rgba(124,58,237,.13);border-radius:4px;display:none}
.nkpdf.nk-sobre-link .nkpdf-scroll{cursor:pointer}
.nkpdf-bar button:disabled{opacity:.38;cursor:default;transform:none!important;background:transparent!important}
.nk-marcador{position:absolute;top:0;left:16px;z-index:5;max-width:58%;padding:3px 10px 7px;border-radius:0 0 9px 9px;background:linear-gradient(160deg,#7c3aed,#6366f1);color:#fff;font:800 .68rem/1.2 'Plus Jakarta Sans',system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 10px rgba(76,29,149,.45);cursor:pointer;animation:nkvBaja .4s cubic-bezier(.2,.9,.3,1.3)}
@keyframes nkvBaja{from{transform:translateY(-100%)}to{transform:none}}
.nkv-pop{position:absolute;z-index:60;width:min(340px,calc(100% - 16px));max-height:min(460px,calc(100% - 24px));display:flex;flex-direction:column;border-radius:16px;color:#e2e8f0;background:linear-gradient(150deg,#0b1535,#1e1b4b 60%,#312e81);border:1px solid rgba(168,85,247,.55);box-shadow:0 22px 46px rgba(2,6,23,.65);font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:nkvPop .2s cubic-bezier(.2,.9,.3,1.2)}
@keyframes nkvPop{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
.nkv-pop h5{margin:0;padding:12px 14px 8px;font-size:.92rem;font-weight:800;color:#fff;display:flex;justify-content:space-between;align-items:center}
.nkv-pop h5 button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:1rem}
.nkv-nuevo{display:flex;gap:6px;padding:0 12px 10px}
.nkv-nuevo input{flex:1;min-width:0;border-radius:10px;border:1px solid #475569;background:#16223a;color:#fff;padding:7px 10px;font:700 .8rem inherit;font-family:inherit;outline:0}
.nkv-nuevo input:focus{border-color:#a855f7}
.nkv-nuevo button,.nkv-res .ok{border:0;border-radius:10px;padding:0 12px;font:800 .78rem inherit;font-family:inherit;color:#fff;cursor:pointer;background:linear-gradient(135deg,#7e22ce,#a855f7)}
.nkv-lista{overflow:auto;padding:0 8px 10px;display:flex;flex-direction:column;gap:4px;scrollbar-width:thin;scrollbar-color:#7c3aed transparent}
.nkv-it{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 10px;border-radius:10px;background:rgba(255,255,255,.06);cursor:pointer;transition:background .15s}
.nkv-it:hover{background:rgba(168,85,247,.28)}.nkv-it.act{box-shadow:inset 3px 0 0 #a855f7}
.nkv-it .p{flex:none;min-width:34px;text-align:center;border-radius:8px;padding:2px 6px;background:#7c3aed;color:#fff;font-weight:800;font-size:.7rem}
.nkv-it .t{flex:1;min-width:0;font-weight:700;font-size:.82rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nkv-it .t input{width:100%;box-sizing:border-box;border-radius:6px;border:1px solid #a855f7;background:#16223a;color:#fff;padding:3px 6px;font:700 .8rem inherit;font-family:inherit;outline:0}
.nkv-it button{border:0;background:none;color:#94a3b8;cursor:pointer;font-size:.85rem;padding:2px 4px;border-radius:6px}.nkv-it button:hover{color:#fff;background:rgba(255,255,255,.12)}.nkv-it button.del:hover{color:#f87171}
.nkv-pie{padding:2px 12px 12px;display:flex;flex-direction:column;gap:4px}.nkv-pie button{border:1px dashed rgba(165,180,252,.55);background:transparent;color:#c7d2fe;border-radius:10px;padding:7px 10px;font:700 .74rem inherit;font-family:inherit;cursor:pointer}.nkv-pie button:hover{background:rgba(168,85,247,.25)}.nkv-pie small{color:#94a3b8;font-size:.68rem}
.nkv-vacio{padding:6px 14px 14px;font-size:.78rem;color:#a5b4fc;line-height:1.4}
.nkv-res{position:absolute;inset:0;z-index:80;display:grid;place-items:center;padding:16px;background:rgba(2,6,23,.62);backdrop-filter:blur(3px);font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:nkvPop .25s ease}
.nkv-res .c{width:min(440px,100%);border-radius:22px;padding:22px 22px 18px;color:#e2e8f0;background:linear-gradient(150deg,#0b1535,#1e1b4b 55%,#312e81);border:1px solid rgba(168,85,247,.6);box-shadow:0 30px 70px rgba(0,0,0,.6)}
.nkv-res h3{margin:0 0 2px;font-size:1.15rem;font-weight:800;color:#fff}.nkv-res .sub{margin:0 0 14px;font-size:.8rem;color:#a5b4fc;font-weight:600}
.nkv-res .g{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.nkv-res .g div{border-radius:14px;padding:10px 12px;background:rgba(255,255,255,.07);display:flex;flex-direction:column}
.nkv-res .g b{font-size:1.7rem;line-height:1.1;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}.nkv-res .g span{font-size:.72rem;font-weight:700;color:#a5b4fc}
.nkv-res .g div.cero b{color:#64748b}
.nkv-res .bar{margin:14px 0 4px;height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}.nkv-res .bar i{display:block;height:100%;background:linear-gradient(90deg,#38bdf8,#a855f7);border-radius:99px}
.nkv-res .prog{font-size:.76rem;font-weight:700;color:#cbd5e1}.nkv-res .meta{margin-top:8px;font-size:.8rem;font-weight:800;color:#fcd34d}.nkv-res .meta.ok{color:#6ee7b7}
.nkv-res .pie{margin-top:14px;display:flex;justify-content:flex-end}.nkv-res .ok{padding:9px 18px}
@media (prefers-reduced-motion:reduce){.nk-marcador,.nkv-pop,.nkv-res{animation:none}}`;
    document.head.appendChild(st);
  }

  // ------------------------------------------------------------------ destinos
  async function resolverDest(mi, dest) {
    try {
      let d = dest; if (typeof d === 'string') d = await mi.pdf.getDestination(d);
      if (!Array.isArray(d)) return null;
      const ref = d[0]; let idx = null;
      if (ref && typeof ref === 'object') idx = await mi.pdf.getPageIndex(ref); else if (Number.isInteger(ref)) idx = ref;
      if (idx == null) return null;
      let top = null; const tipo = d[1] && d[1].name;
      if (tipo === 'XYZ') top = d[3]; else if (tipo === 'FitH' || tipo === 'FitBH') top = d[2]; else if (tipo === 'FitR') top = d[5];
      let y = 0;
      if (typeof top === 'number') { const page = await mi.pdf.getPage(idx + 1), vp = page.getViewport({ scale: 1 }); y = Math.max(0, Math.min(0.95, vp.convertToViewportPoint(0, top)[1] / vp.height)); }
      return { p: idx + 1, y };
    } catch (_) { return null; }
  }

  // ------------------------------------------------------------------ historial
  function posActual(mi) {
    const pg = mi.pags[mi.actual - 1]; if (!pg) return { p: 1, f: 0 };
    return { p: mi.actual, f: Math.max(-0.2, Math.min(1, (mi.scroll.scrollTop + 10 - pg.el.offsetTop) / (pg.el.offsetHeight || 1))) };
  }
  function irPos(mi, p, f, suave) {
    p = Math.max(1, Math.min(mi.n, p | 0)); const pg = mi.pags[p - 1]; if (!pg) return;
    mi.scroll.scrollTo({ top: pg.el.offsetTop + (f || 0) * pg.el.offsetHeight - 10, behavior: suave ? 'smooth' : 'auto' });
  }
  function botones(mi) {
    const n = mi.nav; if (!n) return;
    const a = $('[data-accion="nav-volver"]', mi.root), b = $('[data-accion="nav-adelante"]', mi.root);
    if (a) { a.disabled = !n.back.length; a.title = n.back.length ? 'Volver a donde estabas (Alt+←)' : 'Volver (todavía no saltaste a ningún lado)'; }
    if (b) { b.disabled = !n.fwd.length; b.title = n.fwd.length ? 'Adelante (Alt+→)' : 'Adelante'; }
  }
  function registrar(mi) { const n = mi.nav; if (!n) return; n.back.push(posActual(mi)); if (n.back.length > 60) n.back.shift(); n.fwd = []; botones(mi); }
  // salto largo (índice, miniaturas, búsqueda, notas…): recuerda de dónde venías
  function alSaltar(mi, destino) { if (!mi || !mi.nav) return; if (Math.abs((destino | 0) - mi.actual) >= 2) registrar(mi); }
  function saltar(mi, p, y) { registrar(mi); irPos(mi, p, y || 0, true); }
  function volver(mi) {
    const n = mi.nav; if (!n || !n.back.length) { aviso('No hay a dónde volver'); return; }
    n.fwd.push(posActual(mi)); const q = n.back.pop(); irPos(mi, q.p, q.f, true); botones(mi);
  }
  function adelante(mi) {
    const n = mi.nav; if (!n || !n.fwd.length) { aviso('No hay a dónde avanzar'); return; }
    n.back.push(posActual(mi)); const q = n.fwd.pop(); irPos(mi, q.p, q.f, true); botones(mi);
  }

  // ------------------------------------------------------------------ vínculos
  function cargarLinks(mi, pg) {
    if (pg.lkP) return pg.lkP;
    pg.lkP = (async () => {
      const page = await mi.pdf.getPage(pg.num), vp = page.getViewport({ scale: 1 });
      let anns = []; try { anns = await page.getAnnotations({ intent: 'display' }); } catch (_) {}
      const out = [];
      for (const a of anns) {
        if (a.subtype !== 'Link' || !a.rect) continue;
        const r = vp.convertToViewportRectangle(a.rect), x1 = Math.min(r[0], r[2]), x2 = Math.max(r[0], r[2]), y1 = Math.min(r[1], r[3]), y2 = Math.max(r[1], r[3]);
        const o = { x: x1 / vp.width, y: y1 / vp.height, w: (x2 - x1) / vp.width, h: (y2 - y1) / vp.height };
        if (o.w <= 0 || o.h <= 0) continue;
        if (a.url || a.unsafeUrl) o.url = a.url || a.unsafeUrl; else if (a.dest) o.dest = a.dest;
        else if (a.action === 'NextPage') o.rel = 1; else if (a.action === 'PrevPage') o.rel = -1; else if (a.action === 'FirstPage') o.abs = 1; else if (a.action === 'LastPage') o.abs = mi.n;
        else continue;
        out.push(o);
      }
      pg.lk = out; return out;
    })().catch(() => { pg.lk = []; return []; });
    return pg.lkP;
  }
  // ------------------------------------------------------------------ lectura inteligente del índice
  // Las páginas de índice listan «Título ........ 38». Ese número es el de la página IMPRESA, que casi nunca coincide con la del PDF y
  // los vínculos del archivo suelen estar mal armados. Entonces se lee el texto de la línea tocada (capa de texto o, si es un escaneo, OCR),
  // se separa título y número y se busca la página real: por la numeración impresa del pie de página y, sobre todo, verificando que el
  // título aparezca en esa página. Lo que se aprende (diferencia entre numeración impresa y PDF) se recuerda para los próximos toques.
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const toks = (t) => norm(t).split(' ').filter((w) => w.length >= 3 && !/^\d+$/.test(w));
  const BADGES = /\b(cr[ií]tico|medio|complementario|obligatorio|opcional|bajo|alto)\b/gi;

  function agrupar(items, vp) {
    const xs = items.map((it) => {
      const p = vp.convertToViewportPoint(it.transform[4], it.transform[5]);
      return { x: p[0], y: p[1], h: Math.abs(it.height) || Math.hypot(it.transform[2], it.transform[3]) || 10, w: Math.abs(it.width) || 0, s: it.str };
    }).sort((a, b) => a.y - b.y || a.x - b.x);
    const L = [];
    for (const it of xs) {
      const l = L.find((q) => Math.abs(q.y - it.y) <= Math.max(2, Math.min(q.h, it.h) * 0.5));
      if (l) { l.it.push(it); l.h = Math.max(l.h, it.h); } else L.push({ y: it.y, h: it.h, it: [it] });
    }
    return L.map((l) => {
      l.it.sort((a, b) => a.x - b.x);
      return { txt: l.it.map((i) => i.s).join(' ').replace(/\s+/g, ' ').trim(), x0: Math.min(...l.it.map((i) => i.x)) / vp.width, x1: Math.max(...l.it.map((i) => i.x + i.w)) / vp.width, y0: (l.y - l.h) / vp.height, y1: (l.y + 0.3 * l.h) / vp.height, h: l.h / vp.height };
    });
  }
  // «Título ....... 38»  →  { titulo, num }
  function parseEntrada(txt) {
    const t = String(txt || '').replace(/[.·…_․‧]{2,}/g, ' ').replace(/\s+/g, ' ').trim();
    const m = /^(.*?)[\s.·…\-–—]*\b(\d{1,4})\s*$/.exec(t); if (!m) return null;
    const titulo = m[1].replace(BADGES, ' ').replace(/\s+/g, ' ').trim(), num = +m[2];
    if (titulo.length < 3 || !/[a-záéíóúñ]{3,}/i.test(titulo) || num < 1 || num > 3000) return null;
    return { titulo, num };
  }
  function resumirPagina(lineas) {
    const hs = lineas.map((l) => l.h).sort((a, b) => a - b), med = hs.length ? hs[hs.length >> 1] : 0;
    const tk = new Set(), grandes = new Set();
    lineas.forEach((l) => { const t = toks(l.txt); t.forEach((w) => tk.add(w)); if (med && l.h >= med * 1.25) t.forEach((w) => grandes.add(w)); });
    const ent = lineas.map((l) => parseEntrada(l.txt)).filter(Boolean);
    let asc = 0; for (let i = 1; i < ent.length; i++) if (ent[i].num >= ent[i - 1].num) asc++;
    return { lineas, toks: tk, grandes, indice: ent.length >= 6 && asc / Math.max(1, ent.length - 1) >= 0.7 };
  }

  // OCR (solo para páginas escaneadas, sin capa de texto): tesseract.js se baja la primera vez que hace falta
  let tessP = null;
  function cargarTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tessP) return tessP;
    tessP = new Promise((ok, mal) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'; s.onload = () => ok(window.Tesseract); s.onerror = () => { tessP = null; mal(new Error('ocr')); }; document.head.appendChild(s); });
    return tessP;
  }
  async function ocrLineas(mi, page, vp) {
    const T = await cargarTesseract();
    const v2 = page.getViewport({ scale: 2 }), cv = document.createElement('canvas'); cv.width = Math.floor(v2.width); cv.height = Math.floor(v2.height);
    await page.render({ canvasContext: cv.getContext('2d'), viewport: v2 }).promise;
    const r = await T.recognize(cv, 'spa');
    const lines = (r && r.data && r.data.lines) || [];
    return lines.map((l) => ({ txt: String(l.text || '').replace(/\s+/g, ' ').trim(), x0: l.bbox.x0 / v2.width, x1: l.bbox.x1 / v2.width, y0: l.bbox.y0 / v2.height, y1: l.bbox.y1 / v2.height, h: (l.bbox.y1 - l.bbox.y0) / v2.height })).filter((l) => l.txt);
  }
  // texto estructurado de una página (con caché); ocr:true permite leer escaneos con OCR
  function datosPagina(mi, n, ocr) {
    const c = mi._dp || (mi._dp = {});
    if (c[n] && (c[n].lineas.length || !ocr || c[n].ocrHecho)) return Promise.resolve(c[n]);
    return (c[n + 'p'] = (async () => {
      const page = await mi.pdf.getPage(n), vp = page.getViewport({ scale: 1 });
      let items = []; try { items = (await page.getTextContent()).items.filter((i) => i.str && i.str.trim()); } catch (_) {}
      let lineas = items.reduce((t, i) => t + i.str.length, 0) >= 15 ? agrupar(items, vp) : [], ocrHecho = false;   // menos de 15 letras: es un escaneo (sin capa de texto)
      if (!lineas.length && ocr) { ocrHecho = true; try { lineas = await ocrLineas(mi, page, vp); } catch (_) {} }
      const d = Object.assign(resumirPagina(lineas), { ocrHecho, n }); c[n] = d; return d;
    })());
  }
  function puntajeTitulo(titulo, dp) {
    const tk = [...new Set(toks(titulo))]; if (!tk.length || !dp.toks.size) return 0;
    const hit = tk.filter((t) => dp.toks.has(t)).length / tk.length, hg = tk.filter((t) => dp.grandes.has(t)).length / tk.length;
    return hit * 0.75 + hg * 0.25;
  }
  // numeración impresa de las páginas (el «38» del pie): número impreso → página del PDF
  async function mapaImpreso(mi) {
    if (mi.mapaImp) return mi.mapaImp;
    const mapa = {}; let con = 0;
    for (let n = 1; n <= mi.n; n++) {
      const dp = await datosPagina(mi, n, false);
      const l = dp.lineas.filter((x) => (x.y0 > 0.86 || x.y1 < 0.1) && /^\s*(?:p[aá]g(?:ina)?\.?\s*)?(\d{1,4})\s*$/i.test(x.txt));
      if (l.length) { const v = +/(\d{1,4})/.exec(l[0].txt)[1]; if (!(v in mapa)) mapa[v] = n; con++; }
    }
    mi.mapaImp = con >= Math.max(4, mi.n * 0.35) ? mapa : {};   // si pocas páginas tienen número, no es confiable
    return mi.mapaImp;
  }
  const lsOff = (id) => 'nika_pdf_offnum_' + id;
  function offsetGuardado(mi) { if (mi.offNum != null) return mi.offNum; try { const v = localStorage.getItem(lsOff(mi.fileId)); if (v != null && v !== '') mi.offNum = +v; } catch (_) {} return mi.offNum != null ? mi.offNum : null; }
  function aprenderOffset(mi, off) { mi.offNum = off; try { localStorage.setItem(lsOff(mi.fileId), String(off)); } catch (_) {} }

  // dado «título + número impreso», busca la página real y la línea del encabezado
  async function destinoInteligente(mi, origen, ent, destVinculo, escaneado) {
    const N = ent.num, titulo = ent.titulo, off = offsetGuardado(mi);
    const cands = []; const ya = new Set();
    const add = (p) => { if (p >= 1 && p <= mi.n && p !== origen && !ya.has(p)) { ya.add(p); cands.push(p); } };
    let mapa = {}; if (!escaneado) { try { mapa = await mapaImpreso(mi); } catch (_) {} }
    if (mapa[N]) add(mapa[N]);
    if (destVinculo) add(destVinculo);
    const centro = N + (off != null ? off : 0), radio = escaneado ? 5 : mi.n;
    for (let k = 0; k <= radio; k++) { add(centro + k); add(centro - k); }
    let mejor = null, mejorS = 0;
    for (const c of cands) {
      const dp = await datosPagina(mi, c, !!escaneado);
      if (dp.indice) continue;                      // otra página de índice: no es el destino
      const s = puntajeTitulo(titulo, dp);
      if (s > mejorS + 0.001) { mejorS = s; mejor = c; }
      if (s >= 0.95 || (s >= 0.75 && (c === mapa[N] || (off != null && c === centro)))) break;
    }
    if (!mejor || mejorS < 0.6) {                    // el título no aparece: se confía en la numeración impresa o en el vínculo
      const p = mapa[N] || (off != null ? centro : 0) || destVinculo || 0;
      return p && p >= 1 && p <= mi.n ? { p, y: 0, s: 0, aprox: true } : null;
    }
    if (mejorS >= 0.75) aprenderOffset(mi, mejor - N);
    const dp = await datosPagina(mi, mejor, !!escaneado); let yL = 0, mS = 0;
    dp.lineas.forEach((l) => { const t = toks(l.txt); if (!t.length) return; const tk = new Set(toks(titulo)), s = t.filter((w) => tk.has(w)).length / tk.size; if (s > mS) { mS = s; yL = l.y0; } });
    return { p: mejor, y: mS >= 0.5 ? Math.max(0, yL - 0.02) : 0, s: mejorS };
  }

  // ------------------------------------------------------------------ vínculos y entradas de índice bajo el cursor
  function alRenderizar(mi, pg) {
    if (mi.pdf && !pg.lkP) cargarLinks(mi, pg);
    if (mi.pdf && !pg.dpP) pg.dpP = datosPagina(mi, pg.num, false).then((d) => { pg.dp = d; return d; }).catch(() => null);
    pintarMarcador(mi, pg);
  }
  function posEnPagina(mi, e) {
    const el = e.target.closest && e.target.closest('.nk-pg'); if (!el || e.target.closest('.nk-an > *')) return null;
    const pg = mi.pags[+el.dataset.p - 1]; if (!pg) return null;
    const b = el.getBoundingClientRect(); return { pg, el, fx: (e.clientX - b.left) / b.width, fy: (e.clientY - b.top) / b.height };
  }
  // entrada de índice (línea con «título … número») bajo el cursor; solo en páginas que parecen un índice (o con Ctrl+clic en cualquiera)
  function entradaEn(mi, e, forzar) {
    const q = posEnPagina(mi, e); if (!q || !q.pg.dp) return null;
    const dp = q.pg.dp; if (!dp.indice && !forzar) return null;
    const l = dp.lineas.find((x) => q.fy >= x.y0 - x.h * 0.15 && q.fy <= x.y1 + x.h * 0.15);
    const ent = l && parseEntrada(l.txt); if (!ent) return null;
    return Object.assign({ pg: q.pg, el: q.el, linea: l }, ent);
  }
  function enLink(mi, e) {
    if (mi.modo !== 'sel') return null;
    const q = posEnPagina(mi, e); if (!q || !q.pg.lk || !q.pg.lk.length) return null;
    const l = q.pg.lk.find((k) => q.fx >= k.x && q.fx <= k.x + k.w && q.fy >= k.y && q.fy <= k.y + k.h);
    return l ? { pg: q.pg, l, el: q.el } : null;
  }
  async function destinoDe(mi, pg, l) {
    if (l.p) return l;
    if (l.dest) { const r = await resolverDest(mi, l.dest); if (r) { l.p = r.p; l.y = r.y; } }
    else if (l.rel) l.p = Math.max(1, Math.min(mi.n, pg.num + l.rel)); else if (l.abs) l.p = l.abs;
    return l;
  }
  function ocultarHl(mi) { if (mi.lkHl) mi.lkHl.style.display = 'none'; mi.root.classList.remove('nk-sobre-link'); mi.scroll.removeAttribute('title'); }
  function marcarHl(mi, el, x, y, w, h) {
    if (!mi.lkHl) { mi.lkHl = document.createElement('i'); mi.lkHl.className = 'nk-lk-hl'; }
    if (mi.lkHl.parentNode !== el) el.appendChild(mi.lkHl);
    Object.assign(mi.lkHl.style, { display: 'block', left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
    mi.root.classList.add('nk-sobre-link');
  }
  function mover(mi, e) {
    if (mi._lkRaf) return; mi._lkRaf = requestAnimationFrame(() => {
      mi._lkRaf = 0; if (mi.modo !== 'sel') { ocultarHl(mi); return; }
      const ent = entradaEn(mi, e, e.ctrlKey || e.metaKey);
      if (ent) { marcarHl(mi, ent.el, Math.max(0, ent.linea.x0 - 0.01), ent.linea.y0, Math.min(1, ent.linea.x1 - ent.linea.x0 + 0.02), ent.linea.y1 - ent.linea.y0); mi.scroll.title = 'Ir a «' + ent.titulo + '» (el índice dice pág. ' + ent.num + ')'; return; }
      const h = enLink(mi, e);
      if (!h) { ocultarHl(mi); return; }
      marcarHl(mi, h.el, h.l.x, h.l.y, h.l.w, h.l.h);
      mi.scroll.title = h.l.url ? 'Abrir el enlace: ' + h.l.url : (h.l.p ? 'Ir a la página ' + h.l.p : 'Ir al enlace');
      if (!h.l.p && !h.l.url) destinoDe(mi, h.pg, h.l).then((l) => { if (l.p && mi.lkHl && mi.lkHl.style.display === 'block') mi.scroll.title = 'Ir a la página ' + l.p; });
    });
  }
  async function clickLink(mi, e) {
    if (e.button || mi.modo !== 'sel') return;
    const s = getSelection(); if (s && !s.isCollapsed && mi.scroll.contains(s.anchorNode)) return;   // se estaba seleccionando texto
    const forzar = e.ctrlKey || e.metaKey, q = posEnPagina(mi, e); if (!q) return;
    let ent = null;
    if (!q.pg.dp && q.pg.dpP) await q.pg.dpP;   // casi nunca: el texto de la página ya está listo
    if (q.pg.dp && !q.pg.dp.lineas.length && forzar) {   // página escaneada: Ctrl+clic lee la página con OCR
      e.preventDefault(); e.stopPropagation(); aviso('Leyendo la página con OCR… (la primera vez baja el motor, puede tardar)');
      try { q.pg.dp = await datosPagina(mi, q.pg.num, true); } catch (_) { aviso('No se pudo usar el OCR (¿sin conexión?)'); return; }
    }
    ent = entradaEn(mi, e, forzar);
    if (ent) {
      e.preventDefault(); e.stopPropagation(); aviso('Buscando «' + ent.titulo.slice(0, 40) + '»…');
      const lk = enLink(mi, e); let dv = null; if (lk) { const l = await destinoDe(mi, lk.pg, lk.l); if (l.p) dv = l.p; }
      const escaneado = !!(q.pg.dp && q.pg.dp.ocrHecho);
      const r = await destinoInteligente(mi, q.pg.num, ent, dv, escaneado);
      if (L() && L().estado() !== mi) return;
      if (r) { saltar(mi, r.p, r.y); aviso((r.aprox ? 'Fui a la pág. ' + r.p + ' (no pude confirmar el título allí)' : '📖 «' + ent.titulo.slice(0, 36) + '» · pág. ' + r.p + ' del PDF') + ' · Alt+← para volver'); }
      else aviso('No pude ubicar esa sección en el PDF');
      return;
    }
    const h = enLink(mi, e); if (!h) return;
    e.preventDefault(); e.stopPropagation();
    const l = await destinoDe(mi, h.pg, h.l);
    if (l.url) { if (/^(https?:|mailto:)/i.test(l.url)) { window.open(l.url, '_blank', 'noopener,noreferrer'); aviso('Abriendo el enlace en otra pestaña'); } return; }
    if (l.p) { if (l.p === mi.actual && !l.y) { aviso('Ya estás en esa página'); return; } saltar(mi, l.p, l.y); aviso('Fuiste a la pág. ' + l.p + ' · Alt+← para volver'); }
    else aviso('No se pudo ubicar ese destino');
  }

  // ------------------------------------------------------------------ índice
  const RE_IND = /^\s*(índice|indice|contenido|contenidos|tabla de contenidos?|sumario|table of contents|contents)\b/i;
  const lsIdx = (id) => 'nika_pdf_indice_' + id;
  // puntaje de «esto parece un índice»: título al principio, muchos vínculos internos, muchos números de página
  async function puntuar(mi, n) {
    let txt = '', links = 0;
    try {
      const page = await mi.pdf.getPage(n); txt = (await page.getTextContent()).items.map((i) => i.str).join(' ');
      links = (await page.getAnnotations({ intent: 'display' })).filter((a) => a.subtype === 'Link' && (a.dest || a.action)).length;
    } catch (_) {}
    const titulo = RE_IND.test(txt.slice(0, 300).trim()) || /\b(índice|indice|tabla de contenidos?)\b/i.test(txt.slice(0, 160));
    const nums = (txt.match(/\b\d{1,4}\b/g) || []).length;
    let s = 0; if (titulo) s += 3; if (links >= 8) s += Math.min(4, Math.floor(links / 8)); if (nums >= 10) s += 2;
    return s;
  }
  async function paginaIndice(mi) {
    if (mi.pagInd !== undefined) return mi.pagInd;
    try { const g = +localStorage.getItem(lsIdx(mi.fileId)); if (g >= 1 && g <= mi.n) { mi.pagInd = g; return g; } } catch (_) {}   // la que fijó el usuario
    const cand = new Set(); for (let n = 1; n <= Math.min(mi.n, 60); n++) cand.add(n);
    try {   // entradas del índice interno que se llamen «Índice» o «Contenido»: solo se suman a los candidatos, se verifican igual
      const out = await mi.pdf.getOutline();
      const busca = async (its) => { for (const it of its || []) { if (RE_IND.test(it.title || '')) { const r = await resolverDest(mi, it.dest); if (r) cand.add(r.p); } await busca(it.items); } };
      await busca(out || []);
    } catch (_) {}
    for (let n = Math.max(1, mi.n - 8); n <= mi.n; n++) cand.add(n);   // hay libros con el índice al final
    let mejor = null, ptsM = 0;
    for (const n of [...cand].sort((a, b) => a - b)) {
      const s = await puntuar(mi, n); if (s > ptsM) { ptsM = s; mejor = n; }
      if (ptsM >= 9) break;   // clarísimo: no hace falta seguir
    }
    mi.pagInd = ptsM >= 5 ? mejor : null; return mi.pagInd;
  }
  async function irIndice(mi) {
    aviso('Buscando el índice…');
    const p = await paginaIndice(mi); if (L() && L().estado() !== mi) return;
    if (p) { if (p === mi.actual) { aviso('Ya estás en el índice'); return; } saltar(mi, p, 0); aviso('Índice · pág. ' + p + ' · Alt+← para volver · si no es, fijá la correcta en 🔖 Marcadores'); return; }
    aviso('No encontré una página de índice: te muestro el índice del panel (o fijá una en 🔖 Marcadores)');
    const b = $('[data-xacc="paginas"]', mi.root); if (b && !b.classList.contains('on')) b.click();
    setTimeout(() => { const t = $('.nkx-tabs button[data-t="indice"]', mi.root); if (t) t.click(); }, 260);
  }

  // ------------------------------------------------------------------ marcadores propios
  const esMarcador = (n) => !n.anotacion && Array.isArray(n.etiquetas) && n.etiquetas.includes(SEG_ETQ);
  const tituloDe = (n) => { const d = NP().leer(n); return d.t || d.p || ('Pág. ' + (n.posicion || '?')); };
  async function cargarMarcadores(mi) {
    try { const api = NP(); if (!api) { mi.marc = []; return; } mi.marc = (await api.notasDelArchivo(mi.fileId)).filter((n) => esMarcador(n) && !api.leer(n).d); } catch (_) { mi.marc = []; }
    mi.pags.forEach((pg) => { if (pg.hecho) pintarMarcador(mi, pg); }); actualizarBotonMarc(mi);
  }
  const marcDe = (mi, p) => (mi.marc || []).filter((m) => +m.posicion === p);
  function actualizarBotonMarc(mi) {
    const b = $('[data-accion="nav-marcadores"]', mi.root); if (!b) return;
    const hay = marcDe(mi, mi.actual).length > 0; b.classList.toggle('on', hay);
    b.title = hay ? 'Esta página tiene marcador (K para quitarlo). Tocá para ver todos' : 'Marcadores (K marca esta página)';
  }
  function pintarMarcador(mi, pg) {
    const v = pg.el.querySelector('.nk-marcador'), m = marcDe(mi, pg.num)[0];
    if (!m) { if (v) v.remove(); return; }
    const t = '🔖 ' + tituloDe(m);
    if (v) { v.textContent = t; return; }
    const d = document.createElement('div'); d.className = 'nk-marcador'; d.textContent = t; d.title = 'Marcador: tocá para ver todos';
    d.addEventListener('pointerdown', (e) => e.stopPropagation()); d.addEventListener('click', (e) => { e.stopPropagation(); popMarcadores(mi, $('[data-accion="nav-marcadores"]', mi.root)); });
    pg.el.appendChild(d);
  }
  // nombre sugerido: el capítulo del índice interno en el que cae la página
  async function nombreSugerido(mi, p) {
    try {
      if (!mi.outFlat) {
        const out = await mi.pdf.getOutline(); const plano = []; let n = 0;
        const rec = async (its) => { for (const it of its || []) { if (++n > 500) return; const r = await resolverDest(mi, it.dest); if (r) plano.push({ t: it.title || '', p: r.p }); await rec(it.items); } };
        await rec(out || []); mi.outFlat = plano;
      }
      let mejor = null; mi.outFlat.forEach((x) => { if (x.p <= p && (!mejor || x.p >= mejor.p)) mejor = x; });
      if (mejor && mejor.t) return mejor.t.trim().slice(0, 60);
    } catch (_) {}
    return '';
  }
  async function agregarMarcador(mi, titulo) {
    const api = NP(); if (!api) { aviso('Los marcadores no están disponibles en este momento'); return null; }
    const p = mi.actual, pos = posActual(mi);
    if (!titulo) titulo = (await nombreSugerido(mi, p)) || ('Pág. ' + p);
    const n = await api.insertar({ recurso: 'pdf:' + mi.fileId, recurso_titulo: mi.title || null, modulo: api.modulo(), up_id: api.upActual(), tipo: 'material', posicion: p,
      texto: api.empaquetar({ t: titulo, p: '' }), color: 'amarillo', etiquetas: [SEG_ETQ], pos_y: +Math.max(0, pos.f).toFixed(4), creado_en: new Date().toISOString() });
    (mi.marc || (mi.marc = [])).push(n); pintarMarcador(mi, mi.pags[p - 1]); actualizarBotonMarc(mi);
    try { if (api.refrescar) api.refrescar(mi); } catch (_) {}
    return n;
  }
  async function quitarMarcador(mi, n) {
    await NP().borrar(n); mi.marc = (mi.marc || []).filter((x) => x !== n);
    const pg = mi.pags[(+n.posicion || 1) - 1]; if (pg) pintarMarcador(mi, pg); actualizarBotonMarc(mi);
  }
  async function alternarMarcador(mi) {
    const ya = marcDe(mi, mi.actual);
    if (ya.length) { await quitarMarcador(mi, ya[0]); aviso('🔖 Marcador quitado de la pág. ' + mi.actual); return; }
    const n = await agregarMarcador(mi); if (n) aviso('🔖 Marcador en la pág. ' + mi.actual + ' · K para quitarlo');
  }
  function cerrarPopM(mi) { const p = $('.nkv-pop', mi.root); if (p) p.remove(); if (mi._popOff) { mi._popOff(); mi._popOff = null; } }
  function popMarcadores(mi, btn) {
    if ($('.nkv-pop', mi.root)) { cerrarPopM(mi); return; }
    const p = document.createElement('div'); p.className = 'nkv-pop'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Marcadores');
    const pintar = () => {
      const l = (mi.marc || []).slice().sort((a, b) => (a.posicion || 0) - (b.posicion || 0) || (a.pos_y || 0) - (b.pos_y || 0));
      p.innerHTML = `<h5><span>🔖 Marcadores de este PDF</span><button type="button" data-x="cerrar" aria-label="Cerrar">✕</button></h5>
        <div class="nkv-nuevo"><input type="text" maxlength="70" placeholder="Nombre (opcional) para la pág. ${mi.actual}" aria-label="Nombre del marcador"><button type="button" data-x="nuevo">Marcar pág. ${mi.actual}</button></div>`
        + (l.length ? '<div class="nkv-lista">' + l.map((n, i) => `<div class="nkv-it${+n.posicion === mi.actual ? ' act' : ''}" data-i="${i}"><span class="p">${esc(n.posicion || '?')}</span><span class="t">${esc(tituloDe(n))}</span><button type="button" data-x="ren" title="Cambiar el nombre">✏️</button><button type="button" class="del" data-x="del" title="Quitar el marcador">🗑</button></div>`).join('') + '</div>'
          : '<div class="nkv-vacio">Todavía no marcaste nada. Con <b>K</b> o con el botón dejás un marcador en la página que estás leyendo, con el nombre del capítulo.</div>')
        + `<div class="nkv-pie"><button type="button" data-x="idx">📑 La pág. ${mi.actual} es el índice del libro</button>${mi.pagInd ? `<small>Índice actual: pág. ${mi.pagInd}</small>` : ''}</div>`;
      p._l = l;
    };
    pintar();
    p.addEventListener('pointerdown', (e) => e.stopPropagation());
    p.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') cerrarPopM(mi); if (e.key === 'Enter' && e.target.matches('.nkv-nuevo input')) p.querySelector('[data-x=nuevo]').click(); });
    p.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-x]'), it = e.target.closest('.nkv-it'); const n = it && p._l[+it.dataset.i];
      if (b && b.dataset.x === 'cerrar') { cerrarPopM(mi); return; }
      if (b && b.dataset.x === 'idx') { mi.pagInd = mi.actual; try { localStorage.setItem(lsIdx(mi.fileId), String(mi.actual)); } catch (_) {} aviso('📑 Listo: el botón Índice ahora te lleva a la pág. ' + mi.actual); pintar(); return; }
      if (b && b.dataset.x === 'nuevo') { const v = p.querySelector('.nkv-nuevo input').value.trim(); b.disabled = true; await agregarMarcador(mi, v); pintar(); return; }
      if (b && b.dataset.x === 'del' && n) { await quitarMarcador(mi, n); pintar(); return; }
      if (b && b.dataset.x === 'ren' && n) {
        const t = it.querySelector('.t'); t.innerHTML = `<input type="text" maxlength="70" value="${esc(tituloDe(n))}">`; const i = t.querySelector('input'); i.focus(); i.select();
        const fin = async () => { const v = i.value.trim() || tituloDe(n); const d = NP().leer(n); await NP().actualizar(n, { texto: NP().empaquetar({ t: v, p: d.p, h: d.h, x: d.x }) }); pintarMarcador(mi, mi.pags[(+n.posicion || 1) - 1]); pintar(); };
        i.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); fin(); } if (ev.key === 'Escape') { ev.stopPropagation(); pintar(); } });
        i.addEventListener('blur', fin, { once: true }); i.addEventListener('click', (ev) => ev.stopPropagation()); return;
      }
      if (it && n) { saltar(mi, +n.posicion, n.pos_y || 0); cerrarPopM(mi); }
    });
    mi.root.appendChild(p);
    const rr = mi.root.getBoundingClientRect(), br = btn ? btn.getBoundingClientRect() : rr;
    p.style.top = Math.max(8, br.bottom - rr.top + 8) + 'px'; p.style.left = Math.max(8, Math.min(rr.width - p.offsetWidth - 8, br.left - rr.left)) + 'px';
    const fuera = (ev) => { if (!p.contains(ev.target) && !(btn && btn.contains(ev.target))) cerrarPopM(mi); };
    setTimeout(() => document.addEventListener('pointerdown', fuera, true), 0);
    mi._popOff = () => document.removeEventListener('pointerdown', fuera, true);
    const inp = p.querySelector('.nkv-nuevo input'); if (inp) setTimeout(() => inp.focus(), 30);
  }

  // ------------------------------------------------------------------ resumen de sesión (al salir del modo teatro)
  function sesionInicio(mi) {
    const E = window.PomodoroEngine; let hoy = 0; try { hoy = E ? E.getTodayMinutes() : 0; } catch (_) {}
    mi.ses = { t0: Date.now(), leidas: new Set(mi.leidas), marcas: new Set(mi.marcas), anots: new Set((mi.anots || []).map((a) => String(a.id))), marc: new Set((mi.marc || []).map((m) => String(m.id))), pag0: mi.actual, hoy };
  }
  function fmtMin(m) { m = Math.max(0, Math.round(m)); return m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min'; }
  function sesionFin(mi) {
    const s = mi.ses; mi.ses = null; if (!s) return;
    const min = (Date.now() - s.t0) / 60000;
    let leidas = 0; mi.leidas.forEach((n) => { if (!s.leidas.has(n)) leidas++; });
    let subr = 0; mi.marcas.forEach((m) => { if (!s.marcas.has(m)) subr++; });
    const notas = (mi.anots || []).filter((a) => !s.anots.has(String(a.id))).length, marc = (mi.marc || []).filter((m) => !s.marc.has(String(m.id))).length;
    if (min < 1 && !(leidas || subr || notas || marc)) return;
    const E = window.PomodoroEngine; let meta = '', ok = false, pomo = 0;
    try {
      const goal = (E.getPrefs && E.getPrefs().goalMin) || 0, hoy = E.getTodayMinutes(); pomo = Math.max(0, hoy - s.hoy);
      if (goal > 0) { const falta = Math.ceil(goal - hoy); ok = falta <= 0; meta = ok ? '🎯 ¡Meta del día cumplida!' : '🎯 Meta del día: te faltan ' + fmtMin(falta); }
    } catch (_) {}
    const pct = mi.n ? Math.round((mi.leidas.size / mi.n) * 100) : 0;
    const caja = (n, t) => `<div class="${n ? '' : 'cero'}"><b>${n}</b><span>${t}</span></div>`;
    css(); const old = $('.nkv-res', mi.root); if (old) old.remove();
    const r = document.createElement('div'); r.className = 'nkv-res'; r.setAttribute('role', 'dialog'); r.setAttribute('aria-label', 'Resumen de tu sesión');
    r.innerHTML = `<div class="c"><h3>🎓 Resumen de tu sesión</h3><p class="sub">${fmtMin(min < 1 ? 1 : min)} en modo teatro${pomo > 0 ? ' · ' + fmtMin(pomo) + ' acreditados en tu Pomodoro' : ''}</p>
      <div class="g">${caja(leidas, leidas === 1 ? 'página leída' : 'páginas leídas')}${caja(subr, subr === 1 ? 'subrayado nuevo' : 'subrayados nuevos')}${caja(notas, notas === 1 ? 'nota o texto' : 'notas y textos')}${caja(marc, marc === 1 ? 'marcador' : 'marcadores')}</div>
      <div class="bar"><i style="width:${pct}%"></i></div><div class="prog">${mi.leidas.size} de ${mi.n} páginas leídas · ${pct} % del PDF</div>${meta ? `<div class="meta${ok ? ' ok' : ''}">${meta}</div>` : ''}
      <div class="pie"><button type="button" class="ok">Seguir leyendo</button></div></div>`;
    const cerrar = () => { r.remove(); document.removeEventListener('keydown', tecla, true); };
    const tecla = (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); cerrar(); } };
    r.addEventListener('click', (e) => { if (e.target === r || e.target.closest('.ok')) cerrar(); });
    document.addEventListener('keydown', tecla, true);
    mi.root.appendChild(r); const b = r.querySelector('.ok'); if (b) b.focus();
  }

  // ------------------------------------------------------------------ montaje
  function montar(mi) {
    css(); mi.nav = { back: [], fwd: [] }; botones(mi);
    mi.scroll.addEventListener('pointermove', (e) => mover(mi, e), { passive: true });
    mi.scroll.addEventListener('pointerleave', () => ocultarHl(mi));
    mi.scroll.addEventListener('click', (e) => clickLink(mi, e), true);
    mi.scroll.addEventListener('scroll', () => actualizarBotonMarc(mi), { passive: true });
    mi.pags.forEach((pg) => { if (pg.hecho) alRenderizar(mi, pg); });
    cargarMarcadores(mi);
  }
  function accion(mi, a, btn) {
    if (a === 'nav-volver') volver(mi); else if (a === 'nav-adelante') adelante(mi); else if (a === 'nav-indice') irIndice(mi);
    else if (a === 'nav-marcadores') popMarcadores(mi, btn);
  }
  function cerrar(mi) { if (!mi) return; cerrarPopM(mi); const r = $('.nkv-res', mi.root); if (r) r.remove(); }

  window.NikaPdfNav = { montar, accion, alRenderizar, alSaltar, volver, adelante, irIndice, alternarMarcador, sesionInicio, sesionFin, cerrar, esMarcador, recargarMarcadores: cargarMarcadores };
})();
