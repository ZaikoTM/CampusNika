# -*- coding: utf-8 -*-
"""UP 8 · Parte A: fundamentos (hueso, vasos del hueso, consolidación, imágenes), pelvis y cadera, muslo y fémur."""
from .up01e import N, G, L, oral

ORR = 'Orrego y Morán, __Ortopedia y Traumatología Básica__ (2014), {c}.'
CTO = 'Manual CTO de Medicina y Cirugía, Traumatología y Ortopedia (2019), {c}.'


def fundamentos(u):
    u.h2('Fundamentos: el hueso, sus vasos, la consolidación y cómo se lee una radiografía', intro='Antes de las regiones conviene tener el vocabulario y la lógica del hueso: de dónde le llega la sangre, qué cambia con la edad y por qué una fractura “cierra” o no. Con eso se entiende casi cualquier complicación de la unidad.')
    u.h3('Partes de un hueso largo y nomenclatura')
    u.tabla(['Parte', 'Qué es', 'Por qué importa'], [
        ['**Epífisis**', 'Extremo articular, cubierto de cartílago; hueso esponjoso', 'La fractura **articular** exige reducción **anatómica** (si queda escalón, artrosis)'],
        ['**Fisis (cartílago de crecimiento)**', 'Zona entre epífisis y metáfisis en el niño', 'La lesión fisaria puede acortar o deformar el hueso (clasificación de **Salter-Harris**)'],
        ['**Metáfisis**', 'Zona ensanchada, esponjosa, muy vascularizada', 'Sitio de **osteomielitis hematógena** del niño y de varios **tumores** (osteosarcoma)'],
        ['**Diáfisis**', 'Cuerpo del hueso; cortical gruesa y canal medular', 'Fractura diafisaria: **enclavado endomedular**; riesgo de **embolia grasa**'],
        ['**Periostio**', 'Capa externa que forma hueso nuevo y lleva vasos', 'Si se conserva, la consolidación es mejor; es el origen del **callo**'],
    ], fuente='Netter, láminas S-172 y S-174; Orrego y Morán (2014), principios generales de fracturas.')
    u.h3('Irrigación del hueso (se pregunta mucho)')
    u.ul(['**Arteria nutricia**: entra por el agujero nutricio de la diáfisis y se divide hacia ambos extremos; irriga los **dos tercios internos** de la cortical.',
          '**Arterias metafisoepifisarias**: nacen de las arterias periarticulares; irrigan los extremos.',
          '**Vasos perióstico**: irrigan el **tercio externo** de la cortical.',
          'En la fractura diafisaria se corta la nutricia y el hueso **depende del periostio**: por eso el fresado y el enclavado **cerrado** respetan más la biología que la placa con gran apertura.',
          'Hay huesos con **irrigación terminal**, donde la fractura corta el único aporte y el fragmento se necrosa: **cabeza femoral**, **escafoides**, **cuerpo del astrágalo** y **cabeza humeral**.'])
    L(u, 'tr_c03_p3_1.png', 'Irrigación de la cabeza femoral: las ramas ascendentes de las arterias circunflejas entran por el cuello.', CTO.format(c='fracturas del extremo proximal del fémur'), ['La cabeza se irriga sobre todo por las ramas **retinaculares** de la circunfleja medial; por eso la fractura subcapital desplazada la deja sin sangre.', 'La arteria del ligamento redondo aporta poco en el adulto.'], 105)
    u.h3('Consolidación de una fractura')
    u.tabla(['Fase', 'Qué ocurre', 'Aplicación'], [
        ['**Inflamatoria** (hematoma)', 'Hematoma y células inflamatorias; primeros días', 'No se debe evacuar el hematoma en la consolidación indirecta'],
        ['**Reparativa** (callo blando y duro)', 'Cartílago y hueso inmaduro unen los fragmentos; semanas', 'Con yeso o con enclavado hay **callo visible** en la radiografía'],
        ['**Remodelación**', 'Hueso laminar reemplaza al inmaduro; meses a años', 'Explica que en el niño se corrijan deformidades'],
    ], fuente='Orrego y Morán (2014), consolidación de las fracturas.')
    u.box('alerta', 'Retardo de consolidación, seudoartrosis y consolidación viciosa', 'Factores: **mala vascularización** (cuello femoral, tercio distal de tibia, escafoides), **infección**, **tabaquismo**, diabetes, inmovilización insuficiente y **separación de los fragmentos**. La **seudoartrosis** puede ser **hipertrófica** (hay callo, falta estabilidad) o **atrófica** (falta biología).')
    u.h3('Cómo se pide y se lee una radiografía')
    u.ul(['**Siempre dos proyecciones** (frente y perfil) e incluir **la articulación por encima y por debajo** de la fractura.',
          'Describí: **hueso** comprometido, **localización** (tercio, metáfisis, intraarticular), **trazo** (transverso, oblicuo, espiroideo, conminuto), **desplazamiento** (traslación, angulación, rotación, acortamiento) y **partes blandas**.',
          'La Rx de **pelvis AP** más las proyecciones **inlet y outlet** definen el anillo pelviano; la **cross table** muestra la cadera en perfil sin mover al paciente.'])
    L(u, 'tr_o13_p2_1.png', 'Radiografía de pelvis anteroposterior normal.', ORR.format(c='cap. 13, pelvis y cadera'), ['Seguí la **línea de Shenton** (borde inferior del cuello femoral con el borde superior del agujero obturador): se interrumpe en las fracturas del cuello y en las luxaciones.', 'Compará siempre un lado con el otro; **simetría** de ramas y agujeros obturadores.'], 90)
    oral(u, 'Un hueso largo tiene **epífisis, metáfisis y diáfisis**; en el niño hay **fisis** entre la epífisis y la metáfisis. Se irriga por la **arteria nutricia** (dos tercios internos de la cortical), por las **arterias metafisoepifisarias** y por el **periostio**. En los huesos de irrigación terminal (cabeza femoral, escafoides, astrágalo) la fractura puede devascularizar un fragmento y producir **necrosis avascular**. La consolidación tiene fase **inflamatoria, reparativa (callo) y de remodelación**. Pido siempre **dos proyecciones** e incluyo la articulación **proximal y distal**.')


