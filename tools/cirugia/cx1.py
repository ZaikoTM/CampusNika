# -*- coding: utf-8 -*-
"""UP1 · Trauma de miembro superior y generalidades quirúrgicas. Base: Giménez 2.ª ed. (2025), caps. 7 (anestesiología), 9 (infección en cirugía) y 81 (necrosis de partes blandas). Las fichas con guía argentina la conservan como fuente principal; la traumatología (CTO) no está en Giménez y se reordena como algoritmo."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- higiene de manos y antisepsia ----------------
CONTENIDO['cx-asepsia-higiene-manos'] = dict(
    algoritmo=dict(titulo='Preparación aséptica del equipo y del paciente (guía argentina de prevención de la ISQ)', nodos=[
        I('Cirugía programada: preparar al equipo y al paciente antes de la incisión'),
        A('Equipo: retirar anillos, relojes y pulseras; uñas cortas y naturales; higiene de manos quirúrgica respetando los tiempos del antiséptico y secado con compresa estéril'),
        D('¿Hay alergia al antiséptico?',
          [A('Jabón neutro con controles microbiológicos y luego alcohol; descartar los jabones en barra tras cada uso')],
          [A('Antiséptico habitual con fricción')]),
        A('Paciente: baño el día previo y el día de la cirugía; el vello no se retira salvo que interfiera y, si es necesario, con clipper'),
        A('Antisepsia de la piel limpia y seca con antiséptico aprobado por ANMAT, de base alcohólica salvo contraindicación; fricción de las áreas más limpias a las más sucias y respetar el tiempo de secado antes de colocar los campos'),
        F('Envases monodosis o los más pequeños posibles, descartados una vez abiertos'),
    ]),
    fuente=FC('9', 'Infección en cirugía'),
)

# ---------------- paquete ISQ ----------------
CONTENIDO['cx-isq-paquete'] = dict(
    algoritmo=dict(titulo='Paquete de prevención de la infección del sitio quirúrgico (guía argentina y Giménez 2025)', nodos=[
        I('Las ISQ son la primera causa de infección asociada al cuidado de la salud: aumentan la morbimortalidad, la estadía y los costos, y muchos factores de riesgo son evitables'),
        A('Antes: evaluar estado nutricional y tabaquismo, controlar la glucemia, baño, vello solo con clipper si interfiere; hisopado nasal y axilar para Staphylococcus aureus en cirugía con implantes (traumatología), neurocirugía y cirugía cardiovascular; en cirugía colónica electiva, antibióticos orales con preparación mecánica'),
        A('Durante: profilaxis antibiótica correcta (dosis única 30 a 60 minutos antes de la incisión; su administración inapropiada es el principal factor de riesgo), normotermia (> 35,5 °C), quirófano con puertas cerradas y circulación mínima, higiene de manos y antisepsia adecuadas'),
        A('Después: FiO2 alta entre 2 y 6 horas, glucemia 110 a 150 mg/dL, primera curación a las 24 a 48 horas con técnica aséptica y suero fisiológico estéril; no prolongar la profilaxis por drenajes'),
        D('¿Hay sospecha de infección de la herida?',
          [F('Tomar muestras aptas para cultivo (tejido, líquidos o secreción durante el acto quirúrgico, o material de heridas o colecciones por punción a través de piel sana) y tratar')],
          [F('Seguimiento de la herida hasta el alta')]),
    ]),
    fuente=FC('9', 'Infección en cirugía'),
)

# ---------------- profilaxis antibiótica ----------------
CONTENIDO['cx-profilaxis-antibiotica'] = dict(
    algoritmo=dict(titulo='Profilaxis antibiótica quirúrgica (guía intersociedades 2024 y Giménez 2025)', nodos=[
        I('¿El procedimiento requiere profilaxis? Colecistectomía laparoscópica electiva de bajo riesgo: no se indica de rutina'),
        A('Fármaco base: cefazolina 2 g en bolo (3 g si el peso es 120 kg o más); apendicectomía y abdomen agudo: sumar metronidazol 500 mg; hernioplastia: cefazolina 2 g (la malla es un dispositivo)'),
        A('Momento: una dosis única dentro de los 30 minutos previos a la incisión (30 a 60 minutos según Giménez); fuera de ese momento no cumple ninguna función'),
        D('¿Se prolonga el procedimiento o la pérdida de volemia supera el 50 %?',
          [A('Repetir la dosis cada dos vidas medias (cefazolina: cada 4 horas)')],
          [A('No repetir')]),
        D('¿Es ortopedia o traumatología?',
          [F('Hasta 24 horas como máximo; fractura expuesta IIIa: cefazolina más gentamicina; IIIB-C hasta 72 horas')],
          [F('Dosis única; no continuar en el posoperatorio ni por drenajes; no usar vancomicina de rutina')]),
    ]),
    fuente=FC('9', 'Infección en cirugía'),
)

# ---------------- herida aguda ----------------
CONTENIDO['cx-herida-aguda'] = dict(
    algoritmo=dict(titulo='Herida aguda', nodos=[
        I('Herida cortante o contusa: evaluar tendones, nervios, vasos, cuerpos extraños y tiempo de evolución; estado de vacunación antitetánica'),
        A('Hemostasia por compresión y anestesia local calculando la dosis máxima por peso; limpiar el entorno con antiséptico e irrigar con abundante suero fisiológico; retirar cuerpos extraños y tejido desvitalizado'),
        D('¿Hay infección activa, contaminación importante (mordeduras) o un defecto que obliga a cerrar con tensión excesiva?',
          [F('No cerrar de entrada: cierre diferido (tercera intención) tras controlar la contaminación; antibióticos según el grado')],
          [A('Cierre primario (mejor resultado) con el material y la técnica adecuados a la zona'),
           F('Antibiótico según la contaminación (tipo 1 no requiere; tipos 2 y 3 profilaxis; tipo 4 tratamiento) y control con signos de alarma')]),
    ]),
    fuente=FC('9', 'Infección en cirugía'),
)

# ---------------- cicatrización ----------------
CONTENIDO['cx-cicatrizacion'] = dict(
    algoritmo=dict(titulo='Cicatrización y tipos de cierre', nodos=[
        I('Herida a cerrar: evaluar contaminación, tiempo y factores locales (infección, tensión, isquemia, cuerpos extraños, hematoma) y sistémicos (desnutrición, tabaquismo, diabetes, corticoides)'),
        D('¿Está limpia y con bordes aproximables?',
          [F('Primera intención: mejor resultado estético y funcional y curación más rápida')],
          [D('¿Hay contaminación o infección que controlar?',
             [F('Tercera intención (cierre diferido) una vez controlada la infección')],
             [F('Segunda intención: la herida cierra sola por granulación y contracción, con más tiempo y cicatriz mayor')])]),
        A('Corregir los factores que interfieren con la cicatrización; la respuesta a la lesión prolongada también la deteriora'),
    ]),
    fuente=FC('6', 'Respuesta a la lesión'),
)

# ---------------- suturas ----------------
CONTENIDO['cx-suturas-materiales-nudos'] = dict(
    algoritmo=dict(titulo='Elección del material de sutura y del nudo', nodos=[
        I('Tejido a suturar: ¿necesita soporte prolongado (tendones, fascias, vasos, piel) o cicatriza rápido (mucosas, subcutáneo)?'),
        D('¿Cicatriza rápido y es un plano profundo?',
          [A('Material absorbible')],
          [A('Material no absorbible')]),
        D('¿Hay riesgo de infección o hay que cuidar el tejido?',
          [A('Monofilamento: menor riesgo de infección y de lesión del tejido')],
          [A('Multifilamento: mejor manejo y seguridad del nudo')]),
        F('Nudo cuadrado como nudo básico; nudo de cirujano (doble vuelta en el primer lazo) para poliéster y polipropileno; nudo con instrumentos en cavidades profundas, sin tensión hacia arriba'),
    ]),
)

# ---------------- evaluación preoperatoria ----------------
CONTENIDO['cx-evaluacion-preoperatoria'] = dict(
    algoritmo=dict(titulo='Evaluación preoperatoria (Giménez 2025)', nodos=[
        I('Paciente con indicación quirúrgica: evaluación preanestésica que busca optimizar las condiciones clínicas antes de la cirugía'),
        A('Preparación psicológica: explicar el procedimiento, reducir la ansiedad y evaluar el estrés preoperatorio'),
        A('Preparación física: estado homeostático, reserva nutricional, balance del medio interno y funciones cardiovascular, respiratoria, renal y hepática; riesgo quirúrgico y anestésico (ASA)'),
        A('Inmediato: ayuno, premedicación, consentimiento informado firmado y lista de verificación (check list) de seguridad'),
        D('¿El riesgo es inaceptable o el paciente está mal optimizado?',
          [F('Diferir si la cirugía es programada y optimizar (nutrición, comorbilidades); si es urgente, operar con el mejor soporte posible')],
          [F('Continuar con la cirugía')]),
    ]),
    fuente=FC('7', 'Anestesiología (evaluación preanestésica)'),
)

# ---------------- posoperatorio ----------------
CONTENIDO['cx-postoperatorio'] = dict(
    algoritmo=dict(titulo='Posoperatorio y signos de alarma (Giménez 2025)', nodos=[
        I('Recuperación anestésica: en la sala de recuperación (primeras 2 horas) se detectan pérdida de conciencia, hipoxia, hipotensión sostenida, arritmias o dolor intenso; con ventilación mecánica o control hemodinámico complejo, cuidados intensivos'),
        A('Mediato: control de dolor y signos vitales, movilización precoz y reinicio de la ingesta'),
        D('¿Hay signos de alarma (dolor con irritación peritoneal, fiebre > 1 °C sobre lo normal o de más de 2 días, pulso > 100 o < 60, PAS < 90, frecuencia respiratoria > 20, detención de gases y heces, náuseas y vómitos, oliguria, herida inflamada o con drenaje purulento)?',
          [F('Sospechar una complicación (infección de herida, dehiscencia, íleo, colección, fístula): examen, laboratorio (PCR, lactato, procalcitonina) e imágenes, y reintervenir si corresponde')],
          [F('Alta con criterios clínicos, indicaciones escritas, signos de alarma y control')]),
    ]),
    banderas=[
        'Signos de alarma: PCR > 10 mg/dL, lactato > 2,5 y procalcitonina ≥ 0,3 sugieren complicación intraabdominal.',
        'El abdomen agudo posoperatorio es siempre un desafío diagnóstico, aun para cirujanos experimentados.',
    ],
    fuente=FC('84', 'Abdomen agudo quirúrgico (signos de alarma del posoperatorio)'),
)

# ---------------- traumatología del miembro superior (CTO) ----------------
CONTENIDO['cx-fractura-radio-distal'] = dict(
    algoritmo=dict(titulo='Fractura del extremo distal del radio (Manual CTO)', nodos=[
        I('Caída sobre la mano con deformidad "en dorso de tenedor" y dolor en la muñeca: radiografía de frente y perfil; evaluar el estado neurovascular'),
        D('¿Es estable y no desplazada (tipo Colles)?',
          [F('Reducción cerrada y yeso, con controles radiológicos semanales hasta la 4.ª o 5.ª semana; consolida en unas 6 semanas')],
          [F('Inestable o redesplazada: cirugía (agujas de Kirschner, fijador externo o placa con tornillos; injerto si hay defecto); Smith, Barton, Hutchinson y las de alta energía en jóvenes suelen requerir reducción abierta y osteosíntesis')]),
    ]),
)

CONTENIDO['cx-fractura-escafoides'] = dict(
    algoritmo=dict(titulo='Fractura del escafoides carpiano (Manual CTO)', nodos=[
        I('Dolor en la tabaquera anatómica tras una caída sobre la mano: radiografías de escafoides'),
        D('¿Se ve la fractura?',
          [D('¿Está desplazada o es inestable?',
             [F('Reducción y osteosíntesis quirúrgica')],
             [F('Sin desplazar: inmovilización con yeso que incluya el primer dedo durante 2 o 3 meses, con control radiográfico')])],
          [F('Sospecha sin fractura visible: inmovilizar la muñeca y repetir la radiografía a las 2 semanas')]),
    ]),
)

CONTENIDO['cx-fractura-clavicula'] = dict(
    algoritmo=dict(titulo='Fractura de clavícula (Manual CTO)', nodos=[
        I('Dolor y deformidad tras una caída sobre el hombro: radiografía; examen neurovascular'),
        D('¿Hay desplazamiento importante, exposición o compromiso neurovascular?',
          [F('Tratamiento quirúrgico en casos seleccionados')],
          [F('Conservador (la inmensa mayoría): vendaje en ocho si hay desplazamiento o cabestrillo de Velpeau si es poco desplazada, durante unas 4 a 5 semanas')]),
    ]),
)

CONTENIDO['cx-luxacion-glenohumeral'] = dict(
    algoritmo=dict(titulo='Luxación de hombro (Manual CTO)', nodos=[
        I('Dolor intenso, hombro en charretera e impotencia: radiografía y examen neurovascular (nervio axilar)'),
        A('Reducción cerrada urgente con analgesia o sedación y control radiográfico y neurovascular posterior'),
        F('Cabestrillo y rehabilitación; el tiempo depende de la edad y del riesgo de recidiva. Acromioclavicular: grados I y II conservadores; grado III se individualiza'),
    ]),
)

CONTENIDO['cx-inmovilizaciones-yeso'] = dict(
    algoritmo=dict(titulo='Inmovilización con yeso o férula', nodos=[
        I('Lesión que requiere inmovilización: inmovilizar la articulación proximal y distal en posición funcional'),
        A('Acolchar las prominencias óseas, no comprimir, moldear sin presionar con los dedos y dejar libres los dedos'),
        D('¿Aparece dolor creciente, parestesias, cianosis o frialdad?',
          [F('Retirar o abrir el yeso de inmediato y descartar un síndrome compartimental')],
          [F('Indicaciones al paciente: elevar el miembro, mover los dedos y consultar ante signos de alarma')]),
    ]),
)

# ---------------- anestesia ----------------
CONTENIDO['cx-anestesia-tipos-riesgo'] = dict(
    algoritmo=dict(titulo='Anestesia: evaluación y elección de la técnica (Giménez 2025)', nodos=[
        I('Evaluación preanestésica para optimizar al paciente; riesgo según la clasificación ASA'),
        A('Preparación: reducir la ansiedad, prevenir náuseas y vómitos y controlar los efectos vagales y las secreciones'),
        D('¿El procedimiento admite anestesia regional (con apoyo ecográfico)?',
          [A('Anestesia regional: la ecografía localiza mejor el sitio, con menos fármaco y menor riesgo de intoxicación por anestésicos locales')],
          [A('Anestesia general con fármacos de acción y metabolismo previsibles y pocos efectos posteriores')]),
        A('Monitorización mínima: signos vitales, oximetría de pulso y capnografía (obligatorios desde los años 90 y fuente de mayor seguridad); fluidos guiados por objetivos'),
        F('Recuperación en la sala de recuperación anestésica durante las primeras 2 horas; ventilación mecánica o control hemodinámico complejo: cuidados intensivos'),
    ]),
    fuente=FG('7', 'Anestesiología', 'Preparación y elección de la técnica según el manual de Márquez y Muñoz Maldonado.'),
)

# ---------------- infecciones localizadas de la piel ----------------
CONTENIDO['cx-infecciones-piel-forunculo-antrax'] = dict(
    algoritmo=dict(titulo='Infecciones localizadas de la piel (Michans y Giménez 2025)', nodos=[
        I('Foliculitis, forúnculo, ántrax o hidrosadenitis: examen local y búsqueda de afecciones generales (diabetes, inmunodepresión)'),
        D('¿Hay un absceso colectado?',
          [F('Drenaje quirúrgico del absceso; ántrax: tratamiento médico y quirúrgico según el germen y su sensibilidad')],
          [F('Forúnculo aislado: curaciones periódicas con antisépticos locales y analgésicos; no acelerar su evolución quirúrgicamente ni malaxarlo; explicar la enfermedad')]),
    ]),
    fuente=FC('9', 'Infección en cirugía'),
)

# ---------------- infecciones severas de partes blandas ----------------
CONTENIDO['cx-infecciones-severas-partes-blandas'] = dict(
    algoritmo=dict(titulo='Infección necrosante de partes blandas (Giménez 2025)', nodos=[
        I('Dolor desproporcionado para los hallazgos locales con afección sistémica: alto índice de sospecha para diagnosticar y tratar de forma temprana (infección polimicrobiana, la más frecuente; también GAS o S. aureus)'),
        A('Antibióticos de amplio espectro: gramnegativos, anaerobios y SAMR (ampicilina-sulbactam, piperacilina-tazobactam, carbapenemes, vancomicina, metronidazol); agregar clindamicina o linezolid por su efecto antitoxina (GAS); antifúngicos solo ante sospecha de Candida'),
        A('Desbridamiento quirúrgico temprano y completo de todos los tejidos necróticos, con reintervenciones hasta controlar la infección; cuidados intensivos'),
        F('Adecuar el antibiótico al cultivo y mantenerlo hasta que no haya más desbridamientos, haya mejoría y el paciente esté 48 a 72 horas sin fiebre; cámara hiperbárica e inmunoglobulina sin evidencia concluyente'),
    ]),
    diagnostico=[
        'Las infecciones necrosantes son infrecuentes, de alta morbilidad: mortalidad cercana al 25 % (67 % con síndrome de shock tóxico). Se clasifican en cuatro tipos; la más frecuente es la polimicrobiana.',
        'Peor pronóstico: inmunocomprometidos, mayores de 65 años, comorbilidades, hipotensión, leucopenia, bacteriemia, Aeromonas o Vibrio, APACHE II > 13 y AINE en infecciones por GAS. El tratamiento quirúrgico temprano y el esquema con clindamicina mejoran la mortalidad.',
    ],
    fuente=FG('81', 'Necrosis de partes blandas', 'Complementa con el cap. 9 (infección en cirugía): las infecciones de piel y partes blandas necrosantes son urgencias quirúrgicas e infectológicas.'),
)

NUEVAS = []
