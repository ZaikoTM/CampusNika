// js/ateneoGlobal.js — mantiene la sala de Ateneos (y los chats de voz privados) disponible en TODAS las páginas.
// Cada página se carga de nuevo al navegar; si hay una llamada activa guardada, carga el motor de voz y se reconecta sola.
(function () {
  'use strict';
  if (window.NikaAteneos || window.__ateneoGlobal) return;
  window.__ateneoGlobal = true;
  let a = null;
  try { a = JSON.parse(localStorage.getItem('nika_ateneo_activo') || 'null'); } catch (_) {}
  if (!a || Date.now() - (a.t || 0) > 12 * 3600 * 1000) return;
  const cargar = (src) => new Promise((ok) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(true); s.onerror = () => ok(false); document.head.appendChild(s); });
  (async () => {
    if (!window.NikaSupabase) {
      if (!window.supabase) await cargar('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      if (!window.NikaSupabase) await cargar('supabaseClient.js');
    }
    if (!window.VoiceManager) await cargar('js/voiceManager.js?v=3');
    await cargar('js/ateneos.js?v=9');
  })();
})();
