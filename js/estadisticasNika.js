/* NikaGuiaEst — Nika, la instructora de Estadísticas personales.
   Saluda por tu nombre, te explica la sección con un recorrido corto (la primera vez) y después te deja un mensaje motivacional
   según tus datos. También reparte tips por sección. Todo es texto + SVG + CSS: no usa servicios externos. */
(function () {
  'use strict';
  const ROBOT = '<svg viewBox="0 0 200 230" class="ne" aria-hidden="true" focusable="false"><defs><linearGradient id="neB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef2f7"/><stop offset="1" stop-color="#cdd7e3"/></linearGradient><linearGradient id="neC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9c5d3"/><stop offset=".5" stop-color="#e9eef4"/><stop offset="1" stop-color="#aebbca"/></linearGradient><linearGradient id="neV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16395f"/><stop offset=".55" stop-color="#0c2140"/><stop offset="1" stop-color="#08162b"/></linearGradient><radialGradient id="neG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#22d3ee" stop-opacity=".8"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient></defs><ellipse class="ne-sombra" cx="100" cy="222" rx="36" ry="6.5" fill="#020617" opacity=".32"/><g class="ne-todo"><g class="ne-brazo-q"><path d="M62 134 C48 136 38 152 40 172 C41 183 53 185 59 176 C66 162 68 146 68 138 Z" fill="url(#neB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M50 150 C48 160 49 168 51 174" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"/></g><g class="ne-brazo-s"><path d="M138 134 C152 136 162 152 160 172 C159 183 147 185 141 176 C134 162 132 146 132 138 Z" fill="url(#neB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M150 150 C152 160 151 168 149 174" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"/></g><path d="M62 152 C62 130 80 122 100 122 C120 122 138 130 138 152 C138 184 124 208 100 208 C76 208 62 184 62 152 Z" fill="url(#neB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M70 170 L91 170 L95 177 L116 177 L130 170" stroke="#b6c3d1" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="82" cy="146" rx="9" ry="16" fill="#fff" opacity=".7" transform="rotate(14 82 146)"/><g class="ne-cruz" opacity=".9"><circle cx="100" cy="190" r="6.5" fill="#38bdf8"/><path d="M100 186v8M96 190h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g><rect x="22" y="64" width="19" height="40" rx="9.5" fill="url(#neC)" stroke="#b3c0ce" stroke-width="1.4"/><rect x="159" y="64" width="19" height="40" rx="9.5" fill="url(#neC)" stroke="#b3c0ce" stroke-width="1.4"/><ellipse cx="100" cy="40" rx="24" ry="7" fill="#dfe6ee" stroke="#c4d0dd" stroke-width="1.4"/><rect x="32" y="38" width="136" height="90" rx="42" fill="url(#neB)" stroke="#c4d0dd" stroke-width="1.6"/><path d="M48 50 C60 42 84 40 100 40" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/><rect x="45" y="52" width="110" height="64" rx="30" fill="url(#neV)"/><path d="M58 60 C76 54 124 54 142 60" stroke="#fff" stroke-opacity=".16" stroke-width="5" stroke-linecap="round" fill="none"/><g class="ne-cara"><g class="ne-ojos"><path class="ne-ojo" d="M66 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path class="ne-ojo" d="M106 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path d="M71 86 a9 9 0 0 1 14 -3" stroke="#bff6ff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/><path d="M111 86 a9 9 0 0 1 14 -3" stroke="#bff6ff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/></g><path class="ne-boca" d="M91 99 Q100 112 109 99 Q100 103 91 99 Z" fill="#35e0f7" stroke="#35e0f7" stroke-width="2" stroke-linejoin="round"/></g></g></svg>';
  const CABEZA = '<svg viewBox="26 30 148 104" aria-hidden="true" focusable="false"><rect x="32" y="38" width="136" height="90" rx="42" fill="#eef2f7" stroke="#c4d0dd" stroke-width="3"/><rect x="45" y="52" width="110" height="64" rx="30" fill="#0c2140"/><g class="eg-mojos"><path class="eg-mojo" d="M66 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path class="eg-mojo" d="M106 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/></g></svg>';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sinMov = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const hm = (min) => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h > 0 ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min'; };
  const KEY = 'nika_est_tour';

  let rot = 0, datos = null, nombre = 'estudiante', paso = 0, pasos = [], modoTour = false, tipeo = null, tipeando = false, txtFull = '';

  // ---------- mensajes ----------
  function motivacion() {
    const a = datos.a, k = a.kpis, f = [];
    if (k.racha >= 7) f.push('🔥 ¡' + k.racha + ' días seguidos! Esa constancia es lo que más se nota en los exámenes.');
    if (k.racha >= 2 && k.racha < 7) f.push('🔥 Llevás ' + k.racha + ' días de racha. Un Pomodoro más hoy y la cuidás.');
    if (!k.tiempoHoyMin) f.push('🌱 Hoy todavía no estudiaste, pero con 25 minutos ya arrancás. Yo te acompaño.');
    else f.push('💪 Hoy ya sumaste ' + hm(k.tiempoHoyMin) + '. Cada bloque cuenta.');
    if (k.efectividad != null && k.efectividad < 50) f.push('🎯 Tu efectividad en simulacros está en ' + k.efectividad + '%. Es normal al principio: revisá los errores y repetí, ahí está la mejora.');
    if (k.efectividad != null && k.efectividad >= 70) f.push('🎯 ¡' + k.efectividad + '% de aciertos! Estás dominando los simulacros.');
    const m = a.olvido && a.olvido.masOlvidada;
    if (m) f.push('🧠 Hace ' + m.dias + ' días que no repasás ' + m.label + ' · ' + m.up + '. Un repaso corto y lo recuperás.');
    f.push('📈 Estudiar un poco todos los días rinde más que una maratón el día anterior.');
    f.push('☕ Descansar también es estudiar: respetá los descansos del Pomodoro.');
    f.push('🚀 No hace falta ir perfecto, hace falta ir seguido.');
    const d = Math.floor(Date.now() / 864e5);
    return f[(d + rot) % f.length];
  }
  function semanaTxt() {
    try {
      const S = window.NikaResumenSemanal && window.NikaResumenSemanal.semanas();
      if (!S || S.length < 2) return '';
      const A = S[S.length - 1], P = S[S.length - 2];
      if (!A.min) return ' Esta semana todavía no arrancaste: es un buen momento.';
      if (!P.min) return ' Esta semana ya sumaste ' + hm(A.min) + '.';
      const d = Math.round((A.min - P.min) / P.min * 100);
      return d >= 0 ? ' Esta semana vas ' + d + '% arriba de la anterior. ¡Bien!' : ' Esta semana vas ' + Math.abs(d) + '% por debajo de la anterior, todavía hay tiempo.';
    } catch (_) { return ''; }
  }
  function armarPasos() {
    const a = datos.a, k = a.kpis, u = esc(nombre);
    const m = a.olvido && a.olvido.masOlvidada;
    pasos = [
      { t: '¡Hola, <b>' + u + '</b>! Soy <b>Nika</b> 👋 En esta sección te cuento cómo venís estudiando, qué conviene repasar y cuánto te falta para terminar tus lecturas.', sec: null },
      { t: '📅 En <b>Semana</b> comparás tu tiempo, tus Pomodoros y tus simulacros con la semana anterior.' + semanaTxt(), sec: 'est-semana' },
      { t: '🧠 En <b>Académico</b> está tu radar clínico (tiempo vs. aciertos por área) y la curva del olvido, que te avisa qué hace más que no repasás.' + (m ? ' Ahora mismo, <b>' + esc(m.label) + ' · ' + esc(m.up) + '</b> pide repaso.' : ''), sec: 'est-academico' },
      { t: '📖 En <b>Lectura</b> mido tu ritmo en el Lector NikaMed y calculo cuánto te falta para terminar cada PDF.', sec: 'est-lectura' },
      { t: '🔥 En <b>Constancia</b> ves tus últimas 12 semanas día por día.' + (k.racha ? ' Llevás <b>' + k.racha + (k.racha === 1 ? ' día' : ' días') + '</b> de racha.' : ' Cuando estudies, el mapa se va pintando.'), sec: 'est-constancia' },
      { t: motivacion() + ' ¡Vamos, <b>' + u + '</b>!', sec: null, fin: true },
    ];
  }

  // ---------- escritura y estados del robot ----------
  function hablar(html) {
    const t = $('.eg-txt'), robot = $('.eg-robot'); if (!t) return;
    clearInterval(tipeo); txtFull = html;
    if (sinMov()) { t.innerHTML = html; robot.classList.remove('habla'); tipeando = false; return; }
    const plano = html.replace(/<[^>]+>/g, '').length, vel = plano > 150 ? 12 : 20;
    t.innerHTML = ''; tipeando = true; robot.classList.add('habla');
    // se escribe de a caracteres respetando las etiquetas <b>
    let i = 0, buf = '';
    const tokens = html.match(/<[^>]+>|[^<]/g) || [];
    tipeo = setInterval(() => {
      let n = 0;
      while (i < tokens.length && n < 2) { buf += tokens[i]; if (!/^</.test(tokens[i])) n++; i++; }
      t.innerHTML = buf + ((buf.match(/<b>/g) || []).length > (buf.match(/<\/b>/g) || []).length ? '</b>' : '');
      if (i >= tokens.length) { clearInterval(tipeo); tipeando = false; robot.classList.remove('habla'); t.innerHTML = html; }
    }, vel);
  }
  function completar() { if (!tipeando) return; clearInterval(tipeo); tipeando = false; $('.eg-txt').innerHTML = txtFull; $('.eg-robot').classList.remove('habla'); }
  function saludar() { const r = $('.eg-robot'); if (!r) return; r.classList.remove('saluda'); void r.offsetWidth; r.classList.add('saluda'); setTimeout(() => r.classList.remove('saluda'), 2600); }
  function feliz() { const r = $('.eg-robot'); if (!r) return; r.classList.remove('feliz'); void r.offsetWidth; r.classList.add('feliz'); setTimeout(() => r.classList.remove('feliz'), 900); }

  function resaltarNav(sec) {
    $$('#est-nav button').forEach((b) => b.classList.toggle('eg-llama', !!sec && b.dataset.sec === sec));
  }

  function pintarPaso() {
    const p = pasos[paso]; if (!p) return;
    const g = $('#est-guia'); g.dataset.paso = paso;
    hablar(p.t); resaltarNav(p.sec);
    $$('.eg-punto', g).forEach((d, i) => d.classList.toggle('on', i === paso));
    const sig = $('.eg-sig', g), ant = $('.eg-ant', g);
    sig.textContent = p.fin ? '¡Listo!' : paso === 0 ? 'Empezar recorrido →' : 'Siguiente →';
    ant.style.visibility = paso > 0 ? 'visible' : 'hidden';
    if (paso === 0) saludar(); else feliz();
  }
  function terminarTour() {
    lsSet(KEY, '1'); modoTour = false; resaltarNav(null);
    mostrarMotivacion(true);
  }
  function mostrarMotivacion(otro) {
    if (otro) rot++;
    const g = $('#est-guia'); g.classList.remove('tour'); g.dataset.paso = 'm';
    const k = datos.a.kpis;
    const saludo = otro ? '' : '¡Hola de nuevo, <b>' + esc(nombre) + '</b>! 👋 ';
    hablar(saludo + motivacion());
    $('.eg-sig', g).textContent = 'Otro mensaje'; $('.eg-ant', g).style.visibility = 'hidden';
    $$('.eg-punto', g).forEach((d) => d.classList.remove('on'));
    if (!otro) saludar(); else feliz();
    resaltarNav(null);
  }
  function iniciarTour() { modoTour = true; paso = 0; $('#est-guia').classList.add('tour'); pintarPaso(); }

  // ---------- tips por sección ----------
  function tip(id, html) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = '<span class="eg-cab">' + CABEZA + '</span><span class="eg-tt">' + html + '</span>';
    el.classList.add('on');
  }
  function tips() {
    const a = datos.a;
    const fuerte = a.radar.filter((r) => r.aciertosPct != null).sort((x, y) => y.aciertosPct - x.aciertosPct)[0];
    const debil = a.radar.filter((r) => r.aciertosPct != null).sort((x, y) => x.aciertosPct - y.aciertosPct)[0];
    let ac = a.insight ? esc(a.insight) : fuerte ? 'Tu área más fuerte es <b>' + esc(fuerte.label) + '</b> (' + fuerte.aciertosPct + '% de aciertos).' + (debil && debil !== fuerte ? ' Para reforzar: <b>' + esc(debil.label) + '</b> (' + debil.aciertosPct + '%).' : '') : 'Hacé simulacros para que pueda medir tu efectividad por área.';
    tip('tip-academico', 'Nika dice: ' + ac);
    tip('tip-semana', 'Nika dice: ' + (semanaTxt().trim() || 'Cada semana se arma sola con tus Pomodoros y simulacros.'));
    tip('tip-constancia', 'Nika dice: ' + (a.kpis.racha >= 2 ? 'tu racha de <b>' + a.kpis.racha + ' días</b> es lo más valioso del mapa. ¡Cuidala!' : 'cada cuadrito pintado es un día que cumpliste. Probá pintar uno hoy.'));
  }
  window.NikaGuiaEstTipLectura = (html) => tip('tip-lectura', 'Nika dice: ' + html);

  // ---------- iniciar ----------
  function iniciar(o) {
    datos = o; nombre = o.user || 'estudiante';
    const host = $('#est-guia'); if (!host) return;
    armarPasos();
    host.innerHTML = '<i class="eg-orbe"></i><div class="eg-robot" aria-hidden="true">' + ROBOT + '<i class="eg-brillo"></i></div>'
      + '<div class="eg-burbuja"><button type="button" class="eg-x" aria-label="Ocultar a Nika" title="Ocultar a Nika">✕</button><div class="eg-nombre">Nika · tu instructora</div><p class="eg-txt" aria-live="polite"></p>'
      + '<div class="eg-acc"><button type="button" class="eg-ant">← Atrás</button><button type="button" class="eg-sig">Siguiente →</button><button type="button" class="eg-skip">Saltar</button>'
      + '<span class="eg-puntos">' + pasos.map(() => '<i class="eg-punto"></i>').join('') + '</span></div></div>';
    host.classList.add('on');
    if (lsGet('nika_est_guia_oculta') === '1') { host.classList.add('chica'); }
    $('.eg-sig', host).onclick = () => {
      if (tipeando) { completar(); return; }
      if (!modoTour) { if (host.dataset.paso === 'm') { mostrarMotivacion(true); return; } }
      if (modoTour) { if (pasos[paso].fin) terminarTour(); else { paso++; pintarPaso(); } }
    };
    $('.eg-ant', host).onclick = () => { if (modoTour && paso > 0) { paso--; pintarPaso(); } };
    $('.eg-skip', host).onclick = () => terminarTour();
    $('.eg-x', host).onclick = () => { host.classList.toggle('chica'); lsSet('nika_est_guia_oculta', host.classList.contains('chica') ? '1' : '0'); };
    $('.eg-robot', host).addEventListener('click', () => { if (host.classList.contains('chica')) { host.classList.remove('chica'); lsSet('nika_est_guia_oculta', '0'); } saludar(); feliz(); });
    // los ojos siguen al mouse
    if (!sinMov()) {
      const svg = $('.eg-robot svg', host);
      window.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.35);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        svg.style.setProperty('--ex', (dx / d * 5 * k).toFixed(1) + 'px'); svg.style.setProperty('--ey', (dy / d * 3.5 * k).toFixed(1) + 'px');
      }, { passive: true });
    }
    // primera vez: recorrido; después, saludo + mensaje del día
    if (lsGet(KEY) !== '1') setTimeout(iniciarTour, 500); else setTimeout(() => mostrarMotivacion(false), 500);
    tips();
    // botón para repetir el recorrido (queda en la burbuja cuando ya lo viste)
    const rep = document.createElement('button'); rep.type = 'button'; rep.className = 'eg-rep'; rep.textContent = '¿Cómo funciona esta página? Ver recorrido';
    rep.onclick = () => { host.classList.remove('chica'); lsSet('nika_est_guia_oculta', '0'); iniciarTour(); };
    $('.eg-burbuja', host).appendChild(rep);
  }

  window.NikaGuiaEst = { iniciar };
})();
