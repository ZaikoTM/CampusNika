# -*- coding: utf-8 -*-
"""UP2 · Abdomen agudo. Base: Giménez 2.ª ed. (2025), caps. 84 (abdomen agudo quirúrgico), 70 (apendicitis aguda) y 10 (colecciones abdominales)."""
from base import I, A, F, D, FG

# ---------------- abdomen agudo: enfoque ----------------
_aa_tx = [
    A('Reanimación: ABC, vía venosa, hidratación, régimen cero, sonda nasogástrica si hay vómitos o distensión y control de la diuresis (mínimo 0,5 a 1 mL/kg/h antes de operar)'),
    A('Corregir la acidosis metabólica antes de la cirugía y medir el lactato: si no baja de 2,5 mg/dL en el preoperatorio, es un indicador de mal pronóstico'),
    D('¿Hay inestabilidad hemodinámica con signos peritoneales (abdomen agudo hemorrágico o traumático)?',
      [F('Cirugía urgente para el control del sangrado o de la lesión')],
      [D('¿Hay oclusión intestinal completa, perforación o peritonitis difusa?',
         [F('Cirugía temprana: es la piedra angular del tratamiento. Lavado abdominal exhaustivo, antibióticos profilácticos y luego dirigidos según el cultivo')],
         [A('Antibióticos si hay infección intraabdominal; reevaluación clínica seriada y estudios por imágenes dirigidos'),
          F('Cirugía si se confirma una causa quirúrgica; tratamiento médico en las causas no quirúrgicas (gastroenteritis, causas torácicas, enfermedades generales)')])])]
