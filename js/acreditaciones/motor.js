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
    // Carga diferida: three.js, los loaders y los .glb se descargan recién cuando el usuario toca «Comenzar».
    let ESC = null; let VCFG = null;
    async function asegurarVisor() {
      if (ESC) return;
      const [mod, cfg] = await Promise.all([import('./visor3d.js?v=10'), getJSON(D.visor)]);
      VCFG = cfg; ESC = mod.crearVisor(cfg);
    }
    const usables = () => (VCFG ? VCFG.usables : []);
    let MESA = null;
    async function asegurarMesa() {
      if (MESA) return;
      const [mod, cfg] = await Promise.all([import('./mesa.js?v=8'), getJSON(D.instrumental)]);
      MESA = mod.crearMesa(cfg);
    }
    const sinEscena = () => { if (ESC) ESC.dispose(); document.querySelector('.acr-grid').classList.add('sin-escena'); $('#acr-chips').innerHTML = ''; $('#acr-escena').innerHTML = ''; svg = $('#acr-escena'); };
    async function mostrarMesaPractica() {
      parar(); sinEscena(); $('#acr-panel').innerHTML = '';
      if (!D.instrumental) { S.mesaOk = true; await asegurarVisor(); return ir(); }
      try { await asegurarMesa(); } catch (e) { console.error(e); $('#acr-escena').innerHTML = '<p class="acr-sub" style="padding:20px">No se pudo cargar la mesa de instrumental.</p>'; return; }
      if (!S.caso) { S.caso = azar(D.casos); }
      S.sexo = S.caso.sexo; pintarTabs();
      MESA.mount($('#acr-escena'), { caso: S.caso, casos: D.casos, modo: 'practica',
        onCaso: (c) => { S.caso = c; S.sexo = c.sexo; pintarTabs(); },
        onValidar: async (res) => {
          MESA.dispose(); S.mesaOk = true; S.avisoMesa = res.corregido ? res.avisos : null;
          $('#acr-escena').innerHTML = '<p class="acr-sub" style="padding:20px">Preparando al paciente…</p>'; await asegurarVisor(); ir();
        } });
    }
    document.title = `${D.titulo} · Atlas de acreditaciones`;
    if (!document.getElementById('acr-ayuda-fab')) {
      document.body.insertAdjacentHTML('beforeend', '<button type="button" id="acr-ayuda-fab" class="acr-ayuda-fab" title="Cómo usar el simulador" aria-label="Cómo usar el simulador">?</button>');
      document.getElementById('acr-ayuda-fab').onclick = () => tutorial3D();
    }
    const BUILD = '2026-10-03 · r8'; if (!document.querySelector('.acr-build')) document.body.insertAdjacentHTML('beforeend', `<div class="acr-build">Atlas · versión ${BUILD}</div>`);

    const S = { modo: 'practica', sub: 'explorar', sexo: 'F', paso: 0, ent: null, ex: null, fun: null, timer: null, caso: null, avisoMesa: null };
    const aplica = (p, sexo) => !p.solo || p.solo === (sexo || S.sexo);
    const pasosAplicables = (sexo) => D.pasos.filter((p) => aplica(p, sexo));
    const porN = (n) => D.pasos.find((p) => p.n === n);

    // ---- reconocimiento de lo que el alumno escribe en la bitácora (palabras clave por paso y por acción incorrecta)
    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    function reconocer(texto, sexo) {
      const tx = norm(texto).replace(/\b(no|sin) (fuerzo|forzo|forzar|forzando|fuerza)\b/g, ' '); if (tx.length < 3) return null;
      const puntaje = (claves) => (claves || []).reduce((mx, g) => (g.every((f) => tx.includes(f)) ? Math.max(mx, g.join('').length) : mx), 0);
      let mejor = null;
      D.distractores.filter((d) => !d.solo || d.solo === sexo).forEach((d) => { const s = puntaje(d.claves); if (s && (!mejor || s > mejor.s)) mejor = { tipo: 'd', id: d.id, s }; });
      if (mejor) return mejor;
      D.pasos.filter((q) => aplica(q, sexo)).forEach((q) => { const s = puntaje(q.claves); if (s && (!mejor || s > mejor.s)) mejor = { tipo: 'p', n: q.n, s }; });
      return mejor;
    }
    const chatHTML = (msgs, ph, titulo) => `<div class="acr-chat"><div class="acr-fase" style="margin-top:12px">${titulo}</div>
      <div class="acr-chat-log" id="acr-chat-log">${msgs.length ? msgs.map((m) => `<div class="m ${m.de} ${m.cls || ''}">${esc(m.txt)}</div>`).join('') : '<div class="m vacio">Escribí lo que vas haciendo y cómo lo hacés. Ej.: «me lavo las manos con técnica clínica».</div>'}</div>
      <form id="acr-chat-f" autocomplete="off"><input id="acr-chat-i" type="text" placeholder="${ph}" maxlength="220"><button class="acr-btn" type="submit">Enviar</button></form></div>`;
    function enlazarChat(alEnviar) {
      const f = $('#acr-chat-f'); const log = $('#acr-chat-log'); if (log) log.scrollTop = log.scrollHeight;
      if (f) f.onsubmit = (e) => { e.preventDefault(); const i = $('#acr-chat-i'); const v = i.value.trim(); if (!v) return; i.value = ''; alEnviar(v); };
    }

    // ---- tutorial del modelo 3D
    const TUT = [
      { ico: '🍽️', t: 'La mesa de instrumental', x: 'Leé el caso clínico y armá la bandeja: pasá el cursor sobre un insumo para inspeccionarlo y hacé clic (o arrastralo) para agregarlo; tocá uno de la bandeja para devolverlo a la mesa. Al terminar, «Pasar al procedimiento con el paciente».' },
      { ico: '🖱️', t: 'Girá y acercá', x: 'Arrastrá con el mouse o el dedo para girar el modelo. Con la rueda (o pellizcando) acercás y alejás. Con el botón derecho (o dos dedos) desplazás la vista.' },
      { ico: '🧍', t: 'Piel, huesos y órganos', x: 'El paciente se ve con su piel. Con los botones «Piel», «Huesos» y «Órganos» prendés y apagás cada capa: podés retirar la piel por completo para ver la anatomía interna. «Rayos X» vuelve transparente el cuerpo.' },
      { ico: '📍', t: 'Focos y cortes', x: 'Cada punto con etiqueta es una estructura: tocala para saber qué es. «Focos» oculta o muestra las etiquetas y «Corte» abre un corte sagital de la pelvis.' },
      { ico: '🎥', t: 'Vistas y recorrido', x: 'Lateral, Frontal y Superior llevan la cámara a esa vista. En Explorar, «▶ Ver el procedimiento» reproduce la técnica paso a paso sobre el modelo.' },
      { ico: '🎓', t: 'Cómo se usa cada modo', x: 'Explorar: aprendés mirando. Guiado: respondés tocando el elemento o escribiendo en la bitácora lo que hacés. Examen: sin ayudas, registrás tus acciones y se evalúa de forma estricta.' },
    ];
    function tutorial3D() {
      if (document.querySelector('.acr-tut')) return;
      let k = 0; const ov = document.createElement('div'); ov.className = 'acr-tut';
      const pintar = () => {
        const s = TUT[k];
        ov.innerHTML = `<div class="acr-tut-card"><div class="acr-tut-ico">${s.ico}</div><h3>${s.t}</h3><p>${s.x}</p>
          <div class="acr-tut-dots">${TUT.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</div>
          <label class="acr-tut-no"><input type="checkbox" id="tut-no"> No volver a mostrar</label>
          <div class="acr-row" style="justify-content:space-between"><button class="acr-btn sec" id="tut-ant" ${k === 0 ? 'disabled' : ''}>← Anterior</button><button class="acr-btn" id="tut-sig">${k === TUT.length - 1 ? 'Empezar' : 'Siguiente →'}</button></div>
          <button class="acr-tut-x" id="tut-x" aria-label="Cerrar">✕</button></div>`;
      };
      const cerrar = () => { try { if (ov.querySelector('#tut-no')?.checked) localStorage.setItem('nika_acr_tut_v1', '1'); } catch (_) {} ov.remove(); };
      ov.onclick = (e) => {
        if (e.target.id === 'tut-sig') { if (k === TUT.length - 1) cerrar(); else { k++; pintar(); } }
        else if (e.target.id === 'tut-ant') { k = Math.max(0, k - 1); pintar(); }
        else if (e.target.id === 'tut-x' || e.target === ov) cerrar();
      };
      pintar(); document.body.appendChild(ov);
    }
    // ---- microinteracciones
    function toast(msg, tipo) {
      const n = document.createElement('div'); n.className = 'acr-toast ' + (tipo || 'ok'); n.textContent = msg; document.body.appendChild(n);
      setTimeout(() => n.classList.add('sale'), 1900); setTimeout(() => n.remove(), 2400);
    }
    const animarPanel = () => { const pn = $('#acr-panel'); pn.classList.remove('pn-in'); void pn.offsetWidth; pn.classList.add('pn-in'); };
    const tutorialVisto = () => { try { return localStorage.getItem('nika_acr_tut_v1') === '1'; } catch (_) { return false; } };
    const tutorialAuto = () => { if (tutorialVisto() || S.tutAuto) return; S.tutAuto = true; tutorial3D(); };

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
      if (ESC && !enExamen) $('#acr-tabs').insertAdjacentHTML('beforeend', '<button class="acr-tab sm" data-tut="1" style="margin-left:6px">❓ Cómo usar el 3D</button>');
      $('#acr-subtabs').hidden = enExamen;
      $('#acr-subtabs').innerHTML = SUBS.map(([k, l]) => `<button class="acr-tab sm ${S.sub === k ? 'on' : ''}" data-sub="${k}">${l}</button>`).join('');
    }

    // ---- escena
    let svg = null;
    function montarEscena(estatica) {
      document.querySelector('.acr-grid').classList.remove('sin-escena');
      if (ESC.dispose) ESC.dispose();
      $('#acr-escena').innerHTML = ESC.build(S.sexo);
      svg = $('#acr-escena').firstElementChild;
      if (estatica) svg.classList.add('estatica');
      if (ESC.mount) ESC.mount(svg, S.sexo);
      svg.onclick = null;
      svg.addEventListener('acr-ayuda', () => tutorial3D());
    }
    function estadoHasta(n) {
      const est = {}; const usados = new Set();
      D.pasos.forEach((p) => { if (p.n <= n && aplica(p)) { Object.assign(est, p.estado); if (usables().includes(p.target)) usados.add(p.target); } });
      return { est, usados };
    }
    function aplicarEstado(est, usados, sinChips) {
      [...svg.classList].filter((c) => /^(s-|g-)/.test(c)).forEach((c) => svg.classList.remove(c));
      Object.entries(est || {}).forEach(([k, v]) => { if (v === 'none') return; svg.classList.add(typeof v === 'string' ? `g-${v}` : `s-${k}`); });
      svg.querySelectorAll('.hs.used').forEach((e) => e.classList.remove('used'));
      (usados || []).forEach((t) => { const e = svg.querySelector(`[data-hs="${t}"]`); if (e) e.classList.add('used'); });
      if (ESC.sync) ESC.sync(svg);
      const e = est || {};
      $('#acr-chips').innerHTML = sinChips ? '' : (VCFG ? VCFG.chips : []).map(([k, l]) => `<span class="acr-chip ${e[k] ? 'on' : ''}">${e[k] ? '✔ ' : ''}${esc(l)}</span>`).join('');
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
        <p>Tocá un paso para ver cómo queda la escena y por qué se hace así, o mirá el procedimiento completo. También podés tocar cualquier estructura o elemento.</p>
        <div class="acr-row"><button class="acr-btn" id="acr-play">▶ Ver el procedimiento</button></div>
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
      const nums = pasosAplicables().map((q) => q.n); let pos = -1;
      const detener = () => { parar(); const b = $('#acr-play'); if (b) b.textContent = '▶ Ver el procedimiento'; };
      const reproducir = () => {
        if (S.timer) { detener(); return; }
        const b = $('#acr-play'); b.textContent = '⏸ Pausar'; if (pos >= nums.length - 1) pos = -1;
        const avanzar = () => { pos++; if (pos >= nums.length) { detener(); return; } ver(nums[pos]); };
        avanzar(); S.timer = setInterval(avanzar, 3600);
      };
      $('#acr-panel').onclick = (e) => { if (e.target.id === 'acr-play') { reproducir(); return; } if (e.target.closest('.acr-paso')) detener(); const b = e.target.closest('.acr-paso'); if (b) ver(+b.dataset.paso); const ir2 = e.target.closest('[data-ir]'); if (ir2) ver(+ir2.dataset.ir); };
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g) return;
        const el = D.elementos[g.dataset.hs]; if (!el) return;
        marcarSel(g.dataset.hs); resaltar(null);
        const pasos = el.pasos.filter((n) => aplica(porN(n)));
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>${esc(el.nombre)}</b><br>${esc(el.desc)}<br><small>${pasos.length ? `Pasos donde interviene: ${pasos.map((n) => `<a href="#" data-ir="${n}" onclick="return false">${n}</a>`).join(', ')}` : 'Estructura anatómica de referencia.'}</small></div>`;
      };
    }

    // ---- PRÁCTICA · GUIADO (navegable: anterior / siguiente, pista, «ver cómo se hace» y bitácora)
    function estadoPrevioGuiado() {
      const E = S.ent; const prev = E.lista[E.i - 1];
      if (prev) { const { est, usados } = estadoHasta(prev.n); aplicarEstado(est, usados); } else aplicarEstado({}, []);
    }
    function vistaGuiado() {
      montarEscena(false);
      const lista = pasosAplicables();
      const E = S.ent = { i: 0, errores: 0, pistas: 0, esperando: true, lista, fin: false, chat: [], hechos: new Set(), saltados: new Set() };
      if (S.mesaOk) {   // lo que hiciste en la mesa ya cuenta: el paso 1 queda marcado
        E.hechos.add(lista[0].n); E.i = 1;
        E.chat.push({ de: 'sis', cls: 'ok', txt: '✅ Paso 1 registrado: ya reuniste el material en la mesa de instrumental.' });
        if (S.avisoMesa) {
          const a = S.avisoMesa; const n = a.incorrectos.length + a.faltantes.length;
          E.chat.push({ de: 'sis', cls: 'mal', txt: `La bandeja tenía ${n} error${n === 1 ? '' : 'es'} (${a.faltantes.length} faltante${a.faltantes.length === 1 ? '' : 's'} y ${a.incorrectos.length} elemento${a.incorrectos.length === 1 ? '' : 's'} incorrecto${a.incorrectos.length === 1 ? '' : 's'}). Se completó por vos; seguimos con el paciente.` });
          S.avisoMesa = null;
        }
      }
      E.esperando = !E.hechos.has(lista[E.i].n);
      estadoPrevioGuiado();
      setTimeout(tutorialAuto, 1200);
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g || !S.ent.esperando || S.ent.fin) return;
        const E2 = S.ent; const q = E2.lista[E2.i]; const tg = g.dataset.hs;
        if (tg === q.target) { completarPaso(q); }
        else {
          E2.errores++;
          g.classList.add('mal'); setTimeout(() => g.classList.remove('mal'), 500);
          const mas = E2.lista.slice(E2.i + 1).find((z) => z.target === tg);
          const antes = E2.lista.slice(0, E2.i).find((z) => z.target === tg);
          toast('Ese elemento no corresponde a este paso', 'mal');
          pintarGuiado({ mal: mas ? 'Orden incorrecto: ese elemento se usa más adelante, pero todavía no es el momento.' : antes ? 'Ya usaste ese elemento en un paso anterior. Revisá la consigna.' : 'Ese elemento no corresponde a este paso. Revisá la consigna.' });
        }
      };
      $('#acr-panel').onclick = guiadoClick;
      pintarGuiado({ nuevo: true });
    }
    function completarPaso(q) {
      const E = S.ent; E.hechos.add(q.n); E.esperando = false; resaltar(null);
      const { est, usados } = estadoHasta(q.n); aplicarEstado(est, usados);
      toast(`✔ Paso ${q.n} completado`, 'ok');
      pintarGuiado({ ok: q });
    }
    function guiadoIr(k) {
      const E = S.ent; E.i = Math.max(0, Math.min(E.lista.length, k)); resaltar(null);
      if (E.i < E.lista.length) E.esperando = !E.hechos.has(E.lista[E.i].n);
      estadoPrevioGuiado(); pintarGuiado({ nuevo: true });
    }
    function guiadoClick(e) {
      const E = S.ent; if (!E) return; const b = e.target.closest('[data-g]'); const tl = e.target.closest('[data-k]');
      if (tl) { guiadoIr(+tl.dataset.k); return; }
      if (!b) return; const a = b.dataset.g; const q = E.lista[E.i];
      if (a === 'ant') guiadoIr(E.i - 1);
      else if (a === 'sig') {
        if (q && !E.hechos.has(q.n)) { E.saltados.add(q.n); E.chat.push({ de: 'sis', cls: 'neutro', txt: `Paso ${q.n} saltado: en el examen un paso omitido cuenta en contra.` }); }
        guiadoIr(E.i + 1);
      } else if (a === 'cont') guiadoIr(E.i + 1);
      else if (a === 'pista') { E.pistas++; resaltar(q.target); b.disabled = true; toast('Pista: mirá el elemento resaltado', 'neutro'); }
      else if (a === 'ver') {
        E.pistas++; const { est, usados } = estadoHasta(q.n); aplicarEstado(est, usados); resaltar(q.target);
        E.chat.push({ de: 'sis', cls: 'neutro', txt: '👁 Así se hace: ' + q.explica });
        pintarGuiado({ ver: q });
      } else if (a === 'rep') { vistaGuiado(); }
      else if (a === 'modelo') { demoModelo(); }
      else if (a === 'examen') { S.modo = 'examen'; ir(); }
    }
    function guiadoTexto(v) {
      const E = S.ent; if (E.fin) return;
      const q = E.lista[E.i]; E.chat.push({ de: 'yo', txt: v });
      if (!E.esperando) { E.chat.push({ de: 'sis', cls: 'neutro', txt: 'Este paso ya está completo. Tocá «Siguiente» para continuar.' }); pintarGuiado(); return; }
      const r = reconocer(v, S.sexo);
      if (!r) { E.chat.push({ de: 'sis', cls: 'neutro', txt: 'No reconozco esa acción. Probá contarla con otras palabras (por ejemplo: «saludo y me presento»).' }); pintarGuiado(); return; }
      if (r.tipo === 'd') { const d = D.distractores.find((x) => x.id === r.id); E.errores++; E.chat.push({ de: 'sis', cls: 'mal', txt: '❌ ' + d.porque }); toast('Acción incorrecta', 'mal'); pintarGuiado({ mal: 'Esa acción es incorrecta.' }); return; }
      if (r.n === q.n) { E.chat.push({ de: 'sis', cls: 'ok', txt: `✅ Paso ${q.n} registrado.` }); completarPaso(q); return; }
      if (r.n < q.n && E.saltados.has(r.n)) {
        E.saltados.delete(r.n); E.hechos.add(r.n); E.chat.push({ de: 'sis', cls: 'ok', txt: `✅ Paso ${r.n} registrado (lo habías saltado).` });
        toast(`✔ Paso ${r.n} completado`, 'ok'); pintarGuiado(); return;
      }
      const z = porN(r.n); E.errores++;
      E.chat.push({ de: 'sis', cls: 'mal', txt: r.n > q.n ? `❌ Orden incorrecto: «${z.texto}» viene más adelante.` : 'Ese paso ya lo hiciste.' });
      toast(r.n > q.n ? 'Orden incorrecto' : 'Paso ya realizado', 'mal');
      pintarGuiado({ mal: r.n > q.n ? 'Orden incorrecto.' : 'Ese paso ya está hecho.' });
    }
    function pintarGuiado(fb) {
      fb = fb || {};
      const E = S.ent; const tot = E.lista.length;
      if (E.i >= tot) {
        E.fin = true; resaltar(null);
        $('#acr-panel').innerHTML = `<div class="acr-final"><div class="acr-final-ico">🏁</div><h3>¡Recorrido completo!</h3>
          <div class="acr-info bien">Completaste <b>${E.hechos.size}</b> de ${tot} pasos${E.saltados.size ? `, saltaste ${E.saltados.size}` : ''}, con <b>${E.errores}</b> error${E.errores === 1 ? '' : 'es'} y <b>${E.pistas}</b> ayuda${E.pistas === 1 ? '' : 's'}.</div>
          <p>Cuando te sientas seguro, rendí el <b>Examen</b>: a ciegas, con tiempo y corrección estricta.</p>
          <div class="acr-row"><button class="acr-btn" data-g="examen">Rendir el examen →</button><button class="acr-btn sec" data-g="rep">Repetir</button><button class="acr-btn sec" data-g="modelo">▶ Ver la acreditación modelo</button></div></div>`;
        animarPanel(); return;
      }
      const q = E.lista[E.i]; const hecho = E.hechos.has(q.n);
      const perla = (D.machete && D.machete.por_paso && D.machete.por_paso[q.n]) || '';
      const tl = E.lista.map((z, k) => `<button type="button" class="tl ${k === E.i ? 'cur' : ''} ${E.hechos.has(z.n) ? 'ok' : E.saltados.has(z.n) ? 'sk' : ''}" data-k="${k}" title="Paso ${z.n}${z.critico ? ' · crítico' : ''}">${z.n}</button>`).join('');
      $('#acr-panel').innerHTML = `
        <div class="acr-fase" style="margin-top:0">${esc(q.fase)} · paso ${E.i + 1} de ${tot}</div>
        <div class="acr-prog"><i style="width:${Math.round((E.hechos.size / tot) * 100)}%"></i></div>
        <div class="acr-tl">${tl}</div>
        <div class="acr-goal">${esc(q.texto)} ${q.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''} ${hecho ? '<span class="acr-hecho">✔ completado</span>' : ''}</div>
        ${hecho ? '<p>Este paso ya está completo. Podés avanzar o volver a revisarlo.</p>' : '<p>Tocá el elemento o la estructura con el que se realiza este paso, o escribí en la bitácora qué hacés.</p>'}
        ${fb.mal ? `<div class="acr-info mal">❌ ${esc(fb.mal)}</div>` : ''}
        ${fb.ok ? `<div class="acr-info bien">✅ <b>Correcto.</b> ${esc(fb.ok.explica)}</div>` : ''}
        ${fb.ver ? `<div class="acr-info">👁 <b>Así se hace.</b> ${esc(fb.ver.explica)}</div>` : ''}
        ${perla ? `<div class="acr-perla">📌 ${esc(perla)}</div>` : ''}
        <div class="acr-gnav">
          <button class="acr-btn sec" data-g="ant" ${E.i === 0 ? 'disabled' : ''}>← Anterior</button>
          <button class="acr-btn sec" data-g="pista" ${hecho ? 'disabled' : ''}>💡 Pista</button>
          <button class="acr-btn sec" data-g="ver">👁 Ver cómo se hace</button>
          <button class="acr-btn ${hecho ? '' : 'sec'}" data-g="${hecho ? 'cont' : 'sig'}">${hecho ? 'Siguiente →' : 'Saltar →'}</button>
        </div>
        <small>Errores: ${E.errores} · Ayudas: ${E.pistas} · Saltados: ${E.saltados.size}</small>
        ${chatHTML(E.chat, 'Contá qué hacés y cómo lo hacés…', '✍ Bitácora del procedimiento')}`;
      enlazarChat(guiadoTexto);
      if (fb.nuevo) animarPanel();
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
      if (ESC) ESC.dispose();
      $('#acr-escena').innerHTML = ''; $('#acr-chips').innerHTML = ''; svg = $('#acr-escena');
      document.querySelector('.acr-grid').classList.add('sin-escena');
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
      if (MESA) MESA.dispose();
      sinEscena();
      const tiempos = (D.examen && D.examen.tiempos) || [2, 5, 10];
      S.ex = { caso, t: tiempos[1] || tiempos[0], fase: 'inicio' };
      const pintarInicio = () => {
        $('#acr-panel').innerHTML = `
          <h3>Examen de acreditación</h3>
          <p>Vas a recibir un <b>caso clínico</b>, armar la bandeja y realizar el procedimiento <b>a ciegas</b>: no hay lista de pasos ni ayudas. Tocá un elemento o una estructura del dibujo y elegí qué acción realizás con él, en el orden que corresponda.</p>
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
    function iniciarTimerExamen() {
      S.timer = setInterval(() => {
        const X = S.ex; if (X.fase !== 'curso' && X.fase !== 'mesa') return;
        X.seg = X.t * 60 - Math.floor((Date.now() - X.inicio) / 1000);
        const el = $('#acr-reloj'); if (el) { el.textContent = '⏱ ' + mmss(Math.max(0, X.seg)); el.classList.toggle('urge', X.seg <= 30); }
        if (X.seg <= 0) examenFin(true);
      }, 500);
    }
    async function examenComenzar() {
      const apl = pasosAplicables(S.ex.caso.sexo);
      const dist = D.distractores.filter((d) => !d.solo || d.solo === S.ex.caso.sexo);
      Object.assign(S.ex, { fase: 'mesa', apl, dist, hechos: new Map(), log: [], graves: 0, seg: S.ex.t * 60, inicio: Date.now(), sel: null, aviso: '', chat: [] });
      iniciarTimerExamen();
      if (!D.instrumental) return examenCurso();
      try { await asegurarMesa(); } catch (e) { console.error(e); return examenCurso(); }
      $('#acr-panel').innerHTML = `<div class="acr-examen-bar"><span id="acr-reloj" class="acr-reloj">⏱ ${mmss(Math.max(0, S.ex.seg))}</span></div>`;
      $('#acr-panel').onclick = null;
      MESA.mount($('#acr-escena'), { modo: 'examen', caso: S.ex.caso,
        onValidar: (res) => {
          const X = S.ex; X.hechos.set(1, res.ok ? 'SI' : 'M');
          res.incorrectos.forEach((i) => X.log.push({ tipo: 'material', texto: i.nombre, grave: !!i.critico, porque: i.feedback }));
          res.faltantes.forEach((i) => X.log.push({ tipo: 'material', falta: true, texto: 'Falta: ' + i.nombre, grave: !!i.critico, porque: i.falta }));
          MESA.dispose(); examenCurso();
        } });
    }
    function estadoExamen() {
      const X = S.ex; const e = {}; const u = new Set();
      X.hechos.forEach((_, m) => { const q = porN(m); Object.assign(e, q.estado); if (usables().includes(q.target)) u.add(q.target); });
      return { e, u };
    }
    async function examenCurso() {
      if (S.ex.fase === 'fin') return;
      S.ex.fase = 'curso';
      await asegurarVisor();
      if (S.ex.fase !== 'curso') return;
      montarEscena(false);
      const X = S.ex; X.hist = X.hist || [];
      if (X.hechos.has(1)) X.chat.push({ de: 'sis', cls: 'neutro', txt: 'Registrado: reunión del material en la mesa.' });
      const st = estadoExamen(); aplicarEstado(st.e, st.u, true);
      svg.onclick = (e) => {
        const g = e.target.closest('[data-hs]'); if (!g || S.ex.fase !== 'curso') return;
        S.ex.sel = g.dataset.hs; marcarSel(g.dataset.hs); pintarExamen();
      };
      $('#acr-panel').onclick = (e) => {
        const a = e.target.closest('[data-act]'); if (a) { examenAccion(a.dataset.act); return; }
        if (e.target.closest('#acr-undo')) { examenDeshacer(); return; }
        if (e.target.id === 'acr-cancel') { S.ex.sel = null; marcarSel(null); pintarExamen(); }
        if (e.target.id === 'acr-fin') { if (confirm('¿Finalizar el examen y corregir?')) examenFin(false); }
      };
      setTimeout(tutorialAuto, 1000);
      pintarExamen();
    }
    function pintarExamen() {
      const X = S.ex; const el = X.sel ? D.elementos[X.sel] : null;
      let cuerpo = '<p>Tocá un elemento o una estructura del modelo para elegir una acción, o escribí en la bitácora lo que hacés.</p>';
      if (X.sel) {
        const acts = mezclar([...X.apl.filter((q) => q.target === X.sel).map((q) => ({ k: 'p', id: q.n, texto: q.texto })), ...X.dist.filter((d) => d.target === X.sel).map((d) => ({ k: 'd', id: d.id, texto: d.texto }))]);
        cuerpo = `<div class="acr-fase" style="margin-top:0">${esc(el ? el.nombre : X.sel)}</div>` + (acts.length
          ? `<p>¿Qué acción realizás?</p><div class="acr-banco">${acts.map((a) => `<button class="acr-opt" data-act="${a.k}:${a.id}">${esc(a.texto)}</button>`).join('')}</div>`
          : '<p>Con este elemento no se realiza ninguna acción del procedimiento.</p>') +
          '<div class="acr-row"><button class="acr-btn sec" id="acr-cancel">Cancelar</button></div>';
      }
      $('#acr-panel').innerHTML = `
        <div class="acr-examen-bar"><span id="acr-reloj" class="acr-reloj">⏱ ${mmss(Math.max(0, X.seg))}</span><span class="acr-pill ${X.graves ? 'bad' : ''}">Infracciones graves: ${X.graves}</span></div>
        <div class="acr-caso"><b>${esc(X.caso.nombre || 'Paciente')}:</b> ${X.caso.sexo === 'F' ? 'mujer' : 'varón'} de ${X.caso.edad} años. ${esc(X.caso.motivo)}</div>
        ${X.aviso ? `<div class="acr-info mal acr-alerta">${X.aviso}</div>` : ''}
        ${cuerpo}
        ${chatHTML(X.chat, 'Escribí lo que hacés, ej.: me lavo las manos…', '✍ Bitácora de tus acciones')}
        <div class="acr-row" style="margin-top:12px"><button class="acr-btn sec" id="acr-undo" ${X.hist && X.hist.length ? '' : 'disabled'}>↩ Deshacer última acción</button><button class="acr-btn bad" id="acr-fin">Finalizar examen</button></div>
        <small>Deshacer cuesta 1 punto: cada rectificación queda registrada.</small>`;
      enlazarChat(examenTexto);
    }
    function examenTexto(v) {
      const X = S.ex; if (X.fase !== 'curso') return;
      const r = reconocer(v, X.caso.sexo);
      if (!r) { X.chat.push({ de: 'yo', txt: v }, { de: 'sis', cls: 'neutro', txt: 'Anotado. No corresponde a ninguna acción del procedimiento.' }); X.sel = null; marcarSel(null); pintarExamen(); return; }
      examenAccion(r.tipo === 'p' ? 'p:' + r.n : 'd:' + r.id, v);
    }
    function examenAccion(cl, textoUsuario) {
      const X = S.ex; const [k, ref] = cl.split(':'); X.aviso = '';
      const snap = { logLen: X.log.length, graves: X.graves, chatLen: X.chat.length, agrego: null };
      const etiqueta = k === 'p' ? porN(+ref).texto : (X.dist.find((x) => x.id === ref) || {}).texto;
      X.chat.push({ de: 'yo', txt: textoUsuario || etiqueta }, { de: 'sis', cls: 'neutro', txt: 'Registrado.' });
      if (k === 'p') {
        const n = +ref; const q = porN(n);
        if (X.hechos.has(n)) { X.log.push({ tipo: 'repetida', n, texto: q.texto, grave: false, porque: 'Acción ya realizada.' }); }
        else {
          const previos = X.apl.filter((z) => z.n < n && !X.hechos.has(z.n));
          const enOrden = previos.length === 0;
          X.hechos.set(n, enOrden ? 'SI' : 'M'); snap.agrego = n;
          if (!enOrden) {
            const critPrev = previos.some((z) => z.critico);
            X.log.push({ tipo: 'orden', n, texto: q.texto, grave: critPrev, porque: `Se hizo antes de completar pasos previos (${previos.slice(0, 3).map((z) => z.n).join(', ')}${previos.length > 3 ? '…' : ''}).` });
            if (critPrev) { X.graves++; X.aviso = '⚠ Infracción grave: alteraste el orden de la técnica y salteaste un paso crítico.'; }
          }
          const st = estadoExamen(); aplicarEstado(st.e, st.u, true);
        }
      } else {
        const d = X.dist.find((x) => x.id === ref);
        X.log.push({ tipo: 'incorrecta', texto: d.texto, grave: !!d.critico, porque: d.porque });
        if (d.critico) { X.graves++; X.aviso = `⚠ Infracción grave: “${esc(d.texto)}”.`; }
      }
      X.hist.push(snap);
      X.sel = null; marcarSel(null); pintarExamen();
    }
    function examenDeshacer() {
      const X = S.ex; const s = X.hist && X.hist.pop(); if (!s) { toast('No hay acciones para deshacer', 'neutro'); return; }
      if (s.agrego != null) X.hechos.delete(s.agrego);
      X.log.length = s.logLen; X.graves = s.graves; X.chat.length = s.chatLen; X.aviso = '';
      X.log.push({ tipo: 'rectificacion', texto: 'Rectificaste una acción', grave: false, porque: 'Deshiciste una acción ya registrada (cuesta 1 punto).' });
      X.chat.push({ de: 'sis', cls: 'neutro', txt: '↩ Última acción deshecha.' });
      const st = estadoExamen(); aplicarEstado(st.e, st.u, true);
      X.sel = null; marcarSel(null); toast('Acción deshecha (−1 punto)', 'neutro'); pintarExamen();
    }
    function examenFin(porTiempo) {
      const X = S.ex; if (X.fase !== 'curso' && X.fase !== 'mesa') return; X.fase = 'fin'; parar(); if (MESA) MESA.dispose(); document.querySelector('.acr-grid').classList.remove('sin-escena'); svg = svg || $('#acr-escena');
      const usado = Math.min(X.t * 60, Math.round((Date.now() - X.inicio) / 1000));
      const filas = X.apl.map((p) => ({ p, st: X.hechos.get(p.n) || 'NO' }));
      const pen = D.examen || { penalizacion_incorrecta: 3, penalizacion_repetida: 1 };
      const baseP = filas.reduce((a, f) => a + (f.st === 'SI' ? 1 : f.st === 'M' ? 0.5 : 0), 0) / X.apl.length * 100;
      const resta = X.log.reduce((a, l) => a + (l.tipo === 'incorrecta' || (l.tipo === 'material' && !l.falta) ? pen.penalizacion_incorrecta : l.tipo === 'material' ? 2 : l.tipo === 'repetida' || l.tipo === 'rectificacion' ? pen.penalizacion_repetida : 0), 0);
      const pct = Math.max(0, Math.round(baseP - resta));
      const criticosFallidos = filas.filter((f) => f.p.critico && f.st !== 'SI');
      const gravesLog = X.log.filter((l) => l.grave);
      const aprobado = !criticosFallidos.length && !gravesLog.length && pct >= D.umbral;
      guardarRes(area, id, 'examen', { pct, aprobado, seg: usado });
      try { if (ESC) { ESC.hl(null); ESC.sel(null); } } catch (_) {}
      $('#acr-panel').onclick = (e) => { if (e.target.id === 'acr-otra') examenInicio(); if (e.target.id === 'acr-prac') { S.modo = 'practica'; S.sub = 'guiado'; ir(); } };
      $('#acr-panel').innerHTML = `
        <div class="acr-res ${aprobado ? 'ap' : 'de'}"><h2>${aprobado ? 'ACREDITADO' : 'NO ACREDITADO'}</h2>
          <div><b>${pct}%</b> de acierto · umbral ${D.umbral}%</div>
          <div>Tiempo: ${mmss(usado)} de ${mmss(X.t * 60)}${porTiempo ? ' (tiempo agotado)' : ''}</div></div>
        ${criticosFallidos.length || gravesLog.length ? `<div class="acr-info mal"><b>Criterios de desaprobación:</b><ul style="margin:6px 0 0 18px">
          ${criticosFallidos.map((f) => `<li>Paso ${f.p.n} (${f.st === 'NO' ? 'omitido' : 'fuera de orden'}): ${esc(f.p.texto)}<br><small>${esc(f.p.explica)}</small></li>`).join('')}
          ${gravesLog.filter((l) => l.tipo === 'incorrecta' || l.tipo === 'material').map((l) => `<li>${l.tipo === 'material' ? (l.falta ? 'Material crítico faltante' : 'Material incorrecto grave') : 'Acción incorrecta grave'}: “${esc(l.texto.replace(/^Falta: /, ''))}”<br><small>${esc(l.porque)}</small></li>`).join('')}</ul></div>` : ''}
        <div class="acr-fase">Detalle de errores (${X.log.length})</div>
        ${X.log.length ? `<ul class="acr-refs">${X.log.map((l) => `<li><b>${l.tipo === 'rectificacion' ? 'Rectificación' : l.tipo === 'material' ? (l.falta ? 'Material faltante' : 'Material incorrecto') : l.tipo === 'incorrecta' ? 'Acción incorrecta' : l.tipo === 'orden' ? 'Orden alterado' : 'Acción repetida'}${l.grave ? ' · grave' : ''}:</b> ${esc(l.texto)}<br><small>${esc(l.porque)}</small></li>`).join('')}</ul>` : '<p>No registraste errores de acción ni de orden.</p>'}
        <div class="acr-row"><button class="acr-btn" id="acr-otra">Nuevo intento</button><button class="acr-btn sec" id="acr-prac">Practicar</button></div>
        <div class="acr-fase">Lista de cotejo (${X.apl.length} pasos)</div>
        <table class="acr-tabla">${filas.map((f) => `<tr><td>${f.p.n}</td><td>${esc(f.p.texto)} ${f.p.critico ? '<span class="acr-crit">⚠</span>' : ''}</td><td class="st-${f.st}">${f.st === 'SI' ? 'SÍ' : f.st === 'M' ? '+/-' : 'NO'}</td></tr>`).join('')}</table>
        <p style="margin-top:8px"><small>+/- = realizado pero fuera de orden (vale 0,5). Cada acción incorrecta resta ${pen.penalizacion_incorrecta} puntos y cada repetida ${pen.penalizacion_repetida}.</small></p>`;
    }

    // ---- DEMOSTRACIÓN: la acreditación modelo, de punta a punta y bien hecha
    const dormir = (ms, dem) => new Promise((ok) => { dem.despertar = ok; dem.t = setTimeout(ok, ms); });
    function cerrarDemo(dem) { if (!dem) return; dem.cancel = true; clearTimeout(dem.t); if (dem.despertar) dem.despertar(); if (MESA) MESA.dispose(); S.demo = null; try { localStorage.setItem('nika_acr_demo_v1', '1'); } catch (_) {} }
    async function demoModelo() {
      parar(); if (S.demo) cerrarDemo(S.demo);
      sinEscena(); $('#acr-panel').innerHTML = '';
      const dem = S.demo = { cancel: false, pausa: false, k: 0 };
      try { await asegurarMesa(); } catch (e) { cerrarDemo(dem); return portada(); }
      const caso = D.casos.find((c) => c.id === 'c1') || D.casos[0];
      S.caso = caso; S.sexo = caso.sexo; pintarTabs();
      const seguir = await new Promise((ok) => {
        MESA.mount($('#acr-escena'), { caso, modo: 'demo', onSaltar: () => ok(false), onValidar: () => ok(true) });
        MESA.demo();
      });
      if (!seguir || dem.cancel) { cerrarDemo(dem); return portada(); }
      MESA.dispose();
      $('#acr-escena').innerHTML = '<p class="acr-sub" style="padding:20px">Preparando al paciente…</p>';
      try { await asegurarVisor(); } catch (e) { cerrarDemo(dem); return portada(); }
      if (dem.cancel) return;
      montarEscena(false); aplicarEstado({}, []);
      await demoPasos(dem);
    }
    async function demoPasos(dem) {
      const lista = pasosAplicables(S.sexo); const N = lista.length; const panel = $('#acr-panel');
      const pausable = async (ms) => { await dormir(ms, dem); while (dem.pausa && !dem.cancel && !dem.salto) await dormir(250, dem); };
      panel.onclick = (e) => {
        const b = e.target.closest('[data-d]'); if (!b) return; const a = b.dataset.d;
        if (a === 'pausa') { dem.pausa = !dem.pausa; b.textContent = dem.pausa ? '▶ Continuar' : '⏸ Pausar'; if (!dem.pausa && dem.despertar) dem.despertar(); }
        else if (a === 'ant') { dem.k = Math.max(0, dem.k - 1); dem.salto = true; dem.despertar && dem.despertar(); }
        else if (a === 'sig') { dem.k = Math.min(N - 1, dem.k + 1); dem.salto = true; dem.despertar && dem.despertar(); }
        else if (a === 'saltar') { cerrarDemo(dem); portada(); }
        else if (a === 'practicar') { cerrarDemo(dem); S.modo = 'practica'; S.sub = 'guiado'; S.mesaOk = false; mostrarMesaPractica(); }
        else if (a === 'examen') { cerrarDemo(dem); S.modo = 'examen'; ir(); }
        else if (a === 'otra') { demoModelo(); }
      };
      while (dem.k < N && !dem.cancel) {
        const k = dem.k; const q = lista[k]; dem.salto = false;
        const prev = lista[k - 1]; if (prev) { const { est, usados } = estadoHasta(prev.n); aplicarEstado(est, usados); } else aplicarEstado({}, []);
        const hist = lista.slice(0, k).map((z) => `<div class="m yo">${esc(z.frase)}</div><div class="m sis ok">✅ Paso ${z.n} registrado.</div>`).join('');
        panel.innerHTML = `<div class="acr-demo-tag">▶ DEMOSTRACIÓN · así se hace una acreditación aprobada</div>
          <div class="acr-fase" style="margin-top:8px">${esc(q.fase)} · paso ${k + 1} de ${N}</div>
          <div class="acr-prog"><i style="width:${Math.round((k / N) * 100)}%"></i></div>
          <div class="acr-goal">${esc(q.texto)} ${q.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</div>
          <div class="acr-chat"><div class="acr-fase" style="margin-top:8px">✍ Bitácora (escrita por el alumno modelo)</div>
            <div class="acr-chat-log" id="acr-chat-log">${hist}<div class="m yo" id="demo-typing"></div></div></div>
          <div class="acr-info bien" id="demo-expl" style="opacity:0">✅ <b>Paso ${q.n}.</b> ${esc(q.explica)}</div>
          <div class="acr-gnav"><button class="acr-btn sec" data-d="ant" ${k === 0 ? 'disabled' : ''}>← Anterior</button>
            <button class="acr-btn sec" data-d="pausa">${dem.pausa ? '▶ Continuar' : '⏸ Pausar'}</button>
            <button class="acr-btn sec" data-d="sig" ${k === N - 1 ? 'disabled' : ''}>Siguiente →</button>
            <button class="acr-btn sec" data-d="saltar">Saltar demostración ✕</button></div>`;
        animarPanel(); resaltar(q.target);
        const log = $('#acr-chat-log'); log.scrollTop = log.scrollHeight;
        await pausable(800); if (dem.cancel) return; if (dem.salto) continue;
        const caja = $('#demo-typing');
        for (const ch of q.frase) { if (dem.cancel || dem.salto) break; while (dem.pausa && !dem.cancel && !dem.salto) await dormir(200, dem); caja.textContent += ch; log.scrollTop = log.scrollHeight; await dormir(17, dem); }
        if (dem.cancel) return; if (dem.salto) continue;
        log.insertAdjacentHTML('beforeend', `<div class="m sis ok">✅ Paso ${q.n} registrado.</div>`); log.scrollTop = log.scrollHeight;
        const { est, usados } = estadoHasta(q.n); aplicarEstado(est, usados); resaltar(null);
        const ex = $('#demo-expl'); if (ex) { ex.style.transition = 'opacity .5s'; ex.style.opacity = 1; }
        toast(`✔ Paso ${q.n}`, 'ok');
        await pausable(q.critico ? 3600 : 2800); if (dem.cancel) return; if (dem.salto) continue;
        dem.k++;
      }
      if (dem.cancel) return;
      try { localStorage.setItem('nika_acr_demo_v1', '1'); } catch (_) {}
      panel.innerHTML = `<div class="acr-final"><div class="acr-final-ico">🏆</div><h3>Así se ve una acreditación aprobada</h3>
        <div class="acr-info bien">Cumplió los <b>${N} pasos</b> en orden, con los 5 pasos críticos resueltos y sin acciones incorrectas.</div>
        <ul class="acr-refs"><li><b>Mesa:</b> bandeja completa según el caso clínico (sexo, calibre y alergias), sin elementos de más.</li>
          <li><b>Orden:</b> respetar la secuencia de la lista de cotejo, de lo limpio a lo estéril.</li>
          <li><b>Críticos:</b> consentimiento, lavado de manos, guantes estériles, prueba del balón y registro.</li>
          <li><b>Bitácora:</b> contá lo que hacés y cómo lo hacés; en el examen no hay ayudas.</li></ul>
        <div class="acr-row"><button class="acr-btn" data-d="practicar">Practicar ahora →</button><button class="acr-btn sec" data-d="examen">Rendir el examen</button><button class="acr-btn sec" data-d="otra">Ver de nuevo</button></div></div>`;
      animarPanel(); resaltar(null);
    }

    // ---- portada (sin cargar nada pesado) y navegación
    function portada() {
      parar();
      if (ESC) ESC.dispose();
      document.querySelector('.acr-grid').classList.add('sin-escena');
      $('#acr-chips').innerHTML = '';
      const visto = (() => { try { return localStorage.getItem('nika_acr_demo_v1') === '1'; } catch (_) { return false; } })();
      $('#acr-escena').innerHTML = `<div class="acr-portada">
        <div class="ico">${D.icono}</div>
        <h2>${esc(D.titulo)}</h2>
        <p>${esc(D.resumen)}</p>
        <button class="acr-modelo" id="acr-go-demo"><span class="p">▶</span><span><b>Ver la acreditación modelo</b><small>${visto ? 'Volver a ver cómo se hace, de principio a fin' : 'Recomendado la primera vez: mirá cómo se hace bien, paso a paso'}</small></span>${visto ? '' : '<em>Recomendado</em>'}</button>
        <ul class="acr-refs">
          <li><b>Caso clínico y mesa:</b> leés el caso y armás la bandeja con el instrumental correcto.</li>
          <li><b>Práctica:</b> recorrido guiado paso a paso (con anterior / siguiente), exploración libre, machete y fundamentos.</li>
          <li><b>Examen:</b> a ciegas, con tiempo límite y corrección estricta.</li>
        </ul>
        <p class="acr-peso">El modelo 3D (${esc(D.peso_modelo || 'unos MB')}) se descarga recién cuando comenzás; no se carga nada pesado antes.</p>
        <div class="acr-row"><button class="acr-btn" id="acr-go-prac">Comenzar entrenamiento</button><button class="acr-btn sec" id="acr-go-ex">Rendir examen</button></div>
        <div class="acr-row"><button class="acr-btn sec" id="acr-go-libre" style="font-size:.8rem;padding:7px 14px">Solo explorar el modelo 3D</button></div>
        <div id="acr-portada-msg" class="acr-info mal" hidden></div>
      </div>`;
      $('#acr-panel').innerHTML = '';
      const arrancar = async (modo, sub) => {
        const btns = document.querySelectorAll('.acr-portada .acr-btn, .acr-portada .acr-modelo'); btns.forEach((b) => { b.disabled = true; });
        try {
          S.modo = modo; if (sub) S.sub = sub;
          if (modo === 'practica' && sub === 'guiado') return await mostrarMesaPractica();
          if (modo === 'practica') await asegurarVisor();
          ir();
        } catch (e) {
          console.error(e); btns.forEach((b) => { b.disabled = false; });
          const m = $('#acr-portada-msg'); m.hidden = false; m.textContent = 'No se pudo cargar el simulador. Revisá tu conexión e intentá de nuevo.';
        }
      };
      $('#acr-go-demo').onclick = () => { S.modo = 'practica'; S.sub = 'guiado'; demoModelo(); };
      $('#acr-go-prac').onclick = () => arrancar('practica', 'guiado');
      $('#acr-go-ex').onclick = () => arrancar('examen');
      $('#acr-go-libre').onclick = () => arrancar('practica', 'explorar');
    }
    function ir() {
      parar();
      pintarTabs();
      if (S.modo === 'examen') return examenInicio();
      if (S.modo === 'practica' && S.sub === 'guiado' && !S.mesaOk) return mostrarMesaPractica();
      const sin3d = S.modo === 'practica' && S.sub === 'fundamentos';
      if (!sin3d && !ESC) return portada();
      if (ESC) setTimeout(tutorialAuto, 1200);
      if (S.sub === 'explorar') vistaExplorar();
      else if (S.sub === 'guiado') vistaGuiado();
      else if (S.sub === 'machete') vistaMachete();
      else vistaFundamentos();
    }
    $('#acr-tabs').onclick = (e) => {
      if (e.target.closest('[data-tut]')) { tutorial3D(); return; }
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
