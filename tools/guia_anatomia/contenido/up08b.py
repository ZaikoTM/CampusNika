# -*- coding: utf-8 -*-
"""UP 8 · Parte B: rodilla y pierna, tobillo y pie, nervios del miembro inferior, columna, tumores, preguntas y referencias."""
from .up01e import N, G, L, oral
from .up08a import ORR, CTO


def rodilla_pierna(u):
    u.h2('Rodilla y pierna: ligamentos, meniscos, fosa poplítea y compartimentos', intro='En la rodilla se preguntan los ligamentos y meniscos; en la pierna, los cuatro compartimentos y el nervio peroneo. Las dos grandes urgencias vasculares de la región son la **luxación de rodilla** y el **síndrome compartimental**.')
    u.h3('Ligamentos y meniscos')
    u.tabla(['Estructura', 'Función', 'Cómo se lesiona y cómo se examina'], [
        ['**LCA (ligamento cruzado anterior)**', 'Evita la traslación **anterior** de la tibia', 'Giro con el pie fijo; chasquido y **hemartrosis**; **Lachman** (el más sensible) y cajón anterior'],
        ['**LCP (ligamento cruzado posterior)**', 'Evita la traslación **posterior** de la tibia', 'Golpe en la cara anterior de la tibia (“tablero”); **cajón posterior**'],
        ['**LCM (colateral medial)**', 'Estabilidad al **valgo**', 'Golpe lateral; estrés en valgo; se asocia al menisco medial'],
        ['**LCL (colateral lateral)**', 'Estabilidad al **varo**', 'Estrés en varo; se asocia a lesiones del **nervio peroneo común**'],
        ['**Meniscos medial y lateral**', 'Amortiguan, distribuyen la carga y estabilizan', '**Chasquido y bloqueo articular**; McMurray; la **zona roja** (periférica) se irriga y se sutura, la **blanca** no'],
    ], fuente='Netter, láminas S-173, S-279 a S-282; Gray, págs. 336 a 340; Orrego y Morán (2014), cap. 14.')
    N(u, 'S-173', 'Rodilla: ligamentos cruzados y colaterales.', ['**LCA** se inserta en la cara medial del cóndilo lateral; **LCP** en la cara lateral del cóndilo medial.', 'Los cruzados son **intraarticulares y extrasinoviales**.'], 205)
    N(u, 'S-281', 'Rodilla: menisco medial y lateral y cápsula (visión superior e inferior).', ['El menisco **medial** tiene forma de C y se **adhiere al LCM**: se lesiona más.', 'El **lateral** es más circular y móvil.'], 205)
    G(u, 337, 'Articulación de la rodilla con la rótula retirada (Gray).', ['Ligamentos cruzados dentro de la escotadura intercondílea y ambos meniscos.'], 205)
    G(u, 338, 'Rodilla: bolsas sinoviales y cápsula articular (Gray).', ['Recesos y bolsas; relacionalo con el **derrame articular**.'], 190)
    L(u, 'tr_o14_p1_1.png', 'Irrigación del menisco: la zona periférica (roja) tiene vasos; la central (blanca) no.', ORR.format(c='cap. 14, lesiones meniscales'), ['La zona vascular cicatriza y puede suturarse; la avascular se reseca.'], 85)
    L(u, 'tr_o14_p2_1.png', 'Tipos de lesión meniscal (longitudinal, en asa de balde, radiada, horizontal).', ORR.format(c='cap. 14'), ['La **lesión en asa de balde** produce **bloqueo** de la extensión.'], 85)
    L(u, 'tr_o14_p4_0.png', 'RM de rodilla: rotura meniscal en asa de balde.', ORR.format(c='cap. 14, fig. 14-10'), ['La RM es el estudio de elección para ligamentos y meniscos.'], 70)
    L(u, 'tr_o14_p5_0.png', 'Ligamentos cruzados de la rodilla (esquema).', ORR.format(c='cap. 14, lesión del LCA'), ['Seguí el LCA desde el fémur a la tibia.'], 85)
    u.h3('Fosa poplítea: la región donde se lesionan los vasos')
    u.ul(['Límites: **bíceps femoral** (arriba y lateral), **semimembranoso y semitendinoso** (arriba y medial) y las dos cabezas del **gastrocnemio** (abajo).',
          'Contenido de superficial a profundo: **nervio tibial**, **vena poplítea** y **arteria poplítea** (la más profunda, pegada al fémur y a la cápsula posterior). El **peroneo común** corre por el borde del bíceps hacia el cuello del peroné.',
          'La arteria poplítea queda **fija** en el hiato aductor y en el arco del sóleo: por eso la **luxación de rodilla** y la fractura de la meseta tibial o supracondílea la **lesionan** (el 20-40 % de las luxaciones de rodilla).'])
    N(u, 'S-282', 'Rodilla: visiones posterior y sagital.', ['Fosa poplítea, ligamentos cruzados y cuernos posteriores de los meniscos.'], 205)
    G(u, 340, 'Fosa poplítea (Gray).', ['Contenido y límites; seguí tibial, vena y arteria poplítea.'], 205)
    u.box('alerta', 'Luxación de rodilla: la **arteria poplítea** y el **peroneo común**', 'Es una **urgencia vascular**: aunque el pulso reaparezca tras la reducción, hay que hacer **índice tobillo-brazo** y, si es menor de 0,9, **angiotomografía** (o arteriografía) porque la lesión de la **íntima** puede trombosar horas después. El **peroneo común** se estira (pie caído) en 20-40 %. Se asocia a ruptura de **varios ligamentos** (cruzados y colaterales).')
    u.h3('Pierna: cuatro compartimentos y qué pasa en cada uno')
    u.tabla(['Compartimento', 'Músculos', 'Nervio', 'Arteria', 'Si se lesiona el nervio'], [
        ['**Anterior**', 'Tibial anterior, extensor largo del dedo gordo y de los dedos', '**Peroneo profundo**', 'Tibial anterior', 'Pierde la dorsiflexión (**pie caído**) y la sensibilidad del **primer espacio interdigital**'],
        ['**Lateral**', 'Peroneo largo y corto', '**Peroneo superficial**', 'Ramas de la peronea', 'Pierde la eversión; anestesia en el dorso del pie'],
        ['**Posterior superficial**', 'Gastrocnemio, sóleo, plantar', '**Tibial**', 'Tibial posterior y peronea', 'Pierde la flexión plantar'],
        ['**Posterior profundo**', 'Tibial posterior, flexores largos', '**Tibial**', 'Tibial posterior', 'Pierde la inversión y la flexión de los dedos; anestesia plantar'],
    ], fuente='Netter, láminas S-284 a S-289; Gray, págs. 354, 356 y 358.')
    N(u, 'S-287', 'Músculos de la pierna: compartimento lateral.', ['Peroneo largo y corto, con el nervio peroneo superficial.'], 205)
    N(u, 'S-288', 'Músculos de la pierna: compartimento anterior (plano superficial).', ['Tibial anterior y extensores; nervio peroneo profundo y arteria tibial anterior.'], 205)
    N(u, 'S-286', 'Músculos de la pierna: plano profundo del compartimento posterior.', ['Tibial posterior y flexores largos con el nervio tibial y la arteria tibial posterior.'], 205)
    G(u, 354, 'Región posterior de la pierna: arterias y nervios (Gray).', ['Compará con el compartimento anterior.'], 205)
    G(u, 358, 'Región anterior de la pierna: arterias y nervios (Gray).', ['Peroneo profundo con la tibial anterior.'], 205)
    u.box('alerta', 'Síndrome compartimental: cuándo pensarlo y qué se hace', 'Se produce cuando la presión dentro del compartimento supera la de perfusión: **fractura de tibia**, aplastamiento, yeso apretado, reperfusión. **Dolor desproporcionado y que aumenta con el estiramiento pasivo de los dedos**, tensión de la pierna y parestesias. Los **pulsos pueden estar presentes** (la ausencia de pulso es tardía). Se confirma por clínica (o presión; diferencia con la diastólica menor de 30 mmHg) y se trata con **fasciotomía de los cuatro compartimentos** por dos incisiones. El **compartimento anterior** es el más afectado.')
    L(u, 'tr_o11_p2_0.png', 'Distribución de los dolores radiculares en el miembro inferior.', ORR.format(c='cap. 11, columna y radiculopatías'), ['Cada raíz tiene su territorio (L4 cara medial de la pierna; L5 dorso del pie; S1 borde lateral y planta).'], 80)
    u.h3('Fracturas de tibia y peroné, y el nervio peroneo común')
    u.ul(['La tibia es **subcutánea en toda su cara anteromedial**: por eso las fracturas son **abiertas** con frecuencia (clasificación de **Gustilo**) y la cobertura de partes blandas es un problema central.',
          'La **unión del tercio medio con el distal** tiene la peor irrigación: retardo de consolidación y seudoartrosis.',
          'El **nervio peroneo común** rodea el **cuello del peroné**, superficial, sin protección: se lesiona con la fractura del cuello del peroné, el **yeso** mal acolchado, la **luxación de rodilla** y las posiciones prolongadas (**pie caído**, marcha en steppage, anestesia dorsal del pie).',
          'La **fractura de Maisonneuve** (peroné proximal) se acompaña de **rotura de la sindesmosis y de la membrana interósea**: siempre se examina y se estudia el tobillo cuando duele el peroné proximal.'])
    L(u, 'tr_o15_p4_0.png', 'Fractura de Maisonneuve: lesión de la sindesmosis con fractura proximal del peroné.', ORR.format(c='cap. 15, lesiones del tobillo'), ['La energía asciende por la **membrana interósea** hasta el peroné proximal.'], 100)
    L(u, 'tr_o14_p8_1.png', 'Rodilla: fractura de rótula con rasgo transverso desplazado y rótula bipartita.', ORR.format(c='cap. 14, fig. 14-21'), ['La rótula es el hueso sesamoideo del cuádriceps; la fractura transversa **pierde la extensión activa**.'], 85)
    N(u, 'S-119', 'Nervio peroneo común.', ['Rodea el **cuello del peroné** y se divide en **peroneo superficial** y **peroneo profundo**.', 'Mirá el territorio cutáneo del dorso del pie.'], 205)
    oral(u, 'La rodilla tiene dos **cruzados** intraarticulares (el **LCA** impide la traslación anterior de la tibia y se examina con **Lachman**; el **LCP**, la posterior), dos **colaterales** (medial: valgo; lateral: varo) y dos **meniscos**; el medial está adherido al LCM y se lesiona más. En la **fosa poplítea**, de superficial a profundo, están el **nervio tibial, la vena y la arteria poplítea**, que está fija en el hiato aductor y en el arco del sóleo: la **luxación de rodilla** la lesiona (hay que hacer **índice tobillo-brazo** aunque haya pulso). La pierna tiene **cuatro compartimentos**; el **síndrome compartimental** (dolor al estiramiento pasivo, pulsos presentes) se trata con **fasciotomía**. El **peroneo común** rodea el cuello del peroné y su lesión produce **pie caído**.', 'Así lo decís en el oral: rodilla y pierna')


