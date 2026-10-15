/* CAMPUS NIKA · Voz local: envoltorio para usar las voces Piper (js/vozLocalWorker.js) desde cualquier página.
   window.NikaVozLocal = { VOCES, soportado, guardadas, descargar, borrar, sintetizar } */
(function () {
  'use strict';
  if (window.NikaVozLocal) return;
  const VOCES = {
    ar_f: { id: 'es_AR-daniela-high', nombre: 'Femenina argentina', ico: '🇦🇷', g: '👩‍⚕️', mb: 114, detalle: 'Acento argentino · calidad alta' },
    lat_m: { id: 'es_MX-ald-medium', nombre: 'Masculina latina', ico: '🌎', g: '👨‍⚕️', mb: 63, detalle: 'Español latino · calidad media' }
  };
  const BASE_SCRIPT = (document.currentScript && document.currentScript.src) || (location.origin + '/js/vozLocal.js');
  let worker = null, seq = 0;
  const espera = new Map();
  const cache = new Map();

  const soportado = () => !!(window.Worker && window.WebAssembly && navigator.storage && navigator.storage.getDirectory);

  function obtener() {
    if (worker) return worker;
    worker = new Worker(new URL('vozLocalWorker.js', BASE_SCRIPT), { type: 'module' });
    worker.onmessage = (ev) => {
      const m = ev.data || {}, w = espera.get(m.id); if (!w) return;
      if (m.tipo === 'progreso') { if (w.progreso) w.progreso(m.cargado, m.total); return; }
      espera.delete(m.id);
      if (m.tipo === 'error') w.rechazar(new Error(m.mensaje)); else w.resolver(m);
    };
    worker.onerror = (e) => {
      const err = new Error('No se pudo iniciar la voz local' + (e && e.message ? ': ' + e.message : ''));
      espera.forEach((w) => w.rechazar(err)); espera.clear(); try { worker.terminate(); } catch (_) {} worker = null;
    };
    return worker;
  }
  function llamar(cmd, datos, progreso, transfer) {
    return new Promise((resolver, rechazar) => {
      let w; try { w = obtener(); } catch (e) { return rechazar(e); }
      const id = ++seq; espera.set(id, { resolver, rechazar, progreso });
      w.postMessage(Object.assign({ id, cmd }, datos || {}), transfer || []);
    });
  }

  async function guardadas() { if (!soportado()) return []; try { return (await llamar('guardadas')).voces || []; } catch (_) { return []; } }
  async function descargar(clave, progreso) {
    const v = VOCES[clave]; if (!v) throw new Error('Voz desconocida.');
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}
    await llamar('descargar', { voz: v.id }, progreso);
  }
  async function borrar(clave) { const v = VOCES[clave]; if (v) { await llamar('borrar', { voz: v.id }); cache.clear(); } }
  // Devuelve una URL de audio WAV con el texto sintetizado (con caché en memoria para repeticiones).
  async function sintetizar(clave, texto, progreso) {
    const v = VOCES[clave]; if (!v) throw new Error('Voz desconocida.');
    const k = clave + '|' + texto; if (cache.has(k)) return cache.get(k);
    const r = await llamar('hablar', { voz: v.id, texto }, progreso);
    const url = URL.createObjectURL(new Blob([r.wav], { type: 'audio/wav' }));
    if (cache.size > 40) cache.clear();
    cache.set(k, url); return url;
  }

  window.NikaVozLocal = { VOCES, soportado, guardadas, descargar, borrar, sintetizar };
})();
