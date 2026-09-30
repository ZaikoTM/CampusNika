// js/examIntegridad.js
// CAMPUS NIKA — Integridad de exámenes choice (Ginecología, Cirugía y módulos futuros).
//
//  • Detección: cambio de pestaña / pérdida de foco, copia-corte-pegado, menú contextual y atajos de inspección.
//  • Escalado: incidencias → advertencia amarilla (mensaje fijo) → si reincide, entrega forzada como "en_revision".
//  • Modo Estricto (una sola vía): sin "Anterior", sin saltar por la grilla, respuestas bloqueadas al avanzar.
//  • Backend: intento con started_at del servidor (RPC examen_abrir_intento / examen_iniciar), auditoría en
//    examen_incidencias y entrega validada por examen_entregar. Ver sql/examen_integridad.sql.
//
// Todo lo que toca la red es no bloqueante: si falla, el examen sigue y las incidencias quedan en cola local.

const ExamIntegridad = (() => {
  const CFG = {
    avisoEn: 3,                 // incidencias acumuladas que disparan la advertencia amarilla
    gracia_tras_aviso_ms: 3000, // el propio modal puede provocar un blur: se ignora un instante
    debounce_ms: 700,           // visibilitychange + blur ocurren juntos: cuentan como una sola incidencia
    minRapidoMs: 2000,          // aviso local de respuestas automáticas (el servidor vuelve a validarlo)
    lsIntento: 'nika_examen_integridad',
    lsPendientes: 'nika_examen_incidencias_pendientes',
    lsEstricto: 'nika_exam_estricto',
  };
  const MENSAJE_ADVERTENCIA = 'Te macheteaste, en NikaMed no se nos escapa nada, esto es una advertencia, si te observo haciendo trampa de vuelta te obligo a entregar el examen.';

  let st = null;          // estado del intento en memoria
  let activo = false;     // protecciones encendidas
  let hooks = {};         // { onForzarEntrega }
  let ultimoEvento = 0, enSegundoPlano = null;

  const cliente = () => (window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase)) || window.supabaseClient || null;
  const hayUsuario = () => { try { return !!JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) { return false; } };
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }, del(k) { try { localStorage.removeItem(k); } catch (_) {} } };

  // ------------------------------------------------------------------ preferencia "Modo Estricto"
  function leerEstricto() { return localStorage.getItem(CFG.lsEstricto) === '1'; }
  function guardarEstricto(v) { try { localStorage.setItem(CFG.lsEstricto, v ? '1' : '0'); } catch (_) {} document.querySelectorAll('.ei-toggle-estricto').forEach((c) => { c.checked = !!v; }); }
  function montarToggles() {
    document.querySelectorAll('.ei-toggle-estricto').forEach((c) => {
      c.checked = leerEstricto();
      if (!c.dataset.ei) { c.dataset.ei = '1'; c.addEventListener('change', () => guardarEstricto(c.checked)); }
    });
  }
  const esEstricto = () => !!(st && st.estricto);

  // ------------------------------------------------------------------ incidencias (auditoría)
  // registrarIncidencia(tipo, detalles): asíncrona y no bloqueante. Sin intento todavía o sin red → cola local.
  function registrarIncidencia(tipo, detalles) {
    const inc = { tipo_incidencia: tipo, detalles: detalles || {}, created_at: new Date().toISOString() };
    if (st) { st.incidencias.push(inc); persistir(); }
    console.warn('[Integridad] 🚨', tipo, detalles || {});
    setTimeout(() => enviarIncidencia(inc), 0);
    return inc;
  }
  async function enviarIncidencia(inc) {
    try {
      const c = cliente();
      const intento = st && st.intentoId;
      if (!c || !intento || !hayUsuario()) throw new Error('sin destino');
      const { data: { session } } = await c.auth.getSession();
      if (!session) throw new Error('sin sesión');
      const { error } = await c.from('examen_incidencias').insert({ examen_intento_id: intento, user_id: session.user.id, tipo_incidencia: inc.tipo_incidencia, detalles: inc.detalles });
      if (error) throw error;
      inc.enviada = true;
    } catch (e) {
      const cola = ls.get(CFG.lsPendientes) || [];
      cola.push({ ...inc, intento: st && st.intentoId });
      ls.set(CFG.lsPendientes, cola.slice(-50));
    }
  }
  async function reenviarPendientes() {
    const cola = ls.get(CFG.lsPendientes) || [];
    if (!cola.length) return;
    const c = cliente(); if (!c || !hayUsuario()) return;
    const resto = [];
    try {
      const { data: { session } } = await c.auth.getSession();
      for (const p of cola) {
        if (!p.intento || !session) { resto.push(p); continue; }
        const { error } = await c.from('examen_incidencias').insert({ examen_intento_id: p.intento, user_id: session.user.id, tipo_incidencia: p.tipo_incidencia, detalles: p.detalles });
        if (error) resto.push(p);          // p. ej. el intento ya se cerró: no se reintenta infinitamente
      }
    } catch (_) { return; }
    ls.set(CFG.lsPendientes, resto.filter((p) => (Date.now() - new Date(p.created_at).getTime()) < 24 * 3600e3));
  }

  // ------------------------------------------------------------------ escalado: advertencia → entrega forzada
  function contarIncidencia(tipo, detalles) {
    if (!activo || !st) return;
    const ahora = Date.now();
    if (st.avisadoEn && ahora - st.avisadoEn < CFG.gracia_tras_aviso_ms) return;   // el modal mismo puede robar el foco
    registrarIncidencia(tipo, detalles);
    st.advertencias++;
    persistir();
    if (st.avisado) { forzarEntrega(); return; }                                      // reincidió tras la advertencia
    if (st.advertencias >= CFG.avisoEn) mostrarAdvertencia();
  }

  function mostrarAdvertencia() {
    st.avisado = true; st.avisadoEn = Date.now(); persistir();
    if (document.getElementById('ei-aviso')) return;
    const ov = document.createElement('div');
    ov.id = 'ei-aviso'; ov.className = 'ei-overlay'; ov.setAttribute('role', 'alertdialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="ei-card ei-amarillo"><div class="ei-ico">⚠️</div><p class="ei-msg"></p><button type="button" class="ei-btn" id="ei-aviso-ok">Entendido</button></div>`;
    ov.querySelector('.ei-msg').textContent = MENSAJE_ADVERTENCIA;
    document.body.appendChild(ov);
    ov.querySelector('#ei-aviso-ok').onclick = () => { ov.remove(); if (st) st.avisadoEn = Date.now(); };
  }

  function forzarEntrega() {
    if (!st || st.forzada) return;
    st.forzada = true; persistir();
    const ov = document.createElement('div');
    ov.className = 'ei-overlay';
    ov.innerHTML = `<div class="ei-card ei-rojo"><div class="ei-ico">⛔</div><p class="ei-msg">Tu examen fue entregado automáticamente por incumplir las reglas. Quedó marcado <b>en revisión</b>.</p></div>`;
    document.body.appendChild(ov);
    document.getElementById('ei-aviso')?.remove();
    setTimeout(() => { ov.remove(); if (hooks.onForzarEntrega) hooks.onForzarEntrega(); }, 2200);
  }
  const fueForzada = () => !!(st && st.forzada);

  // ------------------------------------------------------------------ detectores
  function onVisibilidad() {
    if (!activo) return;
    if (document.hidden) inicioSegundoPlano('cambio_pestana', { evento: 'visibilitychange' });
    else finSegundoPlano();
  }
  function onBlur() { if (activo && !document.hidden) inicioSegundoPlano('foco_perdido', { evento: 'blur' }); }
  function onFocus() { if (activo) finSegundoPlano(); }
  function inicioSegundoPlano(tipo, detalles) {
    const ahora = Date.now();
    if (enSegundoPlano || ahora - ultimoEvento < CFG.debounce_ms) { if (!enSegundoPlano) return; if (tipo === 'cambio_pestana' && enSegundoPlano.tipo === 'foco_perdido') enSegundoPlano.tipo = 'cambio_pestana'; return; }
    ultimoEvento = ahora;
    enSegundoPlano = { tipo, desde: ahora, detalles };
    contarIncidencia(tipo, { ...detalles, pregunta: st && st.preguntaActual });
  }
  function finSegundoPlano() {
    if (!enSegundoPlano) return;
    const seg = Math.round((Date.now() - enSegundoPlano.desde) / 1000);
    ultimoEvento = Date.now();
    if (st && seg >= 1 && activo) { st.segundosFuera += seg; persistir(); console.log('[Integridad] Volvió tras', seg, 's fuera (acumulado', st.segundosFuera, 's)'); }
    enSegundoPlano = null;
  }

  function bloquear(e, motivo, extra) {
    if (!activo) return;
    e.preventDefault(); e.stopPropagation();
    contarIncidencia('copia_bloqueada', { motivo, ...(extra || {}) });
  }
  const onCtx = (e) => bloquear(e, 'menu_contextual');
  const onCopy = (e) => bloquear(e, 'copy');
  const onCut = (e) => bloquear(e, 'cut');
  const onPaste = (e) => bloquear(e, 'paste');
  function onKey(e) {
    if (!activo) return;
    const k = (e.key || '').toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    let motivo = null;
    if (e.key === 'F12') motivo = 'F12';
    else if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(k)) motivo = 'Ctrl+Shift+' + k.toUpperCase();
    else if (ctrl && !e.shiftKey && ['c', 'v', 'x', 'u'].includes(k)) motivo = 'Ctrl+' + k.toUpperCase();
    if (motivo) bloquear(e, 'atajo', { atajo: motivo });
  }

  function activar(opts) {
    hooks = opts || {};
    if (activo) return;
    activo = true;
    document.body.classList.add('ei-protegido');
    document.addEventListener('visibilitychange', onVisibilidad);
    window.addEventListener('blur', onBlur); window.addEventListener('focus', onFocus);
    document.addEventListener('contextmenu', onCtx, true);
    document.addEventListener('copy', onCopy, true); document.addEventListener('cut', onCut, true); document.addEventListener('paste', onPaste, true);
    document.addEventListener('keydown', onKey, true);
  }
  function desactivar() {
    activo = false; enSegundoPlano = null;
    document.body.classList.remove('ei-protegido', 'ei-estricto');
    document.removeEventListener('visibilitychange', onVisibilidad);
    window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus);
    document.removeEventListener('contextmenu', onCtx, true);
    document.removeEventListener('copy', onCopy, true); document.removeEventListener('cut', onCut, true); document.removeEventListener('paste', onPaste, true);
    document.removeEventListener('keydown', onKey, true);
    document.getElementById('ei-aviso')?.remove();
  }

  // ------------------------------------------------------------------ intento (servidor)
  function nuevoEstado(base) {
    return Object.assign({ intentoId: null, origen: 'legado', estricto: false, t0: Date.now(), advertencias: 0, avisado: false, avisadoEn: 0, forzada: false,
      segundosFuera: 0, incidencias: [], tiempos: {}, bloqueadas: [], preguntaActual: null, modulo: null }, base || {});
  }
  function persistir() { if (st) ls.set(CFG.lsIntento, st); }

  // Abre el intento en el servidor. Bancos JSON (legado): solo registra started_at y modo.
  async function iniciar({ modulo, modo, estricto, total, limiteSeg, intento, onForzarEntrega }) {
    if (onForzarEntrega) hooks = { onForzarEntrega };
    if (!st || !intento) st = nuevoEstado({ modulo });
    st.estricto = !!estricto; st.modulo = modulo; st.t0 = Date.now();
    if (intento) { st.intentoId = intento.intento_id; st.origen = 'seguro'; }
    document.body.classList.toggle('ei-estricto', st.estricto);
    persistir();
    activar(hooks);
    if (!st.intentoId) {
      try {
        const c = cliente();
        if (c && hayUsuario() && navigator.onLine) {
          const { data, error } = await c.rpc('examen_abrir_intento', { p_modulo: modulo, p_modo: modo || null, p_estricto: !!estricto, p_total: total || null, p_limite_seg: limiteSeg || null });
          if (error) throw error;
          st.intentoId = data.intento_id; persistir();
          console.log('[Integridad] ✅ Intento abierto en Supabase:', st.intentoId, st.estricto ? '(modo estricto)' : '');
        }
      } catch (e) { console.warn('[Integridad] No se pudo abrir el intento en el servidor (se rinde igual):', e && e.message); }
    }
    reenviarPendientes();
    // incidencias que ocurrieron antes de conocer el intento
    if (st.intentoId) st.incidencias.filter((i) => !i.enviada).forEach((i) => { i.enviada = true; enviarIncidencia(i); });
  }

  // Intento SEGURO: el servidor elige, mezcla y NO envía las claves. Devuelve el pool con la forma del motor
  // ({up,q,options:{a,b,..},correct:undefined}) o null si el banco no está en la base (se usa el JSON como antes).
  async function iniciarSeguro({ modulo, unidades, cantidad, modo, estricto, limiteSeg }) {
    try {
      const c = cliente();
      if (!c || !hayUsuario() || !navigator.onLine) return null;
      const { data, error } = await c.rpc('examen_iniciar', { p_modulo: modulo, p_unidades: unidades || null, p_cantidad: cantidad, p_modo: modo || null, p_estricto: !!estricto, p_limite_seg: limiteSeg || null });
      if (error) throw error;
      if (!data || !data.disponible) return null;
      st = nuevoEstado({ modulo, intentoId: data.intento_id, origen: 'seguro', estricto: !!estricto });
      const letras = ['a', 'b', 'c', 'd', 'e', 'f'];
      const pool = data.preguntas.map((p) => {
        const options = {}, oids = [];
        p.opciones.forEach((o, i) => { options[letras[i]] = o.texto; oids.push(o.opcion_id); });
        return { up: p.unidad, q: p.enunciado, options, correct: undefined, feedback: '', _pid: p.pregunta_id, _oids: oids };
      });
      console.log('[Integridad] 🔐 Intento seguro:', data.intento_id, '· preguntas:', pool.length, '· sin claves en el cliente');
      return { pool, intento: data };
    } catch (e) { console.warn('[Integridad] Banco seguro no disponible, se usa el JSON:', e && e.message); return null; }
  }

  // ------------------------------------------------------------------ tiempos por pregunta
  function preguntaMostrada(idx, largo) {
    if (!st) return;
    st.preguntaActual = idx;
    const t = st.tiempos[idx] || (st.tiempos[idx] = { ms_inicio: Date.now() - st.t0, largo: largo || 0 });
    if (largo) t.largo = largo;
    persistir();
  }
  function respuestaElegida(idx) {
    if (!st) return;
    const t = st.tiempos[idx] || (st.tiempos[idx] = { ms_inicio: Date.now() - st.t0, largo: 0 });
    const ahora = Date.now() - st.t0;
    if (t.ms_respuesta == null) {
      t.ms_respuesta = ahora;
      if (ahora - t.ms_inicio < CFG.minRapidoMs && (t.largo || 0) > 200) registrarIncidencia('tiempo_sospechoso', { pregunta: idx, ms: ahora - t.ms_inicio, largo: t.largo });
    } else { t.cambios = (t.cambios || 0) + 1; }
    persistir();
  }

  // ------------------------------------------------------------------ Modo Estricto
  function puedeIr(destino, actual) { return !esEstricto() || destino === actual; }
  function puedeRetroceder() { return !esEstricto(); }
  function bloquearPregunta(idx) { if (st && esEstricto() && !st.bloqueadas.includes(idx)) { st.bloqueadas.push(idx); persistir(); } }
  const estaBloqueada = (idx) => !!(st && esEstricto() && st.bloqueadas.includes(idx));

  // ------------------------------------------------------------------ entrega
  // exam: currentExam · answers: userAnswers {idx: letra}. Devuelve { estado, detalle? } o null si no hay intento.
  async function entregar({ exam, answers, aciertos, puntaje, cerrar = true }) {
    if (!st) return null;
    const c = cliente();
    const respuestas = exam.map((q, idx) => {
      const letra = answers[idx]; if (letra === undefined) return null;
      const t = (st.tiempos && st.tiempos[idx]) || {};
      return { pregunta_id: q._pid || null, opcion_id: q._oids ? q._oids[['a', 'b', 'c', 'd', 'e', 'f'].indexOf(letra)] : letra, ms_inicio: t.ms_inicio, ms_respuesta: t.ms_respuesta, largo: t.largo || (q.q ? String(q.q).length : 0) };
    }).filter(Boolean);
    let res = null;
    if (c && st.intentoId) {
      const { data, error } = await c.rpc('examen_entregar', { p_intento: st.intentoId, p_respuestas: respuestas, p_forzar_revision: !!st.forzada, p_aciertos_cliente: aciertos == null ? null : aciertos, p_puntaje_cliente: puntaje == null ? null : puntaje });
      if (error) throw error;
      res = data;
      console.log('[Integridad] 📨 Entrega confirmada por el servidor · estado:', res.estado, res.motivos && res.motivos.length ? res.motivos : '');
    }
    if (cerrar) { desactivar(); ls.del(CFG.lsIntento); st = null; }
    return res;
  }
  const esSeguro = () => !!(st && st.origen === 'seguro');

  function abandonar() { desactivar(); ls.del(CFG.lsIntento); st = null; }

  // Reanudar un examen guardado (nika_active_exam): recupera intento, modo estricto y advertencias
  function reanudar(opts) {
    const g = ls.get(CFG.lsIntento);
    if (!g) return false;
    hooks = opts || hooks;
    st = nuevoEstado(g); st.t0 = Date.now() - ((g.tiempos && Object.values(g.tiempos).reduce((m, t) => Math.max(m, t.ms_respuesta || t.ms_inicio || 0), 0)) || 0);
    document.body.classList.toggle('ei-estricto', st.estricto);
    activar(hooks);
    return true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarToggles); else montarToggles();
  window.addEventListener('online', reenviarPendientes);

  return {
    MENSAJE_ADVERTENCIA, leerEstricto, guardarEstricto, montarToggles, esEstricto,
    registrarIncidencia, iniciar, iniciarSeguro, activar, desactivar, reanudar, abandonar, entregar, esSeguro, fueForzada,
    preguntaMostrada, respuestaElegida, puedeIr, puedeRetroceder, bloquearPregunta, estaBloqueada,
    get estado() { return st; },
  };
})();
window.ExamIntegridad = ExamIntegridad;
window.registrarIncidencia = (tipo, detalles) => ExamIntegridad.registrarIncidencia(tipo, detalles);
