// js/nikaMusic.js
// CAMPUS NIKA — NikaMusic: reproductor flotante para estudiar (campus y sala de estudio)
//
//  • "Sin login" (para todos): playlists lofi con el reproductor oficial de YouTube (compacto y visible) y sonidos
//    ambientales reales de licencia libre (olas, lluvia, tormenta, cafetería, bosque, arroyo) + ruido blanco.
//  • "Mi Spotify" (solo NikaMed+): conexión opcional de la cuenta (OAuth PKCE + Web Playback SDK, requiere Premium).
//  • Al iniciar un Pomodoro aparece un cartel para acompañarlo con música relajante.
//  • Ventana flotante: se arrastra desde la cabecera, se minimiza a una píldora con ecualizador y
//    se puede cerrar SIN cortar el audio.
//  • Las alertas del campus (evento 'nika:alerta-sonido') bajan la música un instante y nunca se pisan.
//
// Para habilitar "Mi Spotify" hace falta el Client ID de una app de Spotify (es público):
//   definir window.NIKA_SPOTIFY_CLIENT_ID, o <meta name="spotify-client-id" content="...">, o pegarlo en CLIENT_ID_FIJO.
//   Redirect URI a registrar en el dashboard de Spotify:  https://<tu-dominio>/spotify-callback.html

