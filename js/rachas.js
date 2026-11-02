// js/rachas.js
// CAMPUS NIKA — Rachas diarias (🔥 N días de racha)
//
// Un día cuenta como "cumplido" si el usuario completó al menos 1 Pomodoro terminado
// (study_sessions, completed != false) o 1 simulacro (exam_results). Los días se
// evalúan con la hora local de Argentina (America/Argentina/Buenos_Aires), sin
// importar la zona horaria del dispositivo.
//
// Regla de reinicio: la racha sigue viva mientras el último día con actividad sea hoy
// o ayer (a lo sumo ~48 h sin actividad). Si el último día cumplido es anterior a ayer,
// la racha vuelve a 0 (y arranca en 1 apenas se cumple el primer bloque de hoy).
//
// Se inyecta en cualquier <span data-nika-racha-slot></span> de la página.

const NikaRachas = (() => {
  const TZ = 'America/Argentina/Buenos_Aires';
  const CACHE_KEY = 'nika_racha_cache';
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

  // 'YYYY-MM-DD' del día argentino de una fecha
  function diaAR(fecha) {
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d)) return null;
    return fmt.format(d);
  }
  // Suma/resta días a una clave 'YYYY-MM-DD' (aritmética en UTC: no hay DST en Argentina)
  function moverDia(clave, delta) {
    const [y, m, d] = clave.split('-').map(Number);
    return fmt.format(new Date(Date.UTC(y, m - 1, d + delta, 12)));
  }

  // Minutos estudiados por día (para la meta diaria) y meta configurada (se sincroniza entre dispositivos, ver pomodoroEngine.js)
  let minPorDia = {};
  const metaMin = () => { try { return Math.max(0, parseInt(localStorage.getItem('nika_pomo_goal_min') || '0', 10) || 0); } catch (_) { return 0; } };
  const fmtMin = (m) => { m = Math.round(m || 0); const h = Math.floor(m / 60); return h > 0 ? `${h} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`; };

  function calcular(diasActivos, hoy = diaAR(new Date())) {
    const ayer = moverDia(hoy, -1);
    const meta = metaMin();
    try { const e = window.PomodoroEngine && window.PomodoroEngine.getTodayMinutes(); if (e > (minPorDia[hoy] || 0)) minPorDia[hoy] = e; } catch (_) {}
    const hoyCumplido = diasActivos.has(hoy);
    let cursor = hoyCumplido ? hoy : (diasActivos.has(ayer) ? ayer : null);
    let racha = 0;
    while (cursor && diasActivos.has(cursor)) { racha++; cursor = moverDia(cursor, -1); }
    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
      const k = moverDia(hoy, -i);
      const [y, m, d] = k.split('-').map(Number);
      const etiqueta = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('es-AR', { weekday: 'short', timeZone: 'UTC' });
      const min = minPorDia[k] || 0;
      ultimos7.push({ clave: k, etiqueta, cumplido: diasActivos.has(k), esHoy: i === 0, min, meta: meta > 0 && min >= meta });
    }
    // Días seguidos cumpliendo la meta (igual criterio que la racha: hoy o ayer cuentan como vivo)
    let rachaMeta = 0;
    if (meta > 0) {
      let c = (minPorDia[hoy] || 0) >= meta ? hoy : ((minPorDia[ayer] || 0) >= meta ? ayer : null);
      while (c && (minPorDia[c] || 0) >= meta) { rachaMeta++; c = moverDia(c, -1); }
    }
    return { racha, hoyCumplido, ultimos7, meta, minHoy: minPorDia[hoy] || 0, metaHoy: meta > 0 && (minPorDia[hoy] || 0) >= meta, rachaMeta };
  }

  function getClient() {
    return (window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase)) || window.supabaseClient || null;
  }

  async function cargarDias() {
    const client = getClient();
    if (!client || !client.auth) return null;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    const desde = new Date(Date.now() - 400 * 86400000).toISOString();
    const dias = new Set();
    const [s, e] = await Promise.all([
      client.from('study_sessions').select('completed, completed_at, duration_minutes').eq('user_id', user.id).gte('completed_at', desde).limit(5000),
      client.from('exam_results').select('created_at').eq('user_id', user.id).gte('created_at', desde).limit(5000),
    ]);
    minPorDia = {};
    (s.data || []).forEach((r) => {
      const k = diaAR(r.completed_at);
      if (!k) return;
      minPorDia[k] = (minPorDia[k] || 0) + (r.duration_minutes || 0);
      if (r.completed !== false) dias.add(k);
    });
    (e.data || []).forEach((r) => { const k = diaAR(r.created_at); if (k) dias.add(k); });
    return dias;
  }

  // ---------- UI ----------
  let btn = null, pop = null, ultimo = null;

  function mensaje(r) {
    if (r.racha === 0) return 'Todavía no arrancaste una racha. ¡Un Pomodoro o un simulacro hoy y la empezás!';
    if (!r.hoyCumplido) return `Tenés ${r.racha} ${r.racha === 1 ? 'día' : 'días'} de racha. ¡Hacé un Pomodoro o un simulacro hoy para no perderla!`;
    if (r.racha < 3) return '¡Buen comienzo! Volvé mañana y la seguís armando.';
    if (r.racha < 7) return '¡Vas en llamas! Ya tenés el hábito casi armado.';
    if (r.racha < 30) return '¡Una semana o más sin fallar! Esa constancia se nota en los parciales.';
    return '¡Racha de residente! Increíble constancia, seguí así. 🏆';
  }

  function inyectarCss() {
    if (document.getElementById('nika-racha-css')) return;
    const st = document.createElement('style');
    st.id = 'nika-racha-css';
    st.textContent = `
      .nika-racha-wrap { position: relative; display: inline-flex; align-items: center; }
      .nika-racha-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 999px; border: 1px solid rgba(249,115,22,0.35);
        background: linear-gradient(135deg, rgba(251,146,60,0.16), rgba(239,68,68,0.12)); color: #c2410c; font-weight: 800; font-size: 0.82rem; cursor: pointer;
        font-family: inherit; white-space: nowrap; transition: transform .15s ease, box-shadow .2s ease; }
      .nika-racha-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px -6px rgba(234,88,12,0.55); }
      .nika-racha-btn.is-meta { border-color: rgba(250,204,21,.7); box-shadow: 0 0 0 2px rgba(250,204,21,.35); }
      .nika-racha-btn.is-cero { color: #64748b; border-color: rgba(148,163,184,0.4); background: rgba(148,163,184,0.12); }
      .nika-racha-btn.is-cero .nika-racha-fuego { filter: grayscale(1); opacity: .7; }
      .nika-racha-btn.is-pendiente .nika-racha-fuego { animation: nikaRachaLatido 1.6s ease-in-out infinite; }
      @keyframes nikaRachaLatido { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
      .nika-racha-pop { position: absolute; top: calc(100% + 10px); right: 0; z-index: 4500; width: 290px; max-width: calc(100vw - 24px); padding: 16px;
        background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 20px 45px -12px rgba(15,23,42,0.35); display: none; text-align: left; }
      .nika-racha-pop.open { display: block; animation: nikaRachaIn .18s ease; }
      @keyframes nikaRachaIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      .nika-racha-pop h4 { margin: 0 0 12px; font-size: 0.92rem; font-weight: 800; color: #9a3412; }
      .nika-racha-dias { display: flex; justify-content: space-between; gap: 4px; margin-bottom: 12px; }
      .nika-racha-dia { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.66rem; font-weight: 700; color: #64748b; text-transform: capitalize; }
      .nika-racha-dot { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800;
        background: #e2e8f0; color: #94a3b8; }
      .nika-racha-dot.ok { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 3px 8px -2px rgba(22,163,74,0.6); }
      .nika-racha-dot.hoy:not(.ok) { box-shadow: 0 0 0 2px #fb923c; }
      .nika-racha-msg { margin: 0; font-size: 0.8rem; line-height: 1.45; color: #475569; }
      body.dark-mode .nika-racha-pop { background: #0f172a; color: #e2e8f0; border-color: #1e293b; }
      body.dark-mode .nika-racha-pop h4 { color: #fdba74; }
      body.dark-mode .nika-racha-dot { background: #1e293b; }
      body.dark-mode .nika-racha-msg { color: #94a3b8; }
      .nika-racha-btn.is-festejo { animation: nikaRachaFesteja .9s ease 2; box-shadow: 0 0 0 0 rgba(250,204,21,.7); }
      @keyframes nikaRachaFesteja { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(250,204,21,.7); } 40% { transform: scale(1.14) rotate(-3deg); } 100% { transform: scale(1); box-shadow: 0 0 0 16px rgba(250,204,21,0); } }
      .nika-racha-dot { animation: nikaDotPop .35s cubic-bezier(.2,1.4,.4,1) both; animation-delay: calc(var(--i, 0) * 40ms); }
      @keyframes nikaDotPop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
      .nika-racha-dot.meta { box-shadow: 0 0 0 2px #fbbf24, 0 3px 10px -2px rgba(245,158,11,.7); }
      .nika-racha-dot.meta::after { content: '🎯'; position: absolute; font-size: .6rem; transform: translate(11px, -11px); }
      .nika-racha-dot { position: relative; }
      .nika-meta { margin: 0 0 12px; padding: 10px 12px; border-radius: 12px; background: rgba(251,191,36,.1); border: 1px solid rgba(251,191,36,.35); }
      .nika-meta-top { display: flex; justify-content: space-between; align-items: baseline; font-size: .74rem; font-weight: 800; color: #92400e; margin-bottom: 6px; }
      .nika-meta-bar { height: 8px; border-radius: 99px; background: rgba(0,0,0,.08); overflow: hidden; }
      .nika-meta-fill { height: 100%; width: 0; border-radius: 99px; background: linear-gradient(90deg, #fbbf24, #f97316); transition: width .9s cubic-bezier(.2,.8,.2,1); position: relative; overflow: hidden; }
      .nika-meta-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%); transform: translateX(-100%); animation: nikaMetaBrillo 2.4s ease-in-out infinite; }
      .nika-meta.ok .nika-meta-fill { background: linear-gradient(90deg, #22c55e, #16a34a); }
      @keyframes nikaMetaBrillo { 60%, 100% { transform: translateX(100%); } }
      .nika-meta-sub { margin: 6px 0 0; font-size: .7rem; color: #78716c; }
      body.dark-mode .nika-meta-top { color: #fcd34d; }
      body.dark-mode .nika-meta-sub { color: #a8a29e; }
      @media (prefers-reduced-motion: reduce) { .nika-racha-dot, .nika-racha-btn, .nika-meta-fill, .nika-meta-fill::after { animation: none !important; transition: none !important; } }
      @media (max-width: 520px) { .nika-racha-btn span.nika-racha-texto-largo { display: none; } .nika-racha-pop { position: fixed; top: 64px; right: 12px; left: 12px; width: auto; } }
    `;
    document.head.appendChild(st);
  }

  function montar() {
    const slot = document.querySelector('[data-nika-racha-slot]');
    if (!slot || document.getElementById('nika-racha-btn')) return !!document.getElementById('nika-racha-btn');
    inyectarCss();
    slot.innerHTML = `
      <span class="nika-racha-wrap">
        <button type="button" id="nika-racha-btn" class="nika-racha-btn is-cero" aria-haspopup="true" aria-expanded="false" title="Tu racha diaria">
          <span class="nika-racha-fuego">🔥</span><span id="nika-racha-texto">0 <span class="nika-racha-texto-largo">días de racha</span></span>
        </button>
        <div id="nika-racha-pop" class="nika-racha-pop" role="dialog" aria-label="Racha de los últimos 7 días"></div>
      </span>`;
    btn = document.getElementById('nika-racha-btn');
    pop = document.getElementById('nika-racha-pop');
    btn.addEventListener('click', (e) => { e.stopPropagation(); alternar(); });
    document.addEventListener('click', (e) => { if (pop && !pop.contains(e.target)) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    return true;
  }

  function abrir() { if (!pop) return; pop.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  function cerrar() { if (!pop) return; pop.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
  function alternar() { if (pop && pop.classList.contains('open')) cerrar(); else abrir(); }

  function metaHtml(r) {
    if (!r.meta) return `<div class="nika-meta"><p class="nika-meta-sub" style="margin:0">🎯 Fijá una <strong>meta diaria</strong> en ⚙️ del Pomodoro y cada día cumplido se marca acá.</p></div>`;
    const pct = Math.min(100, Math.round(r.minHoy / r.meta * 100));
    const falta = Math.max(0, r.meta - r.minHoy);
    return `<div class="nika-meta ${r.metaHoy ? 'ok' : ''}">
      <div class="nika-meta-top"><span>🎯 Meta de hoy ${r.metaHoy ? '✅' : ''}</span><span>${fmtMin(r.minHoy)} / ${fmtMin(r.meta)}</span></div>
      <div class="nika-meta-bar"><div class="nika-meta-fill" data-pct="${pct}"></div></div>
      <p class="nika-meta-sub">${r.metaHoy ? '¡Cumplida! Hoy suma a tu racha y a la Liga.' : `Te faltan ${fmtMin(falta)} para cumplirla.`}${r.rachaMeta > 1 ? ` · 🎯 ${r.rachaMeta} días seguidos con meta` : ''}</p>
    </div>`;
  }

  function pintar(r) {
    if (!btn) return;
    ultimo = r; btn.dataset.pintada = '1'; btn.style.display = '';
    const n = r.racha;
    document.getElementById('nika-racha-texto').innerHTML = `${n} <span class="nika-racha-texto-largo">${n === 1 ? 'día' : 'días'} de racha</span>`;
    btn.classList.toggle('is-cero', n === 0);
    btn.classList.toggle('is-pendiente', n > 0 && !r.hoyCumplido);
    pop.innerHTML = `
      <h4>🔥 ${n} ${n === 1 ? 'día' : 'días'} de racha</h4>
      ${metaHtml(r)}
      <div class="nika-racha-dias">${r.ultimos7.map((d, i) => `
        <div class="nika-racha-dia"><span class="nika-racha-dot ${d.cumplido ? 'ok' : ''} ${d.meta ? 'meta' : ''} ${d.esHoy ? 'hoy' : ''}" style="--i:${i}" title="${d.clave}${r.meta ? ' · ' + fmtMin(d.min) + (d.meta ? ' · meta cumplida' : '') : ''}">${d.cumplido ? '✓' : ''}</span>${d.etiqueta.replace('.', '')}</div>`).join('')}
      </div>
      <p class="nika-racha-msg">${mensaje(r)}</p>`;
    // la barra de la meta se llena con animación (un cuadro después de pintar)
    requestAnimationFrame(() => requestAnimationFrame(() => { const f = pop.querySelector('.nika-meta-fill'); if (f) f.style.width = f.dataset.pct + '%'; }));
    btn.classList.toggle('is-meta', !!r.metaHoy);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ dias: [...(r._dias || [])], min: minPorDia, t: Date.now() })); } catch (_) {}
  }

  async function refrescar() {
    if (!montar()) return;
    try {
      const dias = await cargarDias();
      if (!dias) {
        // sin datos por ahora (red o sesión que todavía no cargó): se conserva lo que ya estaba pintado y se reintenta
        if (!btn.dataset.pintada) btn.style.display = 'none';
        if ((refrescar._n = (refrescar._n || 0) + 1) <= 5) setTimeout(refrescar, 2500 * refrescar._n);
        return;
      }
      refrescar._n = 0; btn.style.display = '';
      const r = calcular(dias);
      r._dias = dias;
      pintar(r);
    } catch (err) {
      console.warn('[Rachas] No se pudo calcular la racha:', err && err.message);
    }
  }

  function init() {
    if (!montar()) return;
    // Pintado inmediato desde la copia local mientras llega Supabase
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && Array.isArray(c.dias)) { minPorDia = c.min || {}; const r = calcular(new Set(c.dias)); r._dias = new Set(c.dias); pintar(r); }
    } catch (_) {}
    refrescar();
    let t = null;
    const diferido = () => { clearTimeout(t); t = setTimeout(refrescar, 800); };
    window.addEventListener('nika:rendimiento-changed', diferido);
    window.addEventListener('nika:estudio-guardado', diferido);
    window.addEventListener('nika:meta-actualizada', diferido);
    window.addEventListener('nika:meta-diaria', () => { if (btn) { btn.classList.add('is-festejo'); setTimeout(() => btn && btn.classList.remove('is-festejo'), 2600); } diferido(); });
    try { new BroadcastChannel('nika-rendimiento').onmessage = diferido; } catch (_) {}
    document.addEventListener('visibilitychange', () => { if (!document.hidden) diferido(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, refrescar, calcular, diaAR };
})();

window.NikaRachas = NikaRachas;
