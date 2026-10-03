// CAMPUS NIKA — Atlas de acreditaciones: efectos de juego (animaciones sobre el visor 3D + sonidos sintetizados).
// Sin archivos de audio: todo se genera con Web Audio. Expone window.AcrFX.
(function () {
  'use strict';
  let ctx = null, buf = null;
  let mudo = false; try { mudo = localStorage.getItem('nika_acr_snd') === '0'; } catch (_) {}
  const audio = () => {
    if (mudo) return null;
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!buf) { buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    return ctx;
  };
  function ruido(c, o) {
    const t = c.currentTime + (o.t || 0); const dur = o.dur || 0.2;
    const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = o.tipo || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f0 || 1000, t); if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
    const g = c.createGain(); const v = o.g || 0.25;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.02, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function tono(c, o) {
    const t = c.currentTime + (o.t || 0); const dur = o.dur || 0.15;
    const os = c.createOscillator(); os.type = o.tipo || 'sine';
    os.frequency.setValueAtTime(o.f0 || 440, t); if (o.f1) os.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
    const g = c.createGain(); const v = o.g || 0.15;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(g); g.connect(c.destination); os.start(t); os.stop(t + dur + 0.05);
  }
  const SND = {
    click: (c) => tono(c, { f0: 1500, f1: 800, dur: 0.05, tipo: 'square', g: 0.07 }),
    pop: (c) => tono(c, { f0: 420, f1: 900, dur: 0.09, g: 0.16 }),
    whoosh: (c) => ruido(c, { f0: 400, f1: 2600, dur: 0.35, q: 0.8, g: 0.18 }),
    ding: (c) => { tono(c, { f0: 880, dur: 0.14, g: 0.14 }); tono(c, { t: 0.11, f0: 1320, dur: 0.3, g: 0.14 }); },
    error: (c) => { tono(c, { f0: 180, f1: 120, dur: 0.28, tipo: 'sawtooth', g: 0.12 }); },
    snap: (c) => { [0, 0.22].forEach((t) => { ruido(c, { t, tipo: 'highpass', f0: 2500, dur: 0.07, g: 0.5 }); tono(c, { t, f0: 170, f1: 60, dur: 0.13, g: 0.25 }); }); },
    swish: (c) => { for (let i = 0; i < 4; i++) ruido(c, { t: i * 0.42, f0: 1100, f1: 2800, q: 2, dur: 0.34, g: 0.2 }); },
    agua: (c) => { for (let i = 0; i < 9; i++) ruido(c, { t: i * 0.2, f0: 900 + (i % 3) * 400, f1: 1700, q: 0.7, dur: 0.3, g: 0.14 }); },
    crujido: (c) => { for (let i = 0; i < 12; i++) ruido(c, { t: Math.random() * 0.7, tipo: 'highpass', f0: 2500 + Math.random() * 3000, dur: 0.04 + Math.random() * 0.04, g: 0.28 }); },
    inflar: (c) => { for (let i = 0; i < 5; i++) { ruido(c, { t: i * 0.3, tipo: 'lowpass', f0: 800, dur: 0.2, g: 0.25 }); tono(c, { t: i * 0.3, f0: 220 + i * 45, f1: 300 + i * 50, dur: 0.18, g: 0.07 }); } },
    desinflar: (c) => ruido(c, { f0: 3000, f1: 500, q: 1.2, dur: 0.9, g: 0.22 }),
    squelch: (c) => { ruido(c, { tipo: 'lowpass', f0: 500, f1: 120, dur: 0.4, g: 0.35 }); tono(c, { f0: 200, f1: 80, dur: 0.3, g: 0.12 }); },
    cinta: (c) => { for (let i = 0; i < 14; i++) ruido(c, { t: i * 0.035, tipo: 'highpass', f0: 3000, dur: 0.03, g: 0.3 }); },
    deslizar: (c) => { ruido(c, { tipo: 'lowpass', f0: 500, f1: 900, dur: 1.4, g: 0.16 }); tono(c, { f0: 110, f1: 190, dur: 1.4, g: 0.05 }); },
    thud: (c) => { tono(c, { f0: 130, f1: 45, dur: 0.22, g: 0.3 }); ruido(c, { tipo: 'lowpass', f0: 300, dur: 0.12, g: 0.3 }); },
    pluma: (c) => { for (let i = 0; i < 9; i++) ruido(c, { t: i * 0.11 + Math.random() * 0.05, tipo: 'highpass', f0: 4200, dur: 0.06, g: 0.16 }); },
    rodar: (c) => ruido(c, { tipo: 'lowpass', f0: 240, dur: 1, g: 0.22 }),
    goteo: (c) => { for (let i = 0; i < 5; i++) tono(c, { t: i * 0.22, f0: 1000, f1: 420, dur: 0.07, g: 0.12 }); },
    hablar: (c) => { for (let i = 0; i < 4; i++) tono(c, { t: i * 0.13, f0: 330 + (i % 2) * 90, f1: 380, dur: 0.09, g: 0.09 }); },
    tick: (c) => { tono(c, { f0: 700, f1: 500, dur: 0.06, tipo: 'triangle', g: 0.15 }); tono(c, { t: 0.1, f0: 500, dur: 0.05, tipo: 'triangle', g: 0.1 }); },
  };
  function sonido(n) { const c = audio(); if (!c || !SND[n]) return; try { SND[n](c); } catch (_) {} }

  // ---- escenas visuales. Cada una: ico, cap, snd, dur (ms a 1×), html opcional y init(el, ctx)
  const E = (ico, cap, snd, cls, dur) => ({ ico, cap, snd, cls, dur: dur || 1900 });
  const ESC = {
    reunir: E('🧰', 'Reuniendo el material', 'crujido', 'a-rebota'),
    verificar: E('📋', 'Verificando identidad y solicitud', 'tick', 'a-pop'),
    trasladar: E('🛒', 'Llevando la mesa al lado del paciente', 'rodar', 'a-rueda', 2200),
    hablar: E('💬', 'Hablando con el paciente', 'hablar', 'a-pop'),
    firma: E('✍️', 'Consentimiento informado firmado', 'pluma', 'a-escribe', 2200),
    posicion: (o) => E('🛏️', o.sexo === 'F' ? 'Posición ginecológica' : 'Decúbito supino', 'thud', 'a-pop'),
    sabana: E('🧻', 'Cubriendo con paño clínico no estéril', 'crujido', 'a-baja'),
    guante: E('🧤', 'Colocando los guantes', 'snap', 'a-guante'),
    guante_off: E('🧤', 'Retirando los guantes', 'snap', 'a-vuela', 1800),
    lavado: E('🫧', 'Lavado de manos con técnica clínica', 'agua', 'a-burbujas', 2600),
    pano: E('🟦', 'Paño estéril sobre la región', 'crujido', 'a-baja', 2000),
    pack: E('📦', 'Abriendo el pack estéril', 'crujido', 'a-abre', 2000),
    aviso: E('🗣️', 'Avisando al paciente', 'hablar', 'a-pop'),
    traccion: E('↩️', 'Traccionando hasta sentir resistencia', 'tick', 'a-tira'),
    prepucio: E('↪️', 'Prepucio de nuevo en su lugar', 'pop', 'a-pop'),
    gancho: E('🪝', 'Colgando la bolsa del ganchillo', 'click', 'a-cuelga', 1900),
    residuos: E('🗑️', 'Retirando y desechando los elementos', 'thud', 'a-cae', 2000),
    registro: E('📝', 'Registrando en la historia clínica', 'pluma', 'a-escribe', 2300),
    posicion_tr: E('🛌', 'Posición adecuada: decúbito lateral izquierdo (Sims), litotomía, genupectoral o de pie inclinado', 'thud', 'a-pop', 2300),
    desnudar: E('👖', 'Descubriendo de la cintura para abajo, resguardando la intimidad', 'crujido', 'a-baja'),
    separar: E('👐', 'Separando las nalgas para exponer la región', 'pop', 'a-abre', 1800),
    inspeccion: { ico: '🔍', cap: 'Inspeccionando la región perianal: piel, orificio, lesiones', snd: 'tick', cls: 'a-escanea', dur: 2800, ancla: true },
    lubricar: { ico: '🧴', cap: 'Lubricando el dedo índice', snd: 'squelch', cls: 'a-gel', dur: 1900, ancla: true },
    apoyar: { ico: '☝️', cap: 'Apoyando el dedo sobre el margen anal, hacia el ombligo', snd: 'tick', cls: 'a-pop', dur: 1900, ancla: true },
    presion: { ico: '🫳', cap: 'Presión suave y sostenida hasta que el esfínter se relaje', snd: 'deslizar', cls: 'a-presiona', dur: 2800, ancla: true },
    dedo_in: { ico: '☝️', cap: 'Introduciendo el dedo hacia el ombligo, con suavidad', snd: 'deslizar', cls: 'a-inserta', dur: 3000, ancla: true },
    barrido: { ico: '🔄', cap: 'Barrido en sentido horario y antihorario: mucosa, próstata o cuello uterino', snd: 'tick', cls: 'a-gira', dur: 3400, ancla: true },
    tono: { ico: '💪', cap: 'Pide que apriete el dedo: se evalúa el tono del esfínter', snd: 'tick', cls: 'a-aprieta', dur: 2600, ancla: true },
    retirar: { ico: '↩️', cap: 'Retirando el dedo del canal ano-rectal', snd: 'squelch', cls: 'a-tira', dur: 2000, ancla: true },
    examinar: { ico: '🧤', cap: 'Examinando el guante: heces, moco, pus o sangre', snd: 'tick', cls: 'a-escanea', dur: 2800 },
    cinta: E('🩹', 'Fijando con cinta hipoalergénica', 'cinta', 'a-cinta', 1700),
    bolsa: E('🧪', 'Conectando a la bolsa colectora', 'goteo', 'a-gotas', 2300),
    balon_test: { ico: '🎈', cap: 'Probando el balón: infla y desinfla', snd: 'inflar', snd2: ['desinflar', 2000], cls: 'a-balon', dur: 3300 },
    inflar: { ico: '💉', cap: 'Inflando el balón con agua bidestilada', snd: 'inflar', cls: 'a-jeringa', dur: 2600, cc: true },
    gel: { ico: '🧴', cap: 'Lubricando la punta con lidocaína en gel', snd: 'squelch', cls: 'a-gel', dur: 1900, ancla: true },
    insertar: { ico: '➡️', cap: 'Introduciendo la sonda con suavidad, sin forzar', snd: 'deslizar', cls: 'a-inserta', dur: 3000, ancla: true, fin: 'goteo' },
    higiene: { cap: '', snd: 'swish', cls: '', dur: 3200, ancla: true, custom: 'higiene' },
  };

  let escenaActual = null;
  function quitarEscena() { if (escenaActual) { escenaActual.remove(); escenaActual = null; } }

  function ancla(vp) {
    const r = vp.getBoundingClientRect();
    const p = vp.querySelector('.pin[data-hs="meato"]') || vp.querySelector('.pin[data-hs="ano"]');
    if (p) { const b = p.getBoundingClientRect(); if (b.width) return { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top, w: r.width, h: r.height }; }
    return { x: r.width * 0.5, y: r.height * 0.58, w: r.width, h: r.height };
  }

  function higiene(el, a, sexo, dur) {
    const s = Math.max(0.7, Math.min(1.3, a.w / 700));
    let segs = [];
    if (sexo === 'F') {
      [-34, 34, 0].forEach((dx) => { const pts = []; for (let k = 0; k <= 8; k++) pts.push([a.x + dx * s + Math.sin(k * 1.4) * 5, a.y - 46 * s + (92 * s * k) / 8]); segs.push(pts); });
    } else {
      const pts = []; for (let k = 0; k <= 60; k++) { const ang = k * 0.32, r = (6 + k * 0.9) * s; pts.push([a.x + Math.cos(ang) * r, a.y + Math.sin(ang) * r]); } segs = [pts];
    }
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'fx-svg'); svg.setAttribute('width', a.w); svg.setAttribute('height', a.h);
    el.appendChild(svg);
    const gasa = document.createElement('div'); gasa.className = 'fx-gasa'; gasa.innerHTML = '<span>🧽</span>'; el.appendChild(gasa);
    const por = dur / segs.length;
    segs.forEach((pts, i) => {
      const path = document.createElementNS(NS, 'path'); path.setAttribute('d', 'M' + pts.map((p) => p.join(',')).join(' L'));
      path.setAttribute('class', 'fx-iodo'); svg.appendChild(path);
      const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
      path.animate([{ strokeDashoffset: L, opacity: 0.2 }, { strokeDashoffset: 0, opacity: 0.8 }], { duration: por * 0.92, delay: i * por, fill: 'forwards', easing: 'linear' });
      const kf = pts.map((p, k) => ({ transform: `translate(${p[0] - 22}px, ${p[1] - 22}px) rotate(${(k % 2 ? 14 : -14)}deg)`, opacity: 1, offset: k / (pts.length - 1) }));
      gasa.animate(kf, { duration: por * 0.92, delay: i * por, fill: 'both', easing: 'ease-in-out' });
    });
    gasa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: dur - 200, fill: 'forwards' });
    const cap = document.createElement('div'); cap.className = 'fx-cap-fija';
    cap.textContent = sexo === 'F' ? 'Higiene de arriba hacia abajo (de adelante hacia atrás): una gasa por movimiento' : 'Del meato hacia afuera, en círculos, con iodopovidona jabonosa'; el.appendChild(cap);
  }

  /** reproduce el efecto del paso; devuelve una promesa que se resuelve al terminar */
  function play(kind, opt) {
    opt = opt || {}; const vp = opt.vp || document.querySelector('.acr3d-vp'); let def = ESC[kind];
    if (typeof def === 'function') def = def(opt);
    if (!def) return Promise.resolve();
    if (!vp) { sonido(def.snd); return Promise.resolve(); }
    const vel = opt.vel || 1; const dur = Math.max(700, def.dur / vel);
    quitarEscena();
    let capa = vp.querySelector('.acr-fx'); if (!capa) { capa = document.createElement('div'); capa.className = 'acr-fx'; vp.appendChild(capa); }
    const el = document.createElement('div'); el.className = 'fx-escena ' + (def.cls || ''); el.style.setProperty('--d', dur + 'ms');
    escenaActual = el; capa.appendChild(el);
    const a = ancla(vp);
    if (def.custom === 'higiene') {
      higiene(el, a, opt.sexo, dur);
    } else {
      const pos = def.ancla ? `left:${a.x}px;top:${Math.max(70, a.y - 70)}px;` : '';
      el.innerHTML = `<div class="fx-card${def.ancla ? ' anc' : ''}" style="${pos}"><div class="fx-ico">${def.ico}</div>${def.cc ? '<div class="fx-cc"><b>0</b> cc</div>' : ''}<div class="fx-cap">${def.cap}</div></div>`;
      if (def.cc) { const b = el.querySelector('.fx-cc b'); const t0 = performance.now(); (function paso() { if (!b.isConnected) return; const k = Math.min(1, (performance.now() - t0) / (dur * 0.8)); b.textContent = Math.round(k * 10); if (k < 1) requestAnimationFrame(paso); })(); }
    }
    sonido(def.snd);
    if (def.snd2) setTimeout(() => sonido(def.snd2[0]), def.snd2[1] / vel);
    if (def.fin) setTimeout(() => sonido(def.fin), dur * 0.85);
    return new Promise((ok) => setTimeout(() => { if (escenaActual === el) quitarEscena(); ok(); }, dur));
  }

  function boton() {
    if (document.getElementById('acr-snd-fab')) return;
    const b = document.createElement('button'); b.id = 'acr-snd-fab'; b.type = 'button'; b.className = 'acr-ayuda-fab acr-snd-fab';
    const pintar = () => { b.textContent = mudo ? '🔇' : '🔊'; b.title = mudo ? 'Activar sonidos' : 'Silenciar sonidos'; b.setAttribute('aria-label', b.title); };
    b.onclick = () => { mudo = !mudo; try { localStorage.setItem('nika_acr_snd', mudo ? '0' : '1'); } catch (_) {} pintar(); if (!mudo) sonido('pop'); };
    pintar(); document.body.appendChild(b);
  }

  window.AcrFX = { play, sonido, boton, existe: (k) => !!ESC[k], quitar: quitarEscena, mudo: () => mudo };
})();
