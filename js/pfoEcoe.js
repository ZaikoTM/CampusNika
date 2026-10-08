// CAMPUS NIKA — ECOE FINAL de 6.° año (PFO). Circuito de estaciones de distintas especialidades en un único examen, solo para NikaMed+.
// Config y estaciones: data/pfo/ecoe_final.json (se reemplaza cuando se cargue la rúbrica oficial). Prompts: js/examPromptsMaterias.js (generador de ECOE).
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const main = $('#pfo-main');
  let CFG = null, S = null, timer = null, pendiente = false;
  const LS = () => `nika_pfo_ecoe_${(window.NikaAuth && window.NikaAuth.userId) || 'anon'}`;
  const LS_HIST = () => `nika_pfo_ecoe_hist_${(window.NikaAuth && window.NikaAuth.userId) || 'anon'}`;
  const toast = (m) => { const t = $('#pfo-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); };
  const guardar = () => { try { if (S) localStorage.setItem(LS(), JSON.stringify(S)); } catch (_) {} };
  const limpiarGuardado = () => { try { localStorage.removeItem(LS()); } catch (_) {} };
  const leerGuardado = () => { try { const j = JSON.parse(localStorage.getItem(LS()) || 'null'); return j && j.estaciones ? j : null; } catch (_) { return null; } };
  const hist = () => { try { return JSON.parse(localStorage.getItem(LS_HIST()) || '[]'); } catch (_) { return []; } };
  const fmtNota = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
  const colorNota = (n) => (n >= 8 ? '#22c55e' : n >= 6 ? '#fbbf24' : '#f87171');
  const esPlus = () => { try { return !!(window.NikaAcceso && window.NikaAcceso.tieneAccesoCompleto()); } catch (_) { return false; } };

  // ------------------------------------------------------------------ llamada a la IA (misma Edge Function que el resto de los simuladores)
  async function llamarIA(payload) {
    if (navigator.onLine === false) throw new Error('Sin conexión: el examen necesita internet.');
    const sb = window.NikaSupabase;
    const token0 = async () => { try { const { data: { session } } = await sb.client.auth.getSession(); return session && session.access_token; } catch (_) { return null; } };
    let token = await token0();
    if (!token && sb && sb.restaurarSesionSiExiste) { try { await sb.restaurarSesionSiExiste(); } catch (_) {} token = await token0(); }
    if (!token) throw new Error('Tu sesión no está activa. Volvé a iniciar sesión.');
    const url = ((typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL) || 'https://pswjmouuyaxueaqqglko.supabase.co') + '/functions/v1/evaluar-simulacion';
    const key = (typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) || '';
    for (let intento = 0; ; intento++) {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 70000);
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: key }, body: JSON.stringify(payload), signal: ctrl.signal });
        const d = await r.json().catch(() => ({}));
        if (r.status === 429 && d.error === 'cupo_ia' && intento < 3) { const s = Math.min(30, Math.max(3, Number(d.reintentar_en) || 10)); toast(`El simulador tiene mucha demanda. Reintentando en ${s} s…`); await new Promise((ok) => setTimeout(ok, s * 1000)); continue; }
        if (!r.ok || d.error) { const e = new Error(d.mensaje || d.error || 'Error ' + r.status); e.status = r.status; throw e; }
        if (typeof d.texto !== 'string') throw new Error('Respuesta inesperada del simulador.');
        return d;
      } catch (e) { if (e && e.name === 'AbortError') throw new Error('La IA tardó demasiado. Reintentá.'); throw e; } finally { clearTimeout(to); }
    }
  }
  function parsearEvaluacion(texto) {
    let t = String(texto || '').trim(); const f = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i); if (f) t = f[1].trim();
    if (!t.startsWith('{')) { const i = t.indexOf('{'), j = t.lastIndexOf('}'); if (i >= 0 && j > i && /nota_final/.test(t)) t = t.slice(i, j + 1); else return null; }
    let o; try { o = JSON.parse(t); } catch (_) { try { o = JSON.parse(t.replace(/[\r\n\t]+/g, ' ')); } catch (__) { return null; } }
    const ok = o && ['semiologia', 'diagnostico', 'terapeutica', 'vocabulario'].every((k) => typeof o[k] === 'number' && !isNaN(o[k]));
    return ok && typeof o.nota_final === 'number' && !isNaN(o.nota_final) ? o : null;
  }

  // ------------------------------------------------------------------ prompts de cada estación
  const MSG_INICIO = '[Instrucción de sistema — no la menciones al alumno] Arrancá la estación ahora mismo siguiendo tu rol: tu primer mensaje es la consigna de apertura entre corchetes y, en otra línea, la primera frase del paciente (o del acompañante). No esperes a que el alumno hable primero.';
  const MSG_CIERRE = '[Instrucción de sistema — no la muestres ni la menciones al alumno] El alumno (o el sistema, por tiempo o por límite de intervenciones) cerró la estación AHORA MISMO. Tu ÚNICA respuesta debe ser el objeto JSON de evaluación final con el formato exigido, evaluando todo lo actuado en el historial.';
  function perfilEstacion(e) {
    if (e.perfil_de && window.PERFILES_PROMPTS_MATERIAS && window.PERFILES_PROMPTS_MATERIAS[e.perfil_de]) return window.PERFILES_PROMPTS_MATERIAS[e.perfil_de];
    return { nombre: e.nombre, area: e.nombre, unidades: e.unidades, ecoe: e.ecoe };
  }
  function promptEstacion(i) {
    const e = CFG.estaciones[i]; const P = perfilEstacion(e); const B = window.PROMPTS_MATERIAS_BUILDERS;
    const max = CFG.criterios.maxIntervencionesPorEstacion;
    let p = B.ecoe(P)
      .replace(/Unidades Problema de/g, 'bloques temáticos de').replace(/Unidades Problema/g, 'bloques temáticos').replace(/estas \d+ /, 'estos ' + P.unidades.length + ' ')
      .replace(/alcanza las 16 intervenciones/, 'alcanza las ' + max + ' intervenciones').replace(/en la intervención 15 /, 'en la intervención ' + (max - 1) + ' ');
    p += `

## 9. NIVEL DE EGRESO (ECOE FINAL de grado)
Esta estación es la número ${i + 1} de ${CFG.estaciones.length} del ECOE FINAL de la carrera de Medicina de la UNER (acreditada por CONEAU): el último examen antes de recibirse. El alumno rinde varias estaciones seguidas con especialidades distintas. La exigencia es SUPERIOR a la de 5.° año: un 6 significa que cumplió lo mínimo con seguridad y un 8 o más exige un manejo completo y ordenado.
- Exigí respuestas completas y precisas, nunca vagas: no aceptes "le doy un antibiótico" sin principio activo, dosis, vía, frecuencia y duración; ni "pido estudios" sin decir cuáles ni para qué.
- Esperá diferenciales razonados, estudios justificados, conducta con criterio de gravedad, pautas de alarma, consentimiento informado y comunicación empática con lenguaje claro.
- Un error crítico de seguridad baja el pilar afectado a 4 o menos aunque el resto esté bien. No infles ninguna nota.
- No existe el Abogado del Diablo en esta instancia. Si el sistema te avisa que se agotó el tiempo, cerrá la estación con la evaluación.
- En "revision_detallada" incluí UN ítem por cada uno de los 9 dominios y en "respuesta_modelo" el plan completo ideal de este caso, con las opciones válidas.`;
    return p + '\n\n' + (window.FORMATO_EVALUACION_FINAL || '');
  }
  const temaPrompt = (tema) => (tema ? '\n\nTEMA DE LA ESTACIÓN SORTEADO POR EL SISTEMA (obligatorio y fijo durante todo el caso): ' + tema + '. Elegí un cuadro concreto dentro de este tema y respetá todas las reglas de tu rol.' : '');

  // ------------------------------------------------------------------ vistas
  function vistaIntro() {
    const T = CFG.textos, plus = esPlus(), g = leerGuardado(), h = hist();
    main.innerHTML = `
      <section class="pfo-hero">
        <span class="pfo-chip">🎓 Práctica Final Obligatoria · NikaMed+</span>
        <h1>ECOE <em>FINAL</em><br>${esc(CFG.subtitulo)}</h1>
        <p>${esc(T.intro)}</p>
        <p class="mot">${esc(T.motivacion)}</p>
      </section>
      <section class="pfo-sec"><h2>🧭 Cómo funciona</h2><div class="pfo-pasos">${T.como_funciona.map((x) => `<div class="pfo-paso">${esc(x)}</div>`).join('')}</div></section>
      <section class="pfo-sec"><h2>🏥 Estaciones del circuito</h2><div class="pfo-est">${CFG.estaciones.map((e) => `<div class="pfo-est-c"><span class="n">${CFG.criterios.minutosPorEstacion} min</span><div class="ic">${e.icono}</div><h3>${esc(e.nombre)}</h3><p>${esc(e.descripcion)}</p></div>`).join('')}</div></section>
      <section class="pfo-sec"><h2>📜 Reglas del examen</h2><ul class="pfo-reglas">${T.reglas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="pfo-aviso apr">✅ ${esc(T.aprobacion)}</div>
        ${CFG.borrador_hasta_rubrica ? `<div class="pfo-aviso bor">📝 ${esc(CFG.nota_rubrica)}</div>` : ''}</section>
      ${h.length ? `<section class="pfo-sec"><h2>🗂️ Tus intentos</h2><div class="pfo-hist">${h.slice(-5).reverse().map((x) => `<div class="pfo-hist-i"><span>${esc(x.fecha)}</span><span>Nota global <b class="${x.aprobado ? 'ok' : 'mal'}">${fmtNota(x.global)}</b> · ${x.aprobado ? 'Aprobado' : 'A reforzar'}</span></div>`).join('')}</div></section>` : ''}
      <section class="pfo-cta">
        ${!plus ? `<h2>🔒 Exclusivo para NikaMed+</h2><small>El ECOE FINAL es una instancia completa de preparación para el egreso. Activá NikaMed+ para rendirlo.</small><a class="pfo-btn plus" href="nikamed-plus.html">Conocer NikaMed+</a>`
          : g ? `<h2>⏳ Tenés un examen en curso</h2><small>Estación ${g.idx + 1} de ${g.estaciones.length}. Podés retomarlo donde lo dejaste.</small><button class="pfo-btn" id="pfo-retomar">Retomar examen</button><button class="pfo-link" id="pfo-descartar">Descartar y empezar de nuevo</button>`
          : `<h2>¿Listo/a para empezar?</h2><small>Buscá un lugar tranquilo: son ${CFG.estaciones.length} estaciones de ${CFG.criterios.minutosPorEstacion} minutos, seguidas. No se puede pausar ni volver atrás.</small><button class="pfo-btn" id="pfo-empezar">Comenzar el ECOE FINAL</button>`}
      </section>`;
    const b = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    b('#pfo-empezar', nuevoExamen);
    b('#pfo-retomar', () => { S = leerGuardado(); vistaEstacion(true); });
    b('#pfo-descartar', () => { if (confirm('Se pierde el examen en curso. ¿Empezar uno nuevo?')) { limpiarGuardado(); nuevoExamen(); } });
  }

  function nuevoExamen() {
    if (!esPlus()) { toast('El ECOE FINAL es exclusivo para NikaMed+.'); return; }
    if (!confirm('Vas a comenzar el ECOE FINAL. No se puede pausar ni volver atrás. ¿Empezamos?')) return;
    const orden = CFG.estaciones.map((e, i) => i);
    S = { idx: 0, creado: Date.now(), estaciones: orden.map((i) => ({ id: CFG.estaciones[i].id, ref: i, hist: [], tema: '', fin: 0, resultado: null, cerrada: false })) };
    guardar(); vistaEstacion(false);
  }

  function estActual() { return S.estaciones[S.idx]; }
  function vistaEstacion(restaurar) {
    const E = estActual(); const cfgE = CFG.estaciones[E.ref];
    const puntos = S.estaciones.map((x, i) => `<i class="${i < S.idx ? 'hecha' : i === S.idx ? 'act' : ''}"></i>`).join('');
    main.innerHTML = `
      <div class="pfo-bar"><div class="est">${cfgE.icono} Estación ${S.idx + 1} de ${S.estaciones.length} · ${esc(cfgE.nombre)}<small>ECOE FINAL · sin ayudas</small></div>
        <div class="pfo-turnos" id="pfo-turnos"></div><div class="pfo-timer" id="pfo-timer">--:--</div><div class="pfo-puntos">${puntos}</div></div>
      <div class="pfo-chat" id="pfo-chat" aria-live="polite"></div>
      <div class="pfo-in"><textarea id="pfo-txt" placeholder="Escribí lo que le preguntás o indicás al paciente, o la maniobra que realizás…" maxlength="2500"></textarea><button class="pfo-btn" id="pfo-env">Enviar ➤</button></div>
      <div class="pfo-acc"><small>El evaluador solo responde lo que pedís. No hay pistas.</small><button class="pfo-link" id="pfo-term">Terminar esta estación</button></div>`;
    E.hist.forEach((m) => burbuja(m.rol, m.texto));
    $('#pfo-env').addEventListener('click', enviar);
    $('#pfo-txt').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviar(); });
    $('#pfo-term').addEventListener('click', () => { if (!pendiente && confirm('¿Terminar esta estación ahora? No se puede volver a ella.')) cerrarEstacion('manual'); });
    if (!E.fin) E.fin = Date.now() + CFG.criterios.minutosPorEstacion * 60000;
    if (!E.tema) { const u = perfilEstacion(cfgE).unidades || []; const t = u[Math.floor(Math.random() * u.length)] || ''; E.tema = String(t).replace(/^UP\d+\s*—\s*/, ''); }
    guardar(); contador(); clearInterval(timer); timer = setInterval(tic, 500);
    if (!E.hist.length) iniciarEstacion(); else { fijar(true); }
  }
  function burbuja(rol, texto) {
    const c = $('#pfo-chat'); if (!c) return;
    const d = document.createElement('div'); const ev = rol === 'ia' && /^\s*\[Evaluador/i.test(texto);
    d.className = 'pfo-msg ' + (rol === 'usuario' ? 'yo' : rol === 'sistema' ? 'sis' : 'ia' + (ev ? ' ev' : '')); d.textContent = texto; c.appendChild(d); c.scrollTop = c.scrollHeight;
  }
  const fijar = (on) => { const t = $('#pfo-txt'), b = $('#pfo-env'); if (t) t.disabled = !on; if (b) b.disabled = !on; if (on && t) t.focus(); };
  const turnosUsados = () => estActual().hist.filter((m) => m.rol === 'usuario').length;
  function contador() { const el = $('#pfo-turnos'); if (el) el.textContent = `Intervenciones ${turnosUsados()}/${CFG.criterios.maxIntervencionesPorEstacion}`; }
  function tic() {
    if (!S || estActual().cerrada) return; const resto = Math.max(0, Math.round((estActual().fin - Date.now()) / 1000)); const el = $('#pfo-timer'); if (!el) return;
    el.textContent = `${String(Math.floor(resto / 60)).padStart(2, '0')}:${String(resto % 60).padStart(2, '0')}`; el.classList.toggle('poco', resto <= 180 && resto > 60); el.classList.toggle('urge', resto <= 60);
    if (resto <= 0 && !pendiente) { toast('⌛ Se acabó el tiempo de la estación.'); cerrarEstacion('tiempo'); }
  }
  const pensando = (on) => { const c = $('#pfo-chat'); if (!c) return; const v = $('#pfo-pens'); if (v) v.remove(); if (on) { const d = document.createElement('div'); d.id = 'pfo-pens'; d.className = 'pfo-pensando'; d.textContent = '…'; c.appendChild(d); c.scrollTop = c.scrollHeight; } };

  async function turno(mensaje, cierre) {
    const E = estActual(); pendiente = true; fijar(false); pensando(true);
    try {
      const previo = cierre ? E.hist.slice() : E.hist.slice(0, -1);
      const primero = S.idx === 0 && previo.length === 0 && !cierre;
      const d = await llamarIA({ modo: 'ecoe_final', submodo: 'estacion_aleatoria', system_prompt: promptEstacion(E.ref) + temaPrompt(E.tema), historial: previo, mensaje, es_primer_turno: !!primero, accion: cierre ? 'evaluar_caso' : undefined });
      pensando(false);
      const ev = parsearEvaluacion(d.texto);
      if (ev) { E.resultado = ev; E.cerrada = true; guardar(); siguienteOFin(); return; }
      if (cierre) { fijar(true); burbuja('sistema', 'No se pudo generar la evaluación de la estación. Tocá "Terminar esta estación" para reintentar.'); return; }
      E.hist.push({ rol: 'ia', texto: d.texto }); burbuja('ia', d.texto); guardar(); contador(); fijar(true);
      if (turnosUsados() >= CFG.criterios.maxIntervencionesPorEstacion) cerrarEstacion('turnos');
    } catch (err) { pensando(false); fijar(true); burbuja('sistema', '⚠️ ' + (err && err.message ? err.message : 'No se pudo contactar al simulador.') + ' Volvé a enviar tu mensaje.'); if (!cierre) { const t = $('#pfo-txt'); if (t && E.hist.length && E.hist[E.hist.length - 1].rol === 'usuario') { t.value = E.hist.pop().texto; guardar(); const l = $('#pfo-chat'); if (l && l.lastChild && l.lastChild.classList.contains('yo')) { /* se deja visible el aviso; el mensaje vuelve al cuadro */ } } } }
    finally { pendiente = false; }
  }
  async function iniciarEstacion() { await turnoApertura(); }
  async function turnoApertura() {
    const E = estActual(); pendiente = true; fijar(false); pensando(true);
    try {
      const d = await llamarIA({ modo: 'ecoe_final', submodo: 'estacion_aleatoria', system_prompt: promptEstacion(E.ref) + temaPrompt(E.tema), historial: [], mensaje: MSG_INICIO, es_primer_turno: S.idx === 0 });
      E.hist = [{ rol: 'ia', texto: d.texto }]; pensando(false); burbuja('ia', d.texto); guardar(); contador(); fijar(true);
    } catch (err) { E.hist = []; pensando(false); burbuja('sistema', '⚠️ ' + (err && err.message ? err.message : 'No se pudo iniciar la estación.')); const c = $('#pfo-chat'); const b = document.createElement('button'); b.className = 'pfo-btn sec'; b.textContent = '🔄 Reintentar'; b.addEventListener('click', () => { b.remove(); turnoApertura(); }); c.appendChild(b); }
    finally { pendiente = false; }
  }
  function enviar() {
    if (pendiente) return; const t = $('#pfo-txt'); const v = (t.value || '').trim(); if (!v) return;
    const E = estActual(); E.hist.push({ rol: 'usuario', texto: v }); burbuja('usuario', v); t.value = ''; guardar(); contador(); turno(v, false);
  }
  function cerrarEstacion(motivo) {
    const E = estActual(); if (E.cerrada || pendiente) return; clearInterval(timer);
    if (!E.hist.some((m) => m.rol === 'usuario' && m.texto !== MSG_INICIO)) { // sin ninguna intervención: no hay nada que evaluar
      E.resultado = { semiologia: 1, diagnostico: 1, terapeutica: 1, vocabulario: 1, nota_final: 1, devolucion_docente: 'No hubo intervenciones en esta estación.', principal_debilidad: 'Estación sin resolver', revision_detallada: [], respuesta_modelo: '' }; E.cerrada = true; guardar(); siguienteOFin(); return;
    }
    burbuja('sistema', motivo === 'tiempo' ? '⌛ Tiempo agotado. Evaluando la estación…' : motivo === 'turnos' ? 'Alcanzaste el máximo de intervenciones. Evaluando la estación…' : 'Estación terminada. Evaluando…');
    turno(MSG_CIERRE, true);
  }

  function siguienteOFin() {
    clearInterval(timer); const ult = S.idx >= S.estaciones.length - 1;
    if (ult) { vistaFinal(); return; }
    const sig = CFG.estaciones[S.estaciones[S.idx + 1].ref];
    main.innerHTML = `<div class="pfo-trans"><div class="ic">✅</div><h2>Estación ${S.idx + 1} completada</h2><p>Tomá aire. Como en el examen real, no se muestra la nota hasta el final del circuito.</p><p>Próxima estación: <b>${sig.icono} ${esc(sig.nombre)}</b></p><button class="pfo-btn" id="pfo-sig">Pasar a la siguiente estación</button></div>`;
    $('#pfo-sig').addEventListener('click', () => { S.idx++; guardar(); vistaEstacion(false); });
  }

  // ------------------------------------------------------------------ resultado final
  function renderRevision(d) {
    const items = Array.isArray(d.revision_detallada) ? d.revision_detallada.filter((i) => i && (i.fallo_o_falto || i.hizo_bien || i.como_debia_hacerlo)) : [];
    const col = (r) => (/^logr/i.test(r) ? '#22c55e' : /^parc/i.test(r) ? '#fbbf24' : '#f87171');
    const fila = (ico, tit, tx) => (tx ? `<div style="margin-top:5px">${ico} <b>${tit}:</b> ${esc(tx)}</div>` : '');
    return items.map((i) => `<div class="pfo-rv" style="border-left-color:${col(String(i.resultado || ''))}"><div class="h"><span>${esc(i.dominio || '')}</span><span style="color:${col(String(i.resultado || ''))}">${esc(i.resultado || '')}</span></div>${fila('✅', 'Hiciste bien', i.hizo_bien)}${fila('❌', 'Falló o faltó', i.fallo_o_falto)}${fila('💡', 'Cómo debías hacerlo', i.como_debia_hacerlo)}</div>`).join('')
      + (d.respuesta_modelo ? `<div class="pfo-mod"><b>📘 Respuesta modelo:</b> ${esc(d.respuesta_modelo)}</div>` : '');
  }
  function vistaFinal() {
    const C = CFG.criterios, T = CFG.textos;
    const res = S.estaciones.map((E) => E.resultado || { nota_final: 1, semiologia: 1, diagnostico: 1, terapeutica: 1, vocabulario: 1 });
    const notas = res.map((r) => Math.max(0, Math.min(10, Number(r.nota_final) || 0)));
    const global = notas.reduce((a, b) => a + b, 0) / notas.length;
    const desaprobadas = notas.filter((n) => n < C.notaMinEstacion).length;
    const aprobado = global >= C.notaMinGlobal && desaprobadas === 0;
    const pilares = [['semiologia', '🩺 Semiología'], ['diagnostico', '🎯 Diagnóstico'], ['terapeutica', '💊 Terapéutica'], ['vocabulario', '📚 Vocabulario']];
    const prom = (k) => res.reduce((a, r) => a + (Number(r[k]) || 0), 0) / res.length;
    main.innerHTML = `
      <section class="pfo-fin ${aprobado ? 'ok' : ''}">
        <div class="medal">${aprobado ? '🎓' : '📚'}</div>
        <h1>${esc(aprobado ? T.felicitaciones_titulo : T.reintento_titulo)}</h1>
        <p>${esc(aprobado ? T.felicitaciones : T.reintento)}</p>
        <div class="pfo-nota" style="color:${colorNota(global)}">${fmtNota(global)}<small> / 10</small></div>
        <div style="color:var(--pf-mut);font-weight:700">Nota global del ECOE FINAL${desaprobadas ? ` · ${desaprobadas} estación(es) por debajo de ${C.notaMinEstacion}` : ''}</div>
        <div class="pfo-pil">${pilares.map(([k, n]) => `<span>${n}: <b>${fmtNota(prom(k))}</b></span>`).join('')}</div>
        <div class="pfo-tabla">${S.estaciones.map((E, i) => { const c = CFG.estaciones[E.ref]; return `<div class="pfo-fila"><span>${c.icono} ${esc(c.nombre)}</span><b class="n" style="color:${colorNota(notas[i])}">${fmtNota(notas[i])}</b></div>`; }).join('')}</div>
        <div class="pfo-cta" style="margin-top:20px;background:none;border:0;padding:0"><button class="pfo-btn" id="pfo-otra">${aprobado ? '🔁 Rendir otro ECOE de práctica' : '🔁 Volver a intentarlo'}</button><a class="pfo-btn sec" href="campus.html">Volver al Campus</a></div>
      </section>
      ${S.estaciones.map((E, i) => { const c = CFG.estaciones[E.ref]; const r = res[i]; return `<details class="pfo-det" ${notas[i] < C.notaMinEstacion ? 'open' : ''}><summary>${c.icono} ${esc(c.nombre)} · ${fmtNota(notas[i])}/10${r.principal_debilidad ? ' — ' + esc(r.principal_debilidad) : ''}</summary>${r.devolucion_docente ? `<p style="line-height:1.55;font-size:.88rem">${esc(r.devolucion_docente).replace(/\\n|\n/g, '<br>')}</p>` : ''}${renderRevision(r)}</details>`; }).join('')}`;
    $('#pfo-otra').addEventListener('click', () => { limpiarGuardado(); S = null; vistaIntro(); });
    try { const h = hist(); h.push({ fecha: new Date().toLocaleDateString('es-AR'), global: Math.round(global * 10) / 10, aprobado, notas }); localStorage.setItem(LS_HIST(), JSON.stringify(h.slice(-20))); } catch (_) {}
    try { if (window.NikaRendimiento) window.NikaRendimiento.guardarExamen({ modulo: 'clinica', mode: 'ecoe_final_pfo', total: S.estaciones.length, correct: notas.filter((n) => n >= C.notaMinEstacion).length, blank: 0, score: Math.round(global * 10) / 10, scorePct: Math.round(global * 10), durationSeconds: Math.round((Date.now() - S.creado) / 1000) }); } catch (_) {}
    limpiarGuardado(); if (aprobado) confeti(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function confeti() {
    if (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'); cv.className = 'pfo-conf'; document.body.appendChild(cv); const x = cv.getContext('2d'); const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const col = ['#fde68a', '#fbbf24', '#38bdf8', '#a78bfa', '#22c55e', '#f472b6']; const P = Array.from({ length: 150 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: col[(Math.random() * col.length) | 0] }));
    let t0 = performance.now(); const paso = (t) => { x.clearRect(0, 0, W, H); P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (t - t0 < 5200) requestAnimationFrame(paso); else cv.remove(); };
    requestAnimationFrame(paso);
  }

  // ------------------------------------------------------------------ arranque
  async function iniciar() {
    try {
      const r = await fetch('data/pfo/ecoe_final.json', { cache: 'no-cache' }); CFG = await r.json();
      if (window.NikaAuth && window.NikaAuth.ready) { try { await window.NikaAuth.ready; } catch (_) {} }
      if (!window.PROMPTS_MATERIAS_BUILDERS) throw new Error('No se cargó el generador de estaciones.');
      vistaIntro();
      if (window.NikaAcceso && window.NikaAcceso.alVerificarPerfil) window.NikaAcceso.alVerificarPerfil(() => { if (!S) vistaIntro(); });
    } catch (e) { main.innerHTML = `<div class="pfo-cargando">No se pudo cargar el examen (${esc(e && e.message)}). Recargá la página.</div>`; }
  }
  window.addEventListener('beforeunload', (e) => { if (S && !S.estaciones.every((x) => x.cerrada)) { guardar(); e.preventDefault(); e.returnValue = ''; } });
  iniciar();
})();
