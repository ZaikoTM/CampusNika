# -*- coding: utf-8 -*-
"""UP 9 · Parte B: abdomen y pelvis, shock y hemorragia, TEC, columna, quemaduras, muerte encefálica y procuración."""
from .up01e import N, G, L, oral
from .up09a import A, ATL


def abdomen(u):
    u.h2('Abdomen y pelvis en el trauma: qué órgano se rompe y dónde se acumula la sangre', intro='La pregunta del trauma abdominal es **¿hay sangrado o víscera hueca perforada?**, y la respuesta sale de la anatomía: órganos sólidos que se rompen con el trauma cerrado, vísceras huecas que se perforan con el penetrante y un retroperitoneo que esconde grandes hemorragias.')
    u.h3('Regiones y órganos según el mecanismo')
    u.tabla(['Región', 'Órganos', 'Qué se lesiona más', 'Pista clínica'], [
        ['**Toracoabdomen** (4.º-5.º EIC hasta el reborde costal)', 'Diafragma, hígado, bazo, estómago', '**Hígado y bazo** (trauma cerrado); **diafragma** (herida penetrante)', 'Herida por debajo del pezón; **signo de Kehr** (dolor en el hombro izquierdo) por irritación diafragmática'],
        ['**Abdomen anterior**', 'Intestino delgado, colon, mesenterio, estómago', 'Víscera hueca y mesenterio (cinturón de seguridad: **“signo del cinturón”**, lesión de **Chance** en columna)', 'Peritonitis precoz, equimosis en banda'],
        ['**Flancos y dorso**', 'Riñones, colon ascendente y descendente, duodeno', 'Riñón; lesiones retroperitoneales', 'Hematuria, equimosis en flanco (signo de **Grey Turner**)'],
        ['**Pelvis**', 'Vejiga, uretra, recto, vasos iliacos', 'Vejiga y uretra (fractura de pelvis)', 'Sangre en el meato, hematoma perineal, próstata alta'],
    ], fuente='ATLS 11.ª ed., cap. 21 (fig. 21-1); Netter, láminas S-341 y S-342.')
    A(u, 'a311_0', 'El toracoabdomen: zona de la pared torácica que cubre el diafragma, el hígado, el bazo y el estómago.', 'fig. 21-1', ['La zona violeta se extiende **hasta el 4.º-5.º espacio**: una herida penetrante ahí puede lesionar el **abdomen** aunque parezca torácica.'], 110)
    N(u, 'S-341', 'Arterias y venas de la pared posterior del abdomen.', ['Aorta abdominal, cava inferior, vasos renales y suprarrenales: el **retroperitoneo** que puede ocultar un hematoma grande.'], 205)
    N(u, 'S-342', 'Vasos de la pared posterior del abdomen (continuación).', ['Seguí la aorta hasta la bifurcación iliaca: referencia del **hematoma retroperitoneal de la zona 1**.'], 205)
    u.h3('Retroperitoneo: tres zonas')
    u.tabla(['Zona', 'Ubicación', 'Contiene', 'Regla de la exploración'], [
        ['**1 (central)**', 'Línea media, desde el hiato aórtico hasta el promontorio', 'Aorta, cava, páncreas, duodeno, vasos mesentéricos y celíaco', 'Se **explora siempre** (en trauma penetrante o cerrado) porque el sangrado es de grandes vasos'],
        ['**2 (lateral)**', 'Flancos, a cada lado', 'Riñones y vasos renales, colon ascendente y descendente', 'Se explora si el hematoma es **expansivo, pulsátil** o hay penetración; el hematoma contuso estable se **observa**'],
        ['**3 (pelviana)**', 'Pelvis', 'Vasos iliacos y plexo venoso pelviano', '**No se abre** en trauma cerrado (el hematoma se taponea); se explora en penetrante'],
    ], fuente='ATLS 11.ª ed., cap. 21; Giménez, Cirugía, 2.ª ed., trauma abdominal.')
    u.h3('FAST: las cuatro ventanas')
    A(u, 'a315_0', 'FAST: posiciones de la sonda para las cuatro ventanas (pericárdica, hepatorrenal, esplenorrenal y pélvica).', 'fig. 21-4', ['**Subxifoidea** (corazón), **flanco derecho** (espacio de **Morison**, entre el hígado y el riñón), **flanco izquierdo** (entre el bazo y el riñón) y **suprapúbica** (fondo de saco de Douglas o espacio retrovesical).'], 105)
    A(u, 'a315_1', 'Ecografía del flanco derecho: líquido libre entre el hígado y el riñón (espacio de Morison).', 'fig. 21-4', ['La flecha marca la **línea anecoica** de sangre libre.'], 80)
    u.ul(['**Espacio hepatorrenal (Morison)**: es el **más declive** de la cavidad peritoneal supina y el primero que se llena.',
          'Un **FAST positivo con hipotensión** → **laparotomía**. FAST negativo con shock: buscar otras fuentes (tórax, pelvis, huesos largos, retroperitoneo) o repetir.',
          'El **paciente estable** con FAST positivo o dudoso: **TC con contraste** (el único estudio que ve el retroperitoneo y las lesiones sólidas).',
          'El **lavado peritoneal diagnóstico** se reserva para quien no puede ir a la TC y el FAST no está disponible.'])
    u.h3('Órganos sólidos y víscera hueca')
    u.tabla(['Órgano', 'Mecanismo', 'Datos anatómicos y clínicos', 'Conducta'], [
        ['**Bazo**', 'Trauma cerrado (el órgano **más lesionado**)', 'Está protegido por las **costillas 9-11 izquierdas**; **signo de Kehr**; irrigado por la arteria esplénica (tronco celíaco)', 'Estable: **tratamiento no operatorio** con seguimiento; inestable: **esplenectomía** (y vacunación)'],
        ['**Hígado**', 'Trauma cerrado y penetrante', 'Lóbulo derecho más expuesto; el sangrado venoso hepático es difícil de controlar', '**Packing**, maniobra de Pringle (clampeo del pedículo), cirugía de control de daños'],
        ['**Riñón**', 'Trauma de flanco', 'Hematuria; está en el retroperitoneo; lesión del pedículo = sangrado masivo', 'Estable: **TC**; observar la mayoría'],
        ['**Duodeno y páncreas**', 'Golpe epigástrico (**manubrio de bicicleta**)', 'Retroperitoneales: el hematoma puede estar silente; **amilasa** elevada tardía', 'TC con contraste; exploración'],
        ['**Intestino y mesenterio**', 'Cinturón de seguridad (cerrado) o herida penetrante', 'Perforación → peritonitis; avulsión mesentérica → isquemia', 'Laparotomía; **lesión de Chance** acompaña'],
    ], fuente='ATLS 11.ª ed., cap. 21; Michans, Cirugía, 5.ª ed., trauma de abdomen.')
    u.box('clave', 'Conectá con las UP2, UP5 y UP6', 'La **anatomía del bazo, el hígado y el páncreas** está en los atlas de la **UP5** y de la **UP2** (abdomen agudo); la de la **pared abdominal y las hernias**, en la **UP6**. Esta guía solo suma lo que cambia en el trauma: **quién se rompe con qué mecanismo** y cómo se busca.')
    u.h3('Pelvis: por qué la fractura es una hemorragia')
    A(u, 'a320_0', 'Mecanismos de la fractura de pelvis: compresión anteroposterior, lateral y cizallamiento vertical.', 'fig. 21-10', ['La dirección de la fuerza (flechas rojas) define el patrón y el **volumen** que puede ocupar la sangre.'], 80)
    A(u, 'a107_0', 'El volumen de la pelvis aumenta con la apertura del anillo y aloja hasta varios litros de sangre.', 'fig. 6-6', ['Con el anillo **abierto** el volumen se duplica y **deja de taponar** el sangrado.'], 90)
    u.ul(['Control inicial: **faja pelviana a la altura de los trocánteres mayores** (no de las crestas ilíacas), **rotación interna de las piernas** y vendaje; reduce el volumen y el sangrado venoso.',
          'Fuentes: **plexo venoso presacro**, hueso esponjoso y **ramas de la iliaca interna**; si no se controla, **angioembolización o packing preperitoneal**.',
          'Estudios y detalle del anillo: ver el atlas de la **UP8** (pelvis y acetábulo).'])
    oral(u, 'En el trauma cerrado de abdomen el órgano más lesionado es el **bazo**, seguido del **hígado**; en el penetrante, el intestino delgado y el hígado. Busco **líquido libre** con el **FAST**, cuya ventana más sensible es el **espacio hepatorrenal de Morison**. Un paciente **inestable con FAST positivo** va a **laparotomía**; el **estable** va a **TC**. El **retroperitoneo** se divide en tres zonas: la **1** (aorta, cava, páncreas y duodeno) siempre se explora; la **2** (riñones y colon) según el hematoma; la **3** (pelvis) no se abre en el trauma cerrado.', 'Así lo decís en el oral: abdomen')


