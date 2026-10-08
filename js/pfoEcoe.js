// CAMPUS NIKA — ECOE FINAL de 6.° año (PFO). Circuito secuencial: una estación de cada especialidad, con un caso sorteado al azar del banco de cada una. Solo admin por ahora.
// Config y estaciones: data/pfo/ecoe_final.json · casos: data/pfo/casos/*.json · procedimientos escritos: data/pfo/procedimientos.json (lo genera tools/generar_procedimientos_pfo.js).
// Prompts: js/examPromptsMaterias.js (generador de ECOE). Integridad ("machete"): js/examIntegridad.js. Documentos médicos: recetarios.html?embed=ecoe.
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const main = $('#pfo-main');
  let CFG = null, S = null, timer = null, pendiente = false, LISTO = false; const CASOS = {}; let PROC = {};   // CASOS: casos oficiales por id · PROC: listas de cotejo de los procedimientos
  const reducido = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uid = () => (window.NikaAuth && window.NikaAuth.userId) || 'anon';
  const LS = () => `nika_pfo_ecoe_${uid()}`;
  const LS_HIST = () => `nika_pfo_ecoe_hist_${uid()}`;
  const LS_TRAT = 'nika_pfo_tratamiento';
  const toast = (m) => { const t = $('#pfo-toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2800); };
  const guardar = () => { try { if (S) localStorage.setItem(LS(), JSON.stringify(S)); } catch (_) {} };
  const limpiarGuardado = () => { try { localStorage.removeItem(LS()); } catch (_) {} };
  const leerGuardado = () => { try { const j = JSON.parse(localStorage.getItem(LS()) || 'null'); return j && j.estaciones ? j : null; } catch (_) { return null; } };
  const hist = () => { try { return JSON.parse(localStorage.getItem(LS_HIST()) || '[]'); } catch (_) { return []; } };
  const fmtNota = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
  const colorNota = (n) => (n >= 8 ? '#22c55e' : n >= 6 ? '#f59e0b' : '#ef4444');
  const tratamiento = () => { try { const v = localStorage.getItem(LS_TRAT); return v === 'Doctora' || v === 'Doctor' ? v : ''; } catch (_) { return ''; } };
  const nombreUsuario = () => { try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return String((u && (u.fullname || u.username)) || '').trim(); } catch (_) { return ''; } };
  // Acceso RESTRINGIDO: por ahora solo administradores (rol del perfil verificado contra el servidor por NikaAcceso).
  const esAdmin = () => { try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return !!u && String(u.role || '').toLowerCase() === 'admin'; } catch (_) { return false; } };
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
  const casoDe = (E) => (E && E.casoId ? CASOS[E.casoId] : null);
  const procDe = (E) => { const c = casoDe(E); return c && c.procedimiento && PROC[c.procedimiento] ? PROC[c.procedimiento] : null; };
  function promptEstacion(i, pos) {
    const e = CFG.estaciones[i]; const P = perfilEstacion(e); const B = window.PROMPTS_MATERIAS_BUILDERS;
    const max = CFG.criterios.maxIntervencionesPorEstacion;
    let p = B.ecoe(P)
      .replace(/Unidades Problema de/g, 'bloques temáticos de').replace(/Unidades Problema/g, 'bloques temáticos').replace(/estas \d+ /, 'estos ' + P.unidades.length + ' ')
      .replace(/alcanza las 16 intervenciones/, 'alcanza las ' + max + ' intervenciones').replace(/en la intervención 15 /, 'en la intervención ' + (max - 1) + ' ');
    p += `

## 9. NIVEL DE EGRESO (ECOE FINAL de grado)
Esta estación es la número ${(pos != null ? pos : S && S.idx != null ? S.idx : i) + 1} de ${S && S.estaciones ? S.estaciones.length : CFG.estaciones.length} del ECOE FINAL de la carrera de Medicina: el último examen antes de recibirse. El alumno rinde varias estaciones seguidas con especialidades distintas. La exigencia es SUPERIOR a la de 5.° año: un 6 significa que cumplió lo mínimo con seguridad y un 8 o más exige un manejo completo y ordenado.
- Exigí respuestas completas y precisas, nunca vagas: no aceptes "le doy un antibiótico" sin principio activo, dosis, vía, frecuencia y duración; ni "pido estudios" sin decir cuáles ni para qué.
- Esperá diferenciales razonados, estudios justificados, conducta con criterio de gravedad, pautas de alarma, consentimiento informado y comunicación empática con lenguaje claro.
- Un error crítico de seguridad baja el pilar afectado a 4 o menos aunque el resto esté bien. No infles ninguna nota.
- No existe el Abogado del Diablo en esta instancia. Si el sistema te avisa que se agotó el tiempo, cerrá la estación con la evaluación.
- En "revision_detallada" incluí UN ítem por cada uno de los 9 dominios y en "respuesta_modelo" el plan completo ideal de este caso, con las opciones válidas.
- PARTE PRÁCTICA (documentos): el alumno puede redactar una receta, una solicitud de estudios o un certificado en el recetario. Cuando lo haga, el sistema te pasa el texto y la nota de FORMA entre corchetes [Sistema — parte práctica]: respondé solo [Evaluador: Documento recibido.] y seguí la estación. Al evaluar, juzgá el CONTENIDO (fármaco, dosis, vía, estudios pedidos, lo que constata) contra el caso.`;
    const bc = bloqueCaso(i);
    if (bc) p = p.replace(/## 0\. SORTEO[\s\S]*?(?=## 2\. ROL DUAL)/, '## 0 y 1. CASO DE LA ESTACIÓN\nEl caso es el que figura en la sección 10 (caso oficial). No sortees ni cambies el cuadro; la unidad temática y los sorteos de otras secciones no se aplican.\n\n');
    p += bc;
    return p + '\n\n' + (window.FORMATO_EVALUACION_FINAL || '');
  }
  // Caso OFICIAL (con guion y rúbrica propios): pasa a ser la fuente única de verdad de la estación
  function bloqueCaso(i) {
    const E = S && S.estaciones.find((x) => x.ref === i); const c = E && E.casoId ? CASOS[E.casoId] : null;
    if (!c) return '';
    const filas = c.rubrica.map((r) => `${r.id}. [${r.bloque}] ${r.texto} — REGULAR (${r.max / 2} pts): ${r.regular} — SUFICIENTE (${r.max} pts): ${r.suficiente}`).join('\n');
    const pr = c.procedimiento && PROC[c.procedimiento] ? PROC[c.procedimiento] : null;
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
- MANIOBRAS Y ESTUDIOS NO CONTEMPLADOS: si el alumno pide una maniobra de examen que no figura en los datos clínicos, respondé [Evaluador: Sin particularidades.]; si pide un estudio que no figura entre los estudios del caso, respondé [Evaluador: Estudio no disponible en esta estación.]. Nunca des pistas ni juzgues la indicación.
- RÚBRICA OFICIAL (puntaje total 100; umbral de aprobación ${c.umbral_aprobacion}). Los ítems valen 0 (insuficiente), la mitad (regular) o el máximo (suficiente):
${filas}
- ERRORES CRÍTICOS (conductas que ponen en riesgo al paciente): ${(c.errores_criticos || []).map((x, k) => (k + 1) + ') ' + x).join(' ')}. Si el alumno comete alguno, incluí en el JSON el campo "errores_criticos_cometidos" con una lista de textos breves (vacía si no cometió ninguno).
- AL CERRAR LA ESTACIÓN: además del formato de evaluación final, incluí en el JSON el campo "rubrica": una lista con UN objeto por cada ítem de la rúbrica, con "id" (número), "nivel" ("insuficiente", "regular" o "suficiente") y "evidencia" (qué dijo o hizo el alumno, en una línea). Calificá cada ítem SOLO con lo que el alumno dijo o hizo en la conversación: no asumas nada. Lo que no hizo es "insuficiente". El sistema calcula el puntaje; no lo calcules vos. En "revision_detallada" explicá cada ítem no logrado y en "respuesta_modelo" dejá la conducta completa esperada.${pr ? `
- PARTE PRÁCTICA (PROCEDIMIENTO ESCRITO): esta estación incluye el procedimiento «${pr.titulo}». Al cerrar, el mensaje del sistema trae el texto que el alumno escribió y la lista de cotejo numerada. Incluí también en el JSON el campo "procedimiento": {"cumple":[números de los pasos descriptos completa y correctamente],"parcial":[números de los pasos descriptos de forma incompleta o desordenada]}; los pasos que no figuren en ninguna lista cuentan como no cumplidos. Calificá SOLO con lo escrito, aceptando sinónimos y descripciones equivalentes (no exijas las palabras textuales). No agregues evidencia por paso.` : ''}`;
  }
  const temaPrompt = (tema) => (tema ? '\n\nTEMA DE LA ESTACIÓN SORTEADO POR EL SISTEMA (obligatorio y fijo durante todo el caso): ' + tema + '. Elegí un cuadro concreto dentro de este tema y respetá todas las reglas de tu rol.' : '');
  // Mensaje de cierre: si hubo procedimiento escrito, se le pasa a la IA el texto y la lista de cotejo
  function mensajeCierre(E) {
    let m = MSG_CIERRE; const pr = procDe(E);
    if (pr && E.proc) {
      const lista = pr.pasos.map((p) => `${p.n}. ${p.critico ? '(CRÍTICO) ' : ''}${p.texto}`).join('\n');
      m += `\n\n[Sistema — PARTE PRÁCTICA: PROCEDIMIENTO ESCRITO] El alumno describió por escrito cómo realiza el procedimiento «${pr.titulo}» sobre el paciente de la estación (${E.proc.motivo === 'tiempo' ? 'se agotó el tiempo' : 'lo entregó'}, ${Math.floor((E.proc.seg || 0) / 60)} min ${(E.proc.seg || 0) % 60} s).\nTEXTO DEL ALUMNO: «${E.proc.texto || '(en blanco)'}»\nLISTA DE COTEJO (los pasos marcados CRÍTICO son imprescindibles):\n${lista}\nIncluí en el JSON final el campo "procedimiento": {"cumple":[...],"parcial":[...]} con los números de paso según lo escrito.`;
    }
    return m;
  }

  // ------------------------------------------------------------------ utilidades de vista
  const rangoMin = (cfgE) => { const d = (cfgE.casos_oficiales || []).map((id) => CASOS[id] && CASOS[id].duracionMin).filter(Boolean); return d.length ? [Math.min(...d), Math.max(...d)] : [CFG.criterios.minutosPorEstacion, CFG.criterios.minutosPorEstacion]; };
  const txtRango = (r) => (r[0] === r[1] ? `${r[0]} min` : `${r[0]}–${r[1]} min`);
  const minutosDe = (cfgE, E) => { const c = casoDe(E); return (c && c.duracionMin) || rangoMin(cfgE)[0]; };
  const estActual = () => S.estaciones[S.idx];
  function revelar() {
    const els = [...document.querySelectorAll('.pfo-rv-w')]; if (!els.length) return;
    if (!('IntersectionObserver' in window) || reducido()) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => { es.filter((e) => e.isIntersecting).forEach((e) => { e.target.classList.add('in'); io.unobserve(e.target); }); }, { threshold: 0.06 });
    els.forEach((e) => io.observe(e)); setTimeout(() => els.forEach((e) => e.classList.add('in')), 2800);
  }
  const barraHtml = (cfgE, extra) => {
    const puntos = S.estaciones.map((x, i) => `<i class="${i < S.idx ? 'hecha' : i === S.idx ? 'act' : ''}"></i>`).join('');
    return `<div class="pfo-bar"><div class="est">${cfgE.icono} Estación ${S.idx + 1} de ${S.estaciones.length} · ${esc(cfgE.nombre)}<small>${S.modo === 'practica' ? '🎯 Modo práctica' : 'ECOE FINAL · sin ayudas'}</small></div>${extra || ''}<div class="pfo-turnos" id="pfo-turnos"></div><div class="pfo-timer" id="pfo-timer">--:--</div><div class="pfo-puntos">${puntos}</div></div>`;
  };

  // ------------------------------------------------------------------ integridad ("machete"): las mismas reglas que el resto de los exámenes
  function iniciarIntegridad(reanudando) {
    if (!window.ExamIntegridad) return;
    const hooks = { onForzarEntrega: forzarEntrega, permitirCaptura: false };
    try {
      if (reanudando && ExamIntegridad.reanudar(hooks)) return;
      ExamIntegridad.iniciar(Object.assign({ modulo: 'pfo_ecoe', modo: 'ecoe_final', estricto: true, total: S.estaciones.length, limiteSeg: null }, hooks));
    } catch (e) { console.warn('[PFO] integridad no disponible:', e && e.message); }
  }
  const pausarIntegridad = () => { try { if (window.ExamIntegridad && ExamIntegridad.estado) ExamIntegridad.desactivar(); } catch (_) {} };
  const reanudarIntegridad = () => { try { if (window.ExamIntegridad && ExamIntegridad.estado && S && !S.forzado) ExamIntegridad.activar({ onForzarEntrega: forzarEntrega, permitirCaptura: false }); } catch (_) {} };
  const resultadoNulo = (txt) => ({ semiologia: 1, diagnostico: 1, terapeutica: 1, vocabulario: 1, nota_final: 1, devolucion_docente: txt, principal_debilidad: 'Estación sin resolver', revision_detallada: [], respuesta_modelo: '' });
  // Reincidió tras la advertencia: el examen se entrega y queda en revisión (las estaciones que faltaban no se evalúan)
  function forzarEntrega() {
    if (!S || S.forzado) return;
    S.forzado = true; clearInterval(timer); cerrarOverlayDoc();
    S.estaciones.forEach((E) => { if (!E.terminada && !E.cerrada) { E.terminada = true; E.cerrada = true; E.noEvaluada = true; E.resultado = resultadoNulo('Estación no evaluada: el examen se entregó por incumplir las reglas.'); } });
    guardar(); irAlFinal();
  }

  // ------------------------------------------------------------------ vistas
  function vistaIntro() {
    const T = CFG.textos, g = leerGuardado(), h = hist(); const nCasos = Object.keys(CASOS).length;
    const rangos = CFG.estaciones.map(rangoMin); const minT = rangos.reduce((a, r) => a + r[0], 0), maxT = rangos.reduce((a, r) => a + r[1], 0);
    const nTrat = tratamiento();
    const sub = (t) => String(t).replace(/\{n_casos\}/g, nCasos);
    main.innerHTML = `
      <section class="pfo-hero">
        <div class="pfo-hero-deco" aria-hidden="true"><i style="left:6%;top:14%;font-size:2.4rem;--t:7s">🎓</i><i style="right:9%;top:10%;font-size:2rem;--t:9s;--w:-2s">🩺</i><i style="right:24%;bottom:20%;font-size:2.2rem;--t:8s;--w:-4s">📜</i><i style="left:30%;bottom:14%;font-size:1.8rem;--t:10s;--w:-1s">🥼</i></div>
        <svg class="pfo-ecg" viewBox="0 0 900 56" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 H120 l12 -4 l10 4 H230 l8 6 l12 -34 l14 44 l10 -16 H380 l10 -5 l12 5 H520 l8 6 l12 -34 l14 44 l10 -16 H680 l10 -5 l12 5 H900"/></svg>
        <span class="pfo-chip">🎓 Práctica Final Obligatoria · Acceso de administrador</span>
        <h1>ECOE <em>FINAL</em><br>${esc(CFG.subtitulo)}</h1>
        <p>${esc(T.intro)}</p>
        <p class="mot">${esc(T.motivacion)}</p>
        <div class="pfo-hero-stats"><span>🧭 ${CFG.estaciones.length} estaciones</span><span>🎲 ${nCasos} casos en el banco</span><span>⏱️ ${minT}–${maxT} min</span><span>📋 Rúbrica de 100 puntos</span><span>✅ 6 o más en cada una</span></div>
      </section>
      <section class="pfo-sec"><h2>🧭 Cómo funciona</h2><div class="pfo-pasos">${T.como_funciona.map((x, i) => `<div class="pfo-paso pfo-rv-w" style="--d:${i}">${esc(x)}</div>`).join('')}</div></section>
      <section class="pfo-sec"><h2>📖 Todo lo que tenés que saber</h2><div class="pfo-info">${(CFG.secciones || []).map((s, i) => `<article class="pfo-info-c pfo-rv-w" style="--d:${i % 4}"><h3><span class="ic">${s.ico}</span>${esc(s.titulo)}</h3>${(s.parrafos || []).map((p) => `<p>${esc(sub(p))}</p>`).join('')}${s.items ? `<ul>${s.items.map((x) => `<li>${esc(sub(x))}</li>`).join('')}</ul>` : ''}${s.nota ? `<p class="nota">${esc(s.nota)}</p>` : ''}</article>`).join('')}</div></section>
      <section class="pfo-sec"><h2>🏥 Estaciones del circuito</h2><div class="pfo-est">${CFG.estaciones.map((e, i) => `<div class="pfo-est-c pfo-rv-w" style="--d:${i % 4}"><span class="n">${txtRango(rangos[i])}</span><div class="ic">${e.icono}</div><h3>${esc(e.nombre)}</h3><p>${esc(e.descripcion)}</p></div>`).join('')}</div></section>
      <section class="pfo-sec"><h2>📜 Reglas del examen</h2><ul class="pfo-reglas pfo-rv-w">${T.reglas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="pfo-aviso apr pfo-rv-w">✅ ${esc(T.aprobacion)}</div>
        ${T.contexto ? `<div class="pfo-aviso inf pfo-rv-w">🏛️ ${esc(T.contexto)}</div>` : ''}
        ${CFG.borrador_hasta_rubrica ? `<div class="pfo-aviso bor">📝 ${esc(CFG.nota_rubrica)}</div>` : ''}</section>
      ${h.length ? `<section class="pfo-sec"><h2>🗂️ Tus intentos</h2><div class="pfo-hist">${h.slice(-5).reverse().map((x) => `<div class="pfo-hist-i"><span>${esc(x.fecha)}</span><span>Nota global <b class="${x.aprobado ? 'ok' : 'mal'}">${fmtNota(x.global)}</b> · ${x.aprobado ? 'Aprobado' : x.revision ? 'En revisión' : 'A reforzar'}</span></div>`).join('')}</div></section>` : ''}
      ${g ? '' : `<section class="pfo-sec" id="pfo-prac"><h2>🎯 Modo práctica</h2>
        <p style="color:var(--pf-mut);font-size:.88rem;line-height:1.55;margin:0 0 12px">Practicá con las mismas reglas del examen pero a tu medida: elegí una o varias especialidades (y, si querés, el caso exacto), con o sin reloj. Al terminar todas las estaciones ves la nota, la rúbrica, en qué te equivocaste y cómo sería la resolución modelo. No cuenta como intento del examen.</p>
        <div class="pfo-pr-acc"><button type="button" class="pfo-btn sec" id="pfo-pr-todas">Todas las áreas</button><button type="button" class="pfo-btn sec" id="pfo-pr-ninguna">Limpiar</button><label class="pfo-pr-reloj"><input type="checkbox" id="pfo-pr-reloj" checked> ⏱️ Con reloj</label></div>
        <div class="pfo-pr-grid">${CFG.estaciones.map((e, i) => { const ids = (e.casos_oficiales || []).filter((id) => CASOS[id]).sort((a, b) => CASOS[a].nombre.localeCompare(CASOS[b].nombre)); return `<div class="pfo-pr-c" data-i="${i}"><label class="pfo-pr-t"><input type="checkbox" data-i="${i}"><span class="ic">${e.icono}</span><b>${esc(e.nombre)}</b><small>${ids.length} casos</small></label><select data-c="${i}" aria-label="Caso de ${esc(e.nombre)}"><option value="">🎲 Caso al azar</option>${ids.map((id) => `<option value="${id}">${esc(CASOS[id].nombre)}</option>`).join('')}</select></div>`; }).join('')}</div>
        <div style="text-align:center;margin-top:14px"><button class="pfo-btn" id="pfo-practicar" disabled>Elegí al menos un área para practicar</button></div></section>`}
      <section class="pfo-cta pfo-rv-w">
        ${g ? `<h2>⏳ Tenés un examen en curso</h2><small>Estación ${g.idx + 1} de ${g.estaciones.length}. Podés retomarlo donde lo dejaste.</small><button class="pfo-btn pulso" id="pfo-retomar">Retomar examen</button><button class="pfo-link" id="pfo-descartar">Descartar y empezar de nuevo</button>`
          : `<h2>¿Listo/a para empezar?</h2><small>Buscá un lugar tranquilo: son ${CFG.estaciones.length} estaciones seguidas (${minT}–${maxT} minutos en total, más la parte práctica). No se puede pausar ni volver atrás.</small>
          <span class="pfo-trat-t">Al aprobar te vamos a felicitar como:</span>
          <div class="pfo-trat" role="radiogroup" aria-label="Tratamiento"><button type="button" role="radio" data-t="Doctora" class="${nTrat === 'Doctora' ? 'on' : ''}" aria-checked="${nTrat === 'Doctora'}">👩‍⚕️ Doctora</button><button type="button" role="radio" data-t="Doctor" class="${nTrat === 'Doctor' ? 'on' : ''}" aria-checked="${nTrat === 'Doctor'}">👨‍⚕️ Doctor</button></div>
          <button class="pfo-btn pulso" id="pfo-empezar" ${nTrat ? '' : 'disabled'}>Comenzar el ECOE FINAL</button><small id="pfo-trat-aviso" ${nTrat ? 'hidden' : ''}>Elegí una opción para habilitar el examen.</small>`}
      </section>`;
    const b = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    b('#pfo-empezar', nuevoExamen);
    const pr = $('#pfo-prac');
    if (pr) {
      const marcadas = () => [...pr.querySelectorAll('.pfo-pr-t input:checked')].map((x) => +x.dataset.i);
      const refrescar = () => { const m = marcadas(); const bt = $('#pfo-practicar'); bt.disabled = !m.length; bt.textContent = m.length ? `Comenzar práctica (${m.length} ${m.length === 1 ? 'estación' : 'estaciones'})` : 'Elegí al menos un área para practicar'; pr.querySelectorAll('.pfo-pr-c').forEach((c) => c.classList.toggle('on', m.includes(+c.dataset.i))); };
      pr.querySelectorAll('.pfo-pr-t input').forEach((x) => x.addEventListener('change', refrescar));
      pr.querySelectorAll('select').forEach((x) => x.addEventListener('change', () => { if (x.value) { const k = pr.querySelector(`.pfo-pr-t input[data-i="${x.dataset.c}"]`); if (k && !k.checked) { k.checked = true; refrescar(); } } }));
      $('#pfo-pr-todas').addEventListener('click', () => { pr.querySelectorAll('.pfo-pr-t input').forEach((x) => { x.checked = true; }); refrescar(); });
      $('#pfo-pr-ninguna').addEventListener('click', () => { pr.querySelectorAll('.pfo-pr-t input').forEach((x) => { x.checked = false; }); refrescar(); });
      $('#pfo-practicar').addEventListener('click', () => nuevaPractica(marcadas().map((i) => ({ ref: i, casoId: pr.querySelector(`select[data-c="${i}"]`).value || null })), $('#pfo-pr-reloj').checked));
    }
    b('#pfo-retomar', () => { S = leerGuardado(); if (S.modo !== 'practica') iniciarIntegridad(true); S.estaciones.forEach((E) => { E.evaluando = false; }); vistaEstacionSegunFase(); });
    b('#pfo-descartar', () => { if (confirm('Se pierde el examen en curso. ¿Empezar uno nuevo?')) { limpiarGuardado(); try { window.ExamIntegridad && ExamIntegridad.abandonar(); } catch (_) {} nuevoExamen(); } });
    document.querySelectorAll('.pfo-trat button').forEach((btn) => btn.addEventListener('click', () => {
      try { localStorage.setItem(LS_TRAT, btn.dataset.t); } catch (_) {}
      document.querySelectorAll('.pfo-trat button').forEach((x) => { const on = x === btn; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
      const e = $('#pfo-empezar'); if (e) e.disabled = false; const av = $('#pfo-trat-aviso'); if (av) av.hidden = true;
    }));
    revelar();
  }

  async function nuevoExamen() {
    if (!esAdmin()) { toast('Acceso restringido.'); return; }
    if (!tratamiento()) { toast('Elegí cómo querés que te felicitemos: Doctora o Doctor.'); return; }
    if (!confirm('Vas a comenzar el ECOE FINAL. No se puede pausar ni volver atrás. ¿Empezamos?')) return;
    if (window.ExamIntegridad) { const ok = await ExamIntegridad.pedirAceptacion({ escrito: true }); if (!ok) return; }
    const ult = hist().slice(-1)[0]; const previos = new Set((ult && ult.casos) || []);   // se evita repetir el caso del intento anterior
    S = { idx: 0, creado: Date.now(), forzado: false, estaciones: CFG.estaciones.map((cfgE, i) => {
      const cs = (cfgE.casos_oficiales || []).filter((id) => CASOS[id]); const libres = cs.filter((id) => !previos.has(id)); const pool = libres.length ? libres : cs;
      return { id: cfgE.id, ref: i, casoId: pool.length ? pool[Math.floor(Math.random() * pool.length)] : null, hist: [], tema: '', fin: 0, fase: 'caso', resultado: null, cerrada: false, docs: [], proc: null };
    }) };
    guardar(); iniciarIntegridad(false); vistaEstacion(false);
  }

  // Modo práctica: las estaciones y casos que elige el alumno, sin reglas anti-trampa y con revisión al terminar cada estación
  function nuevaPractica(sel, conReloj) {
    if (!esAdmin()) { toast('Acceso restringido.'); return; }
    S = { modo: 'practica', sinReloj: !conReloj, idx: 0, creado: Date.now(), forzado: false, estaciones: sel.map((x) => {
      const cfgE = CFG.estaciones[x.ref]; const cs = (cfgE.casos_oficiales || []).filter((id) => CASOS[id]);
      return { id: cfgE.id, ref: x.ref, casoId: x.casoId && CASOS[x.casoId] ? x.casoId : (cs.length ? cs[Math.floor(Math.random() * cs.length)] : null), hist: [], tema: '', fin: 0, fase: 'caso', resultado: null, cerrada: false, docs: [], proc: null };
    }) };
    guardar(); vistaEstacion(false); window.scrollTo({ top: 0 });
  }
  function vistaEstacionSegunFase() {
    const E = estActual();
    S.estaciones.forEach((x, i) => { if (x.terminada && !x.cerrada) evaluarSegundoPlano(i); });   // corrige lo que quedó pendiente
    if (E && E.terminada) siguienteOFin(); else if (E && E.fase === 'proc' && !E.proc) vistaProcedimiento(true); else vistaEstacion(true);
  }
  const DOCS = [['receta', '💊', 'Receta médica', 'La prescripción de tu tratamiento'], ['examenes', '🧪', 'Solicitud de estudios', 'Laboratorio, imágenes, ECG…'], ['certificado', '📄', 'Certificado médico', 'Constancia de lo que constataste']];
  let cerrarMenuDocs = null;
  function vistaEstacion(restaurar) {
    const E = estActual(); const cfgE = CFG.estaciones[E.ref];
    if (E.casoId === undefined) { const cs = (cfgE.casos_oficiales || []).filter((id) => CASOS[id]); E.casoId = cs.length ? cs[Math.floor(Math.random() * cs.length)] : null; }
    main.innerHTML = `
      ${barraHtml(cfgE, `<div class="pfo-docs"><button type="button" class="pfo-btn sec pfo-btn-doc" id="pfo-docs-b" style="padding:7px 12px;font-size:.78rem" aria-haspopup="true" aria-expanded="false">📝 Documentos ▾</button><div class="pfo-docs-menu" id="pfo-docs-m" hidden>${DOCS.map(([id, ic, t, d]) => `<button type="button" data-doc="${id}"><span style="font-size:1.2rem">${ic}</span><span>${t}<small>${d}</small></span></button>`).join('')}</div></div>`)}
      <div class="pfo-chat" id="pfo-chat" aria-live="polite"></div>
      <div class="pfo-in"><textarea id="pfo-txt" placeholder="Escribí lo que le preguntás o indicás al paciente, o la maniobra que realizás…" maxlength="2500"></textarea><button class="pfo-btn" id="pfo-env">Enviar ➤</button></div>
      <div class="pfo-acc"><small>El evaluador solo responde lo que pedís. No hay pistas. Examen protegido: no salgas de la pantalla ni copies.</small><button class="pfo-link" id="pfo-term">Terminar esta estación</button></div>`;
    E.hist.forEach((m) => (m.sis ? burbuja('sistema', m.vista || 'Documento entregado.') : burbuja(m.rol, m.texto)));
    $('#pfo-env').addEventListener('click', enviar);
    $('#pfo-txt').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviar(); });
    $('#pfo-term').addEventListener('click', () => { if (!pendiente && confirm('¿Terminar esta estación ahora? No se puede volver a ella.')) cerrarEstacion('manual'); });
    const menu = $('#pfo-docs-m'), bd = $('#pfo-docs-b');
    bd.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; bd.setAttribute('aria-expanded', String(!menu.hidden)); actualizarMenuDocs(); });
    menu.addEventListener('click', (e) => { const x = e.target.closest('[data-doc]'); if (x && !x.disabled) { menu.hidden = true; abrirDocumento(x.dataset.doc); } });
    if (cerrarMenuDocs) document.removeEventListener('click', cerrarMenuDocs);
    cerrarMenuDocs = () => { if (menu && !menu.hidden) menu.hidden = true; }; document.addEventListener('click', cerrarMenuDocs);
    if (!E.fin && !S.sinReloj) E.fin = Date.now() + minutosDe(cfgE, E) * 60000;
    guardar(); contador(); clearInterval(timer); timer = setInterval(tic, 500); tic();
    if (!E.hist.length) iniciarEstacion(); else fijar(true);
  }
  function actualizarMenuDocs() { const E = estActual(); document.querySelectorAll('#pfo-docs-m [data-doc]').forEach((b) => { b.disabled = !!E.docs.some((x) => x.tipo === b.dataset.doc); }); }
  function burbuja(rol, texto) {
    const c = $('#pfo-chat'); if (!c) return;
    const d = document.createElement('div'); const ev = rol === 'ia' && /^\s*\[Evaluador/i.test(texto);
    d.className = 'pfo-msg ' + (rol === 'usuario' ? 'yo' : rol === 'sistema' ? 'sis' : 'ia' + (ev ? ' ev' : '')); d.textContent = texto; c.appendChild(d); c.scrollTop = c.scrollHeight;
  }
  const fijar = (on) => { const t = $('#pfo-txt'), b = $('#pfo-env'); if (t) t.disabled = !on; if (b) b.disabled = !on; if (on && t) t.focus(); };
  const turnosUsados = () => estActual().hist.filter((m) => m.rol === 'usuario' && !m.sis).length;
  function contador() { const el = $('#pfo-turnos'); if (el) el.textContent = `Intervenciones ${turnosUsados()}/${CFG.criterios.maxIntervencionesPorEstacion}`; }
  function tic() {
    if (!S || S.forzado) return; const E = estActual(); if (!E || E.cerrada || E.terminada) return;
    if (S.sinReloj) { const el0 = $('#pfo-timer'); if (el0 && el0.textContent !== 'Sin reloj') el0.textContent = 'Sin reloj'; return; }
    const fin = E.fase === 'proc' ? E.procFin : E.fin; if (!fin || E.fase === 'eval') return;
    const resto = Math.max(0, Math.round((fin - Date.now()) / 1000)); const el = $('#pfo-timer'); if (!el) return;
    el.textContent = `${String(Math.floor(resto / 60)).padStart(2, '0')}:${String(resto % 60).padStart(2, '0')}`; el.classList.toggle('poco', resto <= 180 && resto > 60); el.classList.toggle('urge', resto <= 60);
    if (resto <= 0 && !pendiente) {
      if (E.fase === 'proc') { toast('⌛ Se acabó el tiempo del procedimiento.'); entregarProcedimiento('tiempo'); }
      else { toast('⌛ Se acabó el tiempo de la estación.'); cerrarEstacion('tiempo'); }
    }
  }
  const pensando = (on) => { const c = $('#pfo-chat'); if (!c) return; const v = $('#pfo-pens'); if (v) v.remove(); if (on) { const d = document.createElement('div'); d.id = 'pfo-pens'; d.className = 'pfo-pensando'; d.innerHTML = '<i></i><i></i><i></i>'; c.appendChild(d); c.scrollTop = c.scrollHeight; } };

  async function turno(mensaje) {
    const E = estActual(); pendiente = true; fijar(false); pensando(true);
    try {
      const previo = E.hist.slice(0, -1);
      const primero = S.idx === 0 && previo.length === 0;
      const d = await llamarIA({ modo: 'ecoe_final', submodo: 'estacion_aleatoria', system_prompt: promptEstacion(E.ref) + temaPrompt(E.tema), historial: previo.map((m) => ({ rol: m.rol, texto: m.texto })), mensaje, es_primer_turno: !!primero });
      pensando(false);
      if (!S || S.forzado) return;
      E.hist.push({ rol: 'ia', texto: d.texto }); burbuja('ia', d.texto); guardar(); contador(); fijar(true);
      if (turnosUsados() >= CFG.criterios.maxIntervencionesPorEstacion) cerrarEstacion('turnos');
    } catch (err) {
      pensando(false); const msg = (err && err.message) ? err.message : 'No se pudo contactar al simulador.';
      fijar(true); burbuja('sistema', '⚠️ ' + msg + ' Volvé a enviar tu mensaje.');
      const t = $('#pfo-txt'); if (t && E.hist.length && E.hist[E.hist.length - 1].rol === 'usuario' && !E.hist[E.hist.length - 1].sis) { t.value = E.hist.pop().texto; guardar(); }
    } finally { pendiente = false; }
  }
  // Estaciones con rúbrica oficial: el puntaje lo calcula el sistema a partir del nivel que la IA asignó a cada ítem (insuficiente 0, regular mitad, suficiente máximo)
  function aplicarRubrica(E, ev) {
    const c = casoDe(E); if (!c || !Array.isArray(ev.rubrica)) return;
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
    ev.puntaje = Math.round(total * 10) / 10; ev.puntaje_max = maxTotal; ev.nota_caso = Math.round((total / maxTotal) * 100) / 10; ev.nota_final = ev.nota_caso;
    const dec = (b) => (bloques[b] ? Math.round((bloques[b].o / bloques[b].m) * 100) / 10 : null);
    if (dec('Anamnesis') != null) ev.semiologia = dec('Anamnesis'); if (dec('Plan diagnóstico') != null) ev.diagnostico = dec('Plan diagnóstico'); if (dec('Tratamiento') != null) ev.terapeutica = dec('Tratamiento');
  }
  // Parte práctica escrita: cada paso de la lista de cotejo vale 1 (los críticos 2); cumple = completo, parcial = mitad
  function aplicarProcedimiento(E, ev) {
    const pr = procDe(E); if (!pr || !E.proc) return;
    const o = ev.procedimiento || {}; const lis = (a) => new Set((Array.isArray(a) ? a : []).map((x) => String(x)));
    const cumple = lis(o.cumple), parcial = lis(o.parcial); const vacio = String(E.proc.texto || '').trim().length < 30;
    let pts = 0, max = 0;
    const pasos = pr.pasos.map((p) => {
      const w = p.critico ? 2 : 1; const k = String(p.n); const nivel = vacio ? 'no' : cumple.has(k) ? 'cumple' : parcial.has(k) ? 'parcial' : 'no';
      max += w; pts += nivel === 'cumple' ? w : nivel === 'parcial' ? w / 2 : 0;
      return { n: p.n, texto: p.texto, critico: p.critico, nivel };
    });
    ev.procedimiento_detalle = { id: pr.id, titulo: pr.titulo, icono: pr.icono, pasos, nota: Math.round((pts / max) * 100) / 10, vacio };
  }
  // Nota final de la estación: caso (y procedimiento, si lo hay) con los topes de error crítico y de parte práctica sin resolver
  function cerrarNota(E, ev) {
    if (ev.nota_caso == null) return;
    let nota = ev.nota_caso; const pd = ev.procedimiento_detalle; const w = CFG.criterios.pesoProcedimiento || 0.25;
    if (pd) nota = (1 - w) * ev.nota_caso + w * pd.nota;
    nota = Math.round(nota * 10) / 10;
    if (ev.errores_criticos_cometidos && ev.errores_criticos_cometidos.length) nota = Math.min(nota, 5);   // un error crítico desaprueba la estación aunque el puntaje sea alto
    if (pd && pd.vacio) nota = Math.min(nota, CFG.criterios.topeSinPractica || 5);                          // sin parte práctica no se aprueba la estación
    ev.nota_final = nota;
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
    const E = estActual(); E.hist.push({ rol: 'usuario', texto: v }); burbuja('usuario', v); t.value = ''; guardar(); contador(); turno(v);
  }

  // ------------------------------------------------------------------ documentos médicos (recetario en modo examen, dentro de un iframe)
  let docAbierto = null;
  async function abrirDocumento(tipo) {
    const E = estActual(); if (!E || E.cerrada || pendiente || docAbierto) return;
    if (E.docs.some((x) => x.tipo === tipo)) { toast('Ya redactaste ese documento en esta estación.'); return; }
    pendiente = true; fijar(false); toast('Preparando el recetario…');
    let est = {};
    try {   // se le pide a la IA solo la edad y el sexo del paciente de la estación, para que el documento sea de ese paciente
      const r = await llamarIA({ modo: 'ecoe_final', submodo: 'estacion_aleatoria', system_prompt: promptEstacion(E.ref) + temaPrompt(E.tema), historial: E.hist.map((m) => ({ rol: m.rol, texto: m.texto })), es_primer_turno: false,
        mensaje: '[Instrucción de sistema — no es un turno del alumno] Respondé ÚNICAMENTE con un objeto JSON {"edad": número, "sexo": "F" o "M"} con la edad y el sexo del paciente de esta estación, sin ninguna otra palabra y sin evaluación.' });
      const m = /\{[^{}]*\}/.exec(String((r && r.texto) || '')); if (m) est = JSON.parse(m[0]);
    } catch (e) { console.warn('[PFO] no se pudo obtener edad y sexo del paciente:', e && e.message); }
    pendiente = false;
    if (!S || S.forzado || E.cerrada) return;
    try { sessionStorage.setItem('nika_ecoe_receta', JSON.stringify({ edad: Number(est.edad) || null, sexo: est.sexo === 'F' || est.sexo === 'M' ? est.sexo : null, doc: tipo })); } catch (_) {}
    const def = DOCS.find((d) => d[0] === tipo);
    const ov = document.createElement('div'); ov.id = 'pfo-ov'; ov.className = 'pfo-ov'; ov.dataset.tipo = tipo;
    ov.innerHTML = `<div class="pfo-ov-h">${def[1]} Parte práctica · ${def[2]} <small>${CFG.criterios.documentoMin} minutos · sin ayudas · se corrige la forma y el tribunal juzga el contenido</small></div><iframe src="recetarios.html?embed=ecoe" title="${esc(def[2])}"></iframe>`;
    document.body.appendChild(ov); docAbierto = tipo; pausarIntegridad();   // hacer clic dentro del iframe le saca el foco a esta ventana: no cuenta como infracción
  }
  function cerrarOverlayDoc() { const ov = $('#pfo-ov'); if (ov) ov.remove(); if (docAbierto) { docAbierto = null; reanudarIntegridad(); } }
  async function documentoEntregado(d) {
    const tipo = docAbierto; cerrarOverlayDoc();
    if (!tipo || !S || S.forzado) return; const E = estActual(); if (!E || E.cerrada) return;
    const def = DOCS.find((x) => x[0] === tipo);
    if (!d || d.estado !== 'entregado') { toast('Documento cancelado: podés volver a abrirlo.'); fijar(true); return; }
    const f = (arr) => (arr && arr.length ? arr.join('; ') : 'ninguna'); const seg = d.segundos || 0;
    E.docs.push({ tipo, pct: d.pct, nivel: d.nivel, fallas: d.fallas || [], graves: d.graves || [], texto: d.texto || '' });
    const txt = `[Sistema — parte práctica] El alumno redactó ${def[2].toLowerCase()} en el recetario en modo examen (${d.motivo === 'tiempo' ? 'se agotó el tiempo' : 'entregado a tiempo'}, ${Math.floor(seg / 60)} min ${seg % 60} s de ${CFG.criterios.documentoMin}). Puntaje de forma y legalidad: ${d.pct}/100 (${d.nivel}; ${d.ok} de ${d.total} criterios). Fallas de forma: ${f(d.fallas)}. Errores graves: ${f(d.graves)}. Texto redactado: «${String(d.texto || '').replace(/\n+/g, ' / ')}». Respondé solo [Evaluador: Documento recibido.] y continuá la estación; al evaluar, juzgá el CONTENIDO contra el caso y tené en cuenta la forma.`;
    const vista = `📝 ${def[2]} entregada · forma ${d.pct}/100 (${d.nivel})`;
    E.hist.push({ rol: 'usuario', texto: txt, sis: true, vista }); burbuja('sistema', vista); guardar(); contador(); turno(txt);
  }
  window.addEventListener('message', (e) => { if (e.origin !== location.origin || !e.data || e.data.nika !== 'recetario-ecoe') return; documentoEntregado(e.data); });

  // ------------------------------------------------------------------ cierre de la estación: procedimiento escrito (si lo hay) y paso a la siguiente
  // La nota y la revisión NO se muestran hasta terminar todo el circuito; mientras el alumno sigue, la IA corrige las estaciones ya cerradas en segundo plano.
  function cerrarEstacion(motivo) {
    const E = estActual(); if (E.terminada || pendiente) return; clearInterval(timer); cerrarOverlayDoc();
    if (!E.hist.some((m) => m.rol === 'usuario' && !m.sis && m.texto !== MSG_INICIO)) { // sin ninguna intervención: no hay nada que evaluar
      E.terminada = true; E.resultado = resultadoNulo('No hubo intervenciones en esta estación.'); E.cerrada = true; guardar(); siguienteOFin(); return;
    }
    E.motivoCierre = motivo;
    if (procDe(E) && !E.proc) { E.fase = 'proc'; guardar(); vistaProcedimiento(false); return; }
    finalizarEstacionAlumno(motivo);
  }
  function vistaProcedimiento(restaurar) {
    const E = estActual(); const cfgE = CFG.estaciones[E.ref]; const pr = procDe(E); const max = CFG.criterios.procedimientoMin;
    if (!E.procFin) { E.procIni = Date.now(); E.procFin = S.sinReloj ? 0 : E.procIni + max * 60000; guardar(); }
    main.innerHTML = `${barraHtml(cfgE)}
      <section class="pfo-proc">
        <div class="pfo-proc-h"><span class="ic">${pr.icono}</span><div><h2>Parte práctica · ${esc(pr.titulo)}</h2><small>Procedimiento escrito · ${S.sinReloj ? 'sin límite de tiempo' : `hasta ${max} minutos o hasta que lo entregues`}</small></div></div>
        <p>Describí, <b>en orden y con el mayor detalle posible</b>, cómo realizás este procedimiento sobre el paciente de la estación: preparación y materiales, comunicación y consentimiento, bioseguridad, la técnica paso a paso, el cierre y el registro. Se corrige contra la lista de cotejo: no se acepta nada que no esté escrito.</p>
        <textarea id="pfo-proc-txt" maxlength="6000" placeholder="1) Me presento y le explico el procedimiento…&#10;2) …"></textarea>
        <div class="pfo-proc-f"><small>Sin ayudas. Cuando se acabe el tiempo se entrega lo que hayas escrito.</small><button class="pfo-btn pulso" id="pfo-proc-ok">Entregar y continuar ➤</button></div>
      </section>`;
    const t = $('#pfo-proc-txt'); t.value = E.procBorrador || ''; t.addEventListener('input', () => { E.procBorrador = t.value; clearTimeout(t._g); t._g = setTimeout(guardar, 400); }); t.focus();
    $('#pfo-proc-ok').addEventListener('click', () => {
      if (t.value.trim().length < 30 && !confirm('Casi no escribiste nada: si lo entregás así, la estación no puede superar 5. ¿Entregar igual?')) return;
      entregarProcedimiento('manual');
    });
    clearInterval(timer); timer = setInterval(tic, 500); tic();
  }
  function entregarProcedimiento(motivo) {
    const E = estActual(); if (pendiente || E.fase !== 'proc' || E.proc) return; clearInterval(timer);
    const t = $('#pfo-proc-txt'); const texto = (t ? t.value : E.procBorrador || '').trim().slice(0, 6000);
    E.proc = { texto, motivo, seg: Math.max(0, Math.round((Date.now() - (E.procIni || Date.now())) / 1000)) };
    finalizarEstacionAlumno(E.motivoCierre || motivo);
  }
  function finalizarEstacionAlumno(motivo) {
    const E = estActual(); clearInterval(timer); E.fase = 'eval'; E.terminada = true; E.motivoCierre = motivo; guardar();
    evaluarSegundoPlano(S.idx); siguienteOFin();
  }
  const todasCorregidas = () => S.estaciones.every((E) => E.cerrada);
  // Corrección de una estación ya terminada, sin bloquear al alumno
  async function evaluarSegundoPlano(i) {
    const E = S.estaciones[i]; if (!E || E.cerrada || E.evaluando) return; E.evaluando = true; E.evalError = null;
    try {
      const d = await llamarIA({ modo: 'ecoe_final', submodo: 'estacion_aleatoria', system_prompt: promptEstacion(E.ref, i) + temaPrompt(E.tema), historial: E.hist.map((m) => ({ rol: m.rol, texto: m.texto })), mensaje: mensajeCierre(E), es_primer_turno: false, accion: 'evaluar_caso' });
      const ev = parsearEvaluacion(d.texto); if (!ev) throw new Error('No se pudo generar la evaluación de la estación.');
      aplicarRubrica(E, ev); aplicarProcedimiento(E, ev); cerrarNota(E, ev); E.resultado = ev; E.cerrada = true;
    } catch (err) { E.evalError = (err && err.message) || 'No se pudo corregir la estación.'; }
    finally { E.evaluando = false; if (S) { guardar(); alCorregir(); } }
  }
  function alCorregir() {
    const chip = $('#pfo-bg'); if (chip) chip.innerHTML = estadoCorreccion();
    if (S.esperando) { if (todasCorregidas()) { S.esperando = false; vistaFinal(); } else vistaEspera(); }
  }
  function estadoCorreccion() {
    const t = S.estaciones.filter((E) => E.terminada); const ok = t.filter((E) => E.cerrada).length; const err = t.some((E) => E.evalError && !E.cerrada && !E.evaluando);
    if (!t.length) return '';
    return err ? '⚠️ Una estación no se pudo corregir: se reintenta al final.' : ok === t.length ? `✅ ${ok} ${ok === 1 ? 'estación corregida' : 'estaciones corregidas'} (la nota se muestra al final)` : `<span class="pfo-spin"></span> Corrigiendo tus estaciones en segundo plano… ${ok}/${t.length}`;
  }
  // Al pasar de estación: animación de transición con la próxima especialidad
  function animarPaso(cfgE, n, total, listo) {
    if (reducido()) { listo(); return; }
    const w = document.createElement('div'); w.className = 'pfo-wipe'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = `<div class="pfo-wipe-c"><div class="ic">${cfgE.icono}</div><small>Estación ${n} de ${total}</small><h2>${esc(cfgE.nombre)}</h2><div class="pfo-wipe-b"><b></b></div></div>`;
    document.body.appendChild(w); setTimeout(listo, 850); setTimeout(() => { w.classList.add('sale'); setTimeout(() => w.remove(), 600); }, 1700);
  }
  function siguienteOFin() {
    clearInterval(timer); const ult = S.idx >= S.estaciones.length - 1;
    if (ult) { irAlFinal(); return; }
    const sig = CFG.estaciones[S.estaciones[S.idx + 1].ref];
    const riel = S.estaciones.map((x, i) => { const c = CFG.estaciones[x.ref]; return `<i class="${i <= S.idx ? 'hecha' : i === S.idx + 1 ? 'sig' : ''}" title="${esc(c.nombre)}">${i <= S.idx ? '✓' : c.icono}</i>`; }).join('');
    main.innerHTML = `<div class="pfo-trans"><div class="pfo-tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>Estación ${S.idx + 1} completada</h2><p>Tomá aire. Como en el examen real, no se puede volver atrás y la nota se muestra recién al terminar todo el circuito.</p><div class="pfo-riel">${riel}</div><p>Próxima estación: <b>${sig.icono} ${esc(sig.nombre)}</b></p><div class="pfo-bg" id="pfo-bg">${estadoCorreccion()}</div><button class="pfo-btn pulso" id="pfo-sig">Pasar a la siguiente estación ➤</button></div>`;
    $('#pfo-sig').addEventListener('click', () => { const b = $('#pfo-sig'); if (b) b.disabled = true; animarPaso(sig, S.idx + 2, S.estaciones.length, () => { S.idx++; guardar(); vistaEstacion(false); window.scrollTo({ top: 0 }); }); });
  }
  function irAlFinal() { if (todasCorregidas()) vistaFinal(); else { S.esperando = true; vistaEspera(); } }
  function vistaEspera() {
    S.esperando = true; const t = S.estaciones.filter((E) => E.terminada); const ok = t.filter((E) => E.cerrada).length;
    const fallo = S.estaciones.filter((E) => E.terminada && !E.cerrada && !E.evaluando && E.evalError);
    S.estaciones.forEach((E, i) => { if (E.terminada && !E.cerrada && !E.evaluando && !E.evalError) evaluarSegundoPlano(i); });
    main.innerHTML = `<div class="pfo-trans"><div class="ic" style="animation:pfFlota 3s ease-in-out infinite">📋</div><h2>${fallo.length ? 'No se pudo corregir una estación' : 'Terminaste el circuito'}</h2><p>${fallo.length ? esc(fallo[0].evalError) : 'El tribunal está terminando de corregir tus estaciones con la rúbrica. En unos segundos ves tu nota y la revisión completa.'}</p>
      ${fallo.length ? '<button class="pfo-btn" id="pfo-reint">🔄 Reintentar la corrección</button>' : `<div class="pfo-barra-c"><b style="width:${t.length ? Math.round((ok / t.length) * 100) : 0}%"></b></div><small style="color:var(--pf-mut)">${ok} de ${t.length} estaciones corregidas</small>`}</div>`;
    const b = $('#pfo-reint'); if (b) b.addEventListener('click', () => { S.estaciones.forEach((E) => { if (!E.cerrada) E.evalError = null; }); vistaEspera(); });
  }

  // ------------------------------------------------------------------ resultado final
  function detalleEstacion(E, abierto) {
    const C = CFG.criterios; const c = CFG.estaciones[E.ref]; const r = E.resultado || resultadoNulo(''); const n = Math.max(0, Math.min(10, Number(r.nota_final) || 0));
    return `<details class="pfo-det" ${abierto ? 'open' : ''}><summary>${c.icono} ${esc(c.nombre)} · ${fmtNota(n)}/10${r.principal_debilidad ? ' — ' + esc(r.principal_debilidad) : ''}</summary>${r.devolucion_docente ? `<p style="line-height:1.55;font-size:.88rem">${esc(r.devolucion_docente).replace(/\\n|\n/g, '<br>')}</p>` : ''}${renderRubricaOficial(r)}${renderProcedimiento(r)}${renderDocs(E)}${renderRevision(r)}</details>`;
  }
  function renderRevision(d) {
    const items = Array.isArray(d.revision_detallada) ? d.revision_detallada.filter((i) => i && (i.fallo_o_falto || i.hizo_bien || i.como_debia_hacerlo)) : [];
    const col = (r) => (/^logr/i.test(r) ? '#22c55e' : /^parc/i.test(r) ? '#f59e0b' : '#ef4444');
    const fila = (ico, tit, tx) => (tx ? `<div style="margin-top:5px">${ico} <b>${tit}:</b> ${esc(tx)}</div>` : '');
    return items.map((i) => `<div class="pfo-rv" style="border-left-color:${col(String(i.resultado || ''))}"><div class="h"><span>${esc(i.dominio || '')}</span><span style="color:${col(String(i.resultado || ''))}">${esc(i.resultado || '')}</span></div>${fila('✅', 'Hiciste bien', i.hizo_bien)}${fila('❌', 'Falló o faltó', i.fallo_o_falto)}${fila('💡', 'Cómo debías hacerlo', i.como_debia_hacerlo)}</div>`).join('')
      + (d.respuesta_modelo ? `<div class="pfo-mod"><b>📘 Respuesta modelo:</b> ${esc(d.respuesta_modelo)}</div>` : '');
  }
  function renderRubricaOficial(r) {
    if (!r.rubrica_detalle) return '';
    const col = (n) => (n === 'suficiente' ? '#22c55e' : n === 'regular' ? '#f59e0b' : '#ef4444');
    const lbl = { suficiente: 'Suficiente', regular: 'Regular', insuficiente: 'Insuficiente' };
    const crit = (r.errores_criticos_cometidos || []).length ? `<div class="pfo-mod" style="background:rgba(239,68,68,.12);border:1px solid #ef4444;border-style:solid"><b>⛔ Error crítico: la estación no puede superar 5.</b><br>${r.errores_criticos_cometidos.map((x) => '• ' + esc(x)).join('<br>')}</div>` : '';
    return crit + `<div class="pfo-mod" style="background:rgba(245,158,11,.1);border-color:#f59e0b"><b>📋 Rúbrica de la estación: ${fmtNota(r.puntaje)} de ${r.puntaje_max} puntos</b></div>`
      + r.rubrica_detalle.map((x) => `<div class="pfo-rv" style="border-left-color:${col(x.nivel)}"><div class="h"><span>${esc(x.bloque)} · ${esc(x.texto)}</span><span style="color:${col(x.nivel)}">${lbl[x.nivel]} · ${fmtNota(x.pts)}/${x.max}</span></div>${x.evidencia ? `<div style="margin-top:5px">🗣️ <b>Lo que hiciste:</b> ${esc(x.evidencia)}</div>` : ''}${x.nivel !== 'suficiente' ? `<div style="margin-top:5px">💡 <b>Para el puntaje completo:</b> ${esc(x.esperado)}</div>` : ''}</div>`).join('');
  }
  function renderProcedimiento(r) {
    const p = r.procedimiento_detalle; if (!p) return '';
    const col = { cumple: '#22c55e', parcial: '#f59e0b', no: '#ef4444' }, lbl = { cumple: 'Cumple', parcial: 'Parcial', no: 'No cumple' };
    const fallos = p.pasos.filter((x) => x.nivel !== 'cumple');
    return `<div class="pfo-mod" style="background:rgba(124,58,237,.1);border-color:#7c3aed"><b>${p.icono} Procedimiento: ${esc(p.titulo)} · ${fmtNota(p.nota)}/10</b> (vale ${Math.round((CFG.criterios.pesoProcedimiento || 0.25) * 100)} % de la estación)${p.vacio ? '<br>⛔ No escribiste el procedimiento: la estación no puede superar ' + (CFG.criterios.topeSinPractica || 5) + '.' : ''}</div>`
      + (S && S.modo === 'practica' ? `<details class="pfo-det" style="margin-top:8px"><summary>📘 Procedimiento modelo (lista de cotejo completa)</summary><ol style="font-size:.86rem;line-height:1.55;padding-left:20px">${p.pasos.map((x) => `<li>${x.critico ? '⭐ ' : ''}${esc(x.texto)}</li>`).join('')}</ol></details>` : '')
      + (fallos.length ? `<details class="pfo-det" style="margin-top:8px"><summary>Pasos que faltaron o quedaron incompletos (${fallos.length} de ${p.pasos.length})</summary>${fallos.map((x) => `<div class="pfo-rv" style="border-left-color:${col[x.nivel]}"><div class="h"><span>${x.critico ? '⭐ ' : ''}Paso ${esc(x.n)}</span><span style="color:${col[x.nivel]}">${lbl[x.nivel]}</span></div><div style="margin-top:4px">${esc(x.texto)}</div></div>`).join('')}</details>` : '<div class="pfo-mod">✅ Describiste todos los pasos de la lista de cotejo.</div>');
  }
  function renderDocs(E) {
    if (!E.docs || !E.docs.length) return '';
    return `<div class="pfo-mod" style="background:rgba(2,132,199,.08);border-color:#0284c7"><b>📝 Documentos redactados:</b><br>${E.docs.map((d) => { const def = DOCS.find((x) => x[0] === d.tipo); return `${def ? def[1] + ' ' + def[2] : esc(d.tipo)}: forma ${d.pct}/100 (${esc(d.nivel)})${d.fallas && d.fallas.length ? ' · a revisar: ' + d.fallas.map(esc).join(', ') : ''}`; }).join('<br>')}</div>`;
  }
  function vistaFinal() {
    const C = CFG.criterios, T = CFG.textos;
    const res = S.estaciones.map((E) => E.resultado || resultadoNulo(''));
    const notas = res.map((r) => Math.max(0, Math.min(10, Number(r.nota_final) || 0)));
    const global = notas.reduce((a, b) => a + b, 0) / notas.length;
    const desaprobadas = notas.filter((n) => n < C.notaMinEstacion).length;
    const practica = S.modo === 'practica';
    const forzado = !!S.forzado;
    const aprobado = !forzado && desaprobadas === 0 && (C.notaMinGlobal == null || global >= C.notaMinGlobal);   // reglamento PFO: se aprueba superando la totalidad de las estaciones
    const pilares = [['semiologia', '🩺 Semiología'], ['diagnostico', '🎯 Diagnóstico'], ['terapeutica', '💊 Terapéutica'], ['vocabulario', '📚 Vocabulario']];
    const prom = (k) => res.reduce((a, r) => a + (Number(r[k]) || 0), 0) / res.length;
    const trat = tratamiento() || 'Doctor'; const nombre = nombreUsuario();
    const debiles = S.estaciones.map((E, i) => ({ E, n: notas[i], r: res[i] })).filter((x) => x.n < C.notaMinEstacion && !x.E.noEvaluada);
    const cab = practica
      ? `<div class="medal">${desaprobadas ? '🎯' : '🏅'}</div><h1>Práctica terminada</h1><p>${notas.filter((n) => n >= C.notaMinEstacion).length} de ${notas.length} estaciones superaron el mínimo de ${C.notaMinEstacion}. Repasá el detalle de cada una: ahí está en qué te equivocaste y cómo sería la resolución modelo.</p>`
      : forzado
      ? `<div class="medal">⛔</div><h1>${esc(T.forzado_titulo)}</h1><p>${esc(T.forzado)}</p>`
      : aprobado
        ? `<div class="medal">🎓</div><h1>${esc(T.felicitaciones_titulo.replace('{tratamiento}', trat))}</h1>${nombre ? `<div class="quien">${esc(trat)} ${esc(nombre)}</div>` : ''}<p>${esc(T.felicitaciones)}</p>`
        : `<div class="medal">📚</div><h1>${esc(T.reintento_titulo)}</h1><p>${esc(T.reintento)}</p>`;
    main.innerHTML = `
      <section class="pfo-fin ${forzado ? 'rev' : aprobado && !practica ? 'ok' : 'no'}">
        ${cab}
        <div class="pfo-nota" style="color:${aprobado ? '#fde68a' : colorNota(global)}">${fmtNota(global)}<small> / 10</small></div>
        <div class="sub">${practica ? 'Promedio de la práctica' : 'Nota global del ECOE FINAL'}${desaprobadas && !forzado ? ` · ${desaprobadas} estación(es) por debajo de ${C.notaMinEstacion}` : ''}</div>
        <div class="pfo-pil">${pilares.map(([k, n]) => `<span>${n}: <b>${fmtNota(prom(k))}</b></span>`).join('')}</div>
        <div class="pfo-tabla">${S.estaciones.map((E, i) => { const c = CFG.estaciones[E.ref]; const cs = casoDe(E); return `<div class="pfo-fila" style="--d:${i}"><span>${c.icono} ${esc(c.nombre)}${cs ? `<small style="display:block;color:var(--pf-mut)">${esc(cs.nombre)}</small>` : ''}</span><b class="n" style="color:${colorNota(notas[i])}">${E.noEvaluada ? '—' : fmtNota(notas[i])}</b></div>`; }).join('')}</div>
        ${!aprobado && !forzado && debiles.length && !practica ? `<div class="pfo-reforzar"><b>🎯 Para reforzar antes del próximo intento:</b><ul>${debiles.map((x) => `<li>${CFG.estaciones[x.E.ref].icono} ${esc(CFG.estaciones[x.E.ref].nombre)}: ${esc(x.r.principal_debilidad || 'repasá el detalle de la estación')}</li>`).join('')}</ul></div>` : ''}
        <div id="pfo-integ"></div>
        <div class="pfo-cta" style="margin-top:20px;background:none;border:0;padding:0;flex-direction:row;flex-wrap:wrap;justify-content:center">${practica ? '<button class="pfo-btn pulso" id="pfo-rep">🔁 Repetir estos casos</button>' : ''}<button class="pfo-btn ${aprobado && !practica ? '' : practica ? 'sec' : 'pulso'}" id="pfo-otra">${practica ? '🎯 Elegir otra práctica' : aprobado ? '🔁 Rendir otro ECOE de práctica' : '🔁 Volver a intentarlo'}</button><a class="pfo-btn sec" href="campus.html">Volver al Campus</a></div>
      </section>
      ${S.estaciones.map((E, i) => (E.noEvaluada ? '' : detalleEstacion(E, notas[i] < C.notaMinEstacion))).join('')}`;
    $('#pfo-otra').addEventListener('click', () => { limpiarGuardado(); S = null; vistaIntro(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    const rp = $('#pfo-rep'); if (rp) { const sel = S.estaciones.map((E) => ({ ref: E.ref, casoId: E.casoId })), rl = !S.sinReloj; rp.addEventListener('click', () => nuevaPractica(sel, rl)); }
    if (!practica) try { const h = hist(); h.push({ fecha: new Date().toLocaleDateString('es-AR'), global: Math.round(global * 10) / 10, aprobado, revision: forzado, notas, casos: S.estaciones.map((E) => E.casoId) }); localStorage.setItem(LS_HIST(), JSON.stringify(h.slice(-20))); } catch (_) {}
    try { if (window.NikaRendimiento && !forzado) window.NikaRendimiento.guardarExamen({ modulo: 'clinica', mode: practica ? 'ecoe_final_pfo_practica' : 'ecoe_final_pfo', total: S.estaciones.length, correct: notas.filter((n) => n >= C.notaMinEstacion).length, blank: 0, score: Math.round(global * 10) / 10, scorePct: Math.round(global * 10), durationSeconds: Math.round((Date.now() - S.creado) / 1000) }); } catch (_) {}
    if (!practica) cerrarIntegridad();
    limpiarGuardado(); if (aprobado && !practica) celebrar(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Cierra el intento de integridad y, si el sistema registró algo, explica qué detectó (igual que en los demás exámenes)
  async function cerrarIntegridad() {
    if (!window.ExamIntegridad || !ExamIntegridad.estado) return;
    try { const r = await ExamIntegridad.entregar({ exam: [], answers: {}, aciertos: null, puntaje: null }); const html = ExamIntegridad.mensajeFinalHTML(r, { aciertos: null }); const el = $('#pfo-integ'); if (el && html) el.innerHTML = html; }
    catch (e) { try { ExamIntegridad.abandonar(); } catch (_) {} }
  }

  // ------------------------------------------------------------------ celebración de egreso: birretes lanzados, togas, diplomas y confeti
  function celebrar() {
    if (reducido()) return;
    confeti();
    const cap = document.createElement('div'); cap.className = 'pfo-cel'; cap.setAttribute('aria-hidden', 'true'); document.body.appendChild(cap);
    const lluvia = ['🎓', '🥼', '🩺', '📜', '🎉', '⭐', '👩‍⚕️', '👨‍⚕️', '💐', '🏅', '✨', '🎊'];
    const r = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 44; i++) {
      const e = document.createElement('i'); e.className = 'cae'; e.textContent = lluvia[(Math.random() * lluvia.length) | 0];
      e.style.cssText = `--x:${r(0, 96).toFixed(1)}vw;--dx:${r(-14, 14).toFixed(1)}vw;--r:${Math.round(r(-720, 720))}deg;--t:${r(5, 9).toFixed(1)}s;font-size:${Math.round(r(22, 44))}px;animation-delay:${r(0, 3.2).toFixed(2)}s`;
      cap.appendChild(e);
    }
    for (let i = 0; i < 16; i++) {   // los birretes que se lanzan al aire
      const e = document.createElement('i'); e.className = 'lanza'; e.textContent = '🎓';
      e.style.cssText = `--x:${r(3, 92).toFixed(1)}vw;--dx:${r(-18, 18).toFixed(1)}vw;--h:${r(6, 38).toFixed(1)}vh;--r:${Math.round(r(-540, 540))}deg;--t:${r(3.2, 5.2).toFixed(1)}s;font-size:${Math.round(r(34, 60))}px;animation-delay:${r(0, 2.6).toFixed(2)}s`;
      cap.appendChild(e);
    }
    setTimeout(() => cap.remove(), 12500);
  }
  function confeti() {
    const cv = document.createElement('canvas'); cv.className = 'pfo-conf'; document.body.appendChild(cv); const x = cv.getContext('2d'); const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const col = ['#fde68a', '#f59e0b', '#38bdf8', '#a78bfa', '#22c55e', '#f472b6']; const P = Array.from({ length: 170 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: col[(Math.random() * col.length) | 0] }));
    let t0 = performance.now(); const paso = (t) => { x.clearRect(0, 0, W, H); P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (t - t0 < 6000) requestAnimationFrame(paso); else cv.remove(); };
    requestAnimationFrame(paso);
  }

  // ------------------------------------------------------------------ arranque
  async function iniciar() {
    try {
      if (window.NikaAuth && window.NikaAuth.ready) { try { await window.NikaAuth.ready; } catch (_) {} }
      // el rol se confirma con el servidor antes de mostrar nada
      await new Promise((ok) => { if (window.NikaAcceso && window.NikaAcceso.alVerificarPerfil) { let listo = false; const fin = () => { if (!listo) { listo = true; ok(); } }; window.NikaAcceso.alVerificarPerfil(fin); setTimeout(fin, 6000); } else ok(); });
      if (!esAdmin()) { vistaRestringida(); return; }
      const [r, rp] = await Promise.all([fetch('data/pfo/ecoe_final.json', { cache: 'no-cache' }), fetch('data/pfo/procedimientos.json', { cache: 'no-cache' }).catch(() => null)]);
      CFG = await r.json();
      try { PROC = rp && rp.ok ? (await rp.json()).procedimientos || {} : {}; } catch (_) { PROC = {}; }
      if (!window.PROMPTS_MATERIAS_BUILDERS) throw new Error('No se cargó el generador de estaciones.');
      await Promise.all(CFG.estaciones.flatMap((e) => (e.casos_oficiales || []).map(async (id) => { try { const rr = await fetch('data/pfo/casos/' + id + '.json', { cache: 'no-cache' }); CASOS[id] = await rr.json(); } catch (_) { /* si falla, ese caso no entra al sorteo */ } })));
      LISTO = true;
      vistaIntro();
    } catch (e) { main.innerHTML = `<div class="pfo-cargando">No se pudo cargar el examen (${esc(e && e.message)}). Recargá la página.</div>`; }
  }
  window.addEventListener('beforeunload', (e) => { if (S && !S.forzado && !S.estaciones.every((x) => x.cerrada)) { guardar(); e.preventDefault(); e.returnValue = ''; } });
  // Utilidad de auditoría: devuelve el prompt completo que recibe la IA para un caso (lo usa tools/exportar_pfo_casos.js)
  window.__PFO = { async prompt(estId, casoId) {
    while (!LISTO) await new Promise((ok) => setTimeout(ok, 20));
    const prev = S; S = { idx: 0, estaciones: CFG.estaciones.map((e, k) => ({ ref: k, casoId: e.id === estId ? casoId : null, tema: '' })) };
    try { const k = CFG.estaciones.findIndex((e) => e.id === estId); return promptEstacion(k) + temaPrompt(''); } finally { S = prev; }
  }, cfg: () => CFG, casos: () => CASOS, proc: () => PROC };
  iniciar();
})();
