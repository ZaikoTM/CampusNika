# -*- coding: utf-8 -*-
"""UP 1 · Anatomía quirúrgica. Parte B: esqueleto del miembro superior, plexo braquial, arterias, venas y linfáticos."""
from lib import svg, txt, caja, flecha, codo, flujo
from .fotos import fotos

AZ, AZC, NAV = '#0ea5e9', '#e6f6fd', '#0b1f44'
VER, VERC = '#16a34a', '#e7f6ec'
AMA, AMAC = '#f59e0b', '#fff6dd'
ROJO, ROJOC = '#dc2626', '#fdecec'


def esqueleto(u):
    u.h2('Esqueleto y articulaciones del miembro superior: dónde se rompe y qué se lesiona', intro='Cada fractura tiene un “vecino” en peligro. Este es el cuadro más preguntado de anatomía aplicada a la traumatología de miembro superior.')
    u.h3('Huesos y puntos de referencia')
    u.tabla(['Región', 'Huesos y accidentes', 'Articulaciones'], [
        ['Cintura escapular', '**Clavícula** (único hueso que une el miembro al tronco; fractura más frecuente en el tercio medio). **Escápula**: acromion, espina, coracoides, cavidad glenoidea.', 'Esternoclavicular, **acromioclavicular**, glenohumeral (la más móvil y la que más se luxa), escapulotorácica (no es articulación verdadera).'],
        ['Brazo', '**Húmero**: cabeza, cuello anatómico, tuberosidades (mayor y menor), **cuello quirúrgico**, surco bicipital, diáfisis con el **surco del nervio radial**, paleta humeral (epicóndilo, epitróclea, tróclea y cóndilo).', 'Glenohumeral y codo.'],
        ['Codo y antebrazo', '**Cúbito**: olécranon, apófisis coronoides, escotadura troclear. **Radio**: cabeza, cuello, tuberosidad bicipital, apófisis estiloides.', 'Humerocubital (bisagra), humerorradial y radiocubital proximal (pronosupinación); radiocubital distal.'],
        ['Muñeca', '**Fila proximal**: escafoides, semilunar, piramidal, pisiforme. **Fila distal**: trapecio, trapezoide, hueso grande (capitato) y ganchoso (hamato).', 'Radiocarpiana (radio con escafoides y semilunar) y mediocarpiana.'],
        ['Mano', '5 metacarpianos y 14 falanges (pulgar: 2; resto: 3).', 'Carpometacarpianas, metacarpofalángicas (MCF), interfalángicas proximales (IFP) y distales (IFD).'],
    ], fuente='Anatomía de referencia; patrones de fractura según Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., caps. 52-57.')
    u.box('tip', 'Huesos del carpo, para que no se te escape ninguno', ['Fila proximal (de radial a cubital): **E**scafoides, **S**emilunar, **P**iramidal, **P**isiforme.', 'Fila distal (de radial a cubital): **T**rapecio, **T**rapezoide, **G**rande, **G**anchoso.',
                                                                        'Frase clásica: “**E**l **S**apo **P**uso **P**ocos **T**ornillos **T**ras **G**olpear **G**arabatos”.'])
    u.h3('Fractura, estructura en riesgo y qué buscar')
    u.tabla(['Lesión', 'Estructura en riesgo', 'Cómo se manifiesta'], [
        ['**Clavícula** (tercio medio o lateral)', 'Vasos subclavios y plexo braquial por detrás; pleura apical.', 'Pulsos y examen neurológico; neumotórax si hay disnea.'],
        ['**Luxación anterior de hombro**', '**Nervio axilar**.', 'Hipoestesia en el “parche de regimiento” (cara lateral del hombro); deltoides sin contracción.'],
        ['**Cuello quirúrgico del húmero**', 'Nervio axilar y arteria circunfleja humeral posterior; arteria axilar en desplazamientos graves.', 'Igual que arriba; hematoma axilar.'],
        ['**Diáfisis humeral, tercio medio-distal** (Holstein-Lewis)', '**Nervio radial** en el surco de torsión.', 'Muñeca y dedos caídos; pérdida de sensibilidad del dorso de la mano.'],
        ['**Supracondílea de húmero** (niños)', '**Arteria braquial** y nervio mediano (en especial su rama interósea anterior).', 'Pulso radial ausente, dolor desproporcionado, extensión pasiva dolorosa: **síndrome compartimental (Volkmann)**.'],
        ['**Epitróclea** (fractura o luxación del codo)', '**Nervio cubital**, que pasa por detrás.', 'Parestesias en meñique y anular; garra cubital tardía.'],
        ['**Luxación de codo**', 'Arteria braquial y nervio mediano.', 'Palpar pulso radial y evaluar sensibilidad tras la reducción.'],
        ['**Cuello del radio**', 'Rama profunda del **nervio radial (interóseo posterior)**.', 'Dificultad para extender los dedos, sin pérdida de sensibilidad.'],
        ['**Monteggia** (cúbito proximal + luxación de la cabeza del radio)', 'Nervio interóseo posterior.', 'Igual que arriba.'],
        ['**Galeazzi** (radio distal + luxación radiocubital distal)', 'Articulación radiocubital distal; nervio cubital.', 'Prominencia de la cabeza del cúbito.'],
        ['**Colles** (extremo distal del radio, fragmento hacia dorsal)', '**Nervio mediano** (síndrome del túnel agudo); tendón del extensor largo del pulgar.', 'Deformidad “en dorso de tenedor”, parestesias en los tres dedos radiales.'],
        ['**Escafoides**', 'Su **irrigación**: retrógrada, entra por el polo distal.', 'Dolor en la **tabaquera anatómica**; la Rx inicial puede ser normal. Riesgo de **necrosis avascular del polo proximal** y seudoartrosis.'],
        ['**Luxación de semilunar**', 'Nervio mediano (compresión).', 'Parestesias y dolor agudo; “signo de la copa derramada”.'],
        ['**Ganchoso** (fractura del gancho)', 'Rama profunda del **nervio cubital** y tendones flexores del 4.º y 5.º dedo.', 'Dolor hipotenar al apretar; rotura tendinosa tardía.'],
        ['**Metacarpiano del 5.º dedo** (“fractura del boxeador”)', 'Rotación del dedo; lesión en herida por mordedura humana (“fight bite”).', 'Examinar rotación y heridas en los nudillos: **mordedura = antibiótico y lavado**.'],
    ], fuente='Anatomía de referencia y Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., caps. 52-57; Ramos Vértiz, Traumatología y Ortopedia, 2.ª ed.')
    u.box('alerta', 'Examen neurovascular antes y después de reducir', ['Siempre se documenta **antes** de anestesiar o inmovilizar. Si el déficit aparece después de la maniobra, la responsable es la maniobra, no la fractura.'])


