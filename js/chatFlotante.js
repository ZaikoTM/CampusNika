// js/chatFlotante.js
// CAMPUS NIKA — Chat y presencia en TODAS las páginas (sala de estudio, foro, liga, ateneos, recetarios…).
//
//  • Presencia: mantiene a la persona "en línea" y recibiendo mensajes sin importar en qué sección esté
//    (antes solo el campus lo hacía: quien estudiaba en otra página figuraba "desconectado" y no recibía nada).
//  • Interfaz: botón flotante 💬 (arriba del asistente) con contador rojo de mensajes sin leer, bandeja de
//    amigos con puntos de "en línea" y conversación completa con tildes de entrega y lectura.
//  • En campus.html reemplaza al chat viejo: el botón flotante, "Mensajes Privados" y los botones «Chat» de amigos y
//    perfiles abren ESTE mismo chat, así que es idéntico en todo el sitio. Con data-modo="presencia" (examen)
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
  let busqueda = '';
  const LS_GRUPOS = 'nika_cf_grupos', LS_MIN = 'nika_cf_min', PASO = 8;
  const limites = { msg: PASO, on: PASO, off: PASO, res: PASO * 2 };
  const leer = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (_) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  let plegados = leer(LS_GRUPOS, null);      // { msg:bool, on:bool, off:bool } true = plegado
  let minimizado = false;   // se minimiza solo mientras se está usando; abrir con el botón siempre lo despliega
  const yo = () => window.NikaSupabase.getNikaCurrentUsername();

  // ------------------------------------------------------------------ interfaz
  const CSS = `
  .cf-fab{position:fixed;right:20px;bottom:90px;width:56px;height:56px;border:0;border-radius:50%;cursor:pointer;z-index:9998;display:flex;align-items:center;justify-content:center;font-size:25px;color:#fff;
    background:linear-gradient(135deg,var(--nika-primary,#0284c7),var(--nika-accent,#38bdf8));box-shadow:0 4px 14px rgba(0,0,0,.3);transition:transform .18s,box-shadow .18s}
  .cf-fab,#nika-assistant-btn{transition:opacity .25s,transform .25s}body.cf-abierto .cf-fab,body.cf-abierto #nika-assistant-btn{opacity:0!important;pointer-events:none!important;transform:scale(.6)!important}
  .cf-fab:hover{transform:scale(1.07)}.cf-fab.hay{background:linear-gradient(135deg,#ef4444,#b91c1c);animation:cf-aviso 1.8s ease-in-out infinite}
  .cf-fab.rebota{animation:cf-rebote .7s cubic-bezier(.3,1.6,.5,1),cf-aviso 1.8s ease-in-out .7s infinite}
  .cf-fab b{position:absolute;top:-6px;right:-6px;min-width:22px;padding:1px 6px;border-radius:999px;background:#fff;color:#b91c1c;border:2px solid #ef4444;font:800 .72rem 'Plus Jakarta Sans',sans-serif;text-align:center;display:none;box-shadow:0 3px 10px rgba(0,0,0,.35)}
  .cf-fab.hay b{display:block}
  @keyframes cf-aviso{0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.3),0 0 0 0 rgba(239,68,68,.55)}50%{box-shadow:0 4px 14px rgba(0,0,0,.3),0 0 0 12px rgba(239,68,68,0)}}
  @keyframes cf-rebote{0%{transform:scale(1)}30%{transform:scale(1.28) rotate(-10deg)}60%{transform:scale(.94) rotate(6deg)}100%{transform:scale(1)}}
  .cf-panel{position:fixed;right:16px;bottom:16px;width:min(330px,calc(100vw - 20px));height:min(430px,calc(100vh - 110px));z-index:9999;display:none;flex-direction:column;overflow:hidden;border-radius:20px;
    background:var(--card-bg,#fff);color:var(--text-main,#0f172a);border:1px solid var(--border,#e2e8f0);box-shadow:0 24px 60px -20px rgba(0,0,0,.55);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  .cf-panel.on{display:flex;animation:cf-entra .3s cubic-bezier(.2,.8,.2,1) both}
  @keyframes cf-entra{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
  .cf-h{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border,#e2e8f0);background:linear-gradient(120deg,rgba(2,132,199,.12),rgba(99,102,241,.1))}
  .cf-h h4{margin:0;font-size:1rem;font-weight:800;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cf-h small{display:block;font-size:.72rem;font-weight:700;color:var(--text-muted,#64748b)}
  .cf-h small.on{color:#16a34a}.cf-min,.cf-x,.cf-back{border:0;background:transparent;color:inherit;font-size:1.1rem;cursor:pointer;padding:6px 9px;border-radius:10px}.cf-x:hover,.cf-back:hover{background:rgba(148,163,184,.2)}
  .cf-min:hover,.cf-x:hover{background:rgba(148,163,184,.2)}
  .cf-panel.min{height:auto!important;right:84px;width:min(260px,calc(100vw - 100px))}.cf-panel.min .cf-lista,.cf-panel.min .cf-msgs,.cf-panel.min .cf-in,.cf-panel.min .cf-buscar{display:none}.cf-panel.min .cf-h{cursor:pointer;border-bottom:0}
  .cf-buscar{padding:8px 10px 2px}.cf-buscar input{width:100%;box-sizing:border-box;padding:9px 14px;border-radius:999px;border:1px solid var(--border,#cbd5e1);background:var(--bg-body,#f8fafc);color:inherit;font:600 .84rem 'Plus Jakarta Sans',sans-serif;outline:none}
  .cf-buscar input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.2)}
  .cf-grp{display:flex;align-items:center;justify-content:space-between;width:100%;margin:6px 0 2px;padding:7px 10px;border:0;border-radius:10px;background:rgba(148,163,184,.14);color:var(--text-muted,#64748b);font:800 .7rem 'Plus Jakarta Sans',sans-serif;letter-spacing:.4px;text-transform:uppercase;cursor:pointer}
  .cf-grp em{font-style:normal;margin-left:4px;padding:1px 7px;border-radius:999px;background:rgba(2,132,199,.15);color:#0369a1}.cf-grp i{font-style:normal;transition:transform .2s}.cf-grp.cerrado i{transform:rotate(-90deg)}
  .cf-mas{display:block;width:calc(100% - 12px);margin:4px 6px 6px;padding:8px;border:1px dashed var(--border,#cbd5e1);border-radius:10px;background:transparent;color:#0369a1;font:800 .76rem 'Plus Jakarta Sans',sans-serif;cursor:pointer}.cf-mas:hover{background:rgba(2,132,199,.08)}
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
  .cf-b.cf-pregunta{border-left:4px solid #8b5cf6}.cf-b.cf-pregunta strong{display:block;font-size:.74rem;margin-bottom:4px;opacity:.9}
  #chat-fab-btn,#dm-inbox-modal,#private-chat-modal{display:none!important}
  .cf-in{display:flex;gap:8px;padding:10px;border-top:1px solid var(--border,#e2e8f0)}.cf-in input{flex:1;min-width:0;padding:10px 14px;border-radius:999px;border:1px solid var(--border,#cbd5e1);background:var(--bg-body,#f8fafc);color:inherit;font:600 .88rem 'Plus Jakarta Sans',sans-serif;outline:none}
  .cf-in input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.2)}.cf-in button{width:42px;height:42px;border:0;border-radius:50%;background:#0284c7;color:#fff;font-size:1.05rem;cursor:pointer}
  @media (max-width:640px){.cf-fab{width:48px;height:48px;right:12px;bottom:74px}.cf-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height:min(75vh,520px)}.cf-panel.min{right:70px;bottom:12px;width:calc(100vw - 84px)}}
  @media (prefers-reduced-motion:reduce){.cf-fab.hay,.cf-fab.rebota,.cf-panel.on,.cf-b{animation:none!important}}`;

  let fab, panel;
  function montarUI() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    fab = document.createElement('button'); fab.type = 'button'; fab.className = 'cf-fab'; fab.setAttribute('aria-label', 'Abrir chat'); fab.innerHTML = '💬<b></b>';
    fab.addEventListener('click', () => { if (!abierto) abrir(); else if (minimizado) alternarMin(); else cerrar(); });
    panel = document.createElement('section'); panel.className = 'cf-panel'; panel.setAttribute('aria-label', 'Mensajes');
    document.body.append(fab, panel);
    vistaLista();
  }
  const abrir = () => { abierto = true; minimizado = false; panel.classList.add('on'); aplicarMin(); if (!actual) vistaLista(); else { const m = $('.cf-msgs', panel); if (m) m.scrollTop = m.scrollHeight; marcarLeidoActual(); } };
  // Un mensaje cuenta como LEÍDO solo si el panel está desplegado y a la vista. Minimizado o cerrado, queda sin leer:
  // suena, se pone el botón en rojo y el contador sube, igual que si estuvieras en cualquier otra pantalla.
  function sincronizarLectura() { try { if (window.ChatManager) window.ChatManager.lecturaAutomatica = !!(abierto && !minimizado); } catch (_) {} }
  function marcarLeidoActual() { if (actual && abierto && !minimizado && !document.hidden) window.ChatManager.marcarComoLeido(actual).then(refrescarNoLeidos).catch(() => {}); }
  function cerrar() {
    abierto = false; panel.classList.remove('on'); document.body.classList.remove('cf-abierto');
    if (actual) { actual = null; try { window.ChatManager.cerrarConversacion(); } catch (_) {} }   // al cerrar se sale de la conversación: lo que llegue queda sin leer
    sincronizarLectura();
  }
  // Minimizar: queda solo la barra de arriba (nombre, estado y contador); un clic en la barra lo vuelve a abrir
  function aplicarMin() { panel.classList.toggle('min', minimizado); document.body.classList.toggle('cf-abierto', abierto && !minimizado); sincronizarLectura(); const b = $('.cf-min', panel); if (b) { b.textContent = minimizado ? '▢' : '–'; b.title = minimizado ? 'Restaurar' : 'Minimizar'; } }
  function alternarMin(e) { if (e) e.stopPropagation(); minimizado = !minimizado; aplicarMin(); if (!minimizado) { const m = $('.cf-msgs', panel); if (m) m.scrollTop = m.scrollHeight; marcarLeidoActual(); } }
  const cabeceraBtns = () => `<button type="button" class="cf-min" aria-label="Minimizar">–</button><button type="button" class="cf-x" aria-label="Cerrar">✕</button>`;
  function conectarCabecera() {
    $('.cf-x', panel).onclick = (e) => { e.stopPropagation(); cerrar(); };
    $('.cf-min', panel).onclick = alternarMin;
    $('.cf-h', panel).onclick = (e) => { if (minimizado && !e.target.closest('button')) alternarMin(); };
    aplicarMin();
  }

  // ------------------------------------------------------------------ bandeja
  async function vistaLista() {
    const CM = window.ChatManager;
    if (actual) { actual = null; try { await CM.cerrarConversacion(); } catch (_) {} }
    panel.innerHTML = `<div class="cf-h"><h4>💬 Mensajes<small id="cf-sub"></small></h4>${cabeceraBtns()}</div>
      <div class="cf-buscar"><input type="search" id="cf-q" placeholder="Buscar amigo…" aria-label="Buscar amigo" autocomplete="off" value="${esc(busqueda)}"></div>
      <div class="cf-lista" id="cf-lista"><div class="cf-vacio">Cargando…</div></div>`;
    conectarCabecera();
    $('#cf-q', panel).addEventListener('input', (e) => { busqueda = e.target.value; limites.res = PASO * 2; pintarLista(); });
    try { amigos = await window.NikaFriends.listFriends(); } catch (_) { amigos = []; }
    try { noLeidos = await CM.contarNoLeidos(); } catch (_) {}
    pintarLista();
  }
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function filaAmigo(f, on) {
    return `<button type="button" class="cf-item" data-u="${esc(f.username)}"><span class="cf-av"><img src="${esc(f.avatar || AVATAR)}" alt="" loading="lazy"><i class="${on ? 'on' : ''}"></i></span>
      <span class="cf-nom"><b>${esc(f.fullname)}</b><small class="${on ? 'on' : ''}">${on ? 'En línea' : '@' + esc(f.username)}</small></span>${noLeidos[f.username] ? `<span class="cf-n">${noLeidos[f.username]}</span>` : ''}</button>`;
  }
  function pintarLista() {
    const box = $('#cf-lista', panel); if (!box || actual) return;
    const CM = window.ChatManager; const on = (f) => CM.estaEnLinea(f.username);
    const nOn = amigos.filter(on).length, nMsg = amigos.filter((f) => noLeidos[f.username]).length;
    const sub = $('#cf-sub', panel); if (sub) sub.textContent = amigos.length ? `${nOn} en línea · ${amigos.length} amigos` : '';
    if (!amigos.length) { box.innerHTML = '<div class="cf-vacio">Agregá amigos desde «Comunidad &amp; Amigos» del campus para chatear con ellos.</div>'; return; }
    const porNombre = (a, b) => String(a.fullname).localeCompare(String(b.fullname), 'es');
    const q = norm(busqueda).trim();
    let html = '';
    const lista = (arr, clave) => {
      const max = limites[clave]; const vis = arr.slice(0, max);
      return vis.map((f) => filaAmigo(f, on(f))).join('') + (arr.length > max ? `<button type="button" class="cf-mas" data-mas="${clave}">Ver ${Math.min(PASO, arr.length - max)} más (${arr.length - max} sin mostrar)</button>` : '');
    };
    if (q) {
      const res = amigos.filter((f) => norm(f.fullname).includes(q) || norm(f.username).includes(q)).sort((a, b) => (on(b) - on(a)) || porNombre(a, b));
      html = res.length ? lista(res, 'res') : '<div class="cf-vacio">Nadie coincide con esa búsqueda.</div>';
    } else {
      const conMsg = amigos.filter((f) => noLeidos[f.username]).sort((a, b) => noLeidos[b.username] - noLeidos[a.username] || porNombre(a, b));
      const enLinea = amigos.filter((f) => !noLeidos[f.username] && on(f)).sort(porNombre);
      const resto = amigos.filter((f) => !noLeidos[f.username] && !on(f)).sort(porNombre);
      // Por defecto, con muchos amigos solo se despliegan los que tienen mensajes y los conectados
      if (!plegados) plegados = { msg: false, on: false, off: amigos.length > 6 };
      const grupo = (clave, titulo, arr) => arr.length ? `<button type="button" class="cf-grp${plegados[clave] ? ' cerrado' : ''}" data-g="${clave}"><span>${titulo} <em>${arr.length}</em></span><i>▾</i></button>${plegados[clave] ? '' : lista(arr, clave)}` : '';
      html = grupo('msg', '💬 Con mensajes', conMsg) + grupo('on', '🟢 En línea', enLinea) + grupo('off', '⚪ Desconectados', resto);
    }
    box.innerHTML = html;
    box.querySelectorAll('.cf-item').forEach((b) => b.addEventListener('click', () => conversacion(b.dataset.u)));
    box.querySelectorAll('.cf-grp').forEach((b) => b.addEventListener('click', () => { plegados[b.dataset.g] = !plegados[b.dataset.g]; guardar(LS_GRUPOS, plegados); pintarLista(); }));
    box.querySelectorAll('.cf-mas').forEach((b) => b.addEventListener('click', () => { limites[b.dataset.mas] += PASO; pintarLista(); }));
  }

  // ------------------------------------------------------------------ conversación
  const hora = (iso) => { try { return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch (_) { return ''; } };
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
    if (m.shared_question) {   // tarjeta de pregunta compartida desde un simulacro
      const q = m.shared_question; el.classList.add('cf-pregunta');
      const h = document.createElement('strong'); h.textContent = '📋 Pregunta compartida' + (q.up ? ' · ' + q.up : ''); el.appendChild(h);
    }
    const t = document.createElement('span'); t.textContent = m.shared_question ? (m.shared_question.q || '') : (m.content || ''); el.appendChild(t);
    const meta = document.createElement('em'); meta.innerHTML = esc(hora(m.created_at)) + (mia ? CM.tickHTML(CM.estadoDeEntrega(m)) : ''); el.appendChild(meta);
    box.appendChild(el); box.scrollTop = box.scrollHeight;
  }
  async function conversacion(user) {
    const CM = window.ChatManager; const f = amigos.find((x) => x.username === user) || { username: user, fullname: '@' + user };
    actual = user; ids = new Set(); ultimoDia = null;
    panel.innerHTML = `<div class="cf-h"><button type="button" class="cf-back" aria-label="Volver">←</button><span class="cf-av"><img src="${esc(f.avatar || AVATAR)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover"></span>
      <h4>${esc(f.fullname)}<small id="cf-est">Conectando…</small></h4>${cabeceraBtns()}</div>
      <div class="cf-msgs"><div class="cf-vacio">Cargando conversación…</div></div>
      <form class="cf-in" autocomplete="off"><input type="text" maxlength="800" placeholder="Escribí un mensaje…" aria-label="Mensaje"><button type="submit" aria-label="Enviar">➤</button></form>`;
    $('.cf-back', panel).onclick = (e) => { e.stopPropagation(); vistaLista(); }; conectarCabecera();
    const pintarEstado = (on) => { const s = $('#cf-est', panel); if (s) { s.textContent = on ? 'En línea' : 'Desconectado'; s.classList.toggle('on', !!on); } };
    sincronizarLectura();
    CM.onMensaje = (row) => { if (row.from_username !== user && row.to_username !== user) return; burbuja(row); if (row.from_username === user && abierto && !minimizado && !document.hidden) CM.marcarComoLeido(user).then(refrescarNoLeidos); else refrescarNoLeidos(); };
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
  let montado = false, corriendo = false, resolverListo; const listo = new Promise((r) => { resolverListo = r; });
  async function iniciar() {
    if (montado) return true;
    if (corriendo || !hayUsuario() || !window.NikaSupabase) return false;
    corriendo = true;
    try {
      try { await window.NikaSupabase.ready; } catch (_) { return false; }
      if (!yo()) return false;
      const okCM = await cargarScript('chatManager.js?v=3', () => !!window.ChatManager);
      await cargarScript('friendsManager.js', () => !!window.NikaFriends);
      await cargarScript('presenciaCampus.js', () => !!window.NikaPresencia);
      if (!okCM || !window.ChatManager) return false;
      const CM = window.ChatManager;
      CM.iniciarPresenciaGlobal().catch(() => {});
      if (!SOLO_PRESENCIA) {
        montarUI();
        CM.alCambiarLista(() => refrescarNoLeidos());
        CM.alCambiarPresencia(() => { if (abierto && !actual) pintarLista(); if (actual) { const s = $('#cf-est', panel); if (s) { const on = CM.estaEnLinea(actual); s.textContent = on ? 'En línea' : 'Desconectado'; s.classList.toggle('on', on); } } });
        refrescarNoLeidos();
        setInterval(() => { if (!document.hidden) refrescarNoLeidos(); }, 40000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refrescarNoLeidos(); });
      }
      montado = true; resolverListo(true);
      return true;
    } finally { corriendo = false; }
  }

  // API pública: abrir la bandeja o una conversación desde cualquier botón del sitio
  async function abrirBandeja() { await listo; if (SOLO_PRESENCIA) return; abrir(); }
  async function abrirConUsuario(user) {
    await listo; if (SOLO_PRESENCIA || !user) return;
    if (!amigos.length) { try { amigos = await window.NikaFriends.listFriends(); } catch (_) {} }
    if (!amigos.some((f) => String(f.username).toLowerCase() === String(user).toLowerCase())) {
      if (typeof window.showToast === 'function') window.showToast('Solo podés chatear con tus amigos. Agregalo desde «Comunidad & Amigos».'); return;
    }
    const real = amigos.find((f) => String(f.username).toLowerCase() === String(user).toLowerCase());
    abierto = true; panel.classList.add('on'); minimizado = false; aplicarMin();
    await conversacion(real.username);
  }
  window.NikaChat = { abrir: abrirBandeja, conversacion: abrirConUsuario };
  // En el campus los botones del chat viejo (menú «Mensajes Privados», «Chat» de amigos y perfiles) pasan al chat unificado
  if (!SOLO_PRESENCIA) {
    window.openChatWithFriend = (u) => abrirConUsuario(u);
    window.openDmInboxModal = () => abrirBandeja();
    window.handleChatFabClick = () => abrirBandeja();
    window.closeDmInboxModal = () => {};
  }

  // El campus permite iniciar sesión sin recargar: se reintenta hasta que haya sesión
  function arrancar() {
    let intentos = 0;
    const t = setInterval(async () => { if (await iniciar() || ++intentos > 600) clearInterval(t); }, 1500);
    iniciar().then((ok) => { if (ok) clearInterval(t); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(arrancar, 600)); else setTimeout(arrancar, 600);
})();
