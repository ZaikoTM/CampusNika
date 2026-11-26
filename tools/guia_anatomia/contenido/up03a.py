# -*- coding: utf-8 -*-
"""UP 3 · Anatomía quirúrgica de la disfagia, el esófago y el estómago. Parte A: deglución y faringe, esófago, unión esofagogástrica e hiato, trastornos motores y divertículos."""
from .up01e import N, G, L, oral

GAL = 'Galindo, __Enciclopedia de Cirugía Digestiva__ (SACD, 2020), {c}.'
SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def deglucion(u):
    u.h2('Deglución y faringe: la base anatómica de la disfagia', intro='La unidad empieza por la disfagia. Antes de hablar del esófago hay que ubicar el problema: ¿falla la boca y la faringe (disfagia orofaríngea) o el esófago (disfagia esofágica)?')
    u.h3('Fases de la deglución y qué las controla')
    u.tabla(['Fase', 'Qué ocurre', 'Control nervioso y músculos', 'Si falla…'], [
        ['**Oral (voluntaria)**', 'Se forma el bolo y la lengua lo empuja hacia atrás', 'Trigémino (V), facial (VII), hipogloso (XII); músculos de la lengua y de la masticación', 'Escape del bolo, dificultad para iniciar'],
        ['**Faríngea (involuntaria, <1 s)**', 'Se eleva la laringe, la epiglotis cierra la glotis, la faringe se contrae y el **esfínter esofágico superior (EES)** se relaja', 'Glosofaríngeo (IX) y vago (X) por el **plexo faríngeo**; constrictores de la faringe; centro bulbar', 'Tos al tragar, aspiración, regurgitación nasal'],
        ['**Esofágica (involuntaria)**', 'Onda **peristáltica primaria** que lleva el bolo al estómago y relajación del **esfínter esofágico inferior (EEI)**', 'Vago: núcleo ambiguo (músculo estriado) y núcleo dorsal (músculo liso); plexo mientérico', 'Disfagia a sólidos o líquidos, regurgitación tardía, dolor retroesternal'],
    ], fuente='Anatomía y fisiología de referencia; Galindo, Enciclopedia de Cirugía Digestiva, cap. 150 (anatomía quirúrgica del esófago) y cap. 152 (estudios funcionales).')
    u.h3('Faringe y unión faringoesofágica')
    u.ul(['La **faringe** tiene tres porciones (naso, oro y laringofaringe) y su pared muscular está formada por los **constrictores superior, medio e inferior**, que se imbrican como macetas apiladas y se inervan por el **plexo faríngeo (IX y X)**.',
          'El constrictor inferior tiene dos partes: **tirofaríngea** (oblicua) y **cricofaríngea** (horizontal). El músculo **cricofaríngeo** constituye el **esfínter esofágico superior (EES)**, que está contraído en reposo y se relaja con la deglución.',
          'Entre las fibras oblicuas y horizontales hay una zona débil sin músculo, el **triángulo de Killian** (por detrás, en la línea media): es el punto por donde protruye el **divertículo de Zenker**.',
          'En la laringofaringe, a los lados de la laringe, están los **senos piriformes**; por ahí corre la **rama interna del laríngeo superior** (sensibilidad).',
          'La **unión faringoesofágica** está a la altura del cricoides, **C6**, a unos **15 cm de la arcada dentaria**.'])
    u.box('clave', 'Disfagia orofaríngea vs esofágica', [['**Orofaríngea**: dificultad para **iniciar** la deglución, tos o atragantamiento, regurgitación nasal, voz húmeda; causas **neurológicas** (ACV, Parkinson, ELA, miastenia), divertículo de Zenker, tumores de cabeza y cuello.',
                                                         '**Esofágica**: sensación de que el alimento **“se queda pegado”** en el tórax **unos segundos después** de tragar; **sólidos y líquidos** (motora) o **solo sólidos** y progresiva (obstructiva: estenosis, cáncer, anillo de Schatzki).']])
    N(u, 'S-407', 'Músculos de la faringe: visión lateral.', ['Constrictores superior, medio e inferior; cricofaríngeo en la parte baja.'], 190)
    N(u, 'S-409', 'Músculos de la faringe: visión posterior parcialmente abierta.', ['Triángulo de Killian entre las fibras oblicuas y horizontales del constrictor inferior.'], 190)
    N(u, 'S-374', 'Unión faringoesofágica.', ['Cricofaríngeo, entrada del esófago y nervio laríngeo recurrente.'], 190)
    G(u, 566, 'Músculos de la faringe (Gray).', ['Compará con Netter el cricofaríngeo y el triángulo de Killian.'], 190)
    G(u, 568, 'Inervación de la faringe (Gray).', ['Plexo faríngeo con ramas del glosofaríngeo y del vago.'], 190)
    L(u, 'gal_killian.png', 'Región faringoesofágica, vista posterior: triángulo de Killian entre el constrictor inferior y el cricofaríngeo.', GAL.format(c='cap. 150, fig. 3'), ['Debilidad muscular: sitio del divertículo de Zenker.'], 80)
    oral(u, 'La deglución tiene una fase **oral** voluntaria (V, VII, XII), una **faríngea** involuntaria controlada por el **plexo faríngeo (IX y X)** y una **esofágica** peristáltica. El **cricofaríngeo** forma el **esfínter esofágico superior**; entre sus fibras y las del tirofaríngeo queda el **triángulo de Killian**, por donde protruye el **divertículo de Zenker**. Ante una disfagia pregunto primero si es **orofaríngea** (dificultad para iniciar la deglución, tos, aspiración: neurológica, Zenker, tumor de cabeza y cuello) o **esofágica** (el alimento se queda en el tórax: motora si hay sólidos y líquidos desde el principio; obstructiva si es progresiva a sólidos).')


