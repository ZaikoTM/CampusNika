// Calculadoras y escalas adicionales (v2): ácido-base, terapia, pediatría, enfermería y más escalas de riesgo.
(function () {
  const { N, C, S, Sx, num } = NikaCalcs;
  NikaCalcs.agregar([
    { id: 'geneva', area: 'clinica', ico: '🫁', nombre: 'Score de Ginebra revisado (TEP)', alias: 'embolia pulmonar geneva',
      desc: 'Probabilidad clínica de tromboembolismo de pulmón sin depender del juicio subjetivo.', maximo: 22,
      campos: [C('e', 'Edad > 65 años', 1), C('p', 'TEP o TVP previos', 3), C('c', 'Cirugía o fractura en el último mes', 2), C('ca', 'Cáncer activo', 2), C('d', 'Dolor unilateral en miembro inferior', 3), C('h', 'Hemoptisis', 2), S('fc', 'Frecuencia cardíaca', [['Menos de 75 lpm', 0], ['75 a 94 lpm', 3], ['95 lpm o más', 5]]), C('pal', 'Dolor a la palpación profunda de la pierna y edema unilateral', 4)],
      rangos: [{ max: 3, nivel: 'ok', titulo: 'Probabilidad baja (0 a 3)', texto: 'TEP ≈ 8 %: dímero D.' }, { max: 10, nivel: 'warn', titulo: 'Probabilidad intermedia (4 a 10)', texto: 'TEP ≈ 28 %: dímero D y, si es positivo, angiotomografía.' }, { max: 22, nivel: 'bad', titulo: 'Probabilidad alta (≥ 11)', texto: 'TEP ≈ 74 %: angiotomografía de tórax directa.' }],
      fuente: 'Le Gal G et al. Ann Intern Med 2006;144:165. ESC 2019 Guidelines on Acute Pulmonary Embolism (versión simplificada disponible).' },

    { id: 'mcisaac', area: 'clinica', ico: '🗣️', nombre: 'Centor modificado (McIsaac): faringitis', alias: 'faringoamigdalitis estreptococo grupo a',
      desc: 'Probabilidad de faringitis estreptocócica y necesidad de test rápido o antibiótico.', maximo: 5,
      campos: [C('f', 'Fiebre > 38 °C', 1), C('t', 'Ausencia de tos', 1), C('a', 'Adenopatías cervicales anteriores dolorosas', 1), C('e', 'Exudado o hipertrofia amigdalina', 1), S('ed', 'Edad', [['3 a 14 años', 1], ['15 a 44 años', 0], ['45 años o más', -1]])],
      rangos: [{ max: 1, nivel: 'ok', titulo: 'Probabilidad baja (≤ 1)', texto: 'Estreptococo ≈ 5 a 10 %: sin estudio ni antibiótico.' }, { max: 3, nivel: 'warn', titulo: 'Probabilidad intermedia (2 a 3)', texto: 'Estreptococo ≈ 15 a 35 %: test rápido o cultivo; tratar si es positivo.' }, { max: 5, nivel: 'bad', titulo: 'Probabilidad alta (≥ 4)', texto: 'Estreptococo ≈ 50 %: test rápido y tratamiento según resultado o criterio clínico.' }],
      fuente: 'Centor RM et al. Med Decis Making 1981;1:239; McIsaac WJ et al. CMAJ 1998;158:75. IDSA 2012.' },

    { id: 'glasgow-imrie', area: 'cirugia', ico: '🧫', nombre: 'Criterios de Glasgow-Imrie (pancreatitis)', alias: 'pancreatitis gravedad modificada',
      desc: 'Gravedad de la pancreatitis aguda a las 48 horas (3 o más criterios indican gravedad).', maximo: 8,
      campos: [C('po2', 'PaO₂ < 60 mmHg', 1), C('edad', 'Edad > 55 años', 1), C('gb', 'Leucocitos > 15.000/mm³', 1), C('ca', 'Calcio < 8 mg/dl', 1), C('bun', 'Urea (BUN) > 45 mg/dl', 1), C('ldh', 'LDH > 600 UI/L', 1), C('alb', 'Albúmina < 3,2 g/dl', 1), C('glu', 'Glucemia > 180 mg/dl', 1)],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Menos de 3 criterios', texto: 'Pancreatitis probablemente leve.' }, { max: 8, nivel: 'bad', titulo: '3 o más criterios', texto: 'Pancreatitis grave probable: monitoreo estrecho y valorar cuidados intensivos.' }],
      fuente: 'Imrie CW et al. Br J Surg 1978;65:337 (modificación de Glasgow). Guías de la British Society of Gastroenterology.' },

    { id: 'timi-nste', area: 'cardio', ico: '❤️', nombre: 'Score TIMI (angina inestable / IAM sin elevación del ST)', alias: 'sindrome coronario agudo riesgo',
      desc: 'Riesgo de muerte, infarto o isquemia grave que requiere revascularización a 14 días.', maximo: 7,
      campos: [C('e', 'Edad ≥ 65 años', 1), C('r', '3 o más factores de riesgo coronario', 1), C('c', 'Estenosis coronaria conocida ≥ 50 %', 1), C('a', 'Uso de aspirina en los últimos 7 días', 1), C('ang', 'Angina grave (≥ 2 episodios en 24 horas)', 1), C('st', 'Desviación del ST ≥ 0,5 mm', 1), C('mar', 'Marcadores cardíacos elevados', 1)],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Riesgo bajo (0 a 2)', texto: 'Eventos a 14 días ≈ 5 a 8 %.' }, { max: 4, nivel: 'warn', titulo: 'Riesgo intermedio (3 a 4)', texto: 'Eventos ≈ 13 a 20 %.' }, { max: 7, nivel: 'bad', titulo: 'Riesgo alto (5 a 7)', texto: 'Eventos ≈ 26 a 41 %: estrategia invasiva temprana.' }],
      fuente: 'Antman EM et al. JAMA 2000;284:835. Guías ESC 2023 de síndromes coronarios agudos.' },

    { id: 'pam', area: 'cardio', ico: '🩸', nombre: 'Presión arterial media y de pulso', alias: 'pam presion media',
      desc: 'Presión de perfusión de los órganos (meta habitual en shock: PAM ≥ 65 mmHg).',
      campos: [N('pas', 'Presión sistólica', 'mmHg', { min: 40, max: 300 }), N('pad', 'Presión diastólica', 'mmHg', { min: 20, max: 200 })],
      calc: (v) => { const pam = (v.pas + 2 * v.pad) / 3, pp = v.pas - v.pad;
        return { principal: { label: 'PAM', valor: pam, unidad: ' mmHg', dec: 0 }, nivel: pam < 65 ? 'bad' : pam < 70 ? 'warn' : 'ok', titulo: pam < 65 ? 'Hipoperfusión probable (PAM < 65)' : 'Perfusión adecuada (PAM ≥ 65)', extra: [['Presión de pulso', num(pp, 0) + ' mmHg' + (pp > 60 ? ' (aumentada)' : pp < 25 ? ' (disminuida)' : '')]] }; },
      fuente: 'PAM = (PAS + 2 × PAD) / 3. Surviving Sepsis Campaign 2021 (objetivo PAM ≥ 65 mmHg).' },

    { id: 'qtc', area: 'cardio', ico: '📈', nombre: 'Intervalo QT corregido (QTc)', alias: 'electrocardiograma bazett fridericia torsades',
      desc: 'Corrige el QT por la frecuencia cardíaca; el QTc largo aumenta el riesgo de torsades de pointes.',
      campos: [Sx(), N('qt', 'QT medido', 'ms', { min: 200, max: 800 }), N('fc', 'Frecuencia cardíaca', 'lpm', { min: 30, max: 200 })],
      calc: (v) => { const rr = 60 / v.fc; const b = v.qt / Math.sqrt(rr), f = v.qt / Math.cbrt(rr); const lim = v.sexo === 'F' ? 460 : 450; const q = f;
        return { principal: { label: 'QTc (Fridericia)', valor: f, unidad: ' ms', dec: 0 }, nivel: q > 500 ? 'bad' : q > lim ? 'warn' : 'ok', titulo: q > 500 ? 'Muy prolongado (> 500 ms): alto riesgo de arritmia' : q > lim ? 'Prolongado' : 'Normal',
          extra: [['QTc (Bazett)', num(b, 0) + ' ms'], ['Límite normal', '< ' + lim + ' ms']], texto: 'Fridericia es más precisa con frecuencias cardíacas extremas; Bazett sobrecorrige por encima de 100 lpm. Con > 500 ms o aumento > 60 ms suspender fármacos que prolongan el QT y corregir potasio y magnesio.' }; },
      fuente: 'Bazett HC, Heart 1920; Fridericia LS, Acta Med Scand 1920. AHA/ACCF/HRS 2009 (Recommendations for the standardization of the ECG, part IV).' },

    { id: 'ph-winter', area: 'nefro', ico: '🧪', nombre: 'Acidosis metabólica: fórmula de Winter', alias: 'compensacion respiratoria gasometria pco2 esperada',
      desc: 'PaCO₂ esperada en una acidosis metabólica y si hay un trastorno respiratorio agregado.',
      campos: [N('hco3', 'Bicarbonato', 'mEq/L', { min: 2, max: 40 }), N('pco2', 'PaCO₂ medida', 'mmHg', { min: 10, max: 100 })],
      calc: (v) => { const e = 1.5 * v.hco3 + 8; const lo = e - 2, hi = e + 2;
        const c = v.pco2 > hi ? ['Acidosis respiratoria agregada (compensación insuficiente)', 'bad'] : v.pco2 < lo ? ['Alcalosis respiratoria agregada', 'warn'] : ['Compensación respiratoria adecuada', 'ok'];
        return { principal: { label: 'PaCO₂ esperada', valor: e, unidad: ' ± 2 mmHg', dec: 0 }, nivel: c[1], titulo: c[0], texto: 'PaCO₂ esperada = 1,5 × HCO₃ + 8 (± 2). Rango esperado: ' + num(lo, 0) + ' a ' + num(hi, 0) + ' mmHg.' }; },
      fuente: 'Albert MS et al. Ann Intern Med 1967;66:312 (fórmula de Winter). Kraut JA, Madias NE. N Engl J Med 2014;371:1434.' },

    { id: 'delta-delta', area: 'nefro', ico: 'Δ', nombre: 'Relación delta-delta (anión gap / bicarbonato)', alias: 'acidosis mixta alcalosis metabolica agregada',
      desc: 'Detecta trastornos metabólicos mixtos en una acidosis con anión gap alto.',
      campos: [N('ag', 'Anión gap', 'mEq/L', { min: 0, max: 60 }), N('hco3', 'Bicarbonato', 'mEq/L', { min: 2, max: 40 })],
      calc: (v) => { const d = (v.ag - 12) / (24 - v.hco3); if (!Number.isFinite(d) || 24 - v.hco3 <= 0) return null;
        const c = d < 0.4 ? 'Acidosis con anión gap normal (hiperclorémica) pura' : d < 1 ? 'Acidosis mixta: anión gap alto más anión gap normal' : d <= 2 ? 'Acidosis con anión gap alto pura' : 'Acidosis con anión gap alto más alcalosis metabólica concomitante';
        return { principal: { label: 'Delta-delta', valor: d, dec: 2, unidad: '' }, nivel: d >= 1 && d <= 2 ? 'ok' : 'warn', titulo: c, texto: 'Relación = (anión gap − 12) / (24 − HCO₃). Interpretar con la clínica y la gasometría.' }; },
      fuente: 'Rastegar A. Clin J Am Soc Nephrol 2007;2:162. Kraut JA, Madias NE. N Engl J Med 2014;371:1434.' },

    { id: 'deficit-hco3', area: 'nefro', ico: '💊', nombre: 'Déficit de bicarbonato', alias: 'acidosis reposicion bicarbonato',
      desc: 'Bicarbonato necesario para llevar el sérico a un valor objetivo (uso restringido a acidosis graves).',
      campos: [N('peso', 'Peso', 'kg', { min: 3, max: 250 }), N('hco3', 'Bicarbonato actual', 'mEq/L', { min: 2, max: 24 }), N('obj', 'Bicarbonato objetivo', 'mEq/L', { min: 10, max: 24, ph: '15' })],
      calc: (v) => { const d = 0.5 * v.peso * (v.obj - v.hco3); return { principal: { label: 'Déficit estimado', valor: d, unidad: ' mEq', dec: 0 }, nivel: 'warn', titulo: 'Fórmula: 0,5 × peso × (objetivo − actual)', texto: 'Se repone solo la mitad en las primeras horas y se reevalúa. La indicación se limita a acidosis grave (pH < 7,1) o hiperpotasemia; tratar primero la causa.' }; },
      fuente: 'Kraut JA, Madias NE. Nat Rev Nephrol 2012;8:589. Surviving Sepsis Campaign 2021 (no recomienda bicarbonato en la acidosis láctica con pH ≥ 7,2).' },

    { id: 'gradiente-aa', area: 'emergencias', ico: '🫁', nombre: 'Gradiente alvéolo-arterial y PaO₂/FiO₂', alias: 'gasometria hipoxemia insuficiencia respiratoria sdra',
      desc: 'Valora el intercambio gaseoso: gradiente A-a y relación PaO₂/FiO₂.',
      campos: [N('pao2', 'PaO₂', 'mmHg', { min: 20, max: 500 }), N('paco2', 'PaCO₂', 'mmHg', { min: 10, max: 120 }), N('fio2', 'FiO₂', '% (21 = aire)', { min: 21, max: 100, ph: '21' }), N('edad', 'Edad (opcional)', 'años', { opcional: true, min: 1, max: 110 }), N('patm', 'Presión barométrica (opcional)', 'mmHg', { opcional: true, ph: '760' })],
      calc: (v) => { const f = v.fio2 / 100, pb = Number.isFinite(v.patm) ? v.patm : 760; const pao2 = f * (pb - 47) - v.paco2 / 0.8; const aa = pao2 - v.pao2; const pf = v.pao2 / f;
        const esp = Number.isFinite(v.edad) ? v.edad / 4 + 4 : null; const c = pf < 100 ? ['SDRA grave (PaO₂/FiO₂ < 100)', 'bad'] : pf < 200 ? ['SDRA moderado (100 a 199)', 'bad'] : pf < 300 ? ['SDRA leve (200 a 299)', 'warn'] : ['Sin hipoxemia grave por PaO₂/FiO₂', 'ok'];
        return { principal: { label: 'PaO₂/FiO₂', valor: pf, unidad: '', dec: 0 }, nivel: c[1], titulo: c[0], extra: [['Gradiente A-a', num(aa, 0) + ' mmHg' + (esp != null ? ' (esperado ≈ ' + num(esp, 0) + ')' : '')], ['PAO₂ alveolar', num(pao2, 0) + ' mmHg']],
          texto: 'Un gradiente A-a elevado orienta a alteración del intercambio (shunt, V/Q, difusión); si es normal con hipoxemia, pensar en hipoventilación o altura. Las categorías de SDRA aplican con PEEP ≥ 5 cmH₂O.' }; },
      fuente: 'Definición de Berlín del SDRA (ARDS Definition Task Force, JAMA 2012;307:2526).' },

    { id: 'vt-ardsnet', area: 'emergencias', ico: '🫁', nombre: 'Volumen corriente protector (ARDSNet)', alias: 'ventilacion mecanica peso ideal predicho sdra',
      desc: 'Volumen corriente según el peso ideal predicho (por talla y sexo).',
      campos: [Sx(), N('talla', 'Talla', 'cm', { min: 130, max: 220 })],
      calc: (v) => { const pbw = (v.sexo === 'M' ? 50 : 45.5) + 0.91 * (v.talla - 152.4);
        return { principal: { label: 'Peso ideal predicho', valor: pbw, unidad: ' kg', dec: 1 }, nivel: 'info', titulo: 'Volumen corriente de 6 mL/kg: ' + num(pbw * 6, 0) + ' mL', extra: [['Rango 4 a 8 mL/kg', num(pbw * 4, 0) + ' a ' + num(pbw * 8, 0) + ' mL']], texto: 'Meta: presión meseta ≤ 30 cmH₂O. Usar el peso ideal por talla, no el peso real.' }; },
      fuente: 'ARDS Network. N Engl J Med 2000;342:1301. Fórmula del peso corporal predicho: 50 (varón) o 45,5 (mujer) + 0,91 × (talla en cm − 152,4).' },

    { id: 'sofa', area: 'emergencias', ico: '🧬', nombre: 'Score SOFA (disfunción orgánica)', alias: 'sepsis shock septico terapia intensiva',
      desc: 'Valora la disfunción de 6 sistemas; un aumento ≥ 2 puntos define sepsis (Sepsis-3).', maximo: 24,
      campos: [S('r', 'Respiratorio (PaO₂/FiO₂)', [['≥ 400', 0], ['< 400', 1], ['< 300', 2], ['< 200 con soporte ventilatorio', 3], ['< 100 con soporte ventilatorio', 4]]), S('c', 'Coagulación (plaquetas ×10³/mm³)', [['≥ 150', 0], ['< 150', 1], ['< 100', 2], ['< 50', 3], ['< 20', 4]]),
        S('h', 'Hígado (bilirrubina mg/dl)', [['< 1,2', 0], ['1,2 a 1,9', 1], ['2,0 a 5,9', 2], ['6,0 a 11,9', 3], ['> 12', 4]]), S('cv', 'Cardiovascular', [['PAM ≥ 70', 0], ['PAM < 70', 1], ['Dopamina ≤ 5 o dobutamina', 2], ['Dopamina > 5 o noradrenalina ≤ 0,1', 3], ['Dopamina > 15 o noradrenalina > 0,1', 4]]),
        S('n', 'Neurológico (Glasgow)', [['15', 0], ['13 a 14', 1], ['10 a 12', 2], ['6 a 9', 3], ['< 6', 4]]), S('re', 'Renal (creatinina mg/dl o diuresis)', [['< 1,2', 0], ['1,2 a 1,9', 1], ['2,0 a 3,4', 2], ['3,5 a 4,9 o diuresis < 500 ml/día', 3], ['> 5 o diuresis < 200 ml/día', 4]])],
      rangos: [{ max: 1, nivel: 'ok', titulo: 'Disfunción mínima (0 a 1)', texto: 'Mortalidad baja (< 10 %).' }, { max: 6, nivel: 'warn', titulo: 'Disfunción orgánica (2 a 6)', texto: 'Mortalidad ≈ 6 a 21 %. Un aumento ≥ 2 sobre el basal con infección define sepsis.' }, { max: 9, nivel: 'bad', titulo: 'Disfunción grave (7 a 9)', texto: 'Mortalidad ≈ 20 a 35 %.' }, { max: 12, nivel: 'bad', titulo: 'Muy grave (10 a 12)', texto: 'Mortalidad ≈ 50 % o más.' }, { max: 24, nivel: 'bad', titulo: 'Crítico (> 12)', texto: 'Mortalidad muy alta en las series históricas (> 80 %).' }],
      fuente: 'Vincent JL et al. Intensive Care Med 1996;22:707. Singer M et al. JAMA 2016;315:801 (Sepsis-3).', nota: 'Las mortalidades son aproximadas (Ferreira FL, JAMA 2001).' },

    { id: 'clearance-24h', area: 'nefro', ico: '🕐', nombre: 'Clearance de creatinina en orina de 24 horas', alias: 'depuracion creatinina diuresis',
      desc: 'Depuración medida a partir de creatinina urinaria y plasmática.',
      campos: [N('ucr', 'Creatinina urinaria', 'mg/dl', { min: 1, max: 500 }), N('vol', 'Volumen urinario de 24 h', 'mL', { min: 100, max: 8000 }), N('pcr', 'Creatinina plasmática', 'mg/dl', { min: 0.2, max: 20 }), N('sc', 'Superficie corporal (opcional)', 'm²', { opcional: true, min: 0.5, max: 3, ph: '1,73' })],
      calc: (v) => { const c = (v.ucr * v.vol) / (v.pcr * 1440); const ex = []; if (Number.isFinite(v.sc)) ex.push(['Corregido a 1,73 m²', num(c * 1.73 / v.sc, 0) + ' mL/min/1,73 m²']);
        return { principal: { label: 'Clearance', valor: c, unidad: ' mL/min', dec: 0 }, nivel: c >= 90 ? 'ok' : c >= 60 ? 'info' : c >= 30 ? 'warn' : 'bad', titulo: c >= 90 ? 'Normal' : c >= 60 ? 'Levemente disminuido' : c >= 30 ? 'Moderadamente disminuido' : 'Gravemente disminuido', extra: ex, texto: 'Valido solo si la recolección de 24 horas fue completa (creatinina urinaria esperada ≈ 15 a 25 mg/kg/día).' }; },
      fuente: 'Fórmula de depuración: UCr × V / (PCr × 1440). KDIGO 2024 CKD Guideline (preferir eFG por CKD-EPI salvo situaciones especiales).' },

    { id: 'prot-creat', area: 'nefro', ico: '🧫', nombre: 'Cociente proteinuria/creatininuria en muestra aislada', alias: 'proteinuria preeclampsia sindrome nefrotico',
      desc: 'Estima la proteinuria de 24 horas desde una muestra de orina (g/g).',
      campos: [N('prot', 'Proteínas en orina', 'mg/dl', { min: 0, max: 5000 }), N('cr', 'Creatinina en orina', 'mg/dl', { min: 5, max: 500 })],
      calc: (v) => { const q = v.prot / v.cr; const c = q >= 3.5 ? ['Rango nefrótico (≥ 3,5 g/g)', 'bad'] : q >= 0.3 ? ['Proteinuria significativa (≥ 0,3 g/g)', 'warn'] : ['Normal o mínima (< 0,3 g/g)', 'ok'];
        return { principal: { label: 'Cociente proteína/creatinina', valor: q, unidad: ' g/g', dec: 2 }, nivel: c[1], titulo: c[0], texto: 'Equivale aproximadamente a los gramos de proteínas por día. En el embarazo, ≥ 0,3 es criterio de proteinuria para preeclampsia (ACOG 2020).' }; },
      fuente: 'KDIGO 2024 CKD Guideline; ACOG Practice Bulletin 222 (2020). Ginsberg JM et al. N Engl J Med 1983;309:1543.' },

    { id: 'anemia-oms', area: 'general', ico: '🩸', nombre: 'Clasificación de anemia por hemoglobina (OMS)', alias: 'hemoglobina anemia leve moderada grave',
      desc: 'Define y gradúa la anemia según edad, sexo y embarazo.',
      campos: [S('g', 'Grupo', [['Varón adulto', 'v'], ['Mujer adulta no embarazada', 'm'], ['Embarazada', 'e'], ['Niño de 5 a 11 años', 'n5'], ['Niño de 6 meses a 4 años', 'n0']], { val: true }), N('hb', 'Hemoglobina', 'g/dl', { min: 3, max: 20 })],
      calc: (v) => { const T = { v: [13, 11, 8], m: [12, 11, 8], e: [11, 10, 7], n5: [11.5, 11, 8], n0: [11, 10, 7] }[v.g]; const hb = v.hb;
        const c = hb >= T[0] ? ['Sin anemia', 'ok'] : hb >= T[1] ? ['Anemia leve', 'warn'] : hb >= T[2] ? ['Anemia moderada', 'bad'] : ['Anemia grave', 'bad'];
        return { principal: { label: 'Hemoglobina', valor: hb, unidad: ' g/dl', dec: 1 }, nivel: c[1], titulo: c[0], texto: 'Umbral de anemia en este grupo: < ' + T[0] + ' g/dl. Siempre estudiar la causa (ferropenia, déficit de B12 o folato, enfermedad crónica).' }; },
      fuente: 'Organización Mundial de la Salud (OMS), Concentraciones de hemoglobina para diagnosticar la anemia (2011).' },

    { id: 'talla-blanco', area: 'pediatria', ico: '📏', nombre: 'Talla blanco familiar (talla objetivo)', alias: 'talla diana pronostico talla adulta',
      desc: 'Talla adulta esperada según la talla de los padres.',
      campos: [Sx('sexo'), N('madre', 'Talla de la madre', 'cm', { min: 130, max: 200 }), N('padre', 'Talla del padre', 'cm', { min: 140, max: 215 })],
      calc: (v) => { const t = v.sexo === 'M' ? (v.madre + v.padre + 13) / 2 : (v.madre + v.padre - 13) / 2;
        return { principal: { label: 'Talla blanco familiar', valor: t, unidad: ' cm', dec: 1 }, nivel: 'info', titulo: 'Rango esperado: ' + num(t - 8.5, 1) + ' a ' + num(t + 8.5, 1) + ' cm (± 8,5 cm)', texto: 'Fórmula de Tanner: (talla madre + talla padre ± 13) / 2. Comparar la talla actual y el pronóstico con la curva de crecimiento (Sociedad Argentina de Pediatría).' }; },
      fuente: 'Tanner JM et al. Arch Dis Child 1970;45:755.' },

    { id: 'silverman', area: 'pediatria', ico: '👶', nombre: 'Test de Silverman-Andersen (dificultad respiratoria neonatal)', alias: 'recién nacido distres respiratorio',
      desc: 'Valora la dificultad respiratoria del recién nacido (0 a 10).', maximo: 10,
      campos: [S('a', 'Movimientos tóracoabdominales', [['Rítmicos y regulares', 0], ['Tórax inmóvil, abdomen en movimiento', 1], ['Disociación toracoabdominal', 2]]), S('b', 'Tiraje intercostal', [['Ausente', 0], ['Leve', 1], ['Intenso y constante', 2]]), S('c', 'Retracción xifoidea', [['Ausente', 0], ['Leve', 1], ['Intensa', 2]]),
        S('d', 'Aleteo nasal', [['Ausente', 0], ['Leve', 1], ['Intenso', 2]]), S('e', 'Quejido espiratorio', [['Ausente', 0], ['Audible con estetoscopio', 1], ['Audible a distancia', 2]])],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'Sin dificultad respiratoria', texto: 'Respiración normal.' }, { max: 3, nivel: 'warn', titulo: 'Dificultad leve (1 a 3)', texto: 'Observación y control seriado.' }, { max: 6, nivel: 'bad', titulo: 'Dificultad moderada (4 a 6)', texto: 'Soporte respiratorio según el protocolo neonatal.' }, { max: 10, nivel: 'bad', titulo: 'Dificultad grave (7 a 10)', texto: 'Insuficiencia respiratoria: asistencia ventilatoria y traslado a cuidados intensivos neonatales.' }],
      fuente: 'Silverman WA, Andersen DH. Pediatrics 1956;17:1.' },

    { id: 'braden', area: 'general', ico: '🛏️', nombre: 'Escala de Braden (úlceras por presión)', alias: 'escaras enfermeria riesgo lesiones por presion',
      desc: 'Riesgo de desarrollar úlceras por presión (6 a 23 puntos; menor puntaje, mayor riesgo).', maximo: 23,
      campos: [S('p', 'Percepción sensorial', [['Completamente limitada', 1], ['Muy limitada', 2], ['Ligeramente limitada', 3], ['Sin alteraciones', 4]]), S('h', 'Exposición a la humedad', [['Constantemente húmeda', 1], ['Muy húmeda', 2], ['Ocasionalmente húmeda', 3], ['Raramente húmeda', 4]]),
        S('a', 'Actividad', [['En cama', 1], ['En silla', 2], ['Camina ocasionalmente', 3], ['Camina frecuentemente', 4]]), S('m', 'Movilidad', [['Completamente inmóvil', 1], ['Muy limitada', 2], ['Ligeramente limitada', 3], ['Sin limitaciones', 4]]),
        S('n', 'Nutrición', [['Muy pobre', 1], ['Probablemente inadecuada', 2], ['Adecuada', 3], ['Excelente', 4]]), S('f', 'Roce y fricción', [['Problema', 1], ['Problema potencial', 2], ['Sin problema aparente', 3]])],
      rangos: [{ max: 9, nivel: 'bad', titulo: 'Riesgo muy alto (≤ 9)', texto: 'Colchón de presión alternante, cambios posturales cada 2 horas y valoración nutricional.' }, { max: 12, nivel: 'bad', titulo: 'Riesgo alto (10 a 12)', texto: 'Superficies de apoyo especiales y cambios posturales programados.' }, { max: 14, nivel: 'warn', titulo: 'Riesgo moderado (13 a 14)', texto: 'Cambios posturales y protección de zonas de apoyo.' }, { max: 18, nivel: 'warn', titulo: 'Riesgo bajo (15 a 18)', texto: 'Medidas preventivas básicas y reevaluación.' }, { max: 23, nivel: 'ok', titulo: 'Sin riesgo (19 a 23)', texto: 'Reevaluar ante cambios clínicos.' }],
      fuente: 'Bergstrom N et al. Nurs Res 1987;36:205. Guía de prevención de úlceras por presión (EPUAP/NPIAP 2019).', nota: 'Aquí un puntaje bajo indica mayor riesgo (al revés que la mayoría de las escalas).' },

    { id: 'morse', area: 'general', ico: '⚠️', nombre: 'Escala de Morse (riesgo de caídas)', alias: 'caidas internacion enfermeria',
      desc: 'Riesgo de caídas del paciente hospitalizado.', maximo: 125,
      campos: [S('a', 'Antecedente de caídas (últimos 3 meses)', [['No', 0], ['Sí', 25]]), S('d', 'Diagnóstico secundario', [['No', 0], ['Sí', 15]]), S('b', 'Ayuda para la deambulación', [['Ninguna, reposo o ayuda de enfermería', 0], ['Muletas, bastón o andador', 15], ['Se apoya en el mobiliario', 30]]),
        S('v', 'Vía intravenosa o heparinizada', [['No', 0], ['Sí', 20]]), S('m', 'Marcha', [['Normal, en reposo o inmóvil', 0], ['Débil', 10], ['Alterada', 20]]), S('e', 'Estado mental', [['Orientado y consciente de sus limitaciones', 0], ['Olvida sus limitaciones', 15]])],
      rangos: [{ max: 24, nivel: 'ok', titulo: 'Riesgo bajo (0 a 24)', texto: 'Cuidados básicos.' }, { max: 44, nivel: 'warn', titulo: 'Riesgo moderado (25 a 44)', texto: 'Aplicar medidas estándar de prevención de caídas.' }, { max: 125, nivel: 'bad', titulo: 'Riesgo alto (≥ 45)', texto: 'Medidas intensivas: acompañamiento, barandas, calzado adecuado y supervisión frecuente.' }],
      fuente: 'Morse JM et al. Can J Aging 1989;8:366.' },
  ]);
})();
