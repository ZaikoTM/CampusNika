# -*- coding: utf-8 -*-
"""UP 2 · Anatomía quirúrgica del abdomen agudo. Parte A: pared abdominal y hernias, peritoneo, inervación y dolor, irrigación."""
from .up01e import N, G, L, oral


def pared(u):
    u.h2('Pared abdominal, regiones y hernias', intro='Toda exploración del abdomen agudo empieza por la pared: por ahí se palpa, se incide y por ahí también se obstruye el intestino (hernias). Se estudia por regiones, planos, vasos y nervios.')
    u.h3('Regiones y cuadrantes')
    u.tabla(['Región', 'Vísceras que se proyectan (referencia clínica)'], [
        ['**Hipocondrio derecho**', 'Hígado, vesícula, ángulo hepático del colon'],
        ['**Epigastrio**', 'Estómago, duodeno, páncreas, lóbulo izquierdo del hígado'],
        ['**Hipocondrio izquierdo**', 'Bazo, cola del páncreas, ángulo esplénico del colon'],
        ['**Flanco y fosa lumbar derechos**', 'Colon ascendente, riñón y uréter derechos'],
        ['**Mesogastrio (periumbilical)**', 'Intestino delgado, raíz del mesenterio, aorta'],
        ['**Flanco izquierdo**', 'Colon descendente, riñón y uréter izquierdos'],
        ['**Fosa ilíaca derecha (FID)**', '**Ciego y apéndice**, íleon terminal, anexo derecho, uréter derecho, músculo psoas'],
        ['**Hipogastrio**', 'Vejiga, útero y asas ileales, sigmoides'],
        ['**Fosa ilíaca izquierda**', 'Sigmoides, anexo izquierdo, uréter izquierdo'],
    ], fuente='Anatomía de referencia; Azato y Waisman, Abdomen agudo, cap. 3-4 (anamnesis y examen físico).')
    u.h3('Planos de la pared anterolateral (de superficial a profundo)')
    u.ul(['**Piel y tejido celular subcutáneo**, con la fascia de **Camper** (grasa) y la de **Scarpa** (membranosa, por debajo del ombligo).',
          '**Oblicuo externo**: fibras hacia abajo y adentro (como “las manos en los bolsillos”); su aponeurosis forma el ligamento inguinal. **Oblicuo interno**: fibras en abanico, perpendiculares a las del externo. **Transverso del abdomen**: fibras horizontales.',
          '**Recto del abdomen** dentro de su **vaina**, con la línea alba en la línea media y la **línea semilunar (de Spiegel)** en el borde externo del recto.',
          '**Fascia transversalis**, grasa preperitoneal y **peritoneo parietal**.'])
    u.box('clave', 'Vaina del recto y línea arcuata (de Douglas)', ['Por **encima** de la línea arcuata (unos 3-5 cm por debajo del ombligo) la aponeurosis del oblicuo interno se desdobla y las hojas rodean al recto por delante y por detrás.',
                                                                    'Por **debajo** de ella **todas las aponeurosis pasan por delante del recto**: atrás solo quedan la fascia transversalis y el peritoneo. Por eso los hematomas de la vaina por debajo de la línea arcuata se parecen a una masa en la FID.'])
    u.h3('Irrigación e inervación de la pared')
    u.ul(['**Arterias**: epigástrica **superior** (rama de la torácica interna) y epigástrica **inferior** (rama de la ilíaca externa) se anastomosan **dentro de la vaina del recto**; además las intercostales inferiores, lumbares y la circunfleja ilíaca profunda. La epigástrica inferior es la referencia para separar las **hernias inguinales directas** (medial) de las **indirectas** (lateral).',
          '**Nervios**: segmentarios **T7-T12** (intercostales y subcostal) y **L1** (**iliohipogástrico** e **ilioinguinal**). El ombligo es el dermatoma **T10**. Los nervios corren entre el oblicuo interno y el transverso: una incisión transversa o una sutura mal ubicada puede lesionarlos (hipoestesia, dolor crónico o hernia).'])
    u.h3('Referencias de superficie e incisiones')
    u.tabla(['Referencia o incisión', 'Dónde está', 'Para qué se usa'], [
        ['**Punto de McBurney**', 'Unión del tercio externo con los dos tercios internos de la línea que va de la espina ilíaca anterosuperior al ombligo', 'Máxima sensibilidad en la apendicitis (proyección de la base del apéndice)'],
        ['**Punto de Lanz**', 'Unión del tercio derecho con el medio de la línea bi-espinoilíaca', 'Proyección alternativa de la base del apéndice'],
        ['**Incisión de McBurney o de Rockey-Davis**', 'Oblicua o transversa sobre el punto, **separando las fibras** de los tres músculos anchos', 'Apendicectomía abierta. Capas: piel, Camper, Scarpa, oblicuo externo, interno y transverso, fascia transversalis y peritoneo. Riesgo: nervios iliohipogástrico e ilioinguinal'],
        ['**Laparotomía mediana**', 'Sobre la línea alba', 'Abdomen agudo no localizado (peritonitis, perforación, isquemia)'],
        ['**Incisión de Kocher (subcostal)**', 'Paralela al reborde costal derecho', 'Vía biliar y vesícula'],
        ['**Incisión de Pfannenstiel**', 'Transversa suprapúbica', 'Pelvis: cesárea, ginecología'],
    ], fuente='Anatomía de referencia; Giménez, Cirugía, 2.ª ed., cap. 70 (apendicitis aguda) y cap. 84 (abdomen agudo quirúrgico).')
    u.h3('Atlas: pared abdominal')
    N(u, 'S-211', 'Pared anterior del abdomen: disección superficial.', ['Oblicuo externo y su aponeurosis; nervios y vasos cutáneos.'], 190)
    N(u, 'S-212', 'Pared anterior del abdomen: disección intermedia.', ['Oblicuo interno, recto y nervios iliohipogástrico e ilioinguinal.'], 190)
    N(u, 'S-213', 'Pared anterior del abdomen: disección profunda.', ['Transverso del abdomen y recto con la vaina abierta.'], 190)
    N(u, 'S-214', 'Vaina del músculo recto del abdomen: cortes transversales.', ['Arriba y abajo de la línea arcuata: dónde pasa cada aponeurosis.'], 175)
    N(u, 'S-336', 'Arterias de la pared anterior del abdomen.', ['Anastomosis entre la epigástrica superior e inferior.'], 190)
    N(u, 'S-102', 'Nervios de la pared anterior del abdomen.', ['Territorios segmentarios y trayecto entre oblicuo interno y transverso.'], 190)
    G(u, 166, 'Pared abdominal anterior (Gray).', ['Compará capas y relaciones.'], 190)
    u.h3('Hernias de la pared como causa de abdomen agudo')
    u.tabla(['Hernia', 'Anatomía del orificio', 'Por qué obstruye o se estrangula'], [
        ['**Inguinal indirecta**', 'Pasa por el **anillo inguinal profundo** (lateral a los vasos epigástricos inferiores) y recorre el conducto inguinal', 'Es la más frecuente en el hombre; el cuello puede ser estrecho'],
        ['**Inguinal directa**', 'Protruye por el **triángulo de Hesselbach** (medial a los vasos epigástricos inferiores, por detrás del ligamento inguinal y lateral al recto)', 'Cuello ancho: se estrangula con menos frecuencia'],
        ['**Crural (femoral)**', 'Pasa por el **anillo crural**, por debajo del ligamento inguinal y **medial a la vena femoral**; límites: ligamento inguinal, ligamento pectíneo (de Cooper), vena femoral y ligamento lacunar (de Gimbernat)', 'Orificio rígido y estrecho: **alto riesgo de estrangulación**; típica de la mujer mayor'],
        ['**Umbilical y epigástrica**', 'Defecto de la línea alba', 'Estrangulación del epiplón o del intestino'],
        ['**Incisional (eventración)**', 'Defecto de una cicatriz previa', 'Obstrucción por adherencias'],
        ['**Spiegel**', 'Línea semilunar, por debajo de la línea arcuata', 'Hernia “interparietal”, difícil de palpar'],
    ], fuente='Anatomía de referencia; Giménez, Cirugía, 2.ª ed., capítulos de hernias; Netter, láminas S-215 y S-217.')
    N(u, 'S-215', 'Conducto inguinal y cordón espermático.', ['Anillos superficial y profundo, paredes del conducto y contenido.'], 190)
    N(u, 'S-217', 'Pared anterior del abdomen: visión interna.', ['Fosas inguinales lateral, medial y supravesical con los vasos epigástricos inferiores; fosa femoral.'], 190)
    G(u, 161, 'Canal inguinal en el hombre (Gray).', ['Paredes, anillos y contenido del conducto.'], 190)
    G(u, 165, 'Hernias inguinales (Gray).', ['Compará la hernia directa con la indirecta respecto de los vasos epigásticos inferiores.'], 190)
    oral(u, 'La pared abdominal tiene, de superficial a profundo, piel, tejido celular con las fascias de Camper y Scarpa, los tres músculos anchos (oblicuo externo, interno y transverso), la fascia transversalis y el peritoneo parietal; el recto está en su vaina y por debajo de la **línea arcuata** todas las aponeurosis pasan por delante. Se irriga por las **epigástricas superior e inferior**, anastomosadas dentro de la vaina, y se inerva por **T7-T12 y L1** (ilioinguinal e iliohipogástrico). Para la apendicitis uso el **punto de McBurney** y la incisión de McBurney o Rockey-Davis, que **separa las fibras** de los tres músculos. Ante un abdomen agudo obstructivo siempre busco las **hernias** en los orificios: la **crural** (por debajo del ligamento inguinal, medial a la vena femoral) es la que más se estrangula; en la inguinal, la **epigástrica inferior** separa la directa (medial) de la indirecta (lateral).')


