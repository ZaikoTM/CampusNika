// js/onboardingTour.js
// CAMPUS NIKA — Recorrido guiado (Onboarding Tour)
//
// Guía interactiva paso a paso que resalta elementos REALES de la pantalla (spotlight + tarjeta) y, al
// principio y al final, muestra tarjetas centradas de bienvenida y cierre. 100% JS/CSS nativo.
// Si un paso apunta a algo que no existe o no se ve (p. ej. la racha sin sesión iniciada) se salta solo.
//
// Uso: NikaOnboarding.iniciar()  (botón "🧭 Recorrido Guiado" del sidebar)
// Teclado: → / Enter siguiente · ← atrás · Esc salir.

const NikaOnboarding = (() => {
  const STORAGE_KEY = 'nika_onboarding_visto';
  const VERSION = 2;   // subir si se agregan pasos importantes: el tour manual siempre está disponible

  // selector ausente => tarjeta centrada (bienvenida / cierre)
  const PASOS = [
    {
      icono: '👋', categoria: 'Bienvenida', color: '#0284c7',
      titulo: '¡Bienvenido a Campus Nika!',
      texto: 'En un par de minutos vas a conocer todo lo que podés hacer acá. Esto es lo nuevo y lo esencial:',
      lista: ['📅 Planificación diaria y Cierre del día', '🍅 Pomodoro, racha y Liga con rangos médicos', '📹 Sala de Ateneos y 💬 Foro académico', '🎵 NikaMusic, 💊 NikaFarma y ⚔️ Duelos 1vs1'],
    },
    {
      selector: '#appSidebar', icono: '🧭', categoria: 'Navegación', color: '#0284c7', posicion: 'right',
      titulo: 'Tu menú principal',
      texto: 'Desde acá llegás a los módulos, exámenes, comunidad y herramientas. Las secciones grandes (Liga, Ateneos, Foro) se abren en su propia página para no cargar el campus.',
    },
    {
      selector: '#plan-card', icono: '📅', categoria: 'Planificación', color: '#f59e0b', posicion: 'bottom',
      titulo: 'Próximos eventos y planificación',
      texto: 'Tus bloques de estudio de hoy y tus próximos parciales o repasos, con los días que faltan.',
      lista: ['Tocá un evento para editarlo o borrarlo', '“Ir →” te lleva directo a esa UP en la sala de estudio', 'Se arma desde el cronograma de la sala de estudio'],
    },
    {
      selector: '.plan-btn-balance', icono: '📊', categoria: 'Planificación', color: '#f59e0b', posicion: 'bottom',
      titulo: 'Cierre del día',
      texto: 'Al terminar la jornada mirá cuántos bloques cumpliste y cuánto estudiaste de verdad con Pomodoro.',
      lista: ['Planificado vs. cumplido, con porcentaje', 'Minutos reales de Pomodoro', 'Reprogramá para mañana lo que quedó pendiente'],
    },
    {
      selector: '.action-btn-card[onclick*="modulos-section"]', icono: '📖', categoria: 'Estudio', color: '#0ea5e9', posicion: 'bottom',
      titulo: 'Sala de Estudio con Pomodoro',
      texto: 'Elegí una Unidad Problema y estudiá con material, notas y un Pomodoro interactivo.',
      lista: ['Barra espaciadora: iniciar / pausar el reloj', 'Bloques de estudio con estados y alertas', 'Cronograma de repaso conectado al calendario'],
    },
    {
      selector: '#mi-rendimiento-widget', icono: '📈', categoria: 'Rendimiento', color: '#22c55e', posicion: 'top',
      titulo: 'Mi Rendimiento Académico',
      texto: 'Tu tiempo de estudio, efectividad en simulacros y Curva del Olvido. Tocá cualquier tarjeta para ver su desglose completo.',
    },
    {
      selector: '#nika-racha-btn', icono: '🔥', categoria: 'Constancia', color: '#f97316', posicion: 'bottom',
      titulo: 'Tu racha diaria',
      texto: 'Suma un día por cada jornada con al menos un Pomodoro o un simulacro. Tocala para ver tus últimos 7 días.',
    },
    {
      selector: '#sidebar-liga-btn', icono: '🍅', categoria: 'Competencia', color: '#dc2626', posicion: 'right',
      titulo: 'Liga Pomodoro',
      texto: 'Ranking de estudio por hoy, semana, mes o histórico. Subí de Ciclo Clínico a Jefe de Residentes acumulando horas.',
      lista: ['Podio y tabla con auditoría de sesiones', 'Tu posición y lo que te falta para el puesto siguiente'],
    },
    {
      selector: '#sidebar-ateneos-btn', icono: '📹', categoria: 'Comunidad', color: '#8b5cf6', posicion: 'right',
      titulo: 'Sala de Ateneos',
      texto: 'Videollamadas entre compañeros (hasta 4) para discutir casos, estudiar en silencio o preparar mesas.',
      lista: ['Canales: Ateneo General, Guardia Silenciosa, Pase de Guardia', 'Compartí pantalla, silenciate con Ctrl + M', 'Salas privadas con código o invitación a un amigo'],
    },
    {
      selector: '#sidebar-foro-btn', icono: '💬', categoria: 'Comunidad', color: '#0ea5e9', posicion: 'right',
      titulo: 'Foro Académico',
      texto: 'Un muro de casos clínicos, dudas y apuntes.',
      lista: ['Reacciones: Útil, Excelente caso, Buena duda', 'Comentarios en hilo y adjuntos (imagen o PDF)', 'Compartí una publicación por chat privado'],
    },
    {
      selector: '.action-btn-card[onclick="openVersusModal()"]', icono: '⚔️', categoria: 'Competencia', color: '#ef4444', posicion: 'bottom',
      titulo: 'Duelos Versus 1vs1',
      texto: 'Retá a un compañero a un duelo cronometrado con chat rápido. Cada victoria suma ELO.',
      lista: ['Elegí la opción con las teclas 1 a 4', 'Invitá desde el perfil de un amigo'],
    },
    {
      selector: '#sidebar-music-btn', icono: '🎵', categoria: 'Concentración', color: '#1db954', posicion: 'right',
      titulo: 'NikaMusic',
      texto: 'Música para concentrarte sin salir del campus, en una ventana que se arrastra y se minimiza.',
      lista: ['Sin login: playlists de Spotify y sonidos de lluvia, café o ruido blanco', 'Con tu cuenta de Spotify (Premium): tus playlists y buscador', 'Sigue sonando aunque cierres la ventana'],
    },
    {
      selector: '.action-btn-card[onclick*="nikafarma"]', icono: '💊', categoria: 'Guardia', color: '#14b8a6', posicion: 'bottom',
      titulo: 'NikaFarma potenciado',
      texto: 'Vademécum y decisión clínica para la guardia.',
      lista: ['Escribí NAC, ITU o celulitis y ves el esquema al instante', 'Scores: CURB-65, qSOFA, Wells y clearance de creatinina', 'Modo Emergencias y dosis pediátricas por peso'],
    },
    {
      selector: '#card-simuladores', icono: '🩺', categoria: 'Exámenes', color: '#0284c7', posicion: 'bottom',
      titulo: 'Simuladores',
      texto: 'Seis modalidades de examen: Choice (gratis) y los simuladores con IA de NikaMed+.',
    },
    {
      selector: '#dashboard-community-widget', icono: '🟢', categoria: 'Comunidad', color: '#22c55e', posicion: 'top',
      titulo: 'Compañeros conectados',
      texto: 'Mirá quién está estudiando ahora. Tocá a un compañero para ver su perfil, o sincronizá un Pomodoro en Modo Biblioteca.',
    },
    {
      selector: '#modulos-section', icono: '📚', categoria: 'Estudio', color: '#0284c7', posicion: 'top',
      titulo: 'Plan de Estudios',
      texto: 'Todos los módulos clínicos organizados por año. Entrá a cada Unidad Problema con su temario, algoritmos y videos.',
    },
    {
      icono: '🚀', categoria: 'Listo', color: '#2563eb',
      titulo: '¡Ya está! Atajos que te van a servir',
      texto: 'Podés repetir este recorrido cuando quieras desde “🧭 Recorrido Guiado”, en el menú.',
      lista: ['Espacio: iniciar / pausar el Pomodoro', '1 · 2 · 3 · 4: elegir la opción A, B, C o D', 'Ctrl + M: silenciar en la Sala de Ateneos', 'Esc: cerrar cualquier ventana'],
    },
  ];

  let pasoActual = 0;
  let pasosActivos = [];
  let overlay = null, spot = null, tooltip = null;
  let onResizeHandler = null, onKeyHandler = null;
  let _alFinalizarCallback = null;

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const _visible = (sel) => { const el = document.querySelector(sel); return !!el && el.getClientRects().length > 0; };

  function _css() {
    if (document.getElementById('nt-css')) return;
    const st = document.createElement('style');
    st.id = 'nt-css';
    st.textContent = `
      .nt-overlay { position: fixed; inset: 0; background: rgba(6,10,20,.6); z-index: 20000; backdrop-filter: blur(1.5px); }
      .nt-spot { position: fixed; z-index: 20001; pointer-events: none; border-radius: 16px; border: 2px solid #38bdf8;
        box-shadow: 0 0 0 9999px rgba(6,10,20,.74), 0 0 0 4px rgba(56,189,248,.25), 0 0 28px 4px rgba(56,189,248,.55); transition: top .35s ease, left .35s ease, width .35s ease, height .35s ease; }
      .nt-spot.oculto { opacity: 0; }
      .nt-tooltip { position: fixed; z-index: 20002; width: min(360px, calc(100vw - 24px)); color: var(--text-main, #0f172a); background: var(--card-bg, #fff);
        border-radius: 22px; overflow: hidden; box-shadow: 0 30px 70px -18px rgba(2,132,199,.6), 0 0 0 1px rgba(56,189,248,.28); font-family: inherit; animation: ntIn .28s ease; transition: top .35s ease, left .35s ease; }
      .nt-tooltip.centrada { width: min(520px, calc(100vw - 24px)); top: 50% !important; left: 50% !important; transform: translate(-50%, -50%); transition: none; }
      @keyframes ntIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
      .nt-tooltip.centrada { animation: ntInC .3s ease; } @keyframes ntInC { from { opacity: 0; transform: translate(-50%, -46%) scale(.97); } to { opacity: 1; transform: translate(-50%, -50%); } }
      .nt-head { position: relative; display: flex; align-items: center; gap: 14px; padding: 18px 46px 16px 18px; color: #fff; background: linear-gradient(135deg, var(--c, #0284c7), #1e3a8a); }
      .nt-head::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 90% -20%, rgba(255,255,255,.28), transparent 55%); pointer-events: none; }
      .nt-ico { flex-shrink: 0; width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; background: rgba(255,255,255,.2); box-shadow: inset 0 0 0 1px rgba(255,255,255,.3); position: relative; z-index: 1; }
      .nt-tt { position: relative; z-index: 1; min-width: 0; }
      .nt-cat { display: inline-block; font-size: .62rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; padding: 2px 9px; border-radius: 999px; background: rgba(255,255,255,.22); margin-bottom: 4px; }
      .nt-tt h4 { margin: 0; font-size: 1.08rem; font-weight: 800; line-height: 1.25; }
      .nt-x { position: absolute; top: 10px; right: 10px; z-index: 2; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; background: rgba(255,255,255,.2); color: #fff; font-size: .9rem; }
      .nt-x:hover { background: rgba(255,255,255,.35); }
      .nt-body { padding: 16px 18px 6px; }
      .nt-body p { margin: 0 0 10px; font-size: .88rem; line-height: 1.55; color: var(--text-muted, #475569); }
      .nt-list { list-style: none; margin: 0 0 8px; padding: 0; display: grid; gap: 7px; }
      .nt-list li { position: relative; padding: 8px 12px 8px 34px; font-size: .82rem; font-weight: 600; line-height: 1.4; border-radius: 12px; background: var(--bg-body, #f1f5f9); color: var(--text-main, #0f172a); }
      .nt-list li::before { content: "✓"; position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; border-radius: 50%; font-size: .68rem; font-weight: 900; display: flex; align-items: center; justify-content: center; color: #fff; background: var(--c, #0284c7); }
      .nt-barra { height: 4px; margin: 12px 18px 0; border-radius: 4px; background: var(--border, #e2e8f0); overflow: hidden; }
      .nt-barra i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #22d3ee, var(--c, #0284c7), #2563eb); transition: width .3s ease; }
      .nt-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 18px 16px; }
      .nt-count { font-size: .72rem; font-weight: 800; color: var(--text-muted, #64748b); }
      .nt-btns { display: flex; align-items: center; gap: 8px; }
      .nt-skip { border: none; background: none; cursor: pointer; font-size: .76rem; font-weight: 700; color: var(--text-muted, #64748b); padding: 8px 4px; font-family: inherit; }
      .nt-skip:hover { color: var(--text-main, #0f172a); text-decoration: underline; }
      .nt-prev { border: 1px solid var(--border, #e2e8f0); background: var(--card-bg, #fff); color: var(--text-main, #0f172a); border-radius: 999px; padding: 9px 15px; font-size: .8rem; font-weight: 800; cursor: pointer; font-family: inherit; }
      .nt-next { border: none; border-radius: 999px; padding: 10px 20px; font-size: .82rem; font-weight: 800; cursor: pointer; color: #fff; font-family: inherit; background: linear-gradient(135deg, var(--c, #0284c7), #2563eb); box-shadow: 0 10px 20px -8px var(--c, #0284c7); transition: transform .15s, filter .2s; }
      .nt-next:hover { transform: translateY(-1px); filter: brightness(1.08); }
      @media (max-width: 480px) { .nt-count { display: none; } .nt-foot { justify-content: flex-end; } }
    `;
    document.head.appendChild(st);
  }

  function _crearDom() {
    _css();
    overlay = document.createElement('div'); overlay.className = 'nt-overlay'; overlay.addEventListener('click', saltar);
    spot = document.createElement('div'); spot.className = 'nt-spot oculto';
    tooltip = document.createElement('div'); tooltip.className = 'nt-tooltip'; tooltip.setAttribute('role', 'dialog'); tooltip.setAttribute('aria-modal', 'true');
    tooltip.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(overlay); document.body.appendChild(spot); document.body.appendChild(tooltip);
  }

  function _destruirDom() {
    [overlay, spot, tooltip].forEach((el) => el && el.remove());
    overlay = spot = tooltip = null;
    if (onResizeHandler) window.removeEventListener('resize', onResizeHandler);
    if (onKeyHandler) window.removeEventListener('keydown', onKeyHandler);
    onResizeHandler = onKeyHandler = null;
  }

  function _contenido(paso, esUltimo) {
    const n = pasosActivos.length, i = pasoActual;
    tooltip.style.setProperty('--c', paso.color || '#0284c7');
    tooltip.innerHTML = `
      <div class="nt-head"><span class="nt-ico" aria-hidden="true">${paso.icono}</span><div class="nt-tt"><span class="nt-cat">${esc(paso.categoria)}</span><h4>${esc(paso.titulo)}</h4></div>
        <button type="button" class="nt-x" aria-label="Cerrar recorrido" onclick="NikaOnboarding.saltar()">✕</button></div>
      <div class="nt-body"><p>${esc(paso.texto)}</p>${paso.lista ? `<ul class="nt-list">${paso.lista.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</div>
      <div class="nt-barra"><i style="width:${Math.round(((i + 1) / n) * 100)}%"></i></div>
      <div class="nt-foot"><span class="nt-count">Paso ${i + 1} de ${n}</span>
        <div class="nt-btns"><button type="button" class="nt-skip" onclick="NikaOnboarding.saltar()">${esUltimo ? '' : 'Saltar'}</button>
          ${i > 0 ? '<button type="button" class="nt-prev" onclick="NikaOnboarding.anterior()">← Atrás</button>' : ''}
          <button type="button" class="nt-next" onclick="NikaOnboarding.siguiente()">${esUltimo ? '¡Empezar! 🚀' : (i === 0 ? 'Comenzar →' : 'Siguiente →')}</button></div></div>`;
  }

  function _render() {
    if (pasoActual >= pasosActivos.length) { finalizar(); return; }
    const paso = pasosActivos[pasoActual];
    const esUltimo = pasoActual === pasosActivos.length - 1;

    // Tarjeta centrada (bienvenida / cierre)
    if (!paso.selector) {
      spot.classList.add('oculto');
      tooltip.classList.add('centrada');
      _contenido(paso, esUltimo);
      return;
    }
    const el = document.querySelector(paso.selector);
    if (!el || !el.getClientRects().length) { pasoActual++; _render(); return; }
    tooltip.classList.remove('centrada');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      if (!spot || !tooltip || pasosActivos[pasoActual] !== paso) return;
      const r = el.getBoundingClientRect();
      const pad = 8;
      spot.classList.remove('oculto');
      spot.style.top = `${r.top - pad}px`; spot.style.left = `${r.left - pad}px`;
      spot.style.width = `${r.width + pad * 2}px`; spot.style.height = `${r.height + pad * 2}px`;
      _contenido(paso, esUltimo);

      const tr = tooltip.getBoundingClientRect();
      const margin = 16;
      let top, left;
      if (paso.posicion === 'right') { top = r.top; left = r.right + margin; }
      else if (paso.posicion === 'bottom') { top = r.bottom + margin; left = r.left; }
      else { top = r.top - tr.height - margin; left = r.left; }
      if (left + tr.width > window.innerWidth - margin || left < margin || window.innerWidth < 720) left = Math.max(margin, (window.innerWidth - tr.width) / 2);
      if (paso.posicion === 'bottom' && top + tr.height > window.innerHeight - margin) top = r.top - tr.height - margin;   // no entra abajo: va arriba
      top = Math.max(margin, Math.min(top, window.innerHeight - tr.height - margin));
      left = Math.max(margin, Math.min(left, window.innerWidth - tr.width - margin));
      tooltip.style.top = `${top}px`; tooltip.style.left = `${left}px`;
    }, 340);
  }

  function iniciar(onFinalizar) {
    _alFinalizarCallback = typeof onFinalizar === 'function' ? onFinalizar : null;
    if (overlay) _destruirDom();

    const sidebar = document.getElementById('appSidebar');
    if (sidebar && window.innerWidth < 900) sidebar.classList.add('sidebar-open');

    // Los pasos con selector solo cuentan si el elemento existe y se ve; los centrados siempre
    pasosActivos = PASOS.filter((p) => !p.selector || _visible(p.selector));
    if (pasosActivos.filter((p) => p.selector).length === 0) {
      if (typeof showToast === 'function') showToast('No hay nada para recorrer en esta pantalla todavía.');
      if (_alFinalizarCallback) { const cb = _alFinalizarCallback; _alFinalizarCallback = null; cb(); }
      return;
    }
    pasoActual = 0;
    _crearDom();
    onResizeHandler = () => _render();
    window.addEventListener('resize', onResizeHandler);
    onKeyHandler = (e) => {
      if (e.key === 'Escape') saltar();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); siguiente(); }
      else if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', onKeyHandler);
    _render();
  }

  function siguiente() { pasoActual++; _render(); }
  function anterior() { pasoActual = Math.max(0, pasoActual - 1); _render(); }
  function saltar() { finalizar(); }

  function finalizar() {
    try { localStorage.setItem(STORAGE_KEY, '1'); localStorage.setItem(STORAGE_KEY + '_v', String(VERSION)); } catch (_) {}
    _destruirDom();
    if (_alFinalizarCallback) { const cb = _alFinalizarCallback; _alFinalizarCallback = null; cb(); }
  }

  function yaVisto() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) { return false; }
  }

  return { iniciar, siguiente, anterior, saltar, finalizar, yaVisto };
})();

window.NikaOnboarding = NikaOnboarding;
