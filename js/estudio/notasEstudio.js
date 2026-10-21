/* NikaNotas — notas y marcadores sobre videos y materiales (gratis para todos).
   - Video de YouTube: "Marcar este minuto" guarda la nota con el minuto; tocarla salta a ese punto.
   - Material (PDF en el lector NikaMed): guarda la nota con la página; tocarla lleva a esa página.
   - Cualquier otro recurso: nota simple.
   Se guardan en Supabase (tabla notas_estudio, RLS por usuario); sin sesión o sin tabla, quedan en este dispositivo. */
(function () {
  'use strict';
  if (window.NikaNotas) return;
  const LS = 'nika_notas_estudio';
  let salto = null, ctx = null, notas = [], player = null, playerListo = false, uid = null, tiempoUlt = 0, timer = null;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cli = () => { try { return window.NikaSupabase && window.NikaSupabase.client; } catch (_) { return null; } };
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); };
  const idYT = (u) => { const m = String(u || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; };

  // Mis notas guarda título/formato/papelera empaquetados en "texto": acá se lee el texto plano y se ocultan las eliminadas
  const desempacar = (n) => { if (typeof n.texto === 'string' && n.texto.indexOf('{"nk":1') === 0) { try { const o = JSON.parse(n.texto); n.texto = o.p || ''; n.eliminada_en = o.d || null; n.titulo = o.t || ''; } catch (_) {} } return n; };
  const activas = (a) => (a || []).map(desempacar).filter((n) => !n.eliminada_en);

  const lsLeer = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (_) { return []; } };
  const lsGuardar = (a) => { try { localStorage.setItem(LS, JSON.stringify(a)); } catch (_) {} };

  async function sesion() {
    if (uid) return uid;
    try { const c = cli(); if (!c) return null; if (window.NikaSupabase.ready) await window.NikaSupabase.ready; const { data } = await c.auth.getSession(); uid = data && data.session && data.session.user ? data.session.user.id : null; } catch (_) {}
    return uid;
  }

  async function cargar() {
    notas = lsLeer().filter((n) => n.recurso === ctx.url);
    if (await sesion()) {
      try {
        const pend = lsLeer().filter((n) => n.local);
        for (const n of pend) { const f = Object.assign({}, n); delete f.id; delete f.local; delete f.titulo; delete f.contenido_html; const { error } = await cli().from('notas_estudio').insert(f); if (!error) lsGuardar(lsLeer().filter((x) => x.id !== n.id)); }
      } catch (_) {}
      try {
        const { data, error } = await cli().from('notas_estudio').select('*').eq('recurso', ctx.url).order('posicion', { ascending: true, nullsFirst: false }).order('creado_en');
        if (!error && data) notas = notas.filter((n) => n.local).concat(activas(data));
      } catch (_) {}
    }
    pintarLista();
  }

  async function guardar(texto, posicion, color) {
    const fila = { recurso: ctx.url, recurso_titulo: ctx.titulo || null, modulo: ctx.modulo || null, up_id: ctx.upId || null, tipo: ctx.tipo, posicion: posicion == null ? null : posicion, texto: texto, color: color || 'amarillo' };
    let ok = false;
    if (await sesion()) {
      try { const { data, error } = await cli().from('notas_estudio').insert(fila).select().single(); if (!error && data) { notas.push(data); ok = true; } } catch (_) {}
    }
    if (!ok) { const l = Object.assign({ id: 'l' + Date.now(), local: true, creado_en: new Date().toISOString() }, fila); notas.push(l); lsGuardar(lsLeer().concat([l])); }
    ordenar(); pintarLista();
  }

  async function borrar(id) {
    const n = notas.find((x) => String(x.id) === String(id)); if (!n) return;
    notas = notas.filter((x) => x !== n);
    if (n.local) lsGuardar(lsLeer().filter((x) => x.id !== n.id));
    else if (await sesion()) { try { await cli().from('notas_estudio').delete().eq('id', n.id); } catch (_) {} }
    pintarLista();
  }

  const ordenar = () => notas.sort((a, b) => (a.posicion == null ? 1e12 : a.posicion) - (b.posicion == null ? 1e12 : b.posicion));

  // ---------- reproductor de YouTube (para leer el minuto actual y saltar) ----------
  function cargarApiYT() {
    return new Promise((res) => {
      if (window.YT && window.YT.Player) return res(true);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { try { if (typeof prev === 'function') prev(); } catch (_) {} res(true); };
      if (!document.getElementById('nk-yt-api')) { const s = document.createElement('script'); s.id = 'nk-yt-api'; s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => res(false); document.head.appendChild(s); }
      setTimeout(() => res(!!(window.YT && window.YT.Player)), 8000);
    });
  }
  async function ligarReproductor() {
    player = null; playerListo = false;
    const f = document.getElementById('nika-inline-iframe'); if (!f || ctx.tipo !== 'video') return;
    if (!(await cargarApiYT())) return;
    try { player = new window.YT.Player(f, { events: { onReady: () => { playerListo = true; if (salto != null) { const t = salto; salto = null; try { player.seekTo(t, true); player.playVideo(); } catch (_) {} } } } }); } catch (_) { player = null; }
  }
  const minutoActual = () => { try { if (player && playerListo && player.getCurrentTime) return player.getCurrentTime(); } catch (_) {} return null; };

  function saltar(n) {
    if (n.posicion == null) return;
    if (n.tipo === 'video') { try { if (player && playerListo) { player.seekTo(n.posicion, true); player.playVideo(); } } catch (_) {} }
    else if (window.NikaPdf && window.NikaPdf.irA) window.NikaPdf.irA(n.posicion, true);
  }

  // ---------- interfaz ----------
  function css() {
    if (document.getElementById('nk-notas-css')) return;
    if (!document.getElementById('nk-caveat')) { const f = document.createElement('link'); f.id = 'nk-caveat'; f.rel = 'stylesheet'; f.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'; document.head.appendChild(f); }
    const st = document.createElement('style'); st.id = 'nk-notas-css';
    st.textContent = `
#nk-notas { position: relative; margin: 0; padding: 18px 18px 16px; color: var(--text-main, #0f172a);
  background:
    linear-gradient(180deg, rgba(14,165,233,.07), transparent 120px),
    var(--card-bg, #fff);
  border-top: 0; animation: nknPanel .5s cubic-bezier(.22, 1, .36, 1) both; }
#nk-notas::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #ec4899, #f59e0b, #0ea5e9); background-size: 200% 100%; animation: nknCinta 8s linear infinite; }
@keyframes nknPanel { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes nknCinta { to { background-position: -200% 0; } }
#nk-notas h5 { margin: 0 0 12px; font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#nk-notas h5 .nkn-n { background: rgba(14,165,233,.15); color: #0369a1; border-radius: 99px; padding: 1px 9px; font-size: .75rem; }
#nk-notas h5 a { margin-left: auto; font-size: .78rem; font-weight: 800; color: #fff !important; background: linear-gradient(135deg, #0284c7, #6366f1); border-radius: 99px; padding: 6px 13px; text-decoration: none; transition: transform .2s, box-shadow .2s; }
#nk-notas h5 a:hover { transform: translateY(-2px); box-shadow: 0 8px 18px -8px rgba(99,102,241,.8); }

.nkn-hoja { position: relative; border-radius: 14px; border: 1px solid rgba(148,163,184,.4); background: #fffef7;
  background-image: repeating-linear-gradient(transparent 0, transparent 27px, rgba(14,165,233,.22) 27px, rgba(14,165,233,.22) 28px);
  box-shadow: 0 14px 26px -18px rgba(15,23,42,.5), inset 3px 0 0 rgba(239,68,68,.5); padding: 12px 14px 12px 22px; transition: box-shadow .25s, transform .25s; }
.nkn-hoja:focus-within { transform: translateY(-2px); box-shadow: 0 20px 34px -18px rgba(14,165,233,.6), inset 3px 0 0 rgba(239,68,68,.6); border-color: #38bdf8; }
.nkn-hoja textarea { width: 100%; box-sizing: border-box; min-height: 84px; max-height: 220px; resize: vertical; border: 0; outline: 0; background: transparent; color: #1e293b; font-family: 'Caveat', 'Segoe Print', cursive; font-size: 1.35rem; line-height: 28px; padding: 0; }
.nkn-barra { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.nkn-pos { background: rgba(14,165,233,.12); color: #0369a1; border: 1px solid rgba(14,165,233,.4); border-radius: 99px; padding: 6px 12px; font-weight: 800; font-size: .8rem; cursor: pointer; white-space: nowrap; font-family: inherit; transition: transform .15s, opacity .2s; }
.nkn-pos:hover { transform: scale(1.05); }
.nkn-pos[aria-pressed="false"] { opacity: .45; text-decoration: line-through; }
.nkn-cols { display: flex; gap: 6px; }
.nkn-col { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(15,23,42,.25); cursor: pointer; padding: 0; transition: transform .18s; }
.nkn-col:hover { transform: scale(1.2); }
.nkn-col[aria-pressed="true"] { box-shadow: 0 0 0 2px #0ea5e9; transform: scale(1.15); }
.nkn-save { margin-left: auto; background: linear-gradient(135deg, #0284c7, #6366f1); color: #fff; border: 0; border-radius: 12px; padding: 10px 18px; font-weight: 800; cursor: pointer; font-family: inherit; transition: transform .18s, box-shadow .18s; }
.nkn-save:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -8px rgba(99,102,241,.8); }
.nkn-save:active { transform: scale(.96); }

.nkn-lista { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; margin-top: 16px; max-height: 340px; overflow: auto; padding: 6px 4px 10px; }
.nkn-it { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 14px 12px 10px; border-radius: 4px 4px 14px 4px; font-family: 'Caveat', 'Segoe Print', cursive; font-size: 1.2rem; line-height: 1.2;
  color: #1e293b; background: var(--nk-c, #fef08a); box-shadow: 0 10px 18px -12px rgba(15,23,42,.55); transform: rotate(var(--nk-r, -1deg)); transition: transform .25s cubic-bezier(.22, 1, .36, 1), box-shadow .25s; animation: nknIn .45s cubic-bezier(.22, 1, .36, 1) both; }
.nkn-it:nth-child(2n) { --nk-r: 1.2deg; } .nkn-it:nth-child(3n) { --nk-r: -.5deg; }
.nkn-it::before { content: ''; position: absolute; top: -8px; left: 50%; width: 54px; height: 16px; transform: translateX(-50%) rotate(-3deg); background: rgba(255,255,255,.55); border: 1px solid rgba(0,0,0,.06); }
.nkn-it:hover { transform: rotate(0) translateY(-4px) scale(1.02); box-shadow: 0 18px 28px -14px rgba(15,23,42,.6); z-index: 2; }
@keyframes nknIn { from { opacity: 0; transform: translateY(14px) rotate(var(--nk-r, -1deg)) scale(.96); } to { opacity: 1; transform: rotate(var(--nk-r, -1deg)); } }
.nkn-it .nkn-chip { align-self: flex-start; background: rgba(15,23,42,.78); color: #fff; border: 0; border-radius: 99px; padding: 2px 10px; font-weight: 800; font-size: .72rem; cursor: pointer; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; transition: transform .15s; }
.nkn-it .nkn-chip:hover { transform: scale(1.08); background: #0284c7; }
.nkn-it .nkn-tx { white-space: pre-wrap; word-break: break-word; }
.nkn-it .nkn-x { position: absolute; top: 4px; right: 6px; background: transparent; border: 0; cursor: pointer; opacity: 0; font-size: .9rem; color: #334155; transition: opacity .2s; }
.nkn-it:hover .nkn-x { opacity: .8; }
.nkn-c-naranja { --nk-c: #fed7aa; } .nkn-c-lila { --nk-c: #ddd6fe; } .nkn-c-blanco { --nk-c: #ffffff; } .nkn-c-gris { --nk-c: #e2e8f0; }
.nkn-c-amarillo { --nk-c: #fef08a; } .nkn-c-rosa { --nk-c: #fbcfe8; } .nkn-c-celeste { --nk-c: #bae6fd; } .nkn-c-verde { --nk-c: #bbf7d0; }
.nkn-vacio { opacity: .7; font-size: .88rem; margin: 14px 0 0; text-align: center; }
body.dark-mode #nk-notas .nkn-hoja, body.tema-premium #nk-notas .nkn-hoja { background-color: #1e293b; background-image: repeating-linear-gradient(transparent 0, transparent 27px, rgba(148,163,184,.25) 27px, rgba(148,163,184,.25) 28px); border-color: rgba(148,163,184,.3); }
body.dark-mode #nk-notas .nkn-hoja textarea, body.tema-premium #nk-notas .nkn-hoja textarea { color: #f1f5f9; }
@media (prefers-reduced-motion: reduce) { #nk-notas, #nk-notas::before, .nkn-it { animation: none; } }

.nkm { margin-top: 14px; background: var(--card-bg, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 7px; font-size: .85rem; box-shadow: 0 12px 24px -18px rgba(15,23,42,.5); }
.nkm b { font-weight: 800; }
.nkm-it { text-align: left; background: rgba(14,165,233,.08); border: 1px solid rgba(14,165,233,.25); border-left: 4px solid #0ea5e9; border-radius: 10px; padding: 7px 10px; cursor: pointer; color: inherit; font-family: inherit; display: flex; flex-direction: column; gap: 2px; transition: transform .18s, background .18s; }
.nkm-it:hover { background: rgba(14,165,233,.16); transform: translateX(4px); }
.nkm-r { font-weight: 800; font-size: .76rem; color: #0369a1; }
.nkm-t { opacity: .9; }

/* Pantalla completa del visor: documento a la izquierda y mis notas a la derecha (sirve para el lector NikaMed y el visor de Drive) */
#nika-inline-viewer-container:fullscreen, #nika-inline-viewer-container.is-fs { display: grid !important; grid-template-columns: minmax(0, 1fr) 340px; grid-template-rows: auto minmax(0, 1fr); width: 100vw !important; height: 100vh !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; background: var(--card-bg, #fff); overflow: hidden; }
#nika-inline-viewer-container.is-fs { position: fixed !important; inset: 0; height: 100dvh !important; z-index: 2147483000 !important; }
#nika-inline-viewer-container:fullscreen > :first-child, #nika-inline-viewer-container.is-fs > :first-child { grid-column: 1 / -1; }
#nika-inline-viewer-container:fullscreen #nika-inline-frame-wrapper, #nika-inline-viewer-container.is-fs #nika-inline-frame-wrapper { grid-column: 1; grid-row: 2; height: auto !important; min-height: 0 !important; max-height: none !important; }
#nika-inline-viewer-container:fullscreen #nk-notas, #nika-inline-viewer-container.is-fs #nk-notas { grid-column: 2; grid-row: 2; overflow: auto; border-left: 1px solid rgba(148,163,184,.4); }
#nika-inline-viewer-container:fullscreen #nika-visor-ayuda, #nika-inline-viewer-container.is-fs #nika-visor-ayuda { display: none !important; }
@media (max-width: 820px) {
  #nika-inline-viewer-container:fullscreen, #nika-inline-viewer-container.is-fs { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr) 38%; }
  #nika-inline-viewer-container:fullscreen #nk-notas, #nika-inline-viewer-container.is-fs #nk-notas { grid-column: 1; grid-row: 3; border-left: 0; border-top: 1px solid rgba(148,163,184,.4); }
}
`;
    document.head.appendChild(st);
  }

  function montar() {
    css();
    const cont = document.getElementById('nika-inline-viewer-container'); if (!cont) return null;
    let p = document.getElementById('nk-notas');
    if (!p) { p = document.createElement('div'); p.id = 'nk-notas'; cont.appendChild(p); }
    const esVideo = ctx.tipo === 'video';
    p.innerHTML = '<h5>📝 Mis notas de este ' + (esVideo ? 'video' : 'material') + ' <span class="nkn-n"></span><a href="mis_notas.html">Ver todas mis notas →</a></h5>'
      + '<div class="nkn-hoja"><textarea maxlength="1200" placeholder="' + (esVideo ? 'Escribí una nota para este minuto…' : 'Escribí una nota (se guarda con la página que estás leyendo)…') + '"></textarea>'
      + '<div class="nkn-barra"><button type="button" class="nkn-pos" aria-pressed="true" title="Activá o desactivá el marcador de posición"></button>'
      + '<span class="nkn-cols" role="group" aria-label="Color de la nota">'
      + [['amarillo', '#fde047'], ['rosa', '#f9a8d4'], ['celeste', '#7dd3fc'], ['verde', '#86efac']].map((c, i) => '<button type="button" class="nkn-col" data-c="' + c[0] + '" style="background:' + c[1] + '" aria-pressed="' + (i === 0) + '" title="' + c[0] + '"></button>').join('')
      + '</span><button type="button" class="nkn-save">Guardar nota</button></div></div>'
      + '<div class="nkn-lista"></div>';
    const ta = p.querySelector('textarea'), pos = p.querySelector('.nkn-pos');
    const actualizarPos = () => {
      let v = null;
      if (esVideo) { const t = minutoActual(); if (t != null) tiempoUlt = t; v = tiempoUlt; }
      else if (window.NikaPdf && window.NikaPdf.pagina) v = window.NikaPdf.pagina();
      pos.dataset.v = v == null ? '' : String(v);
      pos.hidden = v == null && !esVideo;
      pos.textContent = v == null ? (esVideo ? '⏱ 0:00' : '') : (esVideo ? '⏱ ' + fmt(v) : '📄 Pág. ' + v);
    };
    clearInterval(timer); timer = setInterval(() => { if (document.activeElement !== ta || esVideo) actualizarPos(); }, 1000); actualizarPos();
    pos.addEventListener('click', () => pos.setAttribute('aria-pressed', String(pos.getAttribute('aria-pressed') !== 'true')));
    const enviar = () => {
      const tx = ta.value.trim(); if (!tx) { ta.focus(); return; }
      const usar = pos.getAttribute('aria-pressed') === 'true' && pos.dataset.v !== '' && !pos.hidden;
      const col = (p.querySelector('.nkn-col[aria-pressed="true"]') || {}).dataset; guardar(tx, usar ? Number(pos.dataset.v) : null, col && col.c); ta.value = '';
    };
    p.querySelector('.nkn-save').addEventListener('click', enviar);
    p.querySelectorAll('.nkn-col').forEach((b) => b.addEventListener('click', () => { p.querySelectorAll('.nkn-col').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); enviar(); } });
    p.querySelector('.nkn-lista').addEventListener('click', (e) => {
      const x = e.target.closest('.nkn-x'), c = e.target.closest('.nkn-chip');
      const it = e.target.closest('.nkn-it'); if (!it) return;
      const n = notas.find((q) => String(q.id) === it.dataset.id); if (!n) return;
      if (x) borrar(n.id); else if (c) saltar(n);
    });
    return p;
  }

  function pintarLista() {
    const p = document.getElementById('nk-notas'); if (!p) return;
    ordenar();
    p.querySelector('.nkn-n').textContent = notas.length ? '(' + notas.length + ')' : '';
    const l = p.querySelector('.nkn-lista');
    l.innerHTML = notas.length ? notas.map((n) => {
      const chip = n.posicion == null ? '' : '<button type="button" class="nkn-chip" title="Ir a este punto">' + (n.tipo === 'video' ? '⏱ ' + fmt(n.posicion) : '📄 Pág. ' + n.posicion) + '</button>';
      return '<div class="nkn-it nkn-c-' + esc(n.color || 'amarillo') + '" data-id="' + esc(n.id) + '">' + chip + '<div class="nkn-tx">' + esc(n.texto) + '</div><button type="button" class="nkn-x" title="Borrar nota" aria-label="Borrar nota">✕</button></div>';
    }).join('') : '<p class="nkn-vacio">Todavía no tomaste notas acá. Escribí la primera: queda guardada con el ' + (ctx.tipo === 'video' ? 'minuto' : 'punto') + ' en el que estás.</p>';
  }

  // Marcadores de la unidad abierta: se muestran debajo del bloc de apuntes existente (js/productivity/notas.js)
  async function marcadores(modulo, upId) {
    const ph = document.getElementById('notas-placeholder'); if (!ph) return;
    css();
    let box = document.getElementById('nk-marcadores');
    if (!box) { box = document.createElement('div'); box.id = 'nk-marcadores'; ph.insertAdjacentElement('afterend', box); }
    let lista = lsLeer().filter((n) => n.modulo === modulo && String(n.up_id) === String(upId));
    if (await sesion()) {
      try { const { data, error } = await cli().from('notas_estudio').select('*').eq('modulo', modulo).eq('up_id', String(upId)).order('creado_en'); if (!error && data) lista = lista.filter((n) => n.local).concat(activas(data)); } catch (_) {}
    }
    if (!lista.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="nkm"><b>🔖 Mis marcadores de esta unidad (' + lista.length + ')</b>' + lista.map((n, i) =>
      '<button type="button" class="nkm-it" data-i="' + i + '"><span class="nkm-r">' + esc((n.recurso_titulo || 'Recurso').slice(0, 60)) + (n.posicion != null ? ' · ' + (n.tipo === 'video' ? '⏱ ' + fmt(n.posicion) : '📄 pág. ' + n.posicion) : '') + '</span><span class="nkm-t">' + esc(n.texto).slice(0, 140) + '</span></button>').join('') + '</div>';
    box.onclick = (e) => {
      const b = e.target.closest('.nkm-it'); if (!b) return;
      const n = lista[+b.dataset.i]; if (!n || typeof window.openInlineViewer !== 'function') return;
      window.openInlineViewer(n.recurso, n.recurso_titulo || 'Recurso');
      if (n.posicion != null) {
        if (n.tipo === 'video') salto = n.posicion;
        else { let k = 0; const t = setInterval(() => { k++; if (window.NikaPdf && window.NikaPdf.activo() && window.NikaPdf.irA) { clearInterval(t); setTimeout(() => window.NikaPdf.irA(n.posicion, true), 600); } else if (k > 20) clearInterval(t); }, 500); }
      }
    };
  }

  function abrir(o) {
    if (!o || !o.url) return;
    const esVideo = !!idYT(o.url);
    ctx = { url: String(o.url), titulo: o.titulo || '', modulo: o.modulo || '', upId: o.upId || '', tipo: esVideo ? 'video' : 'material' };
    tiempoUlt = 0; notas = [];
    if (!montar()) return;
    cargar();
    ligarReproductor();
  }
  function cerrar() { clearInterval(timer); timer = null; player = null; playerListo = false; ctx = null; const p = document.getElementById('nk-notas'); if (p) p.remove(); }

  window.NikaNotas = { abrir, cerrar, marcadores };
})();
