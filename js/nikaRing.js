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

  // Los navegadores solo dejan sonar audio después de un gesto del usuario: se "desbloquea" en el primer toque o tecla.
  function desbloquear() {
    try { if (!ctx && AC) ctx = new AC(); if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (_) {}
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
    bucle = setInterval(() => { if (!reclamar()) { stop(); return; } frase(); }, 3000);
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

  window.NikaRing = { start, stop: stopTodos, activo: () => activo, probar: () => { desbloquear(); frase(); } };
})();