def peritoneo(u):
    u.h2('Peritoneo y cavidad peritoneal: por dónde se extiende la infección', intro='El peritoneo explica el dolor localizado, la defensa, el plastrón, el absceso y la peritonitis. Hay que saber cuáles son las hojas, los repliegues y los espacios declives.')
    u.h3('Conceptos base')
    u.ul(['**Peritoneo parietal**: recubre la pared; lo inervan los **nervios espinales** (T6-L1): el dolor es **agudo, localizado y aumenta con el movimiento**; produce defensa y contractura.',
          '**Peritoneo visceral**: recubre las vísceras; lo inerva el sistema **autónomo**: el dolor es **difuso, sordo, en la línea media**.',
          '**Cavidad peritoneal mayor** y **menor (bolsa omental o transcavidad de los epiplones)**, que se comunican por el **foramen epiploico (de Winslow)**.',
          '**Repliegues**: **epiplón mayor** (de la curvatura mayor al colon transverso; “policía del abdomen”, se adhiere a los focos inflamatorios), **epiplón menor** (hepatogástrico y hepatoduodenal), **mesenterio** (del ángulo duodenoyeyunal a la fosa ilíaca derecha, con la arteria mesentérica superior), **mesocolon transverso y sigmoide**, **ligamento falciforme**.',
          '**Intraperitoneales**: estómago, yeyuno, íleon, ciego y apéndice, colon transverso y sigmoides, hígado y bazo. **Retroperitoneales**: duodeno (salvo la primera porción), páncreas, colon ascendente y descendente, riñones, uréteres, aorta y cava. Una perforación retroperitoneal da menos peritonitis y más dolor de espalda y gas en el retroperitoneo.'])
    u.h3('Espacios y recesos: dónde se acumula el líquido')
    u.tabla(['Espacio', 'Límites o relaciones', 'Qué se acumula'], [
        ['**Subfrénicos** (derecho e izquierdo)', 'Entre el diafragma y el hígado (derecho) o el bazo y el estómago (izquierdo)', 'Absceso subfrénico tras perforación o cirugía; dolor referido al hombro'],
        ['**Subhepático** y **receso hepatorrenal (bolsa de Morison)**', 'Entre el hígado y el riñón derecho; punto declive en decúbito supino', 'Líquido libre en la eco FAST; pus de una úlcera perforada'],
        ['**Goteras parietocólicas**', 'A los lados de los colones ascendente y descendente. La **derecha** comunica el espacio subhepático con la **fosa ilíaca derecha y la pelvis**', 'El contenido de una **úlcera duodenal perforada** puede bajar por la gotera derecha y simular una apendicitis'],
        ['**Fondo de saco de Douglas** (rectouterino) o excavación rectovesical', 'Es el **punto más declive** de la cavidad en la posición de pie o sentada', 'Absceso pélvico tras apendicitis perforada o diverticulitis; se palpa en el **tacto rectal o vaginal**'],
        ['**Fosa ilíaca derecha**', 'Receso ileocecal superior e inferior y receso retrocecal alrededor del ciego', 'Absceso o plastrón apendicular'],
    ], fuente='Anatomía de referencia; Netter, láminas S-418, S-419, S-422 y S-424; Gray, págs. 169-171.')
    N(u, 'S-418', 'Pared y vísceras abdominales: corte paramediano (sagital).', ['Epiplón mayor, mesocolon transverso y mesenterio; recto-vesical o fondo de saco de Douglas.'], 190)
    G(u, 169, 'Cavidad peritoneal (Gray).', ['Cavidades mayor y menor; recesos subfrénico, hepatorrenal y pélvico.'], 190)
    G(u, 170, 'Proyección sagital del abdomen (Gray).', ['Relaciones de las vísceras con el peritoneo.'], 190)
    G(u, 171, 'Corte coronal del abdomen (Gray).', ['Espacios subfrénicos, subhepático y goteras parietocólicas.'], 190)
    N(u, 'S-416', 'Bolsa omental (transcavidad de los epiplones).', ['Estómago reclinado: la cara posterior de la bolsa omental y el páncreas.'], 190)
    N(u, 'S-419', 'Peritoneo de la pared posterior del abdomen.', ['Raíz del mesenterio y mesocolon; límites de los órganos retroperitoneales.'], 190)
    N(u, 'S-422', 'Mesenterios y músculo suspensorio del duodeno.', ['Ángulo duodenoyeyunal (de Treitz): origen del mesenterio.'], 190)
    N(u, 'S-424', 'Mesocolon y raíz del mesenterio.', ['Trayecto oblicuo de la raíz del mesenterio hacia la fosa ilíaca derecha.'], 190)
    oral(u, 'El peritoneo es una serosa con una hoja **parietal**, inervada por nervios espinales (dolor localizado, defensa), y una **visceral**, inervada por el autónomo (dolor difuso). La cavidad tiene espacios que explican la evolución: el **espacio subhepático** comunica por la **gotera parietocólica derecha** con la fosa ilíaca derecha y la pelvis, por eso una úlcera perforada puede simular una apendicitis; el **fondo de saco de Douglas** es el punto más declive y ahí se forma el absceso pélvico, que se palpa en el tacto rectal. El **epiplón mayor** migra hacia el foco inflamatorio y lo bloquea: así se forma el **plastrón apendicular**. Los órganos retroperitoneales (duodeno, páncreas, colon ascendente y descendente, riñones) dan menos peritonitis.')


