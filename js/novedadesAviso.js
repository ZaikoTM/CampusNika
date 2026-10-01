/* Campus Nika — Avisos de Novedades del tablero.
   - Badge rojo animado junto a "Novedades" en el menú lateral hasta que el usuario entra a leerlas.
   - Banner flotante global cuando se publica una novedad (tiempo real + chequeo periódico).
   Cerrar el banner NO apaga el badge: solo lo apaga abrir la sección (marcarVistas). */
(function () {
  'use strict';
  const LS_VISTO = 'nika_novedades_visto';        // created_at (ISO) de la última novedad leída
  const LS_DESCARTADA = 'nika_novedades_banner';  // id de la novedad cuyo banner se cerró
  let _ultima = null, _sinLeer = 0, _canal = null, _iniciado = false;

  const cliente = () => window.NikaSupabase && window.NikaSupabase.client;
  const leer = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function pintarBadge() {
    const b = document.getElementById('news-unread-badge'); if (!b) return;
    b.textContent = _sinLeer > 9 ? '9+' : String(_sinLeer);
    b.style.display = _sinLeer > 0 ? 'inline-flex' : 'none';
  }

  function cerrarBanner(descartar) {
    const el = document.getElementById('news-banner'); if (!el) return;
    if (descartar && el.dataset.id) guardar(LS_DESCARTADA, el.dataset.id);
    el.classList.remove('is-in'); setTimeout(() => el.remove(), 300);
  }

  function mostrarBanner(n) {
    if (!n || document.getElementById('news-banner')) return;
    if (leer(LS_DESCARTADA) === String(n.id)) return;
    const el = document.createElement('div');
    el.id = 'news-banner'; el.dataset.id = n.id; el.setAttribute('role', 'alert');
    el.innerHTML = '<button type="button" class="nb-main" aria-label="Ver la novedad"><span class="nb-ico">📢</span><span class="nb-txt"><strong>Nueva Novedad en el tablero</strong><em>' + esc(n.title || 'Tocá para verla') + '</em></span></button><button type="button" class="nb-x" aria-label="Descartar">✕</button>';
    el.querySelector('.nb-main').addEventListener('click', () => { cerrarBanner(true); if (typeof window.openNewsModal === 'function') window.openNewsModal(); });
    el.querySelector('.nb-x').addEventListener('click', (e) => { e.stopPropagation(); cerrarBanner(true); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
  }

  async function revisar(mostrar) {
    const c = cliente(); if (!c || !leer('nika_currentUser')) return;
    try {
      const { data, error } = await c.from('novedades').select('id, title, created_at').order('created_at', { ascending: false }).limit(20);
      if (error || !data) return;
      _ultima = data[0] || null;
      const visto = leer(LS_VISTO);
      if (!visto) { if (_ultima) guardar(LS_VISTO, _ultima.created_at); _sinLeer = 0; }   // primera vez: se cuenta desde ahora
      else _sinLeer = data.filter(n => n.created_at > visto).length;
      pintarBadge();
      if (mostrar && _sinLeer > 0) mostrarBanner(_ultima);
    } catch (_) {}
  }

  function marcarVistas() {
    if (_ultima) guardar(LS_VISTO, _ultima.created_at);
    _sinLeer = 0; pintarBadge(); cerrarBanner(true);
  }

  function iniciar() {
    const c = cliente(); if (_iniciado || !c) return;
    _iniciado = true;
    revisar(true);
    try {
      _canal = c.channel('novedades_aviso').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'novedades' }, (p) => {
        const n = p && p.new; if (!n) return;
        const modal = document.getElementById('news-modal');
        if (modal && getComputedStyle(modal).display !== 'none') { _ultima = n; marcarVistas(); return; }   // la está leyendo
        _ultima = n; _sinLeer++; pintarBadge(); mostrarBanner(n);
      }).subscribe();
    } catch (_) {}
    setInterval(() => { if (!document.hidden) revisar(true); }, 90000);   // respaldo si no hay tiempo real
    document.addEventListener('visibilitychange', () => { if (!document.hidden) revisar(true); });
  }

  window.NikaNovedades = { iniciar, marcarVistas, revisar };
})();
