# -*- coding: utf-8 -*-
"""Algoritmos de manejo (2026-10-21), tercera tanda. Reordenan lo que ya dice la fuente de cada ficha; no suman datos nuevos."""
from contenido import I, A, F, D

# ---------------- gin-cancer-endometrio ----------------
_ce_riesgo = D('¿Es de bajo riesgo (IA G1–2 sin invasión linfovascular)?',
               [F('Observación; sin linfadenectomía')],
               [D('¿Es de riesgo intermedio (IB G1–2 sin ILV, IA G3, o estadio I G1–2 con ILV)?',
                  [F('Braquiterapia de cúpula (ILV negativa) o radioterapia externa pelviana (ILV positiva)')],
                  [F('Alto riesgo (IB G3, estadio II o III, o histología no endometroide): radioterapia externa pelviana con o sin quimioterapia; estadio III: quimiorradioterapia concurrente')])])
_ce = dict(
    algoritmo=dict(titulo='Sangrado posmenopáusico y cáncer de endometrio', nodos=[
        I('Sangrado posmenopáusico: ecografía transvaginal (espesor normal hasta 4 mm; hasta 12 mm con THM)'),
        D('¿El endometrio está engrosado (> 4–5 mm), o la paciente sangra bajo tamoxifeno?',
          [A('Biopsia dirigida por histeroscopía (gold standard)'),
           D('¿La biopsia confirma cáncer de endometrio?',
             [A('Estadificación con RM de pelvis con contraste (TC si no hay RM)'),
              A('Anexohisterectomía total con salpingooforectomía bilateral y lavado peritoneal, preferentemente por laparoscopia; ganglio centinela o linfadenectomía según el riesgo'),
              _ce_riesgo,
              A('Estadio IV o recurrencia: citorreducción más quimioterapia con carboplatino y paclitaxel; hormonoterapia en endometroide G1–2 con receptores positivos')],
             [F('Hiperplasia u otra causa: manejo según la histología')])],
          [F('Endometrio atrófico: seguimiento clínico; reevaluar si el sangrado persiste')]),
    ]))

# ---------------- gin-cancer-cuello ----------------
_cc_inicial = D('¿Es una enfermedad invasora temprana (IA, IB1 o IIA1)?',
                [D('¿Es un estadio IA1 sin invasión linfovascular?',
                   [A('Conización con márgenes libres (si desea fertilidad) o histerectomía simple extrafascial')],
                   [A('IA2 a IIA1: histerectomía radical (Piver II–III) con linfadenectomía pelviana bilateral; con deseo de fertilidad, traquelectomía radical')])],
                [F('Estadios IB2 a IVA: quimiorradioterapia concurrente con cisplatino más braquiterapia como tratamiento estándar')])
_cc = dict(
    algoritmo=dict(titulo='Cáncer de cuello uterino', nodos=[
        I('Metrorragia poscoital, lesión visible o NIC de alto grado: examen con espéculo, colposcopía y biopsia dirigida (conización si hay sospecha de microinvasión)'),
        A('Estadificación clínica FIGO (examen rectovaginal, radiografía de tórax, cistoscopia y rectoscopia según el caso); RM de pelvis para tamaño e infiltración'),
        D('¿Hay contraindicación quirúrgica?',
          [F('Radioterapia externa con braquiterapia, sola o con quimioterapia concurrente radiosensibilizante')],
          [_cc_inicial]),
        A('Recurrencia central posradioterapia: Piver V o exenteración pelviana'),
    ]))

# ---------------- gin-mama-benigna ----------------
_mb = dict(
    algoritmo=dict(titulo='Nódulo o secreción mamaria benigna', nodos=[
        I('Examen clínico; ecografía mamaria como primera evaluación en menores de 30–35 años y mamografía en mayores; punción o biopsia según el hallazgo'),
        D('¿Hay telorragia (secreción serosa o hemática por un conducto)?',
          [F('Papiloma intraductal (60 % de las telorragias): extirpación quirúrgica completa')],
          [D('¿Es un nódulo duro-elástico, móvil, de 15 a 30 años?',
             [F('Fibroadenoma: confirmar con clínica, ecografía y citología o histología; cirugía porque no desaparece y puede crecer')],
             [D('¿Hay secreción espesa parda o verdosa en una perimenopáusica de 40 a 60 años?',
                [F('Ectasia ductal: resección parcial o total de los conductos dilatados')],
                [A('Nódulo de crecimiento rápido o recidivante: biopsia (tumor phyllodes: tumorectomía; mastectomía simple si es muy grande o recidivante)'),
                 F('Hiperplasia atípica, carcinoma in situ, cicatriz radiada o ciertos papilomas en una biopsia: biopsia quirúrgica')])])]),
    ]))

