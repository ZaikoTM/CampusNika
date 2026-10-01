// js/temaOscuro.js
// CAMPUS NIKA — Aplica el modo oscuro del campus (localStorage 'nika_theme') en las páginas sueltas que
// tienen su propio tema (estudio.html, cirugia_hub.html, gineco_hub.html). Se carga en el <head>.
(function () {
  'use strict';
  const oscuro = () => { try { return localStorage.getItem('nika_theme') === 'dark'; } catch (_) { return false; } };
  // Fondo inmediato: evita el destello blanco antes de que exista <body>.
  if (oscuro()) document.documentElement.classList.add('nika-oscuro');
  function aplicar() {
    const on = oscuro();
    document.documentElement.classList.toggle('nika-oscuro', on);
    if (document.body) { document.body.classList.toggle('dark-mode', on); document.body.dataset.tema = (location.pathname.split('/').pop() || '').replace('.html', ''); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar); else aplicar();
  // Si se cambia el tema desde otra pestaña del campus, esta página lo sigue.
  window.addEventListener('storage', (e) => { if (e.key === 'nika_theme') aplicar(); });
})();
