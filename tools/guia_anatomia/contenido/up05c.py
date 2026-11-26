# -*- coding: utf-8 -*-
"""UP 5 · Anatomía quirúrgica del hígado, las vías biliares y el páncreas. Parte C: páncreas, pancreatitis, tumores, estudios, preguntas de oral y referencias."""
from .up01e import N, G, L, oral
from .up05a import GAL, SCH


def pancreas(u):
    u.h2('Páncreas: anatomía quirúrgica, relaciones, conductos, irrigación y traumatismos', intro='El páncreas es un órgano retroperitoneal rodeado de estructuras vitales: por eso sus enfermedades dan ictericia, hemorragia y compromiso de la porta, y su cirugía es de las más complejas.')
    u.h3('Partes y relaciones')
    u.tabla(['Parte', 'Relaciones', 'Qué pasa si se enferma'], [
        ['**Cabeza** (y **proceso uncinado**)', 'Encajada en el **marco duodenal (C duodenal)**; por detrás, el **colédoco intrapancreático**, la **vena cava inferior** y la **vena renal izquierda**; el uncinado pasa por detrás de la **vena mesentérica superior**', 'Un tumor comprime el **colédoco** (ictericia) y el duodeno (obstrucción); la pancreatitis comprime el colédoco'],
        ['**Cuello**', 'Por **detrás** se forma la **vena porta** (confluencia esplenomesentérica); por delante, el píloro', 'Un tumor del cuello invade la porta o la mesentérica superior: **irresecable**'],
        ['**Cuerpo**', 'Por detrás: aorta, **arteria mesentérica superior**, **vena esplénica** (en su borde posterior), riñón y suprarrenal izquierdos; por delante, la bolsa omental y el estómago', 'Pseudoquistes (se abren a la bolsa omental); tumores del cuerpo comprimen la esplénica'],
        ['**Cola**', 'En el **ligamento esplenorrenal**, hasta el hilio del bazo', 'Se reseca con el bazo en la pancreatectomía distal'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 468 (anatomía quirúrgica del páncreas); Giménez, Cirugía, 2.ª ed.; Netter, láminas S-433 y S-438; Gray, págs. 191 y 194.')
    u.ul(['Mide **12-15 cm**; es **retroperitoneal** (salvo la cola) y está a la altura de **L1-L2**. Detrás del cuello nacen y se unen los vasos que forman la **porta**: por eso el **“plano de la mesentérica superior y la porta”** es el que define la resecabilidad de los tumores.',
          '**Conductos**: **conducto pancreático principal (de Wirsung)**, de unos 3-4 mm, que recorre el órgano y desemboca con el colédoco en la **papila mayor**; **conducto accesorio (de Santorini)** en la papila menor. Variantes: **páncreas divisum** (los dos conductos no se fusionan) y **páncreas anular** (rodea el duodeno).',
          '**Fisiología**: **exocrina** (enzimas: tripsinógeno, amilasa, lipasa; bicarbonato) y **endocrina** (islotes: insulina, glucagón, somatostatina).'])
    u.h3('Irrigación y drenaje')
    u.tabla(['Territorio', 'Arterias', 'Dato quirúrgico'], [
        ['**Cabeza y duodeno**', '**Pancreaticoduodenales superiores** (de la gastroduodenal) e **inferiores** (de la mesentérica superior), que forman arcadas', 'Son la comunicación entre el tronco celíaco y la AMS: la **duodenopancreatectomía** reseca la cabeza y el duodeno juntos porque comparten esa irrigación'],
        ['**Cuerpo y cola**', 'Ramas de la **esplénica** (pancreática dorsal, magna y caudal)', 'La pancreatectomía distal se hace con ligadura de la esplénica'],
    ], fuente='Netter, láminas S-436 y S-438; Galindo, Enciclopedia de Cirugía Digestiva, cap. 468.')
    u.ul(['**Venas**: pancreaticoduodenales y esplénica, hacia la **porta**. **Linfáticos**: ganglios pancreáticos, celíacos y mesentéricos superiores. **Inervación**: simpática (plexo celíaco; dolor referido a la **espalda** en cinturón) y parasimpática (vago).'])
    u.h3('Traumatismos duodenopancreáticos y semiología')
    u.ul(['**Mecanismo**: golpe directo (manubrio de bicicleta, volante) que comprime el páncreas contra la columna. Por ser **retroperitoneal**, los signos son tardíos: dolor, náuseas, **amilasa/lipasa elevadas** (pueden ser normales al inicio), **TC con contraste**. Lo decisivo es si hay **lesión del conducto pancreático** (resección distal si es del cuerpo-cola; drenaje o resección si es de la cabeza) o **lesión duodenal** (reparación y exclusión).',
          '**Semiología**: dolor epigástrico en cinturón; **signo de Cullen** (equimosis periumbilical) y **de Grey Turner** (flancos) en la pancreatitis hemorrágica; **ictericia** y **vesícula palpable** (Courvoisier) en tumores de la cabeza.'])
    N(u, 'S-433', 'Páncreas in situ.', ['Cabeza en el C duodenal, cuello, cuerpo y cola con el bazo; relación con la porta, la mesentérica superior y el colédoco.'], 195)
    N(u, 'S-434', 'Bazo.', ['Hilio esplénico y cola del páncreas en el ligamento esplenorrenal.'], 175)
    N(u, 'S-457', 'Inervación autónoma del páncreas: esquema.', ['Plexo celíaco y vago.'], 175)
    N(u, 'S-544', 'Corte transversal a nivel del disco L1-L2.', ['Páncreas con la porta, la mesentérica superior, los riñones y las suprarrenales en un corte axial.'], 190)
    G(u, 174, 'Bazo (Gray).', ['Relaciones con la cola del páncreas.'], 190)
    G(u, 194, 'Vascularización del páncreas y del duodeno (Gray).', ['Arcadas pancreaticoduodenales y ramas de la esplénica.'], 190)
    oral(u, 'El **páncreas** mide 12-15 cm, es **retroperitoneal** (L1-L2) y tiene **cabeza** (con el **proceso uncinado**, en el C duodenal, con el **colédoco intrapancreático** por detrás), **cuello** (por detrás se forma la **porta**), **cuerpo** (por detrás, la **mesentérica superior** y la **vena esplénica**) y **cola** (ligamento esplenorrenal, hilio del bazo). Sus conductos son el **de Wirsung** (con el colédoco en la papila mayor) y el **de Santorini**. Se irriga por las **pancreaticoduodenales** (superiores de la gastroduodenal, inferiores de la AMS) y por la **esplénica**: por eso la **duodenopancreatectomía** reseca la cabeza y el duodeno juntos. Los tumores de la cabeza dan **ictericia** (comprimen el colédoco) y los del cuello comprometen la **porta** (irresecables). En el **trauma**, lo que define la conducta es la lesión del conducto pancreático.')


def pancreatitis(u):
    u.h2('Pancreatitis aguda y crónica: clasificación, complicaciones y por dónde se extiende la necrosis', intro='La pancreatitis es un clásico de examen. La clasificación de Atlanta 2012 es la bibliografía necesaria de la unidad.')
    u.h3('Pancreatitis aguda')
    u.tabla(['Aspecto', 'Detalle'], [
        ['**Etiología**', '**Litiásica** (cálculo en la ampolla: el colédoco y el Wirsung comparten desembocadura) y **alcohol** (las más frecuentes); hipertrigliceridemia, CPRE, fármacos, trauma, hipercalcemia, idiopática'],
        ['**Fisiopatología**', 'Activación intraacinar del **tripsinógeno** y **autodigestión** del páncreas y de la grasa peripancreática; respuesta inflamatoria sistémica'],
        ['**Diagnóstico (2 de 3)**', '**Dolor epigástrico** en cinturón; **lipasa o amilasa mayor de 3 veces** el valor normal; hallazgos en las **imágenes**'],
        ['**Clínica**', 'Dolor intenso con irradiación a la espalda, vómitos; **Cullen** y **Grey Turner** en las formas hemorrágicas'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 59; Galindo, Enciclopedia de Cirugía Digestiva, cap. 472.')
    u.h3('Clasificación de Atlanta 2012 (Banks y col., Gut 2013)')
    u.tabla(['Clasificación', 'Definición'], [
        ['**Por morfología**', '**Edematosa intersticial** (la mayoría) frente a **necrotizante** (necrosis del páncreas o de la grasa peripancreática)'],
        ['**Leve**', 'Sin falla orgánica ni complicaciones locales o sistémicas'],
        ['**Moderadamente grave**', 'Falla orgánica **transitoria (menos de 48 horas)** o complicaciones locales/sistémicas'],
        ['**Grave**', '**Falla orgánica persistente (más de 48 horas)**'],
        ['**Fases**', '**Temprana** (primera semana; predomina la respuesta inflamatoria sistémica) y **tardía** (complicaciones locales)'],
    ], fuente='Banks, P. A. y col. (2013), Classification of acute pancreatitis—2012: revision of the Atlanta classification and definitions by international consensus. Gut, 62(1), 102-111.')
    u.tabla(['Colección', 'Cuándo', 'Contenido'], [
        ['**Colección líquida aguda peripancreática (APFC)**', '**Menos de 4 semanas**, pancreatitis edematosa', 'Líquido sin pared'],
        ['**Pseudoquiste**', '**Más de 4 semanas**, pancreatitis edematosa', 'Líquido con **pared fibrosa** (no es un quiste verdadero: no tiene epitelio)'],
        ['**Colección necrótica aguda (ANC)**', '**Menos de 4 semanas**, pancreatitis necrotizante', 'Líquido y necrosis, sin pared'],
        ['**Necrosis encapsulada (WON)**', '**Más de 4 semanas**, pancreatitis necrotizante', 'Necrosis con pared; se **infecta** con frecuencia (gas en la TC, fiebre)'],
    ], fuente='Banks y col. (2013); Galindo, Enciclopedia de Cirugía Digestiva, cap. 474 (complicaciones locales de la pancreatitis aguda: necrosis pancreática).')
    L(u, 'gal_pancreatitis_tc.png', 'Pancreatitis aguda en la tomografía: aumento de tamaño del páncreas y colecciones peripancreáticas.', GAL.format(c='cap. 472'), ['Las flechas señalan la grasa peripancreática inflamada y las colecciones.'], 75)
    L(u, 'gal_necrosis_pieza.png', 'Necrosis pancreática: material necrótico extraído.', GAL.format(c='cap. 474'), ['Es la “necrosectomía”: se retira el tejido desvitalizado.'], 70)
    u.h3('Por dónde se extiende la inflamación: la anatomía de las complicaciones')
    u.ul(['El páncreas es retroperitoneal: la inflamación y las enzimas se extienden por el **espacio pararrenal anterior**, la **raíz del mesenterio**, el **mesocolon transverso**, las **goteras parietocólicas** y, por el hiato, al **mediastino**. Por eso hay **íleo, derrame pleural izquierdo** y el dolor se irradia a la espalda.',
          '**Cullen** (periumbilical, por el ligamento redondo y el ombligo) y **Grey Turner** (flancos, por el retroperitoneo) son signos de **hemorragia retroperitoneal**.',
          '**Complicaciones vasculares**: **trombosis de la vena esplénica** (produce **várices gástricas** aisladas, “hipertensión portal izquierda”) y **pseudoaneurisma** de la esplénica o la gastroduodenal (hemorragia).',
          '**Compresión**: del colédoco (ictericia), del duodeno y de la porta.'])
    u.h3('Tratamiento')
    u.ul(['**Soporte**: reposición de **líquidos** (solución balanceada, con monitoreo), **analgesia**, **nutrición enteral temprana**; no hay indicación de antibióticos profilácticos.',
          '**Biliar**: **CPRE urgente** si hay **colangitis** o ictericia obstructiva persistente; **colecistectomía** en el mismo ingreso en la forma leve para evitar recidivas.',
          '**Necrosis infectada**: **drenaje y necrosectomía “escalonada” (step-up)**: drenaje percutáneo o endoscópico transmural y, si no mejora, necrosectomía mínimamente invasiva; la cirugía abierta queda para casos seleccionados.'])
    u.h3('Pancreatitis crónica')
    u.ul(['**Causas**: **alcohol** (la más frecuente), obstrucción del conducto, hereditaria, autoinmune. Se produce **fibrosis y calcificaciones** con pérdida de la función **exocrina** (esteatorrea) y **endocrina** (diabetes).',
          '**Dolor crónico** intenso (cinturón), pérdida de peso; imágenes: **calcificaciones** y **conducto dilatado con “cadena de lagos”**.',
          '**Cirugía**: ante dolor refractario o complicaciones: **drenaje del conducto** (Puestow: pancreatoyeyunostomía lateral) o **resecciones** de la cabeza (Beger, Frey); **duodenopancreatectomía** si se sospecha cáncer.'])
    oral(u, 'La **pancreatitis aguda** se diagnostica con **2 de 3**: dolor en cinturón, **lipasa mayor de 3 veces** y hallazgos en la imagen. Las causas más frecuentes son la **litiasis** (ampolla compartida) y el **alcohol**. La **clasificación de Atlanta 2012** (Banks) la divide en **edematosa** y **necrotizante**, y en **leve, moderadamente grave** (falla orgánica transitoria o complicación local) y **grave** (**falla orgánica persistente más de 48 horas**); las colecciones son **APFC y ANC antes de las 4 semanas** y **pseudoquiste y WON después**. Como el páncreas es retroperitoneal, la inflamación se extiende por el **pararrenal anterior**, el **mesenterio** y el **mesocolon** (Cullen y Grey Turner por hemorragia retroperitoneal) y puede trombosar la **esplénica** (várices gástricas). El tratamiento es de soporte con **nutrición enteral temprana**; **CPRE urgente** si hay colangitis; **colecistectomía** en el mismo ingreso si es biliar leve; la necrosis infectada se trata con **drenaje escalonado (step-up)**. La **pancreatitis crónica** (alcohol) produce calcificaciones, dolor y falla exocrina y endocrina; se opera el dolor refractario (Puestow, Beger, Frey).')


def tumores_pancreas(u):
    u.h2('Tumores del páncreas y periampulares: benignos, malignos y quísticos', intro='El tumor de la cabeza se descubre por la ictericia; los del cuerpo y la cola, tarde. Los quísticos obligan a distinguir los que se operan de los que se controlan.')
    u.h3('Tumores periampulares y adenocarcinoma de páncreas')
    u.ul(['**Periampulares**: tumores de la **cabeza del páncreas** (la mayoría), la **ampolla de Vater**, el **colédoco distal** y el **duodeno**. Todos dan **ictericia obstructiva**; los de la ampolla y el duodeno pueden sangrar y se detectan antes (mejor pronóstico).',
          '**Adenocarcinoma ductal**: **~70 %** en la cabeza. Clínica: **ictericia progresiva indolora**, prurito, pérdida de peso, dolor de espalda, **vesícula palpable indolora (Courvoisier-Terrier)**, diabetes de comienzo reciente. **CA 19-9** (seguimiento). **TC bifásica** (fase pancreática): masa hipodensa; **“doble signo del conducto”** (dilatación del colédoco y del Wirsung).',
          '**Resecabilidad** (por su relación con los vasos): **resecable** si no contacta con la **AMS**, el **tronco celíaco** ni la porta; **borderline** con contacto menor de 180°; **irresecable** si los rodea (más de 180°) o hay metástasis (hígado, peritoneo).',
          '**Cirugía**: **duodenopancreatectomía cefálica (Whipple)**: se reseca la cabeza del páncreas, el duodeno, la vía biliar distal y la vesícula (± el antro gástrico); se reconstruye con **pancreatoyeyunostomía, hepaticoyeyunostomía y gastro- o duodenoyeyunostomía**. La **pancreatectomía distal** (con esplenectomía) es para el cuerpo y la cola.'])
    u.h3('Tumores neuroendocrinos')
    u.tabla(['Tumor', 'Síndrome', 'Dato'], [
        ['**Insulinoma**', '**Tríada de Whipple**: síntomas de hipoglucemia, glucemia menor de 50 mg/dL y alivio con glucosa', 'Casi siempre benigno y único; enucleación'],
        ['**Gastrinoma**', '**Zollinger-Ellison**: úlceras múltiples y diarrea por hipergastrinemia', 'Se ubica en el **“triángulo del gastrinoma”** (confluencia cístico-hepático, 2.ª y 3.ª porciones del duodeno, cuello y cuerpo del páncreas); frecuente malignidad'],
        ['**No funcionantes**', 'Masa o ictericia', 'Resección según el tamaño'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 62 (conceptos de tumores neuroendocrinos).')
    u.h3('Tumores quísticos del páncreas')
    u.tabla(['Tipo', 'Característica', 'Conducta'], [
        ['**Cistoadenoma seroso**', '**Microquístico**, cicatriz central estrellada; mujer mayor; **benigno**', 'Control; resección si es sintomático o crece'],
        ['**Neoplasia quística mucinosa**', '**Mujer joven**, cuerpo y cola, estroma ovárico; **premaligna**', '**Resección**'],
        ['**NIPM (neoplasia intraductal papilar mucinosa)**', 'Comunica con el **conducto** (conducto principal o ramas); **papila “en ojo de pez”** en la endoscopia', 'Conducto principal: resección; ramas pequeñas: control'],
        ['**Pseudoquiste**', 'Antecedente de pancreatitis; **sin epitelio**', 'Drenaje si es sintomático'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 63; Galindo, Enciclopedia de Cirugía Digestiva, cap. 484 (lesiones quísticas del páncreas).')
    oral(u, 'Los tumores **periampulares** (cabeza del páncreas, ampolla, colédoco distal y duodeno) dan **ictericia obstructiva**; el **adenocarcinoma de la cabeza** da ictericia progresiva indolora con **vesícula palpable (Courvoisier)** y se ve en la TC bifásica con el **doble signo del conducto**. La **resecabilidad** depende de la relación con la **mesentérica superior, el tronco celíaco y la porta** (contacto menor de 180° es borderline); la operación es la **duodenopancreatectomía cefálica (Whipple)** con tres anastomosis. Los **neuroendocrinos** más importantes son el **insulinoma** (tríada de Whipple) y el **gastrinoma** (Zollinger-Ellison, triángulo del gastrinoma). De los **quísticos**, el **seroso** es benigno y el **mucinoso** y el **NIPM** son premalignos (el del conducto principal se reseca).')


def estudios(u):
    u.h2('Estudios complementarios del hígado, las vías biliares y el páncreas', intro='Cada estudio responde una pregunta distinta. Hay que saber cuál pedir primero y por qué.')
    u.tabla(['Estudio', 'Qué muestra', 'Cuándo se pide'], [
        ['**Laboratorio**', '**Perfil hepatocelular**: transaminasas (GOT/GPT); **perfil colestásico**: fosfatasa alcalina, GGT, bilirrubina directa; coagulación (RIN), albúmina; amilasa y lipasa; marcadores (AFP, CA 19-9)', 'Ictericia, dolor, hepatopatía, pancreatitis, tumores'],
        ['**Ecografía**', 'Vesícula (cálculos con sombra acústica, pared mayor de 3-4 mm), **calibre del colédoco** (menos de 6-7 mm), quistes (hidatídicos), abscesos, ascitis, hígado y porta', '**Primer estudio** del dolor del hipocondrio derecho y de la ictericia'],
        ['**TC con contraste** (fases arterial, portal y venosa)', 'Tumores (**CHC: hipercaptación arterial y lavado**), abscesos, quistes, **necrosis pancreática**, relación con los vasos', 'Estadificación, pancreatitis grave, masa hepática o pancreática'],
        ['**RM / colangio-RM (CRM)**', 'Lesiones hepáticas (hemangioma, HNF), **vía biliar y conducto pancreático sin invasión**', 'Coledocolitiasis, estenosis, quistes pancreáticos'],
        ['**CPRE**', 'Canula la papila; **diagnóstica y terapéutica**', 'Coledocolitiasis, colangitis, estenosis'],
        ['**Ecoendoscopia**', 'Páncreas, colédoco distal y ampolla con alta resolución; **punción**', 'Tumores pequeños, microlitiasis, estadificación'],
        ['**Colangiografía percutánea / operatoria**', 'Contraste por el hígado o por el cístico', 'Cuando la CPRE no es posible; durante la colecistectomía'],
        ['**Intervencionismo**', 'Drenaje percutáneo (abscesos, vía biliar), embolización, **TIPS**, ablación', 'Tratamiento mínimamente invasivo'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 47 a 63 y 85; Galindo, Enciclopedia de Cirugía Digestiva, caps. 400 a 491.')
    N(u, 'S-547', 'Radiología abdominal: TC axiales.', ['Hígado, vesícula, páncreas, porta, mesentérica superior y riñones en cortes axiales: así se ven en la TC.'], 190)
    N(u, 'S-548', 'Radiología abdominal: TC axiales (continuación).', ['Cortes más bajos: cabeza del páncreas, duodeno y asas.'], 190)
    oral(u, 'Para el **dolor del hipocondrio derecho o la ictericia** empiezo con **laboratorio** (patrón hepatocelular o colestásico) y **ecografía** (cálculos, pared de la vesícula, calibre del colédoco). Si hay sospecha de **coledocolitiasis** pido **colangio-RM** o **CPRE** (que además trata). Para **masas hepáticas y pancreáticas** y la **pancreatitis grave**, **TC con contraste por fases** (CHC con hipercaptación arterial y lavado; necrosis pancreática). La **ecoendoscopia** estadifica y punciona el páncreas; el **drenaje percutáneo** trata los abscesos y la vía biliar cuando la CPRE falla.')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una une anatomía con la patología de la unidad.')
    qa = [
        ('Describí la segmentación hepática de Couinaud.',
         '**8 segmentos** definidos por las **tres suprahepáticas** (límites) y las ramas de la **porta** (centro). La **cisura principal** (vena media) separa el hígado **derecho (V-VIII)** del **izquierdo (II-IV)**; la **cisura portal derecha** divide el sector anterior del posterior; la **umbilical** (falciforme) separa el lateral izquierdo (II-III) del medial (IV). El **caudado (I)** drena directo a la cava.'),
        ('¿Qué contiene el ligamento hepatoduodenal y para qué sirve la maniobra de Pringle?',
         'La **tríada portal**: **colédoco** (derecha, adelante), **arteria hepática propia** (izquierda) y **porta** (atrás). Detrás está el **foramen de Winslow**: se comprime el pedículo con una pinza (**Pringle**) para controlar el sangrado hepático (trauma, hepatectomía).'),
        ('¿Cuál es la irrigación del hígado y por qué la arteria hepática es clave para la vía biliar?',
         '**Dual**: **porta (75 % del flujo)** y **arteria hepática (25 %)**. La **vía biliar se irriga solo por la arteria hepática**: su lesión produce isquemia y estenosis biliar.'),
        ('Un quiste hidatídico del domo hepático puede abrirse a la pleura. ¿Por qué?',
         'Por el **área desnuda** del hígado (sin peritoneo, en contacto con el diafragma): el quiste erosiona el diafragma y comunica con la **pleura o el bronquio** (vómica hidatídica). La complicación más frecuente es la **ruptura a la vía biliar**, y la más grave la **ruptura al peritoneo** (anafilaxia y siembra).'),
        ('¿Cuáles son las anastomosis portosistémicas y qué manifestación tiene cada una?',
         '**Esofagogástrica** (gástrica izquierda → ácigos): **várices**; **rectal** (rectal superior → medias e inferiores): hemorroides; **paraumbilical**: **cabeza de medusa**; **retroperitoneal**: sin expresión clínica.'),
        ('Explicá el triángulo de Calot y la visión crítica de seguridad.',
         'Límites: **cístico** (lateral), **hepático común** (medial) y **borde hepático** (superior); contiene la **arteria cística**. La **visión crítica** exige el triángulo despejado, el tercio inferior de la vesícula separado del lecho y **solo dos estructuras que entran en la vesícula**. Evita la **lesión del colédoco**.'),
        ('Un paciente con ictericia progresiva indolora tiene la vesícula palpable. ¿Qué pensás?',
         '**Courvoisier-Terrier**: obstrucción neoplásica del colédoco distal: **cáncer de la cabeza del páncreas**, de la ampolla o del colédoco. Estudio: eco, **TC bifásica**, ecoendoscopia; cirugía: **Whipple** si es resecable.'),
        ('Diferenciá la colangitis aguda y la colecistitis aguda.',
         '**Colecistitis**: cístico obstruido, dolor del hipocondrio derecho, **Murphy**, eco con pared engrosada: colecistectomía. **Colangitis**: obstrucción e infección del **colédoco**: **Charcot** (fiebre, ictericia, dolor) o **Reynolds** (+ shock y confusión): **antibióticos y drenaje urgente** (CPRE).'),
        ('¿Cómo se clasifica la pancreatitis aguda según Atlanta 2012?',
         '**Morfología**: edematosa o necrotizante. **Gravedad**: leve, moderadamente grave (falla orgánica transitoria o complicación local) y grave (**falla orgánica persistente más de 48 horas**). **Colecciones**: APFC y ANC (menos de 4 semanas); pseudoquiste y WON (más de 4 semanas).'),
        ('Describí la paracentesis: sitio, técnica y estudios.',
         '**Fosa ilíaca izquierda** (2-3 cm medial y cefálico a la espina ilíaca anterosuperior, punto de Monro) o **línea media infraumbilical**; se evitan los vasos epigástricos y las cicatrices; **trayecto en Z**. En el líquido: **PMN (≥ 250 = PBE), SAAG (≥ 1,1 = hipertensión portal)**, albúmina, cultivo. Si se extraen más de 5 litros, **reponer albúmina**.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Galindo, F. __Enciclopedia de Cirugía Digestiva__ (2020), SACD: caps. 400 (anatomía quirúrgica del hígado), 404 (abscesos), 407 y 409 (tumores y quistes), 412 y 414 (CHC y metástasis), 422 (hidatidosis), 431 (hipertensión portal), 437 (anatomía quirúrgica de las vías biliares), 440 a 445 (litiasis, colecistitis y colangitis), 448 (exploración de la vía biliar), 463 y 466 (cáncer de vesícula y de la vía biliar), 468 (anatomía quirúrgica del páncreas), 472 y 474 (pancreatitis), 480 (pancreatitis crónica), 482, 484 y 485 (tumores) y 491 (traumatismos duodenopancreáticos).',
          'Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025): caps. 47 a 63 y 85.',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: caps. 31 (hígado), 32 (vesícula biliar y sistema biliar extrahepático) y 33 (páncreas).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: caps. 37 (hígado), 38 (vías biliares) y 39 (páncreas).',
          'Banks, P. A. y col. (2013). Classification of acute pancreatitis—2012: revision of the Atlanta classification and definitions by international consensus. __Gut__, 62(1), 102-111 (bibliografía necesaria de la unidad).',
          'Rojas Duarte, M. y Marinkovic Gómez, B. __Cirugía en medicina general__ (2020) y Márquez Martín, R. y Muñoz Maldonado, G. __Cirugía general para el médico general__ (bibliografía complementaria).'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. La lámina de Netter o de Gray muestra la **anatomía real**: ante cualquier duda, **la lámina manda**. Los umbrales y las guías (Tokio, Atlanta, BCLC) cambian: verificá la versión vigente en tu bibliografía.')
    u.h3('Imágenes en blanco y negro')
    u.ul(['Las ecografías, tomografías y colangiografías de los libros están en escala de grises por ser estudios por imágenes; los dibujos de Galindo y los esquemas anatómicos son a color.'])
