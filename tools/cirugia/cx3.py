# -*- coding: utf-8 -*-
"""UP3 · Disfagia y patología esofagogástrica. Base: Giménez 2.ª ed. (2025), caps. 36 (acalasia), 37 (hernia hiatal y ERGE), 38 (divertículos), 39 (cáncer de esófago), 41 (tumores gástricos), 42 (cáncer gástrico), 43 (úlcera complicada) y 82 (hemorragia digestiva alta)."""
from base import I, A, F, D, FG

# ---------------- disfagia ----------------
_dis = dict(
    algoritmo=dict(titulo='Paciente con disfagia (Giménez 2025)', nodos=[
        I('Disfagia: ¿a sólidos, líquidos o ambos? ¿progresiva? Tiempo de evolución, pérdida de peso, edad; laboratorio nutricional (albúmina, hemograma)'),
        D('¿Hay datos de alarma (inicio de menos de 6 meses, disfagia nueva en mayor de 60 años, pérdida de peso rápida o marcada, anemia)?',
          [A('Endoscopia digestiva alta con biopsia sin demora: descartar neoplasia')],
          [A('Endoscopia digestiva alta de todos modos: es el primer estudio en toda disfagia')]),
        D('¿La endoscopia muestra una lesión orgánica (tumor, estenosis, anillo, divertículo)?',
          [D('¿Es un tumor?',
             [F('Estadificar con TC, ecoendoscopia y PET/TC según el caso (ver ficha de cáncer de esófago)')],
             [F('Estenosis péptica: dilatación e inhibidores de la bomba de protones (descartar cáncer con biopsia). Divertículo de Zenker: ver su ficha')])],
          [A('Esofagograma con bario y manometría esofágica de alta resolución'),
           D('¿Hay falta de relajación del esfínter esofágico inferior con aperistalsis?',
             [F('Acalasia: ver su ficha')],
             [F('Otros trastornos motores (espasmo, esófago en cascanueces, esclerodermia) o reflujo: pHmetría y tratamiento específico; considerar causa orofaríngea')])]),
    ]),
    diagnostico=[
        'Disfagia orgánica: progresiva y sostenida, primero a sólidos y luego a alimentos blandos y líquidos; la causa típica es obstructiva (cáncer, estenosis péptica, anillos, divertículo, compresión extrínseca) y suele haber pérdida de peso.',
        'Disfagia funcional (motora): sin relación clara con la consistencia de los alimentos, variable (alterna las ingestas) y no siempre progresiva; típica de la acalasia y otros trastornos motores. En la acalasia hay disfagia a sólidos y líquidos, regurgitación y pirosis que no responde a inhibidores de la bomba de protones.',
        'Datos de alarma de malignidad: síntomas de menos de 6 meses, disfagia nueva en mayores de 60 años, pérdida de peso rápida o marcada, anemia, vómitos persistentes y hemorragia.',
        'Evaluar siempre el estado nutricional: casi todo enfermo con cáncer de esófago tiene algún grado de desnutrición y requiere soporte desde el inicio.',
    ],
    banderas=[
        'Disfagia de aparición reciente con pérdida de peso en mayores de 50 a 60 años: descartar cáncer.',
        'No atribuir la disfagia a "reflujo" sin estudiarla: el reflujo que no responde a inhibidores de la bomba de protones puede ser acalasia.',
        'Odinofagia con ingesta de cáusticos o cuerpos extraños: urgencia.',
    ],
    fuente=FG('36 y 39', 'Acalasia y otros trastornos motores del esófago; Cáncer de esófago', 'Orientación diagnóstica y estudios según Giménez; conducta general del manual de la Universidad de Chile (2020).'),
)

