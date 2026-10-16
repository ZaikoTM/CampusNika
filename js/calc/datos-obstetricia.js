// Calculadoras de Obstetricia y Ginecología. Cada una cita su fundamento.
(function () {
  const { N, C, S, D, num } = NikaCalcs;
  const DIA = 86400000;
  const hoy = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); };
  const dif = (a, b) => Math.round((a - b) / DIA);
  const fecha = (d) => d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const sem = (dias) => Math.floor(dias / 7) + ' sem + ' + (dias % 7) + ' d';
  const suma = (d, n) => new Date(d.getTime() + n * DIA);
  const trimestre = (dias) => (dias < 14 * 7 ? '1.er trimestre' : dias < 28 * 7 ? '2.º trimestre' : '3.er trimestre');

  NikaCalcs.agregar([
    { id: 'eg-fum', area: 'obstetricia', ico: '📅', nombre: 'Edad gestacional y FPP por FUM', alias: 'fecha probable de parto naegele fum semanas embarazo',
      desc: 'Edad gestacional hoy y fecha probable de parto desde la fecha de última menstruación.',
      campos: [D('fum', 'Fecha de última menstruación (FUM)'), D('ref', 'Calcular a la fecha', { hoy: true }), N('ciclo', 'Duración del ciclo', 'días', { opcional: true, ph: '28', min: 20, max: 45 })],
      calc: (v) => {
        const ciclo = Number.isFinite(v.ciclo) ? v.ciclo : 28; const ref = v.ref || hoy();
        const dias = dif(ref, v.fum) - (ciclo - 28); if (dias < 0) return null;
        const fpp = suma(v.fum, 280 + (ciclo - 28));
        return { principal: { label: 'Edad gestacional', valor: sem(dias), unidad: '' }, nivel: dias > 294 ? 'bad' : dias >= 259 ? 'ok' : 'info',
          titulo: trimestre(dias), texto: dias > 294 ? 'Más de 42 semanas: embarazo postérmino. Requiere conducta activa según protocolo.' : dias >= 259 ? 'A término (37 semanas o más).' : 'Pretérmino (menos de 37 semanas).',
          extra: [['Fecha probable de parto (FPP)', fecha(fpp)], ['Días restantes', Math.max(0, dif(fpp, ref)) + ' días'], ['Semanas cumplidas', Math.floor(dias / 7) + ' ('+ dias + ' días)']] };
      }, fuente: 'Regla de Naegele (FUM + 280 días, ajustada si el ciclo no es de 28 días). Ministerio de Salud de la Nación, Guía de práctica clínica de control prenatal; ACOG Committee Opinion 700 (2017).', nota: 'Confiable solo si la FUM es segura y el ciclo regular; si no, datar por ecografía precoz.' },

    { id: 'eg-eco', area: 'obstetricia', ico: '🖥️', nombre: 'Edad gestacional por ecografía', alias: 'longitud craneocaudal LCC fpp ecografia',
      desc: 'Reconstruye la edad gestacional de hoy y la FPP a partir de una ecografía previa.',
      campos: [D('fecha', 'Fecha de la ecografía'), N('sem', 'Semanas al momento de la ecografía', 'sem', { min: 5, max: 42 }), N('dias', 'Días', 'd', { min: 0, max: 6, ph: '0' }), D('ref', 'Calcular a la fecha', { hoy: true })],
      calc: (v) => {
        const d0 = v.sem * 7 + (Number.isFinite(v.dias) ? v.dias : 0); const ref = v.ref || hoy(); const dias = d0 + dif(ref, v.fecha); if (dias < 0) return null;
        const fpp = suma(v.fecha, 280 - d0);
        return { principal: { label: 'Edad gestacional', valor: sem(dias), unidad: '' }, nivel: 'info', titulo: trimestre(dias),
          extra: [['Fecha probable de parto', fecha(fpp)], ['Fecha de última menstruación equivalente', fecha(suma(fpp, -280))]] };
      }, fuente: 'Datación ecográfica: ACOG Committee Opinion 700 (2017) y FIGO. La longitud craneocaudal de 1.er trimestre (hasta 13+6 sem) es el método más preciso.' },

    { id: 'eg-discrepancia', area: 'obstetricia', ico: '⚖️', nombre: '¿Corregir la FPP? FUM vs ecografía', alias: 'redatar discrepancia fum eco',
      desc: 'Indica si la diferencia entre la FUM y la ecografía obliga a redatar el embarazo.',
      campos: [N('sem', 'Edad gestacional por ecografía (semanas)', 'sem', { min: 5, max: 41 }), N('dias', 'Días', 'd', { min: 0, max: 6, ph: '0' }), N('dif', 'Diferencia entre FUM y ecografía', 'días', { min: 0, max: 60 })],
      calc: (v) => {
        const eg = v.sem + ((Number.isFinite(v.dias) ? v.dias : 0) / 7);
        const lim = eg < 9 ? 5 : eg < 16 ? 7 : eg < 22 ? 10 : eg < 28 ? 14 : 21;
        const re = v.dif > lim;
        return { principal: { label: 'Umbral de discrepancia', valor: lim, unidad: ' días', dec: 0 }, nivel: re ? 'warn' : 'ok', titulo: re ? 'Redatar con la ecografía' : 'Mantener la FPP por FUM',
          texto: re ? 'La diferencia supera el umbral: corresponde usar la edad gestacional ecográfica para la FPP.' : 'La diferencia está dentro del margen: se conserva la datación por FUM.' };
      }, fuente: 'ACOG Committee Opinion 700 «Methods for Estimating the Due Date» (2017): umbrales de 5 días (<9 sem), 7 días (9 a 15+6), 10 días (16 a 21+6), 14 días (22 a 27+6) y 21 días (≥28).' },

    { id: 'ovulacion', area: 'obstetricia', ico: '🌸', nombre: 'Ovulación y ventana fértil', alias: 'ciclo menstrual dias fertiles',
      desc: 'Estima el día de ovulación y los días fértiles del ciclo.',
      campos: [D('fum', 'Primer día de la última menstruación'), N('ciclo', 'Duración habitual del ciclo', 'días', { min: 21, max: 40, ph: '28' })],
      calc: (v) => { const ov = suma(v.fum, v.ciclo - 14);
        return { principal: { label: 'Ovulación estimada', valor: fecha(ov), unidad: '' }, nivel: 'info', titulo: 'Ventana fértil', texto: 'Del ' + fecha(suma(ov, -5)) + ' al ' + fecha(suma(ov, 1)) + '.', extra: [['Próxima menstruación', fecha(suma(v.fum, v.ciclo))]] };
      }, fuente: 'Fase lútea de ~14 días y ventana fértil de 6 días (5 días previos y el día de la ovulación). Wilcox et al., N Engl J Med 1995.', nota: 'Es una estimación; los ciclos irregulares requieren seguimiento (temperatura basal, LH o ecografía).' },

    { id: 'bishop', area: 'obstetricia', ico: '🎚️', nombre: 'Índice de Bishop', alias: 'inducción parto cuello favorable',
      desc: 'Valora la madurez del cuello para predecir el éxito de la inducción del parto.', maximo: 13,
      campos: [S('dil', 'Dilatación (cm)', [['Cerrado', 0], ['1 a 2 cm', 1], ['3 a 4 cm', 2], ['5 cm o más', 3]]), S('bor', 'Borramiento (%)', [['0 a 30', 0], ['40 a 50', 1], ['60 a 70', 2], ['80 o más', 3]]),
        S('alt', 'Altura de la presentación', [['-3', 0], ['-2', 1], ['-1 / 0', 2], ['+1 / +2', 3]]), S('con', 'Consistencia', [['Firme', 0], ['Intermedia', 1], ['Blanda', 2]]), S('pos', 'Posición del cuello', [['Posterior', 0], ['Intermedia', 1], ['Anterior', 2]])],
      rangos: [{ max: 5, nivel: 'warn', titulo: 'Cuello desfavorable', texto: 'Menor probabilidad de parto vaginal con inducción: considerar maduración cervical previa.' }, { max: 7, nivel: 'info', titulo: 'Cuello intermedio', texto: 'Probabilidad intermedia de éxito de la inducción.' }, { max: 13, nivel: 'ok', titulo: 'Cuello favorable', texto: 'Alta probabilidad de parto vaginal tras inducción (≥8 puntos).' }],
      fuente: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol 1964;24:266. ACOG Practice Bulletin 107, Induction of Labor.' },

    { id: 'apgar', area: 'pediatria', ico: '👶', nombre: 'Puntaje de Apgar', alias: 'recién nacido neonato',
      desc: 'Valoración del recién nacido al 1.er y 5.º minuto.', maximo: 10,
      campos: [S('fc', 'Frecuencia cardíaca', [['Ausente', 0], ['Menos de 100 lpm', 1], ['100 lpm o más', 2]]), S('resp', 'Esfuerzo respiratorio', [['Ausente', 0], ['Lento / irregular', 1], ['Llanto fuerte', 2]]),
        S('tono', 'Tono muscular', [['Flácido', 0], ['Alguna flexión', 1], ['Movimiento activo', 2]]), S('refl', 'Respuesta a estímulos', [['Sin respuesta', 0], ['Mueca', 1], ['Llanto / tos', 2]]), S('color', 'Color', [['Pálido / cianótico', 0], ['Cuerpo rosado, extremidades cianóticas', 1], ['Totalmente rosado', 2]])],
      rangos: [{ max: 3, nivel: 'bad', titulo: 'Depresión severa', texto: 'Requiere reanimación inmediata según el algoritmo neonatal.' }, { max: 6, nivel: 'warn', titulo: 'Depresión moderada', texto: 'Estimulación y soporte; reevaluar.' }, { max: 10, nivel: 'ok', titulo: 'Normal', texto: 'Recién nacido en buenas condiciones (7 a 10).' }],
      fuente: 'Apgar V. Anesth Analg 1953;32:260. AAP/ACOG Committee Opinion 644 (2015). Sociedad Argentina de Pediatría, Reanimación neonatal.', nota: 'No debe retrasar la reanimación: se asigna después de iniciar las maniobras necesarias.' },

    { id: 'ganancia-peso', area: 'obstetricia', ico: '⚖️', nombre: 'Ganancia de peso recomendada en el embarazo', alias: 'iom imc pregestacional peso embarazada',
      desc: 'Rango de aumento de peso total según el IMC pregestacional.',
      campos: [N('peso', 'Peso pregestacional', 'kg', { min: 30, max: 250 }), N('talla', 'Talla', 'cm', { min: 120, max: 220 }), C('gem', 'Embarazo múltiple (gemelar)', 0, {})],
      calc: (v) => { const imc = v.peso / Math.pow(v.talla / 100, 2); let r, c;
        if (v.gem) { r = imc < 18.5 ? 'Sin recomendación específica' : imc < 25 ? '16,8 a 24,5 kg' : imc < 30 ? '14,1 a 22,7 kg' : '11,3 a 19,1 kg'; c = 'Gemelar (IOM 2009, rangos provisionales)'; }
        else { r = imc < 18.5 ? '12,5 a 18 kg' : imc < 25 ? '11,5 a 16 kg' : imc < 30 ? '7 a 11,5 kg' : '5 a 9 kg'; c = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Peso normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad'; }
        return { principal: { label: 'Ganancia total recomendada', valor: r, unidad: '' }, nivel: 'info', titulo: 'IMC pregestacional ' + num(imc, 1) + ' · ' + c, extra: [['Ritmo en 2.º y 3.er trimestre', imc < 18.5 ? '≈ 0,5 kg/semana' : imc < 25 ? '≈ 0,4 kg/semana' : imc < 30 ? '≈ 0,3 kg/semana' : '≈ 0,2 kg/semana']] }; },
      fuente: 'Institute of Medicine (IOM, 2009), «Weight Gain During Pregnancy». En Argentina, el control prenatal usa además la curva de Atalah (Ministerio de Salud, Guía de control prenatal).' },

    { id: 'eg-corregida', area: 'pediatria', ico: '🍼', nombre: 'Edad corregida del prematuro', alias: 'prematuro edad gestacional corregida',
      desc: 'Edad cronológica corregida por prematurez (hasta los 2 años).',
      campos: [N('egn', 'Edad gestacional al nacer', 'semanas', { min: 22, max: 41 }), N('meses', 'Edad cronológica actual', 'meses', { min: 0, max: 48, step: 0.1 })],
      calc: (v) => { const falta = Math.max(0, 40 - v.egn); const corr = v.meses - (falta * 7 / 30.4);
        return { principal: { label: 'Edad corregida', valor: Math.max(0, corr), unidad: ' meses' }, nivel: 'info', titulo: 'Prematurez de ' + falta + ' semanas', texto: v.meses > 24 ? 'Después de los 24 meses habitualmente ya no se corrige.' : 'Usar la edad corregida para evaluar crecimiento y desarrollo.' }; },
      fuente: 'Edad corregida = edad cronológica − (40 − EG al nacer). Sociedad Argentina de Pediatría, seguimiento del prematuro; AAP.' },

    { id: 'indice-shock', area: 'obstetricia', ico: '🩸', nombre: 'Índice de shock', alias: 'frecuencia cardiaca presion sistolica hemorragia',
      desc: 'Frecuencia cardíaca / presión sistólica: alerta temprana de hipovolemia (incluida la hemorragia obstétrica).',
      campos: [N('fc', 'Frecuencia cardíaca', 'lpm', { min: 20, max: 250 }), N('pas', 'Presión arterial sistólica', 'mmHg', { min: 30, max: 260 })],
      calc: (v) => { const i = v.fc / v.pas; const n = i < 0.7 ? 'ok' : i < 0.9 ? 'info' : i < 1.4 ? 'warn' : 'bad';
        return { principal: { label: 'Índice de shock', valor: i, dec: 2, unidad: '' }, nivel: n, titulo: i < 0.7 ? 'Normal (0,5 a 0,7)' : i < 0.9 ? 'Zona de alerta' : i < 1.4 ? 'Hipovolemia significativa probable' : 'Shock grave',
          texto: i >= 0.9 ? 'En obstetricia, un valor ≥ 0,9 se asocia a hemorragia grave y mayor necesidad de transfusión: activar el protocolo de emergencia obstétrica.' : 'Reevaluar según la clínica y repetir las mediciones.' }; },
      fuente: 'Allgöwer M, Burri C, 1967. Umbral obstétrico ≥ 0,9: Le Bas A et al., Int J Obstet Anesth 2014; FIGO y FASGO, Hemorragia posparto.', nota: 'No reemplaza el juicio clínico: puede subestimar el compromiso con betabloqueantes o embarazo normal avanzado.' },

    { id: 'hellp-tennessee', area: 'obstetricia', ico: '🧫', nombre: 'Criterios de HELLP (Tennessee)', alias: 'preeclampsia hemolisis plaquetas hepaticas',
      desc: 'Confirma síndrome HELLP completo con tres alteraciones de laboratorio.', maximo: 3,
      campos: [C('ldh', 'LDH ≥ 600 UI/L (hemólisis)', 1), C('ast', 'AST ≥ 70 UI/L (enzimas hepáticas)', 1), C('plq', 'Plaquetas < 100.000/mm³', 1)],
      rangos: [{ max: 0, nivel: 'ok', titulo: 'Sin criterios de HELLP', texto: 'No cumple ningún criterio de laboratorio. Seguir el control habitual de la preeclampsia.' }, { max: 2, nivel: 'warn', titulo: 'HELLP incompleto (parcial)', texto: 'Se sospecha HELLP parcial: control estrecho de laboratorio y de la presión arterial; evaluar la gravedad de la preeclampsia.' }, { max: 3, nivel: 'bad', titulo: 'HELLP completo', texto: 'Cumple los tres criterios de Tennessee: manejo en centro de alta complejidad y evaluación de la interrupción del embarazo.' }],
      fuente: 'Sibai BM. Obstet Gynecol 2004;103:981 (criterios de Tennessee). ACOG Practice Bulletin 222 (2020); FASGO, Trastornos hipertensivos del embarazo.' },
  ]);
})();
