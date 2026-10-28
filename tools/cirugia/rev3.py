# -*- coding: utf-8 -*-
"""UP8 (Manual CTO de Medicina y Cirugía 11.ª ed., traumatología) y UP11 (Smith y Tanagho, Urología general, 18.ª ed.): fichas nuevas y ajustes."""
from base import I, A, F, D

CONTENIDO = {}
NUEVAS = []
U8 = 'UP8 · Ortopedia y traumatología de miembros inferiores'; U11 = 'UP11 · Obstrucción urinaria baja y urología'
P = lambda t: [{'titulo': t[0], 'pasos': [{'etiqueta': e, 'texto': x} for e, x in t[1]]}]
CTO = lambda tit, extra='': {'guia': 'Manual CTO de Medicina y Cirugía, 11.ª ed.: Traumatología y cirugía ortopédica (%s)' % tit, 'sociedad': 'CTO Editorial (España)', 'anio': '2019',
                             'archivo': 'Traumatología y Cirugía Ortopédica - Manual CTO de Medicina y Cirugía 11ed.pdf', 'tipo': 'libro',
                             'nota': ('Manual de referencia para la traumatología; el Giménez 2025 no la incluye. ' + extra).strip()}
SMI = lambda cap, tit, extra='': {'guia': 'Smith y Tanagho. Urología general, 18.ª ed., cap. %s: %s' % (cap, tit), 'sociedad': 'J. W. McAninch y T. F. Lue (eds.), McGraw-Hill Lange', 'anio': '2016',
                                  'archivo': 'smith-y-tanagho-urologia-general-18va-ed.pdf (cap. %s)' % cap, 'tipo': 'libro',
                                  'nota': ('Libro de referencia de urología; el Giménez 2025 no la incluye. ' + extra).strip()}

def nueva(id, titulo, alias, up, unidad, definicion, diagnostico, estudios, tratamiento, seguimiento, banderas, algoritmo, fuente, fisiopatologia=None):
    d = {'id': id, 'area': 'cirugia', 'titulo': titulo, 'alias': alias, 'up': [up], 'unidad': unidad, 'estado': 'verificar',
         'definicion': definicion, 'diagnostico': diagnostico, 'estudios': estudios, 'tratamiento': tratamiento, 'seguimiento': seguimiento,
         'banderas': banderas, 'algoritmo': algoritmo, 'fuente': fuente, 'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.'}
    if fisiopatologia: d['fisiopatologia'] = fisiopatologia
    NUEVAS.append(d)

# =============================== UP8: traumatología (CTO 11.ª ed.) ===============================
nueva('cx-fracturas-generalidades', 'Fracturas: concepto, biología de la consolidación y clasificación',
      ['fractura', 'consolidacion', 'callo oseo', 'fractura patologica', 'fractura por estres', 'pseudoartrosis', 'biologia osea'], 'cx8', U8,
      'Una fractura es la interrupción de la continuidad ósea y/o cartilaginosa. Habitualmente se debe a un traumatismo único de intensidad superior a la que soporta el hueso sano; las patológicas o por insuficiencia aparecen con traumatismos mínimos sobre hueso alterado, y las de fatiga o estrés por exigencias mecánicas repetidas.',
      ['Fracturas patológicas: sobre hueso alterado por enfermedad general (osteogénesis imperfecta, osteomalacia, osteoporosis, Paget) o local (neoplasias, lesiones pseudotumorales); la osteoporosis es hoy la causa subyacente más frecuente, sobre todo en mujeres posmenopáusicas. Fracturas por fatiga: la más conocida es la del recluta (diáfisis del segundo metatarsiano); también cuello femoral y diáfisis tibial.',
       'Clínica: dolor, tumefacción, deformidad e impotencia funcional; explorar siempre la función neurovascular distal. Conminuta: varios fragmentos en el foco.',
       'Consolidación directa (primaria): requiere reducción anatómica y casi ausencia de movimiento (placas y tornillos), sin callo. Consolidación indirecta (secundaria): fracturas no estabilizadas quirúrgicamente o con cierta movilidad (clavos intramedulares, fijadores externos); pasa por cuatro fases: hematoma, formación del callo (blando con colágeno II y duro con colágeno I), osificación del callo y remodelación (el hueso fibrilar solo existe en el feto y en el callo de fractura; ley de Wolff).',
       'Factores que dificultan la consolidación: diabetes, corticoides, AINE o indometacina, malnutrición, perturbación del hematoma, radioterapia, interposición de partes blandas y exceso de distracción, compresión o cizallamiento; la consolidación se favorece con carga controlada, vitaminas A y D y factores de crecimiento.',
       'Fracturas más frecuentes: radio distal (a cualquier edad), cadera (ancianos) y vértebra lumbar (osteoporosis posmenopáusica).'],
      ['Radiografía simple en al menos dos proyecciones (anteroposterior y lateral); TC en húmero proximal, pelvis, acetábulo, calcáneo y vértebras. Las fracturas por fatiga no se ven en la radiografía inicial: gammagrafía (hipercaptación) o RM; el callo se ve hacia las 6 a 8 semanas.'],
      P(('Principios', [
          ('Objetivo', 'La máxima recuperación funcional del segmento mediante las condiciones que faciliten la consolidación en una posición adecuada; no siempre hace falta la reconstrucción anatómica y lo estético queda en segundo plano.'),
          ('Complicaciones', 'Fractura abierta (ver su ficha), síndrome compartimental, embolia grasa, infección, ausencia de consolidación (pseudoartrosis) y consolidación viciosa.'),
      ])),
      ['Control radiográfico de la consolidación y de la movilización de las articulaciones vecinas.'],
      ['Toda fractura exige explorar la función neurovascular distal.', 'La fractura por fatiga puede tener radiografía inicial normal.'],
      dict(titulo='Fractura: conducta inicial (Manual CTO)', nodos=[
          I('Dolor, tumefacción, deformidad e impotencia funcional tras un traumatismo (o con traumatismo mínimo sobre hueso patológico): examen neurovascular distal'),
          A('Radiografía en al menos dos proyecciones; TC en las localizaciones complejas'),
          D('¿Sospecha de fractura por fatiga con radiografía inicial normal?',
            [F('Gammagrafía o RM; reposo funcional y descarga; el callo aparece a las 6 a 8 semanas')],
            [D('¿La fractura es abierta, con lesión vascular o nerviosa, o inestable?',
               [F('Tratamiento quirúrgico (ver osteosíntesis y fractura expuesta)')],
               [F('Reducción si hace falta e inmovilización (conservador) con control radiográfico de la consolidación')])]),
      ]),
      CTO('fracturas, cap. 1', 'Contenido de las secciones 1.1 a 1.4.'))

