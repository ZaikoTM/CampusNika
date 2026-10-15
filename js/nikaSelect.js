// js/nikaSelect.js — menús desplegables con el estilo Nika (reemplaza la lista nativa del sistema, que no se puede estilizar).
// El <select> original queda en el DOM (oculto) y sigue siendo la fuente de verdad: se le dispara "change" como siempre.
// Uso: NikaSelect.observar('#contenedor') para que mejore todos los select que aparezcan (aunque se redibuje el contenido).
(function () {
  'use strict';
  if (window.NikaSelect) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let abierto = null;

  function cerrar() {
    if (!abierto) return;
    abierto.wrap.classList.remove('abierto'); abierto.lista.hidden = true; abierto.btn.setAttribute('aria-expanded', 'false');
    if (abierto.wrap.parentElement) abierto.wrap.parentElement.classList.remove('nsel-sube');
    abierto = null;
  }

  function mejorar(sel) {
    if (!sel || sel.dataset.nsel === '1' || sel.multiple) return;
    sel.dataset.nsel = '1';
    const wrap = document.createElement('div'); wrap.className = 'nsel';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'nsel-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    if (sel.getAttribute('aria-label')) btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
    const lista = document.createElement('div'); lista.className = 'nsel-lista'; lista.setAttribute('role', 'listbox'); lista.hidden = true;
    sel.classList.add('nsel-nativo');
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel); wrap.appendChild(btn); wrap.appendChild(lista);

    const texto = () => { const o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; };
    const pintarBtn = () => { btn.innerHTML = '<span class="nsel-t">' + esc(texto()) + '</span><i class="nsel-flecha" aria-hidden="true"></i>'; btn.disabled = sel.disabled; };
    const llenar = () => {
      lista.innerHTML = '';
      Array.prototype.forEach.call(sel.options, (o, i) => {
        const it = document.createElement('button'); it.type = 'button'; it.className = 'nsel-op' + (i === sel.selectedIndex ? ' on' : '');
        it.setAttribute('role', 'option'); it.setAttribute('aria-selected', String(i === sel.selectedIndex)); it.disabled = o.disabled;
        it.innerHTML = '<span>' + esc(o.textContent) + '</span>' + (i === sel.selectedIndex ? '<b aria-hidden="true">✓</b>' : '');
        it.addEventListener('click', () => {
          sel.selectedIndex = i; cerrar(); pintarBtn();
          sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true }));
        });
        lista.appendChild(it);
      });
    };
    const abrir = () => {
      if (sel.disabled) return;
      cerrar(); pintarBtn(); llenar();
      wrap.classList.add('abierto'); lista.hidden = false; btn.setAttribute('aria-expanded', 'true');
      if (wrap.parentElement) wrap.parentElement.classList.add('nsel-sube');   // el contenedor pasa por encima de sus vecinos
      // si no entra hacia abajo, se abre hacia arriba
      const r = btn.getBoundingClientRect(), alto = Math.min(280, lista.scrollHeight + 8);
      wrap.classList.toggle('arriba', window.innerHeight - r.bottom < alto + 12 && r.top > alto + 12);
      abierto = { wrap, lista, btn };
      const on = lista.querySelector('.nsel-op.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (abierto && abierto.btn === btn) cerrar(); else abrir(); });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const d = e.key === 'ArrowDown' ? 1 : -1, n = Math.min(sel.options.length - 1, Math.max(0, sel.selectedIndex + d));
        if (n !== sel.selectedIndex) { sel.selectedIndex = n; pintarBtn(); sel.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    });
    sel.addEventListener('change', pintarBtn);
    wrap._refrescar = pintarBtn;
    pintarBtn();
  }

  function mejorarTodo(raiz) { (raiz || document).querySelectorAll('select:not([data-nsel]):not([data-nsel-no])').forEach(mejorar); }
  function refrescar(raiz) { (raiz || document).querySelectorAll('.nsel').forEach((w) => { if (w._refrescar) w._refrescar(); }); }

  function observar(selector) {
    const r = document.querySelector(selector); if (!r) return;
    mejorarTodo(r);
    let t = null;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { mejorarTodo(r); refrescar(r); }, 30); }).observe(r, { childList: true, subtree: true });
  }

  document.addEventListener('click', (e) => { if (abierto && !abierto.wrap.contains(e.target)) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  window.addEventListener('scroll', (e) => { if (abierto && !(e.target && e.target.nodeType === 1 && abierto.lista.contains(e.target))) cerrar(); }, true);
  window.addEventListener('resize', cerrar);

  window.NikaSelect = { mejorar, mejorarTodo, observar, refrescar, cerrar };
})();
