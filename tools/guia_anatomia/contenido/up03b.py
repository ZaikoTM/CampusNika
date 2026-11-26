# -*- coding: utf-8 -*-
"""UP 3 · Anatomía quirúrgica de la disfagia, el esófago y el estómago. Parte B: estómago, duodeno y hemorragia digestiva alta, estómago operado, cáncer, estudios, oral y referencias."""
from .up01e import N, G, L, oral
from .up03a import GAL, SCH


def estomago(u):
    u.h2('Estómago: partes, relaciones, irrigación, linfáticos y nervios', intro='La cirugía gástrica (úlcera, cáncer, estómago operado) se planifica sobre la irrigación, el drenaje linfático y la inervación vagal.')
    u.h3('Partes, relaciones y fijaciones')
    u.ul(['**Partes**: cardias, **fondo (fundus)**, cuerpo, **antro** y **píloro**; curvatura **menor** (con la **incisura angular**) y **mayor**. Sus glándulas cambian: en el **fondo y cuerpo** hay células **parietales** (ácido clorhídrico y factor intrínseco) y **principales** (pepsinógeno); en el **antro**, células **G** (gastrina) y **D** (somatostatina).',
          '**Relaciones (lecho gástrico)**: por delante, el **lóbulo izquierdo del hígado**, el diafragma y la pared abdominal; por detrás, la **bolsa omental** y, a través de ella, el **páncreas**, el bazo, el riñón y la suprarrenal izquierdos y el mesocolon transverso. Una úlcera de la cara posterior puede **penetrar al páncreas**.',
          '**Peritoneo y fijaciones**: ligamento **gastrohepático** (epiplón menor), **gastrocólico** y gastroesplénico (epiplón mayor), gastrofrénico y frenoesofágico. Son los que evitan el vólvulo.'])
    u.h3('Irrigación: dos arcadas arteriales y las gástricas cortas')
    u.tabla(['Arteria', 'Origen', 'Territorio'], [
        ['**Gástrica izquierda**', 'Tronco celíaco', '**Curvatura menor** (parte alta) y esófago abdominal'],
        ['**Gástrica derecha**', 'Hepática propia', 'Curvatura menor (parte baja)'],
        ['**Gastroepiploica derecha**', 'Gastroduodenal (de la hepática común)', '**Curvatura mayor** (parte baja) y epiplón mayor'],
        ['**Gastroepiploica izquierda**', 'Esplénica', 'Curvatura mayor (parte alta)'],
        ['**Gástricas cortas**', 'Esplénica', '**Fondo gástrico**'],
        ['**Gástrica posterior**', 'Esplénica', 'Cara posterior del fondo'],
    ], fuente='Netter, lámina S-435; Gray, págs. 173 y 175; Galindo, Enciclopedia de Cirugía Digestiva, cap. 200 (anatomía quirúrgica del estómago y duodeno).')
    u.ul(['Es un órgano **muy irrigado** por la red anastomótica de las dos arcadas (menor y mayor): permite ligar arterias en cirugía sin isquemia. Esa riqueza explica la **gravedad de la hemorragia** de las úlceras.',
          '**Venas**: acompañan a las arterias; la **gástrica izquierda (coronaria estomáquica)** y la derecha desembocan en la **porta**; las gastroepiploicas y las cortas, en la **esplénica** y la **mesentérica superior**.'])
    L(u, 'gal_estomago_arterias.png', 'Arterias del estómago: arcadas de las curvaturas menor y mayor.', GAL.format(c='cap. 200 (irrigación)'), ['Gástrica izquierda y derecha en la curvatura menor; gastroepiploicas derecha e izquierda en la mayor.'], 85)
    L(u, 'gal_estomago_venas.png', 'Venas del estómago: drenaje a la porta y a la esplénica.', GAL.format(c='cap. 200 (venas)'), ['Vena gástrica izquierda (coronaria estomáquica): su dilatación produce várices esofágicas y gástricas.'], 85)
    u.h3('Linfáticos: estaciones ganglionares y su importancia en el cáncer gástrico')
    u.ul(['El estómago drena en **cuatro territorios** que acaban en los **ganglios celíacos**: curvatura menor (ganglios de la gástrica izquierda y paracardiales), píloro y antro (subpilóricos y gastroepiploicos derechos), curvatura mayor alta y fondo (esplénicos), y curvatura mayor baja (gastroepiploicos).',
          '**Clasificación japonesa de estaciones**: **N1** (estaciones 1 a 6: paracardiales derechos e izquierdos, curvatura menor y mayor, suprapilóricos e infrapilóricos) y **N2** (7 a 11: arteria gástrica izquierda, hepática común, tronco celíaco, hilio esplénico y arteria esplénica).',
          '**Linfadenectomía D1** = estaciones N1; **D2** = N1 + N2 (**es la que se recomienda con la gastrectomía oncológica**). Es una de las razones por las que el cirujano necesita conocer la irrigación.'])
    L(u, 'gal_estomago_linfaticos.png', 'Territorios linfáticos del estómago y grupos ganglionares.', GAL.format(c='cap. 200, fig. 23'), ['Cada color es un territorio de drenaje; los puntos negros son los grupos ganglionares.'], 85)
    u.h3('Inervación: nervios vagos')
    u.ul(['**Vago anterior (izquierdo)** y **vago posterior (derecho)** pasan por el hiato, a ambos lados del esófago, y dan **ramas gástricas**, **hepática** (el anterior) y **celíaca** (el posterior).',
          'Sobre la curvatura menor, a lo largo de las arterias, corren el **nervio principal anterior** y el **posterior (nervios de Latarjet)**, que terminan en la **“pata de ganso”** del antro, que regula el vaciamiento del píloro.',
          '**Función**: el vago estimula la **secreción ácida** (células parietales) y la **motilidad**. Por eso la **vagotomía** reduce la secreción ácida (úlcera) pero altera el vaciamiento.',
          '**Simpático**: nervio esplácnico mayor y plexo celíaco; transmite el **dolor** (epigástrico, T5-T9).'])
    N(u, 'S-415', 'Estómago in situ.', ['Partes del estómago y relaciones con el hígado, el bazo, el colon y el epiplón.'], 190)
    N(u, 'S-416', 'Bolsa omental: estómago reclinado.', ['Lecho gástrico: cara posterior del estómago, páncreas y bazo.'], 190)
    N(u, 'S-435', 'Arterias del estómago, el hígado y el bazo.', ['Tronco celíaco con la gástrica izquierda, la hepática común y la esplénica.'], 190)
    N(u, 'S-448', 'Inervación autónoma del estómago y el duodeno.', ['Vagos anterior y posterior con los nervios de Latarjet y la “pata de ganso” antral.'], 190)
    N(u, 'S-449', 'Inervación autónoma del estómago y el duodeno (continuación).', ['Ramas hepática y celíaca de los vagos.'], 190)
    N(u, 'S-450', 'Inervación autónoma del esófago, estómago y duodeno: esquema.', ['Parasimpático (vago) y simpático con sus efectos.'], 190)
    G(u, 173, 'Estómago (Gray).', ['Partes, ligamentos y relaciones.'], 190)
    G(u, 175, 'Arterias del estómago y el bazo (Gray).', ['Arcadas de las curvaturas.'], 190)
    oral(u, 'El estómago tiene **fondo, cuerpo, antro y píloro**; el fondo y el cuerpo tienen células **parietales y principales**, el antro células **G** que producen gastrina. Su cara posterior se apoya en el **páncreas** a través de la bolsa omental. Se irriga por dos **arcadas**: la de la **curvatura menor** (gástrica izquierda, del tronco celíaco, y gástrica derecha, de la hepática propia) y la de la **mayor** (gastroepiploica derecha, de la gastroduodenal, e izquierda, de la esplénica), más las **gástricas cortas** para el fondo. Las **venas** drenan a la porta. Los **linfáticos** llegan a los ganglios celíacos y se clasifican en estaciones **N1 (1-6)** y **N2 (7-11)**: la **linfadenectomía D2** es la recomendada con la gastrectomía por cáncer. La inervación es **vagal**: el vago anterior y el posterior dan las ramas de Latarjet y la pata de ganso antral; la **vagotomía** disminuye el ácido pero altera el vaciamiento.')


