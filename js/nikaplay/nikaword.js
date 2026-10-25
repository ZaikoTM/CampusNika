/* NikaWord — adiviná el término médico (6 a 9 letras) en 6 intentos, contra un reloj único.
   Partida configurable: cantidad de términos y ritmo. El reloj es uno solo para toda la partida (segundos por término
   × cantidad) y cada error resta tiempo; si llega a cero la partida termina. Modo práctica: sin reloj.
   Puntos solo de juego: no cuentan en las notas ni en el rendimiento académico.
   Depende de js/nikaplay/core.js y de data/nikaplay/nikaword.json (borrador, sin revisión médica final).
   Pensado para sumar multijugador: los términos salen de una semilla (run.seed); el resultado oficial competitivo
   se validará en el servidor más adelante. */
(function () {
  'use strict';
  var NP = window.NikaPlay, C = NP.core, esc = C.esc;

  var CFG = { intentos: 6, base: 100, porIntento: 15, bonoVel: 40, costoPista: 20, minimo: 10, penalSeg: 10, segPorPunto: 2, maxN: 50, presets: [3, 5, 10, 15, 20],
    ritmos: { justo: { seg: 45, nom: 'Justo', det: '45 s por término' }, intenso: { seg: 30, nom: 'Intenso', det: '30 s por término' }, libre: { seg: 0, nom: 'Práctica', det: 'sin reloj' } }, version: 2 };
  var FILAS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  var RUN_KEY = 'nikaword_run', PREF_KEY = 'nikaword_pref2';

  var datos = null, run = null, reloj = null, bloqueado = false, ticks = 0, ayudaAbierta = false, rindeLista = false, flashTimer = null, cfg = { n: 5, ritmo: 'justo' };

  var IC = {
    steto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg>',
    salir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    sonido: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="on" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/><path class="of" d="M17 9l5 6M22 9l-5 6"/></svg>',
    fuego: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s1 1.5 2 1.5C10 8 11 5 12 2z" fill="#ff8a1f"/><path d="M12 22a3.5 3.5 0 0 1-3.5-3.5c0-2 2-3 3.5-5 1.500 2 3.5 3 3.5 5A3.5 3.5 0 0 1 12 22z" fill="#ffd23f"/></svg>',
    reto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 17.5L3 6V3h3l11.500 11.500M13 19l6-6M16 16l4 4M19 21l2-2M14.5 6.500L18 3h3v3l-3.500 3.500"/></svg>',
    compartir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.600 13.500l6.800 4M15.400 6.500l-6.800 4"/></svg>',
    ayuda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.8M12 17h.01"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 5H9l-6 7 6 7h11a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9l-5 6M12 9l5 6"/></svg>',
    reloj: '<svg class="npg-rj-svg" viewBox="0 0 64 74" aria-hidden="true"><rect class="boton" x="25" y="0" width="14" height="8" rx="3"/><rect class="boton" x="29" y="6" width="6" height="7"/><circle class="rim" cx="32" cy="42" r="29"/><circle class="cara" cx="32" cy="42" r="23"/><circle class="anillo" cx="32" cy="42" r="26" pathLength="100"/><g class="marcas"><path d="M32 22v4M32 58v4M12 42h4M48 42h4"/></g><g class="aguja"><line x1="32" y1="42" x2="32" y2="26"/></g><circle class="eje" cx="32" cy="42" r="2.6"/></svg>'
  };

  var I2 = function (d, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC2 = {
    engr: I2('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    cron: I2('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2h5M12 2v3.5"/>'), rayo: I2('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    libre: I2('<circle cx="12" cy="13.5" r="7.5"/><path d="M9 10.5l6 6M15 10.5l-6 6M9.5 2h5M12 2v3.5"/>'), bandera: I2('<path d="M5 22V3M5 4h12l-2 4 2 4H5"/>'),
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l14 8-14 8z" fill="currentColor"/></svg>', avion: I2('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'),
    bombilla: I2('<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>'),
    libro: I2('<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>'), doc: I2('<path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7M9 8h3"/>')
  };
  var DOCTOR = function (o) { return window.NikaPlay.doctor ? window.NikaPlay.doctor.html(o) : ''; };
  function dec(txt, estado, ms) {
    var pa = C.pantalla(); if (!pa || !NP.doctor) return;
    NP.doctor.decir(pa.querySelector('.npg-flash') || pa, estado, txt, ms === 0 ? 0 : Math.min(ms || 1500, 1700), { estado: 'idle', texto: '' });   // si hay cartel, habla el doctor del cartel
  }
  /** Logo NikaWord: "Nika" blanco, "W-o-rld" dorado con un globo girando en la o, chispa y órbita. */
  var CONT = '<path d="M6 20c6-8 16-8 22-2 4 4 2 10-4 12-8 2-10 10-6 16-8-2-14-10-12-26zM34 36c8-4 14 2 12 10s-8 12-12 6-4-12 0-16zM58 14c6-6 16-4 18 4s-6 10-12 12-10-8-6-16zM84 28c8-4 16 2 16 10s-8 16-14 12-8-14-2-22zM108 12c6-2 12 4 10 12s-10 6-12 0-2-10 2-12z" fill="#43d36f" stroke="#1e8f45" stroke-width="2"/><path d="M70 50c4-2 10 0 10 5s-6 6-10 3z" fill="#43d36f" stroke="#1e8f45" stroke-width="2"/>';
  var GLOBO = '<span class="globo" aria-hidden="true"><svg viewBox="0 0 64 64"><defs><radialGradient id="nwo" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#a9e6ff"/><stop offset=".7" stop-color="#2b8cea"/><stop offset="1" stop-color="#1558b8"/></radialGradient><clipPath id="nwc"><circle cx="32" cy="32" r="31"/></clipPath></defs><circle cx="32" cy="32" r="31" fill="url(#nwo)"/><g clip-path="url(#nwc)"><g class="nw-cont" transform="scale(.5) translate(8 14)">' + CONT + '</g><g fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"><ellipse cx="32" cy="32" rx="13" ry="31"/><ellipse cx="32" cy="32" rx="25" ry="31"/><path d="M1 32h62M5 17h54M5 47h54"/></g><ellipse cx="22" cy="17" rx="13" ry="7" fill="rgba(255,255,255,.4)" transform="rotate(-30 22 17)"/><circle cx="32" cy="32" r="31" fill="none" stroke="rgba(0,30,100,.35)" stroke-width="6"/></g></svg></span>';
  function logoHtml(mini) {
    return '<span class="nw-logo' + (mini ? ' mini' : '') + '" role="img" aria-label="NikaWord">' + (mini ? '' : '<svg class="nw-chispa" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0l5 14 15 6-15 6-5 14-5-14L0 20l15-6z" fill="#ffd23f" stroke="#c9891a" stroke-width="2"/></svg><svg class="nw-orbita" viewBox="0 0 300 90" aria-hidden="true"><path d="M8 70C40 20 160 4 290 22" fill="none" stroke="#ffcf3d" stroke-width="7" stroke-linecap="round"/><path d="M8 70C40 20 160 4 290 22" fill="none" stroke="#fff3b0" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 14"/></svg>') +
      '<span class="n1">Nika</span><span class="w1">W</span>' + GLOBO + '<span class="w2">rd</span></span>';
  }

  /* ------------------------------------------------------------------ guía de reglas (lobby, inicio y ayuda) */
  function guia() {
    var ej = [['S', 'ok'], ['E', 'ok'], ['R', 'no'], ['O', 'no'], ['S', 'pos'], ['A', 'no']];
    return '<div class="ngd"><div class="ngd-head"><span class="ngd-ico">' + IC.steto + '</span><div><b>Cómo se juega NikaWord</b><span>Descubrí el término médico escondido</span></div></div>' +
      '<ol class="ngd-pasos">' +
      '<li class="p1"><span class="n">1</span><div><b>Escribí un término</b><p>Tiene entre <strong>6 y 9 letras</strong>. Usá el teclado y tocá <strong>ENVIAR</strong>. Tenés <strong>' + CFG.intentos + ' intentos</strong>. Los acentos no importan. <strong>Siempre ves gratis la definición, la materia y la primera letra.</strong></p></div></li>' +
      '<li class="p2"><span class="n">2</span><div><b>Mirá los colores</b><p>Cada letra te dice qué tan cerca estás. Ejemplo: el término es SEPSIS y escribiste SEROSA.</p>' +
      '<div class="ngd-ej" aria-label="Ejemplo: SEROSA contra SEPSIS">' + ej.map(function (x, i) { return '<span class="f ' + x[1] + '" style="--i:' + i + '">' + x[0] + '</span>'; }).join('') + '</div>' +
      '<ul class="ngd-leyenda"><li><i class="f ok">✓</i> <b>Verde:</b> la letra está en su lugar</li><li><i class="f pos">●</i> <b>Ámbar:</b> está, pero en otro lugar</li><li><i class="f no">·</i> <b>Gris:</b> no está en el término</li></ul></div></li>' +
      '<li class="p3"><span class="n">3</span><div><b>Cuidá el reloj</b><p>Hay <strong>un solo reloj para toda la partida</strong>: <strong>cuanto más rápido resolvés un término, más puntos</strong> (hasta +' + CFG.bonoVel + '). Cada <strong>error te resta ' + CFG.penalSeg + ' segundos</strong> y, si llega a cero, la partida termina. El <strong>estetoscopio</strong> revela una letra (hasta 2 veces) y resta ' + CFG.costoPista + ' puntos.</p></div></li></ol>' +
      '<div class="ngd-pie"><span>Vos elegís cuántos términos jugar</span><span>Rápido = más puntos</span><span>Cada error: −' + CFG.penalSeg + ' s</span><span>Puntos solo de juego</span></div></div>';
  }

  /* ------------------------------------------------------------------ datos */
  function cargar() {
    if (datos) return Promise.resolve(datos);
    return fetch('data/nikaplay/nikaword.json?v=2').then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { if (!j || !j.terminos || j.terminos.length < 3) throw new Error('datos'); datos = j; return j; });
  }
  function termino(id) { for (var i = 0; i < datos.terminos.length; i++) if (datos.terminos[i].id === id) return datos.terminos[i]; return null; }
  function actual() { return termino(run.ids[run.idx]); }
  /** Posiciones (1..n-1) que revelan las pistas pagas, en orden fijo para esa partida y término. */
  function posPistas(t) {
    var pos = []; for (var i = 1; i < t.n.length; i++) pos.push(i);
    return C.mezclar(pos, C.rng(run.seed + run.idx * 7919));
  }
  function fantasmas(t) { var o = {}, ps = posPistas(t); for (var i = 0; i < run.pistas; i++) o[ps[i]] = t.n.charAt(ps[i]); return o; }
  function totalMs(n, ritmo) { return n * (CFG.ritmos[ritmo] || CFG.ritmos.justo).seg * 1000; }

  /* ------------------------------------------------------------------ reglas */
  function evaluar(g, t) {
    var n = t.length, res = [], cuenta = {}, i;
    for (i = 0; i < n; i++) res.push('no');
    for (i = 0; i < n; i++) { if (g.charAt(i) === t.charAt(i)) res[i] = 'ok'; else cuenta[t.charAt(i)] = (cuenta[t.charAt(i)] || 0) + 1; }
    for (i = 0; i < n; i++) { if (res[i] !== 'ok' && cuenta[g.charAt(i)] > 0) { res[i] = 'pos'; cuenta[g.charAt(i)]--; } }
    return res;
  }
  /** Puntos de un término: base + intentos sobrantes + rapidez − pistas. La rapidez premia resolverlo pronto
      respecto del ritmo elegido (los errores ya restan tiempo, así que también la reducen). */
  function desglose(ok, intentos, pistas, gastadoMs) {
    if (!ok) return { base: 0, intentos: 0, vel: 0, pistas: 0, total: 0 };
    var ref = ((CFG.ritmos[run && run.ritmo] || {}).seg || 0) * 1000;
    var vel = run && run.tiempo && ref > 0 ? Math.round(CFG.bonoVel * Math.min(1, Math.max(0, 1 - gastadoMs / ref))) : 0;
    var d = { base: CFG.base, intentos: (CFG.intentos - intentos) * CFG.porIntento, vel: vel, pistas: pistas * CFG.costoPista };
    d.total = Math.max(CFG.minimo, d.base + d.intentos + d.vel - d.pistas);
    return d;
  }

  /* ------------------------------------------------------------------ estado */

  /* ------------------------------------------------------------------ vida del juego: sonido, frases, escena, racha, compartir */
  function S() { return NP.sonido || { tecla: nada, borrar: nada, clic: nada, voltea: nada, parcial: nada, error: nada, acierto: nada, racha: nada, pista: nada, tic: nada, victoria: nada, derrota: nada, esta: function () { return false; }, alternar: nada }; }
  function nada() {}
  function nombreUsuario() {
    try { var u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'), x = String((u && (u.nombre || u.name || u.username)) || '').trim().split(/\s+/)[0];
      if (!x || /@/.test(x) || x.length > 14) return ''; return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); } catch (_) { return ''; }
  }
  var FRASES = {
    inicio: ['¡Vamos, {n}!', '¡Empecemos, {n}!', '¡A diagnosticar!', 'Concentrate, {n}.'],
    casi: ['¡Casi, {n}!', '¡Muy cerca!', '¡Ya la tenés!', '¡Uf, qué cerca!'],
    parcial: ['¡Bien ahí!', 'Algo sirve, {n}.', 'Buen rastro.', 'Vas por buen camino.'],
    ups: ['¡Ups!', 'Esa no era, {n}.', 'Probá otra pista.', 'Nada coincide.'],
    acierto: ['¡Diagnóstico!', '¡Genial, {n}!', '¡Eso es!', '¡Crack, {n}!'],
    pista: ['Te doy una letra…', 'Mirá el tablero, {n}.', 'Ojo con esta letra.'],
    apura: ['¡Se acaba el tiempo!', '¡Rápido, {n}!', '¡Dale, dale!'],
    racha: ['¡Racha de {k}!', '¡Imparable, {n}!', '¡{k} seguidos!'],
    tiempo: ['¡Se acabó el tiempo!', 'Se nos fue el reloj, {n}.'],
    rindio: ['Tranqui, seguimos.', 'Vamos por el siguiente.'],
    falla: ['¡Casi! La próxima sale.', 'Esta era difícil, {n}.'],
    finRecord: ['¡Nuevo récord, {n}!', '¡Sos una máquina, {n}!'],
    finBien: ['¡Excelente partida, {n}!', '¡Muy bien, {n}!'],
    finMal: ['¡Buen intento, {n}!', 'Con práctica sale. ¡Dale de nuevo!']
  };
  function frase(tipo, k) {
    var a = FRASES[tipo] || ['…'], f = a[Math.floor(Math.random() * a.length)], n = nombreUsuario();
    f = f.replace('{k}', k || '').replace(/, \{n\}|\{n\}, /g, n ? function (m) { return m.replace('{n}', n); } : '').replace('{n}', n);
    return f.replace(/\s+([!.¡?,])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  }
  /** Estado de la escena: 'err' (destello rojo), 'tension' (poco tiempo), 'gana' (destello dorado). */
  function escenaEstado(cls, ms) {
    var e = document.querySelector('.npg-nikaword .npg-escena'); if (!e) return;
    e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); if (ms) setTimeout(function () { e.classList.remove(cls); }, ms);
  }
  function contar(el, desde, hasta) {
    if (!el || C.reducido() || desde === hasta) { if (el) el.textContent = hasta; return; }
    var t0 = performance.now(), dur = 900; (function paso(now) { var k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(desde + (hasta - desde) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); })(t0);
  }
  function aviso(txt) {
    var p = C.pantalla(); if (!p) return; var o = document.createElement('div'); o.className = 'nw-toast'; o.setAttribute('role', 'status'); o.textContent = txt; p.appendChild(o); setTimeout(function () { o.remove(); }, 2600);
  }
  function enlaceReto(id) { return location.origin + location.pathname.replace(/[^/]*$/, '') + 'nikaplay.html?reto=' + (id || run.seed + '.' + run.n + '.' + run.ritmo); }
  function compartir(reto) {
    if (reto && NP.nube && !run.retoLink) {
      NP.nube.crearReto({ semilla: run.seed, n: run.n, ritmo: run.ritmo, puntos: run.total }).then(function (id) { run.retoLink = id; compartir(true); }).catch(function () { run.retoLink = null; run.retoSinNube = true; compartir(true); });
      if (!run.retoSinNube) return;
    }
    var txt = reto ? '¡Te desafío en NikaWord (NikaMed)! Con los mismos términos que yo: ' + run.n + ' términos. Hice ' + run.total + ' puntos, ¿me superás?' : 'Hice ' + run.total + ' puntos en NikaWord, el juego de términos médicos de NikaMed. ¿Me superás?';
    var url = reto ? enlaceReto(run.retoLink) : location.origin + location.pathname.replace(/[^/]*$/, '') + 'nikaplay.html';
    if (navigator.share) { navigator.share({ title: 'NikaWord · NikaMed', text: txt, url: url }).catch(function () {}); return; }
    var todo = txt + ' ' + url;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(todo).then(function () { aviso(reto ? '¡Enlace del desafío copiado!' : '¡Texto copiado!'); }, function () { aviso(url); }); else aviso(url);
  }

  function guardar() { if (run && !run.sala) C.escribir(RUN_KEY, run); }
  function crearRun(c) {
    var semilla = c.semilla != null ? c.semilla >>> 0 : (Math.random() * 4294967296) >>> 0, rnd = C.rng(semilla);
    var n = Math.max(1, Math.min(CFG.maxN, datos.terminos.length, c.n | 0));
    var ids = C.mezclar(datos.terminos, rnd).slice(0, n).map(function (t) { return t.id; });
    var tiempo = c.ritmo !== 'libre', pool = tiempo ? totalMs(n, c.ritmo) : 0;
    return { v: CFG.version, seed: semilla, ids: ids, n: n, ritmo: c.ritmo, tiempo: tiempo, pool: pool, restante: pool, t0: pool, idx: 0, intentos: [], escribiendo: termino(ids[0]).n.charAt(0), pistas: 0, errores: 0, resultados: [], total: 0, fase: 'inicio', pausa: false, agotado: false };
  }
  function runValido(r) {
    if (!r || r.v !== CFG.version || !r.ids || r.ids.length !== r.n || r.fase === 'fin') return false;
    for (var i = 0; i < r.ids.length; i++) if (!termino(r.ids[i])) return false;
    return typeof r.idx === 'number' && r.idx >= 0 && r.idx < r.n;
  }
  function hayPartida() { var r = C.leer(RUN_KEY, null); return !!(r && r.v === CFG.version && r.fase && r.fase !== 'fin' && r.fase !== 'inicio'); }
  function claveRecord(n, ritmo) { return 'nikaword_' + n + '_' + ritmo; }
  function record() {
    var p = C.leer(PREF_KEY, null); if (!p || p.ritmo === 'libre') return null;
    var st = C.stats(claveRecord(p.n, p.ritmo)); return st.mejor > 0 ? { mejor: st.mejor, n: p.n, ritmo: p.ritmo } : null;
  }

  /* ------------------------------------------------------------------ entrada pública */
  function empezar(nueva, reto) {
    var p = C.abrirPantalla('npg-nikaword', alCerrar);
    p.innerHTML = '<div class="npg-escena"><div class="npg-carga"><span class="npg-spin"></span><p>Preparando la guardia…</p></div></div>';
    cargar().then(function () {
      var pref = C.leer(PREF_KEY, null); if (pref && pref.n && CFG.ritmos[pref.ritmo]) cfg = { n: Math.min(CFG.maxN, pref.n), ritmo: pref.ritmo };
      var guardada = nueva ? null : C.leer(RUN_KEY, null);
      if (guardada && runValido(guardada)) {
        run = guardada;
        if (run.fase === 'transicion') { avanzarEstado(); run.pausa = run.fase === 'jugando'; } else if (run.fase === 'jugando') run.pausa = true;
      } else run = crearRun(reto ? { n: reto.n, ritmo: reto.ritmo, semilla: reto.semilla } : cfg);
      if (reto) { cfg = { n: run.n, ritmo: run.ritmo }; run.reto = true; run.retoId = reto.id || null; run.retoDe = reto.creador || ''; run.retoPts = reto.puntos || 0; }
      render();
    }).catch(function () {
      p.innerHTML = '<div class="npg-escena"><div class="npg-carga error"><strong>No pudimos cargar los términos.</strong><p>Revisá tu conexión e intentá de nuevo. No se perdió nada.</p><button type="button" class="npg-btn" data-reintentar>Reintentar</button><button type="button" class="npg-btn sec" data-x>Cerrar</button></div></div>';
    });
  }
  function alCerrar() { detener(); clearTimeout(flashTimer); ayudaAbierta = false; if (run && run.sala && run.fase !== 'fin' && NP.nube) { NP.nube.abandonar(run.sala).catch(function () {}); } if (run && run.fase === 'jugando' && !run.sala) { run.pausa = true; guardar(); } document.removeEventListener('keydown', teclado); }

  /* ------------------------------------------------------------------ reloj único */
  var ultSeg = -1;
  function detener() { if (reloj) { clearInterval(reloj); reloj = null; } }
  function arrancar() {
    detener(); if (!run.tiempo || run.restante <= 0) return;
    var fin = Date.now() + run.restante; ticks = 0;
    reloj = setInterval(function () {
      run.restante = Math.max(0, fin - Date.now()); pintarReloj();
      var seg = Math.ceil(run.restante / 1000); if (seg !== ultSeg) { ultSeg = seg; if (seg > 0 && seg <= 10) S().tic(true); else if (seg > 10 && seg <= 30) S().tic(false); }
      if (!run.avisoUrgente && run.restante > 0 && (run.restante <= 15000 || run.restante <= run.pool * 0.15)) { run.avisoUrgente = true; dec(frase('apura'), 'apura', 1600); escenaEstado('tension'); }
      if (++ticks % 4 === 0) guardar();
      if (run.restante <= 0 && !bloqueado) terminar(false, 'tiempo');
    }, 250);
  }
  function pintarReloj() {
    var p = C.pantalla(); if (!p) return;
    var rj = p.querySelector('.npg-reloj'); if (!rj) return;
    var frac = run.tiempo ? run.restante / run.pool : 1;
    var txt = rj.querySelector('.npg-rj-txt'), ani = rj.querySelector('.anillo'), ag = rj.querySelector('.aguja');
    if (txt) txt.textContent = run.tiempo ? C.mmss(run.restante) : 'Sin reloj';
    if (ani) ani.style.strokeDashoffset = String(100 - frac * 100);
    if (ag) ag.style.transform = 'rotate(' + ((1 - frac) * 360) + 'deg)';
    rj.classList.toggle('poco', run.tiempo && (frac <= 0.2 || run.restante <= 15000));
    rj.classList.toggle('sin', !run.tiempo);
  }
  /** Cada error resta tiempo del reloj único. */
  function penalizar() {
    if (!run.tiempo) return;
    run.restante = Math.max(0, run.restante - CFG.penalSeg * 1000);
    var p = C.pantalla(), rj = p && p.querySelector('.npg-reloj');
    if (rj) { var f = document.createElement('span'); f.className = 'npg-pen'; f.textContent = '−' + CFG.penalSeg + ' s'; rj.appendChild(f); setTimeout(function () { f.remove(); }, 1400); rj.classList.remove('golpe'); void rj.offsetWidth; rj.classList.add('golpe'); }
    pintarReloj(); arrancar();
  }

  /* ------------------------------------------------------------------ pintura */
  function encabezado(conAyuda) {
    var hechos = run.resultados.length, pct = Math.round(hechos / run.n * 100), n = run.n;
    return '<header class="npg-top"><button type="button" class="npg-hb salir" data-x aria-label="Salir (la partida queda guardada)">' + IC.salir + '<span>Salir</span></button>' +
      '<div class="npg-tit">' + logoHtml(true) + '<span>Término ' + Math.min(run.idx + 1, n) + ' de ' + n + '</span><div class="npg-prog barra" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + hechos + '"><i style="width:' + pct + '%"></i></div></div>' +
      (conAyuda ? '<span class="nw-hder"><button type="button" class="npg-hb nw-snd' + (S().esta() ? '' : ' off') + '" data-sonido aria-label="Sonido" aria-pressed="' + S().esta() + '">' + IC.sonido + '</button><button type="button" class="npg-hb" data-ayuda aria-label="Cómo se juega">' + IC.ayuda + '<span>Ayuda</span></button></span>' : '<span></span>') +
      '<div class="npg-pts" aria-live="polite"><small>Puntos</small><b>' + run.total + '</b>' + ((run.racha || 0) >= 2 ? '<span class="nw-racha" title="Racha de aciertos seguidos">' + IC.fuego + '×' + run.racha + '</span>' : '') + '</div></header>';
  }
  function encabezadoInicio() {
    return '<header class="npg-top nw-top-i"><button type="button" class="npg-hb salir" data-x aria-label="Volver"><span class="nw-nm">' + IC.salir + '</span><span>Volver</span></button><span class="nw-marca" aria-hidden="true"><img src="assets/N%20NIKA.png" alt=""><b>NikaMed</b></span><span></span><span></span></header>';
  }
  /** Escenario del consultorio: pared con zócalo, rayos de luz, rayos X, monitor con ECG (render 3D), estantería, piso con reflejo y partículas. tipo: 'inicio' | 'juego'. */
  function ambiente(tipo) {
    var D = NP.decor; if (!D) return '';
    var rutas = 'assets/nikaplay/props/', part = '';
    for (var i = 0; i < 16; i++) part += '<i style="--x:' + ((i * 37 + 11) % 100) + '%;--d:' + (6 + (i * 7) % 9) + 's;--r:' + ((i * 5) % 11) * -1 + 's;--s:' + (10 + (i * 3) % 12) + 'px" class="p' + (i % 3) + '"></i>';
    var props = tipo === 'juego' ?
      '<div class="a-rx"><img src="' + rutas + 'rayosx.webp" alt=""><i class="rx-luz"></i></div>' +
      '<div class="a-mon"><div class="mon-caja"><img src="' + rutas + 'monitor.webp" alt=""><i class="mon-pantalla"><b></b></i></div><div class="escritorio"><i class="e-tapa"></i><i class="e-cajon"><b></b><b></b></i><i class="e-pata"></i></div></div>' : '';
    return '<div class="dc-amb nw-amb nw-amb-' + tipo + '"><div class="nw-pared"></div><div class="nw-rayo r1"></div><div class="nw-rayo r2"></div>' +
      '<div class="a-lib">' + D.libreria({ filas: 4, ancho: 170, alto: 330, madera: '#3d6fb8', semilla: 5, paleta: ['#ef4444', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#fb923c', '#ffffff'] }) + '</div>' +
      (tipo === 'juego' ? '<div class="a-logo">' + logoHtml(false) + '</div>' : '') + props + '<div class="nw-piso"></div><div class="nw-part" aria-hidden="true">' + part + '</div></div>';
  }
  /** Escala continua: a partir de 1366×650 todo crece en proporción al tamaño de la ventana (zoom), hasta 3,2×. */
  function escalar() {
    var el = document.querySelector('.npg-nikaword'); if (!el) return 1;
    var z = Math.min(innerWidth / 1366, innerHeight / 650); z = innerWidth < 1181 || z < 1.06 ? 1 : Math.min(3.2, Math.round(z * 100) / 100);
    el.style.zoom = z === 1 ? '' : z; el.style.setProperty('--u', z === 1 ? '1dvh' : 'calc(1dvh / ' + z + ')'); return z;
  }
  /** Agranda el tablero hasta ocupar el alto libre de la pantalla (no hay scroll y no sobra espacio). */
  function ajustar() {
    var zz = escalar();
    var c = document.querySelector('.npg-nikaword .npg-centro2'), tb = c && c.querySelector('.npg-tablero'); if (!tb) return;
    var n = +tb.style.getPropertyValue('--n') || 6, tec = c.querySelector('.npg-teclado'), ley = c.querySelector('.npg-leyenda-j'), ban = c.querySelector('.npg-bandeja');
    var cuerpo = c.parentNode, lado = cuerpo.querySelector('.npg-lado'), apilado = lado && lado.getBoundingClientRect().bottom <= c.getBoundingClientRect().top + 2, alto = cuerpo.clientHeight - (apilado ? lado.offsetHeight + 8 : 0), otros = (tec ? tec.offsetHeight : 0) + (ley && ley.offsetHeight ? ley.offsetHeight + 8 : 0) + 16;
    var cromo = 10 + 2 * parseFloat(getComputedStyle(ban).paddingTop) + 2 * parseFloat(getComputedStyle(tb).paddingTop);
    var porAlto = (alto - otros - cromo - 5 * 5) / 6, porAncho = (c.clientWidth - 2 * 14 - 2 * 12 - 12 - (n - 1) * 5) / n;
    tb.style.setProperty('--t', Math.max(26, Math.min(80, Math.floor(Math.min(porAlto, porAncho)))) + 'px');
    var tc = c.querySelector('.npg-teclado'); ban.style.width = ''; if (tc) tc.style.width = ''; var w = Math.min(c.clientWidth, Math.max(ban.offsetWidth, 540)); ban.style.width = w + 'px'; if (tc) tc.style.width = w + 'px'; var cs = document.querySelector('.npg-nikaword .npg-consigna'); if (cs) { if (innerWidth >= 1181) { var pr = cs.parentNode.getBoundingClientRect(), cr = c.getBoundingClientRect(); cs.style.width = w + 'px'; cs.style.marginLeft = Math.max(0, (cr.left - pr.left) / zz + (c.clientWidth - w) / 2 - parseFloat(getComputedStyle(cs.parentNode).paddingLeft || 0)) + 'px'; cs.style.alignSelf = 'flex-start'; var dd = (ban.getBoundingClientRect().left - cs.getBoundingClientRect().left) / zz; if (Math.abs(dd) > .5) cs.style.marginLeft = (parseFloat(cs.style.marginLeft) + dd) + 'px'; } else { cs.style.width = ''; cs.style.marginLeft = ''; cs.style.alignSelf = ''; } } var cw = 2 * (parseFloat(getComputedStyle(ban).borderLeftWidth) + parseFloat(getComputedStyle(ban).paddingLeft)) + 2 * parseFloat(getComputedStyle(tb).paddingLeft); tb.style.setProperty('--tw', Math.max(parseFloat(tb.style.getPropertyValue('--t')), Math.min(Math.floor(parseFloat(tb.style.getPropertyValue('--t')) * 1.6), Math.floor((w - cw - (n - 1) * 5) / n))) + 'px');
  }

  var ajustarOn = false;
  function render() {
    var p = C.pantalla(); if (!p) return;
    detener(); document.removeEventListener('keydown', teclado); ayudaAbierta = false; clearTimeout(flashTimer);
    if (run.fase === 'transicion') avanzarEstado();
    if (run.fase === 'cuenta') return vistaCuenta(p);
    if (run.fase === 'fin' && run.sala) { if (NP.social) NP.social.volverASala(); return; }
    if (run.fase === 'inicio' || run.pausa) return vistaInicio(p);
    if (run.fase === 'jugando') return vistaJuego(p);
    if (run.fase === 'fin') return vistaFin(p);
  }

  function configHtml() {
    var r = CFG.ritmos;
    return '<aside class="nw-panel nw-config ngc" aria-label="Armá tu partida"><h2 class="nw-tab">' + IC2.engr + 'Armá tu partida</h2>' +
      '<div class="nw-caja"><span class="ngc-et">Cantidad de términos</span><div class="ngc-chips" role="group">' + CFG.presets.map(function (n) { return '<button type="button" class="ngc-chip" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
      '<div class="ngc-step"><button type="button" data-nmenos aria-label="Menos términos">−</button><input id="ngc-n" type="number" inputmode="numeric" min="1" max="' + CFG.maxN + '" value="' + cfg.n + '" aria-label="Cantidad de términos"><button type="button" data-nmas aria-label="Más términos">+</button></div></div>' +
      '<div class="nw-caja"><span class="ngc-et">' + IC2.cron + 'Ritmo</span><div class="nw-ritmos" role="group">' +
      '<button type="button" class="nw-ritmo" data-ritmo="justo"><i>' + IC2.cron + '</i><b>Justo</b><small>' + r.justo.det + '</small></button>' +
      '<button type="button" class="nw-ritmo" data-ritmo="intenso"><i>' + IC2.rayo + '</i><b>Intenso</b><small>' + r.intenso.det + '</small></button>' +
      '<button type="button" class="nw-ritmo" data-ritmo="libre"><i>' + IC2.libre + '</i><b>Práctica</b><small>sin reloj</small></button></div></div>' +
      '<p class="ngc-res nw-res" aria-live="polite"></p>' +
      '<div class="nw-acc"><button type="button" class="nw-comenzar" data-ir><i>' + IC2.play + '</i>¡Comenzar!</button><button type="button" class="nw-volver" data-x><i>' + IC.salir + '</i>Volver</button></div>' +
      (datos.estado === 'borrador' ? '<p class="nw-borr">Los términos están en revisión: puede haber imprecisiones.</p>' : '') + '</aside>';
  }
  function comoHtml() {
    var ej = [['S', 'ok'], ['E', 'ok'], ['R', 'no'], ['O', 'no'], ['S', 'pos'], ['A', 'no']];
    return '<section class="nw-panel nw-como" aria-label="Cómo se juega"><h2 class="nw-tab">Cómo se juega</h2><div class="nw-bloques">' +
      '<article class="nw-bloque b1"><header><span class="n">1</span><h3>Escribí un término</h3></header><p>Tiene entre <b>6 y 9 letras</b>. Usá el teclado y tocá <b>ENVIAR</b>. Tenés <b>' + CFG.intentos + ' intentos</b>. Los acentos no importan.</p>' +
      '<div class="nw-tip">' + IC2.bombilla + '<span>Siempre ves gratis la definición, la materia y la primera letra.</span></div>' +
      '<div class="nw-mini"><span class="nw-letraA">A</span><ul><li>' + IC2.libro + 'Materia</li><li>' + IC2.doc + 'Definición</li><li><i>A</i>Primera letra</li></ul></div></article>' +
      '<article class="nw-bloque b2"><header><span class="n">2</span><h3>Mirá los colores</h3></header><p>Cada letra te dice qué tan cerca estás. Ejemplo: el término es SEPSIS y escribiste SEROSA.</p>' +
      '<div class="ngd-ej nw-ej" aria-label="Ejemplo: SEROSA contra SEPSIS">' + ej.map(function (x, i) { return '<span class="f ' + x[1] + '" style="--i:' + i + '">' + x[0] + '</span>'; }).join('') + '</div>' +
      '<ul class="nw-leyenda"><li><i class="f ok">✓</i><span><b>Verde:</b> la letra está en su lugar</span></li><li><i class="f pos">●</i><span><b>Ámbar:</b> está, pero en otro lugar</span></li><li><i class="f no">·</i><span><b>Gris:</b> no está en el término</span></li></ul></article>' +
      '<article class="nw-bloque b3"><header><span class="n">3</span><h3>Cuidá el reloj</h3></header><p>Hay <b>un solo reloj para toda la partida</b>: cuanto más rápido resolvés un término, más puntos (hasta <b>+' + CFG.bonoVel + '</b>). Cada <b>error te resta ' + CFG.penalSeg + ' segundos</b>; si llega a cero, la partida termina.</p>' +
      '<div class="nw-steto">' + IC.steto + '<span class="nw-letraA sm">A</span><p>El estetoscopio revela una letra (hasta 2 veces) y resta ' + CFG.costoPista + ' puntos.</p></div></article></div>' +
      '<div class="nw-pie"><span>Vos elegís cuántos términos jugar</span><span>Rápido = más puntos</span><span>Cada error: −' + CFG.penalSeg + ' s</span><span>Puntos solo de juego</span></div></section>';
  }

  function pintarConfig() {
    var p = C.pantalla(); if (!p) return;
    p.querySelectorAll('[data-n]').forEach(function (b) { b.classList.toggle('on', +b.dataset.n === cfg.n); });
    p.querySelectorAll('[data-ritmo]').forEach(function (b) { b.classList.toggle('on', b.dataset.ritmo === cfg.ritmo); b.setAttribute('aria-pressed', b.dataset.ritmo === cfg.ritmo); });
    var inp = p.querySelector('#ngc-n'); if (inp && document.activeElement !== inp) inp.value = cfg.n;
    var res = p.querySelector('.ngc-res'); if (!res) return;
    res.innerHTML = cfg.ritmo === 'libre' ? '<b>' + cfg.n + ' términos</b> · sin reloj · los errores se cuentan pero no restan tiempo · la práctica no suma al récord'
      : '<b>' + cfg.n + ' términos</b> · reloj de <b>' + C.mmss(totalMs(cfg.n, cfg.ritmo)) + '</b> para toda la partida · cada error resta <b>' + CFG.penalSeg + ' s</b>';
  }
  function cambiarConfig(n, ritmo) {
    if (n != null) cfg.n = Math.max(1, Math.min(CFG.maxN, datos.terminos.length, n | 0));
    if (ritmo) cfg.ritmo = ritmo;
    run = crearRun(cfg); pintarConfig();
  }

  function vistaInicio(p) {
    var enPausa = run.pausa;
    p.innerHTML = '<div class="npg-escena nw-escena">' + ambiente('inicio') + encabezadoInicio() + '<main class="npg-centro nw-inicio">' + (enPausa ?
      '<div class="nw-cols nw-pausa"><div class="nw-docol">' + DOCTOR({ lado: 'der', clase: 'dr-grande' }) + '</div><section class="nw-panel nw-ficha-p" aria-labelledby="npg-ft"><h2 class="nw-tab" id="npg-ft">Partida en pausa</h2>' +
      '<p class="npg-sub">Término ' + (run.idx + 1) + ' de ' + run.n + ' · ' + run.total + ' puntos · ' + run.errores + (run.errores === 1 ? ' error' : ' errores') + '.' + (run.tiempo ? ' Te quedan ' + C.mmss(run.restante) + '.' : '') + '</p>' +
      '<div class="nw-acc"><button type="button" class="nw-comenzar" data-ir><i>' + IC2.play + '</i>Continuar</button><button type="button" class="nw-volver" data-nueva><i>' + IC2.engr + '</i>Partida nueva</button></div></section></div>' :
      '<div class="nw-cab">' + logoHtml(false) + '<p class="nw-sub">Descubrí el término médico escondido</p><div class="nw-nota">' + (run.retoDe ? esc(run.retoDe) + ' te desafía: ¡superá sus ' + run.retoPts + ' puntos con los mismos términos!' : '¡Poné a prueba tus conocimientos y ganá puntos!') + '</div></div>' +
      '<div class="nw-cols"><div class="nw-docol">' + DOCTOR({ lado: 'der', clase: 'dr-grande' }) + '</div>' + comoHtml() + configHtml() + '</div>') + '</main></div>';
    if (!enPausa) pintarConfig();
    dec(enPausa ? '¡Bienvenido de vuelta! Seguimos.' : '¡Vamos a jugar!', enPausa ? 'hola' : 'hola', 0);
  }

  function vistaJuego(p) {
    var t = actual(), n = t.n.length;
    p.innerHTML = '<div class="npg-escena nw-escena">' + ambiente('juego') + encabezado(true) + '<main class="npg-mesa nw-juego">' +
      '<div class="npg-consigna nw-panel"><span class="nw-tab sm">Definición</span><b class="npg-def-j">«' + esc(t.d) + '»</b><div class="npg-gratis"><span>Materia: <b>' + esc(t.m) + '</b></span><span class="nw-empieza">Empieza con <b>' + esc(t.n.charAt(0)) + '</b></span><span class="npg-quedan"></span></div><span class="npg-ptit">Adiviná el término médico de <em>' + n + ' letras</em></span></div>' +
      '<div class="npg-cuerpo"><div class="npg-lado"><div class="npg-reloj" title="Reloj de toda la partida">' + IC.reloj + '<span class="npg-rj-txt"></span></div>' +
      '<div class="npg-errores"><span>Errores</span><b>0</b></div>' +
      '<div class="npg-pistas"><button type="button" class="npg-pista-btn" data-pista aria-label="Pedir pista">' + IC.steto + '<span>Pedir pista <i>−' + CFG.costoPista + '</i></span></button><div class="npg-pista-ch" aria-live="polite"></div></div>' +
      '<button type="button" class="npg-rendir" data-rendir>Rendirme' + (run.tiempo ? ' (−' + CFG.penalSeg + ' s)' : '') + '</button></div>' +
      (run.sala && NP.social ? '<div class="ns-reac ns-reac-juego" aria-label="Reacciones">' + NP.social.emojis.map(function (e) { return '<button type="button" data-ns-emoji="' + e + '" aria-label="Reaccionar ' + e + '">' + e + '</button>'; }).join('') + '</div>' : '') + '<div class="npg-centro2"><div class="npg-bandeja"><div class="npg-tablero" style="--n:' + n + '" role="grid" aria-label="Tablero de ' + n + ' letras"></div></div>' +
      '<ul class="npg-leyenda-j" aria-label="Referencia de colores"><li><i class="ok">✓</i>En su lugar</li><li><i class="pos">●</i>Otro lugar</li><li><i class="no">·</i>No está</li></ul>' +
      '<div class="npg-teclado" aria-label="Teclado"></div></div></div></main>' + DOCTOR({ lado: 'der', clase: 'dr-oculto-chico' }) + '</div>';
    pintarTablero(-1); pintarTeclado(); pintarPistas(); pintarReloj(); pintarQuedan(); pintarErrores(); ajustar(); requestAnimationFrame(ajustar); if (!ajustarOn) { ajustarOn = true; window.addEventListener('resize', ajustar); }
    document.addEventListener('keydown', teclado);
    if (run.idx === 0 && run.intentos.length === 0) dec(frase('inicio'), 'hola', 1500); else dec('Pensá en la materia…', 'piensa', 1500);
    if (!ayudaAbierta) arrancar();
  }
  function pintarQuedan() {
    var p = C.pantalla(), q = p && p.querySelector('.npg-quedan'); if (!q) return;
    var r = CFG.intentos - run.intentos.length;
    q.innerHTML = r === 1 ? 'Último intento' : 'Intentos: <b>' + r + '</b>';
  }
  function pintarErrores() {
    var p = C.pantalla(), e = p && p.querySelector('.npg-errores b'); if (!e) return;
    e.textContent = run.errores;
  }

  function filaHtml(r, t, anim) {
    var n = t.n.length, html = '', g = run.intentos[r], res = g ? evaluar(g, t.n) : null, i, letra, cls, fan = fantasmas(t);
    for (i = 0; i < n; i++) {
      if (g) { letra = g.charAt(i); cls = 'npg-f ' + res[i] + (anim === r ? ' rev' : ''); }
      else if (r === run.intentos.length) { letra = run.escribiendo.charAt(i); cls = 'npg-f' + (letra ? ' lleno' : ''); if (!letra && fan[i]) { letra = fan[i]; cls = 'npg-f fantasma'; } }
      else { letra = ''; cls = 'npg-f'; }
      html += '<div class="' + cls + '" style="--i:' + i + '" role="gridcell" aria-label="' + (letra ? (cls.indexOf('fantasma') > -1 ? 'pista: ' : '') + letra + (res ? ', ' + (res[i] === 'ok' ? 'correcta' : res[i] === 'pos' ? 'en otra posición' : 'no está') : '') : 'vacía') + '"><span>' + esc(letra) + '</span></div>';
    }
    return '<div class="npg-fila" role="row">' + html + '</div>';
  }
  function pintarTablero(anim) {
    var p = C.pantalla(), tb = p && p.querySelector('.npg-tablero'); if (!tb) return;
    var t = actual(), h = '';
    for (var r = 0; r < CFG.intentos; r++) h += filaHtml(r, t, anim);
    tb.innerHTML = h;
  }
  function pintarTeclado() {
    var p = C.pantalla(), kb = p && p.querySelector('.npg-teclado'); if (!kb) return;
    var t = actual(), mejor = {}, orden = { no: 1, pos: 2, ok: 3 };
    run.intentos.forEach(function (g) { var res = evaluar(g, t.n); for (var i = 0; i < g.length; i++) { var l = g.charAt(i); if (!mejor[l] || orden[res[i]] > orden[mejor[l]]) mejor[l] = res[i]; } });
    kb.innerHTML = FILAS.map(function (f, i) {
      var k = f.split('').map(function (l) { return '<button type="button" class="npg-k ' + (mejor[l] || '') + '" data-k="' + l + '">' + l + '</button>'; }).join('');
      if (i === 2) k = '<button type="button" class="npg-k ancha enviar" data-k="ENTER"><i class="av">' + IC2.avion + '</i>ENVIAR</button>' + k + '<button type="button" class="npg-k ancha borrar" data-k="BORRAR" aria-label="Borrar">' + IC.back + '</button>';
      return '<div class="npg-krow">' + k + '</div>';
    }).join('');
  }
  function pintarPistas() {
    var p = C.pantalla(); if (!p) return;
    var t = actual(), ch = p.querySelector('.npg-pista-ch'), b = p.querySelector('[data-pista]'); if (!ch) return;
    var ps = posPistas(t), h = '';
    for (var i = 0; i < run.pistas; i++) h += '<span class="npg-chip"><b>Letra ' + (ps[i] + 1) + '</b> ' + esc(t.n.charAt(ps[i])) + '</span>';
    ch.innerHTML = h; if (b) b.disabled = run.pistas >= 2;
    pintarTablero(-1);
  }
  function msg(txt) {
    var p = C.pantalla(), q = p && p.querySelector('.npg-quedan'); if (!q) return;
    if (txt) { q.innerHTML = '<b class="err">' + esc(txt) + '</b>'; q.classList.remove('on'); void q.offsetWidth; q.classList.add('on'); }
    else { q.classList.remove('on'); pintarQuedan(); }
  }

  /* ------------------------------------------------------------------ entrada de letras */
  function teclear(k) {
    if (run.fase !== 'jugando' || bloqueado || ayudaAbierta) return;
    var t = actual(), n = t.n.length;
    if (k === 'BORRAR') { if (run.escribiendo.length > 1) { run.escribiendo = run.escribiendo.slice(0, -1); S().borrar(); } msg(''); return pintarTablero(-1); }
    if (k === 'ENTER') return enviar();
    if (/^[A-Z]$/.test(k) && run.escribiendo.length < n) { run.escribiendo += k; S().tecla(); msg(''); pintarTablero(-1); var tiles = C.pantalla().querySelectorAll('.npg-fila')[run.intentos.length].children; if (tiles[run.escribiendo.length - 1]) tiles[run.escribiendo.length - 1].classList.add('pop'); }
  }
  function enviar() {
    var t = actual(), n = t.n.length;
    if (run.escribiendo.length < n) { msg('Faltan letras: el término tiene ' + n + '.'); var f = C.pantalla().querySelectorAll('.npg-fila')[run.intentos.length]; if (f) { f.classList.remove('sacude'); void f.offsetWidth; f.classList.add('sacude'); } return; }
    var g = run.escribiendo, fila = run.intentos.length;
    run.intentos.push(g); run.escribiendo = t.n.charAt(0); guardar(); msg('');
    var espera = C.reducido() ? 80 : n * 260 + 520; bloqueado = true;
    pintarTablero(fila);
    (function () { var rv = evaluar(g, t.n); rv.forEach(function (x, i) { setTimeout(function () { S().voltea(i, x); }, C.reducido() ? 0 : i * 260 + 260); }); })();
    setTimeout(function () {
      bloqueado = false; if (!C.pantalla() || run.fase !== 'jugando') return;
      pintarTeclado();
      if (g === t.n) { terminar(true); return; }
      run.errores++; penalizar(); pintarErrores(); guardar(); escenaEstado('err', 700);
      (function () { var rr = evaluar(g, t.n), oks = rr.filter(function (x) { return x === 'ok'; }).length, poss = rr.filter(function (x) { return x === 'pos'; }).length;
        if (oks >= Math.ceil(n / 2)) { dec(frase('casi'), 'ok', 1500); S().parcial(); } else if (oks + poss > 0) { dec(frase('parcial'), 'ok', 1500); S().parcial(); } else { dec(frase('ups') + ' (−' + CFG.penalSeg + ' s)', 'ups', 1600); S().error(); } })();
      if (run.tiempo && run.restante <= 0) terminar(false, 'tiempo');
      else if (run.intentos.length >= CFG.intentos) terminar(false, 'intentos');
      else pintarQuedan();
    }, espera);
  }
  function teclado(e) {
    var pt = C.pantalla(); if (!pt || !pt.classList.contains('npg-nikaword') || !run || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { C.cerrarPantalla(); return; }
    if (run.fase === 'transicion') { e.preventDefault(); avanzar(); return; }
    if (run.fase !== 'jugando' || ayudaAbierta) return;
    if (e.key === 'Enter') { e.preventDefault(); teclear('ENTER'); } else if (e.key === 'Backspace') { e.preventDefault(); teclear('BORRAR'); }
    else { var l = C.norm(e.key); if (l.length === 1 && e.key.length <= 2) teclear(l); }
  }

  /* ------------------------------------------------------------------ ayuda y rendirse */
  function ayuda() {
    var p = C.pantalla(); if (!p || ayudaAbierta) return;
    ayudaAbierta = true; detener();
    var o = document.createElement('div'); o.className = 'npg-ayuda'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Cómo se juega');
    o.innerHTML = '<div class="ngd-wrap">' + guia() + (run.tiempo ? '<p class="npg-sub" style="text-align:center">El reloj está en pausa mientras leés.</p>' : '') + '<div class="npg-acc"><button type="button" class="npg-btn" data-cerrar-ayuda>¡Entendido, a jugar!</button></div></div>';
    p.appendChild(o);
  }
  function cerrarAyuda() {
    var p = C.pantalla(), o = p && p.querySelector('.npg-ayuda'); if (o) o.remove();
    ayudaAbierta = false; if (run && run.fase === 'jugando') arrancar();
  }
  function rendirse(btn) {
    if (!rindeLista) { rindeLista = true; btn.textContent = '¿Seguro? Tocá de nuevo'; btn.classList.add('seguro'); setTimeout(function () { rindeLista = false; if (btn.isConnected) { btn.textContent = 'Rendirme' + (run.tiempo ? ' (−' + CFG.penalSeg + ' s)' : ''); btn.classList.remove('seguro'); } }, 3000); return; }
    rindeLista = false; run.errores++; penalizar(); pintarErrores();
    terminar(false, run.tiempo && run.restante <= 0 ? 'tiempo' : 'rindio');
  }

  /* ------------------------------------------------------------------ fin de término / partida */
  function terminar(ok, motivo) {
    if (run.fase !== 'jugando') return;
    detener(); bloqueado = false;
    var d = desglose(ok, run.intentos.length, run.pistas, (run.t0 || 0) - run.restante);
    var r = { id: run.ids[run.idx], ok: ok, motivo: motivo || 'acierto', intentos: run.intentos.length, pistas: run.pistas, pts: d.total, d: d };
    if (ok) { run.racha = (run.racha || 0) + 1; if (run.racha >= 2) { r.extra = Math.min(40, (run.racha - 1) * 10); r.pts += r.extra; d.total += r.extra; } } else run.racha = 0;
    run.resultados.push(r); run.total += d.total; run.fase = 'transicion'; run.pausa = false;
    if (motivo === 'tiempo') run.agotado = true;
    guardar(); mostrarFlash(r);
  }
  function sello(r) { return r.ok ? ['¡ALTA!', 'ok'] : r.motivo === 'rindio' ? ['TE RENDISTE', 'no'] : r.motivo === 'tiempo' ? ['SE ACABÓ EL TIEMPO', 'tiempo'] : ['EN OBSERVACIÓN', 'no']; }
  /** Cartel corto sobre el tablero; después pasa solo al siguiente término (o al resultado final). */
  function mostrarFlash(r) {
    var p = C.pantalla(); if (!p) return;
    var t = termino(r.id), s = sello(r), ultima = run.agotado || run.idx + 1 >= run.n;
    var top = p.querySelector('.npg-top'); if (top) top.outerHTML = encabezado(true); contar(p.querySelector('.npg-pts b'), run.total - r.pts, run.total);
    var o = document.createElement('div'); o.className = 'npg-flash nw-flash'; o.setAttribute('role', 'status');
    o.innerHTML = '<div class="nw-flash-wrap">' + DOCTOR({ lado: 'der', clase: 'dr-oculto-chico dr-flash' }) + '<div class="npg-flash-c nw-panel ' + s[1] + '"><div class="npg-sello grande ' + s[1] + '" aria-hidden="true">' + s[0] + '</div><span class="npg-etq">' + esc(t.m) + '</span><b class="npg-flash-t">' + esc(t.t) + '</b><p>' + esc(t.d) + '</p>' +
      '<div class="npg-flash-p">' + (r.ok ? '+' + r.pts + ' puntos' : 'Sin puntos esta vez') + '</div>' + (r.ok && r.d.vel ? '<small class="npg-vel">incluye +' + r.d.vel + ' por rapidez</small>' : '') + (r.extra ? '<small class="npg-vel racha">' + IC.fuego + 'Racha ×' + run.racha + ': +' + r.extra + '</small>' : '') + '<button type="button" class="npg-btn" data-saltar>' + (ultima ? 'Ver resultado' : 'Siguiente') + ' <span aria-hidden="true">→</span></button></div></div>';
    p.appendChild(o);
    if (r.ok) { dec(r.extra ? frase('racha', run.racha) : frase('acierto'), 'victoria', 0); S().acierto(); if (r.extra) setTimeout(function () { S().racha(run.racha); }, 420); escenaEstado('gana', 1400); if (NP.doctor) NP.doctor.confeti(o, 42 + (r.extra ? 24 : 0)); }
    else if (r.motivo === 'tiempo') { dec(frase('tiempo'), 'derrota', 0); S().derrota(); }
    else { dec(r.motivo === 'rindio' ? frase('rindio') : frase('falla'), 'derrota', 0); S().error(); }
    clearTimeout(flashTimer); flashTimer = setTimeout(avanzar, C.reducido() ? 2600 : (r.ok ? 2300 : 3000));
  }
  function avanzarEstado() {
    if (run.agotado || run.idx + 1 >= run.n) { finalizar(); return; }
    run.idx++; run.intentos = []; run.escribiendo = actual().n.charAt(0); run.pistas = 0; run.t0 = run.restante; run.fase = 'jugando'; run.pausa = false; guardar();
  }
  function finalizar() {
    var res = run.resultados, ok = res.filter(function (r) { return r.ok; }).length;
    run.bono = run.tiempo && !run.agotado ? Math.floor(run.restante / 1000 / CFG.segPorPunto) : 0;
    run.total += run.bono;
    run.record = run.tiempo ? C.guardarResultado(claveRecord(run.n, run.ritmo), { puntos: run.total, resueltos: ok, terminos: res.length }) : { practica: true, mejor: 0, esRecord: false };
    if (run.tiempo) C.escribir(PREF_KEY, { n: run.n, ritmo: run.ritmo }); else C.escribir(PREF_KEY, { n: run.n, ritmo: 'libre' });
    run.fase = 'fin'; C.borrar(RUN_KEY);
    var usado = run.tiempo ? run.pool - run.restante : 0;
    if (run.sala) { if (NP.social) NP.social.enviarResultadoSala({ puntos: run.total, aciertos: ok, errores: run.errores, tiempo_ms: usado }); }
    else if (NP.nube) {
      NP.nube.guardarPartida({ juego: 'nikaword', n: run.n, ritmo: run.ritmo, puntos: run.total, aciertos: ok, errores: run.errores, tiempo_ms: usado, semilla: run.seed, reto: run.retoId || null })
        .then(function (r) { run.nube = r; pintarXp(); }).catch(function (e) { run.nubeError = e.message; pintarXp(); });
    }
  }
  function pintarXp() {
    var el = document.querySelector('.npg-nikaword .nw-xp'); if (!el || !run) return;
    if (run.nube) el.innerHTML = '<b>+' + run.nube.xp_ganada + ' XP</b> · Nivel ' + run.nube.nivel + (run.nube.es_record ? ' · ★ récord' : '');
    else if (run.nubeError) el.textContent = 'Partida no guardada en tu progreso: ' + run.nubeError;
  }
  /** Cuenta regresiva común de las salas: todos arrancan en el mismo instante (inicio de la sala). */
  function vistaCuenta(p) {
    p.innerHTML = '<div class="npg-escena nw-escena">' + ambiente('inicio') + encabezadoInicio() + '<main class="npg-centro nw-inicio"><div class="nw-cuenta"><small>Empieza en</small><b id="nw-cuenta-n">…</b><span>Sala multijugador · ' + run.n + ' términos</span></div></main>' + DOCTOR({ lado: 'der', clase: 'dr-oculto-chico' }) + '</div>';
    dec('¡Atentos, ya arrancamos!', 'hola', 0);
    var paso = function () {
      var s = Math.ceil((run.inicioMs - Date.now()) / 1000), el = document.getElementById('nw-cuenta-n'); if (!el) { clearInterval(iv); return; }
      if (s <= 0) { clearInterval(iv); run.fase = 'jugando'; run.restante = run.pool; run.t0 = run.pool; render(); return; }
      if (String(s) !== el.textContent) { el.textContent = s; S().tic(true); el.classList.remove('pum'); void el.offsetWidth; el.classList.add('pum'); }
    }, iv = setInterval(paso, 200); paso();
  }
  /** Partida multijugador: los términos salen de la semilla de la sala. */
  function empezarSala(o) {
    var p = C.abrirPantalla('npg-nikaword', alCerrar);
    p.innerHTML = '<div class="npg-escena"><div class="npg-carga"><span class="npg-spin"></span><p>Preparando la sala…</p></div></div>';
    cargar().then(function () {
      run = crearRun({ n: o.n, ritmo: o.ritmo, semilla: o.semilla }); run.sala = o.salaId; run.fase = 'cuenta'; run.inicioMs = new Date(o.inicio).getTime(); render();
    }).catch(function () { C.cerrarPantalla(true); if (window.showToast) window.showToast('No pudimos cargar la partida.'); });
  }
  function avanzar() {
    clearTimeout(flashTimer); flashTimer = null;
    var p = C.pantalla(); if (!p || run.fase !== 'transicion') return;
    avanzarEstado(); render();
  }

  function vistaFin(p) {
    var res = run.resultados, rec = run.record || {}, ok = res.filter(function (r) { return r.ok; }).length, usado = run.tiempo ? run.pool - run.restante : 0, bien = ok >= Math.ceil(res.length / 2);
    var etiqueta = run.agotado ? 'Se acabó el tiempo' : 'Parte médico final';
    p.innerHTML = '<div class="npg-escena nw-escena">' + ambiente('inicio') + encabezado(false) + '<main class="npg-centro nw-inicio"><div class="nw-cols nw-fin"><div class="nw-docol">' + DOCTOR({ lado: 'der', clase: 'dr-grande' }) + '</div><section class="nw-panel npg-ficha fin" aria-labelledby="npg-fn"><h2 class="nw-tab">' + etiqueta + '</h2>' +
      '<h2 id="npg-fn" class="nw-puntos">' + run.total + ' puntos</h2>' + '<div class="nw-xp" aria-live="polite"></div>' + (rec.esRecord ? '<div class="npg-record">★ ¡Nuevo récord personal!</div>' : rec.practica ? '<p class="npg-sub">Modo práctica: no suma al récord.</p>' : '<p class="npg-sub">Tu mejor marca con esta configuración: ' + rec.mejor + ' puntos.</p>') +
      '<div class="npg-resumen"><div><b>' + ok + '/' + run.n + '</b><small>Aciertos</small></div><div><b>' + run.errores + '</b><small>Errores</small></div>' +
      (run.tiempo ? '<div><b>' + C.mmss(usado) + '</b><small>Tiempo usado</small></div><div><b>+' + (run.bono || 0) + '</b><small>Bono de tiempo</small></div>' : '<div><b>' + res.length + '</b><small>Jugados</small></div>') + '</div>' +
      (run.agotado ? '<p class="npg-sub">El reloj llegó a cero en el término ' + res.length + ' de ' + run.n + '.</p>' : '') +
      '<ul class="npg-lista">' + res.map(function (r) { var t = termino(r.id); return '<li class="' + (r.ok ? 'ok' : 'no') + '"><span class="mk" aria-hidden="true">' + (r.ok ? '✓' : '✗') + '</span><span class="tt">' + esc(t.t) + '<small>' + esc(t.d) + '</small></span><b>' + r.pts + '</b></li>'; }).join('') + '</ul>' +
      '<div class="nw-acc fin"><button type="button" class="nw-comenzar" data-otra><i>' + IC2.play + '</i>Jugar de nuevo</button><div class="nw-soc"><button type="button" class="nw-volver" data-desafiar><i>' + IC.reto + '</i>Desafiar a un amigo</button><button type="button" class="nw-volver" data-compartir><i>' + IC.compartir + '</i>Compartir</button></div><button type="button" class="nw-volver" data-x><i>' + IC.salir + '</i>Volver a NikaPlay</button></div>' +
      '<p class="npg-borr">Puntos solo de juego: no cuentan en tus notas ni en tu rendimiento académico.</p></section></div></main></div>';
    pintarXp();
    var msg = frase(rec.esRecord ? 'finRecord' : bien ? 'finBien' : 'finMal'); if (bien) { S().victoria(); escenaEstado('gana', 2400); } else S().derrota();
    dec(msg, bien ? 'victoria' : 'derrota', 0); if (bien && NP.doctor) NP.doctor.confeti(p.querySelector('.npg-escena'), rec.esRecord ? 60 : 34);
    document.dispatchEvent(new CustomEvent('nikaplay:resultado', { detail: { juego: 'nikaword', puntos: run.total } }));
  }

  /* ------------------------------------------------------------------ clicks */
  document.addEventListener('click', function (e) {
    var p = C.pantalla(); if (!p || !p.classList.contains('npg-nikaword') || !run || !p.contains(e.target)) return;
    if (run && run.fase === 'transicion' && e.target.closest('.npg-flash')) return avanzar();
    var b = e.target.closest('button,[data-k]'); if (!b) return;
    if (b.hasAttribute('data-sonido')) { var on = S().alternar(); b.classList.toggle('off', !on); b.setAttribute('aria-pressed', on); return; }
    if (b.hasAttribute('data-compartir')) return compartir(false);
    if (b.hasAttribute('data-desafiar')) return compartir(true);
    if (b.hasAttribute('data-x')) return C.cerrarPantalla();
    if (b.hasAttribute('data-reintentar')) return empezar(false);
    if (b.dataset.k) return teclear(b.dataset.k);
    if (b.dataset.n) return cambiarConfig(+b.dataset.n);
    if (b.hasAttribute('data-nmas')) return cambiarConfig(cfg.n + 1);
    if (b.hasAttribute('data-nmenos')) return cambiarConfig(cfg.n - 1);
    if (b.dataset.ritmo) return cambiarConfig(null, b.dataset.ritmo);
    if (b.hasAttribute('data-ir')) {
      if (run.fase === 'inicio') { C.escribir(PREF_KEY, { n: run.n, ritmo: run.ritmo }); run.restante = run.pool; run.t0 = run.pool; }
      run.fase = 'jugando'; run.pausa = false; guardar(); return render();
    }
    if (b.hasAttribute('data-nueva')) { C.borrar(RUN_KEY); run = crearRun(cfg); return render(); }
    if (b.hasAttribute('data-pista')) { if (run.fase === 'jugando' && run.pistas < 2) { run.pistas++; guardar(); pintarPistas(); dec(frase('pista'), 'pista', 1600); S().pista(); } return; }
    if (b.hasAttribute('data-ayuda')) return ayuda();
    if (b.hasAttribute('data-cerrar-ayuda')) return cerrarAyuda();
    if (b.hasAttribute('data-rendir')) return rendirse(b);
    if (b.hasAttribute('data-saltar')) return avanzar();
    if (b.hasAttribute('data-otra')) { run = crearRun(cfg); return render(); }
  });
  document.addEventListener('input', function (e) {
    var p = C.pantalla(); if (!p || !p.classList.contains('npg-nikaword') || !run || !e.target || e.target.id !== 'ngc-n') return;
    var v = parseInt(e.target.value, 10); if (v >= 1) cambiarConfig(v);
  });

  function iniciarReto() {
    var u = /[?&]reto=([0-9a-f]{8}-[0-9a-f-]{27})/i.exec(location.search);
    if (u && NP.nube) { NP.nube.verReto(u[1]).then(function (r) { if (!r || !CFG.ritmos[r.ritmo]) { if (window.showToast) window.showToast('El desafío ya no está disponible.'); return; }
      empezar(true, { semilla: +r.semilla, n: Math.min(CFG.maxN, +r.n), ritmo: r.ritmo, id: r.reto_id, creador: r.creador, puntos: r.mejor_puntaje }); history.replaceState(null, '', location.pathname); }).catch(function (e) { if (window.showToast) window.showToast(e.message); }); return; }
    var m = /[?&]reto=(\d+)\.(\d+)\.(\w+)/.exec(location.search); if (!m) return;
    setTimeout(function () { if (CFG.ritmos[m[3]]) { empezar(true, { semilla: +m[1], n: Math.min(CFG.maxN, +m[2]), ritmo: m[3] }); history.replaceState(null, '', location.pathname); } }, 900);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarReto); else iniciarReto();
  var render0 = render; render = function () { render0.apply(this, arguments); escalar(); };
  window.addEventListener('resize', function () { if (document.querySelector('.npg-nikaword')) { escalar(); ajustar(); } });
  NP.nikaword = { guia: guia, empezar: empezar, empezarSala: empezarSala, hayPartida: hayPartida, record: record, config: CFG, _evaluar: evaluar, _desglose: desglose };
})();
