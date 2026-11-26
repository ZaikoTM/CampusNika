# -*- coding: utf-8 -*-
"""UP 1 · Atlas: láminas de Netter (8.ª ed.) y Gray (3.ª ed.), radiografías de los libros de traumatología y desarrollo oral por módulo."""

NET = 'Netter, F. H. __Atlas de Anatomía Humana__, 8.ª ed. (Elsevier), lámina {s}.'
GRA = 'Gray, __Atlas de Anatomía__, 3.ª ed. (Elsevier), pág. {p}.'


def _h(alto):
    return 275 if alto >= 170 else 215


def N(u, s, titulo, mirar, alto=205):
    """lámina de Netter a color; 'mirar' = lista de cosas que hay que identificar (se imprime como guía)"""
    u.foto('netter_%s.jpg' % s, titulo, NET.format(s=s), [('▸', m) for m in mirar] if mirar else None, _h(alto))


def G(u, p, titulo, mirar, alto=205):
    u.foto('gray_p%d.jpg' % p, titulo, GRA.format(p=p), [('▸', m) for m in mirar] if mirar else None, _h(alto))


def L(u, archivo, titulo, fuente, mirar=None, alto=120):
    u.foto(archivo, titulo, fuente, [('▸', m) for m in mirar] if mirar else None, alto)


def oral(u, texto, titulo=None):
    u.box('oral', titulo or 'Así lo decís en el oral', texto)


# ---------------------------------------------------------------- por módulo
def atlas_piel(u):
    u.h3('Atlas: dermatomas y nervios cutáneos')
    N(u, 'S-12', 'Dermatomas de los miembros superior e inferior.', ['C5 en la cara lateral del brazo, C6 pulgar, C7 dedo medio, C8 meñique y borde cubital, T1 cara medial del antebrazo.', 'Los dermatomas se superponen: perder uno solo casi no produce anestesia.'], 190)
    N(u, 'S-228', 'Nervios cutáneos y venas superficiales de la porción proximal del miembro superior.', ['Qué nervio cutáneo da la sensibilidad de cada zona de piel del brazo (los que se anestesian al infiltrar).', 'Vena cefálica (lateral) y basílica (medial): dónde cada una perfora la fascia.'])
    N(u, 'S-229', 'Nervios cutáneos y venas superficiales del antebrazo y la mano.', ['Territorio de los nervios radial, mediano y cubital en el dorso y la palma: es el mapa de la sensibilidad de la mano.', 'Venas del dorso de la mano y mediana del antebrazo.'])
    oral(u, 'La piel tiene epidermis, dermis e hipodermis. La epidermis no tiene vasos, la dermis es la que da resistencia a la sutura y la hipodermis es el espacio muerto que hay que cerrar. Para planear una incisión busco las **líneas de tensión de la piel**: cortar paralelo a ellas deja una cicatriz fina; cruzar un pliegue de flexión en ángulo recto retrae. En la mano la piel palmar es gruesa y adherida, la dorsal es fina y laxa, por eso el edema aparece en el dorso. La sensibilidad la dan los **dermatomas** (C5 lateral del brazo, C6 pulgar, C7 medio, C8 meñique, T1 medial del antebrazo) y los nervios cutáneos; si anestesio la herida pero no documenté antes la sensibilidad, después no puedo saber si el déficit era de la lesión.')


