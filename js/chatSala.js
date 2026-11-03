/* CAMPUS NIKA · Chat de la sala de estudio (Pomodoro compartido).
   Se conecta al chat actual: aparece como una conversación más en la ventanita flotante (js/chatFlotante.js), en la barra de enfoque
   y dentro de la sala.
   · Tiempo real por un canal de Supabase de la sala (broadcast + presencia). Los mensajes duran lo que dura la sala: no se guardan en la base.
   · Modo foco (interruptor): mientras corre un bloque de estudio no suena ni interrumpe; queda un contador de mensajes nuevos.
   · Sin límite de mensajes. Reacciones con sonido (aplauso real y sonidos generados), "está escribiendo…", menciones, enlaces, emojis.
   · Usuarios bloqueados no se muestran. Se muestra quién está en la sala y quién ya tiene el chat abierto.
   API: NikaChatSala.montar(host, { visible, compacto, tema }) · estado() · enviar(t) · reaccionar(e) · alCambiar(fn) · leer() · modoFoco() */
(function () {
  'use strict';
  if (window.NikaChatSala) return;
  const E = () => window.PomodoroEngine;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MAX_MSGS = 300, MAX_TXT = 600;
  const REACCIONES = [['👏', 'aplaudió'], ['💪', 'mandó fuerza'], ['☕', 'pidió un café'], ['🍅', 'tiró un tomate'], ['🔥', 'prendió fuego'], ['❤️', 'mandó amor'], ['🎉', 'festejó'], ['😂', 'se rió']];
  const EMOJIS = ['😀', '😂', '🤣', '😅', '😊', '😍', '🤩', '😎', '🤔', '😴', '😭', '😤', '🥳', '🙏', '👍', '👎', '🙌', '👀', '🥲', '✨', '💙', '💯', '🚀', '✅', '❌', '⏰', '📚', '🧠', '🩺', '💉', '🫀', '☕'];
  const COLORES = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c'];
  const colorDe = (n) => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORES[h % COLORES.length]; };
  const hora = (t) => { try { return new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch (_) { return ''; } };
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

  let canal = null, sid = null, msgs = [], vistos = new Set(), noLeidos = 0, presentes = new Set(), escribiendo = {};
  let ultimoSonido = 0, ultimoSonidoRx = 0, yoAvatar = '', yoNombreCompleto = '', yoNombre = '', yoId = '', tTyping = 0;
  const amigosCache = {}, vistas = new Set(), oyentes = new Set();

  const sb = () => window.NikaSupabase && window.NikaSupabase.client;
  const modoFocoOn = () => ls.get('nika_modo_foco') !== '0';              // interruptor: encendido por defecto
  const sonidoOn = () => ls.get('nika_sala_sonido') !== '0';
  const estudiando = () => { try { const s = E() && E().getState(); return !!(s && s.status === 'running' && s.mode === 'work'); } catch (_) { return false; } };
  const foco = () => modoFocoOn() && estudiando();
  const aviso = () => oyentes.forEach((f) => { try { f(estado()); } catch (_) {} });
  function estado() { return { activo: !!sid, sid, n: msgs.length, noLeidos, presentes: [...presentes] }; }

  // ---------------------------------------------------------------- quién soy y quién está en la sala
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
  // Integrantes de la sala según el Pomodoro compartido (con o sin chat abierto)
  function integrantes() {
    let st = null; try { st = E() && E().getState(); } catch (_) {}
    const sh = st && st.shared; if (!sh) return [];
    const out = new Map(), add = (u, on) => { if (u && !out.has(String(u))) out.set(String(u), { u: String(u), on: on !== false }); };
    add(sh.hostUsername || (sh.role === 'host' ? yoNombre : null), true);
    if (sh.role === 'host') (sh.guests || []).filter((g) => g.joined).forEach((g) => add(g.username, g.online));
    else (sh.roster || []).forEach((r) => add(typeof r === 'string' ? r : (r.username || r.u), typeof r === 'string' ? true : r.online));
    add(yoNombre, true);
    return [...out.values()];
  }
  const nombreDe = (u) => { const a = amigosCache[String(u).toLowerCase()]; return (a && a.fullname) || '@' + u; };
  const nombreCorto = (u) => { const n = nombreDe(u); return n.startsWith('@') ? n : n.split(' ')[0]; };
  function avatarHtml(u) {
    const a = u === yoNombre ? { avatar: yoAvatar } : amigosCache[String(u).toLowerCase()];
    return a && a.avatar && /^https?:|^data:image/.test(a.avatar) ? '<img src="' + esc(a.avatar) + '" alt="" loading="lazy">' : esc(String(u).slice(0, 2));
  }

  // ---------------------------------------------------------------- persistencia mientras dura la sala
  const clave = () => 'nika_sala_chat_' + sid;
  function guardar() { try { sessionStorage.setItem(clave(), JSON.stringify(msgs.slice(-MAX_MSGS))); } catch (_) {} }
  function cargarLocal() { try { msgs = JSON.parse(sessionStorage.getItem(clave()) || '[]'); } catch (_) { msgs = []; } vistos = new Set(msgs.map((m) => m.id)); }

  // ---------------------------------------------------------------- canal
  function salirCanal() {
    try { if (canal && sb()) sb().removeChannel(canal); } catch (_) {}
    canal = null; sid = null; msgs = []; vistos = new Set(); noLeidos = 0; presentes = new Set(); escribiendo = {};
    pintarTodo(); aviso();
  }
  function entrarCanal(id) {
    if (canal || !sb()) return;
    sid = id; cargarLocal();
    try {
      canal = sb().channel('nika-sala-chat-' + id, { config: { broadcast: { self: false }, presence: { key: yoNombre || ('u' + Math.random().toString(36).slice(2, 7)) } } });
      canal.on('broadcast', { event: 'msg' }, ({ payload }) => recibir(payload))
        .on('broadcast', { event: 'typing' }, ({ payload }) => { if (payload && payload.u && payload.u !== yoNombre) { escribiendo[payload.u] = Date.now(); pintarTodo(); setTimeout(pintarTodo, 3300); } })
        .on('presence', { event: 'sync' }, () => { try { presentes = new Set(Object.keys(canal.presenceState()).filter((k) => k !== yoNombre)); pintarTodo(); aviso(); } catch (_) {} })
        .on('presence', { event: 'join' }, ({ key }) => { if (key && key !== yoNombre) { presentes.add(key); sistema(nombreDe(key) + ' se unió al chat'); if (!foco()) sonidoSuave('entra'); } })
        .on('presence', { event: 'leave' }, ({ key }) => { if (key && key !== yoNombre) { presentes.delete(key); sistema(nombreDe(key) + ' salió del chat'); } })
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
  function sincronizar() {
    let st = null; try { st = E() && E().getState(); } catch (_) {}
    const id = st && st.shared && st.shared.sessionId;
    if (id && id !== sid) { if (canal) salirCanal(); entrarCanal(id); }
    else if (!id && sid) { try { sessionStorage.removeItem(clave()); } catch (_) {} salirCanal(); }
  }

  // ---------------------------------------------------------------- mensajes
  function agregar(m) { if (vistos.has(m.id)) return false; vistos.add(m.id); msgs.push(m); if (msgs.length > MAX_MSGS) msgs.shift(); guardar(); return true; }
  function sistema(texto) { agregar({ id: 's' + Date.now() + Math.random().toString(36).slice(2, 5), t: Date.now(), sis: true, x: texto }); pintarTodo(); }
  const visibleAhora = () => [...vistas].some((v) => v.host.isConnected && (!v.opt.visible || v.opt.visible()));
  const mencionaA = (x) => !!yoNombre && new RegExp('@' + yoNombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(x);
  function recibir(p) {
    if (!p || !p.id || !p.u || p.u === yoNombre) return;
    try { if (p.uid && window.NikaModeracion && NikaModeracion.estaBloqueado(p.uid)) return; } catch (_) {}   // a los bloqueados no se los ve
    const m = { id: String(p.id), t: Number(p.t) || Date.now(), u: String(p.u).slice(0, 40), x: String(p.x || '').slice(0, MAX_TXT), r: !!p.r, n: String(p.n || '').slice(0, 60), av: /^https?:/.test(String(p.av || '')) && String(p.av).length <= 400 ? String(p.av) : '' };
    if (m.av) amigosCache[m.u.toLowerCase()] = Object.assign({}, amigosCache[m.u.toLowerCase()], { avatar: m.av, fullname: m.n || (amigosCache[m.u.toLowerCase()] || {}).fullname || '@' + m.u });
    if (!m.x || !agregar(m)) return;
    delete escribiendo[m.u];
    if (m.r) { volar(m.x, nombreCorto(m.u)); if (!foco() && Date.now() - ultimoSonidoRx > 900) { ultimoSonidoRx = Date.now(); sonidoReaccion(m.x); } }   // en modo foco las reacciones ajenas no suenan
    else if (!foco()) { if (mencionaA(m.x)) sonidoSuave('mencion'); else if (Date.now() - ultimoSonido > 1500) { ultimoSonido = Date.now(); sonidoSuave('recibe'); } }
    if (!visibleAhora()) noLeidos++;
    pintarTodo(); aviso();
  }
  async function enviar(texto) {
    const x = String(texto || '').trim().slice(0, MAX_TXT); if (!x || !canal) return false;
    const ahora = Date.now();
    const m = { id: 'm' + ahora + Math.random().toString(36).slice(2, 7), t: ahora, u: yoNombre, x, r: false };
    agregar(m); pintarTodo(); sonidoSuave('envia');
    try { await canal.send({ type: 'broadcast', event: 'msg', payload: { id: m.id, t: m.t, u: yoNombre, uid: yoId, n: yoNombreCompleto, av: yoAvatar, x, r: false } }); } catch (_) {}
    return true;
  }
  function reaccionar(emoji) {
    if (!canal) return false;
    const ahora = Date.now();
    const m = { id: 'r' + ahora + Math.random().toString(36).slice(2, 7), t: ahora, u: yoNombre, x: emoji, r: true };
    agregar(m); pintarTodo(); volar(emoji, 'vos'); sonidoReaccion(emoji);
    try { canal.send({ type: 'broadcast', event: 'msg', payload: { id: m.id, t: m.t, u: yoNombre, uid: yoId, n: yoNombreCompleto, av: yoAvatar, x: emoji, r: true } }); } catch (_) {}
    return true;
  }
  function avisarEscribiendo() {
    if (!canal || Date.now() - tTyping < 2500) return; tTyping = Date.now();
    try { canal.send({ type: 'broadcast', event: 'typing', payload: { u: yoNombre } }); } catch (_) {}
  }
  function leer() { if (noLeidos) { noLeidos = 0; aviso(); } }

  // ---------------------------------------------------------------- sonidos
  let actx = null;
  const audio = () => { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; if (!actx || actx.state === 'closed') actx = new C(); if (actx.state === 'suspended') actx.resume().catch(() => {}); return actx; } catch (_) { return null; } };
  const volumen = () => { if (!sonidoOn()) return 0; try { const p = window.NikaNotif && NikaNotif.prefs(); if (p && p.silencio) return 0; return Math.max(0.1, Math.min(1, (p && p.volumen) || 0.7)); } catch (_) { return 0.7; } };
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
  // Grabaciones reales (dominio público, assets/sonidos): se bajan una vez y se recortan al reproducir. Si no cargan, queda el sonido generado.
  const MUESTRAS = { aplauso: 'assets/sonidos/aplauso.ogg', hurra: 'assets/sonidos/hurra.oga' };
  const buf = {};
  let precargado = false;
  async function precargar() {
    if (precargado) return; precargado = true;
    for (const k of Object.keys(MUESTRAS)) {
      try {
        const c = audio(); if (!c) { buf[k] = false; continue; }
        const r = await fetch(MUESTRAS[k]); if (!r.ok) { buf[k] = false; continue; }
        const ab = await r.arrayBuffer();
        buf[k] = await new Promise((ok, no) => { c.decodeAudioData(ab, ok, no); });
      } catch (_) { buf[k] = false; }
    }
  }
  function muestra(c, k, t, desde, dur, vol) {
    const b = buf[k]; if (!b) return false;
    const s = c.createBufferSource(); s.buffer = b; const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.05); g.gain.setValueAtTime(vol, t + dur - 0.45); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(g); g.connect(c.destination); s.start(t, Math.min(desde, Math.max(0, b.duration - dur - 0.1)), dur); return true;
  }
  function sonidoReaccion(e) {
    const v = volumen(); if (!v) return;
    const c = audio(); if (!c) return; const t = c.currentTime + 0.01;
    switch (e) {
      case '👏': if (!muestra(c, 'aplauso', t, 1.2, 2.2, 0.9 * v)) for (let i = 0; i < 9; i++) ruido(c, t + i * (0.075 + (i % 3) * 0.018), 0.07, 1700 + (i % 4) * 350, 0.9, 0.55 * v); break;
      case '🎉': muestra(c, 'hurra', t, 0.2, 2.6, 0.8 * v); [523, 659, 784, 1047].forEach((f, i) => nota(c, t + i * 0.07, f, f, 0.2, 0.3 * v, 'triangle')); for (let i = 0; i < 3; i++) ruido(c, t + 0.28 + i * 0.05, 0.1, 3000, 0.8, 0.3 * v); break;
      case '💪': nota(c, t, 140, 300, 0.16, 0.5 * v, 'triangle'); ruido(c, t, 0.08, 700, 1.2, 0.35 * v); nota(c, t + 0.14, 330, 520, 0.2, 0.3 * v, 'triangle'); break;
      case '☕': nota(c, t, 620, 330, 0.22, 0.4 * v); nota(c, t + 0.12, 480, 260, 0.26, 0.28 * v); break;
      case '🍅': nota(c, t, 900, 180, 0.12, 0.5 * v); ruido(c, t, 0.05, 2400, 1, 0.25 * v); break;
      case '🔥': ruido(c, t, 0.45, 900, 0.5, 0.6 * v); nota(c, t, 220, 520, 0.4, 0.15 * v, 'sawtooth'); break;
      case '❤️': nota(c, t, 523, 523, 0.22, 0.4 * v); nota(c, t + 0.13, 659, 659, 0.3, 0.38 * v); break;
      case '😂': for (let i = 0; i < 4; i++) nota(c, t + i * 0.09, 520 - i * 40, 420 - i * 40, 0.08, 0.35 * v); break;
      default: nota(c, t, 784, 784, 0.15, 0.35 * v);
    }
  }
  // sonidos cortos de la conversación (suaves)
  function sonidoSuave(k) {
    const v = volumen(); if (!v) return;
    const c = audio(); if (!c) return; const t = c.currentTime + 0.005;
    if (k === 'envia') nota(c, t, 520, 780, 0.09, 0.22 * v);
    else if (k === 'recibe') { nota(c, t, 700, 700, 0.07, 0.24 * v); nota(c, t + 0.08, 940, 940, 0.12, 0.2 * v); }
    else if (k === 'mencion') { nota(c, t, 784, 784, 0.1, 0.3 * v); nota(c, t + 0.1, 1047, 1047, 0.1, 0.3 * v); nota(c, t + 0.2, 1319, 1319, 0.22, 0.3 * v); }
    else if (k === 'entra') nota(c, t, 440, 660, 0.14, 0.18 * v);
    else if (k === 'switch') nota(c, t, 600, 600, 0.05, 0.18 * v);
  }
  function volar(emoji, quien) {
    [...vistas].forEach((vw) => {
      if (!vw.host.isConnected) return;
      const w = vw.host.querySelector('.cs-wrap'); if (!w) return;
      const r = document.createElement('span'); r.className = 'cs-vuelo';
      r.innerHTML = esc(emoji) + (quien ? '<small>' + esc(quien) + '</small>' : '');
      r.style.left = (12 + Math.random() * 68) + '%'; r.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      w.appendChild(r); setTimeout(() => r.remove(), 1700);
      if (emoji === '🎉') for (let i = 0; i < 16; i++) {
        const cf = document.createElement('i'); cf.className = 'cs-conf'; cf.style.left = (Math.random() * 100) + '%'; cf.style.background = COLORES[i % COLORES.length];
        cf.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); cf.style.animationDelay = (Math.random() * .25) + 's'; w.appendChild(cf); setTimeout(() => cf.remove(), 2000);
      }
    });
  }

  // ---------------------------------------------------------------- interfaz
  const CSS = `
  .cs-wrap{--cs-tx:#0f172a;--cs-mu:#64748b;--cs-bd:rgba(100,116,139,.28);--cs-otro:#f1f5f9;--cs-chip:#e0f2fe;--cs-ac1:#0ea5e9;--cs-ac2:#6366f1;--cs-in:#f8fafc;--cs-glow:rgba(14,165,233,.25);
    position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:0;height:100%;color:var(--cs-tx);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  body.dark-mode .cs-wrap{--cs-tx:#e2e8f0;--cs-mu:#94a3b8;--cs-bd:rgba(148,163,184,.25);--cs-otro:rgba(148,163,184,.18);--cs-chip:rgba(56,189,248,.16);--cs-in:rgba(148,163,184,.12);--cs-glow:rgba(56,189,248,.3)}
  body.tema-premium .cs-wrap{--cs-ac1:#a855f7;--cs-ac2:#6366f1;--cs-chip:rgba(168,85,247,.2);--cs-glow:rgba(168,85,247,.35)}
  .cs-wrap.cs-sala{--cs-tx:#fff1f2;--cs-mu:#fda4af;--cs-bd:rgba(251,113,133,.3);--cs-otro:rgba(255,255,255,.12);--cs-chip:rgba(255,255,255,.12);--cs-ac1:#f43f5e;--cs-ac2:#fb7185;--cs-in:rgba(255,255,255,.1);--cs-glow:rgba(244,63,94,.35)}
  .cs-top{display:flex;align-items:center;gap:9px;padding:8px 10px;border-bottom:1px solid var(--cs-bd);background:linear-gradient(120deg,var(--cs-chip),transparent)}
  .cs-stack{display:flex;flex:none}.cs-stack .cs-av{margin-left:-8px;border:2px solid var(--cs-in);width:30px;height:30px;font-size:.62rem;box-shadow:0 2px 6px rgba(0,0,0,.2);overflow:visible}.cs-stack .cs-av img{border-radius:50%}.cs-stack .cs-av:first-child{margin-left:0}
  .cs-stack .cs-av.off{filter:grayscale(1);opacity:.55}.cs-stack .cs-av::after{content:'';position:absolute;right:-2px;bottom:-2px;width:9px;height:9px;border-radius:50%;background:#22c55e;border:2px solid var(--cs-in)}.cs-stack .cs-av.off::after{background:#94a3b8}
  .cs-info{min-width:0;flex:1}.cs-info b{display:block;font-size:.84rem;font-weight:800}.cs-info small{display:block;font-size:.68rem;font-weight:700;color:var(--cs-mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cs-snd{border:0;background:var(--cs-chip);color:inherit;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.95rem;transition:transform .18s cubic-bezier(.34,1.56,.64,1)}.cs-snd:hover{transform:scale(1.12)}.cs-snd.off{opacity:.5}
  .cs-focorow{display:none;padding:5px 12px;border-bottom:1px solid var(--cs-bd);font-size:.68rem;font-weight:700;line-height:1.25;background:rgba(251,191,36,.16)}.cs-wrap.en-foco .cs-focorow{display:block;animation:csIn .25s both}
  .cs-focolbl{display:flex;align-items:center;gap:6px;font-size:.72rem;font-weight:800;cursor:pointer;flex:none}
  .cs-sw{position:relative;display:inline-block;width:38px;height:22px;flex:none;cursor:pointer}.cs-sw input{opacity:0;position:absolute;inset:0;margin:0;cursor:pointer;z-index:2}
  .cs-sw i{position:absolute;inset:0;border-radius:99px;background:rgba(148,163,184,.5);transition:background .25s}.cs-sw i::after{content:'';position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
  .cs-sw input:checked+i{background:linear-gradient(90deg,var(--cs-ac1),var(--cs-ac2))}.cs-sw input:checked+i::after{transform:translateX(16px)}.cs-sw input:focus-visible+i{box-shadow:0 0 0 3px var(--cs-glow)}
  .cs-aviso{margin:0;padding:6px 12px;font-size:.68rem;font-weight:700;color:var(--cs-mu);border-bottom:1px solid var(--cs-bd)}.cs-aviso:empty{display:none}.cs-aviso b{color:var(--cs-tx)}
  .cs-msgs{flex:1;min-height:0;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:3px;scroll-behavior:smooth}
  .cs-vacio{margin:auto;text-align:center;font-size:.82rem;font-weight:700;color:var(--cs-mu);padding:18px;line-height:1.5}.cs-vacio i{display:block;font-style:normal;font-size:2.2rem;margin-bottom:4px;animation:csFlota 3s ease-in-out infinite}
  .cs-m{display:flex;gap:8px;align-items:flex-end;max-width:88%;margin-top:7px;animation:csIn .32s cubic-bezier(.22,1.3,.36,1) both}.cs-m.junto{margin-top:0}.cs-m.mio{align-self:flex-end;flex-direction:row-reverse}
  .cs-av{position:relative;flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:.64rem;font-weight:900;color:#fff;text-transform:uppercase;overflow:hidden;background:#64748b}.cs-av img{width:100%;height:100%;object-fit:cover}
  .cs-m.junto .cs-av{visibility:hidden}
  .cs-b{padding:7px 12px;border-radius:16px 16px 16px 5px;background:var(--cs-otro);font-size:.85rem;font-weight:600;line-height:1.38;word-break:break-word;position:relative}
  .cs-m.junto .cs-b{border-top-left-radius:6px}.cs-m.mio .cs-b{border-radius:16px 16px 5px 16px;background:linear-gradient(135deg,var(--cs-ac1),var(--cs-ac2));color:#fff;box-shadow:0 4px 14px -6px var(--cs-glow)}.cs-m.mio.junto .cs-b{border-top-right-radius:6px}
  .cs-b>b{display:block;font-size:.68rem;font-weight:800;margin-bottom:1px;color:var(--cs-ac1)}.cs-b em{display:block;font-style:normal;font-size:.6rem;opacity:.6;text-align:right;margin-top:2px}
  .cs-b a{color:inherit;text-decoration:underline;font-weight:800}.cs-ment{background:rgba(251,191,36,.28)!important;box-shadow:0 0 0 2px rgba(251,191,36,.7);animation:csPulso 1.2s ease 2}
  .cs-b .cs-tag{font-weight:800;color:var(--cs-ac1)}.cs-m.mio .cs-b .cs-tag{color:#fef08a}
  .cs-r{align-self:center;margin:6px 0;display:flex;align-items:center;gap:8px;padding:3px 12px 3px 8px;border-radius:999px;background:var(--cs-chip);font-size:.7rem;font-weight:800;animation:csPop .5s cubic-bezier(.34,1.56,.64,1) both}.cs-r span{font-size:1.45rem;line-height:1}
  .cs-s{align-self:center;font-size:.68rem;font-weight:700;color:var(--cs-mu);padding:2px 10px;margin:5px 0;border-radius:999px;background:var(--cs-in);animation:csIn .3s both}
  .cs-dia{align-self:center;font-size:.66rem;font-weight:800;color:var(--cs-mu);margin:8px 0 2px;text-transform:uppercase;letter-spacing:.06em}
  .cs-typing{height:18px;padding:0 14px;font-size:.7rem;font-weight:700;color:var(--cs-mu);display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .2s}.cs-typing.on{opacity:1}
  .cs-typing i{display:inline-flex;gap:3px}.cs-typing i b{width:5px;height:5px;border-radius:50%;background:var(--cs-mu);animation:csPunto 1s ease-in-out infinite}.cs-typing i b:nth-child(2){animation-delay:.15s}.cs-typing i b:nth-child(3){animation-delay:.3s}
  .cs-nuevos{position:absolute;left:50%;bottom:118px;transform:translateX(-50%);border:0;border-radius:999px;padding:6px 14px;background:linear-gradient(90deg,var(--cs-ac1),var(--cs-ac2));color:#fff;font:800 .72rem 'Plus Jakarta Sans',sans-serif;cursor:pointer;box-shadow:0 8px 18px -6px var(--cs-glow);z-index:4;animation:csPop .3s both}.cs-nuevos[hidden]{display:none}
  .cs-rx{display:flex;flex-wrap:wrap;gap:3px;padding:4px 8px 0;justify-content:center}
  .cs-rx button{border:1px solid var(--cs-bd);background:var(--cs-in);border-radius:999px;font-size:.98rem;padding:1px 6px;cursor:pointer;color:inherit;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s,box-shadow .15s}
  .cs-rx button:hover{background:var(--cs-chip);transform:translateY(-3px) scale(1.15);box-shadow:0 6px 14px -6px var(--cs-glow)}.cs-rx button:active{transform:scale(.88)}
  .cs-emo{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;padding:6px 10px;border-top:1px solid var(--cs-bd);max-height:132px;overflow:auto;animation:csIn .2s both}.cs-emo[hidden]{display:none}
  .cs-emo button{border:0;background:transparent;font-size:1.3rem;padding:3px 0;border-radius:8px;cursor:pointer}.cs-emo button:hover{background:var(--cs-chip)}
  .cs-in{display:flex;gap:6px;padding:8px 10px 10px;align-items:center}
  .cs-in input{flex:1;min-width:0;padding:10px 14px;border-radius:999px;border:1px solid var(--cs-bd);background:var(--cs-in);color:inherit;font:600 .86rem 'Plus Jakarta Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
  .cs-in input:focus{border-color:var(--cs-ac1);box-shadow:0 0 0 3px var(--cs-glow)}.cs-in input::placeholder{color:var(--cs-mu)}
  .cs-in button{width:38px;height:38px;border:0;border-radius:50%;flex:none;cursor:pointer;font-size:1rem;transition:transform .18s cubic-bezier(.34,1.56,.64,1)}
  .cs-in .cs-emo-b{background:transparent;color:inherit;font-size:1.25rem}.cs-in .cs-emo-b:hover{background:var(--cs-chip)}
  .cs-in .cs-go{background:linear-gradient(135deg,var(--cs-ac1),var(--cs-ac2));color:#fff;box-shadow:0 6px 14px -6px var(--cs-glow)}.cs-in .cs-go:hover{transform:scale(1.1) rotate(-8deg)}.cs-in .cs-go:active{transform:scale(.9)}
  .cs-compacto .cs-msgs{max-height:190px;min-height:120px}
  .cs-vuelo{position:absolute;bottom:70px;font-size:2rem;pointer-events:none;animation:csVuelo 1.6s ease-out forwards;z-index:5;text-align:center;line-height:1}.cs-vuelo small{display:block;font:800 .62rem 'Plus Jakarta Sans',sans-serif;margin-top:2px;padding:1px 7px;border-radius:99px;background:rgba(0,0,0,.55);color:#fff}
  .cs-conf{position:absolute;top:-8px;width:7px;height:11px;border-radius:2px;pointer-events:none;z-index:5;animation:csConf 1.8s ease-in forwards}
  @keyframes csIn{from{opacity:0;transform:translateY(12px) scale(.94)}to{opacity:1;transform:none}}
  @keyframes csPop{from{opacity:0;transform:scale(.3) translateY(10px)}to{opacity:1;transform:none}}
  @keyframes csVuelo{0%{opacity:0;transform:translate(0,10px) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx),-200px) scale(1.3)}}
  @keyframes csConf{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),330px) rotate(540deg)}}
  @keyframes csPunto{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}
  @keyframes csPulso{50%{box-shadow:0 0 0 6px rgba(251,191,36,.25)}}@keyframes csFlota{50%{transform:translateY(-6px)}}
  @media (prefers-reduced-motion:reduce){.cs-m,.cs-r,.cs-s,.cs-vacio i,.cs-ment,.cs-typing i b,.cs-nuevos{animation:none!important}.cs-vuelo,.cs-conf{display:none}.cs-msgs{scroll-behavior:auto}}`;
  function estilos() { if (document.getElementById('cs-css')) return; const st = document.createElement('style'); st.id = 'cs-css'; st.textContent = CSS; document.head.appendChild(st); }

  const linkificar = (txt) => esc(txt).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/(^|\s)(@[\w.]+)/g, '$1<span class="cs-tag">$2</span>');
  const diaDe = (t) => { const f = new Date(t), h = new Date(); return f.toDateString() === h.toDateString() ? 'Hoy' : f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }); };
  function filasHtml() {
    let h = '', prev = null, dia = null;
    msgs.forEach((m) => {
      const d = diaDe(m.t); if (d !== dia && !m.sis) { dia = d; h += '<div class="cs-dia">' + esc(d) + '</div>'; prev = null; }
      if (m.sis) { h += '<div class="cs-s">' + esc(m.x) + '</div>'; prev = null; return; }
      const mio = m.u === yoNombre;
      if (m.r) { h += '<div class="cs-r"><span>' + esc(m.x) + '</span>' + (mio ? 'Vos' : esc(nombreCorto(m.u))) + ' ' + esc((REACCIONES.find((r) => r[0] === m.x) || [0, 'reaccionó'])[1]) + '</div>'; prev = null; return; }
      const junto = prev && prev.u === m.u && m.t - prev.t < 120000; prev = m;
      const ment = !mio && mencionaA(m.x);
      h += '<div class="cs-m' + (mio ? ' mio' : '') + (junto ? ' junto' : '') + '"><span class="cs-av" style="background:' + colorDe(m.u) + '">' + avatarHtml(m.u) + '</span><div class="cs-b' + (ment ? ' cs-ment' : '') + '">'
        + (mio || junto ? '' : '<b>' + esc(m.n || nombreDe(m.u)) + '</b>') + linkificar(m.x) + '<em>' + hora(m.t) + '</em></div></div>';
    });
    return h || '<div class="cs-vacio"><i>💬</i>Chat de la sala<br>Hablen libremente: los mensajes duran lo que dura la sala.</div>';
  }
  function cabeceraHtml() {
    const int = integrantes(), ok = new Set([...presentes, yoNombre]);
    const stack = int.slice(0, 5).map((p) => '<span class="cs-av' + (ok.has(p.u) ? '' : ' off') + '" style="background:' + colorDe(p.u) + '" title="' + esc(nombreDe(p.u)) + (ok.has(p.u) ? ' · en el chat' : ' · todavía sin chat') + '">' + avatarHtml(p.u) + '</span>').join('');
    const faltan = int.filter((p) => !ok.has(p.u));
    const estado = !canal ? 'Conectando…' : int.length <= 1 ? 'Sos la única persona en la sala' : (int.length + ' en la sala · ' + (int.length - faltan.length) + ' con el chat abierto');
    return { stack, estado, faltan };
  }
  function pintarVista(v) {
    if (!v.host.isConnected) return;
    const w = v.host.querySelector('.cs-wrap'); if (!w) return;
    const box = w.querySelector('.cs-msgs'), abajo = box.scrollHeight - box.scrollTop - box.clientHeight < 70;
    const nuevo = filasHtml();
    if (v._h !== nuevo) {
      v._h = nuevo; const antes = box.children.length; box.innerHTML = nuevo;
      if (abajo || !v._ini) { box.scrollTop = box.scrollHeight; v._ini = true; w.querySelector('.cs-nuevos').hidden = true; }
      else if (box.children.length > antes) w.querySelector('.cs-nuevos').hidden = false;
    }
    w.classList.toggle('en-foco', foco());
    const c = cabeceraHtml();
    w.querySelector('.cs-stack').innerHTML = c.stack; w.querySelector('.cs-estado').textContent = c.estado;
    w.querySelector('.cs-aviso').innerHTML = c.faltan.length && canal ? '⚠️ <b>' + c.faltan.map((p) => esc(nombreCorto(p.u))).join(', ') + '</b> ' + (c.faltan.length === 1 ? 'está' : 'están') + ' en la sala pero todavía no ' + (c.faltan.length === 1 ? 'tiene' : 'tienen') + ' el chat abierto. Si no les llega, que recarguen la página (Ctrl+Shift+R).' : '';
    const q = Object.keys(escribiendo).filter((u) => Date.now() - escribiendo[u] < 3200);
    const ty = w.querySelector('.cs-typing'); ty.classList.toggle('on', q.length > 0);
    ty.querySelector('span').textContent = q.length ? (q.length === 1 ? nombreCorto(q[0]) + ' está escribiendo' : q.length + ' personas están escribiendo') : '';
    const sw = w.querySelector('.cs-foco-sw'); if (sw) sw.checked = modoFocoOn();
    const sn = w.querySelector('.cs-snd'); if (sn) { sn.classList.toggle('off', !sonidoOn()); sn.textContent = sonidoOn() ? '🔊' : '🔇'; }
  }
  function pintarTodo() {
    [...vistas].forEach((v) => { if (!v.host.isConnected) vistas.delete(v); else pintarVista(v); });
    if (noLeidos && visibleAhora()) leer();
  }

  function montar(host, opt) {
    opt = opt || {}; estilos(); precargar();
    host.innerHTML = '<div class="cs-wrap' + (opt.compacto ? ' cs-compacto' : '') + (opt.tema === 'sala' ? ' cs-sala' : '') + '">'
      + '<div class="cs-top"><div class="cs-stack"></div><div class="cs-info"><b>Chat de la sala</b><small class="cs-estado">Conectando…</small></div><label class="cs-focolbl" title="Modo foco: mientras estudian no suena ni interrumpe"><span>🎯 Foco</span><span class="cs-sw"><input type="checkbox" class="cs-foco-sw" role="switch" aria-label="Modo foco"><i></i></span></label><button type="button" class="cs-snd" title="Sonidos del chat" aria-label="Activar o silenciar los sonidos del chat">🔊</button></div>'
      + '<div class="cs-focorow">🔕 Modo foco activo: mientras estudian no suena ni interrumpe. Los mensajes te esperan acá.</div>'
      + '<p class="cs-aviso"></p>'
      + '<div class="cs-msgs" role="log" aria-live="polite" aria-label="Mensajes de la sala"></div>'
      + '<button type="button" class="cs-nuevos" hidden>↓ Mensajes nuevos</button>'
      + '<div class="cs-typing"><i><b></b><b></b><b></b></i><span></span></div>'
      + '<div class="cs-rx" aria-label="Reacciones rápidas">' + REACCIONES.map((r) => '<button type="button" data-e="' + r[0] + '" aria-label="' + r[0] + '" title="' + r[0] + '">' + r[0] + '</button>').join('') + '</div>'
      + '<div class="cs-emo" hidden>' + EMOJIS.map((e) => '<button type="button" data-em="' + e + '">' + e + '</button>').join('') + '</div>'
      + '<form class="cs-in" autocomplete="off"><button type="button" class="cs-emo-b" aria-label="Emojis" title="Emojis">😊</button><input type="text" maxlength="' + MAX_TXT + '" placeholder="Escribile a la sala…" aria-label="Mensaje para la sala"><button type="submit" class="cs-go" aria-label="Enviar">➤</button></form></div>';
    const v = { host, opt }; vistas.add(v);
    const form = host.querySelector('.cs-in'), input = form.querySelector('input'), emo = host.querySelector('.cs-emo'), msgsBox = host.querySelector('.cs-msgs');
    pintarVista(v);
    host.querySelector('.cs-rx').addEventListener('click', (e) => { const b = e.target.closest('button[data-e]'); if (b) reaccionar(b.dataset.e); });
    host.querySelector('.cs-emo-b').addEventListener('click', () => { emo.hidden = !emo.hidden; });
    emo.addEventListener('click', (e) => { const b = e.target.closest('button[data-em]'); if (b) { input.value += b.dataset.em; input.focus(); } });
    host.querySelector('.cs-foco-sw').addEventListener('change', (e) => { ls.set('nika_modo_foco', e.target.checked ? '1' : '0'); sonidoSuave('switch'); pintarTodo(); try { window.dispatchEvent(new CustomEvent('nika:modo-foco', { detail: { activo: e.target.checked } })); } catch (_) {} });
    host.querySelector('.cs-snd').addEventListener('click', () => { ls.set('nika_sala_sonido', sonidoOn() ? '0' : '1'); sonidoSuave('switch'); pintarTodo(); });
    host.querySelector('.cs-nuevos').addEventListener('click', () => { msgsBox.scrollTop = msgsBox.scrollHeight; host.querySelector('.cs-nuevos').hidden = true; });
    msgsBox.addEventListener('scroll', () => { if (msgsBox.scrollHeight - msgsBox.scrollTop - msgsBox.clientHeight < 70) host.querySelector('.cs-nuevos').hidden = true; });
    input.addEventListener('input', avisarEscribiendo);
    form.addEventListener('submit', async (e) => { e.preventDefault(); const t = input.value; if (!t.trim()) return; input.value = ''; emo.hidden = true; const ok = await enviar(t); if (!ok) input.value = t; });
    if (!opt.visible || opt.visible()) leer();
    return { destruir() { vistas.delete(v); host.innerHTML = ''; }, foco() { input.focus(); } };
  }

  async function iniciar() {
    if (!E() || !sb()) { setTimeout(iniciar, 1500); return; }
    try { await window.NikaSupabase.ready; } catch (_) {}
    await conocerme();
    sincronizar();
    try { E().on('change', sincronizar); E().on('shared', sincronizar); } catch (_) {}
    setInterval(() => { sincronizar(); pintarTodo(); }, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  window.NikaChatSala = { montar, estado, enviar, reaccionar, leer, modoFoco: modoFocoOn, alCambiar: (f) => { oyentes.add(f); return () => oyentes.delete(f); } };
})();
