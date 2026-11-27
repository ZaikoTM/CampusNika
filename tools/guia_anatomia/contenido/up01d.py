# -*- coding: utf-8 -*-
"""UP 1 · Anatomía quirúrgica. Parte D: músculos, hombro, codo, bloqueos periféricos y desarrollo oral con las patologías de la unidad."""

OS = 'OpenStax, Anatomy & Physiology (Universidad Rice), licencia CC BY. Rótulos traducidos para esta guía.'


def musculos(u):
    u.h2('Músculos del miembro superior: origen, inserción, acción e inervación', intro='Para decir qué nervio se lesionó tenés que saber qué músculo dejó de funcionar. Esta es la tabla que hay que tener de memoria, agrupada por región.')
    u.h3('Cintura escapular y hombro')
    u.tabla(['Músculo', 'Origen → inserción', 'Acción', 'Nervio'], [
        ['**Deltoides**', 'Tercio lateral de la clavícula, acromion y espina de la escápula → tuberosidad deltoidea del húmero', 'Abducción entre 15° y 90°; las fibras anteriores flexionan y las posteriores extienden', 'Axilar (C5-C6)'],
        ['**Supraespinoso**', 'Fosa supraespinosa → faceta superior del troquíter', 'Inicia la abducción (0°-15°)', 'Supraescapular (C5-C6)'],
        ['**Infraespinoso**', 'Fosa infraespinosa → faceta media del troquíter', 'Rotación externa', 'Supraescapular'],
        ['**Redondo menor**', 'Borde lateral de la escápula → faceta inferior del troquíter', 'Rotación externa', 'Axilar'],
        ['**Subescapular**', 'Fosa subescapular → troquín (tubérculo menor)', 'Rotación interna', 'Subescapulares superior e inferior (C5-C7)'],
        ['**Redondo mayor**', 'Ángulo inferior de la escápula → cresta del troquín', 'Aducción y rotación interna', 'Subescapular inferior'],
        ['**Pectoral mayor**', 'Clavícula, esternón y costillas → cresta del troquíter', 'Aducción y rotación interna', 'Pectorales lateral y medial'],
        ['**Dorsal ancho**', 'Apófisis espinosas T7-L5, sacro, cresta ilíaca → surco intertubercular', 'Extensión, aducción y rotación interna', 'Toracodorsal (C6-C8)'],
        ['**Serrato anterior**', 'Costillas 1-8 → borde medial de la escápula', 'Fija la escápula contra el tórax', 'Torácico largo (C5-C7)'],
        ['**Trapecio**', 'Occipital, ligamento nucal, apófisis espinosas C7-T12 → clavícula, acromion, espina', 'Eleva, aduce y rota la escápula', 'Accesorio (XI par) y ramos cervicales'],
    ], fuente='Anatomía de referencia; Ramos Vértiz, Traumatología y Ortopedia, 2.ª ed., cap. 1 (anatomía aplicada del hombro).')
    u.box('tip', 'Manguito rotador: “SIRS”', ['**S**upraespinoso, **I**nfraespinoso, **R**edondo menor y **S**ubescapular. Los cuatro tendones **abrazan la cabeza humeral como los dedos de una mano** y la mantienen centrada en la glenoides (comparación de Ramos Vértiz).',
                                          'Se **rompe** con más frecuencia el **supraespinoso** (pasa debajo del acromion, en el espacio subacromial).'])
    u.h3('Brazo')
    u.tabla(['Músculo', 'Origen → inserción', 'Acción', 'Nervio'], [
        ['**Bíceps braquial**', 'Cabeza larga: tubérculo supraglenoideo; cabeza corta: apófisis coracoides → tuberosidad del radio y aponeurosis bicipital (lacertus fibrosus)', 'Flexión del codo y **supinación** (con el codo flexionado)', 'Musculocutáneo (C5-C6)'],
        ['**Braquial**', 'Mitad distal de la cara anterior del húmero → apófisis coronoides del cúbito', 'Flexión del codo (el flexor “puro”)', 'Musculocutáneo (y radial en una parte)'],
        ['**Coracobraquial**', 'Apófisis coracoides → tercio medio de la cara medial del húmero', 'Flexión y aducción del brazo', 'Musculocutáneo (lo atraviesa)'],
        ['**Tríceps braquial**', 'Cabeza larga: tubérculo infraglenoideo; laterales y medial: cara posterior del húmero → olécranon', 'Extensión del codo', 'Radial (C6-C8)'],
    ], fuente='Anatomía de referencia.')
    u.h3('Antebrazo')
    u.tabla(['Compartimento', 'Músculo', 'Origen → inserción', 'Acción', 'Nervio'], [
        ['Anterior', '**Pronador redondo**', 'Epitróclea y coronoides → cara lateral del radio (tercio medio)', 'Pronación', 'Mediano'],
        ['Anterior', '**Flexor radial del carpo**', 'Epitróclea → base del 2.º metacarpiano', 'Flexión y abducción de la muñeca', 'Mediano'],
        ['Anterior', '**Palmar largo**', 'Epitróclea → aponeurosis palmar', 'Tensa la aponeurosis (falta en cerca del 15 %)', 'Mediano'],
        ['Anterior', '**Flexor cubital del carpo**', 'Epitróclea y olécranon → pisiforme, ganchoso y 5.º metacarpiano', 'Flexión y aducción de la muñeca', 'Cubital'],
        ['Anterior', '**Flexor superficial de los dedos**', 'Epitróclea, coronoides y radio → falange media de los dedos 2-5', 'Flexión de la IFP', 'Mediano'],
        ['Anterior', '**Flexor profundo de los dedos**', 'Cúbito y membrana interósea → falange distal de los dedos 2-5', 'Flexión de la IFD', 'Interóseo anterior (índice y medio) y cubital (anular y meñique)'],
        ['Anterior', '**Flexor largo del pulgar**', 'Radio y membrana interósea → falange distal del pulgar', 'Flexión de la IF del pulgar', 'Interóseo anterior'],
        ['Anterior', '**Pronador cuadrado**', 'Cúbito distal → radio distal', 'Pronación', 'Interóseo anterior'],
        ['Posterior', '**Braquiorradial**', 'Cresta supracondílea lateral → apófisis estiloides del radio', 'Flexión del codo (posición neutra)', 'Radial'],
        ['Posterior', '**Extensores radiales del carpo** (largo y corto)', 'Epicóndilo lateral → 2.º y 3.er metacarpiano', 'Extensión y abducción de la muñeca', 'Radial / interóseo posterior'],
        ['Posterior', '**Extensor de los dedos, del meñique y cubital del carpo**', 'Epicóndilo lateral → expansión dorsal; base del 5.º metacarpiano', 'Extensión de los dedos y la muñeca', 'Interóseo posterior'],
        ['Posterior', '**Supinador**', 'Epicóndilo, ligamento colateral y cúbito → radio proximal', 'Supinación', 'Interóseo posterior (lo atraviesa)'],
        ['Posterior', '**Abductor largo, extensor corto y extensor largo del pulgar; extensor del índice**', 'Cúbito, radio y membrana interósea → pulgar e índice', 'Abducción y extensión del pulgar; extensión del índice', 'Interóseo posterior'],
    ], fuente='Anatomía de referencia; Ramos Vértiz, Traumatología y Ortopedia, 2.ª ed., cap. 1.')
    u.box('tip', 'Flexores del carpo y epitróclea: “Pasa al médico”', ['La **epitróclea** (medial) es el origen común de los flexores y pronadores: **P**ronador redondo, **F**lexor radial, **P**almar largo, **F**lexor cubital (y el FDS). Se inervan por el **mediano**, excepto el FCU (cubital).',
                                                                      'El **epicóndilo** (lateral) es el origen de los extensores: por eso el “codo de tenista” (epicondilitis) duele en la cara lateral al extender la muñeca contra resistencia.'])
    u.h3('Mano: músculos intrínsecos')
    u.tabla(['Grupo', 'Músculos', 'Acción', 'Nervio'], [
        ['**Tenar**', 'Abductor corto del pulgar, oponente del pulgar, flexor corto del pulgar', 'Oposición, abducción y flexión del pulgar', 'Mediano (rama recurrente); la cabeza profunda del flexor corto, cubital'],
        ['**Aductor del pulgar**', 'Cabezas oblicua y transversa', 'Aducción del pulgar (pinza lateral)', 'Cubital (rama profunda)'],
        ['**Hipotenar**', 'Abductor del meñique, flexor corto, oponente y palmar corto', 'Mueve el meñique', 'Cubital'],
        ['**Lumbricales** (4)', 'Nacen de los tendones del FDP → expansión extensora', 'Flexión de MCF y extensión de IFP e IFD', '1.º y 2.º: mediano; 3.º y 4.º: cubital'],
        ['**Interóseos** (4 dorsales y 3 palmares)', 'Entre los metacarpianos', 'Dorsales abducen (DAB) y palmares aducen (PAD); flexionan la MCF', 'Cubital (rama profunda)'],
    ], fuente='Anatomía de referencia.')


