// js/nikaMusic.js
// CAMPUS NIKA — NikaMusic: reproductor flotante para estudiar (campus y sala de estudio)
//
//  • "Sin login" (por defecto): playlists de concentración con el Embed oficial de Spotify y sonidos
//    ambientales generados en el navegador (ruido blanco/marrón, lluvia, cafetería). Suena con un clic.
//  • "Mi Spotify": conexión opcional de la cuenta (OAuth PKCE + Web Playback SDK, requiere Premium).
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

  // Playlists oficiales de Spotify para el Embed (sin login)
  const EMBEDS = [
    { id: '37i9dQZF1DWWQRwui0ExPn', icono: '🎧', label: 'Lofi Beats' },
    { id: '37i9dQZF1DWZeKCadgRdKQ', icono: '🧠', label: 'Deep Focus' },
    { id: '37i9dQZF1DWXLeA8Omikj7', icono: '🍎', label: 'Brain Food' },
    { id: '37i9dQZF1DWWEJlAGA9gs0', icono: '🎻', label: 'Clásica para estudiar' },
    { id: '37i9dQZF1DX4sWSpwq3LiO', icono: '🎹', label: 'Peaceful Piano' },
  ];
  const AMBIENTES = [
    { id: 'blanco', icono: '🌫️', label: 'Ruido blanco' },
    { id: 'marron', icono: '🌊', label: 'Ruido marrón' },
    { id: 'lluvia', icono: '🌧️', label: 'Lluvia' },
    { id: 'cafe', icono: '☕', label: 'Cafetería' },
  ];
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
  // Spotify SDK
  let player = null, deviceId = null, estado = null, tick = null, sdkCargado = false, baseTs = 0, duckTimer = null;
  // Embed
  let embedCtrl = null, embedApi = null, embedUri = null;
  // Ambiente
  let actx = null, master = null, ambNodos = [], ambTimers = [], ambId = null, ambGain = null;

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
      if (r.status === 403 && /register|whitelist|not.*allowed|user.*not/i.test(String(msg))) throw new Error('Tu cuenta de Spotify todavía no está habilitada en Campus Nika (beta). Escuchá desde “Sin login”, que funciona para todos.');
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
      localStorage.setItem(K_ACTIVA, suena ? '1' : '0');
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
    } catch (err) { setMensaje(err.message || 'No se pudo reproducir.'); }
  }

  async function playlistPorNombre(q, btnEl) {
    if (btnEl) btnEl.classList.add('cargando');
    try {
      const r = await api('/search?type=playlist&limit=5&q=' + encodeURIComponent(q));
      const pl = ((r && r.playlists && r.playlists.items) || []).find(Boolean);
      if (!pl) { setMensaje('No se encontró esa playlist.'); return; }
      await reproducirSdk({ context_uri: pl.uri });
    } catch (err) { setMensaje(err.message); } finally { if (btnEl) btnEl.classList.remove('cargando'); }
  }

  let tBusq = null;
  function buscarDebounce() { clearTimeout(tBusq); tBusq = setTimeout(buscar, 350); }
  async function buscar() {
    const q = $('#nm-q').value.trim(), cont = $('#nm-res');
    if (q.length < 2) { cont.innerHTML = ''; return; }
    cont.innerHTML = '<div class="nm-vacio">Buscando...</div>';
    try {
      const r = await api('/search?type=track,album&limit=6&q=' + encodeURIComponent(q));
      const fila = (uri, img, t1, t2, alb) => `<button type="button" class="nm-item" data-uri="${esc(uri)}" data-album="${alb ? 1 : 0}"><img src="${esc(img || '')}" alt=""><span><b>${esc(t1)}</b><small>${alb ? '💿 ' : ''}${esc(t2)}</small></span></button>`;
      cont.innerHTML = [
        ...((r.tracks && r.tracks.items) || []).map((t) => fila(t.uri, t.album.images.slice(-1)[0]?.url, t.name, t.artists.map((a) => a.name).join(', '), false)),
        ...((r.albums && r.albums.items) || []).map((a) => fila(a.uri, a.images.slice(-1)[0]?.url, a.name, a.artists.map((x) => x.name).join(', '), true)),
      ].join('') || '<div class="nm-vacio">Sin resultados.</div>';
      cont.querySelectorAll('.nm-item').forEach((b) => b.addEventListener('click', () => reproducirSdk(b.dataset.album === '1' ? { context_uri: b.dataset.uri } : { uris: [b.dataset.uri] })));
    } catch (err) { cont.innerHTML = `<div class="nm-vacio">${esc(err.message)}</div>`; }
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
    slot.style.display = 'block';
    const r = slot.getBoundingClientRect();
    host.style.left = r.left + 'px'; host.style.top = r.top + 'px'; host.style.width = r.width + 'px';
    host.style.opacity = '1'; host.style.pointerEvents = 'auto';
  }
  function desacoplarEmbed() {
    const host = document.getElementById('nm-embed-persist'); if (!host) return;
    host.style.left = '-9999px'; host.style.top = '0px'; host.style.opacity = '0'; host.style.pointerEvents = 'none';
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
  }

  function iniciarAmbiente(id) {
    detenerOtros('ruido');
    detenerAmbiente();
    const c = audioCtx();
    if (c.state === 'suspended') c.resume();
    const g = c.createGain(); g.gain.value = parseFloat(localStorage.getItem(K_AMB) || '0.5') * 0.6; g.connect(master);
    ambNodos.push(g); ambGain = g; ambId = id;

    if (id === 'blanco') { const s = fuenteRuido('blanco'); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 9000; s.connect(f); f.connect(g); ambNodos.push(f); }
    else if (id === 'marron') { const s = fuenteRuido('marron'); s.connect(g); }
    else if (id === 'lluvia') {
      const s = fuenteRuido('rosa'); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000;
      s.connect(hp); hp.connect(lp); lp.connect(g); ambNodos.push(hp, lp);
      ambTimers.push(setInterval(() => { // gotas sueltas
        if (!actx || actx.state !== 'running') return;
        const o = c.createBufferSource(), bb = c.createBuffer(1, Math.floor(c.sampleRate * 0.05), c.sampleRate), dd = bb.getChannelData(0);
        for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dd.length, 3);
        o.buffer = bb; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + Math.random() * 3500; bp.Q.value = 2;
        const gg = c.createGain(); gg.gain.value = 0.25 + Math.random() * 0.35; o.connect(bp); bp.connect(gg); gg.connect(g); o.start();
      }, 70));
    } else if (id === 'cafe') {
      const s = fuenteRuido('marron'); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.6;
      const mod = c.createGain(); mod.gain.value = 0.9;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.35; const lfoG = c.createGain(); lfoG.gain.value = 0.25; lfo.connect(lfoG); lfoG.connect(mod.gain); lfo.start();
      s.connect(bp); bp.connect(mod); mod.connect(g); ambNodos.push(bp, mod, lfo, lfoG);
      [[700, 0.4], [1200, 0.3], [2300, 0.18]].forEach(([fq, gain], i) => { // murmullo de voces
        const sv = fuenteRuido('rosa'); const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 3;
        const vg = c.createGain(); vg.gain.value = gain * 0.35;
        const l2 = c.createOscillator(); l2.frequency.value = 0.6 + i * 0.37; const l2g = c.createGain(); l2g.gain.value = gain * 0.3; l2.connect(l2g); l2g.connect(vg.gain); l2.start();
        sv.connect(f); f.connect(vg); vg.connect(g); ambNodos.push(f, vg, l2, l2g);
      });
      const tintin = () => { // tintineo ocasional de tazas
        if (!actx || ambId !== 'cafe') return;
        if (actx.state === 'running') {
          const o = c.createOscillator(), gg = c.createGain(); o.type = 'sine'; o.frequency.value = 2200 + Math.random() * 1400;
          gg.gain.setValueAtTime(0.0001, c.currentTime); gg.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35);
          o.connect(gg); gg.connect(g); o.start(); o.stop(c.currentTime + 0.4);
        }
        ambTimers.push(setTimeout(tintin, 4000 + Math.random() * 6000));
      };
      ambTimers.push(setTimeout(tintin, 2500));
    }
    fuente = { tipo: 'ruido', nombre: AMBIENTES.find((x) => x.id === id).label };
    sonando = true;
  }

  function pausarAmbiente() { if (actx && actx.state === 'running') actx.suspend(); sonando = false; pintarEstado(); }
  function reanudarAmbiente() { if (actx) actx.resume(); sonando = true; pintarEstado(); }

  // Solo suena una fuente a la vez
  function detenerOtros(mantener) {
    if (mantener !== 'ruido' && ambId) detenerAmbiente();
    if (mantener !== 'embed' && embedCtrl) { try { embedCtrl.pause(); } catch (_) {} }
    if (mantener !== 'sdk' && player && estado && !estado.paused) { try { player.pause(); } catch (_) {} }
  }

  // Play/Pause (píldora y paneles) según la fuente activa
  async function alternarReproduccion() {
    if (!fuente) return;
    if (fuente.tipo === 'ruido') { if (sonando) pausarAmbiente(); else reanudarAmbiente(); }
    else if (fuente.tipo === 'embed') { try { embedCtrl && embedCtrl.togglePlay(); } catch (_) {} }
    else if (fuente.tipo === 'sdk') { try { if (player.activateElement) await player.activateElement(); await player.togglePlay(); } catch (_) {} }
  }

  // Las alertas del campus bajan la música un momento (nunca la pausan ni se tapan)
  function duck(ms) {
    if (master && actx && sonando && fuente && fuente.tipo === 'ruido') {
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

      #nm-embed-persist { position: fixed; left: -9999px; top: 0; width: 300px; z-index: 9993; opacity: 0; pointer-events: none; border-radius: 12px; overflow: hidden; }

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
      #nm-res { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; max-height: 170px; overflow-y: auto; }
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
    pill.innerHTML = `<span class="nm-eq"><i></i><i></i><i></i><i></i></span><span id="nm-pill-t" title="Abrir NikaMusic">NikaMusic</span>
      <div class="nm-pill-ctrl">
        <button type="button" id="nm-pill-prev" aria-label="Anterior" title="Anterior">⏮</button>
        <button type="button" id="nm-pill-play" aria-label="Reproducir o pausar" title="Reproducir / pausar">▶</button>
        <button type="button" id="nm-pill-next" aria-label="Siguiente" title="Siguiente">⏭</button>
        <button type="button" id="nm-pill-vol" aria-label="Volumen" title="Volumen">🔊</button>
        <button type="button" id="nm-pill-x" aria-label="Ampliar" title="Ampliar">⤢</button>
      </div>
      <div id="nm-pill-volbox"><button type="button" id="nm-pill-mute" aria-label="Silenciar">🔊</button><input type="range" id="nm-pill-range" min="0" max="100" value="50" aria-label="Volumen"><b id="nm-pill-n">50</b></div>`;
    document.body.appendChild(panel); document.body.appendChild(pill);
    $('#nm-pill-play', pill).onclick = (e) => { e.stopPropagation(); alternarReproduccion(); };
    $('#nm-pill-prev', pill).onclick = (e) => { e.stopPropagation(); saltar(-1); };
    $('#nm-pill-next', pill).onclick = (e) => { e.stopPropagation(); saltar(1); };
    $('#nm-pill-x', pill).onclick = () => abrir();
    $('#nm-pill-t', pill).onclick = () => abrir();
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
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto && !minimizado) cerrar(); });
    window.addEventListener('nika:alerta-sonido', () => duck(2600));
    window.addEventListener('resize', () => { acomodarPosicion(); acoplarEmbed(); });

    const u = ui();
    vista = u.vista === 'spotify' && leerTokens() ? 'spotify' : 'ambiente';
    render();
    posicionInicial();
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

  function cambiarVista(v) {
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
        <div class="nm-hb"><button type="button" id="nm-min" title="Minimizar" aria-label="Minimizar">_</button><button type="button" id="nm-x" title="Cerrar (la música sigue)" aria-label="Cerrar">✕</button></div></div>
      <div class="nm-tabs"><button type="button" class="nm-tab ${vista === 'ambiente' ? 'on' : ''}" data-v="ambiente">🌿 Sin login</button><button type="button" class="nm-tab ${vista === 'spotify' ? 'on' : ''}" data-v="spotify">${SPOTIFY_SVG(13)} Mi Spotify</button></div>`;

    let cuerpo;
    if (vista === 'ambiente') {
      const ambVol = Math.round(parseFloat(localStorage.getItem(K_AMB) || '0.5') * 100);
      const activa = fuente && fuente.tipo !== 'sdk';
      const esEmbed = activa && fuente.tipo === 'embed';
      const esRuido = activa && fuente.tipo === 'ruido';
      const np = activa ? `
        <div class="nm-np">
          <div class="nm-np-t"><span class="nm-eq ${sonando ? 'sonando' : ''}"><i></i><i></i><i></i><i></i></span><b>${esc(fuente.nombre)}</b></div>
          <div class="nm-bigctrl">
            ${esEmbed ? '<button type="button" id="nm-embprev" class="med" title="Playlist anterior" aria-label="Playlist anterior">⏮</button>' : ''}
            <button type="button" id="nm-npplay" class="grande" title="Reproducir / pausar" aria-label="Reproducir o pausar">${sonando ? '⏸' : '▶'}</button>
            ${esEmbed ? '<button type="button" id="nm-embnext" class="med" title="Playlist siguiente" aria-label="Playlist siguiente">⏭</button>' : ''}
            <button type="button" id="nm-npstop" class="med" title="Detener" aria-label="Detener">⏹</button>
          </div>
          ${esRuido ? `<div class="nm-volrow"><button type="button" class="nm-mute" id="nm-ambmute" aria-label="Silenciar">🔈</button><input type="range" id="nm-ambvol" min="0" max="100" value="${ambVol}" aria-label="Volumen"><b id="nm-ambvol-n">${ambVol}</b></div>` : ''}
        </div>` : '';
      cuerpo = `
        ${np}
        ${esEmbed ? '<div id="nm-embed"></div>' : ''}
        <div class="nm-sec">Playlists</div>
        <div class="nm-chips">${EMBEDS.map((e, i) => `<button type="button" class="nm-emb ${esEmbed && fuente.nombre === e.label ? 'on' : ''}" data-i="${i}">${e.icono} ${e.label}</button>`).join('')}</div>
        <div class="nm-sec">Ambiente</div>
        <div class="nm-chips">${AMBIENTES.map((a2) => `<button type="button" class="nm-amb ${ambId === a2.id && sonando ? 'on' : ''}" data-id="${a2.id}">${a2.icono} ${a2.label}</button>`).join('')}</div>`;
    } else if (!conectado) {
      cuerpo = `
        <div class="nm-conectar">Conectá tu cuenta de <b>Spotify</b> para usar tus playlists y buscar canciones.<br><small style="color:#94a3b8">Requiere Spotify Premium. Por ahora las cuentas se habilitan de a poco (beta): si no podés conectar, usá “Sin login”, que funciona para todos.</small><br>
          <button type="button" class="nm-btn-spotify" id="nm-conn">${SPOTIFY_SVG(20)} Conectar con Spotify</button>
          <div id="nm-connmsg"></div></div>`;
    } else {
      const vol0 = Math.round(parseFloat(localStorage.getItem(K_VOL) || '0.5') * 100);
      cuerpo = `
        <div id="nm-msg"></div>
        <div class="nm-now"><img id="nm-cover" class="nm-cover" alt=""><div class="nm-meta"><b id="nm-t">Nada sonando</b><small id="nm-a">Elegí una playlist o buscá</small></div></div>
        <div class="nm-prog"><span id="nm-cur">0:00</span><input type="range" id="nm-seek" min="0" max="1000" value="0" aria-label="Progreso"><span id="nm-dur">0:00</span></div>
        <div class="nm-bigctrl">
          <button type="button" id="nm-prev" class="med" aria-label="Canción anterior" title="Anterior">⏮</button>
          <button type="button" id="nm-play" class="grande" aria-label="Reproducir o pausar" title="Reproducir / pausar">▶</button>
          <button type="button" id="nm-next" class="med" aria-label="Siguiente canción" title="Siguiente">⏭</button>
        </div>
        <div class="nm-volrow"><button type="button" class="nm-mute" id="nm-mute" aria-label="Silenciar">${vol0 === 0 ? '🔇' : '🔊'}</button><input type="range" id="nm-vol" min="0" max="100" value="${vol0}" aria-label="Volumen"><b id="nm-vol-n">${vol0}</b></div>
        <div class="nm-chips nm-scroll">${PLAYLISTS_CUENTA.map((pl, i) => `<button type="button" class="nm-pl" data-i="${i}">${pl.icono} ${pl.label}</button>`).join('')}</div>
        <input type="search" id="nm-q" placeholder="🔍 Buscar canción o álbum" autocomplete="off"><div id="nm-res"></div>
        <button type="button" class="nm-out" id="nm-out">Desconectar Spotify</button>`;
    }
    panel.innerHTML = cabecera + `<div class="nm-body">${cuerpo}</div>`;

    $('#nm-x').onclick = cerrar; $('#nm-min').onclick = minimizar;
    panel.querySelectorAll('.nm-tab').forEach((bt) => bt.addEventListener('click', () => cambiarVista(bt.dataset.v)));
    activarArrastre();

    if (vista === 'ambiente') {
      panel.querySelectorAll('.nm-emb').forEach((bt) => bt.addEventListener('click', () => reproducirEmbed(EMBEDS[bt.dataset.i])));
      panel.querySelectorAll('.nm-amb').forEach((bt) => bt.addEventListener('click', () => {
        if (ambId === bt.dataset.id && sonando) { detenerAmbiente(); fuente = null; sonando = false; render(); return; }
        iniciarAmbiente(bt.dataset.id); render();
      }));
      const idx = fuente && fuente.tipo === 'embed' ? EMBEDS.findIndex((e) => e.label === fuente.nombre) : -1;
      if ($('#nm-npplay')) $('#nm-npplay').onclick = alternarReproduccion;
      if ($('#nm-embprev')) $('#nm-embprev').onclick = () => reproducirEmbed(EMBEDS[(idx - 1 + EMBEDS.length) % EMBEDS.length]);
      if ($('#nm-embnext')) $('#nm-embnext').onclick = () => reproducirEmbed(EMBEDS[(idx + 1) % EMBEDS.length]);
      if ($('#nm-npstop')) $('#nm-npstop').onclick = detenerTodo;
      if ($('#nm-ambvol')) {
        $('#nm-ambvol').addEventListener('input', (e) => { const v = e.target.value / 100; localStorage.setItem(K_AMB, String(v)); if (ambGain) ambGain.gain.value = v * 0.6; $('#nm-ambvol-n').textContent = e.target.value; $('#nm-ambmute').textContent = v === 0 ? '🔇' : '🔈'; });
        let previo = 0.5;
        $('#nm-ambmute').onclick = () => {
          const r = $('#nm-ambvol'); const actual = r.value / 100;
          const nuevo = actual > 0 ? 0 : (previo || 0.5); if (actual > 0) previo = actual;
          r.value = Math.round(nuevo * 100); r.dispatchEvent(new Event('input'));
        };
      }
      if (fuente && fuente.tipo === 'embed') requestAnimationFrame(acoplarEmbed);
      panel.querySelector('.nm-body').addEventListener('scroll', acoplarEmbed);
    } else if (!conectado) {
      $('#nm-conn').onclick = conectar;
    } else {
      $('#nm-out').onclick = desconectar;
      $('#nm-play').onclick = alternarReproduccion;
      $('#nm-prev').onclick = () => player && player.previousTrack();
      $('#nm-next').onclick = () => player && player.nextTrack();
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
      if (sdkCargado && !deviceId) setMensaje('Conectando el reproductor...');
    }
    pintarEstado();
  }

  // ---- Volumen unificado (ruido ambiente o cuenta de Spotify; el embed no expone volumen)
  function volumenSoportado() { return !!fuente && (fuente.tipo === 'ruido' || fuente.tipo === 'sdk'); }
  function volumenActual() {
    return fuente && fuente.tipo === 'sdk' ? parseFloat(localStorage.getItem(K_VOL) || '0.5') : parseFloat(localStorage.getItem(K_AMB) || '0.5');
  }
  function fijarVolumen(v) {
    if (!fuente) return;
    v = Math.max(0, Math.min(1, v));
    if (fuente.tipo === 'sdk') { localStorage.setItem(K_VOL, String(v)); if (player) player.setVolume(v); }
    else if (fuente.tipo === 'ruido') { localStorage.setItem(K_AMB, String(v)); if (ambGain) ambGain.gain.value = v * 0.6; }
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
  }

  function avanzarProgreso(reset) {
    if (!estado || !$('#nm-seek')) return;
    if (reset === true) baseTs = Date.now();
    const pos = estado.position + (estado.paused ? 0 : Date.now() - baseTs), p = Math.min(pos, estado.duration);
    $('#nm-cur').textContent = fmt(p);
    const seek = $('#nm-seek'); if (document.activeElement !== seek) seek.value = estado.duration ? Math.round((p / estado.duration) * 1000) : 0;
  }

  function init() {
    if (!SPOTIFY_CLIENT_ID) console.info('[NikaMusic] Para activar “Conectar con Spotify” definí el Client ID (window.NIKA_SPOTIFY_CLIENT_ID, <meta name="spotify-client-id"> o CLIENT_ID_FIJO) y registrá ' + location.origin + '/spotify-callback.html como Redirect URI en developer.spotify.com.');
    construir();
    // Si la música de tu cuenta estaba sonando al cambiar de página, el reproductor se reconecta y la retoma
    if (leerTokens() && localStorage.getItem(K_ACTIVA) === '1') cargarSdk();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { abrir, cerrar, minimizar, alternar: () => (abierto && !minimizado ? cerrar() : abrir()), duck, conectar, desconectar };
})();

window.NikaMusic = NikaMusic;
