/* NikaDicc — diccionario del Lector NikaMed: seleccionás una palabra y ves su definición sin salir del PDF.
   · Primero el Glosario de NikaMed (mnemotecnias, escalas, siglas y conceptos propios: js/glosarioData.js).
   · Después Wikipedia en español (resumen del artículo, gratis y sin cuenta), con el enlace para seguir leyendo.
   · Desde la tarjeta: buscar la palabra en el PDF, abrir el Glosario completo o copiarla.
   Es una referencia general: la tarjeta avisa que se confirme siempre con la bibliografía de la materia. */
(function () {
  'use strict';
  if (window.NikaDicc) return;

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const stem = (w) => (w.length > 4 ? w.replace(/(es|s)$/, '') : w);   // plurales simples: hemorragias → hemorragia
  const sinReducir = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let actual = null;   // tarjeta abierta

  // ---------- texto de la selección ----------
  function limpiar(t) {
    return String(t || '').replace(/(\w)-\s+(?=[a-záéíóúüñ])/gi, '$1')            // "pro- puesto" (corte de línea) → "propuesto"
      .replace(/\s+/g, ' ').replace(/^[\s"'“”«»(\[¿¡.,;:–—-]+|[\s"'“”«»)\].,;:!?–—-]+$/g, '').slice(0, 80);
  }

  // ---------- Glosario de NikaMed ----------
  let cargando = null;
  function glosario() {
    if (window.NIKA_GLOSARIO) return Promise.resolve(window.NIKA_GLOSARIO);
    if (cargando) return cargando;
    cargando = new Promise((ok) => {
      const s = document.createElement('script'); s.src = 'js/glosarioData.js?v=1';
      s.onload = () => ok(window.NIKA_GLOSARIO || null); s.onerror = () => { cargando = null; ok(null); };
      document.head.appendChild(s);
    });
    return cargando;
  }
  function buscarGlosario(q, G) {
    const qn = norm(q).trim(); if (!qn || !G) return [];
    const toks = qn.split(/[^a-z0-9ñ]+/).filter((t) => t.length >= 2).map(stem), res = [];
    G.forEach((g) => {
      const tn = norm(g.t), kn = norm(g.k || '');
      const kt = new Set(kn.split(/\s+/).filter(Boolean).map(stem)), tt = new Set(tn.split(/[^a-z0-9ñ]+/).filter(Boolean).map(stem));
      let sc = 0;
      if (tn === qn) sc = 100;
      else if (tn.length >= 3 && (tn.includes(qn) || qn.includes(tn))) sc = 70;
      else { let hit = 0; toks.forEach((t) => { if (kt.has(t) || tt.has(t)) hit++; }); if (hit && hit === toks.length) sc = 50 + hit; }
      if (sc >= 50) res.push({ g, sc });
    });
    res.sort((a, b) => b.sc - a.sc);
    const corte = res.length && res[0].sc >= 70 ? 70 : 50;   // si hay una coincidencia clara por título, no se suman las que solo comparten una palabra clave
    return res.filter((x) => x.sc >= corte).slice(0, 3);
  }
  const resumen = (html, n) => { const t = String(html || '').replace(/<[^>]+>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t; };

  // ---------- Wikipedia (es) ----------
  async function wiki(q) {
    const clave = 'nikaDicc:' + norm(q);
    try { const c = sessionStorage.getItem(clave); if (c) return JSON.parse(c); } catch (_) {}
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 7000), base = 'https://es.wikipedia.org';
    try {
      const sum = async (titulo) => { const r = await fetch(base + '/api/rest_v1/page/summary/' + encodeURIComponent(String(titulo).replace(/ /g, '_')) + '?redirect=true', { signal: ctl.signal }); return r.ok ? r.json() : null; };
      let d = await sum(q);
      if (!d || d.type === 'disambiguation' || !d.extract) {
        const r = await fetch(base + '/w/api.php?action=opensearch&search=' + encodeURIComponent(q) + '&limit=3&namespace=0&format=json&origin=*', { signal: ctl.signal });
        const j = await r.json(), t = j && j[1] && j[1][0];
        if (t) d = await sum(t);
      }
      let out = null;
      if (d && d.extract) out = { titulo: d.title, texto: d.extract, url: d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page, dis: d.type === 'disambiguation' };
      try { sessionStorage.setItem(clave, JSON.stringify(out)); } catch (_) {}
      return out;
    } finally { clearTimeout(tm); }
  }

  // ---------- estilos ----------
  function css() {
    if (document.getElementById('nkd-css')) return;
    const st = document.createElement('style'); st.id = 'nkd-css';
    st.textContent = `
.nkd{position:absolute;z-index:80;width:min(380px,calc(100% - 16px));max-height:min(460px,calc(100% - 16px));display:flex;flex-direction:column;border-radius:18px;overflow:hidden;color:#e2e8f0;font-weight:600;
  background:linear-gradient(150deg,#0b1535,#1e1b4b 62%,#312e81);border:1px solid rgba(168,85,247,.55);box-shadow:0 22px 46px rgba(2,6,23,.65);animation:nkdEntra .32s cubic-bezier(.34,1.4,.64,1) both}
.nkd.sale{animation:nkdSale .2s ease forwards}
@keyframes nkdEntra{from{opacity:0;transform:translateY(8px) scale(.95)}to{opacity:1;transform:none}}@keyframes nkdSale{to{opacity:0;transform:translateY(6px) scale(.97)}}
.nkd-cab{display:flex;align-items:center;gap:10px;padding:12px 14px 10px;border-bottom:1px solid rgba(255,255,255,.1);background:linear-gradient(90deg,rgba(34,211,238,.14),rgba(168,85,247,.14))}
.nkd-cab span{font-size:1.2rem;animation:nkdLat 2.6s ease-in-out infinite}.nkd-cab div{flex:1;min-width:0}.nkd-cab small{display:block;font-size:.64rem;text-transform:uppercase;letter-spacing:.1em;color:#a5b4fc;font-weight:800}
.nkd-cab b{display:block;font-size:1.02rem;font-weight:800;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nkd-x{border:0;background:transparent;color:#94a3b8;cursor:pointer;font-size:.9rem;padding:4px 7px;border-radius:8px}.nkd-x:hover{color:#fff;background:rgba(255,255,255,.12)}
@keyframes nkdLat{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.15) rotate(-8deg)}}
.nkd-cuerpo{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px}
.nkd-sec{padding:10px 12px;border-radius:13px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);animation:nkdSec .4s ease both}
@keyframes nkdSec{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.nkd-sec h6{margin:0 0 6px;font-size:.66rem;text-transform:uppercase;letter-spacing:.09em;font-weight:800;color:#67e8f9}.nkd-sec.w h6{color:#c4b5fd}
.nkd-sec b{display:block;color:#fff;font-size:.9rem;font-weight:800}.nkd-sec small{display:block;margin:1px 0 4px;color:#a5b4fc;font-size:.72rem;font-weight:700}
.nkd-sec p{margin:0;font-size:.8rem;line-height:1.5;color:#e2e8f0;font-weight:500}.nkd-sec a{display:inline-block;margin-top:7px;font-size:.74rem;font-weight:800;color:#7dd3fc;text-decoration:none}.nkd-sec a:hover{text-decoration:underline;color:#fff}
.nkd-sec .it+.it{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)}
.nkd-nota{margin:0;font-size:.66rem;line-height:1.4;color:#94a3b8;font-weight:600}
.nkd-sk{height:64px;border-radius:13px;background:linear-gradient(90deg,rgba(148,163,184,.12) 20%,rgba(148,163,184,.28) 50%,rgba(148,163,184,.12) 80%);background-size:220% 100%;animation:nkdSk 1.2s linear infinite}
@keyframes nkdSk{to{background-position:-220% 0}}
.nkd-vacio{margin:0;padding:12px;border-radius:13px;text-align:center;font-size:.8rem;color:#cbd5e1;background:rgba(148,163,184,.1);border:1px dashed rgba(148,163,184,.4);font-weight:600}
.nkd-pie{display:flex;gap:6px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.1);flex-wrap:wrap}
.nkd-pie button,.nkd-pie a{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#e2e8f0;border-radius:10px;padding:7px 10px;font:inherit;font-weight:800;font-size:.74rem;cursor:pointer;text-decoration:none;transition:background .18s,transform .15s}
.nkd-pie button:hover,.nkd-pie a:hover{background:rgba(255,255,255,.12);transform:translateY(-1px)}.nkd-pie .p{border:0;color:#fff;background:linear-gradient(135deg,#0284c7,#6366f1 60%,#a855f7)}
@media (max-width:640px){.nkd{left:8px!important;right:8px;top:auto!important;bottom:8px;width:auto;max-height:70%}}
@media (prefers-reduced-motion:reduce){.nkd,.nkd-cab span,.nkd-sec,.nkd-sk{animation:none!important}}`;
    document.head.appendChild(st);
  }

  // ---------- tarjeta ----------
  function cerrar(ya) {
    const c = actual; if (!c) return; actual = null;
    document.removeEventListener('pointerdown', c.fuera, true); document.removeEventListener('keydown', c.tecla, true);
    if (ya || sinReducir()) c.el.remove(); else { c.el.classList.add('sale'); setTimeout(() => c.el.remove(), 210); }
  }
  /* o: { texto, rect (zona de la selección), root (donde se dibuja: sirve en pantalla completa), alBuscar(q), alCopiar(q) } */
  function abrir(o) {
    const q = limpiar(o && o.texto); if (!q || !o.root) return false;
    css(); cerrar(true);
    const el = document.createElement('div'); el.className = 'nkd'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Definición de ' + q);
    el.innerHTML = `<div class="nkd-cab"><span>📖</span><div><small>Diccionario</small><b title="${esc(q)}">${esc(q)}</b></div><button class="nkd-x" type="button" aria-label="Cerrar">✕</button></div>
      <div class="nkd-cuerpo"><div class="nkd-sk"></div></div>
      <div class="nkd-pie"><button class="p" type="button" data-a="buscar">🔍 Buscar en el PDF</button><a href="glosario.html?q=${encodeURIComponent(q)}" target="_blank" rel="noopener">📚 Glosario</a><button type="button" data-a="copiar">📋 Copiar</button></div>`;
    o.root.appendChild(el);
    // se acomoda cerca de lo seleccionado y se vuelve a acomodar cuando el contenido cambia de alto (así nunca se sale de la pantalla)
    const ubicar = () => {
      const rr = o.root.getBoundingClientRect(), r = o.rect || { left: rr.left + 40, right: rr.left + 40, top: rr.top + 60, bottom: rr.top + 60 };
      const h = el.offsetHeight, abajo = r.bottom - rr.top + 10, arriba = r.top - rr.top - h - 10;
      el.style.left = Math.max(8, Math.min(rr.width - el.offsetWidth - 8, r.left - rr.left)) + 'px';
      el.style.top = Math.max(8, abajo + h > rr.height - 8 ? (arriba > 8 ? arriba : rr.height - h - 8) : abajo) + 'px';
    };
    ubicar();
    const cuerpo = el.querySelector('.nkd-cuerpo');
    const c = { el, q };
    c.fuera = (e) => { if (!el.contains(e.target)) cerrar(); };
    c.tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cerrar(); } };
    actual = c; setTimeout(() => { if (actual === c) { document.addEventListener('pointerdown', c.fuera, true); document.addEventListener('keydown', c.tecla, true); } }, 0);
    el.querySelector('.nkd-x').onclick = () => cerrar();
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'buscar') { cerrar(); if (o.alBuscar) o.alBuscar(q); }
      else if (b.dataset.a === 'copiar') { try { navigator.clipboard.writeText(q); b.textContent = '✓ Copiado'; } catch (_) {} }
    });

    // se arma de a poco: primero el Glosario (local, instantáneo) y después Wikipedia
    const secciones = { g: '', w: '', cargandoW: true };
    const pintar = () => {
      if (actual !== c) return;
      const nada = !secciones.g && !secciones.w && !secciones.cargandoW;
      cuerpo.innerHTML = (secciones.g || '') + (secciones.cargandoW ? '<div class="nkd-sk"></div>' : secciones.w || '')
        + (nada ? '<p class="nkd-vacio">No encontramos esa palabra en el Glosario ni en Wikipedia. Probá seleccionando solo el término, sin artículos ni signos.</p>' : '')
        + '<p class="nkd-nota">Es una referencia general para entender el término. Confirmalo siempre con la bibliografía de tu materia.</p>';
      ubicar();
    };
    glosario().then((d) => {
      const m = buscarGlosario(q, d && d.G);
      if (m.length) secciones.g = '<div class="nkd-sec"><h6>📚 En el Glosario de NikaMed</h6>' + m.map(({ g }) => `<div class="it"><b>${esc(g.t)}</b><small>${esc(g.s)}</small><p>${esc(resumen(g.b, 260))}</p><a href="glosario.html?q=${encodeURIComponent(g.t)}" target="_blank" rel="noopener">Ver completo en el Glosario →</a></div>`).join('') + '</div>';
      pintar();
    });
    wiki(q).then((w) => {
      secciones.cargandoW = false;
      if (w) secciones.w = `<div class="nkd-sec w"><h6>🌐 Wikipedia</h6><b>${esc(w.titulo)}</b><p>${esc(resumen(w.texto, 520))}</p>${w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">Seguir leyendo en Wikipedia ↗</a>` : ''}</div>`;
      pintar();
    }).catch(() => {
      secciones.cargandoW = false;
      secciones.w = '<p class="nkd-vacio">No pudimos consultar Wikipedia ahora (¿sin conexión?). Igual podés buscar la palabra en el PDF o en el Glosario.</p>';
      pintar();
    });
    pintar();
    return true;
  }

  window.NikaDicc = { abrir, cerrar: () => cerrar(true), limpiar, buscarGlosario };
})();
