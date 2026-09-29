// js/ateneos.js
// CAMPUS NIKA — Sala de Ateneos: interfaz (canales, salas privadas, dock estilo Discord y ventana de video flotante)
// Motor de medios y señalización: js/voiceManager.js (WebRTC + Supabase Realtime).
//
// El dock y la ventana de video son independientes de la sección: siguen visibles mientras se navega por el
// campus. Al cambiar a otra página (p. ej. de campus.html a estudio.html) la llamada se reconecta sola.

const NikaAteneos = (() => {
  const CANALES = [
    { id: 'general', icono: '🏥', nombre: 'Ateneo General & Discusión de Casos', desc: 'Debate clínico grupal abierto: presentá un caso, discutan diagnósticos diferenciales y conductas.', silenciosa: false, color: '#0ea5e9' },
    { id: 'silenciosa', icono: '🤫', nombre: 'Guardia Silenciosa (Pomodoro Co-Working)', desc: 'Micrófonos silenciados: estudiar juntos, con cámara opcional, cada uno en lo suyo y acompañados.', silenciosa: true, color: '#8b5cf6' },
    { id: 'pase', icono: '🩺', nombre: 'Pase de Guardia & Preparación de Mesa', desc: 'Repaso en voz alta para parciales y finales: pregúntense, expliquen y practiquen el pase de sala.', silenciosa: false, color: '#10b981' },
  ];
  const SUBSALAS = 6;                          // cada canal tiene varias salas de 4; se entra a la primera con lugar
  const K_ACTIVA = 'nika_ateneo_activo';
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let conectado = null;                        // { sala, nombre, silenciosa }
  let pipMin = false, pipVisible = true;
  let tiles = new Map();
  let dock = null, pip = null;
  let ultimoPeers = [];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); else console.info('[Ateneos]', m); };
  const DEF_AVATAR = 'assets/N%20NIKA.png';

  function usuario() {
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return u && (u.username || u.id) ? u : null; } catch (_) { return null; }
  }
  function metaPropia() {
    const u = usuario() || {};
    return { username: u.username || 'usuario', nombre: u.fullname || u.nombre || u.username || 'Estudiante', avatar: u.avatar || DEF_AVATAR };
  }
  function codigo() { let c = ''; const a = new Uint8Array(6); crypto.getRandomValues(a); a.forEach((n) => { c += ALFABETO[n % ALFABETO.length]; }); return c; }

  // ------------------------------------------------------------------ estilos (se inyectan: estudio.html no carga styles.css)
  function css() {
    if (document.getElementById('at-css')) return;
    const st = document.createElement('style');
    st.id = 'at-css';
    st.textContent = `
      .at-section { width: 100%; box-sizing: border-box; }
      .at-head { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
      .at-back { background: var(--card-bg); color: var(--nika-primary); border: 1px solid var(--border); border-radius: 12px; padding: 10px 16px; font-weight: 800; font-size: .85rem; cursor: pointer; }
      .at-back:hover { border-color: var(--nika-primary); }
      .at-head h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
      .at-head p { margin: 2px 0 0; font-size: .85rem; color: var(--text-muted); }
      .at-actual { display: none; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; margin-bottom: 16px; border-radius: 14px; background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.45); color: var(--text-main); font-size: .88rem; }
      .at-actual.on { display: flex; }
      .at-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 22px; }
      .at-card { --c: #0ea5e9; position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 18px; background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow); transition: transform .2s, box-shadow .2s, border-color .2s; }
      .at-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 4px; background: var(--c); }
      .at-card:hover { transform: translateY(-3px); border-color: var(--c); box-shadow: 0 16px 34px -18px var(--c); }
      .at-card-ico { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; background: color-mix(in srgb, var(--c) 16%, transparent); }
      .at-card h3 { margin: 0; font-size: 1.02rem; font-weight: 800; color: var(--text-main); line-height: 1.3; }
      .at-card p { margin: 0; font-size: .84rem; line-height: 1.5; color: var(--text-muted); flex: 1; }
      .at-tag { align-self: flex-start; font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; padding: 3px 10px; border-radius: 999px; background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
      .at-btn { border: none; cursor: pointer; padding: 11px 18px; border-radius: 999px; font-weight: 800; font-size: .84rem; color: #fff; font-family: inherit; background: linear-gradient(135deg, #0284c7, #2563eb); box-shadow: 0 8px 18px -8px rgba(37,99,235,.8); transition: transform .15s, filter .2s; }
      .at-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
      .at-btn:disabled { opacity: .55; cursor: default; transform: none; }
      .at-btn.sec { background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border); box-shadow: none; }
      .at-privada { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 18px; border-radius: 18px; background: var(--card-bg); border: 1px dashed var(--nika-primary); }
      .at-privada h4 { margin: 0 0 2px; font-size: 1rem; color: var(--text-main); } .at-privada small { color: var(--text-muted); font-size: .78rem; }
      .at-privada .at-izq { flex: 1; min-width: 200px; }
      .at-cod { display: flex; gap: 8px; }
      .at-cod input { width: 130px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-body); color: var(--text-main); font-weight: 800; letter-spacing: 3px; text-transform: uppercase; text-align: center; font-family: inherit; }
      .at-nota { margin-top: 16px; font-size: .78rem; color: var(--text-muted); line-height: 1.5; }

      /* Modal sala privada */
      .at-modal { position: fixed; inset: 0; z-index: 9500; display: none; align-items: center; justify-content: center; padding: 14px; background: rgba(2,6,23,.7); backdrop-filter: blur(4px); }
      .at-modal.on { display: flex; }
      .at-modal-card { width: min(420px, 100%); max-height: 90vh; overflow-y: auto; padding: 22px; border-radius: 20px; background: var(--card-bg, #fff); color: var(--text-main, #0f172a); border: 1px solid var(--border, #e2e8f0); box-shadow: 0 30px 70px -20px rgba(0,0,0,.6); text-align: center; }
      .at-code { font-size: 2.2rem; font-weight: 900; letter-spacing: 8px; margin: 10px 0; color: var(--nika-primary, #0284c7); font-family: monospace; }
      .at-inv-list { text-align: left; display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; margin: 10px 0; }
      .at-inv-list button { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border, #e2e8f0); background: var(--bg-body, #f8fafc); color: inherit; border-radius: 12px; padding: 8px 10px; cursor: pointer; font-weight: 700; font-size: .84rem; font-family: inherit; }
      .at-inv-list button:hover { border-color: var(--nika-primary, #0284c7); } .at-inv-list img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }

      /* Dock inferior estilo Discord */
      #at-dock { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 9400; display: none; align-items: center; gap: 14px; padding: 8px 10px 8px 12px; border-radius: 9999px;
        background: rgba(17,19,26,.94); backdrop-filter: blur(14px); color: #f1f5f9; border: 1px solid rgba(255,255,255,.1); box-shadow: 0 18px 40px -12px rgba(0,0,0,.7); max-width: calc(100vw - 16px); font-family: inherit; }
      #at-dock.on { display: flex; }
      .at-d-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .at-d-av { position: relative; width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; }
      .at-d-av img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; background: #1f2937; }
      .at-halo { transition: box-shadow .15s; }
      .at-halo.hablando { box-shadow: 0 0 0 3px #22c55e, 0 0 16px 3px rgba(34,197,94,.75); }
      .at-d-txt { min-width: 0; } .at-d-txt b { display: block; font-size: .8rem; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .at-d-txt small { display: flex; align-items: center; gap: 5px; font-size: .68rem; color: #94a3b8; }
      .at-lat { width: 8px; height: 8px; border-radius: 50%; background: #64748b; display: inline-block; }
      .at-lat.ok { background: #22c55e; } .at-lat.mid { background: #f59e0b; } .at-lat.bad { background: #ef4444; }
      .at-d-btns { display: flex; align-items: center; gap: 6px; }
      .at-d-btns button { position: relative; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.05rem; background: rgba(255,255,255,.1); color: #f1f5f9; transition: background .15s, transform .15s; }
      .at-d-btns button:hover { background: rgba(255,255,255,.2); transform: translateY(-1px); }
      .at-d-btns button.off { background: #ef4444; color: #fff; } .at-d-btns button.on-g { background: #22c55e; color: #04130a; }
      .at-d-btns button:disabled { opacity: .4; cursor: not-allowed; transform: none; }
      .at-d-btns button.salir { background: #dc2626; color: #fff; width: auto; padding: 0 14px; border-radius: 9999px; font-size: .8rem; font-weight: 800; }
      .at-d-btns button.salir:hover { background: #b91c1c; }
      @media (max-width: 640px) { #at-dock { gap: 8px; padding: 6px 8px; } .at-d-txt b { max-width: 90px; } .at-d-btns button { width: 36px; height: 36px; } }

      /* Ventana de video flotante (PiP) */
      #at-pip { position: fixed; right: 20px; top: 84px; z-index: 9350; width: 360px; max-width: calc(100vw - 16px); display: none; flex-direction: column; overflow: hidden; border-radius: 16px;
        background: #0b0e13; color: #f1f5f9; border: 1px solid rgba(255,255,255,.12); box-shadow: 0 24px 50px -14px rgba(0,0,0,.75); font-family: inherit; }
      #at-pip.on { display: flex; }
      .at-pip-h { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 8px 12px; cursor: grab; user-select: none; touch-action: none; background: rgba(255,255,255,.06); font-size: .78rem; font-weight: 800; }
      .at-pip-h:active { cursor: grabbing; } .at-pip-h button { border: none; background: rgba(255,255,255,.1); color: #fff; width: 26px; height: 26px; border-radius: 7px; cursor: pointer; margin-left: 4px; }
      .at-pip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; }
      #at-pip.min .at-pip-grid { display: none; }
      .at-tile { position: relative; aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; background: #161a22; }
      .at-tile.solo { grid-column: 1 / -1; }
      .at-tile video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #000; }
      .at-tile.local video { transform: scaleX(-1); } .at-tile.local.pantalla video { transform: none; }
      .at-tile.sinvideo video { visibility: hidden; }
      .at-tile-av { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; }
      .at-tile.sinvideo .at-tile-av { display: flex; }
      .at-tile-av img { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; background: #1f2937; }
      .at-tile-n { position: absolute; left: 6px; bottom: 6px; max-width: calc(100% - 40px); padding: 2px 8px; border-radius: 999px; font-size: .68rem; font-weight: 700; background: rgba(0,0,0,.6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .at-tile-m { position: absolute; right: 6px; bottom: 6px; width: 22px; height: 22px; border-radius: 50%; display: none; align-items: center; justify-content: center; font-size: .7rem; background: #ef4444; }
      .at-tile.muted .at-tile-m { display: flex; }
      .at-tile.hablando { box-shadow: inset 0 0 0 3px #22c55e, 0 0 14px rgba(34,197,94,.6); }
      .at-tile-e { position: absolute; left: 6px; top: 6px; font-size: .62rem; font-weight: 800; padding: 2px 7px; border-radius: 999px; background: rgba(2,132,199,.85); display: none; }
      .at-tile.pantalla .at-tile-e { display: block; }
      @media (max-width: 520px) { #at-pip { right: 8px; top: 70px; width: 300px; } }
    `;
    document.head.appendChild(st);
  }

  // ------------------------------------------------------------------ sección (canales)
  function ocultarOtras() {
    ['dashboard-hero-section', 'modulos-section', 'admin-dashboard-section', 'liga-section', 'foro-section'].forEach((id) => {
      const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
  }

  function abrir() {
    if (!usuario()) { alert('Iniciá sesión para entrar a la Sala de Ateneos.'); return; }
    const sec = $('#ateneos-section'); if (!sec) return;
    css(); ocultarOtras();
    sec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth <= 900 && typeof window.toggleSidebar === 'function' && document.getElementById('appSidebar')?.classList.contains('sidebar-open')) window.toggleSidebar();
    pintarSeccion();
  }
  function volver() {
    // Ya no viven dentro del campus: cada una es su propia página
    window.location.href = 'campus.html';
  }

  function pintarSeccion() {
    const sec = $('#ateneos-section'); if (!sec) return;
    detenerPrueba();
    sec.innerHTML = `
      <div class="at-hero">
        <div>
          <button type="button" class="at-back" onclick="NikaAteneos.volver()" style="margin-bottom:14px">← Volver al Campus</button>
          <h2>📹 Sala de Ateneos</h2>
          <p>Estudien y discutan casos clínicos en voz y video, directo entre compañeros. Hasta 4 personas por sala, sin instalar nada.</p>
          <div class="at-hero-chips"><span>🎙️ Voz</span><span>📷 Video</span><span>🖥️ Pantalla compartida</span><span>🔒 Salas privadas</span></div>
        </div>
        <div class="at-hero-tiles"><i>🩺</i><i>💬</i><i>🧠</i><i>📚</i></div>
      </div>
      <div class="at-actual ${conectado ? 'on' : ''}" id="at-actual"><span>🟢 Estás en <b>${esc(conectado ? conectado.nombre : '')}</b></span><span><button type="button" class="at-btn sec" onclick="NikaAteneos.mostrarVideo()">Ver videos</button> <button type="button" class="at-btn" style="background:#dc2626" onclick="NikaAteneos.desconectar()">Desconectar</button></span></div>
      <div class="at-pasos">
        <div class="at-paso"><b>1</b><div><strong>Elegí un ateneo</strong><span>O creá una sala privada con código.</span></div></div>
        <div class="at-paso"><b>2</b><div><strong>Permití el micrófono</strong><span>La cámara es opcional y se activa cuando quieras.</span></div></div>
        <div class="at-paso"><b>3</b><div><strong>Estudien juntos</strong><span>Ctrl + M silencia tu micrófono al instante.</span></div></div>
      </div>
      <div class="at-grid">
        ${CANALES.map((c) => `
          <article class="at-card" style="--c:${c.color}">
            <div class="at-card-top"><div class="at-card-ico">${c.icono}</div><span class="at-tag">${c.silenciosa ? '🔇 Micrófonos silenciados' : '🎙️ Voz y video'}</span></div>
            <div class="at-card-cuerpo">
              <h3>${esc(c.nombre)}</h3>
              <p>${esc(c.desc)}</p>
              <button type="button" class="at-btn" onclick="NikaAteneos.entrarCanal('${c.id}', this)">Entrar al ateneo</button>
            </div>
          </article>`).join('')}
      </div>
      <div class="at-privada">
        <div class="at-izq"><h4>🔒 Sala privada</h4><small>Creá una sala con código de 6 caracteres o invitá directo a un amigo. Solo entra quien tenga el código.</small></div>
        <button type="button" class="at-btn" onclick="NikaAteneos.crearPrivada(this)">Crear sala privada</button>
        <div class="at-cod"><input id="at-codigo" maxlength="6" placeholder="CÓDIGO" autocomplete="off"><button type="button" class="at-btn sec" onclick="NikaAteneos.unirsePorCodigo()">Unirme</button></div>
      </div>
      <div class="at-equipo" style="margin-top:22px">
        <div class="at-prev" id="at-prev"><span>Vista previa de tu cámara</span></div>
        <div>
          <h4>🎛️ Probá tu equipo antes de entrar</h4>
          <p>Hablá para ver el nivel del micrófono y activá la cámara para verte. No se envía nada a nadie.</p>
          <div class="at-vu"><i id="at-vu"></i></div>
          <div class="at-equipo-btns"><button type="button" class="at-btn sec" id="at-t-mic" onclick="NikaAteneos.probarMic()">🎤 Probar micrófono</button><button type="button" class="at-btn sec" id="at-t-cam" onclick="NikaAteneos.probarCam()">📷 Probar cámara</button></div>
        </div>
      </div>
      <p class="at-nota">La conexión es directa entre compañeros (WebRTC); en algunas redes muy restrictivas puede no conectar. <b>Ctrl + M</b> silencia o activa tu micrófono.</p>`;
  }

  // ---- prueba de micrófono y cámara (local, no se transmite)
  let prueba = { mic: null, cam: null, ctx: null, raf: 0 };
  async function probarMic() {
    if (prueba.mic) { detenerPrueba(true); return; }
    try {
      prueba.mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      prueba.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = prueba.ctx.createAnalyser(); an.fftSize = 512; prueba.ctx.createMediaStreamSource(prueba.mic).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const bucle = () => {
        an.getByteTimeDomainData(buf); let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const barra = $('#at-vu'); if (barra) barra.style.width = Math.min(100, Math.round(Math.sqrt(sum / buf.length) * 320)) + '%';
        prueba.raf = requestAnimationFrame(bucle);
      };
      bucle();
      const b = $('#at-t-mic'); if (b) b.textContent = '⏹ Detener micrófono';
    } catch (e) { toast('No se pudo acceder al micrófono: revisá el permiso del navegador.'); }
  }
  async function probarCam() {
    if (prueba.cam) { detenerPrueba(true); return; }
    try {
      prueba.cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const box = $('#at-prev'); box.innerHTML = '<video autoplay playsinline muted></video>'; box.firstChild.srcObject = prueba.cam;
      const b = $('#at-t-cam'); if (b) b.textContent = '⏹ Detener cámara';
    } catch (e) { toast('No se pudo acceder a la cámara: revisá el permiso del navegador.'); }
  }
  function detenerPrueba(actualizarUi) {
    cancelAnimationFrame(prueba.raf);
    [prueba.mic, prueba.cam].forEach((st) => { if (st) st.getTracks().forEach((t) => t.stop()); });
    try { if (prueba.ctx) prueba.ctx.close(); } catch (_) {}
    prueba = { mic: null, cam: null, ctx: null, raf: 0 };
    if (actualizarUi) {
      const vu = $('#at-vu'); if (vu) vu.style.width = '0%';
      const p = $('#at-prev'); if (p) p.innerHTML = '<span>Vista previa de tu cámara</span>';
      const m = $('#at-t-mic'); if (m) m.textContent = '🎤 Probar micrófono';
      const c = $('#at-t-cam'); if (c) c.textContent = '📷 Probar cámara';
    }
  }

  // ------------------------------------------------------------------ unirse
  async function entrarCanal(id, btn) {
    const c = CANALES.find((x) => x.id === id); if (!c) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Conectando...'; }
    try {
      let ok = false, ultimoError = null;
      for (let n = 1; n <= SUBSALAS && !ok; n++) {
        try { await conectarSala(`canal-${id}-${n}`, `${c.nombre}${n > 1 ? ' · Sala ' + n : ''}`, c.silenciosa); ok = true; }
        catch (e) { ultimoError = e; if (!/llena/i.test(e.message || '')) break; }
      }
      if (!ok) throw ultimoError || new Error('No se pudo entrar.');
    } catch (err) { toast(err.message || 'No se pudo entrar a la sala.'); }
    finally { if (btn) { btn.disabled = false; btn.textContent = 'Entrar al ateneo'; } }
  }

  async function conectarSala(sala, nombre, silenciosa, opciones = {}) {
    if (!window.VoiceManager || !VoiceManager.soportado()) throw new Error('Tu navegador no admite videollamadas.');
    detenerPrueba(false); css(); construirDock(); construirPip();
    await VoiceManager.unirse(sala, metaPropia(), {
      silenciosa, micInicial: opciones.micInicial,
      cbs: {
        onPeers: (l) => { ultimoPeers = l; actualizarTiles(); actualizarDock(); },
        onStream: (id, stream) => { const t = tiles.get(id); if (t) t.querySelector('video').srcObject = stream; },
        onPeerLeft: (id) => { const t = tiles.get(id); if (t) { t.remove(); tiles.delete(id); } actualizarTiles(); },
        onSpeaking: (id, h) => marcarHabla(id, h),
        onLatency: (ms) => pintarLatencia(ms),
        onLocalVideo: (stream) => { const t = tiles.get('yo'); if (t) { t.querySelector('video').srcObject = stream; actualizarTiles(); } },
        onSelf: () => { actualizarDock(); actualizarTiles(); },
        onScreenEnded: () => actualizarDock(),
        onError: (m) => toast(m),
      },
    });
    conectado = { sala, nombre, silenciosa };
    try { localStorage.setItem(K_ACTIVA, JSON.stringify({ sala, nombre, silenciosa, t: Date.now(), mic: !VoiceManager.yo.meta.muted })); } catch (_) {}
    dock.classList.add('on'); pip.classList.add('on'); pipVisible = true;
    document.body.classList.add('at-en-llamada');
    $('#at-d-name').textContent = nombre;
    actualizarTiles(); actualizarDock();
    const cab = $('#at-actual'); if (cab) { cab.classList.add('on'); pintarSeccion(); }
    if (!opciones.silencioso) toast(`Conectado a “${nombre}”`);
  }

  async function desconectar() {
    await VoiceManager.salir();
    conectado = null; tiles.forEach((t) => t.remove()); tiles.clear(); ultimoPeers = [];
    try { localStorage.removeItem(K_ACTIVA); } catch (_) {}
    if (dock) dock.classList.remove('on'); if (pip) pip.classList.remove('on');
    document.body.classList.remove('at-en-llamada');
    if ($('#ateneos-section') && $('#ateneos-section').style.display !== 'none') pintarSeccion();
  }

  // ------------------------------------------------------------------ salas privadas
  async function crearPrivada(btn) {
    const cod = codigo();
    if (btn) btn.disabled = true;
    try { await conectarSala('p-' + cod, 'Sala privada ' + cod, false); mostrarModalCodigo(cod); }
    catch (e) { toast(e.message || 'No se pudo crear la sala.'); }
    finally { if (btn) btn.disabled = false; }
  }
  async function unirsePorCodigo() {
    const cod = ($('#at-codigo').value || '').trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(cod)) { toast('El código tiene 6 letras o números.'); return; }
    try { await conectarSala('p-' + cod, 'Sala privada ' + cod, false); } catch (e) { toast(e.message || 'No se pudo entrar.'); }
  }

  function mostrarModalCodigo(cod) {
    let m = $('#at-modal');
    if (!m) { m = document.createElement('div'); m.id = 'at-modal'; m.className = 'at-modal'; m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('on'); }); document.body.appendChild(m); }
    m.innerHTML = `<div class="at-modal-card"><h3 style="margin:0">🔒 Sala privada creada</h3><p style="margin:6px 0;font-size:.85rem;color:var(--text-muted,#64748b)">Compartí este código o invitá a un amigo:</p>
      <div class="at-code">${cod}</div>
      <button type="button" class="at-btn sec" id="at-copiar">📋 Copiar código</button>
      <div style="margin-top:14px;font-weight:800;font-size:.85rem">Invitar a un amigo</div>
      <div class="at-inv-list" id="at-inv"><div style="font-size:.8rem;color:var(--text-muted,#64748b)">Cargando amigos...</div></div>
      <button type="button" class="at-btn" onclick="document.getElementById('at-modal').classList.remove('on')">Listo</button></div>`;
    m.classList.add('on');
    $('#at-copiar').onclick = async () => { try { await navigator.clipboard.writeText(cod); toast('Código copiado.'); } catch (_) { toast('Código: ' + cod); } };
    (async () => {
      const box = $('#at-inv');
      let amigos = []; try { amigos = await window.NikaFriends.listFriends(); } catch (_) {}
      if (!amigos.length) { box.innerHTML = '<div style="font-size:.8rem;color:var(--text-muted,#64748b)">Todavía no tenés amigos agregados.</div>'; return; }
      box.innerHTML = amigos.map((a) => `<button type="button" data-u="${esc(a.username)}"><img src="${esc(a.avatar || DEF_AVATAR)}" alt=""><span>${esc(a.fullname)}</span></button>`).join('');
      box.querySelectorAll('button').forEach((b) => b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          const enlace = `${location.origin}${location.pathname}#ateneo-${cod}`;
          await window.ChatManager.enviarMensaje(b.dataset.u, `📹 Te invito a mi sala privada de la Sala de Ateneos.\nCódigo: ${cod}\n${enlace}`);
          b.querySelector('span').textContent += ' ✓ invitado';
        } catch (e) { b.disabled = false; toast(e.message || 'No se pudo enviar la invitación.'); }
      }));
    })();
  }

  // ------------------------------------------------------------------ dock
  function construirDock() {
    if (dock) return;
    dock = document.createElement('div'); dock.id = 'at-dock';
    dock.innerHTML = `
      <div class="at-d-info"><span class="at-d-av at-halo" id="at-self-av"><img id="at-self-img" alt="" src=""></span>
        <div class="at-d-txt"><b id="at-d-name">Ateneo</b><small><i class="at-lat" id="at-lat"></i><span id="at-lat-t">-- ms</span> · <span id="at-n">1/4</span></small></div></div>
      <div class="at-d-btns">
        <button type="button" id="at-b-mic" title="Micrófono (Ctrl+M)" aria-label="Micrófono">🎤</button>
        <button type="button" id="at-b-cam" title="Cámara" aria-label="Cámara">📷</button>
        <button type="button" id="at-b-scr" title="Compartir pantalla" aria-label="Compartir pantalla">🖥️</button>
        <button type="button" id="at-b-pip" title="Mostrar u ocultar videos" aria-label="Videos">👥</button>
        <button type="button" class="salir" id="at-b-out" title="Desconectar">Salir</button>
      </div>`;
    document.body.appendChild(dock);
    $('#at-self-img').src = metaPropia().avatar;
    // Muchos celulares no permiten compartir pantalla: el botón solo aparece si el navegador lo soporta
    if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) $('#at-b-scr').style.display = 'none';
    $('#at-b-mic').onclick = alternarMic;
    $('#at-b-cam').onclick = async () => { const r = await VoiceManager.alternarCamara(); if (!r.ok) toast(r.motivo); actualizarDock(); actualizarTiles(); };
    $('#at-b-scr').onclick = async () => { const r = await VoiceManager.alternarPantalla(); if (!r.ok) toast(r.motivo); actualizarDock(); actualizarTiles(); };
    $('#at-b-pip').onclick = () => mostrarVideo(true);
    $('#at-b-out').onclick = desconectar;
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'm' && conectado) { e.preventDefault(); alternarMic(); } });
  }

  function alternarMic() {
    const r = VoiceManager.alternarMic();
    if (!r.ok) toast(r.motivo === 'silenciosa' ? 'En la Guardia Silenciosa los micrófonos están silenciados.' : 'No hay micrófono disponible.');
    actualizarDock(); actualizarTiles();
  }

  function actualizarDock() {
    if (!dock || !conectado) return;
    const mic = $('#at-b-mic'), cam = $('#at-b-cam'), scr = $('#at-b-scr');
    const muted = !VoiceManager.micActivo;
    mic.classList.toggle('off', muted); mic.textContent = muted ? '🔇' : '🎤';
    mic.disabled = conectado.silenciosa;
    mic.title = conectado.silenciosa ? 'Guardia Silenciosa: micrófonos silenciados' : 'Micrófono (Ctrl+M)';
    cam.classList.toggle('on-g', VoiceManager.camActiva); scr.classList.toggle('on-g', VoiceManager.pantallaActiva);
    $('#at-n').textContent = `${1 + ultimoPeers.length}/${VoiceManager.MAX_PARTICIPANTES}`;
  }

  function pintarLatencia(ms) {
    const dot = $('#at-lat'), t = $('#at-lat-t'); if (!dot) return;
    if (ms == null) { dot.className = 'at-lat'; t.textContent = ultimoPeers.length ? 'midiendo...' : 'solo vos'; return; }
    dot.className = 'at-lat ' + (ms < 120 ? 'ok' : ms < 260 ? 'mid' : 'bad');
    t.textContent = ms + ' ms';
  }

  function marcarHabla(id, h) {
    if (id === 'yo') { const a = $('#at-self-av'); if (a) a.classList.toggle('hablando', h); }
    const t = tiles.get(id); if (t) t.classList.toggle('hablando', h);
  }

  // ------------------------------------------------------------------ ventana de video (PiP)
  function construirPip() {
    if (pip) return;
    pip = document.createElement('div'); pip.id = 'at-pip';
    pip.innerHTML = `<div class="at-pip-h"><span id="at-pip-t">📹 Ateneo</span><span><button type="button" id="at-pip-min" title="Minimizar">_</button><button type="button" id="at-pip-x" title="Ocultar">✕</button></span></div><div class="at-pip-grid" id="at-pip-grid"></div>`;
    document.body.appendChild(pip);
    $('#at-pip-min').onclick = () => { pipMin = !pipMin; pip.classList.toggle('min', pipMin); };
    $('#at-pip-x').onclick = () => { pipVisible = false; pip.classList.remove('on'); };
    // arrastre
    const h = $('.at-pip-h', pip);
    h.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = pip.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      h.setPointerCapture(e.pointerId); pip.style.right = 'auto'; pip.style.left = r.left + 'px'; pip.style.top = r.top + 'px';
      const mover = (ev) => { pip.style.left = Math.min(Math.max(0, ev.clientX - dx), Math.max(0, innerWidth - r.width)) + 'px'; pip.style.top = Math.min(Math.max(0, ev.clientY - dy), Math.max(0, innerHeight - 50)) + 'px'; };
      const soltar = () => { h.removeEventListener('pointermove', mover); h.removeEventListener('pointerup', soltar); h.removeEventListener('pointercancel', soltar); };
      h.addEventListener('pointermove', mover); h.addEventListener('pointerup', soltar); h.addEventListener('pointercancel', soltar);
    });
  }

  function mostrarVideo(alternar) {
    if (!pip || !conectado) return;
    pipVisible = alternar ? !pipVisible : true;
    pip.classList.toggle('on', pipVisible);
    if (pipVisible) { pipMin = false; pip.classList.remove('min'); }
  }

  function tile(id, esLocal) {
    let t = tiles.get(id);
    if (t) return t;
    t = document.createElement('div');
    t.className = 'at-tile sinvideo' + (esLocal ? ' local' : '');
    t.dataset.id = id;
    t.innerHTML = `<video autoplay playsinline ${esLocal ? 'muted' : ''}></video><div class="at-tile-av"><img alt="" src=""></div><span class="at-tile-e">🖥️ Pantalla</span><span class="at-tile-n"></span><span class="at-tile-m">🔇</span>`;
    tiles.set(id, t);
    $('#at-pip-grid').appendChild(t);
    return t;
  }

  function actualizarTiles() {
    if (!pip || !conectado) return;
    const yoMeta = VoiceManager.yo ? VoiceManager.yo.meta : metaPropia();
    const tl = tile('yo', true);
    tl.querySelector('.at-tile-n').textContent = 'Vos';
    tl.querySelector('img').src = yoMeta.avatar || DEF_AVATAR;
    const conVideoYo = VoiceManager.camActiva || VoiceManager.pantallaActiva;
    tl.classList.toggle('sinvideo', !conVideoYo); tl.classList.toggle('pantalla', VoiceManager.pantallaActiva);
    tl.classList.toggle('muted', !VoiceManager.micActivo);

    const vivos = new Set(['yo']);
    ultimoPeers.forEach((p) => {
      vivos.add(p.id);
      const t = tile(p.id, false);
      const v = t.querySelector('video');
      if (v.srcObject !== p.stream) v.srcObject = p.stream;
      t.querySelector('.at-tile-n').textContent = p.meta.nombre || 'Compañero';
      t.querySelector('img').src = p.meta.avatar || DEF_AVATAR;
      const conVideo = !!(p.meta.cam || p.meta.sharing);
      t.classList.toggle('sinvideo', !conVideo); t.classList.toggle('pantalla', !!p.meta.sharing);
      t.classList.toggle('muted', !!p.meta.muted);
      v.play && v.play().catch(() => {});
    });
    [...tiles.keys()].forEach((id) => { if (!vivos.has(id)) { tiles.get(id).remove(); tiles.delete(id); } });
    const n = tiles.size;
    tiles.forEach((t) => t.classList.toggle('solo', n === 1));
    $('#at-pip-t').textContent = `📹 ${conectado.nombre.length > 26 ? conectado.nombre.slice(0, 25) + '…' : conectado.nombre} · ${n}`;
    pintarLatencia(VoiceManager.latencia);
  }

  // ------------------------------------------------------------------ reconexión entre páginas + invitaciones por enlace
  async function reconectarSiCorresponde() {
    let a = null; try { a = JSON.parse(localStorage.getItem(K_ACTIVA) || 'null'); } catch (_) {}
    if (!a || !usuario() || Date.now() - (a.t || 0) > 12 * 3600 * 1000) { try { localStorage.removeItem(K_ACTIVA); } catch (_) {} return; }
    try { await conectarSala(a.sala, a.nombre, a.silenciosa, { micInicial: a.mic, silencioso: true }); }
    catch (e) { try { localStorage.removeItem(K_ACTIVA); } catch (_) {} }
  }

  function revisarInvitacion() {
    const m = location.hash.match(/^#ateneo-([A-Z2-9]{6})$/);
    if (!m || !usuario() || conectado) return;
    history.replaceState(null, '', location.pathname + location.search);
    if (confirm(`¿Unirte a la sala privada ${m[1]} de la Sala de Ateneos?`)) {
      abrir(); conectarSala('p-' + m[1], 'Sala privada ' + m[1], false).catch((e) => toast(e.message));
    }
  }

  function init() {
    css();
    reconectarSiCorresponde();
    setTimeout(revisarInvitacion, 700);
  }
  window.addEventListener('hashchange', () => setTimeout(revisarInvitacion, 100));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { abrir, volver, entrarCanal, crearPrivada, unirsePorCodigo, desconectar, probarMic, probarCam, mostrarVideo: () => mostrarVideo(false) };
})();

window.NikaAteneos = NikaAteneos;
