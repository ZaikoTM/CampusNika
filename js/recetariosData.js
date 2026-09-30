// js/recetariosData.js
// CAMPUS NIKA — Simulador de Recetarios y Certificados: contenido (guías, reglas, casos y modelos).
// Fuentes: guías de procedimiento de la cátedra, "El certificado médico" (Bailliere & Arislur, Evidencia 2006),
// videoclase de certificados médicos y práctica de psicofármacos. Todo el contenido es de estudio (ficticio).

const RECETARIOS = (() => {
  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // ------------------------------------------------------------------ generación de pacientes ficticios
  const APELLIDOS = ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero', 'Sánchez', 'Sosa', 'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Giménez', 'Gutiérrez', 'Peralta', 'Castro', 'Ortiz', 'Silva', 'Núñez', 'Luna', 'Cabrera', 'Ríos', 'Morales', 'Domínguez', 'Vega', 'Ledesma', 'Villalba', 'Bustos', 'Coronel', 'Strappa', 'Condes'];
  const NOMBRES_F = ['Lucía', 'Camila', 'Valentina', 'Sofía', 'Martina', 'Julieta', 'Agustina', 'Florencia', 'Carolina', 'Paula', 'Romina', 'Natalia', 'Mariana', 'Gabriela', 'Andrea Jorgelina', 'Gisell Jasmin', 'Milagros', 'Noelia', 'Daniela', 'Verónica'];
  const NOMBRES_M = ['Mateo', 'Santiago', 'Lucas', 'Nicolás', 'Facundo', 'Matías', 'Tomás', 'Franco', 'Ezequiel', 'Gonzalo', 'Sebastián', 'Diego', 'Pablo', 'Javier', 'Marcelo', 'Ricardo', 'Eduardo', 'Christian', 'Guido Natanael', 'Marco Antonio'];
  const OBRAS_SOCIALES = ['Pericles-Salud', 'Salud Federal', 'Mutual Ribereña', 'Vida Plena', 'Aconcagua Salud'];
  const CALLES = ['Urquiza', 'San Martín', 'Belgrano', 'Sarmiento', 'Mitre', 'Rivadavia', 'Alberdi', 'Moreno'];
  const CIUDADES = ['Ñengará', 'Santa Clara', 'Villa Ribera', 'Puerto Norte', 'San Lorenzo del Sur'];

  const fmtDni = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function paciente(opts = {}) {
    const sexo = opts.sexo || azar(['F', 'M']);
    const edad = entre(opts.edadMin || 18, opts.edadMax || 65);
    const dni = entre(opts.dniMin || 18000000, opts.dniMax || 46999999);
    const conOS = opts.conOS != null ? opts.conOS : Math.random() < 0.6;
    const p = {
      sexo, edad, apellido: azar(APELLIDOS), nombre: azar(sexo === 'F' ? NOMBRES_F : NOMBRES_M),
      dni, dniTxt: fmtDni(dni),
      obraSocial: conOS ? azar(OBRAS_SOCIALES) : null,
      afiliado: conOS ? `${entre(1, 9)}${entre(1, 9)}-${entre(100000, 999999)}-${entre(1, 9)}/${String(entre(0, 5)).padStart(2, '0')}` : null,
      direccion: `${azar(CALLES)} ${entre(100, 1900)}, ${azar(CIUDADES)}`,
      hc: entre(1000, 99999),
    };
    p.nombreCompleto = `${p.apellido}, ${p.nombre}`;
    return p;
  }

  // ------------------------------------------------------------------ pasos de cada guía (de los PDF de la cátedra)
  const P_FIRMA_SELLO = [
    'Firmar al finalizar el texto o sobre el margen inferior derecho, sin dejar espacios en blanco (rayar/anular el espacio libre).',
    'Colocar el «sello» debajo de la firma: apellido y nombre del profesional (aclaratorio).',
    'Escribir el número de Matrícula Profesional debajo del sello (en la práctica, un número simbólico de 2 dígitos).',
    'Escribir la fecha en el margen inferior izquierdo y, debajo, la hora en que se realizó la práctica.',
  ];
  const REGLA_TINTA = 'Escribir siempre con tinta del mismo color y tonalidad (preferentemente azul).';
  const REGLA_ERRORES = 'Sin errores, tachaduras ni enmiendas. Si hay un error, se salva con la palabra «Digo…» dentro de los márgenes.';

  const TEORIA = {
    definicion: 'Testimonio escrito acerca del estado de salud (actual o pasada) de un paciente, que el profesional extiende a su solicitud o a la de sus familiares, luego de la debida constatación a través de la asistencia, el examen o el reconocimiento.',
    clases: [
      { t: 'Ordinarios o privados (certificados simples)', d: 'Se extienden a pedido del paciente: justifican una enfermedad (con o sin baja laboral) o acreditan aptitud física o psicofísica (para una actividad laboral o de destreza, o para una actividad física deportiva). Acá el médico debe ser estricto, sin complacencias.' },
      { t: 'Oficiales o públicos (obligatorios por ley)', d: 'Se confeccionan en cumplimiento de disposiciones legales: nacimiento, defunción, etc.' },
    ],
    oficiales: [
      { t: 'Matrimonio', d: 'El médico acredita que uno de los contrayentes está en peligro de muerte y desea reconocer a sus hijos naturales (Art. 196, Código Civil, ley 23.515).' },
      { t: 'Traslado al exterior de incapaces', d: 'Los mayores declarados incapaces no pueden ser trasladados fuera del país sin autorización judicial, avalada por el certificado de al menos dos médicos que acrediten que el traslado es conveniente (Art. 483).' },
      { t: 'Nacimiento', d: 'Lo confecciona el médico o, en su defecto, la partera que vio con vida al recién nacido: fecha, lugar y hora.' },
      { t: 'Defunción', d: 'Acredita la muerte de una persona: identidad del fallecido, día, hora, lugar, causa de muerte y causas coadyuvantes. En la muerte violenta interviene la policía y la autopsia médico-legal.' },
      { t: 'Defunción fetal', d: 'Para recién nacidos sin vida: datos de la madre, lugar, fecha y hora del hecho y semanas de gestación.' },
      { t: 'Cremación', d: 'A pedido de los deudos. Solo si no cabe ninguna duda de la causa de muerte; con causa dudosa, únicamente con autorización judicial.' },
      { t: 'Internación por trastornos psíquicos / incapacidad', d: 'Certificados requeridos para internaciones psiquiátricas y para juicios de incapacidad por demencia e inhabilitación.' },
      { t: 'Prenupcial', d: 'Exigido para contraer matrimonio, a efectos de detección de enfermedades venéreas (varón: ley 12.331; mujer: ley 16.668).' },
    ],
    caracteristicas: [
      { t: 'Veraz', d: 'Reflejo fiel de lo comprobado personalmente por el médico. Si no se ajusta a la realidad hay proceso penal (Art. 295, 296 y 298 del Código Penal).' },
      { t: 'Legible', d: 'De puño y letra, con grafía clara o formato impreso; evitar abreviaturas, siglas y códigos.' },
      { t: 'Descriptivo', d: 'Consta el diagnóstico que motiva el certificado. Si no se llega a uno, descripción sindrómica (cefalea, lumbalgia, síndrome depresivo/ansioso).' },
      { t: 'Coherente', d: 'Ajustado estrictamente a lo observado en el momento; no debe contradecir certificados anteriores.' },
      { t: 'Documentado', d: 'Lo certificado queda respaldado en la historia clínica, libro de guardia o ficha de consultorio.' },
      { t: 'Formal', d: 'Papel con membrete (recetario), de puño y letra, firmado y sellado, con datos del paciente y de expedición (lugar, fecha y hora).' },
      { t: 'Limitado', d: 'Aclara la actividad para la cual el paciente es apto, para que no se use con otros fines.' },
    ],
    negativa: [
      'Si el diagnóstico enunciado puede perjudicar al paciente → Art. 68 del Código de Ética (salvo que lo requiera una autoridad judicial o sanitaria).',
      'Si puede usarse con fines ilícitos o pretende acreditar una situación falsa → Art. 123 del Código de Ética: «ciencia y conciencia».',
      'Certificados «de complacencia» ("Doc, me hacés un certificado que ayer me quedé dormido y no fui a trabajar"): NO corresponden.',
    ],
    penal: [
      { t: 'Art. 295', d: 'Prisión de 1 mes a 1 año al médico que diere por escrito un certificado falso sobre la existencia o inexistencia de una enfermedad o lesión cuando de ello resulte perjuicio. De 1 a 4 años si por ello una persona sana fuera internada.' },
      { t: 'Art. 296', d: 'Quien hiciere uso de un certificado falso o adulterado será reprimido como si fuera autor de la falsedad.' },
      { t: 'Art. 298', d: 'Pena accesoria de inhabilitación por el doble del tiempo de la condena si quien lo comete es funcionario público con abuso de sus funciones.' },
    ],
    ley: 'Ley 17.132, Art. 17: los certificados se confeccionan en recetarios o formularios con nombre y apellido del médico, matrícula, domicilio y teléfono impresos, redactados en castellano y de forma manuscrita.',
    consulta: {
      primarios: 'Detectar situaciones que pongan en riesgo la vida del paciente o de terceros y contraindicar la actividad (por ejemplo, alteraciones visuales, auditivas o motrices en quien quiere conducir).',
      secundarios: 'Aprovechar la consulta como oportunidad de control de salud y detección precoz.',
      lema: '«Ni un certificado médico es una firmita, ni una consulta es una preguntita.»',
      dato: 'El certificado es presente, no pronóstico: constata lo que sucede en el momento. Por eso siempre lleva la hora.',
    },
    herramientas: [
      { t: 'Agudeza visual (Snellen a 4 m)', d: 'Automovilista particular: apto si la suma de ambos ojos supera 11/10 sin grandes diferencias entre ellos. Transporte de pasajeros/carga: más de 16/10.' },
      { t: 'Campo visual', d: 'Campimetría por confrontación, a 50 cm del examinador, con un ojo ocluido.' },
      { t: 'Audición', d: 'Observar giros de cabeza, lectura labial o voz alta; prueba del reloj o frotar los dedos; audiometría. Autocuestionario de 10 preguntas (menos de 9 puntos descarta trastorno auditivo).' },
      { t: 'Neuro-osteomuscular', d: 'Motilidad pasiva y activa, fuerza, sensibilidad superficial y profunda, taxia estática y marcha.' },
      { t: 'Esfera psíquica', d: 'Si la tarea exige «buena salud psíquica» (por ejemplo, portar armas), derivar al psiquiatra aun sin signos evidentes.' },
      { t: 'Declaración jurada', d: 'El interrogatorio (datos positivos y negativos) debe firmarlo el paciente y terminar con «este interrogatorio tiene carácter de declaración jurada».' },
    ],
  };

  // ------------------------------------------------------------------ casos "trampa": el certificado NO corresponde
  const TRAMPAS = [
    { pedido: 'me hace un certificado por el día de ayer? Me quedé dormido y no fui a trabajar', razon: 'complacencia', txt: 'Certificado de complacencia: acredita un hecho falso (no hubo enfermedad).' },
    { pedido: 'certifique que estuve enfermo la semana pasada, aunque no consulté en ese momento', razon: 'retroactivo', txt: 'Pide certificar una enfermedad que el médico no constató.' },
    { pedido: 'ponga que estoy perfecto para el registro, pero hace meses que tengo convulsiones y no tomo la medicación', razon: 'ilicito', txt: 'Ocultaría un dato que pone en riesgo al paciente y a terceros: puede usarse con fines ilícitos.' },
  ];

  // ------------------------------------------------------------------ catálogos para los casos
  const AUTORIDADES = ['la Dirección de Bromatología de la Municipalidad de Santa Clara', 'la empresa constructora «EducArte»', 'el Hospital «Dr. I. N. Fluence»', 'el Club Atlético Ribera', 'la Dirección de Tránsito de la Municipalidad de Puerto Norte', 'la Escuela N.° 12 «Domingo F. Sarmiento»', 'la Dirección de Personal del Ministerio de Producción'];
  const DX_AUSENTISMO = [
    { dx: 'síndrome gripal inespecífico', kw: ['gripal', 'gripe'], dias: [2, 3] },
    { dx: 'cuadro gripal de tipo influenza', kw: ['influenza', 'gripal'], dias: [7] },
    { dx: 'neumonía adquirida en la comunidad', kw: ['neumonia'], dias: [10] },
    { dx: 'síndrome radicular compresivo lumbar', kw: ['radicular', 'lumbar'], dias: [3] },
    { dx: 'síndrome febril agudo', kw: ['febril'], dias: [2] },
    { dx: 'gastroenteritis aguda', kw: ['gastroenteritis'], dias: [3] },
    { dx: 'lumbalgia aguda', kw: ['lumbalgia'], dias: [3] },
    { dx: 'faringoamigdalitis aguda', kw: ['faringoamigdalitis', 'amigdalitis'], dias: [2] },
    { dx: 'esguince de tobillo', kw: ['esguince'], dias: [5] },
  ];
  const NUM_LETRAS = { 1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez', 12: 'doce', 14: 'catorce', 15: 'quince', 20: 'veinte', 21: 'veintiuno', 28: 'veintiocho', 30: 'treinta', 50: 'cincuenta', 60: 'sesenta', 100: 'cien' };
  const ROMANOS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
  const VEHICULOS = [
    { v: 'automóviles', kw: ['automovil'] }, { v: 'motocicletas', kw: ['motocicleta', 'moto '] }, { v: 'camionetas', kw: ['camioneta'] },
    { v: 'maquinarias agrícolas', kw: ['maquinaria'] }, { v: 'camiones de carga', kw: ['camion'] },
  ];
  const NO_APTO = [
    'inmovilidad del miembro inferior derecho por rehabilitación de un trauma previo',
    'agudeza visual insuficiente (suma de ambos ojos menor a 11/10) sin corrección',
    'hipoacusia bilateral moderada sin audiometría que la descarte',
  ];
  const GRUPOS = ['A', 'B', 'AB', 'O'];

  const DROGAS = [
    { dci: 'Enalapril', dosis: '10 mg', forma: 'comprimidos', unidades: 60, dx: 'Hipertensión arterial', posologia: '1 comprimido cada 12 horas, de forma continua', marcas: ['renitec', 'lotrial'] },
    { dci: 'Amoxicilina', dosis: '500 mg', forma: 'cápsulas', unidades: 30, dx: 'Faringoamigdalitis aguda bacteriana', posologia: '1 cápsula cada 8 horas durante 10 días', marcas: ['amoxidal', 'amoxil'] },
    { dci: 'Ibuprofeno', dosis: '400 mg', forma: 'comprimidos', unidades: 20, dx: 'Lumbalgia aguda', posologia: '1 comprimido cada 8 horas después de las comidas, por 5 días', marcas: ['ibupirac', 'actron'] },
    { dci: 'Metformina', dosis: '850 mg', forma: 'comprimidos', unidades: 60, dx: 'Diabetes mellitus tipo 2', posologia: '1 comprimido cada 12 horas con las comidas', marcas: ['glucophage', 'dabex'] },
    { dci: 'Levotiroxina', dosis: '100 mcg', forma: 'comprimidos', unidades: 50, dx: 'Hipotiroidismo', posologia: '1 comprimido por la mañana, en ayunas', marcas: ['euthyrox', 'levothroid'] },
    { dci: 'Nitrofurantoína', dosis: '100 mg', forma: 'cápsulas', unidades: 28, dx: 'Infección urinaria baja', posologia: '1 cápsula cada 6 horas durante 7 días', marcas: ['macrodantina'] },
    { dci: 'Omeprazol', dosis: '20 mg', forma: 'cápsulas', unidades: 28, dx: 'Enfermedad por reflujo gastroesofágico', posologia: '1 cápsula por la mañana, en ayunas', marcas: ['losec'] },
    { dci: 'Atorvastatina', dosis: '20 mg', forma: 'comprimidos', unidades: 30, dx: 'Dislipemia', posologia: '1 comprimido por la noche', marcas: ['lipitor'] },
    { dci: 'Loratadina', dosis: '10 mg', forma: 'comprimidos', unidades: 10, dx: 'Rinitis alérgica', posologia: '1 comprimido por día durante 10 días', marcas: ['clarityne'] },
    { dci: 'Salbutamol', dosis: '100 mcg', forma: 'aerosol para inhalación', unidades: 200, dx: 'Asma bronquial', posologia: '2 inhalaciones cada 6 horas si presenta síntomas', marcas: ['ventolin'] },
  ];
  const PSICO = [
    { dci: 'Clonazepam', dosis: '2 mg', forma: 'comprimidos', unidades: 60, dx: 'Trastorno de ansiedad generalizada', cie: 'F41.1', marcas: ['rivotril'] },
    { dci: 'Alprazolam', dosis: '0,5 mg', forma: 'comprimidos', unidades: 30, dx: 'Trastorno de pánico', cie: 'F41.0', marcas: ['alplax', 'xanax'] },
    { dci: 'Lorazepam', dosis: '2 mg', forma: 'comprimidos', unidades: 30, dx: 'Trastorno de ansiedad generalizada', cie: 'F41.1', marcas: ['ativan'] },
    { dci: 'Zolpidem', dosis: '10 mg', forma: 'comprimidos', unidades: 20, dx: 'Insomnio', cie: 'F51.0', marcas: ['somit', 'stilnox'] },
    { dci: 'Diazepam', dosis: '5 mg', forma: 'comprimidos', unidades: 30, dx: 'Trastorno de ansiedad', cie: 'F41.9', marcas: ['valium'] },
  ];
  const OCUPACIONES = ['abogado/a', 'docente', 'comerciante', 'empleado/a administrativo/a', 'ingeniero/a', 'contador/a', 'arquitecto/a'];

  const LAB_CASOS = [
    { motivo: 'astenia, poliuria y polidipsia', dxp: 'diabetes mellitus', items: ['Glucemia en ayunas', 'Hemoglobina glicosilada', 'Creatininemia', 'Hemograma completo'], req: ['glucemia', 'hemoglobina glicosilada|hba1c'] },
    { motivo: 'cansancio, palidez y caída del cabello', dxp: 'anemia ferropénica', items: ['Hemograma completo', 'Ferremia', 'Ferritinemia', 'Reticulocitos'], req: ['hemograma', 'ferremia|ferritinemia'] },
    { motivo: 'control de riesgo cardiovascular', dxp: 'dislipemia', items: ['Colesterolemia total', 'Colesterol HDL', 'Colesterol LDL', 'Trigliceridemia', 'Glucemia en ayunas'], req: ['colesterolemia|colesterol', 'trigliceridemia|trigliceridos'] },
    { motivo: 'edemas en miembros inferiores y disminución del ritmo urinario', dxp: 'insuficiencia renal', items: ['Uremia', 'Creatininemia', 'Ionograma plasmático', 'Orina completa'], req: ['uremia', 'creatininemia'] },
    { motivo: 'aumento de peso, somnolencia y constipación', dxp: 'hipotiroidismo', items: ['TSH', 'T4 libre', 'Colesterolemia total'], req: ['tsh', 't4'] },
  ];
  const GENERICOS_PROHIBIDOS = ['perfil lipidico', 'perfil renal', 'perfil hepatico', 'perfil tiroideo', 'rutina', 'laboratorio completo'];


  // ------------------------------------------------------------------ casos compartibles (link para que un compañero practique el MISMO caso)
  // El link NO confía en los datos que trae: cada pieza se reconstruye desde el catálogo interno y se valida.
  const REPOSO_DX = [{ dx: 'faringoamigdalitis aguda', kw: ['faringoamigdalitis', 'amigdalitis'], h: 48 }, { dx: 'gastroenteritis aguda', kw: ['gastroenteritis'], h: 72 }, { dx: 'síndrome gripal', kw: ['gripal'], h: 48 }];
  const TXT = /^[\p{L}\d .,'\-\/°()]{1,90}$/u;
  const num = (x, a, b) => { const n = Number(x); return Number.isInteger(n) && n >= a && n <= b ? n : null; };

  function compactar(c) {
    const p = c.p;
    const k = {};
    if (c.d && (c.tipo === 'receta' || c.tipo === 'psicofarmacos')) k.dci = c.d.dci;
    if (c.tipo === 'examenes') k.m = c.c.motivo;
    if (c.tipo === 'ausentismo') { k.dx = c.d.dx; k.dias = c.dias; k.aut = c.aut || null; }
    if (c.tipo === 'reposo') k.dx = c.d.dx;
    if (c.tipo === 'conducir') { k.g = c.g; k.rh = c.rh ? 1 : 0; k.veh = c.veh.map((x) => x.v); k.apto = c.apto ? 1 : 0; k.mot = c.motivo || null; }
    if (c.tipo === 'alimentos') k.aut = c.aut || null;
    if (c.trampa) k.tr = TRAMPAS.findIndex((t) => t.razon === c.trampa.razon);
    return { v: 1, t: c.tipo, p: { s: p.sexo, e: p.edad, a: p.apellido, n: p.nombre, d: p.dni, o: p.obraSocial, f: p.afiliado, r: p.direccion, h: p.hc }, k, x: String(c.texto || '').slice(0, 600) };
  }

  // Devuelve un caso válido o null si el link fue alterado o no corresponde
  function reconstruir(s) {
    try {
      if (!s || s.v !== 1 || !DOCS[s.t]) return null;
      const q = s.p || {}, k = s.k || {};
      const sexo = q.s === 'F' || q.s === 'M' ? q.s : null;
      const edad = num(q.e, 0, 110), dni = num(q.d, 1000000, 99999999), hc = num(q.h, 1, 9999999);
      if (!sexo || edad == null || dni == null || hc == null) return null;
      if (![q.a, q.n, q.r].every((x) => typeof x === 'string' && TXT.test(x))) return null;
      if (q.o != null && !OBRAS_SOCIALES.includes(q.o)) return null;
      if (q.o != null && !(typeof q.f === 'string' && /^[\d\-\/]{3,30}$/.test(q.f))) return null;
      const p = { sexo, edad, apellido: q.a, nombre: q.n, dni, dniTxt: fmtDni(dni), obraSocial: q.o || null, afiliado: q.o ? q.f : null, direccion: q.r, hc };
      p.nombreCompleto = `${p.apellido}, ${p.nombre}`;
      const c = { tipo: s.t, p, texto: typeof s.x === 'string' ? s.x.slice(0, 600) : '' };
      const por = (arr, campo, v) => arr.find((x) => x[campo] === v);
      if (s.t === 'receta') { c.d = por(DROGAS, 'dci', k.dci); if (!c.d) return null; }
      else if (s.t === 'psicofarmacos') { c.d = por(PSICO, 'dci', k.dci); if (!c.d) return null; c.ocup = OCUPACIONES[0]; }
      else if (s.t === 'examenes') { c.c = por(LAB_CASOS, 'motivo', k.m); if (!c.c) return null; }
      else if (s.t === 'ausentismo') { c.d = por(DX_AUSENTISMO, 'dx', k.dx); if (!c.d || !c.d.dias.includes(k.dias)) return null; c.dias = k.dias; c.aut = AUTORIDADES.includes(k.aut) ? k.aut : null; }
      else if (s.t === 'reposo') { c.d = por(REPOSO_DX, 'dx', k.dx); if (!c.d) return null; }
      else if (s.t === 'conducir') {
        if (!GRUPOS.includes(k.g) || !Array.isArray(k.veh)) return null;
        c.g = k.g; c.rh = !!k.rh; c.veh = k.veh.map((v) => por(VEHICULOS, 'v', v)).filter(Boolean); if (!c.veh.length) return null;
        c.apto = !!k.apto; c.motivo = c.apto ? null : (NO_APTO.includes(k.mot) ? k.mot : NO_APTO[0]);
      } else if (s.t === 'alimentos') c.aut = AUTORIDADES.includes(k.aut) ? k.aut : AUTORIDADES[0];
      if (k.tr != null && k.tr >= 0 && TRAMPAS[k.tr]) c.trampa = TRAMPAS[k.tr];
      return c;
    } catch (_) { return null; }
  }
  const aBase64Url = (obj) => { const b = btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const deBase64Url = (t) => { try { const b = String(t).replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(decodeURIComponent(escape(atob(b + '='.repeat((4 - b.length % 4) % 4))))); } catch (_) { return null; } };

  // ------------------------------------------------------------------ definición de documentos
  const DOCS = {
    receta: {
      id: 'receta', cat: 'Recetas', icono: '💊', titulo: 'Receta médica', resumen: 'Prescripción con nombre genérico, dosis, forma, cantidades y pautas.',
      layout: 'receta', hojas: [{ id: 'r1', titulo: 'Receta', encabezado: true }],
      reglas: [REGLA_TINTA, 'Prescribir por NOMBRE GENÉRICO (denominación común internacional), no por marca comercial (ley 25.649).', 'Sin abreviaturas confusas, errores ni enmiendas.'],
      pasos: [
        'Escribir arriba y al centro el apellido y nombre del paciente (tal cual figura en el DNI).',
        'Debajo: si tiene obra social, su nombre y el N.° de afiliado; si no tiene, el N.° de DNI.',
        'Debajo, sobre el margen izquierdo, escribir el diagnóstico (opcional pero recomendado) y la palabra R/p (Rp).',
        'Prescribir el medicamento por su nombre genérico.',
        'Indicar la dosis por unidad (mcg / mg / g).',
        'Indicar la forma de presentación (comprimidos, cápsulas, gotas, jarabe, etc.).',
        'Cantidad de unidades por envase y cantidad de envases en números romanos y en letras (ej.: I (uno)).',
        'Escribir la posología (cuánto, cada cuánto y por cuánto tiempo).',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 20, edadMax: 75 }); const d = azar(DROGAS);
        return { tipo: 'receta', p, d, texto: `${p.sexo === 'F' ? 'La paciente' : 'El paciente'} ${p.nombreCompleto} (${p.edad} años, DNI ${p.dniTxt}${p.obraSocial ? `, obra social ${p.obraSocial}, afiliado N.° ${p.afiliado}` : ', sin obra social'}) consulta por ${d.dx.toLowerCase()}. Indicá ${d.dci} ${d.dosis}, ${d.forma}: ${d.posologia}. Se prescribe 1 envase de ${d.unidades} ${d.forma === 'aerosol para inhalación' ? 'dosis' : 'unidades'}.` };
      },
    },

    psicofarmacos: {
      id: 'psicofarmacos', cat: 'Recetas', icono: '🧠', titulo: 'Receta de psicofármacos (original + archivo)', resumen: 'Dos recetas: original con obra social y duplicado de archivo con DNI, edad y dirección.',
      layout: 'receta', hojas: [{ id: 'r1', titulo: 'Receta 1 · Original', encabezado: true }, { id: 'r2', titulo: 'Receta 2 · Archivo (duplicado)', encabezado: true }],
      reglas: [REGLA_TINTA, 'Se hacen DOS recetas: la original (1) y la de archivo/duplicado (2).', 'Sin abreviaturas, sin errores y sin enmiendas.', 'Nombre genérico, cantidad de envases en números romanos y en letras.'],
      pasos: [
        'RECETA 1 — Arriba: apellido y nombre del paciente. Debajo: si tiene obra social, nombre de la OS y N.° de afiliado; si no, DNI.',
        'RECETA 1 — Margen izquierdo: diagnóstico (explícito o código CIE-10/DSM), medicamento por nombre genérico, dosis por unidad, forma de presentación, cantidad de unidades y de envases (romanos y letras).',
        'RECETA 1 — Firma y sello debajo, sin dejar espacios; fecha sobre el margen izquierdo.',
        'RECETA 2 (archivo) — Arriba y al centro: apellido y nombre; debajo los datos personales: N.° de DNI, edad y dirección (aunque tenga obra social).',
        'RECETA 2 — Margen izquierdo: diagnóstico, medicamento genérico, dosis, forma, unidades y envases (romanos y letras).',
        'RECETA 2 — Firma y sello (sin dejar espacios en blanco) y fecha.',
      ],
      caso() {
        const p = paciente({ edadMin: 30, edadMax: 60, conOS: true }); const d = azar(PSICO);
        return { tipo: 'psicofarmacos', p, d, ocup: azar(OCUPACIONES), texto: `${p.nombreCompleto}, ${p.edad} años, DNI ${p.dniTxt}, vive en ${p.direccion}. Obra social ${p.obraSocial} (afiliado N.° ${p.afiliado}). Se encuentra bajo tratamiento por ${d.dx.toLowerCase()} (CIE-10 ${d.cie}). Prescribí ${d.dci} ${d.dosis}: ${d.forma} x ${d.unidades}, 1 envase.` };
      },
    },

    examenes: {
      id: 'examenes', cat: 'Solicitudes', icono: '🧪', titulo: 'Solicitud de exámenes complementarios', resumen: 'Un pedido por recetario, con «Solicito», motivo o diagnóstico presuntivo.',
      layout: 'solicitud', hojas: [{ id: 'r1', titulo: 'Solicitud', encabezado: true }],
      reglas: [REGLA_TINTA, 'Un solo pedido por recetario (laboratorio en uno, electrocardiograma en otro, Rx en otro).', REGLA_ERRORES],
      pasos: [
        'Encabezado en la región central-superior: apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Debajo: si NO tiene obra social, el N.° de DNI; si tiene, el nombre de la obra social y, debajo, el N.° de afiliado (centrado).',
        'Sobre el margen izquierdo, la palabra «Solicito» (sin abreviaturas).',
        'Desarrollar la solicitud. Un solo pedido: puede ir desde el centro. Varios: desde el margen izquierdo, uno debajo del otro. Concentraciones séricas con el sufijo «-emia» (glucemia, uremia…). NO usar terminología genérica (perfil lipídico, perfil renal…).',
        'Desde el margen izquierdo: «Motivo», «Diagnóstico presuntivo» o «Diagnóstico» (síntomas/signos; síndrome o patología presunta; patología específica).',
        'Firmar inmediatamente debajo o en el margen inferior derecho sin espacios en blanco (tachar el espacio libre).',
        'Sello debajo de la firma (apellido y nombre aclaratorio) y, debajo, la matrícula (simbólica de 2 dígitos).',
        'Fecha en el margen inferior izquierdo y, debajo, la hora.',
      ],
      caso() {
        const p = paciente({ edadMin: 20, edadMax: 75 }); const c = azar(LAB_CASOS);
        return { tipo: 'examenes', p, c, texto: `${p.sexo === 'F' ? 'La paciente' : 'El paciente'} ${p.nombreCompleto} (${p.edad} años, ${p.obraSocial ? `${p.obraSocial}, afiliado ${p.afiliado}` : `sin obra social, DNI ${p.dniTxt}`}) consulta por ${c.motivo}. Sospecha: ${c.dxp}. Solicitá los estudios de LABORATORIO que correspondan.` };
      },
    },

    ausentismo: {
      id: 'ausentismo', cat: 'Certificados por enfermedad', icono: '🏢', titulo: 'Certificado de ausentismo laboral', resumen: 'Constancia de reposo laboral: diagnóstico, días y ante quién se presenta.', trampa: true,
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, 'Descriptivo: constar el diagnóstico (o descripción sindrómica). Presente, no pronóstico.'],
      pasos: [
        'Comenzar (margen izquierdo) con «Dejo constancia que…» o «Certifico que…».',
        'Apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Tipo y número de documento.',
        'Escribir que «debe ausentarse de su lugar de trabajo» a partir de la fecha y por N días (en número y en letras).',
        'Consignar el motivo: el diagnóstico o síndrome que presenta.',
        'Consignar ante quién se presenta o «Para ser presentado ante quien corresponda».',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 20, edadMax: 60, conOS: false }); const d = azar(DX_AUSENTISMO); const dias = azar(d.dias);
        const aut = Math.random() < 0.35 ? null : azar(AUTORIDADES);
        const tr = Math.random() < 0.15 ? azar(TRAMPAS) : null;
        return { tipo: 'ausentismo', p, d, dias, aut, trampa: tr, texto: tr ? `${p.nombreCompleto}, DNI ${p.dniTxt}, le dice: «Doc, ¿${tr.pedido}?». No hay hallazgos ni constatación alguna de enfermedad.` : `${p.nombreCompleto}, DNI ${p.dniTxt}, presenta ${d.dx}. Indicás reposo laboral por ${dias} días desde hoy.${aut ? ` Debe presentarlo ante ${aut}.` : ''}` };
      },
    },

    reposo: {
      id: 'reposo', cat: 'Certificados por enfermedad', icono: '🤒', titulo: 'Certificado por enfermedad aguda (reposo)', resumen: 'Modelo del artículo de Evidencia: edad, sexo, DNI, HC, cuadro y horas de reposo.', trampa: true,
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, 'Datos formales: nombre, DNI, edad, sexo e historia clínica. Fecha y hora de expedición.'],
      pasos: [
        'Comenzar con «Certifico que…» o «Dejo constancia que…» (o «La señorita/El señor…»).',
        'Apellido y nombre, edad, sexo y DNI del paciente.',
        'Número de historia clínica y que «consta en mi poder».',
        'Diagnóstico: «se encuentra cursando una…». Descriptivo, sin extenderse en consideraciones científicas.',
        'Indicación: «Se indica N horas/días de reposo».',
        'Ante quién se presenta (o «Para ser presentado ante quien corresponda»).',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 12, edadMax: 40, conOS: false }); const d = azar(REPOSO_DX);
        const tr = Math.random() < 0.15 ? azar(TRAMPAS) : null;
        return { tipo: 'reposo', p, d, trampa: tr, texto: tr ? `${p.nombreCompleto}, DNI ${p.dniTxt}, le pide: «¿${tr.pedido}?». No hay constatación de enfermedad.` : `${p.nombreCompleto}, ${p.edad} años, DNI ${p.dniTxt}, HC N.° ${p.hc}. Cursa una ${d.dx}. Indicás ${d.h} horas de reposo. Para presentar en la institución educativa o laboral.` };
      },
    },

    conducir: {
      id: 'conducir', cat: 'Certificados de aptitud', icono: '🚗', titulo: 'Certificado para conducir vehículos automotores', resumen: 'Aptitud psicofísica para conducir: grupo sanguíneo y tipo de vehículo.',
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, 'Limitado: aclarar el tipo de vehículo para el que se otorga (o se niega) la aptitud. Lleva hora y fecha: es presente, no pronóstico.'],
      pasos: [
        'Comenzar con «Certifico que…» o «Dejo constancia que…».',
        'Apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Tipo y número de documento.',
        'Grupo sanguíneo y factor Rh, en letras/símbolos y con su aclaración (ej.: «A», Rh (-) (negativo)).',
        'Constatar la aptitud para conducir «al momento de la consulta».',
        'Tipo de vehículo automotor para el cual se otorga la aptitud.',
        'Autoridad ante quien se presenta, o «Para ser presentado ante quien corresponda».',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 18, edadMax: 70, conOS: false }); const g = azar(GRUPOS); const rh = Math.random() < 0.7;
        const nveh = entre(1, 2); const veh = []; while (veh.length < nveh) { const x = azar(VEHICULOS); if (!veh.includes(x)) veh.push(x); }
        const apto = Math.random() < 0.75; const motivo = apto ? null : azar(NO_APTO);
        return { tipo: 'conducir', p, g, rh, veh, apto, motivo, texto: `${p.nombreCompleto}, DNI ${p.dniTxt}, grupo sanguíneo ${g}, factor Rh ${rh ? 'positivo (+)' : 'negativo (-)'}. Solicita el certificado para conducir ${veh.map((x) => x.v).join(' y ')}. ${apto ? 'Al examen de salud no presenta alteraciones: está APTO.' : `Al examen presenta ${motivo}: NO está apto.`}` };
      },
    },

    buena_salud: {
      id: 'buena_salud', cat: 'Certificados de aptitud', icono: '✅', titulo: 'Certificado de buena salud', resumen: 'Constatación de buena salud al momento de la consulta.', trampa: true,
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, '«…al momento del examen no hay evidencias clínicas de alteraciones…»: fórmula de la negativa para no afirmar más de lo constatado.'],
      pasos: [
        'Comenzar con «Certifico que…» o «Dejo constancia que…».',
        'Apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Tipo y número de documento.',
        'Constatación de salud del evaluado «al momento de la consulta».',
        'Acreditación de «buena salud» que se otorga al evaluado.',
        'Ante quién se presenta o «Para ser presentado ante quien corresponda».',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 18, edadMax: 65, conOS: false }); const tr = Math.random() < 0.15 ? TRAMPAS[2] : null;
        return { tipo: 'buena_salud', p, trampa: tr, texto: tr ? `${p.nombreCompleto}, DNI ${p.dniTxt}, te pide: «Doc, ${tr.pedido}».` : `${p.nombreCompleto}, DNI ${p.dniTxt}, se realizó un examen de salud completo: sin hallazgos patológicos. Necesita un certificado de buena salud.` };
      },
    },

    recreativa: {
      id: 'recreativa', cat: 'Certificados de aptitud', icono: '🏃', titulo: 'Aptitud para actividad física recreativa', resumen: 'Aptitud para actividad física recreativa no competitiva.', trampa: true,
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, 'Limitado: especificar «actividad física recreativa no competitiva».'],
      pasos: [
        'Comenzar con «Certifico que…» o «Dejo constancia que…».',
        'Apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Tipo y número de documento.',
        'Constatación de aptitud «al momento de la consulta».',
        'Acreditación de «aptitud» especificando «actividad física recreativa no competitiva».',
        'Ante quién se presenta o «Para ser presentado ante quien corresponda».',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 15, edadMax: 60, conOS: false }); const tr = Math.random() < 0.12 ? TRAMPAS[2] : null;
        return { tipo: 'recreativa', p, trampa: tr, texto: tr ? `${p.nombreCompleto}, DNI ${p.dniTxt}, quiere anotarse en el gimnasio y te dice: «${tr.pedido}».` : `${p.nombreCompleto}, DNI ${p.dniTxt}, se anota en un gimnasio. El examen de salud es normal: está apto para actividad recreativa.` };
      },
    },

    competitiva: {
      id: 'competitiva', cat: 'Certificados de aptitud', icono: '🏅', titulo: 'Aptitud para actividad física competitiva', resumen: 'Aptitud para deporte de alto rendimiento.', trampa: true,
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, 'Limitado: especificar «deporte de alto rendimiento».'],
      pasos: [
        'Comenzar con «Certifico que…» o «Dejo constancia que…».',
        'Apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Tipo y número de documento.',
        'Constatación de aptitud «al momento de la consulta».',
        'Acreditación de «aptitud» especificando «deporte de alto rendimiento».',
        'Ante quién se presenta o «Para ser presentado ante quien corresponda».',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 14, edadMax: 38, conOS: false }); const tr = Math.random() < 0.12 ? TRAMPAS[2] : null;
        return { tipo: 'competitiva', p, trampa: tr, texto: tr ? `${p.nombreCompleto}, DNI ${p.dniTxt}, atleta federado, te pide: «${tr.pedido}».` : `${p.nombreCompleto}, DNI ${p.dniTxt}, atleta federado. La evaluación precompetitiva no muestra alteraciones: está apto para deporte de alto rendimiento.` };
      },
    },

    alimentos: {
      id: 'alimentos', cat: 'Certificados de aptitud', icono: '🍽️', titulo: 'Aptitud para manipular alimentos', resumen: 'Certificado para presentar ante bromatología.', trampa: true,
      layout: 'certificado', hojas: [{ id: 'c1', titulo: 'Certificado' }],
      reglas: [REGLA_TINTA, REGLA_ERRORES, 'Limitado: aclarar «manipular alimentos» y ante quién se presenta.'],
      pasos: [
        'Comenzar con «Certifico que…» o «Dejo constancia que…».',
        'Apellido/s y nombre/s (en ese orden) tal como figura en el DNI.',
        'Escribir el DNI del evaluado.',
        'Constatación de aptitud «al momento de la consulta».',
        'Acreditación de «aptitud» especificando que corresponde para «manipular alimentos».',
        'Autoridad ante quien se presenta o «Para ser presentado ante quien corresponda».',
        ...P_FIRMA_SELLO,
      ],
      caso() {
        const p = paciente({ edadMin: 18, edadMax: 60, conOS: false }); const aut = azar(AUTORIDADES.slice(0, 1).concat(['la Dirección de Bromatología de la Municipalidad de Villa Ribera'])); const tr = Math.random() < 0.12 ? TRAMPAS[1] : null;
        return { tipo: 'alimentos', p, aut, trampa: tr, texto: tr ? `${p.nombreCompleto}, DNI ${p.dniTxt}, te pide: «${tr.pedido}».` : `${p.nombreCompleto}, DNI ${p.dniTxt}, trabajará en una panadería. Examen de salud normal: está apto. Se presenta ante ${aut}.` };
      },
    },
  };

  const ORDEN = ['receta', 'psicofarmacos', 'examenes', 'ausentismo', 'reposo', 'conducir', 'buena_salud', 'recreativa', 'competitiva', 'alimentos'];

  return { DOCS, ORDEN, TEORIA, TRAMPAS, NUM_LETRAS, ROMANOS, GENERICOS_PROHIBIDOS, azar, entre, paciente, compactar, reconstruir, aBase64Url, deBase64Url };
})();
if (typeof window !== 'undefined') window.RECETARIOS = RECETARIOS;
if (typeof module !== 'undefined' && module.exports) module.exports = { RECETARIOS };
