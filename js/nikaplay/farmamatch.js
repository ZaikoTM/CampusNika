/* FarmaMatch — "Farmacia de guardia": uní cada fármaco (frasco) con su clase, mecanismo o uso (cajón).
   Partida configurable: rondas de 5 pares, qué unir, área y ritmo. Un solo reloj para toda la partida; cada error resta tiempo.
   Puntos solo de juego: no cuentan en las notas ni en el rendimiento académico.
   Depende de js/nikaplay/core.js y de data/nikaplay/farmamatch.json (generado por tools/nikaplay/gen_farmamatch.py a partir
   del vademécum AAFH 2024 y de las fichas FASGO/FDA; borrador sin revisión final). */
(function () {
  'use strict';
  var NP = window.NikaPlay, C = NP.core, esc = C.esc;

  var CFG = { porRonda: 5, acierto: 20, bonoRonda: 30, bonoVel: 40, costoPista: 20, penalSeg: 8, segPorPunto: 2, maxRondas: 20, presets: [3, 5, 10, 15, 20], version: 1,
    ritmos: { justo: { seg: 12, det: '12 s por par' }, intenso: { seg: 8, det: '8 s por par' }, libre: { seg: 0, det: 'sin reloj' } },
    modos: { clase: 'Clase', mec: 'Mecanismo', uso: 'Uso clínico', mixto: 'Mixto' },
    areas: { todas: ['atb', 'otros', 'gin'], antimicrobianos: ['atb', 'otros'], gin: ['gin'] } };
  var CAMPO = { clase: ['clase', 'cg'], mec: ['mec', 'mg'], uso: ['uso', 'ug'] };
  var RUN_KEY = 'farmamatch_run', PREF_KEY = 'farmamatch_pref';

  var datos = null, run = null, reloj = null, ticks = 0, ayudaAbierta = false, rindeLista = false, flashTimer = null, sel = null, drag = null, noClick = false, pistaTimer = null,
    cfg = { n: 5, modo: 'mixto', area: 'todas', ritmo: 'justo' };

  var IC = {
    salir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    ayuda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.8M12 17h.01"/></svg>',
    steto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg>',
    reloj: '<svg class="npg-rj-svg" viewBox="0 0 64 64" aria-hidden="true"><circle class="rim" cx="32" cy="32" r="29"/><circle class="cara" cx="32" cy="32" r="24"/><circle class="anillo" cx="32" cy="32" r="27" pathLength="100"/><g class="marcas"><path d="M32 11v4M32 49v4M11 32h4M49 32h4"/></g><g class="aguja"><line x1="32" y1="32" x2="32" y2="16"/></g><circle class="eje" cx="32" cy="32" r="2.6"/></svg>'
  };
  /** Frasco (tapa de goma y anillo) y ampolla de vidrio; el color del líquido depende de la familia. */
  function frascoSvg(forma) {
    if (forma === 'ampolla') return '<svg viewBox="0 0 60 84" aria-hidden="true"><path class="vidrio" d="M30 3c2.4 7 3.4 11 3.4 17v6c9 4 15 12 15 24 0 14-8 28-18.4 28S11.6 64 11.6 50c0-12 6-20 15-24v-6c0-6 1-10 3.4-17z"/><path class="liq" d="M13 52c0 12 7 24 17 24s17-12 17-24c-5 3-11 3-17 0s-12-3-17 0z"/><path class="brillo" d="M19 42c0-5 3-9 7-11"/></svg>';
    return '<svg viewBox="0 0 60 84" aria-hidden="true"><rect class="tapa" x="17" y="2" width="26" height="11" rx="3"/><rect class="anillo" x="14" y="12" width="32" height="6" rx="2"/><path class="vidrio" d="M19 18h22v9c8 4 13 10 13 20v25a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V47c0-10 5-16 13-20z"/><rect class="liq" x="8" y="48" width="44" height="29" rx="4"/><rect class="etq" x="12" y="52" width="36" height="18" rx="3"/><path class="brillo" d="M13 36v32"/></svg>';
  }
  function tipoClase(d) { return d.fam === 'gin' ? 'gin' : d.tipo === 'Antibiótico' ? 'atb' : d.tipo === 'Antifúngico' ? 'fung' : d.tipo === 'Antiviral' ? 'vir' : 'par'; }
  function formaVial(d) { return d.fam === 'gin' || d.tipo === 'Antiviral' ? 'ampolla' : 'frasco'; }

  var BOT = ['#b9722e', '#2a8aa6', '#2f8f4e', '#7a4bb0', '#c2562b'];   // colores de frasco por posición (no revelan la respuesta)
  function docHtml() { return NP.doctor ? NP.doctor.html({ lado: 'der', clase: 'dr-oculto-chico' }) : ''; }
  /** El doctor comenta lo que pasa y vuelve a su pose tranquila. */
  function doc(txt, estado, ms) {
    var p = C.pantalla(); if (!p || !NP.doctor) return;
    NP.doctor.decir(p, !estado || estado === 'n' ? 'idle' : estado, txt, ms, { estado: 'idle', texto: 'Uní cada receta con su frasco.' });
  }
  /** Decorado de la botica: estantería, cuadro, ventana, lámpara, pila de libros y taza. */
  function ambiente() {
    var D = NP.decor; if (!D) return '';
    return '<div class="dc-amb fm-amb">' +
      '<div class="a-lib">' + D.libreria({ filas: 4, ancho: 190, alto: 330, madera: '#6b4423', semilla: 11, paleta: ['#9b2c2c', '#2c5282', '#b7791f', '#276749', '#6b46c1', '#c05621', '#285e61'] }) + '</div>' +
      '<div class="a-ven">' + D.ventana({ estilo: 'botica' }) + '</div><div class="a-lam">' + D.lampara() + '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ guía */
  function guia() {
    return '<div class="ngd"><div class="ngd-head"><span class="ngd-ico">' + frascoSvg('frasco') + '</span><div><b>Cómo se juega FarmaMatch</b><span>Farmacia de guardia: cada frasco, en su cajón</span></div></div>' +
      '<ol class="ngd-pasos">' +
      '<li class="p1"><span class="n">1</span><div><b>Elegí un frasco</b><p>Cada ronda trae <strong>5 frascos</strong> en el estante y <strong>5 cajones</strong> con una etiqueta: la <strong>clase</strong>, el <strong>mecanismo</strong> o el <strong>uso clínico</strong> (según lo que elijas).</p></div></li>' +
      '<li class="p2"><span class="n">2</span><div><b>Llevalo a su cajón</b><p><strong>Arrastrá</strong> el frasco al cajón que le corresponde, o <strong>tocá el frasco y después el cajón</strong>. Si acertás, encaja y suma ' + CFG.acierto + ' puntos. Una ronda sin errores da +' + CFG.bonoRonda + '.</p></div></li>' +
      '<li class="p3"><span class="n">3</span><div><b>Cuidá el reloj</b><p>Hay <strong>un solo reloj para toda la partida</strong>: <strong>cuanto más rápido terminás una ronda, más puntos</strong> (hasta +' + CFG.bonoVel + '). Cada <strong>error resta ' + CFG.penalSeg + ' segundos</strong>. Si llega a cero, la partida termina. La <strong>pista</strong> marca un par correcto y resta ' + CFG.costoPista + ' puntos.</p></div></li></ol>' +
      '<div class="ngd-pie"><span>Vos elegís cuántas rondas</span><span>Rápido = más puntos</span><span>Cada error: −' + CFG.penalSeg + ' s</span><span>Puntos solo de juego</span></div></div>';
  }

  /* ------------------------------------------------------------------ datos y rondas */
  function cargar() {
    if (datos) return Promise.resolve(datos);
    return fetch('data/nikaplay/farmamatch.json?v=1').then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (j) { if (!j || !j.drogas || j.drogas.length < 20) throw new Error('datos'); datos = j; return j; });
  }
  function droga(id) { for (var i = 0; i < datos.drogas.length; i++) if (datos.drogas[i].id === id) return datos.drogas[i]; return null; }
  function etiqueta(d, modo) { return d[CAMPO[modo][0]]; }
  function grupo(d, modo) { return d[CAMPO[modo][1]]; }
  function totalMs(n, ritmo) { return n * CFG.porRonda * (CFG.ritmos[ritmo] || CFG.ritmos.justo).seg * 1000; }

  /** Arma una ronda de 5 fármacos de una misma familia con etiquetas distintas (sin ambigüedad). */
  function armarRonda(modo, fams, usados, rnd) {
    var f = C.mezclar(fams, rnd), i, j, k;
    for (i = 0; i < f.length; i++) {
      var cand = C.mezclar(datos.drogas.filter(function (d) { return d.fam === f[i] && etiqueta(d, modo); }), rnd);
      cand.sort(function (a, b) { return (usados[a.id] ? 1 : 0) - (usados[b.id] ? 1 : 0); });
      var elegidos = [], grupos = {};
      for (j = 0; j < cand.length && elegidos.length < CFG.porRonda; j++) { k = grupo(cand[j], modo); if (!grupos[k]) { grupos[k] = 1; elegidos.push(cand[j]); } }
      if (elegidos.length === CFG.porRonda) { elegidos.forEach(function (d) { usados[d.id] = 1; }); var ids = elegidos.map(function (d) { return d.id; }); return { m: modo, d: ids, o: C.mezclar(ids, rnd) }; }
    }
    return null;
  }
  function crearRun(c) {
    var semilla = (Math.random() * 4294967296) >>> 0, rnd = C.rng(semilla), n = Math.max(1, Math.min(CFG.maxRondas, c.n | 0)), rondas = [], usados = {}, tipos = ['clase', 'mec', 'uso'];
    for (var r = 0; r < n; r++) {
      var modo = c.modo === 'mixto' ? tipos[Math.floor(rnd() * 3)] : c.modo, rr = armarRonda(modo, CFG.areas[c.area] || CFG.areas.todas, usados, rnd);
      if (!rr) { usados = {}; rr = armarRonda(modo, CFG.areas[c.area] || CFG.areas.todas, usados, rnd) || armarRonda('clase', CFG.areas.todas, usados, rnd); }
      rondas.push(rr);
    }
    var tiempo = c.ritmo !== 'libre', pool = tiempo ? totalMs(n, c.ritmo) : 0;
    return { v: CFG.version, seed: semilla, n: n, rondas: rondas, modo: c.modo, area: c.area, ritmo: c.ritmo, tiempo: tiempo, pool: pool, restante: pool, t0: pool, idx: 0, puestos: {}, rpts: 0, rerr: 0, errores: 0, pistas: 0, pistaId: null, resultados: [], total: 0, fase: 'inicio', pausa: false, agotado: false };
  }
  function runValido(r) {
    if (!r || r.v !== CFG.version || !r.rondas || r.rondas.length !== r.n || r.fase === 'fin') return false;
    for (var i = 0; i < r.rondas.length; i++) for (var j = 0; j < r.rondas[i].d.length; j++) if (!droga(r.rondas[i].d[j])) return false;
    return typeof r.idx === 'number' && r.idx >= 0 && r.idx < r.n;
  }
  function guardar() { if (run) C.escribir(RUN_KEY, run); }
  function hayPartida() { var r = C.leer(RUN_KEY, null); return !!(r && r.v === CFG.version && r.fase && r.fase !== 'fin' && r.fase !== 'inicio'); }
  function claveRecord(r) { return 'farmamatch_' + r.n + '_' + r.ritmo + '_' + r.modo + '_' + r.area; }
  function record() {
    var p = C.leer(PREF_KEY, null); if (!p || p.ritmo === 'libre') return null;
    var st = C.stats(claveRecord(p)); return st.mejor > 0 ? { mejor: st.mejor, n: p.n, ritmo: p.ritmo, rotulo: p.n + ' ' + (p.n === 1 ? 'ronda' : 'rondas') } : null;
  }
  function ronda() { return run.rondas[run.idx]; }

  /* ------------------------------------------------------------------ entrada pública */
  function empezar(nueva) {
    var p = C.abrirPantalla('npg-farmamatch', alCerrar);
    p.innerHTML = '<div class="npg-escena"><div class="npg-carga"><span class="npg-spin"></span><p>Abriendo la farmacia…</p></div></div>';
    cargar().then(function () {
      var pref = C.leer(PREF_KEY, null); if (pref && pref.n) cfg = { n: Math.min(CFG.maxRondas, pref.n), modo: CAMPO[pref.modo] || pref.modo === 'mixto' ? pref.modo : 'mixto', area: CFG.areas[pref.area] ? pref.area : 'todas', ritmo: CFG.ritmos[pref.ritmo] ? pref.ritmo : 'justo' };
      var guardada = nueva ? null : C.leer(RUN_KEY, null);
      if (guardada && runValido(guardada)) { run = guardada; if (run.fase === 'transicion') { avanzarEstado(); run.pausa = run.fase === 'jugando'; } else if (run.fase === 'jugando') run.pausa = true; } else run = crearRun(cfg);
      render();
    }).catch(function () {
      p.innerHTML = '<div class="npg-escena"><div class="npg-carga error"><strong>No pudimos cargar los fármacos.</strong><p>Revisá tu conexión e intentá de nuevo. No se perdió nada.</p><button type="button" class="npg-btn" data-reintentar>Reintentar</button><button type="button" class="npg-btn sec" data-x>Cerrar</button></div></div>';
    });
  }
  function alCerrar() { detener(); clearTimeout(flashTimer); clearTimeout(pistaTimer); ayudaAbierta = false; sel = null; if (run && run.fase === 'jugando') { run.pausa = true; guardar(); } document.removeEventListener('keydown', teclado); }

  /* ------------------------------------------------------------------ reloj único */
  function detener() { if (reloj) { clearInterval(reloj); reloj = null; } }
  function arrancar() {
    detener(); if (!run.tiempo || run.restante <= 0) return;
    var fin = Date.now() + run.restante; ticks = 0;
    reloj = setInterval(function () { run.restante = Math.max(0, fin - Date.now()); pintarReloj(); if (!run.avisoUrgente && run.restante <= 15000 && run.restante > 0) { run.avisoUrgente = true; doc('¡Ojo, que se acaba el tiempo!', 'apura', 4000); } if (++ticks % 4 === 0) guardar(); if (run.restante <= 0) agotar(); }, 250);
  }
  function pintarReloj() {
    var p = C.pantalla(), rj = p && p.querySelector('.npg-reloj'); if (!rj) return;
    var frac = run.tiempo ? run.restante / run.pool : 1, txt = rj.querySelector('.npg-rj-txt'), ani = rj.querySelector('.anillo'), ag = rj.querySelector('.aguja');
    if (txt) txt.textContent = run.tiempo ? C.mmss(run.restante) : 'Sin reloj';
    if (ani) ani.style.strokeDashoffset = String(100 - frac * 100);
    if (ag) ag.style.transform = 'rotate(' + ((1 - frac) * 360) + 'deg)';
    rj.classList.toggle('poco', run.tiempo && (frac <= 0.2 || run.restante <= 15000)); rj.classList.toggle('sin', !run.tiempo);
  }
  function penalizar() {
    if (!run.tiempo) return;
    run.restante = Math.max(0, run.restante - CFG.penalSeg * 1000);
    var p = C.pantalla(), rj = p && p.querySelector('.npg-reloj');
    if (rj) { var f = document.createElement('span'); f.className = 'npg-pen'; f.textContent = '−' + CFG.penalSeg + ' s'; rj.appendChild(f); setTimeout(function () { f.remove(); }, 1400); rj.classList.remove('golpe'); void rj.offsetWidth; rj.classList.add('golpe'); }
    pintarReloj(); if (run.restante <= 0) agotar(); else arrancar();
  }

  /* ------------------------------------------------------------------ pintura */
  function encabezado(conAyuda) {
    var hechos = run.resultados.length, n = run.n, pct = Math.round(hechos / n * 100);
    return '<header class="npg-top"><button type="button" class="npg-hb salir" data-x aria-label="Salir (la partida queda guardada)">' + IC.salir + '<span>Salir</span></button>' +
      '<div class="npg-tit"><b>FarmaMatch</b><span>Ronda ' + Math.min(run.idx + 1, n) + ' de ' + n + '</span><div class="npg-prog barra" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + hechos + '"><i style="width:' + pct + '%"></i></div></div>' +
      (conAyuda ? '<button type="button" class="npg-hb" data-ayuda aria-label="Cómo se juega">' + IC.ayuda + '<span>Ayuda</span></button>' : '<span></span>') +
      '<div class="npg-pts" aria-live="polite"><small>Puntos</small><b>' + run.total + '</b></div></header>';
  }
  function render() {
    var p = C.pantalla(); if (!p) return;
    detener(); document.removeEventListener('keydown', teclado); ayudaAbierta = false; clearTimeout(flashTimer); sel = null;
    if (run.fase === 'transicion') avanzarEstado();
    if (run.fase === 'inicio' || run.pausa) return vistaInicio(p);
    if (run.fase === 'jugando') return vistaJuego(p);
    if (run.fase === 'fin') return vistaFin(p);
  }

  function configHtml() {
    var r = CFG.ritmos;
    var chips = function (attr, obj, nombres) { return Object.keys(obj).map(function (k) { return '<button type="button" class="ngc-chip" data-' + attr + '="' + k + '">' + esc(nombres[k]) + '</button>'; }).join(''); };
    return '<section class="ngc" aria-label="Armá tu partida"><h3>Armá tu partida</h3>' +
      '<div class="ngc-fila"><span class="ngc-et">Cantidad de rondas (5 pares cada una)</span><div class="ngc-chips" role="group">' + CFG.presets.map(function (n) { return '<button type="button" class="ngc-chip" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
      '<div class="ngc-step"><button type="button" data-nmenos aria-label="Menos rondas">−</button><input id="ngc-n" type="number" inputmode="numeric" min="1" max="' + CFG.maxRondas + '" value="' + cfg.n + '" aria-label="Cantidad de rondas"><button type="button" data-nmas aria-label="Más rondas">+</button></div></div>' +
      '<div class="ngc-fila"><span class="ngc-et">Qué querés unir</span><div class="ngc-chips" role="group">' + chips('modo', CFG.modos, CFG.modos) + '</div></div>' +
      '<div class="ngc-fila"><span class="ngc-et">Área</span><div class="ngc-chips" role="group">' + chips('area', CFG.areas, { todas: 'Todas', antimicrobianos: 'Antimicrobianos', gin: 'Ginecología y obstetricia' }) + '</div></div>' +
      '<div class="ngc-fila"><span class="ngc-et">Ritmo</span><div class="ngc-chips" role="group">' +
      '<button type="button" class="ngc-chip ancho" data-ritmo="justo"><b>Justo</b><small>' + r.justo.det + '</small></button><button type="button" class="ngc-chip ancho" data-ritmo="intenso"><b>Intenso</b><small>' + r.intenso.det + '</small></button><button type="button" class="ngc-chip ancho" data-ritmo="libre"><b>Práctica</b><small>sin reloj</small></button></div></div>' +
      '<p class="ngc-res" aria-live="polite"></p></section>';
  }
  function pintarConfig() {
    var p = C.pantalla(); if (!p) return;
    p.querySelectorAll('[data-n]').forEach(function (b) { b.classList.toggle('on', +b.dataset.n === cfg.n); });
    p.querySelectorAll('[data-modo]').forEach(function (b) { b.classList.toggle('on', b.dataset.modo === cfg.modo); });
    p.querySelectorAll('[data-area]').forEach(function (b) { b.classList.toggle('on', b.dataset.area === cfg.area); });
    p.querySelectorAll('[data-ritmo]').forEach(function (b) { b.classList.toggle('on', b.dataset.ritmo === cfg.ritmo); });
    var inp = p.querySelector('#ngc-n'); if (inp && document.activeElement !== inp) inp.value = cfg.n;
    var res = p.querySelector('.ngc-res'); if (!res) return;
    var pares = cfg.n * CFG.porRonda;
    res.innerHTML = cfg.ritmo === 'libre' ? '<b>' + cfg.n + ' rondas</b> (' + pares + ' pares) · sin reloj · los errores se cuentan pero no restan tiempo · la práctica no suma al récord'
      : '<b>' + cfg.n + ' rondas</b> (' + pares + ' pares) · reloj de <b>' + C.mmss(totalMs(cfg.n, cfg.ritmo)) + '</b> para toda la partida · cada error resta <b>' + CFG.penalSeg + ' s</b>';
  }
  function cambiarConfig(parche) {
    if (parche.n != null) cfg.n = Math.max(1, Math.min(CFG.maxRondas, parche.n | 0));
    ['modo', 'area', 'ritmo'].forEach(function (k) { if (parche[k]) cfg[k] = parche[k]; });
    run = crearRun(cfg); pintarConfig();
  }
  function cartelInicio() {
    var deco = [['Antibióticos', '#b9722e'], ['Antifúngicos', '#2f8f4e'], ['Antivirales', '#7a4bb0'], ['Obstetricia', '#c2562b'], ['Mecanismos', '#2a8aa6']];
    return '<div class="fm-portada"><div class="fm-placa"><h2>FarmaMatch</h2><p>Uní los conceptos, dominá la farmacología</p></div><div class="fm-deco" aria-hidden="true">' +
      deco.map(function (d, i) { return '<span class="fm-bdeco" style="--bc:' + d[1] + ';--i:' + i + '"><i class="c"></i><i class="n"></i><i class="b"><em>' + d[0] + '</em></i></span>'; }).join('') + '</div></div>';
  }
  function vistaInicio(p) {
    var enPausa = run.pausa;
    p.innerHTML = '<div class="npg-escena">' + encabezado(false) + '<main class="npg-centro">' + (enPausa ?
      '<section class="npg-ficha" aria-labelledby="npg-ft"><span class="npg-clip" aria-hidden="true"></span><span class="npg-etq">Partida en pausa</span><h2 id="npg-ft">Seguimos donde lo dejaste</h2>' +
      '<p class="npg-sub">Ronda ' + (run.idx + 1) + ' de ' + run.n + ' · ' + run.total + ' puntos · ' + run.errores + (run.errores === 1 ? ' error' : ' errores') + '.' + (run.tiempo ? ' Te quedan ' + C.mmss(run.restante) + '.' : '') + '</p>' +
      '<div class="npg-acc"><button type="button" class="npg-btn" data-ir>Continuar <span aria-hidden="true">→</span></button><button type="button" class="npg-btn sec" data-nueva>Partida nueva</button></div></section>' :
      '<section class="ngd-wrap fm-inicio">' + cartelInicio() + configHtml() + guia() +
      '<div class="npg-acc"><button type="button" class="npg-btn fm-jugar" data-ir>Jugar <span aria-hidden="true">▶</span></button><button type="button" class="npg-btn sec" data-x>Volver</button></div>' +
      (datos.estado === 'borrador' ? '<p class="npg-borr">Contenido en revisión: puede haber imprecisiones. Fuentes: vademécum AAFH 2024 y fichas FASGO/FDA.</p>' : '') + '</section>') + '</main></div>';
    if (!enPausa) pintarConfig();
  }

  var TITULO = { clase: 'su <em>clase</em>', mec: 'su <em>mecanismo de acción</em>', uso: 'su <em>uso clínico</em>' };
  function vistaJuego(p) {
    var r = ronda();
    p.innerHTML = '<div class="npg-escena">' + ambiente() + encabezado(true) + '<main class="npg-mesa fm-mesa">' +
      '<div class="npg-consigna fm-cartel"><span class="npg-ptit">Ronda de <em>' + esc(CFG.modos[r.m]) + '</em></span><b class="npg-def-j">Uní cada receta con ' + TITULO[r.m] + '</b><div class="npg-gratis"><span class="fm-aviso">Arrastrá la receta al frasco, o tocá la receta y después el frasco</span></div></div>' +
      '<div class="fm-barra"><div class="npg-reloj" title="Reloj de toda la partida">' + IC.reloj + '<span class="npg-rj-txt"></span></div>' +
      '<div class="npg-errores"><span>Errores</span><b>0</b></div>' +
      '<div class="npg-pistas"><button type="button" class="npg-pista-btn" data-pista aria-label="Pedir pista">' + IC.steto + '<span>Pedir pista <i>−' + CFG.costoPista + '</i></span></button></div>' +
      '<button type="button" class="npg-rendir" data-rendir>Rendirme' + (run.tiempo ? ' (−' + CFG.penalSeg + ' s)' : '') + '</button></div>' +
      '<div class="fm-centro"><div class="fm-repisa"><div class="fm-cajones" aria-label="Frascos"></div><i class="fm-tabla" aria-hidden="true"></i></div><div class="fm-estante" aria-label="Recetas sin ubicar"></div></div></main>' + docHtml() + '</div>';
    pintarRonda(true); pintarReloj(); pintarErrores(); doc('¡Bienvenido a la botica! Uní cada receta con su frasco.', 'hola', 3200);
    document.addEventListener('keydown', teclado);
    if (!ayudaAbierta) arrancar();
  }
  function pintarErrores() { var p = C.pantalla(), e = p && p.querySelector('.npg-errores b'); if (e) e.textContent = run.errores; }
  function pintarRonda(entrada) {
    var p = C.pantalla(); if (!p) return;
    var r = ronda(), est = p.querySelector('.fm-estante'), caj = p.querySelector('.fm-cajones'); if (!est || !caj) return;
    est.classList.toggle('entra', !!entrada); caj.classList.toggle('entra', !!entrada);   // la animación de entrada solo la primera vez
    est.innerHTML = r.d.filter(function (id) { return !run.puestos[id]; }).map(function (id, i) {
      var d = droga(id);
      return '<button type="button" class="fm-vial t-' + tipoClase(d) + (sel === id ? ' sel' : '') + (run.pistaId === id ? ' pista' : '') + '" data-vial="' + id + '" style="--i:' + i + '" aria-label="Receta de ' + esc(d.n) + '"><span class="fm-lacre" aria-hidden="true"></span><span class="fm-nom">' + esc(d.n).replace(/\//g, '/<wbr>') + '</span></button>';
    }).join('') || '<p class="fm-vacio">Todas las recetas están en su frasco.</p>';
    caj.innerHTML = r.o.map(function (id, i) {
      var d = droga(id), puesto = !!run.puestos[id];
      return '<button type="button" class="fm-cajon' + (puesto ? ' ok' : '') + (sel && !puesto ? ' listo' : '') + (run.pistaId === id ? ' pista' : '') + '" data-cajon="' + id + '" style="--i:' + i + ';--bc:' + BOT[i % BOT.length] + '"' + (puesto ? ' disabled' : '') + ' aria-label="Frasco: ' + esc(etiqueta(d, r.m)) + (puesto ? ', completo: ' + esc(d.n) : '') + '">' +
        '<span class="fm-corcho" aria-hidden="true"></span><span class="fm-cuello" aria-hidden="true"></span><span class="fm-vidrio"><span class="fm-etq">' + esc(etiqueta(d, r.m)) + '</span>' +
        '<span class="fm-sello">' + (puesto ? '<b>' + esc(d.n) + '</b>' : '<i>soltá la receta</i>') + '</span></span></button>';
    }).join('');
  }

  /* ------------------------------------------------------------------ jugar */
  function colocar(idV, idC) {
    if (run.fase !== 'jugando' || ayudaAbierta || run.puestos[idV]) return;
    var p = C.pantalla(), caj = p && p.querySelector('.fm-cajon[data-cajon="' + idC + '"]');
    if (idV === idC) {
      run.puestos[idV] = true; run.rpts += CFG.acierto; run.total += CFG.acierto; if (run.pistaId === idV) run.pistaId = null; sel = null; guardar();
      pintarRonda(); var c2 = p.querySelector('.fm-cajon[data-cajon="' + idC + '"]'); if (c2) c2.classList.add('encaja');
      var hud = p.querySelector('.npg-pts b'); if (hud) hud.textContent = run.total; doc(['¡Muy bien!', '¡Eso es!', '¡Excelente!', '¡Bien ahí!'][Math.floor(Math.random() * 4)], 'ok', 1700);
      if (Object.keys(run.puestos).length >= ronda().d.length) setTimeout(rondaCompleta, C.reducido() ? 100 : 650);
    } else {
      run.errores++; run.rerr++; sel = null; guardar(); pintarErrores(); pintarRonda();
      var v = p.querySelector('.fm-vial[data-vial="' + idV + '"]'); if (v) { v.classList.add('rebota'); }
      var c3 = p.querySelector('.fm-cajon[data-cajon="' + idC + '"]'); if (c3) c3.classList.add('mal');
      doc('¡Ups! Ese no era' + (run.tiempo ? ' (−' + CFG.penalSeg + ' s)' : ''), 'ups', 2000);
      penalizar();
    }
  }
  function pedirPista() {
    var r = ronda(), libres = r.d.filter(function (id) { return !run.puestos[id]; }); if (!libres.length || run.fase !== 'jugando') return;
    var id = libres[Math.floor(Math.random() * libres.length)]; run.pistaId = id; run.pistas++; run.total = Math.max(0, run.total - CFG.costoPista); guardar();
    var hud = C.pantalla().querySelector('.npg-pts b'); if (hud) hud.textContent = run.total; pintarRonda();
    doc('Mirá la receta que brilla… ¡y su frasco!', 'pista', 2800);
    clearTimeout(pistaTimer); pistaTimer = setTimeout(function () { if (run && run.pistaId === id) { run.pistaId = null; pintarRonda(); } }, 5000);
  }
  function rondaCompleta() {
    if (run.fase !== 'jugando') return;
    detener(); var r = ronda(), perfecta = run.rerr === 0 ? CFG.bonoRonda : 0;
    var ref = ((CFG.ritmos[run.ritmo] || {}).seg || 0) * CFG.porRonda * 1000, gastado = (run.t0 || 0) - run.restante;
    var vel = run.tiempo && ref > 0 ? Math.round(CFG.bonoVel * Math.min(1, Math.max(0, 1 - gastado / ref))) : 0, bono = perfecta + vel;
    run.total += bono; run.resultados.push({ m: r.m, errs: run.rerr, pts: run.rpts + bono, bono: bono, vel: vel, completa: true });
    doc(run.rerr === 0 ? '¡Ronda perfecta! ¡Excelente!' : '¡Ronda completa!', 'victoria', 3000); if (NP.doctor) NP.doctor.confeti(C.pantalla(), run.rerr === 0 ? 46 : 26);
    run.fase = 'transicion'; run.pausa = false; guardar(); mostrarFlash(r, bono, false);
  }
  function agotar() {
    if (run.fase !== 'jugando') return;
    detener(); var r = ronda(), hechos = Object.keys(run.puestos).length;
    run.agotado = true; run.resultados.push({ m: r.m, errs: run.rerr, pts: run.rpts, bono: 0, completa: false, hechos: hechos }); doc('¡Se acabó el tiempo! La próxima sale mejor.', 'derrota', 4000);
    run.fase = 'transicion'; guardar(); mostrarFlash(r, 0, true);
  }
  function rendirse(btn) {
    if (!rindeLista) { rindeLista = true; btn.textContent = '¿Seguro? Tocá de nuevo'; btn.classList.add('seguro'); setTimeout(function () { rindeLista = false; if (btn.isConnected) { btn.textContent = 'Rendirme' + (run.tiempo ? ' (−' + CFG.penalSeg + ' s)' : ''); btn.classList.remove('seguro'); } }, 3000); return; }
    rindeLista = false; run.errores++; run.rerr++; pintarErrores();
    if (run.tiempo) { run.restante = Math.max(0, run.restante - CFG.penalSeg * 1000); }
    var r = ronda(), hechos = Object.keys(run.puestos).length; detener();
    run.resultados.push({ m: r.m, errs: run.rerr, pts: run.rpts, bono: 0, completa: false, hechos: hechos, rindio: true });
    run.fase = 'transicion'; guardar(); mostrarFlash(r, 0, false, true);
  }

  /** Cartel corto con las respuestas de la ronda (aprendizaje); sigue solo o al tocar. */
  function mostrarFlash(r, bono, tiempoOut, rindio) {
    var p = C.pantalla(); if (!p) return;
    var res = run.resultados[run.resultados.length - 1], ultima = run.agotado || run.idx + 1 >= run.n;
    var sello = tiempoOut ? ['SE ACABÓ EL TIEMPO', 'tiempo'] : rindio ? ['TE RENDISTE', 'no'] : res.errs === 0 ? ['¡RONDA PERFECTA!', 'ok'] : ['¡RONDA LISTA!', 'ok'];
    var top = p.querySelector('.npg-top'); if (top) top.outerHTML = encabezado(true);
    var filas = r.o.map(function (id) { var d = droga(id); return '<li><span class="fm-mini t-' + tipoClase(d) + '">' + frascoSvg(formaVial(d)) + '</span><span class="fm-fx"><b>' + esc(d.n) + '</b><small>' + esc(etiqueta(d, r.m)) + '</small></span></li>'; }).join('');
    var o = document.createElement('div'); o.className = 'npg-flash fm-flash'; o.setAttribute('role', 'status');
    o.innerHTML = '<div class="npg-flash-c ' + sello[1] + '"><div class="npg-sello grande ' + sello[1] + '" aria-hidden="true">' + sello[0] + '</div>' +
      '<div class="npg-flash-p">' + (res.pts ? '+' + res.pts + ' puntos' + (res.vel ? ' (+' + res.vel + ' por rapidez)' : '') : 'Sin puntos esta ronda') + '</div>' +
      '<ul class="fm-resp">' + filas + '</ul><small class="fm-fuente">Fuente: ' + esc(droga(r.d[0]).fuente) + '</small>' +
      '<button type="button" class="npg-btn" data-saltar>' + (ultima ? 'Ver resultado' : 'Siguiente ronda') + ' <span aria-hidden="true">→</span></button></div>';
    p.appendChild(o);
    clearTimeout(flashTimer); flashTimer = setTimeout(avanzar, C.reducido() ? 6000 : 4800);
  }
  function avanzarEstado() {
    if (run.agotado || run.idx + 1 >= run.n) { finalizar(); return; }
    run.idx++; run.puestos = {}; run.rpts = 0; run.rerr = 0; run.pistaId = null; run.t0 = run.restante; run.fase = 'jugando'; run.pausa = false; guardar();
  }
  function avanzar() {
    clearTimeout(flashTimer); flashTimer = null; var p = C.pantalla(); if (!p || run.fase !== 'transicion') return;
    avanzarEstado(); render();
  }
  function finalizar() {
    var ok = run.resultados.reduce(function (a, r) { return a + (r.completa ? CFG.porRonda : (r.hechos || 0)); }, 0);
    run.bono = run.tiempo && !run.agotado ? Math.floor(run.restante / 1000 / CFG.segPorPunto) : 0; run.total += run.bono; run.pares = ok;
    run.record = run.tiempo ? C.guardarResultado(claveRecord(run), { puntos: run.total, resueltos: ok, terminos: run.n * CFG.porRonda }) : { practica: true, mejor: 0, esRecord: false };
    C.escribir(PREF_KEY, { n: run.n, modo: run.modo, area: run.area, ritmo: run.ritmo });
    run.fase = 'fin'; C.borrar(RUN_KEY);
  }
  function vistaFin(p) {
    var res = run.resultados, rec = run.record || {}, usado = run.tiempo ? run.pool - run.restante : 0, perfectas = res.filter(function (r) { return r.completa && r.errs === 0; }).length;
    p.innerHTML = '<div class="npg-escena">' + encabezado(false) + '<main class="npg-centro"><section class="npg-ficha fin" aria-labelledby="npg-fn"><span class="npg-clip" aria-hidden="true"></span>' +
      '<span class="npg-etq">' + (run.agotado ? 'Se acabó el tiempo' : 'Parte de farmacia') + '</span><h2 id="npg-fn">' + run.total + ' puntos</h2>' +
      (rec.esRecord ? '<div class="npg-record">★ ¡Nuevo récord personal!</div>' : rec.practica ? '<p class="npg-sub">Modo práctica: no suma al récord.</p>' : '<p class="npg-sub">Tu mejor marca con esta configuración: ' + rec.mejor + ' puntos.</p>') +
      '<div class="npg-resumen"><div><b>' + run.pares + '/' + run.n * CFG.porRonda + '</b><small>Pares</small></div><div><b>' + run.errores + '</b><small>Errores</small></div><div><b>' + perfectas + '</b><small>Rondas perfectas</small></div>' +
      (run.tiempo ? '<div><b>' + C.mmss(usado) + '</b><small>Tiempo usado</small></div><div><b>+' + (run.bono || 0) + '</b><small>Bono de tiempo</small></div>' : '') + '</div>' +
      (run.agotado ? '<p class="npg-sub">El reloj llegó a cero en la ronda ' + res.length + ' de ' + run.n + '.</p>' : '') +
      '<ul class="npg-lista">' + res.map(function (r, i) { return '<li class="' + (r.completa ? 'ok' : 'no') + '"><span class="mk" aria-hidden="true">' + (r.completa ? '✓' : '✗') + '</span><span class="tt">Ronda ' + (i + 1) + ' · ' + esc(CFG.modos[r.m]) + '<small>' + (r.completa ? '5 de 5 pares' : (r.hechos || 0) + ' de 5 pares') + ' · ' + r.errs + (r.errs === 1 ? ' error' : ' errores') + '</small></span><b>' + r.pts + '</b></li>'; }).join('') + '</ul>' +
      '<div class="npg-acc"><button type="button" class="npg-btn" data-otra>Jugar de nuevo</button><button type="button" class="npg-btn sec" data-x>Volver a NikaPlay</button></div>' +
      '<p class="npg-borr">Puntos solo de juego: no cuentan en tus notas ni en tu rendimiento académico.</p></section></main></div>';
    document.dispatchEvent(new CustomEvent('nikaplay:resultado', { detail: { juego: 'farmamatch', puntos: run.total } }));
  }

  /* ------------------------------------------------------------------ ayuda */
  function ayuda() {
    var p = C.pantalla(); if (!p || ayudaAbierta) return;
    ayudaAbierta = true; detener();
    var o = document.createElement('div'); o.className = 'npg-ayuda'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Cómo se juega');
    o.innerHTML = '<div class="ngd-wrap">' + guia() + (run.tiempo ? '<p class="npg-sub" style="text-align:center">El reloj está en pausa mientras leés.</p>' : '') + '<div class="npg-acc"><button type="button" class="npg-btn" data-cerrar-ayuda>¡Entendido, a jugar!</button></div></div>';
    p.appendChild(o);
  }
  function cerrarAyuda() { var p = C.pantalla(), o = p && p.querySelector('.npg-ayuda'); if (o) o.remove(); ayudaAbierta = false; if (run && run.fase === 'jugando') arrancar(); }

  /* ------------------------------------------------------------------ arrastrar y tocar */
  function cajonBajo(x, y) {
    var els = document.elementsFromPoint(x, y);
    for (var i = 0; i < els.length; i++) { var c = els[i].closest && els[i].closest('.fm-cajon'); if (c && !c.disabled) return c; }
    return null;
  }
  document.addEventListener('pointerdown', function (e) {
    var p = C.pantalla(); if (!p || !run || run.fase !== 'jugando' || ayudaAbierta) return;
    var v = e.target.closest && e.target.closest('.fm-vial'); if (!v || !p.contains(v) || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { el: v, id: v.dataset.vial, x0: e.clientX, y0: e.clientY, moved: false, pid: e.pointerId };
    try { v.setPointerCapture(e.pointerId); } catch (_) {}
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; drag.el.classList.add('arrastrando'); var ps = C.pantalla(); if (ps) ps.classList.add('fm-arrastre'); }
    if (drag.moved) {
      drag.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.12) rotate(' + Math.max(-12, Math.min(12, dx / 14)) + 'deg)';
      var c = cajonBajo(e.clientX, e.clientY), ps2 = C.pantalla();
      if (ps2) ps2.querySelectorAll('.fm-cajon.encima').forEach(function (x) { if (x !== c) x.classList.remove('encima'); });
      if (c) c.classList.add('encima');
    }
  });
  function soltar(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var d = drag; drag = null; var ps = C.pantalla();
    if (ps) { ps.classList.remove('fm-arrastre'); ps.querySelectorAll('.fm-cajon.encima').forEach(function (x) { x.classList.remove('encima'); }); }
    if (!d.moved) return;
    noClick = true; setTimeout(function () { noClick = false; }, 60);
    var c = e.type === 'pointerup' ? cajonBajo(e.clientX, e.clientY) : null;
    d.el.classList.remove('arrastrando'); d.el.style.transform = '';
    if (c) colocar(d.id, c.dataset.cajon);
  }
  document.addEventListener('pointerup', soltar); document.addEventListener('pointercancel', soltar);

  function teclado(e) {
    var pt = C.pantalla(); if (!pt || !pt.classList.contains('npg-farmamatch') || !run || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { C.cerrarPantalla(); return; }
    if (run.fase === 'transicion') { e.preventDefault(); avanzar(); }
  }

  /* ------------------------------------------------------------------ clicks */
  document.addEventListener('click', function (e) {
    var p = C.pantalla(); if (!p || !p.contains(e.target) || !run || !p.classList.contains('npg-farmamatch')) return;
    if (run.fase === 'transicion' && e.target.closest('.npg-flash')) return avanzar();
    if (noClick) return;
    var v = e.target.closest('.fm-vial'); if (v && run.fase === 'jugando' && !ayudaAbierta) { sel = sel === v.dataset.vial ? null : v.dataset.vial; return pintarRonda(); }
    var cj = e.target.closest('.fm-cajon'); if (cj && run.fase === 'jugando' && !ayudaAbierta) { if (sel) colocar(sel, cj.dataset.cajon); return; }
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-x')) return C.cerrarPantalla();
    if (b.hasAttribute('data-reintentar')) return empezar(false);
    if (b.dataset.n) return cambiarConfig({ n: +b.dataset.n });
    if (b.hasAttribute('data-nmas')) return cambiarConfig({ n: cfg.n + 1 });
    if (b.hasAttribute('data-nmenos')) return cambiarConfig({ n: cfg.n - 1 });
    if (b.dataset.modo) return cambiarConfig({ modo: b.dataset.modo });
    if (b.dataset.area) return cambiarConfig({ area: b.dataset.area });
    if (b.dataset.ritmo) return cambiarConfig({ ritmo: b.dataset.ritmo });
    if (b.hasAttribute('data-ir')) { if (run.fase === 'inicio') { C.escribir(PREF_KEY, { n: run.n, modo: run.modo, area: run.area, ritmo: run.ritmo }); run.restante = run.pool; run.t0 = run.pool; } run.fase = 'jugando'; run.pausa = false; guardar(); return render(); }
    if (b.hasAttribute('data-nueva')) { C.borrar(RUN_KEY); run = crearRun(cfg); return render(); }
    if (b.hasAttribute('data-pista')) return pedirPista();
    if (b.hasAttribute('data-ayuda')) return ayuda();
    if (b.hasAttribute('data-cerrar-ayuda')) return cerrarAyuda();
    if (b.hasAttribute('data-rendir')) return rendirse(b);
    if (b.hasAttribute('data-saltar')) return avanzar();
    if (b.hasAttribute('data-otra')) { run = crearRun(cfg); return render(); }
  });
  document.addEventListener('input', function (e) {
    var p = C.pantalla(); if (!p || !e.target || e.target.id !== 'ngc-n' || !p.classList.contains('npg-farmamatch')) return;
    var v = parseInt(e.target.value, 10); if (v >= 1) cambiarConfig({ n: v });
  });

  NP.farmamatch = { guia: guia, empezar: empezar, hayPartida: hayPartida, record: record, config: CFG };
})();