nueva('cx-fracturas-tratamiento-osteosintesis', 'Tratamiento de las fracturas: inmovilización, tracciones y osteosíntesis',
      ['yeso', 'ferula', 'traccion esqueletica', 'osteosintesis', 'clavo intramedular', 'fijador externo', 'placa y tornillos', 'cerclaje', 'kirschner'], 'cx8', U8,
      'El tratamiento conservador incluye la abstención, la sindactilización, las férulas, los yesos circulares y las tracciones; el quirúrgico estabiliza la fractura con fijación externa o interna (placas y tornillos, clavos intramedulares, agujas y cerclajes).',
      ['Férula: dispositivo rígido que recubre parcialmente un segmento; yeso circular: más inmovilización y mejor mantenimiento de la posición; tracción cutánea (peso a través de la piel) o esquelética (peso con aguja o clavo que atraviesa un hueso). Reducción: restaurar las relaciones anatómicas normales del foco.',
       'Politraumatizado (lesión en al menos una de las tres cajas) y polifracturado (varias fracturas sin lesión visceral) deben operarse sus fracturas en las primeras horas para disminuir el sangrado, evitar la embolia grasa y facilitar la movilización.'],
      [],
      P(('Modalidades e indicaciones (tabla 4)', [
          ('Conservador', 'Abstención en fractura costal aislada y algunas por fatiga; sindactilización en dedos; férulas, ortesis y yesos en algunas fracturas vertebrales, de húmero, muñeca y tibia y gran parte de las del niño; tracción cutánea como inmovilización provisional de la fractura de cadera; tracción esquelética en el fémur del niño, acetábulo no desplazado y provisoria en el fémur del adulto.'),
          ('Agujas de Kirschner y cerclaje', 'Pequeños fragmentos y fracturas del niño; cerclaje y obenque en rótula y olécranon.'),
          ('Placas y tornillos', 'Antebrazo del adulto, húmero proximal y distal, diáfisis y metáfisis con extensión intraarticular y fractura extracapsular de cadera; técnica cuidadosa para preservar la vascularización (placas MIPO).'),
          ('Clavo intramedular', 'Fémur y tibia del adulto y húmero (transversas); los rígidos se bloquean con tornillos en fracturas inestables.'),
          ('Fijador externo', 'Fracturas abiertas (riesgo de infección), con lesión vascular, de pelvis inestables, intraarticulares complejas conminutas (pilón tibial), ausencia de consolidación infectada, quemados y alargamiento óseo.'),
          ('Evitar la fijación interna', 'Con infección activa o fracturas con riesgo elevado de infección (abiertas con gran destrucción de partes blandas).'),
      ])),
      ['Movilización precoz de las articulaciones adyacentes para evitar atrofias y rigideces; vigilar signos de compresión del yeso (dolor creciente, parestesias, cianosis).'],
      ['Dolor creciente bajo el yeso: abrir el yeso y descartar síndrome compartimental.', 'Politraumatizado con fracturas: fijación en las primeras horas.'],
      dict(titulo='Elección del tratamiento de una fractura (Manual CTO)', nodos=[
          I('Fractura confirmada: definir la estabilidad, la localización, las partes blandas y las lesiones asociadas'),
          D('¿Es abierta, con lesión vascular o nerviosa o en un politraumatizado?',
            [F('Estabilización quirúrgica temprana (primeras horas): fijación externa en abiertas, pelvis inestables y lesión vascular; clavo o placa según el hueso')],
            [D('¿Es estable y de resolución ortopédica (muchas del niño, vertebrales, húmero, muñeca, tibia)?',
               [F('Reducción si hace falta e inmovilización con férula o yeso, o tracción; abstención en costales aisladas')],
               [F('Osteosíntesis: placas y tornillos en fracturas yuxtaarticulares y de antebrazo; clavo intramedular en diáfisis de fémur y tibia; agujas o cerclaje en fragmentos pequeños, rótula y olécranon')])]),
      ]),
      CTO('principios generales del tratamiento, tabla 4'))