_aa = dict(
    algoritmo=dict(titulo='Dolor abdominal agudo: decisión de operar (Giménez 2025)', nodos=[
        I('Dolor abdominal agudo: historia clínica, examen físico completo y signos vitales; tipificar grupo sanguíneo y pedir laboratorio'),
        D('¿Hay signos de alarma (defensa, contractura, irritación peritoneal, shock, fiebre persistente)?',
          [A('Es un probable abdomen agudo quirúrgico: no demorar más de 8 horas el diagnóstico correcto'),
           A('Ecografía, radiografía o TC según el cuadro, sin retrasar la cirugía si el cuadro es evidente')] + _aa_tx,
          [A('Observación con examen físico seriado, analgesia y estudios escalonados'),
           F('Si aparecen signos de alarma, reconducir como abdomen agudo quirúrgico')]),
    ]),
    fisiopatologia=[
        'El dolor abdominal es el síntoma cardinal: nace en una o más regiones del abdomen, es agudo por su cronología e intensidad, se acompaña de alteraciones del tránsito y puede deteriorar rápidamente el estado general (Cope, 1921: la semiología del dolor es el dato prioritario).',
        'En el cuadro inflamatorio el dolor es insidioso, a veces referido a distancia de la víscera inflamada, y luego se localiza o se generaliza (la úlcera perforada da un dolor en puñalada en el epigastrio que se difunde y causa contractura). En el oclusivo es por crisis (retortijón) con signo de reptación; en el hemorrágico puede ser súbito (rotura tubaria, estallido hepático o esplénico) y siempre compromete la hemodinamia.',
        'Los "grandes dramas abdominales" (pancreatitis aguda grave con necrosis infectada e infarto mesentérico) producen un dolor muy intenso, "en barra" en el hemiabdomen superior con vómitos frecuentes, y son "grandes simuladoras": el examen abdominal puede ser engañosamente pobre.',
    ],
    # el resto de la ficha se ajusta a Giménez
    definicion='Conjunto de signos y síntomas agudos de aparición brusca, causados por patologías que necesitarán una cirugía para su control o resolución definitiva; es la causa más prevalente de consulta en urgencias. Giménez lo clasifica por etiología en inflamatorio, hemorrágico, oclusivo, vascular, traumático y "grandes dramas abdominales" (pancreatitis aguda grave con necrosis infectada e infarto mesentérico).',
    diagnostico=[
        'Dolor visceral (línea media, mal localizado), referido (misma metámera: por ejemplo, colecistitis a la escápula) y somático parietal (localizado, con resistencia muscular y hiperalgesia cutánea). La historia clínica (inicio, duración, ubicación, irradiación, síntomas asociados y antecedentes) orienta más que el dolor aislado.',
        'Signos de alarma del abdomen agudo inflamatorio: dolor de inicio brusco o que pasa de localizado a generalizado, defensa, contractura o abdomen "en tabla", irritación peritoneal y fiebre persistente tras 48 horas de tratamiento (> 38,5 °C).',
        'Cuadro oclusivo: dolor por crisis, náuseas y vómitos, detención de heces y gases y distensión. Cuadro hemorrágico: shock hipovolémico (taquicardia, hipotensión, palidez, sudoración). Pacientes mayores de 50 años, inmunodeprimidos o con comorbilidad tienen más morbimortalidad si el diagnóstico se retrasa.',
        'Facies peritonítica o hipocrática (ojos hundidos, nariz afilada, palidez): peritonitis de varios días. Hipotensión: pensar en deshidratación, shock hemorrágico, insuficiencia suprarrenal o sepsis con vasoplejía.',
        'Diagnóstico diferencial, en cuatro grupos: enfermedades generales con síntomas abdominales (dengue, COVID-19, cetoacidosis diabética), afecciones torácicas con repercusión abdominal (infarto, neumonía), afecciones abdominales de tratamiento médico (gastroenteritis) y abdomen agudo quirúrgico. En los tres primeros la cirugía no beneficia al paciente.',
    ],
    estudios=[
        'Laboratorio: grupo sanguíneo (siempre el primer dato), hemograma (la hemoglobina puede ser normal en las primeras horas de una hemorragia), leucocitos (> 20.000: abdomen agudo grave o isquemia mesentérica; la leucopenia < 4000 indica sepsis grave; en ancianos e inmunodeprimidos pueden ser normales), plaquetas, coagulación, urea, creatinina, ionograma y glucemia (descartar cetoacidosis antes de operar).',
        'Gasometría y lactato para valorar la perfusión; amilasa y lipasa ≥ 3 veces el valor normal sugieren pancreatitis aguda; LDH y dímero D elevados orientan a isquemia mesentérica (el dímero D también a disección o rotura aneurismática); hepatograma según la historia; hemocultivos si hay sepsis.',
        'β-hCG en toda mujer en edad fértil con sospecha de abdomen agudo hemorrágico y siempre en el traumático (para saber si se trata a uno o a dos pacientes).',
        'Imágenes: radiografía de tórax y de abdomen (neumoperitoneo, niveles hidroaéreos), ecografía (vesícula, apéndice, líquido libre; FAST en trauma) y TC con contraste endovenoso, el estudio con más información cuando el diagnóstico no es claro. Se piden según el cuadro y sin demorar la cirugía cuando el diagnóstico es evidente.',
    ],
    tratamiento=[{'titulo': 'Manejo inicial y decisión quirúrgica', 'pasos': [
        {'etiqueta': '1', 'texto': 'Reanimación con ABC, vía venosa, hidratación, régimen cero y sonda nasogástrica si hay vómitos o distensión; si hay sepsis o shock séptico, tratarlo sin esperar el diagnóstico definitivo.'},
        {'etiqueta': '2', 'texto': 'Analgesia endovenosa: en dosis moderadas no enmascara ni modifica la evolución del cuadro y permite un mejor examen físico.'},
        {'etiqueta': '3', 'texto': 'Corregir la acidosis metabólica antes de operar; el paciente que va a cirugía debe orinar al menos 0,5 a 1 mL/kg/h.'},
        {'etiqueta': 'Inflamatorio', 'texto': 'Cirugía temprana (piedra angular); control de la infección con cirugía y antibióticos dirigidos. Si el lavado de la cavidad es correcto, no hay evidencia de beneficio de dejar drenajes.'},
        {'etiqueta': 'Hemorrágico / traumático', 'texto': 'Hemodinamia inestable más signos peritoneales indican cirugía. Oclusión completa: la cirugía es la herramienta de elección.'},
        {'etiqueta': 'Vías', 'texto': 'Mínimamente invasiva (percutánea, endoscópica, laparoscópica) o abierta, según el caso; hoy la abierta o la laparoscópica son la primera opción en estos cuadros. Solo en casos seleccionados se intenta un tratamiento conservador.'},
    ]}],
    seguimiento=['Reexaminar al paciente a intervalos: el cuadro es evolutivo. El abdomen agudo posoperatorio es siempre un desafío: vigilar dolor con irritación peritoneal, fiebre, taquicardia, hipotensión, detención de gases y heces, oliguria, PCR > 10 mg/dL, lactato > 2,5 y procalcitonina ≥ 0,3.'],
    banderas=[
        'No hacer el diagnóstico correcto dentro de las 8 horas del inicio puede tener repercusión sobre la evolución vital.',
        'Abdomen en tabla, shock, neumoperitoneo o signos de isquemia: laparotomía urgente.',
        'Los grandes dramas abdominales (pancreatitis grave, infarto mesentérico) pueden tener un examen físico engañoso: sospecharlos por la intensidad del dolor.',
        'Antes de operar, descartar cetoacidosis diabética, que puede simular un abdomen agudo.',
    ],
    fuente=FG('84', 'Abdomen agudo quirúrgico', 'Estudios y manejo inicial coinciden con el manual de la Universidad de Chile (2020).'),
)

