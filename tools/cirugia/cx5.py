# -*- coding: utf-8 -*-
"""UP5 · Patología hepatobiliar y pancreática. Base: Giménez 2.ª ed. (2025), caps. 48 (hidatidosis), 49 (absceso hepático), 51 y 52 (tumores hepáticos), 53 (litiasis y colecistitis), 54 (litiasis coledociana), 55 (colangitis), 59 (pancreatitis aguda) y 61 (tumores periampulares). Donde la ficha ya cita una guía, se conserva y Giménez la complementa."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- litiasis biliar ----------------
_lit_sint = [
    A('Colecistectomía laparoscópica electiva (tratamiento del paciente sintomático)'),
    A('Íleo biliar (cálculo mayor de 2 a 2,5 cm que obstruye, sobre todo el íleon terminal): resolver primero el cuadro oclusivo y dejar la colecistectomía para un segundo tiempo'),
    F('Alta con control a los 10 días y al mes; revisar la anatomía patológica de la vesícula en la última consulta')]
CONTENIDO['cx-litiasis-biliar-colico'] = dict(
    algoritmo=dict(titulo='Litiasis vesicular (Giménez 2025)', nodos=[
        I('Hallazgo de cálculos en la vesícula (ecografía) o cólico biliar en el hipocondrio derecho'),
        D('¿Tiene síntomas (cólico biliar) o una complicación (colecistitis, pancreatitis, colangitis, ictericia)?',
          _lit_sint,
          [F('Asintomática: salvo las excepciones (vesícula en porcelana, pólipos mayores de 1 cm, cálculos mayores de 3 cm, anemia hemolítica) no se trata ni se sigue')]),
    ]),
    diagnostico=[
        'La litiasis biliar es la segunda enfermedad gastrointestinal más prevalente del mundo después del reflujo y la primera causa de hospitalización; muchos pacientes son asintomáticos y, una vez diagnosticados los cálculos, es casi nula la chance de que desaparezcan (solo se informó regresión con embarazo, nutrición parenteral total o pérdida de peso).',
        'Cólico en el hipocondrio derecho, a menudo tras comidas grasas. Complicaciones: colecistitis (la más frecuente), pancreatitis, colangitis e ictericia obstructiva.',
        'Íleo biliar: antecedente de litiasis sintomática, obstrucción intestinal en la radiografía, aerobilia y cálculo en el tubo digestivo; síndromes de Bouveret (cálculo en duodeno que bloquea la salida gástrica) y de Barnard (válvula ileocecal).',
    ],
    fuente=FG('53', 'Litiasis vesicular y colecistitis aguda', 'La indicación en asintomáticos y la conducta del cólico coinciden con el manual de la Universidad de Chile (2020).'),
)

# ---------------- colecistitis aguda ----------------
_cole_g3 = [
    A('Soporte de órganos y antibióticos endovenosos'),
    A('Drenaje: colecistostomía percutánea en el paciente grave o de alto riesgo'),
    F('Colecistectomía diferida cuando esté estable; retirar la colecistostomía al mes en consultorio')]
_cole_g12 = [
    A('Internación, régimen cero, hidratación, analgesia y antibióticos endovenosos'),
    A('Colecistectomía laparoscópica precoz (en los primeros días), con colangiografía intraoperatoria si se sospecha obstrucción biliar'),
    F('Seguimiento: sin litiasis (alitiásica) termina el control; con litiasis y riesgo alto, control trimestral')]
CONTENIDO['cx-colecistitis-aguda'] = dict(
    algoritmo=dict(titulo='Colecistitis aguda: grados de Tokio TG18 (Giménez 2025)', nodos=[
        I('Dolor en el hipocondrio derecho con Murphy positivo y fiebre: ecografía y laboratorio; clasificar según las guías de Tokio 2018'),
        D('¿Grado III (grave): hay disfunción de algún órgano (hipotensión con vasopresores, alteración de conciencia, PaO2/FiO2 < 300, oliguria o creatinina > 2, RIN > 1,5, plaquetas < 100.000)?',
          _cole_g3, _cole_g12),
    ]),
    diagnostico=[
        'Es la complicación más frecuente de la litiasis vesicular; la fisiopatología habitual es la obstrucción del conducto cístico por un cálculo. La colecistitis alitiásica es una variante sin litiasis (pacientes críticos).',
        'Guías de Tokio 2018: grado I (leve), grado II (moderada: leucocitos > 18.000, masa palpable en el hipocondrio derecho, síntomas de más de 72 horas o inflamación local marcada: gangrenosa, absceso periquístico o hepático, peritonitis biliar) y grado III (grave: disfunción orgánica).',
    ],
    banderas=[
        'Grado III o paciente de alto riesgo: drenaje percutáneo y cirugía diferida.',
        'Síntomas de más de 72 horas, leucocitosis > 18.000 o masa palpable: colecistitis moderada.',
    ],
    fuente=FG('53', 'Litiasis vesicular y colecistitis aguda', 'Antibióticos y conducta quirúrgica coinciden con el manual de la Universidad de Chile (2020).'),
)

# ---------------- coledocolitiasis y colangitis ----------------
_cole_un = [
    A('Un tiempo: colecistectomía laparoscópica con exploración de la vía biliar (vía transcística, o coledocotomía si hay vía dilatada y cálculos grandes); solo con riesgo aceptable, centro de alto volumen, equipo y cirujano entrenado'),
    F('Resultados equivalentes en eficacia al tratamiento en dos tiempos, con menos estancia y menos complicaciones iatrogénicas')]
_cole_dos = [
    A('Dos tiempos: CPRE con extracción de los cálculos y luego colecistectomía laparoscópica (pacientes de alto riesgo, o centros sin la tecnología o la experiencia)'),
    F('Elegir según el paciente, el cirujano y los recursos del centro; abordaje multidisciplinario')]
CONTENIDO['cx-coledocolitiasis-colangitis'] = dict(
    algoritmo=dict(titulo='Coledocolitiasis y colangitis aguda (Giménez 2025, guías de Tokio)', nodos=[
        I('Cólico biliar con ictericia, o fiebre, ictericia y dolor (tríada de Charcot): laboratorio colestásico, ecografía y colangiorresonancia o ecoendoscopia'),
        D('¿Es una colangitis aguda?',
          [A('Los tres pilares: reanimación con líquidos, antibióticos y drenaje de la vía biliar (CPRE con esfinterotomía, drenaje percutáneo o quirúrgico según los recursos)'),
           F('Equipo multidisciplinario; complicaciones: pancreatitis aguda (7,6 %), shock séptico (4 %) y absceso hepático (2 a 2,5 %)')],
          [D('¿El riesgo operatorio es aceptable y el centro cuenta con equipo y experiencia en exploración laparoscópica?', _cole_un, _cole_dos)]),
    ]),
    diagnostico=[
        'Colangitis aguda (ascendente): fiebre, ictericia y dolor abdominal (tríada de Charcot) con leucocitosis y perfil colestásico; alta mortalidad (histórica mayor del 50 %) si no se trata a tiempo.',
        'Imágenes: ecografía, TC, colangiorresonancia y ecoendoscopia muestran la dilatación de la vía biliar, el cálculo o el defecto de llenado.',
        'Los pronósticos y las pautas se ajustan a las comorbilidades: inmunodeprimidos, stents biliares, derivaciones biliodigestivas y resistencia antibiótica.',
    ],
    fuente=FG('54 y 55', 'Tratamiento de la litiasis coledociana; Colangitis aguda', 'Reanimación y drenaje según Giménez; los antibióticos deben adecuarse a la flora del centro.'),
)

# ---------------- pancreatitis aguda ----------------
CONTENIDO['cx-pancreatitis-aguda'] = dict(
    algoritmo=dict(titulo='Pancreatitis aguda (guía argentina y Giménez 2025)', nodos=[
        I('Dolor epigástrico en barra con vómitos y amilasa o lipasa ≥ 3 veces lo normal: el diagnóstico es clínico y de laboratorio; imágenes solo en casos dudosos'),
        A('Hidratación no agresiva con cristaloides (Ringer lactato, titulados a la respuesta), analgesia multimodal temprana y alimentación oral o enteral precoz; sin antibióticos profilácticos'),
        D('¿Es biliar con colangitis u obstrucción biliar persistente?',
          [A('CPRE urgente')],
          [A('Sin CPRE de rutina')]),
        D('¿Hay complicaciones locales (necrosis infectada, colecciones)?',
          [A('Antibióticos dirigidos y drenaje (percutáneo o endoscópico) como procedimiento de elección'),
           A('Necrosectomía solo si hace falta y lo más tarde posible; mínimamente invasiva (endoscópica y percutánea con resultados similares) por sobre la cirugía abierta; abordaje escalonado (PANTER, POINTER)'),
           F('La cirugía abierta queda para casos seleccionados sin control con la mínimamente invasiva')],
          [F('Colecistectomía en la misma internación si es biliar y leve; en la grave, diferir hasta resolver las colecciones')]),
    ]),
    fisiopatologia=[
        'Las causas más frecuentes son la litiasis biliar y el alcohol, seguidas por la hipertrigliceridemia. Dos tipos: edematosa y necrosante. La gravedad la define el fallo de órganos y, en menor medida, las complicaciones locales (Atlanta revisada).',
        'Antes se operaba temprano con mortalidad alta; hoy la mayoría de las pancreatitis agudas no requiere cirugía abierta: el tratamiento mínimamente invasivo y escalonado de la necrosis infectada superó a la cirugía (PANTER) y puede iniciarse solo con antibióticos (POINTER).',
    ],
    fuente=FC('59', 'Pancreatitis aguda'),
)

# ---------------- cáncer de páncreas y periampulares ----------------
CONTENIDO['cx-cancer-pancreas'] = dict(
    algoritmo=dict(titulo='Tumores periampulares y cáncer de páncreas (Giménez 2025)', nodos=[
        I('Ictericia indolora, pérdida de peso o dolor: TC de páncreas en fase pancreática y ecoendoscopia (mejor método para la invasión vascular, permite biopsia)'),
        D('¿Es resecable?',
          [A('Pancreatoduodenectomía cefálica (Whipple), la piedra angular del tratamiento, en centros de alto volumen'),
           F('Quimioterapia adyuvante en el adenocarcinoma ductal; en el ampuloma y otros periampulares no hay un papel claro de la adyuvancia')],
          [D('¿Es resecable limítrofe (borderline) o localmente avanzado?',
             [F('Terapia neoadyuvante y reevaluación para cirugía')],
             [F('Irresecable: quimioterapia sistémica (5-FU y oxaliplatino) y paliación: prótesis biliar, derivación gastroyeyunal o prótesis duodenal si hay obstrucción, y control del dolor')])]),
    ]),
    banderas=[
        'Pronóstico del adenocarcinoma de la cabeza del páncreas: sobrevida global a 5 años cercana al 10 %.',
        'El tumor periampular más frecuente es el adenocarcinoma ductal de la cabeza pancreática.',
    ],
    fuente=FC('61', 'Tumores periampulares'),
)

# ---------------- hidatidosis ----------------
CONTENIDO['cx-hidatidosis-hepatica'] = dict(
    algoritmo=dict(titulo='Hidatidosis hepática (Giménez 2025)', nodos=[
        I('Quiste hepático en un paciente de zona endémica (Patagonia, región pampeana, precordillera): ecografía y clasificación de Gharbi; serología'),
        D('¿Está roto, infectado o complicado (vía biliar, tórax, peritoneo)?',
          [A('Rotura con siembra: peritonitis química y shock; urgencia con lavado del peritoneo y marsupialización indirecta'),
           A('Compromiso de la vía biliar (21 % de los casos): papilotomía endoscópica con extracción de membranas, o coledocotomía con tubo de Kehr si se descubre durante la cirugía'),
           F('Migración al tórax: abordaje abdominal combinado con tórax o toracotomía baja; empiema hidatídico: primero drenaje pleural y luego el quiste')],
          [A('Cirugía de elección (es una enfermedad benigna): periquistectomía total o parcial o quistectomía, adecuada a la magnitud de la enfermedad y al ambiente hospitalario; laparoscopia en casos seleccionados'),
           A('Albendazol antes y después; la resección hepática solo en casos excepcionales'),
           F('Evitar el derrame; los procedimientos percutáneos tienen altos índices de recidiva en la experiencia argentina')]),
    ]),
    contraste={'estado': 'difiere', 'fuente': 'Giménez 2.ª ed. (2025) frente a las pautas internacionales de la OMS (PAIR)',
               'puntos': ['Giménez considera la cirugía el tratamiento de elección y asocia la aspiración y los drenajes percutáneos con altos índices de recidiva; las pautas internacionales aceptan PAIR en quistes seleccionados sin comunicación biliar. Prevalece la conducta argentina del texto.']},
    fuente=FG('48', 'Quistes parasitarios y no parasitarios del hígado (hidatidosis)'),
)

# ---------------- absceso hepático ----------------
CONTENIDO['cx-absceso-hepatico'] = dict(
    algoritmo=dict(titulo='Absceso hepático (Giménez 2025)', nodos=[
        I('Fiebre y dolor en el hipocondrio derecho con leucocitosis: ecografía (sensibilidad del 85 al 95 %) o TC (95 a 100 %)'),
        A('Aspiración guiada con cultivo; datos epidemiológicos y aspecto del líquido en "pasta de anchoas" orientan al amebiano'),
        D('¿Es amebiano?',
          [F('Tratamiento médico de elección (metronidazol); drenaje percutáneo solo en casos seleccionados (grande, sin respuesta o en riesgo de rotura)')],
          [A('Los tres pilares del piógeno: antibióticos de amplio espectro, drenaje percutáneo y búsqueda y tratamiento de la causa (biliar 40 %, portal 16 %, órganos vecinos, trauma o criptogénica)'),
           F('Cirugía si es multiloculado, falla el drenaje o se rompe')]),
    ]),
    fuente=FG('49', 'Absceso hepático'),
)

# ---------------- tumores hepáticos ----------------
CONTENIDO['cx-tumores-hepaticos'] = dict(
    algoritmo=dict(titulo='Tumores hepáticos malignos y metástasis (Giménez 2025)', nodos=[
        I('Lesión hepática: buscar signos de hepatopatía crónica (encefalopatía, várices, esplenomegalia, ascitis), imágenes dinámicas y marcadores; evaluar el estado general, la función hepática y el remanente'),
        D('¿Es una metástasis de cáncer colorrectal?',
          [A('El tratamiento quirúrgico es el único que puede curar (sobrevida a 5 años de 30 a 50 %); solo 15 a 25 % es candidato al diagnóstico'),
           A('Resecar sin importar el tamaño ni el número si queda parénquima suficiente; la resección colorrectal y hepática simultánea es válida; aumentar la resecabilidad con neoadyuvancia, oclusión portal o cirugía en dos tiempos'),
           F('Equipo multidisciplinario; quimioterapia perioperatoria; ablación en lesiones seleccionadas')],
          [D('¿Es un tumor primario maligno resecable?',
             [F('Resección hepática (con linfadenectomía del pedículo en el colangiocarcinoma intrahepático); trasplante en casos seleccionados (tumores pequeños y favorables); en hepatocarcinoma, ablación o trasplante según estadio y función; quimioembolización en el estadio intermedio')],
             [F('Terapias regionales y sistémicas; los tumores benignos se siguen y el adenoma grande o con riesgo se reseca')])]),
    ]),
    fuente=FC('51 y 52', 'Tumores malignos primarios del hígado y Metástasis hepáticas'),
)

# ---------------- ictericia obstructiva ----------------
CONTENIDO['cx-ictericia-obstructiva'] = dict(
    algoritmo=dict(titulo='Ictericia obstructiva', nodos=[
        I('Ictericia con coluria y acolia: laboratorio colestásico, ecografía y colangiorresonancia o ecoendoscopia; descartar colangitis'),
        D('¿Hay colangitis o sepsis?',
          [F('Reanimación, antibióticos y drenaje urgente de la vía biliar (CPRE o percutáneo)')],
          [D('¿La causa es benigna (litiasis)?',
             [F('Extracción de los cálculos por CPRE y colecistectomía')],
             [D('¿Es maligna y resecable?',
                [F('Cirugía radical (Whipple u otra) con evaluación oncológica previa')],
                [F('Prótesis biliar endoscópica o percutánea como paliación')])])]),
    ]),
)

NUEVAS = []