def atlas_via_aerea(u):
    u.h3('Atlas: laringe y tráquea (Netter)')
    N(u, 'S-375', 'Cartílagos de la laringe: tiroides, cricoides, epiglotis, aritenoides y membranas.', ['Cricoides: único anillo completo; la membrana **cricotiroidea** está entre el tiroides y el cricoides (vía aérea quirúrgica).', 'Epiglotis y vallécula: la pala curva se apoya en la vallécula.'])
    N(u, 'S-376', 'Músculos intrínsecos de la laringe.', ['Todos se inervan por el recurrente, excepto el cricotiroideo.'], 190)
    N(u, 'S-378', 'Nervios de la laringe y corte frontal.', ['Rama interna del laríngeo superior: sensibilidad por encima de las cuerdas. Recurrente: motor y sensibilidad por debajo.', 'Cuerdas vocales verdaderas y falsas en el corte frontal; región subglótica.'])
    N(u, 'S-379', 'Tráquea y bronquios mayores.', ['Anillos en “C” abiertos hacia atrás; carina; el bronquio derecho es más corto, ancho y vertical.'], 190)
    G(u, 570, 'Laringe (Gray).', ['Compará el esqueleto cartilaginoso con la lámina de Netter.'], 190)
    G(u, 574, 'Inervación de la laringe (Gray).', ['Recorrido del laríngeo superior (ramas interna y externa) y del recurrente, y su relación con la arteria tiroidea.'], 190)
    oral(u, 'La vía aérea va de la nariz a la tráquea. Para intubar hay tres ejes (oral, faríngeo y laríngeo) que alineo con la **posición de olfateo**. Con la pala curva me apoyo en la **vallécula**; con la recta levanto la **epiglotis**; veo la **glotis** entre las cuerdas verdaderas. La laringe está entre C3-C4 y C6; el único anillo completo es el **cricoides**; entre el tiroides y el cricoides está la **membrana cricotiroidea**, que es el acceso quirúrgico de emergencia. Todos los músculos intrínsecos los inerva el **recurrente**, salvo el cricotiroideo (rama externa del laríngeo superior). La tráquea mide 10-12 cm, llega a T4-T5 (carina) y el bronquio derecho es más vertical, por eso el tubo se va al derecho si lo introduzco de más. Las complicaciones tienen base anatómica: trauma dental, intubación esofágica (el esófago está detrás de la laringe), endobronquial derecha, edema subglótico y estenosis por el balón.')


def atlas_columna(u):
    u.h3('Atlas: columna, meninges y vascularización medular')
    N(u, 'S-137', 'Columna vertebral completa: vistas anterior, lateral y posterior.', ['Curvaturas: lordosis cervical y lumbar, cifosis torácica y sacra.', 'Regiones vertebrales: 7 cervicales, 12 torácicas, 5 lumbares.'], 190)
    N(u, 'S-145', 'Vértebras lumbares.', ['Cuerpo grande, apófisis espinosa horizontal y espacio interespinoso amplio: por eso la punción lumbar es posible acá.'], 190)
    N(u, 'S-147', 'Ligamentos de la columna: región lumbosacra.', ['Orden de las capas que atraviesa la aguja: supraespinoso, interespinoso y **ligamento amarillo**.', 'Ligamento longitudinal posterior por delante del canal.'])
    N(u, 'S-17', 'Meninges y raíces nerviosas espinales.', ['Duramadre, aracnoides y espacio subaracnoideo (LCR). **Espacio epidural** por fuera de la duramadre.', 'Médula, cono medular y cola de caballo.'])
    N(u, 'S-23', 'Arterias de la médula espinal: esquema.', ['Arteria espinal anterior y dos posteriores; arteria radicular magna (de Adamkiewicz).'], 190)
    G(u, 62, 'Meninges espinales (Gray).', ['Espacio epidural con grasa y plexos venosos, duramadre, aracnoides y espacio subaracnoideo.'], 190)
    oral(u, 'La médula termina en **L1-L2** (cono medular) y por debajo queda la **cola de caballo**; el saco dural termina en **S2**. La referencia para pinchar es la **línea de Tuffier**, que une las crestas ilíacas y pasa por L4: punciono en L3-L4 o L4-L5, debajo de la médula. Para la raquídea la aguja atraviesa **piel, tejido celular, ligamento supraespinoso, interespinoso, ligamento amarillo, espacio epidural, duramadre y aracnoides** hasta el **espacio subaracnoideo**, donde sale LCR. En la peridural me detengo en el espacio epidural, que reconozco por la **pérdida de resistencia**. Los accidentes se explican por anatomía: hipotensión y bradicardia por bloqueo simpático (T1-L2; si sube a T1-T4 se bloquean las cardioaceleradoras), cefalea pospunción por pérdida de LCR, hematoma epidural por los plexos venosos en un paciente anticoagulado, retención urinaria por bloqueo S2-S4 y bloqueo espinal total si la peridural se inyecta en el espacio subaracnoideo.')