# ---------------- hemorragia digestiva alta no variceal ----------------
_hda_alg = dict(titulo='Hemorragia digestiva alta (Giménez 2025)', nodos=[
    I('Hematemesis, melena o hematoquecia: evaluar la hemodinamia y confirmar el sangrado (tacto rectal); dos vías de 16 a 18 G, cristaloides, laboratorio con grupo y factor, coagulograma y ECG'),
    A('Estratificar el riesgo preendoscópico con Glasgow-Blatchford (de 0 a 3 puntos: bajo riesgo)'),
    D('¿Se sospecha hipertensión portal (cirrosis, estigmas de hepatopatía)?',
      [F('Vasoactivos tempranos (octreótido, somatostatina o terlipresina), antibiótico profiláctico y endoscopia dentro de las 12 horas: ver la ficha de hemorragia variceal')],
      [A('IBP intravenoso: bolo de 80 mg y luego infusión de 8 mg/h; transfundir con Hb < 7 g/dL (< 8 si hay cardiopatía isquémica)'),
       A('Endoscopia dentro de las 24 horas, tras la reanimación (con eritromicina 250 mg IV 20 a 90 minutos antes si hay mucha sangre)'),
       D('¿La úlcera tiene alto riesgo (Forrest Ia, Ib, IIa o IIb: sangrado activo, vaso visible o coágulo adherido)?',
         [A('Tratamiento endoscópico hemostático (inyección, térmico, mecánico) y luego IBP a altas dosis'),
          D('¿Persiste o recidiva el sangrado?',
            [F('Segunda endoscopia; si falla, embolización por radiología intervencionista o cirugía (hemostasia directa con sutura no absorbible)')],
            [F('Erradicar Helicobacter pylori, suspender AINE y control; biopsias si la úlcera es gástrica')])],
         [F('Forrest IIc o III (base limpia): sin tratamiento endoscópico; IBP, erradicar H. pylori y alta según el riesgo')])]),
])
_hda = dict(
    algoritmo=_hda_alg,
    fisiopatologia=[
        'La causa principal de la hemorragia no vinculada a hipertensión portal sigue siendo la úlcera péptica, seguida por el síndrome de Mallory-Weiss y las lesiones erosivas; menos comunes son las angiectasias, la lesión de Dieulafoy y las neoplasias.',
        'Melena requiere un sangrado mayor de 50 mL y puede persistir días tras el cese; la hematemesis requiere más de 500 mL.',
        'Peor pronóstico: edad mayor de 60 años (mortalidad hasta 39 %), comorbilidades (cardíaca, renal, cirrosis, diabetes, cáncer), anticoagulación, shock inicial y recidiva temprana (principal factor de mortalidad); úlceras de 2 cm o más, en la parte alta de la curvatura menor o en la cara posterior del bulbo, y estigmas Forrest I y II.',
    ],
    diagnostico=[
        'Hematemesis, melena o hematoquecia con repercusión hemodinámica en las formas graves. Gravedad por hemodinamia: leve (sin signos), moderada (FC < 100, PAS > 100), grave (FC 100 a 120, PAS 90 a 100, sudoración, oliguria) y masiva (FC > 120, PAS < 80, anuria).',
        'Interrogar forma de presentación, última ingesta, AINE y aspirina, alcohol, anticoagulantes, betabloqueantes, episodios previos y hepatopatía; descartar hemoptisis, epistaxis y seudomelenas (hierro, carbón, bismuto).',
        'Glasgow-Blatchford (preendoscópico) decide el ámbito de internación: 0 a 3 puntos es bajo riesgo. Rockall (clínico y endoscópico) separa bajo riesgo (recidiva < 5 %, mortalidad 0,1 %) de alto riesgo (recidiva > 25 %, mortalidad 17 %).',
        'Forrest y riesgo de resangrado (Giménez): Ia 90 %, Ib 70 %, IIa 43 %, IIb 22 %, IIc 10 %, III 5 %.',
    ],
    estudios=[
        'Hemograma con plaquetas, urea, creatinina, glucemia, ionograma, coagulograma, orina, hepatograma, grupo y factor, y ECG.',
        'Endoscopia digestiva alta: primer recurso diagnóstico y terapéutico, tras una óptima recuperación hemodinámica; dentro de las 24 horas en la mayoría, y dentro de las 12 horas si hay compromiso hemodinámico o sospecha de hipertensión portal.',
        'En úlcera gástrica de aspecto benigno: biopsias dirigidas del borde y la base y repetir la endoscopia a las 8 semanas para confirmar la cicatrización. No se repite la endoscopia de control salvo recidiva o para biopsias omitidas.',
        'La sonda nasogástrica se usa de manera muy restringida: no predice la necesidad de tratamiento endoscópico ni mejora los resultados.',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Reanimación', 'texto': 'Dos vías de 16 a 18 G (central solo en cardiópatas), cristaloides; transfundir con Hb < 7 g/dL (< 8 en cardiopatía isquémica). Vasopresores si hay hipotensión pese a los líquidos; considerar intubación si hay inestabilidad persistente o riesgo de aspiración. Corregir anticoagulación supraterapéutica (vitamina K y concentrado de factores protrombínicos si hay sangrado activo).'},
        {'etiqueta': 'IBP', 'texto': 'Bolo de 80 mg intravenoso y luego 8 mg/h: reducen el sangrado activo, la necesidad de tratamiento endoscópico y los días de internación.'},
        {'etiqueta': 'Endoscópico', 'texto': 'Primera elección en úlceras de alto riesgo (sangrado activo, vaso visible o coágulo adherido): disminuye transfusiones, cirugía y mortalidad. No se trata la base limpia.'},
        {'etiqueta': 'Si falla', 'texto': 'Radiología intervencionista (embolización) o cirugía con hemostasia directa.'},
        {'etiqueta': 'Después', 'texto': 'IBP a altas dosis, erradicar Helicobacter pylori y suspender AINE; reiniciar los antitrombóticos temprano (1 a 2 días) tras una hemostasia exitosa.'},
    ]}],
    banderas=[
        'Inestabilidad hemodinámica persistente o sangrado masivo: endoscopia urgente y, si falla, cirugía o embolización.',
        'En cirróticos: pensar en hemorragia variceal (vasoactivos desde el inicio) y evitar los IBP salvo lesión péptica confirmada.',
        'La recidiva temprana del sangrado es el principal factor de mortalidad.',
    ],
    fuente=FG('82', 'Hemorragia digestiva alta'),
)

