/* Campus Nika — Redes sociales del perfil (catálogo, editor y render público).
   Instagram y WhatsApp siguen en sus columnas (instagram / whatsapp); el resto vive en profiles.redes (jsonb). */
(function () {
  'use strict';
  const ICON = (slug) => `https://cdn.simpleicons.org/${slug}/ffffff`;

  const CATALOGO = [
    { key: 'instagram', nombre: 'Instagram', slug: 'instagram', bg: 'linear-gradient(45deg,#feda75,#fa7e1e 30%,#d62976 60%,#4f5bd5)', ph: '@tuusuario', url: (h) => `https://instagram.com/${h}` },
    { key: 'whatsapp', nombre: 'WhatsApp', slug: 'whatsapp', bg: '#25D366', ph: 'Con código de país: 5493442000000', url: (h) => `https://wa.me/${h.replace(/\D/g, '')}`, limpiar: (h) => h.replace(/[^\d+]/g, '') },
    { key: 'tiktok', nombre: 'TikTok', slug: 'tiktok', bg: 'linear-gradient(135deg,#010101,#25f4ee 140%)', ph: '@tuusuario', url: (h) => `https://tiktok.com/@${h}` },
    { key: 'youtube', nombre: 'YouTube', slug: 'youtube', bg: '#FF0000', ph: '@tucanal o link del canal', url: (h) => `https://youtube.com/@${h}` },
    { key: 'x', nombre: 'X', slug: 'x', bg: '#000000', ph: '@tuusuario', url: (h) => `https://x.com/${h}` },
    { key: 'facebook', nombre: 'Facebook', slug: 'facebook', bg: '#1877F2', ph: 'usuario o link del perfil', url: (h) => `https://facebook.com/${h}` },
    { key: 'linkedin', nombre: 'LinkedIn', slug: 'linkedin', bg: '#0A66C2', ph: 'usuario o link del perfil', url: (h) => `https://linkedin.com/in/${h}` },
    { key: 'twitch', nombre: 'Twitch', slug: 'twitch', bg: '#9146FF', ph: 'tucanal', url: (h) => `https://twitch.tv/${h}` },
    { key: 'telegram', nombre: 'Telegram', slug: 'telegram', bg: '#26A5E4', ph: '@tuusuario', url: (h) => `https://t.me/${h}` },
    { key: 'spotify', nombre: 'Spotify', slug: 'spotify', bg: '#1DB954', ph: 'link de tu perfil o usuario', url: (h) => `https://open.spotify.com/user/${h}` },
    { key: 'github', nombre: 'GitHub', slug: 'github', bg: '#24292f', ph: 'tuusuario', url: (h) => `https://github.com/${h}` },
  ];
  const POR_KEY = Object.fromEntries(CATALOGO.map(r => [r.key, r]));
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function badge(key) {
    const r = POR_KEY[key]; if (!r) return '';
    return `<span class="rs-badge" style="background:${r.bg}"><img src="${ICON(r.slug)}" alt="" loading="lazy" onerror="this.style.display='none'"></span>`;
  }

  // Devuelve un link seguro (solo http/https) a partir de lo que escribió el usuario
  function linkPara(key, valor) {
    const r = POR_KEY[key]; let v = String(valor || '').trim(); if (!r || !v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    v = v.replace(/^@/, '').replace(/^\/+/, '');
    if (key === 'whatsapp') return /\d/.test(v) ? r.url(v) : null;
    return r.url(encodeURIComponent(v).replace(/%2F/gi, '/'));
  }

  // ---------- Editor ----------
  let _cont = null, _vals = {};

  function _pintar() {
    if (!_cont) return;
    const usadas = CATALOGO.filter(r => r.key in _vals);
    const libres = CATALOGO.filter(r => !(r.key in _vals));
    _cont.innerHTML =
      `<div class="rs-lista">${usadas.map(r => `
        <div class="rs-fila" data-key="${r.key}">
          ${badge(r.key)}
          <input type="text" class="rs-input" data-key="${r.key}" value="${esc(_vals[r.key])}" placeholder="${esc(r.ph)}" maxlength="120" autocomplete="off" aria-label="${esc(r.nombre)}">
          <button type="button" class="rs-quitar" data-quitar="${r.key}" title="Quitar ${esc(r.nombre)}" aria-label="Quitar ${esc(r.nombre)}">✕</button>
        </div>`).join('') || '<p class="rs-vacio">Todavía no agregaste ninguna red. Elegí una abajo 👇</p>'}</div>` +
      (libres.length ? `<div class="rs-add-tit">Agregar red</div><div class="rs-chips">${libres.map(r => `
        <button type="button" class="rs-chip" data-add="${r.key}">${badge(r.key)}<span>${esc(r.nombre)}</span><b>＋</b></button>`).join('')}</div>` : '');
  }

  function montarEditor(contenedor, valores) {
    _cont = contenedor; _vals = {};
    Object.keys(valores || {}).forEach(k => { if (POR_KEY[k] && valores[k]) _vals[k] = String(valores[k]); });
    if (!_cont.dataset.listo) {
      _cont.dataset.listo = '1';
      _cont.addEventListener('click', (e) => {
        const add = e.target.closest('[data-add]'), del = e.target.closest('[data-quitar]');
        if (add) { _vals[add.dataset.add] = ''; _pintar(); const i = _cont.querySelector(`.rs-input[data-key="${add.dataset.add}"]`); if (i) i.focus(); _avisar(); }
        if (del) { delete _vals[del.dataset.quitar]; _pintar(); _avisar(); }
      });
      _cont.addEventListener('input', (e) => { const i = e.target.closest('.rs-input'); if (i) { _vals[i.dataset.key] = i.value; _avisar(); } });
    }
    _pintar();
  }
  function _avisar() { if (typeof window.actualizarProgresoModalPerfil === 'function') window.actualizarProgresoModalPerfil(); }

  // { instagram: '...', tiktok: '...' } solo con las redes que tienen valor
  function valores() {
    const out = {};
    Object.keys(_vals).forEach(k => { const v = String(_vals[k] || '').trim(); if (v) out[k] = v; });
    return out;
  }

  // ---------- Perfil público ----------
  function pintarPublico(fila, valoresPerfil) {
    if (!fila) return false;
    fila.querySelectorAll('a.pp-social-link').forEach(a => a.remove());
    let hay = false;
    CATALOGO.forEach(r => {
      const href = linkPara(r.key, valoresPerfil && valoresPerfil[r.key]); if (!href) return;
      const a = document.createElement('a');
      a.className = 'pp-social-link'; a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.title = r.nombre;
      a.innerHTML = badge(r.key) + `<span>${esc(r.nombre)}</span>`;
      fila.insertBefore(a, fila.querySelector('#pp-redes-empty'));
      hay = true;
    });
    return hay;
  }

  // Une las columnas sueltas (instagram/whatsapp) con profiles.redes
  function desdePerfil(p) {
    const o = Object.assign({}, (p && p.redes && typeof p.redes === 'object') ? p.redes : {});
    if (p && p.instagram) o.instagram = p.instagram;
    if (p && p.whatsapp) o.whatsapp = p.whatsapp;
    return o;
  }
  // Separa para guardar: columnas instagram/whatsapp + jsonb con el resto
  function paraGuardar() {
    const v = valores(), redes = {};
    Object.keys(v).forEach(k => { if (k !== 'instagram' && k !== 'whatsapp') redes[k] = v[k]; });
    return { instagram: v.instagram || '', whatsapp: v.whatsapp || '', redes };
  }

  window.NikaRedes = { CATALOGO, montarEditor, valores, pintarPublico, desdePerfil, paraGuardar, linkPara, badge };
})();
