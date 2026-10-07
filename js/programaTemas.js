// js/programaTemas.js
// CAMPUS NIKA — "¿Qué temas abarca esta unidad?": acordeón bajo el selector "Unidad Problema a Evaluar"
// (examen.html, modalidad UP Específica). Se actualiza solo al cambiar la UP o la materia.
// Fuente: programas de cátedra (UNER).

const PROGRAMA_TEMAS = {
  ginecologia: {
    'UP 1': {
      titulo: 'Generalidades y Control Ginecológico',
      temas: [
        'Salud Integral de la Mujer en el curso de vida (enfoque bio-psico-social)',
        'Anatomía del aparato genital femenino y glándula mamaria',
        'Fisiología sexual femenina y ciclo ovárico/endometrial',
        'Historia clínica ginecológica y semiología clínica',
        'Morbimortalidad materna y perinatal',
        'Control ginecológico: Citología cervical (Papanicolaou) y examen mamario',
        'Métodos auxiliares: Ecografía mamaria, ecografía transvaginal y mamografía',
      ],
    },
    'UP 2': {
      titulo: 'Salud Integral de las Niñeces e Infancias',
      temas: [
        'Crecimiento y desarrollo infantil, pubertad y factores reguladores',
        'Pubertad precoz y retraso puberal (alteraciones cronológicas)',
        'Trastornos de la diferenciación sexual: clasificación y diagnóstico',
        'Cambios morfofuncionales de la niñez a la pubertad',
        'Estadios clínicos de Tanner y caracteres sexuales secundarios',
        'Educación sexual integral en la infancia',
      ],
    },
    'UP 3 - Sección 1': {
      titulo: 'Salud Integral del Adolescente y Planificación Familiar',
      temas: [
        'Anticoncepción y Planificación Familiar: métodos reversibles, hormonales, DIU (inertes y liberadores), de barrera y quirúrgicos (ligadura/vasectomía)',
        'Criterios de Elegibilidad Médica de la OMS y LARCs',
        'Infecciones de Transmisión Sexual (ITS) e infecciones endógenas',
        'Enfermedad Pélvica Inflamatoria (EPI): clínica, diagnóstico y tratamiento',
        'Patología cervical, Test de VPH y Programa de prevención de Ca de cuello',
        'Consejería en Salud Sexual y Reproductiva, prácticas sexuales e identidad de género',
      ],
    },
    'UP 3 - Sección 2': {
      titulo: 'Salud de la Adulta Joven: Prácticas y Patología Ginecológica',
      temas: [
        'Patología mamaria benigna: mastalgia cíclica, nódulos y procesos inflamatorios',
        'Patología ovárica: Síndrome de Ovario Poliquístico (SOP) y Falla Ovárica Precoz',
        'Patología uterina: Sangrado Uterino Anormal (SUA) y miomatosis uterina',
        'Trastornos hormonales: hiperprolactinemia, insulinorresistencia, hiperandrogenismo',
        'Endometriosis y adenomiosis: diagnóstico, clínica y terapéutica',
        'Amenorreas primarias y secundarias. Estudio de la infertilidad femenina',
        'Interrupción Voluntaria y Legal del Embarazo (IVE/ILE) y abordaje de abuso sexual',
      ],
    },
    'UP 3 - Sección 3': {
      titulo: 'Urgencias Ginecológicas en Guardia',
      temas: [
        'Genitorragias de la primera mitad: aborto, embarazo ectópico, Enf. Trofoblástica Gestacional',
        'Abdomen agudo ginecológico: absceso tuboovárico, rotura folicular, patología anexial',
        'Notificación y comunicación de malas noticias en ginecología',
      ],
    },
    'UP 3 - Sección 4': {
      titulo: 'Atención Integral de la Mujer en el Embarazo',
      temas: [
        'Control prenatal: preconcepcional, cálculo de FPP, nutrición y embarazo adolescente',
        'Modificaciones anatómicas y fisiológicas del embarazo',
        'Semiología obstétrica: maniobras de Leopold, pelvimetría y examen obstétrico',
        'Hemorragias de la 2ª mitad del embarazo: placenta previa, desprendimiento placentario',
        'Patologías obstétricas: Parto prematuro, RCIU, Rotura Prematura de Membranas (RPM)',
        'Enfermedades maternas: Estados hipertensivos (Preeclampsia, Eclampsia, HELLP)',
        'Complicaciones médicas: Diabetes gestacional, TORCH, HIV perinatal, Anemia, Colestasis intrahepática e Isoinmunización Rh',
        'Maternidades Seguras y Centradas en la Familia',
      ],
    },
    'UP 3 - Sección 5': {
      titulo: 'Parto y Puerperio Normal y Patológico',
      temas: [
        'Parto normal: factores de inicio, trabajo de parto (fenómenos activos y pasivos)',
        'Mecanismos del parto en presentación cefálica y monitoreo fetal intraparto',
        'Periodo placentario normal y alumbramiento',
        'Puerperio normal: control clínico y seguimiento',
        'Puerperio patológico: Hemorragia postparto e infecciones puerperales',
      ],
    },
    'UP 4': {
      titulo: 'Salud Integral de la Adulta Mayor',
      temas: [
        'Climaterio y menopausia: cambios fisiológicos y enfoque integral',
        'Patología endometrial: pólipos, hiperplasia y adenocarcinoma de endometrio',
        'Cáncer de cuello de útero: tamizaje, estadificación e histopatología',
        'Patología del piso pélvico: incontinencia urinaria de esfuerzo y prolapso genital',
        'Patología mamaria maligna: Cáncer de mama, screening, diagnóstico y tratamiento',
        'Sexualidad en la adulta mayor',
      ],
    },
  },
  cirugia: {
    'UP 1': {
      titulo: 'Trauma de Miembro Superior y Principios Quirúrgicos',
      temas: [
        'Asepsia, antisepsia, equipo quirúrgico y normas de bioseguridad',
        'Instrumental quirúrgico: diéresis, prehensión, hemostasia, separación y síntesis',
        'Materiales de sutura y prótesis quirúrgicas',
        'Anestesia local, locorregional, neuroaxial (raquídea/peridural) y general. Planos de Guedel',
        'Evaluación preoperatoria: riesgo quirúrgico (ASA), consentimiento informado y checklist',
        'Manejo postoperatorio inmediato, parámetros de monitoreo y complicaciones de herida',
        'Infección en cirugía (sepsis, flemón, gangrena, abscesos) y biología de la cicatrización',
        'Traumatismos de miembros superiores: fracturas, luxaciones, inmovilizaciones y osteosíntesis',
      ],
    },
    'UP 2': {
      titulo: 'Evaluación del Abdomen Agudo',
      temas: [
        'Definición y clasificación: inflamatorio, perforativo, obstructivo, hemorrágico y vascular',
        'Fisiopatología del dolor abdominal: visceral, somático y referido',
        'Síndrome doloroso en Fosa Ilíaca Derecha (FID) y diagnósticos diferenciales',
        'Apendicitis aguda: formas clínicas, complicaciones (plastrón, peritonitis) y manejo',
        'Estudios por imágenes en abdomen agudo (Rx, Eco, TAC)',
        'Estrés preoperatorio, adaptación psicológica del paciente quirúrgico y consentimiento informado',
      ],
    },
    'UP 3': {
      titulo: 'Evaluación Integral de la Disfagia y Patología Esófago-Gástrica',
      temas: [
        'Disfagia: diagnóstico diferencial entre causas orgánicas y funcionales',
        'Hemorragia digestiva alta (HDA): evaluación inicial, estabilización y tratamiento',
        'Patología esofágica benigna: acalasia, ERGE, esófago de Barrett, divertículo de Zenker y estenosis',
        'Patología gástrica benigna: úlcera péptica, gastritis por H. pylori, hernia hiatal y pólipos',
        'Cáncer de esófago y cáncer gástrico: factores de riesgo, clínica, diagnóstico y estadificación',
        'Patología del estómago operado (Síndrome de Dumping, asa aferente) y métodos diagnósticos (EDA, manometría)',
      ],
    },
    'UP 4': {
      titulo: 'Enfermedad Colorrectal en el Adulto Mayor',
      temas: [
        'Hemorragia digestiva baja (HDB): abordaje inicial, diagnóstico diferencial y manejo',
        'Dolor en Fosa Ilíaca Izquierda (FII) y alteraciones del tránsito intestinal',
        'Enfermedad diverticular: diverticulosis y diverticulitis complicada (Hinchey)',
        'Enfermedad inflamatoria intestinal (Colitis Ulcerosa y Crohn)',
        'Cáncer colorrectal: pesquisa, factores hereditarios, pólipos y videoendoscopía',
        'Patología ano-rectal: hemorroides, fisura, abscesos y fístulas, quiste pilonidal y cáncer de recto (tacto rectal)',
        'Ostomías digestivas: tipos, indicaciones, cuidados y complicaciones',
      ],
    },
    'UP 5': {
      titulo: 'Patología Hepatobiliar y Pancreática',
      temas: [
        'Hígado: anatomía quirúrgica segmentaria, traumatismos, abscesos (piógenos/amebianos) e hidatidosis',
        'Hipertensión portal y tumores hepáticos (benignos y primarios/secundarios)',
        'Litiasis biliar y colecistitis aguda: clínica, imágenes y tratamiento laparoscópico',
        'Síndrome coledociano, ictericia obstructiva, colangitis y patología de vía biliar',
        'Pancreatitis aguda (clasificación de Atlanta) y pancreatitis crónica',
        'Tumores pancreáticos y periampulares',
      ],
    },
    'UP 6': {
      titulo: 'Dolor Inguinal y Patología de Pared Abdominal',
      temas: [
        'Hernias de pared abdominal: inguinal (directa/indirecta), crural, umbilical y de línea media',
        'Hernias infrecuentes (Spiegel, obturatriz, lumbar) y eventraciones posquirúrgicas',
        'Complicaciones herniarias: incarceración y estrangulación (urgencia quirúrgica)',
        'Diagnóstico diferencial de dolor inguinal: pubalgia, neuropatías por atrapamiento y litiasis ureteral',
        'Patología escrotal aguda y subaguda: torsión testicular, hidrocele, varicocele y orquiepididimitis',
      ],
    },
    'UP 7': {
      titulo: 'Tumoración Cervical y Patología de Cabeza y Cuello',
      temas: [
        'Anatomía quirúrgica del cuello, compartimentos y niveles ganglionares oncológicos',
        'Enfermedades tiroideas: bocio nodular, nódulo tiroideo y cáncer de tiroides (PUNCIÓN PAAF)',
        'Cirugía tiroidea: indicaciones, técnica y complicaciones (hipoparatiroidismo, lesión recurrente)',
        'Masas cervicales laterales y congénitas (quistes branquiales, conducto tirogloso, adenopatías)',
        'Patología quirúrgica de glándulas salivales (tumores de parótida y submaxilar)',
        'Traqueostomía: técnica, indicaciones y cuidados de la vía aérea',
        'Estrés laboral y Síndrome de Burnout en el equipo quirúrgico',
      ],
    },
    'UP 8': {
      titulo: 'Patología Musculoesquelética de Miembros Inferiores y Pelvis',
      temas: [
        'Traumatismos de pelvis y cadera en el adulto mayor: fracturas, luxaciones y shock',
        'Fracturas de fémur, rodilla, pierna, tobillo y pie (calcáneo, astrágalo)',
        'Politraumatismo, fracturas expuestas y síndrome compartimental',
        'Inmovilizaciones, tracciones, yesos y principios de osteosíntesis',
        'Patología vertebral, radiculopatías lumbosacras y tumores óseos',
        'Conceptos de discapacidad, rehabilitación funcional e impacto psicosocial/duelo',
      ],
    },
    'UP 9': {
      titulo: 'Enfermedad Trauma y Procuración de Órganos',
      temas: [
        'Manejo inicial del politraumatizado bajo protocolo ATLS (ABCDE)',
        'Manejo del shock hemorrágico, control de daños e inmovilización espinal',
        'Evaluación y manejo inicial del quemado: SCQ, fórmula de Parkland y criterios de derivación',
        'Diagnóstico de muerte encefálica: marco legal, criterios clínicos e instrumentales',
        'Proceso de procuración de órganos y tejidos (INCUCAI, aspectos bioéticos y entrevista familiar)',
        'Comunicación de malas noticias en emergencias y trauma',
      ],
    },
    'UP 10': {
      titulo: 'Enfermedad Vascular Periférica',
      temas: [
        'Síndrome isquémico arterial agudo (embolia y trombosis arterial): clínica y tratamiento',
        'Isquemia arterial crónica: claudicación intermitente, índices diagnósticos y revascularización',
        'Aneurismas arteriales: aneurisma de aorta abdominal (AAA) y poplíteo',
        'Patología venosa superficial y profunda: várices, trombosis venosa profunda (TVP) y tromboembolismo pulmonar (TEP)',
        'Úlcera varicosa e insuficiencia venosa crónica',
        'Procedimientos vasculares: accesos venosos centrales y flebotomías',
      ],
    },
    'UP 11': {
      titulo: 'Obstrucción Urinaria Baja y Urología Quirúrgica',
      temas: [
        'Hiperplasia Prostática Benigna (HPB): clínica (IPSS), diagnóstico y opciones terapéuticas',
        'Cáncer de próstata: cribado con PSA, tacto rectal, biopsia y estadificación',
        'Obstrucción urinaria baja y retención aguda de orina (sondaje vs. punción suprapúbica)',
        'Litiasis urinaria y cólico renoureteral',
        'Traumatismos genitourinarios (renal, vesical, uretral y genital)',
        'Patología oncológica urológica (cáncer renal, vesical y testicular)',
        'Patología genital benigna (fimosis, varicocele, hidrocele) y accesos vasculares para hemodiálisis',
      ],
    },
  },
  siam: {
    'UP 1': {
      titulo: "El adulto mayor y el agua",
      temas: [
        "Medicina Interna · Nefro-Urología: Hematuria; Nefro-urolitiasis (composición de los cálculos); Nefropatía obstructiva; Infecciones del tracto urinario (E. coli, Klebsiella, Proteus, Enterococcus, Staphylococcus); Prostatitis; Hiperplasia benigna de próstata; Tumores renales y de vías urinarias; Tumores de vejiga; Insuficiencia renal crónica.",
        "Farmacología: AINEs: salicilatos, paracetamol, ácido acético, propiónico, oxicamos y COX-2 selectivos; Antibióticos β-lactámicos: penicilinas, cefalosporinas, otros β-lactámicos e inhibidores de β-lactamasas; Antibióticos no β-lactámicos: tetraciclinas, macrólidos y quinolonas; Diuréticos: inhibidores de anhidrasa carbónica, SGLT2, del asa, tiazidas, ahorradores de K+, osmóticos, vaptanos y ureareticos.",
      ],
    },
    'UP 2': {
      titulo: "El adulto mayor en su vida cotidiana I",
      temas: [
        "Medicina Interna · Cardiología: Síndrome metabólico; Obesidad; Hipertensión arterial; Dislipemias.",
        "Medicina Interna · Neurología: Accidentes cerebrovasculares (isquemia/TIA, infarto, hemorragia); Síndromes focales del encéfalo (frontal, parietal, temporal, occipital) y trastornos del lenguaje; Síndromes de pérdida de fuerza muscular y botulismo; Enfermedades desmielinizantes, miastenia gravis y tétanos.",
        "Farmacología: Antihipertensivos: bloqueantes α/β, bloqueantes del SRAA, antagonistas del calcio y de acción central; Hipolipemiantes: omega 3, ezetimibe, estatinas, fibratos, resinas, lomitapide, ácido bempedoico, inhibidores de PCSK9 y evinacumab; Vasodilatadores; Neurotrópicos.",
        "Medicina Legal: Capacidad e incapacidad civil y certificado de incapacidad.",
      ],
    },
    'UP 3': {
      titulo: "El adulto mayor en su vida cotidiana II",
      temas: [
        "Fisiología: Metabolismo fosfo-cálcico y proteico; hormonas hiper e hipocalcemiantes.",
        "Medicina Interna · Endocrinología: Hipo e hiperparatiroidismo.",
        "Medicina Interna · Dermatología: Eritema polimorfo minor; Síndrome de Stevens-Johnson; Necrólisis epidérmica tóxica (síndrome de Lyell).",
        "Medicina Interna · Neurología: Trastornos motores: temblores, corea, atetosis, mioclonías, distonías y tics; Síndrome vestibular: sordera, acúfenos y vértigos; Síndrome cerebeloso; Síndrome extrapiramidal: enfermedad de Parkinson.",
        "Medicina Interna · Reumatología: Artrosis; Osteoporosis; Artritis microcristalinas (gota); Fibromialgia y síndromes sensitivos.",
        "Psicología: Duelos por la imagen corporal, pérdidas y caídas desde la propia altura.",
        "Farmacología: AINEs y analgesia no opiácea; Corticoides; Antiartrósicos; Antigotosos; Antiparkinsonianos: anticolinérgicos, levodopa/carbidopa y otros dopaminérgicos.",
      ],
    },
    'UP 4': {
      titulo: "El adulto mayor en su vida cotidiana III",
      temas: [
        "Psicología: El adulto mayor en el ámbito domiciliario-familiar; Diagnóstico diferencial: depresión vs no depresión; trastornos mnésicos vs reminiscencia.",
        "Medicina Interna · Neurología / Psiquiatría: Delirios; Demencia y Mini-Mental Test; Enfermedad de Alzheimer; Otras enfermedades neurodegenerativas.",
        "Medicina Interna · Cardiología: Valvulopatías estenosantes; Estenosis aórtica; Estenosis mitral; Otras valvulopatías estenóticas.",
        "Oftalmología: Disminución de la agudeza visual: catarata, glaucoma y degeneración macular asociada a la edad.",
        "Farmacología: Fármacos de los trastornos cognitivos y memantina; Fármacos de los trastornos conductuales; Antidemenciales.",
      ],
    },
    'UP 5': {
      titulo: "El adulto mayor en su vida cotidiana IV",
      temas: [
        "Medicina Interna · Cardiología: Valvulopatías regurgitantes; Insuficiencia aórtica; Insuficiencia mitral; Otras valvulopatías regurgitantes.",
        "Medicina Interna · Flebología: Insuficiencia venosa periférica; Enfermedad tromboembólica y trombosis venosa profunda.",
        "Medicina Interna · Cardiología / Neumonología: Tromboembolismo pulmonar.",
        "Medicina Interna · Dermatología: Precursores de melanoma; Melanoma.",
        "Medicina Interna · Gastroenterología: Enfermedad hemorroidal.",
        "Medicina Interna · Reumatología: Osteoporosis.",
        "Farmacología: Calcio, vitamina D y fijadores del calcio; Venotónicos; Antihemorroidales; Anticoagulantes y fibrinolíticos.",
      ],
    },
    'UP 6': {
      titulo: "El adulto mayor y su corazón I",
      temas: [
        "Medicina Interna · Cardiología: Miocardiopatías: clasificación; Miocardiopatía genética; Miocardiopatía hipertrófica; Miocardiopatía dilatada; Miocardiopatía restrictiva; Miocardiopatía en el embarazo y chagásica; Insuficiencia cardíaca (clasificación funcional, tratamiento, digitálicos y diuréticos).",
        "Medicina Interna · Infectología: Enfermedad de Chagas.",
      ],
    },
    'UP 7': {
      titulo: "El adulto mayor y su corazón II",
      temas: [
        "Medicina Interna · Cardiología: Arritmias: síndrome del nódulo sinusal enfermo, paro y bradicardia sinusal, taquicardias; Flutter y fibrilación auricular; Taquicardia paroxística supraventricular y extrasístoles; Bloqueos AV; Taquicardia y fibrilación ventricular, QT largo; Wolf-Parkinson-White; Marcapasos, cardioversión eléctrica y desfibrilación.",
        "Farmacología: Antiarrítmicos: clasificación, mecanismos, indicaciones, reacciones adversas e interacciones.",
      ],
    },
    'UP 8': {
      titulo: "El adulto mayor, la sexualidad y el descanso",
      temas: [
        "Fisiología: El sueño normal y sus patrones; el sueño en el adulto mayor.",
        "Medicina Interna · Neurología: Insomnio; Somnolencia: narcolepsia, hipersomnia y síndrome de apneas del sueño; Otros trastornos del ciclo sueño-vigilia.",
        "Medicina Interna · Urología: Disfunciones sexuales: deseo, excitación, dolor y parafilias.",
        "Psicología: La sexualidad en el adulto mayor.",
        "Farmacología: Hipnóticos; Inhibidores de la fosfodiesterasa (disfunción eréctil).",
      ],
    },
    'UP 9': {
      titulo: "El adulto mayor y el final de la vida",
      temas: [
        "Medicina Interna · Dermatología: Pénfigos; Úlceras por presión.",
        "Medicina Interna · Gastroenterología y cuidados paliativos: Cáncer de esófago; Cáncer de estómago; Paciente terminal y cuidados paliativos; Dolor: vías de percepción, analgesia endógena y tratamiento; Coma; Ética médica y sufrimiento humano; Paro cardiorrespiratorio.",
        "Psicología: Rol del médico en el final de la vida; asistencia al moribundo y su familia.",
        "Medicina Legal: Muerte, diagnóstico de muerte y certificado de defunción; Tanatología: autopsia, cronotanatodiagnóstico, inhumación, embalsamamiento, cremación y exhumación; Testamento.",
      ],
    },
  },
};

