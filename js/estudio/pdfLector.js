/* NikaPdf — lector de PDFs de Drive dentro de NikaMed, con subrayado y progreso de lectura por usuario.
   - El PDF se descarga desde la API de Drive (clave restringida a nikamed.com.ar) y se dibuja con pdf.js: no se sube nada a NikaMed.
   - Subrayados y progreso se guardan en Supabase (sql/pdf_lector.sql) con RLS: cada usuario ve solo lo suyo. Sin sesión, quedan en el navegador.
   - Si el archivo no se puede abrir así (descarga bloqueada, no es PDF, sin conexión), se vuelve al visor de Drive de siempre.
   Herramientas: Seleccionar (V) · Subrayar (H) · Borrar (E) · colores 1-4 · panel de subrayados · pantalla completa.
   Uso: NikaPdf.abrir({ wrapper, fileId, title, fallback }) / NikaPdf.reabrir() / NikaPdf.cerrar() / NikaPdf.pantalla() */
(function () {
  'use strict';
  const API_KEY = 'AIzaSyB0MSmTC-gBB7hiw-MUqst1-m1iN8e-eDQ';   // clave pública de Drive, restringida por dominio (https://nikamed.com.ar/*)
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const COLORES = { amarillo: '#fde047', verde: '#86efac', rosa: '#f9a8d4', azul: '#93c5fd' };
  const NOMBRES = { amarillo: 'Amarillo', verde: 'Verde', rosa: 'Rosa', azul: 'Azul' };
  const ESCALAS = [0.6, 0.8, 1, 1.25, 1.5, 1.8, 2.2, 2.6];
  const ICO = {
    sel: '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.5L10 19z"/></svg>',
    sub: '<svg viewBox="0 0 24 24"><path d="M4 20h7M14.5 4.5l5 5L9 20l-5 .5.5-5z"/><path d="M13 6l5 5"/></svg>',
    bor: '<svg viewBox="0 0 24 24"><path d="M3 17l8-12 9 6-7 10H7z"/><path d="M9 21h11"/></svg>',
    lista: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    fs: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    fsx: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    pincel: '<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9.5 9.5H4.5v-6z"/><path d="M12.5 5.5l6 6"/><path d="M4 21h4"/></svg>',
    area: '<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2" stroke-dasharray="3 2"/><path d="M8 14h8"/></svg>',
    drive: '<svg viewBox="0 0 24 24"><path d="M8 3h8l6 10-4 7H6l-4-7z"/></svg>',
    ajustar: '<svg viewBox="0 0 24 24"><path d="M4 12h16M7 8l-3 4 3 4M17 8l3 4-3 4"/></svg>',
  };

  let S = null;           // sesión de lectura actual
  let ultimoOp = null;    // últimos argumentos de abrir() (para reabrir)
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
.nkpdf{position:absolute;inset:0;display:flex;flex-direction:column;background:#e2e8f0;font-family:inherit;overflow:hidden}
.nkpdf-bar svg,.nkpdf-panel svg,.nkpdf-toast svg,.nkpdf-pop svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.nkpdf-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;color:#e2e8f0;font-size:.78rem;font-weight:700;
  background:linear-gradient(120deg,#0b1535,#1e1b4b 55%,#2e1065);border-bottom:1px solid rgba(168,85,247,.45);box-shadow:0 6px 18px rgba(15,23,42,.35);position:relative;z-index:5}
.nkpdf-grupo{display:flex;align-items:center;gap:3px;padding:3px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.nkpdf-bar button{display:inline-flex;align-items:center;gap:6px;background:transparent;border:0;color:#cbd5e1;border-radius:9px;padding:6px 10px;font:inherit;cursor:pointer;transition:background .18s,transform .18s,color .18s,box-shadow .18s;position:relative}
.nkpdf-bar button:hover{background:rgba(255,255,255,.14);color:#fff;transform:translateY(-1px)}
.nkpdf-bar button:active{transform:translateY(0) scale(.96)}
.nkpdf-bar button.on{color:#fff;background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1);box-shadow:0 4px 14px rgba(168,85,247,.55)}
.nkpdf-bar button.on svg{animation:nkpdfPop .35s ease}
@keyframes nkpdfPop{0%{transform:scale(.7) rotate(-12deg)}60%{transform:scale(1.2) rotate(6deg)}100%{transform:none}}
.nkpdf-col{width:22px;height:22px;padding:0!important;border-radius:50%!important;border:2px solid rgba(255,255,255,.35)!important;transition:transform .18s,border-color .18s!important}
.nkpdf-col:hover{transform:scale(1.18)!important}
.nkpdf-col.on{border-color:#fff!important;box-shadow:0 0 0 3px rgba(255,255,255,.28)!important;transform:scale(1.12)}
.nkpdf-bar input{width:46px;text-align:center;border-radius:7px;border:0;padding:5px;font:inherit;font-weight:800;color:#0f172a}
.nkpdf-pagtxt{display:flex;align-items:center;gap:5px;padding:0 6px}
.nkpdf-zoom{min-width:44px;text-align:center}
.nkpdf-prog{display:flex;align-items:center;gap:8px;min-width:130px}
.nkpdf-prog i{display:block;height:7px;flex:1;min-width:60px;border-radius:7px;background:rgba(255,255,255,.16);overflow:hidden}
.nkpdf-prog i b{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a855f7);transition:width .5s;box-shadow:0 0 10px rgba(168,85,247,.8)}
.nkpdf-sep{flex:1}
.nkpdf-cnt{background:#a855f7;color:#fff;border-radius:999px;font-size:.66rem;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}
.nkpdf-hint{width:100%;font-weight:600;font-size:.72rem;color:#c4b5fd;opacity:.95;display:flex;align-items:center;gap:6px}
.nkpdf-cuerpo{flex:1;position:relative;min-height:0;display:flex}
.nkpdf-scroll{flex:1;overflow:auto;padding:14px 0;-webkit-overflow-scrolling:touch}
.nkpdf.m-sub .nkpdf-scroll{cursor:text}
.nkpdf.m-area .nkpdf-scroll{cursor:crosshair;touch-action:none}
.nkpdf.m-pincel .nkpdf-scroll,.nkpdf.m-bor .nkpdf-scroll{cursor:none;touch-action:none}
.nkpdf.m-pincel .nk-tx,.nkpdf.m-bor .nk-tx{user-select:none;-webkit-user-select:none}
.nk-hl svg,.nk-live{position:absolute;left:0;top:0;pointer-events:none;mix-blend-mode:multiply;opacity:.55}
.nkpdf-aro{position:absolute;z-index:8;pointer-events:none;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px rgba(15,23,42,.65),inset 0 0 0 1px rgba(15,23,42,.25);transform:translate(-50%,-50%);display:none}
.nkpdf-tam{display:none;align-items:center;gap:8px;padding:3px 10px}
.nkpdf.m-pincel .nkpdf-tam,.nkpdf.m-bor .nkpdf-tam{display:flex}
.nkpdf-tam input[type=range]{width:96px;accent-color:#a855f7;padding:0;height:4px}
.nkpdf-tam b{min-width:30px;font-size:.72rem;color:#c4b5fd}
.nkpdf-item .cp{margin-right:4px}
.nkpdf.m-area .nk-tx{user-select:none;-webkit-user-select:none}
.nkpdf-rect{position:absolute;pointer-events:none;border:2px dashed rgba(15,23,42,.55);border-radius:3px;z-index:3}
.nkpdf-volver{position:absolute;left:12px;bottom:12px;z-index:30;display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:0;border-radius:999px;font:inherit;font-weight:800;font-size:.82rem;color:#fff;cursor:pointer;background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1);box-shadow:0 8px 22px rgba(168,85,247,.55);animation:nkpdfIn .3s ease both;transition:transform .18s,box-shadow .18s}
.nkpdf-volver:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(168,85,247,.7)}
.nkpdf.m-bor .nk-tx{user-select:none;-webkit-user-select:none}
.nkpdf.m-bor .nkpdf-scroll{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 24 24' fill='%23fecaca' stroke='%23991b1b' stroke-width='1.8' stroke-linejoin='round'%3E%3Cpath d='M3 17l8-12 9 6-7 10H7z'/%3E%3C/svg%3E") 4 22,pointer}
.nk-pg{position:relative;margin:0 auto 14px;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,.25);border-radius:3px}
.nk-pg canvas{display:block;width:100%;height:100%;border-radius:3px}
.nk-hl{position:absolute;inset:0;pointer-events:none}
.nk-hl i{position:absolute;mix-blend-mode:multiply;border-radius:2px;opacity:.62;animation:nkpdfHl .35s ease both;transform-origin:left center}
@keyframes nkpdfHl{from{opacity:0;transform:scaleX(.2)}to{opacity:.62;transform:none}}
.nk-tx{position:absolute;inset:0;overflow:hidden;line-height:1}
.nk-tx span{position:absolute;white-space:pre;color:transparent;cursor:inherit;transform-origin:0 0}
.nk-tx ::selection{background:rgba(59,130,246,.35)}
.nk-pg .nk-leida{position:absolute;top:8px;right:8px;background:#16a34a;color:#fff;font-size:.7rem;font-weight:800;border-radius:999px;padding:2px 9px;opacity:.9;pointer-events:none;animation:nkpdfPop .4s ease}
.nk-pg .nk-num{position:absolute;bottom:6px;right:10px;font-size:.66rem;color:#94a3b8;pointer-events:none}
.nkpdf-pop{position:fixed;z-index:2147483600;display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:12px;background:#0f172a;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:nkpdfIn .15s ease both}
@keyframes nkpdfIn{from{opacity:0;transform:translateY(4px) scale(.96)}to{opacity:1;transform:none}}
.nkpdf-pop .c{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.7);cursor:pointer;transition:transform .15s}
.nkpdf-pop .c:hover{transform:scale(1.2)}
.nkpdf-pop .x{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:8px;padding:4px 9px;font:inherit;font-size:.74rem;font-weight:700;cursor:pointer}
.nkpdf-pop .x:hover{background:#dc2626}
.nkpdf-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#334155;font-weight:700;background:#f1f5f9;z-index:6}
.nkpdf-msg .sp{width:34px;height:34px;border:4px solid #cbd5e1;border-top-color:#7c3aed;border-radius:50%;animation:nkpdfSp .8s linear infinite}
@keyframes nkpdfSp{to{transform:rotate(360deg)}}
.nkpdf-toast{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:7;display:flex;gap:10px;align-items:center;padding:9px 14px;border-radius:12px;background:#0f172a;color:#fff;font-size:.8rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:nkpdfIn .3s ease both;max-width:92%}
.nkpdf-toast button{background:linear-gradient(135deg,#7e22ce,#a855f7);border:0;color:#fff;border-radius:8px;padding:5px 11px;font:inherit;cursor:pointer}
.nkpdf-toast .z{background:transparent;color:#94a3b8;padding:5px 6px}
.nkpdf-panel{position:absolute;top:0;right:0;bottom:0;width:min(320px,86%);z-index:6;display:flex;flex-direction:column;background:#0f172a;color:#e2e8f0;box-shadow:-12px 0 30px rgba(0,0,0,.4);transform:translateX(105%);transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.nkpdf-panel.on{transform:none}
.nkpdf-panel h4{margin:0;padding:12px 14px;font-size:.85rem;font-weight:800;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center}
.nkpdf-panel h4 button{background:none;border:0;color:#94a3b8;font-size:1.1rem;cursor:pointer}
.nkpdf-bar button:disabled{opacity:.35;cursor:default}.nkpdf-aviso{position:absolute;left:50%;bottom:18px;transform:translateX(-50%) translateY(10px);background:rgba(15,23,42,.92);color:#fff;padding:7px 14px;border-radius:999px;font-size:.78rem;font-weight:700;opacity:0;pointer-events:none;transition:.2s;z-index:30}.nkpdf-aviso.on{opacity:1;transform:translateX(-50%)}
.nkpdf-atajos{position:absolute;inset:0;background:rgba(2,6,23,.55);display:flex;align-items:center;justify-content:center;z-index:40}.nkpdf-atajos>div{background:#0f172a;color:#e2e8f0;border-radius:14px;padding:14px 18px;width:min(420px,92%);max-height:88%;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.5)}.nkpdf-atajos h4{display:flex;justify-content:space-between;margin:0 0 8px;font-size:.95rem}.nkpdf-atajos h4 button{background:none;border:0;color:#94a3b8;cursor:pointer}.nkpdf-atajos p{display:flex;gap:10px;align-items:center;margin:5px 0;font-size:.8rem}.nkpdf-atajos kbd{min-width:104px;text-align:center;background:#1e293b;border:1px solid #334155;border-radius:6px;padding:2px 7px;font:700 .72rem monospace;color:#c4b5fd}
.nkpdf-lista{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px}
.nkpdf-vacio{color:#94a3b8;font-size:.8rem;line-height:1.5;padding:14px 6px;text-align:center}
.nkpdf-item{border-radius:10px;padding:9px 10px;background:rgba(255,255,255,.06);border-left:4px solid var(--c);cursor:pointer;transition:background .15s,transform .15s}
.nkpdf-item:hover{background:rgba(255,255,255,.12);transform:translateX(-2px)}
.nkpdf-item small{display:flex;justify-content:space-between;align-items:center;color:#a5b4fc;font-weight:800;font-size:.68rem;margin-bottom:3px}
.nkpdf-item p{margin:0;font-size:.78rem;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.nkpdf-item button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:.9rem}
.nkpdf-item button:hover{color:#f87171}
#nika-inline-viewer-container:fullscreen{width:100vw!important;height:100vh!important;margin:0!important;border-radius:0!important;background:#fff}
#nika-inline-viewer-container:fullscreen #nika-inline-frame-wrapper{height:calc(100vh - 52px)!important;max-height:none!important}
@media (max-width:760px){.nkpdf-bar{gap:6px;padding:6px 8px}.nkpdf-txt{display:none}.nkpdf-prog{min-width:90px}.nkpdf-hint{display:none}}
@media (prefers-reduced-motion:reduce){.nkpdf *{animation:none!important;transition:none!important}.nkpdf-pop,.nkpdf-toast{animation:none!important}}`;
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
  const esTrazo = (m) => !!(m.rects && m.rects[0] && m.rects[0].t === 'p');
  function dTrazo(pts, W, H) { return pts.map((q, i) => (i ? 'L' : 'M') + (q[0] * W).toFixed(1) + ' ' + (q[1] * H).toFixed(1)).join(' ') + (pts.length === 1 ? ' l0.01 0' : ''); }
  function pintarMarcas(pg) {
    const capa = pg.el.querySelector('.nk-hl'); if (!capa) return;
    capa.innerHTML = '';
    const W = pg.el.offsetWidth || parseFloat(pg.el.style.width) || 1, H = pg.el.offsetHeight || parseFloat(pg.el.style.height) || 1;
    const trazos = [];
    S.marcas.filter((m) => m.pagina === pg.num).forEach((m) => {
      (m.rects || []).forEach((r) => {
        if (r.t === 'p') { trazos.push([m, r]); return; }
        const i = document.createElement('i');
        i.style.cssText = `left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%;background:${COLORES[m.color] || COLORES.amarillo}`;
        capa.appendChild(i);
      });
    });
    if (trazos.length) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H);
      trazos.forEach(([m, r]) => {
        const pa = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pa.setAttribute('d', dTrazo(r.p, W, H)); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', COLORES[m.color] || COLORES.amarillo);
        pa.setAttribute('stroke-width', Math.max(1, r.w * W)); pa.setAttribute('stroke-linecap', 'round'); pa.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(pa);
      });
      capa.appendChild(svg);
    }
  }
  function repintarTodas() { S.pags.forEach((pg) => { if (pg.hecho) pintarMarcas(pg); }); panel(); }

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
      pg.tarea = page.render({ canvasContext: cv.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      await pg.tarea.promise; pg.tarea = null;
      if (!S || S.tok !== tok) return;
      const tx = pg.el.querySelector('.nk-tx'); tx.innerHTML = '';
      const contenido = await page.getTextContent();
      await window.pdfjsLib.renderTextLayer({ textContentSource: contenido, container: tx, viewport: vp, textDivs: [] }).promise;
      pg.hecho = true; pintarMarcas(pg); marcarLeida(pg);
    } catch (e) { if (!(e && e.name === 'RenderingCancelledException')) console.warn('[NikaPdf] página', pg.num, e && e.message ? e.message : e); }
    pg.cargando = false;
  }
  function liberar(pg) {
    if (!pg.hecho && !pg.cargando) return;
    if (pg.tarea) { try { pg.tarea.cancel(); } catch (_) {} pg.tarea = null; }
    const cv = pg.el.querySelector('canvas'); cv.width = 1; cv.height = 1;
    pg.el.querySelector('.nk-tx').innerHTML = ''; pg.hecho = false; pg.cargando = false;
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
    const bl = $('.nkpdf-leer', S.root); if (bl) { bl.classList.toggle('on', S.leidas.has(S.actual)); $('.nkpdf-txt', bl).textContent = S.leidas.has(S.actual) ? 'Leída' : 'Marcar leída'; }
    const z = $('.nkpdf-zoom', S.root); if (z) z.textContent = Math.round(S.escala * 100) + '%';
    const c = $('.nkpdf-cnt', S.root); if (c) { c.textContent = S.marcas.length; c.style.display = S.marcas.length ? '' : 'none'; }
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
    S.pags.forEach((pg) => { if (pg.tarea) { try { pg.tarea.cancel(); } catch (_) {} pg.tarea = null; } });
    S.pags.forEach((pg) => { pg.hecho = false; pg.cargando = false; pg.el.style.width = S.base.w * S.escala + 'px'; pg.el.style.height = S.base.h * S.escala + 'px'; });
    S.pags.forEach((pg) => S.io.unobserve(pg.el)); S.pags.forEach((pg) => S.io.observe(pg.el));
    actualizarBarra();
    requestAnimationFrame(() => irA(actual));
  }
  function ajustarAncho() {
    if (!S) return;
    const ancho = Math.max(280, S.scroll.clientWidth - 28);
    S.escala = Math.max(0.6, Math.min(2.6, ancho / S.base.w)); reconstruir();
  }


  // ---------- toque sobre marcas (texto, áreas y trazos) ----------
  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function tocaMarca(m, W, H, px, py, rpx) {
    return (m.rects || []).some((r) => {
      if (r.t === 'p') {
        const half = r.w * W / 2 + rpx; const P = r.p;
        if (P.length === 1) return Math.hypot(px - P[0][0] * W, py - P[0][1] * H) <= half;
        for (let i = 1; i < P.length; i++) if (distSeg(px, py, P[i - 1][0] * W, P[i - 1][1] * H, P[i][0] * W, P[i][1] * H) <= half) return true;
        return false;
      }
      return px >= r.x * W - rpx && px <= (r.x + r.w) * W + rpx && py >= r.y * H - rpx && py <= (r.y + r.h) * H + rpx;
    });
  }
  const marcasEn = (pg, px, py, rpx) => S.marcas.filter((m) => m.pagina === pg.num && tocaMarca(m, pg.el.offsetWidth, pg.el.offsetHeight, px, py, rpx));

  // ---------- pincel (trazo libre, tamaño ajustable) y borrador de arrastre ----------
  function paginaBajo(e) { return S.pags.find((p) => p.el.contains(e.target)); }
  function iniciarTrazo(e, mi) {
    if (S !== mi || e.button) return;
    const pg = paginaBajo(e); if (!pg || !pg.hecho) return;
    const sparse = pg.el.querySelectorAll('.nk-tx span').length < 8;
    const modoPincel = S.modo === 'pincel' || (S.modo === 'sub' && sparse);
    if (S.modo === 'bor') return borrarArrastrando(e, mi, pg);
    if (!modoPincel) return;
    e.preventDefault(); cerrarPop();
    const b0 = pg.el.getBoundingClientRect(); const W = b0.width, H = b0.height;
    const norm = (ev) => [Math.min(1, Math.max(0, (ev.clientX - b0.left) / W)), Math.min(1, Math.max(0, (ev.clientY - b0.top) / H))];
    const pts = [norm(e)];
    const live = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); live.setAttribute('class', 'nk-live'); live.setAttribute('width', W); live.setAttribute('height', H);
    const pa = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', COLORES[S.color]);
    pa.setAttribute('stroke-width', S.tam); pa.setAttribute('stroke-linecap', 'round'); pa.setAttribute('stroke-linejoin', 'round'); live.appendChild(pa); pg.el.appendChild(live);
    const dibujar = () => pa.setAttribute('d', dTrazo(pts, W, H));
    dibujar();
    const mover = (ev) => {
      const q = norm(ev), u = pts[pts.length - 1];
      if (Math.hypot((q[0] - u[0]) * W, (q[1] - u[1]) * H) < 1.5) return;
      if (ev.shiftKey || S.recta) { pts.length = 1; }               // con Mayús (o el botón Línea recta): recta desde el inicio
      pts.push(q); dibujar();
    };
    const fin = async (ev) => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      live.remove(); if (S !== mi) return;
      const lim = [pts[0]]; for (let i = 1; i < pts.length; i++) { const u = lim[lim.length - 1]; if (Math.hypot((pts[i][0] - u[0]) * W, (pts[i][1] - u[1]) * H) >= 2.5 || i === pts.length - 1) lim.push(pts[i]); }
      const m = { pagina: pg.num, color: S.color, texto: 'Trazo de pincel', rects: [{ t: 'p', w: S.tam / W, p: lim.map((q) => [+q[0].toFixed(4), +q[1].toFixed(4)]) }] };
      S.marcas.push(m); reg({ t: 'add', ms: [m] }); pintarMarcas(pg); actualizarBarra(); panel(); await guardarMarca(m);
    };
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  }

  function borrarArrastrando(e, mi, pg0) {
    e.preventDefault(); cerrarPop();
    const quitadas = [];
    const pasar = (ev) => {
      const pg = S.pags.find((p) => { const b = p.el.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom; }) || pg0;
      const b = pg.el.getBoundingClientRect(); const hit = marcasEn(pg, ev.clientX - b.left, ev.clientY - b.top, S.tam / 2);
      if (!hit.length) return;
      hit.forEach((m) => { quitadas.push(m); });
      S.marcas = S.marcas.filter((m) => !hit.includes(m)); pintarMarcas(pg); actualizarBarra(); panel();
    };
    pasar(e);
    const mover = (ev) => pasar(ev);
    const fin = async () => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      if (quitadas.length) reg({ t: 'del', ms: quitadas.slice() });
      for (const m of quitadas) await borrarMarca(m);
    };
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  }

  // aro que muestra el tamaño del pincel/borrador siguiendo al cursor
  function moverAro(e) {
    if (!S) return; const aro = $('.nkpdf-aro', S.root); if (!aro) return;
    if (!(S.modo === 'pincel' || S.modo === 'bor')) { aro.style.display = 'none'; return; }
    const r = $('.nkpdf-cuerpo', S.root).getBoundingClientRect();
    if (e.clientX > r.right - 6 || e.clientX < r.left || e.clientY < r.top || e.clientY > r.bottom) { aro.style.display = 'none'; return; }
    aro.style.display = 'block'; aro.style.width = aro.style.height = S.tam + 'px';
    aro.style.left = (e.clientX - r.left) + 'px'; aro.style.top = (e.clientY - r.top) + 'px';
    aro.style.background = S.modo === 'pincel' ? COLORES[S.color] + '66' : 'rgba(248,113,113,.25)';
  }

  // ---------- pasar al visor de Drive y volver ----------
  function quitarVolver() { document.querySelectorAll('.nkpdf-volver').forEach((b) => b.remove()); }
  function mostrarVolver(wrapper) {
    quitarVolver();
    const toggle = document.getElementById('nika-modo-visor'); if (toggle && toggle.style.display !== 'none' && toggle.children.length) return;   // ya hay selector en el encabezado
    const b = document.createElement('button'); b.type = 'button'; b.className = 'nkpdf-volver'; b.innerHTML = '📖 Abrir con el lector NikaMed';
    b.addEventListener('click', () => { b.remove(); if (ultimoOp) abrir(ultimoOp); });
    wrapper.appendChild(b);
  }
  function aDrive() {
    const mi = S; if (!mi) return; const f = mi.fallback, w = mi.wrapper; const ifr = $('iframe', w);
    cerrar(); if (ifr) ifr.style.display = '';
    if (f) f('manual');
    mostrarVolver(w);
  }

  // ---------- subrayar / borrar ----------
  function cerrarPop() { const p = $('.nkpdf-pop'); if (p) p.remove(); }
  function popover(x, y, html, alClick) {
    cerrarPop();
    const p = document.createElement('div'); p.className = 'nkpdf-pop'; p.innerHTML = html;
    p.style.left = Math.max(8, Math.min(window.innerWidth - 230, x - 100)) + 'px'; p.style.top = Math.max(8, y) + 'px';
    p.addEventListener('mousedown', (e) => e.preventDefault());
    p.addEventListener('click', (e) => { const t = e.target.closest('[data-c],[data-x]'); if (t) alClick(t); });
    (document.fullscreenElement || document.body).appendChild(p);
  }

  function recolectar() {
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const rango = sel.getRangeAt(0);
    if (!S.scroll.contains(rango.commonAncestorContainer)) return null;
    const texto = sel.toString().replace(/\s+/g, ' ').trim(); if (!texto) return null;
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
    return porPagina.size ? { sel, rango, texto, porPagina } : null;
  }

  async function aplicarSubrayado(d, color) {
    const nuevas = [];
    d.porPagina.forEach((rects, num) => { nuevas.push({ pagina: num, color, texto: d.texto.slice(0, 600), rects }); });
    cerrarPop(); d.sel.removeAllRanges();
    if (nuevas.length) reg({ t: 'add', ms: nuevas });
    for (const m of nuevas) {
      S.marcas.push(m); const pg = S.pags[m.pagina - 1]; if (pg) pintarMarcas(pg);
      await guardarMarca(m);
    }
    actualizarBarra(); panel();
  }

  function seleccion() {
    if (!S || S.modo === 'bor' || S.modo === 'pincel') return;
    const d = recolectar(); if (!d) return;
    if (S.modo === 'sub') { aplicarSubrayado(d, S.color); return; }
    const fin = d.rango.getBoundingClientRect();
    popover(fin.left + fin.width / 2, fin.bottom + 8,
      Object.keys(COLORES).map((k) => `<span class="c" data-c="${k}" title="Subrayar ${NOMBRES[k]}" style="background:${COLORES[k]}"></span>`).join('') + '<button class="x" data-x="cancelar">✕</button>',
      (t) => { if (t.dataset.x) { cerrarPop(); return; } S.color = t.dataset.c; marcarColor(); aplicarSubrayado(d, t.dataset.c); });
  }

  // ---------- deshacer / rehacer ----------
  function botonesUndo() {
    if (!S) return;
    const u = $('[data-accion="undo"]', S.root), r = $('[data-accion="redo"]', S.root);
    if (u) u.disabled = !S.undo.length; if (r) r.disabled = !S.redo.length;
  }
  function reg(a) { S.undo.push(a); if (S.undo.length > 100) S.undo.shift(); S.redo = []; botonesUndo(); }
  async function quitarMs(ms) { S.marcas = S.marcas.filter((x) => !ms.includes(x)); repintarTodas(); actualizarBarra(); for (const m of ms) await borrarMarca(m); }
  async function ponerMs(ms) { ms.forEach((m) => { delete m.id; delete m.local; S.marcas.push(m); }); repintarTodas(); actualizarBarra(); for (const m of ms) await guardarMarca(m); }
  async function fijarColor(m, c) {
    m.color = c; repintarTodas();
    if (m.id && !m.local && S.uid) { try { await cliente().from('pdf_subrayados').update({ color: c }).eq('id', m.id); } catch (_) {} }
    else lsSet('hl', S.fileId, S.marcas.filter((x) => x.local));
  }
  async function aplicar(a, dir) {      // dir: 1 = rehacer, -1 = deshacer
    if (a.t === 'add') return dir < 0 ? quitarMs(a.ms) : ponerMs(a.ms);
    if (a.t === 'del') return dir < 0 ? ponerMs(a.ms) : quitarMs(a.ms);
    if (a.t === 'color') return fijarColor(a.m, dir < 0 ? a.de : a.a);
  }
  async function deshacer() {
    if (!S || !S.undo.length) { aviso('No hay nada para deshacer'); return; }
    const a = S.undo.pop(); S.redo.push(a); botonesUndo(); S.sel = null; await aplicar(a, -1); aviso('Deshecho');
  }
  async function rehacer() {
    if (!S || !S.redo.length) { aviso('No hay nada para rehacer'); return; }
    const a = S.redo.pop(); S.undo.push(a); botonesUndo(); S.sel = null; await aplicar(a, 1); aviso('Rehecho');
  }
  function aviso(t) {
    if (!S) return; let a = $('.nkpdf-aviso', S.root); if (!a) { a = document.createElement('div'); a.className = 'nkpdf-aviso'; S.root.appendChild(a); }
    a.textContent = t; a.classList.add('on'); clearTimeout(a._t); a._t = setTimeout(() => a.classList.remove('on'), 1400);
  }
  const ATAJOS = [['V', 'Seleccionar'], ['H', 'Subrayar'], ['P / A', 'Pincel'], ['E', 'Borrador'], ['1 – 4', 'Color del subrayado'], ['[  ]', 'Tamaño del pincel y borrador'],
    ['Mayús (al trazar)', 'Línea recta desde donde empezás'], ['Ctrl + Z', 'Deshacer'], ['Ctrl + Y', 'Rehacer'], ['Supr', 'Borrar la marca seleccionada (tocala antes)'],
    ['Esc', 'Cerrar menú / deseleccionar'], ['+  −', 'Acercar / alejar'], ['F', 'Pantalla completa'], ['?', 'Ver esta ayuda']];
  function atajos() {
    if (!S) return; const ya = $('.nkpdf-atajos', S.root); if (ya) { ya.remove(); return; }
    const d = document.createElement('div'); d.className = 'nkpdf-atajos';
    d.innerHTML = '<div><h4><span>⌨ Atajos de teclado</span><button aria-label="Cerrar">✕</button></h4>' + ATAJOS.map((a) => `<p><kbd>${esc(a[0])}</kbd><span>${esc(a[1])}</span></p>`).join('') + '</div>';
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('button')) d.remove(); });
    S.root.appendChild(d);
  }
  async function eliminar(m) {
    reg({ t: 'del', ms: [m] }); if (S.sel === m) S.sel = null;
    S.marcas = S.marcas.filter((x) => x !== m); repintarTodas(); actualizarBarra(); await borrarMarca(m);
  }

  function clickEnMarca(e) {
    if (!S || !window.getSelection().isCollapsed) return;
    if (S.modo === 'bor' || S.modo === 'pincel') return;
    const pg = paginaBajo(e); if (!pg) { cerrarPop(); return; }
    const b = pg.el.getBoundingClientRect();
    const hit = marcasEn(pg, e.clientX - b.left, e.clientY - b.top, 3); const m = hit[hit.length - 1];
    if (!m) { cerrarPop(); return; }
    S.sel = m;
    if (S.modo === 'sub') return;
    const conTexto = m.texto && !esTrazo(m) && !m.area;
    popover(e.clientX, e.clientY + 10,
      Object.keys(COLORES).map((k) => `<span class="c" data-c="${k}" title="Cambiar a ${NOMBRES[k]}" style="background:${COLORES[k]}"></span>`).join('') + (conTexto ? '<button class="x" data-x="copiar">📋 Copiar</button>' : '') + '<button class="x" data-x="borrar">🗑 Borrar</button>',
      async (t) => {
        cerrarPop();
        if (t.dataset.x === 'borrar') { eliminar(m); return; }
        if (t.dataset.x === 'copiar') { try { await navigator.clipboard.writeText(m.texto); } catch (_) {} return; }
        if (t.dataset.c && t.dataset.c !== m.color) {
          reg({ t: 'color', m, de: m.color, a: t.dataset.c }); await fijarColor(m, t.dataset.c);
        }
      });
  }

  // ---------- modos, colores, panel ----------
  const AYUDA = {
    sel: 'Seleccioná texto para subrayarlo · tocá un subrayado para cambiarle el color o borrarlo',
    sub: 'Modo subrayar: lo que selecciones se subraya al instante · en páginas escaneadas (sin texto) funciona como pincel',
    pincel: 'Pincel: arrastrá para marcar a mano alzada (consejo: mantené Mayús, o activá el botón Línea recta, para trazar una recta desde donde empezás) · ajustá el tamaño con el deslizador o con [ y ] · sirve en cualquier PDF, también escaneados',
    bor: 'Borrador: pasalo por encima de lo marcado (texto, pincel o áreas) para quitarlo · ajustá el tamaño con el deslizador o con [ y ]',
  };
  function modo(m) {
    S.modo = m; cerrarPop();
    S.root.classList.remove('m-sel', 'm-sub', 'm-bor', 'm-area', 'm-pincel'); const aro0 = $('.nkpdf-aro', S.root); if (aro0) aro0.style.display = 'none'; S.root.classList.add('m-' + m);
    S.root.querySelectorAll('[data-modo]').forEach((b) => b.classList.toggle('on', b.dataset.modo === m));
    const h = $('.nkpdf-hint span', S.root); if (h) h.textContent = AYUDA[m];
  }
  function marcarColor() {
    S.root.querySelectorAll('[data-color]').forEach((b) => b.classList.toggle('on', b.dataset.color === S.color));
  }
  function panel(forzar) {
    const p = $('.nkpdf-panel', S.root); if (!p) return;
    if (typeof forzar === 'boolean') { S.panelAbierto = forzar; p.classList.toggle('on', forzar); S.root.querySelector('[data-accion="lista"]').classList.toggle('on', forzar); }
    if (!S.panelAbierto) return;
    const lista = $('.nkpdf-lista', p);
    const ms = S.marcas.slice().sort((a, b) => a.pagina - b.pagina);
    lista.innerHTML = ms.length ? '' : '<div class="nkpdf-vacio">Todavía no subrayaste nada en este archivo.<br>Elegí la herramienta 🖍 Subrayar y seleccioná un texto.</div>';
    ms.forEach((m) => {
      const it = document.createElement('div'); it.className = 'nkpdf-item'; it.style.setProperty('--c', COLORES[m.color] || COLORES.amarillo);
      it.innerHTML = `<small><span>Página ${m.pagina}</span><button title="Borrar subrayado">🗑</button></small><p>${esc(m.texto || (esTrazo(m) ? 'Trazo de pincel' : m.area ? 'Área marcada' : ''))}</p>`;
      it.addEventListener('click', (e) => { if (e.target.closest('button')) { eliminar(m); return; } irA(m.pagina, true); });
      lista.appendChild(it);
    });
  }

  // ---------- pantalla completa ----------
  function contenedor() { return S && S.wrapper.closest('#nika-inline-viewer-container'); }
  function enPantalla() { const c = contenedor(); return !!(c && (document.fullscreenElement === c || c.classList.contains('nkpdf-fsfix'))); }
  function actualizarFs(reajustar) {
    if (!S) return;
    const on = enPantalla();
    const b = $('[data-accion="fs"]', S.root); if (b) { b.innerHTML = (on ? ICO.fsx : ICO.fs) + `<span class="nkpdf-txt">${on ? 'Salir' : 'Pantalla completa'}</span>`; b.classList.toggle('on', on); }
    const fb = document.getElementById('nika-fs-btn'); if (fb) fb.innerText = on ? 'Restaurar Pantalla' : 'Pantalla Completa';
    if (reajustar) setTimeout(() => { if (S) ajustarAncho(); }, 250);
  }
  function pantalla() {
    const c = contenedor(); if (!c) return;
    if (document.fullscreenElement === c) { document.exitFullscreen().catch(() => {}); return; }
    if (c.classList.contains('nkpdf-fsfix')) { quitarFicticia(c); actualizarFs(true); return; }
    if (c.requestFullscreen) c.requestFullscreen().catch(() => ficticia(c)); else ficticia(c);
  }
  function ficticia(c) {          // respaldo (iOS u otros sin Fullscreen API): capa fija por encima de todo
    c.dataset.estilo = c.getAttribute('style') || ''; c.classList.add('nkpdf-fsfix');
    c.style.cssText += ';position:fixed;inset:0;width:100vw;height:100dvh;margin:0;border-radius:0;z-index:2147483000;background:#fff';
    const w = S.wrapper; w.dataset.h = w.style.height; w.dataset.mh = w.style.maxHeight; w.style.height = 'calc(100dvh - 52px)'; w.style.maxHeight = 'none';
    actualizarFs(true);
  }
  function quitarFicticia(c) {
    c.classList.remove('nkpdf-fsfix'); c.setAttribute('style', c.dataset.estilo || '');
    const w = S && S.wrapper; if (w) { w.style.height = w.dataset.h || ''; w.style.maxHeight = w.dataset.mh || ''; }
  }
  document.addEventListener('fullscreenchange', () => { if (S) actualizarFs(true); });

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
    cerrar(); css(); ultimoOp = op; quitarVolver();
    const { wrapper, fileId, title, fallback } = op;
    const fbAzul = document.getElementById('nika-fs-btn'); if (fbAzul) fbAzul.style.display = 'none';   // el lector trae su propio botón de pantalla completa
    const iframe = $('iframe', wrapper); if (iframe) iframe.style.display = 'none';
    const root = document.createElement('div'); root.className = 'nkpdf m-sel'; wrapper.appendChild(root);
    mensaje(root, '<div class="sp"></div><div>Abriendo el PDF…</div>');
    S = { root, fileId, title, wrapper, fallback, tok: 1, escala: 1, leidas: new Set(), marcas: [], pags: [], actual: 1, segs: 0, uid: null, modo: 'sel', color: 'amarillo', panelAbierto: false, tam: 16, undo: [], redo: [], sel: null, recta: false };
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
        <div class="nkpdf-grupo" role="toolbar" aria-label="Herramientas">
          <button data-modo="sel" class="on" title="Seleccionar (V)">${ICO.sel}<span class="nkpdf-txt">Seleccionar</span></button>
          <button data-modo="sub" title="Subrayar (H)">${ICO.sub}<span class="nkpdf-txt">Subrayar</span></button>
          <button data-modo="pincel" title="Pincel (P) · marca a mano alzada, sirve en PDFs escaneados">${ICO.pincel}<span class="nkpdf-txt">Pincel</span></button>
          <button data-modo="bor" title="Borrador (E)">${ICO.bor}<span class="nkpdf-txt">Borrar</span></button>
        </div>
        <div class="nkpdf-grupo" aria-label="Edición">
          <button data-accion="undo" title="Deshacer (Ctrl+Z)" disabled>↶<span class="nkpdf-txt">Deshacer</span></button>
          <button data-accion="redo" title="Rehacer (Ctrl+Y)" disabled>↷<span class="nkpdf-txt">Rehacer</span></button>
          <button data-accion="supr" title="Borrar la marca seleccionada (Supr). Tocá una marca para seleccionarla">🗑<span class="nkpdf-txt">Borrar marca</span></button>
          <button data-accion="recta" title="Línea recta: el pincel traza una recta desde donde empezás (también con Mayús)">📏<span class="nkpdf-txt">Línea recta</span></button>
        </div>
        <div class="nkpdf-grupo" aria-label="Color del subrayado">
          ${Object.keys(COLORES).map((k, i) => `<button class="nkpdf-col" data-color="${k}" title="${NOMBRES[k]} (${i + 1})" style="background:${COLORES[k]}"></button>`).join('')}
        </div>
        <div class="nkpdf-grupo nkpdf-tam" title="Tamaño del pincel y del borrador ( [ y ] )"><span style="font-size:.7rem">Tamaño</span><input type="range" class="nkpdf-rango" min="4" max="64" value="${mi.tam}" aria-label="Tamaño"><b>${mi.tam}</b></div>
        <div class="nkpdf-grupo">
          <button data-accion="zm" title="Alejar (−)">−</button><span class="nkpdf-zoom">100%</span><button data-accion="zp" title="Acercar (+)">＋</button>
          <button data-accion="ajustar" title="Ajustar al ancho">${ICO.ajustar}</button>
        </div>
        <div class="nkpdf-grupo"><span class="nkpdf-pagtxt">pág. <input class="nkpdf-pag" type="number" min="1" max="${mi.n}" value="1" aria-label="Ir a la página"> / ${mi.n}</span>
          <button class="nkpdf-leer" data-accion="leer" title="Marcar esta página como leída">${ICO.ok}<span class="nkpdf-txt">Marcar leída</span></button></div>
        <div class="nkpdf-prog" title="Tu avance de lectura"><i><b></b></i><span></span></div>
        <span class="nkpdf-sep"></span>
        <div class="nkpdf-grupo">
          <button data-accion="lista" title="Mis subrayados">${ICO.lista}<span class="nkpdf-txt">Subrayados</span><span class="nkpdf-cnt" style="display:none">0</span></button>
          <button data-accion="drive" title="Ver este archivo con el visor de Drive">${ICO.drive}<span class="nkpdf-txt">Visor Drive</span></button>
          <button data-accion="atajos" title="Atajos de teclado (?)">⌨<span class="nkpdf-txt">Atajos</span></button>
          <button data-accion="fs" title="Pantalla completa (F)">${ICO.fs}<span class="nkpdf-txt">Pantalla completa</span></button>
        </div>
        <div class="nkpdf-hint"><span>${AYUDA.sel}</span></div>
      </div>
      <div class="nkpdf-cuerpo">
        <div class="nkpdf-scroll"></div>
        <i class="nkpdf-aro"></i>
        <aside class="nkpdf-panel" aria-label="Mis subrayados"><h4><span>📝 Mis subrayados</span><button data-accion="cerrar-lista" aria-label="Cerrar">✕</button></h4><div class="nkpdf-lista"></div></aside>
      </div>`);
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

    mi.scroll.addEventListener('pointerdown', (e) => iniciarTrazo(e, mi));
    mi.scroll.addEventListener('pointermove', moverAro);
    mi.scroll.addEventListener('pointerleave', () => { const a = $('.nkpdf-aro', mi.root); if (a) a.style.display = 'none'; });
    const rango = $('.nkpdf-rango', root); rango.addEventListener('input', () => { mi.tam = +rango.value; $('.nkpdf-tam b', root).textContent = mi.tam; });
    mi.scroll.addEventListener('mouseup', () => setTimeout(seleccion, 10));
    mi.scroll.addEventListener('touchend', () => setTimeout(seleccion, 350));
    mi.scroll.addEventListener('click', clickEnMarca);
    mi.scroll.addEventListener('scroll', () => { cerrarPop(); const a = paginaActual(); if (a !== mi.actual) { mi.actual = a; mi.segs = 0; actualizarBarra(); guardarProgreso(); } }, { passive: true });

    const zoom = (d) => { const i = ESCALAS.reduce((b, v, k) => (Math.abs(v - mi.escala) < Math.abs(ESCALAS[b] - mi.escala) ? k : b), 0); mi.escala = ESCALAS[Math.max(0, Math.min(ESCALAS.length - 1, i + d))]; reconstruir(); };
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-modo],[data-color],[data-accion]'); if (!b || S !== mi) return;
      if (b.dataset.modo) { modo(b.dataset.modo); return; }
      if (b.dataset.color) { mi.color = b.dataset.color; marcarColor(); if (mi.modo !== 'sub' && mi.modo !== 'pincel') modo('sub'); return; }
      switch (b.dataset.accion) {
        case 'zm': zoom(-1); break;
        case 'zp': zoom(1); break;
        case 'ajustar': ajustarAncho(); break;
        case 'leer': if (mi.leidas.has(mi.actual)) mi.leidas.delete(mi.actual); else mi.leidas.add(mi.actual); marcarLeida(mi.pags[mi.actual - 1]); actualizarBarra(); guardarProgreso(); break;
        case 'lista': panel(!mi.panelAbierto); break;
        case 'cerrar-lista': panel(false); break;
        case 'fs': pantalla(); break;
        case 'drive': aDrive(); break;
        case 'atajos': atajos(); break;
        case 'undo': deshacer(); break;
        case 'redo': rehacer(); break;
        case 'supr': if (mi.sel && mi.marcas.includes(mi.sel)) eliminar(mi.sel); else aviso('Tocá primero una marca para seleccionarla'); break;
        case 'recta': mi.recta = !mi.recta; b.classList.toggle('on', mi.recta); if (mi.recta && mi.modo !== 'pincel') modo('pincel'); aviso(mi.recta ? 'Línea recta activada' : 'Línea recta desactivada'); break;
      }
    });
    $('.nkpdf-pag', root).addEventListener('change', (e) => irA(+e.target.value, true));
    mi.teclas = (e) => {
      if (S !== mi) return;
      const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!document.body.contains(root) || !(root.offsetParent || enPantalla())) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); deshacer(); } else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); rehacer(); }
        return;
      }
      if (e.altKey) return;
      if (k === 'delete' || k === 'backspace') { if (mi.sel && mi.marcas.includes(mi.sel)) { e.preventDefault(); cerrarPop(); eliminar(mi.sel); } else aviso('Tocá primero una marca para seleccionarla'); return; }
      if (k === 'escape') { cerrarPop(); mi.sel = null; const at = $('.nkpdf-atajos', root); if (at) at.remove(); return; }
      if (k === '?' || (k === '/' && e.shiftKey)) { atajos(); return; }
      if (k === 'v') modo('sel'); else if (k === 'h') modo('sub'); else if (k === 'p' || k === 'a') modo('pincel'); else if (k === 'e') modo('bor');
      else if (k === '[' || k === ']') { mi.tam = Math.max(4, Math.min(64, mi.tam + (k === ']' ? 4 : -4))); const rg = $('.nkpdf-rango', root); if (rg) rg.value = mi.tam; $('.nkpdf-tam b', root).textContent = mi.tam; }
      else if (k === 'f') pantalla();
      else if (['1', '2', '3', '4'].includes(k)) { mi.color = Object.keys(COLORES)[+k - 1]; marcarColor(); modo('sub'); }
      else if (k === '+' || k === '=') zoom(1); else if (k === '-') zoom(-1);
    };
    document.addEventListener('keydown', mi.teclas);

    // una página cuenta como leída si estuvo ~4 s como la principal en pantalla
    mi.reloj = setInterval(() => {
      if (S !== mi || document.hidden) return;
      mi.segs++;
      if (mi.segs === 4 && !mi.leidas.has(mi.actual)) { mi.leidas.add(mi.actual); marcarLeida(mi.pags[mi.actual - 1]); actualizarBarra(); guardarProgreso(); }
    }, 1000);

    marcarColor(); actualizarBarra(); actualizarFs();
    const ult = mi.prog && mi.prog.ultima_pagina;
    if (ult && ult > 1 && ult <= mi.n) toast(`Seguías en la página ${ult} de ${mi.n}`, 'Continuar', () => irA(ult, true));
    else if (!mi.marcas.length) toast('Probá la herramienta Subrayar: seleccioná un texto y queda guardado en tu cuenta', 'Probar', () => modo('sub'));
    mi.actual = 1;
  }

  function cerrar() {
    cerrarPop();
    if (!S) return;
    const c = contenedor();
    if (c && c.classList.contains('nkpdf-fsfix')) quitarFicticia(c);
    if (c && document.fullscreenElement === c) document.exitFullscreen().catch(() => {});
    clearInterval(S.reloj); clearTimeout(_t); if (S.io) S.io.disconnect();
    if (S.teclas) document.removeEventListener('keydown', S.teclas);
    const fbAzul = document.getElementById('nika-fs-btn'); if (fbAzul) fbAzul.style.display = '';
    const s = S; persistir(s); S = null; s.tok = -1;
    try { s.pdf && s.pdf.destroy(); } catch (_) {}
    if (s.root && s.root.parentNode) s.root.remove();
  }

  window.NikaPdf = { abrir, cerrar, pantalla, reabrir: () => { if (ultimoOp) abrir(ultimoOp); }, activo: () => !!S };
})();
