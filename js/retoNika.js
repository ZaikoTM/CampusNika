/* CAMPUS NIKA · Nika (el robot) avisa el avance de tus retos cada vez que terminás un Pomodoro.
   Escucha 'nika:pomodoro-minutos', consulta reto_progreso y le hace hablar al asistente con barra animada. */
(function () {
  'use strict';
  if (window.NikaRetoAviso) return;
  const U = { minutos: 'min', sesiones: 'sesiones', simulacros: 'simulacros', dias: 'días' };
  const fmt = (tipo, v) => (tipo === 'minutos' ? (v >= 60 ? (Math.round(v / 6) / 10) + ' h' : v + ' min') : v + ' ' + U[tipo]);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let busy = false;

  async function datos() {
    const c = window.NikaSupabase && window.NikaSupabase.client; if (!c) return [];
    const ses = await c.auth.getSession(), me = ses.data && ses.data.session && ses.data.session.user.id; if (!me) return [];
    const q = await c.from('retos').select('id,titulo,tipo,meta,hasta').gt('hasta', new Date().toISOString()).order('creado_en', { ascending: false }).limit(4);
    if (q.error || !q.data) return [];
    const out = [];
    for (const r of q.data) {
      const p = await c.rpc('reto_progreso', { p_reto: r.id }); if (p.error || !p.data) continue;
      const mio = p.data.find((x) => String(x.user_id) === String(me));
      if (!mio || mio.estado !== 'aceptado') continue;
      const total = p.data.filter((x) => x.estado === 'aceptado').reduce((a, x) => a + (Number(x.valor) || 0), 0);
      out.push({ r, total, mio: Number(mio.valor) || 0, pct: Math.min(100, total / r.meta * 100) });
    }
    return out;
  }

  async function avisar(detalle) {
    if (busy || typeof NikaAssistant === 'undefined' || !NikaAssistant.hablar) return;
    busy = true;
    try {
      const lista = await datos();
      const min = detalle && detalle.minutes ? detalle.minutes : 0;
      if (!lista.length) {
        if (detalle && detalle.completed) NikaAssistant.hablar({ html: '🍅 <b>¡Pomodoro terminado!</b> Sumaste ' + min + ' min. Armá un reto con tus amigos para estudiar en equipo.', anim: 'feliz', ms: 5000 });
        return;
      }
      const hecho = lista.find((x) => x.pct >= 100 && !localStorage.getItem('nika_reto_fin_' + x.r.id));
      if (hecho) {
        try { localStorage.setItem('nika_reto_fin_' + hecho.r.id, '1'); } catch (_) {}
        NikaAssistant.hablar({ html: '🏆 <b>¡Reto cumplido!</b> “' + esc(hecho.r.titulo) + '” llegó a la meta entre todos. ¡Qué equipazo!', pct: 100, pie: fmt(hecho.r.tipo, hecho.total) + ' de ' + fmt(hecho.r.tipo, hecho.r.meta), anim: 'celebra', confeti: true, ms: 9000, href: 'retos.html' });
        return;
      }
      const x = lista.filter((y) => y.pct < 100).sort((a, b) => b.pct - a.pct)[0]; if (!x) return;
      const falta = x.r.meta - x.total, cerca = x.pct >= 75;
      const dias = Math.max(1, Math.ceil((new Date(x.r.hasta) - Date.now()) / 86400000));
      const cabeza = detalle && detalle.completed ? '🍅 <b>¡Pomodoro terminado!</b> ' : '👋 ';
      NikaAssistant.hablar({
        html: cabeza + (cerca ? '¡Casi! A “' + esc(x.r.titulo) + '” le faltan <b>' + fmt(x.r.tipo, falta) + '</b>.' : 'Al reto “' + esc(x.r.titulo) + '” le faltan <b>' + fmt(x.r.tipo, falta) + '</b> y quedan ' + dias + (dias === 1 ? ' día' : ' días') + '.'),
        pct: x.pct, pie: 'Vos aportaste ' + fmt(x.r.tipo, x.mio), anim: cerca ? 'celebra' : 'alienta', ms: 8000, href: 'retos.html'
      });
    } catch (_) {} finally { busy = false; }
  }

  window.addEventListener('nika:pomodoro-minutos', (e) => {
    const d = (e && e.detail) || {};
    if (!d.minutes || d.minutes < 1) return;
    setTimeout(() => avisar(d), 2800); // da tiempo a que la sesión llegue a Supabase
  });
  window.NikaRetoAviso = { avisar };
})();
