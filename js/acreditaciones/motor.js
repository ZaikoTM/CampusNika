// CAMPUS NIKA — Atlas de acreditaciones: motor genérico.
// Cada acreditación = data/acreditaciones/<area>/<id>.json + js/acreditaciones/escena_<id>.js (módulo con build/mount/sync/hl/sel/dispose).
// Dos modos: PRÁCTICA (explorar, guiado, machete, fundamentos) y EXAMEN (a ciegas, con tiempo y corrección estricta).
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const mezclar = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) {}
  if (!usuario) { location.href = 'index.html'; return; }
  const clave = `nika_acr_${usuario.username || 'invitado'}`;
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
      <p class="acr-sub">Anatomía 3D interactiva de cada acreditación. Practicá paso a paso con feedback inmediato y rendí el examen a ciegas, con tiempo y corrección estricta según la lista de cotejo de la cátedra.</p>
      <div class="acr-lista">${idx.acreditaciones.map((a) => {
        const on = a.estado === 'activo';
        const r = res[`${area}/${a.id}`] && res[`${area}/${a.id}`].examen;
        const estado = !on ? '<span class="acr-pill">Próximamente</span>' : r ? `<span class="acr-pill ${r.aprobado ? 'ok' : 'bad'}">${r.aprobado ? 'Acreditada' : 'No acreditada'} · mejor ${r.mejor}%</span>` : '<span class="acr-pill">Disponible</span>';
        return `<${on ? `a href="acreditaciones.html?area=${area}&id=${a.id}"` : 'div'} class="acr-card ${on ? 'on' : 'off'}"><div class="ico">${a.icono}</div><h3>${esc(a.titulo)}</h3><small>${a.pasos} pasos en la lista de cotejo</small>${estado}</${on ? 'a' : 'div'}>`;
      }).join('')}</div>`;
  }

  // ------------------------------------------------------------------ atlas
  async function vistaAtlas() {
    volver.href = `acreditaciones.html?area=${area}`;
    const D = await getJSON(`${base}/${id}.json`);
    const ESC = (await import(`./escena_${id}.js?v=7`)).default;
    document.title = `${D.titulo} · Atlas de acreditaciones`;

    const S = { modo: 'practica', sub: 'explorar', sexo: 'F', paso: 0, ent: null, ex: null, fun: null, timer: null };
    const aplica = (p, sexo) => !p.solo || p.solo === (sexo || S.sexo);
    const pasosAplicables = (sexo) => D.pasos.filter((p) => aplica(p, sexo));
    const porN = (n) => D.pasos.find((p) => p.n === n);

    app.innerHTML = `
      <div class="acr-head">
        <div><h1 class="acr-h1">${D.icono} ${esc(D.titulo)}</h1><p class="acr-sub" style="margin-bottom:0">${esc(D.resumen)}</p></div>
        <div class="acr-crit-box"><b>⚠ Criterios de desaprobación.</b> ${esc(D.criterios_texto)}</div>
      </div>
      <div class="acr-tabs" id="acr-tabs"></div>
      <div class="acr-tabs acr-sub-tabs" id="acr-subtabs"></div>
      <div class="acr-grid">
        <div><div class="acr-escena" id="acr-escena"></div><div class="acr-chips" id="acr-chips"></div></div>
        <aside class="acr-panel" id="acr-panel"></aside>
      </div>`;

    const SUBS = [['explorar', '🔎 Explorar'], ['guiado', '🎯 Guiado'], ['machete', '📌 Machete'], ['fundamentos', '📚 Fundamentos']];
    function pintarTabs() {
      const enExamen = S.modo === 'examen';
      $('#acr-tabs').innerHTML = `<button class="acr-tab ${!enExamen ? 'on' : ''}" data-modo="practica">🎓 Práctica</button><button class="acr-tab ${enExamen ? 'on' : ''}" data-modo="examen">📝 Examen</button>` +
        `<span class="acr-sexo" ${enExamen || S.sub === 'fundamentos' ? 'hidden' : ''}><button data-sx="F" class="${S.sexo === 'F' ? 'on' : ''}">♀ Mujer</button><button data-sx="M" class="${S.sexo === 'M' ? 'on' : ''}">♂ Varón</button></span>`;
      $('#acr-subtabs').hidden = enExamen;
      $('#acr-subtabs').innerHTML = SUBS.map(([k, l]) => `<button class="acr-tab sm ${S.sub === k ? 'on' : ''}" data-sub="${k}">${l}</button>`).join('');
    }

    // ---- escena
    let svg = null;
    function montarEscena(estatica) {
      if (ESC.dispose) ESC.dispose();
      $('#acr-escena').innerHTML = ESC.build(S.sexo);
      svg = $('#acr-escena').firstElementChild;
      if (estatica) svg.classList.add('estatica');
      if (ESC.mount) ESC.mount(svg, S.sexo);
      svg.onclick = null;
    }
    function estadoHasta(n) {
      const est = {}; const usados = new Set();
      D.pasos.forEach((p) => { if (p.n <= n && aplica(p)) { Object.assign(est, p.estado); if (ESC.usable.includes(p.target)) usados.add(p.target); } });
      return { est, usados };
    }
    function aplicarEstado(est, usados, sinChips) {
      [...svg.classList].filter((c) => /^(s-|g-)/.test(c)).forEach((c) => svg.classList.remove(c));
      Object.entries(est || {}).forEach(([k, v]) => { if (v === 'none') return; svg.classList.add(typeof v === 'string' ? `g-${v}` : `s-${k}`); });
      svg.querySelectorAll('.hs.used').forEach((e) => e.classList.remove('used'));
      (usados || []).forEach((t) => { const e = svg.querySelector(`[data-hs="${t}"]`); if (e) e.classList.add('used'); });
      if (ESC.sync) ESC.sync(svg);
      const e = est || {};
      $('#acr-chips').innerHTML = sinChips ? '' : ESC.CHIPS.map(([k, l]) => `<span class="acr-chip ${e[k] ? 'on' : ''}">${e[k] ? '✔ ' : ''}${esc(l)}</span>`).join('');
    }
    function resaltar(t) {
      svg.querySelectorAll('.hl').forEach((e) => e.classList.remove('hl'));
      if (t) svg.querySelectorAll(`[data-hs="${t}"]`).forEach((e) => e.classList.add('hl'));
      if (ESC.hl) ESC.hl(t);
    }
    function marcarSel(t) {
      svg.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel'));
      if (t) svg.querySelectorAll(`[data-hs="${t}"]`).forEach((e) => e.classList.add('sel'));
      if (ESC.sel) ESC.sel(t);
    }
    const parar = () => { if (S.timer) { clearInterval(S.timer); S.timer = null; } };

    // ---- PRÁCTICA · EXPLORAR
    function vistaExplorar() {
      montarEscena(false);
      const fases = []; pasosAplicables().forEach((p) => { let f = fases.find((x) => x.nombre === p.fase); if (!f) { f = { nombre: p.fase, pasos: [] }; fases.push(f); } f.pasos.push(p); });
      $('#acr-panel').innerHTML = `
        <h3>Exploración libre</h3>
        <p>Tocá un paso para ver cómo queda la escena y por qué se hace así. También podés tocar cualquier estructura o elemento.</p>
        <div id="acr-detalle"></div>
        ${fases.map((f) => `<div class="acr-fase">${esc(f.nombre)}</div>${f.pasos.map((p) => `<button class="acr-paso" data-paso="${p.n}"><span class="n">${p.n}</span><span>${esc(p.texto)} ${p.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</span></button>`).join('')}`).join('')}`;
      const ver = (n) => {
        const p = porN(n); S.paso = n;
        document.querySelectorAll('.acr-paso').forEach((b) => b.classList.toggle('sel', +b.dataset.paso === n));
        const { est, usados } = estadoHasta(n); aplicarEstado(est, usados); resaltar(p.target); marcarSel(null);
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>Paso ${p.n}${p.critico ? ' · ⚠ criterio de desaprobación' : ''}</b><br>${esc(p.explica)}</div>`;
        const b = document.querySelector(`.acr-paso[data-paso="${n}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
      };
      aplicarEstado({}, []);
      $('#acr-panel').onclick = (e) => { const b = e.target.closest('.acr-paso'); if (b) ver(+b.dataset.paso); const ir2 = e.target.closest('[data-ir]'); if (ir2) ver(+ir2.dataset.ir); };
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g) return;
        const el = D.elementos[g.dataset.hs]; if (!el) return;
        marcarSel(g.dataset.hs); resaltar(null);
        const pasos = el.pasos.filter((n) => aplica(porN(n)));
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>${esc(el.nombre)}</b><br>${esc(el.desc)}<br><small>${pasos.length ? `Pasos donde interviene: ${pasos.map((n) => `<a href="#" data-ir="${n}" onclick="return false">${n}</a>`).join(', ')}` : 'Estructura anatómica de referencia.'}</small></div>`;
      };
    }

    // ---- PRÁCTICA · GUIADO
    function vistaGuiado() {
      montarEscena(false);
      const lista = pasosAplicables();
      S.ent = { i: 0, errores: 0, pistas: 0, esperando: true, lista, fin: false };
      aplicarEstado({}, []);
      pintarGuiado();
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g || !S.ent.esperando || S.ent.fin) return;
        const E = S.ent; const p = E.lista[E.i]; const t = g.dataset.hs;
        if (t === p.target) {
          E.esperando = false; resaltar(null);
          const { est, usados } = estadoHasta(p.n); aplicarEstado(est, usados);
          pintarGuiado({ ok: p });
        } else {
          E.errores++;
          g.classList.add('mal'); setTimeout(() => g.classList.remove('mal'), 500);
          const mas = E.lista.slice(E.i + 1).find((q) => q.target === t);
          const antes = E.lista.slice(0, E.i).find((q) => q.target === t);
          pintarGuiado({ mal: mas ? 'Orden incorrecto: ese elemento se usa más adelante, pero todavía no es el momento.' : antes ? 'Ya usaste ese elemento en un paso anterior. Revisá la consigna.' : 'Ese elemento no corresponde a este paso. Revisá la consigna.' });
        }
      };
    }
    function pintarGuiado(fb) {
      const E = S.ent; const tot = E.lista.length;
      if (E.i >= tot) {
        E.fin = true; resaltar(null);
        $('#acr-panel').innerHTML = `<h3>¡Recorrido completo!</h3><div class="acr-info bien">Terminaste los ${tot} pasos con <b>${E.errores}</b> error${E.errores === 1 ? '' : 'es'} y <b>${E.pistas}</b> pista${E.pistas === 1 ? '' : 's'}.</div><p>Cuando te sientas seguro, rendí el <b>Examen</b>: a ciegas, con tiempo y corrección estricta.</p><div class="acr-row"><button class="acr-btn" id="acr-rep">Repetir</button><button class="acr-btn sec" id="acr-ir-ex">Ir al Examen</button></div>`;
        $('#acr-rep').onclick = vistaGuiado; $('#acr-ir-ex').onclick = () => { S.modo = 'examen'; ir(); };
        return;
      }
      const p = E.lista[E.i];
      const perla = (D.machete && D.machete.por_paso && D.machete.por_paso[p.n]) || '';
      $('#acr-panel').innerHTML = `
        <div class="acr-fase" style="margin-top:0">${esc(p.fase)} · paso ${E.i + 1} de ${tot}</div>
        <div class="acr-prog"><i style="width:${Math.round((E.i / tot) * 100)}%"></i></div>
        <div class="acr-goal">${esc(p.texto)} ${p.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</div>
        <p>Tocá el elemento o la estructura con el que se realiza este paso.</p>
        ${fb && fb.mal ? `<div class="acr-info mal">❌ ${esc(fb.mal)}</div>` : ''}
        ${fb && fb.ok ? `<div class="acr-info bien">✅ <b>Correcto.</b> ${esc(fb.ok.explica)}</div>` : ''}
        ${perla ? `<div class="acr-perla">📌 ${esc(perla)}</div>` : ''}
        <div class="acr-row">${fb && fb.ok ? '<button class="acr-btn" id="acr-sig">Continuar →</button>' : '<button class="acr-btn sec" id="acr-pista">💡 Pista</button>'}</div>
        <small>Errores: ${E.errores} · Pistas: ${E.pistas}</small>`;
      const pb = $('#acr-pista'); if (pb) pb.onclick = () => { E.pistas++; resaltar(p.target); pb.disabled = true; };
      const sg = $('#acr-sig'); if (sg) sg.onclick = () => { E.i++; E.esperando = true; resaltar(null); pintarGuiado(); };
    }

    // ---- PRÁCTICA · MACHETE
    function vistaMachete() {
      montarEscena(false); aplicarEstado({}, []);
      const m = D.machete || { perlas: [], referencias: [] };
      $('#acr-panel').innerHTML = `
        <h3>📌 Machete clínico</h3>
        <p>Perlas, referencias anatómicas y tips de la técnica aséptica. Tocá una estructura del dibujo para ver su descripción.</p>
        <div id="acr-detalle"></div>
        ${m.perlas.map((x) => `<div class="acr-perla"><b>${esc(x.t)}</b><br>${esc(x.x)}</div>`).join('')}
        <div class="acr-fase">Referencias</div>
        <ul class="acr-refs">${m.referencias.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`;
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g) return;
        const el = D.elementos[g.dataset.hs]; if (!el) return;
        marcarSel(g.dataset.hs);
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>${esc(el.nombre)}</b><br>${esc(el.desc)}</div>`;
      };
    }

    // ---- PRÁCTICA · FUNDAMENTOS
    function vistaFundamentos() {
      montarEscena(true); aplicarEstado({}, []);
      const qs = mezclar(D.fundamentos).map((q) => ({ ...q, opts: mezclar(q.o.map((t, i) => ({ t, ok: i === q.c }))) }));
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

    // ---- EXAMEN (a ciegas)
    function examenInicio() {
      parar();
      const caso = azar(D.casos); S.sexo = caso.sexo; pintarTabs();
      montarEscena(true); aplicarEstado({}, [], true);
      const tiempos = (D.examen && D.examen.tiempos) || [2, 5, 10];
      S.ex = { caso, t: tiempos[1] || tiempos[0], fase: 'inicio' };
      const pintarInicio = () => {
        $('#acr-panel').innerHTML = `
          <h3>Examen de acreditación</h3>
          <div class="acr-info"><b>Caso:</b> ${caso.sexo === 'F' ? 'Mujer' : 'Varón'} de ${caso.edad} años. ${esc(caso.motivo)}</div>
          <p>Vas a realizar el procedimiento <b>a ciegas</b>: no hay lista de pasos ni ayudas. Tocá un elemento o una estructura del dibujo y elegí qué acción realizás con él, en el orden que corresponda.</p>
          <ul class="acr-refs"><li>Las infracciones graves te avisan al instante.</li><li>Las demás fallas se registran en silencio y se informan al final.</li><li>Cada acción incorrecta penaliza el puntaje.</li></ul>
          <div class="acr-fase">Tiempo límite</div>
          <div class="acr-row">${tiempos.map((t) => `<button class="acr-tab sm ${S.ex.t === t ? 'on' : ''}" data-t="${t}">${t} min</button>`).join('')}</div>
          <div class="acr-row"><button class="acr-btn" id="acr-comenzar">Comenzar examen</button></div>`;
      };
      $('#acr-panel').onclick = (e) => {
        const b = e.target.closest('[data-t]'); if (b) { S.ex.t = +b.dataset.t; pintarInicio(); }
        if (e.target.id === 'acr-comenzar') examenComenzar();
      };
      pintarInicio();
    }
    function examenComenzar() {
      const apl = pasosAplicables(S.ex.caso.sexo);
      const dist = D.distractores.filter((d) => !d.solo || d.solo === S.ex.caso.sexo);
      Object.assign(S.ex, { fase: 'curso', apl, dist, hechos: new Map(), log: [], graves: 0, seg: S.ex.t * 60, inicio: Date.now(), sel: null, aviso: '' });
      montarEscena(false); aplicarEstado({}, [], true);
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g || S.ex.fase !== 'curso') return;
        S.ex.sel = g.dataset.hs; marcarSel(g.dataset.hs); pintarExamen();
      };
      $('#acr-panel').onclick = (e) => {
        const a = e.target.closest('[data-act]'); if (a) { examenAccion(a.dataset.act); return; }
        if (e.target.id === 'acr-cancel') { S.ex.sel = null; marcarSel(null); pintarExamen(); }
        if (e.target.id === 'acr-fin') { if (confirm('¿Finalizar el examen y corregir?')) examenFin(false); }
      };
      S.timer = setInterval(() => {
        const X = S.ex; if (X.fase !== 'curso') return;
        X.seg = X.t * 60 - Math.floor((Date.now() - X.inicio) / 1000);
        const el = $('#acr-reloj'); if (el) { el.textContent = '⏱ ' + mmss(Math.max(0, X.seg)); el.classList.toggle('urge', X.seg <= 30); }
        if (X.seg <= 0) examenFin(true);
      }, 500);
      pintarExamen();
    }
    function pintarExamen() {
      const X = S.ex; const el = X.sel ? D.elementos[X.sel] : null;
      let cuerpo = '<p>Tocá un elemento o una estructura del dibujo para elegir una acción.</p>';
      if (X.sel) {
        const acts = mezclar([...X.apl.filter((p) => p.target === X.sel).map((p) => ({ k: 'p', id: p.n, texto: p.texto })), ...X.dist.filter((d) => d.target === X.sel).map((d) => ({ k: 'd', id: d.id, texto: d.texto }))]);
        cuerpo = `<div class="acr-fase" style="margin-top:0">${esc(el ? el.nombre : X.sel)}</div>` + (acts.length
          ? `<p>¿Qué acción realizás?</p><div class="acr-banco">${acts.map((a) => `<button class="acr-opt" data-act="${a.k}:${a.id}">${esc(a.texto)}</button>`).join('')}</div>`
          : '<p>Con este elemento no se realiza ninguna acción del procedimiento.</p>') +
          '<div class="acr-row"><button class="acr-btn sec" id="acr-cancel">Cancelar</button></div>';
      }
      $('#acr-panel').innerHTML = `
        <div class="acr-examen-bar"><span id="acr-reloj" class="acr-reloj">⏱ ${mmss(Math.max(0, X.seg))}</span><span class="acr-pill ${X.graves ? 'bad' : ''}">Infracciones graves: ${X.graves}</span></div>
        <div class="acr-caso"><b>Caso:</b> ${X.caso.sexo === 'F' ? 'Mujer' : 'Varón'} de ${X.caso.edad} años. ${esc(X.caso.motivo)}</div>
        ${X.aviso ? `<div class="acr-info mal acr-alerta">${X.aviso}</div>` : ''}
        ${cuerpo}
        <div class="acr-row" style="margin-top:14px"><button class="acr-btn bad" id="acr-fin">Finalizar examen</button></div>`;
    }
    function examenAccion(cl) {
      const X = S.ex; const [k, ref] = cl.split(':'); X.aviso = '';
      if (k === 'p') {
        const n = +ref; const p = porN(n);
        if (X.hechos.has(n)) { X.log.push({ tipo: 'repetida', n, texto: p.texto, grave: false, porque: 'Acción ya realizada.' }); }
        else {
          const previos = X.apl.filter((q) => q.n < n && !X.hechos.has(q.n));
          const enOrden = previos.length === 0;
          X.hechos.set(n, enOrden ? 'SI' : 'M');
          if (!enOrden) {
            const critPrev = previos.some((q) => q.critico);
            X.log.push({ tipo: 'orden', n, texto: p.texto, grave: critPrev, porque: `Se hizo antes de completar pasos previos (${previos.slice(0, 3).map((q) => q.n).join(', ')}${previos.length > 3 ? '…' : ''}).` });
            if (critPrev) { X.graves++; X.aviso = '⚠ Infracción grave: alteraste el orden de la técnica y salteaste un paso crítico.'; }
          }
          const e2 = {}; const u2 = new Set();
          X.hechos.forEach((_, m) => { const q = porN(m); Object.assign(e2, q.estado); if (ESC.usable.includes(q.target)) u2.add(q.target); });
          aplicarEstado(e2, u2, true);
        }
      } else {
        const d = X.dist.find((x) => x.id === ref);
        X.log.push({ tipo: 'incorrecta', texto: d.texto, grave: !!d.critico, porque: d.porque });
        if (d.critico) { X.graves++; X.aviso = `⚠ Infracción grave: “${esc(d.texto)}”.`; }
      }
      X.sel = null; marcarSel(null); pintarExamen();
    }
    function examenFin(porTiempo) {
      const X = S.ex; if (X.fase !== 'curso') return; X.fase = 'fin'; parar();
      const usado = Math.min(X.t * 60, Math.round((Date.now() - X.inicio) / 1000));
      const filas = X.apl.map((p) => ({ p, st: X.hechos.get(p.n) || 'NO' }));
      const pen = D.examen || { penalizacion_incorrecta: 3, penalizacion_repetida: 1 };
      const baseP = filas.reduce((a, f) => a + (f.st === 'SI' ? 1 : f.st === 'M' ? 0.5 : 0), 0) / X.apl.length * 100;
      const resta = X.log.reduce((a, l) => a + (l.tipo === 'incorrecta' ? pen.penalizacion_incorrecta : l.tipo === 'repetida' ? pen.penalizacion_repetida : 0), 0);
      const pct = Math.max(0, Math.round(baseP - resta));
      const criticosFallidos = filas.filter((f) => f.p.critico && f.st !== 'SI');
      const gravesLog = X.log.filter((l) => l.grave);
      const aprobado = !criticosFallidos.length && !gravesLog.length && pct >= D.umbral;
      guardarRes(area, id, 'examen', { pct, aprobado, seg: usado });
      resaltar(null); marcarSel(null);
      $('#acr-panel').onclick = (e) => { if (e.target.id === 'acr-otra') examenInicio(); if (e.target.id === 'acr-prac') { S.modo = 'practica'; S.sub = 'guiado'; ir(); } };
      $('#acr-panel').innerHTML = `
        <div class="acr-res ${aprobado ? 'ap' : 'de'}"><h2>${aprobado ? 'ACREDITADO' : 'NO ACREDITADO'}</h2>
          <div><b>${pct}%</b> de acierto · umbral ${D.umbral}%</div>
          <div>Tiempo: ${mmss(usado)} de ${mmss(X.t * 60)}${porTiempo ? ' (tiempo agotado)' : ''}</div></div>
        ${criticosFallidos.length || gravesLog.length ? `<div class="acr-info mal"><b>Criterios de desaprobación:</b><ul style="margin:6px 0 0 18px">
          ${criticosFallidos.map((f) => `<li>Paso ${f.p.n} (${f.st === 'NO' ? 'omitido' : 'fuera de orden'}): ${esc(f.p.texto)}<br><small>${esc(f.p.explica)}</small></li>`).join('')}
          ${gravesLog.filter((l) => l.tipo === 'incorrecta').map((l) => `<li>Acción incorrecta grave: “${esc(l.texto)}”<br><small>${esc(l.porque)}</small></li>`).join('')}</ul></div>` : ''}
        <div class="acr-fase">Detalle de errores (${X.log.length})</div>
        ${X.log.length ? `<ul class="acr-refs">${X.log.map((l) => `<li><b>${l.tipo === 'incorrecta' ? 'Acción incorrecta' : l.tipo === 'orden' ? 'Orden alterado' : 'Acción repetida'}${l.grave ? ' · grave' : ''}:</b> ${esc(l.texto)}<br><small>${esc(l.porque)}</small></li>`).join('')}</ul>` : '<p>No registraste errores de acción ni de orden.</p>'}
        <div class="acr-row"><button class="acr-btn" id="acr-otra">Nuevo intento</button><button class="acr-btn sec" id="acr-prac">Practicar</button></div>
        <div class="acr-fase">Lista de cotejo (${X.apl.length} pasos)</div>
        <table class="acr-tabla">${filas.map((f) => `<tr><td>${f.p.n}</td><td>${esc(f.p.texto)} ${f.p.critico ? '<span class="acr-crit">⚠</span>' : ''}</td><td class="st-${f.st}">${f.st === 'SI' ? 'SÍ' : f.st === 'M' ? '+/-' : 'NO'}</td></tr>`).join('')}</table>
        <p style="margin-top:8px"><small>+/- = realizado pero fuera de orden (vale 0,5). Cada acción incorrecta resta ${pen.penalizacion_incorrecta} puntos y cada repetida ${pen.penalizacion_repetida}.</small></p>`;
    }

    // ---- navegación
    function ir() {
      parar();
      pintarTabs();
      if (S.modo === 'examen') return examenInicio();
      if (S.sub === 'explorar') vistaExplorar();
      else if (S.sub === 'guiado') vistaGuiado();
      else if (S.sub === 'machete') vistaMachete();
      else vistaFundamentos();
    }
    $('#acr-tabs').onclick = (e) => {
      const t = e.target.closest('[data-modo]'); const s = e.target.closest('[data-sx]');
      if (t) { S.modo = t.dataset.modo; ir(); }
      else if (s) { S.sexo = s.dataset.sx; ir(); }
    };
    $('#acr-subtabs').onclick = (e) => { const b = e.target.closest('[data-sub]'); if (b) { S.sub = b.dataset.sub; ir(); } };
    ir();
  }

  (id ? vistaAtlas() : vistaLista()).catch((e) => {
    console.error('[Acreditaciones]', e);
    app.innerHTML = '<p class="acr-sub">No se pudo cargar esta acreditación. Probá de nuevo en unos minutos.</p>';
  });
})();