nueva('cx-fractura-pelvis-acetabulo', 'Fracturas de pelvis y de acetábulo',
      ['fractura de pelvis', 'anillo pelvico', 'fractura de acetabulo', 'pelvis inestable', 'hemorragia retroperitoneal', 'fijador externo pelvico'], 'cx8', U8,
      'La pelvis está formada por los dos huesos ilíacos y el sacro, estabilizados por la sínfisis del pubis, los ligamentos sacroilíacos y el suelo pélvico; los ligamentos sacroilíacos posteriores son el elemento más importante de la estabilidad. Las fracturas son estables o inestables según interrumpan el anillo en uno o más puntos.',
      ['Estables: avulsiones de apófisis en adolescentes (sartorio en la espina ilíaca anterosuperior, recto femoral en la anteroinferior, isquiotibiales en la tuberosidad isquiática) y fracturas de ramas iliopubiana e isquiopubiana en ancianos por caídas: tratamiento conservador.',
       'Las de alta energía (accidentes de tránsito en jóvenes) suelen ser inestables en el plano mediolateral y, si se lesionan los ligamentos posteriores, también en el vertical; pueden asociar hemorragia retroperitoneal masiva, lesiones de vasos ilíacos, plexo lumbosacro, recto, vagina o vía urinaria, con mortalidad del 10 al 20 %, y se asocian a politraumatizados.',
       'Acetábulo: suele producirse en traumatismos de alta energía con luxación de cadera; hay una columna anterior y otra posterior en forma de Y invertida; la TC es imprescindible para planificar.'],
      ['Radiografía de pelvis (con proyecciones oblicuas de Judet para el acetábulo) y TC; evaluar lesiones asociadas urinarias, rectales y vasculares.'],
      P(('Tratamiento', [
          ('Estables', 'Conservador: analgesia, reposo unos días y reinicio de la marcha con andador o bastones hasta que desaparecen los síntomas (1 a 2 meses).'),
          ('Inestables', 'Estabilización urgente con fijador externo, sobre todo si hay compromiso hemodinámico (cerrar el anillo pélvico limita el sangrado); tratamiento definitivo con osteosíntesis del anillo anterior y de la parte posterior (tornillos sacroilíacos percutáneos).'),
          ('Acetábulo', 'Tracción esquelética en las no desplazadas; cirugía en las desplazadas, con cadera subluxada (inestables), luxación de cadera irreductible o fragmentos intraarticulares incarcerados; complicaciones: osificación heterotópica (indometacina o radioterapia) y artrosis postraumática.'),
      ])),
      ['Seguimiento de la marcha y de la carga según la estabilidad; control de complicaciones.'],
      ['Fractura pelviana con hipotensión: sangrado retroperitoneal; cerrar el anillo (fijación externa) y reanimar.', 'Pensar en lesión uretral y rectal asociada.'],
      dict(titulo='Fractura de pelvis (Manual CTO)', nodos=[
          I('Dolor pelviano tras un traumatismo: ABCDE, radiografía de pelvis, TC y búsqueda de lesiones asociadas'),
          D('¿La fractura es estable (avulsión en adolescentes, ramas en ancianos)?',
            [F('Tratamiento conservador: analgesia, reposo breve y marcha con andador o bastones por 1 a 2 meses')],
            [A('Inestable (alta energía): reanimación y estabilización urgente con fijador externo si hay compromiso hemodinámico'),
             F('Tratamiento definitivo con osteosíntesis; acetábulo desplazado, inestable o con fragmentos intraarticulares: cirugía')]),
      ]),
      CTO('pelvis y acetábulo'))

nueva('cx-luxacion-cadera', 'Luxación traumática de cadera',
      ['luxacion de cadera', 'luxacion posterior de cadera', 'luxacion anterior', 'nervio ciatico', 'necrosis avascular', 'salpicadero'], 'cx8', U8,
      'Lesión de gran energía que desplaza la cabeza femoral fuera del acetábulo; el 90 % son posteriores y el 10 % anteriores, y pueden asociar fracturas del acetábulo, de la cabeza femoral o de la rótula.',
      ['Posteriores (90 %): accidentes de tránsito en los que el salpicadero impacta sobre la rodilla; miembro acortado, en rotación interna, aducción y flexión; la cabeza se palpa en la región glútea y puede lesionarse el nervio ciático.',
       'Anteriores (10 %): miembro alargado, en rotación externa y discreta separación; puede afectarse el paquete vasculonervioso femoral.',
       'Fractura-luxación central: la cabeza impacta el fondo del acetábulo y lo arrastra hacia el interior de la pelvis.'],
      ['Radiografía de pelvis y cadera; TC tras la reducción para ver fracturas y fragmentos intraarticulares; examen neurovascular antes y después.'],
      P(('Tratamiento', [
          ('Urgencia', 'Reducción cerrada bajo anestesia lo antes posible y estabilización transitoria con tracción; luego carga parcial durante 2 a 3 meses.'),
          ('Cirugía', 'Fractura asociada del acetábulo quirúrgica, fragmentos intraarticulares incarcerados o imposibilidad de reducir de forma cerrada.'),
          ('Complicaciones', 'Necrosis isquémica de la cabeza a mediano plazo y coxartrosis postraumática a largo plazo.'),
      ])),
      ['Control radiográfico y de la marcha; vigilar la necrosis avascular.'],
      ['Reducir de urgencia: el riesgo de necrosis aumenta con la demora.', 'Examinar el nervio ciático antes y después de la reducción.'],
      dict(titulo='Luxación traumática de cadera (Manual CTO)', nodos=[
          I('Trauma de alta energía con miembro acortado en rotación interna (posterior) o alargado en rotación externa (anterior): radiografía y examen neurovascular'),
          A('Reducción cerrada urgente bajo anestesia y tracción transitoria'),
          D('¿Hay fractura quirúrgica del acetábulo, fragmentos incarcerados o no se logra reducir?',
            [F('Cirugía: reducción abierta y osteosíntesis')],
            [F('Carga parcial por 2 a 3 meses y control de necrosis avascular y coxartrosis')]),
      ]),
      CTO('luxaciones de cadera'))

