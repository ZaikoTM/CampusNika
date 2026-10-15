// js/nikafarmaPatologias.js
// NikaFarma · "Patologías y tratamiento" (guías argentinas): botón destacado junto a «Dosis pediátrica»,
// panel de flashcards a pantalla completa (js/nikaFlashcards.js) y tarjeta rápida al buscar en el buscador.
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  let ultimaQ = '', slot = null;

  const css = document.createElement('style');
  css.textContent = `
  .pt-card{margin:12px 0;padding:14px 16px;border-radius:18px;border:1px solid rgba(236,72,153,.35);background:linear-gradient(135deg,rgba(236,72,153,.12),rgba(99,102,241,.12));display:flex;gap:12px;align-items:center;flex-wrap:wrap;animation:ptIn .35s ease both;box-shadow:0 12px 24px -18px #ec4899}
  @keyframes ptIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .pt-card .pt-ic{font-size:1.6rem}.pt-card .pt-tx{flex:1;min-width:200px}.pt-card b{display:block;font-size:.98rem}.pt-card small{opacity:.8}
  .pt-btn{border:0;border-radius:99px;padding:9px 16px;font:800 .85rem inherit;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,#ec4899,#6366f1);color:#fff;transition:transform .15s,box-shadow .2s}
  .pt-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px -8px rgba(99,102,241,.7)}
  .pt-btn.sec{background:rgba(148,163,184,.18);color:inherit}
  .pt-tag{display:inline-block;padding:2px 9px;border-radius:99px;font-size:.7rem;font-weight:800}
  .pt-tag.guia{background:rgba(16,185,129,.18);color:#047857}.pt-tag.verificar{background:rgba(250,204,21,.28);color:#854d0e}
  `;
  document.head.appendChild(css);

  function botonPrincipal() {
    if ($('#pt-entrada')) return true;
    const bar = $('.nfp-bar'); if (!bar) return false;
    const b = document.createElement('button');
    b.id = 'pt-entrada'; b.type = 'button'; b.className = 'nfp-btn nfp-pat';
    b.innerHTML = '📋 Patologías y tratamiento <em>guías argentinas</em>';
    b.addEventListener('click', () => { if (window.NikaFlashcards) NikaFlashcards.panel(); });
    bar.appendChild(b);
    return true;
  }

  function asegurarSlot() {
    if (slot && slot.isConnected) return slot;
    const main = $('#nfMain'); if (!main || !main.parentNode) return null;
    slot = document.createElement('div'); slot.id = 'pt-slot';
    main.parentNode.insertBefore(slot, main);
    return slot;
  }

  function pintar(q) {
    const s = asegurarSlot(); if (!s || !window.NikaFlashcards) return;
    const d = NikaFlashcards.datos(); if (!d) { s.innerHTML = ''; return; }
    const n = norm(q); if (n.length < 3) { s.innerHTML = ''; return; }
    const ws = n.split(' ');
    const hallados = d.patologias.map((p) => ({ p, k: p._h.indexOf(n) >= 0 ? 2 : (ws.every((w) => p._h.indexOf(w) >= 0) ? 1 : 0) })).filter((x) => x.k).sort((a, b) => b.k - a.k).slice(0, 3).map((x) => x.p);
    if (!hallados.length) {
      const sg = (d.cobertura.temas || []).filter((t) => t.estado === 'sin_guia').find((t) => norm(t.tema).indexOf(n) >= 0);
      s.innerHTML = sg ? '<div class="pt-card"><span class="pt-ic">🔎</span><span class="pt-tx"><b>' + esc(sg.tema) + '</b><small>Todavía no hay una guía cargada para este tema.</small></span></div>' : '';
      return;
    }
    s.innerHTML = hallados.map((p) => '<div class="pt-card"><span class="pt-ic">📋</span><span class="pt-tx"><b>' + esc(p.titulo) + '</b><small>Tarjeta de tratamiento · <span class="pt-tag ' + (p.estado === 'guia' ? 'guia' : 'verificar') + '">' + (p.estado === 'guia' ? 'Basada en guía' : 'Verificar con guías') + '</span></small></span><button type="button" class="pt-btn" data-pt-abrir="' + esc(p.id) + '">Abrir tarjeta</button></div>').join('');
  }

  document.addEventListener('click', (e) => { const b = e.target.closest('[data-pt-abrir]'); if (b && window.NikaFlashcards) NikaFlashcards.abrir(b.dataset.ptAbrir); });

  function iniciar() {
    let n = 0; const t = setInterval(() => { if (botonPrincipal() || ++n > 40) clearInterval(t); }, 150);
    const q = $('#q'); if (!q) return;
    let h = null;
    q.addEventListener('input', () => {
      clearTimeout(h);
      h = setTimeout(() => { const v = q.value || ''; if (v === ultimaQ) return; ultimaQ = v; if (!window.NikaFlashcards) return; NikaFlashcards.cargar().then(() => pintar(v)); }, 220);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
