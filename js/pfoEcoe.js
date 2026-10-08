// CAMPUS NIKA — ECOE FINAL de 6.° año (PFO). Circuito de estaciones de distintas especialidades en un único examen, solo para NikaMed+.
// Config y estaciones: data/pfo/ecoe_final.json (se reemplaza cuando se cargue la rúbrica oficial). Prompts: js/examPromptsMaterias.js (generador de ECOE).
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const main = $('#pfo-main');
  let CFG = null, S = null, timer = null, pendiente = false; const CASOS = {};   // CASOS: casos oficiales cargados por id
  const LS = () => `nika_pfo_ecoe_${(window.NikaAuth && window.NikaAuth.userId) || 'anon'}`;
  const LS_HIST = () => `nika_pfo_ecoe_hist_${(window.NikaAuth && window.NikaAuth.userId) || 'anon'}`;
  const toast = (m) => { const t = $('#pfo-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); };
  const guardar = () => { try { if (S) localStorage.setItem(LS(), JSON.stringify(S)); } catch (_) {} };
  const limpiarGuardado = () => { try { localStorage.removeItem(LS()); } catch (_) {} };
  const leerGuardado = () => { try { const j = JSON.parse(localStorage.getItem(LS()) || 'null'); return j && j.estaciones ? j : null; } catch (_) { return null; } };
  const hist = () => { try { return JSON.parse(localStorage.getItem(LS_HIST()) || '[]'); } catch (_) { return []; } };
  const fmtNota = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
  const colorNota = (n) => (n >= 8 ? '#22c55e' : n >= 6 ? '#fbbf24' : '#f87171');
  // Acceso RESTRINGIDO: por ahora solo administradores (rol del perfil verificado contra el servidor por NikaAcceso).
  const esAdmin = () => { try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return !!u && String(u.role || '').toLowerCase() === 'admin'; } catch (_) { return false; } };
  const esPlus = esAdmin;
  function vistaRestringida() {
    main.innerHTML = '<div class="pfo-trans"><div class="ic">🔒</div><h2>Acceso restringido</h2><p>Esta sección todavía no está disponible.</p><a class="pfo-btn" href="sala_estudio.html">Volver a la Sala de Estudio</a></div>';
  }

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
Esta estación es la número ${i + 1} de ${CFG.estaciones.length} del ECOE FINAL de la carrera de Medicina: el último examen antes de recibirse. El alumno rinde varias estaciones seguidas con especialidades distintas. La exigencia es SUPERIOR a la de 5.° año: un 6 significa que cumplió lo mínimo con seguridad y un 8 o más exige un manejo completo y ordenado.
- Exigí respuestas completas y precisas, nunca vagas: no aceptes "le doy un antibiótico" sin principio activo, dosis, vía, frecuencia y duración; ni "pido estudios" sin decir cuáles ni para qué.
- Esperá diferenciales razonados, estudios justificados, conducta con criterio de gravedad, pautas de alarma, consentimiento informado y comunicación empática con lenguaje claro.
- Un error crítico de seguridad baja el pilar afectado a 4 o menos aunque el resto esté bien. No infles ninguna nota.
- No existe el Abogado del Diablo en esta instancia. Si el sistema te avisa que se agotó el tiempo, cerrá la estación con la evaluación.
- En "revision_detallada" incluí UN ítem por cada uno de los 9 dominios y en "respuesta_modelo" el plan completo ideal de este caso, con las opciones válidas.`;
    const bc = bloqueCaso(i);
    if (bc) p = p.replace(/## 0\. SORTEO[\s\S]*?(?=## 2\. ROL DUAL)/, '## 0 y 1. CASO DE LA ESTACIÓN\nEl caso es el que figura en la sección 10 (caso oficial o situación de partida). No sortees ni cambies el cuadro; la unidad temática y los sorteos de otras secciones no se aplican.\n\n');
    p += bc;
    return p + '\n\n' + (window.FORMATO_EVALUACION_FINAL || '');
  }
  // Caso OFICIAL (con guion y rúbrica propios) o situación de partida: pasan a ser la fuente única de verdad de la estación
  function bloqueCaso(i) {
    const E = S && S.estaciones[i]; const e = CFG.estaciones[E ? E.ref : i]; const c = E && E.casoId ? CASOS[E.casoId] : null;
    if (c) {
      const filas = c.rubrica.map((r) => `${r.id}. [${r.bloque}] ${r.texto} — REGULAR (${r.max / 2} pts): ${r.regular} — SUFICIENTE (${r.max} pts): ${r.suficiente}`).join('\n');
      return `

## 10. CASO OFICIAL DE LA ESTACIÓN (FUENTE ÚNICA DE VERDAD; reemplaza al sorteo de las secciones 0 y 1)
Nombre de la estación: ${c.nombre}. Duración: ${c.duracionMin} minutos. Tipo: ${c.tipo}. Contexto: ${c.contexto}. Instrumento: ${c.instrumento}.
- APERTURA: tu primer mensaje lleva entre corchetes la SITUACIÓN DE PARTIDA y los OBJETIVOS, textuales, y en otra línea la primera frase de ${c.interlocutor}. Situación de partida: ${c.situacion} Objetivos: ${c.objetivos.map((o, k) => (k + 1) + ') ' + o).join(' ')}
- INTERLOCUTOR: respondés como ${c.interlocutor}, SOLO con los datos del guion, en lenguaje coloquial argentino y sin términos médicos. Si te preguntan algo que el guion no contiene, respondé "no" o "no sé", de forma coherente con el caso. Nunca inventes antecedentes ni regales datos.
- GUION DEL PACIENTE:
${c.guion_paciente}
- DATOS CLÍNICOS (se entregan SOLO si el alumno examina o pide los signos, entre corchetes con el formato [Evaluador: ...]): ${c.datos_clinicos}
- ESTUDIOS (se entregan SOLO cuando el alumno los pide y los resultados del laboratorio con sus unidades):
${c.estudios.map((x) => '  · ' + x.texto).join('\n')}
- RÚBRICA OFICIAL (puntaje total 100; umbral de aprobación ${c.umbral_aprobacion}). Los ítems valen 0 (insuficiente), la mitad (regular) o el máximo (suficiente):
${filas}
- ERRORES CRÍTICOS (conductas que ponen en riesgo al paciente): ${(c.errores_criticos || []).map((x, k) => (k + 1) + ') ' + x).join(' ')}. Si el alumno comete alguno, incluí en el JSON el campo "errores_criticos_cometidos" con una lista de textos breves (vacía si no cometió ninguno).
- AL CERRAR LA ESTACIÓN: además del formato de evaluación final, incluí en el JSON el campo "rubrica": una lista con UN objeto por cada ítem de la rúbrica, con "id" (número), "nivel" ("insuficiente", "regular" o "suficiente") y "evidencia" (qué dijo o hizo el alumno, en una línea). Calificá cada ítem SOLO con lo que el alumno dijo o hizo en la conversación: no asumas nada. Lo que no hizo es "insuficiente". El sistema calcula el puntaje; no lo calcules vos. En "revision_detallada" explicá cada ítem no logrado y en "respuesta_modelo" dejá la conducta completa esperada.`;
    }
    const sm = e.semillas && e.semillas.length ? e.semillas[(E && E.semilla) || 0] : null;
    if (!sm) return '';
    return `

## 10. SITUACIÓN DE PARTIDA OFICIAL (reemplaza al sorteo de las secciones 0 y 1)
Fuente: ${sm.fuente}. La estación DEBE construirse sobre esta situación, sin cambiar la edad, el sexo, el lugar ni el motivo de consulta.
- SITUACIÓN DE PARTIDA: ${sm.situacion}
- OBJETIVOS DE LA ESTACIÓN (son lo que se evalúa; calificá especialmente estos puntos en la revisión detallada): ${sm.objetivos.map((o, k) => (k + 1) + ') ' + o).join(' ')}
- Tu primer mensaje lleva entre corchetes la situación de partida y los objetivos, textuales (sin los datos que no se dan al inicio), y en otra línea la primera frase del paciente o del acompañante. Los datos clínicos que no figuran acá los definís vos con coherencia y los entregás SOLO si el alumno los pide.
${sm.imagen ? `- ESTUDIO POR IMAGEN: el alumno ya ve en pantalla ${sm.imagen_titulo}. No la describas ni la interpretes: si el alumno pregunta por ella, respondé [Evaluador: La imagen está disponible en pantalla; interprétela en voz alta.]. Evaluá su interpretación contra esta lectura esperada: ${sm.lectura_esperada}` : ''}`;
  }
  const temaPrompt = (tema) => (tema ? '\n\nTEMA DE LA ESTACIÓN SORTEADO POR EL SISTEMA (obligatorio y fijo durante todo el caso): ' + tema + '. Elegí un cuadro concreto dentro de este tema y respetá todas las reglas de tu rol.' : '');

  // ------------------------------------------------------------------ vistas
  function vistaIntro() {
    const T = CFG.textos, plus = esPlus(), g = leerGuardado(), h = hist();
    main.innerHTML = `
      <section class="pfo-hero">
        <span class="pfo-chip">🎓 Práctica Final Obligatoria · Acceso de administrador</span>
        <h1>ECOE <em>FINAL</em><br>${esc(CFG.subtitulo)}</h1>
        <p>${esc(T.intro)}</p>
        <p class="mot">${esc(T.motivacion)}</p>
      </section>
      <section class="pfo-sec"><h2>🧭 Cómo funciona</h2><div class="pfo-pasos">${T.como_funciona.map((x) => `<div class="pfo-paso">${esc(x)}</div>`).join('')}</div></section>
      <section class="pfo-sec"><h2>🏥 Estaciones del circuito</h2><div class="pfo-est">${CFG.estaciones.map((e) => `<div class="pfo-est-c"><span class="n">${minutosDe(e)} min</span><div class="ic">${e.icono}</div><h3>${esc(e.nombre)}</h3><p>${esc(e.descripcion)}</p></div>`).join('')}</div></section>
      <section class="pfo-sec"><h2>📜 Reglas del examen</h2><ul class="pfo-reglas">${T.reglas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="pfo-aviso apr">✅ ${esc(T.aprobacion)}</div>
        ${T.contexto ? `<div class="pfo-aviso apr" style="background:rgba(56,189,248,.08);border-color:rgba(56,189,248,.35);color:#bae6fd">🏛️ ${esc(T.contexto)}</div>` : ''}
        ${CFG.borrador_hasta_rubrica ? `<div class="pfo-aviso bor">📝 ${esc(CFG.nota_rubrica)}</div>` : ''}</section>
      ${h.length ? `<section class="pfo-sec"><h2>🗂️ Tus intentos</h2><div class="pfo-hist">${h.slice(-5).reverse().map((x) => `<div class="pfo-hist-i"><span>${esc(x.fecha)}</span><span>Nota global <b class="${x.aprobado ? 'ok' : 'mal'}">${fmtNota(x.global)}</b> · ${x.aprobado ? 'Aprobado' : 'A reforzar'}</span></div>`).join('')}</div></section>` : ''}
      <section class="pfo-cta">
        ${g ? `<h2>⏳ Tenés un examen en curso</h2><small>Estación ${g.idx + 1} de ${g.estaciones.length}. Podés retomarlo donde lo dejaste.</small><button class="pfo-btn" id="pfo-retomar">Retomar examen</button><button class="pfo-link" id="pfo-descartar">Descartar y empezar de nuevo</button>`
          : `<h2>¿Listo/a para empezar?</h2><small>Buscá un lugar tranquilo: son ${CFG.estaciones.length} estaciones de ${CFG.criterios.minutosPorEstacion} minutos, seguidas. No se puede pausar ni volver atrás.</small><button class="pfo-btn" id="pfo-empezar">Comenzar el ECOE FINAL</button>`}
      </section>`;
    const b = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    b('#pfo-empezar', nuevoExamen);
    b('#pfo-retomar', () => { S = leerGuardado(); vistaEstacion(true); });
    b('#pfo-descartar', () => { if (confirm('Se pierde el examen en curso. ¿Empezar uno nuevo?')) { limpiarGuardado(); nuevoExamen(); } });
  }

  function nuevoExamen() {
    if (!esAdmin()) { toast('Acceso restringido.'); return; }
    if (!confirm('Vas a comenzar el ECOE FINAL. No se puede pausar ni volver atrás. ¿Empezamos?')) return;
    const orden = CFG.estaciones.map((e, i) => i);
    S = { idx: 0, creado: Date.now(), estaciones: orden.map((i) => ({ id: CFG.estaciones[i].id, ref: i, hist: [], tema: '', fin: 0, resultado: null, cerrada: false })) };
    guardar(); vistaEstacion(false);
  }

  const minutosDe = (cfgE, E) => { const id = (E && E.casoId) || (cfgE.casos_oficiales && cfgE.casos_oficiales[0]); return (id && CASOS[id] && CASOS[id].duracionMin) || CFG.criterios.minutosPorEstacion; };
  function estActual() { return S.estaciones[S.idx]; }
  function vistaEstacion(restaurar) {
    const E = estActual(); const cfgE = CFG.estaciones[E.ref];
    const puntos = S.estaciones.map((x, i) => `<i class="${i < S.idx ? 'hecha' : i === S.idx ? 'act' : ''}"></i>`).join('');
    main.innerHTML = `
      <div class="pfo-bar"><div class="est">${cfgE.icono} Estación ${S.idx + 1} de ${S.estaciones.length} · ${esc(cfgE.nombre)}<small>ECOE FINAL · sin ayudas</small></div>
        <div class="pfo-turnos" id="pfo-turnos"></div><div class="pfo-timer" id="pfo-timer">--:--</div><div class="pfo-puntos">${puntos}</div></div>
      ${panelImagen(cfgE, E)}
      <div class="pfo-chat" id="pfo-chat" aria-live="polite"></div>
      <div class="pfo-in"><textarea id="pfo-txt" placeholder="Escribí lo que le preguntás o indicás al paciente, o la maniobra que realizás…" maxlength="2500"></textarea><button class="pfo-btn" id="pfo-env">Enviar ➤</button></div>
      <div class="pfo-acc"><small>El evaluador solo responde lo que pedís. No hay pistas.</small><button class="pfo-link" id="pfo-term">Terminar esta estación</button></div>`;
    E.hist.forEach((m) => burbuja(m.rol, m.texto));
    $('#pfo-env').addEventListener('click', enviar);
    $('#pfo-txt').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviar(); });
    $('#pfo-term').addEventListener('click', () => { if (!pendiente && confirm('¿Terminar esta estación ahora? No se puede volver a ella.')) cerrarEstacion('manual'); });
    if (E.casoId === undefined) { const cs = (cfgE.casos_oficiales || []).filter((id) => CASOS[id]); E.casoId = cs.length ? cs[Math.floor(Math.random() * cs.length)] : null; }
    if (E.semilla === undefined) { const sm = cfgE.semillas || []; E.semilla = sm.length ? Math.floor(Math.random() * sm.length) : 0; }
    if (!E.fin) E.fin = Date.now() + minutosDe(cfgE, E) * 60000;
    if (!E.tema && !E.casoId && !(cfgE.semillas && cfgE.semillas.length)) { const u = perfilEstacion(cfgE).unidades || []; const t = u[Math.floor(Math.random() * u.length)] || ''; E.tema = String(t).replace(/^UP\d+\s*—\s*/, ''); }
    guardar(); contador(); clearInterval(timer); timer = setInterval(tic, 500);
    if (!E.hist.length) iniciarEstacion(); else { fijar(true); }
  }
  function panelImagen(cfgE, E) {
    const sm = (cfgE.semillas || [])[E.semilla || 0]; if (!sm || !sm.imagen) return '';
    return `<details class="pfo-img" open><summary>🩻 ${esc(sm.imagen_titulo || 'Estudio complementario')}</summary><img src="${esc(sm.imagen)}" alt="${esc(sm.imagen_titulo || 'Estudio complementario')}" loading="lazy"></details>`;
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
      if (ev) { aplicarRubrica(E, ev); E.resultado = ev; E.cerrada = true; guardar(); siguienteOFin(); return; }
      if (cierre) { fijar(true); burbuja('sistema', 'No se pudo generar la evaluación de la estación. Tocá "Terminar esta estación" para reintentar.'); return; }
      E.hist.push({ rol: 'ia', texto: d.texto }); burbuja('ia', d.texto); guardar(); contador(); fijar(true);
      if (turnosUsados() >= CFG.criterios.maxIntervencionesPorEstacion) cerrarEstacion('turnos');
    } catch (err) { pensando(false); fijar(true); burbuja('sistema', '⚠️ ' + (err && err.message ? err.message : 'No se pudo contactar al simulador.') + ' Volvé a enviar tu mensaje.'); if (!cierre) { const t = $('#pfo-txt'); if (t && E.hist.length && E.hist[E.hist.length - 1].rol === 'usuario') { t.value = E.hist.pop().texto; guardar(); const l = $('#pfo-chat'); if (l && l.lastChild && l.lastChild.classList.contains('yo')) { /* se deja visible el aviso; el mensaje vuelve al cuadro */ } } } }
    finally { pendiente = false; }
  }
  // Estaciones con rúbrica oficial: el puntaje lo calcula el sistema a partir del nivel que la IA asignó a cada ítem (insuficiente 0, regular mitad, suficiente máximo)
  function aplicarRubrica(E, ev) {
    const c = E.casoId ? CASOS[E.casoId] : null; if (!c || !Array.isArray(ev.rubrica)) return;
    const porId = {}; ev.rubrica.forEach((r) => { if (r && r.id != null) porId[String(r.id)] = r; });
    const bloques = {}; let total = 0;
    ev.rubrica_detalle = c.rubrica.map((it) => {
      const r = porId[String(it.id)] || {}; const nivel = /^suf/i.test(r.nivel || '') ? 'suficiente' : /^reg/i.test(r.nivel || '') ? 'regular' : 'insuficiente';
      const pts = nivel === 'suficiente' ? it.max : nivel === 'regular' ? it.max / 2 : 0; total += pts;
      const b = bloques[it.bloque] || (bloques[it.bloque] = { o: 0, m: 0 }); b.o += pts; b.m += it.max;
      return { id: it.id, bloque: it.bloque, texto: it.texto, nivel, pts, max: it.max, evidencia: String(r.evidencia || ''), esperado: it.suficiente };
    });
    const maxTotal = c.rubrica.reduce((a, b) => a + b.max, 0);
    ev.errores_criticos_cometidos = Array.isArray(ev.errores_criticos_cometidos) ? ev.errores_criticos_cometidos.filter((x) => typeof x === 'string' && x.trim()).slice(0, 6) : [];
    ev.puntaje = Math.round(total * 10) / 10; ev.puntaje_max = maxTotal; ev.nota_final = Math.round((total / maxTotal) * 100) / 10;
    if (ev.errores_criticos_cometidos.length) ev.nota_final = Math.min(ev.nota_final, 5);   // un error crítico desaprueba la estación aunque el puntaje sea alto
    const dec = (b) => (bloques[b] ? Math.round((bloques[b].o / bloques[b].m) * 100) / 10 : null);
    if (dec('Anamnesis') != null) ev.semiologia = dec('Anamnesis'); if (dec('Plan diagnóstico') != null) ev.diagnostico = dec('Plan diagnóstico'); if (dec('Tratamiento') != null) ev.terapeutica = dec('Tratamiento');
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
  function renderRubricaOficial(r) {
    if (!r.rubrica_detalle) return '';
    const col = (n) => (n === 'suficiente' ? '#22c55e' : n === 'regular' ? '#fbbf24' : '#f87171');
    const lbl = { suficiente: 'Suficiente', regular: 'Regular', insuficiente: 'Insuficiente' };
    const crit = (r.errores_criticos_cometidos || []).length ? `<div class="pfo-mod" style="background:rgba(248,113,113,.12);border:1px solid #f87171;border-style:solid"><b>⛔ Error crítico: la estación no puede superar 5.</b><br>${r.errores_criticos_cometidos.map((x) => '• ' + esc(x)).join('<br>')}</div>` : '';
    return crit + `<div class="pfo-mod" style="background:rgba(251,191,36,.08);border-color:#fbbf24"><b>📋 Rúbrica de la estación: ${fmtNota(r.puntaje)} de ${r.puntaje_max} puntos</b></div>`
      + r.rubrica_detalle.map((x) => `<div class="pfo-rv" style="border-left-color:${col(x.nivel)}"><div class="h"><span>${esc(x.bloque)} · ${esc(x.texto)}</span><span style="color:${col(x.nivel)}">${lbl[x.nivel]} · ${fmtNota(x.pts)}/${x.max}</span></div>${x.evidencia ? `<div style="margin-top:5px">🗣️ <b>Lo que hiciste:</b> ${esc(x.evidencia)}</div>` : ''}${x.nivel !== 'suficiente' ? `<div style="margin-top:5px">💡 <b>Para el puntaje completo:</b> ${esc(x.esperado)}</div>` : ''}</div>`).join('');
  }
  function vistaFinal() {
    const C = CFG.criterios, T = CFG.textos;
    const res = S.estaciones.map((E) => E.resultado || { nota_final: 1, semiologia: 1, diagnostico: 1, terapeutica: 1, vocabulario: 1 });
    const notas = res.map((r) => Math.max(0, Math.min(10, Number(r.nota_final) || 0)));
    const global = notas.reduce((a, b) => a + b, 0) / notas.length;
    const desaprobadas = notas.filter((n) => n < C.notaMinEstacion).length;
    const aprobado = desaprobadas === 0 && (C.notaMinGlobal == null || global >= C.notaMinGlobal);   // reglamento PFO: se aprueba superando la totalidad de las estaciones
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
      ${S.estaciones.map((E, i) => { const c = CFG.estaciones[E.ref]; const r = res[i]; return `<details class="pfo-det" ${notas[i] < C.notaMinEstacion ? 'open' : ''}><summary>${c.icono} ${esc(c.nombre)} · ${fmtNota(notas[i])}/10${r.principal_debilidad ? ' — ' + esc(r.principal_debilidad) : ''}</summary>${r.devolucion_docente ? `<p style="line-height:1.55;font-size:.88rem">${esc(r.devolucion_docente).replace(/\\n|\n/g, '<br>')}</p>` : ''}${renderRubricaOficial(r)}${renderRevision(r)}</details>`; }).join('')}`;
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
      if (window.NikaAuth && window.NikaAuth.ready) { try { await window.NikaAuth.ready; } catch (_) {} }
      // el rol se confirma con el servidor antes de mostrar nada
      await new Promise((ok) => { if (window.NikaAcceso && window.NikaAcceso.alVerificarPerfil) { let listo = false; const fin = () => { if (!listo) { listo = true; ok(); } }; window.NikaAcceso.alVerificarPerfil(fin); setTimeout(fin, 6000); } else ok(); });
      if (!esAdmin()) { vistaRestringida(); return; }
      const r = await fetch('data/pfo/ecoe_final.json', { cache: 'no-cache' }); CFG = await r.json();
      if (!window.PROMPTS_MATERIAS_BUILDERS) throw new Error('No se cargó el generador de estaciones.');
      await Promise.all(CFG.estaciones.flatMap((e) => (e.casos_oficiales || []).map(async (id) => { try { const rr = await fetch('data/pfo/casos/' + id + '.json', { cache: 'no-cache' }); CASOS[id] = await rr.json(); } catch (_) { /* si falla, la estación usa la situación de partida o el sorteo */ } })));
      vistaIntro();
    } catch (e) { main.innerHTML = `<div class="pfo-cargando">No se pudo cargar el examen (${esc(e && e.message)}). Recargá la página.</div>`; }
  }
  window.addEventListener('beforeunload', (e) => { if (S && !S.estaciones.every((x) => x.cerrada)) { guardar(); e.preventDefault(); e.returnValue = ''; } });
  // Utilidad de auditoría: devuelve el prompt completo que recibe la IA para un caso (lo usa tools/exportar_pfo_casos.js)
  window.__PFO = { async prompt(estId, casoId) {
    while (!CFG) await new Promise((ok) => setTimeout(ok, 20));
    const prev = S; S = { idx: 0, estaciones: CFG.estaciones.map((e, k) => ({ ref: k, casoId: e.id === estId ? casoId : null, semilla: 0, tema: '' })) };
    try { const k = CFG.estaciones.findIndex((e) => e.id === estId); return promptEstacion(k) + temaPrompt(''); } finally { S = prev; }
  }, cfg: () => CFG, casos: () => CASOS };
  iniciar();
})();
