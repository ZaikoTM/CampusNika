/* NikaPlay — parte social: tu progreso (nivel, XP, rango, ELO), ranking, amigos con buscador, invitaciones y salas multijugador
   (lobby, chat, reacciones, resultados con ELO). Usa NikaPlay.nube y NikaFriends (amistades ya existentes). */
(function () {
  'use strict';
  var NP = window.NikaPlay = window.NikaPlay || {}, C = NP.core, N = NP.nube, esc = C.esc;
  var EMOJIS = ['👏', '🔥', '😮', '😂', '💪', '🤔', '😭', '🎉', '👍', '❤️'];
  function $(s, r) { return (r || document).querySelector(s); }
  function toast(t) { if (window.showToast) window.showToast(t); else C.aviso && C.aviso(t); }
  function ini(n) { return esc(String(n || '?').trim().charAt(0).toUpperCase()); }
  function avatar(p) { return p.avatar ? '<img class="ns-av" src="' + esc(p.avatar) + '" alt="" loading="lazy">' : '<span class="ns-av ph">' + ini(p.nombre || p.username) + '</span>'; }
  function I(d, extra) { return '<svg class="ns-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>'; }
  var IC = {
    trofeo: I('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8.500 20h7"/>'),
    mas: I('<path d="M12 5v14M5 12h14"/>'), llave: I('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>'),
    buscar: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'), amigo: I('<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M19 8v6M16 11h6"/>'),
    ok: I('<path d="M5 12.500l4.500 4.500L19 7.500"/>'), copiar: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>'),
    enviar: I('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'), salir: I('<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>'),
    jugar: I('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'), corona: I('<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="currentColor" fill-opacity=".25"/>'),
    chat: I('<path d="M21 12a8 8 0 0 1-11.600 7.100L4 20l1-4.400A8 8 0 1 1 21 12z"/>'), grupo: I('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.500"/><path d="M3 20a6 6 0 0 1 12 0M15.500 14.500A5 5 0 0 1 21 19.500"/>'),
    rayo: I('<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor" fill-opacity=".25"/>'), sobre: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    reloj: I('<circle cx="12" cy="13" r="7.500"/><path d="M12 9v4l2.500 2M9.500 2h5"/>'), libro: I('<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>'),
    medalla: I('<circle cx="12" cy="9" r="5"/><path d="M8.500 13.500L7 21l5-3 5 3-1.500-7.500"/>')
  };
  function btn(ic, txt) { return IC[ic] + '<span>' + txt + '</span>'; }
  function falla(e) { return '<p class="ns-error" role="alert">' + esc(e && e.message || e) + '</p>'; }

  /* ================================================================== modal propio */
  var modal = null;
  function abrirModal(html, clase) {
    cerrarModal(); modal = document.createElement('div'); modal.className = 'ns-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="ns-dialog ' + (clase || '') + '"><button type="button" class="ns-x" data-ns-cerrar aria-label="Cerrar">×</button>' + html + '</div>';
    modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); }); document.body.appendChild(modal); return modal;
  }
  function cerrarModal() { if (modal) { modal.remove(); modal = null; } }

  /* ================================================================== progreso */
  function pintarProgreso() {
    var el = $('#np-pr-cuerpo'); if (!el) return;
    N.miPerfil().then(function (p) {
      if (!p) { el.innerHTML = '<p class="np-nota">Jugá tu primera partida para ver tu progreso.</p>'; return; }
      var base = p.xp_nivel_actual || 0, sig = p.xp_nivel_siguiente || 1, pct = Math.max(0, Math.min(100, Math.round((p.xp - base) / Math.max(1, sig - base) * 100)));
      var otra = p.elo_siguiente ? 'Próximo rango a ' + p.elo_siguiente + ' ELO' : 'Rango máximo';
      el.innerHTML = '<div class="ns-nivel"><div class="ns-nivel-n" title="Nivel"><small>Nivel</small><b>' + p.nivel + '</b></div><div class="ns-nivel-b"><div class="ns-barra"><i style="width:' + pct + '%"></i></div><small>' + p.xp + ' XP · faltan ' + Math.max(0, sig - p.xp) + ' para el nivel ' + (p.nivel + 1) + '</small></div></div>' +
        '<div class="ns-rango" style="--c:' + esc(p.rango_color || '#38bdf8') + '"><b>' + esc(p.rango || 'Estudiante') + '</b><span>' + p.elo_general + ' ELO · #' + p.posicion_global + ' del ranking</span><small>' + otra + '</small></div>' +
        '<div class="np-tiles"><div class="np-tile"><small>Partidas</small><b>' + p.partidas + '</b></div><div class="np-tile"><small>Racha de días</small><b>' + p.racha_dias + '</b></div><div class="np-tile"><small>Mejor racha</small><b>' + p.mejor_racha_dias + '</b></div></div>' +
        '<button type="button" class="np-btn sec ns-btn" data-ns-ranking>' + btn('trofeo', 'Ver rankings') + '</button>';
    }).catch(function (e) { el.innerHTML = '<p class="np-nota">Iniciá sesión para ver tu progreso.</p>'; });
  }

  /* ================================================================== rankings */
  var rk = { tipo: 'elo', juego: 'general', periodo: 'semana', alcance: 'global' };
  function abrirRanking() { abrirModal('<h3 class="ns-t">' + IC.trofeo + 'Rankings</h3><div id="ns-rk"></div>', 'ancho'); pintarRanking(); }
  function seg(nombre, op, act) { return '<div class="ns-seg" role="group">' + op.map(function (o) { return '<button type="button" class="' + (act === o[0] ? 'on' : '') + '" data-ns-rk="' + nombre + ':' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function pintarRanking() {
    var cont = $('#ns-rk'); if (!cont) return;
    cont.innerHTML = '<div class="ns-filtros">' + seg('tipo', [['elo', 'ELO'], ['prog', 'Progreso']], rk.tipo) +
      (rk.tipo === 'elo' ? seg('juego', [['general', 'General'], ['nikaword', 'NikaWord']], rk.juego) : seg('periodo', [['semana', 'Semana'], ['mes', 'Mes'], ['total', 'Total']], rk.periodo)) +
      seg('alcance', [['global', 'Todos'], ['amigos', 'Amigos']], rk.alcance) + '</div><div class="ns-lista" id="ns-rk-l"><p class="ns-vacio">Cargando…</p></div>';
    var p = rk.tipo === 'elo' ? N.rankingElo(rk.juego, rk.alcance) : N.rankingProgreso(rk.periodo, rk.alcance);
    p.then(function (rows) {
      var l = $('#ns-rk-l'); if (!l) return;
      if (!rows.length) { l.innerHTML = '<p class="ns-vacio">Todavía no hay partidas en este ranking. ¡Sé el primero!</p>'; return; }
      l.innerHTML = rows.map(function (r, i) {
        var med = r.posicion <= 3 ? '<span class="ns-med m' + r.posicion + '">' + r.posicion + '</span>' : '#' + r.posicion;
        var dato = rk.tipo === 'elo' ? '<b>' + r.elo + '</b><small>' + esc(r.rango) + ' · ' + r.victorias + 'V/' + r.partidas + 'P</small>' : '<b>' + r.puntos + ' pts</b><small>' + r.partidas + ' partidas · nivel ' + r.nivel + '</small>';
        return '<div class="ns-fila' + (r.soy_yo ? ' yo' : '') + '" style="--i:' + Math.min(i, 12) + ';--c:' + esc(r.color || '#38bdf8') + '"><span class="ns-pos">' + med + '</span>' + avatar({ avatar: r.avatar, nombre: r.nombre }) +
          '<span class="ns-nom">' + esc(r.nombre) + (r.soy_yo ? ' <em>(vos)</em>' : '') + '<small>@' + esc(r.username || '') + '</small></span><span class="ns-dato">' + dato + '</span></div>';
      }).join('');
    }).catch(function (e) { var l = $('#ns-rk-l'); if (l) l.innerHTML = falla(e); });
  }

  /* ================================================================== amigos, buscador e invitaciones */
  var invSub = null;
  function pintarAmigos() {
    var el = $('#np-am-cuerpo'); if (!el) return;
    el.innerHTML = '<div id="ns-invs"></div><form class="ns-buscar" id="ns-buscar" role="search"><input type="search" id="ns-q" placeholder="Buscá un compañero por nombre o usuario" autocomplete="off" minlength="2" aria-label="Buscar compañeros"><button type="submit" class="np-btn sec ns-btn" aria-label="Buscar">' + IC.buscar + '</button></form><div id="ns-res"></div><div id="ns-amigos"></div>' +
      '<div class="ns-acc"><button type="button" class="np-btn ns-btn" data-ns-crear>' + btn('mas', 'Crear sala') + '</button><button type="button" class="np-btn sec ns-btn" data-ns-codigo>' + btn('llave', 'Unirme con código') + '</button></div>';
    cargarInvitaciones(); cargarAmigos();
    if (!invSub) invSub = N.suscribirInvitaciones(function () { cargarInvitaciones(); });
  }
  var amigosCache = [];
  function filaAmigo(f) {
    var id = f.id || f.user_id, nom = f.fullname || f.username || 'Amigo';
    return '<div class="ns-fila mini" data-b="' + esc((nom + ' ' + (f.username || '')).toLowerCase()) + '">' + avatar({ avatar: f.avatar, nombre: nom }) + '<span class="ns-nom">' + esc(nom) + '<small>@' + esc(f.username || '') + '</small></span><button type="button" class="ns-chip" data-ns-invitar="' + esc(id) + '">' + IC.sobre + 'Invitar</button></div>';
  }
  function todosAmigos() {
    abrirModal('<h3 class="ns-t">' + IC.grupo + 'Tus amigos (' + amigosCache.length + ')</h3><div class="ns-buscar"><input type="search" id="ns-fa" placeholder="Filtrar por nombre" autocomplete="off" aria-label="Filtrar amigos"></div><div id="ns-fa-l">' + amigosCache.map(filaAmigo).join('') + '</div>', 'chico');
    $('#ns-fa').addEventListener('input', function (e) { var q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#ns-fa-l .ns-fila').forEach(function (r) { r.style.display = !q || r.dataset.b.indexOf(q) > -1 ? '' : 'none'; }); });
  }
  function cargarAmigos() {
    var c = $('#ns-amigos'); if (!c) return;
    if (!window.NikaFriends) { c.innerHTML = ''; return; }
    window.NikaFriends.listFriends().then(function (fr) {
      if (!fr.length) { c.innerHTML = '<p class="ns-vacio">Todavía no tenés amigos agregados. Usá el buscador para sumar compañeros.</p>'; return; }
      amigosCache = fr;
      c.innerHTML = '<h4 class="ns-sub">Tus amigos <em>' + fr.length + '</em></h4>' + fr.slice(0, 5).map(filaAmigo).join('') + (fr.length > 5 ? '<button type="button" class="ns-chip ns-todos" data-ns-todos>Ver todos (' + fr.length + ')</button>' : '');
    }).catch(function () { c.innerHTML = ''; });
  }
  function cargarInvitaciones() {
    var c = $('#ns-invs'); if (!c) return;
    N.misInvitaciones().then(function (rows) {
      if (!rows.length) { c.innerHTML = ''; return; }
      c.innerHTML = rows.map(function (i) {
        return '<div class="ns-inv"><span class="ns-inv-i">' + IC.rayo + '</span><span class="ns-nom"><b>' + esc(i.de) + '</b> te invitó a jugar NikaWord' + (i.mensaje ? '<small>«' + esc(i.mensaje) + '»</small>' : '') + '</span><button type="button" class="ns-chip ok" data-ns-resp="si:' + esc(i.id) + '">' + IC.ok + 'Aceptar</button><button type="button" class="ns-chip" data-ns-resp="no:' + esc(i.id) + '">Ahora no</button></div>';
      }).join('');
      if (rows[0] && NP.sonido) NP.sonido.pista();
    }).catch(function () { c.innerHTML = ''; });
  }
  function buscar(q) {
    var c = $('#ns-res'); if (!c) return;
    if (q.trim().length < 2) { c.innerHTML = '<p class="ns-vacio">Escribí al menos 2 letras.</p>'; return; }
    c.innerHTML = '<p class="ns-vacio">Buscando…</p>';
    N.buscar(q.trim()).then(function (rows) {
      if (!rows.length) { c.innerHTML = '<p class="ns-vacio">No encontramos a nadie con ese nombre.</p>'; return; }
      c.innerHTML = rows.map(function (u) {
        var acc = u.relacion === 'amigo' ? '<button type="button" class="ns-chip" data-ns-invitar="' + esc(u.user_id) + '">' + IC.sobre + 'Invitar</button>' : u.relacion === 'enviada' ? '<span class="ns-chip off">Solicitud enviada</span>' : u.relacion === 'recibida' ? '<button type="button" class="ns-chip ok" data-ns-acepta="' + esc(u.user_id) + '">Aceptar solicitud</button>' : '<button type="button" class="ns-chip ok" data-ns-agregar="' + esc(u.user_id) + '">' + IC.amigo + 'Agregar</button>';
        return '<div class="ns-fila mini">' + avatar({ avatar: u.avatar, nombre: u.nombre }) + '<span class="ns-nom">' + esc(u.nombre) + '<small>@' + esc(u.username) + ' · ' + esc(u.rango) + ' · nivel ' + u.nivel + '</small></span>' + acc + '</div>';
      }).join('');
    }).catch(function (e) { c.innerHTML = falla(e); });
  }

  /* ================================================================== sala: estado y pantalla */
  var S = { id: null, sala: null, jug: [], msj: [], yo: null, unsub: null, poll: null, enJuego: false, vista: 'lobby' };
  function limpiarSala() { if (S.unsub) S.unsub(); if (S.poll) clearInterval(S.poll); S = { id: null, sala: null, jug: [], msj: [], yo: null, unsub: null, poll: null, enJuego: false, vista: 'lobby' }; }

  function entrarSala(id) {
    limpiarSala(); S.id = id;
    return N.yo().then(function (uid) { S.yo = uid; return recargar(); }).then(function () {
      S.unsub = N.suscribir(id, {
        cambio: function () { recargar(); },
        mensaje: function (m) { N.conNombres([m]).then(function (r) { S.msj.push(r[0]); if (S.msj.length > 80) S.msj.shift(); pintarChat(true); }); },
        reaccion: function (r) { flotar(r.emoji, r.user_id); }
      });
      S.poll = setInterval(recargar, 4000);
      abrirPantallaSala();
    });
  }
  function recargar() {
    if (!S.id) return Promise.resolve();
    var id = S.id;
    return Promise.all([N.sala(id), N.jugadores(id), S.msj.length ? Promise.resolve(S.msj) : N.mensajes(id)]).then(function (r) {
      if (S.id !== id) return; S.sala = r[0]; S.jug = r[1]; S.msj = r[2];
      if (!S.sala) { toast('La sala ya no existe.'); salirLocal(); return; }
      if (S.sala.estado === 'cancelada') { toast('El anfitrión canceló la sala.'); salirLocal(); return; }
      if (S.sala.estado === 'jugando' && !S.enJuego) {
        var yo = S.jug.filter(function (j) { return j.user_id === S.yo; })[0];
        if (yo && !yo.terminado_at) { S.enJuego = true; if (NP.nikaword && NP.nikaword.empezarSala) NP.nikaword.empezarSala({ salaId: id, semilla: S.sala.semilla, n: +S.sala.config.n, ritmo: S.sala.config.ritmo, inicio: S.sala.inicio_at }); return; }
      }
      if (S.sala.estado === 'jugando' && S.sala.inicio_at && Date.now() - new Date(S.sala.inicio_at).getTime() > ((+S.sala.config.n || 5) * (S.sala.config.ritmo === 'intenso' ? 30 : 45) + 125) * 1000) N.cerrarSala(id, true).catch(function () {});
      pintarSala();
    }).catch(function () {});
  }
  function salirLocal() { var pn = C.pantalla(); if (pn && pn.classList.contains('npg-sala')) C.cerrarPantalla(true); limpiarSala(); }
  function abrirPantallaSala() {
    var p = C.abrirPantalla('npg-sala', function () { /* cierre con Esc/Salir */ }); pintarSala(); return p;
  }

  function pintarSala() {
    var p = C.pantalla(); if (!p || !p.classList.contains('npg-sala') || !S.sala) return;
    var s = S.sala, soyHost = s.anfitrion_id === S.yo, yo = S.jug.filter(function (j) { return j.user_id === S.yo; })[0] || {}, fin = s.estado === 'fin';
    var jug = S.jug.slice(); if (fin) jug.sort(function (a, b) { return (a.posicion || 99) - (b.posicion || 99); });
    var lista = jug.map(function (j, i) {
      var d = (j.elo_antes != null && j.elo_despues != null) ? j.elo_despues - j.elo_antes : null;
      return '<li class="ns-j' + (j.listo || fin ? ' listo' : '') + (j.user_id === S.yo ? ' yo' : '') + '" style="--i:' + i + '">' + (fin ? '<span class="ns-pos">' + (j.posicion == 1 ? '<span class="ns-med m1">' + IC.corona + '</span>' : '#' + j.posicion) + '</span>' : '') + avatar(j) +
        '<span class="ns-nom">' + esc(j.nombre) + (j.user_id === s.anfitrion_id ? ' <em>anfitrión</em>' : '') + '<small>' + (fin ? j.puntos + ' puntos' + (d != null ? ' · ELO ' + (d >= 0 ? '+' : '') + d : '') + ' · +' + (j.xp_ganada || 0) + ' XP' : (s.estado === 'jugando' ? (j.terminado_at ? 'Terminó' : 'Jugando…') : (j.listo ? 'Listo' : 'Esperando…'))) + '</small></span>' +
        (fin && d != null ? '<span class="ns-delta ' + (d >= 0 ? 'sube' : 'baja') + '">' + (d >= 0 ? '▲' : '▼') + Math.abs(d) + '</span>' : (s.estado === 'espera' ? '<i class="ns-ok" aria-hidden="true">' + (j.listo ? '✓' : '…') + '</i>' : '')) + '</li>';
    }).join('');
    var acciones;
    if (s.estado === 'espera') acciones = (soyHost ? '<button type="button" class="np-btn ns-btn" data-ns-iniciar' + (S.jug.length < 2 || S.jug.some(function (j) { return !j.listo; }) ? ' disabled' : '') + '>' + btn('jugar', 'Iniciar partida') + '</button>' : '<button type="button" class="np-btn ns-btn' + (yo.listo ? ' sec' : '') + '" data-ns-listo="' + (yo.listo ? 0 : 1) + '">' + btn('ok', yo.listo ? 'No estoy listo' : '¡Estoy listo!') + '</button>') +
      '<button type="button" class="np-btn sec ns-btn" data-ns-invitar-sala>' + btn('amigo', 'Invitar amigos') + '</button><button type="button" class="np-btn sec ns-btn" data-ns-salir>' + btn('salir', 'Salir') + '</button>';
    else if (s.estado === 'jugando') acciones = '<p class="ns-esperando">Esperando a que terminen los demás…</p>';
    else acciones = '<button type="button" class="np-btn ns-btn" data-ns-volver>' + btn('salir', 'Volver a NikaPlay') + '</button>';
    var cfg = s.config || {}, titulo = fin ? 'Resultados' : s.estado === 'jugando' ? 'Partida en curso' : 'Sala de espera';
    if (!p.querySelector('.ns-sala')) {
      p.innerHTML = '<div class="ns-sala"><header class="ns-sala-top"><button type="button" class="ns-x2" data-ns-salir-pant aria-label="Salir de la sala">' + IC.salir.replace('<svg', '<svg style="transform:scaleX(-1)"') + ' Volver</button><h2 id="ns-sala-t"></h2><span class="ns-codigo" id="ns-cod"></span></header>' +
        '<div class="ns-sala-cuerpo"><section class="ns-sala-izq"><div id="ns-info"></div><ul class="ns-jugadores" id="ns-jug"></ul><div class="ns-acc2" id="ns-acc"></div></section>' +
        '<section class="ns-chat" aria-label="Chat de la sala"><div class="ns-chat-l" id="ns-chat-l" aria-live="polite"></div><div class="ns-reac" id="ns-reac">' + EMOJIS.map(function (e) { return '<button type="button" data-ns-emoji="' + e + '" aria-label="Reaccionar ' + e + '">' + e + '</button>'; }).join('') + '</div>' +
        '<form class="ns-chat-f" id="ns-chat-f"><input type="text" id="ns-chat-i" maxlength="200" placeholder="Escribí un mensaje…" autocomplete="off" aria-label="Mensaje"><button type="submit" class="np-btn ns-btn" aria-label="Enviar mensaje">' + IC.enviar + '</button></form></section></div></div>';
    }
    $('#ns-sala-t').textContent = titulo; $('#ns-cod').innerHTML = s.estado === 'espera' ? 'Código <b>' + esc(s.codigo) + '</b> <button type="button" class="ns-chip" data-ns-copiar="' + esc(s.codigo) + '">' + IC.copiar + 'Copiar</button>' : '';
    $('#ns-info').innerHTML = '<div class="ns-chips"><span class="ns-chip off">' + IC.libro + esc(cfg.n || 5) + ' términos</span><span class="ns-chip off">' + IC.reloj + (cfg.ritmo === 'intenso' ? 'Intenso' : 'Justo') + '</span><span class="ns-chip off">' + IC.grupo + S.jug.length + '/' + s.max_jugadores + '</span><span class="ns-chip off">' + IC.medalla + (s.puntuable ? 'Suma ELO' : 'Amistosa') + '</span></div>';
    $('#ns-jug').innerHTML = lista; $('#ns-acc').innerHTML = acciones; pintarChat(false);
    if (fin && !S.celebrado) { S.celebrado = true; var yoF = S.jug.filter(function (j) { return j.user_id === S.yo; })[0]; if (yoF && yoF.posicion == 1) { if (NP.sonido) NP.sonido.victoria(); if (NP.doctor) NP.doctor.confeti(p, 60); } else if (NP.sonido) NP.sonido.acierto(); }
  }
  function pintarChat(scroll) {
    var l = $('#ns-chat-l'); if (!l) return;
    var abajo = l.scrollHeight - l.scrollTop - l.clientHeight < 60;
    l.innerHTML = S.msj.length ? S.msj.map(function (m) { return '<div class="ns-m' + (m.user_id === S.yo ? ' yo' : '') + '"><b>' + esc(m.nombre || 'Jugador') + '</b><span>' + esc(m.texto) + '</span></div>'; }).join('') : '<p class="ns-vacio">Nadie escribió todavía. ¡Saludá!</p>';
    if (scroll || abajo) l.scrollTop = l.scrollHeight;
  }
  function flotar(emoji, uid) {
    var e = document.createElement('div'); e.className = 'ns-flota'; e.textContent = emoji; e.style.left = (8 + Math.random() * 80) + '%';
    var nom = S.jug.filter(function (j) { return j.user_id === uid; })[0]; if (nom && uid !== S.yo) e.setAttribute('title', nom.nombre);
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2600);
  }

  /* resultado desde el juego */
  function enviarResultadoSala(r) {
    var id = S.id; if (!id) return Promise.resolve();
    S.enJuego = true;
    return N.enviarResultado(id, r).catch(function (e) { toast(e.message); }).then(function () { abrirPantallaSala(); return recargar(); });
  }

  /* ================================================================== acciones */
  function crearSalaDialogo() {
    abrirModal('<h3 class="ns-t">' + IC.mas + 'Crear sala</h3><p class="ns-vacio">Todos juegan los mismos términos a la vez. Gana quien más puntos hace; la partida suma o resta ELO.</p>' +
      '<label class="ns-lab">Términos<select id="ns-n"><option>3</option><option selected>5</option><option>10</option></select></label>' +
      '<label class="ns-lab">Ritmo<select id="ns-r"><option value="justo">Justo (45 s por término)</option><option value="intenso">Intenso (30 s por término)</option></select></label>' +
      '<label class="ns-lab">Jugadores<select id="ns-m"><option>2</option><option>3</option><option selected>4</option><option>6</option><option>8</option></select></label>' +
      '<div class="ns-acc"><button type="button" class="np-btn ns-btn" data-ns-crear-ok>' + btn('mas', 'Crear sala') + '</button></div><div id="ns-err"></div>', 'chico');
  }
  function codigoDialogo() {
    abrirModal('<h3 class="ns-t">' + IC.llave + 'Unirme a una sala</h3><form id="ns-cod-f" class="ns-buscar"><input type="text" id="ns-cod-i" maxlength="6" placeholder="Código de 6 letras" autocomplete="off" style="text-transform:uppercase" aria-label="Código de la sala"><button type="submit" class="np-btn ns-btn">' + btn('salir', 'Entrar') + '</button></form><div id="ns-err"></div>', 'chico');
  }
  function invitarASala(para, boton) {
    var hacer = function (sala) { return N.invitar(para, sala, 'nikaword', null).then(function () { toast('¡Invitación enviada!'); if (boton) { boton.textContent = 'Enviada ✓'; boton.disabled = true; } }).catch(function (e) { toast(e.message); }); };
    if (S.id && S.sala && S.sala.estado === 'espera' && S.sala.anfitrion_id === S.yo) return hacer(S.id);
    // desde el lobby: se crea una sala y se invita
    return N.crearSala({ n: 5, ritmo: 'justo' }, 4, true).then(function (r) { return hacer(r.sala_id).then(function () { return entrarSala(r.sala_id); }); }).catch(function (e) { toast(e.message); });
  }
  function invitarListaSala() {
    if (!window.NikaFriends) return;
    window.NikaFriends.listFriends().then(function (fr) {
      var yaEn = S.jug.map(function (j) { return j.user_id; });
      var h = fr.filter(function (f) { return yaEn.indexOf(String(f.id || f.user_id)) < 0; }).map(function (f) { var nom = f.fullname || f.username; return '<div class="ns-fila mini">' + avatar({ avatar: f.avatar, nombre: nom }) + '<span class="ns-nom">' + esc(nom) + '<small>@' + esc(f.username || '') + '</small></span><button type="button" class="ns-chip" data-ns-invitar="' + esc(f.id || f.user_id) + '">Invitar</button></div>'; }).join('');
      abrirModal('<h3 class="ns-t">' + IC.amigo + 'Invitar amigos</h3>' + (h || '<p class="ns-vacio">No tenés amigos para invitar. Buscalos desde el lobby.</p>'), 'chico');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,[data-ns-cerrar]'); if (!t) return;
    var d = t.dataset;
    if (t.hasAttribute('data-ns-cerrar')) return cerrarModal();
    if (t.hasAttribute('data-ns-ranking')) return abrirRanking();
    if (t.hasAttribute('data-ns-todos')) return todosAmigos();
    if (d.nsRk) { var kv = d.nsRk.split(':'); rk[kv[0]] = kv[1]; return pintarRanking(); }
    if (t.hasAttribute('data-ns-crear')) return crearSalaDialogo();
    if (t.hasAttribute('data-ns-codigo')) return codigoDialogo();
    if (t.hasAttribute('data-ns-crear-ok')) { t.disabled = true; return N.crearSala({ n: +$('#ns-n').value, ritmo: $('#ns-r').value }, +$('#ns-m').value, true).then(function (r) { cerrarModal(); return entrarSala(r.sala_id); }).catch(function (er) { t.disabled = false; var x = $('#ns-err'); if (x) x.innerHTML = falla(er); }); }
    if (d.nsInvitar) return invitarASala(d.nsInvitar, t);
    if (t.hasAttribute('data-ns-invitar-sala')) return invitarListaSala();
    if (d.nsAgregar) { t.disabled = true; return window.NikaFriends.sendRequest(d.nsAgregar).then(function (r) { toast(r && r.ok ? '¡Solicitud enviada!' : (r && r.error) || 'No se pudo enviar'); t.textContent = 'Solicitud enviada'; }); }
    if (d.nsAcepta) { t.disabled = true; return window.NikaFriends.acceptFrom(d.nsAcepta).then(function () { toast('¡Ahora son amigos!'); buscar($('#ns-q').value); cargarAmigos(); }); }
    if (d.nsResp) { var kv2 = d.nsResp.split(':'); t.disabled = true; return N.responderInvitacion(kv2[1], kv2[0] === 'si').then(function (sala) { cargarInvitaciones(); if (sala) return entrarSala(sala); }).catch(function (er) { toast(er.message); cargarInvitaciones(); }); }
    if (d.nsListo != null && t.hasAttribute('data-ns-listo')) return N.listo(S.id, d.nsListo === '1').then(recargar).catch(function (er) { toast(er.message); });
    if (t.hasAttribute('data-ns-iniciar')) { t.disabled = true; return N.iniciar(S.id).then(recargar).catch(function (er) { toast(er.message); t.disabled = false; }); }
    if (t.hasAttribute('data-ns-salir') || t.hasAttribute('data-ns-salir-pant')) { var id = S.id, jugando = S.sala && S.sala.estado === 'jugando'; if (id) (jugando ? N.abandonar(id) : N.salir(id)).catch(function () {}); salirLocal(); return; }
    if (t.hasAttribute('data-ns-volver')) { salirLocal(); pintarProgreso(); return; }
    if (d.nsEmoji) { if (S.id) N.reaccion(S.id, d.nsEmoji).catch(function () {}); flotar(d.nsEmoji, S.yo); return; }
    if (d.nsCopiar) { if (navigator.clipboard) navigator.clipboard.writeText(d.nsCopiar).then(function () { toast('Código copiado'); }); return; }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'ns-buscar') { e.preventDefault(); buscar($('#ns-q').value); }
    else if (f.id === 'ns-cod-f') { e.preventDefault(); var c = $('#ns-cod-i').value; N.unirse(c).then(function (id) { cerrarModal(); return entrarSala(id); }).catch(function (er) { var x = $('#ns-err'); if (x) x.innerHTML = falla(er); }); }
    else if (f.id === 'ns-chat-f') { e.preventDefault(); var i = $('#ns-chat-i'), t = i.value.trim(); if (!t || !S.id) return; i.value = ''; N.mensaje(S.id, t).catch(function (er) { toast(er.message); }); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarModal(); });

  /* entrada al lobby */
  function iniciar() {
    if (!$('#np-am-cuerpo')) return;
    pintarProgreso(); pintarAmigos();
    document.addEventListener('nikaplay:resultado', function () { setTimeout(pintarProgreso, 600); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  NP.social = { entrarSala: entrarSala, enviarResultadoSala: enviarResultadoSala, pintarProgreso: pintarProgreso, abrirRanking: abrirRanking, abrirPantallaSala: abrirPantallaSala, flotar: flotar,
    sala: function () { return S; }, reaccionar: function (emoji) { if (S.id) { N.reaccion(S.id, emoji).catch(function () {}); flotar(emoji, S.yo); } }, emojis: EMOJIS, volverASala: function () { abrirPantallaSala(); recargar(); } };
})();
