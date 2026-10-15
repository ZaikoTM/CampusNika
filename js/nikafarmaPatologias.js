// js/nikafarmaPatologias.js
// NikaFarma · "Patologías y tratamiento": esquemas de tratamiento resumidos de guías argentinas (FASGO, SOGIBA).
// Se suma a nikafarma.html sin tocar su motor: lee data/nikafarma_patologias.json, escucha el buscador (#q)
// y muestra una tarjeta con el esquema cuando lo que se escribe coincide con una patología.
// REGLA: ningún dato clínico se escribe de memoria; cada ficha cita su guía y su estado (borrador / verificada).

(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  const URL_DATOS = 'data/nikafarma_patologias.json';
  let D = null, cargando = null, ultimaQ = '';

  function cargar() {
    if (D) return Promise.resolve(D);
    if (cargando) return cargando;
    cargando = fetch(URL_DATOS, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((j) => { D = j; D._idx = (j.patologias || []).map((p) => ({ p, claves: [p.titulo].concat(p.alias || []).map(norm).filter(Boolean) })); return D; })
      .catch((e) => { cargando = null; console.warn('[patologías] no se pudo cargar:', e); return null; });
    return cargando;
  }

  // ---------- estilos ----------
  const css = document.createElement('style');
  css.textContent = `
  .pt-card{margin:12px 0;padding:14px 16px;border-radius:16px;border:1px solid var(--nf-line,rgba(148,163,184,.3));background:linear-gradient(135deg,rgba(236,72,153,.10),rgba(99,102,241,.10));display:flex;gap:12px;align-items:center;flex-wrap:wrap;animation:ptIn .35s ease both}
  @keyframes ptIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .pt-card .pt-ic{font-size:1.6rem}
  .pt-card .pt-tx{flex:1;min-width:200px}
  .pt-card b{display:block;font-size:.98rem}
  .pt-card small{opacity:.75}
  .pt-btn{border:0;border-radius:999px;padding:9px 16px;font:700 .85rem inherit;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,#ec4899,#6366f1);color:#fff;transition:transform .15s,box-shadow .2s}
  .pt-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px -8px rgba(99,102,241,.7)}
  .pt-btn.sec{background:rgba(148,163,184,.18);color:inherit}
  .pt-tag{display:inline-block;padding:2px 9px;border-radius:99px;font-size:.7rem;font-weight:800;letter-spacing:.02em}
  .pt-tag.borrador{background:rgba(245,158,11,.18);color:#b45309}
  .pt-tag.verificada{background:rgba(16,185,129,.18);color:#047857}
  .pt-tag.sin_guia{background:rgba(148,163,184,.25)}
  .pt-tag.ficha{background:rgba(99,102,241,.18);color:#4338ca}
  .pt-tag.guia{background:rgba(14,165,233,.18);color:#0369a1}
  .pt-modal{position:fixed;inset:0;z-index:9500;display:none;align-items:flex-start;justify-content:center;padding:4vh 12px;background:rgba(2,6,23,.62);backdrop-filter:blur(4px);overflow:auto}
  .pt-modal.on{display:flex}
  .pt-box{width:min(820px,100%);background:var(--nf-bg,#0f172a);color:var(--nf-fg,#e2e8f0);border:1px solid rgba(148,163,184,.25);border-radius:20px;padding:20px 22px 24px;box-shadow:0 30px 70px -20px rgba(0,0,0,.7);animation:ptPop .28s cubic-bezier(.2,.9,.3,1.2) both}
  @keyframes ptPop{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
  html:not([data-theme="dark"]) .pt-box{background:#fff;color:#0f172a}
  .pt-head{display:flex;gap:10px;align-items:flex-start;justify-content:space-between}
  .pt-head h2{margin:0;font-size:1.25rem;line-height:1.25}
  .pt-x{border:0;background:rgba(148,163,184,.2);color:inherit;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1rem}
  .pt-meta{margin:6px 0 12px;font-size:.78rem;opacity:.8;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .pt-aviso{padding:9px 12px;border-radius:12px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);font-size:.8rem;margin:0 0 12px}
  .pt-def{font-size:.93rem;line-height:1.5;margin:0 0 10px}
  .pt-sec{border:1px solid rgba(148,163,184,.22);border-radius:14px;margin:9px 0;overflow:hidden}
  .pt-sec>summary{cursor:pointer;padding:10px 14px;font-weight:800;font-size:.9rem;list-style:none;display:flex;justify-content:space-between;align-items:center}
  .pt-sec>summary::-webkit-details-marker{display:none}
  .pt-sec>summary::after{content:'▾';transition:transform .2s;opacity:.6}
  .pt-sec[open]>summary::after{transform:rotate(180deg)}
  .pt-sec .pt-in{padding:2px 14px 12px}
  .pt-sec ul{margin:0;padding-left:18px}
  .pt-sec li{margin:5px 0;font-size:.88rem;line-height:1.45}
  .pt-esq{margin:10px 0 4px;font-weight:800;font-size:.86rem}
  .pt-paso{display:flex;gap:10px;margin:6px 0;font-size:.88rem;line-height:1.45}
  .pt-paso .e{flex:0 0 78px;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.03em;padding-top:2px;color:#a78bfa}
  .pt-src{margin-top:12px;padding:10px 12px;border-radius:12px;background:rgba(99,102,241,.1);font-size:.8rem;line-height:1.5}
  .pt-red li::marker{color:#ef4444}
  .pt-cob{display:grid;gap:6px;margin-top:8px}
  .pt-cob div{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:10px;background:rgba(148,163,184,.1);font-size:.84rem}
  .pt-cob button{border:0;background:none;color:inherit;text-align:left;cursor:pointer;font:inherit;flex:1}
  .pt-lista{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}
  @media(max-width:560px){.pt-paso{flex-direction:column;gap:2px}.pt-paso .e{flex:none}}
  @media (prefers-reduced-motion:reduce){.pt-card,.pt-box{animation:none}}
  `;
  document.head.appendChild(css);

  // ---------- modal ----------
  let modal = null;
  function asegurarModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'pt-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Patologías y tratamiento');
    modal.innerHTML = '<div class="pt-box" id="pt-box"></div>';
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    document.body.appendChild(modal);
    return modal;
  }
  function cerrar() { if (modal) modal.classList.remove('on'); }
  function abrir(html) { asegurarModal(); $('#pt-box', modal).innerHTML = html; modal.classList.add('on'); modal.scrollTop = 0; }

  const lista = (arr, cls) => arr && arr.length ? '<ul' + (cls ? ' class="' + cls + '"' : '') + '>' + arr.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '';
  const sec = (titulo, cuerpo, abierto) => cuerpo ? '<details class="pt-sec"' + (abierto ? ' open' : '') + '><summary>' + esc(titulo) + '</summary><div class="pt-in">' + cuerpo + '</div></details>' : '';

  function htmlFicha(p) {
    const est = (D.meta.estados || {})[p.estado] || p.estado;
    const f = p.fuente || {};
    const trat = (p.tratamiento || []).map((b) =>
      '<div class="pt-esq">' + esc(b.titulo) + '</div>' + (b.pasos || []).map((s) => '<div class="pt-paso"><span class="e">' + esc(s.etiqueta) + '</span><span>' + esc(s.texto) + '</span></div>').join('')
    ).join('');
    return '<div class="pt-head"><h2>' + esc(p.titulo) + '</h2><button type="button" class="pt-x" data-pt="cerrar" aria-label="Cerrar">✕</button></div>' +
      '<div class="pt-meta"><span class="pt-tag ' + esc(p.estado) + '">' + (p.estado === 'verificada' ? '✔ Verificada' : '✎ Borrador') + '</span><span>📚 ' + esc(p.unidad) + '</span></div>' +
      '<div class="pt-aviso">' + esc(est) + ' ' + esc(D.meta.descargo) + '</div>' +
      (p.definicion ? '<p class="pt-def">' + esc(p.definicion) + '</p>' : '') +
      sec('💊 Esquema de tratamiento', trat, true) +
      sec('🩺 Criterios diagnósticos', lista(p.diagnostico), false) +
      sec('🧪 Estudios', lista(p.estudios), false) +
      sec('📈 Seguimiento', lista(p.seguimiento), false) +
      sec('🚩 Banderas rojas', lista(p.banderas, 'pt-red'), true) +
      (p.contraste ? sec('⚖️ Contraste con consensos', '<p class="pt-def"><b>' + esc(((D.meta.contraste || {})[p.contraste.estado]) || p.contraste.estado) + '</b><br><small>' + esc(p.contraste.fuente) + '</small></p>' + lista(p.contraste.puntos), true) : '') +
      '<div class="pt-src"><b>Fuente:</b> ' + esc(f.sociedad || '') + ' · ' + esc(f.guia || '') + ' · ' + esc(f.anio || '') +
      '<br><span class="pt-tag ' + (f.tipo === 'guia' ? 'verificada' : 'borrador') + '">' + esc((D.meta.tipos || {})[f.tipo] || f.tipo || '') + '</span>' +
      '<br><small>Archivo: ' + esc(f.archivo || '') + (f.nota ? ' · ' + esc(f.nota) : '') + '</small>' +
      (p.revisarAntes ? '<br><small>Revisar vigencia antes de: ' + esc(p.revisarAntes) + '</small>' : '') + '</div>' +
      '<div class="pt-lista" style="margin-top:12px"><button type="button" class="pt-btn sec" data-pt="cobertura">🗺️ Ver cobertura del temario</button></div>';
  }

  function htmlCobertura() {
    const c = D.cobertura || { temas: [] };
    const cont = { ficha: 0, guia: 0, sin_guia: 0 };
    const vistos = {}; const temas = c.temas.filter((t) => { const k = t.ficha || t.tema; if (vistos[k]) return false; vistos[k] = 1; return true; });
    temas.forEach((t) => { cont[t.estado] = (cont[t.estado] || 0) + 1; });
    const nom = { ficha: 'Ficha lista', guia: 'Guía disponible', sin_guia: 'Sin guía' };
    return '<div class="pt-head"><h2>🗺️ Cobertura del temario</h2><button type="button" class="pt-x" data-pt="cerrar" aria-label="Cerrar">✕</button></div>' +
      '<div class="pt-meta"><span class="pt-tag ficha">' + cont.ficha + ' fichas</span><span class="pt-tag guia">' + cont.guia + ' con guía por redactar</span><span class="pt-tag sin_guia">' + cont.sin_guia + ' sin guía</span></div>' +
      '<p class="pt-def">' + esc(c.nota || '') + '</p><div class="pt-cob">' +
      temas.map((t) => { const pf = t.ficha ? (D.patologias || []).find((x) => x.id === t.ficha) : null; return '<div><button type="button" ' + (t.ficha ? 'data-pt="ficha" data-id="' + esc(t.ficha) + '"' : '') + ' title="' + esc((t.guias || []).join(' · ') || t.nota || '') + '">' + esc(pf ? pf.titulo : t.tema) + ' <small style="opacity:.6">· ' + esc(t.unidad) + '</small>' + (t.nota ? '<br><small style="opacity:.65">' + esc(t.nota) + '</small>' : '') + '</button><span class="pt-tag ' + esc(t.estado) + '">' + nom[t.estado] + '</span></div>'; }).join('') + '</div>';
  }

  function abrirFicha(id) { const p = (D.patologias || []).find((x) => x.id === id); if (p) abrir(htmlFicha(p)); }

  // ---------- tarjeta en el buscador ----------
  let slot = null;
  function asegurarSlot() {
    if (slot && slot.isConnected) return slot;
    const main = $('#nfMain'); if (!main || !main.parentNode) return null;
    slot = document.createElement('div'); slot.id = 'pt-slot';
    main.parentNode.insertBefore(slot, main);
    return slot;
  }

  function buscar(q) {
    const n = norm(q); if (n.length < 3) return [];
    const palabras = n.split(' ');
    const res = [];
    D._idx.forEach(({ p, claves }) => {
      let puntos = 0;
      claves.forEach((k) => {
        if (k === n) puntos = Math.max(puntos, 100);
        else if (k.indexOf(n) >= 0 || (n.length >= 4 && n.indexOf(k) >= 0 && k.length >= 3)) puntos = Math.max(puntos, 60);
        else if (palabras.length > 1 && palabras.every((w) => k.indexOf(w) >= 0)) puntos = Math.max(puntos, 40);
      });
      if (puntos) res.push({ p, puntos });
    });
    return res.sort((a, b) => b.puntos - a.puntos).slice(0, 3).map((x) => x.p);
  }

  function cobertura_sin_guia(q) {
    const n = norm(q); if (n.length < 4) return null;
    const sg = ((D.cobertura || {}).temas || []).filter((t) => t.estado === 'sin_guia');
    return sg.find((t) => norm(t.tema).indexOf(n) >= 0) ||
      sg.find((t) => norm(t.tema).split(' ').filter((w) => w.length > 4).every((w) => n.indexOf(w) >= 0)) || null;
  }

  function pintar(q) {
    const s = asegurarSlot(); if (!s) return;
    if (!D) { s.innerHTML = ''; return; }
    const hallados = buscar(q);
    if (!hallados.length) {
      const sg = cobertura_sin_guia(q);
      s.innerHTML = sg ? '<div class="pt-card"><span class="pt-ic">🔎</span><span class="pt-tx"><b>' + esc(sg.tema) + '</b><small>Todavía no hay una guía de FASGO/SOGIBA cargada para este tema. ' + esc(sg.nota || '') + '</small></span><button type="button" class="pt-btn sec" data-pt="cobertura">🗺️ Ver cobertura</button></div>' : '';
      return;
    }
    s.innerHTML = hallados.map((p) =>
      '<div class="pt-card"><span class="pt-ic">📋</span><span class="pt-tx"><b>' + esc(p.titulo) + '</b><small>Esquema de tratamiento según ' + ((p.fuente || {}).tipo === 'guia' ? esc((p.fuente || {}).sociedad || '') + ' ' + esc((p.fuente || {}).anio || '') : 'apunte de estudiante (no oficial)') + ' · <span class="pt-tag ' + esc(p.estado) + '">' + (p.estado === 'verificada' ? 'Verificada' : 'Borrador') + '</span></small></span><button type="button" class="pt-btn" data-pt="ficha" data-id="' + esc(p.id) + '">Ver esquema</button></div>'
    ).join('');
  }

  // ---------- eventos ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pt]'); if (!b) return;
    const a = b.getAttribute('data-pt');
    if (a === 'cerrar') cerrar();
    else if (a === 'ficha') cargar().then((d) => { if (d) abrirFicha(b.getAttribute('data-id')); });
    else if (a === 'cobertura') cargar().then((d) => { if (d) abrir(htmlCobertura()); });
  });

  function escuchar() {
    const q = $('#q'); if (!q) return;
    let t = null;
    const alCambiar = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const v = q.value || ''; if (v === ultimaQ) return; ultimaQ = v;
        if (norm(v).length < 3) { const s = asegurarSlot(); if (s) s.innerHTML = ''; return; }
        cargar().then(() => pintar(v));
      }, 200);
    };
    q.addEventListener('input', alCambiar);
    // botón fijo para entrar a las patologías sin tener que buscar
    const chips = $('#domainChips');
    if (chips && chips.parentNode && !$('#pt-entrada')) {
      const bt = document.createElement('button');
      bt.id = 'pt-entrada'; bt.type = 'button'; bt.className = 'pt-btn sec'; bt.setAttribute('data-pt', 'cobertura');
      bt.style.margin = '6px 0'; bt.textContent = '📋 Patologías y tratamiento (guías argentinas)';
      chips.parentNode.insertBefore(bt, chips);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', escuchar); else escuchar();
  window.NikaFarmaPatologias = { cargar, abrirFicha: (id) => cargar().then((d) => d && abrirFicha(id)) };
})();
