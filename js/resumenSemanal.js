/* CAMPUS NIKA · "Tu semana": resumen de tu actividad de los últimos 7 días comparado con los 7 anteriores.
   Usa los mismos datos que "Mi Rendimiento" (study_sessions y exam_results) y las notas tomadas.
   Guarda una foto semanal en este dispositivo (nika_resumen_semanas) para armar el historial. */
(function () {
  'use strict';
  const DIA = 86400000;
  const COLORES = { cirugia: '#6366f1', ginecologia: '#ec4899', siam: '#06b6d4', pfo: '#f59e0b', medicinalegal: '#be123c', medicinadeportiva: '#16a34a' };
  const NOMBRES = { cirugia: 'Cirugía', ginecologia: 'Ginecología', siam: 'S.I.A.M.', pfo: 'PFO', medicinalegal: 'Medicina Legal', medicinadeportiva: 'Medicina Deportiva' };
  const LETRAS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hm = (min) => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h > 0 ? h + ' h ' + (m ? m + ' min' : '') : m + ' min'; };

  function calcular(datos, notas, ahora) {
    const hoy = inicioDia(ahora).getTime();
    const idx = (f) => Math.floor((hoy - inicioDia(new Date(f)).getTime()) / DIA);   // 0 = hoy
    const vacio = () => ({ min: 0, ses: 0, dias: new Set(), porDia: Array(7).fill(0), porMat: {}, sim: 0, preg: 0, ok: 0, notas: 0, ups: {} });
    const S = { act: vacio(), ant: vacio() };
    (datos.sesiones || []).forEach((s) => {
      if (s.completed === false || !s.completed_at) return;
      const i = idx(s.completed_at); if (i < 0 || i > 13) return;
      const w = i <= 6 ? S.act : S.ant, m = Number(s.duration_minutes) || 0;
      w.min += m; w.ses += 1; w.dias.add(i);
      if (i <= 6) w.porDia[6 - i] += m;
      const k = s.modulo || 'otros'; w.porMat[k] = (w.porMat[k] || 0) + m;
    });
    (datos.examenes || []).forEach((x) => {
      const i = idx(x.created_at); if (i < 0 || i > 13) return;
      const w = i <= 6 ? S.act : S.ant;
      w.sim += 1; w.preg += Number(x.total_questions) || 0; w.ok += Number(x.correct_count) || 0; w.dias.add(i);
      if (i <= 6) Object.entries(x.by_up || {}).forEach(([up, v]) => {
        const k = (x.modulo || 'cirugia') + '|' + up, o = w.ups[k] || (w.ups[k] = { total: 0, ok: 0 });
        o.total += Number(v && v.total) || 0; o.ok += Number(v && v.correct) || 0;
      });
    });
    (notas || []).forEach((n) => { const i = idx(n.creado_en); if (i >= 0 && i <= 6) S.act.notas += 1; else if (i >= 7 && i <= 13) S.ant.notas += 1; });
    return S;
  }

  const delta = (a, b) => (b > 0 ? Math.round((a - b) / b * 100) : (a > 0 ? 100 : 0));
  const chip = (d, unidad) => {
    if (d === 0) return '<span class="rs-d rs-d--igual">= igual</span>';
    return '<span class="rs-d ' + (d > 0 ? 'rs-d--sube' : 'rs-d--baja') + '">' + (d > 0 ? '▲ +' : '▼ ') + d + (unidad || '%') + '</span>';
  };

  function pintar(S, ahora) {
    const A = S.act, P = S.ant;
    const efA = A.preg ? Math.round(A.ok / A.preg * 100) : null, efP = P.preg ? Math.round(P.ok / P.preg * 100) : null;
    const topMat = Object.entries(A.porMat).sort((a, b) => b[1] - a[1])[0];
    let flojo = null;
    Object.entries(A.ups).forEach(([k, v]) => { if (v.total >= 3) { const p = v.ok / v.total; if (!flojo || p < flojo.p) flojo = { k, p, total: v.total }; } });
    const actividad = A.min > 0 || A.sim > 0;
    let titular;
    if (!actividad) titular = 'Esta semana todavía no estudiaste. Un Pomodoro de 25 minutos alcanza para arrancar. 💪';
    else if (P.min === 0 && P.sim === 0) titular = '¡Primera semana registrada! Seguí así para ver cómo evolucionás.';
    else if (A.min > P.min) titular = '¡Buena semana! Estudiaste ' + delta(A.min, P.min) + '% más que la semana pasada. 🚀';
    else if (A.min === P.min) titular = 'Mantuviste el mismo ritmo que la semana pasada. Constancia pura. 🧱';
    else titular = 'Estudiaste algo menos que la semana pasada: todavía estás a tiempo de recuperarlo. 🌱';

    const max = Math.max(1, ...A.porDia);
    const hoyD = inicioDia(ahora);
    const barras = A.porDia.map((m, i) => {
      const f = new Date(hoyD.getTime() - (6 - i) * DIA);
      return '<div class="rs-col' + (i === 6 ? ' hoy' : '') + '" title="' + f.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }) + ': ' + hm(m) + '">'
        + '<i style="--h:' + Math.max(m > 0 ? 10 : 4, Math.round(m / max * 100)) + '%"></i><span>' + LETRAS[f.getDay()] + '</span></div>';
    }).join('');

    const desde = new Date(hoyD.getTime() - 6 * DIA).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    const hasta = ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    const dest = [];
    if (topMat) dest.push('<li><span class="rs-pt" style="background:' + (COLORES[topMat[0]] || '#0ea5e9') + '"></span><b>Materia más estudiada:</b> ' + esc(NOMBRES[topMat[0]] || topMat[0]) + ' · ' + hm(topMat[1]) + '</li>');
    if (flojo) { const [m, up] = flojo.k.split('|'); dest.push('<li><span class="rs-pt" style="background:#ef4444"></span><b>Para reforzar:</b> ' + esc(NOMBRES[m] || m) + ' · UP ' + esc(up) + ' (' + Math.round(flojo.p * 100) + '% de aciertos en ' + flojo.total + ' preguntas)</li>'); }
    if (A.notas) dest.push('<li><span class="rs-pt" style="background:#f59e0b"></span><b>Notas tomadas:</b> ' + A.notas + ' <a href="mis_notas.html">Ver mis notas →</a></li>');
    if (!dest.length) dest.push('<li><span class="rs-pt" style="background:#94a3b8"></span>Cuando estudies o hagas simulacros, acá vas a ver tus puntos fuertes y lo que conviene reforzar.</li>');

    return '<div class="rs-cab"><div><small>Resumen semanal</small><h3>📊 Tu semana</h3><p class="rs-rango">' + desde + ' – ' + hasta + ' · comparado con los 7 días anteriores</p></div>'
      + '<a class="rs-ir" href="sala_estudio.html">Ir a estudiar →</a></div>'
      + '<p class="rs-titular">' + titular + '</p>'
      + '<div class="rs-kpis">'
      + '<div class="rs-k"><small>Tiempo de estudio</small><b>' + hm(A.min) + '</b>' + chip(delta(A.min, P.min)) + '</div>'
      + '<div class="rs-k"><small>Sesiones Pomodoro</small><b>' + A.ses + '</b>' + chip(delta(A.ses, P.ses)) + '</div>'
      + '<div class="rs-k"><small>Simulacros</small><b>' + A.sim + '</b>' + (efA == null ? '<span class="rs-d rs-d--igual">sin datos</span>' : '<span class="rs-d rs-d--igual">' + efA + '% de aciertos' + (efP != null ? ' ' + (efA - efP >= 0 ? '▲' : '▼') + Math.abs(efA - efP) + ' pts' : '') + '</span>') + '</div>'
      + '<div class="rs-k"><small>Días activos</small><b>' + A.dias.size + '<em>/7</em></b>' + chip(A.dias.size - P.dias.size, ' días') + '</div>'
      + '</div>'
      + '<div class="rs-fila"><div class="rs-barras" aria-label="Minutos de estudio por día">' + barras + '</div><ul class="rs-dest">' + dest.join('') + '</ul></div>';
  }

  function guardarFoto(S, ahora) {
    try {
      const lun = inicioDia(ahora); lun.setDate(lun.getDate() - ((lun.getDay() + 6) % 7));
      const clave = lun.toISOString().slice(0, 10), A = S.act;
      let h = JSON.parse(localStorage.getItem('nika_resumen_semanas') || '{}');
      h[clave] = { min: A.min, ses: A.ses, sim: A.sim, ef: A.preg ? Math.round(A.ok / A.preg * 100) : null, dias: A.dias.size, notas: A.notas };
      const ks = Object.keys(h).sort(); while (ks.length > 12) delete h[ks.shift()];
      localStorage.setItem('nika_resumen_semanas', JSON.stringify(h));
    } catch (_) {}
  }

  async function iniciar() {
    const ancla = document.getElementById('continuity-card');
    if (!ancla || document.getElementById('resumen-semanal') || !window.NikaRendimiento) return;
    const card = document.createElement('section'); card.id = 'resumen-semanal'; card.className = 'rs-card'; card.setAttribute('aria-label', 'Resumen semanal');
    card.innerHTML = '<div class="rs-cargando"><i></i><i></i><i></i></div>';
    ancla.insertAdjacentElement('afterend', card);
    requestAnimationFrame(() => card.classList.add('rs-on'));
    try {
      const datos = await window.NikaRendimiento.cargarDatos();
      let notas = [];
      try {
        const c = window.NikaSupabase && window.NikaSupabase.client;
        if (c) { const { data } = await c.from('notas_estudio').select('creado_en,texto').gte('creado_en', new Date(Date.now() - 14 * DIA).toISOString()); notas = (data || []).filter((n) => String(n.texto || '').indexOf('"d":"20') < 0); }
      } catch (_) {}
      const ahora = new Date(), S = calcular(datos, notas, ahora);
      card.innerHTML = pintar(S, ahora); guardarFoto(S, ahora);
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('rs-anim')));
    } catch (_) { card.remove(); }
  }

  function arrancar() {
    // espera a que haya sesión (NikaRendimiento lanza error si no hay usuario)
    let t = 0;
    const esperar = setInterval(() => {
      t++;
      const u = window.NikaSupabase && typeof window.NikaSupabase.getNikaCurrentUsername === 'function' && window.NikaSupabase.getNikaCurrentUsername();
      if (u || t > 20) { clearInterval(esperar); if (u) setTimeout(iniciar, 600); }
    }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
