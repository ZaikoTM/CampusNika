/* NikaNotif · notificaciones globales de NikaMed (se carga en todas las páginas con sesión).
   · Recibe en tiempo real las notificaciones de la tabla `notificaciones` (invitaciones a estudiar, notas compartidas...).
   · Tarjeta emergente animada con botones («Unirme» en un toque), campanita con historial, preferencias y amigos en línea.
   · TODAS suenan (tonos sintetizados con Web Audio, sin archivos): un tono distinto por tipo. Por defecto todo activado; cada persona
     puede silenciar por tipo o todo junto en Preferencias (campanita → ⚙️).
   · Pestaña minimizada: título parpadeante + aviso del sistema (Notification API). App cerrada: Web Push (ver suscribirPush).
   · No molestar: con pantalla completa o dentro de los simuladores no aparecen tarjetas ni suena nada (queda en la campanita).
   API: NikaNotif.enviar(para, tipo, titulo, cuerpo, datos) · NikaNotif.aviso(tipo, {titulo, cuerpo, ...}) · NikaNotif.sonar(tipo)
        NikaNotif.cartelAmistad(username) · NikaNotif.abrirCentro() · NikaNotif.estaEnLinea(username) */
(function () {
  'use strict';
  if (window.NikaNotif) return;

  const VAPID_PUBLICA = window.NIKA_VAPID_PUBLICA || 'BM3SxteEOHI-AJeZaG7iBLmPHVtSMh4Um5eyEDOpyMo5zlmpH8X_czHwKh6GskXL2rVtP_-3vP4WBUBInxk_A80';   // clave pública Web Push (la privada vive en los secretos de Supabase)
  const TIPOS = {
    invitacion_pomodoro: { ico: '🍅', nom: 'Invitaciones a estudiar', color: '#f97316' },
    nota_compartida: { ico: '📝', nom: 'Notas compartidas', color: '#a855f7' },
    mensaje: { ico: '💬', nom: 'Mensajes de amigos', color: '#38bdf8' },
    desafio: { ico: '⚔️', nom: 'Desafíos y retos', color: '#ef4444' },
    solicitud_amistad: { ico: '🤝', nom: 'Solicitudes de amistad', color: '#22c55e' },
    sistema: { ico: '🔔', nom: 'Avisos del sitio', color: '#eab308' },
  };
  const tipoDe = (t) => (t === 'reto' ? 'desafio' : (TIPOS[t] ? t : 'sistema'));
  const SIM_PAGINAS = /(nikasim|examen_oral|pfo_ecoe)\.html/i;   // simuladores: no molestar siempre

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sb = () => window.NikaSupabase && window.NikaSupabase.client;
  const yo = () => { try { return (window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername()) || (JSON.parse(localStorage.getItem('nika_currentUser') || 'null') || {}).username || null; } catch (_) { return null; } };
  const hayUsuario = () => { try { return !!JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) { return false; } };

  // ---------------------------------------------------------------- preferencias
  const LS_PREFS = 'nika_notif_prefs', LS_HIST = 'nika_notif_hist';
  const PREFS0 = { silencio: false, volumen: 0.7, sonido: {}, aviso: {}, invisible: false, push: true, sistema: true };
  let prefs = (() => { try { return Object.assign({}, PREFS0, JSON.parse(localStorage.getItem(LS_PREFS) || '{}')); } catch (_) { return Object.assign({}, PREFS0); } })();
  let guardarTimer = null;
  function guardarPrefs() {
    try { localStorage.setItem(LS_PREFS, JSON.stringify(prefs)); } catch (_) {}
    clearTimeout(guardarTimer);
    guardarTimer = setTimeout(async () => {
      try { const c = sb(), u = uid; if (c && u) await c.from('notif_preferencias').upsert({ user_id: u, prefs, actualizada_en: new Date().toISOString() }, { onConflict: 'user_id' }); } catch (_) {}
    }, 800);
  }
  const quiereSonido = (t) => !prefs.silencio && prefs.sonido[t] !== false;
  const quiereAviso = (t) => prefs.aviso[t] !== false;

  // ---------------------------------------------------------------- sonidos (Web Audio, sin archivos)
  let ctx = null, desbloqueado = false;
  function audio() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; if (!ctx || ctx.state === 'closed') ctx = new C(); return ctx; } catch (_) { return null; } }
  function desbloquear() {
    if (desbloqueado) return;
    const c = audio(); if (!c) return;
    c.resume().then(() => { desbloqueado = true; ['pointerdown', 'keydown', 'touchstart'].forEach((e) => document.removeEventListener(e, desbloquear, true)); }).catch(() => {});
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => document.addEventListener(e, desbloquear, { capture: true, passive: true }));
  function tono(c, f, t0, dur, vol, tipo) {
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  // cada tipo con su "personalidad" para reconocerlo sin mirar la pantalla
  const MELODIAS = {
    invitacion_pomodoro: [[523, 0, .16, 'triangle'], [659, .13, .16, 'triangle'], [784, .26, .18, 'triangle'], [1047, .4, .34, 'triangle']],
    nota_compartida: [[880, 0, .14, 'sine'], [1175, .12, .3, 'sine']],
    mensaje: [[660, 0, .11, 'sine'], [880, .1, .14, 'sine']],
    desafio: [[392, 0, .12, 'square'], [392, .14, .12, 'square'], [523, .28, .14, 'square'], [659, .44, .3, 'square']],
    solicitud_amistad: [[698, 0, .13, 'sine'], [880, .12, .13, 'sine'], [1047, .24, .3, 'sine']],
    sistema: [[784, 0, .45, 'sine']],
    ok: [[659, 0, .1, 'sine'], [988, .09, .26, 'sine']],
    error: [[246, 0, .16, 'sawtooth'], [185, .15, .28, 'sawtooth']],
  };
  function sonar(tipo, opc) {
    const t = MELODIAS[tipo] ? tipo : tipoDe(tipo);
    if (!(opc && opc.forzar) && (!quiereSonido(t) || noMolestar())) return false;
    const c = audio(); if (!c) return false;
    const reproducir = () => { try { const v = 0.18 * Math.max(0.05, Math.min(1, prefs.volumen)); (MELODIAS[t] || MELODIAS.sistema).forEach(([f, t0, d, ty]) => tono(c, f, t0, d, v, ty)); } catch (_) {} };
    if (c.state === 'suspended') c.resume().then(reproducir).catch(() => {}); else reproducir();
    return true;
  }

  // ---------------------------------------------------------------- no molestar
  function noMolestar() { return !!(window.NikaNoMolestar || document.fullscreenElement || SIM_PAGINAS.test(location.pathname)); }

  // ---------------------------------------------------------------- historial local (avisos sin fila en la base: chat, desafíos...)
  let uid = null, hist = [], noLeidas = 0;
  const hace = (iso) => { const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000); if (s < 60) return 'ahora'; if (s < 3600) return Math.floor(s / 60) + ' min'; if (s < 86400) return Math.floor(s / 3600) + ' h'; return Math.floor(s / 86400) + ' d'; };
  function leerLocal() { try { return JSON.parse(localStorage.getItem(LS_HIST) || '[]'); } catch (_) { return []; } }
  function guardarLocal() { try { localStorage.setItem(LS_HIST, JSON.stringify(hist.filter((n) => n.local).slice(0, 30))); } catch (_) {} }

  // ---------------------------------------------------------------- estilos
  function estilos() {
    if (document.getElementById('nn-css')) return;
    const st = document.createElement('style'); st.id = 'nn-css';
    st.textContent = `
#nn-caja{position:fixed;top:14px;right:14px;z-index:2147483000;display:flex;flex-direction:column;gap:10px;max-width:min(360px,calc(100vw - 24px));pointer-events:none}
.nn-card{--c:#38bdf8;pointer-events:auto;position:relative;overflow:hidden;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-left:5px solid var(--c);border-radius:16px;padding:14px 16px 12px;box-shadow:0 20px 44px rgba(0,0,0,.42);font:600 14px/1.4 "Plus Jakarta Sans",system-ui,sans-serif;animation:nnIn .45s cubic-bezier(.2,.9,.3,1.25) both}
.nn-card.nn-sale{animation:nnOut .3s ease forwards}
.nn-card h4{margin:0;font:800 14px/1.3 inherit;display:flex;gap:9px;align-items:center}
.nn-card h4 .i{display:inline-flex;width:34px;height:34px;border-radius:11px;align-items:center;justify-content:center;font-size:18px;background:color-mix(in srgb,var(--c) 22%,#0f172a);animation:nnLate 1.6s ease-in-out infinite}
.nn-card p{margin:6px 0 0;color:#cbd5e1;font-weight:600;font-size:13px}
.nn-card .nn-b{display:flex;gap:8px;margin-top:11px}
.nn-card button{flex:1;border:0;border-radius:10px;padding:9px 10px;font:800 13px inherit;font-family:inherit;cursor:pointer;transition:transform .14s,filter .14s,box-shadow .14s}
.nn-card button:hover{filter:brightness(1.12);transform:translateY(-1px)}.nn-card button:active{transform:scale(.95)}
.nn-ok{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;box-shadow:0 4px 14px rgba(34,197,94,.35)}.nn-no{background:#1e293b;color:#e2e8f0}
.nn-conf{position:absolute;top:6px;right:30px;background:none!important;border:0;color:#64748b!important;font-size:14px!important;flex:none!important;padding:2px 6px!important;width:auto}.nn-conf:hover{color:#e2e8f0!important}
.nn-x{position:absolute;top:6px;right:8px;background:none!important;border:0;color:#64748b!important;font-size:16px!important;flex:none!important;padding:2px 6px!important;width:auto}
.nn-barra{position:absolute;left:0;bottom:0;height:3px;background:var(--c);width:100%;transform-origin:left;animation:nnTiempo linear forwards}
@keyframes nnIn{from{opacity:0;transform:translate(50px,-18px) scale(.92)}to{opacity:1;transform:none}}
@keyframes nnOut{to{opacity:0;transform:translateX(60px) scale(.95)}}
@keyframes nnLate{0%,100%{transform:scale(1) rotate(0)}30%{transform:scale(1.12) rotate(-9deg)}60%{transform:scale(1.05) rotate(8deg)}}
@keyframes nnTiempo{from{transform:scaleX(1)}to{transform:scaleX(0)}}
#notification-bell.nn-tiembla{animation:nnCampana 1s ease}
#notification-bell.nn-silencio{opacity:.55}
@keyframes nnCampana{0%,100%{transform:rotate(0)}15%{transform:rotate(18deg)}30%{transform:rotate(-16deg)}45%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}}
@keyframes nnPop{from{transform:scale(0)}to{transform:scale(1)}}
#nn-panel{position:fixed;right:14px;top:62px;z-index:2147482500;width:min(380px,calc(100vw - 28px));max-height:min(560px,calc(100vh - 100px));display:none;flex-direction:column;background:#0b1220;color:#f1f5f9;border:1px solid #334155;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.5);overflow:hidden;font:600 13.5px/1.4 "Plus Jakarta Sans",system-ui,sans-serif}
#nn-panel.on{display:flex;animation:nnPanel .3s cubic-bezier(.2,.9,.3,1.15)}
@keyframes nnPanel{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
.nn-cab{display:flex;align-items:center;gap:8px;padding:12px 14px;background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid #1e293b}
.nn-cab b{flex:1;font-size:15px}.nn-cab button{background:#1e293b;border:0;color:#cbd5e1;border-radius:9px;padding:6px 9px;cursor:pointer;font:700 12px inherit;font-family:inherit;transition:background .15s}.nn-cab button:hover{background:#334155}
.nn-tabs{display:flex;gap:4px;padding:8px 10px 0}.nn-tabs button{flex:1;background:none;border:0;color:#94a3b8;padding:8px 4px;border-radius:9px 9px 0 0;cursor:pointer;font:800 12px inherit;font-family:inherit;border-bottom:2px solid transparent;transition:color .15s,border-color .15s}
.nn-tabs button.on{color:#7dd3fc;border-color:#38bdf8}
.nn-cuerpo{overflow:auto;padding:8px 10px 12px;flex:1}
.nn-fila{display:flex;gap:10px;padding:10px;border-radius:12px;cursor:pointer;position:relative;transition:background .15s,transform .15s;animation:nnIn .35s ease both}
.nn-fila:hover{background:#111c33;transform:translateX(2px)}
.nn-fila.nl::before{content:"";position:absolute;left:2px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8}
.nn-ico{flex:none;width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;background:#16223a}
.nn-fila b{display:block;font-size:13.5px}.nn-fila small{display:block;color:#94a3b8;font-weight:600;font-size:12px}
.nn-fila .t{margin-left:auto;color:#64748b;font-size:11px;white-space:nowrap}
.nn-vacio{text-align:center;color:#64748b;padding:26px 10px;font-size:13px}.nn-vacio span{display:block;font-size:34px;margin-bottom:6px}
.nn-pref{display:flex;align-items:center;gap:10px;padding:9px 6px;border-bottom:1px solid #16223a}.nn-pref:last-child{border:0}
.nn-pref .i{font-size:18px;width:26px;text-align:center}.nn-pref .x{flex:1}.nn-pref .x small{display:block;color:#64748b;font-size:11.5px;font-weight:600}
.nn-pref .test{background:#16223a;border:0;color:#94a3b8;border-radius:8px;width:30px;height:28px;cursor:pointer;transition:transform .15s,background .15s}.nn-pref .test:hover{background:#243756;transform:scale(1.1)}
.nn-sw{position:relative;width:40px;height:23px;flex:none}.nn-sw input{opacity:0;position:absolute;inset:0;cursor:pointer;margin:0}
.nn-sw i{position:absolute;inset:0;border-radius:12px;background:#334155;transition:background .2s}.nn-sw i::after{content:"";position:absolute;left:3px;top:3px;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform .25s cubic-bezier(.3,1.6,.5,1)}
.nn-sw input:checked+i{background:linear-gradient(135deg,#0ea5e9,#6366f1)}.nn-sw input:checked+i::after{transform:translateX(17px)}
.nn-sw input:focus-visible+i{box-shadow:0 0 0 3px rgba(56,189,248,.5)}
.nn-sec{color:#64748b;font:800 11px inherit;text-transform:uppercase;letter-spacing:.6px;margin:12px 4px 4px}
.nn-aviso{margin:6px 4px 8px;padding:10px 12px;background:#10233f;border:1px solid #1d4ed8;border-radius:12px;font-size:12.5px;color:#bfdbfe}.nn-aviso button{margin-top:7px;background:#2563eb;border:0;color:#fff;border-radius:8px;padding:6px 12px;font:800 12px inherit;font-family:inherit;cursor:pointer}
.nn-pt{width:9px;height:9px;border-radius:50%;background:#475569;flex:none;margin-top:5px}.nn-pt.on{background:#22c55e;box-shadow:0 0 8px #22c55e}
.nn-mini{background:#16223a;border:0;color:#7dd3fc;border-radius:8px;padding:5px 10px;font:800 12px inherit;font-family:inherit;cursor:pointer}.nn-mini:hover{background:#243756}
.nn-modal{position:fixed;inset:0;z-index:2147483100;background:rgba(2,6,23,.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;animation:nnFade .2s ease}
.nn-modal>div{width:min(440px,100%);background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:20px;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.6);font:600 14px/1.5 "Plus Jakarta Sans",system-ui,sans-serif;animation:nnIn .35s cubic-bezier(.2,.9,.3,1.2)}
.nn-modal h3{margin:0 0 8px;font:800 18px inherit}.nn-modal .nn-b{display:flex;gap:10px;margin-top:16px}.nn-modal .nn-b button{flex:1;border:0;border-radius:12px;padding:11px;font:800 14px inherit;font-family:inherit;cursor:pointer}
.nn-modal .nota{margin-top:10px;padding:12px;border-radius:12px;background:#16223a;border-left:4px solid #a855f7;white-space:pre-wrap;max-height:220px;overflow:auto}
@keyframes nnFade{from{opacity:0}to{opacity:1}}
@media (max-width:600px){#nn-caja{left:10px;right:10px;max-width:none}#nn-panel{right:8px;left:8px;width:auto;top:56px}}
@media (prefers-reduced-motion:reduce){.nn-card,.nn-card h4 .i,#notification-bell,#nn-panel,.nn-fila,.nn-modal>div{animation:none!important;transition:none!important}}`;
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------------- tarjetas emergentes
  let caja = null;
  function cajaToasts() {
    if (caja && document.body.contains(caja)) return caja;
    estilos(); caja = document.createElement('div'); caja.id = 'nn-caja'; caja.setAttribute('role', 'status'); caja.setAttribute('aria-live', 'polite');
    document.body.appendChild(caja); return caja;
  }
  function tarjeta(n, opc) {
    const t = tipoDe(n.tipo), T = TIPOS[t];
    const el = document.createElement('div'); el.className = 'nn-card'; el.style.setProperty('--c', T.color); el.dataset.id = n.id || '';
    const dur = (opc && opc.dur) || 12000;
    el.innerHTML = `<button class="nn-conf" data-nn-abrir aria-label="Preferencias de notificaciones" title="Preferencias de sonido y avisos">⚙</button><button class="nn-x" aria-label="Cerrar">×</button><h4><span class="i">${T.ico}</span><span>${esc(n.titulo)}</span></h4>${n.cuerpo ? `<p>${esc(n.cuerpo)}</p>` : ''}${opc && opc.botones ? `<div class="nn-b"></div>` : ''}<i class="nn-barra" style="animation-duration:${dur}ms"></i>`;
    const cierra = () => { el.classList.add('nn-sale'); setTimeout(() => el.remove(), 300); };
    el.querySelector('.nn-x').addEventListener('click', (e) => { e.stopPropagation(); cierra(); if (opc && opc.alCerrar) opc.alCerrar(); });
    el.querySelector('.nn-conf').addEventListener('click', (e) => { e.stopPropagation(); abrirCentro('pref'); });
    if (opc && opc.botones) {
      const b = el.querySelector('.nn-b');
      opc.botones.forEach((bt) => { const x = document.createElement('button'); x.className = bt.clase; x.textContent = bt.txt; x.addEventListener('click', () => { cierra(); bt.fn && bt.fn(); }); b.appendChild(x); });
    }
    const tm = setTimeout(cierra, dur);
    el.addEventListener('mouseenter', () => { el.querySelector('.nn-barra').style.animationPlayState = 'paused'; });
    el.addEventListener('pointerdown', () => clearTimeout(tm));
    cajaToasts().appendChild(el);
    while (caja.children.length > 4) caja.firstChild.remove();
    return el;
  }

  // ---------------------------------------------------------------- título parpadeante, aviso del sistema, badge
  let tituloOriginal = null, parpadeo = null;
  function parpadear(txt) {
    if (!document.hidden) return;
    if (tituloOriginal == null) tituloOriginal = document.title;
    clearInterval(parpadeo); let k = 0;
    parpadeo = setInterval(() => { document.title = (k++ % 2) ? tituloOriginal : '🔔 ' + txt; }, 1000);
  }
  function pararParpadeo() { if (parpadeo) { clearInterval(parpadeo); parpadeo = null; } if (tituloOriginal != null) { document.title = tituloOriginal; tituloOriginal = null; } }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pararParpadeo(); });
  window.addEventListener('focus', pararParpadeo);
  function avisoSistema(n, alClic) {
    try {
      if (!prefs.sistema || !('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return;
      const x = new Notification(n.titulo, { body: n.cuerpo || '', icon: 'assets/n-nika-192.webp', badge: 'assets/n-nika-96.webp', tag: n.id || ('nn-' + Date.now()), requireInteraction: tipoDe(n.tipo) === 'invitacion_pomodoro' });
      x.onclick = () => { try { window.focus(); } catch (_) {} x.close(); alClic && alClic(); };
    } catch (_) {}
  }
  function badgeApp() { try { if (navigator.setAppBadge) { noLeidas > 0 ? navigator.setAppBadge(noLeidas) : navigator.clearAppBadge(); } } catch (_) {} }

  // ---------------------------------------------------------------- acciones por tipo
  async function unirse(n) {
    if (n.id) marcarLeida(n);
    const d = n.datos || {};
    const payload = { fromUsername: n.de_username, toUsername: yo(), sessionId: d.sessionId, tema: d.tema, autoAceptar: true };
    if (typeof window.NikaPomodoroUnirse === 'function') { window.NikaPomodoroUnirse(payload); return; }
    try { sessionStorage.setItem('nika_unirse_pendiente', JSON.stringify(Object.assign({ at: Date.now() }, payload))); } catch (_) {}
    location.href = 'campus.html?unirme=' + encodeURIComponent(n.de_username || '');
  }
  const venc = (n) => n.vence_en && new Date(n.vence_en) < new Date();
  function accionPorDefecto(n) {
    const t = tipoDe(n.tipo);
    if (t === 'invitacion_pomodoro') { if (venc(n)) { tarjeta({ tipo: 'sistema', titulo: 'La invitación venció', cuerpo: 'Pedile a @' + (n.de_username || 'tu amigo') + ' que te invite de nuevo.' }, { dur: 5000 }); marcarLeida(n); return; } return unirse(n); }
    if (t === 'nota_compartida') return verNotaCompartida(n);
    if (n.datos && n.datos.url) { marcarLeida(n); location.href = n.datos.url; return; }
    marcarLeida(n);
  }
  function mostrarNotificacion(n, desdeCarga) {
    const t = tipoDe(n.tipo);
    const conBotones = t === 'invitacion_pomodoro' ? [{ txt: 'Ahora no', clase: 'nn-no', fn: () => { marcarLeida(n); rechazarInvitacion(n); } }, { txt: '🍅 Unirme', clase: 'nn-ok', fn: () => unirse(n) }]
      : t === 'nota_compartida' ? [{ txt: 'Ver nota', clase: 'nn-ok', fn: () => verNotaCompartida(n) }]
      : (n.datos && n.datos.url) ? [{ txt: 'Abrir', clase: 'nn-ok', fn: () => accionPorDefecto(n) }] : null;
    if (desdeCarga && !(t === 'invitacion_pomodoro' && !venc(n))) return;
    const mostrar = () => { if (!noMolestar() && quiereAviso(t)) tarjeta(n, { botones: conBotones, dur: t === 'invitacion_pomodoro' ? 60000 : 12000, alCerrar: () => {} }); };
    // En las páginas con Pomodoro propio la invitación ya llega por su canal y trae su tarjeta: se evita duplicarla
    if (t === 'invitacion_pomodoro' && window.PomodoroSyncManager && !desdeCarga) setTimeout(() => { if (!document.getElementById('nika-pomo-invite') && !n.leida) mostrar(); }, 900);
    else mostrar();
    if (!desdeCarga) {
      const de = String(n.de_username || '').toLowerCase(); if (t === 'invitacion_pomodoro' || t === 'nota_compartida') recNotif[de] = Date.now();
      if (!(recMsg[de] && Date.now() - recMsg[de] < 6000)) sonar(t);
      if (!noMolestar()) { parpadear(n.titulo); avisoSistema(n, () => accionPorDefecto(n)); }
      campanaTiembla();
    }
  }
  function rechazarInvitacion(n) {
    try { const m = window.PomodoroSyncManager; if (m && m.rechazarInvitacion) m.rechazarInvitacion(n.de_username, (n.datos || {}).sessionId, 'rechazada'); } catch (_) {}
  }

  // ---------------------------------------------------------------- notas compartidas (opción A: el amigo guarda una copia propia)
  function modal(html) {
    estilos(); const m = document.createElement('div'); m.className = 'nn-modal'; m.innerHTML = '<div>' + html + '</div>';
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });
    document.body.appendChild(m); return m;
  }
  function verNotaCompartida(n) {
    const d = n.datos || {};
    const m = modal(`<h3>📝 Nota de @${esc(n.de_username)}</h3><div style="color:#94a3b8;font-size:13px">${esc(d.recurso_titulo || 'Material')} · página ${esc(d.pagina || '?')}</div><div class="nota">${esc(d.texto || '(sin texto)')}</div>${(d.etiquetas || []).length ? `<div style="margin-top:8px;color:#c4b5fd;font-size:12.5px">${d.etiquetas.map((e) => '#' + esc(e)).join(' ')}</div>` : ''}<div class="nn-b"><button class="nn-no" data-x="c">Cerrar</button><button class="nn-ok" data-x="g">💾 Guardar en mis notas</button></div>`);
    m.querySelector('[data-x=c]').onclick = () => { m.remove(); marcarLeida(n); };
    m.querySelector('[data-x=g]').onclick = async (e) => {
      e.target.disabled = true;
      const r = await guardarCopia(n);
      e.target.textContent = r ? '✅ Guardada en tus notas' : 'No se pudo guardar';
      sonar(r ? 'ok' : 'error', { forzar: true });
      if (r) { marcarLeida(n); setTimeout(() => m.remove(), 1100); }
    };
  }
  async function guardarCopia(n) {
    const d = n.datos || {};
    try {
      const fila = { recurso: d.recurso || 'compartida:' + n.id, recurso_titulo: d.recurso_titulo || null, modulo: d.modulo || null, up_id: d.up_id || null, tipo: 'material', posicion: d.pagina || null,
        texto: d.texto || '', color: d.color || 'amarillo', anotacion: d.anotacion || null, pos_x: d.pos_x ?? null, pos_y: d.pos_y ?? null, ancho: d.ancho ?? null, tam: d.tam ?? null,
        etiquetas: Array.from(new Set([].concat(d.etiquetas || [], ['de-' + (n.de_username || 'amigo')]))) };
      const { error } = await sb().from('notas_estudio').insert(fila);
      if (!error) { try { window.dispatchEvent(new CustomEvent('nika:notas-cambiaron')); } catch (_) {} }
      return !error;
    } catch (_) { return false; }
  }

  // ---------------------------------------------------------------- cartel: hay que ser amigos
  async function cartelAmistad(username, opc) {
    estilos(); sonar('sistema', { forzar: true });
    const m = modal(`<h3>🤝 Primero tienen que ser amigos</h3><p style="margin:0;color:#cbd5e1">Para usar esta función con <b>@${esc(username)}</b> tenés que enviarle una solicitud de amistad. Cuando la acepte, vas a poder invitarlo a estudiar y compartirle notas.</p><div class="nn-b"><button class="nn-no" data-x="c">Ahora no</button><button class="nn-ok" data-x="s">Enviar solicitud a @${esc(username)}</button></div>`);
    m.querySelector('[data-x=c]').onclick = () => m.remove();
    m.querySelector('[data-x=s]').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = 'Enviando…';
      let ok = false, estado = '';
      try {
        await cargarScript('friendsManager.js', () => !!window.NikaFriends);
        const { data } = await sb().from('profiles_public').select('id').ilike('username', username).limit(1);
        const id = data && data[0] && data[0].id;
        if (id) { const r = await window.NikaFriends.sendRequest(id); ok = !!r.ok; estado = r.status; }
      } catch (_) {}
      e.target.textContent = ok ? (estado === 'already_friends' ? '✅ Ya son amigos' : estado === 'already_pending' ? '⏳ Ya la enviaste' : '✅ Solicitud enviada') : 'No se pudo enviar';
      sonar(ok ? 'ok' : 'error', { forzar: true });
      if (ok) setTimeout(() => m.remove(), 1400);
    };
  }

  // ---------------------------------------------------------------- envío (RPC con validación de amistad)
  // Además de la tarjeta, el aviso llega como mensaje en el chat (con botón «Unirme» en las invitaciones)
  async function mensajeAlChat(para, tipo, titulo, cuerpo, datos) {
    try {
      const cm = window.ChatManager; if (!cm || !cm.enviarMensaje) return;
      let txt = null;
      if (tipo === 'invitacion_pomodoro') txt = '🍅 Te invito a estudiar juntos' + ((datos && datos.tema) ? ': ' + datos.tema : '') + ' [[estudiar:' + ((datos && datos.sessionId) || 'x') + ']]';
      else if (tipo === 'nota_compartida') txt = '📝 Te compartí una nota' + ((datos && datos.recurso_titulo) ? ' de «' + datos.recurso_titulo + '»' : '') + (datos && datos.pagina ? ' (pág. ' + datos.pagina + ')' : '') + ': ' + String(cuerpo || '').slice(0, 160) + ' [[nota]]';
      if (txt) await cm.enviarMensaje(para, txt);
    } catch (_) {}
  }
  async function enviar(para, tipo, titulo, cuerpo, datos) {
    try {
      const c = sb(); if (!c) return { ok: false, reason: 'sin_conexion' };
      const { data, error } = await c.rpc('nika_notificar', { p_para: para, p_tipo: tipo, p_titulo: titulo || '', p_cuerpo: cuerpo || '', p_datos: datos || {} });
      if (error) return { ok: false, reason: 'error', detalle: error.message };
      if (data && data.ok === false && data.reason === 'no_amigo') cartelAmistad(para);
      if (data && data.ok) mensajeAlChat(para, tipo, titulo, cuerpo, datos);
      return data || { ok: false, reason: 'error' };
    } catch (e) { return { ok: false, reason: 'error', detalle: e && e.message }; }
  }

  // ---------------------------------------------------------------- avisos locales (chat, desafíos...) que también suenan y quedan en la campanita
  const recNotif = {}, recMsg = {};   // última notificación / mensaje recibido por remitente (para no sonar dos veces por lo mismo)
  function aviso(tipo, n) {
    if (tipo === 'mensaje') {
      const de = n && n.datos && n.datos.chat; if (de) { recMsg[String(de).toLowerCase()] = Date.now(); if (Date.now() - (recNotif[String(de).toLowerCase()] || 0) < 6000) return null; }
    }
    const fila = Object.assign({ id: 'l' + Date.now() + Math.random().toString(36).slice(2, 6), tipo, titulo: '', cuerpo: '', datos: {}, leida: false, creada_en: new Date().toISOString(), local: true }, n || {});
    hist.unshift(fila); hist = hist.slice(0, 60); guardarLocal(); recontar(); pintarPanel();
    sonar(tipo); if (!noMolestar()) { parpadear(fila.titulo); avisoSistema(fila, () => { if (fila.datos && fila.datos.url) location.href = fila.datos.url; }); }
    campanaTiembla();
    return fila;
  }

  // ---------------------------------------------------------------- datos y tiempo real
  let canal = null, sondeo = null;
  function recontar() { noLeidas = hist.filter((n) => !n.leida).length; badgeApp(); const bc = document.getElementById('nn-cuenta'); if (bc) bc.textContent = noLeidas ? ' (' + noLeidas + ')' : ''; }
  async function marcarLeida(n) {
    if (!n || n.leida) return; n.leida = true; recontar(); pintarPanel();
    if (!n.local) { try { await sb().from('notificaciones').update({ leida: true }).eq('id', n.id); } catch (_) {} } else guardarLocal();
  }
  async function marcarTodas() {
    hist.forEach((n) => { n.leida = true; }); guardarLocal(); recontar(); pintarPanel();
    try { await sb().from('notificaciones').update({ leida: true }).eq('para_id', uid).eq('leida', false); } catch (_) {}
  }
  async function cargarRemotas(primera) {
    try {
      const { data } = await sb().from('notificaciones').select('*').eq('para_id', uid).order('creada_en', { ascending: false }).limit(40);
      if (!data) return;
      const viejos = new Set(hist.filter((n) => !n.local).map((n) => n.id));
      const nuevas = data.filter((n) => !viejos.has(n.id));
      hist = hist.filter((n) => n.local).concat(data).sort((a, b) => new Date(b.creada_en) - new Date(a.creada_en));
      recontar(); pintarPanel();
      if (primera) nuevas.filter((n) => !n.leida).forEach((n) => mostrarNotificacion(n, true));
      else nuevas.filter((n) => !n.leida && Date.now() - new Date(n.creada_en) < 90000).forEach((n) => mostrarNotificacion(n, false));   // llegó por sondeo (el tiempo real se había caído)
    } catch (_) {}
  }
  function suscribir() {
    try {
      const c = sb(); if (!c || canal) return;
      canal = c.channel('nika_notif_' + uid)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: 'para_id=eq.' + uid }, ({ new: n }) => {
          if (!n || hist.some((x) => x.id === n.id)) return;
          hist.unshift(n); recontar(); pintarPanel(); mostrarNotificacion(n, false);
        })
        .subscribe((estado) => { if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT' || estado === 'CLOSED') { try { c.removeChannel(canal); } catch (_) {} canal = null; setTimeout(suscribir, 6000); } });
    } catch (_) {}
  }

  // la campana del campus (si la página la tiene) se sacude cuando llega algo
  function campanaTiembla() { const cb = document.getElementById('notification-bell'); if (cb) { cb.classList.remove('nn-tiembla'); void cb.offsetWidth; cb.classList.add('nn-tiembla'); } }

  // ---------------------------------------------------------------- panel de notificaciones
  let panel = null, pestana = 'notif';
  function montarUI() {
    if (panel) return;
    estilos();
    panel = document.createElement('div'); panel.id = 'nn-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Centro de notificaciones');
    document.body.appendChild(panel);
    // no hay ícono propio: se abre con el ⚙ de cada aviso o con la campana del campus
    document.addEventListener('click', (e) => { if (panel.classList.contains('on') && !panel.contains(e.target) && !e.target.closest('[data-nn-abrir]') && !e.target.closest('.nn-x')) panel.classList.remove('on'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.classList.remove('on'); });
  }
  function marcarSilencio() { const b = document.getElementById('notification-bell'); if (b) b.classList.toggle('nn-silencio', !!prefs.silencio); }
  function abrirCentro(tab) { if (!panel) return; if (typeof tab !== 'string') tab = null; if (tab) pestana = tab; pintarPanel(); panel.classList.toggle('on', tab ? true : !panel.classList.contains('on')); }

  function filaHtml(n, i) {
    const t = tipoDe(n.tipo), T = TIPOS[t];
    return `<div class="nn-fila ${n.leida ? '' : 'nl'}" data-i="${i}" style="animation-delay:${Math.min(i, 8) * 30}ms"><span class="nn-ico" style="background:color-mix(in srgb,${T.color} 20%,#0b1220)">${T.ico}</span><div style="min-width:0"><b>${esc(n.titulo)}</b>${n.cuerpo ? `<small>${esc(n.cuerpo)}</small>` : ''}</div><span class="t">${hace(n.creada_en)}</span></div>`;
  }
  function filaPref(t) {
    const T = TIPOS[t];
    return `<div class="nn-pref"><span class="i">${T.ico}</span><div class="x">${T.nom}</div><button class="test" data-test="${t}" title="Probar el sonido" aria-label="Probar sonido de ${T.nom}">🔊</button><label class="nn-sw" title="Sonido"><input type="checkbox" data-son="${t}" ${prefs.sonido[t] !== false ? 'checked' : ''}><i></i></label><label class="nn-sw" title="Aviso en pantalla"><input type="checkbox" data-avi="${t}" ${prefs.aviso[t] !== false ? 'checked' : ''}><i></i></label></div>`;
  }
  let amigosCache = [];
  function pintarPanel() {
    if (!panel) return;
    const permiso = 'Notification' in window ? Notification.permission : 'denied';
    let cuerpo = '';
    if (pestana === 'notif') {
      const aviso = permiso === 'default' ? `<div class="nn-aviso">🔔 Activá los avisos del sistema para enterarte aunque tengas el sitio minimizado.<br><button data-x="permiso">Activar avisos</button></div>` : '';
      cuerpo = aviso + (hist.length ? hist.map(filaHtml).join('') : `<div class="nn-vacio"><span>🔔</span>Todavía no tenés notificaciones.<br>Acá van a aparecer las invitaciones de tus amigos y las notas que te compartan.</div>`);
    } else if (pestana === 'amigos') {
      const on = amigosCache.filter((f) => estaEnLinea(f.username)), off = amigosCache.filter((f) => !estaEnLinea(f.username));
      const fila = (f, en) => `<div class="nn-fila" style="cursor:default"><span class="nn-pt ${en ? 'on' : ''}"></span><div style="min-width:0"><b>${esc(f.fullname || f.username)}</b><small>@${esc(f.username)} · ${en ? 'en línea' : 'desconectado'}</small></div>${en ? `<button class="nn-mini" style="margin-left:auto" data-chat="${esc(f.username)}">💬 Chatear</button>` : ''}</div>`;
      cuerpo = prefs.invisible ? `<div class="nn-aviso">👻 Estás en modo invisible: tus amigos no ven que estás en línea. Podés cambiarlo en Preferencias.</div>` : '';
      cuerpo += amigosCache.length ? `<div class="nn-sec">En línea · ${on.length}</div>${on.map((f) => fila(f, true)).join('') || '<div class="nn-vacio" style="padding:10px">Nadie conectado ahora.</div>'}<div class="nn-sec">Desconectados · ${off.length}</div>${off.slice(0, 20).map((f) => fila(f, false)).join('')}` : `<div class="nn-vacio"><span>🤝</span>Todavía no tenés amigos.<br>Agregalos desde «Comunidad & Amigos» para invitarlos a estudiar.</div>`;
    } else {
      cuerpo = `<div class="nn-pref"><span class="i">🔇</span><div class="x">Silenciar todos los sonidos<small>Las notificaciones siguen apareciendo, sin sonido</small></div><label class="nn-sw"><input type="checkbox" data-g="silencio" ${prefs.silencio ? 'checked' : ''}><i></i></label></div>
        <div class="nn-pref"><span class="i">🎚️</span><div class="x">Volumen<small>Para todos los tonos</small></div><input type="range" min="10" max="100" value="${Math.round(prefs.volumen * 100)}" data-vol style="width:110px"></div>
        <div class="nn-sec">Por tipo · sonido · aviso en pantalla</div>${Object.keys(TIPOS).map(filaPref).join('')}
        <div class="nn-sec">Más opciones</div>
        <div class="nn-pref"><span class="i">🖥️</span><div class="x">Avisos del sistema<small>Si el sitio está minimizado o en otra pestaña${permiso === 'denied' ? ' · bloqueados en tu navegador' : ''}</small></div><label class="nn-sw"><input type="checkbox" data-g="sistema" ${prefs.sistema && permiso === 'granted' ? 'checked' : ''}><i></i></label></div>
        <div class="nn-pref"><span class="i">📲</span><div class="x">Avisos con la app cerrada<small>Te llegan al celular o la compu aunque no tengas NikaMed abierto</small></div><label class="nn-sw"><input type="checkbox" data-g="push" ${prefs.push && pushActivo ? 'checked' : ''}><i></i></label></div>
        <div class="nn-pref"><span class="i">👻</span><div class="x">Aparecer invisible<small>Tus amigos no ven si estás en línea</small></div><label class="nn-sw"><input type="checkbox" data-g="invisible" ${prefs.invisible ? 'checked' : ''}><i></i></label></div>
        <div class="nn-aviso" style="margin-top:10px">🎯 No molestar automático: en pantalla completa y dentro de los simuladores no suena nada ni aparecen tarjetas (todo queda acá).</div>`;
    }
    panel.innerHTML = `<div class="nn-cab"><b>🔔 Notificaciones</b><button data-x="todas" title="Marcar todas como leídas">✓ Leídas</button></div>
      <div class="nn-tabs"><button data-p="notif" class="${pestana === 'notif' ? 'on' : ''}">Avisos${noLeidas ? ' · ' + noLeidas : ''}</button><button data-p="amigos" class="${pestana === 'amigos' ? 'on' : ''}">Amigos</button><button data-p="pref" class="${pestana === 'pref' ? 'on' : ''}">⚙️ Preferencias</button></div>
      <div class="nn-cuerpo">${cuerpo}</div>`;
  }
  function enlazarPanel() {
    panel.addEventListener('click', async (e) => {
      const q = (s) => e.target.closest(s);
      let el;
      if ((el = q('[data-p]'))) { pestana = el.dataset.p; if (pestana === 'amigos') cargarAmigos(); pintarPanel(); return; }
      if (q('[data-x=todas]')) return marcarTodas();
      if (q('[data-x=permiso]')) { try { const r = await Notification.requestPermission(); if (r === 'granted') { prefs.sistema = true; guardarPrefs(); sonar('ok', { forzar: true }); if (prefs.push) { await suscribirPush(false); } } } catch (_) {} return pintarPanel(); }
      if ((el = q('[data-test]'))) return void sonar(el.dataset.test, { forzar: true });
      if ((el = q('[data-chat]'))) { panel.classList.remove('on'); if (window.NikaChat) window.NikaChat.conversacion(el.dataset.chat); return; }
      if ((el = q('.nn-fila[data-i]'))) { const n = hist[+el.dataset.i]; if (n) { accionPorDefecto(n); marcarLeida(n); } }
    });
    panel.addEventListener('change', async (e) => {
      const t = e.target;
      if (t.dataset.son) { prefs.sonido[t.dataset.son] = t.checked; guardarPrefs(); if (t.checked) sonar(t.dataset.son, { forzar: true }); }
      else if (t.dataset.avi) { prefs.aviso[t.dataset.avi] = t.checked; guardarPrefs(); }
      else if (t.dataset.g === 'silencio') { prefs.silencio = t.checked; guardarPrefs(); marcarSilencio(); }
      else if (t.dataset.g === 'invisible') { prefs.invisible = t.checked; guardarPrefs(); aplicarInvisible(); pintarPanel(); }
      else if (t.dataset.g === 'sistema') {
        if (t.checked && 'Notification' in window && Notification.permission !== 'granted') { try { await Notification.requestPermission(); } catch (_) {} }
        prefs.sistema = t.checked && 'Notification' in window && Notification.permission === 'granted'; guardarPrefs(); if (prefs.sistema && prefs.push) await suscribirPush(false); pintarPanel();
      } else if (t.dataset.g === 'push') { prefs.push = t.checked; guardarPrefs(); if (t.checked) await suscribirPush(true); else await cancelarPush(); pintarPanel(); }
    });
    panel.addEventListener('input', (e) => { if (e.target.hasAttribute('data-vol')) { prefs.volumen = e.target.value / 100; guardarPrefs(); } });
    panel.addEventListener('change', (e) => { if (e.target.hasAttribute('data-vol')) sonar('ok', { forzar: true }); });
  }

  // ---------------------------------------------------------------- amigos en línea / invisible
  function estaEnLinea(username) { try { return !!(window.ChatManager && window.ChatManager.estaEnLinea && window.ChatManager.estaEnLinea({ username })); } catch (_) { return false; } }
  async function cargarAmigos() {
    try { await cargarScript('friendsManager.js', () => !!window.NikaFriends); amigosCache = await window.NikaFriends.listFriends(); } catch (_) { amigosCache = []; }
    if (pestana === 'amigos') pintarPanel();
  }
  function aplicarInvisible() {
    const cm = window.ChatManager; if (!cm) return;
    try { if (prefs.invisible) cm.detenerPresenciaGlobal && cm.detenerPresenciaGlobal(); else cm.iniciarPresenciaGlobal && cm.iniciarPresenciaGlobal(); } catch (_) {}
  }

  // ---------------------------------------------------------------- push con la app cerrada
  let pushActivo = false;
  const b64 = (s) => { const p = '='.repeat((4 - s.length % 4) % 4), r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
  async function estadoPush() {
    try { const reg = await navigator.serviceWorker.getRegistration(); const s = reg && await reg.pushManager.getSubscription(); pushActivo = !!s; } catch (_) { pushActivo = false; }
  }
  async function suscribirPush(pedir) {
    try {
      if (!VAPID_PUBLICA || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;
      if (Notification.permission !== 'granted') { if (!pedir) return false; if ((await Notification.requestPermission()) !== 'granted') return false; }
      const reg = await navigator.serviceWorker.ready;
      let s = await reg.pushManager.getSubscription();
      if (!s) s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID_PUBLICA) });
      const j = s.toJSON();
      await sb().from('push_suscripciones').upsert({ endpoint: j.endpoint, user_id: uid, p256dh: j.keys.p256dh, auth: j.keys.auth, agente: navigator.userAgent.slice(0, 160) }, { onConflict: 'endpoint' });
      pushActivo = true; return true;
    } catch (_) { return false; }
  }
  async function cancelarPush() {
    try { const reg = await navigator.serviceWorker.getRegistration(); const s = reg && await reg.pushManager.getSubscription(); if (s) { await sb().from('push_suscripciones').delete().eq('endpoint', s.endpoint); await s.unsubscribe(); } } catch (_) {}
    pushActivo = false;
  }

  // ---------------------------------------------------------------- solicitudes de amistad nuevas (también suenan y quedan en la campanita)
  const LS_SOL = 'nika_sol_vistas';
  let solVistas = null, solPrimera = true;
  async function revisarSolicitudes() {
    try {
      if (!window.NikaFriends) return;
      if (!solVistas) { try { const g = localStorage.getItem(LS_SOL); solPrimera = g == null; solVistas = new Set(JSON.parse(g || '[]')); } catch (_) { solVistas = new Set(); } }
      const inc = await window.NikaFriends.listIncoming();
      inc.forEach((f) => {
        if (solVistas.has(f.friendshipId)) return; solVistas.add(f.friendshipId);
        if (!solPrimera) aviso('solicitud_amistad', { titulo: '@' + f.username + ' quiere ser tu amigo', cuerpo: 'Aceptá la solicitud desde «Comunidad & Amigos» para poder invitarse a estudiar y compartir notas.', datos: { url: 'campus.html' } });
      });
      solPrimera = false;
      try { localStorage.setItem(LS_SOL, JSON.stringify(Array.from(solVistas).slice(-200))); } catch (_) {}
    } catch (_) {}
  }
  function vigilarSolicitudes() {
    revisarSolicitudes();
    window.addEventListener('nika:friends-changed', revisarSolicitudes);
    try { window.NikaFriends.startRealtime(); } catch (_) {}
  }

  // ---------------------------------------------------------------- utilidades de carga
  function cargarScript(src, listo) {
    return new Promise((res) => {
      if (listo && listo()) return res(true);
      const base = (() => { const s = document.querySelector('script[src*="nikaNotificaciones.js"]'); return s ? s.src.replace(/nikaNotificaciones\.js.*$/, '') : 'js/'; })();
      const s = document.createElement('script'); s.src = base + src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
    });
  }

  // ---------------------------------------------------------------- arranque
  let iniciado = false;
  async function iniciar() {
    if (iniciado || !hayUsuario() || !window.NikaSupabase) return;
    iniciado = true;
    try { await window.NikaSupabase.ready; } catch (_) { iniciado = false; return; }
    try { const { data } = await sb().auth.getSession(); uid = data && data.session && data.session.user && data.session.user.id; } catch (_) {}
    if (!uid) { iniciado = false; return; }
    // preferencias guardadas en la cuenta (mandan sobre las locales, para que valgan en todos los dispositivos)
    try { const { data } = await sb().from('notif_preferencias').select('prefs').eq('user_id', uid).maybeSingle(); if (data && data.prefs) { prefs = Object.assign({}, PREFS0, prefs, data.prefs); try { localStorage.setItem(LS_PREFS, JSON.stringify(prefs)); } catch (_) {} } } catch (_) {}
    hist = leerLocal().map((n) => Object.assign(n, { local: true }));
    montarUI(); enlazarPanel(); recontar(); pintarPanel();
    await cargarRemotas(true);
    suscribir();
    estadoPush(); if (prefs.push && VAPID_PUBLICA) suscribirPush(false);
    sondeo = setInterval(() => { if (!document.hidden) cargarRemotas(false); }, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) cargarRemotas(false); });
    // presencia global (amigos en línea) en toda página: respeta el modo invisible
    cargarScript('friendsManager.js', () => !!window.NikaFriends).then(() => { vigilarSolicitudes(); return cargarScript('chatManager.js?v=5', () => !!window.ChatManager); }).then(() => { if (!prefs.invisible && window.ChatManager) window.ChatManager.iniciarPresenciaGlobal().catch(() => {}); });
  }
  function esperar(n) {
    if (iniciado) return;
    if (hayUsuario() && window.NikaSupabase) return void iniciar();
    if (n < 40) setTimeout(() => esperar(n + 1), 500);
  }

  window.NikaNotif = { enviar, aviso, sonar, cartelAmistad, abrirCentro, estaEnLinea, prefs: () => prefs, tipos: TIPOS, noMolestar, suscribirPush, unirse, _iniciar: iniciar };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => esperar(0)); else esperar(0);
})();
