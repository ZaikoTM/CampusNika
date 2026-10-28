# -*- coding: utf-8 -*-
"""UP4 · Enfermedad colorrectal y anorrectal. Los algoritmos reordenan el tratamiento de la guía de la Sociedad Argentina de Coloproctología (ya citada en cada ficha); Giménez 2.ª ed. (2025), caps. 64, 67, 68, 69, 72, 73 y 83, se suma como fuente complementaria."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- diverticulitis ----------------
CONTENIDO['cx-diverticulitis'] = dict(
    algoritmo=dict(titulo='Diverticulitis aguda (guía argentina de coloproctología y Giménez 2025)', nodos=[
        I('Dolor en fosa ilíaca izquierda (a veces con síntomas urinarios), fiebre y leucocitosis: TC de abdomen con contraste (estandariza el diagnóstico y el tratamiento)'),
        D('¿Es no complicada (Hinchey Ia: flemón pericólico), sin factores de riesgo ni sepsis y con tolerancia oral?',
          [F('Manejo ambulatorio sin antibióticos de rutina (estudio DIABOLO), con reevaluación; antibióticos si hay factores de riesgo o falla')],
          [D('¿Hay un absceso pericólico o a distancia (Hinchey Ib o II)?',
             [A('Antibióticos y drenaje percutáneo si el absceso es mayor de 3 a 5 cm'),
              F('Cirugía si es grande, multiloculado o falla el manejo conservador')],
             [F('Peritonitis purulenta o fecal (Hinchey III o IV): cirugía urgente (Hartmann, o anastomosis primaria con ileostomía de protección según la estabilidad)')])]),
        A('Cirugía electiva individualizada (inmunosuprimidos, episodios complicados, recurrencias con mala calidad de vida), de preferencia laparoscópica; ya no es automática tras el segundo episodio'),
    ]),
    fisiopatologia=[
        'La diverticulosis colónica es multifactorial y suele ser asintomática; sus manifestaciones específicas son las complicaciones: inflamatorias (diverticulitis aguda y crónica) y hemorrágicas.',
        'Hinchey (1978), modificada con la TC: Ia flemón pericólico, Ib absceso pericólico o mesocólico, II absceso pélvico o a distancia, III peritonitis purulenta generalizada y IV peritonitis fecal generalizada. Grados I y II dan dolor localizado con defensa; III y IV dolor generalizado con reacción peritoneal.',
    ],
    banderas=[
        'Hemorragia diverticular: colonoscopia o angiografía para localizar; la colectomía total queda para quienes siguen sangrando sin sitio; evitar resecciones segmentarias a ciegas (resangrado del 40 %).',
        'Peritonitis (Hinchey III o IV) o sepsis: cirugía urgente.',
    ],
    fuente=FC('69', 'Enfermedad diverticular del colon'),
)

# ---------------- cáncer colorrectal ----------------
CONTENIDO['cx-cancer-colorrectal'] = dict(
    algoritmo=dict(titulo='Cáncer de colon (guía argentina de coloproctología y Giménez 2025)', nodos=[
        I('Sospecha (sangrado, cambio del ritmo evacuatorio, anemia) o pesquisa en asintomáticos desde los 45 a 50 años: colonoscopia con biopsia, la forma más eficaz de prevención'),
        A('Estadificación: tomografía de tórax y abdomen en busca de secundarismo; CEA; comité multidisciplinario'),
        D('¿Hay obstrucción o perforación?',
          [F('Cirugía de urgencia: resección con o sin anastomosis, derivación (colostomía) en inestables o prótesis como puente a la cirugía')],
          [A('Colectomía oncológica con resección en bloque del segmento y su mesocolon, ligadura vascular alta y mínimo de 12 ganglios; la vía laparoscópica logra resultados oncológicos equivalentes con recuperación más rápida'),
           D('¿Estadio III?',
             [F('Quimioterapia adyuvante con fluoropirimidina y oxaliplatino (3 meses de CAPOX en T1-3 N1; 6 meses en T4 o N2)')],
             [D('¿Hay metástasis hepáticas o pulmonares resecables?',
                [F('Resección de las metástasis en casos seleccionados más tratamiento sistémico')],
                [F('Seguimiento oncológico según el estadio')])])]),
    ]),
    banderas=[
        'La colonoscopia a la edad indicada en asintomáticos (45 a 50 años) es la medida preventiva más eficaz.',
        'El tratamiento quirúrgico debe estar a cargo de especialistas: la radicalidad y la calidad oncológica definen la curación.',
    ],
    fuente=FC('72', 'Cáncer de colon'),
)

# ---------------- cáncer de recto ----------------
CONTENIDO['cx-cancer-recto'] = dict(
    algoritmo=dict(titulo='Cáncer de recto (guía argentina de coloproctología y Giménez 2025)', nodos=[
        I('Tacto rectal, colonoscopia con biopsia y estadificación local (resonancia de pelvis o ecografía endorrectal) y a distancia (TC de tórax y abdomen)'),
        D('¿Es un T1 de bajo riesgo bien seleccionado?',
          [F('Resección local transanal (TAMIS), con instrumental endoscópico: buenos resultados con selección adecuada')],
          [A('Localmente avanzado: neoadyuvancia según el riesgo (radioterapia corta 5 × 5 Gy, quimiorradioterapia o terapia total neoadyuvante)'),
           A('Escisión total del mesorrecto: resección anterior baja (la mayoría de los tumores extraperitoneales), resección interesfintérica o amputación abdominoperineal cilíndrica (extraelevadores) si compromete el aparato esfinteriano'),
           F('Ostomía derivativa de protección sistemática (colostomía o ileostomía en asa) y cierre luego de al menos 60 días, tras descartar dehiscencia anastomótica; un reservorio mejora los resultados funcionales')]),
    ]),
    fuente=FC('73', 'Cáncer de recto'),
)

# ---------------- vólvulo de sigmoides ----------------
CONTENIDO['cx-volvulo-sigmoides'] = dict(
    algoritmo=dict(titulo='Vólvulo de sigmoides (guía argentina de coloproctología)', nodos=[
        I('Dolor abdominal, distensión asimétrica y obstrucción en un paciente con megacolon o constipación crónica (más frecuente en varones de 40 a 60 años): radiografía de abdomen ("grano de café") o TC'),
        D('¿Hay signos de gangrena, perforación o peritonitis?',
          [F('Cirugía urgente: resección con operación de Hartmann')],
          [A('Descompresión endoscópica (rectosigmoidoscopia con sonda rectal)'),
           F('Sigmoidectomía electiva por la alta recurrencia')]),
    ]),
    fuente=FC('68', 'Megacolon del adulto'),
)

# ---------------- colitis ulcerosa y Crohn ----------------
CONTENIDO['cx-colitis-ulcerosa-crohn'] = dict(
    algoritmo=dict(titulo='Indicación quirúrgica en la enfermedad inflamatoria intestinal (guía argentina de coloproctología)', nodos=[
        I('Paciente con colitis ulcerosa o enfermedad de Crohn y falla del tratamiento médico o complicación'),
        D('¿Es una urgencia (colitis aguda grave refractaria, megacolon tóxico, perforación o hemorragia masiva)?',
          [F('Colectomía subtotal con ileostomía')],
          [D('¿Es colitis ulcerosa?',
             [F('Proctocolectomía total con reservorio ileal (pouch) o ileostomía definitiva: es curativa')],
             [F('Crohn: resecciones limitadas y estricturoplastias, preservando intestino; no es curativa y suele recidivar')])]),
    ]),
    fuente=FC('67', 'Colopatía inflamatoria (colitis ulcerosa y enfermedad de Crohn)'),
)

# ---------------- hemorroides ----------------
CONTENIDO['cx-hemorroides'] = dict(
    algoritmo=dict(titulo='Enfermedad hemorroidal (guía argentina de coloproctología)', nodos=[
        I('Rectorragia indolora o prolapso: tacto rectal y anoscopia; descartar otras causas de sangrado con colonoscopia según la edad y los factores de riesgo'),
        D('¿Grado I o II?',
          [A('Fibra, hidratación, evitar el esfuerzo, flebotónicos y baños de asiento'),
           F('Si persiste (grados II y III): ligadura con banda elástica, escleroterapia o fotocoagulación')],
          [D('¿Es una trombosis aguda?',
             [F('Escisión del trombo en las primeras 48 a 72 horas, o analgesia y antiinflamatorios')],
             [F('Grados III y IV o fracaso: hemorroidectomía (convencional o con sellado vascular); hemorroidopexia grapada en casos seleccionados')])]),
    ]),
    fuente=FC('64', 'Patología anal benigna'),
)

# ---------------- fisura anal ----------------
CONTENIDO['cx-fisura-anal'] = dict(
    algoritmo=dict(titulo='Fisura anal', nodos=[
        I('Dolor intenso durante y después de la defecación con sangre roja escasa: inspección y separación suave de los glúteos (no hacer tacto si duele mucho)'),
        D('¿Es una fisura aguda?',
          [F('Fibra, hidratación, baños de asiento y analgésicos tópicos')],
          [A('Crónica: relajantes esfinterianos tópicos (nifedipina o diltiazem)'),
           D('¿Persiste?',
             [A('Toxina botulínica'),
              F('Esfinterotomía lateral interna en la refractaria: alta tasa de curación, con riesgo de incontinencia leve')],
             [F('Control y medidas de hábito intestinal')])]),
    ]),
    fuente=FC('64', 'Patología anal benigna'),
)

# ---------------- absceso y fístula anal ----------------
CONTENIDO['cx-absceso-fistula-anal'] = dict(
    algoritmo=dict(titulo='Absceso y fístula perianal', nodos=[
        I('Dolor perianal constante con tumefacción, fiebre o supuración: examen perianal y tacto; resonancia o ecografía endoanal si se sospecha una fístula compleja'),
        D('¿Hay absceso?',
          [F('Drenaje quirúrgico urgente, sin postergarlo: los antibióticos solos no lo resuelven (salvo inmunodeprimidos o celulitis)')],
          [D('¿La fístula es baja o simple?',
             [F('Fistulotomía')],
             [F('Fístula alta o compleja: setón y técnicas de preservación esfinteriana (colgajo, LIFT, pegamento)')])]),
    ]),
    fuente=FC('64', 'Patología anal benigna'),
)

# ---------------- ostomías ----------------
CONTENIDO['cx-ostomias'] = dict(
    algoritmo=dict(titulo='Control del paciente ostomizado (guía argentina de coloproctología)', nodos=[
        I('Paciente con estoma (colostomía o ileostomía): marcación preoperatoria del sitio, educación y control de la vitalidad del estoma en el posoperatorio'),
        D('¿El estoma está oscuro, violáceo o negro (isquemia)?',
          [F('Evaluar la profundidad de la isquemia y reintervenir si compromete la fascia: urgencia')],
          [D('¿Hay una complicación (dermatitis, prolapso, hernia paraestomal, débito alto)?',
             [A('Dermatitis: ajustar la placa; prolapso o hernia sintomáticos: reparación; débito alto: hidratar y antidiarreicos'),
              F('Derivar al equipo de ostomías')],
             [F('Educación continua: cuidado de la piel, cambio de bolsa, dieta, hidratación y signos de alarma; cierre del estoma de protección tras al menos 60 días si corresponde')])]),
    ]),
    fuente=FC('73', 'Cáncer de recto (ostomía de protección)'),
)

# ---------------- isquemia colónica ----------------
CONTENIDO['cx-isquemia-colonica'] = dict(
    algoritmo=dict(titulo='Isquemia colónica', nodos=[
        I('Dolor abdominal, diarrea con sangre y factores de riesgo vasculares: TC con contraste y colonoscopia temprana'),
        D('¿Hay gangrena, peritonitis o shock?',
          [F('Colectomía urgente con ostomía')],
          [A('Hidratación, reposo intestinal, antibióticos y corrección de la hipotensión'),
           F('Se resuelve en la mayoría; control de estenosis tardía (dilatación o resección)')]),
    ]),
    fuente=FC('84', 'Abdomen agudo quirúrgico (abdomen agudo de origen vascular)'),
)

# ---------------- hemorragia digestiva baja ----------------
CONTENIDO['cx-hemorragia-digestiva-baja'] = dict(
    algoritmo=dict(titulo='Hemorragia digestiva baja (Giménez 2025)', nodos=[
        I('Hematoquecia o melena: evaluación minuciosa del estado hemodinámico; reanimación con cristaloides y hemoderivados (Hb alrededor de 7 g/dL); el 80 % cede espontáneamente'),
        D('¿Se sospecha un origen alto (cinco veces más frecuente que la HDB)?',
          [A('Videoendoscopia digestiva alta primero')],
          [A('Colonoscopia, que asocia diagnóstico y tratamiento (terapéutica hasta en el 50 %)')]),
        D('¿Hay inestabilidad o sangrado activo sospechado?',
          [A('Angiotomografía (el método más rápido y menos invasivo para localizar el sitio) y angiografía con embolización'),
           D('¿Sigue inestable pese a la reanimación?',
             [F('Cirugía: resección segmentaria si se localizó el sitio; colectomía subtotal si no (alta morbimortalidad)')],
             [F('Tratamiento dirigido y control en unidad de cuidados')])],
          [F('Manejo según el hallazgo (causa más frecuente en internados: divertículos); ambulatorio solo si es leve, estable y sin comorbilidades')]),
    ]),
    banderas=[
        'La colectomía subtotal es el recurso para el paciente inestable sin sitio de sangrado localizado: mortalidad alta.',
        'La mortalidad de un episodio de hemorragia digestiva baja es baja (2 a 4 %).',
        'Factores de riesgo: AINE, anticoagulantes o antiagregantes, alcohol y tabaquismo.',
    ],
    fuente=FG('83', 'Hemorragia digestiva baja', 'Manejo ambulatorio y criterios de internación según el manual de la Universidad de Chile (2020).'),
)

# ---------------- ficha nueva: megacolon ----------------
_mega = {
    'id': 'cx-megacolon-fecaloma', 'area': 'cirugia',
    'titulo': 'Megacolon del adulto y fecaloma',
    'alias': ['megacolon', 'dolicomegacolon', 'megasigma', 'chagas', 'fecaloma', 'duhamel', 'estreñimiento'],
    'up': ['cx4'], 'unidad': 'UP4 · Enfermedad colorrectal y anorrectal', 'estado': 'verificar',
    'definicion': 'Dilatación y/o alargamiento total o segmentario de una o más porciones del intestino grueso (sobre todo recto y sigmoides), sin una obstrucción orgánica: se debe a una lesión de los plexos mientéricos que lleva a disperistalsis o aperistalsis colónica.',
    'diagnostico': [
        'Clasificación: primario (congénito o adquirido del adulto), secundario (estenosis inflamatorias, orgánicas, bridas), funcional (drogas, psicogénico, hipotiroideo, tóxico, de altura) e idiopático; chagásico y no chagásico. Por topografía: megarrecto, megasigma, megarrectosigma, dólico-megasigma y megacolon total.',
        'Presentación crónica: estreñimiento pertinaz, distensión y alteración evacuatoria. Presentación por complicaciones: fecaloma (la más frecuente) y vólvulo del sigmoides (segunda en frecuencia, sobre todo en varones de 40 a 60 años).',
        'Las complicaciones cursan con dolor abdominal, distensión asimétrica, obstrucción intestinal y, a veces, sangrado y shock.',
    ],
    'estudios': [
        'Clínica y radiografía directa de abdomen. La radiografía contrastada sirve en los estadios crónicos y puede reemplazarse por colonoscopia virtual; la colonoscopia estándar es difícil por el dolicomegacolon pero útil para descartar patología asociada.',
    ],
    'tratamiento': [{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Médico', 'texto': 'Laxantes y medidas higiénico-dietéticas.'},
        {'etiqueta': 'Quirúrgico', 'texto': 'Indicado ante falla del tratamiento médico, antecedente de vólvulo o fecaloma, estreñimiento importante y asistolia colónica. La opción más fisiológica es la operación de Duhamel-Hadad (resección colorrectal con anastomosis colorrectal término-lateral por debajo del promontorio).'},
        {'etiqueta': 'Complicaciones', 'texto': 'Vólvulo de sigmoides: ver su ficha. Fecaloma: desimpactación y medidas para prevenir la recurrencia.'},
    ]}],
    'seguimiento': ['Control del hábito intestinal y vigilancia de complicaciones en el megacolon crónico.'],
    'banderas': [
        'Dolor con distensión asimétrica en un paciente con constipación crónica: vólvulo hasta demostrar lo contrario.',
        'En áreas endémicas, pensar en megacolon chagásico.',
    ],
    'algoritmo': dict(titulo='Megacolon del adulto (Giménez 2025)', nodos=[
        I('Estreñimiento pertinaz, distensión o una complicación aguda (fecaloma, vólvulo): radiografía directa de abdomen'),
        D('¿Hay una complicación aguda (vólvulo, fecaloma impactado, obstrucción)?',
          [F('Tratar la complicación: descompresión del vólvulo y sigmoidectomía electiva, o desimpactación del fecaloma; cirugía urgente si hay gangrena o perforación')],
          [A('Laxantes y medidas higiénico-dietéticas'),
           D('¿Falla el tratamiento médico o hay antecedente de vólvulo o fecaloma?',
             [F('Cirugía: Duhamel-Hadad como opción más fisiológica')],
             [F('Control y seguimiento')])]),
    ]),
    'fuente': FG('68', 'Megacolon del adulto'),
    'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.',
}
NUEVAS = [_mega]
