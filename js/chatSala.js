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
  const MAX_MSGS = 300, MAX_TXT = 600;   // sin límite de mensajes por minuto: escriban lo que quieran
  const REACCIONES = ['👏', '💪', '☕', '🍅', '🔥', '❤️', '🎉', '😂'];
  const COLORES = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c'];
  const colorDe = (n) => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORES[h % COLORES.length]; };
  const hora = (t) => { try { return new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch (_) { return ''; } };

  let canal = null, sid = null, msgs = [], vistos = new Set(), noLeidos = 0, presentes = new Set(), ultimoSonido = 0, ultimoSonidoRx = 0, yoAvatar = '', yoNombreCompleto = '';
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
    try {
      const q = await sb().from('profiles_public').select('*').eq('id', yoId).maybeSingle();
      const p = q.data || {};
      yoAvatar = String(p.avatar || p.avatar_url || ''); yoNombreCompleto = String(p.fullname || p.full_name || p.nombre || '');
      if (!/^https?:/.test(yoAvatar) || yoAvatar.length > 400) yoAvatar = '';
    } catch (_) {}
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
        .on('presence', { event: 'sync' }, () => { try { presentes = new Set(Object.keys(canal.presenceState()).filter((k) => k !== yoNombre)); pintarTodo(); aviso(); } catch (_) {} })
        .on('presence', { event: 'join' }, ({ key }) => { if (key && key !== yoNombre) { presentes.add(key); sistema('@' + key + ' se unió al chat'); } })
        .on('presence', { event: 'leave' }, ({ key }) => { if (key && key !== yoNombre) { presentes.delete(key); sistema('@' + key + ' salió'); } })
        .subscribe(async (st) => {
          if (st === 'SUBSCRIBED') { try { await canal.track({ u: yoNombre, t: Date.now() }); } catch (_) {} }
          else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') {   // se reconecta solo, sin recargar
            const id2 = sid; try { sb().removeChannel(canal); } catch (_) {} canal = null; sid = null;
            setTimeout(() => { if (!sid) { let s2 = null; try { s2 = E().getState().shared; } catch (_) {} if (s2 && s2.sessionId === id2) entrarCanal(id2); } }, 4000);
          }
        });
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
    const m = { id: String(p.id), t: Number(p.t) || Date.now(), u: String(p.u).slice(0, 40), x: String(p.x || '').slice(0, MAX_TXT), r: !!p.r, n: String(p.n || '').slice(0, 60), av: /^https?:/.test(String(p.av || '')) && String(p.av).length <= 400 ? String(p.av) : '' };
    if (m.av) amigosCache[m.u.toLowerCase()] = Object.assign({}, amigosCache[m.u.toLowerCase()], { avatar: m.av, fullname: m.n || m.u });
    if (!m.x || !agregar(m)) return;
    if (m.r) { volar(m.x); if (!foco() && Date.now() - ultimoSonidoRx > 900) { ultimoSonidoRx = Date.now(); sonidoReaccion(m.x); } }   // en modo foco las reacciones ajenas no suenan
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
    const ahora = Date.now();
    const m = { id: 'm' + ahora + Math.random().toString(36).slice(2, 7), t: ahora, u: yoNombre, x, r: false };
    agregar(m); pintarTodo();
    try { await canal.send({ type: 'broadcast', event: 'msg', payload: { id: m.id, t: m.t, u: yoNombre, uid: yoId, n: yoNombreCompleto, av: yoAvatar, x, r: false } }); } catch (_) {}
    return true;
  }
  function reaccionar(emoji) {
    if (!canal) return false;
    const ahora = Date.now();
    const m = { id: 'r' + ahora + Math.random().toString(36).slice(2, 7), t: ahora, u: yoNombre, x: emoji, r: true };
    agregar(m); pintarTodo(); volar(emoji); sonidoReaccion(emoji);
    try { canal.send({ type: 'broadcast', event: 'msg', payload: { id: m.id, t: m.t, u: yoNombre, uid: yoId, n: yoNombreCompleto, av: yoAvatar, x: emoji, r: true } }); } catch (_) {}
    return true;
  }
  // ---------------------------------------------------------------- sonidos de reacciones (Web Audio, sin archivos)
  let actx = null;
  const audio = () => { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; if (!actx || actx.state === 'closed') actx = new C(); if (actx.state === 'suspended') actx.resume().catch(() => {}); return actx; } catch (_) { return null; } };
  const volumen = () => { try { const p = window.NikaNotif && NikaNotif.prefs(); if (p && p.silencio) return 0; return Math.max(0.1, Math.min(1, (p && p.volumen) || 0.7)); } catch (_) { return 0.7; } };
  function ruido(c, t0, dur, f, q, vol) {
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const s = c.createBufferSource(); s.buffer = b;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    const g = c.createGain(); g.gain.value = vol; s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t0);
  }
  function nota(c, t0, f0, f1, dur, vol, tipo) {
    const o = c.createOscillator(), g = c.createGain(); o.type = tipo || 'sine';
    o.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function sonidoReaccion(e) {
    const v = volumen(); if (!v) return;
    const c = audio(); if (!c) return; const t = c.currentTime + 0.01;
    switch (e) {
      case '👏': for (let i = 0; i < 9; i++) { const dt = i * (0.075 + (i % 3) * 0.018); ruido(c, t + dt, 0.07, 1700 + (i % 4) * 350, 0.9, 0.55 * v); } break;   // aplauso
      case '💪': nota(c, t, 140, 300, 0.16, 0.5 * v, 'triangle'); ruido(c, t, 0.08, 700, 1.2, 0.35 * v); nota(c, t + 0.14, 330, 520, 0.2, 0.3 * v, 'triangle'); break;
      case '☕': nota(c, t, 620, 330, 0.22, 0.4 * v); nota(c, t + 0.12, 480, 260, 0.26, 0.28 * v); break;                                      // gotita
      case '🍅': nota(c, t, 900, 180, 0.12, 0.5 * v); ruido(c, t, 0.05, 2400, 1, 0.25 * v); break;                                          // pop
      case '🔥': ruido(c, t, 0.45, 900, 0.5, 0.6 * v); nota(c, t, 220, 520, 0.4, 0.15 * v, 'sawtooth'); break;                              // fuego
      case '❤️': nota(c, t, 523, 523, 0.22, 0.4 * v); nota(c, t + 0.13, 659, 659, 0.3, 0.38 * v); break;
      case '🎉': [523, 659, 784, 1047].forEach((f, i) => nota(c, t + i * 0.07, f, f, 0.2, 0.38 * v, 'triangle')); for (let i = 0; i < 3; i++) ruido(c, t + 0.28 + i * 0.05, 0.1, 3000, 0.8, 0.3 * v); break;
      case '😂': for (let i = 0; i < 4; i++) nota(c, t + i * 0.09, 520 - i * 40, 420 - i * 40, 0.08, 0.35 * v); break;
      default: nota(c, t, 784, 784, 0.15, 0.35 * v);
    }
  }
  // emoji que sube flotando sobre el chat (como las reacciones de Discord)
  function volar(emoji) {
    [...vistas].forEach((vw) => {
      if (!vw.host.isConnected) return;
      const w = vw.host.querySelector('.cs-wrap'); if (!w) return;
      const r = document.createElement('span'); r.className = 'cs-vuelo'; r.textContent = emoji;
      r.style.left = (15 + Math.random() * 70) + '%'; r.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      w.appendChild(r); setTimeout(() => r.remove(), 1500);
    });
  }
  function leer() { if (noLeidos) { noLeidos = 0; aviso(); } }

  // ---------------------------------------------------------------- interfaz
  const CSS = `
  .cs-wrap{display:flex;flex-direction:column;min-height:0;height:100%;color:inherit;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  .cs-quien{margin:0;padding:5px 12px;font-size:.7rem;font-weight:700;opacity:.8;border-bottom:1px solid rgba(148,163,184,.18)}.cs-quien:empty{display:none}
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
  .cs-rx{display:flex;flex-wrap:wrap;gap:4px;padding:6px 10px 0}
  .cs-rx button{border:1px solid rgba(148,163,184,.35);background:transparent;border-radius:999px;font-size:1.05rem;padding:2px 9px;cursor:pointer;color:inherit;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s}
  .cs-rx button:hover{background:rgba(148,163,184,.22);transform:translateY(-2px) scale(1.12)}.cs-rx button:active{transform:scale(.9)}
  .cs-in{display:flex;gap:8px;padding:8px 10px 10px}
  .cs-in input{flex:1;min-width:0;padding:9px 14px;border-radius:999px;border:1px solid rgba(148,163,184,.4);background:rgba(148,163,184,.12);color:inherit;font:600 .86rem 'Plus Jakarta Sans',sans-serif;outline:none}
  .cs-in input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.22)}
  .cs-in button{width:40px;height:40px;border:0;border-radius:50%;background:#0284c7;color:#fff;font-size:1rem;cursor:pointer;flex:none;transition:transform .15s}.cs-in button:hover{transform:scale(1.08)}
  .cs-compacto .cs-msgs{max-height:170px;min-height:110px}
  .cs-wrap{position:relative;overflow:hidden}.cs-vuelo{position:absolute;bottom:62px;font-size:1.9rem;pointer-events:none;animation:csVuelo 1.4s ease-out forwards;z-index:3}
  @keyframes csVuelo{0%{opacity:0;transform:translate(0,10px) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx),-170px) scale(1.25)}}
  @keyframes csIn{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
  @keyframes csPop{from{opacity:0;transform:scale(.3) translateY(10px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.cs-m,.cs-r,.cs-vuelo{animation:none!important}.cs-vuelo{display:none}.cs-msgs{scroll-behavior:auto}}`;
  function estilos() { if (document.getElementById('cs-css')) return; const st = document.createElement('style'); st.id = 'cs-css'; st.textContent = CSS; document.head.appendChild(st); }

  function avatarDe(u) {
    const a = u === yoNombre ? { avatar: yoAvatar } : amigosCache[String(u).toLowerCase()];
    return a && a.avatar && /^https?:|^data:image/.test(a.avatar) ? '<img src="' + esc(a.avatar) + '" alt="">' : esc(String(u).slice(0, 2));
  }
  function filaMensaje(m) {
    if (m.sis) return '<div class="cs-s">' + esc(m.x) + '</div>';
    const mio = m.u === yoNombre;
    if (m.r) return '<div class="cs-r">' + esc(m.x) + '<small>' + (mio ? 'vos' : '@' + esc(m.u)) + '</small></div>';
    return '<div class="cs-m' + (mio ? ' mio' : '') + '"><span class="cs-av" style="background:' + colorDe(m.u) + '">' + avatarDe(m.u) + '</span><div class="cs-b">' + (mio ? '' : '<b>' + esc(m.n || (amigosCache[String(m.u).toLowerCase()] || {}).fullname || '@' + m.u) + '</b>') + esc(m.x) + '<em>' + hora(m.t) + '</em></div></div>';
  }
  function pintarVista(v) {
    if (!v.host.isConnected) return;
    const box = v.host.querySelector('.cs-msgs'); if (!box) return;
    const abajo = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    box.innerHTML = msgs.length ? msgs.map(filaMensaje).join('') : '<div class="cs-vacio">💬 Chat de la sala<br>Hablen libremente. Los mensajes duran lo que dura la sala.</div>';
    if (abajo || !v._ini) { box.scrollTop = box.scrollHeight; v._ini = true; }
    const w = v.host.querySelector('.cs-wrap'); if (w) w.classList.toggle('en-foco', foco());
    const q = v.host.querySelector('.cs-quien'); if (q) q.textContent = presentes.size ? '🟢 En el chat: ' + [...presentes].map((u) => '@' + u).join(', ') : (canal ? '⏳ Todavía no hay nadie más conectado al chat' : '');
  }
  function pintarTodo() {
    [...vistas].forEach((v) => { if (!v.host.isConnected) vistas.delete(v); else pintarVista(v); });
    if (noLeidos && [...vistas].some((v) => v.host.isConnected && (!v.opt.visible || v.opt.visible()))) leer();
  }

  function montar(host, opt) {
    opt = opt || {}; estilos();
    host.innerHTML = '<div class="cs-wrap' + (opt.compacto ? ' cs-compacto' : '') + '"><p class="cs-quien"></p><p class="cs-foco">🔕 Modo foco: mientras estudian no suena ni interrumpe. Los mensajes te esperan acá.</p>'
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