def hombro_codo(u):
    u.h2('Hombro y codo: articulaciones, referencias y relaciones', intro='Las dos articulaciones donde más se luxa, se fractura y se lesionan nervios. Se estudian por estabilizadores, referencias palpables y vecinos en riesgo.')
    u.h3('Hombro (cintura escapular)')
    u.ul(['La **raíz del miembro** forma una unidad funcional con cinco articulaciones: esternoclavicular, **acromioclavicular**, **glenohumeral** (la más móvil), escapulotorácica y subacromial (espacio de deslizamiento del manguito bajo el acromion).',
          '**Glenohumeral**: cabeza humeral grande contra una cavidad glenoidea pequeña, con **rodete (labrum)** y cápsula laxa. **Estabilizadores**: el manguito rotador (dinámico) y los ligamentos glenohumerales con el labrum (estáticos). La parte **inferior** de la cápsula es la más débil: la luxación habitual es **anteroinferior**.',
          '**U ósea palpable** (Ramos Vértiz): clavícula, articulación acromioclavicular y espina de la escápula. Es el punto de partida de toda la exploración física del hombro.',
          '**Vía de acceso habitual**: surco **deltopectoral**, con la **vena cefálica** como guía (se rechaza lateralmente con el deltoides). La arteria circunfleja humeral posterior y el nervio axilar quedan por detrás.',
          '**Fractura de clavícula**: el fragmento medial se desplaza **hacia arriba** (esternocleidomastoideo) y el lateral **hacia abajo y adelante** (peso del brazo y pectoral mayor). Por detrás están los vasos subclavios y el plexo.'])
    u.box('clin', 'Luxación anterior de hombro: lo que tiene que decir el examinador', [['Hombro “en charretera”: pérdida del contorno redondeado del deltoides, cabeza humeral palpable por delante.',
                                                                                    '**Antes de reducir**: pulso radial, sensibilidad del parche axilar (nervio axilar), motilidad de mano.',
                                                                                    'Complicaciones: **nervio axilar** (el más frecuente), arteria axilar (en ancianos, con pared frágil), lesión del manguito y **fractura del troquíter**.']])
    u.h3('Codo')
    u.ul(['Tres articulaciones en una cápsula: **humerocubital** (bisagra), **humerorradial** y **radiocubital proximal** (pronosupinación). Estabilizan los **ligamentos colaterales** (el cubital es el más importante) y la geometría del olécranon.',
          '**Triángulo de Hueter**: epicóndilo, epitróclea y olécranon. En **extensión** están alineados; en **flexión de 90°** forman un triángulo isósceles. En la **luxación de codo** la relación se altera; en la **fractura supracondílea** se conserva.',
          '**Paleta humeral**: la fractura supracondílea es la del niño por caída con la mano extendida; el fragmento distal se desplaza hacia atrás y la **arteria braquial** y el **nervio mediano** quedan a pocos milímetros.',
          '**Canal epitroclear**: el nervio cubital pasa detrás de la epitróclea, protegido solo por piel y fascia. Una fractura de la epitróclea o una cirugía del codo lo ponen en riesgo.'])
    u.box('alerta', 'Cuatro signos de alarma en un codo fracturado (examen neurovascular)', [['**Pulso radial** y llenado capilar (arteria braquial).',
                                                                                         'Sensibilidad del **índice** y capacidad de hacer el signo “OK” (interóseo anterior del mediano).',
                                                                                         'Extensión del pulgar y de los dedos en la MCF (interóseo posterior).',
                                                                                         'Dolor desproporcionado y dolor con la extensión pasiva de los dedos (**síndrome compartimental**).']])


