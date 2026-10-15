/* CAMPUS NIKA · "Tu rendimiento": resumen semanal con historial desde que creaste la cuenta.
   Pestañas: Semana (navegable) · Evolución (todas las semanas) · Comparar (dos semanas a elección).
   Usa los mismos datos que "Mi Rendimiento" (study_sessions y exam_results) más las notas tomadas. */
(function () {
  'use strict';
  const COLORES = { cirugia: '#6366f1', ginecologia: '#ec4899', siam: '#06b6d4', pfo: '#f59e0b', medicinalegal: '#be123c', medicinadeportiva: '#16a34a' };
  const NOMBRES = { cirugia: 'Cirugía', ginecologia: 'Ginecología', siam: 'S.I.A.M.', pfo: 'PFO', medicinalegal: 'Medicina Legal', medicinadeportiva: 'Medicina Deportiva' };
  const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const lunes = (f) => { const x = inicioDia(new Date(f)); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getTime(); };
  const sumarDias = (ms, n) => { const x = new Date(ms); x.setDate(x.getDate() + n); return x.getTime(); };
  const hm = (min) => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h > 0 ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min'; };
  const corto = (ms) => new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  const ef = (w) => (w.preg ? Math.round(w.ok / w.preg * 100) : null);

  let semanas = [], sel = 0, tab = 'semana', metrica = 'min', cmpA = 0, cmpB = 0, miembro = null, raiz = null, ahora = new Date();

  /* ---------- datos ---------- */
  function construir(datos, notas, creado) {
    const mapa = new Map();
    const get = (k) => { if (!mapa.has(k)) mapa.set(k, { inicio: k, min: 0, ses: 0, sim: 0, preg: 0, ok: 0, dias: new Set(), porDia: [0, 0, 0, 0, 0, 0, 0], porMat: {}, ups: {}, notas: 0 }); return mapa.get(k); };
    let primero = Infinity;
    (datos.sesiones || []).forEach((s) => {
      if (s.completed === false || !s.completed_at) return;
      const t = new Date(s.completed_at); if (isNaN(t)) return;
      primero = Math.min(primero, t.getTime());
      const w = get(lunes(t)), m = Number(s.duration_minutes) || 0, dow = (t.getDay() + 6) % 7;
      w.min += m; w.ses += 1; w.dias.add(inicioDia(t).getTime()); w.porDia[dow] += m;
      const k = s.modulo || 'otros'; w.porMat[k] = (w.porMat[k] || 0) + m;
    });
    (datos.examenes || []).forEach((x) => {
      const t = new Date(x.created_at); if (isNaN(t)) return;
      primero = Math.min(primero, t.getTime());
      const w = get(lunes(t));
      w.sim += 1; w.preg += Number(x.total_questions) || 0; w.ok += Number(x.correct_count) || 0; w.dias.add(inicioDia(t).getTime());
      Object.entries(x.by_up || {}).forEach(([up, v]) => {
        const k = (x.modulo || 'cirugia') + '|' + up, o = w.ups[k] || (w.ups[k] = { total: 0, ok: 0 });
        o.total += Number(v && v.total) || 0; o.ok += Number(v && v.correct) || 0;
      });
    });
    (notas || []).forEach((n) => { const t = new Date(n.creado_en); if (!isNaN(t)) get(lunes(t)).notas += 1; });
    const cr = creado ? new Date(creado).getTime() : NaN;
    miembro = !isNaN(cr) ? cr : (isFinite(primero) ? primero : ahora.getTime());
    const desde = lunes(Math.min(miembro, isFinite(primero) ? primero : miembro)), hasta = lunes(ahora);
    for (let k = desde; k <= hasta; k = sumarDias(k, 7)) get(k);
    return [...mapa.values()].sort((a, b) => a.inicio - b.inicio);
  }

  const etiquetaSemana = (i) => { const d = semanas.length - 1 - i; return d === 0 ? 'Esta semana' : d === 1 ? 'Semana pasada' : 'Hace ' + d + ' semanas'; };
  const rango = (w) => corto(w.inicio) + ' – ' + corto(sumarDias(w.inicio, 6));
  const delta = (a, b) => (b > 0 ? Math.round((a - b) / b * 100) : (a > 0 ? 100 : 0));
  const chip = (d, unidad) => {
    if (d === 0) return '<span class="rs-d rs-d--igual">= igual</span>';
    return '<span class="rs-d ' + (d > 0 ? 'rs-d--sube' : 'rs-d--baja') + '">' + (d > 0 ? '▲ +' : '▼ ') + d + (unidad == null ? '%' : unidad) + '</span>';
  };
  const kpi = (ico, tt, val, extra, c) => '<div class="rs-k" style="--kc:' + c + '"><span class="rs-k-ico">' + ico + '</span><small>' + tt + '</small><b>' + val + '</b>' + extra + '</div>';
  const tile = (ico, tt, val, c, extra, pct) => '<div class="rs-t" style="--kc:' + c + '"><span class="rs-t-ico">' + ico + '</span><small>' + tt + '</small><b>' + val + '</b>'
    + (extra ? '<em class="rs-t-ex">' + extra + '</em>' : '') + (pct == null ? '' : '<span class="rs-t-bar"><i style="--w:' + Math.max(3, Math.min(100, pct)) + '%"></i></span>') + '</div>';

  /* ---------- pestaña: semana ---------- */
  function vistaSemana() {
    const A = semanas[sel], P = sel > 0 ? semanas[sel - 1] : null;
    const efA = ef(A), efP = P ? ef(P) : null;
    const hoyIdx = (ahora.getDay() + 6) % 7, esActual = sel === semanas.length - 1;
    const topMat = Object.entries(A.porMat).sort((a, b) => b[1] - a[1])[0];
    let flojo = null;
    Object.entries(A.ups).forEach(([k, v]) => { if (v.total >= 3) { const p = v.ok / v.total; if (!flojo || p < flojo.p) flojo = { k, p, total: v.total }; } });
    const act = A.min > 0 || A.sim > 0;
    let tit;
    if (!act) tit = esActual ? 'Esta semana todavía no estudiaste. Un Pomodoro de 25 minutos alcanza para arrancar. 💪' : 'Esa semana no registraste actividad.';
    else if (!P || (P.min === 0 && P.sim === 0)) tit = esActual ? '¡Vas arrancando la semana! Seguí sumando.' : 'Semana con actividad registrada.';
    else if (A.min > P.min) tit = (esActual ? '¡Buena semana! ' : 'Semana en alza: ') + 'estudiaste ' + delta(A.min, P.min) + '% más que la anterior. 🚀';
    else if (A.min === P.min) tit = 'Mismo ritmo que la semana anterior. Constancia pura. 🧱';
    else tit = esActual ? 'Llevás algo menos que la semana pasada, todavía estás a tiempo. 🌱' : 'Estudiaste algo menos que la semana anterior.';
    const max = Math.max(1, ...A.porDia);
    const barras = A.porDia.map((m, i) => {
      const f = sumarDias(A.inicio, i), futuro = esActual && i > hoyIdx;
      return '<div class="rs-col' + (esActual && i === hoyIdx ? ' hoy' : '') + (futuro ? ' fut' : '') + '" title="' + new Date(f).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }) + ': ' + hm(m) + '">'
        + '<em>' + (m ? Math.round(m) : '') + '</em><i style="--h:' + Math.max(m > 0 ? 10 : 4, Math.round(m / max * 100)) + '%"></i><span>' + DIAS[i] + '</span></div>';
    }).join('');
    const dest = [];
    if (topMat) dest.push('<li><span class="rs-pt" style="background:' + (COLORES[topMat[0]] || '#0ea5e9') + '"></span><span><b>Materia más estudiada:</b> ' + esc(NOMBRES[topMat[0]] || topMat[0]) + ' · ' + hm(topMat[1]) + '</span></li>');
    if (flojo) { const kk = flojo.k.split('|'); dest.push('<li><span class="rs-pt" style="background:#ef4444"></span><span><b>Para reforzar:</b> ' + esc(NOMBRES[kk[0]] || kk[0]) + ' · UP ' + esc(kk[1]) + ' (' + Math.round(flojo.p * 100) + '% de aciertos en ' + flojo.total + ' preguntas)</span></li>'); }
    if (A.notas) dest.push('<li><span class="rs-pt" style="background:#f59e0b"></span><span><b>Notas tomadas:</b> ' + A.notas + ' · <a href="mis_notas.html">Ver mis notas →</a></span></li>');
    if (!dest.length) dest.push('<li><span class="rs-pt" style="background:#94a3b8"></span><span>Cuando estudies o hagas simulacros, acá vas a ver tus puntos fuertes y lo que conviene reforzar.</span></li>');
    return '<div class="rs-nav"><button type="button" data-rs="ant" ' + (sel === 0 ? 'disabled' : '') + ' aria-label="Semana anterior">‹</button>'
      + '<div class="rs-nav-t"><b>' + etiquetaSemana(sel) + '</b><small>' + rango(A) + '</small></div>'
      + '<button type="button" data-rs="sig" ' + (esActual ? 'disabled' : '') + ' aria-label="Semana siguiente">›</button>'
      + (esActual ? '' : '<button type="button" class="rs-hoy" data-rs="hoy">Ir a esta semana</button>') + '</div>'
      + '<p class="rs-titular">' + tit + '</p>'
      + '<div class="rs-kpis">'
      + kpi('⏱️', 'Tiempo de estudio', hm(A.min), P ? chip(delta(A.min, P.min)) : '', '#0ea5e9')
      + kpi('🍅', 'Sesiones Pomodoro', A.ses, P ? chip(delta(A.ses, P.ses)) : '', '#ef4444')
      + kpi('📝', 'Simulacros', A.sim, efA == null ? '<span class="rs-d rs-d--igual">sin datos</span>' : '<span class="rs-d rs-d--igual">' + efA + '% aciertos' + (efP != null ? ' ' + (efA - efP >= 0 ? '▲' : '▼') + Math.abs(efA - efP) + ' pts' : '') + '</span>', '#8b5cf6')
      + kpi('🔥', 'Días activos', A.dias.size + '<em>/7</em>', P ? chip(A.dias.size - P.dias.size, ' días') : '', '#f59e0b')
      + '</div>'
      + '<div class="rs-fila"><div><h4 class="rs-sub">Minutos por día</h4><div class="rs-barras">' + barras + '</div></div>'
      + '<div><h4 class="rs-sub">Destacados</h4><ul class="rs-dest">' + dest.join('') + '</ul></div></div>';
  }

  /* ---------- pestaña: evolución ---------- */
  const METRICAS = { min: ['Horas de estudio', (w) => w.min, (v) => hm(v)], ses: ['Sesiones', (w) => w.ses, (v) => String(v)], sim: ['Simulacros', (w) => w.sim, (v) => String(v)], ef: ['% de aciertos', (w) => ef(w), (v) => (v == null ? '—' : v + '%')] };
  function vistaEvolucion() {
    const M = METRICAS[metrica], vals = semanas.map(M[1]), max = Math.max(1, ...vals.map((v) => v || 0));
    const tot = semanas.reduce((a, w) => ({ min: a.min + w.min, ses: a.ses + w.ses, sim: a.sim + w.sim, preg: a.preg + w.preg, ok: a.ok + w.ok, act: a.act + (w.min > 0 || w.sim > 0 ? 1 : 0), notas: a.notas + w.notas }), { min: 0, ses: 0, sim: 0, preg: 0, ok: 0, act: 0, notas: 0 });
    const mejor = semanas.reduce((b, w) => (!b || w.min > b.min ? w : b), null);
    const barras = semanas.map((w, i) => {
      const v = vals[i];
      return '<button type="button" class="rs-ev' + (i === sel ? ' sel' : '') + (i === semanas.length - 1 ? ' act' : '') + '" data-rs="ir" data-i="' + i + '" title="' + rango(w) + ': ' + M[2](v) + '">'
        + '<i style="--h:' + (v ? Math.max(6, Math.round(v / max * 100)) : 2) + '%"></i><span>' + new Date(w.inicio).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) + '</span></button>';
    }).join('');
    const sinDatos = tot.min === 0 && tot.sim === 0;
    return '<div class="rs-chips">' + Object.keys(METRICAS).map((k) => '<button type="button" class="' + (k === metrica ? 'on' : '') + '" data-rs="met" data-k="' + k + '">' + METRICAS[k][0] + '</button>').join('') + '</div>'
      + (sinDatos ? '<p class="rs-vacio">Todavía no hay actividad registrada. Con tus primeros Pomodoros y simulacros vas a ver acá tu evolución semana a semana.</p>'
        : '<div class="rs-evol" role="group" aria-label="Evolución semanal">' + barras + '</div><p class="rs-pista">Tocá una barra para ver esa semana en detalle.</p>')
      + '<h4 class="rs-sub" style="margin-top:18px">Desde que creaste tu cuenta</h4>'
      + '<div class="rs-tot">'
      + tile('📅', 'Miembro desde', new Date(miembro).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }), '#6366f1', 'hace ' + Math.max(1, Math.round((ahora.getTime() - miembro) / 86400000)) + ' días')
      + tile('⏱️', 'Horas totales', hm(tot.min), '#0ea5e9', 'promedio ' + hm(tot.min / Math.max(1, semanas.length)) + ' por semana')
      + tile('🍅', 'Sesiones Pomodoro', tot.ses, '#ef4444', tot.ses ? 'promedio ' + hm(tot.min / tot.ses) + ' por sesión' : 'todavía sin sesiones')
      + tile('📝', 'Simulacros', tot.sim, '#8b5cf6', tot.preg + ' preguntas respondidas')
      + tile('🎯', 'Aciertos globales', tot.preg ? Math.round(tot.ok / tot.preg * 100) + '%' : '—', '#16a34a', tot.preg ? tot.ok + ' correctas de ' + tot.preg : 'sin simulacros', tot.preg ? tot.ok / tot.preg * 100 : 0)
      + tile('🔥', 'Semanas activas', tot.act + ' de ' + semanas.length, '#f59e0b', 'constancia ' + Math.round(tot.act / Math.max(1, semanas.length) * 100) + '%', tot.act / Math.max(1, semanas.length) * 100)
      + tile('🏆', 'Mejor semana', mejor && mejor.min > 0 ? hm(mejor.min) : '—', '#eab308', mejor && mejor.min > 0 ? 'semana del ' + corto(mejor.inicio) : 'a la espera de tu primer récord')
      + tile('🗒️', 'Notas tomadas', tot.notas, '#14b8a6', '<a href="mis_notas.html">Ver mis notas →</a>')
      + '</div>';
  }

  /* ---------- pestaña: comparar ---------- */
  function vistaComparar() {
    const A = semanas[cmpA], B = semanas[cmpB];
    const opt = (v) => semanas.map((w, i) => '<option value="' + i + '"' + (i === v ? ' selected' : '') + '>' + etiquetaSemana(i) + ' · ' + rango(w) + '</option>').reverse().join('');
    const pct = (v) => (v == null ? '—' : v + '%');
    const filas = [
      ['Tiempo de estudio', A.min, B.min, hm], ['Sesiones Pomodoro', A.ses, B.ses, String], ['Simulacros', A.sim, B.sim, String],
      ['% de aciertos', ef(A), ef(B), pct], ['Días activos', A.dias.size, B.dias.size, (v) => v + '/7'], ['Notas tomadas', A.notas, B.notas, String]
    ];
    const rows = filas.map((f) => {
      const n = f[0], a = f[1], b = f[2], fm = f[3], m = Math.max(1, a || 0, b || 0);
      const d = (a == null || b == null) ? null : (n === '% de aciertos' ? a - b : delta(a, b));
      return '<div class="rs-cmp-f"><div class="rs-cmp-n">' + n + '</div>'
        + '<div class="rs-cmp-b"><span class="a"><i style="--w:' + Math.round((a || 0) / m * 100) + '%"></i><b>' + fm(a) + '</b></span><span class="b"><i style="--w:' + Math.round((b || 0) / m * 100) + '%"></i><b>' + fm(b) + '</b></span></div>'
        + '<div class="rs-cmp-d">' + (d == null ? '—' : chip(d, n === '% de aciertos' ? ' pts' : '%')) + '</div></div>';
    }).join('');
    const msg = A.min === B.min ? 'Ambas semanas tienen el mismo tiempo de estudio.' : (A.min > B.min ? 'La semana A fue más intensa: ' + hm(A.min - B.min) + ' más de estudio.' : 'La semana B fue más intensa: ' + hm(B.min - A.min) + ' más de estudio.');
    return '<div class="rs-cmp-sel"><label><span class="la">A</span><select data-rs="cmpA" aria-label="Semana A">' + opt(cmpA) + '</select></label><span class="rs-vs">vs</span><label><span class="lb">B</span><select data-rs="cmpB" aria-label="Semana B">' + opt(cmpB) + '</select></label></div>'
      + '<div class="rs-cmp">' + rows + '</div><p class="rs-pista">' + msg + '</p>';
  }

  /* ---------- armado ---------- */
  function render() {
    if (!raiz) return;
    const tabs = [['semana', '📅 Semana'], ['evolucion', '📈 Evolución'], ['comparar', '⚖️ Comparar']];
    const cuerpo = tab === 'semana' ? vistaSemana() : tab === 'evolucion' ? vistaEvolucion() : vistaComparar();
    raiz.innerHTML = '<div class="rs-cab"><div><small>Tu progreso</small><h3>📊 Tu rendimiento semanal</h3>'
      + '<p class="rs-rango">Miembro desde ' + new Date(miembro).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + semanas.length + (semanas.length === 1 ? ' semana' : ' semanas') + ' de historial</p></div>'
      + '<a class="rs-ir" href="sala_estudio.html">Ir a estudiar →</a></div>'
      + '<div class="rs-tabs" role="tablist">' + tabs.map((t) => '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" class="' + (t[0] === tab ? 'on' : '') + '" data-rs="tab" data-k="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>'
      + '<div class="rs-cuerpo">' + cuerpo + '</div>';
    requestAnimationFrame(() => requestAnimationFrame(() => raiz.classList.add('rs-anim')));
  }

  function eventos() {
    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rs]'); if (!b || b.tagName === 'SELECT') return;
      const a = b.dataset.rs;
      raiz.classList.remove('rs-anim');
      if (a === 'tab') tab = b.dataset.k;
      else if (a === 'ant' && sel > 0) sel--;
      else if (a === 'sig' && sel < semanas.length - 1) sel++;
      else if (a === 'hoy') sel = semanas.length - 1;
      else if (a === 'met') metrica = b.dataset.k;
      else if (a === 'ir') { sel = Number(b.dataset.i); tab = 'semana'; }
      render();
    });
    raiz.addEventListener('change', (e) => {
      const s = e.target.closest('select[data-rs]'); if (!s) return;
      if (s.dataset.rs === 'cmpA') cmpA = Number(s.value); else cmpB = Number(s.value);
      raiz.classList.remove('rs-anim'); render();
    });
  }

  function guardarFoto() {
    try {
      const h = {}; semanas.slice(-12).forEach((w) => { h[new Date(w.inicio).toISOString().slice(0, 10)] = { min: w.min, ses: w.ses, sim: w.sim, ef: ef(w), dias: w.dias.size, notas: w.notas }; });
      localStorage.setItem('nika_resumen_semanas', JSON.stringify(h));
    } catch (_) {}
  }

  async function iniciar() {
    if (raiz || document.getElementById('resumen-semanal') || !window.NikaRendimiento) return;
    // al final de la página, debajo de "Usuarios en línea"
    const ancla = document.getElementById('dashboard-online-users-widget') || document.getElementById('dashboard-community-widget') || document.getElementById('continuity-card');
    if (!ancla) return;
    const card = document.createElement('section'); card.id = 'resumen-semanal'; card.className = 'rs-card'; card.setAttribute('aria-label', 'Rendimiento semanal');
    card.innerHTML = '<div class="rs-cargando"><i></i><i></i><i></i></div>';
    ancla.insertAdjacentElement('afterend', card);
    raiz = card;
    // aparece con efecto al llegar con el scroll
    card.classList.add('rs-on');
    if (window.CampusVisual && window.CampusVisual.revelar) window.CampusVisual.revelar(card);
    try {
      const datos = await window.NikaRendimiento.cargarDatos();
      let notas = [], creado = null;
      try {
        const c = window.NikaSupabase && window.NikaSupabase.client;
        if (c) {
          const r = await c.auth.getSession(); creado = r.data && r.data.session && r.data.session.user && r.data.session.user.created_at;
          const q = await c.from('notas_estudio').select('creado_en,texto');
          notas = (q.data || []).filter((n) => String(n.texto || '').indexOf('"d":"20') < 0);
        }
      } catch (_) {}
      ahora = new Date(); semanas = construir(datos, notas, creado);
      sel = semanas.length - 1; cmpA = sel; cmpB = Math.max(0, sel - 1);
      guardarFoto(); eventos(); render();
    } catch (_) { card.remove(); raiz = null; }
  }

  function arrancar() {
    let t = 0;
    const esperar = setInterval(() => {
      t++;
      const u = window.NikaSupabase && typeof window.NikaSupabase.getNikaCurrentUsername === 'function' && window.NikaSupabase.getNikaCurrentUsername();
      if (u || t > 20) { clearInterval(esperar); if (u) setTimeout(iniciar, 600); }
    }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