const NikaMusic = (() => {
  const CLIENT_ID_FIJO = '4b803856338f4b2a94e5e095b44016f5';   // ⬅️ opcional: pegá acá el Client ID
  const SPOTIFY_CLIENT_ID = window.NIKA_SPOTIFY_CLIENT_ID
    || ((document.querySelector('meta[name="spotify-client-id"]') || {}).content || '')
    || CLIENT_ID_FIJO;

  const SCOPES = [
    'streaming', 'user-read-email', 'user-read-private',
    'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing',
    'playlist-read-private',
  ].join(' ');
  const K_TOKEN = 'nika_spotify_tokens', K_CFG = 'nika_spotify_cfg', K_ACTIVA = 'nika_music_activa';
  const K_VOL = 'nika_music_vol', K_UI = 'nika_music_ui', K_AMB = 'nika_music_amb_vol';
  const K_SESS = 'nika_music_sess', K_SHARE = 'nika_music_share';   // sesión entre páginas y "mostrar lo que escucho"

  // Playlists oficiales de Spotify para el Embed (sin login)
  const EMBEDS = [
    { id: '37i9dQZF1DWWQRwui0ExPn', icono: '🎧', label: 'Lofi Beats' },
    { id: '37i9dQZF1DWZeKCadgRdKQ', icono: '🧠', label: 'Deep Focus' },
    { id: '37i9dQZF1DWXLeA8Omikj7', icono: '🍎', label: 'Brain Food' },
    { id: '37i9dQZF1DWWEJlAGA9gs0', icono: '🎻', label: 'Clásica para estudiar' },
    { id: '37i9dQZF1DX4sWSpwq3LiO', icono: '🎹', label: 'Peaceful Piano' },
  ];
  // Sonidos ambientales: grabaciones reales de licencia libre (ver assets/audio/CREDITOS.txt)
  const AMBIENTES = [
    { id: 'olas', icono: '🌊', label: 'Olas del mar', archivo: 'assets/audio/olas-del-mar.mp3' },
    { id: 'lluvia', icono: '🌧️', label: 'Lluvia suave', archivo: 'assets/audio/lluvia.mp3' },
    { id: 'tormenta', icono: '⛈️', label: 'Tormenta', archivo: 'assets/audio/tormenta.mp3' },
    { id: 'cafe', icono: '☕', label: 'Cafetería', archivo: 'assets/audio/cafeteria.mp3' },
    { id: 'bosque', icono: '🌲', label: 'Bosque', archivo: 'assets/audio/bosque.mp3' },
    { id: 'arroyo', icono: '💧', label: 'Arroyo', archivo: 'assets/audio/arroyo.mp3' },
    { id: 'blanco', icono: '🌫️', label: 'Ruido blanco' },
  ];
  // Playlists lofi de YouTube (reproductor oficial; el video queda visible en tamaño compacto)
  const YT_LISTA = [
    { id: '_jH2oTNRe7g', icono: '🍂', label: 'Cozy autumn' },
    { id: 'CBSlu_VMS9U', icono: '🎷', label: 'Jazz lofi mix' },
    { id: '4WIMyqBG9gs', icono: '⚔️', label: 'Medieval lofi' },
    { id: 'tn80RiPe0s8', icono: '🏮', label: 'Retro Japanese town' },
    { id: 'vYIYIVmOo3Q', icono: '🌧️', label: 'Rain lofi' },
  ];
  const K_ASK = 'nika_music_pomo_ask';   // 'nunca' = no volver a preguntar al iniciar un Pomodoro
  const esPlus = () => {
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (u && String(u.role || '').toLowerCase() === 'admin') return true; } catch (_) {}
    return !!(window.NikaAcceso && typeof NikaAcceso.tieneAccesoCompleto === 'function' && NikaAcceso.tieneAccesoCompleto());
  };
  const PLAYLISTS_CUENTA = [
    { icono: '🎧', label: 'Lofi Hip Hop', q: 'Lofi Hip Hop' },
    { icono: '🧠', label: 'Deep Focus', q: 'Deep Focus' },
    { icono: '🎸', label: 'Rock Nacional', q: 'Rock Nacional' },
    { icono: '🎹', label: 'Piano para estudiar', q: 'Peaceful Piano' },
  ];

  const SPOTIFY_SVG = (n) => `<svg class="nm-logo" viewBox="0 0 24 24" width="${n}" height="${n}" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1DB954"/><path fill="#04130a" d="M17.3 16.7a.75.75 0 0 1-1.03.25c-2.8-1.7-6.3-2.1-10.5-1.15a.75.75 0 1 1-.33-1.46c4.55-1.04 8.45-.6 11.6 1.33.35.22.46.68.26 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.2-1.97-8.08-2.55-11.86-1.4a.94.94 0 1 1-.55-1.8c4.32-1.31 9.68-.67 13.4 1.6.44.27.58.85.3 1.29zm.13-3.4C15.02 7.7 8.7 7.5 5.03 8.62a1.13 1.13 0 1 1-.66-2.16c4.2-1.28 11.18-1.03 15.6 1.6a1.13 1.13 0 0 1-1.07 1.97z"/></svg>`;

  // ---- estado ----
  let panel = null, pill = null;
  let vista = 'ambiente';                 // 'ambiente' | 'spotify'
  let abierto = false, minimizado = false;
  let fuente = null;                      // { tipo: 'sdk'|'embed'|'ruido', nombre }
  let sonando = false;
  let saliendo = false, arrastroPill = false;   // la página se está cerrando / se acaba de arrastrar la píldora
  // Spotify SDK
  let player = null, deviceId = null, estado = null, tick = null, sdkCargado = false, baseTs = 0, duckTimer = null;
  // Embed
  let embedCtrl = null, embedApi = null, embedUri = null;
  // Ambiente
  let actx = null, master = null, ambNodos = [], ambTimers = [], ambId = null, ambGain = null;
  let ambAudio = null;                    // sonido ambiente real (<audio> en bucle: suena en segundo plano en el celular)
  let ytCtrl = null, ytIdx = -1, ytApiCbs = [];   // reproductor de YouTube

  const $ = (s, r = panel) => (r ? r.querySelector(s) : null);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const ui = () => { try { return JSON.parse(localStorage.getItem(K_UI) || '{}'); } catch (_) { return {}; } };
  const guardarUi = (o) => { try { localStorage.setItem(K_UI, JSON.stringify({ ...ui(), ...o })); } catch (_) {} };

  // ============================================================ OAuth PKCE (Mi Spotify)
  function base64url(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function aleatorio(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return base64url(a).slice(0, n); }
  const redirectUri = () => `${location.origin}/spotify-callback.html`;

  async function conectar() {
    if (!SPOTIFY_CLIENT_ID) {
      const m = $('#nm-connmsg');
      if (m) {
        m.style.display = 'block';
        m.innerHTML = 'La conexión con tu cuenta se está habilitando. Mientras tanto podés escuchar <b>sin login</b> ahora mismo.<br><button type="button" class="nm-link" id="nm-goamb">Ir a “Sin login” →</button>';
        $('#nm-goamb').onclick = () => cambiarVista('ambiente');
      }
      return;
    }
    const verifier = aleatorio(96);
    const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    const state = aleatorio(16);
    localStorage.setItem(K_CFG, JSON.stringify({ clientId: SPOTIFY_CLIENT_ID, redirect: redirectUri(), verifier, state, volver: location.href }));
    location.href = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID, response_type: 'code', redirect_uri: redirectUri(),
      code_challenge_method: 'S256', code_challenge: challenge, scope: SCOPES, state,
    }).toString();
  }

  const leerTokens = () => { try { return JSON.parse(localStorage.getItem(K_TOKEN) || 'null'); } catch (_) { return null; } };

  function desconectar() {
    localStorage.removeItem(K_TOKEN); localStorage.removeItem(K_ACTIVA);
    try { if (player) player.disconnect(); } catch (_) {}
    player = null; deviceId = null; estado = null; clearInterval(tick); sdkCargado = false;
    if (fuente && fuente.tipo === 'sdk') { fuente = null; sonando = false; }
    render();
  }

  async function tokenValido() {
    let t = leerTokens();
    if (!t) return null;
    if (Date.now() < t.exp - 60000) return t.access;
    if (!t.refresh) { desconectar(); return null; }
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refresh, client_id: SPOTIFY_CLIENT_ID }),
    });
    if (!r.ok) { desconectar(); return null; }
    const d = await r.json();
    t = { access: d.access_token, refresh: d.refresh_token || t.refresh, exp: Date.now() + d.expires_in * 1000 };
    localStorage.setItem(K_TOKEN, JSON.stringify(t));
    return t.access;
  }

  async function api(path, opts = {}, reintento = true) {
    const tk = await tokenValido();
    if (!tk) throw new Error('Sesión de Spotify vencida.');
    const r = await fetch('https://api.spotify.com/v1' + path, { ...opts, headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    if (r.status === 401 && reintento) { const t = leerTokens(); if (t) { t.exp = 0; localStorage.setItem(K_TOKEN, JSON.stringify(t)); } return api(path, opts, false); }
    if (r.status === 204 || r.status === 202) return null;
    const txt = await r.text(); let json = null; try { json = txt ? JSON.parse(txt) : null; } catch (_) {}
    if (!r.ok) {
      const msg = (json && json.error && (json.error.message || json.error)) || ('Spotify respondió ' + r.status);
      if (r.status === 403) {
        // 403 de Spotify: casi siempre es que la app está en "modo de prueba" y la cuenta no está autorizada en su panel de desarrolladores,
        // o que la cuenta no es Premium, o que faltan permisos del login. Se explica cada caso en vez de mostrar el código.
        const razon = String((json && json.error && json.error.reason) || '').toUpperCase(), t = String(msg);
        let m;
        if (razon === 'PREMIUM_REQUIRED' || /premium/i.test(t)) m = 'Para reproducir con tu cuenta Spotify necesita Premium. Mientras tanto podés escuchar “Lofi y ambiente”, que funciona para todos.';
        else if (/scope/i.test(t)) m = 'Faltan permisos de Spotify: tocá “Desconectar Spotify” y volvé a conectar tu cuenta aceptando todos los permisos.';
        else m = 'Spotify todavía no habilitó esta cuenta para Campus Nika. Pedí acceso con el formulario de abajo: el administrador te va a habilitar. Mientras tanto podés escuchar “Lofi y ambiente”.';
        const e = new Error(m); e.spotify403 = true; throw e;
      }
      throw new Error(msg);
    }
    return json;
  }

  // ============================================================ Web Playback SDK
  function cargarSdk() {
    if (sdkCargado) return; sdkCargado = true;
    window.onSpotifyWebPlaybackSDKReady = iniciarPlayer;
    const s = document.createElement('script');
    s.src = 'https://sdk.scdn.co/spotify-player.js'; s.async = true;
    s.onerror = () => setMensaje('No se pudo cargar el reproductor de Spotify (¿bloqueador de anuncios?).');
    document.head.appendChild(s);
  }

  function iniciarPlayer() {
    player = new window.Spotify.Player({
      name: 'Campus Nika',
      getOAuthToken: async (cb) => { const t = await tokenValido(); if (t) cb(t); },
      volume: parseFloat(localStorage.getItem(K_VOL) || '0.5'),
    });
    player.addListener('ready', async ({ device_id }) => {
      deviceId = device_id; setMensaje('');
      if (localStorage.getItem(K_ACTIVA) === '1') { try { await api('/me/player', { method: 'PUT', body: JSON.stringify({ device_ids: [deviceId], play: true }) }); } catch (_) {} }
      if (vista === 'spotify') render();
    });
    player.addListener('not_ready', () => { deviceId = null; });
    player.addListener('player_state_changed', (st) => {
      estado = st;
      const suena = !!(st && !st.paused);
      if (!saliendo) localStorage.setItem(K_ACTIVA, suena ? '1' : '0');   // al cambiar de página el SDK avisa "pausado": eso NO es el alumno
      if (suena) {
        detenerOtros('sdk');
        const tr = st.track_window.current_track;
        fuente = { tipo: 'sdk', nombre: tr.name + ' · ' + tr.artists.map((a) => a.name).join(', ') };
        sonando = true;
      } else if (fuente && fuente.tipo === 'sdk') sonando = false;
      baseTs = Date.now(); pintarEstado();
    });
    player.addListener('initialization_error', () => setMensaje('Tu navegador no admite el reproductor de Spotify.'));
    player.addListener('authentication_error', () => { setMensaje('Falló la autenticación. Volvé a conectar Spotify.'); desconectar(); });
    player.addListener('account_error', () => setMensaje('Se necesita Spotify Premium para reproducir con tu cuenta. Igual podés escuchar sin login.'));
    player.addListener('autoplay_failed', () => setMensaje('El navegador bloqueó el audio: tocá ▶ para reproducir.'));
    player.connect();
    clearInterval(tick); tick = setInterval(avanzarProgreso, 500);
  }

  async function reproducirSdk(cuerpo) {
    try {
      if (!deviceId) throw new Error('El reproductor todavía se está conectando. Probá en unos segundos.');
      if (player.activateElement) { try { await player.activateElement(); } catch (_) {} }
      await api('/me/player', { method: 'PUT', body: JSON.stringify({ device_ids: [deviceId], play: false }) });
      await api('/me/player/play?device_id=' + encodeURIComponent(deviceId), { method: 'PUT', body: JSON.stringify(cuerpo) });
      setMensaje('');
    } catch (err) { if (err && err.spotify403) { alRechazoSpotify(err.message); return; } setMensaje(err.message || 'No se pudo reproducir.'); }
  }

  // Spotify rechazó la cuenta: se vuelve a “Lofi y ambiente” (sin login) con el motivo, así no queda sin música
  function alRechazoSpotify(msg) {
    desconectar();                                   // se descartan los tokens y se vuelve a la pantalla de conexión
    const m = $('#nm-connmsg'); if (m) { m.style.display = 'block'; m.textContent = msg; }
  }

  // ---- Solicitud de acceso a Mi Spotify (la app de Spotify solo admite cuentas autorizadas por el administrador) ----
  let solicitud = undefined;                         // undefined = sin consultar · null = no hay · objeto = última solicitud
  const sbCli = async () => { const ns = window.NikaSupabase; if (ns && ns.ready) { try { await ns.ready; } catch (_) {} } return ns && ns.client; };
  async function cargarSolicitud() {
    try {
      const c = await sbCli(); const { data: s } = await c.auth.getSession();
      if (!s || !s.session) { solicitud = null; }
      else {
        const { data, error } = await c.from('spotify_solicitudes').select('*').order('creado_en', { ascending: false }).limit(1);
        solicitud = error ? null : ((data && data[0]) || null);
      }
    } catch (_) { solicitud = null; }
    pintarSolicitud();
  }
  async function enviarSolicitud(email) {
    const u = (() => { try { return JSON.parse(localStorage.getItem('nika_currentUser') || 'null') || {}; } catch (_) { return {}; } })();
    const c = await sbCli();
    const { data, error } = await c.from('spotify_solicitudes').insert({ username: u.username || null, fullname: u.fullname || u.nombre || null, email_spotify: email }).select().single();
    if (error) {
      if (/relation|does not exist|PGRST205/i.test(error.message + (error.code || ''))) throw new Error('El envío de solicitudes todavía no está habilitado. Avisale al administrador por otro medio.');
      throw new Error('No se pudo enviar la solicitud. Probá de nuevo en unos minutos.');
    }
    return data;
  }
  function pintarSolicitud() {
    const box = $('#nm-solic'); if (!box) return;
    const st = solicitud && solicitud.estado;
    const formulario = (titulo, pre) => `<b>${titulo}</b><small>Escribí el email de la cuenta de Spotify con la que querés entrar (con Premium). Lo recibe el administrador para habilitarte.</small>
      <input type="email" id="nm-sol-mail" placeholder="tu-email@spotify.com" value="${esc(pre || '')}" autocomplete="email" maxlength="120">
      <button type="button" class="nm-sol-b" id="nm-sol-env">📨 Solicitar acceso</button><div class="nm-sol-m" id="nm-sol-msg" role="status"></div>`;
    if (solicitud === undefined) { box.innerHTML = '<small>Revisando tu solicitud…</small>'; return; }
    if (st === 'pendiente') box.innerHTML = `<div class="nm-sol-ok">✅ <b>Tu solicitud fue enviada al administrador</b><small>Pedimos habilitar <b>${esc(solicitud.email_spotify)}</b>. Pronto vas a tener acceso a la herramienta; cuando esté lista, conectá tu Spotify con el botón de arriba.</small></div>`;
    else if (st === 'agregada') box.innerHTML = `<div class="nm-sol-ok">🎉 <b>¡Ya te habilitamos!</b><small>Conectá tu Spotify con el botón de arriba usando <b>${esc(solicitud.email_spotify)}</b>.</small></div>`;
    else box.innerHTML = formulario(st === 'rechazada' ? 'Tu solicitud anterior no pudo aprobarse. Probá con otro email' : '¿No te deja conectar? Pedí acceso', (solicitud && solicitud.email_spotify) || '');
    const b = $('#nm-sol-env');
    if (b) b.onclick = async () => {
      const mail = String(($('#nm-sol-mail') || {}).value || '').trim().toLowerCase(), msg = $('#nm-sol-msg');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { msg.textContent = 'Revisá el email: tiene que ser válido.'; msg.className = 'nm-sol-m err'; return; }
      b.disabled = true; msg.textContent = 'Enviando…'; msg.className = 'nm-sol-m';
      try { solicitud = await enviarSolicitud(mail); pintarSolicitud(); }
      catch (e) { msg.textContent = e.message; msg.className = 'nm-sol-m err'; b.disabled = false; }
    };
  }

  // ---- Aviso al administrador: solicitudes de Spotify pendientes (al entrar y en tiempo real) ----
  function avisoAdminSpotify() {
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (!u || String(u.role || '').toLowerCase() !== 'admin') return; } catch (_) { return; }
    const mostrar = (txt) => {
      let t = document.getElementById('nm-adm-toast');
      if (!t) { t = document.createElement('div'); t.id = 'nm-adm-toast'; t.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:100000;max-width:min(92vw,460px);padding:12px 16px;border-radius:16px;background:#0f172a;color:#f1f5f9;border:1px solid #1DB954;box-shadow:0 20px 40px -16px rgba(0,0,0,.6);font:700 .86rem/1.4 system-ui,sans-serif;display:flex;gap:12px;align-items:center'; document.body.appendChild(t); }
      t.innerHTML = '<span>🎵 ' + esc(txt) + '</span><a href="admin.html#tile-spotify" style="color:#1DB954;font-weight:800;white-space:nowrap">Ver →</a><button type="button" aria-label="Cerrar" style="background:none;border:0;color:#94a3b8;cursor:pointer;font-size:1rem">✕</button>';
      t.querySelector('button').onclick = () => t.remove();
      clearTimeout(t._t); t._t = setTimeout(() => t.remove(), 20000);
    };
    (async () => {
      try {
        const c = await sbCli(); if (!c) return;
        const { count } = await c.from('spotify_solicitudes').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente');
        if (count > 0 && !sessionStorage.getItem('nika_adm_spotify')) { sessionStorage.setItem('nika_adm_spotify', '1'); mostrar(count + (count === 1 ? ' solicitud de Spotify pendiente' : ' solicitudes de Spotify pendientes')); }
        c.channel('spotify-solicitudes-admin').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spotify_solicitudes' }, (p) => {
          const r = p.new || {}; mostrar('Nueva solicitud de Spotify: @' + (r.username || 'usuario') + ' · ' + (r.email_spotify || ''));
        }).subscribe();
      } catch (_) {}
    })();
  }

  async function playlistPorNombre(q, btnEl) {
    if (btnEl) btnEl.classList.add('cargando');
    try {
      const r = await api('/search?type=playlist&limit=5&q=' + encodeURIComponent(q));
      const pl = ((r && r.playlists && r.playlists.items) || []).find(Boolean);
      if (!pl) { setMensaje('No se encontró esa playlist.'); return; }
      await reproducirSdk({ context_uri: pl.uri });
    } catch (err) { if (err && err.spotify403) alRechazoSpotify(err.message); else setMensaje(err.message); } finally { if (btnEl) btnEl.classList.remove('cargando'); }
  }

  let tBusq = null;
  function buscarDebounce() { clearTimeout(tBusq); tBusq = setTimeout(buscar, 350); }
  let busqSeq = 0;
  async function buscar() {
    const inp = $('#nm-q'), cont = $('#nm-res'); if (!inp || !cont) return;
    const q = inp.value.trim();
    const tok = ++busqSeq;
    cont.classList.remove('nm-album-vista');
    const cuerpoEl = panel && panel.querySelector('.nm-body'); if (cuerpoEl) cuerpoEl.classList.toggle('nm-buscando', q.length >= 2);
    if (q.length < 2) { cont.innerHTML = ''; return; }
    cont.innerHTML = '<div class="nm-vacio">🔎 Buscando…</div>';
    // Si Spotify rechaza alguna combinación (límites o tipos), se reintenta con una más simple
    const intentos = [['track,album,artist', 8], ['track,album', 5], ['track', 5]];
    let r = null, ultimo = null;
    for (const [tipos, lim] of intentos) {
      try { r = await api('/search?type=' + tipos + '&limit=' + lim + '&q=' + encodeURIComponent(q)); ultimo = null; break; }
      catch (e) {
        if (e && e.spotify403) { alRechazoSpotify(e.message); return; }
        ultimo = e; if (!/limit|invalid|type|400|bad request/i.test(String((e && e.message) || ''))) break;
      }
    }
    if (tok !== busqSeq || !$('#nm-res')) return;
    if (!r) { cont.innerHTML = `<div class="nm-vacio">No se pudo buscar: ${esc((ultimo && ultimo.message) || 'sin respuesta de Spotify')}. Probá de nuevo en unos segundos.</div>`; return; }
    const img = (imgs) => ((imgs || []).slice(-1)[0] || {}).url || '';
    const fila = (uri, im, t1, t2, tipo, ctx) => `<button type="button" class="nm-item" data-uri="${esc(uri)}" data-tipo="${tipo}" data-ctx="${esc(ctx || '')}">${im ? `<img src="${esc(im)}" alt="">` : '<img alt="" style="visibility:hidden">'}<span><b>${esc(t1)}</b><small>${tipo === 'album' ? '💿 Álbum · ' : tipo === 'artist' ? '🎤 Artista' : ''}${esc(t2)}</small></span></button>`;
    const grupo = (titulo, lista) => (lista.length ? `<div class="nm-res-t">${titulo}</div>` + lista.join('') : '');
    const artistas = ((r.artists && r.artists.items) || []).filter(Boolean).slice(0, 3).map((a) => fila(a.uri, img(a.images), a.name, '', 'artist'));
    const canciones = ((r.tracks && r.tracks.items) || []).filter(Boolean).slice(0, 8).map((t) => fila(t.uri, img(t.album && t.album.images), t.name, (t.artists || []).map((a) => a.name).join(', '), 'track', t.album && t.album.uri));
    const albumes = ((r.albums && r.albums.items) || []).filter(Boolean).slice(0, 4).map((a) => fila(a.uri, img(a.images), a.name, (a.artists || []).map((x) => x.name).join(', '), 'album'));
    cont.innerHTML = (grupo('🎤 Artistas', artistas) + grupo('🎵 Canciones', canciones) + grupo('💿 Álbumes', albumes)) || '<div class="nm-vacio">Sin resultados para “' + esc(q) + '”.</div>';
    cont.querySelectorAll('.nm-item').forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.tipo;
      if (t === 'album') abrirAlbum(b.dataset.uri, q);
      else if (t === 'artist') reproducirSdk({ context_uri: b.dataset.uri });
      else if (b.dataset.ctx) reproducirSdk({ context_uri: b.dataset.ctx, offset: { uri: b.dataset.uri } });
      else reproducirSdk({ uris: [b.dataset.uri] });
    }));
  }

  // Quita la canción actual: se pausa y se reinicia el reproductor para que no quede nada cargado
  async function quitarCancion() {
    try { if (player) await player.pause(); } catch (_) {}
    try { await api('/me/player/pause', { method: 'PUT' }); } catch (_) {}
    try { if (player) player.disconnect(); } catch (_) {}
    player = null; deviceId = null; estado = null; clearInterval(tick); sdkCargado = false;
    if (fuente && fuente.tipo === 'sdk') fuente = null;
    sonando = false; try { localStorage.setItem(K_ACTIVA, '0'); } catch (_) {}
    render(); cargarSdk();
    setMensaje('Canción quitada. Elegí otra playlist o buscá.');
  }

  // Álbum: lista de canciones para elegir una (o reproducir todo desde el principio)
  async function abrirAlbum(uri, consulta) {
    const cont = $('#nm-res'); if (!cont) return;
    const id = String(uri).split(':').pop();
    cont.innerHTML = '<div class="nm-vacio">Cargando álbum...</div>';
    cont.classList.add('nm-album-vista');
    try {
      const al = await api('/albums/' + encodeURIComponent(id));
      const items = (al && al.tracks && al.tracks.items) || [];
      const dur = (ms) => fmt(ms);
      cont.innerHTML = `<div class="nm-album-cab">
          <button type="button" class="nm-atras" id="nm-alb-back" aria-label="Volver a los resultados">←</button>
          <img src="${esc((al.images && al.images.slice(-1)[0] && al.images.slice(-1)[0].url) || '')}" alt="">
          <span><b>${esc(al.name)}</b><small>${esc((al.artists || []).map((x) => x.name).join(', '))} · ${items.length} canciones</small></span>
          <button type="button" class="nm-albplay" id="nm-alb-play" title="Reproducir el álbum completo">▶</button>
        </div>
        ${items.map((t, i) => `<button type="button" class="nm-item nm-trk" data-uri="${esc(t.uri)}"><b class="nm-n">${i + 1}</b><span><b>${esc(t.name)}</b><small>${esc((t.artists || []).map((x) => x.name).join(', '))}</small></span><em>${dur(t.duration_ms)}</em></button>`).join('')}`;
      $('#nm-alb-back').onclick = () => { cont.classList.remove('nm-album-vista'); const q = $('#nm-q'); if (q) { q.value = consulta || q.value; buscar(); } };
      $('#nm-alb-play').onclick = () => reproducirSdk({ context_uri: uri });
      cont.querySelectorAll('.nm-trk').forEach((b) => b.addEventListener('click', () => reproducirSdk({ context_uri: uri, offset: { uri: b.dataset.uri } })));
    } catch (err) { cont.classList.remove('nm-album-vista'); cont.innerHTML = `<div class="nm-vacio">${esc(err.message)}</div>`; }
  }

  // ============================================================ Embed de Spotify (sin login)
  function cargarEmbedApi() {
    if (embedApi || window.__nmEmbedCargando) return;
    window.__nmEmbedCargando = true;
    window.onSpotifyIframeApiReady = (IFrameAPI) => { embedApi = IFrameAPI; if (embedUri && fuente && fuente.tipo === 'embed') montarEmbed(embedUri); };
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1'; s.async = true;
    s.onerror = () => { window.__nmEmbedCargando = false; if (embedUri) embedFallback(embedUri); };
    document.head.appendChild(s);
  }

  function embedFallback(uri) {
    const cont = $('#nm-embed'); if (!cont) return;
    cont.innerHTML = `<iframe title="Spotify" style="border-radius:12px" src="https://open.spotify.com/embed/${uri.replace('spotify:', '').replace(':', '/')}?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }

  // El embed vive en un contenedor propio que NO se destruye al cambiar de pestaña ni al cerrar la ventana
  function contenedorEmbed() {
    let host = document.getElementById('nm-embed-persist');
    if (!host) { host = document.createElement('div'); host.id = 'nm-embed-persist'; document.body.appendChild(host); }
    return host;
  }

  function montarEmbed(uri) {
    const host = contenedorEmbed();
    if (!embedApi) { embedPlano(host, uri); cargarEmbedApi(); return; }
    if (embedCtrl) { embedCtrl.loadUri(uri); try { embedCtrl.play(); } catch (_) {} return; }
    host.innerHTML = '<div id="nm-embed-host"></div>';
    embedApi.createController(host.firstChild, { uri, width: '100%', height: 152, theme: 'dark' }, (ctrl) => {
      embedCtrl = ctrl;
      ctrl.addListener('playback_update', (e) => {
        const pausado = !!e.data.isPaused;
        if (!pausado) { detenerOtros('embed'); sonando = true; }
        else if (fuente && fuente.tipo === 'embed') sonando = false;
        pintarEstado();
      });
      ctrl.addListener('ready', () => { try { ctrl.play(); } catch (_) {} });
    });
  }
  function embedPlano(host, uri) {
    host.innerHTML = `<iframe title="Spotify" style="border-radius:12px" src="https://open.spotify.com/embed/${uri.replace('spotify:', '').replace(':', '/')}?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
  }

  function reproducirEmbed(e) {
    detenerOtros('embed');
    embedUri = 'spotify:playlist:' + e.id;
    fuente = { tipo: 'embed', nombre: e.label };
    sonando = true;
    montarEmbed(embedUri);
    render();
  }

  // El iframe NO se mueve de lugar en el DOM (moverlo lo recargaría y cortaría el audio): se superpone
  // sobre el hueco #nm-embed de la ventana cuando ésta está visible, y fuera de pantalla en cualquier otro caso.
  function acoplarEmbed() {
    const host = document.getElementById('nm-embed-persist'); if (!host) return;
    const slot = $('#nm-embed');
    if (!slot || !abierto || minimizado || vista !== 'ambiente') { desacoplarEmbed(); return; }
    if (!fuente || fuente.tipo !== 'embed') { host.style.left = '-9999px'; host.style.opacity = '0'; host.style.pointerEvents = 'none'; acoplarYt(); return; }
    slot.style.display = 'block';
    const r = slot.getBoundingClientRect();
    host.style.left = r.left + 'px'; host.style.top = r.top + 'px'; host.style.width = r.width + 'px';
    host.style.opacity = '1'; host.style.pointerEvents = 'auto';
    acoplarYt();
  }
  function desacoplarEmbed() {
    const host = document.getElementById('nm-embed-persist');
    if (host) { host.style.left = '-9999px'; host.style.top = '0px'; host.style.opacity = '0'; host.style.pointerEvents = 'none'; }
    acoplarYt();
  }

  // ============================================================ Sonidos ambientales (WebAudio)
  function audioCtx() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = 1; master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function bufferRuido(tipo, seg = 4) {
    const c = audioCtx(), n = c.sampleRate * seg, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    if (tipo === 'blanco') { for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    else if (tipo === 'rosa') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      }
    } else { let ult = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; ult = (ult + 0.02 * w) / 1.02; d[i] = ult * 3.5; } } // marrón
    return b;
  }

  function fuenteRuido(tipo) {
    const c = audioCtx(), s = c.createBufferSource();
    s.buffer = bufferRuido(tipo); s.loop = true; s.start();
    ambNodos.push(s);
    return s;
  }

  function detenerAmbiente() {
    ambTimers.forEach((t) => { clearInterval(t); clearTimeout(t); });
    ambTimers = [];
    ambNodos.forEach((n) => { try { n.stop && n.stop(); } catch (_) {} try { n.disconnect(); } catch (_) {} });
    ambNodos = []; ambId = null; ambGain = null;
    if (ambAudio) { try { ambAudio.pause(); ambAudio.removeAttribute('src'); ambAudio.load(); } catch (_) {} ambAudio = null; }
  }

  function iniciarAmbiente(id, inicio) {
    detenerOtros('ruido');
    detenerAmbiente();
    const def = AMBIENTES.find((x) => x.id === id);
    if (def && def.archivo) {   // grabación real en bucle, por <audio> (sigue sonando con la pantalla bloqueada)
      const a = new Audio(def.archivo);
      a.loop = true; a.preload = 'auto'; a.volume = Math.min(1, parseFloat(localStorage.getItem(K_AMB) || '0.5') * 1.2);
      ambAudio = a; ambId = id;
      if (inicio > 0) a.addEventListener('loadedmetadata', () => { try { if (a.duration) a.currentTime = inicio % a.duration; } catch (_) {} }, { once: true });
      fuente = { tipo: 'ruido', nombre: def.label }; sonando = true;
      const p = a.play();
      if (p && p.catch) p.catch(() => { if (ambAudio === a) { sonando = false; pintarEstado(); } });
      a.addEventListener('play', () => { if (ambAudio === a) { sonando = true; pintarEstado(); } });
      a.addEventListener('pause', () => { if (ambAudio === a && !a.ended) { sonando = false; pintarEstado(); } });
      mediaSesion(def.label, def.icono);
      return;
    }
    const c = audioCtx();
    if (c.state === 'suspended') c.resume();
    const g = c.createGain(); g.gain.value = parseFloat(localStorage.getItem(K_AMB) || '0.5') * 0.6; g.connect(master);
    ambNodos.push(g); ambGain = g; ambId = id;

    if (id === 'blanco') { const s = fuenteRuido('blanco'); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 9000; s.connect(f); f.connect(g); ambNodos.push(f); }

    fuente = { tipo: 'ruido', nombre: AMBIENTES.find((x) => x.id === id).label };
    sonando = true;
  }

  function pausarAmbiente() { if (ambAudio) { try { ambAudio.pause(); } catch (_) {} } else if (actx && actx.state === 'running') actx.suspend(); sonando = false; pintarEstado(); }
  function reanudarAmbiente() { if (ambAudio) { const p = ambAudio.play(); if (p && p.catch) p.catch(() => {}); } else if (actx) actx.resume(); sonando = true; pintarEstado(); }

  // Controles del sistema (pantalla bloqueada / notificaciones) con el nombre de lo que suena
  function mediaSesion(titulo, icono) {
    try {
      if (!('mediaSession' in navigator)) return;
      navigator.mediaSession.metadata = new MediaMetadata({ title: titulo, artist: 'NikaMusic', album: 'Para estudiar' });
      navigator.mediaSession.setActionHandler('play', () => alternarReproduccion());
      navigator.mediaSession.setActionHandler('pause', () => alternarReproduccion());
      navigator.mediaSession.setActionHandler('previoustrack', () => saltar(-1));
      navigator.mediaSession.setActionHandler('nexttrack', () => saltar(1));
    } catch (_) {}
  }

  // ============================================================ YouTube (sin login)
  function cargarYtApi(cb) {
    if (window.YT && window.YT.Player) { cb(); return; }
    ytApiCbs.push(cb);
    if (window.__nmYtCargando) return;
    window.__nmYtCargando = true;
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { try { if (prev) prev(); } catch (_) {} ytApiCbs.splice(0).forEach((f) => { try { f(); } catch (_) {} }); };
    const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; sc.async = true;
    sc.onerror = () => { window.__nmYtCargando = false; ytApiCbs = []; setMensaje('No se pudo cargar YouTube (¿bloqueador de anuncios o sin conexión?).'); };
    document.head.appendChild(sc);
  }
  function contenedorYt() {
    let host = document.getElementById('nm-yt-persist');
    if (!host) { host = document.createElement('div'); host.id = 'nm-yt-persist'; host.className = 'nm-yt-oculto'; document.body.appendChild(host); }
    return host;
  }
  function volYt() { return Math.round(Math.min(1, parseFloat(localStorage.getItem(K_AMB) || '0.5')) * 100); }
  function reproducirYt(i, inicio) {
    inicio = Math.max(0, Math.floor(inicio || 0));
    const it = YT_LISTA[((i % YT_LISTA.length) + YT_LISTA.length) % YT_LISTA.length];
    detenerOtros('yt');
    ytIdx = YT_LISTA.indexOf(it);
    fuente = { tipo: 'yt', nombre: it.label };
    sonando = true;
    const host = contenedorYt();
    cargarYtApi(() => {
      if (!fuente || fuente.tipo !== 'yt') return;
      if (ytCtrl && ytCtrl.loadVideoById) { try { ytCtrl.loadVideoById({ videoId: it.id, startSeconds: inicio }); ytCtrl.setVolume(volYt()); } catch (_) {} return; }
      host.innerHTML = '<div id="nm-yt-div"></div>';
      ytCtrl = new window.YT.Player('nm-yt-div', {
        width: '100%', height: '100%', videoId: it.id,
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1, fs: 0, start: inicio, origin: location.origin },
        events: {
          onReady: (e) => { try { e.target.setVolume(volYt()); e.target.playVideo(); } catch (_) {} },
          onStateChange: (e) => {
            if (!fuente || fuente.tipo !== 'yt') return;
            if (e.data === 1) { detenerOtros('yt'); sonando = true; pintarEstado(); }
            else if (e.data === 2) { sonando = false; pintarEstado(); }
            else if (e.data === 0) reproducirYt(ytIdx + 1);
          },
          onError: () => { setMensaje('Ese video no se puede reproducir acá. Probamos con el siguiente.'); setTimeout(() => { if (fuente && fuente.tipo === 'yt') reproducirYt(ytIdx + 1); }, 1200); },
        },
      });
    });
    mediaSesion(it.label, it.icono);
    render();
  }
  // El reproductor de YouTube queda SIEMPRE visible (política de YouTube): grande en la ventana, miniatura al minimizar o cerrar.
  function acoplarYt() {
    const host = document.getElementById('nm-yt-persist'); if (!host) return;
    if (!fuente || fuente.tipo !== 'yt') { host.className = 'nm-yt-oculto'; return; }
    const slot = $('#nm-yt');
    if (abierto && !minimizado && vista === 'ambiente') {
      if (!slot) return;   // la ventana se está redibujando
      const r = slot.getBoundingClientRect();
      host.className = 'nm-yt-grande';
      host.style.left = r.left + 'px'; host.style.top = r.top + 'px'; host.style.width = r.width + 'px'; host.style.height = r.height + 'px';
      host.style.right = 'auto'; host.style.bottom = 'auto';
      return;
    }
    const u = ui().yt || {};
    const tam = ['normal', 'chica', 'chip'].includes(u.tam) ? u.tam : 'chica';
    host.className = 'nm-yt-mini t-' + tam;
    host.style.width = ''; host.style.height = '';
    ovYt(host);
    const W = tam === 'normal' ? 160 : tam === 'chica' ? 112 : 44, H = tam === 'normal' ? 90 : tam === 'chica' ? 63 : 44;
    if (typeof u.x === 'number' && typeof u.y === 'number') {   // lugar elegido por la persona (se arrastra libremente)
      host.style.left = Math.max(0, Math.min(u.x, window.innerWidth - W)) + 'px';
      host.style.top = Math.max(0, Math.min(u.y, window.innerHeight - H)) + 'px';
      host.style.right = 'auto'; host.style.bottom = 'auto';
    } else if (pill && pill.classList.contains('on')) {
      const r = pill.getBoundingClientRect();
      if (tam === 'chip') {   // cuadradito pegado a la izquierda de la píldora, como una carátula
        host.style.left = Math.max(4, r.left - 52) + 'px';
        host.style.top = Math.max(4, r.top + (r.height - H) / 2) + 'px';
      } else {
        host.style.left = Math.max(8, Math.min(r.left, window.innerWidth - W - 16)) + 'px';
        host.style.top = Math.max(8, r.top - H - 8) + 'px';
      }
      host.style.right = 'auto'; host.style.bottom = 'auto';
    } else { host.style.left = '16px'; host.style.top = 'auto'; host.style.right = 'auto'; host.style.bottom = '78px'; }
  }
  // Capa sobre el video mini: arrastrar, cambiar de tamaño (normal / chica / chip) y ampliar. El video sigue siempre visible.
  function ovYt(host) {
    if (host.querySelector('.nm-yt-ov')) return;
    const ov = document.createElement('div'); ov.className = 'nm-yt-ov'; ov.title = 'Arrastrá para moverla';
    ov.innerHTML = '<button type="button" class="nm-yt-b1" aria-label="Cambiar tamaño" title="Cambiar tamaño">⤡</button><button type="button" class="nm-yt-b2" aria-label="Ampliar NikaMusic" title="Ampliar NikaMusic">⤢</button>';
    host.appendChild(ov);
    ov.querySelector('.nm-yt-b1').addEventListener('click', (e) => {
      e.stopPropagation();
      const t = (ui().yt || {}).tam || 'chica', sig = { normal: 'chica', chica: 'chip', chip: 'normal' }[t] || 'chica';
      guardarUi({ yt: { ...(ui().yt || {}), tam: sig } }); acoplarYt();
    });
    ov.querySelector('.nm-yt-b2').addEventListener('click', (e) => { e.stopPropagation(); abrir(); });
    ov.addEventListener('dblclick', (e) => { if (e.target.closest('button')) return; const y = { ...(ui().yt || {}) }; delete y.x; delete y.y; guardarUi({ yt: y }); acoplarYt(); });
    ov.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = host.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top; let movio = false;
      try { ov.setPointerCapture(e.pointerId); } catch (_) {}
      const mover = (ev) => {
        if (!movio && Math.abs(ev.clientX - e.clientX) < 4 && Math.abs(ev.clientY - e.clientY) < 4) return;
        movio = true; host.classList.add('moviendo');
        host.style.left = Math.max(0, Math.min(ev.clientX - dx, window.innerWidth - r.width)) + 'px';
        host.style.top = Math.max(0, Math.min(ev.clientY - dy, window.innerHeight - r.height)) + 'px';
        host.style.right = 'auto'; host.style.bottom = 'auto';
      };
      const soltar = () => {
        ov.removeEventListener('pointermove', mover); ov.removeEventListener('pointerup', soltar); ov.removeEventListener('pointercancel', soltar);
        host.classList.remove('moviendo');
        if (movio) guardarUi({ yt: { ...(ui().yt || {}), x: parseFloat(host.style.left), y: parseFloat(host.style.top) } });
      };
      ov.addEventListener('pointermove', mover); ov.addEventListener('pointerup', soltar); ov.addEventListener('pointercancel', soltar);
    });
  }


  // Solo suena una fuente a la vez
  function detenerOtros(mantener) {
    if (mantener !== 'ruido' && ambId) detenerAmbiente();
    if (mantener !== 'yt' && ytCtrl) { try { ytCtrl.pauseVideo(); } catch (_) {} }
    if (mantener !== 'embed' && embedCtrl) { try { embedCtrl.pause(); } catch (_) {} }
    if (mantener !== 'sdk' && player && estado && !estado.paused) { try { player.pause(); } catch (_) {} }
  }

  // Play/Pause (píldora y paneles) según la fuente activa
  async function alternarReproduccion() {
    if (!fuente) return;
    if (fuente.tipo === 'ruido') { if (sonando) pausarAmbiente(); else reanudarAmbiente(); }
    else if (fuente.tipo === 'yt') { try { if (sonando) ytCtrl.pauseVideo(); else ytCtrl.playVideo(); } catch (_) {} }
    else if (fuente.tipo === 'embed') { try { embedCtrl && embedCtrl.togglePlay(); } catch (_) {} }
    else if (fuente.tipo === 'sdk') { try { if (player.activateElement) await player.activateElement(); await player.togglePlay(); } catch (_) {} }
  }

  // Las alertas del campus bajan la música un momento (nunca la pausan ni se tapan)
  function duck(ms) {
    if (ambAudio && sonando) {
      const v0 = ambAudio.volume; ambAudio.volume = Math.max(0.02, v0 * 0.25);
      setTimeout(() => { if (ambAudio) ambAudio.volume = Math.min(1, parseFloat(localStorage.getItem(K_AMB) || '0.5') * 1.2); }, ms);
    }
    if (ytCtrl && fuente && fuente.tipo === 'yt' && sonando) {
      try { ytCtrl.setVolume(Math.max(2, Math.round(volYt() * 0.25))); setTimeout(() => { try { ytCtrl.setVolume(volYt()); } catch (_) {} }, ms); } catch (_) {}
    }
    if (master && actx && sonando && fuente && fuente.tipo === 'ruido' && !ambAudio) {
      master.gain.setTargetAtTime(0.2, actx.currentTime, 0.05);
      setTimeout(() => { if (master && actx) master.gain.setTargetAtTime(1, actx.currentTime, 0.4); }, ms);
    }
    if (player && estado && !estado.paused) {
      const vol = parseFloat(localStorage.getItem(K_VOL) || '0.5');
      try { player.setVolume(Math.max(0.03, vol * 0.2)); } catch (_) {}
      clearTimeout(duckTimer); duckTimer = setTimeout(() => { try { player.setVolume(vol); } catch (_) {} }, ms);
    }
  }

  // ============================================================ UI
  function css() {
    if (document.getElementById('nm-css')) return;
    const st = document.createElement('style');
    st.id = 'nm-css';
    st.textContent = `
      [data-nika-music-toggle] .nm-logo { flex-shrink: 0; }
      [data-nika-music-toggle].nm-sonando { position: relative; }
      [data-nika-music-toggle].nm-sonando::after { content: ""; position: absolute; top: 8px; right: 10px; width: 8px; height: 8px; border-radius: 50%; background: #1db954; animation: nmPulse2 1.4s ease-out infinite; }
      @keyframes nmPulse2 { from { box-shadow: 0 0 0 0 rgba(29,185,84,.7); } to { box-shadow: 0 0 0 9px rgba(29,185,84,0); } }

      .nm-body { scrollbar-width: thin !important; scrollbar-color: #1db954 rgba(255,255,255,.08) !important; overscroll-behavior: contain; }
      .nm-body::-webkit-scrollbar { display: block !important; width: 10px !important; }
      .nm-body::-webkit-scrollbar-track { background: rgba(255,255,255,.07); border-radius: 8px; }
      .nm-body::-webkit-scrollbar-thumb { background: #1db954; border-radius: 8px; border: 2px solid #0b0e13; }
      .nm-buscador { display: flex; flex-direction: column; gap: 6px; }
      .nm-res-t { margin: 8px 4px 2px; font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #1db954; }
      .nm-buscando .nm-prog, .nm-buscando .nm-volrow, .nm-buscando .nm-chips.nm-scroll, .nm-buscando .nm-out { display: none; }
      .nm-buscando .nm-cover { width: 40px; height: 40px; } .nm-buscando .nm-bigctrl { gap: 10px; }
      .nm-buscando .nm-bigctrl button { transform: scale(.82); }
      .nm-buscando #nm-res { max-height: none; }
      .nm-item { padding: 7px 8px; } .nm-item img { width: 44px; height: 44px; } .nm-item:hover b { color: #1db954; }
      #nm-res { scrollbar-width: thin; scrollbar-color: #1db954 transparent; }
      #nm-res.nm-album-vista { max-height: 300px; }
      .nm-album-cab { display: flex; align-items: center; gap: 10px; padding: 4px 4px 8px; position: sticky; top: 0; background: #0f131a; z-index: 1; }
      .nm-album-cab img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: #1f2630; }
      .nm-album-cab span { flex: 1; min-width: 0; } .nm-album-cab b { display: block; font-size: .84rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .nm-album-cab small { color: #94a3b8; font-size: .7rem; }
      .nm-atras, .nm-albplay { border: none; cursor: pointer; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.1); color: #e2e8f0; font-size: 1rem; flex-shrink: 0; }
      .nm-albplay { background: #1db954; color: #04130a; } .nm-atras:hover { background: rgba(255,255,255,.22); }
      .nm-trk { align-items: center; } .nm-trk .nm-n { width: 22px; text-align: center; color: #64748b; font-size: .74rem; flex-shrink: 0; } .nm-trk em { margin-left: auto; font-style: normal; color: #64748b; font-size: .7rem; flex-shrink: 0; }
      .nm-share { display: flex; align-items: center; gap: 8px; font-size: .72rem; color: #94a3b8; cursor: pointer; padding-top: 2px; }
      .nm-share input { accent-color: #1db954; width: 15px; height: 15px; }
      #nm-fab { position: fixed; left: 16px; bottom: 18px; z-index: 9990; width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(29,185,84,.55); cursor: pointer; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #14181f, #0b0e13); box-shadow: 0 12px 26px -10px rgba(0,0,0,.7), 0 0 18px -6px rgba(29,185,84,.5); transition: transform .18s; padding: 0; }
      #nm-fab:hover { transform: scale(1.1) rotate(-6deg); }
      #nm-fab.nm-sonando::after { content: ""; position: absolute; top: 6px; right: 6px; width: 9px; height: 9px; border-radius: 50%; background: #1db954; animation: nmPulse2 1.4s ease-out infinite; }
      #nm-pill { cursor: grab; touch-action: none; }
      #nm-pill:active { cursor: grabbing; }
      .nm-grip { color: #64748b; font-size: .9rem; letter-spacing: -2px; flex-shrink: 0; user-select: none; line-height: 1; }
      #nm-embed-persist { position: fixed; left: -9999px; top: 0; width: 300px; z-index: 9993; opacity: 0; pointer-events: none; border-radius: 12px; overflow: hidden; }
      /* NikaMusic · degradé verde/turquesa, YouTube compacto y chips animados */
      .nm-h { background: linear-gradient(120deg, rgba(29,185,84,.42), rgba(20,184,166,.28) 55%, rgba(99,102,241,.22)) !important; background-size: 200% 100%; animation: nmFluye 10s ease-in-out infinite alternate; }
      @keyframes nmFluye { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
      .nm-lock { font-size: .6rem; font-weight: 800; background: rgba(251,191,36,.2); color: #fde68a; border-radius: 99px; padding: 1px 6px; margin-left: 4px; }
      #nm-yt-persist { position: fixed; z-index: 9993; overflow: hidden; background: #000; transition: opacity .2s, transform .25s cubic-bezier(.22,1,.36,1); }
      #nm-yt-persist iframe { width: 100%; height: 100%; border: 0; display: block; }
      #nm-yt-persist.nm-yt-oculto { left: -9999px; top: 0; width: 160px; height: 90px; opacity: 0; pointer-events: none; }
      #nm-yt-persist.nm-yt-grande { border-radius: 14px; box-shadow: 0 0 0 1px rgba(29,185,84,.6), 0 14px 30px -12px rgba(0,0,0,.7); pointer-events: none; }
      #nm-yt-persist .nm-yt-ov { display: none; }
      #nm-yt-persist.nm-yt-mini .nm-yt-ov { display: block; position: absolute; inset: 0; z-index: 2; cursor: grab; touch-action: none; border-radius: inherit; }
      #nm-yt-persist.nm-yt-mini.moviendo .nm-yt-ov { cursor: grabbing; }
      #nm-yt-persist.nm-yt-mini .nm-yt-ov button { position: absolute; top: 3px; width: 22px; height: 22px; border: 0; border-radius: 7px; background: rgba(0,0,0,.62); color: #fff; font-size: .72rem; line-height: 1; cursor: pointer; opacity: 0; transform: scale(.8); transition: opacity .15s, transform .15s, background .15s; }
      #nm-yt-persist.nm-yt-mini .nm-yt-b1 { right: 28px; } #nm-yt-persist.nm-yt-mini .nm-yt-b2 { right: 3px; }
      #nm-yt-persist.nm-yt-mini:hover .nm-yt-ov button, #nm-yt-persist.nm-yt-mini.moviendo .nm-yt-ov button { opacity: 1; transform: none; }
      #nm-yt-persist.nm-yt-mini .nm-yt-ov button:hover { background: #1db954; color: #04130a; }
      #nm-yt-persist.nm-yt-mini.t-normal { width: 160px; height: 90px; } #nm-yt-persist.nm-yt-mini.t-chica { width: 112px; height: 63px; }
      #nm-yt-persist.nm-yt-mini.t-chip { width: 44px; height: 44px; border-radius: 12px; }
      #nm-yt-persist.nm-yt-mini.t-chip iframe { position: absolute; left: -17px; top: 0; width: 78px; height: 44px; }
      #nm-yt-persist.nm-yt-mini.t-chip .nm-yt-ov button { top: 1px; width: 16px; height: 16px; font-size: .55rem; } #nm-yt-persist.nm-yt-mini.t-chip .nm-yt-b1 { right: 19px; } #nm-yt-persist.nm-yt-mini.t-chip .nm-yt-b2 { right: 1px; }
      #nm-yt-persist.nm-yt-mini { width: 160px; height: 90px; border-radius: 12px; box-shadow: 0 0 0 2px rgba(29,185,84,.75), 0 16px 30px -12px rgba(0,0,0,.8); animation: nmMini .35s cubic-bezier(.34,1.56,.64,1); pointer-events: auto; }
      @keyframes nmMini { from { opacity: 0; transform: translateY(10px) scale(.85); } }
      .nm-yt-slot { flex: 0 0 150px; min-height: 150px; height: 150px; border-radius: 14px; margin: 6px 0 2px; background: linear-gradient(135deg, #0f172a, #14532d); position: relative; }
      .nm-yt-nota { flex: 0 0 auto; font-size: .66rem; color: #94a3b8; text-align: center; margin-bottom: 6px; }
      .nm-yt-b, .nm-amb { animation: nmChip .4s cubic-bezier(.34,1.56,.64,1) both; animation-delay: calc(var(--d, 0) * 45ms); transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s, background .18s; }
      .nm-yt-b { border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.07); color: #e2e8f0; border-radius: 999px; padding: 7px 12px; font: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
      .nm-yt-b:hover, .nm-amb:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 10px 18px -10px rgba(29,185,84,.7); }
      .nm-yt-b.on { background: linear-gradient(135deg, #1db954, #14b8a6); color: #04130a; border-color: transparent; font-weight: 800; }
      @keyframes nmChip { from { opacity: 0; transform: translateY(8px) scale(.9); } }
      /* cartel al iniciar un Pomodoro */
      .nm-ask { position: fixed; inset: 0; z-index: 9996; display: flex; align-items: center; justify-content: center; padding: 14px; background: rgba(2,6,23,.6); backdrop-filter: blur(4px); animation: nmFade .2s ease; }
      @keyframes nmFade { from { opacity: 0; } }
      .nm-ask-c { width: min(420px, 100%); border-radius: 22px; overflow: hidden; background: linear-gradient(180deg, #14181f, #0b0e13); color: #f1f5f9; border: 1px solid rgba(29,185,84,.5); box-shadow: 0 30px 70px -16px rgba(0,0,0,.8), 0 0 50px -14px rgba(29,185,84,.5); animation: nmIn .3s cubic-bezier(.34,1.56,.64,1); }
      .nm-ask-h { padding: 18px 18px 14px; background: linear-gradient(120deg, rgba(29,185,84,.5), rgba(20,184,166,.35) 55%, rgba(99,102,241,.3)); }
      .nm-ask-h .e { font-size: 2rem; display: inline-block; animation: nmFlota 3s ease-in-out infinite; } @keyframes nmFlota { 50% { transform: translateY(-5px) rotate(-6deg); } }
      .nm-ask-h h3 { margin: 6px 0 2px; font-size: 1.08rem; } .nm-ask-h p { margin: 0; font-size: .8rem; opacity: .9; }
      .nm-ask-b { padding: 14px 16px 16px; }
      .nm-ask-b h4 { margin: 8px 0 6px; font-size: .68rem; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; }
      .nm-ask-b .nm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .nm-ask-f { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
      .nm-ask-f label { font-size: .72rem; color: #94a3b8; display: flex; gap: 6px; align-items: center; cursor: pointer; } .nm-ask-f input { accent-color: #1db954; }
      .nm-ask-no { border: 1px solid rgba(255,255,255,.2); background: transparent; color: #e2e8f0; border-radius: 999px; padding: 8px 16px; font: inherit; font-weight: 700; font-size: .8rem; cursor: pointer; }
      @media (prefers-reduced-motion: reduce) { .nm-h, .nm-yt-b, .nm-amb, .nm-ask-h .e, #nm-yt-persist.nm-yt-mini { animation: none !important; } }

      #nm-panel { position: fixed; right: 20px; top: 78px; z-index: 9991; width: 340px; max-width: calc(100vw - 16px); max-height: calc(100vh - 96px); display: flex; flex-direction: column; overflow: hidden;
        background: linear-gradient(180deg, #14181f, #0b0e13); color: #f1f5f9; border: 1px solid rgba(29,185,84,.4); border-radius: 20px;
        box-shadow: 0 28px 60px -14px rgba(0,0,0,.75), 0 0 40px -12px rgba(29,185,84,.35); font-family: inherit; }
      #nm-panel.oculto { visibility: hidden; opacity: 0; pointer-events: none; }
      #nm-panel.entra { animation: nmIn .2s ease; }
      @keyframes nmIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
      .nm-h { display: flex; align-items: center; justify-content: space-between; padding: 11px 12px 11px 14px; cursor: grab; user-select: none; touch-action: none;
        background: linear-gradient(135deg, rgba(29,185,84,.24), rgba(29,185,84,.04)); border-bottom: 1px solid rgba(255,255,255,.06); }
      .nm-h:active { cursor: grabbing; }
      .nm-h b { font-size: .92rem; display: flex; align-items: center; gap: 7px; } .nm-h small { display: block; font-size: .64rem; color: #94a3b8; font-weight: 600; }
      .nm-hb { display: flex; gap: 4px; }
      .nm-hb button { border: none; background: rgba(255,255,255,.08); color: #e2e8f0; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: .85rem; font-weight: 800; line-height: 1; }
      .nm-hb button:hover { background: rgba(255,255,255,.2); }
      .nm-tabs { display: flex; gap: 6px; padding: 10px 12px 0; }
      .nm-tab { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); color: #94a3b8; border-radius: 999px; padding: 8px 10px; font-size: .78rem; font-weight: 800; cursor: pointer; font-family: inherit; }
      .nm-tab.on { background: rgba(29,185,84,.18); border-color: #1db954; color: #4ade80; }
      .nm-body { padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
      .nm-sec { font-size: .66rem; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; color: #64748b; margin-bottom: 7px; }
      .nm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .nm-chips button { border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.05); color: #e2e8f0; border-radius: 999px; padding: 7px 12px; font-size: .76rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; }
      .nm-chips button:hover { border-color: #1db954; color: #4ade80; }
      .nm-chips button.on { background: #1db954; border-color: #1db954; color: #04130a; box-shadow: 0 0 16px rgba(29,185,84,.45); }
      .nm-chips button.cargando { opacity: .5; }
      #nm-embed { display: none; margin-top: 10px; min-height: 152px; border-radius: 12px; overflow: hidden; }
      .nm-nota { font-size: .68rem; color: #94a3b8; line-height: 1.4; margin-top: 6px; }
      .nm-ambvol { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: .9rem; } .nm-ambvol input { flex: 1; }

      .nm-solic { margin: 12px 4px 4px; padding: 12px; border-radius: 14px; background: rgba(255,255,255,.06); border: 1px dashed rgba(255,255,255,.2); display: flex; flex-direction: column; gap: 6px; font-size: .84rem; color: #e2e8f0; }
      .nm-solic small { color: #94a3b8; line-height: 1.4; }
      .nm-solic input { font: inherit; padding: 9px 12px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,.25); background: rgba(0,0,0,.25); color: #fff; }
      .nm-sol-b { border: 0; cursor: pointer; padding: 10px; border-radius: 10px; font: 800 .85rem inherit; font-family: inherit; color: #04130a; background: #1DB954; transition: transform .15s, filter .15s; }
      .nm-sol-b:hover { transform: translateY(-1px); filter: brightness(1.08); } .nm-sol-b:disabled { opacity: .6; }
      .nm-sol-m { font-size: .78rem; min-height: 16px; color: #86efac; } .nm-sol-m.err { color: #fca5a5; }
      .nm-sol-ok b { color: #86efac; } .nm-sol-ok small { display: block; margin-top: 4px; }
      .nm-conectar { text-align: center; padding: 6px 4px; font-size: .84rem; color: #cbd5e1; line-height: 1.5; }
      .nm-btn-spotify { display: inline-flex; align-items: center; justify-content: center; gap: 9px; margin-top: 14px; border: none; cursor: pointer; padding: 13px 26px; border-radius: 9999px;
        background: #1DB954; color: #04130a; font-weight: 800; font-size: .92rem; font-family: inherit; transition: transform .18s ease, box-shadow .25s ease, filter .2s ease; }
      .nm-btn-spotify:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 0 20px rgba(29, 185, 84, 0.45); filter: brightness(1.06); }
      .nm-btn-spotify:active { transform: scale(.98); }
      .nm-btn-spotify .nm-logo circle { fill: #04130a; } .nm-btn-spotify .nm-logo path { fill: #1DB954; }
      #nm-connmsg { display: none; margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: rgba(148,163,184,.1); border: 1px solid rgba(148,163,184,.25); color: #cbd5e1; font-size: .78rem; text-align: left; }
      .nm-link { border: none; background: none; color: #4ade80; font-weight: 800; cursor: pointer; padding: 6px 0 0; font-family: inherit; font-size: .78rem; }

      .nm-now { display: flex; gap: 12px; align-items: center; }
      .nm-cover:not([src]) { visibility: hidden; }
      .nm-cover { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; background: #1f2630; flex-shrink: 0; box-shadow: 0 8px 18px -6px rgba(0,0,0,.7); }
      .nm-meta { min-width: 0; } .nm-meta b { display: block; font-size: .92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .nm-meta small { color: #94a3b8; font-size: .76rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .nm-prog { display: flex; align-items: center; gap: 8px; font-size: .68rem; color: #94a3b8; font-variant-numeric: tabular-nums; } .nm-prog input { flex: 1; }
      #nm-panel input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 4px; background: rgba(255,255,255,.18); outline: none; cursor: pointer; }
      #nm-panel input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #1db954; }
      #nm-panel input[type=range]::-moz-range-thumb { width: 12px; height: 12px; border: none; border-radius: 50%; background: #1db954; }
      .nm-ctrl { display: flex; align-items: center; justify-content: center; gap: 14px; }
      .nm-ctrl button { border: none; background: transparent; color: #e2e8f0; font-size: 1.15rem; cursor: pointer; width: 38px; height: 38px; border-radius: 50%; }
      .nm-ctrl button:hover { background: rgba(255,255,255,.1); }
      .nm-ctrl #nm-play { background: #1db954; color: #04130a; width: 48px; height: 48px; font-size: 1.2rem; box-shadow: 0 8px 18px -6px rgba(29,185,84,.7); }
      .nm-vol { display: flex; align-items: center; gap: 8px; font-size: .9rem; } .nm-vol input { flex: 1; }
      #nm-q { width: 100%; box-sizing: border-box; padding: 9px 13px; border-radius: 999px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); color: #f1f5f9; font-size: .84rem; font-family: inherit; outline: none; }
      #nm-q:focus { border-color: #1db954; }
      #nm-res { display: flex; flex-direction: column; gap: 2px; margin-top: 2px; min-height: 0; max-height: 260px; overflow-y: auto; }
      .nm-item { display: flex; gap: 10px; align-items: center; border: none; background: transparent; color: inherit; padding: 6px; border-radius: 10px; cursor: pointer; text-align: left; font-family: inherit; }
      .nm-item:hover { background: rgba(255,255,255,.08); } .nm-item img { width: 36px; height: 36px; border-radius: 6px; background: #1f2630; object-fit: cover; }
      .nm-item span { min-width: 0; } .nm-item b { display: block; font-size: .8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .nm-item small { color: #94a3b8; font-size: .7rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .nm-vacio { text-align: center; color: #94a3b8; font-size: .78rem; padding: 8px; }
      #nm-msg { display: none; background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.4); color: #fecaca; border-radius: 10px; padding: 8px 10px; font-size: .76rem; }
      .nm-out { border: none; background: none; color: #64748b; font-size: .7rem; cursor: pointer; text-decoration: underline; align-self: center; font-family: inherit; }

      .nm-np { display: flex; flex-direction: column; gap: 12px; padding: 14px; border-radius: 16px; background: linear-gradient(135deg, rgba(29,185,84,.16), rgba(29,185,84,.04)); border: 1px solid rgba(29,185,84,.35); }
      .nm-np-t { display: flex; align-items: center; gap: 10px; min-width: 0; } .nm-np-t b { font-size: .95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .nm-bigctrl { display: flex; align-items: center; justify-content: center; gap: 16px; }
      .nm-bigctrl button { border: none; cursor: pointer; border-radius: 50%; color: #f1f5f9; background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; transition: transform .12s, background .15s, box-shadow .2s; font-family: inherit; }
      .nm-bigctrl button:hover { background: rgba(255,255,255,.22); transform: scale(1.08); }
      .nm-bigctrl button:active { transform: scale(.94); }
      .nm-bigctrl .med { width: 46px; height: 46px; font-size: 1.15rem; }
      .nm-bigctrl .grande { width: 62px; height: 62px; font-size: 1.6rem; background: #1db954; color: #04130a; box-shadow: 0 10px 22px -6px rgba(29,185,84,.7); }
      .nm-bigctrl .grande:hover { background: #22d160; box-shadow: 0 0 22px rgba(29,185,84,.55); }
      .nm-volrow { display: flex; align-items: center; gap: 10px; }
      .nm-volrow input[type=range] { flex: 1; height: 8px !important; }
      #nm-panel .nm-volrow input[type=range]::-webkit-slider-thumb { width: 18px; height: 18px; }
      #nm-panel .nm-volrow input[type=range]::-moz-range-thumb { width: 18px; height: 18px; }
      .nm-volrow b { min-width: 26px; text-align: right; font-size: .78rem; color: #94a3b8; font-variant-numeric: tabular-nums; }
      .nm-mute { border: none; background: rgba(255,255,255,.1); color: #f1f5f9; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; font-size: 1.05rem; flex-shrink: 0; }
      .nm-mute:hover { background: rgba(255,255,255,.22); }
      .nm-scroll button { white-space: nowrap; }
      #nm-panel .nm-prog input[type=range] { height: 6px !important; }
      #nm-panel .nm-prog input[type=range]::-webkit-slider-thumb { width: 14px; height: 14px; }
      .nm-sec { margin: 0 0 -6px; }
      #nm-pill { position: fixed; right: 92px; bottom: 22px; z-index: 9992; display: none; align-items: center; gap: 10px; max-width: min(430px, calc(100vw - 110px)); padding: 6px 8px 6px 14px; border-radius: 9999px;
        background: linear-gradient(135deg, #14181f, #0b0e13); color: #f1f5f9; border: 1px solid rgba(29,185,84,.55); box-shadow: 0 14px 30px -10px rgba(0,0,0,.7), 0 0 22px -6px rgba(29,185,84,.5); font-family: inherit; }
      #nm-pill.on { display: flex; animation: nmIn .2s ease; }
      /* barra flotante en modo compacto y/o vertical */
      #nm-pill.nm-compacta { gap: 4px; padding: 5px 6px; max-width: none; }
      #nm-pill.nm-compacta .nm-grip, #nm-pill.nm-compacta #nm-pill-t, #nm-pill.nm-compacta #nm-pill-prev, #nm-pill.nm-compacta #nm-pill-next, #nm-pill.nm-compacta #nm-pill-vol { display: none; }
      #nm-pill.nm-compacta #nm-pill-play { width: 36px !important; height: 36px !important; }
      #nm-pill.nm-vertical { flex-direction: column; border-radius: 26px; padding: 10px 6px; gap: 6px; max-width: none; width: auto; }
      #nm-pill.nm-vertical .nm-pill-ctrl { flex-direction: column; }
      #nm-pill.nm-vertical .nm-grip { transform: rotate(90deg); }
      #nm-pill.nm-vertical #nm-pill-t { writing-mode: vertical-rl; transform: rotate(180deg); max-height: 118px; min-width: 0; flex: 0 1 auto; font-size: .72rem; }
      #nm-pill.nm-vertical #nm-pill-volbox { right: calc(100% + 10px); bottom: auto; top: 50%; transform: translateY(-50%); }
      #nm-pill.nm-compacta.nm-vertical #nm-pill-t { display: none; }
      #nm-pill-comp, #nm-pill-rot { font-size: .8rem !important; }
      #nm-pill-close { font-size: .8rem !important; } #nm-pill-close:hover { background: #ef4444 !important; color: #fff !important; }
      .nm-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 16px; flex-shrink: 0; }
      .nm-eq i { width: 3px; height: 4px; background: #1db954; border-radius: 2px; }
      #nm-pill.sonando .nm-eq i, .nm-eq.sonando i { animation: nmEq 0.9s ease-in-out infinite; }
      .nm-eq i:nth-child(2) { animation-delay: -.3s !important; } .nm-eq i:nth-child(3) { animation-delay: -.6s !important; } .nm-eq i:nth-child(4) { animation-delay: -.15s !important; }
      @keyframes nmEq { 0%, 100% { height: 3px; } 50% { height: 15px; } }
      #nm-pill-t { font-size: .78rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; flex: 1; min-width: 40px; }
      .nm-pill-ctrl { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
      #nm-pill button { border: none; cursor: pointer; width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; font-size: .9rem; background: rgba(255,255,255,.1); color: #e2e8f0; display: flex; align-items: center; justify-content: center; transition: background .15s, transform .12s; }
      #nm-pill button:hover { background: rgba(255,255,255,.24); transform: scale(1.08); }
      #nm-pill button:disabled { opacity: .4; cursor: not-allowed; transform: none; }
      #nm-pill-play { background: #1db954 !important; color: #04130a !important; width: 40px !important; height: 40px !important; font-size: 1.05rem !important; box-shadow: 0 6px 14px -4px rgba(29,185,84,.7); }
      #nm-pill-volbox { position: absolute; right: 8px; bottom: calc(100% + 10px); display: none; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 16px; background: #14181f; border: 1px solid rgba(29,185,84,.5); box-shadow: 0 16px 30px -10px rgba(0,0,0,.75); width: 230px; }
      #nm-pill.vol-abierto #nm-pill-volbox { display: flex; }
      #nm-pill-volbox input { flex: 1; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 6px; background: rgba(255,255,255,.2); outline: none; cursor: pointer; }
      #nm-pill-volbox input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #1db954; }
      #nm-pill-volbox input::-moz-range-thumb { width: 18px; height: 18px; border: none; border-radius: 50%; background: #1db954; }
      #nm-pill-volbox b { min-width: 24px; text-align: right; font-size: .78rem; color: #94a3b8; }
      @media (max-width: 640px) {
        #nm-panel { left: 8px !important; right: 8px !important; top: auto !important; bottom: calc(8px + env(safe-area-inset-bottom, 0px)); width: auto; max-height: 78vh; max-height: 78dvh; border-radius: 22px; }
        .nm-h { cursor: default; }
        .nm-body { padding: 12px; gap: 12px; }
        .nm-bigctrl .med { width: 50px; height: 50px; } .nm-bigctrl .grande { width: 66px; height: 66px; }
        #nm-pill { left: 10px; right: 72px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); max-width: none; }
        #nm-pill.nm-compacta, #nm-pill.nm-vertical { left: auto; right: 10px; }
        #nm-pill-t { min-width: 0; } #nm-pill-x { display: none; }
        #nm-pill-volbox { right: 0; width: min(230px, 80vw); }
        body.at-en-llamada #nm-pill { bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
      }
    `;
    document.head.appendChild(st);
  }

  function construir() {
    css();
    panel = document.createElement('div');
    panel.id = 'nm-panel'; panel.className = 'oculto'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'NikaMusic');
    pill = document.createElement('div');
    pill.id = 'nm-pill';
    pill.innerHTML = `<span class="nm-grip" title="Arrastrá para moverla">⋮⋮</span><span class="nm-eq"><i></i><i></i><i></i><i></i></span><span id="nm-pill-t" title="Abrir NikaMusic">NikaMusic</span>
      <div class="nm-pill-ctrl">
        <button type="button" id="nm-pill-prev" aria-label="Anterior" title="Anterior">⏮</button>
        <button type="button" id="nm-pill-play" aria-label="Reproducir o pausar" title="Reproducir / pausar">▶</button>
        <button type="button" id="nm-pill-next" aria-label="Siguiente" title="Siguiente">⏭</button>
        <button type="button" id="nm-pill-vol" aria-label="Volumen" title="Volumen">🔊</button>
        <button type="button" id="nm-pill-x" aria-label="Ampliar" title="Ampliar">⤢</button>
        <button type="button" id="nm-pill-comp" aria-label="Hacer más chica" title="Más chica / normal">⊟</button>
        <button type="button" id="nm-pill-rot" aria-label="Girar a vertical" title="Girar: horizontal / vertical">⟳</button>
        <button type="button" id="nm-pill-close" aria-label="Cerrar NikaMusic y detener la música" title="Cerrar y detener la música">✕</button>
      </div>
      <div id="nm-pill-volbox"><button type="button" id="nm-pill-mute" aria-label="Silenciar">🔊</button><input type="range" id="nm-pill-range" min="0" max="100" value="50" aria-label="Volumen"><b id="nm-pill-n">50</b></div>`;
    document.body.appendChild(panel); document.body.appendChild(pill);
    $('#nm-pill-play', pill).onclick = (e) => { e.stopPropagation(); alternarReproduccion(); };
    $('#nm-pill-prev', pill).onclick = (e) => { e.stopPropagation(); saltar(-1); };
    $('#nm-pill-next', pill).onclick = (e) => { e.stopPropagation(); saltar(1); };
    $('#nm-pill-x', pill).onclick = () => abrir();
    $('#nm-pill-comp', pill).onclick = (e) => { e.stopPropagation(); const u = ui().pill || {}; guardarUi({ pill: { ...u, c: !u.c } }); aplicarPill(); };
    $('#nm-pill-close', pill).onclick = (e) => { e.stopPropagation(); cerrarYDetener(); };
    $('#nm-pill-rot', pill).onclick = (e) => { e.stopPropagation(); const u = ui().pill || {}; guardarUi({ pill: { ...u, v: !u.v } }); aplicarPill(); };
    $('#nm-pill-t', pill).onclick = () => { if (arrastroPill) return; abrir(); };
    activarArrastrePill();
    $('#nm-pill-vol', pill).onclick = (e) => { e.stopPropagation(); if (!volumenSoportado()) return; pill.classList.toggle('vol-abierto'); pintarVolumen(); };
    $('#nm-pill-range', pill).addEventListener('input', (e) => fijarVolumen(e.target.value / 100));
    let previoV = 0.5;
    $('#nm-pill-mute', pill).onclick = () => { const v = volumenActual(); if (v > 0) { previoV = v; fijarVolumen(0); } else fijarVolumen(previoV || 0.5); };
    document.addEventListener('mousedown', (e) => { if (pill && !pill.contains(e.target)) pill.classList.remove('vol-abierto'); });

    document.addEventListener('click', (e) => {
      const t = e.target.closest && e.target.closest('[data-nika-music-toggle]');
      if (!t) return;
      e.preventDefault();
      if (abierto && !minimizado) cerrar(); else abrir();
      if (window.innerWidth <= 900) { const sb = document.getElementById('appSidebar'); if (sb && sb.classList.contains('sidebar-open') && typeof window.toggleSidebar === 'function') window.toggleSidebar(); }
    });
    // Esc oculta la ventana (si algo suena queda la barra minimizada); ✕ la cierra y detiene la música
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto && !minimizado) { if (fuente) minimizar(); else cerrar(); } });
    window.addEventListener('nika:alerta-sonido', () => duck(2600));
    window.addEventListener('nika:music-share', () => { ultPub = '\u0000'; if (localStorage.getItem(K_SHARE) === '0') extActual = null; publicar(); render(); consultarExterno(); });
    window.addEventListener('resize', () => { acomodarPosicion(); acoplarEmbed(); posicionPill(); });
    window.addEventListener('pagehide', () => { saliendo = true; guardarSesion(); });

    const u = ui();
    vista = u.vista === 'spotify' && leerTokens() && esPlus() ? 'spotify' : 'ambiente';
    render();
    posicionInicial();
    aplicarPill();
  }

  // ---- arrastre desde la cabecera ----
  const enCelular = () => window.matchMedia('(max-width: 640px)').matches;
  function posicionInicial() {
    if (enCelular()) { panel.style.left = ''; panel.style.top = ''; panel.style.right = ''; return; }
    const u = ui();
    if (typeof u.x === 'number') { panel.style.left = u.x + 'px'; panel.style.top = u.y + 'px'; panel.style.right = 'auto'; acomodarPosicion(); }
  }
  function acomodarPosicion() {
    if (!panel || panel.style.left === '' || panel.classList.contains('oculto')) return;
    const r = panel.getBoundingClientRect();
    panel.style.left = Math.min(Math.max(0, r.left), Math.max(0, window.innerWidth - r.width)) + 'px';
    panel.style.top = Math.min(Math.max(0, r.top), Math.max(0, window.innerHeight - 60)) + 'px';
  }
  function activarArrastre() {
    const h = $('.nm-h'); if (!h) return;
    h.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || enCelular()) return;
      const r = panel.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      h.setPointerCapture(e.pointerId);
      panel.style.right = 'auto'; panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px';
      const mover = (ev) => {
        panel.style.left = Math.min(Math.max(0, ev.clientX - dx), Math.max(0, window.innerWidth - r.width)) + 'px';
        panel.style.top = Math.min(Math.max(0, ev.clientY - dy), Math.max(0, window.innerHeight - 56)) + 'px';
        acoplarEmbed();
      };
      const soltar = () => {
        h.removeEventListener('pointermove', mover); h.removeEventListener('pointerup', soltar); h.removeEventListener('pointercancel', soltar);
        guardarUi({ x: parseFloat(panel.style.left), y: parseFloat(panel.style.top) });
      };
      h.addEventListener('pointermove', mover); h.addEventListener('pointerup', soltar); h.addEventListener('pointercancel', soltar);
    });
  }

  // ---- píldora minimizada: arrastrable, abajo por defecto, y recuerda dónde la dejaste ----
  // modo de la barra flotante: normal / compacta, horizontal / vertical (se guarda por dispositivo)
  function aplicarPill() {
    if (!pill) return;
    const u = ui().pill || {};
    pill.classList.toggle('nm-compacta', !!u.c);
    pill.classList.toggle('nm-vertical', !!u.v);
    const bc = $('#nm-pill-comp', pill), br = $('#nm-pill-rot', pill);
    if (bc) { bc.textContent = u.c ? '⊞' : '⊟'; bc.title = u.c ? 'Volver al tamaño normal' : 'Hacerla más chica'; }
    if (br) br.title = u.v ? 'Poner en horizontal' : 'Poner en vertical';
    posicionPill();
    try { acoplarYt(); } catch (_) {}
  }
  function posicionPill() {
    if (!pill) return;
    if (enCelular()) { pill.style.left = ''; pill.style.top = ''; pill.style.right = ''; pill.style.bottom = ''; return; }
    const u = ui();
    if (typeof u.px !== 'number') return;
    const w = pill.offsetWidth || 340, h = pill.offsetHeight || 52;
    pill.style.left = Math.min(Math.max(0, u.px), Math.max(0, window.innerWidth - w)) + 'px';
    pill.style.top = Math.min(Math.max(0, u.py), Math.max(0, window.innerHeight - h)) + 'px';
    pill.style.right = 'auto'; pill.style.bottom = 'auto';
  }
  function activarArrastrePill() {
    pill.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || e.target.closest('input') || enCelular()) return;
      const r = pill.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      let movio = false;
      try { pill.setPointerCapture(e.pointerId); } catch (_) {}
      const mover = (ev) => {
        if (!movio && Math.abs(ev.clientX - (r.left + dx)) < 4 && Math.abs(ev.clientY - (r.top + dy)) < 4) return;
        movio = true;
        pill.style.left = Math.min(Math.max(0, ev.clientX - dx), Math.max(0, window.innerWidth - r.width)) + 'px';
        pill.style.top = Math.min(Math.max(0, ev.clientY - dy), Math.max(0, window.innerHeight - r.height)) + 'px';
        pill.style.right = 'auto'; pill.style.bottom = 'auto';
      };
      const soltar = () => {
        pill.removeEventListener('pointermove', mover); pill.removeEventListener('pointerup', soltar); pill.removeEventListener('pointercancel', soltar);
        if (movio) { guardarUi({ px: parseFloat(pill.style.left), py: parseFloat(pill.style.top) }); arrastroPill = true; setTimeout(() => { arrastroPill = false; }, 120); }
      };
      pill.addEventListener('pointermove', mover); pill.addEventListener('pointerup', soltar); pill.addEventListener('pointercancel', soltar);
    });
    pill.addEventListener('dblclick', (e) => { if (e.target.closest('button') || e.target.closest('input')) return; guardarUi({ px: null, py: null }); pill.style.left = ''; pill.style.top = ''; pill.style.right = ''; pill.style.bottom = ''; });
  }

  // ---- la sesión sigue al cambiar de página (píldora, fuente y reproducción) ----
  let sesionLista = false;   // hasta restaurar la sesión anterior no se guarda nada (evita pisarla con el estado vacío del arranque)
  // segundo en el que va lo que suena (para seguir desde el mismo punto al cambiar de página)
  function posActual() {
    try {
      if (fuente && fuente.tipo === 'yt' && ytCtrl && ytCtrl.getCurrentTime) return Math.floor(ytCtrl.getCurrentTime() || 0);
      if (ambAudio && ambAudio.currentTime) return Math.floor(ambAudio.currentTime);
    } catch (_) {}
    return 0;
  }
  function guardarSesion() {
    if (!sesionLista) return;
    try {
      if (!fuente) { sessionStorage.removeItem(K_SESS); return; }
      sessionStorage.setItem(K_SESS, JSON.stringify({ min: minimizado && abierto, sonando: !!sonando, fuente: { tipo: fuente.tipo, nombre: fuente.nombre, id: fuente.tipo === 'ruido' ? ambId : null, yt: fuente.tipo === 'yt' ? ytIdx : null }, pos: posActual(), ts: Date.now() }));
    } catch (_) {}
  }
  const posDesdeSesion = (s0) => (Number(s0.pos) || 0) + (s0.sonando && s0.ts ? Math.min(30, Math.max(0, (Date.now() - s0.ts) / 1000)) : 0);
  function restaurarSesion() {
    let s0 = null; try { s0 = JSON.parse(sessionStorage.getItem(K_SESS) || 'null'); } catch (_) {}
    sesionLista = true;
    if (!s0 || !s0.fuente) return;
    const f = s0.fuente;
    if (s0.min) { abierto = true; minimizado = true; }
    try {
      if (f.tipo === 'ruido' && AMBIENTES.find((a2) => a2.id === f.id)) {
        if (s0.sonando) {
          iniciarAmbiente(f.id, posDesdeSesion(s0));
          if (actx && actx.state === 'suspended') {   // el navegador pide un gesto para sonar: queda en pausa y arranca con el primer toque
            sonando = false;
            const reanudar = () => { if (actx) { actx.resume(); sonando = true; pintarEstado(); } };
            ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, reanudar, { once: true }));
          }
        } else fuente = { tipo: 'ruido', nombre: f.nombre };
      } else if (f.tipo === 'yt') {
        const k = YT_LISTA.findIndex((x) => x.label === f.nombre);
        if (k >= 0) {
          fuente = { tipo: 'yt', nombre: YT_LISTA[k].label }; ytIdx = k; sonando = false;
          if (s0.sonando) { reproducirYt(k, posDesdeSesion(s0)); const reanudar = () => { if (ytCtrl && sonando === false) { try { ytCtrl.playVideo(); } catch (_) {} } }; ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, reanudar, { once: true })); }
        }
      } else if (f.tipo === 'embed') {
        const e = EMBEDS.find((x) => x.label === f.nombre);
        if (e) { embedUri = 'spotify:playlist:' + e.id; fuente = { tipo: 'embed', nombre: e.label }; sonando = false; if (s0.sonando) montarEmbed(embedUri); }
      } else if (f.tipo === 'sdk') {
        fuente = { tipo: 'sdk', nombre: f.nombre }; sonando = !!s0.sonando;
      }
    } catch (_) {}
    pintarEstado();
  }

  // ---- logo de Spotify en los botones de NikaMusic de cada página y botón flotante si la página no tiene uno ----
  function decorarBotones() {
    document.querySelectorAll('[data-nika-music-toggle]').forEach((el) => {
      if (el.id === 'nm-fab' || el.querySelector('.nm-logo') || el.querySelector('svg')) return;
      const sitio = el.querySelector('.lbl') || el;
      if (sitio.innerHTML.indexOf('🎧') >= 0) sitio.innerHTML = sitio.innerHTML.replace('🎧', SPOTIFY_SVG(16));
    });
    if (!document.querySelector('[data-nika-music-toggle]:not(#nm-fab)') && !document.getElementById('nm-fab')) {
      const b = document.createElement('button');
      b.id = 'nm-fab'; b.type = 'button'; b.setAttribute('data-nika-music-toggle', ''); b.title = 'NikaMusic'; b.setAttribute('aria-label', 'Abrir NikaMusic');
      b.innerHTML = SPOTIFY_SVG(26);
      document.body.appendChild(b);
    }
  }

  // ---- actividad: lo que escuchás aparece en tu estado ante tus amigos (como Discord), con opción para ocultarlo ----
  let ultPub = '';
  // Lo que suena en la app de Spotify (otro dispositivo de la cuenta conectada): se consulta cada tanto
  let extActual = null, extTimer = null, extFallos = 0;
  async function consultarExterno() {
    if (document.hidden) return;
    let compartir = true; try { compartir = localStorage.getItem(K_SHARE) !== '0'; } catch (_) {}
    if (!compartir || !leerTokens() || (fuente && sonando)) {
      if (extActual) { extActual = null; ultPub = '\u0001'; publicar(); }
      return;
    }
    try {
      const r = await api('/me/player/currently-playing?additional_types=track');
      extFallos = 0;
      const it = r && r.is_playing && r.item && (r.currently_playing_type === 'track' || r.item.type === 'track') ? r.item : null;
      const nuevo = it ? { t: String(it.name || '').slice(0, 80), a: String((it.artists || []).map((x) => x.name).join(', ')).slice(0, 80), o: 'spotify' } : null;
      const k = (x) => (x ? x.t + '|' + x.a : '');
      if (k(nuevo) !== k(extActual)) { extActual = nuevo; ultPub = '\u0001'; publicar(); }
    } catch (_) {
      if (++extFallos >= 4) { clearInterval(extTimer); extTimer = null; extActual = null; }   // sesión vencida o cuenta no habilitada: se deja de insistir
    }
  }
  function iniciarSondeoExterno() {
    if (extTimer || !leerTokens()) return;
    extTimer = setInterval(consultarExterno, 12000);
    setTimeout(consultarExterno, 2500);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) consultarExterno(); });
  }

  function datosMusica() {
    if (!fuente || !sonando) return extActual;   // si no suena nada en NikaMusic, vale lo que suena en tu app de Spotify
    const rec = (t) => String(t || '').slice(0, 80);
    if (fuente.tipo === 'sdk') {
      const tr = estado && estado.track_window && estado.track_window.current_track;
      return tr ? { t: rec(tr.name), a: rec(tr.artists.map((x) => x.name).join(', ')), o: 'spotify' } : null;
    }
    if (fuente.tipo === 'yt') return { t: rec(fuente.nombre), a: 'Lofi para estudiar', o: 'nikamusic' };
    if (fuente.tipo === 'embed') return { t: rec(fuente.nombre), a: 'Playlist de Spotify', o: 'spotify' };
    return { t: rec(fuente.nombre), a: 'Sonido ambiente', o: 'nikamusic' };
  }
  function publicar() {
    let psm = window.PomodoroSyncManager;
    const d0 = datosMusica();
    // Si algo suena y esta página no tiene la presencia en marcha, se carga e inicia para que tus amigos vean la actividad
    if (d0 && localStorage.getItem('nika_currentUser') && window.NikaSupabase && typeof NikaSupabase.getNikaCurrentUsername === 'function') {
      if (!psm) {
        if (!window.__nmCargandoPsm) {
          window.__nmCargandoPsm = true;
          const sc = document.createElement('script'); sc.src = 'js/pomodoroSyncManager.js?v=8'; sc.async = true;
          sc.onload = () => { ultPub = '\u0000'; publicar(); };
          document.head.appendChild(sc);
        }
        return;
      }
      if (!psm.activo && typeof psm.iniciar === 'function' && !window.__nmIniciandoPsm) {
        window.__nmIniciandoPsm = true;
        Promise.resolve(psm.iniciar()).catch(() => {}).then(() => { window.__nmIniciandoPsm = false; ultPub = '\u0000'; publicar(); });
        return;
      }
    }
    if (!psm || typeof psm.actualizarEstado !== 'function') return;
    let compartir = true; try { compartir = localStorage.getItem(K_SHARE) !== '0'; } catch (_) {}
    const d = compartir ? datosMusica() : null;
    const key = d ? d.t + '|' + d.a : '';
    if (key === ultPub) return;
    ultPub = key;
    try { psm.actualizarEstado({ musica: d }); } catch (_) {}
  }

  // ---- abrir / cerrar / minimizar ----
  function abrir() {
    abierto = true; minimizado = false;
    panel.classList.remove('oculto'); panel.classList.add('entra');
    pill.classList.remove('on');
    posicionInicial();
    requestAnimationFrame(acoplarEmbed);
    if (vista === 'spotify' && leerTokens() && !sdkCargado) { cargarSdk(); setMensaje('Conectando el reproductor...'); }
    pintarEstado();
  }
  // ✕: oculta la ventana; el audio (ruido, embed, Spotify) sigue sonando
  function cerrar() {
    abierto = false; minimizado = false;
    desacoplarEmbed();
    panel.classList.add('oculto'); panel.classList.remove('entra');
    pintarEstado();
  }
  // _: queda una píldora flotante con ecualizador, pista y Play/Pause
  function minimizar() {
    abierto = true; minimizado = true;
    desacoplarEmbed();
    panel.classList.add('oculto'); panel.classList.remove('entra');
    if (!fuente) { minimizado = false; abierto = false; } // nada sonando: no hay píldora que mostrar
    pintarEstado();
  }

  // ✕: cierra la ventana Y detiene todo (ruido, playlist y Spotify); para dejarla sonando se usa _ (minimizar)
  function cerrarYDetener() {
    detenerTodo();
    try { localStorage.setItem(K_ACTIVA, '0'); sessionStorage.removeItem(K_SESS); } catch (_) {}
    cerrar();
  }

  function cambiarVista(v) {
    if (v === 'spotify' && !esPlus()) {   // Mi Spotify es un beneficio NikaMed+
      try { if (window.NikaAcceso && NikaAcceso.mostrarModalSoloVip) { NikaAcceso.mostrarModalSoloVip('musica'); return; } } catch (_) {}
      setMensaje('Mi Spotify es exclusivo de NikaMed+.'); return;
    }
    desacoplarEmbed();
    vista = v; guardarUi({ vista: v }); render();
    if (v === 'spotify' && leerTokens() && !sdkCargado) { cargarSdk(); setMensaje('Conectando el reproductor...'); }
  }

  function setMensaje(m) { const el = $('#nm-msg'); if (el) { el.textContent = m || ''; el.style.display = m ? 'block' : 'none'; } }

  function render() {
    if (!panel) return;
    desacoplarEmbed(); // antes de reemplazar el HTML, el embed se pone a salvo
    const conectado = !!leerTokens();
    const cabecera = `
      <div class="nm-h"><div><b>${SPOTIFY_SVG(16)} NikaMusic <span class="nm-eq ${sonando ? 'sonando' : ''}" id="nm-hdr-eq"><i></i><i></i><i></i><i></i></span></b></div>
        <div class="nm-hb"><button type="button" id="nm-min" title="Minimizar" aria-label="Minimizar">_</button><button type="button" id="nm-x" title="Cerrar y detener la música" aria-label="Cerrar y detener la música">✕</button></div></div>
      <div class="nm-tabs"><button type="button" class="nm-tab ${vista === 'ambiente' ? 'on' : ''}" data-v="ambiente">🌿 Lofi y ambiente</button><button type="button" class="nm-tab ${vista === 'spotify' ? 'on' : ''}" data-v="spotify">${SPOTIFY_SVG(13)} Mi Spotify ${esPlus() ? '' : '<span class="nm-lock" title="Exclusivo NikaMed+">🔒 Plus</span>'}</button></div>`;

    let cuerpo;
    if (vista === 'ambiente') {
      const ambVol = Math.round(parseFloat(localStorage.getItem(K_AMB) || '0.5') * 100);
      const activa = fuente && fuente.tipo !== 'sdk';
      const esEmbed = activa && fuente.tipo === 'embed';
      const esYt = activa && fuente.tipo === 'yt';
      const esRuido = activa && fuente.tipo === 'ruido';
      const np = activa ? `
        <div class="nm-np">
          <div class="nm-np-t"><span class="nm-eq ${sonando ? 'sonando' : ''}"><i></i><i></i><i></i><i></i></span><b>${esc(fuente.nombre)}</b></div>
          <div class="nm-bigctrl">
            ${(esEmbed || esYt) ? '<button type="button" id="nm-embprev" class="med" title="Playlist anterior" aria-label="Playlist anterior">⏮</button>' : ''}
            <button type="button" id="nm-npplay" class="grande" title="Reproducir / pausar" aria-label="Reproducir o pausar">${sonando ? '⏸' : '▶'}</button>
            ${(esEmbed || esYt) ? '<button type="button" id="nm-embnext" class="med" title="Playlist siguiente" aria-label="Playlist siguiente">⏭</button>' : ''}
            <button type="button" id="nm-npstop" class="med" title="Detener" aria-label="Detener">⏹</button>
          </div>
          ${(esRuido || esYt) ? `<div class="nm-volrow"><button type="button" class="nm-mute" id="nm-ambmute" aria-label="Silenciar">🔈</button><input type="range" id="nm-ambvol" min="0" max="100" value="${ambVol}" aria-label="Volumen"><b id="nm-ambvol-n">${ambVol}</b></div>` : ''}
        </div>` : '';
      cuerpo = `
        ${np}
        ${esYt ? '<div id="nm-yt" class="nm-yt-slot"></div><div class="nm-yt-nota">Video oficial de YouTube · tocá ▶ para empezar</div>' : ''}
        ${esEmbed ? '<div id="nm-embed"></div>' : ''}
        <div class="nm-sec">🎶 Lofi para estudiar</div>
        <div class="nm-chips">${YT_LISTA.map((e, i) => `<button type="button" class="nm-yt-b ${esYt && fuente.nombre === e.label ? 'on' : ''}" data-i="${i}" style="--d:${i}">${e.icono} ${e.label}</button>`).join('')}</div>
        <div class="nm-sec">🌿 Sonidos de la naturaleza</div>
        <div class="nm-chips">${AMBIENTES.map((a2, i) => `<button type="button" class="nm-amb ${ambId === a2.id && sonando ? 'on' : ''}" data-id="${a2.id}" style="--d:${i}">${a2.icono} ${a2.label}</button>`).join('')}</div>`;
    } else if (!conectado) {
      cuerpo = `
        <div class="nm-conectar">Conectá tu cuenta de <b>Spotify</b> para usar tus playlists y buscar canciones.<br><small style="color:#94a3b8">Requiere Spotify Premium. Por ahora las cuentas se habilitan de a poco (beta): si no podés conectar, usá “Sin login”, que funciona para todos.</small><br>
          <button type="button" class="nm-btn-spotify" id="nm-conn">${SPOTIFY_SVG(20)} Conectar con Spotify</button>
          <div id="nm-connmsg"></div></div>
        <div class="nm-solic" id="nm-solic"><small>Revisando tu solicitud…</small></div>`;
    } else {
      const vol0 = Math.round(parseFloat(localStorage.getItem(K_VOL) || '0.5') * 100);
      cuerpo = `
        <div id="nm-msg"></div>
        <div class="nm-buscador"><input type="search" id="nm-q" placeholder="🔍 Buscar canción, artista o álbum" autocomplete="off"><div id="nm-res"></div></div>
        <div class="nm-now"><img id="nm-cover" class="nm-cover" alt=""><div class="nm-meta"><b id="nm-t">Nada sonando</b><small id="nm-a">Elegí una playlist o buscá</small></div></div>
        <div class="nm-prog"><span id="nm-cur">0:00</span><input type="range" id="nm-seek" min="0" max="1000" value="0" aria-label="Progreso"><span id="nm-dur">0:00</span></div>
        <div class="nm-bigctrl">
          <button type="button" id="nm-prev" class="med" aria-label="Canción anterior" title="Anterior">⏮</button>
          <button type="button" id="nm-play" class="grande" aria-label="Reproducir o pausar" title="Reproducir / pausar">▶</button>
          <button type="button" id="nm-next" class="med" aria-label="Siguiente canción" title="Siguiente">⏭</button>
          <button type="button" id="nm-stop" class="med" aria-label="Quitar la canción" title="Quitar la canción que suena">⏹</button>
        </div>
        <div class="nm-volrow"><button type="button" class="nm-mute" id="nm-mute" aria-label="Silenciar">${vol0 === 0 ? '🔇' : '🔊'}</button><input type="range" id="nm-vol" min="0" max="100" value="${vol0}" aria-label="Volumen"><b id="nm-vol-n">${vol0}</b></div>
        <div class="nm-chips nm-scroll">${PLAYLISTS_CUENTA.map((pl, i) => `<button type="button" class="nm-pl" data-i="${i}">${pl.icono} ${pl.label}</button>`).join('')}</div>
        <button type="button" class="nm-out" id="nm-out">Desconectar Spotify</button>`;
    }
    const compartir = (() => { try { return localStorage.getItem(K_SHARE) !== '0'; } catch (_) { return true; } })();
    cuerpo += `<label class="nm-share"><input type="checkbox" id="nm-share" ${compartir ? 'checked' : ''}> Mostrar a mis amigos lo que estoy escuchando</label>`;
    panel.innerHTML = cabecera + `<div class="nm-body" tabindex="0" aria-label="Contenido de NikaMusic (usá las flechas para desplazarte)">${cuerpo}</div>`;
    const chk = $('#nm-share'); if (chk) chk.addEventListener('change', () => { try { localStorage.setItem(K_SHARE, chk.checked ? '1' : '0'); } catch (_) {} ultPub = '\u0000'; publicar(); });

    $('#nm-x').onclick = cerrarYDetener; $('#nm-min').onclick = minimizar;
    panel.querySelectorAll('.nm-tab').forEach((bt) => bt.addEventListener('click', () => cambiarVista(bt.dataset.v)));
    activarArrastre();

    if (vista === 'ambiente') {
      panel.querySelectorAll('.nm-yt-b').forEach((bt) => bt.addEventListener('click', () => {
        if (fuente && fuente.tipo === 'yt' && ytIdx === +bt.dataset.i) { alternarReproduccion(); return; }
        reproducirYt(+bt.dataset.i);
      }));
      panel.querySelectorAll('.nm-amb').forEach((bt) => bt.addEventListener('click', () => {
        if (ambId === bt.dataset.id && sonando) { detenerAmbiente(); fuente = null; sonando = false; render(); return; }
        iniciarAmbiente(bt.dataset.id); render();
      }));
      const idx = fuente && fuente.tipo === 'embed' ? EMBEDS.findIndex((e) => e.label === fuente.nombre) : -1;
      const esYt2 = fuente && fuente.tipo === 'yt';
      if ($('#nm-npplay')) $('#nm-npplay').onclick = alternarReproduccion;
      if ($('#nm-embprev')) $('#nm-embprev').onclick = () => (esYt2 ? reproducirYt(ytIdx - 1) : reproducirEmbed(EMBEDS[(idx - 1 + EMBEDS.length) % EMBEDS.length]));
      if ($('#nm-embnext')) $('#nm-embnext').onclick = () => (esYt2 ? reproducirYt(ytIdx + 1) : reproducirEmbed(EMBEDS[(idx + 1) % EMBEDS.length]));
      if ($('#nm-npstop')) $('#nm-npstop').onclick = detenerTodo;
      if ($('#nm-ambvol')) {
        $('#nm-ambvol').addEventListener('input', (e) => { const v = e.target.value / 100; localStorage.setItem(K_AMB, String(v)); if (ambAudio) ambAudio.volume = Math.min(1, v * 1.2); if (ytCtrl && fuente && fuente.tipo === 'yt') { try { ytCtrl.setVolume(Math.round(v * 100)); } catch (_) {} } if (ambGain) ambGain.gain.value = v * 0.6; $('#nm-ambvol-n').textContent = e.target.value; $('#nm-ambmute').textContent = v === 0 ? '🔇' : '🔈'; });
        let previo = 0.5;
        $('#nm-ambmute').onclick = () => {
          const r = $('#nm-ambvol'); const actual = r.value / 100;
          const nuevo = actual > 0 ? 0 : (previo || 0.5); if (actual > 0) previo = actual;
          r.value = Math.round(nuevo * 100); r.dispatchEvent(new Event('input'));
        };
      }
      if (fuente && (fuente.tipo === 'embed' || fuente.tipo === 'yt')) requestAnimationFrame(acoplarEmbed);
      panel.querySelector('.nm-body').addEventListener('scroll', acoplarEmbed);
    } else if (!conectado) {
      $('#nm-conn').onclick = conectar;
      if (solicitud === undefined) cargarSolicitud(); else pintarSolicitud();
    } else {
      $('#nm-out').onclick = desconectar;
      $('#nm-play').onclick = alternarReproduccion;
      $('#nm-prev').onclick = () => player && player.previousTrack();
      $('#nm-next').onclick = () => player && player.nextTrack();
      $('#nm-stop').onclick = quitarCancion;
      $('#nm-seek').addEventListener('change', (e) => { if (player && estado) player.seek(Math.round((e.target.value / 1000) * estado.duration)); });
      $('#nm-vol').addEventListener('input', (e) => {
        const v = e.target.value / 100; localStorage.setItem(K_VOL, String(v)); if (player) player.setVolume(v);
        $('#nm-vol-n').textContent = e.target.value; $('#nm-mute').textContent = v === 0 ? '🔇' : '🔊';
      });
      let previoS = 0.5;
      $('#nm-mute').onclick = () => {
        const r = $('#nm-vol'); const actual = r.value / 100;
        const nuevo = actual > 0 ? 0 : (previoS || 0.5); if (actual > 0) previoS = actual;
        r.value = Math.round(nuevo * 100); r.dispatchEvent(new Event('input'));
      };
      panel.querySelectorAll('.nm-pl').forEach((bt) => bt.addEventListener('click', () => playlistPorNombre(PLAYLISTS_CUENTA[bt.dataset.i].q, bt)));
      $('#nm-q').addEventListener('input', buscarDebounce);
      $('#nm-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(tBusq); buscar(); } });
      if (sdkCargado && !deviceId) setMensaje('Conectando el reproductor...');
    }
    pintarEstado();
  }

  // ---- Volumen unificado (ruido ambiente o cuenta de Spotify; el embed no expone volumen)
  function volumenSoportado() { return !!fuente && (fuente.tipo === 'ruido' || fuente.tipo === 'sdk' || fuente.tipo === 'yt'); }
  function volumenActual() {
    return fuente && fuente.tipo === 'sdk' ? parseFloat(localStorage.getItem(K_VOL) || '0.5') : parseFloat(localStorage.getItem(K_AMB) || '0.5');
  }
  function fijarVolumen(v) {
    if (!fuente) return;
    v = Math.max(0, Math.min(1, v));
    if (fuente.tipo === 'sdk') { localStorage.setItem(K_VOL, String(v)); if (player) player.setVolume(v); }
    else if (fuente.tipo === 'ruido') { localStorage.setItem(K_AMB, String(v)); if (ambAudio) ambAudio.volume = Math.min(1, v * 1.2); if (ambGain) ambGain.gain.value = v * 0.6; }
    else if (fuente.tipo === 'yt') { localStorage.setItem(K_AMB, String(v)); try { ytCtrl.setVolume(Math.round(v * 100)); } catch (_) {} }
    pintarVolumen();
  }
  function pintarVolumen() {
    const v = Math.round(volumenActual() * 100), ico = v === 0 ? '🔇' : v < 40 ? '🔈' : '🔊';
    const r = $('#nm-pill-range', pill), n = $('#nm-pill-n', pill), m = $('#nm-pill-mute', pill), b = $('#nm-pill-vol', pill);
    if (r && document.activeElement !== r) r.value = v; if (n) n.textContent = v; if (m) m.textContent = ico;
    if (b) { b.textContent = ico; b.disabled = !volumenSoportado(); b.title = volumenSoportado() ? 'Volumen' : 'El volumen de Spotify (sin login) se regula desde tu dispositivo'; }
    const pr = $('#nm-ambvol'); if (pr && document.activeElement !== pr) { pr.value = v; const nn = $('#nm-ambvol-n'); if (nn) nn.textContent = v; }
  }

  // Anterior / siguiente según la fuente: canción (cuenta), playlist (Spotify sin login) o sonido ambiente
  function saltar(delta) {
    if (!fuente) return;
    if (fuente.tipo === 'sdk') { if (player) (delta < 0 ? player.previousTrack() : player.nextTrack()); return; }
    if (fuente.tipo === 'yt') { reproducirYt(ytIdx + delta); return; }
    if (fuente.tipo === 'embed') {
      const i = EMBEDS.findIndex((e) => e.label === fuente.nombre);
      reproducirEmbed(EMBEDS[(i + delta + EMBEDS.length) % EMBEDS.length]); return;
    }
    if (fuente.tipo === 'ruido') {
      const i = AMBIENTES.findIndex((a2) => a2.id === ambId);
      iniciarAmbiente(AMBIENTES[(i + delta + AMBIENTES.length) % AMBIENTES.length].id); render();
    }
  }

  // Detiene cualquier fuente activa (botón ⏹)
  function detenerTodo() {
    detenerAmbiente();
    if (ytCtrl) { try { ytCtrl.stopVideo(); } catch (_) {} }
    if (embedCtrl) { try { embedCtrl.pause(); } catch (_) {} }
    if (player && estado && !estado.paused) { try { player.pause(); } catch (_) {} }
    fuente = null; sonando = false; embedUri = null;
    desacoplarEmbed();
    render();
  }

  function pintarEstado() {
    if (!panel) return;
    document.querySelectorAll('[data-nika-music-toggle]').forEach((el) => el.classList.toggle('nm-sonando', !!sonando));
    const eq = document.getElementById('nm-hdr-eq'); if (eq) eq.classList.toggle('sonando', !!sonando);
    pill.classList.toggle('on', minimizado && abierto && !!fuente);
    document.querySelectorAll('#nm-fab').forEach((el) => el.classList.toggle('nm-sonando', !!sonando));
    pill.classList.toggle('sonando', !!sonando);
    const t = $('#nm-pill-t', pill); if (t) t.textContent = fuente ? fuente.nombre : 'NikaMusic';
    const pp = $('#nm-pill-play', pill); if (pp) pp.textContent = sonando ? '⏸' : '▶';
    pintarVolumen();
    const np = $('#nm-npplay'); if (np) np.textContent = sonando ? '⏸' : '▶';
    const npe = panel.querySelector('.nm-np .nm-eq'); if (npe) npe.classList.toggle('sonando', !!sonando);

    if (vista === 'spotify' && $('#nm-t')) {
      $('#nm-play').textContent = (estado && !estado.paused) ? '⏸' : '▶';
      const tr = estado && estado.track_window && estado.track_window.current_track;
      if (tr) {
        $('#nm-t').textContent = tr.name; $('#nm-a').textContent = tr.artists.map((a) => a.name).join(', ');
        $('#nm-cover').src = (tr.album.images[0] && tr.album.images[0].url) || '';
        $('#nm-dur').textContent = fmt(estado.duration); avanzarProgreso(true);
      }
    }
    acoplarYt();
    guardarSesion(); publicar();
  }

  function avanzarProgreso(reset) {
    if (!estado || !$('#nm-seek')) return;
    if (reset === true) baseTs = Date.now();
    const pos = estado.position + (estado.paused ? 0 : Date.now() - baseTs), p = Math.min(pos, estado.duration);
    $('#nm-cur').textContent = fmt(p);
    const seek = $('#nm-seek'); if (document.activeElement !== seek) seek.value = estado.duration ? Math.round((p / estado.duration) * 1000) : 0;
  }

  // ---- Cartel al iniciar un Pomodoro: "¿Querés acompañarlo con música relajante?" ----
  function cartelPomodoro() {
    if (document.getElementById('nm-ask')) return;
    try { if (localStorage.getItem(K_ASK) === 'nunca') return; } catch (_) {}
    if (fuente && sonando) return;   // ya hay música: no molestar
    const ov = document.createElement('div'); ov.id = 'nm-ask'; ov.className = 'nm-ask';
    ov.innerHTML = `<div class="nm-ask-c" role="dialog" aria-modal="true" aria-label="Música para tu Pomodoro">
      <div class="nm-ask-h"><span class="e">🎧</span><h3>¿Querés acompañar el Pomodoro con música relajante?</h3><p>Elegí algo suave para concentrarte. Podés cambiarlo cuando quieras en NikaMusic.</p></div>
      <div class="nm-ask-b">
        <h4>🎶 Lofi</h4><div class="nm-chips">${YT_LISTA.map((e, i) => `<button type="button" class="nm-yt-b" data-yt="${i}" style="--d:${i}">${e.icono} ${e.label}</button>`).join('')}</div>
        <h4>🌿 Sonidos de la naturaleza</h4><div class="nm-chips">${AMBIENTES.map((a2, i) => `<button type="button" class="nm-amb nm-yt-b" data-amb="${a2.id}" style="--d:${i}">${a2.icono} ${a2.label}</button>`).join('')}</div>
        <div class="nm-ask-f"><label><input type="checkbox" id="nm-ask-never"> No volver a preguntar</label><button type="button" class="nm-ask-no" id="nm-ask-no">No, gracias</button></div>
      </div></div>`;
    const cerrarAsk = () => {
      const nunca = ov.querySelector('#nm-ask-never'); if (nunca && nunca.checked) { try { localStorage.setItem(K_ASK, 'nunca'); } catch (_) {} }
      ov.remove();
    };
    ov.addEventListener('click', (e) => {
      if (e.target === ov || e.target.closest('#nm-ask-no')) return cerrarAsk();
      const y = e.target.closest('[data-yt]'), a = e.target.closest('[data-amb]');
      if (y) { cerrarAsk(); minimizarAlElegir(() => reproducirYt(+y.dataset.yt)); }
      else if (a) { cerrarAsk(); minimizarAlElegir(() => { iniciarAmbiente(a.dataset.amb); render(); }); }
    });
    document.addEventListener('keydown', function esc(e) { if (!document.getElementById('nm-ask')) { document.removeEventListener('keydown', esc); return; } if (e.key === 'Escape') cerrarAsk(); });
    document.body.appendChild(ov);
  }
  // Al elegir desde el cartel, la música suena y queda la píldora (no se tapa la pantalla de estudio)
  function minimizarAlElegir(fn) { try { fn(); } catch (_) {} abierto = true; minimizado = true; panel.classList.add('oculto'); pintarEstado(); acoplarYt(); }

  function vigilarPomodoro() {
    const E = window.PomodoroEngine;
    if (!E || !E.on) { setTimeout(vigilarPomodoro, 800); return; }
    let previo = E.getState().status;
    const revisar = () => {
      const st = E.getState();
      const arranco = previo === 'idle' && st.status === 'running' && st.mode === 'work';
      previo = st.status;
      if (arranco) setTimeout(cartelPomodoro, 350);
    };
    E.on('change', revisar);
    E.on('tick', revisar);
    setInterval(revisar, 700);   // algunos cambios de estado no emiten evento (reinicio silencioso)
  }

  function init() {
    if (!SPOTIFY_CLIENT_ID) console.info('[NikaMusic] Para activar “Conectar con Spotify” definí el Client ID (window.NIKA_SPOTIFY_CLIENT_ID, <meta name="spotify-client-id"> o CLIENT_ID_FIJO) y registrá ' + location.origin + '/spotify-callback.html como Redirect URI en developer.spotify.com.');
    construir();
    decorarBotones();
    restaurarSesion();
    iniciarSondeoExterno();
    vigilarPomodoro();
    setInterval(() => { if (sonando && sesionLista) guardarSesion(); }, 2000);   // la posición queda guardada para la próxima página
    // Si la música de tu cuenta estaba sonando al cambiar de página, el reproductor se reconecta y la retoma
    if (leerTokens() && localStorage.getItem(K_ACTIVA) === '1') cargarSdk();
    setTimeout(avisoAdminSpotify, 2500);
  }
  // El reproductor no hace falta para el primer pintado: se arma cuando el navegador está libre (o al primer uso).
  let iniciado = false;
  function asegurar() { if (iniciado) return; iniciado = true; init(); }
  function programar() {
    if ('requestIdleCallback' in window) requestIdleCallback(asegurar, { timeout: 2500 }); else setTimeout(asegurar, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', programar); else programar();
  const usa = (f) => function () { asegurar(); return f.apply(this, arguments); };

  return { abrir: usa(abrir), cerrar: usa(cerrar), minimizar: usa(minimizar), alternar: usa(() => (abierto && !minimizado ? cerrar() : abrir())), duck: usa(duck), conectar: usa(conectar), desconectar: usa(desconectar), sugerirMusica: usa(cartelPomodoro) };
})();

window.NikaMusic = NikaMusic;