def esofago(u):
    u.h2('Esófago: porciones, relaciones, irrigación, drenaje y nervios', intro='Es el apartado más preguntado de anatomía en la unidad. El esófago tiene particularidades que explican por qué sus enfermedades y cirugías son tan especiales.')
    u.h3('Generalidades')
    u.ul(['Tubo muscular de **unos 25 cm**, desde el cricoides (**C6**) hasta el cardias (**T11**), a unos **40 cm de la arcada dentaria**.',
          'Tres porciones: **cervical** (C6-T1, ~5 cm), **torácica** (~17 cm, en el mediastino posterior) y **abdominal** (1-2 cm, tras atravesar el hiato diafragmático a nivel de **T10**).',
          '**No tiene serosa**: su pared externa es una **adventicia**. Consecuencias clínicas: la **perforación** produce rápidamente **mediastinitis**; las **anastomosis** esofágicas tienen más riesgo de dehiscencia; el cáncer **invade** los órganos vecinos con facilidad.',
          'Capas: mucosa (epitelio **escamoso estratificado**), submucosa (glándulas y plexo de Meissner), muscular propia (capa circular interna y longitudinal externa; plexo mientérico de Auerbach) y adventicia. La musculatura es **estriada** en el tercio superior, **mixta** en el medio y **lisa** en el tercio inferior.'])
    u.h3('Estrechamientos fisiológicos (distancia desde los incisivos)')
    u.tabla(['Estrechamiento', 'Distancia', 'Causa', 'Importancia clínica'], [
        ['**Cricoideo** (esfínter esofágico superior)', '~15 cm', 'Cricofaríngeo', 'Es el más estrecho: cuerpos extraños, lesión por la sonda o el endoscopio, divertículo de Zenker por encima'],
        ['**Aortobronquial**', '~22-25 cm', 'Arco aórtico y bronquio izquierdo', 'Cuerpos extraños, compresión externa (disfagia lusoria por arteria subclavia aberrante)'],
        ['**Diafragmático**', '~38-40 cm', 'Hiato esofágico y esfínter esofágico inferior', 'Anillo de Schatzki, hernia hiatal; es la **unión esofagogástrica**'],
    ], fuente='Netter, lámina S-411; Galindo, Enciclopedia de Cirugía Digestiva, cap. 150, fig. 1.')
    L(u, 'gal_esofago_distancias.png', 'Esófago: distancia desde la arcada dentaria superior a cada estrechamiento y a la unión esofagogástrica.', GAL.format(c='cap. 150, fig. 1'), ['15 cm (cricoides), 25 cm (cayado de la aorta), 40 cm (hiato y cardias).'], 95)
    u.h3('Relaciones por porciones')
    u.tabla(['Porción', 'Por delante', 'Por detrás', 'A los lados', 'Qué se lesiona'], [
        ['**Cervical**', 'Tráquea', 'Columna cervical y músculos prevertebrales', 'Lóbulos tiroideos; **nervios laríngeos recurrentes** en el surco traqueoesofágico; carótidas', 'Recurrente en la cirugía del Zenker o del tiroides; **mediastinitis descendente** por perforación'],
        ['**Torácica alta y media**', 'Tráquea, **bifurcación traqueal** y **bronquio izquierdo**', 'Columna, **aorta descendente**, conducto torácico y vena ácigos', 'A la izquierda el **arco aórtico**; a la derecha la **pleura** y la ácigos', 'Fístula traqueoesofágica en el cáncer; hemorragia aórtica; disfonía por el recurrente izquierdo'],
        ['**Torácica baja**', '**Pericardio y aurícula izquierda**', 'Aorta torácica descendente', 'Pleuras', 'La aurícula izquierda se comprime en el dolor o la masa; fístula en el cáncer'],
        ['**Abdominal**', 'Lóbulo izquierdo del hígado', 'Pilares del diafragma y aorta', 'Vagos anterior y posterior', 'Lesión del vago en la cirugía antirreflujo'],
    ], fuente='Netter, láminas S-410 y S-411; Gray, págs. 128, 130 y 132; Galindo, Enciclopedia de Cirugía Digestiva, cap. 150.')
    u.h3('Irrigación (segmentaria)')
    u.tabla(['Segmento', 'Arterias', 'Dato quirúrgico'], [
        ['**Cervical**', 'Ramas de la **arteria tiroidea inferior** (tronco tirocervical)', '—'],
        ['**Torácico**', 'Ramas directas de la **aorta torácica**, **arterias bronquiales** e intercostales', 'Irrigación escasa y segmentaria: la movilización amplia puede isquemiar el esófago'],
        ['**Abdominal**', '**Gástrica izquierda** (rama ascendente) y **frénica inferior izquierda**', 'En la esofagectomía el estómago se asciende con la **arteria gastroepiploica derecha** como pedículo'],
    ], fuente='Netter, lámina S-339; Galindo, Enciclopedia de Cirugía Digestiva, cap. 150, figs. 10-15.')
    u.h3('Venas, linfáticos y nervios')
    u.ul(['**Venas**: plexo submucoso que drena, en el cuello, a las **tiroideas inferiores**; en el tórax, a las **venas ácigos y hemiácigos** (sistema cava); en el abdomen, a la **vena gástrica izquierda (coronaria estomáquica)**, que va a la **porta**. El **tercio inferior** es zona de **anastomosis portosistémica**: ahí aparecen las **várices esofágicas** en la hipertensión portal.',
          '**Linfáticos**: red submucosa **longitudinal** que permite el drenaje **en ambos sentidos** y la aparición de metástasis ganglionares **lejos del tumor** (“skip”): tercio superior a los ganglios cervicales profundos, medio a los paratraqueales y subcarinales, inferior a los paragástricos y celíacos. Por eso la linfadenectomía del cáncer de esófago es amplia.',
          '**Nervios**: **vagos** (parasimpático; forman el plexo esofágico y, al atravesar el hiato, los **troncos vagales anterior y posterior**) y cadena simpática torácica (T4-T6). El **nervio laríngeo recurrente** da ramas al esófago cervical.',
          '**Inervación intrínseca**: plexos **mientérico (Auerbach)** y **submucoso (Meissner)**. En la **acalasia** se pierden las neuronas inhibitorias del plexo mientérico.'])
    N(u, 'S-410', 'Esófago in situ.', ['Porciones cervical, torácica y abdominal y su relación con la tráquea y la aorta.'], 190)
    N(u, 'S-411', 'Esófago: estrechamientos y relaciones.', ['Los tres estrechamientos y los órganos vecinos (bronquio izquierdo, arco aórtico, pericardio, diafragma).'], 190)
    N(u, 'S-412', 'Musculatura del esófago.', ['Capas circular y longitudinal; transición del músculo estriado al liso.'], 190)
    N(u, 'S-339', 'Arterias del esófago.', ['Segmentos y arterias nutricias.'], 190)
    N(u, 'S-340', 'Venas del esófago.', ['Anastomosis entre las venas esofágicas y la gástrica izquierda.'], 190)
    N(u, 'S-447', 'Nervios del esófago.', ['Plexo esofágico y troncos vagales anterior y posterior.'], 190)
    G(u, 132, 'Mediastino posterior (Gray).', ['Esófago con la aorta torácica, la ácigos, el conducto torácico y los vagos.'], 190)
    G(u, 130, 'Mediastino: visión desde el lado izquierdo (Gray).', ['Arco aórtico, bronquio izquierdo y esófago.'], 190)
    N(u, 'S-390', 'Mediastino: visión lateral derecha.', ['Esófago, ácigos, vago derecho y pleura.'], 190)
    N(u, 'S-391', 'Mediastino: visión lateral izquierda.', ['Arco aórtico y esófago.'], 190)
    L(u, 'gal_conducto_toracico.png', 'Conducto torácico y su relación con el esófago y los vasos del mediastino.', GAL.format(c='cap. 150'), ['El conducto torácico está por detrás del esófago: una cirugía esofágica puede lesionarlo (quilotórax).'], 85)
    oral(u, 'El esófago mide unos **25 cm**, va de **C6 a T11** y tiene una porción cervical, una torácica y una abdominal de 1-2 cm. **No tiene serosa**, por eso la perforación produce mediastinitis y el cáncer invade con facilidad. Tiene tres **estrechamientos**: cricoideo (~15 cm de los incisivos), aortobronquial (~25 cm) y diafragmático (~40 cm). En el tórax se relaciona por delante con la **tráquea, el bronquio izquierdo y el pericardio**, y por detrás con la **aorta, el conducto torácico y la ácigos**; en el cuello, los **recurrentes** corren en el surco traqueoesofágico. Su irrigación es **segmentaria**: tiroidea inferior, ramas de la aorta y bronquiales, y gástrica izquierda y frénica inferior; las **venas** del tercio inferior comunican con la porta (**várices**). Los **linfáticos** son longitudinales y bidireccionales, de ahí las metástasis a distancia. La inervación es **vagal**, con los plexos de Auerbach y Meissner; en la **acalasia** se pierden las neuronas inhibitorias del plexo mientérico.')


