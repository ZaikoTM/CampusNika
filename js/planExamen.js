/* NikaPlan · Prepará tu examen
   Plan de estudio día a día hasta un examen (uno o varios temas/unidades), con agenda, checklist con
   progreso, semáforo de ritmo y vistas Agenda / Tabla / Calendario. Gratis para todos.
   Guarda en el dispositivo (localStorage) y sincroniza con la tabla "planes_examen" de Supabase cuando existe.
   Se enlaza con "calendario_eventos": al crear un plan se agenda el examen y aparece en Próximos eventos. */
(function () {
  'use strict';

  const LS = 'nika_planes_examen_v1';
  const MATERIAS = {
    ginecologia: { nombre: 'Ginecología y Obstetricia', corto: 'Gineco', ico: '🤰', color: '#ec4899', sala: 'estudio.html?modulo=ginecologia' },
    cirugia: { nombre: 'Cirugía', corto: 'Cirugía', ico: '🔪', color: '#f97316', sala: 'estudio.html?modulo=cirugia' },
    siam: { nombre: 'S.I.A.M.', corto: 'SIAM', ico: '🧓', color: '#0ea5e9', sala: 'estudio.html?modulo=siam' },
    pfo: { nombre: 'PFO · 6.º año', corto: 'PFO', ico: '🎓', color: '#8b5cf6', sala: 'pfo_estudio.html' },
  };
  const PRIO = { alta: { t: 'Alta', c: '#ef4444' }, media: { t: 'Media', c: '#f59e0b' }, sec: { t: 'Apoyo', c: '#38bdf8' } };
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const S = { user: null, planes: [], plan: null, vista: 'agenda', diaId: null, wiz: null, nube: false, catalogo: {}, filtro: 'todos', mes: null };
  let root = null, tSubida = null;

  // ---------- utilidades ----------
  const esc = (s) => { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML.replace(/"/g, '&quot;'); };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hoyISO = () => iso(new Date());
  const aFecha = (s) => new Date(s + 'T00:00:00');
  const difDias = (a, b) => Math.round((aFecha(a) - aFecha(b)) / 864e5);
  const sumaDias = (s, n) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d); };
  const fmtCorta = (s) => { const d = aFecha(s); return `${DIAS[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const fmtLarga = (s) => { const d = aFecha(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
  const num = (x, def = 0) => { const n = parseFloat(String(x).replace(',', '.')); return isFinite(n) ? n : def; };
  const fmtH = (h) => (Math.round(h * 10) / 10).toString().replace('.', ',') + ' h';
  const toast = (m) => { try { (window.showToast || alert)(m); } catch (_) {} };
  const db = () => window.NikaSupabase?.client || window.NikaSupabase?.supabase || window.supabaseClient || window.supabase;

  // ---------- progreso y ritmo ----------
  function itemsDia(d) { return (d.temas || []).concat(d.checklist || []); }
  function progresoDia(d) { const it = itemsDia(d); if (!it.length) return 0; return it.filter((x) => x.hecho).length / it.length; }
  function estadoDia(d) { const p = progresoDia(d); return p >= 1 ? 'listo' : p > 0 ? 'curso' : 'nuevo'; }
  function horasPlan(p) { return p.dias.reduce((a, d) => a + (d.horas || 0), 0); }
  function horasHechas(p) { return p.dias.reduce((a, d) => a + (d.horas || 0) * progresoDia(d), 0); }
  function progresoPlan(p) { const h = horasPlan(p); return h ? horasHechas(p) / h : 0; }

  // Semáforo: compara lo cumplido con lo que debería estar hecho hasta ayer y mira cuánto falta por día.
  function ritmo(p) {
    const hoy = hoyISO(), total = horasPlan(p), hechas = horasHechas(p);
    const vencidas = p.dias.filter((d) => d.fecha < hoy).reduce((a, d) => a + (d.horas || 0), 0);
    const hechasVenc = p.dias.filter((d) => d.fecha < hoy).reduce((a, d) => a + (d.horas || 0) * progresoDia(d), 0);
    const diasFalta = difDias(p.fecha_examen, hoy);
    const base = { falta: Math.max(0, total - hechas), diasFalta };
    if (diasFalta < 0) return { ...base, nivel: 'fin', ico: '🏁', titulo: 'Examen rendido', texto: 'Cerrá el plan y anotá cómo te fue.', pct: 1 };
    if (total === 0) return { ...base, nivel: 'nuevo', ico: '📝', titulo: 'Plan vacío', texto: 'Agregá temas a los días para empezar.', pct: 0 };
    if (hechas >= total - 0.01) return { ...base, nivel: 'verde', ico: '🟢', titulo: '¡Plan completo!', texto: 'Cumpliste todo lo planificado. Descansá y repasá livianito.', pct: 1 };
    if (vencidas === 0) return { ...base, nivel: 'verde', ico: '🟢', titulo: 'Todo listo para arrancar', texto: p.dias[0].fecha === hoy ? 'Hoy es el día 1 de tu plan. ¡A darle!' : `Tu plan empieza el ${fmtLarga(p.dias[0].fecha)}. ¡A darle!`, pct: 0 };
    const cumplido = hechasVenc / vencidas;
    const falta = Math.max(0, total - hechas);
    const diasUtiles = Math.max(1, p.dias.filter((d) => d.fecha >= hoy).length);
    const hdia = falta / diasUtiles;
    const prom = total / Math.max(1, p.dias.length);
    let nivel, titulo, texto;
    if (cumplido >= 0.85 && hdia <= prom * 1.25) {
      nivel = 'verde'; titulo = 'Venís a buen ritmo'; texto = 'Así vamos a llegar al examen. Sostené el plan.';
    } else if (cumplido >= 0.55 && hdia <= prom * 1.8) {
      nivel = 'amarillo'; titulo = 'Te falta estudiar un poco más'; texto = 'Con un poco más por día vamos a llegar. Priorizá los temas de prioridad alta.';
    } else {
      nivel = 'rojo'; titulo = 'Necesitamos estudiar YA'; texto = 'Estás atrasado/a respecto del plan. Reordená los días y empezá por lo más importante.';
    }
    return { nivel, ico: nivel === 'verde' ? '🟢' : nivel === 'amarillo' ? '🟡' : '🔴', titulo, texto, pct: cumplido, falta, hdia, diasFalta };
  }

  // ---------- catálogo (temas por unidad) ----------
  async function cargarCatalogo() {
    if (S.catalogo._ok) return;
    try {
      if (!window.PROGRAMA_TEMAS) await cargarScript('js/programaTemas.js');
    } catch (_) {}
    const P = window.PROGRAMA_TEMAS || {};
    ['ginecologia', 'cirugia', 'siam'].forEach((m) => {
      S.catalogo[m] = Object.keys(P[m] || {}).map((k) => ({ id: k, titulo: P[m][k].titulo, temas: P[m][k].temas.slice() }));
    });
    try {
      const r = await fetch('data/pfo_data.json'); const j = await r.json();
      S.catalogo.pfo = (j.units || []).map((u) => ({ id: u.etiqueta || ('Módulo ' + u.number), titulo: u.title, temas: (u.contents || []).map(String) }));
    } catch (_) { S.catalogo.pfo = []; }
    S.catalogo._ok = true;
  }
  function cargarScript(src) {
    return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  function upNumero(id) { const m = String(id || '').match(/(\d+)/); return m ? m[1] : ''; }
  function urlSala(materia, unidad) {
    const M = MATERIAS[materia]; if (!M) return 'campus.html';
    if (materia === 'pfo') return M.sala;
    const n = upNumero(unidad); return M.sala + (n ? '&up=' + n : '');
  }

  // ---------- persistencia ----------
  const claveLocal = () => LS + '_' + (S.user ? S.user.id : 'anon');
  function leerLocal() { try { return JSON.parse(localStorage.getItem(claveLocal()) || '[]'); } catch (_) { return []; } }
  function guardarLocal() { try { localStorage.setItem(claveLocal(), JSON.stringify(S.planes)); } catch (_) {} }
  function aFila(p) {
    const { id, titulo, materia, fecha_examen, creado_en, actualizado_en, ...datos } = p;
    return { id, user_id: S.user.id, titulo, materia, fecha_examen, datos, actualizado_en: actualizado_en || new Date().toISOString() };
  }
  function deFila(r) { return Object.assign({ id: r.id, titulo: r.titulo, materia: r.materia, fecha_examen: r.fecha_examen, creado_en: r.creado_en, actualizado_en: r.actualizado_en }, r.datos || {}); }
  async function cargarNube() {
    const c = db(); if (!c || !S.user) return;
    try {
      const { data, error } = await c.from('planes_examen').select('*').eq('user_id', S.user.id);
      if (error) throw error;
      S.nube = true;
      const remotos = (data || []).map(deFila), mapa = {};
      S.planes.forEach((p) => { mapa[p.id] = p; });
      remotos.forEach((r) => { const l = mapa[r.id]; if (!l || String(r.actualizado_en) >= String(l.actualizado_en || '')) mapa[r.id] = r; });
      S.planes = Object.keys(mapa).map((k) => mapa[k]);
      guardarLocal();
      // lo que solo existía en este dispositivo se sube
      const ids = new Set(remotos.map((r) => r.id));
      S.planes.filter((p) => !ids.has(p.id)).forEach(subir);
    } catch (e) { S.nube = false; }
  }
  async function subir(p) {
    if (!S.nube || !S.user) return;
    try { const { error } = await db().from('planes_examen').upsert(aFila(p)); if (error) throw error; } catch (_) { S.nube = false; }
  }
  function guardar(p) {
    if (p) p.actualizado_en = new Date().toISOString();
    guardarLocal();
    if (p) { clearTimeout(tSubida); tSubida = setTimeout(() => subir(p), 700); }
  }
  async function borrarNube(id) { if (!S.nube) return; try { await db().from('planes_examen').delete().eq('id', id).eq('user_id', S.user.id); } catch (_) {} }

  // ---------- calendario_eventos ----------
  async function crearEvento(p) {
    const c = db(); if (!c || !S.user) return null;
    try {
      const up = p.unidades && p.unidades[0] ? 'up' + upNumero(p.unidades[0]) : null;
      const { data, error } = await c.from('calendario_eventos').insert({ user_id: S.user.id, titulo: p.titulo, tipo: 'examen', modulo: p.materia, up_id: up, fecha: p.fecha_examen }).select('id').single();
      if (error) throw error; return data && data.id;
    } catch (_) { return null; }
  }
  async function moverEvento(p) {
    const c = db(); if (!c || !S.user || !p.evento_id) return;
    try { await c.from('calendario_eventos').update({ fecha: p.fecha_examen, titulo: p.titulo }).eq('id', p.evento_id).eq('user_id', S.user.id); } catch (_) {}
  }
  async function borrarEvento(p) {
    const c = db(); if (!c || !S.user || !p.evento_id) return;
    try { await c.from('calendario_eventos').delete().eq('id', p.evento_id).eq('user_id', S.user.id); } catch (_) {}
  }

  // ---------- generación del plan ----------
  function generarDias(w) {
    const catalogo = (S.catalogo[w.materia] || []).filter((u) => w.unidades.includes(u.id));
    const temas = [];
    catalogo.forEach((u) => u.temas.forEach((t) => temas.push({ texto: t, unidad: u.id, utitulo: u.titulo, manual: false })));
    String(w.extra || '').split('\n').map((s) => s.trim()).filter(Boolean).forEach((t) => temas.push({ texto: t, unidad: 'Mis temas', utitulo: 'Temas propios', manual: true }));
    const fechas = []; for (let f = w.inicio; f < w.fecha_examen; f = sumaDias(f, 1)) fechas.push(f);
    if (fechas.length < 1) return null;
    const horasDe = (f) => { const g = aFecha(f).getDay(); return (g === 0 || g === 6) ? w.horasFS : w.horasLV; };
    const estudio = fechas.length > 1 ? fechas.slice(0, -1) : fechas;
    const cap = estudio.map(horasDe), capTot = cap.reduce((a, b) => a + b, 0) || 1;
    const dias = estudio.map((f, i) => ({ id: uid(), fecha: f, titulo: '', horas: cap[i], unidad: '', caso: '', temas: [], checklist: [], datos_duros: [], agenda: [], notas: '' }));
    let acum = 0, di = 0, limites = [];
    cap.forEach((c) => { acum += c; limites.push(acum / capTot); });
    temas.forEach((t, k) => {
      const frac = (k + 0.5) / Math.max(1, temas.length);
      while (di < dias.length - 1 && frac > limites[di]) di++;
      dias[di].temas.push({ id: uid(), texto: t.texto, prio: 'media', detalle: '', trampa: '', hecho: false, manual: t.manual, unidad: t.unidad });
    });
    dias.forEach((d, i) => {
      const us = []; d.temas.forEach((t) => { if (t.unidad && us.indexOf(t.unidad) < 0) us.push(t.unidad); });
      d.unidad = us.join(' + ');
      const prim = d.temas[0];
      d.titulo = prim ? (prim.texto.length > 70 ? prim.texto.slice(0, 68) + '…' : prim.texto) + (d.temas.length > 1 ? ` y ${d.temas.length - 1} más` : '') : 'Repaso y práctica';
      d.checklist = [{ id: uid(), texto: 'Resolver preguntas del Choice de lo estudiado hoy', hecho: false }, { id: uid(), texto: 'Anotar y repasar lo que fallé', hecho: false }];
      if (i >= 2) d.checklist.push({ id: uid(), texto: 'Repaso corto de lo de ayer, de memoria', hecho: false });
    });
    // último día: integración
    const ultimo = fechas.length > 1 ? fechas[fechas.length - 1] : null;
    if (ultimo) dias.push({ id: uid(), fecha: ultimo, titulo: 'Integración y simulacro', horas: horasDe(ultimo), unidad: 'Integración', caso: '', datos_duros: [], agenda: [], notas: '',
      temas: [{ id: uid(), texto: 'Repasar tus datos duros y tablas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' },
              { id: uid(), texto: 'Simulacro de choices con tiempo', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' }],
      checklist: [{ id: uid(), texto: 'Justificar en voz alta las opciones falsas', hecho: false }, { id: uid(), texto: 'Preparar lo que necesito para el día del examen', hecho: false }] });
    return dias;
  }
  function planDesdeWizard(w) {
    const dias = generarDias(w);
    if (!dias) return null;
    return { id: uid(), titulo: w.titulo, materia: w.materia, fecha_examen: w.fecha_examen, unidades: w.unidades.slice(), inicio: w.inicio, evento_id: null,
      dias, creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() };
  }

  // ---------- render ----------
  function anillo(p, size) {
    const pct = Math.round(p * 100);
    return `<div class="pe-ring" style="--p:${pct};--s:${size || 64}px"><i>${pct}%</i></div>`;
  }
  function chipSemaforo(r) { return `<span class="pe-sem pe-sem--${r.nivel}">${r.ico} ${esc(r.titulo)}</span>`; }
  function cuentaAtras(p) {
    const n = difDias(p.fecha_examen, hoyISO());
    if (n < 0) return { n: 0, t: 'Rendido', cls: 'fin' };
    if (n === 0) return { n: 0, t: '¡Es hoy!', cls: 'hoy' };
    return { n, t: n === 1 ? 'día' : 'días', cls: n <= 3 ? 'urg' : '' };
  }

  function render() {
    if (!root) return;
    if (S.wiz) root.innerHTML = vistaWizard();
    else if (S.plan) root.innerHTML = vistaPlan();
    else root.innerHTML = vistaHub();
    animarEntrada();
  }
  function animarEntrada() {
    root.querySelectorAll('.pe-rv').forEach((el, i) => { el.style.animationDelay = Math.min(i * 40, 400) + 'ms'; });
    root.querySelectorAll('.pe-bar > i').forEach((b) => { const w = b.dataset.w; b.style.width = '0'; requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = w; })); });
  }

  function vistaHub() {
    const ord = S.planes.slice().sort((a, b) => a.fecha_examen.localeCompare(b.fecha_examen));
    const hoy = hoyISO();
    const activos = ord.filter((p) => p.fecha_examen >= hoy), pasados = ord.filter((p) => p.fecha_examen < hoy);
    const tarjeta = (p) => {
      const M = MATERIAS[p.materia] || MATERIAS.pfo, r = ritmo(p), c = cuentaAtras(p), prog = progresoPlan(p);
      return `<article class="pe-card pe-plan pe-rv" data-act="abrir" data-id="${p.id}" tabindex="0" style="--m:${M.color}">
        <div class="pe-plan-top"><span class="pe-mat">${M.ico} ${esc(M.corto)}</span>${chipSemaforo(r)}</div>
        <h3>${esc(p.titulo)}</h3>
        <p class="pe-sub">${fmtLarga(p.fecha_examen)} · ${p.dias.length} días · ${fmtH(horasPlan(p))}</p>
        <div class="pe-plan-foot">
          ${anillo(prog, 58)}
          <div class="pe-count ${c.cls}"><b>${c.n || (c.cls === 'hoy' ? '🎯' : '✓')}</b><span>${esc(c.t)}</span></div>
        </div>
      </article>`;
    };
    return `<section class="pe-hero pe-rv">
        <div class="pe-hero-ico">🗓️</div>
        <div>
          <span class="pe-eyebrow">NikaPlan · Gratis para todos</span>
          <h1>Prepará tu examen</h1>
          <p>Armá tu plan día a día hasta el parcial o el final, con todas las unidades que entran. Tildá lo que estudiás y NikaPlan te avisa si vas a llegar.</p>
        </div>
        <div class="pe-hero-cta">
          <button type="button" class="pe-btn pe-btn--pri" data-act="nuevo">✨ Nuevo plan de examen</button>
          <button type="button" class="pe-btn" data-act="importar">📥 Importar plan</button>
          <input type="file" id="pe-file" accept="application/json,.json" hidden>
        </div>
      </section>
      ${!S.nube && S.user ? '<div class="pe-aviso pe-rv">💾 Tus planes se guardan en este dispositivo. Se sincronizan con tu cuenta cuando el servicio esté disponible.</div>' : ''}
      ${activos.length ? `<h2 class="pe-h2 pe-rv">Próximos exámenes</h2><div class="pe-grid">${activos.map(tarjeta).join('')}</div>` :
        `<div class="pe-vacio pe-rv"><div class="pe-vacio-ico">🧭</div><h3>Todavía no tenés ningún plan</h3><p>Creá el primero en menos de un minuto: elegís la materia, las unidades y la fecha, y NikaPlan reparte los temas por día.</p><button type="button" class="pe-btn pe-btn--pri" data-act="nuevo">Crear mi primer plan</button></div>`}
      ${pasados.length ? `<h2 class="pe-h2 pe-rv">Anteriores</h2><div class="pe-grid pe-grid--past">${pasados.map(tarjeta).join('')}</div>` : ''}`;
  }

  // ---- asistente de creación
  function nuevoWizard(parcial) {
    const hoy = hoyISO();
    S.wiz = Object.assign({ paso: 1, materia: null, unidades: [], extra: '', titulo: '', fecha_examen: sumaDias(hoy, 16), inicio: hoy, horasLV: 4, horasFS: 3 }, parcial || {});
    S.plan = null; render();
  }
  function vistaWizard() {
    const w = S.wiz, M = w.materia ? MATERIAS[w.materia] : null;
    const pasos = ['Materia', 'Unidades', 'Fechas y ritmo'];
    const barra = `<ol class="pe-steps">${pasos.map((t, i) => `<li class="${w.paso === i + 1 ? 'on' : w.paso > i + 1 ? 'ok' : ''}"><i>${w.paso > i + 1 ? '✓' : i + 1}</i><span>${t}</span></li>`).join('')}</ol>`;
    let cuerpo = '';
    if (w.paso === 1) {
      cuerpo = `<h2 class="pe-h2">¿Qué materia vas a rendir?</h2><div class="pe-grid pe-grid--mat">${Object.keys(MATERIAS).map((k) => {
        const m = MATERIAS[k], n = (S.catalogo[k] || []).length;
        return `<button type="button" class="pe-card pe-mat-card pe-rv ${w.materia === k ? 'on' : ''}" data-act="materia" data-m="${k}" style="--m:${m.color}"><span class="pe-mat-ico">${m.ico}</span><b>${esc(m.nombre)}</b><small>${n} unidades</small></button>`; }).join('')}</div>`;
    } else if (w.paso === 2) {
      const cat = S.catalogo[w.materia] || [];
      cuerpo = `<h2 class="pe-h2">¿Qué unidades entran en el examen?</h2>
        <p class="pe-sub">Podés marcar una o varias. Un parcial integrador suele abarcar más de una unidad.</p>
        <div class="pe-units">${cat.map((u) => { const on = w.unidades.includes(u.id);
          return `<label class="pe-unit pe-rv ${on ? 'on' : ''}"><input type="checkbox" data-act="unidad" data-u="${esc(u.id)}" ${on ? 'checked' : ''}><span class="pe-box">✓</span><span class="pe-unit-t"><b>${esc(u.id)}</b> · ${esc(u.titulo)}<small>${u.temas.length} temas</small></span></label>`; }).join('')}</div>
        <div class="pe-field"><label for="pe-extra">Temas propios (opcional, uno por línea)</label>
          <textarea id="pe-extra" data-act="extra" rows="3" placeholder="Si algo que te toman no está en el programa, agregalo acá">${esc(w.extra)}</textarea></div>`;
    } else {
      cuerpo = `<h2 class="pe-h2">Fechas y ritmo de estudio</h2>
        <div class="pe-form">
          <div class="pe-field"><label for="pe-titulo">Nombre del plan</label><input id="pe-titulo" data-act="titulo" value="${esc(w.titulo || ('Parcial · ' + (M ? M.corto : '')))}" maxlength="80"></div>
          <div class="pe-field"><label for="pe-fex">Fecha del examen</label><input type="date" id="pe-fex" data-act="fex" value="${w.fecha_examen}" min="${sumaDias(hoyISO(), 1)}"></div>
          <div class="pe-field"><label for="pe-ini">Empiezo a estudiar</label><input type="date" id="pe-ini" data-act="ini" value="${w.inicio}" min="${hoyISO()}"></div>
          <div class="pe-field"><label for="pe-hlv">Horas por día (lunes a viernes)</label><input type="number" id="pe-hlv" data-act="hlv" value="${w.horasLV}" min="0.5" max="16" step="0.5"></div>
          <div class="pe-field"><label for="pe-hfs">Horas por día (sábado y domingo)</label><input type="number" id="pe-hfs" data-act="hfs" value="${w.horasFS}" min="0" max="16" step="0.5"></div>
        </div>
        <div class="pe-resumen" id="pe-resumen">${resumenWizard()}</div>`;
    }
    const sig = w.paso < 3 ? `<button type="button" class="pe-btn pe-btn--pri" data-act="sig" ${w.paso === 1 && !w.materia ? 'disabled' : ''}>Siguiente →</button>` : `<button type="button" class="pe-btn pe-btn--pri" data-act="crear">🚀 Crear mi plan</button>`;
    return `<div class="pe-wiz">
      <button type="button" class="pe-link" data-act="hub">← Mis planes</button>
      ${barra}${cuerpo}
      <div class="pe-wiz-foot">${w.paso > 1 ? '<button type="button" class="pe-btn" data-act="ant">← Atrás</button>' : '<span></span>'}${sig}</div>
    </div>`;
  }
  function resumenWizard() {
    const w = S.wiz; if (!w.materia) return '';
    const cat = (S.catalogo[w.materia] || []).filter((u) => w.unidades.includes(u.id));
    const nTemas = cat.reduce((a, u) => a + u.temas.length, 0) + String(w.extra || '').split('\n').filter((s) => s.trim()).length;
    const dias = difDias(w.fecha_examen, w.inicio);
    if (dias < 1) return '<span class="pe-warn">Elegí una fecha de examen posterior a la de inicio.</span>';
    let h = 0; for (let i = 0; i < dias - 1; i++) { const g = aFecha(sumaDias(w.inicio, i)).getDay(); h += (g === 0 || g === 6) ? w.horasFS : w.horasLV; }
    const hd = dias > 1 ? h / (dias - 1) : 0;
    return `<div class="pe-res-grid"><div><b>${dias}</b><span>días hasta el examen</span></div><div><b>${nTemas}</b><span>temas a repartir</span></div><div><b>${Math.round(h)}</b><span>horas de estudio</span></div><div><b>${nTemas ? (nTemas / Math.max(1, dias - 1)).toFixed(1).replace('.', ',') : '0'}</b><span>temas por día</span></div></div>
      <p class="pe-sub">El último día queda para integración y simulacro.${hd && nTemas / Math.max(1, hd) > 6 ? ' ⚠️ Son muchos temas por hora: considerá sumar horas o días.' : ''}</p>`;
  }

  // ---- plan
  function vistaPlan() {
    const p = S.plan, M = MATERIAS[p.materia] || MATERIAS.pfo, r = ritmo(p), c = cuentaAtras(p);
    const hechos = p.dias.filter((d) => estadoDia(d) === 'listo').length;
    const tabs = [['agenda', '📋', 'Agenda'], ['hoy', '🎯', 'Hoy'], ['tabla', '🗃️', 'Tabla'], ['calendario', '📅', 'Calendario']];
    let cuerpo;
    if (S.vista === 'tabla') cuerpo = vistaTabla(p);
    else if (S.vista === 'calendario') cuerpo = vistaCalendario(p);
    else cuerpo = vistaAgenda(p, S.vista === 'hoy');
    return `<div class="pe-plan-view" style="--m:${M.color}">
      <button type="button" class="pe-link" data-act="hub">← Mis planes</button>
      <header class="pe-plan-head pe-rv">
        <div class="pe-plan-info">
          <span class="pe-mat">${M.ico} ${esc(M.nombre)}</span>
          <h1 id="pe-titulo-h" ${''}>${esc(p.titulo)}</h1>
          <p class="pe-sub">${fmtLarga(p.fecha_examen)} · ${(p.unidades || []).map(esc).join(', ') || 'Temas propios'}</p>
          <div class="pe-plan-kpis">
            <div class="pe-kpi"><b>${hechos}/${p.dias.length}</b><span>días completos</span></div>
            <div class="pe-kpi"><b>${fmtH(horasHechas(p))}</b><span>de ${fmtH(horasPlan(p))}</span></div>
            <div class="pe-kpi"><b>${r.falta != null ? fmtH(r.falta) : '—'}</b><span>por hacer</span></div>
          </div>
        </div>
        <div class="pe-plan-side">
          <div class="pe-count pe-count--big ${c.cls}"><b>${c.n || (c.cls === 'hoy' ? '🎯' : '✓')}</b><span>${esc(c.t)}${c.n ? ' para el examen' : ''}</span></div>
          ${anillo(progresoPlan(p), 84)}
        </div>
      </header>
      <div class="pe-alerta pe-alerta--${r.nivel} pe-rv" role="status"><span class="pe-alerta-ico">${r.ico}</span><div><b>${esc(r.titulo)}</b><p>${esc(r.texto)}${r.hdia && r.nivel !== 'verde' ? ` Te quedan ${fmtH(r.falta)} en ${r.diasFalta} ${r.diasFalta === 1 ? 'día' : 'días'} (unas ${fmtH(r.hdia)} por día).` : ''}</p></div></div>
      <nav class="pe-tabs pe-rv" role="tablist">${tabs.map((t) => `<button type="button" role="tab" class="${S.vista === t[0] ? 'on' : ''}" data-act="vista" data-v="${t[0]}"><span>${t[1]}</span> ${t[2]}</button>`).join('')}
        <span class="pe-tabs-sp"></span>
        <button type="button" class="pe-mini" data-act="editar" title="Cambiar nombre o fecha del examen">⚙️ Ajustes</button>
      </nav>
      ${cuerpo}
    </div>`;
  }

  function diaCard(p, d, abierto) {
    const pr = progresoDia(d), est = estadoDia(d), hoy = hoyISO();
    const cls = ['pe-dia', 'pe-rv', 'est-' + est, d.fecha === hoy ? 'es-hoy' : '', d.fecha < hoy && est !== 'listo' ? 'atrasado' : '', abierto ? 'abierto' : ''].filter(Boolean).join(' ');
    const n = p.dias.indexOf(d) + 1;
    const estTxt = est === 'listo' ? '✅ Listo' : est === 'curso' ? '⏳ En curso' : (d.fecha < hoy ? '⚠️ Atrasado' : '⚪ Sin empezar');
    return `<article class="${cls}" id="dia-${d.id}">
      <button type="button" class="pe-dia-head" data-act="dia" data-d="${d.id}" aria-expanded="${abierto ? 'true' : 'false'}">
        <span class="pe-dia-n">${n}</span>
        <span class="pe-dia-t"><b>${esc(d.titulo || 'Día de estudio')}</b><small>${fmtCorta(d.fecha)}${d.fecha === hoy ? ' · HOY' : ''} · ${fmtH(d.horas || 0)}${d.unidad ? ' · ' + esc(d.unidad) : ''}</small></span>
        <span class="pe-dia-est">${estTxt}</span>
        <span class="pe-bar"><i data-w="${Math.round(pr * 100)}%"></i></span>
        <span class="pe-chev">▾</span>
      </button>
      ${abierto ? detalleDia(p, d) : ''}
    </article>`;
  }

  function detalleDia(p, d) {
    const filaTema = (t) => `<li class="pe-item ${t.hecho ? 'ok' : ''}" data-t="${t.id}">
        <label><input type="checkbox" data-act="tema" data-d="${d.id}" data-t="${t.id}" ${t.hecho ? 'checked' : ''}><span class="pe-box">✓</span>
          <span class="pe-item-t">${esc(t.texto)}${t.detalle ? `<small>${esc(t.detalle)}</small>` : ''}${t.trampa ? `<small class="trampa">⚠️ Trampa de choice: ${esc(t.trampa)}</small>` : ''}</span></label>
        <span class="pe-prio" style="--c:${(PRIO[t.prio] || PRIO.media).c}" data-act="prio" data-d="${d.id}" data-t="${t.id}" title="Cambiar prioridad">${(PRIO[t.prio] || PRIO.media).t}</span>
        ${t.manual ? '<span class="pe-prop" title="Tema agregado por vos">✎</span>' : ''}
        <button type="button" class="pe-x" data-act="quitar-tema" data-d="${d.id}" data-t="${t.id}" aria-label="Quitar tema">✕</button>
      </li>`;
    const filaCheck = (c) => `<li class="pe-item ${c.hecho ? 'ok' : ''}">
        <label><input type="checkbox" data-act="check" data-d="${d.id}" data-t="${c.id}" ${c.hecho ? 'checked' : ''}><span class="pe-box">✓</span><span class="pe-item-t">${esc(c.texto)}</span></label>
        <button type="button" class="pe-x" data-act="quitar-check" data-d="${d.id}" data-t="${c.id}" aria-label="Quitar">✕</button></li>`;
    return `<div class="pe-dia-body">
      ${d.caso ? `<div class="pe-caso"><b>🧪 Caso tipo para resolver al final del día</b><p>${esc(d.caso)}</p></div>` : ''}
      <h4>Temas del día</h4>
      <ul class="pe-items">${(d.temas || []).map(filaTema).join('') || '<li class="pe-vacio-li">Todavía no hay temas en este día.</li>'}</ul>
      <div class="pe-add"><input type="text" data-add="tema" data-d="${d.id}" placeholder="Agregar un tema (si no está en el programa, escribilo)" maxlength="140"><button type="button" class="pe-btn pe-btn--sm" data-act="add-tema" data-d="${d.id}">＋ Agregar</button></div>
      <h4>Checklist de cierre</h4>
      <ul class="pe-items">${(d.checklist || []).map(filaCheck).join('') || '<li class="pe-vacio-li">Sin tareas de cierre.</li>'}</ul>
      <div class="pe-add"><input type="text" data-add="check" data-d="${d.id}" placeholder="Agregar una tarea de cierre" maxlength="140"><button type="button" class="pe-btn pe-btn--sm" data-act="add-check" data-d="${d.id}">＋ Agregar</button></div>
      ${(d.datos_duros || []).length ? `<h4>📌 Datos duros</h4><ul class="pe-datos">${d.datos_duros.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${(d.agenda || []).length ? `<h4>🕒 Agenda del día</h4><ul class="pe-datos">${d.agenda.map((a) => `<li><b>${esc(a.bloque || '')}</b> ${a.horas ? '· ' + esc(a.horas) : ''} — ${esc(a.tarea || '')}</li>`).join('')}</ul>` : ''}
      <h4>Notas</h4>
      <textarea class="pe-notas" data-act="notas" data-d="${d.id}" rows="2" placeholder="Anotá dudas, errores o lo que te falta repasar">${esc(d.notas || '')}</textarea>
      <div class="pe-dia-acc">
        <label class="pe-mini-f">Fecha <input type="date" data-act="fecha" data-d="${d.id}" value="${d.fecha}"></label>
        <label class="pe-mini-f">Horas <input type="number" data-act="horas" data-d="${d.id}" value="${d.horas || 0}" min="0" max="16" step="0.5"></label>
        <a class="pe-btn pe-btn--sm" href="${urlSala(p.materia, (d.temas[0] && d.temas[0].unidad) || (p.unidades || [])[0])}">📚 Ir a la sala de estudio</a>
        <a class="pe-btn pe-btn--sm" href="campus.html">🩺 Simuladores</a>
        <button type="button" class="pe-btn pe-btn--sm pe-btn--ok" data-act="completar" data-d="${d.id}">✔ Marcar el día completo</button>
      </div>
    </div>`;
  }

  function vistaAgenda(p, soloHoy) {
    const hoy = hoyISO();
    let lista = p.dias;
    if (soloHoy) {
      const h = p.dias.filter((d) => d.fecha === hoy);
      if (!h.length) {
        const prox = p.dias.find((d) => d.fecha > hoy);
        return `<div class="pe-vacio pe-rv"><div class="pe-vacio-ico">☕</div><h3>Hoy no tenés día de estudio</h3><p>${prox ? `Tu próximo día es el ${fmtLarga(prox.fecha)}.` : 'No hay más días en este plan.'}</p></div>`;
      }
      lista = h;
    }
    if (S.diaId == null) { const a = p.dias.find((d) => d.fecha >= hoy && estadoDia(d) !== 'listo') || p.dias[0]; S.diaId = a ? a.id : null; }
    return `<div class="pe-agenda">${lista.map((d) => diaCard(p, d, d.id === S.diaId)).join('')}
      <button type="button" class="pe-btn pe-btn--add" data-act="nuevo-dia">＋ Agregar un día</button></div>`;
  }

  function vistaTabla(p) {
    const f = S.filtro;
    const pasa = (d) => f === 'todos' || estadoDia(d) === f || (f === 'atras' && d.fecha < hoyISO() && estadoDia(d) !== 'listo');
    const filas = p.dias.map((d, i) => ({ d, i })).filter((x) => pasa(x.d));
    const chip = (k, t) => `<button type="button" class="pe-fchip ${f === k ? 'on' : ''}" data-act="filtro" data-f="${k}">${t}</button>`;
    return `<div class="pe-tabla-wrap pe-rv">
      <div class="pe-filtros">${chip('todos', 'Todos')}${chip('nuevo', '⚪ Sin empezar')}${chip('curso', '⏳ En curso')}${chip('listo', '✅ Listos')}${chip('atras', '⚠️ Atrasados')}</div>
      <div class="pe-tabla-scroll"><table class="pe-tabla">
        <thead><tr><th>#</th><th>Fecha</th><th>Tema principal</th><th>Unidad</th><th>Prioridad</th><th>Horas</th><th>Estado</th><th>Progreso</th></tr></thead>
        <tbody>${filas.map(({ d, i }) => {
          const pr = (d.temas || []).reduce((m, t) => ['alta', 'media', 'sec'].indexOf(t.prio) < ['alta', 'media', 'sec'].indexOf(m) ? t.prio : m, 'sec');
          const est = estadoDia(d), P = PRIO[pr] || PRIO.media, hoy = hoyISO();
          return `<tr data-act="dia-tabla" data-d="${d.id}" tabindex="0">
            <td>${i + 1}</td><td class="nowrap">${fmtCorta(d.fecha)}</td><td><b>${esc(d.titulo)}</b></td><td>${esc(d.unidad || '—')}</td>
            <td><span class="pe-prio" style="--c:${P.c}">${P.t}</span></td><td>${fmtH(d.horas || 0)}</td>
            <td><span class="pe-est est-${est}${d.fecha < hoy && est !== 'listo' ? ' atrasado' : ''}">${est === 'listo' ? 'Listo' : est === 'curso' ? 'En curso' : d.fecha < hoy ? 'Atrasado' : 'Sin empezar'}</span></td>
            <td><span class="pe-bar"><i data-w="${Math.round(progresoDia(d) * 100)}%"></i></span></td></tr>`; }).join('') || '<tr><td colspan="8" class="pe-vacio-li">No hay días con este filtro.</td></tr>'}</tbody>
      </table></div></div>`;
  }

  function vistaCalendario(p) {
    const ref = S.mes || aFecha(p.dias[0] ? p.dias[0].fecha : p.fecha_examen);
    const y = ref.getFullYear(), m = ref.getMonth();
    const primero = new Date(y, m, 1), nDias = new Date(y, m + 1, 0).getDate(), off = (primero.getDay() + 6) % 7;   // semana desde lunes
    const mapa = {}; p.dias.forEach((d) => { mapa[d.fecha] = d; });
    const hoy = hoyISO();
    let celdas = ''; for (let i = 0; i < off; i++) celdas += '<div class="pe-cal-c vacio"></div>';
    for (let n = 1; n <= nDias; n++) {
      const f = iso(new Date(y, m, n)), d = mapa[f], ex = f === p.fecha_examen;
      const est = d ? estadoDia(d) : '';
      celdas += `<div class="pe-cal-c ${d ? 'con-dia est-' + est : ''} ${f === hoy ? 'hoy' : ''} ${ex ? 'examen' : ''}" ${d ? `data-act="dia-tabla" data-d="${d.id}" tabindex="0"` : ''}>
        <span class="pe-cal-n">${n}</span>${ex ? '<span class="pe-cal-tag">📝 Examen</span>' : ''}
        ${d ? `<span class="pe-cal-tit">${esc((d.titulo || '').slice(0, 34))}</span><span class="pe-cal-h">${fmtH(d.horas || 0)} · ${Math.round(progresoDia(d) * 100)}%</span>` : ''}</div>`;
    }
    return `<div class="pe-cal pe-rv">
      <div class="pe-cal-head"><button type="button" class="pe-mini" data-act="mes" data-n="-1">‹</button><b>${MESES[m][0].toUpperCase() + MESES[m].slice(1)} ${y}</b><button type="button" class="pe-mini" data-act="mes" data-n="1">›</button></div>
      <div class="pe-cal-grid"><div class="pe-cal-d">Lun</div><div class="pe-cal-d">Mar</div><div class="pe-cal-d">Mié</div><div class="pe-cal-d">Jue</div><div class="pe-cal-d">Vie</div><div class="pe-cal-d">Sáb</div><div class="pe-cal-d">Dom</div>${celdas}</div>
    </div>`;
  }

  // ---------- acciones ----------
  function planActual() { return S.plan; }
  function buscarDia(id) { return S.plan && S.plan.dias.find((d) => d.id === id); }
  function celebrar(el) {
    if (!el) return;
    const em = ['🎉', '✨', '💜', '⭐', '🩺'];
    const c = document.createElement('div'); c.className = 'pe-confetti';
    for (let i = 0; i < 14; i++) { const s = document.createElement('i'); s.textContent = em[i % em.length]; s.style.left = (10 + Math.random() * 80) + '%'; s.style.setProperty('--x', (Math.random() * 120 - 60) + 'px'); s.style.setProperty('--r', (Math.random() * 360) + 'deg'); s.style.animationDelay = (Math.random() * .2) + 's'; c.appendChild(s); }
    el.appendChild(c); setTimeout(() => c.remove(), 1700);
  }
  function refrescarProgreso(dia, el) {
    // actualiza cabecera, semáforo y barra sin redibujar toda la vista (así no se corta la animación del tilde)
    const p = S.plan, r = ritmo(p);
    const alerta = root.querySelector('.pe-alerta');
    if (alerta) {
      const antes = alerta.className;
      alerta.className = `pe-alerta pe-alerta--${r.nivel}`;
      alerta.querySelector('.pe-alerta-ico').textContent = r.ico;
      alerta.querySelector('b').textContent = r.titulo;
      alerta.querySelector('p').textContent = r.texto + (r.hdia && r.nivel !== 'verde' ? ` Te quedan ${fmtH(r.falta)} en ${r.diasFalta} ${r.diasFalta === 1 ? 'día' : 'días'} (unas ${fmtH(r.hdia)} por día).` : '');
      if (antes !== alerta.className) { alerta.classList.remove('pe-pulso'); void alerta.offsetWidth; alerta.classList.add('pe-pulso'); }
    }
    const ring = root.querySelector('.pe-plan-side .pe-ring'); if (ring) { const pct = Math.round(progresoPlan(p) * 100); ring.style.setProperty('--p', pct); ring.querySelector('i').textContent = pct + '%'; }
    const k = root.querySelectorAll('.pe-kpi b');
    if (k.length === 3) { k[0].textContent = p.dias.filter((d) => estadoDia(d) === 'listo').length + '/' + p.dias.length; k[1].textContent = fmtH(horasHechas(p)); k[2].textContent = r.falta != null ? fmtH(r.falta) : '—'; }
    if (dia) {
      const card = root.querySelector('#dia-' + dia.id);
      if (card) {
        const est = estadoDia(dia);
        card.classList.remove('est-nuevo', 'est-curso', 'est-listo'); card.classList.add('est-' + est);
        const b = card.querySelector('.pe-bar > i'); if (b) b.style.width = Math.round(progresoDia(dia) * 100) + '%';
        const t = card.querySelector('.pe-dia-est'); if (t) t.textContent = est === 'listo' ? '✅ Listo' : est === 'curso' ? '⏳ En curso' : '⚪ Sin empezar';
      }
    }
  }
  function enc(id) { return root.querySelector('[data-t="' + id + '"]'); }

  async function abrirPlan(id) {
    const p = S.planes.find((x) => x.id === id); if (!p) return;
    S.plan = p; S.vista = 'agenda'; S.diaId = null; S.mes = null; S.wiz = null;
    try { history.replaceState(null, '', location.pathname + '?plan=' + encodeURIComponent(id)); } catch (_) {}
    render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function volverHub() {
    S.plan = null; S.wiz = null;
    try { history.replaceState(null, '', location.pathname); } catch (_) {}
    render();
  }

  async function crearDesdeWizard() {
    const w = S.wiz;
    if (!w.materia) return toast('Elegí una materia');
    if (!w.unidades.length && !String(w.extra || '').trim()) return toast('Elegí al menos una unidad o agregá un tema');
    if (difDias(w.fecha_examen, w.inicio) < 1) return toast('La fecha del examen tiene que ser posterior al inicio');
    const p = planDesdeWizard(w);
    if (!p) return toast('No se pudo armar el plan con esas fechas');
    p.titulo = (w.titulo || '').trim() || `Examen · ${MATERIAS[w.materia].corto}`;
    p.evento_id = await crearEvento(p);
    S.planes.push(p); guardar(p);
    S.wiz = null; S.plan = p; S.vista = 'agenda'; S.diaId = null;
    try { history.replaceState(null, '', location.pathname + '?plan=' + encodeURIComponent(p.id)); } catch (_) {}
    render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(p.evento_id ? '📅 Plan creado y examen agendado en tu calendario' : '📅 Plan creado');
  }

  function importarJSON(texto) {
    let j; try { j = JSON.parse(texto); } catch (_) { return toast('El archivo no es un plan válido'); }
    const lista = Array.isArray(j) ? j : [j];
    let n = 0;
    lista.forEach((x) => {
      if (!x || !Array.isArray(x.dias) || !x.fecha_examen) return;
      const p = Object.assign({}, x, { id: uid(), materia: MATERIAS[x.materia] ? x.materia : 'ginecologia', titulo: x.titulo || 'Plan importado', evento_id: null,
        creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString(), unidades: x.unidades || [], inicio: x.inicio || (x.dias[0] && x.dias[0].fecha) });
      p.dias = x.dias.map((d) => Object.assign({ horas: 0, temas: [], checklist: [], datos_duros: [], agenda: [], notas: '', caso: '', unidad: '' }, d, { id: uid(),
        temas: (d.temas || []).map((t) => Object.assign({ prio: 'media', hecho: false, manual: false, detalle: '', trampa: '' }, t, { id: uid() })),
        checklist: (d.checklist || []).map((c) => Object.assign({ hecho: false }, c, { id: uid() })) }));
      S.planes.push(p); guardar(p); crearEvento(p).then((id) => { if (id) { p.evento_id = id; guardar(p); } }); n++;
    });
    if (!n) return toast('No encontré ningún plan en ese archivo');
    toast(n === 1 ? '📥 Plan importado' : `📥 ${n} planes importados`); render();
  }

  function exportarPlan() {
    const p = S.plan; if (!p) return;
    const blob = new Blob([JSON.stringify(p, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nikaplan-' + (p.titulo || 'plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.json';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function modalAjustes() {
    const p = S.plan; if (!p) return;
    const m = document.createElement('div'); m.className = 'pe-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="pe-modal-c"><h3>⚙️ Ajustes del plan</h3>
      <div class="pe-field"><label for="aj-t">Nombre</label><input id="aj-t" value="${esc(p.titulo)}" maxlength="80"></div>
      <div class="pe-field"><label for="aj-f">Fecha del examen</label><input type="date" id="aj-f" value="${p.fecha_examen}"></div>
      <div class="pe-modal-acc"><button type="button" class="pe-btn pe-btn--pri" data-m="guardar">Guardar</button>
        <button type="button" class="pe-btn" data-m="exportar">📤 Exportar</button>
        <button type="button" class="pe-btn pe-btn--peligro" data-m="borrar">🗑️ Eliminar plan</button>
        <button type="button" class="pe-btn" data-m="cerrar">Cerrar</button></div></div>`;
    document.body.appendChild(m);
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', esc); };
    const esc2 = (e) => { if (e.key === 'Escape') cerrar(); }; const esc = esc2; document.addEventListener('keydown', esc2);
    m.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-m]');
      if (e.target === m || (b && b.dataset.m === 'cerrar')) return cerrar();
      if (!b) return;
      if (b.dataset.m === 'guardar') {
        const t = m.querySelector('#aj-t').value.trim(), f = m.querySelector('#aj-f').value;
        if (t) p.titulo = t;
        if (f) p.fecha_examen = f;
        guardar(p); moverEvento(p); cerrar(); render(); toast('Plan actualizado');
      } else if (b.dataset.m === 'exportar') exportarPlan();
      else if (b.dataset.m === 'borrar') {
        if (!confirm('¿Eliminar este plan? Se borra también el examen del calendario.')) return;
        S.planes = S.planes.filter((x) => x.id !== p.id); guardarLocal(); borrarNube(p.id); borrarEvento(p);
        cerrar(); volverHub(); toast('Plan eliminado');
      }
    });
  }

  // ---------- eventos de la interfaz ----------
  function onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, p = S.plan;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
    switch (a) {
      case 'nuevo': return nuevoWizard();
      case 'hub': return volverHub();
      case 'abrir': return abrirPlan(el.dataset.id);
      case 'importar': { const f = root.querySelector('#pe-file'); if (f) f.click(); return; }
      case 'materia': S.wiz.materia = el.dataset.m; S.wiz.unidades = []; S.wiz.titulo = ''; return render();
      case 'sig': {
        if (S.wiz.paso === 2 && !S.wiz.unidades.length && !String(S.wiz.extra || '').trim()) return toast('Elegí al menos una unidad');
        S.wiz.paso = Math.min(3, S.wiz.paso + 1); return render();
      }
      case 'ant': S.wiz.paso = Math.max(1, S.wiz.paso - 1); return render();
      case 'crear': return crearDesdeWizard();
      case 'vista': S.vista = el.dataset.v; return render();
      case 'editar': return modalAjustes();
      case 'filtro': S.filtro = el.dataset.f; return render();
      case 'mes': { const base = S.mes || aFecha(p.dias[0] ? p.dias[0].fecha : p.fecha_examen); S.mes = new Date(base.getFullYear(), base.getMonth() + (+el.dataset.n), 1); return render(); }
      case 'dia': { const id = el.dataset.d; S.diaId = (S.diaId === id) ? '' : id; return render(); }
      case 'dia-tabla': S.vista = 'agenda'; S.diaId = el.dataset.d; render(); { const c = root.querySelector('#dia-' + el.dataset.d); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return;
      case 'prio': { const d = buscarDia(el.dataset.d); const t = d && d.temas.find((x) => x.id === el.dataset.t); if (!t) return; const o = ['alta', 'media', 'sec']; t.prio = o[(o.indexOf(t.prio) + 1) % 3]; guardar(p); return render(); }
      case 'quitar-tema': { const d = buscarDia(el.dataset.d); if (!d) return; d.temas = d.temas.filter((x) => x.id !== el.dataset.t); guardar(p); return render(); }
      case 'quitar-check': { const d = buscarDia(el.dataset.d); if (!d) return; d.checklist = d.checklist.filter((x) => x.id !== el.dataset.t); guardar(p); return render(); }
      case 'add-tema': case 'add-check': {
        const d = buscarDia(el.dataset.d); const inp = root.querySelector(`[data-add="${a === 'add-tema' ? 'tema' : 'check'}"][data-d="${el.dataset.d}"]`);
        const v = inp && inp.value.trim(); if (!d || !v) return;
        if (a === 'add-tema') d.temas.push({ id: uid(), texto: v, prio: 'media', detalle: '', trampa: '', hecho: false, manual: true, unidad: d.unidad || '' });
        else d.checklist.push({ id: uid(), texto: v, hecho: false });
        guardar(p); S.diaId = d.id; return render();
      }
      case 'completar': {
        const d = buscarDia(el.dataset.d); if (!d) return;
        const todo = itemsDia(d).every((x) => x.hecho);
        itemsDia(d).forEach((x) => { x.hecho = !todo; });
        guardar(p); S.diaId = d.id; render(); if (!todo) celebrar(root.querySelector('#dia-' + d.id)); return;
      }
      case 'nuevo-dia': {
        const ult = p.dias.length ? p.dias[p.dias.length - 1].fecha : hoyISO();
        let f = sumaDias(ult, 1); if (f >= p.fecha_examen) f = sumaDias(p.fecha_examen, -1);
        const d = { id: uid(), fecha: f, titulo: 'Día extra de repaso', horas: 3, unidad: '', caso: '', temas: [], checklist: [{ id: uid(), texto: 'Repasar lo que fallé', hecho: false }], datos_duros: [], agenda: [], notas: '' };
        p.dias.push(d); p.dias.sort((x, y) => x.fecha.localeCompare(y.fecha)); guardar(p); S.diaId = d.id; return render();
      }
    }
  }
  function onChange(e) {
    const el = e.target, a = el.dataset && el.dataset.act; if (!a) return;
    const p = S.plan;
    if (a === 'unidad') {
      const u = el.dataset.u; const w = S.wiz;
      w.unidades = el.checked ? w.unidades.concat(u).filter((x, i, arr) => arr.indexOf(x) === i) : w.unidades.filter((x) => x !== u);
      el.closest('.pe-unit').classList.toggle('on', el.checked); return;
    }
    if (a === 'tema' || a === 'check') {
      const d = buscarDia(el.dataset.d); if (!d) return;
      const it = (a === 'tema' ? d.temas : d.checklist).find((x) => x.id === el.dataset.t); if (!it) return;
      const antes = estadoDia(d);
      it.hecho = el.checked; guardar(p);
      const fila = el.closest('.pe-item'); if (fila) fila.classList.toggle('ok', el.checked);
      refrescarProgreso(d);
      if (antes !== 'listo' && estadoDia(d) === 'listo') { celebrar(root.querySelector('#dia-' + d.id)); toast('🎉 ¡Día completo!'); }
      return;
    }
    if (a === 'fecha') { const d = buscarDia(el.dataset.d); if (d && el.value) { d.fecha = el.value; p.dias.sort((x, y) => x.fecha.localeCompare(y.fecha)); guardar(p); render(); } return; }
    if (a === 'horas') { const d = buscarDia(el.dataset.d); if (d) { d.horas = Math.max(0, num(el.value)); guardar(p); refrescarProgreso(d); } return; }
    if (a === 'notas') { const d = buscarDia(el.dataset.d); if (d) { d.notas = el.value; guardar(p); } return; }
    if (a === 'fex') { S.wiz.fecha_examen = el.value; actualizarResumen(); return; }
    if (a === 'ini') { S.wiz.inicio = el.value; actualizarResumen(); return; }
    if (a === 'hlv') { S.wiz.horasLV = Math.max(0.5, num(el.value, 4)); actualizarResumen(); return; }
    if (a === 'hfs') { S.wiz.horasFS = Math.max(0, num(el.value, 3)); actualizarResumen(); return; }
    if (a === 'titulo') { S.wiz.titulo = el.value; return; }
    if (a === 'extra') { S.wiz.extra = el.value; return; }
  }
  function actualizarResumen() { const r = root.querySelector('#pe-resumen'); if (r) r.innerHTML = resumenWizard(); }
  function onInput(e) {
    const el = e.target;
    if (el.dataset && el.dataset.act === 'extra') S.wiz.extra = el.value;
    if (el.dataset && el.dataset.act === 'titulo') S.wiz.titulo = el.value;
  }
  function onKey(e) {
    const el = e.target;
    if (e.key === 'Enter' && el.dataset && el.dataset.add) {
      e.preventDefault();
      const b = root.querySelector(`[data-act="${el.dataset.add === 'tema' ? 'add-tema' : 'add-check'}"][data-d="${el.dataset.d}"]`); if (b) b.click();
    } else if ((e.key === 'Enter' || e.key === ' ') && el.matches && el.matches('.pe-plan[data-act], tr[data-act], .pe-cal-c[data-act]')) { e.preventDefault(); el.click(); }
  }

  // ---------- arranque ----------
  async function iniciar() {
    root = document.getElementById('pe-root'); if (!root) return;
    root.innerHTML = '<div class="pe-cargando"><span></span><p>Cargando tus planes…</p></div>';
    try { if (window.NikaAuth && window.NikaAuth.ready) await window.NikaAuth.ready; } catch (_) {}
    try { const c = db(); const { data } = c ? await c.auth.getUser() : { data: {} }; S.user = data && data.user; } catch (_) {}
    if (!S.user) {
      try { const cu = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (cu && cu.id) S.user = { id: cu.id }; } catch (_) {}
    }
    if (!S.user) { root.innerHTML = '<div class="pe-vacio"><div class="pe-vacio-ico">🔒</div><h3>Iniciá sesión</h3><p>Entrá a tu cuenta desde el campus para armar tus planes.</p><a class="pe-btn pe-btn--pri" href="campus.html">Ir al campus</a></div>'; return; }
    S.planes = leerLocal();
    await cargarCatalogo();
    await cargarNube();
    root.addEventListener('click', onClick); root.addEventListener('change', onChange); root.addEventListener('input', onInput); root.addEventListener('keydown', onKey);
    root.addEventListener('change', (e) => { if (e.target.id === 'pe-file' && e.target.files[0]) { const r = new FileReader(); r.onload = () => importarJSON(String(r.result)); r.readAsText(e.target.files[0]); e.target.value = ''; } });
    const q = new URLSearchParams(location.search);
    if (q.get('plan') && S.planes.some((p) => p.id === q.get('plan'))) abrirPlan(q.get('plan'));
    else if (q.get('nuevo')) nuevoWizard({ materia: MATERIAS[q.get('materia')] ? q.get('materia') : null, fecha_examen: q.get('fecha') || undefined, paso: MATERIAS[q.get('materia')] ? 2 : 1 });
    else render();
  }
  window.NikaPlan = { iniciar, _estado: S, ritmo, planesDe: () => S.planes };
  document.addEventListener('DOMContentLoaded', iniciar);
})();