def atlas_esqueleto(u):
    u.h3('Atlas: huesos y articulaciones del miembro superior')
    N(u, 'S-155', 'Húmero y escápula.', ['Cuello anatómico y **cuello quirúrgico** (nervio axilar), surco del nervio radial en la diáfisis, epicóndilo y epitróclea.'], 195)
    N(u, 'S-156', 'Clavícula y articulación esternoclavicular.', ['Curvatura en S de la clavícula; la unión del tercio medio con el lateral es el punto débil.'], 185)
    N(u, 'S-157', 'Articulaciones del hombro y acromioclavicular.', ['Ligamentos coracoclaviculares, coracoacromial y cápsula glenohumeral.'], 190)
    N(u, 'S-158', 'Hombro: radiografía anteroposterior.', ['Cómo se ven en la Rx la cabeza humeral, el acromion, la glenoides y la clavícula (referencia para luxaciones y fracturas).'], 150)
    N(u, 'S-159', 'Huesos del codo.', ['Paleta humeral: tróclea, cóndilo, epicóndilo lateral y epitróclea. Olécranon y apófisis coronoides.'], 190)
    N(u, 'S-160', 'Codo: radiografías.', ['Relación normal de las superficies articulares. Una fractura supracondílea rompe la línea humeral anterior.'], 185)
    N(u, 'S-161', 'Ligamentos del codo.', ['Colateral cubital y colateral radial: estabilizan el codo en la luxación.'], 190)
    N(u, 'S-162', 'Huesos del antebrazo.', ['Membrana interósea, radio y cúbito; la pronosupinación gira el radio sobre el cúbito.'], 190)
    N(u, 'S-163', 'Huesos del carpo.', ['Escafoides, semilunar, piramidal, pisiforme, trapecio, trapezoide, hueso grande y ganchoso.'], 190)
    N(u, 'S-168', 'Carpo y mano: radiografías.', ['Compará con las radiografías de fracturas de la página siguiente.'], 185)
    u.h3('Radiografías de las fracturas de la unidad (libros de traumatología)')
    L(u, 'lib_orr_clavicula_rx.png', 'Fractura de clavícula: radiografía de tórax y de hombro con el desplazamiento del fragmento.', 'Orrego y Morán, Ortopedia y Traumatología Básica (2014), fracturas de clavícula.', ['El fragmento medial se eleva (esternocleidomastoideo) y el lateral desciende (peso del brazo).'], 85)
    L(u, 'lib_orr_colles_rx.png', 'Fractura de Colles: perfil y frente.', 'Orrego y Morán, Ortopedia y Traumatología Básica (2014), fractura de la extremidad distal del radio.', ['Desplazamiento dorsal del fragmento distal (“dorso de tenedor”); estiloides cubital.'], 80)
    L(u, 'lib_orr_escafoides_vascular.png', 'Irrigación del escafoides: la sangre entra por el polo distal.', 'Orrego y Morán, Ortopedia y Traumatología Básica (2014), fractura de escafoides.', ['El fragmento proximal queda sin irrigación: necrosis avascular y seudoartrosis.'], 70)
    L(u, 'lib_schwartz_patrones_fractura.png', 'Patrones de fractura: transversa, oblicua, espiroidea, segmentaria y conminuta.', 'Schwartz, Principios de Cirugía, 10.ª ed., fracturas.', ['Cada patrón orienta al mecanismo: espiroidea = torsión; transversa = flexión directa.'], 70)
    oral(u, 'El miembro superior se articula con el tronco por la **clavícula** (esternoclavicular y acromioclavicular), la **escápula** y la **glenohumeral**. En el húmero reconozco el **cuello quirúrgico** (nervio axilar y arteria circunfleja posterior), el **surco radial** en la diáfisis (nervio radial), la paleta humeral con la **epitróclea** (nervio cubital detrás) y el **epicóndilo**. El antebrazo tiene radio y cúbito unidos por la membrana interósea y la pronosupinación es el radio girando sobre el cúbito. El carpo tiene ocho huesos en dos filas y el **escafoides** se irriga por el polo distal, por eso la fractura con Rx inicial normal igual se inmoviliza. Cada fractura tiene un vecino: **clavícula** (subclavios y plexo), **luxación de hombro** (axilar), **diáfisis de húmero** (radial, mano caída con tríceps conservado), **supracondílea** (braquial y mediano, riesgo de Volkmann), **Colles** (mediano) y **escafoides** (necrosis avascular).')


