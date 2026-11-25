/* CAMPUS NIKA · Mosaico «Texto OCR de la biblioteca» del panel admin (admin.html)
   Audita los PDF de las materias (data/*.json), detecta los que son escaneos sin texto y los procesa con OCR, uno por vez y en segundo plano.
   El texto queda en Supabase (14_pdf_ocr.sql) y todos los usuarios lo reciben solos al abrir el PDF; el archivo de Drive nunca se modifica.
   El motor es js/estudio/pdfOcr.js (el mismo que usa el botón «Hacer OCR» dentro del lector). */
(function () {
  'use strict';
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const API_KEY = 'AIzaSyB0MSmTC-gBB7hiw-MUqst1-m1iN8e-eDQ';   // clave pública de Drive, restringida por dominio
  const DATOS = [['Cirugía', 'data/cirugia.json'], ['Ginecología', 'data/gineco_data.json'], ['S.I.A.M.', 'data/siam_data.json'], ['Medicina Legal', 'data/medicinalegal.json'], ['Medicina Deportiva', 'data/medicinadeportiva.json']];
  const LS_AUD = 'nika_ocr_auditados';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cli = () => window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;
  const idDe = (u) => { const m = /\/file\/d\/([A-Za-z0-9_-]{10,})/.exec(u || '') || /[?&]id=([A-Za-z0-9_-]{10,})/.exec(u || ''); return m ? m[1] : null; };
  const $ = (s, r) => (r || document).querySelector(s);
  let raiz = null, filas = {}, cola = [], corriendo = null, auditando = false, parar = false;

  function cargarScript(src, listo) {
    if (listo()) return Promise.resolve();
    return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
  }
  async function prepararLibs() {
    await cargarScript(PDFJS + 'pdf.min.js', () => !!window.pdfjsLib); window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
    await cargarScript('js/estudio/pdfOcr.js?v=2', () => !!window.NikaPdfOcr);
  }
  const urlDrive = (id) => 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?alt=media&key=' + API_KEY;
  const aud = () => { try { return JSON.parse(localStorage.getItem(LS_AUD) || '{}'); } catch (_) { return {}; } };
  const audGuardar = (a) => { try { localStorage.setItem(LS_AUD, JSON.stringify(a)); } catch (_) {} };

  function css() {
    if ($('#aocr-css')) return;
    const st = document.createElement('style'); st.id = 'aocr-css';
    st.textContent = `.aocr-fila{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;background:rgba(124,58,237,.07);margin-bottom:6px;flex-wrap:wrap}
.aocr-fila .t{flex:1;min-width:180px;font-weight:700;font-size:.86rem}.aocr-fila .t small{display:block;font-weight:600;opacity:.65;font-size:.72rem}
.aocr-est{font-size:.7rem;font-weight:800;border-radius:99px;padding:2px 10px;background:#e2e8f0;color:#334155}.aocr-est.listo{background:#bbf7d0;color:#166534}.aocr-est.procesando{background:#ddd6fe;color:#5b21b6}.aocr-est.error{background:#fecaca;color:#991b1b}.aocr-est.pausado,.aocr-est.pendiente{background:#fde68a;color:#92400e}
.aocr-bar{width:110px;height:7px;border-radius:99px;background:rgba(15,23,42,.12);overflow:hidden}.aocr-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a855f7);transition:width .4s}
.aocr-top{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center}.aocr-msg{font-size:.8rem;font-weight:700;opacity:.8;margin:4px 0 10px}
.aocr-top input{flex:1;min-width:220px;padding:8px 12px;border-radius:10px;border:1px solid rgba(15,23,42,.2);font:inherit}`;
    document.head.appendChild(st);
  }
  const msg = (t) => { const m = $('.aocr-msg', raiz); if (m) m.textContent = t; };
  function fila(f) {
    let el = $('[data-id="' + f.id + '"]', raiz);
    if (!el) { el = document.createElement('div'); el.className = 'aocr-fila'; el.dataset.id = f.id; $('.aocr-lista', raiz).appendChild(el); }
    const pct = f.total ? Math.round(((f.ok || 0) / f.total) * 100) : 0, est = f.estado || 'pendiente';
    el.innerHTML = `<div class="t">${esc(f.titulo || f.id)}<small>${esc(f.materia || '')}${f.total ? ' · ' + f.total + ' págs.' : ''}${f.conf ? ' · confianza ' + Math.round(f.conf) + ' %' + (f.conf < 85 ? ' ⚠ revisar' : '') : ''}</small></div><span class="aocr-est ${est}">${({ pendiente: 'Pendiente', procesando: 'Procesando…', pausado: 'Pausado', listo: 'Listo ✓', error: 'Error' })[est] || est}</span>`
      + (f.total ? `<span class="aocr-bar"><i style="width:${pct}%"></i></span><span style="font-size:.72rem;font-weight:800">${f.ok || 0}/${f.total}</span>` : '')
      + (est !== 'listo' && est !== 'procesando' ? '<button type="button" class="as-btn" data-a="go">▶ Procesar</button>' : '')
      + (est === 'procesando' ? '<button type="button" class="as-btn" data-a="pausa">⏸ Pausar</button>' : '');
    filas[f.id] = Object.assign(filas[f.id] || {}, f);
  }
  async function cargarEstados() {
    const c = cli(); if (!c) return;
    const { data } = await c.from('pdf_ocr_estado').select('*').order('updated_at', { ascending: false });
    (data || []).forEach((r) => fila({ id: r.file_id, titulo: r.titulo, total: r.total_paginas, ok: r.paginas_ok, estado: r.estado, conf: r.conf_media }));
    resumen();
  }
  function resumen() {
    const v = Object.values(filas), l = v.filter((f) => f.estado === 'listo').length, p = v.filter((f) => f.estado !== 'listo').length;
    const bd = $('#badge-ocr'); if (bd) bd.textContent = p ? p + ' pend.' : (l ? '✓' : '–');
    msg(v.length ? l + ' PDF con OCR listo · ' + p + ' pendiente' + (p === 1 ? '' : 's') : 'Todavía no hay PDF escaneados registrados. Tocá «Auditar la biblioteca».');
  }

  // ---- auditoría: abre cada PDF por rangos (baja solo unas páginas) y mira si tiene capa de texto
  async function listaBiblioteca() {
    const out = new Map();
    for (const [materia, url] of DATOS) {
      try {
        const d = await (await fetch(url)).json();
        (d.units || []).forEach((u) => (u.materiales || []).forEach((m) => { const id = m.type === 'pdf' ? idDe(m.url) : null; if (id && !out.has(id)) out.set(id, { id, titulo: m.title, materia: materia + (u.number ? ' · UP' + u.number : '') }); }));
      } catch (_) {}
    }
    return [...out.values()];
  }
  async function auditar() {
    if (auditando) { parar = true; return; }
    auditando = true; parar = false; const b = $('[data-a="aud"]', raiz); if (b) b.textContent = '⏹ Detener auditoría';
    try {
      await prepararLibs(); const lista = await listaBiblioteca(), hecho = aud(); let revisados = 0, escaneos = 0;
      for (const it of lista) {
        if (parar) break;
        if (filas[it.id] && filas[it.id].estado === 'listo') continue;
        if (hecho[it.id] === 'texto') continue;
        msg('Auditando… ' + (++revisados) + ' de ' + lista.length + ' · ' + (it.titulo || '').slice(0, 50));
        try {
          const doc = await window.pdfjsLib.getDocument({ url: urlDrive(it.id), rangeChunkSize: 262144, disableAutoFetch: true }).promise;
          const esc2 = await window.NikaPdfOcr.pareceEscaneo(doc), total = doc.numPages; try { doc.destroy(); } catch (_) {}
          if (esc2) {
            escaneos++; fila(Object.assign({}, it, { total, estado: (filas[it.id] && filas[it.id].estado) || 'pendiente', ok: (filas[it.id] && filas[it.id].ok) || 0 }));
            await cli().from('pdf_ocr_estado').upsert({ file_id: it.id, titulo: it.titulo, total_paginas: total, estado: (filas[it.id] && filas[it.id].estado) || 'pendiente', paginas_ok: (filas[it.id] && filas[it.id].ok) || 0, con_texto: false, updated_at: new Date().toISOString() }, { onConflict: 'file_id' });
          } else { hecho[it.id] = 'texto'; audGuardar(hecho); }
        } catch (_) { /* no es un PDF o no se pudo leer: se salta */ }
      }
      msg(parar ? 'Auditoría detenida.' : 'Auditoría terminada: ' + escaneos + ' PDF escaneado' + (escaneos === 1 ? '' : 's') + ' sin texto encontrado' + (escaneos === 1 ? '' : 's') + ' de ' + lista.length + ' revisados.');
    } catch (e) { msg('No se pudo auditar: ' + (e && e.message)); }
    auditando = false; if (b) b.textContent = '🔎 Auditar la biblioteca'; resumen();
  }

  // ---- procesar (uno por vez)
  async function procesarUno(id) {
    const f = filas[id]; if (!f) return; if (corriendo) { if (!cola.includes(id)) { cola.push(id); msg('En cola: ' + (f.titulo || id)); } return; }
    try {
      await prepararLibs(); fila(Object.assign({}, f, { estado: 'procesando' }));
      const doc = await window.pdfjsLib.getDocument({ url: urlDrive(id) }).promise;
      corriendo = window.NikaPdfOcr.procesar({ pdf: doc, fileId: id, titulo: f.titulo, onProgreso: (p) => fila(Object.assign({}, filas[id], { estado: p.estado, ok: p.hechas, total: p.total })) });
      corriendo.id = id;
      await corriendo.promesa.catch((e) => { fila(Object.assign({}, filas[id], { estado: 'error' })); msg('Error: ' + (e && e.message)); });
      try { doc.destroy(); } catch (_) {}
    } catch (e) { fila(Object.assign({}, f, { estado: 'error' })); msg('Error: ' + (e && e.message)); }
    const fin = corriendo && corriendo.estado; corriendo = null; await cargarEstados();
    const sig = cola.shift(); if (sig && fin !== 'pausado') procesarUno(sig);
  }
  async function procesarLink(txt) {
    const id = idDe(txt) || (/^[A-Za-z0-9_-]{15,}$/.test(txt.trim()) ? txt.trim() : null); if (!id) { msg('Pegá un link de Drive válido (https://drive.google.com/file/d/…).'); return; }
    fila({ id, titulo: 'PDF ' + id.slice(0, 8) + '…', estado: 'pendiente' }); procesarUno(id);
  }

  async function iniciar() {
    if (raiz && raiz.dataset.listo) return; raiz = $('#ocr-cont'); if (!raiz) return; raiz.dataset.listo = '1'; css();
    raiz.innerHTML = '<p class="aocr-msg">Cargando…</p>';
    try { await prepararLibs(); } catch (e) { raiz.innerHTML = '<p class="aocr-msg">No se pudo cargar el motor de OCR: ' + esc(e.message) + '</p>'; return; }
    if (!(await window.NikaPdfOcr.esAdmin())) { raiz.innerHTML = '<p class="aocr-msg">Solo disponible para administradores. Si lo sos y ves esto, falta ejecutar 14_pdf_ocr.sql en Supabase.</p>'; return; }
    raiz.innerHTML = `<div class="aocr-top"><button type="button" class="as-btn" data-a="aud">🔎 Auditar la biblioteca</button><button type="button" class="as-btn" data-a="todos">▶ Procesar todos los pendientes</button></div>
      <div class="aocr-top"><input type="text" placeholder="…o pegá el link de un PDF de Drive para hacerle OCR" aria-label="Link de Drive"><button type="button" class="as-btn" data-a="link">Procesar este</button></div>
      <p class="aocr-msg"></p><div class="aocr-lista"></div>
      <p class="aocr-msg" style="font-weight:600;opacity:.65">El OCR corre en segundo plano en este dispositivo: dejá esta pestaña abierta. Se guarda cada pocas páginas y se puede pausar y retomar. El archivo de Drive no se modifica y los usuarios reciben el texto solos.</p>`;
    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, f = b.closest('.aocr-fila');
      if (a === 'aud') auditar();
      else if (a === 'todos') { Object.values(filas).filter((x) => x.estado !== 'listo').forEach((x) => procesarUno(x.id)); }
      else if (a === 'link') procesarLink($('input', raiz).value);
      else if (a === 'go' && f) procesarUno(f.dataset.id);
      else if (a === 'pausa' && corriendo) { corriendo.pausar(); b.textContent = '▶ Seguir'; b.dataset.a = 'seguir'; }
      else if (a === 'seguir' && corriendo) { corriendo.reanudar(); b.textContent = '⏸ Pausar'; b.dataset.a = 'pausa'; }
    });
    await cargarEstados(); resumen();
  }

  function engancharse() {
    const h = $('#tile-ocr .as-head'); if (!h) return;
    h.addEventListener('click', () => { setTimeout(iniciar, 80); });
    window.addEventListener('beforeunload', (e) => { if (corriendo && corriendo.estado === 'procesando') { e.preventDefault(); e.returnValue = ''; } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', engancharse); else engancharse();
})();
