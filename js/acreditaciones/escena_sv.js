// CAMPUS NIKA — Atlas de acreditaciones: escena de colocación de sonda vesical.
// Dibuja un esquema SVG interactivo (corte sagital de pelvis + mesa de materiales + entorno de la cama).
// El estado visual se maneja con clases CSS sobre el <svg> (ver css/acreditaciones.css), así que la escena
// se construye una sola vez por sexo y el motor solo activa/desactiva clases.
window.ACR_ESCENAS = window.ACR_ESCENAS || {};
window.ACR_ESCENAS.sv = (function () {
  const hs = (id, inner, extra) => `<g class="hs" data-hs="${id}" tabindex="0" role="button"${extra || ''}>${inner}</g>`;

  // Tarjeta de la mesa de materiales (emoji + etiqueta)
  function carta(id, x, y, emoji, l1, l2) {
    return hs(id, `
      <g transform="translate(${x},${y})">
        <rect class="hs-bg card" width="98" height="74" rx="10"/>
        <text class="emo" x="49" y="34" text-anchor="middle">${emoji}</text>
        <text class="lbl" x="49" y="53" text-anchor="middle">${l1}</text>
        <text class="lbl" x="49" y="66" text-anchor="middle">${l2 || ''}</text>
        <text class="ok" x="86" y="16" text-anchor="middle">✔</text>
      </g>`);
  }

  function mesa() {
    const c = [
      ['iodo', 0, 0, '🧼', 'Iodopovidona', 'jabonoso'],
      ['guantes-ns', 106, 0, '🧤', 'Guantes', 'no estériles'],
      ['panos-ns', 212, 0, '🧻', 'Paños clínicos', 'no estériles'],
      ['guantes-e', 0, 82, '🧤', 'Guantes', 'estériles'],
      ['pano-e', 106, 82, '🟦', 'Paño', 'estéril'],
      ['campo-aux', 212, 82, '🟦', 'Paño estéril', 'adicional'],
      ['pack', 0, 164, '📦', 'Pack estéril', 'con sonda'],
      ['sonda', 106, 164, '🪢', 'Sonda Foley', '(balón)'],
      ['gel', 212, 164, '🧴', 'Lidocaína', 'gel'],
      ['jeringa', 0, 246, '💉', 'Jeringa con', 'agua bidestilada'],
      ['bolsa', 106, 246, '🛍️', 'Bolsa', 'colectora'],
      ['cinta', 212, 246, '🩹', 'Cinta', 'hipoalergénica'],
    ].map((a) => carta(...a)).join('');
    return `
    <g transform="translate(640,50)">
      ${hs('mesa', `<rect class="hs-bg mesa-bg" x="-8" y="-34" width="324" height="372" rx="14"/>
        <text class="ttl" x="154" y="-14" text-anchor="middle">🛒 Mesa alta de traslado</text>`)}
      ${c}
    </g>`;
  }

  function anatomia(sexo) {
    const comunes = `
      <rect class="bone" x="108" y="100" width="28" height="78" rx="13"/>
      <text class="lbl" x="122" y="96" text-anchor="middle">Sínfisis</text>
      <path class="sacro" d="M480,28 Q512,150 450,262"/>
      <path class="recto" d="M432,38 Q446,150 410,232 L424,268"/>
      <text class="lbl" x="452" y="150">Recto</text>
      <ellipse class="vejiga" cx="242" cy="116" rx="86" ry="62"/>
      <text class="lbl-v" x="242" y="112" text-anchor="middle">Vejiga</text>
      <text class="lbl-v sm" x="242" y="128" text-anchor="middle">orina</text>`;
    if (sexo === 'F') {
      return `${comunes}
      <ellipse class="utero" cx="334" cy="84" rx="44" ry="28" transform="rotate(-22 334 84)"/>
      <text class="lbl" x="346" y="62" text-anchor="middle">Útero</text>
      <path class="vagina" d="M146,248 Q232,238 306,198"/>
      <text class="lbl" x="236" y="232" text-anchor="middle">Vagina</text>
      <path class="uretra" d="M180,164 L148,236"/>
      <text class="lbl" x="104" y="214" text-anchor="end">Uretra (≈ 4 cm)</text>
      <text class="lbl" x="116" y="254" text-anchor="end">Meato</text>
      ${hs('uretra', `<path class="hs-bg ur-hit" d="M180,164 L148,236"/>`)}
      <path class="cat" d="M62,270 L146,240 L180,162 L212,132"/>
      <g class="balon"><circle class="bal" cx="206" cy="138" r="5"/></g>
      ${hs('balon', `<circle class="hs-bg bal-hit" cx="206" cy="138" r="26"/>`)}
      <path class="drenaje" d="M62,270 L62,268"/>`;
    }
    return `${comunes}
      <circle class="prostata" cx="190" cy="192" r="28"/>
      <text class="lbl" x="232" y="196">Próstata</text>
      <rect class="pene" x="44" y="244" width="116" height="30" rx="14"/>
      <ellipse class="escroto" cx="196" cy="292" rx="36" ry="20"/>
      <path class="uretra" d="M180,164 L190,216 Q192,258 152,259 L52,259"/>
      <text class="lbl" x="104" y="236" text-anchor="middle">Uretra masculina (≈ 18-20 cm)</text>
      ${hs('uretra', `<path class="hs-bg ur-hit" d="M180,164 L190,216 Q192,258 152,259 L52,259"/>`)}
      <path class="cat" d="M18,259 L152,259 Q192,258 190,216 L180,164 L212,132"/>
      <g class="balon"><circle class="bal" cx="206" cy="138" r="5"/></g>
      ${hs('balon', `<circle class="hs-bg bal-hit" cx="206" cy="138" r="26"/>`)}
      ${hs('prepucio', `<circle class="hs-bg prep-hit" cx="56" cy="259" r="20"/><text class="lbl" x="86" y="290" text-anchor="middle">Prepucio / meato</text>`)}`;
  }

  function bolsa(sexo) {
    const x = sexo === 'F' ? 20 : 0;
    const topX = sexo === 'F' ? 62 : 18;
    return `
      <g class="bolsa-dibujo" transform="translate(${x},0)">
        <path class="tubo" d="M${topX - x},${sexo === 'F' ? 270 : 259} L${topX - x},282"/>
        <rect class="bolsa-r" x="${topX - x - 26}" y="282" width="56" height="30" rx="8"/>
        <rect class="bolsa-o" x="${topX - x - 22}" y="296" width="48" height="14" rx="6"/>
        <line class="piso" x1="${topX - x - 40}" y1="316" x2="${topX - x + 60}" y2="316"/>
      </g>`;
  }

  function entorno() {
    return `
    <g transform="translate(20,350)">
      ${hs('lavabo', `<rect class="hs-bg card" width="66" height="74" rx="10"/><text class="emo" x="33" y="36" text-anchor="middle">🚰</text><text class="lbl" x="33" y="56" text-anchor="middle">Lavabo</text><text class="ok" x="54" y="16" text-anchor="middle">✔</text>`)}
      ${hs('hc', `<g transform="translate(74,0)"><rect class="hs-bg card" width="78" height="74" rx="10"/><text class="emo" x="39" y="36" text-anchor="middle">📋</text><text class="lbl" x="39" y="54" text-anchor="middle">Historia clínica</text><text class="lbl" x="39" y="66" text-anchor="middle">y solicitud</text><text class="ok" x="64" y="16" text-anchor="middle">✔</text></g>`)}
      ${hs('consent', `<g transform="translate(160,0)"><rect class="hs-bg card" width="86" height="74" rx="10"/><text class="emo" x="43" y="36" text-anchor="middle">📝</text><text class="lbl" x="43" y="54" text-anchor="middle">Consentimiento</text><text class="lbl" x="43" y="66" text-anchor="middle">informado</text><text class="ok" x="72" y="16" text-anchor="middle">✔</text></g>`)}
      ${hs('residuos', `<g transform="translate(254,0)"><rect class="hs-bg card" width="66" height="74" rx="10"/><text class="emo" x="33" y="36" text-anchor="middle">🗑️</text><text class="lbl" x="33" y="56" text-anchor="middle">Residuos</text><text class="ok" x="54" y="16" text-anchor="middle">✔</text></g>`)}
    </g>
    <g transform="translate(340,330)">
      ${hs('lado', `<rect class="hs-bg lado-bg" x="0" y="0" width="270" height="170" rx="14"/><text class="lbl" x="135" y="16" text-anchor="middle">Lado del paciente</text>`)}
      <rect class="cama" x="14" y="92" width="238" height="26" rx="6"/>
      <rect class="cama-pata" x="22" y="118" width="8" height="30"/><rect class="cama-pata" x="236" y="118" width="8" height="30"/>
      ${hs('paciente', `<g class="paciente"><rect class="hs-bg pac-hit" x="14" y="38" width="238" height="56" rx="10"/>
        <circle class="cabeza" cx="42" cy="68" r="15"/>
        <rect class="cuerpo" x="60" y="56" width="120" height="30" rx="14"/>
        <rect class="pierna" x="176" y="60" width="70" height="22" rx="10"/>
        <path class="rodilla" d="M176,70 L212,38 L246,70"/></g>`)}
      ${hs('gancho', `<g><rect class="hs-bg gan-hit" x="204" y="124" width="62" height="40" rx="8"/><path class="gancho" d="M236,120 L236,132 Q236,140 228,140"/><text class="lbl" x="236" y="160" text-anchor="middle">Ganchillo</text></g>`)}
    </g>`;
  }

  function build(sexo) {
    return `<svg class="acr-svg sx-${sexo}" viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escena de sondaje vesical">
      <rect class="marco" x="6" y="6" width="948" height="528" rx="18"/>
      <g transform="translate(20,20)">
        <text class="ttl" x="0" y="14">Corte sagital de pelvis · ${sexo === 'F' ? 'mujer' : 'varón'}</text>
        <g transform="translate(0,22)">${anatomia(sexo)}${bolsa(sexo)}</g>
      </g>
      ${mesa()}
      ${entorno()}
    </svg>`;
  }

  // Chips de progreso (no dan pistas de qué sigue, solo resumen lo ya hecho)
  const CHIPS = [
    ['id', 'Paciente verificado'], ['consent', 'Consentimiento'], ['pos', 'Posición'], ['manos', 'Manos lavadas'],
    ['campo', 'Campo estéril'], ['tested', 'Balón probado'], ['ins', 'Sonda colocada'], ['infl', 'Balón inflado'],
    ['bag', 'Bolsa conectada'], ['fix', 'Sonda fijada'], ['reg', 'Registrado'],
  ];

  return { build, CHIPS, usable: ['iodo', 'guantes-ns', 'panos-ns', 'guantes-e', 'pano-e', 'campo-aux', 'pack', 'gel', 'jeringa', 'bolsa', 'cinta', 'lavabo', 'hc', 'consent', 'residuos'] };
})();