def atlas_musculos(u):
    u.h3('Atlas: músculos del miembro superior')
    N(u, 'S-230', 'Músculos del hombro.', ['Deltoides (axilar), pectoral mayor, dorsal ancho, redondos y trapecio: origen e inserción de cada uno.'], 190)
    N(u, 'S-232', 'Músculos del manguito de los rotadores.', ['SIRS: supraespinoso, infraespinoso, redondo menor y subescapular, abrazando la cabeza humeral.'], 190)
    N(u, 'S-239', 'Músculos del brazo: compartimento anterior.', ['Bíceps, braquial y coracobraquial (musculocutáneo); aponeurosis bicipital.'], 190)
    N(u, 'S-240', 'Músculos del brazo: compartimento posterior.', ['Tríceps (radial) y ancóneo.'], 190)
    N(u, 'S-244', 'Antebrazo: plano superficial del compartimento anterior.', ['Pronador redondo, flexor radial del carpo, palmar largo y flexor cubital del carpo, todos desde la epitróclea.'], 190)
    N(u, 'S-246', 'Antebrazo: flexores de los dedos.', ['FDS (se inserta en la falange media) y FDP (falange distal).'], 190)
    N(u, 'S-249', 'Antebrazo: plano profundo del compartimento anterior.', ['Flexor largo del pulgar, FDP y pronador cuadrado (interóseo anterior).'], 190)
    N(u, 'S-256', 'Músculos intrínsecos de la mano.', ['Tenar, hipotenar, interóseos y lumbricales, con su nervio.'], 190)
    oral(u, 'Para saber qué nervio se lesionó tengo que saber qué músculo dejó de funcionar. En el hombro el **deltoides** (axilar) abduce entre 15° y 90° y el **supraespinoso** inicia la abducción; el manguito rotador es el SIRS. En el brazo el compartimento **anterior** (bíceps, braquial, coracobraquial) lo inerva el **musculocutáneo** y flexiona el codo; el **posterior** (tríceps) lo inerva el **radial**. En el antebrazo la **epitróclea** da origen a los flexores y pronadores (mediano, salvo el flexor cubital del carpo, que es cubital) y el **epicóndilo** a los extensores (radial). El FDP del índice y el medio lo inerva el interóseo anterior (mediano) y el del anular y el meñique el cubital. En la mano, el tenar es del mediano (salvo el aductor del pulgar), el hipotenar y los interóseos son del cubital, y los lumbricales se reparten: dos laterales del mediano y dos mediales del cubital.')


def atlas_hombro_axila(u):
    u.h3('Atlas: axila, hombro y codo')
    N(u, 'S-231', 'Fascias pectoral, clavipectoral y axilar.', ['La fascia clavipectoral es perforada por la vena cefálica, la arteria toracoacromial y nervios pectorales.'], 185)
    N(u, 'S-235', 'Región del hombro.', ['Espacio subacromial y relación del deltoides con los vasos y nervios.'], 190)
    N(u, 'S-236', 'Axila: pared posterior.', ['Cuadrilátero humerotricipital (axilar y circunfleja posterior) y triángulo humerotricipital (radial).'], 190)
    N(u, 'S-237', 'Axila: visión anterior.', ['Arteria y vena axilares, cordones del plexo y ganglios, por detrás del pectoral menor.'], 190)
    G(u, 408, 'Paredes de la axila (Gray).', ['Pared anterior, posterior, medial y lateral con sus músculos; vértice (canal cervicoaxilar).'], 190)
    G(u, 434, 'Cápsula y ligamentos del codo (Gray).', ['Colateral cubital (el más importante) y colateral radial.'], 190)
    G(u, 436, 'Fosa del codo (cubital) (Gray).', ['De lateral a medial: tendón del bíceps, arteria braquial, nervio mediano (T-A-N). La aponeurosis bicipital protege a la arteria y al mediano.', 'Venas: mediana cubital por delante del lacertus.'], 205)
    oral(u, 'El hombro es la articulación más móvil y la que más se luxa; la parte **inferior** de la cápsula es la más débil, por eso la luxación habitual es **anteroinferior**. El manguito rotador la estabiliza dinámicamente y el labrum y los ligamentos glenohumerales estáticamente. En la luxación evalúo antes y después de reducir el **nervio axilar** (sensibilidad del parche lateral del hombro) y el pulso. La **axila** es una pirámide cuadrangular; por su vértice pasan los vasos y el plexo hacia el brazo. En el codo uso el **triángulo de Hueter** (epicóndilo, epitróclea y olécranon): en extensión están alineados y en flexión forman un triángulo isósceles; se altera en la luxación y se conserva en la fractura supracondílea. En la **fosa cubital**, de lateral a medial, están el tendón del bíceps, la arteria braquial y el nervio mediano: **tendón, arteria, nervio**.')


