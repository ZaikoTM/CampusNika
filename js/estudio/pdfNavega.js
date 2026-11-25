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
  function alRenderizar(mi, pg) { if (mi.pdf && !pg.lkP) cargarLinks(mi, pg); pintarMarcador(mi, pg); }

  function enLink(mi, e) {
    if (mi.modo !== 'sel') return null;
    const el = e.target.closest && e.target.closest('.nk-pg'); if (!el || e.target.closest('.nk-an > *')) return null;
    const pg = mi.pags[+el.dataset.p - 1]; if (!pg || !pg.lk || !pg.lk.length) return null;
    const b = el.getBoundingClientRect(), fx = (e.clientX - b.left) / b.width, fy = (e.clientY - b.top) / b.height;
    const l = pg.lk.find((k) => fx >= k.x && fx <= k.x + k.w && fy >= k.y && fy <= k.y + k.h);
    return l ? { pg, l, el } : null;
  }
  async function destinoDe(mi, pg, l) {
    if (l.p) return l;
    if (l.dest) { const r = await resolverDest(mi, l.dest); if (r) { l.p = r.p; l.y = r.y; } }
    else if (l.rel) l.p = Math.max(1, Math.min(mi.n, pg.num + l.rel)); else if (l.abs) l.p = l.abs;
    return l;
  }
  function ocultarHl(mi) { if (mi.lkHl) mi.lkHl.style.display = 'none'; mi.root.classList.remove('nk-sobre-link'); mi.scroll.removeAttribute('title'); }
  function mover(mi, e) {
    if (mi._lkRaf) return; mi._lkRaf = requestAnimationFrame(() => {
      mi._lkRaf = 0; const h = enLink(mi, e);
      if (!h) { ocultarHl(mi); return; }
      if (!mi.lkHl) { mi.lkHl = document.createElement('i'); mi.lkHl.className = 'nk-lk-hl'; }
      if (mi.lkHl.parentNode !== h.el) h.el.appendChild(mi.lkHl);
      Object.assign(mi.lkHl.style, { display: 'block', left: h.l.x * 100 + '%', top: h.l.y * 100 + '%', width: h.l.w * 100 + '%', height: h.l.h * 100 + '%' });
      mi.root.classList.add('nk-sobre-link');
      mi.scroll.title = h.l.url ? 'Abrir el enlace: ' + h.l.url : (h.l.p ? 'Ir a la página ' + h.l.p : 'Ir al enlace');
      if (!h.l.p && !h.l.url) destinoDe(mi, h.pg, h.l).then((l) => { if (l.p && mi.lkHl && mi.lkHl.style.display === 'block') mi.scroll.title = 'Ir a la página ' + l.p; });
    });
  }
  async function clickLink(mi, e) {
    if (e.button) return;
    const s = getSelection(); if (s && !s.isCollapsed && mi.scroll.contains(s.anchorNode)) return;   // se estaba seleccionando texto
    const h = enLink(mi, e); if (!h) return;
    e.preventDefault(); e.stopPropagation();
    const l = await destinoDe(mi, h.pg, h.l);
    if (l.url) { if (/^(https?:|mailto:)/i.test(l.url)) { window.open(l.url, '_blank', 'noopener,noreferrer'); aviso('Abriendo el enlace en otra pestaña'); } return; }
    if (l.p) { if (l.p === mi.actual && !l.y) { aviso('Ya estás en esa página'); return; } saltar(mi, l.p, l.y); aviso('Fuiste a la pág. ' + l.p + ' · Alt+← para volver'); }
    else aviso('No se pudo ubicar ese destino');
  }

  // ------------------------------------------------------------------ índice
  const RE_IND = /^\s*(índice|indice|contenido|contenidos|tabla de contenidos?|sumario|table of contents|contents)\b/i;
  async function paginaIndice(mi) {
    if (mi.pagInd !== undefined) return mi.pagInd;
    let p = null;
    try {   // 1) el índice interno del PDF suele tener una entrada «Índice» o «Contenido»
      const out = await mi.pdf.getOutline();
      const busca = (its) => { for (const it of its || []) { if (RE_IND.test(it.title || '')) return it; const r = busca(it.items); if (r) return r; } return null; };
      const it = out && busca(out); if (it) { const r = await resolverDest(mi, it.dest); if (r) p = r.p; }
    } catch (_) {}
    if (!p) {   // 2) se lee el texto de las primeras páginas buscando un título «Índice» con varios números de página
      const tope = Math.min(mi.n, 40);
      for (let n = 1; n <= tope && !p; n++) {
        try {
          const tc = await (await mi.pdf.getPage(n)).getTextContent(), txt = tc.items.map((i) => i.str).join(' ');
          if (RE_IND.test(txt.slice(0, 500).trim()) && (txt.match(/\b\d{1,4}\b/g) || []).length >= 8) p = n;
        } catch (_) {}
      }
    }
    mi.pagInd = p; return p;
  }
  async function irIndice(mi) {
    aviso('Buscando el índice…');
    const p = await paginaIndice(mi); if (L() && L().estado() !== mi) return;
    if (p) { if (p === mi.actual) { aviso('Ya estás en el índice'); return; } saltar(mi, p, 0); aviso('Índice · pág. ' + p + ' · Alt+← para volver'); return; }
    aviso('Este PDF no tiene una página de índice: te muestro el índice del panel');
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
          : '<div class="nkv-vacio">Todavía no marcaste nada. Con <b>K</b> o con el botón dejás un marcador en la página que estás leyendo, con el nombre del capítulo.</div>');
      p._l = l;
    };
    pintar();
    p.addEventListener('pointerdown', (e) => e.stopPropagation());
    p.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') cerrarPopM(mi); if (e.key === 'Enter' && e.target.matches('.nkv-nuevo input')) p.querySelector('[data-x=nuevo]').click(); });
    p.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-x]'), it = e.target.closest('.nkv-it'); const n = it && p._l[+it.dataset.i];
      if (b && b.dataset.x === 'cerrar') { cerrarPopM(mi); return; }
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