def tobillo_pie(u):
    u.h2('Tobillo y pie: ligamentos, astrágalo, calcáneo, Lisfranc y túnel del tarso', intro='Es una de las regiones más preguntadas por la unidad (fracturas de calcáneo, astrágalo, metatarsianos y fracturas por estrés). La clave es la **vascularización terminal del astrágalo** y los **ligamentos del tobillo**.')
    u.h3('Articulación del tobillo y sus ligamentos')
    u.tabla(['Ligamento', 'Qué une', 'Lesión'], [
        ['**Deltoideo** (medial)', 'Maléolo medial con astrágalo, calcáneo y escafoides', 'Rotura en la eversión; **mal pronóstico si se combina con fractura de peroné**'],
        ['**Peroneoastragalino anterior** (lateral)', 'Peroné con astrágalo', 'El **primero en lesionarse en el esguince por inversión** (el más frecuente)'],
        ['**Peroneocalcáneo** y **peroneoastragalino posterior**', 'Peroné con calcáneo y astrágalo', 'Se lesionan en esguinces más graves'],
        ['**Sindesmosis** (tibioperonea inferior y membrana interósea)', 'Mantiene la **mortaja** tibioperonea', 'Esguince **“alto”** o fractura de Weber **C**; si se abre, el astrágalo queda inestable'],
    ], fuente='Netter, láminas S-179 y S-180; Gray, págs. 347 y 348; Orrego y Morán (2014), cap. 15.')
    N(u, 'S-179', 'Tobillo: radiografías de frente y perfil.', ['Maléolos, **mortaja** (espacio tibioastragalino uniforme) y astrágalo.'], 150)
    N(u, 'S-180', 'Ligamentos del tarso y del pie.', ['**Deltoideo** medial y complejo lateral (peroneoastragalino anterior, peroneocalcáneo, peroneoastragalino posterior).'], 205)
    G(u, 347, 'Articulación del tobillo (talocrural) (Gray).', ['Mortaja y relación tibia-peroné-astrágalo; Rx abajo.'], 205)
    G(u, 348, 'Ligamentos de la articulación del tobillo (Gray).', ['Deltoideo y ligamentos laterales.'], 205)
    L(u, 'tr_o15_p3_0.png', 'Radiografía de tobillo con fractura maleolar.', ORR.format(c='cap. 15, fractura de tobillo'), ['Se busca la **mortaja** ensanchada y el trazo del peroné respecto de la sindesmosis (Weber A, B y C).'], 85)
    u.h3('Fractura de tobillo: clasificación de Weber')
    u.tabla(['Tipo', 'Nivel del trazo del peroné', 'Sindesmosis', 'Tratamiento habitual'], [
        ['**A**', 'Por debajo de la sindesmosis', 'Intacta', 'Habitualmente conservador'],
        ['**B**', 'A nivel de la sindesmosis (oblicuo)', 'Puede lesionarse parcialmente', 'Quirúrgico si es inestable'],
        ['**C**', 'Por encima de la sindesmosis', '**Rota** (inestable)', '**Quirúrgico** (fijación de la sindesmosis)'],
    ], fuente='Orrego y Morán (2014), cap. 15; Ramos Vértiz, fracturas de tobillo.')
    u.h3('Astrágalo: la irrigación que explica la necrosis')
    u.ul(['El astrágalo está **cubierto casi por completo de cartílago** y no tiene inserciones musculares: sus vasos entran por pocas zonas (**arteria del seno del tarso**, de la peronea y de la tibial anterior; **arteria del canal del tarso**, de la tibial posterior; y **ramas deltoideas**).',
          'La **fractura del cuello** interrumpe los vasos que van al cuerpo: **necrosis avascular del cuerpo**. La **clasificación de Hawkins** (I-IV) predice el riesgo: **I** sin desplazar (≈ 10 %), **II** con subluxación subastragalina (≈ 40 %), **III** con luxación del cuerpo del tibioastragalina (≈ 90 %), **IV** además luxación astragaloescafoidea.',
          'El **signo de Hawkins** (radiolucencia subcondral a las 6-8 semanas) indica que **hay vascularización** y descarta necrosis.'])
    L(u, 'tr_o15_p6_1.png', 'Mecanismo de la fractura del astrágalo: caída con el pie en dorsiflexión forzada.', ORR.format(c='cap. 15, fractura del astrágalo'), ['El cuello del astrágalo choca contra el borde anterior de la tibia.'], 85)
    u.h3('Calcáneo: caída de altura y lesiones asociadas')
    u.ul(['Es el hueso del tarso **más fracturado** (≈ 60 %), casi siempre por **caída de altura** sobre los talones: el astrágalo se clava en el calcáneo y lo aplasta.',
          'Aplana el **ángulo de Böhler** (normal 20°-40°) y ensancha el talón.',
          '**Asociaciones obligatorias**: fractura de **columna lumbar o dorsal** (10 %), de la **meseta tibial**, del **calcáneo contralateral** y **síndrome compartimental del pie**; hay que estudiar la columna siempre.',
          'Se palpa el **ángulo de Böhler** y el **talón ancho**; el tratamiento es quirúrgico si hay desplazamiento articular.'])
    u.h3('Mediopié y antepié: Lisfranc, metatarsianos y fractura de Jones')
    u.tabla(['Lesión', 'Mecanismo', 'Punto clave'], [
        ['**Luxofractura de Lisfranc** (tarsometatarsiana)', 'Caída con el pie en equino, pisar un escalón o accidente de moto', '**Equimosis plantar**; ensanchamiento entre la base del 1.º y 2.º metatarsiano; riesgo de **lesión de la arteria dorsal del pie** y síndrome compartimental'],
        ['**Fractura de la base del 5.º metatarsiano**', 'Inversión forzada (**avulsión del peroneo corto**)', 'Zona **I** (tuberosidad): buena; zona **II-III (Jones)**: **mala irrigación** → retardo de consolidación'],
        ['**Fractura por estrés** (marcha)', 'Sobrecarga repetida (militares, corredores, osteoporosis)', 'Dolor al apoyar y **radiografía normal al inicio**: pedir **RM o centellograma**; **2.º metatarsiano** y **calcáneo**'],
    ], fuente='Orrego y Morán (2014), cap. 15; Ramos Vértiz, lesiones del pie; Manual CTO.')
    L(u, 'tr_o15_p7_1.png', 'Mecanismo de la lesión de Lisfranc: carga axial sobre el pie en equino.', ORR.format(c='cap. 15, fractura-luxación de Lisfranc'), ['El segundo metatarsiano es la “piedra angular” del arco tarsometatarsiano.'], 85)
    L(u, 'tr_o15_p8_2.png', 'Irrigación del 5.º metatarsiano: la zona de la fractura de Jones recibe poca sangre.', ORR.format(c='cap. 15, fracturas de los metatarsianos'), ['Por eso la fractura diafisaria proximal del 5.º metatarsiano **consolida mal**.'], 80)
    L(u, 'tr_o15_p8_1.png', 'Radiografía del pie: fractura-luxación del mediopié.', ORR.format(c='cap. 15'), ['Buscá la **alineación** del borde medial del 2.º metatarsiano con el cuneiforme intermedio.'], 85)
    N(u, 'S-177', 'Huesos del pie: visiones lateral y medial.', ['Calcáneo, astrágalo, escafoides, cuneiformes y cuboides; los arcos longitudinales.'], 190)
    N(u, 'S-178', 'Calcáneo.', ['Sustentáculo del astrágalo (**sustentaculum tali**) y tuberosidad posterior.'], 205)
    G(u, 345, 'Huesos y articulaciones del pie (Gray).', ['Rx de perfil y articulaciones tarsianas (de Chopart y de Lisfranc).'], 205)
    u.h3('Túnel del tarso y nervios plantares')
    u.ul(['El **nervio tibial** pasa por **detrás del maléolo medial**, bajo el **retináculo flexor**, con el tendón del tibial posterior, el flexor largo de los dedos, la arteria tibial posterior y el flexor largo del dedo gordo (mnemotecnia **“Tom, Dick And Harry”**: **T**ibial posterior, flexor largo de los **D**edos, **A**rteria y **N**ervio tibiales, flexor largo del dedo gordo, o **H**allux).',
          'Se divide en **nervio plantar medial** y **lateral**; su compresión produce el **síndrome del túnel del tarso** (dolor y parestesias plantares nocturnas).',
          'El **pulso tibial posterior** se palpa detrás del maléolo medial; el **pedio** (dorsal del pie) sobre el dorso, lateral al tendón del extensor largo del dedo gordo.'])
    N(u, 'S-290', 'Vainas tendinosas de la región del tobillo.', ['Tibial posterior, flexores y peroneos: relación con los retináculos.'], 205)
    G(u, 366, 'Dorso del pie: arterias y nervios (Gray).', ['Pedia y nervios peroneos; distribución cutánea.'], 205)
    G(u, 368, 'Aponeurosis plantar (Gray).', ['Relacionala con la **fascitis plantar** y el pie plano.'], 190)
    oral(u, 'El **astrágalo** casi no tiene inserciones musculares y está cubierto de cartílago, por eso su irrigación es **terminal** (arterias del seno y del canal del tarso, ramas deltoideas). La fractura del **cuello** puede producir **necrosis avascular del cuerpo**, que se estima con la **clasificación de Hawkins**. El **calcáneo** es el hueso del tarso más fracturado, por **caída de altura**; se asocia a fracturas de **columna** y se ve el **ángulo de Böhler** aplanado. La **luxofractura de Lisfranc** compromete la articulación tarsometatarsiana y se sospecha con **equimosis plantar**; la **fractura de Jones** del 5.º metatarsiano consolida mal por su irrigación. Ante dolor en un militar o corredor con Rx normal, pienso en **fractura por estrés** y pido **RM**.', 'Así lo decís en el oral: tobillo y pie')


