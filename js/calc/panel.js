/* NikaMed · Panel de calculadoras clínicas (se invoca desde NikaFarma, la sala de estudio y cualquier página).
   Uso: NikaCalcPanel.abrir()  |  NikaCalcPanel.abrir('ckd-epi')  |  NikaCalcPanel.abrir({ buscar: 'wells' })
   Cualquier elemento con [data-nika-calc] (opcional: data-nika-calc="id-de-calculadora") abre el panel al tocarlo.
   Carga el motor y los datos recién al abrir por primera vez, así no pesa en las páginas que lo incluyen. */
(function () {
  if (window.NikaCalcPanel) return;
  const V = '4';
  const SCRIPTS = ['motor', 'datos-obstetricia', 'datos-cirugia', 'datos-clinica', 'datos-general', 'datos-extra', 'fuentes-ar'].map((n) => '/js/calc/' + n + '.js?v=' + V);
  let ov = null, host = null, api = null, cargando = null, previo = null;

  function cargarJs(src) {
    return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error(src)); document.head.appendChild(s); });
  }
  function cargarTodo() {
    if (window.NikaCalcs && window.NikaCalcs.REG && window.NikaCalcs.REG.length > 40) return Promise.resolve();
    if (cargando) return cargando;
    if (!document.querySelector('link[href*="calculadoras.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/calculadoras.css?v=5'; document.head.appendChild(l); }
    // en orden: el motor primero, los datos después (dependen de NikaCalcs)
    cargando = SCRIPTS.reduce((p, src) => p.then(() => cargarJs(src)), Promise.resolve()).catch((e) => { cargando = null; throw e; });
    return cargando;
  }
  function crear() {
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
    if (api) { if (o.id) api.abrir(o.id); else if (o.buscar != null) api.buscar(o.buscar); return Promise.resolve(); }
    return cargarTodo().then(() => {
      api = window.NikaCalcs.montar(host, { sinHash: true, abrir: o.id });
      if (o.buscar != null) api.buscar(o.buscar);
      const q = host.querySelector('#cc-q'); if (q && !o.id && matchMedia('(hover:hover)').matches) q.focus();
    }).catch(() => { host.innerHTML = '<p class="nkc-carga">No se pudieron cargar las calculadoras. Revisá tu conexión e intentá de nuevo.</p>'; });
  }
  function cerrar() {
    if (!ov) return;
    ov.classList.remove('on'); document.documentElement.style.overflow = '';
    try { if (previo && previo.focus) previo.focus(); } catch (_) {}
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nika-calc]'); if (!b) return;
    e.preventDefault(); abrir(b.getAttribute('data-nika-calc') || undefined);
  });
  window.NikaCalcPanel = { abrir, cerrar };
})();