def fig_plexo():
    L = '#64748b'
    s = ''
    # raíces
    raices = [('C5', 35), ('C6', 77), ('C7', 119), ('C8', 161), ('T1', 203)]
    for t, y in raices:
        s += caja(8, y - 14, 44, 28, t, AZC, AZ, 11, NAV, 'bold')
    # troncos
    trn = [('Tronco\nsuperior', 56), ('Tronco\nmedio', 119), ('Tronco\ninferior', 182)]
    for t, y in trn:
        s += caja(96, y - 18, 62, 36, t, AMAC, AMA, 9, NAV, 'bold')
    for a, b in [(35, 56), (77, 56), (119, 119), (161, 182), (203, 182)]:
        s += '<line x1="52" y1="%d" x2="96" y2="%d" stroke="%s" stroke-width="1.4"/>' % (a, b, L)
    # divisiones
    divs = [('Ant.', 40, 56), ('Post.', 72, 56), ('Ant.', 103, 119), ('Post.', 135, 119), ('Ant.', 166, 182), ('Post.', 198, 182)]
    for t, y, o in divs:
        s += caja(198, y - 11, 48, 22, 'Div. ' + t, '#f1f5f9', L, 8.6, NAV)
        s += '<line x1="158" y1="%d" x2="198" y2="%d" stroke="%s" stroke-width="1.4"/>' % (o, y, L)
    # cordones
    cord = [('Cordón\nlateral', 71), ('Cordón\nposterior', 135), ('Cordón\nmedial', 200)]
    for t, y in cord:
        s += caja(292, y - 18, 66, 36, t, VERC, VER, 9, NAV, 'bold')
    for a, b in [(40, 71), (103, 71), (72, 135), (135, 135), (198, 135), (166, 200)]:
        s += '<line x1="246" y1="%d" x2="292" y2="%d" stroke="%s" stroke-width="1.4"/>' % (a, b, L)
    # terminales
    term = [('Musculocutáneo (C5-C7)', 30), ('Axilar (C5-C6)', 78), ('Radial (C5-T1)', 120), ('Mediano (C6-T1)', 165), ('Cubital (C8-T1)', 215)]
    for t, y in term:
        s += caja(404, y - 14, 146, 28, t, ROJOC, ROJO, 9.6, NAV, 'bold')
    for a, b in [(71, 30), (71, 165), (135, 78), (135, 120), (200, 165), (200, 215)]:
        s += '<line x1="358" y1="%d" x2="404" y2="%d" stroke="%s" stroke-width="1.4"/>' % (a, b, L)
    for x, t in [(30, 'RAÍCES'), (127, 'TRONCOS'), (222, 'DIVISIONES'), (325, 'CORDONES'), (477, 'RAMOS TERMINALES')]:
        s += txt(x, 244, t, 9, '#64748b', 'middle', 'bold')
    return svg(560, 256, s)