const ProgramaTemas = (() => {
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function modulo() {
    try { if (typeof getModuloActual === 'function') return getModuloActual(); } catch (_) {}
    return new URLSearchParams(location.search).get('modulo') || 'cirugia';
  }
  const modoActual = () => { try { return typeof selectedMode !== 'undefined' ? selectedMode : null; } catch (_) { return null; } };

  // Valor del <select> → clave del programa. Cirugía: "7" → "UP 7". Ginecología: "UP3_sec_2" → "UP 3 - Sección 2".
  function clave(valor) {
    const v = String(valor || '');
    let m = /^UP(\d+)_sec_(\d+)$/i.exec(v);
    if (m) return `UP ${m[1]} - Sección ${m[2]}`;
    m = /^(?:UP)?\s*(\d+)$/i.exec(v);
    return m ? `UP ${m[1]}` : v;
  }
  const claves = () => Object.keys(PROGRAMA_TEMAS[modulo()] || {});
  const corta = (k) => k.replace(/^UP (\d+) - Sección (\d+)$/, 'UP $1 · S$2');

  // Unidades que abarca cada modalidad de examen (Parcial / Final / etc.)
  function unidadesDelModo(modo) {
    const todas = claves();
    if (modulo() === 'ginecologia') {
      if (modo === 'parcial_1') return todas.filter((k) => /^UP [123]\b/.test(k));
      return todas;
    }
    const n = (k) => Number(k.replace('UP ', ''));
    if (modo === 'parcial_1') return todas.filter((k) => n(k) <= 5);
    if (modo === 'parcial_2') return todas.filter((k) => n(k) >= 6);
    return todas;
  }
  const NOMBRE_MODO = { parcial_1: 'Primer Parcial', parcial_2: 'Segundo Parcial', final: 'Examen Final', residencia: 'Simulacro Residencia', flash: 'Flash (10 preguntas al azar)' };

  function css() {
    if (document.getElementById('pt-css')) return;
    const st = document.createElement('style'); st.id = 'pt-css';
    st.textContent = `
      .pt-wrap { margin-top: 12px; }
      .pt-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 9px 14px; font: 600 .875rem/1.2 'Plus Jakarta Sans', Inter, Outfit, system-ui, sans-serif; color: #0369a1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; cursor: pointer; transition: background .2s, border-color .2s, box-shadow .2s; }
      .pt-btn:hover { background: #e0f2fe; border-color: #7dd3fc; }
      .pt-btn:focus-visible { outline: 2px solid #0284c7; outline-offset: 2px; }
      .pt-btn .pt-ic { margin-right: 6px; }
      .pt-arrow { display: inline-block; font-size: .75rem; transition: transform .3s ease; }
      .pt-btn[aria-expanded="true"] .pt-arrow { transform: rotate(180deg); }
      .pt-panel { max-height: 0; opacity: 0; overflow: hidden; margin-top: 0; background: #f8fafc; border: 1px solid transparent; border-radius: 10px; transition: max-height .4s ease, opacity .3s ease, margin-top .3s ease, border-color .3s; }
      .pt-panel.on { max-height: 900px; opacity: 1; margin-top: 10px; border-color: #e2e8f0; overflow-y: auto; }
      .pt-in { padding: 14px 16px; transition: opacity .18s ease; } .pt-in.cambia { opacity: 0; }
      .pt-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 12px; }
      .pt-chip { font: 700 .74rem/1 'Plus Jakarta Sans', Inter, system-ui, sans-serif; padding: 6px 11px; border-radius: 999px; cursor: pointer; background: #fff; color: #475569; border: 1px solid #cbd5e1; transition: all .15s; }
      .pt-chip:hover { border-color: #0284c7; color: #0369a1; } .pt-chip.on { background: #0284c7; border-color: #0284c7; color: #fff; }
      .pt-chip.sel::after { content: ' ✓'; }
      .pt-hint { margin: 0 0 10px; font-size: .76rem; color: #64748b; }
      .pt-tit { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 0 0 10px; font-size: .95rem; font-weight: 800; color: #0f172a; }
      .pt-badge { font-size: .68rem; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: #e0f2fe; color: #0369a1; }
      .pt-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
      .pt-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; font-size: .86rem; line-height: 1.45; color: #334155; opacity: 0; animation: pt-in .45s cubic-bezier(.2,.8,.2,1) forwards; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
      .pt-item:hover { transform: translateY(-2px); border-color: #7dd3fc; box-shadow: 0 8px 18px -12px rgba(2,132,199,.55); }
      @keyframes pt-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      .pt-t { display: block; font-weight: 800; color: #0369a1; }
      .pt-num { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 800; background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; box-shadow: 0 4px 10px -4px rgba(37,99,235,.7); transition: transform .25s ease; }
      .pt-item:hover .pt-num { transform: scale(1.12) rotate(-6deg); }
      .pt-txt { min-width: 0; } .pt-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 7px; }
      .pt-pill { font-size: .75rem; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; line-height: 1.3; transition: background .15s, transform .15s; }
      .pt-pill:hover { background: #e0f2fe; transform: translateY(-1px); }
      body.dark-mode .pt-btn { background: rgba(2,132,199,.15); border-color: rgba(125,211,252,.35); color: #7dd3fc; }
      body.dark-mode .pt-btn:hover { background: rgba(2,132,199,.28); }
      body.dark-mode .pt-panel.on { background: rgba(15,23,42,.6); border-color: rgba(148,163,184,.25); }
      body.dark-mode .pt-tit { color: #f1f5f9; } body.dark-mode .pt-item { background: rgba(30,41,59,.7); border-color: rgba(148,163,184,.2); color: #cbd5e1; }
      body.dark-mode .pt-t, body.dark-mode .pt-pill { color: #7dd3fc; } body.dark-mode .pt-pill { background: rgba(2,132,199,.18); border-color: rgba(125,211,252,.3); }
      body.dark-mode .pt-chip { background: rgba(30,41,59,.7); border-color: rgba(148,163,184,.3); color: #cbd5e1; } body.dark-mode .pt-chip.on { background: #0284c7; color: #fff; }
      @media (prefers-reduced-motion: reduce) { .pt-panel, .pt-arrow, .pt-in, .pt-item { transition: none; animation: none; opacity: 1; } }
    `;
    document.head.appendChild(st);
  }

  // Parte "a, b (c, d) y e" en píldoras respetando paréntesis
  function partes(txt) {
    const out = []; let prof = 0, cur = '';
    for (const ch of txt) {
      if (ch === '(') prof++; if (ch === ')') prof = Math.max(0, prof - 1);
      if (ch === ',' && prof === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out.length ? out.slice(0, -1).concat(out.slice(-1)[0].split(/ y (?![^(]*\))/)).map((x) => x.trim()).filter(Boolean) : [];
  }

  const cap = (t) => { const x = String(t).trim().replace(/[.;]+$/, ''); return x.charAt(0).toUpperCase() + x.slice(1); };
  // Cada eje se muestra SIEMPRE igual: título (primera mayúscula) + píldoras con sus subtemas (primera mayúscula)
  function separar(t) {
    const k = t.indexOf(': ');
    if (k > 0 && k < 90) return { titulo: t.slice(0, k), pills: partes(t.slice(k + 2)) };
    const punto = t.indexOf('. ');
    if (punto > 0) return { titulo: t.slice(0, punto), pills: partes(t.slice(punto + 2)) };
    const larga = /^(.{25,}?\))\s+y\s+(.+)$/.exec(t);
    if (larga) return { titulo: larga[1], pills: [larga[2]] };
    const m = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(t);
    if (m && m[1]) return { titulo: m[1], pills: [m[2]] };
    return { titulo: t, pills: [] };
  }

  function detalle(datos) {
    return `<h5 class="pt-tit">🎯 ${esc(datos.titulo)} <span class="pt-badge">${datos.temas.length} ejes</span></h5>
      <ul class="pt-list">${datos.temas.map((t, i) => {
        const { titulo, pills } = separar(t);
        return `<li class="pt-item" style="animation-delay:${i * 55}ms"><span class="pt-num">${i + 1}</span><span class="pt-txt"><span class="pt-t">${esc(cap(titulo))}</span>${pills.length ? `<span class="pt-pills">${pills.map((x) => `<span class="pt-pill">${esc(cap(x))}</span>`).join('')}</span>` : ''}</span></li>`;
      }).join('')}</ul>`;
  }

  // Fábrica de acordeones. opts: { id, texto, unidades(): [claves], porDefecto(): clave|null, hint(): string, seleccionadas(): [claves] }
  function crear(ancla, opts) {
    if (!ancla || document.getElementById(opts.id)) return null;
    css();
    let abierto = false, vista = null;
    const wrap = document.createElement('div');
    wrap.id = opts.id; wrap.className = 'pt-wrap';
    wrap.innerHTML = `<button type="button" class="pt-btn" aria-expanded="false"><span><span class="pt-ic">📖</span>${esc(opts.texto)}</span><span class="pt-arrow" aria-hidden="true">▼</span></button>
      <div class="pt-panel" aria-hidden="true"><div class="pt-in"></div></div>`;
    ancla.insertAdjacentElement('afterend', wrap);
    const btn = wrap.querySelector('.pt-btn'), panel = wrap.querySelector('.pt-panel'), cont = wrap.querySelector('.pt-in');

    function pintar(animar) {
      const unidades = opts.unidades();
      const def = opts.porDefecto ? opts.porDefecto() : null;
      const actual = vista && unidades.includes(vista) ? vista : (def && unidades.includes(def) ? def : unidades[0]);
      const datos = (PROGRAMA_TEMAS[modulo()] || {})[actual];
      const sels = opts.seleccionadas ? opts.seleccionadas() : [];
      const chips = `<div class="pt-chips" role="tablist">${unidades.map((k) => `<button type="button" class="pt-chip${k === actual ? ' on' : ''}${sels.includes(k) ? ' sel' : ''}" data-k="${esc(k)}" role="tab">${esc(corta(k))}</button>`).join('')}</div>`;
      const hint = opts.hint ? `<p class="pt-hint">${esc(opts.hint())}</p>` : '';
      const html = chips + hint + (datos ? detalle(datos) : '<div class="pt-item">Todavía no cargamos el programa de esta unidad.</div>');
      if (animar) { cont.classList.add('cambia'); setTimeout(() => { cont.innerHTML = html; cont.classList.remove('cambia'); }, 120); } else cont.innerHTML = html;
    }
    function alternar(forzar) {
      abierto = typeof forzar === 'boolean' ? forzar : !abierto;
      btn.setAttribute('aria-expanded', String(abierto)); panel.classList.toggle('on', abierto); panel.setAttribute('aria-hidden', String(!abierto));
      if (abierto) pintar(false);
    }
    btn.addEventListener('click', () => alternar());
    cont.addEventListener('click', (e) => { const c = e.target.closest('.pt-chip'); if (c) { vista = c.dataset.k; pintar(true); } });
    return { wrap, alternar, pintar: (a) => { if (abierto) pintar(a); }, olvidarVista: () => { vista = null; }, mostrar: (v) => { wrap.style.display = v ? '' : 'none'; if (!v) alternar(false); } };
  }

  function montar() {
    const sel = document.getElementById('specific-up');
    if (!sel || document.getElementById('pt-wrap')) return;

    // 1) Modalidad "UP Específica": sigue al selector, pero deja explorar cualquier otra unidad con las píldoras
    const a = crear(sel, {
      id: 'pt-wrap', texto: '¿Qué temas abarca esta unidad?',
      unidades: claves,
      porDefecto: () => clave(sel.value),
      hint: () => 'Tocá otra unidad para ver sus temas. El examen se rinde con la unidad marcada en el selector.',
      seleccionadas: () => [clave(sel.value)],
    });
    if (a) {
      sel.addEventListener('change', () => { a.olvidarVista(); a.pintar(true); });
      new MutationObserver(() => { a.olvidarVista(); a.pintar(false); }).observe(sel, { childList: true });
    }

    // 2) Parciales, finales y demás modalidades: qué unidades y temas entran en el examen
    const grupo = document.getElementById('up-selector-group');
    const anclaModo = document.getElementById('trauma-selector-group') || grupo;
    const b = anclaModo && crear(anclaModo, {
      id: 'pt-wrap-modo', texto: '¿Qué temas abarca este examen?',
      unidades: () => unidadesDelModo(modoActual()),
      porDefecto: () => null,
      hint: () => `${NOMBRE_MODO[modoActual()] || 'Este examen'} incluye ${unidadesDelModo(modoActual()).length} unidades. Tocá una para ver sus temas.`,
      seleccionadas: () => unidadesDelModo(modoActual()),
    });
    if (b) {
      const refrescar = () => {
        const m = modoActual();
        b.mostrar(!!m && m !== 'up_especifica' && m !== 'trauma' && m !== 'suturas' && claves().length > 0);
        b.olvidarVista(); b.pintar(false);
      };
      refrescar();
      document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.mode-card')) setTimeout(refrescar, 0); });
      if (grupo) new MutationObserver(refrescar).observe(sel, { childList: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
  return { montar, clave, unidadesDelModo };
})();
window.ProgramaTemas = ProgramaTemas;
window.PROGRAMA_TEMAS = PROGRAMA_TEMAS;
