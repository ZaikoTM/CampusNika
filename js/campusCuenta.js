/* Campus NikaMed · cuenta: chip del encabezado (avatar animado + nombre), menú desplegable, confirmación de salida e identidad del editor de perfil.
   Estilos: css/campus-cuenta.css (colores propios por tema). */
(function () {
  'use strict';
  if (window.NikaCuenta) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2338bdf8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
  const yo = () => { try { return JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) { return null; } };
  function rol(u) {
    if (u && u.role === 'admin') return '👑 Admin';
    try { if (window.NikaAcceso && window.NikaAcceso.esVip && window.NikaAcceso.esVip()) return '💜 NikaMed+'; } catch (_) {}
    return '🎓 Estudiante';
  }
  const avatarHtml = (u) => u && u.avatar ? `<img src="${esc(u.avatar)}" alt="" onerror="this.src='${AVATAR}'">` : `<span class="cu-ini">${esc(((u && (u.fullname || u.username)) || '?').trim().charAt(0).toUpperCase())}</span>`;

  // contenido del botón del encabezado cuando hay sesión
  function chipHtml(u, vipBadge) {
    return `<span class="cu-av">${avatarHtml(u)}<i class="cu-on" title="En línea"></i></span>`
      + `<span class="cu-tx"><b class="account-btn-name">${esc(u.fullname || u.username || 'Mi cuenta')}</b><small>@${esc(u.username || '')} <i>${esc(rol(u))}</i></small></span>${vipBadge || ''}`
      + `<svg class="cu-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
  }

  // ---------------------------------------------------------------- menú
  let menu = null;
  function armarMenu() {
    if (menu) return menu;
    menu = document.createElement('div'); menu.id = 'cu-menu'; menu.setAttribute('role', 'menu'); document.body.appendChild(menu);
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; cerrarMenu();
      if (a === 'perfil') window.openProfileModal && window.openProfileModal();
      else if (a === 'amigos') window.openFriendsModal && window.openFriendsModal();
      else if (a === 'avisos') window.NikaNotif && window.NikaNotif.abrirCentro('pref');
      else if (a === 'salir') confirmarSalida();
    });
    document.addEventListener('click', (e) => { if (menu.classList.contains('on') && !e.target.closest('#cu-menu') && !e.target.closest('#header-auth-btn')) cerrarMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });
    window.addEventListener('resize', cerrarMenu);
    return menu;
  }
  function pintarMenu() {
    const u = yo() || {};
    menu.innerHTML = `<div class="cu-m-cab"><span class="cu-av">${avatarHtml(u)}<i class="cu-on"></i></span><div style="min-width:0"><b>${esc(u.fullname || u.username)}</b><small>@${esc(u.username || '')}</small><span class="cu-rol">${esc(rol(u))}</span></div></div>
      <div class="cu-m-lista">
        <button type="button" class="cu-m-it" role="menuitem" data-a="perfil" style="--i:0"><span class="ic">👤</span><span><b>Mi perfil</b><small>Foto, portada, datos y redes</small></span></button>
        <button type="button" class="cu-m-it" role="menuitem" data-a="amigos" style="--i:1"><span class="ic">🤝</span><span><b>Mis amigos</b><small>Comunidad y solicitudes</small></span></button>
        <button type="button" class="cu-m-it" role="menuitem" data-a="avisos" style="--i:2"><span class="ic">🔊</span><span><b>Sonidos y avisos</b><small>Elegí qué suena y qué no</small></span></button>
        <div class="cu-m-sep"></div>
        <button type="button" class="cu-m-it salir" role="menuitem" data-a="salir" style="--i:3"><span class="ic">🚪</span><span><b>Cerrar sesión</b><small>Tu progreso queda guardado</small></span></button>
      </div>`;
  }
  function abrirMenu() {
    const b = document.getElementById('header-auth-btn'); if (!b) return;
    armarMenu(); pintarMenu();
    const r = b.getBoundingClientRect();
    menu.style.top = (r.bottom + 10) + 'px'; menu.style.right = Math.max(10, window.innerWidth - r.right) + 'px'; menu.style.left = 'auto';
    menu.classList.remove('sale'); menu.classList.add('on'); b.setAttribute('aria-expanded', 'true');
  }
  function cerrarMenu() {
    if (!menu || !menu.classList.contains('on')) return;
    const b = document.getElementById('header-auth-btn'); if (b) b.setAttribute('aria-expanded', 'false');
    menu.classList.remove('on'); menu.classList.add('sale'); setTimeout(() => menu.classList.remove('sale'), 170);
  }
  function click() {
    if (!yo()) { if (window.handleProfileClick) window.handleProfileClick(); return; }
    armarMenu(); menu.classList.contains('on') ? cerrarMenu() : abrirMenu();
  }

  // ---------------------------------------------------------------- confirmar salida
  function confirmarSalida() {
    if (document.querySelector('.cu-conf')) return;
    const m = document.createElement('div'); m.className = 'cu-conf';
    m.innerHTML = `<div role="alertdialog" aria-modal="true" aria-label="Cerrar sesión"><span class="puerta">🚪</span><h3>¿Cerrar sesión?</h3><p>Tu progreso, tus notas y tus marcas quedan guardados en tu cuenta. Cuando vuelvas, entrás con tu correo y contraseña.</p><div class="bt"><button type="button" class="no">Quedarme</button><button type="button" class="si">Sí, cerrar sesión</button></div></div>`;
    const salir = () => m.remove();
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.no')) { salir(); return; } if (e.target.closest('.si')) { m.querySelector('.si').textContent = 'Cerrando…'; m.querySelector('.si').disabled = true; if (window.handleLogout) window.handleLogout(); } });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { salir(); document.removeEventListener('keydown', esc); } });
    document.body.appendChild(m); setTimeout(() => { const b = m.querySelector('.no'); b && b.focus(); }, 60);
  }

  // ---------------------------------------------------------------- identidad en el editor de perfil
  function pintarIdentidad(u) {
    u = u || yo() || {};
    const h = document.getElementById('prof-id'); if (!h) return;
    h.innerHTML = `<b>${esc(u.fullname || u.username || 'Mi perfil')}</b><span class="u">@${esc(u.username || '')}</span><span class="cu-rol">${esc(rol(u))}</span>`;
  }

  window.NikaCuenta = { chipHtml, click, abrirMenu, cerrarMenu, confirmarSalida, pintarIdentidad, rol };
})();
