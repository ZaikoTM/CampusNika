// Calculadoras de Emergencias, Clínica médica, Cardiología, Neurología y Gastro.
(function () {
  const { N, C, S, num } = NikaCalcs;
  NikaCalcs.agregar([
    { id: 'qsofa', area: 'emergencias', ico: '🦠', nombre: 'qSOFA (sepsis, cabecera del paciente)', alias: 'sepsis 3 sofa rapido',
      desc: 'Detecta fuera de terapia a pacientes con sospecha de infección y mayor riesgo de mala evolución.', maximo: 3,
      campos: [C('fr', 'Frecuencia respiratoria ≥ 22 rpm', 1), C('ment', 'Alteración del estado mental (Glasgow < 15)', 1), C('pas', 'Presión sistólica ≤ 100 mmHg', 1)],
      rangos: [{ max: 1, nivel: 'info', titulo: 'qSOFA negativo (0 a 1)', texto: 'No descarta sepsis: si hay sospecha clínica, buscar disfunción orgánica (SOFA) y reevaluar.' }, { max: 3, nivel: 'bad', titulo: 'qSOFA positivo (≥ 2)', texto: 'Mayor riesgo de mortalidad: evaluar disfunción orgánica con SOFA, tomar cultivos y lactato e iniciar el paquete de sepsis.' }],
      fuente: 'Singer M et al. JAMA 2016;315:801 (Sepsis-3). Surviving Sepsis Campaign 2021 (no recomienda qSOFA como único tamizaje). Sociedad Argentina de Terapia Intensiva (SATI).', nota: 'La Surviving Sepsis Campaign 2021 sugiere no usar qSOFA aislado como herramienta de tamizaje; complementar con NEWS2 o SIRS.' },

    { id: 'sirs', area: 'emergencias', ico: '🌡️', nombre: 'Criterios de SIRS', alias: 'respuesta inflamatoria sistemica',
      desc: 'Síndrome de respuesta inflamatoria sistémica (2 o más criterios).', maximo: 4,
      campos: [C('t', 'Temperatura > 38 °C o < 36 °C', 1), C('fc', 'Frecuencia cardíaca > 90 lpm', 1), C('fr', 'Frecuencia respiratoria > 20 rpm o PaCO₂ < 32 mmHg', 1), C('gb', 'Leucocitos > 12.000 o < 4.000/mm³, o > 10 % de cayados', 1)],
      rangos: [{ max: 1, nivel: 'ok', titulo: 'No cumple SIRS', texto: 'Menos de 2 criterios.' }, { max: 4, nivel: 'warn', titulo: 'SIRS presente (≥ 2)', texto: 'Con foco infeccioso sospechado o confirmado se considera sepsis (definición clásica). Buscar el foco y evaluar disfunción orgánica.' }],
      fuente: 'Bone RC et al. Chest 1992;101:1644 (ACCP/SCCM). Definiciones actualizadas en Sepsis-3 (2016).' },

    { id: 'news2', area: 'emergencias', ico: '📈', nombre: 'NEWS2 (alerta temprana de deterioro)', alias: 'national early warning score signos vitales',
      desc: 'Puntaje de signos vitales que guía la frecuencia de monitoreo y la escalada.', maximo: 20,
      campos: [N('fr', 'Frecuencia respiratoria', 'rpm', { min: 0, max: 80 }), N('sat', 'Saturación de O₂', '%', { min: 50, max: 100 }), S('o2', 'Oxígeno suplementario', [['Aire ambiente', 0], ['Con oxígeno', 2]], { val: true }), N('pas', 'Presión sistólica', 'mmHg', { min: 30, max: 300 }),
        N('fc', 'Frecuencia cardíaca', 'lpm', { min: 10, max: 250 }), S('con', 'Conciencia', [['Alerta', 0], ['Confusión nueva, respuesta a voz, dolor o sin respuesta (CVPU)', 3]], { val: true }), N('t', 'Temperatura', '°C', { min: 28, max: 44 })],
      calc: (v, h) => { const p = []; const f = v.fr, sat = v.sat, pas = v.pas, fc = v.fc, t = v.t;
        const a = f <= 8 ? 3 : f <= 11 ? 1 : f <= 20 ? 0 : f <= 24 ? 2 : 3; const b = sat <= 91 ? 3 : sat <= 93 ? 2 : sat <= 95 ? 1 : 0;
        const c = pas <= 90 ? 3 : pas <= 100 ? 2 : pas <= 110 ? 1 : pas <= 219 ? 0 : 3; const d = fc <= 40 ? 3 : fc <= 50 ? 1 : fc <= 90 ? 0 : fc <= 110 ? 1 : fc <= 130 ? 2 : 3;
        const e = t <= 35 ? 3 : t <= 36 ? 1 : t <= 38 ? 0 : t <= 39 ? 1 : 2; const o2 = Number(v.o2) || 0, con = Number(v.con) || 0;
        const tot = a + b + c + d + e + o2 + con; const unico = Math.max(a, b, c, d, e, con) === 3;
        p.push(['Frecuencia respiratoria', a], ['Saturación', b], ['Oxígeno suplementario', o2], ['Presión sistólica', c], ['Frecuencia cardíaca', d], ['Conciencia', con], ['Temperatura', e]);
        const n = tot >= 7 ? 'bad' : tot >= 5 ? 'warn' : unico ? 'warn' : 'ok';
        return { principal: { label: 'NEWS2', valor: tot, unidad: ' / 20', dec: 0 }, nivel: n,
          titulo: tot >= 7 ? 'Riesgo clínico alto' : tot >= 5 ? 'Riesgo clínico medio' : unico ? 'Riesgo bajo con un parámetro en 3 puntos' : 'Riesgo clínico bajo',
          texto: tot >= 7 ? 'Respuesta de emergencia: evaluación inmediata por el equipo de respuesta rápida y considerar traslado a cuidados críticos; monitoreo continuo.' : tot >= 5 ? 'Revisión urgente por un médico con competencias en enfermedad aguda; control al menos cada hora.' : unico ? 'Un parámetro con 3 puntos: revisión urgente por el médico.' : tot >= 1 ? 'Controles cada 4 a 6 horas.' : 'Controles cada 12 horas.', detalle: p }; },
      fuente: 'Royal College of Physicians. National Early Warning Score (NEWS) 2, 2017. Escala 1 de saturación (sin hipercapnia).', nota: 'Para pacientes con insuficiencia respiratoria hipercápnica se usa la escala 2 de saturación (objetivo 88 a 92 %), no incluida aquí.' },

    { id: 'curb65', area: 'emergencias', ico: '🫁', nombre: 'CURB-65 (neumonía adquirida en la comunidad)', alias: 'neumonia gravedad internacion',
      desc: 'Decide el sitio de atención de la neumonía comunitaria.', maximo: 5,
      campos: [C('c', 'Confusión (desorientación nueva)', 1), C('u', 'Urea (BUN) > 19 mg/dl (urea > 43 mg/dl)', 1), C('r', 'Frecuencia respiratoria ≥ 30 rpm', 1), C('b', 'Presión sistólica < 90 o diastólica ≤ 60 mmHg', 1), C('e', 'Edad ≥ 65 años', 1)],
      rangos: [{ max: 1, nivel: 'ok', titulo: 'Riesgo bajo (0 a 1)', texto: 'Mortalidad a 30 días ≈ 1,5 %: tratamiento ambulatorio, si el contexto social lo permite.' }, { max: 2, nivel: 'warn', titulo: 'Riesgo intermedio (2)', texto: 'Mortalidad ≈ 9 %: considerar internación breve o seguimiento hospitalario.' }, { max: 5, nivel: 'bad', titulo: 'Riesgo alto (≥ 3)', texto: 'Mortalidad ≈ 15 a 40 %: internar; con 4 a 5 puntos considerar cuidados intensivos.' }],
      fuente: 'Lim WS et al. Thorax 2003;58:377. Consenso de neumonía adquirida en la comunidad de la Sociedad Argentina de Infectología (SADI) y ATS/IDSA 2019.' },

    { id: 'wells-tvp', area: 'clinica', ico: '🦵', nombre: 'Wells para trombosis venosa profunda', alias: 'tvp miembros inferiores',
      desc: 'Probabilidad pretest de TVP de miembros inferiores.', maximo: 9,
      campos: [C('c1', 'Cáncer activo (tratamiento en los últimos 6 meses o paliativo)', 1), C('c2', 'Parálisis, paresia o inmovilización reciente con yeso', 1), C('c3', 'Encamamiento ≥ 3 días o cirugía mayor en las últimas 12 semanas', 1), C('c4', 'Dolor localizado en el trayecto del sistema venoso profundo', 1),
        C('c5', 'Toda la pierna edematosa', 1), C('c6', 'Pantorrilla > 3 cm más gruesa que la contralateral', 1), C('c7', 'Edema con fóvea en la pierna sintomática', 1), C('c8', 'Venas superficiales colaterales (no varicosas)', 1), C('c9', 'TVP previa documentada', 1), C('c10', 'Diagnóstico alternativo igual o más probable que TVP', -2)],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'Probabilidad baja (≤ 0)', texto: 'TVP ≈ 5 %: solicitar dímero D; si es negativo se descarta.' }, { max: 2, nivel: 'warn', titulo: 'Probabilidad moderada (1 a 2)', texto: 'TVP ≈ 17 %: dímero D de alta sensibilidad o ecografía Doppler según disponibilidad.' }, { max: 9, nivel: 'bad', titulo: 'Probabilidad alta (≥ 3)', texto: 'TVP ≈ 53 %: ecografía Doppler de compresión sin esperar el dímero D; considerar anticoagular si hay demora.' }],
      fuente: 'Wells PS et al. Lancet 1997;350:1795 (versión de 2003, N Engl J Med 349:1227). Guías ASH 2018 y ESC 2019 de tromboembolismo.' },

    { id: 'wells-tep', area: 'clinica', ico: '🫁', nombre: 'Wells para tromboembolismo de pulmón', alias: 'tep embolia pulmonar',
      desc: 'Probabilidad clínica de embolia pulmonar.', maximo: 12.5,
      campos: [C('c1', 'Signos clínicos de TVP', 3), C('c2', 'TEP es el diagnóstico más probable (o igual de probable)', 3), C('c3', 'Frecuencia cardíaca > 100 lpm', 1.5), C('c4', 'Inmovilización o cirugía en las últimas 4 semanas', 1.5), C('c5', 'TEP o TVP previos', 1.5), C('c6', 'Hemoptisis', 1), C('c7', 'Cáncer activo', 1)],
      rangos: [{ max: 1.5, nivel: 'ok', titulo: 'Probabilidad baja (< 2)', texto: 'TEP ≈ 1 a 2 %: aplicar PERC; si es negativo se descarta, si no, dímero D.' }, { max: 6, nivel: 'warn', titulo: 'Probabilidad moderada (2 a 6)', texto: 'TEP ≈ 16 %: dímero D ajustado por edad y, si es positivo, angiotomografía.' }, { max: 12.5, nivel: 'bad', titulo: 'Probabilidad alta (> 6)', texto: 'TEP ≈ 40 %: angiotomografía de tórax directa; considerar anticoagulación empírica mientras se confirma.' }],
      fuente: 'Wells PS et al. Thromb Haemost 2000;83:416. ESC 2019 Guidelines on Acute Pulmonary Embolism. En la versión de dos niveles, ≤ 4 es «TEP improbable» y > 4 «TEP probable».' },

    { id: 'perc', area: 'clinica', ico: '✅', nombre: 'Regla PERC (descartar TEP)', alias: 'tep baja probabilidad',
      desc: 'Si la probabilidad es baja y no hay ningún criterio, se descarta TEP sin estudios.', maximo: 8,
      campos: [C('a', 'Edad ≥ 50 años', 1), C('b', 'Frecuencia cardíaca ≥ 100 lpm', 1), C('c', 'Saturación de O₂ < 95 %', 1), C('d', 'Edema unilateral de la pierna', 1), C('e', 'Hemoptisis', 1), C('f', 'Cirugía o trauma reciente (≤ 4 semanas)', 1), C('g', 'TEP o TVP previos', 1), C('h', 'Uso de estrógenos', 1)],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'PERC negativo', texto: 'Con baja probabilidad clínica (Wells < 2 o gestalt), el riesgo es < 2 %: TEP descartado sin dímero D ni imágenes.' }, { max: 8, nivel: 'warn', titulo: 'PERC positivo', texto: 'No permite descartar TEP: seguir con el algoritmo (dímero D o imágenes).' }],
      fuente: 'Kline JA et al. J Thromb Haemost 2004;2:1247 y 2008;6:772. Válida solo si la probabilidad pretest es baja.' },

    { id: 'cha2ds2-vasc', area: 'cardio', ico: '❤️', nombre: 'CHA₂DS₂-VASc (fibrilación auricular)', alias: 'anticoagulacion acv fibrilacion',
      desc: 'Riesgo de ACV en la fibrilación auricular no valvular y necesidad de anticoagular.', maximo: 9,
      campos: [C('ic', 'Insuficiencia cardíaca o disfunción ventricular', 1), C('hta', 'Hipertensión arterial', 1), C('e75', 'Edad ≥ 75 años', 2), C('dm', 'Diabetes mellitus', 1), C('acv', 'ACV, AIT o tromboembolismo previo', 2), C('vasc', 'Enfermedad vascular (IAM previo, enfermedad arterial periférica, placa aórtica)', 1), C('e65', 'Edad 65 a 74 años', 1), C('f', 'Sexo femenino', 1)],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'Riesgo bajo', texto: 'Varones con 0 puntos (o mujeres con 1 solo por sexo): no se recomienda anticoagulación.' }, { max: 1, nivel: 'warn', titulo: 'Riesgo intermedio', texto: 'Con 1 punto en varones considerar anticoagulación oral (riesgo anual de ACV ≈ 1,3 %).' }, { max: 9, nivel: 'bad', titulo: 'Riesgo alto', texto: 'Se recomienda anticoagulación oral con ≥ 2 puntos en varones o ≥ 3 en mujeres; en mujeres con 2 (uno es el sexo) considerarla. Salvo contraindicación.' }],
      fuente: 'Lip GYH et al. Chest 2010;137:263. Guías ESC 2020 de fibrilación auricular y Sociedad Argentina de Cardiología, Consenso de fibrilación auricular. Las guías ESC 2024 proponen el CHA₂DS₂-VA (sin el sexo).' },

    { id: 'has-bled', area: 'cardio', ico: '🩸', nombre: 'HAS-BLED (riesgo de sangrado)', alias: 'anticoagulacion hemorragia',
      desc: 'Riesgo de sangrado mayor con anticoagulación: identifica factores corregibles.', maximo: 9,
      campos: [C('h', 'Hipertensión no controlada (PAS > 160 mmHg)', 1), C('r', 'Función renal alterada (diálisis, trasplante o creatinina > 2,26 mg/dl)', 1), C('l', 'Función hepática alterada (cirrosis o bilirrubina > 2 veces y transaminasas > 3 veces)', 1), C('s', 'ACV previo', 1), C('b', 'Antecedente de sangrado o predisposición (anemia, trombocitopenia)', 1), C('i', 'INR lábil (< 60 % del tiempo en rango)', 1), C('e', 'Edad > 65 años', 1), C('d', 'Fármacos (antiagregantes, AINE)', 1), C('a', 'Alcohol (≥ 8 tragos por semana)', 1)],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Riesgo bajo a moderado', texto: 'Riesgo anual de sangrado mayor ≈ 1 a 3,7 %.' }, { max: 9, nivel: 'bad', titulo: 'Riesgo alto (≥ 3)', texto: 'No contraindica la anticoagulación: obliga a corregir los factores modificables (presión, AINE, alcohol) y a un seguimiento más estrecho.' }],
      fuente: 'Pisters R et al. Chest 2010;138:1093. Guías ESC 2020 de fibrilación auricular.' },

    { id: 'heart', area: 'cardio', ico: '💓', nombre: 'Score HEART (dolor torácico)', alias: 'sindrome coronario agudo guardia troponina',
      desc: 'Riesgo de eventos cardíacos mayores a 6 semanas en el dolor torácico de guardia.', maximo: 10,
      campos: [S('h', 'Historia clínica', [['Poco sospechosa', 0], ['Moderadamente sospechosa', 1], ['Muy sospechosa', 2]]), S('e', 'ECG', [['Normal', 0], ['Alteraciones inespecíficas de la repolarización', 1], ['Desviación significativa del ST', 2]]),
        S('a', 'Edad', [['Menos de 45 años', 0], ['45 a 64 años', 1], ['65 años o más', 2]]), S('r', 'Factores de riesgo', [['Ninguno', 0], ['1 o 2 (HTA, DM, tabaquismo, dislipemia, obesidad, antecedentes familiares)', 1], ['3 o más, o enfermedad aterosclerótica conocida', 2]]),
        S('t', 'Troponina', [['Normal', 0], ['1 a 3 veces el límite superior', 1], ['Más de 3 veces el límite superior', 2]])],
      rangos: [{ max: 3, nivel: 'ok', titulo: 'Riesgo bajo (0 a 3)', texto: 'Eventos cardíacos mayores ≈ 1,7 %: considerar alta temprana con seguimiento.' }, { max: 6, nivel: 'warn', titulo: 'Riesgo intermedio (4 a 6)', texto: 'Eventos ≈ 12 a 17 %: observación, nuevas troponinas y estudios no invasivos.' }, { max: 10, nivel: 'bad', titulo: 'Riesgo alto (7 a 10)', texto: 'Eventos ≈ 50 a 65 %: internación y evaluación invasiva temprana.' }],
      fuente: 'Six AJ et al. Neth Heart J 2008;16:191; Backus BE et al. Int J Cardiol 2013;168:2153. Guías ESC 2023 de síndrome coronario agudo.' },

    { id: 'abcd2', area: 'cardio', ico: '🧠', nombre: 'ABCD² (AIT: riesgo de ACV a 2 días)', alias: 'accidente isquemico transitorio',
      desc: 'Riesgo de ACV después de un ataque isquémico transitorio.', maximo: 7,
      campos: [C('a', 'Edad ≥ 60 años', 1), C('b', 'Presión arterial ≥ 140/90 mmHg al ingreso', 1), S('c', 'Características clínicas', [['Otras', 0], ['Trastorno del habla sin debilidad', 1], ['Debilidad unilateral', 2]]), S('d', 'Duración de los síntomas', [['Menos de 10 minutos', 0], ['10 a 59 minutos', 1], ['60 minutos o más', 2]]), C('dm', 'Diabetes', 1)],
      rangos: [{ max: 3, nivel: 'ok', titulo: 'Riesgo bajo (0 a 3)', texto: 'ACV a 2 días ≈ 1 %.' }, { max: 5, nivel: 'warn', titulo: 'Riesgo moderado (4 a 5)', texto: 'ACV a 2 días ≈ 4 %: evaluación urgente.' }, { max: 7, nivel: 'bad', titulo: 'Riesgo alto (6 a 7)', texto: 'ACV a 2 días ≈ 8 %: internación y estudio inmediato.' }],
      fuente: 'Johnston SC et al. Lancet 2007;369:283. Guías AHA/ASA 2021 de prevención de ACV (recomiendan evaluación urgente de todo AIT).', nota: 'Hoy se recomienda estudiar de forma urgente a todo AIT, sea cual sea el puntaje.' },

    { id: 'child-pugh', area: 'gastro', ico: '🍂', nombre: 'Clasificación de Child-Pugh', alias: 'cirrosis hepatica pronostico',
      desc: 'Gravedad y pronóstico de la cirrosis hepática.', maximo: 15,
      campos: [S('b', 'Bilirrubina total', [['< 2 mg/dl', 1], ['2 a 3 mg/dl', 2], ['> 3 mg/dl', 3]]), S('a', 'Albúmina', [['> 3,5 g/dl', 1], ['2,8 a 3,5 g/dl', 2], ['< 2,8 g/dl', 3]]), S('i', 'INR', [['< 1,7', 1], ['1,7 a 2,3', 2], ['> 2,3', 3]]),
        S('as', 'Ascitis', [['Ausente', 1], ['Leve o controlada con diuréticos', 2], ['Moderada a grave o refractaria', 3]]), S('e', 'Encefalopatía hepática', [['Ausente', 1], ['Grado 1 a 2 (controlada)', 2], ['Grado 3 a 4 (refractaria)', 3]])],
      rangos: [{ max: 6, nivel: 'ok', titulo: 'Child-Pugh A (5 a 6)', texto: 'Cirrosis compensada: sobrevida a 1 año ≈ 100 % y a 2 años ≈ 85 %.' }, { max: 9, nivel: 'warn', titulo: 'Child-Pugh B (7 a 9)', texto: 'Compromiso funcional significativo: sobrevida a 1 año ≈ 80 % y a 2 años ≈ 60 %.' }, { max: 15, nivel: 'bad', titulo: 'Child-Pugh C (10 a 15)', texto: 'Descompensada: sobrevida a 1 año ≈ 45 % y a 2 años ≈ 35 %; evaluar trasplante.' }],
      fuente: 'Pugh RNH et al. Br J Surg 1973;60:646. AASLD 2021 y Asociación Argentina para el Estudio de las Enfermedades del Hígado (AAEEH).' },

    { id: 'meld', area: 'gastro', ico: '🧬', nombre: 'MELD y MELD-Na', alias: 'trasplante hepatico cirrosis lista de espera',
      desc: 'Gravedad de la hepatopatía terminal y prioridad en lista de trasplante.',
      campos: [N('bili', 'Bilirrubina total', 'mg/dl', { min: 0.1, max: 60 }), N('inr', 'INR', '', { min: 0.5, max: 10 }), N('cr', 'Creatinina', 'mg/dl', { min: 0.1, max: 15 }), N('na', 'Sodio', 'mEq/L', { min: 100, max: 160, opcional: true }), C('dial', 'Diálisis dos o más veces en la última semana', 0)],
      calc: (v) => { const b = Math.max(1, v.bili), i = Math.max(1, v.inr); let c = Math.max(1, v.cr); if (v.dial || c > 4) c = 4;
        const meld = Math.round(3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43); const m = Math.max(6, Math.min(40, meld));
        let ex = []; if (Number.isFinite(v.na)) { const na = Math.max(125, Math.min(137, v.na)); const mn = Math.round(m + 1.32 * (137 - na) - (0.033 * m * (137 - na))); ex.push(['MELD-Na', Math.max(6, Math.min(40, mn)) + ' puntos']); }
        return { principal: { label: 'MELD', valor: m, dec: 0, unidad: ' puntos' }, nivel: m >= 30 ? 'bad' : m >= 20 ? 'warn' : m >= 10 ? 'info' : 'ok',
          titulo: m >= 40 ? 'Mortalidad a 3 meses ≈ 71 %' : m >= 30 ? 'Mortalidad a 3 meses ≈ 52 %' : m >= 20 ? 'Mortalidad a 3 meses ≈ 20 %' : m >= 10 ? 'Mortalidad a 3 meses ≈ 6 %' : 'Mortalidad a 3 meses ≈ 2 %', extra: ex,
          texto: 'MELD = 3,78·ln(bilirrubina) + 11,2·ln(INR) + 9,57·ln(creatinina) + 6,43. En Argentina la asignación de órganos es fijada por el INCUCAI.' }; },
      fuente: 'Kamath PS et al. Hepatology 2001;33:464 (MELD). Kim WR et al. N Engl J Med 2008;359:1018 (MELD-Na). INCUCAI / SINTRA (sistema de asignación de hígado).', nota: 'Mortalidad a 3 meses por rangos de MELD según Wiesner (Gastroenterology 2003).' },

    { id: 'fib4', area: 'gastro', ico: '🔍', nombre: 'Índice FIB-4 (fibrosis hepática)', alias: 'higado graso nafld masld fibrosis',
      desc: 'Descarta fibrosis avanzada en hígado graso y hepatopatías crónicas sin biopsia.',
      campos: [N('edad', 'Edad', 'años', { min: 18, max: 100 }), N('ast', 'AST', 'UI/L', { min: 1, max: 2000 }), N('alt', 'ALT', 'UI/L', { min: 1, max: 2000 }), N('plq', 'Plaquetas', '× 10⁹/L (miles/mm³)', { min: 10, max: 1000 })],
      calc: (v) => { const f = (v.edad * v.ast) / (v.plq * Math.sqrt(v.alt)); const baja = v.edad >= 65 ? 2.0 : 1.3;
        const n = f < baja ? 'ok' : f > 2.67 ? 'bad' : 'warn';
        return { principal: { label: 'FIB-4', valor: f, dec: 2, unidad: '' }, nivel: n, titulo: f < baja ? 'Fibrosis avanzada poco probable' : f > 2.67 ? 'Fibrosis avanzada probable' : 'Zona indeterminada',
          texto: f < baja ? 'Valor predictivo negativo alto: seguimiento en atención primaria y control de factores de riesgo.' : f > 2.67 ? 'Derivar a hepatología y confirmar con elastografía.' : 'Confirmar con elastografía (FibroScan) u otro estudio no invasivo.',
          extra: [['Punto de corte inferior usado', num(baja, 1) + (v.edad >= 65 ? ' (≥ 65 años)' : '')]] }; },
      fuente: 'Sterling RK et al. Hepatology 2006;43:1317. AASLD 2023 (guía de MASLD) y EASL 2021. Para ≥ 65 años: McPherson S, Am J Gastroenterol 2017.' },
  ]);
})();
