// CAMPUS NIKA — Atlas de acreditaciones: monitor multiparamétrico y desfibrilador de la sala de reanimación.
// Dibuja el ECG en tiempo real (sinusal, FV, TV sin pulso, asistolia, AESP), hace sonar los pitidos del monitor, las alarmas,
// el metrónomo de las compresiones, la carga y la descarga del desfibrilador, y reacciona a las clases s-* del visor 3D.
// Expone window.AcrMonitor. Todos los sonidos se generan con Web Audio (AcrFX) y respetan el botón de silencio.
(function () {
  'use strict';
  const FX = () => window.AcrFX;
  const M = {
    activo: false, raiz: null, ecg: null, ctx: null, raf: 0, cfg: { ritmo: 'asistolia' }, flags: new Set(), t0: 0, tw: 0, x: 0, fase: 0, hr: 0,
    ritmo: 'asistolia', pulso: false, rcp: false, pausaRcp: 0, silenciada: 0, ultimoNum: 0, sat: 0, co2: 0, cargando: false, listo: false,
    ciclo: 0, cicloIni: 0, ultimoMetro: 0, ultimaAlarma: 0, shockHasta: 0, fvSeed: Math.random() * 100, y0: 0, x0: 0,
  };
  const $ = (s) => (M.raiz ? M.raiz.querySelector(s) : null);
  const PXS = 95;   // píxeles por segundo (≈ 25 mm/s)

  // ------------------------------------------------------------------ formas de onda
  const g = (x, mu, s, a) => a * Math.exp(-((x - mu) * (x - mu)) / (2 * s * s));
  function qrst(f, ancho, amp) {            // f en [0,1): un latido
    const w = ancho || 1;
    return g(f, 0.16, 0.025, 0.13 * amp) + g(f, 0.27, 0.010 * w, -0.12 * amp) + g(f, 0.30, 0.0125 * w, 1.0 * amp) + g(f, 0.335, 0.012 * w, -0.22 * amp) + g(f, 0.58, 0.05, 0.27 * amp);
  }
  function suave(t, k) { return Math.sin(t * k) * Math.sin(t * k * 0.37 + 1.3) * 0.5 + 0.5; }
  function muestra(t, fase) {
    let y = 0;
    switch (M.ritmo) {
      case 'sinusal': case 'sinusal_sinpulso': y = qrst(fase % 1, 1, 1); break;
      case 'aesp': y = qrst(fase % 1, 2.6, 0.62); break;
      case 'tvsp': y = 0.85 * Math.tanh(1.6 * Math.sin(t * 2 * Math.PI * 3.3)) + 0.06 * Math.sin(t * 40); break;
      case 'fv': {
        const a = 0.25 + 0.65 * suave(t + M.fvSeed, 1.7);
        y = a * (0.55 * Math.sin(t * 2 * Math.PI * 4.6 + 0.8 * Math.sin(t * 5.1)) + 0.35 * Math.sin(t * 2 * Math.PI * 7.3 + 1.1) + 0.2 * Math.sin(t * 2 * Math.PI * 2.7)) + (Math.random() - 0.5) * 0.06;
        break;
      }
      default: y = 0.015 * Math.sin(t * 1.7) + (Math.random() - 0.5) * 0.012;   // asistolia: línea casi plana
    }
    if (M.rcpActiva()) {                      // artefacto de las compresiones torácicas (110 por minuto)
      const f = (t * 110 / 60) % 1;
      y += 0.8 * (f < 0.45 ? Math.sin(f / 0.45 * Math.PI) : -0.18 * Math.sin((f - 0.45) / 0.55 * Math.PI)) * (0.85 + 0.15 * Math.sin(t * 3));
    }
    if (performance.now() < M.shockHasta) y = Math.sin(t * 90) * 0.04;   // tras la descarga: «línea plana» breve
    return Math.max(-1.4, Math.min(1.4, y));
  }
  M.rcpActiva = () => M.rcp && performance.now() > M.pausaRcp;
  M.alarma = () => (['fv', 'tvsp', 'asistolia'].includes(M.ritmo) && !M.flags.has('muerte') ? 'alta' : (M.ritmo === 'aesp' || M.ritmo === 'sinusal_sinpulso') ? 'media' : null);

  // ------------------------------------------------------------------ sonidos
  function beep(hz, dur, g0) { const F = FX(); const c = F && F.audio && F.audio(); if (c) F.tono(c, { f0: hz, dur: dur || 0.1, tipo: 'sine', g: g0 || 0.1 }); }
  function patronAlarma(alta) {
    const F = FX(); const c = F && F.audio && F.audio(); if (!c) return;
    const f = alta ? [988, 988, 988, 988, 988] : [660, 660, 660];
    const sep = alta ? [0, 0.17, 0.34, 0.62, 0.79] : [0, 0.2, 0.4];
    f.forEach((hz, i) => F.tono(c, { t: sep[i], f0: hz, dur: 0.11, tipo: 'triangle', g: alta ? 0.1 : 0.07 }));
  }
  function sonar(n) { const F = FX(); if (F && F.sonido) F.sonido(n); }

  // ------------------------------------------------------------------ dibujo
  function pintar(ahora) {
    if (!M.activo) return;
    M.raf = requestAnimationFrame(pintar);
    const cv = M.ecg; if (!cv) return;
    const dt = Math.min(0.1, (ahora - (M.tUlt || ahora)) / 1000); M.tUlt = ahora; if (dt <= 0) return;
    const hr = M.hrActual();
    const fase0 = M.fase; M.fase += dt * hr / 60;
    // latido (R en fase 0.30): pitido del monitor
    if (hr > 0 && (M.ritmo === 'sinusal' || M.ritmo === 'sinusal_sinpulso' || M.ritmo === 'aesp') && Math.floor(M.fase - 0.30) > Math.floor(fase0 - 0.30)) {
      beep(M.pulso ? 1000 : 1000, 0.085, 0.09); M.latido = ahora;
      if (M.pulso && M.sat > 40) setTimeout(() => beep(600 + M.sat * 4, 0.05, 0.04), 120);
    }
    const c2 = M.ctx; const W = cv.width, H = cv.height; const mid = H * 0.56;
    const px = Math.max(1, Math.round(dt * PXS));
    c2.strokeStyle = '#4ade80'; c2.lineWidth = 1.7; c2.lineJoin = 'round';
    for (let i = 0; i < px; i++) {
      const tm = M.tw + (i + 1) / PXS; const y = mid - muestra(tm, fase0 + (i + 1) * (M.fase - fase0) / px) * H * 0.34;
      const x1 = (M.x + i + 1) % W;
      if (x1 < M.x0) { M.x0 = 0; M.y0 = y; }
      c2.clearRect(x1, 0, 18, H);
      c2.beginPath(); c2.moveTo(M.x0, M.y0); c2.lineTo(x1, y); c2.stroke();
      M.x0 = x1; M.y0 = y;
    }
    M.x = (M.x + px) % W; M.tw += px / PXS;
    // compresiones: pitido del metrónomo y golpe
    if (M.rcpActiva() && ahora - M.ultimoMetro >= 60000 / 110) { M.ultimoMetro = ahora; if (M.metronomo) sonar('metronomo'); }
    // alarmas
    const al = M.alarma();
    if (al && ahora > M.silenciada && ahora - M.ultimaAlarma > (al === 'alta' ? 3200 : 6000)) { M.ultimaAlarma = ahora; patronAlarma(al === 'alta'); }
    if (M.ritmo === 'asistolia' && M.flags.has('muerte') && !M.planoSonado) { M.planoSonado = true; sonar('plano'); }
    // números y ciclo
    if (ahora - M.ultimoNum > 280) { M.ultimoNum = ahora; numeros(ahora); }
  }
  M.hrActual = () => ({ sinusal: 78, sinusal_sinpulso: 82, aesp: 52, tvsp: 0, fv: 0, asistolia: 0 }[M.ritmo] || 0);
  function set(sel, txt, cls) { const e = $(sel); if (!e) return; if (e.textContent !== String(txt)) e.textContent = txt; if (cls != null) e.className = cls; }
  function numeros(ahora) {
    const r = M.ritmo; const fc = r === 'sinusal' ? 76 + Math.round(Math.sin(ahora / 900) * 2) : r === 'sinusal_sinpulso' ? 82 : r === 'aesp' ? 52 : r === 'tvsp' ? 192 : r === 'asistolia' ? 0 : '---';
    set('.mon-fc b', fc === 0 ? '0' : fc);
    // saturación y presión solo con pulso; el ETCO₂ delata la calidad de las compresiones y el retorno de la circulación
    if (M.pulso) { M.sat = Math.min(97, M.sat + 1.4); M.co2 = Math.min(38, M.co2 + 3); }
    else { M.sat = Math.max(0, M.sat - 3); M.co2 = M.rcpActiva() ? 14 + Math.round(Math.sin(ahora / 700) * 3) : Math.max(0, M.co2 - 4); }
    set('.mon-spo2 b', M.sat > 40 ? Math.round(M.sat) : '--');
    set('.mon-pa b', M.pulso ? (M.sat > 80 ? '112/68' : '84/50') : '--/--');
    set('.mon-co2 b', M.co2 > 3 ? Math.round(M.co2) : '--');
    const al = M.alarma(); const e = $('.mon-alarma'); if (e) { e.classList.toggle('on', !!al && ahora > M.silenciada); e.classList.toggle('alta', al === 'alta'); }
    // temporizador del ciclo de 2 minutos
    const t = $('.cron b');
    if (M.rcp && M.cicloIni) {
      const seg = Math.max(0, 120 - Math.floor((ahora - M.cicloIni) / 1000));
      if (t) t.textContent = `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;
      const c = $('.cron'); if (c) c.classList.toggle('fin', seg <= 10);
      if (seg === 0 && !M.cicloAvisado) { M.cicloAvisado = true; sonar('zumbido'); setTimeout(() => sonar('zumbido'), 400); const c2 = $('.cron'); if (c2) c2.classList.add('relevo'); }
      if (seg > 0) { M.cicloAvisado = false; const c3 = $('.cron'); if (c3) c3.classList.remove('relevo'); }
    }
  }

  // ------------------------------------------------------------------ desfibrilador
  function panelDefi(est, txt) { const d = $('.defi'); if (!d) return; d.dataset.est = est; const e = $('.defi-est'); if (e) e.textContent = txt; }
  function cargarDefi() {
    if (M.cargando) return; M.cargando = true; M.listo = false;
    const barra = $('.defi-barra i'); panelDefi('carga', 'CARGANDO…'); sonar('carga');
    if (barra) { barra.style.transition = 'none'; barra.style.width = '0%'; void barra.offsetWidth; barra.style.transition = 'width 3.2s linear'; barra.style.width = '100%'; }
    setTimeout(() => { if (!M.activo) return; M.cargando = false; M.listo = true; panelDefi('listo', 'LISTO · 200 J'); sonar('listo'); }, 3250);
  }
  function descargarDefi() {
    const F = FX();
    panelDefi('listo', '¡TODOS FUERA!'); if (F && F.hablar) F.hablar('¡Todos fuera!', 'm');
    M.pausaRcp = performance.now() + 3600;
    setTimeout(() => {
      if (!M.activo) return;
      sonar('descarga'); M.listo = false; M.cargando = false; panelDefi('descarga', 'DESCARGA ENTREGADA');
      const v = $('.mon'); if (v) { v.classList.add('flash'); setTimeout(() => v.classList.remove('flash'), 420); }
      const vp = M.raiz && M.raiz.querySelector('.acr3d-vp'); if (vp) { vp.classList.add('sacudon'); setTimeout(() => vp.classList.remove('sacudon'), 500); }
      M.shockHasta = performance.now() + 1500; M.flags.add('_shock');
      setTimeout(() => { if (M.activo) { recalcular(); panelDefi('espera', 'PAUSA · REINICIAR COMPRESIONES'); } }, 1600);
    }, 1500);
  }

  // ------------------------------------------------------------------ estado (clases s-* del visor)
  function recalcular() {
    const f = M.flags; const base = M.cfg.ritmo || 'asistolia';
    let r = base;
    if (f.has('_shock') && f.has('descarga') && !M.cfg.refractaria) r = 'sinusal_sinpulso';
    if (f.has('rosc')) r = 'sinusal';
    if (f.has('muerte')) r = 'asistolia';
    const antes = M.ritmo; M.ritmo = r;
    M.pulso = f.has('rosc') && !f.has('muerte');
    M.rcp = f.has('rcp') && !f.has('rosc') && !f.has('muerte');
    if (antes !== r) { M.fvSeed = Math.random() * 100; if (r !== 'fv' && r !== 'tvsp') M.ultimaAlarma = 0; }
    const tit = $('.mon'); if (tit) { tit.dataset.rosc = M.pulso ? '1' : '0'; tit.dataset.rcp = M.rcp ? '1' : '0'; }
    const hud = $('.rcp-hud'); if (hud) hud.dataset.on = M.rcp ? '1' : '0';
  }
  M.estado = function (raiz) {
    if (!M.activo) return;
    const nuevos = new Set([...raiz.classList].filter((c) => c.startsWith('s-')).map((c) => c.slice(2)));
    const subio = (k) => nuevos.has(k) && !M.flags.has(k);
    const bajo = (k) => !nuevos.has(k) && M.flags.has(k);
    const apagado = new Set(['_shock']);
    const prev = M.flags; M.flags = new Set([...nuevos, ...(nuevos.has('descarga') ? [...prev].filter((k) => apagado.has(k)) : [])]);
    // eventos (solo al subir la bandera; al retroceder en el recorrido no se repiten)
    if (!prev.has('rcp') && M.flags.has('rcp')) { M.cicloIni = performance.now(); M.cicloAvisado = false; M.ultimoMetro = 0; }
    if (prev.has('rcp') && !M.flags.has('rcp')) { M.cicloIni = 0; }
    if (!prev.has('relevo') && M.flags.has('relevo')) { M.cicloIni = performance.now(); sonar('zumbido'); }
    if (!prev.has('carga') && M.flags.has('carga')) cargarDefi();
    if (!prev.has('descarga') && M.flags.has('descarga')) descargarDefi();
    if ((!prev.has('adre') && M.flags.has('adre')) || (!prev.has('amio') && M.flags.has('amio'))) sonar('inyeccion');
    if (!prev.has('rosc') && M.flags.has('rosc')) { M.sat = 60; M.co2 = 20; sonar('rosc'); }
    if (!prev.has('muerte') && M.flags.has('muerte')) { M.planoSonado = false; }
    if (prev.has('muerte') && !M.flags.has('muerte')) M.planoSonado = false;
    if (prev.has('descarga') && !M.flags.has('descarga')) { M.flags.delete('_shock'); panelDefi('apagado', 'EN ESPERA'); M.cargando = false; M.listo = false; }
    if (prev.has('carga') && !M.flags.has('carga')) { panelDefi('apagado', 'EN ESPERA'); M.cargando = false; M.listo = false; }
    recalcular();
  };

  // ------------------------------------------------------------------ ciclo de vida
  M.montar = function (raiz, cfg) {
    M.detener();
    const cv = raiz && raiz.querySelector('.mon-ecg'); if (!cv) return;
    M.raiz = raiz; M.ecg = cv; M.ctx = cv.getContext('2d'); M.cfg = cfg || {}; M.flags = new Set(); M.activo = true; M.tw = 0; M.x = 0; M.x0 = 0; M.y0 = cv.height * 0.56; M.fase = 0; M.tUlt = 0;
    M.pulso = false; M.rcp = false; M.sat = 0; M.co2 = 0; M.ultimaAlarma = 0; M.silenciada = 0; M.shockHasta = 0; M.pausaRcp = 0; M.metronomo = true; M.planoSonado = false;
    M.ritmo = M.cfg.ritmo || 'asistolia';
    const mu = raiz.querySelector('.mon-mute'); if (mu) mu.onclick = () => { M.silenciada = performance.now() + 120000; mu.classList.add('on'); setTimeout(() => mu.classList.remove('on'), 600); };
    const me = raiz.querySelector('.mon-metro'); if (me) { me.classList.add('on'); me.onclick = () => { M.metronomo = !M.metronomo; me.classList.toggle('on', M.metronomo); }; }
    panelDefi('apagado', 'EN ESPERA'); recalcular();
    M.raf = requestAnimationFrame(pintar);
  };
  M.detener = function () { M.activo = false; cancelAnimationFrame(M.raf); M.raf = 0; M.raiz = null; M.ecg = null; M.flags = new Set(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {} };
  window.AcrMonitor = M;
})();