def plexo(u):
    u.h2('Plexo braquial: origen, trayecto, ramas y bloqueos', intro='Todo el miembro superior se mueve y siente por este plexo. Si lo ordenás por niveles, se arma solo.')
    u.fig(fig_plexo(), 'Plexo braquial: raíces, troncos, divisiones, cordones y ramos terminales. Las divisiones anteriores forman los cordones lateral y medial; las posteriores, el cordón posterior.', 'Esquema propio a partir de anatomía de referencia.')
    fotos(u, 'plexo_esq', 'plexo_diseccion')
    u.box('tip', 'Nemotecnia', ['**R**eal **T**eachers **D**rink **C**old **B**eer: **R**aíces, **T**roncos, **D**ivisiones, **C**ordones, **R**amos (en inglés “Branches”).',
                                 'Los cordones se llaman por su relación con la **arteria axilar** (en la 2.ª porción, detrás del pectoral menor).'])
    u.h3('Dónde está en el cuerpo')
    u.ul(['Las **raíces** (ramos anteriores de C5-C8 y T1) salen entre los músculos **escaleno anterior y medio**, en el triángulo posterior del cuello, por encima de la arteria subclavia.',
          'Los **troncos** cruzan el triángulo posterior y pasan por **detrás de la clavícula** (divisiones).',
          'Los **cordones** rodean la **arteria axilar** en la axila.',
          'Los **ramos terminales** se separan a la altura del borde inferior del pectoral menor.'])
    u.h3('Ramas colaterales')
    u.tabla(['Origen', 'Nervio (raíces)', 'Músculos / territorio', 'Lesión'], [
        ['Raíces', '**Dorsal de la escápula** (C5)', 'Romboides y elevador de la escápula', 'Escápula descentrada'],
        ['Raíces', '**Torácico largo** (C5-C7)', '**Serrato anterior**', '**Escápula alada**: se lesiona en el vaciamiento axilar y la mastectomía'],
        ['Tronco superior', '**Supraescapular** (C5-C6)', 'Supraespinoso e infraespinoso', 'Pérdida de abducción inicial y rotación externa'],
        ['Cordón lateral', 'Pectoral lateral (C5-C7)', 'Pectoral mayor', '—'],
        ['Cordón medial', 'Pectoral medial (C8-T1), cutáneo medial del brazo (T1), cutáneo medial del antebrazo (C8-T1)', 'Pectorales y piel de la cara medial', 'Hipoestesia medial'],
        ['Cordón posterior', 'Subescapulares (C5-C6), **toracodorsal** (C6-C8)', 'Subescapular, redondo mayor, dorsal ancho', '—'],
    ], fuente='Anatomía de referencia (plexo braquial).')
    u.h3('Ramos terminales: resumen de una línea')
    u.tabla(['Nervio', 'Cordón', 'Mueve', 'Siente'], [
        ['**Musculocutáneo**', 'Lateral', 'Coracobraquial, bíceps y braquial: **flexión del codo**', 'Cara lateral del antebrazo (cutáneo lateral)'],
        ['**Axilar**', 'Posterior', 'Deltoides y redondo menor: **abducción** del hombro 15°-90°', 'Parche lateral del hombro'],
        ['**Radial**', 'Posterior', 'Tríceps, extensores de muñeca y dedos, supinador, braquiorradial', 'Dorso de la mano (lado radial)'],
        ['**Mediano**', 'Lateral + medial', 'Pronadores, flexores (menos FCU y la mitad cubital del FDP), eminencia tenar', 'Palma lateral, 3 dedos y medio'],
        ['**Cubital**', 'Medial', 'FCU, mitad cubital del FDP, hipotenar, interóseos, aductor del pulgar, 2 lumbricales mediales', 'Meñique y medio anular'],
    ])
    u.h3('Lesiones características del plexo')
    u.tabla(['Lesión', 'Raíces', 'Mecanismo típico', 'Postura y clínica'], [
        ['**Erb-Duchenne** (alta)', 'C5-C6', 'Tracción cabeza-hombro: parto distócico, caída de moto.', 'Brazo en **aducción y rotación interna**, antebrazo pronado (“mano de mozo que pide propina”). Sin abducción ni flexión del codo.'],
        ['**Klumpke** (baja)', 'C8-T1', 'Tracción hacia arriba del brazo (agarrarse al caer).', '**Mano en garra**; si compromete T1: **síndrome de Horner** (ptosis, miosis, anhidrosis).'],
        ['**Completa**', 'C5-T1', 'Trauma de alta energía.', 'Miembro **flácido**, sin sensibilidad.'],
    ], fuente='Anatomía de referencia.')
    u.h3('Bloqueos regionales: nivel y lo que se pierde')
    u.tabla(['Bloqueo', 'Dónde', 'Anestesia', 'Complicación anatómica'], [
        ['**Interescalénico**', 'Entre escalenos, a nivel C6', 'Hombro y brazo proximal. **Respeta el cubital** (C8-T1).', '**Parálisis frénica** homolateral (casi 100 %), síndrome de Horner, disfonía.'],
        ['**Supraclavicular**', 'Por encima de la clavícula, lateral a la arteria subclavia', 'Brazo, antebrazo y mano (“la raquianestesia del miembro superior”).', '**Neumotórax** (la cúpula pleural está debajo); parálisis frénica menos frecuente.'],
        ['**Infraclavicular**', 'Debajo de la clavícula, alrededor de la axilar', 'Brazo distal, antebrazo y mano.', 'Punción vascular; neumotórax menos probable.'],
        ['**Axilar**', 'Alrededor de la arteria axilar, en la axila', 'Antebrazo y mano. El **musculocutáneo** queda fuera (viaja en el coracobraquial) y se bloquea aparte.', 'Hematoma, inyección intravascular.'],
    ], fuente='Anatomía de referencia y técnica de anestesia locorregional (Giménez, Cirugía, 2.ª ed., 2025; Michans, Cirugía, 5.ª ed.).')