nueva('cx-fractura-columna-vertebral', 'Fracturas vertebrales y lesión medular',
      ['fractura vertebral', 'columna', 'inestabilidad', 'shock medular', 'shock neurogenico', 'lesion medular', 'cono medular', 'cola de caballo'], 'cx8', U8,
      'La columna se describe como tres columnas (anterior, media y posterior); la lesión de los elementos posteriores condiciona la inestabilidad, definida como la probabilidad de producir dolor mecánico o alteraciones neurológicas en el momento de la lesión o en el futuro.',
      ['Criterios de inestabilidad: cervical, angulación interespinosa mayor de 11° y traslación del cuerpo mayor de 3,5 mm; dorsolumbar, compresión de más del 50 % de la altura de la columna anterior y cifosis angular mayor de 25 a 30°.',
       'Shock medular: ausencia de función medular por disfunción (sin lesión morfológica), con ausencia de reflejos (bulbocavernoso); suele ceder en 24 horas (hasta 1 mes) y hasta entonces no permite valorar la lesión. Shock neurogénico: hipotensión y bradicardia por disrupción del sistema autónomo con lesión medular. El cono medular llega hasta L1.',
       'La lesión neurológica puede ser completa o incompleta; si es incompleta hay que reexaminar periódicamente porque la única indicación de cirugía urgente es la lesión neurológica incompleta y progresiva (algunos autores incluyen la incompleta de menos de 6 horas).'],
      ['Valoración neurológica seriada; radiografía y TC (fracturas vertebrales), RM ante déficit neurológico.'],
      P(('Tratamiento', [
          ('Principio', 'Estabilizar la columna con inmovilización durante el traslado y la reanimación (ver la ficha de restricción del movimiento espinal); el tratamiento definitivo depende de la estabilidad y del estado neurológico.'),
          ('Cirugía urgente', 'Lesión neurológica incompleta y progresiva.'),
      ])),
      ['Reexamen neurológico periódico en lesiones incompletas.'],
      ['Reconocer el shock medular antes de rotular la lesión como completa.', 'Déficit neurológico incompleto que progresa: cirugía urgente.'],
      dict(titulo='Fractura vertebral (Manual CTO)', nodos=[
          I('Dolor de columna o déficit neurológico tras un trauma: inmovilización, valoración neurológica y radiografía o TC'),
          D('¿Hay déficit neurológico y no está en shock medular?',
            [D('¿La lesión es incompleta y progresiva?',
               [F('Cirugía urgente')],
               [F('Reexaminar periódicamente; estabilizar según la inestabilidad (criterios cervicales o dorsolumbares)')])],
            [F('Sin déficit o en shock medular: tratar la estabilidad de la fractura y reevaluar el examen neurológico tras la resolución del shock')]),
      ]),
      CTO('fracturas vertebrales, 8.1'))

nueva('cx-fracturas-pie-calcaneo-metatarsianos', 'Fracturas del pie: calcáneo, quinto metatarsiano y fracturas por estrés',
      ['fractura de calcaneo', 'astragalo', 'quinto metatarsiano', 'fractura de jones', 'fractura del recluta', 'fractura de estres', 'pie y tobillo'], 'cx8', U8,
      'Las fracturas del calcáneo son frecuentes en caídas desde altura (con meseta tibial y vértebra lumbar); en el pie son comunes también las del quinto metatarsiano y las fracturas por fatiga del segundo metatarsiano (fractura del recluta o de Deutschländer).',
      ['Calcáneo: caída desde altura; si la fractura es desplazada con afectación subastragalina, hoy se opta por la cirugía, que no está exenta de riesgos (infección, afectación del nervio sural). Las intraarticulares pueden dejar dolor crónico del retropié (artrosis postraumática, almohadilla plantar, tenosinovitis de los peroneos); puede complicarse con síndrome compartimental y, si la artrosis es invalidante, se hace artrodesis subastragalina.',
       'Quinto metatarsiano proximal: avulsión de la apófisis estiloides (la más frecuente, consolida casi siempre, yeso u ortesis 3 a 4 semanas con carga precoz); fractura de Jones en la unión metafisodiafisaria (relativamente alta incidencia de pseudoartrosis, yeso en descarga unas 8 semanas, osteosíntesis con tornillo intramedular si está muy desplazada o en deportistas de élite); fractura por estrés de la diáfisis proximal (pie cavovaro y actividad física intensa: inmovilización y descarga con plantillas si es aguda; tornillo intramedular con injerto si es crónica con ausencia de consolidación).',
       'Fracturas por fatiga: no se ven en la radiografía inicial (gammagrafía o RM); el callo es visible a las 6 a 8 semanas.'],
      ['Radiografías del pie y TC del calcáneo; gammagrafía o RM en la sospecha de fractura por estrés.'],
      P(('Conducta', [
          ('Calcáneo', 'Quirúrgico en las desplazadas intraarticulares; vigilar síndrome compartimental; artrodesis subastragalina si la artrosis es invalidante.'),
          ('Quinto metatarsiano', 'Según el tipo: avulsión (yeso u ortesis con carga precoz), Jones (descarga 8 semanas o tornillo) y estrés (reposo y descarga; cirugía en las crónicas).'),
      ])),
      ['Control radiográfico de la consolidación; reposo funcional en las fracturas por fatiga.'],
      ['Dolor de pie en un recluta o deportista con radiografía normal: fractura por fatiga hasta demostrar lo contrario.', 'Fractura de calcáneo: vigilar síndrome compartimental.'],
      dict(titulo='Fracturas del pie (Manual CTO)', nodos=[
          I('Dolor y tumefacción del pie tras una caída o actividad repetida: radiografías; TC si es calcáneo; gammagrafía o RM si la radiografía es normal y hay sospecha'),
          D('¿Es una fractura de calcáneo desplazada con afectación subastragalina?',
            [F('Osteosíntesis (riesgo de infección y de lesión del nervio sural); vigilar síndrome compartimental')],
            [D('¿Es una fractura del quinto metatarsiano proximal?',
               [F('Avulsión: yeso u ortesis 3 a 4 semanas con carga precoz; Jones: yeso en descarga 8 semanas o tornillo intramedular si está desplazada o es deportista; estrés agudo: descarga; crónico: tornillo con injerto')],
               [F('Fractura por fatiga (segundo metatarsiano u otros): reposo funcional, descarga y control radiográfico')])]),
      ]),
      CTO('pie, 1.6'))

