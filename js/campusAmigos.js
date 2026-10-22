/* Campus NikaMed · «Comunidad & Amigos»: decora lo que dibuja campus.html (no toca su lógica).
   · estadísticas en la cabecera (amigos, en línea, solicitudes) · indicador deslizante en las pestañas
   · amigos en línea primero, con aro animado y punto verde · buscador de amigos · botones «Aceptar / Rechazar» con texto
   Estilos: css/campus-amigos.css */
(function () {
  'use strict';
  if (window.NikaAmigosUI) return;
  const $ = (id) => document.getElementById(id);
  let timer = null, ocupado = false;

  function enLinea(u) { try { return !!(window.NikaNotif && window.NikaNotif.estaEnLinea(u)); } catch (_) { return false; } }

  function stats() {
    const cab = document.querySelector('#friends-modal .friends-card-header > div'); if (!cab) return;
    let s = cab.querySelector('.fr-stats');
    if (!s) { s = document.createElement('div'); s.className = 'fr-stats'; cab.appendChild(s); }
    const total = parseInt(($('friends-count-pill') || {}).textContent, 10) || 0;
    const sol = parseInt(($('req-badge') || {}).textContent, 10) || 0;
    const on = document.querySelectorAll('#friends-view-list .friend-card.en-linea').length;
    const html = `<span class="fr-stat" style="--i:0">👥 <b>${total}</b> ${total === 1 ? 'amigo' : 'amigos'}</span><span class="fr-stat" style="--i:1"><i class="pt"></i><b>${on}</b> en línea</span>` + (sol ? `<span class="fr-stat" style="--i:2">📬 <b>${sol}</b> ${sol === 1 ? 'solicitud' : 'solicitudes'}</span>` : '');
    if (s.dataset.h !== html) { s.dataset.h = html; s.innerHTML = html; }
  }

  function indicador() {
    const t = document.querySelector('#friends-modal .friends-tabs'); if (!t) return;
    let i = t.querySelector('.fr-ind'); if (!i) { i = document.createElement('i'); i.className = 'fr-ind'; t.prepend(i); }
    const btns = Array.from(t.querySelectorAll('.friends-tab-btn')); const k = Math.max(0, btns.findIndex((b) => b.classList.contains('active')));
    i.style.width = `calc(${100 / btns.length}% - ${8 / btns.length}px)`; i.style.transform = `translateX(${k * 100}%)`;
  }

  function lista() {
    if (ocupado) return; ocupado = true;
    try {
      const box = $('friends-view-list'); if (!box) return;
      const cards = Array.from(box.querySelectorAll(':scope > .friend-card'));
      cards.forEach((c, i) => {
        const u = (c.querySelector('[data-presence-user]') || {}).getAttribute ? c.querySelector('[data-presence-user]').getAttribute('data-presence-user') : '';
        const on = !!u && enLinea(u);
        c.classList.toggle('en-linea', on); const w = c.querySelector('.friend-card-avatar-wrap'); if (w) w.classList.toggle('on', on);
        c.dataset.u = u || ''; c.dataset.o = on ? '0' : '1'; c.style.setProperty('--i', Math.min(i, 12));
      });
      // en línea primero (orden estable) + títulos de sección
      const ord = cards.slice().sort((a, b) => (a.dataset.o - b.dataset.o) || (cards.indexOf(a) - cards.indexOf(b)));
      const actual = Array.from(box.children).filter((c) => c.classList.contains('friend-card'));
      if (ord.some((c, i) => c !== actual[i])) ord.forEach((c) => box.appendChild(c));
      box.querySelectorAll('.fr-sec').forEach((e) => e.remove());
      const on = ord.filter((c) => c.dataset.o === '0'), off = ord.filter((c) => c.dataset.o === '1');
      const sec = (t) => { const d = document.createElement('div'); d.className = 'fr-sec'; d.textContent = t; return d; };
      if (on.length) box.insertBefore(sec('En línea · ' + on.length), on[0]);
      if (off.length && on.length) box.insertBefore(sec('Desconectados · ' + off.length), off[0]);
      // buscador cuando hay varios amigos
      let f = box.querySelector('.fr-filtro');
      if (cards.length >= 5) {
        if (!f) { f = document.createElement('label'); f.className = 'fr-filtro'; f.innerHTML = '<span aria-hidden="true">🔎</span><input type="search" placeholder="Filtrar mis amigos…" aria-label="Filtrar mis amigos">'; box.prepend(f); f.querySelector('input').addEventListener('input', filtrar); }
      } else if (f) f.remove();
      filtrar();
    } finally { ocupado = false; }
    stats();
  }
  function filtrar() {
    const box = $('friends-view-list'); const i = box && box.querySelector('.fr-filtro input'); const q = i ? i.value.trim().toLowerCase() : '';
    if (!box) return;
    box.querySelectorAll(':scope > .friend-card').forEach((c) => { c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none'; });
  }

  function solicitudes() {
    document.querySelectorAll('#friends-view-req .friend-request-card').forEach((c, i) => {
      c.style.setProperty('--i', Math.min(i, 12));
      const ok = c.querySelector('.friend-action-btn.accept'), no = c.querySelector('.friend-action-btn.danger');
      if (ok && !ok.classList.contains('fr-pill')) { ok.classList.add('fr-pill'); ok.textContent = '✓ Aceptar'; }
      if (no && !no.classList.contains('fr-pill')) { no.classList.add('fr-pill'); no.textContent = 'Rechazar'; }
    });
    stats();
  }
  function busqueda() {
    document.querySelectorAll('#search-results-box > *').forEach((c, i) => c.style.setProperty('--i', Math.min(i, 12)));
  }

  function todo() { indicador(); lista(); solicitudes(); busqueda(); stats(); }

  function iniciar() {
    const modal = $('friends-modal'); if (!modal) return;
    const opciones = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] };
    const obs = new MutationObserver(() => { if (modal.style.display !== 'none') { clearTimeout(iniciar._t); iniciar._t = setTimeout(() => { obs.disconnect(); try { todo(); } finally { obs.observe(modal, opciones); } }, 40); } });
    obs.observe(modal, opciones);
    // delegado: «Añadir» → feedback inmediato
    modal.addEventListener('click', (e) => {
      const b = e.target.closest('.friends-add-btn'); if (!b || b.disabled) return;
      setTimeout(() => { if (b.isConnected && !b.classList.contains('fr-enviada')) { b.classList.add('fr-enviada'); b.textContent = '✓ Enviada'; } }, 450);
    });
    // la presencia cambia sola: se refresca mientras el modal está abierto
    setInterval(() => { if (modal.style.display !== 'none' && modal.style.display !== '') lista(); }, 8000);
    window.addEventListener('nika:friends-changed', () => setTimeout(todo, 300));
    todo();
  }
  window.NikaAmigosUI = { refrescar: todo };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