def shock(u):
    u.h2('Shock hemorrágico: los cinco sitios, el control del sangrado y los accesos', intro='Todo paciente hipotenso traumatizado está sangrando hasta que se demuestre otra cosa. La anatomía permite ubicar **dónde** y **cuánto** puede sangrar cada sitio.')
    u.h3('Los cinco sitios de hemorragia')
    A(u, 'a104_0', 'Los cinco sitios donde puede perderse sangre: calle, tórax, abdomen, retroperitoneo/pelvis y huesos largos.', 'fig. 6-2', ['La figura agrupa **externa**, **tórax**, **abdomen**, **retroperitoneo y pelvis** y **fracturas de huesos largos** (fémur ≈ 1,5 L; tibia ≈ 0,5-1 L).'], 105)
    u.tabla(['Sitio', 'Capacidad de sangrado', 'Cómo se descarta o controla'], [
        ['**Externo (en la escena)**', 'Total', 'Presión directa, **torniquete** (x del xABCDE), empaquetamiento'],
        ['**Tórax**', 'Hasta **3 litros** por hemitórax', 'Examen, radiografía, **tubo pleural**'],
        ['**Abdomen**', 'Ilimitada', '**FAST**, TC, laparotomía'],
        ['**Retroperitoneo y pelvis**', 'Varios litros', 'Radiografía de pelvis, **faja**, angioembolización'],
        ['**Huesos largos**', '**Fémur** 1-1,5 L, tibia 0,5-1 L, húmero 0,5 L, pelvis más de 3 L', 'Examen e **inmovilización**: férula de tracción en el fémur'],
    ], fuente='ATLS 11.ª ed., cap. 6 (fig. 6-2); Orrego y Morán (2014), fracturas.')
    u.h3('Clases de hemorragia y qué dice el paciente')
    u.tabla(['Clase', 'Pérdida', 'Frecuencia cardíaca', 'Presión arterial', 'Estado mental'], [
        ['**I**', 'Menos de 15 % (< 750 mL)', 'Normal', 'Normal', 'Ansioso'],
        ['**II**', '15-30 % (750-1.500 mL)', 'Aumentada (> 100)', 'Normal; **presión de pulso disminuida**', 'Ansioso'],
        ['**III**', '30-40 % (1.500-2.000 mL)', 'Más de 120', '**Disminuida**', 'Ansioso o confuso'],
        ['**IV**', 'Más de 40 % (> 2.000 mL)', 'Más de 140', '**Muy disminuida**', 'Confuso o letárgico'],
    ], fuente='ATLS 11.ª ed., cap. 6.')
    u.ul(['**La hipotensión es un signo tardío**: en el joven el organismo compensa hasta perder el 30 % de la volemia.',
          '**Tríada letal**: **hipotermia, acidosis y coagulopatía**. Por eso se entibia, se usa **sangre (hemoderivados 1:1:1)** y **ácido tranexámico** en las primeras 3 horas, y no se corrigen con cristaloides en exceso.',
          '**Reanimación hemostática y control de daños**: se acepta una hipotensión permisiva hasta controlar el sangrado (salvo en el TEC).'])
    u.h3('Arterias principales: dónde se comprimen y dónde se pone el torniquete')
    N(u, 'S-303', 'Arterias principales y puntos de localización del pulso.', ['**Carótida**, **axilar**, **braquial**, **radial**, **femoral**, **poplítea**, **tibial posterior** y **pedia**: los puntos donde se palpa y se **comprime** para controlar el sangrado.', 'El **torniquete** se coloca **2 a 3 dedos por encima** de la herida, sobre una zona ósea única (muslo o brazo).'], 205)
    N(u, 'S-304', 'Venas sistémicas principales.', ['**Antecubital**, basílica y cefálica; **femoral** y **safena interna** (por delante del maléolo medial); **yugular** y subclavia.'], 205)
    A(u, 'a109_1', 'Sitios de acceso intraóseo: húmero proximal, tibia proximal y distal, esternón y otros.', 'fig. 6-10', ['Los puntos amarillos y verdes marcan los lugares de inserción: se usa cuando **no se logra una vía venosa** en el paciente en shock.'], 100)
    u.box('clave', 'Accesos vasculares', 'Dos vías periféricas de **calibre grueso** en la fosa antecubital; si fallan, **intraósea** (húmero proximal o tibia proximal) o **vía central femoral/ subclavia/ yugular**; la **disección venosa de la safena** (por delante del maléolo medial) es la técnica de rescate. **No se coloca una vía** en un miembro con fractura proximal.')
    oral(u, 'El shock del traumatizado es **hemorrágico hasta que se demuestre lo contrario**. Los **cinco sitios** son: el exterior, el **tórax** (hasta 3 litros por hemitórax), el **abdomen**, el **retroperitoneo y la pelvis**, y los **huesos largos** (el **fémur** hasta 1,5 litros). Se clasifica en **cuatro clases**: la hipotensión aparece recién en la **clase III**. Se controla con **presión directa y torniquete**, **faja pelviana**, **hemoderivados** y **ácido tranexámico**, vigilando la **tríada letal** (hipotermia, acidosis y coagulopatía). El acceso: dos vías gruesas, y si fallan, **intraósea**.', 'Así lo decís en el oral: shock hemorrágico')