nueva('cx-discapacidad-comunicacion', 'Discapacidad: comunicación del diagnóstico y acompañamiento de la familia',
      ['discapacidad', 'incapacidad', 'invalidez', 'minusvalia', 'comunicar malas noticias', 'duelo', 'rehabilitacion', 'familia'], 'cx8', U8,
      'La discapacidad es un problema de salud de gran impacto y trascendencia para la persona y su familia. Comunicar el diagnóstico es un imperativo ético, moral y legal, y exige considerar quién anuncia, cuándo, de qué forma y con qué contenido, y cómo se acompaña la reacción posterior.',
      ['Comunicar una mala noticia sin preparación puede generar conflictos psicológicos en el paciente y la familia y un estrés importante en el médico y el equipo de salud, con consecuencias a veces devastadoras (Lillo, 2014).',
       'La llegada de un hijo con diagnóstico de discapacidad altera el estado emocional de los padres: aparece desgaste emocional, un proceso de duelo y frustración por las expectativas incumplidas, con deterioro del sistema familiar, sobre todo de las relaciones afectivas y comunicacionales (Villavicencio y col., 2018).',
       'Distinguir los conceptos: discapacidad (alteración del funcionamiento a nivel corporal, individual y social), incapacidad laboral e invalidez.'],
      [],
      P(('Rol del equipo de salud', [
          ('Anuncio', 'Considerar la persona que anuncia, el momento, la forma y el contenido, la reacción y el apoyo y seguimiento posteriores.'),
          ('Acompañamiento', 'Información, orientación y apoyo emocional al paciente y a su entorno; reconocer las reacciones emocionales y el duelo; la rehabilitación es un proceso integral.'),
          ('Familia', 'Atender el desgaste emocional y la reorganización familiar; ofrecer apoyo y derivación a recursos de la comunidad.'),
      ])),
      ['Seguimiento del paciente y de la familia durante el proceso de rehabilitación.'],
      ['El anuncio de una discapacidad es un imperativo ético, moral y legal: debe prepararse y acompañarse.', 'La capacitación en comunicación de malas noticias es parte de la formación médica.'],
      dict(titulo='Comunicación de un diagnóstico de discapacidad (Lillo 2014)', nodos=[
          I('Diagnóstico de discapacidad: preparar la comunicación (quién anuncia, cuándo, dónde, de qué manera y con qué contenido)'),
          A('Comunicar con empatía y claridad, en un lugar adecuado, con tiempo y con la familia presente cuando corresponda'),
          D('¿Hay reacciones emocionales intensas o duelo en el paciente o la familia?',
            [F('Contención y apoyo emocional, nuevas entrevistas y derivación a salud mental y a recursos de la comunidad')],
            [F('Orientar sobre la rehabilitación como proceso integral, dar información escrita y asegurar el seguimiento')]),
      ]),
      {'guia': 'Comunicar el diagnóstico de discapacidad (Lillo, 2014) y Discapacidad y familia: desgaste emocional (Villavicencio y col., 2018)', 'sociedad': 'Rev. Med. Clin. Condes; Academo', 'anio': '2014 y 2018',
       'archivo': 'bibliografia (Discapacidad- Lillo; Discapacidad y familia)', 'tipo': 'libro', 'nota': 'Bibliografía esencial de la unidad.'})

# =============================== UP11: urología (Smith y Tanagho 18.ª ed.) ===============================
CONTENIDO['cx-trauma-urogenital'] = dict(
    algoritmo=dict(titulo='Trauma urogenital (guía EAU y Smith y Tanagho 18.ª ed.)', nodos=[
        I('Trauma con hematuria, fractura pélvica o de costillas inferiores: control del shock y la hemorragia, reanimación; examinar el meato uretral antes de pasar la sonda; TC con contraste y exploraciones especiales (cistografía, uretrografía) según el sitio'),
        D('¿Es una lesión renal?',
          [F('Lesiones cerradas menores (85 %, grados 1 a 2): reposo e hidratación, sin operar. Cirugía ante hemorragia retroperitoneal persistente, extravasación urinaria, parénquima inviable o lesión pedicular; penetrantes: exploración quirúrgica (embolización si hay sangrado activo en el estable)')],
          [D('¿Es una lesión vesical?',
             [F('Intraperitoneal: reparación quirúrgica por línea media con cistostomía suprapúbica; extraperitoneal simple: sonda uretral unos 10 días; coágulos grandes o lesión del cuello vesical: cirugía')],
             [D('¿Es una lesión uretral posterior?',
                [F('Evitar el sondaje uretral: cistostomía suprapúbica (3 meses mientras se resuelve el hematoma pélvico) y uretroplastia diferida')],
                [F('Uréter: reparación inmediata en el quirófano si se reconoce durante la cirugía (reimplante con psoas hitch en el tercio inferior); si se reconoce tardíamente, derivación proximal con nefrostomía')])])]),
    ]),
    banderas=[
        'Casi el 10 % de las lesiones en urgencias se relacionan con el aparato genitourinario; muchas son sutiles: el diagnóstico temprano evita complicaciones graves.',
        'Las fracturas de las costillas inferiores se relacionan con lesiones renales y las fracturas pélvicas con lesiones vesicales y uretrales.',
        'En hombres, examinar el meato uretral en busca de sangre antes de insertar la sonda.',
    ],
    fuente={'_complementa': 'Complementa: Smith y Tanagho, Urología general, 18.ª ed., cap. 18: Lesiones de las vías genitourinarias.'},
)

