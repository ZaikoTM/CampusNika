/* NikaPlay — sonidos sintetizados (WebAudio, sin archivos) y vibración. Se silencia con el botón del juego; la preferencia queda guardada.
   Todos los sonidos son cortos y de volumen bajo. No suena nada hasta que el usuario toca o escribe (política de los navegadores). */
(function () {
  'use strict';
  var NP = window.NikaPlay = window.NikaPlay || {}, KEY = 'nika_np_sonido', ctx = null, mudo = false;
  try { mudo = localStorage.getItem(KEY) === '0'; } catch (_) {}

  function ac() {
    if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { ctx = new A(); } catch (_) { return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) {} }
    return ctx;
  }
  /** Una nota: frecuencia, retraso (s), duración (s), onda, volumen, frecuencia final opcional (glissando). */
  function nota(f, t0, dur, tipo, vol, f2) {
    if (mudo) return; var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (t0 || 0);
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  function secuencia(fs, paso, dur, tipo, vol) { fs.forEach(function (f, i) { nota(f, i * paso, dur, tipo, vol); }); }
  function vib(p) { if (mudo) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (_) {} }

  // el navegador exige un gesto del usuario para activar el audio: se desbloquea con el primer toque o tecla de la página
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function f() { ac(); document.removeEventListener(ev, f, true); }, true); });

  NP.sonido = {
    esta: function () { return !mudo; },
    alternar: function () { mudo = !mudo; try { localStorage.setItem(KEY, mudo ? '0' : '1'); } catch (_) {} if (!mudo) this.clic(); return !mudo; },
    tecla: function () { nota(560 + Math.random() * 90, 0, 0.05, 'triangle', 0.09); },
    borrar: function () { nota(300, 0, 0.07, 'triangle', 0.08, 220); },
    clic: function () { nota(520, 0, 0.05, 'sine', 0.08); },
    voltea: function (i, res) {
      if (res === 'ok') nota(740 + i * 45, 0, 0.12, 'sine', 0.13);
      else if (res === 'pos') nota(520 + i * 20, 0, 0.1, 'triangle', 0.1);
      else nota(210, 0, 0.08, 'square', 0.045);
    },
    parcial: function () { nota(440, 0, 0.12, 'triangle', 0.12); nota(554, 0.09, 0.16, 'triangle', 0.12); vib(25); },
    error: function () { nota(190, 0, 0.3, 'sawtooth', 0.11, 70); nota(95, 0.02, 0.3, 'sine', 0.14); vib([60, 40, 70]); },
    acierto: function () { secuencia([523, 659, 784, 1047], 0.085, 0.2, 'sine', 0.15); vib(35); },
    racha: function (n) { var b = 700 + Math.min(n, 6) * 70; secuencia([b, b * 1.25, b * 1.5], 0.06, 0.14, 'triangle', 0.1); },
    pista: function () { nota(880, 0, 0.1, 'sine', 0.1); nota(1320, 0.09, 0.14, 'sine', 0.1); },
    tic: function (urgente) { nota(urgente ? 1250 : 900, 0, urgente ? 0.07 : 0.05, 'square', urgente ? 0.16 : 0.09); if (urgente) { nota(620, 0.09, 0.05, 'sine', 0.1); vib(15); } },
    desbloquear: function () { ac(); },
    victoria: function () { secuencia([523, 659, 784, 659, 784, 1047, 1319], 0.11, 0.24, 'triangle', 0.15); vib([40, 30, 40, 30, 90]); },
    derrota: function () { secuencia([392, 349, 311, 262], 0.17, 0.3, 'sine', 0.12); vib(80); }
  };
})();
