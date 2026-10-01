// js/chatFlotante.js
// CAMPUS NIKA — Chat y presencia en TODAS las páginas (sala de estudio, foro, liga, ateneos, recetarios…).
//
//  • Presencia: mantiene a la persona "en línea" y recibiendo mensajes sin importar en qué sección esté
//    (antes solo el campus lo hacía: quien estudiaba en otra página figuraba "desconectado" y no recibía nada).
//  • Interfaz: botón flotante 💬 (arriba del asistente) con contador rojo de mensajes sin leer, bandeja de
//    amigos con puntos de "en línea" y conversación completa con tildes de entrega y lectura.
//  • En campus.html no hace nada (el campus tiene su propia interfaz). Con data-modo="presencia" (examen)
//    solo mantiene la presencia, sin botón: no distrae mientras se rinde.
//
// Uso: <script src="js/chatFlotante.js"></script> después de supabaseClient.js. Carga solo lo que falte
// (chatManager.js, friendsManager.js, presenciaCampus.js).

(function () {
  'use strict';
  if (window.__chatFlotante) return;
  window.__chatFlotante = true;

  const tag = document.currentScript;
  const SOLO_PRESENCIA = !!(tag && tag.dataset.modo === 'presencia');
  const BASE = tag && tag.src ? tag.src.replace(/[^/?]*(\?.*)?$/, '') : 'js/';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const AVATAR = 'assets/N%20NIKA.png';
  const hayUsuario = () => { try { return !!JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) { return false; } };

  function cargarScript(src, ok) {
    return new Promise((res) => {
      if (ok()) return res(true);
      const s = document.createElement('script'); s.src = BASE + src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
    });
  }

  // ------------------------------------------------------------------ estado
  let amigos = [], noLeidos = {}, actual = null, ids = new Set(), ultimoDia = null, abierto = false;
  const yo = () => window.NikaSupabase.getNikaCurrentUsername();

  // ------------------------------------------------------------------ interfaz
  const CSS = `
  .cf-fab{position:fixed;right:20px;bottom:90px;width:56px;height:56px;border:0;border-radius:50%;cursor:pointer;z-index:9998;display:flex;align-items:center;justify-content:center;font-size:25px;color:#fff;
    background:linear-gradient(135deg,var(--nika-primary,#0284c7),var(--nika-accent,#38bdf8));box-shadow:0 4px 14px rgba(0,0,0,.3);transition:transform .18s,box-shadow .18s}
  .cf-fab:hover{transform:scale(1.07)}.cf-fab.hay{background:linear-gradient(135deg,#ef4444,#b91c1c);animation:cf-aviso 1.8s ease-in-out infinite}
  .cf-fab.rebota{animation:cf-rebote .7s cubic-bezier(.3,1.6,.5,1),cf-aviso 1.8s ease-in-out .7s infinite}
  .cf-fab b{position:absolute;top:-6px;right:-6px;min-width:22px;padding:1px 6px;border-radius:999px;background:#fff;color:#b91c1c;border:2px solid #ef4444;font:800 .72rem 'Plus Jakarta Sans',sans-serif;text-align:center;display:none;box-shadow:0 3px 10px rgba(0,0,0,.35)}
  .cf-fab.hay b{display:block}
  @keyframes cf-aviso{0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.3),0 0 0 0 rgba(239,68,68,.55)}50%{box-shadow:0 4px 14px rgba(0,0,0,.3),0 0 0 12px rgba(239,68,68,0)}}
  @keyframes cf-rebote{0%{transform:scale(1)}30%{transform:scale(1.28) rotate(-10deg)}60%{transform:scale(.94) rotate(6deg)}100%{transform:scale(1)}}
  .cf-panel{position:fixed;right:20px;bottom:156px;width:min(360px,calc(100vw - 24px));height:min(520px,calc(100vh - 180px));z-index:9999;display:none;flex-direction:column;overflow:hidden;border-radius:20px;
    background:var(--card-bg,#fff);color:var(--text-main,#0f172a);border:1px solid var(--border,#e2e8f0);box-shadow:0 24px 60px -20px rgba(0,0,0,.55);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  .cf-panel.on{display:flex;animation:cf-entra .3s cubic-bezier(.2,.8,.2,1) both}
  @keyframes cf-entra{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
  .cf-h{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border,#e2e8f0);background:linear-gradient(120deg,rgba(2,132,199,.12),rgba(99,102,241,.1))}
  .cf-h h4{margin:0;font-size:1rem;font-weight:800;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cf-h small{display:block;font-size:.72rem;font-weight:700;color:var(--text-muted,#64748b)}
  .cf-h small.on{color:#16a34a}.cf-x,.cf-back{border:0;background:transparent;color:inherit;font-size:1.1rem;cursor:pointer;padding:6px 9px;border-radius:10px}.cf-x:hover,.cf-back:hover{background:rgba(148,163,184,.2)}
  .cf-lista{flex:1;overflow-y:auto;padding:6px}.cf-item{display:flex;align-items:center;gap:12px;width:100%;padding:10px;border:0;border-radius:14px;background:transparent;color:inherit;font-family:inherit;text-align:left;cursor:pointer;transition:background .15s}
  .cf-item:hover{background:rgba(2,132,199,.1)}.cf-av{position:relative;flex-shrink:0}.cf-av img{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#e2e8f0;display:block}
  .cf-av i{position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:50%;background:#94a3b8;border:2.5px solid var(--card-bg,#fff)}.cf-av i.on{background:#22c55e}
  .cf-nom{flex:1;min-width:0}.cf-nom b{display:block;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cf-nom small{font-size:.74rem;color:var(--text-muted,#64748b)}.cf-nom small.on{color:#16a34a;font-weight:800}
  .cf-n{min-width:22px;height:22px;padding:0 7px;border-radius:999px;background:#0284c7;color:#fff;font-size:.74rem;font-weight:800;display:inline-flex;align-items:center;justify-content:center}
  .cf-vacio{padding:30px 16px;text-align:center;color:var(--text-muted,#64748b);font-size:.86rem}
  .cf-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px;background:var(--bg-body,#f1f5f9)}
  .cf-dia{align-self:center;font-size:.68rem;font-weight:800;color:var(--text-muted,#64748b);margin:6px 0}
  .cf-b{max-width:80%;padding:8px 12px;border-radius:16px;font-size:.88rem;line-height:1.4;word-wrap:break-word;white-space:pre-wrap;animation:cf-entra .25s both}
  .cf-b.theirs{align-self:flex-start;background:var(--card-bg,#fff);border:1px solid var(--border,#e2e8f0);border-bottom-left-radius:4px}
  .cf-b.mine{align-self:flex-end;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border-bottom-right-radius:4px}
  .cf-b em{display:block;font-style:normal;font-size:.64rem;opacity:.75;margin-top:2px;text-align:right}
  .cf-b .chat-bubble-tick{display:inline-flex;vertical-align:middle;margin-left:4px}.cf-b .chat-bubble-tick svg{width:15px;height:10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .cf-b .tick-read{color:#7dd3fc}.cf-b .tick-sent,.cf-b .tick-delivered{opacity:.8}
  .cf-in{display:flex;gap:8px;padding:10px;border-top:1px solid var(--border,#e2e8f0)}.cf-in input{flex:1;min-width:0;padding:10px 14px;border-radius:999px;border:1px solid var(--border,#cbd5e1);background:var(--bg-body,#f8fafc);color:inherit;font:600 .88rem 'Plus Jakarta Sans',sans-serif;outline:none}
  .cf-in input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.2)}.cf-in button{width:42px;height:42px;border:0;border-radius:50%;background:#0284c7;color:#fff;font-size:1.05rem;cursor:pointer}
  @media (max-width:640px){.cf-fab{width:48px;height:48px;right:12px;bottom:74px}.cf-panel{right:8px;bottom:132px;height:min(70vh,520px)}}
  @media (prefers-reduced-motion:reduce){.cf-fab.hay,.cf-fab.rebota,.cf-panel.on,.cf-b{animation:none!important}}`;

  let fab, panel;
  function montarUI() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    fab = document.createElement('button'); fab.type = 'button'; fab.className = 'cf-fab'; fab.setAttribute('aria-label', 'Abrir chat'); fab.innerHTML = '💬<b></b>';
    fab.addEventListener('click', () => (abierto ? cerrar() : abrir()));
    panel = document.createElement('section'); panel.className = 'cf-panel'; panel.setAttribute('aria-label', 'Mensajes');
    document.body.append(fab, panel);
    vistaLista();
  }
  const abrir = () => { abierto = true; panel.classList.add('on'); if (!actual) vistaLista(); else { const m = $('.cf-msgs', panel); if (m) m.scrollTop = m.scrollHeight; } };
  function cerrar() { abierto = false; panel.classList.remove('on'); }

  // ------------------------------------------------------------------ bandeja
  async function vistaLista() {
    const CM = window.ChatManager;
    if (actual) { actual = null; try { await CM.cerrarConversacion(); } catch (_) {} }
    panel.innerHTML = `<div class="cf-h"><h4>💬 Mensajes</h4><button type="button" class="cf-x" aria-label="Cerrar">✕</button></div><div class="cf-lista" id="cf-lista"><div class="cf-vacio">Cargando…</div></div>`;
    $('.cf-x', panel).onclick = cerrar;
    try { amigos = await window.NikaFriends.listFriends(); } catch (_) { amigos = []; }
    try { noLeidos = await CM.contarNoLeidos(); } catch (_) {}
    pintarLista();
  }
  function pintarLista() {
    const box = $('#cf-lista', panel); if (!box || actual) return;
    const CM = window.ChatManager; const on = (f) => CM.estaEnLinea(f.username);
    if (!amigos.length) { box.innerHTML = '<div class="cf-vacio">Agregá amigos desde «Comunidad &amp; Amigos» del campus para chatear con ellos.</div>'; return; }
    const orden = amigos.slice().sort((a, b) => ((noLeidos[b.username] || 0) - (noLeidos[a.username] || 0)) || (on(b) - on(a)) || String(a.fullname).localeCompare(String(b.fullname), 'es'));
    box.innerHTML = orden.map((f) => `<button type="button" class="cf-item" data-u="${esc(f.username)}"><span class="cf-av"><img src="${esc(f.avatar || AVATAR)}" alt=""><i class="${on(f) ? 'on' : ''}"></i></span>
      <span class="cf-nom"><b>${esc(f.fullname)}</b><small class="${on(f) ? 'on' : ''}">${on(f) ? 'En línea' : '@' + esc(f.username)}</small></span>${noLeidos[f.username] ? `<span class="cf-n">${noLeidos[f.username]}</span>` : ''}</button>`).join('');
    box.querySelectorAll('.cf-item').forEach((b) => b.addEventListener('click', () => conversacion(b.dataset.u)));
  }

  // ------------------------------------------------------------------ conversación
  const hora = (iso) => { try { return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); } catch (_) { return ''; } };
  function etiquetaDia(iso) {
    const f = new Date(iso), h = new Date(), a = new Date(h); a.setDate(h.getDate() - 1); const igual = (x, y) => x.toDateString() === y.toDateString();
    return igual(f, h) ? 'Hoy' : igual(f, a) ? 'Ayer' : f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  }
  function burbuja(m) {
    const box = $('.cf-msgs', panel); if (!box || (m.id && ids.has(m.id))) return; if (m.id) ids.add(m.id);
    const vacio = $('.cf-vacio', box); if (vacio) vacio.remove();
    const dia = etiquetaDia(m.created_at || new Date().toISOString());
    if (dia !== ultimoDia) { ultimoDia = dia; const d = document.createElement('div'); d.className = 'cf-dia'; d.textContent = dia; box.appendChild(d); }
    const mia = String(m.from_username).toLowerCase() === String(yo()).toLowerCase();
    const CM = window.ChatManager;
    const el = document.createElement('div'); el.className = 'cf-b chat-bubble ' + (mia ? 'mine' : 'theirs'); if (m.id) el.setAttribute('data-msg-id', m.id);
    const t = document.createElement('span'); t.textContent = m.content || ''; el.appendChild(t);
    const meta = document.createElement('em'); meta.innerHTML = esc(hora(m.created_at)) + (mia ? CM.tickHTML(CM.estadoDeEntrega(m)) : ''); el.appendChild(meta);
    box.appendChild(el); box.scrollTop = box.scrollHeight;
  }
  async function conversacion(user) {
    const CM = window.ChatManager; const f = amigos.find((x) => x.username === user) || { username: user, fullname: '@' + user };
    actual = user; ids = new Set(); ultimoDia = null;
    panel.innerHTML = `<div class="cf-h"><button type="button" class="cf-back" aria-label="Volver">←</button><span class="cf-av"><img src="${esc(f.avatar || AVATAR)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover"></span>
      <h4>${esc(f.fullname)}<small id="cf-est">Conectando…</small></h4><button type="button" class="cf-x" aria-label="Cerrar">✕</button></div>
      <div class="cf-msgs"><div class="cf-vacio">Cargando conversación…</div></div>
      <form class="cf-in" autocomplete="off"><input type="text" maxlength="800" placeholder="Escribí un mensaje…" aria-label="Mensaje"><button type="submit" aria-label="Enviar">➤</button></form>`;
    $('.cf-back', panel).onclick = vistaLista; $('.cf-x', panel).onclick = cerrar;
    const pintarEstado = (on) => { const s = $('#cf-est', panel); if (s) { s.textContent = on ? 'En línea' : 'Desconectado'; s.classList.toggle('on', !!on); } };
    CM.lecturaAutomatica = true;
    CM.onMensaje = (row) => { if (row.from_username !== user && row.to_username !== user) return; burbuja(row); if (row.from_username === user && !document.hidden) CM.marcarComoLeido(user).then(refrescarNoLeidos); };
    CM.onPresenciaCambio = pintarEstado;
    try {
      const hist = await CM.abrirConversacion(user);
      const box = $('.cf-msgs', panel); box.innerHTML = '';
      if (!hist.length) box.innerHTML = '<div class="cf-vacio">Todavía no hay mensajes. ¡Escribile algo!</div>';
      hist.forEach(burbuja);
      await CM.marcarComoLeido(user); refrescarNoLeidos();
    } catch (e) { const box = $('.cf-msgs', panel); if (box) box.innerHTML = '<div class="cf-vacio">No se pudo cargar el chat.</div>'; }
    pintarEstado(CM.estaEnLinea(user));
    const form = $('.cf-in', panel), input = $('input', form); input.focus();
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); const txt = input.value.trim(); if (!txt) return; input.value = '';
      try { const row = await CM.enviarMensaje(user, txt); if (row) burbuja(row); }
      catch (err) { input.value = txt; if (typeof window.showToast === 'function') window.showToast(err && err.friendly ? err.message : 'No se pudo enviar el mensaje.'); }
    });
  }

  // ------------------------------------------------------------------ no leídos y avisos
  let previo = 0;
  async function refrescarNoLeidos() {
    try { noLeidos = await window.ChatManager.contarNoLeidos(); } catch (_) { return; }
    const total = Object.values(noLeidos).reduce((a, b) => a + b, 0);
    if (fab) {
      fab.classList.toggle('hay', total > 0); fab.querySelector('b').textContent = total > 99 ? '99+' : String(total || '');
      fab.setAttribute('aria-label', total > 0 ? `Abrir chat: ${total} mensaje${total === 1 ? '' : 's'} sin leer` : 'Abrir chat');
      if (total > previo) { fab.classList.remove('rebota'); void fab.offsetWidth; fab.classList.add('rebota'); }
    }
    previo = total;
    if (abierto && !actual) pintarLista();
  }

  // ------------------------------------------------------------------ arranque
  async function iniciar() {
    if ($('#chat-fab-btn')) return;                                  // campus.html: tiene su propia interfaz
    if (!hayUsuario() || !window.NikaSupabase) return;
    try { await window.NikaSupabase.ready; } catch (_) { return; }
    if (!yo()) return;
    const okCM = await cargarScript('chatManager.js?v=3', () => !!window.ChatManager);
    await cargarScript('friendsManager.js', () => !!window.NikaFriends);
    await cargarScript('presenciaCampus.js', () => !!window.NikaPresencia);
    if (!okCM || !window.ChatManager) return;
    const CM = window.ChatManager;
    CM.iniciarPresenciaGlobal().catch(() => {});
    if (SOLO_PRESENCIA) return;
    montarUI();
    CM.alCambiarLista(() => refrescarNoLeidos());
    CM.alCambiarPresencia(() => { if (abierto && !actual) pintarLista(); if (actual) { const s = $('#cf-est', panel); if (s) { const on = CM.estaEnLinea(actual); s.textContent = on ? 'En línea' : 'Desconectado'; s.classList.toggle('on', on); } } });
    refrescarNoLeidos();
    setInterval(() => { if (!document.hidden) refrescarNoLeidos(); }, 40000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refrescarNoLeidos(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(iniciar, 600)); else setTimeout(iniciar, 600);
})();
