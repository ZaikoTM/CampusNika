/* CAMPUS NIKA · Texto OCR compartido para los PDF escaneados del Lector NikaMed (js/estudio/pdfLector.js)
   Los PDF de Drive que son escaneos no traen capa de texto: no se puede seleccionar, buscar ni subrayar texto. Como Drive solo se lee (nunca se
   modifica el archivo), el texto reconocido se guarda aparte, en Supabase, y el lector lo usa como si el PDF lo trajera.
   · Lo genera UNA vez un administrador (botón «Hacer OCR» en el lector o el mosaico «Texto OCR» del panel admin) y lo reciben todos solos.
   · El OCR corre en segundo plano en el dispositivo del admin (tesseract.js, español), página por página, con pausa y retoma donde quedó.
   · Solo se procesan las páginas sin texto; las que ya traen texto no se tocan. El archivo original nunca cambia.
   · Tablas: pdf_ocr_estado y pdf_ocr_paginas (14_pdf_ocr.sql); escribe solo is_admin(), leen todos los usuarios con sesión. */
(function () {
  'use strict';
  if (window.NikaPdfOcr) return;
  const TESS = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const MOTOR = 'tesseract-5.1.1-best-spa+eng-v2';
  const LANG_PATH = 'https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0_best';   // modelo «best» (el más preciso, más lento)
  const ANCHO_OCR = 2500;                       // píxeles de ancho al leer cada página (≈ 300 dpi en una A4: más resolución no mejora y empeora los escaneos borrosos)
  const TIEMPO_MAX = 90000;                     // una lectura que tarda más de esto se descarta y se reinicia el motor (una página rara no traba todo el libro)
  const CONF_OBJETIVO = 88;                     // si la lectura queda por debajo, se reintenta con la imagen binarizada
  const MIN_CHARS = 15;                       // menos letras que esto en una página = no tiene capa de texto
  const cli = () => window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s, r) => (r || document).querySelector(s);
  const L = () => window.NikaPdf;
  const aviso = (t) => { try { if (L() && L().aviso) L().aviso(t); } catch (_) {} };
  const charsDe = (tc) => tc.items.reduce((t, i) => t + (i.str ? i.str.length : 0), 0);

  // ---------------------------------------------------------------- permisos y estado
  let _admin;
  async function esAdmin() {
    if (_admin !== undefined) return _admin;
    try { const c = cli(); if (!c) return false; const { data, error } = await c.rpc('is_admin'); if (error) return false; _admin = data === true; return _admin; } catch (_) { return false; }
  }
  async function estado(fileId) {
    try { const { data, error } = await cli().from('pdf_ocr_estado').select('*').eq('file_id', fileId).maybeSingle(); return error ? null : (data || null); } catch (_) { return null; }
  }
  async function paginasHechas(fileId) {     // solo los números de página ya guardados (para retomar)
    const out = new Set(); const c = cli();
    for (let a = 0; ; a += 1000) {
      const { data, error } = await c.from('pdf_ocr_paginas').select('pagina').eq('file_id', fileId).order('pagina').range(a, a + 999);
      if (error || !data) break; data.forEach((r) => out.add(r.pagina)); if (data.length < 1000) break;
    }
    return out;
  }
  async function paginasDB(fileId) {         // número de página → líneas (con el texto de cada palabra y su posición)
    const out = {}; const c = cli();
    for (let a = 0; ; a += 200) {
      const { data, error } = await c.from('pdf_ocr_paginas').select('pagina,lineas').eq('file_id', fileId).order('pagina').range(a, a + 199);
      if (error || !data) break; data.forEach((r) => { out[r.pagina] = r.lineas; }); if (data.length < 200) break;
    }
    return out;
  }

  // ---------------------------------------------------------------- capa de texto sintética (lo que ve el lector)
  // línea guardada: { y:[arriba, abajo], w:[[palabra, x0, x1], …] } con coordenadas relativas (0–1) a la página
  function sintetico(page, lineas) {
    if (!lineas || !lineas.length || page.rotate) return null;
    const v = page.view, W = v[2] - v[0], H = v[3] - v[1], items = [];
    lineas.forEach((l) => {
      const alto = (l.y[1] - l.y[0]) * H, fs = Math.max(4, alto * 0.82), yb = v[3] - (l.y[0] + (l.y[1] - l.y[0]) * 0.8) * H;
      l.w.forEach((w, i) => {
        const ult = i === l.w.length - 1, ancho = ((ult ? w[2] : l.w[i + 1][1]) - w[1]) * W;
        items.push({ str: w[0] + (ult ? '' : ' '), dir: 'ltr', width: Math.max(1, ancho), height: fs, transform: [fs, 0, 0, fs, v[0] + w[1] * W, yb], fontName: 'nkocr', hasEOL: ult });
      });
    });
    return { items, styles: { nkocr: { fontFamily: 'sans-serif', ascent: 0.9, descent: -0.25, vertical: false } } };
  }
  // el documento responde con el texto OCR en las páginas que no traen texto propio (el lector, el buscador, el índice… no se enteran)
  function parchear(pdf, mapa) {
    pdf._ocrMapa = mapa;
    if (pdf._ocrParche) return; pdf._ocrParche = true;
    const orig = pdf.getPage.bind(pdf);
    pdf.getPage = async (n) => {
      const page = await orig(n);
      if (!page._ocrP) {
        page._ocrP = true; const og = page.getTextContent.bind(page);
        page.getTextContent = async (...a) => {
          const tc = await og(...a), m = pdf._ocrMapa && pdf._ocrMapa[n];
          if (m && charsDe(tc) < MIN_CHARS) { const s = sintetico(page, m); if (s) return s; }
          return tc;
        };
      }
      return page;
    };
  }
  // ¿es un escaneo? se miran 3 páginas repartidas
  async function pareceEscaneo(pdf) {
    const n = pdf.numPages, ps = Array.from(new Set([1, Math.ceil(n / 2), Math.max(1, n - 1)].filter((p) => p >= 1 && p <= n))); let sin = 0;
    for (const p of ps) { try { if (charsDe(await (await pdf.getPage(p)).getTextContent()) < MIN_CHARS) sin++; } catch (_) {} }
    return sin >= Math.max(1, Math.ceil(ps.length * 0.66));
  }
  // se llama al abrir un PDF: si ya hay OCR guardado, el documento pasa a tener texto
  async function aplicar(mi) {
    mi.ocr = { activo: false, parcial: false, estado: null };
    const est = await estado(mi.fileId); mi.ocr.estado = est;
    if (est && est.paginas_ok > 0) {
      const mapa = await paginasDB(mi.fileId);
      if (Object.keys(mapa).length) { parchear(mi.pdf, mapa); mi.ocr.activo = true; mi.ocr.parcial = est.estado !== 'listo'; mi.ocr.mapa = mapa; }
    }
  }

  // ---------------------------------------------------------------- motor de OCR
  let tessP = null;
  function cargarTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tessP) return tessP;
    tessP = new Promise((ok, mal) => { const s = document.createElement('script'); s.src = TESS; s.onload = () => ok(window.Tesseract); s.onerror = () => { tessP = null; mal(new Error('No se pudo bajar el motor de OCR')); }; document.head.appendChild(s); });
    return tessP;
  }
  const r4 = (v) => Math.round(v * 10000) / 10000;
  function lineasDe(data, W, H) {
    const out = [];
    (data.lines || []).forEach((l) => {
      const w = (l.words || []).filter((x) => x.text && x.text.trim() && x.confidence >= 25).map((x) => [x.text.trim(), r4(x.bbox.x0 / W), r4(x.bbox.x1 / W)]);
      if (w.length) out.push({ y: [r4(l.bbox.y0 / H), r4(l.bbox.y1 / H)], w });
    });
    return out;
  }
  // imagen en grises con el contraste estirado (ignora el 1 % más claro y oscuro); con bin=true además se binariza (Otsu): ayuda en escaneos grisáceos
  function preparar(origen, bin) {
    const cv = document.createElement('canvas'); cv.width = origen.width; cv.height = origen.height;
    const g = cv.getContext('2d'); if (bin) g.filter = 'blur(0.8px)';   // un leve desenfoque borra las motitas del escaneo antes de binarizar
    g.drawImage(origen, 0, 0); g.filter = 'none';
    const im = g.getImageData(0, 0, cv.width, cv.height), d = im.data, h = new Uint32Array(256), n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) { const y = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0; d[i] = y; h[y]++; }
    let acc = 0, lo = 0, hi = 255; for (let k = 0; k < 256; k++) { acc += h[k]; if (acc >= n * 0.01) { lo = k; break; } }
    acc = 0; for (let k = 255; k >= 0; k--) { acc += h[k]; if (acc >= n * 0.01) { hi = k; break; } }
    const rango = Math.max(1, hi - lo); let umbral = 128;
    if (bin) { let suma = 0; for (let k = 0; k < 256; k++) suma += k * h[k]; let sB = 0, wB = 0, max = 0; for (let k = 0; k < 256; k++) { wB += h[k]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += k * h[k]; const mB = sB / wB, mF = (suma - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > max) { max = v; umbral = k; } } }
    for (let i = 0; i < d.length; i += 4) {
      let y = Math.max(0, Math.min(255, ((d[i] - lo) * 255) / rango)); if (bin) y = d[i] > umbral ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = y;
    }
    g.putImageData(im, 0, 0); return cv;
  }
  // lectura de máximo detalle: imagen grande y limpia; si la confianza es baja se prueba otra versión y se queda la mejor
  async function crearWorker() {
    const T = await cargarTesseract();
    const w = await T.createWorker('spa+eng', 1, { langPath: LANG_PATH, cachePath: 'nikaocr_best_v1' });   // cachePath propio: no se mezcla con el modelo rápido de otras pruebas
    try { await w.setParameters({ preserve_interword_spaces: '1', user_defined_dpi: '300' }); } catch (_) {}
    return w;
  }
  const conTope = (p, ms) => new Promise((ok, mal) => { const t = setTimeout(() => mal(new Error('tiempo')), ms); p.then((v) => { clearTimeout(t); ok(v); }, (e) => { clearTimeout(t); mal(e); }); });
  async function leerPagina(ref, cv) {
    const intento = async (img) => {
      try { return (await conTope(ref.w.recognize(img), TIEMPO_MAX)).data; }
      catch (e) { if (e && e.message === 'tiempo') { try { await ref.w.terminate(); } catch (_) {} ref.w = await crearWorker(); } return null; }
    };
    let mejor = await intento(preparar(cv, false));
    if (!mejor || (mejor.confidence || 0) < CONF_OBJETIVO) { const alt = await intento(preparar(cv, true)); if (alt && (!mejor || (alt.confidence || 0) > (mejor.confidence || 0))) mejor = alt; }
    return mejor;                                  // null = la página no se pudo leer (se salta y se informa)
  }
  /* Procesa un documento de pdf.js. opts: { pdf, fileId, titulo, onProgreso(info) }
     Devuelve un controlador { pausar(), reanudar(), cancelar(), promesa }. Se puede llamar de nuevo y retoma donde quedó. */
  function procesar(opts) {
    const { pdf, fileId, titulo } = opts, c = cli(), total = pdf.numPages; let sumConf = 0, nConf = 0;
    const ctl = { estado: 'iniciando', pausa: false, cancel: false, hechas: 0, total, pausar() { ctl.pausa = true; }, reanudar() { ctl.pausa = false; }, cancelar() { ctl.cancel = true; ctl.pausa = false; } };
    const avisar = (extra) => { try { if (opts.onProgreso) opts.onProgreso(Object.assign({ estado: ctl.estado, hechas: ctl.hechas, total }, extra || {})); } catch (_) {} };
    const guardarEstado = (est, ok) => c.from('pdf_ocr_estado').upsert({ file_id: fileId, titulo: titulo || null, total_paginas: total, paginas_ok: ok, estado: est, con_texto: false, motor: MOTOR, conf_media: nConf ? Math.round((sumConf / nConf) * 10) / 10 : undefined, updated_at: new Date().toISOString() }, { onConflict: 'file_id' });
    ctl.promesa = (async () => {
      if (!(await esAdmin())) throw new Error('Solo un administrador puede generar el OCR');
      const ya = await paginasHechas(fileId); let ok = ya.size; ctl.hechas = ok; avisar();
      const ref = { w: await crearWorker() }, falladas = [];
      let buf = [], conTexto = 0, huboError = null;
      const volcar = async () => {
        if (buf.length) { const r = await c.from('pdf_ocr_paginas').upsert(buf, { onConflict: 'file_id,pagina' }); if (r && r.error) throw new Error(r.error.message || 'No se pudo guardar el OCR'); ok += buf.length; buf = []; }
        await guardarEstado('procesando', ok);
      };
      try {
        for (let n = 1; n <= total; n++) {
          if (ctl.cancel) break;
          while (ctl.pausa && !ctl.cancel) { ctl.estado = 'pausado'; avisar(); await sleep(400); }
          if (ctl.cancel) break; ctl.estado = 'procesando';
          if (ya.has(n)) continue;
          const page = await pdf.getPage(n);
          let tc; try { tc = await page.getTextContent(); } catch (_) { tc = { items: [] }; }
          if (charsDe(tc) >= MIN_CHARS) { conTexto++; ctl.hechas++; avisar({ pagina: n }); continue; }   // esta página ya trae texto: no se toca
          const v1 = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: Math.min(6, ANCHO_OCR / v1.width) });
          const cv = document.createElement('canvas'); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
          await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
          const data = await leerPagina(ref, cv);
          if (!data) { falladas.push(n); cv.width = 1; cv.height = 1; ctl.hechas++; avisar({ pagina: n }); continue; }
          sumConf += data.confidence || 0; nConf++;
          const lineas = lineasDe(data, cv.width, cv.height);
          cv.width = 1; cv.height = 1; try { page.cleanup(); } catch (_) {}
          buf.push({ file_id: fileId, pagina: n, lineas, conf: Math.round((data.confidence || 0) * 10) / 10 });
          ctl.hechas++; avisar({ pagina: n });
          if (buf.length >= 4) await volcar();
          await sleep(40);                       // respiro: el lector sigue fluido mientras tanto
        }
        await volcar();
      } catch (e) { huboError = e; try { await volcar(); } catch (_) {} }
      try { await ref.w.terminate(); } catch (_) {}
      const completo = !ctl.cancel && !huboError && !falladas.length;
      try { await guardarEstado(completo ? 'listo' : (huboError ? 'error' : 'pausado'), ok); } catch (_) {}
      ctl.estado = completo ? 'listo' : (huboError ? 'error' : 'pausado'); avisar({ fin: true });
      if (huboError) throw huboError;
      return { ok, conTexto, completo, falladas };
    })();
    return ctl;
  }

  // ---------------------------------------------------------------- interfaz en el lector
  function css() {
    if ($('#nkocr-css')) return;
    const st = document.createElement('style'); st.id = 'nkocr-css';
    st.textContent = `.nkpdf-ocr .oc-t{font-variant-numeric:tabular-nums;font-weight:800}.nkpdf-bar .nkpdf-ocr button.oc-x{width:26px;height:26px;padding:0;justify-content:center;border-radius:50%}
.nkpdf-ocr.act{background:rgba(52,211,153,.16);border-color:rgba(52,211,153,.5)}.nkpdf-ocr.run{background:rgba(168,85,247,.2);border-color:rgba(168,85,247,.55)}
.nkpdf-ocr .oc-bar{width:54px;height:6px;border-radius:99px;background:rgba(255,255,255,.18);overflow:hidden}.nkpdf-ocr .oc-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a855f7);transition:width .4s}`;
    document.head.appendChild(st);
  }
  function grupo(mi) {
    let g = $('.nkpdf-ocr', mi.root); if (g) return g;
    const ref = $('[data-accion="notas"]', mi.root), host = ref && ref.parentElement; if (!host) return null;
    g = document.createElement('div'); g.className = 'nkpdf-grupo nkpdf-ocr'; g.hidden = true; host.parentNode.insertBefore(g, host); return g;
  }
  function pintarPasivo(mi, g) {
    const o = mi.ocr; g.hidden = false; g.className = 'nkpdf-grupo nkpdf-ocr act';
    g.innerHTML = `<button type="button" data-oc="info" title="Este PDF es un escaneo y no traía texto: NikaMed lo reconoció automáticamente (OCR). Por eso podés seleccionar, subrayar y buscar. El archivo original no se modificó.">🔤<span class="nkpdf-txt">Texto OCR${o.parcial ? ' (parcial)' : ''}</span></button>`;
    g.onclick = () => aviso('🔤 Texto reconocido automáticamente (OCR) · el archivo original no se tocó' + (o.parcial ? ' · todavía faltan páginas' : ''));
  }
  async function montarUI(mi) {
    css(); const g = grupo(mi); if (!g || !mi.ocr) return;
    if (mi.ocr.activo && !mi.ocr.parcial) { pintarPasivo(mi, g); return; }
    if (!(await esAdmin())) { if (mi.ocr.activo) pintarPasivo(mi, g); return; }   // los usuarios solo ven el estado; el botón es del admin
    if (!(await pareceEscaneo(mi.pdf))) { if (mi.ocr.activo) pintarPasivo(mi, g); return; }
    const est = mi.ocr.estado, hechas = est ? est.paginas_ok : 0;
    g.hidden = false; g.className = 'nkpdf-grupo nkpdf-ocr';
    g.innerHTML = `<button type="button" data-oc="ir" title="Este PDF es un escaneo sin texto. Genera el texto OCR una sola vez y lo reciben todos los usuarios solos. Corre en segundo plano y el archivo de Drive no se modifica.">🔤<span class="nkpdf-txt">${hechas ? 'Seguir OCR (' + hechas + '/' + mi.n + ')' : 'Hacer OCR'}</span></button>`;
    g.onclick = (e) => { const b = e.target.closest('[data-oc]'); if (!b) return; const k = b.dataset.oc; if (k === 'ir') iniciar(mi, g); else if (k === 'pausa') { const c = mi._ocrCtl; if (!c) return; if (c.pausa) { c.reanudar(); b.textContent = '⏸'; b.title = 'Pausar'; } else { c.pausar(); b.textContent = '▶'; b.title = 'Seguir'; } } else if (k === 'stop') { if (mi._ocrCtl) mi._ocrCtl.cancelar(); } };
  }
  function iniciar(mi, g) {
    if (mi._ocrCtl && mi._ocrCtl.estado !== 'listo') return;
    g.className = 'nkpdf-grupo nkpdf-ocr run';
    g.innerHTML = `<span style="padding:0 6px">🔤 <span class="oc-t">OCR…</span></span><span class="oc-bar"><i></i></span><button type="button" class="oc-x" data-oc="pausa" title="Pausar">⏸</button><button type="button" class="oc-x" data-oc="stop" title="Detener (queda guardado lo hecho)">⏹</button>`;
    aviso('OCR en segundo plano: podés seguir leyendo. Lo hecho se guarda solo.');
    const t = $('.oc-t', g), bar = $('.oc-bar i', g);
    mi._ocrCtl = procesar({ pdf: mi.pdf, fileId: mi.fileId, titulo: mi.title, onProgreso: (p) => { if (!document.body.contains(g)) return; t.textContent = p.hechas + '/' + p.total; bar.style.width = Math.round((p.hechas / p.total) * 100) + '%'; } });
    mi._ocrCtl.promesa.then(async (r) => {
      if (L() && L().estado() !== mi) return;
      if (r && r.completo) { aviso('✅ OCR listo: ya se puede seleccionar, buscar y subrayar. Los usuarios lo reciben solos.'); await aplicar(mi); parchear(mi.pdf, mi.ocr.mapa || {}); if (L() && L().reconstruir) L().reconstruir(); await montarUI(mi); }
      else { await aplicar(mi); if (mi.ocr.activo && L() && L().reconstruir) L().reconstruir(); await montarUI(mi); }
    }).catch((e) => { aviso('OCR: ' + ((e && e.message) || 'no se pudo completar')); montarUI(mi); });
  }
  function cerrar(mi) { if (mi && mi._ocrCtl && mi._ocrCtl.estado !== 'listo') { try { mi._ocrCtl.cancelar(); } catch (_) {} } }

  window.NikaPdfOcr = { esAdmin, estado, aplicar, montarUI, cerrar, procesar, parchear, pareceEscaneo, paginasDB, MOTOR, MIN_CHARS };
})();
