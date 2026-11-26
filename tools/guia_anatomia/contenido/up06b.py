# -*- coding: utf-8 -*-
"""UP 6 · Anatomía quirúrgica de la pared abdominal, la región inguinal y el escroto. Parte B: dolor inguinal, patología escrotal, preguntas de oral y referencias."""
from .up01e import N, G, L, oral
from .up06a import GAL, SCH


def dolor_inguinal(u):
    u.h2('Dolor inguinal: diagnóstico diferencial por estructura', intro='El título de la unidad es “dolor inguinal en adultos”. Hay que recorrer qué hay en la ingle: pared y hernias, músculos y tendones, nervios, el uréter, el apéndice, la cadera y el escroto.')
    u.tabla(['Grupo', 'Estructura y cuadro', 'Clave anatómica y clínica'], [
        ['**Pared**', '**Hernias** (inguinal, crural) y **hernia oculta**', 'Tumefacción con el esfuerzo; en el deportista, dolor sin hernia palpable: **insuficiencia de la pared posterior**'],
        ['**Músculo-tendinoso (deportivo)**', '**Pubalgia del deportista**; **lesión de los aductores** (aductor largo) y del **recto anterior del abdomen**', 'Estructuras que se insertan en el **pubis y la sínfisis**: **aductor largo, recto del abdomen y aponeurosis conjunta**; dolor al correr, patear, toser; sensible al **aducir contra resistencia**; RM'],
        ['**Neurogénico**', '**Atrapamiento del ilioinguinal o del genitofemoral**; neuralgia posterior a una hernioplastia', 'Dolor **quemante, lancinante**, con parestesias, que empeora con la extensión de la cadera; **bloqueo anestésico diagnóstico**'],
        ['**Radicular**', '**Radiculopatía lumbar L1-L2**', 'Dolor lumbar que irradia a la ingle; compromete la sensibilidad del territorio L1-L2; alteración en la columna lumbar'],
        ['**Referido**', '**Litiasis ureteral** (cólico renal)', 'Dolor de flanco que **irradia a la ingle y al testículo** (genitofemoral); hematuria'],
        ['**Referido**', '**Apendicitis retrocecal o pélvica**', 'Puede debutar con **dolor inguinal o escrotal** (el apéndice toca el psoas y el uréter)'],
        ['**Articular**', 'Cadera (pinzamiento, necrosis avascular), **osteítis del pubis**', 'Dolor a la rotación de la cadera; radiografía'],
        ['**Otros**', 'Adenopatías inguinales, absceso del psoas, patología testicular', 'Examen del escroto y de las regiones vecinas'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 12; Galindo, Enciclopedia de Cirugía Digestiva, cap. 132; Manual de Urología (bibliografía complementaria de la unidad); anatomía de referencia.')
    N(u, 'S-269', 'Músculos del muslo: compartimento medial.', ['Aductor largo, pectíneo y grácil: se insertan en el pubis (zona de la pubalgia).'], 190)
    N(u, 'S-463', 'Uréteres en el abdomen y la pelvis.', ['El uréter cruza los vasos ilíacos: el cólico irradia a la ingle y al testículo.'], 195)
    G(u, 158, 'Dermatomas y nervios cutáneos (Gray).', ['L1-L2 inervan la ingle y la cara anterior del muslo.'], 190)
    oral(u, 'Frente a un dolor inguinal recorro la ingle estructura por estructura. En la **pared**: **hernia** (inguinal o crural) u hernia oculta. En lo **músculo-tendinoso**: **pubalgia del deportista**, **lesión del aductor largo** o del **recto del abdomen**, por la sobrecarga de sus inserciones en el pubis. En lo **neurogénico**: **atrapamiento del ilioinguinal o del genitofemoral**, típico tras una hernioplastia, con dolor quemante, y **radiculopatía L1-L2**. En lo **referido**: **litiasis ureteral** (cólico que irradia a la ingle y al testículo) y **apendicitis retrocecal**. Y siempre examino la **cadera** y el **escroto**.')


def escroto(u):
    u.h2('Patología escrotal: anatomía del escroto y del testículo, y cuadros que simulan dolor inguinal', intro='La torsión testicular es una urgencia: hay que reconocerla por la anatomía, la clínica y los hallazgos del examen.')
    u.h3('Anatomía del escroto y del testículo')
    u.tabla(['Aspecto', 'Descripción'], [
        ['**Capas del escroto** (de superficial a profundo)', '**Piel**, **dartos** (músculo liso), **fascia espermática externa** (oblicuo externo), **cremáster** (oblicuo interno), **fascia espermática interna** (transversalis) y **túnica vaginal** (hoja parietal y visceral)'],
        ['**Túnica vaginal**', 'Resto del conducto peritoneovaginal; cubre el testículo y el epidídimo; entre sus hojas se acumula el **hidrocele**'],
        ['**Irrigación**', '**Arteria testicular** (de la aorta, a nivel de L2), **deferencial** (de la vesical inferior) y **cremastérica** (de la epigástrica inferior): **triple irrigación**'],
        ['**Drenaje venoso**', '**Plexo pampiniforme** → **vena testicular derecha** (a la **cava inferior**) y **izquierda** (a la **vena renal izquierda**, en ángulo recto)'],
        ['**Linfáticos**', '**Testículo**: ganglios **retroperitoneales (paraaórticos, L1-L2)**; **piel del escroto**: ganglios **inguinales**'],
        ['**Inervación**', '**Genitofemoral** (ramo genital: cremáster), **ilioinguinal** (piel), nervio escrotal posterior (del pudendo) y **plexo testicular** (T10-L1): el dolor testicular se refiere al **flanco y la ingle**'],
        ['**Descenso**', 'El testículo desciende por el **conducto inguinal** guiado por el **gubernáculo**, arrastrando el conducto peritoneovaginal; si no desciende: **criptorquidia**'],
    ], fuente='Netter, láminas S-497 a S-499 y S-510; Gray, págs. 250 y 251; Giménez, Cirugía, 2.ª ed.; Manual de Urología.')
    N(u, 'S-497', 'Escroto y contenido.', ['Capas del escroto, túnica vaginal, testículo y cordón.'], 190)
    N(u, 'S-498', 'Testículo, epidídimo y conducto deferente.', ['Túnica albugínea, mediastino testicular, epidídimo (cabeza, cuerpo y cola) y apéndices testiculares.'], 190)
    N(u, 'S-499', 'Descenso del testículo.', ['Gubernáculo y conducto peritoneovaginal: base de la hernia indirecta congénita y de la criptorquidia.'], 190)
    N(u, 'S-510', 'Arterias y venas del testículo: visión anterior.', ['Triple irrigación y drenaje por el plexo pampiniforme.'], 190)
    N(u, 'S-530', 'Testículos.', ['Estructura interna y relación con el epidídimo.'], 190)
    N(u, 'S-518', 'Nervios de los genitales externos: hombre.', ['Territorios del ilioinguinal, genitofemoral y pudendo.'], 190)
    N(u, 'S-519', 'Inervación de los órganos genitales masculinos: esquema.', ['Plexo testicular y dolor referido.'], 190)
    G(u, 250, 'Escroto (Gray).', ['Capas y contenido.'], 190)
    G(u, 251, 'Testículos (Gray).', ['Epidídimo, túnica vaginal y apéndices.'], 190)
    u.h3('Escroto agudo y masas escrotales')
    u.tabla(['Cuadro', 'Anatomía o causa', 'Clínica y signos', 'Conducta'], [
        ['**Torsión testicular**', 'Giro del testículo sobre el cordón; favorecida por la **“deformidad en badajo de campana”** (túnica vaginal inserta muy alta: el testículo cuelga libre). Adolescentes y recién nacidos', '**Dolor súbito y muy intenso**, náuseas; **testículo alto y transversal**, **reflejo cremastérico ausente**, **Prehn negativo** (la elevación no alivia); **Doppler sin flujo**', '**Urgencia**: se salva más del 90 % si se opera en las **primeras 6 horas**; **exploración quirúrgica** con orquidopexia **bilateral**; destorsión manual solo mientras se prepara la cirugía'],
        ['**Torsión del apéndice testicular**', 'Giro de un vestigio embrionario del polo superior', 'Niños de 7-14 años; dolor localizado en el **polo superior**, **signo del punto azul**; reflejo cremastérico **presente**', 'Reposo y analgesia (conservador)'],
        ['**Epididimitis**', 'Infección del epidídimo: **menores de 35 años**, ITS (clamidia, gonococo); **mayores de 35 años**, enterobacterias', 'Dolor gradual, fiebre, síntomas urinarios; **Prehn positivo** (la elevación alivia)', 'Antibióticos, reposo'],
        ['**Orquitis viral**', 'Complicación de la **parotiditis**', 'Dolor y aumento de volumen unilateral, 1-2 semanas después de la parotiditis; riesgo de atrofia e infertilidad', 'Analgesia, reposo, soporte'],
        ['**Hidrocele**', 'Líquido entre las hojas de la **túnica vaginal** (comunicante en el niño)', 'Tumefacción **indolora**, **transiluminación positiva**', 'Observación o cirugía (Winkelmann, Lord)'],
        ['**Varicocele**', '**Dilatación del plexo pampiniforme**: el **izquierdo** (~90 %) por el drenaje de la vena testicular en la **vena renal izquierda** en ángulo recto', '“**Bolsa de gusanos**”; mejora en decúbito; **infertilidad**; un varicocele **derecho aislado o de aparición brusca** obliga a buscar una masa retroperitoneal o renal', 'Varicocelectomía si hay dolor, infertilidad o atrofia'],
        ['**Traumatismo testicular**', 'Rotura de la **albugínea**, hematocele', 'Dolor y tumefacción tras un golpe; **ecografía Doppler**', 'Cirugía urgente si hay rotura'],
    ], fuente='Manual de Urología (SCHU y Gueglio, bibliografía complementaria); Giménez, Cirugía, 2.ª ed.; anatomía de referencia.')
    u.box('alerta', 'Escroto agudo: ante la duda, se explora', 'Si hay dolor escrotal agudo y **no se puede descartar** la torsión, se **explora quirúrgicamente**: perder el testículo por esperar una ecografía es el error más grave. El Doppler **no reemplaza** a la clínica en las primeras horas.')
    oral(u, 'El escroto tiene **piel, dartos, fascia espermática externa, cremáster, fascia espermática interna y túnica vaginal**. El testículo tiene **triple irrigación** (testicular, deferencial y cremastérica); el **plexo pampiniforme** drena a la **cava** (derecha) y a la **vena renal izquierda** (izquierda): por eso el **varicocele es izquierdo**. La **torsión testicular** (adolescente, **badajo de campana**) da dolor súbito, testículo alto y transversal, **reflejo cremastérico ausente** y **Prehn negativo**: es una **urgencia** (salvamento mayor del 90 % en las primeras 6 horas) y se opera con orquidopexia bilateral. La **torsión del apéndice testicular** da el **punto azul**; la **epididimitis** tiene **Prehn positivo**; la **orquitis viral** sigue a la parotiditis; el **hidrocele** transilumina.')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una une anatomía con la patología de la unidad.')
    qa = [
        ('Describí el conducto inguinal: paredes, anillos y contenido.',
         'Mide 4-6 cm y es oblicuo. **Pared anterior**: aponeurosis del oblicuo externo; **posterior**: fascia transversalis y tendón conjunto; **techo**: oblicuo interno y transverso; **piso**: ligamento inguinal. **Anillo profundo**: defecto de la transversalis lateral a los **epigástricos inferiores**; **superficial**: aponeurosis del oblicuo externo sobre el pubis. Contiene el **cordón** (deferente, arterias testicular, deferencial y cremastérica, plexo pampiniforme, ramo genital del genitofemoral); el **ilioinguinal** corre por fuera del cordón.'),
        ('¿Cómo se diferencia una hernia inguinal directa de una indirecta?',
         'Por su relación con los **vasos epigástricos inferiores**: la **indirecta** sale por el anillo profundo, **lateral** a ellos, y sigue el cordón (puede llegar al escroto; es congénita o adquirida); la **directa** protruye por el **triángulo de Hesselbach**, **medial** a los epigástricos (adquirida, no suele llegar al escroto). En la clínica: **oclusión del anillo profundo** y tos.'),
        ('¿Por qué la hernia crural se estrangula con tanta facilidad?',
         'Porque el **anillo crural** es **rígido y estrecho**: lo limitan el ligamento inguinal (adelante), el ligamento de Cooper (atrás), el **ligamento lacunar (de Gimbernat)** (medial) y la **vena femoral** (lateral). Es más frecuente en la mujer y **se opera siempre**.'),
        ('¿Qué es la hernia de Richter y por qué es peligrosa?',
         'Solo una parte de la **pared intestinal (el borde antimesentérico)** queda atrapada. **Puede no haber obstrucción**, pero la pared se necrosa; se diagnostica tarde.'),
        ('Explicá el triángulo de la muerte y el triángulo del dolor.',
         'En la cirugía laparoscópica de la región inguinal: **triángulo de la muerte (Doom)**: entre el conducto deferente y los vasos testiculares; contiene los **vasos ilíacos externos**. **Triángulo del dolor**: lateral a los vasos testiculares y bajo el tracto iliopúbico; contiene los nervios **femoral, cutáneo femoral lateral y rama femoral del genitofemoral**: **no se colocan grapas**.'),
        ('Una mujer anciana, delgada, con obstrucción intestinal y dolor en la cara medial del muslo. ¿Qué pensás?',
         '**Hernia obturatriz**: sale por el conducto obturador y comprime el nervio obturador: **signo de Howship-Romberg**; se confirma con TC.'),
        ('¿Qué son la eventración y la evisceración y para qué sirve el neumoperitoneo de Goñi Moreno?',
         '**Eventración**: hernia por una cicatriz con la piel íntegra. **Evisceración**: dehiscencia de todos los planos con salida de vísceras (urgencia: gasas húmedas y reoperación). El **neumoperitoneo progresivo de Goñi Moreno** prepara la pared en las eventraciones gigantes con **pérdida de domicilio**: el aire distiende la pared y libera las vísceras.'),
        ('¿Cuáles son las causas de dolor inguinal en un adulto?',
         '**Hernia**; **músculo-tendinoso** (pubalgia, aductores, recto abdominal); **neurogénico** (atrapamiento del ilioinguinal o del genitofemoral, radiculopatía L1-L2); **referido** (litiasis ureteral, apendicitis retrocecal); **cadera**; y **patología escrotal**.'),
        ('Un adolescente con dolor testicular súbito, testículo alto y sin reflejo cremastérico. ¿Qué hacés?',
         '**Torsión testicular**: urgencia; **exploración quirúrgica** en las primeras 6 horas, con **orquidopexia bilateral** (badajo de campana). Prehn negativo; Doppler sin flujo (no debe retrasar la cirugía).'),
        ('¿Por qué el varicocele es casi siempre izquierdo?',
         'Porque la **vena testicular izquierda** desemboca en la **vena renal izquierda en ángulo recto** (más presión y reflujo), mientras que la derecha desemboca oblicua en la cava. Un varicocele **derecho** o de aparición brusca obliga a descartar una **masa retroperitoneal o renal**.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Galindo, F. __Enciclopedia de Cirugía Digestiva__ (2020), SACD: caps. 130 (anatomía quirúrgica de las paredes anterolaterales del abdomen), 132 (hernias inguinocrurales), 133 (Lichtenstein), 134 (hernioplastia laparoscópica), 135 (hernias de la línea media), 138 (hernias poco frecuentes) y 147 (eventración).',
          'Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025): caps. 12 a 15.',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: caps. 35 (pared abdominal, epiplón, mesenterio y retroperitoneo) y 37 (hernias inguinales).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: cap. 35 (pared abdominal, hernias y eventraciones).',
          'Manual de Urología (Confederación Americana de Urología y Sociedad Chilena de Urología, 2.ª ed., 2020) y Gueglio, G. y Martínez, P. __Manual de Urología__ (2014): patología escrotal.',
          'Rojas Duarte, M. y Marinkovic Gómez, B. __Cirugía en medicina general__ (2020) y Márquez Martín, R. y Muñoz Maldonado, G. __Cirugía general para el médico general__ (bibliografía complementaria).'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. La lámina de Netter o de Gray muestra la **anatomía real**: ante cualquier duda, **la lámina manda**. El Manual de Urología de Gueglio no estaba disponible: los datos de patología escrotal se contrastan con el Manual de Urología de la SCHU y con tu bibliografía.')
    u.h3('Imágenes en blanco y negro')
    u.ul(['Los dibujos de técnica quirúrgica de Galindo son en blanco y negro; las disecciones, las vistas laparoscópicas y las fotografías clínicas son a color.'])
