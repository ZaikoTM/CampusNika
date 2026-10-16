/* NikaMed · Panel de calculadoras clínicas (NikaFarma, sala de estudio y cualquier página).
   • Modal:  NikaCalcPanel.abrir()  |  abrir('ckd-epi')  |  abrir({ buscar: 'wells' })  |  abrir({ area: 'obstetricia' })
     Cualquier elemento con [data-nika-calc] (opcional: data-nika-calc="id") abre el modal al tocarlo.
   • Mosaico flotante (no tapa la lectura): <body data-nika-calc-dock> (opcional data-nika-calc-area="obstetricia") o NikaCalcPanel.dock({ area, etiqueta }).
   El motor y los datos se cargan recién al abrir por primera vez, así no pesan en las páginas que lo incluyen. */
(function () {
  if (window.NikaCalcPanel) return;
  const V = '9';
  const SCRIPTS = ['motor', 'datos-obstetricia', 'datos-cirugia', 'datos-clinica', 'datos-general', 'datos-extra', 'fuentes-ar'].map((n) => '/js/calc/' + n + '.js?v=' + V);
  const MODULOS = { ginecologia: ['obstetricia', 'Ginecología y Obstetricia'], obstetricia: ['obstetricia', 'Ginecología y Obstetricia'], cirugia: ['cirugia', 'Cirugía'], siam: ['clinica', 'Clínica médica'], clinica: ['clinica', 'Clínica médica'], pediatria: ['pediatria', 'Pediatría'] };
  let ov = null, host = null, api = null, cargando = null, previo = null;
  let dk = null, dkHost = null, dkApi = null, dkCfg = {};

  function cargarJs(src) { return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error(src)); document.head.appendChild(s); }); }
  function cargarTodo() {
    if (window.NikaCalcs && window.NikaCalcs.REG && window.NikaCalcs.REG.length > 40) return Promise.resolve();
    if (cargando) return cargando;
    if (!document.querySelector('link[href*="calculadoras.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/calculadoras.css?v=8'; document.head.appendChild(l); }
    cargando = SCRIPTS.reduce((p, src) => p.then(() => cargarJs(src)), Promise.resolve()).catch((e) => { cargando = null; throw e; });
    return cargando;
  }
  function estilos() {
    if (!document.querySelector('link[href*="calculadoras.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/calculadoras.css?v=8'; document.head.appendChild(l); }
  }
  const aplicar = (a, o) => { if (o.id) a.abrir(o.id); else { if (o.area) a.area(o.area); if (o.buscar != null) a.buscar(o.buscar); } };

  // ---------- modal ----------
  function crear() {
    estilos();
    ov = document.createElement('div'); ov.className = 'nkc-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Calculadoras y escalas clínicas');
    ov.innerHTML = '<div class="nkc-card"><div class="nkc-h"><b>🧮 Calculadoras y escalas clínicas<small>Con su fundamento · funcionan sin conexión</small></b><a href="/calculadoras.html" target="_blank" rel="noopener">Ver como guía ↗</a><button type="button" class="nkc-x" aria-label="Cerrar">✕</button></div><div class="nkc-body"><div class="cc-aviso"><strong>Herramienta de apoyo.</strong> No reemplaza el juicio clínico ni el protocolo de tu institución.</div><div id="nkc-host"><p class="nkc-carga">Cargando calculadoras…</p></div></div></div>';
    document.body.appendChild(ov);
    host = ov.querySelector('#nkc-host');
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('.nkc-x')) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on')) cerrar(); });
  }
  function abrir(arg) {
    const o = typeof arg === 'string' ? { id: arg } : (arg || {});
    if (!ov) crear();
    previo = document.activeElement;
    ov.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    if (api) { aplicar(api, o); return Promise.resolve(); }
    return cargarTodo().then(() => {
      api = window.NikaCalcs.montar(host, { sinHash: true, abrir: o.id });
      if (!o.id) aplicar(api, o);
      const q = host.querySelector('#cc-q'); if (q && !o.id && matchMedia('(hover:hover)').matches) q.focus();
    }).catch(() => { host.innerHTML = '<p class="nkc-carga">No se pudieron cargar las calculadoras. Revisá tu conexión e intentá de nuevo.</p>'; });
  }
  function cerrar() {
    if (!ov) return;
    ov.classList.remove('on'); document.documentElement.style.overflow = '';
    try { if (previo && previo.focus) previo.focus(); } catch (_) {}
  }

  // ---------- mosaico flotante (sala de estudio) ----------
  const ICONO = '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect x="6" y="3.5" width="20" height="25" rx="5" fill="rgba(255,255,255,.96)"/><rect x="9.5" y="7" width="13" height="5.5" rx="2" fill="#0ea5e9"/><g fill="#6366f1"><circle cx="11.5" cy="17" r="1.7"/><circle cx="16" cy="17" r="1.7"/><circle cx="20.5" cy="17" r="1.7"/><circle cx="11.5" cy="22" r="1.7"/><circle cx="16" cy="22" r="1.7"/></g><rect x="18.8" y="20.3" width="3.4" height="5.4" rx="1.7" fill="#ec4899"/></svg>';
  function dockCss() {
    if (document.getElementById('nkc-dock-css')) return;
    const st = document.createElement('style'); st.id = 'nkc-dock-css';
    st.textContent = `
.nkc-fab{position:fixed;right:20px;bottom:104px;width:56px;height:56px;border:0;border-radius:50%;cursor:pointer;z-index:9997;display:flex;align-items:center;justify-content:center;color:#fff;background:radial-gradient(circle at 30% 25%,#38bdf8,#4f46e5 70%);box-shadow:0 8px 22px -6px rgba(79,70,229,.65),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .2s,box-shadow .2s}.nkc-fab svg{filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))}
.nkc-fab:hover{transform:scale(1.08)}.nkc-fab.on{box-shadow:0 0 0 3px rgba(14,165,233,.35),0 8px 22px -6px rgba(14,165,233,.6)}
body.nkc-con-dock .cf-fab{bottom:176px!important}
.nkc-dock{position:fixed;right:92px;bottom:16px;width:min(340px,calc(100vw - 108px));height:min(470px,calc(100vh - 130px));z-index:9996;display:none;flex-direction:column;overflow:hidden;border-radius:20px;border:1px solid var(--cc-bd2);background:var(--cc-pan);color:var(--cc-tx);box-shadow:0 30px 70px -22px rgba(0,0,0,.65);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkc-dock.on{display:flex}
.nkc-dock .nkc-h{padding:9px 10px 9px 14px;gap:6px;cursor:grab;touch-action:none;user-select:none}.nkc-dock.arrastrando .nkc-h{cursor:grabbing}.nkc-dock .nkc-h b{font-size:.9rem}.nkc-dock .nkc-h b small{font-size:.66rem}
.nkc-dock .nkc-bt{width:30px;height:30px;border-radius:50%;border:0;background:var(--cc-soft);color:var(--cc-tx);cursor:pointer;font-size:.95rem;line-height:1}
.nkc-dock .nkc-bt:hover{background:var(--cc-bd2)}
.nkc-dock .nkc-body{padding:0 10px 12px}
.nkc-dock .cc-chips{gap:5px}.nkc-dock .cc-chips button{padding:3px 8px;font-size:.64rem}.nkc-dock .cc-barra{padding-top:8px}.nkc-dock .cc-grid{grid-template-columns:1fr}.nkc-dock .cc-gtabs button{font-size:.7rem;padding:9px 4px}
.nkc-dock .cc-busca #cc-q{padding:10px 0;font-size:.9rem}
.nkc-dock .cc-lista{grid-template-columns:1fr!important}.nkc-dock .cc-card.abierta{grid-column:auto!important}
.nkc-dock .cc-head{padding:12px 74px 12px 18px!important;gap:10px}.nkc-dock .cc-head .ic{width:32px;height:32px;font-size:1rem;border-radius:11px}
.nkc-dock .cc-head .tt b{font-size:.9rem}.nkc-dock .cc-head .tt small{font-size:.74rem}
.nkc-dock .cc-body{padding:2px 14px 16px 16px}.nkc-dock .cc-big b{font-size:1.7rem}
.nkc-dock .cc-star{top:9px;right:40px}.nkc-dock .cc-head .chev{right:16px}
.nkc-sug{margin:8px 0 0;font-size:.74rem;color:var(--cc-mut)}.nkc-sug b{color:var(--cc-tx)}
.nkc-dock.min{height:auto!important}.nkc-dock.min .nkc-body{display:none}.nkc-dock.min .nkc-h{border-bottom:0;cursor:pointer}
@media (max-width:640px){.nkc-fab{width:48px;height:48px;right:12px;bottom:74px;font-size:22px}body.nkc-con-dock .cf-fab{bottom:130px!important}.nkc-dock{right:8px;left:8px;width:auto;bottom:8px;height:min(78vh,620px);z-index:10001}.nkc-dock.min{left:auto;width:min(280px,calc(100vw - 16px))}}
@media (prefers-reduced-motion:reduce){.nkc-fab{transition:none}}`;
    document.head.appendChild(st);
  }
  function dock(cfg) {
    if (dk) return;
    dkCfg = cfg || {};
    estilos(); dockCss();
    document.body.classList.add('nkc-con-dock');
    const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'nkc-fab'; fab.id = 'nkc-fab';
    fab.setAttribute('aria-label', 'Calculadoras clínicas'); fab.title = 'Calculadoras clínicas' + (dkCfg.etiqueta ? ' · ' + dkCfg.etiqueta : ''); fab.innerHTML = ICONO;
    dk = document.createElement('div'); dk.className = 'nkc-dock'; dk.setAttribute('role', 'dialog'); dk.setAttribute('aria-label', 'Calculadoras clínicas');
    dk.innerHTML = '<div class="nkc-h"><b>🧮 Calculadoras<small>' + (dkCfg.etiqueta ? 'Sugeridas para ' + dkCfg.etiqueta : 'Escalas y cálculos clínicos') + '</small></b><a href="/calculadoras.html" target="_blank" rel="noopener" title="Ver como guía">↗</a><button type="button" class="nkc-bt" data-a="min" aria-label="Minimizar" title="Minimizar">–</button><button type="button" class="nkc-bt" data-a="x" aria-label="Cerrar" title="Cerrar">✕</button></div><div class="nkc-body"><div id="nkc-dk-host"><p class="nkc-carga">Cargando calculadoras…</p></div></div>';
    document.body.appendChild(fab); document.body.appendChild(dk);
    dkHost = dk.querySelector('#nkc-dk-host');
    const abrirDock = () => {
      dk.classList.add('on'); dk.classList.remove('min'); fab.classList.add('on');
      if (dkApi || dkHost.dataset.cargando) return; dkHost.dataset.cargando = '1';
      cargarTodo().then(() => { dkApi = window.NikaCalcs.montar(dkHost, { sinHash: true, area: dkCfg.area }); }).catch(() => { dkHost.innerHTML = '<p class="nkc-carga">No se pudieron cargar las calculadoras. Revisá tu conexión.</p>'; delete dkHost.dataset.cargando; });
    };
    const cerrarDock = () => { dk.classList.remove('on'); fab.classList.remove('on'); };
    fab.addEventListener('click', () => { if (dk.classList.contains('on') && !dk.classList.contains('min')) cerrarDock(); else abrirDock(); });
    dk.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (b && b.dataset.a === 'x') cerrarDock();
      else if (b && b.dataset.a === 'min') dk.classList.toggle('min');
      else if (dk.classList.contains('min') && e.target.closest('.nkc-h') && !e.target.closest('a')) dk.classList.remove('min');
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dk.classList.contains('on') && !ov?.classList.contains('on') && dk.contains(document.activeElement)) cerrarDock(); });
    // mover el mosaico arrastrando su encabezado (queda donde lo dejes mientras dure la sesión)
    try { const g = JSON.parse(sessionStorage.getItem('nkc_pos') || 'null'); if (g) { dk.style.left = g.x + 'px'; dk.style.top = g.y + 'px'; dk.style.right = 'auto'; dk.style.bottom = 'auto'; } } catch (_) {}
    const hd = dk.querySelector('.nkc-h'); let off = null;
    hd.addEventListener('pointerdown', (e) => { if (e.target.closest('button,a') || dk.classList.contains('min') && false) return; const r = dk.getBoundingClientRect(); off = { x: e.clientX - r.left, y: e.clientY - r.top }; dk.classList.add('arrastrando'); hd.setPointerCapture(e.pointerId); });
    hd.addEventListener('pointermove', (e) => { if (!off) return; const w = dk.offsetWidth, h = dk.offsetHeight; const x = Math.min(Math.max(0, e.clientX - off.x), innerWidth - w), y = Math.min(Math.max(0, e.clientY - off.y), innerHeight - 40); dk.style.left = x + 'px'; dk.style.top = y + 'px'; dk.style.right = 'auto'; dk.style.bottom = 'auto'; });
    const fin = () => { if (!off) return; off = null; dk.classList.remove('arrastrando'); try { sessionStorage.setItem('nkc_pos', JSON.stringify({ x: parseInt(dk.style.left, 10), y: parseInt(dk.style.top, 10) })); } catch (_) {} };
    hd.addEventListener('pointerup', fin); hd.addEventListener('pointercancel', fin);
    window.NikaCalcPanel.abrirDock = (o) => { abrirDock(); const t = () => { if (dkApi) aplicar(dkApi, o || {}); else setTimeout(t, 120); }; if (o) t(); };
  }
  function autoDock() {
    const b = document.body; if (!b || !b.hasAttribute('data-nika-calc-dock')) return;
    const m = new URLSearchParams(location.search).get('modulo');
    let area = b.getAttribute('data-nika-calc-area') || '', etiqueta = b.getAttribute('data-nika-calc-etiqueta') || '';
    if (!area && m && MODULOS[m]) { area = MODULOS[m][0]; etiqueta = MODULOS[m][1]; }
    dock({ area, etiqueta });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nika-calc]'); if (!b) return;
    e.preventDefault(); abrir(b.getAttribute('data-nika-calc') || undefined);
  });
  window.NikaCalcPanel = { abrir, cerrar, dock };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoDock); else autoDock();
})();
