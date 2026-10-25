/* CAMPUS NIKA · Extras del Lector Nika (js/estudio/pdfLector.js)
   · 🌓 Modos de lectura: Común (como siempre), Noche (fondo oscuro, cuida la vista) y Kindle (papel color crema). Se recuerda en tu cuenta.
   · 🔍 Buscar en el PDF (Ctrl+F): resultados resaltados en la página, anterior / siguiente y contador. Ignora tildes y mayúsculas.
   · 🗂 Páginas: panel lateral con el índice del PDF y las miniaturas. Está oculto: solo se ve una pestañita en el borde izquierdo,
     y se puede abrir, minimizar a una barrita u ocultar de nuevo.
   · 💾 Sin conexión: guardar este PDF en el dispositivo (js/estudio/pdfOffline.js) y abrir el Modo Sin conexión para bajar por unidad o materia.
   · 📤 Exportar: PDF con tus subrayados, dibujos y notas, con la marca de agua de NikaMed (js/estudio/pdfExportar.js).
   El lector llama a NikaPdfX.montar(mi) al armar la barra, alRenderizar(mi, pg) por cada página y cerrar(mi) al salir. */
(function () {
  'use strict';
  if (window.NikaPdfX) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lector = () => window.NikaPdf;
  const estado = () => { const L = lector(); return L && L.estado ? L.estado() : null; };
  const aviso = (t) => { const L = lector(); if (L && L.aviso) L.aviso(t); };
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
  const LS_UI = 'nika_pdf_ui', LS_TAB = 'nika_pdf_lado_tab';

  // ------------------------------------------------------------------ estilos
  function css() {
    if ($('#nkx-css')) return;
    const st = document.createElement('style'); st.id = 'nkx-css';
    st.textContent = `
/* --- modos de lectura --- */
.nkpdf.nkx-noche,.nkpdf.nkx-noche .nkpdf-scroll{background:#0a0e15}
.nkpdf.nkx-noche .nk-pg{background:#121821;box-shadow:0 4px 18px rgba(0,0,0,.65)}
.nkpdf.nkx-noche .nk-pg canvas,.nkpdf.nkx-noche .nkx-mini canvas{filter:invert(.9) hue-rotate(180deg) contrast(.94) brightness(.96)}
.nkpdf.nkx-noche .nk-hl i,.nkpdf.nkx-noche .nk-hl svg,.nkpdf.nkx-noche .nk-live{mix-blend-mode:normal;opacity:.4}
.nkpdf.nkx-noche .nk-hl svg.nk-sh,.nkpdf.nkx-noche .nk-hl i.nk-ln,.nkpdf.nkx-noche .nk-live-f{opacity:.95}
.nkpdf.nkx-noche .nk-pg .nk-num{color:#64748b}
.nkpdf.nkx-noche .nkx-bus i{mix-blend-mode:normal;background:rgba(250,204,21,.38)}
.nkpdf.nkx-noche .nkx-bus i.act{background:rgba(251,146,60,.5)}
.nkpdf.nkx-kindle,.nkpdf.nkx-kindle .nkpdf-scroll{background:#cdbf9f}
.nkpdf.nkx-kindle .nk-pg{background:#f4ecd8;box-shadow:0 4px 14px rgba(70,52,20,.32);isolation:isolate}
.nkpdf.nkx-kindle .nk-pg canvas{mix-blend-mode:multiply;filter:sepia(.22) saturate(.9) contrast(.97)}
.nkpdf.nkx-kindle .nkx-mini{background:#f4ecd8}.nkpdf.nkx-kindle .nkx-mini canvas{mix-blend-mode:multiply;filter:sepia(.22) saturate(.9)}
.nkpdf.nkx-kindle .nk-pg .nk-num{color:#8a7a55}
.nkpdf .nkx-grupo button svg{width:18px;height:18px}
/* --- ventanitas --- */
.nkx-pop{position:absolute;z-index:40;width:min(300px,calc(100% - 20px));padding:12px;border-radius:16px;background:#0f172a;color:#e2e8f0;border:1px solid rgba(168,85,247,.5);box-shadow:0 20px 44px rgba(0,0,0,.55);font:600 .8rem/1.45 'Plus Jakarta Sans',system-ui,sans-serif;animation:nkxIn .22s ease both}
@keyframes nkxIn{from{opacity:0;transform:translateY(-6px) scale(.97)}}
.nkx-pop h5{margin:0 0 8px;font-size:.86rem;font-weight:800;display:flex;justify-content:space-between;align-items:center}
.nkx-pop h5 button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:1rem}
.nkx-pop p{margin:6px 0;color:#94a3b8;font-size:.74rem}
.nkx-modos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.nkx-modo{display:flex;flex-direction:column;align-items:center;gap:6px;padding:9px 4px;border-radius:12px;border:2px solid transparent;background:#16223a;color:#e2e8f0;font:800 .72rem inherit;cursor:pointer;transition:transform .15s,border-color .15s}
.nkx-modo:hover{transform:translateY(-2px)}.nkx-modo.on{border-color:#a855f7;background:#2e1065}
.nkx-modo i{display:block;width:44px;height:56px;border-radius:5px;box-shadow:0 2px 8px rgba(0,0,0,.4);position:relative;overflow:hidden}
.nkx-modo i::before{content:"";position:absolute;left:7px;right:7px;top:10px;height:3px;border-radius:2px;background:currentColor;opacity:.75;box-shadow:0 7px 0 currentColor,0 14px 0 currentColor,0 21px 0 currentColor,0 28px 0 currentColor;color:var(--tx)}
.nkx-btn{display:block;width:100%;margin-top:8px;border:0;border-radius:11px;padding:9px 10px;font:800 .78rem inherit;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1)}
.nkx-btn.sec{background:#1e293b;color:#e2e8f0}.nkx-btn:disabled{opacity:.55;cursor:default}
.nkx-chip{display:inline-block;padding:3px 9px;border-radius:999px;font-size:.7rem;font-weight:800;background:rgba(34,197,94,.18);color:#86efac}
/* --- búsqueda --- */
.nkx-busca{position:absolute;right:14px;top:10px;z-index:9;display:none;align-items:center;gap:6px;padding:7px 8px 7px 12px;border-radius:14px;background:#0f172a;color:#e2e8f0;box-shadow:0 12px 30px rgba(0,0,0,.45);border:1px solid rgba(168,85,247,.55);max-width:calc(100% - 28px)}
.nkx-busca.on{display:flex;animation:nkxIn .2s ease both}
.nkx-busca input{width:min(220px,40vw);background:#16223a;color:#fff;border:1px solid #334155;border-radius:9px;padding:7px 10px;font:600 .82rem inherit;outline:0}
.nkx-busca input:focus{border-color:#a855f7}
.nkx-busca .c{font-size:.72rem;font-weight:800;min-width:74px;text-align:center;color:#c4b5fd;white-space:nowrap}
.nkx-busca button{border:0;background:rgba(255,255,255,.1);color:#e2e8f0;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:.8rem}
.nkx-busca button:hover{background:rgba(255,255,255,.2)}
.nkx-bus{position:absolute;inset:0;pointer-events:none;z-index:2}
.nkx-bus i{position:absolute;border-radius:3px;background:rgba(250,204,21,.5);mix-blend-mode:multiply}
.nkx-bus i.act{background:rgba(249,115,22,.6);outline:2px solid #ea580c;mix-blend-mode:normal;opacity:.85}
/* --- panel de páginas e índice (oculto por defecto) --- */
.nkx-asa{position:absolute;left:0;top:50%;transform:translateY(-50%);z-index:6;width:15px;height:64px;border:0;border-radius:0 10px 10px 0;background:rgba(15,23,42,.6);color:#e2e8f0;cursor:pointer;opacity:.4;transition:opacity .2s,width .2s;font-size:.8rem;padding:0}
.nkx-asa:hover,.nkx-asa:focus-visible{opacity:1;width:24px}
.nkpdf.nkx-lado-on .nkx-asa{display:none}
.nkx-lado{position:absolute;left:0;top:0;bottom:0;width:min(250px,84%);z-index:7;display:flex;flex-direction:column;background:#0f172a;color:#e2e8f0;box-shadow:12px 0 30px rgba(0,0,0,.45);transform:translateX(-106%);transition:transform .28s cubic-bezier(.22,1,.36,1),width .2s;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkx-lado.on{transform:none}
.nkx-lado.min{width:46px}
.nkx-cab{display:flex;align-items:center;gap:4px;padding:8px;border-bottom:1px solid rgba(255,255,255,.1)}
.nkx-tabs{display:flex;gap:2px;flex:1;background:rgba(255,255,255,.07);border-radius:10px;padding:2px;min-width:0}
.nkx-tabs button{flex:1;border:0;background:none;color:#94a3b8;font:800 .72rem inherit;padding:6px 2px;border-radius:8px;cursor:pointer;white-space:nowrap}
.nkx-tabs button.on{background:#7e22ce;color:#fff}
.nkx-cab>button{border:0;background:rgba(255,255,255,.1);color:#e2e8f0;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:.85rem;flex:none}
.nkx-cab>button:hover{background:rgba(255,255,255,.22)}
.nkx-bexp{display:none}.nkx-lado.min .nkx-bexp{display:block}
.nkx-lado.min .nkx-tabs,.nkx-lado.min .nkx-cuerpo,.nkx-lado.min .nkx-bmin,.nkx-lado.min .nkx-bx{display:none}
.nkx-lado:not(.min) .nkx-rail{display:none}
.nkx-rail{flex:1;display:flex;flex-direction:column;align-items:center;padding-top:10px;gap:10px;cursor:pointer;color:#94a3b8;font-size:.7rem;font-weight:800}
.nkx-rail span{writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:.5px}
.nkx-lado.min .nkx-cab{justify-content:center;padding:8px 4px}
.nkx-cuerpo{flex:1;overflow:auto;padding:10px 8px 14px;-webkit-overflow-scrolling:touch}
.nkx-mini{position:relative;margin:0 auto 22px;width:128px;aspect-ratio:.707;cursor:pointer;border-radius:6px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.45);outline:2px solid transparent;outline-offset:2px;transition:outline-color .15s,transform .15s}
.nkx-mini:hover{transform:scale(1.03)}.nkx-mini.act{outline-color:#a855f7}
.nkx-mini canvas{display:block;width:100%;height:100%;border-radius:6px}
.nkx-mini>span{position:absolute;left:50%;bottom:-17px;transform:translateX(-50%);font-size:.66rem;color:#94a3b8;font-weight:800}
.nkx-mini.act>span{color:#c4b5fd}
.nkx-mini i{position:absolute;top:5px;width:9px;height:9px;border-radius:50%;box-shadow:0 0 0 2px rgba(15,23,42,.6);display:none}
.nkx-mini i.ok{right:5px;background:#22c55e}.nkx-mini i.mk{left:5px;background:#a855f7}
.nkx-mini.leida i.ok,.nkx-mini.marcas i.mk{display:block}
.nkx-it{display:flex;align-items:flex-start;gap:2px;margin:1px 0}
.nkx-it .tg{flex:none;width:20px;height:24px;border:0;background:none;color:#94a3b8;cursor:pointer;font-size:.8rem;padding:0}
.nkx-it .ti{flex:1;min-width:0;text-align:left;border:0;background:none;color:#e2e8f0;font:600 .78rem/1.35 inherit;padding:4px 6px;border-radius:7px;cursor:pointer}
.nkx-it .ti:hover{background:rgba(255,255,255,.1)}
.nkx-vacio{padding:14px 8px;color:#94a3b8;font-size:.78rem;line-height:1.5}
@media (max-width:640px){.nkx-busca{right:8px;left:8px;max-width:none}.nkx-busca input{flex:1;width:auto}}
@media (prefers-reduced-motion:reduce){.nkx-lado,.nkx-pop,.nkx-busca.on{animation:none!important;transition:none!important}}`;
    document.head.appendChild(st);
  }

  // ------------------------------------------------------------------ modos de lectura
  const MODOS = {
    comun: { nom: 'Común', fondo: '#ffffff', tx: '#0f172a' },
    noche: { nom: 'Noche', fondo: '#161c26', tx: '#e2e8f0' },
    kindle: { nom: 'Kindle', fondo: '#f4ecd8', tx: '#3b2f1d' },
  };
  function modoGuardado() { try { const u = JSON.parse(localStorage.getItem(LS_UI) || '{}') || {}; return MODOS[u.modo] ? u.modo : 'comun'; } catch (_) { return 'comun'; } }
  function guardarModo(m) {
    try { const u = JSON.parse(localStorage.getItem(LS_UI) || '{}') || {}; u.modo = m; localStorage.setItem(LS_UI, JSON.stringify(u)); } catch (_) {}
    const L = lector(); if (L && L.sincronizarPrefs) L.sincronizarPrefs();   // viaja a tu cuenta con el resto de las preferencias
  }
  function aplicarModo(mi, m) {
    mi.xt.modo = m;
    mi.root.classList.remove('nkx-noche', 'nkx-kindle');
    if (m !== 'comun') mi.root.classList.add('nkx-' + m);
  }

  // ------------------------------------------------------------------ ventanitas ancladas a un botón
  function cerrarPop(mi) { const p = $('.nkx-pop', mi.root); if (p) p.remove(); if (mi.xt.popFin) { document.removeEventListener('pointerdown', mi.xt.popFin, true); mi.xt.popFin = null; } }
  function abrirPop(mi, btn, html) {
    cerrarPop(mi);
    const p = document.createElement('div'); p.className = 'nkx-pop'; p.innerHTML = html;
    mi.root.appendChild(p);
    const rr = mi.root.getBoundingClientRect(), br = btn.getBoundingClientRect();
    const w = p.offsetWidth;
    p.style.left = Math.max(8, Math.min(rr.width - w - 8, br.left - rr.left + br.width / 2 - w / 2)) + 'px';
    p.style.top = Math.min(rr.height - 40, br.bottom - rr.top + 8) + 'px';
    mi.xt.popFin = (e) => { if (!p.contains(e.target) && !btn.contains(e.target)) cerrarPop(mi); };
    setTimeout(() => document.addEventListener('pointerdown', mi.xt.popFin, true), 0);
    const x = p.querySelector('[data-xcerrar]'); if (x) x.onclick = () => cerrarPop(mi);
    return p;
  }

  function popModos(mi, btn) {
    const act = mi.xt.modo;
    const p = abrirPop(mi, btn, `<h5><span>🌓 Modo de lectura</span><button data-xcerrar aria-label="Cerrar">✕</button></h5>
      <div class="nkx-modos">${Object.keys(MODOS).map((k) => `<button class="nkx-modo ${k === act ? 'on' : ''}" data-m="${k}" aria-pressed="${k === act}"><i style="background:${MODOS[k].fondo};--tx:${MODOS[k].tx}"></i>${MODOS[k].nom}</button>`).join('')}</div>
      <p>Noche descansa la vista con poca luz. Kindle usa un papel color crema, más cómodo para leer mucho rato. Tus subrayados se ven en los tres.</p>`);
    p.querySelectorAll('.nkx-modo').forEach((b) => b.addEventListener('click', () => {
      aplicarModo(mi, b.dataset.m); guardarModo(b.dataset.m);
      p.querySelectorAll('.nkx-modo').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      aviso('Modo ' + MODOS[b.dataset.m].nom.toLowerCase());
    }));
  }

  // ------------------------------------------------------------------ búsqueda
  // Texto normalizado (sin tildes, en minúscula, espacios simples) con el mapa hacia las posiciones originales
  function norm(s) {
    let t = '', m = [], sp = true;
    for (let i = 0; i < s.length; i++) {
      const n = s[i].normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
      for (const c of n) {
        if (/\s/.test(c)) { if (sp) continue; t += ' '; m.push(i); sp = true; } else { t += c; m.push(i); sp = false; }
      }
    }
    return { t, m };
  }
  function hallar(t, q) { const out = []; if (!q) return out; let i = 0; while ((i = t.indexOf(q, i)) !== -1) { out.push(i); i += q.length; } return out; }

  function recomputar(mi) {
    const x = mi.xt; x.hits = []; x.porPag = {};
    if (!x.qn) { actualizarContador(mi); return; }
    for (let p = 1; p <= x.hechas; p++) {
      const n = hallar(x.txt[p] || '', x.qn).length;
      for (let k = 0; k < n && x.hits.length < 5000; k++) { x.hits.push({ p, k }); (x.porPag[p] = x.porPag[p] || []).push(k); }
    }
    if (x.cur >= x.hits.length) x.cur = x.hits.length ? 0 : -1;
    if (x.cur < 0 && x.hits.length && x.saltar) { x.cur = 0; x.saltar = false; mostrarHit(mi); }
    actualizarContador(mi);
    mi.pags.forEach((pg) => { if (pg.hecho) pintarBus(mi, pg); });
  }
  function actualizarContador(mi) {
    const x = mi.xt, c = $('.nkx-busca .c', mi.root); if (!c) return;
    if (!x.qn) { c.textContent = ''; return; }
    const prog = !x.completo ? ` · ${Math.round((x.hechas / mi.n) * 100)}%` : '';
    if (!x.hits.length) c.textContent = x.completo ? (x.chars < 20 ? 'PDF escaneado' : 'Sin resultados') : 'Buscando' + prog;
    else c.textContent = (x.cur >= 0 ? x.cur + 1 : 0) + ' de ' + x.hits.length + (x.hits.length >= 5000 ? '+' : '') + prog;
    c.title = x.completo && x.chars < 20 ? 'Este PDF es una imagen escaneada: no tiene texto para buscar.' : '';
  }

  async function indexar(mi) {
    const x = mi.xt; if (x.corriendo || x.completo) return;
    x.corriendo = true;
    for (let p = 1; p <= mi.n; p++) {
      if (estado() !== mi) { x.corriendo = false; return; }
      try {
        const pg = await mi.pdf.getPage(p), tc = await pg.getTextContent();
        let s = ''; for (const it of tc.items) { s += it.str || ''; if (it.hasEOL) s += ' '; }
        x.txt[p] = norm(s).t; x.chars += s.length; try { pg.cleanup(); } catch (_) {}
      } catch (_) { x.txt[p] = ''; }
      x.hechas = p;
      if (p % 10 === 0 || p === mi.n) { if (x.qn) recomputar(mi); else actualizarContador(mi); await dormir(0); }
    }
    x.completo = true; x.corriendo = false;
    if (x.qn) recomputar(mi);
  }

  // Dibuja los resultados de una página sobre el texto real de esa página
  function pintarBus(mi, pg) {
    const viejo = pg.el.querySelector('.nkx-bus'); if (viejo) viejo.remove();
    const x = mi.xt; if (!x || !x.qn || !x.porPag[pg.num]) return;
    const tx = pg.el.querySelector('.nk-tx'); if (!tx || !tx.firstChild) return;
    let s = '', segs = [];
    tx.childNodes.forEach((n) => {
      if (n.nodeName === 'SPAN') { const tn = n.firstChild; const len = n.textContent.length; if (tn && tn.nodeType === 3) segs.push({ tn, a: s.length, b: s.length + len }); s += n.textContent; }
      else if (n.nodeName === 'BR') s += ' ';
    });
    const N = norm(s), pos = hallar(N.t, x.qn); if (!pos.length) return;
    const capa = document.createElement('div'); capa.className = 'nkx-bus'; capa.setAttribute('aria-hidden', 'true');
    const pr = pg.el.getBoundingClientRect(); if (!pr.width || !pr.height) return;
    const actual = x.cur >= 0 ? x.hits[x.cur] : null;
    pos.forEach((a, k) => {
      const o0 = N.m[a], o1 = N.m[a + x.qn.length - 1] + 1, rg = document.createRange();
      segs.forEach((sg) => {
        if (sg.b <= o0 || sg.a >= o1) return;
        try {
          rg.setStart(sg.tn, Math.max(o0, sg.a) - sg.a); rg.setEnd(sg.tn, Math.min(o1, sg.b) - sg.a);
          Array.from(rg.getClientRects()).forEach((r) => {
            if (r.width < 1 || r.height < 1) return;
            const i = document.createElement('i'); i.dataset.k = k;
            if (actual && actual.p === pg.num && actual.k === k) i.className = 'act';
            i.style.cssText = `left:${((r.left - pr.left) / pr.width) * 100}%;top:${((r.top - pr.top) / pr.height) * 100}%;width:${(r.width / pr.width) * 100}%;height:${(r.height / pr.height) * 100}%`;
            capa.appendChild(i);
          });
        } catch (_) {}
      });
    });
    pg.el.appendChild(capa);
  }

  async function mostrarHit(mi) {
    const x = mi.xt, h = x.hits[x.cur]; if (!h) return;
    actualizarContador(mi);
    const pg = mi.pags[h.p - 1];
    if (!pg.hecho) lector().irA(h.p, false);
    else mi.pags.forEach((q) => { if (q.hecho) pintarBus(mi, q); });
    for (let i = 0; i < 40; i++) {
      const el = pg.el.querySelector('.nkx-bus i.act');
      if (el) {
        const sr = mi.scroll.getBoundingClientRect(), er = el.getBoundingClientRect();
        mi.scroll.scrollTo({ top: mi.scroll.scrollTop + (er.top - sr.top) - sr.height / 2, left: mi.scroll.scrollLeft + (er.left - sr.left) - sr.width / 2, behavior: 'smooth' });
        return;
      }
      if (x.cur < 0 || x.hits[x.cur] !== h) return;
      await dormir(100);
    }
  }
  function saltar(mi, d) {
    const x = mi.xt; if (!x.hits.length) return;
    x.cur = (x.cur + d + x.hits.length) % x.hits.length; mostrarHit(mi);
  }
  function consultar(mi, q) {
    const x = mi.xt, qn = norm(q).t;
    if (qn === x.qn) return;
    x.qn = qn; x.cur = -1; x.saltar = true;
    if (qn && !x.completo) indexar(mi);
    recomputar(mi);
    if (!qn) mi.pags.forEach((pg) => { const b = pg.el.querySelector('.nkx-bus'); if (b) b.remove(); });
  }
  function abrirBusqueda(mi) {
    const b = $('.nkx-busca', mi.root); if (!b) return;
    if (window.innerWidth <= 640 && mi.xt.lado === 'on') estadoLado(mi, 'oculto');   // en el celular no entran las dos cosas a la vez
    b.classList.add('on');
    const inp = $('input', b);
    const sel = (window.getSelection && String(window.getSelection()) || '').trim();
    if (sel && sel.length <= 60 && !/\n/.test(sel)) { inp.value = sel; consultar(mi, sel); }
    inp.focus(); inp.select();
    if (!mi.xt.completo) indexar(mi);
  }
  function cerrarBusqueda(mi) {
    const b = $('.nkx-busca', mi.root); if (b) b.classList.remove('on');
    consultar(mi, ''); const inp = b && $('input', b); if (inp) inp.value = '';
  }

  // ------------------------------------------------------------------ panel de páginas e índice
  async function paginaDeDestino(mi, dest) {
    try {
      let d = dest; if (typeof d === 'string') d = await mi.pdf.getDestination(d);
      if (!Array.isArray(d)) return null;
      const ref = d[0];
      if (ref && typeof ref === 'object') return (await mi.pdf.getPageIndex(ref)) + 1;
      if (Number.isInteger(ref)) return ref + 1;
    } catch (_) {}
    return null;
  }
  function arbol(mi, items, nivel, expandir) {
    const cont = document.createElement('div');
    items.forEach((it) => {
      const fila = document.createElement('div'); fila.className = 'nkx-it'; fila.style.paddingLeft = (nivel * 12) + 'px';
      const tg = document.createElement('button'); tg.className = 'tg'; tg.type = 'button';
      const ti = document.createElement('button'); ti.className = 'ti'; ti.type = 'button'; ti.textContent = it.title || '(sin título)'; if (it.bold) ti.style.fontWeight = '800';
      ti.addEventListener('click', async () => { const p = await paginaDeDestino(mi, it.dest); if (p) lector().irA(p, true); else aviso('No se pudo ubicar esa sección'); });
      fila.append(tg, ti); cont.appendChild(fila);
      if (it.items && it.items.length) {
        const sub = arbol(mi, it.items, nivel + 1, expandir); sub.hidden = !expandir; tg.textContent = expandir ? '▾' : '▸';
        tg.addEventListener('click', () => { sub.hidden = !sub.hidden; tg.textContent = sub.hidden ? '▸' : '▾'; });
        cont.appendChild(sub);
      } else tg.style.visibility = 'hidden';
    });
    return cont;
  }
  const contar = (a) => a.reduce((n, i) => n + 1 + (i.items ? contar(i.items) : 0), 0);

  async function pintarIndice(mi, cuerpo) {
    cuerpo.innerHTML = '<div class="nkx-vacio">Leyendo el índice…</div>';
    let out = null; try { out = await mi.pdf.getOutline(); } catch (_) {}
    if (estado() !== mi) return;
    if (!out || !out.length) { cuerpo.innerHTML = '<div class="nkx-vacio">Este PDF no trae un índice propio. Usá las <b>miniaturas</b> o la búsqueda <b>(Ctrl+F)</b> para moverte.</div>'; return; }
    cuerpo.innerHTML = ''; cuerpo.appendChild(arbol(mi, out, 0, contar(out) <= 40));
  }

  let colaMini = Promise.resolve();
  function renderMini(mi, el) {
    const p = +el.dataset.p; if (el.dataset.hecho) return; el.dataset.hecho = '1';
    colaMini = colaMini.then(async () => {
      if (estado() !== mi) return;
      try {
        const page = await mi.pdf.getPage(p), v1 = page.getViewport({ scale: 1 });
        const dpr = Math.min(2, window.devicePixelRatio || 1), vp = page.getViewport({ scale: (128 * dpr) / v1.width });
        const cv = el.querySelector('canvas'); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        el.style.aspectRatio = v1.width + ' / ' + v1.height;
        await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; try { page.cleanup(); } catch (_) {}
      } catch (_) { el.dataset.hecho = ''; }
      await dormir(25);
    });
  }
  function pintarMiniaturas(mi, cuerpo) {
    cuerpo.innerHTML = '';
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) renderMini(mi, e.target); }), { root: cuerpo, rootMargin: '300px 0px' });
    for (let p = 1; p <= mi.n; p++) {
      const el = document.createElement('div'); el.className = 'nkx-mini'; el.dataset.p = p; el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', 'Ir a la página ' + p);
      el.style.aspectRatio = mi.base.w + ' / ' + mi.base.h;
      el.innerHTML = '<canvas></canvas><i class="ok" title="Leída"></i><i class="mk" title="Tiene marcas"></i><span>' + p + '</span>';
      const ir = () => lector().irA(p, true);
      el.addEventListener('click', ir); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } });
      cuerpo.appendChild(el); io.observe(el);
    }
    mi.xt.ioMini = io; sincronizarMini(mi);
  }
  function sincronizarMini(mi) {
    const x = mi.xt, c = $('.nkx-cuerpo', mi.root); if (!c || x.tab !== 'mini') return;
    const marcadas = new Set(); mi.marcas.forEach((m) => marcadas.add(m.pagina)); (mi.anots || []).forEach((a) => marcadas.add(+a.posicion));
    c.querySelectorAll('.nkx-mini').forEach((el) => {
      const p = +el.dataset.p;
      el.classList.toggle('leida', mi.leidas.has(p)); el.classList.toggle('marcas', marcadas.has(p));
      const act = p === mi.actual; if (el.classList.contains('act') !== act) { el.classList.toggle('act', act); if (act && x.lado === 'on') el.scrollIntoView({ block: 'nearest' }); }
    });
  }

  function estadoLado(mi, e) {   // 'oculto' | 'on' | 'min'
    const x = mi.xt, lado = $('.nkx-lado', mi.root); if (!lado) return;
    x.lado = e === 'oculto' ? 'oculto' : e;
    lado.classList.toggle('on', e !== 'oculto'); lado.classList.toggle('min', e === 'min');
    mi.root.classList.toggle('nkx-lado-on', e !== 'oculto');
    const b = $('[data-xacc="paginas"]', mi.root); if (b) b.classList.toggle('on', e === 'on');
    if (e === 'on') { if (window.innerWidth <= 640) { const bs = $('.nkx-busca', mi.root); if (bs && bs.classList.contains('on')) cerrarBusqueda(mi); } cambiarTab(mi, x.tab, false); }
  }
  function cambiarTab(mi, t, forzar) {
    const x = mi.xt, cuerpo = $('.nkx-cuerpo', mi.root); if (!cuerpo) return;
    if (!forzar && x.tab === t && cuerpo.childNodes.length) return;
    x.tab = t; try { localStorage.setItem(LS_TAB, t); } catch (_) {}
    mi.root.querySelectorAll('.nkx-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    if (x.ioMini) { try { x.ioMini.disconnect(); } catch (_) {} x.ioMini = null; }
    if (t === 'indice') pintarIndice(mi, cuerpo); else pintarMiniaturas(mi, cuerpo);
  }

  // ------------------------------------------------------------------ guardar sin conexión y exportar
  async function cargarScript(src, listo) {
    if (listo()) return true;
    await new Promise((ok) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
    return listo();
  }
  async function popOffline(mi, btn) {
    const ok = await cargarScript('js/estudio/pdfOffline.js?v=5', () => !!window.NikaPdfOffline);
    if (!ok) { aviso('No se pudo cargar la descarga sin conexión'); return; }
    const OFF = window.NikaPdfOffline, est = await OFF.estado(mi.fileId), todos = await OFF.lista();
    const totalB = todos.reduce((a, d) => a + d.size, 0);
    const p = abrirPop(mi, btn, `<h5><span>💾 Leer sin conexión</span><button data-xcerrar aria-label="Cerrar">✕</button></h5>
      ${est ? `<p style="color:#e2e8f0"><span class="nkx-chip">✓ Guardado</span> Este PDF está en tu dispositivo (${OFF.fmt(est.size)}) y se abre aunque no haya señal.</p><button class="nkx-btn sec" data-x="quitar">🗑️ Quitar de este dispositivo</button>`
          : `<p style="color:#e2e8f0">Guardá este PDF en tu dispositivo para leerlo sin conexión. Se baja de Drive una sola vez y <b>no se sube a ningún lado</b>.</p><button class="nkx-btn" data-x="guardar">⬇ Guardar este PDF</button>`}
      <button class="nkx-btn sec" data-x="guardia">📚 Descargar por unidad o materia…</button>
      <p>${todos.length ? todos.length + ' PDF' + (todos.length === 1 ? '' : 's') + ' guardado' + (todos.length === 1 ? '' : 's') + ' · ' + OFF.fmt(totalB) : 'Todavía no guardaste PDFs en este dispositivo.'}</p>`);
    const q = (s) => p.querySelector(s);
    if (q('[data-x=guardar]')) q('[data-x=guardar]').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = 'Guardando…';
      try {
        const bytes = await mi.pdf.getData(); const md = await OFF.metaDrive(mi.fileId, 4000);
        await OFF.guardarBuffer(mi.fileId, mi.title, bytes, md || undefined); OFF.asegurarLibs();
        aviso('Guardado para leer sin conexión ✓'); cerrarPop(mi);
      } catch (err) { e.target.disabled = false; e.target.textContent = '⬇ Guardar este PDF'; aviso((err && err.message) || 'No se pudo guardar'); }
    };
    if (q('[data-x=quitar]')) q('[data-x=quitar]').onclick = async () => { await OFF.quitar(mi.fileId); aviso('Quitado de este dispositivo'); cerrarPop(mi); };
    q('[data-x=guardia]').onclick = async () => {
      cerrarPop(mi);
      if (document.fullscreenElement || document.querySelector('.nkpdf-fsfix')) { try { lector().pantalla(); } catch (_) {} await dormir(250); }
      if (!window.OfflineStorage) await cargarScript('js/offlineStorage.js', () => !!window.OfflineStorage);
      if (!window.GuardiaModal) await cargarScript('js/guardiaModal.js?v=15', () => !!window.GuardiaModal);
      if (window.GuardiaModal) window.GuardiaModal.abrir({ grupo: 'pdf' }); else aviso('No se pudo abrir el Modo Sin conexión');
    };
  }
  async function exportar(mi) {
    const ok = await cargarScript('js/estudio/pdfExportar.js?v=1', () => !!window.NikaPdfExport);
    if (ok) window.NikaPdfExport.abrir(mi); else aviso('No se pudo cargar la exportación');
  }

  // ------------------------------------------------------------------ montaje en el lector
  function montar(mi) {
    css();
    mi.xt = { modo: 'comun', txt: [], hechas: 0, chars: 0, completo: false, corriendo: false, qn: '', hits: [], porPag: {}, cur: -1, lado: 'oculto', tab: 'mini', saltar: false };
    try { const t = localStorage.getItem(LS_TAB); if (t === 'indice' || t === 'mini') mi.xt.tab = t; } catch (_) {}
    const root = mi.root;

    // botones en la barra
    const g = document.createElement('div'); g.className = 'nkpdf-grupo nkx-grupo'; g.setAttribute('role', 'toolbar'); g.setAttribute('aria-label', 'Ver y exportar');
    g.innerHTML = `<button data-xacc="buscar" title="Buscar en el PDF (Ctrl+F)">🔍<span class="nkpdf-txt">Buscar</span></button>
      <button data-xacc="paginas" title="Índice y miniaturas de las páginas">🗂<span class="nkpdf-txt">Páginas</span></button>
      <button data-xacc="modo" title="Modo de lectura: común, noche o Kindle" aria-haspopup="true">🌓<span class="nkpdf-txt">Lectura</span></button>
      <button data-xacc="offline" title="Leer sin conexión" aria-haspopup="true">💾<span class="nkpdf-txt">Sin conexión</span></button>
      <button data-xacc="exportar" title="Exportar el PDF con tus marcas y notas">📤<span class="nkpdf-txt">Exportar</span></button>`;
    const sep = $('.nkpdf-sep', root); if (sep) sep.parentNode.insertBefore(g, sep); else $('.nkpdf-bar', root).appendChild(g);

    // búsqueda, panel lateral y pestañita
    const cuerpo = $('.nkpdf-cuerpo', root);
    const bus = document.createElement('div'); bus.className = 'nkx-busca'; bus.setAttribute('role', 'search');
    bus.innerHTML = `<input type="search" placeholder="Buscar en el PDF…" aria-label="Buscar en el PDF" autocomplete="off"><span class="c" aria-live="polite"></span><button type="button" data-b="ant" title="Anterior (Mayús+Enter)" aria-label="Resultado anterior">▲</button><button type="button" data-b="sig" title="Siguiente (Enter)" aria-label="Resultado siguiente">▼</button><button type="button" data-b="x" title="Cerrar (Esc)" aria-label="Cerrar la búsqueda">✕</button>`;
    cuerpo.appendChild(bus);
    const lado = document.createElement('aside'); lado.className = 'nkx-lado'; lado.setAttribute('aria-label', 'Índice y miniaturas');
    lado.innerHTML = `<div class="nkx-cab"><div class="nkx-tabs" role="tablist"><button data-t="mini" role="tab">Miniaturas</button><button data-t="indice" role="tab">Índice</button></div>
        <button class="nkx-bmin" data-l="min" title="Minimizar" aria-label="Minimizar el panel">–</button><button class="nkx-bx" data-l="oculto" title="Ocultar el panel" aria-label="Ocultar el panel">✕</button><button class="nkx-bexp" data-l="on" title="Abrir el panel" aria-label="Abrir el panel">▸</button></div>
      <div class="nkx-cuerpo"></div><div class="nkx-rail" data-l="on" title="Abrir el panel">🗂<span>Páginas</span></div>`;
    cuerpo.appendChild(lado);
    const asa = document.createElement('button'); asa.type = 'button'; asa.className = 'nkx-asa'; asa.textContent = '›'; asa.title = 'Mostrar índice y miniaturas'; asa.setAttribute('aria-label', 'Mostrar índice y miniaturas');
    cuerpo.appendChild(asa);

    // eventos
    g.addEventListener('click', (e) => {
      const b = e.target.closest('[data-xacc]'); if (!b || estado() !== mi) return;
      const a = b.dataset.xacc;
      if (a === 'buscar') { const on = $('.nkx-busca', root).classList.contains('on'); if (on) cerrarBusqueda(mi); else abrirBusqueda(mi); }
      else if (a === 'paginas') estadoLado(mi, mi.xt.lado === 'on' ? 'oculto' : 'on');
      else if (a === 'modo') { if ($('.nkx-pop', root)) cerrarPop(mi); else popModos(mi, b); }
      else if (a === 'offline') { if ($('.nkx-pop', root)) cerrarPop(mi); else popOffline(mi, b); }
      else if (a === 'exportar') exportar(mi);
    });
    asa.addEventListener('click', () => estadoLado(mi, 'on'));
    lado.addEventListener('click', (e) => {
      const t = e.target.closest('[data-t]'); if (t) { cambiarTab(mi, t.dataset.t, true); return; }
      const l = e.target.closest('[data-l]'); if (l) estadoLado(mi, l.dataset.l);
    });
    const inp = $('input', bus);
    let tb = null;
    inp.addEventListener('input', () => { clearTimeout(tb); tb = setTimeout(() => { consultar(mi, inp.value); if (!mi.xt.completo) indexar(mi); }, 220); });
    inp.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(tb); consultar(mi, inp.value); saltar(mi, e.shiftKey ? -1 : 1); }
      else if (e.key === 'Escape') { e.preventDefault(); cerrarBusqueda(mi); }
    });
    bus.addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; if (b.dataset.b === 'ant') saltar(mi, -1); else if (b.dataset.b === 'sig') saltar(mi, 1); else cerrarBusqueda(mi); });

    // Ctrl+F abre la búsqueda del lector (en vez de la del navegador, que no ve el texto de las páginas)
    mi.xt.teclas = (e) => {
      if (estado() !== mi) return;
      if (!((e.ctrlKey || e.metaKey) && !e.altKey && String(e.key).toLowerCase() === 'f')) return;
      if (!document.body.contains(root) || !root.getClientRects().length) return;
      e.preventDefault(); abrirBusqueda(mi);
    };
    document.addEventListener('keydown', mi.xt.teclas, true);

    // al cambiar de página se actualizan las miniaturas (marca de la actual, leídas y con marcas)
    mi.xt.reloj = setInterval(() => { if (estado() !== mi) return; if (mi.xt.lado !== 'oculto') sincronizarMini(mi); const r = $('.nkx-rail span', root); if (r) r.textContent = 'Pág. ' + mi.actual; }, 700);

    aplicarModo(mi, modoGuardado());
  }

  function alRenderizar(mi, pg) { if (mi && mi.xt && mi.xt.qn) pintarBus(mi, pg); }
  function cerrar(mi) {
    if (!mi || !mi.xt) return;
    clearInterval(mi.xt.reloj); document.removeEventListener('keydown', mi.xt.teclas, true);
    if (mi.xt.ioMini) { try { mi.xt.ioMini.disconnect(); } catch (_) {} }
    if (mi.xt.popFin) document.removeEventListener('pointerdown', mi.xt.popFin, true);
    mi.xt.txt = []; mi.xt = null;
  }

  window.NikaPdfX = { montar, alRenderizar, cerrar, MODOS };
})();
