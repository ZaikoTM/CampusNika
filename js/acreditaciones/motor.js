// CAMPUS NIKA — Atlas de acreditaciones: motor genérico.
// Cada acreditación = data/acreditaciones/<area>/<id>.json + js/acreditaciones/escena_<id>.js (window.ACR_ESCENAS[id]).
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const mezclar = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) {}
  if (!usuario) { location.href = 'index.html'; return; }
  const uKey = usuario.username || 'invitado';
  const clave = `nika_acr_${uKey}`;
  const leerRes = () => { try { return JSON.parse(localStorage.getItem(clave) || '{}'); } catch (_) { return {}; } };
  const guardarRes = (area, id, tipo, dato) => {
    try {
      const r = leerRes(); const k = `${area}/${id}`;
      r[k] = r[k] || {};
      const prev = r[k][tipo] || { intentos: 0, mejor: 0 };
      r[k][tipo] = { ...dato, intentos: prev.intentos + 1, mejor: Math.max(prev.mejor || 0, dato.pct || 0), fecha: new Date().toISOString() };
      localStorage.setItem(clave, JSON.stringify(r));
    } catch (_) {}
  };

  const params = new URLSearchParams(location.search);
  const area = params.get('area') || 'siam';
  const id = params.get('id');
  const app = $('#acr-app');
  const volver = $('#acr-volver');
  const base = `data/acreditaciones/${area}`;

  const getJSON = (u) => fetch(u, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });

  // ------------------------------------------------------------------ listado
  async function vistaLista() {
    volver.href = area === 'siam' ? 'siam_hub.html' : 'campus.html';
    const idx = await getJSON(`${base}/index.json`);
    const res = leerRes();
    app.innerHTML = `
      <h1 class="acr-h1">🩺 Atlas de acreditaciones · ${esc(idx.nombre)}</h1>
      <p class="acr-sub">Recorridos virtuales de cada acreditación. Explorá el procedimiento, entrenalo paso a paso y rendí la evaluación con la lista de cotejo de la cátedra, con sus criterios de desaprobación.</p>
      <div class="acr-lista">${idx.acreditaciones.map((a) => {
        const on = a.estado === 'activo';
        const r = res[`${area}/${a.id}`] && res[`${area}/${a.id}`].evaluar;
        const estado = !on ? '<span class="acr-pill">Próximamente</span>' : r ? `<span class="acr-pill ${r.aprobado ? 'ok' : 'bad'}">${r.aprobado ? 'Aprobada' : 'Desaprobada'} · mejor ${r.mejor}%</span>` : '<span class="acr-pill">Disponible</span>';
        return `<${on ? `a href="acreditaciones.html?area=${area}&id=${a.id}"` : 'div'} class="acr-card ${on ? 'on' : 'off'}"><div class="ico">${a.icono}</div><h3>${esc(a.titulo)}</h3><small>${a.pasos} pasos en la lista de cotejo</small>${estado}</${on ? 'a' : 'div'}>`;
      }).join('')}</div>`;
  }

  // ------------------------------------------------------------------ atlas
  async function vistaAtlas() {
    volver.href = `acreditaciones.html?area=${area}`;
    const D = await getJSON(`${base}/${id}.json`);
    await new Promise((ok, no) => { const s = document.createElement('script'); s.src = `js/acreditaciones/escena_${id}.js?v=1`; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    const ESC = window.ACR_ESCENAS[id];
    document.title = `${D.titulo} · Atlas de acreditaciones`;

    const S = { modo: 'explorar', sexo: 'F', paso: 0, sel: null, ent: null, ev: null, fun: null };
    const aplica = (p, sexo) => !p.solo || p.solo === (sexo || S.sexo);
    const pasosAplicables = (sexo) => D.pasos.filter((p) => aplica(p, sexo));
    const porN = (n) => D.pasos.find((p) => p.n === n);

    app.innerHTML = `
      <div class="acr-head">
        <div><h1 class="acr-h1">${D.icono} ${esc(D.titulo)}</h1><p class="acr-sub" style="margin-bottom:0">${esc(D.resumen)}</p></div>
        <div class="acr-crit-box"><b>⚠ Criterios de desaprobación.</b> ${esc(D.criterios_texto)}</div>
      </div>
      <div class="acr-tabs" id="acr-tabs"></div>
      <div class="acr-grid">
        <div><div class="acr-escena" id="acr-escena"></div><div class="acr-chips" id="acr-chips"></div></div>
        <aside class="acr-panel" id="acr-panel"></aside>
      </div>`;

    const TABS = [['explorar', '🔎 Explorar'], ['entrenar', '🎯 Entrenar'], ['evaluar', '📝 Evaluar'], ['fundamentos', '📚 Fundamentos']];
    function pintarTabs() {
      $('#acr-tabs').innerHTML = TABS.map(([k, l]) => `<button class="acr-tab ${S.modo === k ? 'on' : ''}" data-modo="${k}">${l}</button>`).join('') +
        `<span class="acr-sexo" id="acr-sexo" ${S.modo === 'evaluar' || S.modo === 'fundamentos' ? 'hidden' : ''}><button data-sx="F" class="${S.sexo === 'F' ? 'on' : ''}">♀ Mujer</button><button data-sx="M" class="${S.sexo === 'M' ? 'on' : ''}">♂ Varón</button></span>`;
    }

    // ---- escena
    let svg = null;
    function montarEscena(estatica) {
      $('#acr-escena').innerHTML = ESC.build(S.sexo);
      svg = $('#acr-escena').firstElementChild;
      if (estatica) svg.classList.add('estatica');
    }
    function estadoHasta(n) {
      const est = {}; const usados = new Set();
      D.pasos.forEach((p) => { if (p.n <= n && aplica(p)) { Object.assign(est, p.estado); if (ESC.usable.includes(p.target)) usados.add(p.target); } });
      return { est, usados };
    }
    function aplicarEstado(est, usados) {
      [...svg.classList].filter((c) => /^(s-|g-)/.test(c)).forEach((c) => svg.classList.remove(c));
      Object.entries(est || {}).forEach(([k, v]) => { if (v === 'none') return; svg.classList.add(typeof v === 'string' ? `g-${v}` : `s-${k}`); });
      svg.querySelectorAll('.hs.used').forEach((e) => e.classList.remove('used'));
      (usados || []).forEach((t) => { const e = svg.querySelector(`[data-hs="${t}"]`); if (e) e.classList.add('used'); });
      const e = est || {};
      $('#acr-chips').innerHTML = ESC.CHIPS.map(([k, l]) => `<span class="acr-chip ${e[k] ? 'on' : ''}">${e[k] ? '✔ ' : ''}${esc(l)}</span>`).join('');
    }
    function resaltar(t) {
      svg.querySelectorAll('.hl').forEach((e) => e.classList.remove('hl'));
      if (t) svg.querySelectorAll(`[data-hs="${t}"]`).forEach((e) => e.classList.add('hl'));
    }
    function marcarSel(t) {
      svg.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel'));
      if (t) svg.querySelectorAll(`[data-hs="${t}"]`).forEach((e) => e.classList.add('sel'));
    }
    function sinEstado() { aplicarEstado({}, []); }

    // ---- EXPLORAR
    function vistaExplorar() {
      montarEscena(false);
      const fases = []; pasosAplicables().forEach((p) => { let f = fases.find((x) => x.nombre === p.fase); if (!f) { f = { nombre: p.fase, pasos: [] }; fases.push(f); } f.pasos.push(p); });
      $('#acr-panel').innerHTML = `
        <h3>Recorrido paso a paso</h3>
        <p>Tocá un paso para ver cómo queda la escena y por qué se hace así. También podés tocar cualquier elemento del dibujo.</p>
        <div id="acr-detalle"></div>
        ${fases.map((f) => `<div class="acr-fase">${esc(f.nombre)}</div>${f.pasos.map((p) => `<button class="acr-paso" data-paso="${p.n}"><span class="n">${p.n}</span><span>${esc(p.texto)} ${p.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</span></button>`).join('')}`).join('')}`;
      const ver = (n) => {
        const p = porN(n); S.paso = n;
        document.querySelectorAll('.acr-paso').forEach((b) => b.classList.toggle('sel', +b.dataset.paso === n));
        const { est, usados } = estadoHasta(n); aplicarEstado(est, usados); resaltar(p.target); marcarSel(null);
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>Paso ${p.n}${p.critico ? ' · ⚠ criterio de desaprobación' : ''}</b><br>${esc(p.explica)}</div>`;
        const b = document.querySelector(`.acr-paso[data-paso="${n}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
      };
      S.verPaso = ver;
      sinEstado();
      $('#acr-panel').onclick = (e) => { const b = e.target.closest('.acr-paso'); if (b) ver(+b.dataset.paso); const ir = e.target.closest('[data-ir]'); if (ir) ver(+ir.dataset.ir); };
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g) return;
        const el = D.elementos[g.dataset.hs]; if (!el) return;
        marcarSel(g.dataset.hs); resaltar(null);
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>${esc(el.nombre)}</b><br>${esc(el.desc)}<br><small>Pasos donde interviene: ${el.pasos.filter((n) => aplica(porN(n))).map((n) => `<a href="#" data-ir="${n}" onclick="return false">${n}</a>`).join(', ')}</small></div>`;
      };
    }

    // ---- ENTRENAR
    function vistaEntrenar() {
      montarEscena(false);
      const lista = pasosAplicables();
      S.ent = { i: 0, errores: 0, pistas: 0, esperando: true, lista };
      sinEstado();
      pintarEntrenar();
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g || !S.ent.esperando || S.ent.fin) return;
        const p = S.ent.lista[S.ent.i];
        if (g.dataset.hs === p.target) {
          S.ent.esperando = false; resaltar(null);
          const { est, usados } = estadoHasta(p.n); aplicarEstado(est, usados);
          pintarEntrenar({ ok: p });
        } else {
          S.ent.errores++;
          g.classList.add('mal'); setTimeout(() => g.classList.remove('mal'), 500);
          pintarEntrenar({ mal: true });
        }
      };
    }
    function pintarEntrenar(fb) {
      const E = S.ent; const tot = E.lista.length;
      if (E.i >= tot) {
        E.fin = true; resaltar(null);
        $('#acr-panel').innerHTML = `<h3>¡Recorrido completo!</h3><div class="acr-info bien">Terminaste los ${tot} pasos con <b>${E.errores}</b> error${E.errores === 1 ? '' : 'es'} y <b>${E.pistas}</b> pista${E.pistas === 1 ? '' : 's'}.</div><p>Cuando te sientas seguro, probá el modo <b>Evaluar</b>: sin ayudas y con corrección estricta.</p><div class="acr-row"><button class="acr-btn" id="acr-rep">Repetir</button><button class="acr-btn sec" id="acr-ir-ev">Ir a Evaluar</button></div>`;
        $('#acr-rep').onclick = vistaEntrenar; $('#acr-ir-ev').onclick = () => cambiarModo('evaluar');
        return;
      }
      const p = E.lista[E.i];
      $('#acr-panel').innerHTML = `
        <div class="acr-fase" style="margin-top:0">${esc(p.fase)} · paso ${E.i + 1} de ${tot}</div>
        <div class="acr-prog"><i style="width:${Math.round((E.i / tot) * 100)}%"></i></div>
        <div class="acr-goal">${esc(p.texto)} ${p.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</div>
        <p>Tocá en el dibujo el elemento con el que se realiza este paso.</p>
        ${fb && fb.mal ? '<div class="acr-info mal">❌ Ese elemento no corresponde a este paso. Revisá la consigna.</div>' : ''}
        ${fb && fb.ok ? `<div class="acr-info bien">✅ <b>Correcto.</b> ${esc(fb.ok.explica)}</div>` : ''}
        <div class="acr-row">${fb && fb.ok ? '<button class="acr-btn" id="acr-sig">Continuar →</button>' : '<button class="acr-btn sec" id="acr-pista">💡 Pista</button>'}</div>
        <small>Errores: ${E.errores} · Pistas: ${E.pistas}</small>`;
      const pb = $('#acr-pista'); if (pb) pb.onclick = () => { E.pistas++; resaltar(p.target); pb.disabled = true; };
      const sg = $('#acr-sig'); if (sg) sg.onclick = () => { E.i++; E.esperando = true; resaltar(null); pintarEntrenar(); };
    }

    // ---- EVALUAR
    function vistaEvaluar() {
      const caso = azar(D.casos); S.sexo = caso.sexo; pintarTabs();
      montarEscena(true); sinEstado();
      const apl = pasosAplicables(caso.sexo);
      const dist = D.distractores.filter((d) => !d.solo || d.solo === caso.sexo);
      const cartas = mezclar([...apl.map((p) => ({ k: 'p', id: p.n, texto: p.texto })), ...dist.map((d) => ({ k: 'd', id: d.id, texto: d.texto }))]);
      S.ev = { caso, apl, dist, cartas, seq: [], t0: Date.now(), fin: false };
      pintarEvaluar();
    }
    function pintarEvaluar() {
      const V = S.ev; const usados = new Set(V.seq.map((c) => c.k + c.id));
      $('#acr-panel').innerHTML = `
        <h3>Evaluación con lista de cotejo</h3>
        <div class="acr-info"><b>Caso:</b> ${V.caso.sexo === 'F' ? 'Mujer' : 'Varón'} de ${V.caso.edad} años. ${esc(V.caso.motivo)}</div>
        <p>Armá la secuencia completa de acciones del procedimiento, en el orden correcto, eligiendo del banco. Hay acciones incorrectas: elegirlas penaliza. Sin ayudas.</p>
        <div class="acr-fase">Tu secuencia (${V.seq.length})</div>
        <ol class="acr-seq">${V.seq.map((c, i) => `<li><span>${esc(c.texto)}</span><button data-quitar="${i}" title="Quitar">✕</button></li>`).join('') || '<li style="opacity:.6;list-style:none">Todavía no elegiste ninguna acción.</li>'}</ol>
        <div class="acr-row"><button class="acr-btn bad" id="acr-fin" ${V.seq.length ? '' : 'disabled'}>Finalizar y corregir</button><button class="acr-btn sec" id="acr-reset">Reiniciar</button></div>
        <div class="acr-fase">Banco de acciones</div>
        <div class="acr-banco">${V.cartas.map((c) => `<button class="acr-opt" data-k="${c.k}" data-id="${c.id}" ${usados.has(c.k + c.id) ? 'disabled' : ''}>${esc(c.texto)}</button>`).join('')}</div>`;
      $('#acr-panel').onclick = (e) => {
        const o = e.target.closest('.acr-opt'); const q = e.target.closest('[data-quitar]');
        if (o && !o.disabled) { const c = V.cartas.find((x) => x.k === o.dataset.k && String(x.id) === o.dataset.id); V.seq.push(c); const y = $('#acr-panel').scrollTop; pintarEvaluar(); $('#acr-panel').scrollTop = y; }
        else if (q) { V.seq.splice(+q.dataset.quitar, 1); pintarEvaluar(); }
        else if (e.target.id === 'acr-reset') vistaEvaluar();
        else if (e.target.id === 'acr-fin') { if (confirm('¿Finalizar la evaluación y corregir?')) corregir(); }
      };
    }
    function corregir() {
      const V = S.ev; const secPasos = V.seq.filter((c) => c.k === 'p').map((c) => c.id);
      // subsecuencia creciente más larga: los pasos en orden relativo correcto
      const L = secPasos.map(() => 1), prev = secPasos.map(() => -1);
      for (let i = 0; i < secPasos.length; i++) for (let j = 0; j < i; j++) if (secPasos[j] < secPasos[i] && L[j] + 1 > L[i]) { L[i] = L[j] + 1; prev[i] = j; }
      let best = 0; L.forEach((v, i) => { if (v > L[best]) best = i; });
      const enOrden = new Set(); if (secPasos.length) for (let i = best; i >= 0; i = prev[i]) enOrden.add(secPasos[i]);
      const filas = V.apl.map((p) => ({ p, st: enOrden.has(p.n) ? 'SI' : secPasos.includes(p.n) ? 'M' : 'NO' }));
      const elegidasD = V.seq.filter((c) => c.k === 'd').map((c) => V.dist.find((d) => d.id === c.id));
      const pts = filas.reduce((a, f) => a + (f.st === 'SI' ? 1 : f.st === 'M' ? 0.5 : 0), 0) - elegidasD.length * 0.5;
      const pct = Math.max(0, Math.round((pts / V.apl.length) * 100));
      const criticosFallidos = filas.filter((f) => f.p.critico && f.st !== 'SI');
      const criticosElegidos = elegidasD.filter((d) => d.critico);
      const aprobado = !criticosFallidos.length && !criticosElegidos.length && pct >= D.umbral;
      const seg = Math.round((Date.now() - V.t0) / 1000);
      guardarRes(area, id, 'evaluar', { pct, aprobado, seg });
      V.fin = true; resaltar(null);
      $('#acr-panel').onclick = (e) => { if (e.target.id === 'acr-otra') vistaEvaluar(); if (e.target.id === 'acr-ent') cambiarModo('entrenar'); };
      $('#acr-panel').innerHTML = `
        <div class="acr-res ${aprobado ? 'ap' : 'de'}"><h2>${aprobado ? 'APROBADO' : 'DESAPROBADO'}</h2><div>Puntaje ${pct}% · umbral ${D.umbral}% · ${Math.floor(seg / 60)} min ${seg % 60} s</div></div>
        ${criticosFallidos.length || criticosElegidos.length ? `<div class="acr-info mal"><b>Criterios de desaprobación:</b><ul style="margin:6px 0 0 18px">
          ${criticosFallidos.map((f) => `<li>Paso ${f.p.n} (${f.st === 'NO' ? 'omitido' : 'fuera de orden'}): ${esc(f.p.texto)}<br><small>${esc(f.p.explica)}</small></li>`).join('')}
          ${criticosElegidos.map((d) => `<li>Acción incorrecta elegida: “${esc(d.texto)}”<br><small>${esc(d.porque)}</small></li>`).join('')}</ul></div>` : ''}
        ${elegidasD.filter((d) => !d.critico).length ? `<div class="acr-info mal"><b>Acciones incorrectas elegidas:</b><ul style="margin:6px 0 0 18px">${elegidasD.filter((d) => !d.critico).map((d) => `<li>“${esc(d.texto)}”<br><small>${esc(d.porque)}</small></li>`).join('')}</ul></div>` : ''}
        <div class="acr-row"><button class="acr-btn" id="acr-otra">Nuevo intento</button><button class="acr-btn sec" id="acr-ent">Practicar en Entrenar</button></div>
        <div class="acr-fase">Lista de cotejo (${V.apl.length} pasos)</div>
        <table class="acr-tabla">${filas.map((f) => `<tr><td>${f.p.n}</td><td>${esc(f.p.texto)} ${f.p.critico ? '<span class="acr-crit">⚠</span>' : ''}</td><td class="st-${f.st}">${f.st === 'SI' ? 'SÍ' : f.st === 'M' ? '+/-' : 'NO'}</td></tr>`).join('')}</table>
        <p style="margin-top:8px"><small>+/- = realizado pero fuera de orden (vale 0,5). Cada acción incorrecta resta 0,5.</small></p>`;
    }

    // ---- FUNDAMENTOS
    function vistaFundamentos() {
      montarEscena(true); sinEstado();
      const qs = mezclar(D.fundamentos).map((q) => { const o = q.o.map((t, i) => ({ t, ok: i === q.c })); return { ...q, opts: mezclar(o) }; });
      S.fun = { qs, i: 0, ok: 0, resp: null };
      pintarFundamentos();
    }
    function pintarFundamentos() {
      const F = S.fun;
      if (F.i >= F.qs.length) {
        const pct = Math.round((F.ok / F.qs.length) * 100); guardarRes(area, id, 'fundamentos', { pct, aprobado: pct >= D.umbral });
        $('#acr-panel').innerHTML = `<div class="acr-res ${pct >= D.umbral ? 'ap' : 'de'}"><h2>${F.ok} / ${F.qs.length}</h2><div>${pct}% de aciertos en indicaciones, contraindicaciones y pautas de alarma</div></div><div class="acr-row"><button class="acr-btn" id="acr-fr">Repetir</button></div>`;
        $('#acr-fr').onclick = vistaFundamentos; return;
      }
      const q = F.qs[F.i];
      $('#acr-panel').innerHTML = `
        <div class="acr-fase" style="margin-top:0">Pregunta ${F.i + 1} de ${F.qs.length}</div>
        <div class="acr-prog"><i style="width:${Math.round((F.i / F.qs.length) * 100)}%"></i></div>
        <div class="acr-goal">${esc(q.q)}</div>
        <div class="acr-banco">${q.opts.map((o, k) => `<button class="acr-opt" data-k="${k}" ${F.resp != null ? 'disabled' : ''} style="${F.resp != null && o.ok ? 'border-color:var(--acr-ok);opacity:1' : F.resp === k ? 'border-color:var(--acr-bad);opacity:1' : ''}">${esc(o.t)}</button>`).join('')}</div>
        ${F.resp != null ? `<div class="acr-info ${q.opts[F.resp].ok ? 'bien' : 'mal'}">${q.opts[F.resp].ok ? '✅ Correcto.' : '❌ Incorrecto.'} ${esc(q.e)}</div><div class="acr-row"><button class="acr-btn" id="acr-fsig">Continuar →</button></div>` : ''}`;
      $('#acr-panel').onclick = (e) => {
        const o = e.target.closest('.acr-opt');
        if (o && F.resp == null) { F.resp = +o.dataset.k; if (q.opts[F.resp].ok) F.ok++; pintarFundamentos(); }
        else if (e.target.id === 'acr-fsig') { F.i++; F.resp = null; pintarFundamentos(); }
      };
    }

    function cambiarModo(m) {
      S.modo = m; pintarTabs();
      if (m === 'explorar') vistaExplorar();
      else if (m === 'entrenar') vistaEntrenar();
      else if (m === 'evaluar') vistaEvaluar();
      else vistaFundamentos();
    }
    $('#acr-tabs').onclick = (e) => {
      const t = e.target.closest('[data-modo]'); const s = e.target.closest('[data-sx]');
      if (t) cambiarModo(t.dataset.modo);
      else if (s) { S.sexo = s.dataset.sx; cambiarModo(S.modo); }
    };
    cambiarModo('explorar');
  }

  (id ? vistaAtlas() : vistaLista()).catch((e) => {
    console.error('[Acreditaciones]', e);
    app.innerHTML = '<p class="acr-sub">No se pudo cargar esta acreditación. Probá de nuevo en unos minutos.</p>';
  });
})();