# ---------------- hemorragia variceal (ficha nueva) ----------------
_var_alg = dict(titulo='Hemorragia variceal por hipertensión portal (Giménez 2025)', nodos=[
    I('Sospecha de hemorragia vinculada a hipertensión portal (cirrosis, estigmas de hepatopatía): reanimación con cuidado de no sobrecargar volumen'),
    A('Fármacos vasoactivos de inmediato: octreótido, somatostatina o terlipresina (2 a 5 días); evitar IBP salvo lesión péptica confirmada'),
    A('Endoscopia dentro de las 12 horas: ligadura con bandas elásticas de las várices esofágicas'),
    D('¿Son várices gástricas aisladas?',
      [A('Inyección endoscópica de cianoacrilato (a veces guiada por ecoendoscopia con coils)')],
      [A('Várices gastroesofágicas: ligadura del segmento esofágico')]),
    D('¿Hay sangrado refractario (hematemesis a las 2 horas, shock o caída de Hb de 3 g)?',
      [A('Rescate: balón de taponamiento (Sengstaken-Blakemore en esofágicas, Linton-Nachlas en gástricas) menos de 24 horas, o stent esofágico autoexpandible'),
       F('TIPS (derivación portosistémica intrahepática transyugular) o inyección angiográfica retrógrada si no se controla')],
      [F('Profilaxis secundaria: ligaduras cada 2 a 4 semanas hasta erradicar las várices, más betabloqueantes, y tratar la causa de la cirrosis')]),
])
_variceal = {
    'id': 'cx-hda-variceal', 'area': 'cirugia',
    'titulo': 'Hemorragia digestiva alta variceal (hipertensión portal)',
    'alias': ['hemorragia variceal', 'varices esofagicas', 'varices gastricas', 'hipertension portal', 'ligadura con bandas', 'octreotide', 'terlipresina', 'balon de sengstaken', 'tips'],
    'up': ['cx3'], 'unidad': 'UP3 · Disfagia y patología esofagogástrica', 'estado': 'verificar',
    'definicion': 'Sangrado por rotura de várices esofágicas o gástricas en el contexto de hipertensión portal. Tiene una evolución, una mortalidad y un enfoque terapéutico distintos a los de la hemorragia no variceal.',
    'diagnostico': [
        'Sospechar ante antecedentes de hepatopatía, estigmas de cirrosis, ictericia, ascitis o esplenomegalia.',
        'Las várices son la causa del sangrado cuando se ve una várice sangrando o con signos de sangrado reciente (coágulo fresco o de fibrina blanquecino), o cuando hay sangre fresca en el estómago y son la única lesión potencialmente sangrante.',
    ],
    'estudios': [
        'Endoscopia digestiva alta dentro de las 12 horas, con equipo entrenado y anestesiólogo; eritromicina 250 mg IV 20 a 90 minutos antes reduce la necesidad de repetirla (contraindicada si hay QT prolongado).',
        'Estable el paciente: TC o RM con contraste para evaluar la permeabilidad portal, descartar tumor hepático y ver colaterales.',
    ],
    'tratamiento': [{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Vasoactivos', 'texto': 'Octreótido: bolo de 50 µg y luego 50 µg/h; somatostatina: bolo de 250 µg y luego 250 a 500 µg/h; terlipresina: 2 mg IV cada 4 horas hasta controlar el sangrado o las 48 horas, luego 1 mg cada 4 horas. Duración de 2 a 5 días. Reducen el flujo esplácnico y la presión portal.'},
        {'etiqueta': 'IBP', 'texto': 'Evitarlos: en cirróticos se asocian a más peritonitis bacteriana espontánea, infección por C. difficile y mortalidad; solo si se confirma una lesión péptica.'},
        {'etiqueta': 'Endoscópico', 'texto': 'Ligadura con bandas elásticas (alta eficacia en el sangrado agudo) y sesiones sucesivas hasta erradicar. Várices gástricas aisladas: cianoacrilato.'},
        {'etiqueta': 'Rescate (10 a 20 % no responde)', 'texto': 'Balón de taponamiento transitorio (menos de 24 h, hemostasia en 60 a 90 %, riesgo de perforación y aspiración) o stent esofágico autoexpandible (hasta 2 semanas); luego TIPS con prótesis cubierta.'},
        {'etiqueta': 'Profilaxis secundaria', 'texto': 'Ligaduras cada 2 a 4 semanas hasta erradicar, betabloqueantes si no hay contraindicación y tratar la causa de la cirrosis (virus C o B, alcohol, autoinmune).'},
    ]}],
    'seguimiento': ['Imágenes con contraste para evaluar el sistema portal y detectar malignidad hepática una vez estabilizado el paciente.'],
    'banderas': [
        'Los vasoactivos se inician ante la sospecha, sin esperar la endoscopia.',
        'Sangrado refractario: hematemesis a las 2 horas, shock o caída de 3 g de Hb sin transfusión.',
        'No usar IBP de rutina en cirróticos con sangrado variceal.',
    ],
    'algoritmo': _var_alg,
    'fuente': FG('82', 'Hemorragia digestiva alta (hemorragia vinculada a hipertensión portal)'),
    'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.',
}

# ---------------- úlcera péptica complicada ----------------
_ulc = dict(
    algoritmo=dict(titulo='Complicaciones de la úlcera péptica (Giménez 2025)', nodos=[
        I('Paciente con úlcera péptica complicada (cerca del 70 % de las úlceras son asintomáticas hasta que se complican): estabilizar y definir la complicación'),
        D('¿Es una perforación (dolor brusco e intenso, irritación peritoneal, neumoperitoneo)?',
          [A('Antibióticos de amplio espectro, IBP y cirugía: sutura de la úlcera con parche de epiplón (Graham), de preferencia laparoscópica'),
           F('Sin vagotomía en general; resección gástrica parcial solo en casos especiales. Tratamiento no operatorio, excepcional')],
          [D('¿Es una hemorragia?',
             [A('Estabilizar, IBP y endoscopia como método inicial (ver la ficha de hemorragia digestiva alta)'),
              F('Si falla la endoscopia: cirugía (sutura hemostática con material no absorbible, con o sin vagotomía) o embolización transarterial')],
             [D('¿Hay obstrucción pilórica (vómitos posprandiales, saciedad temprana)?',
                [A('IBP a altas dosis y reposo digestivo; dilatación pilórica si persiste'),
                 F('Cirugía si hay persistencia o recurrencia: antrectomía o gastrectomía parcial, o gastroyeyunoanastomosis o piloroplastia, idealmente con vagotomía')],
                [F('Penetración a un órgano vecino: tratamiento según el órgano comprometido')])])]),
        A('Tras cualquier complicación: IBP prolongado, erradicación de Helicobacter pylori, suspender AINE y seguimiento endoscópico'),
    ]),
    diagnostico=[
        'Complicaciones: hemorragia (la más frecuente), perforación, obstrucción pilórica (síndrome de retención gástrica) y penetración. Alrededor del 70 % de los pacientes son asintomáticos: el debut puede ser una complicación (43 a 87 % de las úlceras sangrantes no tienen antecedentes de dispepsia).',
        'Perforación: dolor abdominal brusco de gran intensidad, difuso, a veces irradiado al dorso, con irritación peritoneal y pérdida de la matidez hepática; neumoperitoneo en radiografía o TC.',
        'Hemorragia: hematemesis o melena (rara vez hematoquecia) con cambios hemodinámicos según la magnitud. Retención gástrica: vómitos posprandiales, dolor, saciedad temprana, distensión, pérdida de peso en los casos prolongados (úlceras de antro o bulbo).',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Úlcera no complicada', 'texto': 'Inhibidores de la bomba de protones, suspensión de AINE y erradicación de Helicobacter pylori.'},
        {'etiqueta': 'Perforación', 'texto': 'Casi siempre quirúrgico, por laparoscopia de preferencia: sutura del defecto con parche de epiplón (parche de Graham). Indicación inequívoca con neumoperitoneo significativo o peritonitis y sepsis. Antibióticos de amplio espectro e IBP. En general no se hace vagotomía; resección gástrica parcial si hay compromiso significativo de la vitalidad. Fibrin glue solo, más reoperaciones que la sutura.'},
        {'etiqueta': 'Hemorragia', 'texto': 'Endoscopia como método inicial de diagnóstico y tratamiento. Si falla: cirugía (hemostasia directa con sutura no absorbible, con o sin vagotomía) o embolización transarterial (eficacia 52 a 98 %, resangrado 10 a 20 %, similar a la cirugía; limitada por disponibilidad). Tras la hemostasia, IBP a altas dosis; reiniciar los antitrombóticos a los 1 a 2 días y no suspender la aspirina en dosis bajas en pacientes de alto riesgo trombótico.'},
        {'etiqueta': 'Obstrucción pilórica', 'texto': 'Inicialmente médica: IBP a altas dosis y reposo digestivo; dilatación pilórica si persisten los síntomas. Cirugía por persistencia o recurrencia, con técnica resectiva (antrectomía o gastrectomía parcial) o no resectiva (gastroyeyunoanastomosis, piloroplastia), idealmente con vagotomía.'},
    ]}],
    seguimiento=['IBP por tiempo prolongado, erradicación de H. pylori, suspensión de AINE y seguimiento endoscópico; biopsias o control a las 8 semanas si la úlcera es gástrica.'],
    banderas=[
        'Perforación en paciente anciano o con shock: alta mortalidad; no demorar la cirugía.',
        'Úlcera gástrica: biopsiar para descartar cáncer.',
    ],
    fuente=FG('43', 'Complicaciones de la úlcera péptica'),
)

