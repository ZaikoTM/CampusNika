// js/recetarios.js
// CAMPUS NIKA — Simulador de Recetarios y Certificados (interfaz + corrección automática).
// Contenido y casos: js/recetariosData.js

const NikaRecetarios = (() => {
  const R = window.RECETARIOS;
  const LS_STATS = 'nika_recetarios_stats';
  const LS_NAC = 'nika_recetarios_nacimiento';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let docId = null, caso = null, lapicera = true, ultimoCampo = null, vista = 'sim';
  const hojas = {};            // id → { encabezado, cuerpo, fecha, hora, sello, matricula, firma, raya }

  // ------------------------------------------------------------------ utilidades de texto
  const N = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%.,()+\-/ \n]/g, ' ').replace(/[ \t]+/g, ' ').trim();
  const solo = (s) => N(s).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const digitos = (s) => String(s || '').replace(/[.\s]/g, '');
  const hoyTxt = () => { const d = new Date(); return { dd: String(d.getDate()).padStart(2, '0'), mm: String(d.getMonth() + 1).padStart(2, '0'), aaaa: String(d.getFullYear()) }; };
  const stats = () => { try { return JSON.parse(localStorage.getItem(LS_STATS) || '{}') || {}; } catch (_) { return {}; } };
  const guardarStat = (id, puntaje) => { try { const s = stats(); const x = s[id] || { mejor: 0, intentos: 0 }; x.mejor = Math.max(x.mejor, puntaje); x.intentos++; s[id] = x; localStorage.setItem(LS_STATS, JSON.stringify(s)); } catch (_) {} };
  const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); else console.info(m); };

  function tieneNombreEnOrden(txt, p) {
    const t = solo(txt); const ap = solo(p.apellido), no = solo(p.nombre);
    const dir = new RegExp(`${ap.replace(/ /g, ' +')} +${no.replace(/ /g, ' +')}`);
    const inv = new RegExp(`${no.replace(/ /g, ' +')} +${ap.replace(/ /g, ' +')}`);
    if (dir.test(t)) return { ok: true };
    if (inv.test(t)) return { ok: false, tip: 'Escribiste el nombre antes del apellido: el orden correcto es Apellido/s y luego Nombre/s (como en el DNI).' };
    return { ok: false, tip: `Falta el apellido y nombre del paciente tal como figura en el DNI (${p.apellido}, ${p.nombre}).` };
  }
  const tieneDni = (txt, p) => digitos(txt).includes(String(p.dni));
  function tieneAutoridad(txt, aut) {
    const t = solo(txt);
    if (!aut) return /(ante|a) quien corresponda/.test(t);
    const stop = new Set(['la', 'el', 'de', 'del', 'los', 'las', 'n', 'dr']);
    const toks = solo(aut).split(' ').filter((x) => x.length > 2 && !stop.has(x));
    const ok = toks.filter((x) => t.includes(x)).length;
    return ok >= Math.ceil(toks.length * 0.6);
  }
  function tieneDosis(txt, dosis) {
    const m = /^([\d.,]+)\s*(\S+)$/.exec(dosis); if (!m) return solo(txt).includes(solo(dosis));
    const num = m[1].replace(',', '[.,]'); return new RegExp(`${num}\\s*${m[2]}`, 'i').test(N(txt));
  }
  const formaOk = (txt, forma) => { const t = N(txt); if (/aerosol/.test(forma)) return /aerosol|inhal/.test(t); return t.includes(solo(forma).slice(0, 4)); };
  const envasesOk = (txt, n = 1) => { const t = N(txt); const rom = R.ROMANOS[n].toLowerCase(); const let_ = R.NUM_LETRAS[n]; return new RegExp(`\\b${rom}\\b`).test(t) && t.includes(let_); };
  const ABREV = /(^|[\s(])(dr|dra|sr|sra|srta|px|pte|dx|hta|hs|tto|rx|ecg|lab)\.?(?=[\s,.;:)]|$)/i;

  // ------------------------------------------------------------------ correctores por documento
  function chequeoFinal(h, esCert, out, prefijo = '') {
    const pie = hojas[h] || {};
    const f = hoyTxt();
    out.push({ ok: !!pie.firma, peso: 6, label: `${prefijo}Firma manuscrita`, tip: 'Falta la firma al finalizar el texto o en el margen inferior derecho, sin dejar espacios en blanco.' });
    out.push({ ok: !!pie.raya, peso: 4, label: `${prefijo}Espacio libre rayado`, tip: 'No dejes espacios en blanco antes de la firma: anulalos con un trazo (botón «Rayar espacio libre»).' });
    out.push({ ok: N(pie.sello).split(' ').filter(Boolean).length >= 2, peso: 4, label: `${prefijo}Sello (apellido y nombre aclaratorio)`, tip: 'Debajo de la firma va el «sello»: escribí tu apellido y nombre aclaratorio.' });
    out.push({ ok: /\d{2}/.test(digitos(pie.matricula)), peso: 4, label: `${prefijo}Matrícula profesional`, tip: 'Debajo del sello va el número de matrícula (simbólico de 2 dígitos).' });
    const okFecha = new RegExp(`\\b${f.dd}\\s*[/.\\-]\\s*${f.mm}\\s*[/.\\-]\\s*(${f.aaaa}|${f.aaaa.slice(2)})\\b`).test(pie.fecha || '');
    out.push({ ok: okFecha, peso: 4, label: `${prefijo}Fecha en el margen inferior izquierdo`, tip: `La fecha debe ser la de hoy (${f.dd}/${f.mm}/${f.aaaa}).` });
    if (esCert) out.push({ ok: /\d{1,2}\s*[:.h]?\s*\d{0,2}/.test(pie.hora || '') && (pie.hora || '').trim().length > 0, peso: 3, label: `${prefijo}Hora de realización`, tip: 'El certificado es presente, no pronóstico: consigná la hora en que se realizó la práctica, debajo de la fecha.' });
  }

  function corregirCertificado(d, c) {
    const h = hojas.c1 || {}; const t = N(h.cuerpo); const out = [];
    const inicio = t.replace(/^rp\.?\/?\s*/, '');
    out.push({ ok: /^(certifico que|dejo constancia que)/.test(inicio), peso: 8, label: 'Comienza con «Certifico que…» o «Dejo constancia que…»', tip: 'El texto debe empezar sobre el margen izquierdo con «Certifico que…» o «Dejo constancia que…».' });
    const nom = tieneNombreEnOrden(h.cuerpo, c.p); out.push({ ok: nom.ok, peso: 10, label: 'Apellido/s y nombre/s en ese orden', tip: nom.tip });
    out.push({ ok: tieneDni(h.cuerpo, c.p), peso: 6, label: 'Número de documento del evaluado', tip: `Falta el número de documento (${c.p.dniTxt}).` });
    if (c.tipo !== 'alimentos') out.push({ ok: /\b(dni|documento nacional de identidad|documento)\b/.test(t), peso: 3, label: 'Tipo de documento (DNI)', tip: 'Aclará el tipo de documento: DNI (documento nacional de identidad).' });
    if (c.tipo !== 'ausentismo' && c.tipo !== 'reposo') out.push({ ok: /al momento (de la consulta|del examen|de este examen)/.test(t), peso: 8, label: 'Constatación «al momento de la consulta»', tip: 'El certificado es presente: escribí «al momento de la consulta» (no es un pronóstico).' });

    if (c.tipo === 'ausentismo') {
      out.push({ ok: /ausentarse/.test(t) && /trabajo/.test(t), peso: 10, label: '«Debe ausentarse de su lugar de trabajo»', tip: 'Indicá que debe ausentarse de su lugar de trabajo.' });
      out.push({ ok: t.includes(String(c.dias)) && t.includes(R.NUM_LETRAS[c.dias]), peso: 8, label: `Días de reposo en número y en letras (${c.dias} (${R.NUM_LETRAS[c.dias]}))`, tip: `Escribí la cantidad de días en número y en letras: ${c.dias} (${R.NUM_LETRAS[c.dias]}).` });
      out.push({ ok: c.d.kw.some((k) => t.includes(k)), peso: 10, label: 'Diagnóstico o síndrome (descriptivo)', tip: `Falta el diagnóstico que motiva el certificado (${c.d.dx}).` });
    } else if (c.tipo === 'reposo') {
      out.push({ ok: new RegExp(`\\b${c.p.edad}\\b`).test(t), peso: 5, label: 'Edad del paciente', tip: `Falta la edad (${c.p.edad} años).` });
      out.push({ ok: c.p.sexo === 'F' ? /(femenin|senorita|senora|la paciente)/.test(t) : /(masculin|senor|el paciente)/.test(t), peso: 4, label: 'Sexo del paciente', tip: 'Consigná el sexo del paciente.' });
      out.push({ ok: t.includes(String(c.p.hc)), peso: 6, label: 'N.° de historia clínica', tip: `Falta el número de historia clínica (${c.p.hc}).` });
      out.push({ ok: c.d.kw.some((k) => t.includes(k)), peso: 9, label: 'Diagnóstico', tip: `Falta el diagnóstico (${c.d.dx}).` });
      out.push({ ok: t.includes(String(c.d.h)) && /reposo/.test(t), peso: 8, label: `Indicación de reposo (${c.d.h} horas)`, tip: `Indicá el reposo: «Se indica ${c.d.h} horas de reposo».` });
    } else if (c.tipo === 'conducir') {
      const g = c.g.toLowerCase(); const grupoOk = /grupo sanguineo/.test(t) && new RegExp(`(^|[^a-z])${g}([^a-z]|$)`).test(t.replace(/grupo sanguineo/g, ' '));
      out.push({ ok: grupoOk, peso: 6, label: `Grupo sanguíneo «${c.g}»`, tip: `Escribí el grupo sanguíneo: ${c.g}.` });
      const rhOk = /\brh\b/.test(t) && t.includes(c.rh ? 'positivo' : 'negativo') && !t.includes(c.rh ? 'negativo' : 'positivo') && (c.rh ? /\(\s*\+\s*\)/ : /\(\s*-\s*\)/).test(t);
      out.push({ ok: rhOk, peso: 6, label: `Factor Rh ${c.rh ? '(+) positivo' : '(-) negativo'} con símbolo y aclaración`, tip: `El factor Rh va en símbolo y con su aclaración: Rh ${c.rh ? '(+) (positivo)' : '(-) (negativo)'}.` });
      const aptoTxt = /\bapt[oa]\b/.test(t); const noApto = /no (se encuentra )?apt[oa]/.test(t);
      out.push({ ok: c.apto ? aptoTxt && !noApto : noApto, peso: 10, label: c.apto ? 'Constata la aptitud para conducir' : 'Constata que NO está apto', tip: c.apto ? 'El examen fue normal: debe constar que se encuentra apto para conducir.' : 'El examen mostró una contraindicación: debe constar que NO se encuentra apto.' });
      if (!c.apto) out.push({ ok: t.includes(solo(c.motivo).split(' ').find((x) => x.length > 6) || 'zzz'), peso: 6, label: 'Fundamenta la no aptitud', tip: `Explicá el motivo de la no aptitud (${c.motivo}).` });
      out.push({ ok: c.veh.every((x) => x.kw.some((k) => t.includes(k.trim()))), peso: 8, label: `Tipo de vehículo (${c.veh.map((x) => x.v).join(', ')})`, tip: `Limitá el certificado al tipo de vehículo: ${c.veh.map((x) => x.v).join(' y ')}.` });
    } else if (c.tipo === 'buena_salud') {
      out.push({ ok: /buena salud/.test(t), peso: 12, label: 'Acredita «buena salud»', tip: 'Escribí la acreditación: se encuentra en «buena salud».' });
    } else if (c.tipo === 'recreativa') {
      out.push({ ok: /\bapt[oa]\b/.test(t) && !/no (se encuentra )?apt[oa]/.test(t), peso: 8, label: 'Acredita «aptitud»', tip: 'Acreditá la aptitud del evaluado.' });
      out.push({ ok: /recreativa/.test(t) && /no competitiva/.test(t), peso: 10, label: '«Actividad física recreativa no competitiva»', tip: 'Limitá la aptitud a «actividad física recreativa no competitiva».' });
    } else if (c.tipo === 'competitiva') {
      out.push({ ok: /\bapt[oa]\b/.test(t) && !/no (se encuentra )?apt[oa]/.test(t), peso: 8, label: 'Acredita «aptitud»', tip: 'Acreditá la aptitud del evaluado.' });
      out.push({ ok: /deporte de alto rendimiento/.test(t), peso: 10, label: '«Deporte de alto rendimiento»', tip: 'Limitá la aptitud a «deporte de alto rendimiento».' });
    } else if (c.tipo === 'alimentos') {
      out.push({ ok: /\bapt[oa]\b/.test(t) && !/no (se encuentra )?apt[oa]/.test(t), peso: 8, label: 'Acredita «aptitud»', tip: 'Acreditá la aptitud del evaluado.' });
      out.push({ ok: /manipular alimentos/.test(t), peso: 10, label: '«Manipular alimentos»', tip: 'Especificá que la aptitud es para «manipular alimentos».' });
    }
    out.push({ ok: tieneAutoridad(h.cuerpo, c.aut), peso: 6, label: c.aut ? 'Autoridad ante quien se presenta' : '«Para ser presentado ante quien corresponda»', tip: c.aut ? `Consignaste mal la autoridad: debe presentarse ante ${c.aut}.` : 'Consigná «Para ser presentado ante quien corresponda» (o la autoridad).' });
    out.push({ ok: !ABREV.test(h.cuerpo || ''), peso: 4, label: 'Sin abreviaturas ni siglas', tip: 'Evitá abreviaturas y siglas (Dr., Dx, Px, Hs…): el certificado debe ser legible para cualquiera.' });
    chequeoFinal('c1', true, out);
    return out;
  }

  function cabeceraPaciente(txt, p, out, opts = {}) {
    const nom = tieneNombreEnOrden(txt, p); out.push({ ok: nom.ok, peso: 8, label: `${opts.pre || ''}Apellido y nombre arriba y al centro`, tip: nom.tip });
    if (opts.dni) {
      out.push({ ok: tieneDni(txt, p), peso: 5, label: `${opts.pre || ''}N.° de DNI`, tip: `Debajo del nombre: el N.° de DNI (${p.dniTxt}).` });
      if (opts.edad) out.push({ ok: new RegExp(`\\b${p.edad}\\b`).test(N(txt)), peso: 3, label: `${opts.pre || ''}Edad`, tip: `Falta la edad (${p.edad} años).` });
      if (opts.dir) out.push({ ok: solo(p.direccion).split(' ').filter((x) => x.length > 3).slice(0, 2).every((x) => solo(txt).includes(x)), peso: 4, label: `${opts.pre || ''}Dirección`, tip: `Falta la dirección (${p.direccion}).` });
      return;
    }
    if (p.obraSocial) {
      out.push({ ok: solo(txt).includes(solo(p.obraSocial)), peso: 4, label: `${opts.pre || ''}Nombre de la obra social`, tip: `Falta la obra social (${p.obraSocial}).` });
      out.push({ ok: digitos(txt).includes(digitos(p.afiliado).replace(/[-/]/g, '')) || String(txt).includes(p.afiliado), peso: 4, label: `${opts.pre || ''}N.° de afiliado`, tip: `Falta el N.° de afiliado (${p.afiliado}).` });
    } else out.push({ ok: tieneDni(txt, p), peso: 5, label: `${opts.pre || ''}N.° de DNI (sin obra social)`, tip: `El paciente no tiene obra social: escribí su DNI (${p.dniTxt}).` });
  }

  function cuerpoReceta(txt, d, c, out, opts = {}) {
    const t = N(txt);
    if (opts.dx) out.push({ ok: /diagnostico/.test(t) || solo(d.dx).split(' ').some((x) => x.length > 5 && t.includes(x)) || (d.cie && t.includes(d.cie.toLowerCase())), peso: 4, label: `${opts.pre || ''}Diagnóstico (explícito o CIE-10)`, tip: `Consigná el diagnóstico (${d.dx}${d.cie ? ` o CIE-10 ${d.cie}` : ''}).` });
    out.push({ ok: t.includes(solo(d.dci)), peso: 9, label: `${opts.pre || ''}Medicamento por nombre genérico (${d.dci})`, tip: `Prescribí por NOMBRE GENÉRICO: ${d.dci}.` });
    const marca = d.marcas.some((m) => t.includes(m)) && !/sugiero/.test(t);
    out.push({ ok: !marca, peso: 4, label: `${opts.pre || ''}Sin marca comercial`, tip: 'No prescribas por marca comercial. Si querés, sugerí la marca después de «Sugiero:».' });
    out.push({ ok: tieneDosis(txt, d.dosis), peso: 7, label: `${opts.pre || ''}Dosis por unidad (${d.dosis})`, tip: `Indicá la dosis por unidad: ${d.dosis}.` });
    out.push({ ok: formaOk(txt, d.forma), peso: 5, label: `${opts.pre || ''}Forma de presentación (${d.forma})`, tip: `Indicá la forma de presentación: ${d.forma}.` });
    out.push({ ok: new RegExp(`\\b${d.unidades}\\b`).test(t), peso: 5, label: `${opts.pre || ''}Cantidad de unidades (${d.unidades})`, tip: `Indicá la cantidad de unidades (por ejemplo «x ${d.unidades}»).` });
    out.push({ ok: envasesOk(txt, 1), peso: 6, label: `${opts.pre || ''}Envases en romanos y en letras: I (uno)`, tip: 'La cantidad de envases va en números romanos y desarrollada en letras: I (uno).' });
    if (opts.posologia) out.push({ ok: /(cada|por la (manana|noche|tarde)|en ayunas|por dia|por dias)/.test(t), peso: 6, label: 'Posología (cuánto, cada cuánto y por cuánto tiempo)', tip: `Indicá la posología: ${d.posologia}.` });
  }

  function corregirReceta(d, c) {
    const h = hojas.r1 || {}; const out = [];
    cabeceraPaciente(h.encabezado, c.p, out);
    cuerpoReceta(h.cuerpo, c.d, c, out, { dx: true, posologia: true });
    chequeoFinal('r1', false, out);
    return out;
  }
  function corregirPsico(d, c) {
    const a = hojas.r1 || {}, b = hojas.r2 || {}; const out = [];
    cabeceraPaciente(a.encabezado, c.p, out, { pre: 'R1 · ' });
    cuerpoReceta(a.cuerpo, c.d, c, out, { dx: true, pre: 'R1 · ' });
    chequeoFinal('r1', false, out, 'R1 · ');
    cabeceraPaciente(b.encabezado, c.p, out, { pre: 'R2 · ', dni: true, edad: true, dir: true });
    cuerpoReceta(b.cuerpo, c.d, c, out, { dx: true, pre: 'R2 · ' });
    chequeoFinal('r2', false, out, 'R2 · ');
    out.push({ ok: N(a.cuerpo).includes(solo(c.d.dci)) && N(b.cuerpo).includes(solo(c.d.dci)) && tieneDosis(a.cuerpo, c.d.dosis) && tieneDosis(b.cuerpo, c.d.dosis), peso: 4, label: 'Ambas recetas coinciden (original y archivo)', tip: 'La receta original y la de archivo deben llevar exactamente la misma prescripción.' });
    return out;
  }
  function corregirExamenes(d, c) {
    const h = hojas.r1 || {}; const t = N(h.cuerpo); const out = [];
    cabeceraPaciente(h.encabezado, c.p, out);
    out.push({ ok: /^solicito\b/.test(t), peso: 8, label: 'Comienza con «Solicito» en el margen izquierdo', tip: 'Escribí la palabra «Solicito» (sin abreviaturas) sobre el margen izquierdo.' });
    const faltan = c.c.req.filter((r) => !new RegExp(r).test(t));
    out.push({ ok: faltan.length === 0, peso: 12, label: 'Pedidos correctos para el cuadro', tip: `Faltan estudios claves para ${c.c.dxp}: ${c.c.items.slice(0, 3).join(', ')}…` });
    out.push({ ok: !R.GENERICOS_PROHIBIDOS.some((g) => t.includes(g)), peso: 6, label: 'Sin terminología genérica (perfil lipídico, perfil renal…)', tip: 'No uses términos genéricos: pedí cada determinación por separado.' });
    const crudo = /\b(glucosa|urea|creatinina|trigliceridos|hierro serico|ferritina|colesterol total)\b/.test(t) && !/emia/.test(t);
    out.push({ ok: !crudo, peso: 6, label: 'Concentraciones séricas con sufijo «-emia»', tip: 'Las concentraciones séricas llevan el sufijo «-emia»: glucemia, uremia, creatininemia, trigliceridemia…' });
    out.push({ ok: !/(radiograf|electrocardiograma|ecograf|tomograf|resonancia)/.test(t), peso: 5, label: 'Un solo tipo de pedido por recetario', tip: 'Se escribe un pedido por recetario: laboratorio en uno, electrocardiograma en otro, Rx en otro.' });
    const mot = solo(c.c.motivo).split(' ').find((x) => x.length > 5) || 'zzz'; const dxw = solo(c.c.dxp).split(' ').find((x) => x.length > 5) || 'zzz';
    out.push({ ok: /(motivo|diagnostico)/.test(t) && (t.includes(mot) || t.includes(dxw)), peso: 10, label: '«Motivo» / «Diagnóstico presuntivo»', tip: `Agregá el motivo o el diagnóstico presuntivo (${c.c.motivo}; ${c.c.dxp}).` });
    out.push({ ok: (h.cuerpo || '').split('\n').filter((x) => x.trim()).length >= 3, peso: 4, label: 'Pedidos enlistados uno debajo del otro', tip: 'Con varios pedidos, escribilos desde el margen izquierdo, uno debajo del otro.' });
    chequeoFinal('r1', true, out);
    return out;
  }

  const CORRECTORES = { receta: corregirReceta, psicofarmacos: corregirPsico, examenes: corregirExamenes };

  // ------------------------------------------------------------------ modelos (respuesta esperada)
  function modeloDe(d, c) {
    const p = c.p; const f = hoyTxt(); const fecha = `${f.dd}/${f.mm}/${f.aaaa}`; const hora = '10:30';
    const nom = `${p.apellido}, ${p.nombre}`;
    const pie = { fecha, hora, sello: 'Apellido, Nombre', matricula: '16', firma: true, raya: true };
    const cabOS = `${nom}\n${p.obraSocial ? `${p.obraSocial}\n${p.afiliado}` : `DNI ${p.dniTxt}`}`;
    const cuerpoRp = (x) => `Diagnóstico: ${x.dx}\n\n${x.dci} ${x.dosis}\n${x.forma} x ${x.unidades}\nI (uno)`;
    switch (c.tipo) {
      case 'receta': return { r1: { ...pie, encabezado: cabOS, cuerpo: `${cuerpoRp(c.d)}\n${c.d.posologia}` } };
      case 'psicofarmacos': return { r1: { ...pie, encabezado: `${nom}\n${p.obraSocial}\n${p.afiliado}`, cuerpo: `Diagnóstico: ${c.d.dx} (CIE-10 ${c.d.cie})\n\n${c.d.dci} ${c.d.dosis}\n${c.d.forma} x ${c.d.unidades}\nI (uno)` }, r2: { ...pie, encabezado: `${nom}\nDNI ${p.dniTxt}\n${p.edad} años\n${p.direccion}`, cuerpo: `Diagnóstico: ${c.d.dx} (CIE-10 ${c.d.cie})\n\n${c.d.dci} ${c.d.dosis}\n${c.d.forma} x ${c.d.unidades}\nI (uno)` } };
      case 'examenes': return { r1: { ...pie, encabezado: cabOS, cuerpo: `Solicito\n${c.c.items.map((x) => `- ${x}`).join('\n')}\n\nMotivo: ${c.c.motivo}.\nDiagnóstico presuntivo: ${c.c.dxp}.` } };
      case 'ausentismo': return { c1: { ...pie, cuerpo: `Dejo constancia que ${nom}, DNI ${p.dniTxt}, debe ausentarse de su lugar de trabajo a partir del día de la fecha y por ${c.dias} (${R.NUM_LETRAS[c.dias]}) días, por presentar ${c.d.dx}.\n${c.aut ? `Para ser presentado ante ${c.aut}.` : 'Para ser presentado ante quien corresponda.'}` } };
      case 'reposo': return { c1: { ...pie, cuerpo: `Certifico que ${p.sexo === 'F' ? 'la señorita' : 'el señor'} ${nom}, de ${p.edad} años, sexo ${p.sexo === 'F' ? 'femenino' : 'masculino'}, DNI ${p.dniTxt}, cuya historia clínica N.° ${p.hc} consta en mi poder, se encuentra cursando una ${c.d.dx}. Se indica ${c.d.h} horas de reposo.\nPara ser presentado ante quien corresponda.` } };
      case 'conducir': return { c1: { ...pie, cuerpo: `Certifico que ${nom}, DNI ${p.dniTxt}, grupo sanguíneo «${c.g}» con factor Rh ${c.rh ? '(+) (positivo)' : '(-) (negativo)'}, al momento de la consulta ${c.apto ? 'no presenta alteraciones en el examen de salud, encontrándose apto/a' : `presenta ${c.motivo}, por lo que no se encuentra apto/a`} para la conducción de ${c.veh.map((x) => x.v).join(' y ')}.\nPara ser presentado ante quien corresponda.` } };
      case 'buena_salud': return { c1: { ...pie, cuerpo: `Certifico que ${nom}, DNI ${p.dniTxt}, al momento de la consulta no presenta alteraciones en el examen de salud, acreditándose su buena salud.\nPara ser presentado ante quien corresponda.` } };
      case 'recreativa': return { c1: { ...pie, cuerpo: `Certifico que ${nom}, DNI ${p.dniTxt}, al momento de la consulta se encuentra apto/a para la realización de actividad física recreativa no competitiva.\nPara ser presentado ante quien corresponda.` } };
      case 'competitiva': return { c1: { ...pie, cuerpo: `Certifico que ${nom}, DNI ${p.dniTxt}, al momento de la consulta se encuentra apto/a para deporte de alto rendimiento.\nPara ser presentado ante quien corresponda.` } };
      case 'alimentos': return { c1: { ...pie, cuerpo: `Certifico que ${nom}, DNI ${p.dniTxt}, se encuentra apto/a al momento de la consulta para manipular alimentos.\n${c.aut ? `Para ser presentado ante ${c.aut}.` : 'Para ser presentado ante quien corresponda.'}` } };
    }
    return {};
  }

  // ------------------------------------------------------------------ hoja de papel (HTML)
  function membrete(titulo) {
    return `<div class="rz-membrete">
      <div class="rz-mb-logo"><img class="rz-n" src="assets/N%20NIKA.png" alt="NikaMed"><img class="rz-vec" src="assets/TEXTO%20VECTOR%20NIKA.png" alt="NIKA"></div>
      <div class="rz-mb-txt"><b>NikaMed</b><span>Consultorio médico · ${esc(titulo)}</span><small>Recetario simulado de práctica · sin validez legal</small></div>
    </div>`;
  }
  function hojaHtml(doc, h) {
    const esCert = doc.layout === 'certificado';
    return `<article class="rz-hoja" data-hoja="${h.id}">
      <div class="rz-tit-hoja">${esc(h.titulo)}</div>
      ${membrete(esCert ? 'Certificado médico' : doc.layout === 'solicitud' ? 'Solicitud de estudios' : 'Receta')}
      <div class="rz-cuerpo">
        ${h.encabezado ? `<textarea class="rz-campo rz-centro" data-f="encabezado" rows="4" spellcheck="false" placeholder="Apellido y nombre del paciente…" aria-label="Encabezado del paciente"></textarea>` : ''}
        <div class="rz-rp">${esCert ? 'Rp/' : 'R/p'}</div>
        <div class="rz-area">
          <textarea class="rz-campo rz-lineas" data-f="cuerpo" rows="${esCert ? 9 : 8}" spellcheck="false" placeholder="${esCert ? 'Escribí el certificado…' : doc.layout === 'solicitud' ? 'Solicito…' : 'Diagnóstico, medicamento, dosis, forma, cantidades…'}" aria-label="Cuerpo del documento"></textarea>
          <svg class="rz-raya" aria-hidden="true"></svg>
        </div>
        <div class="rz-pie">
          <div class="rz-pie-izq">
            <label>Fecha <input class="rz-campo rz-mini" data-f="fecha" type="text" placeholder="dd/mm/aaaa" autocomplete="off"></label>
            <label>Hora <input class="rz-campo rz-mini" data-f="hora" type="text" placeholder="hh:mm" autocomplete="off"></label>
            <button type="button" class="rz-btn-mini" data-accion="raya">〰️ Rayar espacio libre</button>
          </div>
          <div class="rz-pie-der">
            <div class="rz-firma"><canvas width="300" height="110" data-firma></canvas><span>Firma</span><button type="button" class="rz-limpia" data-accion="borra-firma" title="Borrar firma">↺</button></div>
            <label class="rz-sello">Sello (aclaratorio) <input class="rz-campo" data-f="sello" type="text" placeholder="Apellido y nombre" autocomplete="off"></label>
            <label class="rz-sello">Matrícula N.° <input class="rz-campo rz-mini" data-f="matricula" type="text" placeholder="simbólica (2 dígitos)" autocomplete="off"></label>
          </div>
        </div>
      </div>
    </article>`;
  }

  // ------------------------------------------------------------------ eventos de la hoja
  function conectarHoja(art) {
    const id = art.dataset.hoja; const st = hojas[id] = hojas[id] || { firma: false, raya: false };
    art.querySelectorAll('[data-f]').forEach((el) => {
      el.addEventListener('input', () => { st[el.dataset.f] = el.value; if (el.dataset.f === 'cuerpo') actualizarRaya(art); });
      el.addEventListener('focus', () => { ultimoCampo = el; });
      // Modo lapicera: no se puede borrar ni pegar; los errores se salvan con «Digo…»
      el.addEventListener('keydown', (e) => { if (lapicera && (e.key === 'Backspace' || e.key === 'Delete')) { e.preventDefault(); aviso(art); } });
      el.addEventListener('beforeinput', (e) => { if (lapicera && /^(delete|history|insertFromPaste|insertFromDrop)/.test(e.inputType || '')) { e.preventDefault(); aviso(art); } });
      el.addEventListener('paste', (e) => { if (lapicera) { e.preventDefault(); aviso(art); } });
      el.addEventListener('cut', (e) => { if (lapicera) e.preventDefault(); });
    });
    art.querySelector('[data-accion="raya"]').addEventListener('click', () => { st.raya = !st.raya; actualizarRaya(art); });
    art.querySelector('[data-accion="borra-firma"]').addEventListener('click', () => { const c = art.querySelector('canvas'); c.getContext('2d').clearRect(0, 0, c.width, c.height); st.firma = false; });
    firmaCanvas(art.querySelector('canvas'), st);
  }
  function aviso(art) {
    const b = art.querySelector('.rz-tit-hoja'); b.classList.remove('rz-shake'); void b.offsetWidth; b.classList.add('rz-shake');
    toast('✒️ Modo lapicera: no se puede borrar. Salvá el error escribiendo «Digo…» y seguí.');
  }
  function actualizarRaya(art) {
    const st = hojas[art.dataset.hoja]; const svg = art.querySelector('.rz-raya'); const ta = art.querySelector('[data-f="cuerpo"]');
    const btn = art.querySelector('[data-accion="raya"]'); btn.classList.toggle('on', !!st.raya);
    svg.innerHTML = '';
    if (!st.raya) return;
    const lh = 32; const total = ta.clientHeight; const h0 = ta.style.height; ta.style.height = '0px'; const usado = Math.min(total, Math.ceil((ta.scrollHeight - 12) / lh) * lh + 6); ta.style.height = h0;
    const y0 = Math.max(usado, 12), w = ta.clientWidth - 24; if (y0 >= total - 8) return;
    let d = `M 12 ${y0 + 10}`; const paso = 22; let x = 12, arriba = false; const yTop = y0 + 8, yBot = total - 8;
    while (x < w + 12) { x += paso; d += ` L ${Math.min(x, w + 12)} ${arriba ? yTop : yBot}`; arriba = !arriba; }
    svg.setAttribute('viewBox', `0 0 ${ta.clientWidth} ${total}`); svg.innerHTML = `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" opacity=".8"/>`;
  }
  function firmaCanvas(cv, st) {
    const ctx = cv.getContext('2d'); let dib = false; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1e3a8a';
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
    cv.addEventListener('pointerdown', (e) => { dib = true; cv.setPointerCapture(e.pointerId); const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    cv.addEventListener('pointermove', (e) => { if (!dib) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); st.firma = true; });
    const fin = () => { dib = false; };
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
  }

  // ------------------------------------------------------------------ pantalla principal
  let filtro = 'Todos';
  const CATS = ['Todos', 'Recetas', 'Solicitudes', 'Certificados por enfermedad', 'Certificados de aptitud'];
  const COLOR_CAT = { 'Recetas': '#0ea5e9', 'Solicitudes': '#8b5cf6', 'Certificados por enfermedad': '#f59e0b', 'Certificados de aptitud': '#10b981' };

  function resumenProgreso() {
    const s = stats(); const hechos = R.ORDEN.filter((id) => s[id]).length;
    const prom = hechos ? Math.round(R.ORDEN.filter((id) => s[id]).reduce((a, id) => a + s[id].mejor, 0) / hechos) : 0;
    const intentos = Object.values(s).reduce((a, x) => a + (x.intentos || 0), 0);
    const tile = (ico, val, lab, i) => `<div class="rz-stat" style="animation-delay:${i * 90}ms"><span>${ico}</span><div><b data-cuenta="${val}">${val}</b><small>${lab}</small></div></div>`;
    return `<div class="rz-stats">${tile('📄', `${hechos}/${R.ORDEN.length}`, 'documentos practicados', 0)}${tile('🎯', `${prom}`, 'promedio de tus mejores notas', 1)}${tile('🔁', `${intentos}`, 'intentos realizados', 2)}</div>`;
  }
  function comoFunciona() {
    const paso = (n, ico, t, d) => `<div class="rz-paso" style="animation-delay:${n * 110}ms"><span class="rz-paso-n">${n}</span><i>${ico}</i><div><b>${t}</b><small>${d}</small></div></div>`;
    return `<div class="rz-pasos">${paso(1, '📖', 'Leé la guía', 'Cada documento trae sus pasos y reglas de oro.')}${paso(2, '✍️', 'Completá la hoja', 'Escribí sobre el recetario: firma, sello, fecha…')}${paso(3, '✅', 'Recibí tu corrección', 'Puntaje, errores y el modelo para comparar.')}</div>`;
  }
  function tarjetas() {
    const s = stats(); let n = 0;
    const chips = `<div class="rz-filtros" role="tablist">${CATS.map((c) => `<button type="button" class="${c === filtro ? 'on' : ''}" onclick="NikaRecetarios.filtrar('${c}')">${c}</button>`).join('')}</div>`;
    const docs = R.ORDEN.map((id) => R.DOCS[id]).filter((d) => filtro === 'Todos' || d.cat === filtro);
    return chips + `<div class="rz-grid">${docs.map((d) => {
      const x = s[d.id]; const col = COLOR_CAT[d.cat] || '#0284c7';
      return `<button type="button" class="rz-card" style="--c:${col};animation-delay:${(n++) * 55}ms" onclick="NikaRecetarios.abrir('${d.id}')">
        <span class="rz-tag">${esc(d.cat)}</span>
        <span class="rz-ico">${d.icono}</span><b>${esc(d.titulo)}</b><small>${esc(d.resumen)}</small>
        ${x ? `<span class="rz-best"><i style="width:${x.mejor}%"></i><em>Mejor ${x.mejor}/100 · ${x.intentos} ${x.intentos === 1 ? 'intento' : 'intentos'}</em></span>` : '<span class="rz-best nuevo"><em>Sin intentos · ¡probalo!</em></span>'}
        <span class="rz-go">Practicar →</span>
      </button>`;
    }).join('')}</div>`;
  }
  function filtrar(c) { filtro = c; renderLista(); }

  function cabecera() {
    return `<section class="rz-hero">
      <div class="rz-hero-logo"><img src="assets/N%20NIKA.png" alt="NikaMed"><img class="v" src="assets/TEXTO%20VECTOR%20NIKA.png" alt="NIKA"></div>
      <div><h1>Recetarios y Certificados <span>NikaMed</span></h1><p>Practicá cómo se escribe cada documento médico, sobre una hoja de recetario real: guías paso a paso, casos clínicos al azar y corrección automática.</p></div>
    </section>
    <nav class="rz-tabs" role="tablist"><button type="button" class="${vista === 'sim' ? 'on' : ''}" onclick="NikaRecetarios.vista('sim')">✍️ Simulador</button><button type="button" class="${vista === 'teoria' ? 'on' : ''}" onclick="NikaRecetarios.vista('teoria')">📚 Guía teórica</button></nav>`;
  }

  function renderLista() {
    const root = $('#rz-root'); docId = null;
    if (vista === 'teoria') { root.innerHTML = cabecera() + teoriaHtml(); return; }
    root.innerHTML = cabecera() + resumenProgreso() + comoFunciona() + `<p class="rz-intro">Elegí qué querés practicar. Cada intento genera un paciente y un caso distintos.</p>${tarjetas()}`;
  }

  function teoriaHtml() {
    const T = R.TEORIA;
    const acc = (tit, cuerpo) => `<details class="rz-acc" open><summary>${tit}</summary><div>${cuerpo}</div></details>`;
    const lista = (arr) => `<ul>${arr.map((x) => `<li>${x.t ? `<b>${esc(x.t)}:</b> ` : ''}${esc(x.d || x)}</li>`).join('')}</ul>`;
    return `<div class="rz-teoria">
      ${acc('📄 ¿Qué es un certificado médico?', `<p>${esc(T.definicion)}</p><p><em>${esc(T.consulta.lema)}</em></p><p>${esc(T.consulta.dato)}</p>${lista(T.clases)}`)}
      ${acc('🏛️ Certificados oficiales (obligatorios por ley)', lista(T.oficiales))}
      ${acc('✅ Cómo debe ser un certificado bien confeccionado', lista(T.caracteristicas) + `<p>${esc(T.ley)}</p>`)}
      ${acc('🚫 Cuándo corresponde NEGARSE a extenderlo', lista(T.negativa) + `<p>La pregunta clave ante cualquier pedido: <b>¿corresponde o no su extensión? ¿Hay justa causa?</b></p>`)}
      ${acc('⚖️ Certificado falso y Código Penal', lista(T.penal))}
      ${acc('🩺 La consulta y las herramientas del examen', `<p><b>Objetivos primarios:</b> ${esc(T.consulta.primarios)}</p><p><b>Objetivos secundarios:</b> ${esc(T.consulta.secundarios)}</p>${lista(T.herramientas)}`)}
      ${acc('💊 Recetas: lo esencial', `<ul><li>Prescribir por <b>nombre genérico</b> (denominación común internacional).</li><li>Dosis por unidad (mcg / mg / g), forma de presentación, cantidad de unidades y de envases (en romanos y en letras).</li><li>Firma y sello debajo, sin dejar espacios en blanco; fecha en el margen inferior izquierdo.</li><li><b>Psicofármacos:</b> dos recetas — original (con obra social y afiliado) y de archivo/duplicado (con DNI, edad y dirección).</li><li>Sin abreviaturas confusas, errores ni enmiendas: los errores se salvan con «Digo…».</li></ul>`)}
    </div>`;
  }

  function guiaLateral(doc) {
    return `<aside class="rz-guia">
      <h3>📋 Guía paso a paso</h3>
      <ol>${doc.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
      <h4>⭐ Reglas de oro</h4>
      <ul class="rz-reglas">${doc.reglas.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      <h4>📝 Lista rápida</h4>
      <div class="rz-check">${['Tinta del mismo color', 'Nombre: apellido, nombre', 'Sin errores ni tachaduras', 'Espacios en blanco rayados', 'Firma, sello y matrícula', 'Fecha y hora'].map((x) => `<label><input type="checkbox"> <span>${x}</span></label>`).join('')}</div>
    </aside>`;
  }

  function abrir(id, nuevoCaso = true) {
    const doc = R.DOCS[id]; if (!doc) return;
    docId = id; if (nuevoCaso) caso = doc.caso();
    Object.keys(hojas).forEach((k) => delete hojas[k]);
    const f = hoyTxt();
    const root = $('#rz-root');
    root.innerHTML = `
      <div class="rz-barra"><button type="button" class="rz-volver" onclick="NikaRecetarios.lista()">← Volver a los documentos</button><h2>${doc.icono} ${esc(doc.titulo)}</h2></div>
      <section class="rz-caso ${caso.trampa ? 'trampa' : ''}">
        <div class="rz-caso-h"><b>🩺 Caso clínico</b><div><button type="button" class="rz-btn-sec" onclick="NikaRecetarios.nuevoCaso()">🎲 Nuevo caso</button></div></div>
        <p>${esc(caso.texto)}</p>
        ${doc.trampa ? `<div class="rz-corresponde"><span>Antes de escribir: <b>¿corresponde extender este certificado?</b></span><button type="button" class="rz-btn-sec" onclick="NikaRecetarios.negarme()">🚫 No corresponde extenderlo</button></div>` : ''}
        <details class="rz-datos"><summary>Datos del paciente</summary><ul>
          <li><b>Apellido y nombre:</b> ${esc(caso.p.nombreCompleto)}</li><li><b>DNI:</b> ${esc(caso.p.dniTxt)}</li><li><b>Edad / sexo:</b> ${caso.p.edad} años · ${caso.p.sexo === 'F' ? 'femenino' : 'masculino'}</li>
          ${caso.p.obraSocial ? `<li><b>Obra social:</b> ${esc(caso.p.obraSocial)} · <b>Afiliado:</b> ${esc(caso.p.afiliado)}</li>` : '<li><b>Obra social:</b> no tiene</li>'}
          <li><b>Dirección:</b> ${esc(caso.p.direccion)}</li><li><b>Historia clínica N.°:</b> ${caso.p.hc}</li><li><b>Fecha de hoy:</b> ${f.dd}/${f.mm}/${f.aaaa}</li></ul></details>
      </section>
      <div class="rz-mesa">
        <div class="rz-hojas">
          <div class="rz-herr"><label class="rz-sw"><input type="checkbox" id="rz-lap" ${lapicera ? 'checked' : ''}> ✒️ Modo lapicera (no se puede borrar)</label><button type="button" class="rz-btn-sec" onclick="NikaRecetarios.digo()">✏️ Digo…</button></div>
          <div class="rz-hojas-w">${doc.hojas.map((h) => hojaHtml(doc, h)).join('')}</div>
        </div>
        ${guiaLateral(doc)}
      </div>
      <div class="rz-acciones"><button type="button" class="rz-btn" onclick="NikaRecetarios.corregir()">✅ Corregir</button><button type="button" class="rz-btn-sec" onclick="NikaRecetarios.modelo()">👁️ Ver modelo</button><button type="button" class="rz-btn-sec" onclick="NikaRecetarios.abrir('${id}', false)">↺ Reiniciar hojas</button></div>`;
    root.querySelectorAll('.rz-hoja').forEach(conectarHoja);
    $('#rz-lap').addEventListener('change', (e) => { lapicera = e.target.checked; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ------------------------------------------------------------------ acciones
  function digo() {
    const el = ultimoCampo || $('[data-f="cuerpo"]'); if (!el) return;
    const ins = (el.value && !/\s$/.test(el.value) ? ' ' : '') + 'Digo: ';
    el.value += ins; el.dispatchEvent(new Event('input', { bubbles: true })); el.focus();
  }
  function nuevoCaso() { abrir(docId, true); }
  function negarme() {
    const doc = R.DOCS[docId];
    const ov = document.createElement('div'); ov.className = 'rz-modal on'; ov.id = 'rz-modal-neg';
    ov.innerHTML = `<div class="rz-mcard"><h3>🚫 ¿Por qué no corresponde extenderlo?</h3><p>Elegí el fundamento:</p>
      <div class="rz-opc">${[['complacencia', 'Es un certificado de complacencia: acredita un hecho falso (no hubo enfermedad).'], ['retroactivo', 'Pide certificar algo que el médico no constató personalmente.'], ['ilicito', 'Puede usarse con fines ilícitos u oculta un dato que pone en riesgo a terceros.'], ['nada', 'En realidad sí corresponde extenderlo: hay justa causa.']].map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('')}</div>
      <div class="rz-mb"><button type="button" class="rz-btn-sec" data-x>Cancelar</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('[data-x]').onclick = () => ov.remove();
    ov.querySelectorAll('.rz-opc button').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k; ov.remove();
      const T = R.TEORIA;
      let ok, msg;
      if (caso.trampa) {
        ok = k === caso.trampa.razon;
        msg = ok ? `¡Correcto! ${caso.trampa.txt} Te amparás en el Art. 123 del Código de Ética («ciencia y conciencia»). Extenderlo sería un certificado falso (Art. 295 del Código Penal).` : `No era ese el fundamento: ${caso.trampa.txt} Este certificado NO correspondía extenderlo.`;
      } else { ok = false; msg = k === 'nada' ? 'Correcto en el razonamiento, pero entonces tenés que extenderlo: escribí el certificado.' : 'En este caso SÍ había justa causa y constatación clínica: correspondía extender el certificado. Negarlo sin motivo no es adecuado.'; if (k === 'nada') ok = true; }
      if (caso.trampa) guardarStat(docId + '-negativa', ok ? 100 : 0);
      mostrarModal(`<div class="rz-res-h ${ok ? 'ok' : 'mal'}"><span>${ok ? '✅' : '❌'}</span><div><b>${ok ? 'Buen criterio médico' : 'Revisá el criterio'}</b></div></div><p>${esc(msg)}</p><ul class="rz-lista-neg">${T.negativa.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`);
    }));
  }

  function mostrarModal(html, extra = '') {
    document.getElementById('rz-modal-res')?.remove();
    const ov = document.createElement('div'); ov.className = 'rz-modal on'; ov.id = 'rz-modal-res';
    ov.innerHTML = `<div class="rz-mcard grande">${html}<div class="rz-mb">${extra}<button type="button" class="rz-btn" data-x>Cerrar</button></div></div>`;
    document.body.appendChild(ov); ov.querySelector('[data-x]').onclick = () => ov.remove(); ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  }

  function corregir() {
    const doc = R.DOCS[docId];
    if (caso.trampa) {
      mostrarModal(`<div class="rz-res-h mal"><span>⚠️</span><div><b>Este certificado no correspondía</b></div></div><p>${esc(caso.trampa.txt)} Antes de escribir tenías que preguntarte si <b>correspondía o no su extensión</b>. Usá el botón «No corresponde extenderlo».</p>`);
      guardarStat(docId, 0); return;
    }
    const checks = (doc.layout === 'certificado' ? corregirCertificado : CORRECTORES[docId])(doc, caso);
    const total = checks.reduce((a, c) => a + c.peso, 0), obt = checks.filter((c) => c.ok).reduce((a, c) => a + c.peso, 0);
    const pct = Math.round(obt * 100 / total);
    guardarStat(docId, pct);
    const nivel = pct >= 90 ? ['Excelente', '🏆'] : pct >= 75 ? ['Muy bien', '🥇'] : pct >= 60 ? ['Aprobado', '✅'] : ['A reforzar', '📚'];
    const mal = checks.filter((c) => !c.ok);
    mostrarModal(`<div class="rz-res-h ${pct >= 60 ? 'ok' : 'mal'}"><div class="rz-anillo" style="--p:${pct}"><b>${pct}</b><small>/100</small></div><div><b>${nivel[1]} ${nivel[0]}</b><small>${checks.length - mal.length} de ${checks.length} criterios cumplidos</small></div><span class="rz-sello-res ${pct >= 60 ? 'ok' : 'mal'}">${pct >= 60 ? 'APROBADO' : 'A REFORZAR'}</span></div>
      ${mal.length ? `<h4>Para corregir</h4><ul class="rz-checks mal">${mal.map((c) => `<li><span>✗</span><div><b>${esc(c.label)}</b><small>${esc(c.tip || '')}</small></div></li>`).join('')}</ul>` : '<p class="rz-perfecto">¡Impecable! Cumpliste todos los pasos de la guía.</p>'}
      <details class="rz-acc"><summary>✓ Criterios cumplidos (${checks.length - mal.length})</summary><ul class="rz-checks bien">${checks.filter((c) => c.ok).map((c) => `<li><span>✓</span><div><b>${esc(c.label)}</b></div></li>`).join('')}</ul></details>`,
    `<button type="button" class="rz-btn-sec" onclick="NikaRecetarios.modelo()">👁️ Ver modelo</button><button type="button" class="rz-btn-sec" onclick="document.getElementById('rz-modal-res').remove();NikaRecetarios.nuevoCaso()">🎲 Nuevo caso</button>`);
  }

  function modelo() {
    const doc = R.DOCS[docId]; document.getElementById('rz-modal-res')?.remove();
    if (caso.trampa) { mostrarModal(`<h3>👁️ Modelo</h3><p>En este caso el modelo correcto es <b>no extender el certificado</b>. ${esc(caso.trampa.txt)}</p>`); return; }
    const m = modeloDe(doc, caso);
    const hojasHtml = doc.hojas.map((h) => {
      const x = m[h.id]; if (!x) return '';
      return `<article class="rz-hoja modelo"><div class="rz-tit-hoja">${esc(h.titulo)} · modelo</div>${membrete(doc.layout === 'certificado' ? 'Certificado médico' : 'Receta')}<div class="rz-cuerpo">
        ${x.encabezado ? `<pre class="rz-campo rz-centro">${esc(x.encabezado)}</pre>` : ''}<div class="rz-rp">${doc.layout === 'certificado' ? 'Rp/' : 'R/p'}</div><pre class="rz-campo rz-lineas">${esc(x.cuerpo)}</pre>
        <div class="rz-pie"><div class="rz-pie-izq"><span>${esc(x.fecha)}</span><span>${esc(x.hora)}</span></div><div class="rz-pie-der"><div class="rz-firma modelo-f"><svg viewBox="0 0 200 60"><path d="M10 40 C30 5 40 55 60 25 S90 10 110 35 150 45 190 20" fill="none" stroke="#1e3a8a" stroke-width="2.4"/></svg><span>Firma</span></div><span>${esc(x.sello)} · M.P. ${esc(x.matricula)}</span></div></div></div></article>`;
    }).join('');
    mostrarModal(`<h3>👁️ Cómo debería quedar</h3><p class="rz-mini-t">Una forma correcta de completarlo (hay otras redacciones válidas, mientras cumplan todos los pasos de la guía).</p><div class="rz-hojas-w modelo-w">${hojasHtml}</div>`);
  }

  function irLista() { renderLista(); }
  function cambiarVista(v) { vista = v; renderLista(); }

  function init() {
    const p = new URLSearchParams(location.search);
    if (p.get('doc') && R.DOCS[p.get('doc')]) abrir(p.get('doc')); else renderLista();
    if (p.get('from') === 'examen') { const b = document.getElementById('rz-atras'); if (b) b.style.display = ''; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  return { abrir, filtrar, lista: irLista, vista: cambiarVista, nuevoCaso, corregir, modelo, digo, negarme, _test: { corregirCertificado, corregirReceta, corregirPsico, corregirExamenes, modeloDe, hojas, setCaso: (c, id) => { caso = c; docId = id; } } };
})();
window.NikaRecetarios = NikaRecetarios;