def nervios(u):
    u.h2('Lesiones nerviosas del miembro inferior: qué nervio, por qué y qué clínica da', intro='Es lo que más se pregunta en traumatología: “¿qué nervio se lesiona en esta fractura y qué ves en el paciente?”. Acá está todo junto y ordenado de proximal a distal.')
    u.tabla(['Nervio', 'Raíces', 'Dónde se lesiona (traumatología)', 'Qué pierde'], [
        ['**Glúteo superior**', 'L4-S1', 'Fractura de pelvis o acetábulo, abordajes laterales de cadera, inyección mal ubicada', '**Abducción de cadera** (glúteo medio y menor): **marcha de Trendelenburg**'],
        ['**Glúteo inferior**', 'L5-S2', 'Abordajes posteriores', '**Extensión de cadera** (glúteo mayor): dificultad para subir escaleras y pararse'],
        ['**Ciático**', 'L4-S3', '**Luxación posterior de cadera**, fractura del acetábulo, inyección intraglútea', 'Flexión de rodilla y **todos los músculos de pierna y pie**; anestesia desde la rodilla (excepto la cara medial); **la porción peronea es la más afectada**'],
        ['**Femoral**', 'L2-L4', 'Hematoma del psoas, fractura de pelvis, cirugía de cadera', '**Extensión de rodilla** (cuádriceps): cede al caminar; pierde el reflejo rotuliano'],
        ['**Obturador**', 'L2-L4', 'Fractura de ramas del pubis, cirugía pelviana', '**Aducción** del muslo; anestesia medial del muslo'],
        ['**Peroneo común**', 'L4-S2', '**Cuello del peroné**, luxación de rodilla, yeso apretado', '**Pie caído** (dorsiflexión y eversión), marcha en steppage, anestesia del **dorso del pie y cara lateral de la pierna**'],
        ['**Peroneo profundo**', 'L4-L5', 'Síndrome compartimental anterior, fractura de tibia', 'Dorsiflexión del dedo gordo; anestesia del **primer espacio interdigital**'],
        ['**Tibial**', 'L4-S3', 'Luxación de rodilla, fractura de tibia, túnel del tarso', '**Flexión plantar** (no puede ponerse de puntillas), inversión; anestesia de la **planta**'],
        ['**Sural**', 'S1-S2', 'Cirugía del Aquiles', 'Anestesia del **borde lateral del pie**'],
    ], fuente='Netter, láminas S-115 a S-119; Gray, págs. 322, 326, 354 y 358; Orrego y Morán (2014); Ramos Vértiz, lesiones de los nervios periféricos.')
    N(u, 'S-115', 'Nervios femoral y cutáneo femoral lateral.', ['Territorio sensitivo del muslo anterior y de la cara medial de la pierna (**safeno**).'], 205)
    N(u, 'S-118', 'Nervio tibial.', ['Ramas musculares de la pantorrilla y **nervios plantares** medial y lateral.'], 205)
    N(u, 'S-266', 'Nervios cutáneos y venas superficiales del miembro inferior: visión anterior.', ['Mapa de sensibilidad de la pierna y el dorso del pie.'], 205)
    u.si_ves([('**Pie caído** + anestesia del dorso del pie', '**Peroneo común** (cuello del peroné, luxación de rodilla, yeso)'),
              ('No puede ponerse de **puntillas** + anestesia plantar', '**Tibial** (luxación de rodilla, fractura de tibia)'),
              ('**Trendelenburg** positivo', '**Glúteo superior**'),
              ('El pie cuelga y además la rodilla no flexiona', '**Ciático** completo'),
              ('Rodilla que cede al apoyar', '**Femoral**'),
              ('Dolor desproporcionado con la pierna tensa y **pulsos presentes**', '**Síndrome compartimental**'),
              ('Pierna fría, sin pulsos y pálida tras luxación de rodilla', '**Lesión de la poplítea**: urgencia vascular')])
    u.h3('Qué se hace en toda fractura o luxación: el examen que no puede faltar')
    u.ul(['**Antes y después** de reducir o inmovilizar: **pulsos distales** (pedio y tibial posterior), llenado capilar, color y temperatura.',
          '**Sensibilidad** (dorso del pie y primer espacio, planta, borde lateral) y **motilidad** (dorsiflexión, flexión plantar, dedo gordo).',
          'Si hay déficit después de la reducción, **se reevalúa** y puede requerir exploración; si hay isquemia, **reparación vascular urgente** (el tiempo es crítico: 6 horas).'])
    oral(u, 'Las lesiones nerviosas del miembro inferior se piensan por la **anatomía**: el **ciático** se lesiona en la **luxación posterior de cadera** y la fractura del acetábulo (la porción **peronea** es la más afectada); el **peroneo común** rodea el **cuello del peroné** y por eso produce **pie caído** en la fractura del peroné, la luxación de rodilla o con un yeso apretado; el **tibial** produce pérdida de la flexión plantar y anestesia plantar; el **glúteo superior** produce **marcha de Trendelenburg**; el **femoral**, pérdida de la extensión de rodilla. En toda fractura o luxación documento **pulsos, sensibilidad y motilidad antes y después** del tratamiento.', 'Así lo decís en el oral: lesiones nerviosas')


