// js/onboardingTour.js
// CAMPUS NIKA — Recorrido Virtual (Onboarding Tour)
//
// Reemplaza los viejos modales estáticos de "Tutorial Rápido" y "Manual de
// Usuario" por una guía interactiva paso a paso que resalta los elementos
// REALES de la pantalla (spotlight + tooltip), unificando ambas experiencias
// en un solo recorrido. 100% JS/CSS nativo, sin dependencias externas.
//
// Uso: NikaOnboarding.iniciar()  (ver botón "🧭 Recorrido Guiado" en el sidebar)

const NikaOnboarding = (() => {
  const STORAGE_KEY = 'nika_onboarding_visto';

  // Cada paso apunta a un selector real del DOM. Si un paso no existe en la
  // página actual (ej. el usuario no está logueado y no hay sidebar de admin),
  // se salta solo — ver _pasosValidos().
  const PASOS = [
    {
      selector: '#appSidebar',
      titulo: '👋 Bienvenido a Campus Nika',
      texto: 'Este es tu menú principal: desde acá accedés a módulos, exámenes, comunidad y todas las herramientas de la plataforma.',
      posicion: 'right',
    },
    {
      selector: '.action-buttons-grid',
      titulo: '⚡ Accesos rápidos',
      texto: 'Arrancá un simulacro choice, un examen escrito evaluado por IA, o desafiá a un compañero en un duelo 1vs1 — todo desde acá.',
      posicion: 'bottom',
    },
    {
      selector: '#mi-rendimiento-widget',
      titulo: '📊 Mi Rendimiento Académico',
      texto: 'Seguí tu tiempo de estudio, tu efectividad en los simulacros, tu racha diaria y el Radar Clínico por área. Tocá cada tarjeta para ver el detalle.',
      posicion: 'top',
    },
    {
      selector: '#dashboard-community-widget',
      titulo: '🟢 Compañeros conectados',
      texto: 'Mirá quién está estudiando ahora mismo y sincronizá un Pomodoro en Modo Biblioteca con un amigo.',
      posicion: 'top',
    },
    {
      selector: '#modulos-section',
      titulo: '📚 Plan de Estudios',
      texto: 'Todos los módulos clínicos organizados por año. Entrá a cada Unidad Problema con su temario, algoritmos y videos.',
      posicion: 'top',
    },
    {
      selector: '[onclick="openVersusModal()"]',
      titulo: '⚔️ Modo Versus 1vs1',
      texto: 'Retá a un compañero a un duelo cronometrado. Cada victoria suma ELO y te hace subir en el Ranking Global.',
      posicion: 'right',
    },
    {
      selector: '[onclick="toggleDarkMode()"]',
      titulo: '🌙 A tu gusto',
      texto: 'Activá el modo oscuro cuando quieras. ¡Eso es todo! Ya conocés lo esencial de Campus Nika.',
      posicion: 'right',
    },
  ];

  let pasoActual = 0;
  let pasosActivos = [];
  let overlay = null, spot = null, tooltip = null;
  let onResizeHandler = null;
  let onKeyHandler = null;
  // Callback opcional pasado a iniciar(): se dispara una sola vez, al terminar
  // o saltear el tour (por cualquier vía). Lo usa el disparo automático del
  // primer ingreso para persistir profiles.onboarding_completado en Supabase;
  // el botón manual del sidebar simplemente no pasa callback.
  let _alFinalizarCallback = null;

  function _crearDom() {
    overlay = document.createElement('div');
    overlay.className = 'nika-tour-overlay';
    overlay.addEventListener('click', saltar);

    spot = document.createElement('div');
    spot.className = 'nika-tour-spotlight';

    tooltip = document.createElement('div');
    tooltip.className = 'nika-tour-tooltip';
    tooltip.addEventListener('click', (e) => e.stopPropagation());

    document.body.appendChild(overlay);
    document.body.appendChild(spot);
    document.body.appendChild(tooltip);
  }

  function _destruirDom() {
    [overlay, spot, tooltip].forEach((el) => el && el.remove());
    overlay = spot = tooltip = null;
    if (onResizeHandler) window.removeEventListener('resize', onResizeHandler);
    if (onKeyHandler) window.removeEventListener('keydown', onKeyHandler);
  }

  function _render() {
    if (pasoActual >= pasosActivos.length) { finalizar(); return; }
    const paso = pasosActivos[pasoActual];
    const el = document.querySelector(paso.selector);
    if (!el) { pasoActual++; _render(); return; }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Esperamos a que termine el scroll suave antes de medir posiciones.
    setTimeout(() => {
      if (!spot || !tooltip) return; // el tour pudo cerrarse durante el timeout
      const r = el.getBoundingClientRect();
      const pad = 8;
      spot.style.top = `${r.top - pad}px`;
      spot.style.left = `${r.left - pad}px`;
      spot.style.width = `${r.width + pad * 2}px`;
      spot.style.height = `${r.height + pad * 2}px`;

      const esUltimo = pasoActual === pasosActivos.length - 1;
      tooltip.innerHTML = `
        <div class="nika-tour-progress">Paso ${pasoActual + 1} de ${pasosActivos.length}</div>
        <h4>${paso.titulo}</h4>
        <p>${paso.texto}</p>
        <div class="nika-tour-dots">${pasosActivos.map((_, i) => `<span class="nika-tour-dot${i === pasoActual ? ' active' : ''}"></span>`).join('')}</div>
        <div class="nika-tour-actions">
          <button type="button" class="nika-tour-skip" onclick="NikaOnboarding.saltar()">Saltar</button>
          <div style="display:flex; gap:8px;">
            ${pasoActual > 0 ? `<button type="button" class="nika-tour-prev" onclick="NikaOnboarding.anterior()">← Atrás</button>` : ''}
            <button type="button" class="nika-tour-next" onclick="NikaOnboarding.siguiente()">${esUltimo ? 'Entendido ✓' : 'Siguiente →'}</button>
          </div>
        </div>
      `;

      const tr = tooltip.getBoundingClientRect();
      const margin = 16;
      let top, left;
      if (paso.posicion === 'right') { top = r.top; left = r.right + margin; }
      else if (paso.posicion === 'bottom') { top = r.bottom + margin; left = r.left; }
      else { top = r.top - tr.height - margin; left = r.left; }

      // En mobile, o si no entra a los costados, lo centramos abajo del todo.
      if (left + tr.width > window.innerWidth - margin || left < margin || window.innerWidth < 720) {
        left = Math.max(margin, (window.innerWidth - tr.width) / 2);
      }
      top = Math.max(margin, Math.min(top, window.innerHeight - tr.height - margin));
      left = Math.max(margin, Math.min(left, window.innerWidth - tr.width - margin));
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }, 320);
  }

  function iniciar(onFinalizar) {
    // onFinalizar (opcional): función invocada una única vez cuando el tour
    // termina o se saltea. La usa el disparo automático del primer ingreso;
    // el botón manual del sidebar la deja indefinida.
    _alFinalizarCallback = typeof onFinalizar === 'function' ? onFinalizar : null;

    // En mobile el sidebar suele estar oculto por transform; lo abrimos para
    // que el primer paso (el propio sidebar) sea visible.
    const sidebar = document.getElementById('appSidebar');
    if (sidebar && window.innerWidth < 900) sidebar.classList.add('sidebar-open');

    pasosActivos = PASOS.filter((p) => document.querySelector(p.selector));
    if (!pasosActivos.length) {
        if (typeof showToast === 'function') showToast('No hay nada para recorrer en esta pantalla todavía.');
        // Si no hay nada que recorrer todavía igual avisamos al llamador (por
        // ejemplo, para no dejar profiles.onboarding_completado en false para
        // siempre si el usuario entra a una pantalla sin pasos válidos).
        if (_alFinalizarCallback) { const cb = _alFinalizarCallback; _alFinalizarCallback = null; cb(); }
        return;
    }

    pasoActual = 0;
    _crearDom();

    onResizeHandler = () => _render();
    window.addEventListener('resize', onResizeHandler);

    onKeyHandler = (e) => {
      if (e.key === 'Escape') saltar();
      else if (e.key === 'ArrowRight') siguiente();
      else if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', onKeyHandler);

    _render();
  }

  function siguiente() { pasoActual++; _render(); }
  function anterior() { pasoActual = Math.max(0, pasoActual - 1); _render(); }
  function saltar() { finalizar(); }

  function finalizar() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    _destruirDom();
    if (_alFinalizarCallback) {
      const cb = _alFinalizarCallback;
      _alFinalizarCallback = null;
      cb();
    }
  }

  function yaVisto() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) { return false; }
  }

  return { iniciar, siguiente, anterior, saltar, finalizar, yaVisto };
})();

window.NikaOnboarding = NikaOnboarding;