# ---------------- gin-cancer-mama ----------------
_cm = dict(
    algoritmo=dict(titulo='Lesión mamaria sospechosa y conducta', nodos=[
        I('Hallazgo clínico o en el tamizaje: mamografía y ecografía; clasificar con BI-RADS'),
        D('¿Es una lesión sospechosa (BI-RADS 4 o 5) o nódulo nuevo, creciente o en paciente de mayor riesgo?',
          [A('Biopsia percutánea con aguja gruesa (core, no menos de 14 G, 5–10 muestras) bajo control de imágenes; mamografía bilateral al diagnóstico'),
           D('¿El resultado es concordante con la sospecha por imagen?',
             [D('¿La biopsia confirma cáncer?',
                [A('Definir subtipo: receptor hormonal positivo, HER2 positivo o triple negativo'),
                 A('Cirugía (conservadora o mastectomía) con biopsia radioguiada del ganglio centinela'),
                 F('Radioterapia, quimioterapia, hormonoterapia y terapia anti-HER2 según estadio, grado y subtipo')],
                [F('Benigna concordante: control; hiperplasia atípica, carcinoma in situ o cicatriz radiada → biopsia quirúrgica')])],
             [F('Repetir con biopsia quirúrgica')])],
          [D('¿Es BI-RADS 3 (probablemente benigno)?', [F('Control mamográfico semestral durante 3 años')], [F('Tamizaje habitual: mamografía cada 1–2 años desde los 40 hasta los 70, con ecografía en mamas densas')])]),
        A('Si hay mutación BRCA: consejería, estudio genético de familiares y riesgo de cáncer de ovario'),
    ]))

# ---------------- gin-incontinencia ----------------
_inc_esf = [A('Medidas generales y ejercicios del piso pélvico (series de 10 contracciones de 8 segundos, 3 veces al día, durante 20 semanas)'),
            A('Pesario si no desea cirugía'),
            F('Si fracasa: sling mediouretral (retropúbico o transobturador) o cirugía de Burch')]
_inc_urg = [A('Micciones programadas (terapia conductual) y reeducación vesical'),
            A('Segunda línea: antimuscarínicos (oxibutinina, tolterodina) o mirabegrón, o combinados si es refractaria'),
            F('Tercera línea: toxina botulínica intravesical 100 U o neuromodulación sacra; la cirugía no ha dado resultados')]
_inc = dict(
    algoritmo=dict(titulo='Incontinencia urinaria en la mujer', nodos=[
        I('Escape de orina: examen físico, análisis y urocultivo, ecografía vesical con residuo; descartar infección y cáncer vesical (hematuria)'),
        A('Medidas generales: restricción hídrica, pérdida de peso, dejar de fumar, más fibra; estrógenos si hay déficit en el climaterio'),
        D('¿El escape ocurre con esfuerzo (tos, risa, Valsalva)?',
          [D('¿Hay urgencia miccional súbita e imperiosa asociada (incontinencia mixta)?', [A('Tratar primero el componente más molesto; urodinamia para evaluar el detrusor')], [A('Incontinencia de esfuerzo')]), *_inc_esf],
          [D('¿Hay urgencia miccional con escape y sin escape con la tos (inestabilidad del detrusor)?', _inc_urg, [A('Residuo ≥ 150 ml en 2 ocasiones: sospechar daño neurológico y derivar')])]),
    ]))

# ---------------- gin-prolapso ----------------
_pro = dict(
    algoritmo=dict(titulo='Prolapso genital', nodos=[
        I('Presión o masa vaginal, incontinencia, dificultad defecatoria: examen físico con POP-Q (estadios I a IV)'),
        D('¿Es sintomática o tiene afectación de otros sistemas (hidroureteronefrosis, obstrucción intestinal)?',
          [D('¿La paciente es anciana con mal estado general o de alto riesgo quirúrgico?',
             [A('Pesario o colpocleisis (cirugía obliterativa) en ancianas con mal estado general')],
             [A('Cirugía: histerectomía con colporrafia y colposuspensión'), F('Ejercicios del piso pélvico antes y después')])],
          [F('Asintomática: observación y ejercicios del piso pélvico')]),
    ]))

