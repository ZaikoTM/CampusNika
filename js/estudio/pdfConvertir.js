/* CAMPUS NIKA · Convertir presentaciones y documentos de Office para leerlos en el Lector Nika (js/estudio/pdfLector.js)
   Muchos materiales están en Drive como PowerPoint (.pptx) o Word (.docx): Drive los puede mostrar, pero el lector solo abre PDFs.
   Este módulo los convierte en tu dispositivo (no se sube nada a ningún sitio) a un PDF en el que se puede subrayar, dibujar,
   escribir texto, poner marcadores, buscar y exportar, como en cualquier otro PDF del lector:
     · cada diapositiva o página se dibuja como imagen nítida (se ve igual que el original)
     · encima se agrega una capa de texto invisible, así «Subrayar» y la búsqueda funcionan sobre las palabras
   El PDF convertido queda guardado en el dispositivo (js/estudio/pdfOffline.js): la próxima vez abre al instante y también sin conexión.
   No convierte los formatos viejos (.ppt, .doc) ni archivos de más de 60 MB.
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
  const MAX_BYTES = 60 * 1024 * 1024;
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
  async function dibujarPptx(zip, bytes, cont) {
    let w = 1280, h = 720;
    try { const x = await zip.file('ppt/presentation.xml').async('string'); const m = /<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/.exec(x); if (m) h = Math.round(w * Number(m[2]) / Number(m[1])); } catch (_) {}
    cont.style.width = w + 'px';
    const prev = window.pptxPreview.init(cont, { width: w, height: h, mode: 'list' });
    await prev.preview(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    return [...cont.querySelectorAll('.pptx-preview-slide-wrapper')];
  }
  async function dibujarDocx(bytes, cont) {
    await window.docx.renderAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), cont, null,
      { className: 'nkdocx', inWrapper: false, ignoreWidth: false, ignoreHeight: false, breakPages: true, useBase64URL: true, renderHeaders: true, renderFooters: true, renderFootnotes: true });
    await dormir(400);   // imágenes y tipografías
    return [...cont.querySelectorAll('section.nkdocx')];
  }

  async function convertir(bytes, op) {
    op = op || {};
    if (bytes.length > MAX_BYTES) throw new Error('El archivo pesa demasiado para convertirlo en este dispositivo (más de 60 MB). Se muestra con el visor de Drive.');
    const info = await tipoOffice(bytes);
    if (info === 'viejo') throw new Error('Este archivo está en un formato antiguo de Office (.ppt o .doc) y no se puede convertir. Se muestra con el visor de Drive.');
    if (!info) throw new Error('Este tipo de archivo no se puede convertir.');
    await Promise.all([cargar('h2c'), cargar('pdflib'), cargar(info.t === 'pptx' ? 'pptx' : 'docx')]);
    const PL = window.PDFLib;

    const cont = document.createElement('div');
    // en pantalla pero invisible: fuera de la pantalla el navegador no dibuja bien el contenido que se captura
    cont.style.cssText = 'position:absolute;left:0;top:0;background:#fff;opacity:.01;pointer-events:none;z-index:-1';
    document.body.appendChild(cont);
    let marco = null;
    try {
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
        const img = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        cv.width = cv.height = 1;
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
        if (i % 2 === 1) await dormir(0);
      }
      if (op.alAvance) op.alAvance(trabajos.length, trabajos.length);
      pdf.setProducer('NikaMed · convertido para el Lector'); try { pdf.setTitle(op.titulo || 'Documento'); } catch (_) {}
      return await pdf.save();
    } finally { cont.remove(); if (marco) marco.remove(); }
  }

  window.NikaPdfConvertir = { tipo, convertir, MAX_BYTES };
})();
