/* CAMPUS NIKA · Exportar el PDF del Lector Nika con tus marcas (js/estudio/pdfLector.js)
   Genera un PDF nuevo en tu dispositivo (con pdf-lib): el archivo original no se toca y no se sube nada.
   · Subrayados, subrayado/tachado, pincel, formas y sellos se dibujan sobre cada página (los subrayados con mezcla «multiplicar»,
     así el texto sigue leyéndose igual que en el lector).
   · Los textos sobre el PDF se dibujan como cajitas de color y los marcadores 📌 quedan como notas adhesivas reales del PDF.
   · Marca de agua NikaMed: el logo (assets/n-nika.svg + assets/nika-texto.svg, rasterizado en alta resolución) con opacidad baja, en el
     primer rincón de la página que no tape nada de texto.
   Uso: NikaPdfExport.abrir(mi) */
(function () {
  'use strict';
  if (window.NikaPdfExport) return;

  const PDFLIB = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NOTA_BG = { amarillo: '#fde68a', rosa: '#fbcfe8', celeste: '#bae6fd', verde: '#bbf7d0', naranja: '#fed7aa', lila: '#ddd6fe' };
  const PIN_COL = { amarillo: '#f59e0b', rosa: '#ec4899', celeste: '#0ea5e9', verde: '#22c55e', naranja: '#f97316', lila: '#8b5cf6' };
  const OPACIDAD_MARCA = 0.3;   // suave, como en los recetarios y las flashcards

  function css() {
    if (document.getElementById('nkxp-css')) return;
    const st = document.createElement('style'); st.id = 'nkxp-css';
    st.textContent = `
.nkxp{position:absolute;inset:0;z-index:60;background:rgba(2,6,23,.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:14px;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkxp>div{width:min(440px,100%);max-height:100%;overflow:auto;background:#0f172a;color:#f1f5f9;border:1px solid #334155;border-radius:20px;padding:20px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.nkxp h3{margin:0 0 6px;font-size:1.05rem;font-weight:800}.nkxp p{margin:0 0 12px;color:#94a3b8;font-size:.8rem;line-height:1.5}
.nkxp fieldset{border:1px solid #334155;border-radius:12px;margin:0 0 10px;padding:8px 12px 10px}.nkxp legend{font-size:.72rem;font-weight:800;color:#c4b5fd;padding:0 6px}
.nkxp label{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.82rem;font-weight:600;cursor:pointer}
.nkxp input[type=radio],.nkxp input[type=checkbox]{accent-color:#a855f7;width:16px;height:16px}
.nkxp input[type=number]{width:64px;background:#16223a;color:#fff;border:1px solid #334155;border-radius:8px;padding:4px 6px;font:700 .8rem inherit}
.nkxp .f{display:flex;gap:8px;margin-top:14px}.nkxp .f button{flex:1;border:0;border-radius:12px;padding:11px;font:800 .84rem inherit;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1)}
.nkxp .f button.sec{background:#1e293b;color:#e2e8f0}.nkxp .f button:disabled{opacity:.6;cursor:default}
.nkxp .pb{height:7px;border-radius:7px;background:#1e293b;overflow:hidden;margin-top:12px;display:none}.nkxp .pb i{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a855f7);transition:width .2s}
.nkxp .st{margin-top:8px;font-size:.76rem;color:#94a3b8;min-height:1.2em}
`;
    document.head.appendChild(st);
  }

  async function cargarPdfLib() {
    if (window.PDFLib) return;
    const poner = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    try { await poner(PDFLIB); }
    catch (_) {
      const u = window.NikaPdfOffline && await window.NikaPdfOffline.libUrl('pdf-lib.min.js');
      if (!u) throw new Error('No se pudo cargar el generador de PDF. Probá con conexión.');
      await poner(u);
    }
    if (window.NikaPdfOffline) window.NikaPdfOffline.asegurarLibs();
  }

  // ------------------------------------------------------------------ marca de agua: el SVG de NikaMed rasterizado en alta resolución
  async function textoSvg(url) {
    try { const r = await fetch(url); if (r.ok) return await r.text(); } catch (_) {}
    try { const c = await caches.open('pdf-offline'); const r = await c.match(location.origin + '/' + url); if (r) return await r.text(); } catch (_) {}
    throw new Error('No se pudo leer el logo de NikaMed.');
  }
  const cargarImg = (svg) => new Promise((ok, no) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const im = new Image(); im.onload = () => { ok(im); setTimeout(() => URL.revokeObjectURL(url), 2000); }; im.onerror = () => { URL.revokeObjectURL(url); no(new Error('logo')); }; im.src = url;
  });
  // Devuelve { png: Uint8Array, rel: ancho/alto }. Se dibuja la N y el nombre uno al lado del otro sobre fondo transparente.
  async function marcaPng() {
    const [sN, sT] = await Promise.all([textoSvg('assets/n-nika.svg'), textoSvg('assets/nika-texto.svg')]);
    const [iN, iT] = await Promise.all([cargarImg(sN), cargarImg(sT)]);
    const PX = 16;                          // píxeles por punto del PDF: nítido incluso con zoom
    const hN = 18 * PX, hT = 11.5 * PX, wT = hT * (638 / 134), gap = 5 * PX;
    const cv = document.createElement('canvas'); cv.width = Math.round(hN + gap + wT); cv.height = Math.round(hN);
    const cx = cv.getContext('2d');
    cx.drawImage(iN, 0, 0, hN, hN);
    cx.drawImage(iT, hN + gap, (hN - hT) / 2, wT, hT);
    const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
    return { png: new Uint8Array(await blob.arrayBuffer()), rel: cv.width / cv.height, h: 18 };
  }

  // Rincón de la página donde la marca no pisa ningún texto (coordenadas de vista: origen arriba a la izquierda, en puntos)
  function elegirRincon(W, H, bw, bh, cajas, s) {
    const m = 14 * s, cand = [
      [(W - bw) / 2, H - bh - m], [W - bw - 16 * s, H - bh - m], [16 * s, H - bh - m],
      [W - bw - 16 * s, m], [16 * s, m], [(W - bw) / 2, m],
    ];
    const pisa = (c) => cajas.some((b) => c[0] - 4 < b.x + b.w && c[0] + bw + 4 > b.x && c[1] - 4 < b.y + b.h && c[1] + bh + 4 > b.y);
    return cand.find((c) => !pisa(c)) || cand[0];
  }
  async function cajasDeTexto(mi, num, vp) {
    const out = [];
    try {
      const pg = await mi.pdf.getPage(num), tc = await pg.getTextContent();
      const U = window.pdfjsLib.Util;
      tc.items.forEach((it) => {
        if (!it.str || !it.str.trim()) return;
        const m = U.transform(vp.transform, it.transform), h = Math.hypot(m[2], m[3]) || 8, w = (it.width || 0) * vp.scale;
        out.push({ x: m[4], y: m[5] - h, w, h: h * 1.15 });
      });
      try { pg.cleanup(); } catch (_) {}
    } catch (_) {}
    return out;
  }

  // ------------------------------------------------------------------ utilidades de dibujo
  const hexRgb = (h, PL) => { const n = parseInt(String(h).replace('#', ''), 16) || 0; return PL.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
  function limpiar(font, s, cache) {
    let o = '';
    for (const ch of String(s)) {
      if (ch === '\n') { o += '\n'; continue; }
      let v = cache.get(ch);
      if (v === undefined) { try { font.encodeText(ch); v = ch; } catch (_) { v = /\s/.test(ch) ? ' ' : '?'; } cache.set(ch, v); }
      o += v;
    }
    return o;
  }
  function envolver(font, texto, size, ancho) {
    const lin = [];
    texto.split('\n').forEach((par) => {
      let act = '';
      par.split(' ').forEach((p) => {
        const t = act ? act + ' ' + p : p;
        if (font.widthOfTextAtSize(t, size) <= ancho || !act) act = t; else { lin.push(act); act = p; }
      });
      lin.push(act);
    });
    return lin;
  }
  async function glifoPng(g, color, size) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 160;
    const cx = cv.getContext('2d'); cx.font = '800 100px "Plus Jakarta Sans",system-ui,sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = color;
    cx.fillText(g, 80, 84);
    const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
    return new Uint8Array(await blob.arrayBuffer());
  }

  // ------------------------------------------------------------------ generar
  async function generar(mi, op, alAvance) {
    const PL = window.PDFLib, U = window.NikaPdf.util, NP = window.NikaPdfNotas;
    const datos = await mi.pdf.getData();
    const doc = await PL.PDFDocument.load(datos, { ignoreEncryption: true, updateMetadata: false });
    const todas = doc.getPages();
    const nums = op.nums;
    let out = doc;
    if (nums.length !== todas.length) {
      out = await PL.PDFDocument.create();
      const copiadas = await out.copyPages(doc, nums.map((n) => n - 1));
      copiadas.forEach((p) => out.addPage(p));
    }
    const paginas = out.getPages();
    const fuente = await out.embedFont(PL.StandardFonts.Helvetica), cache = new Map();
    const marca = await marcaPng(); const imgMarca = await out.embedPng(marca.png);
    const stats = { marcas: 0, notas: 0, rotadas: 0 };

    for (let i = 0; i < paginas.length; i++) {
      const page = paginas[i], num = nums[i];
      alAvance(i, paginas.length);
      if (page.getRotation().angle % 360 !== 0) { stats.rotadas++; continue; }   // las páginas giradas se dejan sin tocar
      const cb = page.getCropBox(), W = cb.width, H = cb.height;
      const X = (f) => cb.x + f * W, Y = (f) => cb.y + H - f * H;

      if (op.marcas) {
        const mm = mi.marcas.filter((m) => m.pagina === num);
        for (const m of mm) {
          const col = hexRgb(U.colorDe(m.color), PL), hex = U.colorDe(m.color);
          for (const r of (m.rects || [])) {
            try {
              if (r.t === 'p') {
                page.drawSvgPath(U.dTrazo(r.p, W, H), { x: cb.x, y: cb.y + H, borderColor: col, borderWidth: Math.max(1, r.w * W), borderOpacity: 0.55, borderLineCap: PL.LineCapStyle.Round, blendMode: PL.BlendMode.Multiply });
              } else if (r.t === 's') {
                page.drawSvgPath(U.dForma(r, W, H), { x: cb.x, y: cb.y + H, borderColor: col, borderWidth: Math.max(1, r.w * W), borderOpacity: 0.92, borderLineCap: PL.LineCapStyle.Round });
              } else if (r.t === 'g') {
                const png = await out.embedPng(await glifoPng(r.g, hex)), s = Math.max(6, r.s * W * 1.6);
                page.drawImage(png, { x: X(r.x) - s / 2, y: Y(r.y) - s / 2, width: s, height: s });
              } else if (r.e === 'u' || r.e === 't') {
                const yy = r.e === 'u' ? r.y + r.h : r.y + r.h / 2;
                page.drawRectangle({ x: X(r.x), y: Y(yy) - 0.75, width: r.w * W, height: 1.6, color: col, opacity: 0.9 });
              } else {
                page.drawRectangle({ x: X(r.x), y: Y(r.y + r.h), width: r.w * W, height: r.h * H, color: col, opacity: 0.6, blendMode: PL.BlendMode.Multiply });
              }
            } catch (_) {}
          }
          stats.marcas++;
        }
      }

      if (op.notas && mi.anots && NP) {
        for (const a of mi.anots.filter((z) => +z.posicion === num)) {
          let txt = ''; try { txt = (NP.leer(a) || {}).p || ''; } catch (_) {}
          const cn = ['amarillo', 'rosa', 'celeste', 'verde', 'naranja', 'lila'].includes(a.color) ? a.color : 'amarillo';
          const px = (+a.pos_x || 0.1), py = (+a.pos_y || 0.1);
          try {
            if (a.anotacion === 'texto' && txt.trim()) {
              const size = Math.max(5, (+a.tam || 1) * (W / 50)), ancho = Math.max(40, (+a.ancho || 0.28) * W), pad = size * 0.45;
              const lin = envolver(fuente, limpiar(fuente, txt, cache), size, ancho - pad * 2), lh = size * 1.25, alto = lin.length * lh + pad * 2;
              const x0 = Math.min(X(px), cb.x + W - ancho - 2), y0 = Math.max(cb.y + 2, Y(py) - alto);
              page.drawRectangle({ x: x0, y: y0, width: ancho, height: alto, color: hexRgb(NOTA_BG[cn], PL), opacity: 0.93, borderColor: hexRgb(PIN_COL[cn], PL), borderWidth: 0.6, borderOpacity: 0.7 });
              lin.forEach((l, k) => page.drawText(l, { x: x0 + pad, y: y0 + alto - pad - size * 0.9 - k * lh, size, font: fuente, color: PL.rgb(0.12, 0.16, 0.22) }));
              stats.notas++;
            } else if (a.anotacion === 'pin') {
              const r = Math.max(4, W / 110), cx = X(px), cy = Y(py);
              page.drawCircle({ x: cx, y: cy, size: r, color: hexRgb(PIN_COL[cn], PL), borderColor: PL.rgb(1, 1, 1), borderWidth: 1 });
              page.drawCircle({ x: cx, y: cy, size: r * 0.32, color: PL.rgb(1, 1, 1) });
              if (txt.trim()) {   // nota adhesiva real del PDF: al pasar el mouse por el marcador se lee el texto
                const an = out.context.obj({ Type: 'Annot', Subtype: 'Text', Rect: [cx - r, cy - r, cx + r, cy + r], Contents: PL.PDFHexString.fromText(txt), T: PL.PDFHexString.fromText('NikaMed'), Name: 'Comment', F: 4 });
                page.node.addAnnot(out.context.register(an));
              }
              stats.notas++;
            }
          } catch (_) {}
        }
      }

      // marca de agua: tamaño según la página, en un rincón sin texto
      try {
        const pj = await mi.pdf.getPage(num), vp = pj.getViewport({ scale: 1 });
        const cajas = await cajasDeTexto(mi, num, vp);
        const s = Math.min(1.7, Math.max(0.8, vp.width / 595)), bh = marca.h * s, bw = bh * marca.rel;
        const [vx, vy] = elegirRincon(vp.width, vp.height, bw, bh, cajas, s);
        page.drawImage(imgMarca, { x: cb.x + vx, y: cb.y + H - vy - bh, width: bw, height: bh, opacity: OPACIDAD_MARCA });
        try { pj.cleanup(); } catch (_) {}
      } catch (_) {}
      if (i % 3 === 0) await dormir(0);
    }
    out.setProducer('NikaMed · nikamed.com.ar'); out.setCreator('Lector NikaMed');
    try { if (mi.title) out.setTitle(String(mi.title)); } catch (_) {}
    alAvance(paginas.length, paginas.length, true);
    const bytes = await out.save();
    return { bytes, stats };
  }

  // ------------------------------------------------------------------ ventana de opciones
  function abrir(mi) {
    css();
    const viejo = mi.root.querySelector('.nkxp'); if (viejo) viejo.remove();
    const conMarcas = new Set(); mi.marcas.forEach((m) => conMarcas.add(m.pagina)); (mi.anots || []).forEach((a) => conMarcas.add(+a.posicion));
    const w = document.createElement('div'); w.className = 'nkxp'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', 'Exportar PDF');
    w.innerHTML = `<div><h3>📤 Exportar PDF</h3>
      <p>Se genera un PDF nuevo con tus subrayados, dibujos y notas sobre las páginas, y una marca de agua suave de NikaMed. Tu archivo original no cambia y no se sube a ningún lado.</p>
      <fieldset><legend>Páginas</legend>
        <label><input type="radio" name="nkxp-p" value="todo" checked> Todo el documento (${mi.n} pág.)</label>
        <label><input type="radio" name="nkxp-p" value="marcadas" ${conMarcas.size ? '' : 'disabled'}> Solo las páginas con marcas o notas (${conMarcas.size})</label>
        <label><input type="radio" name="nkxp-p" value="rango"> Rango: <input type="number" id="nkxp-a" min="1" max="${mi.n}" value="1" aria-label="Desde"> a <input type="number" id="nkxp-b" min="1" max="${mi.n}" value="${mi.n}" aria-label="Hasta"></label></fieldset>
      <fieldset><legend>Incluir</legend>
        <label><input type="checkbox" id="nkxp-m" checked> Subrayados y dibujos</label>
        <label><input type="checkbox" id="nkxp-n" checked> Textos y marcadores 📌</label></fieldset>
      <div class="pb"><i></i></div><div class="st" aria-live="polite"></div>
      <div class="f"><button type="button" class="sec" data-x="cerrar">Cancelar</button><button type="button" data-x="ok">Exportar</button></div></div>`;
    mi.root.appendChild(w);
    const q = (s) => w.querySelector(s), st = q('.st'), pb = q('.pb'), barra = q('.pb i'); let ocupado = false;
    w.addEventListener('click', (e) => { if ((e.target === w || e.target.dataset.x === 'cerrar') && !ocupado) w.remove(); });
    q('[data-x=ok]').onclick = async (e) => {
      const b = e.target, modo = (w.querySelector('input[name=nkxp-p]:checked') || {}).value;
      let nums = Array.from({ length: mi.n }, (_, i) => i + 1);
      if (modo === 'marcadas') nums = nums.filter((n) => conMarcas.has(n));
      else if (modo === 'rango') { const a = Math.max(1, Math.min(mi.n, +q('#nkxp-a').value || 1)), z = Math.max(a, Math.min(mi.n, +q('#nkxp-b').value || mi.n)); nums = nums.filter((n) => n >= a && n <= z); }
      if (!nums.length) { st.textContent = 'No hay páginas para exportar.'; return; }
      ocupado = true; b.disabled = true; q('[data-x=cerrar]').disabled = true; pb.style.display = 'block'; barra.style.width = '3%';
      try {
        st.textContent = 'Preparando…'; await cargarPdfLib();
        const r = await generar(mi, { nums, marcas: q('#nkxp-m').checked, notas: q('#nkxp-n').checked }, (i, t, fin) => { barra.style.width = Math.max(3, Math.round((i / t) * 96)) + '%'; st.textContent = fin ? 'Guardando el archivo…' : 'Página ' + (i + 1) + ' de ' + t + '…'; });
        const nombre = (String(mi.title || 'documento').replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) || 'documento') + ' - NikaMed.pdf';
        const url = URL.createObjectURL(new Blob([r.bytes], { type: 'application/pdf' }));
        const a = document.createElement('a'); a.href = url; a.download = nombre; document.body.appendChild(a); a.click();
        setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 5000);
        barra.style.width = '100%';
        st.textContent = '✅ Listo: ' + nombre + (r.stats.rotadas ? ` (${r.stats.rotadas} página${r.stats.rotadas === 1 ? '' : 's'} girada${r.stats.rotadas === 1 ? '' : 's'} se dejó sin marcas)` : '');
        ocupado = false; b.disabled = false; b.textContent = 'Exportar de nuevo'; q('[data-x=cerrar]').disabled = false; q('[data-x=cerrar]').textContent = 'Cerrar';
      } catch (err) {
        ocupado = false; b.disabled = false; q('[data-x=cerrar]').disabled = false; barra.style.width = '0'; pb.style.display = 'none';
        st.textContent = 'No se pudo exportar: ' + ((err && err.message) || err) + ' Si el PDF es muy pesado, probá con un rango de páginas.';
      }
    };
  }

  window.NikaPdfExport = { abrir };
})();
