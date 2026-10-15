/* CAMPUS NIKA · Examen oral (NikaMed+).
   Un profesor te toma examen hablando: lee la pregunta del simulador escrito de cada materia, vos respondés en voz alta,
   y corrige igual que el escrito (checklist de "puntos clave" de cada pregunta) pero de forma local y gratuita.
   El profesor cambia de tono y de ánimo según cómo venga el examen.
   Voz: speechSynthesis (es-AR si el dispositivo la tiene) · Reconocimiento: Web Speech API (con respaldo por texto). */
(function () {
  'use strict';
  const $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MATERIAS = {
    cirugia: { nombre: 'Cirugía', ico: '🔪', c: '#6366f1' },
    ginecologia: { nombre: 'Ginecología y Obstetricia', ico: '🤰', c: '#ec4899' },
    siam: { nombre: 'S.I.A.M.', ico: '🫀', c: '#06b6d4' }
  };

  /* ===================== corrección local por puntos clave ===================== */
  const STOP = new Set('de la el los las y o u en a al del un una unos unas por para con sin que se su sus es son como lo le les e ni mas muy sobre entre tras ante este esta estos estas ese esa cual cuales donde cuando segun tambien ser sera han hay son fue ha pero si no ya tema consigna fundamente describa explique mencione compare indique senale cite enumere complete analisis siguiente'.split(' '));
  const sinTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function raiz(w) {
    w = w.replace(/(mente|ciones|cion|idades|idad|ados|adas|ado|ada|ando|iendo|es|s)$/, '');
    if (w.length > 4 && /[aeo]$/.test(w)) w = w.slice(0, -1);
    return w;
  }
  function tokens(s) {
    const t = sinTildes(s).replace(/[^a-z0-9ñ]+/g, ' ').trim().split(/\s+/).filter((w) => w && (w.length >= 3 || /\d/.test(w)) && !STOP.has(w));
    return [...new Set(t.map(raiz).filter((w) => w.length >= 3 || /\d/.test(w)))];
  }
  function dist1(a, b) { // ¿difieren a lo sumo en 1 carácter? (errores del reconocimiento de voz)
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  function tiene(setR, t) {
    if (setR.has(t)) return true;
    if (t.length < 5) return false;
    for (const r of setR) { if (r.length >= 5 && (r.startsWith(t.slice(0, 5)) || t.startsWith(r.slice(0, 5)) || dist1(r, t))) return true; }
    return false;
  }
  function limpiaPunto(p) { return String(p || '').replace(/^\s*[a-z0-9]{1,2}\s*[\)\.\-]\s*/i, '').replace(/^\s*(tema|consigna)\s*:\s*/i, ''); }

  // devuelve { nota 0..1, cubiertos[], faltan[], parcial[] }
  function corregir(pregunta, respuesta) {
    const palabras = sinTildes(respuesta).split(/\s+/).filter(Boolean);
    const R = new Set(tokens(respuesta));
    const puntos = (pregunta.puntos_clave || []).map(limpiaPunto).filter((p) => p && !/^pendiente\b/i.test(p));
    if (!puntos.length) return { nota: palabras.length >= 12 ? 0.6 : 0.3, cubiertos: [], faltan: [], parcial: [], sinClave: true };
    const just = sinTildes(pregunta.justificacion || '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ');
    const cubiertos = [], parcial = [], faltan = []; let suma = 0;
    puntos.forEach((p) => {
      const T = tokens(p);
      let cov = T.length ? T.filter((t) => tiene(R, t)).length / T.length : 0;
      // evidencia secundaria: términos distintivos del texto de la justificación que sigue al encabezado del punto
      const pn = sinTildes(p).replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
      const k = pn ? just.indexOf(pn.slice(0, 40)) : -1;
      if (k >= 0) {
        const ventana = just.slice(k + pn.length, k + pn.length + 300);
        const D = tokens(ventana).filter((w) => w.length >= 5).slice(0, 10);
        if (D.length >= 3) { const ev = D.filter((t) => tiene(R, t)).length / Math.min(D.length, 6); cov = Math.max(cov, Math.min(0.85, ev * 0.85)); }
      }
      // los puntos largos (oraciones completas) se parafrasean: alcanza con nombrar sus términos distintivos
      const largo = T.length >= 8, ok = largo ? 0.38 : 0.6, med = largo ? 0.2 : 0.34;
      if (cov >= ok) { cubiertos.push(p); suma += 1; }
      else if (cov >= med) { parcial.push(p); suma += 0.5 * (cov - med) / (ok - med) + 0.3; }
      else faltan.push(p);
    });
    let nota = suma / puntos.length;
    if (palabras.length < 8) nota *= 0.5;                       // respuesta demasiado corta
    if (/^(no se|ni idea|no recuerdo|paso|no tengo idea)\b/.test(sinTildes(respuesta).trim())) nota = 0;
    return { nota: Math.max(0, Math.min(1, nota)), cubiertos, faltan, parcial };
  }

  /* ===================== ánimo del profesor ===================== */
  const FRASES = {
    contento: {
      ok: ['¡Muy bien!', 'Excelente, así se contesta.', 'Perfecto, eso es exactamente lo que buscaba.', '¡Eso es! Vamos muy bien.'],
      medio: ['Bien, bastante completo.', 'Muy bien encaminado, le faltó un detalle apenas.'],
      mal: ['No es exactamente eso, pero no se preocupe, vamos a la siguiente.']
    },
    cordial: {
      ok: ['Muy bien, correcto.', 'Está bien, sigamos.', 'Correcto. Pasemos a la siguiente.'],
      medio: ['Está bien en líneas generales, pero quedó incompleto.', 'Va por buen camino, aunque le faltó precisión.'],
      mal: ['Eso no es lo que le pregunté. Repase este tema.', 'No, no es correcto. Sigamos.']
    },
    serio: {
      ok: ['Correcto.', 'Está bien. Siga así.'],
      medio: ['Incompleto. Tiene que ser más preciso.', 'Eso quedó a medias, y en un examen eso no alcanza.'],
      mal: ['No. Eso no es correcto. Tiene que estudiar más este punto.', 'Así no. Esperaba mucho más de usted.']
    },
    molesto: {
      ok: ['Bien. Era lo mínimo que tenía que saber.', 'Correcto, por fin.'],
      medio: ['Esto es básico, tendría que saberlo de memoria.', 'Incompleto. Así no se aprueba un final.'],
      mal: ['Esto es básico. Así no se aprueba un final, tiene que estudiar mucho más.', 'No, no y no. Esto no se puede desconocer.']
    }
  };
  const PARAMS = {
    contento: { rate: 1.05, pitch: 1.12, vol: 1, ico: '😄', txt: 'Contento', color: '#16a34a' },
    cordial: { rate: 1.0, pitch: 1.0, vol: 1, ico: '🙂', txt: 'Cordial', color: '#0ea5e9' },
    serio: { rate: 0.92, pitch: 0.86, vol: 1, ico: '😐', txt: 'Serio', color: '#f59e0b' },
    molesto: { rate: 0.88, pitch: 0.74, vol: 1, ico: '😠', txt: 'Molesto', color: '#dc2626' }
  };
  const elige = (a) => a[Math.floor(Math.random() * a.length)];
  const corto = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); if (t.length <= n) return t; const c = t.slice(0, n); return c.slice(0, c.lastIndexOf(' ') > 30 ? c.lastIndexOf(' ') : n) + '…'; };
  function animo(hist) {
    if (!hist.length) return 'cordial';
    // promedio con un "a priori" neutro: una sola respuesta mala no pone al profesor furioso de entrada
    const prom = (hist.reduce((a, b) => a + b, 0) + 1.2) / (hist.length + 2), ult = hist[hist.length - 1];
    const m = 0.75 * prom + 0.25 * ult;
    return m >= 0.72 ? 'contento' : m >= 0.5 ? 'cordial' : m >= 0.3 ? 'serio' : 'molesto';
  }

  /* ===================== voz ===================== */
  const S = { voz: null, voces: [], hablando: false, cola: 0 };
  function cargarVoces() {
    try { S.voces = (window.speechSynthesis.getVoices() || []).filter((v) => /^es/i.test(v.lang)); } catch (_) { S.voces = []; }
    S.voces.sort((a, b) => (/es-AR/i.test(b.lang) - /es-AR/i.test(a.lang)) || (/es-(MX|US|419)/i.test(b.lang) - /es-(MX|US|419)/i.test(a.lang)) || a.name.localeCompare(b.name));
    const sel = $('eo-voz'); if (!sel) return;
    sel.innerHTML = S.voces.length ? S.voces.map((v, i) => '<option value="' + i + '">' + esc(v.name) + ' · ' + esc(v.lang) + '</option>').join('') : '<option value="">Voz del navegador</option>';
    const guardada = localStorage.getItem('nika_eo_voz'); const k = S.voces.findIndex((v) => v.name === guardada);
    sel.value = String(k >= 0 ? k : 0); S.voz = S.voces[k >= 0 ? k : 0] || null;
  }
  function trocear(texto) {
    const t = String(texto).replace(/\s+/g, ' ').trim();
    const partes = t.match(/[^.!?;:]+[.!?;:]?/g) || [t];
    const out = []; let acc = '';
    partes.forEach((p) => { if ((acc + p).length > 170) { if (acc) out.push(acc); acc = p; } else acc += p; });
    if (acc) out.push(acc);
    return out.map((x) => x.trim()).filter(Boolean);
  }
  function hablar(texto, mood) {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth || !texto) return resolve();
      const P = PARAMS[mood || 'cordial'], trozos = trocear(texto);
      let i = 0; S.hablando = true; avatar(true);
      const sig = () => {
        if (!S.hablando || i >= trozos.length) { S.hablando = false; avatar(false); return resolve(); }
        const u = new SpeechSynthesisUtterance(trozos[i++]);
        u.lang = (S.voz && S.voz.lang) || 'es-AR'; if (S.voz) u.voice = S.voz;
        u.rate = P.rate; u.pitch = P.pitch; u.volume = P.vol;
        u.onend = () => setTimeout(sig, 120); u.onerror = () => sig();
        synth.speak(u);
      };
      sig();
    });
  }
  function callar() { S.hablando = false; try { window.speechSynthesis.cancel(); } catch (_) {} avatar(false); }

  /* ===================== reconocimiento ===================== */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, escuchando = false, texto = '', parcialTxt = '', silencio = null, alTerminar = null;
  function escuchar(cb) {
    alTerminar = cb; texto = ''; parcialTxt = ''; pintarTranscripcion();
    if (!SR) return false;
    try {
      rec = new SR(); rec.lang = 'es-AR'; rec.continuous = true; rec.interimResults = true;
      rec.onresult = (e) => {
        let fin = '', par = '';
        for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) fin += r[0].transcript + ' '; else par += r[0].transcript; }
        if (fin) texto += fin; parcialTxt = par; pintarTranscripcion();
        clearTimeout(silencio); silencio = setTimeout(() => { if (palabrasN() >= 4) terminarEscucha(); }, 3800);
      };
      rec.onerror = (e) => {
        if (/not-allowed|service-not-allowed/.test(e.error)) { estado.error = 'El navegador no dejó usar el micrófono. Podés responder escribiendo.'; }
        else if (/network/.test(e.error)) { estado.error = 'Este navegador no tiene reconocimiento de voz disponible (en Brave suele estar bloqueado). Respondé escribiendo, o probá en Chrome o Edge.'; }
        else if (e.error === 'no-speech') return;
        else estado.error = 'Hubo un problema con el micrófono (' + e.error + '). Podés responder escribiendo.';
        escuchando = false; pintar();
      };
      rec.onend = () => { if (escuchando) { try { rec.start(); } catch (_) {} } };
      rec.start(); escuchando = true; return true;
    } catch (_) { escuchando = false; return false; }
  }
  const palabrasN = () => (texto + ' ' + parcialTxt).trim().split(/\s+/).filter(Boolean).length;
  function detenerEscucha() { escuchando = false; clearTimeout(silencio); try { if (rec) { rec.onend = null; rec.stop(); } } catch (_) {} rec = null; }
  function terminarEscucha() {
    const t = ((texto + ' ' + parcialTxt).trim()) || ($('eo-escrito') && $('eo-escrito').value.trim()) || '';
    detenerEscucha(); const cb = alTerminar; alTerminar = null; if (cb) cb(t);
  }

  /* ===================== estado y flujo ===================== */
  const estado = { fase: 'inicio', materia: 'cirugia', up: '', n: 6, banco: null, preguntas: [], i: 0, hist: [], resultados: [], intento: 0, mood: 'cordial', subs: true, error: '', t0: 0, intentoPrevio: 0, textoLibre: false };
  const bancos = {};
  async function cargarBanco(m) {
    if (bancos[m]) return bancos[m];
    const r = await fetch('data/escrito_' + m + '.json'); if (!r.ok) throw new Error('No se pudo cargar el banco.');
    const d = await r.json(); bancos[m] = d.filter((q) => q && q.pregunta && Array.isArray(q.puntos_clave) && q.puntos_clave.some((p) => p && !/^pendiente\b/i.test(p)));
    return bancos[m];
  }
  const etiquetaUp = (u) => String(u).replace(/^UP(\d+)_sec_(\d+)$/i, 'UP$1 · sección $2').replace(/^UP(\d+)$/i, 'UP$1');
  const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function preparaPregunta(q) {
    // "Tema: X. Consigna: Y" -> se habla de forma natural
    let t = String(q.pregunta).replace(/\s+/g, ' ').trim();
    const m = t.match(/^Tema:\s*(.*?)\.\s*Consigna:\s*(.*)$/i);
    if (m) t = 'Hablemos de ' + m[1].trim() + '. ' + m[2].trim();
    return t;
  }

  async function iniciar() {
    estado.error = '';
    if (!window.speechSynthesis) { estado.error = 'Tu navegador no puede reproducir voz. Probá con Chrome, Edge o Safari.'; return pintar(); }
    try {
      const b = await cargarBanco(estado.materia);
      const pool = b.filter((q) => !estado.up || q.up === estado.up);
      if (pool.length < 1) { estado.error = 'No hay preguntas para esa selección.'; return pintar(); }
      estado.preguntas = barajar(pool).slice(0, estado.n);
    } catch (e) { estado.error = 'No se pudo cargar el banco de preguntas. Revisá tu conexión.'; return pintar(); }
    estado.i = 0; estado.hist = []; estado.resultados = []; estado.t0 = Date.now(); estado.mood = 'cordial';
    estado.fase = 'examen'; pintar();
    const M = MATERIAS[estado.materia];
    await hablar('Buenos días. Soy su examinador de ' + M.nombre + '. Le voy a hacer ' + estado.preguntas.length + (estado.preguntas.length === 1 ? ' pregunta' : ' preguntas') + '. Responda en voz alta, con claridad y con sus palabras. Comencemos.', 'cordial');
    preguntar();
  }

  async function preguntar() {
    if (estado.fase !== 'examen') return;
    const q = estado.preguntas[estado.i];
    estado.intento = 0; estado.error = ''; estado.sub = preparaPregunta(q); estado.feedback = null; estado.estadoVoz = 'pregunta';
    pintar();
    await hablar('Pregunta ' + (estado.i + 1) + '. ' + estado.sub, estado.mood);
    if (estado.fase !== 'examen') return;
    abrirRespuesta();
  }

  function abrirRespuesta() {
    estado.estadoVoz = 'escucha'; pintar();
    if (!estado.textoLibre) {
      const ok = escuchar((t) => evaluar(t));
      if (!ok) { estado.textoLibre = true; if (!estado.error) estado.error = 'No se pudo activar el micrófono: respondé escribiendo.'; }
    }
    pintar();
  }

  async function evaluar(respuesta) {
    if (estado.fase !== 'examen') return;
    const q = estado.preguntas[estado.i];
    estado.estadoVoz = 'evalua'; pintar();
    const r = corregir(q, respuesta || '');
    estado.intento++;
    const mejor = Math.max(r.nota * (estado.intento > 1 ? 0.85 : 1), estado.intentoPrevio || 0);
    // pista: una repregunta cuando le fue mal
    if (r.nota < 0.5 && estado.intento === 1 && r.faltan.length) {
      estado.intentoPrevio = r.nota;
      const pista = corto(r.faltan[0], 110);
      const m = animo(estado.hist.concat([r.nota])); estado.mood = m; pintar();
      await hablar(elige(FRASES[m].mal) + ' Le doy una pista: piense en ' + pista + '. Inténtelo de nuevo.', m);
      estado.transcripcionPrevia = respuesta;
      return abrirRespuesta();
    }
    estado.intentoPrevio = 0;
    const final = Math.min(1, mejor);
    estado.hist.push(final);
    estado.resultados.push({ q, nota: final, r, respuesta });
    const m = animo(estado.hist); estado.mood = m;
    const tipo = final >= 0.72 ? 'ok' : final >= 0.4 ? 'medio' : 'mal';
    estado.feedback = { nota: final, tipo, r, texto: elige(FRASES[m][tipo]) };
    estado.estadoVoz = 'feedback'; pintar();
    let extra = '';
    if (tipo !== 'ok' && r.faltan.length) extra = ' Le faltó mencionar: ' + r.faltan.slice(0, 2).map((x) => corto(x, 90)).join('; ') + '.';
    await hablar(estado.feedback.texto + extra, m);
    if (estado.fase !== 'examen') return;
    setTimeout(siguiente, 700);
  }

  async function siguiente() {
    if (estado.fase !== 'examen') return;
    estado.i++;
    if (estado.i >= estado.preguntas.length) return terminarExamen();
    preguntar();
  }

  async function terminarExamen() {
    detenerEscucha(); callar();
    estado.fase = 'fin';
    const prom = estado.hist.reduce((a, b) => a + b, 0) / Math.max(1, estado.hist.length);
    estado.nota = Math.round(prom * 20) / 2;     // 0–10 con medios puntos
    estado.mood = animo(estado.hist.length ? [prom] : []);
    pintar();
    guardarResultado(prom);
    const fin = estado.nota >= 6 ? (estado.nota >= 8 ? 'Excelente examen. Está aprobado con una muy buena nota: ' : 'Aprobó, pero puede mejorar. Su nota es ') : 'No alcanzó para aprobar todavía. Su nota es ';
    await hablar(fin + String(estado.nota).replace('.', ' coma ') + '. ' + (estado.nota >= 6 ? 'Siga así.' : 'Repase los temas que le marqué y vuelva a intentarlo.'), estado.nota >= 6 ? 'contento' : 'serio');
  }

  async function guardarResultado(prom) {
    try {
      if (!window.NikaRendimiento || !window.NikaRendimiento.guardarExamen) return;
      const byUp = {};
      estado.resultados.forEach((x) => { const k = x.q.up || 'UP'; (byUp[k] = byUp[k] || { total: 0, correct: 0 }); byUp[k].total++; if (x.nota >= 0.6) byUp[k].correct++; });
      const correct = estado.resultados.filter((x) => x.nota >= 0.6).length, total = estado.resultados.length;
      await window.NikaRendimiento.guardarExamen({ modulo: estado.materia, mode: 'oral', total, correct, blank: 0, byUp, score: Math.round(prom * 100) / 10, scorePct: Math.round(prom * 100), durationSeconds: Math.round((Date.now() - estado.t0) / 1000) });
    } catch (_) {}
  }

  /* ===================== interfaz ===================== */
  function avatar(habla) { const a = $('eo-avatar'); if (a) a.classList.toggle('habla', !!habla); }
  function pintarTranscripcion() { const t = $('eo-trans'); if (t) t.textContent = (texto + ' ' + parcialTxt).trim() || 'Te escucho…'; }

  function pintar() {
    const raiz = $('eo-raiz'); if (!raiz) return;
    const P = PARAMS[estado.mood];
    if (estado.fase === 'inicio') return pintarInicio(raiz);
    if (estado.fase === 'fin') return pintarFin(raiz);
    const q = estado.preguntas[estado.i], total = estado.preguntas.length;
    const f = estado.feedback, ev = estado.estadoVoz;
    raiz.innerHTML = '<div class="eo-sala" style="--m:' + P.color + '">'
      + '<div class="eo-prog"><i style="width:' + Math.round(estado.i / total * 100) + '%"></i></div>'
      + '<div class="eo-cab"><span>Pregunta <b>' + (estado.i + 1) + '</b> de ' + total + '</span><span class="eo-animo">' + P.ico + ' ' + P.txt + '</span></div>'
      + '<div class="eo-prof"><div class="eo-avatar' + (S.hablando ? ' habla' : '') + '" id="eo-avatar"><span class="eo-cara">' + P.ico + '</span><i class="eo-onda"><b></b><b></b><b></b><b></b><b></b></i></div>'
      + '<div class="eo-bocadillo"><small>' + esc(MATERIAS[estado.materia].nombre) + ' · ' + esc(etiquetaUp(q.up)) + '</small>'
      + (estado.subs ? '<p>' + esc(estado.sub || preparaPregunta(q)) + '</p>' : '<p class="eo-oculto">🎧 Escuchá la pregunta del profesor…</p>') + '</div></div>'
      + (ev === 'escucha' ? '<div class="eo-micro"><div class="eo-mic ' + (escuchando ? 'on' : '') + '">🎙️</div><div class="eo-trans" id="eo-trans">Te escucho…</div>'
        + '<div class="eo-escribe"><textarea id="eo-escrito" placeholder="O escribí tu respuesta acá…" rows="3"' + (estado.textoLibre ? '' : '') + '></textarea></div>'
        + '<div class="eo-acc"><button type="button" class="eo-btn eo-btn--sec" data-eo="repetir">🔁 Repetir pregunta</button><button type="button" class="eo-btn eo-btn--sec" data-eo="saltar">⏭️ Saltar</button><button type="button" class="eo-btn" data-eo="listo">✅ Terminé de responder</button></div></div>'
        : ev === 'evalua' ? '<div class="eo-micro"><div class="eo-pensando">El profesor está evaluando tu respuesta…</div></div>'
        : ev === 'feedback' && f ? '<div class="eo-feedback ' + f.tipo + '"><div class="eo-nota">' + Math.round(f.nota * 100) + '%</div><div><p><b>' + esc(f.texto) + '</b></p>'
          + (f.r.cubiertos.length ? '<p class="ok">✔ Dijiste: ' + f.r.cubiertos.map(esc).join(' · ') + '</p>' : '')
          + (f.r.parcial.length ? '<p class="med">◐ A medias: ' + f.r.parcial.map(esc).join(' · ') + '</p>' : '')
          + (f.r.faltan.length ? '<p class="mal">✖ Faltó: ' + f.r.faltan.map(esc).join(' · ') + '</p>' : '') + '</div></div>'
        : '<div class="eo-micro"><div class="eo-pensando">🎧 Escuchá al profesor…</div></div>')
      + (estado.error ? '<p class="eo-error">' + esc(estado.error) + '</p>' : '')
      + '<div class="eo-pie"><label class="eo-sw"><input type="checkbox" id="eo-subs"' + (estado.subs ? ' checked' : '') + '> Mostrar el texto de la pregunta</label><button type="button" class="eo-btn eo-btn--sec" data-eo="terminar">Terminar examen</button></div>'
      + '</div>';
    if (ev === 'escucha') pintarTranscripcion();
  }

  function pintarInicio(raiz) {
    const plus = estado.plus;
    const M = MATERIAS[estado.materia];
    const ups = estado.banco ? [...new Set(estado.banco.map((q) => q.up))] : [];
    raiz.innerHTML = '<div class="eo-setup">'
      + '<div class="eo-hero"><div class="eo-hero-ico">🎙️</div><div><small>NikaMed+</small><h2>Examen oral</h2><p>Un profesor te toma examen <b>hablando</b>: te lee las preguntas del simulador escrito, vos respondés en voz alta y él corrige y reacciona según cómo te vaya. Cambia de tono y de humor durante el examen.</p></div></div>'
      + (plus ? '' : '<div class="eo-bloq"><b>🔒 Función exclusiva de NikaMed+</b><p>Hacete NikaMed+ para tomar exámenes orales con el profesor, sin límites.</p><a class="eo-btn" href="nikamed-plus.html">Conocer NikaMed+</a></div>')
      + '<div class="eo-form' + (plus ? '' : ' eo-off') + '">'
      + '<div class="eo-lbl">Materia</div><div class="eo-mats">' + Object.keys(MATERIAS).map((k) => '<button type="button" class="eo-mat' + (k === estado.materia ? ' on' : '') + '" style="--c:' + MATERIAS[k].c + '" data-eo="materia" data-v="' + k + '"><i>' + MATERIAS[k].ico + '</i><span>' + MATERIAS[k].nombre + '</span></button>').join('') + '</div>'
      + '<div class="eo-fila"><label class="eo-f"><span>Unidad</span><select id="eo-up"><option value="">Todas las unidades</option>' + ups.map((u) => '<option value="' + esc(u) + '"' + (u === estado.up ? ' selected' : '') + '>' + esc(etiquetaUp(u)) + '</option>').join('') + '</select></label>'
      + '<label class="eo-f"><span>Preguntas</span><select id="eo-n">' + [3, 5, 6, 8, 10].map((n) => '<option' + (n === estado.n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label></div>'
      + '<label class="eo-f"><span>Voz del profesor</span><div class="eo-vozfila"><select id="eo-voz"></select><button type="button" class="eo-btn eo-btn--sec" data-eo="probar">🔊 Probar voz</button></div></label>'
      + '<ul class="eo-notas"><li>🎧 Usá <b>auriculares</b> y un lugar tranquilo para que el micrófono no capte al profesor.</li><li>🎙️ El reconocimiento de voz funciona mejor en <b>Chrome o Edge</b>. Si tu navegador no lo permite, podés responder escribiendo.</li>'
      + '<li>🧠 El profesor evalúa los <b>puntos clave</b> de cada pregunta, igual que el simulador escrito, y te da una pista si te va mal.</li></ul>'
      + (estado.error ? '<p class="eo-error">' + esc(estado.error) + '</p>' : '')
      + '<button type="button" class="eo-comenzar" data-eo="comenzar"' + (plus ? '' : ' disabled') + '><span>🎓 Comenzar el examen</span></button>'
      + '</div></div>';
    cargarVoces();
  }

  function pintarFin(raiz) {
    const aprobo = estado.nota >= 6, P = PARAMS[aprobo ? 'contento' : (estado.nota >= 4 ? 'serio' : 'molesto')];
    raiz.innerHTML = '<div class="eo-fin" style="--m:' + P.color + '"><div class="eo-fin-n"><b>' + String(estado.nota).replace('.', ',') + '</b><span>/ 10</span></div>'
      + '<h3>' + P.ico + ' ' + (aprobo ? (estado.nota >= 8 ? '¡Excelente examen!' : 'Aprobaste') : 'Todavía no alcanza') + '</h3>'
      + '<p>' + esc(MATERIAS[estado.materia].nombre) + ' · ' + estado.resultados.length + ' preguntas · ' + Math.max(1, Math.round((Date.now() - estado.t0) / 60000)) + ' min</p>'
      + '<div class="eo-res">' + estado.resultados.map((x, i) => '<details class="eo-r ' + (x.nota >= 0.72 ? 'ok' : x.nota >= 0.4 ? 'med' : 'mal') + '"><summary><b>' + (i + 1) + '.</b> ' + esc(preparaPregunta(x.q).slice(0, 90)) + '… <em>' + Math.round(x.nota * 100) + '%</em></summary>'
        + (x.r.cubiertos.length ? '<p class="ok">✔ ' + x.r.cubiertos.map(esc).join(' · ') + '</p>' : '')
        + (x.r.parcial.length ? '<p class="med">◐ ' + x.r.parcial.map(esc).join(' · ') + '</p>' : '')
        + (x.r.faltan.length ? '<p class="mal">✖ Faltó: ' + x.r.faltan.map(esc).join(' · ') + '</p>' : '')
        + '<p class="eo-resp"><b>Tu respuesta:</b> ' + esc(x.respuesta || '(sin respuesta)') + '</p>'
        + '<p class="eo-just"><b>Respuesta modelo:</b> ' + esc(String(x.q.justificacion || '').slice(0, 700)) + (String(x.q.justificacion || '').length > 700 ? '…' : '') + '</p></details>').join('') + '</div>'
      + '<div class="eo-acc"><button type="button" class="eo-btn eo-btn--sec" data-eo="inicio">Volver</button><button type="button" class="eo-btn" data-eo="comenzar">🔁 Otro examen</button></div></div>';
    if (aprobo) confeti();
  }
  function confeti() {
    const c = document.createElement('div'); c.className = 'eo-confeti'; const cols = ['#0ea5e9', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'];
    for (let i = 0; i < 60; i++) { const p = document.createElement('i'); p.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + cols[i % 5] + ';animation-delay:' + Math.random() * .7 + 's;--dx:' + (Math.random() * 160 - 80) + 'px'; c.appendChild(p); }
    document.body.appendChild(c); setTimeout(() => c.remove(), 3800);
  }

  async function refrescarSetup() {
    try { estado.banco = await cargarBanco(estado.materia); } catch (_) { estado.banco = null; }
    pintar();
  }

  function eventos() {
    document.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-eo]'); if (!b) return;
      const a = b.dataset.eo;
      if (a === 'materia') { estado.materia = b.dataset.v; estado.up = ''; refrescarSetup(); }
      else if (a === 'probar') { const s = $('eo-voz'); if (s && S.voces[s.value]) { S.voz = S.voces[s.value]; localStorage.setItem('nika_eo_voz', S.voz.name); } callar(); hablar('Buenos días. Así voy a sonar durante el examen. ¿Comenzamos?', 'cordial'); }
      else if (a === 'comenzar') { if (!estado.plus) return; const s = $('eo-voz'); if (s && S.voces[s.value]) { S.voz = S.voces[s.value]; try { localStorage.setItem('nika_eo_voz', S.voz.name); } catch (_) {} } const u = $('eo-up'), n = $('eo-n'); if (u) estado.up = u.value; if (n) estado.n = Number(n.value) || 6; iniciar(); }
      else if (a === 'listo') { callar(); terminarEscucha(); }
      else if (a === 'repetir') { detenerEscucha(); callar(); preguntar(); }
      else if (a === 'saltar') { detenerEscucha(); callar(); estado.hist.push(0); estado.resultados.push({ q: estado.preguntas[estado.i], nota: 0, r: { cubiertos: [], parcial: [], faltan: (estado.preguntas[estado.i].puntos_clave || []).map(limpiaPunto) }, respuesta: '' }); estado.mood = animo(estado.hist); siguiente(); }
      else if (a === 'terminar') { if (confirm('¿Terminar el examen ahora?')) { if (!estado.resultados.length) { estado.fase = 'inicio'; detenerEscucha(); callar(); pintar(); } else terminarExamen(); } }
      else if (a === 'inicio') { estado.fase = 'inicio'; callar(); pintar(); }
    });
    document.addEventListener('change', (e) => { if (e.target.id === 'eo-subs') { estado.subs = e.target.checked; pintar(); } if (e.target.id === 'eo-up') estado.up = e.target.value; if (e.target.id === 'eo-n') estado.n = Number(e.target.value) || 6; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { callar(); } });
    window.addEventListener('beforeunload', () => { callar(); detenerEscucha(); });
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = cargarVoces;
    // barra lateral
    try { if (localStorage.getItem('nika_eo_side') === '1') document.body.classList.add('ns-colapsado'); } catch (_) {}
    const col = $('ns-colapsar'), bur = $('ns-burger');
    const pc = () => { if (!col) return; const c = document.body.classList.contains('ns-colapsado'); const i = col.querySelector('.ns-ic'), t = col.querySelector('.ns-t'); if (i) i.textContent = c ? '⇥' : '⇤'; if (t) t.textContent = c ? 'Expandir' : 'Contraer'; };
    if (col) { col.addEventListener('click', () => { const c = document.body.classList.toggle('ns-colapsado'); try { localStorage.setItem('nika_eo_side', c ? '1' : '0'); } catch (_) {} pc(); }); pc(); }
    if (bur) bur.addEventListener('click', () => document.body.classList.toggle('ns-abierto'));
  }

  async function arrancar() {
    eventos();
    // acceso: NikaMed+ (o admin). El servidor sigue siendo la autoridad para el resto de la plataforma.
    try {
      const A = window.NikaAcceso;
      if (A && A.verificarVipFresco) { try { await A.verificarVipFresco(); } catch (_) {} }
      estado.plus = !!(A && A.tieneAccesoCompleto && A.tieneAccesoCompleto());
    } catch (_) { estado.plus = false; }
    try { estado.banco = await cargarBanco(estado.materia); } catch (_) {}
    pintar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();

  window.NikaExamenOral = { corregir, animo, tokens };
})();
