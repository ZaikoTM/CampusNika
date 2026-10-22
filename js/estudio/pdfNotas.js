/* CAMPUS NIKA · Notas dentro del lector de PDF (js/estudio/pdfLector.js)
   Un panel con forma de hoja rayada para anotar mientras se lee, también en pantalla completa: se elige la página, se escribe y se
   decide si va a una nota nueva o se suma a una nota previa del mismo cuaderno. Usa la misma tabla que "Mis notas" (notas_estudio),
   con el mismo formato empaquetado, así aparecen ahí solas. Sin sesión, quedan en el navegador (igual que Mis notas).
   Además hace de «cuaderno» de las anotaciones sobre el PDF (textos y marcadores 📌, ver pdfAnotaciones.js): se editan acá,
   llevan etiquetas y se pueden compartir con un amigo. */
(function () {
  'use strict';
  if (window.NikaPdfNotas) return;
  const LS = 'nika_notas_estudio';
  const COLORES = { amarillo: '#fef9c3', rosa: '#fce7f3', celeste: '#e0f2fe', verde: '#dcfce7', naranja: '#ffedd5', lila: '#ede9fe' };
  const ETIQ_BASE = ['importante', 'repasar', 'pregunta de parcial', 'duda'];
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cli = () => (window.NikaSupabase && window.NikaSupabase.client) || window.supabaseClient || null;
  const lsLeer = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (_) { return []; } };
  const lsGuardar = (a) => { try { localStorage.setItem(LS, JSON.stringify(a)); } catch (_) {} };
  const modulo = () => (window.EstudioState && window.EstudioState.modulo) || null;
  const upActual = () => (window.EstudioState && window.EstudioState.currentUpId) || null;
  const esLocal = (n) => n.local || String(n.id).charAt(0) === 'l';

  async function uid() {
    try { const c = cli(); const { data } = await c.auth.getSession(); return data && data.session && data.session.user ? data.session.user.id : null; } catch (_) { return null; }
  }
  // texto empaquetado igual que Mis notas: {"nk":1,"t":título,"h":html,"p":texto plano,"d":eliminada,"e":estilo del título}
  function leer(n) {
    let t = '', h = '', p = String(n.texto || ''), d = '', e = '';
    if (p.indexOf('{"nk":1') === 0) { try { const o = JSON.parse(p); t = o.t || ''; h = o.h || ''; p = o.p || ''; d = o.d || ''; e = o.e || ''; } catch (_) {} }
    return { t, h, p, d, e };
  }
  const empaquetar = (o) => JSON.stringify({ nk: 1, t: o.t || '', h: o.h || '', p: o.p || '', d: o.d || '', e: o.e || '' });
  const aHtml = (txt) => esc(txt).replace(/\n/g, '<br>');
  const avisarCambio = () => { try { window.dispatchEvent(new CustomEvent('nika:notas-cambiaron')); } catch (_) {} };

  function css() {
    if (document.getElementById('nkn-css')) return;
    const st = document.createElement('style'); st.id = 'nkn-css';
    st.textContent = `
.nkn-panel{position:absolute;top:0;right:0;bottom:0;width:min(380px,92%);z-index:7;display:flex;flex-direction:column;background:#0f172a;color:#e2e8f0;box-shadow:-12px 0 30px rgba(0,0,0,.4);transform:translateX(105%);transition:transform .3s cubic-bezier(.22,1,.36,1);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkn-panel.on{transform:none}
.nkn-panel h4{margin:0;padding:12px 14px;font-size:.88rem;font-weight:800;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1)}
.nkn-panel h4 button{background:none;border:0;color:#94a3b8;font-size:1.1rem;cursor:pointer}
.nkn-cuerpo{flex:1;overflow-y:auto;padding:14px 14px 20px;display:flex;flex-direction:column;gap:12px}
.nkn-hoja{--c:#fef9c3;position:relative;padding:22px 16px 14px 34px;border-radius:6px 6px 14px 14px;background-color:var(--c);color:#1e293b;box-shadow:0 14px 26px -14px rgba(0,0,0,.65);
  background-image:linear-gradient(90deg,transparent 26px,rgba(239,68,68,.55) 26px,rgba(239,68,68,.55) 28px,transparent 28px),repeating-linear-gradient(transparent 0,transparent 27px,rgba(59,130,246,.28) 27px,rgba(59,130,246,.28) 28px);
  transform:rotate(-.6deg);transition:background-color .25s}
.nkn-hoja.edit{transform:none;box-shadow:0 0 0 3px #a855f7,0 14px 26px -14px rgba(0,0,0,.65)}
.nkn-hoja::before{content:'';position:absolute;left:50%;top:-10px;width:86px;height:22px;margin-left:-43px;background:rgba(255,255,255,.55);border:1px solid rgba(15,23,42,.12);transform:rotate(-2deg);box-shadow:0 2px 6px rgba(0,0,0,.18)}
.nkn-hoja [hidden]{display:none!important}
.nkn-edit-cab{display:flex;align-items:center;gap:8px;font:800 .78rem inherit;font-family:inherit;color:#6d28d9;line-height:28px}
.nkn-edit-cab button{margin-left:auto}
.nkn-hoja label.f{display:block;font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#64748b;margin:0 0 2px}
.nkn-fila{display:flex;align-items:center;gap:8px;line-height:28px;min-height:28px;flex-wrap:wrap}
.nkn-hoja input[type=number],.nkn-hoja select{font:inherit;font-weight:700;font-size:.86rem;padding:2px 8px;border-radius:8px;border:1.5px solid rgba(15,23,42,.25);background:rgba(255,255,255,.7);color:#0f172a;line-height:1.3}
.nkn-hoja input[type=number]{width:64px}
.nkn-hoja select{max-width:100%;width:100%}
.nkn-hoja .mini{border:0;border-radius:8px;padding:2px 9px;font:800 .72rem inherit;font-family:inherit;cursor:pointer;background:rgba(15,23,42,.12);color:#0f172a}
.nkn-hoja .mini:hover{background:rgba(15,23,42,.22)}
.nkn-hoja .op{display:flex;align-items:center;gap:6px;font-size:.84rem;font-weight:700;cursor:pointer;line-height:28px}
.nkn-titulo,.nkn-texto{width:100%;box-sizing:border-box;border:0;background:transparent;color:#0f172a;font:inherit;outline:0;padding:0;resize:none}
.nkn-titulo{font-weight:800;font-size:1rem;line-height:28px;height:28px}
.nkn-texto{font-size:.92rem;line-height:28px;min-height:140px;background-attachment:local}
.nkn-titulo::placeholder,.nkn-texto::placeholder{color:rgba(15,23,42,.4)}
.nkn-cols{display:flex;gap:7px;align-items:center;padding:2px 0 6px}
.nkn-col{width:20px;height:20px;border-radius:50%;border:2px solid rgba(15,23,42,.25);cursor:pointer;padding:0;transition:transform .15s}
.nkn-col:hover{transform:scale(1.2)} .nkn-col.on{border-color:#0f172a;transform:scale(1.15)}
.nkn-etq{display:flex;flex-wrap:wrap;gap:5px;align-items:center;padding:2px 0 6px;line-height:1.2}
.nkn-chip{border:1.5px solid rgba(15,23,42,.28);background:rgba(255,255,255,.55);color:#0f172a;border-radius:999px;padding:2px 9px;font:800 .7rem inherit;font-family:inherit;cursor:pointer;transition:transform .15s,background .15s}
.nkn-chip:hover{transform:translateY(-1px)}.nkn-chip.on{background:#7c3aed;color:#fff;border-color:#7c3aed;animation:nknPop .25s ease}
.nkn-etq input{width:110px;font:700 .72rem inherit;font-family:inherit;border:1.5px dashed rgba(15,23,42,.3);border-radius:999px;padding:2px 9px;background:transparent;color:#0f172a;outline:0}
@keyframes nknPop{0%{transform:scale(.8)}60%{transform:scale(1.12)}100%{transform:none}}
.nkn-guardar{margin-top:6px;width:100%;border:0;border-radius:12px;padding:11px;font:800 .9rem inherit;font-family:inherit;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7c3aed,#6366f1);transition:transform .15s,box-shadow .2s}
.nkn-guardar:hover{transform:translateY(-2px);box-shadow:0 12px 20px -12px #7c3aed} .nkn-guardar:disabled{opacity:.6}
.nkn-msg{font-size:.78rem;font-weight:700;min-height:18px;color:#166534}
.nkn-msg.err{color:#b91c1c}
.nkn-sub{margin:4px 2px 0;font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#94a3b8}
.nkn-filtro{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 4px}
.nkn-filtro button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#cbd5e1;border-radius:999px;padding:3px 10px;font:800 .7rem inherit;font-family:inherit;cursor:pointer;transition:background .15s,transform .15s}
.nkn-filtro button:hover{transform:translateY(-1px)}.nkn-filtro button.on{background:#a855f7;border-color:#a855f7;color:#fff}
.nkn-lista{display:flex;flex-direction:column;gap:8px}
.nkn-it{--c:#fef9c3;background:var(--c);color:#1e293b;border-radius:10px;padding:8px 10px;cursor:pointer;border-left:4px solid rgba(15,23,42,.25);transition:transform .15s;animation:nknPop .3s ease both}
.nkn-it.pin{border-left-color:#ef4444}.nkn-it.txt{border-left-color:#0ea5e9}
.nkn-it:hover{transform:translateX(-3px)}
.nkn-it b{font-size:.74rem;color:#475569;display:flex;justify-content:space-between;gap:8px;align-items:center}
.nkn-it b .acc{display:flex;gap:2px;flex:none}
.nkn-it p{margin:3px 0 0;font-size:.82rem;line-height:1.35;max-height:4.2em;overflow:hidden}
.nkn-it .et{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.nkn-it .et i{font-style:normal;background:rgba(15,23,42,.12);border-radius:999px;padding:1px 8px;font:800 .66rem inherit;font-family:inherit;color:#334155}
.nkn-vacio{font-size:.82rem;color:#94a3b8;padding:8px 2px}
.nkn-it button{border:0;background:none;color:#475569;cursor:pointer;font-size:.85rem;padding:0 3px;transition:transform .15s}.nkn-it button:hover{transform:scale(1.25)}.nkn-it button.del{color:#b91c1c}
@media (prefers-reduced-motion:reduce){.nkn-panel,.nkn-hoja,.nkn-it,.nkn-chip{transition:none;animation:none}}`;
    document.head.appendChild(st);
  }

  // ---- datos
  async function notasDelArchivo(fileId) {
    const recurso = 'pdf:' + fileId, out = lsLeer().filter((n) => n.recurso === recurso);
    const c = cli();
    if (c && await uid()) {
      try { const { data } = await c.from('notas_estudio').select('*').eq('recurso', recurso).order('creado_en', { ascending: false }); if (data) return out.concat(data); } catch (_) {}
    }
    return out;
  }
  async function cuadernoNotas() {
    const m = modulo(); let out = lsLeer().filter((n) => !m || n.modulo === m);
    const c = cli();
    if (c && await uid()) {
      try {
        let q = c.from('notas_estudio').select('id,recurso,recurso_titulo,modulo,posicion,texto,color,creado_en,anotacion').order('creado_en', { ascending: false }).limit(80);
        if (m) q = q.eq('modulo', m);
        const { data } = await q; if (data) out = out.concat(data);
      } catch (_) {}
    }
    return out.filter((n) => !leer(n).d && !n.anotacion);
  }
  async function insertar(fila) {
    const c = cli();
    if (c && await uid()) {
      try { const { data, error } = await c.from('notas_estudio').insert(fila).select().single(); if (!error && data) { avisarCambio(); return data; } } catch (_) {}
    }
    const l = Object.assign({}, fila, { id: 'l' + Date.now() + Math.random().toString(36).slice(2, 5), local: true });
    lsGuardar(lsLeer().concat([l])); avisarCambio(); return l;
  }
  async function actualizar(n, campos) {
    Object.assign(n, campos);
    if (esLocal(n)) { lsGuardar(lsLeer().map((x) => (x.id === n.id ? Object.assign({}, x, campos) : x))); avisarCambio(); return true; }
    const c = cli(); if (!c) return false;
    const { error } = await c.from('notas_estudio').update(campos).eq('id', n.id);
    if (!error) avisarCambio();
    return !error;
  }
  const actualizarTexto = (n, texto) => actualizar(n, { texto });
  async function borrar(n) {
    if (esLocal(n)) { lsGuardar(lsLeer().filter((x) => x.id !== n.id)); avisarCambio(); return; }
    const c = cli(); if (c) { try { await c.from('notas_estudio').delete().eq('id', n.id); } catch (_) {} }
    avisarCambio();
  }

  // ---- interfaz
  function construir(S) {
    const p = document.createElement('aside'); p.className = 'nkn-panel'; p.setAttribute('aria-label', 'Notas de lectura');
    p.innerHTML = `<h4><span>📒 Notas de lectura</span><button type="button" data-n="cerrar" aria-label="Cerrar">✕</button></h4>
      <div class="nkn-cuerpo">
        <div class="nkn-hoja">
          <div class="nkn-edit-cab" hidden><span class="nkn-edit-tit">✏️ Editando</span><button type="button" class="mini" data-n="cancelar-edicion">Cancelar</button></div>
          <div class="nkn-fila"><label class="f" style="margin:0">Página</label><input type="number" class="nkn-pag" min="1" aria-label="Página de la nota"><button type="button" class="mini" data-n="actual">Página actual</button></div>
          <div class="nkn-fila nkn-donde"><label class="op"><input type="radio" name="nkn-donde" value="nueva" checked> Nota nueva</label><label class="op"><input type="radio" name="nkn-donde" value="previa"> Sumar a una nota previa</label></div>
          <div class="nkn-previa" hidden><select class="nkn-previas" aria-label="Nota previa"></select></div>
          <input class="nkn-titulo" maxlength="80" placeholder="Título (opcional)">
          <textarea class="nkn-texto" placeholder="Escribí tu nota acá…"></textarea>
          <div class="nkn-cols">${Object.keys(COLORES).map((k, i) => `<button type="button" class="nkn-col${i === 0 ? ' on' : ''}" data-color="${k}" title="${k}" style="background:${COLORES[k]}"></button>`).join('')}</div>
          <div class="nkn-etq" aria-label="Etiquetas"></div>
          <div class="nkn-msg" role="status"></div>
          <button type="button" class="nkn-guardar" data-n="guardar">💾 Guardar nota</button>
        </div>
        <div class="nkn-sub">Notas de este archivo</div>
        <div class="nkn-filtro"></div>
        <div class="nkn-lista"></div>
      </div>`;
    return p;
  }

  function abrir(S) {
    if (!S || !S.root) return;
    css();
    const cuerpo = S.root.querySelector('.nkpdf-cuerpo'); if (!cuerpo) return;
    let p = S.root.querySelector('.nkn-panel');
    if (!p) { p = construir(S); cuerpo.appendChild(p); enlazar(S, p); }
    const abrirlo = !p.classList.contains('on');
    // un solo panel lateral a la vez
    const sub = S.root.querySelector('.nkpdf-panel'); if (abrirlo && sub && sub.classList.contains('on')) { const x = sub.querySelector('[data-accion="cerrar-lista"]'); if (x) x.click(); }
    p.classList.toggle('on', abrirlo);
    const b = S.root.querySelector('[data-accion="notas"]'); if (b) b.classList.toggle('on', abrirlo);
    if (abrirlo) { if (!p._edit) p.querySelector('.nkn-pag').value = S.actual || 1; refrescarListas(S, p); }
  }
  function panelDe(S) { return S && S.root ? S.root.querySelector('.nkn-panel') : null; }
  function asegurarAbierto(S) { let p = panelDe(S); if (!p || !p.classList.contains('on')) abrir(S); return panelDe(S); }

  // modo edición: carga una nota/anotación existente en la hoja
  function editar(S, n) {
    const p = asegurarAbierto(S); if (!p) return;
    p._edit = n; const d = leer(n);
    p.querySelector('.nkn-hoja').classList.add('edit');
    p.querySelector('.nkn-edit-cab').hidden = false;
    p.querySelector('.nkn-edit-tit').textContent = n.anotacion === 'pin' ? '📌 Editando el marcador' : n.anotacion === 'texto' ? '📝 Editando el texto del PDF' : '✏️ Editando la nota';
    p.querySelector('.nkn-donde').hidden = true; p.querySelector('.nkn-previa').hidden = true;
    p.querySelector('.nkn-pag').value = n.posicion || S.actual || 1;
    p.querySelector('.nkn-titulo').value = d.t || ''; const tx = p.querySelector('.nkn-texto'); tx.value = d.p || '';
    p._color = n.color || 'amarillo'; p._etiq = (n.etiquetas || []).slice(); p._pintarFormulario();
    p.querySelector('[data-n=guardar]').textContent = '💾 Guardar cambios';
    setTimeout(() => tx.focus(), 60);
  }

  async function refrescarListas(S, p) {
    const lista = p.querySelector('.nkn-lista'), sel = p.querySelector('.nkn-previas'), filtro = p.querySelector('.nkn-filtro');
    const mias = (await notasDelArchivo(S.fileId)).filter((n) => !leer(n).d);
    S.anots = mias.filter((n) => n.anotacion);
    const todasEtiq = Array.from(new Set(mias.flatMap((n) => n.etiquetas || [])));
    if (p._filtro && !todasEtiq.includes(p._filtro)) p._filtro = null;
    filtro.innerHTML = todasEtiq.length ? '<button type="button" data-f="" class="' + (p._filtro ? '' : 'on') + '">Todas</button>' + todasEtiq.map((e) => '<button type="button" data-f="' + esc(e) + '" class="' + (p._filtro === e ? 'on' : '') + '">#' + esc(e) + '</button>').join('') : '';
    const visibles = mias.filter((n) => !p._filtro || (n.etiquetas || []).includes(p._filtro));
    lista.innerHTML = visibles.length ? '' : '<div class="nkn-vacio">' + (mias.length ? 'Ninguna nota con esa etiqueta.' : 'Todavía no tomaste notas en este archivo.') + '</div>';
    visibles.sort((a, b) => (a.posicion || 0) - (b.posicion || 0)).forEach((n) => {
      const d = leer(n), it = document.createElement('div'); it.className = 'nkn-it' + (n.anotacion === 'pin' ? ' pin' : n.anotacion === 'texto' ? ' txt' : ''); it.style.setProperty('--c', COLORES[n.color] || COLORES.amarillo);
      const ico = n.anotacion === 'pin' ? '📌' : n.anotacion === 'texto' ? '📝' : '📄';
      it.innerHTML = '<b><span>' + ico + ' Pág. ' + esc(n.posicion || '?') + (d.t ? ' · ' + esc(d.t) : '') + '</span><span class="acc"><button type="button" data-a="editar" title="Editar">✏️</button><button type="button" data-a="compartir" title="Compartir con un amigo">📤</button><button type="button" class="del" data-a="borrar" aria-label="Borrar nota" title="Borrar">🗑</button></span></b><p>' + (esc(d.p) || '<i style="opacity:.6">(sin texto)</i>') + '</p>'
        + ((n.etiquetas || []).length ? '<div class="et">' + n.etiquetas.map((e) => '<i>#' + esc(e) + '</i>').join('') + '</div>' : '');
      it.addEventListener('click', (e) => {
        const bt = e.target.closest('button'); const a = bt && bt.dataset.a;
        if (a === 'borrar') { e.stopPropagation(); if (confirm('¿Borrar esta nota?')) borrar(n).then(() => { refrescarListas(S, p); if (window.NikaPdfAnot) window.NikaPdfAnot.recargar(S); }); return; }
        if (a === 'editar') { e.stopPropagation(); editar(S, n); return; }
        if (a === 'compartir') { e.stopPropagation(); if (window.NikaPdfAnot) window.NikaPdfAnot.compartir(S, n); return; }
        if (window.NikaPdf && n.posicion) window.NikaPdf.irA(+n.posicion, true);
        if (n.anotacion && window.NikaPdfAnot) setTimeout(() => window.NikaPdfAnot.resaltar(S, n.id), 350);
      });
      lista.appendChild(it);
    });
    const todas = await cuadernoNotas();
    sel.innerHTML = '<option value="">Elegí la nota…</option>' + todas.map((n) => {
      const d = leer(n); const nombre = d.t || (d.p || '').replace(/\s+/g, ' ').slice(0, 42) || 'Nota sin título';
      return '<option value="' + esc(n.id) + '">' + esc(nombre) + (n.posicion ? ' · pág. ' + esc(n.posicion) : '') + '</option>';
    }).join('');
    p._previas = todas;
  }

  function enlazar(S, p) {
    const $ = (s) => p.querySelector(s);
    const msg = (t, err) => { const m = $('.nkn-msg'); m.textContent = t; m.classList.toggle('err', !!err); if (t) setTimeout(() => { if (m.textContent === t) m.textContent = ''; }, 4000); };
    p._color = 'amarillo'; p._etiq = [];
    p._pintarFormulario = () => {
      $('.nkn-hoja').style.setProperty('--c', COLORES[p._color]); p.querySelectorAll('.nkn-col').forEach((b) => b.classList.toggle('on', b.dataset.color === p._color));
      const base = Array.from(new Set(ETIQ_BASE.concat(p._etiq)));
      $('.nkn-etq').innerHTML = base.map((e) => '<button type="button" class="nkn-chip' + (p._etiq.includes(e) ? ' on' : '') + '" data-etq="' + esc(e) + '">#' + esc(e) + '</button>').join('') + '<input type="text" maxlength="24" placeholder="+ etiqueta" aria-label="Nueva etiqueta">';
    };
    const salirEdicion = () => {
      p._edit = null; $('.nkn-hoja').classList.remove('edit'); $('.nkn-edit-cab').hidden = true; $('.nkn-donde').hidden = false;
      $('.nkn-texto').value = ''; $('.nkn-titulo').value = ''; p._color = 'amarillo'; p._etiq = []; p._pintarFormulario(); $('[data-n=guardar]').textContent = '💾 Guardar nota';
      $('.nkn-pag').value = S.actual || 1;
    };
    p._pintarFormulario();
    p.addEventListener('click', async (e) => {
      const f = e.target.closest('[data-f]'); if (f) { p._filtro = f.dataset.f || null; refrescarListas(S, p); return; }
      const q = e.target.closest('[data-etq]'); if (q) { const t = q.dataset.etq; p._etiq = p._etiq.includes(t) ? p._etiq.filter((x) => x !== t) : p._etiq.concat([t]); p._pintarFormulario(); return; }
      const b = e.target.closest('[data-n],[data-color]'); if (!b) return;
      if (b.dataset.color) { p._color = b.dataset.color; p._pintarFormulario(); return; }
      if (b.dataset.n === 'cerrar') { abrir(S); return; }
      if (b.dataset.n === 'cancelar-edicion') { salirEdicion(); return; }
      if (b.dataset.n === 'actual') { $('.nkn-pag').value = S.actual || 1; return; }
      if (b.dataset.n === 'guardar') {
        const pag = Math.max(1, Math.min(S.n || 9999, parseInt($('.nkn-pag').value, 10) || S.actual || 1));
        const titulo = $('.nkn-titulo').value.trim(), texto = $('.nkn-texto').value.trim();
        const edit = p._edit;
        if (!texto && !(edit && edit.anotacion === 'pin')) { msg('Escribí la nota antes de guardarla.', true); return; }
        const donde = (p.querySelector('input[name="nkn-donde"]:checked') || {}).value;
        b.disabled = true;
        try {
          if (edit) {
            const d = leer(edit);
            const ok = await actualizar(edit, { posicion: pag, texto: empaquetar({ t: titulo, h: d.h && !d.p ? d.h : '', p: texto, d: '', e: d.e }), color: p._color, etiquetas: p._etiq.slice() });
            if (!ok) { msg('No se pudo guardar los cambios.', true); return; }
            msg('Cambios guardados ✓'); salirEdicion();
          } else if (donde === 'previa') {
            const id = $('.nkn-previas').value; const n = (p._previas || []).find((x) => String(x.id) === id);
            if (!n) { msg('Elegí la nota a la que querés sumar esto.', true); return; }
            const d = leer(n);
            d.h = (d.h || aHtml(d.p)) + '<p><b>📄 Pág. ' + pag + (S.title ? ' · ' + esc(S.title) : '') + (titulo ? ' · ' + esc(titulo) : '') + '</b><br>' + aHtml(texto) + '</p>';
            d.p = (d.p ? d.p + '\n\n' : '') + 'Pág. ' + pag + (titulo ? ' · ' + titulo : '') + ': ' + texto;
            const ok = await actualizarTexto(n, empaquetar(d));
            if (!ok) { msg('No se pudo sumar a la nota previa.', true); return; }
            msg('Sumada a tu nota ✓');
          } else {
            await insertar({ recurso: 'pdf:' + S.fileId, recurso_titulo: S.title || null, modulo: modulo(), up_id: upActual(), tipo: 'material', posicion: pag,
              texto: empaquetar({ t: titulo, h: '', p: texto, d: '', e: '' }), color: p._color, etiquetas: p._etiq.slice(), creado_en: new Date().toISOString() });
            msg('Nota guardada ✓ · la encontrás también en “Mis notas”');
            $('.nkn-texto').value = ''; $('.nkn-titulo').value = ''; p._etiq = []; p._pintarFormulario();
          }
          if (window.NikaPdfAnot) window.NikaPdfAnot.recargar(S);
          await refrescarListas(S, p);
        } catch (_) { msg('No se pudo guardar. Probá de nuevo.', true); }
        finally { b.disabled = false; }
      }
    });
    p.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter' && e.target.matches('.nkn-etq input')) {
        e.preventDefault(); const t = e.target.value.trim().toLowerCase().replace(/^#/, '').slice(0, 24);
        if (t && !p._etiq.includes(t)) { p._etiq.push(t); p._pintarFormulario(); const i = p.querySelector('.nkn-etq input'); if (i) i.focus(); }
      }
    });
    p.addEventListener('change', (e) => {
      if (e.target.name === 'nkn-donde') $('.nkn-previa').hidden = e.target.value !== 'previa';
      if (e.target.matches('.nkn-etq input')) { const t = e.target.value.trim().toLowerCase().replace(/^#/, '').slice(0, 24); if (t && !p._etiq.includes(t)) { p._etiq.push(t); p._pintarFormulario(); } }
    });
  }

  window.NikaPdfNotas = { abrir, editar, asegurarAbierto, notasDelArchivo, insertar, actualizar, borrar, leer, empaquetar, COLORES, ETIQ_BASE, modulo, upActual, refrescar: (S) => { const p = panelDe(S); if (p) refrescarListas(S, p); } };
})();
