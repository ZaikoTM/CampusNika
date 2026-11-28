# -*- coding: utf-8 -*-
"""UP 7 · Anatomía quirúrgica del cuello. Parte A: cuello (triángulos, fascias, niveles), tiroides y paratiroides, patología y cirugía tiroidea."""
from .up01e import N, G, L, oral

SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def cuello(u):
    u.h2('Cuello: regiones, fascias, estructuras y niveles ganglionares', intro='La unidad se llama “abordaje del paciente con tumoración cervical”: el cuello se explora y se opera siguiendo triángulos, fascias y niveles ganglionares.')
    u.h3('Referencias de superficie')
    u.tabla(['Referencia', 'Nivel', 'Qué marca'], [
        ['**Hioides**', '**C3**', 'Límite entre el cuello alto y el medio; el **quiste tirogloso** se mueve con él'],
        ['**Cartílago tiroides**', '**C4-C5**', 'Bifurcación carotídea (a la altura del borde superior)'],
        ['**Cartílago cricoides**', '**C6**', 'Unión de la laringe con la tráquea y de la faringe con el esófago; **la arteria tiroidea inferior y el recurrente** cruzan en este nivel; el **nivel III termina** acá'],
        ['**Escotadura yugular (esternal)**', '**T2**', 'Límite inferior del cuello; el **istmo tiroideo** está a unos 2 cm por encima'],
    ], fuente='Gray, Atlas de Anatomía, 3.ª ed., pág. 548 (anatomía de superficie del cuello); Netter, lámina S-190.')
    u.h3('Triángulos del cuello')
    u.tabla(['Triángulo', 'Límites', 'Contenido y utilidad'], [
        ['**Anterior**', 'Línea media, **borde anterior del ECM** y borde inferior de la mandíbula', 'Se subdivide en submentoniano, **submandibular**, **carotídeo** (ECM, digástrico y omohioideo) y **muscular**'],
        ['**Carotídeo**', 'ECM, vientre posterior del digástrico y vientre superior del omohioideo', '**Arteria carótida común y su bifurcación**, **yugular interna**, **nervio vago**, hipogloso, ganglios yugulares'],
        ['**Muscular**', 'Línea media, omohioideo y ECM', '**Tiroides**, tráquea, músculos pretiroideos'],
        ['**Posterior**', '**ECM** (adelante), **trapecio** (atrás) y **clavícula** (base)', 'Se divide por el omohioideo en **occipital** y **supraclavicular**; contiene el **nervio accesorio (XI)**, el plexo cervical y el **plexo braquial** (en el supraclavicular)'],
    ], fuente='Netter, láminas S-190 a S-193; Gray, págs. 550 y 552.')
    u.box('alerta', 'Nervio accesorio (XI): el que se lesiona en la biopsia ganglionar del triángulo posterior', 'Emerge por el **borde posterior del ECM** (tercio superior) y cruza el triángulo posterior **superficial, en la fascia** hasta el trapecio. Su lesión produce **hombro caído, escápula alada y dificultad para elevar el brazo**. Los **nervios cutáneos del cuello** (occipital menor, gran auricular, cervical transverso y supraclaviculares) salen en el **punto de Erb**, en el punto medio del borde posterior del ECM.')
    u.h3('Fascias cervicales y espacios (importan para las infecciones y los hematomas)')
    u.tabla(['Capa', 'Qué envuelve', 'Dato quirúrgico'], [
        ['**Superficial**', 'Platisma', 'Los colgajos de la tiroidectomía son **subplatismales**'],
        ['**Profunda: capa superficial (de revestimiento)**', 'Rodea todo el cuello, los **ECM y trapecio**, y las glándulas **submandibular y parótida**', 'Primer plano de cierre'],
        ['**Profunda: capa media (pretraqueal)**', 'Músculos infrahioideos y **vísceras** (tiroides, laringe, tráquea, esófago)', 'Un hematoma o infección del **espacio pretraqueal** comprime la vía aérea'],
        ['**Profunda: capa profunda (prevertebral)**', 'Músculos prevertebrales y columna', 'Entre ella y la visceral queda el **espacio retrofaríngeo**'],
        ['**Vaina carotídea**', 'Carótida común, **yugular interna** y **vago**', 'Las infecciones y las metástasis siguen la vaina hacia el mediastino'],
    ], fuente='Netter, láminas S-196 y S-197; Gray, pág. 550 (compartimentos y fascias del cuello).')
    u.ul(['**Espacio retrofaríngeo** y **espacio peligroso (danger space)**: comunican el cuello con el **mediastino posterior**: un absceso de la faringe puede producir **mediastinitis descendente**.',
          '**Angina de Ludwig**: celulitis del espacio **submandibular** y sublingual, de origen **dentario (molares inferiores)**; urgencia por riesgo de **obstrucción de la vía aérea**.'])
    N(u, 'S-190', 'Músculos del cuello: visión anterior.', ['ECM, músculos suprahioideos e infrahioideos y triángulos del cuello.'], 190)
    N(u, 'S-191', 'Músculos suprahioideos e infrahioideos.', ['Digástrico, milohioideo, esternohioideo, esternotiroideo, tirohioideo y omohioideo.'], 190)
    N(u, 'S-192', 'Músculos del cuello: visión lateral.', ['Triángulos anterior y posterior y sus músculos.'], 190)
    N(u, 'S-196', 'Fascias del cuello.', ['Capas superficial, media y profunda, y vaina carotídea.'], 190)
    N(u, 'S-197', 'Fascias del cuello (continuación).', ['Espacios retrofaríngeo y prevertebral.'], 190)
    G(u, 550, 'Compartimentos y fascias del cuello (Gray).', ['Compará los compartimentos visceral, vascular y vertebral.'], 190)
    G(u, 552, 'Músculos del cuello (Gray).', ['Triángulos y relaciones.'], 190)
    u.h3('Vasos y nervios que se encuentran en la cirugía del cuello')
    u.tabla(['Estructura', 'Dónde está', 'Importancia'], [
        ['**Carótida común**', 'Triángulo carotídeo, en la vaina; se bifurca a nivel del borde superior del cartílago tiroides', 'Referencia de la disección; el **paraganglioma** (cuerpo carotídeo) está en la bifurcación'],
        ['**Yugular interna**', 'Lateral a la carótida; desemboca con la subclavia en el tronco braquiocefálico', 'Se preserva (o se liga) en los vaciamientos; acceso venoso central'],
        ['**Vago (X)**', 'Entre la carótida y la yugular, en la vaina', 'Da el **laríngeo superior** y el **recurrente**'],
        ['**Hipogloso (XII)**', 'Cruza la carótida externa y el asa hacia la lengua', 'Se lesiona en la disección del nivel I y II (desvío de la lengua)'],
        ['**Frénico**', 'Sobre el escaleno anterior', 'Parálisis diafragmática (bloqueo del plexo; vaciamiento del nivel IV)'],
        ['**Cadena simpática y ganglio estrellado**', 'Detrás de la vaina carotídea, sobre la apófisis transversa de C6 y C7', 'Su lesión produce **síndrome de Horner**'],
        ['**Rama marginal mandibular del facial**', 'Corre sobre el borde inferior de la mandíbula', 'Se lesiona al disecar el nivel I y la glándula submandibular (desvío de la comisura labial)'],
    ], fuente='Netter, láminas S-64, S-65, S-69, S-70, S-74 y S-76; Gray, págs. 554 a 560.')
    N(u, 'S-194', 'Nervios del cuello.', ['Vago, hipogloso, accesorio y frénico.'], 190)
    N(u, 'S-195', 'Nervios del cuello y plexo cervical.', ['Punto de Erb y nervios cutáneos.'], 190)
    N(u, 'S-69', 'Nervio accesorio (NC XI): esquema.', ['Trayecto por el cuello hasta el ECM y el trapecio.'], 175)
    N(u, 'S-70', 'Nervio hipogloso (NC XII): esquema.', ['Recorrido y relación con la carótida y la lengua.'], 175)
    N(u, 'S-74', 'Plexo cervical: esquema.', ['Asa cervical, nervios cutáneos y frénico.'], 175)
    N(u, 'S-76', 'Nervios autónomos en el cuello.', ['Cadena simpática y ganglios cervicales.'], 190)
    G(u, 554, 'Nervios del cuello (Gray).', ['Distribución y relaciones.'], 190)
    G(u, 558, 'Arterias del cuello (Gray).', ['Carótidas, subclavia y tronco tirocervical.'], 190)
    N(u, 'S-329', 'Venas superficiales del cuello.', ['Yugulares anterior y externa.'], 175)
    u.h3('Niveles ganglionares del cuello (importancia en las resecciones oncológicas)')
    u.tabla(['Nivel', 'Ubicación', 'Drena…', 'Cáncer típico'], [
        ['**Ia / Ib**', 'Submentonianos / submandibulares', 'Labio, suelo de la boca, lengua anterior, piel', 'Cavidad oral'],
        ['**II (a y b)**', 'Yugulares **superiores**: de la base del cráneo al **hioides**', 'Cavidad oral, orofaringe, **parótida**, laringe supraglótica, nasofaringe', 'Carcinoma epidermoide de cabeza y cuello'],
        ['**III**', 'Yugulares **medios**: del hioides al **cricoides**', 'Laringe, hipofaringe, **tiroides**', 'Laringe, tiroides'],
        ['**IV**', 'Yugulares **inferiores**: del cricoides a la **clavícula**', 'Tiroides, laringe, tórax y abdomen', 'Tiroides; **ganglio de Virchow** (supraclavicular izquierdo)'],
        ['**V (a y b)**', 'Triángulo **posterior**', 'Nasofaringe, cuero cabelludo, tiroides', 'Nasofaringe, melanoma, tiroides'],
        ['**VI**', '**Compartimento central**: del hioides a la escotadura yugular, entre las carótidas (prelaríngeos, pretraqueales y paratraqueales)', '**Tiroides**, laringe subglótica, esófago cervical', '**Carcinoma papilar de tiroides**'],
        ['**VII**', 'Mediastino superior', 'Tiroides, esófago', 'Tiroides'],
    ], fuente='Netter, láminas S-344 y S-345; Gray, pág. 562; Schwartz, Principios de Cirugía, 10.ª ed., cap. 18 (cabeza y cuello); Giménez, Cirugía, 2.ª ed., cap. 25.')
    L(u, 'lib_schwartz_niveles_cuello.png', 'Niveles ganglionares del cuello (I a V) sobre los músculos y los vasos.', SCH.format(c='cap. 18 (cabeza y cuello)'), ['Reconocé cada nivel por sus fronteras (hioides, cricoides, clavícula, ECM, trapecio).'], 90)
    N(u, 'S-344', 'Ganglios linfáticos de la cabeza y el cuello.', ['Cadenas superficiales y profundas.'], 190)
    N(u, 'S-345', 'Ganglios linfáticos cervicales.', ['Yugulares, espinales accesorios y transversos del cuello.'], 190)
    G(u, 562, 'Linfáticos del cuello (Gray).', ['Niveles ganglionares y drenaje.'], 190)
    u.h3('Vaciamiento ganglionar del cuello')
    u.tabla(['Tipo', 'Qué se reseca', 'Qué se preserva'], [
        ['**Radical clásico**', 'Niveles I a V, **ECM, yugular interna y nervio accesorio**', 'Nada de lo anterior'],
        ['**Radical modificado**', 'Niveles I a V', 'Uno o más de: **nervio accesorio, yugular interna, ECM** (tipo I: el accesorio)'],
        ['**Selectivo**', 'Solo los niveles de riesgo (p. ej., I-III supraomohioideo; **VI** en el tiroides)', 'Todas las estructuras no linfáticas'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 25; Schwartz, Principios de Cirugía, 10.ª ed., cap. 18.')
    oral(u, 'El **triángulo anterior** (línea media, borde anterior del ECM y mandíbula) se divide en submentoniano, submandibular, **carotídeo** y muscular; el **posterior** (ECM, trapecio y clavícula) contiene el **nervio accesorio**, que emerge por el borde posterior del ECM y se lesiona en la biopsia ganglionar. Las **fascias**: superficial (platisma), cervical profunda (de revestimiento, **pretraqueal o visceral** y **prevertebral**) y la **vaina carotídea** (carótida, yugular interna y vago); el **espacio retrofaríngeo** comunica con el mediastino posterior. Los **niveles ganglionares** son I (submentoniano y submandibular), II-IV (yugulares: superior hasta el hioides, medio hasta el cricoides, inferior hasta la clavícula), V (triángulo posterior), **VI (central: tiroides)** y VII (mediastino superior). En el **vaciamiento** se preservan, si es posible, el **accesorio**, la **yugular interna** y el **ECM**; el **ganglio de Virchow** (supraclavicular izquierdo) orienta a una metástasis abdominal o torácica.')


    L(u, 'sch_s18_p31_0.jpg', 'Niveles ganglionares del cuello: límites de cada nivel (I a VI) sobre los músculos y los vasos.', SCH.format(c='cap. 18 (Trastornos de la cabeza y el cuello)'), ['Ubicá cada nivel por sus límites: **hioides, cricoides y clavícula** y la relación con el **esternocleidomastoideo**.'], 100)
    L(u, 'sch_s18_vaciamientos.jpg', 'Tipos de vaciamiento ganglionar del cuello: de menor a mayor extensión (en azul, la zona que se extirpa).', SCH.format(c='cap. 18 (Trastornos de la cabeza y el cuello)'), ['Cuanto mayor es el vaciamiento, más estructuras no linfáticas se sacrifican (**nervio accesorio, yugular interna, esternocleidomastoideo**) o se preservan.'], 85)


def tiroides_anatomia(u):
    u.h2('Tiroides y paratiroides: anatomía quirúrgica', intro='Todo lo que se pregunta de las complicaciones de la tiroidectomía (disfonía, hipocalcemia, hematoma) se explica por las relaciones de la glándula. Es el módulo más importante de la unidad.')
    u.h3('Forma, relaciones y fijación')
    u.ul(['La **tiroides** pesa 15-25 g y tiene dos **lóbulos** (derecho e izquierdo) unidos por el **istmo**, a la altura del **2.º al 4.º anillo traqueal**. Un **lóbulo piramidal** (hasta en el 50 %) sube desde el istmo: es resto del conducto tirogloso. El **tubérculo de Zuckerkandl** (prolongación posterolateral del lóbulo) es una **referencia del nervio recurrente**.',
          '**Relaciones**: por delante, los músculos **infrahioideos** (esternohioideo y esternotiroideo) y el ECM; por detrás, la **tráquea y el esófago** (y, entre ambos, el **surco traqueoesofágico** con el **recurrente**) y las **paratiroides**; lateralmente, la **vaina carotídea**.',
          '**Fijación**: la cápsula pretraqueal la une a la laringe y la tráquea; el **ligamento suspensorio posterior (de Berry)** la fija al cricoides y a los primeros anillos traqueales: **el recurrente pasa por detrás de él, o lo atraviesa**, y es el sitio más frecuente de lesión. Por eso **sube con la laringe al deglutir**.'])
    u.h3('Irrigación y drenaje')
    u.tabla(['Vaso', 'Origen y trayecto', 'Relación quirúrgica'], [
        ['**Arteria tiroidea superior**', 'Primera rama de la **carótida externa**; irriga el polo superior', 'La **rama externa del nervio laríngeo superior** corre cerca: se liga **sobre la cápsula**, pegado a la glándula'],
        ['**Arteria tiroidea inferior**', 'Rama del **tronco tirocervical** (subclavia); sube y gira hacia la glándula por detrás de la vaina carotídea', 'Cruza al **recurrente** (por delante, por detrás o entre sus ramas): se liga **sobre la cápsula**, después de identificar el nervio. **Irriga también las paratiroides**'],
        ['**Arteria tiroidea ima**', 'Presente en ~3 %, del tronco braquiocefálico o del cayado aórtico; sube por delante de la tráquea', 'Puede sangrar en la **traqueostomía** y en la tiroidectomía'],
        ['**Venas**', '**Superior** y **media** a la yugular interna; **inferior** al tronco braquiocefálico izquierdo', 'La **vena media** es corta y frágil: se liga con cuidado'],
    ], fuente='Netter, láminas S-525 y S-526; Gray, págs. 575 y 576; Schwartz, Principios de Cirugía, 10.ª ed., cap. 38; Giménez, Cirugía, 2.ª ed., cap. 23.')
    u.ul(['**Linfáticos**: ganglios **prelaríngeos (délfico), pretraqueales y paratraqueales (nivel VI)**, yugulares (III y IV) y mediastinales superiores. Son la ruta de diseminación del **cáncer papilar**.',
          '**Inervación**: simpática (ganglios cervicales); la función se regula con el eje hipotálamo-hipofisario (TSH).'])
    u.h3('Nervios laríngeos y su lesión')
    u.tabla(['Nervio', 'Trayecto', 'Función y lesión'], [
        ['**Laríngeo recurrente derecho**', 'Rodea la **arteria subclavia** y asciende **oblicuo**, más lateral, al surco traqueoesofágico', 'Todos los músculos intrínsecos (salvo el cricotiroideo). **Lesión unilateral: disfonía (cuerda en posición paramediana)**. **Bilateral: estridor y obstrucción**. Variante: **no recurrente** (1 %), asociada a una arteria subclavia aberrante'],
        ['**Laríngeo recurrente izquierdo**', 'Rodea el **cayado de la aorta** y asciende **vertical** en el surco traqueoesofágico', 'Igual; es más profundo y más largo'],
        ['**Rama externa del laríngeo superior**', 'Desciende junto a la **arteria tiroidea superior** hacia el cricotiroideo', 'Tensa las cuerdas: su lesión produce **voz débil, cansancio vocal y pérdida de los tonos agudos** (**“nervio de los cantantes”**)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 23; Schwartz, Principios de Cirugía, 10.ª ed., cap. 38; Netter, lámina S-378.')
    L(u, 'lib_schwartz_rln_paratiroides.png', 'Tiroidectomía: identificación del nervio recurrente, la arteria tiroidea inferior y las paratiroides.', SCH.format(c='cap. 38 (tiroides, paratiroides y suprarrenales)'), ['El nervio se identifica y se sigue antes de ligar la arteria tiroidea inferior.'], 85)
    N(u, 'S-525', 'Glándula tiroides: visión anterior.', ['Lóbulos, istmo, lóbulo piramidal, arterias y venas, y relación con la laringe y la tráquea.'], 195)
    N(u, 'S-526', 'Glándula tiroides: visión posterior.', ['Paratiroides, recurrentes y arterias tiroideas inferiores.'], 195)
    N(u, 'S-527', 'Glándulas tiroides y paratiroides (continuación).', ['Posición de las paratiroides y sus arterias.'], 190)
    G(u, 575, 'Glándula tiroides (Gray).', ['Lóbulos, istmo y relaciones.'], 190)
    G(u, 576, 'Vascularización de la glándula tiroides (Gray).', ['Arterias tiroideas superior e inferior y sus relaciones nerviosas.'], 190)
    N(u, 'S-389', 'Grandes vasos del mediastino.', ['Cayado de la aorta, subclavias y el recorrido del recurrente izquierdo.'], 190)
    u.h3('Paratiroides')
    u.ul(['Son **4 glándulas** de ~30-50 mg (“granos de arroz”). Las **superiores** (de la 4.ª bolsa faríngea) están **constantes** en la cara posterior del lóbulo superior, a nivel del cricoides, **por detrás del recurrente**; las **inferiores** (de la 3.ª bolsa, con el timo) son **más variables** (polo inferior o dentro del timo, **ectópicas** en el mediastino).',
          '**Irrigación**: de ambas por la **arteria tiroidea inferior**: su ligadura en el tronco puede **devascularizar** las paratiroides: por eso se liga **sobre la cápsula** y las paratiroides se preservan con su pedículo (o se **autotrasplantan** en el ECM).',
          '**Hiperparatiroidismo primario**: **adenoma único (~80-85 %)**, hiperplasia (10-15 %) o carcinoma (raro). Hipercalcemia, litiasis renal, osteoporosis, dolor abdominal. Localización con ecografía y **gammagrafía con sestamibi**; **paratiroidectomía** focalizada o exploración bilateral. **Hiperparatiroidismo secundario**: de la insuficiencia renal.'])
    u.h3('Embriología aplicada: conducto tirogloso y bolsas faríngeas')
    u.ul(['La tiroides nace en el **foramen ciego** de la lengua y **desciende por delante del hioides** hasta su lugar: el **conducto tirogloso** se oblitera. Sus restos: **quiste del conducto tirogloso** (línea media, se mueve con la deglución y con la protrusión de la lengua), **lóbulo piramidal** y **tiroides ectópica o lingual**.',
          'Las **células C (parafoliculares)** vienen de la cresta neural (cuerpo ultimobranquial): dan origen al **carcinoma medular**.'])
    oral(u, 'La **tiroides** tiene dos lóbulos y un istmo (2.º-4.º anillo traqueal), se fija a la laringe por el **ligamento de Berry** y sube al deglutir. Se irriga por la **tiroidea superior** (de la carótida externa), la **inferior** (del tronco tirocervical) y a veces la **ima**. El **recurrente** (derecho oblicuo, rodea la subclavia; izquierdo vertical, rodea el cayado aórtico) sube por el surco traqueoesofágico, **cruza a la tiroidea inferior** y pasa por detrás del ligamento de Berry: por eso se lo **identifica antes de ligar** la arteria. La **rama externa del laríngeo superior** va con la tiroidea superior (voz de los cantantes), y las **paratiroides** se irrigan por la **tiroidea inferior**: se liga sobre la cápsula para preservarlas. La **superior** es constante (4.ª bolsa); la **inferior** es variable (3.ª bolsa con el timo). El **conducto tirogloso** desciende por delante del hioides y deja el quiste tirogloso en la línea media.')


def patologia_tiroides(u):
    u.h2('Nódulo y cáncer de tiroides, hiperparatiroidismo, cirugía tiroidea y sus complicaciones', intro='Seminario de la unidad: patología quirúrgica de la glándula tiroides. Se razona con la ecografía, la citología y la anatomía quirúrgica.')
    u.h3('Bocio y nódulo tiroideo')
    u.ul(['**Bocio**: aumento de tamaño de la glándula. Se clasifica en **difuso o nodular** (uni o multinodular), **tóxico o atóxico**. Causas: **déficit de yodo** (endémico), enfermedad de Graves, tiroiditis, nódulos autónomos.',
          '**Nódulo tiroideo**: muy frecuente y casi siempre benigno (~5 % son malignos). **Evaluación**: **TSH**; **ecografía** (clasificación **ACR TI-RADS 2017**: composición, ecogenicidad, forma, márgenes y focos ecogénicos puntuados de TR1 a TR5); **PAAF** (punción-aspiración con aguja fina) según el TI-RADS y el tamaño; **gammagrafía** solo si la TSH está baja (el nódulo “caliente” casi nunca es maligno).',
          '**Signos de alarma**: crecimiento rápido, **consistencia dura**, fijación, **adenopatías**, **disfonía** (invasión del recurrente), antecedente de **irradiación** de cuello o antecedentes familiares.'])
    L(u, 'lib_schwartz_nodulo_estudios.png', 'Estudio del nódulo tiroideo: gammagrafía y ecografía.', SCH.format(c='cap. 38'), ['Nódulo frío en la gammagrafía y su correlación ecográfica.'], 65)
    u.tabla(['Bethesda', 'Categoría', 'Riesgo de malignidad', 'Conducta'], [
        ['**I**', 'No diagnóstico', '5-10 %', 'Repetir la punción'],
        ['**II**', '**Benigno**', '0-3 %', 'Seguimiento'],
        ['**III**', 'Atipia de significado indeterminado (AUS/FLUS)', '10-30 %', 'Repetir o estudio molecular'],
        ['**IV**', '**Neoplasia folicular o sospechosa de neoplasia folicular**', '25-40 %', '**Lobectomía** (el diagnóstico es post-operatorio)'],
        ['**V**', 'Sospechoso de malignidad', '50-75 %', 'Cirugía'],
        ['**VI**', '**Maligno**', '97-99 %', 'Cirugía (lobectomía o total según el riesgo)'],
    ], fuente='Sistema Bethesda para la citología tiroidea; Giménez, Cirugía, 2.ª ed., cap. 23 (nódulo y cáncer tiroideos); Consenso intersocietario sobre cáncer diferenciado de tiroides.')
    L(u, 'sch_s38_p10_0.jpg', 'Gammagrafía tiroidea: captación del radiotrazador por ambos lóbulos.', SCH.format(c='cap. 38 (Tiroides, paratiroides y suprarrenales)'), ['El nódulo **“caliente”** capta más que el tejido vecino (rara vez es maligno); el **“frío”** no capta y es el que se punza si la TSH no está suprimida.'], 85)
    L(u, 'sch_s38_p10_1.jpg', 'Ecografía tiroidea: nódulo con una flecha que lo señala.', SCH.format(c='cap. 38 (Tiroides, paratiroides y suprarrenales)'), ['La ecografía describe **tamaño, bordes, ecogenicidad y microcalcificaciones** (base del TI-RADS) y guía la **PAAF**.'], 70)
    L(u, 'sch_s38_p12_0.jpg', 'Exoftalmos en la enfermedad de Graves (fotografía en blanco y negro).', SCH.format(c='cap. 38 (Tiroides, paratiroides y suprarrenales)'), ['El **hipertiroidismo autoinmune** produce bocio difuso y oftalmopatía; es una de las indicaciones de tiroidectomía total.'], 80)
    u.h3('Cáncer de tiroides: tipos histológicos')
    u.tabla(['Tipo', 'Frecuencia y origen', 'Diseminación y dato clave'], [
        ['**Papilar**', '**80-85 %**; células foliculares; mujer joven; irradiación previa', '**Linfática** (ganglios del nivel VI y yugulares); núcleos en “vidrio esmerilado”, **cuerpos de psamoma**; **buen pronóstico**'],
        ['**Folicular**', '~10 %; células foliculares; déficit de yodo', '**Hematógena** (pulmón, hueso); el diagnóstico exige **invasión capsular o vascular** (no se hace por PAAF)'],
        ['**De células de Hürthle**', 'Variante oncocítica', 'Más agresivo'],
        ['**Medular**', '~5 %; **células C**; **calcitonina y CEA** elevados; esporádico o hereditario (**MEN 2A y 2B**, mutación **RET**)', 'Metástasis ganglionares precoces; **tiroidectomía total con vaciamiento central**; estudio genético familiar'],
        ['**Anaplásico**', 'Anciano; **muy agresivo**', 'Obstrucción de la vía aérea (traqueostomía paliativa); supervivencia de meses'],
        ['**Linfoma**', 'Sobre tiroiditis de Hashimoto', 'Bocio de crecimiento rápido'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 23; Schwartz, Principios de Cirugía, 10.ª ed., cap. 38; Consenso intersocietario sobre cáncer diferenciado de tiroides.')
    L(u, 'lib_schwartz_folicular_invasion.png', 'Carcinoma folicular: invasión de la cápsula en la histología.', SCH.format(c='cap. 38'), ['La invasión de la cápsula y de los vasos distingue el carcinoma folicular del adenoma.'], 65)
    u.h3('Estadificación y tratamiento del cáncer diferenciado')
    u.ul(['**Estadificación**: TNM (8.ª ed.): T por tamaño y **extensión extratiroidea**; la **edad (menor o mayor de 55 años)** modifica el estadio. Además, el **riesgo de recurrencia (ATA)**: bajo, intermedio o alto, que orienta la intensidad del tratamiento.',
          '**Cirugía**: **lobectomía** para tumores pequeños, de bajo riesgo y sin ganglios; **tiroidectomía total** para tumores mayores de 4 cm, extensión extratiroidea, ganglios o metástasis. **Vaciamiento central (nivel VI)** si hay ganglios o riesgo; **vaciamiento lateral (II-V)** si hay metástasis ganglionares laterales.',
          '**Tratamiento complementario**: **yodo radiactivo (I-131)** para ablacionar el remanente y tratar metástasis en riesgo intermedio-alto, y **levotiroxina** (reemplazo o supresión de la TSH). **Seguimiento**: **tiroglobulina** y ecografía cervical.'])
    u.h3('Indicaciones de cirugía tiroidea y técnica básica')
    u.tabla(['Indicación', 'Detalle'], [
        ['**Sospecha o diagnóstico de cáncer**', 'Bethesda V-VI, o IV (lobectomía diagnóstica)'],
        ['**Bocio compresivo**', 'Disnea, estridor, disfagia; **bocio endotorácico (retroesternal)** (signo de Pemberton)'],
        ['**Hipertiroidismo**', 'Enfermedad de Graves refractaria, nódulo tóxico, bocio multinodular tóxico'],
        ['**Otras**', 'Estética, cáncer medular familiar (profiláctica)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 23; Michans, Cirugía, 5.ª ed., cap. 21.')
    u.ul(['**Posición**: decúbito supino con un rodillo bajo los hombros y la cabeza extendida. **Incisión de Kocher** (en “collar”) unos **2 cm sobre la escotadura esternal**, siguiendo un pliegue cutáneo; **colgajos subplatismales**.',
          '**Abordaje**: se separan los músculos **infrahioideos en la línea media (línea alba cervical)**; se liga la **vena media**; se **liga la arteria tiroidea superior** sobre la cápsula; se **identifica el recurrente y las paratiroides** y recién entonces se liga la **tiroidea inferior sobre la cápsula**; se libera el ligamento de Berry con cuidado. Se usa **neuromonitoreo** del recurrente en muchos centros.',
          '**Tipos**: **lobectomía** (con istmectomía), **tiroidectomía total** y, en la actualidad, rara vez la subtotal.'])
    u.h3('Complicaciones de la tiroidectomía')
    u.tabla(['Complicación', 'Mecanismo anatómico', 'Clínica y conducta'], [
        ['**Hematoma cervical**', 'Sangrado en el **espacio pretraqueal** (vasos de la cápsula, vena media) que comprime la tráquea', '**Tumefacción, disnea, estridor** en las primeras horas: **urgencia vital**: se **abre la herida** en la cama (para descomprimir) y se reopera'],
        ['**Lesión del recurrente**', 'Tracción, sección o quemadura del nervio (más a menudo cerca del ligamento de Berry)', '**Unilateral**: disfonía, voz bitonal; **bilateral**: estridor y obstrucción (traqueostomía)'],
        ['**Lesión de la rama externa del laríngeo superior**', 'Ligadura en masa de la arteria tiroidea superior', 'Voz débil, pérdida de tonos agudos'],
        ['**Hipoparatiroidismo**', 'Extirpación o **devascularización** de las paratiroides (más en la tiroidectomía total)', '**Hipocalcemia a las 24-72 horas**: parestesias periorales y en las manos, calambres, **signos de Chvostek y de Trousseau**, tetania; tratamiento con **calcio** (intravenoso si es sintomática) y **calcitriol**. Transitorio en la mayoría; permanente en ~1-3 %'],
        ['**Crisis tirotóxica**', 'Liberación de hormona en un Graves mal preparado', 'Fiebre, taquicardia, agitación: preparación con antitiroideos y yodo'],
        ['**Otras**', 'Hemorragia, infección, lesión traqueal, cicatriz hipertrófica', ''],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 23; Schwartz, Principios de Cirugía, 10.ª ed., cap. 38; Michans, Cirugía, 5.ª ed., cap. 21.')
    oral(u, 'El **nódulo tiroideo** se estudia con **TSH**, **ecografía (TI-RADS)** y **PAAF (Bethesda)**: II benigno (seguimiento), **IV neoplasia folicular (lobectomía diagnóstica)**, V y VI cirugía. El **papilar** (80-85 %) se disemina por vía **linfática** (nivel VI), el **folicular** por vía **hematógena** y su diagnóstico requiere invasión capsular o vascular; el **medular** viene de las **células C** (calcitonina, MEN 2, RET) y el **anaplásico** es agresivo. El tratamiento del diferenciado es **lobectomía o tiroidectomía total** (± vaciamiento central), **yodo radiactivo** y **levotiroxina**; el seguimiento, con tiroglobulina y ecografía. Las complicaciones de la cirugía se explican por la anatomía: **hematoma** (espacio pretraqueal: se abre la herida), **lesión del recurrente** (disfonía; bilateral: estridor), **lesión de la rama externa del laríngeo superior** (voz de los cantantes) e **hipoparatiroidismo** (devascularización de las paratiroides: hipocalcemia con Chvostek y Trousseau).')
