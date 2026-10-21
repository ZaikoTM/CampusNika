/* NikaVersusPlus · Arena de Duelos: configuración del duelo (materia, área, cantidad, tiempo), entrenamiento en solitario
   (práctica, examen, minijuegos), historial de errores, historial de duelos, temas y efectos.
   Se inicia desde versus.html con NikaVersusPlus.init({...}) pasando funciones del banco de preguntas. */
(function () {
  'use strict';
  const LS_CFG = 'nika_versus_cfg_v1', LS_TEMA = 'nika_versus_tema_v1', MAX_ERRORES = 300;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sinScripts = (h) => String(h == null ? '' : h).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/ on\w+="[^"]*"/gi, '');
  const $ = (s, r = document) => r.querySelector(s);
  const leer = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (_) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const barajar = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const usuario = () => { try { return (window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername()) || 'anon'; } catch (_) { return 'anon'; } };

  let A = null;     // adaptador que entrega versus.html
  let solo = null;  // estado del entrenamiento en curso

  const MATERIAS = [{ id: 'cirugia', label: 'Cirugía', ico: '🔪' }, { id: 'ginecologia', label: 'Ginecología', ico: '🌸' }, { id: 'siam', label: 'S.I.A.M.', ico: '🩺' }];
  const ESTILOS = {
    practica: { ico: '📘', nombre: 'Modo práctica', desc: 'Sin apuro: ves la justificación después de cada pregunta.' },
    examen: { ico: '📝', nombre: 'Modo examen', desc: 'Con tiempo total y sin ayudas. Corregís al final.' },
    relampago: { ico: '⚡', nombre: 'Relámpago', desc: '60 segundos: respondé todas las que puedas. Fallar resta 3 s.' },
    supervivencia: { ico: '❤️', nombre: 'Supervivencia', desc: '3 vidas. ¿Hasta dónde llegás sin fallar?' },
    vf: { ico: '✅', nombre: 'Verdadero o Falso', desc: 'Te mostramos una respuesta: decidí si es la correcta.' },
  };
  const SONIDO = (t) => { try { A && A.sonido && A.sonido(t); } catch (_) {} };
  const aviso = (m) => { try { A && A.toast ? A.toast(m) : alert(m); } catch (_) {} };

  // ------------------------------------------------------------------ errores (historial de preguntas falladas)
  const claveErrores = () => 'nika_versus_errores_v1_' + (A ? A.modulo : 'x') + '_' + usuario();
  const listarErrores = () => leer(claveErrores(), []);
  function registrarError(q) {
    try {
      if (!q || !q.id || !Array.isArray(q.opciones)) return;
      const lista = listarErrores(), i = lista.findIndex((x) => x.id === q.id);
      const fila = { id: q.id, up: q.up || null, pregunta: q.pregunta, opciones: q.opciones.map((o) => ({ id: o.id, texto: o.texto, correcta: !!o.correcta })), justificacion: q.justificacion || '', veces: 1, ultimo: Date.now() };
      if (i >= 0) { fila.veces = (lista[i].veces || 1) + 1; if (!fila.justificacion) fila.justificacion = lista[i].justificacion || ''; lista.splice(i, 1); }
      lista.unshift(fila);
      guardar(claveErrores(), lista.slice(0, MAX_ERRORES));
      refrescarInsignias();
    } catch (_) {}
  }
  function resolverError(id) { const l = listarErrores().filter((x) => x.id !== id); guardar(claveErrores(), l); refrescarInsignias(); }
  function limpiarErrores() { guardar(claveErrores(), []); refrescarInsignias(); }

  // ------------------------------------------------------------------ temas
  const TEMAS = [
    { id: '', nombre: 'Claro', c: '#f1f5f9' }, { id: 'oscuro', nombre: 'Oscuro', c: '#090d16' }, { id: 'quirofano', nombre: 'Quirófano', c: '#14b8a6' },
    { id: 'arena', nombre: 'Arena neón', c: '#a78bfa' }, { id: 'atardecer', nombre: 'Atardecer', c: '#fb923c' }, { id: 'medianoche', nombre: 'Medianoche', c: '#fbbf24' },
  ];
  function aplicarTema(id) {
    const b = document.body;
    TEMAS.forEach((t) => t.id && t.id !== 'oscuro' && b.classList.remove('tema-' + t.id));
    b.classList.remove('dark-mode');
    if (id === 'oscuro') b.classList.add('dark-mode'); else if (id) b.classList.add('tema-' + id);
    guardar(LS_TEMA, id || '');
    try { const btn = document.getElementById('dark-mode-btn'); if (btn) btn.textContent = id === 'oscuro' ? '☀️' : '🌙'; } catch (_) {}
    document.querySelectorAll('.vp-temas-menu button').forEach((x) => x.classList.toggle('on', x.dataset.t === (id || '')));
  }
  function montarMenuTemas() {
    const barra = $('.navbar-actions'); if (!barra || $('.vp-temas')) return;
    const cont = document.createElement('div'); cont.className = 'vp-temas';
    cont.innerHTML = '<button type="button" class="btn-icon" id="vp-temas-btn" aria-label="Cambiar tema" title="Temas">🎨</button><div class="vp-temas-menu" role="menu">' +
      TEMAS.map((t) => '<button type="button" role="menuitem" data-t="' + t.id + '"><span class="vp-dot" style="background:' + t.c + '"></span>' + esc(t.nombre) + '</button>').join('') + '</div>';
    barra.insertBefore(cont, barra.firstChild);
    const menu = $('.vp-temas-menu', cont);
    $('#vp-temas-btn', cont).onclick = (e) => { e.stopPropagation(); menu.classList.toggle('on'); };
    menu.querySelectorAll('button').forEach((b) => { b.onclick = () => { aplicarTema(b.dataset.t); menu.classList.remove('on'); }; });
    document.addEventListener('click', () => menu.classList.remove('on'));
    // el botón luna/sol de siempre sigue funcionando: se sincroniza el menú
    const luna = document.getElementById('dark-mode-btn');
    if (luna) luna.addEventListener('click', () => setTimeout(() => { const oscuro = document.body.classList.contains('dark-mode'); guardar(LS_TEMA, oscuro ? 'oscuro' : ''); TEMAS.forEach((t) => t.id && t.id !== 'oscuro' && document.body.classList.remove('tema-' + t.id)); menu.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.t === (oscuro ? 'oscuro' : ''))); }, 30));
    aplicarTema(leer(LS_TEMA, null) != null ? leer(LS_TEMA, '') : (document.body.classList.contains('dark-mode') ? 'oscuro' : ''));
  }

  // ------------------------------------------------------------------ efectos
  function ondaEnBoton(e) {
    const b = e.target.closest && e.target.closest('.btn-primary, .btn-secondary'); if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), o = document.createElement('span');
    o.className = 'vp-ripple'; o.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(o); setTimeout(() => o.remove(), 650);
  }
  function confeti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'); cv.id = 'vp-confeti'; cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const ctx = cv.getContext('2d'), col = ['#38bdf8', '#f59e0b', '#22c55e', '#f472b6', '#a78bfa'];
    const p = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, w: 6 + Math.random() * 8, h: 8 + Math.random() * 10, vx: Math.random() * 4 - 2, vy: 2 + Math.random() * 4, r: Math.random() * 6, vr: Math.random() * .3 - .15, c: col[(Math.random() * col.length) | 0] }));
    const t0 = Date.now();
    (function f() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      p.forEach((q) => { q.x += q.vx; q.y += q.vy; q.r += q.vr; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.c; ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); ctx.restore(); });
      if (Date.now() - t0 < 3500) requestAnimationFrame(f); else cv.remove();
    })();
  }

  // ------------------------------------------------------------------ configuración
  function describir(cfg) {
    const mat = (MATERIAS.find((m) => m.id === (A && A.modulo)) || {}).label || '';
    let area = 'Todas las unidades';
    if (cfg.alcance === 'parcial_1' || cfg.alcance === 'parcial_2') { const p = (A.parciales() || []).find((x) => x.modo === cfg.alcance); area = p ? p.label : cfg.alcance; }
    else if (cfg.alcance === 'up') { const u = (A.unidades() || []).find((x) => String(x.id) === String(cfg.up)); area = u ? (u.label || ('UP ' + u.id)) : ('UP ' + cfg.up); }
    else if (cfg.alcance === 'errores') area = 'Mis errores';
    return [mat, area, cfg.cantidad + ' preguntas', cfg.tiempo ? cfg.tiempo + ' s' : ''].filter(Boolean).join(' · ');
  }
  const modoPool = (cfg) => (cfg.alcance === 'up' ? 'up_especifica' : cfg.alcance === 'todas' ? 'final' : cfg.alcance);

  function pedirConfig(op) {
    op = op || {};
    return new Promise((resolver) => {
      const guardada = leer(LS_CFG, {});
      const cfg = Object.assign({ alcance: 'todas', up: null, cantidad: 10, tiempo: 20, modoDuelo: 'normal', estilo: op.estilo || 'practica' }, guardada);
      if (op.estilo) cfg.estilo = op.estilo;
      const unidades = A.unidades() || [], parciales = A.parciales() || [], nErr = listarErrores().length;
      if (!cfg.up && unidades[0]) cfg.up = unidades[0].id;
      if (cfg.alcance === 'errores' && op.tipo === 'online') cfg.alcance = 'todas';
      const ov = document.createElement('div'); ov.className = 'vp-overlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
      const chip = (grupo, val, txt) => '<button type="button" class="vp-chip" data-g="' + grupo + '" data-v="' + esc(val) + '">' + txt + '</button>';
      const alcances = [chip('alcance', 'todas', '🌐 Todas las unidades')]
        .concat(parciales.map((p) => chip('alcance', p.modo, '📚 ' + esc(p.label))))
        .concat([chip('alcance', 'up', '🎯 Una unidad')])
        .concat(op.tipo === 'solo' ? [chip('alcance', 'errores', '🧠 Mis errores (' + nErr + ')')] : []);
      const estilos = op.tipo === 'solo' && !op.sinEstilos ? '<div class="vp-campo"><label>Cómo querés jugar</label><div class="vp-estilos">' +
        Object.keys(ESTILOS).filter((k) => !op.estilosPermitidos || op.estilosPermitidos.includes(k)).map((k) => '<button type="button" class="vp-estilo" data-g="estilo" data-v="' + k + '"><b>' + ESTILOS[k].ico + ' ' + ESTILOS[k].nombre + '</b><span>' + ESTILOS[k].desc + '</span></button>').join('') + '</div></div>' : '';
      ov.innerHTML = '<div class="vp-modal"><h2>' + esc(op.titulo || 'Configurá el duelo') + '</h2><div class="vp-sub">' + esc(op.subtitulo || 'Elegí qué áreas querés practicar.') + '</div>' + estilos +
        '<div class="vp-campo"><label>Área a responder</label><div class="vp-chips">' + alcances.join('') + '</div><select id="vp-up" aria-label="Unidad">' + unidades.map((u) => '<option value="' + esc(u.id) + '">' + esc(u.label || ('UP ' + u.id)) + '</option>').join('') + '</select></div>' +
        '<div class="vp-campo"><label>Cantidad de preguntas</label><div class="vp-chips">' + [5, 10, 15, 20, 30].map((n) => chip('cantidad', n, n)).join('') + '</div></div>' +
        '<div class="vp-campo" id="vp-c-tiempo"><label>Tiempo por pregunta</label><div class="vp-chips">' + [15, 20, 30, 45, 60].map((n) => chip('tiempo', n, n + ' s')).join('') + '</div></div>' +
        (op.tipo === 'online' ? '<div class="vp-campo"><label>Modo del duelo</label><div class="vp-chips">' + chip('modoDuelo', 'normal', '⚔️ Normal') + chip('modoDuelo', 'muerte_subita', '💀 Muerte súbita') + '</div></div>' : '') +
        '<div class="vp-acciones"><button type="button" class="btn-secondary" data-a="no">Cancelar</button><button type="button" class="btn-primary" data-a="ok">' + esc(op.boton || 'Empezar') + '</button></div></div>';
      document.body.appendChild(ov);
      const pintar = () => {
        ov.querySelectorAll('[data-g]').forEach((b) => { const g = b.dataset.g; b.classList.toggle('on', String(cfg[g]) === String(b.dataset.v)); });
        $('#vp-up', ov).style.display = cfg.alcance === 'up' ? 'block' : 'none'; $('#vp-up', ov).value = cfg.up;
        const sinTiempo = op.tipo === 'solo' && (cfg.estilo === 'practica' || cfg.estilo === 'relampago');
        $('#vp-c-tiempo', ov).style.display = sinTiempo ? 'none' : 'block';
        const cantEstilo = op.tipo === 'solo' && (cfg.estilo === 'relampago' || cfg.estilo === 'supervivencia');
        const cant = ov.querySelectorAll('[data-g="cantidad"]'); cant.forEach((b) => { b.parentElement.parentElement.style.display = cantEstilo ? 'none' : 'block'; });
      };
      const cerrar = (r) => { ov.remove(); document.removeEventListener('keydown', teclas); resolver(r); };
      const teclas = (e) => { if (e.key === 'Escape') cerrar(null); };
      document.addEventListener('keydown', teclas);
      ov.addEventListener('click', (e) => {
        if (e.target === ov) return cerrar(null);
        const b = e.target.closest('[data-g]');
        if (b) { const g = b.dataset.g; cfg[g] = (g === 'cantidad' || g === 'tiempo') ? Number(b.dataset.v) : b.dataset.v; SONIDO('click'); return pintar(); }
        const a = e.target.closest('[data-a]'); if (!a) return;
        if (a.dataset.a === 'no') return cerrar(null);
        if (cfg.alcance === 'errores' && !nErr) return aviso('Todavía no tenés errores guardados: ¡buena señal!');
        guardar(LS_CFG, Object.assign({}, cfg, { alcance: cfg.alcance === 'errores' ? 'todas' : cfg.alcance }));
        cerrar(Object.assign({}, cfg));
      });
      $('#vp-up', ov).addEventListener('change', (e) => { cfg.up = e.target.value; });
      pintar();
    });
  }

  // ------------------------------------------------------------------ entrenamiento en solitario
  function vistaSolo() {
    let v = document.getElementById('view-solo'); if (v) return v;
    v = document.createElement('section'); v.id = 'view-solo'; v.className = 'view';
    document.querySelector('main.container').appendChild(v);
    return v;
  }
  const parar = () => { if (solo && solo.timer) { clearInterval(solo.timer); solo.timer = null; } };

  function armarVF(q) {
    const correcta = q.opciones.find((o) => o.correcta), falsas = q.opciones.filter((o) => !o.correcta);
    const mostrarCorrecta = !falsas.length || Math.random() < 0.5;
    const op = mostrarCorrecta ? correcta : barajar(falsas)[0];
    return { id: q.id + '_vf', baseId: q.id, up: q.up, pregunta: q.pregunta, propuesta: op.texto, esVerdadera: !!mostrarCorrecta, justificacion: q.justificacion, opciones: q.opciones };
  }

  async function iniciarSolo(cfg) {
    parar();
    SONIDO('click');
    let pool;
    try {
      if (cfg.alcance === 'errores') pool = listarErrores();
      else pool = await A.pool({ modo: modoPool(cfg), up: cfg.up });
    } catch (e) { return aviso((e && e.message) || 'No se pudieron cargar las preguntas.'); }
    pool = (pool || []).filter((q) => q && q.opciones && q.opciones.some((o) => o.correcta) && q.opciones.length >= 2);
    if (!pool.length) return aviso('No hay preguntas disponibles para esa selección.');
    const est = cfg.estilo;
    const n = est === 'relampago' || est === 'supervivencia' ? Math.min(pool.length, 200) : Math.min(pool.length, cfg.cantidad || 10);
    let cola = barajar(pool).slice(0, n);
    if (est === 'vf') cola = cola.map(armarVF);
    solo = { cfg, est, cola, i: 0, aciertos: 0, fallos: [], racha: 0, mejor: 0, vidas: 3, inicio: Date.now(), tiempoTotal: 0, restante: 0, respondida: false, pregInicio: 0, elecciones: {} };
    if (est === 'relampago') solo.restante = 60;
    if (est === 'examen') solo.restante = (cfg.tiempo || 30) * cola.length;
    vistaSolo();
    A.mostrarVista('view-solo');
    pintarSolo();
    arrancarReloj();
  }

  function arrancarReloj() {
    parar();
    const est = solo.est;
    solo.ultimo = Date.now();
    solo.timer = setInterval(() => {
      if (!solo) return;
      const ahora = Date.now(), dt = (ahora - solo.ultimo) / 1000; solo.ultimo = ahora;
      if (est === 'relampago' || est === 'examen') {
        solo.restante = Math.max(0, solo.restante - dt); pintarTiempo();
        if (solo.restante <= 0) return terminarSolo();
      } else if ((est === 'supervivencia' || est === 'vf') && !solo.respondida) {
        const lim = est === 'vf' ? 12 : (solo.cfg.tiempo || 20), usado = (ahora - solo.pregInicio) / 1000;
        pintarTiempo(Math.max(0, lim - usado), lim);
        if (usado >= lim) responder(null);
      }
    }, 250);
  }

  function pintarTiempo(rest, lim) {
    const t = $('#vp-tiempo'), barra = $('#vp-barra'); if (!t || !solo) return;
    const est = solo.est;
    if (est === 'relampago' || est === 'examen') { const s = Math.ceil(solo.restante); t.textContent = '⏱️ ' + (est === 'examen' ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : s + 's'); t.classList.toggle('urgent', s <= 10); }
    else if (rest != null) { t.textContent = '⏱️ ' + Math.ceil(rest) + 's'; t.classList.toggle('urgent', rest <= 5); if (barra) barra.style.width = (rest / lim * 100) + '%'; }
  }

  function pintarSolo() {
    parar();
    const v = vistaSolo(), s = solo, q = s.cola[s.i], est = s.est;
    if (!q) return terminarSolo();
    s.respondida = false; s.pregInicio = Date.now();
    const info = ESTILOS[est];
    const total = est === 'relampago' || est === 'supervivencia' ? null : s.cola.length;
    const vidas = est === 'supervivencia' ? '<span class="vp-vidas">' + '❤️'.repeat(s.vidas) + '🖤'.repeat(3 - s.vidas) + '</span>' : '';
    const tiempo = (est === 'practica') ? '' : '<span id="vp-tiempo" class="vp-tag">⏱️</span>';
    const barraT = (est === 'supervivencia' || est === 'vf') ? '<div class="timer-bar-wrap"><div class="timer-bar-fill" id="vp-barra" style="width:100%;transition:width .25s linear"></div></div>' : '';
    const texto = est === 'vf' ? '<div class="vp-propuesta">Respuesta propuesta: «' + esc(q.propuesta) + '»</div>' : '';
    let cuerpo;
    if (est === 'vf') cuerpo = '<div class="vp-vf"><button type="button" data-r="v">✅ Verdadero</button><button type="button" data-r="f">❌ Falso</button></div>';
    else cuerpo = '<div class="options-grid" id="vp-opciones">' + barajar(q.opciones).map((o) => '<button class="option-btn" data-o="' + esc(o.id) + '"><strong style="color:var(--nika-primary);margin-right:8px">' + esc(String(o.id).toUpperCase()) + ')</strong> ' + esc(o.texto) + '</button>').join('') + '</div>';
    v.innerHTML = '<div class="vp-solo-top"><span class="vp-tag">' + info.ico + ' ' + info.nombre + (s.cfg.alcance === 'errores' ? ' · Mis errores' : '') + '</span>' + vidas +
      '<span class="vp-tag" id="vp-prog">' + (total ? 'Pregunta ' + (s.i + 1) + ' de ' + total : '✔ ' + s.aciertos + ' aciertos') + '</span>' + (s.racha >= 2 ? '<span class="vp-racha vp-pop">🔥 ' + s.racha + ' seguidas</span>' : '') + tiempo + '</div>' +
      (total ? '<div class="vp-progreso"><i style="width:' + (s.i / total * 100) + '%"></i></div>' : '') + barraT +
      '<div class="question-card"><div class="question-text">' + esc(q.pregunta) + '</div>' + texto + cuerpo + '<div id="vp-fb"></div></div>' +
      '<div class="form-inline"><button class="btn-secondary" data-x="salir">Salir</button></div>';
    v.onclick = (e) => {
      const salir = e.target.closest('[data-x="salir"]'); if (salir) { parar(); solo = null; return A.mostrarVista('view-selector'); }
      const sig = e.target.closest('[data-x="sig"]'); if (sig) return siguiente();
      const o = e.target.closest('[data-o]'); if (o && !solo.respondida) return responder(o.dataset.o);
      const r = e.target.closest('[data-r]'); if (r && !solo.respondida) return responder(r.dataset.r);
    };
    arrancarReloj(); pintarTiempo();
  }

  function responder(eleccion) {
    const s = solo; if (!s || s.respondida) return;
    s.respondida = true;
    const q = s.cola[s.i], est = s.est;
    let acierto;
    if (est === 'vf') acierto = eleccion != null && ((eleccion === 'v') === q.esVerdadera);
    else { const c = q.opciones.find((o) => o.correcta); acierto = !!eleccion && !!c && c.id === eleccion; }
    s.elecciones[q.id] = eleccion;
    const base = est === 'vf' ? { id: q.baseId, up: q.up, pregunta: q.pregunta, opciones: q.opciones, justificacion: q.justificacion } : q;
    if (acierto) { s.aciertos++; s.racha++; s.mejor = Math.max(s.mejor, s.racha); if (s.cfg.alcance === 'errores') resolverError(base.id); }
    else { s.racha = 0; s.fallos.push({ q: base, eleccion, vf: est === 'vf' ? q : null }); registrarError(base); if (est === 'supervivencia') s.vidas--; if (est === 'relampago') s.restante = Math.max(0, s.restante - 3); }
    SONIDO(acierto ? 'success' : 'alert');
    // marcas visuales
    const c = q.opciones.find((o) => o.correcta);
    if (est === 'vf') {
      document.querySelectorAll('.vp-vf button').forEach((b) => { b.disabled = true; const dice = b.dataset.r === 'v'; if (dice === q.esVerdadera) b.classList.add('correct'); else if (b.dataset.r === eleccion) b.classList.add('incorrect'); });
    } else {
      document.querySelectorAll('#vp-opciones .option-btn').forEach((b) => {
        b.disabled = true;
        if (est === 'examen') { if (b.dataset.o === eleccion) b.classList.add('elegida'); return; }
        if (c && b.dataset.o === c.id) b.classList.add('correct'); else if (b.dataset.o === eleccion) b.classList.add('incorrect');
      });
    }
    const fb = $('#vp-fb');
    if (est === 'practica' || est === 'vf' || est === 'supervivencia') {
      const just = sinScripts(q.justificacion);
      const veredicto = est === 'vf' ? (q.esVerdadera ? 'Era VERDADERO: esa es la opción correcta.' : 'Era FALSO. La correcta: «' + esc(c ? c.texto : '') + '»') : (acierto ? '¡Correcto!' : 'La correcta era: «' + esc(c ? c.texto : '') + '»');
      fb.innerHTML = '<div class="vp-feedback ' + (acierto ? 'ok' : 'mal') + '"><h4>' + (acierto ? '✅ ' : (eleccion ? '❌ ' : '⌛ ')) + veredicto + '</h4>' + (just ? '<div>' + just + '</div>' : '') + '</div><div class="form-inline"><button class="btn-primary" data-x="sig">' + (s.i + 1 >= s.cola.length || (est === 'supervivencia' && s.vidas <= 0) ? 'Ver resultado →' : 'Siguiente →') + '</button></div>';
      if (just) { const f = $('.vp-feedback', fb); f.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    }
    parar();
    if (est === 'examen' || est === 'relampago') { setTimeout(siguiente, est === 'relampago' ? 650 : 350); arrancarReloj(); }
  }

  function siguiente() {
    const s = solo; if (!s) return;
    if (s.est === 'supervivencia' && s.vidas <= 0) return terminarSolo();
    s.i++;
    if (s.i >= s.cola.length) return terminarSolo();
    pintarSolo();
  }

  function terminarSolo() {
    const s = solo; if (!s) return; parar();
    const n = Math.max(1, s.est === 'relampago' || s.est === 'supervivencia' ? (s.aciertos + s.fallos.length) : s.cola.length);
    const pct = Math.round(s.aciertos / n * 100), seg = Math.round((Date.now() - s.inicio) / 1000);
    const v = vistaSolo();
    const respondidas = s.aciertos + s.fallos.length;
    const titulo = s.est === 'supervivencia' ? (s.mejor + ' seguidas') : s.est === 'relampago' ? (s.aciertos + ' aciertos') : pct + '%';
    const subt = pct >= 80 ? '¡Excelente nivel! 🏆' : pct >= 60 ? 'Bien, pero se puede mejorar 💪' : 'Buen entrenamiento: repasá tus errores 📚';
    v.innerHTML = '<div class="vp-resumen"><div class="vp-gran vp-pop">' + esc(titulo) + '</div><p style="color:var(--text-muted);margin-top:6px">' + subt + '</p>' +
      '<div class="vp-kpis"><div class="vp-kpi"><b>' + s.aciertos + '/' + respondidas + '</b><span>Aciertos</span></div><div class="vp-kpi"><b>' + pct + '%</b><span>Efectividad</span></div><div class="vp-kpi"><b>' + s.mejor + '</b><span>Mejor racha</span></div><div class="vp-kpi"><b>' + Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0') + '</b><span>Tiempo</span></div></div>' +
      '<div class="result-actions"><button class="btn-primary" data-x="again">🔁 Jugar de nuevo</button>' + (s.fallos.length ? '<button class="btn-primary" style="background:var(--nika-accent)" data-x="err">🧠 Repasar mis errores</button>' : '') + '<button class="btn-secondary" data-x="salir">Salir</button></div>' +
      (s.fallos.length ? '<h3 style="margin-top:26px">Lo que fallaste</h3><div class="vp-lista">' + s.fallos.map((f) => { const c = f.q.opciones.find((o) => o.correcta); return '<details class="vp-item"><summary>' + esc(f.q.pregunta) + '</summary><div class="vp-resp">✔ ' + esc(c ? c.texto : '') + '</div>' + (f.q.justificacion ? '<div style="margin-top:8px">' + sinScripts(f.q.justificacion) + '</div>' : '') + '</details>'; }).join('') + '</div>' : '') + '</div>';
    v.onclick = (e) => {
      const x = e.target.closest('[data-x]'); if (!x) return;
      if (x.dataset.x === 'salir') { solo = null; return A.mostrarVista('view-selector'); }
      if (x.dataset.x === 'again') return iniciarSolo(s.cfg);
      if (x.dataset.x === 'err') return iniciarSolo(Object.assign({}, s.cfg, { alcance: 'errores', estilo: 'practica' }));
    };
    A.mostrarVista('view-solo');
    SONIDO(pct >= 60 ? 'victory' : 'alert');
    if (pct >= 80) confeti();
  }

  // ------------------------------------------------------------------ historial de duelos y errores
  async function mostrarHistorial() {
    let v = document.getElementById('view-historial');
    if (!v) { v = document.createElement('section'); v.id = 'view-historial'; v.className = 'view'; document.querySelector('main.container').appendChild(v); }
    const yo = usuario(), nErr = listarErrores().length;
    v.innerHTML = '<div class="view-header"><h1>📊 Mi historial</h1><p>Tus duelos, tu nivel y las preguntas que más te cuestan</p></div><div id="vp-h-kpis" class="vp-kpis"></div><div class="result-actions" style="margin:6px 0 18px"><button class="btn-primary" data-x="err">🧠 Practicar mis errores (' + nErr + ')</button>' + (nErr ? '<button class="btn-secondary" data-x="limpiar">Borrar errores</button>' : '') + '<button class="btn-secondary" data-x="volver">← Volver</button></div><h3 style="margin:10px 0 10px">Últimos duelos</h3><div id="vp-h-lista"><p style="color:var(--text-muted)">Cargando…</p></div>';
    A.mostrarVista('view-historial');
    v.onclick = (e) => {
      const x = e.target.closest('[data-x]'); if (!x) return;
      if (x.dataset.x === 'volver') return A.mostrarVista('view-selector');
      if (x.dataset.x === 'limpiar') { if (confirm('¿Borrar tu lista de errores guardados?')) { limpiarErrores(); mostrarHistorial(); } return; }
      if (x.dataset.x === 'err') { if (!nErr) return aviso('Todavía no tenés errores guardados: ¡buena señal!'); pedirConfig({ tipo: 'solo', estilo: 'practica', titulo: 'Practicar mis errores', boton: 'Empezar', estilosPermitidos: ['practica', 'examen', 'supervivencia'] }).then((cfg) => { if (cfg) iniciarSolo(Object.assign({}, cfg, { alcance: 'errores' })); }); }
    };
    try {
      const c = window.NikaSupabase.client;
      const [pl, hi] = await Promise.all([
        c.from('versus_players').select('elo, rango, wins, losses, win_streak, best_streak').eq('username', yo).maybeSingle(),
        c.from('versus_history').select('*').or('player_a.eq.' + yo + ',player_b.eq.' + yo).order('played_at', { ascending: false }).limit(15),
      ]);
      const p = pl && pl.data;
      $('#vp-h-kpis', v).innerHTML = p ? [['ELO', p.elo], ['Rango', p.rango || '—'], ['Victorias', p.wins], ['Derrotas', p.losses], ['Racha', p.win_streak], ['Mejor racha', p.best_streak]].map((k) => '<div class="vp-kpi"><b>' + esc(k[1] == null ? '—' : k[1]) + '</b><span>' + k[0] + '</span></div>').join('') : '';
      const filas = (hi && hi.data) || [];
      $('#vp-h-lista', v).innerHTML = filas.length ? filas.map((h) => {
        const soyA = String(h.player_a).toLowerCase() === yo.toLowerCase(), rival = soyA ? h.player_b : h.player_a, mio = soyA ? h.score_a : h.score_b, suyo = soyA ? h.score_b : h.score_a, elo = soyA ? h.elo_change_a : h.elo_change_b;
        const gane = h.winner_username && String(h.winner_username).toLowerCase() === yo.toLowerCase();
        return '<div class="vp-hist-row"><div><b class="' + (gane ? 'g' : 'p') + '">' + (h.winner_username ? (gane ? 'Victoria' : 'Derrota') : 'Cancelado') + '</b> vs @' + esc(rival) + '<small>' + esc(h.tema || '') + ' · ' + new Date(h.played_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) + '</small></div><div><b>' + mio + ' - ' + suyo + '</b><small>' + (typeof elo === 'number' ? 'ELO ' + (elo > 0 ? '+' : '') + elo : '') + '</small></div></div>';
      }).join('') : '<p style="color:var(--text-muted)">Todavía no jugaste duelos online. ¡Desafiá a un amigo!</p>';
    } catch (e) { $('#vp-h-lista', v).innerHTML = '<p style="color:var(--text-muted)">No se pudo cargar el historial ahora.</p>'; }
  }

  // ------------------------------------------------------------------ selector: materia + entrenamiento
  function refrescarInsignias() {
    const n = listarErrores().length, b = $('#vp-card-hist .vp-badge'); if (b) { b.textContent = n; b.style.display = n ? 'block' : 'none'; }
  }
  function montarSelector() {
    const sel = document.getElementById('view-selector'); if (!sel || $('.vp-materias', sel)) return;
    const head = $('.view-header', sel);
    const mat = document.createElement('div'); mat.className = 'vp-materias';
    mat.innerHTML = MATERIAS.map((m) => '<a class="vp-chip' + (m.id === A.modulo ? ' on' : '') + '" href="versus.html?modulo=' + m.id + '">' + m.ico + ' ' + m.label + '</a>').join('');
    head.after(mat);
    const sec = document.createElement('div');
    sec.innerHTML = '<div class="vp-seccion"><h2>🧠 Entrenamiento en solitario</h2><p>Practicá a tu ritmo, jugá minijuegos y repasá lo que fallás</p></div><div class="mode-grid" id="vp-solo-grid">' +
      '<div class="mode-card" data-vp="practica"><div class="mode-icon">📘</div><h3>Modo práctica</h3><p>Con justificación después de cada pregunta.</p></div>' +
      '<div class="mode-card" data-vp="examen"><div class="mode-icon">📝</div><h3>Modo examen</h3><p>Contrarreloj y sin ayudas. Corregís al final.</p></div>' +
      '<div class="mode-card" data-vp="mini"><div class="mode-icon">⚡</div><h3>Minijuegos</h3><p>Relámpago, Supervivencia y Verdadero o Falso.</p></div>' +
      '<div class="mode-card" id="vp-card-hist" data-vp="hist" style="position:relative"><span class="vp-badge" style="display:none"></span><div class="mode-icon">📊</div><h3>Historial y errores</h3><p>Tus duelos, tu ELO y las preguntas que fallaste.</p></div></div>';
    sel.appendChild(sec);
    sec.addEventListener('click', async (e) => {
      const c = e.target.closest('[data-vp]'); if (!c) return;
      const k = c.dataset.vp;
      if (k === 'hist') return mostrarHistorial();
      if (k === 'mini') { const cfg = await pedirConfig({ tipo: 'solo', estilo: 'relampago', estilosPermitidos: ['relampago', 'supervivencia', 'vf'], titulo: 'Minijuegos', subtitulo: 'Elegí el juego y las áreas.', boton: 'Jugar' }); return cfg && iniciarSolo(cfg); }
      const cfg = await pedirConfig({ tipo: 'solo', estilo: k, estilosPermitidos: [k], titulo: ESTILOS[k].nombre, subtitulo: ESTILOS[k].desc, boton: 'Empezar', sinEstilos: true });
      if (cfg) iniciarSolo(Object.assign({}, cfg, { estilo: k }));
    });
    refrescarInsignias();
  }

  function init(adaptador) {
    A = adaptador;
    document.addEventListener('click', ondaEnBoton);
    montarMenuTemas();
    montarSelector();
  }

  window.NikaVersusPlus = { init, pedirConfig, describir, modoPool, iniciarSolo, registrarError, listarErrores, mostrarHistorial, confeti, aplicarTema };
})();
