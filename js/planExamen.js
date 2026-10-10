/* NikaPlan · Prepará tu examen
   Plan de estudio día a día hasta un examen (uno o varios temas/unidades), con agenda, checklist con
   progreso, semáforo de ritmo y vistas Agenda / Tabla / Calendario. Gratis para todos.
   Guarda en el dispositivo (localStorage) y sincroniza con la tabla "planes_examen" de Supabase cuando existe.
   Se enlaza con "calendario_eventos": cada plan puede vincularse al examen que ya agendaste. */
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
  const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const H_POR_TEMA = 3;   // referencia orientativa: lectura + datos duros + práctica de un tema (un plan de 16 días suele rondar 2 a 3 h por tema)

  const S = { user: null, planes: [], plan: null, vista: 'agenda', diaId: null, wiz: null, nube: false, catalogo: {}, filtro: 'todos', mes: null, admin: false, examenes: [] };
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
  const redond05 = (x) => Math.round(x * 2) / 2;
  const toast = (m) => { try { (window.showToast || alert)(m); } catch (_) {} };
  const db = () => window.NikaSupabase?.client || window.NikaSupabase?.supabase || window.supabaseClient || window.supabase;
  // color de la cuenta regresiva: verde con tiempo de sobra → amarillo → rojo a 3 días o menos
  const colorDias = (n) => { const h = n <= 3 ? 0 : n >= 21 ? 160 : Math.round((n - 3) / 18 * 160); return `hsl(${h} 88% 52%)`; };

  // ---------- progreso y ritmo ----------
  function itemsDia(d) { return (d.temas || []).concat(d.checklist || []); }
  function progresoDia(d) { const it = itemsDia(d); if (!it.length) return 0; return it.filter((x) => x.hecho).length / it.length; }
  function estadoDia(d) { const p = progresoDia(d); return p >= 1 ? 'listo' : p > 0 ? 'curso' : 'nuevo'; }
  function horasPlan(p) { return p.dias.reduce((a, d) => a + (d.horas || 0), 0); }
  // horas realmente hechas de un día: lo que marcó en el checklist o lo que estudió con el Pomodoro, lo que sea mayor
  function horasHechasDia(d) { const h = d.horas || 0; return Math.max(h * progresoDia(d), Math.min(h, d.estudiado || 0)); }
  function horasHechas(p) { return p.dias.reduce((a, d) => a + horasHechasDia(d), 0); }
  const horasPomodoro = (p) => p.dias.reduce((a, d) => a + (d.estudiado || 0), 0);
  function progresoPlan(p) { const h = horasPlan(p); return h ? horasHechas(p) / h : 0; }

  // Semáforo: compara lo cumplido con lo que debería estar hecho hasta ayer y mira cuánto falta por día.
  function ritmo(p) {
    const hoy = hoyISO(), total = horasPlan(p), hechas = horasHechas(p);
    const vencidas = p.dias.filter((d) => d.fecha < hoy).reduce((a, d) => a + (d.horas || 0), 0);
    const hechasVenc = p.dias.filter((d) => d.fecha < hoy).reduce((a, d) => a + horasHechasDia(d), 0);
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
    if (cumplido >= 0.85 && hdia <= prom * 1.25) { nivel = 'verde'; titulo = 'Venís a buen ritmo'; texto = 'Así vamos a llegar al examen. Sostené el plan.'; }
    else if (cumplido >= 0.55 && hdia <= prom * 1.8) { nivel = 'amarillo'; titulo = 'Te falta estudiar un poco más'; texto = 'Con un poco más por día vamos a llegar. Priorizá los temas de prioridad alta.'; }
    else { nivel = 'rojo'; titulo = 'Necesitamos estudiar YA'; texto = 'Estás atrasado/a respecto del plan. Reordená los días y empezá por lo más importante.'; }
    return { ...base, nivel, ico: nivel === 'verde' ? '🟢' : nivel === 'amarillo' ? '🟡' : '🔴', titulo, texto, pct: cumplido, hdia };
  }

  // ---------- catálogo (temas por unidad) ----------
  async function cargarCatalogo() {
    if (S.catalogo._ok) return;
    try { if (!window.PROGRAMA_TEMAS) await cargarScript('js/programaTemas.js'); } catch (_) {}
    const P = window.PROGRAMA_TEMAS || {};
    ['ginecologia', 'cirugia', 'siam'].forEach((m) => {
      S.catalogo[m] = Object.keys(P[m] || {}).map((k) => ({ id: k, titulo: P[m][k].titulo, temas: P[m][k].temas.slice() }));
    });
    try {
      const r = await fetch('data/pfo_data.json'); const j = await r.json();
      S.catalogo.pfo = (j.units || []).map((u) => ({ id: u.etiqueta || ('Módulo ' + u.number), titulo: u.title, temas: (u.contents || []).map(String) }));
    } catch (_) { S.catalogo.pfo = []; }
    try {
      const nombres = ['gineco_integrador_up1_3', 'gineco_final_up1_4', 'cirugia_parcial1_up1_5', 'cirugia_parcial2_up6_11', 'cirugia_final_up1_11', 'siam_parcial1_up1_5', 'siam_parcial2_up6_9', 'siam_final_up1_9'];
      S.plantillas = (await Promise.all(nombres.map((n) => fetch('data/planes/' + n + '.json').then((r) => (r.ok ? r.json() : null)).catch(() => null)))).filter(Boolean);
    } catch (_) { S.plantillas = []; }
    S.catalogo._ok = true;
  }
  const plantillaDe = (materia) => (S.plantillas || []).filter((t) => t.materia === materia);
  const plantillaPorId = (id) => (S.plantillas || []).find((t) => t.id === id) || null;
  function cargarScript(src) { return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function upNumero(id) { const m = String(id || '').match(/(\d+)/); return m ? m[1] : ''; }
  function urlSala(materia, unidad) {
    const M = MATERIAS[materia]; if (!M) return 'campus.html';
    if (materia === 'pfo') return M.sala;
    const n = upNumero(unidad); return M.sala + (n ? '&up=' + n : '');
  }
  const unidadCat = (materia, id) => (S.catalogo[materia] || []).find((u) => u.id === id) || null;

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
      const ids = new Set(remotos.map((r) => r.id));
      S.planes.filter((p) => !ids.has(p.id)).forEach(subir);
      remotos.forEach((r) => { const l = S.planes.find((x) => x.id === r.id); if (l && String(l.actualizado_en || '') > String(r.actualizado_en || '')) subir(l); });
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
  async function cargarExamenes() {
    const c = db(); if (!c || !S.user) return;
    try {
      const { data, error } = await c.from('calendario_eventos').select('id, titulo, tipo, modulo, up_id, fecha').eq('user_id', S.user.id).eq('tipo', 'examen').gte('fecha', hoyISO()).order('fecha', { ascending: true });
      if (error) throw error;
      S.examenes = data || [];
    } catch (_) { S.examenes = []; }
  }
  const eventoPorId = (id) => S.examenes.find((e) => e.id === id) || null;
  function eventoCoincidente(p) {
    // un examen del calendario que ya esté libre (sin plan) el mismo día y de la misma materia
    return S.examenes.find((e) => e.fecha === p.fecha_examen && (!e.modulo || e.modulo === p.materia) && !S.planes.some((q) => q.id !== p.id && q.evento_id === e.id)) || null;
  }
  const planDeEvento = (evId) => S.planes.find((p) => p.evento_id === evId) || null;
  async function crearEvento(p) {
    const c = db(); if (!c || !S.user) return null;
    try {
      const up = p.unidades && p.unidades[0] ? 'up' + upNumero(p.unidades[0]) : null;
      const { data, error } = await c.from('calendario_eventos').insert({ user_id: S.user.id, titulo: p.titulo, tipo: 'examen', modulo: p.materia, up_id: up, fecha: p.fecha_examen }).select('id').single();
      if (error) throw error;
      p.evento_propio = true;
      return data && data.id;
    } catch (_) { return null; }
  }
  // Vincula con el examen que ya está en el calendario (si hay) o agenda uno nuevo. Nunca duplica.
  async function vincularOCrearEvento(p, eventoId) {
    const ya = (eventoId && eventoPorId(eventoId)) || eventoCoincidente(p);
    if (ya) { p.evento_id = ya.id; p.evento_propio = false; return ya; }
    const id = await crearEvento(p);
    if (id) { p.evento_id = id; await cargarExamenes(); }
    return null;
  }
  async function moverEvento(p) {
    const c = db(); if (!c || !S.user || !p.evento_id) return;
    try { await c.from('calendario_eventos').update({ fecha: p.fecha_examen }).eq('id', p.evento_id).eq('user_id', S.user.id); } catch (_) {}
  }
  async function borrarEventoPorId(id) {
    const c = db(); if (!c || !S.user || !id) return;
    try { await c.from('calendario_eventos').delete().eq('id', id).eq('user_id', S.user.id); } catch (_) {}
  }
  // Limpia duplicados que pudo dejar una versión anterior: planes idénticos y exámenes repetidos creados por NikaPlan.
  async function limpiarDuplicados() {
    let cambios = false, quitados = 0;
    const vistos = new Map();
    S.planes.slice().forEach((p) => {
      const k = [p.titulo, p.fecha_examen, p.materia, (p.dias || []).length].join('|'), o = vistos.get(k);
      if (!o) { vistos.set(k, p); return; }
      const keep = progresoPlan(p) > progresoPlan(o) ? p : o, drop = keep === p ? o : p;
      if (!keep.evento_id && drop.evento_id) keep.evento_id = drop.evento_id;
      vistos.set(k, keep);
      S.planes = S.planes.filter((x) => x.id !== drop.id); borrarNube(drop.id); cambios = true; quitados++;
    });
    for (const p of S.planes) {
      const ev = p.evento_id && eventoPorId(p.evento_id); if (!ev) continue;
      const otro = S.examenes.find((e) => e.id !== ev.id && e.fecha === ev.fecha && e.modulo === ev.modulo && e.titulo !== p.titulo && !S.planes.some((q) => q.evento_id === e.id));
      if (otro && ev.titulo === p.titulo) {   // el examen repetido lo había creado NikaPlan con el nombre del plan
        await borrarEventoPorId(ev.id); p.evento_id = otro.id; p.evento_propio = false; guardar(p); cambios = true; quitados++;
      }
    }
    if (cambios) { guardarLocal(); await cargarExamenes(); }
    return quitados;
  }

  // ---------- generación del plan ----------
  // horas de estudio que pide el contenido: en la guía sugerida, lo que la guía asigna a sus temas; si no, ~H_POR_TEMA por tema
  function horasNecesariasWiz(w) {
    if (w.plantilla) { const T = plantillaPorId(w.plantilla); if (T) return T.dias.slice(0, -1).reduce((a, d) => a + (d.horas || 0), 0); }
    return nTemasWiz(w) * H_POR_TEMA;
  }
  function nTemasWiz(w) {
    if (w.plantilla) { const T = plantillaPorId(w.plantilla); if (T) return T.dias.slice(0, -1).reduce((a, d) => a + (d.temas || []).length, 0); }
    const cat = (S.catalogo[w.materia] || []).filter((u) => w.unidades.includes(u.id));
    return cat.reduce((a, u) => a + u.temas.length, 0) + String(w.extra || '').split('\n').filter((s) => s.trim()).length;
  }
  function fechasWiz(w) { const f = []; for (let x = w.inicio; x < w.fecha_examen; x = sumaDias(x, 1)) f.push(x); return f; }
  // días de estudio efectivos: sin día de descanso; los últimos "repaso" días son de integración
  function planDeFechas(w) {
    let fechas = fechasWiz(w);
    if (w.descanso >= 0) { const sin = fechas.filter((f) => aFecha(f).getDay() !== w.descanso); if (sin.length >= 2) fechas = sin; }
    const nRep = Math.min(Math.max(0, w.repaso), Math.max(0, fechas.length - 1));
    return { nuevos: fechas.slice(0, fechas.length - nRep), repaso: fechas.slice(fechas.length - nRep), todos: fechas };
  }
  const horasDeFecha = (w, f) => { const g = aFecha(f).getDay(); return (g === 0 || g === 6) ? w.horasFS : w.horasLV; };
  function recomendar(w) {
    const T = nTemasWiz(w), pf = planDeFechas(w);
    const nEst = Math.max(1, pf.nuevos.length), total = Math.max(6, horasNecesariasWiz(w));
    return { T, nEst, total, h: Math.min(10, Math.max(2, redond05(total / nEst))) };
  }
  const KW_ALTA = /diagn|tratamiento|criterio|clasificaci|algoritmo|urgenc|hemorrag|emergenc|conducta|complicaci|eclamps|ect[óo]pic|infecci|c[áa]ncer|neoplas|tamizaje|screening|shock|trauma|s[íi]ndrome|abdomen agudo|control prenatal|parto|anticoncep|vph|sangrado|dolor/i;
  const KW_APOYO = /generalidades|anatom|histolog|fisiolog|epidemiolog|historia cl|introducci|conceptos|salud integral de la mujer en el curso/i;
  const prioSugerida = (t) => (KW_ALTA.test(t) ? 'alta' : KW_APOYO.test(t) ? 'sec' : 'media');
  function agendaDe(h) {
    const m = Math.max(0.5, redond05(h * 0.45)), t = Math.max(0.5, redond05(h * 0.40)), n = Math.max(0.5, redond05(h - m - t));
    return [
      { bloque: 'Bloque 1 · Mañana', horas: fmtH(m), tarea: 'Lectura comprensiva e integración fisiopatológica de los temas del día.' },
      { bloque: 'Bloque 2 · Tarde', horas: fmtH(t), tarea: 'Memorización de datos duros, criterios y algoritmos; armá un cuadro comparativo.' },
      { bloque: 'Bloque 3 · Noche', horas: fmtH(n), tarea: 'Choices del día y justificación escrita de las opciones falsas.' },
    ];
  }
  function generarDias(w) {
    const cat = (S.catalogo[w.materia] || []).filter((u) => w.unidades.includes(u.id));
    const temas = [];
    cat.forEach((u) => u.temas.forEach((t) => temas.push({ texto: t, unidad: u.id, manual: false })));
    String(w.extra || '').split('\n').map((s) => s.trim()).filter(Boolean).forEach((t) => temas.push({ texto: t, unidad: 'Mis temas', manual: true }));
    const pf = planDeFechas(w);
    if (!pf.todos.length) return null;
    const nuevos = pf.nuevos.length ? pf.nuevos : pf.todos;
    const cap = nuevos.map((f) => horasDeFecha(w, f)), capTot = cap.reduce((a, b) => a + b, 0) || 1;
    const dias = nuevos.map((f, i) => ({ id: uid(), fecha: f, titulo: '', horas: cap[i], unidad: '', caso: '', temas: [], checklist: [], datos_duros: [], agenda: [], notas: '' }));
    // Cada tema ocupa ~H_POR_TEMA horas de estudio: con más horas por día se terminan antes y sobran días de repaso.
    // Si el tiempo no alcanza, se comprime parejo para que entren todos.
    const necesarias = temas.length * H_POR_TEMA;
    const escala = necesarias <= capTot ? 1 : capTot / necesarias;
    const limites = []; { let a = 0; cap.forEach((c) => { a += c; limites.push(a); }); }
    let di = 0;
    temas.forEach((t, k) => {
      const medio = (k + 0.5) * H_POR_TEMA * escala;
      while (di < dias.length - 1 && medio > limites[di]) di++;
      dias[di].temas.push({ id: uid(), texto: t.texto, prio: t.manual ? 'alta' : prioSugerida(t.texto), detalle: '', trampa: '', hecho: false, manual: t.manual, unidad: t.unidad });
    });
    // la carga del día es lo que realmente piden sus temas (hasta lo que el usuario puede estudiar): lo que sobra es tiempo libre
    dias.forEach((d, i) => { d.horas = d.temas.length ? Math.max(0.5, Math.min(cap[i], redond05(d.temas.length * H_POR_TEMA * escala))) : Math.min(cap[i], 4); });
    // unidad principal de cada día y numeración de las partes (UP 1 · parte 1/2, parte 2/2)
    const principal = (d) => (d.temas[0] ? d.temas[0].unidad : '');
    const totalPorUnidad = {}; dias.forEach((d) => { const u = principal(d); if (u) totalPorUnidad[u] = (totalPorUnidad[u] || 0) + 1; });
    const vistas = {};
    const tituloUnidad = (id) => { const u = (S.catalogo[w.materia] || []).find((x) => x.id === id); return u ? u.titulo : (id === 'Mis temas' ? 'Temas propios' : id); };
    dias.forEach((d, i) => {
      const us = []; d.temas.forEach((t) => { if (t.unidad && us.indexOf(t.unidad) < 0) us.push(t.unidad); });
      d.unidad = us.join(' + ');
      const u = principal(d);
      if (u) {
        vistas[u] = (vistas[u] || 0) + 1;
        d.titulo = `${u} · ${tituloUnidad(u)}` + (totalPorUnidad[u] > 1 ? ` (parte ${vistas[u]} de ${totalPorUnidad[u]})` : '');
        d.caso = `Al final del día, resolvé un caso o una consigna integradora de ${u}: planteá el diagnóstico, los diferenciales y la conducta, y explicalo en voz alta como en el examen.`;
      } else {   // sin temas nuevos: ya se terminó el contenido, el día queda para repasar
        d.titulo = 'Repaso integrador'; d.unidad = 'Integración';
        d.temas = [{ id: uid(), texto: 'Repasar tus datos duros y tablas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' },
                   { id: uid(), texto: 'Resolver choices de las unidades más flojas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' }];
      }
      d.agenda = agendaDe(d.horas);
      d.checklist = [
        { id: uid(), texto: `Resolver preguntas del Choice de ${u || 'lo estudiado'} y anotar las que fallé`, hecho: false },
        { id: uid(), texto: 'Escribir los datos duros del día (cifras, criterios, algoritmos) en una hoja', hecho: false },
        { id: uid(), texto: 'Justificar en voz alta por qué las otras opciones son falsas', hecho: false },
      ];
      if (i >= 2) d.checklist.push({ id: uid(), texto: 'Repaso corto de lo de ayer, de memoria', hecho: false });
    });
    if (pf.nuevos.length) pf.repaso.forEach((f, i) => {
      const ult = i === pf.repaso.length - 1;
      dias.push({ id: uid(), fecha: f, titulo: ult ? 'Integración y simulacro' : 'Repaso integrador', horas: Math.min(horasDeFecha(w, f), 5), unidad: 'Integración', caso: ult ? 'Simulacro cronometrado de choices de todo el examen y corrección con justificación de cada opción falsa.' : '', datos_duros: [], agenda: agendaDe(Math.min(horasDeFecha(w, f), 5)), notas: '',
        temas: [{ id: uid(), texto: 'Repasar tus datos duros y tablas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' },
                { id: uid(), texto: ult ? 'Simulacro de choices con tiempo' : 'Resolver choices de las unidades más flojas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' }],
        checklist: [{ id: uid(), texto: 'Justificar en voz alta las opciones falsas', hecho: false }, { id: uid(), texto: ult ? 'Dejar listo lo del día del examen' : 'Repasar los errores acumulados', hecho: false }] });
    });
    const ultimo = dias[dias.length - 1];
    if (ultimo && ultimo.unidad === 'Integración') {
      ultimo.titulo = 'Integración y simulacro';
      if (!ultimo.caso) ultimo.caso = 'Simulacro cronometrado de choices de todo el examen y corrección con justificación de cada opción falsa.';
    }
    return dias;
  }

  // Estimación: con el ritmo elegido, ¿cuándo terminás los temas y cuántos días de repaso te quedan?
  function estimarWiz(w) {
    const T = nTemasWiz(w), necesarias = horasNecesariasWiz(w), pf = planDeFechas(w);
    const dias = pf.nuevos.length ? pf.nuevos : pf.todos;   // los días de repaso que reservó el usuario no cuentan para estudiar temas nuevos
    let acum = 0, idx = -1;
    for (let i = 0; i < dias.length; i++) { acum += horasDeFecha(w, dias[i]); if (acum >= necesarias) { idx = i; break; } }
    const diasEst = dias.length;
    // horas por día necesarias para dejarte 3 días de repaso
    const conRepaso = Math.max(1, diasEst - 3);
    return { T, necesarias, alcanza: idx >= 0, fin: idx >= 0 ? dias[idx] : null, diasUsados: idx + 1, diasRepaso: idx >= 0 ? pf.todos.length - (idx + 1) : 0,
      falta: idx >= 0 ? 0 : necesarias - acum, hParaRepaso: redond05(necesarias / conRepaso), diasEst };
  }

  // Guía sugerida (plantilla): trae los TEMAS, prioridades, trampas, datos duros y casos de la guía, pero las horas
  // salen de lo que el usuario puede estudiar. Cada tema pesa lo que la guía le asigna y se reparte por la capacidad de
  // cada día; si estudia más, termina antes y le sobran días de repaso.
  function planDesdePlantilla(w) {
    const T = plantillaPorId(w.plantilla); if (!T) return null;
    const pf = planDeFechas(Object.assign({}, w, { repaso: Math.max(1, w.repaso) })); if (!pf.todos.length) return null;
    const nuevos = pf.nuevos.length ? pf.nuevos : pf.todos;
    // el último día de la guía es la integración/simulacro: va al final del plan del usuario
    const contenido = T.dias.slice(0, -1), cierre = T.dias[T.dias.length - 1];
    const items = [];   // cada tema con su peso en horas y el día de la guía del que viene
    contenido.forEach((d, di) => {
      const n = Math.max(1, (d.temas || []).length), peso = (d.horas || 0) / n;
      (d.temas || []).forEach((t, k) => items.push({ t, d, di, peso: peso || H_POR_TEMA, ultimo: k === (d.temas || []).length - 1 }));
    });
    const cap = nuevos.map((f) => horasDeFecha(w, f)), capTot = cap.reduce((a, b) => a + b, 0) || 1;
    const necesarias = items.reduce((a, x) => a + x.peso, 0);
    const escala = necesarias <= capTot ? 1 : capTot / necesarias;
    const limites = []; { let a = 0; cap.forEach((c) => { a += c; limites.push(a); }); }
    const dias = nuevos.map((f, i) => ({ id: uid(), fecha: f, titulo: '', horas: cap[i], unidad: '', caso: '', temas: [], checklist: [], datos_duros: [], agenda: [], notas: '', _src: [] }));
    let di = 0, acum = 0;
    items.forEach((x) => {
      const medio = (acum + x.peso * escala / 2); acum += x.peso * escala;
      while (di < dias.length - 1 && medio > limites[di]) di++;
      const dia = dias[di];
      dia.temas.push(Object.assign({ prio: 'media', detalle: '', trampa: '', manual: false }, x.t, { id: uid(), hecho: false, unidad: x.t.unidad || x.d.unidad }));
      dia._carga = (dia._carga || 0) + x.peso * escala;
      if (dia._src.indexOf(x.di) < 0) dia._src.push(x.di);
      // el caso tipo y los datos duros de un día de la guía llegan al día donde termina de verse ese bloque
      if (x.ultimo) {
        if (x.d.caso && !dia.caso) dia.caso = x.d.caso;
        (x.d.datos_duros || []).forEach((dd) => dia.datos_duros.push(dd));
        (x.d.checklist || []).forEach((c) => dia.checklist.push({ id: uid(), texto: c.texto, hecho: false }));
      }
    });
    dias.forEach((d, i) => { d.horas = d._carga ? Math.max(0.5, Math.min(cap[i], redond05(d._carga))) : Math.min(cap[i], 4); delete d._carga; });
    // títulos, unidad y agenda de cada día
    const partes = {}; dias.forEach((d) => d._src.forEach((s) => { partes[s] = (partes[s] || 0) + 1; }));
    const visto = {};
    dias.forEach((d, i) => {
      if (!d.temas.length) {   // el contenido ya terminó: día de repaso
        d.titulo = 'Repaso integrador'; d.unidad = 'Integración';
        d.temas = [{ id: uid(), texto: 'Repasar tus datos duros y tablas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' },
                   { id: uid(), texto: 'Resolver choices de las unidades más flojas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' }];
      } else {
        const us = []; d.temas.forEach((t) => { if (t.unidad && us.indexOf(t.unidad) < 0) us.push(t.unidad); });
        d.unidad = us.join(' + ');
        const ps = d._src.map((s) => { visto[s] = (visto[s] || 0) + 1; const n = partes[s]; return contenido[s].titulo + (n > 1 ? ` (parte ${visto[s]} de ${n})` : ''); });
        let tt = ps[0] + (ps.length > 1 ? ` + ${ps.length - 1} más` : '');
        d.titulo = tt.length > 120 ? tt.slice(0, 118) + '…' : tt;
        if (!d.caso) d.caso = `Al final del día, resolvé un caso o una consigna integradora de ${d.unidad.split(' + ')[0]} y explicalo en voz alta como en el examen.`;
      }
      d.agenda = agendaDe(d.horas);
      const base = [{ id: uid(), texto: 'Resolver preguntas del Choice de lo estudiado hoy y anotar las que fallé', hecho: false }];
      d.checklist = d.checklist.concat(base);
      if (i >= 2) d.checklist.push({ id: uid(), texto: 'Repaso corto de lo de ayer, de memoria', hecho: false });
      delete d._src;
    });
    // integración y simulacro final (con los datos de cierre de la guía)
    const ult = dias[dias.length - 1];
    const marcarCierre = (d) => {
      d.titulo = 'Integración y simulacro'; d.unidad = 'Integración';
      if (cierre) {
        d.caso = cierre.caso || d.caso;
        (cierre.datos_duros || []).forEach((dd) => d.datos_duros.push(dd));
        (cierre.checklist || []).forEach((c) => d.checklist.push({ id: uid(), texto: c.texto, hecho: false }));
        (cierre.temas || []).forEach((t) => d.temas.push(Object.assign({ prio: 'alta', detalle: '', trampa: '', manual: false }, t, { id: uid(), hecho: false, unidad: 'Integración' })));
      }
    };
    if (pf.repaso.length && pf.nuevos.length) {
      pf.repaso.forEach((f, i) => {
        const hr = Math.min(horasDeFecha(w, f), 5);
        const d = { id: uid(), fecha: f, titulo: 'Repaso integrador', horas: hr, unidad: 'Integración', caso: '', datos_duros: [], agenda: agendaDe(hr), notas: '',
          temas: [{ id: uid(), texto: 'Repasar tus datos duros y tablas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' },
                  { id: uid(), texto: 'Resolver choices de las unidades más flojas', prio: 'alta', detalle: '', trampa: '', hecho: false, manual: true, unidad: 'Integración' }],
          checklist: [{ id: uid(), texto: 'Repasar los errores acumulados', hecho: false }, { id: uid(), texto: 'Justificar en voz alta las opciones falsas', hecho: false }] };
        dias.push(d);
      });
    }
    marcarCierre(dias[dias.length - 1]);
    return { id: uid(), titulo: w.titulo || T.titulo, materia: T.materia, fecha_examen: w.fecha_examen, unidades: T.unidades.slice(), inicio: w.inicio, evento_id: null, plantilla_id: T.id, practica: T.practica || null,
      dias, creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() };
  }
  function planDesdeWizard(w) {
    if (w.plantilla) return planDesdePlantilla(w);
    const dias = generarDias(w);
    if (!dias) return null;
    return { id: uid(), titulo: w.titulo, materia: w.materia, fecha_examen: w.fecha_examen, unidades: w.unidades.slice(), inicio: w.inicio, evento_id: null,
      dias, creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() };
  }

  // ---------- render ----------
  function anillo(p, size) {
    return `<div class="pe-ring" data-p="${Math.round(p * 100)}" style="--p:0;--s:${size || 64}px"><i data-count="${Math.round(p * 100)}" data-suf="%">0%</i></div>`;
  }
  function chipSemaforo(r) { return `<span class="pe-sem pe-sem--${r.nivel}">${r.ico} ${esc(r.titulo)}</span>`; }
  function cuentaAtras(p) {
    const n = difDias(p.fecha_examen, hoyISO());
    if (n < 0) return { n: 0, t: 'Rendido', cls: 'fin', color: '#94a3b8' };
    if (n === 0) return { n: 0, t: '¡Es hoy!', cls: 'hoy', color: colorDias(0) };
    return { n, t: n === 1 ? 'día' : 'días', cls: n <= 3 ? 'urg' : '', color: colorDias(n) };
  }
  const contador = (c, big) => `<div class="pe-count ${c.cls} ${big ? 'pe-count--big' : ''}" style="--cd:${c.color}"><b ${c.n ? `data-count="${c.n}"` : ''}>${c.n || (c.cls === 'hoy' ? '🎯' : '✓')}</b><span>${esc(c.t)}${c.n && big ? ' para el examen' : ''}</span></div>`;

  function render() {
    if (!root) return;
    if (S.wiz) root.innerHTML = vistaWizard();
    else if (S.plan) root.innerHTML = vistaPlan();
    else root.innerHTML = vistaHub();
    animarEntrada();
  }
  function animarEntrada() {
    root.querySelectorAll('.pe-rv').forEach((el, i) => { el.style.animationDelay = Math.min(i * 45, 450) + 'ms'; });
    root.querySelectorAll('.pe-bar > i').forEach((b) => { const w = b.dataset.w; b.style.width = '0'; requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = w; })); });
    root.querySelectorAll('.pe-ring[data-p]').forEach((r) => requestAnimationFrame(() => requestAnimationFrame(() => r.style.setProperty('--p', r.dataset.p))));
    root.querySelectorAll('[data-count]').forEach((el) => {
      const to = +el.dataset.count, suf = el.dataset.suf || ''; if (!isFinite(to)) return;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to + suf; return; }
      const t0 = performance.now(), dur = 900;
      (function f(now) { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
    });
  }

  // ---- barra de navegación (volver siempre visible)
  function barraNav(migas) {
    const partes = migas.map((m, i) => i < migas.length - 1
      ? `<button type="button" class="pe-miga" data-act="${m.act}">${m.t}</button><span class="pe-sep">›</span>`
      : `<span class="pe-miga on">${m.t}</span>`).join('');
    let act = 'campus', txt = 'Volver al campus';
    if (S.wiz) { act = S.wiz.paso > 1 ? 'ant' : 'hub'; txt = S.wiz.paso > 1 ? 'Paso anterior' : 'Mis planes'; }
    else if (S.plan) { act = 'hub'; txt = 'Mis planes'; }
    return `<div class="pe-navbar pe-rv">
      <button type="button" class="pe-back" data-act="${act}"><span class="pe-back-ico">←</span><span>${esc(txt)}</span></button>
      <nav class="pe-migas" aria-label="Ubicación">${partes}</nav>
    </div>`;
  }

  // ---- hub
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
        <div class="pe-plan-foot">${anillo(prog, 60)}${contador(c)}</div>
        ${p.evento_id && eventoPorId(p.evento_id) ? '<span class="pe-vinc">📅 En tu calendario</span>' : '<span class="pe-vinc no">🔗 Sin vincular a un examen</span>'}
      </article>`;
    };
    const sinPlan = S.examenes.filter((e) => !planDeEvento(e.id));
    const examenCard = (e) => {
      const n = difDias(e.fecha, hoy), M = MATERIAS[e.modulo];
      return `<article class="pe-card pe-exam pe-rv" style="--cd:${colorDias(n)}">
        <div class="pe-exam-d"><b>${n}</b><span>${n === 1 ? 'día' : 'días'}</span></div>
        <div class="pe-exam-i"><h3>📝 ${esc(e.titulo || 'Examen')}</h3><p class="pe-sub">${fmtLarga(e.fecha)}${M ? ' · ' + esc(M.corto) : ''} · Todavía sin plan de estudio</p></div>
        <div class="pe-exam-a"><button type="button" class="pe-btn pe-btn--pri pe-btn--sm" data-act="plan-de-evento" data-e="${e.id}">✨ Armar plan</button>
          ${S.planes.some((p) => !p.evento_id || !eventoPorId(p.evento_id)) ? `<button type="button" class="pe-btn pe-btn--sm" data-act="adjuntar" data-e="${e.id}">📎 Adjuntar plan</button>` : ''}</div>
      </article>`;
    };
    return `${barraNav([{ t: 'Mis planes', act: 'hub' }])}
      <section class="pe-hero pe-rv">
        <span class="pe-stars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <div class="pe-hero-ico">🗓️</div>
        <div class="pe-hero-txt">
          <span class="pe-eyebrow">NikaPlan · Gratis para todos</span>
          <h1>Prepará tu examen</h1>
          <p>Armá tu plan día a día hasta el parcial o el final, con todas las unidades que entran. Tildá lo que estudiás y NikaPlan te avisa si vas a llegar.</p>
        </div>
        <div class="pe-hero-cta">
          <button type="button" class="pe-btn pe-btn--pri" data-act="nuevo">✨ Nuevo plan de examen</button>
          <button type="button" class="pe-btn pe-btn--glass" data-act="guia">📖 Cómo armar un buen plan</button>
          <button type="button" class="pe-btn pe-btn--glass" data-act="modelo">🧭 Ver un plan modelo</button>
          ${S.admin ? '<button type="button" class="pe-btn pe-btn--glass" data-act="importar" title="Solo visible para administradores">📥 Importar plan (admin)</button><input type="file" id="pe-file" accept="application/json,.json" hidden>' : ''}
        </div>
      </section>
      ${!S.nube && S.user ? '<div class="pe-aviso pe-rv">💾 Tus planes se guardan en este dispositivo. Se sincronizan con tu cuenta cuando el servicio esté disponible.</div>' : ''}
      ${sinPlan.length ? `<h2 class="pe-h2 pe-rv">📅 Tus exámenes sin plan</h2><div class="pe-stack">${sinPlan.map(examenCard).join('')}</div>` : ''}
      ${activos.length ? `<h2 class="pe-h2 pe-rv">Mis planes de estudio</h2><div class="pe-grid">${activos.map(tarjeta).join('')}</div>` :
        (sinPlan.length ? '' : `<div class="pe-vacio pe-rv"><div class="pe-vacio-ico">🧭</div><h3>Todavía no tenés ningún plan</h3><p>Creá el primero en menos de un minuto: elegís la materia, las unidades y la fecha, y NikaPlan reparte los temas por día.</p><button type="button" class="pe-btn pe-btn--pri" data-act="nuevo">Crear mi primer plan</button></div>`)}
      ${pasados.length ? `<h2 class="pe-h2 pe-rv">Anteriores</h2><div class="pe-grid pe-grid--past">${pasados.map(tarjeta).join('')}</div>` : ''}`;
  }

  // ---- asistente de creación
  function nuevoWizard(parcial) {
    const hoy = hoyISO();
    S.wiz = Object.assign({ paso: 1, materia: null, unidades: [], extra: '', titulo: '', fecha_examen: sumaDias(hoy, 16), inicio: hoy, horasLV: 4, horasFS: 3, descanso: -1, repaso: 1, auto: true, evento_id: null }, parcial || {});
    S.plan = null; nav(); render();
  }
  function aplicarRecomendado(w, factor) {
    const r = recomendar(w);
    const h = Math.min(24, Math.max(1.5, redond05(r.h * (factor || 1))));
    w.horasLV = h; w.horasFS = Math.max(1, redond05(h * 0.75));
    // el ritmo recomendado tiene que alcanzar de verdad: si por redondeo quedó corto, se sube de a media hora
    if (!factor || factor === 1) { let g = 0; while (!estimarWiz(w).alcanza && w.horasLV < 24 && g++ < 60) { w.horasLV = redond05(w.horasLV + 0.5); w.horasFS = Math.max(1, redond05(w.horasLV * 0.75)); } }
  }
  function vistaWizard() {
    const w = S.wiz, M = w.materia ? MATERIAS[w.materia] : null;
    const pasos = ['Materia', 'Unidades', 'Fechas y ritmo'];
    const barra = `<ol class="pe-steps pe-rv">${pasos.map((t, i) => `<li class="${w.paso === i + 1 ? 'on' : w.paso > i + 1 ? 'ok' : ''}"><i>${w.paso > i + 1 ? '✓' : i + 1}</i><span>${t}</span></li>`).join('')}</ol>`;
    let cuerpo = '';
    if (w.paso === 1) {
      cuerpo = `<h2 class="pe-h2">¿Qué materia vas a rendir?</h2><div class="pe-grid pe-grid--mat">${Object.keys(MATERIAS).map((k) => {
        const m = MATERIAS[k], n = (S.catalogo[k] || []).length;
        return `<button type="button" class="pe-card pe-mat-card pe-rv ${w.materia === k ? 'on' : ''}" data-act="materia" data-m="${k}" style="--m:${m.color}"><span class="pe-mat-ico">${m.ico}</span><b>${esc(m.nombre)}</b><small>${n} unidades</small></button>`; }).join('')}</div>`;
    } else if (w.paso === 2) {
      const cat = S.catalogo[w.materia] || [];
      const todas = cat.length && cat.every((u) => w.unidades.includes(u.id));
      cuerpo = `<h2 class="pe-h2">¿Qué unidades entran en el examen?</h2>
        <p class="pe-sub">Podés marcar una o varias: un parcial integrador suele abarcar más de una unidad. Tocá “¿Qué temas tiene?” para ver el detalle de cada una.</p>
        ${tarjetaPlantilla(w)}
        <div class="pe-tools"><button type="button" class="pe-mini" data-act="todas">${todas ? 'Quitar todas' : 'Marcar todas'}</button><span class="pe-sub" id="pe-contador-u">${w.unidades.length} de ${cat.length} marcadas · ${nTemasWiz(w)} temas</span></div>
        <div class="pe-units">${cat.map((u) => { const on = w.unidades.includes(u.id);
          return `<div class="pe-unit-wrap pe-rv ${on ? 'on' : ''}">
            <label class="pe-unit"><input type="checkbox" data-act="unidad" data-u="${esc(u.id)}" ${on ? 'checked' : ''}><span class="pe-box">✓</span><span class="pe-unit-t"><b>${esc(u.id)}</b> · ${esc(u.titulo)}<small>${u.temas.length} temas</small></span></label>
            <details class="pe-temas"><summary>¿Qué temas tiene esta unidad problema?</summary>
              <ol class="pe-temas-lista">${u.temas.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></details>
          </div>`; }).join('')}</div>
        <div class="pe-field"><label for="pe-extra">Temas propios (opcional, uno por línea)</label>
          <textarea id="pe-extra" data-act="extra" rows="3" placeholder="Si algo que te toman no está en el programa, agregalo acá">${esc(w.extra)}</textarea></div>`;
    } else {
      cuerpo = `<h2 class="pe-h2">Fechas y ritmo de estudio</h2>
        <div class="pe-form">
          <div class="pe-field"><label for="pe-titulo">Nombre del plan</label><input id="pe-titulo" data-act="titulo" value="${esc(w.titulo || ('Parcial · ' + (M ? M.corto : '')))}" maxlength="80"></div>
          <div class="pe-field"><label for="pe-fex">Fecha del examen</label><input type="date" id="pe-fex" data-act="fex" value="${w.fecha_examen}" min="${sumaDias(hoyISO(), 1)}"></div>
          <div class="pe-field"><label for="pe-ini">Empiezo a estudiar</label><input type="date" id="pe-ini" data-act="ini" value="${w.inicio}" min="${hoyISO()}"></div>
        </div>
        ${w.plantilla ? notaPlantilla(w) : ''}
        <div class="pe-config pe-rv">
          <div class="pe-config-h"><b>⏱️ Ritmo de estudio</b><span class="pe-sub">Elegí un ritmo o ajustalo a mano</span></div>
          <div class="pe-presets" id="pe-presets">${presetsHtml(w)}</div>
          <div class="pe-form pe-form--4">
            <div class="pe-field"><label for="pe-hlv">Horas por día (lun a vie)</label><input type="number" id="pe-hlv" data-act="hlv" value="${w.horasLV}" min="0.5" max="24" step="0.5"></div>
            <div class="pe-field"><label for="pe-hfs">Horas por día (sáb y dom)</label><input type="number" id="pe-hfs" data-act="hfs" value="${w.horasFS}" min="0" max="24" step="0.5"></div>
            <div class="pe-field"><label for="pe-desc">Día de descanso</label><select id="pe-desc" data-act="desc"><option value="-1" ${w.descanso < 0 ? 'selected' : ''}>Ninguno</option>${DIAS_LARGO.map((n, i) => `<option value="${i}" ${w.descanso === i ? 'selected' : ''}>${n[0].toUpperCase() + n.slice(1)}</option>`).join('')}</select></div>
            <div class="pe-field"><label for="pe-rep">Días finales de repaso</label><select id="pe-rep" data-act="rep">${[0, 1, 2, 3].map((n) => `<option value="${n}" ${w.repaso === n ? 'selected' : ''}>${n === 0 ? 'Ninguno' : n + (n === 1 ? ' día' : ' días')}</option>`).join('')}</select></div>
          </div>
        </div>
        <div class="pe-resumen" id="pe-resumen">${resumenWizard()}</div>`;
    }
    const sig = w.paso < 3 ? `<button type="button" class="pe-btn pe-btn--pri" data-act="sig" ${w.paso === 1 && !w.materia ? 'disabled' : ''}>Siguiente →</button>` : `<button type="button" class="pe-btn pe-btn--pri pe-btn--lg" data-act="crear">🚀 Crear mi plan</button>`;
    const ev = w.evento_id && eventoPorId(w.evento_id);
    const ctx = ev ? `<div class="pe-ctx pe-rv">📅 Vas a armar el plan para: <b>${esc(ev.titulo || 'tu examen')}</b> · ${fmtLarga(ev.fecha)}. Quedará vinculado a tu calendario.</div>` : '';
    return `${barraNav([{ t: 'Mis planes', act: 'hub' }, { t: 'Nuevo plan', act: '' }])}
      <div class="pe-wiz">${ctx}${barra}${cuerpo}
      <div class="pe-wiz-foot">${w.paso > 1 ? '<button type="button" class="pe-btn" data-act="ant">← Atrás</button>' : '<button type="button" class="pe-btn" data-act="hub">✕ Cancelar</button>'}${sig}</div></div>`;
  }
  function tarjetaPlantilla(w) {
    const ts = plantillaDe(w.materia); if (!ts.length) return '';
    return ts.map((t) => {
      const temas = t.dias.reduce((a, d) => a + (d.temas || []).length, 0), horas = t.dias.reduce((a, d) => a + (d.horas || 0), 0);
      return `<div class="pe-sug pe-rv ${w.plantilla === t.id ? 'on' : ''}">
        <div class="pe-sug-i">📘</div>
        <div class="pe-sug-t"><span class="pe-sug-tag">${t.tipo === 'final' ? 'Guía sugerida · Final (escrito + oral)' : 'Guía sugerida · Parcial'}</span><b>${esc(t.titulo)}</b><small>${esc(t.subtitulo)} · ${t.dias.length} días · ${temas} temas · ${fmtH(horas)}</small>
          <small>${esc(t.descripcion)}</small></div>
        <div class="pe-sug-a">
          <button type="button" class="pe-btn pe-btn--sm" data-act="previa-plantilla" data-id="${esc(t.id)}">👁️ Ver cómo sería este plan</button>
          ${w.plantilla === t.id
            ? '<button type="button" class="pe-btn pe-btn--sm" data-act="quitar-plantilla">✕ No usarla</button>'
            : `<button type="button" class="pe-btn pe-btn--sm pe-btn--pri" data-act="usar-plantilla" data-id="${esc(t.id)}">✨ Usar esta guía</button>`}</div>
      </div>`; }).join('');
  }
  function notaPlantilla(w) {
    const T = plantillaPorId(w.plantilla); if (!T) return '';
    return `<div class="pe-ctx pe-rv">📘 Vas a usar la <b>${esc(T.titulo)}</b> (${T.dias.length} días). Trae sus temas, prioridades, datos duros y casos; las <b>horas salen de tu ritmo</b>: si estudiás más por día, terminás antes y te sobran días de repaso. ${esc(T.nota || '')}
      <button type="button" class="pe-mini" data-act="quitar-plantilla">Armar el mío en lugar de la guía</button></div>`;
  }
  // Vista previa de una guía sugerida: resumen, calendario real, recorrido y herramientas conectadas.
  const PALETA_UP = ['#0ea5e9', '#7c3aed', '#ec4899', '#f97316', '#10b981', '#eab308', '#ef4444', '#14b8a6', '#6366f1', '#84cc16', '#f43f5e'];
  const HERRAMIENTAS = {
    conectado: [
      ['📅', 'Calendario de eventos', 'El examen queda agendado en tu calendario y aparece en “Próximos eventos” del campus, con la alerta de cuenta regresiva y el botón “Ver plan”.'],
      ['🍅', 'Pomodoro', 'Cada bloque de foco que terminás en la sala de estudio descuenta horas del día de hoy en tu plan, solo: sin tildar nada.'],
      ['🚦', 'Semáforo de ritmo', 'Compara lo que cumpliste con lo planificado y te avisa si vas a llegar: verde, amarillo o rojo, también en el campus.'],
      ['📚', 'Sala de estudio', 'Cada día tiene un acceso directo a la unidad que toca estudiar, con su bibliografía y materiales.'],
      ['🩺', 'Simulador Choice', 'Choices de la unidad del día y simulacro del examen completo (parcial o final), gratis.'],
      ['✍️', 'Examen escrito con IA', 'Respondés por escrito y recibís corrección con rúbrica (NikaMed+; con plan gratis tenés usos de prueba).'],
      ['📆', 'Reorganizar pendientes', 'Si un día se te complica, mové los temas que faltaron a otros días con un toque o repartilos solos.'],
      ['📴', 'Sin conexión', 'El plan y la guía se guardan en tu dispositivo: podés tildar temas aunque no tengas señal.'],
    ],
    juntos: [
      ['🏆', 'Liga Pomodoro y racha', 'Las horas de estudio suman a tu racha diaria y a tu posición en la Liga.'],
      ['📊', 'Cierre del día', 'Al terminar, compará lo planificado con lo cumplido y ajustá el día siguiente.'],
      ['📹', 'Sala de Ateneos', 'Estudiá acompañado en video con hasta 4 compañeros y ensayen la parte oral entre ustedes.'],
      ['🛡️', 'Modo Guardia', 'Descargá tus salas de estudio y bancos de preguntas para repasar sin conexión.'],
      ['🧠', 'Asistente Nika', 'Preguntale dudas del tema del día con la bibliografía de tu cátedra.'],
    ],
  };
  function modalPrevia(id) {
    const T = plantillaPorId(id); if (!T) return;
    const base = S.wiz || {}, hoy = hoyISO();
    const est = {
      n: Math.min(60, Math.max(3, base.fecha_examen && base.inicio ? difDias(base.fecha_examen, base.inicio) : T.dias.length)),
      inicio: base.inicio || hoy, descanso: base.descanso != null ? base.descanso : -1, paso: 0, sel: null,
    };
    const PASOS = [['🎯', 'Qué vas a preparar'], ['📅', 'Tu calendario'], ['🔎', 'Un día por dentro'], ['📋', 'Todo el recorrido'], ['🎓', 'Practicá'], ['🧰', 'Herramientas'], ['✅', 'Empezá']];
    const colorUP = (u) => { const i = (T.unidades || []).indexOf(String(u || '').split(' + ')[0]); return i >= 0 ? PALETA_UP[i % PALETA_UP.length] : '#94a3b8'; };
    const armar = () => {
      const w = { materia: T.materia, plantilla: T.id, unidades: T.unidades.slice(), inicio: est.inicio, fecha_examen: sumaDias(est.inicio, est.n), horasLV: 4, horasFS: 3, descanso: est.descanso, repaso: 1, extra: '', auto: true, titulo: T.titulo };
      aplicarRecomendado(w, 1);
      const plan = planDesdePlantilla(w);
      if (plan) plan.practica = T.practica || null;
      return { w, plan };
    };
    const { m, cerrar } = modal(`<div class="pe-tour-top"><span class="pe-tour-k">Recorrido virtual</span><h3>${esc(T.titulo)}</h3><p class="pe-sub">${esc(T.subtitulo || '')}</p></div>
      <div class="pe-tour-pasos" role="tablist">${PASOS.map((p, i) => `<button type="button" role="tab" data-i="${i}" class="${i === 0 ? 'on' : ''}"><i>${p[0]}</i><span>${p[1]}</span></button>`).join('')}</div>
      <div class="pe-tour-bar"><i id="pe-tour-fill"></i></div>
      <div class="pe-prev-ctl">
        <label>Empezás el<input type="date" id="pe-pv-ini" value="${est.inicio}" min="${hoy}"></label>
        <label class="grow">¿En cuántos días lo querés hacer?<span class="pe-prev-slider"><input type="range" id="pe-pv-n" min="3" max="60" value="${est.n}"><output id="pe-pv-out"></output></span></label>
        <label>Día de descanso<select id="pe-pv-desc"><option value="-1">Ninguno</option>${DIAS_LARGO.map((n, i) => `<option value="${i}">${n[0].toUpperCase() + n.slice(1)}</option>`).join('')}</select></label>
      </div>
      <div id="pe-prev-body" class="pe-prev-body"></div>
      <div class="pe-tour-nav"><button type="button" class="pe-btn" data-t="ant">← Anterior</button><span id="pe-tour-pos"></span>
        <button type="button" class="pe-btn pe-btn--pri" data-t="sig">Siguiente →</button></div>`, 'ancho pe-prev');
    const body = m.querySelector('#pe-prev-body'), sl = m.querySelector('#pe-pv-n'), out = m.querySelector('#pe-pv-out');
    m.querySelector('#pe-pv-desc').value = String(est.descanso);

    const kpis = (plan) => {
      const conT = plan.dias.filter((d) => (d.temas || []).some((t) => t.unidad && t.unidad !== 'Integración'));
      const ult = conT[conT.length - 1], repaso = ult ? plan.dias.filter((d) => d.fecha > ult.fecha).length : 0;
      return { temas: plan.dias.reduce((a, d) => a + (d.temas || []).length, 0), horas: Math.round(horasPlan(plan)), hdia: Math.round(horasPlan(plan) / Math.max(1, plan.dias.length) * 2) / 2, fin: ult ? ult.fecha : null, repaso };
    };
    const sPrep = (plan) => {
      const k = kpis(plan);
      const porU = []; plan.dias.forEach((d) => { const u = (String(d.unidad || '').split(' + ')[0]) || 'Otros'; let g = porU.find((x) => x.u === u); if (!g) { g = { u, dias: 0 }; porU.push(g); } g.dias++; });
      return `<div class="pe-prev-kpis">
          <div><b>${plan.dias.length}</b><span>días de estudio</span></div><div><b>${k.temas}</b><span>temas</span></div><div><b>${k.horas}</b><span>horas en total</span></div><div><b>${fmtH(k.hdia)}</b><span>por día aprox.</span></div></div>
        <p class="pe-estim">${k.fin ? `⏳ Empezás el <b>${fmtLarga(plan.dias[0].fecha)}</b>, terminás los temas el <b>${fmtLarga(k.fin)}</b> y te ${k.repaso === 1 ? 'queda' : 'quedan'} <b>${k.repaso} ${k.repaso === 1 ? 'día' : 'días'}</b> de repaso hasta el simulacro final.` : ''}${k.hdia > 12 ? '<br>⚠️ Son muchas horas por día: probá con más días para estudiar más tranquilo.' : ''}</p>
        <p class="pe-sub">${esc(T.descripcion || '')}</p>
        <h4 class="pe-prev-h">📚 Unidades que vas a preparar</h4>
        <div class="pe-prev-uni">${porU.map((g) => `<span class="pe-prev-chip" style="--c:${colorUP(g.u)}"><i></i><b>${esc(g.u)}</b> · ${g.dias} ${g.dias === 1 ? 'día' : 'días'}</span>`).join('')}</div>
        <p class="pe-sub" style="margin-top:12px">${esc(T.nota || '')}</p>`;
    };
    const sCal = (plan) => {
      const mapa = {}; plan.dias.forEach((d, i) => { mapa[d.fecha] = { d, n: i + 1 }; });
      const primero = plan.dias[0].fecha, ex = plan.fecha_examen, a0 = aFecha(primero), a1 = aFecha(ex);
      const meses = []; for (let y = a0.getFullYear(), mm = a0.getMonth(); y < a1.getFullYear() || (y === a1.getFullYear() && mm <= a1.getMonth()); mm++) { if (mm > 11) { mm = 0; y++; } meses.push([y, mm]); if (meses.length >= 4) break; }
      const grids = meses.map(([y, mm]) => {
        const off = (new Date(y, mm, 1).getDay() + 6) % 7, nd = new Date(y, mm + 1, 0).getDate();
        let c = ''; for (let i = 0; i < off; i++) c += '<i class="v"></i>';
        for (let n = 1; n <= nd; n++) {
          const f = iso(new Date(y, mm, n)), x = mapa[f];
          const u = x ? (String(x.d.unidad || '').split(' + ')[0]) : '';
          const integ = x && x.d.unidad === 'Integración';
          c += x ? `<button type="button" class="d on ${integ ? 'integ' : ''} ${est.sel === f ? 'sel' : ''}" data-f="${f}" style="--c:${integ ? '#ef4444' : colorUP(u)}" title="${esc(x.d.titulo)}"><b>${n}</b><small>Día ${x.n}</small></button>`
            : `<span class="d ${f === ex ? 'ex' : ''} ${aFecha(f).getDay() === est.descanso && f > primero && f < ex ? 'desc' : ''}"><b>${n}</b>${f === ex ? '<small>Examen</small>' : ''}</span>`;
        }
        return `<div class="pe-pv-mes"><div class="pe-pv-mh">${MESES[mm][0].toUpperCase() + MESES[mm].slice(1)} ${y}</div><div class="pe-pv-g"><u>L</u><u>M</u><u>M</u><u>J</u><u>V</u><u>S</u><u>D</u>${c}</div></div>`;
      }).join('');
      const sel = est.sel && mapa[est.sel];
      const det = sel ? `<div class="pe-pv-det"><b>Día ${sel.n} · ${fmtCorta(sel.d.fecha)}</b><span>${esc(sel.d.titulo)}</span><small>${fmtH(sel.d.horas || 0)} · ${(sel.d.temas || []).length} temas</small>
          <ul>${(sel.d.temas || []).slice(0, 6).map((t) => `<li>${esc(t.texto.length > 80 ? t.texto.slice(0, 78) + '…' : t.texto)}</li>`).join('')}</ul></div>`
        : '<div class="pe-pv-det vacio">Tocá un día del calendario para ver qué estudiarías ese día. Así quedaría tu plan, con tu fecha de inicio y tus días.</div>';
      const unis = (T.unidades || []).map((u) => `<span class="pe-prev-chip" style="--c:${colorUP(u)}"><i></i>${esc(u)}</span>`).join('');
      return `<p class="pe-sub">Cada color es una unidad. Los días de descanso quedan libres y el último día es el simulacro final.</p><div class="pe-pv-cal">${grids}</div>${det}<div class="pe-prev-uni" style="margin-top:10px">${unis}<span class="pe-prev-chip" style="--c:#ef4444"><i></i>Integración / simulacro</span></div>`;
    };
    const sDia = (plan) => {
      const mu = plan.dias.find((d) => (d.temas || []).length >= 3 && (d.datos_duros || []).length && d.unidad !== 'Integración') || plan.dias[0];
      const ag = (mu.agenda || []).map((a, i) => `<div class="pe-dia-ag" style="--i:${i}"><span>${esc(a.bloque)}${a.horas ? ' · ' + esc(a.horas) : ''}</span><p>${esc((a.tarea || '').slice(0, 130))}${(a.tarea || '').length > 130 ? '…' : ''}</p></div>`).join('');
      const tm = (mu.temas || []).slice(0, 5).map((t, i) => `<li style="--i:${i}"><span class="bx"></span><span class="tx">${esc(t.texto.length > 80 ? t.texto.slice(0, 78) + '…' : t.texto)}${t.trampa ? `<small>⚠️ ${esc(t.trampa.slice(0, 90))}${t.trampa.length > 90 ? '…' : ''}</small>` : ''}</span><i class="pr" style="--c:${(PRIO[t.prio] || PRIO.media).c}">${(PRIO[t.prio] || PRIO.media).t}</i></li>`).join('');
      const dd = (mu.datos_duros || []).slice(0, 3).map((x) => `<li>${esc(x.length > 110 ? x.slice(0, 108) + '…' : x)}</li>`).join('');
      return `<p class="pe-sub">Así se ve un día adentro del plan. Todo es tildable y el semáforo te avisa si vas a llegar.</p>
        <div class="pe-dia-mock"><div class="pe-dm-h"><span class="n"><small>DÍA</small>${plan.dias.indexOf(mu) + 1}</span><div><b>${esc(mu.titulo)}</b><small>${fmtCorta(mu.fecha)} · ${fmtH(mu.horas || 0)} · ${esc(mu.unidad || '')}</small></div></div>
          ${mu.caso ? `<div class="pe-dm-caso"><b>🧪 Caso o práctica del día</b><p>${esc(mu.caso.slice(0, 190))}${mu.caso.length > 190 ? '…' : ''}</p></div>` : ''}
          <h5>Temas del día</h5><ul class="pe-dm-temas">${tm}</ul>
          ${ag ? `<h5>🕒 Agenda del día</h5><div class="pe-dm-ag">${ag}</div>` : ''}
          ${dd ? `<h5>📌 Datos duros</h5><ul class="pe-dm-dd">${dd}</ul>` : ''}
          <h5>✅ Checklist de cierre</h5><ul class="pe-dm-temas">${(mu.checklist || []).slice(0, 3).map((c, i) => `<li style="--i:${i}"><span class="bx"></span><span class="tx">${esc(c.texto.length > 90 ? c.texto.slice(0, 88) + '…' : c.texto)}</span></li>`).join('')}</ul></div>`;
    };
    const sRec = (plan) => `<p class="pe-sub">Los ${plan.dias.length} días del plan, con sus fechas. Tocá uno para ver sus temas.</p><div class="pe-prev-lista">${plan.dias.map((d, i) => `<details><summary><span class="n" style="background:${d.unidad === 'Integración' ? '#ef4444' : colorUP(String(d.unidad || '').split(' + ')[0])}">${i + 1}</span><span class="t">${esc(d.titulo)}</span><span class="h">${fmtCorta(d.fecha)} · ${fmtH(d.horas || 0)}</span></summary>
        <ul>${(d.temas || []).slice(0, 8).map((t) => `<li>${esc(t.texto)}</li>`).join('')}${(d.temas || []).length > 8 ? `<li>… y ${(d.temas || []).length - 8} más</li>` : ''}</ul></details>`).join('')}</div>`;
    const sPrac = () => {
      const pr = T.practica || {};
      const label = (MODO_LABEL[pr.modulo] || {})[pr.mode] || 'el examen';
      return `<p class="pe-sub">Estudiar es la mitad: el plan te lleva directo a practicar <b>${esc(label)}</b>.</p>
        <div class="pe-prev-herr grande">
          <div><i>🩺</i><b>Examen choice <span class="pe-gratis">Gratis</span></b><span>Simulá ${esc(label)} con tiempo y corrección, o resolvé los choices de la unidad del día con un toque.</span></div>
          <div><i>✍️</i><b>Examen escrito con IA <span class="pe-plus">NikaMed+</span></b><span>Respondés por escrito y un tribunal de IA te corrige con rúbrica. Si tu plan es gratuito, te mostramos qué incluye NikaMed+ y podés usar tus usos de prueba.</span></div>
          ${pr.mode === 'final' ? '<div><i>🗣️</i><b>Tribunal oral</b><span>El último día incluye el ensayo del caso integrador para defender el “porqué” de cada conducta en voz alta.</span></div>' : ''}
          <div><i>🚦</i><b>Semáforo de ritmo</b><span>Mientras estudiás: <b class="v">🟢 venís a buen ritmo</b> · <b class="a">🟡 te falta un poco</b> · <b class="r">🔴 estudiá YA</b>.</span></div>
        </div>`;
    };
    const sHerr = () => `<p class="pe-sub">NikaPlan no es una lista aislada: se conecta con el resto de NikaMed.</p>
      <h4 class="pe-prev-h">🔗 Conectado al plan</h4>
      <div class="pe-prev-herr">${HERRAMIENTAS.conectado.map((h) => `<div><i>${h[0]}</i><b>${h[1]}</b><span>${h[2]}</span></div>`).join('')}</div>
      <h4 class="pe-prev-h">🤝 Para usar junto al plan</h4>
      <div class="pe-prev-herr">${HERRAMIENTAS.juntos.map((h) => `<div><i>${h[0]}</i><b>${h[1]}</b><span>${h[2]}</span></div>`).join('')}</div>`;
    const sFin = (plan) => {
      const k = kpis(plan);
      return `<div class="pe-fin-prev"><div class="big">🚀</div><h4>Listo para empezar</h4>
        <p>Vas a preparar <b>${esc(T.titulo)}</b> en <b>${plan.dias.length} días</b> (${fmtH(k.hdia)} por día aprox.), desde el <b>${fmtLarga(plan.dias[0].fecha)}</b> hasta el <b>${fmtLarga(plan.fecha_examen)}</b>.</p>
        <p class="pe-sub">Podés cambiar los días, el ritmo, el día de descanso y los días de repaso en el paso siguiente, y editar cualquier día cuando quieras.</p>
        <button type="button" class="pe-btn pe-btn--pri pe-btn--lg" data-t="usar">✨ Usar esta guía con estos días</button></div>`;
    };
    const pintar = () => {
      const n = est.n; out.textContent = `${n} ${n === 1 ? 'día' : 'días'}`;
      const { plan } = armar();
      let html;
      if (!plan || !plan.dias.length) html = '<p class="pe-warn">Con esas fechas no se puede armar el plan. Probá con más días.</p>';
      else html = [sPrep, sCal, sDia, sRec, sPrac, sHerr, sFin][est.paso](plan);
      body.innerHTML = html; body.scrollTop = 0;
      body.classList.remove('pe-tour-anim'); void body.offsetWidth; body.classList.add('pe-tour-anim');
      m.querySelectorAll('.pe-tour-pasos button').forEach((b, i) => { b.classList.toggle('on', i === est.paso); b.classList.toggle('ok', i < est.paso); });
      m.querySelector('#pe-tour-fill').style.width = ((est.paso + 1) / PASOS.length * 100) + '%';
      m.querySelector('#pe-tour-pos').textContent = `Paso ${est.paso + 1} de ${PASOS.length}`;
      m.querySelector('[data-t="ant"]').style.visibility = est.paso === 0 ? 'hidden' : 'visible';
      const sg = m.querySelector('[data-t="sig"]'); sg.textContent = est.paso === PASOS.length - 1 ? '✨ Usar esta guía' : 'Siguiente →';
    };
    const usar = () => {
      const w2 = S.wiz; cerrar(); if (!w2) return;
      w2.inicio = est.inicio; w2.descanso = est.descanso;
      if (!w2.evento_id) w2.fecha_examen = sumaDias(est.inicio, est.n);
      w2.plantilla = T.id; w2.unidades = T.unidades.slice(); w2.titulo = T.titulo; w2.paso = 3; w2.auto = true; aplicarRecomendado(w2, 1);
      render();
    };
    sl.addEventListener('input', () => { est.n = +sl.value; est.sel = null; pintar(); });
    m.querySelector('#pe-pv-ini').addEventListener('change', (e) => { if (e.target.value) { est.inicio = e.target.value < hoy ? hoy : e.target.value; est.sel = null; pintar(); } });
    m.querySelector('#pe-pv-desc').addEventListener('change', (e) => { est.descanso = parseInt(e.target.value, 10); est.sel = null; pintar(); });
    m.addEventListener('click', (e) => {
      const pb = e.target.closest('.pe-tour-pasos button'); if (pb) { est.paso = +pb.dataset.i; pintar(); return; }
      const nb = e.target.closest('[data-t]');
      if (nb) {
        if (nb.dataset.t === 'ant') { est.paso = Math.max(0, est.paso - 1); pintar(); }
        else if (nb.dataset.t === 'sig') { if (est.paso === PASOS.length - 1) usar(); else { est.paso++; pintar(); } }
        else if (nb.dataset.t === 'usar') usar();
        return;
      }
      const d = e.target.closest('.d.on'); if (d) { est.sel = d.dataset.f; pintar(); }
    });
    pintar();
  }
  function presetsHtml(w) {
    const r = recomendar(w);
    const P = [['suave', '🌿 Suave', 0.75], ['reco', '⭐ Recomendado', 1], ['int', '🔥 Intensivo', 1.25]];
    return P.map(([k, t, f]) => {
      const h = Math.min(24, Math.max(1.5, redond05(r.h * f)));
      const on = Math.abs(w.horasLV - h) < 0.01;
      return `<button type="button" class="pe-preset ${on ? 'on' : ''} ${k === 'reco' ? 'reco' : ''}" data-act="preset" data-f="${f}"><b>${t}</b><span>${fmtH(h)} por día</span><small>≈ ${Math.max(1, Math.floor(h * 60 / 30))} bloques pomodoro</small></button>`;
    }).join('');
  }
  function resumenWizard() {
    const w = S.wiz; if (!w.materia) return '';
    const dias = difDias(w.fecha_examen, w.inicio);
    if (dias < 1) return '<span class="pe-warn">Elegí una fecha de examen posterior a la de inicio.</span>';
    const T = nTemasWiz(w), pf = planDeFechas(w), r = recomendar(w);
    let h = 0; pf.todos.forEach((f) => { h += horasDeFecha(w, f); });
    const hTema = T ? (pf.nuevos.reduce((a, f) => a + horasDeFecha(w, f), 0) / T) : 0;
    const est = estimarWiz(w);
    const estHtml = T === 0 ? '' : (est.alcanza
      ? `<p class="pe-estim">⏳ Con <b>${fmtH(w.horasLV)}</b> por día (${fmtH(w.horasFS)} los fines de semana) terminás todos los temas el <b>${fmtLarga(est.fin)}</b> (día ${est.diasUsados}) y te quedan <b>${est.diasRepaso} ${est.diasRepaso === 1 ? 'día' : 'días'} de repaso</b> antes del examen.${est.diasRepaso < 3 ? ` Para llegar con 3 días de repaso necesitás unas <b>${fmtH(est.hParaRepaso)}</b> por día.` : ''}</p>`
      : `<p class="pe-estim mal">⚠️ Con este ritmo no llegás a ver todos los temas: te faltan unas <b>${fmtH(est.falta)}</b>. Para terminarlos necesitás unas <b>${fmtH(redond05(est.necesarias / Math.max(1, est.diasEst)))}</b> por día, o sumar días.</p>`);
    const avisos = [];
    if (T === 0) avisos.push('Elegí al menos una unidad en el paso anterior.');
    if (T && !est.alcanza) avisos.push(`💡 Recomendado para este contenido: unas ${fmtH(r.h)} por día. Podés estudiar las horas que quieras: el plan se acomoda.`);
    if (w.horasLV > 12) avisos.push('💡 Con tantas horas por día conviene planificar pausas largas y dormir bien: el plan lo permite, pero rendís más con descansos.');
    if (w.repaso === 0) avisos.push('💡 Conviene dejar al menos un día final para integrar y simular.');
    if (dias > 3 && w.descanso < 0) avisos.push('💡 Un día de descanso por semana ayuda a sostener el ritmo.');
    return `<div class="pe-res-grid"><div><b>${dias}</b><span>días hasta el examen</span></div><div><b>${T}</b><span>temas a repartir</span></div><div><b>${Math.round(h)}</b><span>horas de estudio</span></div><div><b>${T ? (T / Math.max(1, pf.nuevos.length)).toFixed(1).replace('.', ',') : '0'}</b><span>temas por día</span></div></div>
      ${estHtml}
      ${avisos.length ? `<ul class="pe-avisos">${avisos.map((a) => `<li>${a}</li>`).join('')}</ul>` : '<p class="pe-ok">✅ Tu plan está bien balanceado.</p>'}`;
  }

  function finTemasHtml(p) {
    const conT = p.dias.filter((d) => (d.temas || []).some((t) => t.unidad && t.unidad !== 'Integración'));
    if (!conT.length) return '';
    const ult = conT[conT.length - 1], repaso = p.dias.filter((d) => d.fecha > ult.fecha).length;
    return `<p class="pe-fin">📚 Terminás los temas el <b>${fmtLarga(ult.fecha)}</b> · te ${repaso === 1 ? 'queda' : 'quedan'} <b>${repaso}</b> ${repaso === 1 ? 'día' : 'días'} de repaso</p>`;
  }
  // ---- práctica del examen: choices (gratis) y examen escrito (NikaMed+) ----
  const upNum = (id) => { const m = String(id || '').match(/(\d+)/); return m ? +m[1] : null; };
  const MODO_LABEL = {
    ginecologia: { parcial_1: 'Examen Parcial (UP 1 a 3)', final: 'Examen Integrador (UP 1 a 4)' },
    siam: { parcial_1: 'Primer Parcial (UP 1 a 5)', parcial_2: 'Segundo Parcial (UP 6 a 9)', final: 'Examen Final (UP 1 a 9)' },
    cirugia: { parcial_1: 'Primer Parcial (UP 1 a 5)', parcial_2: 'Segundo Parcial (UP 6 a 11)', final: 'Examen Final (UP 1 a 11)' },
  };
  function upParam(materia, unidadId) {
    if (materia === 'cirugia') { const n = upNum(unidadId); return n ? String(n) : ''; }
    const m = String(unidadId || '').match(/UP\s*(\d+)(?:\s*-\s*Secci[oó]n\s*(\d+))?/i);
    if (!m) return '';
    return m[2] ? `UP${m[1]}_sec_${m[2]}` : `UP${m[1]}`;
  }
  function practicaDe(p) {
    if (p.practica && (p.practica.modulo || p.practica.ecoe)) return p.practica;
    const m = p.materia;
    if (m === 'pfo') return { modulo: 'pfo', ecoe: true };
    if (!MODO_LABEL[m]) return null;
    const nums = (p.unidades || []).map(upNum).filter((n) => n != null);
    if (!nums.length) return { modulo: m, mode: 'final' };
    const max = Math.max(...nums), min = Math.min(...nums);
    let mode = 'final';
    if (m === 'ginecologia') mode = max <= 3 ? 'parcial_1' : 'final';
    else mode = max <= 5 ? 'parcial_1' : (min >= 6 ? 'parcial_2' : 'final');
    return { modulo: m, mode };
  }
  const urlChoice = (pr) => `examen.html?modulo=${pr.modulo}&mode=${pr.mode}`;
  const urlEscrito = (pr) => `examen.html?modulo=${pr.modulo}&modalidad=escrito`;
  function urlChoiceUP(materia, unidad) { const up = upParam(materia, unidad); return up ? `examen.html?modulo=${materia}&mode=up_especifica&up=${encodeURIComponent(up)}` : null; }
  function esFree() { try { return !!(window.NikaAcceso && NikaAcceso.esUsuarioFree && NikaAcceso.esUsuarioFree()); } catch (_) { return false; } }
  function panelPractica(p) {
    const pr = practicaDe(p); if (!pr) return '';
    if (pr.ecoe) {
      return `<section class="pe-prac pe-rv"><div class="pe-prac-h"><b>🎯 Practicá este examen</b><span>ECOE FINAL · 6.º año</span></div>
        <div class="pe-prac-b">
          <a class="pe-prac-card" href="pfo_ecoe.html"><i>🎓</i><b>ECOE FINAL</b><small>Una estación de cada especialidad, con tiempo y rúbrica. <span class="pe-plus">NikaMed+</span></small></a>
          <a class="pe-prac-card" href="pfo_estudio.html"><i>📋</i><b>Casos y procedimientos</b><small>Estaciones para resolver con respuesta modelo y fuentes.</small></a>
        </div></section>`;
    }
    const label = (MODO_LABEL[pr.modulo] || {})[pr.mode] || 'Examen';
    const free = esFree();
    return `<section class="pe-prac pe-rv"><div class="pe-prac-h"><b>🎯 Practicá este examen</b><span>${esc(label)}</span></div>
      <div class="pe-prac-b">
        <a class="pe-prac-card" href="${urlChoice(pr)}"><i>🩺</i><b>Examen choice</b><small>Simulá el ${esc(label)} con tiempo y corrección. <span class="pe-gratis">Gratis</span></small></a>
        <button type="button" class="pe-prac-card esc" data-act="escrito" data-url="${urlEscrito(pr)}"><i>✍️</i><b>Examen escrito ${free ? '🔒' : ''}</b><small>Respondé por escrito y recibí corrección con rúbrica. <span class="pe-plus">NikaMed+</span></small></button>
        ${pr.mode === 'final' ? '<div class="pe-prac-card oral"><i>🗣️</i><b>Tribunal oral</b><small>Ensayá en voz alta el caso integrador del último día: problema, fisiopatología, estudio y conducta.</small></div>' : ''}
      </div></section>`;
  }
  function panelHerramientas(p) {
    const sala = p.materia === 'pfo' ? 'pfo_estudio.html' : `estudio.html?modulo=${encodeURIComponent(p.materia)}`;
    const L = [['🍅', 'Pomodoro', sala, 'Estudiá por bloques de foco y medí el tiempo real por unidad'], ['🏆', 'Liga Pomodoro', 'liga.html', 'Tu estudio suma a la Liga y a tu racha'],
               ['📹', 'Sala de Ateneos', 'ateneos.html', 'Estudiá acompañado en video'], ['📊', 'Cierre del día', 'campus.html', 'Compará lo planificado con lo cumplido'], ['💊', 'NikaFarma', 'nikafarma.html', 'Vademécum y scores']];
    return `<div class="pe-pomo-info pe-rv">🍅 <b>Pomodoro conectado:</b> cada bloque de foco que termines en la sala de estudio descuenta horas de este plan automáticamente (hoy: <b>${fmtH((p.dias.find((d) => d.fecha === hoyISO()) || {}).estudiado || 0)}</b>).</div>
      <div class="pe-herr-row pe-rv"><span class="pe-herr-t">🧰 Usalo junto al plan</span>${L.map((x) => `<a class="pe-herr" href="${x[2]}" title="${esc(x[3])}"><i>${x[0]}</i>${x[1]}</a>`).join('')}</div>`;
  }
  function modalEscrito(url) {
    if (!esFree()) { location.href = url; return; }
    modal(`<h3>✍️ El examen escrito es de NikaMed+</h3>
      <p class="pe-sub">Respondés con tus palabras, como en el examen real, y un tribunal de IA te corrige con rúbrica y feedback por pregunta, marcando lo que tenés que reforzar.</p>
      <ul class="pe-plus-lista">
        <li>✍️ Simulador Escrito con corrección por IA, sin límites</li>
        <li>🛏️ Pase de Sala, 🚨 Shock Room y 🗣️ Consultorios y Legales</li>
        <li>🎓 ECOE FINAL de 6.º año y chat de práctica con paciente y evaluador por IA</li>
        <li>🧠 Asistente Nika con la bibliografía de tu cátedra</li>
      </ul>
      <p class="pe-sub">Con tu plan gratuito tenés usos de prueba por simulador. ¿Querés usar uno ahora?</p>
      <div class="pe-modal-acc"><a class="pe-btn pe-btn--pri" href="nikamed-plus.html">⭐ Ver NikaMed+</a><a class="pe-btn" href="${esc(url)}">Usar un uso de prueba</a><button type="button" class="pe-btn" data-cerrar>Ahora no</button></div>`, 'ancho');
  }

  // temas de días que ya pasaron y quedaron sin estudiar
  function pendientes(p) {
    const hoy = hoyISO(), out = [];
    p.dias.forEach((d) => {
      if (d.fecha >= hoy) return;
      const sin = (d.temas || []).filter((t) => !t.hecho);
      if (sin.length) out.push({ dia: d, temas: sin });
    });
    return out;
  }
  function alertaPendientes(p) {
    const pen = pendientes(p); if (!pen.length) return '';
    const n = pen.reduce((a, x) => a + x.temas.length, 0);
    const ej = pen[0].temas.slice(0, 2).map((t) => esc(t.texto.length > 60 ? t.texto.slice(0, 58) + '…' : t.texto)).join(' · ');
    return `<div class="pe-pend pe-rv" role="alert"><span class="pe-pend-ico">⚠️</span>
      <div><b>Te quedaron ${n} ${n === 1 ? 'tema' : 'temas'} sin estudiar de ${pen.length} ${pen.length === 1 ? 'día anterior' : 'días anteriores'}</b>
      <p>${ej}${n > 2 ? ' …' : ''}</p></div>
      <button type="button" class="pe-btn pe-btn--sm pe-btn--pri" data-act="pendientes">📆 Reorganizar</button></div>`;
  }
  function modalPendientes() {
    const p = S.plan; if (!p) return;
    const pen = pendientes(p); if (!pen.length) return toast('No tenés temas pendientes 🎉');
    const hoy = hoyISO();
    const destinos = p.dias.filter((d) => d.fecha >= hoy);
    const { m, cerrar } = modal(`<h3>📆 Temas que te faltaron</h3>
      <p class="pe-sub">Elegí qué pasar a otro día. Los temas se mueven con su prioridad y sus notas.</p>
      <div class="pe-pend-lista">${pen.map(({ dia, temas }) => `<div class="pe-pend-dia"><b>${fmtCorta(dia.fecha)} · ${esc(dia.titulo || 'Día de estudio')}</b>
        ${temas.map((t) => `<label class="pe-pend-t"><input type="checkbox" data-pt="${t.id}" data-pd="${dia.id}" checked><span class="pe-box">✓</span><span>${esc(t.texto)}</span></label>`).join('')}</div>`).join('')}</div>
      <div class="pe-field"><label for="pe-dest">Pasarlos a</label>
        <select id="pe-dest">${destinos.length ? `<option value="auto">✨ Repartir solo en los próximos días</option>` : ''}${destinos.map((d) => `<option value="${d.id}">${fmtCorta(d.fecha)}${d.fecha === hoy ? ' (hoy)' : ''} · ${esc((d.titulo || '').slice(0, 40))} · ${fmtH(d.horas || 0)}</option>`).join('')}${destinos.length ? '' : '<option value="">No quedan días: agregá uno en la agenda</option>'}</select></div>
      <div class="pe-modal-acc"><button type="button" class="pe-btn pe-btn--pri" data-m="mover" ${destinos.length ? '' : 'disabled'}>Mover los marcados</button><button type="button" class="pe-btn" data-m="cerrar">Ahora no</button></div>`, 'ancho');
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      if (b.dataset.m === 'cerrar') return cerrar();
      const sel = [...m.querySelectorAll('input[data-pt]:checked')].map((i) => ({ t: i.dataset.pt, d: i.dataset.pd }));
      if (!sel.length) return toast('Marcá al menos un tema');
      const dest = m.querySelector('#pe-dest').value;
      const cola = [];
      sel.forEach(({ t, d }) => { const src = p.dias.find((x) => x.id === d); if (!src) return; const i = src.temas.findIndex((x) => x.id === t); if (i >= 0) cola.push({ tema: src.temas.splice(i, 1)[0], de: src.fecha }); });
      cola.forEach((c) => {
        let target;
        if (dest === 'auto') {
          // al día con menos temas por hora entre los que quedan (sin cargar el último de integración mientras haya otros)
          const cand = destinos.length > 1 ? destinos.slice(0, -1) : destinos;
          target = cand.slice().sort((a, b) => (a.temas.length / Math.max(1, a.horas || 1)) - (b.temas.length / Math.max(1, b.horas || 1)))[0];
        } else target = p.dias.find((x) => x.id === dest);
        if (!target) return;
        c.tema.hecho = false; c.tema.movidoDe = c.de; target.temas.push(c.tema);
      });
      guardar(p); cerrar(); render(); toast(`📆 Moviste ${cola.length} ${cola.length === 1 ? 'tema' : 'temas'} a tus próximos días`);
    });
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
    const ev = p.evento_id ? eventoPorId(p.evento_id) : null;
    const vinc = ev
      ? `<div class="pe-vinc-bar ok pe-rv">📅 Vinculado a tu calendario: <b>${esc(ev.titulo || 'Examen')}</b> · ${fmtLarga(ev.fecha)}${ev.fecha !== p.fecha_examen ? ' <button type="button" class="pe-mini" data-act="sync-fecha">Usar la fecha del calendario</button>' : ''}</div>`
      : (S.examenes.length ? `<div class="pe-vinc-bar pe-rv">🔗 Este plan no está vinculado a ningún examen de tu calendario. <button type="button" class="pe-btn pe-btn--sm pe-btn--pri" data-act="vincular">Vincular con un examen</button></div>` : '');
    return `${barraNav([{ t: 'Mis planes', act: 'hub' }, { t: esc(p.titulo.length > 38 ? p.titulo.slice(0, 36) + '…' : p.titulo), act: '' }])}
      <div class="pe-plan-view" style="--m:${M.color}">
      <header class="pe-plan-head pe-rv">
        <span class="pe-stars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <div class="pe-plan-info">
          <span class="pe-mat pe-mat--on">${M.ico} ${esc(M.nombre)}</span>
          <h1>${esc(p.titulo)}</h1>
          <p class="pe-sub">${fmtLarga(p.fecha_examen)} · ${(p.unidades || []).map(esc).join(', ') || 'Temas propios'}</p>
          ${finTemasHtml(p)}
          <div class="pe-plan-kpis">
            <div class="pe-kpi"><b>${hechos}/${p.dias.length}</b><span>días completos</span></div>
            <div class="pe-kpi"><b>${fmtH(horasHechas(p))}</b><span>de ${fmtH(horasPlan(p))}</span></div>
            <div class="pe-kpi"><b>${fmtH(r.falta)}</b><span>por hacer</span></div>
            <div class="pe-kpi pe-kpi--pomo" title="Los bloques de foco del Pomodoro descuentan horas de este plan automáticamente"><b>🍅 ${fmtH(horasPomodoro(p))}</b><span>con Pomodoro</span></div>
          </div>
        </div>
        <div class="pe-plan-side">${contador(c, true)}${anillo(progresoPlan(p), 88)}</div>
      </header>
      ${vinc}
      ${alertaPendientes(p)}
      ${panelPractica(p)}
      ${panelHerramientas(p)}
      <div class="pe-alerta pe-alerta--${r.nivel} pe-rv" role="status"><span class="pe-alerta-ico">${r.ico}</span><div><b>${esc(r.titulo)}</b><p>${esc(r.texto)}${r.hdia && r.nivel !== 'verde' ? ` Te quedan ${fmtH(r.falta)} en ${r.diasFalta} ${r.diasFalta === 1 ? 'día' : 'días'} (unas ${fmtH(r.hdia)} por día).` : ''}</p></div></div>
      <nav class="pe-tabs pe-rv" role="tablist">${tabs.map((t) => `<button type="button" role="tab" class="${S.vista === t[0] ? 'on' : ''}" data-act="vista" data-v="${t[0]}"><span>${t[1]}</span> ${t[2]}</button>`).join('')}
        <span class="pe-tabs-sp"></span>
        <button type="button" class="pe-mini" data-act="editar" title="Cambiar nombre, fecha o vínculo del examen">⚙️ Ajustes</button>
      </nav>
      ${cuerpo}
      <div class="pe-pie"><button type="button" class="pe-btn" data-act="hub">← Volver a mis planes</button></div>
    </div>`;
  }

  function diaCard(p, d, abierto) {
    const pr = progresoDia(d), est = estadoDia(d), hoy = hoyISO();
    const cls = ['pe-dia', 'pe-rv', 'est-' + est, d.fecha === hoy ? 'es-hoy' : '', d.fecha < hoy && est !== 'listo' ? 'atrasado' : '', abierto ? 'abierto' : ''].filter(Boolean).join(' ');
    const n = p.dias.indexOf(d) + 1;
    const estTxt = est === 'listo' ? '✅ Listo' : est === 'curso' ? '⏳ En curso' : (d.fecha < hoy ? '⚠️ Atrasado' : '⚪ Sin empezar');
    return `<article class="${cls}" id="dia-${d.id}">
      <button type="button" class="pe-dia-head" data-act="dia" data-d="${d.id}" aria-expanded="${abierto ? 'true' : 'false'}">
        <span class="pe-dia-n" title="Día ${n} de ${p.dias.length} del plan"><small>DÍA</small>${n}</span>
        <span class="pe-dia-t"><b>${esc(d.titulo || 'Día de estudio')}</b><small>${fmtCorta(d.fecha)}${d.fecha === hoy ? ' · HOY' : ''} · ${fmtH(d.horas || 0)}${d.unidad ? ' · ' + esc(d.unidad) : ''}${d.estudiado ? ` · <span class="pe-pomo-chip">🍅 ${fmtH(d.estudiado)} estudiadas</span>` : ''}</small></span>
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
          <span class="pe-item-t">${esc(t.texto)}${t.movidoDe ? `<small class="movido">↪ Pasado desde el ${fmtCorta(t.movidoDe)}</small>` : ''}${t.detalle ? `<small>${esc(t.detalle)}</small>` : ''}${t.trampa ? `<small class="trampa">⚠️ Trampa de choice: ${esc(t.trampa)}</small>` : ''}</span></label>
        <span class="pe-prio" style="--c:${(PRIO[t.prio] || PRIO.media).c}" data-act="prio" data-d="${d.id}" data-t="${t.id}" title="Cambiar prioridad">${(PRIO[t.prio] || PRIO.media).t}</span>
        ${t.manual ? '<span class="pe-prop" title="Tema agregado por vos">✎</span>' : ''}
        <button type="button" class="pe-x" data-act="quitar-tema" data-d="${d.id}" data-t="${t.id}" aria-label="Quitar tema">✕</button>
      </li>`;
    const filaCheck = (c) => `<li class="pe-item ${c.hecho ? 'ok' : ''}">
        <label><input type="checkbox" data-act="check" data-d="${d.id}" data-t="${c.id}" ${c.hecho ? 'checked' : ''}><span class="pe-box">✓</span><span class="pe-item-t">${esc(c.texto)}</span></label>
        <button type="button" class="pe-x" data-act="quitar-check" data-d="${d.id}" data-t="${c.id}" aria-label="Quitar">✕</button></li>`;
    // temas completos de cada unidad problema que entra ese día
    const unidades = [];
    (d.temas || []).forEach((t) => { if (t.unidad && unidades.indexOf(t.unidad) < 0) unidades.push(t.unidad); });
    const desplegables = unidades.map((id) => unidadCat(p.materia, id)).filter(Boolean).map((u) =>
      `<details class="pe-temas"><summary>¿Qué temas tiene ${esc(u.id)}?</summary><ol class="pe-temas-lista">${u.temas.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></details>`).join('');
    return `<div class="pe-dia-body">
      ${d.caso ? `<div class="pe-caso"><b>🧪 Caso tipo para resolver al final del día</b><p>${esc(d.caso)}</p></div>` : ''}
      <h4>Temas del día</h4>
      <ul class="pe-items">${(d.temas || []).map(filaTema).join('') || '<li class="pe-vacio-li">Todavía no hay temas en este día.</li>'}</ul>
      ${desplegables}
      <div class="pe-add"><input type="text" data-add="tema" data-d="${d.id}" placeholder="Agregar un tema (si no está en el programa, escribilo)" maxlength="140"><button type="button" class="pe-btn pe-btn--sm" data-act="add-tema" data-d="${d.id}">＋ Agregar</button></div>
      <h4>Checklist de cierre</h4>
      <ul class="pe-items">${(d.checklist || []).map(filaCheck).join('') || '<li class="pe-vacio-li">Sin tareas de cierre.</li>'}</ul>
      <div class="pe-add"><input type="text" data-add="check" data-d="${d.id}" placeholder="Agregar una tarea de cierre" maxlength="140"><button type="button" class="pe-btn pe-btn--sm" data-act="add-check" data-d="${d.id}">＋ Agregar</button></div>
      <h4>📌 Datos duros</h4>
      <ul class="pe-datos">${(d.datos_duros || []).map((x, k) => `<li>${esc(x)} <button type="button" class="pe-x" data-act="quitar-dato" data-d="${d.id}" data-k="${k}" aria-label="Quitar">✕</button></li>`).join('') || '<li class="pe-vacio-li">Anotá acá las cifras, criterios y algoritmos que tenés que saber de memoria.</li>'}</ul>
      <div class="pe-add"><input type="text" data-add="dato" data-d="${d.id}" placeholder="Agregar un dato duro (ej.: Ciclo menstrual: 24 a 38 días)" maxlength="200"><button type="button" class="pe-btn pe-btn--sm" data-act="add-dato" data-d="${d.id}">＋ Agregar</button></div>
      ${(d.agenda || []).length ? `<h4>🕒 Agenda del día</h4><ul class="pe-datos">${d.agenda.map((a) => `<li><b>${esc(a.bloque || '')}</b> ${a.horas ? '· ' + esc(a.horas) : ''} — ${esc(a.tarea || '')}</li>`).join('')}</ul>` : ''}
      <h4>Notas</h4>
      <textarea class="pe-notas" data-act="notas" data-d="${d.id}" rows="2" placeholder="Anotá dudas, errores o lo que te falta repasar">${esc(d.notas || '')}</textarea>
      <div class="pe-dia-acc">
        <label class="pe-mini-f">Fecha <input type="date" data-act="fecha" data-d="${d.id}" value="${d.fecha}"></label>
        <label class="pe-mini-f">Horas <input type="number" data-act="horas" data-d="${d.id}" value="${d.horas || 0}" min="0" max="16" step="0.5"></label>
        <a class="pe-btn pe-btn--sm" href="${urlSala(p.materia, (d.temas[0] && d.temas[0].unidad) || (p.unidades || [])[0])}">📚 Ir a la sala de estudio</a>
        ${botonesPractica(p, d)}
        <button type="button" class="pe-btn pe-btn--sm pe-btn--ok" data-act="completar" data-d="${d.id}">✔ Marcar el día completo</button>
      </div>
    </div>`;
  }
  function botonesPractica(p, d) {
    const pr = practicaDe(p);
    if (!pr) return '<a class="pe-btn pe-btn--sm" href="campus.html">🩺 Simuladores</a>';
    if (pr.ecoe) return '<a class="pe-btn pe-btn--sm" href="pfo_ecoe.html">🎓 Practicar el ECOE</a>';
    const u = (d.temas && d.temas[0] && d.temas[0].unidad) || '';
    const urlUP = u && u !== 'Integración' && u !== 'Mis temas' ? urlChoiceUP(p.materia, u) : null;
    const choice = urlUP
      ? `<a class="pe-btn pe-btn--sm" href="${urlUP}">🩺 Choices de ${esc(u)}</a>`
      : `<a class="pe-btn pe-btn--sm" href="${urlChoice(pr)}">🩺 Simulacro del examen</a>`;
    return `${choice}<button type="button" class="pe-btn pe-btn--sm" data-act="escrito" data-url="${urlEscrito(pr)}">✍️ Examen escrito${esFree() ? ' 🔒' : ''}</button>`;
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
    const primero = new Date(y, m, 1), nDias = new Date(y, m + 1, 0).getDate(), off = (primero.getDay() + 6) % 7;
    const mapa = {}; p.dias.forEach((d) => { mapa[d.fecha] = d; });
    const hoy = hoyISO();
    let celdas = ''; for (let i = 0; i < off; i++) celdas += '<div class="pe-cal-c vacio"></div>';
    for (let n = 1; n <= nDias; n++) {
      const f = iso(new Date(y, m, n)), d = mapa[f], ex = f === p.fecha_examen;
      const est = d ? estadoDia(d) : '';
      const pasado = d && f < hoy;
      const pend = pasado ? (d.temas || []).filter((t) => !t.hecho).length : 0;
      const marca = pasado ? (est === 'listo' ? 'pasado-ok' : (pend ? 'pasado-pend' : 'pasado-ok')) : '';
      celdas += `<div class="pe-cal-c ${d ? 'con-dia est-' + est : ''} ${marca} ${f === hoy ? 'hoy' : ''} ${ex ? 'examen' : ''}" ${d ? `data-act="dia-tabla" data-d="${d.id}" tabindex="0"` : ''}>
        <span class="pe-cal-n">${n}${marca === 'pasado-ok' ? ' <i class="pe-cal-ok">✓</i>' : ''}</span>${ex ? '<span class="pe-cal-tag">📝 Examen</span>' : ''}
        ${d ? `<span class="pe-cal-tit">${esc((d.titulo || '').slice(0, 34))}</span><span class="pe-cal-h">${marca === 'pasado-pend' ? `⚠️ ${pend} ${pend === 1 ? 'tema' : 'temas'} sin estudiar` : `${fmtH(d.horas || 0)} · ${Math.round(progresoDia(d) * 100)}%`}</span>` : ''}</div>`;
    }
    return `${alertaPendientes(p)}<div class="pe-cal pe-rv">
      <div class="pe-cal-head"><button type="button" class="pe-mini" data-act="mes" data-n="-1">‹</button><b>${MESES[m][0].toUpperCase() + MESES[m].slice(1)} ${y}</b><button type="button" class="pe-mini" data-act="mes" data-n="1">›</button></div>
      <div class="pe-cal-leyenda"><span><i class="ok"></i>Día cumplido</span><span><i class="pend"></i>Quedaron temas</span><span><i class="hoy"></i>Hoy</span><span><i class="ex"></i>Examen</span></div>
      <div class="pe-cal-grid"><div class="pe-cal-d">Lun</div><div class="pe-cal-d">Mar</div><div class="pe-cal-d">Mié</div><div class="pe-cal-d">Jue</div><div class="pe-cal-d">Vie</div><div class="pe-cal-d">Sáb</div><div class="pe-cal-d">Dom</div>${celdas}</div>
    </div>`;
  }

  // ---------- guía y modelo ----------
  function modal(html, clase) {
    const m = document.createElement('div'); m.className = 'pe-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="pe-modal-c ${clase || ''}"><button type="button" class="pe-modal-x" aria-label="Cerrar">✕</button>${html}</div>`;
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', onEsc); };
    const onEsc = (e) => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', onEsc);
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.pe-modal-x') || e.target.closest('[data-cerrar]')) cerrar(); });
    document.body.appendChild(m); return { m, cerrar };
  }
  function modalGuia() {
    const pasos = [
      ['📆', 'Contá hacia atrás', 'Anotá la fecha del examen y contá los días reales que tenés. Sacá los que no podés estudiar (turnos, viajes, trabajo).'],
      ['📚', 'Listá todo lo que entra', 'Marcá las unidades y los temas del parcial. Si algo no está en el programa, agregalo a mano. Ordená por prioridad: lo que más se toma, primero.'],
      ['⏱️', 'Estimá el tiempo real', `Contá entre 2 y 3 horas por tema (leer, memorizar los datos duros y practicar). Usamos ${fmtH(H_POR_TEMA)} como referencia y sumá un 20 % de margen para lo que sale mal.`],
      ['🧩', 'Repartí por días', 'Poné los temas difíciles al principio y mezclá unidades. Evitá pasar de 10 h netas por día: rinde más estudiar parejo todos los días que atracarse un día solo.'],
      ['🔁', 'Reservá repaso', 'Dejá un repaso corto de lo de ayer cada día y al menos un día final para integrar y simular el examen con tiempo.'],
      ['😴', 'Incluí descanso', 'Un día más liviano por semana y dormir bien valen más que un día extra de estudio. El cerebro consolida mientras descansás.'],
      ['✅', 'Cerrá cada día', 'Tildá lo que cumpliste y reacomodá lo pendiente. Si te atrasás, reordená el plan en el momento: no lo acumules.'],
      ['🎯', 'Practicá como en el examen', 'Resolvé choices con tiempo y justificá en voz alta por qué las otras opciones son falsas.'],
    ];
    const { m } = modal(`<h3>📖 Cómo armar un buen plan de estudio</h3>
      <p class="pe-sub">Ocho pasos simples. Son recomendaciones generales de organización del estudio, no una regla fija.</p>
      <ol class="pe-guia">${pasos.map((p, i) => `<li style="--i:${i}"><span class="pe-guia-ico">${p[0]}</span><div><b>${i + 1}. ${p[1]}</b><p>${p[2]}</p></div></li>`).join('')}</ol>
      <div class="pe-modal-acc"><button type="button" class="pe-btn pe-btn--pri" data-act-m="nuevo">✨ Armar mi plan</button><button type="button" class="pe-btn" data-cerrar>Cerrar</button></div>`, 'ancho');
    m.addEventListener('click', (e) => { if (e.target.closest('[data-act-m="nuevo"]')) { m.remove(); nuevoWizard(); } });
  }
  function modalModelo() {
    const { m } = modal(`<h3>🧭 Plan modelo: cómo se ve un buen día</h3>
      <p class="pe-sub">Ejemplo de un día de estudio de 10 h (de lunes a viernes) de un parcial integrador de 16 días.</p>
      <div class="pe-modelo">
        <div class="pe-modelo-h"><span class="pe-mat">🤰 Gineco</span><b>Día 5 · Infecciones del tracto genital inferior, ITS y EPI</b></div>
        <div class="pe-modelo-bloques">
          <div style="--i:0"><span>🌅 Mañana · 4,5 h</span><p>Lectura comprensiva e integración fisiopatológica de los temas del día.</p></div>
          <div style="--i:1"><span>☀️ Tarde · 4 h</span><p>Memorización de datos duros, criterios y algoritmos. Cuadros comparativos.</p></div>
          <div style="--i:2"><span>🌙 Noche · 1,5 h</span><p>Choices del día y redacción de justificaciones de las opciones falsas.</p></div>
        </div>
        <h4>Temas del día (con prioridad)</h4>
        <ul class="pe-modelo-lista"><li><i style="--c:#ef4444">Alta</i> Criterios de Amsel para vaginosis bacteriana</li><li><i style="--c:#ef4444">Alta</i> EPI: criterios de internación</li><li><i style="--c:#f59e0b">Media</i> Tricomoniasis y tratamiento de la pareja</li><li><i style="--c:#38bdf8">Apoyo</i> Flujo vaginal: diagnóstico diferencial</li></ul>
        <h4>Checklist de cierre</h4>
        <ul class="pe-modelo-lista"><li>☑️ Enunciar de memoria los criterios de Amsel</li><li>☑️ Resolver el caso tipo del día</li><li>☑️ Justificar por escrito 3 opciones falsas</li></ul>
        <h4>Cómo se reparten los 16 días</h4>
        <div class="pe-modelo-linea"><span style="--w:12%;--c:#0ea5e9">Días 1–2<br><small>Base</small></span><span style="--w:56%;--c:#7c3aed">Días 3–13<br><small>Unidades por día</small></span><span style="--w:19%;--c:#f59e0b">Días 14–15<br><small>Temas finales</small></span><span style="--w:13%;--c:#ef4444">Día 16<br><small>Integración</small></span></div>
      </div>
      <div class="pe-modal-acc"><button type="button" class="pe-btn pe-btn--pri" data-act-m="nuevo">✨ Usar este modelo para mi examen</button><button type="button" class="pe-btn" data-cerrar>Cerrar</button></div>`, 'ancho');
    m.addEventListener('click', (e) => { if (e.target.closest('[data-act-m="nuevo"]')) { m.remove(); nuevoWizard(); } });
  }
  function modalAdjuntar(eventoId) {
    const libres = S.planes.filter((p) => !p.evento_id || !eventoPorId(p.evento_id));
    const ev = eventoPorId(eventoId);
    const { m } = modal(`<h3>📎 Adjuntar un plan a este examen</h3>
      <p class="pe-sub">${ev ? esc(ev.titulo || 'Examen') + ' · ' + fmtLarga(ev.fecha) : ''}</p>
      <div class="pe-lista-sel">${libres.map((p) => `<button type="button" class="pe-sel" data-p="${p.id}"><b>${esc(p.titulo)}</b><small>${fmtLarga(p.fecha_examen)} · ${p.dias.length} días</small></button>`).join('') || '<p class="pe-sub">No tenés planes para adjuntar.</p>'}</div>
      <div class="pe-modal-acc"><button type="button" class="pe-btn" data-cerrar>Cancelar</button></div>`);
    m.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      const p = S.planes.find((x) => x.id === b.dataset.p); m.remove(); if (p) await vincular(p, eventoId, true);
    });
  }
  function modalVincular(p) {
    const { m } = modal(`<h3>🔗 Vincular con un examen de tu calendario</h3>
      <p class="pe-sub">Así el plan aparece en “Próximos eventos” del campus y la alerta del examen te lleva directo acá.</p>
      <div class="pe-lista-sel">${S.examenes.map((e) => `<button type="button" class="pe-sel ${p.evento_id === e.id ? 'on' : ''}" data-e="${e.id}"><b>📝 ${esc(e.titulo || 'Examen')}</b><small>${fmtLarga(e.fecha)} · faltan ${Math.max(0, difDias(e.fecha, hoyISO()))} días</small></button>`).join('') || '<p class="pe-sub">No tenés exámenes futuros en tu calendario.</p>'}</div>
      <div class="pe-modal-acc"><button type="button" class="pe-btn" data-cerrar>Cancelar</button></div>`);
    m.addEventListener('click', async (e) => { const b = e.target.closest('[data-e]'); if (!b) return; m.remove(); await vincular(p, b.dataset.e, true); });
  }
  async function vincular(p, eventoId, usarFechaEvento) {
    const ev = eventoPorId(eventoId); if (!ev) return toast('No encontré ese examen');
    const viejo = p.evento_id;
    if (viejo && viejo !== eventoId && p.evento_propio) await borrarEventoPorId(viejo);   // el examen auxiliar que había creado NikaPlan
    p.evento_id = eventoId; p.evento_propio = false;
    if (usarFechaEvento && ev.fecha && ev.fecha !== p.fecha_examen) {
      const ult = p.dias.length ? p.dias[p.dias.length - 1].fecha : null;
      p.fecha_examen = ev.fecha;
      if (ult && ult >= ev.fecha) toast('⚠️ Algunos días del plan quedan después del examen: reacomodalos.');
    }
    guardar(p); await cargarExamenes(); render(); toast('🔗 Plan vinculado a tu examen');
  }

  // ---------- acciones ----------
  const buscarDia = (id) => S.plan && S.plan.dias.find((d) => d.id === id);
  function celebrar(el) {
    if (!el) return;
    const em = ['🎉', '✨', '💜', '⭐', '🩺'];
    const c = document.createElement('div'); c.className = 'pe-confetti';
    for (let i = 0; i < 14; i++) { const s = document.createElement('i'); s.textContent = em[i % em.length]; s.style.left = (10 + Math.random() * 80) + '%'; s.style.setProperty('--x', (Math.random() * 120 - 60) + 'px'); s.style.setProperty('--r', (Math.random() * 360) + 'deg'); s.style.animationDelay = (Math.random() * .2) + 's'; c.appendChild(s); }
    el.appendChild(c); setTimeout(() => c.remove(), 1700);
  }
  function refrescarProgreso(dia) {
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
    if (k.length >= 3) { k[0].textContent = p.dias.filter((d) => estadoDia(d) === 'listo').length + '/' + p.dias.length; k[1].textContent = fmtH(horasHechas(p)); k[2].textContent = fmtH(r.falta); }
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

  // navegación con historial (el botón atrás del navegador y del teléfono funciona)
  let ultimaUrl = null;
  function urlActual() {
    if (S.wiz) return location.pathname + '?nuevo=1';
    if (S.plan) return location.pathname + '?plan=' + encodeURIComponent(S.plan.id);
    return location.pathname;
  }
  function nav() {
    const u = urlActual();
    if (u === ultimaUrl) return;
    try { history.pushState({ pe: 1 }, '', u); } catch (_) {}
    ultimaUrl = u;
  }
  function desdeURL() {
    const q = new URLSearchParams(location.search);
    S.wiz = null; S.plan = null; S.diaId = null;
    const pid = q.get('plan');
    if (pid && S.planes.some((p) => p.id === pid)) { S.plan = S.planes.find((p) => p.id === pid); S.vista = 'agenda'; }
    else if (q.get('nuevo')) {
      const mat = MATERIAS[q.get('materia')] ? q.get('materia') : null;
      const ev = q.get('evento');
      S.wiz = { paso: mat ? 2 : 1, materia: mat, unidades: [], extra: '', titulo: '', fecha_examen: q.get('fecha') || sumaDias(hoyISO(), 16), inicio: hoyISO(), horasLV: 4, horasFS: 3, descanso: -1, repaso: 1, auto: true, evento_id: ev || null };
      // sin id de evento: se busca el examen del calendario de esa fecha y materia
      if (!ev) { const e = S.examenes.find((x) => x.fecha === S.wiz.fecha_examen && (!mat || x.modulo === mat) && !planDeEvento(x.id)); if (e) S.wiz.evento_id = e.id; }
      const e2 = S.wiz.evento_id && eventoPorId(S.wiz.evento_id);
      if (e2) { S.wiz.fecha_examen = e2.fecha; if (!S.wiz.titulo) S.wiz.titulo = e2.titulo || ''; }
    }
    ultimaUrl = urlActual();
  }
  function abrirPlan(id) {
    const p = S.planes.find((x) => x.id === id); if (!p) return;
    S.plan = p; S.vista = 'agenda'; S.diaId = null; S.mes = null; S.wiz = null;
    nav(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function volverHub() { S.plan = null; S.wiz = null; nav(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  async function crearDesdeWizard() {
    const w = S.wiz;
    if (!w.materia) return toast('Elegí una materia');
    if (!w.unidades.length && !String(w.extra || '').trim()) return toast('Elegí al menos una unidad o agregá un tema');
    if (difDias(w.fecha_examen, w.inicio) < 1) return toast('La fecha del examen tiene que ser posterior al inicio');
    const p = planDesdeWizard(w);
    if (!p) return toast('No se pudo armar el plan con esas fechas');
    p.titulo = (w.titulo || '').trim() || `Examen · ${MATERIAS[w.materia].corto}`;
    const ya = await vincularOCrearEvento(p, w.evento_id);
    S.planes.push(p); guardar(p);
    S.wiz = null; S.plan = p; S.vista = 'agenda'; S.diaId = null;
    nav(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(ya ? '🔗 Plan creado y vinculado a tu examen del calendario' : (p.evento_id ? '📅 Plan creado y examen agendado' : '📅 Plan creado'));
  }

  async function importarJSON(texto) {
    if (!S.admin) return;
    let j; try { j = JSON.parse(texto); } catch (_) { return toast('El archivo no es un plan válido'); }
    const lista = Array.isArray(j) ? j : [j];
    let n = 0;
    for (const x of lista) {
      if (!x || !Array.isArray(x.dias) || !x.fecha_examen) continue;
      const p = Object.assign({}, x, { id: uid(), materia: MATERIAS[x.materia] ? x.materia : 'ginecologia', titulo: x.titulo || 'Plan importado', evento_id: null,
        creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString(), unidades: x.unidades || [], inicio: x.inicio || (x.dias[0] && x.dias[0].fecha) });
      p.dias = x.dias.map((d) => Object.assign({ horas: 0, temas: [], checklist: [], datos_duros: [], agenda: [], notas: '', caso: '', unidad: '' }, d, { id: uid(),
        temas: (d.temas || []).map((t) => Object.assign({ prio: 'media', hecho: false, manual: false, detalle: '', trampa: '' }, t, { id: uid() })),
        checklist: (d.checklist || []).map((c) => Object.assign({ hecho: false }, c, { id: uid() })) }));
      await vincularOCrearEvento(p, null);   // si ya hay un examen ese día, se vincula (no se duplica)
      S.planes.push(p); guardar(p); n++;
    }
    if (!n) return toast('No encontré ningún plan en ese archivo');
    await limpiarDuplicados();
    toast(n === 1 ? '📥 Plan importado y vinculado a tu examen' : `📥 ${n} planes importados`); render();
  }
  function exportarPlan() {
    const p = S.plan; if (!p) return;
    const blob = new Blob([JSON.stringify(p, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nikaplan-' + (p.titulo || 'plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.json';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function modalAjustes() {
    const p = S.plan; if (!p) return;
    const { m, cerrar } = modal(`<h3>⚙️ Ajustes del plan</h3>
      <div class="pe-field"><label for="aj-t">Nombre</label><input id="aj-t" value="${esc(p.titulo)}" maxlength="80"></div>
      <div class="pe-field"><label for="aj-f">Fecha del examen</label><input type="date" id="aj-f" value="${p.fecha_examen}"></div>
      <div class="pe-modal-acc"><button type="button" class="pe-btn pe-btn--pri" data-m="guardar">Guardar</button>
        <button type="button" class="pe-btn" data-m="vincular">🔗 Vincular examen</button>
        ${S.admin ? '<button type="button" class="pe-btn" data-m="exportar">📤 Exportar</button>' : ''}
        <button type="button" class="pe-btn pe-btn--peligro" data-m="borrar">🗑️ Eliminar plan</button></div>`);
    m.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      if (b.dataset.m === 'guardar') {
        const t = m.querySelector('#aj-t').value.trim(), f = m.querySelector('#aj-f').value;
        if (t) p.titulo = t;
        if (f) p.fecha_examen = f;
        guardar(p); moverEvento(p); cerrar(); render(); toast('Plan actualizado');
      } else if (b.dataset.m === 'vincular') { cerrar(); modalVincular(p); }
      else if (b.dataset.m === 'exportar') exportarPlan();
      else if (b.dataset.m === 'borrar') {
        if (!confirm('¿Eliminar este plan? El examen del calendario no se borra.')) return;
        S.planes = S.planes.filter((x) => x.id !== p.id); guardarLocal(); borrarNube(p.id);
        if (p.evento_propio) borrarEventoPorId(p.evento_id);
        cerrar(); volverHub(); toast('Plan eliminado');
      }
    });
  }

  // ---------- eventos de la interfaz ----------
  function onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, p = S.plan;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
    switch (a) {
      case 'campus': location.href = 'campus.html'; return;
      case 'nuevo': return nuevoWizard();
      case 'guia': return modalGuia();
      case 'modelo': return modalModelo();
      case 'hub': return volverHub();
      case 'abrir': return abrirPlan(el.dataset.id);
      case 'importar': { const f = root.querySelector('#pe-file'); if (f) f.click(); return; }
      case 'plan-de-evento': { const ev = eventoPorId(el.dataset.e); if (!ev) return; nuevoWizard({ materia: MATERIAS[ev.modulo] ? ev.modulo : null, paso: MATERIAS[ev.modulo] ? 2 : 1, fecha_examen: ev.fecha, titulo: ev.titulo || '', evento_id: ev.id }); return; }
      case 'adjuntar': return modalAdjuntar(el.dataset.e);
      case 'vincular': return modalVincular(p);
      case 'sync-fecha': { const ev = eventoPorId(p.evento_id); if (ev) { p.fecha_examen = ev.fecha; guardar(p); render(); toast('Fecha actualizada'); } return; }
      case 'materia': S.wiz.materia = el.dataset.m; S.wiz.unidades = []; S.wiz.plantilla = null; S.wiz.paso = 2; return render();
      case 'usar-plantilla': { const T = plantillaPorId(el.dataset.id); if (!T) return; S.wiz.plantilla = T.id; S.wiz.unidades = T.unidades.slice(); S.wiz.titulo = T.titulo; S.wiz.paso = 3; S.wiz.auto = true; aplicarRecomendado(S.wiz, 1); return render(); }
      case 'quitar-plantilla': S.wiz.plantilla = null; S.wiz.paso = 2; return render();
      case 'previa-plantilla': return modalPrevia(el.dataset.id);
      case 'todas': { const cat = S.catalogo[S.wiz.materia] || []; const todas = cat.every((u) => S.wiz.unidades.includes(u.id)); S.wiz.unidades = todas ? [] : cat.map((u) => u.id); return render(); }
      case 'sig': {
        if (S.wiz.paso === 2 && !S.wiz.unidades.length && !String(S.wiz.extra || '').trim()) return toast('Elegí al menos una unidad');
        S.wiz.paso = Math.min(3, S.wiz.paso + 1);
        if (S.wiz.paso === 3 && S.wiz.auto) aplicarRecomendado(S.wiz, 1);
        return render();
      }
      case 'ant': S.wiz.paso = Math.max(1, S.wiz.paso - 1); return render();
      case 'preset': S.wiz.auto = false; aplicarRecomendado(S.wiz, +el.dataset.f); return render();
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
      case 'add-dato': {
        const d = buscarDia(el.dataset.d); const inp = root.querySelector(`[data-add="dato"][data-d="${el.dataset.d}"]`);
        const v = inp && inp.value.trim(); if (!d || !v) return;
        (d.datos_duros = d.datos_duros || []).push(v); guardar(p); S.diaId = d.id; return render();
      }
      case 'quitar-dato': { const d = buscarDia(el.dataset.d); if (!d) return; d.datos_duros.splice(+el.dataset.k, 1); guardar(p); return render(); }
      case 'pendientes': return modalPendientes();
      case 'escrito': return modalEscrito(el.dataset.url);
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
  function sincInputsRitmo() { const w = S.wiz, l = root.querySelector('#pe-hlv'), f = root.querySelector('#pe-hfs'); if (l) l.value = w.horasLV; if (f) f.value = w.horasFS; }
  function actualizarWizardVivo() {
    const r = root.querySelector('#pe-resumen'); if (r) r.innerHTML = resumenWizard();
    const pr = root.querySelector('#pe-presets'); if (pr) pr.innerHTML = presetsHtml(S.wiz);
    const c = root.querySelector('#pe-contador-u'); if (c) c.textContent = `${S.wiz.unidades.length} de ${(S.catalogo[S.wiz.materia] || []).length} marcadas · ${nTemasWiz(S.wiz)} temas`;
  }
  function onChange(e) {
    const el = e.target, a = el.dataset && el.dataset.act;
    if (el.id === 'pe-file' && el.files && el.files[0]) { const r = new FileReader(); r.onload = () => importarJSON(String(r.result)); r.readAsText(el.files[0]); el.value = ''; return; }
    if (!a) return;
    const p = S.plan;
    if (a === 'unidad') {
      const u = el.dataset.u, w = S.wiz;
      w.unidades = el.checked ? w.unidades.concat(u).filter((x, i, arr) => arr.indexOf(x) === i) : w.unidades.filter((x) => x !== u);
      el.closest('.pe-unit-wrap').classList.toggle('on', el.checked); actualizarWizardVivo(); return;
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
    const w = S.wiz; if (!w) return;
    if (a === 'fex') { w.fecha_examen = el.value; if (w.auto) aplicarRecomendado(w, 1); actualizarWizardVivo(); sincInputsRitmo(); return; }
    if (a === 'ini') { w.inicio = el.value; if (w.auto) aplicarRecomendado(w, 1); actualizarWizardVivo(); sincInputsRitmo(); return; }
    if (a === 'hlv') { w.auto = false; w.horasLV = Math.max(0.5, num(el.value, 4)); actualizarWizardVivo(); return; }
    if (a === 'hfs') { w.auto = false; w.horasFS = Math.max(0, num(el.value, 3)); actualizarWizardVivo(); return; }
    if (a === 'desc') { w.descanso = parseInt(el.value, 10); if (w.auto) aplicarRecomendado(w, 1); actualizarWizardVivo(); sincInputsRitmo(); return; }
    if (a === 'rep') { w.repaso = parseInt(el.value, 10); if (w.auto) aplicarRecomendado(w, 1); actualizarWizardVivo(); sincInputsRitmo(); return; }
    if (a === 'titulo') { w.titulo = el.value; return; }
    if (a === 'extra') { w.extra = el.value; actualizarWizardVivo(); return; }
  }
  function onInput(e) {
    const el = e.target;
    if (!S.wiz || !el.dataset) return;
    if (el.dataset.act === 'extra') S.wiz.extra = el.value;
    if (el.dataset.act === 'titulo') S.wiz.titulo = el.value;
  }
  function onKey(e) {
    const el = e.target;
    if (e.key === 'Enter' && el.dataset && el.dataset.add) {
      e.preventDefault();
      const acc = { tema: 'add-tema', check: 'add-check', dato: 'add-dato' }[el.dataset.add];
      const b = root.querySelector(`[data-act="${acc}"][data-d="${el.dataset.d}"]`); if (b) b.click();
    } else if ((e.key === 'Enter' || e.key === ' ') && el.matches && el.matches('.pe-plan[data-act], tr[data-act], .pe-cal-c[data-act]')) { e.preventDefault(); el.click(); }
  }

  // ---------- arranque ----------
  async function esAdmin() {
    try {
      const c = db();
      if (c && S.user) {
        const { data } = await c.from('profiles').select('role, tipo_cuenta').eq('id', S.user.id).single();
        if (data) return data.role === 'admin' || data.tipo_cuenta === 'admin';
      }
    } catch (_) {}
    try { return !!(window.NikaAcceso && window.NikaAcceso.tipoCuenta && window.NikaAcceso.tipoCuenta() === 'admin'); } catch (_) { return false; }
  }
  async function iniciar() {
    root = document.getElementById('pe-root'); if (!root) return;
    root.innerHTML = '<div class="pe-cargando"><span></span><p>Cargando tus planes…</p></div>';
    try { if (window.NikaAuth && window.NikaAuth.ready) await window.NikaAuth.ready; } catch (_) {}
    try { const c = db(); const { data } = c ? await c.auth.getUser() : { data: {} }; S.user = data && data.user; } catch (_) {}
    if (!S.user) { try { const cu = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (cu && cu.id) S.user = { id: cu.id }; } catch (_) {} }
    if (!S.user) { root.innerHTML = '<div class="pe-vacio"><div class="pe-vacio-ico">🔒</div><h3>Iniciá sesión</h3><p>Entrá a tu cuenta desde el campus para armar tus planes.</p><a class="pe-btn pe-btn--pri" href="campus.html">Ir al campus</a></div>'; return; }
    S.planes = leerLocal();
    await Promise.all([cargarCatalogo(), cargarNube(), cargarExamenes()]);
    S.admin = await esAdmin();
    const q = await limpiarDuplicados();
    root.addEventListener('click', onClick); root.addEventListener('change', onChange); root.addEventListener('input', onInput); root.addEventListener('keydown', onKey);
    window.addEventListener('popstate', () => { desdeURL(); render(); });
    // el Pomodoro (en otra pestaña o página) acredita horas al plan: se recarga lo guardado y se redibuja sin pisar lo que se escribe
    window.addEventListener('storage', (e) => {
      if (e.key !== claveLocal()) return;
      const ae = document.activeElement; if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      S.planes = leerLocal();
      if (S.plan) S.plan = S.planes.find((x) => x.id === S.plan.id) || null;
      render();
    });
    window.addEventListener('nika:plan-pomodoro', () => { S.planes = leerLocal(); if (S.plan) S.plan = S.planes.find((x) => x.id === S.plan.id) || S.plan; render(); });
    desdeURL();
    render();
    if (q) toast('🧹 Quité un examen o plan repetido');
  }
  window.NikaPlan = { iniciar, _estado: S, ritmo, planesDe: () => S.planes, colorDias, limpiarDuplicados };
  document.addEventListener('DOMContentLoaded', iniciar);
})();
