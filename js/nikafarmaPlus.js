// js/nikafarmaPlus.js
// NikaFarma Potenciado — soporte de guardia y calculadoras (se suma a nikafarma.html sin tocar su motor):
//   1) Buscador "direct-to-treatment": tarjeta rápida al tipear una patología/síndrome.
//   2) Scores y calculadoras: CURB-65 / CRB-65, qSOFA, Cockcroft-Gault, Wells TEP y Wells TVP.
//   3) Modo Emergencias: al activar "🚨 Guardia" aparecen tarjetas de primera línea (PCR, anafilaxia, ACV, SCA, CAD, estatus).
//   4) Calculadora pediátrica por peso (volumen en mL y tomas).
//
// AVISO: contenido de apoyo para estudio y consulta rápida. Las dosis son las de uso habitual en adultos/niños
// con función renal normal; verificar siempre con el protocolo institucional, la guía local (SADI, Ministerio de Salud)
// y el criterio del médico tratante antes de indicar.

(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  // ======================================================================
  // 1) DIRECT-TO-TREATMENT
  // ======================================================================
  const SINDROMES = [
    { id: 'nac', nombre: 'Neumonía adquirida en la comunidad (NAC)', alias: ['nac', 'neumonia', 'neumonia comunitaria', 'neumonia adquirida en la comunidad'],
      primera: 'Ambulatoria sin comorbilidades: amoxicilina 1 g VO c/8 h. Con comorbilidades: amoxicilina-clavulánico 875/125 mg VO c/12 h + azitromicina 500 mg VO/día. Internación en sala: ceftriaxona 1–2 g IV c/24 h + azitromicina 500 mg/día (o claritromicina 500 mg c/12 h).',
      alergia: 'Alergia a penicilina: doxiciclina 100 mg VO c/12 h (ambulatoria) o levofloxacina 750 mg VO/IV c/24 h (monoterapia respiratoria).',
      dosis: 'Vía oral (ambulatoria) o IV (internación) · frecuencia según esquema.', duracion: '5–7 días (mínimo 5 y afebril 48–72 h). Internación con criterios de gravedad: 7–10 días.',
      nota: 'Usar CURB-65/CRB-65 para decidir internación. Sospechar aspiración, Legionella o Pseudomonas según el contexto.' },
    { id: 'cistitis', nombre: 'ITU baja / cistitis no complicada', alias: ['itu', 'cistitis', 'infeccion urinaria', 'itu baja', 'infeccion urinaria baja'],
      primera: 'Nitrofurantoína 100 mg VO c/6 h (o macrocristales 100 mg c/12 h) o fosfomicina trometamol 3 g VO dosis única.',
      alergia: 'No requiere evitar β-lactámicos por alergia: la primera línea no lo es. Alternativa: TMP-SMX 160/800 mg VO c/12 h (si la resistencia local es <20 %) o cefalexina 500 mg c/6 h.',
      dosis: 'Vía oral. Nitrofurantoína contraindicada con ClCr <30 mL/min.', duracion: 'Nitrofurantoína 5 días · fosfomicina dosis única · TMP-SMX 3 días.',
      nota: 'Embarazada: urocultivo y tratamiento dirigido (evitar TMP-SMX y quinolonas). Varón o recurrente: tratar como complicada.' },
    { id: 'pielonefritis', nombre: 'Pielonefritis aguda', alias: ['pielonefritis', 'itu alta', 'itu complicada', 'infeccion urinaria alta'],
      primera: 'Ambulatoria: ciprofloxacina 500 mg VO c/12 h. Internación: ceftriaxona 1–2 g IV c/24 h.',
      alergia: 'Alergia a β-lactámicos: ciprofloxacina 400 mg IV c/12 h u oral 500 mg c/12 h; alternativa gentamicina 5 mg/kg/día IV.',
      dosis: 'Oral o IV según tolerancia y gravedad. Tomar urocultivo antes de iniciar.', duracion: '7 días con quinolona · 10–14 días con β-lactámico o TMP-SMX.',
      nota: 'Sospechar obstrucción/absceso si no mejora en 48–72 h (ecografía o TC).' },
    { id: 'celulitis', nombre: 'Celulitis / erisipela', alias: ['celulitis', 'erisipela', 'infeccion de piel', 'partes blandas'],
      primera: 'No purulenta leve: cefalexina 500 mg VO c/6 h. Moderada/grave: cefazolina 1–2 g IV c/8 h.',
      alergia: 'Alergia a penicilina/cefalosporinas: clindamicina 300–450 mg VO c/8 h (o 600 mg IV c/8 h).',
      dosis: 'Oral si es leve y sin toxicidad sistémica; IV si es extensa, febril o de rápida progresión.', duracion: '5–7 días (extender si la mejoría es lenta).',
      nota: 'Si hay pus, absceso o sospecha de SAMR: drenaje + TMP-SMX 160/800 c/12 h o doxiciclina 100 mg c/12 h; grave: vancomicina IV.' },
    { id: 'faringitis', nombre: 'Faringitis estreptocócica', alias: ['faringitis', 'amigdalitis', 'angina', 'faringoamigdalitis', 'estreptococo', 'odinofagia'],
      primera: 'Penicilina G benzatínica 1.2 millones UI IM dosis única, o amoxicilina 500 mg VO c/12 h (o 1 g/día).',
      alergia: 'Alergia a penicilina: azitromicina 500 mg el día 1 y 250 mg/día por 4 días, o clindamicina 300 mg VO c/8 h.',
      dosis: 'Vía oral (o IM en dosis única).', duracion: '10 días con amoxicilina/penicilina V · dosis única con benzatínica.',
      nota: 'Confirmar con criterios de Centor/McIsaac o test rápido antes de tratar.' },
    { id: 'otitis', nombre: 'Otitis media aguda', alias: ['otitis', 'otitis media', 'oma', 'dolor de oido'],
      primera: 'Amoxicilina 500 mg VO c/8 h en adultos (niños: 80–90 mg/kg/día en 2 tomas).',
      alergia: 'Alergia leve: cefuroxima 500 mg c/12 h. Alergia grave: azitromicina 500 mg el día 1 y luego 250 mg/día.',
      dosis: 'Vía oral.', duracion: '5–7 días (niños <2 años: 10 días).',
      nota: 'En niños >2 años con síntomas leves se puede observar 48–72 h. Amoxicilina-clavulánico si falla el tratamiento.' },
    { id: 'sinusitis', nombre: 'Sinusitis bacteriana aguda', alias: ['sinusitis', 'rinosinusitis'],
      primera: 'Amoxicilina-clavulánico 875/125 mg VO c/12 h.',
      alergia: 'Alergia a penicilina: doxiciclina 100 mg VO c/12 h, o levofloxacina 500–750 mg/día.',
      dosis: 'Vía oral.', duracion: '5–7 días.',
      nota: 'Tratar solo si dura >10 días, empeora tras mejoría inicial o hay fiebre alta y dolor facial intenso.' },
    { id: 'meningitis', nombre: 'Meningitis bacteriana aguda (adulto)', alias: ['meningitis', 'meningoencefalitis'],
      primera: 'Ceftriaxona 2 g IV c/12 h + vancomicina 15–20 mg/kg c/8–12 h + dexametasona 10 mg IV c/6 h (antes o con la 1ª dosis). Agregar ampicilina 2 g IV c/4 h si >50 años, inmunosupresión o embarazo.',
      alergia: 'Alergia grave a β-lactámicos: consultar Infectología; alternativas: meropenem (si la reacción no fue grave) o cloranfenicol/TMP-SMX + vancomicina.',
      dosis: 'Vía IV. No demorar el antibiótico por la punción lumbar ni por la TC.', duracion: '7–14 días según germen (neumococo 10–14 d · meningococo 7 d · Listeria 21 d).',
      nota: 'Emergencia: hemocultivos, antibiótico dentro de la primera hora y quimioprofilaxis de contactos si es meningococo.' },
    { id: 'epi', nombre: 'Enfermedad pélvica inflamatoria (EPI)', alias: ['epi', 'enfermedad pelvica inflamatoria', 'salpingitis', 'anexitis'],
      primera: 'Ceftriaxona 500 mg IM dosis única + doxiciclina 100 mg VO c/12 h + metronidazol 500 mg VO c/12 h.',
      alergia: 'Alergia a cefalosporinas: consultar Ginecología/Infectología (gentamicina + clindamicina en internación).',
      dosis: 'Ambulatoria si es leve/moderada. Internación si hay absceso, embarazo o falla del tratamiento oral.', duracion: '14 días.',
      nota: 'Tratar a la pareja y descartar embarazo. Estudiar clamidia y gonococo.' },
  ];

  function buscarSindrome(q) {
    const n = norm(q);
    if (n.length < 2) return null;
    return SINDROMES.find((s) => s.alias.some((a) => a === n || (n.length >= 3 && a.startsWith(n)) || (' ' + n + ' ').includes(' ' + a + ' ')));
  }

  function renderQuick(q) {
    const box = $('#nfQuick');
    if (!box) return;
    const s = buscarSindrome(q);
    if (!s) { box.innerHTML = ''; box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML = `
      <div class="nfp-quick">
        <div class="nfp-quick-h"><span class="nfp-tag">⚡ Tratamiento rápido</span><h3>${esc(s.nombre)}</h3></div>
        <div class="nfp-q-grid">
          <div class="nfp-q nfp-q1"><b>✅ 1ª línea</b><p>${esc(s.primera)}</p></div>
          <div class="nfp-q nfp-q2"><b>🚫 Alternativa por alergia</b><p>${esc(s.alergia)}</p></div>
          <div class="nfp-q"><b>💉 Dosis · vía · frecuencia</b><p>${esc(s.dosis)}</p></div>
          <div class="nfp-q"><b>⏳ Duración habitual</b><p>${esc(s.duracion)}</p></div>
        </div>
        <p class="nfp-note">📝 ${esc(s.nota)}</p>
        <p class="nfp-disc">Orientativo: ajustar por función renal, alergias, embarazo y epidemiología local.</p>
      </div>`;
  }

  // ======================================================================
  // 2) SCORES Y CALCULADORAS
  // ======================================================================
  const CHECK = (id, txt, pts) => `<label class="nfp-chk"><input type="checkbox" data-pts="${pts}" data-g="${id}"><span>${txt}</span><em>${pts > 0 ? '+' : ''}${pts}</em></label>`;

  const SCORES = {
    curb: {
      titulo: 'CURB-65 / CRB-65', sub: 'Decisión de internación en neumonía',
      html: () => `
        <label class="nfp-sw"><input type="checkbox" id="curbSinUrea"> Usar CRB-65 (sin urea, para consultorio)</label>
        ${CHECK('curb', 'Confusión de reciente comienzo', 1)}
        <div id="curbUreaRow">${CHECK('curb', 'Urea &gt; 42 mg/dL (BUN &gt; 19 mg/dL)', 1)}</div>
        ${CHECK('curb', 'Frecuencia respiratoria ≥ 30 /min', 1)}
        ${CHECK('curb', 'PA sistólica &lt; 90 o diastólica ≤ 60 mmHg', 1)}
        ${CHECK('curb', 'Edad ≥ 65 años', 1)}
        <div class="nfp-res" id="curbRes"></div>`,
      bind: (root) => {
        const calc = () => {
          const sin = $('#curbSinUrea', root).checked;
          $('#curbUreaRow', root).style.display = sin ? 'none' : '';
          let p = 0; root.querySelectorAll('input[data-g="curb"]').forEach((c) => { if (c.checked && !(sin && c.closest('#curbUreaRow'))) p += 1; });
          let nivel, txt, cls;
          if (!sin) {
            if (p <= 1) { nivel = 'Riesgo bajo'; txt = 'Mortalidad 30 d ≈ 1–3 %. Tratamiento ambulatorio.'; cls = 'ok'; }
            else if (p === 2) { nivel = 'Riesgo intermedio'; txt = 'Mortalidad ≈ 9 %. Considerar internación breve o seguimiento estrecho.'; cls = 'mid'; }
            else { nivel = 'Riesgo alto'; txt = 'Mortalidad ≈ 15–40 %. Internación; evaluar UTI si puntaje 4–5.'; cls = 'bad'; }
          } else {
            if (p === 0) { nivel = 'Riesgo bajo'; txt = 'Mortalidad < 1 %. Ambulatorio.'; cls = 'ok'; }
            else if (p <= 2) { nivel = 'Riesgo intermedio'; txt = 'Considerar derivación/internación (mortalidad 1–10 %).'; cls = 'mid'; }
            else { nivel = 'Riesgo alto'; txt = 'Derivar urgente a internación.'; cls = 'bad'; }
          }
          $('#curbRes', root).className = 'nfp-res ' + cls;
          $('#curbRes', root).innerHTML = `<b>${sin ? 'CRB-65' : 'CURB-65'}: ${p} punto${p === 1 ? '' : 's'} — ${nivel}</b><span>${txt}</span>`;
        };
        root.addEventListener('change', calc); calc();
      },
    },
    qsofa: {
      titulo: 'qSOFA', sub: 'Screening rápido de sepsis',
      html: () => `
        ${CHECK('qs', 'Frecuencia respiratoria ≥ 22 /min', 1)}
        ${CHECK('qs', 'Alteración del estado mental (Glasgow &lt; 15)', 1)}
        ${CHECK('qs', 'PA sistólica ≤ 100 mmHg', 1)}
        <div class="nfp-res" id="qsRes"></div>`,
      bind: (root) => {
        const calc = () => {
          let p = 0; root.querySelectorAll('input[data-g="qs"]').forEach((c) => { if (c.checked) p++; });
          const alto = p >= 2;
          $('#qsRes', root).className = 'nfp-res ' + (alto ? 'bad' : (p === 1 ? 'mid' : 'ok'));
          $('#qsRes', root).innerHTML = `<b>qSOFA: ${p}/3 — ${alto ? 'Alto riesgo' : 'Riesgo bajo'}</b><span>${alto ? 'Sospecha de sepsis con mala evolución: lactato, hemocultivos, antibiótico en la primera hora, fluidos y evaluar UTI.' : 'No descarta sepsis: si hay foco infeccioso, seguir con SOFA completo y lactato.'}</span>`;
        };
        root.addEventListener('change', calc); calc();
      },
    },
    cg: {
      titulo: 'Clearance de creatinina', sub: 'Cockcroft-Gault · ajuste de antibióticos',
      html: () => `
        <div class="nfp-form">
          <div><label>Sexo</label><select id="cgSex"><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
          <div><label>Edad (años)</label><input id="cgAge" type="number" min="1" max="120" inputmode="numeric"></div>
          <div><label>Peso (kg)</label><input id="cgW" type="number" min="1" max="400" step="0.1" inputmode="decimal"></div>
          <div><label>Creatinina (mg/dL)</label><input id="cgCr" type="number" min="0.1" max="20" step="0.01" inputmode="decimal"></div>
        </div>
        <div class="nfp-res" id="cgRes"><span>Completá los datos para calcular.</span></div>`,
      bind: (root) => {
        const calc = () => {
          const age = parseFloat($('#cgAge', root).value), w = parseFloat($('#cgW', root).value), cr = parseFloat($('#cgCr', root).value);
          const box = $('#cgRes', root);
          if (!(age > 0 && w > 0 && cr > 0)) { box.className = 'nfp-res'; box.innerHTML = '<span>Completá los datos para calcular.</span>'; return; }
          let cl = ((140 - age) * w) / (72 * cr);
          if ($('#cgSex', root).value === 'F') cl *= 0.85;
          cl = Math.round(cl * 10) / 10;
          let est, txt, cls;
          if (cl >= 90) { est = 'Normal'; txt = 'Sin ajuste de dosis.'; cls = 'ok'; }
          else if (cl >= 60) { est = 'Disfunción leve'; txt = 'Sin ajuste en la mayoría de los antibióticos.'; cls = 'ok'; }
          else if (cl >= 30) { est = 'Disfunción moderada'; txt = 'Revisar ajuste: β-lactámicos de amplio espectro, TMP-SMX, quinolonas y aminoglucósidos.'; cls = 'mid'; }
          else if (cl >= 15) { est = 'Disfunción grave'; txt = 'Ajustar dosis o intervalo; evitar nitrofurantoína; cuidado con aminoglucósidos y vancomicina.'; cls = 'bad'; }
          else { est = 'Falla renal'; txt = 'Ajuste estricto (o dosificación en diálisis). Consultar Nefrología/Farmacia.'; cls = 'bad'; }
          box.className = 'nfp-res ' + cls;
          box.innerHTML = `<b>ClCr: ${cl} mL/min — ${est}</b><span>${txt}</span><small>Con obesidad usar peso ajustado; en ancianos o desnutridos la creatinina subestima el deterioro renal.</small>`;
        };
        root.addEventListener('input', calc); root.addEventListener('change', calc);
      },
    },
    wellstep: {
      titulo: 'Wells — TEP', sub: 'Probabilidad de tromboembolismo pulmonar',
      html: () => `
        ${CHECK('wp', 'Signos clínicos de TVP (edema, dolor a la palpación venosa)', 3)}
        ${CHECK('wp', 'TEP es el diagnóstico más probable / no hay otra alternativa más probable', 3)}
        ${CHECK('wp', 'Frecuencia cardíaca &gt; 100 /min', 1.5)}
        ${CHECK('wp', 'Inmovilización ≥ 3 días o cirugía en las últimas 4 semanas', 1.5)}
        ${CHECK('wp', 'TEP o TVP previos', 1.5)}
        ${CHECK('wp', 'Hemoptisis', 1)}
        ${CHECK('wp', 'Cáncer activo (tratamiento en 6 meses o paliativo)', 1)}
        <div class="nfp-res" id="wpRes"></div>`,
      bind: (root) => {
        const calc = () => {
          let p = 0; root.querySelectorAll('input[data-g="wp"]').forEach((c) => { if (c.checked) p += parseFloat(c.dataset.pts); });
          let niv, cls, conducta;
          if (p > 6) { niv = 'Probabilidad ALTA (~65 %)'; cls = 'bad'; conducta = 'Angio-TC pulmonar; iniciar anticoagulación mientras se estudia si no hay contraindicación.'; }
          else if (p >= 2) { niv = 'Probabilidad MODERADA (~16 %)'; cls = 'mid'; conducta = 'Dímero D si la probabilidad es baja/moderada; si es positivo → angio-TC.'; }
          else { niv = 'Probabilidad BAJA (~1–2 %)'; cls = 'ok'; conducta = 'Dímero D (o criterios PERC): si es negativo se descarta el TEP.'; }
          $('#wpRes', root).className = 'nfp-res ' + cls;
          $('#wpRes', root).innerHTML = `<b>Wells TEP: ${p} punto${p === 1 ? '' : 's'} — ${niv}</b><span>${conducta}</span><small>Dicotómico: &gt; 4 = TEP probable · ≤ 4 = improbable.</small>`;
        };
        root.addEventListener('change', calc); calc();
      },
    },
    wellstvp: {
      titulo: 'Wells — TVP', sub: 'Probabilidad de trombosis venosa profunda',
      html: () => `
        ${CHECK('wt', 'Cáncer activo', 1)}
        ${CHECK('wt', 'Parálisis, paresia o inmovilización reciente con yeso de miembro inferior', 1)}
        ${CHECK('wt', 'Reposo en cama &gt; 3 días o cirugía mayor en las últimas 12 semanas', 1)}
        ${CHECK('wt', 'Dolor localizado a lo largo del sistema venoso profundo', 1)}
        ${CHECK('wt', 'Todo el miembro inferior edematizado', 1)}
        ${CHECK('wt', 'Pantorrilla &gt; 3 cm más gruesa que la contralateral', 1)}
        ${CHECK('wt', 'Edema con fóvea (mayor en el miembro sintomático)', 1)}
        ${CHECK('wt', 'Venas superficiales colaterales (no varicosas)', 1)}
        ${CHECK('wt', 'TVP previa documentada', 1)}
        ${CHECK('wt', 'Diagnóstico alternativo al menos tan probable como TVP', -2)}
        <div class="nfp-res" id="wtRes"></div>`,
      bind: (root) => {
        const calc = () => {
          let p = 0; root.querySelectorAll('input[data-g="wt"]').forEach((c) => { if (c.checked) p += parseFloat(c.dataset.pts); });
          let niv, cls, conducta;
          if (p >= 3) { niv = 'Probabilidad ALTA (~75 %)'; cls = 'bad'; conducta = 'Ecografía Doppler de compresión; anticoagular si hay demora o no puede hacerse el estudio.'; }
          else if (p >= 1) { niv = 'Probabilidad MODERADA (~17 %)'; cls = 'mid'; conducta = 'Dímero D de alta sensibilidad; si es positivo → ecografía Doppler.'; }
          else { niv = 'Probabilidad BAJA (~3 %)'; cls = 'ok'; conducta = 'Dímero D: si es negativo se descarta la TVP.'; }
          $('#wtRes', root).className = 'nfp-res ' + cls;
          $('#wtRes', root).innerHTML = `<b>Wells TVP: ${p} punto${Math.abs(p) === 1 ? '' : 's'} — ${niv}</b><span>${conducta}</span><small>Dicotómico: ≥ 2 = TVP probable · &lt; 2 = improbable.</small>`;
        };
        root.addEventListener('change', calc); calc();
      },
    },
  };

  // ======================================================================
  // 3) MODO EMERGENCIAS
  // ======================================================================
  const EMERGENCIAS = [
    { ico: '💔', nombre: 'Paro cardiorrespiratorio (ACLS)', pasos: [
      'RCP de calidad de inmediato: 100–120 compresiones/min, 5–6 cm de profundidad, relación 30:2.',
      'Monitor/desfibrilador: FV/TV sin pulso → descarga (120–200 J bifásico) y reanudar RCP 2 min.',
      'Adrenalina 1 mg IV/IO cada 3–5 min (en ritmos no desfibrilables, lo antes posible).',
      'FV/TVSP refractaria: amiodarona 300 mg IV (luego 150 mg) o lidocaína 1–1,5 mg/kg.',
      'Buscar causas reversibles (5H y 5T); acceso IV/IO; capnografía (objetivo ≥ 10 mmHg).'] },
    { ico: '🐝', nombre: 'Anafilaxia', pasos: [
      'Adrenalina IM 0,5 mg (0,01 mg/kg, máx. 0,5 mg) en cara anterolateral del muslo; repetir cada 5–15 min.',
      'Paciente en decúbito (piernas elevadas), oxígeno de alto flujo, acceso IV.',
      'Cristaloides 1–2 L rápido si hay hipotensión (20 mL/kg en niños).',
      'Broncoespasmo: salbutamol nebulizado. Refractaria: adrenalina en infusión IV.',
      'Adyuvantes (no reemplazan a la adrenalina): difenhidramina 25–50 mg IV + hidrocortisona 200 mg IV. Observar 4–6 h.'] },
    { ico: '🧠', nombre: 'ACV isquémico', pasos: [
      'Activar código ACV: hora de inicio (última vez visto bien), glucemia, escala NIHSS.',
      'TC de cráneo sin contraste inmediata para descartar hemorragia.',
      'Trombólisis IV con alteplase 0,9 mg/kg (máx. 90 mg; 10 % en bolo y el resto en 60 min) hasta 4,5 h del inicio.',
      'PA &lt; 185/110 mmHg antes de trombolizar y &lt; 180/105 después. Sin trombólisis, tratar solo si &gt; 220/120.',
      'Oclusión de gran vaso: derivar a trombectomía. Sin reperfusión y con TC normal: aspirina 160–325 mg.'] },
    { ico: '❤️', nombre: 'Síndrome coronario agudo (SCA)', pasos: [
      'ECG en menos de 10 min; monitor, acceso IV, troponina.',
      'Aspirina 160–325 mg masticada. Oxígeno solo si SatO₂ &lt; 90 %.',
      'Nitroglicerina 0,4 mg SL si no hay hipotensión, infarto de VD ni uso de inhibidores de PDE5.',
      'SCACEST: reperfusión inmediata (angioplastia primaria &lt; 90 min; si no está disponible, fibrinólisis &lt; 30 min).',
      'Anticoagulación (heparina), estatina de alta intensidad y betabloqueante si está estable.'] },
    { ico: '🍬', nombre: 'Cetoacidosis diabética', pasos: [
      'Glucemia, cetonemia, gasometría, ionograma y buscar el desencadenante (infección, omisión de insulina).',
      'Suero fisiológico 15–20 mL/kg en la primera hora (1–1,5 L) y luego según hidratación y natremia.',
      'Potasio ANTES de la insulina: si K⁺ &lt; 3,3 mEq/L reponer y diferir la insulina; si 3,3–5,2 agregar 20–30 mEq/L.',
      'Insulina regular IV en infusión 0,1 U/kg/h; agregar dextrosa 5 % cuando la glucemia sea &lt; 200–250 mg/dL.',
      'Bicarbonato solo si pH &lt; 6,9. Controlar glucemia horaria y ionograma cada 2–4 h.'] },
    { ico: '⚡', nombre: 'Estatus epiléptico', pasos: [
      'Crisis &gt; 5 min: ABC, oxígeno, glucemia, acceso IV, monitor. Tiamina 100 mg si hay sospecha de alcoholismo.',
      '1ª línea (0–5 min): lorazepam 4 mg IV (0,1 mg/kg) repetible una vez, o midazolam 10 mg IM, o diazepam 10 mg IV.',
      '2ª línea (5–20 min): levetiracetam 60 mg/kg IV (máx. 4,5 g), valproato 40 mg/kg IV o fenitoína/fosfenitoína 20 mg/kg.',
      '3ª línea (refractario): intubación y anestésicos en UTI (midazolam, propofol o tiopental) con EEG.',
      'Buscar la causa: tóxica, metabólica, infecciosa, estructural o falta de anticonvulsivante.'] },
  ];

  let vistaEmergencias = true;

  function renderEmergencias() {
    const box = $('#nfEmerg');
    if (!box) return;
    box.innerHTML = `
      <div class="nfp-emerg-h">
        <div><b>🚨 Modo Emergencias — primera línea</b><small>Resumen para actuar; verificar el protocolo de la institución.</small></div>
        <button type="button" class="nfp-btn" id="nfpToggleVista">📋 Ver búsqueda de fármacos</button>
      </div>
      <div class="nfp-emerg-grid">
        ${EMERGENCIAS.map((e) => `
          <article class="nfp-emerg-card" tabindex="0">
            <h4><span>${e.ico}</span> ${e.nombre}</h4>
            <ol>${e.pasos.map((p) => `<li>${p}</li>`).join('')}</ol>
          </article>`).join('')}
      </div>`;
    $('#nfpToggleVista').onclick = () => { vistaEmergencias = false; sincronizarGuardia(); };
  }

  function sincronizarGuardia() {
    const on = document.body.classList.contains('nf-guardia');
    const emerg = $('#nfEmerg'), main = $('#nfMain'), quick = $('#nfQuick'), chips = $('#domainChips');
    if (!emerg) return;
    if (on && vistaEmergencias) {
      if (!emerg.dataset.listo) { renderEmergencias(); emerg.dataset.listo = '1'; }
      emerg.style.display = 'block';
      if (main) main.style.display = 'none';
      if (quick) quick.style.display = 'none';
      if (chips) chips.style.display = 'none';
    } else {
      emerg.style.display = 'none';
      if (main) main.style.display = '';
      if (chips) chips.style.display = '';
      if (quick && quick.innerHTML) quick.style.display = 'block';
      if (on && !vistaEmergencias) mostrarBotonVolver(true); else mostrarBotonVolver(false);
    }
    if (!on) vistaEmergencias = true; // al salir de guardia, la próxima vez vuelve a abrir en Emergencias
  }

  function mostrarBotonVolver(mostrar) {
    let b = $('#nfpVolverEmerg');
    if (!mostrar) { if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement('button');
    b.id = 'nfpVolverEmerg'; b.type = 'button'; b.className = 'nfp-btn nfp-btn-red'; b.textContent = '🚨 Volver a Emergencias';
    b.onclick = () => { vistaEmergencias = true; mostrarBotonVolver(false); sincronizarGuardia(); };
    const anchor = $('#nfEmerg');
    anchor.parentNode.insertBefore(b, anchor);
  }

  // ======================================================================
  // 4) PEDIATRÍA POR PESO
  // ======================================================================
  // mgKgDia = dosis diaria en mg/kg · tomas por día · concentraciones habituales (mg por mL)
  const PEDIATRICOS = [
    { id: 'amox', nombre: 'Amoxicilina', grupo: 'Antibióticos', mgKgDia: 50, tomas: 3, maxDiaMg: 3000, pres: [['250 mg/5 mL', 50], ['500 mg/5 mL', 100]], nota: 'Dosis estándar 50 mg/kg/día c/8 h. Otitis/sinusitis: 80–90 mg/kg/día c/12 h.' },
    { id: 'amoxalta', nombre: 'Amoxicilina — dosis alta (otitis/sinusitis)', grupo: 'Antibióticos', mgKgDia: 90, tomas: 2, maxDiaMg: 4000, pres: [['500 mg/5 mL', 100], ['250 mg/5 mL', 50]], nota: '90 mg/kg/día en 2 tomas.' },
    { id: 'amoxclav', nombre: 'Amoxicilina-clavulánico 7:1', grupo: 'Antibióticos', mgKgDia: 90, tomas: 2, maxDiaMg: 4000, pres: [['400/57 mg/5 mL', 80], ['250/62,5 mg/5 mL', 50]], nota: 'Dosis calculada sobre amoxicilina (90 mg/kg/día c/12 h con la presentación 400/57).' },
    { id: 'azitro', nombre: 'Azitromicina', grupo: 'Antibióticos', mgKgDia: 10, tomas: 1, maxDiaMg: 500, pres: [['200 mg/5 mL', 40], ['600 mg/15 mL', 40]], nota: '10 mg/kg una vez al día por 3 días (máx. 500 mg).' },
    { id: 'cefalexina', nombre: 'Cefalexina', grupo: 'Antibióticos', mgKgDia: 50, tomas: 4, maxDiaMg: 4000, pres: [['250 mg/5 mL', 50], ['500 mg/5 mL', 100]], nota: '25–50 mg/kg/día c/6 h (infecciones de piel y partes blandas).' },
    { id: 'claritro', nombre: 'Claritromicina', grupo: 'Antibióticos', mgKgDia: 15, tomas: 2, maxDiaMg: 1000, pres: [['125 mg/5 mL', 25], ['250 mg/5 mL', 50]], nota: '15 mg/kg/día c/12 h.' },
    { id: 'tmp', nombre: 'Trimetoprima-sulfametoxazol (dosis por TMP)', grupo: 'Antibióticos', mgKgDia: 8, tomas: 2, maxDiaMg: 320, pres: [['40 mg TMP/5 mL', 8]], nota: '8 mg/kg/día de TMP c/12 h. No usar en menores de 2 meses.' },
    { id: 'para', nombre: 'Paracetamol', grupo: 'Analgésicos / antitérmicos', mgKgDosis: 15, tomas: 4, maxDiaMg: 4000, pres: [['Gotas 100 mg/mL', 100], ['Jarabe 160 mg/5 mL', 32]], nota: '15 mg/kg/dosis cada 6 h (máx. 75 mg/kg/día y 4 g/día).' },
    { id: 'ibu', nombre: 'Ibuprofeno', grupo: 'Analgésicos / antitérmicos', mgKgDosis: 10, tomas: 3, maxDiaMg: 1200, pres: [['Suspensión 100 mg/5 mL', 20], ['Suspensión 200 mg/5 mL', 40]], nota: '10 mg/kg/dosis cada 8 h (máx. 40 mg/kg/día). Solo en mayores de 6 meses y bien hidratados.' },
  ];

  function pediatriaHtml() {
    const grupos = [...new Set(PEDIATRICOS.map((p) => p.grupo))];
    return `
      <div class="nfp-form">
        <div><label>Peso (kg)</label><input id="pdW" type="number" min="1" max="120" step="0.1" inputmode="decimal" placeholder="Ej: 14"></div>
        <div><label>Fármaco</label><select id="pdDrug">${grupos.map((g) => `<optgroup label="${g}">${PEDIATRICOS.filter((p) => p.grupo === g).map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('')}</optgroup>`).join('')}</select></div>
        <div style="grid-column:1/-1"><label>Presentación</label><select id="pdPres"></select></div>
      </div>
      <div class="nfp-res" id="pdRes"><span>Ingresá el peso del paciente.</span></div>`;
  }

  function bindPediatria(root) {
    const drug = () => PEDIATRICOS.find((p) => p.id === $('#pdDrug', root).value);
    const fillPres = () => { $('#pdPres', root).innerHTML = drug().pres.map((p, i) => `<option value="${i}">${p[0]}</option>`).join(''); };
    const calc = () => {
      const w = parseFloat($('#pdW', root).value), d = drug(), box = $('#pdRes', root);
      if (!(w > 0)) { box.className = 'nfp-res'; box.innerHTML = '<span>Ingresá el peso del paciente.</span>'; return; }
      const mgToma = d.mgKgDosis ? w * d.mgKgDosis : (w * d.mgKgDia) / d.tomas;
      const dosisMax = d.maxDiaMg / d.tomas;
      const tope = mgToma > dosisMax;
      const mg = Math.min(mgToma, dosisMax);
      const conc = d.pres[parseInt($('#pdPres', root).value, 10) || 0][1]; // mg por mL
      const ml = mg / conc;
      const mlR = Math.round(ml * 10) / 10;
      const mlPract = Math.round(ml * 2) / 2; // redondeo práctico a 0,5 mL
      const horas = Math.round(24 / d.tomas);
      const diaMg = Math.round(mg * d.tomas);
      box.className = 'nfp-res ok';
      box.innerHTML = `<b>${mlR} mL por toma</b>
        <span>${Math.round(mg)} mg/toma · ${d.tomas} toma${d.tomas > 1 ? 's' : ''} al día (cada ${horas} h) · ${diaMg} mg/día (${Math.round(diaMg / w)} mg/kg/día)</span>
        <span>Volumen práctico redondeado: <strong>${mlPract} mL</strong> por toma</span>
        ${tope ? '<small>⚠️ Se aplicó la dosis máxima por toma del adulto.</small>' : ''}
        <small>${d.nota}</small>`;
    };
    fillPres(); root.addEventListener('input', calc);
    root.addEventListener('change', (e) => { if (e.target.id === 'pdDrug') fillPres(); calc(); });
  }

  // ======================================================================
  // UI: barra, modal y estilos
  // ======================================================================
  function css() {
    if ($('#nfpCss')) return;
    const st = document.createElement('style');
    st.id = 'nfpCss';
    st.textContent = `
      .nfp-bar { display:flex; gap:8px; flex-wrap:wrap; margin:10px 0 4px; }
      .nfp-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 14px; border-radius:12px; border:1px solid var(--border,#e2e8f0); background:var(--card-bg,#fff); color:var(--text-main,#0f172a); font-weight:700; font-size:.82rem; cursor:pointer; font-family:inherit; transition:transform .15s ease, box-shadow .2s ease, border-color .2s ease; }
      .nfp-btn:hover { transform:translateY(-1px); border-color:var(--nika-primary,#0284c7); box-shadow:0 8px 18px -10px rgba(2,132,199,.55); }
      .nfp-btn-red { border-color:#ef4444; color:#ef4444; margin-bottom:10px; }
      #nfQuick { display:none; margin:10px 0; }
      .nfp-quick { border:1px solid var(--border,#e2e8f0); border-left:5px solid var(--nika-primary,#0284c7); border-radius:16px; padding:14px 16px; background:var(--card-bg,#fff); box-shadow:0 10px 24px -16px rgba(2,132,199,.5); }
      .nfp-quick-h { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px; }
      .nfp-quick-h h3 { margin:0; font-size:1.02rem; color:var(--text-main,#0f172a); }
      .nfp-tag { font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.5px; padding:3px 10px; border-radius:999px; background:rgba(2,132,199,.14); color:var(--nika-primary,#0284c7); }
      .nfp-q-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
      .nfp-q { border:1px solid var(--border,#e2e8f0); border-radius:12px; padding:10px 12px; background:var(--bg-body,#f8fafc); }
      .nfp-q b { font-size:.78rem; color:var(--text-main,#0f172a); }
      .nfp-q p { margin:4px 0 0; font-size:.83rem; line-height:1.45; color:var(--text-muted,#475569); }
      .nfp-q1 { border-color:rgba(34,197,94,.5); background:rgba(34,197,94,.08); }
      .nfp-q2 { border-color:rgba(245,158,11,.5); background:rgba(245,158,11,.08); }
      .nfp-note { margin:10px 0 2px; font-size:.82rem; color:var(--text-main,#0f172a); }
      .nfp-disc { margin:0; font-size:.72rem; color:var(--text-muted,#64748b); font-style:italic; }
      @media (max-width:640px){ .nfp-q-grid{ grid-template-columns:1fr; } }

      #nfpModal { position:fixed; inset:0; z-index:9000; display:none; align-items:center; justify-content:center; padding:14px; background:rgba(2,6,23,.65); backdrop-filter:blur(4px); }
      #nfpModal.on { display:flex; }
      .nfp-card { width:min(560px,100%); max-height:92vh; display:flex; flex-direction:column; background:var(--card-bg,#fff); color:var(--text-main,#0f172a); border:1px solid var(--border,#e2e8f0); border-radius:20px; box-shadow:0 30px 70px -20px rgba(0,0,0,.6); overflow:hidden; }
      .nfp-card-h { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:14px 16px; border-bottom:1px solid var(--border,#e2e8f0); background:linear-gradient(135deg,rgba(2,132,199,.12),rgba(37,99,235,.06)); }
      .nfp-card-h b { font-size:1rem; }
      .nfp-x { border:none; background:rgba(148,163,184,.2); width:32px; height:32px; border-radius:50%; cursor:pointer; color:inherit; font-size:1rem; }
      .nfp-tabs { display:flex; gap:6px; padding:10px 12px 0; overflow-x:auto; }
      .nfp-tab { flex-shrink:0; border:1px solid var(--border,#e2e8f0); background:var(--bg-body,#f8fafc); color:var(--text-muted,#64748b); padding:7px 12px; border-radius:999px; font-size:.78rem; font-weight:700; cursor:pointer; font-family:inherit; }
      .nfp-tab.on { background:linear-gradient(135deg,#0284c7,#2563eb); color:#fff; border-color:transparent; }
      .nfp-body { padding:14px 16px 18px; overflow-y:auto; }
      .nfp-sub { margin:0 0 10px; font-size:.8rem; color:var(--text-muted,#64748b); }
      .nfp-chk { display:flex; align-items:center; gap:10px; padding:9px 11px; border:1px solid var(--border,#e2e8f0); border-radius:10px; margin-bottom:6px; cursor:pointer; font-size:.85rem; }
      .nfp-chk:hover { border-color:var(--nika-primary,#0284c7); }
      .nfp-chk span { flex:1; } .nfp-chk em { font-style:normal; font-weight:800; color:var(--nika-primary,#0284c7); font-size:.78rem; }
      .nfp-chk input { transform:scale(1.2); accent-color:var(--nika-primary,#0284c7); }
      .nfp-sw { display:flex; gap:8px; align-items:center; margin-bottom:10px; font-size:.82rem; font-weight:700; cursor:pointer; }
      .nfp-form { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
      .nfp-form label { display:block; font-size:.7rem; font-weight:800; text-transform:uppercase; letter-spacing:.4px; color:var(--text-muted,#64748b); margin-bottom:4px; }
      .nfp-form input, .nfp-form select { width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid var(--border,#e2e8f0); border-radius:10px; background:var(--bg-body,#f8fafc); color:var(--text-main,#0f172a); font-size:.9rem; font-family:inherit; }
      .nfp-res { margin-top:12px; padding:12px 14px; border-radius:14px; border:1px solid var(--border,#e2e8f0); background:var(--bg-body,#f8fafc); display:flex; flex-direction:column; gap:4px; font-size:.85rem; }
      .nfp-res b { font-size:.98rem; } .nfp-res small { color:var(--text-muted,#64748b); }
      .nfp-res.ok { border-color:rgba(34,197,94,.55); background:rgba(34,197,94,.09); }
      .nfp-res.mid { border-color:rgba(245,158,11,.6); background:rgba(245,158,11,.1); }
      .nfp-res.bad { border-color:rgba(239,68,68,.6); background:rgba(239,68,68,.1); }

      #nfEmerg { display:none; margin:10px 0; }
      .nfp-emerg-h { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px; padding:12px 14px; border-radius:14px; border:2px solid #ef4444; background:rgba(239,68,68,.1); }
      .nfp-emerg-h small { display:block; color:var(--text-muted,#94a3b8); font-size:.75rem; }
      .nfp-emerg-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap:12px; }
      .nfp-emerg-card { border:2px solid #7f1d1d; border-top:5px solid #ef4444; border-radius:16px; padding:14px 16px; background:var(--card-bg,#0c1118); }
      .nfp-emerg-card h4 { margin:0 0 8px; font-size:1.05rem; display:flex; gap:8px; align-items:center; color:var(--text-main,#f8fafc); }
      .nfp-emerg-card ol { margin:0; padding-left:20px; display:grid; gap:6px; font-size:.9rem; line-height:1.45; color:var(--text-main,#f8fafc); }
      .nfp-emerg-card li::marker { color:#ef4444; font-weight:800; }
    `;
    document.head.appendChild(st);
  }

  let tabActual = 'curb';
  const TABS = [
    ['curb', 'CURB-65'], ['qsofa', 'qSOFA'], ['cg', 'Clearance Cr'], ['wellstep', 'Wells TEP'], ['wellstvp', 'Wells TVP'], ['peds', '👶 Pediatría'],
  ];

  function abrirModal(tab) {
    tabActual = tab || tabActual;
    $('#nfpModal').classList.add('on');
    pintarTab();
  }
  function cerrarModal() { const m = $('#nfpModal'); if (m) m.classList.remove('on'); }

  function pintarTab() {
    const tabs = $('#nfpTabs'), body = $('#nfpBody');
    tabs.innerHTML = TABS.map(([id, l]) => `<button type="button" class="nfp-tab ${id === tabActual ? 'on' : ''}" data-tab="${id}">${l}</button>`).join('');
    tabs.querySelectorAll('button').forEach((b) => { b.onclick = () => { tabActual = b.dataset.tab; pintarTab(); }; });
    $('#nfpTitulo').textContent = tabActual === 'peds' ? '👶 Calculadora pediátrica por peso' : '🩺 ' + SCORES[tabActual].titulo;
    if (tabActual === 'peds') {
      body.innerHTML = `<p class="nfp-sub">Volumen en mL y número de tomas según el peso. Verificar la presentación comercial disponible.</p>${pediatriaHtml()}`;
      bindPediatria(body);
    } else {
      const s = SCORES[tabActual];
      body.innerHTML = `<p class="nfp-sub">${s.sub}</p>${s.html()}`;
      s.bind(body);
    }
  }

  function montar() {
    css();
    const chips = $('#domainChips'), main = $('#nfMain');
    if (!main) return;
    const bar = document.createElement('div');
    bar.className = 'nfp-bar';
    bar.innerHTML = `
      <button type="button" class="nfp-btn" data-nfp="scores">🧮 Scores y calculadoras</button>
      <button type="button" class="nfp-btn" data-nfp="peds">👶 Dosis pediátrica</button>`;
    (chips || main).parentNode.insertBefore(bar, chips || main);
    bar.querySelector('[data-nfp="scores"]').onclick = () => abrirModal(tabActual === 'peds' ? 'curb' : tabActual);
    bar.querySelector('[data-nfp="peds"]').onclick = () => abrirModal('peds');

    const quick = document.createElement('div'); quick.id = 'nfQuick';
    const emerg = document.createElement('div'); emerg.id = 'nfEmerg';
    main.parentNode.insertBefore(quick, main);
    main.parentNode.insertBefore(emerg, main);

    const modal = document.createElement('div');
    modal.id = 'nfpModal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="nfp-card">
        <div class="nfp-card-h"><b id="nfpTitulo"></b><button type="button" class="nfp-x" aria-label="Cerrar" id="nfpX">✕</button></div>
        <div class="nfp-tabs" id="nfpTabs"></div>
        <div class="nfp-body" id="nfpBody"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
    $('#nfpX').onclick = cerrarModal;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

    // Tarjeta rápida al tipear
    const q = $('#q');
    if (q) {
      const upd = () => renderQuick(q.value);
      q.addEventListener('input', upd);
      const clear = $('#qClear'); if (clear) clear.addEventListener('click', () => setTimeout(upd, 0));
    }

    // Modo Emergencias ligado al botón de Guardia (se observa la clase del body: no depende del orden de handlers)
    new MutationObserver(sincronizarGuardia).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sincronizarGuardia();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();

  window.NikaFarmaPlus = { abrirModal, buscarSindrome, SINDROMES, EMERGENCIAS };
})();
