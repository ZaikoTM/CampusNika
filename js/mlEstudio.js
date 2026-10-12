// CAMPUS NIKA — Medicina Legal: recorrido virtual del programa (ml_estudio.html).
// Datos: data/medicinalegal_recorrido.json (pasos del recorrido) y data/medicinalegal.json (unidades, material y videos de la sala).
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const main = $('#pe-main');
  const reducido = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOD = (new URLSearchParams(location.search).get('m') || 'medicinalegal').replace(/[^a-z]/g, '');
  let LS = 'nika_ml_estudio';
  const leer = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (_) { return {}; } };
  const guardar = (o) => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (_) {} };
  let SALA = 'estudio.html?modulo=' + MOD;
  let ANIO = '5to'; try { ANIO = localStorage.getItem('nika_ml_anio') === '4to' ? '4to' : '5to'; } catch (_) {}
  $$('a[href="sala_estudio.html#5to"]').forEach((x) => { x.href = 'sala_estudio.html#' + ANIO; });
  let R = null, SALA_DATA = null;

  function contar(el, hasta, ms) {
    if (reducido()) { el.textContent = hasta.toLocaleString('es-AR'); return; }
    const t0 = Date.now(); const iv = setInterval(() => { const k = Math.min(1, (Date.now() - t0) / (ms || 1100)); el.textContent = Math.round(hasta * (1 - Math.pow(1 - k, 3))).toLocaleString('es-AR'); if (k >= 1) clearInterval(iv); }, 30);
  }
  function confeti() {
    if (reducido()) return; const cv = document.createElement('canvas'); cv.className = 'pfo-conf'; document.body.appendChild(cv); const x = cv.getContext('2d'); const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const col = ['#fda4af', '#be123c', '#f59e0b', '#fde68a', '#a78bfa', '#22c55e']; const P = Array.from({ length: 130 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: col[(Math.random() * col.length) | 0] }));
    const t0 = Date.now(); const iv = setInterval(() => { x.clearRect(0, 0, W, H); P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (Date.now() - t0 > 3500) { clearInterval(iv); cv.remove(); } }, 33);
  }

  function vistaRecorrido() {
    const est = leer(); est.tour = est.tour || { vistos: [], mejor: 0, comp: [], req: {} }; est.tour.comp = est.tour.comp || []; est.tour.req = est.tour.req || {};
    let idx = Math.min(R.pasos.length - 1, Math.max(0, parseInt((location.hash || '').replace('#paso', ''), 10) - 1 || 0));
    main.innerHTML = `
      <section class="pe-hero ml-hero">
        <span class="ml-balanza" aria-hidden="true"><i class="b"></i><i class="p"></i><i class="l"></i><i class="r"></i></span>
        <span class="pfo-chip plus">${esc(R.chip || '⚖️ Medicina Legal')}</span>
        <h1>${esc(R.titulo).replace(esc(R.destacar || 'Medicina Legal'), '<em>' + esc(R.destacar || 'Medicina Legal') + '</em>')}</h1>
        <p>${esc(R.subtitulo)}</p>
        <div class="pe-hero-acc">${(R.acciones || [{ texto: '📖 Ir a las 7 unidades', href: SALA, plus: true }]).map((a) => `<a class="${a.plus ? 'plus' : ''}" href="${esc(a.href)}">${esc(a.texto)}</a>`).join('')}<a href="${MOD === 'medicinalegal' ? 'sala_estudio.html#' + ANIO : (R.salasHref || 'sala_estudio.html#5to')}">📚 Salas de estudio</a></div>
      </section>
      <div class="pe-prog-top" style="margin-top:18px"><b id="pe-pt"></b></div>
      <div class="pe-tour"><nav class="pe-rail" aria-label="Pasos del recorrido">${R.pasos.map((p, i) => `<button type="button" data-i="${i}"><span class="ic">${p.icono}</span><span class="t">${esc(p.titulo)}</span><span class="ok">✓</span></button>`).join('')}</nav>
      <div><div class="pe-stage" id="pe-stage"></div><div class="pe-nav"><button type="button" class="pfo-btn sec" id="pe-ant">← Anterior</button><span class="cnt" id="pe-cnt"></span><button type="button" class="pfo-btn pulso" id="pe-sig">Siguiente ➜</button></div></div></div>`;
    const stage = $('#pe-stage');
    const marcar = (id) => { if (!est.tour.vistos.includes(id)) { est.tour.vistos.push(id); guardar(est); } };
    const barra = () => {
      $('#pe-pt').style.width = Math.round((est.tour.vistos.length / R.pasos.length) * 100) + '%';
      $$('.pe-rail button', main).forEach((b, i) => { b.classList.toggle('on', i === idx); b.classList.toggle('visto', est.tour.vistos.includes(R.pasos[i].id)); });
      $('#pe-cnt').textContent = `Paso ${idx + 1} de ${R.pasos.length}`; $('#pe-ant').disabled = idx === 0; $('#pe-sig').style.visibility = idx === R.pasos.length - 1 ? 'hidden' : 'visible';
    };
    const ir = (i, scroll) => {
      const atras = i < idx; if (i !== idx) marcar(R.pasos[idx].id); idx = Math.max(0, Math.min(R.pasos.length - 1, i));
      const p = R.pasos[idx]; stage.className = 'pe-stage' + (atras ? ' atras' : ''); void stage.offsetWidth;
      stage.innerHTML = `<h2><span class="ic ml-ic">${p.icono}</span>${esc(p.titulo)}</h2>${p.intro ? `<p class="intro">${esc(p.intro)}</p>` : ''}<div id="pe-cuerpo"></div>`;
      (RENDER[p.tipo] || (() => {}))(p, $('#pe-cuerpo'));
      if (idx === R.pasos.length - 1) marcar(p.id);
      barra(); try { history.replaceState(null, '', '#paso' + (idx + 1)); } catch (_) {}
      if (scroll !== false) window.scrollTo({ top: Math.max(0, $('.pe-tour').offsetTop - 70), behavior: 'smooth' });
    };
    $('#pe-ant').addEventListener('click', () => ir(idx - 1)); $('#pe-sig').addEventListener('click', () => ir(idx + 1));
    $$('.pe-rail button', main).forEach((b) => b.addEventListener('click', () => ir(+b.dataset.i)));
    document.onkeydown = (e) => { if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return; if (e.key === 'ArrowRight') ir(idx + 1); else if (e.key === 'ArrowLeft') ir(idx - 1); };

    const conteoUnidad = (n) => {
      const u = SALA_DATA && SALA_DATA.units.find((x) => x.number === n); if (!u) return { m: 0, v: 0 };
      const ss = (u.secciones || []);
      return { m: (u.materiales || []).length + ss.reduce((a, x) => a + (x.materiales || []).length, 0), v: (u.videos || []).length + ss.reduce((a, x) => a + (x.videos || []).length, 0) };
    };
    const RENDER = {
      hero(p, c) {
        c.innerHTML = `${p.parrafos.map((t) => `<p class="pr">${esc(t)}</p>`).join('')}<div class="pe-cifras">${p.cifras.map((x) => `<div class="pe-cifra"><b data-n="${x.n}">0</b><span>${esc(x.label)}</span></div>`).join('')}</div><div class="pe-aviso">💡 ${esc(p.dato)}</div>`;
        $$('.pe-cifra b', c).forEach((b) => contar(b, +b.dataset.n));
      },
      tabs(p, c) {
        let a = 0;
        const pintar = () => { const x = p.tabs[a];
          c.innerHTML = `<div class="pe-tabs">${p.tabs.map((y, i) => `<button type="button" data-i="${i}" class="${i === a ? 'on' : ''}">${y.icono} ${esc(y.titulo)}</button>`).join('')}</div>
            <div class="pe-panel"><span class="dato">${x.icono} ${esc(x.dato)}</span><p class="pr">${esc(x.texto)}</p><ul class="pe-lista">${x.items.map((t, i) => `<li style="--d:${i}">${esc(t)}</li>`).join('')}</ul></div>`;
          $$('.pe-tabs button', c).forEach((b) => b.addEventListener('click', () => { a = +b.dataset.i; pintar(); })); };
        pintar();
      },
      unidades(p, c) {
        c.innerHTML = `<div class="pe-cards ml-unidades">${p.unidades.map((u, i) => { const k = conteoUnidad(u.n);
          return `<div class="pe-flip ml-flip" style="--d:${i}" tabindex="0" role="button" aria-label="${esc(R.etiquetaUnidad || 'Unidad')} ${u.n}: ${esc(u.titulo)}"><div class="cara"><div class="f"><span class="ic">${u.icono}</span><span class="ml-num">${esc(R.etiquetaUnidad || 'Unidad')} ${u.n}</span><b>${esc(u.titulo)}</b><small>Tocá para ver los temas</small></div>
            <div class="b"><h4>${u.icono} ${esc(R.etiquetaUnidad || 'Unidad')} ${u.n}</h4><ul>${u.temas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><div class="ml-meta"><span>📄 ${k.m} materiales</span><span>🎬 ${k.v} videos</span></div><div class="ml-prog">Corresponde a: ${esc(u.programa)}</div><a class="ml-ir" href="${SALA}&up=${u.n}">Entrar a la unidad →</a></div></div></div>`; }).join('')}</div>`;
        $$('.pe-flip', c).forEach((el) => {
          el.addEventListener('click', (e) => { if (e.target.closest('a')) return; el.classList.toggle('vuelta'); });
          el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('vuelta'); } });
        });
      },
      competencias(p, c) {
        const sel = new Set(est.tour.comp);
        const pintar = () => { const pct = Math.round((sel.size / p.lista.length) * 100);
          c.innerHTML = `<div class="pe-anillo"><div class="r" style="--p:${pct}"><b>${pct}%</b></div><span>${sel.size} de ${p.lista.length} competencias tildadas. ${sel.size === p.lista.length ? '¡Ya las dominás todas! Igual repasalas en la sala.' : 'Marcá las que ya sentís propias.'}</span></div>
            <div class="pe-check">${p.lista.map((t, i) => `<label class="${sel.has(i) ? 'on' : ''}"><input type="checkbox" data-i="${i}" ${sel.has(i) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>`;
          $$('.pe-check input', c).forEach((b) => b.addEventListener('change', () => { b.checked ? sel.add(+b.dataset.i) : sel.delete(+b.dataset.i); est.tour.comp = [...sel]; guardar(est); pintar(); if (sel.size === p.lista.length) confeti(); })); };
        pintar();
      },
      tarjetas(p, c) { c.innerHTML = `<div class="pe-cards">${p.tarjetas.map((t, i) => `<div class="pe-card ml-card" style="--d:${i}"><span class="ic">${t.icono}</span><h4>${esc(t.titulo)}</h4><span class="dato">${esc(t.dato)}</span><p>${esc(t.texto)}</p></div>`).join('')}</div>`; },
      evaluacion(p, c) {
        let a = 0;
        const pintar = () => { const e = p.espacios[a]; const m = new Set(est.tour.req[e.id] || []); const pct = Math.round((m.size / e.requisitos.length) * 100);
          c.innerHTML = `<div class="pe-tabs">${p.espacios.map((x, i) => `<button type="button" data-i="${i}" class="${i === a ? 'on' : ''}">${x.icono} ${esc(x.titulo)}</button>`).join('')}</div>
            <div class="pe-panel"><div class="pe-anillo"><div class="r" style="--p:${pct}"><b>${pct}%</b></div><span>${m.size} de ${e.requisitos.length} puntos claros. Tildá los que ya tenés.</span></div>
            <div class="pe-check">${e.requisitos.map((t, i) => `<label class="${m.has(i) ? 'on' : ''}"><input type="checkbox" data-i="${i}" ${m.has(i) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
            ${e.nota ? `<div class="pe-aviso">📊 ${esc(e.nota)}</div>` : ''}</div>`;
          $$('.pe-tabs button', c).forEach((b) => b.addEventListener('click', () => { a = +b.dataset.i; pintar(); }));
          $$('.pe-check input', c).forEach((b) => b.addEventListener('change', () => { b.checked ? m.add(+b.dataset.i) : m.delete(+b.dataset.i); est.tour.req[e.id] = [...m]; guardar(est); pintar(); if (m.size === e.requisitos.length) confeti(); })); };
        pintar();
      },
      normas(p, c) {
        c.innerHTML = `<div class="pe-cards">${p.tarjetas.map((t, i) => `<div class="pe-flip" style="--d:${i}" tabindex="0" role="button"><div class="cara"><div class="f"><span class="ic">${t.icono}</span><b>${esc(t.titulo)}</b><small>Tocá para darla vuelta</small></div><div class="b"><h4>${t.icono} ${esc(t.titulo)}</h4><ul>${t.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div>`).join('')}</div>`;
        $$('.pe-flip', c).forEach((el) => { el.addEventListener('click', () => el.classList.toggle('vuelta')); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('vuelta'); } }); });
      },
      quiz(p, c) {
        let q = 0, ok = 0;
        const pintar = () => {
          if (q >= p.preguntas.length) {
            const mejor = Math.max(est.tour.mejor || 0, ok); est.tour.mejor = mejor; R.pasos.forEach((x) => marcar(x.id)); guardar(est); barra(); if (ok >= 6) confeti();
            c.innerHTML = `<div class="pe-fin"><div class="big ml-sello">${ok === p.preguntas.length ? '🏆' : ok >= 6 ? '🎉' : '📚'}</div><h3>${ok} de ${p.preguntas.length} correctas</h3><p>${ok === p.preguntas.length ? '¡Perfecto! Ya sabés cómo funciona la materia.' : ok >= 6 ? '¡Muy bien! Repasá el recorrido para pulir los detalles.' : 'Repasá el recorrido y volvé a intentarlo.'} Tu mejor resultado: ${mejor} de ${p.preguntas.length}.</p>
              <div class="pe-nav" style="justify-content:center"><button class="pfo-btn" id="pq-otra">↺ Jugar de nuevo</button><a class="pfo-btn sec" href="${SALA}">📖 Empezar por la unidad 1</a></div></div>`;
            $('#pq-otra').addEventListener('click', () => { q = 0; ok = 0; pintar(); }); return;
          }
          const x = p.preguntas[q];
          c.innerHTML = `<div class="pe-prog-top"><b style="width:${Math.round((q / p.preguntas.length) * 100)}%"></b></div><small style="font-weight:800;color:var(--pf-mut)">Pregunta ${q + 1} de ${p.preguntas.length} · ${ok} correctas</small><div class="pe-q">${esc(x.q)}</div><div class="pe-ops">${x.o.map((t, i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join('')}</div><div id="pq-e"></div>`;
          $$('.pe-ops button', c).forEach((b) => b.addEventListener('click', () => {
            const i = +b.dataset.i; $$('.pe-ops button', c).forEach((x2) => { x2.disabled = true; });
            if (i === x.c) { ok++; b.classList.add('bien'); } else { b.classList.add('mal'); $$('.pe-ops button', c)[x.c].classList.add('bien'); }
            $('#pq-e').innerHTML = `<div class="pe-expl">${i === x.c ? '✅ ¡Correcto! ' : '❌ No era esa. '}${esc(x.e)}</div><div class="pe-nav" style="justify-content:flex-end"><button class="pfo-btn" id="pq-n">${q === p.preguntas.length - 1 ? 'Ver resultado' : 'Siguiente ➜'}</button></div>`;
            $('#pq-n').addEventListener('click', () => { q++; pintar(); });
          }));
        };
        pintar();
      }
    };
    ir(idx, false);
  }

  async function init() {
    try {
      const archivo = MOD === 'medicinalegal' ? 'data/medicinalegal_recorrido.json' : `data/recorrido_${MOD}.json`;
      const a = await fetch(archivo); R = await a.json();
      const b = await fetch(R.datos || 'data/medicinalegal.json'); SALA_DATA = b.ok ? await b.json() : null;
      if (R.sala) SALA = R.sala; if (R.ls) LS = R.ls;
      if (R.tema) { const t = R.tema, st = document.body.style; st.setProperty('--rc-a', t.a); st.setProperty('--rc-b', t.b); st.setProperty('--rc-c', t.c); st.setProperty('--rc-main', t.main); st.setProperty('--rc-dark', t.dark); st.setProperty('--rc-gold', t.gold); }
      if (R.marca) { const sm = document.querySelector('.pfo-brand small'); if (sm) sm.textContent = R.marca; }
      if (R.nombreMateria) document.title = R.nombreMateria + ' · Recorrido virtual | Campus Nika';
      if (R.salasHref && MOD !== 'medicinalegal') { $$('a.pfo-btn-top[href^="sala_estudio.html"]').forEach((x) => { x.href = R.salasHref; }); }
      try {
        const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null');
        const plus = !!(window.NikaAcceso && typeof window.NikaAcceso.tieneAccesoCompleto === 'function' && window.NikaAcceso.tieneAccesoCompleto());
        if (SALA_DATA && !plus && !(u && String(u.role || '').toLowerCase() === 'admin')) SALA_DATA.units.forEach((x) => { x.videos = (x.videos || []).filter((v) => !v.oculto); });
      } catch (_) {}
      vistaRecorrido();
    } catch (e) {
      console.error('[MedLegal]', e);
      main.innerHTML = '<div class="pe-aviso">No pudimos cargar el recorrido. Probá recargar la página.</div>';
    }
  }
  init();
})();