# ---------------- acalasia ----------------
_aca = dict(
    algoritmo=dict(titulo='Acalasia (Giménez 2025)', nodos=[
        I('Disfagia a sólidos y líquidos, regurgitación, pirosis que no responde a IBP: endoscopia digestiva alta (excluir cáncer) y esofagograma con bario'),
        A('Manometría esofágica de alta resolución: falta de relajación del esfínter esofágico inferior más aperistalsis; confirma el diagnóstico'),
        D('¿Es candidato a cirugía (riesgo aceptable)?',
          [A('Tratar la candidiasis esofágica si existe, antes de operar'),
           A('Miotomía de Heller (esófago ≥ 6 cm, estómago ≥ 3 cm) con fundoplicatura parcial (Dor 180° anterior o Toupet 270° posterior), por laparoscopia o robótica'),
           D('¿Megaesófago tortuoso con fracaso de la miotomía?',
             [F('Esofagectomía (transhiatal o tres campos) en pacientes en buen estado')],
             [F('Sin seguimiento programado; si recurren los síntomas, repetir esofagograma, endoscopia y manometría')])],
          [A('Dilatación neumática o toxina botulínica (poco duraderas); POEM en centros especializados; fármacos (calcioantagonistas, nitratos, sildenafilo) solo si no toleran más'),
           F('Gastrostomía percutánea como acceso nutricional si no hay otra opción')]),
    ]),
    fisiopatologia=[
        'La acalasia primaria es la pérdida selectiva de las neuronas inhibitorias del plexo mientérico: el esfínter esofágico inferior (EEI) no se relaja con la deglución y el cuerpo esofágico queda aperistáltico.',
        'Para el diagnóstico deben estar presentes los dos criterios: falla de relajación del EEI y ausencia de peristalsis efectiva. La motilidad esofágica ineficaz y el esófago en cascanueces no cumplen los criterios porque el EEI funciona.',
        'Causas secundarias de trastornos motores similares: esclerodermia, amiloidosis, enfermedad de Chagas, sarcoidosis, esofagitis eosinofílica, neoplasia endocrina múltiple 2B; se maneja la enfermedad de base.',
    ],
    diagnostico=[
        'Disfagia a sólidos y líquidos (la mayoría), pirosis (75 %), regurgitación (45 %), dolor torácico no cardíaco, tos y aspiración crónica; pérdida de peso. El paciente come despacio y adopta maniobras (elevar el cuello, echar los hombros atrás) para vaciar el esófago.',
        'Sospecharla en reflujo que no responde a inhibidores de la bomba de protones. Signos de malignidad a descartar: síntomas de menos de 6 meses, disfagia nueva en mayores de 60 años y pérdida de peso rápida.',
        'Esofagograma: "pico de pájaro" y, en la acalasia avanzada, megaesófago (esófago sigmoide, diámetro mayor de 6 cm); la radiografía de tórax puede mostrar ensanchamiento mediastínico y ausencia de la burbuja gástrica.',
        'Endoscopia: descarta cáncer, hernia hiatal, anillos o divertículos; permite ver el EEI con resistencia al paso del endoscopio y esofagitis por Candida. La manometría de alta resolución es necesaria para el diagnóstico.',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Objetivo', 'texto': 'Eliminar la obstrucción esofágica y, a la vez, mantener una barrera contra el reflujo.'},
        {'etiqueta': 'Cirugía (estándar)', 'texto': 'Miotomía de Heller con fundoplicatura parcial: miotomía de al menos 6 cm en el esófago y 3 cm en el estómago, con más del 90 % de alivio de la disfagia a más de 2 años. Se prefiere la fundoplicatura de Dor (180°, anterior) por ser más rápida; resultados similares a Toupet (270°, posterior). Vía laparoscópica o robótica.'},
        {'etiqueta': 'Endoscópico', 'texto': 'Dilatación neumática con balón y toxina botulínica: poco eficaces a largo plazo, para pacientes de alto riesgo. POEM (miotomía endoscópica peroral): muy eficaz a corto plazo, solo en centros especializados y sin mecanismo antirreflujo.'},
        {'etiqueta': 'Farmacológico', 'texto': 'Calcioantagonistas, nitratos o sildenafilo: resultados pobres; solo para quienes no pueden o no quieren otro tratamiento.'},
        {'etiqueta': 'Casos extremos', 'texto': 'Megaesófago con fracaso de la miotomía: esofagectomía en pacientes en buen estado. No candidatos a cirugía ni respondedores: gastrostomía percutánea paliativa.'},
    ]}],
    seguimiento=['Tras la cirugía no requiere seguimiento programado; si recurren los síntomas, repetir esofagograma, endoscopia y manometría para entender la causa y considerar la reintervención.'],
    banderas=[
        'Tratar la candidiasis esofágica (frecuente) antes de operar.',
        'Reflujo que no responde a IBP en un paciente con disfagia: pensar en acalasia.',
        'Disfagia reciente en mayor de 60 años con pérdida de peso: descartar cáncer antes de rotular acalasia.',
    ],
    fuente=FG('36', 'Acalasia y otros trastornos motores del esófago'),
)

