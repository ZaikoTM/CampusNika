// CAMPUS NIKA — Barra superior de los simuladores en el celular: se compacta en una fila con menú ☰
// y se oculta al bajar (reaparece al subir) para que no tape la pregunta ni estorbe al navegar.
(function () {
  'use strict';
  var nav = document.querySelector('.navbar'); if (!nav) return;
  var acts = nav.querySelector('.navbar-actions'); if (!acts) return;
  var mq = window.matchMedia('(max-width: 768px)');

  var b = document.createElement('button');
  b.type = 'button'; b.className = 'nb-burger'; b.setAttribute('aria-label', 'Abrir menú de herramientas'); b.setAttribute('aria-expanded', 'false');
  b.innerHTML = '<span></span><span></span><span></span>';
  nav.insertBefore(b, acts);

  function cerrar() { nav.classList.remove('abierta'); b.setAttribute('aria-expanded', 'false'); }
  b.addEventListener('click', function () {
    var abrir = !nav.classList.contains('abierta');
    nav.classList.toggle('abierta', abrir); b.setAttribute('aria-expanded', String(abrir)); nav.classList.remove('nb-oculta');
  });
  // al elegir una herramienta el menú se cierra solo
  acts.addEventListener('click', function (e) { if (e.target.closest('button, a')) setTimeout(cerrar, 60); });

  var ultimo = window.scrollY, tAnterior = 0;
  window.addEventListener('scroll', function () {
    var ahora = Date.now(); if (ahora - tAnterior < 60) return; tAnterior = ahora;   // se evalúa cada ~60 ms
    if (!mq.matches) { nav.classList.remove('nb-oculta'); return; }
    var y = window.scrollY, dy = y - ultimo;
    if (nav.classList.contains('abierta')) { ultimo = y; return; }
    if (dy > 10 && y > 60) nav.classList.add('nb-oculta');
    else if (dy < -10 || y < 40) nav.classList.remove('nb-oculta');
    if (Math.abs(dy) > 10) ultimo = y;
  }, { passive: true });
  if (mq.addEventListener) mq.addEventListener('change', function () { if (!mq.matches) { cerrar(); nav.classList.remove('nb-oculta'); } });
})();
