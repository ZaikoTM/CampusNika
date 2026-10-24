// js/nikaAnalytics.js — estadísticas de visitas con Cloudflare Web Analytics (gratis, sin cookies ni seguimiento entre sitios).
// Se activa solo cuando CF_ANALYTICS_TOKEN tiene el token del sitio (Cloudflare → Analytics & Logs → Web Analytics → Add a site).
// Respeta la señal «No rastrear» del navegador. Vacío = no carga nada.
(function () {
  'use strict';
  const CF_ANALYTICS_TOKEN = '4dff99e793994d4f88dbdf2ace0cdb21';
  if (!CF_ANALYTICS_TOKEN || window.__nikaAnalytics) return;
  window.__nikaAnalytics = true;
  try { if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return; } catch (_) {}
  const s = document.createElement('script');
  s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_ANALYTICS_TOKEN }));
  document.head.appendChild(s);
})();
