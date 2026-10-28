# -*- coding: utf-8 -*-
"""Segunda tanda de revisión sobre Giménez 2.ª ed. (2025): figuras 8-4, 29-2, 29-6, 73-1-1 y 79-2-1 y caps. 74 y 29, más prolapso rectal y quiste sacrocoxígeo (Galindo, no están en Giménez)."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}
NUEVAS = []
U4 = 'UP4 · Enfermedad colorrectal y anorrectal'; U9 = 'UP9 · Trauma, quemaduras y procuración'
P = lambda t: [{'titulo': t[0], 'pasos': [{'etiqueta': e, 'texto': x} for e, x in t[1]]}]
GAL = lambda cap, tit, arch: {'guia': 'Enciclopedia de Cirugía Digestiva: %s (cap. %s)' % (tit, cap), 'sociedad': 'F. Galindo y colaboradores (Argentina)', 'anio': '2001-2009',
                              'archivo': arch, 'tipo': 'libro', 'nota': 'Texto argentino de referencia, anterior al Giménez (2025): el tema no está en el Giménez.'}

def nueva(id, titulo, alias, up, unidad, definicion, diagnostico, estudios, tratamiento, seguimiento, banderas, algoritmo, fuente):
    NUEVAS.append({'id': id, 'area': 'cirugia', 'titulo': titulo, 'alias': alias, 'up': [up], 'unidad': unidad, 'estado': 'verificar',
                   'definicion': definicion, 'diagnostico': diagnostico, 'estudios': estudios, 'tratamiento': tratamiento, 'seguimiento': seguimiento,
                   'banderas': banderas, 'algoritmo': algoritmo, 'fuente': fuente, 'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.'})

# ---- cáncer de recto: terapia neoadyuvante total (fig. 73-1-1)
CONTENIDO['cx-cancer-recto'] = dict(
    algoritmo=dict(titulo='Cáncer de recto: neoadyuvancia y cirugía (guía argentina y Giménez 2025)', nodos=[
        I('Tacto rectal, colonoscopia con biopsia y estadificación local (resonancia de pelvis o ecografía endorrectal) y a distancia (TC de tórax y abdomen)'),
        D('¿Es un T1 de bajo riesgo bien seleccionado?',
          [F('Resección local transanal (TAMIS), con instrumental endoscópico: buenos resultados con selección adecuada')],
          [D('¿Es localmente avanzado?',
             [A('Elegir el esquema neoadyuvante según el riesgo: quimiorradioterapia de curso largo en tumores voluminosos (reducir masa tumoral); radioterapia de curso corto en tumores más pequeños con adenopatías sospechosas, MRC claramente negativo, comorbilidades o estadio IV, para no demorar la quimioterapia'),
              D('¿Hay alto riesgo metastásico (N+, invasión venosa extramural)?',
                [A('Terapia neoadyuvante total (TNT): suma la quimioterapia sistémica antes de la cirugía, de inducción (QT y luego RT o QRT) o de consolidación (RT o QRT y luego QT); mayor adherencia a la quimioterapia, más respuesta patológica completa y más resecabilidad (riesgo de recaída a distancia: 25 % en estadio II y 40 % en III)')],
                [A('Neoadyuvancia clásica (radioterapia o quimiorradioterapia)')]),
              A('Escisión total del mesorrecto: resección anterior baja (la mayoría de los extraperitoneales), resección interesfintérica o amputación abdominoperineal cilíndrica (extraelevadores) si compromete el aparato esfinteriano'),
              F('Ostomía derivativa de protección sistemática y cierre luego de al menos 60 días, tras descartar dehiscencia anastomótica; un reservorio mejora los resultados funcionales')],
             [F('Cirugía directa según la estadificación')])]),
    ]),
    fuente=FC('73', 'Cáncer de recto (esquemas neoadyuvantes, TNT)'),
)

# ---- traumatismo de colon y recto (fig. 79-2-1)
nueva('cx-trauma-colon-recto', 'Traumatismos de colon y recto',
      ['trauma de colon', 'trauma de recto', 'lesion colonica', 'control del daño', 'control de daños', 'reparacion primaria'], 'cx4', U4,
      'Lesiones del colon por trauma abdominal. Las del recto son infrecuentes (5 a 10 % de las lesiones colorrectales en la práctica civil) y, por estar en un espacio compacto de la pelvis en relación con otros órganos, suelen ser solitarias; las lesiones vasculares, urológicas o ginecológicas asociadas agravan el pronóstico.',
      ['Colon: la conducta depende de si hay indicación de control del daño (hipotermia, acidosis, hipotensión o trauma complejo) y de si la lesión es destructiva o no.',
       'Recto: el segmento extraperitoneal está rodeado de la atmósfera celuloadiposa perirrectal, comunicada con el retroperitoneo y con los espacios perivesical y periprostático, lo que favorece la propagación séptica. Etiología: agentes intrínsecos (traumatismos obstétricos con roturas perineales graves, más en primíparas jóvenes) y extrínsecos no penetrantes (aplastamiento o diástasis pélvica con fracturas, 4 a 5 %).'],
      ['TC de abdomen y pelvis con contraste en el paciente estable; exploración quirúrgica si hay peritonitis o inestabilidad.'],
      P(('Conducta (fig. 79-2-1)', [
          ('Sin indicación de control del daño', 'Lesión colónica no destructiva: reparación primaria y cirugía definitiva. Lesión destructiva: decidir el tratamiento definitivo; la disociación de los cabos colónicos se asocia con aumento de la mortalidad.'),
          ('Con indicación de control del daño', 'Hipotermia, acidosis, hipotensión o trauma complejo: cirugía de control del daño, con cirugía definitiva diferida.'),
      ])),
      ['Seguimiento posoperatorio vigilando la infección pelviana y las lesiones asociadas.'],
      ['El trauma de recto extraperitoneal tiene alto riesgo de sepsis pelviana.', 'Hipotermia, acidosis y coagulopatía contraindican la reparación definitiva inmediata.'],
      dict(titulo='Trauma de colon (Giménez 2025, fig. 79-2-1)', nodos=[
          I('Traumatismo colónico: evaluar hemodinamia, hipotermia, acidosis y complejidad del trauma'),
          D('¿Hay hipotermia, acidosis, hipotensión o trauma complejo (indicación de control del daño)?',
            [F('Cirugía de control del daño y reconstrucción diferida')],
            [D('¿La lesión colónica es no destructiva?',
               [F('Reparación primaria y cirugía definitiva')],
               [F('Lesión destructiva sin indicación de control del daño: decidir el tratamiento definitivo; la disociación de cabos (ostomía) se asocia con aumento de la mortalidad')])]),
      ]),
      FG('79', 'Traumatismos abdominopelvianos (traumatismos de colon y de recto)', 'Fig. 79-2-1.'))

# ---- neumotórax y derrame pleural (figs. 29-2 y 29-6)
nueva('cx-neumotorax-derrame-pleural', 'Neumotórax y derrame pleural paraneumónico',
      ['neumotorax', 'derrame pleural', 'empiema', 'drenaje pleural', 'tubo pleural', 'criterios de light', 'quilotorax', 'derrame paraneumonico'], 'cx9', U9,
      'El neumotórax y los derrames pleurales son las causas más frecuentes de procedimientos en el tórax. El drenaje pleural unidireccional y la videotoracoscopia son pilares de la cirugía torácica moderna; los criterios de Light diferencian trasudados de exudados.',
      ['Objetivos del tratamiento del neumotórax: evacuar el aire (o el líquido), lograr la reexpansión, tratar la causa y prevenir la recidiva. El tratamiento médico es lento (el aire se reabsorbe a razón de 1,25 % por día) y la recidiva es del 30 al 50 %.',
       'Derrame paraneumónico y empiema: todos se tratan con antibióticos, con cobertura de anaerobios si hace falta. Hay consenso en que los derrames de más de medio hemitórax, loculados, con engrosamiento pleural, cultivo positivo, pH menor de 7,2 o pus macroscópico deben tratarse quirúrgicamente por su mayor morbimortalidad.',
       'Quilotórax: líquido pleural lechoso por rotura del conducto torácico o sus afluentes (75 % por linfomas; también traumatismos y procedimientos torácicos); se confirma con quilomicrones en el líquido pleural.'],
      ['Radiografía de tórax; la TC es útil en neumotórax traumáticos pequeños, para el diagnóstico diferencial con bullas gigantes y para evaluar el parénquima; toracocentesis con pH, Gram y cultivo; ecografía.'],
      P(('Tratamiento', [
          ('Neumotórax: observación', 'Reposo y observación en los laminares, apicales, menores del 10 % (hasta el 20 % en jóvenes asintomáticos), con nueva radiografía a las 6 horas; se excluyen aeronavegantes, buzos, paracaidistas, viajeros frecuentes y deportistas, que pueden tener indicación quirúrgica de entrada.'),
          ('Neumotórax: drenaje', 'Drenaje con tubo: con expansión completa y drenaje sellado se retira al 4.º o 5.º día; si falla la expansión, aspiración continua, kinesioterapia y broncoaspiración; si no resuelve o la fístula persiste más allá del 7.º día, cirugía.'),
          ('Neumotórax: cirugía', 'Segundo episodio recidivado, neumotórax contralateral, complicado (hemotórax, piotórax), enfermedad bullosa diagnosticada y profesiones de riesgo.'),
          ('Derrame paraneumónico', 'Antibióticos; con derrame mayor de 1 cm, toracocentesis: líquido purulento, Gram o cultivo positivo, pH menor de 7,20, glucosa menor de 40 mg/dL o LDH mayor de 1000 U/L indican drenaje pleural con fibrinolíticos, videotoracoscopia o decorticación; si no, solo antibióticos.'),
      ])),
      ['Control radiológico tras el drenaje y vigilancia de la reexpansión.'],
      ['Líquido purulento en la toracocentesis: drenaje pleural.', 'Neumotórax en aeronavegantes, buzos o deportistas: considerar la cirugía desde el primer episodio.'],
      dict(titulo='Neumotórax y derrame paraneumónico (Giménez 2025, figs. 29-2 y 29-6)', nodos=[
          I('Disnea o dolor torácico: radiografía de tórax; diferenciar neumotórax de derrame pleural'),
          D('¿Es un neumotórax?',
            [D('¿Es laminar, apical, menor del 10 % (o 20 % en joven asintomático) y no es profesión de riesgo?',
               [F('Reposo y observación con nueva radiografía a las 6 horas')],
               [A('Drenaje con tubo pleural; con expansión completa, retirar al 4.º o 5.º día'),
                D('¿Hay falla de expansión o fístula persistente más allá del 7.º día?',
                  [F('Aspiración continua, kinesioterapia y broncoaspiración; si no resuelve, cirugía')],
                  [F('Curación; cirugía si hay segundo episodio, contralateral, complicado, enfermedad bullosa o profesión de riesgo')])])],
            [A('Derrame paraneumónico: antibióticos y, si es mayor de 1 cm, toracocentesis'),
             D('¿El líquido es purulento o tiene Gram o cultivo positivo, pH menor de 7,20, glucosa menor de 40 mg/dL o LDH mayor de 1000 U/L?',
               [F('Antibióticos más drenaje pleural, fibrinolíticos, videotoracoscopia o decorticación')],
               [F('Antibióticos y control')])]),
      ]),
      FG('29', 'Manejo del espacio pleural', 'Figuras 29-2 y 29-6.'))

# ---- reanimación cardiopulmonar (fig. 8-4)
nueva('cx-reanimacion-cardiopulmonar', 'Reanimación cardiopulmonar',
      ['rcp', 'paro cardiorrespiratorio', 'fibrilacion ventricular', 'asistolia', 'adrenalina', 'desfibrilacion', 'causas reversibles'], 'cx9', U9,
      'Conjunto de maniobras para sostener la circulación y la ventilación ante un paro cardiorrespiratorio; el algoritmo depende de que el ritmo sea desfibrilable (FV o TV sin pulso) o no (asistolia o actividad eléctrica sin pulso).',
      ['Puntos fundamentales (fig. 8-4): masaje cardíaco a 100 a 120 por minuto, compresión de 5 hasta 6 cm, permitir la reexpansión del tórax, minimizar las interrupciones, cambiar al operador cada 2 minutos y ventilar con relación 30:2.',
       'Causas reversibles: hipovolemia, hipoxia, hipo o hiperpotasemia, hipotermia, hidrogenión (acidosis), neumotórax a tensión, taponamiento cardíaco, trombosis coronaria, trombosis pulmonar y toxinas.'],
      ['Conectar el monitor para definir si el ritmo es desfibrilable.'],
      P(('Conducta', [
          ('Ritmo desfibrilable', 'Desfibrilar, 2 minutos de RCP con acceso IV/IO y chequear el ritmo; si persiste, desfibrilar de nuevo; adrenalina 1 mg cada 3 a 5 minutos y vía aérea avanzada; luego de la tercera descarga, amiodarona (300 mg y luego 150 mg) o lidocaína (1,5 mg/kg y luego 0,5 mg/kg).'),
          ('Ritmo no desfibrilable', 'Asistolia o AESP: 2 minutos de RCP con acceso IV/IO y adrenalina 1 mg cada 3 a 5 minutos; considerar la vía aérea avanzada; chequear el ritmo cada 2 minutos y tratar las causas reversibles.'),
      ])),
      ['Cuidados posparo en terapia intensiva.'],
      ['Compresiones de calidad y mínimas interrupciones.', 'Buscar y tratar las causas reversibles.'],
      dict(titulo='Reanimación cardiopulmonar (Giménez 2025, fig. 8-4)', nodos=[
          I('Paciente sin respuesta ni pulso: iniciar la RCP (masaje 100 a 120 por minuto, 5 a 6 cm, ventilación 30:2) y conectar el monitor'),
          D('¿El ritmo es desfibrilable (FV o TV sin pulso)?',
            [A('Desfibrilar; 2 minutos de RCP con acceso IV/IO; chequear el ritmo'),
             A('Si persiste: desfibrilar de nuevo y dar adrenalina 1 mg cada 3 a 5 minutos con vía aérea avanzada'),
             F('Luego de la tercera descarga: amiodarona 300 mg (segunda dosis 150 mg) o lidocaína 1,5 mg/kg (0,5 mg/kg); buscar las causas reversibles')],
            [A('Asistolia o AESP: 2 minutos de RCP con acceso IV/IO y adrenalina 1 mg cada 3 a 5 minutos'),
             F('Chequear el ritmo cada 2 minutos y tratar las causas reversibles (hipovolemia, hipoxia, potasio, hipotermia, acidosis, neumotórax a tensión, taponamiento, trombosis coronaria o pulmonar, toxinas)')]),
      ]),
      FG('8', 'Reanimación cardiopulmonar', 'Algoritmo de la fig. 8-4.'))

# ---- cáncer de ano (cap. 74)
nueva('cx-cancer-ano', 'Cáncer de ano y neoplasia intraepitelial anal',
      ['cancer de ano', 'carcinoma anal', 'ain', 'hpv', 'nigro', 'anoscopia de alta resolucion', 'amputacion abdominoperineal'], 'cx4', U4,
      'Neoplasia muy poco frecuente que llega a proporciones epidémicas en ciertos grupos, como los pacientes HSH y VIH positivos. Se relaciona con la infección por el virus del papiloma humano, sobre todo las cepas de alto riesgo 16 y 18.',
      ['La mayoría de los tumores está precedida por lesiones preneoplásicas (neoplasia intraepitelial anal, AIN) y, desde el estudio ANCHOR, se sabe que se puede prevenir su progresión a cáncer.',
       'Diagnóstico: examen físico, citología anal y anoscopia de alta resolución con biopsia. No se requieren programas de detección en la población general, pero sí en pacientes con factores de riesgo.'],
      ['Ecografía endoanal, TC abdominopélvica, RM de pelvis y, en algunos casos, PET-TC para el diagnóstico y la estadificación.'],
      P(('Tratamiento', [
          ('Quimiorradioterapia', 'Esquema similar al de Nigro (1974): radioterapia y quimioterapia.'),
          ('Rescate', 'En caso de fracaso (hay que esperar hasta 6 meses para confirmar la persistencia o la progresión): amputación abdominoperineal extraelevadora.'),
          ('Casos seleccionados', 'Resecciones locales con terapia adyuvante o sin ella.'),
      ])),
      ['Seguimiento cada 2 meses el primer año, cada 3 meses el segundo y cada 6 meses del tercero al quinto; luego una consulta por año.'],
      ['Pacientes HSH y VIH positivos: pesquisa de la neoplasia intraepitelial anal.', 'Esperar hasta 6 meses antes de definir el fracaso del tratamiento y rescatar con cirugía.'],
      dict(titulo='Cáncer de ano (Giménez 2025)', nodos=[
          I('Lesión anal sospechosa o paciente de riesgo (HSH, VIH positivo): examen, citología anal y anoscopia de alta resolución con biopsia'),
          A('Estadificación: ecografía endoanal, TC abdominopélvica, RM de pelvis y, si hace falta, PET-TC'),
          D('¿Es un carcinoma anal invasor?',
            [A('Radioterapia más quimioterapia (esquema de Nigro)'),
             D('¿Persiste o progresa a los 6 meses?',
               [F('Rescate quirúrgico: amputación abdominoperineal extraelevadora')],
               [F('Seguimiento: cada 2 meses el primer año, cada 3 el segundo y cada 6 del tercero al quinto año')])],
            [F('Lesión preneoplásica (AIN): tratamiento y vigilancia para prevenir la progresión')]),
      ]),
      FG('74', 'Cáncer de ano'))

# ---- prolapso rectal (Galindo II-383)
nueva('cx-prolapso-rectal', 'Prolapso rectal',
      ['prolapso rectal', 'procidencia', 'intususcepcion rectal', 'videodefecografia', 'rectopexia', 'altemeier'], 'cx4', U4,
      'Descenso circunferencial de todas las capas del recto a través del ano; es un problema poco frecuente y de etiología oscura. Se considera incompleto si compromete solo la mucosa y completo si afecta toda la pared.',
      ['Clasificación de Altemeier: tipo I o prolapso mucoso; tipo II o prolapso interno por intususcepción sin hernia del fondo de saco; tipo III o prolapso completo por hernia por deslizamiento a través de un defecto del diafragma pelviano.',
       'Afecta los extremos de la vida: en niños sobre todo en los dos primeros años (más el prolapso mucoso); en adultos es más frecuente en mayores de 60 años y casi exclusivamente en mujeres (90 %). El parto no es un factor etiológico claro (el 40 % eran nulíparas en una serie).',
       'La videodefecografía es el estudio más efectivo para el prolapso oculto y los trastornos de la defecación; la intususcepción se ve como una imagen en "copa de champagne" y se relaciona con la úlcera solitaria del recto.'],
      ['Videodefecografía; examen proctológico y evaluación del piso pelviano.'],
      P(('Tratamiento', [
          ('Médico', 'Regulación del hábito intestinal para facilitar la evacuación y evitar el esfuerzo; biofeedback, que puede ser beneficioso en algunos casos.'),
          ('Quirúrgico', 'Se emplearon múltiples procedimientos: ostomías, resección de la úlcera y procedimientos de pexia, asociados o no a resección intestinal. Ante retardo evacuatorio sin prolapso interno en la defecografía, la pexia no aliviaría los síntomas y se prefiere una ostomía; no hay un tratamiento único y efectivo por el desconocimiento de la etiopatogenia.'),
      ])),
      [],
      ['Retardo evacuatorio sin prolapso interno: la pexia rectal probablemente no alivie los síntomas.'],
      dict(titulo='Prolapso rectal (Enciclopedia de Cirugía Digestiva)', nodos=[
          I('Descenso del recto por el ano: examen, clasificación (Altemeier) y videodefecografía'),
          D('¿Es un prolapso mucoso o leve en un niño?',
            [F('Regular el hábito intestinal; en niños suele resolverse con medidas conservadoras')],
            [A('Regulación del hábito y biofeedback'),
             D('¿Persisten los síntomas y hay prolapso interno o completo?',
               [F('Cirugía: procedimiento de pexia, con o sin resección intestinal, según la edad y el estado del paciente')],
               [F('Retardo evacuatorio sin prolapso interno: la pexia no alivia los síntomas; considerar una ostomía')])]),
      ]),
      GAL('III-383', 'prolapso rectal', 'II-383 ProlaPso recta.pdf'))

# ---- quiste sacrococcígeo (Galindo I-381)
nueva('cx-quiste-sacrococcigeo', 'Quiste dermoideo sacrocoxígeo (enfermedad pilonidal)',
      ['quiste sacrococcigeo', 'enfermedad pilonidal', 'seno pilonidal', 'absceso pilonidal', 'fistula dermoidea'], 'cx4', U4,
      'Cavidad quística o seno subcutáneo, con o sin fístulas, que en la mitad de los casos contiene pelos, ubicado en la región sacrocoxígea posterior. Sinónimos: quiste pilonidal, enfermedad del jeep.',
      ['Se presenta en cuadros agudos (absceso) y crónicos o con fístulas; el tratamiento depende de la forma de presentación y de la oportunidad.'],
      ['Diagnóstico clínico por el examen de la región sacrocoxígea.'],
      P(('Tratamiento', [
          ('Principio', 'El tratamiento es quirúrgico; los procedimientos no quirúrgicos (instilación de fenol) fueron dejados de lado. Ninguna técnica es ideal ni sirve para todos los casos: debería tener pocas o ínfimas recidivas, ser sencilla, con curva de aprendizaje corta, bajo riesgo, fácil control del dolor, posoperatorio breve y reinserción laboral precoz.'),
          ('No resectivas', 'Incisión simple para drenaje, destechamiento y curetaje, destechamiento y marsupialización.'),
          ('Resectivas', 'Resección y cierre por granulación, semicerrado, primario simple o primario complejo.'),
          ('Elección', 'Según la forma de presentación (agudo, programado, uno o varios orificios, primera recidiva o varias) y la experiencia del cirujano o del servicio.'),
      ])),
      [],
      ['La técnica se elige según la presentación y la experiencia del cirujano.', 'En el cuadro agudo (absceso), la opción es la incisión y el drenaje.'],
      dict(titulo='Quiste sacrocoxígeo (Enciclopedia de Cirugía Digestiva)', nodos=[
          I('Dolor, tumefacción o supuración en la región sacrocoxígea: examen y definir si es agudo (absceso) o crónico'),
          D('¿Es un absceso agudo?',
            [F('Incisión simple para drenaje (técnica no resectiva); el tratamiento definitivo se programa luego')],
            [D('¿Es un seno con un solo orificio, en cirugía programada?',
               [F('Técnica no resectiva (destechamiento y curetaje o marsupialización) o resección con cierre semicerrado o primario')],
               [F('Varios orificios o recidiva: resección con cierre primario complejo o por granulación, según la experiencia del cirujano')])]),
      ]),
      GAL('I-381', 'quiste dermoideo sacrocoxígeo', 'I-381 QUISte DermoIDeo Sacrocoxíge.pdf'))
