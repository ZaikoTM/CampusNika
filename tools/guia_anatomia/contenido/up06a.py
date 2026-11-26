# -*- coding: utf-8 -*-
"""UP 6 · Anatomía quirúrgica de la pared abdominal, la región inguinal y el escroto. Parte A: pared y región inguinal; hernias."""
from .up01e import N, G, L, oral

GAL = 'Galindo, __Enciclopedia de Cirugía Digestiva__ (SACD, 2020), {c}.'
SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def pared_inguinal(u):
    u.h2('Pared abdominal y región inguinal: la anatomía sobre la que se hace toda la cirugía de hernias', intro='El programa abre con la “descripción anatómica” de la pared. En esta unidad la pared se estudia por capas y, sobre todo, por sus puntos débiles: la región inguinal, el canal femoral, el ombligo y la línea alba.')
    u.h3('Repaso de las capas de la pared anterolateral')
    u.ul(['De superficial a profundo: **piel, tejido celular (fascia de Camper y fascia de Scarpa), oblicuo externo, oblicuo interno, transverso del abdomen, fascia transversalis, grasa preperitoneal y peritoneo**. El **recto del abdomen** está en su vaina; la **línea alba** (de xifoides a pubis) y las **líneas semilunares (de Spiegel)** son los límites donde se unen las aponeurosis.',
          '**Dirección de las fibras**: oblicuo externo hacia abajo y adentro; oblicuo interno en abanico, perpendicular al externo; transverso horizontal. Las aponeurosis se **entrecruzan** en la línea alba: esa es la base del refuerzo de la pared.',
          '**Fascia transversalis y fascia endoabdominal**: es la capa **que realmente contiene** las vísceras; en la región inguinal es el **verdadero plano debilitado** de las hernias.',
          '**Inervación segmentaria**: T7-T12 y **L1** (iliohipogástrico e ilioinguinal). **Irrigación**: epigástricas superior e inferior, circunfleja ilíaca profunda e intercostales.'])
    L(u, 'gal_pared_corte_transverso.png', 'Corte transversal del abdomen: pared anterolateral y posterior con sus compartimentos musculares.', GAL.format(c='cap. 130 (anatomía quirúrgica de las paredes anterolaterales del abdomen)'), ['Seguí los tres músculos anchos y el recto en su vaina.'], 70)
    L(u, 'gal_pared_diseccion.png', 'Disección por planos de la pared anterolateral.', GAL.format(c='cap. 130'), ['Cada plano muscular se reconoce por la dirección de sus fibras.'], 90)
    N(u, 'S-211', 'Pared anterior del abdomen: disección superficial.', ['Oblicuo externo y su aponeurosis.'], 190)
    N(u, 'S-212', 'Pared anterior del abdomen: disección intermedia.', ['Oblicuo interno y nervios iliohipogástrico e ilioinguinal entre planos.'], 190)
    N(u, 'S-213', 'Pared anterior del abdomen: disección profunda.', ['Transverso del abdomen y vaina del recto.'], 190)
    N(u, 'S-214', 'Vaina del músculo recto del abdomen: cortes transversales.', ['Dónde pasa cada aponeurosis por encima y por debajo de la línea arcuata.'], 175)
    G(u, 149, 'Pared abdominal (Gray).', ['Compará las capas.'], 190)
    G(u, 155, 'Vasos de la pared abdominal (Gray).', ['Arterias y venas epigástricas.'], 190)
    G(u, 157, 'Nervios de la pared abdominal (Gray).', ['Trayecto de los nervios intercostales, subcostal, iliohipogástrico e ilioinguinal.'], 190)
    u.h3('Región inguinal: el conducto inguinal')
    u.tabla(['Elemento', 'Descripción'], [
        ['**Trayecto**', '~4-6 cm; **oblicuo, de lateral y arriba a medial y abajo**, paralelo y por encima de la mitad medial del ligamento inguinal'],
        ['**Anillo inguinal profundo (interno)**', 'Defecto de la **fascia transversalis**, **lateral a los vasos epigástricos inferiores**; por ahí entra el cordón (o el ligamento redondo)'],
        ['**Anillo inguinal superficial (externo)**', 'Defecto de la **aponeurosis del oblicuo externo**, sobre el **tubérculo del pubis**; lo limitan los **pilares lateral y medial** unidos por las fibras intercrurales'],
        ['**Pared anterior**', '**Aponeurosis del oblicuo externo** (y el oblicuo interno en el tercio lateral)'],
        ['**Pared posterior**', '**Fascia transversalis** y, en la mitad medial, el **tendón conjunto** (oblicuo interno y transverso)'],
        ['**Techo**', 'Fibras arqueadas inferiores del **oblicuo interno y del transverso**'],
        ['**Piso**', '**Ligamento inguinal (arcada crural)** y, medialmente, el **ligamento lacunar (de Gimbernat)**'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 132 (hernias inguinocrurales); Netter, láminas S-215, S-216 y S-218; Gray, págs. 159, 161 y 163.')
    u.h3('Contenido del conducto y cubiertas del cordón espermático')
    u.tabla(['', 'Qué es'], [
        ['**Contenido del cordón (hombre)**', '**Conducto deferente**, **arteria testicular**, **arteria deferencial**, **arteria cremastérica**, **plexo pampiniforme**, linfáticos, **ramo genital del genitofemoral** y el vestigio del **conducto peritoneovaginal**. En la mujer pasa el **ligamento redondo**'],
        ['**Estructuras en el conducto que no son del cordón**', 'El **nervio ilioinguinal** (corre sobre el cordón, por fuera)'],
        ['**Cubiertas del cordón** (de profundo a superficial)', '**Fascia espermática interna** (de la transversalis), **fascia cremastérica y cremáster** (del oblicuo interno) y **fascia espermática externa** (del oblicuo externo)'],
    ], fuente='Netter, lámina S-215; Gray, pág. 161.')
    L(u, 'gal_inguinal_vasos_color.png', 'Región inguinal: ligamentos, vasos epigástricos, anillo profundo y fosas.', GAL.format(c='cap. 132'), ['En rojo y azul las arterias y venas; fijate en la relación del anillo profundo con los vasos epigástricos.'], 80)
    L(u, 'gal_hesselbach_dibujo.png', 'Triángulo de Hesselbach, vasos epigástricos y pared posterior.', GAL.format(c='cap. 132'), ['Límites del triángulo: epigástricos inferiores, borde del recto y ligamento inguinal.'], 80)
    N(u, 'S-215', 'Conducto inguinal y cordón espermático.', ['Pilares del anillo superficial, cordón y nervio ilioinguinal.'], 190)
    N(u, 'S-216', 'Región inguinal: disecciones.', ['Capas sucesivas hasta la fascia transversalis y el anillo profundo.'], 195)
    N(u, 'S-218', 'Vaina femoral y conducto inguinal.', ['Relación del conducto inguinal con la vaina femoral por debajo del ligamento inguinal.'], 190)
    G(u, 159, 'Región inguinal (Gray).', ['Capas y relaciones.'], 190)
    G(u, 161, 'Canal inguinal en el hombre (Gray).', ['Paredes, anillos y cordón.'], 190)
    G(u, 163, 'Canal inguinal en la mujer (Gray).', ['El ligamento redondo reemplaza al cordón.'], 190)
    u.h3('Triángulo de Hesselbach, orificio miopectíneo y fosas inguinales')
    u.ul(['**Triángulo de Hesselbach**: límites: **vasos epigástricos inferiores** (lateral), **borde lateral del recto** (medial) y **ligamento inguinal** (inferior). Por ahí salen las **hernias directas**.',
          '**Orificio miopectíneo de Fruchaud**: región débil, limitada por el **arco del oblicuo interno y del transverso** (arriba), el **recto** (medial), el **ligamento de Cooper (pectíneo)** (abajo) y el **psoas ilíaco** (lateral). El **ligamento inguinal** lo divide en una parte **superior** (hernias inguinales directa e indirecta) y una **inferior** (**hernia crural**). Es la base de la reparación posterior con malla.',
          '**Vista laparoscópica posterior**: tres pliegues peritoneales: **ligamento umbilical medio** (uraco), **medial** (arteria umbilical obliterada) y **lateral** (vasos epigástricos inferiores). Entre ellos están las **fosas**: **supravesical**, **inguinal medial** (hernia directa) e **inguinal lateral** (anillo profundo: hernia indirecta); por debajo del tracto iliopúbico, la **fosa femoral**.',
          '**Triángulos de peligro en la cirugía laparoscópica**: **triángulo de la “muerte” (Doom)**, entre el conducto deferente y los vasos testiculares: contiene los **vasos ilíacos externos**; **triángulo del “dolor”**, lateral a los vasos testiculares y bajo el tracto iliopúbico: contiene los nervios **femoral, cutáneo femoral lateral y rama femoral del genitofemoral**: **no se colocan grapas ni tachuelas ahí**.',
          '**Corona mortis**: anastomosis (arterial o venosa) entre los vasos obturadores y los ilíacos externos sobre el **ligamento de Cooper**; su lesión produce una hemorragia difícil de controlar.'])
    L(u, 'gal_lap_defecto_directo.png', 'Vista laparoscópica de la región inguinal derecha: defecto directo, vasos epigástricos, conducto deferente y vasos gonadales.', GAL.format(c='cap. 134 (hernioplastia inguinal laparoscópica)'), ['Reconocé los vasos epigástricos inferiores: separan la hernia directa de la indirecta.'], 70)
    L(u, 'gal_lap_triangulos.png', 'Triángulos de peligro de la región inguinal (vista laparoscópica).', GAL.format(c='cap. 134'), ['Rojo: triángulo de la muerte (vasos ilíacos); amarillo: triángulo del dolor (nervios).'], 70)
    L(u, 'gal_lap_cooper.png', 'Ligamento de Cooper y tubérculo del pubis en la visión laparoscópica.', GAL.format(c='cap. 134'), ['Es el punto de apoyo para fijar la malla y el límite inferior del orificio miopectíneo.'], 70)
    L(u, 'gal_lap_anatomia.png', 'Anatomía laparoscópica completa: epigástricos, deferente, vasos gonadales, Cooper y corona mortis.', GAL.format(c='cap. 134'), ['Corona mortis sobre el ligamento de Cooper.'], 70)
    u.h3('Nervios de la región inguinal')
    u.tabla(['Nervio', 'Origen', 'Trayecto y territorio', 'Riesgo'], [
        ['**Iliohipogástrico**', 'L1', 'Entre el oblicuo interno y el transverso; da la sensibilidad suprapúbica y de la cadera', 'Se lesiona en la apertura de la pared o con la malla'],
        ['**Ilioinguinal**', 'L1', 'Sobre el cordón, dentro del conducto; sensibilidad del pubis, la raíz del pene o el monte de Venus y el escroto', '**Lesión o atrapamiento** por malla o sutura: **dolor crónico**'],
        ['**Genitofemoral**', 'L1-L2', '**Ramo genital** (dentro del cordón: cremáster) y **ramo femoral** (piel del triángulo femoral)', 'Triángulo del dolor; neuralgia inguinal'],
        ['**Cutáneo femoral lateral**', 'L2-L3', 'Por debajo del ligamento inguinal, cerca de la espina ilíaca anterosuperior; cara lateral del muslo', 'Meralgia parestésica; lesión en la disección laparoscópica'],
    ], fuente='Netter, láminas S-102, S-103 y S-115; Gray, págs. 157, 211 y 212.')
    N(u, 'S-336', 'Arterias de la pared anterior del abdomen.', ['Epigástrica inferior, circunfleja ilíaca profunda y sus anastomosis.'], 190)
    N(u, 'S-337', 'Venas de la pared anterior del abdomen.', ['Drenaje venoso y anastomosis cavocava y portocava (venas paraumbilicales).'], 190)
    N(u, 'S-103', 'Nervios de la pared posterior del abdomen.', ['Plexo lumbar: iliohipogástrico, ilioinguinal, genitofemoral y cutáneo femoral lateral.'], 190)
    N(u, 'S-115', 'Nervios femoral y cutáneo femoral lateral.', ['Trayecto bajo el ligamento inguinal.'], 190)
    G(u, 211, 'Plexo lumbar (Gray).', ['Origen de los nervios de la región inguinal.'], 190)
    G(u, 212, 'Plexo lumbar: distribución cutánea (Gray).', ['Territorio sensitivo de cada nervio.'], 190)
    oral(u, 'La pared tiene piel, tejido celular, **oblicuo externo, oblicuo interno, transverso, fascia transversalis**, grasa preperitoneal y peritoneo; en la región inguinal, la **fascia transversalis** es el plano débil. El **conducto inguinal** (4-6 cm, oblicuo) tiene el **anillo profundo** (defecto de la transversalis, lateral a los **epigástricos inferiores**) y el **superficial** (aponeurosis del oblicuo externo, sobre el pubis); su **pared anterior** es la aponeurosis del oblicuo externo, la **posterior** la fascia transversalis y el tendón conjunto, el **techo** el oblicuo interno y el transverso, y el **piso** el ligamento inguinal. Contiene el **cordón** (deferente, arterias testicular, deferencial y cremastérica, plexo pampiniforme, ramo genital del genitofemoral); el **ilioinguinal** corre por fuera del cordón. Las hernias salen por el **orificio miopectíneo de Fruchaud**: **indirecta** por el anillo profundo, **directa** por el triángulo de Hesselbach y **crural** por debajo del ligamento inguinal. En la cirugía laparoscópica hay que evitar el **triángulo de la muerte** (vasos ilíacos) y el **triángulo del dolor** (nervios), y la **corona mortis**.')


def hernias(u):
    u.h2('Hernias de la pared abdominal: componentes, tipos, semiología, complicaciones y bases de la reparación', intro='El objetivo de la unidad es reconocer las hernias frecuentes e infrecuentes, sus componentes y sus complicaciones. Se razonan con el orificio por el que salen y las estructuras que lo limitan.')
    u.h3('Definición y componentes')
    u.ul(['**Hernia**: protrusión de un órgano o tejido a través de un **orificio** de la pared que lo contiene. **Eventración**: hernia a través de una **cicatriz** previa, con la piel intacta. **Evisceración**: salida de las vísceras por una **herida abierta** con falla de todos los planos.',
          '**Componentes**: **saco** (peritoneo), **cuello** (la parte estrecha que pasa por el orificio; determina el riesgo de estrangulación), **contenido** (epiplón, intestino delgado, colon, apéndice, vejiga) y **cubiertas** (las capas de la pared que atraviesa).',
          '**Clasificación**: por localización (inguinal, crural, umbilical…), por **evolución** (**reductible**, **irreductible o incarcerada**, **estrangulada**), por **causa** (congénita o adquirida) y por **tamaño y defecto** (Nyhus, Gilbert y la clasificación de la Sociedad Europea de Hernia).'])
    L(u, 'gal_hernias_gilbert.png', 'Clasificación de las hernias inguinales (Gilbert): tipos I a VII.', GAL.format(c='cap. 132'), ['Los tipos I a III son indirectas, IV y V directas, VI en pantalón y VII crural, según el defecto.'], 75)
    u.h3('Hernias frecuentes')
    u.tabla(['Hernia', 'Anatomía del orificio', 'Datos clave'], [
        ['**Inguinal indirecta** (la más frecuente en el hombre)', 'Entra por el **anillo profundo** (lateral a los epigástricos inferiores), recorre el conducto y puede llegar al escroto; es **congénita** (conducto peritoneovaginal persistente) o adquirida', 'Sigue el cordón; en el niño, el tratamiento es la **herniotomía** (resección del saco)'],
        ['**Inguinal directa**', 'Protruye por el **triángulo de Hesselbach** (debilidad de la fascia transversalis); es **adquirida** (esfuerzo, edad)', 'Medial a los epigástricos; de cuello ancho: menos estrangulación; raramente llega al escroto'],
        ['**Inguinal “en pantalón”**', 'Directa e indirecta a la vez, a ambos lados de los epigástricos', 'Se descubren al operar'],
        ['**Crural (femoral)**', 'Por el **anillo crural**: límites: **ligamento inguinal** (adelante), **ligamento de Cooper** (atrás), **ligamento lacunar (de Gimbernat)** (medial) y **vena femoral** (lateral). Contiene el ganglio de Cloquet', '**Más frecuente en la mujer**; cuello rígido y estrecho: **riesgo alto de estrangulación**; **se opera siempre**. Sale por debajo del ligamento inguinal y es medial a la vena femoral'],
        ['**Umbilical**', 'Por el **anillo umbilical** (defecto de la línea alba); en niños es congénita (se cierra sola hasta los 4-5 años); en adultos, adquirida (obesidad, embarazos, ascitis)', 'Se opera en el adulto'],
        ['**Epigástrica**', 'Defecto de la **línea alba** entre el xifoides y el ombligo; contiene grasa preperitoneal', 'Dolor epigástrico mal localizado'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 12 (hernia inguinal, crural y umbilical); Galindo, Enciclopedia de Cirugía Digestiva, caps. 132 y 135.')
    L(u, 'gal_hernia_umbilical_dibujo.png', 'Hernia umbilical: anillo, saco y contenido.', GAL.format(c='cap. 135 (hernias de la línea media)'), ['El anillo umbilical es el defecto de la línea alba por donde pasaban los vasos umbilicales.'], 70)
    u.h3('Hernias infrecuentes')
    u.tabla(['Hernia', 'Sitio', 'Característica'], [
        ['**De Spiegel**', 'A lo largo de la **línea semilunar**, sobre todo a nivel de la **línea arcuata**', '**Interparietal** (por debajo de la aponeurosis del oblicuo externo): se palpa poco; diagnóstico por ecografía o TC'],
        ['**Lumbar**', '**Triángulo superior (Grynfeltt-Lesshaft)**: 12.ª costilla, serrato posteroinferior y oblicuo interno; **triángulo inferior (de Petit)**: cresta ilíaca, dorsal ancho y oblicuo externo', 'Más frecuente en el hombre y en el anciano; puede ser adquirida tras una nefrectomía'],
        ['**Obturatriz**', 'Por el **conducto obturador** (con los vasos y el nervio obturadores)', '**Mujer anciana y delgada**; obstrucción intestinal; **signo de Howship-Romberg** (dolor en la cara medial del muslo por compresión del obturador) y de **Hannington-Kiff** (ausencia del reflejo aductor)'],
        ['**Isquiática, perineal, paraestomal**', 'Orificios del piso pélvico o de una ostomía', 'Raras; diagnóstico por TC'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 15 (hernias infrecuentes de la pared abdominal); Galindo, Enciclopedia de Cirugía Digestiva, cap. 138 (hernias poco frecuentes).')
    L(u, 'gal_hernia_rara_vasos.png', 'Región de las hernias infrecuentes y estructuras que pasan por los orificios (vasos y nervio obturadores).', GAL.format(c='cap. 138'), ['El nervio obturador acompaña a la hernia obturatriz.'], 75)
    L(u, 'gal_lumbar_corte.png', 'Corte transversal de la región lumbar: pared posterior y triángulos lumbares.', GAL.format(c='cap. 138'), ['Los músculos limitan los triángulos de Petit y de Grynfeltt.'], 70)
    N(u, 'S-210', 'Pared posterolateral del abdomen.', ['Triángulos lumbares superior e inferior.'], 190)
    N(u, 'S-545', 'Región lumbar del dorso: corte transversal.', ['Capas de la región lumbar: músculos y fascia toracolumbar.'], 175)
    N(u, 'S-116', 'Nervio obturador.', ['Conducto obturador y territorio sensitivo medial del muslo.'], 190)
    u.h3('Semiología y exploración física de las hernias (trabajo práctico)')
    u.tabla(['Maniobra', 'Cómo se hace', 'Qué significa'], [
        ['**Inspección**', 'De pie y acostado; con **tos o Valsalva**', 'Tumefacción en la región inguinal o crural que **aparece con el esfuerzo**'],
        ['**Palpación**', 'Con el paciente de pie: el dedo **invagina el escroto** hasta el anillo superficial y se pide toser', 'Impulso a la tos en el pulpejo (indirecta) o contra la cara palmar (directa)'],
        ['**Maniobra de oclusión del anillo profundo**', 'Con el paciente acostado, se reduce la hernia y se **comprime el anillo profundo** (lateral al pulso femoral, sobre el punto medio del ligamento inguinal); se pide toser', 'Si **no reaparece**, es **indirecta**; si reaparece, es **directa**'],
        ['**Reductibilidad**', 'Presión suave y sostenida con la pelvis elevada', 'Reductible, irreductible (incarcerada) o con signos de estrangulación'],
        ['**Transiluminación**', 'Luz detrás del escroto', 'El **hidrocele** transilumina; la hernia con intestino, no'],
        ['**Diferenciar crural**', 'Tumor **por debajo del ligamento inguinal**, medial al pulso femoral', 'Siempre palpar el triángulo femoral'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 12; Galindo, Enciclopedia de Cirugía Digestiva, cap. 132.')
    u.h3('Complicaciones')
    u.tabla(['Complicación', 'Qué es', 'Clínica'], [
        ['**Incarceración**', 'La hernia no se puede reducir, sin sufrimiento vascular', 'Tumor irreductible, doloroso; **puede haber obstrucción**'],
        ['**Estrangulación**', 'Compromiso del **flujo vascular** del contenido: isquemia y necrosis', '**Dolor intenso y continuo**, piel roja o violácea, fiebre, leucocitosis, signos de obstrucción: **urgencia quirúrgica**'],
        ['**Hernia de Richter**', 'Solo **una parte de la pared intestinal (el borde antimesentérico)** queda atrapada', '**Puede no haber obstrucción** y necrosarse: se diagnostica tarde'],
        ['**Hernia de Littré**', 'El saco contiene un **divertículo de Meckel**', 'Rara'],
        ['**Hernia de Amyand**', 'El saco inguinal contiene el **apéndice** (**De Garengeot** si es una hernia crural)', 'Apendicitis en el saco herniario'],
        ['**Hernia por deslizamiento**', 'Una víscera (ciego, sigmoides, vejiga) forma parte de la **pared del saco**', 'Riesgo de lesión al operar'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 12; Galindo, Enciclopedia de Cirugía Digestiva, cap. 132.')
    L(u, 'gal_hernia_gigante1.png', 'Hernia inguinoescrotal voluminosa.', GAL.format(c='cap. 132'), ['La hernia indirecta puede descender al escroto siguiendo el cordón.'], 80)
    L(u, 'gal_hernia_gigante2.png', 'Hernia inguinoescrotal gigante (otro paciente).', GAL.format(c='cap. 132'), ['La pérdida del domicilio de las vísceras dificulta la reparación.'], 80)
    u.h3('Bases quirúrgicas de la reparación')
    u.tabla(['Técnica', 'En qué consiste', 'Dato'], [
        ['**Herniotomía**', 'Resección del saco y cierre del anillo', 'Niño (hernia indirecta congénita)'],
        ['**Bassini, McVay, Shouldice**', 'Reparación **con tensión** o por planos, **sin malla**', 'Shouldice: cuatro planos con sutura continua'],
        ['**Lichtenstein**', '**Hernioplastia abierta con malla** sin tensión sobre la pared posterior, bajo la aponeurosis del oblicuo externo', 'Es la técnica más usada; hay que **preservar los nervios** ilioinguinal, iliohipogástrico y la rama genital'],
        ['**TEP / TAPP** (laparoscópica)', 'Malla en el **espacio preperitoneal** (totalmente extraperitoneal o transabdominal)', 'Hernias **bilaterales**, recidivadas, retorno laboral más rápido; curva de aprendizaje'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, caps. 132 a 134; Giménez, Cirugía, 2.ª ed., cap. 12.')
    L(u, 'gal_lichtenstein_cordon.png', 'Hernioplastia de Lichtenstein: apertura del conducto y relación con el cordón y los nervios.', GAL.format(c='cap. 133 (técnica de Lichtenstein)'), ['Se identifican y preservan los nervios; la malla se ubica sobre la pared posterior.'], 70)
    u.box('clave', 'Complicaciones de la cirugía de las hernias', 'Hematoma y seroma, **infección de la malla**, **recidiva**, **neuralgia crónica** (atrapamiento del ilioinguinal), **orquitis isquémica** (trombosis del plexo pampiniforme) y **lesión del conducto deferente o de los vasos testiculares**.')
    u.h3('Eventración, evisceración, diástasis y neumoperitoneo de Goñi Moreno')
    u.tabla(['Cuadro', 'Qué es', 'Clave'], [
        ['**Eventración**', 'Hernia a través de una cicatriz; **piel íntegra**', 'Factores: infección de la herida, obesidad, tabaquismo, diabetes y tensión de la sutura; clasificación EHS; reparación con **malla** (retromuscular de Rives-Stoppa o separación de componentes)'],
        ['**Eventración de los orificios de trócar**', 'Hernia en los sitios de laparoscopia (más en trócares de **más de 10 mm** y en el ombligo)', 'Cerrar la aponeurosis en los orificios mayores de 10 mm'],
        ['**Evisceración**', '**Dehiscencia** de todos los planos con salida de las vísceras (primeros 4-10 días)', 'Cubrir con **gasas húmedas estériles** y reoperar de urgencia'],
        ['**Diástasis de los rectos**', 'Ensanchamiento de la **línea alba** por separación de los rectos, **sin defecto herniario**', 'Embarazo, obesidad; reparación solo si hay síntomas o estética'],
        ['**Neumoperitoneo progresivo de Goñi Moreno**', 'Inyección **gradual de aire** en la cavidad peritoneal durante varios días antes de operar una **eventración gigante** con “**pérdida de domicilio**” de las vísceras', 'Distiende la pared y las asas, libera adherencias y permite reintegrar el contenido y reparar la pared sin tensión excesiva'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 13 (eventraciones y evisceraciones) y cap. 14 (diástasis de los rectos); Galindo, Enciclopedia de Cirugía Digestiva, cap. 147 (eventración).')
    L(u, 'gal_eventracion_foto.png', 'Eventración de la pared abdominal sobre una cicatriz.', GAL.format(c='cap. 147'), ['La piel está íntegra; el defecto está en la aponeurosis.'], 70)
    L(u, 'gal_eventracion_foto2.png', 'Eventración sobre una cicatriz de laparotomía media.', GAL.format(c='cap. 147'), ['Observá el abultamiento sobre la cicatriz.'], 70)
    oral(u, 'La hernia tiene **saco, cuello, contenido y cubiertas**, y se complica por **incarceración** (irreductible) y **estrangulación** (isquemia: dolor continuo, piel violácea, fiebre). La **indirecta** sale por el anillo profundo (lateral a los epigástricos inferiores), sigue el cordón y puede llegar al escroto; la **directa** protruye por el triángulo de Hesselbach (medial); la **crural** sale por el anillo crural (límites: ligamento inguinal, de Cooper, lacunar y vena femoral), es más frecuente en la mujer y **se estrangula con facilidad**, por eso se opera siempre. Las **infrecuentes** son la de **Spiegel** (línea semilunar, interparietal), la **lumbar** (triángulos de Petit y Grynfeltt) y la **obturatriz** (signo de Howship-Romberg). La **hernia de Richter** atrapa solo el borde antimesentérico; la de **Amyand** contiene el apéndice. La reparación de elección en el adulto es con **malla (Lichtenstein o laparoscópica TEP/TAPP)**, cuidando los **nervios**. La **eventración** es una hernia por una cicatriz; la **evisceración**, una dehiscencia de todos los planos; y el **neumoperitoneo de Goñi Moreno** prepara la pared en las eventraciones gigantes.')
