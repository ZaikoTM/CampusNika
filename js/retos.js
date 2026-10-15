/* CAMPUS NIKA · Retos entre compañeros: meta compartida (todos suman a la misma meta).
   Tablas: retos, retos_miembros · función: reto_progreso (sql/retos_companeros.sql).
   Se puede abrir desde la sala Pomodoro compartida: retos.html?nuevo=1&con=usuario1,usuario2 */
(function () {
  'use strict';
  const $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIPOS = {
    minutos: { ico: '⏱️', nombre: 'Horas de estudio', unidad: 'min', color: '#0ea5e9', campo: 'horas', paso: 1, def: 10, sug: [5, 10, 20, 40] },
    sesiones: { ico: '🍅', nombre: 'Sesiones Pomodoro', unidad: 'sesiones', color: '#ef4444', campo: 'sesiones', paso: 5, def: 20, sug: [10, 20, 40, 80] },
    simulacros: { ico: '📝', nombre: 'Simulacros', unidad: 'simulacros', color: '#8b5cf6', campo: 'simulacros', paso: 1, def: 5, sug: [3, 5, 10, 20] },
    dias: { ico: '🔥', nombre: 'Días activos', unidad: 'días', color: '#f59e0b', campo: 'días activos sumados', paso: 5, def: 20, sug: [10, 20, 40, 60] }
  };
  const MATERIAS = { '': ['Todas', '📚'], cirugia: ['Cirugía', '🔪'], ginecologia: ['Ginecología', '🤰'], siam: ['S.I.A.M.', '🫀'], pfo: ['PFO', '🎓'], medicinalegal: ['Medicina Legal', '⚖️'], medicinadeportiva: ['Medicina Deportiva', '🏃'] };
  const DURS = [[3, '3 días'], [7, '1 semana'], [14, '2 semanas'], [30, '1 mes']];
  const PLANTILLAS = [
    { n: '⏱️ Semana de 10 horas', t: 'Semana de 10 horas entre todos', tipo: 'minutos', meta: 10, dias: 7 },
    { n: '🍅 20 Pomodoros', t: '20 Pomodoros en la semana', tipo: 'sesiones', meta: 20, dias: 7 },
    { n: '📝 5 simulacros', t: '5 simulacros antes del parcial', tipo: 'simulacros', meta: 5, dias: 14 },
    { n: '🔥 Constancia del mes', t: 'Constancia: 40 días activos entre todos', tipo: 'dias', meta: 40, dias: 30 }
  ];
  let cli = null, me = null, retos = [], amigos = [], cargando = false, previos = [];

  const fmtValor = (tipo, v) => (tipo === 'minutos' ? (v >= 60 ? Math.floor(v / 60) + ' h' + (v % 60 ? ' ' + (v % 60) + ' min' : '') : v + ' min') : v + ' ' + TIPOS[tipo].unidad);
  const iniciales = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '?';
  const avatar = (u) => (u.avatar && /^https?:|^data:image/.test(u.avatar) ? '<img src="' + esc(u.avatar) + '" alt="">' : '<span>' + esc(iniciales(u.fullname || u.username)) + '</span>');
  const aviso = (m, malo) => { const a = $('rt-aviso'); a.textContent = m; a.hidden = !m; a.className = 'rt-aviso' + (malo ? ' mal' : ''); };

  async function sesion() {
    const ns = window.NikaSupabase; if (ns && ns.ready) await ns.ready;
    cli = ns && ns.client;
    const { data } = await cli.auth.getSession();
    me = data && data.session && data.session.user ? data.session.user.id : null;
    return !!me;
  }

  async function cargar() {
    if (cargando) return; cargando = true;
    try {
      if (!(await sesion())) { $('rt-activos').innerHTML = '<p class="rt-vacio">Iniciá sesión para crear y ver retos.</p>'; return; }
      const r = await cli.from('retos').select('*').order('creado_en', { ascending: false });
      if (r.error) throw r.error;
      const lista = r.data || [];
      const ids = lista.map((x) => x.id);
      let miembros = [];
      if (ids.length) { const m = await cli.from('retos_miembros').select('reto_id,user_id,estado').in('reto_id', ids); miembros = m.data || []; }
      const prog = await Promise.all(lista.map(async (x) => { try { const p = await cli.rpc('reto_progreso', { p_reto: x.id }); return p.data || []; } catch (_) { return []; } }));
      retos = lista.map((x, i) => {
        const mios = miembros.find((m) => m.reto_id === x.id && m.user_id === me);
        const gente = prog[i].map((p) => ({ id: p.user_id, username: p.username, fullname: p.fullname, avatar: p.avatar, estado: p.estado, valor: Number(p.valor) || 0 }));
        const total = gente.filter((g) => g.estado === 'aceptado').reduce((a, g) => a + g.valor, 0);
        return Object.assign({}, x, { miEstado: x.creador_id === me ? 'aceptado' : (mios && mios.estado) || 'invitado', gente, total, esMio: x.creador_id === me });
      });
      aviso('');
      pintar();
    } catch (e) {
      const falta = /relation|does not exist|PGRST205|42P01|function/i.test((e && e.message) || '');
      aviso(falta ? 'Falta ejecutar el SQL de retos en Supabase: sql/retos_companeros.sql' : 'No se pudieron cargar los retos. Reintentá en un momento.', true);
      $('rt-activos').innerHTML = '';
    } finally { cargando = false; }
  }

  function anillo(pct, ico, c) {
    return '<div class="rt-anillo" style="--c:' + c + '"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" pathLength="100" style="--p:' + pct + '"/></svg>'
      + '<div class="rt-an-c"><b>' + pct + '%</b><span>' + ico + '</span></div></div>';
  }

  function tarjeta(r, modo) {
    const t = TIPOS[r.tipo], fin = new Date(r.hasta), ahora = new Date();
    const dias = Math.max(0, Math.ceil((fin - ahora) / 86400000));
    const pct = Math.min(100, Math.round(r.total / r.meta * 100)), logrado = r.total >= r.meta;
    const c = logrado ? '#16a34a' : t.color;
    const metaTxt = r.tipo === 'minutos' ? fmtValor('minutos', r.meta) : r.meta + ' ' + t.unidad;
    const maxV = Math.max(1, ...r.gente.map((g) => g.valor));
    const aceptados = r.gente.filter((g) => g.estado === 'aceptado');
    const gente = r.gente.slice().sort((a, b) => (a.estado === 'invitado') - (b.estado === 'invitado') || b.valor - a.valor).map((g) =>
      '<li class="' + (g.estado === 'invitado' ? 'pend' : '') + '"><span class="rt-av">' + avatar(g) + '</span>'
      + '<span class="rt-nm">' + esc(g.fullname || g.username) + (g.id === me ? ' <em>(vos)</em>' : '') + '</span>'
      + (g.estado === 'invitado' ? '<span class="rt-pend">⏳ esperando respuesta</span>' : '<span class="rt-aporte"><i style="--w:' + Math.round(g.valor / maxV * 100) + '%"></i></span><b>' + fmtValor(r.tipo, g.valor) + '</b>')
      + '</li>').join('');
    const pie = modo === 'inv'
      ? '<div class="rt-acc"><button type="button" class="rt-btn rt-btn--sec" data-rt="rechazar" data-id="' + r.id + '">Rechazar</button><button type="button" class="rt-btn" data-rt="aceptar" data-id="' + r.id + '">¡Me sumo!</button></div>'
      : '<div class="rt-acc">' + (r.esMio ? '<button type="button" class="rt-btn rt-btn--sec rt-btn--peligro" data-rt="eliminar" data-id="' + r.id + '">Eliminar reto</button>' : '<button type="button" class="rt-btn rt-btn--sec" data-rt="salir" data-id="' + r.id + '">Salir del reto</button>') + '</div>';
    const insignia = modo === 'fin' ? (logrado ? '<span class="rt-badge ok">✅ Lograda</span>' : '<span class="rt-badge">Terminó</span>')
      : modo === 'inv' ? '<span class="rt-badge inv">📩 Invitación</span>' : '<span class="rt-badge">' + dias + (dias === 1 ? ' día' : ' días') + ' restantes</span>';
    return '<article class="rt-card' + (logrado ? ' logrado' : '') + (modo === 'fin' ? ' fin' : '') + '" data-id="' + r.id + '" style="--c:' + c + '">'
      + '<div class="rt-top">' + anillo(pct, t.ico, c)
      + '<div class="rt-info"><div class="rt-insig">' + insignia + '</div><h4>' + esc(r.titulo) + '</h4>'
      + '<small>' + t.nombre + ' · ' + esc((MATERIAS[r.modulo || ''] || [r.modulo])[0]) + ' · ' + aceptados.length + (aceptados.length === 1 ? ' persona' : ' personas') + (r.modo === 'compartidas' ? ' · 🤝 solo sesiones compartidas' : ' · ⚡ suma automática') + '</small>'
      + '<div class="rt-numeros"><b>' + fmtValor(r.tipo, r.total) + '</b><span>de ' + metaTxt + ' entre todos</span></div></div></div>'
      + '<div class="rt-barra"><i style="--w:' + pct + '%"></i></div>'
      + (logrado ? '<p class="rt-logro">🎉 ¡Meta compartida cumplida! Lo lograron entre todos.</p>' : '')
      + '<ul class="rt-gente">' + gente + '</ul>' + pie + '</article>';
  }

  function pintar() {
    const ahora = Date.now();
    const inv = retos.filter((r) => !r.esMio && r.miEstado === 'invitado' && new Date(r.hasta) > ahora);
    const act = retos.filter((r) => (r.esMio || r.miEstado === 'aceptado') && new Date(r.hasta) > ahora);
    const fin = retos.filter((r) => (r.esMio || r.miEstado === 'aceptado') && new Date(r.hasta) <= ahora);
    $('rt-invitaciones').hidden = !inv.length;
    $('rt-inv-lista').innerHTML = inv.map((r) => tarjeta(r, 'inv')).join('');
    $('rt-activos').innerHTML = act.length ? act.map((r) => tarjeta(r, 'act')).join('')
      : '<div class="rt-vacio"><div class="rt-vacio-ico">🎯</div><b>Todavía no tenés retos activos</b><span>Creá uno y sumá a tus amigos: ¡estudiar juntos se nota!</span><button type="button" class="rt-btn" data-rt="nuevo">＋ Crear mi primer reto</button></div>';
    $('rt-hist').hidden = !fin.length;
    $('rt-terminados').innerHTML = fin.map((r) => tarjeta(r, 'fin')).join('');
    let i = 0; document.querySelectorAll('.rt-card').forEach((c) => { c.style.transitionDelay = (i++ * 80) + 'ms'; });
    requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.rt-card').forEach((c) => c.classList.add('on'))));
    act.concat(fin).forEach((r) => {
      if (r.total >= r.meta) { const k = 'nika_reto_celebrado_' + r.id; try { if (!localStorage.getItem(k)) { localStorage.setItem(k, '1'); confeti(); } } catch (_) {} }
    });
  }

  function confeti() {
    const c = document.createElement('div'); c.className = 'rt-confeti';
    const cols = ['#0ea5e9', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#f97316'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + cols[i % cols.length] + ';animation-delay:' + Math.random() * 0.7 + 's;--dx:' + (Math.random() * 180 - 90) + 'px;--r:' + (Math.random() * 720 - 360) + 'deg';
      c.appendChild(p);
    }
    document.body.appendChild(c); setTimeout(() => c.remove(), 3800);
  }

  /* ---------- crear (formulario compartido con la sala Pomodoro) ---------- */
  async function abrirModal(pre) {
    if (!amigos.length) { try { amigos = (window.NikaFriends && (await window.NikaFriends.listFriends())) || []; } catch (_) { amigos = []; } }
    const m = $('rt-modal');
    m.innerHTML = '<div class="rt-modal-card"><button type="button" class="rt-x" data-rt="cerrar" aria-label="Cerrar">✕</button><div id="rt-form-host"></div></div>';
    m.hidden = false;
    window.NikaRetoCrear.montar($('rt-form-host'), {
      amigos, preInvitados: pre || [],
      onCancelar: () => { m.hidden = true; },
      onCreado: () => { m.hidden = true; cargar(); }
    });
    setTimeout(() => { const t = $('rf-titulo'); if (t) t.focus(); }, 120);
  }

  async function accion(a, id) {
    try {
      if (a === 'aceptar') await cli.from('retos_miembros').update({ estado: 'aceptado' }).eq('reto_id', id).eq('user_id', me);
      else if (a === 'rechazar') await cli.from('retos_miembros').update({ estado: 'rechazado' }).eq('reto_id', id).eq('user_id', me);
      else if (a === 'salir') { if (!confirm('¿Salir de este reto?')) return; await cli.from('retos_miembros').delete().eq('reto_id', id).eq('user_id', me); }
      else if (a === 'eliminar') { if (!confirm('¿Eliminar el reto para todos?')) return; await cli.from('retos').delete().eq('id', id); }
    } catch (_) {}
    cargar();
  }

  function eventos() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rt]'); if (!b) return;
      const a = b.dataset.rt;
      if (a === 'cerrar') $('rt-modal').hidden = true;
      else if (a === 'nuevo') abrirModal();
      else accion(a, b.dataset.id);
    });
    $('rt-nuevo').addEventListener('click', (ev) => { const b = ev.currentTarget; b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso'); abrirModal(); });
    $('rt-modal').addEventListener('click', (e) => { if (e.target.id === 'rt-modal') $('rt-modal').hidden = true; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('rt-modal').hidden = true; });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') cargar(); });
    setInterval(() => { if (document.visibilityState === 'visible' && $('rt-modal').hidden) cargar(); }, 60000);
    try { if (localStorage.getItem('nika_retos_side') === '1') document.body.classList.add('ns-colapsado'); } catch (_) {}
    const col = $('ns-colapsar'), bur = $('ns-burger');
    const pintarCol = () => { if (!col) return; const c = document.body.classList.contains('ns-colapsado'); const i = col.querySelector('.ns-ic'), t = col.querySelector('.ns-t'); if (i) i.textContent = c ? '⇥' : '⇤'; if (t) t.textContent = c ? 'Expandir' : 'Contraer'; };
    if (col) { col.addEventListener('click', () => { const c = document.body.classList.toggle('ns-colapsado'); try { localStorage.setItem('nika_retos_side', c ? '1' : '0'); } catch (_) {} pintarCol(); }); pintarCol(); }
    if (bur) bur.addEventListener('click', () => document.body.classList.toggle('ns-abierto'));
    document.addEventListener('click', (e) => { if (document.body.classList.contains('ns-abierto') && !e.target.closest('#ns-side') && !e.target.closest('#ns-burger')) document.body.classList.remove('ns-abierto'); });
    if (window.NikaFriends && window.NikaFriends.startRealtime) { try { window.NikaFriends.startRealtime(); } catch (_) {} }
  }

  eventos();
  cargar().then(() => {
    // viene de la sala Pomodoro compartida: abre el formulario con los compañeros de la sala ya elegidos
    const p = new URLSearchParams(location.search);
    if (p.get('nuevo') === '1') abrirModal((p.get('con') || '').split(',').filter(Boolean));
  });
})();
