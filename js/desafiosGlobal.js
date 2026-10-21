/* NikaDesafios · invitaciones a duelos 1vs1 en TODAS las páginas del campus.
   Antes el amigo solo se enteraba si tenía abierta la Arena (versus.html). Ahora, esté donde esté, le aparece una tarjeta flotante
   con «Aceptar / Rechazar» (y además le llega un mensaje privado con los mismos botones: ver chatFlotante.js).
   · Aceptar → lo lleva a la Arena (versus.html?desafio=<id>), que lo une a la sala del anfitrión.
   · Rechazar → el anfitrión lo ve en su sala de espera.
   Se carga solo (desde chatFlotante.js) y no se activa dentro de versus.html (ahí lo maneja la propia Arena). */
(function () {
  'use strict';
  if (window.NikaDesafios) return;
  if (/versus\.html/i.test(location.pathname)) return;

  const sb = () => window.NikaSupabase && window.NikaSupabase.client;
  const usuario = () => { try { return (window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername && window.NikaSupabase.getNikaCurrentUsername()) || (JSON.parse(localStorage.getItem('nika_currentUser') || 'null') || {}).username || null; } catch (_) { return null; } };
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const mostrados = new Set();
  let canal = null, iniciado = false, caja = null;

  function estilos() {
    if (document.getElementById('nd-css')) return;
    const st = document.createElement('style'); st.id = 'nd-css';
    st.textContent = '#nd-caja{position:fixed;top:16px;right:16px;z-index:100000;display:flex;flex-direction:column;gap:10px;max-width:min(340px,calc(100vw - 24px))}' +
      '.nd-card{background:#0f172a;color:#f8fafc;border:1px solid #334155;border-left:5px solid #38bdf8;border-radius:14px;padding:14px 16px;box-shadow:0 18px 40px rgba(0,0,0,.35);font:600 14px/1.4 "Plus Jakarta Sans",system-ui,sans-serif;animation:ndIn .35s cubic-bezier(.2,.9,.3,1.2)}' +
      '.nd-card b{color:#7dd3fc}.nd-card small{display:block;color:#94a3b8;font-weight:600;margin-top:2px}.nd-card .nd-b{display:flex;gap:8px;margin-top:10px}' +
      '.nd-card button{flex:1;border:0;border-radius:9px;padding:9px 10px;font:800 13px inherit;font-family:inherit;cursor:pointer;transition:transform .12s,filter .12s}.nd-card button:hover{filter:brightness(1.1);transform:translateY(-1px)}.nd-card button:active{transform:scale(.96)}' +
      '.nd-ok{background:#16a34a;color:#fff}.nd-no{background:#334155;color:#e2e8f0}.nd-ico{display:inline-block;animation:ndSwing 1.4s ease-in-out infinite}' +
      '@keyframes ndIn{from{opacity:0;transform:translateX(40px) scale(.96)}to{opacity:1;transform:none}}@keyframes ndSwing{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}' +
      '@media (prefers-reduced-motion:reduce){.nd-card,.nd-ico{animation:none}}';
    document.head.appendChild(st);
  }

  function cajaToasts() {
    if (caja && document.body.contains(caja)) return caja;
    estilos();
    caja = document.createElement('div'); caja.id = 'nd-caja'; caja.setAttribute('role', 'status'); caja.setAttribute('aria-live', 'polite');
    document.body.appendChild(caja);
    return caja;
  }

  function vencido(d) { return d.expires_at && new Date(d.expires_at) <= new Date(); }

  function mostrar(d) {
    if (!d || !d.id || mostrados.has(d.id) || d.status !== 'pending' || vencido(d)) return;
    const yo = String(usuario() || '').toLowerCase();
    if (!yo || String(d.to_username || '').toLowerCase() !== yo) return;
    mostrados.add(d.id);
    const card = document.createElement('div'); card.className = 'nd-card'; card.dataset.id = d.id;
    card.innerHTML = '<div><span class="nd-ico">⚔️</span> <b>@' + esc(d.from_username) + '</b> te desafió a un duelo 1vs1' + (d.tema ? '<small>' + esc(d.tema) + '</small>' : '') + '</div>' +
      '<div class="nd-b"><button type="button" class="nd-ok">Aceptar</button><button type="button" class="nd-no">Rechazar</button></div>';
    card.querySelector('.nd-ok').onclick = () => responder(d.id, true);
    card.querySelector('.nd-no').onclick = () => responder(d.id, false);
    cajaToasts().appendChild(card);
    try { if (window.navigator.vibrate) navigator.vibrate(120); } catch (_) {}
    if (d.expires_at) setTimeout(() => quitar(d.id), Math.max(1000, new Date(d.expires_at) - Date.now()));
  }

  function quitar(id) { const c = document.querySelector('.nd-card[data-id="' + id + '"]'); if (c) c.remove(); }

  async function responder(id, aceptar) {
    quitar(id);
    if (aceptar) { location.href = 'versus.html?desafio=' + encodeURIComponent(id); return; }
    try { await sb().from('versus_challenges').update({ status: 'rejected' }).eq('id', id).eq('status', 'pending'); } catch (e) { console.warn('[NikaDesafios]', e && e.message); }
  }

  async function revisarPendientes() {
    try {
      const c = sb(), yo = usuario(); if (!c || !yo) return;
      const { data } = await c.from('versus_challenges').select('*').eq('to_username', yo).eq('status', 'pending').gt('expires_at', new Date().toISOString());
      (data || []).forEach(mostrar);
    } catch (_) {}
  }

  async function iniciar() {
    if (iniciado) return;
    const c = sb(), yo = usuario(); if (!c || !yo) return;
    iniciado = true;
    try {
      canal = c.channel('desafios_' + yo)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'versus_challenges', filter: 'to_username=eq.' + yo }, ({ new: r }) => mostrar(r))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'versus_challenges', filter: 'to_username=eq.' + yo }, ({ new: r }) => { if (r && r.status !== 'pending') quitar(r.id); })
        .subscribe();
    } catch (e) { console.warn('[NikaDesafios] sin tiempo real:', e && e.message); }
    revisarPendientes();
    setInterval(revisarPendientes, 45000);                       // respaldo si el tiempo real se cae
    document.addEventListener('visibilitychange', () => { if (!document.hidden) revisarPendientes(); });
  }

  window.NikaDesafios = { iniciar, responder, mostrar, revisarPendientes };
  const arrancar = () => { let n = 0; const t = setInterval(() => { n++; if (sb() && usuario()) { clearInterval(t); iniciar(); } else if (n > 40) clearInterval(t); }, 500); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
