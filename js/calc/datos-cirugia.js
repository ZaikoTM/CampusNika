// Calculadoras de Cirugía, Trauma y Emergencias quirúrgicas.
(function () {
  const { N, C, S, num } = NikaCalcs;
  NikaCalcs.agregar([
    { id: 'ranson', area: 'cirugia', ico: '🥞', nombre: 'Criterios de Ranson (pancreatitis aguda)', alias: 'pancreatitis gravedad',
      desc: 'Pronóstico de la pancreatitis aguda: 5 criterios al ingreso y 6 a las 48 horas.', maximo: 11,
      intro: 'Elegí la etiología: los umbrales son distintos para la pancreatitis no biliar y la biliar (litiásica).',
      campos: [S('et', 'Etiología', [['No biliar (alcohol u otras)', 'nb'], ['Biliar (litiásica)', 'b']], { val: true }),
        C('edad', 'Edad: > 55 años (no biliar) / > 70 años (biliar)', 1), C('gb', 'Leucocitos: > 16.000/mm³ (no biliar) / > 18.000 (biliar)', 1), C('glu', 'Glucemia: > 200 mg/dl (no biliar) / > 220 (biliar)', 1),
        C('ldh', 'LDH: > 350 UI/L (no biliar) / > 400 (biliar)', 1), C('ast', 'AST: > 250 UI/L (ambas)', 1),
        C('hto', 'A las 48 h: caída del hematocrito > 10 puntos', 1), C('bun', 'A las 48 h: aumento de urea (BUN) > 5 mg/dl (no biliar) / > 2 (biliar)', 1), C('ca', 'A las 48 h: calcio < 8 mg/dl', 1),
        C('po2', 'A las 48 h: PaO₂ < 60 mmHg (solo no biliar)', 1), C('bd', 'A las 48 h: déficit de base > 4 mEq/L (no biliar) / > 5 (biliar)', 1), C('liq', 'A las 48 h: secuestro de líquidos > 6 L (no biliar) / > 4 L (biliar)', 1)],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Gravedad baja', texto: 'Mortalidad estimada ≈ 1 a 3 %.' }, { max: 4, nivel: 'warn', titulo: 'Riesgo intermedio', texto: 'Mortalidad estimada ≈ 15 %.' }, { max: 6, nivel: 'bad', titulo: 'Pancreatitis grave', texto: 'Mortalidad estimada ≈ 40 %: considerar cuidados intensivos.' }, { max: 11, nivel: 'bad', titulo: 'Muy grave', texto: 'Mortalidad estimada mayor del 50 %.' }],
      fuente: 'Ranson JH et al. Surg Gynecol Obstet 1974;139:69 (no biliar) y Ranson JH, Am J Gastroenterol 1982 (biliar). Clasificación de Atlanta revisada 2012; Guía de pancreatitis aguda (2019).', nota: 'Los porcentajes son aproximados y provienen de series históricas; hoy se complementa con la clasificación de Atlanta y el BISAP.' },

    { id: 'bisap', area: 'cirugia', ico: '📋', nombre: 'BISAP (pancreatitis aguda)', alias: 'pancreatitis mortalidad',
      desc: 'Predice mortalidad intrahospitalaria en las primeras 24 horas.', maximo: 5,
      campos: [C('bun', 'Urea (BUN) > 25 mg/dl', 1), C('ment', 'Alteración del estado mental', 1), C('sirs', 'SIRS (2 o más criterios)', 1), C('edad', 'Edad > 60 años', 1), C('der', 'Derrame pleural', 1)],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Riesgo bajo', texto: 'Mortalidad < 2 %.' }, { max: 5, nivel: 'bad', titulo: 'Riesgo alto', texto: 'Con 3 o más puntos aumenta de forma marcada el riesgo de falla orgánica y mortalidad (≈ 5 a 20 %).' }],
      fuente: 'Wu BU et al. Gut 2008;57:1698. Clasificación de Atlanta revisada (Banks PA, Gut 2013).' },

    { id: 'alvarado', area: 'cirugia', ico: '🔎', nombre: 'Escala de Alvarado (apendicitis)', alias: 'mantrels apendicitis aguda',
      desc: 'Probabilidad de apendicitis aguda en el dolor de fosa ilíaca derecha.', maximo: 10,
      campos: [C('mig', 'Migración del dolor a fosa ilíaca derecha', 1), C('ano', 'Anorexia', 1), C('nv', 'Náuseas o vómitos', 1), C('sens', 'Dolor a la palpación en fosa ilíaca derecha', 2), C('reb', 'Signo de rebote', 1), C('fie', 'Fiebre ≥ 37,3 °C', 1), C('leu', 'Leucocitosis > 10.000/mm³', 2), C('neu', 'Neutrofilia > 75 %', 1)],
      rangos: [{ max: 4, nivel: 'ok', titulo: 'Apendicitis improbable', texto: 'Observación y reevaluación; imágenes si persiste la duda.' }, { max: 6, nivel: 'warn', titulo: 'Apendicitis posible', texto: 'Solicitar ecografía o tomografía según edad y sexo.' }, { max: 8, nivel: 'bad', titulo: 'Apendicitis probable', texto: 'Alta sospecha: evaluación quirúrgica.' }, { max: 10, nivel: 'bad', titulo: 'Apendicitis muy probable', texto: 'Indicación de apendicectomía tras valoración quirúrgica.' }],
      fuente: 'Alvarado A. Ann Emerg Med 1986;15:557. World Society of Emergency Surgery (WSES), Jerusalem Guidelines 2020.', nota: 'Rinde menos en mujeres en edad fértil y en niños: complementar con imágenes.' },

    { id: 'glasgow-blatchford', area: 'cirugia', ico: '🩸', nombre: 'Glasgow-Blatchford (hemorragia digestiva alta)', alias: 'hda sangrado digestivo alta riesgo',
      desc: 'Identifica pacientes de bajo riesgo que pueden manejarse ambulatoriamente.',
      campos: [N('bun', 'Urea (BUN)', 'mg/dl', { min: 0, max: 300 }), S('sx', 'Sexo', [['Varón', 'M'], ['Mujer', 'F']], { val: true }), N('hb', 'Hemoglobina', 'g/dl', { min: 3, max: 20 }), N('pas', 'Presión sistólica', 'mmHg', { min: 40, max: 250 }),
        C('fc', 'Frecuencia cardíaca ≥ 100 lpm', 1), C('mel', 'Melena', 1), C('sin', 'Síncope', 2), C('hep', 'Enfermedad hepática', 2), C('ic', 'Insuficiencia cardíaca', 2)],
      calc: (v) => { let p = 0; const d = [];
        const b = v.bun; const pb = b >= 70 ? 6 : b >= 28 ? 4 : b >= 22.4 ? 3 : b >= 18.2 ? 2 : 0; if (pb) { p += pb; d.push(['Urea (BUN) ' + b + ' mg/dl', pb]); }
        const h = v.hb, m = v.sx === 'M'; const ph = m ? (h < 10 ? 6 : h < 12 ? 3 : h < 13 ? 1 : 0) : (h < 10 ? 6 : h < 12 ? 1 : 0); if (ph) { p += ph; d.push(['Hemoglobina ' + h + ' g/dl', ph]); }
        const ps = v.pas < 90 ? 3 : v.pas < 100 ? 2 : v.pas < 110 ? 1 : 0; if (ps) { p += ps; d.push(['Presión sistólica ' + v.pas + ' mmHg', ps]); }
        [['fc', 'FC ≥ 100 lpm', 1], ['mel', 'Melena', 1], ['sin', 'Síncope', 2], ['hep', 'Enfermedad hepática', 2], ['ic', 'Insuficiencia cardíaca', 2]].forEach((x) => { if (v[x[0]]) { p += x[2]; d.push([x[1], x[2]]); } });
        return { principal: { label: 'Puntaje', valor: p, unidad: ' / 23', dec: 0 }, nivel: p <= 1 ? 'ok' : p < 7 ? 'warn' : 'bad', titulo: p === 0 ? 'Riesgo muy bajo: alta ambulatoria posible' : p === 1 ? 'Riesgo bajo: alta ambulatoria posible' : 'Riesgo: requiere internación y endoscopia',
          texto: p <= 1 ? 'Con 0 a 1 punto se puede evitar la internación y diferir la endoscopia.' : 'Con 2 o más puntos se recomienda internación y endoscopia digestiva alta en las primeras 24 horas.', detalle: d }; },
      fuente: 'Blatchford O et al. Lancet 2000;356:1318. Guías ESGE 2021 y Consenso Internacional de HDA no varicosa (Barkun, Ann Intern Med 2019).', nota: 'Urea (BUN): si tenés urea en mg/dl, dividí por 2,14 para obtener BUN.' },

    { id: 'rockall', area: 'cirugia', ico: '🔬', nombre: 'Score de Rockall completo', alias: 'hda mortalidad resangrado endoscopia',
      desc: 'Riesgo de resangrado y mortalidad tras la endoscopia en la hemorragia digestiva alta.', maximo: 11,
      campos: [S('edad', 'Edad', [['Menos de 60 años', 0], ['60 a 79 años', 1], ['80 años o más', 2]]), S('shock', 'Shock', [['Sin shock (PAS ≥ 100, FC < 100)', 0], ['Taquicardia (FC ≥ 100, PAS ≥ 100)', 1], ['Hipotensión (PAS < 100)', 2]]),
        S('com', 'Comorbilidad', [['Ninguna', 0], ['Insuficiencia cardíaca, cardiopatía isquémica u otra mayor', 2], ['Insuficiencia renal, hepática o cáncer diseminado', 3]]),
        S('dx', 'Diagnóstico endoscópico', [['Mallory-Weiss o sin lesión', 0], ['Úlcera, erosiones u otros diagnósticos', 1], ['Neoplasia digestiva alta', 2]]),
        S('est', 'Estigmas de sangrado reciente', [['Ninguno o mancha plana', 0], ['Sangre, coágulo adherido o vaso visible / sangrado activo', 2]])],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Riesgo bajo', texto: 'Con ≤ 2 puntos el riesgo de resangrado y mortalidad es bajo: considerar alta temprana.' }, { max: 4, nivel: 'warn', titulo: 'Riesgo intermedio', texto: 'Internación y vigilancia.' }, { max: 11, nivel: 'bad', titulo: 'Riesgo alto', texto: 'Mayor riesgo de resangrado y mortalidad: vigilancia estrecha y considerar cuidados intensivos.' }],
      fuente: 'Rockall TA et al. Gut 1996;38:316.' },

    { id: 'rcri', area: 'cirugia', ico: '❤️', nombre: 'Índice de riesgo cardíaco revisado (RCRI de Lee)', alias: 'riesgo preoperatorio cirugia no cardiaca',
      desc: 'Riesgo de complicaciones cardíacas mayores en cirugía no cardíaca.', maximo: 6,
      campos: [C('cir', 'Cirugía de alto riesgo (intraperitoneal, intratorácica o vascular suprainguinal)', 1), C('cardiopatia', 'Cardiopatía isquémica', 1), C('ic', 'Insuficiencia cardíaca', 1), C('acv', 'Antecedente de ACV o AIT', 1), C('ins', 'Diabetes en tratamiento con insulina', 1), C('cr', 'Creatinina > 2 mg/dl', 1)],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'Riesgo bajo', texto: 'Riesgo estimado de evento cardíaco mayor ≈ 4 % (CCS 2017; 0,4 % en el estudio original).' }, { max: 1, nivel: 'warn', titulo: 'Riesgo intermedio', texto: 'Riesgo estimado ≈ 6 % (CCS 2017; 0,9 % en el original).' }, { max: 2, nivel: 'bad', titulo: 'Riesgo elevado', texto: 'Riesgo estimado ≈ 10 % (CCS 2017; 6,6 % en el original).' }, { max: 6, nivel: 'bad', titulo: 'Riesgo alto', texto: 'Riesgo estimado ≥ 15 % (CCS 2017; 11 % en el original): evaluación cardiológica y optimización.' }],
      fuente: 'Lee TH et al. Circulation 1999;100:1043. Canadian Cardiovascular Society 2017 (Duceppe E, Can J Cardiol 2017); Sociedad Argentina de Cardiología, Consenso de evaluación perioperatoria.' },

    { id: 'apfel', area: 'cirugia', ico: '🤢', nombre: 'Score de Apfel (náuseas y vómitos posoperatorios)', alias: 'nvpo anestesia',
      desc: 'Riesgo de náuseas y vómitos posoperatorios para decidir la profilaxis.', maximo: 4,
      campos: [C('mujer', 'Sexo femenino', 1), C('nofum', 'No fumador', 1), C('hx', 'Antecedente de náuseas posoperatorias o mareo por movimiento', 1), C('op', 'Uso previsto de opioides posoperatorios', 1)],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'Riesgo ≈ 10 %', texto: 'Sin profilaxis sistemática.' }, { max: 1, nivel: 'info', titulo: 'Riesgo ≈ 20 %', texto: 'Considerar 1 medida profiláctica.' }, { max: 2, nivel: 'warn', titulo: 'Riesgo ≈ 40 %', texto: 'Profilaxis con 2 fármacos o medidas.' }, { max: 3, nivel: 'bad', titulo: 'Riesgo ≈ 60 %', texto: 'Profilaxis combinada (2 o 3 medidas).' }, { max: 4, nivel: 'bad', titulo: 'Riesgo ≈ 80 %', texto: 'Profilaxis combinada y anestesia que reduzca el riesgo (p. ej. propofol).' }],
      fuente: 'Apfel CC et al. Anesthesiology 1999;91:693. Consensus Guidelines for the Management of PONV, Gan TJ, Anesth Analg 2020.' },

    { id: 'padua', area: 'cirugia', ico: '🦵', nombre: 'Score de Padua (riesgo de TEV en pacientes clínicos)', alias: 'tromboembolismo venoso profilaxis internacion',
      desc: 'Decide si un paciente clínico internado necesita profilaxis antitrombótica.', maximo: 20,
      campos: [C('can', 'Cáncer activo', 3), C('prev', 'Tromboembolismo venoso previo', 3), C('mov', 'Movilidad reducida (≥ 3 días)', 3), C('trom', 'Trombofilia conocida', 3), C('trau', 'Trauma o cirugía reciente (≤ 1 mes)', 2), C('edad', 'Edad ≥ 70 años', 1), C('ic', 'Insuficiencia cardíaca o respiratoria', 1), C('iam', 'IAM o ACV isquémico', 1), C('inf', 'Infección aguda o enfermedad reumatológica', 1), C('ob', 'Obesidad (IMC ≥ 30)', 1), C('hor', 'Tratamiento hormonal en curso', 1)],
      rangos: [{ max: 3, nivel: 'ok', titulo: 'Riesgo bajo', texto: 'Sin profilaxis farmacológica sistemática; movilización y reevaluar.' }, { max: 20, nivel: 'bad', titulo: 'Riesgo alto (≥ 4)', texto: 'Indicar profilaxis antitrombótica si no hay contraindicación (riesgo de TEV ≈ 11 % sin profilaxis).' }],
      fuente: 'Barbar S et al. J Thromb Haemost 2010;8:2450. ACCP (CHEST) 2012 Antithrombotic Therapy and Prevention of Thrombosis.' },

    { id: 'parkland', area: 'cirugia', ico: '🔥', nombre: 'Reposición de líquidos en el gran quemado (Parkland)', alias: 'quemaduras superficie corporal ringer',
      desc: 'Volumen de Ringer lactato en las primeras 24 horas del adulto quemado.',
      campos: [N('peso', 'Peso', 'kg', { min: 20, max: 250 }), N('scq', 'Superficie corporal quemada (2.º y 3.er grado)', '%', { min: 1, max: 100 })],
      calc: (v) => { const t = 4 * v.peso * v.scq;
        return { principal: { label: 'Volumen en 24 horas', valor: t, unidad: ' mL', dec: 0 }, nivel: v.scq >= 20 ? 'bad' : 'warn', titulo: 'Ringer lactato: 4 mL × kg × %SCQ',
          extra: [['Primeras 8 horas (la mitad)', num(t / 2, 0) + ' mL (≈ ' + num(t / 2 / 8, 0) + ' mL/h)'], ['Siguientes 16 horas (la otra mitad)', num(t / 2, 0) + ' mL (≈ ' + num(t / 2 / 16, 0) + ' mL/h)']],
          texto: 'El tiempo se cuenta desde el momento de la quemadura. Ajustar para una diuresis de 0,5 mL/kg/h en adultos (30 a 50 mL/h).' }; },
      fuente: 'Fórmula de Parkland (Baxter, 1968). Advanced Trauma Life Support (ATLS) 10.ª ed. y American Burn Association; Asociación Argentina de Quemaduras.', nota: 'Los grados superficiales (1.er grado) no se cuentan. Reposición inicial orientativa: titular según la diuresis.' },

    { id: 'regla-nueves', area: 'cirugia', ico: '🧍', nombre: 'Superficie corporal quemada (regla de los 9 de Wallace)', alias: 'quemadura adulto scq',
      desc: 'Suma el porcentaje de superficie quemada en el adulto.',
      campos: [S('cab', 'Cabeza y cuello', [['Ninguna', 0], ['Mitad (4,5 %)', 4.5], ['Completa (9 %)', 9]], { val: true }), S('tant', 'Tronco anterior', [['Ninguna', 0], ['Mitad (9 %)', 9], ['Completo (18 %)', 18]], { val: true }), S('tpost', 'Tronco posterior', [['Ninguna', 0], ['Mitad (9 %)', 9], ['Completo (18 %)', 18]], { val: true }),
        S('bd', 'Miembro superior derecho', [['Ninguno', 0], ['Mitad (4,5 %)', 4.5], ['Completo (9 %)', 9]], { val: true }), S('bi', 'Miembro superior izquierdo', [['Ninguno', 0], ['Mitad (4,5 %)', 4.5], ['Completo (9 %)', 9]], { val: true }),
        S('pd', 'Miembro inferior derecho', [['Ninguno', 0], ['Mitad (9 %)', 9], ['Completo (18 %)', 18]], { val: true }), S('pi', 'Miembro inferior izquierdo', [['Ninguno', 0], ['Mitad (9 %)', 9], ['Completo (18 %)', 18]], { val: true }), S('per', 'Genitales y periné', [['No', 0], ['Sí (1 %)', 1]], { val: true })],
      calc: (v) => { const t = ['cab', 'tant', 'tpost', 'bd', 'bi', 'pd', 'pi', 'per'].reduce((a, k) => a + (Number(v[k]) || 0), 0);
        return { principal: { label: 'Superficie quemada', valor: t, unidad: ' %' }, nivel: t >= 20 ? 'bad' : t >= 10 ? 'warn' : 'info', titulo: t >= 20 ? 'Gran quemado: derivar a centro especializado' : t >= 10 ? 'Quemadura de gravedad moderada' : 'Quemadura de menor extensión', texto: 'Con ≥ 20 % en el adulto se indica reposición con la fórmula de Parkland.' }; },
      fuente: 'Wallace AB, Lancet 1951. ATLS 10.ª ed. Para niños se usa la tabla de Lund-Browder, que corrige la proporción de la cabeza y las piernas.' },

    { id: 'rts', area: 'cirugia', ico: '🚑', nombre: 'Trauma Score Revisado (RTS)', alias: 'trauma triage glasgow',
      desc: 'Triage fisiológico del paciente traumatizado.',
      campos: [N('gcs', 'Escala de Glasgow', 'puntos', { min: 3, max: 15 }), N('pas', 'Presión sistólica', 'mmHg', { min: 0, max: 260 }), N('fr', 'Frecuencia respiratoria', 'rpm', { min: 0, max: 80 })],
      calc: (v) => { const g = v.gcs >= 13 ? 4 : v.gcs >= 9 ? 3 : v.gcs >= 6 ? 2 : v.gcs >= 4 ? 1 : 0; const p = v.pas > 89 ? 4 : v.pas >= 76 ? 3 : v.pas >= 50 ? 2 : v.pas >= 1 ? 1 : 0; const r = v.fr >= 10 && v.fr <= 29 ? 4 : v.fr > 29 ? 3 : v.fr >= 6 ? 2 : v.fr >= 1 ? 1 : 0;
        const rts = 0.9368 * g + 0.7326 * p + 0.2908 * r; const triage = g + p + r;
        return { principal: { label: 'RTS ponderado', valor: rts, dec: 2, unidad: ' / 7,84' }, nivel: triage < 11 ? 'bad' : 'ok', titulo: triage < 11 ? 'Trauma grave: derivar a centro de trauma' : 'Trauma leve a moderado', texto: 'RTS de triage (sin ponderar): ' + triage + ' / 12. Con menos de 11 se recomienda trasladar a un centro de trauma.',
          extra: [['Codificación', 'Glasgow ' + g + ' · PAS ' + p + ' · FR ' + r]] }; },
      fuente: 'Champion HR et al. J Trauma 1989;29:623. ATLS 10.ª ed. (American College of Surgeons).' },

    { id: 'glasgow', area: 'cirugia', ico: '🧠', nombre: 'Escala de coma de Glasgow', alias: 'gcs conciencia traumatismo craneoencefalico',
      desc: 'Nivel de conciencia (ocular, verbal y motora).', maximo: 15,
      campos: [S('oc', 'Apertura ocular', [['Espontánea', 4], ['Al estímulo verbal', 3], ['Al dolor', 2], ['Ninguna', 1]]), S('ver', 'Respuesta verbal', [['Orientada', 5], ['Confusa', 4], ['Palabras inapropiadas', 3], ['Sonidos incomprensibles', 2], ['Ninguna', 1]]),
        S('mot', 'Respuesta motora', [['Obedece órdenes', 6], ['Localiza el dolor', 5], ['Retira al dolor', 4], ['Flexión anormal (decorticación)', 3], ['Extensión (descerebración)', 2], ['Ninguna', 1]])],
      rangos: [{ max: 8, nivel: 'bad', titulo: 'Traumatismo grave (GCS ≤ 8)', texto: 'Indicación de asegurar la vía aérea (intubación) y derivar a neurocirugía.' }, { max: 12, nivel: 'warn', titulo: 'Moderado (9 a 12)', texto: 'Tomografía de cráneo y observación estricta.' }, { max: 15, nivel: 'ok', titulo: 'Leve (13 a 15)', texto: 'Evaluar la necesidad de imágenes según criterios de alto riesgo.' }],
      fuente: 'Teasdale G, Jennett B. Lancet 1974;2:81. ATLS 10.ª ed.' },
  ]);
})();