def pelvis(u):
    u.h2('Pelvis y cadera: anillo pelviano, acetábulo, cuello femoral y luxación', intro='La pelvis es un anillo óseo-ligamentario que protege vasos, nervios y vísceras. Una fractura pelviana inestable se comporta como una **hemorragia retroperitoneal** y no como un simple problema óseo.')
    u.h3('Anillo pelviano: qué lo hace estable')
    u.tabla(['Estructura', 'Función', 'Cuando se rompe'], [
        ['**Complejo sacroilíaco posterior** (ligamentos sacroilíacos posteriores, sacroespinoso y sacrotuberoso)', 'Soporta el peso y mantiene unido el sacro a los iliacos: es el elemento **estabilizador posterior**', 'Pelvis **inestable verticalmente** (Tile C) y sangrado importante'],
        ['**Sínfisis del pubis** y ligamentos pubianos', 'Cierra el anillo adelante', 'Diástasis del pubis (“libro abierto”) en compresión anteroposterior'],
        ['**Ramas isquiopubianas**', 'Cierre anterior del anillo', 'Fractura frecuente del anciano; suele ser estable si el arco posterior está intacto'],
    ], fuente='Netter, láminas S-151 a S-154; Gray, págs. 306 y 307; Orrego y Morán (2014), cap. 13.')
    N(u, 'S-152', 'Ligamentos de la pelvis ósea.', ['**Sacroilíacos posteriores** (los más fuertes), sacroespinoso y sacrotuberoso.', 'Estos ligamentos son los que impiden que la hemipelvis se desplace hacia arriba o se abra.'], 190)
    N(u, 'S-154', 'Ligamentos de la hemipelvis ósea.', ['Cápsula de la cadera, ligamentos iliofemoral, isquiofemoral y pubofemoral.'], 190)
    G(u, 307, 'Pelvis articulada (Gray): frente y atrás.', ['Identificá sacro, iliacos, sínfisis y agujeros obturadores.'], 190)
    u.h3('Clasificación por mecanismo (Young-Burgess y Tile)')
    L(u, 'tr_o13_p2_2.png', 'Mecanismos de las fracturas de pelvis: compresión lateral, compresión anteroposterior y cizallamiento vertical.', ORR.format(c='cap. 13, fracturas de pelvis'), ['**A** compresión lateral: el anillo se cierra y comprime las vísceras.', '**B** compresión anteroposterior: “libro abierto”.', '**C** cizallamiento vertical: la hemipelvis sube; es la más inestable.'], 90)
    u.tabla(['Tipo', 'Mecanismo', 'Estabilidad', 'Riesgo'], [
        ['**Compresión lateral (LC)**', 'Golpe lateral (caída, accidente)', 'Variable', 'Lesión de **vejiga y recto**, hemorragia menor'],
        ['**Compresión anteroposterior (APC)**', 'Golpe frontal o aplastamiento', 'Inestable en APC II y III', '**Hemorragia grave** (el volumen pelviano aumenta)'],
        ['**Cizallamiento vertical (VS)**', 'Caída de altura', '**Muy inestable**', 'Lesión vascular y neurológica severa'],
    ], fuente='Young-Burgess y Tile en Orrego y Morán (2014), cap. 13; Ramos Vértiz, capítulo de fracturas de pelvis.')
    u.h3('Qué sangra y qué se lesiona con una fractura de pelvis')
    u.ul(['**Plexo venoso presacro y vasos del hueso esponjoso** (cerca del 85 % del sangrado): se controla **cerrando el anillo** con faja, sábana o fijador externo.',
          '**Arterias iliacas internas y sus ramas** (glútea superior, pudenda interna, obturatriz): angioembolización.',
          '**Corona mortis**: anastomosis entre la arteria epigástrica inferior y la obturatriz sobre la rama superior del pubis; se lesiona en abordajes y fracturas de ramas.',
          '**Uretra** (membranosa en el hombre, más lábil en la fractura de ramas) y **vejiga**: sangre en el meato, hematoma perineal o **próstata ascendida** → no pasar sonda; **uretrografía retrógrada**.',
          '**Recto y vagina** en fracturas abiertas hacia el periné: tacto rectal y vaginal siempre.',
          '**Nervios**: **raíces lumbosacras** (L5 y S1 contra el sacro: pie caído, anestesia perineal), **nervio ciático** y glúteo superior en fracturas de la escotadura ciática o del acetábulo.'])
    N(u, 'S-333', 'Arterias del miembro inferior: referencia de las ramas pelvianas (iliaca interna) y la femoral.', ['Seguí la **iliaca externa** que se transforma en **femoral** al pasar el ligamento inguinal.'], 190)
    L(u, 'tr_o13_p3_0.png', 'Radiografía de pelvis (inlet) con tornillos en el arco pelviano anterior y posterior.', ORR.format(c='cap. 13, fig. 13-5'), ['Ejemplo de **fijación**: tornillos iliosacros y del arco anterior.'], 85)
    oral(u, 'El anillo pelviano se mantiene por el **complejo ligamentario sacroilíaco posterior** y la sínfisis del pubis. Según el mecanismo se clasifica en **compresión lateral, anteroposterior y cizallamiento vertical** (Young-Burgess), o en estable e inestable (Tile A, B, C). La mayor parte del sangrado viene del **plexo venoso presacro** y del hueso; el control inicial es **cerrar el anillo** (faja pelviana) y reanimar, y si persiste se hace **angioembolización** de la iliaca interna o **packing** preperitoneal. Siempre busco **lesión uretral y vesical** (sangre en el meato, próstata alta, hematoma perineal) antes de sondar.', 'Así lo decís en el oral: fractura de pelvis')
    u.h3('Acetábulo, cuello femoral y fractura de cadera')
    u.tabla(['Fractura', 'Quién', 'Vascularización', 'Tratamiento'], [
        ['**Subcapital / transcervical** (intracapsular)', 'Anciano con osteoporosis tras caída', '**Alto riesgo de necrosis avascular** y seudoartrosis (las ramas retinaculares pasan por el cuello)', 'Jóvenes: **reducción urgente y osteosíntesis**; ancianos desplazadas: **artroplastia**'],
        ['**Pertrocantérica** (extracapsular)', 'Anciano', 'Buena; el hueso esponjoso consolida', '**Osteosíntesis** (clavo cefalomedular o tornillo-placa) en 24-48 h'],
        ['**Fractura del acetábulo**', 'Impacto axial (rodilla contra el tablero)', 'Riesgo de **luxación, lesión ciática** y artrosis', 'Reducción anatómica según el patrón (Letournel: columnas y paredes)'],
    ], fuente='Orrego y Morán (2014), cap. 13; Manual CTO, fracturas del fémur proximal; Ramos Vértiz, fractura de cadera.')
    L(u, 'tr_o13_p4_0.png', 'Fractura del cuello femoral y su vascularización.', ORR.format(c='cap. 13, fractura del extremo proximal del fémur'), ['Las **ramas retinaculares** corren por el cuello y se cortan en la fractura intracapsular.'], 80)
    L(u, 'tr_o13_p4_2.png', 'Clasificación de Garden de las fracturas subcapitales (I a IV).', ORR.format(c='cap. 13, fractura del cuello femoral'), ['**I y II**: sin o con mínimo desplazamiento (impactadas); **III y IV**: desplazadas, con mayor riesgo de necrosis.', 'En Garden III y IV del anciano se prefiere la **artroplastia**.'], 95)
    L(u, 'tr_o13_p5_1.png', 'Paciente con fractura de cadera: miembro **acortado y en rotación externa**.', ORR.format(c='cap. 13, fractura de cadera'), ['El **acortamiento y la rotación externa** (por los rotadores externos y el psoas) son el signo clínico clásico.'], 90)
    L(u, 'tr_o13_p5_0.png', 'Radiografía de cadera en proyección cross table.', ORR.format(c='cap. 13, fig. 13-12'), ['Perfil de la cadera sin movilizar el miembro lesionado.'], 70)
    N(u, 'S-278', 'Arterias de la cabeza y el cuello del fémur.', ['**Arteria circunfleja femoral medial** (principal) y **lateral**, ramas de la femoral profunda, forman un anillo extracapsular.', 'Las **ramas retinaculares ascendentes** entran por el cuello: la fractura intracapsular las lesiona.', 'La **arteria del ligamento redondo** (de la obturatriz) aporta poco.'], 205)
    G(u, 311, 'Articulación de la cadera: estructura e irrigación arterial (Gray).', ['Comparalo con Netter: cápsula, ligamentos y vasos.'], 205)
    G(u, 309, 'Articulación de la cadera: cavidad, ligamento redondo y labrum (Gray).', ['Fosa acetabular, ligamento redondo y labrum; Rx de cadera normal abajo.'], 190)
    N(u, 'S-170', 'Articulación de la cadera: cápsula y ligamentos.', ['**Iliofemoral** (en Y de Bigelow, el más fuerte), pubofemoral e isquiofemoral.'], 205)
    N(u, 'S-171', 'Articulación de la cadera: radiografía anteroposterior.', ['Cabeza, cuello, trocánteres, acetábulo y línea de Shenton.'], 150)
    u.h3('Luxación de cadera: posterior (la más frecuente) y anterior')
    u.tabla(['', '**Posterior** (≈ 85-90 %)', '**Anterior**'], [
        ['**Mecanismo**', 'Choque contra el tablero con cadera flexionada y rodilla apoyada (“accidente de tablero”)', 'Cadera en abducción y rotación externa'],
        ['**Posición del miembro**', '**Flexión, aducción y rotación interna**, acortado', 'Abducción, **rotación externa**, flexión'],
        ['**Estructuras en riesgo**', '**Nervio ciático** (10-20 %): sobre todo la porción peronea (pie caído); **necrosis avascular** si se demora la reducción; fractura de pared posterior', 'Vasos femorales y nervio femoral; necrosis avascular'],
        ['**Conducta**', '**Reducción urgente** (idealmente en menos de 6 horas), luego estudio con TC', 'Igual'],
    ], fuente='Orrego y Morán (2014), cap. 13; Ramos Vértiz, luxación de cadera; Manual CTO.')
    L(u, 'tr_o13_p7_0.png', 'Radiografía de pelvis AP: luxación posterior de cadera derecha.', ORR.format(c='cap. 13, fig. 13-16'), ['La cabeza femoral queda **por detrás y arriba** del acetábulo; la línea de Shenton se rompe.'], 95)
    u.box('alerta', 'Luxación posterior de cadera: ciático y necrosis avascular', 'Siempre se examina **antes y después** de la reducción la función del **ciático** (dorsiflexión del pie y sensibilidad plantar y dorsal). La **necrosis avascular de la cabeza femoral** aumenta si la reducción se demora más de 6-12 horas; se vigila por **RM** a las semanas o meses.')
    N(u, 'S-117', 'Nervio ciático y cutáneo femoral posterior.', ['Sale por el **agujero ciático mayor, por debajo del piriforme**; en la luxación posterior queda **detrás** de la cabeza y se estira.', 'Se divide en **tibial** (medial) y **peroneo común** (lateral): el peroneo está más expuesto.'], 205)
    N(u, 'S-275', 'Nervios de la cadera y la nalga.', ['**Glúteo superior** (arriba del piriforme) y **glúteo inferior** (abajo).', 'Ciático y pudendo salen por la región glútea.'], 190)
    L(u, 'tr_o13_p7_1.png', 'Luxación posterior de cadera derecha: posición típica del miembro.', ORR.format(c='cap. 13, fig. 13-17'), ['Aducción y rotación interna.'], 70)
    u.h3('Si ves esto en la cadera o la pelvis, pensá en esto')
    u.si_ves([('Miembro **acortado y en rotación externa** tras una caída del anciano', 'Fractura de cadera (cuello o pertrocantérica)'),
              ('Miembro **acortado, aducido y rotado hacia adentro** tras un choque', 'Luxación **posterior** de cadera: examinar el **ciático**'),
              ('Hipotensión, sangre en el meato y hematoma perineal tras un aplastamiento', 'Fractura de pelvis inestable con lesión de la uretra'),
              ('**Signo de Trendelenburg** (la pelvis cae del lado opuesto)', 'Falla del **glúteo medio** (nervio glúteo superior) o dolor de cadera'),
              ('**Pie caído** tras una luxación o cirugía de cadera', 'Lesión de la porción peronea del **ciático**'),
              ('Dolor inguinal sin trauma en un joven con corticoides o alcoholismo', 'Necrosis avascular de la cabeza femoral')])
    oral(u, 'La cabeza femoral se irriga principalmente por las **ramas retinaculares** de la **arteria circunfleja femoral medial** (que viene de la femoral profunda), que ascienden por el cuello **dentro de la cápsula**. Por eso la fractura **subcapital desplazada** devasculariza la cabeza y la complicación es la **necrosis avascular**; en el anciano se prefiere la **artroplastia** y en el joven la **reducción y osteosíntesis urgente**. La fractura **pertrocantérica** es extracapsular, consolida bien y se fija con **clavo cefalomedular**. En la **luxación posterior** el miembro queda en **flexión, aducción y rotación interna**, el **ciático** está en riesgo y la **reducción es urgente**.', 'Así lo decís en el oral: cadera')


