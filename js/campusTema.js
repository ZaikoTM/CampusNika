/* Campus NikaMed+ — selector de apariencia (Premium violeta / Clásico / Oscuro).
   Solo para NikaMed+ y admin. Por defecto, Premium. La elección queda en este dispositivo (localStorage).
   Los usuarios comunes siguen con el botón Modo Claro/Oscuro de siempre.
   Uso: CampusTema.setCuenta('admin' | 'plus' | null)  — lo llama aplicarRangoUsuario() de campus.html. */
(function () {
  'use strict';
  const KEY = 'nika_campus_tema';
  const OPCIONES = [
    { id: 'premium', ico: '💜', txt: 'Premium' },
    { id: 'clasico', ico: '☀️', txt: 'Clásico' },
    { id: 'oscuro', ico: '🌙', txt: 'Oscuro' },
  ];
  let cuenta = null;   // 'admin' | 'plus' | null

  const leer = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const guardar = (v) => { try { localStorage.setItem(KEY, v); } catch (_) {} };
  const valido = (v) => OPCIONES.some((o) => o.id === v);
  const elegible = () => cuenta === 'admin' || cuenta === 'plus';
  const actual = () => { const v = leer(); return valido(v) ? v : 'premium'; };

  function marca() {
    const box = document.querySelector('.sidebar-brand-box');
    if (!box) return;
    let chip = box.querySelector('.brand-chip');
    if (!chip) { chip = document.createElement('span'); chip.className = 'brand-chip'; box.appendChild(chip); }
    box.classList.toggle('brand-plus', elegible());
    box.classList.toggle('brand-admin', cuenta === 'admin');
    chip.textContent = cuenta === 'admin' ? '👑 Admin' : '✨ NikaMed+';
  }

  function selector() {
    const btn = document.getElementById('dark-mode-btn');
    const li = btn && btn.closest('li');
    if (!li) return;
    let sel = document.getElementById('cp-apariencia');
    if (!elegible()) { if (sel) sel.remove(); li.style.display = ''; return; }
    li.style.display = 'none';
    if (!sel) {
      sel = document.createElement('li'); sel.id = 'cp-apariencia'; sel.className = 'cp-apariencia';
      sel.innerHTML = '<small>Apariencia</small><div class="cp-opciones" role="radiogroup" aria-label="Apariencia del campus">' +
        OPCIONES.map((o) => `<button type="button" class="cp-op" role="radio" data-t="${o.id}"><span>${o.ico}</span>${o.txt}</button>`).join('') + '</div>';
      li.insertAdjacentElement('afterend', sel);
      sel.addEventListener('click', (e) => { const b = e.target.closest('.cp-op'); if (b) elegir(b.dataset.t); });
    }
    const a = actual();
    sel.querySelectorAll('.cp-op').forEach((b) => { const on = b.dataset.t === a; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
  }

  function aplicar() {
    const b = document.body; if (!b) return;
    if (elegible()) {
      const t = actual();
      b.classList.toggle('tema-premium', t === 'premium');
      b.classList.toggle('dark-mode', t !== 'clasico');      // el premium reutiliza los estilos oscuros ya existentes
    } else {
      b.classList.remove('tema-premium');
      let oscuro = false; try { oscuro = localStorage.getItem('nika_theme') === 'dark'; } catch (_) {}
      b.classList.toggle('dark-mode', oscuro);
    }
    marca(); selector();
  }

  function elegir(t) { if (!valido(t)) return; guardar(t); aplicar(); }
  function setCuenta(c) { cuenta = (c === 'admin' || c === 'plus') ? c : null; aplicar(); }

  window.CampusTema = { setCuenta, elegir, actual, aplicar };
})();