def atlas_plexo(u):
    u.h3('Atlas: plexo braquial')
    N(u, 'S-106', 'Plexo braquial: esquema.', ['Raíces C5-T1, troncos superior, medio e inferior, divisiones, cordones lateral, posterior y medial, y ramos terminales.', 'Ramos colaterales: dorsal de la escápula, torácico largo (serrato anterior), supraescapular, pectorales, subescapulares y toracodorsal.'], 200)
    N(u, 'S-107', 'Nervios del miembro superior.', ['Recorrido de cada nervio terminal y los músculos que inerva.'], 200)
    N(u, 'S-108', 'Nervio musculocutáneo.', ['Atraviesa el coracobraquial y desciende entre bíceps y braquial; su rama terminal es el cutáneo lateral del antebrazo.', 'Fascículos medial, posterior y lateral del plexo y el origen de los cinco ramos terminales.'], 200)
    G(u, 415, 'Plexo braquial (Gray).', ['Relaciones del plexo con los escalenos, la clavícula, la arteria subclavia y la axila.'], 190)
    oral(u, 'El plexo braquial está formado por los ramos anteriores de **C5 a T1**. Lo ordeno con la regla **raíces, troncos, divisiones, cordones y ramos**: las raíces salen entre los escalenos, forman tres troncos (superior C5-C6, medio C7, inferior C8-T1), cada tronco se divide en una división anterior y una posterior detrás de la clavícula, y se reagrupan en tres cordones alrededor de la **arteria axilar**: lateral, medial y posterior. De ellos salen los cinco ramos terminales: **musculocutáneo** y **mediano** (con su raíz lateral) por el lateral, **cubital** y raíz medial del mediano por el medial, y **axilar** y **radial** por el posterior. La lesión **alta** (C5-C6, Erb) deja el brazo en aducción y rotación interna con el antebrazo pronado; la **baja** (C8-T1, Klumpke) produce mano en garra y, si compromete T1, síndrome de Horner. Los bloqueos se nombran por el nivel: interescalénico (hombro; parálisis frénica), supraclavicular (neumotórax), infraclavicular y axilar (el musculocutáneo se bloquea aparte).')


def atlas_nervios(u):
    u.h3('Atlas: nervios periféricos')
    N(u, 'S-109', 'Nervio mediano.', ['Pasa entre las dos cabezas del pronador redondo, entre FDS y FDP, y bajo el retináculo flexor.', 'Inervación cutánea: palma radial y tres dedos y medio.'], 200)
    N(u, 'S-110', 'Nervio cubital.', ['Detrás de la epitróclea, entre las cabezas del flexor cubital del carpo, y por el canal de Guyon.', 'Inervación cutánea: meñique y mitad del anular.'], 200)
    N(u, 'S-111', 'Nervio radial en el brazo y nervios de la región posterior del hombro.', ['Surco radial con la arteria braquial profunda; nervio axilar por el cuadrilátero humerotricipital.'], 200)
    N(u, 'S-112', 'Nervio radial en el antebrazo y la mano.', ['Rama superficial (sensitiva, dorso radial) y rama profunda: interóseo posterior, que atraviesa el supinador (arcada de Frohse).'], 200)
    oral(u, 'Cada nervio tiene un **lugar clásico de lesión**. El **axilar** rodea el cuello quirúrgico del húmero: luxación de hombro y fractura del cuello quirúrgico. El **radial** corre por el surco radial: fractura de diáfisis de húmero (Holstein-Lewis), con mano caída y tríceps conservado; en el antebrazo su rama profunda atraviesa el supinador. El **mediano** pasa entre las cabezas del pronador redondo y bajo el retináculo flexor: fractura supracondílea, luxación de semilunar, Colles y túnel carpiano. El **cubital** pasa detrás de la epitróclea y por el canal de Guyon: fractura de epitróclea, compresión en el codo y garra cubital. Los signos de examen son el **signo OK** (interóseo anterior del mediano), la **abducción de dedos** (cubital) y la **extensión de muñeca** (radial); y las zonas autónomas son el pulpejo del índice (mediano), el del meñique (cubital) y el dorso del primer espacio interdigital (radial).')