def arterias(u):
    u.h2('Arterias del miembro superior: recorrido, ramas y circulación colateral', intro='Seguí el tronco arterial de proximal a distal y recordá dónde cambia de nombre y dónde se puede palpar.')
    u.fig(flujo(['Tronco braquiocefálico (derecha) o arco aórtico (izquierda)', 'Subclavia (hasta el borde lateral de la 1.ª costilla)', 'Axilar (hasta el borde inferior del redondo mayor)', 'Braquial (hasta la fosa cubital)', 'Radial y cubital (se separan bajo el lacertus fibrosus)', 'Arcos palmares superficial y profundo → digitales'], por_fila=3), 'Cambios de nombre de la arteria del miembro superior.', 'Esquema propio a partir de anatomía de referencia.')
    fotos(u, 'arterias')
    u.h3('Subclavia y axilar')
    u.ul(['**Subclavia**: nace a la **derecha** del tronco braquiocefálico y a la **izquierda** directamente del arco aórtico. Ramas: vertebral, torácica interna, tronco tirocervical y costocervical. Cambia de nombre al cruzar el **borde lateral de la 1.ª costilla**.',
          '**Axilar**: se divide en **3 porciones** según el pectoral menor: 1.ª (arriba) con la **torácica superior**; 2.ª (detrás) con la **toracoacromial** y la **torácica lateral**; 3.ª (abajo) con la **subescapular** y las **circunflejas humeral anterior y posterior**.'])
    u.box('tip', 'Ramas de la axilar: 6 ramas, 1-2-3', ['**S**crew **T**he **L**awyer, **S**ave **A**nother **P**atient → **S**uperior torácica, **T**oracoacromial, **L**ateral torácica, **S**ubescapular, circunfleja humeral **A**nterior, circunfleja humeral **P**osterior.',
                                                         'Cantidad por porción: **1 – 2 – 3**.'])
    u.h3('Braquial')
    u.ul(['Sigue al **borde medial del bíceps**, en el canal bicipital medial, junto con el **nervio mediano** (que lo cruza de lateral a medial) y la vena basílica. Es la arteria donde se mide la **presión arterial**.',
          'Ramas: **braquial profunda** (acompaña al nervio radial por el surco radial) y **colaterales cubitales superior e inferior** (forman la red anastomótica del codo).',
          'En la fosa cubital, el **lacertus fibrosus** (aponeurosis bicipital) pasa por encima de la arteria y del nervio mediano, y protege a la arteria de la venopunción en la mediana cubital.'])
    u.h3('Radial y cubital')
    u.tabla(['', 'Radial', 'Cubital'], [
        ['Recorrido', 'Entre el braquiorradial y el flexor radial del carpo. En la muñeca es **superficial y palpable** (pulso radial). Rodea la **tabaquera anatómica** y atraviesa el 1.er espacio interóseo para formar el **arco palmar profundo**.', 'Más grande. Pasa profunda al pronador redondo y baja entre el FDS y el FDP junto al **nervio cubital** (en los 2/3 distales). Entra a la mano por el **canal de Guyon**, lateral al pisiforme y al nervio cubital, y forma el **arco palmar superficial**.'],
        ['Ramas principales', 'Recurrente radial, palmar superficial, carpianas, **principal del pulgar**, radial del índice.', 'Recurrentes cubitales anterior y posterior, **interósea común** (se divide en interósea anterior y posterior), carpianas, palmar profunda.'],
        ['Predominio en la mano', 'Arco profundo', '**Arco superficial** (suele predominar la cubital)'],
    ], fuente='Anatomía de referencia.')
    u.h3('Arcos palmares')
    u.ul(['**Arco superficial**: más distal; se ubica a la altura del borde distal del pulgar extendido (pulgar en abducción máxima). De él nacen las **arterias digitales comunes** y luego las **propias**.',
          '**Arco profundo**: aproximadamente 1 cm más proximal, sobre las bases de los metacarpianos, dentro del espacio medio palmar.',
          '**Dedos**: dos arterias digitales propias por dedo, en el borde **palmar-lateral**, con el **nervio digital palmar por delante**. Se ocluye una sin necrosis; ambas del mismo dedo, sí.'])
    u.box('clave', 'Test de Allen', ['Comprimir radial y cubital a la vez, hacer cerrar y abrir la mano hasta palidez y soltar **una**. Si la mano vuelve a su color en **menos de 5-6 s**, la otra arteria la perfunde bien.',
                                     'Se usa antes de **canular la radial** o de usar la arteria como injerto. En la herida de mano: orienta qué arteria se lesionó.'])
    u.h3('Circulación colateral: por qué la ligadura puede funcionar')
    u.ul(['**Periescapular** (anastomosis entre ramas de la subclavia y la axilar): permite ligar la axilar **proximal a la subescapular** con riesgo moderado de isquemia.',
          '**Periarticular del codo** (colaterales cubitales y recurrentes de radial, cubital e interósea): sostiene la irrigación si se liga la braquial **por debajo del origen de la braquial profunda**.',
          'El **arco palmar** (superficial y profundo) compensa la oclusión de una de las dos arterias del antebrazo.'])
    u.box('alerta', 'Lesión arterial: signos duros y blandos', [['**Duros** (operar ya): hemorragia pulsátil, hematoma expansivo, ausencia de pulsos, soplo o frémito, signos de isquemia (palidez, frialdad, parestesias).',
                                                               '**Blandos**: hematoma estable, déficit nervioso, herida próxima a un vaso, pulso disminuido. Se estudia con índice y angiotomografía o ecografía Doppler.'],
                                                              'Mecanismos típicos: **supracondílea** y luxación de codo → braquial; **fractura de clavícula o primera costilla** → subclavia; **luxación de hombro** o fractura de cuello quirúrgico → axilar.'])


