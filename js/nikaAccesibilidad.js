/* CAMPUS NIKA · accesibilidad: tamaño de letra, reducir movimiento y alto contraste.
   Las preferencias se guardan en este dispositivo y se aplican en todas las páginas que cargan este archivo.
   Panel: window.NikaAccesibilidad.abrir() (botón "Accesibilidad" del menú lateral). */
(function () {
  'use strict';
  if (window.NikaAccesibilidad) return;
  const KEY = 'nika_accesibilidad';
  const base = { fs: 0, rm: false, hc: false };
  let p = Object.assign({}, base);
  try { p = Object.assign(p, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (_) {}

  function aplicar() {
    const h = document.documentElement;
    h.classList.remove('nk-fs-1', 'nk-fs-2', 'nk-fs-3');
    if (p.fs > 0) h.classList.add('nk-fs-' + Math.min(3, p.fs));
    h.classList.toggle('nk-rm', !!p.rm);
    h.classList.toggle('nk-hc', !!p.hc);
  }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (_) {} aplicar(); pintar(); }

  function css() {
    if (document.getElementById('nk-a11y-css')) return;
    const l = document.createElement('link'); l.id = 'nk-a11y-css'; l.rel = 'stylesheet'; l.href = 'css/accesibilidad.css?v=1'; document.head.appendChild(l);
  }

  function pintar() {
    const m = document.getElementById('nk-a11y'); if (!m) return;
    m.querySelector('[data-fs]').textContent = ['Normal', 'Grande', 'Más grande', 'Máxima'][p.fs] || 'Normal';
    m.querySelector('[data-k="rm"]').setAttribute('aria-pressed', String(!!p.rm));
    m.querySelector('[data-k="hc"]').setAttribute('aria-pressed', String(!!p.hc));
  }

  function abrir() {
    css();
    let m = document.getElementById('nk-a11y');
    if (!m) {
      m = document.createElement('div'); m.id = 'nk-a11y'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Accesibilidad');
      m.innerHTML = '<div class="nk-a11y-card"><h3>Accesibilidad</h3>'
        + '<div class="nk-a11y-row"><span>Tamaño de letra</span><div><button type="button" data-a="menos" aria-label="Reducir letra">A−</button><b data-fs>Normal</b><button type="button" data-a="mas" aria-label="Agrandar letra">A+</button></div></div>'
        + '<div class="nk-a11y-row"><span>Reducir movimiento y animaciones</span><button type="button" class="nk-a11y-sw" data-k="rm" aria-pressed="false"><i></i></button></div>'
        + '<div class="nk-a11y-row"><span>Alto contraste</span><button type="button" class="nk-a11y-sw" data-k="hc" aria-pressed="false"><i></i></button></div>'
        + '<div class="nk-a11y-row"><button type="button" class="nk-a11y-reset" data-a="reset">Restablecer</button><button type="button" class="nk-a11y-ok" data-a="cerrar">Listo</button></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click', (e) => {
        const t = e.target; if (t === m) return cerrar();
        const a = t.closest && t.closest('[data-a]'), k = t.closest && t.closest('[data-k]');
        if (a) { const x = a.dataset.a; if (x === 'mas') p.fs = Math.min(3, p.fs + 1); else if (x === 'menos') p.fs = Math.max(0, p.fs - 1); else if (x === 'reset') p = Object.assign({}, base); else if (x === 'cerrar') return cerrar(); guardar(); }
        if (k) { p[k.dataset.k] = !p[k.dataset.k]; guardar(); }
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    }
    m.classList.add('abierto'); pintar();
    const b = m.querySelector('.nk-a11y-ok'); if (b) b.focus();
  }
  function cerrar() { const m = document.getElementById('nk-a11y'); if (m) m.classList.remove('abierto'); }

  window.NikaAccesibilidad = { abrir, cerrar };
  css(); aplicar();
})();