nueva('cx-tumores-renales', 'Tumores renales: carcinoma de células renales',
      ['carcinoma de celulas renales', 'cancer renal', 'nefrectomia radical', 'nefrectomia parcial', 'oncocitoma', 'angiomiolipoma', 'sindrome paraneoplasico'], 'cx11', U11,
      'Los tumores parenquimatosos del riñón incluyen lesiones benignas (oncocitoma, angiomiolipoma) y el carcinoma de células renales (CCR), cada vez más detectado de forma incidental por imágenes (más del 50 %).',
      ['Presentación: la tríada clásica de hematuria macroscópica, dolor en la fosa renal y masa palpable aparece solo en el 7 al 10 % y suele indicar enfermedad avanzada; las metástasis pueden dar disnea, tos y dolor óseo.',
       'Síndromes paraneoplásicos (10 a 40 %): eritrocitosis (el CCR es su causa más común), hipercalcemia, hipertensión y disfunción hepática no metastásica.'],
      ['TC con contraste para el diagnóstico y la estadificación; evaluación completa para estadificación antes de decidir el tratamiento.'],
      P(('Tratamiento', [
          ('Enfermedad localizada', 'La extirpación quirúrgica en etapa temprana es el único tratamiento con posibilidades curativas: nefrectomía radical (escisión en bloque del riñón, la fascia de Gerota, la glándula suprarrenal, la mitad proximal del uréter y ganglios hasta la transección de los vasos renales) o parcial; el pronóstico de T1 a T3a es similar después de nefrectomía radical; recurrencia después de nefrectomía radical del 2 al 3 %.'),
          ('Linfadenectomía', 'Papel controvertido: entre el 18 y el 33 % de los pacientes con disección tiene enfermedad metastásica en los ganglios.'),
      ])),
      ['Seguimiento por imágenes según la etapa; la resección repetida de una recurrencia local aislada puede ser curativa.'],
      ['La tríada clásica indica enfermedad avanzada.', 'Eritrocitosis, hipercalcemia o hipertensión sin causa pueden ser un síndrome paraneoplásico del CCR.'],
      dict(titulo='Carcinoma de células renales (Smith y Tanagho 18.ª ed.)', nodos=[
          I('Masa renal incidental o hematuria, dolor en el flanco o masa palpable: TC con contraste y estadificación completa'),
          D('¿La enfermedad es localizada (T1 a T3a)?',
            [F('Nefrectomía radical o parcial (único tratamiento potencialmente curativo); el pronóstico de T1 a T3a es similar tras nefrectomía radical')],
            [F('Enfermedad avanzada o metastásica: tratamiento sistémico (inmunoterapia y terapias dirigidas) con cirugía en casos seleccionados')]),
      ]),
      SMI('22', 'Neoplasias parenquimatosas renales'))

nueva('cx-cancer-vejiga-urotelial', 'Cáncer de vejiga y carcinoma urotelial',
      ['cancer de vejiga', 'carcinoma urotelial', 'hematuria', 'rtu de vejiga', 'bcg', 'cistectomia', 'derivacion urinaria', 'neovejiga', 'tumor de pelvis renal'], 'cx11', U11,
      'El carcinoma urotelial puede originarse en la vejiga, el uréter o la pelvis renal. La hematuria es el signo de presentación en el 85 al 90 % de los pacientes con cáncer vesical.',
      ['Hematuria macroscópica o microscópica, intermitente más que constante; síntomas irritativos (polaquiuria, tenesmo, disuria), más comunes en el carcinoma in situ difuso; en la enfermedad avanzada, dolor óseo, lumbalgia u obstrucción ureteral. Tumores de gran volumen o invasores pueden dar engrosamiento de la pared o masa palpable en el examen bimanual bajo anestesia; una vejiga fija sugiere invasión de estructuras vecinas.',
       'Diagnóstico por imágenes, citología y cistoscopia con resección transuretral (RTU) para el estudio histológico y la estadificación.'],
      ['Cistoscopia con RTU, citología urinaria e imágenes (TC o urografía) para el tracto superior y la estadificación.'],
      P(('Tratamiento', [
          ('Tumores superficiales', 'RTU completa y quimioterapia o inmunoterapia intravesical, de forma profiláctica (una dosis inmediata tras la RTU para reducir la implantación de células tumorales) o terapéutica para reducir la recurrencia y la progresión; esquema semanal durante 6 semanas y, a veces, mantenimiento mensual o bimestral. La toxicidad local es común y la sistémica rara.'),
          ('Enfermedad invasora', 'Cistectomía radical con derivación urinaria o sustitución de la vejiga (ver derivaciones urinarias); en el uréter y la pelvis renal, nefroureterectomía u opciones conservadoras según el estadio.'),
      ])),
      ['Seguimiento cistoscópico periódico por la alta tasa de recurrencia.'],
      ['Hematuria en un adulto, sobre todo fumador: estudiar siempre.', 'Un tumor vesical con vejiga fija en el examen bimanual sugiere invasión.'],
      dict(titulo='Carcinoma urotelial de vejiga (Smith y Tanagho 18.ª ed.)', nodos=[
          I('Hematuria o síntomas irritativos: ecografía o TC, citología y cistoscopia'),
          A('Resección transuretral para el diagnóstico y la estadificación'),
          D('¿Es un tumor superficial (no invasor del músculo)?',
            [A('Quimioterapia o inmunoterapia intravesical (una dosis profiláctica inmediata tras la RTU y esquema semanal por 6 semanas si hay riesgo)'),
             F('Seguimiento cistoscópico periódico por la recurrencia')],
            [F('Invasor: cistectomía radical con derivación urinaria o sustitución vesical, con quimioterapia sistémica según el estadio')]),
      ]),
      SMI('21', 'Carcinoma urotelial: cánceres de vejiga, uréter y pelvis renales'))

