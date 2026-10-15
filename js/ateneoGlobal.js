// js/ateneoGlobal.js — mantiene la sala de Ateneos (y los chats de voz privados) disponible en TODAS las páginas.
// Cada página se carga de nuevo al navegar; si hay una llamada activa guardada, carga el motor de voz y se reconecta sola.
(function () {
  'use strict';
  if (window.NikaAteneos || window.__ateneoGlobal) return;
  window.__ateneoGlobal = true;
  // el tono de llamada entrante se carga en todas las páginas (queda desbloqueado con el primer toque o tecla)
  try { if (!window.NikaRing) { const r = document.createElement('script'); r.src = 'js/nikaRing.js?v=2'; document.head.appendChild(r); } } catch (_) {}
  // Si la llamada vive en la ventana anfitriona (sin cortes), esta página solo muestra la barra remota
  const hostVivoSync = () => { try { return Date.now() - Number(localStorage.getItem('nika_ateneo_host') || 0) < 15000; } catch (_) { return false; } };
  const hostConCandado = async () => { try { if (!(navigator.locks && navigator.locks.query)) return false; const q = await navigator.locks.query(); return (q.held || []).some((l) => l.name === 'nika-ateneo-host'); } catch (_) { return false; } };
  const cargarRemoto = () => { const sc = document.createElement('script'); sc.src = 'js/ateneoRemoto.js?v=5'; document.head.appendChild(sc); };
  if (hostVivoSync()) { cargarRemoto(); return; }
  let a = null;
  try { a = JSON.parse(localStorage.getItem('nika_ateneo_activo') || 'null'); } catch (_) {}
  if (!a || Date.now() - (a.t || 0) > 12 * 3600 * 1000) return;
  const cargar = (src) => new Promise((ok) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(true); s.onerror = () => ok(false); document.head.appendChild(s); });
  (async () => {
    if (await hostConCandado()) { cargarRemoto(); return; }
    if (!window.NikaSupabase) {
      if (!window.supabase) await cargar('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      if (!window.NikaSupabase) await cargar('supabaseClient.js');
    }
    if (!window.VoiceManager) await cargar('js/voiceManager.js?v=3');
    await cargar('js/ateneos.js?v=17');
  })();
})();
