/* NikaMed · Panel de calculadoras clínicas (NikaFarma, sala de estudio y cualquier página).
   • Modal:  NikaCalcPanel.abrir()  |  abrir('ckd-epi')  |  abrir({ buscar: 'wells' })  |  abrir({ area: 'obstetricia' })
     Cualquier elemento con [data-nika-calc] (opcional: data-nika-calc="id") abre el modal al tocarlo.
   • Mosaico flotante (no tapa la lectura): <body data-nika-calc-dock> (opcional data-nika-calc-area="obstetricia") o NikaCalcPanel.dock({ area, etiqueta }).
   El motor y los datos se cargan recién al abrir por primera vez, así no pesan en las páginas que lo incluyen. */
(function () {
  if (window.NikaCalcPanel) return;
  const V = '6';
  const SCRIPTS = ['motor', 'datos-obstetricia', 'datos-cirugia', 'datos-clinica', 'datos-general', 'datos-extra', 'fuentes-ar'].map((n) => '/js/calc/' + n + '.js?v=' + V);
  const MODULOS = { ginecologia: ['obstetricia', 'Ginecología y Obstetricia'], obstetricia: ['obstetricia', 'Ginecología y Obstetricia'], cirugia: ['cirugia', 'Cirugía'], siam: ['clinica', 'Clínica médica'], clinica: ['clinica', 'Clínica médica'], pediatria: ['pediatria', 'Pediatría'] };
  let ov = null, host = null, api = null, cargando = null, previo = null;
  let dk = null, dkHost = null, dkApi = null, dkCfg = {};

  function cargarJs(src) { return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error(src)); document.head.appendChild(s); }); }
  function cargarTodo() {
    if (window.NikaCalcs && window.NikaCalcs.REG && window.NikaCalcs.REG.length > 40) return Promise.resolve();
    if (cargando) return cargando;
    if (!document.querySelector('link[href*="calculadoras.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/calculadoras.css?v=7'; document.head.appendChild(l); }
    cargando = SCRIPTS.reduce((p, src) => p.then(() => cargarJs(src)), Promise.resolve()).catch((e) => { cargando = null; throw e; });
    return cargando;
  }
  function estilos() {
    if (!document.querySelector('link[href*="calculadoras.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/calculadoras.css?v=7'; document.head.appendChild(l); }
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
  function dockCss() {
    if (document.getElementById('nkc-dock-css')) return;
    const st = document.createElement('style'); st.id = 'nkc-dock-css';
    st.textContent = `
.nkc-fab{position:fixed;right:20px;bottom:104px;width:56px;height:56px;border:0;border-radius:50%;cursor:pointer;z-index:9997;display:flex;align-items:center;justify-content:center;font-size:25px;color:#fff;background:linear-gradient(135deg,#0ea5e9,#6366f1);box-shadow:0 8px 22px -6px rgba(14,165,233,.6);transition:transform .2s,box-shadow .2s}
.nkc-fab:hover{transform:scale(1.08)}.nkc-fab.on{box-shadow:0 0 0 3px rgba(14,165,233,.35),0 8px 22px -6px rgba(14,165,233,.6)}
body.nkc-con-dock .cf-fab{bottom:176px!important}
.nkc-dock{position:fixed;right:92px;bottom:16px;width:min(430px,calc(100vw - 108px));height:min(620px,calc(100vh - 32px));z-index:9996;display:none;flex-direction:column;overflow:hidden;border-radius:20px;border:1px solid var(--cc-bd2);background:var(--cc-pan);color:var(--cc-tx);box-shadow:0 30px 70px -22px rgba(0,0,0,.65);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkc-dock.on{display:flex}
.nkc-dock .nkc-h{padding:10px 12px;gap:8px;cursor:default}.nkc-dock .nkc-h b{font-size:.95rem}
.nkc-dock .nkc-bt{width:30px;height:30px;border-radius:50%;border:0;background:var(--cc-soft);color:var(--cc-tx);cursor:pointer;font-size:.95rem;line-height:1}
.nkc-dock .nkc-bt:hover{background:var(--cc-bd2)}
.nkc-dock .nkc-body{padding:0 10px 12px}
.nkc-dock .cc-chips{gap:5px}.nkc-dock .cc-chips button{padding:4px 9px;font-size:.68rem}
.nkc-dock .cc-busca #cc-q{padding:10px 0;font-size:.9rem}
.nkc-dock .cc-lista{grid-template-columns:1fr!important}.nkc-dock .cc-card.abierta{grid-column:auto!important}
.nkc-dock .cc-head{padding:12px 74px 12px 18px!important;gap:10px}.nkc-dock .cc-head .ic{width:36px;height:36px;font-size:1.15rem}
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
    fab.setAttribute('aria-label', 'Calculadoras clínicas'); fab.title = 'Calculadoras clínicas' + (dkCfg.etiqueta ? ' · ' + dkCfg.etiqueta : ''); fab.textContent = '🧮';
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
