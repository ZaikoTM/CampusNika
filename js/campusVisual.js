/* CAMPUS NIKA · capa visual del campus (fase 1)
   - Fondo aurora detrás del contenido.
   - Entrada escalonada de las secciones al cargar y al hacer scroll (si algo falla, todo queda visible).
   - Luz que sigue al mouse en las tarjetas de vidrio. */
(function () {
  'use strict';
  const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function aurora() {
    if (document.querySelector('.cv-aurora')) return;
    const a = document.createElement('div'); a.className = 'cv-aurora'; a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<i></i><i></i><i></i>';
    document.body.insertBefore(a, document.body.firstChild);
  }

  const SEL = '.hero-banner, .continuity-card, .plan-card, .action-btn-card, .perf-grid > *, .prof-card, .status-card, .sim-hub-grid > *';
  function entrada() {
    if (reducido || !('IntersectionObserver' in window)) return;
    const nodos = [...document.querySelectorAll(SEL)].filter((n) => !n.classList.contains('cv-rv'));
    if (!nodos.length) return;
    document.documentElement.classList.add('cv-on');
    const orden = new Map();
    nodos.forEach((n) => { const p = n.parentElement; const k = (orden.get(p) || 0); orden.set(p, k + 1); n.style.setProperty('--cv-d', String(Math.min(k, 8))); n.classList.add('cv-rv'); });
    const mostrar = (n) => {
      if (!n.classList.contains('cv-rv')) return;
      n.classList.add('cv-in');
      n.addEventListener('animationend', () => { n.classList.remove('cv-rv', 'cv-in'); n.style.removeProperty('--cv-d'); }, { once: true });
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); } }), { threshold: 0.06 });
    nodos.forEach((n) => io.observe(n));
    // seguro: pase lo que pase, a los pocos segundos todo se ve
    setTimeout(() => { document.querySelectorAll('.cv-rv:not(.cv-in)').forEach((n) => { n.classList.remove('cv-rv'); }); }, 3500);
  }

  function luz() {
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest('.plan-card, .action-btn-card, .prof-card, .perf-grid > *'); if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--cv-x', (e.clientX - r.left) + 'px'); c.style.setProperty('--cv-y', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Fase 2: iconos lineales unificados ---------- */
  const C = (cx, cy, r) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
  const IC = {
    '🏠': ['#0ea5e9', '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
    '⚙': ['#64748b', C(12, 12, 3) + '<path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'],
    '👤': ['#0ea5e9', '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' + C(12, 7, 4)],
    '👨‍⚕': ['#0ea5e9', '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' + C(12, 7, 4)],
    '🚫': ['#ef4444', C(12, 12, 9) + '<path d="M5.6 5.6l12.8 12.8"/>'],
    '🧉': ['#16a34a', '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>'],
    '📹': ['#6366f1', '<path d="M3 7h12v10H3z"/><path d="m15 11 6-3v8l-6-3"/>'],
    '🗓': ['#f59e0b', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
    '🥽': ['#8b5cf6', '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3l-2-3h-4l-2 3H5a2 2 0 0 1-2-2z"/>'],
    '🩺': ['#06b6d4', '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2"/>' + C(20, 11, 2)],
    '✍': ['#0ea5e9', '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'],
    '🛏': ['#14b8a6', '<path d="M2 18V7M2 14h20v4M22 14v-2a3 3 0 0 0-3-3h-8v5"/>' + C(6, 11, 1.5)],
    '🚨': ['#ef4444', '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.01"/>'],
    '🗣': ['#8b5cf6', '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.5A8 8 0 1 1 21 12z"/>'],
    '🗨': ['#0ea5e9', '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.5A8 8 0 1 1 21 12z"/>'],
    '💬': ['#0ea5e9', '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.5A8 8 0 1 1 21 12z"/>'],
    '🎓': ['#f59e0b', '<path d="m22 9-10-5L2 9l10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>'],
    '⚔': ['#ef4444', '<path d="M4 4l16 16M20 4 4 20"/>'],
    '🏆': ['#f59e0b', '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M10 17h4"/>'],
    '🍅': ['#ef4444', C(12, 13, 8) + '<path d="M12 9v4l2 2M9 2h6"/>'],
    '📢': ['#f97316', '<path d="M3 11v3l14 5V6z"/><path d="M17 8a4 4 0 0 1 0 8M6 15v4a1 1 0 0 0 2 0v-3"/>'],
    '🤝': ['#ec4899', C(9, 8, 3.5) + '<path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 4 6"/>'],
    '📝': ['#0ea5e9', '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'],
    '💊': ['#14b8a6', '<path d="M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z"/><path d="m8.5 8.5 7 7"/>'],
    '🛡': ['#16a34a', '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'],
    '🌙': ['#6366f1', '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'],
    '📲': ['#0ea5e9', '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'],
    '🧭': ['#0ea5e9', C(12, 12, 9) + '<path d="m15.5 8.5-2 5-5 2 2-5z"/>'],
    '🎯': ['#16a34a', C(12, 12, 9) + C(12, 12, 5) + C(12, 12, 1)],
    '🔥': ['#f97316', '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>'],
    '⭐': ['#f59e0b', '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'],
    '🧠': ['#64748b', '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 1"/>'],
    '⏱': ['#e11d48', C(12, 13, 8) + '<path d="M12 9v4l2.5 1.5M9 2h6"/>'],
    '⚡': ['#f59e0b', '<path d="m13 2-9 12h7l-1 8 9-12h-7z"/>']
  };
  const RE_EMO = /^\s*((?:\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*))\s*/u;
  function svg(k) {
    const d = IC[k.replace(/\uFE0F/g, '')]; if (!d) return null;
    const s = document.createElement('span'); s.className = 'cv-ico'; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--cv-ic', d[0]);
    s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + d[1] + '</svg>';
    return s;
  }
  function iconos() {
    try {
      document.querySelectorAll('.perf-tile-icon, .perf-time-tile-icon').forEach((a) => {
        if (a.querySelector('.cv-ico')) return;
        const txt = a.textContent.trim(); if (!txt || a.querySelector('svg')) return;
        const el = svg(txt); if (!el) return;
        const ring = a.querySelector('.cv-ring'); a.textContent = ''; el.classList.add('cv-ico--blanco'); a.appendChild(el); if (ring) a.appendChild(ring);
      });
    } catch (_) {}
  }

  /* ---------- Fase 2: contadores animados y anillos de progreso ---------- */
  const NUM = /(-?\d+(?:[.,]\d+)?)/;
  function contador(el) {
    if (!el || el.__cv) return; el.__cv = true;
    let propio = false, raf = 0, ultimo = el.textContent;
    const poner = (t) => { propio = true; el.textContent = t; ultimo = t; setTimeout(() => { propio = false; }, 0); };
    const animar = () => {
      const txt = el.textContent, m = txt.match(NUM);
      if (!m) { ultimo = txt; return; }
      const fin = parseFloat(m[1].replace(',', '.')), dec = /[.,]/.test(m[1]) ? (m[1].split(/[.,]/)[1] || '').length : 0;
      const pre = txt.slice(0, m.index), pos = txt.slice(m.index + m[1].length);
      if (reducido || !(fin > 0)) { ultimo = txt; return; }
      cancelAnimationFrame(raf);
      const t0 = performance.now(), dur = 900;
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = fin * e;
        poner(pre + (dec ? v.toFixed(dec).replace('.', m[1].includes(',') ? ',' : '.') : String(Math.round(v))) + pos);
        if (p < 1) raf = requestAnimationFrame(paso); else poner(txt);
      };
      raf = requestAnimationFrame(paso);
    };
    new MutationObserver(() => { if (propio) return; if (el.textContent === ultimo) return; animar(); })
      .observe(el, { childList: true, characterData: true, subtree: true });
    animar();
  }
  const leer = (id, f) => { const e = document.getElementById(id), n = e && e.textContent.match(NUM); return n ? f(parseFloat(n[1].replace(',', '.'))) : 0; };
  const ANILLOS = { '.perf-tile--accuracy': () => leer('perf-accuracy', (v) => v), '.perf-tile--streak': () => leer('perf-streak', (v) => v / 7 * 100) };
  function anillos() {
    const ids = { '.perf-tile--accuracy': 'perf-accuracy', '.perf-tile--streak': 'perf-streak' };
    Object.keys(ANILLOS).forEach((sel) => {
      const v = document.getElementById(ids[sel]); if (!v || !v.parentElement) return;
      let b = v.parentElement.querySelector('.cv-barra');
      if (!b) { b = document.createElement('div'); b.className = 'cv-barra'; b.innerHTML = '<i></i>'; v.parentElement.appendChild(b); }
      const p = Math.max(0, Math.min(100, ANILLOS[sel]()));
      b.firstChild.style.width = Math.max(p, p > 0 ? 3 : 0).toFixed(1) + '%';
    });
  }
  function rendimiento() {
    ['perf-exams-count', 'perf-accuracy', 'perf-streak', 'perf-study-time', 'perf-study-time-hoy', 'perf-study-sessions', 'perf-study-sessions-hoy'].forEach((id) => contador(document.getElementById(id)));
    const w = document.getElementById('mi-rendimiento-widget');
    if (w) { try { new MutationObserver(() => { anillos(); }).observe(w, { childList: true, subtree: true, characterData: true }); } catch (_) {} }
    anillos();
  }

  /* ---------- Fase 3: confeti en hitos, sidebar vivo y esqueletos de carga ---------- */
  function confeti(origen) {
    if (reducido) return;
    try {
      const r = origen && origen.getBoundingClientRect ? origen.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 3, width: 0, height: 0 };
      const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, cols = ['#0ea5e9', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#f97316'];
      const cont = document.createElement('div'); cont.className = 'cv-confeti'; cont.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 34; i++) {
        const p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 130;
        p.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;background:' + cols[i % cols.length] + ';--dx:' + Math.cos(a) * d + 'px;--dy:' + (Math.sin(a) * d - 40) + 'px;--rot:' + (Math.random() * 720 - 360) + 'deg;animation-delay:' + (Math.random() * 90) + 'ms';
        cont.appendChild(p);
      }
      document.body.appendChild(cont); setTimeout(() => cont.remove(), 1800);
    } catch (_) {}
  }
  const HITOS_RACHA = [3, 7, 14, 30, 60, 100];
  function hitos() {
    try {
      const n = leer('perf-streak', (v) => v); if (!n) return;
      const h = HITOS_RACHA.filter((x) => n >= x).pop(); if (!h) return;
      const k = 'cv_hito_racha_' + h; if (localStorage.getItem(k)) return;
      localStorage.setItem(k, '1');
      const ic = document.querySelector('.perf-tile--streak .perf-tile-icon');
      if (ic) { ic.classList.add('cv-brillo'); setTimeout(() => ic.classList.remove('cv-brillo'), 1600); }
      confeti(ic);
    } catch (_) {}
  }

  function sidebarVivo() {
    const menu = document.querySelector('.sidebar-menu'); if (!menu) return;
    // sección activa: el enlace que apunta a esta página (o "Inicio" en el campus)
    const pag = location.pathname.split('/').pop() || 'index.html';
    let act = [...menu.querySelectorAll('a.sidebar-link[href]')].find((a) => (a.getAttribute('href') || '').split(/[?#]/)[0] === pag && pag !== 'campus.html');
    if (!act && /campus\.html$|\/$/.test(location.pathname)) act = [...menu.querySelectorAll('.sidebar-link')].find((l) => /Inicio/i.test(l.textContent));
    if (act) act.classList.add('cv-activo');
  }

  function esqueletos() {
    const marcar = () => document.querySelectorAll('.plan-vacio, .community-widget-empty, .friends-empty-state, .pc-loading-state').forEach((e) => {
      if (e.classList.contains('cv-skel')) return;
      if (/^\s*Cargando/i.test(e.textContent)) e.classList.add('cv-skel');
    });
    marcar();
    let t = 0;
    try { new MutationObserver(() => { clearTimeout(t); t = setTimeout(marcar, 60); }).observe(document.body, { childList: true, subtree: true }); } catch (_) {}
  }

  window.CampusVisual = { confeti };
  /* Modo liviano: equipos con poca memoria o pocos núcleos, "ahorro de datos" o pantallas chicas */
  function liviano() {
    try {
      const n = navigator, cx = n.connection || {};
      const poco = (n.deviceMemory && n.deviceMemory <= 4) || (n.hardwareConcurrency && n.hardwareConcurrency <= 4) || cx.saveData === true || /2g/.test(cx.effectiveType || '');
      if (poco || innerWidth < 700 && n.hardwareConcurrency && n.hardwareConcurrency <= 6) document.documentElement.classList.add('cv-lite');
      document.querySelectorAll('img:not([loading])').forEach((i) => { if (i.getBoundingClientRect().top > innerHeight * 1.2) i.loading = 'lazy'; i.decoding = 'async'; });
    } catch (_) {}
  }

  function iniciar() { liviano(); aurora(); iconos(); sidebarVivo(); esqueletos(); entrada(); if (!reducido) luz(); rendimiento(); setTimeout(iconos, 1500); setTimeout(hitos, 2500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