def columna(u):
    u.h2('Columna vertebral y raíces: estabilidad, médula, cola de caballo y radiculopatías', intro='La columna se estudia desde dos preguntas: **¿es estable?** y **¿hay compromiso neurológico?** Después viene la pregunta clásica: **qué raíz** da cada dolor, déficit y reflejo.')
    u.h3('Vértebra y segmento móvil')
    u.ul(['Cada vértebra tiene **cuerpo** (soporta la carga), **arco posterior** (pedículos, láminas, apófisis) y **agujero vertebral** (conducto raquídeo). Entre dos vértebras hay un **disco** (núcleo pulposo y anillo fibroso), las **articulaciones interapofisarias** y los **ligamentos longitudinales anterior y posterior**.',
          'El **ligamento longitudinal posterior** es el que protege la protrusión discal en la línea media; por eso la hernia lumbar es **posterolateral**.',
          'La **médula** termina en **L1-L2** (**cono medular**); por debajo está la **cola de caballo**. **Cada raíz sale por el agujero que está por debajo de su vértebra (en lumbar)**: la raíz L5 sale por el agujero L5-S1.'])
    N(u, 'S-144', 'Vértebras torácicas.', ['Cuerpo, pedículos, láminas y apófisis; carillas costales.'], 190)
    N(u, 'S-148', 'Articulaciones de la columna vertebral: región lumbar.', ['Disco, ligamentos longitudinales, interapofisarias y agujero de conjunción.'], 190)
    N(u, 'S-18', 'Raíces de los nervios espinales y vértebras.', ['**La médula termina en L1-L2**; la cola de caballo ocupa el saco dural por debajo.', 'Relación entre cada raíz y su agujero.'], 205)
    G(u, 46, 'Forámenes intervertebrales y discos (Gray).', ['Qué raíz pasa por cada agujero y por qué una hernia posterolateral comprime la raíz que sale **por debajo**.'], 205)
    G(u, 47, 'Problemas del disco intervertebral (Gray).', ['Protrusión y hernia con RM; compresión de la raíz.'], 205)
    G(u, 58, 'Nervios espinales (Gray).', ['Nomenclatura y salida por los agujeros.'], 205)
    L(u, 'tr_c10_p2_0.png', 'Vértebras cervicales (atlas y axis) y segmento móvil con disco.', CTO.format(c='columna vertebral'), ['Atlas sin cuerpo; axis con la **apófisis odontoides**.'], 85)
    u.h3('Fractura vertebral: estabilidad y clasificación de Denis (tres columnas)')
    u.tabla(['Columna', 'Contenido', 'Si se rompe'], [
        ['**Anterior**', 'Ligamento longitudinal anterior y **mitad anterior del cuerpo**', 'Fractura **por compresión** (cuña): estable'],
        ['**Media**', '**Mitad posterior del cuerpo**, disco posterior y ligamento longitudinal posterior', 'Si se rompe la media (**estallido**) hay riesgo neurológico: la pared posterior entra al conducto'],
        ['**Posterior**', 'Arco posterior y ligamentos interespinosos', 'Con la media: **inestable** (fractura de Chance, luxofractura)'],
    ], fuente='Ramos Vértiz, fracturas de la columna vertebral; Manual CTO; Orrego y Morán (2014).')
    u.ul(['**Inestable** si hay compromiso de **2 o más columnas** de Denis, o la media; riesgo de lesión medular.',
          'Mecanismos: **compresión** (caída de altura), **flexión-distracción** (cinturón de seguridad: **fractura de Chance**), **estallido**, **rotación** (luxofractura).',
          'En todo politraumatizado con dolor de columna, déficit neurológico o alteración de conciencia: **inmovilización completa** (collar rígido y tabla) hasta descartar lesión.',
          'La fractura de **calcáneo por caída** y la fractura de **vértebra lumbar** van juntas: se estudia la columna.'])
    u.h3('Lesión medular: clasificación ASIA y síndromes')
    u.tabla(['Síndrome', 'Qué ves', 'Mecanismo típico'], [
        ['**Completo**', 'Pérdida **total** de motilidad y sensibilidad por debajo del nivel (ASIA A); **shock espinal** (hipotensión, bradicardia, arreflexia)', 'Luxofractura con sección o contusión medular'],
        ['**Brown-Séquard**', '**Hemisección**: pérdida motora y propioceptiva **del mismo lado** y del dolor y la temperatura del **lado opuesto**', 'Herida penetrante'],
        ['**Cordón central**', 'Debilidad **mayor en los miembros superiores** que en los inferiores', 'Hiperextensión cervical en un anciano con canal estrecho'],
        ['**Cordón anterior**', 'Pérdida motora, dolor y temperatura; **conserva la propiocepción**', 'Flexión; compromiso de la arteria espinal anterior'],
        ['**Cono medular**', 'Pérdida de esfínteres precoz, anestesia en silla de montar, **arreflexia vesical**; mezcla de motoneurona superior e inferior', 'Fractura toracolumbar T12-L1'],
        ['**Cola de caballo**', '**Dolor radicular bilateral**, anestesia en silla de montar, **retención urinaria**, paresia de miembros inferiores; **motoneurona inferior**', 'Hernia discal central masiva, fractura lumbar baja: **urgencia quirúrgica**'],
    ], fuente='Netter, láminas S-16 a S-25; Gray, pág. 59; Manual CTO; Ramos Vértiz.')
    N(u, 'S-20', 'Sistema nervioso simpático: esquema (cadena paravertebral).', ['Explica la **hipotensión del shock neurogénico** en la lesión alta.'], 190)
    N(u, 'S-22', 'Nervio espinal, raíces y ramos.', ['Corte a través de una vértebra lumbar: relaciones de la raíz con el disco.'], 205)
    N(u, 'S-24', 'Arterias de la médula espinal: distribución intrínseca.', ['La **arteria espinal anterior** irriga los 2/3 anteriores; su compromiso da el síndrome de cordón anterior.'], 205)
    G(u, 59, 'Médula espinal (Gray).', ['Estructura, raíces y meninges.'], 205)
    u.h3('Radiculopatías cervicales y lumbosacras: qué raíz es')
    u.tabla(['Raíz', 'Dolor / parestesias', 'Debilidad', 'Reflejo'], [
        ['**C5**', 'Hombro y cara lateral del brazo', 'Deltoides', 'Bicipital'],
        ['**C6**', 'Cara lateral del antebrazo y **pulgar**', '**Bíceps** y extensores de la muñeca', 'Estilorradial'],
        ['**C7**', 'Dedo **medio**', '**Tríceps** y flexores de la muñeca', 'Tricipital'],
        ['**C8**', 'Borde cubital y meñique', 'Flexores de los dedos', '—'],
        ['**L4**', 'Cara **anteromedial** del muslo y de la pierna', '**Cuádriceps** (extensión de rodilla)', '**Rotuliano**'],
        ['**L5**', 'Cara lateral de la pierna y **dorso del pie** (dedo gordo)', '**Dorsiflexión del pie y del dedo gordo** (pie caído)', '—'],
        ['**S1**', 'Cara posterior de la pantorrilla, **planta** y borde lateral', '**Flexión plantar** (no se para de puntillas)', '**Aquíleo**'],
    ], fuente='Netter, láminas S-17 y S-19 (dermatomas); Gray, pág. 58; Orrego y Morán (2014), cap. 11.')
    u.ul(['**Ciática** (radiculopatía L5-S1): dolor que baja por la cara posterior del muslo; **Lasègue** positivo (elevar la pierna extendida reproduce el dolor entre 30° y 70°).',
          'La **hernia L4-L5** comprime la raíz **L5** (la que sale por el agujero L5-S1) y la **hernia L5-S1** comprime **S1**: recordá que la hernia posterolateral comprime la raíz que **va a salir por el agujero siguiente**.',
          '**Estenosis del canal lumbar**: claudicación neurógena que **mejora al sentarse o flexionar el tronco**, a diferencia de la vascular que mejora al detenerse.',
          '**Banderas rojas** (pedir RM urgente): déficit progresivo, **cola de caballo**, fiebre, cáncer, trauma, edad mayor de 50.'])
    L(u, 'tr_c10_p4_0.png', 'Escoliosis dorsal: radiografía con ángulo de Cobb de 75°.', CTO.format(c='columna: deformidades'), ['Se mide el **ángulo de Cobb**: mayor de 10° es escoliosis; mayor de 40° suele requerir cirugía.'], 85)
    oral(u, 'La médula termina en **L1-L2** (cono) y por debajo está la **cola de caballo**. Para una fractura vertebral uso la clasificación de **Denis en tres columnas**: si se compromete la **columna media** o dos columnas, es **inestable**. En la lesión medular reconozco el **Brown-Séquard** (hemisección), el **cordón central** (más débiles los brazos), el **cordón anterior** y el **síndrome de cola de caballo** (anestesia en silla de montar, retención urinaria y dolor radicular bilateral: **urgencia quirúrgica**). Para la radiculopatía lumbar: **L4** → cuádriceps y reflejo rotuliano, **L5** → dorsiflexión y dedo gordo, **S1** → flexión plantar y reflejo aquíleo. En la hernia posterolateral se comprime la raíz que **sale por el agujero siguiente**.', 'Así lo decís en el oral: columna')


