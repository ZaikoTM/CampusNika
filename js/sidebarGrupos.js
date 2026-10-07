// Menú lateral del campus en grupos plegables. Convierte cada ".sidebar-category" (hija directa de .sidebar-menu) en un botón que
// pliega/despliega los ítems que le siguen. El estado se recuerda por grupo. No cambia ids ni eventos de los ítems.
(function () {
  'use strict';
  const KEY = 'nika_sb_cerrados';
  const leer = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } };
  const guardar = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (_) {} };

  function armar() {
    const ul = document.querySelector('.sidebar-menu'); if (!ul || ul.dataset.grupos) return;
    ul.dataset.grupos = '1';
    const cerrados = new Set(leer());
    const hijos = Array.from(ul.children);
    let i = 0;
    while (i < hijos.length) {
      const cab = hijos[i];
      if (!(cab.classList && cab.classList.contains('sidebar-category'))) { i++; continue; }
      const items = []; let j = i + 1;
      while (j < hijos.length && !(hijos[j].classList && hijos[j].classList.contains('sidebar-category'))) { items.push(hijos[j]); j++; }
      const titulo = cab.textContent.trim();
      const cuerpo = document.createElement('div'); cuerpo.className = 'sb-cuerpo';
      const interno = document.createElement('div'); interno.className = 'sb-interno';
      items.forEach((it) => interno.appendChild(it)); cuerpo.appendChild(interno); cab.after(cuerpo);
      cab.classList.add('sb-toggle'); cab.setAttribute('role', 'button'); cab.tabIndex = 0;
      cab.insertAdjacentHTML('beforeend', '<span class="sb-chev" aria-hidden="true">▾</span>');
      const cerrado = cerrados.has(titulo);
      cuerpo.classList.toggle('cerrado', cerrado); cab.setAttribute('aria-expanded', String(!cerrado));
      const alternar = () => {
        const c = cuerpo.classList.toggle('cerrado'); cab.setAttribute('aria-expanded', String(!c));
        const s = new Set(leer()); if (c) s.add(titulo); else s.delete(titulo); guardar(Array.from(s));
      };
      cab.addEventListener('click', alternar);
      cab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); } });
      i = j;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', armar); else armar();
})();
