# -*- coding: utf-8 -*-
"""UP 10 · Parte A: semiología, arterias de los miembros inferiores, isquemia aguda, aorta, carótida y arterias viscerales."""
from .up01e import N, G, L, oral

SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def S(u, archivo, titulo, cap, mirar=None, alto=120):
    L(u, 'sch_%s.jpg' % archivo, titulo, SCH.format(c=cap), mirar, alto)


def semiologia(u):
    u.h2('Semiología vascular: pulsos, índice tobillo-brazo y signos de isquemia', intro='El examen vascular es **anatomía de superficie**: saber dónde se palpa cada arteria y qué territorio pierde cuando se obstruye. Con el índice tobillo-brazo se convierte en un número que clasifica al paciente.')
    u.h3('Dónde se palpa cada pulso')
    u.tabla(['Pulso', 'Dónde se palpa', 'Qué arteria y de dónde viene'], [
        ['**Carotídeo**', 'Borde anterior del esternocleidomastoideo, a nivel del cartílago tiroides (se palpa de **a uno**)', 'Carótida común'],
        ['**Braquial**', 'Cara medial del brazo y **fosa antecubital**, medial al tendón del bíceps', 'Braquial (continuación de la axilar)'],
        ['**Radial y cubital**', 'Cara anterior de la muñeca, lateral y medial a los flexores', 'Radial y cubital (el **arco palmar** las une: **prueba de Allen**)'],
        ['**Femoral**', 'Debajo del **ligamento inguinal**, en el punto medio entre la espina ilíaca anterosuperior y la sínfisis', 'Femoral común (continuación de la iliaca externa)'],
        ['**Poplíteo**', 'Fosa poplítea, con la rodilla **semiflexionada** (el más difícil de palpar)', 'Poplítea; un pulso **muy fácil de palpar** o amplio sugiere **aneurisma**'],
        ['**Tibial posterior**', '**Detrás del maléolo medial**', 'Tibial posterior'],
        ['**Pedio**', 'Dorso del pie, **lateral al tendón del extensor largo del dedo gordo**', 'Dorsal del pie (continuación de la tibial anterior); está **ausente** en el 10 % de las personas sanas'],
    ], fuente='Netter, lámina S-303; Gray, págs. 322, 340 y 358.')
    N(u, 'S-303', 'Arterias principales y puntos de localización del pulso.', ['Repasá cada punto de palpación y la arteria que le corresponde.', 'Compará pulso **por pulso** ambos lados: la **asimetría** es el hallazgo más útil.'], 205)
    u.h3('Índice tobillo-brazo (ITB)')
    S(u, 's23_p4_0', 'ITB: se miden las presiones sistólicas en ambos brazos y en ambos tobillos con Doppler.', 'cap. 23 (Enfermedades arteriales)', ['Se toma la **presión más alta de los dos brazos** y la **más alta del tobillo** (tibial posterior o pedia) de cada pierna.'], 105)
    u.tabla(['ITB', 'Interpretación'], [
        ['**Más de 1,4**', '**Arterias no compresibles** (calcificación de la media, típica del **diabético** y del renal): no sirve; usar **índice dedo-brazo** o ondas de pulso'],
        ['**1,0 a 1,4**', 'Normal'],
        ['**0,9 a 1,0**', 'Límite'],
        ['**0,5 a 0,9**', '**Enfermedad arterial periférica**: claudicación intermitente'],
        ['**Menos de 0,5** (o presión de tobillo < 50 mmHg)', '**Isquemia crítica** (dolor en reposo, úlceras)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 17; Schwartz, 10.ª ed., cap. 23.')
    u.si_ves([('Claudicación en la **nalga y el muslo**, impotencia y **pulsos femorales ausentes**', '**Síndrome de Leriche**: obstrucción aortoilíaca'),
              ('Claudicación en la **pantorrilla** con pulso femoral presente y poplíteo ausente', 'Obstrucción **femoropoplítea** (arteria femoral superficial)'),
              ('Dolor en el **pie en reposo**, que mejora al colgar la pierna', 'Isquemia crítica (Fontaine III)'),
              ('**Pulso poplíteo amplio** y fácilmente palpable', '**Aneurisma poplíteo** (buscar el otro lado y la aorta)'),
              ('Diferencia de presión de **más de 15 mmHg** entre ambos brazos', 'Estenosis de la subclavia (**robo de la subclavia**) o disección'),
              ('Pie frío, pálido, con **llenado capilar lento y rubor en declive**', 'Isquemia crónica (prueba de **Buerger** de elevación y declive)')])
    oral(u, 'El examen vascular compara los **pulsos de ambos lados** en el cuello, los brazos y los miembros inferiores (femoral bajo el ligamento inguinal, poplíteo, tibial posterior detrás del maléolo medial y pedio sobre el dorso del pie). El **índice tobillo-brazo** (presión sistólica más alta del tobillo sobre la más alta del brazo) es normal entre **1,0 y 1,4**, la **claudicación** aparece con **0,5 a 0,9** y la **isquemia crítica** por debajo de **0,5**; en el diabético las arterias calcificadas dan un ITB falsamente alto (**más de 1,4**).', 'Así lo decís en el oral: semiología vascular')


def arterial_mmii(u):
    u.h2('Arterias de los miembros inferiores: el árbol, dónde se obstruye y qué clínica da', intro='La **isquemia crónica** se entiende como un mapa: cada nivel de obstrucción da la claudicación en el grupo muscular **distal** a la lesión. Si dibujás el árbol arterial, deducís la clínica.')
    N(u, 'S-333', 'Arterias del miembro inferior.', ['Seguí **aorta → ilíaca común → ilíaca externa → femoral común → femoral superficial y profunda → poplítea → tibial anterior, tibial posterior y peronea → pedia y plantares**.', 'La **femoral profunda** es la colateral natural cuando se ocluye la superficial.'], 205)
    N(u, 'S-270', 'Arterias y nervios del muslo: visión anterior.', ['**Triángulo femoral** (nervio, arteria y vena) y paso al **canal aductor (de Hunter)**.', 'La arteria femoral superficial atraviesa el canal de Hunter: es el sitio **más frecuente** de oclusión.'], 205)
    N(u, 'S-282', 'Rodilla: visiones posterior y sagital.', ['La **arteria poplítea** queda pegada al fémur y a la cápsula posterior: se comprime en la flexión extrema y se lesiona en la luxación.'], 205)
    G(u, 322, 'Triángulo femoral (Gray).', ['Límites y contenido; punto de **punción femoral** y de palpación del pulso.'], 205)
    G(u, 340, 'Fosa poplítea (Gray).', ['Arteria poplítea y su trifurcación en tibial anterior y tronco tibioperoneo.'], 205)
    G(u, 358, 'Región anterior de la pierna: arterias y nervios (Gray).', ['**Tibial anterior** (y nervio peroneo profundo) hasta el dorso del pie.'], 190)
    u.h3('Tres niveles de obstrucción y su clínica')
    u.tabla(['Nivel', 'Arterias', 'Claudicación en', 'Dato clave'], [
        ['**Aortoilíaco**', 'Aorta terminal y arterias ilíacas', '**Nalga, cadera y muslo**', '**Síndrome de Leriche**: claudicación glútea, **impotencia** y **ausencia de pulsos femorales**; revascularización: **bypass aortobifemoral** o angioplastia'],
        ['**Femoropoplíteo**', 'Femoral superficial y poplítea (**la más frecuente**, en el canal de Hunter)', '**Pantorrilla**', 'Pulso femoral presente y poplíteo ausente; **bypass femoropoplíteo** (safena invertida o prótesis) o angioplastia con stent'],
        ['**Infrapoplíteo (tibial)**', 'Tibiales y peronea', '**Pie** y dedos', 'Típico del **diabético y del renal**; mayor riesgo de **amputación**; revascularización distal'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 17; Michans, Cirugía, 5.ª ed., cap. 49; Schwartz, 10.ª ed., cap. 23.')
    u.h3('Clasificación de Fontaine')
    u.tabla(['Estadio', 'Clínica', 'Conducta'], [
        ['**I**', 'Asintomático (pulsos disminuidos)', 'Prevención secundaria'],
        ['**IIa**', 'Claudicación a **más de 200 m**', 'Ejercicio supervisado, antiagregante, estatina'],
        ['**IIb**', 'Claudicación a **menos de 200 m**', 'Estudio y considerar revascularización'],
        ['**III**', '**Dolor en reposo** (nocturno, mejora al colgar la pierna)', '**Revascularización**'],
        ['**IV**', '**Úlcera o gangrena**', 'Revascularización urgente o amputación'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 17.')
    S(u, 's23_p10_0', 'Angioplastia con balón: la placa se comprime y se restablece la luz.', 'cap. 23 (Enfermedades arteriales)', ['A: estenosis; B: balón inflado; C: luz restablecida (se agrega un **stent** si hace falta).'], 80)
    u.box('clave', 'Conectá con la UP8', 'La **fosa poplítea, los compartimentos de la pierna y el nervio peroneo** están desarrollados en el atlas de la **UP8**. Acá se retoman los **vasos**: una fractura, una luxación de rodilla o un yeso apretado pueden comprometerlos.')
    oral(u, 'La enfermedad arterial crónica se obstruye por niveles. La oclusión **aortoilíaca** da claudicación en la **nalga** con **impotencia y ausencia de pulsos femorales** (**síndrome de Leriche**); la **femoropoplítea**, la más frecuente, da claudicación de la **pantorrilla** porque la arteria femoral superficial atraviesa el **canal de Hunter**; la **infrapoplítea** compromete el pie y es típica del diabético. La **arteria femoral profunda** es la colateral que mantiene la perfusión. El estadio de **Fontaine** (I asintomático, IIa y IIb claudicación, III dolor de reposo, IV úlcera o gangrena) define la conducta.', 'Así lo decís en el oral: isquemia crónica')


def isquemia_aguda(u):
    u.h2('Isquemia arterial aguda: dónde se impacta el émbolo y qué hacer en las primeras horas', intro='Es una urgencia vascular: el músculo tolera la isquemia **6 horas** y luego se necrosa. La anatomía de las **bifurcaciones** explica dónde se impacta el émbolo.')
    u.tabla(['', '**Embolia**', '**Trombosis**'], [
        ['**Origen**', '**Corazón** (fibrilación auricular, infarto, valvulopatía) o aneurisma', 'Sobre una **placa aterosclerótica** previa'],
        ['**Antecedentes**', 'Sin claudicación previa; inicio **brusco**', 'Claudicación previa; inicio **más gradual**'],
        ['**Colaterales**', '**Ausentes**: isquemia más grave', '**Presentes** (formadas con el tiempo)'],
        ['**Pulsos contralaterales**', 'Normales', 'Disminuidos (enfermedad bilateral)'],
        ['**Tratamiento**', '**Heparina** y **embolectomía con catéter de Fogarty**', 'Heparina, **trombólisis** o bypass'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 16; Michans, Cirugía, 5.ª ed., cap. 49.')
    u.h3('Dónde se impacta un émbolo')
    u.tabla(['Sitio', 'Por qué', 'Clínica'], [
        ['**Bifurcación aórtica (“silla de montar”)**', 'Es el cambio de calibre más grande', '**Isquemia bilateral** de los miembros, paraparesia y dolor lumbar'],
        ['**Bifurcación femoral común** (femoral superficial y profunda)', '**El sitio más frecuente** (cerca del 40 %)', 'Pierna fría, pulso femoral presente o disminuido'],
        ['**Bifurcación poplítea** (trifurcación)', 'Disminuye el calibre', 'Pie frío con pulso femoral y poplíteo palpables'],
        ['**Bifurcación braquial**', 'Es el sitio más frecuente del miembro superior', 'Mano fría con pulso humeral conservado'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 16; Netter, láminas S-333 y S-331.')
    u.h3('Las seis P y el tiempo')
    u.ul(['**P**ain (dolor), **P**allor (palidez), **P**ulselessness (ausencia de pulso), **P**aresthesia (parestesias), **P**aralysis (parálisis) y **P**oikilothermia (frialdad).',
          '**La parálisis y la anestesia** marcan una **isquemia inmediatamente amenazante**: se revasculariza de urgencia; el **déficit motor y sensitivo** indica sufrimiento muscular y nervioso.',
          'Se inicia **heparina no fraccionada** apenas se sospecha; luego **embolectomía** (acceso femoral, **arteriotomía** transversal sobre la femoral común y catéter de **Fogarty**), trombólisis dirigida por catéter o bypass.',
          '**Síndrome de reperfusión**: al restaurar el flujo se liberan **potasio, mioglobina y ácido láctico** (hiperpotasemia, acidosis, **mioglobinuria** y falla renal) y se produce **edema muscular**.'])
    S(u, 's23_p63_0', 'Corte transversal de la pierna: los compartimentos osteofasciales cerrados que contienen músculos, arterias y nervios.', 'cap. 23 (Enfermedades arteriales)', ['Después de revascularizar, el **edema muscular** aumenta la presión dentro de cada compartimento: **síndrome compartimental**.', 'Se descomprime con **fasciotomía** de los cuatro compartimentos.'], 100)
    u.box('alerta', 'Síndrome compartimental de reperfusión', 'Es la complicación de una revascularización tardía (más de 4-6 horas). **Dolor al estiramiento pasivo, tensión, parestesias**: se hace **fasciotomía** profiláctica o inmediata. Los compartimentos y los nervios de cada uno están en el atlas de la **UP8**.')
    oral(u, 'La isquemia aguda por **embolia** (origen cardíaco, sobre todo la fibrilación auricular) se impacta en las **bifurcaciones**: **aórtica**, **femoral común** (la más frecuente), **poplítea** y **braquial**. Se manifiesta con las **seis P**: dolor, palidez, ausencia de pulso, parestesias, parálisis y frialdad. Se inicia **heparina** y se hace **embolectomía con Fogarty** por arteriotomía de la femoral. La **reperfusión** puede producir **hiperpotasemia, mioglobinuria y síndrome compartimental**, que se resuelve con **fasciotomía**.', 'Así lo decís en el oral: isquemia aguda')


def aorta(u):
    u.h2('Aorta: aneurisma de la aorta abdominal, disección y aneurismas toracoabdominales', intro='La aorta es un tubo con relaciones muy precisas. Las que importan en cirugía son las **ramas** que se pueden perder (renales, mesentérica inferior, espinales) y las **estructuras vecinas** que se lesionan (uréter, duodeno, vena renal izquierda).')
    N(u, 'S-341', 'Arterias y venas de la pared posterior del abdomen.', ['Aorta abdominal, **arterias renales** (L1-L2), **mesentérica inferior** (L3) y bifurcación en **L4**.', 'La **cava inferior** queda a la derecha de la aorta; la **vena renal izquierda** cruza por delante de la aorta.'], 205)
    N(u, 'S-342', 'Vasos de la pared posterior del abdomen (continuación).', ['Ilíacas comunes, externas e internas.', 'El **uréter** cruza por delante de la bifurcación ilíaca (se lesiona en la cirugía del aneurisma).'], 205)
    N(u, 'S-339', 'Aorta torácica y arterias intercostales posteriores.', ['De la aorta torácica salen las **intercostales** y las arterias que irrigan la **médula** (arteria de **Adamkiewicz**, T9-L2).'], 205)
    S(u, 's22_p2_0', 'Aorta torácica: raíz, ascendente, cayado y descendente, con los troncos supraaórticos.', 'cap. 22 (Aneurismas de la aorta torácica y disección aórtica)', ['Del cayado salen el **tronco braquiocefálico**, la **carótida común izquierda** y la **subclavia izquierda**.', 'El **istmo** (junto al ligamento arterioso) es la zona donde se rompe en el trauma.'], 120)
    u.h3('Aneurisma de la aorta abdominal (AAA)')
    u.ul(['Más del **90 %** son **infrarrenales**; **dilatación mayor a 3 cm** (o 1,5 veces el diámetro normal). **Factores de riesgo**: sexo masculino, edad mayor de 65, **tabaquismo**, hipertensión, antecedente familiar.',
          'Casi siempre **asintomático**: se descubre por **ecografía** o como masa pulsátil. **Tamizaje**: ecografía única en **varones de 65 a 75 años fumadores**.',
          '**Indicación de cirugía**: **diámetro de 5,5 cm o más** en el varón (5 cm en la mujer), crecimiento **mayor de 1 cm por año**, o síntomas.',
          '**Ruptura**: **tríada** de **dolor abdominal o lumbar, hipotensión y masa pulsátil**; mortalidad muy alta. El hematoma se **contiene en el retroperitoneo**.',
          '**Tratamiento**: **reparación abierta** (laparotomía o retroperitoneal, injerto en tubo o bifurcado) o **EVAR** (endoprótesis por vía femoral) si la anatomía lo permite (cuello infrarrenal de longitud y ángulo adecuados).'])
    S(u, 's23_p27_0', 'Reparación abierta de un aneurisma de la aorta abdominal con injerto en tubo.', 'cap. 23 (Enfermedades arteriales)', ['Se **clampea** la aorta por encima del aneurisma (por debajo de las renales) y por debajo (ilíacas), se abre el saco y se sutura el injerto.', 'Las **lumbares** y la **mesentérica inferior** sangran desde adentro del saco: se ligan o se reimplantan.'], 100)
    S(u, 's23_p30_0', 'Reparación endovascular (EVAR): la endoprótesis se introduce por las arterias femorales y se despliega dentro del saco.', 'cap. 23 (Enfermedades arteriales)', ['La prótesis sella por **encima** y por **debajo** del aneurisma y excluye el saco de la circulación.'], 100)
    S(u, 's23_p32_0', 'Endoprótesis aórtica dentro del saco aneurismático: comparación de la fijación y de la exclusión del saco.', 'cap. 23 (Enfermedades arteriales)', ['Observá qué pasa si queda flujo **por fuera de la prótesis** (**endofuga**): el saco sigue presurizado.'], 90)
    u.box('alerta', 'Complicaciones que se explican por la anatomía', '**Isquemia del colon sigmoides** (se liga la **arteria mesentérica inferior** y la colateral de la mesentérica superior no alcanza); **lesión ureteral** o de la **vena renal izquierda retroaórtica**; **lesión de la tercera porción del duodeno** (cruza entre la aorta y la mesentérica superior; **fístula aortoentérica**); **isquemia medular** (arteria de Adamkiewicz) en el segmento torácico.')
    u.h3('Disección aórtica y síndrome aórtico agudo')
    S(u, 's22_p23_0', 'Síndrome aórtico agudo: aorta normal, disección, hematoma intramural y úlcera aórtica penetrante.', 'cap. 22 (Aneurismas de la aorta torácica y disección aórtica)', ['En la **disección** la sangre entra por un desgarro de la íntima y crea una **luz falsa** dentro de la media.', 'El **hematoma intramural** no tiene desgarro visible; la **úlcera penetrante** atraviesa la íntima.'], 100)
    S(u, 's22_p25_0', 'Clasificaciones de DeBakey y de Stanford de la disección aórtica.', 'cap. 22 (Aneurismas de la aorta torácica y disección aórtica)', ['**Stanford A** (compromete la **aorta ascendente**): **cirugía urgente**.', '**Stanford B** (descendente, distal a la subclavia izquierda): **tratamiento médico**, endoprótesis (TEVAR) si hay complicaciones.'], 100)
    u.tabla(['Tipo', 'Segmento', 'Conducta'], [
        ['**Stanford A** (DeBakey I y II)', 'Aorta ascendente (con o sin arco)', '**Cirugía urgente**: riesgo de taponamiento, insuficiencia aórtica y oclusión coronaria'],
        ['**Stanford B** (DeBakey III)', 'Distal a la subclavia izquierda', '**Control de la presión y de la frecuencia cardíaca** (betabloqueante, luego vasodilatador); cirugía o TEVAR si hay isquemia, ruptura o dolor persistente'],
    ], fuente='Schwartz, 10.ª ed., cap. 22; Giménez, Cirugía, 2.ª ed., cap. 18.')
    u.ul(['Clínica: **dolor torácico “desgarrante”** de inicio máximo, que **migra** hacia la espalda; **diferencia de presión entre los brazos**, soplo de insuficiencia aórtica, déficit neurológico o de pulsos.',
          '**Estudio**: **angio-TC** de aorta. El **primer paso es bajar la frecuencia y la presión** para disminuir la fuerza de la sangre sobre la pared.'])
    S(u, 's22_p17_0', 'Clasificación de Crawford de los aneurismas toracoabdominales (I a IV) según los segmentos de la aorta comprometidos.', 'cap. 22 (Aneurismas de la aorta torácica y disección aórtica)', ['Cuanto **mayor es el segmento** reparado, mayor el riesgo de **isquemia medular** (paraplejía), renal y visceral.'], 90)
    u.box('clave', 'Aneurisma poplíteo: el otro aneurisma de la unidad', 'Es el más frecuente de los periféricos y **bilateral en la mitad de los casos**; se asocia a **aneurisma aórtico**. Se descubre por un **pulso poplíteo amplio** y su complicación es **embolia distal o trombosis** (pie isquémico), no la ruptura. Se opera cuando mide **más de 2 cm** o produce síntomas.')
    oral(u, 'El **aneurisma de la aorta abdominal** es casi siempre **infrarrenal** y se define por un diámetro mayor de **3 cm**. Se opera con **5,5 cm o más** en el varón (5 cm en la mujer) o si crece más de **1 cm por año**. La **ruptura** da la tríada de **dolor, hipotensión y masa pulsátil**. Se repara con cirugía **abierta** (clampeo infrarrenal y prótesis) o **EVAR**; la **isquemia del colon** por ligadura de la mesentérica inferior y la **lesión ureteral** son complicaciones anatómicas. En la **disección aórtica** el desgarro de la íntima crea una luz falsa; la **Stanford A** (aorta ascendente) se opera de urgencia y la **B** se trata con control de la presión.', 'Así lo decís en el oral: aorta')


def carotida(u):
    u.h2('Carótida y troncos supraaórticos: bifurcación, endarterectomía y robo de la subclavia', intro='La enfermedad carotídea es la causa quirúrgica de **ACV isquémico** más frecuente. La cirugía (endarterectomía) es una **disección anatómica** del cuello donde cada nervio vecino es una pregunta de oral.')
    N(u, 'S-323', 'Arterias de la cabeza y el cuello.', ['**Carótida común** (derecha del tronco braquiocefálico, izquierda del arco aórtico), bifurcación en **carótida externa** (con ramas) e **interna** (sin ramas en el cuello).'], 205)
    N(u, 'S-324', 'Arterias carótidas.', ['Bifurcación a nivel del **borde superior del cartílago tiroides (C4)**; el **seno carotídeo** (barorreceptor) está en el origen de la carótida interna.'], 205)
    S(u, 's23_p13_0', 'Bifurcación carotídea: la placa de ateroma se localiza en el bulbo y el origen de la carótida interna.', 'cap. 23 (Enfermedades arteriales)', ['La placa se forma en la **cara posterior del bulbo**, donde el flujo es turbulento.', 'El corte transversal muestra la **luz estrechada**.'], 95)
    u.tabla(['Estructura', 'Relación con la bifurcación', 'Lesión en la endarterectomía'], [
        ['**Nervio hipogloso (XII)**', 'Cruza **sobre** la carótida externa e interna, cerca de la bifurcación alta', 'Desviación de la lengua hacia el lado lesionado, disartria'],
        ['**Nervio vago (X)**', 'Entre la carótida y la yugular, en la vaina; da el **laríngeo recurrente** y el **laríngeo superior**', 'Disfonía por parálisis de la cuerda vocal'],
        ['**Rama marginal mandibular del facial (VII)**', 'Cruza el ángulo de la mandíbula', 'Desvío de la comisura labial (retractor mal ubicado)'],
        ['**Nervio glosofaríngeo (IX)** y **rama del seno carotídeo**', 'Bajo la bifurcación alta', 'Disfagia; **bradicardia e hipotensión** al manipular el seno carotídeo'],
        ['**Nervio auricular mayor y transverso del cuello**', 'Cutáneos, sobre el ECM', 'Hipoestesia del lóbulo de la oreja'],
    ], fuente='Netter, láminas S-65, S-68, S-70 y S-323; Giménez, Cirugía, 2.ª ed., cap. 19.')
    S(u, 's23_p17_0', 'Endarterectomía carotídea: incisión a lo largo del borde anterior del esternocleidomastoideo.', 'cap. 23 (Enfermedades arteriales)', ['La incisión sigue el **borde anterior del ECM**; se llega a la **vaina carotídea**, se identifican **hipogloso y vago** y se clampean la carótida común, la interna y la externa.'], 95)
    S(u, 's23_p18_0', 'Arteriotomía y extracción de la placa (A) y cierre con parche (B).', 'cap. 23 (Enfermedades arteriales)', ['Se abre la carótida interna, se **extrae la placa** (“endarterectomía”) y se **cierra con parche** para evitar la estenosis residual.'], 100)
    u.ul(['**Indicación**: estenosis de la carótida interna **sintomática** (ACV o accidente isquémico transitorio en los últimos 6 meses) de **70-99 %** (también 50-69 % en varones seleccionados); en **asintomáticos**, de **60-99 %** y expectativa de vida mayor de 5 años. Se realiza **antes de las 2 semanas** del evento.',
          '**Alternativa**: **angioplastia con stent** carotídeo (en alto riesgo quirúrgico o anatomía hostil).',
          '**Complicaciones**: ACV perioperatorio, **hematoma cervical** (vía aérea), lesión de pares craneales (XII, X, VII), **síndrome de hiperperfusión** y reestenosis.'])
    u.box('alerta', 'Robo de la subclavia', 'La **estenosis proximal de la subclavia** (casi siempre izquierda) hace que la **vertebral** invierta el flujo y “robe” sangre del cerebro hacia el brazo con el **ejercicio**: **mareos, ataxia o síncope** al usar el brazo y **diferencia de presión** entre los brazos (más de 15-20 mmHg). Se corrige con **angioplastia con stent** o bypass carótido-subclavio.')
    oral(u, 'La carótida común se bifurca a nivel del **borde superior del cartílago tiroides (C4)**: la **externa** tiene ramas en el cuello y la **interna** no. La **endarterectomía** se hace por una incisión sobre el **borde anterior del esternocleidomastoideo** y se identifican el **hipogloso** (que cruza sobre la bifurcación) y el **vago**; se indica en la estenosis sintomática de **70 a 99 %**. Entre las complicaciones están el **ACV**, el **hematoma cervical**, la lesión de **pares craneales** y la **bradicardia** por manipulación del **seno carotídeo**.', 'Así lo decís en el oral: carótida')


def mesenterica(u):
    u.h2('Arterias viscerales: isquemia mesentérica y colitis isquémica', intro='La isquemia mesentérica se entiende con tres arterias, sus colaterales y dos **puntos débiles** del colon. Es una causa de abdomen agudo con una pista clásica: **dolor desproporcionado** al examen.')
    N(u, 'S-435', 'Arterias del estómago, el hígado, el páncreas, el duodeno y el bazo (tronco celíaco).', ['**Tronco celíaco** → gástrica izquierda, hepática común y esplénica.', 'Se conecta con la **mesentérica superior** por las **arcadas pancreaticoduodenales**.'], 205)
    N(u, 'S-439', 'Arterias del intestino delgado (mesentérica superior).', ['Las **ramas yeyunales e ileales** y la **arteria cólica media**, ileocólica y cólica derecha.', 'La **mesentérica superior** nace a **L1**, detrás del páncreas.'], 205)
    N(u, 'S-440', 'Arterias del intestino grueso (mesentérica superior e inferior).', ['**Arcada marginal (de Drummond)** a lo largo del colon.', '**Arcada de Riolan**: une la cólica media con la cólica izquierda (colateral entre las dos mesentéricas).'], 205)
    N(u, 'S-441', 'Arterias del recto y el conducto anal.', ['**Rectal superior** (de la mesentérica inferior), **media** (iliaca interna) e **inferior** (pudenda interna): **doble irrigación del recto**.'], 205)
    S(u, 's23_p36_1', 'Angio-RM sagital de la aorta: tronco celíaco, arteria mesentérica superior (SMA) y mesentérica inferior (IMA).', 'cap. 23 (Enfermedades arteriales)', ['La **SMA** nace **por delante de la aorta** y desciende con un ángulo agudo: favorece el **émbolo**.', 'La **IMA** es de menor calibre.'], 100)
    u.tabla(['', 'Qué pasa', 'Clínica y estudio'], [
        ['**Isquemia mesentérica aguda embólica**', 'Émbolo de origen cardíaco que se impacta **distal al origen** de la AMS (**respeta el yeyuno proximal**, irrigado por ramas altas)', '**Dolor desproporcionado** al examen (abdomen blando), vómitos, diarrea; **lactato elevado**; **angio-TC**; **laparotomía** con embolectomía y resección del intestino necrótico'],
        ['**Trombótica**', 'Sobre una placa en el **origen** de la AMS', 'Isquemia extensa, antecedentes de **angina intestinal**'],
        ['**No oclusiva**', 'Vasoespasmo en shock, vasopresores, insuficiencia cardíaca', 'Enfermo crítico; tratamiento: corregir la causa, vasodilatadores'],
        ['**Isquemia mesentérica crónica**', 'Estenosis de dos o más vasos', '**Dolor posprandial**, **miedo a comer** y pérdida de peso: **angina intestinal**'],
        ['**Colitis isquémica**', 'Hipoperfusión de la mesentérica inferior', 'Dolor en fosa ilíaca izquierda y diarrea sanguinolenta; **ángulo esplénico** y rectosigmoides'],
    ], fuente='Michans, Cirugía, 5.ª ed., cap. 49 (Arterias); Schwartz, 10.ª ed., cap. 23; Netter, láminas S-435 a S-441.')
    u.box('clave', 'Puntos débiles del colon', '**Punto de Griffiths** (ángulo esplénico, unión de la mesentérica superior con la inferior) y **punto de Sudeck** (unión rectosigmoidea, entre las sigmoideas y la hemorroidal superior): son las zonas de la **colitis isquémica**. Desarrollados en el atlas de la **UP4**.')
    oral(u, 'La **arteria mesentérica superior** nace a **L1** y la embolia se impacta **distal al origen**, respetando el yeyuno proximal. La clínica es **dolor abdominal desproporcionado** al examen, con **lactato elevado**; el estudio es la **angio-TC** y el tratamiento, **laparotomía** con embolectomía y resección del intestino no viable. La **colitis isquémica** compromete los puntos débiles de **Griffiths** (ángulo esplénico) y **Sudeck** (rectosigmoides). La **angina intestinal** produce dolor posprandial, miedo a comer y adelgazamiento.', 'Así lo decís en el oral: arterias viscerales')
