# -*- coding: utf-8 -*-
"""UP 4 · Anatomía quirúrgica del colon, el recto, el ano y las ostomías. Parte B: recto, canal anal, esfínteres y patología anorrectal."""
from .up01e import N, G, L, oral
from .up04a import GAL, SCH


def recto(u):
    u.h2('Recto: límites, peritoneo, fascias, vasos, linfáticos y nervios', intro='El cáncer de recto, el prolapso y el tacto rectal se entienden con la anatomía del recto y de su “mesorrecto”.')
    u.h3('Generalidades')
    u.ul(['**Longitud**: 12-15 cm, desde la unión rectosigmoidea (**S3**, donde terminan las tenias) hasta el **anillo anorrectal** (borde superior del puborrectal). El recto bajo se mide desde el **margen anal**: **bajo** (hasta 5 cm), **medio** (5-10 cm) y **alto** (10-15 cm).',
          '**Curvaturas**: sacra (cóncava hacia delante) y perineal; tiene **tres pliegues transversales (válvulas de Houston)**. No tiene tenias ni haustras ni apéndices epiploicos: la capa muscular longitudinal es continua.',
          '**Peritoneo**: el **tercio superior** está cubierto por delante y a los lados; el **medio**, solo por delante; el **inferior** es **extraperitoneal**. La **reflexión peritoneal** forma el **fondo de saco de Douglas** (rectouterino) en la mujer o el **rectovesical** en el hombre, a unos **7-9 cm del margen anal**: es el punto más declive de la cavidad.',
          '**Mesorrecto**: la grasa que rodea el recto, con vasos y **linfáticos**, envuelta por la **fascia propia del recto**. Por detrás, la **fascia de Waldeyer** (rectosacra) lo separa del sacro; por delante, la **fascia de Denonvilliers** (rectoprostática o rectovaginal). La **escisión total del mesorrecto (ETM)** reseca todo ese paquete por el plano avascular entre la fascia propia y las estructuras pélvicas.'])
    u.h3('Relaciones y estructuras en riesgo')
    u.tabla(['Cara', 'Hombre', 'Mujer', 'Estructura en riesgo en la cirugía'], [
        ['**Anterior**', 'Vejiga, vesículas seminales, próstata (por debajo de la reflexión)', 'Fondo de saco de Douglas, **cuello uterino** y **vagina**', 'Fascia de Denonvilliers; lesión de la uretra o de la vagina'],
        ['**Posterior**', 'Sacro y cóccix, **plexo venoso presacro**, arteria sacra media', 'Igual', '**Hemorragia presacra** (difícil de controlar)'],
        ['**Laterales**', 'Ligamentos laterales con la **arteria rectal media**, **uréteres**, vasos ilíacos internos', 'Igual', '**Uréter** (identificar en el cruce con los vasos ilíacos), **plexo hipogástrico**'],
    ], fuente='Netter, láminas S-221, S-222 y S-226; Gray, págs. 242 y 243; Galindo, Enciclopedia de Cirugía Digestiva, caps. 369 a 372.')
    u.box('alerta', 'Nervios autonómicos de la pelvis', 'El **plexo hipogástrico superior e inferior** y los **nervios erigentes (S2-S4)** rodean al recto. Su lesión en la cirugía del recto produce **disfunción urinaria** (vejiga neurógena) y **sexual** (impotencia, eyaculación retrógrada). Por eso se disecciona el plano de la fascia propia del recto, bajo visión directa.')
    u.h3('Irrigación y drenaje')
    u.tabla(['', 'Arterias', 'Venas', 'Linfáticos'], [
        ['**Recto superior**', '**Rectal superior** (continuación de la AMI)', '**Rectal superior → mesentérica inferior → porta**', 'Ganglios **mesentéricos inferiores**'],
        ['**Recto medio**', '**Rectal media** (rama de la **ilíaca interna**)', 'Ilíaca interna → **cava**', 'Ganglios **ilíacos internos**'],
        ['**Recto inferior y ano**', '**Rectal inferior** (de la **pudenda interna**)', 'Pudenda interna → ilíaca interna → **cava**', 'Canal anal bajo: ganglios **inguinales superficiales**'],
    ], fuente='Netter, láminas S-441 y S-445; Gray, págs. 263, 280 y 281; Galindo, Enciclopedia de Cirugía Digestiva.')
    u.ul(['**Anastomosis portosistémica rectal**: la rectal superior (porta) se une a la media e inferior (cava): ahí se forman las **hemorroides** y las **várices rectales** en la hipertensión portal.',
          '**Importancia oncológica**: el cáncer de **recto alto** diseminará al hígado por la porta; el de **recto bajo**, a pulmón y ganglios pélvicos; el **cáncer del canal anal** drena a los ganglios **inguinales**.'])
    u.h3('Cáncer de recto: lo que decide la anatomía')
    u.ul(['**Estudio**: **tacto rectal** (altura, fijación, relación con el esfínter), **rectosigmoidoscopia** o colonoscopia con biopsia, **RM de pelvis** (muestra la **fascia mesorrectal**, el **margen circunferencial** y los ganglios) y **ecoendoscopia rectal** (capas T1-T2).',
          '**Estadificación**: T según la capa (submucosa, muscular propia, grasa perirrectal, peritoneo y estructuras vecinas); **margen circunferencial** en milímetros hasta la fascia mesorrectal.',
          '**Tratamiento actual**: **neoadyuvancia** (quimiorradioterapia o ciclo corto) en tumores del **recto medio y bajo** T3-T4 o con ganglios; luego **ETM** con **resección anterior (alta o baja)**; si el tumor invade el aparato esfinteriano, **amputación abdominoperineal (Miles)** con colostomía definitiva; **Hartmann** en urgencias. Los T1 seleccionados se tratan con resección local transanal (TAMIS).'])
    N(u, 'S-221', 'Recto in situ: mujer y hombre.', ['Reflexión peritoneal, fondo de saco de Douglas o rectovesical y relaciones con el útero, la vagina, la vejiga y la próstata.'], 195)
    N(u, 'S-222', 'Espacios extraperitoneales perineales y pélvicos.', ['Espacios presacro, pararrectal y retrorrectal por donde se extiende una infección o un tumor.'], 190)
    N(u, 'S-441', 'Arterias del recto y el conducto anal en el hombre.', ['Rectal superior, media e inferior y sus anastomosis.'], 190)
    N(u, 'S-445', 'Venas del recto y el conducto anal en la mujer.', ['Drenaje a la porta y a la cava: base de las hemorroides.'], 190)
    N(u, 'S-513', 'Nervios de las vísceras pélvicas: mujer.', ['Plexos hipogástricos y nervios erigentes: estructuras en riesgo en la cirugía del recto.'], 190)
    N(u, 'S-517', 'Nervios de las vísceras pélvicas: hombre.', ['Plexo hipogástrico inferior y nervios cavernosos.'], 190)
    N(u, 'S-483', 'Cavidad pélvica: mujer.', ['Relaciones peritoneales del recto con el útero y la vejiga.'], 190)
    N(u, 'S-484', 'Cavidad pélvica: hombre.', ['Relaciones peritoneales del recto con la vejiga y la próstata.'], 190)
    G(u, 242, 'Recto y vejiga in situ (Gray).', ['Reflexión peritoneal.'], 190)
    G(u, 243, 'Recto (Gray).', ['Válvulas de Houston, ampolla rectal y mesorrecto.'], 190)
    G(u, 263, 'Drenaje venoso del recto (Gray).', ['Plexos hemorroidales y anastomosis portosistémica.'], 190)
    G(u, 280, 'Linfáticos de la pelvis y el periné masculinos (Gray).', ['Drenaje del recto a los ganglios ilíacos y del canal anal a los inguinales.'], 190)
    u.h3('Prolapso rectal y tacto rectal')
    u.ul(['**Prolapso rectal (procidencia)**: protrusión del recto a través del ano; se asocia a un **fondo de saco de Douglas profundo**, laxitud de los **ligamentos laterales**, esfínter hipotónico y diástasis del elevador. Se distingue del **prolapso hemorroidal** por los **pliegues concéntricos** (circulares) frente a los radiales. Se trata con **fijación del recto** (rectopexia) con o sin resección.',
          '**Tacto rectal**: de ahí se palpa, en el hombre, la **próstata** y las vesículas seminales; en la mujer, el **cuello uterino**; en ambos, el **fondo de saco** (el absceso pelviano y el estante de Blumer), el **sacro**, el tono del esfínter y el **anillo anorrectal**, y se mide la distancia al tumor. Sin tacto rectal no se completa el examen del abdomen agudo ni de la hemorragia digestiva.'])
    oral(u, 'El recto mide 12-15 cm, va de **S3** al **anillo anorrectal** y tiene tres válvulas de Houston. Su **reflexión peritoneal** (7-9 cm del margen anal) forma el **fondo de saco de Douglas o rectovesical**, el punto más declive. Está rodeado por el **mesorrecto** (grasa, vasos y linfáticos) envuelto en la **fascia propia**; por delante lo separa la **fascia de Denonvilliers** y por detrás la de **Waldeyer**. Se irriga por la **rectal superior** (AMI), la **media** (ilíaca interna) y la **inferior** (pudenda interna), y se comunican entre sí: ahí hay una **anastomosis portosistémica** (hemorroides). El drenaje linfático es a los ganglios mesentéricos inferiores (alto), ilíacos internos (medio) e inguinales (canal anal). En el **cáncer de recto** la RM define la fascia mesorrectal y el margen circunferencial; se opera con **escisión total del mesorrecto**, resguardando el **plexo hipogástrico** (función urinaria y sexual) y se indica **neoadyuvancia** en tumores T3-T4 o con ganglios.')


