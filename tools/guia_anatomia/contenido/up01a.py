# -*- coding: utf-8 -*-
"""UP 1 · Anatomía quirúrgica. Parte A: piel y planos, vía aérea, columna y neuroeje (anatomía de la anestesia)."""
from lib import svg, txt, caja, flecha, codo, flujo
from .fotos import fotos


def piel(u):
    u.h2('Piel, planos de una herida y líneas de tensión', intro='Antes de suturar hay que saber qué capas se están cortando, por dónde viene la sangre y qué nervio da la sensibilidad. Es la base de la herida, de la sutura y de la cicatrización.')
    u.h3('Las tres capas y lo que hay en cada una')
    u.tabla(['Capa', 'Qué la forma', 'Irrigación e inervación', 'Para qué te sirve'], [
        ['Epidermis', 'Epitelio plano estratificado queratinizado (estratos basal, espinoso, granuloso, lúcido —solo en palma y planta— y córneo). **Sin vasos**.', 'Se nutre por difusión desde la dermis. Terminaciones nerviosas libres.', 'Las heridas que solo la afectan (abrasión) curan por reepitelización desde folículos y bordes, sin cicatriz.'],
        ['Dermis', 'Papilar (laxa, con asas capilares) y reticular (colágeno denso, orienta las líneas de tensión). Anexos: folículos, glándulas sebáceas y sudoríparas.', 'Plexos arteriales subpapilar y dérmico profundo. Receptores de tacto, presión, dolor y temperatura.', 'Es la capa que da resistencia a la sutura: el punto debe tomar dermis, no solo epidermis.'],
        ['Hipodermis (tejido celular subcutáneo)', 'Grasa y tabiques fibrosos, fascia superficial.', 'Vasos perforantes y venas superficiales. Nervios cutáneos.', 'Espacio muerto: si queda sin cerrar acumula sangre o suero y se infecta.'],
    ], fuente='Anatomía de referencia (histología y anatomía de la piel); aplicación quirúrgica según Giménez, Cirugía, 2.ª ed. (2025).')
    fotos(u, 'epidermis')
    u.h3('Planos que se cruzan al abordar el miembro superior')
    u.p('De superficial a profundo: **piel → tejido celular subcutáneo (con venas y nervios cutáneos) → fascia profunda o aponeurosis → músculo → periostio/hueso**. En la mano la piel palmar es gruesa, sin vello, con estrato lúcido y fuertemente adherida a la aponeurosis palmar por tabiques fibrosos; la dorsal es fina y laxa. Por eso el edema se ve en el dorso aunque la inflamación esté en la palma.')
    u.box('clave', 'Regla de planos', ['Una herida que **no atraviesa la dermis** no necesita puntos profundos; una que llega a la fascia **obliga a explorar** (tendón, nervio, arteria) antes de cerrar.',
                                       'En la mano, los nervios y vasos digitales están **inmediatamente debajo de la dermis palmar-lateral**: un corte “superficial” puede haberlos seccionado.'])
    u.h3('Líneas de tensión de la piel')
    u.ul(['**Líneas de Langer**: dirección de las fibras de colágeno dérmico (descriptas en cadáveres). **Líneas de tensión de la piel en reposo** (RSTL) y **pliegues**: las que realmente se usan hoy para planear la incisión.',
          'Una incisión **paralela** a las líneas de tensión sufre menos tracción lateral y deja una cicatriz fina; una **perpendicular** se separa, se ensancha o forma queloide.',
          '**Mano**: no cruzar los pliegues de flexión en ángulo recto (retracción cicatrizal y contractura). Se usan incisiones en zigzag de Bruner o mediolaterales en los dedos.',
          'Zonas con tendencia a queloide e hipertrofia: región preesternal, hombro y deltoides, lóbulo, parte alta de la espalda.'])
    u.h3('Inervación cutánea segmentaria del miembro superior (dermatomas)')
    u.tabla(['Raíz', 'Territorio de piel', 'Dónde lo comprobás'], [
        ['C4', 'Parte alta del hombro (acromion)', 'Epaulette: límite cuello-brazo'],
        ['C5', 'Cara lateral del brazo (deltoides)', 'Cara externa del hombro y brazo'],
        ['C6', 'Antebrazo lateral y pulgar', 'Pulpejo del pulgar'],
        ['C7', 'Dedo medio', 'Pulpejo del dedo medio'],
        ['C8', 'Dedo meñique y borde cubital de la mano', 'Pulpejo del meñique'],
        ['T1', 'Cara medial del antebrazo y brazo distal', 'Cara medial del codo'],
        ['T2', 'Axila y cara medial proximal del brazo (nervio intercostobraquial)', 'Fondo de la axila'],
    ], fuente='Anatomía de referencia (dermatomas del miembro superior). Los dermatomas se superponen: la pérdida de un solo territorio puede pasar inadvertida.')
    u.box('simple', None, 'Para recordar los dermatomas de los dedos: **pulgar C6, medio C7, meñique C8**. El anular se reparte entre C7 y C8, y el índice entre C6 y C7. Si cerrás la mano en “OK” con el pulgar y el índice, estás tocando C6.')
    u.h3('Irrigación y drenaje cutáneos')
    u.p('La piel recibe sangre por **vasos perforantes**: musculocutáneos (atraviesan el músculo) y fasciocutáneos (siguen los tabiques). Esa organización explica por qué un colgajo con base amplia sobrevive y una herida en “lengüeta” de base estrecha se necrosa en la punta. El drenaje linfático superficial sigue a las venas hacia los ganglios epitrocleares y axilares.')