def muslo(u):
    u.h2('Muslo y fémur: compartimentos, vasos y fracturas', intro='El fémur es el hueso más grande y su fractura diafisaria sangra mucho (1 a 1,5 litros). Los vasos femorales y el nervio ciático son las estructuras que se piensan en cada fractura y en cada herida.')
    u.h3('Compartimentos del muslo y qué contiene cada uno')
    u.tabla(['Compartimento', 'Músculos', 'Nervio', 'Irrigación'], [
        ['**Anterior**', 'Cuádriceps, sartorio, psoas ilíaco (parte)', '**Femoral** (L2-L4)', 'Arteria femoral y femoral profunda'],
        ['**Medial**', 'Aductores, grácil, obturador externo', '**Obturador** (L2-L4)', 'Femoral profunda (ramas perforantes) y obturatriz'],
        ['**Posterior**', 'Isquiotibiales (bíceps femoral, semitendinoso, semimembranoso) y parte del aductor mayor', '**Ciático** (L4-S3)', 'Perforantes de la femoral profunda'],
    ], fuente='Netter, láminas S-268, S-270, S-271, S-273 y S-274; Gray, págs. 322 y 326.')
    N(u, 'S-268', 'Músculos del muslo: compartimento anterior.', ['Cuádriceps, sartorio y la **fascia lata**.'], 205)
    N(u, 'S-270', 'Arterias y nervios del muslo: visión anterior.', ['**Triángulo femoral**: nervio, arteria y vena (**N-A-V** de lateral a medial) y **canal aductor (de Hunter)**.'], 205)
    N(u, 'S-274', 'Arterias y nervios del muslo: visión posterior.', ['Ciático entre los isquiotibiales, con **perforantes** de la femoral profunda.'], 205)
    G(u, 322, 'Triángulo femoral (Gray).', ['Límites: ligamento inguinal, sartorio y aductor largo; contenido.'], 205)
    G(u, 326, 'Región posterior del muslo: arterias y nervios (Gray).', ['Seguí el ciático y las perforantes.'], 205)
    N(u, 'S-554', 'Cortes transversales seriados del miembro inferior.', ['Ubicá los tres compartimentos del muslo y los cuatro de la pierna en el corte.'], 205)
    u.h3('Vasos femorales y su lesión')
    u.ul(['**Arteria femoral**: pasa debajo del **ligamento inguinal** (punto medio entre espina ilíaca anterosuperior y sínfisis), da la **femoral profunda** unos 3-5 cm por debajo, y continúa por el **canal aductor** hasta el **hiato aductor**, donde pasa a ser **poplítea**.',
          'La **fractura supracondílea de fémur** puede lesionar la **poplítea** (el fragmento distal se desplaza hacia atrás); por eso se palpan pulsos y se mide el índice tobillo-brazo.',
          'La fractura de la **diáfisis femoral** sangra por las **perforantes**: shock hipovolémico y, con las maniobras, **embolia grasa**.'])
    u.h3('Fractura de fémur')
    u.tabla(['Fractura', 'Mecanismo y paciente', 'Complicaciones', 'Tratamiento'], [
        ['**Diáfisis femoral**', 'Alta energía en adulto joven; en el niño pensar en maltrato', 'Shock hipovolémico, **embolia grasa**, lesión de la femoral y del ciático, síndrome compartimental del muslo', '**Enclavado endomedular** (adulto); **tracción** inicial'],
        ['**Supracondílea / condílea**', 'Choque de rodilla; osteoporosis en el anciano', '**Lesión de la poplítea**, rigidez, artrosis', 'Placa o clavo retrógrado; reducción anatómica si es articular'],
    ], fuente='Orrego y Morán (2014), cap. 14; Manual CTO; Ramos Vértiz, fracturas de fémur.')
    L(u, 'tr_o14_p8_0.png', 'Fractura de fémur distal: supracondílea e intercondílea.', ORR.format(c='cap. 14, fig. 14-20'), ['Observá el desplazamiento posterior del fragmento distal, cerca de la **arteria poplítea**.'], 85)
    u.box('alerta', 'Embolia grasa', 'Entre 24 y 72 horas de una fractura de huesos largos: **hipoxemia, petequias en axila y conjuntiva, alteración del sensorio**; se previene con la inmovilización precoz del fémur y la fijación temprana.')
    N(u, 'S-172', 'Fémur: visiones anterior y posterior.', ['Cuello, trocánteres, línea áspera (inserciones musculares) y cóndilos.', 'La **línea áspera** explica por qué el fragmento se desplaza: aductores y cuádriceps traccionan.'], 205)
    oral(u, 'El muslo tiene **tres compartimentos**: anterior (cuádriceps, nervio femoral), medial (aductores, nervio obturador) y posterior (isquiotibiales, ciático). La **arteria femoral** entra por debajo del ligamento inguinal, da la **femoral profunda** y por el **canal aductor** llega al **hiato aductor**, donde se hace **poplítea**. La fractura de **diáfisis femoral** sangra mucho (hasta 1,5 litros), se estabiliza con **tracción** y se trata con **enclavado endomedular**; la **supracondílea** puede lesionar la **poplítea**.', 'Así lo decís en el oral: muslo y fémur')
