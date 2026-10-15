/* CAMPUS NIKA · Formulario para crear un reto (se usa en retos.html y dentro de la sala Pomodoro compartida).
   window.NikaRetoCrear.montar(host, { amigos, preInvitados, tema, onCreado, onCancelar }) */
(function () {
  'use strict';
  if (window.NikaRetoCrear) return;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIPOS = {
    minutos: { ico: '⏱️', nombre: 'Horas de estudio', unidad: 'min', color: '#0ea5e9', campo: 'horas', paso: 1, def: 10, sug: [2, 5, 10, 20] },
    sesiones: { ico: '🍅', nombre: 'Sesiones Pomodoro', unidad: 'sesiones', color: '#ef4444', campo: 'sesiones', paso: 2, def: 20, sug: [6, 10, 20, 40] },
    simulacros: { ico: '📝', nombre: 'Simulacros', unidad: 'simulacros', color: '#8b5cf6', campo: 'simulacros', paso: 1, def: 5, sug: [2, 3, 5, 10] },
    dias: { ico: '🔥', nombre: 'Días activos', unidad: 'días', color: '#f59e0b', campo: 'días sumados', paso: 2, def: 10, sug: [4, 10, 20, 40] }
  };
  const MATERIAS = { '': ['Todas', '📚'], cirugia: ['Cirugía', '🔪'], ginecologia: ['Ginecología', '🤰'], siam: ['S.I.A.M.', '🫀'], pfo: ['PFO', '🎓'], medicinalegal: ['Medicina Legal', '⚖️'], medicinadeportiva: ['Medicina Deportiva', '🏃'] };
  const PLANTILLAS = [
    { n: '☀️ Reto de hoy', t: 'Reto de hoy: 2 horas entre todos', tipo: 'minutos', meta: 2, dias: 1 },
    { n: '⏱️ Semana de 10 horas', t: 'Semana de 10 horas entre todos', tipo: 'minutos', meta: 10, dias: 7 },
    { n: '🍅 20 Pomodoros', t: '20 Pomodoros en la semana', tipo: 'sesiones', meta: 20, dias: 7 },
    { n: '📝 5 simulacros', t: '5 simulacros antes del parcial', tipo: 'simulacros', meta: 5, dias: 14 },
    { n: '🔥 Constancia del mes', t: 'Constancia: 40 días activos entre todos', tipo: 'dias', meta: 40, dias: 30 }
  ];
  const fmtValor = (tipo, v) => (tipo === 'minutos' ? (v >= 60 ? Math.floor(v / 60) + ' h' + (v % 60 ? ' ' + (v % 60) + ' min' : '') : v + ' min') : v + ' ' + TIPOS[tipo].unidad);
  const iniciales = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '?';
  const avatar = (u) => (u.avatar && /^https?:|^data:image/.test(u.avatar) ? '<img src="' + esc(u.avatar) + '" alt="">' : '<span>' + esc(iniciales(u.fullname || u.username)) + '</span>');
  const fechaFin = (d) => new Date(Date.now() + d * 86400000).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  const etiquetaDias = (d) => (d === 1 ? '1 día · solo hoy' : d + ' días') + ' · hasta el ' + fechaFin(d);

  // Explica con claridad cómo se suma el progreso (se muestra al crear, al recibir la invitación y en cada reto)
  function explicar(r) {
    const t = TIPOS[r.tipo] || TIPOS.minutos, mat = r.modulo && MATERIAS[r.modulo] ? MATERIAS[r.modulo][0] : null;
    const queSuma = { minutos: 'los <b>minutos de estudio</b> de tus Pomodoros terminados', sesiones: 'cada <b>Pomodoro terminado</b>', simulacros: 'cada <b>simulacro</b> que completes', dias: 'cada <b>día en que estudies</b> (un día cuenta una sola vez por persona)' }[r.tipo];
    const li = [];
    li.push('Cada integrante suma ' + queSuma + (mat ? ', <b>solo de ' + esc(mat) + '</b>' : ' de <b>cualquier materia</b>') + '.');
    li.push(r.modo === 'compartidas'
      ? '<b>Solo cuentan las sesiones compartidas:</b> las que hagan juntos en la sala Pomodoro. Lo que estudies por tu cuenta no suma a este reto.'
      : 'Se suma <b>solo y automáticamente</b>, estudies solo o acompañado. No hay que cargar nada a mano.');
    li.push('Si estudian <b>1 hora juntos</b> en la sala, <b>a cada uno le suma 1 hora</b> en su perfil y el reto avanza <b>2 horas</b> (la de cada uno).');
    li.push('La meta es <b>común</b>: el avance de todos se junta en una sola barra. Es cooperativo, no un ranking.');
    li.push('Solo cuenta lo hecho <b>desde que empieza el reto</b> hasta su fecha de cierre' + (r.dias ? ' (' + r.dias + (r.dias === 1 ? ' día' : ' días') + ')' : '') + '; y solo de quienes <b>aceptaron</b> la invitación.');
    return '<div class="rf-como"><div class="rf-como-t">ℹ️ Cómo se suma en este reto</div><ul>' + li.map((x) => '<li>' + x + '</li>').join('') + '</ul></div>';
  }

  function montar(host, opt) {
    opt = opt || {};
    const amigos = opt.amigos || [];
    const S = { tipo: 'minutos', meta: 10, dias: 7, modulo: '', modo: 'todas', invitados: new Set(), titulo: '' };
    (opt.preInvitados || []).forEach((u) => { const a = amigos.find((x) => String(x.username) === String(u)); if (a) S.invitados.add(String(a.id)); });

    function html() {
      const t = TIPOS[S.tipo];
      return '<div class="rf' + (opt.tema === 'sala' ? ' rf--sala' : '') + '">'
        + '<div class="rf-head"><div class="rf-ico">🎯</div><div><h3>Nuevo reto</h3><p>Una meta común: entre todos suman, nadie compite.</p></div></div>'
        + '<div class="rf-plantillas">' + PLANTILLAS.map((p, i) => '<button type="button" data-rf="plantilla" data-i="' + i + '">' + p.n + '</button>').join('') + '</div>'
        + '<label class="rf-f"><span>Nombre del reto</span><input id="rf-titulo" maxlength="60" placeholder="Ej: Semana de 10 horas de Cirugía" value="' + esc(S.titulo) + '"></label>'
        + '<div class="rf-lbl">¿Qué suman?</div><div class="rf-tipos">' + Object.keys(TIPOS).map((k) => '<button type="button" class="rf-tipo' + (k === S.tipo ? ' on' : '') + '" style="--c:' + TIPOS[k].color + '" data-rf="tipo" data-v="' + k + '"><i>' + TIPOS[k].ico + '</i><span>' + TIPOS[k].nombre + '</span></button>').join('') + '</div>'
        + '<div class="rf-lbl">Meta entre todos <small>' + t.campo + '</small></div>'
        + '<div class="rf-meta"><button type="button" data-rf="menos" aria-label="Menos">−</button><input id="rf-meta" type="number" min="1" max="2000" value="' + S.meta + '" aria-label="Meta"><button type="button" data-rf="mas" aria-label="Más">+</button>'
        + '<div class="rf-sug">' + t.sug.map((s) => '<button type="button" data-rf="sug" data-v="' + s + '">' + s + '</button>').join('') + '</div></div>'
        + '<div class="rf-lbl">Duración <small id="rf-dias-t">' + etiquetaDias(S.dias) + '</small></div>'
        + '<div class="rf-slider"><input id="rf-dias" type="range" min="1" max="90" value="' + S.dias + '" style="--p:' + Math.round((S.dias - 1) / 89 * 100) + '%" aria-label="Días de duración">'
        + '<div class="rf-marcas"><span>1</span><span>7</span><span>14</span><span>30</span><span>60</span><span>90</span></div></div>'
        + '<div class="rf-chips rf-chips--dur">' + [[1, 'Hoy'], [3, '3 días'], [7, '1 semana'], [14, '2 semanas'], [30, '1 mes']].map((d) => '<button type="button" class="' + (d[0] === S.dias ? 'on' : '') + '" data-rf="dur" data-v="' + d[0] + '">' + d[1] + '</button>').join('') + '</div>'
        + '<div class="rf-lbl">¿Qué sesiones suman?</div>'
        + '<div class="rf-modo"><button type="button" class="' + (S.modo === 'todas' ? 'on' : '') + '" data-rf="modo" data-v="todas"><b>⚡ Todas mis sesiones</b><small>Se suman solas: estudies solo o acompañado.</small></button>'
        + '<button type="button" class="' + (S.modo === 'compartidas' ? 'on' : '') + '" data-rf="modo" data-v="compartidas"><b>🤝 Solo las compartidas</b><small>Cuentan únicamente las sesiones que hagan juntos en la sala.</small></button></div>'
        + '<div class="rf-lbl">Materia</div><div class="rf-chips">' + Object.keys(MATERIAS).map((k) => '<button type="button" class="' + (k === S.modulo ? 'on' : '') + '" data-rf="mat" data-v="' + k + '">' + MATERIAS[k][1] + ' ' + MATERIAS[k][0] + '</button>').join('') + '</div>'
        + '<div class="rf-lbl">Invitá a tus amigos <small id="rf-n-inv">(' + S.invitados.size + ' elegidos)</small></div><div class="rf-amigos">'
        + (amigos.length ? amigos.map((a) => '<button type="button" class="rf-am' + (S.invitados.has(String(a.id)) ? ' on' : '') + '" data-rf="amigo" data-id="' + esc(a.id) + '"><span class="rf-av">' + avatar(a) + '</span><span class="rf-am-n">' + esc(a.fullname || a.username) + '</span><i>✓</i></button>').join('')
          : '<p class="rf-sinam">Todavía no tenés amigos agregados. Sumalos desde “Comunidad & Amigos”; también podés crear el reto y sumarlos después.</p>') + '</div>'
        + '<div id="rf-como">' + explicar({ tipo: S.tipo, modo: S.modo, modulo: S.modulo, dias: S.dias }) + '</div>'
        + '<p class="rf-est" id="rf-est"></p>'
        + '<p class="rf-error" id="rf-error" hidden></p>'
        + '<div class="rf-acc"><button type="button" class="rf-btn rf-btn--sec" data-rf="cancelar">Cancelar</button><button type="button" class="rf-btn rf-btn--go" id="rf-crear" data-rf="crear"><span class="rf-go-t">🚀 Crear reto</span><span class="rf-spin" aria-hidden="true"></span></button></div></div>';
    }

    function estimar() {
      const personas = 1 + S.invitados.size, meta = S.tipo === 'minutos' ? S.meta * 60 : S.meta;
      const e = host.querySelector('#rf-est'); if (!e) return;
      const porDia = S.dias > 0 ? meta / personas / S.dias : 0;
      e.innerHTML = '👥 <b>' + personas + (personas === 1 ? ' persona' : ' personas') + '</b> · cada una aporta en promedio <b>' + fmtValor(S.tipo, Math.ceil(meta / personas)) + '</b> en ' + S.dias + (S.dias === 1 ? ' día' : ' días')
        + (S.dias > 1 ? ' <span>(≈ ' + fmtValor(S.tipo, Math.max(1, Math.round(porDia * 10) / 10 >= 1 ? Math.round(porDia) : 1)) + ' por día)</span>' : '');
      const n = host.querySelector('#rf-n-inv'); if (n) n.textContent = '(' + S.invitados.size + ' elegidos)';
    }
    function render() {
      const t = host.querySelector('#rf-titulo'); if (t) S.titulo = t.value;
      host.innerHTML = html(); estimar();
    }
    function tick(el) { if (!el) return; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }

    async function crear() {
      const err = (m) => { const e = host.querySelector('#rf-error'); e.textContent = m; e.hidden = false; };
      const t = host.querySelector('#rf-titulo'); S.titulo = t ? t.value.trim() : S.titulo;
      let meta = Math.round(Number(host.querySelector('#rf-meta').value));
      if (!S.titulo) { err('Ponele un nombre al reto.'); const i = host.querySelector('#rf-titulo'); if (i) { i.focus(); tick(i); } return; }
      if (!(meta > 0)) return err('La meta tiene que ser mayor a 0.');
      if (S.tipo === 'minutos') meta *= 60;
      const btn = host.querySelector('#rf-crear'); btn.disabled = true; btn.classList.add('cargando');
      try {
        const c = window.NikaSupabase.client, ses = await c.auth.getSession();
        const me = ses.data && ses.data.session && ses.data.session.user && ses.data.session.user.id; if (!me) throw new Error('Iniciá sesión.');
        const desde = new Date(), hasta = new Date(desde.getTime() + S.dias * 86400000);
        const fila = { titulo: S.titulo, tipo: S.tipo, meta, modulo: S.modulo || null, modo: S.modo, desde: desde.toISOString(), hasta: hasta.toISOString() };
        let r = await c.from('retos').insert(fila).select().single();
        if (r.error && /modo/i.test(r.error.message || '')) { delete fila.modo; r = await c.from('retos').insert(fila).select().single(); }
        if (r.error) throw r.error;
        const filas = [{ reto_id: r.data.id, user_id: me, estado: 'aceptado' }].concat([...S.invitados].map((u) => ({ reto_id: r.data.id, user_id: u, estado: 'invitado' })));
        const m = await c.from('retos_miembros').insert(filas); if (m.error) throw m.error;
        btn.classList.remove('cargando'); btn.classList.add('listo'); btn.querySelector('.rf-go-t').textContent = '✅ ¡Reto creado!';
        setTimeout(() => { if (opt.onCreado) opt.onCreado(r.data); }, 650);
      } catch (e) {
        const falta = /relation|does not exist|PGRST205|42P01/i.test((e && e.message) || '');
        err(falta ? 'Falta ejecutar el SQL de retos en Supabase (sql/retos_companeros.sql).' : 'No se pudo crear el reto: ' + ((e && e.message) || 'error desconocido'));
        btn.disabled = false; btn.classList.remove('cargando');
      }
    }

    if (!host.__rfListo) {
      host.__rfListo = true;
      host.addEventListener('click', (e) => {
        const b = e.target.closest('[data-rf]'); if (!b || !host.contains(b)) return;
        const a = b.dataset.rf;
        if (a === 'cancelar') { if (opt.onCancelar) opt.onCancelar(); }
        else if (a === 'crear') crear();
        else if (a === 'plantilla') { const p = PLANTILLAS[Number(b.dataset.i)]; S.tipo = p.tipo; S.meta = p.meta; S.dias = p.dias; S.titulo = p.t; const ti = host.querySelector('#rf-titulo'); if (ti) ti.value = p.t; render(); }
        else if (a === 'tipo') { S.tipo = b.dataset.v; S.meta = TIPOS[S.tipo].def; render(); }
        else if (a === 'dur') { S.dias = Number(b.dataset.v); render(); }
        else if (a === 'modo') { S.modo = b.dataset.v; render(); }
        else if (a === 'mat') { S.modulo = b.dataset.v; render(); }
        else if (a === 'menos' || a === 'mas') { const p = TIPOS[S.tipo].paso, i = host.querySelector('#rf-meta'); S.meta = Math.max(1, (Number(i.value) || S.meta) + (a === 'mas' ? p : -p)); i.value = S.meta; tick(i); estimar(); }
        else if (a === 'sug') { S.meta = Number(b.dataset.v); const i = host.querySelector('#rf-meta'); i.value = S.meta; tick(i); estimar(); }
        else if (a === 'amigo') { const id = String(b.dataset.id); if (S.invitados.has(id)) S.invitados.delete(id); else S.invitados.add(id); b.classList.toggle('on', S.invitados.has(id)); estimar(); }
      });
      host.addEventListener('input', (e) => {
        if (e.target.id === 'rf-meta') { S.meta = Math.max(1, Number(e.target.value) || 1); estimar(); }
        else if (e.target.id === 'rf-dias') {
          S.dias = Number(e.target.value) || 1; e.target.style.setProperty('--p', Math.round((S.dias - 1) / 89 * 100) + '%');
          const t = host.querySelector('#rf-dias-t'); if (t) t.textContent = etiquetaDias(S.dias);
          host.querySelectorAll('.rf-chips--dur button').forEach((c) => c.classList.toggle('on', Number(c.dataset.v) === S.dias));
          const c = host.querySelector('#rf-como'); if (c) c.innerHTML = explicar({ tipo: S.tipo, modo: S.modo, modulo: S.modulo, dias: S.dias });
          estimar();
        }
      });
    }
    render();
    return { destruir() { host.innerHTML = ''; } };
  }

  window.NikaRetoCrear = { montar, explicar, TIPOS, MATERIAS, fmtValor };
})();
