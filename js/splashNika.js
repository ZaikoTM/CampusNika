// CAMPUS NIKA — pantalla de bienvenida animada: la N de Nika con anillos que giran y ondas de luz, una vez por sesión.
// Continúa la pantalla de arranque de la app instalada (PWA) y se retira sola apenas la página termina de cargar.
(function () {
  'use strict';
  try { if (sessionStorage.getItem('nika_splash') === '1') return; sessionStorage.setItem('nika_splash', '1'); } catch (_) {}
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var css = '#nika-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;' +
    'background:radial-gradient(900px 600px at 50% 42%,#0f2a5c 0%,#0a192f 55%,#050b16 100%);transition:opacity .6s ease,transform .6s ease,visibility .6s}' +
    '#nika-splash.fuera{opacity:0;visibility:hidden;transform:scale(1.06)}' +
    '#nika-splash .ns-s-logo{position:relative;width:clamp(150px,34vmin,220px);height:clamp(150px,34vmin,220px);display:grid;place-items:center}' +
    '#nika-splash .ns-s-logo img{position:relative;z-index:3;width:56%;height:auto;}' +
    '#nika-splash .ns-s-halo{position:absolute;inset:-18%;border-radius:50%;z-index:0;background:radial-gradient(circle,rgba(56,189,248,.55) 0%,rgba(99,102,241,.32) 38%,rgba(56,189,248,0) 68%);animation:nsSLate 1.5s ease-in-out infinite}' +
    '#nika-splash .ns-s-halo.b{inset:-36%;background:radial-gradient(circle,rgba(167,139,250,.28) 0%,rgba(167,139,250,0) 65%);animation-delay:.12s}' +
    '#nika-splash .ns-s-lat{position:absolute;inset:6%;border-radius:50%;z-index:1;border:2px solid rgba(125,211,252,.7);box-shadow:0 0 22px rgba(56,189,248,.65),inset 0 0 18px rgba(56,189,248,.35);animation:nsSLate 1.5s ease-in-out infinite}' +
    '#nika-splash .ns-s-aro{position:absolute;inset:0;border-radius:50%;z-index:2;-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));' +
    'background:conic-gradient(from 0deg,rgba(56,189,248,0),#38bdf8 35%,#a78bfa 70%,rgba(167,139,250,0));animation:nsSGira 1.6s linear infinite}' +
    '#nika-splash .ns-s-aro.b{inset:14%;animation-duration:2.4s;animation-direction:reverse;background:conic-gradient(from 90deg,rgba(251,191,36,0),#fbbf24 40%,#38bdf8 75%,rgba(56,189,248,0))}' +
    '#nika-splash .ns-s-onda{position:absolute;inset:18%;border-radius:50%;border:2px solid rgba(56,189,248,.55);z-index:1;animation:nsSOnda 1.8s ease-out infinite}' +
    '#nika-splash .ns-s-onda.b{animation-delay:.6s}#nika-splash .ns-s-onda.c{animation-delay:1.2s}' +
    '#nika-splash .ns-s-orb{position:absolute;inset:0;z-index:2;animation:nsSGira 3.6s linear infinite}' +
    '#nika-splash .ns-s-orb i{position:absolute;left:50%;top:-4px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:#fde68a;box-shadow:0 0 12px 3px rgba(253,230,138,.8)}' +
    '#nika-splash .ns-s-orb.b{animation-duration:5.2s;animation-direction:reverse}#nika-splash .ns-s-orb.b i{background:#7dd3fc;box-shadow:0 0 12px 3px rgba(125,211,252,.8);top:auto;bottom:-4px}' +
    '#nika-splash .ns-s-txt{font:800 .95rem "Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:.42em;color:#e0f2fe;padding-left:.42em;animation:nsSTxt 1.2s ease-out .2s backwards}' +
    '#nika-splash .ns-s-txt small{display:block;text-align:center;margin-top:6px;font-size:.62rem;letter-spacing:.3em;color:#7dd3fc;font-weight:700}' +
    '#nika-splash .ns-s-barra{width:clamp(120px,26vmin,170px);height:3px;border-radius:3px;background:rgba(148,163,184,.25);overflow:hidden}' +
    '#nika-splash .ns-s-barra b{display:block;height:100%;width:40%;border-radius:3px;background:linear-gradient(90deg,#38bdf8,#a78bfa);animation:nsSBarra 1.3s ease-in-out infinite}' +
    '@keyframes nsSGira{to{transform:rotate(360deg)}}' +
    '@keyframes nsSLate{0%{transform:scale(.9);opacity:.55}14%{transform:scale(1.12);opacity:1}28%{transform:scale(.97);opacity:.7}42%{transform:scale(1.18);opacity:1}70%,100%{transform:scale(.9);opacity:.55}}' +
    '@keyframes nsSOnda{0%{transform:scale(.7);opacity:.9}100%{transform:scale(1.7);opacity:0}}' +
    '@keyframes nsSTxt{from{opacity:0;transform:translateY(10px)}}' +
    '@keyframes nsSBarra{0%{transform:translateX(-110%)}100%{transform:translateX(280%)}}';
  var st = document.createElement('style'); st.id = 'nika-splash-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st);
  var el = document.createElement('div'); el.id = 'nika-splash'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="ns-s-logo"><span class="ns-s-halo b"></span><span class="ns-s-halo"></span><span class="ns-s-lat"></span><span class="ns-s-onda"></span><span class="ns-s-onda b"></span><span class="ns-s-onda c"></span><span class="ns-s-aro"></span><span class="ns-s-aro b"></span>' +
    '<span class="ns-s-orb"><i></i></span><span class="ns-s-orb b"><i></i></span><img src="assets/N%20NIKA.png" alt=""></div>' +
    '<div class="ns-s-txt">CAMPUS NIKA<small>APRENDER · ENTRENAR · MEJORAR</small></div><div class="ns-s-barra"><b></b></div>';
  (document.body || document.documentElement).appendChild(el);
  var t0 = Date.now(), cerrado = false;
  function cerrar() { if (cerrado) return; cerrado = true; el.classList.add('fuera'); setTimeout(function () { el.remove(); st.remove(); }, 800); }
  function listo() { var resta = Math.max(0, 1500 - (Date.now() - t0)); setTimeout(cerrar, resta); }
  if (document.readyState === 'complete') listo(); else window.addEventListener('load', listo);
  setTimeout(cerrar, 4500);   // red de seguridad: nunca tapa la página
})();
