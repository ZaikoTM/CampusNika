// js/voiceManager.js
// CAMPUS NIKA — Sala de Ateneos: audio/video/pantalla P2P con WebRTC (2 a 4 personas, malla completa)
//
//  • Medios: RTCPeerConnection nativo entre cada par de participantes (sin servidor de medios).
//  • Señalización: Supabase Realtime (Broadcast) con los eventos  join · offer · answer · ice-candidate · leave.
//    Presence se usa para descubrir a los presentes y compartir estado (mute, cámara, pantalla).
//  • ICE: solo STUN público gratuito de Google. Con NAT simétrico o redes corporativas muy restrictivas
//    puede no conectar (haría falta un servidor TURN); para la mayoría de redes domésticas y de datos funciona.
//  • "Negociación perfecta" (perfect negotiation): permite activar cámara/pantalla en cualquier momento sin
//    colisiones de ofertas.
//  • VAD: detección de voz con AnalyserNode (halo verde) y latencia real desde getStats().

const VoiceManager = (() => {
  const ICE_CONFIG = { iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ] };
  const MAX_PARTICIPANTES = 4;
  const UMBRAL_VOZ = 0.035;          // RMS a partir del cual se considera que habla
  const RETENCION_VOZ_MS = 450;      // el halo no parpadea entre sílabas

  let sb = null, channel = null, roomId = null, yo = null, handlers = {}, silenciosa = false;
  let peers = new Map();
  let micTrack = null, camTrack = null, screenTrack = null, videoActual = null;
  let audioCtx = null, vadTimer = null, statsTimer = null, monitores = new Map();
  let latenciaMs = null;
  const expulsados = new Set();      // usernames que el anfitrión sacó de esta sala (solo en su dispositivo)

  const cliente = () => sb || (sb = (window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase)) || window.supabaseClient);
  const soportado = () => !!(window.RTCPeerConnection && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const emit = (n, ...a) => { try { handlers[n] && handlers[n](...a); } catch (e) { console.warn('[Voice] handler', n, e); } };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'p' + Math.random().toString(36).slice(2) + Date.now().toString(36));

  // ------------------------------------------------------------------ señalización
  function enviar(evento, to, data) {
    if (!channel) return;
    channel.send({ type: 'broadcast', event: evento, payload: { from: yo.id, to, data } });
  }

  function listaPeers() {
    return [...peers.values()].map((p) => ({ id: p.id, meta: p.meta, estado: p.pc.connectionState, stream: p.stream }));
  }

  // ------------------------------------------------------------------ conexiones
  function asegurarPeer(id, meta) {
    let p = peers.get(id);
    if (p) { if (meta) { p.meta = { ...p.meta, ...meta }; emit('onPeers', listaPeers()); } return p; }
    if (peers.size >= MAX_PARTICIPANTES - 1) return null; // sala llena
    if (meta && meta.username && expulsados.has(meta.username)) { enviar('kick', id, {}); return null; }

    const pc = new RTCPeerConnection(ICE_CONFIG);
    p = {
      id, meta: meta || { nombre: 'Compañero' }, pc, stream: new MediaStream(),
      polite: yo.id > id,                // el de id mayor cede ante una colisión de ofertas
      makingOffer: false, ignoreOffer: false, colaIce: [], videoSender: null,
    };
    peers.set(id, p);
    iniciarVigia();

    // Audio: mi micrófono si existe; si no, solo recibo
    if (micTrack) pc.addTrack(micTrack, new MediaStream([micTrack]));
    else pc.addTransceiver('audio', { direction: 'recvonly' });
    // Video: transceiver fijo, así cámara/pantalla se cambian con replaceTrack sin renegociar
    const tv = pc.addTransceiver('video', { direction: 'sendrecv' });
    p.videoSender = tv.sender;
    if (videoActual) tv.sender.replaceTrack(videoActual).catch(() => {});

    pc.ontrack = (e) => {
      if (!p.stream.getTracks().includes(e.track)) p.stream.addTrack(e.track);
      if (e.track.kind === 'audio') conectarAudio(p);
      e.track.onended = () => { try { p.stream.removeTrack(e.track); } catch (_) {} emit('onPeers', listaPeers()); };
      monitorizar(p.id, p.stream);
      emit('onStream', p.id, p.stream);
      emit('onPeers', listaPeers());
    };
    pc.onicecandidate = (e) => { if (e.candidate) enviar('ice-candidate', id, e.candidate.toJSON()); };
    pc.onnegotiationneeded = async () => {
      try {
        p.makingOffer = true;
        await pc.setLocalDescription();
        enviar('offer', id, pc.localDescription);
      } catch (err) { console.warn('[Voice] oferta', err); } finally { p.makingOffer = false; }
    };
    pc.onconnectionstatechange = () => {
      emit('onPeers', listaPeers());
      if (pc.connectionState === 'failed') { try { pc.restartIce(); } catch (_) {} }
      // una caída momentánea de red: se da unos segundos y, si no vuelve sola, se reinicia el camino de medios
      if (pc.connectionState === 'disconnected') {
        clearTimeout(p.tCaida);
        p.tCaida = setTimeout(() => { if (pc.connectionState === 'disconnected') { try { pc.restartIce(); } catch (_) {} } }, 4000);
      }
    };
    emit('onPeers', listaPeers());
    return p;
  }

  async function alRecibirDescripcion(from, desc) {
    const p = asegurarPeer(from);
    if (!p) return;
    const pc = p.pc;
    const colision = desc.type === 'offer' && (p.makingOffer || pc.signalingState !== 'stable');
    p.ignoreOffer = !p.polite && colision;
    if (p.ignoreOffer) return;
    try {
      await pc.setRemoteDescription(desc);
      while (p.colaIce.length) { try { await pc.addIceCandidate(p.colaIce.shift()); } catch (_) {} }
      if (desc.type === 'offer') {
        await pc.setLocalDescription();
        enviar('answer', from, pc.localDescription);
      }
    } catch (err) { console.warn('[Voice] descripción', err); }
  }

  async function alRecibirIce(from, cand) {
    const p = asegurarPeer(from);
    if (!p) return;
    if (!p.pc.remoteDescription) { p.colaIce.push(cand); return; }
    try { await p.pc.addIceCandidate(cand); } catch (err) { if (!p.ignoreOffer) console.warn('[Voice] ice', err); }
  }

  // Audio remoto: un <audio> oculto por compañero. Así el sonido no depende del mosaico de video (que se mueve,
  // se oculta o cambia de pista cuando alguien prende la cámara), y se reintenta si el navegador lo frena.
  function conectarAudio(p) {
    try {
      if (!p.audioEl) {
        const a = document.createElement('audio');
        a.autoplay = true; a.playsInline = true; a.setAttribute('playsinline', ''); a.style.display = 'none';
        document.body.appendChild(a); p.audioEl = a;
      }
      const pistas = p.stream.getAudioTracks();
      p.audioEl.srcObject = new MediaStream(pistas);
      const r = p.audioEl.play();
      if (r && r.catch) r.catch(() => { audioBloqueado = true; if (cbAudio) cbAudio(true); });
    } catch (err) { console.warn('[Voice] audio remoto', err); }
  }
  let audioBloqueado = false, vigiaAudio = null, cbAudio = null;
  function reanudarAudio() {
    try { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (_) {}
    peers.forEach((p) => {
      if (!p.audioEl) return;
      if (p.audioEl.paused || !p.audioEl.srcObject) { const r = p.audioEl.play(); if (r && r.catch) r.catch(() => {}); }
      p.audioEl.muted = false; p.audioEl.volume = 1;
    });
    if (audioBloqueado) { audioBloqueado = false; if (cbAudio) cbAudio(false); }
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, reanudarAudio, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) reanudarAudio(); });
  function iniciarVigia() {
    if (vigiaAudio) return;
    vigiaAudio = setInterval(() => {
      peers.forEach((p) => {
        const vivas = p.stream.getAudioTracks().filter((t) => t.readyState === 'live');
        if (!vivas.length) return;
        if (!p.audioEl || !p.audioEl.srcObject || p.audioEl.srcObject.getAudioTracks().length !== vivas.length) { conectarAudio(p); return; }
        if (p.audioEl.paused) { const r = p.audioEl.play(); if (r && r.catch) r.catch(() => {}); }
      });
    }, 3000);
  }

  function cerrarPeer(id) {
    const p = peers.get(id);
    if (!p) return;
    clearTimeout(p.tCaida);
    if (p.audioEl) { try { p.audioEl.pause(); p.audioEl.srcObject = null; p.audioEl.remove(); } catch (_) {} p.audioEl = null; }
    try { p.pc.close(); } catch (_) {}
    peers.delete(id);
    const m = monitores.get(id); if (m) { try { m.src.disconnect(); } catch (_) {} monitores.delete(id); emit('onSpeaking', id, false); }
    emit('onPeerLeft', id);
    emit('onPeers', listaPeers());
  }

  // ------------------------------------------------------------------ VAD + latencia
  function monitorizar(id, stream) {
    if (monitores.has(id) || !stream.getAudioTracks().length) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(stream);
      const an = audioCtx.createAnalyser(); an.fftSize = 512; src.connect(an);
      monitores.set(id, { src, an, buf: new Uint8Array(an.fftSize), hablando: false, ultimo: 0 });
    } catch (err) { console.warn('[Voice] VAD', err); }
    if (!vadTimer) vadTimer = setInterval(medirVoz, 120);
  }

  function medirVoz() {
    const ahora = Date.now();
    monitores.forEach((m, id) => {
      m.an.getByteTimeDomainData(m.buf);
      let s = 0; for (let i = 0; i < m.buf.length; i++) { const v = (m.buf[i] - 128) / 128; s += v * v; }
      const rms = Math.sqrt(s / m.buf.length);
      const silenciado = id === 'yo' && micTrack && !micTrack.enabled;
      if (rms > UMBRAL_VOZ && !silenciado) m.ultimo = ahora;
      const habla = ahora - m.ultimo < RETENCION_VOZ_MS;
      if (habla !== m.hablando) { m.hablando = habla; emit('onSpeaking', id, habla); }
    });
  }

  async function medirLatencia() {
    let suma = 0, n = 0;
    for (const p of peers.values()) {
      try {
        const stats = await p.pc.getStats();
        stats.forEach((r) => { if (r.type === 'candidate-pair' && r.state === 'succeeded' && (r.nominated || r.selected) && typeof r.currentRoundTripTime === 'number') { suma += r.currentRoundTripTime * 1000; n++; } });
      } catch (_) {}
    }
    latenciaMs = n ? Math.round(suma / n) : null;
    emit('onLatency', latenciaMs);
  }

  // ------------------------------------------------------------------ API pública
  /**
   * Entra a una sala.
   * @param {string} sala      id de la sala (canal preconfigurado o p-CODIGO)
   * @param {object} meta      { nombre, username, avatar }
   * @param {object} opts      { silenciosa, micInicial, cbs: { onPeers, onStream, onPeerLeft, onSpeaking, onLatency, onError } }
   */
  async function unirse(sala, meta, opts = {}) {
    if (!soportado()) throw new Error('Tu navegador no admite videollamadas (WebRTC).');
    if (channel) await salir();
    handlers = opts.cbs || {};
    silenciosa = !!opts.silenciosa;
    roomId = sala;
    yo = { id: uid(), meta: { ...meta, muted: false, cam: false, sharing: false, t: Date.now() } };
    expulsados.clear();

    // Micrófono (si se niega el permiso se entra como oyente)
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      micTrack = st.getAudioTracks()[0];
      micTrack.enabled = !(silenciosa || opts.micInicial === false);
      yo.meta.muted = !micTrack.enabled;
      monitorizar('yo', new MediaStream([micTrack]));
    } catch (err) {
      micTrack = null; yo.meta.muted = true; yo.meta.sinMic = true;
      emit('onError', 'No se pudo acceder al micrófono: entrás como oyente.');
    }

    const c = cliente();
    channel = c.channel('ateneo:' + sala, { config: { broadcast: { self: false }, presence: { key: yo.id } } });

    channel.on('presence', { event: 'sync' }, sincronizarPresencia);
    channel.on('presence', { event: 'leave' }, ({ key }) => { if (key !== yo.id) cerrarPeer(key); });
    channel.on('broadcast', { event: 'offer' }, ({ payload }) => { if (payload.to === yo.id) alRecibirDescripcion(payload.from, payload.data); });
    channel.on('broadcast', { event: 'answer' }, ({ payload }) => { if (payload.to === yo.id) alRecibirDescripcion(payload.from, payload.data); });
    channel.on('broadcast', { event: 'ice-candidate' }, ({ payload }) => { if (payload.to === yo.id) alRecibirIce(payload.from, payload.data); });
    channel.on('broadcast', { event: 'leave' }, ({ payload }) => cerrarPeer(payload.from));
    channel.on('broadcast', { event: 'kick' }, ({ payload }) => {
      // Solo obedece si lo manda quien YO veo como anfitrión
      if (payload.to === yo.id && payload.from === hostId()) { emit('onKicked'); salir(); }
    });
    channel.on('broadcast', { event: 'join' }, ({ payload }) => { if (payload.data) asegurarPeer(payload.from, payload.data); });

    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('No se pudo conectar con el servidor de la sala.')), 12000);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') { clearTimeout(t); resolve(); }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { clearTimeout(t); reject(new Error('Falló la conexión en tiempo real (' + status + ').')); }
      });
    }).catch(async (e) => { await salir(); throw e; });

    // Control de cupo: antes de anunciarme veo cuántos hay
    await new Promise((r) => setTimeout(r, 500));
    const presentes = Object.keys(channel.presenceState()).filter((k) => k !== yo.id).length;
    if (presentes >= MAX_PARTICIPANTES) { await salir(); throw new Error('La sala está llena (máximo ' + MAX_PARTICIPANTES + ' personas).'); }

    await channel.track({ ...yo.meta, peerId: yo.id });
    enviar('join', '*', yo.meta);
    sincronizarPresencia();

    clearInterval(statsTimer); statsTimer = setInterval(medirLatencia, 3000);
    return { peerId: yo.id, silenciosa };
  }

  // Anfitrión = quien entró primero a la sala (si se va, pasa automáticamente al siguiente)
  function hostId() {
    if (!yo) return null;
    const todos = [{ id: yo.id, t: yo.meta.t }, ...[...peers.values()].map((p) => ({ id: p.id, t: p.meta && p.meta.t }))];
    todos.sort((a, b) => ((a.t || Infinity) - (b.t || Infinity)) || (a.id < b.id ? -1 : 1));
    return todos[0].id;
  }
  const soyHost = () => !!yo && hostId() === yo.id;

  // Solo el anfitrión puede expulsar. El expulsado no puede volver a entrar mientras el anfitrión siga en la sala.
  function expulsar(id) {
    if (!soyHost()) return { ok: false, motivo: 'Solo el anfitrión puede expulsar participantes.' };
    const p = peers.get(id);
    if (!p) return { ok: false, motivo: 'Esa persona ya no está en la sala.' };
    if (p.meta && p.meta.username) expulsados.add(p.meta.username);
    enviar('kick', id, {});
    cerrarPeer(id);
    return { ok: true, nombre: (p.meta && p.meta.nombre) || 'Participante' };
  }

  function sincronizarPresencia() {
    if (!channel) return;
    const estado = channel.presenceState();
    Object.keys(estado).forEach((key) => {
      if (key === yo.id) return;
      const meta = estado[key][estado[key].length - 1] || {};
      asegurarPeer(key, meta);
    });
    // Quien ya no figura en Presence se da por desconectado
    [...peers.keys()].forEach((id) => { if (!estado[id]) cerrarPeer(id); });
    emit('onPeers', listaPeers());
  }

  async function actualizarMeta(cambios) {
    yo.meta = { ...yo.meta, ...cambios };
    if (channel) { try { await channel.track({ ...yo.meta, peerId: yo.id }); } catch (_) {} }
    emit('onSelf', { ...yo.meta });
  }

  function alternarMic() {
    if (silenciosa) return { ok: false, motivo: 'silenciosa' };
    if (!micTrack) return { ok: false, motivo: 'sinmic' };
    micTrack.enabled = !micTrack.enabled;
    actualizarMeta({ muted: !micTrack.enabled });
    return { ok: true, muted: !micTrack.enabled };
  }

  function poner(track) {
    videoActual = track || null;
    peers.forEach((p) => { if (p.videoSender) p.videoSender.replaceTrack(videoActual).catch(() => {}); });
    emit('onLocalVideo', videoActual ? new MediaStream([videoActual]) : null);
  }

  async function alternarCamara() {
    if (camTrack) {
      camTrack.stop(); camTrack = null;
      poner(screenTrack);
      await actualizarMeta({ cam: false });
      return { ok: true, activa: false };
    }
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } } });
      camTrack = st.getVideoTracks()[0];
      camTrack.onended = () => { if (camTrack) alternarCamara(); };
      if (!screenTrack) poner(camTrack);
      await actualizarMeta({ cam: true });
      return { ok: true, activa: true };
    } catch (err) { return { ok: false, motivo: 'No se pudo abrir la cámara: ' + (err.message || err) }; }
  }

  async function alternarPantalla() {
    if (screenTrack) { detenerPantalla(); return { ok: true, activa: false }; }
    try {
      const st = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 15 } }, audio: false });
      screenTrack = st.getVideoTracks()[0];
      screenTrack.onended = detenerPantalla;
      poner(screenTrack);
      await actualizarMeta({ sharing: true });
      return { ok: true, activa: true };
    } catch (err) { return { ok: false, motivo: err && err.name === 'NotAllowedError' ? 'Cancelaste el uso compartido de pantalla.' : 'No se pudo compartir la pantalla.' }; }
  }
  function detenerPantalla() {
    if (!screenTrack) return;
    try { screenTrack.stop(); } catch (_) {}
    screenTrack = null;
    poner(camTrack);
    actualizarMeta({ sharing: false });
    emit('onScreenEnded');
  }

  async function salir() {
    try { if (channel) { enviar('leave', '*', null); await channel.untrack(); await cliente().removeChannel(channel); } } catch (_) {}
    channel = null;
    [...peers.keys()].forEach((id) => { const p = peers.get(id); try { p.pc.close(); } catch (_) {} });
    peers.clear();
    [micTrack, camTrack, screenTrack].forEach((t) => { try { t && t.stop(); } catch (_) {} });
    micTrack = camTrack = screenTrack = videoActual = null;
    clearInterval(vadTimer); vadTimer = null; clearInterval(statsTimer); statsTimer = null;
    monitores.forEach((m) => { try { m.src.disconnect(); } catch (_) {} }); monitores.clear();
    try { if (audioCtx) audioCtx.close(); } catch (_) {}
    audioCtx = null; latenciaMs = null; roomId = null;
    emit('onPeers', []);
  }

  window.addEventListener('pagehide', () => { if (channel) { try { enviar('leave', '*', null); } catch (_) {} } });

  return {
    soportado, unirse, salir, alternarMic, alternarCamara, alternarPantalla, expulsar, hostId, soyHost,
    reanudarAudio, alBloqueoAudio(fn) { cbAudio = fn; },
    get sala() { return roomId; }, get yo() { return yo; }, get silenciosa() { return silenciosa; },
    get micActivo() { return !!(micTrack && micTrack.enabled); },
    get camActiva() { return !!camTrack; }, get pantallaActiva() { return !!screenTrack; },
    get latencia() { return latenciaMs; }, get peers() { return listaPeers(); },
    MAX_PARTICIPANTES,
  };
})();

window.VoiceManager = VoiceManager;