def bloqueos(u):
    u.h2('Anestesia local y bloqueos periféricos: dónde se infiltra y por qué', intro='La anestesia local y troncular de la mano se explica con tres puntos de referencia de la muñeca y los pedículos del dedo.')
    u.tabla(['Bloqueo', 'Punto de referencia', 'Dónde se infiltra', 'Zona anestesiada', 'Precaución'], [
        ['**Mediano** en la muñeca', 'Pliegue distal de la muñeca, entre el palmar largo y el flexor radial del carpo', 'En profundidad, unos 5 mm, bajo el retináculo', 'Palma lateral, 3 dedos y medio radiales', 'No inyectar dentro del nervio; parestesia = retirar la aguja'],
        ['**Cubital** en la muñeca', 'Tendón del flexor cubital del carpo, proximal al pisiforme', 'Radial al tendón del FCU, y un habón dorsal para la rama dorsal', 'Meñique y mitad cubital del anular, borde cubital de la mano', 'Arteria cubital junto al nervio: aspirar antes de inyectar'],
        ['**Radial superficial**', 'Tabaquera anatómica', 'Infiltración subcutánea “en brazalete” sobre el borde radial', 'Dorso radial de la mano', 'Vena cefálica y rama superficial subcutáneas'],
        ['**Digital** (Oberst)', 'Base del dedo, a ambos lados', 'Nervios digitales palmares y dorsales, a los lados de la falange proximal', 'Todo el dedo (el dorso solo hasta la IFP)', 'Volumen pequeño: demasiado líquido comprime los vasos del dedo'],
    ], fuente='Anatomía de referencia y técnica de anestesia locorregional (Giménez, Cirugía, 2.ª ed., 2025; Michans, Cirugía, 5.ª ed.).')
    u.p('El **bloqueo de Oberst** aprovecha que los nervios digitales corren a los costados de la falange. En la mano, la **infiltración local en el borde de la herida** suele alcanzar para heridas pequeñas; el bloqueo troncular se prefiere cuando la herida es extensa o se necesita explorar un tendón con el paciente colaborando.')
    u.box('clave', 'Regla para el oral', 'Siempre se explora **antes** de anestesiar: motilidad (cascada de los dedos, tendón por tendón) y sensibilidad (pulpejos). Después de anestesiar solo se puede explorar la **integridad anatómica visible** de la herida.')


