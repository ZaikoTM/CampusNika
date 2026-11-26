# -*- coding: utf-8 -*-
"""UP 1 · Anatomía quirúrgica. Parte C: nervios periféricos, regiones, muñeca y mano, autoevaluación."""
from lib import svg, txt, caja, flecha, codo, flujo
from .fotos import fotos


def nervios(u):
    u.h2('Nervios periféricos del miembro superior: recorrido, relaciones, lesión y examen', intro='Cinco nervios, cada uno con su “lugar de lesión” y su signo. Es el bloque que más se pregunta en la herida de mano y en la fractura.')
    u.h3('Axilar y musculocutáneo')
    u.tabla(['', 'Axilar (C5-C6)', 'Musculocutáneo (C5-C7)'], [
        ['Origen', 'Cordón posterior', 'Cordón lateral'],
        ['Recorrido y relaciones', 'Sale de la axila por el **cuadrilátero humerotricipital** (con la arteria circunfleja humeral posterior), **rodea el cuello quirúrgico** del húmero por detrás.', '**Perfora el coracobraquial**; baja entre el bíceps y el braquial. Termina como cutáneo lateral del antebrazo, lateral al tendón del bíceps.'],
        ['Motor', 'Deltoides y redondo menor', 'Coracobraquial, bíceps braquial y braquial'],
        ['Sensitivo', 'Parche lateral del hombro', 'Cara lateral del antebrazo'],
        ['Lesión', 'Luxación anterior de hombro y fractura del cuello quirúrgico: **pérdida de abducción** y atrofia del deltoides.', 'Poco frecuente (herida, bloqueo): **flexión del codo débil** y anestesia lateral del antebrazo.'],
    ], fuente='Anatomía de referencia.')
    fotos(u, 'axila_nervios')
    u.h3('Radial (C5-T1)')
    u.ul(['**Recorrido**: continúa al cordón posterior, pasa **detrás de la arteria braquial** y entra al **surco radial** del húmero con la **arteria braquial profunda**, entre las cabezas del tríceps. Perfora el tabique intermuscular lateral en el tercio distal del brazo y baja entre el **braquial y el braquiorradial**.',
          'En la fosa cubital se divide en una **rama superficial** (sensitiva) y una **profunda** (el **interóseo posterior**, motor), que **atraviesa el supinador** por la **arcada de Frohse**.',
          '**Motor**: tríceps y ancóneo; braquiorradial y extensores de la muñeca (rama principal); extensores de los dedos, abductor largo del pulgar y demás extensores del antebrazo (interóseo posterior).',
          '**Sensitivo (rama superficial)**: dorso de la mano del lado radial y dorso de los 3 dedos y medio radiales (hasta la IFP). Corre **junto a la arteria radial** y debajo del braquiorradial: se lesiona con una herida de la muñeca lateral.'])
    fotos(u, 'radial')
    u.box('clin', 'Lesión del radial según el nivel', [['**Axila** (muletas): pérdida del tríceps, extensión de muñeca y dedos.',
                                                      '**Surco radial** (fractura de diáfisis humeral, compresión, “parálisis del sábado a la noche”): **mano caída**, el tríceps se conserva.',
                                                      '**Interóseo posterior** (arcada de Frohse): **dedos caídos** con extensión de muñeca conservada (por el extensor radial largo del carpo), sin pérdida de sensibilidad.']])
    u.h3('Mediano (C6-T1)')
    u.ul(['**Brazo**: desciende en el canal bicipital medial **lateral a la arteria braquial** y la **cruza por delante** a mitad del brazo, para quedar **medial** a ella.',
          '**Fosa cubital**: medial a la arteria, **debajo del lacertus fibrosus**. Pasa **entre las dos cabezas del pronador redondo** (puede comprimirse: síndrome del pronador).',
          '**Antebrazo**: desciende **entre el FDS y el FDP**, dando la **rama interósea anterior** (flexor largo del pulgar, FDP de índice y medio y pronador cuadrado).',
          '**Muñeca**: queda superficial, entre el flexor radial del carpo y el palmar largo; la **rama palmar cutánea** nace unos 5 cm proximal y pasa **por encima del retináculo flexor** (sensibilidad de la eminencia tenar). Atraviesa el **túnel carpiano**.',
          '**Mano**: la **rama recurrente (tenar)** nace **distal al retináculo** e inerva abductor corto del pulgar, oponente y la cabeza superficial del flexor corto. Da los nervios digitales a los 3 dedos y medio radiales y a los 2 lumbricales laterales.'])
    u.box('alerta', 'Síndrome del túnel carpiano: la anatomía explica el cuadro', ['Compresión del mediano **bajo el retináculo**. Parestesias nocturnas en los **3 dedos y medio radiales**. **No hay pérdida sensitiva de la eminencia tenar**, porque la rama palmar cutánea pasa por encima del túnel.',
                                                                              'Una incisión de liberación se traza **en la línea del 4.º dedo**, hacia el lado cubital de la eminencia tenar, para no lesionar la rama recurrente ni la palmar cutánea.'])
    u.box('clin', 'Lesión alta y baja del mediano', [['**Alta** (codo, antebrazo): **mano de bendición** al intentar cerrar el puño (no flexionan índice ni medio), no hay oposición y se pierde la pronación.',
                                                    '**Baja** (muñeca): atrofia tenar (“mano de simio”), no hay oposición del pulgar; la flexión de los dedos se conserva.',
                                                    '**Signo de OK anormal** (no se hace la pinza): lesión del interóseo anterior (flexión de la IFD del pulgar y del índice).']])
    fotos(u, 'mediano_mano')
    u.h3('Cubital (C8-T1)')
    u.ul(['**Brazo**: medial a la braquial hasta la mitad; **perfora el tabique intermuscular medial** y desciende por el compartimento posterior hasta la **epitróclea**.',
          '**Codo**: pasa **detrás de la epitróclea** (canal epitroclear, “hueso de la risa”) y **entre las dos cabezas del flexor cubital del carpo** (túnel cubital). Es muy superficial: se comprime y se golpea.',
          '**Antebrazo**: entre el FCU y el FDP; en los **2/3 distales acompaña a la arteria cubital**. Da una **rama dorsal** (~5 cm antes de la muñeca; sensibilidad del dorso cubital) y una palmar cutánea.',
          '**Muñeca**: **canal de Guyon**, entre el **pisiforme** y el **gancho del ganchoso**, junto a la arteria cubital (que queda lateral). Se divide en **rama superficial** (sensitiva y palmar corto) y **profunda** (motora).',
          '**Motor**: FCU y mitad cubital del FDP (antebrazo); hipotenar, todos los interóseos, 2 lumbricales mediales, aductor del pulgar y cabeza profunda del flexor corto del pulgar (mano).'])
    u.box('clin', 'Lesión del cubital', [['**Garra cubital**: hiperextensión de la MCF y flexión de la IFP e IFD del 4.º y 5.º dedo, por pérdida de los lumbricales e interóseos.',
                                          '**Paradoja**: la lesión **alta** (codo) produce **menos garra** porque se pierde también el FDP cubital; la **baja** (muñeca) produce más garra.',
                                          '**Signo de Froment** (flexión de la IF del pulgar al sostener un papel, por falla del aductor), **Wartenberg** (meñique abducido), pérdida de sensibilidad del meñique y la mitad cubital del anular.']])
    u.h3('Cómo se examina cada nervio en una herida de mano (sin hacerle daño)')
    u.tabla(['Nervio', 'Motor: pedile que…', 'Sensitivo: zona autónoma', 'Signo'], [
        ['**Mediano**', 'Haga el signo “**OK**” (pinza pulpejo-pulpejo) y oponga el pulgar al meñique', 'Pulpejo del **índice**', 'Mano de bendición; atrofia tenar'],
        ['**Cubital**', '**Abra y cierre** los dedos (abducción) o cruce el medio sobre el índice', 'Pulpejo del **meñique**', 'Garra, Froment'],
        ['**Radial**', 'Extienda la muñeca y los dedos (“pare”); pulgar hacia arriba (“como autostop”)', 'Dorso del **1.er espacio interdigital**', 'Mano caída'],
    ], fuente='Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., cap. 11 (semiología del miembro superior), y anatomía de referencia.')
    u.box('clave', 'Sensibilidad: antes de anestesiar', 'Se mide con **discriminación de dos puntos** en el pulpejo (normal: menos de 6 mm) o con tacto simple. **Se documenta antes de infiltrar**: si no, no se puede saber si el déficit lo causó la herida o el anestésico.')


