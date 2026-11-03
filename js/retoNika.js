/* CAMPUS NIKA · Avisos de Nika (el robot): avance de retos, hitos, racha en riesgo y resumen semanal.
   Modo foco: mientras corre un Pomodoro de estudio no interrumpe; los avisos esperan al final del bloque.
   Escucha 'nika:pomodoro-minutos' y 'nika:racha'; habla con NikaAssistant.hablar (js/assistant.js). */
(function () {
  'use strict';
  if (window.NikaRetoAviso) return;
  const U = { minutos: 'min', sesiones: 'sesiones', simulacros: 'simulacros', dias: 'días' };
  const fmt = (tipo, v) => (tipo === 'minutos' ? (v >= 60 ? (Math.round(v / 6) / 10) + ' h' : v + ' min') : v + ' ' + U[tipo]);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };
  const hoyClave = () => new Date().toLocaleDateString('en-CA');   // yyyy-mm-dd en la hora del dispositivo
  const hablando = () => typeof NikaAssistant !== 'undefined' && NikaAssistant.hablar;
  let busy = false;

  // ---------------------------------------------------------------- modo foco
  const enFoco = () => { try { const s = window.PomodoroEngine && PomodoroEngine.getState(); return !!(s && s.status === 'running' && s.mode === 'work'); } catch (_) { return false; } };
  const cola = [];                       // avisos que esperan a que termine el bloque de estudio
  let ultimoMostrado = 0;
  function emitir(opt, clave, prio) {
    if (!hablando()) return;
    if (enFoco()) {
      if (!cola.some((c) => c.clave === clave)) cola.push({ clave, opt, prio: prio || 1 });
      return;
    }
    ultimoMostrado = Date.now(); NikaAssistant.hablar(opt);
  }
  setInterval(() => {
    if (!cola.length || enFoco() || Date.now() - ultimoMostrado < 20000) return;
    cola.sort((a, b) => b.prio - a.prio);
    const c = cola.shift(); ultimoMostrado = Date.now(); NikaAssistant.hablar(c.opt);
  }, 8000);

  // ---------------------------------------------------------------- retos
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
      const acept = p.data.filter((x) => x.estado === 'aceptado');
      const total = acept.reduce((a, x) => a + (Number(x.valor) || 0), 0), v = Number(mio.valor) || 0;
      const top = acept.length >= 2 && v > 0 && acept.every((x) => String(x.user_id) === String(me) || (Number(x.valor) || 0) <= v);
      out.push({ r, total, mio: v, top, pct: Math.min(100, total / r.meta * 100) });
    }
    return out;
  }

  async function avisar(detalle) {
    if (busy || !hablando()) return;
    busy = true;
    try {
      const lista = await datos();
      const min = detalle && detalle.minutes ? detalle.minutes : 0;
      if (!lista.length) {
        if (detalle && detalle.completed) emitir({ html: '🍅 <b>¡Pomodoro terminado!</b> Sumaste ' + min + ' min. Armá un reto con tus amigos para estudiar en equipo.', anim: 'feliz', ms: 5000, href: 'retos.html' }, 'pomo-fin', 1);
        return;
      }
      const hecho = lista.find((x) => x.pct >= 100 && !ls.get('nika_reto_fin_' + x.r.id));
      if (hecho) {
        ls.set('nika_reto_fin_' + hecho.r.id, '1'); ls.set('nika_reto_hito_' + hecho.r.id, '100');
        emitir({ partes: ['🏆 <b>¡Reto cumplido!</b> “' + esc(hecho.r.titulo) + '” llegó a la meta entre todos.', '¡Qué equipazo! Entre todos sumaron <b>' + fmt(hecho.r.tipo, hecho.total) + '</b>.'], pct: 100, pie: fmt(hecho.r.tipo, hecho.total) + ' de ' + fmt(hecho.r.tipo, hecho.r.meta), anim: 'celebra', confeti: true, ms: 9000, href: 'retos.html' }, 'reto-fin-' + hecho.r.id, 5);
        return;
      }
      const x = lista.filter((y) => y.pct < 100).sort((a, b) => b.pct - a.pct)[0]; if (!x) return;
      const falta = x.r.meta - x.total, cerca = x.pct >= 75;
      const dias = Math.max(1, Math.ceil((new Date(x.r.hasta) - Date.now()) / 86400000));
      // hitos: 25 / 50 / 75 %, una sola vez por reto
      const previo = Number(ls.get('nika_reto_hito_' + x.r.id) || 0);
      const nivel = [75, 50, 25].find((n) => x.pct >= n && n > previo);
      const pie = x.top ? '🥇 Sos quien más aporta' : 'Vos aportaste ' + fmt(x.r.tipo, x.mio);
      if (nivel) {
        ls.set('nika_reto_hito_' + x.r.id, String(nivel));
        emitir({ html: '🎉 <b>¡Llegaron al ' + nivel + '%!</b> “' + esc(x.r.titulo) + '” avanza a toda velocidad. Faltan <b>' + fmt(x.r.tipo, falta) + '</b>.', pct: x.pct, pie, falta: 'Faltan ' + fmt(x.r.tipo, falta), anim: 'celebra', confeti: nivel >= 50, ms: 8000, href: 'retos.html' }, 'hito-' + x.r.id, 4);
        return;
      }
      const cabeza = detalle && detalle.completed ? '🍅 <b>¡Pomodoro terminado!</b> ' : '👋 ';
      emitir({
        html: cabeza + (cerca ? '¡Casi! A “' + esc(x.r.titulo) + '” le faltan <b>' + fmt(x.r.tipo, falta) + '</b>.' : 'Al reto “' + esc(x.r.titulo) + '” le faltan <b>' + fmt(x.r.tipo, falta) + '</b> y quedan ' + dias + (dias === 1 ? ' día' : ' días') + '.'),
        pct: x.pct, pie, falta: 'Faltan ' + fmt(x.r.tipo, falta), anim: cerca ? 'celebra' : 'alienta', ms: 8000, href: 'retos.html'
      }, 'reto-' + x.r.id, 2);
    } catch (_) {} finally { busy = false; }
  }

  // ---------------------------------------------------------------- invitaciones a retos pendientes (aunque la notificación nunca haya llegado)
  async function revisarInvitaciones() {
    try {
      const N = window.NikaNotif, c = window.NikaSupabase && window.NikaSupabase.client; if (!N || !N.tarjeta || !c) return;
      const ses = await c.auth.getSession(), me = ses.data && ses.data.session && ses.data.session.user.id; if (!me) return;
      const m = await c.from('retos_miembros').select('reto_id').eq('user_id', me).eq('estado', 'invitado');
      const ids = (m.data || []).map((x) => x.reto_id).filter((id) => { try { return !sessionStorage.getItem('nika_reto_inv_' + id); } catch (_) { return true; } });
      if (!ids.length) return;
      const q = await c.from('retos').select('id,titulo,creador_id,hasta').in('id', ids).gt('hasta', new Date().toISOString());
      const lista = q.data || []; if (!lista.length) return;
      const pr = await c.from('profiles_public').select('id,username').in('id', lista.map((r) => r.creador_id));
      const nombre = {}; (pr.data || []).forEach((p) => { nombre[p.id] = p.username; });
      for (const r of lista) {
        try { sessionStorage.setItem('nika_reto_inv_' + r.id, '1'); } catch (_) {}
        if (document.querySelector('.nn-card[data-reto="' + r.id + '"]')) continue;   // ya está la tarjeta de la notificación
        const de = nombre[r.creador_id];
        const n = { id: 'reto-' + r.id, tipo: 'reto', titulo: (de ? '@' + de : 'Un compañero') + ' te invitó a un reto', cuerpo: r.titulo, datos: { retoId: r.id, url: 'retos.html' } };
        N.tarjeta(n, { dur: 60000, botones: [{ txt: 'Ahora no', clase: 'nn-no', fn: () => N.responderReto(n, false) }, { txt: '🎯 Me sumo', clase: 'nn-ok', fn: () => N.responderReto(n, true) }] });
        try { N.sonar('desafio'); } catch (_) {}
      }
    } catch (_) {}
  }

  // ---------------------------------------------------------------- racha en riesgo
  const rachas = () => (window.NikaRachas && NikaRachas.ultima) || null;
  const minHoy = () => { try { return (window.PomodoroEngine && PomodoroEngine.getTodayMinutes()) || 0; } catch (_) { return 0; } };
  function rachaEnRiesgo() {
    const R = rachas();
    return !!(R && R.racha > 0 && !R.hoyCumplido && minHoy() < 1 && new Date().getHours() >= 17 && ls.get('nika_aviso_racha') !== hoyClave());
  }
  function avisarRacha() {
    const R = rachas(); if (!rachaEnRiesgo()) return false;
    ls.set('nika_aviso_racha', hoyClave());
    emitir({ partes: ['🔥 <b>Tu racha de ' + R.racha + (R.racha === 1 ? ' día' : ' días') + '</b> corre peligro: hoy todavía no estudiaste.', 'Con un Pomodoro la salvás. ¡Vamos, que podés!'], anim: 'alienta', cara: '', ms: 9000, href: 'estudio.html' }, 'racha', 3);
    return true;
  }

  // ---------------------------------------------------------------- resumen semanal (lunes)
  function avisarResumen() {
    const R = rachas(); const d = new Date();
    if (!R || d.getDay() !== 1 || !R.ultimos7) return false;
    const clave = 'sem-' + hoyClave(); if (ls.get('nika_aviso_resumen') === clave) return false;
    const sem = R.ultimos7.slice(0, 6);                                   // los 6 días anteriores a hoy
    const mins = sem.reduce((a, x) => a + (x.min || 0), 0), dias = sem.filter((x) => (x.min || 0) > 0 || x.cumplido).length;
    ls.set('nika_aviso_resumen', clave);
    const h = mins >= 60 ? (Math.round(mins / 6) / 10) + ' h' : mins + ' min';
    emitir({ partes: ['📊 <b>Tu semana en Nika:</b> estudiaste <b>' + h + '</b> en <b>' + dias + ' de 6 días</b>.', mins > 0 ? '¡Buen ritmo! Arrancá esta semana con un Pomodoro.' : 'Esta semana arrancamos de cero: un Pomodoro y ya estás en carrera.'], anim: mins > 0 ? 'celebra' : 'alienta', ms: 9000, href: 'estadisticas.html' }, 'resumen', 6);
    return true;
  }

  // ---------------------------------------------------------------- disparadores
  window.addEventListener('nika:pomodoro-minutos', (e) => {
    const dd = (e && e.detail) || {};
    if (!dd.minutes || dd.minutes < 1) return;
    setTimeout(() => avisar(dd), 2800);   // da tiempo a que la sesión llegue a Supabase
  });
  function inicio() {
    try { if (sessionStorage.getItem('nika_reto_aviso')) return; sessionStorage.setItem('nika_reto_aviso', '1'); } catch (_) {}
    if (avisarResumen()) return;
    if (avisarRacha()) return;
    avisar({ minutes: 0, completed: false });
  }
  setTimeout(inicio, 9000);
  setTimeout(revisarInvitaciones, 5000);
  setInterval(() => { if (!document.hidden && !enFoco()) revisarInvitaciones(); }, 4 * 60 * 1000);
  setInterval(() => { if (!enFoco()) avisarRacha(); }, 30 * 60 * 1000);
  window.addEventListener('nika:racha', () => { if (!enFoco()) avisarRacha(); });
  window.NikaRetoAviso = { avisar, avisarRacha, avisarResumen };
})();