def patologias_oral(u):
    u.h2('Anatomía aplicada a las patologías de la UP1: cómo se responde en el examen oral', intro='El tribunal no pregunta “nombre los nervios de la mano”, pregunta un caso. Acá están los casos de la unidad y la secuencia anatómica que tenés que recorrer en voz alta: **qué estructura, por qué está en riesgo, cómo lo descubro, qué hago**.')
    u.h3('1. Herida cortante profunda de la cara anterior de la muñeca o la mano')
    u.p('Se responde **de superficial a profundo** y **de radial a cubital**, porque es el orden en que las estructuras pueden haberse cortado:')
    u.tabla(['Plano / estructura', 'Dónde está en la muñeca', 'Si se lesiona…', 'Cómo lo busco'], [
        ['**Piel y tejido subcutáneo**', 'Pliegues de flexión de la muñeca', 'Solo herida superficial', 'Explorar la profundidad con visión directa'],
        ['**Palmar largo**', 'Línea media, superficial', 'Pérdida de tensión de la aponeurosis (poco relevante)', 'Oponer pulgar y meñique con la muñeca flexionada: se marca el tendón'],
        ['**Flexor radial del carpo**', 'Lateral al palmar largo', 'Flexión y abducción débiles', 'Flexión radial de la muñeca contra resistencia'],
        ['**Arteria radial**', 'Lateral al FCR', 'Sangrado, pulso ausente, Allen alterado', 'Pulso y test de Allen'],
        ['**Nervio mediano**', 'Entre palmar largo y FCR, **muy superficial**', 'Pérdida de sensibilidad del índice y debilidad de oposición', 'Pulpejo del índice, signo “OK”'],
        ['**Tendones flexores** (FDS y FDP)', 'Profundos al mediano', 'Dedos extendidos en la cascada; no flexionan IFP o IFD', 'Maniobras separadas para FDS y FDP'],
        ['**Nervio y arteria cubitales**', 'Lateral al FCU, junto al pisiforme', 'Hipoestesia del meñique, garra, isquemia', 'Pulpejo del meñique, abducción de dedos, Allen'],
        ['**Hueso** (radio, cúbito, carpo)', 'Plano profundo', 'Fractura expuesta', 'Radiografía de la región'],
    ], fuente='Anatomía de referencia; semiología según Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., caps. 11 y 15, y Ramos Vértiz, Traumatología y Ortopedia, 2.ª ed., cap. 1.')
    u.box('oral', 'Cómo lo decís', 'Una herida transversal en la cara anterior de la muñeca tiene tres riesgos mayores: **arteria radial o cubital**, **nervio mediano** (el más superficial: entre palmar largo y flexor radial del carpo) y **tendones flexores**. Antes de anestesiar examino perfusión (pulsos, Allen, llenado), sensibilidad por territorios autónomos (índice, meñique y dorso del primer espacio) y motilidad por tendones. Si hay déficit, es una **herida compleja** que va a quirófano con cirujano de mano, y se hace lavado, profilaxis antitetánica y cobertura antibiótica si corresponde.')
    u.h3('2. Herida en la cara palmar de un dedo: ¿qué se cortó?')
    u.ul(['**Cascada alterada** (el dedo queda más extendido que los vecinos) = tendón flexor seccionado.',
          '**FDS** cortado: pierde la flexión de la IFP. **FDP** cortado: pierde la flexión de la IFD. Si están **los dos**, el dedo queda sin flexión activa (zona II de Verdan).',
          '**Hipoestesia de un lado del pulpejo** = nervio digital propio. Se compara con el dedo vecino.',
          '**Palidez o dedo frío** = ambas arterias digitales.',
          'La **vaina flexora** es un espacio cerrado: la herida punzante de la cara palmar, pequeña, puede inocular gérmenes y producir tenosinovitis (**signos de Kanavel**).'])
    u.h3('Mapa final: patología de la unidad y estructura que tenés que nombrar')
    u.tabla(['Patología o situación', 'Estructuras anatómicas', 'Módulo de esta guía'], [
        ['Herida cortante de mano', 'Tendones flexores y extensores, nervios digitales, mediano, cubital, arterias digitales y arcos', 'Muñeca y mano; nervios; arterias'],
        ['Fractura de clavícula y luxación de hombro', 'Plexo, subclavia, axilar, nervio axilar, manguito', 'Hombro y codo; plexo; esqueleto'],
        ['Fractura supracondílea y de codo', 'Braquial, mediano, cubital, radial, compartimento', 'Hombro y codo; arterias; regiones'],
        ['Fractura de diáfisis humeral', 'Radial, braquial profunda', 'Nervios; esqueleto'],
        ['Fractura de antebrazo, Colles y escafoides', 'Interóseo posterior, mediano, irrigación del escafoides', 'Esqueleto; mano'],
        ['Síndrome compartimental', 'Compartimentos y fascias del antebrazo y la mano', 'Regiones'],
        ['Anestesia local, troncular y regional', 'Nervios digitales, mediano, cubital, plexo, neuroeje', 'Bloqueos; plexo; columna'],
        ['Intubación traqueal', 'Laringe, vallécula, epiglotis, cuerdas, tráquea y carina', 'Vía aérea'],
        ['Infección de mano', 'Vainas sinoviales, espacios profundos, linfáticos', 'Mano; linfáticos'],
        ['Cicatrización', 'Capas de la piel y líneas de tensión', 'Piel'],
    ])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad (anatomía aplicada y radiografías)')
    u.ul(['Ramos Vértiz, A. __Traumatología y Ortopedia__, 2.ª ed. (2012), cap. 1: «Anatomía aplicada y movilidad articular».',
          'Silberman, F. y Varaona, O. __Ortopedia y Traumatología__, 3.ª ed., Editorial Médica Panamericana: caps. 11, 14, 15, 16 y 52-57.',
          'Orrego, M. y Morán, M. __Ortopedia y Traumatología Básica__ (2014): radiografías y esquemas de fracturas.',
          'Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025), Editorial Médica Panamericana: anestesia, herida y cicatrización.',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: anestesiología, herida y vías aéreas.',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: lesiones de la mano y patrones de fractura.',
          'Qayumi, A. K. __Técnicas quirúrgicas básicas__ (2012), Manual Moderno.',
          'ATLS, __Apoyo vital avanzado en trauma__, 11.ª ed. (2025): vía aérea.'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de estos atlas y libros y de la anatomía de referencia; **no está transcripto de un libro en particular**. Las láminas de los atlas muestran la **anatomía real y sus rótulos**: ante cualquier duda, **la lámina manda**. Contrastá siempre con tu atlas antes del examen.')
    u.h3('Otras imágenes')
    u.ul(['**OpenStax College, Anatomy & Physiology** (Universidad Rice), licencia **CC BY 3.0**: capas de la epidermis y vista laringoscópica (Wikimedia Commons).',
          'Los esquemas del plexo braquial en cajas y los flujos son **de elaboración propia** de NikaMed.'])
