/* NikaPlan ↔ Pomodoro: cada bloque de foco que termina (o se corta con tiempo cumplido) descuenta horas del plan.
   Se carga en las páginas que tienen el Pomodoro. El motor avisa con el evento "nika:pomodoro-minutos".
   Regla: el tiempo se acredita SOLO a los planes que el usuario eligió (interruptor “Contar mi Pomodoro” de cada plan) y de
   esa materia, en el día de HOY; si hoy no hay día de estudio, al primer día anterior que quedó pendiente. Los planes viven en localStorage
   (nika_planes_examen_v1_<usuario>) y la página de NikaPlan los sincroniza con la nube. */
(function () {
  'use strict';
  const PREFIJO = 'nika_planes_examen_v1_';
  const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  function claveUsuario() {
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (u && u.id && localStorage.getItem(PREFIJO + u.id) != null) return PREFIJO + u.id; } catch (_) {}
    const claves = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(PREFIJO) === 0) claves.push(k); } } catch (_) {}
    if (claves.length === 1) return claves[0];
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (u && u.id) return PREFIJO + u.id; } catch (_) {}
    return null;
  }
  function progresoDia(d) {
    const it = (d.temas || []).concat(d.checklist || []);
    return it.length ? it.filter((x) => x.hecho).length / it.length : 0;
  }
  function acreditar(detalle) {
    const minutos = Number(detalle && detalle.minutes);
    if (!(minutos >= 1)) return;
    const k = claveUsuario(); if (!k) return;
    let planes; try { planes = JSON.parse(localStorage.getItem(k) || '[]'); } catch (_) { return; }
    if (!Array.isArray(planes) || !planes.length) return;
    const hoy = hoyISO();
    const modulo = String(detalle.moduleId || '').toLowerCase();
    // solo cuentan los planes que el usuario eligió (p.pomodoro === true), vigentes y de esa materia
    const elegidos = planes.filter((p) => p && p.pomodoro === true && p.fecha_examen >= hoy && Array.isArray(p.dias) && p.dias.length && (!modulo || modulo === 'general' || p.materia === modulo))
      .sort((a, b) => String(a.fecha_examen).localeCompare(String(b.fecha_examen)));
    if (!elegidos.length) return;
    const titulos = []; let cambio = false;
    for (const p of elegidos.slice(0, 1)) {   // un solo plan por materia (el examen más cercano si hubiera datos viejos)
      let dia = p.dias.find((d) => d.fecha === hoy);
      if (!dia) dia = p.dias.filter((d) => d.fecha < hoy && progresoDia(d) < 1).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
      if (!dia) continue;
      dia.estudiado = Math.round(((dia.estudiado || 0) + minutos / 60) * 100) / 100;
      p.actualizado_en = new Date().toISOString();
      titulos.push(String(p.titulo).slice(0, 40)); cambio = true;
      try { window.dispatchEvent(new CustomEvent('nika:plan-pomodoro', { detail: { plan: p.id, dia: dia.id, minutos, titulo: p.titulo } })); } catch (_) {}
    }
    if (!cambio) return;
    try { localStorage.setItem(k, JSON.stringify(planes)); } catch (_) { return; }
    try { if (typeof window.showToast === 'function') window.showToast(`🍅 +${minutos} min en ${titulos.length === 1 ? 'tu plan «' + titulos[0] + '»' : titulos.length + ' planes'}`); } catch (_) {}
  }
  window.addEventListener('nika:pomodoro-minutos', (e) => { try { acreditar(e.detail); } catch (err) { console.warn('[PlanPomodoro]', err && err.message); } });
  window.NikaPlanPomodoro = { acreditar };
})();