def duodeno_hda(u):
    u.h2('Duodeno proximal, úlcera péptica y hemorragia digestiva alta', intro='La úlcera péptica y la hemorragia digestiva alta se explican por las relaciones del bulbo duodenal y por las arterias que pasan por detrás.')
    u.h3('El bulbo duodenal y sus relaciones')
    u.ul(['El **duodeno** tiene cuatro porciones; la **primera (bulbo)** es intraperitoneal, de unos 5 cm, y la zona donde se asienta la mayoría de las úlceras duodenales.',
          '**Cara posterior del bulbo**: **arteria gastroduodenal**, **colédoco**, **vena porta** y **cabeza del páncreas**. Una **úlcera posterior** erosiona la gastroduodenal y produce **hemorragia masiva**.',
          '**Cara anterior del bulbo**: hígado y vesícula. Una **úlcera anterior** perfora a la cavidad peritoneal: **neumoperitoneo y peritonitis**. Por eso la perforación es típica de la cara anterior y la hemorragia de la posterior.',
          '**Segunda porción**: recibe el **colédoco y el conducto pancreático** en la **papila de Vater**; la mucosa en esa zona se vincula con la ictericia y la pancreatitis.'])
    u.tabla(['Úlcera', 'Sitio', 'Complicación característica', 'Razón anatómica'], [
        ['**Duodenal anterior**', 'Cara anterior del bulbo', '**Perforación**', 'Contacto con el peritoneo libre; neumoperitoneo'],
        ['**Duodenal posterior**', 'Cara posterior del bulbo', '**Hemorragia** (arteria gastroduodenal); penetración al páncreas', 'La arteria pasa por detrás del bulbo'],
        ['**Gástrica de la curvatura menor**', 'Incisura angular', 'Hemorragia (gástrica izquierda o derecha); riesgo de cáncer: **biopsiar siempre**', 'Arcada de la curvatura menor'],
        ['**Lesión de Dieulafoy**', 'Fondo y curvatura menor', 'Hemorragia súbita, masiva, sin úlcera evidente', 'Arteria submucosa de calibre grande que erosiona la mucosa'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 43 (complicaciones de la úlcera péptica); Galindo, Enciclopedia de Cirugía Digestiva, caps. 200 y 209.')
    N(u, 'S-420', 'Duodeno in situ.', ['Bulbo, porción descendente con la papila, páncreas y relaciones.'], 190)
    N(u, 'S-436', 'Arterias del hígado, páncreas, duodeno y bazo.', ['La arteria gastroduodenal pasa por detrás del bulbo y se divide en pancreaticoduodenal superior y gastroepiploica derecha.'], 190)
    N(u, 'S-438', 'Arterias del duodeno y de la cabeza del páncreas.', ['Arcadas pancreaticoduodenales: unen el tronco celíaco con la mesentérica superior.'], 190)
    u.h3('Hemorragia digestiva alta (HDA): la anatomía del origen')
    u.p('Se llama **alta** a la que se origina **por encima del ángulo de Treitz** (esófago, estómago y duodeno). Se manifiesta como **hematemesis**, **melena** (negra, fétida; requiere unos 50-100 mL) o, si es masiva, **hematoquecia** con inestabilidad hemodinámica.')
    u.tabla(['Causa', 'Origen anatómico', 'Clave'], [
        ['**Úlcera péptica gástrica o duodenal** (la más frecuente)', 'Bulbo duodenal y curvatura menor', '**H. pylori** y antiinflamatorios; clasificación de **Forrest** del sangrado'],
        ['**Várices esofagogástricas**', 'Anastomosis portosistémica: **gástrica izquierda → venas esofágicas → ácigos**', 'Cirrosis con hipertensión portal; hemorragia masiva; ligadura endoscópica y betabloqueantes'],
        ['**Síndrome de Mallory-Weiss**', 'Desgarro de la **mucosa de la unión esofagogástrica** por vómitos', 'Hematemesis después de arcadas, en un alcohólico'],
        ['**Gastritis erosiva o por estrés**', 'Mucosa gástrica', 'Paciente crítico, AINE'],
        ['**Tumores** gástricos o esofágicos', 'Mucosa ulcerada', 'Anemia, pérdida de peso'],
        ['**Lesión de Dieulafoy** y **angiodisplasia**', 'Vasos submucosos', 'Hemorragia intermitente, difícil de ver'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 82 (hemorragia digestiva alta); Galindo, Enciclopedia de Cirugía Digestiva, cap. 126 (hemorragia digestiva).')
    N(u, 'S-442', 'Venas del estómago, duodeno, páncreas y bazo.', ['Vena porta, esplénica, mesentérica superior y gástrica izquierda.'], 190)
    N(u, 'S-446', 'Tributarias de la vena porta hepática y anastomosis portocava.', ['Cuatro sitios de comunicación portosistémica: esofágico, rectal, paraumbilical y retroperitoneal.'], 190)
    oral(u, 'La primera porción del duodeno (**bulbo**) es el sitio de la mayoría de las úlceras duodenales. Por **detrás** pasan la **gastroduodenal**, el colédoco, la porta y el páncreas: la **úlcera posterior** sangra (erosiona la gastroduodenal) y la **anterior** perfora (neumoperitoneo). La **úlcera gástrica de la curvatura menor** sangra por la arcada de la gástrica izquierda y siempre se **biopsia** por el riesgo de cáncer. La **HDA** nace por encima del **ángulo de Treitz**: úlcera, **várices** (anastomosis portosistémica: gástrica izquierda → venas esofágicas → ácigos), **Mallory-Weiss** (desgarro en la unión esofagogástrica por vómitos), gastritis erosiva y tumores. El abordaje inicial es la reanimación, la endoscopia dentro de las 24 horas y el tratamiento endoscópico (clasificación de Forrest).')


def estomago_operado(u):
    u.h2('Estómago operado: resecciones, reconstrucciones y sus síndromes', intro='El programa pide el estómago operado (dumping, asa aferente, gastritis alcalina, fístula gastroyeyunocólica, vólvulo). Cada síndrome tiene una explicación anatómica sencilla.')
    u.h3('Operaciones sobre el estómago')
    u.tabla(['Operación', 'Qué se hace', 'Reconstrucción'], [
        ['**Vagotomía troncular**', 'Sección de los dos troncos vagales por encima del hiato', 'Requiere procedimiento de drenaje (piloroplastia o gastroyeyunostomía)'],
        ['**Vagotomía selectiva** y **superselectiva (de células parietales)**', 'Se conservan las ramas hepática y celíaca, o la pata de ganso antral', 'La superselectiva **no necesita drenaje**'],
        ['**Gastrectomía subtotal (antrectomía)**', 'Se reseca el antro y parte del cuerpo', '**Billroth I** (gastroduodenostomía), **Billroth II** (gastroyeyunostomía con asa aferente y eferente) o **Y de Roux**'],
        ['**Gastrectomía total**', 'Se reseca todo el estómago', '**Y de Roux** esofagoyeyunal'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, caps. 208 (tratamiento quirúrgico de la úlcera) y 217 (complicaciones de las gastrectomías); Giménez, Cirugía, 2.ª ed., caps. 42 y 43.')
    u.h3('Síndromes del estómago operado y su causa anatómica')
    u.tabla(['Síndrome', 'Causa anatómica', 'Clínica'], [
        ['**Dumping precoz**', 'Pérdida del **reservorio y del píloro**: el contenido hiperosmolar pasa rápido al yeyuno y atrae líquido', '15-30 minutos tras comer: palpitaciones, sudoración, mareo, cólicos y diarrea'],
        ['**Dumping tardío**', 'Hiperinsulinismo reactivo', '1-3 horas después: **hipoglucemia**'],
        ['**Síndrome del asa aferente** (Billroth II)', '**Obstrucción del asa aferente** (duodeno y yeyuno proximal hasta la anastomosis) por una brida, hernia interna o estenosis', 'Dolor posprandial que se alivia con **vómito bilioso en chorro**; dilatación del asa; riesgo de pancreatitis o perforación'],
        ['**Gastritis alcalina**', '**Reflujo biliar** al muñón gástrico (falta de píloro)', 'Dolor epigástrico, vómito bilioso que **no alivia**'],
        ['**Diarrea postvagotomía**', 'Denervación de las ramas **celíaca y hepática** del vago (vagotomía troncular); más rápido tránsito', 'Diarrea líquida, explosiva'],
        ['**Úlcera marginal y fístula gastroyeyunocólica**', 'Úlcera en la boca anastomótica que **penetra al colon transverso o al mesocolon**', 'Diarrea con alimentos sin digerir, heces fecaloides, vómitos fecaloides'],
        ['**Cáncer del muñón gástrico**', 'Gastritis atrófica y reflujo alcalino en el muñón', 'Se presenta **5-10 años o más** después de la cirugía: control endoscópico'],
        ['**Invaginación**', 'Intususcepción yeyunogástrica por la boca anastomótica', 'Hemorragia y obstrucción'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 217 (complicaciones de las gastrectomías); Giménez, Cirugía, 2.ª ed., cap. 43.')
    u.h3('Vólvulo gástrico y bezoares')
    u.ul(['**Vólvulo**: giro del estómago sobre sí mismo cuando los **ligamentos de fijación** (gastrohepático, gastrocólico, gastroesplénico y gastrofrénico) están flojos. **Organoaxial** (sobre el eje que une cardias y píloro; el más frecuente, asociado a hernia paraesofágica) y **mesenteroaxial** (sobre el eje transversal). Complicación: isquemia y necrosis.',
          '**Bezoares**: cúmulos de materia no digerible: **tricobezoar** (pelo; mujer joven con alteración psiquiátrica), **fitobezoar** (fibra vegetal; tras gastrectomía o con retraso del vaciado) y **farmacobezoar**. Producen saciedad, vómitos y obstrucción pilórica.'])
    N(u, 'S-415', 'Estómago in situ (repaso para las reconstrucciones).', ['Reconocé la curvatura menor, el antro y el píloro: son los segmentos que se resecan.'], 175)
    N(u, 'S-448', 'Inervación autónoma del estómago y duodeno (repaso para la vagotomía).', ['Dónde se secciona el vago en cada tipo de vagotomía.'], 175)
    oral(u, 'En la **vagotomía troncular** se seccionan los dos vagos por encima del hiato; como se denervan el píloro y las ramas hepática y celíaca, se necesita un drenaje y puede haber **diarrea postvagotomía**; la **superselectiva** conserva la pata de ganso antral y no necesita drenaje. Tras una **antrectomía** se reconstruye con **Billroth I, Billroth II o Y de Roux**. Los síndromes se explican por lo que se perdió: el **dumping** por la pérdida del reservorio y del píloro (el contenido hiperosmolar pasa al yeyuno), el **asa aferente** por la obstrucción del asa del Billroth II (vómito bilioso en chorro que alivia), la **gastritis alcalina** por el reflujo biliar y la **fístula gastroyeyunocólica** por una úlcera marginal que penetra al colon. El **cáncer del muñón** aparece pasados los 5-10 años. El **vólvulo gástrico** ocurre cuando fallan los ligamentos de fijación o hay hernia paraesofágica.')


def cancer(u):
    u.h2('Cáncer de esófago y de estómago: la anatomía que decide la estadificación y la cirugía', intro='La profundidad de la invasión y los ganglios se leen en las capas de la pared y en las relaciones con los órganos vecinos.')
    u.h3('Tipos y localización')
    u.tabla(['', 'Carcinoma escamoso del esófago', 'Adenocarcinoma del esófago / unión', 'Adenocarcinoma gástrico'], [
        ['**Sitio**', 'Tercio **superior y medio**', 'Tercio **inferior** y unión esofagogástrica', 'Antro, curvatura menor, cardias'],
        ['**Factores de riesgo**', 'Alcohol, tabaco, **acalasia**, cáusticos, bebidas muy calientes', 'Reflujo crónico, **Barrett**, obesidad', '**H. pylori**, gastritis atrófica y metaplasia intestinal, anemia perniciosa, tabaco, dieta con sal y nitritos, cirugía previa (muñón), antecedente familiar'],
        ['**Clínica**', '**Disfagia progresiva** primero a sólidos y luego a líquidos, pérdida de peso, odinofagia', 'Igual', 'Dispepsia que no responde, anemia, pérdida de peso, saciedad precoz, hemorragia'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 39, 40 y 42; Galindo, Enciclopedia de Cirugía Digestiva, caps. 184, 187 y 223.')
    u.h3('Invasión según la capa y las relaciones')
    u.tabla(['T', 'Esófago', 'Estómago'], [
        ['**T1**', 'Mucosa (a) o **submucosa** (b)', 'Mucosa o submucosa'],
        ['**T2**', '**Muscular propia**', 'Muscular propia'],
        ['**T3**', '**Adventicia** (el esófago no tiene serosa)', '**Subserosa** (tejido conectivo)'],
        ['**T4a**', '**Pleura, pericardio, diafragma**, peritoneo (resecables)', '**Serosa** (peritoneo visceral)'],
        ['**T4b**', '**Aorta, cuerpo vertebral, tráquea** (irresecables)', 'Estructuras adyacentes (páncreas, hígado, colon, diafragma)'],
    ], fuente='Estadificación TNM; anatomía de referencia (Giménez, Cirugía, 2.ª ed., caps. 39 y 42).')
    u.ul(['**Esófago**: la invasión del **nervio laríngeo recurrente** produce **disfonía**; la de la **tráquea o el bronquio** una **fístula traqueoesofágica** (tos al tragar, neumonías); la de la **aorta**, hemorragia; el **pericardio** o la pleura, derrame.',
          '**Diseminación ganglionar y a distancia**: ganglios **cervicales o supraclaviculares** (**ganglio de Virchow**, supraclavicular izquierdo, en el estómago), **nódulo de la hermana María José** (periumbilical), **tumor de Krukenberg** (ovario) y **estante de Blumer** (nódulo en el fondo de saco de Douglas, palpable por tacto rectal), **hígado y peritoneo**.'])
    u.h3('Cirugía: por qué se resecan estos segmentos')
    u.ul(['**Esofagectomía** (Ivor Lewis: abdomen y tórax derecho; McKeown: tres campos con anastomosis cervical; transhiatal): se reemplaza el esófago con un **tubo gástrico**, que se irriga por la **arteria gastroepiploica derecha** (se conserva) porque se ligan la gástrica izquierda y las cortas.',
          '**Gastrectomía subtotal o total con linfadenectomía D2** y reconstrucción en **Y de Roux**; **resección endoscópica** (mucosectomía o disección submucosa) para tumores T1a.',
          '**Estudios de estadificación**: endoscopia con biopsia, **ecoendoscopia** (permite ver las capas de la pared: T y N), **TC** y PET; **laparoscopia** de estadificación para detectar carcinomatosis peritoneal.'])
    L(u, 'lib_schwartz_tumor_fondo_baritado.png', 'Seriada: tumor gástrico del fondo con defecto de relleno (flecha).', SCH.format(c='cap. 26 (estómago)'), ['Defecto de relleno irregular y rigidez de la pared.'], 80)
    N(u, 'S-539', 'Mediastino: corte transversal.', ['Relaciones del esófago con la tráquea, la aorta, el pericardio y la columna a nivel del tercio medio.'], 190)
    N(u, 'S-393', 'Nervio frénico.', ['El frénico y los vagos en el mediastino: sitios de invasión tumoral y de dolor referido.'], 190)
    oral(u, 'El **esófago no tiene serosa**: el T3 es la invasión de la **adventicia**; el T4a compromete pleura, pericardio o diafragma (resecables) y el T4b **aorta, vértebra o tráquea** (irresecable). La invasión del **recurrente** da disfonía y la de la **vía aérea** una fístula traqueoesofágica. Los **linfáticos longitudinales** explican las metástasis a distancia y la linfadenectomía amplia. En el **estómago**, T3 es la subserosa y T4a la serosa; se hace gastrectomía con **D2** (estaciones 1 a 11) y reconstrucción en Y de Roux. En la **esofagectomía** el estómago asciende como tubo irrigado por la **gastroepiploica derecha**. Los signos de diseminación son el **ganglio de Virchow**, el **nódulo de la hermana María José**, el **tumor de Krukenberg** y el **estante de Blumer** (tacto rectal).')


def estudios(u):
    u.h2('Estudios complementarios: endoscopia, manometría y seriada esofagogastroduodenal', intro='El trabajo práctico de la unidad es “Diagnóstico por imágenes y función digestiva”. Cada estudio se entiende desde la anatomía normal.')
    u.tabla(['Estudio', 'Qué muestra de la anatomía', 'Cuándo se pide'], [
        ['**Videoendoscopia digestiva alta**', 'Mucosa del esófago, **línea Z** (cambio del rosa pálido al rojo salmón en la unión), pliegues gástricos, cardias (en retroflexión), antro, píloro y bulbo. Se mide la distancia desde los incisivos: **15 cm** (EES), **~40 cm** (unión esofagogástrica)', 'Disfagia, HDA, sospecha de cáncer, Barrett; permite **biopsia** y **tratamiento** (ligadura, hemostasia)'],
        ['**Seriada esofagogastroduodenal (con bario)**', 'Contorno y calibre del esófago, hiato, estómago y duodeno', 'Acalasia (“pico de pájaro”), **Zenker**, hernia hiatal, estenosis, úlcera (nicho), tumor (defecto de relleno)'],
        ['**Manometría esofágica de alta resolución**', 'Presión del **EES**, peristalsis del cuerpo y presión del **EEI**; se grafica en colores (topografía de presión)', 'Trastornos motores (**acalasia**, espasmo, jackhammer); previo a cirugía antirreflujo'],
        ['**pH-metría / impedanciometría**', 'Reflujo ácido y no ácido en 24 horas', 'ERGE sin esofagitis evidente'],
        ['**Ecoendoscopia**', 'Las **capas de la pared** y los ganglios vecinos', 'Estadificación T y N del cáncer; tumores submucosos'],
        ['**TC / PET**', 'Extensión locorregional y metástasis', 'Estadificación'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 36 y 37; Galindo, Enciclopedia de Cirugía Digestiva, cap. 152 (estudios funcionales del esófago).')
    u.box('clave', 'Manometría de alta resolución: cómo se lee', ['Eje vertical: la longitud del esófago (del EES arriba al EEI abajo); eje horizontal: el tiempo; el **color** representa la presión (rojo: alta; azul: baja).',
                                                              'Normal: **onda peristáltica** que desciende desde el EES y **relajación del EEI** al llegar. **Acalasia**: sin peristalsis y con relajación incompleta del EEI (en la clasificación de Chicago: tipo I sin presurización, tipo II con presurización de todo el esófago y tipo III con contracciones espásticas).'])
    L(u, 'lib_schwartz_manometria.png', 'Manometría de alta resolución: A, normal; B, acalasia.', SCH.format(c='cap. 25'), ['En B el EEI permanece cerrado (franja azul-verde inferior) y la presión del cuerpo es uniforme.'], 90)
    oral(u, 'Para la **disfagia** pido primero la **videoendoscopia digestiva alta** para ver la mucosa, la línea Z y tomar biopsias; si es motora, la **seriada** (esófago dilatado con “pico de pájaro”, “sacacorchos”) y la **manometría de alta resolución** (EES, cuerpo y EEI) que confirma la acalasia (relajación incompleta del EEI sin peristalsis). La **ecoendoscopia** estadifica el T y el N del cáncer. En el **reflujo** sin lesión, **pH-metría**. Si el paciente sangra, la endoscopia dentro de las 24 horas hace el diagnóstico y el tratamiento.')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una une anatomía con la patología de la unidad.')
    qa = [
        ('¿Por qué el divertículo de Zenker aparece en la pared posterior y es un divertículo falso?',
         'Porque nace en el **triángulo de Killian**, entre las fibras oblicuas del tirofaríngeo y las horizontales del **cricofaríngeo**, donde **no hay músculo**. Se produce por **pulsión** (incoordinación del esfínter superior) y solo protruye mucosa y submucosa: es **falso**.'),
        ('¿Qué particularidad tiene la pared del esófago y qué consecuencias clínicas tiene?',
         '**No tiene serosa** (tiene adventicia). Por eso la **perforación** produce **mediastinitis** rápida, las **anastomosis** son más riesgosas y el **cáncer** invade precozmente los órganos vecinos. Además la irrigación es segmentaria y los linfáticos longitudinales permiten metástasis a distancia.'),
        ('¿Qué mantiene cerrada la unión esofagogástrica?',
         'El **esfínter esofágico inferior** (3-4 cm, 10-35 mmHg), el **pilar derecho del diafragma** (esfínter crural, hiato en T10), la **membrana frenoesofágica**, el **ángulo de His** y la **válvula de Hill**. Si fallan: reflujo y hernia hiatal.'),
        ('Diferenciá las hernias hiatales I y II.',
         '**I (deslizamiento)**: la unión esofagogástrica y parte del estómago pasan al tórax; es la más frecuente y se asocia a reflujo. **II (paraesofágica)**: el **fondo** asciende junto al esófago con la unión en su lugar; produce poco reflujo y tiene riesgo de **estrangulación y vólvulo** (tríada de Borchardt).'),
        ('¿Cuál es la anatomía de la acalasia y cómo se ve en los estudios?',
         'Pérdida de las **neuronas inhibitorias** del **plexo mientérico de Auerbach**: el EEI no se relaja y no hay peristalsis. **Seriada**: esófago dilatado con **“pico de pájaro”**. **Manometría**: relajación incompleta del EEI. En Argentina, descartar **Chagas**.'),
        ('Un paciente cirrótico tiene hematemesis masiva. ¿Qué vena está involucrada?',
         'Las **várices esofagogástricas** por hipertensión portal: la sangre de la **vena gástrica izquierda (coronaria estomáquica)** pasa por las venas esofágicas a la **ácigos** (anastomosis portosistémica en el tercio inferior del esófago). Tratamiento: endoscopia con ligadura, vasoconstrictores y antibiótico.'),
        ('¿Por qué la úlcera duodenal posterior sangra y la anterior perfora?',
         'Porque por **detrás** del bulbo pasa la **arteria gastroduodenal** (junto al colédoco, la porta y el páncreas): la úlcera posterior la erosiona. La **cara anterior** está en contacto con el peritoneo libre: la úlcera anterior **perfora** y da **neumoperitoneo**.'),
        ('¿De qué arterias se irriga el estómago y cuál se conserva en la esofagectomía?',
         'Por la **gástrica izquierda** (celíaco) y la **derecha** (hepática propia) en la curvatura menor, y la **gastroepiploica derecha** (gastroduodenal) e **izquierda** (esplénica) en la mayor, más las **gástricas cortas**. En la esofagectomía se asciende el estómago como tubo gástrico irrigado por la **gastroepiploica derecha**.'),
        ('Explicá el síndrome del asa aferente y el dumping.',
         '**Asa aferente** (Billroth II): obstrucción del asa que lleva la bilis y el jugo pancreático a la anastomosis; dolor posprandial que alivia con **vómito bilioso en chorro**. **Dumping**: sin reservorio y sin píloro, el contenido hiperosmolar pasa rápido al yeyuno: síntomas vasomotores a los 15-30 minutos y, a las 1-3 horas, hipoglucemia.'),
        ('¿Qué es el D2 en la cirugía del cáncer gástrico?',
         'Linfadenectomía de las estaciones **N1** (1-6, paragástricas) y **N2** (7-11: gástrica izquierda, hepática común, celíaco, hilio y arteria esplénica). Se asocia a la gastrectomía oncológica para mejorar la estadificación y el control locorregional.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Galindo, F. __Enciclopedia de Cirugía Digestiva__ (2020), SACD: cap. 126 (hemorragia digestiva), 150 (anatomía quirúrgica del esófago), 152 (estudios funcionales), 157 (acalasia), 163 (Zenker), 170 (reflujo), 172 (ERGE y hernia hiatal), 175 (Barrett), 184 y 186 (cáncer de esófago), 187 (unión esofagogástrica), 200 (anatomía quirúrgica del estómago y duodeno), 208-209 (úlcera y complicaciones), 217 (complicaciones de las gastrectomías) y 223 (carcinoma gástrico).',
          'Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025): caps. 36 a 43 y 82.',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: caps. 25 (esófago y hernia diafragmática) y 26 (estómago).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: caps. 33 (diafragma), 34 (esófago) y 41 (estómago y duodeno).',
          'Asociación Española de Cirujanos, __Cirugía esofagogástrica. Guías clínicas__ (bibliografía complementaria del programa; no disponible en la sala).'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. La lámina de Netter o de Gray muestra la **anatomía real**: ante cualquier duda, **la lámina manda**.')
    u.h3('Imágenes en blanco y negro')
    u.ul(['Los esquemas de Galindo del esófago (**distancias**, **triángulo de Killian**, membrana frenoesofágica y conducto torácico) son dibujos en blanco y negro; los demás son a color.'])
