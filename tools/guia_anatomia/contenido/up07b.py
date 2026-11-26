# -*- coding: utf-8 -*-
"""UP 7 · Anatomía quirúrgica del cuello. Parte B: masas cervicales, glándulas salivales, traqueostomía, estudios, preguntas de oral y referencias."""
from .up01e import N, G, L, oral
from .up07a import SCH


def masas(u):
    u.h2('Tumores extratiroideos y laterales del cuello: congénitos, inflamatorios y neoplásicos', intro='Ante una masa cervical se piensa primero en la **ubicación** (línea media o lateral, nivel ganglionar), la **edad** y el **tiempo de evolución**. La anatomía orienta casi todo el diagnóstico.')
    u.h3('Orientación por la ubicación')
    u.tabla(['Ubicación', 'Masas más probables'], [
        ['**Línea media**', '**Quiste del conducto tirogloso**, quiste dermoide, nódulo tiroideo (istmo), ganglio prelaríngeo (délfico), tiroides ectópica'],
        ['**Lateral, triángulo anterior (carotídeo)**', '**Quiste branquial**, ganglio (nivel II-III), **paraganglioma carotídeo**, tumor del vago, absceso'],
        ['**Lateral, triángulo posterior**', 'Ganglios (nivel V), **higroma quístico (linfangioma)** en niños, lipoma, linfoma'],
        ['**Supraclavicular**', '**Ganglio de Virchow** (metástasis abdominal o torácica), linfoma, tumor de pulmón (Pancoast)'],
        ['**Región parotídea y submandibular**', 'Tumor salival, adenitis, litiasis (ver módulo siguiente)'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 25 (tumores laterales del cuello); Michans, Cirugía, 5.ª ed., cap. 23.')
    u.h3('Masas congénitas')
    u.tabla(['Cuadro', 'Origen embriológico', 'Clínica y conducta'], [
        ['**Quiste del conducto tirogloso**', 'Resto del **conducto tirogloso** (foramen ciego → istmo)', 'Masa **en la línea media** (a nivel del hioides), **se mueve con la deglución y con la protrusión de la lengua**; se infecta; **operación de Sistrunk** (se reseca el quiste, el trayecto y el **cuerpo central del hioides**)'],
        ['**Quiste y fístula branquial** (el más frecuente: **2.º arco**)', 'Resto del 2.º arco branquial', 'Masa **en el borde anterior del ECM**, en la unión del tercio superior y medio; la **fístula** tiene su orificio en el borde anterior del ECM y su trayecto pasa **entre las carótidas interna y externa** hasta la amígdala; **resección completa**'],
        ['**Higroma quístico (linfangioma)**', 'Malformación linfática', 'Niños; **triángulo posterior**; blando, transilumina; escleroterapia o resección'],
        ['**Hemangioma y malformaciones vasculares**', 'Anomalías vasculares', 'Observación, propranolol o cirugía según el tipo'],
        ['**Quiste dermoide**', 'Inclusión epitelial', 'Línea media, submentoniano'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 25; Michans, Cirugía, 5.ª ed., cap. 23.')
    u.h3('Masas inflamatorias e infecciosas')
    u.tabla(['Cuadro', 'Clave'], [
        ['**Adenitis reactiva** (viral, bacteriana)', 'Ganglios blandos, dolorosos, que se reducen en semanas'],
        ['**Tuberculosis ganglionar (escrófula)**', 'Ganglios cervicales fijos que se **fistulizan**; PPD; **no se drenan por vía abierta** sin diagnóstico'],
        ['**Enfermedad por arañazo de gato (Bartonella)**, toxoplasmosis, mononucleosis', 'Antecedente de contacto o síndrome febril'],
        ['**Absceso profundo del cuello**', 'Espacios **parafaríngeo y retrofaríngeo** (riesgo de mediastinitis); **angina de Ludwig** (submandibular): urgencia por la vía aérea'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 25; Michans, Cirugía, 5.ª ed., cap. 23.')
    u.h3('Masas neoplásicas')
    u.tabla(['Tumor', 'Dónde y cómo', 'Dato clave'], [
        ['**Metástasis ganglionar de un carcinoma epidermoide de cabeza y cuello**', '**Niveles II-III**, adulto fumador y bebedor', 'Hay que buscar el **primario** (cavidad oral, orofaringe, laringe, hipofaringe, nasofaringe): **panendoscopia**'],
        ['**Metástasis de tiroides, pulmón o abdomen**', 'Nivel VI/III-IV; **supraclavicular izquierdo (Virchow)**', 'Orientan al órgano de origen'],
        ['**Linfoma**', 'Ganglios indoloros, firmes, **gomosos**, múltiples; **síntomas B**', 'Biopsia **excisional** del ganglio (no PAAF sola)'],
        ['**Paraganglioma carotídeo (tumor del glomus)**', 'Masa **pulsátil** en la **bifurcación carotídea**, móvil lateral pero no verticalmente (**signo de Fontaine**)', 'Se estudia con ecografía Doppler y angiografía (**“signo de la lira”**: separa la bifurcación); **no se biopsia**'],
        ['**Schwannoma del vago y otros**', 'Vaina carotídea', 'Masa lateral lisa; puede producir ronquera'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 25; Michans, Cirugía, 5.ª ed., caps. 23 y 24; Schwartz, Principios de Cirugía, 10.ª ed., cap. 18.')
    u.box('clave', 'Regla de los 80 (orientativa)', 'En un **adulto mayor de 40 años** con una masa cervical persistente (no inflamatoria ni tiroidea): **~80 % son neoplasias, ~80 % de ellas malignas y ~80 % metástasis**. Por eso se evita la **biopsia abierta** como primer paso (siembra tumoral): se hace **ecografía, PAAF y panendoscopia** primero.')
    N(u, 'S-396', 'Glándulas salivares.', ['Parótida, submandibular y sublingual (para ubicar las masas laterales).'], 190)
    oral(u, 'Frente a una **masa cervical** pienso en la **ubicación**: en la **línea media**, el **quiste del conducto tirogloso** (se mueve con la deglución y la protrusión de la lengua; se opera con **Sistrunk**); **lateral**, el **quiste branquial** (borde anterior del ECM, 2.º arco) o un **ganglio** (nivel II-III); en el **triángulo posterior**, el **higroma quístico** en el niño; en la **bifurcación carotídea**, el **paraganglioma** (pulsátil, signo de Fontaine). En un adulto mayor de 40 años, la masa persistente es **metástasis hasta que se demuestre lo contrario** (regla de los 80): estudio con ecografía, PAAF y **panendoscopia**, y **no biopsia abierta**. El **ganglio de Virchow** orienta a una metástasis abdominal o torácica; la **tuberculosis ganglionar** y los **abscesos profundos** (angina de Ludwig) completan el diferencial.')


def salivales(u):
    u.h2('Glándulas salivales: anatomía quirúrgica, litiasis y tumores', intro='La anatomía de la parótida es la anatomía del nervio facial. Todo lo que se pregunta de la cirugía (parotidectomía, parálisis, síndrome de Frey) sale de ahí.')
    u.h3('Parótida')
    u.ul(['La **glándula más grande** (15-30 g), entre la rama de la mandíbula, el ECM y la apófisis mastoides. El **nervio facial** la atraviesa y la divide en un **lóbulo superficial** y uno **profundo** (el **plano del facial**); el **80 % de los tumores** están en el lóbulo superficial.',
          '**Conducto parotídeo (de Stenon)**: ~5 cm, cruza el **masetero**, perfora el **buccinador** y se abre en el vestíbulo, frente al **2.º molar superior**.',
          '**Contenido de la glándula** (de superficial a profundo): **nervio facial** y sus ramas, **vena retromandibular**, **arteria carótida externa** (con la maxilar y la temporal superficial) y ganglios linfáticos intraparotídeos.',
          '**Ramas del facial**: **temporal, cigomática, bucal, marginal mandibular y cervical** (“To Zanzibar By Motor Car”). Las que se lesionan más: **marginal mandibular** (desvío de la comisura labial) y **temporal** (no puede elevar la ceja).',
          '**Inervación**: la **secretomotora** (parasimpática) viene del **glosofaríngeo (IX)** por el nervio petroso menor y el ganglio ótico; la **sensitiva**, del **auriculotemporal** (V3) y el **gran auricular** (plexo cervical).'])
    N(u, 'S-64', 'Ramos del nervio facial y glándula parótida.', ['Los cinco ramos del facial dentro de la glándula y el conducto de Stenon.'], 195)
    N(u, 'S-65', 'Nervio facial (NC VII): esquema.', ['Recorrido desde el agujero estilomastoideo y sus ramas extracraneales.'], 190)
    G(u, 518, 'Vascularización, nervio facial [VII] y linfáticos (Gray).', ['Parótida con el facial y los ganglios.'], 190)
    G(u, 519, 'Arterias y venas profundas de la región parotídea (Gray).', ['Carótida externa y vena retromandibular dentro de la glándula.'], 190)
    u.h3('Submandibular y sublingual')
    u.tabla(['Glándula', 'Ubicación', 'Conducto', 'Relaciones que se lesionan'], [
        ['**Submandibular**', 'Debajo del borde de la mandíbula, en el triángulo submandibular', '**Conducto de Wharton**: cruza al **nervio lingual** y se abre en la **carúncula sublingual**', '**Nervio lingual** (sensibilidad), **hipogloso (XII)** (lengua) y **marginal mandibular** (labio); arteria y vena faciales'],
        ['**Sublingual**', 'Suelo de la boca', 'Múltiples conductos de Rivinus', 'Nervio lingual; ránula (mucocele)'],
        ['**Accesorias** (600-1000)', 'Mucosa de la cavidad oral', '—', 'Tumores de glándulas menores: **mayoría malignos**'],
    ], fuente='Netter, lámina S-396; Gray, pág. 590; Giménez, Cirugía, 2.ª ed., cap. 24 (patologías de las glándulas salivales).')
    N(u, 'S-399', 'Músculos suprahioideos.', ['Milohioideo y digástrico: techo del triángulo submandibular y relación con la glándula.'], 175)
    G(u, 590, 'Músculos y glándulas salivales de la cavidad oral (Gray).', ['Submandibular, sublingual y conductos.'], 190)
    u.h3('Litiasis, infecciones y tumores')
    u.tabla(['Cuadro', 'Datos clave'], [
        ['**Litiasis salival**', '**~80 % en la submandibular** (saliva más alcalina y viscosa; conducto ascendente); dolor y tumefacción **con las comidas**; cálculo palpable o visible; tratamiento: extracción, litotricia, sialoendoscopia o resección de la glándula'],
        ['**Sialadenitis aguda bacteriana**', 'Dolor, fiebre, pus por el conducto; antibióticos e hidratación'],
        ['**Parotiditis epidémica (paperas)**', 'Viral, bilateral; riesgo de orquitis'],
        ['**Tumores**', '**80 % en la parótida**, ~80 % de ellos benignos; en la **submandibular** ~50 % son malignos y en la **sublingual y las accesorias**, la mayoría malignos'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 24; Michans, Cirugía, 5.ª ed., cap. 22.')
    u.tabla(['Tumor', 'Característica', 'Conducta'], [
        ['**Adenoma pleomorfo (tumor mixto benigno)**', '**El más frecuente (60-70 % de los benignos)**; lóbulo superficial; **cápsula incompleta**', '**Parotidectomía superficial**; la enucleación **recidiva** y puede malignizar'],
        ['**Tumor de Warthin (cistoadenolinfoma)**', 'Hombre fumador; **bilateral hasta en el 10 %**; polo inferior de la parótida', 'Observación o resección'],
        ['**Carcinoma mucoepidermoide**', '**El maligno más frecuente**', 'Resección con preservación del facial si no está infiltrado; vaciamiento si hay ganglios'],
        ['**Carcinoma adenoide quístico**', '**Invasión perineural** (dolor, parálisis); metástasis pulmonares tardías', 'Resección amplia y radioterapia'],
        ['**Adenocarcinoma, carcinoma ex adenoma pleomorfo**, linfoma', 'Crecimiento rápido', 'Cirugía y tratamiento complementario'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 24; Michans, Cirugía, 5.ª ed., cap. 22.')
    u.box('alerta', 'Signos de malignidad en un tumor de parótida', 'Crecimiento rápido, **dolor**, fijación a la piel o al plano profundo, **parálisis facial** (el facial está invadido), **adenopatías** cervicales. Estudio: **ecografía con PAAF** y **RM**; **no se hace biopsia incisional ni enucleación**.')
    u.h3('Cirugía de la parótida y sus complicaciones')
    u.ul(['**Parotidectomía superficial o total** con **identificación del nervio facial** (referencias: el vientre posterior del digástrico, el **trago (tragal pointer)**, la apófisis estiloides y la sutura timpanomastoidea).',
          '**Complicaciones**: **parálisis facial** (transitoria o definitiva), **síndrome de Frey** (sudoración y enrojecimiento de la piel de la mejilla al comer: el **auriculotemporal** regenera sus fibras parasimpáticas hacia las glándulas sudoríparas), **fístula salival o sialocele**, **hipoestesia del lóbulo de la oreja** (gran auricular) y cicatriz.',
          '**Submandibulectomía**: lesión de los nervios **marginal mandibular, lingual e hipogloso**.'])
    oral(u, 'La **parótida** está dividida por el **nervio facial** en un lóbulo **superficial** (donde están ~80 % de los tumores) y uno **profundo**; el **conducto de Stenon** cruza el masetero y se abre frente al 2.º molar superior; dentro están el **facial**, la **vena retromandibular** y la **carótida externa**. Las ramas del facial son temporal, cigomática, bucal, **marginal mandibular** y cervical. La **submandibular** se relaciona con los nervios **lingual, hipogloso y marginal mandibular**; su litiasis es la más frecuente (80 %). El tumor benigno más frecuente es el **adenoma pleomorfo** (cápsula incompleta: se hace **parotidectomía superficial**, no enucleación); el **Warthin** es del fumador y puede ser bilateral; el maligno más frecuente es el **mucoepidermoide**, y el **adenoide quístico** infiltra los nervios. Las complicaciones de la cirugía son la **parálisis facial**, el **síndrome de Frey** (auriculotemporal), la fístula salival y la hipoestesia del lóbulo de la oreja.')


def traqueostomia(u):
    u.h2('Traqueostomía: anatomía, indicaciones, técnica, cuidados y complicaciones', intro='La anatomía del cuello anterior define dónde y cómo se abre la tráquea. Es una pregunta frecuente de oral.')
    u.h3('Indicaciones y tipos')
    u.tabla(['Indicación', 'Ejemplo'], [
        ['**Obstrucción de la vía aérea superior**', 'Tumor de laringe, parálisis cordal bilateral, trauma, edema, cuerpo extraño'],
        ['**Ventilación mecánica prolongada** (más de 10-14 días)', 'Paciente crítico: menos lesión de la laringe y mejor aspiración'],
        ['**Protección de la vía aérea y aspiración de secreciones**', 'Compromiso neurológico, disfagia grave'],
        ['**Cirugía mayor de cabeza y cuello**', 'Prevención de la obstrucción'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 27 (indicaciones y cuidados de la traqueostomía); Michans, Cirugía, 5.ª ed., cap. 29 (tráquea).')
    u.tabla(['Tipo', 'Descripción', 'Dato'], [
        ['**Quirúrgica (abierta)**', 'Por disección de los planos, en quirófano o a pie de cama', 'Más control de los vasos; **vía aérea difícil**, cuello corto, bocio, coagulopatía'],
        ['**Percutánea (Ciaglia)**', 'Punción con aguja y **dilatadores progresivos** sobre una guía, bajo broncoscopia', 'Rápida; en pacientes en terapia intensiva sin alteraciones anatómicas'],
        ['**Cricotiroidotomía**', 'Incisión en la **membrana cricotiroidea**', '**Vía aérea de emergencia** (“cuando no se puede intubar ni ventilar”); se convierte en traqueostomía dentro de las 72 horas'],
    ])
    u.h3('Anatomía quirúrgica: de la piel a la tráquea')
    u.ul(['**Posición**: decúbito supino con un **rodillo bajo los hombros** y cuello extendido; la tráquea sube y se hace superficial.',
          '**Referencias**: **cartílago cricoides** (C6) y escotadura esternal. Se abre **entre el 2.º y el 3.º anillo traqueal** (o 3.º-4.º). **No** por encima del 1.º anillo (estenosis **subglótica**) ni por debajo del 4.º (vasos del tórax, **arteria innominada**).',
          '**Planos**: piel → tejido celular → platisma → **línea alba cervical** (entre los pretiroideos) → fascia pretraqueal → **istmo tiroideo** (se **desplaza hacia arriba** o se secciona entre ligaduras) → **pared anterior de la tráquea**.',
          '**Vasos en riesgo**: **arco venoso yugular**, venas tiroideas inferiores, **arteria tiroidea ima** y, si la traqueostomía es baja, el **tronco braquiocefálico**. **Pared posterior de la tráquea** (membranosa): el **esófago** está inmediatamente detrás.'])
    u.tabla(['Estructura', 'Por qué importa en la traqueostomía'], [
        ['**Istmo tiroideo (2.º-4.º anillo)**', 'Hay que **retraerlo o seccionarlo**; puede sangrar'],
        ['**Cúpula pleural**', 'Un **neumotórax** o **enfisema** si se lesiona (cuello bajo)'],
        ['**Arteria innominada**', 'Cruza la tráquea por delante en el tórax superior: **fístula traqueoinnominada** (hemorragia centinela, 3-4 semanas después)'],
        ['**Esófago y recurrentes**', 'En el surco traqueoesofágico: la **perforación posterior** y la lesión del nervio son complicaciones'],
    ])
    N(u, 'S-379', 'Tráquea y bronquios de mayor tamaño.', ['Anillos cartilaginosos, pared posterior membranosa y carina.'], 190)
    G(u, 560, 'Raíz del cuello: arterias (Gray).', ['Tronco braquiocefálico, carótidas y subclavias en la salida del tórax.'], 190)
    N(u, 'S-375', 'Cartílagos de la laringe (referencia para la cricotiroidotomía).', ['Membrana cricotiroidea entre el tiroides y el cricoides.'], 190)
    u.h3('Cuidados y complicaciones')
    u.tabla(['Aspecto', 'Detalle'], [
        ['**Cuidados**', '**Humidificación y aspiración** de secreciones; **balón** con presión menor de **25 cmH2O**; limpieza de la **cánula interna**; **primer cambio de cánula a los 5-7 días** (cuando el trayecto está formado); fijación segura; comunicación con el paciente'],
        ['**Complicaciones precoces**', '**Hemorragia**, **neumotórax y enfisema subcutáneo**, **decanulación accidental** (falsa vía: se reintuba por la boca), obstrucción por tapón mucoso, lesión del recurrente, perforación esofágica'],
        ['**Complicaciones tardías**', '**Estenosis traqueal** (subglótica o en el estoma o el balón), **traqueomalacia**, **fístula traqueoesofágica** (balón sobre la pared posterior), **fístula traqueoinnominada**, granuloma, fístula traqueocutánea persistente'],
        ['**Decanulación**', 'Cuando se resolvió la causa, el paciente tolera la cánula **tapada** y maneja las secreciones'],
    ], fuente='Giménez, Cirugía, 2.ª ed., cap. 27; Michans, Cirugía, 5.ª ed., cap. 29.')
    oral(u, 'La traqueostomía se hace con el paciente con un **rodillo bajo los hombros**, tomando como referencia el **cricoides** y la escotadura esternal; se abre **entre el 2.º y el 3.º anillo traqueal**: no por encima (estenosis subglótica) ni por debajo del 4.º (arteria innominada). Los **planos** son piel, tejido celular, platisma, **línea alba cervical**, **istmo tiroideo** (se retrae o se secciona), y tráquea; los vasos en riesgo son el **arco venoso yugular**, la **tiroidea ima** y la **innominada**. Las indicaciones son la **obstrucción de la vía aérea**, la **ventilación prolongada** (más de 10-14 días) y la protección de la vía aérea; puede ser **quirúrgica** o **percutánea**, y la **cricotiroidotomía** es la vía de emergencia. Los cuidados son **humidificación, balón con menos de 25 cmH2O** y cambio de cánula a los 5-7 días; las complicaciones son hemorragia, **neumotórax**, **decanulación accidental**, **estenosis traqueal**, **fístula traqueoesofágica** y **fístula traqueoinnominada**.')


def estudios(u):
    u.h2('Estudios complementarios del cuello', intro='Cada estudio responde una pregunta distinta: ¿es sólido o quístico?, ¿es benigno o maligno?, ¿hay ganglios?, ¿dónde está el primario?')
    u.tabla(['Estudio', 'Qué muestra', 'Cuándo se pide'], [
        ['**Ecografía cervical**', 'Tiroides (TI-RADS), ganglios, quistes, glándulas salivales, paratiroides; **guía la PAAF**', '**Primer estudio** de toda masa cervical y del nódulo tiroideo'],
        ['**PAAF** (punción-aspiración con aguja fina)', 'Citología: tiroides (**Bethesda**), ganglios, glándulas salivales', 'Nódulo tiroideo sospechoso y masa cervical (antes de cualquier biopsia abierta)'],
        ['**Laboratorio**', '**TSH, T4 libre**; **calcitonina** y **CEA** (medular); **calcemia y PTH** (hiperparatiroidismo); **tiroglobulina** (seguimiento)', 'Nódulo, bocio, sospecha de hiperparatiroidismo'],
        ['**Gammagrafía** (I-123 o Tc-99m)', 'Nódulo **caliente o frío**; en el hiperparatiroidismo, **sestamibi**', 'Nódulo con TSH baja; localización de la paratiroides'],
        ['**TC / RM de cuello y tórax**', 'Extensión del tumor, ganglios, bocio endotorácico, relación con la tráquea y la vaina carotídea', 'Estadificación, bocio grande, cáncer avanzado'],
        ['**Panendoscopia** (laringe, faringe, esófago)', 'Busca el **tumor primario** en la mucosa de cabeza y cuello', 'Metástasis ganglionar con primario desconocido'],
        ['**Laringoscopia**', 'Movilidad de las **cuerdas vocales**', '**Antes y después** de la cirugía tiroidea (descartar lesión del recurrente)'],
        ['**Biopsia excisional**', 'Ganglio completo', 'Sospecha de **linfoma** o PAAF no diagnóstica'],
    ], fuente='Giménez, Cirugía, 2.ª ed., caps. 23 y 25; Michans, Cirugía, 5.ª ed., caps. 21 y 23; Consenso intersocietario sobre cáncer diferenciado de tiroides.')
    oral(u, 'Para el **nódulo tiroideo** pido **TSH** y **ecografía** (TI-RADS) y, según la categoría y el tamaño, **PAAF** (Bethesda); la **gammagrafía** solo si la TSH está baja. Para una **masa cervical** en el adulto: **ecografía y PAAF**, **TC o RM** y **panendoscopia** para buscar el primario; la **biopsia excisional** se reserva para el sospechoso de linfoma. **Antes y después de la tiroidectomía** se evalúan las **cuerdas vocales** con laringoscopia, y se controlan **calcemia y PTH** por la posibilidad de hipoparatiroidismo.')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Cada una une anatomía con la patología de la unidad.')
    qa = [
        ('¿Cuáles son los límites del triángulo anterior y del posterior del cuello y qué contiene cada uno?',
         '**Anterior**: línea media, borde anterior del ECM y mandíbula; contiene la **carótida y la yugular interna** (carotídeo), la tiroides (muscular) y la glándula submandibular. **Posterior**: borde posterior del ECM, trapecio y clavícula; contiene el **nervio accesorio (XI)**, el plexo cervical y el plexo braquial.'),
        ('Describí los niveles ganglionares del cuello.',
         '**I** submentoniano y submandibular; **II, III y IV** yugulares superior (hasta el hioides), medio (hasta el cricoides) e inferior (hasta la clavícula); **V** triángulo posterior; **VI** central (tiroides: prelaríngeos, pretraqueales y paratraqueales); **VII** mediastino superior.'),
        ('¿Cuál es la relación del nervio recurrente con la tiroides y por qué se lo identifica antes de ligar la tiroidea inferior?',
         'El recurrente sube por el **surco traqueoesofágico**, **cruza la arteria tiroidea inferior** (por delante, por detrás o entre sus ramas) y pasa **por detrás o a través del ligamento de Berry**. Se lo identifica antes de ligar la arteria para no lesionarlo. El **derecho** rodea la subclavia (oblicuo) y el **izquierdo** el cayado aórtico (vertical).'),
        ('¿Cómo se irrigan las paratiroides y cómo se evita el hipoparatiroidismo?',
         'Por la **arteria tiroidea inferior**. Se liga **sobre la cápsula** de la tiroides, identificando y preservando las paratiroides con su pedículo; si se devascularizan, se **autotrasplantan** en el ECM. La **hipocalcemia** aparece a las 24-72 horas (parestesias, Chvostek, Trousseau).'),
        ('Un paciente tiene disnea y tumefacción cervical a las 4 horas de una tiroidectomía. ¿Qué pensás y qué hacés?',
         '**Hematoma cervical** (espacio pretraqueal) que comprime la tráquea: **urgencia vital**. Se **abre la herida en la cama** para descomprimir y se reopera para controlar el sangrado.'),
        ('¿Cómo se estudia y se trata un nódulo tiroideo?',
         '**TSH y ecografía (TI-RADS)**; **PAAF (Bethesda)** según la categoría; **gammagrafía** si la TSH está baja. Bethesda II: seguimiento; IV: lobectomía; V-VI: cirugía. El cáncer diferenciado se trata con lobectomía o tiroidectomía total, yodo radiactivo y levotiroxina.'),
        ('Diferenciá el quiste tirogloso del quiste branquial.',
         '**Tirogloso**: línea media, a nivel del hioides, **se mueve con la deglución y la protrusión de la lengua**; operación de **Sistrunk** (con el cuerpo del hioides). **Branquial**: lateral, **borde anterior del ECM**, 2.º arco; fístula entre las carótidas interna y externa.'),
        ('¿Qué estructuras están en riesgo en la parotidectomía?',
         'El **nervio facial** (parálisis, sobre todo la rama marginal mandibular), el **auriculotemporal** (**síndrome de Frey**), el **gran auricular** (hipoestesia del lóbulo de la oreja) y el conducto de Stenon (fístula salival). Se identifica el facial con referencias (digástrico, tragus, estiloides).'),
        ('¿Dónde se hace la traqueostomía y cuáles son los planos y las complicaciones?',
         '**Entre el 2.º y el 3.º anillo** (no el 1.º ni más abajo del 4.º). Planos: piel, platisma, línea alba cervical, **istmo tiroideo**, tráquea. Complicaciones: hemorragia (arco venoso, tiroidea ima), **neumotórax**, decanulación, **estenosis traqueal**, fístula traqueoesofágica y **traqueoinnominada**.'),
        ('Un hombre de 55 años fumador tiene una masa cervical lateral persistente. ¿Qué haces?',
         'Sospecho **metástasis ganglionar** de un carcinoma epidermoide de cabeza y cuello (regla de los 80). **Ecografía, PAAF** y **panendoscopia**; TC o RM. **No biopsia abierta** inicial; si el estudio es dudoso por linfoma, biopsia excisional.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['Giménez, M. __Cirugía: fundamentos para la práctica clínico-quirúrgica__, 2.ª ed. (2025), Editorial Médica Panamericana: caps. 23 (nódulo y cáncer tiroideos), 24 (glándulas salivales), 25 (tumores laterales del cuello), 26 (hiperparatiroidismo) y 27 (traqueostomía).',
          'Ferraina, P. y Oría, A. __Cirugía de Michans__, 5.ª ed.: caps. 21 (tiroides y paratiroides), 22 (glándulas salivales), 23 (quistes y fístulas congénitas, tumores inflamatorios y neoplasias del cuello), 24 (tumores malignos del tracto aerodigestivo superior) y 29 (tráquea).',
          'Schwartz, __Principios de Cirugía__, 10.ª ed.: caps. 18 (cabeza y cuello) y 38 (tiroides, paratiroides y suprarrenales).',
          'Consenso intersocietario sobre cáncer diferenciado de tiroides; sistema Bethesda para la citología tiroidea y ACR TI-RADS 2017.',
          'Márquez Martín, R. y Muñoz Maldonado, G. __Cirugía general para el médico general__.'])
    u.box('alerta', 'Estrés laboral y síndrome de burnout', 'La segunda parte de la unidad (estrés laboral, desgaste psíquico en el equipo de salud y síndrome de burnout: Arenas, Calabrese, Gatto y Dejours) **no tiene contenido anatómico** y no está en este atlas; se estudia con las lecturas de la unidad y con la guía de estudio.')
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. La lámina de Netter o de Gray muestra la **anatomía real**: ante cualquier duda, **la lámina manda**. Las clasificaciones (Bethesda, TI-RADS, TNM) se actualizan: verificá la versión vigente.')
    u.h3('Imágenes en blanco y negro')
    u.ul(['La gammagrafía y la ecografía del estudio del nódulo, y la histología, son imágenes de estudios; el resto de las figuras son a color.'])
