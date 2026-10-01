/* Campus Nika — 🍅 Sala de estudio (sala de espera del Pomodoro compartido).
   El Host arma la sala, invita (hasta 4) y recién cuando toca "Iniciar" arranca el reloj para todos a la vez.
   Los invitados ven la sala (quiénes están, cuánto dura, qué se estudia) hasta que el Host inicia.
   Depende de: PomodoroEngine, PomodoroSyncManager, NikaFriends (todos ya cargados en campus.html). */
(function () {
  'use strict';
  const MAX = 4;
  const DATA_FILES = { cirugia: 'data/cirugia.json', ginecologia: 'data/gineco_data.json' };
  const NOMBRES_MODULO = { cirugia: 'Cirugía', ginecologia: 'Ginecología', biblioteca: 'Estudio libre' };
  const AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fca5a5'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  let overlay = null, abierta = false, contando = false, amigos = [], unidades = null, timer = null, pickerAbierto = false, desuscribir = [];
  const E = () => window.PomodoroEngine;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const toast = (m, t) => { if (typeof window.showToast === 'function') window.showToast(m, t); };
  const yo = () => { try { return JSON.parse(localStorage.getItem('nika_currentUser')) || null; } catch (_) { return null; } };
  const perfil = (u) => amigos.find((a) => a.username === u) || ((yo() && yo().username === u) ? yo() : null);

  function css() {
    if (document.getElementById('nika-sala-css')) return;
    const st = document.createElement('style'); st.id = 'nika-sala-css';
    st.textContent = `
    #sala-overlay{position:fixed;inset:0;z-index:3900;display:flex;align-items:center;justify-content:center;padding:14px;background:radial-gradient(circle at 50% 20%,rgba(190,18,60,.55),rgba(30,4,10,.94) 70%);backdrop-filter:blur(6px);animation:salaFade .3s ease}
    @keyframes salaFade{from{opacity:0}to{opacity:1}}
    .sala-card{position:relative;overflow:hidden;width:min(560px,100%);max-height:94vh;overflow-y:auto;border-radius:26px;padding:26px 24px 22px;color:#fff1f2;background:linear-gradient(160deg,rgba(76,5,25,.96),rgba(32,4,12,.98));border:1px solid rgba(251,113,133,.4);box-shadow:0 30px 80px -20px rgba(225,29,72,.7),0 0 0 1px rgba(255,255,255,.04) inset;animation:salaPop .45s cubic-bezier(.2,1.3,.4,1)}
    @keyframes salaPop{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}
    .sala-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
    .sala-bg span{position:absolute;bottom:-40px;font-size:1.6rem;opacity:.16;animation:salaSube linear infinite}
    @keyframes salaSube{to{transform:translateY(-640px) rotate(40deg);opacity:0}}
    .sala-head{position:relative;text-align:center}
    .sala-tomate{font-size:3.2rem;display:inline-block;animation:salaLate 1.8s ease-in-out infinite;filter:drop-shadow(0 6px 18px rgba(244,63,94,.8))}
    @keyframes salaLate{0%,100%{transform:scale(1) rotate(-4deg)}50%{transform:scale(1.12) rotate(4deg)}}
    .sala-head h2{margin:2px 0 2px;font-size:1.45rem;font-weight:800;letter-spacing:.01em}
    .sala-head p{margin:0;font-size:.82rem;color:#fda4af}
    .sala-x{position:absolute;top:-6px;right:-4px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;font-size:.95rem}
    .sala-x:hover{background:rgba(255,255,255,.2)}
    .sala-config{position:relative;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px 0 4px}
    .sala-cfg-item{display:flex;flex-direction:column;gap:4px;font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fda4af}
    .sala-cfg-item input,.sala-cfg-item select{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(251,113,133,.35);border-radius:10px;padding:8px 10px;font:inherit;font-size:.85rem;font-weight:700;text-transform:none;letter-spacing:0;outline:none}
    .sala-cfg-item input{width:78px;text-align:center}.sala-cfg-item select{max-width:230px}
    .sala-cfg-item input:focus,.sala-cfg-item select:focus{border-color:#fb7185;box-shadow:0 0 0 3px rgba(251,113,133,.25)}
    .sala-cfg-item option,.sala-cfg-item optgroup{background:#3b0a1a;color:#fff}
    .sala-chips{position:relative;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0 4px}
    .sala-chip{padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(251,113,133,.3);font-size:.78rem;font-weight:700}
    .sala-meter{position:relative;display:flex;justify-content:center;align-items:center;gap:6px;margin:16px 0 6px;font-size:.78rem;font-weight:800;color:#fecdd3}
    .sala-meter i{font-style:normal;font-size:1.1rem;filter:grayscale(1);opacity:.35;transition:all .35s cubic-bezier(.2,1.6,.4,1)}
    .sala-meter i.on{filter:none;opacity:1;transform:scale(1.2)}
    .sala-seats{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:8px 0 6px}
    .sala-seat{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
    .sala-av{position:relative;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border:2px dashed rgba(251,113,133,.45);color:#fda4af;font-size:1.5rem;font-weight:800;cursor:default;transition:transform .2s}
    .sala-av img{width:100%;height:100%;border-radius:50%;object-fit:cover}
    .sala-seat.libre .sala-av{cursor:pointer}
    .sala-seat.libre .sala-av:hover{transform:scale(1.08);border-color:#fb7185;box-shadow:0 0 22px rgba(251,113,133,.6)}
    .sala-seat.libre.host-ve .sala-av{animation:salaHueco 2.4s ease-in-out infinite}
    @keyframes salaHueco{0%,100%{box-shadow:0 0 0 0 rgba(251,113,133,.45)}50%{box-shadow:0 0 0 9px rgba(251,113,133,0)}}
    .sala-seat.entro .sala-av{border:3px solid #fb7185;border-style:solid;box-shadow:0 0 22px rgba(244,63,94,.75);animation:salaEntra .6s cubic-bezier(.2,1.7,.4,1)}
    @keyframes salaEntra{from{transform:scale(.2) rotate(-30deg);opacity:0}to{transform:none;opacity:1}}
    .sala-seat.host .sala-av{border:3px solid #fbbf24;border-style:solid;box-shadow:0 0 24px rgba(251,191,36,.6)}
    .sala-seat.espera .sala-av{border-style:solid;border-color:#fda4af;animation:salaEspera 1.4s ease-in-out infinite}
    @keyframes salaEspera{0%,100%{opacity:.55}50%{opacity:1}}
    .sala-tag{position:absolute;right:-6px;bottom:-4px;min-width:22px;height:22px;border-radius:50%;background:#22c55e;color:#fff;font-size:.7rem;display:flex;align-items:center;justify-content:center;border:2px solid #4c0519}
    .sala-tag.crown{background:#f59e0b}.sala-tag.off{background:#94a3b8}
    .sala-nom{max-width:100%;font-size:.7rem;font-weight:700;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ffe4e6}
    .sala-nom small{display:block;font-size:.62rem;font-weight:600;color:#fda4af}
    .sala-cancel{border:0;background:none;color:#fda4af;font-size:.62rem;cursor:pointer;text-decoration:underline;padding:0}
    .sala-picker{position:relative;margin:10px 0 2px;padding:12px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(251,113,133,.3);animation:salaPop .25s ease}
    .sala-picker h4{margin:0 0 8px;font-size:.82rem;font-weight:800}
    .sala-amigos{display:flex;flex-direction:column;gap:6px;max-height:190px;overflow-y:auto}
    .sala-amigo{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:12px;background:rgba(255,255,255,.05)}
    .sala-amigo img{width:34px;height:34px;border-radius:50%;object-fit:cover}
    .sala-amigo b{flex:1;min-width:0;font-size:.82rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .sala-amigo b small{display:block;font-weight:600;color:#fda4af;font-size:.68rem}
    .sala-amigo button{border:0;border-radius:999px;padding:6px 14px;font:inherit;font-size:.74rem;font-weight:800;cursor:pointer;color:#fff;background:linear-gradient(135deg,#f43f5e,#be123c)}
    .sala-amigo button:disabled{opacity:.4;cursor:not-allowed;background:#64748b}
    .sala-foot{position:relative;display:flex;gap:10px;margin-top:18px}
    .sala-btn{flex:1;border:0;border-radius:14px;padding:13px 16px;font:inherit;font-size:.88rem;font-weight:800;cursor:pointer;color:#fff;transition:transform .15s,box-shadow .2s}
    .sala-btn:hover{transform:translateY(-2px)}
    .sala-btn.sec{flex:0 0 auto;background:rgba(255,255,255,.1);color:#ffe4e6}
    .sala-btn.go{position:relative;overflow:hidden;background:linear-gradient(135deg,#fb7185,#e11d48 55%,#9f1239);box-shadow:0 12px 30px -8px rgba(244,63,94,.85);animation:salaGo 2.2s ease-in-out infinite}
    @keyframes salaGo{0%,100%{box-shadow:0 12px 30px -8px rgba(244,63,94,.85)}50%{box-shadow:0 12px 40px -2px rgba(244,63,94,1)}}
    .sala-btn.go::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);animation:salaBrillo 3s ease-in-out infinite}
    @keyframes salaBrillo{0%,60%{left:-60%}100%{left:130%}}
    .sala-btn:disabled{opacity:.6;cursor:wait;animation:none}
    .sala-espera{position:relative;flex:1;text-align:center;padding:13px;border-radius:14px;background:rgba(255,255,255,.07);font-size:.85rem;font-weight:700;color:#fecdd3}
    .sala-espera b{display:inline-block;animation:salaLate 1.8s ease-in-out infinite}
    .sala-cuenta{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(32,4,12,.9);border-radius:26px}
    .sala-cuenta strong{font-size:6rem;line-height:1;font-weight:800;animation:salaNum 1s ease-in-out both}
    @keyframes salaNum{0%{transform:scale(2.2);opacity:0}30%{transform:scale(1);opacity:1}100%{transform:scale(.8);opacity:.2}}
    .sala-cuenta span{margin-top:8px;font-weight:800;color:#fda4af}
    .sala-boom{position:fixed;inset:0;z-index:3950;pointer-events:none;overflow:hidden}
    .sala-boom i{position:absolute;bottom:30%;font-style:normal;font-size:2rem;animation:salaBoom 1.4s ease-out forwards}
    @keyframes salaBoom{to{transform:translate(var(--dx),-70vh) rotate(var(--r));opacity:0}}
    @media(max-width:520px){.sala-seats{grid-template-columns:repeat(5,1fr);gap:4px}.sala-av{width:48px;height:48px;font-size:1.2rem}.sala-card{padding:22px 14px 16px}.sala-foot{flex-wrap:wrap}.sala-btn.sec{flex:1}}
    @media(prefers-reduced-motion:reduce){.sala-card *,.sala-card{animation:none!important}}
    `;
    document.head.appendChild(st);
  }

  async function cargarUnidades() {
    if (unidades) return unidades;
    unidades = {};
    for (const k of Object.keys(DATA_FILES)) {
      try { const r = await fetch(DATA_FILES[k]); if (r.ok) unidades[k] = (await r.json()).units || []; } catch (_) {}
    }
    return unidades;
  }
  async function cargarAmigos() {
    try { amigos = await window.NikaFriends.listFriends(); } catch (_) { amigos = []; }
  }

  function estadoRoom() {
    const st = E().getState(), sh = st.shared;
    return { st, sh, host: !!(sh && sh.role === 'host'), invitado: !!(sh && sh.role === 'guest') };
  }

  // ----- apertura / cierre -----
  async function abrir() {
    if (!E() || !window.PomodoroSyncManager) { toast('El Pomodoro compartido no está disponible todavía.'); return; }
    const { st, sh } = estadoRoom();
    if (!sh) {
      if (st.status !== 'idle') { toast('Tu reloj ya está en marcha. Detenelo y armá una sala para que arranquen todos juntos.'); return; }
      const r = E().openRoom();
      if (!r.ok) { toast(r.reason === 'guest' ? 'Estás como invitado en otra sala: salí primero.' : 'No se pudo abrir la sala.'); return; }
    } else if (sh.role === 'host' && st.status !== 'idle') { toast('Tu sesión ya está en marcha.'); return; }
    css();
    await Promise.all([cargarAmigos(), cargarUnidades()]);
    if (!overlay) {
      overlay = document.createElement('div'); overlay.id = 'sala-overlay';
      overlay.addEventListener('click', onClick);
      overlay.addEventListener('change', onChange);
      document.body.appendChild(overlay);
    }
    abierta = true; contando = false; pickerAbierto = false;
    render();
    desuscribir.forEach((f) => f()); desuscribir = [];
    desuscribir.push(E().on('change', alCambiar), E().on('shared', alCambiar));
    clearInterval(timer); timer = setInterval(() => { if (abierta && !contando) render(true); }, 2500);
  }

  function cerrar() {
    abierta = false; contando = false; clearInterval(timer);
    desuscribir.forEach((f) => f()); desuscribir = [];
    if (overlay) { overlay.remove(); overlay = null; }
  }

  function alCambiar() {
    if (!abierta) return;
    const { st, sh } = estadoRoom();
    if (!sh) { cerrar(); return; }                                       // me fui / el Host cerró la sala
    if (st.status === 'running' && !contando) { explotar(); cerrar(); return; }   // el Host inició: ¡a estudiar!
    if (!contando) render(true);
  }

  // ----- render -----
  function bgTomates() {
    let h = '';
    for (let i = 0; i < 9; i++) h += `<span style="left:${5 + i * 11}%;animation-duration:${9 + (i % 4) * 3}s;animation-delay:${-i * 1.7}s;font-size:${1.2 + (i % 3) * .5}rem">${i % 3 === 0 ? '🌿' : '🍅'}</span>`;
    return `<div class="sala-bg">${h}</div>`;
  }

  function asiento(tipo, u, extra) {
    const p = u ? perfil(u) : null;
    const nombre = p ? (p.fullname || '').split(' ')[0] : (u || '');
    const img = p && p.avatar ? esc(p.avatar) : AVATAR;
    if (tipo === 'libre') return `<div class="sala-seat libre ${extra || ''}" data-libre="1"><div class="sala-av" title="Invitar">＋</div><div class="sala-nom">Libre</div></div>`;
    const marca = tipo === 'host' ? '<span class="sala-tag crown">👑</span>' : (tipo === 'espera' ? '' : `<span class="sala-tag ${extra === 'off' ? 'off' : ''}">✓</span>`);
    const sub = tipo === 'host' ? '<small>Host</small>' : (tipo === 'espera' ? '<small>invitado…</small>' : '');
    const cancelar = tipo === 'espera' && estadoRoom().host ? `<button class="sala-cancel" data-cancelar="${esc(u)}">cancelar</button>` : '';
    return `<div class="sala-seat ${tipo === 'host' ? 'host' : tipo === 'espera' ? 'espera' : 'entro'}"><div class="sala-av"><img src="${img}" alt="" onerror="this.style.display='none'">${marca}</div><div class="sala-nom">${esc(nombre || u)}${sub}</div>${cancelar}</div>`;
  }

  function opcionesUnidades(st) {
    const actual = `${st.moduleId || 'biblioteca'}|${st.upId || 'General'}`;
    let h = `<option value="biblioteca|General" ${actual === 'biblioteca|General' ? 'selected' : ''}>Estudio libre</option>`;
    Object.keys(unidades || {}).forEach((m) => {
      h += `<optgroup label="${esc(NOMBRES_MODULO[m] || m)}">` + unidades[m].map((u) => {
        const v = `${m}|${u.id}`;
        return `<option value="${esc(v)}" ${v === actual ? 'selected' : ''}>UP${esc(u.number)} · ${esc(String(u.title || '').trim())}</option>`;
      }).join('') + '</optgroup>';
    });
    return h;
  }

  function render(suave) {
    if (!overlay) return;
    const { st, sh, host } = estadoRoom();
    if (!sh) return;
    const joined = host ? (sh.guests || []).filter((g) => g.joined).map((g) => g.username) : (sh.roster || []);
    const invitados = host ? (sh.guests || []).filter((g) => !g.joined && Date.now() - g.at < 90000).map((g) => g.username) : [];
    const online = host ? Object.fromEntries((sh.guests || []).map((g) => [g.username, g.online])) : {};
    const total = 1 + joined.length;
    const w = host ? E().getMinutes('work') : (sh.workMin || st.durationMin || 25);
    const b = host ? E().getMinutes('break') : (sh.breakMin || E().getMinutes('break'));
    const tema = E().formatTema ? E().formatTema(st) : '';

    // si el picker o un input están enfocados no se redibuja entero (se perdería lo que se está tocando)
    if (suave && overlay.contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName)) return;

    let asientos = asiento('host', sh.hostUsername || (window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername()));
    joined.forEach((u) => { asientos += asiento('entro', u, online[u] === false ? 'off' : ''); });
    invitados.forEach((u) => { asientos += asiento('espera', u); });
    for (let i = 1 + joined.length + invitados.length; i < 1 + MAX; i++) asientos += asiento('libre', null, host ? 'host-ve' : '');

    const tomates = Array.from({ length: 1 + MAX }, (_, i) => `<i class="${i < total ? 'on' : ''}">🍅</i>`).join('');

    const config = host ? `
      <div class="sala-config">
        <label class="sala-cfg-item">Estudio (min)<input type="number" id="sala-w" min="1" max="120" value="${w}"></label>
        <label class="sala-cfg-item">Descanso (min)<input type="number" id="sala-b" min="1" max="60" value="${b}"></label>
        <label class="sala-cfg-item">Unidad<select id="sala-up">${opcionesUnidades(st)}</select></label>
      </div>` : `
      <div class="sala-chips"><span class="sala-chip">⏱️ ${w} min estudio</span><span class="sala-chip">☕ ${b} min descanso</span>${tema ? `<span class="sala-chip">📚 ${esc(tema)}</span>` : ''}</div>`;

    const picker = host && pickerAbierto ? `
      <div class="sala-picker"><h4>Invitar a un amigo <small style="font-weight:600;color:#fda4af">· ${Math.max(0, MAX - joined.length - invitados.length)} lugares libres</small></h4>
        <div class="sala-amigos">${amigosHtml(joined, invitados) || '<div style="font-size:.78rem;color:#fda4af">No tenés amigos para invitar todavía.</div>'}</div></div>` : '';

    const pie = host ? `
      <div class="sala-foot">
        <button class="sala-btn sec" data-cerrar-sala="1">Cerrar sala</button>
        <button class="sala-btn go" data-iniciar="1">🍅 Iniciar Pomodoro${joined.length ? ` con ${total} personas` : ' (solo)'}</button>
      </div>` : `
      <div class="sala-foot">
        <button class="sala-btn sec" data-salir="1">Salir de la sala</button>
        <div class="sala-espera"><b>🍅</b> Esperando que @${esc(sh.hostUsername || 'el Host')} inicie el Pomodoro…</div>
      </div>`;

    overlay.innerHTML = `
      <div class="sala-card" role="dialog" aria-label="Sala de estudio">
        ${bgTomates()}
        <div class="sala-head">
          <button class="sala-x" data-min="1" aria-label="Minimizar" title="Minimizar (la sala sigue abierta)">—</button>
          <div class="sala-tomate">🍅</div>
          <h2>Sala de estudio</h2>
          <p>${host ? 'Invitá a tus compañeros. El reloj arranca cuando vos lo decidas: todos empiezan juntos.' : `Sala de @${esc(sh.hostUsername || '')} · ya estás adentro`}</p>
        </div>
        ${config}
        <div class="sala-meter">${tomates}<span>${total} / ${1 + MAX} en la sala</span></div>
        <div class="sala-seats">${asientos}</div>
        ${picker}
        ${pie}
      </div>`;
  }

  function amigosHtml(joined, invitados) {
    const ya = new Set([...joined, ...invitados]);
    const on = window.PomodoroSyncManager.estadoDeAmigos(amigos.map((a) => a.username));
    const enLinea = new Set(on.map((o) => o.username));
    const lugares = MAX - joined.length - invitados.length;
    return amigos.filter((a) => a.username && !ya.has(a.username))
      .sort((x, y) => (enLinea.has(y.username) ? 1 : 0) - (enLinea.has(x.username) ? 1 : 0))
      .map((a) => `<div class="sala-amigo"><img src="${esc(a.avatar || AVATAR)}" alt="" onerror="this.src='${AVATAR}'"><b>${esc(a.fullname)}<small>@${esc(a.username)} · ${enLinea.has(a.username) ? '🟢 en línea' : 'sin conexión'}</small></b>
        <button data-invitar="${esc(a.username)}" ${lugares <= 0 || !enLinea.has(a.username) ? 'disabled' : ''}>Invitar</button></div>`).join('');
  }

  // ----- acciones -----
  async function invitar(u) {
    const r = E().becomeHost(u);
    if (!r.ok) { toast(r.reason === 'full' ? `Tu sala ya tiene ${MAX} invitados (el máximo).` : 'No se pudo invitar.'); return; }
    try {
      await window.PomodoroSyncManager.invitarASincronizar(u, { sessionId: r.sessionId, tema: r.tema });
      toast(`🧉 Invitación enviada a @${u}.`);
    } catch (_) { toast('No se pudo enviar la invitación. Probá de nuevo.'); }
    render();
  }

  async function iniciar() {
    if (contando) return;
    contando = true;
    const card = overlay.querySelector('.sala-card');
    const capa = document.createElement('div'); capa.className = 'sala-cuenta';
    card.appendChild(capa);
    for (const n of [3, 2, 1]) {
      capa.innerHTML = `<strong>${n}</strong><span>¡Preparados!</span>`;
      await new Promise((r) => setTimeout(r, 1000));
      if (!overlay) return;
    }
    E().start();          // acá arranca el reloj, para todos a la vez (contando sigue en true: el 'change' no cierra dos veces)
    explotar(); cerrar();
  }

  function explotar() {
    const c = document.createElement('div'); c.className = 'sala-boom';
    c.innerHTML = Array.from({ length: 22 }, (_, i) => `<i style="left:${10 + Math.random() * 80}%;--dx:${(Math.random() - .5) * 240}px;--r:${(Math.random() - .5) * 720}deg;animation-delay:${Math.random() * .25}s">${i % 4 === 0 ? '🌿' : '🍅'}</i>`).join('');
    document.body.appendChild(c); setTimeout(() => c.remove(), 1800);
    toast('🍅 ¡A estudiar! El reloj ya está en marcha.', 'success');
  }

  function onClick(e) {
    const t = e.target;
    const q = (sel) => t.closest(sel);
    let el;
    if ((el = q('[data-invitar]'))) return invitar(el.dataset.invitar);
    if ((el = q('[data-cancelar]'))) { E().releaseInvite(el.dataset.cancelar); return render(); }
    if (q('[data-libre]') && estadoRoom().host) { pickerAbierto = !pickerAbierto; return render(); }
    if (q('[data-iniciar]')) return iniciar();
    if (q('[data-min]')) return cerrar();
    if (q('[data-cerrar-sala]')) { E().leaveShared({ notify: true }); return cerrar(); }
    if (q('[data-salir]')) { E().leaveShared({ notify: true }); return cerrar(); }
    if (t === overlay) return cerrar();
  }

  function onChange(e) {
    if (!estadoRoom().host) return;
    const w = document.getElementById('sala-w'), b = document.getElementById('sala-b'), up = document.getElementById('sala-up');
    if (!w || !b || !up) return;
    const [moduleId, upId] = String(up.value).split('|');
    let upLabel = 'Estudio libre';
    const u = (unidades[moduleId] || []).find((x) => x.id === upId);
    if (u) upLabel = String(u.title || '').trim();
    E().setRoomConfig({ workMin: w.value, breakMin: b.value, moduleId, upId, upLabel });
  }

  // El invitado entra a una sala: se le abre sola la sala de espera
  function enganchar() {
    if (!E() || window._nikaSalaHook) { if (!E()) setTimeout(enganchar, 400); return; }
    window._nikaSalaHook = true;
    E().on('shared', (e) => {
      if (e && e.tipo === 'joined' && !abierta && E().getState().status === 'idle') setTimeout(abrir, 400);
    });
    // si recargó la página estando en una sala de espera, vuelve a mostrarse
    const { st, sh } = estadoRoom();
    if (sh && st.status === 'idle' && sh.role === 'guest' && !abierta) setTimeout(abrir, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enganchar); else enganchar();

  window.NikaSala = { abrir, cerrar, get abierta() { return abierta; } };
  window.abrirSalaEstudio = abrir;
})();