# ---------------- apendicitis ----------------
_ap_complicada = [
    A('Plastrón o absceso apendicular: la TC diferencia flemón de absceso. No operar de entrada (complicaciones > 30 %)'),
    A('Flemón: reposo digestivo, líquidos intravenosos, analgesia y antibióticos. Absceso: además, drenaje percutáneo guiado por TC o ecografía (éxito > 85 %)'),
    D('¿Hay inestabilidad, fracaso del tratamiento no operatorio o no se puede drenar (sin ventana, asas interpuestas)?',
      [F('Cirugía')],
      [F('Alta con controles; apendicectomía diferida según criterio del cirujano: riesgo de recidiva 6 a 20 %, pero la cirugía diferida tiene morbilidad > 10 %; se sugiere en niños o ancianos y no en jóvenes y adultos')])]
_ap_cirugia = [
    A('Apendicectomía a la brevedad, de preferencia laparoscópica en centros y manos entrenadas (menos dolor, opioides, estadía e infección de herida); abierta por McBurney o Rockey-Davis'),
    A('Profilaxis antibiótica (guía argentina 2024): cefazolina 2 g + metronidazol 500 mg dentro de los 30 minutos previos a la incisión'),
    D('¿Hay peritonitis generalizada?',
      [F('Lavado de la cavidad, reinicio de la vía oral diferido y antibióticos 7 a 10 días')],
      [F('Sin antibióticos posoperatorios; dieta a las 2 a 6 horas y alta a las 24 a 36 horas')])]
