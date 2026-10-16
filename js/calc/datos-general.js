// Calculadoras generales, de Nefrología/Metabolismo, Nutrición y Pediatría.
(function () {
  const { N, C, S, Sx, num } = NikaCalcs;
  NikaCalcs.agregar([
    { id: 'imc', area: 'general', ico: '📏', nombre: 'Índice de masa corporal (IMC)', alias: 'peso talla obesidad sobrepeso',
      desc: 'Clasificación del estado nutricional del adulto según la OMS.',
      campos: [N('peso', 'Peso', 'kg', { min: 20, max: 350 }), N('talla', 'Talla', 'cm', { min: 100, max: 230 })],
      calc: (v) => { const i = v.peso / Math.pow(v.talla / 100, 2); const c = i < 18.5 ? ['Bajo peso', 'warn'] : i < 25 ? ['Peso normal', 'ok'] : i < 30 ? ['Sobrepeso', 'warn'] : i < 35 ? ['Obesidad grado I', 'bad'] : i < 40 ? ['Obesidad grado II', 'bad'] : ['Obesidad grado III (mórbida)', 'bad'];
        return { principal: { label: 'IMC', valor: i, unidad: ' kg/m²' }, nivel: c[1], titulo: c[0], extra: [['Rango de peso normal para esa talla', num(18.5 * Math.pow(v.talla / 100, 2), 1) + ' a ' + num(24.9 * Math.pow(v.talla / 100, 2), 1) + ' kg']] }; },
      fuente: 'Organización Mundial de la Salud (OMS), clasificación del IMC.', nota: 'En adultos mayores y en personas con mucha masa muscular puede no reflejar la adiposidad.' },

    { id: 'sc-mosteller', area: 'general', ico: '🧍', nombre: 'Superficie corporal (Mosteller)', alias: 'quimioterapia dosis area corporal',
      desc: 'Área de superficie corporal para dosificar fármacos y calcular índices.',
      campos: [N('peso', 'Peso', 'kg', { min: 2, max: 350 }), N('talla', 'Talla', 'cm', { min: 40, max: 230 })],
      calc: (v) => ({ principal: { label: 'Superficie corporal', valor: Math.sqrt(v.peso * v.talla / 3600), dec: 2, unidad: ' m²' }, nivel: 'info', titulo: 'Fórmula de Mosteller: √(peso × talla / 3600)' }),
      fuente: 'Mosteller RD. N Engl J Med 1987;317:1098.' },

    { id: 'peso-ideal', area: 'general', ico: '⚖️', nombre: 'Peso ideal y ajustado (Devine)', alias: 'peso ideal dosificacion',
      desc: 'Peso ideal por talla, usado para dosificar fármacos y ajustar la ventilación.',
      campos: [Sx(), N('talla', 'Talla', 'cm', { min: 130, max: 230 }), N('peso', 'Peso real (opcional)', 'kg', { opcional: true, min: 20, max: 350 })],
      calc: (v) => { const pulg = v.talla / 2.54 - 60; const pi = (v.sexo === 'M' ? 50 : 45.5) + 2.3 * pulg; const ex = [];
        if (Number.isFinite(v.peso)) { ex.push(['Peso ajustado (0,4 × exceso)', num(pi + 0.4 * (v.peso - pi), 1) + ' kg'], ['Peso real / ideal', num(v.peso / pi * 100, 0) + ' %']); }
        return { principal: { label: 'Peso ideal', valor: pi, unidad: ' kg' }, nivel: 'info', titulo: 'Devine: ' + (v.sexo === 'M' ? '50' : '45,5') + ' kg + 2,3 kg por cada pulgada sobre 5 pies', extra: ex }; },
      fuente: 'Devine BJ. Drug Intell Clin Pharm 1974;8:650. ARDSNet (ventilación protectora usa el peso ideal por talla).' },

    { id: 'cockcroft', area: 'nefro', ico: '💧', nombre: 'Clearance de creatinina (Cockcroft-Gault)', alias: 'filtrado glomerular ajuste de dosis farmacos',
      desc: 'Estima la depuración de creatinina; se usa para ajustar dosis de fármacos.',
      campos: [Sx(), N('edad', 'Edad', 'años', { min: 18, max: 110 }), N('peso', 'Peso', 'kg', { min: 20, max: 350 }), N('cr', 'Creatinina sérica', 'mg/dl', { min: 0.2, max: 20 })],
      calc: (v) => { const c = ((140 - v.edad) * v.peso) / (72 * v.cr) * (v.sexo === 'F' ? 0.85 : 1);
        const e = c >= 90 ? ['Normal o aumentado', 'ok'] : c >= 60 ? ['Levemente disminuido', 'info'] : c >= 30 ? ['Moderadamente disminuido', 'warn'] : c >= 15 ? ['Gravemente disminuido', 'bad'] : ['Falla renal', 'bad'];
        return { principal: { label: 'Clearance estimado', valor: c, unidad: ' mL/min', dec: 0 }, nivel: e[1], titulo: e[0], texto: 'Es la ecuación usada en la mayoría de las fichas técnicas para ajustar dosis. En obesidad conviene usar peso ajustado.' }; },
      fuente: 'Cockcroft DW, Gault MH. Nephron 1976;16:31.', nota: 'Para estadificar la enfermedad renal crónica se prefiere CKD-EPI.' },

    { id: 'ckd-epi', area: 'nefro', ico: '🧪', nombre: 'Filtrado glomerular (CKD-EPI 2021)', alias: 'egfr enfermedad renal cronica estadios',
      desc: 'Filtrado glomerular estimado, sin factor de raza, y estadio de enfermedad renal crónica.',
      campos: [Sx(), N('edad', 'Edad', 'años', { min: 18, max: 110 }), N('cr', 'Creatinina sérica', 'mg/dl', { min: 0.2, max: 20 })],
      calc: (v) => { const f = v.sexo === 'F'; const k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302; const r = v.cr / k;
        const g = 142 * Math.pow(Math.min(r, 1), a) * Math.pow(Math.max(r, 1), -1.2) * Math.pow(0.9938, v.edad) * (f ? 1.012 : 1);
        const e = g >= 90 ? ['G1 (≥ 90): normal o alto', 'ok'] : g >= 60 ? ['G2 (60 a 89): levemente disminuido', 'info'] : g >= 45 ? ['G3a (45 a 59): leve a moderado', 'warn'] : g >= 30 ? ['G3b (30 a 44): moderado a grave', 'warn'] : g >= 15 ? ['G4 (15 a 29): gravemente disminuido', 'bad'] : ['G5 (< 15): falla renal', 'bad'];
        return { principal: { label: 'eFG', valor: g, unidad: ' mL/min/1,73 m²', dec: 0 }, nivel: e[1], titulo: e[0], texto: 'El diagnóstico de enfermedad renal crónica requiere eFG < 60 o marcadores de daño (albuminuria) durante más de 3 meses.' }; },
      fuente: 'Inker LA et al. N Engl J Med 2021;385:1737 (CKD-EPI 2021, sin raza). KDIGO 2024 CKD Guideline.' },

    { id: 'calcio-corregido', area: 'nefro', ico: '🦴', nombre: 'Calcio corregido por albúmina', alias: 'hipocalcemia hipercalcemia',
      desc: 'Corrige el calcio total cuando la albúmina está baja.',
      campos: [N('ca', 'Calcio total', 'mg/dl', { min: 3, max: 20 }), N('alb', 'Albúmina', 'g/dl', { min: 0.5, max: 6 })],
      calc: (v) => { const c = v.ca + 0.8 * (4 - v.alb); return { principal: { label: 'Calcio corregido', valor: c, unidad: ' mg/dl', dec: 1 }, nivel: c < 8.5 ? 'warn' : c > 10.5 ? 'warn' : 'ok', titulo: c < 8.5 ? 'Hipocalcemia' : c > 10.5 ? 'Hipercalcemia' : 'Normal (8,5 a 10,5 mg/dl)', texto: 'Ca corregido = Ca total + 0,8 × (4 − albúmina). Ante dudas, medir el calcio iónico.' }; },
      fuente: 'Payne RB et al. Br Med J 1973;4:643. Conviene confirmar con calcio iónico en pacientes críticos.' },

    { id: 'anion-gap', area: 'nefro', ico: '⚗️', nombre: 'Anión gap (con corrección por albúmina)', alias: 'acidosis metabolica gap',
      desc: 'Diferencia de aniones: orienta la causa de la acidosis metabólica.',
      campos: [N('na', 'Sodio', 'mEq/L', { min: 100, max: 180 }), N('cl', 'Cloro', 'mEq/L', { min: 60, max: 140 }), N('hco3', 'Bicarbonato', 'mEq/L', { min: 3, max: 50 }), N('alb', 'Albúmina (opcional)', 'g/dl', { opcional: true, min: 0.5, max: 6 })],
      calc: (v) => { const g = v.na - (v.cl + v.hco3); const ex = []; let gc = g; if (Number.isFinite(v.alb)) { gc = g + 2.5 * (4.4 - v.alb); ex.push(['Anión gap corregido por albúmina', num(gc, 1) + ' mEq/L']); }
        const f = Math.max(g, gc); return { principal: { label: 'Anión gap', valor: g, unidad: ' mEq/L' }, nivel: f > 12 ? 'warn' : 'ok', titulo: f > 12 ? 'Aumentado (> 12 mEq/L): acidosis con brecha alta' : 'Normal (8 a 12 mEq/L)', extra: ex,
          texto: f > 12 ? 'Pensar en cetoacidosis, lactato, uremia, tóxicos (metanol, etilenglicol, salicilatos) usando la regla mnemotécnica MUDPILES/GOLDMARK.' : 'Si hay acidosis con gap normal, considerar pérdida de bicarbonato (diarrea, acidosis tubular renal).' }; },
      fuente: 'Figge J et al. Crit Care Med 1998;26:1807 (corrección por albúmina). Kraut JA, Madias NE. N Engl J Med 2014;371:1434.' },

    { id: 'osmolaridad', area: 'nefro', ico: '🧊', nombre: 'Osmolaridad plasmática y brecha osmolar', alias: 'hiponatremia hiperglucemia intoxicacion',
      desc: 'Osmolaridad calculada y, si tenés la medida, la brecha osmolar.',
      campos: [N('na', 'Sodio', 'mEq/L', { min: 100, max: 190 }), N('glu', 'Glucemia', 'mg/dl', { min: 20, max: 2000 }), N('bun', 'Urea (BUN)', 'mg/dl', { min: 1, max: 300 }), N('med', 'Osmolaridad medida (opcional)', 'mOsm/kg', { opcional: true, min: 150, max: 500 })],
      calc: (v) => { const o = 2 * v.na + v.glu / 18 + v.bun / 2.8; const ex = [['Rango normal', '275 a 295 mOsm/kg']];
        if (Number.isFinite(v.med)) { const b = v.med - o; ex.push(['Brecha osmolar', num(b, 0) + ' mOsm/kg' + (b > 10 ? ' (aumentada: sospechar alcoholes tóxicos)' : '')]); }
        return { principal: { label: 'Osmolaridad calculada', valor: o, unidad: ' mOsm/kg', dec: 0 }, nivel: o > 295 ? 'warn' : o < 275 ? 'warn' : 'ok', titulo: o > 295 ? 'Hiperosmolar' : o < 275 ? 'Hipoosmolar' : 'Normal', extra: ex }; },
      fuente: 'Osmolaridad = 2 × Na + glucemia/18 + BUN/2,8. Rasouli M, Clin Chim Acta 2016. Un estado hiperglucémico hiperosmolar se define con osmolaridad > 320 mOsm/kg (ADA).' },

    { id: 'na-corregido', area: 'nefro', ico: '🍬', nombre: 'Sodio corregido por glucemia', alias: 'hiperglucemia hiponatremia dilucional',
      desc: 'Corrige el sodio cuando la hiperglucemia diluye el sodio sérico.',
      campos: [N('na', 'Sodio medido', 'mEq/L', { min: 100, max: 180 }), N('glu', 'Glucemia', 'mg/dl', { min: 100, max: 2000 })],
      calc: (v) => { const a = v.na + 1.6 * ((v.glu - 100) / 100), b = v.na + 2.4 * ((v.glu - 100) / 100);
        return { principal: { label: 'Sodio corregido (Katz, 1,6)', valor: a, unidad: ' mEq/L', dec: 1 }, nivel: 'info', extra: [['Con el factor de Hillier (2,4)', num(b, 1) + ' mEq/L']], texto: 'Se suma 1,6 mEq/L de sodio por cada 100 mg/dl de glucemia sobre 100 (2,4 si la glucemia es muy elevada, > 400 mg/dl).' }; },
      fuente: 'Katz MA. N Engl J Med 1973;289:843. Hillier TA et al. Am J Med 1999;106:399. ADA, Hyperglycemic crises in adults with diabetes (2024).' },

    { id: 'deficit-agua', area: 'nefro', ico: '💦', nombre: 'Déficit de agua libre (hipernatremia)', alias: 'hipernatremia reposicion',
      desc: 'Agua libre necesaria para corregir una hipernatremia.',
      campos: [Sx(), N('peso', 'Peso', 'kg', { min: 20, max: 250 }), C('mayor', 'Paciente de 65 años o más', 0), N('na', 'Sodio sérico', 'mEq/L', { min: 141, max: 190 })],
      calc: (v) => { const f = v.sexo === 'F'; const mayor = !!v.mayor; const k = mayor ? (f ? 0.45 : 0.5) : (f ? 0.5 : 0.6); const act = k * v.peso; const d = act * (v.na / 140 - 1);
        return { principal: { label: 'Déficit de agua libre', valor: d, unidad: ' L', dec: 1 }, nivel: 'warn', titulo: 'Agua corporal total estimada: ' + num(act, 1) + ' L', texto: 'Corregir lentamente: no bajar el sodio más de 10 a 12 mEq/L por día (≈ 0,5 mEq/L/h) para evitar edema cerebral. Reevaluar el sodio cada 4 a 6 horas.' }; },
      fuente: 'Adrogué HJ, Madias NE. N Engl J Med 2000;342:1493. Guías europeas de hiponatremia/hipernatremia 2014.', nota: 'Es un cálculo orientativo: sumar las pérdidas continuas y ajustar según los controles.' },

    { id: 'holliday-segar', area: 'pediatria', ico: '🍼', nombre: 'Requerimientos hídricos de mantenimiento (Holliday-Segar)', alias: 'hidratacion pediatrica liquidos',
      desc: 'Líquidos de mantenimiento diarios y por hora según el peso.',
      campos: [N('peso', 'Peso', 'kg', { min: 2, max: 150 })],
      calc: (v) => { const p = v.peso; const ml = p <= 10 ? p * 100 : p <= 20 ? 1000 + (p - 10) * 50 : 1500 + (p - 20) * 20;
        return { principal: { label: 'Mantenimiento en 24 horas', valor: ml, unidad: ' mL', dec: 0 }, nivel: 'info', titulo: 'Velocidad: ≈ ' + num(ml / 24, 0) + ' mL/h', texto: '100 mL/kg los primeros 10 kg, 50 mL/kg los siguientes 10 kg y 20 mL/kg por cada kg adicional. Adultos: tope habitual de 2.400 mL/día.', extra: [['Regla 4-2-1 (mL/h)', num(p <= 10 ? 4 * p : p <= 20 ? 40 + 2 * (p - 10) : 60 + (p - 20), 0)]] }; },
      fuente: 'Holliday MA, Segar WE. Pediatrics 1957;19:823. AAP 2018: se recomiendan soluciones isotónicas para el mantenimiento.' },

    { id: 'peso-pediatrico', area: 'pediatria', ico: '⚖️', nombre: 'Peso estimado del niño (urgencias)', alias: 'reanimacion pediatrica peso edad',
      desc: 'Estimación rápida del peso cuando no se puede pesar al niño.',
      campos: [N('edad', 'Edad', 'años', { min: 1, max: 10, step: 0.5 })],
      calc: (v) => ({ principal: { label: 'Peso estimado', valor: 2 * (v.edad + 4), unidad: ' kg', dec: 1 }, nivel: 'info', titulo: 'Fórmula de APLS: 2 × (edad + 4)', texto: 'Solo para emergencias de 1 a 10 años. Usar cinta de longitud (Broselow) o balanza apenas sea posible; no usar en lactantes menores de 1 año.' }),
      fuente: 'Advanced Paediatric Life Support (APLS), 6.ª ed.; AHA PALS.' },

    { id: 'westley', area: 'pediatria', ico: '🗣️', nombre: 'Score de Westley (crup)', alias: 'laringitis estridor niños',
      desc: 'Gravedad del crup viral (laringotraqueítis) en niños.', maximo: 17,
      campos: [S('estridor', 'Estridor', [['Ninguno', 0], ['Al llorar o agitarse', 1], ['En reposo', 2]]), S('retr', 'Tiraje (retracciones)', [['Ninguno', 0], ['Leve', 1], ['Moderado', 2], ['Grave', 3]]), S('aire', 'Entrada de aire', [['Normal', 0], ['Disminuida', 1], ['Muy disminuida', 2]]), S('cian', 'Cianosis', [['Ninguna', 0], ['Con agitación', 4], ['En reposo', 5]]), S('con', 'Nivel de conciencia', [['Normal', 0], ['Alterado (letargo o agitación)', 5]])],
      rangos: [{ max: 2, nivel: 'ok', titulo: 'Crup leve (≤ 2)', texto: 'Dexametasona oral 0,15 a 0,6 mg/kg en dosis única; manejo ambulatorio con indicaciones de alarma.' }, { max: 5, nivel: 'warn', titulo: 'Crup moderado (3 a 5)', texto: 'Dexametasona y nebulización con adrenalina; observación en guardia.' }, { max: 11, nivel: 'bad', titulo: 'Crup grave (6 a 11)', texto: 'Adrenalina nebulizada, dexametasona e internación; vigilar la vía aérea.' }, { max: 17, nivel: 'bad', titulo: 'Insuficiencia respiratoria inminente (≥ 12)', texto: 'Emergencia: asegurar la vía aérea y trasladar a cuidados intensivos.' }],
      fuente: 'Westley CR et al. Am J Dis Child 1978;132:484. Cochrane (corticoides en crup).', nota: 'Las dosis son orientativas: seguir el protocolo del servicio.' },

    { id: 'infusion', area: 'emergencias', ico: '💉', nombre: 'Velocidad de infusión (mcg/kg/min → mL/h)', alias: 'noradrenalina dopamina bomba goteo dilucion',
      desc: 'Convierte una dosis en mcg/kg/min a la velocidad de la bomba en mL/h.',
      campos: [N('dosis', 'Dosis indicada', 'mcg/kg/min', { min: 0.001, max: 100 }), N('peso', 'Peso', 'kg', { min: 2, max: 250 }), N('mg', 'Fármaco en la dilución', 'mg', { min: 0.1, max: 2000 }), N('vol', 'Volumen total de la dilución', 'mL', { min: 5, max: 2000 })],
      calc: (v) => { const conc = (v.mg * 1000) / v.vol; const mlh = (v.dosis * v.peso * 60) / conc;
        return { principal: { label: 'Velocidad de la bomba', valor: mlh, unidad: ' mL/h', dec: 1 }, nivel: 'warn', titulo: 'Concentración: ' + num(conc, 1) + ' mcg/mL', texto: 'Verificar siempre con el protocolo de la institución, la doble verificación y los límites de dosis de cada fármaco antes de programar la bomba.' }; },
      fuente: 'Velocidad (mL/h) = dosis (mcg/kg/min) × peso (kg) × 60 / concentración (mcg/mL). Fundamento farmacológico general; verificar con el vademécum y el protocolo local.' },

    { id: 'goteo', area: 'general', ico: '💧', nombre: 'Goteo: mL/h a gotas por minuto', alias: 'macrogoteo microgoteo equipo de venoclisis',
      desc: 'Convierte el volumen a pasar en el goteo del equipo de suero.',
      campos: [N('vol', 'Volumen a pasar', 'mL', { min: 1, max: 10000 }), N('hs', 'En', 'horas', { min: 0.1, max: 72 }), S('eq', 'Equipo', [['Macrogoteo (20 gotas/mL)', 20], ['Macrogoteo (15 gotas/mL)', 15], ['Microgoteo (60 microgotas/mL)', 60]], { val: true })],
      calc: (v) => { const mlh = v.vol / v.hs; const g = mlh * v.eq / 60; return { principal: { label: 'Goteo', valor: g, unidad: v.eq === 60 ? ' microgotas/min' : ' gotas/min', dec: 0 }, nivel: 'info', titulo: num(mlh, 1) + ' mL/h', texto: 'Gotas/min = volumen × factor del equipo / (horas × 60). En microgoteo coinciden mL/h y microgotas/min.' }; },
      fuente: 'Cálculo estándar de enfermería (factor de goteo del equipo).' },

    { id: 'fena', area: 'nefro', ico: '🧫', nombre: 'Excreción fraccional de sodio (FENa)', alias: 'injuria renal aguda prerrenal necrosis tubular',
      desc: 'Distingue la insuficiencia renal aguda prerrenal de la necrosis tubular aguda.',
      campos: [N('una', 'Sodio urinario', 'mEq/L', { min: 1, max: 300 }), N('pna', 'Sodio plasmático', 'mEq/L', { min: 100, max: 180 }), N('ucr', 'Creatinina urinaria', 'mg/dl', { min: 1, max: 500 }), N('pcr', 'Creatinina plasmática', 'mg/dl', { min: 0.2, max: 20 })],
      calc: (v) => { const f = (v.una * v.pcr) / (v.pna * v.ucr) * 100; return { principal: { label: 'FENa', valor: f, unidad: ' %', dec: 2 }, nivel: f < 1 ? 'ok' : f > 2 ? 'bad' : 'warn', titulo: f < 1 ? 'Sugiere causa prerrenal' : f > 2 ? 'Sugiere necrosis tubular aguda' : 'Zona intermedia', texto: 'No es confiable con diuréticos recientes (usar FEUrea < 35 % como alternativa), sepsis, glomerulonefritis o contraste.' }; },
      fuente: 'Espinel CH. JAMA 1976;236:579. KDIGO 2012 Acute Kidney Injury Guideline.' },

    { id: 'friedewald', area: 'nefro', ico: '🧈', nombre: 'LDL calculado (Friedewald)', alias: 'colesterol triglicéridos dislipemia',
      desc: 'Estima el colesterol LDL a partir del perfil lipídico.',
      campos: [N('ct', 'Colesterol total', 'mg/dl', { min: 50, max: 800 }), N('hdl', 'HDL', 'mg/dl', { min: 5, max: 200 }), N('tg', 'Triglicéridos', 'mg/dl', { min: 10, max: 399 })],
      calc: (v) => { const l = v.ct - v.hdl - v.tg / 5; return { principal: { label: 'LDL calculado', valor: l, unidad: ' mg/dl', dec: 0 }, nivel: l >= 190 ? 'bad' : l >= 160 ? 'warn' : l >= 130 ? 'warn' : 'ok', titulo: l >= 190 ? 'Muy alto (≥ 190)' : l >= 160 ? 'Alto (160 a 189)' : l >= 130 ? 'Límite alto (130 a 159)' : l >= 100 ? 'Casi óptimo (100 a 129)' : 'Óptimo (< 100)', extra: [['Colesterol no HDL', num(v.ct - v.hdl, 0) + ' mg/dl']], texto: 'Las metas de LDL dependen del riesgo cardiovascular (< 70 mg/dl en riesgo alto y < 55 en muy alto, ESC/EAS 2019). No válido con TG ≥ 400 mg/dl.' }; },
      fuente: 'Friedewald WT et al. Clin Chem 1972;18:499. ESC/EAS 2019 Guidelines on Dyslipidaemias.' },

    { id: 'homa-ir', area: 'nefro', ico: '🍰', nombre: 'HOMA-IR (resistencia a la insulina)', alias: 'insulinorresistencia diabetes sop',
      desc: 'Índice de resistencia a la insulina a partir de glucemia e insulina en ayunas.',
      campos: [N('glu', 'Glucemia en ayunas', 'mg/dl', { min: 40, max: 600 }), N('ins', 'Insulinemia en ayunas', 'µUI/mL', { min: 0.5, max: 300 })],
      calc: (v) => { const h = v.glu * v.ins / 405; return { principal: { label: 'HOMA-IR', valor: h, dec: 2, unidad: '' }, nivel: h >= 2.5 ? 'warn' : 'ok', titulo: h >= 2.5 ? 'Sugiere resistencia a la insulina' : 'Dentro del rango esperado', texto: 'Los puntos de corte varían según la población y el método de laboratorio (habitualmente entre 2,0 y 2,5).' }; },
      fuente: 'Matthews DR et al. Diabetologia 1985;28:412.' },

    { id: 'hba1c-glu', area: 'nefro', ico: '🩸', nombre: 'HbA1c y glucemia promedio estimada', alias: 'hemoglobina glicosilada diabetes control',
      desc: 'Convierte la HbA1c en glucemia promedio estimada y la clasifica.',
      campos: [N('a1c', 'Hemoglobina glicosilada (HbA1c)', '%', { min: 4, max: 18 })],
      calc: (v) => { const g = 28.7 * v.a1c - 46.7; const c = v.a1c >= 6.5 ? ['Rango de diabetes (≥ 6,5 %)', 'bad'] : v.a1c >= 5.7 ? ['Prediabetes (5,7 a 6,4 %)', 'warn'] : ['Normal (< 5,7 %)', 'ok'];
        return { principal: { label: 'Glucemia promedio estimada', valor: g, unidad: ' mg/dl', dec: 0 }, nivel: c[1], titulo: c[0], texto: 'El diagnóstico de diabetes requiere confirmación con una segunda prueba (salvo hiperglucemia inequívoca). La meta habitual en adultos es HbA1c < 7 %, individualizada.' }; },
      fuente: 'ADAG: Nathan DM et al. Diabetes Care 2008;31:1473. ADA Standards of Care 2025' },

    { id: 'mifflin', area: 'general', ico: '🍽️', nombre: 'Gasto energético en reposo (Mifflin-St Jeor)', alias: 'requerimiento calorico nutricion calorias',
      desc: 'Calorías diarias en reposo y totales según actividad.',
      campos: [Sx(), N('edad', 'Edad', 'años', { min: 15, max: 100 }), N('peso', 'Peso', 'kg', { min: 30, max: 300 }), N('talla', 'Talla', 'cm', { min: 120, max: 230 }), S('af', 'Actividad física', [['Sedentaria (×1,2)', 1.2], ['Ligera (×1,375)', 1.375], ['Moderada (×1,55)', 1.55], ['Intensa (×1,725)', 1.725]], { val: true })],
      calc: (v) => { const g = 10 * v.peso + 6.25 * v.talla - 5 * v.edad + (v.sexo === 'M' ? 5 : -161);
        return { principal: { label: 'Gasto en reposo', valor: g, unidad: ' kcal/día', dec: 0 }, nivel: 'info', titulo: 'Gasto total estimado: ' + num(g * v.af, 0) + ' kcal/día', texto: 'En el paciente internado se usan además factores de estrés y se ajusta con el equipo de nutrición.' }; },
      fuente: 'Mifflin MD et al. Am J Clin Nutr 1990;51:241. Academy of Nutrition and Dietetics.' },

    { id: 'ganzoni', area: 'general', ico: '🩸', nombre: 'Déficit de hierro (Ganzoni)', alias: 'anemia ferropenica hierro endovenoso',
      desc: 'Dosis total de hierro a reponer, p. ej. por vía endovenosa.',
      campos: [N('peso', 'Peso', 'kg', { min: 20, max: 250 }), N('hbo', 'Hemoglobina objetivo', 'g/dl', { min: 10, max: 16, ph: '15' }), N('hb', 'Hemoglobina actual', 'g/dl', { min: 3, max: 15 }), N('dep', 'Depósitos a reponer', 'mg', { opcional: true, ph: '500' })],
      calc: (v) => { const dep = Number.isFinite(v.dep) ? v.dep : 500; const d = v.peso * (v.hbo - v.hb) * 2.4 + dep;
        return { principal: { label: 'Déficit total de hierro', valor: d, unidad: ' mg', dec: 0 }, nivel: 'info', titulo: 'Peso × (Hb objetivo − Hb actual) × 2,4 + depósitos', texto: 'En embarazo y en la mayoría de los preparados modernos se usa una dosis acumulada y esquemas por ficha técnica; verificar la dosis máxima por infusión.' }; },
      fuente: 'Ganzoni AM. Schweiz Med Wochenschr 1970;100:301.' },

    { id: 'ipss', area: 'general', ico: '🚽', nombre: 'IPSS (síntomas prostáticos)', alias: 'hiperplasia prostatica hpb urologia',
      desc: 'Cuestionario de síntomas urinarios inferiores en el varón.', maximo: 35,
      campos: ['Vaciado incompleto', 'Frecuencia (menos de 2 horas entre micciones)', 'Intermitencia', 'Urgencia', 'Chorro débil', 'Esfuerzo para iniciar la micción', 'Nicturia (veces por noche)'].map((t, i) => S('p' + i, t, i === 6 ? [['Ninguna', 0], ['1 vez', 1], ['2 veces', 2], ['3 veces', 3], ['4 veces', 4], ['5 o más', 5]] : [['Nunca', 0], ['Menos de 1 de cada 5 veces', 1], ['Menos de la mitad de las veces', 2], ['Cerca de la mitad de las veces', 3], ['Más de la mitad de las veces', 4], ['Casi siempre', 5]])),
      rangos: [{ max: 7, nivel: 'ok', titulo: 'Síntomas leves (0 a 7)', texto: 'Vigilancia y medidas generales.' }, { max: 19, nivel: 'warn', titulo: 'Síntomas moderados (8 a 19)', texto: 'Considerar tratamiento farmacológico y evaluación urológica.' }, { max: 35, nivel: 'bad', titulo: 'Síntomas graves (20 a 35)', texto: 'Derivación a urología; evaluar tratamiento combinado o quirúrgico.' }],
      fuente: 'Barry MJ et al. J Urol 1992;148:1549 (AUA Symptom Index). EAU Guidelines on Non-neurogenic Male LUTS 2025.' },
  ]);
})();