def via_aerea(u):
    u.h2('Vía aérea e intubación: anatomía aplicada', intro='La intubación traqueal figura en el programa. Entender los ejes, el vestíbulo laríngeo y la inervación explica la técnica, las complicaciones y la vía aérea quirúrgica.')
    u.h3('Del orificio nasal a la tráquea')
    u.tabla(['Segmento', 'Puntos anatómicos que importan', 'Relevancia práctica'], [
        ['Nariz y fosas nasales', 'Tabique, cornetes y meatos. En el tabique anterior, el **área de Kiesselbach** (anastomosis de ramas de la carótida interna y externa).', 'Sangrado con la intubación o sonda nasal (epistaxis). Contraindicación relativa si hay fractura de base de cráneo.'],
        ['Boca y lengua', 'Dientes, paladar duro y blando, úvula, pilares. Lengua: se inserta en el hioides.', 'Apertura bucal, dentadura y tamaño de la lengua determinan la dificultad. Se evalúan con **Mallampati**.'],
        ['Faringe', 'Nasofaringe, orofaringe y **laringofaringe** (hipofaringe). Vallécula entre la base de la lengua y la epiglotis; senos piriformes a los lados de la laringe.', 'La pala curva (Macintosh) se apoya en la vallécula; la recta (Miller) levanta la epiglotis directamente. Un falso trayecto suele perforar el seno piriforme.'],
        ['Laringe', 'Esqueleto cartilaginoso, cuerdas vocales y glotis. Entre **C3-C4 y C6** en el adulto.', 'Es el punto donde se coloca el tubo y donde ocurren el laringoespasmo y el edema.'],
        ['Tráquea', 'Tubo de 10-12 cm, con 16-20 anillos cartilaginosos en “C” (abiertos hacia atrás, hacia el esófago). Va de **C6 a T4-T5** (carina).', 'La carina marca el límite del tubo: demasiado profundo entra en el bronquio derecho.'],
    ], fuente='Anatomía de referencia; aplicación a intubación según Giménez, Cirugía, 2.ª ed. (2025), anestesia, y Michans, Cirugía, 5.ª ed., anestesiología.')
    u.h3('Laringe: esqueleto, músculos, nervios y vasos')
    u.ul(['**Cartílagos impares**: tiroides (la “nuez”), cricoides (único anillo completo; es el límite inferior de la laringe) y epiglotis. **Pares**: aritenoides, corniculados y cuneiformes.',
          '**Membranas**: tirohioidea y **cricotiroidea** (entre tiroides y cricoides). La cricotiroidea mide aproximadamente 1 cm de alto por 2-3 cm de ancho y es **superficial**: es el punto de acceso quirúrgico de emergencia.',
          '**Glotis**: es la porción más estrecha de la vía aérea en el **adulto**; en el **niño menor de 8 años** lo es la zona subglótica a nivel del cricoides (por eso se usan tubos sin balón o con balón de bajo volumen).',
          '**Músculos**: todos los intrínsecos los inerva el **nervio laríngeo recurrente** (rama del vago), **excepto el cricotiroideo**, que tensa las cuerdas y lo inerva la rama externa del laríngeo superior.',
          '**Sensibilidad**: por encima de las cuerdas, rama **interna del laríngeo superior**; por debajo, el **recurrente**.',
          '**Irrigación**: arteria laríngea superior (de la tiroidea superior, rama de la carótida externa) y laríngea inferior (de la tiroidea inferior, tronco tirocervical).'])
    u.box('alerta', 'El recurrente no tiene el mismo recorrido de los dos lados', ['**Derecho**: rodea la arteria subclavia. **Izquierdo**: rodea el arco aórtico (ligamento arterioso) y es más largo. Ambos ascienden en el **surco traqueoesofágico** hacia la laringe, pasando cerca de la arteria tiroidea inferior.',
                                                                                 'Es el nervio en riesgo en tiroidectomías, por eso aparece de nuevo en UP7. La lesión unilateral produce **disfonía**; la bilateral, **estridor y obstrucción**.'])
    fotos(u, 'laringoscopia')
    u.h3('Las tres relaciones que importan para intubar')
    u.ul(['Tres ejes: **oral, faríngeo y laríngeo** no están alineados. La **posición de olfateo** (flexión del cuello y extensión de la cabeza sobre la columna cervical) los acerca.',
          'La laringoscopia **no ve** la glotis: se **levanta la base de la lengua y la epiglotis** con la fuerza hacia adelante y arriba (no haciendo palanca sobre los dientes).',
          'Los grados de **Cormack-Lehane** describen lo que se ve: I (glotis completa), II (parte posterior de la glotis), III (solo la epiglotis) y IV (ni siquiera la epiglotis).'])
    u.h3('Tráquea y bronquios: relaciones')
    u.ul(['**Cervical**: por delante, el **istmo tiroideo** (anillos 2.º a 4.º), el arco venoso yugular y las venas tiroideas inferiores; a los lados, lóbulos tiroideos y paquetes carotídeos; por detrás, el esófago.',
          '**Torácica**: por delante, el esternón, el timo y el arco aórtico; a la derecha, la vena ácigos y la pleura; a la izquierda, el arco aórtico.',
          'El **bronquio derecho** es más corto, ancho y vertical (unos 25º respecto de la línea media, contra 45º del izquierdo): la intubación **selectiva** y la aspiración de cuerpos extraños son más frecuentes de ese lado.',
          '**Traqueostomía**: abordaje habitual entre el **2.º y 3.º anillo** (por debajo del istmo o seccionándolo). Se debe evitar el 1.º anillo por estenosis subglótica.'])
    u.box('clin', 'Complicaciones de la intubación y su base anatómica', [['Trauma dental y de labios, lengua y faringe: palanca sobre los dientes, apertura insuficiente.',
                                                                        'Intubación **esofágica**: la entrada del esófago está inmediatamente por detrás de la laringe. Se confirma con capnografía.',
                                                                        'Intubación **endobronquial derecha**: tubo introducido más allá de la carina.',
                                                                        'Lesión de cuerdas vocales, aritenoides (luxación) y edema subglótico (sobre todo en niños).',
                                                                        'Estenosis **traqueal** por balón sobreinflado (presión sobre la mucosa en el sitio del manguito).',
                                                                        'Laringoespasmo, broncoespasmo y aspiración del contenido gástrico.']])
    u.box('clave', 'Vía aérea quirúrgica: dónde está', 'Membrana **cricotiroidea**: se palpa el **hueco entre el cartílago tiroides y el cricoides** en la línea media, por debajo de la nuez. Es una estructura superficial, poco vascularizada, sin tejido tiroideo adelante (el istmo queda más abajo). Por eso se prefiere a la traqueostomía en una emergencia.')


