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

      /* ===== Sala en curso: escenario + panel lateral (híbrido Discord / Meet) ===== */
      body.at-stage #at-dock { display: none !important; }
      .ats { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start; }
      .ats-main { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
      .ats-top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 16px; background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow); }
      .ats-top h2 { margin: 0; flex: 1; min-width: 180px; font-size: 1.05rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px; }
      .ats-live { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 0 rgba(34,197,94,.6); animation: ats-pulso 1.8s infinite; flex-shrink: 0; }
      @keyframes ats-pulso { 70% { box-shadow: 0 0 0 9px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
      .ats-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: .74rem; font-weight: 800; background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border); cursor: default; font-family: inherit; }
      button.ats-chip { cursor: pointer; } button.ats-chip:hover { border-color: var(--nika-primary); }
      .ats-stage { background: #0b0e13; border-radius: 20px; padding: 12px; min-height: 380px; display: flex; flex-direction: column; justify-content: center; gap: 10px; box-shadow: var(--shadow); }
      .ats-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: center; }
      .ats-grid[data-n="1"] { grid-template-columns: minmax(0, 720px); justify-content: center; }
      .ats-grid.spot .at-tile.pantalla { grid-column: 1 / -1; aspect-ratio: 16 / 9; }
      .ats-grid.spot .at-tile.pantalla video { object-fit: contain; background: #000; }
      .ats-grid .at-tile { aspect-ratio: 16 / 10; border-radius: 16px; grid-column: auto; }
      .ats-grid .at-tile-av img { width: 92px; height: 92px; }
      .ats-grid .at-tile-n { font-size: .8rem; padding: 3px 11px; left: 10px; bottom: 10px; }
      .ats-grid .at-tile-m { right: 10px; bottom: 10px; width: 28px; height: 28px; font-size: .85rem; }
      .at-tile-h { position: absolute; left: 8px; top: 8px; font-size: .7rem; font-weight: 800; padding: 3px 9px; border-radius: 999px; background: rgba(245,158,11,.92); color: #1f1300; display: none; }
      .at-tile.esHost .at-tile-h { display: block; }
      .at-tile.pantalla .at-tile-e { left: auto; right: 8px; }
      .at-tile-k { position: absolute; right: 8px; top: 8px; border: none; border-radius: 999px; padding: 5px 11px; font-size: .7rem; font-weight: 800; cursor: pointer; background: rgba(220,38,38,.92); color: #fff; display: none; font-family: inherit; }
      .ats-grid .at-tile.puedeExpulsar:hover .at-tile-k { display: block; }
      .ats-vacio { text-align: center; color: #cbd5e1; font-size: .88rem; padding: 6px 12px 2px; }
      .ats-vacio b { color: #fff; }
      .ats-bar { display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 14px; border-radius: 22px; background: rgba(17,19,26,.96); box-shadow: 0 14px 30px -14px rgba(0,0,0,.7); }
      .ats-cb { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 84px; padding: 9px 14px; border: none; border-radius: 16px; cursor: pointer; background: rgba(255,255,255,.1); color: #f1f5f9; font: 700 .68rem/1.1 inherit; font-family: inherit; transition: background .15s, transform .15s; }
      .ats-cb i { font-style: normal; font-size: 1.3rem; line-height: 1; }
      .ats-cb:hover { background: rgba(255,255,255,.2); transform: translateY(-1px); }
      .ats-cb.off { background: #ef4444; } .ats-cb.act { background: #22c55e; color: #04130a; }
      .ats-cb:disabled { opacity: .45; cursor: not-allowed; transform: none; }
      .ats-cb.salir { background: #dc2626; } .ats-cb.salir:hover { background: #b91c1c; }
      .ats-cb.solo-movil { display: none; }
      .ats-side { position: sticky; top: 76px; display: flex; flex-direction: column; max-height: calc(100vh - 100px); border-radius: 18px; background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
      .ats-tabs { display: flex; border-bottom: 1px solid var(--border); }
      .ats-tabs button { flex: 1; padding: 13px 8px; border: none; background: none; cursor: pointer; font-weight: 800; font-size: .82rem; color: var(--text-muted); border-bottom: 3px solid transparent; font-family: inherit; }
      .ats-tabs button.on { color: var(--nika-primary); border-bottom-color: var(--nika-primary); }
      .ats-panel { padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
      .ats-p { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 14px; background: var(--bg-body); border: 1px solid transparent; }
      .ats-p.hablando { border-color: #22c55e; background: rgba(34,197,94,.1); }
      .ats-p .at-d-av { width: 40px; height: 40px; }
      .ats-p-t { min-width: 0; flex: 1; } .ats-p-t b { display: block; font-size: .84rem; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ats-p-t small { font-size: .72rem; color: var(--text-muted); display: flex; gap: 6px; align-items: center; }
      .ats-p button { border: none; border-radius: 10px; padding: 6px 10px; font-size: .72rem; font-weight: 800; cursor: pointer; font-family: inherit; background: rgba(220,38,38,.12); color: #dc2626; }
      .ats-p button:hover { background: #dc2626; color: #fff; }
      .ats-p button.inv { background: rgba(2,132,199,.12); color: var(--nika-primary); } .ats-p button.inv:hover { background: var(--nika-primary); color: #fff; }
      .ats-p button:disabled { opacity: .6; cursor: default; background: rgba(34,197,94,.14); color: #16a34a; }
      .ats-busca { width: 100%; box-sizing: border-box; padding: 10px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-main); font-family: inherit; font-size: .84rem; }
      .ats-h { margin: 8px 2px 2px; font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: var(--text-muted); }
      .ats-dot { width: 9px; height: 9px; border-radius: 50%; background: #94a3b8; flex-shrink: 0; } .ats-dot.on { background: #22c55e; }
      .ats-fila { display: flex; gap: 8px; } .ats-fila > * { flex: 1; }
      #at-inv-toast { position: fixed; right: 16px; bottom: 18px; z-index: 9600; width: min(340px, calc(100vw - 32px)); display: none; flex-direction: column; gap: 10px; padding: 16px; border-radius: 18px; background: var(--card-bg, #fff); color: var(--text-main, #0f172a); border: 1px solid var(--nika-primary, #0284c7); box-shadow: 0 24px 50px -14px rgba(0,0,0,.55); font-family: inherit; }
      #at-inv-toast.on { display: flex; animation: ats-in .25s ease; } @keyframes ats-in { from { transform: translateY(14px); opacity: 0; } }
      #at-inv-toast .f { display: flex; gap: 8px; }
      @media (max-width: 900px) {
        .ats { grid-template-columns: 1fr; }
        .ats-side { position: static; max-height: none; display: none; }
        .ats-side.abierto { display: flex; }
        .ats-cb.solo-movil { display: flex; }
        .ats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ats-cb { min-width: 64px; padding: 8px 10px; }
      }
      @media (max-width: 520px) { .ats-grid, .ats-grid[data-n="1"] { grid-template-columns: minmax(0, 1fr); } }
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
    if (conectado) { pintarSala(); return; }
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
        onPeers: (l) => { ultimoPeers = l; actualizarTiles(); actualizarDock(); pintarParticipantes(); },
        onStream: (id, stream) => { const t = tiles.get(id); if (t) t.querySelector('video').srcObject = stream; },
        onPeerLeft: (id) => { const t = tiles.get(id); if (t) { t.remove(); tiles.delete(id); } hablando.delete(id); actualizarTiles(); pintarParticipantes(); },
        onSpeaking: (id, h) => marcarHabla(id, h),
        onLatency: (ms) => pintarLatencia(ms),
        onLocalVideo: (stream) => { const t = tiles.get('yo'); if (t) { t.querySelector('video').srcObject = stream; actualizarTiles(); } },
        onSelf: () => { actualizarDock(); actualizarTiles(); pintarParticipantes(); },
        onKicked: () => { toast('El anfitrión te sacó de la sala.'); desconectar(); },
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
    { const sec = $('#ateneos-section'); if (sec && sec.style.display !== 'none') pintarSeccion(); }
    sincronizarPip();
    if (!opciones.silencioso) toast(`Conectado a “${nombre}”`);
  }

  async function desconectar() {
    await VoiceManager.salir();
    conectado = null; tiles.forEach((t) => t.remove()); tiles.clear(); ultimoPeers = [];
    try { localStorage.removeItem(K_ACTIVA); } catch (_) {}
    if (dock) dock.classList.remove('on'); if (pip) pip.classList.remove('on');
    document.body.classList.remove('at-en-llamada', 'at-stage'); hablando.clear(); invitados.clear();
    if ($('#ateneos-section') && $('#ateneos-section').style.display !== 'none') pintarSeccion();
  }

  // ------------------------------------------------------------------ salas privadas
  async function crearPrivada(btn) {
    const cod = codigo();
    if (btn) btn.disabled = true;
    try { tabLateral = 'invitar'; await conectarSala('p-' + cod, 'Sala privada ' + cod, false); if (!stageActivo()) mostrarModalCodigo(cod); }
    catch (e) { toast(e.message || 'No se pudo crear la sala.'); }
    finally { if (btn) btn.disabled = false; }
  }
  async function unirsePorCodigo() {
    const cod = ($('#at-codigo').value || '').trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(cod)) { toast('El código tiene 6 letras o números.'); return; }
    try { tabLateral = 'participantes'; await conectarSala('p-' + cod, 'Sala privada ' + cod, false); } catch (e) { toast(e.message || 'No se pudo entrar.'); }
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
    actualizarControlesSala();
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
    const d2 = $('#ats-lat'), t2 = $('#ats-lat-t');
    if (d2) { d2.className = 'at-lat ' + (ms == null ? '' : ms < 120 ? 'ok' : ms < 260 ? 'mid' : 'bad'); t2.textContent = ms == null ? (ultimoPeers.length ? 'midiendo...' : 'solo vos') : ms + ' ms'; }
    const dot = $('#at-lat'), t = $('#at-lat-t'); if (!dot) return;
    if (ms == null) { dot.className = 'at-lat'; t.textContent = ultimoPeers.length ? 'midiendo...' : 'solo vos'; return; }
    dot.className = 'at-lat ' + (ms < 120 ? 'ok' : ms < 260 ? 'mid' : 'bad');
    t.textContent = ms + ' ms';
  }

  function marcarHabla(id, h) {
    if (h) hablando.add(id); else hablando.delete(id);
    if (id === 'yo') { const a = $('#at-self-av'); if (a) a.classList.toggle('hablando', h); }
    const fila = document.querySelector(`.ats-p[data-id="${id}"]`); if (fila) fila.classList.toggle('hablando', h);
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
    if (pipVisible) { pipMin = false; pip.classList.remove('min'); }
    sincronizarPip();
  }

  function tile(id, esLocal) {
    let t = tiles.get(id);
    if (t) return t;
    t = document.createElement('div');
    t.className = 'at-tile sinvideo' + (esLocal ? ' local' : '');
    t.dataset.id = id;
    t.innerHTML = `<video autoplay playsinline ${esLocal ? 'muted' : ''}></video><div class="at-tile-av"><img alt="" src=""></div><span class="at-tile-e">🖥️ Pantalla</span><span class="at-tile-h">👑 Anfitrión</span><button type="button" class="at-tile-k">🚪 Expulsar</button><span class="at-tile-n"></span><span class="at-tile-m">🔇</span>`;
    t.querySelector('.at-tile-k').onclick = () => { if (id !== 'yo') expulsar(id); };
    tiles.set(id, t);
    contenedorTiles().appendChild(t);
    return t;
  }

  function actualizarTiles() {
    if (!pip || !conectado) return;
    const yoMeta = VoiceManager.yo ? VoiceManager.yo.meta : metaPropia();
    const tl = tile('yo', true);
    tl.querySelector('.at-tile-n').textContent = stageActivo() ? `${(yoMeta.nombre || 'Vos')} (vos)` : 'Vos';
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
      t.classList.toggle('esHost', p.id === VoiceManager.hostId());
      t.classList.toggle('puedeExpulsar', VoiceManager.soyHost());
      v.play && v.play().catch(() => {});
    });
    tl.classList.toggle('esHost', VoiceManager.soyHost());
    [...tiles.keys()].forEach((id) => { if (!vivos.has(id)) { tiles.get(id).remove(); tiles.delete(id); } });
    const n = tiles.size;
    tiles.forEach((t) => t.classList.toggle('solo', n === 1));
    const cont = contenedorTiles();
    if (cont) tiles.forEach((t) => { if (t.parentNode !== cont) { cont.appendChild(t); const vv = t.querySelector('video'); vv.play && vv.play().catch(() => {}); } });
    const g = $('#at-stage-grid'); if (g) { g.dataset.n = n; g.classList.toggle('spot', [...tiles.values()].some((t) => t.classList.contains('pantalla'))); }
    sincronizarPip();
    if ($('#at-pip-t')) $('#at-pip-t').textContent = `📹 ${conectado.nombre.length > 26 ? conectado.nombre.slice(0, 25) + '…' : conectado.nombre} · ${n}`;
    pintarLatencia(VoiceManager.latencia);
  }

  // ------------------------------------------------------------------ reconexión entre páginas + invitaciones por enlace
  async function reconectarSiCorresponde() {
    let a = null; try { a = JSON.parse(localStorage.getItem(K_ACTIVA) || 'null'); } catch (_) {}
    if (!a || !usuario() || Date.now() - (a.t || 0) > 12 * 3600 * 1000) { try { localStorage.removeItem(K_ACTIVA); } catch (_) {} return; }
    try { await conectarSala(a.sala, a.nombre, a.silenciosa, { micInicial: a.mic, silencioso: true }); }
    catch (e) { try { localStorage.removeItem(K_ACTIVA); } catch (_) {} }
  }

  // ------------------------------------------------------------------ sala en curso (escenario + panel lateral)
  let tabLateral = 'participantes';
  const hablando = new Set();
  const invitados = new Set();                 // usernames ya invitados en esta sesión
  let panelMovil = false;

  const stageActivo = () => !!$('#at-stage-grid');
  const contenedorTiles = () => $('#at-stage-grid') || $('#at-pip-grid');

  // El PiP flotante solo se usa fuera de la página de la sala (dentro, el escenario ocupa su lugar)
  function sincronizarPip() {
    const stage = !!conectado && stageActivo();
    document.body.classList.toggle('at-stage', stage);
    if (pip) pip.classList.toggle('on', !!conectado && pipVisible && !stage);
  }

  function infoSala(sala) {
    let m = /^p-([A-Z2-9]{6})$/.exec(sala || '');
    if (m) return { nombre: 'Sala privada ' + m[1], silenciosa: false, codigo: m[1] };
    m = /^canal-(general|silenciosa|pase)-([1-6])$/.exec(sala || '');
    if (m) { const c = CANALES.find((x) => x.id === m[1]); return { nombre: c.nombre + (m[2] !== '1' ? ' · Sala ' + m[2] : ''), silenciosa: c.silenciosa, codigo: null }; }
    return null;
  }
  function enlaceSala() {
    if (!conectado) return '';
    const base = new URL('ateneos.html', location.href).href;
    const m = /^p-([A-Z2-9]{6})$/.exec(conectado.sala);
    return base + (m ? '#ateneo-' + m[1] : '#sala-' + conectado.sala);
  }
  async function copiar(texto, aviso) {
    try { await navigator.clipboard.writeText(texto); toast(aviso); } catch (_) { toast(texto); }
  }

  function pintarSala() {
    const sec = $('#ateneos-section'); if (!sec || !conectado) return;
    const info = infoSala(conectado.sala) || {};
    sec.innerHTML = `
      <div class="ats">
        <div class="ats-main">
          <div class="ats-top">
            <h2><i class="ats-live"></i><span>${esc(conectado.nombre)}</span></h2>
            <span class="ats-chip" title="Participantes">👥 <span id="ats-n">1/4</span></span>
            <span class="ats-chip" title="Latencia"><i class="at-lat" id="ats-lat"></i><span id="ats-lat-t">-- ms</span></span>
            ${info.codigo ? `<button type="button" class="ats-chip" id="ats-cod" title="Copiar código">🔒 Código ${esc(info.codigo)} 📋</button>` : ''}
            <button type="button" class="ats-chip" id="ats-link" title="Copiar enlace de invitación">🔗 Copiar enlace</button>
          </div>
          <div class="ats-stage">
            <div class="ats-grid" id="at-stage-grid" data-n="1"></div>
            <div class="ats-vacio" id="ats-vacio" style="display:none">Estás solo en la sala. <b>Invitá compañeros</b> desde el panel de la derecha o compartí el enlace.</div>
          </div>
          <div class="ats-bar">
            <button type="button" class="ats-cb" id="ats-mic"><i>🎤</i><span>Micrófono</span></button>
            <button type="button" class="ats-cb" id="ats-cam"><i>📷</i><span>Cámara</span></button>
            <button type="button" class="ats-cb" id="ats-scr"><i>🖥️</i><span>Pantalla</span></button>
            <button type="button" class="ats-cb solo-movil" id="ats-panel"><i>👥</i><span>Gente</span></button>
            <button type="button" class="ats-cb salir" id="ats-out"><i>📞</i><span>Salir</span></button>
          </div>
          <p class="at-nota" style="margin:0">Tu cámara está apagada hasta que la actives: el círculo con tu foto es solo tu avatar. <b>Ctrl + M</b> silencia o activa el micrófono.</p>
        </div>
        <aside class="ats-side ${panelMovil ? 'abierto' : ''}" id="ats-side">
          <div class="ats-tabs">
            <button type="button" data-t="participantes" class="${tabLateral === 'participantes' ? 'on' : ''}">👥 Participantes</button>
            <button type="button" data-t="invitar" class="${tabLateral === 'invitar' ? 'on' : ''}">➕ Invitar</button>
          </div>
          <div class="ats-panel" id="ats-panel-c"></div>
        </aside>
      </div>`;
    if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) $('#ats-scr').style.display = 'none';
    $('#ats-mic').onclick = alternarMic;
    $('#ats-cam').onclick = async () => { const r = await VoiceManager.alternarCamara(); if (!r.ok) toast(r.motivo); actualizarDock(); actualizarTiles(); };
    $('#ats-scr').onclick = async () => { const r = await VoiceManager.alternarPantalla(); if (!r.ok) toast(r.motivo); actualizarDock(); actualizarTiles(); };
    $('#ats-out').onclick = desconectar;
    $('#ats-panel').onclick = () => { panelMovil = !panelMovil; $('#ats-side').classList.toggle('abierto', panelMovil); };
    $('#ats-link').onclick = () => copiar(enlaceSala(), 'Enlace copiado: pegalo donde quieras.');
    const cod = $('#ats-cod'); if (cod) cod.onclick = () => copiar(info.codigo, 'Código copiado.');
    sec.querySelectorAll('.ats-tabs button').forEach((b) => b.addEventListener('click', () => { tabLateral = b.dataset.t; sec.querySelectorAll('.ats-tabs button').forEach((x) => x.classList.toggle('on', x === b)); pintarLateral(); }));
    actualizarTiles(); actualizarDock(); pintarLateral(); sincronizarPip();
  }

  function pintarLateral() { if (tabLateral === 'invitar') pintarInvitar(); else pintarParticipantes(); }

  function estadoIcons(m) { return `${m.muted ? '🔇' : '🎤'}${m.cam ? ' 📷' : ''}${m.sharing ? ' 🖥️' : ''}`; }

  function pintarParticipantes() {
    const box = $('#ats-panel-c'); if (!box || !conectado || tabLateral !== 'participantes') return;
    const host = VoiceManager.hostId(), soy = VoiceManager.soyHost();
    const yoId = VoiceManager.yo.id;
    const filas = [{ id: yoId, meta: VoiceManager.yo.meta, mio: true }, ...ultimoPeers.map((p) => ({ id: p.id, meta: p.meta, mio: false }))];
    box.innerHTML = `<div class="ats-h">En la sala (${filas.length}/${VoiceManager.MAX_PARTICIPANTES})</div>` + filas.map((f) => `
      <div class="ats-p ${hablando.has(f.mio ? 'yo' : f.id) ? 'hablando' : ''}" data-id="${esc(f.mio ? 'yo' : f.id)}">
        <span class="at-d-av"><img src="${esc(f.meta.avatar || DEF_AVATAR)}" alt=""></span>
        <div class="ats-p-t"><b>${esc(f.meta.nombre || 'Compañero')}${f.mio ? ' <span style="color:var(--text-muted);font-weight:600">(vos)</span>' : ''}${f.id === host ? ' 👑' : ''}</b>
          <small>${f.id === host ? 'Anfitrión · ' : ''}${estadoIcons(f.meta)}</small></div>
        ${soy && !f.mio ? `<button type="button" data-k="${esc(f.id)}" title="Expulsar de la sala">Expulsar</button>` : ''}
      </div>`).join('') +
      (filas.length === 1 ? `<div class="at-nota" style="margin:10px 4px">Todavía no hay nadie más. Usá la pestaña <b>➕ Invitar</b> para traer compañeros.</div>` : '');
    box.querySelectorAll('button[data-k]').forEach((b) => b.addEventListener('click', () => expulsar(b.dataset.k)));
  }

  function expulsar(id) {
    const p = ultimoPeers.find((x) => x.id === id);
    const nombre = (p && p.meta && p.meta.nombre) || 'este participante';
    if (!confirm(`¿Expulsar a ${nombre} de la sala? No va a poder volver a entrar mientras vos sigas en ella.`)) return;
    const r = VoiceManager.expulsar(id);
    toast(r.ok ? `${r.nombre} fue expulsado de la sala.` : r.motivo);
    ultimoPeers = VoiceManager.peers; actualizarTiles(); pintarLateral();
  }

  async function pintarInvitar() {
    const box = $('#ats-panel-c'); if (!box || !conectado || tabLateral !== 'invitar') return;
    box.innerHTML = `
      <div class="ats-fila"><button type="button" class="at-btn sec" id="ats-i-link">🔗 Copiar enlace</button>${infoSala(conectado.sala) && infoSala(conectado.sala).codigo ? '<button type="button" class="at-btn sec" id="ats-i-cod">📋 Código</button>' : ''}</div>
      <div class="ats-h">Invitar por usuario</div>
      <div class="ats-fila"><input class="ats-busca" id="ats-u" placeholder="@usuario" autocomplete="off" style="flex:2"><button type="button" class="at-btn" id="ats-u-b" style="flex:1;padding:10px">Invitar</button></div>
      <div class="ats-h">Amigos</div>
      <input class="ats-busca" id="ats-f-q" placeholder="Buscar amigo…" autocomplete="off">
      <div id="ats-amigos" style="display:flex;flex-direction:column;gap:6px"><div class="at-nota">Cargando amigos…</div></div>`;
    $('#ats-i-link').onclick = () => copiar(enlaceSala(), 'Enlace copiado.');
    const bc = $('#ats-i-cod'); if (bc) bc.onclick = () => copiar(infoSala(conectado.sala).codigo, 'Código copiado.');
    $('#ats-u-b').onclick = async () => {
      const u = ($('#ats-u').value || '').trim().replace(/^@/, '');
      if (!u) return;
      const b = $('#ats-u-b'); b.disabled = true;
      try {
        const c = window.NikaSupabase && window.NikaSupabase.client;
        const { data } = await c.from('profiles_public').select('username, fullname').ilike('username', u).limit(1);
        if (!data || !data.length) { toast('No encontré a @' + u + '.'); return; }
        await enviarInvitacion(data[0].username, false);
        toast(`Invitación enviada a ${data[0].fullname || data[0].username}.`); $('#ats-u').value = '';
      } catch (e) { toast(e.message || 'No se pudo invitar.'); } finally { b.disabled = false; }
    };

    let amigos = [], mapa = {};
    try { amigos = await window.NikaFriends.listFriends(); } catch (_) {}
    try { mapa = window.NikaPresencia ? await window.NikaPresencia.ultimaVezAmigos() : {}; } catch (_) {}
    if (!$('#ats-amigos')) return;
    const NP = window.NikaPresencia;
    const enSala = new Set([VoiceManager.yo.meta.username, ...ultimoPeers.map((p) => p.meta && p.meta.username)]);
    const on = (a) => NP && NP.estaEnLinea(mapa[a.id]);
    amigos.sort((a, b) => (on(b) - on(a)) || String(mapa[b.id] || '').localeCompare(String(mapa[a.id] || '')));
    const dibujar = (q) => {
      const cont = $('#ats-amigos'); if (!cont) return;
      const lista = amigos.filter((a) => !q || (a.fullname + ' ' + a.username).toLowerCase().includes(q));
      if (!amigos.length) { cont.innerHTML = '<div class="at-nota">Todavía no tenés amigos agregados. Podés invitar por @usuario o compartir el enlace.</div>'; return; }
      cont.innerHTML = lista.map((a) => {
        const dentro = enSala.has(a.username), ya = invitados.has(a.username);
        return `<div class="ats-p"><span class="ats-dot ${on(a) ? 'on' : ''}"></span><span class="at-d-av" style="width:34px;height:34px"><img src="${esc(a.avatar || DEF_AVATAR)}" alt=""></span>
          <div class="ats-p-t"><b>${esc(a.fullname)}</b><small>${esc(NP ? (on(a) ? 'en línea' : NP.haceTiempo(mapa[a.id])) : '@' + a.username)}</small></div>
          <button type="button" class="inv" data-u="${esc(a.username)}" ${dentro || ya ? 'disabled' : ''}>${dentro ? 'En la sala' : ya ? '✓ Invitado' : 'Invitar'}</button></div>`;
      }).join('') || '<div class="at-nota">Sin resultados.</div>';
      cont.querySelectorAll('button.inv').forEach((b) => b.addEventListener('click', async () => {
        b.disabled = true;
        try { await enviarInvitacion(b.dataset.u, true); invitados.add(b.dataset.u); b.textContent = '✓ Invitado'; }
        catch (e) { b.disabled = false; toast(e.message || 'No se pudo enviar la invitación.'); }
      }));
    };
    dibujar('');
    $('#ats-f-q').addEventListener('input', (e) => dibujar(e.target.value.trim().toLowerCase()));
  }

  function actualizarControlesSala() {
    const mic = $('#ats-mic'); if (!mic || !conectado) return;
    const cam = $('#ats-cam'), scr = $('#ats-scr');
    const muted = !VoiceManager.micActivo;
    mic.classList.toggle('off', muted); mic.querySelector('i').textContent = muted ? '🔇' : '🎤';
    mic.querySelector('span').textContent = conectado.silenciosa ? 'Silenciado' : (muted ? 'Activar mic' : 'Silenciar');
    mic.disabled = conectado.silenciosa;
    cam.classList.toggle('act', VoiceManager.camActiva); cam.querySelector('span').textContent = VoiceManager.camActiva ? 'Apagar cámara' : 'Cámara';
    scr.classList.toggle('act', VoiceManager.pantallaActiva); scr.querySelector('span').textContent = VoiceManager.pantallaActiva ? 'Dejar de compartir' : 'Pantalla';
    const n = $('#ats-n'); if (n) n.textContent = `${1 + ultimoPeers.length}/${VoiceManager.MAX_PARTICIPANTES}`;
    const v = $('#ats-vacio'); if (v) v.style.display = ultimoPeers.length ? 'none' : 'block';
  }

  // ------------------------------------------------------------------ invitaciones en tiempo real
  let canalInv = null;
  async function iniciarInvitaciones() {
    if (canalInv || !usuario()) return;
    try {
      if (window.NikaScriptsReady) await window.NikaScriptsReady;
      const c = window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase);
      if (!c) return;
      canalInv = c.channel('ateneo-invitaciones', { config: { broadcast: { self: false } } });
      canalInv.on('broadcast', { event: 'invitacion' }, ({ payload }) => {
        if (!payload || String(payload.para || '').toLowerCase() !== String(metaPropia().username).toLowerCase()) return;
        if (!infoSala(payload.sala)) return;                       // solo salas con formato válido; el nombre se calcula acá
        mostrarInvitacion(payload);
      });
      canalInv.subscribe();
    } catch (e) { console.warn('[Ateneos] invitaciones no disponibles:', e && e.message); canalInv = null; }
  }

  async function enviarInvitacion(username, tambienChat) {
    if (!conectado) throw new Error('Primero entrá a una sala.');
    if (!canalInv) await iniciarInvitaciones();
    const yo = metaPropia();
    if (canalInv) canalInv.send({ type: 'broadcast', event: 'invitacion', payload: { para: username, de: yo.username, deNombre: yo.nombre, sala: conectado.sala } });
    // Respaldo: si la otra persona no tiene el campus abierto, le llega por chat con el enlace
    if (tambienChat && window.ChatManager && window.ChatManager.enviarMensaje) {
      try { await window.ChatManager.enviarMensaje(username, `📹 ${yo.nombre} te invita a “${conectado.nombre}” en la Sala de Ateneos.\n${enlaceSala()}`); } catch (_) {}
    }
  }

  let timerInv = null;
  function mostrarInvitacion(p) {
    css();
    let t = $('#at-inv-toast');
    if (!t) { t = document.createElement('div'); t.id = 'at-inv-toast'; document.body.appendChild(t); }
    const info = infoSala(p.sala);
    t.innerHTML = `<div><b>📹 ${esc(p.deNombre || p.de)}</b> te invita a <b>${esc(info.nombre)}</b></div>
      <div class="f"><button type="button" class="at-btn" id="at-inv-si">Unirme</button><button type="button" class="at-btn sec" id="at-inv-no">Ahora no</button></div>`;
    t.classList.add('on');
    clearTimeout(timerInv); timerInv = setTimeout(() => t.classList.remove('on'), 90000);
    $('#at-inv-no').onclick = () => t.classList.remove('on');
    $('#at-inv-si').onclick = async () => {
      t.classList.remove('on');
      try { await unirseASala(p.sala); } catch (e) { toast(e.message || 'No se pudo entrar a la sala.'); }
    };
  }

  async function unirseASala(sala) {
    const info = infoSala(sala); if (!info) throw new Error('Sala inválida.');
    if (!usuario()) throw new Error('Iniciá sesión para entrar a la sala.');
    if (conectado && conectado.sala === sala) return;
    if (conectado) await desconectar();
    if ($('#ateneos-section')) { const s = $('#ateneos-section'); if (s.style.display === 'none') abrir(); }
    tabLateral = 'participantes';
    await conectarSala(sala, info.nombre, info.silenciosa);
  }

  function revisarInvitacion() {
    const m = location.hash.match(/^#(?:ateneo-([A-Z2-9]{6})|sala-([a-z0-9-]+))$/);
    if (!m || !usuario() || conectado) return;
    const sala = m[1] ? 'p-' + m[1] : m[2];
    const info = infoSala(sala);
    history.replaceState(null, '', location.pathname + location.search);
    if (!info) return;
    if (confirm(`¿Unirte a “${info.nombre}” en la Sala de Ateneos?`)) unirseASala(sala).catch((e) => toast(e.message));
  }

  function init() {
    css();
    reconectarSiCorresponde();
    setTimeout(revisarInvitacion, 700);
    setTimeout(iniciarInvitaciones, 1800);
  }
  window.addEventListener('hashchange', () => setTimeout(revisarInvitacion, 100));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { abrir, volver, unirseASala, entrarCanal, crearPrivada, unirsePorCodigo, desconectar, probarMic, probarCam, mostrarVideo: () => mostrarVideo(false) };
})();

window.NikaAteneos = NikaAteneos;