def tumores(u):
    u.h2('Tumores musculoesqueléticos: dónde aparece cada uno y cómo se estudia', intro='Aunque la unidad no es anatómica en este tema, el diagnóstico de un tumor óseo se hace con la **anatomía**: en qué hueso, en qué parte del hueso y a qué edad aparece.')
    u.tabla(['Tumor', 'Edad', 'Localización típica', 'Imagen'], [
        ['**Osteosarcoma**', '10-25 años', '**Metáfisis** de fémur distal, tibia proximal y húmero proximal (**alrededor de la rodilla**)', '**Reacción perióstica** (triángulo de Codman, “rayos de sol”) y lesión mixta'],
        ['**Sarcoma de Ewing**', '5-20 años', '**Diáfisis** de huesos largos y pelvis', '“**Capas de cebolla**” (periostio laminar); fiebre y dolor (simula osteomielitis)'],
        ['**Condrosarcoma**', 'Adulto de más de 40', 'Pelvis, fémur proximal y costillas', 'Calcificaciones en “palomitas de maíz”'],
        ['**Tumor de células gigantes**', '20-40 años', '**Epífisis** (con extensión a metáfisis) de fémur distal y tibia proximal', 'Lesión lítica excéntrica en “burbujas de jabón”'],
        ['**Osteoma osteoide**', '10-30 años', 'Cortical del fémur y la tibia', '**Nido** radiolúcido con esclerosis; **dolor nocturno que cede con AINE**'],
        ['**Osteocondroma**', 'Adolescente', '**Metáfisis**, con crecimiento hacia afuera de la articulación', 'Protuberancia con continuidad de cortical y esponjosa'],
        ['**Metástasis óseas**', '**Más de 50 años**', 'Columna, pelvis, fémur proximal y costillas (**mama, próstata, pulmón, riñón y tiroides**)', 'Lesiones **líticas** (pulmón, riñón, tiroides) o **blásticas** (próstata)'],
    ], fuente='Orrego y Morán (2014), tumores óseos; Manual CTO, tumores óseos; Ramos Vértiz, tumores del aparato locomotor.')
    N(u, 'S-174', 'Tibia y peroné: visiones anterior y posterior.', ['La **metáfisis proximal de la tibia** y la **distal del fémur** concentran los tumores primarios.'], 190)
    u.ul(['**Enneking**: estadifica los tumores musculoesqueléticos según el **grado** (bajo o alto), el **compartimento** (intra o extracompartimental) y las **metástasis**.',
          '**Fractura patológica**: la que ocurre por una lesión previa (metástasis, tumor primario, quiste). **Escala de Mirels** (localización, dolor, tipo de lesión y tamaño): con puntaje de 9 o más se **fija profilácticamente**.',
          'Sospechá un tumor ante **dolor nocturno o de reposo**, masa creciente y fractura con **trauma mínimo**; **primero Rx y estudios (RM, TC, centellograma, PET)**, luego **biopsia** planificada **por quien hará la cirugía** (el trayecto se reseca con el tumor).',
          '**Sarcoma de partes blandas**: masa profunda de más de 5 cm, creciente; se estudia con **RM** y se biopsia con **trayecto planeado**; la **enucleación sin estudio previo** (“escisión inadvertida”) es el error clásico.'])
    oral(u, 'Los tumores óseos se orientan por **edad, hueso y zona**: el **osteosarcoma** aparece en la **metáfisis** alrededor de la rodilla en el adolescente; el **Ewing** en la **diáfisis**, con periostio “en cebolla”; el **tumor de células gigantes** en la **epífisis** del adulto joven; la **metástasis** (mama, próstata, pulmón, riñón, tiroides) es el tumor óseo más frecuente en el adulto. La **biopsia** se planifica con el cirujano que va a operar. La **escala de Mirels** decide si se fija una lesión metastásica para prevenir una **fractura patológica**.', 'Así lo decís en el oral: tumores')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Todas unen la anatomía con la patología de la unidad.')
    qa = [
        ('¿Cómo se irriga la cabeza femoral y por qué la fractura del cuello produce necrosis avascular?',
         'Por las **ramas retinaculares** de la **arteria circunfleja femoral medial** (de la femoral profunda), que ascienden por el cuello **dentro de la cápsula**; la **arteria del ligamento redondo** aporta poco en el adulto. La fractura **intracapsular desplazada** (Garden III y IV) las corta y la cabeza se necrosa: por eso en el anciano se prefiere la **artroplastia** y en el joven la **osteosíntesis urgente**.'),
        ('¿Qué posición adopta el miembro en la luxación posterior de cadera y qué nervio está en riesgo?',
         '**Flexión, aducción y rotación interna**, acortado. Se lesiona el **ciático** (sobre todo la porción peronea: pie caído) y hay riesgo de **necrosis avascular** si se demora la reducción más de 6 horas.'),
        ('Un paciente tiene una fractura inestable de pelvis, está hipotenso y tiene sangre en el meato. ¿Qué sangra y qué hacés?',
         'El **plexo venoso presacro** y el hueso esponjoso, y ramas de la **iliaca interna**. **Cierro el anillo** (faja pelviana), reanimo, hago **FAST/Rx**, y si persiste el shock **angioembolización o packing preperitoneal**. Por la sangre en el meato **no paso sonda**: **uretrografía retrógrada**.'),
        ('¿Cuáles son las estructuras de la fosa poplítea y por qué la luxación de rodilla es una urgencia vascular?',
         'De superficial a profundo: **nervio tibial, vena y arteria poplítea**; el **peroneo común** corre por el borde del bíceps. La arteria está **fija** en el hiato aductor y en el arco del sóleo y se estira o se lesiona la **íntima**; se hace **índice tobillo-brazo** y **angiotomografía** aunque haya pulso.'),
        ('¿Qué nervio se lesiona en la fractura del cuello del peroné y qué clínica da?',
         'El **peroneo común**, que rodea el cuello del peroné. **Pie caído** (pierde dorsiflexión y eversión), **marcha en steppage** y anestesia del dorso del pie y la cara lateral de la pierna.'),
        ('Describí el síndrome compartimental de la pierna.',
         'Aumento de la presión en un compartimento osteofascial cerrado (fractura de tibia, aplastamiento, yeso apretado, reperfusión). **Dolor desproporcionado, que aumenta con el estiramiento pasivo**, tensión, parestesias y **pulsos presentes** (la pérdida de pulso es tardía). Tratamiento: **fasciotomía de los cuatro compartimentos**. El **anterior** es el más afectado.'),
        ('¿Por qué el astrágalo se necrosa y cómo se clasifica la fractura de su cuello?',
         'Tiene **irrigación terminal** y casi todo cartílago, sin inserciones musculares. La **clasificación de Hawkins** (I a IV) estima el riesgo: de ≈ 10 % (sin desplazar) a casi 100 % (luxación del cuerpo y de otras articulaciones). El **signo de Hawkins** a las 6-8 semanas indica que hay vascularización.'),
        ('¿Con qué se asocia la fractura de calcáneo y qué ángulo se mide?',
         'Es por **caída de altura**; se asocia a fracturas de **columna toracolumbar**, de la **meseta tibial** y del calcáneo contralateral, además del síndrome compartimental del pie. Se mide el **ángulo de Böhler** (normal 20-40°), que se aplana.'),
        ('¿Qué es la clasificación de Denis y cuándo una fractura vertebral es inestable?',
         'Divide la columna en **anterior, media y posterior**. Es **inestable** si se compromete la **columna media** (estallido) o **dos o más columnas**, con riesgo de lesión medular (ej. fractura de Chance, luxofractura).'),
        ('Un hombre con dolor lumbar bilateral, anestesia en silla de montar y retención urinaria. ¿Qué pensás y qué hacés?',
         '**Síndrome de cola de caballo** (hernia central masiva, tumor, absceso). **RM urgente** y **descompresión quirúrgica de urgencia** (idealmente antes de las 48 horas) porque el déficit esfinteriano puede ser irreversible.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Orrego, M. y Morán, M. __Ortopedia y Traumatología Básica__ (2014): capítulos de pelvis y cadera, rodilla, tobillo y pie, columna, tumores, fundamentos de fracturas. Las radiografías, las ilustraciones a color y las fotografías de los capítulos 11, 13, 14 y 15 provienen de este libro.',
          'Manual CTO de Medicina y Cirugía, Traumatología y Ortopedia (2019): irrigación de la cabeza femoral, columna y escoliosis.',
          'Ramos Vértiz, A. J. __Traumatología y Ortopedia__: capítulos de pelvis, cadera, fémur, rodilla, pierna, tobillo, pie, columna, lesiones nerviosas y vasculares, tumores.',
          'Silberman, F. __Ortopedia y Traumatología__, 3.ª ed.: fundamentos, biología ósea, clasificaciones.',
          'Michans, __Cirugía__ y Schwartz, __Principios de Cirugía__: capítulos de trauma y lesiones vasculares (material de la sala).'])
    u.box('alerta', 'Discapacidad y pérdida de autonomía en el adulto mayor', 'La parte final de la unidad (discapacidad, definiciones, impacto en el adulto mayor: DSM-IV, RAE, Lillo 2014, Fantova y Villavicencio-Aguilar 2018) **no tiene contenido anatómico**: se estudia con los materiales de la sala. Esta guía cubre la anatomía que lo sustenta: las fracturas de cadera y la inmovilización son la causa más frecuente de pérdida de autonomía.')
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. Ante cualquier duda, **la lámina del atlas manda**. Las cifras (porcentajes, ángulos, tiempos) se citan para estudiar y pueden variar entre fuentes: verificá con el libro de tu cátedra.')
