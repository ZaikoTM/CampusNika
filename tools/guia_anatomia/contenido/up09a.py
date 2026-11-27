# -*- coding: utf-8 -*-
"""UP 9 · Parte A: vía aérea y cuello, tórax, corazón, pericardio y aorta."""
from .up01e import N, G, L, oral

ATL = 'ATLS, __Apoyo Vital Avanzado en Trauma__, 11.ª ed. (American College of Surgeons), {f}.'


def A(u, archivo, titulo, fig, mirar=None, alto=120):
    L(u, 'atls_%s.jpg' % archivo, titulo, ATL.format(f=fig), mirar, alto)


def cuello(u):
    u.h2('Vía aérea y cuello en el trauma: de dónde sale el sangrado y dónde se abre la vía aérea', intro='La **A** del xABCDE es anatomía pura: la membrana cricotiroidea, el cricoides y las tres zonas del cuello. Todo lo que se pregunta (vía aérea quirúrgica, herida penetrante del cuello, hematoma expansivo) se resuelve ubicando la estructura.')
    u.h3('Las tres zonas del cuello (ATLS)')
    u.tabla(['Zona', 'Límites', 'Qué hay adentro', 'Por qué importa'], [
        ['**I**', 'Escotadura esternal y clavículas hasta el **borde inferior del cricoides**', 'Vasos subclavios, **tronco braquiocefálico**, carótida común proximal, **ápex pulmonar**, tráquea, esófago, conducto torácico', 'Es difícil de abordar quirúrgicamente (hace falta **esternotomía o toracotomía**) y se asocia a lesión torácica'],
        ['**II**', '**Cricoides** hasta el **ángulo de la mandíbula**', '**Carótida común, yugular interna, vago**, laringe, tráquea, esófago', 'Es la más expuesta y la más fácil de explorar; la lesión que **atraviesa el platisma** se estudia o se explora'],
        ['**III**', 'Ángulo de la mandíbula hasta la **base del cráneo**', 'Carótida interna distal, vertebral, faringe, glándulas parótida y submandibular', 'Acceso difícil; el sangrado se controla con **angioembolización** y la vía aérea se asegura temprano'],
    ], fuente='ATLS 11.ª ed., cap. 22 (fig. 22-3); Netter, láminas S-323 y S-324.')
    A(u, 'a329_0', 'Zonas del cuello: I, II y III con sus puntos de referencia.', 'fig. 22-3', ['Ubicá el **ángulo de la mandíbula**, el **borde inferior del cricoides** y la **escotadura esternal**: son los tres límites que definen las zonas.'], 100)
    A(u, 'a330_0', 'Herida penetrante del cuello con lesión de la carótida: el objeto ocupa la vaina vascular.', 'fig. 22-4', ['**No se retira el objeto empalado** fuera del quirófano: puede estar taponando un vaso.', 'Se controla la vía aérea y la hemorragia por compresión directa.'], 95)
    N(u, 'S-323', 'Arterias de la cabeza y el cuello.', ['**Carótida común** → externa e interna; **subclavia**, vertebral y tronco tirocervical.', 'Zona I: la subclavia y el tronco braquiocefálico salen del mediastino.'], 205)
    N(u, 'S-324', 'Arterias carótidas.', ['Bifurcación a nivel del borde superior del cartílago tiroides (C4).', 'La carótida externa tiene ramas (tiroidea superior, lingual, facial) que se ligan; la interna **no** tiene ramas en el cuello.'], 205)
    G(u, 558, 'Arterias del cuello (Gray).', ['Compará carótidas, subclavia y sus ramas con la lámina de Netter.'], 190)
    u.box('alerta', 'Signos “duros” que obligan a operar o a embolizar', '**Hemorragia pulsátil, hematoma expansivo, soplo o thrill, shock, déficit neurológico focal, burbujeo en la herida, enfisema subcutáneo progresivo, hemoptisis o hematemesis**. Ante cualquiera: vía aérea definitiva y control del sangrado, no se explora la herida en la guardia.')
    u.h3('La vía aérea quirúrgica: cricotiroidotomía')
    u.ul(['La **membrana cricotiroidea** está entre el borde inferior del **cartílago tiroides** y el **cricoides**; mide más o menos 9 mm de alto y se palpa **un dedo por encima de la escotadura** del cricoides. Se reconoce primero la **prominencia laríngea** (nuez) y se baja hasta la depresión inmediata.',
          'Se indica cuando **no se puede intubar ni ventilar** (edema, hemorragia masiva, trauma facial severo). Se hace una **incisión vertical** cuando no se reconocen las referencias (minimiza la lesión de los vasos), y una horizontal sobre la membrana cuando se reconocen.',
          'Debajo hay solo **piel, fascia, membrana y mucosa**; lateralmente están las venas yugulares anteriores y el **istmo tiroideo** más abajo: se evita cortar fuera de la línea media.',
          'En el **niño menor de 12 años** no se hace cricotiroidotomía quirúrgica: se prefiere la **punción** con aguja (la laringe es pequeña y el cartílago cricoides frágil).'])
    A(u, 'a079_0', 'Cricotiroidotomía: referencias palpables y trazo de la incisión.', 'fig. 4-14', ['Cartílago tiroides arriba, **membrana cricotiroidea** en el centro y cricoides debajo.', 'La **incisión vertical** (línea roja) cruza la piel y la membrana.'], 95)
    A(u, 'a079_2', 'Apertura de la membrana con bisturí y colocación del tubo.', 'fig. 4-14', ['La hoja se orienta **hacia abajo** para no lesionar las cuerdas vocales ni la pared posterior de la tráquea.'], 90)
    u.box('clave', 'Conectá con la UP1 y la UP7', 'La anatomía de la laringe, la inervación y la **traqueostomía (2.º-3.er anillo)** están desarrolladas en los atlas de la **UP1** (vía aérea) y de la **UP7** (cuello y traqueostomía). Acá solo importa la decisión: **cricotiroidotomía de emergencia** frente a **traqueostomía programada**.')
    oral(u, 'El cuello se divide en **tres zonas**: la **I** (escotadura esternal hasta el borde inferior del cricoides) tiene los grandes vasos y el ápex pulmonar y obliga muchas veces a esternotomía; la **II** (cricoides hasta el ángulo de la mandíbula) contiene la carótida común, la yugular interna, el vago y la vía aérea, y es la más expuesta; la **III** (ángulo de la mandíbula hasta la base del cráneo) contiene la carótida interna distal y es de acceso difícil. La **cricotiroidotomía** se hace en la membrana entre el tiroides y el cricoides cuando no puedo intubar ni ventilar; en el niño pequeño se punza.', 'Así lo decís en el oral: cuello y vía aérea')