# ---------------- ERGE y Barrett ----------------
_erge = dict(
    algoritmo=dict(titulo='Enfermedad por reflujo gastroesofágico (Giménez 2025)', nodos=[
        I('Pirosis y regurgitación, o síntomas respiratorios sospechosos de reflujo: medidas higiénico-dietéticas (cabecera elevada, evitar grasas e ingestas copiosas antes de acostarse, bajar de peso) e IBP'),
        D('¿Responde bien al tratamiento médico, sin hernia ni complicaciones?',
          [F('Continuar el tratamiento médico (se recomienda sobre todo en el adulto mayor con poco daño esofágico); el IBP controla la calidad del reflujo, no lo elimina')],
          [A('Estudio en profundidad: endoscopia (clasificación de Los Ángeles A a D, biopsias), seriada esofagogastroduodenal, manometría y pHmetría de 24 horas (tiempo de exposición ácida > 6 % es patológico; suspender los IBP 7 días antes)'),
           D('¿Es candidato a cirugía antirreflujo? (alternativa al IBP crónico, hernia hiatal o EEI hipotensivo, síntomas respiratorios atribuibles al reflujo, Barrett, estenosis péptica)',
             [A('Fundoplicatura de Nissen por laparoscopia: controla el reflujo y sus complicaciones a largo plazo; no es contraindicación una baja amplitud de contracción esofágica')],
             [F('Mantener el tratamiento médico y controlar')])]),
        D('¿Hay esófago de Barrett?',
          [A('Endoscopia con biopsias de los 4 cuadrantes cada 2 cm; vigilancia endoscópica de por vida aun tras una cirugía exitosa'),
           D('¿Displasia de alto grado?',
             [F('Resección endoscópica de lesiones elevadas y ablación (radiofrecuencia o crioterapia); la esofagectomía quedó para situaciones especiales')],
             [F('Sin displasia o displasia leve: IBP o cirugía antirreflujo y vigilancia')])],
          [F('Controlar según la evolución clínica')]),
    ]),
    fisiopatologia=[
        'El reflujo depende de la función del esfínter esofágico inferior y de la anatomía de la unión (hernia hiatal); no hay paralelismo entre la magnitud del reflujo, los síntomas y el daño esofágico. La mayoría de los pacientes no tiene alteraciones de la mucosa.',
        'Complicaciones: esofagitis, estenosis péptica (fibrosis con disfagia; el diagnóstico diferencial es el cáncer) y esófago de Barrett (epitelio cilíndrico con metaplasia intestinal; puede tener displasia de bajo o alto grado, precursora del adenocarcinoma).',
    ],
    diagnostico=[
        'Síntomas esofágicos (pirosis, regurgitación, disfagia) y extraesofágicos, sobre todo respiratorios (tos crónica, laringitis, asma) por microaspiración. La pHmetría de 24 horas es el estándar para diagnosticar y cuantificar el reflujo; el tiempo de exposición ácida mayor de 6 % es patológico.',
        'Esofagitis según Los Ángeles: A (lesiones de 5 mm o menos), B (más de 5 mm), C (se extienden entre pliegues, menos del 75 % de la circunferencia) y D (75 % o más).',
        'Esófago de Barrett: biopsias de los 4 cuadrantes cada 2 cm para mapear la displasia. Seriada esofagogastroduodenal y manometría (necesaria para localizar el EEI antes de la pHmetría) completan el estudio.',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Médico', 'texto': 'Medidas higiénico-dietéticas e IBP. Indicado sobre todo en adultos mayores, con poco daño esofágico y síntomas fáciles de manejar.'},
        {'etiqueta': 'Quirúrgico', 'texto': 'Fundoplicatura de Nissen laparoscópica: la que mejor controla el reflujo a largo plazo. Indicada ante la elección del paciente (sobre todo jóvenes), hernia hiatal o EEI hipotensivo, síntomas respiratorios relacionados con el reflujo, Barrett o estenosis péptica (descartar cáncer y dilatar antes a 40 a 60 French).'},
        {'etiqueta': 'Conceptos a desterrar', 'texto': 'El fracaso del tratamiento médico no es por sí solo indicación de cirugía (los que no responden se estudian a fondo; responden mejor los que sí mejoran con IBP y tienen pHmetría patológica). La baja motilidad esofágica no contraindica el Nissen; si aparece disfagia, buscar un error técnico.'},
        {'etiqueta': 'Barrett', 'texto': 'La cirugía antirreflujo solo en Barrett sin displasia o con displasia leve; displasia de alto grado: resección endoscópica y ablación.'},
    ]}],
    seguimiento=['El control endoscópico del Barrett es de por vida, aun con cirugía efectiva: no se sabe cuándo comenzará la secuencia displasia-cáncer.'],
    banderas=[
        'Disfagia y pérdida de peso en reflujo crónico: estenosis péptica vs cáncer; biopsiar.',
        'Barrett con displasia de alto grado: tratamiento endoscópico, no cirugía antirreflujo.',
    ],
    fuente=FG('37', 'Hernia hiatal y enfermedad por reflujo gastroesofágico'),
)