nueva('cx-tumores-testiculares-genitales', 'Tumores de testículo, pene y uretra',
      ['tumor de testiculo', 'seminoma', 'orquiectomia radical', 'marcadores tumorales', 'cancer de pene', 'cancer de uretra', 'tumor germinal'], 'cx11', U11,
      'Los tumores genitales incluyen los tumores de células germinativas del testículo (seminoma y no seminoma) y los menos frecuentes del pene y la uretra.',
      ['Testículo: masa testicular firme e indolora; el epidídimo se separa con facilidad; un hidrocele puede acompañar y camuflar el tumor (la transiluminación ayuda). Ginecomastia en el 5 % de los tumores germinales (30 a 50 % en los de Sertoli y Leydig). Palpar el abdomen (masa retroperitoneal) y los ganglios supraclaviculares, escalenos e inguinales.',
       'Laboratorio y marcadores tumorales; evaluar la función renal (depuración de creatinina) antes de quimioterapia.'],
      ['Ecografía testicular, marcadores tumorales, TC de abdomen y pelvis y radiografía de tórax para la estadificación.'],
      P(('Tratamiento', [
          ('Principio', 'Exploración inguinal con pinzamiento cruzado de los vasos del cordón espermático; si no se puede excluir el cáncer, orquiectomía radical inguinal. Evitar la vía escrotal y la biopsia testicular abierta. El tratamiento posterior depende de la histología y la etapa clínica.'),
          ('Seminoma etapa I', 'Cerca del 95 % se cura con orquiectomía radical e irradiación retroperitoneal (2500 a 3000 cGy); vigilancia hasta 10 años (antecedentes, examen y marcadores cada 3 a 4 meses durante 1 a 3 años, cada 6 meses de los 4 a 7 años y luego anual) o carboplatino como opción. El tumor retroperitoneal de bajo volumen se trata con irradiación (supervivencia a 5 años del 87 %); la quimioterapia es el tratamiento del volumen mayor.'),
      ])),
      ['Seguimiento prolongado con marcadores, examen físico e imágenes.'],
      ['Masa testicular sólida: orquiectomía radical por vía inguinal, nunca biopsia ni abordaje escrotal.'],
      dict(titulo='Tumor de testículo (Smith y Tanagho 18.ª ed.)', nodos=[
          I('Masa testicular firme e indolora: ecografía y marcadores tumorales'),
          A('Exploración inguinal con pinzamiento del cordón; orquiectomía radical si no se excluye cáncer (evitar vía escrotal y biopsia abierta)'),
          D('¿Es un seminoma en etapa I?',
            [F('Vigilancia hasta 10 años, carboplatino o irradiación retroperitoneal; cerca del 95 % de curación')],
            [F('Estadificar con TC y marcadores; quimioterapia y cirugía retroperitoneal según el estadio y la histología')]),
      ]),
      SMI('24', 'Tumores genitales'))

nueva('cx-obstruccion-urinaria-alta-baja', 'Obstrucción y estasis urinarias: alta y baja',
      ['obstruccion urinaria', 'hidronefrosis', 'estasis urinaria', 'reflujo vesicoureteral', 'obstruccion del cuello vesical', 'valvulas uretrales posteriores'], 'cx11', U11,
      'La obstrucción urinaria es un impedimento al flujo normal de la orina en cualquier punto de la vía urinaria; se clasifica en alta (por encima de la vejiga) y baja (distal a la vejiga), y produce estasis, infección, litiasis y daño renal progresivo.',
      ['Causas principales: hiperplasia prostática benigna, cáncer de próstata, vejiga neurogénica, cálculos ureterales, válvulas uretrales posteriores y estenosis ureteral o uretral.',
       'Complicaciones: hidronefrosis y deterioro de la función renal, reflujo vesicoureteral, infección y litiasis.'],
      ['Ecografía renal y vesical (hidronefrosis, residuo posmiccional), función renal, orina y estudios radiológicos según la causa.'],
      P(('Tratamiento', [
          ('Alivio de la obstrucción', 'Tratar la causa. En la obstrucción baja con daño renal o ureterovesical mínimo, basta corregir la obstrucción; si persiste reflujo significativo después de aliviarla, o hay hidronefrosis considerable, puede necesitarse reparación quirúrgica. El drenaje preliminar con sonda permanente u otra derivación (por ejemplo, ureterostomía en asa) preserva y mejora la función renal.'),
          ('Obstrucción alta', 'Derivación del riñón (catéter doble J o nefrostomía) cuando hay infección o compromiso de la función, y tratamiento de la causa (cálculo, estenosis).'),
      ])),
      ['Control de la función renal y de la hidronefrosis tras aliviar la obstrucción.'],
      ['Obstrucción con infección o anuria: derivación urgente.', 'Persistencia del reflujo tras aliviar la obstrucción: considerar la reparación de la unión ureterovesical.'],
      dict(titulo='Obstrucción urinaria (Smith y Tanagho 18.ª ed.)', nodos=[
          I('Síntomas urinarios, dolor lumbar, infección o deterioro de la función renal: ecografía renal y vesical y función renal'),
          D('¿La obstrucción es baja (distal a la vejiga)?',
            [A('Drenar la vejiga con sonda uretral o suprapúbica y tratar la causa (HPB, estenosis uretral, válvulas, cáncer de próstata)'),
             D('¿Persisten reflujo significativo o hidronefrosis tras aliviar la obstrucción?',
               [F('Reparación quirúrgica de la unión ureterovesical; drenaje preliminar si hace falta')],
               [F('Corregir la obstrucción y controlar la función renal')])],
            [A('Obstrucción alta: tratar la causa (cálculo, estenosis) y derivar con doble J o nefrostomía si hay infección o falla renal'),
             F('Control de la función renal y de la dilatación')]),
      ]),
      SMI('12', 'Obstrucción y estasis urinarias'))

