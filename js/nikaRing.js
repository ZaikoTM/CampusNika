// js/nikaRing.js — tono de llamada entrante de NikaMed (generado con Web Audio, sin archivos de audio).
// window.NikaRing.start(nombre) hace sonar una melodía en bucle, parpadea el título de la pestaña, vibra en el celular y
// (si ya diste el permiso) muestra una notificación del sistema. window.NikaRing.stop() lo detiene.
// Si hay varias pestañas abiertas suena solo en una (candado en localStorage). Se silencia con localStorage nika_ring_off = '1'.
(function () {
  'use strict';
  if (window.NikaRing) return;
  const K_LOCK = 'nika_ring_lock', K_OFF = 'nika_ring_off', K_VOL = 'nika_ring_vol';
  const id = Math.random().toString(36).slice(2);
  let ctx = null, bucle = null, tope = null, flash = null, tituloOrig = null, notif = null, activo = false;
  const AC = window.AudioContext || window.webkitAudioContext;

  // ---- Sonidos grabados (assets/audio/llamadas/todos.mp3): si cargan, reemplazan a los tonos sintetizados ----
  const MP3 = 'assets/audio/llamadas/todos.mp3';
  const MUESTRAS = {
    ring: [2.12, 5.95], calling: [6.96, 8.1], declined: [10.53, 11.7], hold: [13.27, 13.8], continue: [15.37, 15.8], start: [17.3, 18.85],
    hangup: [19.99, 20.58], knock: [22.0, 22.5], fail1: [24.37, 25.4], fail2: [26.72, 27.5], message: [29.4, 29.75], contact: [32.48, 32.97],
    voicenote: [34.85, 35.37], file: [37.54, 38.45], inquiry: [39.75, 40.35], online: [42.3, 43.95], offline: [45.42, 47.05],
    contactOnline: [47.86, 48.34], contactOffline: [48.61, 49.0], sent: [50.16, 50.7], voiceSent: [52.19, 52.47], fileOk: [54.41, 54.93],
    fileFail: [56.49, 57.92], joinGroup: [58.99, 60.85], leftGroup: [61.86, 62.52]
  };
  let muestras = null, cargandoMuestras = false;
  function cargarMuestras() {
    if (muestras || cargandoMuestras || !ctx) return;
    cargandoMuestras = true;
    fetch(MP3).then((r) => r.arrayBuffer()).then((a) => ctx.decodeAudioData(a)).then((b) => { muestras = b; }).catch(() => {}).then(() => { cargandoMuestras = false; });
  }
  function muestra(nombre, vol) {
    const m = MUESTRAS[nombre];
    if (!muestras || !m || !ctx || ctx.state !== 'running') return false;
    const s = ctx.createBufferSource(), g = ctx.createGain(), dur = m[1] - m[0];
    s.buffer = muestras; g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.setValueAtTime(vol, ctx.currentTime + Math.max(0, dur - 0.08)); g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur);
    s.connect(g); g.connect(ctx.destination); s.start(0, m[0], dur);
    return true;
  }
  const volGeneral = () => { try { const v = parseFloat(localStorage.getItem(K_VOL)); if (v >= 0 && v <= 1) return v; } catch (_) {} return 1; };

  // Los navegadores solo dejan sonar audio después de un gesto del usuario: se "desbloquea" en el primer toque o tecla.
  function desbloquear() {
    try { if (!ctx && AC) ctx = new AC(); if (ctx && ctx.state === 'suspended') ctx.resume(); cargarMuestras(); } catch (_) {}
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, desbloquear, { once: false, passive: true, capture: true }));

  function reclamar() {
    try {
      const o = JSON.parse(localStorage.getItem(K_LOCK) || 'null');
      if (o && o.id !== id && Date.now() - o.t < 4000) return false;
      localStorage.setItem(K_LOCK, JSON.stringify({ id, t: Date.now() }));
    } catch (_) {}
    return true;
  }

  function nota(f, t0, dur, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2; g2.gain.value = 0.22;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ctx.destination);
    o.start(t0); o2.start(t0); o.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
  }
  // Melodía alegre y reconocible de "te están llamando": dos frases cortas y una pausa
  function frase() {
    if (!ctx || ctx.state !== 'running') { desbloquear(); return; }
    if (muestra('ring', 0.9 * volGeneral())) return;
    let vol = 0.2; try { const v = parseFloat(localStorage.getItem(K_VOL)); if (v >= 0 && v <= 1) vol = 0.28 * v; } catch (_) {}
    const t = ctx.currentTime + 0.05;
    const M = [[784, 0, 0.16], [988, 0.14, 0.16], [1175, 0.28, 0.16], [988, 0.42, 0.14], [1319, 0.58, 0.34],
               [1175, 1.0, 0.16], [988, 1.14, 0.16], [784, 1.28, 0.16], [988, 1.42, 0.14], [1175, 1.58, 0.4]];
    M.forEach((n) => nota(n[0], t + n[1], n[2] + 0.12, vol));
  }

  function titulo(nombre) {
    tituloOrig = document.title; let on = false;
    flash = setInterval(() => { on = !on; document.title = on ? '📞 ' + nombre + ' te está llamando…' : tituloOrig; }, 900);
  }

  function start(nombre) {
    nombre = String(nombre || 'Alguien');
    stop();
    try { if (localStorage.getItem(K_OFF) === '1') return false; } catch (_) {}
    if (!reclamar()) return false;
    activo = true;
    desbloquear();
    frase();
    bucle = setInterval(() => { if (!reclamar()) { stop(); return; } frase(); }, 4200);
    tope = setTimeout(stop, 45000);
    titulo(nombre);
    try { if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]); } catch (_) {}
    try {
      if (window.Notification && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
        notif = new Notification('📞 ' + nombre + ' te está llamando', { body: 'Abrí NikaMed para atender la llamada.', tag: 'nika-llamada', requireInteraction: true, icon: 'assets/icons/favicon-32.png' });
        notif.onclick = () => { try { window.focus(); } catch (_) {} stop(); };
      }
    } catch (_) {}
    return true;
  }

  function stop() {
    clearInterval(bucle); clearTimeout(tope); clearInterval(flash); bucle = tope = flash = null;
    if (tituloOrig != null) { document.title = tituloOrig; tituloOrig = null; }
    try { if (notif) notif.close(); } catch (_) {} notif = null;
    try { if (navigator.vibrate) navigator.vibrate(0); } catch (_) {}
    activo = false;
  }

  // Si otra pestaña atendió o rechazó, la señal por BroadcastChannel apaga el sonido en todas
  try { const bc = new BroadcastChannel('nika-ring'); bc.onmessage = (e) => { if (e.data === 'stop') stop(); }; window.NikaRingBC = bc; } catch (_) {}
  const stopTodos = () => { stop(); try { if (window.NikaRingBC) window.NikaRingBC.postMessage('stop'); } catch (_) {} };

  // ---- Efectos de la llamada (originales, sintetizados): sonidos cortos para cada evento ----
  const EFECTOS = {
    unirse:  [[659, 0, .12], [880, .1, .2]],                       // alguien entra a la llamada (sube)
    salir:   [[880, 0, .12], [587, .1, .22]],                      // alguien sale (baja)
    colgar:  [[659, 0, .14], [494, .13, .14], [392, .26, .3]],     // cortaste la llamada
    error:   [[311, 0, .22], [233, .26, .38]],                     // la llamada no se pudo hacer
    mensaje: [[1047, 0, .09], [1319, .1, .16]],                    // mensaje nuevo
    conectado: [[784, 0, .09], [1047, .09, .14]],                  // un contacto se conectó
    desconectado: [[1047, 0, .09], [784, .09, .16]],               // un contacto se desconectó
    rechazada: [[392, 0, .16], [311, .17, .16], [262, .34, .34]]   // te rechazaron la llamada
  };
  function efecto(nombre) {
    try {
      if (localStorage.getItem(K_OFF) === '1') return;
      desbloquear(); if (!ctx || ctx.state !== 'running') return;
      const mapa = { unirse: 'joinGroup', salir: 'leftGroup', colgar: 'hangup', error: 'fail1', mensaje: 'message', conectado: 'contactOnline', desconectado: 'contactOffline', rechazada: 'declined', iniciar: 'start', timbre: 'knock', archivo: 'file', enviado: 'sent' };
      if (mapa[nombre] && muestra(mapa[nombre], 0.9 * volGeneral())) return;
      const e = EFECTOS[nombre]; if (!e) return;
      let vol = 0.18; try { const v = parseFloat(localStorage.getItem(K_VOL)); if (v >= 0 && v <= 1) vol = 0.24 * v; } catch (_) {}
      const t = ctx.currentTime + 0.02;
      e.forEach((n) => nota(n[0], t + n[1], n[2] + 0.1, vol));
    } catch (_) {}
  }
  // Tono de "llamando…" para quien llama: suena hasta que atienden, rechazan o pasan 40 s
  let tonoLlamando = null, tonoTope = null;
  function llamando(on) {
    clearInterval(tonoLlamando); clearTimeout(tonoTope); tonoLlamando = tonoTope = null;
    if (!on) return;
    try { if (localStorage.getItem(K_OFF) === '1') return; } catch (_) {}
    const toque = () => { desbloquear(); if (muestra('calling', 0.9 * volGeneral())) return; if (ctx && ctx.state === 'running') { const t = ctx.currentTime + 0.02; [0, 0.45].forEach((d) => { nota(440, t + d, 0.3, 0.1); nota(480, t + d, 0.3, 0.1); }); } };
    toque(); tonoLlamando = setInterval(toque, 3000); tonoTope = setTimeout(() => llamando(false), 40000);
  }

  window.NikaRing = { start, stop: stopTodos, activo: () => activo, probar: () => { desbloquear(); frase(); }, efecto, llamando };
})();