def tec(u):
    u.h2('Cabeza: cuero cabelludo, meninges, hematomas intracraneales y herniación', intro='El traumatismo de cráneo se resuelve con la anatomía de las **capas** (piel, hueso, meninges, espacios) y de las **estructuras vasculares** que sangran: la arteria meníngea media, las venas puente y los senos venosos.')
    u.h3('Las capas: de afuera hacia adentro')
    u.tabla(['Capa', 'Dato', 'Aplicación'], [
        ['**Cuero cabelludo (SCALP)**', '**S**kin, tejido **C**onectivo denso, **A**poneurosis (galea), tejido **L**axo, **P**ericráneo', 'Sangra mucho (vasos que **no se retraen** en el tejido denso); la herida se **explora** buscando fractura. En el **espacio laxo** se acumulan hematomas que se extienden'],
        ['**Cráneo**', 'Hueso con tabla externa, diploe y tabla interna; **pterion**: unión de frontal, parietal, temporal y esfenoides (zona débil)', 'La fractura del **pterion** lesiona la **arteria meníngea media**'],
        ['**Duramadre**', 'Membrana fibrosa adherida a la tabla interna; forma la **hoz** y la **tienda**', 'Entre la duramadre y el hueso: **espacio epidural**'],
        ['**Aracnoides**', 'Membrana delgada; **espacio subaracnoideo** con líquido cefalorraquídeo y las arterias', 'Hemorragia **subaracnoidea** (rotura de vasos y aneurismas)'],
        ['**Piamadre**', 'Adherida al cerebro', 'El **espacio subdural** es virtual entre la duramadre y la aracnoides: **venas puente**'],
    ], fuente='Netter, láminas S-26 a S-30; ATLS 11.ª ed., cap. 7.')
    N(u, 'S-26', 'Meninges y venas diploicas.', ['Capas desde el cuero cabelludo hasta el cerebro; las **venas diploicas** comunican el cuero cabelludo con los senos venosos (vía de infección).'], 205)
    N(u, 'S-27', 'Arterias meníngeas.', ['**Arteria meníngea media** (rama de la maxilar): corre por la tabla interna en el **pterion**.', 'Su rotura da el **hematoma epidural**.'], 205)
    N(u, 'S-28', 'Meninges y venas cerebrales superficiales.', ['**Venas puente** que cruzan el espacio subdural y drenan al **seno sagital superior**.', 'Su rotura en el golpe (sobre todo en ancianos y alcohólicos) da el **hematoma subdural**.'], 205)
    N(u, 'S-29', 'Senos venosos de la duramadre: corte sagital.', ['Seno sagital superior e inferior, seno recto y confluencia.', 'La **hoz** y la **tienda del cerebelo** dividen la cavidad en compartimentos: el origen de las **herniaciones**.'], 205)
    N(u, 'S-30', 'Senos venosos de la duramadre: base del cráneo.', ['Seno cavernoso, petroso y sigmoideo: la **fractura de base** puede lesionarlos.'], 190)
    u.h3('Hematomas intracraneales: cómo se distinguen')
    u.tabla(['', '**Epidural**', '**Subdural agudo**', '**Subaracnoidea / contusión**'], [
        ['**Vaso**', '**Arteria meníngea media** (a veces seno)', '**Venas puente**', 'Arterias o contusión cortical'],
        ['**Cráneo**', 'Casi siempre **fractura temporal o parietal**', 'Puede no haber fractura', 'Variable'],
        ['**Forma en la TC**', '**Lenticular (biconvexa)**: no cruza las suturas', '**En semiluna**: cruza suturas, **no cruza la línea media**', 'Sangre en cisternas y surcos'],
        ['**Clínica**', '**Intervalo lúcido** y luego deterioro rápido', 'Coma desde el inicio; **peor pronóstico**', 'Cefalea, rigidez de nuca'],
        ['**Tratamiento**', '**Craneotomía urgente** si hay efecto de masa (buen pronóstico)', 'Craneotomía si es grande o con desvío', 'Medicación y observación'],
    ], fuente='ATLS 11.ª ed., cap. 7 (fig. 7-1); Netter, láminas S-26 a S-28.')
    A(u, 'a121_0', 'Meninges y espacios: normal, hematoma epidural (lenticular) y hematoma subdural (en semiluna).', 'fig. 7-1A', ['Compará la **forma**: el epidural queda **limitado por las suturas** (biconvexo); el subdural **se extiende** por la superficie.'], 80)
    A(u, 'a121_1', 'Diferentes hematomas y hemorragias intracraneales: epidural, subdural e intracerebral.', 'fig. 7-1B', ['Seguí cuál es **extraaxial** (fuera del cerebro: epidural y subdural) y cuál **intraaxial** (dentro del cerebro).'], 100)
    A(u, 'ct_hemorragias', 'Tomografías de distintos tipos de hemorragia intracraneal postraumática.', 'fig. 7-15', ['Observá la **forma** de la colección (lenticular o en semiluna), si hay **desvío de la línea media** y si hay **borramiento de los surcos**.'], 120)
    u.h3('Presión intracraneal y herniación')
    u.ul(['**Doctrina de Monro-Kellie**: el cráneo es un compartimento rígido con tres volúmenes (cerebro, sangre y LCR); si uno crece, los otros ceden; cuando se agotan, la **presión sube de golpe**.',
          '**Presión de perfusión cerebral (PPC) = PAM − PIC**; se mantiene un objetivo (más de 60 mmHg) y se evita la **hipotensión**, que duplica la mortalidad del TEC.',
          '**Tríada de Cushing**: **hipertensión, bradicardia y respiración irregular**: signo **tardío** de hipertensión endocraneana grave.',
          'Elevar la cabecera, osmoterapia (manitol o solución hipertónica), sedación y **craneotomía descompresiva**; la **hiperventilación** solo como puente breve en herniación.'])
    N(u, 'S-31', 'Cerebro: visión lateral.', ['Lóbulos frontal, parietal, temporal y occipital; el temporal queda cerca de la **tienda**.'], 190)
    A(u, 'a122_2', 'Herniación cerebral: el hematoma empuja el cerebro bajo la hoz (subfalcina) y sobre la tienda (uncal).', 'fig. 7-4', ['Seguí las flechas: el **uncus** desciende por la **incisura tentorial** y comprime el **III par** y el pedúnculo.'], 105)
    u.box('alerta', 'Herniación uncal: pupila dilatada del mismo lado', 'El **uncus** del lóbulo temporal comprime el **nervio oculomotor (III)**: **midriasis arreactiva ipsilateral**, luego hemiparesia **contralateral** (pedúnculo) y coma. Es una **urgencia neuroquirúrgica**. Una pupila dilatada en un traumatizado **no se atribuye a la lesión ocular** hasta descartar herniación.')
    A(u, 'ct_pic', 'Hallazgos críticos de la TC en el TCE: cisternas basales y foramen magno (normales y borrados) y desvío de la línea media.', 'fig. 7-16', ['Las **cisternas basales abiertas** son normales; **borradas** indican hipertensión endocraneana.'], 125)
    u.h3('Fractura de base de cráneo: signos y precauciones')
    u.ul(['**Ojos de mapache** (equimosis periorbitaria), **signo de Battle** (equimosis retroauricular), **hemotímpano**, **otorraquia o rinorraquia** (LCR).',
          'Fosa **anterior**: lámina cribosa (rinorraquia, **anosmia**); **media**: peñasco (otorraquia, **parálisis facial**, sordera); **posterior**: hemorragia retroauricular.',
          '**Contraindicaciones**: **no colocar sonda nasogástrica ni intubación nasal** (puede atravesar la base del cráneo); se coloca por vía **orogástrica**.'])
    u.h3('Escala de Glasgow')
    u.tabla(['Respuesta', 'Puntaje'], [
        ['**Ocular**', '4 espontánea · 3 a la voz · 2 al dolor · 1 ninguna'],
        ['**Verbal**', '5 orientado · 4 confuso · 3 palabras inapropiadas · 2 sonidos incomprensibles · 1 ninguna'],
        ['**Motora**', '6 obedece · 5 localiza · 4 retira · 3 flexión anormal (decorticación) · 2 extensión anormal (descerebración) · 1 ninguna'],
    ], fuente='ATLS 11.ª ed., cap. 7. **Grave: 8 o menos** (vía aérea definitiva); moderado 9-13; leve 14-15.')
    oral(u, 'El hematoma **epidural** se produce por rotura de la **arteria meníngea media** tras fractura del **pterion**; en la TC es **lenticular**, no cruza las suturas, y evoluciona con **intervalo lúcido**. El **subdural agudo** se debe a **venas puente**, es **en semiluna**, cruza las suturas y tiene peor pronóstico. La **hipertensión endocraneana** se explica por **Monro-Kellie**; el **uncus** que hernia comprime el **III par** (midriasis ipsilateral). **Glasgow 8 o menos** es TEC grave e indica **vía aérea definitiva**. En la fractura de base **no se pasa sonda nasogástrica**.', 'Así lo decís en el oral: traumatismo de cráneo')


