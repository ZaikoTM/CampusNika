/* NikaDicc — diccionario del Lector NikaMed, explicado por Nika.
   Seleccionás una palabra y aparece el globo de Nika (retrato, etiqueta NIKA, texto que se escribe y barra de segmentos, como el resto del sitio) con su definición:
   · primero el Glosario de NikaMed (mnemotecnias, escalas, siglas y conceptos propios: js/glosarioData.js);
   · después Wikipedia en español (resumen del artículo, gratis y sin cuenta), con el enlace para seguir leyendo.
   Botones: buscar la palabra en el PDF, minimizar, cerrar, abrir el Glosario, ver Wikipedia y copiar.
   Es una referencia general: Nika avisa que se confirme siempre con la bibliografía de la materia. */
(function () {
  'use strict';
  if (window.NikaDicc) return;

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const stem = (w) => (w.length > 4 ? w.replace(/(es|s)$/, '') : w);   // plurales simples: hemorragias → hemorragia
  const sinMov = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let actual = null;   // globo abierto

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
    const corte = res.length && res[0].sc >= 70 ? 70 : 50;   // con una coincidencia clara por título no se suman las que solo comparten una palabra clave
    return res.filter((x) => x.sc >= corte).slice(0, 3);
  }
  const resumen = (html, n) => { const t = String(html || '').replace(/<[^>]+>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t; };

  // ---------- Wikipedia (es) ----------
  async function wiki(q) {
    const clave = 'nikaDicc:' + norm(q);
    try { const c = sessionStorage.getItem(clave); if (c && c !== 'null') return JSON.parse(c); } catch (_) {}
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 7000), base = 'https://es.wikipedia.org';
    try {
      const sum = async (titulo) => { const r = await fetch(base + '/api/rest_v1/page/summary/' + encodeURIComponent(String(titulo).replace(/ /g, '_')) + '?redirect=true', { signal: ctl.signal }); return r.ok ? r.json() : null; };
      const ok = (d) => d && d.extract && d.type !== 'disambiguation';
      const buscar = async (t, texto) => {
        let r = await fetch(base + '/w/api.php?action=opensearch&search=' + encodeURIComponent(t) + '&limit=3&namespace=0&format=json&origin=*', { signal: ctl.signal });
        let j = await r.json(), tt = j && j[1] && j[1][0];
        if (!tt && texto) {   // busqueda en el texto de los articulos (encuentra frases dentro de otros temas)
          r = await fetch(base + '/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(t) + '&srlimit=1&srnamespace=0&format=json&origin=*', { signal: ctl.signal });
          j = await r.json(); tt = j && j.query && j.query.search && j.query.search[0] && j.query.search[0].title;
        }
        return tt ? sum(tt) : null;
      };
      let d = await sum(q);
      if (!ok(d)) d = await buscar(q, false);
      if (!ok(d)) {   // frase sin articulo propio: se prueba con las palabras importantes, de la mas larga a la mas corta
        const ps = q.split(/\s+/).filter((w) => w.length >= 5).sort((a, b) => b.length - a.length).slice(0, 3);
        for (const w of ps) { d = await sum(w); if (!ok(d)) d = await buscar(w, false); if (ok(d)) break; }
      }
      if (!ok(d)) d = await buscar(q, true);
      let out = null;
      if (ok(d)) out = { titulo: d.title, texto: d.extract, url: d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page };
      if (out) { try { sessionStorage.setItem(clave, JSON.stringify(out)); } catch (_) {} }
      return out;
    } finally { clearTimeout(tm); }
  }

  // texto largo del articulo para leerlo dentro del lector (Wikipedia no se puede incrustar: no deja abrirse en un marco)
  async function wikiLargo(titulo) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch('https://es.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=4000&redirects=1&format=json&origin=*&titles=' + encodeURIComponent(titulo), { signal: ctl.signal });
      const j = await r.json(), pg = j && j.query && j.query.pages, p = pg && pg[Object.keys(pg)[0]];
      return (p && p.extract) || '';
    } finally { clearTimeout(tm); }
  }

  // ---------- estilos (los mismos colores del globo de Nika en claro, oscuro y premium) ----------
  function css() {
    if (document.getElementById('nkd-css')) return;
    const st = document.createElement('style'); st.id = 'nkd-css';
    st.textContent = `
.nkd{--bg:#ffffff;--bd:#7dd3fc;--sh:rgba(15,23,42,.22);--halo:rgba(56,189,248,.16);--tx:#0f172a;--fbg:#e0f2fe;--hd:#ffffff;--hdb:#94a3b8;--vz:#0c2140;--eye:#22d3ee;--chip:#0284c7;--chipt:#fff;--hl:#0369a1;--seg:#e0f2fe;--on:#22c55e;--onglow:rgba(34,197,94,.4);--mu:#64748b;--sec:#f0f9ff;--secb:#bae6fd;
  position:absolute;z-index:80;width:min(420px,calc(100% - 16px));max-height:min(540px,calc(100% - 16px));display:flex;flex-direction:column;margin-top:12px;border-radius:16px;background:var(--bg);border:1.5px solid var(--bd);color:var(--tx);
  box-shadow:0 12px 34px var(--sh),0 0 0 4px var(--halo);font-family:"Plus Jakarta Sans",system-ui,sans-serif;transform-origin:20% 0;animation:nkdIn .45s cubic-bezier(.34,1.56,.64,1) both}
body.dark-mode .nkd{--bg:rgba(15,28,52,.96);--bd:rgba(56,189,248,.55);--sh:rgba(0,0,0,.55);--halo:rgba(56,189,248,.1);--tx:#e2e8f0;--fbg:#0b1a33;--hd:#eef2f7;--vz:#0c2140;--eye:#35e0f7;--chip:#38bdf8;--chipt:#06223a;--hl:#7dd3fc;--seg:rgba(148,163,184,.22);--on:#34d399;--onglow:rgba(52,211,153,.5);--mu:#94a3b8;--sec:rgba(255,255,255,.05);--secb:rgba(56,189,248,.28)}
body.tema-premium .nkd{--bg:rgba(24,12,56,.96);--bd:rgba(192,132,252,.6);--sh:rgba(76,29,149,.65);--halo:rgba(168,85,247,.16);--tx:#f8fafc;--fbg:#1a0e3d;--hd:#f1ecff;--hdb:#a78bfa;--vz:#1e1245;--eye:#c4b5fd;--chip:#a855f7;--chipt:#fff;--hl:#d8b4fe;--seg:rgba(168,85,247,.22);--on:#c084fc;--onglow:rgba(192,132,252,.6);--mu:#a5b4d0;--sec:rgba(168,85,247,.1);--secb:rgba(192,132,252,.3)}
.nkd.sale{animation:nkdOut .24s ease-in both}
@keyframes nkdIn{from{opacity:0;transform:translateY(14px) scale(.85)}to{opacity:1;transform:none}}@keyframes nkdOut{to{opacity:0;transform:translateY(10px) scale(.92)}}
.nkd-nm{position:absolute;left:14px;top:-11px;z-index:2;background:var(--chip);color:var(--chipt);font:500 12px 'Pixelify Sans',monospace;letter-spacing:.5px;padding:1px 9px;border-radius:6px;box-shadow:0 3px 8px var(--sh)}
.nkd-bt{position:absolute;top:7px;right:8px;z-index:3;display:flex;gap:2px}
.nkd-b{position:relative;width:26px;height:26px;border:0;border-radius:50%;background:transparent;color:var(--mu);cursor:pointer;display:grid;place-items:center;font:inherit;font-size:.82rem;line-height:1;padding:0;transition:background .2s,color .2s,transform .25s cubic-bezier(.34,1.56,.64,1)}
.nkd-b svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.nkd-b:hover,.nkd-b:focus-visible{background:var(--seg);color:var(--tx);outline:none}.nkd-b:active{transform:scale(.88)}
.nkd-b[data-a=buscar]:hover svg{transform:rotate(-14deg) scale(1.18)}.nkd-b[data-a=x]:hover{transform:rotate(90deg)}.nkd-b[data-a=min]:hover .ic{transform:translateY(2px)}
.nkd-b .ic{display:block;font-weight:800;transition:transform .25s}.nkd.min .nkd-b[data-a=min] .ic{transform:rotate(180deg)}
.nkd-in{display:flex;gap:14px;padding:18px 14px 6px;align-items:flex-start;cursor:default}
.nkd-fc{flex:none;width:60px;height:60px;border-radius:14px;background:var(--fbg);border:1.5px solid var(--bd);position:relative;overflow:hidden;transition:width .3s,height .3s,transform .3s}
.nkd-hd{position:absolute;left:7px;top:9px;width:44px;height:32px;border-radius:13px;background:var(--hd);border:1.5px solid var(--hdb);transition:transform .3s}
.nkd-vz{position:absolute;left:4px;top:4px;width:32px;height:19px;border-radius:9px;background:var(--vz)}
.nkd-o{position:absolute;top:9px;width:7px;height:8px;border-radius:3px 3px 1px 1px;background:var(--eye);box-shadow:0 0 6px var(--eye);transform-origin:50% 100%;animation:nkdParp 4s infinite}
.nkd-o1{left:9px}.nkd-o2{left:21px}
.nkd-bd{position:absolute;left:15px;top:43px;width:28px;height:14px;border-radius:8px 8px 0 0;background:var(--hd);border:1.5px solid var(--hdb);border-bottom:0}
.nkd-fc.fel .nkd-o{height:4px;top:12px;animation:none;border-radius:6px 6px 0 0}
.nkd-fc.hab .nkd-hd{animation:nkdHab .34s ease-in-out infinite}.nkd-fc.hab .nkd-o{animation:nkdMira .6s ease-in-out infinite}
@keyframes nkdParp{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}@keyframes nkdHab{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes nkdMira{0%,100%{transform:translateX(0)}50%{transform:translateX(1.5px)}}
.nkd-c{flex:1;min-width:0}
.nkd-pal{padding-right:84px}.nkd-pal small{display:block;font:500 11px 'Pixelify Sans',monospace;letter-spacing:.8px;color:var(--mu)}.nkd-pal b{display:block;font-size:1.05rem;font-weight:800;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nkd-col{display:grid;grid-template-rows:1fr;transition:grid-template-rows .32s cubic-bezier(.22,1,.36,1)}.nkd-col>div{overflow:hidden;min-height:0}
.nkd.min .nkd-col{grid-template-rows:0fr}.nkd.min{max-height:none}.nkd.min .nkd-in{padding-bottom:12px;align-items:center}.nkd.min .nkd-pal{padding-right:84px}.nkd.min .nkd-fc{width:44px;height:44px}.nkd.min .nkd-fc .nkd-hd{transform:scale(.72) translate(-4px,-3px)}
.nkd-tx{padding:4px 0 4px;font-size:14px;line-height:1.55;font-weight:500;min-height:3.4em}
.nkd-tx b{font-weight:800;color:var(--hl)}
.nkd-hp{display:flex;align-items:center;gap:9px;padding:2px 16px 8px 14px}
.nkd-lb{font:500 12px 'Pixelify Sans',monospace;background:var(--chip);color:var(--chipt);border-radius:6px;padding:1px 7px;transition:background .3s}
.nkd-tr{flex:1;display:flex;gap:3px;height:12px}.nkd-tr s{flex:1;border-radius:3px;background:var(--seg);text-decoration:none;transition:background .15s,box-shadow .15s}.nkd-tr s.on{background:var(--on);box-shadow:0 0 8px var(--onglow)}
.nkd-pc{font:500 14px 'Pixelify Sans',monospace;min-width:38px;text-align:right}
.nkd-hp.listo .nkd-lb{background:var(--on);color:#06241a}
.nkd-cuerpo{overflow:auto;padding:2px 14px 8px;display:flex;flex-direction:column;gap:9px;max-height:230px}
.nkd-sec{padding:10px 12px;border-radius:12px;background:var(--sec);border:1px solid var(--secb);animation:nkdSec .45s cubic-bezier(.22,1,.36,1) both}
@keyframes nkdSec{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.nkd-sec h6{margin:0 0 6px;font:500 12px 'Pixelify Sans',monospace;letter-spacing:.6px;color:var(--hl)}
.nkd-sec b{display:block;font-size:.88rem;font-weight:800}.nkd-sec small{display:block;margin:1px 0 4px;color:var(--mu);font-size:.72rem;font-weight:700}
.nkd-sec p{margin:0;font-size:.8rem;line-height:1.5;font-weight:500}.nkd-sec a{display:inline-block;margin-top:6px;font-size:.74rem;font-weight:800;color:var(--hl);text-decoration:none;transition:transform .15s}.nkd-sec a:hover{text-decoration:underline;transform:translateX(2px)}
.nkd-sec .it+.it{margin-top:9px;padding-top:9px;border-top:1px solid var(--secb)}
.nkd-mas{margin-top:6px;border:0;background:transparent;color:var(--hl);font:inherit;font-size:.74rem;font-weight:800;cursor:pointer;padding:2px 0;transition:transform .15s}.nkd-mas:hover{transform:translateX(2px);text-decoration:underline}
.nkd-sec p.largo{white-space:pre-line;max-height:260px;overflow:auto}
.nkd-in{cursor:grab;touch-action:none}.nkd.mov .nkd-in{cursor:grabbing}.nkd.mov{transition:none}
.nkd-rz{position:absolute;right:2px;bottom:2px;width:18px;height:18px;cursor:nwse-resize;z-index:4;opacity:.55;touch-action:none;transition:opacity .2s}.nkd-rz:hover{opacity:1}
.nkd-rz::after{content:'';position:absolute;right:4px;bottom:4px;width:9px;height:9px;border-right:2px solid var(--mu);border-bottom:2px solid var(--mu);border-radius:0 0 3px 0}
.nkd.min .nkd-rz{display:none}
.nkd-ped{display:flex;gap:6px;margin-top:4px}.nkd-ped input{flex:1;min-width:0;border:1.5px solid var(--bd);background:var(--fbg);color:var(--tx);border-radius:10px;padding:8px 10px;font:inherit;font-size:.85rem}.nkd-ped button{border:0;background:var(--chip);color:var(--chipt);border-radius:10px;padding:0 12px;font:inherit;font-weight:800;cursor:pointer}
.nkd-nota{margin:0;font-size:.66rem;line-height:1.4;color:var(--mu);font-weight:600}
.nkd-pie{display:flex;gap:6px;padding:8px 12px 12px;flex-wrap:wrap}
.nkd-pie>a,.nkd-pie>button{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1.5px solid var(--bd);background:transparent;color:var(--tx);border-radius:10px;padding:7px 10px;font:inherit;font-weight:800;font-size:.74rem;cursor:pointer;text-decoration:none;transition:background .18s,transform .15s,box-shadow .18s}
.nkd-pie>a:hover,.nkd-pie>button:hover{background:var(--seg);transform:translateY(-2px);box-shadow:0 6px 14px var(--sh)}.nkd-pie>a:active,.nkd-pie>button:active{transform:scale(.95)}
.nkd-pie .p{border:0;color:var(--chipt);background:var(--chip)}
.nkd-sk{height:54px;border-radius:12px;background:linear-gradient(90deg,var(--seg) 20%,var(--secb) 50%,var(--seg) 80%);background-size:220% 100%;animation:nkdSk 1.2s linear infinite}@keyframes nkdSk{to{background-position:-220% 0}}
.nkd-pt::after{content:'';display:inline-block;width:1.2em;text-align:left;animation:nkdPt 1.2s steps(4) infinite}@keyframes nkdPt{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}}
@media (max-width:640px){.nkd{left:8px!important;right:8px;top:auto!important;bottom:8px;width:auto;margin-top:0}}
@media (prefers-reduced-motion:reduce){.nkd,.nkd *{animation:none!important;transition:none!important}}`;
    document.head.appendChild(st);
  }

  // ---------- globo ----------
  function cerrar(ya) {
    const c = actual; if (!c) return; actual = null; clearInterval(c.ty); clearInterval(c.pg);
    document.removeEventListener('pointerdown', c.fuera, true); document.removeEventListener('keydown', c.tecla, true);
    if (ya || sinMov()) c.el.remove(); else { c.el.classList.add('sale'); setTimeout(() => c.el.remove(), 260); }
  }
  /* o: { texto, rect (zona de la selección), root (donde se dibuja: sirve en pantalla completa), alBuscar(q) } */
  function abrir(o) {
    const q = limpiar(o && o.texto); if (!q || !o.root) return false;
    css(); cerrar(true);
    const el = document.createElement('div'); el.className = 'nkd'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Nika te explica «' + q + '»');
    el.innerHTML = `<div class="nkd-nm">NIKA</div>
      <div class="nkd-bt">
        <button type="button" class="nkd-b" data-a="buscar" title="Buscar «${esc(q)}» en todo el PDF" aria-label="Buscar en el PDF"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg></button>
        <button type="button" class="nkd-b" data-a="min" title="Minimizar" aria-label="Minimizar"><span class="ic">⌄</span></button>
        <button type="button" class="nkd-b" data-a="x" title="Cerrar (Esc)" aria-label="Cerrar">✕</button>
      </div>
      <div class="nkd-rz" title="Cambiar el tamaño" aria-hidden="true"></div>
      <div class="nkd-in"><div class="nkd-fc hab"><div class="nkd-hd"><i class="nkd-vz"></i><i class="nkd-o nkd-o1"></i><i class="nkd-o nkd-o2"></i></div><i class="nkd-bd"></i></div>
        <div class="nkd-c"><div class="nkd-pal"><small>DICCIONARIO</small><b title="${esc(q)}">${esc(q)}</b></div>
          <div class="nkd-col"><div><div class="nkd-tx" aria-live="polite"></div></div></div></div></div>
      <div class="nkd-col"><div>
        <div class="nkd-hp"><span class="nkd-lb">BUSCANDO</span><div class="nkd-tr">${'<s></s>'.repeat(20)}</div><span class="nkd-pc">0%</span></div>
        <div class="nkd-cuerpo"></div>
        <div class="nkd-pie"><button type="button" data-a="glo">📚 Glosario</button><button type="button" class="wk" data-a="wik" hidden>🌐 Wikipedia</button><button type="button" data-a="copiar">📋 Copiar todo</button>${o.alNota ? '<button type="button" data-a="nota" class="p">📒 A nota</button>' : ''}</div>
      </div></div>`;
    o.root.appendChild(el);
    const $ = (s) => el.querySelector(s), tx = $('.nkd-tx'), cara = $('.nkd-fc'), cuerpo = $('.nkd-cuerpo'), hp = $('.nkd-hp'), segs = el.querySelectorAll('.nkd-tr s'), pc = $('.nkd-pc'), lb = $('.nkd-lb');
    const c = { el, q, ty: null, pg: null };
    // todo lo que Nika muestra, como texto para copiar o guardar en una nota
    const todo = () => {
      const p = [q];
      if (c.gl && c.gl[0]) p.push('Glosario de NikaMed · ' + c.gl[0].g.t + ' (' + c.gl[0].g.s + '): ' + resumen(c.gl[0].g.b, 900));
      if (c.wc) p.push('Wikipedia: ' + (c.wl || c.wc));
      if (p.length === 1) p.push('(sin definicion encontrada)');
      return p.join('\n\n');
    };
    // mover (arrastrando el encabezado) y cambiar el tamaño (manija de la esquina); se recuerda para la proxima vez
    const guardarPos = () => { try { localStorage.setItem('nika_dicc_pos', JSON.stringify({ l: parseFloat(el.style.left), t: parseFloat(el.style.top), w: el.offsetWidth, h: parseFloat(el.style.maxHeight) || 0 })); } catch (_) {} };
    const libre = () => {
      if (!el.dataset.libre) {
        const rr = o.root.getBoundingClientRect(), r = el.getBoundingClientRect();
        el.style.right = 'auto'; el.style.left = (r.left - rr.left) + 'px'; el.style.top = (r.top - rr.top) + 'px'; el.dataset.libre = '1';
      }
    };
    const arrastrar = (ev, alMover) => {
      ev.preventDefault(); libre();
      const x0 = ev.clientX, y0 = ev.clientY, l0 = parseFloat(el.style.left), t0 = parseFloat(el.style.top), w0 = el.offsetWidth, h0 = el.offsetHeight, rr = o.root.getBoundingClientRect();
      const mv = (e) => alMover(e.clientX - x0, e.clientY - y0, { l0, t0, w0, h0, rr });
      const fin = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin); el.classList.remove('mov'); guardarPos(); };
      el.classList.add('mov'); window.addEventListener('pointermove', mv); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    };
    el.querySelector('.nkd-in').addEventListener('pointerdown', (e) => {
      if (window.innerWidth <= 640 || e.button || e.target.closest('button,a,input')) return;
      arrastrar(e, (dx, dy, k) => {
        el.style.left = Math.max(4, Math.min(k.rr.width - 60, k.l0 + dx)) + 'px';
        el.style.top = Math.max(4, Math.min(k.rr.height - 40, k.t0 + dy)) + 'px';
      });
    });
    el.querySelector('.nkd-rz').addEventListener('pointerdown', (e) => {
      if (window.innerWidth <= 640 || e.button) return;
      arrastrar(e, (dx, dy, k) => {
        el.style.width = Math.max(260, Math.min(k.rr.width - 16, k.w0 + dx)) + 'px';
        el.style.maxHeight = Math.max(150, Math.min(k.rr.height - 16, k.h0 + dy)) + 'px';
        const cu = el.querySelector('.nkd-cuerpo'); if (cu) cu.style.maxHeight = Math.max(60, Math.min(k.rr.height - 260, k.h0 + dy - 210)) + 'px';
      });
    });
    try {
      const g = window.innerWidth > 640 && JSON.parse(localStorage.getItem('nika_dicc_pos') || 'null');
      if (g && isFinite(g.l) && isFinite(g.t)) {
        const rr = o.root.getBoundingClientRect();
        el.dataset.libre = '1'; el.style.right = 'auto';
        if (g.w) el.style.width = Math.min(g.w, rr.width - 16) + 'px';
        if (g.h) { el.style.maxHeight = Math.min(g.h, rr.height - 16) + 'px'; const cu = el.querySelector('.nkd-cuerpo'); if (cu) cu.style.maxHeight = Math.max(60, g.h - 210) + 'px'; }
        el.style.left = Math.max(4, Math.min(rr.width - 120, g.l)) + 'px'; el.style.top = Math.max(4, Math.min(rr.height - 60, g.t)) + 'px';
      }
    } catch (_) {}
    // se acomoda cerca de lo seleccionado y se vuelve a acomodar cuando el contenido cambia de alto (así nunca se sale de la pantalla)
    const ubicar = () => {
      if (window.innerWidth <= 640) return;
      if (el.dataset.libre) return;
      // siempre arriba a la derecha del area de lectura (debajo del buscador si esta abierto), para no tapar lo que se esta leyendo
      const rr = o.root.getBoundingClientRect(), sc = o.root.querySelector('.nkpdf-scroll') || o.root, sr = sc.getBoundingClientRect();
      let top = sr.top - rr.top + 14; const bus = o.root.querySelector('.nkx-busca.on');
      if (bus) top = Math.max(top, bus.getBoundingClientRect().bottom - rr.top + 10);
      el.style.left = 'auto'; el.style.right = Math.max(8, rr.right - sr.right + 22) + 'px'; el.style.top = top + 'px';
    };
    ubicar();
    c.fuera = (e) => { if (!el.contains(e.target) && !el.classList.contains('min')) cerrar(); };
    c.tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cerrar(); } };
    actual = c; setTimeout(() => { if (actual === c) { document.addEventListener('pointerdown', c.fuera, true); document.addEventListener('keydown', c.tecla, true); } }, 0);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'x') cerrar();
      else if (a === 'buscar') { cerrar(); if (o.alBuscar) o.alBuscar(q); }
      else if (a === 'min') { const m = el.classList.toggle('min'); b.title = m ? 'Expandir' : 'Minimizar'; setTimeout(ubicar, 340); }
      else if (a === 'copiar') { try { navigator.clipboard.writeText(todo()); b.textContent = '✓ Copiado'; setTimeout(() => { b.textContent = '📋 Copiar todo'; }, 1800); } catch (_) {} }
      else if (a === 'nota') {
        b.disabled = true; b.textContent = 'Guardando…';
        Promise.resolve(o.alNota(q, todo())).then(() => { b.textContent = '✓ En tus notas'; }, () => { b.disabled = false; b.textContent = '📒 A nota'; });
      }
      else if (a === 'glo' || a === 'wik') {
        const s = el.querySelector(a === 'glo' ? '.nkd-sec.g' : '.nkd-sec.w');
        if (!s) { tx.innerHTML = 'No hay entrada del Glosario para <b>' + esc(q) + '</b>. Probá seleccionando solo el término.'; return; }
        s.scrollIntoView({ block: 'nearest', behavior: sinMov() ? 'auto' : 'smooth' });
        const m = s.querySelector('.nkd-mas'); if (m && m.dataset.abierto !== '1') m.click();
      }
      else if (a === 'mas-g') {
        const i = +b.dataset.i, p = b.parentNode.querySelector('p'), g = c.gl[i].g, ab = b.dataset.abierto === '1';
        if (ab) p.textContent = resumen(g.b, 260); else p.innerHTML = g.b;
        b.dataset.abierto = ab ? '0' : '1'; b.textContent = ab ? 'Ver completo ▾' : 'Ver menos ▴'; p.classList.toggle('largo', !ab); ubicar();
      }
      else if (a === 'mas-w') {
        const p = b.parentNode.querySelector('p'), ab = b.dataset.abierto === '1';
        if (ab) { p.textContent = c.wc; p.classList.remove('largo'); b.dataset.abierto = '0'; b.textContent = 'Seguir leyendo ▾'; ubicar(); return; }
        b.textContent = 'Cargando…';
        (c.wl ? Promise.resolve(c.wl) : wikiLargo(b.dataset.t).then((t) => (c.wl = t))).then((t) => {
          if (actual !== c) return;
          if (t) { p.textContent = t; p.classList.add('largo'); }
          b.dataset.abierto = '1'; b.textContent = 'Ver menos ▴'; ubicar();
        }, () => { b.textContent = 'No se pudo cargar'; });
      }
    });

    // barra de segmentos: avanza sola mientras Nika busca y se completa cuando termina
    let pct = 0; const llenar = (p) => { const n = Math.round(Math.min(100, p) / 5); segs.forEach((s, i) => s.classList.toggle('on', i < n)); pc.textContent = Math.round(Math.min(100, p)) + '%'; };
    c.pg = setInterval(() => { pct += (82 - pct) * 0.07; llenar(pct); }, 110);
    const terminar = () => { clearInterval(c.pg); llenar(100); lb.textContent = 'LISTO'; hp.classList.add('listo'); setTimeout(() => { if (actual === c) { hp.style.display = 'none'; ubicar(); } }, 1400); };

    // Nika escribe el texto de a poco (un clic lo completa); mientras escribe mueve la cabeza
    const escribir = (html) => {
      clearInterval(c.ty); const plano = html.replace(/<[^>]+>/g, '').length;
      const fin = () => { clearInterval(c.ty); tx.innerHTML = html; cara.classList.remove('hab'); ubicar(); };
      if (sinMov()) { fin(); return; }
      cara.classList.add('hab'); const tk = html.match(/<[^>]+>|[^<]/g) || []; let i = 0, buf = '', n = 0;
      c.ty = setInterval(() => {
        let k = 0; while (i < tk.length && k < 2) { buf += tk[i]; if (!/^</.test(tk[i])) { k++; n++; } i++; }
        tx.innerHTML = buf + ((buf.match(/<b>/g) || []).length > (buf.match(/<\/b>/g) || []).length ? '</b>' : '');
        if (n >= plano || i >= tk.length) fin();
      }, 14);
      tx.onclick = fin;
    };

    tx.innerHTML = 'Dejame buscar <b>' + esc(q) + '</b><span class="nkd-pt"></span>';
    const sec = (cls, h, inner) => { const d = document.createElement('div'); d.className = 'nkd-sec ' + cls; d.innerHTML = '<h6>' + h + '</h6>' + inner; return d; };
    const sk = document.createElement('div'); sk.className = 'nkd-sk'; cuerpo.appendChild(sk);
    const nota = '<p class="nkd-nota">Es una referencia general para entender el término. Confirmalo siempre con la bibliografía de tu materia.</p>';
    const wP = wiki(q).then((w) => ({ w }), () => ({ error: true }));
    glosario().then((d) => buscarGlosario(q, d && d.G)).then((m) => {
      if (actual !== c) return;
      if (m.length) {
        cara.classList.add('fel');
        escribir('Esto dice el Glosario de NikaMed sobre <b>' + esc(m[0].g.t) + '</b> (' + esc(m[0].g.s) + '): ' + esc(resumen(m[0].g.b, 230)));
        cuerpo.insertBefore(sec('g', '▸ EN EL GLOSARIO', m.map(({ g }) => `<div class="it"><b>${esc(g.t)}</b><small>${esc(g.s)}</small><p>${esc(resumen(g.b, 260))}</p><button type="button" class="nkd-mas" data-a="mas-g" data-i="${m.findIndex((x) => x.g === g)}">Ver completo ▾</button></div>`).join('')), sk);
        c.gl = m;
        ubicar();
      }
      return wP.then((r) => {
        if (actual !== c) return;
        sk.remove(); terminar();
        const w = r.w;
        if (w) {
          const wk = $('.wk'); if (wk) wk.hidden = false;
          cara.classList.add('fel');
          if (!m.length) escribir('Encontré esto en Wikipedia sobre <b>' + esc(w.titulo) + '</b>: ' + esc(resumen(w.texto, 300)));
          cuerpo.appendChild(sec('w', '▸ WIKIPEDIA', `<b>${esc(w.titulo)}</b><p>${esc(resumen(w.texto, 520))}</p><button type="button" class="nkd-mas" data-a="mas-w" data-t="${esc(w.titulo)}">Seguir leyendo ▾</button>`));
          c.wc = resumen(w.texto, 520);
        } else if (!m.length) {
          escribir(r.error ? 'No pude consultar Wikipedia ahora (¿sin conexión?). Igual podés buscar <b>' + esc(q) + '</b> en el PDF.' : 'No encontré <b>' + esc(q) + '</b> en el Glosario ni en Wikipedia. Probá seleccionando solo el término, sin artículos ni signos.');
        }
        const n = document.createElement('div'); n.innerHTML = nota; cuerpo.appendChild(n.firstChild);
        ubicar();
      });
    });
    return true;
  }

  // sin palabra elegida (boton de la barra): globo con una casilla para escribirla
  function pedir(o) {
    css(); cerrar(true);
    const el = document.createElement('div'); el.className = 'nkd'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Diccionario de Nika');
    el.innerHTML = `<div class="nkd-nm">NIKA</div><div class="nkd-bt"><button type="button" class="nkd-b" data-a="x" title="Cerrar (Esc)" aria-label="Cerrar">✕</button></div>
      <div class="nkd-in" style="cursor:default"><div class="nkd-fc"><div class="nkd-hd"><i class="nkd-vz"></i><i class="nkd-o nkd-o1"></i><i class="nkd-o nkd-o2"></i></div><i class="nkd-bd"></i></div>
        <div class="nkd-c"><div class="nkd-pal"><small>DICCIONARIO</small><b>¿Qué palabra buscamos?</b></div>
          <form class="nkd-ped"><input type="text" maxlength="80" placeholder="Escribí un término…" aria-label="Palabra a definir" autocomplete="off"><button type="submit">Definir</button></form></div></div>`;
    o.root.appendChild(el);
    const sc = o.root.querySelector('.nkpdf-scroll') || o.root, rr = o.root.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    el.style.left = 'auto'; el.style.right = Math.max(8, rr.right - sr.right + 22) + 'px'; el.style.top = (sr.top - rr.top + 14) + 'px';
    const inp = el.querySelector('input'); setTimeout(() => inp.focus(), 60);
    el.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const v = limpiar(inp.value); if (v) abrir(Object.assign({}, o, { texto: v })); });
    el.querySelector('[data-a=x]').addEventListener('click', () => cerrar());
    const c = { el, ty: null, pg: null };
    c.tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cerrar(); } };
    document.addEventListener('keydown', c.tecla, true); actual = c;
    return true;
  }

  window.NikaDicc = { abrir, pedir, cerrar: () => cerrar(true), limpiar, buscarGlosario };
})();
