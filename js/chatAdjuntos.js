/* CAMPUS NIKA · Adjuntos y cosas para compartir en los chats (chat normal y chat de la sala).
   · Sube archivos a Supabase Storage (bucket chat-files; si todavía no existe, imágenes y PDF van a forum-files).
   · Un adjunto viaja dentro del mensaje como una marca [[adj:...]]: no hace falta ninguna columna nueva.
   · Menú 📎: archivo, foto, tema actual, progreso de hoy y enlace. También pegar una imagen o arrastrar un archivo.
   API: NikaChatAdj.subir(file) · marca(adj) · parse(texto) · html(adj) · menu(boton, { onFile, onTexto }) · soltar(el, onFile) */
(function () {
  'use strict';
  if (window.NikaChatAdj) return;
  const MAX = 15 * 1024 * 1024, DIAS_VIDA = 30;   // los archivos se borran solos a los 30 días para no llenar el almacenamiento
  const OK = /^(image\/(jpeg|png|webp|gif)|application\/pdf|application\/zip|application\/msword|application\/vnd\.(openxmlformats-officedocument\.[a-z.]+|ms-excel|ms-powerpoint)|text\/plain|audio\/(mpeg|mp4|ogg|webm|wav)|video\/(mp4|webm))$/;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sb = () => window.NikaSupabase && window.NikaSupabase.client;
  const tam = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
  const icono = (m) => (/^image\//.test(m) ? '🖼️' : /pdf/.test(m) ? '📕' : /zip/.test(m) ? '🗜️' : /word/.test(m) ? '📘' : /excel|sheet/.test(m) ? '📗' : /powerpoint|presentation/.test(m) ? '📙' : /^audio\//.test(m) ? '🎵' : /^video\//.test(m) ? '🎬' : '📄');

  async function subir(file) {
    const c = sb(); if (!c) return { ok: false, error: 'No hay conexión con Supabase.' };
    if (!file) return { ok: false, error: 'No se eligió ningún archivo.' };
    if (file.size > MAX) return { ok: false, error: 'El archivo supera los 15 MB.' };
    const mime = file.type || 'application/octet-stream';
    if (!OK.test(mime)) return { ok: false, error: 'Ese tipo de archivo no se puede adjuntar. Probá con imágenes, PDF, Word, Excel, PowerPoint, texto, audio o ZIP.' };
    let uid = null; try { const s = await c.auth.getSession(); uid = s.data && s.data.session && s.data.session.user.id; } catch (_) {}
    if (!uid) return { ok: false, error: 'Iniciá sesión para adjuntar archivos.' };
    const limpio = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const path = uid + '/chat_' + Date.now() + '_' + limpio;
    let bucket = 'chat-files';
    let r = await c.storage.from(bucket).upload(path, file, { contentType: mime, upsert: false });
    if (r.error && /bucket|not found/i.test(r.error.message || '')) {          // todavía no se ejecutó sql/chat_archivos.sql
      if (/^image\/(jpeg|png|webp|gif)$|^application\/pdf$/.test(mime) && file.size <= 8 * 1024 * 1024) { bucket = 'forum-files'; r = await c.storage.from(bucket).upload(path, file, { contentType: mime, upsert: false }); }
      else return { ok: false, error: 'Para adjuntar este tipo de archivo falta ejecutar sql/chat_archivos.sql en Supabase. Mientras tanto podés enviar imágenes y PDF.' };
    }
    if (r.error) return { ok: false, error: r.error.message || 'No se pudo subir el archivo.' };
    const { data } = c.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, name: file.name, size: file.size, mime };
  }

  const marca = (a) => '[[adj:' + encodeURIComponent(JSON.stringify({ u: a.url, n: String(a.name || '').slice(0, 80), s: a.size | 0, m: a.mime || '' })) + ']]';
  function parse(texto) {
    const m = /\[\[adj:([^\]]+)\]\]/.exec(String(texto || '')); if (!m) return null;
    try {
      const a = JSON.parse(decodeURIComponent(m[1])); const u = new URL(a.u);
      if (u.protocol !== 'https:' || !/\.supabase\.co$/.test(u.hostname) || !/\/storage\/v1\//.test(u.pathname)) return null;   // solo archivos propios del sitio
      return { adj: { url: u.href, name: String(a.n || 'archivo'), size: Number(a.s) || 0, mime: String(a.m || '') }, resto: String(texto).replace(m[0], '').trim() };
    } catch (_) { return null; }
  }
  function html(a) {
    if (/^image\//.test(a.mime)) return '<a class="ca-img" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(a.url) + '" alt="' + esc(a.name) + '" loading="lazy" onerror="this.parentNode.outerHTML=&quot;<span class=ca-venc>🕓 Imagen vencida (se borra a los 30 días)</span>&quot;"></a>';
    return '<a class="ca-file" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer" download="' + esc(a.name) + '"><span class="ca-ico">' + icono(a.mime) + '</span><span class="ca-meta"><b>' + esc(a.name) + '</b><small>' + tam(a.size) + '</small></span><i>⬇</i></a>';
  }
  // Limpieza: cada persona borra de su carpeta los adjuntos de chat con más de 30 días (una vez al día por dispositivo)
  async function limpiarViejos() {
    try {
      const c = sb(); if (!c) return;
      if (Date.now() - Number(localStorage.getItem('nika_chat_limpieza') || 0) < 20 * 3600 * 1000) return;
      const s = await c.auth.getSession(), uid = s.data && s.data.session && s.data.session.user.id; if (!uid) return;
      localStorage.setItem('nika_chat_limpieza', String(Date.now()));
      for (const b of ['chat-files', 'forum-files']) {
        const r = await c.storage.from(b).list(uid, { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } });
        const viejos = (r.data || []).filter((f) => /^chat_/.test(f.name) && f.created_at && Date.now() - new Date(f.created_at).getTime() > DIAS_VIDA * 86400000).map((f) => uid + '/' + f.name);
        if (viejos.length) await c.storage.from(b).remove(viejos);
      }
    } catch (_) {}
  }
  setTimeout(() => { try { if (window.NikaSupabase && NikaSupabase.ready) NikaSupabase.ready.then(limpiarViejos).catch(() => {}); } catch (_) {} }, 12000);
  const textoVista = (a) => '📎 ' + a.name;

  const CSS = `
  .ca-img{display:block;margin:2px 0 4px;border-radius:12px;overflow:hidden;max-width:230px}.ca-img img{display:block;width:100%;max-height:200px;object-fit:cover;transition:transform .25s}.ca-img:hover img{transform:scale(1.04)}
  .ca-file{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:2px 0 4px;border-radius:12px;background:rgba(0,0,0,.14);color:inherit!important;text-decoration:none!important;min-width:190px;max-width:260px;transition:background .2s,transform .2s}
  .ca-file:hover{background:rgba(0,0,0,.24);transform:translateY(-1px)}.ca-ico{font-size:1.6rem;line-height:1}.ca-meta{min-width:0;flex:1}.ca-meta b{display:block;font-size:.78rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ca-meta small{font-size:.66rem;opacity:.75;font-weight:700}.ca-file i{font-style:normal;opacity:.8}
  .ca-venc{display:inline-block;padding:6px 10px;border-radius:10px;background:rgba(0,0,0,.14);font-size:.74rem;font-weight:700}
  .ca-menu{position:fixed;z-index:10020;min-width:210px;padding:6px;border-radius:14px;background:var(--card-bg,#fff);color:var(--text-main,#0f172a);border:1px solid var(--border,#e2e8f0);box-shadow:0 18px 40px -12px rgba(0,0,0,.5);font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:caIn .16s both}
  body.dark-mode .ca-menu{background:#0f1c34;color:#e2e8f0;border-color:rgba(148,163,184,.3)}
  .ca-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:0;border-radius:9px;background:transparent;color:inherit;font:700 .82rem 'Plus Jakarta Sans',sans-serif;text-align:left;cursor:pointer}.ca-menu button:hover{background:rgba(2,132,199,.14)}.ca-menu button span{font-size:1.1rem;width:22px;text-align:center}
  .ca-soltar{position:absolute;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(2,132,199,.82);color:#fff;font:800 1rem 'Plus Jakarta Sans',sans-serif;border-radius:inherit;pointer-events:none}.ca-soltar.on{display:flex;animation:caIn .15s both}
  @keyframes caIn{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.ca-menu,.ca-soltar.on{animation:none!important}}`;
  function estilos() { if (document.getElementById('ca-css')) return; const s = document.createElement('style'); s.id = 'ca-css'; s.textContent = CSS; document.head.appendChild(s); }

  // Menú 📎. opt.onFile(file) · opt.onTexto(texto) (compartir tema / progreso / enlace)
  function menu(btn, opt) {
    estilos();
    const input = document.createElement('input'); input.type = 'file'; input.hidden = true; input.addEventListener('change', () => { const f = input.files && input.files[0]; input.value = ''; if (f && opt.onFile) opt.onFile(f); });
    document.body.appendChild(input);
    let abierto = null;
    const cerrar = () => { if (abierto) { abierto.remove(); abierto = null; } };
    document.addEventListener('click', (e) => { if (abierto && !abierto.contains(e.target) && !btn.contains(e.target)) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); if (abierto) return cerrar();
      const m = document.createElement('div'); m.className = 'ca-menu'; m.setAttribute('role', 'menu');
      const it = (ico, txt, fn) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<span>' + ico + '</span>' + txt; b.onclick = (ev) => { ev.stopPropagation(); cerrar(); fn(); }; m.appendChild(b); };
      it('📄', 'Archivo (PDF, Word, Excel…)', () => { input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,audio/*'; input.click(); });
      it('🖼️', 'Foto o imagen', () => { input.accept = 'image/*'; input.click(); });
      let tema = ''; try { const E = window.PomodoroEngine; tema = E && E.formatTema ? E.formatTema(E.getState()) : ''; } catch (_) {}
      if (tema) it('📚', 'Compartir el tema que estoy estudiando', () => opt.onTexto && opt.onTexto('📚 Estoy estudiando: ' + tema));
      it('⏱️', 'Compartir mi progreso de hoy', () => {
        let min = 0; try { min = window.PomodoroEngine.getTodayMinutes() || 0; } catch (_) {}
        const h = min >= 60 ? Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + (min % 60) + ' min' : '') : min + ' min';
        opt.onTexto && opt.onTexto('⏱️ Hoy llevo ' + h + ' de estudio 🍅');
      });
      it('🔗', 'Pegar un enlace', () => { const u = prompt('Pegá el enlace que querés compartir:'); if (u && /^https?:\/\//i.test(u.trim())) opt.onTexto && opt.onTexto('🔗 ' + u.trim()); else if (u) alert('El enlace tiene que empezar con http:// o https://'); });
      const nota = document.createElement('small'); nota.style.cssText = 'display:block;padding:6px 12px 4px;font-size:.66rem;font-weight:600;opacity:.65'; nota.textContent = 'Los archivos se borran solos a los 30 días.'; m.appendChild(nota);
      document.body.appendChild(m); abierto = m;
      const r = btn.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
      m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px'; m.style.top = Math.max(8, r.top - h - 8) + 'px';
    });
  }
  // Arrastrar y soltar + pegar imágenes en el campo de texto
  function soltar(el, onFile, input) {
    estilos();
    const cap = document.createElement('div'); cap.className = 'ca-soltar'; cap.textContent = '📎 Soltá el archivo para enviarlo'; el.appendChild(cap);
    let n = 0;
    el.addEventListener('dragenter', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { n++; cap.classList.add('on'); } });
    el.addEventListener('dragleave', () => { n = Math.max(0, n - 1); if (!n) cap.classList.remove('on'); });
    el.addEventListener('dragover', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
    el.addEventListener('drop', (e) => { n = 0; cap.classList.remove('on'); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { e.preventDefault(); onFile(f); } });
    if (input) input.addEventListener('paste', (e) => { const it = [...((e.clipboardData && e.clipboardData.items) || [])].find((x) => x.kind === 'file'); if (it) { const f = it.getAsFile(); if (f) { e.preventDefault(); onFile(f); } } });
  }

  window.NikaChatAdj = { subir, marca, parse, html, menu, soltar, textoVista, estilos };
})();