def columna(u):
    u.h2('Columna cervical y médula en el politraumatizado: inmovilización y shock neurogénico', intro='En el trauma **toda columna se considera lesionada hasta demostrar lo contrario**. La anatomía de la columna, las raíces y los síndromes medulares está en el atlas de la **UP8**; acá se revisa lo que importa en la primera hora.')
    u.ul(['**Inmovilización completa** (collar rígido, tabla y fijación lateral) en todo paciente con mecanismo de riesgo, dolor, déficit neurológico o alteración de la conciencia; se **retira** cuando se descarta la lesión con una regla clínica (**NEXUS** o **Canadian C-Spine**) o imágenes.',
          '**Shock neurogénico** (lesión **por encima de T6**): **hipotensión con bradicardia** y piel caliente, por pérdida del tono simpático; primero se descarta el **shock hemorrágico** (más frecuente) y se trata con líquidos y vasopresores.',
          'En el **sexo masculino** el **priapismo** acompaña la lesión alta; la **pérdida del reflejo bulbocavernoso** señala el **shock espinal**.',
          'La lesión **sin hallazgos radiográficos (SCIWORA)** es frecuente en el niño y en el anciano con canal estrecho.'])
    A(u, 'a125_0', 'Corte de la médula espinal: tractos motores (azul) y sensitivos (rojo).', 'fig. 7-10', ['Los **tractos corticoespinales** (motores) y las columnas posteriores y espinotalámicos (sensitivos) explican los síndromes medulares.'], 90)
    A(u, 'a127_0', 'Dermatomas: mapa de los niveles sensitivos.', 'fig. 7-11', ['Útiles para determinar el **nivel de la lesión**: **C4** clavícula, **T4** pezón, **T10** ombligo, **L1** ingle, **S4-S5** región perianal.'], 130)
    N(u, 'S-53', 'Nervios craneales: esquema de la distribución motora y sensitiva.', ['Recordatorio de los **pares craneales** que se evalúan en el TEC y en la muerte encefálica (más adelante).'], 205)
    u.box('clave', 'Conectá con la UP1 y la UP8', 'El **bloqueo y la punción lumbar** (UP1) y la **anatomía vertebral y medular** (UP1, UP8) están desarrollados en sus atlas. Acá solo se retoma el **manejo inicial** y el **shock neurogénico**.')
    oral(u, 'Todo politraumatizado lleva **collar cervical** hasta descartar la lesión. Los síndromes se ordenan por la anatomía de los **tractos**: **corticoespinal** (motor), **columnas posteriores** (propiocepción) y **espinotalámico** (dolor y temperatura). La lesión **por encima de T6** produce **shock neurogénico**: hipotensión **con bradicardia**, a diferencia del shock hemorrágico (taquicardia).', 'Así lo decís en el oral: columna en el trauma')


