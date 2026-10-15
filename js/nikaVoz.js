/* CAMPUS NIKA · Voz compartida de todos los simuladores.
   - Una sola configuración de voz (dispositivo o voces descargables Piper) para todo el campus: se elige una vez y vale en
     el Simulador Examen oral, el Pase de Sala, Shock Room, Consultorios, ECOE y las acreditaciones.
   - Pantalla de descarga animada con frases, tiempo restante estimado y velocidad.
   Depende de js/vozLocal.js (voces descargables). window.NikaVoz = { ... } */
(function () {
  'use strict';
  if (window.NikaVoz) return;
  const K = { sel: 'nika_eo_voz2', vol: 'nika_eo_vol', vel: 'nika_eo_vel', dev: 'nika_eo_vozdev', on: 'nika_voz_on' };
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, String(v)); } catch (_) {} } };
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VL = () => window.NikaVozLocal;
  const localesOk = () => !!(VL() && VL().soportado());

  const P = { // matiz de la voz según el rol o el ánimo
    contento: { rate: 1.05, pitch: 1.12 }, cordial: { rate: 1.0, pitch: 1.0 }, serio: { rate: 0.92, pitch: 0.86 }, molesto: { rate: 0.88, pitch: 0.74 },
    m: { rate: 1.0, pitch: 0.85 }, a: { rate: 1.0, pitch: 1.0 }, p: { rate: 1.05, pitch: 1.12 }
  };
  const S = { tok: 0, audio: null, voces: [], lista: {}, listaCargada: false, nodisp: {} };

  /* ---------- preferencias ---------- */
  const sel = () => { const v = ls.get(K.sel); return v && /^(dev|loc:)/.test(v) ? v : 'dev'; };
  const vol = () => { const n = ls.get(K.vol); const v = Number(n); return n !== null && v >= 0 && v <= 1 ? v : 0.9; };
  const vel = () => { const v = Number(ls.get(K.vel)); return v >= 0.7 && v <= 1.4 ? v : 1; };

  function vocesDispositivo() {
    try { S.voces = (window.speechSynthesis.getVoices() || []).filter((v) => /^es/i.test(v.lang)); } catch (_) { S.voces = []; }
    S.voces.sort((a, b) => (/es-AR/i.test(b.lang) - /es-AR/i.test(a.lang)) || (/es-(MX|US|419)/i.test(b.lang) - /es-(MX|US|419)/i.test(a.lang)) || a.name.localeCompare(b.name));
    return S.voces;
  }
  async function refrescar() {
    if (!localesOk()) { S.listaCargada = true; return S.lista; }
    const ya = await VL().guardadas();
    Object.keys(VL().VOCES).forEach((k) => { S.lista[k] = ya.includes(VL().VOCES[k].id); });
    S.listaCargada = true; return S.lista;
  }
  const claveLocal = () => { const s = sel(); return s.startsWith('loc:') ? s.slice(4) : ''; };
  // ¿hay una voz lista para usar sin descargar nada?
  function lista() {
    const k = claveLocal();
    if (k) return !!(S.lista[k] && !S.nodisp[k]);
    return vocesDispositivo().length > 0;
  }

  /* ---------- hablar ---------- */
  function trocear(texto, max) {
    const t = String(texto).replace(/\s+/g, ' ').trim();
    const partes = t.match(/[^.!?;:]+[.!?;:]?/g) || [t];
    const out = []; let acc = '';
    partes.forEach((p) => { if ((acc + p).length > max) { if (acc) out.push(acc); acc = p; } else acc += p; });
    if (acc) out.push(acc);
    return out.map((x) => x.trim()).filter(Boolean);
  }
  const limpiar = (t) => String(t || '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\[[^\]]*\]/g, ' ').replace(/[*_`#>«»]/g, '').replace(/\s+/g, ' ').trim();

  function reproducir(url, tok, ajuste) {
    return new Promise((resolve) => {
      if (tok !== S.tok) return resolve();
      const a = new Audio(url); S.audio = a; a.volume = vol(); a.playbackRate = Math.max(0.5, Math.min(2, vel() * ajuste.rate));
      const fin = () => { if (S.audio === a) S.audio = null; resolve(); };
      a.onended = fin; a.onerror = fin; a.play().catch(fin);
    });
  }
  async function hablarLocal(texto, k, ajuste, tok) {
    const trozos = trocear(texto, 240);
    let sig = VL().sintetizar(k, trozos[0]);
    for (let i = 0; i < trozos.length; i++) {
      const url = await sig;
      if (tok !== S.tok) return;
      if (i + 1 < trozos.length) sig = VL().sintetizar(k, trozos[i + 1]);
      await reproducir(url, tok, ajuste);
    }
  }
  function hablarDispositivo(texto, ajuste, tok) {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis; const vs = vocesDispositivo();
      if (!synth || !vs.length) return resolve();
      const guardada = ls.get(K.dev) || '';
      const voz = vs.find((v) => v.name === guardada) || vs[0];
      const trozos = trocear(texto, 170); let i = 0;
      const sig = () => {
        if (tok !== S.tok || i >= trozos.length) return resolve();
        const u = new SpeechSynthesisUtterance(trozos[i++]);
        u.lang = voz.lang || 'es-AR'; u.voice = voz; u.rate = Math.max(0.5, Math.min(2, ajuste.rate * vel())); u.pitch = ajuste.pitch; u.volume = vol();
        u.onend = () => setTimeout(sig, 120); u.onerror = () => sig();
        synth.speak(u);
      };
      sig();
    });
  }
  // opts: { mood | rol }
  async function hablar(texto, opts) {
    const t = limpiar(texto); if (!t) return;
    const ajuste = P[(opts && (opts.mood || opts.rol)) || 'cordial'] || P.cordial;
    const tok = ++S.tok;
    try { if (S.audio) { S.audio.pause(); S.audio = null; } window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
    if (!S.listaCargada) await refrescar();
    const k = claveLocal();
    if (k && S.lista[k] && !S.nodisp[k]) {
      try { await hablarLocal(t, k, ajuste, tok); return; } catch (_) { S.nodisp[k] = true; }
    }
    await hablarDispositivo(t, ajuste, tok);
  }
  function callar() {
    S.tok++;
    try { if (S.audio) { S.audio.pause(); S.audio = null; } window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
  }

  /* ---------- pantalla de descarga: animada, con frases y tiempo restante ---------- */
  const FRASES = [
    'Preparando a tu profesor…',
    'Esto se hace una sola vez: después funciona sin conexión.',
    'La voz se genera en tu propio dispositivo, sin enviar nada a internet.',
    'Mientras tanto, respirá hondo y ordená tus ideas.',
    'Tip: respondé en frases cortas y claras, como en un oral real.',
    'Estructura de oro: definición, fisiopatología, clínica, diagnóstico y conducta.',
    'Si te trabás, decí lo que sí sabés: eso también suma.',
    'En el oral, escuchá bien la repregunta: casi siempre apunta a un dato clave.',
    'Un buen examen se prepara repitiendo en voz alta.',
    'Ya casi: afinando la garganta del profesor…'
  ];
  let ov = null, tFrase = null, iFrase = 0, t0 = 0, ult = { t: 0, c: 0 }, vProm = 0;
  function css() {
    if (document.getElementById('nikavoz-css')) return;
    const st = document.createElement('style'); st.id = 'nikavoz-css';
    st.textContent = `
#nikavoz-ov{position:fixed;inset:0;z-index:10030;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,.72);backdrop-filter:blur(6px);animation:nvIn .25s ease}
@keyframes nvIn{from{opacity:0}to{opacity:1}}
.nv-card{width:min(480px,100%);padding:26px 24px 20px;border-radius:26px;text-align:center;color:var(--text-main,#0f172a);background:var(--card-bg,#fff);border:1px solid var(--border,#e2e8f0);box-shadow:0 40px 80px -30px rgba(79,70,229,.7);animation:nvUp .45s cubic-bezier(.22,1.4,.36,1)}
@keyframes nvUp{from{opacity:0;transform:translateY(24px) scale(.95)}to{opacity:1;transform:none}}
.nv-ico{width:78px;height:78px;margin:0 auto 10px;display:grid;place-items:center;font-size:2.4rem;border-radius:26px;background:linear-gradient(135deg,#4338ca,#7c3aed,#db2777);box-shadow:0 18px 30px -14px #7c3aed;position:relative}
.nv-ico::after{content:'';position:absolute;inset:-6px;border-radius:30px;border:2px solid rgba(124,58,237,.5);animation:nvOnda 1.8s ease-out infinite}
@keyframes nvOnda{from{transform:scale(.9);opacity:.9}to{transform:scale(1.35);opacity:0}}
.nv-card h3{margin:6px 0 4px;font-size:1.15rem}
.nv-frase{min-height:44px;margin:6px 0 14px;font-size:.9rem;line-height:1.45;opacity:.85;transition:opacity .35s,transform .35s}
.nv-frase.cambia{opacity:0;transform:translateY(6px)}
.nv-barra{position:relative;height:16px;border-radius:99px;background:rgba(148,163,184,.25);overflow:hidden}
.nv-barra i{position:absolute;inset:0 auto 0 0;width:0;border-radius:inherit;transition:width .35s cubic-bezier(.22,1,.36,1);
  background:repeating-linear-gradient(115deg,rgba(255,255,255,.28) 0 12px,transparent 12px 24px),linear-gradient(90deg,#4338ca,#7c3aed,#db2777);background-size:48px 100%,100% 100%;animation:nvRayas 1s linear infinite;box-shadow:0 0 18px rgba(124,58,237,.6)}
@keyframes nvRayas{to{background-position:48px 0,0 0}}
.nv-barra.indet i{width:38%!important;animation:nvRayas 1s linear infinite,nvVa 1.3s ease-in-out infinite}
@keyframes nvVa{0%{left:-40%}100%{left:102%}}
.nv-datos{display:flex;justify-content:space-between;gap:8px;margin-top:10px;font-size:.8rem;font-weight:800;flex-wrap:wrap}
.nv-datos span:first-child{color:#7c3aed;font-size:1rem}
.nv-pie{display:block;margin-top:12px;font-size:.74rem;opacity:.6}
@media (prefers-reduced-motion:reduce){.nv-ico::after,.nv-barra i{animation:none}}
.nv-ajustes .nv-voces{display:grid;gap:8px;margin:10px 0;text-align:left}
.nv-op{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:14px;border:2px solid var(--border,#e2e8f0);background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left}
.nv-op.on{border-color:#7c3aed;background:rgba(124,58,237,.1)} .nv-op b{display:block;font-size:.9rem} .nv-op small{opacity:.65;font-weight:600}
.nv-btn{border:0;border-radius:12px;padding:11px 18px;font:inherit;font-weight:800;cursor:pointer;color:#fff;background:linear-gradient(135deg,#4338ca,#7c3aed)}
.nv-btn.sec{background:transparent;color:inherit;border:2px solid var(--border,#cbd5e1)}
.nv-ajustes label{display:flex;flex-direction:column;gap:4px;font-weight:800;font-size:.82rem;text-align:left;margin:8px 0}`;
    document.head.appendChild(st);
  }
  const fmtT = (s) => (s < 60 ? Math.max(1, Math.round(s)) + ' s' : Math.floor(s / 60) + ' min ' + String(Math.round(s % 60)).padStart(2, '0') + ' s');
  const fmtMB = (b) => (b / 1e6).toFixed(b >= 1e7 ? 0 : 1);

  const overlay = {
    abrir(titulo) {
      css(); this.cerrar();
      ov = document.createElement('div'); ov.id = 'nikavoz-ov'; ov.setAttribute('role', 'alertdialog'); ov.setAttribute('aria-live', 'polite');
      ov.innerHTML = '<div class="nv-card"><div class="nv-ico">🎙️</div><h3 id="nv-t">' + esc(titulo || 'Preparando la voz del profesor') + '</h3>'
        + '<p class="nv-frase" id="nv-frase">' + esc(FRASES[0]) + '</p>'
        + '<div class="nv-barra" id="nv-barra"><i id="nv-bar"></i></div>'
        + '<div class="nv-datos"><span id="nv-pct">0%</span><span id="nv-mb">Conectando…</span><span id="nv-eta">calculando tiempo…</span></div>'
        + '<small class="nv-pie">No cierres esta ventana: en cuanto termine, empieza el examen.</small></div>';
      document.body.appendChild(ov);
      iFrase = 0; t0 = Date.now(); ult = { t: t0, c: 0 }; vProm = 0;
      clearInterval(tFrase);
      tFrase = setInterval(() => {
        const f = document.getElementById('nv-frase'); if (!f) return;
        f.classList.add('cambia');
        setTimeout(() => { iFrase = (iFrase + 1) % FRASES.length; f.textContent = FRASES[iFrase]; f.classList.remove('cambia'); }, 350);
      }, 4200);
    },
    progreso(cargado, total) {
      if (!ov || !total) return;
      const pct = Math.min(100, Math.round(cargado * 100 / total)), ahora = Date.now();
      const dt = (ahora - ult.t) / 1000;
      if (dt >= 0.6) { const v = (cargado - ult.c) / dt; vProm = vProm ? vProm * 0.7 + v * 0.3 : v; ult = { t: ahora, c: cargado }; }
      const set = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
      const bar = document.getElementById('nv-bar'); if (bar) bar.style.width = pct + '%';
      set('nv-pct', pct + '%'); set('nv-mb', fmtMB(cargado) + ' / ' + fmtMB(total) + ' MB' + (vProm ? ' · ' + (vProm / 1e6).toFixed(1) + ' MB/s' : ''));
      const transcurrido = (ahora - t0) / 1000;
      if (pct >= 100) set('nv-eta', '¡Descargada!');
      else if (transcurrido < 2 || !vProm) set('nv-eta', 'calculando tiempo…');
      else set('nv-eta', '≈ ' + fmtT((total - cargado) / vProm) + ' restantes');
    },
    fase(texto, indeterminado) {
      if (!ov) return;
      const t = document.getElementById('nv-t'); if (t) t.textContent = texto;
      const b = document.getElementById('nv-barra'); if (b) b.classList.toggle('indet', !!indeterminado);
      const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
      if (indeterminado) { set('nv-pct', '⏳'); set('nv-mb', 'Cargando la voz en tu dispositivo'); set('nv-eta', 'hasta 30 s la primera vez'); }
    },
    cerrar() { clearInterval(tFrase); tFrase = null; if (ov) { ov.remove(); ov = null; } }
  };

  /* ---------- preparar: descarga (si falta) y carga el modelo ---------- */
  async function preparar(opts) {
    opts = opts || {};
    await refrescar();
    let k = claveLocal();
    if (!k && !vocesDispositivo().length && localesOk()) {          // sin voces del sistema: se baja la voz argentina
      k = Object.keys(S.lista).find((x) => S.lista[x]) || 'ar_f'; ls.set(K.sel, 'loc:' + k);
    }
    if (!k || !localesOk()) return true;
    try {
      if (!S.lista[k]) {
        overlay.abrir('Descargando la voz del profesor');
        await VL().descargar(k, (c, t) => overlay.progreso(c, t));
        S.lista[k] = true;
      }
      if (!opts.sinCargar) { if (!ov) overlay.abrir('Preparando la voz del profesor'); overlay.fase('Cargando la voz en tu dispositivo…', true); await VL().sintetizar(k, 'Buenos días.'); }
      overlay.cerrar(); return true;
    } catch (e) {
      overlay.cerrar(); S.nodisp[k] = true;
      if (typeof opts.alError === 'function') opts.alError(e);
      return false;
    }
  }

  /* ---------- ajustes rápidos (para los simuladores) ---------- */
  function ajustes() {
    css(); const ex = document.getElementById('nikavoz-aj'); if (ex) ex.remove();
    const m = document.createElement('div'); m.id = 'nikavoz-aj'; m.style.cssText = 'position:fixed;inset:0;z-index:10025;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,.6)';
    const pintar = () => {
      const s = sel(); const dev = vocesDispositivo().length > 0;
      const loc = localesOk() ? Object.keys(VL().VOCES).map((k) => { const v = VL().VOCES[k]; return '<button class="nv-op' + (s === 'loc:' + k ? ' on' : '') + '" data-k="' + k + '"><span>' + v.g + '</span><span><b>' + v.ico + ' ' + esc(v.nombre) + '</b><small>' + (S.lista[k] ? '✔ Descargada' : '⬇ Descargar · ' + v.mb + ' MB') + '</small></span></button>'; }).join('') : '';
      m.innerHTML = '<div class="nv-card nv-ajustes"><h3>🔊 Voz de los simuladores</h3><p class="nv-frase" style="min-height:0">Esta voz se usa en todos los simuladores.</p>'
        + '<div class="nv-voces"><button class="nv-op' + (s === 'dev' ? ' on' : '') + '" data-k="dev"><span>💻</span><span><b>Voz del dispositivo</b><small>' + (dev ? 'Gratis · ya instalada' : 'No disponible en este navegador') + '</small></span></button>' + loc + '</div>'
        + '<label>Volumen <input type="range" id="nvaj-vol" min="0" max="100" value="' + Math.round(vol() * 100) + '"></label>'
        + '<label>Velocidad <input type="range" id="nvaj-vel" min="70" max="140" value="' + Math.round(vel() * 100) + '"></label>'
        + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="nv-btn sec" data-a="probar">▶️ Probar</button><button class="nv-btn" data-a="cerrar">Listo</button></div></div>';
    };
    m.addEventListener('click', async (e) => {
      if (e.target === m) return m.remove();
      const a = e.target.closest('[data-a]'), o = e.target.closest('.nv-op');
      if (a && a.dataset.a === 'cerrar') return m.remove();
      if (a && a.dataset.a === 'probar') { callar(); hablar('Buenos días. Así voy a sonar en los simuladores.', {}); return; }
      if (o) {
        const k = o.dataset.k;
        if (k === 'dev') { ls.set(K.sel, 'dev'); pintar(); return; }
        if (!S.lista[k] && !confirm('Se va a descargar la voz «' + VL().VOCES[k].nombre + '» (' + VL().VOCES[k].mb + ' MB) una sola vez. Conviene usar WiFi. ¿Descargar ahora?')) return;
        ls.set(K.sel, 'loc:' + k); m.style.display = 'none';
        const ok = await preparar({ alError: () => alert('No se pudo descargar la voz. Revisá tu conexión.') });
        m.style.display = 'flex'; if (!ok) ls.set(K.sel, 'dev'); pintar();
      }
    });
    m.addEventListener('input', (e) => {
      if (e.target.id === 'nvaj-vol') ls.set(K.vol, Number(e.target.value) / 100);
      if (e.target.id === 'nvaj-vel') ls.set(K.vel, Number(e.target.value) / 100);
      if (S.audio) { S.audio.volume = vol(); }
    });
    document.body.appendChild(m);
    refrescar().then(pintar); pintar();
  }

  /* ---------- lectura automática en voz alta de los simuladores con chat ---------- */
  let observer = null, leyendo = false;
  const activo = () => ls.get(K.on) === '1';
  function observarSimulador() {
    if (observer || !window.MutationObserver) return;
    const hablarItem = (el) => {
      if (!leyendo || !el || el.id === 'shock-pensando-item' || el.classList.contains('clinica-bubble-error')) return;
      const t = (el.textContent || '').trim(); if (t && !/^🤔|^…|^Cargando/.test(t)) hablar(t, { rol: 'p' });
    };
    observer = new MutationObserver((ms) => {
      if (!leyendo) return;
      ms.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches('.shock-log-item.rol-ia, .clinica-bubble.rol-ia')) hablarItem(n);
          else if (n.querySelectorAll) n.querySelectorAll('.shock-log-item.rol-ia, .clinica-bubble.rol-ia').forEach(hablarItem);
        });
        if (m.target && m.target.id === 'shock-caso-texto' && m.type !== 'attributes') hablarItem(m.target);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  async function activar(on) {
    ls.set(K.on, on ? '1' : '0');
    if (on) {
      const ok = await preparar({ alError: () => {} });
      if (!ok && !vocesDispositivo().length) { ls.set(K.on, '0'); leyendo = false; return false; }
      leyendo = true; observarSimulador();
      hablar('Voz activada.', {});
    } else { leyendo = false; callar(); }
    return on;
  }
  function iniciarSimulador() { if (activo()) { leyendo = true; refrescar().then(observarSimulador); } }

  window.NikaVoz = { hablar, callar, preparar, ajustes, overlay, refrescar, lista, activar, activo, iniciarSimulador, config: () => ({ sel: sel(), vol: vol(), vel: vel() }) };
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => vocesDispositivo();
})();
