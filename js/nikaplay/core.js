/* NikaPlay — infraestructura común de los juegos (Fase 2).
   Solo lo que NikaWord necesita hoy: almacenamiento local por usuario, azar con semilla (para que más adelante
   varios jugadores reciban los mismos términos), récord local y una pantalla a pantalla completa.
   Sin red: los resultados oficiales/competitivos irán por Supabase en una etapa posterior. */
(function () {
  'use strict';
  var NP = window.NikaPlay = window.NikaPlay || {};

  function usuario() {
    try { var u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return String((u && (u.id || u.username)) || 'anon'); } catch (_) { return 'anon'; }
  }
  function clave(k) { return 'nika_np_' + k + '_' + usuario(); }
  function leer(k, def) { try { var v = localStorage.getItem(clave(k)); return v == null ? def : JSON.parse(v); } catch (_) { return def; } }
  function escribir(k, v) { try { localStorage.setItem(clave(k), JSON.stringify(v)); return true; } catch (_) { return false; } }
  function borrar(k) { try { localStorage.removeItem(clave(k)); } catch (_) {} }

  /** Quita acentos y deja solo A-Z (la Ñ no se usa en los términos). */
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, ''); }

  /** Generador pseudoaleatorio con semilla (mulberry32): misma semilla → misma secuencia. */
  function rng(semilla) {
    var a = semilla >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function mezclar(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function aviso(msg) { if (typeof window.showToast === 'function') window.showToast(msg); }
  function reducido() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /** Récord y estadísticas locales (por usuario y por dispositivo). */
  function stats(juego) { var s = leer('stats', {}); return s[juego] || { mejor: 0, partidas: 0, resueltos: 0, terminos: 0 }; }
  function guardarResultado(juego, r) {
    var s = leer('stats', {}), p = s[juego] || { mejor: 0, partidas: 0, resueltos: 0, terminos: 0 };
    var esRecord = r.puntos > p.mejor;
    p.partidas += 1; p.resueltos += r.resueltos || 0; p.terminos += r.terminos || 0; if (esRecord) p.mejor = r.puntos;
    s[juego] = p; escribir('stats', s);
    return { esRecord: esRecord, mejor: p.mejor, partidas: p.partidas };
  }

  /** Pantalla completa para un juego. El contenido lo pinta cada juego. */
  var pant = null, alCerrar = null;
  function abrirPantalla(clase, alCerrarFn) {
    cerrarPantalla(true);
    pant = document.createElement('div');
    pant.className = 'npg ' + (clase || '');
    pant.setAttribute('role', 'dialog'); pant.setAttribute('aria-modal', 'true');
    document.body.appendChild(pant);
    document.documentElement.classList.add('np-bloquea');
    alCerrar = alCerrarFn || null;
    return pant;
  }
  function cerrarPantalla(silencioso) {
    if (!pant) return;
    var f = alCerrar; alCerrar = null;
    pant.remove(); pant = null; document.documentElement.classList.remove('np-bloquea');
    if (f && !silencioso) f();
  }
  function pantalla() { return pant; }

  NP.core = { usuario: usuario, leer: leer, escribir: escribir, borrar: borrar, norm: norm, rng: rng, mezclar: mezclar, mmss: mmss, esc: esc, aviso: aviso, reducido: reducido, stats: stats, guardarResultado: guardarResultado, abrirPantalla: abrirPantalla, cerrarPantalla: cerrarPantalla, pantalla: pantalla };
})();