_ap = dict(
    algoritmo=dict(titulo='Sospecha de apendicitis aguda (Giménez 2025)', nodos=[
        I('Dolor en fosa ilíaca derecha: anamnesis, signos (defensa en McBurney, Blumberg), Alvarado, hemograma, PCR, orina y β-hCG en mujeres fértiles'),
        D('¿Hay un cuadro clínico claro con defensa en McBurney?',
          [A('El diagnóstico es clínico: la indicación quirúrgica no depende de los estudios complementarios')],
          [A('Ecografía (si es dudoso); TC con contraste si persiste la duda; resonancia en embarazadas')]),
        D('¿Se confirma una apendicitis aguda?',
          [D('¿Es un plastrón o un absceso apendicular?', _ap_complicada, _ap_cirugia)],
          [F('Buscar otros diagnósticos (ginecológicos, urinarios, ileítis, diverticulitis) y reevaluar con examen seriado')]),
    ]),
    fisiopatologia=[
        'La teoría más aceptada es la obstrucción de la luz apendicular (endoluminal: fecalito, hiperplasia linfoide, cuerpos extraños, tumores; o parietal), que aumenta la presión, causa isquemia e inflamación y favorece la proliferación bacteriana.',
        'Estadios evolutivos: congestiva, flegmonosa (supurativa), gangrenosa y perforada; o, simplificando, apendicitis no complicada y complicada.',
        'Cronología de Murphy: el dolor comienza en el epigastrio o periumbilical, siguen anorexia, náuseas y vómitos, el dolor migra a la fosa ilíaca derecha y aparece fiebre baja. La localización varía según la posición de la punta del apéndice.',
        'En mayores de 65 años los síntomas son más tardíos y solapados: el 50 % llega con apendicitis complicada.',
    ],
    definicion='Inflamación del apéndice cecal cualquiera sea su causa; es la indicación de cirugía de urgencia más frecuente en el mundo. Puede complicarse con perforación, absceso o plastrón.',
    diagnostico=[
        'Dolor periumbilical o epigástrico que migra a la fosa ilíaca derecha (cronología de Murphy), anorexia, náuseas, vómitos y fiebre baja. La defensa muscular en el punto de McBurney es el signo más característico.',
        'Signos: McBurney, Blumberg (descompresión dolorosa), Rovsing, psoas y obturador; tacto rectal o vaginal si el cuadro es dudoso. Presentaciones atípicas: retrocecal, pélvico, adulto mayor y embarazo.',
        'Score de Alvarado (máx. 10): migración del dolor 1, anorexia 1, náuseas o vómitos 1, defensa en McBurney 2, descompresión dolorosa 1, fiebre 1, leucocitosis 2, neutrofilia 1.',
        'Diagnóstico diferencial: gastroenteritis, adenitis mesentérica (niños, tras una infección respiratoria), divertículo de Meckel, invaginación, ileítis terminal por Crohn, diverticulitis, colecistitis, pancreatitis, úlcera perforada, cólico renal, pielonefritis y, en mujeres fértiles, ectópico, quiste roto, torsión de ovario, folículo hemorrágico, salpingitis y enfermedad pélvica inflamatoria (dolor a la movilización cervical: signo de Frenkel).',
        'El diagnóstico es clínico: un paciente con anamnesis y examen sospechosos tiene indicación quirúrgica sin importar los estudios; hoy suele pedirse un estudio antes de operar o de descartar el cuadro.',
    ],
    estudios=[
        'Laboratorio: leucocitosis con neutrofilia, PCR elevada, orina y β-hCG en mujeres en edad fértil.',
        'Ecografía: sensibilidad y especificidad cercanas al 85 %, dependiente del operador. Apéndice ≥ 7 mm, no compresible, grasa periapendicular ecogénica, líquido o colección; puede combinarse con ecografía transvaginal.',
        'TC con contraste: sensibilidad y especificidad > 90 %; muestra el apendicolito y distingue flemón de absceso; es el método de elección para el plastrón. Resonancia: sensibilidad y especificidad cercanas al 97 %, útil en embarazadas, poco usada por costo y acceso.',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Quirúrgico', 'texto': 'Apendicectomía a la brevedad, abierta (McBurney o Rockey-Davis) o laparoscópica. En centros y manos entrenadas el abordaje de elección es el laparoscópico: menos dolor, menos opioides, menor estadía, menos infección de herida y regreso laboral más rápido; hoy no hay más abscesos que en la vía abierta.'},
        {'etiqueta': 'Profilaxis (guía argentina 2024)', 'texto': 'Apendicectomía no complicada: cefazolina 2 g + metronidazol 500 mg dentro de los 30 minutos previos a la incisión.'},
        {'etiqueta': 'Posoperatorio', 'texto': 'No complicada: sin antibióticos, dieta a las 2 a 6 horas y alta a las 24 a 36 horas. Con peritonitis generalizada: dieta diferida hasta descartar íleo y antibióticos 7 a 10 días.'},
        {'etiqueta': 'Plastrón o absceso', 'texto': 'No operar de entrada (complicaciones > 30 %): reposo digestivo, líquidos, analgesia y antibióticos; si es absceso, drenaje percutáneo (éxito > 85 %). Cirugía si hay inestabilidad, fracaso o imposibilidad de drenar. La apendicectomía diferida queda a criterio del cirujano.'},
        {'etiqueta': 'Antibióticos solos', 'texto': 'No es el tratamiento de primera línea: ≥ 40 % necesita apendicectomía en el primer año (46 % a los 2 años y 49 % a los 4), con más reinternaciones. Solo caso por caso en no complicadas que no pueden operarse, informando los riesgos.'},
    ]}],
    seguimiento=['Morbilidad posoperatoria cercana al 5 % en no complicadas y > 30 % en perforadas con peritonitis; mortalidad < 1 %. Complicaciones tempranas: hemorragia, infección de herida, evisceración, íleo, absceso intraabdominal y fístula cecal; tardías: oclusión y eventración.'],
    banderas=[
        'El diagnóstico es clínico: no retrasar la cirugía por esperar estudios si el cuadro es claro.',
        'Adulto mayor: el 50 % llega complicado; mayor demora diagnóstica.',
        'Mujer en edad fértil: descartar causas ginecológicas (β-hCG, ecografía transvaginal) antes de operar.',
        'Apendicectomía en un flemón o absceso: más de 30 % de complicaciones (perforación, resecciones colónicas).',
    ],
    contraste={'estado': 'difiere', 'fuente': 'Guía intersociedades de profilaxis 2024 (SADI) y manual de la Universidad de Chile (2020)',
               'puntos': ['La guía argentina indica cefazolina 2 g (el manual chileno menciona 1 g): prevalece la guía argentina.',
                          'El manual chileno propone cirugía diferida a las 4 a 6 semanas del plastrón; Giménez deja la apendicectomía diferida a criterio del cirujano (no recomendada de rutina en jóvenes y adultos).']},
    fuente=FG('70', 'Apendicitis aguda', 'Profilaxis: guía argentina de profilaxis 2024.'),
)

