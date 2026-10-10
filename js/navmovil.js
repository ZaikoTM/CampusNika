/* Menú hamburguesa para celular y tablet. Toma los enlaces de .nav-links; si no hay, no hace nada. */
(function () {
  'use strict';
  var nav = document.querySelector('.public-nav');
  var links = document.querySelectorAll('.public-nav .nav-links a');
  if (!nav || !links.length) return;
  var actions = nav.querySelector('.nav-actions') || nav;
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'nm-burger'; btn.setAttribute('aria-label', 'Abrir menú'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'nm-panel');
  btn.innerHTML = '<i></i><i></i><i></i>';
  actions.appendChild(btn);

  var veil = document.createElement('div'); veil.className = 'nm-veil';
  var panel = document.createElement('div'); panel.className = 'nm-panel'; panel.id = 'nm-panel'; panel.setAttribute('role', 'navigation'); panel.setAttribute('aria-label', 'Menú principal');
  Array.prototype.forEach.call(links, function (a, i) {
    var c = document.createElement('a');
    c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); c.style.setProperty('--i', i);
    if (/guias\.html/.test(c.href)) c.className = 'nm-hi';
    panel.appendChild(c);
  });
  document.body.appendChild(veil); document.body.appendChild(panel);

  function setOpen(o) {
    panel.classList.toggle('open', o); veil.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', String(o)); btn.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = o ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  veil.addEventListener('click', function () { setOpen(false); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
})();