def quemaduras(u):
    u.h2('Quemaduras: capas de la piel, profundidad, superficie y escarotomía', intro='La profundidad de la quemadura **es** la anatomía de la piel: hasta qué capa llegó la lesión. Con eso se deduce el dolor, el aspecto, la cicatrización y la necesidad de injerto.')
    u.h3('Las capas de la piel')
    N(u, 'S-4', 'Corte transversal de la piel.', ['**Epidermis** (sin vasos), **dermis papilar** y **reticular** (con folículos pilosos y glándulas) e **hipodermis** (grasa).', 'Los **anexos** (folículos y glándulas sudoríparas) son el origen de la **reepitelización** en las quemaduras de espesor parcial.'], 205)
    u.tabla(['Profundidad', 'Capa afectada', 'Aspecto y dolor', 'Evolución'], [
        ['**Superficial** (1.er grado)', 'Epidermis', 'Eritema seco, **doloroso**; sin ampollas (ej. quemadura solar)', 'Cura en 3-6 días, sin cicatriz'],
        ['**Espesor parcial superficial** (2.º grado A)', 'Dermis papilar', '**Ampollas**, base rosada, húmeda, **muy dolorosa**, **blanquea a la presión**', 'Cura en 2 semanas, mínima cicatriz'],
        ['**Espesor parcial profundo** (2.º grado B)', 'Dermis reticular', 'Base blanquecina o roja moteada, **menos dolorosa**, **no blanquea**', 'Cura en más de 3 semanas con **cicatriz hipertrófica**; suele requerir **injerto**'],
        ['**Espesor completo** (3.er grado)', 'Toda la dermis hasta la hipodermis', '**Blanca, marrón o carbonizada, acartonada (como cuero), indolora** (se destruyeron las terminaciones nerviosas)', '**Injerto**; riesgo de infección y contractura'],
    ], fuente='ATLS 11.ª ed., cap. 9 (fig. 9-3); Giménez, Cirugía, 2.ª ed., cap. 75.')
    A(u, 'quemadura_prof', 'Profundidad de la quemadura: piel sana, superficial, espesor parcial y espesor completo.', 'fig. 9-3', ['Comparalo con el corte de piel de Netter: a mayor profundidad, más capas destruidas y **menos folículos que reepitelicen**.'], 110)
    u.h3('Superficie quemada: regla de los nueves')
    A(u, 'a158_0', 'Regla de los nueves en el adulto: cabeza 9 %, cada miembro superior 9 %, tronco anterior y posterior 18 % cada uno, cada miembro inferior 18 % y genitales 1 %.', 'fig. 9-2', ['Solo se cuentan las quemaduras de **espesor parcial y completo**.', 'La **palma del paciente con los dedos** equivale a **1 %** de la superficie.'], 110)
    A(u, 'a158_1', 'En el niño la cabeza es proporcionalmente mayor y los miembros inferiores menores.', 'fig. 9-2', ['Por eso se usan **tablas pediátricas** (Lund-Browder) y no la regla de los nueves del adulto.'], 80)
    u.h3('Quemadura de la vía aérea y escarotomía')
    u.ul(['Sospechar lesión de vía aérea con: **quemadura en espacio cerrado, vibrisas chamuscadas, hollín en la boca o el esputo, voz ronca, estridor**; el edema progresa en horas, por eso se **intuba temprano**.',
          '**Intoxicación por monóxido de carbono**: la **carboxihemoglobina** altera la saturación; se trata con **oxígeno al 100 %**.',
          '**Quemadura circunferencial de espesor completo** en un miembro o en el tórax: la escara **rígida** comprime por debajo (síndrome compartimental, isquemia, hipoventilación). Se hace **escarotomía**: incisiones **medial y lateral** (línea medioaxial) a través de la escara hasta el tejido subcutáneo; en el codo se **cuida el nervio cubital** y en la rodilla el **peroneo**.'])
    A(u, 'a160_0', 'Escarotomía de la extremidad: incisiones longitudinales a través de la escara.', 'fig. 9-4', ['La incisión **no entra en el músculo**: libera la escara y el **compartimento** se descomprime.'], 100)
    u.box('clave', 'Reanimación con líquidos', '**Ringer lactato**: Parkland **4 mL × kg × % de superficie quemada en 24 horas**, la mitad en las **primeras 8 horas desde el momento de la quemadura**; el ATLS 11 sugiere iniciar con **2 mL × kg × %** y **ajustar según la diuresis** (0,5 mL/kg/h en el adulto). En las quemaduras eléctricas se vigila la **mioglobinuria**.')
    oral(u, 'La piel tiene **epidermis, dermis (papilar y reticular) e hipodermis**. La **profundidad** se deduce de la capa afectada: la **superficial** (epidermis) es dolorosa y cura sola; la de **espesor parcial** conserva anexos y reepiteliza (superficial: ampollas y dolorosa; profunda: **menos dolor, no blanquea**, deja cicatriz); la de **espesor completo** es **acartonada e indolora** y requiere injerto. La superficie se calcula con la **regla de los nueves** (cabeza 9, cada brazo 9, tronco 18 y 18, cada pierna 18, genitales 1). La quemadura **circunferencial** obliga a la **escarotomía**.', 'Así lo decís en el oral: quemaduras')


