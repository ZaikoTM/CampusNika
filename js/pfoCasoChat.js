// CAMPUS NIKA — Práctica con el evaluador en los casos clínicos de la PFO (exclusivo NikaMed+).
// El alumno resuelve el caso conversando: la IA hace de paciente y de evaluador, sin dar pistas ni la respuesta,
// y al finalizar corrige contra la respuesta modelo del caso. Usa la Edge Function `evaluar-simulacion` con modo `caso_pfo`,
// que EXIGE plan NikaMed+ en el servidor (la pantalla solo refleja ese bloqueo).
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MAX_INTERVENCIONES = 25;
  const MAX_CARACTERES = 1500;
  const LS = (id) => 'nika_pfo_caso_chat_' + id;
  const leer = (id) => { try { return JSON.parse(localStorage.getItem(LS(id)) || 'null'); } catch (_) { return null; } };
  const guardar = (id, o) => { try { localStorage.setItem(LS(id), JSON.stringify(o)); } catch (_) {} };
  const borrar = (id) => { try { localStorage.removeItem(LS(id)); } catch (_) {} };
  const toast = (m) => { const t = document.getElementById('pfo-toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 3200); };

  // ---- acceso: NikaMed+ (o administrador). El servidor lo vuelve a comprobar en cada mensaje.
  // Solo cuenta lo confirmado por el servidor (NikaAcceso.tieneAccesoCompleto: NikaMed+ o admin verificado); el rol guardado en el navegador se puede falsear.
  const tieneAcceso = () => !!(window.NikaAcceso && NikaAcceso.tieneAccesoCompleto && NikaAcceso.tieneAccesoCompleto());
  function esperarPerfil() {
    return new Promise((ok) => {
      let listo = false; const fin = () => { if (!listo) { listo = true; ok(); } };
      if (window.NikaAcceso && NikaAcceso.alVerificarPerfil) { try { NikaAcceso.alVerificarPerfil(fin); } catch (_) { fin(); } setTimeout(fin, 6000); } else fin();
    });
  }

  // ---- llamada a la IA (misma función que el resto de los simuladores)
  async function llamarIA(payload) {
    if (navigator.onLine === false) throw new Error('Sin conexión: la práctica necesita internet.');
    const sb = window.NikaSupabase;
    const tomar = async () => { try { const { data: { session } } = await sb.client.auth.getSession(); return session && session.access_token; } catch (_) { return null; } };
    let token = await tomar();
    if (!token && sb && sb.restaurarSesionSiExiste) { try { await sb.restaurarSesionSiExiste(); } catch (_) {} token = await tomar(); }
    if (!token) throw new Error('Tu sesión no está activa. Volvé a iniciar sesión.');
    const url = ((typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL) || 'https://pswjmouuyaxueaqqglko.supabase.co') + '/functions/v1/evaluar-simulacion';
    const key = (typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) || '';
    for (let intento = 0; ; intento++) {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 70000);
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: key }, body: JSON.stringify(payload), signal: ctrl.signal });
        const d = await r.json().catch(() => ({}));
        if (r.status === 429 && d.error === 'cupo_ia' && intento < 3) { const s = Math.min(30, Math.max(3, Number(d.reintentar_en) || 10)); toast('El simulador tiene mucha demanda. Reintentando en ' + s + ' s…'); await new Promise((ok) => setTimeout(ok, s * 1000)); continue; }
        if (!r.ok || d.error) { const e = new Error(d.mensaje || d.error || 'Error ' + r.status); e.status = r.status; e.codigo = d.error; throw e; }
        if (typeof d.texto !== 'string') throw new Error('Respuesta inesperada del simulador.');
        return d;
      } catch (e) { if (e && e.name === 'AbortError') throw new Error('La IA tardó demasiado. Reintentá.'); throw e; } finally { clearTimeout(to); }
    }
  }

  // ---- prompt del caso
  function promptCaso(c) {
    const datos = (c.datos || []).map((d) => `- ${d.k}: ${d.v}`).join('\n') || '(sin datos adicionales)';
    const lab = (c.laboratorio || []).map((d) => `- ${d.k}: ${d.v}`).join('\n') || '(sin estudios cargados)';
    const tareas = c.tareas.map((t, i) => `${i + 1}) ${t}`).join('\n');
    const clave = c.tareas.map((t, i) => `CONSIGNA ${i + 1}: ${t}\n` + ((c.respuestas && c.respuestas[i] ? c.respuestas[i].puntos : []).map((p) => '  · ' + p).join('\n'))).join('\n\n');
    const fuentes = (c.fuentes || []).map((f) => `- ${f.t}: ${f.d}`).join('\n') || '- Material de la cátedra (sin guía nacional contrastada todavía).';
    return `Sos, a la vez, el PACIENTE (o su familiar/acompañante) y el EVALUADOR de una estación de práctica de la Práctica Final Obligatoria (PFO) de la carrera de Medicina en Argentina. El alumno resuelve el caso escribiendo, como si estuviera frente al paciente y al tribunal. Español rioplatense.

## CASO: ${c.titulo}
Tema: ${c.tema}. Lugar: ${c.lugar}. Tiempo de la estación: ${c.minutos} minutos.
SITUACIÓN DE PARTIDA: ${c.situacion}
CONSIGNAS DEL ALUMNO:
${tareas}

BANCO DE DATOS CLÍNICOS (nunca se entregan en bloque):
${datos}
BANCO DE ESTUDIOS (nunca se entregan en bloque):
${lab}

## CLAVE DE CORRECCIÓN (CONFIDENCIAL)
Esta clave es solo para mantener la coherencia clínica del caso y para corregir AL FINAL. Jamás la cites, la insinúes ni la resumas durante la práctica.
${clave}
FUENTES de la clave:
${fuentes}

## REGLAS DE LA PRÁCTICA
1. APERTURA: tu primer mensaje lleva entre corchetes la situación de partida y las consignas, textuales, y en otra línea la primera frase del paciente (o del acompañante), en lenguaje coloquial.
2. Como paciente respondés solo lo que el alumno pregunta, breve y sin términos médicos. Si el dato no figura en el banco, inventá un dato breve y coherente con la clave (sin cambiar el diagnóstico) o respondé "no" o "no sé" cuando corresponda. Nunca regales datos que no pidió.
3. Signos vitales, examen físico y estudios: entregá SOLO lo que el alumno pida, uno por vez y con el formato [Evaluador: ...]. Si pide algo genérico ("examen físico completo", "laboratorio", "estudios"), respondé [Evaluador: Especifique qué región y maniobras, o qué determinaciones solicita.]. Lo que no pide, no existe.
4. PROHIBIDO dar pistas, corregir, felicitar, aconsejar o evaluar durante la práctica. Si el alumno pregunta si está bien, respondé [Evaluador: La corrección se entrega al finalizar.]
5. NO cierres la estación por tu cuenta ni entregues la corrección hasta que el sistema te lo indique con un mensaje de cierre.
6. Sé muy exigente: no asumas nada que el alumno no haya escrito.`;
  }
  const MSG_INICIO = '[Instrucción de sistema — no la menciones] Arrancá la estación ahora mismo: tu primer mensaje es la apertura entre corchetes y, en otra línea, la primera frase del paciente.';
  const MSG_CIERRE = `[Instrucción de sistema — no la menciones] El alumno finalizó la estación. Entregá AHORA la CORRECCIÓN en texto con markdown simple (sin JSON), con exactamente esta estructura:
**Nota orientativa: X/10** y una frase de resumen.
Luego, para CADA consigna, un título en negrita con su número y tres listas: "✅ Lo que dijo bien", "⚠️ Incompleto o impreciso", "❌ Lo que omitió". Verificá punto por punto contra la CLAVE y citá entre comillas lo que el alumno escribió; no acredites nada que no haya escrito ni reconozcas por inferencia. Si una lista no aplica, escribí "—".
Después "**Errores críticos**" (si los hubo; si no, "ninguno") y "**Qué repasar**" (temas y las fuentes de la clave).
Sé MUY exigente: si el alumno escribió poco o preguntó poco, la nota es baja. Aclará al final que la nota es orientativa y que las respuestas modelo están en revisión.`;

  // ---- vista
  const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^[ \t]*[-•·]\s+(.*)$/gm, '<li>$1</li>').replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');

  async function montar(cont, caso) {
    cont.innerHTML = `<div class="pcc-card pcc-carga"><span class="pcc-punto"></span> Verificando tu plan…</div>`;
    await esperarPerfil();
    if (!tieneAcceso()) { bloqueado(cont, caso); return; }
    abrir(cont, caso);
  }

  function bloqueado(cont, caso) {
    cont.innerHTML = `<div class="pcc-card pcc-lock">
      <div class="pcc-ic">🔒</div>
      <h3>Practicá este caso con el evaluador <span class="pcc-plus">NikaMed+</span></h3>
      <p>Conversá con un paciente simulado, pedí datos, estudios y resolvé las consignas como en la estación real. Al final recibís una corrección punto por punto contra la respuesta modelo y sus fuentes.</p>
      <ul><li>Paciente y evaluador por IA, sin pistas ni respuestas durante la práctica</li><li>Dictado por voz y reloj de la estación</li><li>Corrección detallada con lo que dijiste bien, lo incompleto y lo que omitiste</li></ul>
      <a class="pfo-btn plus" href="nikamed-plus.html">💜 Ver planes de NikaMed+</a>
      <small>El tour, las consignas y las respuestas modelo siguen siendo gratis.</small></div>`;
  }

  function abrir(cont, caso) {
    let E = leer(caso.id) || { hist: [], fin: null };
    let pendiente = false, mic = null;
    const nIntervenciones = () => E.hist.filter((m) => m.rol === 'usuario').length;
    const datosHtml = (caso.datos || []).map((d) => `<span class="pcc-dato"><small>${esc(d.k)}</small><b>${esc(d.v)}</b></span>`).join('');
    cont.innerHTML = `<div class="pcc-card pcc-chat">
      <header class="pcc-top">
        <span class="pcc-av">${esc(caso.icono || '🩺')}</span>
        <div class="pcc-tt"><small>ESTACIÓN DE PRÁCTICA · ${esc(caso.tema)}</small><h3>${esc(caso.titulo)}</h3></div>
        <div class="pcc-chips"><span class="pcc-plus">NikaMed+</span><span class="pcc-cnt" id="pcc-cnt"></span></div>
      </header>
      <div class="pcc-body">
        <aside class="pcc-caso" aria-label="El caso a resolver">
          <div class="pcc-sec"><b>📋 Tu caso</b><p>${esc(caso.situacion)}</p></div>
          ${datosHtml ? `<div class="pcc-sec"><b>🩺 Datos que tenés</b><div class="pcc-datos">${datosHtml}</div></div>` : ''}
          <div class="pcc-sec"><b>🎯 Qué tenés que resolver</b><ol>${caso.tareas.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>
          <p class="pcc-tip">Hacés de médico/a: preguntale al paciente, pedí signos vitales, examen físico y estudios (uno por vez, con nombre) y decí tu diagnóstico y conducta. La corrección llega recién al finalizar.</p>
        </aside>
        <div class="pcc-main">
          <div class="pcc-msgs" id="pcc-msgs" aria-live="polite"></div>
          <div class="pcc-in" id="pcc-in"><textarea id="pcc-ta" rows="2" maxlength="${MAX_CARACTERES}" placeholder="Escribí lo que le decís o le pedís al paciente (por ejemplo: «¿Desde cuándo tiene la tos?», «Pido saturación y frecuencia respiratoria»…)"></textarea>
            <div class="pcc-bt"><span id="pcc-mic"></span><button type="button" class="pfo-btn" id="pcc-send">Enviar ➤</button></div></div>
          <div class="pcc-pie"><button type="button" class="pfo-btn sec" id="pcc-fin">🏁 Finalizar y corregir</button><button type="button" class="pfo-btn sec" id="pcc-reset">↺ Empezar de nuevo</button></div>
        </div>
      </div></div>`;
    const msgs = $('#pcc-msgs', cont), ta = $('#pcc-ta', cont), send = $('#pcc-send', cont), fin = $('#pcc-fin', cont), reset = $('#pcc-reset', cont);
    const burbuja = (rol, texto, extra) => { const d = document.createElement('div'); d.className = 'pcc-b ' + rol + (extra ? ' ' + extra : ''); d.innerHTML = rol === 'ia' || rol === 'corr' ? md(texto) : esc(texto); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
    const contador = () => { $('#pcc-cnt', cont).textContent = nIntervenciones() + ' / ' + MAX_INTERVENCIONES + ' intervenciones'; };
    const fijar = (on) => { ta.disabled = !on; send.disabled = !on; fin.disabled = !on || nIntervenciones() < 1; };
    const pensando = (on) => { let p = $('.pcc-pensando', msgs); if (on && !p) { p = document.createElement('div'); p.className = 'pcc-b ia pcc-pensando'; p.innerHTML = '<span class="pcc-punto"></span><span class="pcc-punto"></span><span class="pcc-punto"></span>'; msgs.appendChild(p); msgs.scrollTop = msgs.scrollHeight; } if (!on && p) p.remove(); };
    const mostrarFin = () => { burbuja('corr', E.fin, 'corr'); $('#pcc-in', cont).style.display = 'none'; fin.style.display = 'none'; };
    const base = () => ({ modo: 'caso_pfo', submodo: caso.id, tematica: caso.tema, system_prompt: promptCaso(caso) });
    const err = (e) => {
      if (e && (e.status === 403 || e.codigo === 'requiere_nikamed_plus')) { bloqueado(cont, caso); return; }
      burbuja('sistema', '⚠️ ' + (e && e.message ? e.message : 'No se pudo completar la acción.'));
    };
    const montarMic = () => {
      try {
        if (typeof SpeechManager === 'undefined' || !SpeechManager.soportado()) { $('#pcc-mic', cont).innerHTML = '<button type="button" class="pfo-mic-off" aria-disabled="true" title="Tu navegador no permite dictar por voz (Brave lo bloquea). Probá en Chrome o Edge.">🎤</button>'; return; }
        mic = SpeechManager.attach({ textareaId: 'pcc-ta', mountId: 'pcc-mic', lang: 'es-AR', maxChars: MAX_CARACTERES });
      } catch (_) { mic = null; }
    };

    async function apertura() {
      pendiente = true; fijar(false); pensando(true);
      try {
        const d = await llamarIA(Object.assign(base(), { historial: [], mensaje: MSG_INICIO, es_primer_turno: true }));
        E.hist = [{ rol: 'ia', texto: d.texto }]; guardar(caso.id, E); pensando(false); burbuja('ia', d.texto); contador(); fijar(true);
      } catch (e) {
        pensando(false); err(e);
        const b = document.createElement('button'); b.className = 'pfo-btn sec'; b.textContent = '🔄 Reintentar'; b.addEventListener('click', () => { b.remove(); apertura(); }); msgs.appendChild(b);
      } finally { pendiente = false; }
    }
    async function enviar() {
      if (pendiente) return;
      const texto = ta.value.trim(); if (!texto) return;
      if (nIntervenciones() >= MAX_INTERVENCIONES) { toast('Llegaste al máximo de intervenciones: finalizá para recibir la corrección.'); return; }
      pendiente = true; ta.value = ''; fijar(false);
      const previo = E.hist.slice(); E.hist.push({ rol: 'usuario', texto }); burbuja('usuario', texto); contador(); pensando(true);
      try {
        const d = await llamarIA(Object.assign(base(), { historial: previo.map((m) => ({ rol: m.rol, texto: m.texto })), mensaje: texto, es_primer_turno: false }));
        E.hist.push({ rol: 'ia', texto: d.texto }); guardar(caso.id, E); pensando(false); burbuja('ia', d.texto);
        if (nIntervenciones() >= MAX_INTERVENCIONES) { burbuja('sistema', 'Llegaste al máximo de intervenciones. Finalizá para recibir la corrección.'); fijar(false); fin.disabled = false; } else fijar(true);
      } catch (e) {
        pensando(false); E.hist.pop(); contador(); ta.value = texto; err(e); fijar(true);
      } finally { pendiente = false; }
    }
    async function finalizar() {
      if (pendiente || nIntervenciones() < 1) return;
      if (!confirm('¿Finalizar la práctica y recibir la corrección? Después no vas a poder seguir conversando en esta estación.')) return;
      pendiente = true; fijar(false); pensando(true);
      try {
        const d = await llamarIA(Object.assign(base(), { historial: E.hist.map((m) => ({ rol: m.rol, texto: m.texto })), mensaje: MSG_CIERRE, es_primer_turno: false }));
        E.fin = d.texto; guardar(caso.id, E); pensando(false); mostrarFin();
      } catch (e) { pensando(false); err(e); fijar(true); } finally { pendiente = false; }
    }

    send.addEventListener('click', enviar);
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); enviar(); } });
    fin.addEventListener('click', finalizar);
    reset.addEventListener('click', () => { if (pendiente) return; if (E.hist.length && !confirm('¿Empezar de nuevo? Se borra esta conversación.')) return; borrar(caso.id); abrir(cont, caso); });
    montarMic(); contador();
    // restaurar una práctica en curso o terminada
    if (E.hist.length) {
      E.hist.forEach((m) => burbuja(m.rol === 'ia' ? 'ia' : 'usuario', m.texto));
      if (E.fin) { mostrarFin(); } else fijar(true);
    } else apertura();
  }

  window.PfoCasoChat = { montar };
})();