def canal_anal(u):
    u.h2('Canal anal, esfínteres y patología anorrectal', intro='Hemorroides, fisura, absceso, fístula, incontinencia y cáncer de ano se explican por la línea pectínea, los esfínteres y los espacios perianales.')
    u.h3('Canal anal: dos definiciones')
    u.tabla(['', 'Canal anal quirúrgico', 'Canal anal anatómico'], [
        ['**Límites**', 'Del **anillo anorrectal** (puborrectal) al margen anal', 'De la **línea pectínea (dentada)** al margen anal'],
        ['**Longitud**', '~4 cm', '~2 cm'],
        ['**Uso**', 'Cirugía y cáncer', 'Anatomía descriptiva'],
    ])
    u.h3('Línea pectínea: el límite que organiza todo')
    u.tabla(['', 'Por encima de la línea pectínea', 'Por debajo de la línea pectínea'], [
        ['**Epitelio**', 'Columnar → zona de transición', 'Escamoso (anodermo y piel)'],
        ['**Inervación**', '**Autonómica** (visceral): sin dolor', '**Somática (nervio rectal inferior, rama del pudendo)**: dolor intenso'],
        ['**Arterias y venas**', 'Rectal superior; **porta**', 'Rectal inferior; **cava**'],
        ['**Linfáticos**', 'Ganglios **pélvicos** (ilíacos internos y mesentéricos inferiores)', 'Ganglios **inguinales**'],
        ['**Hemorroides**', '**Internas**', '**Externas**'],
    ], fuente='Galindo, Enciclopedia de Cirugía Digestiva (capítulos de patología anal); Netter, lámina S-226; Gray, pág. 243.')
    L(u, 'lib_schwartz_canal_anal.png', 'Canal anal: columnas, criptas, esfínteres y plexos hemorroidales.', SCH.format(c='cap. 29 (ano)'), ['La línea pectínea separa el epitelio columnar del escamoso; los cojinetes están por encima.'], 85)
    u.h3('Esfínteres, puborrectal y espacios')
    u.tabla(['Estructura', 'Músculo y control', 'Función'], [
        ['**Esfínter anal interno (EAI)**', 'Continuación del músculo circular liso; **involuntario**; inervación autonómica', 'Responsable de ~70 % de la presión de reposo'],
        ['**Esfínter anal externo (EAE)**', 'Músculo estriado, **voluntario**; **nervio rectal inferior (pudendo, S2-S4)**', 'Contracción voluntaria; ~30 % de la presión de reposo'],
        ['**Puborrectal** (parte del elevador del ano)', 'Fibras en “U” que rodean la unión anorrectal; nervio del elevador (S3-S4) y pudendo', 'Mantiene el **ángulo anorrectal (~90°)**: clave de la continencia'],
        ['**Músculo longitudinal conjunto**', 'Entre el EAI y el EAE', 'Atraviesa el esfínter y fija la piel: limita la propagación de abscesos'],
    ], fuente='Netter, láminas S-223, S-224 y S-226; Gray, págs. 239 y 276-279; Galindo, Enciclopedia de Cirugía Digestiva (capítulos de patología anal).')
    u.ul(['**Espacios perianales**: **perianal** (superficial), **isquioanal** (fosa isquioanal, a ambos lados), **interesfintérico**, **supraelevador** y **submucoso**. La **fosa isquioanal** comunica ambos lados por detrás del canal anal (“fístula en herradura”).',
          '**Criptas y glándulas anales**: en la línea pectínea se abren las **criptas de Morgagni**; las **glándulas anales** que desembocan allí son el origen de la mayoría de los abscesos y fístulas (**teoría criptoglandular**).',
          '**Continencia**: depende del EAI, el EAE, el puborrectal, la sensibilidad rectal, la distensibilidad (reservorio) y la consistencia de las heces. Se pierde en el **traumatismo obstétrico** (esfínter externo anterior), la cirugía anal (fistulotomía) y las neuropatías.'])
    N(u, 'S-223', 'Musculatura anorrectal.', ['Elevador del ano, puborrectal y esfínteres.'], 190)
    N(u, 'S-224', 'Músculo esfínter externo del ano: visiones perineales.', ['Porciones subcutánea, superficial y profunda.'], 190)
    N(u, 'S-225', 'Fosas isquioanales.', ['Espacios isquioanales con el paquete pudendo: sitio de los abscesos isquioanales.'], 190)
    N(u, 'S-226', 'Recto y conducto anal.', ['Línea pectínea, columnas y criptas, hemorroides y esfínteres.'], 195)
    G(u, 239, 'Suelo de la cavidad pélvica: diafragma pélvico (Gray).', ['Elevador del ano y su relación con el recto.'], 190)
    G(u, 277, 'Nervio pudendo (Gray).', ['Nervio rectal inferior para el esfínter externo y la piel perianal.'], 190)
    G(u, 270, 'Límites y techo del periné (Gray).', ['Triángulo anal con la fosa isquioanal.'], 190)
    u.h3('Patología anorrectal: la anatomía que explica cada cuadro')
    u.tabla(['Cuadro', 'Anatomía', 'Clínica'], [
        ['**Hemorroides internas**', 'Cojinetes vasculares **por encima de la línea pectínea**, en tres posiciones (**3, 7 y 11 horas** en litotomía); la **ruptura del tejido de sostén** produce el prolapso', '**Rectorragia roja brillante** indolora; grados I a IV (por el prolapso); sin dolor por la inervación visceral'],
        ['**Hemorroides externas / trombosis**', 'Plexo **por debajo de la línea pectínea**, con inervación **somática**', '**Dolor intenso** súbito y nódulo azulado doloroso'],
        ['**Fisura anal**', 'Desgarro del anodermo, **90 % en la línea media posterior** (menor perfusión por la arteria rectal inferior y **hipertonía del EAI**)', '**Dolor** durante y después de la defecación, sangre en el papel; en la **cara lateral** pensar en Crohn, tuberculosis o cáncer'],
        ['**Absceso perianal**', 'Infección de una glándula anal que se extiende por los espacios: perianal, **isquioanal**, interesfintérico o supraelevador', 'Dolor pulsátil, tumefacción, fiebre; drenaje urgente'],
        ['**Fístula perianal**', 'Trayecto entre la cripta (**orificio interno**) y la piel (**orificio externo**). Clasificación de **Parks**: **interesfintérica** (la más común), **transesfintérica**, **supraesfintérica** y **extraesfintérica**', '**Regla de Goodsall**: un orificio externo **anterior** a la línea transversa va **radial** a la cripta; uno **posterior** va **curvo** hacia la línea media posterior'],
        ['**Criptitis y papilitis**', 'Inflamación de las criptas y de las papilas anales', 'Dolor y prurito'],
        ['**Cáncer del canal anal**', '**Carcinoma epidermoide** del epitelio escamoso (**VPH**); drena a los ganglios **inguinales** (por debajo de la línea) o **pélvicos** (por encima)', 'Dolor, sangrado, masa; tratamiento con quimiorradioterapia (**protocolo de Nigro**)'],
        ['**Quiste o fístula sacrococcígea (pilonidal)**', 'Absceso o seno en el **surco interglúteo** (hendidura sacrococcígea) por pelo que penetra la piel', 'Adulto joven, varón velludo; tumefacción dolorosa sobre el cóccix'],
        ['**Cuerpos extraños y traumatismos anorrectales**', 'Lesiones del esfínter, del recto intra o extraperitoneal', '**Intraperitoneal**: peritonitis (laparotomía); **extraperitoneal**: infección pelviana (derivación)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 64, 66 y 74; Galindo, Enciclopedia de Cirugía Digestiva, caps. 377, 379, 381, 383 y 395.')
    L(u, 'gal_fistula_perianal.png', 'Fístula perianal: estilete introducido por el orificio externo.', GAL.format(c='cap. 379 (abscesos y fístulas perianales)'), ['La posición del orificio externo respecto de la línea transversa orienta al trayecto (regla de Goodsall).'], 70)
    oral(u, 'El **canal anal** se organiza por la **línea pectínea**: por encima, epitelio columnar, inervación **autonómica** (sin dolor), irrigación por la rectal superior, drenaje portal y a ganglios pélvicos; por debajo, epitelio escamoso, inervación **somática** (**nervio rectal inferior**: dolor), rectal inferior, drenaje a la cava y a ganglios **inguinales**. Las **hemorroides internas** (3, 7 y 11 horas) sangran sin dolor; las **externas** duelen. La **fisura** es posterior en la línea media (poca irrigación e hipertonía del esfínter interno). Los **abscesos y fístulas** nacen de las **glándulas anales** en las criptas; la **clasificación de Parks** (interesfintérica, transesfintérica, supraesfintérica y extraesfintérica) y la **regla de Goodsall** guían el trayecto. La **continencia** depende del esfínter interno (70 % del tono), el externo, el **puborrectal** (ángulo anorrectal) y el pudendo (S2-S4).')
