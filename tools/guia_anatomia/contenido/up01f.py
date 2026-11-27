# -*- coding: utf-8 -*-
"""UP 1 · Lesiones de los nervios del miembro superior: qué pasa si se daña cada nervio, qué clínica da y cómo se explora. (Tema muy tomado, en choice y en oral.)"""
from .up01e import N, G, L, oral

ORR = 'Orrego y Morán, __Ortopedia y Traumatología Básica__ (2014), {c}.'


def lesiones_nerviosas(u):
    u.h2('Si se lesiona un nervio: clínica, signo y causa traumatológica', intro='Es la pregunta que más se repite en los exámenes: “¿qué nervio se lesiona en esta fractura y qué le pasa al paciente?”. Acá está por nervio y por nivel, con el signo que lo confirma y el mecanismo que lo produce.')
    u.h3('Qué es una lesión nerviosa y cómo evoluciona')
    u.tabla(['Grado (Seddon)', 'Qué se lesiona', 'Evolución', 'Conducta'], [
        ['**Neuropraxia** (Sunderland I)', 'Bloqueo de la conducción con axón y vaina indemnes (compresión, estiramiento leve, yeso apretado)', 'Recupera sola en días a semanas, completa', 'Observación, retirar la causa'],
        ['**Axonotmesis** (Sunderland II-III)', 'Axón roto con la vaina endoneural conservada (aplastamiento, tracción, fractura cerrada)', 'Degeneración walleriana y regeneración a **1 mm por día** (unos 2,5 cm por mes); **signo de Tinel que avanza**', 'Observación 3 meses con electromiograma; si no hay recuperación, explorar'],
        ['**Neurotmesis** (Sunderland IV-V)', 'Sección completa del nervio (herida cortante, fractura expuesta)', 'No recupera sin cirugía; hay neuroma', 'Reparación microquirúrgica (sutura epineural o injerto) lo antes posible; la reinervación motora se pierde después de **12 a 18 meses**'],
    ], fuente='Anatomía y fisiopatología de referencia; conducta según Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., cap. 16 (lesiones nerviosas traumáticas).')
    u.ul(['**Herida abierta con déficit neurológico** = se presume sección y se **explora**.',
          '**Fractura o luxación cerrada con déficit** = lo más frecuente es neuropraxia o axonotmesis: se reduce, se documenta y se **observa**.',
          'El **electromiograma y la velocidad de conducción** recién son confiables **3-4 semanas** después de la lesión (hace falta que se produzca la degeneración walleriana).',
          '**Signo de Tinel** (percutir sobre el trayecto del nervio provoca hormigueo en su territorio): el punto más distal donde aparece marca hasta dónde llegó la regeneración.'])
    u.h3('Tabla maestra: nervio, causa típica y clínica')
    u.tabla(['Nervio', 'Causas traumatológicas típicas', 'Déficit motor', 'Déficit sensitivo', 'Postura / signo'], [
        ['**Supraescapular** (C5-C6)', 'Fractura de escápula, luxación de hombro, compresión en la muesca escapular', 'Atrofia de las fosas supra e infraespinosa; debilidad de la abducción inicial y de la rotación externa', 'Poco definido (dolor del hombro posterior)', 'Hundimiento de las fosas escapulares'],
        ['**Torácico largo** (C5-C7)', 'Vaciamiento axilar, mochila, tracción', 'Parálisis del serrato anterior', 'Ninguno', '**Escápula alada**: se marca el borde medial al empujar contra una pared; no eleva el brazo por encima de 90°'],
        ['**Axilar** (C5-C6)', '**Luxación anterior de hombro**, fractura del cuello quirúrgico del húmero', 'Parálisis del deltoides y del redondo menor: no abduce entre 15° y 90°', 'Parche lateral del hombro (“de regimiento”)', 'Aplanamiento del deltoides (hombro “cuadrado”) y atrofia'],
        ['**Musculocutáneo** (C5-C7)', 'Herida, luxación de hombro, fractura de húmero proximal', 'Flexión del codo débil (queda el braquiorradial); supinación débil', 'Cara lateral del antebrazo', 'Se pierde el reflejo bicipital'],
        ['**Radial** en el brazo (surco radial)', '**Fractura de diáfisis de húmero** (tercio medio-distal; Holstein-Lewis), compresión (“parálisis del sábado a la noche”)', 'Pérdida de la extensión de **muñeca, dedos (MCF) y pulgar**; el tríceps se conserva', 'Dorso de la mano, **primer espacio interdigital**', '**Mano caída** (“muñeca caída”); no se puede levantar la mano; el puño no se cierra bien porque falta la extensión previa'],
        ['**Radial** en la axila', 'Muletas, luxación de hombro', 'Todo lo anterior más pérdida del **tríceps**', 'Igual más cara posterior del brazo', 'Mano caída + no extiende el codo'],
        ['**Interóseo posterior** (rama profunda del radial)', 'Luxación o fractura de la cabeza del radio, **Monteggia**, arcada de Frohse', 'Pérdida de la extensión de los **dedos** (MCF) y del pulgar; la **muñeca sí se extiende** (con desviación radial)', '**Ninguno**', 'Dedos caídos con extensión de muñeca conservada'],
        ['**Radial superficial** (sensitivo)', 'Herida o presión en la muñeca (esposas, reloj ajustado)', 'Ninguno', 'Dorso radial de la mano y pulgar', 'Parestesias (síndrome de Wartenberg)'],
        ['**Mediano** alto (codo y antebrazo)', '**Fractura supracondílea**, luxación de codo, compresión por el pronador redondo', 'Pérdida de la pronación, de la flexión de la muñeca radial y de los flexores de los 3 dedos radiales; no oposición', '3 dedos y medio radiales (palmar)', '**Mano de bendición** al intentar cerrar el puño (el índice y el medio quedan extendidos) y **mano de simio**'],
        ['**Interóseo anterior** (rama del mediano)', 'Fractura supracondílea, fractura de antebrazo (Kiloh-Nevin)', 'Pérdida de la flexión de la IF del pulgar y de la IFD del índice (FPL y FDP I-II)', '**Ninguno**', '**Signo OK anormal**: al hacer la pinza el pulgar y el índice no se flexionan (pinza “en triángulo”)'],
        ['**Mediano** bajo (muñeca)', '**Colles**, luxación del semilunar, herida de muñeca, **túnel carpiano**', 'Pérdida de la oposición y abducción del pulgar (tenar); los flexores de los dedos se conservan', '3 dedos y medio radiales; **zona autónoma: pulpejo del índice**', '**Atrofia tenar**, mano de simio; en el túnel: parestesias nocturnas, **Tinel y Phalen** positivos'],
        ['**Cubital** en el codo', '**Fractura de epitróclea**, luxación de codo, supracondílea, compresión en el canal epitroclear', 'Debilidad del FCU y del FDP de los dedos 4-5, de los interóseos, del aductor del pulgar y de los lumbricales 3-4', 'Meñique y mitad cubital del anular (palma y dorso)', '**Garra cubital** (con menos deformidad que en la lesión baja); **Froment** y **Wartenberg**'],
        ['**Cubital** en la muñeca (canal de Guyon)', 'Fractura del gancho del ganchoso, ciclistas, ganglión', 'Pierde los intrínsecos (garra marcada) pero **conserva el FCU y el FDP**', 'Meñique y anular palmar (si la rama dorsal sale antes, **respeta el dorso**)', '**Garra cubital más evidente** (paradoja de la garra cubital); signo de Jeanne'],
        ['**Digitales** propios', 'Herida del dedo, fractura de falange', 'Ninguno', 'Un lado del pulpejo', 'Hipoestesia unilateral del dedo'],
        ['**Plexo braquial** alto (C5-C6)', 'Tracción cabeza-hombro: parto, caída de moto', 'Pierde la abducción, la flexión del codo y la rotación externa', 'Cara lateral del brazo y antebrazo', '**Erb-Duchenne**: brazo en aducción y rotación interna, antebrazo pronado'],
        ['**Plexo braquial** bajo (C8-T1)', 'Tracción hacia arriba del brazo', 'Mano en garra por pérdida de intrínsecos', 'Borde medial de brazo, antebrazo y mano', '**Klumpke**; **síndrome de Horner** si compromete T1'],
    ], fuente='Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., caps. 11, 14, 15 y 16; Orrego y Morán, Ortopedia y Traumatología Básica (2014), cap. 10; anatomía de referencia (Netter, láminas S-108 a S-112).')
    u.box('alerta', 'Los tres errores clásicos de examen', [['**Mano caída** = radial, pero el **interóseo posterior** produce dedos caídos **sin** déficit sensitivo y con extensión de muñeca conservada.',
                                                      '**Garra cubital**: la lesión **baja** (muñeca) deforma **más** que la alta (codo) porque en la alta también se pierde el FDP cubital (**paradoja de la garra cubital**).',
                                                      '**Túnel carpiano**: la sensibilidad de la eminencia tenar **está conservada** (rama palmar cutánea por encima del retináculo); si la perdió, la lesión es **más proximal**.']])
    u.h3('Imágenes clínicas de los signos')
    L(u, 'or_dorso_tenedor.png', 'Deformidad en dorso de tenedor de la fractura de Colles (frente y perfil).', ORR.format(c='fig. 10-2'), ['El mediano pasa por delante de la muñeca: el hematoma y el desplazamiento lo comprimen (síndrome de túnel carpiano agudo).'], 90)
    L(u, 'or_colles_rx.png', 'Fractura de Colles: radiografía de perfil y frente.', ORR.format(c='fig. 10-4'), ['Desplazamiento dorsal del fragmento distal del radio.'], 70)
    L(u, 'or_tinel.png', 'Signo de Tinel: percusión sobre el nervio mediano en la muñeca.', ORR.format(c='fig. 10-22'), ['Hormigueo en los 3 dedos radiales = compresión o regeneración del mediano.'], 70)
    L(u, 'or_phalen.png', 'Maniobra de Phalen: flexión forzada de las muñecas durante 1 minuto.', ORR.format(c='cap. 10'), ['Provoca las parestesias del túnel carpiano.'], 70)
    L(u, 'or_carpo_corte.png', 'Sección transversal del carpo: contenido del túnel carpiano.', ORR.format(c='fig. 10-21'), ['Nueve tendones y el mediano bajo el retináculo; canal de Guyon por fuera.'], 85)
    L(u, 'or_cubital_codo.png', 'Trayecto del nervio cubital en el codo: detrás de la epitróclea.', ORR.format(c='fig. 10-24'), ['Es el sitio de la compresión cubital y de la lesión en la fractura de epitróclea.'], 85)
    L(u, 'or_froment.png', 'Signo de Froment: el paciente sostiene un papel y flexiona la IF del pulgar.', ORR.format(c='fig. 10-25'), ['Compensa la falta del aductor del pulgar (cubital) con el flexor largo del pulgar (mediano).'], 70)
    u.h3('Pruebas y signos para recordar')
    u.tabla(['Signo o prueba', 'Cómo se hace', 'Qué significa'], [
        ['**Tinel**', 'Percutir el trayecto del nervio', 'Hormigueo en el territorio: compresión o regeneración (el más distal marca el avance)'],
        ['**Phalen**', 'Flexión forzada de ambas muñecas 1 minuto', 'Reproduce parestesias: túnel carpiano'],
        ['**Durkan**', 'Compresión directa sobre el túnel carpiano 30 segundos', 'Túnel carpiano'],
        ['**Signo OK**', 'Hacer un círculo con el pulgar y el índice', 'Si no se flexionan las IF: interóseo anterior (mediano)'],
        ['**Puño de bendición**', 'Cerrar el puño', 'El índice y el medio quedan extendidos: mediano alto'],
        ['**Froment**', 'Sostener un papel entre el pulgar y el índice', 'Flexión de la IF del pulgar: falla el aductor (cubital)'],
        ['**Wartenberg**', 'Aducir los dedos', 'El meñique queda separado: falla el interóseo palmar (cubital)'],
        ['**Jeanne**', 'Pinza lateral', 'Hiperextensión de la MCF del pulgar: cubital'],
        ['**Cruce de dedos**', 'Cruzar el medio sobre el índice', 'No puede: falla un interóseo (cubital)'],
        ['**Pellizco / pinza**', 'Pinza pulpejo-pulpejo', 'Falla de oposición: mediano; falla de la pinza en OK: interóseo anterior'],
        ['**Test del “autostop”**', 'Extender el pulgar y la muñeca (“pulgar hacia arriba”)', 'No puede: radial'],
    ], fuente='Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., cap. 11; Orrego y Morán (2014), cap. 10.')
    u.si_ves([('Mano caída con tríceps conservado', '**Radial** en el surco: fractura de diáfisis de húmero'),
              ('Dedos caídos, muñeca se extiende, sin pérdida sensitiva', '**Interóseo posterior**: Monteggia, cabeza del radio'),
              ('Puño de bendición + mano de simio', '**Mediano alto**: supracondílea, luxación de codo'),
              ('No hace el signo OK, sin pérdida sensitiva', '**Interóseo anterior**'),
              ('Atrofia tenar + parestesias nocturnas en 3 dedos', '**Mediano bajo**: túnel carpiano, Colles'),
              ('Garra de meñique y anular + Froment', '**Cubital**: epitróclea o muñeca'),
              ('Escápula alada', '**Torácico largo**: vaciamiento axilar'),
              ('Hombro “cuadrado”, deltoides aplanado, parche anestésico', '**Axilar**: luxación anterior de hombro'),
              ('Pérdida de la flexión del codo + hipoestesia lateral del antebrazo', '**Musculocutáneo**'),
              ('Erb: brazo en aducción, rotación interna y antebrazo pronado', 'Plexo alto **C5-C6**'),
              ('Garra + Horner', 'Plexo bajo **C8-T1** (Klumpke)')], 'Si ves esto, pensá en este nervio')
    oral(u, 'Para responder “¿qué nervio se lesiona y qué clínica da?” sigo siempre el mismo orden: **hueso o articulación lesionados → nervio vecino → músculos que se paralizan → territorio sensitivo → postura o signo**. En la **luxación de hombro** es el **axilar**: deltoides sin abducción y parche lateral anestesiado. En la **diáfisis del húmero** es el **radial**: mano caída con el tríceps conservado, y anestesia del dorso del primer espacio. En la **supracondílea** son el **mediano** (en especial el interóseo anterior: signo OK anormal) y la arteria braquial. En la **epitróclea** es el **cubital**: garra cubital, Froment y pérdida sensitiva del meñique. En el **Colles** o la luxación del semilunar, el **mediano bajo**: parestesias, atrofia tenar si evoluciona. Con herida abierta y déficit exploro; con fractura cerrada reduzco, documento y observo 3 meses porque casi siempre es neuropraxia o axonotmesis, y confirmo con electromiograma a las 3-4 semanas. La regeneración avanza 1 mm por día y el Tinel marca el progreso.', 'Así lo decís en el oral')