def torax(u):
    u.h2('Tórax: pared, espacios intercostales, pleura y las lesiones que se reconocen en la cama', intro='Las seis lesiones torácicas que matan rápido (neumotórax a tensión, abierto, hemotórax masivo, tórax inestable, taponamiento y obstrucción de la vía aérea) se entienden desde la anatomía de la pared y de la pleura. Se diagnostican **clínicamente** y se tratan antes de la radiografía.')
    u.h3('Pared torácica y espacio intercostal')
    u.tabla(['Estructura', 'Dato anatómico', 'Aplicación en trauma'], [
        ['**Costillas 1 a 3**', 'Protegidas por la clavícula, la escápula y los músculos', 'Su fractura indica **trauma de alta energía**: buscar lesión de grandes vasos y del plexo braquial'],
        ['**Costillas 4 a 9**', 'Las más fracturadas', 'Se asocian a neumotórax, hemotórax y contusión pulmonar'],
        ['**Costillas 9 a 12**', 'Cubren el **hígado** (derecha) y el **bazo** (izquierda)', 'Fractura de costillas bajas = **sospechar lesión de hígado, bazo y riñón**'],
        ['**Paquete vasculonervioso intercostal**', 'Vena, arteria y nervio (**VAN**) corren por el **borde inferior de la costilla**, en el surco costal', 'Se pasa **por el borde superior de la costilla inferior** al punzar o colocar un tubo para **evitar** el paquete'],
        ['**Diafragma**', 'Sube hasta el **4.º-5.º espacio** en espiración', 'Una herida por debajo de la **línea del pezón** (o de la punta de la escápula) puede ser **toracoabdominal**'],
    ], fuente='Netter, láminas S-203 a S-209; ATLS 11.ª ed., cap. 5.')
    N(u, 'S-205', 'Pared anterior del tórax: visión interna.', ['Esternón, costillas, **arteria torácica interna** y el diafragma.', 'La arteria torácica interna corre a 1-2 cm del borde esternal: una herida paraesternal puede sangrar por ella.'], 205)
    N(u, 'S-206', 'Nervios y arterias intercostales.', ['**Paquete intercostal en el surco costal**, en el borde inferior de cada costilla.', 'Arterias intercostales posteriores (de la aorta) y anteriores (de la torácica interna).'], 205)
    N(u, 'S-207', 'Diafragma: cara torácica.', ['Cúpulas, centro tendinoso y hiatos (aórtico, esofágico y de la vena cava).'], 190)
    N(u, 'S-203', 'Pared anterior del tórax: disección superficial.', ['Pectoral mayor, serrato anterior y dorsal ancho: forman el **triángulo de seguridad** para el tubo pleural.'], 205)
    A(u, 'a087_0', 'Referencias de superficie del tórax y su relación con las estructuras internas.', 'figs. 5-1 y 5-2', ['La **caja** naranja marca el mediastino; las líneas rojas separan las zonas (línea axilar anterior, línea del pezón).', 'Esas referencias definen **dónde punzar y dónde colocar el tubo**.'], 120)
    u.h3('Pleura y pulmón: lo que se rompe y qué ocupa la cavidad')
    N(u, 'S-385', 'Pulmones en la cavidad torácica: visión anterior.', ['Cúpulas pleurales por encima de la clavícula (**neumotórax por herida del cuello**).', 'Receso costodiafragmático: el hemotórax se acumula ahí.'], 205)
    N(u, 'S-386', 'Pulmones en la cavidad torácica: visión posterior.', ['Los lóbulos inferiores quedan atrás: el **hemotórax del paciente en decúbito** se ve **velado** (mala sensibilidad de la radiografía en supino).'], 205)
    N(u, 'S-380', 'Bronquios y vías aéreas intrapulmonares.', ['Bifurcación a nivel de **T4-T5**; el bronquio derecho es más vertical y corto: **intubación selectiva derecha**.', 'Lesión traqueobronquial: neumotórax masivo con **fuga aérea persistente** y enfisema subcutáneo.'], 205)
    N(u, 'S-381', 'Segmentos broncopulmonares: visiones anterior y posterior.', ['Ubicá los segmentos para interpretar la **contusión pulmonar** (opacidad en la zona del golpe).'], 190)
    u.h3('Neumotórax simple, a tensión y abierto')
    u.tabla(['Lesión', 'Qué pasa', 'Cómo se ve', 'Qué se hace'], [
        ['**Neumotórax simple**', 'Aire en el espacio pleural, sin tensión', 'Murmullo disminuido, timpanismo; **línea pleural** en la radiografía', '**Tubo pleural** (5.º EIC, por delante de la línea axilar media)'],
        ['**A tensión**', '**Válvula unidireccional**: el aire entra y no sale; el mediastino se **desvía** y la vena cava se acoda', '**Disnea, hipotensión, ausencia de murmullo, yugulares ingurgitadas, tráquea desviada** (tardío); **diagnóstico clínico**', '**Descompresión inmediata** con aguja o toracostomía con el dedo (5.º EIC, línea axilar anterior) y luego **tubo pleural**'],
        ['**Abierto (herida soplante)**', 'Defecto de la pared **mayor de 2/3 del diámetro de la tráquea**: el aire entra por la herida', 'Ruido de succión en la herida; hipoxia', '**Apósito de tres lados** y tubo pleural **en otro sitio**; cierre quirúrgico'],
    ], fuente='ATLS 11.ª ed., cap. 5 (figs. 5-4 a 5-6 y 5-11 a 5-12).')
    A(u, 'a089_0', 'Neumotórax simple: el pulmón colapsa por el aire pleural.', 'fig. 5-4', ['Compará con el pulmón sano del lado opuesto; el mediastino **no se desvía**.'], 90)
    A(u, 'a089_2', 'Neumotórax a tensión: desvío del mediastino y compresión del pulmón contralateral.', 'fig. 5-5', ['Las flechas muestran la **desviación del mediastino** y el **colapso de la vena cava**: por eso cae el retorno venoso y aparece el **shock obstructivo**.'], 100)
    A(u, 'a089_3', 'Radiografía de tórax: neumotórax a tensión con desviación mediastínica.', 'fig. 5-5', ['Desviación de la tráquea y del mediastino hacia el lado sano. **No se espera la radiografía**: el diagnóstico es clínico.'], 90)
    A(u, 'a095_0', 'Puntos de descompresión: 2.º espacio intercostal en la línea medioclavicular y 5.º en la línea axilar anterior.', 'fig. 5-11', ['El **5.º EIC** queda en el **triángulo de seguridad** (borde lateral del pectoral mayor, borde anterior del dorsal ancho y la línea del pezón).', 'Se pasa **sobre el borde superior de la costilla** inferior para evitar el paquete intercostal.'], 100)
    A(u, 'a090_0', 'Neumotórax abierto: el aire pasa por el defecto de la pared.', 'fig. 5-6', ['La herida grande “aspira” el aire en cada inspiración: el pulmón no se expande.'], 90)
    A(u, 'a096_0', 'Apósito de tres lados: se pega por tres bordes y queda libre el cuarto.', 'fig. 5-12', ['Funciona como **válvula**: deja salir el aire en la espiración y lo bloquea en la inspiración.', 'Evita el **neumotórax a tensión** que provocaría un apósito sellado por los cuatro lados.'], 90)
    A(u, 'a096_1', 'Toracostomía con tubo: apertura de la pared y colocación del drenaje.', 'fig. 5-12 (colocación del tubo)', ['El tubo va **dirigido hacia arriba y atrás** en el neumotórax y hacia abajo en el hemotórax.'], 85)
    u.h3('Hemotórax masivo, tórax inestable y contusión pulmonar')
    u.tabla(['Lesión', 'Criterio o mecanismo', 'Anatomía y clínica', 'Conducta'], [
        ['**Hemotórax masivo**', 'Más de **1.500 mL** al drenar o **200 mL/h durante 2 a 4 h**', 'Sangra la **arteria intercostal**, el **hilio** o grandes vasos; el espacio pleural aloja hasta 3 litros; **matidez**, shock', '**Tubo pleural** (28-32 F), reanimación con sangre y **toracotomía** según el débito'],
        ['**Tórax inestable**', '**2 o más costillas contiguas** fracturadas en **2 o más sitios** (segmento libre)', '**Movimiento paradójico** del segmento; la causa de la hipoxia es la **contusión pulmonar** subyacente', '**Analgesia** (bloqueo regional), oxígeno y ventilación si falla'],
        ['**Contusión pulmonar**', 'Golpe contuso', 'Hipoxemia que **empeora en 24 horas**; infiltrado en la radiografía', 'Evitar la sobrecarga de líquidos; soporte ventilatorio'],
    ], fuente='ATLS 11.ª ed., cap. 5.')
    A(u, 'a090_2', 'Tórax inestable: fractura de varias costillas contiguas en dos sitios (segmento “flotante”).', 'fig. 5-7', ['El **segmento** pierde continuidad con el resto de la caja torácica.'], 95)
    A(u, 'a090_1', 'Movimiento paradójico del segmento inestable: se hunde en la inspiración y se expande en la espiración.', 'fig. 5-7', ['Las flechas son opuestas al movimiento del resto de la pared.'], 85)
    u.box('alerta', 'No toda herida torácica termina en el tubo: la **toracotomía de reanimación** y la **herida “en caja”**', 'Si el drenaje inicial es **mayor de 1.500 mL** o sigue **sangrando más de 200 mL/h** se indica la **toracotomía en quirófano**. Una herida penetrante dentro de la **“caja cardíaca”** (limitada arriba por las clavículas, abajo por el reborde costal y a los lados por las líneas de los pezones) se considera **lesión del corazón hasta demostrar lo contrario**; la toracotomía **de reanimación** en la guardia se reserva para casos seleccionados (herida penetrante con signos de vida recientes).')
    oral(u, 'En el tórax distingo cuatro urgencias que se resuelven en la cama. El **neumotórax a tensión** produce disnea, hipotensión, ausencia de murmullo y yugulares ingurgitadas; el diagnóstico es **clínico** y se **descomprime** con aguja o dedo en el **5.º espacio intercostal, línea axilar anterior**, y luego se coloca un **tubo pleural**. El **neumotórax abierto** se cubre con un **apósito de tres lados**. El **hemotórax masivo** (más de 1.500 mL o 200 mL/h) se drena con un tubo y puede requerir **toracotomía**. El **tórax inestable** es la fractura de **2 o más costillas en 2 o más sitios**; lo que mata es la **contusión pulmonar**, no el segmento paradójico. Al punzar paso **por el borde superior de la costilla** porque el paquete vasculonervioso corre por el **borde inferior**.', 'Así lo decís en el oral: tórax')


