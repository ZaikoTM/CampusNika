// CAMPUS NIKA — Sala de Estudio de la PFO (pfo_estudio.html).
// Datos: data/pfo/estudio.json (módulos, secciones, links, recorrido de Generalidades) · pasos de los procedimientos: data/pfo/procedimientos_guias.json y data/pfo/procedimientos.json.
// Navegación por hash: #  ·  #modulo  ·  #modulo/seccion  ·  #modulo/seccion/procedimiento
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const main = $('#pe-main');
  const reducido = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let D = null, PROC = {};
  const LS = 'nika_pfo_estudio';
  const leer = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (_) { return {}; } };
  const guardar = (o) => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (_) {} };
  const toast = (m) => { const t = $('#pfo-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); };
  const modulo = (id) => D.modulos.find((m) => m.id === id);
  const aplicarColor = (el, c) => { if (el && c) el.style.setProperty('--c', c); };
  // animación de números sin depender de requestAnimationFrame
  function contar(el, hasta, ms) {
    if (reducido()) { el.textContent = hasta.toLocaleString('es-AR'); return; }
    const t0 = Date.now(); const iv = setInterval(() => { const k = Math.min(1, (Date.now() - t0) / (ms || 1100)); el.textContent = Math.round(hasta * (1 - Math.pow(1 - k, 3))).toLocaleString('es-AR'); if (k >= 1) clearInterval(iv); }, 30);
  }
  const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

  // ------------------------------------------------------------------ ventanas (reproductor de video)
  function cerrarModal() { const ov = $('#pfo-modal'); if (!ov) return; document.removeEventListener('keydown', ov._esc); document.body.style.overflow = ''; ov.classList.add('sale'); setTimeout(() => ov.remove(), 200); }
  function reproducir(id, titulo) {
    cerrarModal(); const ov = document.createElement('div'); ov.className = 'pfo-modal'; ov.id = 'pfo-modal';
    ov.innerHTML = `<div class="pfo-modal-c ancho" role="dialog" aria-modal="true"><button type="button" class="pfo-modal-x" aria-label="Cerrar">×</button><div class="pfo-modal-h"><span class="ic">🎬</span><div><h2 style="font-size:1rem">${esc(titulo)}</h2></div></div><div style="padding:14px;aspect-ratio:16/9;min-height:240px"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?autoplay=1&rel=0" title="${esc(titulo)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0;border-radius:14px;background:#000"></iframe></div><div class="pfo-modal-f"><a class="pfo-btn sec" href="https://www.youtube.com/watch?v=${esc(id)}" target="_blank" rel="noopener">Abrir en YouTube</a></div></div>`;
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('.pfo-modal-x')) cerrarModal(); });
    ov._esc = (e) => { if (e.key === 'Escape') cerrarModal(); }; document.addEventListener('keydown', ov._esc);
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
  }

  // ------------------------------------------------------------------ portada: módulos
  function vistaHub() {
    const est = leer(); const vistos = (est.tour && est.tour.vistos) || [];
    const nPasos = D.recorrido.pasos.length;
    main.innerHTML = `
      <section class="pe-hero">
        <span class="pfo-chip plus">🎓 Práctica Final Obligatoria</span>
        <h1>Sala de <em>Estudio</em> PFO</h1>
        <p>Todo para preparar tu último año en un solo lugar: el recorrido por el reglamento, los contenidos de cada rotación, procedimientos paso a paso y la bibliografía actualizada.</p>
        <div class="pe-hero-acc"><a href="#generalidades">🧭 Empezar por el recorrido</a><a class="plus" href="pfo_ecoe.html">📝 Simulador: ECOE FINAL</a><a href="acreditaciones.html?area=pfo">🥽 NikaSim · Procedimientos</a></div>
      </section>
      <div class="pe-grid">${D.modulos.map((m, i) => {
        const prog = m.id === 'generalidades' ? Math.round((vistos.length / nPasos) * 100) : null;
        return `<a class="pe-mod pfo-rv-w ${m.estado === 'activo' ? '' : 'pronto'}" href="#${m.id}" style="--c:${m.color};--d:${i % 4}"><div class="pe-mod-b"><span class="ic">${m.icono}</span><span class="tag">${m.estado === 'activo' ? 'Disponible' : 'Próximamente'}</span></div>
          <div class="pe-mod-c"><h3>${esc(m.titulo)}</h3><p>${esc(m.desc)}</p>${prog != null ? `<div class="pe-prog" title="${prog}% completado"><b style="width:${prog}%"></b></div>` : ''}<span class="pe-mod-go">${m.estado === 'activo' ? (prog ? (prog >= 100 ? 'Repasar' : 'Continuar') : 'Entrar') : 'Ver qué incluirá'} <i>→</i></span></div></a>`;
      }).join('')}</div>`;
    revelar();
  }
  function revelar() {
    const els = $$('.pfo-rv-w', main); if (!els.length) return;
    if (!('IntersectionObserver' in window) || reducido()) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.filter((e) => e.isIntersecting).forEach((e) => { e.target.classList.add('in'); io.unobserve(e.target); }), { threshold: 0.05 });
    els.forEach((e) => io.observe(e)); setTimeout(() => els.forEach((e) => e.classList.add('in')), 2500);
  }

  // ------------------------------------------------------------------ módulo y secciones
  function vistaModulo(m) {
    if (m.id === 'generalidades') return vistaRecorrido();
    const volver = '<a class="pe-back" href="#">← Todos los módulos</a>';
    if (!m.secciones) {
      main.innerHTML = `${volver}<div class="pe-mod-h" style="--c:${m.color}"><span class="ic">${m.icono}</span><div><h2>${esc(m.titulo)}</h2><p>${esc(m.desc)}</p></div></div><div class="pe-aviso">🚧 Este módulo se está armando: pronto vas a encontrar acá los contenidos, procedimientos y bibliografía de la rotación.</div>`;
      return;
    }
    main.innerHTML = `${volver}<div class="pe-mod-h" style="--c:${m.color}"><span class="ic">${m.icono}</span><div><h2>${esc(m.titulo)}</h2><p>${esc(m.desc)}</p></div></div>
      <div class="pe-secs" style="--c:${m.color}">${m.secciones.map((s, i) => {
        const n = (s.items || []).filter((x) => x.tipo !== 'pronto').length, v = (s.videos || []).length;
        const cuenta = s.tipo === 'bibliografia' ? `${s.bibliografia.length} temas` : [n ? `${n} recursos` : '', v ? `${v} videos` : ''].filter(Boolean).join(' · ');
        return `<a class="pe-sec" href="#${m.id}/${s.id}" style="--d:${i}"><span class="ic">${s.icono}</span><div><h3>${esc(s.titulo)}</h3><p>${esc(s.desc)}</p><small>${cuenta} →</small></div></a>`;
      }).join('')}</div>`;
  }
  function claseItem(it) { return it.tipo === 'pronto' ? 'pe-item pronto' : 'pe-item'; }
  function vistaSeccion(m, s) {
    const volver = `<a class="pe-back" href="#${m.id}">← ${esc(m.titulo)}</a>`;
    const cab = `<div class="pe-mod-h" style="--c:${m.color}"><span class="ic">${s.icono}</span><div><h2>${esc(s.titulo)}</h2><p>${esc(s.desc)}</p></div></div>`;
    let cuerpo = '';
    if (s.tipo === 'bibliografia') {
      cuerpo = `<div class="pe-aviso">📖 Resumimos la bibliografía sugerida por tema. Los textos de base se consultan completos; el resto son consensos y artículos puntuales.</div><div class="pe-bib">${s.bibliografia.map((t) => `<div class="pe-bib-t"><h3><span>${t.icono}</span>${esc(t.tema)}</h3><ul>${t.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>`).join('')}</div>`;
    } else {
      if (s.acciones) cuerpo += `<div class="pe-hero-acc" style="margin:14px 0 0">${s.acciones.map((a) => `<a class="plus" href="${esc(a.href)}">${a.icono} ${esc(a.texto)}</a>`).join('')}</div>`;
      if (s.items && s.items.length) cuerpo += `<div class="pe-items" style="--c:${m.color}">${s.items.map((it, i) => {
        const ic = it.icono || (it.tipo === 'pronto' ? '⏳' : '📄');
        if (it.tipo === 'proc') return `<a class="pe-item ok" href="#${m.id}/${s.id}/${it.proc}" style="--d:${i}"><span class="ic">${ic}</span><span class="t">${esc(it.titulo)}</span>${it.nikasim ? '<span class="ch">🥽 NikaSim</span>' : ''}<span class="ch">🎬 Tutorial</span></a>`;
        if (it.tipo === 'pdf') return `<a class="${claseItem(it)} ok" href="${esc(it.url)}" target="_blank" rel="noopener" style="--d:${i}"><span class="ic">${ic}</span><span class="t">${esc(it.titulo)}</span><span class="ch">PDF ↗</span></a>`;
        return `<div class="${claseItem(it)}" style="--d:${i}"><span class="ic">${ic}</span><span class="t">${esc(it.titulo)}</span><span class="ch">Próximamente</span></div>`;
      }).join('')}</div>`;
      if (s.videos && s.videos.length) cuerpo += `<h3 class="pe-sub">🎬 Clases en video</h3><div class="pe-videos">${s.videos.map((v, i) => `<button type="button" class="pe-video" data-yt="${esc(v.yt)}" data-t="${esc(v.titulo)}" style="--d:${i}"><span class="pe-mini" style="background-image:url(${ytThumb(v.yt)})"><i>▶</i></span><span class="tt">${esc(v.titulo)}</span></button>`).join('')}</div>`;
    }
    main.innerHTML = volver + cab + cuerpo;
    $$('.pe-video', main).forEach((b) => b.addEventListener('click', () => reproducir(b.dataset.yt, b.dataset.t)));
  }

  // ------------------------------------------------------------------ visor de procedimientos: tutorial interactivo
  const ICONO_PASO = [[/lav(a|ar)(se)? las manos|higiene|alcohol en gel|desinfect/i, '🧼'], [/guante/i, '🧤'], [/consentimiento|firma/i, '✍️'], [/salud|presenta|explic|inform|comunic|colabor/i, '🗣️'], [/material|reun|prepar|mesa|carro|llev/i, '🧰'], [/registr|historia cl/i, '📋'], [/anest|lidoca/i, '💉'], [/aguja|jeringa|punci|pinch/i, '💉'], [/muestra|tubo|hisopo|cultivo/i, '🧪'], [/posici|acomod|decúbito|decubito|inclin/i, '🛏️'], [/ropa est|camp|paño|estéril|esteril/i, '🥼'], [/observ|inspecc|palp|identific|describ|determin|calcul/i, '🔎'], [/descart|desech/i, '🗑️']];
  const iconoPaso = (t) => { for (const [re, ic] of ICONO_PASO) if (re.test(t)) return ic; return '➡️'; };
  const limpio = (t) => String(t || '').replace(/\s+/g, ' ').trim();
  function confeti() {
    if (reducido()) return; const cv = document.createElement('canvas'); cv.className = 'pfo-conf'; document.body.appendChild(cv); const x = cv.getContext('2d'); const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const col = ['#fde68a', '#f59e0b', '#38bdf8', '#a78bfa', '#22c55e', '#f472b6']; const P = Array.from({ length: 120 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: col[(Math.random() * col.length) | 0] }));
    const t0 = Date.now(); const iv = setInterval(() => { x.clearRect(0, 0, W, H); P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (Date.now() - t0 > 3500) { clearInterval(iv); cv.remove(); } }, 33);
  }
  function vistaProc(m, s, it) {
    const pr = PROC[it.proc]; const volver = `<a class="pe-back" href="estudio.html?modulo=pfo">← Sala de Estudio PFO</a>`;
    if (!pr) { main.innerHTML = volver + '<div class="pe-aviso">Este procedimiento todavía no tiene los pasos cargados.</div>'; return; }
    const pasos = pr.pasos.map((p) => ({ n: p.n, t: limpio(p.texto), fase: p.fase || '', crit: !!p.critico }));
    const k = 'proc_' + it.proc; const est = leer(); const mio = est[k] || { checks: [], hecho: 0 }; const guardarMio = () => { const e = leer(); e[k] = mio; guardar(e); };
    const nik = it.nikasim ? `acreditaciones.html?area=${it.nikasim.area}&id=${it.nikasim.id}` : null;
    main.innerHTML = `${volver}
      <div class="pe-proc-h" style="--c:${m.color}"><span class="ic">${it.icono || pr.icono || '🛠️'}</span><div><h2>${esc(it.titulo)}</h2><small>${pasos.length} pasos${pasos.some((p) => p.crit) ? ' · los marcados con ⭐ son imprescindibles' : ''}</small></div></div>
      <div class="pe-tabs" style="margin-top:14px" role="tablist">
        <button type="button" data-v="tutorial" class="on">🎬 Tutorial</button><button type="button" data-v="orden">🧩 Ordená los pasos</button><button type="button" data-v="tarjetas">🃏 Tarjetas</button><button type="button" data-v="lista">✅ Lista completa</button>
        ${it.teoria ? '<button type="button" data-v="teoria">📚 Teoría</button>' : ''}${it.guia ? '<button type="button" data-v="pdf">📄 Guía en PDF</button>' : ''}
      </div>
      <div id="pe-visor" class="pe-visor"></div>
      <div class="pe-nikasim">${nik ? `<a class="pfo-btn" href="${nik}">🥽 Practicalo en 3D en NikaSim ➤</a>` : '<span class="pe-aviso" style="margin:0">🥽 El simulador 3D de este procedimiento se está preparando en NikaSim.</span>'}</div>`;
    const visor = $('#pe-visor');
    const tabs = $$('.pe-tabs button', main);
    const mostrar = (v) => {
      if (v === 'teoria') { window.open(it.teoria.url, '_blank', 'noopener'); return; }
      if (v === 'pdf') { window.open(it.guia, '_blank', 'noopener'); return; }
      tabs.forEach((b) => b.classList.toggle('on', b.dataset.v === v));
      visor.innerHTML = ''; visor.className = 'pe-visor pe-panel'; ({ tutorial, orden, tarjetas, lista })[v]();
    };
    tabs.forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.v)));

    // --- Tutorial guiado: un paso por vez
    function tutorial() {
      let i = 0;
      const pintar = (atras) => {
        const p = pasos[i]; const pct = Math.round((i / pasos.length) * 100);
        visor.innerHTML = `<div class="pe-prog-top"><b style="width:${pct}%"></b></div>
          <div class="pe-tut ${atras ? 'atras' : ''} ${p.crit ? 'crit' : ''}"><div class="ico">${iconoPaso(p.t)}</div><div class="cu"><small>Paso ${i + 1} de ${pasos.length}${p.fase ? ' · ' + esc(p.fase) : ''}${p.crit ? ' · ⭐ imprescindible' : ''}</small><p>${esc(p.t)}</p></div></div>
          <div class="pe-nav"><button type="button" class="pfo-btn sec" id="pt-ant" ${i === 0 ? 'disabled' : ''}>← Anterior</button><span class="cnt">${i + 1} / ${pasos.length}</span><button type="button" class="pfo-btn pulso" id="pt-sig">${i === pasos.length - 1 ? '¡Terminé! 🎉' : 'Entendido ➜'}</button></div>`;
        $('#pt-ant').addEventListener('click', () => { if (i > 0) { i--; pintar(true); } });
        $('#pt-sig').addEventListener('click', () => { if (i < pasos.length - 1) { i++; pintar(false); } else fin(); });
      };
      const fin = () => { mio.hecho = (mio.hecho || 0) + 1; guardarMio(); confeti(); visor.innerHTML = `<div class="pe-fin"><div class="big">🏅</div><h3>¡Tutorial completado!</h3><p>Recorriste los ${pasos.length} pasos de «${esc(it.titulo)}». Ahora afianzalo jugando: ordená los pasos o repasalos con tarjetas.</p><div class="pe-nav" style="justify-content:center"><button class="pfo-btn" id="pf-orden">🧩 Jugar a ordenar</button><button class="pfo-btn sec" id="pf-rep">↺ Repetir el tutorial</button></div></div>`; $('#pf-orden').addEventListener('click', () => mostrar('orden')); $('#pf-rep').addEventListener('click', () => mostrar('tutorial')); };
      pintar(false);
    }
    // --- Juego: ordenar pasos
    function orden() {
      const N = Math.min(6, pasos.length); let ronda = 0, puntos = 0;
      const nueva = () => {
        const ini = Math.max(0, Math.min(pasos.length - N, Math.floor(Math.random() * (pasos.length - N + 1)))); const grupo = pasos.slice(ini, ini + N);
        const mezcla = grupo.map((p, idx) => ({ p, idx })).sort(() => Math.random() - 0.5); let sig = 0, errores = 0;
        visor.innerHTML = `<p class="intro" style="margin:0 0 10px;color:var(--pf-mut);font-size:.88rem">Tocá los pasos en el orden correcto, del primero al último. Ronda ${ronda + 1} · ${puntos} puntos.</p><div class="pe-ord">${mezcla.map((x) => `<button type="button" class="pe-ord-i" data-i="${x.idx}">${iconoPaso(x.p.t)} ${esc(x.p.t)}</button>`).join('')}</div><div class="pe-expl" id="po-msg" style="display:none"></div>`;
        $$('.pe-ord-i', visor).forEach((b) => b.addEventListener('click', () => {
          if (b.classList.contains('bien')) return;
          if (+b.dataset.i === sig) { b.classList.add('bien'); b.insertAdjacentHTML('afterbegin', `<b class="num">${sig + 1}</b>`); sig++; if (sig === N) { puntos += Math.max(1, N - errores); confeti(); const msg = $('#po-msg'); msg.style.display = 'block'; msg.innerHTML = `🎉 ¡Orden perfecto${errores ? ' (con ' + errores + ' error' + (errores > 1 ? 'es' : '') + ')' : ' y sin errores'}! Sumaste ${Math.max(1, N - errores)} puntos. <button type="button" class="pfo-btn" id="po-otra" style="margin-left:8px;padding:8px 16px">Otra ronda ➜</button>`; $('#po-otra').addEventListener('click', () => { ronda++; nueva(); }); } }
          else { errores++; b.classList.add('mal'); setTimeout(() => b.classList.remove('mal'), 450); }
        }));
      };
      nueva();
    }
    // --- Tarjetas de repaso
    function tarjetas() {
      let i = 0; const sabe = new Set();
      const pintar = () => {
        const p = pasos[i];
        visor.innerHTML = `<div class="pe-prog-top"><b style="width:${Math.round((sabe.size / pasos.length) * 100)}%"></b></div><p class="intro" style="margin:0 0 8px;color:var(--pf-mut);font-size:.84rem">Tarjeta ${i + 1} de ${pasos.length} · sabés ${sabe.size}. Pensá cuál es el paso y tocá la tarjeta para ver la respuesta.</p>
          <div class="pe-flip" id="pt-card"><div class="cara"><div class="f"><span class="ic">${iconoPaso(p.t)}</span><b>Paso ${p.n}${p.crit ? ' ⭐' : ''}</b><small>${p.fase ? esc(p.fase) : '¿Qué se hace en este paso?'}</small></div><div class="b"><p style="font-size:.95rem;line-height:1.6;margin:0">${esc(p.t)}</p></div></div></div>
          <div class="pe-nav"><button type="button" class="pfo-btn sec" id="pc-rep">🔁 Repasar</button><button type="button" class="pfo-btn" id="pc-sab">✔ Lo sé</button></div>`;
        $('#pt-card').addEventListener('click', () => $('#pt-card').classList.toggle('vuelta'));
        const avanzar = () => { i = (i + 1) % pasos.length; pintar(); };
        $('#pc-rep').addEventListener('click', () => { sabe.delete(i); avanzar(); });
        $('#pc-sab').addEventListener('click', () => { sabe.add(i); if (sabe.size === pasos.length) { confeti(); visor.innerHTML = '<div class="pe-fin"><div class="big">🏆</div><h3>¡Te los sabés todos!</h3><p>Repasaste todos los pasos. Probá ahora el juego de ordenar.</p></div>'; } else avanzar(); });
      };
      pintar();
    }
    // --- Lista completa con tildes
    function lista() {
      const total = pasos.length;
      const pintarBarra = () => { const n = mio.checks.length; $('#pl-pct').textContent = `${n} de ${total} pasos repasados`; $('#pl-b').style.width = Math.round((n / total) * 100) + '%'; };
      visor.innerHTML = `<div class="pe-barra"><div class="tt"><span id="pl-pct"></span><button type="button" class="pfo-link" id="pl-reset">Reiniciar</button></div><div class="pe-prog-top" style="margin:0"><b id="pl-b"></b></div></div>
        <div class="pe-pasos">${pasos.map((p, i) => `<label class="pe-paso ${p.crit ? 'crit' : ''} ${mio.checks.includes(p.n) ? 'hecho' : ''}" style="--d:${i}"><span class="n">${p.n}</span><span class="tx">${p.fase ? `<span class="fase">${esc(p.fase)}</span>` : ''}${p.crit ? '⭐ ' : ''}${esc(p.t)}</span><input type="checkbox" data-n="${esc(p.n)}" ${mio.checks.includes(p.n) ? 'checked' : ''}></label>`).join('')}</div>`;
      $$('.pe-paso input', visor).forEach((c) => c.addEventListener('change', () => { const n = pasos.find((x) => String(x.n) === c.dataset.n).n; if (c.checked) { if (!mio.checks.includes(n)) mio.checks.push(n); } else mio.checks = mio.checks.filter((x) => x !== n); c.parentElement.classList.toggle('hecho', c.checked); guardarMio(); pintarBarra(); if (mio.checks.length === total) { confeti(); toast('🏅 ¡Repasaste toda la lista!'); } }));
      $('#pl-reset').addEventListener('click', () => { mio.checks = []; guardarMio(); lista(); });
      pintarBarra();
    }
    mostrar('tutorial');
  }

  // ------------------------------------------------------------------ recorrido de Generalidades
  function vistaRecorrido() {
    const R = D.recorrido; const est = leer(); est.tour = est.tour || { vistos: [], mejor: 0 }; let idx = 0;
    main.innerHTML = `<a class="pe-back" href="estudio.html?modulo=pfo">← Sala de Estudio PFO</a>
      <div class="pe-mod-h" style="--c:#0ea5e9"><span class="ic">🧭</span><div><h2>${esc(R.titulo)}</h2><p>${esc(R.subtitulo)}</p></div></div>
      <div class="pe-prog-top" style="margin-top:16px"><b id="pe-pt"></b></div>
      <div class="pe-tour"><nav class="pe-rail" aria-label="Pasos del recorrido">${R.pasos.map((p, i) => `<button type="button" data-i="${i}"><span class="ic">${p.icono}</span><span class="t">${esc(p.titulo)}</span><span class="ok">✓</span></button>`).join('')}</nav><div><div class="pe-stage" id="pe-stage"></div><div class="pe-nav"><button type="button" class="pfo-btn sec" id="pe-ant">← Anterior</button><span class="cnt" id="pe-cnt"></span><button type="button" class="pfo-btn pulso" id="pe-sig">Siguiente ➜</button></div></div></div>`;
    const stage = $('#pe-stage');
    const marcar = (id) => { if (!est.tour.vistos.includes(id)) { est.tour.vistos.push(id); guardar(est); } };
    const barra = () => { $('#pe-pt').style.width = Math.round((est.tour.vistos.length / R.pasos.length) * 100) + '%'; $$('.pe-rail button', main).forEach((b, i) => { b.classList.toggle('on', i === idx); b.classList.toggle('visto', est.tour.vistos.includes(R.pasos[i].id)); }); $('#pe-cnt').textContent = `Paso ${idx + 1} de ${R.pasos.length}`; $('#pe-ant').disabled = idx === 0; $('#pe-sig').style.visibility = idx === R.pasos.length - 1 ? 'hidden' : 'visible'; };
    const ir = (i) => {
      const atras = i < idx; if (i !== idx) marcar(R.pasos[idx].id); idx = Math.max(0, Math.min(R.pasos.length - 1, i));
      const p = R.pasos[idx]; stage.className = 'pe-stage' + (atras ? ' atras' : ''); void stage.offsetWidth;
      stage.innerHTML = `<h2><span class="ic">${p.icono}</span>${esc(p.titulo)}</h2>${p.intro ? `<p class="intro">${esc(p.intro)}</p>` : ''}<div id="pe-cuerpo"></div>`;
      (RENDER[p.tipo] || (() => {}))(p, $('#pe-cuerpo'));
      if (idx === R.pasos.length - 1) marcar(p.id);
      barra(); window.scrollTo({ top: Math.max(0, main.offsetTop - 70), behavior: 'smooth' });
    };
    $('#pe-ant').addEventListener('click', () => ir(idx - 1)); $('#pe-sig').addEventListener('click', () => ir(idx + 1));
    $$('.pe-rail button', main).forEach((b) => b.addEventListener('click', () => ir(+b.dataset.i)));
    document.onkeydown = (e) => { if (!$('#pe-stage')) { document.onkeydown = null; return; } if (e.key === 'ArrowRight') ir(idx + 1); else if (e.key === 'ArrowLeft') ir(idx - 1); };
    const RENDER = {
      hero(p, c) {
        c.innerHTML = `${p.parrafos.map((t) => `<p class="pr">${esc(t)}</p>`).join('')}<div class="pe-cifras">${p.cifras.map((x) => `<div class="pe-cifra"><b data-n="${x.n}">0</b><span>${esc(x.label)}</span></div>`).join('')}</div><div class="pe-aviso">💡 ${esc(p.dato)}</div>`;
        $$('.pe-cifra b', c).forEach((b) => contar(b, +b.dataset.n));
      },
      rotaciones(p, c) {
        const M = { semanas: 'Semanas', teoricas: 'Horas teóricas', practicas: 'Horas prácticas', total: 'Horas totales' }; let medida = 'total', sel = null;
        const pintar = () => {
          const max = Math.max(...p.rotaciones.map((r) => r[medida]));
          c.innerHTML = `<div class="pe-chips">${Object.entries(M).map(([k, t]) => `<button type="button" data-m="${k}" class="${k === medida ? 'on' : ''}">${t}</button>`).join('')}</div>
            <div class="pe-bars">${p.rotaciones.map((r, i) => `<button type="button" class="pe-bar ${sel === i ? 'on' : ''}" data-i="${i}" style="--c:${r.color}"><span class="nm">${r.icono} ${esc(r.nombre)}</span><span class="tr"><i style="width:0" data-w="${Math.round((r[medida] / max) * 100)}"></i></span><span class="vl">${r[medida]}</span></button>`).join('')}</div>
            ${sel != null ? (() => { const r = p.rotaciones[sel]; return `<div class="pe-det"><h4>${r.icono} ${esc(r.nombre)}</h4><div class="m"><span>📍 ${esc(r.ambito)}</span><span>🗓️ ${r.semanas} semanas</span><span>📖 ${r.teoricas} h teóricas</span><span>🩺 ${r.practicas} h prácticas</span><span>⏱️ ${r.total} h en total</span></div>${r.nota ? `<p>${esc(r.nota)}</p>` : ''}</div>`; })() : '<p class="intro" style="margin-top:12px">👆 Tocá una rotación para ver el detalle.</p>'}
            <div class="pe-tot"><span>📖 ${p.totales.teoricas} h teóricas</span><span>🩺 ${p.totales.practicas} h prácticas</span><span>⏱️ ${p.totales.total} h en total</span></div>`;
          setTimeout(() => $$('.pe-bar i', c).forEach((i) => { i.style.width = i.dataset.w + '%'; }), 30);
          $$('.pe-chips button', c).forEach((b) => b.addEventListener('click', () => { medida = b.dataset.m; pintar(); }));
          $$('.pe-bar', c).forEach((b) => b.addEventListener('click', () => { sel = sel === +b.dataset.i ? null : +b.dataset.i; pintar(); }));
        };
        pintar();
      },
      ambitos(p, c) {
        let a = 0;
        const pintar = () => { const x = p.ambitos[a];
          c.innerHTML = `<div class="pe-tabs">${p.ambitos.map((y, i) => `<button type="button" data-i="${i}" class="${i === a ? 'on' : ''}">${y.icono} ${esc(y.titulo)}</button>`).join('')}</div><div class="pe-panel"><span class="dato">⏱️ ${esc(x.dato)}</span><span class="dato">📌 ${esc(x.rotacion)}</span><p class="pr">${esc(x.texto)}</p><ul class="pe-lista">${x.actividades.map((t, i) => `<li style="--d:${i}">${esc(t)}</li>`).join('')}</ul></div><div class="pe-aviso" style="margin-top:14px">📍 ${esc(p.nodos)}</div>`;
          $$('.pe-tabs button', c).forEach((b) => b.addEventListener('click', () => { a = +b.dataset.i; pintar(); })); };
        pintar();
      },
      ritmo(p, c) { c.innerHTML = `<div class="pe-cards">${p.tarjetas.map((t, i) => `<div class="pe-card" style="--d:${i}"><span class="ic">${t.icono}</span><h4>${esc(t.titulo)}</h4><span class="dato">${esc(t.dato)}</span><p>${esc(t.texto)}</p></div>`).join('')}</div>`; },
      ingreso(p, c) {
        c.innerHTML = `<h3 class="pe-sub" style="margin-top:0">Requisitos para ingresar</h3><div class="pe-check" id="pi-req">${p.requisitos.map((t, i) => `<label><input type="checkbox" data-i="${i}"><span>${esc(t)}</span></label>`).join('')}</div><div class="pe-aviso" id="pi-ok" style="display:none">🎉 Cumplís las condiciones. Ahora elegí cuándo empezar:</div>
          <h3 class="pe-sub">Dos ingresos por año (tocá uno)</h3><div class="pe-ing">${p.ingresos.map((x, i) => `<button type="button" data-i="${i}"><span class="mes">${x.icono} ${esc(x.mes)}</span><b>${esc(x.titulo)}</b><p>${esc(x.quienes)}</p><div class="ext">▶️ <b style="display:inline">Inicio:</b> ${esc(x.inicio)}<br>🏁 <b style="display:inline">Fin:</b> ${esc(x.fin)}</div></button>`).join('')}</div>
          ${[p.vacantes, p.cambios].map((s) => `<div class="pe-det2"><button type="button"><span>${esc(s.titulo)}</span><i class="chev"></i></button><div class="cu"><div class="in">${s.texto ? `<p>${esc(s.texto)}</p>` : ''}<ol style="padding-left:20px;margin:6px 0 0">${(s.criterios || s.items).map((t) => `<li style="margin:5px 0">${esc(t)}</li>`).join('')}</ol></div></div></div>`).join('')}`;
        const req = $$('#pi-req input', c); req.forEach((b) => b.addEventListener('change', () => { b.parentElement.classList.toggle('on', b.checked); $('#pi-ok').style.display = req.every((x) => x.checked) ? 'block' : 'none'; if (req.every((x) => x.checked)) confeti(); }));
        $$('.pe-ing button', c).forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
        $$('.pe-det2 > button', c).forEach((b) => b.addEventListener('click', () => b.parentElement.classList.toggle('on')));
      },
      aprobacion(p, c) {
        let a = 0; const marcados = {};
        const pintar = () => { const e = p.espacios[a]; const m = marcados[e.id] = marcados[e.id] || new Set(); const pct = Math.round((m.size / e.requisitos.length) * 100);
          c.innerHTML = `<div class="pe-tabs">${p.espacios.map((x, i) => `<button type="button" data-i="${i}" class="${i === a ? 'on' : ''}">${x.icono} ${esc(x.titulo)}</button>`).join('')}</div>
            <div class="pe-panel"><div class="pe-anillo"><div class="r" style="--p:${pct}"><b>${pct}%</b></div><span>${m.size} de ${e.requisitos.length} condiciones tildadas. Marcá las que ya tenés claras.</span></div>
            <div class="pe-check">${e.requisitos.map((t, i) => `<label class="${m.has(i) ? 'on' : ''}"><input type="checkbox" data-i="${i}" ${m.has(i) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
            ${e.paciente ? `<h3 class="pe-sub">Así es la evaluación con el paciente</h3><div class="pe-flujo">${e.paciente.map((x, i) => `<div class="pe-card" style="--d:${i}"><span class="ic">${x.icono}</span><h4>${esc(x.titulo)}</h4><p>${esc(x.texto)}</p></div>`).join('')}</div>` : ''}
            ${e.nota ? `<div class="pe-aviso">📊 ${esc(e.nota)}</div>` : ''}
            ${e.recuperatorios ? `<h3 class="pe-sub">Si no aprobás</h3><div class="pe-flujo">${e.recuperatorios.map((x, i) => `<div class="pe-card" style="--d:${i}"><span class="ic">${x.icono}</span><h4>${esc(x.titulo)}</h4><p>${esc(x.texto)}</p></div>`).join('')}</div>` : ''}
            ${e.tribunal ? `<div class="pe-aviso" style="margin-top:12px">⚖️ ${esc(e.tribunal)}</div>` : ''}</div>`;
          $$('.pe-tabs button', c).forEach((b) => b.addEventListener('click', () => { a = +b.dataset.i; pintar(); }));
          $$('.pe-check input', c).forEach((b) => b.addEventListener('change', () => { b.checked ? m.add(+b.dataset.i) : m.delete(+b.dataset.i); pintar(); if (m.size === e.requisitos.length) confeti(); })); };
        pintar();
      },
      ecoe(p, c) {
        c.innerHTML = `<div class="pe-camino">${p.camino.map((x, i) => `<div class="pe-card ${i === 0 ? 'on' : ''}" style="--d:${i}"><span class="num">${i + 1}</span><div><h4>${x.icono} ${esc(x.titulo)}</h4><p>${esc(x.texto)}</p></div></div>`).join('')}</div>
          <h3 class="pe-sub">Llamados al ECOE</h3><div class="pe-mes">${p.llamados.map((m, i) => `<span style="--d:${i}">${m}</span>`).join('')}</div><p class="intro" style="margin:0">${esc(p.llamadosTexto)}</p>
          <h3 class="pe-sub">Comité de la defensa del TII</h3><ul class="pe-lista">${p.comite.map((t, i) => `<li style="--d:${i}">${esc(t)}</li>`).join('')}</ul><p class="intro" style="margin:10px 0 0">${esc(p.comiteTexto)}</p><div class="pe-aviso">🏁 ${esc(p.finalizacion)}</div>
          <div class="pe-hero-acc" style="margin-top:14px"><a class="plus" href="pfo_ecoe.html" style="color:#fff">📝 Practicá el ECOE en el simulador</a></div>`;
        $$('.pe-camino .pe-card', c).forEach((el) => el.addEventListener('click', () => { $$('.pe-camino .pe-card', c).forEach((x) => x.classList.toggle('on', x === el)); }));
      },
      derechos(p, c) {
        c.innerHTML = `<div class="pe-cards">${p.tarjetas.map((t, i) => `<div class="pe-flip" style="--d:${i}"><div class="cara"><div class="f"><span class="ic">${t.icono}</span><b>${esc(t.titulo)}</b><small>Tocá para darla vuelta</small></div><div class="b"><h4>${t.icono} ${esc(t.titulo)}</h4><ul>${t.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div>`).join('')}</div>`;
        $$('.pe-flip', c).forEach((el) => el.addEventListener('click', () => el.classList.toggle('vuelta')));
      },
      quiz(p, c) {
        let q = 0, ok = 0;
        const pintar = () => {
          if (q >= p.preguntas.length) { const mejor = Math.max(est.tour.mejor || 0, ok); est.tour.mejor = mejor; p.preguntas.forEach(() => {}); R.pasos.forEach((x) => marcar(x.id)); guardar(est); barra(); if (ok >= 6) confeti();
            c.innerHTML = `<div class="pe-fin"><div class="big">${ok === p.preguntas.length ? '🏆' : ok >= 6 ? '🎉' : '📚'}</div><h3>${ok} de ${p.preguntas.length} correctas</h3><p>${ok === p.preguntas.length ? '¡Perfecto! Dominás cómo funciona la PFO.' : ok >= 6 ? '¡Muy bien! Repasá el recorrido para pulir los detalles.' : 'Repasá el recorrido y volvé a intentarlo: ya tenés todo a mano.'} Tu mejor resultado: ${mejor} de ${p.preguntas.length}.</p><div class="pe-nav" style="justify-content:center"><button class="pfo-btn" id="pq-otra">↺ Jugar de nuevo</button><a class="pfo-btn sec" href="estudio.html?modulo=pfo">Volver a la Sala de Estudio</a></div></div>`; $('#pq-otra').addEventListener('click', () => { q = 0; ok = 0; pintar(); }); return; }
          const x = p.preguntas[q];
          c.innerHTML = `<div class="pe-prog-top"><b style="width:${Math.round((q / p.preguntas.length) * 100)}%"></b></div><small style="font-weight:800;color:var(--pf-mut)">Pregunta ${q + 1} de ${p.preguntas.length} · ${ok} correctas</small><div class="pe-q">${esc(x.q)}</div><div class="pe-ops">${x.o.map((t, i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join('')}</div><div id="pq-e"></div>`;
          $$('.pe-ops button', c).forEach((b) => b.addEventListener('click', () => {
            const i = +b.dataset.i; $$('.pe-ops button', c).forEach((x2) => { x2.disabled = true; }); if (i === x.c) { ok++; b.classList.add('bien'); } else { b.classList.add('mal'); $$('.pe-ops button', c)[x.c].classList.add('bien'); }
            $('#pq-e').innerHTML = `<div class="pe-expl">${i === x.c ? '✅ ¡Correcto! ' : '❌ No era esa. '}${esc(x.e)}</div><div class="pe-nav" style="justify-content:flex-end"><button class="pfo-btn" id="pq-n">${q === p.preguntas.length - 1 ? 'Ver resultado' : 'Siguiente ➜'}</button></div>`; $('#pq-n').addEventListener('click', () => { q++; pintar(); });
          }));
        };
        pintar();
      }
    };
    ir(0);
  }

  // ------------------------------------------------------------------ rutas
  function ruta() {
    document.onkeydown = null; cerrarModal();
    const [mid, sid, pid] = decodeURIComponent(location.hash.replace(/^#/, '')).split('/');
    if (!D) return;
    // Esta pantalla solo muestra los recorridos y tutoriales interactivos; el resto vive en la Sala de Estudio completa
    if (!(mid === 'generalidades' || (mid && sid && pid))) { location.replace('estudio.html?modulo=pfo'); return; }
    if (!mid) { vistaHub(); } else {
      const m = modulo(mid); if (!m) { vistaHub(); } else if (!sid) vistaModulo(m); else {
        const s = (m.secciones || []).find((x) => x.id === sid); if (!s) vistaModulo(m); else if (pid) { const it = (s.items || []).find((x) => x.proc === pid); it ? vistaProc(m, s, it) : vistaSeccion(m, s); } else vistaSeccion(m, s);
      }
    }
    window.scrollTo({ top: 0 });
  }
  async function iniciar() {
    try {
      const [a, b, c] = await Promise.all([fetch('data/pfo/estudio.json', { cache: 'no-cache' }), fetch('data/pfo/procedimientos_guias.json', { cache: 'no-cache' }).catch(() => null), fetch('data/pfo/procedimientos.json', { cache: 'no-cache' }).catch(() => null)]);
      D = await a.json();
      try { if (b && b.ok) PROC = Object.assign(PROC, await b.json()); } catch (_) {}
      try { if (c && c.ok) PROC = Object.assign(PROC, (await c.json()).procedimientos || {}); } catch (_) {}
      window.addEventListener('hashchange', ruta); ruta();
    } catch (e) { main.innerHTML = `<div class="pfo-cargando">No se pudo cargar la sala de estudio (${esc(e && e.message)}). Recargá la página.</div>`; }
  }
  window.__PE = { ruta, cfg: () => D, proc: () => PROC };
  iniciar();
})();
