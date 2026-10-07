// CAMPUS NIKA — microanimaciones compartidas: entrada escalonada de tarjetas, ondas en botones y contadores animados.
// Se ve en campus, salas, simuladores y perfil. Respeta prefers-reduced-motion y no depende de ninguna otra librería.
(function () {
  'use strict';
  if (window.__nikaMicro) return; window.__nikaMicro = true;
  const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducido) return;

  // ------------------------------------------------------------ entrada escalonada al aparecer en pantalla
  const TARJETAS = '.action-btn-card, .perf-tile, .perf-time-tile, .plan-item, .mode-card, .hub-card, .se-card, .ns-card, .friend-card, .sim-hub-item, .subject-tile, .funnel-card, .community-widget, .ns-year, .se-rapido a';
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    const lote = es.filter((e) => e.isIntersecting);
    lote.forEach((e, i) => { const el = e.target; el.style.setProperty('--mi-d', Math.min(i, 9)); el.classList.add('mi-in'); io.unobserve(el); });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }) : null;

  function preparar(raiz) {
    if (!io) return;
    (raiz.querySelectorAll ? raiz.querySelectorAll(TARJETAS) : []).forEach((el) => {
      if (el.dataset.mi) return; el.dataset.mi = '1';
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;          // oculto ahora: no se prepara (se verá normal)
      el.classList.add('mi'); io.observe(el);
      setTimeout(() => { if (el.classList.contains('mi') && !el.classList.contains('mi-in')) el.classList.add('mi-in'); }, 3500);   // red de seguridad: nunca queda invisible
    });
  }

  // ------------------------------------------------------------ ondas al tocar un botón
  const BOTONES = '.btn, .btn-primary, .btn-outline, .btn-secondary, .btn-hub, .btn-module, .pl-btn, .nav-tool-btn, .prof-btn, .pp-btn, .filter-btn, .nika-pomo-btn';
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest(BOTONES); if (!b || b.disabled) return;
    const r = b.getBoundingClientRect(); const d = Math.max(r.width, r.height) * 2;
    b.classList.add('mi-rip-host');
    const s = document.createElement('span'); s.className = 'mi-rip' + (/outline|secondary|pl-btn|filter/.test(b.className) ? ' oscuro' : '');
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  }, { passive: true });

  // ------------------------------------------------------------ contadores que suben hasta su valor
  const NUMS = '.perf-tile-value, .perf-time-tile-value, .pp-stat-value';
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  function contar(el) {
    if (el._miBusy || el.dataset.miContado) return;
    const txt = el.textContent; const m = /(\d+(?:[.,]\d+)?)/.exec(txt); if (!m) return;
    const fin = parseFloat(m[1].replace(',', '.')); if (!(fin > 0)) return;        // 0 todavía no es el dato real
    const dec = /[.,]\d/.test(m[1]) ? m[1].split(/[.,]/)[1].length : 0; const sep = m[1].includes(',') ? ',' : '.';
    el.dataset.miContado = '1'; el._miBusy = true; const t0 = performance.now(); const dur = 900 + Math.min(600, fin * 2);
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur); const v = fin * easeOut(k);
      const s = dec ? v.toFixed(dec).replace('.', sep) : String(Math.round(v));
      el.textContent = txt.slice(0, m.index) + s + txt.slice(m.index + m[1].length);
      if (k < 1) requestAnimationFrame(paso); else { el.textContent = txt; el._miBusy = false; }
    };
    requestAnimationFrame(paso);
  }
  const ioNum = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) contar(e.target); }), { threshold: 0.4 }) : null;
  function numeros(raiz) { if (!ioNum || !raiz.querySelectorAll) return; raiz.querySelectorAll(NUMS).forEach((el) => { if (!el._miObs) { el._miObs = 1; ioNum.observe(el); } }); }

  // ------------------------------------------------------------ contenido que aparece después (listas, tarjetas dinámicas)
  let pendiente = 0;
  const propio = (m) => { const n = m.target.nodeType === 1 ? m.target : m.target.parentElement; return !!(n && n._miBusy); };
  const obs = new MutationObserver((muts) => {
    if (pendiente || muts.every(propio)) return;
    pendiente = requestAnimationFrame(() => { pendiente = 0; preparar(document); numeros(document); reintentarNumeros(); });
  });
  function reintentarNumeros() { document.querySelectorAll(NUMS).forEach((el) => { if (!el.dataset.miContado && !el._miBusy) { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) contar(el); } }); }

  function iniciar() {
    preparar(document); numeros(document);
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
