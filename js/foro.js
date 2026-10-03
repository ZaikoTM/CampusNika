// js/foro.js
// CAMPUS NIKA — Foro Académico como muro comunitario (feed social)
//
// Publicaciones con adjunto (imagen/PDF), reacciones médicas (👍 Útil · ❤️ Excelente caso · 💡 Buena duda),
// comentarios en hilo anidado, compartir por chat privado y vista inmersiva a pantalla completa.
// Datos: forum_threads / forum_replies / forum_reactions (ver sql/foro_feed.sql) vía NikaSocial (js/social.js).

const NikaForo = (() => {
  const MATERIAS = { cirugia: 'Cirugía', ginecologia: 'Ginecología', siam: 'S.I.A.M.' };
  const UPS = ['general', ...Array.from({ length: 11 }, (_, i) => 'up' + (i + 1))];
  const REACCIONES = [
    { tipo: 'util', icono: '👍', label: 'Útil' },
    { tipo: 'excelente', icono: '❤️', label: 'Excelente caso' },
    { tipo: 'duda', icono: '💡', label: 'Buena duda' },
  ];
  const MAX_PROF = 5;

  let posts = [];
  let reacc = {};        // threadId -> { util: {n, mine}, excelente: {...}, duda: {...} }
  let filtro = '';       // '' = todas las materias
  let yo = null;
  let adjunto = null;    // File pendiente de subir
  let construido = false;
  let inmersivoId = null;
  let cargaId = 0;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); };
  const avatarDef = () => (window.NikaSocial && window.NikaSocial.DEFAULT_AVATAR) || 'assets/N%20NIKA.png';

  function linkify(texto) {
    return esc(texto).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br>');
  }
  function hace(fecha) {
    const d = new Date(fecha); if (isNaN(d)) return '';
    const m = Math.floor((Date.now() - d) / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `hace ${m} min`;
    if (m < 1440) return `hace ${Math.floor(m / 60)} h`;
    if (m < 43200) return `hace ${Math.floor(m / 1440)} d`;
    return d.toLocaleDateString('es-AR');
  }
  function rango(role) {
    return typeof window._rangoTarjetaAmigo === 'function' ? window._rangoTarjetaAmigo(role) : { label: '', clase: 'rank-free' };
  }
  const bloqueado = (uid) => !!(window.NikaModeracion && window.NikaModeracion.estaBloqueado && window.NikaModeracion.estaBloqueado(uid));

  // ---------------------------------------------------------------- vista
  function ocultarOtras() {
    ['dashboard-hero-section', 'modulos-section', 'admin-dashboard-section', 'liga-section', 'ateneos-section'].forEach((id) => {
      const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
  }

  async function abrir() {
    if (!localStorage.getItem('nika_currentUser')) { alert('Iniciá sesión para entrar al Foro Académico.'); return; }
    const sec = $('#foro-section');
    if (!sec) return;
    ocultarOtras();
    sec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth <= 900 && typeof window.toggleSidebar === 'function' && document.getElementById('appSidebar')?.classList.contains('sidebar-open')) window.toggleSidebar();
    construir();
    await cargar();
  }

  function volver() {
    // Ya no viven dentro del campus: cada una es su propia página
    window.location.href = 'campus.html';
  }

  // ---------------------------------------------------------------- caja de publicación
  function construir() {
    if (construido) { actualizarAvatarCompose(); return; }
    construido = true;
    const cont = $('#foro-compose');
    cont.innerHTML = `
      <div class="fr-compose-top">
        <img id="fr-compose-avatar" class="fr-avatar" alt="">
        <textarea id="fr-texto" rows="3" maxlength="5000" placeholder="¿Qué caso clínico, duda o apunte querés compartir con la comunidad?"></textarea>
      </div>
      <input type="text" id="fr-titulo" class="fr-titulo-in" maxlength="120" placeholder="Título (opcional: si lo dejás vacío se usa la primera línea)">
      <div id="fr-adjunto-chip" class="fr-chip-adj" style="display:none;"></div>
      <div class="fr-compose-bar">
        <select id="fr-materia" aria-label="Materia">${Object.entries(MATERIAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
        <select id="fr-up" aria-label="Unidad problema">${UPS.map((u) => `<option value="${u}">${u === 'general' ? 'General' : u.toUpperCase().replace('UP', 'UP ')}</option>`).join('')}</select>
        <label class="fr-btn-adj" title="Adjuntar imagen o PDF (máx. 8 MB)">📎 Adjuntar<input type="file" id="fr-file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" hidden></label>
        <button type="button" class="fr-publicar" id="fr-publicar" onclick="NikaForo.publicar()">Publicar 📝</button>
      </div>`;
    $('#fr-file').addEventListener('change', (e) => {
      const f = e.target.files[0]; e.target.value = '';
      if (!f) return;
      if (f.size > 8 * 1024 * 1024) { toast('El archivo supera los 8 MB.'); return; }
      adjunto = f; pintarAdjunto();
    });
    // Filtro de materia
    const chips = $('#foro-filtros');
    chips.innerHTML = [['', 'Todas'], ...Object.entries(MATERIAS)].map(([k, v]) => `<button type="button" class="fr-filtro ${k === filtro ? 'on' : ''}" data-m="${k}">${v}</button>`).join('');
    chips.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      filtro = b.dataset.m; chips.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); cargar();
    }));
    actualizarAvatarCompose();
  }

  function actualizarAvatarCompose() {
    let av = avatarDef();
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || '{}'); if (u.avatar) av = u.avatar; } catch (_) {}
    const img = $('#fr-compose-avatar'); if (img) img.src = av;
  }

  function pintarAdjunto() {
    const chip = $('#fr-adjunto-chip');
    if (!adjunto) { chip.style.display = 'none'; chip.innerHTML = ''; return; }
    chip.style.display = 'flex';
    chip.innerHTML = `<span>${adjunto.type === 'application/pdf' ? '📄' : '🖼️'} ${esc(adjunto.name)}</span><button type="button" aria-label="Quitar adjunto" onclick="NikaForo.quitarAdjunto()">✕</button>`;
  }
  function quitarAdjunto() { adjunto = null; pintarAdjunto(); }

  async function publicar() {
    const texto = $('#fr-texto').value.trim();
    if (!texto) { toast('Escribí tu caso, duda o apunte antes de publicar.'); return; }
    const btn = $('#fr-publicar');
    btn.disabled = true; btn.textContent = 'Publicando...';
    try {
      let extra = null;
      if (adjunto) {
        const up = await NikaSocial.subirAdjuntoForo(adjunto);
        if (!up.ok) { toast(up.error || 'No se pudo subir el archivo.'); return; }
        extra = { attachment_url: up.url, attachment_name: up.name, attachment_type: up.type };
      }
      const primera = texto.split('\n')[0];
      const titulo = ($('#fr-titulo').value.trim() || primera).slice(0, 120);
      const res = await NikaSocial.crearHiloForo($('#fr-materia').value, $('#fr-up').value, titulo, texto, extra);
      if (!res.ok) { toast(res.error || 'No se pudo publicar.'); return; }
      if (res.aviso) toast(res.aviso);
      $('#fr-texto').value = ''; $('#fr-titulo').value = ''; adjunto = null; pintarAdjunto();
      toast('¡Publicado!');
      await cargar();
    } finally {
      btn.disabled = false; btn.textContent = 'Publicar 📝';
    }
  }

  // ---------------------------------------------------------------- feed
  async function cargar() {
    const feed = $('#foro-feed'); if (!feed) return;
    const mi = ++cargaId;
    feed.innerHTML = '<div class="fr-skel"></div><div class="fr-skel"></div><div class="fr-skel"></div>';
    try {
      if (window.NikaAuth && window.NikaAuth.ready) yo = await window.NikaAuth.ready;
      else { const { data: { user } } = await window.NikaSupabase.client.auth.getUser(); yo = user ? user.id : null; }
    } catch (_) {}
    const res = await NikaSocial.cargarHilosForo(filtro || null);
    if (mi !== cargaId) return;
    if (!res.ok) { feed.innerHTML = `<div class="fr-vacio">No se pudo cargar el muro (${esc(res.error || 'error')}).</div>`; return; }
    posts = res.data.filter((t) => !bloqueado(t.user_id));
    const r = await NikaSocial.cargarReaccionesForo(posts.map((t) => t.id));
    if (mi !== cargaId) return;
    reacc = {};
    (r.data || []).forEach((x) => {
      const o = reacc[x.thread_id] = reacc[x.thread_id] || {};
      const c = o[x.tipo] = o[x.tipo] || { n: 0, mine: false };
      c.n++; if (x.user_id === yo) c.mine = true;
    });
    renderFeed();
    abrirDesdeHash();
  }

  function renderFeed() {
    const feed = $('#foro-feed');
    const tot = $('#foro-total'); if (tot) { tot.textContent = posts.length; const tt = $('#foro-total-t'); if (tt) tt.textContent = posts.length === 1 ? 'publicación' : 'publicaciones'; }
    if (!posts.length) { feed.innerHTML = '<div class="fr-vacio-grande"><span class="ico">🩺</span><b>Todavía no hay publicaciones</b>¡Compartí el primer caso clínico o duda de esta materia!</div>'; return; }
    feed.innerHTML = posts.map((t) => postHtml(t, 'f')).join('');
  }

  function adjuntoHtml(t) {
    if (!t.attachment_url) return '';
    const url = esc(t.attachment_url);
    if (t.attachment_type === 'image') return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="fr-img-wrap"><img src="${url}" alt="${esc(t.attachment_name || 'Imagen adjunta')}" loading="lazy"></a>`;
    return `<a class="fr-pdf" href="${url}" target="_blank" rel="noopener noreferrer">📄 <span>${esc(t.attachment_name || 'Documento PDF')}</span><em>Abrir</em></a>`;
  }

  function reaccionesHtml(t) {
    const r = reacc[t.id] || {};
    return `<div class="fr-reacts">${REACCIONES.map((x) => {
      const c = r[x.tipo] || { n: 0, mine: false };
      return `<button type="button" class="fr-react ${c.mine ? 'on' : ''}" data-r="${t.id}:${x.tipo}" onclick="NikaForo.reaccionar('${t.id}', '${x.tipo}')" title="${x.label}">${x.icono} <span>${x.label}</span> <b>${c.n || ''}</b></button>`;
    }).join('')}</div>`;
  }

  function postHtml(t, ctx) {
    const autor = t.profiles?.fullname || 'Estudiante Nika';
    const rg = rango(t.profiles?.role);
    const av = esc(t.profiles?.avatar || avatarDef());
    const nCom = Array.isArray(t.forum_replies) && t.forum_replies[0] ? t.forum_replies[0].count : 0;
    const materia = MATERIAS[t.module] || t.module || '';
    const up = t.up_id && t.up_id !== 'general' ? String(t.up_id).toUpperCase().replace('UP', 'UP ') : 'General';
    const inm = ctx === 'i';
    return `
    <article class="fr-post ${inm ? 'fr-post--inm' : ''}" id="fr-post-${ctx}-${t.id}" data-m="${esc(t.module)}" data-nika-item="1">
      <header class="fr-post-h">
        <img src="${av}" class="fr-avatar" alt="" onclick="abrirPerfilPublico('${esc(t.user_id)}')" title="Ver perfil">
        <div class="fr-autor">
          <strong class="social-name ${rg.clase}" onclick="abrirPerfilPublico('${esc(t.user_id)}')">${esc(autor)}</strong>
          <span class="social-rank-badge ${rg.clase}">${esc(rg.label)}</span>
          <small>${hace(t.created_at)}</small>
        </div>
        <div class="fr-tags"><span>${esc(materia)}</span><span>${esc(up)}</span></div>
      </header>
      <h3 class="fr-title">${esc(t.title)}</h3>
      <div class="fr-body">${linkify(t.content)}</div>
      ${adjuntoHtml(t)}
      ${reaccionesHtml(t)}
      <footer class="fr-actions">
        <button type="button" onclick="NikaForo.alternarComentarios('${t.id}', '${ctx}')">💬 <span class="fr-ccount" data-c="${t.id}">${nCom}</span> comentario${nCom === 1 ? '' : 's'}</button>
        <button type="button" onclick="NikaForo.compartir('${t.id}', this)">↗ Compartir</button>
        ${inm ? '' : `<button type="button" onclick="NikaForo.inmersivo('${t.id}')">⤢ Expandir</button>`}
      </footer>
      <div class="fr-comments" id="fr-com-${ctx}-${t.id}" style="display:${inm ? 'block' : 'none'};"></div>
    </article>`;
  }

  // ---------------------------------------------------------------- reacciones
  async function reaccionar(threadId, tipo) {
    if (!yo) { toast('Iniciá sesión para reaccionar.'); return; }
    const o = reacc[threadId] = reacc[threadId] || {};
    const c = o[tipo] = o[tipo] || { n: 0, mine: false };
    const activa = c.mine;
    c.mine = !activa; c.n += activa ? -1 : 1;           // optimista
    repintarReacciones(threadId);
    const res = await NikaSocial.alternarReaccionForo(threadId, tipo, activa);
    if (!res.ok) {                                       // revierte si falló
      c.mine = activa; c.n += activa ? 1 : -1;
      repintarReacciones(threadId);
      toast(/relation|does not exist/i.test(res.error || '') ? 'Falta ejecutar sql/foro_feed.sql en Supabase.' : (res.error || 'No se pudo reaccionar.'));
    }
  }
  function repintarReacciones(threadId) {
    const t = posts.find((p) => String(p.id) === String(threadId)); if (!t) return;
    document.querySelectorAll(`[id^="fr-post-"][id$="-${threadId}"] .fr-reacts`).forEach((el) => { el.outerHTML = reaccionesHtml(t); });
  }

  // ---------------------------------------------------------------- comentarios anidados
  async function alternarComentarios(threadId, ctx) {
    const box = document.getElementById(`fr-com-${ctx}-${threadId}`);
    if (!box) return;
    if (box.style.display !== 'none' && box.dataset.cargado === '1') { box.style.display = 'none'; return; }
    box.style.display = 'block';
    await pintarComentarios(threadId, ctx);
  }

  async function pintarComentarios(threadId, ctx) {
    const box = document.getElementById(`fr-com-${ctx}-${threadId}`);
    if (!box) return;
    box.innerHTML = '<div class="fr-vacio">Cargando comentarios...</div>';
    const res = await NikaSocial.cargarRespuestasHilo(threadId);
    const filas = res.ok ? res.data.filter((r) => !bloqueado(r.user_id)) : [];
    const hijos = {};
    filas.forEach((r) => { const k = r.parent_id || 0; (hijos[k] = hijos[k] || []).push(r); });
    const ids = new Set(filas.map((r) => r.id));
    // Un comentario cuyo padre no está (borrado o de un usuario bloqueado) se muestra como raíz
    filas.forEach((r) => { if (r.parent_id && !ids.has(r.parent_id)) (hijos[0] = hijos[0] || []).push(r); });
    const raices = (hijos[0] || []).filter((r, i, a) => a.indexOf(r) === i);

    const arbol = (lista, prof) => lista.map((c) => {
      const rg = rango(c.profiles?.role);
      return `
      <div class="fr-c" style="--d:${Math.min(prof, MAX_PROF)};" data-nika-item="1">
        <img src="${esc(c.profiles?.avatar || avatarDef())}" class="fr-avatar fr-avatar--sm" alt="" onclick="abrirPerfilPublico('${esc(c.user_id)}')">
        <div class="fr-c-main">
          <div class="fr-c-bub">
            <strong class="social-name ${rg.clase}" onclick="abrirPerfilPublico('${esc(c.user_id)}')">${esc(c.profiles?.fullname || 'Estudiante Nika')}</strong>
            <small>${hace(c.created_at)}</small>
            <p>${linkify(c.content)}</p>
          </div>
          <button type="button" class="fr-c-resp" onclick="NikaForo.abrirRespuesta('${ctx}', '${threadId}', '${c.id}')">↩ Responder</button>
          <div class="fr-c-form" id="fr-rf-${ctx}-${c.id}" style="display:none;"></div>
          ${(hijos[c.id] || []).length ? arbol(hijos[c.id], prof + 1) : ''}
        </div>
      </div>`;
    }).join('');

    box.dataset.cargado = '1';
    box.innerHTML = `
      ${raices.length ? arbol(raices, 0) : '<div class="fr-vacio fr-vacio--sm">Sin comentarios todavía. ¡Abrí el debate!</div>'}
      <div class="fr-c-nuevo">
        <input type="text" id="fr-in-${ctx}-${threadId}-0" placeholder="Escribí un comentario..." maxlength="1000" onkeydown="if(event.key==='Enter') NikaForo.responder('${ctx}', '${threadId}', 0)">
        <button type="button" onclick="NikaForo.responder('${ctx}', '${threadId}', 0)">Comentar</button>
      </div>`;
    // Contador real
    document.querySelectorAll(`.fr-ccount[data-c="${threadId}"]`).forEach((el) => { el.textContent = filas.length; });
  }

  function abrirRespuesta(ctx, threadId, parentId) {
    const f = document.getElementById(`fr-rf-${ctx}-${parentId}`); if (!f) return;
    if (f.style.display !== 'none') { f.style.display = 'none'; return; }
    f.style.display = 'flex';
    f.innerHTML = `<input type="text" id="fr-in-${ctx}-${threadId}-${parentId}" placeholder="Responder..." maxlength="1000" onkeydown="if(event.key==='Enter') NikaForo.responder('${ctx}', '${threadId}', '${parentId}')"><button type="button" onclick="NikaForo.responder('${ctx}', '${threadId}', '${parentId}')">Enviar</button>`;
    const inp = f.querySelector('input'); if (inp) inp.focus();
  }

  async function responder(ctx, threadId, parentId) {
    const inp = document.getElementById(`fr-in-${ctx}-${threadId}-${parentId}`);
    const txt = inp ? inp.value.trim() : '';
    if (!txt) return;
    inp.disabled = true;
    const res = await NikaSocial.responderHilo(threadId, txt, parentId || null);
    if (!res.ok) { inp.disabled = false; toast(/parent_id|column|schema cache/i.test(res.error || '') ? 'Falta ejecutar sql/foro_feed.sql para responder a comentarios.' : (res.error || 'No se pudo comentar.')); return; }
    await pintarComentarios(threadId, ctx);
    // Mantiene sincronizada la otra vista (feed/inmersiva) si también está abierta
    const otra = ctx === 'f' ? 'i' : 'f';
    const b2 = document.getElementById(`fr-com-${otra}-${threadId}`);
    if (b2 && b2.dataset.cargado === '1') pintarComentarios(threadId, otra);
  }

  // ---------------------------------------------------------------- compartir por chat privado
  async function compartir(threadId, btn) {
    document.querySelectorAll('.fr-share-menu').forEach((m) => m.remove());
    const t = posts.find((p) => String(p.id) === String(threadId)); if (!t) return;
    const menu = document.createElement('div');
    menu.className = 'fr-share-menu';
    menu.innerHTML = '<div class="fr-share-h">Enviar a un compañero</div><div class="fr-share-list"><div class="fr-vacio fr-vacio--sm">Cargando amigos...</div></div>';
    document.body.appendChild(menu);
    const r = btn.getBoundingClientRect();
    menu.style.top = Math.min(window.innerHeight - 320, Math.max(8, r.bottom + 6)) + 'px';
    menu.style.left = Math.max(8, Math.min(window.innerWidth - 268, r.left)) + 'px';
    const cerrar = (e) => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('mousedown', cerrar, true); } };
    setTimeout(() => document.addEventListener('mousedown', cerrar, true), 0);

    const lista = menu.querySelector('.fr-share-list');
    let amigos = [];
    try { amigos = await window.NikaFriends.listFriends(); } catch (_) {}
    if (!amigos.length) { lista.innerHTML = '<div class="fr-vacio fr-vacio--sm">Agregá amigos para poder enviarles publicaciones.</div>'; return; }
    lista.innerHTML = amigos.map((a) => `<button type="button" data-u="${esc(a.username)}"><img src="${esc(a.avatar || avatarDef())}" alt=""><span>${esc(a.fullname)}</span></button>`).join('');
    lista.querySelectorAll('button').forEach((b) => b.addEventListener('click', async () => {
      const enlace = `${location.origin}${location.pathname}#foro-${t.id}`;
      const msg = `📌 Te comparto una publicación del Foro Académico: «${t.title}»\n${enlace}`;
      b.disabled = true;
      try {
        if (!window.ChatManager) throw new Error('El chat privado no está disponible.');
        await window.ChatManager.enviarMensaje(b.dataset.u, msg);
        toast('Publicación enviada por chat privado.');
        menu.remove();
      } catch (err) { b.disabled = false; toast(err.message || 'No se pudo enviar.'); }
    }));
  }

  // ---------------------------------------------------------------- vista inmersiva
  function inmersivo(threadId) {
    const t = posts.find((p) => String(p.id) === String(threadId)); if (!t) return;
    inmersivoId = t.id;
    let ov = $('#foro-inmersivo');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'foro-inmersivo'; ov.className = 'modal-overlay fr-inm-overlay';
      ov.innerHTML = '<div class="fr-inm-card" role="dialog" aria-modal="true"><button type="button" class="fr-inm-x" aria-label="Cerrar" onclick="NikaForo.cerrarInmersivo()">✕ Cerrar</button><div id="fr-inm-body"></div></div>';
      ov.addEventListener('click', (e) => { if (e.target === ov) cerrarInmersivo(); });
      document.body.appendChild(ov);
    }
    $('#fr-inm-body').innerHTML = postHtml(t, 'i');
    ov.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    pintarComentarios(t.id, 'i');
  }
  function cerrarInmersivo() {
    const ov = $('#foro-inmersivo'); if (ov) ov.style.display = 'none';
    document.body.style.overflow = '';
    inmersivoId = null;
    if (location.hash.startsWith('#foro-')) history.replaceState(null, '', location.pathname + location.search);
  }

  // Enlace compartido: campus.html#foro-<id> abre el muro y expande esa publicación
  function abrirDesdeHash() {
    const m = location.hash.match(/^#foro-([0-9a-zA-Z-]+)$/);
    if (!m) return;
    if (posts.some((p) => String(p.id) === m[1])) inmersivo(m[1]);
  }
  function revisarHash() {
    if (/^#foro-[0-9a-zA-Z-]+$/.test(location.hash) && localStorage.getItem('nika_currentUser')) abrir();
  }
  window.addEventListener('hashchange', revisarHash);
  window.addEventListener('load', () => setTimeout(revisarHash, 600));

  return { abrir, volver, publicar, quitarAdjunto, reaccionar, alternarComentarios, abrirRespuesta, responder, compartir, inmersivo, cerrarInmersivo, cargar };
})();

window.NikaForo = NikaForo;