def inmovilizacion(u):
    u.h2('Inmovilizaciones, tracciones y osteosíntesis: anatomía de lo que se aplica', intro='El programa pide yesos, férulas, tracciones y materiales de osteosíntesis. El examen los pregunta desde la anatomía: qué articulaciones se inmovilizan, en qué posición y qué estructura se puede lesionar o comprimir.')
    u.tabla(['Dispositivo', 'Qué inmoviliza', 'Posición', 'Estructura en riesgo o complicación'], [
        ['**Cabestrillo / vendaje de Velpeau**', 'Hombro y brazo (clavícula, luxación reducida)', 'Brazo pegado al tronco, codo a 90°', 'Maceración de la axila; rigidez de hombro si se prolonga'],
        ['**Yeso o férula braquiopalmar**', 'Codo, antebrazo y muñeca', 'Codo a 90°, antebrazo en posición neutra, muñeca en posición neutra', '**Nervio cubital** sobre la epitróclea (presión del molde); síndrome compartimental'],
        ['**Yeso antebraquiopalmar** (fractura de Colles, escafoides con espica)', 'Muñeca y antebrazo; el de escafoides incluye el pulgar', 'Muñeca neutra o leve extensión; MCF a 70°-90° y IF extendidas (**posición intrínseco-plus**)', '**Nervio mediano** (la flexión forzada de la muñeca eleva la presión en el túnel carpiano); rigidez de la mano si se deja en extensión de MCF'],
        ['**Férula antebraquiopalmar de reposo de la mano**', 'Muñeca y mano', 'Posición funcional o intrínseco-plus', 'Contractura de los ligamentos colaterales si se inmoviliza con la MCF extendida'],
        ['**Tracción esquelética transolecraniana**', 'Fracturas de húmero (en desuso), supracondílea', 'Aguja de Kirschner en el olécranon', 'Se introduce de **medial a lateral** para no lesionar el **nervio cubital** (canal epitroclear)'],
        ['**Fijador externo** (fracturas expuestas)', 'Segmentos con lesión de partes blandas', 'Clavos en zonas seguras', 'Clavos a través de **zonas peligrosas**: nervio radial en la diáfisis humeral; arteria y nervio radial superficial en el radio distal'],
        ['**Placas y tornillos**', 'Fractura reducida con fijación rígida', 'Según abordaje', 'Abordaje de **Henry** (anterior del radio): arteria radial y rama superficial del radial; abordaje de **Thompson** (posterior): interóseo posterior; placa dorsal del radio: tendón del extensor largo del pulgar'],
        ['**Clavo endomedular**', 'Diáfisis (húmero, radio, cúbito, niños con clavos flexibles)', 'Introducción desde la metáfisis', 'Radial al acercarse al surco; el manguito rotador en el clavo humeral anterógrado'],
    ], fuente='Orrego y Morán, Ortopedia y Traumatología Básica (2014), caps. 3, 10 y 16; Silberman y Varaona, Ortopedia y Traumatología, 3.ª ed., caps. 66-71.')
    L(u, 'lib_orr_compartimental_yeso.png', 'Yeso circular apretado: el compartimento cerrado se comprime.', ORR.format(c='fig. 3-9'), ['Por eso un yeso agudo se **abre o se bivalva** si hay dolor, tumefacción o parestesias.'], 70)
    u.box('alerta', 'Tres reglas anatómicas de los yesos', [['**Dejar libres** las MCF (salvo en la espica del pulgar) y la articulación IFP para no rigidizar.',
                                                         '**Acolchar** las prominencias óseas: epitróclea y olécranon (cubital), estiloides radial y cubital, borde distal.',
                                                         '**Control a las 24-48 h**: dolor desproporcionado, parestesias, palidez y dolor con la extensión pasiva = quitar o bivalvar el yeso.']])
    oral(u, 'Inmovilizo la fractura con yeso o férula incluyendo la articulación **proximal y distal**. En el antebrazo y la muñeca elijo la posición según el hueso; para la mano uso la **posición intrínseco-plus** (MCF flexionadas 70°-90° con IF extendidas) porque los ligamentos colaterales de la MCF se tensan en flexión y así evito la rigidez. En el codo cuido el **nervio cubital** y en la muñeca el **mediano**: una flexión forzada o un yeso apretado elevan la presión en el túnel carpiano. Todo yeso necesita control a las 24-48 horas y se **bivalva** ante dolor desproporcionado, parestesias o palidez. En la tracción olecraniana paso la aguja de medial a lateral para respetar el cubital, y en las osteosíntesis conozco las zonas de peligro de cada abordaje: radial superficial y arteria radial en el de Henry, interóseo posterior en el de Thompson.')