def corazon(u):
    u.h2('Corazón, pericardio, mediastino y aorta: taponamiento y lesión aórtica', intro='Acá la anatomía decide el diagnóstico: el pericardio inextensible explica el taponamiento y el ligamento arterioso fija la aorta y explica dónde se rompe.')
    u.h3('Corazón y pericardio')
    N(u, 'S-307', 'Corazón in situ: relación con el esternón, los pulmones y la pleura.', ['El corazón queda **detrás del esternón** y de los cartílagos costales: es el que se lesiona en una herida **precordial**.', 'El **ventrículo derecho** es el más anterior (más expuesto en herida penetrante).'], 205)
    N(u, 'S-308', 'Saco pericárdico y cavidad pericárdica.', ['El pericardio fibroso es **poco distensible**: 100-150 mL **agudos** bastan para producir taponamiento.', 'Seno transverso y oblicuo.'], 205)
    N(u, 'S-309', 'Corazón: proyección anterior.', ['**Aurícula derecha y ventrículo derecho** forman la cara anterior; el ápex se ubica en el 5.º EIC.'], 205)
    N(u, 'S-318', 'Arterias coronarias: visiones anterior y posterior.', ['Descendente anterior y coronaria derecha: la lesión contusa puede producir **infarto** o contusión miocárdica.'], 205)
    A(u, 'a088_0', 'La “caja” cardíaca: zona de riesgo de lesión del corazón y de los grandes vasos por herida penetrante.', 'fig. 5-3', ['Dentro del recuadro están el corazón y los grandes vasos; una herida a ese nivel obliga a **descartar lesión cardíaca**.'], 100)
    u.h3('Taponamiento cardíaco')
    u.ul(['**Tríada de Beck**: **hipotensión, ingurgitación yugular y ruidos cardíacos apagados**; es difícil de ver en el trauma (ruido y hemorragia).',
          'Pulso paradójico, **actividad eléctrica sin pulso** y shock que no responde a líquidos: pensar en taponamiento antes de la radiografía.',
          '**Diagnóstico**: **FAST** con la ventana **subxifoidea** (líquido en el pericardio); la radiografía no sirve.',
          '**Tratamiento definitivo**: **ventana pericárdica o toracotomía/esternotomía**. La **pericardiocentesis** subxifoidea es un puente: se punza entre el **xifoides y el reborde costal izquierdo**, a **45°** hacia el hombro izquierdo, bajo guía ecográfica.'])
    A(u, 'a102_0', 'Taponamiento cardíaco: la sangre ocupa el pericardio y comprime el corazón (con ecografía FAST).', 'fig. 6-1', ['A y B: corazón sin y con líquido pericárdico. C: imagen ecográfica con el **derrame** que rodea las cavidades.'], 90)
    u.h3('Aorta: dónde se rompe y cómo se sospecha')
    u.ul(['La **aorta torácica** está fija en el **ligamento arterioso** (cerca del origen de la subclavia izquierda): en la desaceleración brusca la porción móvil (arco) se desplaza y la **rotura se produce en el istmo**.',
          'Pocos pacientes llegan con vida; los que llegan tienen una **pseudoaneurisma contenido** por la adventicia y el mediastino.',
          'Signos radiográficos: **ensanchamiento mediastínico (> 8 cm)**, borramiento del **botón aórtico**, desviación de la **sonda nasogástrica** y de la tráquea a la derecha, casquete pleural apical y hemotórax izquierdo. Los hallazgos faltan en la mitad de los casos: la **angio-TC** es el estudio de elección.',
          'Tratamiento: control de la presión (β-bloqueantes) y **reparación endovascular (TEVAR)**.'])
    A(u, 'a317_0', 'Rotura traumática de la aorta: sitio del istmo, en relación con el ligamento arterioso.', 'fig. 21-6', ['La lesión se ubica **justo distal a la subclavia izquierda**.'], 100)
    A(u, 'a318_3', 'Grados de la lesión aórtica: desde la lesión de la íntima hasta la rotura completa.', 'fig. 21-7', ['Los grados I a IV: **íntima, hematoma intramural, pseudoaneurisma y rotura libre**.'], 95)
    A(u, 'a319_0', 'Radiografía de tórax con ensanchamiento del mediastino.', 'fig. 21-9', ['Mediastino ancho y botón aórtico borrado: **pedir angio-TC** si el paciente está estable.'], 90)
    N(u, 'S-339', 'Aorta torácica y arterias intercostales posteriores.', ['La aorta descendente da las **intercostales**; el istmo está **fijado** por el ligamento arterioso y los vasos intercostales.'], 205)
    N(u, 'S-390', 'Mediastino: visión lateral derecha.', ['Relaciones del esófago, la tráquea, el conducto torácico y la vena ácigos.'], 205)
    u.si_ves([('**Disnea súbita, hipotensión, yugulares ingurgitadas, ausencia de murmullo**', 'Neumotórax **a tensión**: se descomprime sin radiografía'),
              ('**Hipotensión, ingurgitación yugular, ruidos cardíacos apagados** tras herida precordial', 'Taponamiento cardíaco: **FAST subxifoideo**'),
              ('Movimiento paradójico de la pared con hipoxia', 'Tórax inestable y contusión pulmonar'),
              ('**Mediastino ensanchado** tras desaceleración', 'Lesión aórtica: **angio-TC**'),
              ('Herida por debajo del pezón con abdomen blando', 'Herida **toracoabdominal**: lesión diafragmática hasta demostrar lo contrario'),
              ('Fractura de las **costillas 9 a 11 izquierdas**', 'Lesión de **bazo**'),
              ('Fractura de la **1.ª o 2.ª costilla**', 'Trauma de alta energía: lesión de **grandes vasos** y plexo braquial')])
    oral(u, 'El pericardio fibroso es poco distensible, por eso un derrame **agudo** de pocos cientos de mililitros produce **taponamiento**: hipotensión, ingurgitación yugular y ruidos apagados (**tríada de Beck**). Se diagnostica con **FAST subxifoideo** y se resuelve con **ventana pericárdica o toracotomía**; la pericardiocentesis es un puente. La **aorta** se rompe típicamente en el **istmo**, junto al **ligamento arterioso**, por desaceleración brusca; se sospecha por el **mediastino ensanchado** y se confirma con **angio-TC**.', 'Así lo decís en el oral: corazón y aorta')