# ---------------- dolor en fosa ilíaca derecha ----------------
_dolor_fid = dict(
    algoritmo=dict(titulo='Dolor en fosa ilíaca derecha: diagnóstico diferencial (Giménez 2025)', nodos=[
        I('Dolor en fosa ilíaca derecha: edad, sexo, ciclo menstrual, síntomas urinarios y digestivos; examen abdominal, tacto rectal y, en mujeres, tacto vaginal'),
        D('¿Mujer en edad fértil?',
          [A('β-hCG, orina y ecografía transvaginal; considerar ectópico, quiste roto, torsión de ovario, folículo hemorrágico, salpingitis o enfermedad pélvica inflamatoria'),
           D('¿El cuadro clínico es de apendicitis?', [F('Tratar como apendicitis aguda (ver la ficha)')], [F('Tratar la causa ginecológica o urinaria que se confirme')])],
          [D('¿Hay migración del dolor, anorexia y defensa en McBurney?',
             [F('Apendicitis aguda: apendicectomía (ver la ficha)')],
             [A('Ecografía y TC según la edad: niños (adenitis mesentérica, gastroenteritis, Meckel, invaginación); adultos (ileítis, diverticulitis, cólico renal, colecistitis); mayores (diverticulitis, tumores de ciego o apéndice)'),
              F('Reevaluar con examen seriado si el diagnóstico sigue dudoso')])]),
    ]),
    diagnostico=[
        'Niños: adenitis mesentérica (tras infección respiratoria, adenomegalias en la ecografía), gastroenteritis (vómitos antes del dolor), divertículo de Meckel, invaginación (sobre todo en mayores de 2 años) y vólvulo.',
        'Mujeres en edad fértil (el mayor desafío): ectópico, torsión de ovario, quiste roto, folículo hemorrágico (dolor hipogástrico o en ambas fosas ilíacas, más evidente a la descompresión que la defensa), salpingitis y enfermedad pélvica inflamatoria (dolor a la movilización cervical: signo de Frenkel), endometriosis (varía con el ciclo).',
        'Adultos: ileítis terminal por enfermedad de Crohn, diverticulitis cecal o sigmoidea (sigma redundante), colecistitis, pancreatitis, úlcera duodenal perforada, cólico renal, pielonefritis, epididimitis, cetoacidosis.',
        'Adulto mayor: tumores de ciego o apéndice (pérdida de peso, síntomas constitucionales o anemia), diverticulitis, infección urinaria. En mujeres jóvenes con apéndice normal en cirugía, pensar en causa ginecológica.',
    ],
    banderas=[
        'Embarazo ectópico roto en una mujer con dolor y β-hCG positiva: emergencia.',
        'Torsión de ovario o de testículo: cuadros que no deben retrasarse.',
        'En el adulto mayor, un tumor de ciego o de apéndice puede simular una apendicitis.',
    ],
    fuente=FG('70', 'Apendicitis aguda (diagnósticos diferenciales, cuadro 70-2)', 'Edad y sexo orientan el diagnóstico diferencial.'),
)