# ---------------- hernia hiatal ----------------
_hh = dict(
    algoritmo=dict(titulo='Hernia hiatal (Giménez 2025)', nodos=[
        I('Hallazgo de hernia hiatal (suele ser incidental en estudios por reflujo): clasificar en tipo I (deslizamiento, 95 %), II (paraesofágica pura), III (mixta) o IV (con otros órganos)'),
        D('¿Hay síntomas que alteran la calidad de vida o complicaciones (reflujo grave, vólvulo, isquemia, obstrucción, anemia por sangrado)?',
          [A('Reparación laparoscópica: reducir el contenido, movilizar el saco, cerrar el defecto (con o sin malla) y asociar una técnica antirreflujo'),
           F('Control de síntomas en 90 a 100 %; recidiva radiográfica en 40 a 50 %, casi siempre sin síntomas ni reoperación')],
          [F('No operar las hernias hiatales asintomáticas, sea cual sea el tipo; tratamiento médico del reflujo si lo hay')]),
    ]),
    diagnostico=[
        'Cuatro tipos: I por deslizamiento (95 %, reflujo típico), II paraesofágica pura (el cardias conserva su posición; disfagia, dolor o anemia por sangrado oculto), III mixta y IV (otros órganos en el saco). Los tipos II a IV son paraesofágicos: riesgo de isquemia, obstrucción o vólvulo.',
        'Tres síndromes: digestivo (dolor, eructos, pirosis, regurgitación, disfagia), respiratorio (disnea, hipo, tos, asma del adulto) y cardiovascular (seudoangina, arritmias). Puede presentarse como abdomen agudo por vólvulo gástrico con necrosis.',
        'Vólvulo organoaxial si se desplaza el fundus (obstrucción, isquemia, hemorragia y perforación); mesentérico-axial si se hernia el cuerpo (obstrucción y dolor).',
        'Se descubre en general de forma incidental: radiografía (imagen hidroaérea retrocardíaca), seriada esofagogastroduodenal, endoscopia y TC (en hernias grandes, también para valorar el riesgo respiratorio).',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Indicación', 'texto': 'Solo la cirugía resuelve la alteración anatómica. Se indica por la magnitud de los síntomas y, sobre todo, por las complicaciones; las asintomáticas no se operan.'},
        {'etiqueta': 'Táctica', 'texto': 'Reducción del contenido, movilización del saco, cierre del defecto con o sin malla y técnica antirreflujo.'},
        {'etiqueta': 'Vía', 'texto': 'Se prefiere la laparoscópica (menor morbilidad, dolor e internación); conversión o abordaje torácico en casos raros con contaminación torácica.'},
    ]}],
    banderas=[
        'Dolor intenso con vómitos sin poder vomitar y no pasaje de sonda: vólvulo gástrico, urgencia.',
        'Hernia paraesofágica sintomática: riesgo de complicaciones; derivar a cirugía.',
    ],
    fuente=FG('37', 'Hernia hiatal y enfermedad por reflujo gastroesofágico'),
)

# ---------------- divertículo de Zenker ----------------
_zen = dict(
    algoritmo=dict(titulo='Divertículos esofágicos (Giménez 2025)', nodos=[
        I('Disfagia, regurgitación de alimentos no digeridos o neumonías aspirativas: seriada esofagogastroduodenal con videodeglución y endoscopia digestiva alta'),
        D('¿El divertículo es faringoesofágico (Zenker, en el triángulo de Killian)?',
          [A('Tratamiento quirúrgico (el síntoma mejora sobre todo con la miotomía del cricofaríngeo): endoscópico o convencional'),
           F('Z-POEM es el tratamiento preferido en los centros de referencia; la miotomía del esfínter esofágico superior es la clave')],
          [D('¿Es un divertículo epifrénico (tercio inferior, sobre el cardias)?',
             [A('Manometría de alta resolución si está disponible (asociación con trastorno motor) y endoscopia'),
              F('Cirugía laparoscópica con miotomía o D-POEM (resultados promisorios, aún sin bibliografía que lo consolide como referencia)')],
             [F('Divertículos por tracción (mediastino): rara vez requieren tratamiento')])]),
    ]),
    diagnostico=[
        'El divertículo de Zenker se forma en el triángulo de Killian (entre el cricofaríngeo y los constrictores de la faringe); la fisiopatología más aceptada es la relajación inadecuada del esfínter esofágico superior. Es más frecuente en la 7.ª y 8.ª década.',
        'Disfagia en el 80 a 90 %; regurgitación y aspiración de restos con neumonías graves. Se asocia hasta en el 50 % con hernia hiatal y reflujo.',
        'Los divertículos esofágicos son infrecuentes (menos del 1 % de la población; 1 a 3 % de los que consultan por disfagia). Por pulsión (aumento de presión luminal) o por tracción (fuerza externa desde el mediastino); verdaderos (todas las capas) o falsos (mucosa y submucosa).',
    ],
    tratamiento=[{'titulo': 'Tratamiento', 'pasos': [
        {'etiqueta': 'Zenker', 'texto': 'Quirúrgico: convencional o mínimamente invasivo endoscópico; Z-POEM es el tratamiento de referencia en los principales centros. La miotomía alivia los síntomas.'},
        {'etiqueta': 'Epifrénico', 'texto': 'Quirúrgico (laparoscópico o endoscópico). La resección del divertículo tiene complicaciones del 14 al 50 % (fístula), por lo que en centros de referencia se evita y se hace miotomía; D-POEM con éxito superior al 90 % en series, aún sin consolidar.'},
    ]}],
    fuente=FG('38', 'Divertículos del esófago'),
)

