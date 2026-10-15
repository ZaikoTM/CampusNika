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
        const { data, error } = await cli().from('notas_estudio').select('*').eq('recurso', ctx.url).order('posicion', { ascending: true, nullsFirst: false }).order('creado_en');
        if (!error && data) notas = notas.filter((n) => n.local).concat(data);
      } catch (_) {}
    }
    pintarLista();
  }

  async function guardar(texto, posicion) {
    const fila = { recurso: ctx.url, recurso_titulo: ctx.titulo || null, modulo: ctx.modulo || null, up_id: ctx.upId || null, tipo: ctx.tipo, posicion: posicion == null ? null : posicion, texto: texto, color: 'amarillo' };
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
    const st = document.createElement('style'); st.id = 'nk-notas-css';
    st.textContent = `
#nk-notas { border-top: 1px solid #cbd5e1; background: var(--card-bg, #fff); color: var(--text-main, #0f172a); padding: 14px 16px; }
#nk-notas h5 { margin: 0 0 10px; font-size: .95rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#nk-notas h5 a { margin-left: auto; font-size: .78rem; font-weight: 700; color: #0284c7; text-decoration: none; }
.nkn-form { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; }
.nkn-form textarea { flex: 1 1 240px; min-height: 44px; max-height: 140px; resize: vertical; border: 1px solid var(--border, #cbd5e1); background: var(--bg-body, #f8fafc); color: inherit; border-radius: 10px; padding: 9px 11px; font: inherit; font-size: .9rem; }
.nkn-pos { background: rgba(14, 165, 233, .12); color: #0369a1; border: 1px solid rgba(14, 165, 233, .35); border-radius: 99px; padding: 6px 11px; font-weight: 800; font-size: .8rem; cursor: pointer; white-space: nowrap; font-family: inherit; }
.nkn-pos[aria-pressed="false"] { opacity: .5; text-decoration: line-through; }
.nkn-save { background: linear-gradient(135deg, #0284c7, #6366f1); color: #fff; border: 0; border-radius: 10px; padding: 10px 16px; font-weight: 800; cursor: pointer; font-family: inherit; }
.nkn-lista { display: flex; flex-direction: column; gap: 7px; margin-top: 12px; max-height: 260px; overflow: auto; }
.nkn-it { display: flex; gap: 9px; align-items: flex-start; background: rgba(250, 204, 21, .14); border-left: 4px solid #facc15; border-radius: 9px; padding: 8px 10px; font-size: .88rem; animation: nknIn .3s ease both; }
@keyframes nknIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nkn-it .nkn-chip { flex: 0 0 auto; background: #0ea5e9; color: #fff; border: 0; border-radius: 99px; padding: 3px 9px; font-weight: 800; font-size: .74rem; cursor: pointer; font-family: inherit; }
.nkn-it .nkn-tx { flex: 1; white-space: pre-wrap; word-break: break-word; }
.nkn-it .nkn-x { background: transparent; border: 0; cursor: pointer; opacity: .55; font-size: 1rem; color: inherit; }
.nkn-it .nkn-x:hover { opacity: 1; }
.nkn-vacio { opacity: .65; font-size: .85rem; margin: 6px 0 0; }
.nkm { margin-top: 12px; background: var(--card-bg, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: .85rem; }
.nkm-it { text-align: left; background: rgba(14, 165, 233, .08); border: 1px solid rgba(14, 165, 233, .25); border-radius: 10px; padding: 7px 10px; cursor: pointer; color: inherit; font-family: inherit; display: flex; flex-direction: column; gap: 2px; }
.nkm-it:hover { background: rgba(14, 165, 233, .16); }
.nkm-r { font-weight: 800; font-size: .76rem; color: #0369a1; }
.nkm-t { opacity: .9; }
body.dark-mode #nk-notas, body.tema-premium #nk-notas { border-top-color: rgba(148, 163, 184, .25); }
body.dark-mode .nkn-it, body.tema-premium .nkn-it { background: rgba(250, 204, 21, .12); }
@media (prefers-reduced-motion: reduce) { .nkn-it { animation: none; } }`;
    document.head.appendChild(st);
  }

  function montar() {
    css();
    const cont = document.getElementById('nika-inline-viewer-container'); if (!cont) return null;
    let p = document.getElementById('nk-notas');
    if (!p) { p = document.createElement('div'); p.id = 'nk-notas'; cont.appendChild(p); }
    const esVideo = ctx.tipo === 'video';
    p.innerHTML = '<h5>📝 Mis notas de este ' + (esVideo ? 'video' : 'material') + ' <span class="nkn-n"></span><a href="mis_notas.html">Ver todas mis notas →</a></h5>'
      + '<div class="nkn-form"><button type="button" class="nkn-pos" aria-pressed="true" title="Activá o desactivá el marcador de posición"></button>'
      + '<textarea maxlength="1200" placeholder="' + (esVideo ? 'Escribí una nota para este minuto…' : 'Escribí una nota (se guarda con la página que estás leyendo)…') + '"></textarea>'
      + '<button type="button" class="nkn-save">Guardar nota</button></div>'
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
      guardar(tx, usar ? Number(pos.dataset.v) : null); ta.value = '';
    };
    p.querySelector('.nkn-save').addEventListener('click', enviar);
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
      return '<div class="nkn-it" data-id="' + esc(n.id) + '">' + chip + '<div class="nkn-tx">' + esc(n.texto) + '</div><button type="button" class="nkn-x" title="Borrar nota" aria-label="Borrar nota">✕</button></div>';
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
      try { const { data, error } = await cli().from('notas_estudio').select('*').eq('modulo', modulo).eq('up_id', String(upId)).order('creado_en'); if (!error && data) lista = lista.filter((n) => n.local).concat(data); } catch (_) {}
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
