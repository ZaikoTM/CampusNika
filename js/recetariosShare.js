// js/recetariosShare.js
// CAMPUS NIKA — Compartir / descargar la resolución de un recetario o certificado (imagen PNG + WhatsApp + link del caso).
// La imagen se dibuja en un <canvas> propio (sin librerías): hoja de recetario, membrete NikaMed, caso, puntaje y modelo.

const RecetariosShare = (() => {
  const api = () => window.NikaRecetarios._api();
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); else console.info(m); };
  const W = 1180, PAD = 44;
  const INK = '#1e3a8a';
  let opciones = { resultado: true, caso: true, modelo: false, link: true };
  let blobActual = null, urlActual = null, generando = 0;
  let linkActual = null;           // link corto del caso (null mientras se crea o si no se pudo crear)

  // ------------------------------------------------------------------ utilidades de dibujo
  const cargarImg = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function envolver(ctx, texto, maxW) {
    const lineas = [];
    String(texto || '').split('\n').forEach((parr) => {
      if (!parr.trim()) { lineas.push(''); return; }
      let cur = '';
      parr.split(' ').forEach((pal) => { const t = cur ? cur + ' ' + pal : pal; if (ctx.measureText(t).width > maxW && cur) { lineas.push(cur); cur = pal; } else cur = t; });
      lineas.push(cur);
    });
    return lineas;
  }
  const colorNivel = (p) => (p >= 90 ? '#22c55e' : p >= 80 ? '#38bdf8' : p >= 70 ? '#f59e0b' : '#ef4444');

  // ------------------------------------------------------------------ una hoja de recetario
  function hoja(ctx, x, y, w, h, doc, datos, firmaEl, imgs) {
    const esCert = doc.layout === 'certificado';
    const L = 46, top = y; const inner = w - 130;
    // papel + sombra
    ctx.save(); ctx.shadowColor = 'rgba(15,23,42,.35)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
    const g = ctx.createLinearGradient(0, y, 0, y + 1400); g.addColorStop(0, '#fffef9'); g.addColorStop(1, '#fffdf3'); ctx.fillStyle = g; rr(ctx, x, y, w, 10, 10); ctx.restore();
    const cuerpoY = y; // se dibuja el papel al final (conocemos la altura); primero medimos
    ctx.font = '700 40px Caveat, "Segoe Script", cursive';
    const lineasCuerpo = envolver(ctx, datos.cuerpo, inner - 20); const nLin = Math.max(esCert ? 9 : 8, lineasCuerpo.length + 1);
    const lineasEnc = h.encabezado ? Math.max(3, envolver(ctx, datos.encabezado, inner - 20).length) : 0;
    const altoMembrete = 130, altoEnc = lineasEnc ? lineasEnc * 48 + 14 : 0, altoRp = 70, altoCuerpo = nLin * 48, altoPie = 250;
    const total = 34 + altoMembrete + altoEnc + altoRp + altoCuerpo + altoPie + 20;
    // papel real
    ctx.save(); ctx.shadowColor = 'rgba(15,23,42,.35)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14; ctx.fillStyle = g; rr(ctx, x, y, w, total, 10); ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(239,68,68,.4)'; ctx.fillRect(x + 62, y, 3, total);                   // margen rojo
    // etiqueta
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif'; const et = h.titulo; const ew = ctx.measureText(et).width + 34;
    ctx.fillStyle = '#0284c7'; rr(ctx, x + 26, y - 16, ew, 34, 17); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(et, x + 43, y + 1);
    // membrete
    let cy = y + 34; const cx = x + 96;
    if (imgs.n) ctx.drawImage(imgs.n, cx, cy, 78, 72);
    if (imgs.vec) ctx.drawImage(imgs.vec, cx + 74, cy + 4, 120, 64);
    ctx.fillStyle = '#0b1220'; ctx.textBaseline = 'alphabetic'; ctx.font = '800 32px "Plus Jakarta Sans", sans-serif'; ctx.fillText('NikaMed', cx + 210, cy + 28);
    ctx.fillStyle = '#0369a1'; ctx.font = '700 19px "Plus Jakarta Sans", sans-serif'; ctx.fillText(`Consultorio médico · ${esCert ? 'Certificado médico' : doc.layout === 'solicitud' ? 'Solicitud de estudios' : 'Receta'}`, cx + 210, cy + 54);
    ctx.fillStyle = '#64748b'; ctx.font = '600 15px "Plus Jakarta Sans", sans-serif'; ctx.fillText('Recetario simulado de práctica · sin validez legal', cx + 210, cy + 76);
    cy += 92; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 84, cy); ctx.lineTo(x + w - 40, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 84, cy + 6); ctx.lineTo(x + w - 40, cy + 6); ctx.stroke();
    cy += 20; const lx = x + 84, lw = w - 124;
    const rayas = (yy, n) => { ctx.strokeStyle = 'rgba(59,130,246,.3)'; ctx.lineWidth = 1.4; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.moveTo(lx, yy + (i + 1) * 48 - 10); ctx.lineTo(lx + lw, yy + (i + 1) * 48 - 10); ctx.stroke(); } };
    // encabezado centrado
    if (h.encabezado) {
      rayas(cy, lineasEnc); ctx.fillStyle = INK; ctx.font = '700 40px Caveat, "Segoe Script", cursive'; ctx.textAlign = 'center';
      envolver(ctx, datos.encabezado, lw - 20).forEach((t, i) => ctx.fillText(t, lx + lw / 2, cy + (i + 1) * 48 - 16)); ctx.textAlign = 'left'; cy += altoEnc;
    }
    // Rp
    ctx.fillStyle = '#0f172a'; ctx.font = 'italic 700 54px "Times New Roman", serif'; ctx.fillText(esCert ? 'Rp/' : 'R/p', lx, cy + 52); cy += altoRp;
    // cuerpo
    rayas(cy - 6, nLin); ctx.fillStyle = INK; ctx.font = '700 40px Caveat, "Segoe Script", cursive';
    lineasCuerpo.forEach((t, i) => ctx.fillText(t, lx + 10, cy + (i + 1) * 48 - 16));
    if (datos.raya) { // el espacio libre se anula con un trazo ondulado en cada renglón vacío
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.globalAlpha = .85;
      for (let r = lineasCuerpo.length; r < nLin; r++) { const yy = cy + (r + 1) * 48 - 24; ctx.beginPath(); ctx.moveTo(lx + 10, yy); for (let xx = lx + 10; xx < lx + lw - 10; xx += 14) ctx.quadraticCurveTo(xx + 7, yy + (((xx - lx) / 14) % 2 ? -7 : 7), xx + 14, yy); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    cy += altoCuerpo + 18;
    // pie: fecha/hora a la izquierda, firma/sello/matrícula a la derecha
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#64748b'; ctx.fillText('FECHA', lx, cy + 10); ctx.fillText('HORA', lx, cy + 92);
    ctx.font = '700 38px Caveat, cursive'; ctx.fillStyle = INK; ctx.fillText(datos.fecha || '', lx + 4, cy + 52); ctx.fillText(datos.hora || '', lx + 4, cy + 134);
    ctx.strokeStyle = 'rgba(30,58,138,.45)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4; [60, 142].forEach((d) => { ctx.beginPath(); ctx.moveTo(lx, cy + d); ctx.lineTo(lx + 230, cy + d); ctx.stroke(); }); ctx.setLineDash([]);
    const fx = x + w - 380, fy = cy - 10;
    if (firmaEl) ctx.drawImage(firmaEl, fx, fy, 330, 120);
    else if (datos.firma) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx + 20, fy + 90); ctx.bezierCurveTo(fx + 60, fy + 10, fx + 90, fy + 120, fx + 130, fy + 60); ctx.bezierCurveTo(fx + 160, fy + 25, fx + 190, fy + 30, fx + 230, fy + 80); ctx.bezierCurveTo(fx + 260, fy + 100, fx + 290, fy + 50, fx + 320, fy + 30); ctx.stroke(); }
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy + 122); ctx.lineTo(fx + 330, fy + 122); ctx.stroke();
    ctx.fillStyle = '#64748b'; ctx.font = '700 15px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'right'; ctx.fillText('FIRMA', fx + 330, fy + 144);
    ctx.fillStyle = INK; ctx.font = '700 36px Caveat, cursive'; ctx.fillText(datos.sello || '', fx + 330, fy + 188); ctx.fillText(datos.matricula ? `M.P. ${datos.matricula}` : '', fx + 330, fy + 228); ctx.textAlign = 'left';
    return total;
  }

  // ------------------------------------------------------------------ imagen completa
  async function generar() {
    const { doc, caso, hojas, ultimo, modelo } = api();
    await Promise.all([document.fonts.load('700 40px Caveat'), document.fonts.load('800 30px "Plus Jakarta Sans"'), document.fonts.load('italic 700 50px "Times New Roman"')].map((p) => p.catch(() => null)));
    const imgs = { n: await cargarImg('assets/N%20NIKA.png'), vec: await cargarImg('assets/TEXTO%20VECTOR%20NIKA.png') };
    const cv = document.createElement('canvas'); cv.width = W; cv.height = 7000; const ctx = cv.getContext('2d');
    ctx.fillStyle = '#eef3fb'; ctx.fillRect(0, 0, W, cv.height);
    let y = 0;
    // banda superior
    const gb = ctx.createLinearGradient(0, 0, W, 0); gb.addColorStop(0, '#0b1220'); gb.addColorStop(.6, '#10254a'); gb.addColorStop(1, '#0c4a7e'); ctx.fillStyle = gb; ctx.fillRect(0, 0, W, 190);
    ctx.fillStyle = '#fff'; rr(ctx, PAD, 40, 250, 110, 22); ctx.fill(); if (imgs.n) ctx.drawImage(imgs.n, PAD + 18, 52, 86, 80); if (imgs.vec) ctx.drawImage(imgs.vec, PAD + 100, 56, 130, 70);
    ctx.fillStyle = '#7dd3fc'; ctx.font = '800 18px "Plus Jakarta Sans", sans-serif'; ctx.fillText('RECETARIOS Y CERTIFICADOS · NIKAMED', PAD + 282, 74);
    ctx.fillStyle = '#fff'; ctx.font = '800 38px "Plus Jakarta Sans", sans-serif'; const tit = doc.titulo; let ts = 38; while (ctx.measureText(tit).width > W - PAD * 2 - 282 - (opciones.resultado ? 170 : 0) && ts > 22) { ts -= 2; ctx.font = `800 ${ts}px "Plus Jakarta Sans", sans-serif`; } ctx.fillText(tit, PAD + 282, 122);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '600 20px "Plus Jakarta Sans", sans-serif'; ctx.fillText(caso.trampa ? 'Caso de criterio médico: ¿corresponde extenderlo?' : 'Mi resolución del caso', PAD + 282, 156);
    if (opciones.resultado && ultimo) {
      const cx = W - PAD - 70, cyy = 95, r = 52; ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(cx, cyy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = colorNivel(ultimo.pct); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cyy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ultimo.pct / 100); ctx.stroke(); ctx.lineCap = 'butt';
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 38px "Plus Jakarta Sans", sans-serif'; ctx.fillText(String(ultimo.pct), cx, cyy + 10); ctx.font = '700 14px "Plus Jakarta Sans", sans-serif'; ctx.fillStyle = '#cbd5e1'; ctx.fillText('/100', cx, cyy + 30);
      ctx.fillStyle = colorNivel(ultimo.pct); ctx.font = '800 17px "Plus Jakarta Sans", sans-serif'; ctx.fillText(ultimo.nivel.toUpperCase(), cx, cyy + 82); ctx.textAlign = 'left';
    }
    y = 190 + 34;
    // caso clínico
    if (opciones.caso) {
      ctx.font = '500 25px "Plus Jakarta Sans", sans-serif'; const tl = envolver(ctx, caso.texto, W - PAD * 2 - 60);
      const hc = 120 + tl.length * 36;
      ctx.save(); ctx.shadowColor = 'rgba(14,165,233,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; const gc = ctx.createLinearGradient(PAD, y, W - PAD, y + hc); gc.addColorStop(0, '#ffffff'); gc.addColorStop(1, '#e0f2fe'); ctx.fillStyle = gc; rr(ctx, PAD, y, W - PAD * 2, hc, 24); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; rr(ctx, PAD, y, W - PAD * 2, hc, 24); ctx.stroke();
      ctx.fillStyle = '#0369a1'; ctx.font = '800 16px "Plus Jakarta Sans", sans-serif'; ctx.fillText('🩺 CASO CLÍNICO · EL PACIENTE', PAD + 30, y + 38);
      ctx.fillStyle = '#0f172a'; ctx.font = '800 30px "Plus Jakarta Sans", sans-serif'; ctx.fillText(caso.p.nombreCompleto, PAD + 30, y + 78);
      ctx.fillStyle = '#334155'; ctx.font = '500 25px "Plus Jakarta Sans", sans-serif'; tl.forEach((t, i) => ctx.fillText(t, PAD + 30, y + 118 + i * 36));
      y += hc + 40;
    }
    // hojas del alumno
    const rotulo = (txt, color) => { ctx.fillStyle = color; ctx.font = '800 26px "Plus Jakarta Sans", sans-serif'; ctx.fillText(txt, PAD, y + 4); y += 42; };
    rotulo(caso.trampa ? '🚫 Resolución' : '✍️ Mi resolución', '#0f172a');
    if (caso.trampa) {
      ctx.fillStyle = '#fff'; ctx.font = '500 24px "Plus Jakarta Sans", sans-serif'; const tt = envolver(ctx, `Este caso NO correspondía extenderlo. ${caso.trampa.txt}`, W - PAD * 2 - 60); const hh = 50 + tt.length * 34; ctx.fillStyle = '#fef3c7'; rr(ctx, PAD, y, W - PAD * 2, hh, 18); ctx.fill(); ctx.fillStyle = '#78350f'; tt.forEach((t, i) => ctx.fillText(t, PAD + 30, y + 40 + i * 34)); y += hh + 30;
    } else {
      for (const h of doc.hojas) {
        const art = document.querySelector(`.rz-hoja[data-hoja="${h.id}"]`); const firmaEl = art && hojas[h.id] && hojas[h.id].firma ? art.querySelector('canvas') : null;
        const d = Object.assign({ encabezado: '', cuerpo: '', fecha: '', hora: '', sello: '', matricula: '', firma: false, raya: false }, hojas[h.id] || {});
        const alto = hoja(ctx, PAD, y + 12, W - PAD * 2, h, doc, d, firmaEl, imgs); y += alto + 50;
      }
    }
    // modelo
    if (opciones.modelo && !caso.trampa) {
      rotulo('✅ Así debería quedar (modelo)', '#15803d'); const m = modelo();
      for (const h of doc.hojas) { const x = m[h.id]; if (!x) continue; const alto = hoja(ctx, PAD, y + 12, W - PAD * 2, { ...h, titulo: `${h.titulo} · modelo` }, doc, x, null, imgs); y += alto + 50; }
    }
    // pie
    ctx.fillStyle = '#0b1220'; ctx.fillRect(0, y, W, 96); ctx.fillStyle = '#7dd3fc'; ctx.font = '800 22px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Practicá tus recetas y certificados en nikamed.com.ar', W / 2, y + 42);
    ctx.fillStyle = '#94a3b8'; ctx.font = '600 16px "Plus Jakarta Sans", sans-serif'; ctx.fillText('Simulador de Recetarios y Certificados · NikaMed · material de estudio, sin validez legal', W / 2, y + 70); ctx.textAlign = 'left';
    const fin = y + 96; const out = document.createElement('canvas'); out.width = W; out.height = fin; out.getContext('2d').drawImage(cv, 0, 0, W, fin, 0, 0, W, fin);
    return out;
  }

  // ------------------------------------------------------------------ enlace y mensaje
  function linkCaso() {
    const { R, docId, caso } = api();
    return `${location.origin}${location.pathname.replace(/[^/]*$/, '')}recetarios.html?doc=${encodeURIComponent(docId)}&c=${R.aBase64Url(R.compactar(caso))}`;
  }
  // Link corto: el caso se guarda en la tabla casos_compartidos y se comparte solo su código (8 caracteres).
  // Si la tabla no existe todavía (09_casos_compartidos.sql) o no hay conexión, se devuelve null y el mensaje
  // lleva la dirección del sitio sin el caso.
  const _cacheLinks = new Map();
  async function linkCorto() {
    const { R, docId, caso } = api();
    const compacto = R.compactar(caso); const firma = docId + JSON.stringify(compacto);
    if (_cacheLinks.has(firma)) return _cacheLinks.get(firma);
    const c = window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase);
    if (!c || !navigator.onLine) return null;
    const alfabeto = 'abcdefghjkmnpqrstuvwxyz23456789';
    for (let intento = 0; intento < 3; intento++) {
      let id = ''; const buf = new Uint8Array(8); crypto.getRandomValues(buf); buf.forEach((b) => { id += alfabeto[b % alfabeto.length]; });
      const { error } = await c.from('casos_compartidos').insert({ id, doc: docId, caso: compacto });
      if (!error) { const url = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}recetarios.html?doc=${encodeURIComponent(docId)}&k=${id}`; _cacheLinks.set(firma, url); return url; }
      if (error.code !== '23505') { console.warn('[RecetariosShare] No se pudo crear el link corto:', error.message); return null; }   // 23505: código repetido, se reintenta
    }
    return null;
  }
  async function prepararLink(alListo) { linkActual = null; try { linkActual = await linkCorto(); } catch (_) {} if (alListo) alListo(); }

  function mensajePorDefecto() {
    const { doc, ultimo, caso } = api();
    const nombre = doc.titulo.toLowerCase();
    const lineas = [`¡Mirá mi ${nombre} en NikaMed! 📝`];
    if (opciones.resultado && ultimo && !ultimo.trampa) lineas.push(`Me dio ${ultimo.pct}/100 (${ultimo.nivel}).`);
    if (caso.trampa) lineas.push('Era un caso de criterio médico: ¿vos lo hubieras extendido?');
    lineas.push('¿Qué te parece? ¿Está bien? 👀');
    if (opciones.link && linkActual) lineas.push('', 'Probá el mismo caso vos (te toca el mismo paciente):', linkActual);
    else lineas.push('', 'Practicá tus recetas y certificados en nikamed.com.ar 🩺');
    return lineas.join('\n');
  }

  // ------------------------------------------------------------------ interfaz
  const WA = '<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.5c0 2.3.6 4.4 1.8 6.3L3 29l7.4-1.9c1.8 1 3.7 1.5 5.6 1.5 7 0 12.7-5.6 12.7-12.5S23 3 16 3zm0 22.9c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.4 1.1 1.2-4.2-.3-.4a10.1 10.1 0 01-1.6-5.4C5.5 9.8 10.2 5.3 16 5.3s10.5 4.5 10.5 10.1S21.8 25.9 16 25.9zm5.8-7.5c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.4 8.4 0 01-4.1-3.6c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3 2 3.1 4.9 4.3c1.8.8 2.5.8 3.4.7.5-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4z"/></svg>';
  const SUGERENCIAS = ['¿Qué te parece?', '¿Está bien?', 'Hacelo vos y comparamos 😎', 'Ayudame a mejorarlo 🙏', '¿Me faltó algo?'];

  async function abrir(foco) {
    const prev = document.getElementById('rz-modal-share'); if (prev) prev.remove();
    const ov = document.createElement('div'); ov.className = 'rz-modal on'; ov.id = 'rz-modal-share';
    const { caso } = api();
    ov.innerHTML = `<div class="rz-mcard grande rz-share">
      <div class="rz-sh-h"><h3>📤 Compartir mi resolución</h3><button type="button" class="rz-sh-x" data-x aria-label="Cerrar">✕</button></div>
      <div class="rz-sh-grid">
        <div class="rz-sh-prev"><div class="rz-sh-loader" id="rz-sh-load"><i></i><span>Armando tu imagen…</span></div><img id="rz-sh-img" alt="Vista previa" hidden draggable="true"><p class="rz-sh-arrastra" id="rz-sh-arrastra" hidden>🖱️ Podés <b>arrastrar esta imagen</b> directo al chat de WhatsApp Web</p></div>
        <div class="rz-sh-side">
          <div class="rz-sh-opts">
            <label class="rz-tg"><input type="checkbox" data-o="resultado" ${opciones.resultado ? 'checked' : ''}><span class="rz-tg-b"></span><em>📊 Incluir mi puntaje</em></label>
            <label class="rz-tg"><input type="checkbox" data-o="caso" ${opciones.caso ? 'checked' : ''}><span class="rz-tg-b"></span><em>🩺 Incluir el caso clínico</em></label>
            ${caso.trampa ? '' : `<label class="rz-tg"><input type="checkbox" data-o="modelo" ${opciones.modelo ? 'checked' : ''}><span class="rz-tg-b"></span><em>✅ Incluir cómo debería quedar</em></label>`}
            <label class="rz-tg"><input type="checkbox" data-o="link" ${opciones.link ? 'checked' : ''}><span class="rz-tg-b"></span><em>🔗 Agregar link corto del caso <small id="rz-sh-linkest">(creando…)</small></em></label>
          </div>
          <label class="rz-sh-l" for="rz-sh-msg">✏️ Mensaje (podés editarlo)</label>
          <textarea id="rz-sh-msg" rows="8" maxlength="900"></textarea>
          <div class="rz-sh-chips">${SUGERENCIAS.map((s) => `<button type="button" data-ins="${esc(s)}">${esc(s)}</button>`).join('')}<button type="button" data-rest>↺ Restablecer</button></div>
          <div class="rz-sh-acc">
            <button type="button" class="rz-wa big" data-wa><span class="rz-wa-ic">${WA}</span><span>Enviar por WhatsApp</span></button>
            <button type="button" class="rz-cp" data-wa-web title="Abre web.whatsapp.com en otra pestaña"><span>🌐</span> WhatsApp Web</button>
            <button type="button" class="rz-cp" data-wa-app title="Abre la aplicación de WhatsApp instalada en la PC"><span>🖥️</span> App de WhatsApp</button>
            <button type="button" class="rz-dl" data-dl><span>⬇️</span> Descargar imagen</button>
            <button type="button" class="rz-cp" data-cpimg><span>📋</span> Copiar imagen</button>
            <button type="button" class="rz-cp" data-cptxt><span>💬</span> Copiar texto</button>
            <button type="button" class="rz-cp" data-cplink><span>🔗</span> Copiar link</button>
          </div>
          <details class="rz-sh-ayuda" open><summary>💻 ¿Cómo la mando desde la computadora?</summary>
            <ol>
              <li><b>Apretá «Enviar por WhatsApp»</b> (o «WhatsApp Web»). La imagen se copia sola y se abre WhatsApp con tu mensaje.</li>
              <li><b>Elegí el chat</b> al que querés mandarlo.</li>
              <li><b>Hacé clic en el cuadro de mensaje y presioná <kbd>Ctrl</kbd> + <kbd>V</kbd></b>: aparece tu recetario como imagen, listo para enviar.</li>
            </ol>
            <p>¿No se pegó? Tenés dos alternativas: <b>arrastrá la imagen</b> de la izquierda hasta el chat, o apretá <b>«Descargar imagen»</b> y adjuntala con el clip 📎 → «Fotos y videos».</p>
          </details>
          <p class="rz-sh-nota" id="rz-sh-nota"></p>
        </div>
      </div></div>`;
    document.body.appendChild(ov);
    const msg = ov.querySelector('#rz-sh-msg'); msg.value = mensajePorDefecto();
    let editado = false; msg.addEventListener('input', () => { editado = true; });
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-x]')) { ov.remove(); liberar(); } });
    ov.querySelectorAll('[data-o]').forEach((c) => c.addEventListener('change', () => { opciones[c.dataset.o] = c.checked; if (!editado) msg.value = mensajePorDefecto(); if (c.dataset.o !== 'link') refrescar(); }));
    ov.querySelectorAll('[data-ins]').forEach((b) => b.addEventListener('click', () => { const l = msg.value.split('\n'); l.splice(Math.min(l.length, 2), 0, b.dataset.ins); msg.value = l.join('\n'); editado = true; msg.focus(); }));
    ov.querySelector('[data-rest]').addEventListener('click', () => { msg.value = mensajePorDefecto(); editado = false; });
    ov.querySelector('[data-dl]').addEventListener('click', descargar);
    ov.querySelector('[data-cptxt]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(msg.value); toast('💬 Texto copiado'); destello('[data-cptxt]', '¡Copiado!'); } catch (_) { msg.select(); toast('Seleccioná y copiá el texto'); } });
    ov.querySelector('[data-cpimg]').addEventListener('click', () => copiarImagen(true));
    ov.querySelector('[data-wa]').addEventListener('click', () => whatsapp(msg.value, ov.querySelector('#rz-sh-nota')));
    ov.querySelector('[data-wa-web]').addEventListener('click', () => whatsapp(msg.value, ov.querySelector('#rz-sh-nota'), 'web'));
    ov.querySelector('[data-wa-app]').addEventListener('click', () => whatsapp(msg.value, ov.querySelector('#rz-sh-nota'), 'app'));
    ov.querySelector('[data-cplink]').addEventListener('click', () => copiarLink());
    // El mensaje se actualiza solo cuando el link corto está listo (si el alumno no lo editó)
    const linkEst = ov.querySelector('#rz-sh-linkest');
    linkEst.textContent = '(creando…)';
    prepararLink(() => {
      if (linkEst) linkEst.textContent = linkActual ? '(corto)' : '(no disponible)';
      if (!editado) msg.value = mensajePorDefecto();
    });
    // Arrastrar la imagen hacia el chat de WhatsApp Web: se entrega como archivo PNG
    const imgPrev = ov.querySelector('#rz-sh-img');
    imgPrev.addEventListener('dragstart', (e) => {
      if (!blobActual) return;
      try { const f = new File([blobActual], nombreArchivo(), { type: 'image/png' }); e.dataTransfer.items.add(f); e.dataTransfer.effectAllowed = 'copy'; } catch (_) {}
    });
    await refrescar();
    if (foco === 'descargar') ov.querySelector('[data-dl]').focus();
  }

  async function refrescar() {
    const tok = ++generando; const load = document.getElementById('rz-sh-load'), img = document.getElementById('rz-sh-img'); if (!img) return;
    load.hidden = false; img.hidden = true;
    try {
      const cv = await generar(); if (tok !== generando) return;
      const blob = await new Promise((ok) => cv.toBlob(ok, 'image/png')); if (tok !== generando) return;
      liberar(); blobActual = blob; urlActual = URL.createObjectURL(blob); img.src = urlActual; img.hidden = false; load.hidden = true; const ar = document.getElementById('rz-sh-arrastra'); if (ar) ar.hidden = false;
    } catch (e) { console.warn('[RecetariosShare] generar:', e); load.querySelector('span').textContent = 'No se pudo armar la imagen.'; }
  }
  function liberar() { if (urlActual) { try { URL.revokeObjectURL(urlActual); } catch (_) {} } urlActual = null; }
  const nombreArchivo = () => `NikaMed-${api().docId}-${new Date().toISOString().slice(0, 10)}.png`;

  function descargar() {
    if (!blobActual) { toast('Esperá un segundo: se está armando la imagen'); return; }
    const a = document.createElement('a'); a.href = urlActual || URL.createObjectURL(blobActual); a.download = nombreArchivo(); document.body.appendChild(a); a.click(); a.remove(); toast('⬇️ Imagen descargada'); destello('[data-dl]', '¡Descargada!');
  }
  function destello(sel, txt) {
    const b = document.querySelector(`#rz-modal-share ${sel}`); if (!b) return;
    const orig = b.innerHTML; b.classList.add('hecho'); b.innerHTML = `<span>✅</span> ${txt}`;
    setTimeout(() => { b.classList.remove('hecho'); b.innerHTML = orig; }, 2000);
  }
  async function copiarImagen(aviso) {
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobActual })]); if (aviso) { toast('📋 Imagen copiada: pegala en el chat con Ctrl + V'); destello('[data-cpimg]', '¡Copiada!'); } return true; }
    catch (_) { if (aviso) toast('Tu navegador no permite copiar imágenes: usá «Descargar» o arrastrá la imagen'); return false; }
  }
  // Pasos guiados para computadora: WhatsApp (web o escritorio) no permite adjuntar archivos desde un enlace,
  // así que la imagen queda en el portapapeles y el alumno solo tiene que pegarla.
  function guiaPegar(nota, copiada) {
    if (!nota) return;
    nota.className = 'rz-sh-nota rz-sh-pegar';
    nota.innerHTML = copiada
      ? '<b>📋 ¡Imagen copiada!</b><ol><li>Elegí el chat en WhatsApp.</li><li>Hacé clic en el cuadro de mensaje y presioná <kbd>Ctrl</kbd> + <kbd>V</kbd>: aparece tu recetario como imagen.</li><li>Enviá. (El texto ya está escrito.)</li></ol><button type="button" class="rz-cp" data-recopiar>📋 Copiar la imagen de nuevo</button>'
      : '<b>⬇️ Descargamos la imagen.</b><ol><li>Elegí el chat en WhatsApp.</li><li>Tocá el clip 📎 → «Fotos y videos» y elegí la imagen descargada.</li><li>Enviá. (El texto ya está escrito.)</li></ol>';
    const r = nota.querySelector('[data-recopiar]'); if (r) r.addEventListener('click', () => copiarImagen(true));
    nota.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  async function whatsapp(texto, nota, via) {
    if (!blobActual) { toast('Esperá un segundo: se está armando la imagen'); return; }
    const file = new File([blobActual], nombreArchivo(), { type: 'image/png' });
    // Celular (y Edge/Chrome en Windows): hoja de compartir del sistema con la IMAGEN adjunta y el texto como mensaje
    if (!via && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: texto, title: 'Mi recetario · NikaMed' }); toast('📤 Elegí WhatsApp en la lista'); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    // Resto de las computadoras: imagen al portapapeles (o descarga) + WhatsApp con el mensaje corto
    const copiada = await copiarImagen(false);
    if (!copiada) descargar();
    const t = encodeURIComponent(texto);
    const destino = via === 'web' ? `https://web.whatsapp.com/send?text=${t}` : via === 'app' ? `whatsapp://send?text=${t}` : `https://wa.me/?text=${t}`;
    if (via === 'app') { location.href = destino; } else window.open(destino, '_blank', 'noopener');
    guiaPegar(nota, copiada);
    toast(copiada ? '📋 Imagen copiada: pegala con Ctrl + V en el chat' : '⬇️ Imagen descargada: adjuntala en el chat');
  }
  async function copiarLink(btn) {
    let l = linkActual; if (!l) { try { l = await linkCorto(); } catch (_) {} }
    const corto = !!l; if (!l) l = linkCaso();   // sin la tabla / sin conexión: el link largo sigue funcionando
    try { await navigator.clipboard.writeText(l); if (btn) { btn.classList.add('ok'); const s0 = btn.innerHTML; btn.innerHTML = '<span>✅</span> ¡Link copiado!'; setTimeout(() => { btn.innerHTML = s0; btn.classList.remove('ok'); }, 1800); } else destello('[data-cplink]', '¡Copiado!'); toast(corto ? '🔗 Link corto copiado: tu compañero practica el mismo caso' : '🔗 Link copiado (largo): tu compañero practica el mismo caso'); }
    catch (_) { window.prompt('Copiá este link:', l); }
  }
  return { abrir, copiarLink, _generar: generar };
})();
window.RecetariosShare = RecetariosShare;