def union_hiato(u):
    u.h2('Unión esofagogástrica, hiato diafragmático y reflujo', intro='Hernia hiatal, ERGE y esófago de Barrett se explican por la anatomía de la unión esofagogástrica. Hay que saber qué la mantiene cerrada y cómo se desplaza.')
    u.h3('Mecanismos antirreflujo')
    u.tabla(['Mecanismo', 'Descripción', 'Si falla…'], [
        ['**Esfínter esofágico inferior (EEI)**', 'Engrosamiento de la musculatura lisa de 3-4 cm en la unión; presión de reposo normal de 10-35 mmHg; se relaja con la deglución', 'Hipotonía o relajaciones transitorias: **reflujo**'],
        ['**Pilar derecho del diafragma (esfínter crural)**', 'Las fibras del pilar rodean el hiato (**T10**) y comprimen el esófago con la inspiración', 'Hiato ancho: **hernia hiatal**'],
        ['**Membrana frenoesofágica (de Laimer-Bertelli)**', 'Fijación fibroelástica del esófago al borde del hiato', 'Hernia por **deslizamiento**'],
        ['**Ángulo de His**', 'Ángulo agudo entre el esófago y el fondo gástrico', 'Se abre en la hernia'],
        ['**Válvula de Hill (plica gastroesofágica)**', 'Pliegue de mucosa gástrica que se ve en **retroflexión**; grados I a IV de la endoscopia', 'Grados III-IV: reflujo'],
        ['**Longitud del esófago abdominal**', '1-2 cm de esófago intraabdominal sometido a la presión abdominal', 'Se pierde en la hernia'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 170 (reflujo gastroesofágico patológico: de la anatomía a la clínica); Giménez, Cirugía, 2.ª ed., cap. 37.')
    L(u, 'gal_frenoesofagica.png', 'Unión esofagogástrica: membrana frenoesofágica, fascias endotorácica y transversalis y diafragma.', GAL.format(c='cap. 150'), ['La membrana frenoesofágica fija el esófago al hiato; su relajación permite el deslizamiento del cardias.'], 80)
    L(u, 'lib_schwartz_chapaleta_hill.png', 'Válvula de Hill: grados I a IV en la visión endoscópica retrofleja.', SCH.format(c='cap. 25 (esófago y hernia diafragmática)'), ['Grado I: pliegue marcado que rodea el endoscopio; grado IV: sin pliegue, cardias abierto.'], 80)
    u.h3('Hernia hiatal')
    u.tabla(['Tipo', 'Qué se desplaza', 'Clínica y riesgo'], [
        ['**I (por deslizamiento)** (~95 %)', 'La unión esofagogástrica y parte del estómago pasan al tórax por el hiato ensanchado', 'Reflujo; la mayoría es asintomática'],
        ['**II (paraesofágica)**', 'El **fondo gástrico** asciende junto al esófago; **la unión queda en su lugar**', 'Poco reflujo; riesgo de **estrangulación y vólvulo**'],
        ['**III (mixta)**', 'Combinación de I y II', 'Ambos'],
        ['**IV**', 'Pasan otros órganos (colon, bazo, epiplón) al tórax', 'Compresión pulmonar y obstrucción'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 37; Galindo, Enciclopedia de Cirugía Digestiva, caps. 170 y 172.')
    u.box('alerta', 'Vólvulo gástrico y tríada de Borchardt', 'Una hernia paraesofágica puede girar sobre sí misma: **dolor epigástrico o torácico intenso, arcadas sin vómito e imposibilidad de pasar la sonda nasogástrica**. Es una urgencia quirúrgica.')
    L(u, 'lib_schwartz_estomago_intratoracico.png', 'Seriada esofagogastroduodenal: estómago intratorácico (hernia paraesofágica gigante).', SCH.format(c='cap. 25'), ['Fondo gástrico dentro del tórax por encima del diafragma.'], 80)
    u.h3('Esófago de Barrett y esofagitis')
    u.ul(['**Definición**: reemplazo del epitelio escamoso del esófago distal por **epitelio columnar con metaplasia intestinal**, como respuesta al reflujo crónico. Se ve en la endoscopia como **lenguas de mucosa rosada-salmón** por encima de la unión esofagogástrica (la **línea Z** se desplaza hacia arriba).',
          'La **unión escamocolumnar (línea Z)** normalmente coincide con la unión esofagogástrica; en el Barrett está **proximal** a ella. Es precursor del **adenocarcinoma**.',
          '**Esofagitis por reflujo** (clasificación de Los Ángeles A-D) y **estenosis péptica** son sus complicaciones; la **esofagitis cáustica** (álcalis) lesiona en profundidad y estenosa.'])
    L(u, 'lib_schwartz_barrett_complicaciones.png', 'Endoscopia: complicaciones del reflujo (esofagitis, estenosis, Barrett).', SCH.format(c='cap. 25'), ['Mucosa del esófago distal: erosiones, lenguas de metaplasia y estenosis.'], 90)
    N(u, 'S-413', 'Unión gastroesofágica.', ['Hiato, pilares del diafragma, membrana frenoesofágica y ángulo de His.'], 190)
    N(u, 'S-429', 'Diafragma (traccionado).', ['Hiato esofágico a nivel de T10 y hiato aórtico (T12).'], 190)
    N(u, 'S-208', 'Diafragma: cara abdominal.', ['Pilares derecho e izquierdo y orificios: esofágico, aórtico y de la cava.'], 190)
    G(u, 200, 'Diafragma (Gray).', ['Pilares y orificios: T8 (cava), T10 (esófago) y T12 (aorta).'], 190)
    oral(u, 'La unión esofagogástrica se mantiene cerrada por el **esfínter esofágico inferior** (3-4 cm, 10-35 mmHg), el **pilar derecho del diafragma** que rodea el hiato (T10), la **membrana frenoesofágica**, el **ángulo de His** y la **válvula de Hill**. Si fallan, aparecen el reflujo y la **hernia hiatal**: **tipo I** por deslizamiento (la más frecuente, con reflujo), **tipo II** paraesofágica (el fondo sube junto al esófago; riesgo de estrangulación y vólvulo, tríada de Borchardt), **tipo III** mixta y **tipo IV** con otros órganos. El reflujo crónico produce **esofagitis** y **esófago de Barrett** (metaplasia intestinal por encima de la unión: precursor del adenocarcinoma).')


def motores(u):
    u.h2('Trastornos motores y divertículos: anatomía de la disfagia funcional', intro='La acalasia y el resto de los trastornos motores se explican por la inervación del esófago. Los divertículos, por los puntos débiles de la pared.')
    u.h3('Trastornos motores')
    u.tabla(['Cuadro', 'Anatomía y fisiopatología', 'Estudios'], [
        ['**Acalasia**', 'Pérdida de las **neuronas inhibitorias** (óxido nítrico, VIP) del **plexo mientérico de Auerbach**: el EEI **no se relaja** y no hay peristalsis', '**Seriada**: dilatación del cuerpo y **“pico de pájaro”** distal; **manometría**: relajación incompleta del EEI; endoscopia para descartar neoplasia'],
        ['**Espasmo esofágico difuso**', 'Contracciones simultáneas del músculo liso del tercio inferior', 'Seriada con imagen **“en sacacorchos”**; manometría'],
        ['**Esófago en cascanueces (nutcracker) / jackhammer**', 'Contracciones peristálticas **de gran amplitud**', 'Manometría de alta resolución'],
        ['**Esclerodermia**', 'Atrofia del músculo liso del esófago distal y EEI hipotónico', 'Reflujo severo; manometría con hipoperistalsis'],
        ['**Enfermedad de Chagas**', 'Destrucción de los plexos mientéricos por __Trypanosoma cruzi__', 'Megaesófago chagásico (Argentina)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 36 (acalasia y otros trastornos motores); Galindo, Enciclopedia de Cirugía Digestiva, caps. 152 y 157.')
    L(u, 'lib_schwartz_manometria.png', 'Manometría esofágica de alta resolución: acalasia (esquemas y trazados).', SCH.format(c='cap. 25'), ['El EEI no se relaja con la deglución y no hay peristalsis del cuerpo del esófago.'], 95)
    u.h3('Divertículos del esófago')
    u.tabla(['Divertículo', 'Sitio', 'Mecanismo', 'Característica'], [
        ['**De Zenker (faringoesofágico)**', 'Pared **posterior**, entre el tirofaríngeo y el cricofaríngeo (**triángulo de Killian**)', '**Pulsión** (incoordinación del EES); es **falso** (solo mucosa y submucosa)', 'Anciano, **regurgitación de alimento no digerido**, halitosis, ruido de gorgoteo; no explorar con sonda a ciegas por riesgo de perforación'],
        ['**Mediotorácico (parabronquial)**', 'Esófago medio, a la altura de la bifurcación traqueal', '**Tracción** por ganglios mediastínicos inflamados (tuberculosis); es **verdadero**', 'Generalmente asintomático'],
        ['**Epifrénico**', 'Esófago distal, por encima del diafragma', '**Pulsión** secundaria a un trastorno motor (acalasia, espasmo)', 'Se asocia a trastornos motores: el tratamiento incluye la **miotomía**'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 38 (divertículos del esófago); Galindo, Enciclopedia de Cirugía Digestiva, cap. 163 (divertículo de Zenker).')
    oral(u, 'La **acalasia** es la pérdida de las neuronas inhibitorias del **plexo mientérico de Auerbach**: el **EEI no se relaja** y no hay peristalsis; en la seriada se ve el esófago dilatado con el **“pico de pájaro”** y la manometría muestra relajación incompleta. En Argentina hay que pensar en el **Chagas** (megaesófago). El **espasmo difuso** da el **“sacacorchos”**. El **divertículo de Zenker** sale por el **triángulo de Killian** (entre el tirofaríngeo y el cricofaríngeo), es **falso** y de pulsión; da regurgitación de comida no digerida. El **epifrénico** también es de pulsión y se asocia a un trastorno motor; el **mediotorácico** es de tracción y verdadero.')