def regiones(u):
    u.h2('Regiones: axila, brazo, fosa cubital y antebrazo', intro='Los espacios y compartimentos explican por dónde corre una infección, dónde se comprime un nervio y qué se abre en una fasciotomía.')
    u.h3('Axila')
    u.tabla(['Pared / límite', 'Formada por'], [
        ['Anterior', 'Pectoral mayor y menor, fascia clavipectoral'],
        ['Posterior', 'Subescapular, redondo mayor y dorsal ancho'],
        ['Medial', 'Serrato anterior y costillas (1.ª-4.ª) con sus espacios intercostales'],
        ['Lateral', 'Surco intertubercular del húmero, coracobraquial y bíceps'],
        ['Vértice (canal cervicoaxilar)', 'Entre la clavícula, la 1.ª costilla y el borde superior de la escápula: pasan vasos y plexo'],
        ['Base', 'Piel y fascia axilar'],
    ], fuente='Anatomía de referencia.')
    u.ul(['**Contenido**: arteria y vena axilares, plexo braquial (cordones), ganglios linfáticos y grasa.',
          '**Nervios que se ven en el vaciamiento axilar**: **torácico largo** (cara medial, sobre el serrato), **toracodorsal** (con los vasos del mismo nombre) e **intercostobraquial** (T2; da hipoestesia medial del brazo).',
          '**Espacios del hombro posterior**: **cuadrilátero humerotricipital** (nervio axilar y circunfleja posterior), **triángulo humerotricipital** (nervio radial y arteria braquial profunda) y **triángulo omotricipital** (arteria circunfleja escapular).'])
    u.h3('Brazo')
    u.tabla(['Compartimento', 'Músculos', 'Nervio', 'Contenido neurovascular'], [
        ['**Anterior** (flexor)', 'Bíceps, braquial y coracobraquial', 'Musculocutáneo', 'Arteria braquial, nervio mediano, vena basílica y cubital (canal bicipital medial)'],
        ['**Posterior** (extensor)', 'Tríceps', 'Radial', 'Arteria braquial profunda en el surco radial'],
    ], fuente='Anatomía de referencia.')
    u.p('Los **tabiques intermusculares medial y lateral** separan los dos compartimentos. El nervio radial perfora el lateral en el tercio distal y el cubital el medial a mitad del brazo.')
    u.h3('Fosa cubital')
    u.ul(['**Forma de triángulo**: base = línea que une los dos epicóndilos; lado lateral = braquiorradial; lado medial = pronador redondo. **Techo**: piel, venas, aponeurosis bicipital (lacertus fibrosus). **Suelo**: braquial y supinador.',
          '**Contenido, de lateral a medial**: tendón del bíceps, arteria braquial, nervio mediano. Regla: **T**endón – **A**rteria – **N**ervio (“**TAN**”). El nervio radial queda lateral, entre el braquial y el braquiorradial.'])
    u.h3('Antebrazo: compartimentos y su nervio')
    u.tabla(['Compartimento', 'Músculos', 'Nervio'], [
        ['**Anterior superficial**', 'Pronador redondo, flexor radial del carpo, palmar largo, FCU; FDS (capa intermedia)', 'Mediano (el FCU, cubital)'],
        ['**Anterior profundo**', 'FDP, flexor largo del pulgar y pronador cuadrado', 'Mediano (interóseo anterior) y cubital (mitad medial del FDP)'],
        ['**Posterior superficial**', 'Extensor de los dedos, extensor del meñique, extensor cubital del carpo, ancóneo; “móvil de Henry”: braquiorradial y extensores radiales del carpo', 'Radial'],
        ['**Posterior profundo**', 'Supinador, abductor largo, extensor corto y largo del pulgar, extensor del índice', 'Interóseo posterior (radial)'],
    ], fuente='Anatomía de referencia.')
    u.box('alerta', 'Síndrome compartimental del antebrazo', ['Aparece tras fracturas, aplastamiento o yeso apretado. **Dolor desproporcionado y dolor con la extensión pasiva de los dedos** (por el compartimento flexor), tensión del antebrazo y parestesias; el pulso radial puede estar presente.',
                                                                'El tratamiento es la **fasciotomía** (volar y, si hace falta, dorsal) urgente. La isquemia prolongada deja la **contractura isquémica de Volkmann**.'])


