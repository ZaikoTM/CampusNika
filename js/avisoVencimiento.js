// js/avisoVencimiento.js
// ============================================================================
// CAMPUS NIKA — Aviso "tu NikaMed+ está por vencer"
// ----------------------------------------------------------------------------
// Si la cuenta es premium y faltan DIAS_AVISO días o menos para fecha_fin_suscripcion:
//   · Aparece una franja animada debajo de la barra superior (con barra de tiempo restante).
//   · El usuario puede MINIMIZARLA (queda una pastilla "⏳ 3 días" dentro de la navbar,
//     que al tocarla vuelve a abrir la franja) o QUITARLA (no vuelve hasta mañana).
//   · Cada día nuevo arranca expandida otra vez. Con 1 día o menos el tono pasa a rojo.
// Solo LEE el perfil; nunca rompe la página si algo falla.
// Requiere: supabaseClient.js (window.NikaSupabase) y un <header class="top-header">.
// ============================================================================
(() => {
  const DIAS_AVISO = 5;                     // desde cuántos días antes empieza a avisar
  const URL_RENOVAR = 'nikamed-plus.html';
  const CLAVE = 'nika_aviso_vencimiento_v2';

  const hoy = () => new Date().toISOString().slice(0, 10);
  function leerEstado() {
    try {
      const e = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (e && e.dia === hoy() && ['expandido', 'minimizado', 'cerrado'].includes(e.estado)) return e.estado;
    } catch (_) {}
    return 'expandido';                     // día nuevo (o sin dato): se muestra completa
  }
  function guardarEstado(estado) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ dia: hoy(), estado })); } catch (_) {}
  }

  function inyectarCSS() {
    if (document.getElementById('nika-venc-css')) return;
    const st = document.createElement('style');
    st.id = 'nika-venc-css';
    st.textContent = `
      .nika-venc-chip{display:none;align-items:center;gap:6px;margin-left:10px;border:1px solid rgba(168,85,247,.55);
        background:linear-gradient(135deg,rgba(168,85,247,.16),rgba(124,58,237,.10));color:#7c3aed;border-radius:999px;
        padding:6px 12px;font:800 .74rem 'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer;white-space:nowrap;
        animation:nikaVencPop .35s cubic-bezier(.2,1.4,.4,1) both, nikaVencGlow 2.4s ease-in-out .4s infinite}
      .nika-venc-chip.visible{display:inline-flex}
      .nika-venc-chip.urgente{border-color:rgba(220,38,38,.6);background:rgba(220,38,38,.10);color:#dc2626;
        animation:nikaVencPop .35s cubic-bezier(.2,1.4,.4,1) both, nikaVencGlowRojo 1.6s ease-in-out .4s infinite}
      .nika-venc-chip .rel{display:inline-block;animation:nikaVencSwing 2.2s ease-in-out infinite;transform-origin:50% 10%}
      body.dark-mode .nika-venc-chip{color:#c4b5fd} body.dark-mode .nika-venc-chip.urgente{color:#fca5a5}

      .nika-venc-franja{position:sticky;z-index:999;overflow:hidden;max-height:0;opacity:0;transform:translateY(-14px);
        transition:max-height .5s cubic-bezier(.2,.8,.2,1),opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1)}
      .nika-venc-franja.abierta{max-height:140px;opacity:1;transform:none}
      .nika-venc-in{position:relative;display:flex;align-items:center;gap:14px;padding:12px clamp(16px,4vw,35px);color:#fff;
        background:linear-gradient(110deg,#4c1d95,#7c3aed,#a855f7,#7c3aed,#4c1d95);background-size:300% 100%;
        animation:nikaVencFluir 7s linear infinite;box-shadow:0 10px 26px -14px rgba(76,29,149,.8)}
      .nika-venc-franja.urgente .nika-venc-in{background-image:linear-gradient(110deg,#7f1d1d,#dc2626,#f97316,#dc2626,#7f1d1d);
        box-shadow:0 10px 26px -14px rgba(127,29,29,.85)}
      .nika-venc-ico{font-size:1.5rem;flex:none;animation:nikaVencSwing 2.2s ease-in-out infinite;transform-origin:50% 10%}
      .nika-venc-txt{flex:1;min-width:0;font:600 .88rem/1.35 'Plus Jakarta Sans',system-ui,sans-serif}
      .nika-venc-txt b{font-weight:800}
      .nika-venc-barra{margin-top:7px;height:5px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden;max-width:340px}
      .nika-venc-barra i{display:block;height:100%;border-radius:99px;background:#fff;width:0;transition:width 1.1s cubic-bezier(.2,.8,.2,1) .35s}
      .nika-venc-cta{flex:none;background:#fff;color:#6d28d9;text-decoration:none;font:800 .82rem 'Plus Jakarta Sans',system-ui,sans-serif;
        padding:9px 16px;border-radius:999px;box-shadow:0 6px 16px -6px rgba(0,0,0,.45);transition:transform .2s,box-shadow .2s}
      .nika-venc-franja.urgente .nika-venc-cta{color:#b91c1c}
      .nika-venc-cta:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 10px 20px -6px rgba(0,0,0,.5)}
      .nika-venc-acc{flex:none;display:flex;gap:4px}
      .nika-venc-acc button{width:30px;height:30px;border:0;border-radius:50%;cursor:pointer;background:rgba(255,255,255,.16);color:#fff;
        font-size:1rem;line-height:1;display:grid;place-items:center;transition:background .2s,transform .2s}
      .nika-venc-acc button:hover{background:rgba(255,255,255,.32);transform:scale(1.1)}
      @keyframes nikaVencFluir{to{background-position:300% 0}}
      @keyframes nikaVencSwing{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg)}}
      @keyframes nikaVencPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
      @keyframes nikaVencGlow{0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,.45)}50%{box-shadow:0 0 0 7px rgba(168,85,247,0)}}
      @keyframes nikaVencGlowRojo{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.5)}50%{box-shadow:0 0 0 7px rgba(220,38,38,0)}}
      @media (max-width:640px){
        .nika-venc-in{flex-wrap:wrap;gap:10px}.nika-venc-txt{flex-basis:calc(100% - 100px)}
        .nika-venc-cta{order:3}.nika-venc-chip .lbl{display:none}
      }
      @media (prefers-reduced-motion:reduce){
        .nika-venc-franja,.nika-venc-in,.nika-venc-chip,.nika-venc-ico,.nika-venc-chip .rel,.nika-venc-barra i{animation:none!important;transition:none!important}
      }`;
    document.head.appendChild(st);
  }

  function mostrar(dias, fin) {
    if (document.getElementById('nika-venc-franja')) return;
    inyectarCSS();

    const vencida = dias < 0;
    const urgente = dias <= 1;
    const fechaTxt = fin.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    const cuando = vencida ? 'ya venció' : dias === 0 ? 'vence <b>hoy</b>' : `vence en <b>${dias} ${dias === 1 ? 'día' : 'días'}</b> (${fechaTxt})`;
    const chipTxt = vencida ? 'Vencido' : dias === 0 ? 'Vence hoy' : `${dias} ${dias === 1 ? 'día' : 'días'}`;
    const pct = vencida ? 4 : Math.max(6, Math.min(100, (dias / DIAS_AVISO) * 100));

    // --- Franja debajo de la navbar ---
    const header = document.querySelector('header.top-header');
    const franja = document.createElement('div');
    franja.id = 'nika-venc-franja';
    franja.className = 'nika-venc-franja' + (urgente ? ' urgente' : '');
    franja.setAttribute('role', 'status');
    franja.innerHTML = `
      <div class="nika-venc-in">
        <span class="nika-venc-ico" aria-hidden="true">⏳</span>
        <div class="nika-venc-txt">Tu NikaMed+ ${cuando}. Renovalo para no perder los simuladores con IA ilimitados.
          <div class="nika-venc-barra" aria-hidden="true"><i></i></div></div>
        <a class="nika-venc-cta" href="${URL_RENOVAR}">Renovar ahora</a>
        <div class="nika-venc-acc">
          <button type="button" data-acc="min" aria-label="Minimizar aviso" title="Minimizar">–</button>
          <button type="button" data-acc="cerrar" aria-label="Quitar aviso por hoy" title="Quitar por hoy">×</button>
        </div>
      </div>`;
    const ajustarTop = () => { franja.style.top = (header ? header.offsetHeight : 0) + 'px'; };
    if (header) header.insertAdjacentElement('afterend', franja);
    else document.body.insertAdjacentElement('afterbegin', franja);
    ajustarTop();
    window.addEventListener('resize', ajustarTop);

    // --- Pastilla dentro de la navbar (estado minimizado) ---
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'nika-venc-chip' + (urgente ? ' urgente' : '');
    chip.setAttribute('aria-label', 'Ver aviso de vencimiento de NikaMed+');
    chip.title = 'Tu NikaMed+ está por vencer — tocá para ver el aviso';
    chip.innerHTML = `<span class="rel" aria-hidden="true">⏳</span><span class="lbl">${chipTxt}</span>`;
    const toggle = header && header.querySelector('.toggle-sidebar-btn');
    if (toggle) toggle.insertAdjacentElement('afterend', chip);
    else if (header) header.appendChild(chip);

    const barra = franja.querySelector('.nika-venc-barra i');
    function aplicar(estado) {
      const abierta = estado === 'expandido';
      franja.classList.toggle('abierta', abierta);
      if (barra) barra.style.width = abierta ? pct + '%' : '0';
      chip.classList.toggle('visible', estado === 'minimizado');
      ajustarTop();
    }
    const cambiar = (estado) => { guardarEstado(estado); aplicar(estado); };

    franja.querySelector('[data-acc="min"]').addEventListener('click', () => cambiar('minimizado'));
    franja.querySelector('[data-acc="cerrar"]').addEventListener('click', () => cambiar('cerrado'));
    chip.addEventListener('click', () => cambiar('expandido'));

    // Entrada animada: se monta cerrada y se abre en el siguiente frame
    const inicial = leerEstado();
    aplicar('cerrado');
    requestAnimationFrame(() => requestAnimationFrame(() => aplicar(inicial)));
  }

  async function revisar() {
    try {
      if (!window.NikaSupabase) return;
      await window.NikaSupabase.ready;
      const c = window.NikaSupabase.client;
      if (!c) return;
      const { data: { session } } = await c.auth.getSession();
      if (!session) return;
      const { data, error } = await c.from('profiles')
        .select('tipo_cuenta, fecha_fin_suscripcion').eq('id', session.user.id).maybeSingle();
      if (error || !data || String(data.tipo_cuenta).toLowerCase() !== 'premium' || !data.fecha_fin_suscripcion) return;
      const fin = new Date(data.fecha_fin_suscripcion);
      if (isNaN(fin)) return;
      const dias = Math.ceil((fin.getTime() - Date.now()) / 86400000);
      if (dias <= DIAS_AVISO) mostrar(dias, fin);
    } catch (_) { /* el aviso nunca debe romper la página */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(revisar, 1500));
  else setTimeout(revisar, 1500);
})();