# ---------------- cáncer de esófago ----------------
_cae = dict(
    algoritmo=dict(titulo='Cáncer de esófago (Giménez 2025)', nodos=[
        I('Disfagia orgánica progresiva y pérdida de peso: endoscopia con biopsia (escamoso o adenocarcinoma); valoración nutricional desde el inicio'),
        A('Estadificación (TNM, AJCC-UICC 8.ª): TC; ecoendoscopia para T y N en casos incipientes; PET/TC para descartar enfermedad sistémica (M)'),
        D('¿Tumor temprano favorable (sin afectación ganglionar)?',
          [F('Resección o ablación endoscópica: mucosectomía en tumores limitados a la mucosa y menores de 15 a 20 mm; disección submucosa para lesiones mayores en una sola pieza')],
          [D('¿Es localmente avanzado (sin enfermedad a distancia)?',
             [A('Control local y sistémico previo y luego resección quirúrgica (tratamiento multimodal); esófago cervical: quimiorradioterapia, en general sin cirugía'),
              A('Tercio superior y medio: esofagectomía total con anastomosis cervical; tercio inferior: subtotal con anastomosis intratorácica o abordaje transhiatal; unión esofagogástrica según su extensión'),
              F('En pacientes de muy alto riesgo: tratamiento endoscópico o paliativo de bajo impacto')],
             [F('Enfermedad diseminada: tratamiento sistémico desde el inicio y paliación (dilatación, stent, soporte nutricional); la resección de rescate es poco probable')])]),
    ]),
    diagnostico=[
        'Disfagia orgánica (progresiva y sostenida, primero a sólidos) y pérdida de peso; menos frecuentes odinofagia, hemorragia, tos, dolor torácico y regurgitación. Hay algún grado de desnutrición casi siempre.',
        'Los dos tipos más frecuentes son el carcinoma de células escamosas y el adenocarcinoma, con distinta ubicación, comportamiento y factores de riesgo; el adenocarcinoma se asocia al reflujo y al esófago de Barrett (de ahí la vigilancia endoscópica).',
        'Diagnóstico por biopsia endoscópica; diferenciar de trastornos motores, estenosis péptica y úlcera esofágica. TNM (8.ª ed.): T1a lámina propia o muscular de la mucosa, T1b submucosa, T2 muscular propia, T3 adventicia, T4a pleura, pericardio, diafragma o peritoneo, T4b estructuras irresecables; N1 de 1 a 2 ganglios, N2 de 3 a 6, N3 de 7 o más.',
    ],
    estudios=[
        'TC para determinar el avance; ecoendoscopia (más sensible para T y N en casos incipientes); PET/TC para descartar enfermedad a distancia en casos avanzados.',
        'Evaluar riesgo respiratorio, nutricional y funcional del paciente antes de elegir el tratamiento.',
    ],
    tratamiento=[{'titulo': 'Estrategia terapéutica', 'pasos': [
        {'etiqueta': 'Por avance', 'texto': 'Local: resección endoscópica o quirúrgica. Localmente avanzado: cirugía previo control local y sistémico (multimodal). Diseminado: tratamiento sistémico desde el inicio.'},
        {'etiqueta': 'Por ubicación', 'texto': 'Cervical: quimiorradioterapia (la cirugía implica laringe, morbilidad alta). Torácico superior y medio: esofagectomía total con anastomosis cervical y abordaje transtorácico. Inferior: subtotal con anastomosis intratorácica, o transhiatal y cervical. Unión esofagogástrica: como tumor distal del esófago si crece hacia arriba, y como gástrico si se extiende al estómago.'},
        {'etiqueta': 'Por riesgo', 'texto': 'Alto riesgo, añosos o con grandes limitaciones: tratamiento endoscópico o paliativo. Bajo riesgo: cualquier tratamiento. Intermedio: evaluar y compensar el estado nutricional y respiratorio.'},
    ]}],
    banderas=[
        'El pronóstico global es malo, pero en enfermedad localizada resecable la sobrevida supera el 50 % a 5 años.',
        'Esófago de Barrett: vigilancia endoscópica regular; el adenocarcinoma se detecta cada vez más temprano.',
        'Desnutrición: requiere soporte nutricional desde el inicio.',
    ],
    fuente=FG('39', 'Cáncer de esófago'),
)

