/* NikaPlay — lobby visual (maqueta). Datos de ejemplo, sin red ni sesión.
   Se reemplaza por core.js / api.js al integrar datos. */
(function () {
  'use strict';

  var I = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var ICONOS = {
    caso: I('<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>'),
    word: I('<path d="M5 7V5h14v2M12 5v14M9 19h6"/>'),
    match: I('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M13.5 7h7v3.5M3.5 13.5v7h7"/>'),
    detective: I('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
    guardia: I('<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 3h5"/>'),
    ordena: I('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
    anatomia: I('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    versus: I('<path d="M5 5l14 14M19 5L5 19M4 4h3M17 4h3M4 20h3M17 20h3"/>'),
    batalla: I('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M15.5 14.8c3 0 5.5 1.7 5.5 5"/>'),
    coop: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    escape: I('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    amigos: I('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M17 11a2.5 2.5 0 1 0 0-5M18 14.8c2 .4 3 2 3 5"/>'),
    trofeo: I('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8.5 20h7"/>'),
    alerta: I('<path d="M12 3l10 17H2zM12 10v4M12 17.2h.01"/>')
  };

  var CATS = [
    { t: 'Partidas rápidas', s: '1–3 minutos', j: [
      { id: 'nikaword', ico: 'word', n: 'NikaWord', d: 'Descubrí el término médico escondido.', m: 'Individual · 2 min', st: 'disp' },
      { id: 'farmamatch', ico: 'match', n: 'FarmaMatch', d: 'Uní cada fármaco con su clase, mecanismo o uso.', m: 'Individual · a tu medida', st: 'prox' },
      { id: 'anatomia', ico: 'anatomia', n: 'Anatomía Express', d: 'Identificá estructuras en esquemas.', m: 'Individual · 3 min', st: 'prox' }
    ] },
    { t: 'Desafíos clínicos', s: '3–10 minutos', j: [
      { id: 'detective', ico: 'detective', n: 'Médico Detective', d: 'Descubrí el diagnóstico con pistas.', m: 'Individual · 5 min', st: 'prox' },
      { id: 'guardia', ico: 'guardia', n: 'Guardia contra reloj', d: 'Decisiones clínicas encadenadas.', m: 'Individual · 5 min', st: 'prox' },
      { id: 'escape', ico: 'escape', n: 'Escape Room Médico', d: 'Acertijos para resolver un misterio.', m: 'Individual · 10 min', st: 'prox' }
    ] },
    { t: 'Jugá con otros', s: 'Amigos, salas y competencias', j: [
      { id: 'versus', ico: 'versus', n: 'Duelos 1vs1', d: 'Desafiá a un compañero: opción múltiple con ranking ELO.', m: 'Multijugador · 5–10 min', st: 'disp', link: 'versus.html' },
      { id: 'batalla', ico: 'batalla', n: 'Batalla de Facultades', d: 'Competí en salas grupales.', m: 'Multijugador · 10 min', st: 'prox' },
      { id: 'coop', ico: 'coop', n: 'Guardia cooperativa', d: 'Resolvé un caso en equipo.', m: 'Cooperativo · 10 min', st: 'prox' }
    ] }
  ];

  var INFO = {
    nikaword: { t: 'NikaWord', r: ['Adiviná el término médico en 6 intentos. Cada término tiene entre 6 y 9 letras y los acentos se ignoran.', 'Verde ✓: letra en su lugar. Ámbar ●: está en otra posición. Gris: no está.', 'Son 3 términos por partida, con cronómetro opcional y un pequeño bono por rapidez.', 'El estetoscopio da pistas (materia y definición) y resta puntos. Al terminar, se explica el término.'], jugable: true },
    farmamatch: { t: 'FarmaMatch', r: ['Uní cada fármaco con su mecanismo, familia o uso clínico.', 'No hay cuenta regresiva que te empuje a responder sin pensar.', 'Cada error explica por qué la asociación no era correcta.'] },
    desafio: { t: 'El caso del día', r: ['Un caso breve, igual para toda la comunidad.', 'Una sola participación por día; el resultado se valida en el servidor.', 'Las respuestas y explicaciones se publican al cerrar el día.'] }
  };

  var $ = function (s) { return document.querySelector(s); };
  var estado = 'ok', timer = null;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function recordHtml(j) {
    var C = window.NikaPlay && window.NikaPlay.core; if (!C || j.st === 'prox') return '';
    if (j.id === 'nikaword' || j.id === 'farmamatch') {
      var G = window.NikaPlay[j.id], rc = G && G.record(); if (!rc) return '';
      return '<span class="rec">Récord (' + (rc.rotulo || rc.n + ' términos') + ', ' + (rc.ritmo === 'intenso' ? 'intenso' : 'justo') + '): <b>' + rc.mejor + ' pts</b></span>';
    }
    var st = C.stats(j.id); return st.mejor > 0 ? '<span class="rec">Récord personal: <b>' + st.mejor + ' pts</b></span>' : '';
  }
  function tarjeta(j, i) {
    var bloq = j.st === 'prox';
    var chip = bloq ? '<span class="np-chip lock">🔒 Próximamente</span>' : '<span class="np-chip ok">Disponible</span>';
    return '<button type="button" class="np-juego' + (bloq ? ' bloq' : '') + '" style="--i:' + i + '" data-juego="' + j.id + '"' + (bloq ? ' aria-disabled="true"' : '') + '>' +
      '<span class="top"><span class="np-ico">' + ICONOS[j.ico] + '</span>' + chip + '</span>' +
      '<h4>' + esc(j.n) + '</h4><p>' + esc(j.d) + '</p>' + recordHtml(j) +
      '<span class="pie"><span class="np-chip">' + esc(j.m) + '</span>' + (bloq ? '' : '<span class="go" aria-hidden="true">→</span>') + '</span></button>';
  }

  function render() {
    var c = $('#np-cats'); clearTimeout(timer);
    if (estado === 'carga') {
      c.innerHTML = CATS.map(function (k) { return '<div class="np-cat"><div class="np-cat-h"><h3>' + esc(k.t) + '</h3></div><div class="np-rail sk"><div class="np-sk"></div><div class="np-sk"></div></div></div>'; }).join('');
      // Regla de producto: nunca quedarse cargando para siempre
      timer = setTimeout(function () { estado = 'error'; marcarBotones(); render(); }, 8000);
      return;
    }
    if (estado === 'error') {
      c.innerHTML = '<div class="np-estado error" role="alert">' + ICONOS.alerta + '<strong>No pudimos cargar NikaPlay.</strong>Revisá tu conexión e intentá de nuevo. Tu progreso no se perdió.<br><button type="button" class="np-btn" data-estado="carga">Reintentar</button></div>';
      return;
    }
    var n = 0;
    c.innerHTML = CATS.map(function (k, ci) {
      return '<div class="np-cat" style="--i:' + (2 + ci) + '"><div class="np-cat-h"><h3>' + esc(k.t) + '</h3><span>' + esc(k.s) + '</span></div><div class="np-rail">' + k.j.map(function (j) { return tarjeta(j, n++); }).join('') + '</div></div>';
    }).join('');
  }

  function marcarBotones() { document.querySelectorAll('.np-proto button').forEach(function (b) { b.classList.toggle('on', b.dataset.estado === estado); }); }
  function abrir(h) { $('#np-dialog').classList.remove('guia'); $('#np-dialog').innerHTML = h; $('#np-modal').classList.add('open'); var b = $('#np-dialog .np-btn'); if (b) b.focus({ preventScroll: true }); $('#np-dialog').scrollTop = 0; }
  function cerrar() { $('#np-modal').classList.remove('open'); }

  function botonEmpezar(id) {
    var G = juego(id);
    if (G && G.empezar) return (G.hayPartida() ? '<button class="np-btn sec" data-jugar="' + id + '" data-nueva="1">Partida nueva</button>' : '') + '<button class="np-btn" data-jugar="' + id + '">' + (G.hayPartida() ? 'Continuar' : 'Empezar') + ' <span class="arr" aria-hidden="true">→</span></button>';
    return '<button class="np-btn" disabled title="Se activa al conectar los juegos">Empezar (próximamente)</button>';
  }
  function juego(id) { return window.NikaPlay && window.NikaPlay[id]; }

  function modal(id) {
    var todos = [].concat.apply([], CATS.map(function (k) { return k.j; })), j = todos.filter(function (x) { return x.id === id; })[0];
    if (j && j.link) { location.href = j.link; return; }
    if (j && j.st === 'prox') { abrir('<span class="np-eyebrow">En desarrollo</span><h3 id="np-modal-t">' + esc(j.n) + '</h3><p style="color:var(--text-muted)">' + esc(j.d) + '</p><p>🔒 Este juego llega en una próxima etapa.</p><div class="acciones"><button class="np-btn sec" data-cerrar>Entendido</button></div>'); return; }
    var G0 = juego(id), i = INFO[id];
    if (!G0 && !i) return;
    if (G0 && G0.guia) {
      abrir('<div class="np-guia-wrap">' + G0.guia() + '</div><div class="acciones"><button class="np-btn sec" data-cerrar>Cerrar</button>' + botonEmpezar(id) + '</div>');
      document.getElementById('np-dialog').classList.add('guia'); return;
    }
    var demo = i.demo ? '<div class="np-tablero" aria-label="Ejemplo de tablero">' + ['S:ok', 'E:pos', 'P:no', 'S:no', 'I:pos'].map(function (x, k) { var p = x.split(':'); return '<div class="np-letra ' + p[1] + '" style="--i:' + k + '">' + p[0] + '</div>'; }).join('') + '</div><div class="np-explica"><b>Al terminar:</b> verías el término, una definición breve y la fuente. Ejemplo ilustrativo, no es un desafío real.</div>' : '';
    abrir('<span class="np-eyebrow">Cómo se juega</span><h3 id="np-modal-t">' + esc(i.t) + '</h3><ul>' + i.r.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' + demo +
      '<div class="acciones"><button class="np-btn sec" data-cerrar>Cerrar</button>' + botonEmpezar(id) + '</div>');
  }

  document.addEventListener('click', function (e) {
    if (e.target === $('#np-modal')) return cerrar();
    var t = e.target.closest('[data-estado],[data-juego],[data-cerrar],[data-invitar],[data-jugar]');
    if (!t) return;
    if (t.dataset.jugar) { cerrar(); var G = juego(t.dataset.jugar); if (G) G.empezar(!!t.dataset.nueva); return; }
    if (t.hasAttribute('data-cerrar')) return cerrar();
    
    if (t.dataset.estado) { estado = t.dataset.estado; marcarBotones(); return render(); }
    if (t.dataset.juego) return modal(t.dataset.juego);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
  document.addEventListener('nikaplay:resultado', function () { render(); });

  // Controles de maqueta: solo con ?demo=1 (los usuarios no los ven)
  if (/[?&]demo=1(&|$)/.test(location.search)) { $('#np-aviso').hidden = false; $('#np-proto').hidden = false; }

  $('#np-feat-ico').innerHTML = ICONOS.caso;
  $('#np-am-ico').innerHTML = ICONOS.amigos;
  $('#np-pr-ico').innerHTML = ICONOS.trofeo;
  render();
})();
