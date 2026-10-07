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
    volver.href = area === 'siam' ? 'siam_hub.html' : area === 'sim' ? 'gineco_hub.html' : area === 'cir' ? 'cirugia_hub.html' : 'campus.html';
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
      const [mod, cfg] = await Promise.all([import('./visor3d.js?v=55'), getJSON(D.visor)]);
      VCFG = cfg; ESC = mod.crearVisor(cfg);
    }
    const usables = () => (VCFG ? VCFG.usables : []);
    let MESA = null;
    async function asegurarMesa() {
      if (MESA) return;
      const [mod, cfg] = await Promise.all([import('./mesa.js?v=14'), getJSON(D.instrumental)]);
      MESA = mod.crearMesa(cfg);
    }
    const sinEscena = () => { if (window.AcrMonitor) AcrMonitor.detener(); if (ESC) ESC.dispose(); document.querySelector('.acr-grid').classList.add('sin-escena'); $('#acr-chips').innerHTML = ''; $('#acr-escena').innerHTML = ''; svg = $('#acr-escena'); };
    function pintarLectura(ver) {
      const c = $('#acr-lectura'); if (!c) return;
      if (!ver) { c.innerHTML = ''; return; }
      c.innerHTML = `<div class="lect-aviso">📖 <b>Antes de practicar</b>, leé la lista de cotejo${D.algoritmo ? ' y ' + (D.algoritmo.aviso || 'el algoritmo') : ''} o tenelos a mano: en el examen no vas a tener ayudas.</div>
        <button type="button" class="lect-btn" id="lect-abrir"><span class="ic">📋</span><span><b>Ver la lista de cotejo completa</b><small>${D.pasos.filter((z) => !z.solo_si && !z.solo_contra).length} pasos${D.casos.some((z) => z.sexo === 'F') && D.pasos.some((z) => z.solo) ? ' · versión mujer y varón' : ''}</small></span><em>Abrir ↗</em></button>
        ${D.algoritmo ? `<button type="button" class="lect-btn alg" id="lect-alg"><span class="ic">🧭</span><span><b>${esc(D.algoritmo.boton_titulo || 'Ver el algoritmo')}</b><small>${esc(D.algoritmo.boton_sub || 'Ritmos desfibrilables y no desfibrilables')}</small></span><em>Abrir ↗</em></button>` : ''}`;
      $('#lect-abrir').onclick = () => abrirLista(S.sexo);
      if (D.algoritmo) $('#lect-alg').onclick = () => abrirAlgoritmo();
    }
    function abrirAlgoritmo() {
      if (document.querySelector('.lect-modal') || !D.algoritmo) return; const A = D.algoritmo; const m = document.createElement('div'); m.className = 'lect-modal';
      const hecho = (fl) => !!(svg && svg.classList && svg.classList.contains('s-' + fl));
      const nodo = (n, i) => `<div class="alg-n ${hecho(n.flag) ? 'hecho' : ''}" style="--i:${i}"><b>${esc(n.t)}</b><span>${esc(n.x)}</span></div>`;
      const cerrar = () => { m.classList.add('sale'); document.removeEventListener('keydown', tecla); setTimeout(() => m.remove(), 250); };
      const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
      m.innerHTML = `<div class="lect-hoja alg-hoja" role="dialog" aria-label="Algoritmo"><div class="lect-cab"><div><h2>🧭 ${esc(A.titulo)}</h2><p>Los pasos ya realizados se marcan en verde.</p></div><button class="lect-x" data-cerrar aria-label="Cerrar">✕</button></div>
        <div class="lect-cuerpo"><div class="alg-fila">${A.comun.map(nodo).join('')}</div><div class="alg-flecha">${esc(A.flecha || '▼ ¿Ritmo desfibrilable?')}</div>
        <div class="alg-cols">${A.columnas.map((c) => `<div class="alg-col ${c.cls}"><h3>${esc(c.titulo)}</h3>${c.nodos.map(nodo).join('<div class="alg-flecha chica">▼</div>')}</div>`).join('')}</div>
        <div class="alg-flecha">${esc(A.flecha_final || '▼ Cada 2 minutos: reevaluar el ritmo')}</div><div class="alg-fila">${A.final.map(nodo).join('')}</div></div>
        <div class="lect-pie">${esc(A.pie || 'Compresiones de calidad, mínimas interrupciones y relevo cada 2 minutos.')} <button class="acr-btn sec" data-cerrar>Cerrar</button></div></div>`;
      m.onclick = (e) => { if (e.target === m || e.target.closest('[data-cerrar]')) cerrar(); };
      document.body.appendChild(m); document.addEventListener('keydown', tecla);
    }
    function abrirLista(sexo) {
      if (document.querySelector('.lect-modal')) return;
      const m = document.createElement('div'); m.className = 'lect-modal'; let sx = sexo || 'F';
      const cerrar = () => { m.classList.add('sale'); document.removeEventListener('keydown', tecla); setTimeout(() => m.remove(), 250); };
      const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
      const pintar = () => {
        const lista = pasosAplicables(sx, true).filter((z) => !z.solo_contra && !z.solo_si); const fases = []; lista.forEach((z) => { let f = fases.find((q) => q.n === z.fase); if (!f) fases.push(f = { n: z.fase, p: [] }); f.p.push(z); });
        const solos = D.pasos.filter((z) => z.solo);
        m.innerHTML = `<div class="lect-hoja" role="dialog" aria-label="Lista de cotejo">
          <div class="lect-cab"><div><h2>📋 Lista de cotejo · ${esc(D.titulo)}</h2><p>${lista.length} pasos · ${lista.filter((z) => z.critico).length} críticos${solos.length ? ` · ${solos.length} paso${solos.length === 1 ? '' : 's'} difiere${solos.length === 1 ? '' : 'n'} según el sexo` : ''}</p></div>
             <div class="lect-sx" ${new Set(D.casos.map((c) => c.sexo)).size < 2 ? 'hidden' : ''}><button data-sx="F" class="${sx === 'F' ? 'on' : ''}">♀ Mujer</button><button data-sx="M" class="${sx === 'M' ? 'on' : ''}">♂ Varón</button></div>
            <button class="lect-x" data-cerrar aria-label="Cerrar">✕</button></div>
          <div class="lect-cuerpo">${fases.map((f, i) => `<section style="--i:${i}"><h3>${esc(f.n)}</h3><div class="lect-pasos">${f.p.map((z) => `<div class="lect-p ${z.critico ? 'cri' : ''}"><span class="n">${z.n}</span><div>${esc(z.texto)} ${z.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}${z.solo ? `<span class="lect-solo">Solo ${z.solo === 'F' ? 'mujer' : 'varón'}</span>` : ''}</div></div>`).join('')}</div></section>`).join('')}</div>
          <div class="lect-pie">⚠ Los pasos críticos son criterios de desaprobación. <button class="acr-btn sec" data-cerrar>Cerrar</button></div></div>`;
      };
      m.onclick = (e) => { if (e.target === m || e.target.closest('[data-cerrar]')) return cerrar(); const b = e.target.closest('[data-sx]'); if (b) { sx = b.dataset.sx; pintar(); } };
      pintar(); document.body.appendChild(m); document.addEventListener('keydown', tecla);
    }
    async function mostrarMesaPractica() {
      pintarLectura(true);
      parar(); sinEscena(); $('#acr-panel').innerHTML = '';
      if (!D.instrumental) { S.mesaOk = true; await asegurarVisor(); return ir(); }
      try { await asegurarMesa(); } catch (e) { console.error(e); $('#acr-escena').innerHTML = '<p class="acr-sub" style="padding:20px">No se pudo cargar la mesa de instrumental.</p>'; return; }
      if (!S.caso) { S.caso = azar(D.casos); }
      S.sexo = S.caso.sexo; pintarTabs(); pintarLectura(true);
      MESA.mount($('#acr-escena'), { caso: S.caso, casos: D.casos, modo: 'practica',
        onCaso: (c) => { S.caso = c; S.sexo = c.sexo; pintarTabs(); pintarLectura(true); },
        onValidar: async (res) => {
          MESA.dispose(); S.mesaOk = true; S.avisoMesa = res.corregido ? res.avisos : null;
          $('#acr-escena').innerHTML = '<p class="acr-sub" style="padding:20px">Preparando al paciente…</p>'; await asegurarVisor(); ir();
        } });
    }
    document.title = `${D.titulo} · Atlas de acreditaciones`;
    if (window.AcrFX) AcrFX.boton();
    const pantallaCompleta = () => {
      const de = document.documentElement;
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (de.requestFullscreen) de.requestFullscreen().catch(() => toast('Tu navegador no permitió la pantalla completa', 'neutro'));
        else toast('Este dispositivo no admite pantalla completa', 'neutro');
      } catch (_) {}
    };
    if (!document.getElementById('acr-full-fab')) {
      document.body.insertAdjacentHTML('beforeend', '<button type="button" id="acr-full-fab" class="acr-ayuda-fab acr-full-fab" title="Pantalla completa" aria-label="Pantalla completa">⛶</button>');
      document.getElementById('acr-full-fab').onclick = pantallaCompleta;
    }
    document.addEventListener('fullscreenchange', () => { const b = document.getElementById('acr-full-fab'); if (b) { b.classList.toggle('on', !!document.fullscreenElement); b.title = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa'; } });
    // ---- celulares y tablets: sugerir el uso en horizontal (se ve como una computadora a menor escala)
    const chicoTactil = () => (window.matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 820) && Math.min(screen.width, screen.height) < 900;
    const vertical = () => window.matchMedia('(orientation: portrait)').matches;
    const pintarRotar = () => {
      let b = document.getElementById('acr-rotar'); let cerrado = false; try { cerrado = sessionStorage.getItem('acr_rotar_x') === '1'; } catch (_) {}
      const ver = chicoTactil() && vertical() && !cerrado;
      if (!ver) { if (b) b.remove(); return; }
      if (b) return;
      document.body.insertAdjacentHTML('beforeend', '<div id="acr-rotar" class="acr-rotar" role="status"><span class="ph">📱</span><div class="tx"><b>Girá el celular</b><small>Usá el simulador en horizontal: ocupa toda la pantalla y se ve como en una computadora.</small></div><button type="button" id="acr-rotar-fs" class="fs">Pantalla completa</button><button type="button" id="acr-rotar-x" aria-label="Cerrar">✕</button></div>');
      $('#acr-rotar-x').onclick = () => { try { sessionStorage.setItem('acr_rotar_x', '1'); } catch (_) {} pintarRotar(); };
      const fs = $('#acr-rotar-fs');
      if (!document.fullscreenEnabled) fs.remove();
      else fs.onclick = async () => { try { await document.documentElement.requestFullscreen(); if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (_) { toast('Girá el celular manualmente', 'neutro'); } };
    };
    pintarRotar(); window.addEventListener('orientationchange', () => setTimeout(pintarRotar, 250)); window.addEventListener('resize', () => setTimeout(pintarRotar, 250));
    const quitarCancelarEx = () => { const b = document.getElementById('acr-ex-x'); if (b) b.remove(); document.body.classList.remove('acr-examen'); };
    if (!document.fullscreenEnabled) document.body.classList.add('acr-sin-fs');   // iPhone y otros: sin API de pantalla completa
    const cancelarExamen = () => {
      if (!S.ex || (S.ex.fase !== 'mesa' && S.ex.fase !== 'curso')) return;
      if (!confirm('¿Cancelar el examen? No se corrige ni se guarda ningún resultado.')) return;
      parar(); if (MESA) MESA.dispose(); S.ex.fase = 'cancelado'; quitarCancelarEx();
      S.modo = 'practica'; S.sub = 'guiado'; S.mesaOk = false; portada();
    };
    const mostrarCancelarEx = () => {
      if (document.getElementById('acr-ex-x')) return;
      document.body.classList.add('acr-examen');   // el chat privado se oculta mientras se rinde
      document.body.insertAdjacentHTML('beforeend', '<button type="button" id="acr-ex-x" class="acr-ex-x">✕ Cancelar examen</button>');
      document.getElementById('acr-ex-x').onclick = cancelarExamen;
    };
    if (!document.getElementById('acr-ayuda-fab')) {
      document.body.insertAdjacentHTML('beforeend', '<button type="button" id="acr-ayuda-fab" class="acr-ayuda-fab" title="Cómo usar el simulador" aria-label="Cómo usar el simulador">?</button>');
      document.getElementById('acr-ayuda-fab').onclick = () => tutorial3D();
    }
    const BUILD = '2026-10-03 · r30'; if (!document.querySelector('.acr-build')) document.body.insertAdjacentHTML('beforeend', `<div class="acr-build">Atlas · versión ${BUILD}</div>`);

    const S = { modo: 'practica', sub: 'explorar', sexo: 'F', paso: 0, ent: null, ex: null, fun: null, timer: null, caso: null, avisoMesa: null };
    // caso con contraindicación absoluta: se omiten los pasos del tacto y aparece el paso «no realizar»
    const casoActual = () => (S.modo === 'examen' && S.ex ? S.ex.caso : S.caso);
    const conContra = () => !!(casoActual() && casoActual().contra);
    // pasos que dependen del caso: solo_contra / sin_contra (contraindicación) y solo_si / sin_si (cualquier campo del caso, p. ej. «trauma»)
    const casoOk = (p) => { const c = casoActual(); if (p.solo_contra && !conContra()) return false; if (p.sin_contra && conContra()) return false; if (p.solo_si && !(c && c[p.solo_si])) return false; if (p.sin_si && c && c[p.sin_si]) return false; return true; };
    const aplica = (p, sexo, ign) => (!p.solo || p.solo === (sexo || S.sexo)) && (ign || casoOk(p));
    const pasosAplicables = (sexo, ign) => D.pasos.filter((p) => aplica(p, sexo, ign));
    const etiquetaPaso = (n) => { if (Number.isInteger(n)) return n; const f = Math.round((n - Math.floor(n)) * 10); return f === 5 ? Math.floor(n) + ' bis' : Math.floor(n) + String.fromCharCode(96 + f); };
    // hallazgos que el simulador revela al completar ciertos pasos (según el caso): D.hallazgo_pasos = { paso: campo del caso }
    const hallazgoDe = (n) => { const k = D.hallazgo_pasos && D.hallazgo_pasos[n]; const c = casoActual(); return k && c && c[k] ? c[k] : null; };
    const hallazgoTxt = (n) => { const h = hallazgoDe(n); return h ? `${(D.hallazgo_rotulos && D.hallazgo_rotulos[n]) || D.hallazgo_rotulo || '🔍 Observás:'} ${h}` : null; };
    // el equipo responde en voz alta (síntesis de voz), si la acreditación lo pide: D.voz
    const hablaPaso = (n) => { if (!D.voz || !window.AcrFX || !AcrFX.hablar) return; const h = hallazgoDe(n); if (h) AcrFX.hablar(h, (D.hallazgo_voz && D.hallazgo_voz[n]) || 'f'); };
    const porN = (n) => D.pasos.find((p) => p.n === n);
    const fraseDe = (q) => { const c = casoActual(); return (q.frases_caso && c && q.frases_caso[c.id]) || q.frase; };

    // ---- reconocimiento de lo que el alumno escribe en la bitácora (palabras clave por paso y por acción incorrecta)
    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    function reconocer(texto, sexo) {
      const tx = norm(texto).replace(/\bno desfibrilable/g, ' nodesfib ').replace(/\b(no|sin) (fuerzo|forzo|forzar|forzando|fuerza)\b/g, ' ').replace(/\b(no|sin) (descarg\w*|desfibril\w*|shock|choque|cardiovert\w*)/g, ' '); if (tx.length < 3) return null;
      const puntaje = (claves) => (claves || []).reduce((mx, g) => (g.every((f) => tx.includes(f)) ? Math.max(mx, g.join('').length) : mx), 0);
      const cc = casoActual(); const extra = (o) => (o.claves_caso && cc && o.claves_caso[cc.id]) || [];
      let mejor = null;
      // respuestas numéricas (cálculo de EG y FPP): un número distinto del correcto para el caso es una acción incorrecta
      D.distractores.forEach((d) => {
        if (!d.num || !cc) return; const T = ' ' + tx + ' '; if (d.num.requiere && !d.num.requiere.some((k) => T.includes(k))) return;
        const m = tx.match(new RegExp(d.num.re)); if (!m) return;
        const malo = d.num.campos.some((c, i) => m[i + 1] !== undefined && String(m[i + 1]) !== String(cc[c]) && !(c === 'eg_dias' && m[i + 1] === undefined));
        if (malo) mejor = { tipo: 'd', id: d.id, s: 99 };
      });
      if (mejor) return mejor;
      D.distractores.filter((d) => (!d.solo || d.solo === sexo) && (!d.solo_contra || conContra()) && (!d.solo_si || (casoActual() && casoActual()[d.solo_si])) && (!d.sin_si || !(casoActual() && casoActual()[d.sin_si]))).forEach((d) => { const s = puntaje((d.claves || []).concat(extra(d))); if (s && (!mejor || s > mejor.s)) mejor = { tipo: 'd', id: d.id, s }; });
      if (mejor) return mejor;
      D.pasos.filter((q) => aplica(q, sexo)).forEach((q) => { const s = puntaje((q.claves || []).concat(extra(q))); if (s && (!mejor || s > mejor.s)) mejor = { tipo: 'p', n: q.n, s }; });
      return mejor;
    }
    const chatHTML = (msgs, ph, titulo) => `<div class="acr-chat"><div class="acr-fase" style="margin-top:12px">${titulo}</div>
      <div class="acr-chat-log" id="acr-chat-log">${msgs.length ? msgs.map((m) => `<div class="m ${m.de} ${m.cls || ''}">${esc(m.txt)}</div>`).join('') : '<div class="m vacio">Escribí lo que vas haciendo y cómo lo hacés. Ej.: «me lavo las manos con técnica clínica».</div>'}</div>
      <form id="acr-chat-f" autocomplete="off"><input id="acr-chat-i" type="text" placeholder="${ph}" maxlength="220"><button type="button" id="acr-mic" class="acr-mic" title="Dictar por voz" aria-label="Dictar por voz">🎤</button><button class="acr-btn" type="submit">Enviar</button></form></div>`;
    // ---- dictado por voz (Web Speech API): cada frase reconocida se envía sola a la bitácora
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const VOZ = { rec: null, on: false, enviar: null };
    const pintarMic = () => { const b = $('#acr-mic'); if (!b) return; b.classList.toggle('on', VOZ.on); b.title = VOZ.on ? 'Dictado activo: tocá para detenerlo' : 'Dictar por voz'; b.textContent = VOZ.on ? '⏹' : '🎤'; };
    function detenerMic() { VOZ.on = false; try { VOZ.rec && VOZ.rec.stop(); } catch (_) {} VOZ.rec = null; pintarMic(); }
    function iniciarMic() {
      if (!SR) { toast('Tu navegador no admite el dictado por voz (probá con Chrome, Edge o Brave)', 'neutro'); return; }
      const rec = new SR(); VOZ.rec = rec; rec.lang = 'es-AR'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        const i = $('#acr-chat-i'); let parcial = '';
        for (let k = ev.resultIndex; k < ev.results.length; k++) {
          const r = ev.results[k]; const tx = r[0].transcript.trim();
          if (r.isFinal) { if (i) i.value = ''; if (tx && VOZ.enviar) VOZ.enviar(tx.slice(0, 220)); } else parcial += tx + ' ';
        }
        const inp = $('#acr-chat-i'); if (inp && parcial) inp.value = parcial.trim();
      };
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { toast('Permití el micrófono en el navegador para dictar', 'mal'); detenerMic(); }
        else if (e.error === 'audio-capture') { toast('No se encontró un micrófono', 'mal'); detenerMic(); }
      };
      rec.onend = () => { if (VOZ.on && VOZ.rec === rec) { try { rec.start(); } catch (_) { detenerMic(); } } };
      VOZ.on = true; try { rec.start(); } catch (_) { VOZ.on = false; } pintarMic();
      if (VOZ.on && window.AcrFX) AcrFX.sonido('pop');
    }
    setInterval(() => { if (VOZ.on && !document.getElementById('acr-chat-f')) detenerMic(); }, 1500);
    function enlazarChat(alEnviar) {
      const f = $('#acr-chat-f'); const log = $('#acr-chat-log'); if (log) log.scrollTop = log.scrollHeight;
      VOZ.enviar = alEnviar;
      if (f) f.onsubmit = (e) => { e.preventDefault(); const i = $('#acr-chat-i'); const v = i.value.trim(); if (!v) return; i.value = ''; alEnviar(v); };
      const mic = $('#acr-mic');
      if (mic) { if (!SR) { mic.classList.add('sin'); mic.title = 'Tu navegador no admite el dictado por voz'; } mic.onclick = () => { if (VOZ.on) detenerMic(); else iniciarMic(); }; pintarMic(); }
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
        <details class="acr-crit-wrap"><summary class="acr-crit-tit"><b>⚠ Criterios de desaprobación</b><span>Se aprueba con al menos ${D.umbral} % del puntaje y ningún paso crítico fallido · tocá para ver</span></summary>
          <div class="acr-crit-grid">${(D.criterios || D.pasos.filter((p) => p.critico).map((p) => ({ ico: p.ico, pasos: [p.n], titulo: p.corto || p.texto }))).map((c) => `<div class="acr-crit-card"><span class="ic">${c.ico || '⚠'}</span><div><small>${c.pasos.length > 1 ? 'Pasos' : 'Paso'} ${c.pasos.join(', ')}</small><b>${esc(c.titulo)}</b></div></div>`).join('')}</div></details>
      </div>
      <div class="acr-tabs" id="acr-tabs"></div>
      <div class="acr-tabs acr-sub-tabs" id="acr-subtabs"></div>
      <div id="acr-lectura"></div>
      <div class="acr-grid">
        <div><div class="acr-escena" id="acr-escena"></div><div class="acr-chips" id="acr-chips"></div></div>
        <aside class="acr-panel" id="acr-panel"></aside>
      </div>`;

    const SUBS = [['explorar', '🔎 Explorar'], ['guiado', '🎯 Guiado'], ['machete', '📌 Machete'], ['fundamentos', '📚 Fundamentos']];
    function pintarTabs() {
      const enExamen = S.modo === 'examen';
      $('#acr-tabs').innerHTML = `<button class="acr-tab ${!enExamen ? 'on' : ''}" data-modo="practica">🎓 Práctica</button><button class="acr-tab ${enExamen ? 'on' : ''}" data-modo="examen">📝 Examen</button>` +
        `<span class="acr-sexo" ${enExamen || S.sub === 'fundamentos' || new Set(D.casos.map((c) => c.sexo)).size < 2 ? 'hidden' : ''}><button data-sx="F" class="${S.sexo === 'F' ? 'on' : ''}">♀ Mujer</button><button data-sx="M" class="${S.sexo === 'M' ? 'on' : ''}">♂ Varón</button></span>`;
      if (ESC && !enExamen) $('#acr-tabs').insertAdjacentHTML('beforeend', '<button class="acr-tab sm" data-tut="1" style="margin-left:6px">❓ Cómo usar el 3D</button>');
      $('#acr-subtabs').hidden = enExamen;
      $('#acr-subtabs').innerHTML = SUBS.map(([k, l]) => `<button class="acr-tab sm ${S.sub === k ? 'on' : ''}" data-sub="${k}">${l}</button>`).join('');
    }

    // ---- escena
    let svg = null;
    function montarEscena(estatica) {
      document.body.classList.add('acr-en-escena');
      document.querySelector('.acr-grid').classList.remove('sin-escena');
      if (ESC.dispose) ESC.dispose();
      $('#acr-escena').innerHTML = ESC.build(S.sexo);
      svg = $('#acr-escena').firstElementChild;
      if (estatica) svg.classList.add('estatica');
      if (ESC.mount) ESC.mount(svg, S.sexo);
      if (D.monitor && window.AcrMonitor) { const cs = casoActual(); AcrMonitor.montar(svg, { ritmo: cs && cs.ritmo, refractaria: cs && cs.refractaria, dea: cs && cs.dea, metronomo: S.modo !== 'examen' }); }
      svg.onclick = null;
      svg.addEventListener('acr-ayuda', () => tutorial3D());
      svg.addEventListener('acr-full', pantallaCompleta);
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
      { const _c = casoActual(); svg.__caso = _c || D.casos[0] || null; if (_c && _c.liq) { svg.style.setProperty('--liq', _c.liq.color); svg.dataset.vol = _c.liq.vol || 'moderado'; svg.dataset.ml = _c.liq.ml || 30; } else { svg.dataset.vol = ''; } svg.dataset.contra = (_c && _c.contra) || ''; }
      if (ESC.sync) ESC.sync(svg);
      if (window.AcrMonitor && AcrMonitor.activo) AcrMonitor.estado(svg);
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
        ${fases.map((f) => `<div class="acr-fase">${esc(f.nombre)}</div>${f.pasos.map((p) => `<button class="acr-paso" data-paso="${p.n}"><span class="n">${etiquetaPaso(p.n)}</span><span>${esc(p.texto)} ${p.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</span></button>`).join('')}`).join('')}`;
      const ver = (n) => {
        const p = porN(n); S.paso = n;
        document.querySelectorAll('.acr-paso').forEach((b) => b.classList.toggle('sel', +b.dataset.paso === n));
        const { est, usados } = estadoHasta(n); aplicarEstado(est, usados); resaltar(p.target); marcarSel(null);
        $('#acr-detalle').innerHTML = `<div class="acr-info"><b>Paso ${etiquetaPaso(p.n)}${p.critico ? ' · ⚠ criterio de desaprobación' : ''}</b><br>${esc(p.explica)}</div>`;
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
        const mp = D.mesa_pasos || [1]; mp.forEach((n) => E.hechos.add(n)); E.i = mp.length;
        E.chat.push({ de: 'sis', cls: 'ok', txt: `✅ ${mp.length > 1 ? 'Pasos ' + mp.join(' y ') + ' registrados' : 'Paso 1 registrado'}: ya reuniste y preparaste el material en la mesa de instrumental.` });
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
    const fxPaso = (q, ding) => { if (!window.AcrFX || !q || !q.fx) return Promise.resolve(); return AcrFX.play(q.fx, { sexo: S.sexo, vel: S.velFx || 1, vp: document.querySelector('.acr3d-vp') }).then(() => { if (ding) AcrFX.sonido('ding'); }); };
    function completarPaso(q) {
      fxPaso(q, true); if (ESC && ESC.enfocar) ESC.enfocar(q.target);
      const E = S.ent; E.hechos.add(q.n);
      if (hallazgoTxt(q.n)) { E.chat.push({ de: 'sis', cls: 'neutro', txt: hallazgoTxt(q.n) }); hablaPaso(q.n); } E.esperando = false; resaltar(null);
      const { est, usados } = estadoHasta(q.n); aplicarEstado(est, usados);
      toast(`✔ Paso ${etiquetaPaso(q.n)} completado`, 'ok');
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
        if (q && !E.hechos.has(q.n)) { E.saltados.add(q.n); E.chat.push({ de: 'sis', cls: 'neutro', txt: `Paso ${etiquetaPaso(q.n)} saltado: en el examen un paso omitido cuenta en contra.` }); }
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
      if (r.n !== q.n && porN(r.n).gemelo === q.n) r.n = q.n;   // acciones que se repiten (p. ej. lavado de manos al inicio y al final)
      if (r.n === q.n) { E.chat.push({ de: 'sis', cls: 'ok', txt: `✅ Paso ${etiquetaPaso(q.n)} registrado.` }); completarPaso(q); return; }
      if (r.n < q.n && E.saltados.has(r.n)) {
        E.saltados.delete(r.n); E.hechos.add(r.n); E.chat.push({ de: 'sis', cls: 'ok', txt: `✅ Paso ${etiquetaPaso(r.n)} registrado (lo habías saltado).` });
        toast(`✔ Paso ${etiquetaPaso(r.n)} completado`, 'ok'); pintarGuiado(); return;
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
      const tl = E.lista.map((z, k) => `<button type="button" class="tl ${k === E.i ? 'cur' : ''} ${E.hechos.has(z.n) ? 'ok' : E.saltados.has(z.n) ? 'sk' : ''}" data-k="${k}" title="Paso ${etiquetaPaso(z.n)}${z.critico ? ' · crítico' : ''}">${z.n}</button>`).join('');
      $('#acr-panel').innerHTML = `
        <div class="acr-fase" style="margin-top:0">${esc(q.fase)} · paso ${E.i + 1} de ${tot}</div>
        <div class="acr-prog"><i style="width:${Math.round((E.hechos.size / tot) * 100)}%"></i></div>
        <div class="acr-tl">${tl}</div>
        <div class="acr-goal">${esc(q.texto)} ${q.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''} ${hecho ? '<span class="acr-hecho">✔ completado</span>' : ''}</div>
        ${hecho ? '<p>Este paso ya está completo. Podés avanzar o volver a revisarlo.</p>' : '<p>Tocá el elemento o la estructura con el que se realiza este paso, o escribí en la bitácora qué hacés.</p>'}
        ${chatHTML(E.chat, 'Contá qué hacés y cómo lo hacés…', '✍ Bitácora del procedimiento')}
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
        <small>Errores: ${E.errores} · Ayudas: ${E.pistas} · Saltados: ${E.saltados.size}</small>`;
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
      parar(); pintarLectura(false);
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
      iniciarTimerExamen(); mostrarCancelarEx();
      if (!D.instrumental) return examenCurso();
      try { await asegurarMesa(); } catch (e) { console.error(e); return examenCurso(); }
      $('#acr-panel').innerHTML = `<div class="acr-examen-bar"><span id="acr-reloj" class="acr-reloj">⏱ ${mmss(Math.max(0, S.ex.seg))}</span></div>`;
      $('#acr-panel').onclick = null;
      MESA.mount($('#acr-escena'), { modo: 'examen', caso: S.ex.caso,
        onValidar: (res) => {
          const X = S.ex; (D.mesa_pasos || [1]).forEach((n) => X.hechos.set(n, res.ok ? 'SI' : 'M'));
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
        if (e.target.id === 'acr-abandonar') { cancelarExamen(); return; }
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
        <div class="acr-row" style="margin-top:12px"><button class="acr-btn sec" id="acr-undo" ${X.hist && X.hist.length ? '' : 'disabled'}>↩ Deshacer última acción</button><button class="acr-btn bad" id="acr-fin">Finalizar examen</button><button class="acr-btn sec" id="acr-abandonar">✕ Cancelar examen</button></div>
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
        let n = +ref; if (X.hechos.has(n) && porN(n).gemelo && !X.hechos.has(porN(n).gemelo)) n = porN(n).gemelo;
        const q = porN(n);
        if (X.hechos.has(n)) { X.log.push({ tipo: 'repetida', n, texto: q.texto, grave: false, porque: 'Acción ya realizada.' }); }
        else {
          const previos = X.apl.filter((z) => z.n < n && !X.hechos.has(z.n));
          const enOrden = previos.length === 0;
          X.hechos.set(n, enOrden ? 'SI' : 'M'); snap.agrego = n; fxPaso(q, false); if (ESC && ESC.enfocar) ESC.enfocar(q.target);
          if (hallazgoTxt(n)) { X.chat.push({ de: 'sis', cls: 'neutro', txt: hallazgoTxt(n) }); hablaPaso(n); }
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
      const X = S.ex; if (X.fase !== 'curso' && X.fase !== 'mesa') return; X.fase = 'fin'; quitarCancelarEx(); parar(); if (MESA) MESA.dispose(); document.querySelector('.acr-grid').classList.remove('sin-escena'); svg = svg || $('#acr-escena');
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
      sinEscena(); const pn = $('#acr-panel'); pn.classList.add('informe');
      const perlaDe = (n) => (D.machete && D.machete.por_paso && D.machete.por_paso[n]) || '';
      const mejora = (q) => `<div class="inf-mejora"><b>💡 Cómo mejorarlo</b><p>${esc(perlaDe(q.n) || q.explica)}</p>${fraseDe(q) ? `<p class="inf-frase">🗣 Cómo decirlo en la bitácora: “${esc(fraseDe(q))}”</p>` : ''}</div>`;
      const nSI = filas.filter((f) => f.st === 'SI').length, nM = filas.filter((f) => f.st === 'M').length, nNO = filas.filter((f) => f.st === 'NO').length;
      const prioridades = [
        ...criticosFallidos.map((f) => ({ tit: `Paso ${etiquetaPaso(f.p.n)} · ${f.st === 'NO' ? 'omitido' : 'fuera de orden'} (crítico)`, que: f.p.texto, porque: f.p.explica, q: f.p })),
        ...gravesLog.filter((l) => l.tipo === 'incorrecta' || l.tipo === 'material').map((l) => ({ tit: l.tipo === 'material' ? (l.falta ? 'Material crítico faltante' : 'Material incorrecto grave') : 'Acción incorrecta grave', que: l.texto.replace(/^Falta: /, ''), porque: l.porque, q: null })),
      ];
      const etiquetaLog = (l) => l.tipo === 'rectificacion' ? 'Rectificación' : l.tipo === 'material' ? (l.falta ? 'Material faltante' : 'Material incorrecto') : l.tipo === 'incorrecta' ? 'Acción incorrecta' : l.tipo === 'orden' ? 'Orden alterado' : 'Acción repetida';
      const anillo = (v, ok) => { const r = 54, c = 2 * Math.PI * r; return `<svg class="inf-anillo" viewBox="0 0 130 130"><circle cx="65" cy="65" r="${r}" class="fondo"/><circle cx="65" cy="65" r="${r}" class="${ok ? 'ok' : 'mal'}" style="stroke-dasharray:${c};stroke-dashoffset:${c * (1 - v / 100)}"/><text x="65" y="72" text-anchor="middle">${v}%</text></svg>`; };
      const fila = (f) => {
        const ant = f.st === 'M' ? filas.filter((z) => z.p.n < f.p.n && z.st === 'NO').map((z) => z.p.n) : [];
        const estado = f.st === 'SI' ? ['ok', 'Correcto, en orden'] : f.st === 'M' ? ['med', 'Hecho, pero fuera de orden (vale 0,5)'] : ['mal', 'Omitido'];
        return `<details class="inf-paso ${estado[0]}" ${f.st === 'SI' ? '' : 'open'}><summary><span class="n">${etiquetaPaso(f.p.n)}</span><span class="t">${esc(f.p.texto)} ${f.p.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</span><span class="b ${estado[0]}">${f.st === 'SI' ? '✔ SÍ' : f.st === 'M' ? '± Orden' : '✖ NO'}</span></summary>
          <div class="inf-det"><p><b>${estado[1]}.</b>${ant.length ? ` Lo hiciste antes de completar el/los paso(s) ${ant.join(', ')}.` : ''}</p>
          <p><b>Por qué importa:</b> ${esc(f.p.explica)}</p>${f.st === 'SI' ? '' : mejora(f.p)}</div></details>`;
      };
      pn.innerHTML = `<div class="inf">
        <div class="inf-cab ${aprobado ? 'ap' : 'de'}">
          <div class="inf-ribbon">⭐ Informe detallado NikaMed+</div>
          ${anillo(pct, aprobado)}
          <div><h2>${aprobado ? 'ACREDITADO' : 'NO ACREDITADO'}</h2>
            <p>${esc(D.titulo)} · caso de ${esc(X.caso.nombre || 'paciente')} (${X.caso.sexo === 'F' ? 'mujer' : 'varón'}, ${X.caso.edad} años)</p>
            <p class="inf-sub">${aprobado ? 'Cumpliste el umbral y ningún criterio de desaprobación.' : (criticosFallidos.length || gravesLog.length ? 'Desaprobado por criterio crítico, aunque el puntaje cuente.' : `No alcanzaste el umbral de ${D.umbral}%.`)}${porTiempo ? ' · Se agotó el tiempo.' : ''}</p></div>
        </div>
        <div class="inf-stats">
          <div><b>${mmss(usado)}</b><span>de ${mmss(X.t * 60)}</span></div><div class="ok"><b>${nSI}</b><span>pasos correctos</span></div><div class="med"><b>${nM}</b><span>fuera de orden</span></div><div class="mal"><b>${nNO}</b><span>omitidos</span></div><div class="mal"><b>${X.log.filter((l) => l.tipo !== 'rectificacion').length}</b><span>errores de acción</span></div><div><b>${gravesLog.length}</b><span>infracciones graves</span></div>
        </div>
        <div class="inf-calculo"><b>Cómo se calculó:</b> base ${Math.round(baseP)}% (pasos en orden = 1, fuera de orden = 0,5) − ${resta} punto${resta === 1 ? '' : 's'} por errores (${pen.penalizacion_incorrecta} por acción incorrecta, ${pen.penalizacion_repetida} por repetida o rectificación) = <b>${pct}%</b>. Umbral ${D.umbral}%.</div>
        ${prioridades.length ? `<h3 class="inf-h">🚨 Qué corregir primero</h3><div class="inf-prio">${prioridades.map((x) => `<div class="inf-card mal"><h4>${esc(x.tit)}</h4><p><b>Qué pasó:</b> ${esc(x.que)}</p><p><b>Por qué es grave:</b> ${esc(x.porque)}</p>${x.q ? mejora(x.q) : '<div class="inf-mejora"><b>💡 Cómo mejorarlo</b><p>Repasá este punto en Fundamentos y practicá el recorrido guiado antes de volver a rendir.</p></div>'}</div>`).join('')}</div>` : '<div class="acr-info bien">Sin criterios críticos fallidos. ¡Muy bien!</div>'}
        ${X.log.length ? `<h3 class="inf-h">⚠ Errores de acción y de material (${X.log.length})</h3><div class="inf-prio">${X.log.map((l) => { const q = l.n ? porN(l.n) : null; return `<div class="inf-card ${l.grave ? 'mal' : 'med'}"><h4>${etiquetaLog(l)}${l.grave ? ' · grave' : ''}</h4><p><b>Registro:</b> ${esc(l.texto)}</p><p><b>Por qué:</b> ${esc(l.porque)}</p>${q ? mejora(q) : ''}</div>`; }).join('')}</div>` : '<h3 class="inf-h">⚠ Errores de acción</h3><div class="acr-info bien">No registraste errores de acción ni de orden.</div>'}
        <h3 class="inf-h">📋 Revisión paso a paso (${X.apl.length} pasos)</h3>
        <div class="inf-pasos">${filas.map(fila).join('')}</div>
        <h3 class="inf-h">🎯 Plan para el próximo intento</h3>
        <ul class="acr-refs">${nNO || nM || X.log.length ? `${nNO ? `<li>Practicá en modo guiado los pasos omitidos: ${filas.filter((f) => f.st === 'NO').map((f) => f.p.n).join(', ')}.</li>` : ''}${nM ? `<li>Respetá el orden de la lista de cotejo: de lo limpio a lo estéril.</li>` : ''}${X.log.length ? '<li>Escribí en la bitácora solo lo que realmente hacés y revisá el material de la mesa según el caso (sexo, calibre, alergias).</li>' : ''}` : '<li>Repetí el examen con otro caso y sexo para consolidar.</li>'}<li>Repasá la pestaña Machete y Fundamentos antes de reintentar.</li></ul>
        <div class="acr-row"><button class="acr-btn" id="acr-otra">Nuevo intento</button><button class="acr-btn sec" id="acr-prac">Practicar</button><button class="acr-btn sec" id="acr-fund">Ver fundamentos</button></div>
      </div>`;
      pn.onclick = (e) => {
        if (e.target.id === 'acr-otra') { pn.classList.remove('informe'); examenInicio(); }
        if (e.target.id === 'acr-prac') { pn.classList.remove('informe'); S.modo = 'practica'; S.sub = 'guiado'; ir(); }
        if (e.target.id === 'acr-fund') { pn.classList.remove('informe'); S.modo = 'practica'; S.sub = 'fundamentos'; ir(); }
      };
      pn.classList.remove('pn-in'); window.scrollTo({ top: Math.max(0, pn.getBoundingClientRect().top + scrollY - 90), behavior: 'smooth' });
    }

    // ---- DEMOSTRACIÓN: la acreditación modelo, de punta a punta y bien hecha
    const dormir = (ms, dem) => new Promise((ok) => { dem.despertar = ok; dem.t = setTimeout(ok, ms); });
    function cerrarDemo(dem) { if (!dem) return; dem.cancel = true; if (window.AcrFX) AcrFX.quitar(); dem.alSaltar && dem.alSaltar(); clearTimeout(dem.t); if (dem.despertar) dem.despertar(); if (MESA) MESA.dispose(); S.demo = null; document.onkeydown = null; const pn = document.getElementById('acr-panel'); if (pn) pn.classList.remove('demo'); try { localStorage.setItem('nika_acr_demo_v1', '1'); } catch (_) {} }
    async function demoModelo() {
      parar(); pintarLectura(false); if (S.demo) cerrarDemo(S.demo);
      sinEscena(); $('#acr-panel').innerHTML = ''; window.scrollTo({ top: 0, behavior: 'smooth' });
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
      dem.vel = dem.vel || 1;
      // espera que respeta pausa y velocidad; se corta al saltar de paso o cancelar
      const pausable = async (ms) => { let t = 0; while (t < ms && !dem.cancel && !dem.salto) { await dormir(50, dem); if (!dem.pausa) t += 50 * dem.vel; } };
      const cambiar = (k) => { dem.k = Math.max(0, Math.min(N - 1, k)); dem.salto = true; dem.final = false; dem.alSaltar && dem.alSaltar(); dem.despertar && dem.despertar(); };
      const sync = () => {
        const bp = $('#demo-pausa'); if (bp) { bp.innerHTML = dem.pausa ? '▶ Continuar' : '⏸ Pausar'; bp.classList.toggle('on', dem.pausa); }
        const bv = $('#demo-vel'); if (bv) bv.textContent = `⚡ ${dem.vel}×`;
        const bar = $('#demo-bar'); if (bar) bar.classList.toggle('en-pausa', dem.pausa);
      };
      panel.onclick = (e) => {
        const b = e.target.closest('[data-d]'); if (!b) return; const a = b.dataset.d;
        if (a === 'pausa') { dem.pausa = !dem.pausa; sync(); if (!dem.pausa && dem.despertar) dem.despertar(); }
        else if (a === 'vel') { const v = [0.5, 1, 1.5, 2, 4]; dem.vel = v[(v.indexOf(dem.vel) + 1) % v.length]; sync(); }
        else if (a === 'ant') cambiar(dem.k - 1);
        else if (a === 'sig') cambiar(dem.k + 1);
        else if (a === 'reiniciar') cambiar(0);
        else if (a === 'saltar') { cerrarDemo(dem); portada(); }
        else if (a === 'practicar') { cerrarDemo(dem); S.modo = 'practica'; S.sub = 'guiado'; S.mesaOk = false; mostrarMesaPractica(); }
        else if (a === 'examen') { cerrarDemo(dem); S.modo = 'examen'; ir(); }
        else if (a === 'otra') { demoModelo(); }
      };
      panel.classList.add('demo');
      document.onkeydown = (e) => {
        if (!S.demo || S.demo !== dem || /INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return;
        if (e.key === ' ') { e.preventDefault(); $('#demo-pausa')?.click(); } else if (e.key === 'ArrowLeft') $('[data-d="ant"]')?.click(); else if (e.key === 'ArrowRight') $('[data-d="sig"]')?.click();
      };
      while (dem.k < N && !dem.cancel) {
        const k = dem.k; const q = lista[k]; dem.salto = false;
        const prev = lista[k - 1]; if (prev) { const { est, usados } = estadoHasta(prev.n); aplicarEstado(est, usados); } else aplicarEstado({}, []);
        const hist = lista.slice(0, k).map((z) => `<div class="m yo">${esc(fraseDe(z))}</div><div class="m sis ok">✅ Paso ${etiquetaPaso(z.n)} registrado.</div>`).join('');
        panel.innerHTML = `<div class="demo-cab"><span class="acr-demo-tag">▶ DEMOSTRACIÓN · así se hace una acreditación aprobada</span></div>
          <div class="demo-bar${dem.pausa ? ' en-pausa' : ''}" id="demo-bar">
            <button class="db" data-d="ant" title="Paso anterior (←)" ${k === 0 ? 'disabled' : ''}>⏮</button>
            <button class="db pri${dem.pausa ? ' on' : ''}" id="demo-pausa" data-d="pausa" title="Pausar / continuar (espacio)">${dem.pausa ? '▶ Continuar' : '⏸ Pausar'}</button>
            <button class="db" data-d="sig" title="Paso siguiente (→)" ${k === N - 1 ? 'disabled' : ''}>⏭</button>
            <button class="db" id="demo-vel" data-d="vel" title="Velocidad">⚡ ${dem.vel}×</button>
            <button class="db" data-d="reiniciar" title="Empezar la demostración de nuevo">↺</button>
            <button class="db x" data-d="saltar" title="Cancelar la demostración">✕ Cancelar</button>
          </div>
          <div class="demo-info"><div class="acr-fase">${esc(q.fase)} · paso ${k + 1} de ${N}</div>
            <div class="acr-prog"><i style="width:${Math.round((k / N) * 100)}%"></i></div>
            <div class="acr-goal">${esc(q.texto)} ${q.critico ? '<span class="acr-crit">⚠ crítico</span>' : ''}</div></div>
          <div class="acr-chat demo-chat"><div class="acr-fase">✍ Bitácora (escrita por el alumno modelo)</div>
            <div class="acr-chat-log" id="acr-chat-log">${hist}<div class="m yo" id="demo-typing"></div></div></div>
          <div class="acr-info bien" id="demo-expl" style="opacity:0">✅ <b>Paso ${etiquetaPaso(q.n)}.</b> ${esc(q.explica)}</div>`;
        animarPanel(); resaltar(q.target);
        const log = $('#acr-chat-log'); const abajo = () => { log.scrollTop = log.scrollHeight; }; abajo();
        await pausable(800); if (dem.cancel) return; if (dem.salto) continue;
        const caja = $('#demo-typing');
        for (const ch of fraseDe(q)) { if (dem.cancel || dem.salto) break; while (dem.pausa && !dem.cancel && !dem.salto) await dormir(200, dem); caja.textContent += ch; abajo(); await dormir(Math.max(3, 24 / dem.vel), dem); }
        if (dem.cancel) return; if (dem.salto) continue;
        log.insertAdjacentHTML('beforeend', `<div class="m sis ok">✅ Paso ${etiquetaPaso(q.n)} registrado.</div>${hallazgoTxt(q.n) ? `<div class="m sis neutro">${esc(hallazgoTxt(q.n))}</div>` : ''}`); abajo(); hablaPaso(q.n);
        S.velFx = dem.vel; const fxp = fxPaso(q, true); const { est, usados } = estadoHasta(q.n); aplicarEstado(est, usados); resaltar(null);
        await Promise.race([fxp, new Promise((ok) => { dem.alSaltar = ok; })]);
        const ex = $('#demo-expl'); if (ex) { ex.style.transition = 'opacity .5s'; ex.style.opacity = 1; }
        toast(`✔ Paso ${etiquetaPaso(q.n)}`, 'ok');
        await pausable(q.critico ? 3600 : 2800); if (dem.cancel) return; if (dem.salto) continue;
        dem.k++;
      }
      if (dem.cancel) return;
      document.onkeydown = null; panel.classList.remove('demo');
      try { localStorage.setItem('nika_acr_demo_v1', '1'); } catch (_) {}
      panel.innerHTML = `<div class="acr-final"><div class="acr-final-ico">🏆</div><h3>Así se ve una acreditación aprobada</h3>
        <div class="acr-info bien">Cumplió los <b>${N} pasos</b> en orden, con los ${D.pasos.filter((p) => p.critico).length} pasos críticos resueltos y sin acciones incorrectas.</div>
        <ul class="acr-refs"><li><b>Mesa:</b> bandeja completa según el caso clínico (sexo, calibre y alergias), sin elementos de más.</li>
          <li><b>Orden:</b> respetar la secuencia de la lista de cotejo, de lo limpio a lo estéril.</li>
          <li><b>Críticos:</b> ${esc(D.final_criticos || 'consentimiento, lavado de manos, guantes estériles, prueba del balón y registro')}.</li>
          <li><b>Bitácora:</b> contá lo que hacés y cómo lo hacés; en el examen no hay ayudas.</li></ul>
        <div class="acr-row"><button class="acr-btn" data-d="practicar">Practicar ahora →</button><button class="acr-btn sec" data-d="examen">Rendir el examen</button><button class="acr-btn sec" data-d="otra">Ver de nuevo</button></div></div>`;
      animarPanel(); resaltar(null);
    }

    // ---- portada (sin cargar nada pesado) y navegación
    function portada() {
      parar(); quitarCancelarEx(); detenerMic(); document.body.classList.remove('acr-en-escena'); if (window.AcrMonitor) AcrMonitor.detener(); pintarLectura(true);
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
      parar(); if (S.modo !== 'examen') quitarCancelarEx();
      if (S.modo === 'examen' || !(S.modo === 'practica' && S.sub === 'guiado' && !S.mesaOk)) pintarLectura(false);
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
      else if (s) {
        const sx = s.dataset.sx;
        if (S.demo) cerrarDemo(S.demo);
        if (!S.caso || S.caso.sexo !== sx) { const c = D.casos.filter((z) => z.sexo === sx); if (c.length) { S.caso = azar(c); S.mesaOk = false; if (MESA) MESA.dispose(); } }
        S.sexo = sx; ir();
      }
    };
    $('#acr-subtabs').onclick = (e) => { const b = e.target.closest('[data-sub]'); if (b) { S.sub = b.dataset.sub; ir(); } };
    ir();
  }

  (id ? vistaAtlas() : vistaLista()).catch((e) => {
    console.error('[Acreditaciones]', e);
    app.innerHTML = '<p class="acr-sub">No se pudo cargar esta acreditación. Probá de nuevo en unos minutos.</p>';
  });
})();