# ---------------- cáncer gástrico ----------------
_cag = dict(
    algoritmo=dict(titulo='Cáncer gástrico (Giménez 2025)', nodos=[
        I('Dispepsia de alarma, anemia o síntomas constitucionales: endoscopia con biopsias; estadificar con TC de tórax, abdomen y pelvis y ecoendoscopia; comité multidisciplinario; HER2 y reparación del ADN (MMR/IMS)'),
        D('¿Es un cáncer temprano (no pasa la submucosa) con riesgo mínimo de metástasis ganglionar?',
          [A('Resección endoscópica (mucosectomía o disección submucosa): criterios estándar T1a, diferenciado, menor de 2 cm y no ulcerado; criterios extendidos a criterio del grupo'),
           F('Pieza sin invasión linfovascular y con márgenes libres; si no los cumple, cirugía')],
          [D('¿Es resecable (T1 N+ o T2 a T4 sin enfermedad a distancia)?',
             [A('Cirugía radical con márgenes R0 y linfadenectomía adecuada (gastrectomía estándar de al menos 2/3), más quimioterapia perioperatoria o adyuvante'),
              A('Gastrectomía total (tumor de cuerpo o parte superior) con Y de Roux; subtotal (antro, prepilórico) con Y de Roux o Billroth II; margen de 3 cm libre (5 cm en patrón infiltrativo difuso)'),
              F('Seguimiento oncológico y control nutricional')],
             [F('Enfermedad a distancia o irresecable: tratamiento sistémico y paliación quirúrgica u oncológica')])]),
    ]),
    diagnostico=[
        'Temprano si no invade más allá de la submucosa; avanzado si pasa la muscular propia. Macroscópicamente: tipos I a III en el temprano y Borrmann I a IV en el avanzado (I polipoide, II ulcerado de bordes elevados, III ulcerado infiltrante, IV infiltrativo con engrosamiento de pared).',
        'Histología: Laurén (intestinal, difuso, indeterminado), Nakamura (diferenciado o indiferenciado, clave para elegir la resección endoscópica) y OMS (tubular, papilar, pobremente cohesivo con células en anillo de sello, mucinoso y mixto). Subtipos moleculares con valor clínico: EBV positivo e inestabilidad microsatelital; se testean HER2 y la deficiencia de reparación del ADN.',
        'Sin programas de pesquisa en el país, suele diagnosticarse con síntomas y en estadio avanzado. Estadificación AJCC (T, N, M) en comité multidisciplinario.',
    ],
    estudios=[
        'Endoscopia: localiza el tumor, define el tipo macroscópico (T) y toma biopsias. TC de tórax, abdomen y pelvis: T, N (sensibilidad ganglionar de 62,5 a 91,9 %) y M (hígado, pulmón; peritoneo en menor medida). Ecoendoscopia: más sensible que la TC para el T y útil para diferenciar lesiones tempranas.',
    ],
    tratamiento=[{'titulo': 'Tratamiento (multimodal)', 'pasos': [
        {'etiqueta': 'Temprano', 'texto': 'Resección endoscópica (mucosectomía o disección submucosa) en tumores con riesgo nulo o muy bajo de metástasis ganglionares: T1a, bien diferenciados, menores de 2 cm y no ulcerados. Criterios extendidos con 5 a 15 % de riesgo ganglionar: a criterio del grupo. La pieza debe estar libre de invasión linfovascular y de márgenes comprometidos.'},
        {'etiqueta': 'Avanzado resecable', 'texto': 'Cirugía radical R0 con linfadenectomía adecuada más quimioterapia perioperatoria (o solo adyuvante). Gastrectomía estándar: al menos 2/3 del estómago con linfadenectomía adecuada; extendida si se reseca otro órgano.'},
        {'etiqueta': 'Tipos', 'texto': 'Total (cuerpo o parte superior; reconstrucción en Y de Roux), subtotal (antro, prepilórico; Y de Roux, Billroth II u omega) y proximal o con preservación pilórica en T1N0 sin criterio endoscópico. Billroth I se hace poco en Occidente.'},
        {'etiqueta': 'Reconstrucción', 'texto': 'Y de Roux: evita reflujo biliopancreático y gastritis alcalina, a costa de menor capacidad y más dumping. Billroth II: más capacidad y menos dumping, pero más reflujo biliar. Margen libre de 3 cm (5 cm en infiltrativo difuso).'},
    ]}],
    banderas=[
        'Dispepsia con síntomas de alarma o anemia en mayor de 50 años: endoscopia.',
        'El cáncer gástrico se diagnostica en general avanzado: pensar en él ante saciedad temprana, pérdida de peso o hemorragia.',
    ],
    fuente=FG('42', 'Cáncer gástrico'),
)

# ---------------- tumores gástricos benignos y GIST ----------------
_gist = dict(
    algoritmo=dict(titulo='Tumores gástricos infrecuentes (Giménez 2025)', nodos=[
        I('Lesión subepitelial o tumoración gástrica: endoscopia, ecoendoscopia con punción, TC e inmunohistoquímica (CD117/c-KIT)'),
        D('¿Es un GIST (tumor del estroma gastrointestinal)?',
          [A('Potencialmente maligno: el riesgo de metástasis aumenta con el tamaño y la localización (no solo con el índice mitótico); incluso los GIST pequeños pueden dar metástasis'),
           F('La cirugía es el pilar del tratamiento, con recurrencia en al menos la mitad de los casos operados')],
          [D('¿Es un linfoma gástrico (MALT de bajo grado o difuso agresivo)?',
             [F('Tratamiento según el tipo histológico y el estadio; asociación del MALT con la gastritis crónica por Helicobacter pylori y opciones conservadoras en los últimos años')],
             [D('¿Es un tumor neuroendocrino gástrico (TGNE)?',
                [A('Tipo I y pequeños (< 20 mm): resección endoscópica o seguimiento; tipo II: resección quirúrgica y del gastrinoma asociado si es posible'),
                 F('Tipo III: tratar como adenocarcinoma (gastrectomía con linfadenectomía y quimioterapia); seguimiento endoscópico cada 3 a 12 meses según el tipo y el tamaño')],
                [F('Pólipos y tumores benignos (leiomiomas, lipomas, schwannomas): resección según tamaño y síntomas')])])]),
    ]),
    fuente=FG('41', 'Tumores gástricos infrecuentes', 'Los pólipos y tumores benignos se mantienen del manual de la Universidad de Chile (2020).'),
)

CONTENIDO = {
    'cx-disfagia': _dis,
    'cx-hemorragia-digestiva-alta': _hda,
    'cx-ulcera-peptica-complicada': _ulc,
    'cx-acalasia': _aca,
    'cx-erge-barrett': _erge,
    'cx-hernia-hiatal': _hh,
    'cx-diverticulo-zenker': _zen,
    'cx-cancer-esofago': _cae,
    'cx-cancer-gastrico': _cag,
    'cx-tumores-gastricos-benignos-gist': _gist,
}
NUEVAS = [_variceal]