def mano(u):
    u.h2('Muñeca y mano: túneles, tendones, vainas y espacios', intro='Es el apartado con más peso en el examen de herida de mano. Tenés que saber qué pasa por cada túnel y cómo se examina cada tendón.')
    fotos(u, 'mano_diseccion')
    u.h3('Túnel carpiano y canal de Guyon')
    u.tabla(['', 'Túnel carpiano', 'Canal de Guyon'], [
        ['Límites', 'Piso: huesos del carpo. Techo: **retináculo flexor** (entre escafoides-trapecio y pisiforme-ganchoso).', 'Entre el **pisiforme** (medial) y el **gancho del ganchoso** (lateral); techo: ligamento palmar. Superficial al retináculo.'],
        ['Contenido', '**9 tendones** (4 FDS, 4 FDP y flexor largo del pulgar) y el **nervio mediano**. El flexor radial del carpo tiene su propio canal.', '**Nervio cubital** (se divide en superficial y profunda) y **arteria cubital**.'],
        ['Cuadro típico', 'Síndrome del túnel carpiano', 'Parestesias de meñique y anular; debilidad de los músculos intrínsecos'],
    ], fuente='Anatomía de referencia y Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., cap. 14.')
    fotos(u, 'tunel', 'tunel_rv')
    u.h3('Compartimentos extensores del dorso de la muñeca')
    u.tabla(['Compartimento', 'Tendones', 'Cuadro clínico asociado'], [
        ['1.º', 'Abductor largo y extensor corto del pulgar', '**Tenosinovitis de De Quervain**'],
        ['2.º', 'Extensores radiales del carpo (largo y corto)', 'Síndrome de intersección'],
        ['3.º', 'Extensor largo del pulgar (rodea el **tubérculo de Lister**)', 'Rotura tras fractura de radio distal'],
        ['4.º', 'Extensor de los dedos y extensor del índice', 'Ganglión dorsal'],
        ['5.º', 'Extensor del meñique', '—'],
        ['6.º', 'Extensor cubital del carpo', 'Tendinitis y subluxación'],
    ], fuente='Anatomía de referencia.')
    u.box('def', 'Tabaquera anatómica', 'Depresión en el lado radial de la muñeca. **Límites**: extensor largo del pulgar (dorsal-cubital); abductor largo y extensor corto del pulgar (palmar-radial). **Suelo**: escafoides y trapecio. **Contenido**: arteria radial, rama superficial del nervio radial y vena cefálica. **Dolor a la presión = fractura de escafoides hasta que se demuestre lo contrario.**')
    u.h3('Tendones flexores de los dedos')
    u.ul(['**FDS** (flexor superficial): se inserta en la **falange media** y flexiona la **IFP**. Se **divide** (quiasma de Camper) para dejar pasar al FDP.',
          '**FDP** (flexor profundo): atraviesa la hendidura del FDS y se inserta en la **falange distal**; flexiona la **IFD**. Nace del mismo vientre muscular en los dedos medio, anular y meñique (por eso se flexionan a la vez).',
          '**Poleas anulares** (A1 a A5) y cruciformes mantienen el tendón pegado al hueso. **A2** (falange proximal) y **A4** (falange media) son las **críticas**; si se pierden, el tendón se separa del hueso (“cuerda de arco”).',
          '**Vainas sinoviales**: del pulgar (continua con la **bursa radial**) y del meñique (continua con la **bursa cubital**). Las bursas radial y cubital pueden comunicarse en el **espacio de Parona**: la tenosinovitis supurada del pulgar y del meñique se propaga al antebrazo (**flemón en herradura**).',
          '**Lumbricales**: nacen del FDP; flexionan la MCF y extienden las IF. Los 2 laterales los inerva el mediano; los 2 mediales, el cubital.'])
    u.h3('Zonas de los tendones flexores (Verdan)')
    u.tabla(['Zona', 'Dónde', 'Qué hay y qué significa'], [
        ['**I**', 'Distal a la inserción del FDS en la falange media', 'Solo el FDP. Avulsión = “**dedo en jersey**” (el anular es el más afectado).'],
        ['**II**', 'Del pliegue palmar distal a la inserción del FDS', '“**Tierra de nadie**” (Bunnell): FDS y FDP juntos, en la vaina y bajo las poleas: **peor pronóstico**, reparación por cirujano de mano.'],
        ['**III**', 'Palma, entre el túnel carpiano y la vaina', 'Lumbricales y arcos vasculares.'],
        ['**IV**', 'Túnel carpiano', '9 tendones y el mediano.'],
        ['**V**', 'Antebrazo distal', 'Vientres musculares; reparación más favorable.'],
    ], fuente='Anatomía de referencia (clasificación de Verdan) y Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., cap. 15.')
    u.h3('Cómo se examinan los flexores')
    u.tabla(['Tendón', 'Maniobra', 'Qué se ve si está cortado'], [
        ['**FDP**', 'Se **fija la IFP** en extensión y se le pide flexionar la **IFD**', 'No flexiona la IFD'],
        ['**FDS**', 'Se mantienen **en extensión los otros dedos** (anula el FDP) y se pide flexionar la **IFP**', 'No flexiona la IFP'],
        ['**Cascada de los dedos**', 'Mano relajada: los dedos se flexionan **progresivamente** del índice al meñique', 'Un dedo más extendido que sus vecinos'],
        ['**Tenodesis**', 'Flexión pasiva de la muñeca → los dedos se extienden; extensión de la muñeca → se flexionan', 'Se pierde el movimiento pasivo del dedo'],
    ], fuente='Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., caps. 11 y 15.')
    u.h3('Tendones extensores y mecanismo extensor')
    u.ul(['**Zonas**: I = IFD, II = falange media, III = IFP, IV = falange proximal, V = MCF, VI = metacarpo, VII = retináculo extensor, VIII = antebrazo distal, IX = antebrazo proximal.',
          '**Mecanismo extensor de los dedos**: la **banda central** se inserta en la base de la falange media y las **bandas laterales** convergen en el **tendón terminal** de la falange distal. Las **bandas sagitales** lo centran sobre la MCF.',
          '**Dedo en martillo** (mallet): rotura del tendón terminal; la IFD queda flexionada y no se extiende. **Boutonnière** (en ojal): rotura de la banda central; IFP flexionada e IFD hiperextendida.'])
    u.h3('Músculos intrínsecos y espacios profundos de la palma')
    u.ul(['**Eminencia tenar**: abductor corto (mediano), oponente (mediano), flexor corto del pulgar (superficial mediano, profundo cubital) y aductor del pulgar (cubital).',
          '**Eminencia hipotenar**: abductor, flexor corto y oponente del meñique, y palmar corto (todos cubital).',
          '**Interóseos** (cubital): **dorsales abducen** (**DAB**) y **palmares aducen** (**PAD**). Mnemotecnia de uso clásico.',
          '**Espacios profundos**: **tenar** y **mediopalmar**, separados por un tabique, y espacio de **Parona** en el antebrazo distal. En los abscesos profundos la inflamación se ve en el dorso (edema) aunque el pus esté en la palma.',
          '**Signos de Kanavel de la tenosinovitis flexora**: dedo en **flexión leve**, **dolor con la extensión pasiva**, tumefacción fusiforme y dolor a la palpación a lo largo de la vaina.'])
    u.h3('Sensibilidad de la mano')
    u.tabla(['Cara', 'Mediano', 'Cubital', 'Radial'], [
        ['**Palmar**', '3 dedos y medio radiales, eminencia tenar (por la palmar cutánea)', 'Meñique y la mitad del anular, borde cubital de la palma', '—'],
        ['**Dorsal**', 'Falanges **distales** del índice, medio y mitad del anular', 'Dorso cubital y 1 dedo y medio (rama dorsal)', 'Dorso radial y 2 dedos y medio hasta la IFP'],
        ['**Zona autónoma**', 'Pulpejo del **índice**', 'Pulpejo del **meñique**', '**Dorso del 1.er espacio interdigital**'],
    ], fuente='Anatomía de referencia.')
    u.box('clave', 'Dedos: pedículos', ['En cada lado del dedo corren el **nervio digital** (más superficial y palmar) y la **arteria digital**, en el borde **palmar-lateral**; las venas van por el dorso.',
                                       'En los dedos, el **bloqueo digital (Oberst)** se hace infiltrando **a ambos lados de la base**, por detrás de las bifurcaciones digitales.'])
    u.box('dif', 'Adrenalina en el dedo: dos criterios', [['**Clásico** (muchos textos): no usar anestésico con vasoconstrictor en dedos, por temor a isquemia.',
                                                         '**Actual** (Lalonde y col., “cirugía de mano con paciente despierto”): la adrenalina **diluida** a bajas dosis es segura en la mano y en los dedos.'],
                                                        'Si hay duda o dedo con circulación comprometida, evitarla es lo más prudente. Contrastalo con la bibliografía de tu cátedra.'])
    u.h3('Posición funcional y posición segura de la mano')
    u.ul(['**Posición funcional** (“de agarrar un vaso”): muñeca en **20°-30° de extensión**, MCF y IFP semiflexionadas, pulgar en oposición.',
          '**Posición segura (intrínseca-plus) para inmovilizar**: muñeca extendida 20°-30°, **MCF flexionadas 70°-90°**, **IF en extensión**. La razón es anatómica: los ligamentos colaterales de la MCF se **tensan en flexión** (en extensión se acortan) y los de las IF se acortan en flexión; así se evita la rigidez.'])


