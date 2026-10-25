/* NikaPlay — kit de decorado ilustrado (SVG/CSS, sin imágenes): estantería de libros, ventana, lámpara, pila de libros, taza,
   cuaderno y cuadro. Cada juego los compone en su escena (ver css/decor.css). Todo es decorativo (aria-hidden). */
(function () {
  'use strict';
  var NP = window.NikaPlay = window.NikaPlay || {};

  function rnd(sem) { var a = sem >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /** Estantería con libros de colores. opts: { filas, ancho, alto, paleta, madera, semilla } */
  function libreria(o) {
    o = o || {}; var filas = o.filas || 3, W = o.ancho || 200, H = o.alto || 300, pal = o.paleta || ['#e0524a', '#3b82f6', '#f2b630', '#2fa56a', '#8b5cf6', '#f2884b', '#22b5c7'], madera = o.madera || '#9a6a3a', r = rnd(o.semilla || 7);
    var alto = (H - 16) / filas, s = '<svg class="dc-libreria" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><rect x="0" y="0" width="' + W + '" height="' + H + '" rx="8" fill="' + madera + '" opacity=".92"/><rect x="8" y="8" width="' + (W - 16) + '" height="' + (H - 16) + '" fill="rgba(0,0,0,.28)"/>';
    for (var f = 0; f < filas; f++) {
      var y0 = 8 + f * alto, base = y0 + alto, x = 12;
      while (x < W - 22) {
        var w = 9 + Math.floor(r() * 10), h = alto * (.55 + r() * .38), c = pal[Math.floor(r() * pal.length)], incl = r() < .08;
        s += '<g' + (incl ? ' transform="rotate(8 ' + (x + w / 2) + ' ' + base + ')"' : '') + '><rect x="' + x + '" y="' + (base - 6 - h) + '" width="' + w + '" height="' + h + '" rx="2" fill="' + c + '" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><rect x="' + x + '" y="' + (base - 6 - h + 6) + '" width="' + w + '" height="3" fill="rgba(255,255,255,.45)"/><rect x="' + x + '" y="' + (base - 6 - 10) + '" width="' + w + '" height="3" fill="rgba(255,255,255,.35)"/></g>';
        x += w + 1.5;
      }
      s += '<rect x="4" y="' + (base - 6) + '" width="' + (W - 8) + '" height="8" rx="2" fill="' + madera + '" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  }

  /** Ventana con cielo. estilo 'ciudad' (celeste, edificios) o 'botica' (arco de madera, luz cálida). */
  function ventana(o) {
    o = o || {}; var botica = o.estilo === 'botica', W = 220, H = 260, marco = botica ? '#7a4a22' : '#ffffff', cielo1 = botica ? '#ffe0a8' : '#8fd3ff', cielo2 = botica ? '#bfe0ff' : '#d8f1ff';
    var forma = botica ? 'M14 ' + H + 'V96a96 96 0 0 1 192 0V' + H + 'z' : 'M14 14h192v' + (H - 14) + 'H14z';
    var edif = '', xs = [20, 52, 84, 112, 146, 176], hs = [90, 130, 70, 150, 100, 120], cs = botica ? ['#8f6b4a', '#7b5a40', '#a07c58', '#6e4f38', '#8f6b4a', '#7b5a40'] : ['#6fb0e8', '#4f94d8', '#82c0f0', '#4488cc', '#6fb0e8', '#5a9fe0'];
    for (var i = 0; i < xs.length; i++) edif += '<rect x="' + xs[i] + '" y="' + (H - hs[i]) + '" width="' + (i % 2 ? 28 : 32) + '" height="' + hs[i] + '" fill="' + cs[i] + '"/>' + '<rect x="' + (xs[i] + 6) + '" y="' + (H - hs[i] + 10) + '" width="6" height="8" fill="rgba(255,255,255,.55)"/><rect x="' + (xs[i] + 16) + '" y="' + (H - hs[i] + 10) + '" width="6" height="8" fill="rgba(255,255,255,.55)"/>';
    return '<svg class="dc-ventana" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><defs><linearGradient id="dcCielo' + (botica ? 'B' : 'C') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + cielo1 + '"/><stop offset="1" stop-color="' + cielo2 + '"/></linearGradient><clipPath id="dcClip' + (botica ? 'B' : 'C') + '"><path d="' + forma + '"/></clipPath></defs>' +
      '<path d="' + forma + '" fill="url(#dcCielo' + (botica ? 'B' : 'C') + ')"/><g clip-path="url(#dcClip' + (botica ? 'B' : 'C') + ')"><circle cx="150" cy="70" r="26" fill="#fff6c4" opacity=".85"/><ellipse cx="60" cy="60" rx="30" ry="11" fill="#fff" opacity=".9"/><ellipse cx="84" cy="52" rx="22" ry="10" fill="#fff" opacity=".9"/>' + edif + '</g>' +
      '<path d="' + forma + '" fill="none" stroke="' + marco + '" stroke-width="12" stroke-linejoin="round"/><path d="M110 ' + (botica ? 4 : 14) + 'V' + H + 'M14 150H206" stroke="' + marco + '" stroke-width="7"/></svg>';
  }

  function lampara() {
    return '<svg class="dc-lampara" viewBox="0 0 120 150" aria-hidden="true"><path d="M30 20c18-12 62-12 80 4l6 30c-30 12-64 12-92 0z" fill="#1f7a55" stroke="#0e4a33" stroke-width="3"/><path d="M34 30c20-8 54-8 72 2" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="4" stroke-linecap="round"/><ellipse cx="72" cy="58" rx="30" ry="9" fill="#ffd97a"/><path d="M70 62c-6 30 6 50-6 78" fill="none" stroke="#c9a24b" stroke-width="7" stroke-linecap="round"/><ellipse cx="62" cy="142" rx="30" ry="8" fill="#b8892f" stroke="#7a5a1c" stroke-width="2"/></svg>';
  }

  /** Pila de libros con título en el lomo. titulos: [['Medicina', '#2f9a62'], ...] */
  function libros(titulos) {
    return '<div class="dc-libros" aria-hidden="true">' + titulos.map(function (t, i) { return '<span style="--c:' + t[1] + ';--w:' + (150 - i * 14) + 'px;--x:' + (i % 2 ? 8 : 0) + 'px">' + t[0] + '</span>'; }).join('') + '</div>';
  }
  function taza(txt) { return '<div class="dc-taza" aria-hidden="true"><b>' + (txt || 'NikaMed') + '</b></div>'; }
  function cuaderno() { return '<div class="dc-cuaderno" aria-hidden="true"><i></i><i></i><i></i><em></em></div>'; }
  function cuadro(tipo) {
    var ecg = '<path d="M8 44h26l8-22 12 40 10-26h28" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    var corazon = '<path d="M50 78C20 56 14 36 28 24c10-8 20-2 22 6 2-8 12-14 22-6 14 12 8 32-22 54z" fill="#f87171" stroke="#b91c1c" stroke-width="3"/>';
    return '<svg class="dc-cuadro" viewBox="0 0 100 100" aria-hidden="true"><rect x="3" y="3" width="94" height="94" rx="8" fill="#fff8e6" stroke="#8a5a2b" stroke-width="5"/>' + (tipo === 'corazon' ? corazon : ecg) + '</svg>';
  }

  NP.decor = { libreria: libreria, ventana: ventana, lampara: lampara, libros: libros, taza: taza, cuaderno: cuaderno, cuadro: cuadro };
})();
