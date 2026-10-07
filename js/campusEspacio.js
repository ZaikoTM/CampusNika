/* Campus NikaMed+ — fondo espacial del tema premium: estrellas que titilan, meteoritos ocasionales y naves que cruzan muy suave.
   Solo corre con body.tema-premium; se pausa con la pestaña oculta y respeta "reducir movimiento". Todo es DOM + CSS (sin canvas). */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const movil = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  let capa = null, timers = [], activo = false;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const NAVES = [
    // cohete
    '<svg viewBox="0 0 64 28" fill="none"><path d="M6 14 L0 8 L12 10 L12 18 L0 20 Z" fill="#7c3aed" opacity=".8"/><ellipse cx="34" cy="14" rx="26" ry="8" fill="#e9d5ff"/><ellipse cx="42" cy="13" rx="8" ry="4.5" fill="#38bdf8"/><path d="M52 14 L62 14" stroke="#c084fc" stroke-width="2" stroke-linecap="round"/></svg>',
    // platillo
    '<svg viewBox="0 0 64 30" fill="none"><ellipse cx="32" cy="18" rx="30" ry="8" fill="#a78bfa"/><ellipse cx="32" cy="14" rx="14" ry="9" fill="#c4b5fd" opacity=".85"/><ellipse cx="32" cy="12" rx="8" ry="5" fill="#38bdf8" opacity=".9"/><circle cx="14" cy="19" r="1.6" fill="#fff"/><circle cx="32" cy="22" r="1.6" fill="#fff"/><circle cx="50" cy="19" r="1.6" fill="#fff"/></svg>',
    // caza
    '<svg viewBox="0 0 64 30" fill="none"><path d="M2 15 L18 9 L46 11 L62 15 L46 19 L18 21 Z" fill="#ddd6fe"/><path d="M20 9 L28 1 L34 10 Z M20 21 L28 29 L34 20 Z" fill="#8b5cf6"/><circle cx="48" cy="15" r="3" fill="#38bdf8"/><path d="M2 15 L-8 15" stroke="#f0abfc" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>',
  ];

  function estrellas() {
    const n = movil ? 22 : 46;
    for (let i = 0; i < n; i++) {
      const e = document.createElement('i'); e.className = 'cp-estrella';
      e.style.left = rnd(0, 100) + '%'; e.style.top = rnd(0, 100) + '%';
      e.style.setProperty('--d', rnd(3, 7).toFixed(1) + 's'); e.style.setProperty('--w', rnd(0, 6).toFixed(1) + 's');
      if (Math.random() < 0.2) { e.style.width = e.style.height = '3px'; }
      capa.appendChild(e);
    }
  }

  function meteoro() {
    if (!activo) return;
    const m = document.createElement('i'); m.className = 'cp-meteoro';
    m.style.left = rnd(30, 95) + '%'; m.style.top = rnd(-4, 40) + '%';
    m.style.setProperty('--r', rnd(150, 160).toFixed(0) + 'deg'); m.style.setProperty('--dx', rnd(420, 720).toFixed(0) + 'px'); m.style.setProperty('--t', rnd(1.3, 2.2).toFixed(1) + 's');
    capa.appendChild(m); m.addEventListener('animationend', () => m.remove());
    timers.push(setTimeout(meteoro, rnd(7000, 16000)));
  }

  function nave() {
    if (!activo) return;
    const w = window.innerWidth, h = window.innerHeight;
    const n = document.createElement('div'); n.className = 'cp-nave';
    n.innerHTML = NAVES[Math.floor(Math.random() * NAVES.length)];
    const izq = Math.random() < 0.5, y0 = rnd(h * 0.08, h * 0.8), y1 = y0 + rnd(-h * 0.2, h * 0.2);
    n.style.setProperty('--x0', (izq ? -90 : w + 90) + 'px'); n.style.setProperty('--x1', (izq ? w + 90 : -90) + 'px');
    n.style.setProperty('--y0', y0 + 'px'); n.style.setProperty('--y1', y1 + 'px');
    n.style.setProperty('--s', rnd(26, 46).toFixed(0) + 'px'); n.style.setProperty('--t', rnd(38, 60).toFixed(0) + 's');
    if (!izq) n.querySelector('svg').style.transform = 'scaleX(-1)';
    capa.appendChild(n); n.addEventListener('animationend', () => n.remove());
    timers.push(setTimeout(nave, rnd(22000, 42000)));
  }

  function parar() { activo = false; timers.forEach(clearTimeout); timers = []; }
  function iniciar() {
    if (activo || !document.body) return;
    if (!capa) { capa = document.createElement('div'); capa.className = 'cp-espacio'; capa.setAttribute('aria-hidden', 'true'); document.body.appendChild(capa); estrellas(); }
    activo = true;
    timers.push(setTimeout(meteoro, 3500), setTimeout(nave, 6000));
  }
  function sincronizar() {
    if (document.body.classList.contains('tema-premium') && !document.hidden) iniciar(); else parar();
  }

  function arrancar() {
    new MutationObserver(sincronizar).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', sincronizar);
    sincronizar();
  }
  if (document.body) arrancar(); else document.addEventListener('DOMContentLoaded', arrancar);
})();
