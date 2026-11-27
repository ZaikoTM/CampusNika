# -*- coding: utf-8 -*-
"""UP 10 · Parte B: miembro superior y accesos para hemodiálisis, venas, pie diabético, trauma arterial y endovascular."""
from .up01e import N, G, L, oral
from .up10a import S, SCH


def miembro_superior(u):
    u.h2('Miembro superior: arterias, síndrome del desfiladero, Raynaud y fístula arteriovenosa', intro='El miembro superior se estudia por dos motivos en la unidad: las **enfermedades de las arterias distales** (Buerger, Raynaud) y el **acceso vascular para hemodiálisis**.')
    N(u, 'S-331', 'Arterias del miembro superior.', ['**Subclavia → axilar → braquial → radial y cubital → arcos palmares**.', 'La **bifurcación braquial** (fosa antecubital) es el sitio del émbolo; la **radial** en la muñeca es el sitio de la **fístula**.'], 205)
    N(u, 'S-332', 'Venas del miembro superior.', ['**Cefálica** (lateral) y **basílica** (medial): las venas de la fístula; la **mediana del antebrazo** une ambas.'], 205)
    u.h3('Buerger, Raynaud y desfiladero torácico')
    u.tabla(['Enfermedad', 'Quién y qué', 'Clave'], [
        ['**Tromboangeítis obliterante (Buerger)**', '**Varón joven fumador**; inflamación de arterias **distales** de manos y pies', '**Claudicación del arco plantar**, flebitis migratoria, úlceras digitales; **abandonar el tabaco** es el único tratamiento eficaz'],
        ['**Fenómeno de Raynaud**', 'Mujer joven; vasoespasmo por frío o estrés: **blanco → azul → rojo**', 'Primario (benigno) o **secundario** (esclerodermia, lupus); bloqueantes cálcicos'],
        ['**Síndrome del desfiladero torácico**', 'Compresión del **plexo braquial**, de la **arteria o la vena subclavia** entre la clavícula, la primera costilla y los escalenos (a veces **costilla cervical**)', 'Parestesias y dolor del miembro con los brazos elevados; la compresión venosa produce la **trombosis de esfuerzo (Paget-Schroetter)**'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 16 y 17; Schwartz, 10.ª ed., cap. 23.')
    u.box('clave', 'Conectá con la UP1', 'El **plexo braquial**, la **arteria axilar** y el **síndrome del desfiladero** están desarrollados en el atlas de la **UP1** (hombro, axila y plexo). Acá solo se retoma la **vía vascular** y los accesos.')
    u.h3('Fístula arteriovenosa para hemodiálisis')
    u.ul(['**Acceso de elección** en la insuficiencia renal crónica: une una **arteria con una vena** para que se **arterialice** (se dilata y engrosa) y soporte las punciones.',
          '**Brescia-Cimino**: **arteria radial con vena cefálica** en la muñeca (la primera opción); luego **braquiocefálica** (arteria braquial y vena cefálica en el codo) y **braquiobasílica**.',
          'Se prefiere el **miembro no dominante** y se **preserva** el sistema venoso del brazo: **no se punciona ni se coloca catéter en la vena cefálica** del miembro elegido; antes se verifica el **arco palmar** (prueba de Allen).',
          '**Maduración**: 6 a 8 semanas. **Regla de los 6**: flujo mayor de 600 mL/min, diámetro mayor de 6 mm y profundidad menor de 6 mm.',
          'Alternativas: **injerto protésico** (PTFE) o **catéter tunelizado** (yugular interna derecha) cuando no hay vasos adecuados.'])
    u.tabla(['Complicación', 'Qué pasa'], [
        ['**Trombosis** del acceso', 'La más frecuente; pérdida del **frémito** (thrill)'],
        ['**Síndrome de robo**', 'La fístula “roba” flujo de la **mano**: frialdad, dolor y úlceras distales'],
        ['**Hipertensión venosa** y **estenosis central**', 'Edema del brazo por estenosis de la subclavia (catéter previo)'],
        ['**Aneurisma y seudoaneurisma**', 'Por punciones repetidas'],
        ['**Insuficiencia cardíaca de alto gasto**', 'En fístulas muy grandes'],
        ['**Infección**', 'Sobre todo en injertos y catéteres'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 89 (cirugía endovascular); Schwartz, 10.ª ed., cap. 23.')
    oral(u, 'El acceso de elección para hemodiálisis es la **fístula arteriovenosa autóloga**: la primera opción es la **radiocefálica (Brescia-Cimino)** en la muñeca, en el miembro **no dominante**. Se verifica antes el **arco palmar** con la prueba de Allen y se **preserva la vena cefálica** de punciones. Madura en **6 a 8 semanas**. La complicación más frecuente es la **trombosis** y la más característica, el **síndrome de robo** (isquemia de la mano). La **tromboangeítis de Buerger** afecta al **varón joven fumador** y el **Raynaud** da cambios de color blanco, azul y rojo.', 'Así lo decís en el oral: miembro superior y fístula')


def venas(u):
    u.h2('Venas de los miembros inferiores: varices, insuficiencia venosa, úlcera, TVP y TEP', intro='La anatomía venosa es la **clave** de toda la patología: los tres sistemas (superficial, profundo y perforantes), las **válvulas** y la **bomba muscular**. Cada ítem de cirugía de várices (crosectomía, stripping) es una pregunta de anatomía.')
    N(u, 'S-334', 'Venas del miembro inferior.', ['**Safena magna** (cara medial) y **parva** (cara posterior) del sistema **superficial**; **femoral, poplítea y tibiales** del profundo.'], 205)
    N(u, 'S-335', 'Venas de la pierna.', ['**Perforantes** que conectan el sistema superficial con el profundo y **válvulas** que dirigen el flujo hacia el corazón.'], 205)
    u.tabla(['Sistema', 'Venas', 'Dato clave'], [
        ['**Superficial**', '**Safena magna** y **safena parva** y sus tributarias', 'Trasporta el **10 %** de la sangre; es el que se varicosa'],
        ['**Profundo**', 'Tibiales, **poplítea**, **femoral** (superficial y profunda), ilíacas', 'Trasporta el **90 %**; es el de la **trombosis venosa profunda**'],
        ['**Perforante**', '**Cockett** (cara medial de la pierna), **Boyd** (rodilla), **Hunter** (muslo)', 'Con válvulas **incompetentes** transmiten la presión al sistema superficial: **úlcera**'],
    ], fuente='Netter, láminas S-334 y S-335; Michans, Cirugía, 5.ª ed., cap. 50 (Venas).')
    u.ul(['**Safena magna**: nace en el **arco venoso dorsal medial**, pasa **por delante del maléolo medial**, sube por la cara medial de la pierna y el muslo y **desemboca en la vena femoral** en la **fosa oval** (**crossa** o cayado), a **3-4 cm por debajo y por fuera del tubérculo del pubis**. Allí recibe varias **tributarias** (epigástrica superficial, circunfleja ilíaca superficial, pudendas externas, safena accesoria).',
          '**Safena parva**: sube por la **cara posterior de la pantorrilla**, detrás del **maléolo lateral**, y desemboca en la **vena poplítea** (**unión safenopoplítea**) en la fosa poplítea, junto al **nervio sural**.',
          '**Nervios acompañantes**: el **safeno** (con la safena magna, por debajo de la rodilla) y el **sural** (con la safena parva). Se **lesionan** en el *stripping* (parestesias en la cara medial de la pierna y el pie, o en el borde lateral del pie).'])
    S(u, 's24_p2_0', 'Várices de la safena magna en el muslo y la pierna.', 'cap. 24 (Enfermedad venosa y linfática)', ['Venas dilatadas y tortuosas: el sistema superficial incompetente.'], 90)
    u.h3('Insuficiencia venosa crónica y úlcera venosa')
    S(u, 's24_p3_0', 'Insuficiencia venosa crónica: edema, hiperpigmentación y cambios de la piel en la pierna.', 'cap. 24 (Enfermedad venosa y linfática)', ['El **edema** y la **pigmentación por hemosiderina** se ubican en el **tercio inferior** de la pierna.'], 90)
    S(u, 's24_p3_1', 'Úlcera venosa en el tobillo.', 'cap. 24 (Enfermedad venosa y linfática)', ['Localizada en la **cara medial del tobillo** (zona de las perforantes de **Cockett**), con **bordes irregulares** y piel pigmentada alrededor.'], 90)
    u.tabla(['Úlcera', 'Dónde', 'Aspecto', 'Dolor y pulsos'], [
        ['**Venosa**', '**Maléolo medial** (tercio inferior de la pierna)', 'Superficial, bordes irregulares, **hiperpigmentación** y **lipodermatoesclerosis**', 'Poco dolor, **pulsos presentes**, mejora con la elevación'],
        ['**Arterial**', 'Dedos, **talón**, maléolo lateral, zonas de presión', 'Profunda, **“en sacabocado”**, pálida, sin tejido de granulación', '**Muy dolorosa**, pulsos ausentes, piel fría'],
        ['**Neuropática (diabético)**', '**Planta**: cabeza del 1.er metatarsiano y talón', 'Callo alrededor, profunda, indolora', 'Pérdida de sensibilidad, pulsos presentes o no'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 20; Schwartz, 10.ª ed., caps. 23 y 24.')
    u.h3('Clasificación CEAP')
    u.tabla(['Clase', 'Hallazgo'], [
        ['**C0**', 'Sin signos visibles'],
        ['**C1**', '**Telangiectasias** y venas reticulares'],
        ['**C2**', '**Várices**'],
        ['**C3**', '**Edema**'],
        ['**C4**', 'Cambios en la piel (**hiperpigmentación, eccema, lipodermatoesclerosis**)'],
        ['**C5**', 'Úlcera **cicatrizada**'],
        ['**C6**', 'Úlcera **activa**'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 20.')
    u.ul(['**Tratamiento**: **compresión elástica** (base de todo, salvo isquemia arterial), elevación, ejercicio; **escleroterapia, ablación endovenosa (láser o radiofrecuencia)** o **cirugía** (crosectomía con ligadura de la crossa y *stripping* de la safena, flebectomías).',
          '**Complicaciones de las várices**: **tromboflebitis superficial**, hemorragia (**várice rota**), úlcera venosa y dermatitis de estasis.',
          '**Maniobra de Trendelenburg y de Perthes**: valoran la competencia de la safena y de las perforantes.'])
    u.h3('Trombosis venosa profunda y tromboembolismo pulmonar')
    S(u, 's24_p6_0', 'Trombosis venosa profunda: miembro inferior izquierdo edematoso, con aumento de volumen y eritema.', 'cap. 24 (Enfermedad venosa y linfática)', ['El miembro afectado está **más grueso** (se mide el perímetro a 10 cm de la tuberosidad tibial), **caliente** y doloroso.'], 90)
    S(u, 's24_p6_3', 'Ecografía de compresión de la vena femoral: la vena trombosada no se colapsa.', 'cap. 24 (Enfermedad venosa y linfática)', ['Se comprime con el transductor: la **vena normal se aplana**; la que tiene un trombo **no se deja comprimir** (el signo diagnóstico de la TVP).'], 95)
    u.ul(['**Tríada de Virchow**: **estasis venosa, lesión endotelial e hipercoagulabilidad**. Factores: cirugía mayor, inmovilización, cáncer, embarazo, anticonceptivos, trombofilia.',
          '**Localización**: sobre todo **vena iliofemoral y femoral**. La **TVP izquierda es más frecuente** por el **síndrome de May-Thurner** (la **vena ilíaca común izquierda** queda comprimida por la **arteria ilíaca común derecha**).',
          '**Flegmasia cerulea dolens**: TVP masiva con edema y cianosis que compromete la **perfusión arterial** (urgencia).',
          '**Diagnóstico**: probabilidad clínica (**Wells**), **dímero D** (descarta si es bajo) y **ecografía Doppler**.',
          '**Tratamiento**: **anticoagulación** (heparina de bajo peso molecular y luego anticoagulantes orales) por **3 meses** o más; **filtro de vena cava** solo si hay contraindicación a la anticoagulación o falla.',
          '**TEP**: el **émbolo viaja por la cava, el corazón derecho y la arteria pulmonar**: disnea, dolor pleurítico, taquicardia, hipoxemia; angio-TC de tórax.'])
    S(u, 's24_p12_0', 'Angio-TC de tórax: defectos de relleno en las arterias pulmonares (flechas) = tromboembolismo pulmonar.', 'cap. 24 (Enfermedad venosa y linfática)', ['El **émbolo** aparece como una imagen **negra** (sin contraste) dentro de las arterias pulmonares, que quedan blancas.'], 100)
    u.h3('Vena femoral y síndrome postrombótico')
    u.ul(['**Vena femoral común**: en el triángulo femoral queda **medial a la arteria** (orden lateral a medial: **N**ervio, **A**rteria, **V**ena, y por dentro los linfáticos); se punciona **medial al pulso**. La **safena magna** desemboca en ella.',
          '**Síndrome postrombótico**: después de una TVP, el trombo daña las **válvulas** y la vena queda **insuficiente u obstruida**: **edema crónico, dolor, hiperpigmentación y úlcera** (CEAP C3-C6). La **compresión elástica** disminuye su frecuencia.',
          '**Filtro de vena cava inferior**: se coloca **infrarrenal** (por debajo de las renales) y atrapa émbolos que viajan desde los miembros; se usa solo si hay contraindicación a anticoagular.'])
    u.h3('Sistema linfático del miembro inferior')
    N(u, 'S-347', 'Vasos y nódulos linfáticos del miembro inferior.', ['La **linfa** acompaña a las venas superficiales y profundas; los nódulos **inguinales** son los primeros en agrandarse.', 'Relacionalo con el **linfedema** (edema duro que no deja fóvea ni mejora con la elevación).'], 205)
    S(u, 's24_p20_0', 'Linfedema crónico de ambos miembros inferiores.', 'cap. 24 (Enfermedad venosa y linfática)', ['El edema afecta también el **dorso del pie** (signo de **Stemmer**: no se puede pellizcar la piel del segundo dedo).'], 90)
    u.ul(['**Drenaje**: los linfáticos **superficiales** acompañan a la safena magna y drenan a los **ganglios inguinales superficiales**; los **profundos** acompañan a los vasos femorales y drenan a los **ganglios poplíteos e inguinales profundos**, y de ahí a los ganglios **ilíacos y paraaórticos**.',
          '**Linfedema primario** (malformación del sistema linfático, desde la infancia o la adolescencia) y **secundario** (cirugía y radioterapia pelviana, tumores, **filariasis**, infección). El edema es **duro**, **no deja fóvea** de forma tardía, afecta el **dorso del pie** y **no mejora con la elevación**.',
          '**Linfangitis y erisipela**: infección de la piel y de los linfáticos con **estrías rojas** que siguen el trayecto y **adenopatía inguinal** dolorosa; es frecuente en el linfedema y en la **tiña interdigital** (puerta de entrada).',
          '**Tratamiento**: **drenaje linfático manual, compresión** y cuidado de la piel; la cirugía se reserva para casos seleccionados.'])
    oral(u, 'La **safena magna** nace en el arco venoso dorsal medial, pasa **por delante del maléolo medial**, sube por la cara medial del muslo y **desemboca en la femoral en la fosa oval** (crossa), 3-4 cm por debajo y por fuera del tubérculo del pubis; la **safena parva** sube por la pantorrilla y desemboca en la **poplítea**. Las **perforantes** (Cockett, Boyd, Hunter) comunican el sistema superficial con el profundo; cuando sus válvulas fallan se produce la **úlcera venosa** en el **maléolo medial**. La cirugía de várices (crosectomía y *stripping*) puede lesionar el **nervio safeno** o el **sural**. La **TVP** es más frecuente en el lado **izquierdo** (**May-Thurner**); se trata con **anticoagulación** y el **TEP** es su complicación mortal.', 'Así lo decís en el oral: venas')


def pie(u):
    u.h2('Pie diabético: arterias del pie, angiosomas, úlceras y niveles de amputación', intro='El pie diabético mezcla **tres anatomías**: la **arterial** (angiopatía), la **nerviosa** (neuropatía) y la de los **compartimentos y vainas** por donde viaja la infección.')
    N(u, 'S-292', 'Dorso del pie: músculos profundos y arterias.', ['La **arteria dorsal del pie (pedia)** continúa a la tibial anterior y se hunde en el **primer espacio** para formar el **arco plantar**.'], 205)
    N(u, 'S-297', 'Pie: músculos interóseos y arterias profundas.', ['**Arco plantar profundo** (de la pedia y la plantar lateral) y las **arterias metatarsianas**.'], 205)
    N(u, 'S-293', 'Planta del pie: disección superficial.', ['**Aponeurosis plantar** y sus **tres compartimentos** (medial, central y lateral): una infección sigue la **vaina de los tendones flexores** y se extiende al **espacio central**.'], 205)
    N(u, 'S-291', 'Dorso del pie: músculos y tendones superficiales.', ['Tendones extensores y relación con el pulso pedio.'], 190)
    u.tabla(['Componente', 'Mecanismo', 'Consecuencia'], [
        ['**Neuropatía** (sensitiva, motora y autonómica)', 'Pérdida de la sensibilidad protectora y **deformidad** por debilidad de los intrínsecos (dedos en garra); anhidrosis y fisuras', '**Úlcera plantar** bajo los puntos de presión: **cabeza del 1.er metatarsiano** y **talón**; **artropatía de Charcot**'],
        ['**Angiopatía** (enfermedad arterial)', 'Oclusión de las **arterias infrapoplíteas** (tibiales y peronea) con arterias de la media **calcificadas**', 'Mala cicatrización; **isquemia crítica**; ITB falsamente elevado'],
        ['**Infección**', 'Se propaga por los **compartimentos plantares** y las vainas tendinosas', '**Absceso plantar profundo**, osteomielitis, **gangrena** (urgencia: drenaje)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 17; Schwartz, 10.ª ed., cap. 23.')
    S(u, 's23_p48_1', 'Isquemia crítica de los dedos del pie: cianosis y necrosis (fotografía en blanco y negro).', 'cap. 23 (Enfermedades arteriales)', ['Se aprecian lesiones necróticas en los dedos con piel atrófica: **Fontaine IV**.'], 80)
    u.ul(['**Angiosomas**: el pie se divide en territorios, cada uno irrigado por una arteria (tibial anterior, tibial posterior y sus ramas plantares, peronea): la **revascularización “directa”** de la arteria del angiosoma de la úlcera mejora la cicatrización.',
          '**Clasificación de Wagner** (0 a 5): de pie en riesgo, pasando por úlcera superficial, profunda, absceso/osteomielitis, **gangrena parcial** y **gangrena total**.',
          '**Tratamiento**: **control de la infección** (antibióticos, **drenaje y desbridamiento**), **descarga de la presión**, **revascularización** si hay isquemia y control metabólico.'])
    u.h3('Niveles de amputación')
    u.tabla(['Nivel', 'Qué se conserva', 'Dato'], [
        ['**Digital / transmetatarsiana**', 'Parte del antepié', 'Necesita buena perfusión del pie (tibial posterior); **se cierra con colgajo plantar**'],
        ['**Syme / Chopart / Lisfranc**', 'Talón (Syme: apoyo con el **colgajo del talón**)', 'Menos usadas; mala cicatrización en isquemia'],
        ['**Infracondílea (bajo la rodilla)**', 'La **rodilla**; sección de la tibia **10-15 cm por debajo de la meseta tibial**', 'Mejor pronóstico funcional; requiere pulso poplíteo y buena perfusión del colgajo posterior'],
        ['**Supracondílea (sobre la rodilla)**', 'Parte del fémur', 'Cuando no cicatriza la infracondílea; **mayor gasto energético**'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 17; Michans, Cirugía, 5.ª ed., cap. 49.')
    u.box('clave', 'Conectá con la UP8', 'Los **huesos, las articulaciones y las fracturas del pie** (calcáneo, astrágalo, metatarsianos) están en el atlas de la **UP8**. Acá se completa con la **vascularización** y los **niveles de amputación**.')
    oral(u, 'En el **pie diabético** coinciden la **neuropatía** (úlceras plantares bajo la cabeza del primer metatarsiano y el talón), la **angiopatía** (oclusión de las arterias infrapoplíteas, con ITB falsamente alto por calcificación) y la **infección**, que se propaga por los **compartimentos plantares** y las vainas tendinosas. La **arteria dorsal del pie** continúa a la tibial anterior y forma el **arco plantar**. La amputación se elige por el nivel con mejor cicatrización: **transmetatarsiana**, **infracondílea** (10-15 cm bajo la meseta tibial, la preferida) o **supracondílea**.', 'Así lo decís en el oral: pie diabético')


def trauma_endovascular(u):
    u.h2('Traumatismo arterial y cirugía endovascular: signos, reparación y acceso femoral', intro='El traumatismo arterial se reconoce por **signos** y se resuelve por **tiempo**: la isquemia caliente tolera unas 6 horas. La cirugía endovascular suma una anatomía práctica: **dónde se punciona** la arteria femoral.')
    u.tabla(['Signos **duros** (operar o angiografía inmediata)', 'Signos **blandos** (estudiar con ITB y angio-TC)'], [
        ['**Hemorragia pulsátil**, hematoma **expansivo**, ausencia de pulso, soplo o *thrill*, signos de isquemia aguda (6 P)', 'Hematoma pequeño estable, **déficit nervioso** asociado, herida próxima a un vaso, pulso disminuido, historia de sangrado en la escena'],
    ], fuente='Ramos Vértiz, Traumatología y Ortopedia, 2.ª ed., cap. 6; ATLS 11.ª ed.')
    u.ul(['**Asociaciones a recordar (anatomía)**: **fractura supracondílea de húmero** → arteria **braquial**; **luxación de rodilla** y fractura supracondílea de fémur → arteria **poplítea**; **luxación de hombro** → **axilar**; **fractura de pelvis** → ramas de la **iliaca interna**. Los detalles están en los atlas de la **UP1** y la **UP8**.',
          '**Conducta**: control de la hemorragia (presión directa, **torniquete**), **ITB**, **angio-TC** si hay duda, **reparación** (sutura, parche, injerto de safena) y **fasciotomía** si la isquemia fue prolongada; **shunt temporal** en el paciente inestable.'])
    u.h3('Cirugía endovascular: el acceso femoral')
    u.ul(['El acceso habitual es la **arteria femoral común**, **punzada sobre la cabeza femoral** (por **debajo del ligamento inguinal** y **por encima de la bifurcación** en superficial y profunda): permite **comprimir contra el hueso** al terminar.',
          '**Punción alta** (por encima del ligamento inguinal): no se puede comprimir y causa **hematoma retroperitoneal**. **Punción baja** (en la superficial o profunda): **seudoaneurisma** o **fístula arteriovenosa**.',
          '**Técnicas**: **angioplastia con balón**, **stent**, **endoprótesis** (EVAR y TEVAR), **trombólisis** y **embolización**; las **prótesis** vasculares son de **Dacron** y de **PTFE**; la **vena safena** es el mejor injerto en vasos pequeños.'])
    G(u, 322, 'Triángulo femoral (Gray): ubicación de la arteria femoral común.', ['Ligamento inguinal arriba, **femoral común** y su **bifurcación** unos 3-5 cm por debajo.'], 190)
    oral(u, 'El traumatismo arterial se reconoce por **signos duros** (hemorragia pulsátil, hematoma expansivo, ausencia de pulso, soplo o *thrill*, isquemia aguda), que indican **cirugía o angiografía inmediata**, y **signos blandos**, que se estudian con **ITB y angio-TC**. Hay lesiones **clásicas**: la **supracondílea de húmero** con la **braquial** y la **luxación de rodilla** con la **poplítea**. En cirugía endovascular el acceso es la **arteria femoral común**, punzada **sobre la cabeza femoral**: una punción alta produce **hematoma retroperitoneal** y una baja, **seudoaneurisma**.', 'Así lo decís en el oral: trauma arterial y endovascular')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Todas unen la anatomía con las patologías de la unidad.')
    qa = [
        ('¿Cómo se calcula el índice tobillo-brazo y cómo se interpreta?',
         'Presión sistólica **más alta del tobillo** (tibial posterior o pedia) dividida por la **más alta de los brazos**. **1,0-1,4** normal; **0,5-0,9** claudicación; **menos de 0,5** isquemia crítica; **más de 1,4** arterias **no compresibles** (diabético, renal).'),
        ('Un hombre fumador refiere dolor en la nalga al caminar, impotencia y no se palpan pulsos femorales. ¿Qué tiene?',
         '**Síndrome de Leriche**: obstrucción **aortoilíaca**. Se estudia con angio-TC y se revasculariza con **bypass aortobifemoral** o angioplastia.'),
        ('¿Por qué la oclusión de la arteria femoral superficial da claudicación de pantorrilla?',
         'Porque la femoral superficial, que atraviesa el **canal de Hunter**, irriga los músculos distales; si se ocluye, los músculos de la pantorrilla se quedan sin flujo suficiente al ejercicio y la **femoral profunda** compensa solo parcialmente.'),
        ('¿Dónde se impacta un émbolo y cuáles son las seis P?',
         'En las **bifurcaciones**: **aórtica**, **femoral común** (la más frecuente), **poplítea** y **braquial**. **Dolor, palidez, ausencia de pulso, parestesias, parálisis y frialdad**. Se inicia **heparina** y se hace **embolectomía con Fogarty**.'),
        ('¿Cuál es la complicación de una revascularización tardía y cómo se trata?',
         'El **síndrome de reperfusión** (hiperpotasemia, mioglobinuria) y el **síndrome compartimental** por edema muscular; se trata con **fasciotomía** de los cuatro compartimentos.'),
        ('¿A partir de qué diámetro se opera un aneurisma de aorta abdominal y qué complicaciones anatómicas se esperan?',
         '**5,5 cm** o más en el varón (5 cm en la mujer) o crecimiento mayor de **1 cm por año**. **Isquemia del sigmoides** (ligadura de la mesentérica inferior), **lesión ureteral**, de la **vena renal izquierda** y del **duodeno**, e **isquemia medular** en los toracoabdominales.'),
        ('Diferencia entre disección Stanford A y B y su conducta.',
         '**A**: compromete la **aorta ascendente** → **cirugía urgente**. **B**: distal a la subclavia izquierda → **control de la presión y la frecuencia**, endoprótesis si hay complicaciones.'),
        ('¿Qué estructuras se lesionan en la endarterectomía carotídea?',
         'El **hipogloso (XII)**, el **vago (X)** y sus ramas laríngeas, la **rama marginal mandibular del facial** y el **glosofaríngeo (IX)**; además la **bradicardia** por manipulación del **seno carotídeo**. La incisión sigue el **borde anterior del ECM**.'),
        ('Un paciente con dolor abdominal intenso, abdomen blando y lactato elevado tiene fibrilación auricular. ¿Qué sospechás?',
         '**Embolia de la arteria mesentérica superior**: se impacta **distal al origen** y respeta el yeyuno proximal. **Angio-TC** y **laparotomía** con embolectomía y resección del intestino necrótico.'),
        ('Describí el recorrido de la safena magna y qué nervio la acompaña.',
         'Nace en el **arco venoso dorsal medial**, pasa **por delante del maléolo medial**, sube por la cara medial de la pierna y el muslo y **desemboca en la femoral** en la **fosa oval** (crossa). La acompaña el **nervio safeno**, que se lesiona en el *stripping*.'),
        ('¿Por qué la TVP es más frecuente en el miembro inferior izquierdo?',
         '**Síndrome de May-Thurner**: la **vena ilíaca común izquierda** queda comprimida entre la **arteria ilíaca común derecha** y la columna.'),
        ('¿Cuál es la anatomía de la fístula radiocefálica y qué complicación produce la isquemia de la mano?',
         '**Anastomosis entre la arteria radial y la vena cefálica** en la muñeca (Brescia-Cimino), en el miembro **no dominante**; se evalúa el **arco palmar** (Allen). La isquemia de la mano es el **síndrome de robo**.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Schwartz, __Principios de Cirugía__, 10.ª ed.: cap. 22 (aneurismas de la aorta torácica y disección), cap. 23 (enfermedades arteriales) y cap. 24 (enfermedad venosa y linfática). Las ilustraciones y fotografías con la etiqueta “Schwartz” provienen de estos capítulos.',
          'Giménez, M. __Cirugía__, 2.ª ed. (2025): cap. 16 (isquemia arterial aguda), 17 (isquemia arterial crónica), 18 (aneurisma de aorta abdominal y poplíteo), 19 (enfermedad carotídea), 20 (flebopatías) y 89 (cirugía endovascular).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: cap. 49 (arterias), 50 (venas) y 51 (linfáticos).',
          'Ramos Vértiz, __Traumatología y Ortopedia__, 2.ª ed. (2012): cap. 6 (lesiones traumáticas arteriales de los miembros).'])
    u.box('alerta', 'Partes de la unidad que no son anatómicas', 'Los **factores de riesgo cardiovascular y la prevención secundaria** (estatinas, antiagregación, control de la presión, dejar de fumar) no tienen contenido anatómico: se estudian con el material de la sala. Esta guía cubre la **anatomía** que sostiene cada decisión.')
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. Ante cualquier duda, **la lámina del atlas manda**. Las cifras (diámetros, índices, plazos) se citan para estudiar y **pueden variar entre ediciones y guías**: verificá con el libro de tu cátedra.')