def columna(u):
    u.h2('Columna vertebral y neuroeje: anatomía de la raquianestesia y la peridural', intro='El programa pide técnica, indicaciones, accidentes y secuelas de la anestesia raquídea y peridural. Todas se explican por capas, niveles y contenido del canal.')
    u.h3('Columna: lo mínimo que tenés que saber')
    u.ul(['**33 vértebras**: 7 cervicales, 12 torácicas, 5 lumbares, 5 sacras (fusionadas) y 4 coccígeas. **Curvaturas**: lordosis cervical y lumbar, cifosis torácica y sacra.',
          'La **médula espinal** termina en **L1-L2** en el adulto (cono medular; en el recién nacido llega a L3). Debajo está la **cola de caballo** (cauda equina), que flota en el LCR.',
          'El **saco dural** termina en **S2**. Esto permite pinchar por debajo de L2 sin tocar la médula.',
          'La **línea de Tuffier** (que une las dos crestas ilíacas) cruza **L4** o el espacio **L4-L5**. Es la referencia para la punción lumbar.'])
    u.h3('Capas que atraviesa la aguja, de superficial a profundo (abordaje medial)')
    u.tabla(['#', 'Estructura', 'Qué se siente', 'Qué se confirma'], [
        ['1', 'Piel y tejido celular subcutáneo', 'Pinchazo', '—'],
        ['2', 'Ligamento supraespinoso', 'Resistencia firme', 'Línea media'],
        ['3', 'Ligamento interespinoso', 'Resistencia gomosa', 'Entre dos apófisis espinosas'],
        ['4', 'Ligamento amarillo (flavum)', 'Resistencia marcada, “duro” y luego “clic”', 'Límite posterior del espacio epidural'],
        ['5', '**Espacio epidural**', '**Pérdida de resistencia** (técnica de la peridural)', 'Contiene grasa, plexos venosos (de Batson) y raíces. Anestesia peridural: se inyecta acá.'],
        ['6', 'Duramadre y aracnoides (espacio subdural virtual)', 'Segundo “clic”', '—'],
        ['7', '**Espacio subaracnoideo**', '**Salida de LCR** por la aguja', 'Anestesia raquídea: se inyecta acá.'],
    ], fuente='Anatomía de referencia; técnica de anestesia neuroaxial según Giménez, Cirugía, 2.ª ed. (2025) y Michans, Cirugía, 5.ª ed., anestesiología.')
    u.h3('Raquídea y peridural: diferencias anatómicas y clínicas')
    u.tabla(['', 'Raquídea (subaracnoidea)', 'Peridural (epidural)'], [
        ['Espacio', 'Subaracnoideo (LCR)', 'Epidural (grasa, venas)'],
        ['Nivel de punción', 'Debajo de L2: **L3-L4 o L4-L5**', 'Cualquier nivel: lumbar, torácico, cervical o caudal (hiato sacro)'],
        ['Dosis', 'Pequeña (mL)', 'Grande (decenas de mL)'],
        ['Inicio y bloqueo', 'Rápido, denso y simétrico', 'Más lento, segmentario, a veces asimétrico'],
        ['Complicación característica', 'Cefalea pospunción (pérdida de LCR)', 'Punción dural accidental, inyección intravascular o subaracnoidea'],
    ], fuente='Anatomía de referencia y Giménez, Cirugía, 2.ª ed. (2025).')
    u.h3('Qué nivel de bloqueo necesito')
    u.tabla(['Dermatoma', 'Referencia', 'Qué cirugía permite'], [
        ['T4', 'Línea de los pezones', 'Cesárea, cirugía de abdomen superior (bloqueo alto)'],
        ['T6', 'Apéndice xifoides', 'Cirugía abdominal alta'],
        ['T10', 'Ombligo', 'Hernia, cirugía urológica y ginecológica baja'],
        ['L1', 'Ingle', 'Cirugía de la extremidad inferior y perineo'],
        ['S2-S4', 'Periné', 'Cirugía anorrectal, perineal'],
    ])
    u.h3('Accidentes y secuelas con base anatómica')
    u.ul(['**Hipotensión y bradicardia**: el bloqueo simpático (fibras preganglionares **T1-L2**) produce vasodilatación y reducción del retorno venoso. Si el bloqueo sube a **T1-T4** se bloquean las fibras cardioaceleradoras y aparece **bradicardia** marcada.',
          '**Cefalea pospunción**: pérdida de LCR por el orificio dural; es **postural** (mejora acostado), frontal u occipital y aparece a las 24-72 h. Se previene con **agujas de punta de lápiz** y de menor calibre.',
          '**Hematoma epidural**: sangrado en el espacio epidural (plexos venosos) en pacientes anticoagulados o con coagulopatía. Compresión medular o de la cola de caballo: **urgencia quirúrgica**.',
          '**Bloqueo espinal total**: la peridural inyectada por error en el espacio subaracnoideo llega a niveles cervicales. Hipotensión, apnea y pérdida de conciencia.',
          '**Retención urinaria**: bloqueo de las raíces **S2-S4** (inervación del detrusor).',
          '**Infección**: meningitis o absceso epidural por falta de asepsia.'])
    u.box('clave', 'Irrigación de la médula (para cirugía vascular y trauma medular)', ['**Arteria espinal anterior** (única, medial: irriga los 2/3 anteriores) y **dos espinales posteriores**. Se refuerzan con arterias radiculares.',
                                                                                   'La **arteria radicular magna (de Adamkiewicz)** entra típicamente entre **T9 y L2**, más a menudo por la izquierda. Su compromiso en la cirugía de la aorta toracoabdominal produce **paraplejía** con conservación de la sensibilidad profunda (síndrome de la arteria espinal anterior).'])
