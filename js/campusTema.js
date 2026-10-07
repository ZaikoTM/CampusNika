/* Campus NikaMed+ — selector de apariencia (Premium violeta / Clásico / Oscuro) para el campus y las salas comunes (Sala de Estudio, NikaSim, hubs).
   Solo para NikaMed+ y admin. Por defecto, Premium. La elección queda en este dispositivo (localStorage).
   Los usuarios comunes siguen con el botón Modo Claro/Oscuro de siempre.
   Uso: en el campus lo llama aplicarRangoUsuario() → CampusTema.setCuenta('admin' | 'plus' | null). En las demás páginas detecta la cuenta solo. */
(function () {
  'use strict';
  const KEY = 'nika_campus_tema';
  const OPCIONES = [
    { id: 'premium', ico: '💜', txt: 'Premium' },
    { id: 'clasico', ico: '☀️', txt: 'Clásico' },
    { id: 'oscuro', ico: '🌙', txt: 'Oscuro' },
  ];
  let cuenta = null;   // 'admin' | 'plus' | null

  const leer = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const guardar = (v) => { try { localStorage.setItem(KEY, v); } catch (_) {} };
  const valido = (v) => OPCIONES.some((o) => o.id === v);
  const elegible = () => cuenta === 'admin' || cuenta === 'plus';
  const actual = () => { const v = leer(); return valido(v) ? v : 'premium'; };

  function marca() {
    const box = document.querySelector('.sidebar-brand-box');
    if (!box) return;
    let chip = box.querySelector('.brand-chip');
    if (!chip) { chip = document.createElement('span'); chip.className = 'brand-chip'; box.appendChild(chip); }
    box.classList.toggle('brand-plus', elegible());
    box.classList.toggle('brand-admin', cuenta === 'admin');
    chip.textContent = cuenta === 'admin' ? '👑 Admin' : '✨ NikaMed+';
  }

  function ctaGratis(li) {
    if (document.getElementById('cp-cta')) return;
    const cta = document.createElement('li'); cta.id = 'cp-cta';
    cta.innerHTML = '<button type="button" class="sidebar-link cp-premium-cta">💜 Tema Premium <span style="margin-left:auto;font-size:.8rem">🔒</span></button>';
    li.insertAdjacentElement('afterend', cta);
    cta.querySelector('button').addEventListener('click', avisoPremium);
  }

  function avisoPremium() {
    if (document.getElementById('cp-modal')) return;
    const m = document.createElement('div'); m.id = 'cp-modal'; m.className = 'cp-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="cp-modal-caja">
      <button type="button" class="cp-cerrar" aria-label="Cerrar">×</button>
      <div class="cp-vista" aria-hidden="true"></div>
      <h3>Tema Premium · exclusivo NikaMed+</h3>
      <p class="cp-sub">Una apariencia espacial pensada para quienes estudian con NikaMed+.</p>
      <ul class="cp-lista">
        <li><span>🌌</span><span><b>Fondo espacial animado</b> con estrellas, meteoritos y naves que cruzan muy suave por detrás.</span></li>
        <li><span>💜</span><span><b>Degradé violeta</b> en el menú, el encabezado, las tarjetas y el banner de bienvenida, con efectos al pasar el mouse.</span></li>
        <li><span>✨</span><span><b>Banner de marca animado</b> con tu insignia NikaMed+.</span></li>
        <li><span>🎛️</span><span><b>Selector de apariencia</b>: Premium, Clásico u Oscuro, cuando quieras.</span></li>
      </ul>
      <div class="cp-paso"><b>¿Cómo se habilita?</b> Tocá "Ver planes", elegí tu plan en la página de NikaMed+ y completá la compra. Cuando tu plan se active, el tema aparece solo en tu campus (queda como predeterminado). Si todavía no iniciaste sesión, ingresá primero con tu cuenta.</div>
      <div class="cp-acciones">
        <a class="cp-btn pri" href="nikamed-plus.html">Ver planes de NikaMed+</a>
        <button type="button" class="cp-btn sec" data-x>Ahora no</button>
      </div></div>`;
    const esc = (e) => { if (e.key === 'Escape') cerrar(); };
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', esc); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.cp-cerrar') || e.target.closest('[data-x]')) cerrar(); });
    document.addEventListener('keydown', esc); document.body.appendChild(m);
  }

  const esCampus = () => !!document.getElementById('dark-mode-btn');

  // Salas comunes (NikaSim, Sala de Estudio, hubs): grupo de 3 botones en la barra superior
  function selectorTop() {
    const ancla = document.getElementById('pl-tema') || document.querySelector('.btn-back') || null;
    const cont = document.querySelector('.ns-acc') || (ancla && ancla.parentElement);
    if (!cont) return;
    let g = document.getElementById('cp-top'); const cta = document.getElementById('cp-top-cta');
    if (!elegible()) {
      if (g) g.remove();
      if (ancla && ancla.id === 'pl-tema') ancla.style.display = '';
      if (!cta) {
        const b = document.createElement('button'); b.type = 'button'; b.id = 'cp-top-cta'; b.className = 'pl-btn cp-top-cta'; b.title = 'Tema Premium (NikaMed+)'; b.setAttribute('aria-label', 'Tema Premium');
        b.innerHTML = '💜 <span class="lbl">Tema Premium</span> 🔒'; b.addEventListener('click', avisoPremium);
        if (ancla && ancla.parentElement === cont) ancla.insertAdjacentElement('beforebegin', b); else cont.insertBefore(b, cont.firstChild);
      }
      return;
    }
    if (cta) cta.remove();
    if (ancla && ancla.id === 'pl-tema') ancla.style.display = 'none';
    if (!g) {
      g = document.createElement('div'); g.id = 'cp-top'; g.className = 'cp-top'; g.setAttribute('role', 'radiogroup'); g.setAttribute('aria-label', 'Apariencia');
      g.innerHTML = OPCIONES.map((o) => '<button type="button" role="radio" class="cp-top-op" data-t="' + o.id + '" title="' + o.txt + '"><span>' + o.ico + '</span><b>' + o.txt + '</b></button>').join('');
      if (ancla && ancla.parentElement === cont) ancla.insertAdjacentElement('beforebegin', g); else cont.insertBefore(g, cont.firstChild);
      g.addEventListener('click', (e) => { const b = e.target.closest('.cp-top-op'); if (b) elegir(b.dataset.t); });
    }
    const a = actual();
    g.querySelectorAll('.cp-top-op').forEach((b) => { const on = b.dataset.t === a; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
  }

  function selector() {
    if (!esCampus()) { selectorTop(); return; }
    const btn = document.getElementById('dark-mode-btn');
    const li = btn && btn.closest('li');
    if (!li) return;
    let sel = document.getElementById('cp-apariencia');
    if (!elegible()) { if (sel) sel.remove(); li.style.display = ''; ctaGratis(li); return; }
    const cta = document.getElementById('cp-cta'); if (cta) cta.remove();
    li.style.display = 'none';
    if (!sel) {
      sel = document.createElement('li'); sel.id = 'cp-apariencia'; sel.className = 'cp-apariencia';
      sel.innerHTML = '<small>Apariencia</small><div class="cp-opciones" role="radiogroup" aria-label="Apariencia del campus">' +
        OPCIONES.map((o) => `<button type="button" class="cp-op" role="radio" data-t="${o.id}"><span>${o.ico}</span>${o.txt}</button>`).join('') + '</div>';
      li.insertAdjacentElement('afterend', sel);
      sel.addEventListener('click', (e) => { const b = e.target.closest('.cp-op'); if (b) elegir(b.dataset.t); });
    }
    const a = actual();
    sel.querySelectorAll('.cp-op').forEach((b) => { const on = b.dataset.t === a; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
  }

  function aplicar() {
    const b = document.body; if (!b) return;
    if (elegible()) {
      const t = actual();
      b.classList.toggle('tema-premium', t === 'premium');
      b.classList.toggle('dark-mode', t !== 'clasico');      // el premium reutiliza los estilos oscuros ya existentes
    } else {
      b.classList.remove('tema-premium');
      let oscuro = false; try { oscuro = localStorage.getItem('nika_theme') === 'dark'; } catch (_) {}
      b.classList.toggle('dark-mode', oscuro);
    }
    marca(); selector();
  }

  // Sincronización con la cuenta (profiles.campus_tema, ver sql/perfil_campus_tema.sql). Si la columna no existe, falla en silencio y queda el valor local.
  const cliente = () => window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;
  async function idUsuario() {
    try { const c = cliente(); if (!c || !c.auth) return null; const { data } = await c.auth.getSession(); return (data && data.session && data.session.user && data.session.user.id) || null; } catch (_) { return null; }
  }
  async function subir(t) {
    try { const c = cliente(), id = await idUsuario(); if (c && id) await c.from('profiles').update({ campus_tema: t }).eq('id', id); } catch (_) {}
  }
  let _bajado = false;
  async function bajar() {
    if (_bajado) return; _bajado = true;
    try {
      const c = cliente(), id = await idUsuario(); if (!c || !id) { _bajado = false; return; }
      const { data, error } = await c.from('profiles').select('campus_tema').eq('id', id).maybeSingle();
      if (error || !data) return;
      if (valido(data.campus_tema)) { if (data.campus_tema !== leer()) { guardar(data.campus_tema); aplicar(); } }
      else if (valido(leer())) subir(leer());   // primera vez: se sube la elección que ya tenía este dispositivo
    } catch (_) {}
  }

  function elegir(t) { if (!valido(t)) return; guardar(t); aplicar(); subir(t); }
  function setCuenta(c) {
    cuenta = (c === 'admin' || c === 'plus') ? c : null; aplicar();
    if (elegible()) bajar(); else _bajado = false;
  }

  // Fuera del campus la cuenta se deduce del perfil guardado en el navegador (solo estético: el acceso real a NikaMed+ lo valida el servidor)
  function detectar() {
    let u = null; try { u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) {}
    const rol = String((u && u.role) || '').toLowerCase(), tipo = String((u && u.tipo_cuenta) || '').toLowerCase();
    if (rol === 'admin' || tipo === 'admin') return 'admin';
    let vip = ['vip', 'premium', 'plus', 'nikamed_plus'].includes(tipo) || rol === 'vip' || rol === 'premium';
    try { if (window.NikaAcceso && window.NikaAcceso.esVip && window.NikaAcceso.esVip()) vip = true; } catch (_) {}
    return vip ? 'plus' : null;
  }
  function auto() { if (esCampus()) return; const c = detectar(); if (c !== cuenta || !document.getElementById(c ? 'cp-top' : 'cp-top-cta')) setCuenta(c); }
  function iniciar() {
    if (esCampus()) return;
    auto(); setTimeout(auto, 1200); setTimeout(auto, 3500);          // el perfil puede terminar de cargarse después
    window.addEventListener('storage', (e) => { if (e.key === 'nika_currentUser' || e.key === KEY) auto(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  window.CampusTema = { setCuenta, elegir, actual, aplicar };
})();
