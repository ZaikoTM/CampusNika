// NikaMed · Calculadoras de ecografía y Doppler obstétrico (cribado de preeclampsia, translucencia nucal, arterias uterinas y RCIU).
// Fuentes leídas de los documentos: ACOG Practice Bulletin 222 (2020), ISUOG 2020 (SGA/FGR) con el consenso Delphi de Gordijn 2016 y GAP SEGO del I trimestre (2021).
// No se implementa el algoritmo de riesgo combinado de la FMF: requiere software certificado (ver enlaces en el fundamento).
(function () {
  'use strict';
  const { N, C, S } = NikaCalcs;
  const OB = 'obstetricia';

  const FGR_RECS = [
    // [desde, hasta, texto de conducta según Fig. 2 de ISUOG 2020]
    [24, 26, 'Entre 24+0 y 25+6 semanas: manejo personalizado en un centro de alta complejidad.'],
    [26, 29, 'Entre 26+0 y 28+6 semanas: interrumpir si la onda a del ductus venoso está en la línea de base o por debajo, o si la STV es < 2,6 ms.'],
    [29, 32, 'Entre 29+0 y 31+6 semanas: interrumpir si la onda a del ductus venoso está en la línea de base o por debajo, o si la STV es < 3,0 ms.'],
    [32, 34, 'Entre 32+0 y 33+6 semanas: interrumpir si hay flujo diastólico reverso en la arteria umbilical (permitido desde las 30+0) o STV < 3,5 ms.'],
    [34, 36, 'Desde 34+0 semanas: interrumpir si el flujo diastólico de la arteria umbilical está ausente (permitido desde las 32+0) o la STV es < 4,5 ms.'],
    [36, 38, 'Entre 36+0 y 37+6 semanas: interrumpir si el IP de la arteria umbilical es > p95 o la CA/PFE es < p3.'],
    [38, 99, 'Entre 38+0 y 39+0 semanas: interrumpir si hay redistribución cerebral o cualquier otro rasgo de RCIU.'],
  ];

  NikaCalcs.agregar([
    { id: 'pe-aspirina', area: OB, ico: '💊', nombre: 'Riesgo de preeclampsia por factores clínicos: ¿aspirina?', alias: 'preeclampsia aspirina acido acetilsalicilico profilaxis acog riesgo alto moderado',
      desc: 'Clasifica los factores de riesgo de la historia clínica y orienta si corresponde aspirina en dosis bajas.',
      intro: 'Solo incluye factores de la historia clínica (sin Doppler ni biomarcadores). Marcá los que tenga la paciente.',
      campos: [
        C('prev', 'Antecedente de preeclampsia, sobre todo con resultado adverso', 0), C('multi', 'Embarazo múltiple', 0), C('hta', 'Hipertensión crónica', 0), C('dm', 'Diabetes tipo 1 o 2', 0), C('renal', 'Enfermedad renal', 0),
        C('auto', 'Enfermedad autoinmune (lupus, síndrome antifosfolípido)', 0),
        C('nulip', 'Nuliparidad', 0), C('obes', 'Obesidad (IMC mayor de 30)', 0), C('fam', 'Antecedente familiar de preeclampsia (madre o hermana)', 0), C('socio', 'Características sociodemográficas (raza afroamericana, nivel socioeconómico bajo)', 0),
        C('edad', 'Edad de 35 años o más', 0), C('hist', 'Antecedentes personales (bajo peso o PEG previo, mal resultado obstétrico previo, intervalo mayor de 10 años)', 0)],
      calc: (v) => {
        const alto = ['prev', 'multi', 'hta', 'dm', 'renal', 'auto'].filter((k) => v[k]).length;
        const mod = ['nulip', 'obes', 'fam', 'socio', 'edad', 'hist'].filter((k) => v[k]).length;
        let nivel, titulo, texto;
        if (alto >= 1) { nivel = 'bad'; titulo = 'Riesgo alto: se recomienda aspirina'; texto = 'Con uno o más factores de alto riesgo, ACOG recomienda aspirina 81 mg/día iniciada entre las 12 y las 28 semanas (de preferencia antes de las 16) y continuada hasta el parto.'; }
        else if (mod > 1) { nivel = 'warn'; titulo = 'Riesgo moderado: considerar aspirina'; texto = 'Con más de un factor de riesgo moderado, se puede considerar aspirina 81 mg/día entre las 12 y las 28 semanas (de preferencia antes de las 16) hasta el parto.'; }
        else { nivel = 'ok'; titulo = 'Sin indicación de aspirina por estos factores'; texto = 'Con ningún factor de alto riesgo y menos de dos de riesgo moderado, ACOG no recomienda aspirina. El cribado combinado del primer trimestre (con PAM, Doppler y PlGF) puede detectar más casos.'; }
        return { principal: { label: 'Factores marcados', valor: alto + mod, unidad: ' (' + alto + ' altos · ' + mod + ' moderados)', dec: 0 }, nivel, titulo, texto,
          extra: [['Factores de riesgo alto', String(alto)], ['Factores de riesgo moderado', String(mod)]] };
      },
      fuente: 'ACOG Practice Bulletin 222 «Gestational Hypertension and Preeclampsia» (2020), tabla 1 (adaptada de USPSTF 2014). Con el cribado multiparamétrico del primer trimestre, el estudio ASPRE mostró que la aspirina en dosis ≥ 100 mg/noche iniciada antes de las 16 semanas reduce cerca de un 62 % la preeclampsia pretérmino (SEGO, 2021). Calculadoras de riesgo combinado: Fetal Medicine Foundation (fetalmedicine.org), Medicina Fetal Barcelona (medicinafetalbarcelona.org/calc).',
      nota: 'El riesgo individual con el algoritmo FMF (edad, peso, PAM, IP de uterinas, PlGF) requiere esas calculadoras: no se reproduce acá.' },

    { id: 'tn-lcn', area: OB, ico: '📏', nombre: 'Translucencia nucal: validez y corte de alarma', alias: 'tn translucencia nucal primer trimestre cribado aneuploidias lcn longitud craneo nalga',
      desc: 'Controla que la longitud cráneo-nalga sea válida (45 a 84 mm) y marca la TN aumentada (≥ 3,5 mm).',
      campos: [N('lcn', 'Longitud cráneo-nalga (LCN)', 'mm', { min: 20, max: 120 }), N('tn', 'Translucencia nucal (TN)', 'mm', { min: 0.3, max: 15, step: '0.1' })],
      calc: (v) => {
        const fuera = v.lcn < 45 || v.lcn > 84;
        let nivel, titulo, texto;
        if (fuera) { nivel = 'warn'; titulo = 'LCN fuera del rango para medir la TN'; texto = 'La TN se mide con LCN de 45 a 84 mm (11+0 a 13+6 semanas). Fuera de ese rango no sirve para el cribado de aneuploidías.'; }
        else if (v.tn >= 3.5) { nivel = 'bad'; titulo = 'TN aumentada (≥ 3,5 mm, p99)'; texto = 'Marcador de alto riesgo de aneuploidía y de otras anomalías. Derivar a medicina fetal para asesoramiento y estudio. El ADN fetal libre no es la prueba de elección con TN > 3,5 mm.'; }
        else { nivel = 'info'; titulo = 'TN por debajo de 3,5 mm'; texto = 'Está por debajo del p99, pero el riesgo se calcula combinando edad materna, TN, LCN y bioquímica (β-hCG libre y PAPP-A) en un programa certificado. Se considera alto riesgo un resultado mayor de 1 en 270. La TN normal aumenta con la LCN: el p95 depende de la LCN.'; }
        return { principal: { label: 'Translucencia nucal', valor: v.tn, unidad: ' mm', dec: 1 }, nivel, titulo, texto, extra: [['LCN', v.lcn + ' mm'], ['Rango válido de LCN', '45 a 84 mm']] };
      },
      fuente: 'GAP SEGO «Guía de la exploración ecográfica del I trimestre» (2021): la TN se mide con LCN entre 45 y 84 mm; se considera aumentada por encima del p95 o del p99 (3,5 mm); corte de alto riesgo > 1 en 270. La calculadora no calcula el percentil ni el MoM de la TN, que dependen de la tabla de la LCN.' },

    { id: 'uta-doppler', area: OB, ico: '🩻', nombre: 'Doppler de arterias uterinas: IP medio', alias: 'doppler uterinas ip pulsatilidad preeclampsia rciu primer trimestre segundo trimestre',
      desc: 'Promedia el índice de pulsatilidad de ambas arterias uterinas y lo compara con el p95 de tu curva de referencia.',
      campos: [N('d', 'IP de la arteria uterina derecha', '', { min: 0.2, max: 5, step: '0.01' }), N('i', 'IP de la arteria uterina izquierda', '', { min: 0.2, max: 5, step: '0.01' }),
        N('p95', 'Percentil 95 de tu curva de referencia para esta edad gestacional', '', { min: 0.2, max: 5, step: '0.01', opcional: true, ph: 'opcional' })],
      calc: (v) => {
        const m = (v.d + v.i) / 2; const hay = Number.isFinite(v.p95);
        let nivel = 'info', titulo = 'IP medio calculado', texto = 'Se mide en ambas arterias y se promedia. Para interpretarlo hay que compararlo con el p95 o el MoM de una curva de referencia según la edad gestacional (por ejemplo Gómez 2008 o la de la FMF): ingresá el p95 para ver la comparación.';
        if (hay) { if (m > v.p95) { nivel = 'warn'; titulo = 'IP medio por encima del p95'; texto = 'Resistencia aumentada: es un factor de riesgo de preeclampsia y de RCIU, pero el Doppler de uterinas por sí solo tiene un valor predictivo bajo (ACOG). Integrarlo con los factores maternos y la presión arterial media; con él, la detección de preeclampsia precoz mejora a cerca de un 70 % (80 % sumando la PAM) con un 10 % de falsos positivos.'; } else { nivel = 'ok'; titulo = 'IP medio dentro del p95'; texto = 'No supera el percentil 95 de la curva usada. Un Doppler normal no descarta preeclampsia: el riesgo se calcula con el cribado combinado.'; } }
        return { principal: { label: 'IP medio', valor: m, unidad: '', dec: 2 }, nivel, titulo, texto, extra: hay ? [['p95 ingresado', String(v.p95).replace('.', ',')]] : [] };
      },
      fuente: 'GAP SEGO del I trimestre (2021): medir ambas arterias uterinas y promediar el IP; tasas de detección de preeclampsia precoz (< 34 sem) con 10 % de falsos positivos: historia materna 58 %, IP de uterinas 70 %, PAM + IP 80 %, PAM + IP + PlGF 89 %. Curvas de referencia: Gómez O et al., Ultrasound Obstet Gynecol 2008;32:128-132. Esta calculadora no incluye una curva propia: usá la de tu servicio.' },

    { id: 'rciu-isuog', area: OB, ico: '📉', nombre: 'RCIU: clasificación (Delphi) y conducta (ISUOG 2020)', alias: 'rciu restriccion crecimiento intrauterino pequeño para edad gestacional peg doppler umbilical ductus venoso cerebro placentaria',
      desc: 'Clasifica un feto pequeño como RCIU precoz, RCIU tardío o PEG y muestra la conducta propuesta por la ISUOG según la edad gestacional.',
      intro: 'Percentiles no customizados. Se asume embarazo único, bien datado y sin anomalías congénitas.',
      campos: [N('sem', 'Edad gestacional', 'sem', { min: 20, max: 41 }), N('dias', 'Días', 'd', { min: 0, max: 6, ph: '0', opcional: true }),
        S('ac', 'Circunferencia abdominal o peso fetal estimado', [['< p3', 'lt3'], ['p3 a menor de p10', '3a10'], ['p10 o más', 'ge10']], { val: true }),
        S('ua', 'Arteria umbilical', [['IP normal', 'n'], ['IP > p95', 'pi'], ['Flujo diastólico ausente (AEDF)', 'aedf'], ['Flujo diastólico reverso (REDF)', 'redf']], { val: true }),
        S('uta', 'IP de arterias uterinas > p95', [['No', 'no'], ['Sí', 'si']], { val: true }),
        S('cpr', 'Relación cerebro-placentaria < p5', [['No', 'no'], ['Sí', 'si']], { val: true }),
        S('cruce', 'Cruce de percentiles de CA o PFE (más de 2 cuartiles)', [['No', 'no'], ['Sí', 'si']], { val: true }),
        S('dv', 'Ductus venoso: onda a', [['Normal o no evaluado', 'n'], ['En la línea de base o por debajo', 'low']], { val: true }),
        N('stv', 'Variación a corto plazo (STV) de la cCTG', 'ms', { min: 0, max: 20, step: '0.1', opcional: true, ph: 'opcional' }),
        C('dec', 'Desaceleraciones espontáneas, repetidas y persistentes', 0), C('bpp', 'Perfil biofísico alterado (puntaje 4 o menos)', 0), C('mat', 'Indicación materna de interrupción (preeclampsia grave, HELLP)', 0)],
      calc: (v) => {
        const eg = v.sem + (Number.isFinite(v.dias) ? v.dias : 0) / 7;
        const precoz = eg < 32, chico = v.ac !== 'ge10', uaAnormal = v.ua !== 'n';
        let rciu; const criterios = [];
        if (precoz) {
          if (v.ac === 'lt3') criterios.push('CA/PFE < p3');
          if (v.ua === 'aedf' || v.ua === 'redf') criterios.push('flujo diastólico ausente o reverso en la arteria umbilical');
          if (chico && (v.uta === 'si' || v.ua === 'pi')) criterios.push('CA/PFE < p10 con IP de uterinas y/o umbilical > p95');
          rciu = criterios.length > 0;
        } else {
          if (v.ac === 'lt3') criterios.push('CA/PFE < p3');
          const dos = []; if (chico) dos.push('CA/PFE < p10'); if (v.cruce === 'si') dos.push('cruce de percentiles'); if (v.cpr === 'si' || uaAnormal) dos.push('CPR < p5 o IP umbilical > p95');
          if (dos.length >= 2) criterios.push('al menos dos de tres: ' + dos.join(' + '));
          rciu = criterios.length > 0;
        }
        const e = Math.floor(eg), d = Math.round((eg - e) * 7);
        const egTxt = e + '+' + d + ' sem';
        let titulo, nivel, texto; const extra = [['Edad gestacional', egTxt], ['Clasificación', precoz ? 'Precoz (< 32 sem)' : 'Tardía (≥ 32 sem)']];
        if (rciu) {
          nivel = (v.ua === 'aedf' || v.ua === 'redf' || v.dv === 'low') ? 'bad' : 'warn';
          titulo = precoz ? 'RCIU precoz (< 32 semanas)' : 'RCIU tardío (≥ 32 semanas)';
          texto = 'Cumple criterios del consenso Delphi: ' + criterios.join('; ') + '.';
          // conducta
          const banda = FGR_RECS.find((r) => eg >= r[0] && eg < r[1]) || FGR_RECS[FGR_RECS.length - 1];
          extra.push(['Conducta por edad gestacional (ISUOG)', banda[2]]);
          const s = v.stv, indic = [];
          if (v.dec) indic.push('desaceleraciones espontáneas repetidas'); if (v.bpp) indic.push('perfil biofísico ≤ 4'); if (v.mat) indic.push('indicación materna');
          if (eg >= 26 && eg < 32 && v.dv === 'low') indic.push('ductus venoso en la línea de base o por debajo');
          if (eg >= 26 && eg < 29 && s < 2.6) indic.push('STV < 2,6 ms'); if (eg >= 29 && eg < 32 && s < 3.0) indic.push('STV < 3,0 ms'); if (eg >= 32 && eg < 34 && s < 3.5) indic.push('STV < 3,5 ms'); if (eg >= 34 && s < 4.5) indic.push('STV < 4,5 ms');
          if (eg >= 30 && v.ua === 'redf') indic.push('flujo diastólico reverso en la arteria umbilical');
          if (eg >= 32 && v.ua === 'aedf') indic.push('flujo diastólico ausente en la arteria umbilical');
          if (eg >= 36 && eg < 38 && (v.ua === 'pi' || v.ac === 'lt3')) indic.push('IP umbilical > p95 o CA/PFE < p3');
          if (eg >= 38 && (v.cpr === 'si' || uaAnormal || v.ac === 'lt3')) indic.push('redistribución cerebral o rasgo de RCIU');
          if (indic.length) { nivel = 'bad'; extra.push(['Criterios de interrupción presentes', indic.join('; ')]); texto += ' Hay criterios para considerar la interrupción del embarazo.'; }
          else texto += ' Sin criterios de interrupción por ahora: seguir la vigilancia.';
          extra.push(['Vigilancia', (v.ua === 'aedf' || v.ua === 'redf') ? 'Con flujo diastólico ausente o reverso: controlar cada 2 a 3 días salvo que ya esté indicada la interrupción.' : 'Seguimiento por Doppler y cCTG según el protocolo del servicio; confirmar a las 24 h los cambios del Doppler cerebral.']);
          if (eg < 34) extra.push(['Corticoides', 'Se recomiendan si la interrupción está prevista antes de las 34+0 semanas (grado B).']);
        } else if (chico) {
          nivel = 'info'; titulo = 'Pequeño para la edad gestacional (PEG)';
          texto = 'CA/PFE < p10 sin criterios de RCIU. Evaluar Doppler fetal y de uterinas al diagnóstico; crecimiento cada 2 semanas y Doppler (IP umbilical, ACM, CPR) semanal en el PEG tardío. Programar el parto desde las 38+0 y sin pasar las 39+0 semanas (grado A).';
        } else {
          nivel = 'ok'; titulo = 'Sin criterios de RCIU ni de PEG'; texto = 'CA/PFE en p10 o más y sin otros criterios del consenso. Continuar el control habitual.';
        }
        return { principal: { label: 'Edad gestacional', valor: egTxt, unidad: '' }, nivel, titulo, texto, extra };
      },
      fuente: 'ISUOG Practice Guidelines: diagnosis and management of small-for-gestational-age fetus and fetal growth restriction. Ultrasound Obstet Gynecol 2020;56:298-312 (tabla 2 y figura 2, basadas en el consenso Delphi de Gordijn SJ et al., Ultrasound Obstet Gynecol 2016;48:333-339 y el estudio TRUFFLE). Herramienta de apoyo: la decisión de interrumpir es del equipo tratante.' },
  ]);
})();
