// CAMPUS NIKA — pantalla de bienvenida: fondo violeta espacial con auroras suaves (el mismo lenguaje visual del index) y la N de Nika quieta al centro.
// Una vez por sesión; continúa la pantalla de arranque de la app instalada (PWA) y se retira sola cuando la página terminó de cargar.
(function () {
  'use strict';
  try { if (sessionStorage.getItem('nika_splash') === '1') return; sessionStorage.setItem('nika_splash', '1'); } catch (_) {}
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var css = '#nika-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;overflow:hidden;' +
    'background:radial-gradient(1000px 700px at 50% 38%,#1c0f45 0%,#0f0730 50%,#070318 100%);transition:opacity .7s ease,visibility .7s}' +
    '#nika-splash.fuera{opacity:0;visibility:hidden}' +
    '#nika-splash .ns-s-aur{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;opacity:.55}' +
    '#nika-splash .ns-s-aur.a{width:60vmax;height:60vmax;left:-18vmax;top:-22vmax;background:radial-gradient(circle,rgba(168,85,247,.55),transparent 65%);animation:nsSA 14s ease-in-out infinite alternate}' +
    '#nika-splash .ns-s-aur.b{width:55vmax;height:55vmax;right:-20vmax;bottom:-24vmax;background:radial-gradient(circle,rgba(99,102,241,.5),transparent 65%);animation:nsSB 17s ease-in-out infinite alternate}' +
    '#nika-splash .ns-s-aur.c{width:40vmax;height:40vmax;left:30vw;top:30vh;background:radial-gradient(circle,rgba(124,58,237,.35),transparent 65%);animation:nsSC 12s ease-in-out infinite alternate}' +
    '#nika-splash .ns-s-est{position:absolute;inset:0;pointer-events:none}' +
    '#nika-splash .ns-s-est i{position:absolute;width:2px;height:2px;border-radius:50%;background:#e9d5ff;opacity:.15;animation:nsST var(--d,4s) ease-in-out infinite;animation-delay:var(--w,0s)}' +
    '#nika-splash .ns-s-logo{position:relative;z-index:2;width:clamp(120px,26vmin,170px);display:grid;place-items:center;animation:nsSIn 1s ease-out}' +
    '#nika-splash .ns-s-logo::before{content:"";position:absolute;inset:-40%;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,.38),rgba(168,85,247,0) 62%);animation:nsSResp 5s ease-in-out infinite}' +
    '#nika-splash .ns-s-logo img{position:relative;width:100%;height:auto;display:block}' +
    '#nika-splash .ns-s-txt{position:relative;z-index:2;font:700 .8rem "Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:.5em;padding-left:.5em;color:#e9d5ff;animation:nsSIn 1.2s ease-out .25s backwards}' +
    '#nika-splash .ns-s-barra{position:relative;z-index:2;width:clamp(110px,22vmin,150px);height:2px;border-radius:2px;background:rgba(192,132,252,.2);overflow:hidden;animation:nsSIn 1.2s ease-out .4s backwards}' +
    '#nika-splash .ns-s-barra b{display:block;height:100%;width:45%;border-radius:2px;background:linear-gradient(90deg,transparent,#c084fc,transparent);animation:nsSBarra 1.7s ease-in-out infinite}' +
    '@keyframes nsSA{to{transform:translate(14vw,10vh) scale(1.15)}}@keyframes nsSB{to{transform:translate(-14vw,-8vh) scale(1.1)}}@keyframes nsSC{to{transform:translate(-8vw,6vh) scale(1.25);opacity:.8}}' +
    '@keyframes nsST{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.7;transform:scale(1.6)}}' +
    '@keyframes nsSResp{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.06)}}' +
    '@keyframes nsSIn{from{opacity:0;transform:translateY(8px)}}' +
    '@keyframes nsSBarra{0%{transform:translateX(-120%)}100%{transform:translateX(260%)}}';
  var st = document.createElement('style'); st.id = 'nika-splash-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st);
  var estrellas = ''; for (var i = 0; i < 46; i++) estrellas += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (3 + Math.random() * 4).toFixed(1) + 's;--w:-' + (Math.random() * 5).toFixed(1) + 's"></i>';
  var el = document.createElement('div'); el.id = 'nika-splash'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="ns-s-aur a"></span><span class="ns-s-aur b"></span><span class="ns-s-aur c"></span><div class="ns-s-est">' + estrellas + '</div>' +
    '<div class="ns-s-logo"><img src="assets/N%20NIKA.png" alt=""></div><div class="ns-s-txt">CAMPUS NIKA</div><div class="ns-s-barra"><b></b></div>';
  (document.body || document.documentElement).appendChild(el);
  var t0 = Date.now(), cerrado = false;
  function cerrar() { if (cerrado) return; cerrado = true; el.classList.add('fuera'); setTimeout(function () { el.remove(); st.remove(); }, 900); }
  function listo() { setTimeout(cerrar, Math.max(0, 1500 - (Date.now() - t0))); }
  if (document.readyState === 'complete') listo(); else window.addEventListener('load', listo);
  setTimeout(cerrar, 4500);   // red de seguridad: nunca tapa la página
})();