# ---------------- peritonitis ----------------
_peri = dict(
    algoritmo=dict(titulo='Peritonitis aguda difusa (Giménez 2025)', nodos=[
        I('Dolor abdominal con defensa o contractura, fiebre y compromiso del estado general: reanimar, laboratorio con lactato, hemocultivos y estudio por imágenes sin demorar'),
        A('Antibióticos empíricos de amplio espectro (gramnegativos y anaerobios) lo antes posible; luego dirigidos según el frotis y el cultivo del líquido abdominal'),
        D('¿Hay peritonitis difusa o inestabilidad hemodinámica?',
          [A('Cirugía temprana (laparoscópica o abierta): suturar, desbridar o resecar el órgano afectado y lavar la cavidad de forma generosa y exhaustiva'),
           A('Con un lavado correcto no hay evidencia de beneficio de dejar drenajes'),
           F('Terapia intensiva en las formas graves; reevaluar con TC si no hay mejoría (peritonitis terciaria o colecciones)')],
          [D('¿Es una colección localizada de más de 3 a 4 cm en un paciente estable?',
             [F('Drenaje percutáneo guiado por imágenes más antibióticos (ver la ficha de colecciones abdominales)')],
             [F('Antibióticos y observación con reevaluación seriada')])]),
    ]),
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Reanimación', 'texto': 'Fluidos, soporte hemodinámico y oxigenación; manejo de la sepsis.'},
        {'etiqueta': 'Antibióticos', 'texto': 'Profilácticos de amplio espectro al inicio y dirigidos cuando se conocen el frotis y el cultivo del líquido abdominal.'},
        {'etiqueta': 'Control del foco', 'texto': 'Cirugía temprana (mínimamente invasiva o abierta) para resolver la causa; el lavado abdominal generoso y exhaustivo es muy importante y, si es correcto, no hay evidencia de beneficio con drenajes.'},
        {'etiqueta': 'Drenaje percutáneo', 'texto': 'Reservado a colecciones localizadas en pacientes estables.'},
    ]}],
    fuente=FG('84', 'Abdomen agudo quirúrgico', 'Definición, causas y estudios se mantienen del manual de la Universidad de Chile (2020).'),
)

