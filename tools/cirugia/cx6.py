# -*- coding: utf-8 -*-
"""UP6 · Dolor inguinal y pared abdominal. Base: Giménez 2.ª ed. (2025), caps. 12 (hernia inguinal, crural y umbilical), 13 (eventraciones y evisceraciones), 14 (diástasis) y 15 (hernias infrecuentes)."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- hernia inguinal ----------------
CONTENIDO['cx-hernia-inguinal'] = dict(
    algoritmo=dict(titulo='Hernia inguinal (Giménez 2025)', nodos=[
        I('Tumoración inguinal que aumenta con el esfuerzo: el examen físico confirma el diagnóstico en la mayoría; ecografía si hay duda (obesos, mujeres, sospecha de hernia femoral)'),
        D('¿Está incarcerada o estrangulada (dolor, irreductible, signos de obstrucción)?',
          [F('Cirugía de urgencia (ver la ficha de hernia complicada): la cirugía electiva tiene menor morbimortalidad que la de urgencia')],
          [A('Indicación quirúrgica electiva: discutir el momento con el paciente'),
           D('¿Es unilateral sintomática primaria?',
             [A('Reparación sin tensión con malla: Lichtenstein abierta o laparoscópica (TEP o TAPP) con la misma recurrencia; recomendación fuerte para Lichtenstein')],
             [A('Bilateral o recidivada: la laparoscópica tiene ventajas')]),
           F('Sin malla solo en casos seleccionados o campo contaminado: técnica de Shouldice')]),
    ]),
    diagnostico=[
        'Las hernias inguinocrurales son la salida de una víscera o tejido a través del cuadrilátero miopectíneo de Fruchaud. Indirectas: laterales, emergen por fuera de los vasos epigástricos. Directas: mediales, por dentro de los vasos epigástricos. Femorales: por debajo del ligamento inguinal, por el anillo crural.',
        'El examen físico basta en la mayoría de los casos; se recomienda sumar ecografía en la duda diagnóstica (obesos, mujeres con posible hernia femoral).',
    ],
    banderas=[
        'La hernia femoral y la umbilical se estrangulan con frecuencia por la rigidez de sus anillos: no demorar el tratamiento.',
        'El tratamiento electivo tiene menos morbimortalidad que el de urgencia.',
    ],
    fuente=FG('12', 'Hernia inguinal, crural y umbilical', 'Técnicas (Lichtenstein, laparoscópica) y profilaxis según la Enciclopedia de Cirugía Digestiva de F. Galindo y la guía de profilaxis 2024.'),
)

# ---------------- hernia crural ----------------
CONTENIDO['cx-hernia-crural'] = dict(
    algoritmo=dict(titulo='Hernia crural o femoral (Giménez 2025)', nodos=[
        I('Tumoración bajo el ligamento inguinal, más frecuente en mujeres; ecografía si hay duda diagnóstica'),
        D('¿Está estrangulada?',
          [F('Exploración urgente, resección intestinal si hay isquemia y reparación')],
          [F('Reparación siempre indicada y sin demora por el alto riesgo de estrangulación: hernioplastia sin tensión con malla, abierta o laparoscópica')]),
    ]),
    fuente=FG('12', 'Hernia inguinal, crural y umbilical', 'Las hernias femorales tienen alta frecuencia de estrangulación por la rigidez del anillo.'),
)

# ---------------- hernia umbilical y epigástrica ----------------
CONTENIDO['cx-hernia-umbilical-epigastrica'] = dict(
    algoritmo=dict(titulo='Hernia umbilical y epigástrica (Giménez 2025)', nodos=[
        I('Tumoración en la línea media (umbilical o epigástrica): evaluar tamaño del defecto, ascitis y factores de riesgo'),
        D('¿Hay ascitis?',
          [A('Controlar la ascitis antes de operar: riesgo de rotura, úlceras cutáneas y salida de líquido ascítico (en cirróticos)')],
          [A('No demorar el tratamiento: las umbilicales se estrangulan con frecuencia')]),
        F('Hernioplastia sin tensión con material protésico, abierta o laparoscópica según el paciente y la experiencia del cirujano (cierre simple en defectos pequeños)'),
    ]),
    fuente=FG('12', 'Hernia inguinal, crural y umbilical'),
)

# ---------------- eventración y evisceración ----------------
CONTENIDO['cx-eventracion-evisceracion'] = dict(
    algoritmo=dict(titulo='Eventración y evisceración (Giménez 2025)', nodos=[
        I('Defecto de la pared tras una laparotomía (eventración, 5 a 15 %) o dehiscencia aguda con salida de vísceras (evisceración)'),
        D('¿Es una evisceración (dehiscencia aguda del posoperatorio)?',
          [A('Cubrir con gasas estériles húmedas, reanimar y reintervenir: cierre de la pared o malla para contener las vísceras sin aumentar la presión intraabdominal'),
           F('Mortalidad del 15 al 30 %; la mitad de los que sobreviven desarrolla eventraciones difíciles')],
          [D('¿Está atascada o estrangulada?',
             [F('Cirugía urgente')],
             [A('Preparar al paciente (peso, tabaco, glucemia) y reparar con malla, vía abierta o endoscópica; técnicas para aumentar la cavidad (neumoperitoneo progresivo, toxina botulínica) y separación de componentes'),
              F('Sin prótesis solo por excepción (alto riesgo de infección): separación de componentes; la infección puede obligar a retirar la malla')])]),
    ]),
    diagnostico=[
        'La eventración resulta del debilitamiento del plano aponeurótico; es más frecuente tras cirugías de urgencia, infección de la herida y factores que afectan la cicatrización o aumentan la presión intraabdominal. La piel sobre el saco puede infectarse o necrosarse y el contenido intestinal obstruirse o estrangularse.',
        'La evisceración se debe a la dehiscencia de los planos peritoneal y aponeurótico, favorecida por EPOC, neoplasias, obesidad, desnutrición u operaciones de urgencia; la gravedad la marcan la indemnidad de la piel, el grado de exteriorización y las complicaciones intraabdominales.',
    ],
    banderas=[
        'Evisceración: mortalidad del 15 al 30 %; urgencia.',
        'Para prevenir la infección de la malla: profilaxis antibiótica, menor disección subcutánea y mallas monofilamento de grandes poros.',
    ],
    fuente=FG('13', 'Eventraciones y evisceraciones abdominales'),
)

# ---------------- hernia complicada ----------------
CONTENIDO['cx-hernia-complicada'] = dict(
    algoritmo=dict(titulo='Hernia incarcerada o estrangulada', nodos=[
        I('Hernia dolorosa, irreductible, con vómitos o signos de obstrucción: reanimación, régimen cero, fluidos, analgesia y antibióticos; descompresión nasogástrica si hay obstrucción'),
        D('¿Hay signos de estrangulación (fiebre, leucocitosis, lactato, signos peritoneales)?',
          [F('Cirugía urgente: reducción bajo visión, evaluar la viabilidad del asa, resecar si es necrótica y reparar el defecto (malla según la contaminación)')],
          [A('Reducción manual solo en casos seleccionados sin estrangulación'),
           F('Reparación de la hernia lo antes posible; la cirugía electiva tiene menos morbimortalidad que la de urgencia')]),
    ]),
    fuente=FC('12', 'Hernia inguinal, crural y umbilical'),
)

# ---------------- dolor inguinal: diagnóstico diferencial ----------------
CONTENIDO['cx-dolor-inguinal-diferencial'] = dict(
    algoritmo=dict(titulo='Dolor inguinal en el adulto', nodos=[
        I('Dolor inguinal: examen de la región, de la pared abdominal, del escroto y de la cadera; antecedentes deportivos y laborales'),
        D('¿Hay una tumoración que aumenta con el esfuerzo?',
          [F('Hernia: tratamiento quirúrgico (ver las fichas de hernia inguinal y crural)')],
          [D('¿El dolor es escrotal agudo?',
             [F('Doppler urgente; ante sospecha de torsión testicular, exploración quirúrgica inmediata sin esperar estudios')],
             [D('¿Hay antecedente deportivo (pubalgia, lesión de aductores o del recto anterior)?',
                [F('Reposo relativo, fisioterapia y control de la carga; cirugía si fracasa')],
                [F('Buscar causas neurogénicas o referidas: atrapamiento del ilioinguinal o genitofemoral, radiculopatía L1-L2, litiasis ureteral o apendicitis retrocecal')])])]),
    ]),
    fuente=FC('12', 'Hernia inguinal, crural y umbilical'),
)

# ---------------- hernias infrecuentes ----------------
CONTENIDO['cx-hernias-infrecuentes'] = dict(
    algoritmo=dict(titulo='Hernias infrecuentes de la pared abdominal (Giménez 2025)', nodos=[
        I('Dolor o tumoración en un sitio atípico, o cuadro obstructivo sin causa clara: sospechar una hernia infrecuente (ventral de Spiegel, lumbar, obturatriz, isquiática, perineal o interna)'),
        D('¿Es un cuadro obstructivo de diagnóstico incierto?',
          [A('Hernia interna: hidratación intensa y descompresión nasogástrica; laparotomía o laparoscopia con reducción del intestino, resección si hay necrosis y cierre del orificio (sospechar tras cirugía bariátrica o trasplante)')],
          [A('Spiegel: dolor vago en hemiabdomen inferior, a veces sin tumoración (la protrusión es entre los músculos); lumbar: tumoración o dolor lumbar (triángulo de Petit, cuadrilátero de Grynfelt); obturatriz: dolor en la cara interna del muslo, sobre todo derecho')]),
        F('Todas se tratan con cirugía; es imprescindible cerrar el orificio para evitar la recurrencia'),
    ]),
    diagnostico=[
        'Las hernias internas son menos del 1 % de todas las hernias (0,54 %), con repunte por la cirugía de trasplante hepático y bariátrica; el diagnóstico es muy difícil y suele hacerse en la laparotomía. Ayudan en las imágenes: localización anormal de asas delgadas, varias asas fijas y encapsuladas, dilatación segmentaria.',
        'Spiegel (ventrales): dolor vago o con el esfuerzo. Lumbares: zonas de debilidad lumbar. Obturatriz: agujero obturador, de difícil diagnóstico; dolor en la cara interna del muslo. Isquiáticas y perineales: raras y difíciles de diagnosticar.',
    ],
    fuente=FG('15', 'Hernias infrecuentes de la pared abdominal', 'Conducta quirúrgica detallada en cada sitio según Michans 5.ª ed.'),
)

NUEVAS = []