# ---------------- obs-puerperio-patologico ----------------
_pu = dict(
    algoritmo=dict(titulo='Fiebre en el puerperio', nodos=[
        I('Fiebre posparto: examen de útero, loquios, mamas, herida y miembros inferiores; hemograma, cultivos y hemocultivos; ecografía si se sospecha retención o absceso'),
        D('¿Hay compromiso del estado general (escalofríos, fiebre alta, deterioro)?',
          [A('Septicemia puerperal: iniciar antibióticos IV en las primeras 6 horas («hora de oro»): ceftriaxona + clindamicina + ampicilina; o ampicilina + gentamicina + metronidazol; o carbapenemes + vancomicina según gravedad'),
           F('Si hay edema doloroso de miembro inferior: pensar en tromboflebitis útero-pelviana o flegmasia')],
          [D('¿Hay loquios fétidos o útero doloroso (endometritis)?',
             [A('Antibióticos IV de amplio espectro (con cobertura de anaerobios) y evaluar restos con ecografía')],
             [D('¿Hay dolor, enrojecimiento y fiebre en la mama?',
                [A('Mastitis: seguir amamantando o extrayendo la leche y tratar con antibióticos'), F('Si hay absceso (fiebre en picos): drenaje')],
                [A('Tratar la causa local (vulvitis, grietas del pezón, herida)')])]),
        ]),
    ]))

# ---------------- gin-anticoncepcion-ale ----------------
_ac = dict(
    algoritmo=dict(titulo='Elección de anticoncepción sin estrógenos', nodos=[
        I('Estrógenos contraindicados o no deseados (fumadora ≥ 35 años, riesgo cardiovascular, HTA, obesidad, lactancia, posparto): revisar los criterios de elegibilidad de la OMS'),
        D('¿Quiere un método de larga duración (LARC)?',
          [A('DIU de cobre (3 a 10 años), SIU-LNG (3 a 5 años) o implante de etonogestrel (3 años)'),
           D('¿Está en el posparto entre las 48 horas y las 4 semanas, o tiene sepsis, endometritis o sangrado sin diagnóstico?', [F('No colocar el DIU (categoría 4): elegir implante u otro método')], [F('DIU o implante, que son los métodos más efectivos independientemente del cumplimiento')])],
          [A('Píldora de solo progestágeno (desogestrel 75 µg continuo, drospirenona 4 mg o levonorgestrel 30 µg) o inyectable de medroxiprogesterona 150 mg cada 13 semanas (no más de 2 años por pérdida de densidad ósea)'),
           F('En lactancia: MELA desde el día 30 posparto con ≥ 4 tomas por día, hasta 90 días y 1 año posparto como máximo')]),
        D('¿Necesita anticoncepción de emergencia?', [A('Levonorgestrel 1,5 mg en dosis única hasta 72 horas; o DIU de cobre TCu380 o SIU 52 mg dentro de las 120 horas')], [A('Preservativo y otros métodos de barrera como complemento')]),
    ]))

# ---------------- gin-osteoporosis ----------------
_os_trat = D('¿Riesgo muy alto (fractura reciente ≤ 12 meses, fracturas múltiples, T < −3,0, glucocorticoides o inhibidores de aromatasa, FRAX muy alto)?',
             [A('Anabólicos (teriparatida, abaloparatida o romosozumab) por 12–24 meses o antirresortivo potente'),
              F('Seguir con un antirresortivo para consolidar')],
             [D('¿Es menor de 60 años o tiene menos de 10 años de menopausia, con síntomas vasomotores y sin contraindicaciones?',
                [A('Terapia hormonal de la menopausia como primera elección osteoactiva (estradiol 1 mg VO, parche de 25 µg o tibolona 1,25 mg)')],
                [A('Bifosfonato de primera línea: alendronato 70 mg semanal, risedronato, ibandronato o zoledronato 5 mg IV anual; reevaluar a los 3–5 años')]),
              F('Denosumab 60 mg SC cada 6 meses: no suspender sin pasar a un bifosfonato (riesgo de fracturas vertebrales múltiples)')])