def atlas_arterias(u):
    u.h3('Atlas: arterias, venas y linfáticos')
    N(u, 'S-227', 'Arterias y nervios del miembro superior: visión anterior.', ['Cambios de nombre: subclavia, axilar, braquial, radial y cubital.', 'Nervio mediano junto a la arteria braquial.'], 200)
    N(u, 'S-234', 'Arteria axilar y anastomosis alrededor de la escápula.', ['Las tres porciones de la axilar y sus seis ramas; la circulación colateral periescapular.'], 195)
    N(u, 'S-238', 'Arteria braquial in situ.', ['Braquial junto al mediano en el canal bicipital medial; braquial profunda con el radial.'], 195)
    N(u, 'S-257', 'Arterias de la mano: visiones palmares.', ['Arco palmar superficial (más distal, cubital) y profundo (radial); arterias digitales comunes y propias.'], 195)
    N(u, 'S-332', 'Venas del miembro superior.', ['Cefálica, basílica y mediana cubital: la mediana cubital es la de elección para la venopunción.'], 190)
    N(u, 'S-348', 'Vasos y ganglios linfáticos de la mama y la axila.', ['Grupos axilares: pectorales, subescapulares, humerales, centrales y apicales; niveles de Berg.'], 195)
    G(u, 423, 'Venas del brazo (Gray).', ['Cefálica y basílica y su desembocadura.'], 180)
    G(u, 427, 'Linfáticos del brazo (Gray).', ['Ganglios epitrocleares y axilares.'], 180)
    oral(u, 'La arteria **subclavia** nace del tronco braquiocefálico a la derecha y del arco aórtico a la izquierda; al pasar el borde lateral de la primera costilla se llama **axilar**, que tiene tres porciones según el pectoral menor y seis ramas (torácica superior, toracoacromial, torácica lateral, subescapular y las dos circunflejas humerales). Al pasar el borde inferior del redondo mayor es **braquial**: acompaña al mediano en el canal bicipital medial, da la braquial profunda y en la fosa cubital, bajo la aponeurosis bicipital, se divide en **radial** y **cubital**. En la mano forman el arco **superficial** (cubital) y el **profundo** (radial); el **test de Allen** valora la perfusión. La **circulación colateral** periescapular y periarticular del codo explica por qué se puede ligar una arteria. Una **fractura supracondílea** compromete la braquial, la **luxación de hombro** la axilar y la fractura de **clavícula o primera costilla** la subclavia. En el drenaje venoso, la **mediana cubital** se usa para venopunción porque el lacertus fibrosus protege a la arteria. Los linfáticos de la mano drenan a los ganglios **epitrocleares** y **axilares**: por eso una infección de dedo puede producir linfangitis y adenopatía axilar.')


def atlas_regiones(u):
    u.h3('Atlas: cortes transversales del brazo y antebrazo')
    N(u, 'S-551', 'Brazo: cortes transversales seriados.', ['Compartimento anterior y posterior, tabiques intermusculares, paquete vasculonervioso medial y nervio radial en el surco.'], 200)
    N(u, 'S-552', 'Antebrazo: cortes transversales seriados.', ['Compartimentos anterior y posterior, membrana interósea y paquetes radial y cubital.'], 200)
    G(u, 428, 'Cortes transversales del brazo (Gray).', ['Estructuras de cada compartimento.'], 180)
    G(u, 450, 'Cortes transversales del antebrazo (Gray).', ['Estructuras de cada compartimento: la presión elevada comprime a todo lo que contiene.'], 180)
    L(u, 'lib_orr_compartimental_yeso.png', 'Síndrome compartimental por yeso apretado: el compartimento cerrado aumenta su presión.', 'Orrego y Morán, Ortopedia y Traumatología Básica (2014), síndrome compartimental.', ['Los compartimentos son fascias cerradas: todo aumento de volumen eleva la presión y comprime nervios y vasos.'], 70)
    oral(u, 'El brazo tiene dos compartimentos: el **anterior** flexor (musculocutáneo; arteria braquial y mediano en el canal medial) y el **posterior** extensor (radial). El antebrazo tiene compartimentos **anterior** (flexores y pronadores) y **posterior** (extensores y supinador). Como son espacios limitados por fascias, una fractura, un aplastamiento o un yeso apretado aumentan la presión: **síndrome compartimental**, con **dolor desproporcionado y dolor con la extensión pasiva de los dedos**; el pulso puede estar presente. El tratamiento es la **fasciotomía** volar y, si hace falta, dorsal; la isquemia prolongada deja la contractura de Volkmann.')


