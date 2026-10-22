/* CAMPUS NIKA · Anotaciones sobre el PDF del Lector NikaMed (js/estudio/pdfLector.js)
   · 📝 Texto: tocá en cualquier lugar de la página y escribí (mover, agrandar/achicar la letra, cambiar el color, etiquetas).
   · 📌 Marcador: un pin animado; al tocarlo se abre la nota en «Notas de lectura» para leerla o editarla.
   · Todo se guarda como una nota más en notas_estudio (columnas anotacion, pos_x, pos_y, ancho, tam, etiquetas): se sincroniza
     con las Notas de lectura y con «Mis notas», y funciona igual en todos los módulos (la clave es el archivo del PDF).
   · 📤 Compartir: se le manda a un amigo (le llega una notificación y puede guardar una copia propia). Las anotaciones son solo tuyas.
   · ✍️ Lápiz/dedo en tablet: lo maneja el lector con los eventos de puntero (ver «Solo lápiz»). */
(function () {
  'use strict';
  if (window.NikaPdfAnot) return;
  const NCOL = { amarillo: '#fde68a', rosa: '#fbcfe8', celeste: '#bae6fd', verde: '#bbf7d0', naranja: '#fed7aa', lila: '#ddd6fe' };
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const N = () => window.NikaPdfNotas;
  const aColorNota = (c) => (NCOL[c] ? c : (c === 'azul' ? 'celeste' : 'amarillo'));
  let seleccionada = null;

  function css() {
    if (document.getElementById('nkan-css')) return;
    const st = document.createElement('style'); st.id = 'nkan-css';
    st.textContent = `
.nk-an{position:absolute;inset:0;z-index:4;pointer-events:none}
.nk-at{--c:#fde68a;position:absolute;min-width:60px;pointer-events:auto;border-radius:8px;background:color-mix(in srgb,var(--c) 92%,#fff);color:#1e293b;box-shadow:0 6px 16px -6px rgba(15,23,42,.55),0 0 0 1px rgba(15,23,42,.12);font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-weight:600;line-height:1.3;animation:nkanEntra .35s cubic-bezier(.2,.9,.3,1.3) both;touch-action:none}
.nk-at.sel{box-shadow:0 0 0 2px #7c3aed,0 10px 22px -8px rgba(15,23,42,.6)}
.nk-at.flash{animation:nkanFlash 1.4s ease}
.nk-at-txt{padding:5px 9px 6px 20px;min-height:1.3em;outline:0;white-space:pre-wrap;word-break:break-word;cursor:text;touch-action:auto}
.nk-at-txt:empty::before{content:attr(data-ph);color:rgba(15,23,42,.45)}
.nk-at-asa{position:absolute;left:0;top:0;bottom:0;width:17px;display:flex;align-items:center;justify-content:center;font-size:.8em;color:rgba(15,23,42,.45);cursor:grab;border-radius:8px 0 0 8px;touch-action:none;user-select:none;-webkit-user-select:none}
.nk-at-asa:hover{background:rgba(15,23,42,.08);color:#0f172a}.nk-at-asa:active{cursor:grabbing}
.nk-at-res{position:absolute;right:-5px;bottom:-5px;width:14px;height:14px;border-radius:50%;background:#7c3aed;border:2px solid #fff;cursor:ew-resize;opacity:0;transition:opacity .15s;touch-action:none}
.nk-at:hover .nk-at-res,.nk-at.sel .nk-at-res{opacity:1}
.nk-at-etq{display:flex;flex-wrap:wrap;gap:3px;padding:0 8px 5px 20px}.nk-at-etq i{font-style:normal;font-weight:800;font-size:.6em;font-family:inherit;background:rgba(15,23,42,.12);border-radius:999px;padding:0 7px;color:#334155}
.nk-at-bar{position:absolute;left:0;bottom:calc(100% + 8px);display:flex;gap:3px;align-items:center;padding:4px;border-radius:12px;background:#0f172a;box-shadow:0 12px 26px rgba(0,0,0,.45);white-space:nowrap;font-size:14px;animation:nkanEntra .2s ease both;z-index:2}
.nk-at-bar.abajo{bottom:auto;top:calc(100% + 8px)}
.nk-at-bar button{border:0;background:transparent;color:#e2e8f0;border-radius:8px;min-width:30px;height:30px;padding:0 6px;cursor:pointer;font-weight:800;font-size:13px;font-family:inherit;transition:background .15s,transform .15s}
.nk-at-bar button:hover{background:#1e293b;transform:translateY(-1px)}.nk-at-bar button:active{transform:scale(.92)}
.nk-at-bar .c{width:18px;height:18px;min-width:18px;border-radius:50%;border:2px solid rgba(255,255,255,.35);padding:0}.nk-at-bar .c.on{border-color:#fff}
.nk-at-bar .sep{width:1px;height:18px;background:#334155;margin:0 2px}
.nk-at-etqpop{position:absolute;left:0;bottom:calc(100% + 54px);width:230px;padding:10px;border-radius:12px;background:#0f172a;color:#e2e8f0;box-shadow:0 12px 26px rgba(0,0,0,.45);font-size:12px;z-index:3}
.nk-at-etqpop.abajo{bottom:auto;top:calc(100% + 54px)}
.nk-at-etqpop button{border:1.5px solid #475569;background:transparent;color:#cbd5e1;border-radius:999px;padding:2px 9px;margin:2px;cursor:pointer;font-weight:800;font-size:11px;font-family:inherit}.nk-at-etqpop button.on{background:#7c3aed;border-color:#7c3aed;color:#fff}
.nk-at-etqpop input{width:100%;box-sizing:border-box;margin-top:6px;border-radius:8px;border:1px solid #475569;background:#1e293b;color:#fff;padding:5px 8px;font-weight:700;font-size:12px;font-family:inherit;outline:0}
.nk-pin{position:absolute;pointer-events:auto;width:30px;height:34px;margin:-34px 0 0 -15px;padding:0;border:0;background:none;cursor:pointer;transform-origin:50% 100%;animation:nkPinCae .65s cubic-bezier(.3,1.5,.5,1) both;touch-action:none;-webkit-tap-highlight-color:transparent}
.nk-pin .ico{display:block;font-size:26px;line-height:30px;filter:drop-shadow(0 3px 3px rgba(15,23,42,.45));transition:transform .25s cubic-bezier(.3,1.7,.5,1);transform-origin:50% 100%}
.nk-pin:hover .ico{animation:nkPinBalanceo .7s ease-in-out infinite}
.nk-pin:active .ico{transform:scale(.85) translateY(2px)}
.nk-pin .aro{position:absolute;left:50%;bottom:-3px;width:10px;height:6px;margin-left:-5px;border-radius:50%;background:var(--c,#ef4444);opacity:.0}
.nk-pin.sel .aro,.nk-pin.flash .aro{opacity:.85;animation:nkPinOnda 1.2s ease-out infinite}
.nk-pin.flash .ico{animation:nkPinSalto .9s ease 2}
.nk-pin .tip{position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%) scale(.9);opacity:0;pointer-events:none;background:#0f172a;color:#fff;border-radius:10px;padding:6px 10px;width:max-content;max-width:210px;font:600 12px/1.35 'Plus Jakarta Sans',system-ui,sans-serif;box-shadow:0 10px 22px rgba(0,0,0,.4);transition:opacity .18s,transform .18s;white-space:normal;text-align:left}
.nk-pin:hover .tip,.nk-pin:focus-visible .tip{opacity:1;transform:translateX(-50%) scale(1)}
.nk-pin .tip i{display:block;font-style:normal;color:#c4b5fd;font-size:11px;margin-top:2px}
.nk-pin .pt{position:absolute;right:-2px;top:-2px;width:9px;height:9px;border-radius:50%;background:var(--c,#ef4444);border:2px solid #fff}
@keyframes nkanEntra{from{opacity:0;transform:translateY(6px) scale(.96)}to{opacity:1;transform:none}}
@keyframes nkanFlash{0%,100%{box-shadow:0 0 0 2px #7c3aed}30%,70%{box-shadow:0 0 0 8px rgba(124,58,237,.35)}}
@keyframes nkPinCae{0%{opacity:0;transform:translateY(-46px) rotate(-30deg) scale(1.3)}55%{opacity:1;transform:translateY(0) rotate(8deg) scale(1)}72%{transform:translateY(-9px) rotate(-5deg)}100%{transform:none}}
@keyframes nkPinBalanceo{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(12deg) scale(1.12)}}
@keyframes nkPinOnda{0%{transform:scale(1);opacity:.85}100%{transform:scale(3.6);opacity:0}}
@keyframes nkPinSalto{0%,100%{transform:translateY(0)}35%{transform:translateY(-14px) rotate(-12deg)}65%{transform:translateY(0) rotate(8deg) scale(1.2)}}
.nkpdf.m-texto .nkpdf-scroll{cursor:text}.nkpdf.m-pin .nkpdf-scroll{cursor:copy}
.nkpdf.m-texto .nk-tx,.nkpdf.m-pin .nk-tx{user-select:none;-webkit-user-select:none}
.nk-modal-share{position:fixed;inset:0;z-index:2147483200;background:rgba(2,6,23,.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:nkanEntra .2s ease}
.nk-modal-share>div{width:min(420px,100%);max-height:80vh;display:flex;flex-direction:column;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:20px;padding:20px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.nk-modal-share h3{margin:0 0 4px;font-weight:800;font-size:17px;font-family:inherit}.nk-modal-share p{margin:0 0 10px;color:#94a3b8;font-size:13px}
.nk-modal-share input{border-radius:12px;border:1px solid #334155;background:#16223a;color:#fff;padding:9px 12px;font-weight:600;font-size:14px;font-family:inherit;outline:0;margin-bottom:8px}
.nk-modal-share .lista{overflow:auto;display:flex;flex-direction:column;gap:6px}
.nk-modal-share .amigo{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:12px;background:#16223a;cursor:pointer;transition:background .15s,transform .15s}.nk-modal-share .amigo:hover{background:#243756;transform:translateX(3px)}
.nk-modal-share .amigo.enviada{background:#14532d}.nk-modal-share .pt{width:9px;height:9px;border-radius:50%;background:#475569;flex:none}.nk-modal-share .pt.on{background:#22c55e;box-shadow:0 0 8px #22c55e}
.nk-modal-share button.cerrar{margin-top:12px;border:0;border-radius:12px;padding:10px;background:#1e293b;color:#e2e8f0;font-weight:800;font-size:14px;font-family:inherit;cursor:pointer}
@media (prefers-reduced-motion:reduce){.nk-at,.nk-pin,.nk-pin *{animation:none!important;transition:none!important}}`;
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------------- datos
  const lista = (S) => S.anots || (S.anots = []);
  async function cargar(S) {
    css();
    const api = N(); if (!api || !S) return;
    try { S.anots = (await api.notasDelArchivo(S.fileId)).filter((n) => n.anotacion && !api.leer(n).d); } catch (_) { S.anots = []; }
    S.pags.forEach((pg) => { if (pg.hecho) pintar(S, pg); });
  }
  const recargar = (S) => cargar(S);

  // ---------------------------------------------------------------- pintar
  function pintar(S, pg) {
    css();
    const capa = pg.el.querySelector('.nk-an'); if (!capa) return;
    if (capa.contains(document.activeElement) && capa.querySelector('.nk-at-txt:focus')) return;   // no pisar lo que se está escribiendo
    capa.innerHTML = '';
    capa.style.setProperty('--u', (pg.el.offsetWidth / 50) + 'px');
    lista(S).filter((a) => +a.posicion === pg.num).forEach((a) => capa.appendChild(a.anotacion === 'pin' ? elPin(S, a, pg) : elTexto(S, a, pg)));
  }
  function repintar(S, id) { const a = lista(S).find((x) => x.id === id); if (!a) return; const pg = S.pags[(+a.posicion || 1) - 1]; if (pg) pintar(S, pg); }
  const num = (v, d) => (v == null || isNaN(+v) ? d : +v);

  function deseleccionar() {
    if (!seleccionada) return;
    const { el } = seleccionada; el.classList.remove('sel');
    const b = el.querySelector('.nk-at-bar'); if (b) b.remove(); const p = el.querySelector('.nk-at-etqpop'); if (p) p.remove();
    seleccionada = null;
  }
  document.addEventListener('pointerdown', (e) => { if (seleccionada && !seleccionada.el.contains(e.target)) deseleccionar(); }, true);

  // ---- texto
  function elTexto(S, a, pg) {
    const api = N(), d = api.leer(a);
    const el = document.createElement('div'); el.className = 'nk-at'; el.dataset.id = a.id;
    el.style.cssText = `left:${num(a.pos_x, .1) * 100}%;top:${num(a.pos_y, .1) * 100}%;width:${num(a.ancho, .28) * 100}%;--c:${NCOL[aColorNota(a.color)]};font-size:calc(var(--u) * ${num(a.tam, 1)})`;
    el.innerHTML = '<div class="nk-at-asa" title="Mover" aria-label="Mover">⠿</div><div class="nk-at-txt" contenteditable="true" spellcheck="false" data-ph="Escribí acá…" role="textbox" aria-label="Texto sobre el PDF"></div><i class="nk-at-res" title="Cambiar el ancho"></i><div class="nk-at-etq"></div>';
    const tx = el.querySelector('.nk-at-txt'); tx.textContent = d.p;
    pintarEtq(el, a);
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); seleccionar(S, a, el, pg); });
    el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') tx.blur(); });
    let t = null;
    tx.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => api.actualizar(a, { texto: api.empaquetar({ t: d.t, p: tx.innerText.replace(/\n$/, ''), d: '', h: '' }) }).then(() => api.refrescar(S)), 600); });
    tx.addEventListener('blur', () => {
      clearTimeout(t);
      setTimeout(async () => {
        const txt = tx.innerText.replace(/\n$/, '');
        if (!txt.trim()) { if (document.activeElement && el.contains(document.activeElement)) return; await api.borrar(a); S.anots = lista(S).filter((x) => x !== a); el.remove(); deseleccionar(); api.refrescar(S); return; }
        await api.actualizar(a, { texto: api.empaquetar({ t: d.t, p: txt, d: '', h: '' }) }); api.refrescar(S);
      }, 160);
    });
    mover(S, a, el, pg, el.querySelector('.nk-at-asa'));
    redimensionar(S, a, el, pg);
    return el;
  }
  function pintarEtq(el, a) { const c = el.querySelector('.nk-at-etq'); if (c) c.innerHTML = (a.etiquetas || []).map((e) => '<i>#' + esc(e) + '</i>').join(''); }

  function seleccionar(S, a, el, pg) {
    if (seleccionada && seleccionada.el === el) return;
    deseleccionar(); el.classList.add('sel'); seleccionada = { S, a, el };
    const bar = document.createElement('div'); bar.className = 'nk-at-bar';
    const cols = Object.keys(NCOL).map((k) => `<button type="button" class="c${aColorNota(a.color) === k ? ' on' : ''}" data-c="${k}" title="${k}" style="background:${NCOL[k]}"></button>`).join('');
    bar.innerHTML = `<button type="button" data-x="menos" title="Letra más chica">A−</button><button type="button" data-x="mas" title="Letra más grande">A+</button><span class="sep"></span>${cols}<span class="sep"></span><button type="button" data-x="etq" title="Etiquetas">🏷</button><button type="button" data-x="compartir" title="Compartir con un amigo">📤</button><button type="button" data-x="borrar" title="Borrar">🗑</button>`;
    if (parseFloat(el.style.top) < 9) bar.classList.add('abajo');
    bar.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); });
    bar.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return; const api = N();
      if (b.dataset.c) { await api.actualizar(a, { color: b.dataset.c }); el.style.setProperty('--c', NCOL[b.dataset.c]); bar.querySelectorAll('.c').forEach((x) => x.classList.toggle('on', x === b)); api.refrescar(S); return; }
      const x = b.dataset.x;
      if (x === 'mas' || x === 'menos') { const t = Math.max(.5, Math.min(3, +(num(a.tam, 1) + (x === 'mas' ? .15 : -.15)).toFixed(2))); await api.actualizar(a, { tam: t }); el.style.fontSize = `calc(var(--u) * ${t})`; }
      else if (x === 'borrar') { if (confirm('¿Borrar este texto?')) { await api.borrar(a); S.anots = lista(S).filter((z) => z !== a); el.remove(); seleccionada = null; api.refrescar(S); } }
      else if (x === 'compartir') compartir(S, a);
      else if (x === 'etq') popEtiquetas(S, a, el, bar);
    });
    el.appendChild(bar);
  }
  function popEtiquetas(S, a, el, bar) {
    const ya = el.querySelector('.nk-at-etqpop'); if (ya) { ya.remove(); return; }
    const api = N(), pop = document.createElement('div'); pop.className = 'nk-at-etqpop'; if (bar.classList.contains('abajo')) pop.classList.add('abajo');
    const pintarPop = () => {
      const base = Array.from(new Set(api.ETIQ_BASE.concat(a.etiquetas || [])));
      pop.innerHTML = base.map((t) => `<button type="button" class="${(a.etiquetas || []).includes(t) ? 'on' : ''}" data-t="${esc(t)}">#${esc(t)}</button>`).join('') + '<input type="text" maxlength="24" placeholder="Nueva etiqueta y Enter">';
    };
    pintarPop();
    const guardar = async (arr) => { await api.actualizar(a, { etiquetas: arr }); pintarEtq(el, a); pintarPop(); api.refrescar(S); const i = pop.querySelector('input'); if (i) i.focus(); };
    pop.addEventListener('pointerdown', (e) => e.stopPropagation());
    pop.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; const t = b.dataset.t, cur = a.etiquetas || []; guardar(cur.includes(t) ? cur.filter((x) => x !== t) : cur.concat([t])); });
    pop.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { const t = e.target.value.trim().toLowerCase().replace(/^#/, '').slice(0, 24); if (t && !(a.etiquetas || []).includes(t)) guardar((a.etiquetas || []).concat([t])); } });
    el.appendChild(pop);
  }

  // ---- mover y redimensionar (mouse, dedo y lápiz: eventos de puntero)
  function mover(S, a, el, pg, asa, soloUmbral) {
    asa.addEventListener('pointerdown', (e) => {
      if (e.button) return; e.preventDefault(); e.stopPropagation();
      const b = pg.el.getBoundingClientRect(); const x0 = e.clientX, y0 = e.clientY, px = num(a.pos_x, .1), py = num(a.pos_y, .1); let movio = false;
      asa.setPointerCapture && asa.setPointerCapture(e.pointerId);
      const mv = (ev) => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0;
        if (!movio && Math.hypot(dx, dy) < (soloUmbral || 3)) return; movio = true;
        a.pos_x = Math.max(0, Math.min(.98, px + dx / b.width)); a.pos_y = Math.max(0, Math.min(.98, py + dy / b.height));
        el.style.left = a.pos_x * 100 + '%'; el.style.top = a.pos_y * 100 + '%';
      };
      const fin = async () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin); if (movio) { await N().actualizar(a, { pos_x: +a.pos_x.toFixed(4), pos_y: +a.pos_y.toFixed(4) }); el._movio = true; setTimeout(() => { el._movio = false; }, 50); } };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    });
  }
  function redimensionar(S, a, el, pg) {
    const h = el.querySelector('.nk-at-res');
    h.addEventListener('pointerdown', (e) => {
      if (e.button) return; e.preventDefault(); e.stopPropagation();
      const b = pg.el.getBoundingClientRect(); const x0 = e.clientX, w0 = num(a.ancho, .28);
      h.setPointerCapture && h.setPointerCapture(e.pointerId);
      const mv = (ev) => { a.ancho = Math.max(.08, Math.min(.95 - num(a.pos_x, .1), w0 + (ev.clientX - x0) / b.width)); el.style.width = a.ancho * 100 + '%'; };
      const fin = async () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin); await N().actualizar(a, { ancho: +a.ancho.toFixed(4) }); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    });
  }

  // ---- marcador 📌
  function elPin(S, a, pg) {
    const api = N(), d = api.leer(a);
    const el = document.createElement('button'); el.type = 'button'; el.className = 'nk-pin'; el.dataset.id = a.id;
    el.style.cssText = `left:${num(a.pos_x, .5) * 100}%;top:${num(a.pos_y, .5) * 100}%;--c:${{ amarillo: '#f59e0b', rosa: '#ec4899', celeste: '#0ea5e9', verde: '#22c55e', naranja: '#f97316', lila: '#8b5cf6' }[aColorNota(a.color)]}`;
    const resumen = (d.t ? d.t + ' · ' : '') + (d.p || '').replace(/\s+/g, ' ').slice(0, 90);
    el.innerHTML = `<span class="ico">📌</span><i class="aro"></i><span class="pt"></span><span class="tip">${esc(resumen || 'Marcador sin texto: tocá para escribir')}${(a.etiquetas || []).length ? '<i>' + a.etiquetas.map((e) => '#' + esc(e)).join(' ') + '</i>' : ''}</span>`;
    el.setAttribute('aria-label', 'Marcador: ' + (resumen || 'sin texto'));
    el.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => { e.stopPropagation(); if (el._movio) return; abrirPin(S, a, el); });
    mover(S, a, el, pg, el, 6);
    return el;
  }
  function abrirPin(S, a, el) {
    document.querySelectorAll('.nk-pin.sel').forEach((x) => x.classList.remove('sel'));
    if (el) el.classList.add('sel');
    N().editar(S, a);
  }

  // ---------------------------------------------------------------- colocar (lo llama el lector en los modos texto/pin)
  async function colocar(S, e, pg, tipo) {
    const api = N(); if (!api) return;
    css();
    const b = pg.el.getBoundingClientRect();
    const x = Math.max(.01, Math.min(.95, (e.clientX - b.left) / b.width)), y = Math.max(.01, Math.min(.97, (e.clientY - b.top) / b.height));
    const color = aColorNota(S.color === 'azul' ? 'celeste' : S.color);
    const fila = { recurso: 'pdf:' + S.fileId, recurso_titulo: S.title || null, modulo: api.modulo(), up_id: api.upActual(), tipo: 'material', posicion: pg.num,
      texto: api.empaquetar({ p: '' }), color, anotacion: tipo, pos_x: +x.toFixed(4), pos_y: +y.toFixed(4), ancho: tipo === 'texto' ? .28 : null, tam: 1, etiquetas: [], creado_en: new Date().toISOString() };
    const nota = await api.insertar(fila);
    lista(S).push(nota); pintar(S, pg);
    if (window.NikaPdf && window.NikaPdf.modo) window.NikaPdf.modo('sel');
    const el = pg.el.querySelector(`[data-id="${nota.id}"]`);
    if (tipo === 'texto' && el) { const tx = el.querySelector('.nk-at-txt'); seleccionar(S, nota, el, pg); setTimeout(() => tx.focus(), 40); }
    else if (tipo === 'pin' && el) { abrirPin(S, nota, el); }
    api.refrescar(S);
  }

  function resaltar(S, id) {
    const a = lista(S).find((x) => String(x.id) === String(id)); if (!a) return;
    const pg = S.pags[(+a.posicion || 1) - 1]; if (!pg) return;
    const ir = () => { const el = pg.el.querySelector(`[data-id="${a.id}"]`); if (!el) return false; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2600); return true; };
    if (!ir()) setTimeout(ir, 500);
  }

  // ---------------------------------------------------------------- compartir con un amigo
  async function compartir(S, a) {
    css();
    const api = N(); const d = api.leer(a);
    if (!window.NikaNotif) { alert('Las notificaciones no están disponibles en este momento.'); return; }
    if (!window.NikaFriends) await new Promise((res) => { const s = document.createElement('script'); s.src = 'js/friendsManager.js'; s.onload = res; s.onerror = res; document.head.appendChild(s); });
    let amigos = []; try { amigos = await window.NikaFriends.listFriends(); } catch (_) {}
    const m = document.createElement('div'); m.className = 'nk-modal-share';
    m.innerHTML = `<div><h3>📤 Compartir con un amigo</h3><p>Le llega una notificación con tu nota y, si quiere, la guarda como copia propia. Tu anotación sigue siendo solo tuya.</p><input type="search" placeholder="Buscar amigo…" aria-label="Buscar amigo"><div class="lista"></div><button type="button" class="cerrar">Cerrar</button></div>`;
    const cont = m.querySelector('.lista'), q = m.querySelector('input');
    const pintarL = () => {
      const t = q.value.trim().toLowerCase();
      const fs = amigos.filter((f) => !t || (f.username + ' ' + (f.fullname || '')).toLowerCase().includes(t));
      cont.innerHTML = fs.length ? fs.map((f) => `<div class="amigo" data-u="${esc(f.username)}"><span class="pt ${window.NikaNotif.estaEnLinea(f.username) ? 'on' : ''}"></span><div><b>${esc(f.fullname || f.username)}</b><div style="font-size:12px;color:#94a3b8">@${esc(f.username)}</div></div><span style="margin-left:auto;font-size:12px;color:#7dd3fc" class="est">Enviar</span></div>`).join('') : '<p style="text-align:center;margin:14px 0">' + (amigos.length ? 'Ningún amigo coincide.' : 'Todavía no tenés amigos para compartirles notas.') + '</p>';
    };
    pintarL(); q.addEventListener('input', pintarL);
    m.addEventListener('click', async (e) => {
      if (e.target === m || e.target.closest('.cerrar')) { m.remove(); return; }
      const f = e.target.closest('.amigo'); if (!f || f.classList.contains('enviada')) return;
      f.querySelector('.est').textContent = 'Enviando…';
      const yo = (window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername()) || 'un amigo';
      const r = await window.NikaNotif.enviar(f.dataset.u, 'nota_compartida', '@' + yo + ' te compartió una nota', (d.p || '').replace(/\s+/g, ' ').slice(0, 110),
        { recurso: 'pdf:' + S.fileId, recurso_titulo: S.title || null, modulo: a.modulo || null, up_id: a.up_id || null, pagina: a.posicion || null, texto: d.p || '', color: a.color, anotacion: a.anotacion || null, pos_x: a.pos_x ?? null, pos_y: a.pos_y ?? null, ancho: a.ancho ?? null, tam: a.tam ?? null, etiquetas: a.etiquetas || [] });
      if (r && r.ok) { f.classList.add('enviada'); f.querySelector('.est').textContent = '✅ Enviada'; window.NikaNotif.sonar('ok', { forzar: true }); }
      else { f.querySelector('.est').textContent = r && r.reason === 'no_amigo' ? 'Primero tienen que ser amigos' : 'No se pudo enviar'; window.NikaNotif.sonar('error', { forzar: true }); }
    });
    (document.fullscreenElement || document.body).appendChild(m);
  }

  window.NikaPdfAnot = { cargar, recargar, pintar, colocar, resaltar, compartir, deseleccionar };
})();