# ---------------- obstrucción intestinal ----------------
_obs = dict(
    algoritmo=dict(titulo='Obstrucción intestinal (Giménez 2025 y manual de la Universidad de Chile)', nodos=[
        I('Dolor cólico, vómitos, distensión y detención de gases y heces: reanimación, ionograma, lactato, radiografía y TC de abdomen y pelvis'),
        D('¿Hay signos de estrangulación o isquemia (dolor continuo, fiebre, taquicardia, signos peritoneales, lactato alto), hernia incarcerada, perforación o peritonitis?',
          [F('Cirugía de urgencia')],
          [D('¿La oclusión es completa?',
             [F('La cirugía es la herramienta terapéutica de elección (Giménez)')],
             [A('Régimen cero, sonda nasogástrica, corrección hidroelectrolítica y vigilancia estricta (se puede ensayar en bridas sin signos de gravedad)'),
              D('¿Fracasa el manejo conservador o hay progresión?', [F('Cirugía')], [F('Reiniciar la dieta con seguimiento')])])]),
    ]),
    diagnostico=[
        'Dolor por crisis (retortijón): empieza en el sitio del obstáculo, recorre el abdomen y vuelve al punto de inicio (signo de reptación por el peristaltismo violento); náuseas y vómitos, detención de heces y gases y distensión abdominal.',
        'La estrangulación sugiere dolor continuo, fiebre, taquicardia y signos peritoneales.',
        'Radiografía de abdomen: dilatación de asas, niveles hidroaéreos y ausencia de gas distal; válvulas conniventes cruzando todo el diámetro (delgado) o haustras (colon). Signos de complicación: neumoperitoneo, neumatosis, gas portal; "grano de café" en el vólvulo de sigmoides; aerobilia en el íleo biliar.',
    ],
    fuente=FG('84', 'Abdomen agudo quirúrgico (abdomen agudo oclusivo)', 'Cuadro clínico y conducta según Giménez; imágenes y manejo conservador del manual de la Universidad de Chile (2020).'),
)

CONTENIDO = {
    'cx-abdomen-agudo-enfoque': _aa,
    'cx-apendicitis-aguda': _ap,
    'cx-dolor-fosa-iliaca-derecha': _dolor_fid,
    'cx-peritonitis-aguda': _peri,
    'cx-obstruccion-intestinal': _obs,
}