def atlas_mano(u):
    u.h3('Atlas: muñeca y mano')
    N(u, 'S-253', 'Tendones flexores, arterias y nervios en el carpo.', ['**Túnel carpiano**: nueve tendones y el mediano bajo el retináculo flexor; arteria y nervio cubitales por fuera (canal de Guyon).', 'Los tendones del FDS y del FDP dentro del túnel.'], 205)
    G(u, 452, 'Túnel del carpo (Gray).', ['Compará el corte transversal: huesos del carpo, retináculo flexor y contenido.'], 190)
    N(u, 'S-250', 'Carpo y mano: disecciones palmares superficiales.', ['Aponeurosis palmar, arco palmar superficial y ramas digitales de los nervios mediano y cubital.'], 195)
    N(u, 'S-251', 'Carpo y mano: disecciones palmares profundas.', ['Arco profundo, tendones flexores y músculos intrínsecos.'], 195)
    N(u, 'S-252', 'Lumbricales, espacios mediopalmar y tenar, y vainas tendinosas.', ['Espacios profundos: tenar y mediopalmar; vainas del pulgar y del meñique.'], 195)
    N(u, 'S-254', 'Espacios y vainas tendinosas de la mano.', ['Bursas radial y cubital y su comunicación en el espacio de Parona.'], 195)
    G(u, 456, 'Vainas tendinosas de la mano (Gray).', ['Vainas sinoviales y poleas anulares y cruciformes.'], 185)
    N(u, 'S-255', 'Tendones flexores y extensores en los dedos.', ['Quiasma de Camper: el FDS se divide para dejar pasar al FDP; mecanismo extensor.'], 195)
    N(u, 'S-260', 'Tendones de los extensores en el carpo.', ['Los seis compartimentos dorsales y el tubérculo de Lister.'], 190)
    N(u, 'S-261', 'Nervios y arterias del dorso de la mano y carpo.', ['Rama superficial del radial y rama dorsal del cubital; tabaquera anatómica.'], 195)
    G(u, 463, 'Inervación de la mano: nervios mediano y ulnar (Gray).', ['Ramas digitales y territorios sensitivos.'], 185)
    u.h3('Zonas de los tendones flexores y su examen (libros de cirugía)')
    L(u, 'lib_schwartz_zonas_flexores.png', 'Zonas de los tendones flexores (I a V) sobre la mano.', 'Schwartz, Principios de Cirugía, 10.ª ed., lesiones de la mano.', ['Zona II: “tierra de nadie” (FDS y FDP juntos en la vaina).'], 90)
    L(u, 'lib_schwartz_cascada_flexor_profundo.png', 'Cascada de los dedos y examen del flexor profundo.', 'Schwartz, Principios de Cirugía, 10.ª ed., lesiones de la mano.', ['Cascada normal de flexión de índice a meñique; un dedo que queda extendido sugiere un flexor seccionado.'], 70)
    oral(u, 'En la muñeca, el **retináculo flexor** forma el túnel carpiano, por donde pasan **nueve tendones (cuatro FDS, cuatro FDP y el flexor largo del pulgar) y el mediano**; el flexor radial del carpo tiene su propio canal. El **nervio y la arteria cubitales** pasan por el **canal de Guyon**, superficial al retináculo, entre el pisiforme y el gancho del ganchoso. El FDS se inserta en la falange media y flexiona la IFP; el FDP se inserta en la distal y flexiona la IFD. Las **poleas A2 y A4** impiden la cuerda de arco. Las **zonas de Verdan** van de I a V; la **zona II** es “tierra de nadie”, con peor pronóstico. Examino el FDP fijando la IFP y el FDS manteniendo los otros dedos en extensión. Las vainas del pulgar y del meñique comunican con las bursas radial y cubital, que pueden comunicarse en el espacio de Parona: una tenosinovitis supurada produce flemón en herradura. Los signos de Kanavel son flexión leve, dolor a la extensión pasiva, tumefacción fusiforme y dolor a lo largo de la vaina.')