def venas_linfaticos(u):
    u.h2('Venas y linfáticos: venopunción, infección de mano y vaciamiento axilar', intro='Las venas superficiales se usan todos los días. Los linfáticos explican por qué una infección de dedo termina en ganglio axilar.')
    u.h3('Venas superficiales')
    u.tabla(['Vena', 'Recorrido', 'Desemboca', 'Nota práctica'], [
        ['**Cefálica**', 'Borde lateral (radial) de la mano y antebrazo → surco deltopectoral', 'Perfora la fascia clavipectoral y entra en la vena axilar **debajo de la clavícula**', 'Se usa para accesos y para “disección venosa”.'],
        ['**Basílica**', 'Borde medial (cubital) → perfora la fascia braquial a la mitad del brazo', 'Se une con las venas braquiales y forma la axilar (en el borde inferior del redondo mayor)', 'Cerca del nervio cutáneo medial del antebrazo.'],
        ['**Mediana cubital**', 'Une la cefálica con la basílica en la fosa cubital, **por delante del lacertus fibrosus**', '—', '**Mejor vena para venopunción**: el lacertus aleja la arteria braquial y el nervio mediano.'],
    ], fuente='Anatomía de referencia.')
    u.box('alerta', 'Complicaciones de la venopunción en la fosa cubital', ['Lesión de los **nervios cutáneos antebraquiales** (medial y lateral) y punción accidental de la **arteria braquial**.'])
    u.h3('Venas profundas y retorno')
    u.p('Cada arteria del antebrazo y brazo se acompaña de **dos venas** (concomitantes). Al llegar a la axila forman la **vena axilar**; al pasar el **borde lateral de la 1.ª costilla** pasa a ser **subclavia** y, junto con la yugular interna, forma el **tronco braquiocefálico** y la vena cava superior. Un **catéter central por subclavia** pasa por debajo de la clavícula; la trombosis de esfuerzo (**síndrome de Paget-Schroetter**) ocurre por compresión en la salida torácica.')
    u.h3('Linfáticos')
    u.ul(['**Superficiales**: siguen a las venas cefálica y basílica. **Profundos**: siguen a los vasos arteriales.',
          '**Ganglios epitrocleares**: sobre la epitróclea; reciben mano y antebrazo cubital. Un epitroclear aumentado de tamaño orienta a **infección o tumor** de la mano.',
          '**Ganglios axilares** (20-30), en 5 grupos: **pectorales (anteriores)**, **subescapulares (posteriores)**, **humerales (laterales)**, **centrales** y **apicales (infraclaviculares)**.',
          '**Niveles quirúrgicos de Berg**: nivel I (laterales al borde del pectoral menor), nivel II (por detrás de él) y nivel III (mediales a su borde medial).',
          'El drenaje converge en el **tronco subclavio** → **conducto torácico** (izquierda) o conducto linfático derecho.'])
    u.box('clin', 'Infección de la mano', ['Una infección de un dedo puede producir **linfangitis ascendente** (líneas rojas) y adenopatía epitroclear y axilar.',
                                          'Tras un vaciamiento axilar queda en riesgo el **linfedema** del miembro, por eso se evitan punciones, presión arterial y venopunciones en ese lado.'])