# ---------------- ficha nueva: colecciones abdominales ----------------
_col_alg = dict(titulo='Colección abdominopélvica (Giménez 2025)', nodos=[
    I('Sospecha clínica (fiebre, dolor, leucocitosis, antecedente de cirugía o perforación): TC o ecografía para localizar y caracterizar la colección'),
    D('¿La colección es > 3 a 4 cm, sintomática o hay sospecha de infección?',
      [A('Drenaje percutáneo (Seldinger-Cope) guiado por ecografía, TC o radioscopia, con muestra para bacteriología más antibióticos'),
       A('Verificar una ruta segura: evitar pleura, vasos mayores y vísceras huecas; corregir plaquetas < 50.000 o RIN > 1,8'),
       D('¿Débito < 20 a 30 mL/día, claro, y buena evolución?',
         [F('Retirar el drenaje')],
         [A('TC de control; abscesografía si se sospecha fístula (digestiva, biliar o urinaria) o sector no drenado'),
          F('Cirugía si hay mala evolución, colección compleja o necesidad de resolver la causa')])],
      [F('Antibióticos empíricos; punción solo si evoluciona mal o se necesita una muestra')]),
])
NUEVAS = [{
    'id': 'cx-colecciones-abdominales',
    'area': 'cirugia',
    'titulo': 'Colecciones y abscesos abdominales: drenaje percutáneo',
    'alias': ['absceso intraabdominal', 'colecciones abdominales', 'absceso subfrenico', 'absceso pelvico', 'drenaje percutaneo', 'absceso del psoas', 'absceso esplenico', 'absceso perirrenal'],
    'up': ['cx2'],
    'unidad': 'UP2 · Abdomen agudo',
    'estado': 'verificar',
    'definicion': 'Acumulación localizada de líquido (pus, bilis, sangre, líquido pancreático o urinario) en la cavidad abdominopélvica. Se clasifica por tipo en simples, de mediana complejidad y complejas, y por topografía en viscerales, peritoneales y retroperitoneales.',
    'diagnostico': [
        'Sospechar con un índice clínico alto: fiebre, dolor, leucocitosis, íleo, antecedente de cirugía abdominal, perforación visceral o fístula.',
        'Tipos: simples (uniloculares, bien demarcadas), de mediana complejidad (poco loculadas, contenido algo viscoso, fístulas de bajo débito) y complejas (multiloculadas, fístula de alto débito, tejido necrótico o cuerpos extraños, muy viscosas).',
        'Topografía peritoneal: el colon transverso y su meso separan un piso supramesocólico (subfrénicas, subhepática, transcavidad de los epiplones) y uno inframesocólico (goteras parietocólicas, espacios interasas y pelvis, la zona más declive). Las subfrénicas y pélvicas son las más difíciles de abordar.',
    ],
    'estudios': [
        'La ecografía permite ver la colección y guiar el drenaje en tiempo real, sin radiación y a la cabecera; está limitada por el aire, el hueso y la obesidad.',
        'La TC define la ruta de punción segura incluso en colecciones profundas, a costa de radiación y más tiempo. La radioscopia sirve para recambiar o instrumentar drenajes en colecciones complejas.',
        'Análisis del contenido (bacteriológico y citoquímico) para distinguir absceso de hematoma, seroma, tumor necrosado o comunicación fistulosa.',
    ],
    'tratamiento': [
        {'titulo': 'Indicación y técnica del drenaje percutáneo', 'pasos': [
            {'etiqueta': 'Indicación', 'texto': 'Colección sospechosa de infección, mayor de 3 a 4 cm, sintomática, o como maniobra temporizadora antes de la cirugía definitiva. Las menores de 3 a 4 cm se tratan con antibióticos empíricos.'},
            {'etiqueta': 'Contraindicación', 'texto': 'Falta de una ruta segura (evitar pleura, vasos jerárquicos y vísceras huecas) y negativa del paciente. Corregir plaquetas < 50.000 o RIN > 1,8 (ideal 70.000 y RIN 1 a 1,2).'},
            {'etiqueta': 'Técnica', 'texto': 'Seldinger-Cope (aguja, guía, dilatación, catéter). Lavar el catéter 2 a 3 veces por día con suero fisiológico desde las 24 horas; retirar con débito < 20 a 30 mL/día y claro.'},
            {'etiqueta': 'Complicaciones', 'texto': 'Mayores: hemorragia, sepsis y lesión visceral. Menores: dolor, infección de pared, rotura u obstrucción del drenaje.'},
        ]},
        {'titulo': 'Según el sitio', 'pasos': [
            {'etiqueta': 'Fístulas', 'texto': 'No contraindican el drenaje: más del 60 % cierran por esta vía y se llega a la cirugía electiva en mejores condiciones.'},
            {'etiqueta': 'Absceso esplénico', 'texto': 'Único > 3 cm o dos abscesos: drenaje percutáneo, superior a la esplenectomía; múltiples y pequeños: esplenectomía.'},
            {'etiqueta': 'Absceso del psoas', 'texto': 'Drenaje si > 6 cm (algunas series desde 4 cm); menores, antibióticos; entre 4 y 6 cm, probar tratamiento médico y drenar según evolución.'},
            {'etiqueta': 'Renal y perirrenal', 'texto': 'Decisión con urología (puede requerir nefrectomía o tratar la obstrucción).'},
        ]},
    ],
    'seguimiento': ['TC de control ante mala evolución, colecciones multiloculadas o múltiples; ecografía en cualquier momento a la cabecera. Anotar el débito y sus características.'],
    'banderas': [
        'No punzar a través de la pleura (empiema), vasos mayores ni asas o vejiga.',
        'Las colecciones interasas profundas pueden requerir cirugía para evitar lesionar el delgado.',
        'Sin control del foco, la infección intraabdominal no se resuelve: drenaje o cirugía a tiempo.',
    ],
    'algoritmo': _col_alg,
    'fuente': FG('10', 'Manejo de las colecciones abdominales'),
    'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.',
}]