def choices(u):
    u.seccion_q()
    u.sub_q('Anatomía aplicada de UP1', 'Respondé sin mirar el recuadro y compará con la justificación.')
    u.caso('Luxación de hombro', 'Hombre de 24 años, luxación anterior glenohumeral por caída en un partido de rugby.', '¿Qué estructura nerviosa debe evaluarse primero antes y después de la reducción?', ['Nervio axilar', 'Nervio radial', 'Nervio musculocutáneo', 'Nervio cubital'], 'A',
           ['El nervio **axilar** rodea el cuello quirúrgico del húmero y se lesiona por tracción en la luxación anterior. Se explora con la **sensibilidad del parche lateral del hombro** y la contracción isométrica del deltoides.'], prioritaria=True)
    u.caso('Fractura de húmero', 'Mujer de 37 años, fractura de diáfisis humeral en el tercio distal, con muñeca caída.', '¿Cuál es el nervio lesionado y qué se conserva?', ['Radial; conserva la extensión del codo', 'Cubital; conserva la flexión del codo', 'Mediano; conserva la extensión de los dedos', 'Axilar; conserva la flexión de la muñeca'], 'A',
           ['La lesión es del **nervio radial** en el surco radial, distal a la rama que va al tríceps, por lo que el **tríceps funciona** y la mano cae por pérdida de los extensores de muñeca y dedos (fractura de Holstein-Lewis).'], prioritaria=True)
    u.caso('Herida de muñeca', 'Mujer de 30 años con herida cortante en la cara anterior de la muñeca por vidrio. No puede hacer el signo “OK” y tiene hipoestesia en el índice.', '¿Qué estructura está lesionada?', ['Nervio mediano', 'Nervio cubital', 'Nervio radial', 'Arteria cubital'], 'A',
           ['El **mediano** pasa entre el flexor radial del carpo y el palmar largo, superficial en la muñeca. La zona autónoma es el pulpejo del índice y el signo “OK” explora el interóseo anterior (flexión de la IFD de pulgar e índice).'], prioritaria=True)
    u.caso('Dolor en tabaquera', 'Hombre de 22 años, caída sobre la mano extendida, dolor en la tabaquera anatómica con radiografía inicial normal.', '¿Qué complicación hay que prevenir?', ['Necrosis avascular del polo proximal del escafoides', 'Lesión del nervio cubital', 'Rotura del extensor largo del pulgar', 'Síndrome de De Quervain'], 'A',
           ['La **irrigación del escafoides es retrógrada**: entra por el polo distal y el fragmento proximal queda sin sangre. Se inmoviliza como fractura aunque la Rx inicial sea normal y se repite o se hace RM.'], prioritaria=True)
    u.q('Anestesia raquídea', 'La raquianestesia se realiza habitualmente en L3-L4 o L4-L5 porque:', ['La médula termina en L1-L2 y por debajo queda la cola de caballo', 'El saco dural termina en L3', 'La médula termina en L4', 'Es el único nivel con espacio epidural'], 'A',
        ['En el adulto el **cono medular** está en L1-L2. La **línea de Tuffier** (crestas ilíacas) pasa por L4 o L4-L5.'], prioritaria=True)
    u.q('Plexo braquial', 'Un paciente cae de una moto sobre el hombro y queda con el brazo en aducción y rotación interna y el antebrazo pronado. ¿Qué raíces se lesionaron?', ['C5-C6', 'C8-T1', 'C7', 'T1-T2'], 'A',
        ['Es la **parálisis de Erb-Duchenne** (raíces C5-C6, tronco superior).'])
