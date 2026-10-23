/* CAMPUS NIKA · Estadísticas personales.
   Junta lo que ya existe (rendimiento semanal, rendimiento académico, lectura, Pomodoros) en una sola página.
   Datos: NikaRendimiento (study_sessions / exam_results), pdf_progreso, pdf_lectura_dia y NikaTiempo (ritmo de lectura). */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sinMov = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hm = (min) => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h > 0 ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min'; };
  const COLORES = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#be123c', '#16a34a', '#8b5cf6', '#0ea5e9'];
  const cliente = () => (window.NikaSupabase && window.NikaSupabase.client) || window.supabaseClient || null;
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  // ---------- animaciones ----------
  function contar(el, hasta, formato, ms) {
    if (sinMov() || !isFinite(hasta)) { el.textContent = formato(hasta); return; }
    const t0 = performance.now(), dur = ms || 1400;
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = formato(hasta * e);
      if (k < 1) requestAnimationFrame(paso); else el.textContent = formato(hasta);
    };
    requestAnimationFrame(paso);
  }
  function aplicar(t) {
    $$('[data-w]', t).forEach((b) => { b.style.width = b.dataset.w + '%'; });
    $$('[data-h]', t).forEach((b) => { b.style.height = b.dataset.h + '%'; });
    $$('[data-dash]', t).forEach((c) => { c.style.strokeDasharray = c.dataset.dash; });
    $$('[data-cuenta]', t).forEach((b) => { if (!b._c) { b._c = 1; contar(b, +b.dataset.cuenta, (v) => String(Math.round(v))); } });
  }
  let io = null;
  function revelar(raiz) {
    if (!io) {
      io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target); aplicar(e.target); });
      }, { threshold: 0.18 });
    }
    // si la tarjeta ya se mostró (cuando todavía tenía el esqueleto), se aplica el contenido nuevo de una
    $$('.est-rev, .est-k', raiz || document).forEach((n) => { if (n.classList.contains('in')) aplicar(n); else io.observe(n); });
  }

  // ---------- hero ----------
  function hero(a, user) {
    const k = a.kpis, h = new Date().getHours();
    const saludo = (h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches') + ', ' + esc(user || 'estudiante') + ' 👋';
    $('#est-saludo').textContent = saludo.replace(/&amp;/g, '&');
    let sub;
    if (k.racha >= 2) sub = '🔥 Llevás ' + k.racha + ' días seguidos estudiando. ' + (k.tiempoHoyMin ? 'Hoy ya sumaste ' + hm(k.tiempoHoyMin) + '.' : 'Hoy todavía no registraste estudio: un Pomodoro mantiene la racha.');
    else if (k.tiempoTotalMin > 0) sub = 'Ya acumulaste ' + hm(k.tiempoTotalMin) + ' de estudio. ' + (k.tiempoHoyMin ? 'Hoy llevás ' + hm(k.tiempoHoyMin) + '.' : 'Un Pomodoro hoy arranca tu racha.');
    else sub = 'Cuando completes tu primer Pomodoro o simulacro, acá vas a ver tu progreso crecer.';
    $('#est-sub').textContent = sub;
    const vals = [[k.tiempoTotalMin / 60, (v) => (v < 10 ? v.toFixed(1).replace('.', ',') : String(Math.round(v)))], [k.pomodoros, (v) => String(Math.round(v))], [k.simulacros, (v) => String(Math.round(v))], [k.efectividad, (v) => String(Math.round(v)) + '%']];
    $$('#est-big .est-b b').forEach((b, i) => {
      if (vals[i][0] == null) { b.textContent = '—'; return; }
      contar(b, vals[i][0], vals[i][1], 1500);
    });
  }

  // ---------- académico ----------
  function radar(a) {
    const box = $('#est-radar'), R = a.radar.slice(0, 7);
    let cuerpo;
    if (!R.length) cuerpo = '<p class="est-vacio">Todavía no hay datos. Con tus primeros Pomodoros y simulacros vas a ver tu radar clínico.</p>';
    else if (R.length < 3) {
      cuerpo = '<div class="est-ol">' + R.map((r, i) => '<div class="est-ol-f" style="--c:' + COLORES[i % COLORES.length] + '"><div><b>' + esc(r.label) + '</b><small>' + hm(r.minutos) + ' de estudio</small></div><div class="est-ol-b"><i data-w="' + Math.max(4, r.aciertosPct == null ? 0 : r.aciertosPct) + '"></i></div><span class="est-ol-d">' + (r.aciertosPct == null ? 'sin simulacros' : r.aciertosPct + '% aciertos') + '</span></div>').join('') + '</div>';
    } else {
      const cx = 160, cy = 150, rad = 100, n = R.length;
      const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const pt = (i, v) => [cx + Math.cos(ang(i)) * rad * v / 100, cy + Math.sin(ang(i)) * rad * v / 100];
      const poli = (f) => R.map((r, i) => pt(i, f(r)).map((x) => x.toFixed(1)).join(',')).join(' ');
      const rejilla = [25, 50, 75, 100].map((p) => '<polygon class="est-rd-grid" points="' + R.map((_, i) => pt(i, p).map((x) => x.toFixed(1)).join(',')).join(' ') + '"/>').join('');
      const ejes = R.map((_, i) => { const p = pt(i, 100); return '<line class="est-rd-eje" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>'; }).join('');
      const etiq = R.map((r, i) => { const p = pt(i, 122); const an = p[0] < cx - 8 ? 'end' : p[0] > cx + 8 ? 'start' : 'middle'; return '<text class="est-rd-lbl" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="' + an + '">' + esc(r.label.length > 14 ? r.label.slice(0, 13) + '…' : r.label) + '</text>'; }).join('');
      const puntos = R.map((r, i) => { const p = pt(i, r.tiempoPct); const q = r.aciertosPct == null ? null : pt(i, r.aciertosPct); return '<circle class="est-rd-p" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="#6366f1"><title>' + esc(r.label) + ': ' + hm(r.minutos) + '</title></circle>' + (q ? '<circle class="est-rd-p" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4.5" fill="#10b981"><title>' + esc(r.label) + ': ' + r.aciertosPct + '% de aciertos</title></circle>' : ''); }).join('');
      cuerpo = '<div class="est-radar-w"><svg viewBox="-30 0 380 310" role="img" aria-label="Radar clínico: tiempo de estudio y aciertos por área">' + rejilla + ejes
        + '<polygon class="est-rd-t" points="' + poli((r) => r.tiempoPct) + '"/><polygon class="est-rd-a" points="' + poli((r) => r.aciertosPct || 0) + '"/>' + puntos + etiq + '</svg></div>'
        + '<div class="est-leyenda"><span><i style="background:#6366f1"></i>Tiempo de estudio</span><span><i style="background:#10b981"></i>% de aciertos</span></div>';
    }
    box.innerHTML = '<h4>🧭 Radar clínico</h4><p class="est-nota">Tu tiempo de estudio frente a tu efectividad en cada área.</p>' + cuerpo + (a.insight ? '<p class="est-insight">💡 ' + esc(a.insight) + '</p>' : '');
  }
  function olvido(a) {
    const box = $('#est-olvido'), O = a.olvido, max = 14;
    const fila = (t, sub, d, e) => '<div class="est-ol-f' + (e.clave === 'critico' ? ' est-pulso' : '') + '" style="--c:' + e.color + '"><div><b>' + esc(t) + '</b><small>' + e.emoji + ' ' + e.texto + '</small></div><div class="est-ol-b"><i data-w="' + Math.max(6, Math.min(100, d / max * 100)) + '"></i></div><span class="est-ol-d">' + (d === 0 ? 'hoy' : 'hace ' + d + (d === 1 ? ' día' : ' días')) + '</span></div>';
    let h = '<h4>🧠 Curva del olvido</h4><p class="est-nota">Cuánto hace que no repasás cada área. Las barras largas piden repaso.</p>';
    if (!O.areas.length) h += '<p class="est-vacio">Todavía no hay actividad para medir.</p>';
    else {
      h += '<div class="est-ol">' + O.areas.slice(0, 6).map((x) => fila(x.label, '', x.dias, x.estado)).join('') + '</div>';
      const ups = O.ups.filter((u) => u.dias > 3).slice(0, 4);
      if (ups.length) h += '<div class="est-ol-h">Unidades para repasar primero</div><div class="est-ol">' + ups.map((u) => fila(u.label + ' · ' + u.up, '', u.dias, u.estado)).join('') + '</div>';
    }
    box.innerHTML = h;
  }

  // ---------- lectura ----------
  async function lectura() {
    const T = window.NikaTiempo, c = cliente();
    const kp = $('#est-lec-kpis'), dd = $('#est-lec-dias'), pp = $('#est-lec-pdfs');
    let prog = [], dias = {};
    try {
      if (T) await T.hidratar();
      if (c) {
        const r = await c.from('pdf_progreso').select('file_id,titulo,ultima_pagina,total_paginas,leidas,updated_at').order('updated_at', { ascending: false }).limit(200);
        prog = r.data || [];
        const desde = new Date(Date.now() - 14 * 864e5);
        const d = await c.from('pdf_lectura_dia').select('dia,segs').gte('dia', iso(desde));
        (d.data || []).forEach((x) => { dias[x.dia] = x.segs; });
      }
    } catch (_) {}
    let rc = { hoy: 0, meta: 1800, racha: 0, cumplida: false };
    if (T) { try { rc = await T.racha(); } catch (_) {} dias[iso(new Date())] = Math.max(dias[iso(new Date())] || 0, rc.hoy); }
    const completos = prog.filter((r) => r.total_paginas > 0 && (r.leidas || []).length >= r.total_paginas || (r.total_paginas === 0 && (r.leidas || []).length)).length;
    const enCurso = prog.filter((r) => { const l = (r.leidas || []).filter((x) => x > 0).length; return r.total_paginas > 0 && l > 0 && l < r.total_paginas; });
    const paginas = prog.reduce((s, r) => s + (r.total_paginas > 0 ? (r.leidas || []).filter((x) => x > 0).length : 0), 0);
    let restante = 0;
    if (T) { try { await T.datosLista(enCurso.map((r) => r.file_id)); } catch (_) {} }
    const filas = enCurso.map((r) => { const e = T ? T.estimarArchivo(r.file_id, r) : null; if (e) restante += e.seg; return { r, e }; });
    const rg = T ? T.ritmoGlobal() : { seg: null, n: 0 };
    const ritmo = rg.seg ? (rg.seg >= 60 ? Math.floor(rg.seg / 60) + ' min ' + String(Math.round(rg.seg % 60)).padStart(2, '0') + ' s' : Math.round(rg.seg) + ' s') : '—';
    const pct = Math.min(100, Math.round(rc.hoy / rc.meta * 100));
    const k = (i, t, v, ex, col, d, extra) => '<div class="est-k' + (extra || '') + '" style="--c:' + col + ';--d:' + d + 's"><span class="i">' + i + '</span><small>' + t + '</small><b ' + (typeof v === 'number' ? 'data-cuenta="' + v + '"' : '') + '>' + (typeof v === 'number' ? '0' : v) + '</b><em>' + ex + '</em></div>';
    kp.innerHTML = k('📄', 'Páginas leídas', paginas, completos + (completos === 1 ? ' PDF completo' : ' PDFs completos') + ' · ' + enCurso.length + ' en curso', '#0ea5e9', 0)
      + k('⏱️', 'Tu ritmo', ritmo, rg.n ? 'por página · ' + rg.n + ' páginas medidas' : 'se calcula leyendo en el Lector NikaMed', '#8b5cf6', .08)
      + k('🏁', 'Te falta para terminar', restante ? hm(restante / 60) : '—', enCurso.length ? 'de lo que ya empezaste' : 'no tenés PDFs en curso', '#f59e0b', .16)
      + '<div class="est-k' + (rc.cumplida ? ' ok' : '') + '" style="--c:#16a34a;--d:.24s"><span class="i">🎯</span><small>Meta de hoy</small><div style="display:flex;align-items:center;gap:12px;margin-top:2px"><div class="est-aro" style="--p:' + pct + '"><span>' + pct + '%</span></div><div><b style="font-size:1.25rem">' + Math.round(rc.hoy / 60) + '/' + Math.round(rc.meta / 60) + ' min</b><br><em>' + (rc.racha ? '🔥 ' + rc.racha + (rc.racha === 1 ? ' día' : ' días') + ' de racha' : 'sin racha todavía') + '</em></div></div></div>';
    // últimos 14 días
    const hoyD = new Date(), hoyK = iso(hoyD); const cols = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(hoyD.getFullYear(), hoyD.getMonth(), hoyD.getDate() - i); cols.push({ d, k: iso(d), m: Math.round((dias[iso(d)] || 0) / 60) }); }
    const mx = Math.max(10, ...cols.map((x) => x.m));
    const total14 = cols.reduce((s, x) => s + x.m, 0);
    dd.innerHTML = '<h4>📆 Lectura de los últimos 14 días</h4><p class="est-nota">' + (total14 ? 'Leíste ' + hm(total14) + ' en total. Las barras verdes alcanzaron tu meta.' : 'Todavía no hay lectura medida: abrí un PDF en el Lector NikaMed y se empieza a registrar.') + '</p>'
      + '<div class="est-cols">' + cols.map((x, i) => '<div class="est-col' + (x.k === hoyK ? ' hoy' : '') + (x.m * 60 >= rc.meta ? ' ok' : '') + '" title="' + x.d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }) + ': ' + x.m + ' min"><em>' + (x.m || '') + '</em><i data-h="' + (x.m ? Math.max(6, Math.round(x.m / mx * 100)) : 3) + '" style="--d:' + (i * 0.05) + 's"></i><span>' + ['D', 'L', 'M', 'M', 'J', 'V', 'S'][x.d.getDay()] + '</span></div>').join('') + '</div>';
    pp.innerHTML = '<h4>📚 PDFs en curso</h4><p class="est-nota">Lo que empezaste y cuánto te falta, según tu ritmo.</p>'
      + (filas.length ? '<div class="est-pdfs">' + filas.slice(0, 12).map(({ r, e }) => { const l = (r.leidas || []).filter((x) => x > 0).length, p = Math.round(l / r.total_paginas * 100); return '<div class="est-pdf"><b title="' + esc(r.titulo || '') + '">' + esc(r.titulo || 'Material') + '</b><div class="bar"><i data-w="' + p + '"></i></div><div class="m"><span>' + l + '/' + r.total_paginas + ' págs · ' + p + '%</span><span>' + (e ? '⏱ ~' + T.fmt(e.seg) : '') + '</span></div></div>'; }).join('') + '</div>' : '<p class="est-vacio">No tenés PDFs empezados. Cuando abras uno en la sala de estudio, aparece acá.</p>');
    revelar($('#est-lectura'));
  }

  // ---------- constancia ----------
  function constancia(datos, a) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dow = (hoy.getDay() + 6) % 7;
    const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - dow - 11 * 7);
    const min = {};
    (datos.sesiones || []).forEach((s) => { if (s.completed === false || !s.completed_at) return; const d = new Date(s.completed_at); if (isNaN(d)) return; const k = iso(d); min[k] = (min[k] || 0) + (Number(s.duration_minutes) || 0); });
    (datos.examenes || []).forEach((x) => { const d = new Date(x.created_at); if (isNaN(d)) return; const k = iso(d); min[k] = (min[k] || 0) + 15; });
    const celdas = []; let activos = 0, mejor = { k: null, m: 0 }, tot = 0;
    for (let i = 0; i < 12 * 7; i++) {
      const d = new Date(inicio); d.setDate(inicio.getDate() + i); const k = iso(d), m = min[k] || 0, fut = d > hoy;
      if (!fut && m > 0) activos++; if (!fut) tot += m; if (m > mejor.m) mejor = { k, m, d };
      const lv = fut ? -1 : m === 0 ? 0 : m <= 25 ? 1 : m <= 60 ? 2 : m <= 120 ? 3 : 4;
      if (lv >= 0) celdas.push('<i class="l' + lv + (k === iso(hoy) ? ' hoy' : '') + '" style="--d:' + (i * 0.008).toFixed(3) + 's" title="' + d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }) + ': ' + (m ? hm(m) : 'sin actividad') + '"></i>');
      else celdas.push('<i style="visibility:hidden"></i>');
    }
    const box = $('#est-mapa');
    box.innerHTML = '<h4>🗓️ Mapa de constancia</h4><p class="est-nota">Cada cuadrito es un día: cuanto más oscuro, más estudiaste.</p>'
      + '<div class="est-mapa-w"><div class="est-mapa">' + celdas.join('') + '</div></div>'
      + '<div class="est-esc">Menos <i style="background:rgba(148,163,184,.3)"></i><i style="background:#bae6fd"></i><i style="background:#7dd3fc"></i><i style="background:#38bdf8"></i><i style="background:linear-gradient(135deg,#6366f1,#a855f7)"></i> Más</div>'
      + '<div class="est-hechos"><div><b>' + activos + ' / 84</b><small>días activos</small></div><div><b>' + (mejor.m ? hm(mejor.m) : '—') + '</b><small>mejor día' + (mejor.d ? ' · ' + mejor.d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '') + '</small></div><div><b>' + hm(tot) + '</b><small>en 12 semanas</small></div></div>';
    // donut por materia
    const R = a.radar.filter((r) => r.minutos > 0), T = R.reduce((s, r) => s + r.minutos, 0), dbox = $('#est-dona');
    if (!T) { dbox.innerHTML = '<h4>🥧 Tiempo por materia</h4><p class="est-vacio">Todavía no hay minutos registrados.</p>'; return; }
    const r0 = 80, circ = 2 * Math.PI * r0; let off = 0;
    const arcos = R.map((r, i) => { const frac = r.minutos / T, largo = frac * circ; const el = '<circle class="est-dn" cx="110" cy="110" r="' + r0 + '" stroke="' + COLORES[i % COLORES.length] + '" stroke-dashoffset="' + (-off).toFixed(2) + '" data-dash="' + Math.max(0, largo - 2).toFixed(2) + ' ' + circ.toFixed(2) + '" style="--d:' + (i * 0.12) + 's"><title>' + esc(r.label) + ': ' + hm(r.minutos) + ' (' + Math.round(frac * 100) + '%)</title></circle>'; off += largo; return el; }).join('');
    dbox.innerHTML = '<h4>🥧 Tiempo por materia</h4><p class="est-nota">Cómo repartís tus horas de estudio.</p><div class="est-dona-w"><svg viewBox="0 0 220 220" role="img" aria-label="Tiempo de estudio por materia"><circle cx="110" cy="110" r="' + r0 + '" fill="none" stroke="rgba(148,163,184,.2)" stroke-width="26"/>' + arcos + '</svg><div class="est-dona-c"><b>' + hm(T) + '</b><small>en total</small></div>'
      + '<div class="est-dleg">' + R.map((r, i) => '<div><i style="background:' + COLORES[i % COLORES.length] + '"></i>' + esc(r.label) + '<span>' + hm(r.minutos) + ' · ' + Math.round(r.minutos / T * 100) + '%</span></div>').join('') + '</div></div>';
  }

  // ---------- navegación ----------
  function navegacion() {
    const nav = $('#est-nav'), secs = $$('.est-sec');
    nav.addEventListener('click', (e) => { const b = e.target.closest('[data-sec]'); if (!b) return; const s = document.getElementById(b.dataset.sec); if (s) s.scrollIntoView({ behavior: sinMov() ? 'auto' : 'smooth', block: 'start' }); });
    const so = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) $$('button', nav).forEach((b) => b.classList.toggle('on', b.dataset.sec === en.target.id)); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    secs.forEach((s) => so.observe(s));
  }

  async function iniciar() {
    navegacion();
    const R = window.NikaRendimiento; if (!R) return;
    let datos;
    try { datos = await R.cargarDatos(); } catch (_) { $('#est-saludo').textContent = 'No pudimos cargar tus estadísticas'; $('#est-sub').textContent = 'Revisá tu conexión y recargá la página.'; return; }
    const a = R.analizar(datos);
    const user = window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername();
    hero(a, user); radar(a); olvido(a); constancia(datos, a);
    revelar(document);
    lectura();
  }

  function arrancar() {
    let t = 0;
    const esperar = setInterval(() => {
      t++;
      const u = window.NikaSupabase && typeof window.NikaSupabase.getNikaCurrentUsername === 'function' && window.NikaSupabase.getNikaCurrentUsername();
      if (u || t > 24) { clearInterval(esperar); if (u) setTimeout(iniciar, 300); else { $('#est-saludo').textContent = 'Iniciá sesión para ver tus estadísticas'; $('#est-sub').textContent = 'Tus datos se guardan en tu cuenta.'; } }
    }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