def muerte_encefalica(u):
    u.h2('Muerte encefálica y procuración de órganos: tronco, pares craneales y circulación cerebral', intro='El diagnóstico de muerte encefálica es **clínico** y **anatómico**: se demuestra que el **tronco encefálico** (y sus pares craneales) y la corteza ya no funcionan. Cada reflejo explora un arco con un par craneal determinado.')
    u.h3('Tronco encefálico y pares: qué se explora')
    N(u, 'S-40', 'Tronco encefálico: visión anterior.', ['Mesencéfalo, protuberancia y bulbo: la salida de los **pares craneales** (III a XII).', 'El **bulbo** contiene el **centro respiratorio**: la apnea demuestra su cese.'], 205)
    N(u, 'S-54', 'Núcleos de los nervios craneales en el tronco encefálico: esquema.', ['Núcleos de los pares motores y sensitivos en cada nivel del tronco.'], 205)
    u.tabla(['Reflejo', 'Cómo se explora', 'Arco (aferente → eferente)', 'Nivel del tronco'], [
        ['**Fotomotor**', 'Luz en el ojo: contracción pupilar', '**II** → **III**', 'Mesencéfalo'],
        ['**Corneano**', 'Tocar la córnea con algodón: parpadeo', '**V (oftálmico)** → **VII**', 'Protuberancia'],
        ['**Oculocefálico** (ojos de muñeca)', 'Girar la cabeza: los ojos se mueven (en muerte encefálica **permanecen fijos**)', '**VIII** → **III y VI**', 'Mesencéfalo y protuberancia'],
        ['**Oculovestibular** (calóricas)', 'Agua helada en el oído: desviación ocular tónica', '**VIII** → **III y VI**', 'Protuberancia'],
        ['**Nauseoso y tusígeno**', 'Estimular la faringe y la tráquea', '**IX y X** → **IX y X**', 'Bulbo'],
        ['**Respiración (prueba de apnea)**', 'Desconexión del ventilador con oxígeno', 'Centro respiratorio **bulbar**', 'Bulbo'],
    ], fuente='Netter, láminas S-40, S-53 y S-54; Giménez, Cirugía, 2.ª ed., cap. 94.')
    u.h3('Qué hay que cumplir antes de examinar')
    u.ul(['**Causa estructural conocida e irreversible** (TEC, hemorragia, anoxia) y coma con **Glasgow 3**.',
          '**Descartar confundidores**: **hipotermia** (temperatura central mayor de 35 °C), **hipotensión** (TAS mayor de 90 mmHg), **fármacos** (sedantes, relajantes, barbitúricos), alteraciones metabólicas y endocrinas.',
          '**Examen clínico completo** con ausencia de **todos los reflejos de tronco** y respuesta motora de origen encefálico; **prueba de apnea**: sin movimientos respiratorios cuando la **PaCO₂ alcanza 60 mmHg** (o 20 por encima de la basal).',
          'Los **reflejos espinales** (retirada, tendinosos) pueden persistir y **no excluyen** la muerte encefálica.'])
    u.h3('Estudios auxiliares: la circulación cerebral')
    N(u, 'S-45', 'Círculo arterial cerebral (polígono de Willis).', ['Carótidas internas y vertebrobasilar: en la muerte encefálica **cesa el flujo** por la hipertensión endocraneana extrema.', 'El **Doppler transcraneal** y la **angiografía** demuestran la ausencia de flujo (**“flujo de vaivén”**).'], 205)
    N(u, 'S-44', 'Arterias del encéfalo: visión inferior.', ['Basilar y vertebrales: irrigan el tronco encefálico.'], 190)
    u.ul(['**Estudios de flujo**: **Doppler transcraneal** (de elección si el operador está entrenado), angiografía cerebral, gammagrafía.',
          '**Estudios eléctricos**: **EEG** (silencio eléctrico) y potenciales evocados.',
          'Dos exámenes clínicos con el **intervalo** que fija el protocolo del **INCUCAI**, y a veces un estudio auxiliar; **la hora de muerte** es la del **segundo examen** o la de la prueba confirmatoria.'])
    u.h3('Procuración: órganos y tiempos')
    u.tabla(['Órgano', 'Tiempo de isquemia fría tolerado (aprox.)', 'Dato anatómico'], [
        ['**Corazón**', '4-6 horas', 'Se extrae con aorta y arteria pulmonar; necesita ritmo sinusal'],
        ['**Pulmón**', '6-8 horas', 'Preservar la vía aérea y el drenaje venoso'],
        ['**Hígado**', '12 horas', 'Se preserva el **pedículo** (arteria hepática, porta y colédoco) y la cava'],
        ['**Páncreas**', '12-18 horas', 'Junto con el duodeno'],
        ['**Riñón**', '24-36 horas', 'Arteria y vena renales y uréter; es el órgano **más trasplantado**'],
        ['**Córnea y tejidos**', 'Días', 'Pueden donarse también en **paro cardíaco**'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 94 (Procuración y trasplante); Ley 27.447.')
    u.box('alerta', 'Roles y marco legal (se estudian aparte)', 'La **comunicación de malas noticias**, la **bioética**, el **triage** y la **Ley 27.447** (donante presunto, rol del **INCUCAI** y de los organismos jurisdiccionales) no son anatómicos: se estudian con el material de la sala. Lo anatómico es lo que sustenta el diagnóstico: **tronco, pares y flujo cerebral**.')
    oral(u, 'La **muerte encefálica** es el cese irreversible de las funciones del encéfalo. Antes de examinar descarto **hipotermia, hipotensión, fármacos y alteraciones metabólicas**. El examen muestra **coma profundo** y **ausencia de reflejos del tronco**: **fotomotor (II-III)**, **corneano (V-VII)**, **oculocefálico y oculovestibular (VIII-III-VI)**, **nauseoso y tusígeno (IX-X)**. La **prueba de apnea** (ausencia de respiración con PaCO₂ de 60 mmHg) explora el **centro respiratorio bulbar**. Se confirma con estudios de **flujo** (Doppler transcraneal) o **EEG**. Es la **muerte de la persona** y se avisa al **INCUCAI**.', 'Así lo decís en el oral: muerte encefálica')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Todas unen la anatomía con el algoritmo xABCDE y con los contenidos de la unidad.')
    qa = [
        ('¿Cuáles son las zonas del cuello y por qué importan en una herida penetrante?',
         '**I**: escotadura esternal al borde inferior del cricoides (grandes vasos, ápex pulmonar; difícil acceso). **II**: cricoides al ángulo de la mandíbula (carótida, yugular, vago, laringe; la más expuesta). **III**: ángulo de la mandíbula a la base del cráneo (carótida interna distal; difícil acceso). Si atraviesa el **platisma** se estudia o se explora; los signos duros indican operar.'),
        ('¿Dónde se hace la cricotiroidotomía y cuándo no se hace?',
         'En la **membrana cricotiroidea**, entre el **cartílago tiroides** y el **cricoides**; se indica cuando **no puedo intubar ni ventilar**. En el niño **menor de 12 años** no se hace quirúrgica: se **punza**.'),
        ('Un paciente tiene disnea, hipotensión, ausencia de murmullo y yugulares ingurgitadas. ¿Qué es y qué hacés?',
         '**Neumotórax a tensión**: el aire queda atrapado por una válvula, el mediastino se desvía y la vena cava se acoda. El diagnóstico es **clínico**: **descompresión inmediata** con aguja o dedo en el **5.º espacio intercostal, línea axilar anterior** y luego **tubo pleural**. No se pide radiografía.'),
        ('¿Por qué se punza por el borde superior de la costilla?',
         'Porque el **paquete vasculonervioso intercostal (vena, arteria y nervio)** corre por el **borde inferior** de cada costilla, en el surco costal.'),
        ('¿Qué es el tórax inestable y qué es lo que causa la hipoxia?',
         '**Dos o más costillas contiguas** fracturadas en **dos o más sitios**; el segmento tiene **movimiento paradójico**, pero la hipoxia se debe a la **contusión pulmonar** subyacente y al dolor. Tratamiento: **analgesia** (regional) y oxígeno; ventilar si falla.'),
        ('Un herido de arma blanca precordial está hipotenso, con yugulares ingurgitadas y ruidos apagados. ¿Qué pensás y cómo lo confirmás?',
         '**Taponamiento cardíaco** (tríada de Beck). **FAST subxifoideo**; se resuelve con **ventana pericárdica o toracotomía**; la pericardiocentesis es un puente.'),
        ('¿Dónde se rompe la aorta en un accidente por desaceleración?',
         'En el **istmo**, justo distal a la subclavia izquierda, donde la aorta está fija por el **ligamento arterioso**. Se sospecha por el **mediastino ensanchado** y se confirma con **angio-TC**; tratamiento endovascular.'),
        ('¿Cuáles son las cuatro ventanas del FAST y cuál es la más declive?',
         '**Pericárdica (subxifoidea)**, **hepatorrenal (Morison)**, **esplenorrenal** y **pélvica**. La más declive en decúbito es el **espacio de Morison**.'),
        ('¿Cuáles son los cinco sitios de hemorragia y cuánto sangra cada uno?',
         '**Externo, tórax (hasta 3 L por hemitórax), abdomen, retroperitoneo/pelvis y huesos largos (fémur 1-1,5 L)**. La hipotensión aparece en la **clase III** (30-40 %).'),
        ('Un hombre cae de una moto, tiene una fractura parietal, está lúcido y a la hora se pone comatoso con la pupila derecha dilatada. ¿Qué pensás?',
         '**Hematoma epidural** por rotura de la **arteria meníngea media** (pterion), con **intervalo lúcido**; **herniación uncal** con compresión del **III par** (midriasis ipsilateral). **TC urgente** y **craneotomía**.'),
        ('¿Cómo se estima la profundidad de una quemadura y qué es una escarotomía?',
         'Por la **capa de la piel** afectada: **superficial** (epidermis), **parcial superficial** (dermis papilar: ampollas, dolor), **parcial profunda** (dermis reticular: menos dolor, no blanquea) y **completa** (acartonada, indolora). La **escarotomía** libera la escara de una quemadura **circunferencial** de espesor completo para evitar la isquemia y la hipoventilación.'),
        ('¿Qué reflejos se exploran en la muerte encefálica y qué par craneal explora cada uno?',
         '**Fotomotor (II-III)**, **corneano (V-VII)**, **oculocefálico y oculovestibular (VIII-III-VI)**, **nauseoso y tusígeno (IX-X)**, y la **apnea** (centro bulbar). Es la **muerte de la persona**; se avisa al **INCUCAI**.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['**ATLS, __Apoyo Vital Avanzado en Trauma__, 11.ª ed. (American College of Surgeons, 2025, edición en español)**: las ilustraciones, radiografías, tomografías y fotografías con la etiqueta “ATLS” provienen de este manual, con el número de figura al pie de cada imagen.',
          'Giménez, M. __Cirugía__, 2.ª ed. (2025): cap. 75 (quemaduras) y cap. 94 (procuración y trasplante).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: trauma de tórax y abdomen.',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: trauma, shock y quemaduras.',
          'Orrego, M. y Morán, M. __Ortopedia y Traumatología Básica__ (2014): lesiones por trauma y hemorragia en fracturas.',
          'Ley 27.447 de Trasplante de Órganos, Tejidos y Células; protocolos del INCUCAI.'])
    u.box('alerta', 'Partes de la unidad que no son anatómicas', 'El **triage prehospitalario y los sistemas de emergencia**, la **comunicación de malas noticias**, la **bioética** y el **marco legal de la donación** no tienen contenido anatómico: se estudian con los materiales de la sala. Esta guía cubre la **anatomía** que sostiene cada decisión del xABCDE.')
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. Ante cualquier duda, **la lámina del atlas manda**. Las cifras (volúmenes, porcentajes, tiempos de isquemia) se citan para estudiar y **pueden variar entre ediciones y protocolos**: verificá con el libro de tu cátedra.')
