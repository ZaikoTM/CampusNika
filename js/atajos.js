// js/atajos.js
// CAMPUS NIKA — Atajos rápidos de teclado (globales)
//
//   Espacio   -> iniciar / pausar el Pomodoro (sala de estudio)
//   1 2 3 4   -> elegir la opción A B C D (simuladores de examen y duelos Versus)
//   Escape    -> cerrar el modal / panel abierto (el de más arriba)
//
// No se dispara si el foco está en un input, textarea, select o elemento
// contenteditable, ni con Ctrl / Alt / Meta apretados.

const NikaAtajos = (() => {
  // Cierres "limpios" de los modales conocidos (los que tienen lógica propia al cerrar)
  const CIERRES = {
    'balance-dia-modal': () => window.cerrarBalanceDia && window.cerrarBalanceDia(),
    'editar-evento-modal': () => window.cerrarEditarEvento && window.cerrarEditarEvento(),
    'avatar-crop-modal': () => window.cancelarRecorteAvatar && window.cancelarRecorteAvatar(),
    'public-profile-modal': () => window.closePublicProfileModal && window.closePublicProfileModal(),
    'friends-modal': () => window.closeFriendsModal && window.closeFriendsModal(),
    'profile-modal': () => window.closeProfileModal && window.closeProfileModal(),
    'rendimiento-detalle-modal': () => window.cerrarDetalleRendimiento && window.cerrarDetalleRendimiento(),
    'modal-calendario-nika': () => window.cerrarModalCalendario && window.cerrarModalCalendario(),
    'modal-agendar-repaso': () => window.cerrarModalAgendarRepaso && window.cerrarModalAgendarRepaso(),
    'modal-secciones-up': () => window.cerrarModalSeccionesUP && window.cerrarModalSeccionesUP(),
    'simuladores-hub-modal': () => window.closeSimuladoresHub && window.closeSimuladoresHub(),
    'info-modal': () => window.closeInfoModal && window.closeInfoModal(),
    'about-creator-modal': () => window.closeAboutCreatorModal && window.closeAboutCreatorModal(),
    'modal-editar-evento': () => window.cerrarModalEditarEvento && window.cerrarModalEditarEvento(),
  };

  function estaEscribiendo(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'input') {
      // radios / checkboxes / botones no "escriben": no deben bloquear los atajos
      const t = (el.type || '').toLowerCase();
      return !['radio', 'checkbox', 'button', 'submit', 'range', 'file'].includes(t);
    }
    return tag === 'textarea' || tag === 'select' || el.isContentEditable === true;
  }

  const visible = (el) => {
    if (!el) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length > 0;
  };

  // ---- Escape ----
  function cerrarTopModal() {
    // Panel del chat rápido del duelo / asistente
    const overlays = Array.from(document.querySelectorAll(
      '.modal-overlay, .nika-modal-overlay, [id^="modal-"], #leaderboard-modal, #nika-racha-pop.open'
    )).filter(visible);
    if (overlays.length) {
      overlays.sort((a, b) => (parseInt(getComputedStyle(b).zIndex, 10) || 0) - (parseInt(getComputedStyle(a).zIndex, 10) || 0));
      const el = overlays[0];
      if (el.id === 'nika-racha-pop') { el.classList.remove('open'); return true; }
      if (CIERRES[el.id]) { CIERRES[el.id](); if (visible(el)) el.style.display = 'none'; return true; }
      // Botón de cierre propio del modal (Cerrar / Cancelar / ✕)
      const cierre = Array.from(el.querySelectorAll('button')).find((b) => /^(cerrar|cancelar|✕|×|x)$/i.test(b.textContent.trim()) || /cerrar|close/i.test(b.getAttribute('aria-label') || ''));
      if (cierre) { cierre.click(); if (visible(el)) el.style.display = 'none'; return true; }
      el.style.display = 'none';
      return true;
    }
    const chat = document.querySelector('#chat-panel.show, #nika-assistant-panel.open');
    if (chat) {
      if (chat.id === 'chat-panel' && window.toggleChatPanel) window.toggleChatPanel();
      else chat.classList.remove('show', 'open');
      return true;
    }
    return false;
  }

  // ---- 1..4 ----
  function elegirOpcion(idx) {
    // Versus: botones .option-btn (el orden en pantalla es el barajado local)
    const vs = document.querySelectorAll('#view-duelo.active #options-grid .option-btn');
    if (vs.length) {
      const b = vs[idx];
      if (b && !b.disabled) { b.click(); return true; }
      return b ? true : false;
    }
    // Simuladores de examen: <label class="option-wrap"><input type="radio">
    const quiz = document.getElementById('quiz-screen');
    if (quiz && visible(quiz)) {
      const l = quiz.querySelectorAll('.option-wrap')[idx];
      if (l) { l.click(); return true; }
    }
    return false;
  }

  // ---- Espacio ----
  function alternarPomodoro() {
    const eng = window.PomodoroEngine;
    // Solo en la sala de estudio y con el panel del Pomodoro presente
    if (!eng || !document.getElementById('pomodoro-placeholder')) return false;
    const st = eng.getState();
    if (st.shared && st.shared.role === 'guest') return false; // el invitado no controla el reloj
    if (st.status === 'running') { eng.pause(); return true; }
    if (!st.upId && !st.moduleId) return false; // todavía no se abrió ninguna UP
    eng.start();
    return true;
  }

  function onKeyDown(e) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    if (e.key === 'Escape') { if (cerrarTopModal()) e.preventDefault(); return; }
    if (estaEscribiendo(e.target)) return;

    if (e.key === ' ' || e.code === 'Space') {
      // Sobre un botón/enlace, el espacio ya activa ese control: no lo pisamos
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'button' || tag === 'a' || tag === 'summary') return;
      if (alternarPomodoro()) e.preventDefault();
      return;
    }
    if (/^[1-4]$/.test(e.key)) {
      if (elegirOpcion(Number(e.key) - 1)) e.preventDefault();
    }
  }

  window.addEventListener('keydown', onKeyDown);
  return { cerrarTopModal };
})();

window.NikaAtajos = NikaAtajos;
