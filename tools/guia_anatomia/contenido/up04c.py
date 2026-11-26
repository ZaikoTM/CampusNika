# -*- coding: utf-8 -*-
"""UP 4 · Anatomía quirúrgica del colon, el recto, el ano y las ostomías. Parte C: ostomías, estudios, preguntas de oral y referencias."""
from .up01e import N, G, L, oral
from .up04a import GAL, SCH

OM = 'Manejo integral del paciente ostomizado (bibliografía de la unidad), {c}.'
OG = 'Guía «Conversando sobre ostomías» (bibliografía de la unidad), {c}.'


def ostomias(u):
    u.h2('Ostomías: tipos, anatomía de la confección y complicaciones', intro='Las ostomías son la última parte del programa. Se las razona con la irrigación del segmento exteriorizado y con la pared abdominal por donde pasa.')
    u.h3('Tipos y dónde se ubican')
    u.tabla(['Ostomía', 'Segmento', 'Ubicación habitual', 'Características'], [
        ['**Ileostomía**', 'Íleon terminal', '**Fosa ilíaca derecha**', 'Efluente **líquido y rico en enzimas**: irrita la piel; riesgo de **deshidratación** y alteraciones electrolíticas. Se hace **evertida (“en pico”)** para proteger la piel'],
        ['**Colostomía ascendente o transversa**', 'Colon derecho o transverso', 'Hipocondrio derecho o epigastrio', 'Heces semilíquidas; en asa, **derivativa** temporal'],
        ['**Colostomía descendente o sigmoidea**', 'Colon izquierdo', '**Fosa ilíaca izquierda**', 'Heces **formadas**; puede regularse con irrigación'],
        ['**Terminal (“con muñón distal cerrado”)**', 'Un solo extremo exteriorizado', 'Según el segmento', 'Definitiva o temporal (**Hartmann**: muñón rectal cerrado, reversible)'],
        ['**En asa**', 'Un asa del intestino con una abertura', 'Según el segmento', 'Temporal; **protege una anastomosis** distal (ileostomía en asa)'],
        ['**De doble boca**', 'Dos extremos (proximal y distal) separados', 'Según el segmento', 'Se usa en urgencias'],
    ], fuente='Manejo integral del paciente ostomizado; Galindo, Enciclopedia de Cirugía Digestiva, caps. 309 (colostomía) y 311 (complicaciones).')
    L(u, 'om_ostomias_sitios.png', 'Sitios de las ostomías: ileostomía en la fosa ilíaca derecha y colostomías en el colon.', OM.format(c='tipos de ostomía'), ['La ileostomía (distal del ciego) sale por la FID; las colostomías, según el segmento, en la fosa ilíaca izquierda, el flanco o el epigastrio.'], 65)
    L(u, 'om_ostomia_asa.png', 'Estoma en asa: asa de intestino exteriorizada con su soporte.', OM.format(c='confección de estomas'), ['La abertura en la pared anterior del asa permite la derivación temporal.'], 65)
    L(u, 'om_ostomia_doble_boca.png', 'Ostomía de doble boca: extremo proximal y distal.', OM.format(c='confección de estomas'), ['Dos aberturas separadas en la misma ostomía.'], 70)
    L(u, 'og_estoma_bolsa.png', 'Estoma funcionante con su placa y bolsa colectora.', OG.format(c='cuidados'), ['Un estoma sano es rosado-rojo, húmedo y sobresale de la piel.'], 100)
    u.h3('Anatomía de la confección')
    u.ul(['**Marcación preoperatoria**: se ubica el sitio con el paciente **sentado, de pie y acostado**, sobre el **músculo recto del abdomen** (la ostomía atraviesa su vaina: menor riesgo de hernia paraestomal), lejos del ombligo, de los pliegues, de la cintura y de las prominencias óseas (espina ilíaca), donde el paciente la **vea y la pueda manejar**.',
          '**Irrigación**: el extremo exteriorizado debe conservar su **arcada marginal** y quedar **sin tensión**; una tracción excesiva o la ligadura de un vaso comprometen la irrigación y producen **isquemia y necrosis**.',
          '**Orificio en la pared**: se hace un orificio del tamaño del intestino atravesando piel, tejido celular, aponeurosis del recto, el músculo (separando las fibras) y el peritoneo; un orificio **demasiado grande** favorece la **hernia paraestomal** y el **prolapso**, y uno **pequeño**, la estenosis y la isquemia por compresión.',
          '**Madurar** (evertir) el estoma: se sutura la mucosa a la piel, de modo que la mucosa sobresalga.'])
    L(u, 'gal_colostomia_esquema.png', 'Colostomía en asa: exteriorización del colon por la pared abdominal con su soporte.', GAL.format(c='cap. 309 (colostomía)'), ['El asa sale por un orificio de la pared sostenida por una varilla.'], 75)
    N(u, 'S-214', 'Vaina del músculo recto del abdomen: cortes transversales.', ['Por qué el estoma se hace a través del recto abdominal (planos aponeuróticos por encima y por debajo de la línea arcuata).'], 175)
    N(u, 'S-336', 'Arterias de la pared anterior del abdomen.', ['Epigástricas: vasos que hay que respetar al abrir la pared.'], 190)
    u.h3('Indicaciones')
    u.ul(['**Cáncer colorrectal obstructivo** o resección sin anastomosis (Hartmann, amputación abdominoperineal).',
          '**Diverticulitis perforada con peritonitis** (Hinchey III-IV), **vólvulo** con necrosis, **traumatismo** de colon o recto.',
          '**Protección de una anastomosis** distal (ileostomía en asa) y **fístulas** complejas.',
          '**Enfermedad inflamatoria**: colectomía total con ileostomía; **incontinencia fecal** grave; descompresión de un megacolon tóxico.'])
    u.h3('Complicaciones y su causa anatómica')
    u.tabla(['Complicación', 'Causa', 'Qué se ve'], [
        ['**Isquemia o necrosis**', 'Tensión excesiva, pérdida de la arcada marginal, orificio estrecho', 'Estoma **pálido, cianótico o negro**; si la necrosis es superficial se vigila; si es profunda, se reopera'],
        ['**Retracción**', 'Tensión, obesidad, mala fijación', 'El estoma se hunde bajo la piel: fugas y dermatitis'],
        ['**Estenosis**', 'Isquemia, cicatrización en el orificio cutáneo o en la aponeurosis', 'Estoma estrecho: dificultad para evacuar'],
        ['**Prolapso**', 'Orificio amplio o ostomía en asa', 'Intestino exteriorizado de más'],
        ['**Hernia paraestomal**', 'Debilidad de la aponeurosis alrededor del orificio', 'Abultamiento alrededor del estoma; la más frecuente de las complicaciones tardías'],
        ['**Dermatitis periestomal**', 'Contacto del efluente (más en la ileostomía), mala adaptación de la placa', 'Piel enrojecida y erosionada'],
        ['**Alto débito (ileostomía)**', 'Más de 1,5-2 litros por día', 'Deshidratación, hiponatremia, hipopotasemia'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva, cap. 311 (complicaciones de las colostomías); Manejo integral del paciente ostomizado; Giménez, Cirugía, 2.ª ed.')
    u.box('clave', 'Cuidados y educación (trabajo práctico)', [['**Estoma normal**: rosado-rojo, húmedo, sin dolor, sobresale 1-2 cm; tamaño estable a las 6-8 semanas.',
                                                              '**Placa y bolsa**: se recorta el orificio de la placa **1-2 mm mayor** que el estoma, se cambia el sistema cada 3-7 días o ante fuga, y se limpia con agua y jabón neutro (no con alcohol).',
                                                              '**Señales de alarma** que obligan a consultar: estoma **pálido, oscuro o negro**, sangrado abundante, ausencia de eliminación por más de 24-48 horas con dolor y distensión, piel lesionada, hernia o prolapso, signos de deshidratación.',
                                                              '**Impacto**: acompañamiento psicológico, imagen corporal, vida sexual y laboral, grupos de apoyo y, a las 6-12 semanas, evaluación del **cierre** si es temporal.']])
    oral(u, 'La **ileostomía** va en la **fosa ilíaca derecha** y su efluente es líquido y rico en enzimas (irrita la piel y causa deshidratación); la **colostomía sigmoidea** va en la **fosa ilíaca izquierda** y elimina heces formadas. Se confecciona **a través del músculo recto del abdomen**, con el paciente marcado previamente, con la **arcada marginal conservada** y **sin tensión**. Las complicaciones se explican por la anatomía: **isquemia y necrosis** (irrigación y tensión), **retracción**, **estenosis**, **prolapso** (orificio amplio, asa), **hernia paraestomal** (debilidad de la aponeurosis) y **dermatitis**. Las indicaciones más frecuentes son el cáncer obstructivo, la diverticulitis perforada (**Hartmann**), la protección de una anastomosis (ileostomía en asa) y el trauma.')


def estudios(u):
    u.h2('Métodos diagnósticos del colon, el recto y el ano', intro='Cada método se interpreta con la anatomía normal: segmentos, ángulos, haustras y relaciones.')
    u.tabla(['Método', 'Qué se ve', 'Indicación'], [
        ['**Videocolonoscopia**', 'Se identifica el **ciego** por el orificio apendicular, la **válvula ileocecal** y la convergencia de las tres tenias (“signo de Mercedes”); el **ángulo hepático** (tonalidad azulada del hígado), el **transverso** (haustras triangulares), el **ángulo esplénico** y el **sigmoides** tortuoso; en el recto se ven las **válvulas de Houston** y, en retroflexión, el canal anal', 'Pesquisa, hemorragia digestiva baja, anemia, sospecha de cáncer o EII; permite **biopsia** y **polipectomía**'],
        ['**Rectosigmoidoscopia / anoscopia**', 'Recto, sigmoides distal y canal anal con las hemorroides y las criptas', 'Rectorragia, patología anal'],
        ['**Colon por enema**', 'Contorno del colon: **divertículos**, estenosis en **“manzana mordida”** (cáncer), pólipos', 'Cuando no es posible la colonoscopia'],
        ['**TC con contraste**', 'Pared, grasa pericólica, abscesos y ganglios; **colonografía virtual**', 'Diverticulitis (Hinchey), obstrucción, estadificación y metástasis hepáticas'],
        ['**RM de pelvis**', '**Fascia mesorrectal**, margen circunferencial, esfínteres y fístulas', 'Cáncer de recto (estadificación) y fístulas complejas'],
        ['**Ecografía endoanal / endorrectal**', 'Capas de la pared, **esfínteres** y trayectos fistulosos', 'T1-T2 del recto; incontinencia; fístulas'],
        ['**Manometría anorrectal**', 'Presiones de reposo y de contracción; **reflejo rectoanal inhibitorio** (se pierde en Hirschsprung y Chagas)', 'Incontinencia, constipación, megacolon'],
        ['**Defecografía**', 'Evacuación del recto y del suelo pélvico', 'Prolapso, rectocele, intususcepción'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 69, 72, 73 y 83; Galindo, Enciclopedia de Cirugía Digestiva, caps. 326 (pesquisa) y 369 (estudio del cáncer de recto).')
    N(u, 'S-548', 'Radiología abdominal: TC axiales (continuación).', ['Reconocé el colon ascendente y descendente (retroperitoneales) y el sigmoides en los cortes bajos.'], 190)
    oral(u, 'En la **colonoscopia** reconozco los segmentos por su forma: el **ciego** por las tres tenias que convergen y la válvula ileocecal, el **transverso** por las haustras triangulares y los **ángulos** hepático y esplénico por la coloración del órgano vecino; el recto tiene las válvulas de Houston. Para el **cáncer de recto**, la **RM de pelvis** y la ecoendoscopia (fascia mesorrectal y capas); para la **diverticulitis**, la **TC** (Hinchey); para las **fístulas**, la RM o la ecografía endoanal; para la **incontinencia**, ecografía endoanal y manometría; y para **Hirschsprung o Chagas**, manometría con ausencia del reflejo rectoanal inhibitorio.')


def hemorragia_baja(u):
    u.h2('Hemorragia digestiva baja: causas y abordaje inicial', intro='Es el seminario de la unidad. Se origina **por debajo del ángulo de Treitz**; la anatomía da la causa más probable según el color de la sangre y el tipo de paciente.')
    u.tabla(['Causa', 'Origen anatómico', 'Clave'], [
        ['**Diverticulosis**', 'Vaso recto en el cuello de un divertículo (colon izquierdo y derecho)', 'Sangrado **indoloro, brusco y a veces masivo**, que cede solo en la mayoría'],
        ['**Angiodisplasia (ectasia vascular)**', 'Vasos submucosos del **ciego y colon derecho**', 'Anciano, estenosis aórtica, anemia; sangrado intermitente'],
        ['**Hemorroides**', 'Plexo hemorroidal interno', 'Sangre **roja brillante** sobre la deposición o en el papel'],
        ['**Fisura anal**', 'Línea media posterior', 'Sangre escasa con dolor'],
        ['**Cáncer o pólipos**', 'Mucosa', 'Sangre oculta o visible; anemia; cambio de hábito'],
        ['**Colitis** (isquémica, inflamatoria, infecciosa)', 'Mucosa del colon', 'Dolor y diarrea sanguinolenta'],
        ['**HDA masiva**', 'Úlcera duodenal posterior', 'Hematoquecia con inestabilidad: **siempre descartar** la fuente alta'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 83 (hemorragia digestiva baja); Galindo, Enciclopedia de Cirugía Digestiva, cap. 126.')
    u.ul(['**Abordaje inicial**: reanimar (vías, volumen), estimar la gravedad (signos vitales, hemoglobina, shock), **tacto rectal** y colonoscopia (previa preparación); en hemorragia masiva, **angio-TC** y arteriografía con embolización; la cirugía es el último recurso.',
          '**Preguntas clave**: color de la sangre, relación con las deposiciones, dolor, anticoagulantes o AINE, antecedentes de divertículos o neoplasia.'])


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una une anatomía con la patología de la unidad.')
    qa = [
        ('¿Por qué la diverticulosis predomina en el sigmoides y por qué sangra?',
         'Porque el sigmoides tiene el **calibre más pequeño** y la presión intraluminal más alta. Los divertículos (falsos, de pulsión) salen por los puntos débiles donde los **vasa recta penetran la muscular**; si se erosiona el vaso en el cuello del divertículo se produce una hemorragia indolora.'),
        ('Clasificá la diverticulitis perforada.',
         '**Hinchey**: I absceso pericólico, II absceso pélvico o retroperitoneal, III peritonitis purulenta, IV peritonitis fecaloidea. Se opera de urgencia a partir de III (Hartmann), y de I-II se drenan percutáneamente.'),
        ('¿Cuáles son las zonas de riesgo de isquemia del colon y por qué?',
         'El **ángulo esplénico (punto de Griffiths)**, entre la cólica media y la izquierda, y la **unión rectosigmoidea (punto de Sudeck)**, entre la última sigmoidea y la rectal superior: son **cuencas limítrofes** entre dos territorios arteriales con poca anastomosis.'),
        ('¿Qué se liga en una hemicolectomía derecha y por qué se resecan los ganglios?',
         '**Ileocólica, cólica derecha y rama derecha de la cólica media**. Los **linfáticos acompañan a los vasos**: se reseca el mesocolon con sus ganglios para la estadificación (**12 ganglios como mínimo**) y para el control oncológico.'),
        ('¿Qué lo diferencia a un cáncer de colon derecho de uno izquierdo?',
         '**Derecho**: calibre amplio y heces líquidas, tumor vegetante que tarda en obstruir: **anemia ferropénica** y masa. **Izquierdo**: calibre pequeño y heces formadas, tumor anular: **cambio del ritmo evacuatorio, hematoquecia y obstrucción**.'),
        ('Describí la anatomía del recto que importa en el cáncer.',
         'Mide 12-15 cm, con reflexión peritoneal a 7-9 cm del margen anal; el **mesorrecto** con la fascia propia contiene los linfáticos; la **fascia de Denonvilliers** y la de **Waldeyer** lo separan del resto. La **RM** mide el **margen circunferencial**; se opera con **ETM**, cuidando el **plexo hipogástrico**; se indica **neoadyuvancia** en el recto medio y bajo T3-T4.'),
        ('¿Cuál es la importancia de la línea pectínea?',
         'Separa el **epitelio columnar** del **escamoso**, la inervación **autonómica** de la **somática** (por eso las hemorroides internas no duelen y las externas sí), el drenaje **portal/pélvico** del **cava/inguinal** y los cánceres con distinta diseminación.'),
        ('¿Cómo se clasifican las fístulas perianales y qué dice la regla de Goodsall?',
         '**Parks**: interesfintérica, transesfintérica, supraesfintérica y extraesfintérica. **Goodsall**: un orificio externo **anterior** a la línea transversa va **radial** a la cripta; uno **posterior** va **curvo** hacia la línea media posterior.'),
        ('¿Por qué la fisura anal está en la línea media posterior?',
         'Por menor irrigación en esa zona (arteria rectal inferior) y por **hipertonía del esfínter interno** que mantiene la isquemia; provoca dolor y espasmo.'),
        ('¿Qué determina la ubicación y las complicaciones de una ostomía?',
         'La ileostomía va en la **FID** (efluente líquido, irrita la piel), la colostomía sigmoidea en la **FII**; se confecciona **a través del recto abdominal**, con la arcada marginal conservada y sin tensión. Complicaciones: **isquemia**, **retracción**, **estenosis**, **prolapso**, **hernia paraestomal** y **dermatitis**.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Galindo, F. __Enciclopedia de Cirugía Digestiva__ (2020), SACD: cap. 126 (hemorragia digestiva), 300 (anatomía quirúrgica del colon), 309 y 311 (colostomía y complicaciones), 315 (enfermedad diverticular), 322 y 325 (síndrome de Lynch y poliposis), 326 (pesquisa), 330 (carcinoma colorrectal), 342 (isquemia colónica), 343 (ectasias vasculares), 345 (megacolon), 348 y 355 (colitis ulcerosa y Crohn), 357 (traumatismos de colon), 369 (cáncer de recto), 377 (fisura anal), 379 (abscesos y fístulas perianales), 381 (quiste sacrococcígeo), 383 (prolapso rectal) y 395 (traumatismos anorrectales).',
          'Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025): caps. 64, 66 a 69, 71 a 74 y 83.',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: cap. 29 (colon, recto y ano).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: caps. 44 (colon y recto) y 45 (ano).',
          'Márquez Martín, R. y Muñoz Maldonado, G. __Cirugía general para el médico general__; Rojas Duarte, M. y Marinkovic Gómez, B. __Cirugía en medicina general__ (2020); Sociedad Argentina de Coloproctología, __Enfermedades de colon, recto y ano__.',
          '__Manejo integral del paciente ostomizado__ y la guía __Conversando sobre ostomías__ (bibliografía de la unidad): confección, cuidados y complicaciones.'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. La lámina de Netter o de Gray muestra la **anatomía real**: ante cualquier duda, **la lámina manda**.')
    u.h3('Imágenes en blanco y negro')
    u.ul(['Los esquemas de colostomía de Galindo y las fotografías en escala de grises de los libros de ostomías se incluyen porque no hay versiones a color; el resto de las figuras son a color.'])