nueva('cx-fimosis-parafimosis', 'Fimosis y parafimosis',
      ['fimosis', 'parafimosis', 'balanopostitis', 'circuncision', 'prepucio'], 'cx11', U11,
      'La fimosis es la imposibilidad de retraer el prepucio por estrechez de su apertura; la parafimosis es el prepucio retraído tras el glande que no puede volver a su posición, con congestión venosa y edema.',
      ['Los niños menores de dos años casi nunca tienen una verdadera fimosis: la apertura prepucial se ensancha de forma gradual. Puede aparecer a cualquier edad; en hombres diabéticos de edad avanzada la balanopostitis crónica puede llevar a fimosis y ser el motivo de consulta.',
       'Bajo el prepucio pueden desarrollarse cálculos y carcinoma epidermoide. La clínica de la infección: edema, eritema, dolor y secreción purulenta.',
       'Parafimosis: la inflamación crónica bajo un prepucio redundante contractura la apertura y forma un anillo rígido que, al retraerse el prepucio, causa congestión venosa, edema e hipertrofia del glande.'],
      ['Diagnóstico clínico por el examen del prepucio y el glande; glucemia en el diabético.'],
      P(('Tratamiento', [
          ('Infección', 'Antibióticos de amplio espectro; incisión dorsal del prepucio si es necesario mejorar el drenaje; la circuncisión, si está indicada, se hace una vez controlada la infección.'),
          ('Circuncisión', 'Evitar la circuncisión por fimosis en niños que requieren anestesia general; salvo infecciones recurrentes, posponerla hasta poder usar anestesia local.'),
          ('Parafimosis', 'Es una urgencia: reducir el prepucio y, si no se logra, liberar el anillo por vía quirúrgica.'),
      ])),
      ['Control del cuidado local y de la glucemia.'],
      ['Parafimosis: urgencia por el riesgo de isquemia del glande.', 'Fimosis del adulto: descartar diabetes y carcinoma epidermoide.'],
      dict(titulo='Fimosis y parafimosis (Smith y Tanagho 18.ª ed.)', nodos=[
          I('Dificultad para retraer el prepucio, dolor, edema o secreción purulenta: examen del prepucio y del glande'),
          D('¿El prepucio está retraído tras el glande y no vuelve a su sitio (parafimosis)?',
            [F('Urgencia: reducir el prepucio; si no se logra, liberar el anillo con incisión dorsal y luego circuncisión')],
            [D('¿Hay infección (balanopostitis)?',
               [F('Antibióticos de amplio espectro, incisión dorsal si hace falta drenaje y circuncisión una vez controlada la infección')],
               [F('Niño menor de 2 años: conducta expectante (no es una verdadera fimosis); en el adulto, buscar diabetes y evaluar la circuncisión')])]),
      ]),
      SMI('41', 'Trastornos del pene y la uretra masculina'))

nueva('cx-varicocele-hidrocele', 'Varicocele, hidrocele e infertilidad masculina',
      ['varicocele', 'hidrocele', 'infertilidad masculina', 'plexo pampiniforme', 'espermograma', 'embolizacion'], 'cx11', U11,
      'El varicocele es la dilatación venosa del plexo pampiniforme y se encuentra en el 30 al 40 % de los hombres subfértiles; el hidrocele es una colección de líquido en la túnica vaginal que puede acompañar a un tumor testicular y camuflarlo.',
      ['Varicocele: se palpa en el 30 al 40 % de los hombres subfértiles y se detecta por venografía en el 70 %; la ecografía Doppler color confirma el diagnóstico combinando el flujo retrógrado y el tamaño venoso (diámetro mayor de 3 mm); el flujo retrógrado con la maniobra de Valsalva es el hallazgo radiológico clave.',
       'Hidrocele: tumefacción escrotal que transilumina; descartar un tumor testicular asociado con ecografía.',
       'Infertilidad masculina: evaluación con análisis de semen, evaluación hormonal y, según el caso, estudios cromosómicos y de microdeleciones del Y.'],
      ['Espermograma, evaluación hormonal, ecografía escrotal Doppler color; la venografía se reserva para guiar la embolización percutánea del varicocele.'],
      P(('Conducta', [
          ('Varicocele', 'Evaluar en el contexto de la infertilidad y el dolor; la corrección (embolización percutánea guiada por venografía o varicocelectomía) se plantea cuando hay infertilidad con alteración seminal o síntomas.'),
          ('Hidrocele', 'Confirmar el diagnóstico con la ecografía y descartar un tumor; el tratamiento quirúrgico se indica según los síntomas o el tamaño.'),
      ])),
      ['Control del espermograma tras el tratamiento de la causa.'],
      ['Hidrocele de aparición reciente en un adulto: descartar un tumor testicular.', 'El varicocele es una causa corregible de infertilidad masculina.'],
      dict(titulo='Varicocele e infertilidad masculina (Smith y Tanagho 18.ª ed.)', nodos=[
          I('Pareja con infertilidad o dolor escrotal: historia, examen escrotal en bipedestación y espermograma'),
          A('Ecografía escrotal Doppler color: flujo retrógrado con Valsalva y diámetro venoso mayor de 3 mm confirman el varicocele'),
          D('¿Hay varicocele con alteración seminal o síntomas?',
            [F('Corrección: embolización percutánea o varicocelectomía')],
            [F('Evaluación hormonal y otros estudios de la infertilidad; hidrocele: descartar tumor y tratar según los síntomas')]),
      ]),
      SMI('44', 'Infertilidad masculina (varicocele)', 'El hidrocele se toma del cap. 24.'))
