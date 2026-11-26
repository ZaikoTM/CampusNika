# -*- coding: utf-8 -*-
"""UP 4 · Anatomía quirúrgica del colon, el recto, el ano y las ostomías. Parte A: colon (anatomía, vasos, linfáticos, nervios) y su patología."""
from .up01e import N, G, L, oral

GAL = 'Galindo, __Enciclopedia de Cirugía Digestiva__ (SACD, 2020), {c}.'
SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def colon(u):
    u.h2('Colon: segmentos, relaciones, peritoneo y fascias', intro='Toda la cirugía colónica (hemicolectomías, sigmoidectomía, Hartmann, colostomías) se decide por el segmento, su relación con el peritoneo y sus vecinos.')
    u.h3('Segmentos y características')
    u.tabla(['Segmento', 'Posición respecto del peritoneo', 'Relaciones importantes', 'Patología típica'], [
        ['**Ciego y ascendente**', 'Ciego intraperitoneal; ascendente **retroperitoneal** (cara posterior sin peritoneo)', 'Riñón y **uréter derechos**, 2.ª porción del duodeno, vesícula (ángulo hepático)', 'Cáncer (anemia ferropénica), angiodisplasia, tiflitis'],
        ['**Ángulo hepático y transverso**', 'Transverso **intraperitoneal**, con el **mesocolon transverso**', 'Estómago (ligamento gastrocólico), hígado, vesícula y duodeno', 'Cáncer, vólvulo (raro), obstrucción'],
        ['**Ángulo esplénico y descendente**', 'Ángulo fijado por el **ligamento frenocólico**; descendente **retroperitoneal**', 'Bazo y cola del páncreas (ángulo); riñón y **uréter izquierdos**', 'Isquemia (punto de Griffiths), cáncer obstructivo, lesión esplénica en la movilización'],
        ['**Sigmoides**', '**Intraperitoneal** con un meso largo (**mesosigmoides**, en “V” invertida)', '**Uréter izquierdo** y vasos ilíacos; en la mujer, útero y anexos; vejiga', '**Diverticulitis**, **vólvulo**, cáncer, fístulas colovesical y colovaginal'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 300 (anatomía quirúrgica del colon); Netter, láminas S-424, S-425 y S-428; Gray, págs. 181 y 183.')
    u.ul(['**Longitud**: unos 1,5 m; calibre decreciente desde el ciego (~7 cm) hasta el sigmoides (~2,5 cm), lo que explica por qué el ciego perfora en las obstrucciones distales con válvula ileocecal competente.',
          '**Características de la pared** (diferencian el colon del delgado): **tres tenias**, **haustras** y **apéndices epiploicos**. Las tres tenias convergen en la base del apéndice.',
          '**Ligamentos de fijación**: frenocólico (ángulo esplénico), gastrocólico, hepatocólico; el ciego y el sigmoides tienen más movilidad.',
          '**Fascias de coalescencia (de Toldt)**: el colon ascendente y el descendente se fijaron al retroperitoneo; durante la **movilización** se sigue el **plano avascular** entre la **fascia propia del mesocolon** y la **fascia de Gerota**, donde corren el uréter y los vasos gonadales. Es el plano de la **escisión completa del mesocolon**.'])
    N(u, 'S-428', 'Mucosa y musculatura del intestino grueso.', ['Tenias, haustras, apéndices epiploicos y capas de la pared.'], 190)
    N(u, 'S-424', 'Mesocolon y raíz del mesenterio.', ['Mesocolon transverso, mesosigmoides y raíz del mesenterio.'], 190)
    N(u, 'S-425', 'Unión ileocecal.', ['Válvula ileocecal, ciego, apéndice y recesos peritoneales.'], 190)
    G(u, 181, 'Intestino grueso (Gray).', ['Segmentos del colon con su peritoneo y relaciones.'], 190)
    L(u, 'lib_schwartz_irrigacion_colon.png', 'Colon con su red vascular y los arcos paracólicos.', SCH.format(c='cap. 29 (colon, recto y ano)'), ['La arcada marginal recorre el colon pegada a la pared.'], 85)
    oral(u, 'El colon mide unos 1,5 m y se reconoce por las **tres tenias**, las **haustras** y los **apéndices epiploicos**. El **ascendente y el descendente son retroperitoneales** (tienen la cara posterior sin peritoneo, pegada por las fascias de Toldt al riñón y al **uréter**); el **transverso y el sigmoides** son intraperitoneales con meso, por eso el sigmoides hace **vólvulo**. El **ángulo esplénico** se fija por el ligamento frenocólico y está en relación con el bazo. En la cirugía se sigue el **plano avascular entre la fascia del mesocolon y la fascia de Gerota**, protegiendo el **uréter** y los vasos gonadales. El diámetro máximo del ciego (9 cm) y del colon (6 cm) marcan el riesgo de perforación.')


def vasos_colon(u):
    u.h2('Irrigación, drenaje linfático e inervación del colon', intro='Define dónde se liga, cuánto colon se reseca y por qué algunas zonas sufren isquemia.')
    u.h3('Arterias')
    u.tabla(['Arteria', 'Origen', 'Segmentos que irriga'], [
        ['**Ileocólica**', 'Mesentérica superior (AMS)', 'Íleon terminal, ciego, apéndice (arteria apendicular)'],
        ['**Cólica derecha**', 'AMS (a veces de la ileocólica)', 'Colon ascendente'],
        ['**Cólica media**', 'AMS', 'Transverso (2/3 proximales)'],
        ['**Cólica izquierda**', 'Mesentérica inferior (AMI)', '1/3 distal del transverso y descendente'],
        ['**Sigmoideas**', 'AMI', 'Sigmoides'],
        ['**Rectal superior (hemorroidal superior)**', 'Continuación de la AMI', 'Rectosigmoides y recto superior'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 300; Netter, lámina S-440; Gray, pág. 185.')
    u.ul(['**Arcada marginal (de Drummond)**: arcada paracólica que une las ramas cólicas a lo largo del borde mesentérico del colon. De ella salen los **vasa recta** que penetran la pared.',
          '**Arco de Riolano**: comunicación entre la cólica media y la cólica izquierda cerca de la raíz del mesenterio (AMS con AMI).',
          '**Puntos críticos**: **ángulo esplénico (punto de Griffiths)** y **unión rectosigmoidea (punto de Sudeck)**: las cuencas limítrofes entre dos territorios son las más vulnerables a la isquemia.',
          '**En la cirugía**: se liga el pedículo con el **segmento linfoportador**: hemicolectomía **derecha** = ileocólica, cólica derecha y rama derecha de la cólica media; **izquierda** = AMI por debajo de la cólica izquierda (o en su origen) conservando la irrigación del colon proximal; la **arcada marginal** y la tensión determinan la viabilidad de la anastomosis o de la ostomía.'])
    L(u, 'gal_colon_griffith_sudeck.png', 'Irrigación del colon: arcada de Riolano, arcada marginal de Drummond y los puntos críticos de Griffiths y Sudeck.', GAL.format(c='cap. 342 (isquemia colónica)'), ['En azul, las zonas de menor irrigación: ángulo esplénico y unión rectosigmoidea.'], 80)
    u.h3('Venas, linfáticos y nervios')
    u.ul(['**Venas**: acompañan a las arterias. La **mesentérica superior** y la **mesentérica inferior** drenan en la **porta** (la inferior desemboca en la esplénica o en la unión). **Importancia**: las metástasis hepáticas del cáncer de colon llegan por la porta.',
          '**Linfáticos**: cuatro niveles de ganglios: **epicólicos** (en la pared), **paracólicos** (sobre la arcada marginal), **intermedios** (sobre las arterias cólicas) y **principales** (en el origen de la AMS y la AMI). Los linfáticos **acompañan al pedículo vascular**: por eso se reseca el colon junto con su mesocolon y se **ligan los vasos en su origen** (linfadenectomía). Se necesitan **al menos 12 ganglios** para estadificar.',
          '**Inervación autónoma**: **simpática** (plexos mesentérico superior e inferior, T10-L2; inhibe el peristaltismo; transmite el **dolor visceral**) y **parasimpática**: el **vago** inerva hasta el ángulo esplénico y los **nervios pélvicos esplácnicos (S2-S4)** el colon distal. El dolor del colon derecho es **periumbilical**; el del colon izquierdo, **hipogástrico y de fosa ilíaca izquierda**.'])
    N(u, 'S-440', 'Arterias del intestino grueso.', ['Ileocólica, cólica derecha y media (AMS) y cólica izquierda y sigmoideas (AMI) con la arcada marginal.'], 190)
    N(u, 'S-444', 'Venas del intestino grueso.', ['Drenaje a la mesentérica superior y a la inferior, y de ahí a la porta.'], 190)
    N(u, 'S-452', 'Inervación autónoma del intestino grueso.', ['Fibras simpáticas y parasimpáticas del colon derecho e izquierdo.'], 190)
    N(u, 'S-353', 'Drenaje linfático del abdomen y la pelvis: esquema.', ['Cadenas linfáticas mesentéricas y retroperitoneales.'], 190)
    G(u, 185, 'Arterias mesentéricas (Gray).', ['AMS y AMI con sus ramas.'], 190)
    G(u, 195, 'Drenaje venoso de las vísceras (Gray).', ['Vena porta con las mesentéricas.'], 190)
    u.h3('Isquemia colónica')
    u.tabla(['Aspecto', 'Detalle'], [
        ['**Dónde**', 'Cuencas limítrofes: **ángulo esplénico** y **rectosigmoides**; también el colon derecho (se asocia a isquemia de la AMS)'],
        ['**Quién**', 'Adulto mayor, hipotensión o bajo gasto, cirugía aórtica (ligadura de la AMI), vasoespasmo, constipación'],
        ['**Clínica**', 'Dolor abdominal súbito de tipo cólico, urgencia defecatoria y **hematoquecia leve**'],
        ['**Endoscopia**', 'Mucosa pálida o cianótica, edema, ulceración longitudinal, parches; en el grado grave, necrosis'],
        ['**Evolución**', 'Mayoría **transitoria** (reposo, hidratación); la **gangrena** con peritonitis requiere resección'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 342 (isquemia colónica); Giménez, Cirugía, 2.ª ed.')
    L(u, 'gal_colitis_isquemica_endo.png', 'Colitis isquémica: endoscopia (mucosa edematosa y ulceración).', GAL.format(c='cap. 342'), ['Los cambios son segmentarios y siguen el territorio vascular.'], 70)
    L(u, 'gal_colitis_isquemica_gangrenosa.png', 'Colitis isquémica grave: mucosa con necrosis.', GAL.format(c='cap. 342'), ['Indica resección.'], 70)
    L(u, 'gal_isquemia_pieza.png', 'Pieza quirúrgica de colon isquémico.', GAL.format(c='cap. 342'), ['El segmento necrótico está oscuro, congestivo y sin peristaltismo.'], 75)
    oral(u, 'La **mesentérica superior** irriga el colon derecho (ileocólica, cólica derecha y media) y la **mesentérica inferior** el izquierdo (cólica izquierda y sigmoideas), y continúa como **rectal superior**. Las ramas se unen por la **arcada marginal de Drummond** y el **arco de Riolano**; las zonas frágiles son el **ángulo esplénico (Griffiths)** y el **rectosigmoides (Sudeck)**: ahí aparece la **colitis isquémica**. El drenaje venoso va a la **porta** (metástasis hepáticas) y los **linfáticos acompañan a los vasos**: por eso se liga el pedículo en su origen y se estudian **al menos 12 ganglios**. La inervación es simpática (plexos mesentéricos) y parasimpática (vago hasta el ángulo esplénico y nervios pélvicos S2-S4 para el colon distal).')


def patologia_colon(u):
    u.h2('Enfermedades del colon explicadas por la anatomía', intro='Diverticulosis, vólvulo, megacolon, enfermedad inflamatoria, pólipos y cáncer: cada una tiene un porqué anatómico.')
    u.h3('Enfermedad diverticular')
    u.ul(['Los divertículos del colon son **falsos** (mucosa y submucosa herniadas a través de la muscular) y de **pulsión**. Aparecen en los **puntos débiles** donde los **vasa recta penetran la capa muscular circular**, entre la tenia mesentérica y las antimesentéricas. Predominan en el **sigmoides** (presión intraluminal más alta por su calibre pequeño).',
          '**Diverticulitis**: obstrucción del cuello del divertículo por un fecalito, inflamación y microperforación. Dolor en **fosa ilíaca izquierda**, fiebre, leucocitosis (“apendicitis izquierda”).',
          '**Complicaciones**: **absceso**, **perforación** libre, **fístula** (colovesical por la vejiga vecina, colovaginal en la mujer histerectomizada, coloentérica), **estenosis** y **hemorragia** (por rotura del vaso recto en el cuello del divertículo, indolora, a menudo del colon derecho).',
          '**Clasificación de Hinchey**: **I** absceso pericólico, **II** absceso pélvico o retroperitoneal, **III** peritonitis purulenta, **IV** peritonitis fecaloidea (la más grave: cirugía de Hartmann).'])
    L(u, 'lib_schwartz_diverticulosis_enema.png', 'Enema con bario: divertículos del sigmoides (dientes de sierra).', SCH.format(c='cap. 29'), ['Imágenes de “sacabocado” en el contorno del colon.'], 80)
    u.h3('Vólvulo, megacolon y fecaloma')
    u.tabla(['Cuadro', 'Base anatómica', 'Clínica'], [
        ['**Vólvulo de sigmoides**', 'Meso largo con **base estrecha** (los pies del asa se acercan): el asa gira (rotación antihoraria) alrededor del eje mesentérico', 'Anciano, constipado o con megacolon; distensión masiva, obstrucción; Rx: asa en **“grano de café”** o **“tubo de bicicleta”**'],
        ['**Vólvulo de ciego**', 'Ciego móvil (falta de fijación retroperitoneal)', 'Obstrucción del delgado; Rx: asa dilatada en el hipocondrio izquierdo'],
        ['**Megacolon chagásico**', 'Destrucción de los plexos mientéricos por __Trypanosoma cruzi__', 'Constipación, fecaloma, vólvulo'],
        ['**Enfermedad de Hirschsprung**', 'Ausencia de células ganglionares (Auerbach y Meissner) en el **recto distal**: segmento aganglionar contraído', 'Niño con constipación desde el nacimiento; ausencia del reflejo rectoanal inhibitorio'],
        ['**Fecaloma**', 'Impactación de heces duras en el **recto**', 'Anciano, inmovilizado; incontinencia por rebosamiento; se palpa en el tacto rectal'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 68 (megacolon del adulto); Galindo, Enciclopedia de Cirugía Digestiva, cap. 345 (megacolon).')
    u.h3('Enfermedad inflamatoria intestinal con afectación colónica')
    u.tabla(['', 'Colitis ulcerosa', 'Enfermedad de Crohn'], [
        ['**Distribución**', '**Continua**, desde el recto hacia proximal (proctitis, colitis izquierda, pancolitis)', '**Segmentaria** (“lesiones salteadas”); **íleon terminal** y colon; todo el tubo digestivo'],
        ['**Capas**', '**Mucosa y submucosa**', '**Transmural** (toda la pared)'],
        ['**Recto**', 'Casi siempre afectado', 'A menudo respetado'],
        ['**Fístulas y estenosis**', 'Poco frecuentes', '**Frecuentes**; enfermedad perianal'],
        ['**Cirugía**', 'Proctocolectomía total con reservorio ileoanal (curativa)', 'Resección limitada; no curativa'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 67 (colopatía inflamatoria); Galindo, Enciclopedia de Cirugía Digestiva, caps. 348 y 355.')
    u.h3('Pólipos, poliposis y cáncer colorrectal')
    u.ul(['**Secuencia adenoma-carcinoma**: la mayoría de los cánceres se origina en **adenomas** (tubulares, vellosos) por acúmulo de mutaciones en unos 10-15 años; por eso se hace **pesquisa** y **polipectomía**.',
          '**Poliposis adenomatosa familiar** (mutación de **APC**): cientos a miles de pólipos desde la adolescencia; cáncer casi inevitable: colectomía total profiláctica. **Síndrome de Lynch** (cáncer colorrectal hereditario no polipósico; genes de reparación **MMR**): cáncer de colon derecho a edad temprana y tumores extracolónicos (endometrio).',
          '**Localización**: el colon **derecho** da tumores vegetantes, **anemia ferropénica** y masa palpable (el calibre es amplio y las heces líquidas: tardan en obstruir); el **izquierdo**, tumores anulares, **cambio del ritmo evacuatorio**, hematoquecia y **obstrucción** (calibre pequeño y heces formadas).',
          '**Estadificación por capas**: T1 (submucosa), T2 (muscular propia), T3 (subserosa o tejido pericólico), T4a (serosa) y T4b (órganos vecinos). Estudio de las metástasis: **hígado** (por la porta) y **pulmón** (por el recto bajo, que drena a la cava).',
          '**Pesquisa**: sangre oculta en materia fecal o test inmunoquímico cada 1-2 años desde los 50, y **colonoscopia** cada 10 años; antes y con mayor frecuencia si hay antecedentes familiares.'])
    N(u, 'S-547', 'Radiología abdominal: TC axiales.', ['Colon con su contenido y las relaciones con los vecinos; estudio de la diverticulitis y de las metástasis.'], 190)
    oral(u, 'Los **divertículos** del colon son falsos y de pulsión; salen en los puntos donde los **vasos rectos penetran la muscular**, sobre todo en el **sigmoides**. La **diverticulitis** (dolor en la FII) se clasifica por **Hinchey** (I a IV) y sus complicaciones son el absceso, la perforación, las **fístulas** (colovesical, colovaginal), la estenosis y la hemorragia (del colon derecho, indolora). El **vólvulo de sigmoides** se produce por un meso largo de base estrecha y se ve en la Rx como **“grano de café”**. La **colitis ulcerosa** es continua, mucosa y desde el recto; el **Crohn** es segmentario y transmural con fístulas. El cáncer sigue la **secuencia adenoma-carcinoma**; el colon **derecho** da anemia y el **izquierdo** obstrucción; la profundidad (T) se mide por capas y se necesitan 12 ganglios.')
