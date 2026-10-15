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

  function iniciar() { aurora(); entrada(); if (!reducido) luz(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
