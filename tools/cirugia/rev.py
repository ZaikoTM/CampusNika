# -*- coding: utf-8 -*-
"""Revisión sobre Giménez 2.ª ed. (2025) con los algoritmos y cuadros de los capítulos (figuras 16-1, 23-1, 51-5, 53-5, 58-7 a 58-9, 59-5, 59-9 y 83-4, cuadro 53-2) y fichas nuevas de los temas que faltaban."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}
REV = 'Revisión sobre los algoritmos del libro.'

# ---------------- isquemia arterial aguda (fig. 16-1) ----------------
CONTENIDO['cx-isquemia-arterial-aguda'] = dict(
    algoritmo=dict(titulo='Isquemia arterial aguda: algoritmo de la fig. 16-1 (Giménez 2025)', nodos=[
        I('Sospecha clínica de isquemia arterial aguda: comunicarse por teléfono con cirugía vascular para la evaluación'),
        A('En paralelo: solicitar eco-Doppler arterial y angiotomografía de miembros inferiores y eje aortoilíaco, e instalar las medidas preoperatorias (heparina no fraccionada, analgesia, protección del miembro)'),
        A('Evaluación por cirugía vascular para definir la viabilidad del miembro'),
        D('¿El miembro es viable?',
          [A('Anticoagulación y arteriografía dentro de las primeras 24 horas'),
           F('Definir la mejor opción terapéutica: abierta (embolectomía con Fogarty, bypass), endovascular (trombólisis farmacomecánica, angioplastia, stent) o híbrida')],
          [D('¿La viabilidad está amenazada?',
             [F('Intervención híbrida en la sala de hemodinamia, de inmediato (emergencia vascular)')],
             [F('Miembro no viable: amputación primaria dentro de las primeras 24 horas')])]),
        A('Todo paciente revascularizado pasa el posoperatorio en cuidados intensivos por el posible síndrome de revascularización'),
    ]),
    fuente=FG('16', 'Isquemia arterial aguda de los miembros', 'Algoritmo de la fig. 16-1. Reperfusión y conducta inmediata según el manual de la Universidad de Chile (2020).'),
)

# ---------------- nódulo tiroideo (fig. 23-1) ----------------
CONTENIDO['cx-nodulo-tiroideo'] = dict(
    algoritmo=dict(titulo='Nódulo tiroideo: algoritmo de la fig. 23-1 (Giménez 2025)', nodos=[
        I('Nódulo tiroideo: dosaje de TSH y ecografía'),
        D('¿La TSH está baja?',
          [A('Centellograma tiroideo con T3 y T4'),
           D('¿Es un nódulo caliente (hiperfuncionante)?',
             [F('No punzar: tratamiento del hipertiroidismo (los nódulos calientes tienen bajo riesgo de malignidad)')],
             [A('Nódulo frío: evaluar el criterio ecográfico para punción')])],
          [A('TSH normal o elevada: evaluar el criterio ecográfico para PAAF')]),
        D('¿Tiene criterio ecográfico para PAAF (microcalcificaciones, hipoecogenicidad, márgenes irregulares, vascularización intranodal, forma alta, extensión extratiroidea)?',
          [A('PAAF (de preferencia bajo ecografía), informada por Bethesda (6 categorías); punzar también los ganglios sospechosos'),
           D('¿Es benigno (Bethesda II)?',
             [F('Seguimiento ecográfico cada 1 a 2 años; cirugía si hay síntomas compresivos, crecimiento o estética')],
             [F('Indeterminado (III o IV): estudios moleculares o hemitiroidectomía diagnóstica; sospechoso o maligno (V o VI): cirugía (ver cáncer diferenciado de tiroides)')])],
          [F('Control ecográfico')]),
        A('Laringoscopia en todo candidato a cirugía (motilidad de las cuerdas vocales) y calcitonina antes de operar'),
    ]),
    fuente=FG('23', 'Nódulo y cáncer tiroideos', 'Algoritmo de la fig. 23-1.'),
)

# ---------------- litiasis y colecistitis (fig. 53-5 y cuadro 53-2) ----------------
_lit53_sint = [
    D('¿Es un cólico biliar?',
      [F('Colecistectomía laparoscópica electiva')],
      [D('¿Es una colecistitis aguda?',
         [A('Medidas de soporte general y antibioticoterapia; gravedad según las guías de Tokio 2018'),
          D('¿Es leve?',
            [F('Colecistectomía laparoscópica temprana')],
            [D('¿Es moderada?',
               [A('Tratamiento de soporte; si falla, colecistostomía percutánea'),
                F('Colecistectomía laparoscópica en centros de experiencia y en casos no muy comprometidos')],
               [F('Grave: colecistostomía percutánea (o colecistectomía en centros de experiencia y casos no muy comprometidos)')])])],
         [A('Sospecha de litiasis coledociana: colangiorresonancia'),
          F('Cirugía laparoscópica en un tiempo o en dos tiempos (CRE y luego colecistectomía laparoscópica)')])])]
CONTENIDO['cx-litiasis-biliar-colico'] = dict(
    algoritmo=dict(titulo='Litiasis vesicular: algoritmo de la fig. 53-5 (Giménez 2025)', nodos=[
        I('Litiasis vesicular: ¿es sintomática?'),
        D('¿Es sintomática?', _lit53_sint,
          [F('Seguimiento: solo operar en casos especiales')]),
    ]),
    banderas=[
        'La complicación más grave de la colecistectomía es la lesión quirúrgica de la vía biliar (0,4 a 0,6 % de las laparoscópicas).',
        'Para prevenirla (Consenso Delphi): retracción eficaz de la vesícula y contratracción para desarrollar el triángulo de Calot, crear la visión crítica de seguridad y controlar la hemorragia con compresión, sin exceso de electrocoagulación o clips.',
        'Cuándo parar: fibrosis grave en el triángulo de Calot o cálculo impactado en la confluencia (síndrome de Mirizzi). Alternativas de rescate: colecistectomía subtotal o colecistostomía retirando toda la litiasis.',
    ],
    fuente=FG('53', 'Litiasis vesicular y colecistitis aguda', 'Algoritmo de la fig. 53-5 y cuadro 53-2.'),
)
CONTENIDO['cx-colecistitis-aguda'] = dict(
    algoritmo=dict(titulo='Colecistitis aguda: algoritmo de la fig. 53-5 (Giménez 2025)', nodos=[
        I('Colecistitis aguda: medidas de soporte general y antibioticoterapia; clasificar la gravedad según las guías de Tokio 2018'),
        D('¿Es leve?',
          [F('Colecistectomía laparoscópica temprana')],
          [D('¿Es moderada (leucocitos > 18.000, masa palpable, más de 72 horas o inflamación local marcada)?',
             [A('Tratamiento de soporte; si falla, colecistostomía percutánea'),
              F('Colecistectomía laparoscópica en centros de experiencia y en casos no muy comprometidos')],
             [F('Grave (grado III, con disfunción de órganos): colecistostomía percutánea, o colecistectomía solo en centros de experiencia y casos no muy comprometidos; colecistectomía diferida con el paciente estable')])]),
        A('Con sospecha de litiasis coledociana: colangiorresonancia y cirugía en un tiempo laparoscópica o en dos tiempos (CRE más colecistectomía laparoscópica)'),
    ]),
    fuente=FG('53', 'Litiasis vesicular y colecistitis aguda', 'Algoritmo de la fig. 53-5; antibióticos del manual de la Universidad de Chile (2020).'),
)

# ---------------- pancreatitis (figs. 59-5 y 59-9) ----------------
CONTENIDO['cx-pancreatitis-aguda'] = dict(
    algoritmo=dict(titulo='Pancreatitis aguda: figs. 59-5 y 59-9 (Giménez 2025 y guía argentina)', nodos=[
        I('Sospecha de pancreatitis aguda: anamnesis, examen, laboratorio (amilasa, lipasa; hemograma, glucemia, función renal, hepatograma, LDH, ionograma, gasometría) y radiografía de tórax y abdomen; ecografía abdominal como primer estudio por imágenes'),
        D('¿Cumple ambos criterios (hiperamilasemia y dolor abdominal) y no tiene clínica atípica?',
          [A('Diagnóstico de pancreatitis aguda')],
          [D('¿Hay una imagen compatible (ecografía o TC) más hiperamilasemia o dolor abdominal?',
             [A('Diagnóstico de pancreatitis aguda')],
             [F('Pancreatitis aguda poco probable: buscar otro diagnóstico')])]),
        A('Hidratación no agresiva con Ringer lactato titulada a la diuresis (0,5 a 1 mL/kg/h); analgesia intravenosa multimodal; sin profilaxis antibiótica'),
        D('¿Es una pancreatitis grave (fallo de órganos)?',
          [A('Unidad de cuidados intensivos; alimentación oral o enteral escalonada entre el 3.º y el 7.º día, enteral antes que parenteral'),
           D('¿Hay contraindicación de la alimentación enteral?',
             [D('¿Hay malnutrición severa?', [A('Iniciar nutrición parenteral')], [A('Esperar 3 a 5 días para evaluar la tolerancia; si la alimentación enteral no es factible, parenteral')])],
             [A('Iniciar la alimentación enteral y aumentar la ingesta hasta los objetivos en 3 a 5 días; si no alcanza el 60 % de las necesidades, suplementar con parenteral')]),
           A('No tratar la litiasis en la fase aguda de la grave: colecistectomía diferida hasta resolver las colecciones')],
          [A('Alimentación oral precoz según tolerancia; colecistectomía en la misma internación si es biliar y leve')]),
        D('¿Hay necrosis infectada o colecciones sintomáticas?',
          [F('Antibióticos intravenosos en ciclos cortos (5 a 10 días) y drenaje percutáneo o endoscópico; necrosectomía mínimamente invasiva y lo más tarde posible solo si hace falta (abordaje escalonado: PANTER, POINTER)')],
          [F('Control clínico y por imágenes; CPRE solo con colangitis u obstrucción biliar persistente')]),
    ]),
    fuente=FC('59', 'Pancreatitis aguda (algoritmos de las figs. 59-5 y 59-9)'),
)

# ---------------- hemorragia digestiva baja (fig. 83-4) ----------------
CONTENIDO['cx-hemorragia-digestiva-baja'] = dict(
    algoritmo=dict(titulo='Hemorragia digestiva baja: algoritmo de la fig. 83-4 (Giménez 2025)', nodos=[
        I('Evaluación clínica, signos vitales y laboratorio (hemograma, función renal, albúmina, tiempo de protrombina, grupo y factor, ácido-base con lactato, LDH, eritrosedimentación y PCR); examen proctológico para descartar causas perianales'),
        D('¿Es de alto riesgo (inestabilidad hemodinámica, sangrado activo, comorbilidades graves)?',
          [A('Reanimación con líquidos y transfusión si está indicada; excluir hemorragia digestiva alta; manejo en unidad cerrada'),
           D('¿Hay hemorragia digestiva alta diagnosticada por videoendoscopia?',
             [F('Manejo de la hemorragia digestiva alta')],
             [D('¿El paciente está inestable y no tolera la preparación colónica?',
                [F('Angiografía (considerar angio-TC para localizar el sangrado) y evaluar cirugía; videocolonoscopia electiva luego de tratado el sangrado')],
                [A('Videocolonoscopia en menos de 24 horas luego de la reanimación, con preparación de 4 a 6 L de polietilenglicol'),
                 F('Tratamiento endoscópico según los hallazgos (hemostasia según la causa, la localización y la experiencia); repetir la endoscopia si hay riesgo de resangrado')])])],
          [A('Bajo riesgo (estable, sin sangrado activo ni comorbilidades graves): reanimación y manejo en sala general'),
           D('¿Aparece inestabilidad hemodinámica?',
             [A('Videocolonoscopia en menos de 24 horas luego de la reanimación, con preparación completa')],
             [A('Videocolonoscopia cuando esté disponible, con preparación completa')]),
           F('Tratamiento endoscópico según los hallazgos; repetir si hay riesgo de resangrado')]),
        A('Antiagregación: la aspirina por prevención secundaria cardiovascular no debería suspenderse (suspenderla en prevención primaria); la doble antiagregación se suspende dentro de los primeros 7 días solo si no hay un evento coronario agudo en los últimos 90 días ni un stent en los últimos 30 días'),
    ]),
    banderas=[
        'La videocolonoscopia es el primer estudio en el paciente estable, tras descartar causas periorificiales; su precisión diagnóstica es del 42 al 100 %.',
        'La colectomía subtotal es el recurso para el paciente inestable sin sitio de sangrado localizado: mortalidad alta.',
    ],
    fuente=FG('83', 'Hemorragia digestiva baja', 'Algoritmo de la fig. 83-4; manejo ambulatorio del manual de la Universidad de Chile (2020).'),
)

# ---------------- ictericia y síndrome de hipertensión canalicular biliar (cap. 85) ----------------
CONTENIDO['cx-ictericia-obstructiva'] = dict(
    algoritmo=dict(titulo='Síndrome de hipertensión canalicular biliar (Giménez 2025)', nodos=[
        I('Ictericia con coluria y acolia: laboratorio colestásico, ecografía y colangiorresonancia o ecoendoscopia; buscar colangitis'),
        A('El abordaje de elección es temprano y mínimamente invasivo (endoscópico o percutáneo), independientemente de la etiología; tomar siempre una muestra de bilis durante el drenaje (cultivos positivos en 59 a 90 %; hemocultivos en 21 a 71 %)'),
        D('¿La causa es benigna (litiasis)?',
          [F('Extracción de los cálculos por CPRE y colecistectomía; cirugía convencional o laparoscópica si faltan insumos, infraestructura o experiencia (colecistectomía con exploración de la vía biliar, coledocotomía o derivación biliodigestiva)')],
          [D('¿Es maligna y resecable?',
             [F('Cirugía radical (Whipple u otra) con evaluación oncológica previa')],
             [F('Prótesis biliar endoscópica o percutánea como paliación')])]),
    ]),
    banderas=[
        'La mortalidad de la colangitis aguda varía del 2 al 65 % y hoy es menor del 10 % por el abordaje mínimamente invasivo y los mejores esquemas antibióticos.',
        'Determinan el pronóstico: comorbilidades, presentación grave, etiología tumoral, diagnóstico tardío, tiempo hasta la desobstrucción y antibióticos tempranos.',
    ],
    fuente=FG('85', 'Síndrome de hipertensión canalicular biliar'),
)

NUEVAS = []

# ================= fichas nuevas =================
def nueva(id, titulo, alias, up, unidad, definicion, diagnostico, estudios, tratamiento, seguimiento, banderas, algoritmo, fuente, fisiopatologia=None):
    d = {'id': id, 'area': 'cirugia', 'titulo': titulo, 'alias': alias, 'up': [up] if isinstance(up, str) else up, 'unidad': unidad, 'estado': 'verificar',
         'definicion': definicion, 'diagnostico': diagnostico, 'estudios': estudios, 'tratamiento': tratamiento, 'seguimiento': seguimiento,
         'banderas': banderas, 'algoritmo': algoritmo, 'fuente': fuente, 'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.'}
    if fisiopatologia: d['fisiopatologia'] = fisiopatologia
    NUEVAS.append(d)

U3 = 'UP3 · Disfagia y patología esofagogástrica'; U4 = 'UP4 · Enfermedad colorrectal y anorrectal'; U5 = 'UP5 · Patología hepatobiliar y pancreática'
U7 = 'UP7 · Tumoración cervical'; U10 = 'UP10 · Enfermedad vascular periférica'; U1 = 'UP1 · Trauma de miembro superior y generalidades quirúrgicas'
P = lambda t: [{'titulo': t[0], 'pasos': [{'etiqueta': e, 'texto': x} for e, x in t[1]]}]

# ---- lesión quirúrgica de la vía biliar (cap. 58, figs. 58-7 a 58-9)
nueva('cx-lesion-quirurgica-via-biliar', 'Lesión quirúrgica de la vía biliar (clasificación de Strasberg)',
      ['lesion de via biliar', 'lqvb', 'strasberg', 'colecistectomia laparoscopica complicacion', 'hepaticoyeyunoanastomosis', 'bilirragia'], 'cx5', U5,
      'Lesión de la vía biliar principal o accesoria durante una cirugía, sobre todo la colecistectomía laparoscópica (0,4 a 0,6 %). Se clasifica según Strasberg en tipos A a E (E1 a E5) y la conducta depende del tipo, del momento del diagnóstico y del cirujano.',
      ['Tipo A: fuga del cístico o de conductos de Luschka. Tipo B: oclusión de un conducto hepático derecho aberrante. Tipo C: sección sin ligadura de un conducto aberrante. Tipo D: lesión lateral de la vía biliar principal. Tipo E (E1 a E5): lesión circunferencial con sección o resección de la vía biliar principal, según el nivel respecto de la confluencia.',
       'Sospechar ante bilirragia posoperatoria (bajo o alto débito), colección biliar, ictericia o colangitis; el diagnóstico tardío o el tratamiento inadecuado causan hipertensión portal y cirrosis biliar secundaria.'],
      ['Colangiorresonancia como estudio de elección en el seguimiento y el diagnóstico; CPRE si hay bilirragia de alto débito; hepatograma con fosfatasa alcalina y GGT; elastografía o biopsia hepática ante sospecha de fibrosis.'],
      P(('Conducta según Strasberg (figs. 58-7 a 58-9)', [
          ('A', 'Diagnóstico intraoperatorio: ligadura. Posoperatorio: bilirragia de bajo débito, observación; de alto débito, CPRE.'),
          ('B', 'Posoperatorio: sin repercusión clínica, seguimiento; con repercusión, drenaje percutáneo y luego reconstitución percutánea, hepático-yeyunoanastomosis (HYA) o resección.'),
          ('C', 'Intraoperatorio: conducto menor, ligadura; mayor, HYA si es lesión fría y cirujano hepatobiliopancreático, drenaje si es lesión térmica; si el cirujano no es especialista, drenar y derivar. Posoperatorio: bajo débito, observación; alto débito, drenaje percutáneo y reconstitución o HYA/resección.'),
          ('D', 'Intraoperatorio: sutura simple o sobre tubo en T. Posoperatorio: bilirragia de bajo débito, observación; de alto débito, CPRE.'),
          ('E1 y E2', 'Sección con lesión fría: sutura término-terminal o HYA por cirujano hepatobiliopancreático; lesión térmica: resección; posoperatorio: reconstrucción percutáneo-endoscópica o HYA.'),
          ('E3 a E5', 'Drenaje percutáneo de la vía biliar y luego HYA o Hepp-Couinaud, o resección; el cirujano no especialista drena y deriva.'),
      ])),
      ['Seguimiento estricto durante al menos 10 años con clínica (colangitis), hepatograma (FAL y GGT) y colangiorresonancia ante clínica o alteraciones bioquímicas; las estenosis dilatadas con balón tienen un 65 % de éxito, y la dilatación sostenida con múltiples stents plásticos o biodegradables, un 80 % (protocolos de Roma y DAICIM).'],
      ['La reparación de lesiones complejas debe hacerse en centros de alto volumen: hasta dos tercios de los reparados en centros de bajo volumen requieren luego otra intervención especializada.',
       'Se evitan las cirugías resectivas en la urgencia: aumentan claramente la mortalidad.',
       'El 0,2 % de los trasplantes hepáticos en la Argentina se debe a complicaciones de las lesiones de la vía biliar.'],
      dict(titulo='Lesión quirúrgica de la vía biliar (Giménez 2025)', nodos=[
          I('Lesión de la vía biliar detectada durante la cirugía o en el posoperatorio (bilirragia, colección, ictericia, colangitis): clasificar según Strasberg'),
          D('¿Se diagnostica durante la operación?',
            [D('¿Es una lesión menor o lateral (tipo A, conducto menor, tipo D)?',
               [F('Ligadura (tipo A o conducto menor) o sutura simple o sobre tubo en T (tipo D)')],
               [D('¿Hay un cirujano hepatobiliopancreático?',
                  [F('Lesión fría: HYA o sutura término-terminal; lesión térmica: drenaje y resección diferida')],
                  [F('Drenar y derivar a un centro especializado')])])],
            [D('¿La bilirragia es de alto débito o hay repercusión clínica?',
               [A('CPRE o drenaje percutáneo y, si hay lesión mayor, reconstitución percutánea o endoscópica, HYA o resección en centro de alto volumen')],
               [F('Observación o seguimiento (bajo débito o sin repercusión)')])]),
      ]),
      FG('58', 'Lesión quirúrgica de la vía biliar', 'Figuras 58-7, 58-8 y 58-9.'))

# ---- hepatocarcinoma (cap. 51, fig. 51-5)
nueva('cx-hepatocarcinoma', 'Hepatocarcinoma: estadificación de Barcelona y tratamiento',
      ['hepatocarcinoma', 'carcinoma hepatocelular', 'chc', 'bclc', 'barcelona', 'milan', 'trasplante hepatico', 'tace', 'sorafenib'], 'cx5', U5,
      'Tumor maligno primario del hígado originado en los hepatocitos, casi siempre sobre una hepatopatía crónica. El cáncer de hígado es el quinto en frecuencia y el tercero como causa de muerte por cáncer en el mundo.',
      ['Buscar signos de hepatopatía crónica (encefalopatía, várices, esplenomegalia, ascitis); puede presentarse con shock y hemoperitoneo por rotura espontánea. La ascitis puede deberse a la hepatopatía o a la extensión tumoral al peritoneo.',
       'La estadificación y la elección del tratamiento se basan en la carga tumoral, la función hepática, el estado físico y el pronóstico (clasificación de Barcelona, refinada por AFP, ALBI, Child-Pugh y MELD).'],
      ['Imágenes dinámicas, alfafetoproteína, función hepática (Child-Pugh, MELD, ALBI), plaquetas, endoscopia (várices) y, en casos seleccionados, gradiente de presión suprahepática.'],
      P(('Tratamiento según el estadio de Barcelona (fig. 51-5)', [
          ('Muy temprano (0)', 'Único de 2 cm o menos, función preservada, PS 0: ablación, resección o trasplante; el trasplante se discute si hay candidato potencial.'),
          ('Temprano (A)', 'Único o hasta 3 nódulos de 3 cm o menos con función preservada: el único se reseca si la presión portal y la bilirrubina son normales y, si están aumentadas, se prefiere la ablación; con hasta 3 nódulos, trasplante si no hay contraindicaciones y ablación si las hay.'),
          ('Intermedio (B)', 'Multinodular con función preservada: trasplante si cumple criterios expandidos (tamaño y AFP); quimioembolización (TACE) si los nódulos están bien definidos con flujo portal preservado y acceso selectivo; tratamiento sistémico si es difuso o extenso.'),
          ('Avanzado (C)', 'Invasión portal o metástasis extrahepáticas: tratamiento sistémico (atezolizumab-bevacizumab o durvalumab-tremelimumab; luego sorafenib o lenvatinib como alternativas y segundas líneas).'),
          ('Terminal (D)', 'Cualquier carga tumoral con función hepática terminal y PS 3-4: mejor tratamiento de soporte (sobrevida de unos 3 meses).'),
          ('Resección', 'Hígado sano tolera hasta el 80 % y el cirrótico hasta el 60 % (remanente mínimo del 40 %); valorar plaquetas mayores de 100.000, ausencia de várices y gradiente menor de 10 mmHg. Buen pronóstico: tumor menor de 5 cm, cápsula, margen negativo, sin satélites ni invasión vascular.'),
          ('Trasplante', 'Trata el tumor y la hepatopatía de base (Child B o C). Criterios de Milán: único menor de 5 cm o hasta 3 nódulos menores de 3 cm, con sobrevida del 70 % a 5 años; hay criterios expandidos (UCSF, up-to-seven).'),
      ])),
      ['Control periódico de la recidiva y de la función hepática según el tratamiento recibido.'],
      ['Toda decisión es individualizada y multidisciplinaria.', 'La resección laparoscópica en cirróticos reduce el estrés quirúrgico y las complicaciones tempranas (ascitis).'],
      dict(titulo='Hepatocarcinoma: clasificación de Barcelona (Giménez 2025)', nodos=[
          I('Hepatocarcinoma: carga tumoral, función hepática (Child-Pugh, ALBI, MELD), estado físico (PS) y AFP'),
          D('¿Es muy temprano o temprano (único o hasta 3 nódulos de 3 cm o menos, función preservada, PS 0)?',
            [A('Ablación, resección o trasplante según la presión portal, la bilirrubina y las contraindicaciones'),
             F('Más de 5 años de sobrevida esperada')],
            [D('¿Es intermedio (multinodular con función preservada)?',
               [F('Trasplante si cumple criterios expandidos; TACE si hay nódulos bien definidos con flujo portal preservado; tratamiento sistémico si es difuso')],
               [D('¿Es avanzado (invasión portal o metástasis extrahepáticas, función preservada)?',
                  [F('Tratamiento sistémico (inmunoterapia con antiangiogénico); segundas líneas con sorafenib, lenvatinib o regorafenib')],
                  [F('Terminal: mejor tratamiento de soporte')])])]),
      ]),
      FG('51', 'Tumores malignos primarios del hígado', 'Esquema terapéutico de la fig. 51-5 (clasificación de Barcelona).'))

# ---- cáncer de vesícula (cap. 56)
nueva('cx-cancer-vesicula', 'Cáncer de vesícula biliar',
      ['cancer de vesicula', 'vesicula', 'tumor incidental de vesicula', 'colecistectomia incidental'], 'cx5', U5,
      'Neoplasia agresiva de diagnóstico y tratamiento complejos; la mayoría se descubre en forma incidental en el estudio histopatológico de la pieza de colecistectomía.',
      ['Se sospecha por ecografía y se estudia con tomografía o resonancia (el PET complementa en algunos casos). Hay diferencias regionales de la enfermedad.',
       'Factores pronósticos principales: estadio T, estadio N y enfermedad residual en los tumores incidentales.'],
      ['Ecografía: sensibilidad de alrededor del 40 %, mayor en tumores avanzados; toda vesícula con pared mayor de 3 mm, focal o difusa, con aumento de la vascularización alerta al especialista, sobre todo en zonas endémicas; puede mostrar vesícula en porcelana, invasión de estructuras vecinas, adenopatías o ascitis.',
       'TC: índice diagnóstico del 84 %; sirve para tumores tempranos, invasión de la vena porta y la arteria hepática y estadificación. RM: muy útil para la invasión biliar, vascular y hepática y la resecabilidad (sensibilidad y especificidad para la invasión vascular del 100 % y el 87 %). PET: selectiva, ante hallazgos sospechosos en la TC o la RM; no es sensible en la enfermedad peritoneal de pequeño volumen.',
       'Estadificación laparoscópica: útil para detectar enfermedad irresecable y evitar una laparotomía no terapéutica.'],
      P(('Tratamiento', [
          ('Curativo', 'La cirugía es la única posibilidad de curación. Tumores incidentales T1b, T2 o T3: resección oncológica definitiva (resección hepática más linfadenectomía); la resección de la vía biliar, de estructuras vasculares o de los puertos de laparoscopia se usa de forma selectiva.'),
          ('Extendido', 'Las resecciones extendidas se indican con frecuencia en los tumores no incidentales; el límite es lograr una resección curativa (R0).'),
          ('Paliativo', 'Drenaje biliar: percutáneo en la invasión hiliar, obstrucción del carrefour o duodenal (mejor drenaje con menos complicaciones); prótesis metálica con permeabilidad media de 6 meses; stent duodenal o sonda nasoyeyunal para la obstrucción duodenal; ablación percutánea del plexo celíaco para el dolor; la quimioterapia requiere recuperar la función hepática.'),
      ])),
      ['Terapia adyuvante: su evolución puede ser clave para mejorar el resultado de la cirugía radical.'],
      ['Tumor incidental en la anatomía patológica: completar la resección oncológica según el estadio, sin demora.', 'Diagnóstico de cáncer de vesícula previo a la colecistectomía: estudiar de forma exhaustiva y descartar otras patologías que se enmascaren detrás del cuadro.'],
      dict(titulo='Cáncer de vesícula (Giménez 2025)', nodos=[
          I('Sospecha por ecografía o hallazgo incidental en la pieza de colecistectomía: TC o RM (PET en casos seleccionados)'),
          D('¿Es un tumor incidental T1b, T2 o T3?',
            [F('Resección oncológica definitiva: resección hepática más linfadenectomía (reintervención)')],
            [A('Estadificación laparoscópica para detectar enfermedad irresecable'),
             D('¿Es resecable con intención curativa (R0)?',
               [F('Resección extendida (hepática, vía biliar o vascular de forma selectiva) con terapia adyuvante')],
               [F('Paliación: drenaje biliar (percutáneo si hay invasión hiliar), stent duodenal, tratamiento del dolor y quimioterapia si recupera la función hepática')])]),
      ]),
      FG('56', 'Cáncer de vesícula'))

# ---- cáncer de la vía biliar (cap. 57)
nueva('cx-cancer-via-biliar', 'Cáncer de la vía biliar (colangiocarcinoma)',
      ['colangiocarcinoma', 'tumor de klatskin', 'cancer de via biliar', 'ca 19.9', 'colangitis esclerosante'], 'cx5', U5,
      'Neoplasia de alta letalidad que se origina en las células epiteliales de la vía biliar. Se clasifica en intrahepático y extrahepático, y este último en perihiliar (50 a 60 % de los casos) y distal, separados por la terminación del conducto cístico.',
      ['La inflamación crónica de la vía biliar es el factor común más asociado. Factores de riesgo frecuentes: colangitis esclerosante primaria, quistes del colédoco, hepatolitiasis crónica y papilomatosis biliar; es más frecuente entre la 5.ª y la 7.ª década.',
       'Se presenta con ictericia obstructiva, colangitis aguda recurrente y síntomas constitucionales. El CA 19-9 tiene baja sensibilidad y especificidad para el diagnóstico.',
       'Diagnóstico diferencial: colangitis esclerosante primaria, colangitis esclerosante asociada a IgG4, sarcoidosis y otras causas de estenosis biliar.'],
      ['Ecografía, TC y RM muestran el nivel de la obstrucción y la diseminación ganglionar o a distancia; la confirmación requiere anatomía patológica.'],
      P(('Tratamiento', [
          ('Quirúrgico', 'La resección es el tratamiento potencialmente curativo cuando es posible (ver las opciones según el nivel de la lesión); el trasplante se discute en casos seleccionados.'),
          ('Drenaje paliativo', 'Las lesiones perihiliares generalmente se drenan por vía percutánea transhepática guiada por imágenes; temporalmente drenajes percutáneos o stents endoscópicos, que luego pueden cambiarse por stents metálicos de mayor permeabilidad.'),
          ('Sistémico', 'Primera línea en el avanzado o irresecable: gemcitabina y cisplatino; la adición de durvalumab mejora la supervivencia. Segunda línea: FOLFOX. En investigación: terapias dirigidas (fusiones de FGFR2, mutaciones de IDH1, BRAF V600E, fusiones de NTRK, amplificación de HER2) e inmunoterapia.'),
      ])),
      ['Prevención: tratar de forma temprana las patologías que inflaman el epitelio biliar (colangitis esclerosante, quistes de vía biliar, hepatolitiasis).'],
      ['Ictericia obstructiva con colangitis recurrente en un adulto mayor: pensar en colangiocarcinoma.'],
      dict(titulo='Colangiocarcinoma (Giménez 2025)', nodos=[
          I('Ictericia obstructiva, colangitis recurrente o síntomas constitucionales: ecografía, TC y RM; CA 19-9 de apoyo'),
          D('¿Es resecable?',
            [F('Resección con intención curativa en centro especializado, con tratamiento adyuvante según el caso')],
            [A('Drenaje biliar paliativo: percutáneo transhepático en las lesiones perihiliares; luego stent metálico para mayor permeabilidad'),
             F('Gemcitabina y cisplatino (con durvalumab); segunda línea FOLFOX; terapias dirigidas según la mutación')]),
      ]),
      FG('57', 'Cáncer de la vía biliar'))

# ---- tumores benignos del hígado (cap. 50)
nueva('cx-tumores-hepaticos-benignos', 'Tumores benignos sólidos del hígado',
      ['hemangioma hepatico', 'hiperplasia nodular focal', 'adenoma hepatocelular', 'tumor hepatico benigno'], 'cx5', U5,
      'Los tumores sólidos hepáticos benignos más prevalentes son el hemangioma (5 a 20 %), la hiperplasia nodular focal (3 por 1000) y el adenoma hepatocelular (1 por 100.000).',
      ['La mayoría de los hemangiomas y de las hiperplasias nodulares focales permanecen estables y asintomáticos y no se malignizan; el hemangioma puede, excepcionalmente, crecer, trombosarse o sangrar.',
       'El adenoma hepatocelular: 30 a 50 % presentan necrosis o sangrado intratumoral o hemorragia extracapsular; el mayor riesgo es la transformación maligna a hepatocarcinoma (5 a 10 %).'],
      ['El diagnóstico es por imágenes, evitando biopsias riesgosas e innecesarias; la punción-biopsia está contraindicada si se sospecha hemangioma por el riesgo hemorrágico y solo es excepcionalmente necesaria si persiste la duda tras descartarlo.'],
      P(('Conducta', [
          ('Hemangioma e hiperplasia nodular focal', 'Observación en la mayoría de los casos.'),
          ('Adenoma hepatocelular', 'Resección; la observación y el control periódico se plantean (con controversia) en casos especiales.'),
      ])),
      ['Seguimiento por imágenes de los tumores en observación.'],
      ['No biopsiar una lesión con sospecha de hemangioma.', 'Adenoma: riesgo de sangrado y de malignización; se reseca.'],
      dict(titulo='Tumor sólido benigno del hígado (Giménez 2025)', nodos=[
          I('Lesión hepática sólida: caracterización por imágenes (ecografía, TC o RM dinámicas), sin biopsia si se sospecha hemangioma'),
          D('¿Es un hemangioma o una hiperplasia nodular focal?',
            [F('Observación: casi siempre estables, asintomáticos y sin transformación maligna')],
            [D('¿Es un adenoma hepatocelular?',
               [F('Resección (riesgo de sangrado y de transformación maligna); observación solo en casos especiales')],
               [F('Duda persistente tras descartar hemangioma: biopsia excepcional; considerar tumores malignos')])]),
      ]),
      FG('50', 'Tumores benignos del hígado'))

# ---- pólipos y poliposis (cap. 71)
nueva('cx-polipos-poliposis', 'Pólipos colorrectales, pólipo cáncer y síndromes de poliposis',
      ['polipo colorrectal', 'polipectomia', 'polipo cancer', 'paf', 'poliposis adenomatosa familiar', 'peutz jeghers', 'poliposis juvenil', 'spigelman', 'cancer colorrectal hereditario'], 'cx4', U4,
      'Los pólipos colorrectales son lesiones que protruyen en la luz; su importancia es el riesgo de cáncer. Los síndromes de poliposis son un grupo de enfermedades hereditarias con un número variable de pólipos, sobre todo en el colon; el seguimiento de referencia es un abordaje interdisciplinario de las familias.',
      ['La mayoría no da síntomas; al crecer pueden causar sangrado, mucorrea, alteración del tránsito, intususcepción y, en el recto, pujo, tenesmo o prolapso. Todo pólipo mayor de 5 mm se reseca y se envía a patología; la pesquisa en asintomáticos se indica desde los 45 a 50 años.',
       'Clasificación endoscópica de París: tipo I (sésiles o polipoides), tipo II (planas elevadas, planas o deprimidas) y tipo III (excavadas); Kudo: tumores de diseminación lateral (granulares o no) y patrón mucoso (pit patterns).',
       'Se sospecha malignidad si mide más de 2 cm, es indurado o ulcerado, de bordes irregulares o no se eleva con la inyección submucosa de solución salina: marcar con tinta china distal a la lesión en al menos tres cuadrantes (no es indispensable en el ciego).',
       'Pólipo cáncer (pT1): foco de cáncer invasor limitado a la submucosa. La neoplasia que no sobrepasa la muscular de la mucosa (pTis) carece de linfáticos y no tiene potencial metastásico.',
       'Poliposis: se clasifican por número (poliposis y oligopoliposis, menos de 100) y por histología: adenomatosas (PAF y sus variantes, asociada a MUTYH, POLE o POLD1), hamartomatosas (Peutz-Jeghers, juvenil, Cowden), mixtas hereditarias y serrata. Estudio genético con más de 20 pólipos acumulados, tumor desmoide, hepatoblastoma, cáncer papilar de tiroides cribiforme-morular o hipertrofia del epitelio pigmentario de la retina.',
       'PAF: mutación del gen APC (cromosoma 5), cientos a miles de pólipos desde la adolescencia y CCR a una edad promedio de 35 a 39 años; manifestaciones extracolónicas: adenomas duodenales (50 a 90 %, puntaje de Spigelman; riesgo de cáncer periampular del 1 al 10 %), pólipos gástricos, tumores desmoides, cáncer de tiroides (variante papilar cribiforme-morular) y hepatoblastoma.'],
      ['Colonoscopia diagnóstica y terapéutica. En la PAF: rectosigmoideoscopia (para decidir la cirugía), endoscopia digestiva alta de visión frontal y lateral (a los 20 a 25 años), ecografía de tiroides, familigrama y pesquisa de los familiares; estudio genético con secuenciación del gen APC.'],
      P(('Tratamiento', [
          ('Pólipos', 'Polipectomía endoscópica como tratamiento de elección en los menores de 1 cm con bajo grado de actividad proliferativa, sin invasión de la muscular ni angioinvasión; cirugía si por tamaño, número o características no se puede extraer.'),
          ('Pólipo cáncer', 'Investigar los factores pronósticos tras la resección: márgenes (recidiva del 0 al 2 % con margen mayor de 1 mm y del 21 al 33 % si está comprometido o es menor de 1 mm), invasión vascular y grado de diferenciación; si el informe es de alto riesgo, discutir la cirugía oncológica.'),
          ('PAF', 'Tratamiento endoscópico de los pólipos duodenales y resección de los mayores de 1 cm; duodenectomía con preservación pancreática en la afectación grave sin cáncer y duodenopancreatectomía cefálica si hay cáncer; los desmoides de la pared se resecan y los mesentéricos pueden requerir quimioterapia.'),
      ])),
      ['Seguimiento endoscópico según el número, el tamaño y la histología; en la PAF con Spigelman IV, estudiar el intestino delgado.'],
      ['Un pólipo que no se eleva con la inyección submucosa o que mide más de 2 cm es sospechoso de malignidad.', 'Los síntomas (diarrea, proctorragia, mucorrea) en un paciente con PAF se asocian en dos tercios con cáncer colorrectal.'],
      dict(titulo='Pólipo colorrectal (Giménez 2025)', nodos=[
          I('Síntomas (sangrado, mucorrea, cambios del tránsito) o pesquisa desde los 45 a 50 años: colonoscopia, que es diagnóstica y terapéutica'),
          D('¿El pólipo mide más de 5 mm?',
            [A('Resecar y enviar a patología'),
             D('¿Tiene signos de malignidad (más de 2 cm, indurado o ulcerado, bordes irregulares, no se eleva con solución salina)?',
               [A('Marcar con tinta china y resecar; si es pólipo cáncer (pT1), evaluar márgenes (menor de 1 mm: recidiva 21 a 33 %), invasión vascular y diferenciación'),
                F('Informe de alto riesgo: cirugía oncológica; de bajo riesgo: seguimiento')],
               [F('Polipectomía endoscópica (de elección si es menor de 1 cm, sin invasión de la muscular); cirugía si no se puede extraer por tamaño, número o características')])],
            [F('Seguimiento según la histología y los factores de riesgo')]),
          D('¿Hay más de 20 pólipos acumulados o antecedentes sugestivos de poliposis (desmoide, hepatoblastoma, tiroides cribiforme-morular)?',
            [F('Estudio genético (APC y otros), familigrama y pesquisa de los familiares con un equipo interdisciplinario; en PAF, endoscopia alta desde los 20 a 25 años y ecografía de tiroides')],
            [F('Pesquisa habitual según la edad')]),
      ]),
      FG('71', 'Pólipos y poliposis'))

# ---- hiperparatiroidismo (cap. 26)
nueva('cx-hiperparatiroidismo', 'Hiperparatiroidismo primario y secundario',
      ['hiperparatiroidismo', 'paratiroides', 'adenoma de paratiroides', 'hipercalcemia', 'pth', 'paratiroidectomia'], 'cx7', U7,
      'Exceso de hormona paratiroidea. El primario se debe a un adenoma (75 a 80 %) o a hiperplasia de varias glándulas (15 a 20 %); el secundario aparece sobre todo en la insuficiencia renal crónica.',
      ['El diagnóstico del hiperparatiroidismo primario es inicialmente bioquímico: calcio total elevado con PTH elevada o normal inapropiada.',
       'Los estudios por imágenes negativos orientan a una hiperplasia paratiroidea.'],
      ['Localizar la glándula enferma antes de operar con los estudios por imágenes apropiados.'],
      P(('Tratamiento', [
          ('Primario', 'El único método curativo es la resección de la glándula (o glándulas) enferma. La cirugía evolucionó de la exploración cervical bilateral sistemática a la exploración unilateral selectiva y a técnicas miniinvasivas, gracias a la localización preoperatoria y al dosaje intraoperatorio de PTH.'),
          ('Secundario', 'Cirugía ante el fracaso o la imposibilidad del tratamiento médico; como la causa es una hiperplasia, se indica exploración bilateral con paratiroidectomía subtotal o total con autoimplante; se recomienda la criopreservación.'),
      ])),
      ['Control del calcio y de la PTH después de la cirugía.'],
      ['Un estudio por imágenes negativo no descarta la enfermedad: pensar en hiperplasia.'],
      dict(titulo='Hiperparatiroidismo (Giménez 2025)', nodos=[
          I('Hipercalcemia con PTH elevada o normal inapropiada: confirmar el diagnóstico bioquímico y localizar la glándula con imágenes'),
          D('¿Es secundario (insuficiencia renal crónica)?',
            [D('¿Falla o es imposible el tratamiento médico?',
               [F('Exploración bilateral con paratiroidectomía subtotal o total con autoimplante; criopreservación')],
               [F('Tratamiento médico y control')])],
            [A('Primario: resección de la glándula enferma (adenoma o hiperplasia) con exploración unilateral selectiva o técnica miniinvasiva y PTH intraoperatoria'),
             F('Imágenes negativas: pensar en hiperplasia y explorar de forma bilateral')]),
      ]),
      FG('26', 'Hiperparatiroidismo primario y secundario'))

# ---- enfermedad carotídea (cap. 19)
nueva('cx-enfermedad-carotidea', 'Enfermedad carotídea',
      ['estenosis carotidea', 'carotida', 'endarterectomia carotidea', 'acv'], 'cx10', U10,
      'Estenosis ateroesclerótica de las arterias carótidas que se asocia a mortalidad y a una posible invalidez grave por accidente cerebrovascular.',
      ['Toda estenosis sintomática fue primero asintomática. Existen parámetros clínicos y de imágenes que permiten seleccionar mejor al asintomático que se beneficiará de la cirugía.'],
      ['El eco-Doppler combinado con la angiorresonancia cubre lo necesario para determinar la necesidad de un tratamiento invasivo.'],
      P(('Conducta', [
          ('Sintomática grave', 'Tratar rápido, en las primeras dos semanas, con buenos resultados.'),
          ('Asintomática', 'Seleccionar con cuidado al paciente que se beneficiará de la cirugía, dado el avance del tratamiento médico; tratar quirúrgicamente a un asintomático también puede causar un ACV.'),
          ('Todos', 'Antiagregación plaquetaria, estatinas y control estricto de los factores de riesgo cardiovascular, con alto nivel de recomendación.'),
      ])),
      ['Tratamiento multidisciplinario del paciente con enfermedad ateroesclerótica de los vasos carotídeos.'],
      ['Estenosis sintomática grave: tratamiento dentro de las dos primeras semanas.'],
      dict(titulo='Estenosis carotídea (Giménez 2025)', nodos=[
          I('Estenosis carotídea: eco-Doppler y angiorresonancia; antiagregación, estatinas y control de factores de riesgo para todos'),
          D('¿Es sintomática y grave?',
            [F('Tratamiento invasivo rápido, en las primeras dos semanas')],
            [F('Asintomática: seleccionar con parámetros clínicos y de imágenes a quienes se beneficiarán de la cirugía; el resto, tratamiento médico')]),
      ]),
      FG('19', 'Enfermedad carotídea'))

# ---- cáncer de la unión esofagogástrica (cap. 40)
nueva('cx-cancer-union-esofagogastrica', 'Cáncer de la unión esofagogástrica (cardias)',
      ['cancer de cardias', 'union esofagogastrica', 'siewert', 'adenocarcinoma de cardias'], 'cx3', U3,
      'Adenocarcinoma que se origina en la unión esofagogástrica; sus principales factores de riesgo son la obesidad y la enfermedad por reflujo gastroesofágico.',
      ['La disfagia y la pérdida de peso son síntomas de la enfermedad avanzada. El pronóstico es muy negativo: supervivencia global menor del 20 % a 5 años.'],
      ['Tomografía de tórax, abdomen y pelvis para la estadificación regional y a distancia (estadificación del cáncer del cardias, fig. 40-4).'],
      P(('Tratamiento', [
          ('Multimodal', 'En los tumores avanzados: quimioterapia o quimiorradioterapia más cirugía; se evalúa la adición de inmunoterapia (atezolizumab, pembrolizumab).'),
          ('Cirugía', 'Es la única terapia con posibilidad de curación; el abordaje (torácico o abdominal) depende del epicentro tumoral, y bien indicada puede llevar la sobrevida a 5 años a más del 50 %. Los tumores Siewert 3 se tratan como los cánceres gástricos.'),
      ])),
      ['Seguimiento oncológico según el estadio.'],
      ['Disfagia con pérdida de peso en un paciente con reflujo u obesidad: endoscopia con biopsia.'],
      dict(titulo='Cáncer del cardias (Giménez 2025)', nodos=[
          I('Disfagia, pérdida de peso o reflujo crónico con obesidad: endoscopia con biopsia y TC de tórax, abdomen y pelvis'),
          D('¿Es un tumor Siewert 3 (centro en el estómago)?',
            [F('Tratar como cáncer gástrico (ver su ficha)')],
            [A('Tratamiento multimodal en los avanzados (quimioterapia o quimiorradioterapia) y cirugía según el epicentro (abordaje torácico o abdominal)'),
             F('Resección quirúrgica, única opción curativa; sobrevida a 5 años mayor del 50 % en casos bien indicados')]),
      ]),
      FG('40', 'Cáncer de la unión gastroesofágica'))

# ---- consentimiento informado y bioética (cap. 3)
nueva('cx-consentimiento-bioetica', 'Consentimiento informado y bioética quirúrgica',
      ['consentimiento informado', 'bioetica', 'autonomia', 'orden de no reanimar', 'directivas anticipadas', 'objecion de conciencia', 'etica'], ['cx1', 'cx2'], U1,
      'La autonomía de las personas incorporó pautas éticas como el consentimiento informado, las directivas médicas anticipadas, la orden de no reanimar, los cuidados paliativos, la teleconsulta, los comités de ética y la objeción de conciencia. El cirujano daña necesariamente para ayudar y adquiere con el paciente obligaciones íntimas, exclusivas y únicas.',
      ['La ética efectúa el análisis crítico de la moral y busca hacer el bien, evitar el mal y elegir lo digno; el derecho establece compromisos y libertades; la justicia custodia la proporción de los intercambios.',
       'El consentimiento informado es un proceso: requiere tiempo, buena comunicación y excede la labor burocrático-administrativa de firmar un formulario.'],
      [],
      P(('Conducta', [
          ('Consentimiento', 'Informar el diagnóstico, el procedimiento, los riesgos, los beneficios y las alternativas, y registrar la decisión del paciente; incluye a niños, niñas y adolescentes según su capacidad progresiva.'),
          ('Decisiones al final de la vida', 'Orden de no reanimar y directivas anticipadas gestionadas con registro; cuidados paliativos.'),
          ('Conflictos', 'Recurrir al comité de ética ante conflictos; el médico defiende los derechos sanitarios y evita los conflictos de interés.'),
      ])),
      [],
      ['Firmar el formulario no reemplaza el proceso de información y comunicación.', 'El consentimiento es una parte de la preparación psicológica del paciente quirúrgico.'],
      dict(titulo='Consentimiento informado (Giménez 2025)', nodos=[
          I('Paciente con indicación quirúrgica: proceso de información con tiempo y buena comunicación'),
          D('¿El paciente comprende y decide con autonomía?',
            [A('Registrar el consentimiento informado (con el procedimiento, los riesgos, los beneficios y las alternativas) y la lista de verificación de seguridad'),
             F('Respetar las decisiones anticipadas, la orden de no reanimar y los cuidados paliativos si corresponden')],
            [F('Evaluar capacidad y apoyos (niños y adolescentes con capacidad progresiva, representantes) y consultar al comité de ética si hay conflicto')]),
      ]),
      FG('3', 'Bioética'))

# ---- sepsis y respuesta a la lesión (cap. 6)
nueva('cx-sepsis-respuesta-lesion', 'Respuesta a la lesión, sepsis y falla multiorgánica',
      ['sepsis', 'shock septico', 'sirs', 'cars', 'sofa', 'mods', 'respuesta metabolica a la lesion', 'respuesta inflamatoria'], 'cx1', U1,
      'La respuesta a la lesión es la respuesta inflamatoria e inmunológica ante cualquier agente que dañe al organismo: aumenta la inmunidad innata (SIRS) y suprime la adaptativa (síndrome de compensación antiinflamatoria, CARS).',
      ['Sepsis: disfunción orgánica que amenaza la vida por una respuesta desregulada del huésped ante una infección; es clínica y no requiere cultivos positivos. Shock séptico: inestabilidad hemodinámica pese a la reposición de volumen.',
       'Síndrome de disfunción orgánica múltiple (MODS): disfunción orgánica progresiva en un paciente agudamente enfermo cuya homeostasis no puede mantenerse sin intervención externa. La escala más usada es SOFA (respiratoria, hematológica, hepática, renal, cerebral y cardiovascular): a más órganos fallidos, mayor mortalidad.',
       'Respuesta metabólica inicial: reducción del gasto energético total y balance negativo de nitrógeno, con pérdida de masa muscular que puede prolongarse más allá del posoperatorio y asociarse a más complicaciones, mortalidad, estancia, peor cicatrización y menor calidad de vida.'],
      ['SOFA; lactato; cultivos; imágenes para buscar el foco.'],
      P(('Conducta', [
          ('Principios', 'Reconocer la sepsis por disfunción orgánica, controlar el foco infeccioso (quirúrgico o drenaje), antibióticos y reanimación; soporte nutricional para limitar la pérdida de masa muscular.'),
      ])),
      ['Seguimiento de la recuperación funcional y nutricional.'],
      ['La sepsis se define clínicamente: no esperar los cultivos para actuar.'],
      dict(titulo='Sepsis (Giménez 2025)', nodos=[
          I('Paciente con infección y disfunción orgánica (SOFA): sepsis, aunque no haya cultivos positivos'),
          A('Controlar el foco (cirugía o drenaje), antibióticos y reanimación; soporte nutricional temprano'),
          D('¿Persiste la hipotensión pese a la reposición de volumen?',
            [F('Shock séptico: vasopresores y cuidados intensivos; vigilar la progresión a falla multiorgánica')],
            [F('Reevaluar la disfunción orgánica con SOFA y el foco infeccioso')]),
      ]),
      FG('6', 'Respuesta a la lesión'))

# ---- cirugía mínimamente invasiva y tecnología (cap. 87)
nueva('cx-cirugia-minima-invasion-tecnologia', 'Cirugía mínimamente invasiva, robótica y guiada por imágenes',
      ['laparoscopia', 'videocirugia', 'cirugia robotica', 'cirugia guiada por imagenes', 'quirofano hibrido', 'fluorescencia', 'realidad aumentada', 'cirugia ambulatoria'], 'cx1', U1,
      'La evolución de los procedimientos quirúrgicos permite prácticas cada vez menos agresivas e invasivas, apoyadas en la robótica, los sistemas de navegación y la cirugía guiada por imágenes.',
      ['Sistemas robóticos: activos, semiactivos y maestro-esclavo (master-slave). Autonomía robótica de nivel 0 a 5 (de ninguna autonomía a autonomía completa): los dispositivos actuales están entre el nivel 0 y 1.',
       'Cirugía guiada por imágenes: imágenes de alta calidad, navegación, fusión de imágenes, realidad mixta (aumentada más virtual), inteligencia artificial y robótica. Quirófanos híbridos: con equipos de imágenes (TC, RM, CBCT, ecografía, fluoroscopia). Cirugía guiada por fluorescencia (infrarrojo): mejora la definición de la anatomía, la perfusión visceral y la identificación tumoral. Imágenes hiperespectrales: casi en tiempo real a nivel molecular, celular y tisular.'],
      [],
      P(('Principios', [
          ('Ventajas generales', 'Menos agresividad, menor estancia hospitalaria y recuperación más rápida; la técnica se elige por el paciente, la patología y la experiencia del cirujano.'),
          ('Valores', 'El saber comunicar, empatizar, la integridad, el compromiso y la ética siempre deben estar presentes más allá de los cambios tecnológicos.'),
      ])),
      [],
      ['La tecnología no reemplaza el criterio clínico ni la formación quirúrgica.'],
      dict(titulo='Elección de la vía de abordaje (Giménez 2025)', nodos=[
          I('Paciente con indicación quirúrgica: evaluar patología, estado clínico y recursos del centro'),
          D('¿Hay experiencia y equipamiento en cirugía mínimamente invasiva?',
            [F('Abordaje laparoscópico o robótico (menos dolor, menor estancia y recuperación más rápida), con guía por imágenes si está disponible')],
            [F('Cirugía convencional abierta, o derivar a un centro con experiencia')]),
      ]),
      FG('87', 'Avances tecnológicos en Cirugía'))

# ---- cirugía endovascular (cap. 89)
nueva('cx-cirugia-endovascular', 'Cirugía endovascular: angioplastia y stents',
      ['cirugia endovascular', 'angioplastia', 'stent', 'evar', 'estenosis renal', 'fibrodisplasia'], 'cx10', U10,
      'Disciplina que reúne técnicas y materiales para tratar enfermedades vasculares por vía endoluminal: angioplastia con balón, stents, endoprótesis y trombólisis.',
      ['Los resultados de la angioplastia son muy buenos en la aorta, las ilíacas y las renales; en arterias finas, como las tibiales, está en plena evolución.',
       'Los stents se indican sobre todo para las complicaciones de la angioplastia (disección o reoclusión aguda); para oclusiones extensas, los stents recubiertos o farmacológicos aún esperan resultados definitorios.'],
      [],
      P(('Ejemplos', [
          ('Fibrodisplasia renal', 'La angioplastia tiene buenos resultados cuando la hipertensión es de difícil tratamiento médico.'),
          ('Troncos viscerales', 'La mayoría de las lesiones ateroscleróticas están en el ostium o en los primeros 2 a 3 cm de la mesentérica superior; éxito técnico del 88 al 100 % (95 % en lesiones ostiales), alivio sintomático a largo plazo del 61 al 91 %, permeabilidad primaria del 60 al 85 %.'),
      ])),
      [],
      ['La elección endovascular o abierta depende de la anatomía, la comorbilidad y la expectativa de vida.'],
      dict(titulo='Tratamiento endovascular (Giménez 2025)', nodos=[
          I('Enfermedad arterial con indicación de revascularización: anatomía, comorbilidades y expectativa de vida'),
          D('¿La lesión es apta para angioplastia (aorta, ilíacas, renales, ostium de troncos viscerales)?',
            [A('Angioplastia con balón; stent si hay disección o reoclusión aguda')],
            [F('Cirugía abierta o técnica híbrida; arterias finas (tibiales): endovascular en evolución')]),
      ]),
      FG('89', 'Cirugía endovascular'))
