// js/nikaFlashcards.js — Flashcards de tratamientos (post-it + recetario), panel de NikaFarma, Practicar y Simulador FlashCard.
// Datos: data/nikafarma_patologias.json (fichas con fuente, tipo guía/apunte y unidades problema `up`).
(function () {
  'use strict';
  const URL_DATOS = 'data/nikafarma_patologias.json';
  const KEY_OK = 'nika_fc_ok';
  const PAPEL = { 'up1': '#fff3a3', 'up2': '#fbcfe8', 'up3-sec1': '#bbf7d0', 'up3-sec2': '#ddd6fe', 'up3-sec3': '#fed7aa', 'up3-sec4': '#bae6fd', 'up3-sec5': '#fecdd3', 'up4': '#e9d5ff' };
  const LOGO = 'assets/N%20NIKA.png';
  const PALETA = ['#fff3a3', '#fbcfe8', '#bbf7d0', '#ddd6fe', '#fed7aa', '#bae6fd', '#fecdd3', '#e9d5ff', '#c7f9cc', '#fde68a'];
  const colorDe = (p) => { let h = 0; const t = String(p.id); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return PALETA[h % PALETA.length]; };
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  let D = null, cargando = null, modal = null;

  const leerOk = () => { try { return JSON.parse(localStorage.getItem(KEY_OK) || '{}') || {}; } catch (_) { return {}; } };
  const guardarOk = (o) => { try { localStorage.setItem(KEY_OK, JSON.stringify(o)); } catch (_) {} };

  // ---- sincronización entre dispositivos (tabla flashcards_progreso, RLS por usuario) ----
  const KEY_PEND = 'nika_fc_pend';
  const leerPend = () => { try { return JSON.parse(localStorage.getItem(KEY_PEND) || '[]') || []; } catch (_) { return []; } };
  const guardarPend = (a) => { try { localStorage.setItem(KEY_PEND, JSON.stringify(a)); } catch (_) {} };
  const cli = () => { try { return window.NikaSupabase && window.NikaSupabase.client; } catch (_) { return null; } };
  let uid = null, sincronizado = false;
  async function sesion() {
    if (uid) return uid;
    try { const c = cli(); if (!c) return null; if (window.NikaSupabase.ready) await window.NikaSupabase.ready; const r = await c.auth.getSession(); uid = r && r.data && r.data.session && r.data.session.user ? r.data.session.user.id : null; } catch (_) {}
    return uid;
  }
  async function empujar() {
    if (!(await sesion())) return false;
    const c = cli(), pend = leerPend(), resto = [];
    for (const op of pend) {
      try {
        const r = op.v ? await c.from('flashcards_progreso').upsert({ user_id: uid, ficha_id: op.id, actualizado_en: new Date().toISOString() }, { onConflict: 'user_id,ficha_id' })
                       : await c.from('flashcards_progreso').delete().eq('user_id', uid).eq('ficha_id', op.id);
        if (r && r.error) resto.push(op);
      } catch (_) { resto.push(op); }
    }
    guardarPend(resto);
    return resto.length === 0;
  }
  async function sincronizar() {
    if (sincronizado || !(await sesion())) return;
    try {
      if (!(await empujar())) return;
      const r = await cli().from('flashcards_progreso').select('ficha_id').eq('user_id', uid).limit(2000);
      if (r.error || !r.data) return;
      const o = {}; r.data.forEach((x) => { o[x.ficha_id] = 1; });
      guardarOk(o); sincronizado = true;
    } catch (_) {}
  }
  function marcar(id, v) {
    const o = leerOk(); if (v) o[id] = 1; else delete o[id]; guardarOk(o);
    const pend = leerPend().filter((x) => x.id !== id); pend.push({ id, v: !!v }); guardarPend(pend);
    empujar();
  }

  function cargar() {
    if (D) return Promise.resolve(D);
    if (cargando) return cargando;
    cargando = fetch(URL_DATOS, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((j) => sincronizar().then(() => j))
      .then((j) => {
        D = j;
        D.byId = {}; (j.patologias || []).forEach((p) => { D.byId[p.id] = p; p._h = norm([p.titulo].concat(p.alias || []).join(' ')); p._t = norm([p.definicion, (p.diagnostico || []).join(' ')].join(' ')); });
        return D;
      }).catch((e) => { cargando = null; console.warn('[flashcards]', e); return null; });
    return cargando;
  }

  // ---------- contenido por sección ----------
  // Formato legible: dosis y plazos resaltados, término inicial en negrita y una oración por línea.
  const RX_DOSIS = /(\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?\s?(?:mg\/kg\/h|mg\/kg\/día|mg\/kg|mg\/día|mg\/m²|mg\/ml|mg|mcg|µg|µg\/kg|UI|mUI\/ml|mU\/min|UI\/l|ml\/h|ml|mL|g\/día|g|U|%|semanas?|días?|horas?|meses|minutos|h|años|cm|mm|mmHg|mg\/dl|ng\/ml|µmol\/l))(?![A-Za-zÁÉÍÓÚáéíóúñ])/g;
  function fmt(texto) {
    const partes = String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim().split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ¿(])/);
    return partes.map((o) => {
      let h = esc(o);
      h = h.replace(RX_DOSIS, '<mark class="fc-dosis">$1</mark>');
      h = h.replace(/^([^:<]{2,60}):\s/, '<strong class="fc-lead">$1:</strong> ');
      return '<span class="fc-or">' + h + '</span>';
    }).join('');
  }
  const lista = (a, c) => a && a.length ? '<ul' + (c ? ' class="' + c + '"' : '') + '>' + a.map((x) => '<li>' + fmt(x) + '</li>').join('') + '</ul>' : '';
  const SECS = [
    { id: 'tx', ico: '💊', nom: 'Tratamiento', html: (p) => (p.tratamiento || []).map((b) => '<div class="fc-sub">' + esc(b.titulo) + '</div>' + (b.pasos || []).map((s) => '<div class="fc-paso"><b>' + esc(s.etiqueta) + '</b><span>' + fmt(s.texto) + '</span></div>').join('')).join(''),
      txt: (p) => (p.tratamiento || []).map((b) => b.titulo + '\n' + (b.pasos || []).map((s) => '• ' + s.etiqueta + ': ' + s.texto).join('\n')).join('\n') },
    { id: 'dx', ico: '🩺', nom: 'Diagnóstico y definición', html: (p) => (p.definicion ? '<p class="fc-def">' + fmt(p.definicion) + '</p>' : '') + lista(p.diagnostico),
      txt: (p) => (p.definicion ? p.definicion + '\n' : '') + (p.diagnostico || []).map((x) => '• ' + x).join('\n') },
    { id: 'est', ico: '🧪', nom: 'Estudios', html: (p) => lista(p.estudios), txt: (p) => (p.estudios || []).map((x) => '• ' + x).join('\n') },
    { id: 'seg', ico: '📈', nom: 'Seguimiento', html: (p) => lista(p.seguimiento), txt: (p) => (p.seguimiento || []).map((x) => '• ' + x).join('\n') },
    { id: 'rojo', ico: '🚩', nom: 'Banderas rojas', html: (p) => lista(p.banderas, 'fc-rojo'), txt: (p) => (p.banderas || []).map((x) => '• ' + x).join('\n') },
    { id: 'con', ico: '⚖️', nom: 'Contraste con consensos', html: (p) => p.contraste ? '<p class="fc-def"><b>' + esc(((D.meta.contraste || {})[p.contraste.estado]) || '') + '</b> · ' + esc(p.contraste.fuente) + '</p>' + lista(p.contraste.puntos) : '',
      txt: (p) => p.contraste ? p.contraste.fuente + '\n' + (p.contraste.puntos || []).map((x) => '• ' + x).join('\n') : '' }
  ];
  const tieneSec = (p, s) => { const h = s.html(p); return !!h && h.replace(/<[^>]+>/g, '').trim().length > 0; };

  function sello(p) {
    const f = p.fuente || {};
    if (f.tipo === 'guia') return '<div class="fc-aviso guia">✔ <span>Basada en guía: ' + esc(f.sociedad) + ' · ' + esc(f.anio) + '</span></div>';
    return '<div class="fc-aviso">⚠️ <span>Verificar veracidad con guías actuales. Fuente: ' + esc(f.sociedad) + '</span></div>';
  }
  const etiquetaFuente = (p) => (p.fuente && p.fuente.tipo === 'guia')
    ? '<span class="fc-tag guia">✔ ' + esc((p.fuente.sociedad || '').split('/')[0].trim()) + ' ' + esc(p.fuente.anio || '') + '</span>'
    : '<span class="fc-tag ver" title="Verificar veracidad con guías actuales">⚠️ Verificar con guías</span>';

  // ---------- tarjeta completa (detalle) ----------
  function textoCompartir(p, ids) {
    const f = p.fuente || {};
    const unidades = (p.up || []).map((u) => (D.meta.unidades || {})[u] || u).join(' · ');
    const cuerpo = SECS.filter((s) => ids.includes(s.id) && tieneSec(p, s)).map((s) => s.ico + ' *' + s.nom.toUpperCase() + '*\n' + s.txt(p)).join('\n\n');
    return '🃏 *' + p.titulo + '*\n' + unidades + '\n\n' + cuerpo + '\n\nFuente: ' + (f.sociedad || '') + ' · ' + (f.guia || '') + ' (' + (f.anio || '') + ')' +
      (f.tipo === 'guia' ? '' : '\n⚠️ Verificar veracidad con guías actuales.') + '\n\nNikaMed · Flashcards clínicas — nikamed.com.ar';
  }
  function avisoToast(host, msg) {
    const t = host.querySelector('.fcd-toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200);
  }
  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; } catch (_) {}
    try { const ta = document.createElement('textarea'); ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (_) { return false; }
  }

  // ---- imagen de la tarjeta (canvas propio) ----
  const COL_SEC = { tx: '#db2777', dx: '#2563eb', est: '#059669', seg: '#d97706', rojo: '#dc2626', con: '#7c3aed' };
  function envolver(ctx, texto, maxW) {
    const out = [];
    String(texto || '').split('\n').forEach((par) => {
      let cur = '';
      par.split(' ').forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
      out.push(cur);
    });
    return out;
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  async function generarImagen(p, ids) {
    const W = 1080, PAD = 54, TW = W - PAD * 2 - 40;
    const logo = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = LOGO; });
    const f = p.fuente || {};
    const secs = SECS.filter((s) => ids.includes(s.id) && tieneSec(p, s));
    // Se dibuja en dos pasadas: la primera mide el alto real y la segunda renderiza a la mayor nitidez que permita el navegador.
    const dibujar = (c, Hl) => {
    const papel = colorDe(p);
    c.fillStyle = '#f8fafc'; c.fillRect(0, 0, W, Hl);
    // cabecera NikaMed
    const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0f172a'); g.addColorStop(1, '#4338ca');
    c.fillStyle = g; c.fillRect(0, 0, W, 120);
    if (logo) { c.fillStyle = '#fff'; c.beginPath(); c.arc(PAD + 38, 60, 38, 0, 7); c.fill(); c.drawImage(logo, PAD + 12, 34, 52, 52); }
    c.fillStyle = '#fff'; c.font = '800 38px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillText('NikaMed', PAD + 96, 58);
    c.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif'; c.globalAlpha = .85; c.fillText('Flashcards clínicas · Patologías y tratamiento', PAD + 96, 90); c.globalAlpha = 1;
    // hoja
    let y = 156;
    const hojaTop = y;
    c.font = '700 64px Caveat, "Segoe Script", cursive';
    const tit = envolver(c, p.titulo, TW);
    y += 34;
    const bloques = [];
    const unidades = (p.up || []).map((u) => (D.meta.unidades || {})[u] || u).join('  ·  ');
    // medir y dibujar en dos pasadas: primero el cuerpo en un canvas largo
    let yy = y;
    c.fillStyle = '#1e293b';
    tit.forEach((l) => { yy += 66; });
    yy += 22; yy += 42; // unidades
    // dibujo real
    c.fillStyle = papel; rr(c, PAD - 10, hojaTop, W - (PAD - 10) * 2, Hl - hojaTop - 10, 26); c.fill();
    // pin
    c.fillStyle = '#e11d48'; c.beginPath(); c.arc(W / 2, hojaTop + 4, 12, 0, 7); c.fill();
    let ty = hojaTop + 74;
    c.fillStyle = '#1e293b'; c.font = '700 64px Caveat, "Segoe Script", cursive';
    tit.forEach((l) => { c.fillText(l, PAD + 20, ty); ty += 66; });
    c.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif'; c.globalAlpha = .7; c.fillText(unidades, PAD + 20, ty); c.globalAlpha = 1; ty += 22;
    for (const s of secs) {
      const col = COL_SEC[s.id] || '#4338ca';
      ty += 26;
      rr(c, PAD + 10, ty, W - (PAD + 10) * 2, 52, 14); c.fillStyle = col; c.fill();
      c.fillStyle = '#fff'; c.font = '800 28px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillText(s.ico + '  ' + s.nom, PAD + 30, ty + 36); ty += 52;
      const filas = s.id === 'tx' ? (p.tratamiento || []).flatMap((b) => [{ h: b.titulo }].concat((b.pasos || []).map((x) => ({ e: x.etiqueta, t: x.texto }))))
        : s.id === 'dx' ? (p.definicion ? [{ t: p.definicion }] : []).concat((p.diagnostico || []).map((t) => ({ t, b: 1 })))
        : s.id === 'est' ? (p.estudios || []).map((t) => ({ t, b: 1 })) : s.id === 'seg' ? (p.seguimiento || []).map((t) => ({ t, b: 1 }))
        : s.id === 'rojo' ? (p.banderas || []).map((t) => ({ t, b: 1 })) : (p.contraste ? [{ h: p.contraste.fuente }].concat((p.contraste.puntos || []).map((t) => ({ t, b: 1 }))) : []);
      for (const r of filas) {
        ty += 14;
        if (r.h) { c.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillStyle = '#334155'; envolver(c, r.h, TW).forEach((l) => { ty += 30; c.fillText(l, PAD + 24, ty); }); continue; }
        let x = PAD + 24, w = TW;
        if (r.e) { c.font = '700 34px Caveat, cursive'; c.fillStyle = col; c.fillText(r.e, x, ty + 30); const lw = Math.min(280, Math.max(150, Math.ceil(c.measureText(r.e).width) + 22)); x += lw; w = TW - lw; }
        else if (r.b) { c.fillStyle = col; c.beginPath(); c.arc(x + 6, ty + 14, 5, 0, 7); c.fill(); x += 24; w = TW - 24; }
        c.font = '500 25px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillStyle = '#1e293b';
        envolver(c, r.t, w).forEach((l, i) => { ty += i === 0 ? 30 : 33; c.fillText(l, x, ty); });
        ty += 4;
      }
      ty += 6;
    }
    ty += 34;
    c.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillStyle = '#334155';
    envolver(c, 'Fuente: ' + (f.guia || '') + ' — ' + (f.sociedad || '') + ' (' + (f.anio || '') + ')', TW).forEach((l) => { ty += 30; c.fillText(l, PAD + 20, ty); });
    if (f.tipo !== 'guia') { ty += 16; rr(c, PAD + 10, ty, W - (PAD + 10) * 2, 52, 14); c.fillStyle = '#fef9c3'; c.fill(); c.fillStyle = '#854d0e'; c.font = '800 23px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillText('⚠️  Verificar veracidad con guías actuales', PAD + 30, ty + 34); ty += 52; }
    ty += 26;
    const fin = ty + 40;
    // pie
    c.fillStyle = '#0f172a'; c.fillRect(0, fin, W, 70);
    c.fillStyle = '#fff'; c.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif'; c.fillText('NikaMed · Campus Nika — nikamed.com.ar', PAD + 10, fin + 44);
    return fin;
    };
    const medida = document.createElement('canvas'); medida.width = W; medida.height = 16;
    const fin = dibujar(medida.getContext('2d'), 9000);
    const Hf = fin + 70;
    let S = 3; while (S > 1 && W * S * Hf * S > 15.5e6) S -= 0.5;      // iOS limita el lienzo a unos 16 megapíxeles
    const out = document.createElement('canvas'); out.width = Math.round(W * S); out.height = Math.round(Hf * S);
    const o = out.getContext('2d'); o.scale(S, S); o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high';
    dibujar(o, Hf);
    return out;
  }
  const mensajeCorto = (p) => '🃏 ' + p.titulo + ' — flashcard clínica de NikaMed. Más tratamientos y temas en nikamed.com.ar';
  const nombreImg = (p) => 'NikaMed-' + norm(p.titulo).replace(/\s+/g, '-').slice(0, 40) + '.png';
  async function compartirImagen(p, ids, via, host) {
    const cv = await generarImagen(p, ids);
    const blob = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
    if (!blob) return avisoToast(host, 'No se pudo armar la imagen');
    const file = new File([blob], nombreImg(p), { type: 'image/png' });
    if (via === 'descargar') { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); return avisoToast(host, '⬇️ Imagen descargada'); }
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: mensajeCorto(p), title: p.titulo + ' · NikaMed' }); return avisoToast(host, '📤 Elegí WhatsApp en la lista'); }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    let copiada = false;
    try { if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); copiada = true; } } catch (_) {}
    if (!copiada) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); }
    window.open('https://web.whatsapp.com/send?text=' + encodeURIComponent(mensajeCorto(p)), '_blank', 'noopener');
    avisoToast(host, copiada ? '📋 Imagen copiada: pegala con Ctrl + V en el chat' : '⬇️ Imagen descargada: adjuntala en el chat');
  }

  // Dibuja la tarjeta completa dentro de `host`. opts.alVolver: función del botón «Volver».
  function detalle(host, id, opts) {
    opts = opts || {};
    cargar().then((d) => {
      const p = d && d.byId[id]; if (!p) return;
      const disp = SECS.filter((s) => tieneSec(p, s));
      const abiertas = new Set(['tx', 'dx'].filter((x) => disp.some((s) => s.id === x)));
      const papel = colorDe(p);
      const f = p.fuente || {};
      const pintar = () => {
        const ok = leerOk()[p.id];
        const unidades = (p.up || []).map((u) => '<span class="fcd-u">' + esc((d.meta.unidades || {})[u] || u) + '</span>').join('');
        const chips = disp.map((s) => '<button type="button" class="fc-chip' + (abiertas.has(s.id) ? ' on' : '') + '" data-fcd-sec="' + s.id + '">' + s.ico + ' ' + esc(s.nom) + '</button>').join('') +
          '<button type="button" class="fc-chip" data-fcd="todo">' + (abiertas.size === disp.length ? '➖ Contraer todo' : '📖 Expandir todo') + '</button>';
        const secs = disp.map((s) => '<details class="fcd-sec" data-sec="' + s.id + '"' + (abiertas.has(s.id) ? ' open' : '') + '><summary><i>' + s.ico + '</i><b>' + esc(s.nom) + '</b></summary><div class="fcd-in">' + s.html(p) + '</div></details>').join('');
        host.innerHTML = '<article class="fcd" style="--paper:' + papel + '">' +
          '<div class="fcd-cab"><button type="button" class="fcd-btn" data-fcd="volver">← ' + esc(opts.textoVolver || 'Volver') + '</button>' +
          '<span class="fcd-toast"></span></div>' +
          '<div class="fcd-hoja"><span class="pin"></span><span class="fcd-marca" aria-hidden="true"></span><h3>' + esc(p.titulo) + '</h3><div class="fcd-meta">' + unidades + etiquetaFuente(p) + (ok ? '<span class="fc-tag guia">✅ La sabés</span>' : '') + '</div>' +
          '<div class="fc-elegi">Tocá para desplegar o plegar cada parte</div><div class="fc-chips">' + chips + '</div>' +
          '<div class="fcd-secs">' + secs + '</div>' + sello(p) +
          '<div class="fcd-fuente"><b>Fuente</b><span>' + esc(f.guia || '') + '</span><small>' + esc(f.sociedad || '') + ' · ' + esc(f.anio || '') + (f.nota ? ' · ' + esc(f.nota) : '') + '</small></div></div>' +
          '<div class="fcd-acc"><button type="button" class="fcd-btn pri" data-fcd="copiar">📋 Copiar</button><button type="button" class="fcd-btn wa" data-fcd="wa">💬 WhatsApp (imagen)</button><button type="button" class="fcd-btn" data-fcd="img">⬇️ Descargar imagen</button>' +
          (navigator.share ? '<button type="button" class="fcd-btn" data-fcd="share">📤 Compartir</button>' : '') +
          '<button type="button" class="fcd-btn ' + (ok ? 'sec' : 'ok') + '" data-fcd="ok">' + (ok ? '↩ Marcar para repasar' : '✅ Me lo sé') + '</button></div>' +
          '<p class="fc-legal">' + esc(d.meta.descargo) + '</p></article>';
      };
      const ids = () => { const a = Array.from(abiertas); return a.length ? a : disp.map((s) => s.id); };
      pintar();
      host.onclick = (e) => {
        const b = e.target.closest('[data-fcd],[data-fcd-sec],summary'); if (!b) return;
        if (b.tagName === 'SUMMARY') { setTimeout(() => { const det = b.parentElement; if (det.open) abiertas.add(det.dataset.sec); else abiertas.delete(det.dataset.sec); const c = host.querySelector('[data-fcd="todo"]'); if (c) c.textContent = abiertas.size === disp.length ? '➖ Contraer todo' : '📖 Expandir todo'; host.querySelectorAll('[data-fcd-sec]').forEach((x) => x.classList.toggle('on', abiertas.has(x.dataset.fcdSec))); }, 0); return; }
        if (b.dataset.fcdSec) { const s = b.dataset.fcdSec; if (abiertas.has(s)) abiertas.delete(s); else abiertas.add(s); return pintar(); }
        const a = b.dataset.fcd;
        if (a === 'volver') { if (opts.alVolver) opts.alVolver(); return; }
        if (a === 'todo') { if (abiertas.size === disp.length) abiertas.clear(); else disp.forEach((s) => abiertas.add(s.id)); return pintar(); }
        if (a === 'ok') { marcar(p.id, !leerOk()[p.id]); pintar(); if (opts.alCambiar) opts.alCambiar(); return; }
        if (a === 'copiar') return copiar(textoCompartir(p, ids())).then((ok) => avisoToast(host, ok ? '📋 ¡Copiado!' : 'No se pudo copiar'));
        if (a === 'wa') { avisoToast(host, '🖼️ Armando la imagen…'); return compartirImagen(p, ids(), 'wa', host); }
        if (a === 'img') return compartirImagen(p, ids(), 'descargar', host);
        if (a === 'share') { navigator.share({ title: p.titulo + ' · NikaMed', text: mensajeCorto(p) }).catch(() => {}); return; }
      };
    });
  }

  // ---------- modal con la tarjeta completa ----------
  function asegurarModal() {
    if (modal) return modal;
    modal = document.createElement('div'); modal.className = 'fc-modal fc-root'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    document.body.appendChild(modal);
    return modal;
  }
  function cerrar() { if (modal) modal.classList.remove('on'); }
  function abrir(id, seleccion, alCambiar) {
    const m = asegurarModal();
    m.innerHTML = '<div class="fcd-wrap"></div>';
    m.classList.add('on'); m.scrollTop = 0;
    detalle(m.querySelector('.fcd-wrap'), id, { alVolver: cerrar, textoVolver: 'Cerrar', alCambiar });
  }

  // ---------- mosaico ----------
  function tile(p, i) {
    const ok = leerOk();
    const rot = [-0.9, 0.7, -0.5, 1, -0.7, 0.4][i % 6];   // inclinación suave: con ángulos grandes el texto se ve borroso
    return '<button type="button" class="fc-tile" data-fc-abrir="' + esc(p.id) + '" style="--paper:' + (colorDe(p)) + ';--rot:' + rot + 'deg;--d:' + Math.min(i, 14) * 0.035 + 's">' +
      '<span class="pin"></span>' + (ok[p.id] ? '<span class="ok" title="Ya la sabés">✅</span>' : '') +
      '<h4>' + esc(p.titulo) + '</h4><span class="hint">Tocá para abrir la tarjeta</span>' +
      '<span class="tags">' + etiquetaFuente(p) + '</span><span class="fc-sello" title="NikaMed"></span></button>';
  }

  function fichasDe(ups) {
    const set = ups && ups.length ? new Set(ups) : null;
    return (D.patologias || []).filter((p) => !set || (p.up || []).some((u) => set.has(u)));
  }

  function buscar(lista, q) {
    const n = norm(q); if (!n) return lista;
    const ws = n.split(' ');
    return lista.map((p) => {
      let s = 0;
      if (p._h.indexOf(n) >= 0) s = 100;
      else if (ws.every((w) => p._h.indexOf(w) >= 0)) s = 70;
      else if (ws.every((w) => (p._h + ' ' + p._t).indexOf(w) >= 0)) s = 30;
      return { p, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.p);
  }

  const AREAS_MOSAICO = [
    { id: 'ginecologia', nom: 'Ginecología', ico: '🌸', ok: true },
    { id: 'cirugia', nom: 'Cirugía', ico: '🔪' }, { id: 'siam', nom: 'S.I.A.M.', ico: '🩺' },
    { id: 'medicinalegal', nom: 'Medicina Legal', ico: '⚖️' }, { id: 'medicinadeportiva', nom: 'Medicina Deportiva', ico: '🏃' }
  ];

  // host: contenedor; opts: { ups:[...], agrupar:true/false, areas:true, inline:true }
  function montar(host, opts) {
    opts = opts || {};
    host.classList.add('fc-root');
    host.innerHTML = '<p style="opacity:.7">Preparando flashcards…</p>';
    cargar().then((d) => {
      if (!d) { host.innerHTML = '<div class="fc-vacio">No se pudieron cargar las flashcards. Probá de nuevo más tarde.</div>'; return; }
      let q = '', fuente = '', area = 'ginecologia', unidad = '';
      const base = fichasDe(opts.ups);
      const unidadesTodas = Object.keys(d.meta.unidades || {});
      const cuerpoId = 'fc-cuerpo-' + Math.random().toString(36).slice(2, 7);
      const armar = () => {
        host.innerHTML =
          (opts.areas ? '<div class="fc-areas">' + AREAS_MOSAICO.map((a) => '<button type="button" class="fc-area' + (a.ok && area === a.id ? ' on' : '') + '" ' + (a.ok ? 'data-fc-area="' + a.id + '"' : 'disabled title="Próximamente"') + '>' + a.ico + ' ' + a.nom + (a.ok ? '' : '<em>Próximamente</em>') + '</button>').join('') + '</div>' : '') +
          '<div class="fc-bar"><div class="fc-search"><input type="search" placeholder="Buscar patología, tratamiento o tema…" aria-label="Buscar flashcards" autocomplete="off"></div>' +
          '<select class="fc-sel" aria-label="Tipo de fuente"><option value="">Todas las fuentes</option><option value="guia">Solo guías de sociedad</option><option value="apunte">Solo apuntes (verificar)</option></select>' +
          '<div class="fc-prog"><span class="fc-pt"></span><i><b></b></i></div></div>' +
          (opts.ups ? '' : '<div class="fc-unis"><button type="button" class="fc-uni on" data-fc-uni="">Todas</button>' + unidadesTodas.map((u) => '<button type="button" class="fc-uni" data-fc-uni="' + u + '" style="--c:' + (PAPEL[u] || '#ddd') + '">' + esc(d.meta.unidades[u]) + '</button>').join('') + '</div>') +
          '<div id="' + cuerpoId + '"></div><div class="fc-legal">' + esc(d.meta.descargo) + '</div>';
        const inp = host.querySelector('.fc-search input'); inp.value = q;
        inp.addEventListener('input', (e) => { q = e.target.value; pintar(); });
        host.querySelector('.fc-sel').value = fuente;
        host.querySelector('.fc-sel').addEventListener('change', (e) => { fuente = e.target.value; pintar(); });
        host.querySelectorAll('[data-fc-uni]').forEach((b) => b.classList.toggle('on', b.dataset.fcUni === unidad));
        pintar();
      };
      const pintar = () => {
        const cuerpo = host.querySelector('#' + cuerpoId); if (!cuerpo) return;
        let l = buscar(base, q);
        if (unidad) l = l.filter((p) => (p.up || []).includes(unidad));
        if (fuente === 'guia') l = l.filter((p) => p.fuente.tipo === 'guia'); else if (fuente === 'apunte') l = l.filter((p) => p.fuente.tipo !== 'guia');
        const ok = leerOk(); const sabidas = base.filter((p) => ok[p.id]).length;
        host.querySelector('.fc-pt').textContent = sabidas + ' / ' + base.length + ' dominadas';
        host.querySelector('.fc-prog b').style.width = (base.length ? sabidas * 100 / base.length : 0) + '%';
        if (!l.length) { cuerpo.innerHTML = '<div class="fc-vacio">No hay flashcards para esa búsqueda.</div>'; return; }
        const porUnidad = opts.agrupar !== false && !opts.ups && !q && !unidad;
        if (porUnidad) {
          let h = '';
          unidadesTodas.forEach((u) => {
            const g = l.filter((p) => (p.up || [])[0] === u); if (!g.length) return;
            h += '<div class="fc-grupo">' + esc(d.meta.unidades[u]) + ' <small>' + g.length + ' tarjetas</small></div><div class="fc-grid">' + g.map(tile).join('') + '</div>';
          });
          cuerpo.innerHTML = h;
        } else cuerpo.innerHTML = '<div class="fc-grid">' + l.map(tile).join('') + '</div>';
      };
      host.addEventListener('click', (e) => {
        const a = e.target.closest('[data-fc-area]'); if (a) { area = a.dataset.fcArea; return armar(); }
        const u = e.target.closest('[data-fc-uni]'); if (u) { unidad = u.dataset.fcUni; host.querySelectorAll('[data-fc-uni]').forEach((b) => b.classList.toggle('on', b === u)); return pintar(); }
        const b = e.target.closest('[data-fc-abrir]'); if (!b) return;
        if (opts.inline) {
          const y = host.scrollTop; const lista = host.innerHTML;
          detalle(host, b.dataset.fcAbrir, { textoVolver: 'Volver a las flashcards', alVolver: () => { armar(); }, alCambiar: null });
          if (host.scrollTo) host.scrollTo(0, 0);
        } else abrir(b.dataset.fcAbrir, null, pintar);
      });
      armar();
    });
  }

  // ---------- panel a pantalla completa (NikaFarma) ----------
  function panel() {
    let ov = document.getElementById('fc-panel');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'fc-panel'; ov.className = 'fc-panel fc-root'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
      ov.innerHTML = '<div class="fcpn-top"><button type="button" class="fcd-btn" data-fcpn="cerrar">← Volver a NikaFarma</button>' +
        '<div class="fcd-logo"><img src="' + LOGO + '" alt="NikaMed"><span><b>NikaMed</b><small>Patologías y tratamiento · guías argentinas</small></span></div></div>' +
        '<div class="fcpn-hero"><i>📋</i><div><h2>Patologías y tratamiento</h2><p>Tarjetas con el esquema de tratamiento, diagnóstico y alarmas, según guías argentinas. Buscá, filtrá por área y abrí la tarjeta completa.</p></div></div>' +
        '<div class="fcpn-body" id="fcpn-body"></div>';
      document.body.appendChild(ov);
      ov.addEventListener('click', (e) => { if (e.target.closest('[data-fcpn="cerrar"]')) { ov.classList.remove('on'); document.body.style.overflow = ''; } });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on') && !(modal && modal.classList.contains('on'))) { ov.classList.remove('on'); document.body.style.overflow = ''; } });
      montar(ov.querySelector('#fcpn-body'), { areas: true, inline: false });
    }
    ov.classList.add('on'); document.body.style.overflow = 'hidden'; ov.scrollTop = 0;
  }

  // ---------- Verificación de la respuesta escrita ----------
  // Compara lo que escribió la persona contra los puntos de la ficha por coincidencia de conceptos (fármacos, dosis, términos clave).
  // Es orientativa: no entiende el sentido de la frase, solo si nombró los elementos importantes.
  const STOP = new Set('de la el los las un una unos unas y o u a en con por para del al se su sus que es son o si no lo le les como mas menos entre sobre sin segun hasta desde tras ante cada todo toda todos todas muy ya ser esta este estos estas esa ese eso otro otra otros otras puede pueden debe deben tambien solo solos sola cuando donde luego mientras durante antes despues'.split(' '));
  const sinAcento = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const rad = (w) => { w = w.replace(/(mente|aciones|acion|ciones|cion|idades|idad|ados|adas|ado|ada|ando|iendo|ante|es|s)$/, ''); return w.length > 5 ? w.slice(0, 5) : w; };
  const tokens = (t) => sinAcento(t).replace(/[^a-z0-9.,/%\s]/g, ' ').replace(/(\d)[.,](\d)/g, '$1p$2').split(/\s+/).filter((w) => w && !STOP.has(w) && (w.length >= 3 || /\d/.test(w)));
  const puntosDe = (p, c) => {
    const out = [];
    seccionesDe(c).forEach((sec) => {
      if (sec.id === 'tx') (p.tratamiento || []).forEach((b) => (b.pasos || []).forEach((st) => out.push({ rot: st.etiqueta, txt: st.texto, sec: b.titulo })));
      else if (sec.id === 'dx') { if (p.definicion) out.push({ rot: 'Definición', txt: p.definicion, sec: sec.nom }); (p.diagnostico || []).forEach((x) => out.push({ rot: '', txt: x, sec: sec.nom })); }
      else { const l = sec.id === 'est' ? p.estudios : sec.id === 'seg' ? p.seguimiento : p.banderas; (l || []).forEach((x) => out.push({ rot: '', txt: x, sec: sec.nom })); }
    });
    return out;
  };
  function verificar(p, c, resp) {
    const rTok = tokens(resp), rSet = new Set(rTok.map(rad)), crudo = sinAcento(resp);
    const tiene = (w) => { const r = rad(w); if (rSet.has(r)) return true; if (/\d/.test(w)) return crudo.indexOf(w.replace(/p/, ',')) >= 0 || crudo.indexOf(w.replace(/p/, '.')) >= 0; return r.length >= 5 && [...rSet].some((x) => x.length >= 5 && x.slice(0, 5) === r.slice(0, 5)); };
    const puntos = puntosDe(p, c).map((pt) => {
      const clave = [...new Set(tokens((pt.rot ? pt.rot + ' ' : '') + pt.txt))].sort((a, b) => (/\d/.test(b) - /\d/.test(a)) || b.length - a.length).slice(0, 7);
      const hit = clave.filter(tiene).length, f = clave.length ? hit / clave.length : 0;
      return Object.assign({}, pt, { f, est: f >= 0.45 ? 'ok' : f >= 0.2 ? 'parcial' : 'falta' });
    });
    const n = puntos.length || 1, nota = puntos.reduce((a, x) => a + (x.est === 'ok' ? 1 : x.est === 'parcial' ? 0.5 : 0), 0) / n;
    return { puntos, nota, vacio: rTok.length === 0 };
  }
  const resultadoHtml = (r, resp) => {
    const pct = Math.round(r.nota * 100), cls = pct >= 70 ? 'ok' : pct >= 40 ? 'med' : 'mal';
    const veredicto = r.vacio ? 'No escribiste nada: igual podés repasar la respuesta.' : pct >= 70 ? '¡Muy bien! Cubriste casi todo.' : pct >= 40 ? 'Vas bien, pero faltaron puntos importantes.' : 'Te faltaron varios puntos: repasá la respuesta de abajo.';
    return '<div class="fcv ' + cls + '"><div class="fcv-cab"><div class="fcv-pct">' + (r.vacio ? '–' : pct + '%') + '</div><div><b>' + veredicto + '</b><small>Cubriste ' + r.puntos.filter((x) => x.est === 'ok').length + ' de ' + r.puntos.length + ' puntos. Verificación automática por conceptos: es orientativa.</small></div></div>' +
      '<div class="fcv-lista">' + r.puntos.map((x) => '<div class="fcv-it ' + x.est + '"><i>' + (x.est === 'ok' ? '✅' : x.est === 'parcial' ? '🟡' : '❌') + '</i><span>' + (x.rot ? '<b>' + esc(x.rot) + '</b> ' : '') + fmt(x.txt) + '</span></div>').join('') + '</div>' +
      (resp ? '<details class="fcv-mia"><summary>Lo que escribiste</summary><p>' + esc(resp).replace(/\n/g, '<br>') + '</p></details>' : '') + '</div>';
  };

  // ---------- Simulador FlashCard y modo Practicar ----------
  const AREAS = [
    { id: 'ginecologia', nom: 'Ginecología y Obstetricia', ico: '🌸', c: '#ec4899', ok: true },
    { id: 'cirugia', nom: 'Cirugía', ico: '🔪', c: '#0ea5e9' }, { id: 'siam', nom: 'S.I.A.M.', ico: '🩺', c: '#10b981' },
    { id: 'medicinalegal', nom: 'Medicina Legal', ico: '⚖️', c: '#f59e0b' }, { id: 'medicinadeportiva', nom: 'Medicina Deportiva', ico: '🏃', c: '#8b5cf6' }
  ];
  const CONTENIDOS = [
    { id: 'tx', ico: '💊', nom: 'Solo tratamiento', desc: 'Esquemas y conducta terapéutica', secs: ['tx'], q: '¿Cuál es el tratamiento?', c: '#ec4899' },
    { id: 'dx', ico: '🩺', nom: 'Diagnóstico y estudios', desc: 'Criterios, definición y estudios', secs: ['dx', 'est'], q: '¿Cómo se diagnostica y qué se pide?', c: '#0ea5e9' },
    { id: 'alarma', ico: '🚩', nom: 'Seguimiento y alarmas', desc: 'Controles y banderas rojas', secs: ['seg', 'rojo'], q: '¿Qué controlar y qué alertas hay?', c: '#ef4444' },
    { id: 'todo', ico: '📖', nom: 'Tema completo', desc: 'Definición, diagnóstico, tratamiento y más', secs: ['dx', 'est', 'tx', 'seg', 'rojo'], q: 'Contá el tema completo', c: '#8b5cf6' }
  ];
  const ALCANCES = [
    { id: 'unidad', ico: '🎯', nom: 'Una unidad problema', desc: 'UP1, UP2, secciones de UP3 o UP4', c: '#6366f1' },
    { id: 'parcial', ico: '📄', nom: 'Parcial', desc: 'UP1 a UP3, todas las secciones', c: '#0ea5e9' },
    { id: 'final', ico: '🏁', nom: 'Final', desc: 'Todo el temario de la materia', c: '#ec4899' }
  ];
  // Qué tiene que completar la persona: se arma con las secciones que realmente trae esa ficha
  const guiaDe = (p, c) => {
    const nombres = seccionesDe(c).filter((x) => tieneSec(p, x)).map((x) => x.nom.toLowerCase());
    const lista = nombres.length > 1 ? nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1] : (nombres[0] || '');
    const pre = c.id === 'todo' ? 'Contá el tema completo: ' : 'Escribí ';
    return '✍️ ' + pre + (c.id === 'todo' ? '' : 'sobre ') + 'qué tenés que completar → <b>' + esc(lista) + '</b>.';
  };
  const PARCIAL_UPS = ['up1', 'up2', 'up3-sec1', 'up3-sec2', 'up3-sec3', 'up3-sec4', 'up3-sec5'];
  const seccionesDe = (c) => c.secs.map((s) => SECS.find((x) => x.id === s)).filter(Boolean);
  const bloquesHtml = (p, c) => seccionesDe(c).filter((s) => tieneSec(p, s)).map((s) => '<div class="fc-bloque"><h5>' + s.ico + ' ' + esc(s.nom) + '</h5>' + s.html(p) + '</div>').join('');
  const barajar = (a) => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  const poolDe = (st) => {
    let ups = null;
    if (st.alcance === 'unidad') ups = [st.unidad]; else if (st.alcance === 'parcial') ups = PARCIAL_UPS;
    const c = CONTENIDOS.find((x) => x.id === st.cont);
    let l = fichasDe(ups).filter((p) => seccionesDe(c).some((s) => tieneSec(p, s)));
    if (st.soloPend) { const ok = leerOk(); l = l.filter((p) => !ok[p.id]); }
    return l;
  };
  const selUnidad = (d, st) => '<div class="fcs-uni">' + Object.keys(d.meta.unidades).map((u) => '<button type="button" class="fcs-pill' + (st.unidad === u ? ' on' : '') + '" data-unidad="' + u + '" style="--c:' + (PAPEL[u] || '#ddd') + '">' + esc(d.meta.unidades[u]) + '</button>').join('') + '</div>';
  const tiles = (id, arr, st) => '<div class="fcs-tiles">' + arr.map((o) => '<button type="button" class="fcs-tile' + (st[id] === o.id ? ' on' : '') + '" data-set="' + id + '" data-v="' + o.id + '" style="--c:' + o.c + '"><i>' + o.ico + '</i><span><b>' + o.nom + '</b><small>' + o.desc + '</small></span></button>').join('') + '</div>';

  function simulador(host, opts) {
    host.classList.add('fc-root');
    cargar().then((d) => {
      if (!d) { host.innerHTML = '<div class="fc-vacio">No se pudieron cargar las flashcards.</div>'; return; }
      const st = Object.assign({ area: 'ginecologia', alcance: 'final', unidad: 'up3-sec4', cont: 'tx', n: 10, soloPend: false }, (opts && opts.estado) || {});
      let mazo = [], i = 0, vista = false, repasar = [], sabidas = 0, miResp = '', res = null;
      const setup = () => {
        const total = poolDe(st).length;
        host.innerHTML = '<div class="fcs-setup">' +
          '<section class="fcs-sec"><h3><span>1</span> Área</h3><div class="fcs-areas">' + AREAS.map((a) => '<button type="button" class="fcs-area' + (a.ok && st.area === a.id ? ' on' : '') + '" style="--c:' + a.c + '" ' + (a.ok ? 'data-area="' + a.id + '"' : 'disabled') + '><i>' + a.ico + '</i><b>' + a.nom + '</b>' + (a.ok ? '<small>' + d.patologias.length + ' flashcards</small>' : '<small>Muy pronto</small><em class="fcs-soon">Próximamente</em>') + '</button>').join('') + '</div></section>' +
          '<section class="fcs-sec"><h3><span>2</span> Qué rendir</h3>' + tiles('alcance', ALCANCES, st) + (st.alcance === 'unidad' ? selUnidad(d, st) : '') + '</section>' +
          '<section class="fcs-sec"><h3><span>3</span> Qué repasar de cada tarjeta</h3>' + tiles('cont', CONTENIDOS, st) + '</section>' +
          '<section class="fcs-sec"><h3><span>4</span> Cantidad</h3><div class="fcs-cant">' + [5, 10, 20, 0].map((n) => '<button type="button" class="fcs-pill' + (st.n === n ? ' on' : '') + '" data-n="' + n + '">' + (n ? n + ' tarjetas' : 'Todas (' + total + ')') + '</button>').join('') +
          '<label class="fcs-chk"><input type="checkbox" data-chk="pend"' + (st.soloPend ? ' checked' : '') + '><span>Solo las que todavía no domino</span></label></div></section>' +
          '<div class="fcs-go"><button type="button" class="fcs-start" data-go="1"' + (total ? '' : ' disabled') + '><span>▶ Empezar</span><small>' + total + ' tarjetas disponibles</small></button>' +
          '<p>Las tarjetas basadas en apuntes llevan el aviso «verificar con guías actuales».</p></div></div>';
      };
      const empezar = () => { mazo = barajar(poolDe(st)); if (st.n) mazo = mazo.slice(0, st.n); i = 0; vista = false; repasar = []; sabidas = 0; miResp = ''; res = null; carta(); };
      const carta = () => {
        if (i >= mazo.length) return fin();
        const p = mazo[i], c = CONTENIDOS.find((x) => x.id === st.cont), pct = Math.round(i * 100 / mazo.length);
        host.innerHTML = '<div class="fcs-run"><div class="fcs-top"><button type="button" class="fcs-salir" data-salir="1">✕ Salir</button><div class="fcs-barra"><b style="width:' + pct + '%"></b></div><span class="fcs-cont">' + (i + 1) + ' / ' + mazo.length + '</span></div>' +
          '<div class="fcs-escena"><div class="fcs-in' + (vista ? ' vuelta' : '') + '" style="--paper:' + (colorDe(p)) + '"><span class="pin"></span><span class="fc-sello-g fcs-sg"></span>' +
          '<div class="fcs-uni-t">' + esc(d.meta.unidades[(p.up || [])[0]] || '') + '</div><div class="fcs-q">' + esc(p.titulo) + '</div><div class="fcs-pq">' + c.ico + ' ' + esc(c.q) + '</div>' + (vista ? '' : '<div class="fcs-guia">' + guiaDe(p, c) + '</div>') +
          (vista ? (res ? resultadoHtml(res, miResp) : '') + '<div class="fcs-resp fc-papel">' + bloquesHtml(p, c) + '</div>' + sello(p)
            : '<textarea class="fcs-input" id="fcs-input" rows="5" maxlength="1500" placeholder="Escribí tu respuesta como la dirías en el examen…" aria-label="Tu respuesta">' + esc(miResp) + '</textarea>') + '</div></div>' +
          '<div class="fcs-acc">' + (vista ? '<button type="button" class="fcs-b no' + (res && res.nota < 0.7 ? ' sug' : '') + '" data-r="no">😅 A repasar</button><button type="button" class="fcs-b si' + (res && res.nota >= 0.7 ? ' sug' : '') + '" data-r="si">✅ Lo sabía</button>'
            : '<button type="button" class="fcs-b mostrar" data-verificar="1">✅ Verificar mi respuesta</button><button type="button" class="fcs-b no" data-mostrar="1">👀 Solo mostrar</button>') + '</div></div>';
      };
      const fin = () => {
        const pct = mazo.length ? Math.round(sabidas * 100 / mazo.length) : 0;
        host.innerHTML = '<div class="fcs-fin"><div class="fcs-anillo" style="--p:' + pct + '"><b>' + pct + '%</b></div><h3>' + (pct >= 80 ? '¡Excelente repaso!' : pct >= 50 ? '¡Vas muy bien!' : 'Seguí practicando, ya casi') + '</h3><p>Sabías <b>' + sabidas + '</b> de <b>' + mazo.length + '</b> tarjetas.</p>' +
          (repasar.length ? '<div class="fcs-rev">' + repasar.map((p) => '<button type="button" data-ver="' + esc(p.id) + '">📌 ' + esc(p.titulo) + '</button>').join('') + '</div>' : '') +
          '<div class="fcs-acc">' + (repasar.length ? '<button type="button" class="fcs-b mostrar" data-again="1">🔁 Repetir las que fallé</button>' : '') + '<button type="button" class="fcs-b no" data-setup="1">⚙️ Nueva configuración</button></div></div>';
      };
      host.onclick = (e) => {
        const t = e.target;
        const a = t.closest('[data-area]'); if (a) { st.area = a.dataset.area; return setup(); }
        const s = t.closest('[data-set]'); if (s) { st[s.dataset.set] = s.dataset.v; return setup(); }
        const u = t.closest('[data-unidad]'); if (u) { st.unidad = u.dataset.unidad; return setup(); }
        const n = t.closest('[data-n]'); if (n) { st.n = parseInt(n.dataset.n, 10); return setup(); }
        const ck = t.closest('[data-chk]'); if (ck) { st.soloPend = ck.checked; return setup(); }
        if (t.closest('[data-go]')) return empezar();
        if (t.closest('[data-verificar]')) { const ta = host.querySelector('#fcs-input'); miResp = ta ? ta.value : ''; res = verificar(mazo[i], CONTENIDOS.find((x) => x.id === st.cont), miResp); vista = true; return carta(); }
        if (t.closest('[data-mostrar]')) { const ta = host.querySelector('#fcs-input'); miResp = ta ? ta.value : ''; res = null; vista = true; return carta(); }
        const r = t.closest('[data-r]');
        if (r) { const p = mazo[i]; if (r.dataset.r === 'si') { sabidas++; marcar(p.id, true); } else repasar.push(p); i++; vista = false; miResp = ''; res = null; return carta(); }
        if (t.closest('[data-salir]') || t.closest('[data-setup]')) return setup();
        if (t.closest('[data-again]')) { mazo = barajar(repasar.slice()); i = 0; vista = false; repasar = []; sabidas = 0; miResp = ''; res = null; return carta(); }
        const v = t.closest('[data-ver]'); if (v) return abrir(v.dataset.ver, ['tx', 'dx']);
      };
      host.onchange = null;
      setup();
    });
  }

  // Practicar: repaso rápido sin evaluación, para recorrer el mazo con flechas o deslizando
  function practicar(host, opts) {
    host.classList.add('fc-root');
    cargar().then((d) => {
      if (!d) { host.innerHTML = '<div class="fc-vacio">No se pudieron cargar las flashcards.</div>'; return; }
      const st = Object.assign({ alcance: 'unidad', unidad: 'up3-sec4', cont: 'tx', soloPend: false }, (opts && opts.estado) || {});
      let mazo = [], i = 0, vista = false, enMazo = false, miResp = '', res = null;
      const setup = () => {
        const total = poolDe(st).length;
        host.innerHTML = '<div class="fcs-setup"><section class="fcs-sec"><h3><span>1</span> ¿Qué unidad querés practicar?</h3>' +
          '<div class="fcs-uni"><button type="button" class="fcs-pill' + (st.alcance === 'final' ? ' on' : '') + '" data-alc="final">Toda la materia</button><button type="button" class="fcs-pill' + (st.alcance === 'parcial' ? ' on' : '') + '" data-alc="parcial">Parcial (UP1–UP3)</button></div>' +
          selUnidad(d, st.alcance === 'unidad' ? st : Object.assign({}, st, { unidad: '' })) + '</section>' +
          '<section class="fcs-sec"><h3><span>2</span> ¿Qué querés ver al dar vuelta la tarjeta?</h3>' + tiles('cont', CONTENIDOS, st) + '</section>' +
          '<div class="fcs-go"><label class="fcs-chk"><input type="checkbox" data-chk="pend"' + (st.soloPend ? ' checked' : '') + '><span>Solo las que todavía no domino</span></label>' +
          '<button type="button" class="fcs-start" data-go="1"' + (total ? '' : ' disabled') + '><span>🏃 Practicar</span><small>' + total + ' tarjetas</small></button></div></div>';
      };
      const mostrar = () => {
        const p = mazo[i], c = CONTENIDOS.find((x) => x.id === st.cont), ok = leerOk()[p.id];
        host.innerHTML = '<div class="fcs-run"><div class="fcs-top"><button type="button" class="fcs-salir" data-salir="1">✕ Salir</button><div class="fcs-barra"><b style="width:' + ((i + 1) * 100 / mazo.length) + '%"></b></div><span class="fcs-cont">' + (i + 1) + ' / ' + mazo.length + '</span></div>' +
          '<div class="fcs-escena" data-voltear="1"><div class="fcs-in fcs-pr' + (vista ? ' vuelta' : '') + '" style="--paper:' + (colorDe(p)) + '"><span class="pin"></span><span class="fc-sello-g fcs-sg"></span>' +
          '<div class="fcs-uni-t">' + esc(d.meta.unidades[(p.up || [])[0]] || '') + (ok ? ' · ✅ ya la sabés' : '') + '</div><div class="fcs-q">' + esc(p.titulo) + '</div><div class="fcs-pq">' + c.ico + ' ' + esc(c.q) + '</div>' + (vista ? '' : '<div class="fcs-guia">' + guiaDe(p, c) + '</div>') +
          (vista ? '<div class="fcs-resp fc-papel">' + bloquesHtml(p, c) + '</div>' + sello(p)
            : '<div class="fcs-escribe fcs-dentro"><textarea class="fcs-input" id="fcs-input" rows="5" maxlength="1500" placeholder="Escribí tu respuesta acá…" aria-label="Tu respuesta">' + esc(miResp) + '</textarea>' +
              '<button type="button" class="fcs-b si" data-verificar="1">✅ Verificar mi respuesta</button><small>También podés darla vuelta para ver la respuesta sin escribir.</small></div>') + '</div></div>' +
          '<div class="fcs-acc"><button type="button" class="fcs-b no" data-prev="1"' + (i ? '' : ' disabled') + '>← Anterior</button><button type="button" class="fcs-b mostrar" data-voltear="1">' + (vista ? '↺ Ver el frente' : '👀 Dar vuelta') + '</button>' +
          '<button type="button" class="fcs-b si" data-saber="1">' + (ok ? '↩ Repasar' : '✅ La sé') + '</button><button type="button" class="fcs-b no" data-next="1"' + (i < mazo.length - 1 ? '' : ' disabled') + '>Siguiente →</button></div>' +
          (res ? resultadoHtml(res, miResp) : '') +
          '<p class="fcs-ayuda">Atajos: ← → para moverte · espacio para dar vuelta · S para marcar «La sé»</p></div>';
      };
      const ir = (k) => { i = Math.max(0, Math.min(mazo.length - 1, i + k)); vista = false; miResp = ''; res = null; mostrar(); };
      host.onclick = (e) => {
        const t = e.target;
        const al = t.closest('[data-alc]'); if (al) { st.alcance = al.dataset.alc; return setup(); }
        const u = t.closest('[data-unidad]'); if (u) { st.alcance = 'unidad'; st.unidad = u.dataset.unidad; return setup(); }
        const s = t.closest('[data-set]'); if (s) { st[s.dataset.set] = s.dataset.v; return setup(); }
        const ck = t.closest('[data-chk]'); if (ck) { st.soloPend = ck.checked; return setup(); }
        if (t.closest('[data-go]')) { mazo = poolDe(st); if (!mazo.length) return; i = 0; vista = false; enMazo = true; miResp = ''; res = null; return mostrar(); }
        if (t.closest('[data-verificar]')) { const ta = host.querySelector('#fcs-input'); miResp = ta ? ta.value : ''; res = verificar(mazo[i], CONTENIDOS.find((x) => x.id === st.cont), miResp); vista = true; return mostrar(); }
        if (t.closest('textarea, .fcs-escribe')) return;       // escribir dentro de la tarjeta no la da vuelta
        if (t.closest('[data-voltear]')) { const ta = host.querySelector('#fcs-input'); if (ta) miResp = ta.value; vista = !vista; return mostrar(); }
        if (t.closest('[data-next]')) return ir(1);
        if (t.closest('[data-prev]')) return ir(-1);
        if (t.closest('[data-saber]')) { const p = mazo[i]; marcar(p.id, !leerOk()[p.id]); return mostrar(); }
        if (t.closest('[data-salir]')) { enMazo = false; return setup(); }
      };
      if (!host._fcKeys) {
        host._fcKeys = true;
        document.addEventListener('keydown', (e) => {
          if (!enMazo || !document.body.contains(host) || /input|select|textarea/i.test((e.target.tagName || ''))) return;
          if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); }
          else if (e.key === ' ') { e.preventDefault(); vista = !vista; mostrar(); } else if (e.key.toLowerCase() === 's') { marcar(mazo[i].id, !leerOk()[mazo[i].id]); mostrar(); }
        });
        let x0 = null;
        host.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        host.addEventListener('touchend', (e) => { if (x0 == null || !enMazo) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) ir(dx < 0 ? 1 : -1); });
      }
      setup();
    });
  }

  window.NikaFlashcards = { cargar, montar, abrir, detalle, panel, simulador, practicar, generarImagen, datos: () => D };
})();
