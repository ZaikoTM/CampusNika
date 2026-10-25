/* CAMPUS NIKA · Convertir presentaciones y documentos de Office para leerlos en el Lector Nika (js/estudio/pdfLector.js)
   Muchos materiales están en Drive como PowerPoint (.pptx) o Word (.docx): Drive los puede mostrar, pero el lector solo abre PDFs.
   Este módulo los convierte en tu dispositivo (no se sube nada a ningún sitio) a un PDF en el que se puede subrayar, dibujar,
   escribir texto, poner marcadores, buscar y exportar, como en cualquier otro PDF del lector:
     · cada diapositiva o página se dibuja como imagen nítida (se ve igual que el original)
     · encima se agrega una capa de texto invisible, así «Subrayar» y la búsqueda funcionan sobre las palabras
   El PDF convertido queda guardado en el dispositivo (js/estudio/pdfOffline.js): la próxima vez abre al instante y también sin conexión.
   No convierte los formatos viejos (.ppt, .doc). Los archivos pesados se convierten igual: tardan más y se ve el avance.
   API: NikaPdfConvertir.tipo(bytes) → 'pptx' | 'docx' | 'viejo' | null   ·   NikaPdfConvertir.convertir(bytes, { alAvance(i, n), cancelado() }) → Uint8Array (PDF) */