def dolor(u):
    u.h2('Inervación del abdomen y fisiología del dolor', intro='El objetivo de la unidad pide “interpretar la fisiología del dolor abdominal e integrar los conocimientos anatómicos”. Con este módulo explicás por qué el dolor de la apendicitis empieza en el ombligo y termina en la fosa ilíaca derecha.')
    u.h3('Tres tipos de dolor')
    u.tabla(['Tipo', 'Qué lo produce', 'Vía', 'Cómo es'], [
        ['**Visceral**', 'Distensión, isquemia, contracción forzada de una víscera hueca; inflamación', 'Fibras aferentes viscerales que viajan **con los nervios simpáticos (esplácnicos)** hasta la médula torácica y lumbar alta', '**Sordo, cólico, difuso, en la línea media**, mal localizado; acompaña náuseas, vómitos y sudoración'],
        ['**Parietal (somático)**', 'Irritación del **peritoneo parietal** por pus, bilis, sangre o jugo gástrico', '**Nervios espinales** (T6-L1), igual que la piel de la pared', '**Agudo, intenso, bien localizado**; empeora con la tos y el movimiento; defensa y contractura'],
        ['**Referido**', 'Convergencia de aferentes viscerales y cutáneas en la **misma neurona del asta posterior**', 'Dermatoma del mismo segmento medular', 'Dolor a distancia (hombro, escápula, testículo, ingle)'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 2 (fisiopatología de los síntomas); Netter, láminas S-453 y S-454; Gray, págs. 214-217.')
    u.h3('Dónde se siente el dolor visceral: según el origen embrionario')
    u.tabla(['Intestino', 'Órganos', 'Nervio y ganglio', 'Segmento', 'Dónde se siente'], [
        ['**Anterior (foregut)**', 'Esófago distal, estómago, duodeno proximal, hígado, vías biliares, páncreas', 'Esplácnico **mayor** y plexo celíaco', 'T5-T9', '**Epigastrio**'],
        ['**Medio (midgut)**', 'Duodeno distal, yeyuno, íleon, **apéndice, ciego**, colon ascendente y transverso proximal', 'Esplácnico **menor** y plexo mesentérico superior', 'T9-T11 (**T10**)', '**Región periumbilical**'],
        ['**Posterior (hindgut)**', 'Colon transverso distal, descendente, sigmoides y recto', 'Esplácnicos **lumbares** y plexo mesentérico inferior', 'T12-L2', '**Hipogastrio**'],
        ['**Riñón y uréter**', 'Pelvis renal, uréter', 'Esplácnico menor e inferior y lumbares', 'T10-L1', 'Flanco, que **irradia a la ingle, testículo o labio mayor**'],
    ], fuente='Anatomía de referencia; Gray, pág. 217; Netter, lámina S-453.')
    u.box('clave', 'Por qué el dolor de la apendicitis “migra”', ['**1.º**: la inflamación distiende el apéndice (derivado del intestino medio): dolor **visceral periumbilical** (T10), sordo, con anorexia, náuseas y vómitos.',
                                                                   '**2.º**: la inflamación llega a la serosa y **toca el peritoneo parietal** de la fosa ilíaca derecha: el dolor se vuelve **agudo y localizado en la FID** (nervios iliohipogástrico e ilioinguinal, T12-L1), con **defensa** y **Blumberg**.',
                                                                   '**Cronología de Murphy**: dolor epigástrico o periumbilical → náuseas y vómitos → migración a FID → fiebre moderada. Si el apéndice es **pélvico** o **retrocecal**, el contacto con el parietal es menor y puede faltar la migración típica.'])
    u.h3('Dolor referido: la ruta anatómica')
    u.tabla(['Localización del dolor', 'Qué se irrita', 'Razón anatómica'], [
        ['**Hombro derecho** o escápula', 'Peritoneo diafragmático: colecistitis, absceso subfrénico, hemoperitoneo, perforación de úlcera', 'El **nervio frénico (C3-C5)** inerva el diafragma central: el cerebro lo proyecta al dermatoma del hombro (**signo de Kehr** si es izquierdo y hay sangre por rotura esplénica)'],
        ['**Espalda** (dolor en cinturón)', 'Páncreas, aorta', 'Órganos retroperitoneales con aferentes a T8-L1'],
        ['**Testículo o ingle**', 'Uréter (cólico renal)', 'T10-L2: genitofemoral e ilioinguinal'],
        ['**Escápula derecha**', 'Vesícula biliar', 'Diafragma y peritoneo parietal hepático'],
        ['**Muslo**', 'Irritación del psoas o del obturador', 'Plexo lumbar (L2-L4)'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 2; Gray, pág. 217.')
    G(u, 217, 'Diagrama de la inervación aferente visceral (sensitiva) y del dolor referido (Gray).', ['Seguí el recorrido: víscera → nervio esplácnico → ganglio → médula → dermatoma donde se siente el dolor. Ampliá la imagen en el lector.'], 215)
    G(u, 215, 'Nervios esplácnicos (Gray).', ['Esplácnicos mayor, menor e inferior y lumbares, y los ganglios celíaco y mesentéricos.'], 190)
    G(u, 214, 'Inervación del abdomen (Gray).', ['Plexos autónomos y su relación con las arterias viscerales.'], 190)
    G(u, 216, 'Inervación eferente visceral (Gray).', ['Simpático y parasimpático de las vísceras abdominales: el íleo reflejo y la atonía intestinal en la peritonitis.'], 190)
    N(u, 'S-453', 'Inervación autónoma del intestino: esquema.', ['Fibras simpáticas (rojo) y parasimpáticas (azul) hacia el intestino y el plexo entérico.'], 190)
    N(u, 'S-454', 'Vías reflejas autónomas: esquema.', ['El arco reflejo visceral que explica el íleo, el vómito y el estado de shock en el abdomen agudo.'], 190)
    oral(u, 'Hay tres tipos de dolor. El **visceral** es sordo, difuso y en la línea media, porque las aferentes viscerales viajan con los **esplácnicos** hasta la médula y están poco representadas en la corteza: se siente en el **epigastrio** si el órgano deriva del intestino anterior (T5-T9), **periumbilical** si deriva del medio (T9-T11) e **hipogástrico** si deriva del posterior (T12-L2). El **parietal** es agudo y localizado, porque el peritoneo parietal tiene inervación **espinal** (T6-L1); produce defensa. El **referido** se debe a que las aferentes viscerales y cutáneas convergen en la misma neurona del asta posterior: el hombro (**frénico C3-C5**) en la irritación diafragmática, la ingle y el testículo en el cólico ureteral. En la apendicitis el dolor empieza en el **ombligo (T10)**, por distensión del apéndice, y **migra a la fosa ilíaca derecha** cuando la inflamación llega al peritoneo parietal.')


def irrigacion(u):
    u.h2('Irrigación del tubo digestivo: arterias mesentéricas, venas y abdomen agudo vascular', intro='El abdomen agudo vascular (isquemia mesentérica) y la apendicitis (arteria apendicular) se explican por la irrigación. Además, la vena porta explica la pileflebitis.')
    u.h3('Las tres arterias viscerales impares de la aorta abdominal')
    u.tabla(['Arteria', 'Nivel', 'Irriga', 'Ramas principales'], [
        ['**Tronco celíaco**', 'T12', 'Intestino anterior: estómago, duodeno proximal, hígado, vesícula, páncreas, bazo', 'Gástrica izquierda, hepática común, esplénica'],
        ['**Mesentérica superior (AMS)**', 'L1', 'Intestino medio: duodeno distal, yeyuno, íleon, apéndice, ciego, colon ascendente y 2/3 proximales del transverso', 'Pancreaticoduodenal inferior, **yeyunales e ileales**, **ileocólica** (con la **apendicular**), **cólica derecha** y **cólica media**'],
        ['**Mesentérica inferior (AMI)**', 'L3', 'Intestino posterior: tercio distal del transverso, descendente, sigmoides y recto superior', 'Cólica izquierda, **sigmoideas** y rectal superior'],
    ], fuente='Anatomía de referencia; Netter, láminas S-435, S-439 y S-440; Gray, págs. 172 y 185.')
    u.h3('Circulación colateral: por qué hay zonas frágiles')
    u.ul(['**Arcadas y vasa recta**: en el yeyuno hay pocas arcadas y vasos rectos largos; en el íleon más arcadas y vasos rectos cortos.',
          '**Arcada marginal de Drummond**: une las cólicas a lo largo del colon.',
          '**Arco de Riolano**: anastomosis entre la cólica media (AMS) y la cólica izquierda (AMI).',
          '**Pancreaticoduodenales**: unen el tronco celíaco con la AMS.',
          '**Puntos críticos (cuencas limítrofes)**: **ángulo esplénico (punto de Griffiths)**, entre la cólica media y la izquierda, y la **unión rectosigmoidea (punto de Sudeck)**, entre la última sigmoidea y la rectal superior. Son las zonas más expuestas a la colitis isquémica.'])
    u.h3('Isquemia mesentérica aguda: abdomen agudo vascular')
    u.tabla(['Causa', 'Mecanismo y anatomía', 'Segmento afectado'], [
        ['**Embolia de la AMS** (la más frecuente; fibrilación auricular)', 'El émbolo se aloja **distal al origen de la cólica media** (unos 3-8 cm del origen)', 'Intestino delgado medio y distal; **se respetan el duodeno y el yeyuno proximal**'],
        ['**Trombosis de la AMS**', 'Sobre una placa ateroesclerótica **en el origen** de la arteria', 'Desde el yeyuno proximal hasta el colon derecho (mayor extensión)'],
        ['**Isquemia no oclusiva** (bajo gasto, vasoespasmo)', 'Vasoconstricción mesentérica', 'Parcheada'],
        ['**Trombosis venosa mesentérica**', 'Hipercoagulabilidad; compromete la VMS', 'Segmentaria; edema de pared'],
        ['**Colitis isquémica**', 'Cuencas limítrofes: ángulo esplénico y rectosigmoide', 'Colon izquierdo'],
    ], fuente='Azato y Waisman, Abdomen agudo, capítulo de isquemia mesentérica; anatomía de referencia.')
    u.box('alerta', 'Dolor desproporcionado al examen', 'Dolor abdominal **intenso con abdomen blando** y signos de peritonitis tardíos = pensá en **isquemia mesentérica** (el dolor visceral isquémico es muy intenso y la defensa recién aparece con la necrosis).')
    u.h3('Drenaje venoso: la vena porta')
    u.ul(['La **vena mesentérica superior** (que recibe la ileocólica y la apendicular) se une con la **esplénica** y forma la **vena porta**, que lleva la sangre al hígado. La **mesentérica inferior** desemboca en la esplénica o en la unión.',
          '**Pileflebitis y absceso hepático**: una apendicitis o diverticulitis complicada puede propagar la infección por la **vena apendicular → ileocólica → VMS → porta**, con trombosis séptica y abscesos hepáticos.',
          '**Anastomosis portosistémicas**: esofágicas, rectales, paraumbilicales y retroperitoneales (se abren en la hipertensión portal).'])
    N(u, 'S-435', 'Arterias del estómago, el hígado y el bazo (tronco celíaco).', ['Gástrica izquierda, hepática común y esplénica.'], 190)
    N(u, 'S-439', 'Arterias del intestino delgado.', ['AMS y sus ramas yeyunales e ileales, con las arcadas y los vasos rectos.'], 190)
    N(u, 'S-440', 'Arterias del intestino grueso.', ['Ileocólica, cólica derecha y media, AMI; arcada marginal.'], 190)
    N(u, 'S-442', 'Venas del estómago, duodeno, páncreas y bazo.', ['Vena porta, esplénica y mesentérica superior.'], 190)
    N(u, 'S-446', 'Tributarias de la vena porta hepática y anastomosis portocava.', ['Sitios de anastomosis portosistémica.'], 190)
    N(u, 'S-437', 'Arteriografía y angiografía por TC celíacas.', ['Cómo se ven las arterias viscerales en la angiografía (estudio de la isquemia mesentérica).'], 165)
    G(u, 185, 'Arterias mesentéricas (Gray).', ['AMS y AMI con sus ramas colaterales.'], 190)
    G(u, 195, 'Drenaje venoso de las vísceras (Gray).', ['Vena porta y sus afluentes.'], 190)
    G(u, 197, 'Anastomosis portosistémicas (Gray).', ['Los cuatro sitios de comunicación entre el sistema porta y el cava.'], 190)
    oral(u, 'La aorta abdominal da tres ramas impares para el tubo digestivo: el **tronco celíaco** (T12, intestino anterior), la **mesentérica superior** (L1, intestino medio: delgado, apéndice, ciego, colon derecho) y la **mesentérica inferior** (L3, posterior). La AMS da la **ileocólica**, de la que nace la **arteria apendicular**; como es **terminal**, su trombosis en la apendicitis produce gangrena y perforación temprana. El **arco de Riolano** y la **arcada de Drummond** comunican los territorios; los **puntos de Griffiths (ángulo esplénico) y de Sudeck (rectosigmoide)** son los más frágiles. En el abdomen agudo vascular, la **embolia** de la AMS se aloja distal a la cólica media y respeta el yeyuno proximal; la **trombosis** ocurre en el origen y compromete más intestino. El drenaje venoso confluye en la **porta**: la **pileflebitis** y el absceso hepático son complicaciones de la apendicitis y la diverticulitis.')