def preguntas_oral(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una combina anatomía y patología de la unidad.')
    qa = [
        ('Una paciente llega con una herida cortante transversal en la cara anterior de la muñeca. ¿Qué estructuras pueden estar lesionadas y cómo lo evaluás?',
         'De superficial a profundo y de radial a cubital: palmar largo y flexor radial del carpo; **arteria radial**; **nervio mediano**, que es el más superficial (entre el palmar largo y el flexor radial del carpo); **tendones flexores** (FDS y FDP) y **nervio y arteria cubitales** junto al pisiforme. Antes de anestesiar valoro perfusión (pulsos, test de Allen, llenado), sensibilidad por zonas autónomas (índice, meñique y dorso del primer espacio) y motilidad por tendones (cascada, FDS y FDP por separado, signo OK). Si hay déficit es una herida compleja para cirugía de mano.'),
        ('Un niño de 6 años con fractura supracondílea tiene dolor intenso y no se palpa el pulso radial. ¿Qué pasó anatómicamente?',
         'El fragmento distal se desplaza hacia atrás y la **arteria braquial** y el **nervio mediano** están inmediatamente delante de la paleta humeral. Pueden estar comprimidos o lesionados; el dolor desproporcionado y el dolor con la extensión pasiva de los dedos orientan a **síndrome compartimental** y a **contractura isquémica de Volkmann**. Se reduce urgentemente y se reevalúa la perfusión.'),
        ('Fractura de diáfisis de húmero con mano caída. ¿Qué nervio y por qué el tríceps se conserva?',
         'El **nervio radial** corre por el **surco radial** del húmero con la arteria braquial profunda. La fractura (Holstein-Lewis, tercio distal) lo lesiona **por debajo** de las ramas al tríceps, que salen en la axila y el brazo proximal; por eso pierde extensión de muñeca y dedos pero extiende el codo.'),
        ('Luxación anterior de hombro: ¿qué nervio y cómo se evalúa?',
         'El **axilar** (C5-C6), que rodea el cuello quirúrgico del húmero. Se evalúa la sensibilidad del parche lateral del hombro y la contracción isométrica del deltoides, antes y después de reducir. También el pulso por la arteria axilar.'),
        ('Dolor en la tabaquera anatómica y radiografía normal. ¿Qué pensás y por qué es importante?',
         'Fractura de **escafoides** hasta que se demuestre lo contrario. Su irrigación es **retrógrada**: entra por el polo distal; el fragmento proximal puede quedar sin sangre (necrosis avascular y seudoartrosis). Se inmoviliza y se repite la Rx o se hace RM.'),
        ('Parestesias nocturnas en los tres dedos radiales sin pérdida de sensibilidad de la eminencia tenar. ¿Qué es y por qué?',
         'Síndrome del **túnel carpiano**: compresión del **mediano** bajo el retináculo flexor. La eminencia tenar conserva la sensibilidad porque su rama **palmar cutánea** nace proximal y pasa **por encima** del retináculo.'),
        ('¿Por qué se punciona la columna en L3-L4 o L4-L5 y qué capas atraviesa la aguja?',
         'Porque la médula termina en L1-L2 (cono medular) y el saco dural en S2. La línea de Tuffier pasa por L4. La aguja atraviesa piel, tejido celular, supraespinoso, interespinoso, **ligamento amarillo**, espacio epidural, duramadre y aracnoides hasta el espacio subaracnoideo, donde sale LCR.'),
        ('¿Qué ve el anestesiólogo en la laringoscopia y cuál es la vía aérea quirúrgica de emergencia?',
         'Apoyando la pala en la **vallécula** o levantando la **epiglotis** se ve la **glotis** entre las cuerdas verdaderas. La vía aérea quirúrgica es la **cricotiroidotomía** por la membrana cricotiroidea, entre el tiroides y el cricoides.'),
        ('Un dedo con herida palmar queda más extendido que sus vecinos. ¿Qué tendón y cómo se examina?',
         'Un **flexor seccionado** (cascada alterada). **FDS**: mantengo los otros dedos en extensión y le pido flexionar la IFP. **FDP**: fijo la IFP y le pido flexionar la IFD. Si es en la zona II (“tierra de nadie”) se deriva a cirugía de mano.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])
