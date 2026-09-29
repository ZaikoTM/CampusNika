// js/paginaLateral.js
// Arranque común de las páginas independientes (liga.html, foro.html, ateneos.html):
//   • modo oscuro según la preferencia del campus,
//   • funciones globales que los módulos esperaban encontrar en campus.html (toast, rango visual, abrir perfil),
//   • acceso solo con sesión y apertura automática de la sección de cada página.

(function () {
  'use strict';

  // Tema
  try { if (localStorage.getItem('nika_theme') === 'dark') document.body.classList.add('dark-mode'); } catch (_) {}
  window.pl_alternarTema = function () {
    const oscuro = document.body.classList.toggle('dark-mode');
    try { localStorage.setItem('nika_theme', oscuro ? 'dark' : 'light'); } catch (_) {}
    const b = document.getElementById('pl-tema'); if (b) b.textContent = oscuro ? '☀️' : '🌙';
  };

  // Toast (mismo id/estilo que campus.html, viene de styles.css)
  if (typeof window.showToast !== 'function') {
    window.showToast = function (msg) {
      let t = document.getElementById('toast');
      if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
      t.innerText = msg; t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3200);
    };
  }

  // Rango visual de usuario (idéntico al de campus.html)
  window.obtenerRangoUsuario = function (role) {
    const esVip = role === 'premium' || role === 'vip' || (window.NikaAcceso && window.NikaAcceso.esVip && window.NikaAcceso.esVip());
    if (role === 'admin') return { label: '👑 Admin', clase: 'profile-admin' };
    if (esVip && role !== 'free') return { label: '✨ NikaMed+', clase: 'profile-premium' };
    return { label: '📚 Estudiante', clase: 'profile-free' };
  };
  window._rangoTarjetaAmigo = function (role) {
    const r = window.obtenerRangoUsuario(role);
    const mapa = { 'profile-admin': 'rank-admin', 'profile-premium': 'rank-premium', 'profile-free': 'rank-free' };
    return { label: r.label, clase: mapa[r.clase] || 'rank-free' };
  };

  // El perfil público vive en el campus: se abre allá con ?perfil=<id>
  window.abrirPerfilPublico = function (userId) {
    if (userId) window.location.href = 'campus.html?perfil=' + encodeURIComponent(userId);
  };

  // Arranque
  document.addEventListener('DOMContentLoaded', async () => {
    const pagina = document.body.dataset.pagina;
    const tema = document.getElementById('pl-tema'); if (tema) tema.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    if (!localStorage.getItem('nika_currentUser')) {
      // Sin sesión guardada: se vuelve al campus, que muestra el inicio de sesión
      window.location.replace('campus.html');
      return;
    }
    try { if (window.NikaAuth && window.NikaAuth.ready) await window.NikaAuth.ready; } catch (_) {}
    const modulos = { liga: window.NikaLiga, foro: window.NikaForo, ateneos: window.NikaAteneos };
    const m = modulos[pagina];
    if (m && typeof m.abrir === 'function') m.abrir();
  });
})();
