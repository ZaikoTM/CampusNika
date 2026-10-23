/* NikaTiempo — tiempo estimado de lectura de los PDF (lector NikaMed y sala de materiales).
   - Mide segundos ACTIVOS por página (pestaña visible + actividad reciente) y los guarda en pdf_ritmo (sql/pdf_ritmo_lectura.sql).
   - Tu ritmo = mediana de tus páginas medidas; arranca mezclado con el promedio de la comunidad (agregados anónimos) o con un estándar de 2 min/pág.
   - Sin las tablas de Supabase todo sigue andando: se guarda en el navegador y se usa el estándar.
   - Es solo cálculo: devuelve números y textos para que las vistas los pinten. */
(function () {
  'use strict';
  if (window.NikaTiempo) return;

  const STD = 120;            // segundos por página sin datos (promedio académico)
  const MIN_VALIDO = 5;       // una página con menos segundos se considera salteada
  const MAX_VALIDO = 600;     // más de 10 min en una página: te fuiste
  const REPOSO = 150000;      // sin actividad por más de 2,5 min, el reloj se frena
  const META_DEF = 30;        // minutos de lectura por día
  const LS = 'nika_tl_';

  const cli = () => window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;
  const lsGet = (k, d) => { try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : d; } catch (_) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (_) {} };
  async function uid() {
    try { const c = cli(); if (!c || !c.auth) return null; const { data } = await c.auth.getSession(); return (data && data.session && data.session.user && data.session.user.id) || null; } catch (_) { return null; }
  }
  const valido = (s) => s >= MIN_VALIDO && s <= MAX_VALIDO;
  const mediana = (a) => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
  const hoyISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const avisar = () => { try { document.dispatchEvent(new CustomEvent('nika-tl-actualizado')); } catch (_) {} };

  // ---------- ritmo global (todas las páginas medidas del usuario) ----------
  let G = lsGet('g', {});     // { "archivo:pagina": segundos }
  let hidratado = null;
  function guardarG() {
    const k = Object.keys(G); if (k.length > 600) k.slice(0, k.length - 600).forEach((x) => delete G[x]);
    lsSet('g', G);
  }
  function hidratar() {
    if (hidratado) return hidratado;
    hidratado = (async () => {
      const u = await uid(), c = cli(); if (!u || !c) return;
      try {
        const { data } = await c.from('pdf_ritmo').select('file_id,segs').order('updated_at', { ascending: false }).limit(60);
        (data || []).forEach((r) => Object.entries(r.segs || {}).forEach(([p, s]) => { if (valido(s)) G[r.file_id + ':' + p] = s; }));
        guardarG();
      } catch (_) {}
      try {
        const { data } = await c.from('pdf_lectura_dia').select('segs').eq('dia', hoyISO()).maybeSingle();
        if (data && data.segs > (lsGet('dia', {}).segs || 0) && lsGet('dia', {}).d === hoyISO()) lsSet('dia', { d: hoyISO(), segs: data.segs });
        else if (data && lsGet('dia', {}).d !== hoyISO()) lsSet('dia', { d: hoyISO(), segs: data.segs });
      } catch (_) {}
      avisar();
    })();
    return hidratado;
  }

  // ---------- datos por archivo (propios y de la comunidad) ----------
  const _com = {};            // file_id -> { total_paginas, segs_total, paginas }
  const _docs = {};           // file_id -> { pagina: segundos }
  async function datosLista(ids) {
    await hidratar();
    const c = cli(), u = await uid();
    ids.forEach((id) => { if (!_docs[id]) _docs[id] = lsGet('f_' + id, {}); });
    if (!c || !u || !ids.length) return;
    try {
      const [a, b] = await Promise.all([
        c.from('pdf_ritmo_comunidad').select('file_id,total_paginas,segs_total,paginas').in('file_id', ids),
        c.from('pdf_ritmo').select('file_id,segs').in('file_id', ids),
      ]);
      (a.data || []).forEach((r) => { _com[r.file_id] = r; });
      (b.data || []).forEach((r) => { _docs[r.file_id] = Object.assign({}, _docs[r.file_id], r.segs || {}); });
    } catch (_) {}
  }

  // segundos por página: mezcla de tu ritmo, el del documento y la comunidad
  function tasa(fileId, segsDoc) {
    const g = Object.values(G).filter(valido), nG = g.length, mg = mediana(g);
    const com = _com[fileId], comProm = com && com.paginas >= 15 ? com.segs_total / com.paginas : null;
    const base = comProm || STD;
    let t = mg != null ? Math.min(1, nG / 30) * mg + (1 - Math.min(1, nG / 30)) * base : base;
    const d = Object.values(segsDoc || {}).filter(valido), nD = d.length;
    if (nD >= 5) { const w = Math.min(0.7, nD / 20); t = w * mediana(d) + (1 - w) * t; }
    t = Math.max(20, Math.min(600, t));
    const fuente = (nG >= 30 || nD >= 10) ? 'tuyo' : (nG > 0 || nD > 0) ? 'mixto' : comProm ? 'comunidad' : 'estandar';
    return { t, fuente, nG, nD, comProm };
  }

  // Páginas restantes -> segundos. peso = páginas equivalentes (las de poco texto pesan menos). Devuelve null si no se sabe el largo.
  function estimar(fileId, restantes, peso, segsDoc) {
    if (restantes == null || restantes < 0) return null;
    const r = tasa(fileId, segsDoc || _docs[fileId]);
    const eq = peso == null ? restantes : peso;
    return { seg: Math.round(eq * r.t), tasa: r.t, fuente: r.fuente, restantes, nMedidas: r.nG, nDoc: r.nD };
  }
  // para la lista de materiales: usa el largo guardado en tu progreso o, si nunca lo abriste, el que aportó la comunidad
  function estimarArchivo(fileId, prog) {
    const com = _com[fileId];
    const total = (prog && prog.total_paginas > 0) ? prog.total_paginas : (com && com.total_paginas) || 0;
    if (!total) return null;
    const leidas = prog && Array.isArray(prog.leidas) ? prog.leidas.filter((x) => x > 0).length : 0;
    const e = estimar(fileId, Math.max(0, total - leidas));
    if (e) e.total = total;
    return e;
  }

  // ---------- sesión del lector ----------
  function nuevo(fileId, total) {
    return { fileId, total, prev: lsGet('f_' + fileId, {}), tp: {}, aport: new Set(), chars: {}, ult: Date.now(), pend: 0, pendDia: 0, ultGuardado: 0 };
  }
  async function cargar(t) {
    await hidratar();
    const u = await uid(), c = cli();
    if (u && c) {
      try {
        const { data } = await c.from('pdf_ritmo').select('segs').eq('file_id', t.fileId).maybeSingle();
        if (data && data.segs) t.prev = Object.assign({}, t.prev, data.segs);
      } catch (_) {}
      try { await datosLista([t.fileId]); } catch (_) {}
    }
    Object.keys(t.prev).forEach((p) => t.aport.add(+p));   // lo ya medido ya fue aportado a la comunidad
    _docs[t.fileId] = Object.assign({}, t.prev);
  }
  const tocar = (t) => { t.ult = Date.now(); };
  // cada segundo: suma a la página que estás viendo, solo si estás activo
  function tick(t, actual) {
    if (document.hidden || Date.now() - t.ult > REPOSO) return false;
    t.tp[actual] = (t.tp[actual] || 0) + 1; t.pendDia++;
    return true;
  }
  function segsDe(t) {
    const m = Object.assign({}, t.prev);
    Object.entries(t.tp).forEach(([p, s]) => { if (valido(s)) m[p] = Math.round(s); });
    return m;
  }
  function peso(t, leidas, n) {
    let w = 0, c = 0;
    for (let p = 1; p <= n; p++) { if (leidas.has(p)) continue; c++; const ch = t.chars[p]; w += (ch != null && ch < 250) ? 0.4 : 1; }
    return { restantes: c, peso: w };
  }
  function estimarSesion(t, leidas, n) {
    const { restantes, peso: w } = peso(t, leidas, n);
    return estimar(t.fileId, restantes, w, segsDe(t));
  }

  function sumarDia(segs) {
    if (!segs) return;
    const d = lsGet('dia', {}); const hoy = hoyISO();
    const total = (d.d === hoy ? d.segs || 0 : 0) + segs;
    lsSet('dia', { d: hoy, segs: total });
    return total;
  }
  async function guardar(t, actual, cierre) {
    const ahora = Date.now(); if (!cierre && ahora - t.ultGuardado < 20000) return; t.ultGuardado = ahora;
    const m = segsDe(t);
    lsSet('f_' + t.fileId, m); _docs[t.fileId] = m;
    Object.entries(m).forEach(([p, s]) => { G[t.fileId + ':' + p] = s; }); guardarG();
    const total = t.pendDia ? sumarDia(t.pendDia) : (lsGet('dia', {}).segs || 0); t.pendDia = 0;
    const u = await uid(), c = cli(); if (!u || !c) { avisar(); return; }
    try { await c.from('pdf_ritmo').upsert({ file_id: t.fileId, segs: m, updated_at: new Date().toISOString() }, { onConflict: 'user_id,file_id' }); } catch (_) {}
    try { if (total) await c.from('pdf_lectura_dia').upsert({ dia: hoyISO(), segs: total }, { onConflict: 'user_id,dia' }); } catch (_) {}
    // aporte anónimo a la comunidad: solo páginas ya terminadas (no la que estás leyendo) y una única vez por página
    let s = 0, n = 0;
    Object.entries(t.tp).forEach(([p, v]) => { if (+p !== actual || cierre) if (valido(v) && !t.aport.has(+p)) { s += Math.round(v); n++; t.aport.add(+p); } });
    if (n) { try { await c.rpc('pdf_ritmo_aportar', { p_file: t.fileId, p_segs: s, p_pags: n, p_total: t.total || null }); } catch (_) {} }
    avisar();
  }

  // ---------- meta diaria y racha ----------
  const meta = () => Math.max(5, Math.min(600, +lsGet('meta', META_DEF) || META_DEF));
  const setMeta = (min) => { lsSet('meta', Math.max(5, Math.min(600, Math.round(min)))); avisar(); };
  function hoySegs(t) { const d = lsGet('dia', {}); return (d.d === hoyISO() ? d.segs || 0 : 0) + (t ? t.pendDia : 0); }
  async function racha() {
    await hidratar();
    const m = meta() * 60, hoy = hoySegs();
    let dias = {};
    const u = await uid(), c = cli();
    if (u && c) {
      try {
        const desde = new Date(Date.now() - 70 * 864e5); const ds = desde.getFullYear() + '-' + String(desde.getMonth() + 1).padStart(2, '0') + '-' + String(desde.getDate()).padStart(2, '0');
        const { data } = await c.from('pdf_lectura_dia').select('dia,segs').gte('dia', ds);
        (data || []).forEach((r) => { dias[r.dia] = r.segs; });
      } catch (_) {}
    }
    dias[hoyISO()] = Math.max(hoy, dias[hoyISO()] || 0);
    let n = 0; const d = new Date();
    if ((dias[hoyISO()] || 0) < m) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 70; i++) {
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if ((dias[k] || 0) >= m) { n++; d.setDate(d.getDate() - 1); } else break;
    }
    return { hoy, meta: m, racha: n, cumplida: hoy >= m };
  }

  // ---------- textos ----------
  function fmt(seg) {
    if (seg == null) return '';
    const min = seg / 60;
    if (min < 1) return '<1 min';
    if (min < 60) return Math.round(min) + ' min';
    const h = Math.floor(min / 60), r = Math.round((min - h * 60) / 5) * 5;
    if (h >= 10) return Math.round(min / 60) + ' h';
    return r >= 60 ? (h + 1) + ' h' : r ? h + ' h ' + r + ' min' : h + ' h';
  }
  function fmtFin(seg) {
    if (seg == null) return '';
    const f = new Date(Date.now() + seg * 1000), a = new Date();
    const hh = String(f.getHours()).padStart(2, '0') + ':' + String(f.getMinutes()).padStart(2, '0');
    const dd = Math.round((new Date(f.getFullYear(), f.getMonth(), f.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
    if (dd <= 0) return 'hoy a las ' + hh;
    if (dd === 1) return 'mañana a las ' + hh;
    if (dd < 7) return ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][f.getDay()] + ' a las ' + hh;
    return f.getDate() + '/' + (f.getMonth() + 1) + ' a las ' + hh;
  }
  const fuenteTxt = (e) => e.fuente === 'tuyo' ? 'Calculado con tu ritmo real' : e.fuente === 'mixto' ? 'Tu ritmo todavía se está afinando' : e.fuente === 'comunidad' ? 'Según el promedio de otros estudiantes' : 'Estimación inicial: se ajusta a vos mientras leés';

  // un número que cambia con una microanimación (cuenta el cambio sin parpadear)
  function pintar(el, texto) {
    if (!el || el.textContent === texto) return;
    el.textContent = texto; el.classList.remove('nk-tl-cambia'); void el.offsetWidth; el.classList.add('nk-tl-cambia');
  }

  // ---------- plan hasta el próximo examen (calendario_eventos) ----------
  let _ex = null, _exT = 0;
  async function proximoExamen() {
    if (_ex !== null && Date.now() - _exT < 120000) return _ex || null;
    const c = cli(), u = await uid(); _exT = Date.now(); _ex = false;
    if (!c || !u) return null;
    try {
      const { data } = await c.from('calendario_eventos').select('titulo,tipo,fecha').in('tipo', ['examen', 'repaso']).gte('fecha', hoyISO()).order('fecha', { ascending: true }).limit(8);
      const r = (data || []).find((x) => x.tipo === 'examen') || (data || [])[0];
      if (r) { const [y, m, d] = String(r.fecha).split('-').map(Number); _ex = { titulo: r.titulo, dias: Math.max(0, Math.round((new Date(y, m - 1, d) - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / 864e5)) }; }
    } catch (_) {}
    return _ex || null;
  }

  function css() {
    if (document.getElementById('nk-tl-css')) return;
    const st = document.createElement('style'); st.id = 'nk-tl-css';
    st.textContent = `
.nk-tl-cambia{display:inline-block;animation:nkTlCambia .5s cubic-bezier(.22,1,.36,1)}
@keyframes nkTlCambia{0%{opacity:.2;transform:translateY(6px) scale(.94)}60%{opacity:1;transform:translateY(-1px) scale(1.04)}100%{transform:none}}
@keyframes nkTlShimmer{0%{background-position:-120px 0}100%{background-position:120px 0}}
@keyframes nkTlLat{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
.nk-tl-et{display:inline-flex;align-items:center;gap:5px;margin-left:8px;padding:2px 9px;border-radius:999px;font-size:.7rem;font-weight:800;letter-spacing:0!important;text-transform:none!important;color:#0e7490;background:#cffafe;border:1px solid #a5f3fc;opacity:0;animation:nkTlEntra .5s cubic-bezier(.22,1,.36,1) forwards;animation-delay:var(--d,0s);white-space:nowrap}
.nk-tl-et i{font-style:normal;display:inline-block;animation:nkTlLat 2.4s ease-in-out infinite}
.nk-tl-et.largo{color:#9a3412;background:#ffedd5;border-color:#fed7aa}
@keyframes nkTlEntra{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
body.dark-mode .nk-tl-et{color:#67e8f9;background:rgba(34,211,238,.14);border-color:rgba(34,211,238,.35)}
body.dark-mode .nk-tl-et.largo{color:#fdba74;background:rgba(251,146,60,.14);border-color:rgba(251,146,60,.35)}
.nk-tl-banda{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:0 0 12px;padding:10px 14px;border-radius:12px;background:linear-gradient(120deg,#ecfeff,#eef2ff);border:1px solid #bae6fd;color:#0c4a6e;font-size:.86rem;animation:nkContIn .45s ease}
.nk-tl-banda b{font-weight:800}
.nk-tl-lins{display:flex;flex-direction:column;gap:6px;flex:1;min-width:230px}
.nk-tl-lin{display:flex;align-items:flex-start;gap:8px;line-height:1.4}.nk-tl-lin>i{font-style:normal}.nk-tl-lin small{display:block;opacity:.72;font-size:.72rem;font-weight:600}
.nk-tl-meta{display:inline-flex;align-items:center;gap:8px;margin-left:auto;font-size:.78rem;font-weight:700}
.nk-tl-aro{--p:0;width:30px;height:30px;border-radius:50%;background:conic-gradient(#06b6d4 calc(var(--p)*1%),rgba(148,163,184,.3) 0);display:inline-grid;place-items:center;transition:background .6s}
.nk-tl-aro::after{content:'';width:22px;height:22px;border-radius:50%;background:#f0f9ff}
.nk-tl-meta.ok .nk-tl-aro{background:conic-gradient(#22c55e 100%,#22c55e 0);animation:nkTlLat 2s ease-in-out infinite}
body.dark-mode .nk-tl-banda{background:linear-gradient(120deg,rgba(14,116,144,.2),rgba(79,70,229,.18));border-color:rgba(56,189,248,.3);color:#bae6fd}
body.dark-mode .nk-tl-aro::after{background:#0f172a}
@media (prefers-reduced-motion:reduce){.nk-tl-cambia,.nk-tl-et,.nk-tl-et i,.nk-tl-banda,.nk-tl-meta.ok .nk-tl-aro{animation:none!important;opacity:1}}`;
    document.head.appendChild(st);
  }

  const ritmoGlobal = () => { const g = Object.values(G).filter(valido); return { seg: mediana(g), n: g.length }; };
  window.NikaTiempo = { ritmoGlobal, css, hidratar, datosLista, estimar, estimarArchivo, estimarSesion, nuevo, cargar, tocar, tick, guardar, segsDe, fmt, fmtFin, fuenteTxt, pintar, meta, setMeta, racha, hoySegs, proximoExamen, valido, MIN_VALIDO };
})();
