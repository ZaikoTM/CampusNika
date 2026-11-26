# -*- coding: utf-8 -*-
"""UP 5 · Anatomía quirúrgica del hígado, las vías biliares y el páncreas. Parte B: vía biliar y vesícula, litiasis, colecistitis, ictericia, colangitis y tumores biliares."""
from .up01e import N, G, L, oral
from .up05a import GAL, SCH


def via_biliar(u):
    u.h2('Vía biliar y vesícula: anatomía quirúrgica, fisiología y lesión de la vía biliar', intro='Es el apartado más “cirujano” de la unidad: la colecistectomía se hace sobre el triángulo de Calot y casi todos los errores graves nacen de una confusión anatómica.')
    u.h3('Conductos biliares')
    u.tabla(['Segmento', 'Descripción', 'Dato quirúrgico'], [
        ['**Conductos hepáticos derecho e izquierdo**', 'Se forman en el hígado y se unen en el **hilio** (confluencia)', 'El izquierdo es más largo y horizontal'],
        ['**Conducto hepático común**', '~3-4 cm; hasta la unión con el cístico', 'Forma el límite medial del triángulo de Calot'],
        ['**Conducto cístico**', '~3-4 cm, con las **válvulas de Heister** (espiral)', 'Se liga y se secciona en la colecistectomía; puede ser corto, largo o desembocar bajo'],
        ['**Colédoco**', '8-10 cm; diámetro normal **menor de 6-7 mm**', 'Cuatro porciones (ver abajo)'],
        ['**Ampolla de Vater y esfínter de Oddi**', 'El colédoco y el conducto pancreático desembocan en la **papila mayor** (2.ª porción del duodeno)', 'Regula el paso de la bilis; la CPRE accede por aquí'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 437 (anatomía quirúrgica de las vías biliares); Giménez, Cirugía, 2.ª ed.; Netter, lámina S-432.')
    u.tabla(['Porción del colédoco', 'Relaciones'], [
        ['**Supraduodenal**', 'En el ligamento hepatoduodenal, **a la derecha de la arteria hepática y por delante de la porta**'],
        ['**Retroduodenal**', 'Por detrás de la 1.ª porción del duodeno, **junto a la arteria gastroduodenal**'],
        ['**Pancreática (retropancreática)**', 'En un surco o túnel en la **cabeza del páncreas**: un tumor de la cabeza lo comprime (ictericia)'],
        ['**Intramural (intraduodenal)**', 'Atraviesa la pared duodenal hasta la papila'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 437.')
    L(u, 'gal_via_biliar_colangio_diseccion.png', 'Vía biliar: colangiografía y disección anatómica (hepáticos, cístico, vesícula y colédoco).', GAL.format(c='cap. 437'), ['Comparar la imagen radiológica con el preparado anatómico.'], 80)
    L(u, 'gal_coledoco_porciones.png', 'Porciones del colédoco: supraduodenal, retroduodenal, retropancreática e intramural.', GAL.format(c='cap. 437'), ['Cada porción tiene sus relaciones (porta, duodeno, páncreas).'], 70)
    L(u, 'gal_coledoco_eco.png', 'Colédoco en la ecografía: porciones supraduodenal y retroduodenal.', GAL.format(c='cap. 437'), ['El calibre normal es menor de 6-7 mm.'], 65)
    u.h3('Vesícula biliar y triángulo de Calot')
    u.ul(['**Partes**: **fondo**, **cuerpo**, **infundíbulo (bolsa de Hartmann)** y **cuello**, que continúa con el cístico. Mide 7-10 cm y almacena 30-50 mL; **concentra la bilis** y se vacía por la **colecistocinina (CCK)**. Se apoya en el **lecho vesicular** entre los segmentos IV y V.',
          '**Irrigación**: **arteria cística**, rama de la **hepática derecha**, casi siempre dentro del **triángulo de Calot**. **Venas** al sistema porta; **linfáticos** al ganglio cístico (de Lund o Mascagni).',
          '**Triángulo de Calot (hepatobiliar)**: límites: **conducto cístico** (lateral), **conducto hepático común** (medial) y **borde inferior del hígado** (superior). Contiene la **arteria cística** y el ganglio cístico; la **arteria hepática derecha** pasa en su vecindad (a veces en “joroba de camello”).',
          '**Variantes que se lesionan**: cístico corto, de implantación baja o paralelo al hepático; **conducto hepático derecho accesorio**; arteria hepática derecha reemplazada.'])
    u.box('alerta', 'Visión crítica de seguridad (Strasberg): cómo se evita la lesión de la vía biliar', [['**1.** Se **despeja el triángulo hepatocístico** de grasa y tejido fibroso.',
                                                                                                           '**2.** Se **separa el tercio inferior de la vesícula** del lecho hepático (se ve el lecho).',
                                                                                                           '**3.** Se confirma que **solo dos estructuras** (el cístico y la arteria cística) **entran en la vesícula**. Recién entonces se clipa y se secciona.',
                                                                                                           'La lesión del colédoco casi siempre es **un error de identificación** (se lo confunde con el cístico): si la visión crítica no es posible por inflamación, se hace **colecistectomía subtotal** o **colangiografía operatoria**.']])
    L(u, 'gal_via_biliar_arterias.png', 'Relación de la vía biliar con la arteria hepática derecha y la vena porta.', GAL.format(c='cap. 437'), ['La arteria cística nace de la hepática derecha en el triángulo de Calot.'], 55)
    L(u, 'gal_via_biliar_esquema.png', 'Esquema de la vesícula, el cístico y los elementos del pedículo hepático.', GAL.format(c='cap. 437'), ['Seguí cada estructura hasta su origen.'], 75)
    L(u, 'lib_schwartz_anatomia_biliar.png', 'Anatomía de la vesícula y la vía biliar extrahepática.', SCH.format(c='cap. 32 (vesícula biliar y sistema biliar extrahepático)'), ['Confluencia biliar, cístico, colédoco y papila.'], 80)
    u.h3('Fisiología, semiología y colangiografía operatoria')
    u.ul(['**Bilis**: se producen **600-1000 mL por día**; sales biliares, bilirrubina, colesterol. La vesícula concentra 5-10 veces y se contrae por la **CCK** tras las comidas grasas; el **esfínter de Oddi** se relaja y la bilis llega al duodeno.',
          '**Signo de Murphy**: dolor que corta la inspiración al palpar el **punto cístico** (borde externo del recto con el reborde costal derecho). **Courvoisier-Terrier**: **vesícula palpable e indolora** con ictericia: sugiere **obstrucción neoplásica** del colédoco distal (una vesícula litiásica crónica suele ser fibrosa y no se distiende).',
          '**Colangiografía operatoria**: se inyecta contraste por el cístico para ver la anatomía, la permeabilidad y los cálculos del colédoco; se indica ante dudas anatómicas, ictericia o colédoco dilatado.'])
    u.h3('Malformaciones y lesión traumática')
    u.tabla(['Cuadro', 'Anatomía', 'Clínica y conducta'], [
        ['**Quiste del colédoco**', 'Dilatación congénita (clasificación de **Todani**: tipo I fusiforme, el más frecuente; IV múltiple; V enfermedad de Caroli); se asocia a **unión pancreatobiliar anómala**', 'Dolor, masa, ictericia (niños y adultos jóvenes); riesgo de **cáncer**: **resección** del quiste y **hepaticoyeyunostomía**'],
        ['**Atresia biliar congénita**', 'Obliteración de los conductos biliares extrahepáticos', 'Lactante con **ictericia, acolia y coluria**; **cirugía de Kasai (portoenterostomía) antes de los 60 días**'],
        ['**Lesión quirúrgica de la vía biliar**', 'Clasificaciones de **Strasberg** (A a E) y **Bismuth** (I a V)', 'Se descubre en el acto (se repara con **hepaticoyeyunostomía**) o con fuga biliar o ictericia en el postoperatorio (CPRE, drenaje, cirugía diferida por un centro experto)'],
        ['**Traumatismo de la vía biliar**', 'Raro; se asocia a lesiones hepáticas y duodenopancreáticas', 'Drenaje y derivación biliar'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 58 (lesión quirúrgica de la vía biliar); Galindo, Enciclopedia de Cirugía Digestiva, cap. 437.')
    N(u, 'S-432', 'Vesícula biliar, conductos biliares extrahepáticos y conducto pancreático.', ['Triángulo de Calot, cístico, hepático común, colédoco y papila.'], 195)
    N(u, 'S-436', 'Arterias del hígado, páncreas, duodeno y bazo.', ['Arteria hepática propia, gastroduodenal y arteria cística.'], 190)
    N(u, 'S-438', 'Arterias del duodeno y de la cabeza del páncreas.', ['Pancreaticoduodenales: relación con el colédoco.'], 190)
    G(u, 191, 'Páncreas y vesícula biliar (Gray).', ['Conductos biliares y pancreáticos, y su desembocadura.'], 190)
    oral(u, 'La **vía biliar** nace de los hepáticos derecho e izquierdo, que forman el **hepático común**; se une al **cístico** y forma el **colédoco** (8-10 cm, menos de 6-7 mm), con cuatro porciones (**supraduodenal, retroduodenal, retropancreática e intramural**) hasta la **ampolla de Vater**. La **vesícula** tiene fondo, cuerpo, infundíbulo y cuello; su **arteria cística** viene de la hepática derecha y pasa por el **triángulo de Calot** (cístico, hepático común y borde hepático). La colecistectomía exige la **visión crítica de seguridad**: triángulo despejado, tercio inferior separado del lecho y **dos estructuras que entran en la vesícula**; la **lesión de la vía biliar** es un error de identificación (colédoco confundido con cístico) y se clasifica por Strasberg o Bismuth. En el **Courvoisier-Terrier** la vesícula es palpable e indolora con ictericia: pensá en neoplasia del colédoco distal o de la cabeza del páncreas.')


def litiasis(u):
    u.h2('Litiasis biliar, colecistitis, ictericia, colangitis y tumores de la vía biliar', intro='Cada complicación de la litiasis sigue el camino que recorre el cálculo: vesícula, cístico, colédoco y papila.')
    u.h3('Litiasis y su camino')
    u.tabla(['Localización del cálculo', 'Cuadro', 'Clave anatómica'], [
        ['**Vesícula**', '**Cólico biliar**: dolor en el hipocondrio derecho o epigastrio, tras comidas grasas, de menos de 6 horas', 'Obstrucción transitoria del cístico; la colecistectomía laparoscópica es el tratamiento si da síntomas'],
        ['**Cístico o infundíbulo (impactado)**', '**Colecistitis aguda**', 'La obstrucción distiende la vesícula, la isquemia y la infección producen la inflamación'],
        ['**Cuello de la vesícula (bolsa de Hartmann)**', '**Síndrome de Mirizzi**', 'El cálculo comprime el **hepático común** desde afuera: ictericia con colecistitis'],
        ['**Colédoco**', '**Coledocolitiasis**: ictericia, **colangitis**, pancreatitis biliar', 'Cálculo en el colédoco o en la papila'],
        ['**Íleon terminal**', '**Íleo biliar**', 'Un cálculo grande pasa por una **fístula colecistoduodenal** y se impacta en la **válvula ileocecal**; Rx: aerobilia, obstrucción'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 53 a 55; Galindo, Enciclopedia de Cirugía Digestiva, caps. 440 a 444.')
    u.ul(['**Etiología**: cálculos de **colesterol** (~80 %): mujer, obesidad, edad, embarazos, rápida pérdida de peso, hipertrigliceridemia; **pigmentarios**: hemólisis y cirrosis.',
          '**Complicaciones de la colecistitis**: **empiema**, **gangrena** (ancianos, diabéticos), **perforación** (peritonitis biliar o absceso pericolecístico), **colecistitis enfisematosa**, **fístulas** biliodigestivas.'])
    u.h3('Colecistitis aguda')
    u.tabla(['Aspecto', 'Detalle'], [
        ['**Clínica**', 'Dolor persistente en el hipocondrio derecho (más de 6 horas), fiebre, náuseas, **signo de Murphy** positivo'],
        ['**Ecografía**', 'Cálculos con **sombra acústica**, **pared engrosada (más de 3-4 mm)**, líquido perivesicular, **Murphy ecográfico**, cálculo impactado'],
        ['**Clasificación**', '**Guías de Tokio 2018**: grados I (leve), II (moderada) y III (grave, con disfunción orgánica)'],
        ['**Tratamiento**', '**Colecistectomía laparoscópica temprana** (en los primeros días); antibióticos; en pacientes de **alto riesgo** o grado III: drenaje percutáneo (**colecistostomía**) y cirugía diferida'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 53; Galindo, Enciclopedia de Cirugía Digestiva, cap. 441.')
    L(u, 'gal_eco_vesicula.png', 'Ecografía de una vesícula con litiasis.', GAL.format(c='cap. 441 (colecistitis aguda)'), ['Imagen hiperecogénica con sombra acústica posterior: es el cálculo.'], 70)
    L(u, 'lib_schwartz_eco_vesicula.png', 'Ecografía biliar: vesícula con cálculos y barro.', SCH.format(c='cap. 32'), ['Buscá la sombra acústica y el grosor de la pared.'], 70)
    u.h3('Ictericia, colestasis y síndrome coledociano')
    u.tabla(['Tipo', 'Mecanismo', 'Ejemplos', 'Laboratorio'], [
        ['**Prehepática**', 'Aumento de la producción de bilirrubina', 'Hemólisis', '**Indirecta** (no conjugada)'],
        ['**Hepática (colestasis intrahepática)**', 'Daño del hepatocito o del canalículo', 'Hepatitis, cirrosis, fármacos', 'Mixta; **transaminasas** altas'],
        ['**Posthepática (extrahepática)**', '**Obstrucción de la vía biliar**', 'Coledocolitiasis, cáncer de cabeza del páncreas o colédoco, estenosis, colangitis esclerosante', '**Directa**; **fosfatasa alcalina y GGT** altas'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, caps. 440 y 444; anatomía de referencia.')
    u.box('clave', 'Síndrome coledociano', 'Obstrucción del colédoco: **ictericia, acolia (heces blanquecinas), coluria (orina oscura) y prurito**. **Si es litiásica**: dolor y fiebre; **si es neoplásica**: ictericia **progresiva indolora** y **vesícula palpable (Courvoisier-Terrier)**.')
    u.h3('Colangitis')
    u.tabla(['', 'Colangitis aguda', 'Colangitis esclerosante primaria'], [
        ['**Causa**', 'Obstrucción + infección de la vía biliar (litiasis, estenosis, tumor)', 'Inflamación y fibrosis de los conductos (autoinmune; **asociada a la colitis ulcerosa**)'],
        ['**Clínica**', '**Tríada de Charcot**: fiebre, ictericia y dolor. **Péntada de Reynolds**: + shock y confusión mental', 'Prurito, fatiga, colestasis crónica'],
        ['**Imagen**', 'Dilatación de la vía biliar', 'CPRM: **“cuentas de rosario”** (estenosis y dilataciones alternas)'],
        ['**Tratamiento**', '**Antibióticos y drenaje biliar urgente** (CPRE con esfinterotomía o drenaje percutáneo)', 'Sin curativo médico; **trasplante** y vigilancia por riesgo de **colangiocarcinoma**'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 55; Galindo, Enciclopedia de Cirugía Digestiva, caps. 444 y 445.')
    u.h3('Tumores de la vía biliar y de la vesícula')
    u.ul(['**Cáncer de vesícula**: casi siempre en pacientes con **litiasis crónica**; se descubre como **hallazgo** (colecistectomía) o con ictericia por invasión del hilio. Factores: **vesícula en porcelana** (calcificación de la pared), **pólipos de más de 1 cm**, **cálculos grandes**. Se extiende al **hígado (segmentos IV y V)** y a los ganglios del pedículo.',
          '**Colangiocarcinoma**: **hiliar (tumor de Klatskin)**, en la confluencia de los hepáticos (clasificación de **Bismuth-Corlette** I a IV); **distal** (colédoco). Ictericia progresiva indolora, sin vesícula palpable en el hiliar. Tratamiento: resección (hepatectomía con vía biliar) o paliación con **prótesis**.'])
    u.h3('Procedimientos percutáneos y prótesis endobiliares')
    u.tabla(['Procedimiento', 'Qué se hace', 'Indicación'], [
        ['**CPRE** (colangiopancreatografía retrógrada endoscópica)', 'Endoscopio hasta la papila, canulación y contraste; **esfinterotomía** y extracción de cálculos; **prótesis**', 'Coledocolitiasis, colangitis, estenosis, ictericia obstructiva'],
        ['**Drenaje percutáneo transhepático**', 'Punción del hígado y de un conducto biliar bajo imagen; drenaje externo o interno', 'Cuando la CPRE falla o no es posible (tumores hiliares)'],
        ['**Colecistostomía percutánea**', 'Drenaje de la vesícula por vía transhepática o transperitoneal', 'Colecistitis en pacientes de alto riesgo'],
        ['**Prótesis biliares** (plásticas o metálicas)', 'Mantienen la luz de la vía biliar', 'Paliación del cáncer; preoperatorio'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 54 y 85; Galindo, Enciclopedia de Cirugía Digestiva, cap. 448.')
    L(u, 'lib_schwartz_crm_cpre.png', 'Colangiorresonancia y CPRE: litiasis y dilatación de la vía biliar.', SCH.format(c='cap. 32'), ['La CRM muestra la vía biliar sin invadir; la CPRE permite tratarla.'], 80)
    N(u, 'S-437', 'Arteriografía y angiografía por TC celíacas.', ['Arteria hepática y sus ramas: correlación con la anatomía quirúrgica.'], 165)
    oral(u, 'Sigo el **camino del cálculo**: en la **vesícula** da cólico; en el **cístico o infundíbulo**, **colecistitis aguda** (Murphy; eco con pared mayor de 3-4 mm; Tokio 2018; colecistectomía laparoscópica temprana); en el **cuello**, **síndrome de Mirizzi** (comprime el hepático común); en el **colédoco**, **coledocolitiasis** con ictericia, **colangitis** (**Charcot**: fiebre, ictericia, dolor; **Reynolds**: + shock y confusión; antibióticos y **drenaje urgente por CPRE**) o pancreatitis biliar; en el **íleon**, **íleo biliar** por fístula colecistoduodenal. En la ictericia distingo **prehepática** (indirecta), **hepática** (transaminasas) y **posthepática** (directa, fosfatasa alcalina y GGT); el **síndrome coledociano** tiene acolia, coluria y prurito, y si es neoplásico, vesícula palpable indolora (**Courvoisier**). Los tumores biliares son el **cáncer de vesícula** (litiasis, porcelana) y el **colangiocarcinoma** (**Klatskin**, Bismuth-Corlette); el drenaje se hace por **CPRE**, **percutáneo transhepático** o con **prótesis**.')