_os = dict(
    algoritmo=dict(titulo='Osteoporosis posmenopáusica', nodos=[
        I('Densitometría (DXA) y riesgo de fractura a 10 años con FRAX; laboratorio básico (calcemia, fosfatemia, 25OH vitamina D, función renal, TSH)'),
        A('Medidas generales: calcio 700–1200 mg/día (preferentemente en la dieta), vitamina D 800–1000 UI/día si la 25OHD < 30 ng/ml, ejercicio de fuerza y prevención de caídas'),
        D('¿T-score ≤ −2,5, fractura por fragilidad o FRAX alto (fractura mayor ≥ 20 % o de cadera ≥ 3 %)?', [_os_trat], [F('Riesgo bajo: medidas generales y reevaluar en 2 a 3 años')]),
    ]))

# ---------------- gin-embarazo-adolescente ----------------
_ea = dict(
    algoritmo=dict(titulo='Embarazo en la adolescencia', nodos=[
        I('Adolescente embarazada (10 a 19 años): consejería, testeo de VIH y sífilis, ecografía del primer trimestre; acompañamiento por quien elija e inclusión del varón cogestante y la familia'),
        A('Control prenatal: mínimo 8 contactos en bajo riesgo con cuidado multidisciplinario; hierro 30–60 mg y ácido fólico 400 µg por día; calcio 1,5–2 g/día si la dieta es baja en calcio'),
        A('Ecografías a las 16–20 y a las 32–34 semanas para crecimiento fetal y riesgo de parto pretérmino'),
        D('¿Tiene menos de 15 años?', [A('Atención del parto en una institución de la mayor complejidad disponible')], [A('Atención según el nivel de riesgo obstétrico')]),
        F('Posparto: alta a las 48 h (vaginal) o 72 h (cesárea), control a los 7 días y a las 4 semanas, y anticoncepción inmediata posevento obstétrico con LARC'),
    ]))

# ---------------- gin-malformaciones-mullerianas ----------------
_mu = dict(
    algoritmo=dict(titulo='Sospecha de malformación mülleriana', nodos=[
        I('Amenorrea primaria, dolor cíclico, dismenorrea desde la menarca, abortos o partos pretérmino repetidos: ecografía, histerosalpingografía y resonancia magnética'),
        D('¿Hay agenesia de útero y vagina (Mayer-Rokitansky-Küster-Hauser)?',
          [A('Equipo multidisciplinario (esquema corporal, relaciones sexuales, imposibilidad de gestar)'), F('Neovagina: dilatación con tutores progresivos o cirugía si fallan')],
          [D('¿Es un útero tabicado (el más común) con pérdidas reiteradas o infertilidad?',
             [F('Resección histeroscópica del tabique (sin obligar a cesárea)')],
             [D('¿Hay un cuerno rudimentario con cavidad no comunicante (útero unicorne)?',
                [F('Resección del cuerno rudimentario para aliviar el dolor cíclico')],
                [D('¿Hay un tabique vaginal transversal obstructivo o longitudinal sintomático?',
                   [F('Cirugía, preferentemente vaginal')],
                   [F('Bicorne o didelfo asintomático: sin cirugía; arcuato: buen resultado reproductivo')])])])]),
    ]))

CONTENIDO5 = {'gin-cancer-endometrio': _ce, 'gin-cancer-cuello': _cc, 'gin-mama-benigna': _mb, 'gin-cancer-mama': _cm, 'gin-incontinencia': _inc,
              'gin-prolapso': _pro, 'obs-puerperio-patologico': _pu, 'gin-anticoncepcion-ale': _ac, 'gin-osteoporosis': _os,
              'gin-embarazo-adolescente': _ea, 'gin-malformaciones-mullerianas': _mu}

CONTENIDO5['gin-sop'] = {'farmacos': ['fx-letrozol', 'fx-clomifeno', 'fx-metformina']}
CONTENIDO5['gin-ectopico'] = {'farmacos': ['fx-metotrexato']}
CONTENIDO5['obs-dg'] = {'farmacos': ['fx-insulina', 'fx-metformina']}
CONTENIDO5['gin-etg'] = {'farmacos': ['fx-metotrexato']}
