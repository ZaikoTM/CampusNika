/* CAMPUS NIKA · Chat de la sala de estudio (Pomodoro compartido).
   Se conecta al chat actual: aparece como una conversación más en la ventanita flotante (js/chatFlotante.js) y dentro de la sala.
   · Mensajes en tiempo real por un canal de Supabase de la sala (broadcast). Solo duran lo que dura la sala: no se guardan en la base.
   · Modo foco: mientras corre un bloque de estudio no suena ni interrumpe; queda un contador de mensajes nuevos.
   · Reacciones rápidas, avisos de entrada y salida, límite de mensajes por minuto y respeto de los usuarios bloqueados.
   API: NikaChatSala.montar(host, { visible, compacto }) · estado() · enviar(t) · reaccionar(e) · alCambiar(fn) · leer() */
(function () {
  'use strict';
  if (window.NikaChatSala) return;
  const E = () => window.PomodoroEngine;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MAX_MSGS = 150, MAX_TXT = 400, LIMITE = 8, VENTANA = 20000;   // 8 mensajes cada 20 s
  const REACCIONES = ['👏', '💪', '☕', '🍅', '🔥', '❤️'];
  const COLORES = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c'];
  const colorDe = (n) => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORES[h % COLORES.length]; };
  const hora = (t) => { try { return new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch (_) { return ''; } };

  let canal = null, sid = null, msgs = [], vistos = new Set(), noLeidos = 0, envios = [], presentes = new Set(), ultimoSonido = 0;
  const vistas = new Set();           // vistas montadas: { host, opt }
  const oyentes = new Set();
  let yoNombre = '', yoId = '';
  let amigosCache = {};

  const sb = () => window.NikaSupabase && window.NikaSupabase.client;
  const foco = () => { try { const s = E() && E().getState(); return !!(s && s.status === 'running' && s.mode === 'work'); } catch (_) { return false; } };
  const aviso = () => oyentes.forEach((f) => { try { f(estado()); } catch (_) {} });
  function estado() { return { activo: !!sid, sid, n: msgs.length, noLeidos, presentes: [...presentes] }; }

  async function conocerme() {
    try { yoNombre = (window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername()) || ''; } catch (_) {}
    try { const s = await sb().auth.getSession(); yoId = (s.data && s.data.session && s.data.session.user.id) || ''; } catch (_) {}
    try { if (window.NikaFriends && NikaFriends.listFriends) (await NikaFriends.listFriends()).forEach((f) => { amigosCache[String(f.username).toLowerCase()] = f; }); } catch (_) {}
  }

  // ---------------------------------------------------------------- persistencia mientras dura la sala
  const clave = () => 'nika_sala_chat_' + sid;
  function guardar() { try { sessionStorage.setItem(clave(), JSON.stringify(msgs.slice(-MAX_MSGS))); } catch (_) {} }
  function cargarLocal() { try { msgs = JSON.parse(sessionStorage.getItem(clave()) || '[]'); } catch (_) { msgs = []; } vistos = new Set(msgs.map((m) => m.id)); }

  // ---------------------------------------------------------------- canal
  function salirCanal() {
    try { if (canal && sb()) sb().removeChannel(canal); } catch (_) {}
    canal = null; sid = null; msgs = []; vistos = new Set(); noLeidos = 0; presentes = new Set();
    pintarTodo(); aviso();
  }
  function entrarCanal(id) {
    if (canal || !sb()) return;
    sid = id; cargarLocal();
    try {
      canal = sb().channel('nika-sala-chat-' + id, { config: { broadcast: { self: false }, presence: { key: yoNombre || ('u' + Math.random().toString(36).slice(2, 7)) } } });
      canal.on('broadcast', { event: 'msg' }, ({ payload }) => recibir(payload))
        .on('presence', { event: 'join' }, ({ key }) => { if (key && key !== yoNombre) { presentes.add(key); sistema('@' + key + ' se unió al chat'); } })
        .on('presence', { event: 'leave' }, ({ key }) => { if (key && key !== yoNombre) { presentes.delete(key); sistema('@' + key + ' salió'); } })
        .subscribe(async (st) => { if (st === 'SUBSCRIBED') { try { await canal.track({ u: yoNombre, t: Date.now() }); } catch (_) {} } });
    } catch (_) { canal = null; }
    pintarTodo(); aviso();
  }
  // Se engancha a la sala del Pomodoro compartido: entra al canal cuando hay sala y sale cuando termina
  function sincronizar() {
    let st = null; try { st = E() && E().getState(); } catch (_) {}
    const id = st && st.shared && st.shared.sessionId;
    if (id && id !== sid) { if (canal) salirCanal(); entrarCanal(id); }
    else if (!id && sid) { try { sessionStorage.removeItem(clave()); } catch (_) {} salirCanal(); }
  }

  // ---------------------------------------------------------------- mensajes
  function agregar(m) {
    if (vistos.has(m.id)) return false;
    vistos.add(m.id); msgs.push(m); if (msgs.length > MAX_MSGS) msgs.shift(); guardar(); return true;
  }
  function sistema(texto) { agregar({ id: 's' + Date.now() + Math.random().toString(36).slice(2, 5), t: Date.now(), sis: true, x: texto }); pintarTodo(); }
  function recibir(p) {
    if (!p || !p.id || !p.u || p.u === yoNombre) return;
    try { if (p.uid && window.NikaModeracion && NikaModeracion.estaBloqueado(p.uid)) return; } catch (_) {}   // a los bloqueados no se los ve
    const m = { id: String(p.id), t: Number(p.t) || Date.now(), u: String(p.u).slice(0, 40), x: String(p.x || '').slice(0, MAX_TXT), r: !!p.r };
    if (!m.x || !agregar(m)) return;
    const visible = [...vistas].some((v) => v.host.isConnected && (!v.opt.visible || v.opt.visible()));
    if (!visible) {
      noLeidos++;
      // modo foco: ni sonido ni aviso; solo el contador. En el descanso suena suave, una vez cada 8 s
      if (!foco() && Date.now() - ultimoSonido > 8000) { ultimoSonido = Date.now(); try { window.NikaNotif && NikaNotif.sonar('mensaje'); } catch (_) {} }
    }
    pintarTodo(); aviso();
  }
  async function enviar(texto) {
    const x = String(texto || '').trim().slice(0, MAX_TXT); if (!x || !canal) return false;
    const ahora = Date.now(); envios = envios.filter((t) => ahora - t < VENTANA);
    if (envios.length >= LIMITE) { if (typeof window.showToast === 'function') window.showToast('Vas muy rápido: esperá unos segundos para seguir escribiendo.'); return false; }
    envios.push(ahora);
    const m = { id: 'm' + ahora + Math.random().toString(36).slice(2, 7), t: ahora, u: yoNombre, x, r: false };
    agregar(m); pintarTodo();
    try { await canal.send({ type: 'broadcast', event: 'msg', payload: { id: m.id, t: m.t, u: yoNombre, uid: yoId, x, r: false } }); } catch (_) {}
    return true;
  }
  function reaccionar(emoji) {
    if (!canal) return false;
    const ahora = Date.now(); envios = envios.filter((t) => ahora - t < VENTANA);
    if (envios.length >= LIMITE) return false;
    envios.push(ahora);
    const m = { id: 'r' + ahora + Math.random().toString(36).slice(2, 7), t: ahora, u: yoNombre, x: emoji, r: true };
    agregar(m); pintarTodo();
    try { canal.send({ type: 'broadcast', event: 'msg', payload: { id: m.id, t: m.t, u: yoNombre, uid: yoId, x: emoji, r: true } }); } catch (_) {}
    return true;
  }
  function leer() { if (noLeidos) { noLeidos = 0; aviso(); } }

  // ---------------------------------------------------------------- interfaz
  const CSS = `
  .cs-wrap{display:flex;flex-direction:column;min-height:0;height:100%;color:inherit;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  .cs-foco{margin:0;padding:6px 12px;font-size:.72rem;font-weight:700;background:rgba(251,191,36,.16);color:inherit;border-bottom:1px solid rgba(251,191,36,.3);display:none}
  .cs-wrap.en-foco .cs-foco{display:block}
  .cs-msgs{flex:1;min-height:0;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:7px;scroll-behavior:smooth}
  .cs-vacio{margin:auto;text-align:center;font-size:.8rem;font-weight:600;opacity:.75;padding:14px}
  .cs-m{max-width:86%;display:flex;gap:7px;align-items:flex-end;animation:csIn .28s cubic-bezier(.22,1.2,.36,1) both}
  .cs-m.mio{align-self:flex-end;flex-direction:row-reverse}
  .cs-av{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:.66rem;font-weight:900;color:#fff;text-transform:uppercase;overflow:hidden}
  .cs-av img{width:100%;height:100%;object-fit:cover}
  .cs-b{padding:7px 11px;border-radius:15px 15px 15px 4px;background:rgba(148,163,184,.22);font-size:.84rem;font-weight:600;line-height:1.35;word-break:break-word}
  .cs-m.mio .cs-b{border-radius:15px 15px 4px 15px;background:#0284c7;color:#fff}
  .cs-b b{display:block;font-size:.68rem;font-weight:800;margin-bottom:1px;opacity:.85}
  .cs-b em{display:block;font-style:normal;font-size:.62rem;opacity:.6;text-align:right;margin-top:2px}
  .cs-r{align-self:center;font-size:1.5rem;animation:csPop .5s cubic-bezier(.34,1.56,.64,1) both}
  .cs-r small{display:block;font-size:.62rem;font-weight:800;text-align:center;opacity:.7}
  .cs-s{align-self:center;font-size:.7rem;font-weight:700;opacity:.65;padding:2px 10px;border-radius:999px;background:rgba(148,163,184,.16)}
  .cs-rx{display:flex;gap:4px;padding:6px 10px 0;overflow-x:auto}
  .cs-rx button{border:1px solid rgba(148,163,184,.35);background:transparent;border-radius:999px;font-size:1.05rem;padding:2px 9px;cursor:pointer;color:inherit;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s}
  .cs-rx button:hover{background:rgba(148,163,184,.22);transform:translateY(-2px) scale(1.12)}.cs-rx button:active{transform:scale(.9)}
  .cs-in{display:flex;gap:8px;padding:8px 10px 10px}
  .cs-in input{flex:1;min-width:0;padding:9px 14px;border-radius:999px;border:1px solid rgba(148,163,184,.4);background:rgba(148,163,184,.12);color:inherit;font:600 .86rem 'Plus Jakarta Sans',sans-serif;outline:none}
  .cs-in input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.22)}
  .cs-in button{width:40px;height:40px;border:0;border-radius:50%;background:#0284c7;color:#fff;font-size:1rem;cursor:pointer;flex:none;transition:transform .15s}.cs-in button:hover{transform:scale(1.08)}
  .cs-compacto .cs-msgs{max-height:170px;min-height:110px}
  @keyframes csIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
  @keyframes csPop{from{opacity:0;transform:scale(.3) translateY(10px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.cs-m,.cs-r{animation:none!important}.cs-msgs{scroll-behavior:auto}}`;
  function estilos() { if (document.getElementById('cs-css')) return; const st = document.createElement('style'); st.id = 'cs-css'; st.textContent = CSS; document.head.appendChild(st); }

  function avatarDe(u) {
    const a = amigosCache[String(u).toLowerCase()];
    return a && a.avatar && /^https?:|^data:image/.test(a.avatar) ? '<img src="' + esc(a.avatar) + '" alt="">' : esc(String(u).slice(0, 2));
  }
  function filaMensaje(m) {
    if (m.sis) return '<div class="cs-s">' + esc(m.x) + '</div>';
    const mio = m.u === yoNombre;
    if (m.r) return '<div class="cs-r">' + esc(m.x) + '<small>' + (mio ? 'vos' : '@' + esc(m.u)) + '</small></div>';
    return '<div class="cs-m' + (mio ? ' mio' : '') + '"><span class="cs-av" style="background:' + colorDe(m.u) + '">' + avatarDe(m.u) + '</span><div class="cs-b">' + (mio ? '' : '<b>@' + esc(m.u) + '</b>') + esc(m.x) + '<em>' + hora(m.t) + '</em></div></div>';
  }
  function pintarVista(v) {
    if (!v.host.isConnected) return;
    const box = v.host.querySelector('.cs-msgs'); if (!box) return;
    const abajo = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    box.innerHTML = msgs.length ? msgs.map(filaMensaje).join('') : '<div class="cs-vacio">💬 Chat de la sala<br>Hablen libremente. Los mensajes duran lo que dura la sala.</div>';
    if (abajo || !v._ini) { box.scrollTop = box.scrollHeight; v._ini = true; }
    const w = v.host.querySelector('.cs-wrap'); if (w) w.classList.toggle('en-foco', foco());
  }
  function pintarTodo() {
    [...vistas].forEach((v) => { if (!v.host.isConnected) vistas.delete(v); else pintarVista(v); });
    if (noLeidos && [...vistas].some((v) => v.host.isConnected && (!v.opt.visible || v.opt.visible()))) leer();
  }

  function montar(host, opt) {
    opt = opt || {}; estilos();
    host.innerHTML = '<div class="cs-wrap' + (opt.compacto ? ' cs-compacto' : '') + '"><p class="cs-foco">🔕 Modo foco: mientras estudian no suena ni interrumpe. Los mensajes te esperan acá.</p>'
      + '<div class="cs-msgs" role="log" aria-live="polite" aria-label="Mensajes de la sala"></div>'
      + '<div class="cs-rx" aria-label="Reacciones rápidas">' + REACCIONES.map((e) => '<button type="button" data-e="' + e + '" aria-label="Enviar ' + e + '">' + e + '</button>').join('') + '</div>'
      + '<form class="cs-in" autocomplete="off"><input type="text" maxlength="' + MAX_TXT + '" placeholder="Escribile a la sala…" aria-label="Mensaje para la sala"><button type="submit" aria-label="Enviar">➤</button></form></div>';
    const v = { host, opt }; vistas.add(v); pintarVista(v);
    host.querySelector('.cs-rx').addEventListener('click', (e) => { const b = e.target.closest('button[data-e]'); if (b) reaccionar(b.dataset.e); });
    const form = host.querySelector('.cs-in'), input = form.querySelector('input');
    form.addEventListener('submit', async (e) => { e.preventDefault(); const t = input.value; if (!t.trim()) return; input.value = ''; const ok = await enviar(t); if (!ok) input.value = t; });
    if (!opt.visible || opt.visible()) leer();
    return { destruir() { vistas.delete(v); host.innerHTML = ''; }, foco() { input.focus(); } };
  }

  async function iniciar() {
    if (!E() || !sb()) { setTimeout(iniciar, 1500); return; }
    try { await window.NikaSupabase.ready; } catch (_) {}
    await conocerme();
    sincronizar();
    try { E().on('change', sincronizar); E().on('shared', sincronizar); } catch (_) {}
    setInterval(() => { sincronizar(); [...vistas].forEach((v) => { const w = v.host.querySelector && v.host.querySelector('.cs-wrap'); if (w) w.classList.toggle('en-foco', foco()); }); }, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  window.NikaChatSala = { montar, estado, enviar, reaccionar, leer, alCambiar: (f) => { oyentes.add(f); return () => oyentes.delete(f); } };
})();
