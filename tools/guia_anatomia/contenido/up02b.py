# -*- coding: utf-8 -*-
"""UP 2 · Anatomía quirúrgica del abdomen agudo. Parte B: intestino, apéndice y FID, diagnóstico diferencial, imágenes, preguntas de oral y referencias."""
from .up01e import N, G, L, oral

SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def intestino(u):
    u.h2('Intestino delgado y grueso: anatomía de la obstrucción', intro='El abdomen agudo obstructivo se razona con la anatomía: qué segmento se obstruye, dónde están los puntos estrechos y qué lo diferencia en una radiografía.')
    u.h3('Intestino delgado: de Treitz a la válvula ileocecal')
    u.tabla(['', 'Yeyuno', 'Íleon'], [
        ['**Ubicación**', 'Cuadrante superior izquierdo, a partir del ángulo duodenoyeyunal (**de Treitz**, fijado por el ligamento suspensorio del duodeno)', 'Cuadrante inferior derecho y pelvis, hasta la válvula ileocecal'],
        ['**Calibre y pared**', 'Más ancho, pared más gruesa, **válvulas conniventes** altas y juntas (aspecto “en pluma”)', 'Más delgado, pared más fina, válvulas más bajas y espaciadas'],
        ['**Vasos**', 'Pocas arcadas y **vasa recta largos**', 'Más arcadas y **vasa recta cortos**'],
        ['**Grasa mesentérica**', 'Poca', 'Abundante'],
        ['**Placas de Peyer**', 'Escasas', 'Abundantes (ileítis, perforación tifoidea)'],
    ], fuente='Anatomía de referencia; Netter, láminas S-420 y S-421; Gray, pág. 179.')
    u.ul(['El **duodeno** es en su mayoría **retroperitoneal** (4 porciones: superior, descendente con la **papila de Vater**, horizontal y ascendente). La 3.ª porción pasa **entre la aorta y la mesentérica superior** (síndrome de la pinza aortomesentérica).',
          'El **mesenterio** nace oblicuo desde el ángulo duodenoyeyunal (L2) y baja hacia la **fosa ilíaca derecha**; mide unos 15 cm de raíz y contiene la **AMS**, la **VMS**, linfáticos y nervios. Un **vólvulo** del intestino delgado se produce cuando el intestino gira alrededor de ese eje.',
          'La **válvula ileocecal (de Bauhin)** impide el reflujo del colon al íleon. Es el segmento más **estrecho** del intestino delgado: un **cálculo biliar** grande puede quedar impactado (**íleo biliar**).'])
    u.h3('Intestino grueso')
    u.ul(['**Ciego** (intraperitoneal, 6-8 cm, con el **apéndice** en su cara posteromedial), **colon ascendente** y **descendente** (retroperitoneales), **transverso** y **sigmoides** (intraperitoneales, con meso).',
          'Reconocimiento: **tres tenias**, **haustras** y **apéndices epiploicos**. El diámetro normal del colon es menor de 6 cm y del ciego, menor de 9 cm.',
          'El **sigmoides** tiene un meso largo: por eso es el sitio de **vólvulo**. El **ángulo esplénico** y el **rectosigmoides** son zonas de isquemia.'])
    u.h3('Causas de obstrucción y su base anatómica')
    u.tabla(['Causa', 'Base anatómica', 'Dato clave'], [
        ['**Adherencias o bridas** (causa más frecuente en el adulto, tras cirugía previa)', 'Bandas fibrosas entre asas y peritoneo', 'Antecedente de laparotomía; obstrucción del intestino delgado'],
        ['**Hernias externas** (inguinal, crural, umbilical, incisional)', 'Orificios de la pared', 'Segunda causa; siempre palpar los orificios herniarios'],
        ['**Vólvulo** de sigmoides o ciego', 'Meso largo y móvil', 'Asa “en grano de café”; anciano o constipado'],
        ['**Invaginación**', 'Un segmento entra en el siguiente (ileocólica)', 'Lactante: masa en forma de salchicha, “jalea de grosella”'],
        ['**Íleo biliar**', 'Cálculo que pasa por una fístula colecistoduodenal y se impacta en la válvula ileocecal', 'Aerobilia en la Rx; mujer mayor'],
        ['**Tumor de colon** (en el ángulo esplénico o sigmoides)', 'Segmentos más estrechos', 'Cambio del ritmo evacuatorio y anemia'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 11 (obstrucción intestinal); Galindo, Enciclopedia de Cirugía Digestiva, cap. 128 (síndromes obstructivos y seudoobstructivos).')
    u.h3('Cómo se ve la obstrucción del intestino delgado')
    L(u, 'sch_s28_p12_0.jpg', 'Radiografía de abdomen en decúbito: asas de intestino delgado dilatadas.', SCH.format(c='cap. 28 (Intestino delgado)'), ['El delgado dilatado se ubica **en el centro** del abdomen y muestra **pliegues que cruzan toda la luz** (válvulas conniventes).'], 85)
    L(u, 'sch_s28_p12_1.jpg', 'Radiografía de abdomen de pie: asas dilatadas con niveles hidroaéreos.', SCH.format(c='cap. 28 (Intestino delgado)'), ['Los **niveles hidroaéreos** (aire arriba y líquido abajo en la misma asa) indican obstrucción mecánica; compará la **cúpula diafragmática** por si hubiera aire libre.'], 95)
    L(u, 'sch_s28_p12_3.jpg', 'TC de abdomen (corte coronal): asas dilatadas por encima de una zona de transición.', SCH.format(c='cap. 28 (Intestino delgado)'), ['Se busca el **punto de transición**: asas **dilatadas** arriba y **colapsadas** abajo, que orienta a la causa (brida, hernia, tumor).'], 95)
    L(u, 'sch_s28_p27_0.jpg', 'Tránsito intestinal con bario: el contraste recorre el intestino delgado.', SCH.format(c='cap. 28 (Intestino delgado)'), ['Permite ver el **calibre y los pliegues** del yeyuno e íleon y detectar estenosis.'], 90)
    u.h3('Divertículo de Meckel')
    u.ul(['Resto del **conducto onfalomesentérico (vitelino)**; es un **divertículo verdadero** (tiene las tres capas de la pared).',
          '**Regla de los 2**: 2 % de la población, a unos **60 cm (2 pies)** de la válvula ileocecal, 2 pulgadas de largo, dos tipos de mucosa ectópica (gástrica y pancreática), síntomas antes de los 2 años.',
          'Se irriga por una rama **vitelina de la AMS**. Complicaciones: **hemorragia** (mucosa gástrica ectópica ulcera el íleon vecino), **diverticulitis** (simula una apendicitis), obstrucción y perforación.'])
    N(u, 'S-420', 'Duodeno in situ.', ['Cuatro porciones y relación con el páncreas y la mesentérica superior.'], 190)
    N(u, 'S-421', 'Mucosa y musculatura del intestino delgado.', ['Válvulas conniventes y capas de la pared.'], 190)
    N(u, 'S-428', 'Mucosa y musculatura del intestino grueso.', ['Tenias, haustras y apéndices epiploicos.'], 190)
    G(u, 179, 'Intestino delgado (Gray).', ['Yeyuno e íleon con sus mesenterios.'], 190)
    G(u, 181, 'Intestino grueso (Gray).', ['Segmentos del colon con su posición intra o retroperitoneal.'], 190)
    oral(u, 'El intestino delgado va del ángulo de **Treitz** a la válvula ileocecal. El **yeyuno** tiene válvulas conniventes altas, vasa recta largos y poca grasa; el **íleon**, más arcadas y vasos rectos cortos. El **mesenterio** nace oblicuo desde el ángulo duodenoyeyunal y baja a la fosa ilíaca derecha; ahí corre la **mesentérica superior**. En el abdomen agudo obstructivo pienso primero en **adherencias** (laparotomía previa) y **hernias externas** (siempre exploro los orificios). El **sigmoides** tiene un meso largo, por eso hace **vólvulo**; la **válvula ileocecal** es el punto más estrecho del delgado, y ahí se impacta el cálculo del **íleo biliar**. El **divertículo de Meckel** es un resto del conducto vitelino, a unos 60 cm de la válvula, y puede simular una apendicitis.')


def apendice(u):
    u.h2('Apéndice cecal y fosa ilíaca derecha: la anatomía de la apendicitis aguda', intro='La apendicitis es el tema central de la unidad. Se responde con el apéndice (posición, vasos, nervios), sus relaciones y los signos que salen de ellas.')
    u.h3('Anatomía del apéndice')
    u.ul(['**Apéndice vermiforme**: 6-10 cm de largo y 6-8 mm de diámetro. Nace en la cara **posteromedial del ciego**, 2-3 cm por debajo de la válvula ileocecal, en la **convergencia de las tres tenias cólicas**: es la guía quirúrgica para encontrarlo (se siguen las tenias hasta su unión).',
          'Tiene un **meso (mesoapéndice)** con la **arteria apendicular**, rama de la **ileocólica** (de la AMS). Es una **arteria terminal sin circulación colateral**: su trombosis por la inflamación produce **gangrena y perforación** precoz.',
          '**Venas**: vena apendicular → ileocólica → mesentérica superior → **porta** (pileflebitis y absceso hepático).',
          '**Linfáticos**: ganglios ileocólicos y mesentéricos superiores.',
          '**Inervación**: simpática visceral (**T10**, plexo mesentérico superior): dolor periumbilical. El peritoneo parietal vecino lo inervan **T12-L1** (iliohipogástrico, ilioinguinal): dolor localizado en la FID.',
          'Su capa linfoide es abundante en jóvenes: la **hiperplasia linfoide** y el **fecalito** son las causas de obstrucción de la luz.'])
    u.h3('Posiciones del apéndice y por qué cambian la clínica')
    u.tabla(['Posición', 'Frecuencia', 'Contacto', 'Clínica característica'], [
        ['**Retrocecal o retrocólica**', 'La más frecuente (~65 %)', 'Músculo **psoas**, peritoneo posterior, riñón y uréter derechos', 'Dolor en flanco o lumbar, **signo del psoas**; poca defensa abdominal; hematuria o piuria leves por vecindad'],
        ['**Pélvica**', '~30 %', 'Recto, vejiga, útero y anexo derecho; **músculo obturador interno**', '**Tacto rectal o vaginal doloroso**, diarrea, disuria, tenesmo; **signo del obturador**; poco dolor en la FID'],
        ['**Subcecal, preileal y postileal**', 'Menos frecuentes', 'Íleon terminal, pared anterior', 'Preileal: dolor típico con defensa; postileal: puede simular obstrucción'],
        ['**Subhepática (ciego alto)**', 'En el embarazo o malrotación', 'Vesícula, hígado', 'Dolor en el hipocondrio derecho; en el embarazo el útero **desplaza el ciego hacia arriba**'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 7 (apendicitis aguda), fig. 7-2 (correlación entre la ubicación del apéndice y la sintomatología); anatomía de referencia.')
    u.h3('Signos semiológicos y su base anatómica')
    u.tabla(['Signo', 'Cómo se hace', 'Base anatómica'], [
        ['**McBurney (punto)**', 'Presión en el punto de McBurney', 'Proyección de la base del apéndice'],
        ['**Blumberg**', 'Descompresión brusca dolorosa en la FID', 'Irritación del **peritoneo parietal** (nervios espinales)'],
        ['**Rovsing**', 'Palpar la fosa ilíaca **izquierda** produce dolor en la derecha', 'El gas colónico se desplaza hacia el ciego e irrita el peritoneo inflamado'],
        ['**Psoas (Cope)**', 'Extensión de la cadera derecha (decúbito lateral izquierdo) o flexión contra resistencia', 'El apéndice **retrocecal** está en contacto con el **psoas ilíaco** (nervio femoral y plexo lumbar L2-L4)'],
        ['**Obturador**', 'Rotación interna de la cadera con el muslo flexionado', 'El apéndice **pélvico** toca el **obturador interno** (nervio obturador L2-L4)'],
        ['**Tacto rectal o vaginal**', 'Dolor en el fondo de saco derecho', 'Apéndice pélvico o **absceso en el Douglas**'],
        ['**Dunphy**', 'Dolor al toser', 'Irritación peritoneal parietal'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 4 (examen físico), figs. 4-4 y 4-5 (signos del psoas y del obturador).')
    u.h3('Apendicectomía: planos y puntos críticos')
    u.ul(['**Abierta** por incisión de McBurney o de Rockey-Davis: se atraviesan los tres músculos anchos **siguiendo sus fibras** (sin cortarlos), la fascia transversalis y el peritoneo. Se identifican las **tenias**, se exterioriza el apéndice, se liga el **mesoapéndice con la arteria apendicular** y se secciona la base (con ligadura o invaginación).',
          '**Laparoscópica**: tres trócares; permite diagnóstico diferencial (mujer joven, ginecología).',
          '**Peligros anatómicos**: nervios iliohipogástrico e ilioinguinal en la herida; en la disección retrocecal, el **uréter derecho**, los **vasos ilíacos** y el **psoas**.'])
    L(u, 'sch_s30_p13_0.jpg', 'Apendicectomía laparoscópica: posición del paciente, del cirujano y de los ayudantes en el quirófano.', SCH.format(c='cap. 30 (El apéndice)'), ['El cirujano se ubica **del lado opuesto** al apéndice (a la izquierda del paciente) y el monitor **a la derecha**, para trabajar en la fosa ilíaca derecha.'], 90)
    L(u, 'sch_s30_p14_0.jpg', 'Vista laparoscópica: disección del apéndice y su mesoapéndice.', SCH.format(c='cap. 30 (El apéndice)'), ['El apéndice se sigue **desde la base cecal** (donde convergen las tenias del ciego) y se identifica la **arteria apendicular** en el mesoapéndice.'], 85)
    L(u, 'sch_s30_p14_1.jpg', 'Vista laparoscópica: sección del mesoapéndice con una pinza sellante.', SCH.format(c='cap. 30 (El apéndice)'), ['Se controla el **pedículo vascular** antes de seccionar la base del apéndice (nudos, grapas o endoloops).'], 85)
    u.h3('Complicaciones y su relación anatómica')
    u.tabla(['Complicación', 'Mecanismo', 'Dónde'], [
        ['**Perforación y peritonitis**', 'Gangrena por trombosis de la arteria apendicular', 'Cavidad libre; en niños y ancianos es más rápida (epiplón corto y menos defensa)'],
        ['**Plastrón apendicular**', 'El **epiplón mayor** y las asas bloquean la inflamación', 'Masa palpable en la FID'],
        ['**Absceso apendicular**', 'Colección alrededor del apéndice', 'FID, **fondo de saco de Douglas** (pelviano), subfrénico (raro)'],
        ['**Pileflebitis y absceso hepático**', 'Propagación por la vena apendicular → porta', 'Hígado'],
        ['**Obstrucción intestinal**', 'Bridas o íleo adinámico', 'Intestino delgado'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 7; Giménez, Cirugía, 2.ª ed., cap. 70.')
    u.box('clin', 'Tumores del apéndice', [['**Tumor neuroendocrino (carcinoide)**: es el más frecuente; suele estar en la **punta**, se descubre como hallazgo en una apendicectomía. Menor de 1 cm: apendicectomía; mayor de 2 cm o con compromiso de la base: **hemicolectomía derecha**.',
                                           '**Mucocele y neoplasia mucinosa**: dilatación quística del apéndice; riesgo de **pseudomixoma peritoneal** si se rompe. No se debe romper al extraerlo.',
                                           'Estudio: ecografía y tomografía; la conducta depende del tamaño, la histología y el compromiso de la base.']])
    N(u, 'S-425', 'Unión ileocecal.', ['Válvula ileocecal, ciego y apéndice con su mesoapéndice y la arteria apendicular; recesos ileocecales y retrocecal.'], 195)
    N(u, 'S-426', 'Ciego y orificio ileal.', ['Tenias, haustras y apéndice en su implantación; **la convergencia de las tenias** guía al cirujano.'], 190)
    G(u, 183, 'Unión ileocecal (Gray).', ['Válvula, ciego y apéndice: posición y relaciones.'], 190)
    oral(u, 'El apéndice nace en la cara posteromedial del ciego, **donde convergen las tres tenias**, y su irrigación es la **arteria apendicular** (rama de la ileocólica, de la AMS), **terminal y sin colaterales**: si se trombosa, se gangrena. El dolor comienza en el **ombligo (T10)** por distensión y migra a la **FID** cuando el peritoneo parietal se inflama. La posición cambia la clínica: **retrocecal** (la más frecuente) da signo del **psoas** y poca defensa; **pélvica**, tacto rectal doloroso y **signo del obturador**, diarrea y disuria. Los signos de **Blumberg**, **Rovsing** y **McBurney** se explican por el peritoneo parietal y el gas colónico. Las complicaciones son la **perforación**, el **plastrón**, el **absceso** (FID o Douglas) y la **pileflebitis** por la porta. Se opera por una incisión de McBurney o Rockey-Davis, separando las fibras de los tres músculos, ligando el mesoapéndice con la arteria apendicular. El tumor más frecuente es el **carcinoide** de la punta.')


def diferencial(u):
    u.h2('Síndrome doloroso de la fosa ilíaca derecha: diagnóstico diferencial por anatomía', intro='Cada estructura que está en la FID puede producir dolor. Recorrerlas ordenadamente es la mejor forma de armar el diagnóstico diferencial del oral.')
    u.tabla(['Estructura', 'Cuadro', 'Clave anatómica o clínica'], [
        ['**Íleon terminal**', '**Enfermedad de Crohn**, ileítis por Yersinia, tuberculosis intestinal', 'Dolor subagudo, diarrea, masa en la FID; la válvula ileocecal es el sitio más afectado'],
        ['**Ciego y colon derecho**', 'Tiflitis, diverticulitis cecal, neoplasia perforada', 'Adulto mayor; anemia, cambio del ritmo evacuatorio'],
        ['**Divertículo de Meckel**', 'Diverticulitis, hemorragia', 'Joven, simula apendicitis; se lo encuentra en cirugía'],
        ['**Uréter derecho**', '**Cólico renal**: cálculo', 'Tres sitios de estrechez: unión pieloureteral, **cruce con los vasos ilíacos** y unión ureterovesical. Irradia a la ingle y al testículo; hematuria'],
        ['**Ovario y trompa derechos**', 'Quiste roto o hemorrágico, **torsión de anexo**, **embarazo ectópico**, enfermedad pélvica inflamatoria, dolor de la ovulación', 'La **arteria ovárica** nace de la aorta; la torsión compromete el pedículo (ligamento **infundibulopélvico**). **Siempre pedir β-hCG** en la mujer en edad fértil'],
        ['**Psoas**', 'Absceso o hematoma del psoas', 'Dolor al extender la cadera; fiebre; origen: espondilodiscitis, Crohn'],
        ['**Pared abdominal**', 'Hematoma de la vaina del recto, hernia crural o inguinal incarcerada', 'Palpar los orificios herniarios; dolor localizado en la pared'],
        ['**Ganglios mesentéricos**', 'Adenitis mesentérica', 'Niño con faringitis previa; dolor sin defensa franca'],
        ['**Testículo**', 'Torsión testicular', 'Dolor **referido** a la FID en el niño: **siempre examinar los genitales**'],
        ['**Vesícula o duodeno** (gotera parietocólica)', 'Colecistitis o úlcera perforada que “baja” por la gotera derecha', 'Antecedente epigástrico; neumoperitoneo'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 70 y cap. 84; Azato y Waisman, Abdomen agudo, capítulos de apendicitis y de abdomen agudo ginecológico; anatomía de referencia (Netter, láminas S-463, S-487 y S-507).')
    u.box('alerta', 'Por sexo y edad', [['**Niño**: adenitis mesentérica, invaginación, Meckel, apendicitis perforada precoz.',
                                         '**Mujer en edad fértil**: embarazo ectópico, quiste, torsión de anexo, EPI; **β-hCG y ecografía pélvica**.',
                                         '**Adulto mayor**: diverticulitis, neoplasia de ciego, isquemia, hernia estrangulada; presentación atípica con poca fiebre y poca defensa.']])
    u.h3('Atlas: estructuras de la FID y la pelvis')
    N(u, 'S-463', 'Uréteres en el abdomen y la pelvis.', ['Trayecto sobre el psoas, cruce con los vasos ilíacos y las tres estrecheces (pieloureteral, cruce ilíaco y vesicoureteral).'], 195)
    N(u, 'S-487', 'Útero y anexos.', ['Trompa (porción ampular: la más frecuente en el embarazo ectópico), ovario y ligamentos.'], 190)
    N(u, 'S-507', 'Arterias de la pelvis: mujer.', ['Arteria ovárica (de la aorta) y rama ovárica de la uterina: doble irrigación del ovario.'], 190)
    G(u, 253, 'Sistema reproductor femenino (Gray).', ['Relaciones de útero, trompas y ovarios con el peritoneo y el fondo de saco de Douglas.'], 190)
    G(u, 254, 'Útero y ovarios (Gray).', ['Ligamento infundibulopélvico (vasos ováricos), ligamento propio del ovario y ligamento ancho.'], 190)
    N(u, 'S-277', 'Músculos psoas e ilíaco.', ['El psoas ilíaco pasa por detrás del ciego y apéndice; su irritación produce el signo del psoas.'], 190)
    N(u, 'S-116', 'Nervio obturador.', ['Recorrido sobre el obturador interno: el apéndice pélvico lo irrita (signo del obturador).'], 190)
    N(u, 'S-104', 'Plexos lumbosacro y coccígeo.', ['Femoral y obturador (L2-L4) y genitofemoral: dolor referido a la ingle y el muslo.'], 190)
    N(u, 'S-219', 'Pared posterior del abdomen: visión interna.', ['Psoas, cuadrado lumbar, riñones y uréteres: relaciones del apéndice retrocecal.'], 190)
    oral(u, 'Frente a un dolor en la FID recorro las estructuras que hay ahí: el **apéndice**, el **íleon terminal** (Crohn, Yersinia), el **ciego** (diverticulitis, tumor), el **divertículo de Meckel**, el **uréter derecho** (cólico renal: cruza los vasos ilíacos), el **ovario y la trompa** (quiste, torsión, **embarazo ectópico**, EPI), el **psoas** (absceso), la **pared** (hematoma de la vaina del recto, hernias) y los **ganglios mesentéricos** en el niño. Según el sexo y la edad: en la mujer joven siempre **β-hCG y ecografía pélvica**; en el niño, adenitis mesentérica, invaginación o Meckel; en el adulto mayor, diverticulitis, tumor, isquemia y hernia estrangulada, con presentaciones atípicas. Ante la duda, la imagen y, si hace falta, la laparoscopia diagnóstica.')


def imagenes(u):
    u.h2('Anatomía radiológica del abdomen agudo (trabajo práctico de la unidad)', intro='El trabajo práctico es “Diagnóstico por Imágenes en el Abdomen Agudo”. Para elegir el estudio hay que saber qué se ve normal y qué se ve patológico.')
    u.h3('Qué estudio según el cuadro')
    u.tabla(['Cuadro', 'Primer estudio', 'Hallazgo característico'], [
        ['**Perforativo** (úlcera, divertículo)', '**Radiografía de tórax de pie** o abdomen de pie / decúbito lateral', '**Neumoperitoneo**: aire bajo las cúpulas diafragmáticas'],
        ['**Obstructivo**', 'Radiografía de abdomen de pie y acostado; **TC** si hay dudas', 'Asas dilatadas con **niveles hidroaéreos**; falta de gas distal'],
        ['**Inflamatorio** (apendicitis, colecistitis, diverticulitis)', '**Ecografía** (niños, embarazadas, mujer joven) o **TC con contraste**', 'Apéndice no compresible mayor de 6 mm; engrosamiento parietal, **grasa periapendicular** aumentada de densidad, apendicolito'],
        ['**Vascular** (isquemia mesentérica)', '**Angio-TC**', 'Oclusión de la AMS, neumatosis o gas portal en etapas avanzadas'],
        ['**Ginecológico** (ectópico, torsión de anexo)', '**β-hCG** y **ecografía transvaginal**', 'Líquido libre en el Douglas, masa anexial, ausencia de flujo en el Doppler'],
    ], fuente='Azato y Waisman, Abdomen agudo, cap. 5 (exámenes complementarios); Giménez, Cirugía, 2.ª ed., cap. 84; Galindo, Enciclopedia de Cirugía Digestiva, cap. 118 (ecografía del aparato digestivo).')
    u.h3('Radiografía simple: cómo distinguir el delgado del colon')
    u.tabla(['', 'Intestino delgado', 'Colon'], [
        ['**Ubicación**', 'Central', 'Periférica (marco)'],
        ['**Pliegues**', '**Válvulas conniventes** que cruzan **toda la luz** (“pila de monedas”)', '**Haustras** que no cruzan toda la luz'],
        ['**Calibre patológico**', 'Mayor de 3 cm', 'Mayor de 6 cm (ciego mayor de 9 cm)'],
    ], fuente='Abdominal X-Rays Made Easy; Azato y Waisman, Abdomen agudo, cap. 5.')
    u.ul(['**Neumoperitoneo**: aire bajo las cúpulas en la Rx de tórax de pie; en decúbito lateral izquierdo, aire entre el hígado y la pared. En una Rx supina: **signo de Rigler** (se ven ambas caras de la pared intestinal) y **signo del ligamento falciforme**.',
          '**Borramiento de la línea del psoas**: inflamación retroperitoneal. **Asa centinela**: un asa dilatada cerca de un foco inflamatorio (pancreatitis, apendicitis).',
          '**Fecalito** radiopaco en la FID: indica apendicitis en un cuadro compatible. **Aerobilia**: íleo biliar o fístula bilioentérica.'])
    u.h3('Imágenes del libro de la unidad (radiografías)')
    L(u, 'ax_neumoperitoneo_rx.png', 'Neumoperitoneo: radiografía de tórax de pie con aire bajo la cúpula diafragmática derecha.', 'Abdominal X-Rays Made Easy, cap. 4 (neumoperitoneo).', ['El aire libre sube a la zona más alta: bajo el diafragma en la posición de pie.'], 85)
    L(u, 'ax_falciforme_rx.png', 'Neumoperitoneo en una radiografía supina: signo del ligamento falciforme.', 'Abdominal X-Rays Made Easy, cap. 4 (neumoperitoneo).', ['Aire a ambos lados del ligamento falciforme.'], 85)
    L(u, 'az_neumoperitoneo_ulcera.png', 'Úlcera perforada: radiografía de abdomen de pie con neumoperitoneo.', 'Azato y Waisman, Abdomen agudo, cap. 8, fig. 8-1.', ['Aire libre bajo ambos hemidiafragmas.'], 85)
    u.h3('Atlas: tomografía y técnicas de imagen')
    N(u, 'S-547', 'Radiología abdominal: TC axiales.', ['Reconocé hígado, bazo, páncreas, riñones, aorta y cava en los cortes axiales.'], 195)
    N(u, 'S-548', 'Radiología abdominal: TC axiales (continuación).', ['Asas del delgado y colon; ciego y apéndice en los cortes bajos.'], 195)
    G(u, 184, 'Tubo digestivo: técnicas de imagen (Gray).', ['Estudios contrastados: cómo se ven el estómago, el delgado y el colon.'], 190)
    oral(u, 'Elijo el estudio según el cuadro. Si sospecho **perforación**, radiografía de tórax de pie: busco **neumoperitoneo** bajo las cúpulas. Si es **obstructivo**, radiografía de abdomen de pie y acostado: diferencio el **delgado** (central, **válvulas conniventes** que cruzan toda la luz) del **colon** (periférico, **haustras**); la TC define la causa. Si es **inflamatorio**, ecografía en niños, embarazadas y mujeres jóvenes (apéndice **no compresible mayor de 6 mm**) y **TC con contraste** en el adulto (engrosamiento parietal, aumento de densidad de la grasa periapendicular, apendicolito). Si sospecho **isquemia mesentérica**, **angio-TC**. En la mujer en edad fértil siempre **β-hCG** y **ecografía pélvica**.')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una une anatomía con las patologías de la unidad.')
    qa = [
        ('¿Por qué el dolor de la apendicitis empieza en el ombligo y después se localiza en la fosa ilíaca derecha?',
         'El apéndice deriva del **intestino medio**; su inervación visceral llega a **T10** por el plexo mesentérico superior y el dolor se proyecta al **ombligo**: es sordo y difuso. Cuando la inflamación llega a la serosa y toca el **peritoneo parietal** de la FID, que tiene **inervación espinal** (T12-L1), el dolor se vuelve agudo y localizado.'),
        ('¿Cuál es la irrigación del apéndice y por qué se gangrena con facilidad?',
         'La **arteria apendicular**, rama de la **ileocólica** (de la mesentérica superior), corre por el mesoapéndice. Es una **arteria terminal sin circulación colateral**: la inflamación y la distensión la comprimen o trombosan y el apéndice se necrosa, con riesgo de perforación.'),
        ('Un paciente con apendicitis tiene dolor lumbar y signo del psoas positivo. ¿Dónde está el apéndice?',
         'En posición **retrocecal**, en contacto con el **psoas ilíaco** (plexo lumbar y femoral, L2-L4); la extensión de la cadera lo estira y duele. En esta posición hay poca defensa abdominal.'),
        ('¿Qué es el signo del obturador y qué indica?',
         'Dolor al **rotar internamente la cadera con el muslo flexionado**. Indica un apéndice **pélvico** en contacto con el **obturador interno** (nervio obturador, L2-L4); suele haber tacto rectal doloroso y síntomas urinarios o diarrea.'),
        ('¿Por qué una úlcera duodenal perforada puede simular una apendicitis?',
         'Porque el contenido gastroduodenal desciende por la **gotera parietocólica derecha** desde el espacio subhepático hasta la **fosa ilíaca derecha** y la pelvis. Hay antecedente epigástrico y **neumoperitoneo** en la Rx de tórax de pie.'),
        ('¿Dónde se forma un absceso después de una apendicitis perforada?',
         'En la FID alrededor del ciego y, en la pelvis, en el **fondo de saco de Douglas** (punto más declive), que se palpa por **tacto rectal o vaginal**. Menos frecuente: subfrénico.'),
        ('Un anciano con fibrilación auricular tiene dolor abdominal intenso con abdomen blando. ¿Qué pensás y qué arteria?',
         '**Isquemia mesentérica aguda** por **embolia de la AMS**. El émbolo se aloja distal a la **cólica media**, por lo que se respetan el duodeno y el yeyuno proximal. Diagnóstico con **angio-TC**; urgencia quirúrgica.'),
        ('¿Cuál es la hernia que más se estrangula y por qué?',
         'La **crural (femoral)**: pasa por el anillo crural, **por debajo del ligamento inguinal y medial a la vena femoral**, un orificio rígido y estrecho (ligamentos inguinal, pectíneo y lacunar). Es más frecuente en mujeres mayores.'),
        ('Mujer de 25 años con dolor en la FID: ¿qué estudios y qué diagnósticos?',
         'Siempre **β-hCG y ecografía pélvica**: embarazo ectópico, quiste roto o hemorrágico, torsión de anexo, EPI. Además apendicitis (TC o eco), cólico renal y Crohn. Si hay duda, laparoscopia diagnóstica.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025), Editorial Médica Panamericana: cap. 70 (apendicitis aguda) y cap. 84 (abdomen agudo quirúrgico).',
          'Galindo, F. __Enciclopedia de Cirugía Digestiva__ (2020), Sociedad Argentina de Cirugía Digestiva: caps. 118 (ecografía), 128 (síndromes obstructivos) y 304 (patología quirúrgica del apéndice cecal).',
          'Azato, F. y Waisman, H. __Abdomen agudo__: fisiopatología del dolor, examen físico, apendicitis, obstrucción e isquemia (figuras reproducidas con fuente).',
          'Abdominal X-Rays Made Easy: radiografías de neumoperitoneo.',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: peritoneo, intestino delgado y apéndice cecal.'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. La lámina de Netter o de Gray muestra la **anatomía real**: ante cualquier duda, **la lámina manda**. La parte de **estrés preoperatorio** de la unidad no tiene contenido anatómico y se estudia con Giacomantone y Mejía.')
    u.h3('Imágenes en blanco y negro')
    u.ul(['Las **radiografías** de los libros se incluyen porque no existen en color; se cita el libro y la figura.'])
