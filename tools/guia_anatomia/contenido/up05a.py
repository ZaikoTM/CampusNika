# -*- coding: utf-8 -*-
"""UP 5 · Anatomía quirúrgica del hígado, las vías biliares y el páncreas. Parte A: hígado, patología hepática, hipertensión portal y paracentesis."""
from .up01e import N, G, L, oral

GAL = 'Galindo, __Enciclopedia de Cirugía Digestiva__ (SACD, 2020), {c}.'
SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def higado(u):
    u.h2('Hígado: anatomía quirúrgica, segmentación, pedículo y traumatismos', intro='La cirugía hepática (hepatectomías, trauma, trasplante) se hace sobre la segmentación de Couinaud y el pedículo portal. Es el apartado que más se pregunta de la unidad.')
    u.h3('Forma, fijaciones y relaciones')
    u.ul(['El hígado pesa **~1,5 kg** (2 % del peso corporal) y recibe **~25 % del gasto cardíaco**. Ocupa el hipocondrio derecho y el epigastrio, bajo el diafragma, y se relaciona con el estómago, el duodeno, el ángulo hepático del colon, el **riñón y la suprarrenal derechos**, la **vesícula biliar** y la vena cava inferior.',
          '**Ligamentos**: **falciforme** (lleva en su borde libre el **ligamento redondo**, resto de la vena umbilical), **coronario** y **triangulares** (derecho e izquierdo), **gastrohepático** y **hepatoduodenal**. Entre las hojas del coronario queda el **área desnuda**, sin peritoneo, en contacto directo con el diafragma: por ahí un absceso o un quiste se abre a la pleura o al pericardio.',
          '**Pedículo hepático (ligamento hepatoduodenal)** contiene la **tríada portal**: el **colédoco** (a la derecha y adelante), la **arteria hepática propia** (a la izquierda y adelante) y la **vena porta** (detrás de ambos). Por detrás está el **foramen epiploico (de Winslow)**: al comprimir el pedículo con una pinza se hace la **maniobra de Pringle**, que controla el sangrado del hígado de entrada.',
          '**Venas suprahepáticas**: **derecha, media e izquierda** (esta suele unirse a la media); drenan directo en la **cava retrohepática**, en el diafragma. El **lóbulo caudado (segmento I)** drena por venas propias cortas a la cava, y por eso se **hipertrofia en el síndrome de Budd-Chiari**.'])
    u.h3('Segmentación de Couinaud')
    u.tabla(['Plano o cisura', 'Qué contiene', 'Qué separa'], [
        ['**Cisura principal (de Cantlie)**', 'Vena suprahepática **media**; va del lecho vesicular a la cava', '**Hígado derecho** (segmentos V a VIII) del **izquierdo** (II a IV)'],
        ['**Cisura portal derecha**', 'Vena suprahepática **derecha**', 'Sector anterior derecho (V y VIII) del posterior (VI y VII)'],
        ['**Cisura umbilical (ligamento falciforme)**', 'Vena suprahepática **izquierda** y rama umbilical de la porta', 'Sector lateral izquierdo (II y III) del medial (IV)'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 400 (anatomía quirúrgica del hígado); Giménez, Cirugía, 2.ª ed., cap. 47; Netter, láminas S-430 y S-431; Gray, págs. 187-190.')
    u.tabla(['Segmento', 'Ubicación', 'Dato quirúrgico'], [
        ['**I**', 'Lóbulo caudado', 'Drena directo a la cava; se hipertrofia en Budd-Chiari'],
        ['**II y III**', 'Sector lateral izquierdo (superior e inferior)', '**Lobectomía lateral izquierda**'],
        ['**IV (a y b)**', 'Sector medial izquierdo (lóbulo cuadrado)', 'Se reseca con la hepatectomía izquierda'],
        ['**V y VIII**', 'Sector anterior derecho (inferior y superior)', 'V: contacto con la vesícula (lecho vesicular)'],
        ['**VI y VII**', 'Sector posterior derecho (inferior y superior)', 'VII: el más alto y de acceso difícil'],
    ])
    u.box('tip', 'Para recordar los segmentos', 'En sentido **horario** vistos de frente desde la cava (como un reloj), los segmentos se numeran **II, III, IV, V, VI, VII, VIII**, con el **I (caudado)** en el centro. **Cada segmento tiene su propia rama de la porta, de la arteria hepática y del conducto biliar** (pedículo en el centro) y **las suprahepáticas drenan por los límites**.')
    L(u, 'gal_higado_segmentos.png', 'Segmentación hepática (esquema coloreado) y su correlación.', GAL.format(c='cap. 400, fig. 2'), ['Cada color es un segmento; la cisura principal divide el hígado derecho del izquierdo.'], 70)
    L(u, 'gal_higado_segmentos_tc.png', 'Segmentos en la tomografía y en la cirugía.', GAL.format(c='cap. 400'), ['Las suprahepáticas marcan los límites de los segmentos en la TC y en el campo operatorio.'], 70)
    L(u, 'lib_schwartz_couinaud.png', 'Clasificación de Couinaud: vista anterior y posterior.', SCH.format(c='cap. 31 (hígado)'), ['Identificá los 8 segmentos y las tres venas suprahepáticas.'], 70)
    u.h3('Irrigación dual y drenaje')
    u.tabla(['Aporte', 'Flujo', 'Oxígeno', 'Dato clínico'], [
        ['**Vena porta**', '**~75 %** del flujo hepático', 'Sangre de las vísceras (menos oxígeno: ~50-55 % del aporte)', 'Trae nutrientes y también **bacterias y metástasis** del tubo digestivo'],
        ['**Arteria hepática**', '**~25 %** del flujo', 'Sangre oxigenada (~45-50 % del aporte)', 'Irriga la **vía biliar**: su lesión causa **estenosis y necrosis biliar**'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 400; Netter, lámina S-435.')
    u.ul(['**Variantes arteriales**: una **arteria hepática derecha** nacida de la **mesentérica superior** (10-15 %) o una **izquierda** de la **gástrica izquierda**; discurren por detrás de la porta o en el ligamento gastrohepático y pueden lesionarse en la cirugía.',
          '**Linfáticos**: drenan al hilio y a los ganglios celíacos; también hacia el diafragma. **Inervación**: plexo celíaco y vagos; el dolor hepático (cápsula de Glisson) es difuso, en el hipocondrio derecho, a veces con irradiación al hombro derecho (frénico).'])
    N(u, 'S-430', 'Hígado in situ: sistemas vascular y de conductos biliares.', ['Cara visceral con el hilio, la vesícula, la cava y los ligamentos.'], 195)
    N(u, 'S-431', 'Estructura del hígado: esquema.', ['Segmentos, pedículo portal y suprahepáticas.'], 190)
    G(u, 187, 'Hígado (Gray).', ['Caras diafragmática y visceral, lóbulos y ligamentos.'], 190)
    G(u, 189, 'Vasos del hígado (Gray).', ['Porta, arteria hepática y suprahepáticas.'], 190)
    G(u, 190, 'Segmentos del hígado (Gray).', ['Compará con Couinaud.'], 190)
    N(u, 'S-456', 'Inervación autónoma del hígado: esquema.', ['Plexo celíaco y vagos.'], 175)
    N(u, 'S-541', 'Corte transversal del abdomen a nivel de T10.', ['Hígado, estómago y bazo en un corte axial: así se ven en la TC.'], 190)
    u.h3('Fisiología, semiología y traumatismos')
    u.ul(['**Funciones**: síntesis (albúmina, factores de coagulación), metabolismo de glúcidos, lípidos y proteínas, detoxificación y **producción de bilis**. Tiene **gran capacidad de regeneración**: se puede resecar hasta ~70 % de un hígado sano, pero en un hígado cirrótico el remanente debe ser mayor.',
          '**Semiología**: hepatomegalia (borde inferior palpable), dolor a la puño-percusión, ascitis, estigmas de hepatopatía (arañas vasculares, eritema palmar, ginecomastia, circulación colateral), ictericia, **asterixis**.',
          '**Traumatismos hepáticos**: son los más frecuentes del trauma abdominal cerrado. Se gradúan (**AAST I a V**); en el **paciente estable** el manejo suele ser **no operatorio** (observación o angioembolización); el **inestable** va a laparotomía (**Pringle**, empaquetamiento o *packing*, control del sangrado). Las lesiones del hígado derecho y de los segmentos VII-VIII (cerca de las suprahepáticas) son las más graves.',
          '**Ruptura espontánea**: de un **adenoma** (anticonceptivos orales), un **hepatocarcinoma** o una masa en el embarazo (HELLP): hemoperitoneo y shock.',
          '**Hemobilia**: sangrado a la vía biliar tras un trauma, una biopsia o un procedimiento percutáneo. **Tríada de Quincke**: **dolor cólico biliar, ictericia y hemorragia digestiva**. Se trata con angiografía y embolización.'])
    oral(u, 'El hígado pesa 1,5 kg y se relaciona con el diafragma, el estómago, el duodeno, el riñón derecho y la vesícula. En el **ligamento hepatoduodenal** va la **tríada portal**: colédoco a la derecha, arteria hepática a la izquierda y porta por detrás; el **foramen de Winslow** queda por detrás, y ahí se hace la **maniobra de Pringle**. La **segmentación de Couinaud** tiene 8 segmentos: la **cisura principal** (vena suprahepática media) divide el hígado derecho (V-VIII) del izquierdo (II-IV); la **derecha** separa el sector anterior del posterior, y la **umbilical** el lateral izquierdo (II-III) del medial (IV); el **caudado (I)** drena directo a la cava. La **irrigación es dual**: **porta (75 % del flujo)** y **arteria hepática (25 %)**, que es la única que irriga la **vía biliar**. En el trauma hepático estable se hace manejo no operatorio; en el inestable, Pringle y *packing*.')


def patologia_hepatica(u):
    u.h2('Abscesos, quiste hidatídico, tumores y metástasis del hígado', intro='Cada patología hepática se explica por la vía por la que llega al hígado y por su relación con el diafragma, la vía biliar y la porta.')
    u.h3('Abscesos hepáticos')
    u.tabla(['', 'Absceso piógeno', 'Absceso amebiano'], [
        ['**Causa**', 'Bacterias (E. coli, Klebsiella, anaerobios, estreptococos)', '__Entamoeba histolytica__ (se adquiere por agua o alimentos contaminados)'],
        ['**Vía de llegada**', '**Biliar** (colangitis, la más frecuente hoy), **portal** (apendicitis o diverticulitis complicada: pileflebitis), **arterial** (sepsis), contigüidad, trauma', 'Colon → **vena porta**'],
        ['**Localización**', 'Lóbulo derecho, a veces múltiples', 'Lóbulo derecho, **solitario**'],
        ['**Líquido**', 'Pus', '**“Pasta de anchoa”** (marrón achocolatado), sin parásitos al cultivo'],
        ['**Tratamiento**', '**Antibióticos + drenaje** percutáneo (mayores de 3 cm) o quirúrgico; tratar la causa', '**Metronidazol** (drenaje solo si no responde o por riesgo de ruptura)'],
        ['**Complicación**', 'Sepsis, rotura', 'Rotura al **tórax** (derecho) o al **pericardio** (lóbulo izquierdo)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 49 (absceso hepático); Galindo, Enciclopedia de Cirugía Digestiva, cap. 404.')
    L(u, 'gal_absceso_causas.png', 'Absceso hepático: causas (piógeno, maligno e iatrogénico).', GAL.format(c='cap. 404'), ['Los círculos se superponen: la colangitis y la metástasis necrótica pueden formar abscesos.'], 70)
    L(u, 'gal_absceso_tc.png', 'Absceso hepático en la tomografía: colección con realce periférico.', GAL.format(c='cap. 404'), ['Masa hipodensa del lóbulo derecho con pared que capta contraste.'], 70)
    u.h3('Hidatidosis hepática')
    u.ul(['**Parásito**: __Echinococcus granulosus__. El **perro** (huésped definitivo) elimina huevos; el **ovino** y otros animales son huéspedes intermediarios; el **ser humano** se infecta por accidente (contacto con perros, verduras o agua contaminadas). **Endémica en zonas rurales de Argentina**.',
          '**Dónde se aloja**: **hígado (~70 %)** y pulmón (~20 %). El quiste tiene tres capas: **pericisto** (reacción del huésped, adventicia), **membrana laminar** (cutícula) y **membrana germinativa**, que produce **vesículas hijas** y **arena hidatídica**.',
          '**Diagnóstico**: ecografía (clasificación de **Gharbi**: de quiste univesicular a calcificado), TC, serología. **Tratamiento**: **albendazol** y cirugía (quistectomía, pericistectomía) o **PAIR** (punción, aspiración, inyección, reaspiración) en casos seleccionados. **No se punciona un quiste sin protección** por el riesgo de siembra y anafilaxia.'])
    u.tabla(['Complicación', 'Mecanismo anatómico', 'Clínica'], [
        ['**Ruptura a la vía biliar** (la más frecuente)', 'El quiste comunica con un conducto biliar', 'Ictericia, cólico, **colangitis hidatídica** (se expulsan membranas)'],
        ['**Ruptura a la cavidad peritoneal**', 'Ruptura de la cápsula', '**Anafilaxia** y siembra (**hidatidosis secundaria**)'],
        ['**Ruptura a la pleura o al bronquio** (quiste en la cúpula)', 'Cruza el diafragma por el área desnuda', 'Tos con vómica hidatídica, empiema'],
        ['**Supuración**', 'Infección del quiste', 'Fiebre, dolor, absceso'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 48 (quistes parasitarios y no parasitarios del hígado); Galindo, Enciclopedia de Cirugía Digestiva, cap. 422 (hidatidosis hepática).')
    L(u, 'gal_hidatidosis_ciclo.png', 'Ciclo del Echinococcus granulosus: perro, ovino y ser humano.', GAL.format(c='cap. 422'), ['El ser humano es un huésped accidental, sin salida del ciclo.'], 70)
    L(u, 'gal_hidatidosis_eco.png', 'Quiste hidatídico en la ecografía.', GAL.format(c='cap. 422'), ['Quiste anecoico con membrana y vesículas hijas.'], 65)
    L(u, 'gal_hidatidosis_tc.png', 'Quiste hidatídico en la tomografía.', GAL.format(c='cap. 422'), ['Lesión quística con tabiques y pared definida.'], 65)
    L(u, 'gal_hidatidosis_esquema.png', 'Quistes hidatídicos en el hígado y su relación con las estructuras vecinas.', GAL.format(c='cap. 422'), ['Un quiste subdiafragmático puede abrirse al tórax; uno central, a la vía biliar.'], 65)
    u.h3('Tumores y quistes benignos')
    u.tabla(['Lesión', 'Datos', 'Conducta'], [
        ['**Hemangioma** (el más frecuente)', 'Mujer adulta; RM: hiperintenso en T2 (“lamparita”) y **llenado centrípeto** de contraste', 'Asintomático: no se opera; solo si es gigante y sintomático. **No se biopsia**'],
        ['**Hiperplasia nodular focal**', '**Cicatriz central estrellada**; mujer joven; sin riesgo de malignizar', 'Observación'],
        ['**Adenoma hepatocelular**', '**Anticonceptivos orales**, esteroides anabólicos, glucogenosis', 'Riesgo de **rotura y hemorragia** y de malignización (más de 5 cm): se reseca'],
        ['**Quiste simple**', 'Congénito, uni o multiloculado', 'Solo se trata el sintomático'],
        ['**Poliquistosis hepática**', 'Asociada a la poliquistosis renal', 'Fenestración o trasplante en casos graves'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 50; Galindo, Enciclopedia de Cirugía Digestiva, caps. 407 y 409.')
    u.h3('Tumores malignos primarios y metástasis')
    u.ul(['**Carcinoma hepatocelular (CHC)**: se desarrolla sobre **cirrosis** (hepatitis B y C, alcohol, esteatohepatitis). Se sospecha por **ecografía de control** y **alfafetoproteína**; la TC o RM bifásicas lo diagnostican por **hipercaptación en fase arterial y lavado en la fase venosa** (sin biopsia). Puede invadir la **porta** (trombosis tumoral). Tratamiento según **BCLC**: resección, **ablación**, **quimioembolización** o **trasplante** (criterios de Milán).',
          '**Colangiocarcinoma intrahepático**: se origina en los conductos biliares intrahepáticos; resección si es posible.',
          '**Metástasis hepáticas**: el hígado recibe la sangre del tubo digestivo por la **porta**, por eso es el sitio de las metástasis **colorrectales**. Se **resecan** si es posible lograr márgenes libres con **remanente funcional suficiente** (al menos 2 segmentos contiguos con su pedículo y drenaje); también ablación y quimioterapia perioperatoria. El **tratamiento en dos tiempos** y la embolización portal permiten ampliar la resección.'])
    N(u, 'S-433', 'Páncreas in situ (referencia para los tumores de la cabeza y la relación con la porta).', ['Cabeza, cuello, cuerpo y cola del páncreas y su relación con el hígado y el duodeno.'], 175)
    oral(u, 'Los abscesos llegan al hígado por la **vía biliar** (colangitis), la **porta** (apendicitis o diverticulitis: pileflebitis), la **arteria** (sepsis) o por contigüidad. El **piógeno** se trata con antibiótico y drenaje; el **amebiano** (Entamoeba, “pasta de anchoa”) con metronidazol. La **hidatidosis** (Echinococcus granulosus) es endémica en zonas rurales de Argentina: el quiste tiene **pericisto, membrana laminar y membrana germinativa**; la complicación más frecuente es la **ruptura a la vía biliar** y la más grave la **ruptura al peritoneo** (anafilaxia). Los quistes del domo pueden abrirse al **tórax** por el **área desnuda**. El **hemangioma** es el tumor benigno más frecuente; el **adenoma** (anticonceptivos orales) puede romperse. El **CHC** se desarrolla en cirrosis y se diagnostica por imagen (**hipercaptación arterial y lavado**); las **metástasis colorrectales** llegan por la porta y se resecan si hay remanente suficiente.')


def portal(u):
    u.h2('Hipertensión portal, ascitis y paracentesis (trabajo práctico)', intro='La hipertensión portal une la anatomía del sistema porta con la clínica de las várices, la ascitis y la esplenomegalia. La paracentesis es el procedimiento práctico de la unidad.')
    u.h3('Sistema porta')
    u.ul(['La **vena porta** (~8 cm) se forma **por detrás del cuello del páncreas** (nivel **L1-L2**) por la unión de la **vena mesentérica superior** y la **esplénica**; la **mesentérica inferior** desemboca en la esplénica o en la confluencia. Asciende por el **ligamento hepatoduodenal**, por detrás del colédoco y de la arteria hepática, y se divide en **ramas derecha e izquierda** en el hilio.',
          '**Presión normal**: 5-10 mmHg. Hay **hipertensión portal** con un **gradiente** (porta-suprahepática) de **5 mmHg o más**; es **clínicamente significativa** desde **10 mmHg** (aparecen las várices) y con **12 mmHg o más** hay riesgo de sangrado.'])
    u.tabla(['Nivel', 'Causas', 'Ejemplos'], [
        ['**Prehepática**', 'Obstrucción de la porta o de la esplénica', 'Trombosis portal, trombosis esplénica (pancreatitis)'],
        ['**Intrahepática presinusoidal**', 'Fibrosis portal', '**Esquistosomiasis**, fibrosis hepática congénita'],
        ['**Intrahepática sinusoidal**', 'Distorsión de la arquitectura', '**Cirrosis** (la más frecuente)'],
        ['**Intrahepática postsinusoidal y posthepática**', 'Obstrucción del drenaje', '**Síndrome de Budd-Chiari**, enfermedad venooclusiva, insuficiencia cardíaca derecha'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 431 (hipertensión portal: fisiopatología y aspectos clínicos).')
    u.h3('Circulación colateral: las cuatro anastomosis portosistémicas')
    u.tabla(['Sitio', 'Porta → cava', 'Manifestación'], [
        ['**Esofagogástrica**', 'Gástrica izquierda (coronaria estomáquica) → venas esofágicas → **ácigos**', '**Várices esofágicas y gástricas** (hemorragia masiva)'],
        ['**Rectal**', 'Rectal superior (porta) → rectales media e inferior (cava)', 'Hemorroides, várices rectales'],
        ['**Paraumbilical**', 'Venas paraumbilicales (vena umbilical recanalizada) → epigástricas y torácicas', '**Cabeza de medusa**'],
        ['**Retroperitoneal**', 'Venas colónicas y esplénicas → vena renal, lumbares y diafragmáticas (Retzius y Sappey)', 'Poca expresión clínica'],
    ], fuente='Netter, lámina S-446; Gray, pág. 197.')
    L(u, 'gal_hipertension_portal_venas.png', 'Sistema venoso del hígado: suprahepáticas, porta y su relación con la vesícula.', GAL.format(c='cap. 431'), ['La porta se divide en ramas derecha e izquierda y las suprahepáticas drenan a la cava.'], 80)
    L(u, 'gal_portocava_esquema.png', 'Esquema del sistema porta y sus colaterales (circulación portocava).', GAL.format(c='cap. 431'), ['Las flechas marcan las anastomosis portosistémicas que se abren cuando sube la presión.'], 90)
    L(u, 'gal_lobulillo_hepatico.png', 'Lobulillo hepático: tríadas portales y venas centrales.', GAL.format(c='cap. 431'), ['La sangre fluye de la tríada portal a la vena central por los sinusoides: en la cirrosis se distorsiona.'], 60)
    u.h3('Consecuencias clínicas')
    u.ul(['**Várices esofagogástricas**: **hemorragia digestiva alta** masiva; tratamiento: reanimación, **vasoconstrictores** (terlipresina u octreotide), **antibiótico profiláctico**, **ligadura endoscópica**; prevención con **betabloqueantes no selectivos** y ligadura; rescate con **TIPS** (shunt intrahepático porto-sistémico transyugular) o derivaciones quirúrgicas (esplenorrenal distal).',
          '**Esplenomegalia e hiperesplenismo** (plaquetopenia), **ascitis** y **encefalopatía hepática** (los productos del intestino pasan a la circulación sistémica sin metabolizarse).'])
    u.h3('Ascitis y paracentesis')
    u.tabla(['Aspecto', 'Detalle'], [
        ['**Qué es**', 'Acumulación de líquido en la cavidad peritoneal; en la hipertensión portal se debe a la **presión sinusoidal elevada**, la hipoalbuminemia y la vasodilatación esplácnica'],
        ['**Indicaciones diagnósticas**', 'Ascitis nueva, ingreso hospitalario de un cirrótico con ascitis, fiebre, dolor o deterioro (sospecha de **peritonitis bacteriana espontánea**)'],
        ['**Indicaciones terapéuticas**', 'Ascitis **a tensión** o refractaria (se extraen volúmenes grandes con reposición de albúmina)'],
        ['**Sitio**', '**Fosa ilíaca izquierda**, a ~**2-3 cm medial y cefálico a la espina ilíaca anterosuperior** (**punto de Monro**), o **línea media infraumbilical** (sobre la línea alba, 2-3 cm bajo el ombligo, vejiga vacía). **Se evita** el borde lateral del recto por los **vasos epigástricos inferiores**, las cicatrices y las venas de la pared'],
        ['**Técnica**', 'Asepsia, anestesia local por planos, aguja con jeringa mientras se aspira, **trayecto en “Z”** (se desplaza la piel antes de avanzar, para que el orificio no quede alineado y no pierda líquido)'],
        ['**Estudios del líquido**', 'Recuento celular (**PMN ≥ 250/mm³** = peritonitis bacteriana espontánea), **albúmina** (con la albúmina sérica: **SAAG ≥ 1,1 g/dL** = hipertensión portal), proteínas, **cultivo** en frascos de hemocultivo; citología, amilasa y triglicéridos según el caso'],
        ['**Cuidados**', 'Si se extraen **más de 5 litros**, reponer **albúmina** (6-8 g por litro extraído); control de signos vitales; curación del sitio; evitar si hay infección local o coagulopatía grave'],
        ['**Complicaciones**', 'Hematoma de la pared, perforación intestinal, fuga persistente, hipotensión'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 431; anatomía de referencia (pared abdominal: Netter, láminas S-211 a S-214 y S-336).')
    N(u, 'S-442', 'Venas del estómago, duodeno, páncreas y bazo.', ['Confluencia esplenomesentérica y formación de la porta.'], 190)
    N(u, 'S-446', 'Tributarias de la vena porta hepática y anastomosis portocava.', ['Los cuatro sitios de anastomosis.'], 190)
    G(u, 195, 'Drenaje venoso de las vísceras (Gray).', ['Porta y sus afluentes.'], 190)
    G(u, 197, 'Anastomosis portosistémicas (Gray).', ['Relaciones entre el sistema porta y el cava.'], 190)
    oral(u, 'La **porta** se forma por detrás del **cuello del páncreas** (L1-L2) por la unión de la mesentérica superior y la esplénica; sube por el ligamento hepatoduodenal por detrás del colédoco y de la arteria hepática. La **hipertensión portal** (gradiente ≥ 10 mmHg para ser clínica) puede ser **prehepática, intrahepática** (presinusoidal: esquistosomiasis; **sinusoidal: cirrosis**; postsinusoidal: Budd-Chiari) o **posthepática**. Se abren **cuatro anastomosis portosistémicas**: **esofagogástrica** (gástrica izquierda → ácigos: várices), **rectal** (hemorroides), **paraumbilical** (cabeza de medusa) y **retroperitoneal**. La **hemorragia por várices** se trata con vasoconstrictores, antibiótico y ligadura endoscópica. La **paracentesis** se hace en la fosa ilíaca izquierda (punto de Monro) o en la línea media infraumbilical, con trayecto en Z, evitando los vasos epigástricos; se pide recuento celular (**PMN ≥ 250**) y **SAAG**, y se repone **albúmina** si se extraen más de 5 litros.')
