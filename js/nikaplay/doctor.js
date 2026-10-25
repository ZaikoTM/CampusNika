/* NikaPlay — el doctor ilustrado (SVG) que acompaña al jugador, y el confeti de festejo.
   Un solo dibujo con distintas caras (data-e) y poses (data-p). Las animaciones viven en css/doctor.css y respetan
   prefers-reduced-motion. Lo usan NikaWord (nikaword.js) y FarmaMatch (farmamatch.js). */
(function () {
  'use strict';
  var NP = window.NikaPlay = window.NikaPlay || {};

  /* estado → { cara, pose }. Caras: n normal · feliz · grin (festejo) · oh (sorpresa) · triste · preocupado */
  var ESTADOS = {
    idle: { e: 'n', p: 'idle' }, hola: { e: 'feliz', p: 'hola' }, senala: { e: 'feliz', p: 'senala' }, piensa: { e: 'n', p: 'piensa' },
    ok: { e: 'feliz', p: 'ok' }, victoria: { e: 'grin', p: 'celebra' }, ups: { e: 'oh', p: 'idle' }, apura: { e: 'preocupado', p: 'reloj' },
    pista: { e: 'feliz', p: 'pista' }, derrota: { e: 'triste', p: 'idle' }, cambio: { e: 'feliz', p: 'senala' }
  };

  /** Busto del doctor: pelo castaño de puntas, ojos grandes, guardapolvo blanco, ambo azul, estetoscopio y credencial. */
  var SVG = '<svg class="dr-svg" viewBox="0 0 240 300" aria-hidden="true">' +
    '<g class="dr-cuerpo">' +
      /* brazo izquierdo del personaje (a la derecha de la pantalla) */
      '<g class="br br-d"><rect class="d-manga" x="150" y="168" width="30" height="62" rx="15"/><g class="ant"><rect class="d-manga" x="152" y="216" width="26" height="54" rx="13"/><rect class="d-puno" x="152" y="258" width="26" height="12" rx="6"/><g class="mano"><circle class="d-piel" cx="165" cy="278" r="14"/><rect class="d-dedo" x="160" y="250" width="10" height="26" rx="5"/></g></g></g>' +
      '<g class="br br-i"><rect class="d-manga" x="60" y="168" width="30" height="62" rx="15"/><g class="ant"><rect class="d-manga" x="62" y="216" width="26" height="54" rx="13"/><rect class="d-puno" x="62" y="258" width="26" height="12" rx="6"/><g class="mano"><circle class="d-piel" cx="75" cy="278" r="14"/></g></g></g>' +
      /* torso: ambo azul, guardapolvo blanco, credencial y estetoscopio */
      '<path class="d-ambo" d="M44 300c0-62 18-112 56-124h40c38 12 56 62 56 124z"/>' +
      '<path class="d-escote" d="M96 172l24 40 24-40z"/>' +
      '<path class="d-bata" d="M36 300c0-64 14-104 40-124l20-4 12 48-14 80z"/><path class="d-bata" d="M204 300c0-64-14-104-40-124l-20-4-12 48 14 80z"/>' +
      '<path class="d-solapa" d="M76 176l20-4 12 48-18-20z"/><path class="d-solapa" d="M164 176l-20-4-12 48 18-20z"/>' +
      '<rect class="d-cred" x="148" y="226" width="34" height="18" rx="4"/><text class="d-cred-t" x="165" y="239" text-anchor="middle">NikaMed</text>' +
      '<path class="d-tubo" d="M92 168c-14 26-12 56 4 72M148 168c14 26 12 56-4 72"/><path class="d-tubo" d="M96 240c6 10 18 12 24 4"/><circle class="d-pieza" cx="120" cy="250" r="10"/><circle class="d-pieza-i" cx="120" cy="250" r="5"/>' +
      '<rect class="d-piel" x="104" y="150" width="32" height="30" rx="10"/>' +
      /* cabeza */
      '<g class="dr-cabeza">' +
        '<ellipse class="d-piel" cx="70" cy="98" rx="9" ry="13"/><ellipse class="d-piel" cx="170" cy="98" rx="9" ry="13"/>' +
        '<ellipse class="d-piel" cx="120" cy="96" rx="49" ry="54"/>' +
        '<path class="d-pelo" d="M64 94C50 58 70 30 102 30l-12-22 24 14 10-22 8 24 20-12-4 26c24 8 38 30 30 64-8-22-24-34-50-34-30 0-46 12-58 32z"/>' +
        '<path class="d-pelo-b" d="M96 40l-4-14 12 8M124 32l6-14 4 16M150 42l10-8"/>' +
        '<circle class="d-rubor" cx="84" cy="116" r="9"/><circle class="d-rubor" cx="156" cy="116" r="9"/>' +
        '<g class="cejas"><path class="d-ceja c-i" d="M82 76q12-8 26-2"/><path class="d-ceja c-d" d="M132 74q14-6 26 2"/></g>' +
        '<g class="ojos"><ellipse class="d-esclera" cx="98" cy="96" rx="15" ry="17"/><ellipse class="d-esclera" cx="142" cy="96" rx="15" ry="17"/><circle class="d-iris" cx="100" cy="98" r="9"/><circle class="d-iris" cx="140" cy="98" r="9"/><circle class="d-brillo" cx="103" cy="94" r="3.4"/><circle class="d-brillo" cx="143" cy="94" r="3.4"/></g>' +
        '<g class="ojos-f"><path class="d-arco" d="M84 100q14-18 28 0M128 100q14-18 28 0"/></g>' +
        '<path class="d-nariz" d="M116 112q4 6 9 0"/>' +
        '<path class="b b-n" d="M98 126q22 16 44 0"/>' +
        '<g class="b b-g"><path class="d-boca" d="M94 124q26 34 52 0z"/><path class="d-dientes" d="M99 125h42q-4 8-21 9-17-1-21-9z"/></g>' +
        '<ellipse class="b b-o d-boca" cx="120" cy="132" rx="8" ry="10"/>' +
        '<path class="b b-t" d="M100 138q20-16 40 0"/><path class="b b-p" d="M100 134q7-6 14 0t14 0t12 0"/>' +
      '</g>' +
    '</g>' +
  '</svg>';

  /* ---------- poses en PNG (ilustraciones de alta calidad) ----------
     Si existe assets/nikaplay/doctor/doctor-idle.webp se usan las imágenes (WebP con fondo transparente, renderizadas desde el modelo 3D) (uno por pose, ver README de esa carpeta);
     si no existe, se dibuja el doctor SVG de arriba. Todas las poses deben tener el mismo lienzo para que no haya saltos al cambiar. */
  var PNG = { carpeta: 'assets/nikaplay/doctor/', ext: 'webp', listo: false, proporcion: '2 / 3', poses: ['idle', 'hola', 'senala', 'piensa', 'ok', 'victoria', 'ups', 'apura', 'pista', 'derrota', 'cambio'], hay: {} };
  function ruta(pose) { return PNG.carpeta + 'doctor-' + pose + '.' + PNG.ext; }
  function probarPng() {
    var img = new Image();
    img.onload = function () {
      PNG.listo = true; PNG.hay.idle = true; if (img.naturalWidth && img.naturalHeight) PNG.proporcion = img.naturalWidth + ' / ' + img.naturalHeight;
      PNG.poses.forEach(function (n) { if (n === 'idle') return; var i = new Image(); i.onload = function () { PNG.hay[n] = true; }; i.src = ruta(n); });
    };
    img.src = ruta('idle');
  }
  probarPng();
  function poseUsable(estado) { return PNG.hay[estado] ? estado : 'idle'; }

  /** Marca del doctor con globo de diálogo. opts: { lado: 'izq'|'der', clase } */
  function html(opts) {
    opts = opts || {};
    if (PNG.listo) return '<div class="dr dr-png dr-' + (opts.lado || 'der') + (opts.clase ? ' ' + opts.clase : '') + '" data-e="n" data-p="idle" data-estado="idle" style="--dr-asp:' + (opts.asp || PNG.proporcion) + '"><div class="dr-burbuja" role="status" aria-live="polite"></div><img class="dr-img" src="' + (opts.src || ruta('idle')) + '" alt="" draggable="false"></div>';
    return '<div class="dr dr-' + (opts.lado || 'der') + (opts.clase ? ' ' + opts.clase : '') + '" data-e="n" data-p="idle" data-estado="idle"><div class="dr-burbuja" role="status" aria-live="polite"></div>' + SVG + '</div>';
  }

  var timers = new WeakMap();
  /** Cambia de estado (cara + pose) y dice algo; vuelve al estado base pasado un rato (a menos que sea 'persistente'). */
  function decir(root, estado, texto, ms, base) {
    var d = root && (root.classList && root.classList.contains('dr') ? root : root.querySelector && root.querySelector('.dr')); if (!d) return;
    var s = ESTADOS[estado] || ESTADOS.idle; d.dataset.e = s.e; d.dataset.p = s.p; d.dataset.estado = estado;
    var im = d.querySelector('.dr-img'); if (im && !d.classList.contains('dr-fijo')) { var u = ruta(poseUsable(estado)); if (im.getAttribute('src') !== u) im.setAttribute('src', u); }
    var b = d.querySelector('.dr-burbuja');
    if (b && texto != null) { b.textContent = texto; b.classList.remove('on'); void b.offsetWidth; b.classList.toggle('on', !!texto); b.hidden = !texto; }
    clearTimeout(timers.get(d));
    if (estado !== 'idle' && ms !== 0) {
      timers.set(d, setTimeout(function () { var bb = base || {}; decir(d, bb.estado || 'idle', bb.texto != null ? bb.texto : '', 0); }, ms || 2400));
    }
  }

  /** Confeti y estrellas de festejo dentro de un contenedor (no bloquea clics). */
  function confeti(cont, n) {
    if (!cont || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var cols = ['#fbbf24', '#38bdf8', '#34d399', '#f472b6', '#fb923c', '#a78bfa', '#ffffff'], capa = document.createElement('div'); capa.className = 'dr-confeti'; capa.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < (n || 34); i++) {
      var c = document.createElement('i'), x = Math.random() * 100;
      c.style.cssText = 'left:' + x + '%;background:' + cols[i % cols.length] + ';--dx:' + ((Math.random() - 0.5) * 160) + 'px;--r:' + (Math.random() * 720 - 360) + 'deg;animation-delay:' + (Math.random() * 0.35) + 's;animation-duration:' + (1.6 + Math.random() * 1.2) + 's';
      if (i % 5 === 0) c.className = 'estrella';
      capa.appendChild(c);
    }
    cont.appendChild(capa); setTimeout(function () { capa.remove(); }, 3200);
  }

  NP.doctor = { html: html, decir: decir, confeti: confeti, estados: ESTADOS, png: PNG };
})();