(function () {
  'use strict';
  if (window.NikaPdfConvertir) return;

  const LIBS = {
    jszip: ['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', () => window.JSZip],
    pptx: ['https://cdn.jsdelivr.net/npm/pptx-preview@1.0.7/dist/pptx-preview.umd.js', () => window.pptxPreview],
    docx: ['https://cdn.jsdelivr.net/npm/docx-preview@0.4.1/dist/docx-preview.min.js', () => window.docx],
    h2c: ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', () => window.html2canvas],
    pdflib: ['https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', () => window.PDFLib],
  };
  const MAX_BYTES = 400 * 1024 * 1024;   // los archivos pesados también se convierten (tardan más)
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

  const _cargando = {};
  function cargar(k) {
    const [src, listo] = LIBS[k];
    if (listo()) return Promise.resolve();
    if (_cargando[k]) return _cargando[k];
    return (_cargando[k] = new Promise((ok, no) => {
      const s = document.createElement('script'); s.src = src;
      s.onload = () => (listo() ? ok() : no(new Error('No se pudo iniciar ' + k)));
      s.onerror = () => { delete _cargando[k]; no(new Error('No se pudo cargar el conversor (' + k + '). Probá con conexión.')); };
      document.head.appendChild(s);
    }));
  }

  // 'pptx' | 'docx' (formatos nuevos de Office) | 'viejo' (.ppt/.doc binarios, no se convierten) | null (no es Office)
  function tipo(b) {
    if (!b || b.length < 8) return null;
    if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 3 && b[3] === 4) return 'zip';
    if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'viejo';
    return null;
  }
  async function tipoOffice(bytes) {
    const t = tipo(bytes); if (t !== 'zip') return t;
    await cargar('jszip');
    const z = await window.JSZip.loadAsync(bytes);
    if (z.file('ppt/presentation.xml')) return { t: 'pptx', zip: z };
    if (z.file('word/document.xml')) return { t: 'docx', zip: z };
    return null;
  }

  // ---- texto invisible: las palabras de cada diapositiva/página con su posición
  function palabras(el) {
    const base = el.getBoundingClientRect(), out = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    const rg = document.createRange();
    while ((n = tw.nextNode())) {
      const t = n.nodeValue; if (!t || !t.trim()) continue;
      const p = n.parentElement; if (!p) continue;
      const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const re = /\S+/g; let m, linea = null;
      while ((m = re.exec(t))) {
        try { rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); } catch (_) { continue; }
        const r = rg.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const w = { t: m[0], x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
        if (linea && Math.abs(linea.y - w.y) < linea.h * 0.5 && w.x - (linea.x + linea.w) < linea.h * 1.2 && w.x >= linea.x) { linea.t += ' ' + w.t; linea.w = w.x + w.w - linea.x; }
        else { if (linea) out.push(linea); linea = w; }
      }
      if (linea) out.push(linea);
    }
    return out;
  }
  function limpiar(font, s, cache) {
    let o = '';
    for (const ch of String(s)) {
      let v = cache.get(ch);
      if (v === undefined) { try { font.encodeText(ch); v = ch; } catch (_) { v = /\s/.test(ch) ? ' ' : '?'; } cache.set(ch, v); }
      o += v;
    }
    return o;
  }

  // Cortes de una hoja larga en páginas tipo A4: cada corte busca un hueco entre renglones
  function cortesDe(H, W, pals) {
    const alto = W * 1.4142, out = [];
    if (H <= alto * 1.25) return [[0, H]];
    const cruza = (y) => pals.some((p) => p.y < y && p.y + p.h > y);
    let y = 0;
    while (H - y > alto * 1.25) {
      let b = y + alto;
      if (cruza(b)) { for (let d = 2; d < alto * 0.15; d += 2) { if (!cruza(b - d)) { b -= d; break; } if (!cruza(b + d)) { b += d; break; } } }
      out.push([y, b]); y = b;
    }
    out.push([y, H]);
    return out;
  }

  // ---- renderizado de cada formato a un contenedor fuera de pantalla; devuelve los elementos de página
  // pptx-preview dibuja mal algunas imágenes del patrón de la presentación (fondos y cintas decorativas que quedan miles de veces más grandes):
  // se detectan por su tamaño imposible y se llevan a la escala correcta
  function arreglarEscala(slide) {
    slide.querySelectorAll('*').forEach((e) => {
      const st = e.style; if (!st) return;
      let corr = false;
      ['left', 'top', 'width', 'height'].forEach((k) => {
        const v = st[k];
        if (v && /px$/.test(v)) { const x = parseFloat(v); if (Math.abs(x) > 4000) { st[k] = (x / 635) + 'px'; corr = true; } }
      });
      if (corr) e.querySelectorAll(':scope > img').forEach((im) => { im.style.width = '100%'; im.style.height = '100%'; });
    });
  }
  const relDe = (xml) => { const o = {}; (xml || '').replace(/<Relationship\b[^>]*>/g, (t) => { const i = /\bId="([^"]+)"/.exec(t), g = /\bTarget="([^"]+)"/.exec(t); if (i && g) o[i[1]] = g[1]; return t; }); return o; };
  const rutaRel = (base, destino) => { const partes = base.split('/'); partes.pop(); destino.split('/').forEach((d) => { if (d === '..') partes.pop(); else if (d !== '.') partes.push(d); }); return partes.join('/'); };
  // Imágenes del patrón/plantilla con su posición exacta (EMU), en el orden en que aparecen
  function picsDe(xml) {
    const o = [];
    (xml || '').replace(/<p:pic>[\s\S]*?<\/p:pic>/g, (t) => {
      const m = /<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/.exec(t);
      if (m) o.push({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
      return t;
    });
    return o;
  }
  // Formas (marcos, líneas) del patrón/plantilla que no son marcadores de texto, con su posición exacta
  function formasDe(xml) {
    const o = [];
    (xml || '').replace(/<p:(sp|cxnSp)>[\s\S]*?<\/p:\1>/g, (t) => {
      if (/<p:ph\b/.test(t)) return t;
      const m = /<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/.exec(t);
      if (m) o.push({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
      return t;
    });
    return o;
  }
  // Se buscan por tamaño (no por orden) y se les corrige la posición
  function repararFormas(envoltorio, formas) {
    if (!envoltorio || !formas.length) return;
    const K = 12700, cand = [...envoltorio.querySelectorAll('div')].filter((d) => d.style.position === 'absolute' && d.querySelector(':scope > svg'));
    formas.forEach((f) => {
      const w = f.w / K, h = f.h / K;
      const d = cand.find((c) => Math.abs(parseFloat(c.style.width || '0') - w) < 2 && Math.abs(parseFloat(c.style.height || '0') - h) < 2) || (h === 0 ? null : null);
      if (d) { d.style.left = (f.x / K) + 'px'; d.style.top = (f.y / K) + 'px'; }
    });
  }
  // pptx-preview coloca mal las imágenes del patrón cuando están en el borde (x o y = 0 o negativas): se reubican con las medidas exactas del archivo
  function repararPatron(envoltorio, pics) {
    if (!envoltorio || !pics.length) return;
    const conts = [...envoltorio.querySelectorAll('div')].filter((d) => d.style.overflow === 'hidden' && d.firstElementChild && d.firstElementChild.tagName === 'IMG');
    if (conts.length !== pics.length) return;
    const K = 12700;   // EMU por punto: el patrón se dibuja en un lienzo de 960 pt de ancho
    conts.forEach((c, i) => {
      const p = pics[i], par = c.parentElement;
      if (par && par !== envoltorio) { par.style.left = (p.x / K) + 'px'; par.style.top = (p.y / K) + 'px'; }
      c.style.left = '0px'; c.style.top = '0px'; c.style.width = (p.w / K) + 'px'; c.style.height = (p.h / K) + 'px';
      c.firstElementChild.style.width = '100%'; c.firstElementChild.style.height = '100%';
    });
  }
  // Fondos que el tema define como imagen (p. ej. madera, papel): pptx-preview no los dibuja, se agregan al terminar
  async function fondosDeTema(zip, cuantas) {
    const out = Array.from({ length: cuantas }, () => ({ fondo: null, pm: [], pl: [], fm: [], fl: [] })), txt = async (n) => (zip.file(n) ? zip.file(n).async('string') : '');
    try {
      const pres = await txt('ppt/presentation.xml'), prels = relDe(await txt('ppt/_rels/presentation.xml.rels'));
      const ids = [...pres.matchAll(/<p:sldId\b[^>]*r:id="([^"]+)"/g)].map((m) => m[1]);
      const cacheImg = {};
      for (let i = 0; i < Math.min(ids.length, cuantas); i++) {
        const slide = rutaRel('ppt/presentation.xml', prels[ids[i]] || ''); if (!zip.file(slide)) continue;
        const srel = relDe(await txt(slide.replace(/([^/]+)$/, '_rels/$1.rels')));
        const layoutRel = Object.values(srel).find((t) => /slideLayouts\//.test(t)); if (!layoutRel) continue;
        const layout = rutaRel(slide, layoutRel), lrel = relDe(await txt(layout.replace(/([^/]+)$/, '_rels/$1.rels')));
        const masterRel = Object.values(lrel).find((t) => /slideMasters\//.test(t)); if (!masterRel) continue;
        const master = rutaRel(layout, masterRel), mrel = relDe(await txt(master.replace(/([^/]+)$/, '_rels/$1.rels')));
        const themeRel = Object.values(mrel).find((t) => /theme\//.test(t)); if (!themeRel) continue;
        const theme = rutaRel(master, themeRel);
        const xm = await txt(master), xl = await txt(layout);
        out[i].pm = picsDe(xm); out[i].pl = picsDe(xl); out[i].fm = formasDe(xm); out[i].fl = formasDe(xl);
        let bg = null;
        for (const parte of [slide, layout, master]) { const x = await txt(parte); const m = /<p:bg>([\s\S]*?)<\/p:bg>/.exec(x); if (m) { bg = m[1]; break; } }
        const ref = bg && /<p:bgRef\b[^>]*idx="(\d+)"/.exec(bg); if (!ref || +ref[1] < 1001) continue;
        const tx = await txt(theme), lista = /<a:bgFillStyleLst>([\s\S]*?)<\/a:bgFillStyleLst>/.exec(tx); if (!lista) continue;
        const estilos = [...lista[1].matchAll(/<a:(solidFill|gradFill|blipFill|noFill|pattFill)\b[\s\S]*?<\/a:\1>|<a:noFill\s*\/>/g)].map((m) => m[0]);
        const est = estilos[+ref[1] - 1001]; if (!est || !/^<a:blipFill/.test(est)) continue;
        const emb = /r:embed="([^"]+)"/.exec(est); if (!emb) continue;
        const trel = relDe(await txt(theme.replace(/([^/]+)$/, '_rels/$1.rels'))), img = trel[emb[1]]; if (!img) continue;
        const ruta = rutaRel(theme, img);
        if (!cacheImg[ruta] && zip.file(ruta)) { const ext = (ruta.split('.').pop() || 'png').toLowerCase().replace('jpg', 'jpeg'); cacheImg[ruta] = 'data:image/' + ext + ';base64,' + await zip.file(ruta).async('base64'); }
        if (cacheImg[ruta]) out[i].fondo = { url: cacheImg[ruta], tile: /<a:tile\b/.test(est) };
      }
    } catch (_) {}
    return out;
  }
  async function dibujarPptx(zip, bytes, cont) {
    let w = 1280, h = 720;
    try { const x = await zip.file('ppt/presentation.xml').async('string'); const m = /<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/.exec(x); if (m) h = Math.round(w * Number(m[2]) / Number(m[1])); } catch (_) {}
    cont.style.width = w + 'px';
    const prev = window.pptxPreview.init(cont, { width: w, height: h, mode: 'list' });
    await prev.preview(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    const sl = [...cont.querySelectorAll('.pptx-preview-slide-wrapper')];
    sl.forEach(arreglarEscala);
    const fondos = await fondosDeTema(zip, sl.length);
    sl.forEach((el, i) => {
      const d = fondos[i] || {};
      try { repararPatron(el.querySelector('.slide-master-wrapper'), d.pm || []); repararPatron(el.querySelector('.slide-layout-wrapper'), d.pl || []); repararFormas(el.querySelector('.slide-master-wrapper'), d.fm || []); repararFormas(el.querySelector('.slide-layout-wrapper'), d.fl || []); } catch (_) {}
      const f = d.fondo; if (!f) return;
      const bgEl = el.querySelector('.slide-background') || el;
      bgEl.style.backgroundImage = 'url(' + f.url + ')'; bgEl.style.backgroundSize = f.tile ? 'auto' : 'cover'; bgEl.style.backgroundRepeat = f.tile ? 'repeat' : 'no-repeat';
    });
    return sl;
  }
  async function dibujarDocx(bytes, cont) {
    await window.docx.renderAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), cont, null,
      { className: 'nkdocx', inWrapper: false, ignoreWidth: false, ignoreHeight: false, breakPages: true, useBase64URL: true, renderHeaders: true, renderFooters: true, renderFootnotes: true });
    await dormir(400);   // imágenes y tipografías
    return [...cont.querySelectorAll('section.nkdocx')];
  }

  // Presentaciones pesadas: las imágenes enormes (fotos de 5000 px, PNG de varios MB) se achican a 1900 px antes de dibujar.
  // Se ven igual en pantalla y la conversión es mucho más rápida y liviana en memoria.
  async function aliviarPptx(zip) {
    const nombres = Object.keys(zip.files).filter((n) => /^ppt\/media\/.+\.(png|jpe?g)$/i.test(n) && !zip.files[n].dir);
    let cambio = false;
    for (const n of nombres) {
      try {
        const u8 = await zip.file(n).async('uint8array');
        if (u8.length < 400 * 1024) continue;
        const png = /\.png$/i.test(n);
        const bmp = await createImageBitmap(new Blob([u8], { type: png ? 'image/png' : 'image/jpeg' }));
        const m = Math.max(bmp.width, bmp.height);
        if (m <= 1900 && u8.length < 1.5 * 1024 * 1024) { bmp.close(); continue; }
        const k = Math.min(1, 1900 / m), cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(bmp.width * k)); cv.height = Math.max(1, Math.round(bmp.height * k));
        const cx = cv.getContext('2d'); if (!png) { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); }
        cx.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
        const blob = await new Promise((r) => cv.toBlob(r, png ? 'image/png' : 'image/jpeg', 0.9));
        cv.width = cv.height = 1;
        if (blob && blob.size < u8.length) { zip.file(n, await blob.arrayBuffer()); cambio = true; }
      } catch (_) { /* esa imagen queda como estaba */ }
    }
    return cambio ? new Uint8Array(await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 1 } })) : null;
  }

  async function convertir(bytes, op) {
    op = op || {};
    if (bytes.length > MAX_BYTES) throw new Error('El archivo pesa demasiado para convertirlo en este dispositivo. Se muestra con el visor de Drive.');
    const info = await tipoOffice(bytes);
    if (info === 'viejo') throw new Error('Este archivo está en un formato antiguo de Office (.ppt o .doc) y no se puede convertir. Se muestra con el visor de Drive.');
    if (!info) throw new Error('Este tipo de archivo no se puede convertir.');
    if (op.alFase) op.alFase('Preparando el conversor…', 'Descargando las herramientas necesarias (solo la primera vez)');
    await Promise.all([cargar('h2c'), cargar('pdflib'), cargar(info.t === 'pptx' ? 'pptx' : 'docx')]);
    if (info.t === 'pptx' && bytes.length > 25 * 1024 * 1024) { if (op.alFase) op.alFase('Achicando las imágenes pesadas…', 'Así la conversión es más rápida'); const liviano = await aliviarPptx(info.zip); if (liviano) bytes = liviano; }
    const PL = window.PDFLib;

    const cont = document.createElement('div');
    // en pantalla pero invisible: fuera de la pantalla el navegador no dibuja bien el contenido que se captura
    cont.style.cssText = 'position:absolute;left:0;top:0;background:#fff;opacity:.01;pointer-events:none;z-index:-1';
    document.body.appendChild(cont);
    let marco = null;
    try {
      if (op.alFase) op.alFase('Armando las ' + (info.t === 'pptx' ? 'diapositivas' : 'páginas') + '…', 'Puede tardar unos segundos');
      const paginas = info.t === 'pptx' ? await dibujarPptx(info.zip, bytes, cont) : await dibujarDocx(bytes, cont);
      if (!paginas.length) throw new Error('No se encontró contenido para convertir.');
      const pdf = await PL.PDFDocument.create(), fuente = await pdf.embedFont(PL.StandardFonts.Helvetica), cache = new Map();
      const K = 0.75;   // px → pt
      // Un documento de Word llega como una sola hoja muy larga: se corta en páginas tipo A4, buscando un renglón libre para no partir el texto
      const trabajos = [];
      for (let i = 0; i < paginas.length; i++) {
        const el = paginas[i], r = el.getBoundingClientRect(), pals = palabras(el);
        const cortes = info.t === 'docx' ? cortesDe(r.height, r.width, pals) : [[0, r.height]];
        const base = r.top - cont.getBoundingClientRect().top;
        cortes.forEach((c) => trabajos.push({ el, pals, y0: c[0], y1: c[1], W: r.width, base }));
      }
      for (let i = 0; i < trabajos.length; i++) {
        if (op.cancelado && op.cancelado()) throw new Error('cancelado');
        if (op.alAvance) op.alAvance(i, trabajos.length);
        const { el, pals, y0, y1, W, base } = trabajos[i], H = y1 - y0;
        const esc = Math.min(1.6, 2000 / Math.max(W, 1));
        const opt = { scale: esc, backgroundColor: '#ffffff', useCORS: true, logging: false };
        // si la conversión se interrumpió (cambio de página, cierre), las hojas ya capturadas se reutilizan y solo se arma lo que falta
        let jpg = null;
        if (op.cp) { try { jpg = await op.cp.leer(i); } catch (_) {} }
        if (!jpg) {
          let cv;
          if (info.t === 'docx') {
            // Word: se muestra una ventana del alto de cada trozo y se desplaza el documento detrás de ella
            if (!marco) {
              marco = document.createElement('div'); marco.id = 'nk-conv-marco';
              marco.style.cssText = 'position:absolute;left:0;top:0;overflow:hidden;background:#fff;opacity:.01;pointer-events:none;z-index:-1';
              document.body.appendChild(marco); marco.appendChild(cont);
              cont.style.cssText = 'position:absolute;left:0;top:0;background:#fff';
            }
            marco.style.width = W + 'px'; marco.style.height = H + 'px'; cont.style.top = (-(base + y0)) + 'px';
            await dormir(30);
            cv = await window.html2canvas(marco, Object.assign({}, opt, { onclone: (d) => { const m = d.getElementById('nk-conv-marco'); if (m) { m.style.opacity = '1'; m.style.zIndex = '0'; } } }));   // la opacidad baja (para que no se vea en pantalla) no debe pasar al dibujo
          } else cv = await window.html2canvas(el, opt);
          const blob = await new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.88));
          jpg = new Uint8Array(await blob.arrayBuffer());
          cv.width = cv.height = 1;
          if (op.cp) { try { await op.cp.guardar(i, jpg); } catch (_) {} }
        }
        const img = await pdf.embedJpg(jpg);
        if (info.t === 'pptx' && el.parentNode) el.remove();   // se libera la diapositiva ya capturada (los archivos pesados no deben llenar la memoria)
        const pg = pdf.addPage([W * K, H * K]);
        pg.drawImage(img, { x: 0, y: 0, width: W * K, height: H * K });
        // capa de texto invisible para subrayar y buscar
        pals.filter((p) => p.y + p.h / 2 >= y0 && p.y + p.h / 2 < y1).forEach((p) => {
          try {
            const txt = limpiar(fuente, p.t, cache); if (!txt.trim()) return;
            let size = Math.max(4, p.h * K * 0.8);
            const nat = fuente.widthOfTextAtSize(txt, size);
            if (nat > 0) size = Math.max(size * 0.6, Math.min(size * 1.5, size * ((p.w * K) / nat)));
            pg.drawText(txt, { x: p.x * K, y: H * K - (p.y - y0 + p.h * 0.82) * K, size, font: fuente, opacity: 0 });
          } catch (_) {}
        });
        await dormir(20);   // da aire para que el avance se dibuje en pantalla
      }
      if (op.alFase) op.alFase('Guardando tu documento…', 'Último paso');
      if (op.alAvance) op.alAvance(trabajos.length, trabajos.length);
      pdf.setProducer('NikaMed · convertido para el Lector'); try { pdf.setTitle(op.titulo || 'Documento'); } catch (_) {}
      return await pdf.save();
    } finally { cont.remove(); if (marco) marco.remove(); }
  }

  window.NikaPdfConvertir = { tipo, convertir, MAX_BYTES, _t: { dibujarPptx, cargar } };
})();
