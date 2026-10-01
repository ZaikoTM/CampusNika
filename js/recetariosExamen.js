// js/recetariosExamen.js
// CAMPUS NIKA — Modo examen de Recetarios y Certificados: reloj regresivo, alertas, sonidos y avisos.
//
//  • El tiempo se calcula contra un instante de fin (Date.now()), no contando ticks: si la pestaña se
//    ralentiza, el reloj no se atrasa.
//  • Alertas por umbrales (mitad del tiempo, 5 min, 2 min, 1 min, 30 s) + cuenta regresiva de los
//    últimos 10 s, cada una con aviso en pantalla, sonido y vibración (si el dispositivo la tiene).
//  • Los sonidos se sintetizan con Web Audio (sin archivos). Se pueden silenciar y se recuerda la preferencia.
//  • Respeta prefers-reduced-motion (el CSS apaga las animaciones) y no depende de permisos del navegador.
//
// API: RecetariosExamen.iniciar({ segundos, onFin, contenedor }) · detener() · tiempoUsado() · sonido(nombre)

const RecetariosExamen = (() => {
  const LS_SONIDO = 'nika_recetarios_sonido';
  let audio = null, silencio = false, intervalo = null, fin = 0, total = 0, activo = false, onFinCb = null;
  let avisados = new Set(), ultimoSeg = -1, barra = null, tituloOriginal = '', t0 = 0, contenedorAviso = null;
  try { silencio = localStorage.getItem(LS_SONIDO) === '0'; } catch (_) {}

  // ------------------------------------------------------------------ sonido (Web Audio)
  function ctxAudio() {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { audio = null; } }
    if (audio && audio.state === 'suspended') audio.resume().catch(() => {});
    return audio;
  }
  // nota: frecuencia (Hz), duración (s), retraso (s), forma de onda, volumen
  function nota(freq, dur, delay = 0, tipo = 'sine', vol = 0.13) {
    if (silencio) return;
    const a = ctxAudio(); if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = tipo; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  const SONIDOS = {
    inicio: () => { nota(523, 0.16, 0); nota(659, 0.16, 0.14); nota(784, 0.28, 0.28); },
    aviso: () => { nota(880, 0.14, 0, 'triangle'); nota(880, 0.14, 0.22, 'triangle'); },
    urgente: () => { nota(988, 0.12, 0, 'square', 0.09); nota(988, 0.12, 0.17, 'square', 0.09); nota(988, 0.12, 0.34, 'square', 0.09); },
    tick: () => nota(1200, 0.06, 0, 'square', 0.06),
    fin: () => { nota(880, 0.22, 0, 'sawtooth', 0.1); nota(660, 0.22, 0.24, 'sawtooth', 0.1); nota(440, 0.5, 0.48, 'sawtooth', 0.1); },
    entrega: () => { nota(660, 0.12, 0); nota(880, 0.2, 0.12); },
    ok: () => { [523, 659, 784, 1047].forEach((f, i) => nota(f, 0.2, i * 0.11)); },
    mal: () => { nota(392, 0.22, 0, 'triangle'); nota(330, 0.4, 0.2, 'triangle'); },
    alerta: () => { nota(300, 0.18, 0, 'sawtooth', 0.1); nota(240, 0.3, 0.18, 'sawtooth', 0.1); },
  };
  function sonido(nombre) { try { if (SONIDOS[nombre]) SONIDOS[nombre](); } catch (_) {} }
  function vibrar(patron) { try { if (!silencio && navigator.vibrate) navigator.vibrate(patron); } catch (_) {} }
  function alternarSonido() {
    silencio = !silencio;
    try { localStorage.setItem(LS_SONIDO, silencio ? '0' : '1'); } catch (_) {}
    if (barra) { const b = barra.querySelector('[data-snd]'); if (b) { b.textContent = silencio ? '🔕' : '🔔'; b.title = silencio ? 'Activar sonidos' : 'Silenciar sonidos'; } }
    if (!silencio) sonido('aviso');
    return silencio;
  }

  // ------------------------------------------------------------------ avisos en pantalla
  function aviso(texto, tipo = 'info', ms = 3800) {
    if (!contenedorAviso) {
      contenedorAviso = document.createElement('div'); contenedorAviso.className = 'rz-avisos'; contenedorAviso.setAttribute('aria-live', 'assertive');
      document.body.appendChild(contenedorAviso);
    }
    const n = document.createElement('div'); n.className = 'rz-aviso-t ' + tipo; n.textContent = texto;
    contenedorAviso.appendChild(n);
    requestAnimationFrame(() => n.classList.add('on'));
    setTimeout(() => { n.classList.remove('on'); setTimeout(() => n.remove(), 400); }, ms);
  }

  // ------------------------------------------------------------------ reloj
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  function crearBarra(contenedor) {
    const d = document.createElement('div');
    d.className = 'rz-reloj ok'; d.setAttribute('role', 'timer');
    d.innerHTML = `<div class="rz-reloj-in">
      <span class="rz-reloj-ico" aria-hidden="true">⏱️</span>
      <div class="rz-reloj-txt"><small>Tiempo restante</small><b data-t>${fmt(total)}</b></div>
      <div class="rz-reloj-bar" aria-hidden="true"><i data-bar style="width:100%"></i></div>
      <span class="rz-reloj-modo">🏁 MODO EXAMEN</span>
      <button type="button" class="rz-reloj-snd" data-snd title="${silencio ? 'Activar sonidos' : 'Silenciar sonidos'}" aria-label="Activar o silenciar sonidos">${silencio ? '🔕' : '🔔'}</button>
    </div>`;
    d.querySelector('[data-snd]').addEventListener('click', alternarSonido);
    contenedor.insertBefore(d, contenedor.firstChild);
    return d;
  }

  const UMBRALES = [
    { s: 300, tipo: 'aviso', txt: '⏰ Quedan 5 minutos' },
    { s: 120, tipo: 'aviso', txt: '⏰ Quedan 2 minutos: andá cerrando el documento' },
    { s: 60, tipo: 'urgente', txt: '⚠️ ¡Último minuto! Revisá firma, sello y fecha' },
    { s: 30, tipo: 'urgente', txt: '🚨 30 segundos' },
  ];

  function actualizar() {
    if (!activo) return;
    const resto = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
    if (resto === ultimoSeg) return;
    ultimoSeg = resto;
    const pct = total ? Math.max(0, resto * 100 / total) : 0;
    if (barra) {
      barra.querySelector('[data-t]').textContent = fmt(resto);
      barra.querySelector('[data-bar]').style.width = pct + '%';
      barra.classList.toggle('atencion', resto <= Math.max(60, total * 0.25) && resto > Math.max(20, total * 0.1));
      barra.classList.toggle('urgente', resto <= Math.max(20, total * 0.1));
    }
    document.title = `⏱ ${fmt(resto)} · Examen`;

    // mitad del tiempo
    const mitad = Math.round(total / 2);
    if (resto <= mitad && !avisados.has('mitad') && total >= 240) { avisados.add('mitad'); aviso('🕐 Mitad del tiempo: ya recorriste la mitad del examen', 'info'); sonido('aviso'); }
    for (const u of UMBRALES) {
      if (u.s < total && resto <= u.s && !avisados.has(u.s)) {
        avisados.add(u.s);
        aviso(u.txt, u.tipo === 'urgente' ? 'urgente' : 'aviso'); sonido(u.tipo); vibrar(u.tipo === 'urgente' ? [120, 80, 120] : [120]);
      }
    }
    if (resto <= 10 && resto > 0) { sonido('tick'); if (barra) { barra.classList.remove('latido'); void barra.offsetWidth; barra.classList.add('latido'); } }
    if (resto <= 0) terminar();
  }

  function terminar() {
    if (!activo) return;
    clearInterval(intervalo); intervalo = null; activo = false;
    aviso('⌛ ¡Se acabó el tiempo! Se entrega lo que escribiste', 'fin', 4500);
    sonido('fin'); vibrar([300, 120, 300]);
    if (barra) barra.classList.add('agotado');
    document.title = tituloOriginal;
    if (onFinCb) setTimeout(() => { const f = onFinCb; onFinCb = null; f(); }, 1400);   // un instante para que se oiga y se lea el aviso
  }

  function iniciar({ segundos, onFin, contenedor }) {
    detener();
    total = segundos; fin = Date.now() + segundos * 1000; t0 = Date.now(); activo = true; onFinCb = onFin || null; avisados = new Set(); ultimoSeg = -1;
    tituloOriginal = document.title.replace(/^⏱ \d\d:\d\d · Examen$/, 'Recetarios y Certificados | NikaMed');
    barra = crearBarra(contenedor);
    document.body.classList.add('rz-examen');
    ctxAudio(); sonido('inicio'); vibrar(80);
    aviso(`🏁 ¡Comenzó el examen! Tenés ${Math.round(segundos / 60)} minutos`, 'info', 3200);
    intervalo = setInterval(actualizar, 250);
    document.addEventListener('visibilitychange', alVolver);
  }
  function alVolver() { if (activo && !document.hidden) actualizar(); }

  // Corta el reloj sin disparar el fin (entrega manual o abandono).
  function detener() {
    clearInterval(intervalo); intervalo = null; activo = false; onFinCb = null;
    document.removeEventListener('visibilitychange', alVolver);
    if (barra) { barra.remove(); barra = null; }
    document.body.classList.remove('rz-examen');
    if (tituloOriginal) document.title = tituloOriginal;
  }
  const tiempoUsado = () => (t0 ? Math.round((Date.now() - t0) / 1000) : 0);
  const estaActivo = () => activo;

  return { iniciar, detener, tiempoUsado, estaActivo, sonido, aviso, vibrar, alternarSonido, formato: fmt };
})();
window.RecetariosExamen = RecetariosExamen;
