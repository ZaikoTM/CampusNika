# -*- coding: utf-8 -*-
"""UP 11 · Parte A: semiología, riñón, uréter y litiasis, vejiga y fisiología miccional."""
from .up01e import N, G, L, oral

ST = 'Smith y Tanagho, __Urología general__, 18.ª ed., {c}.'
SCHU = 'Manual de Urología SCHU, 3.ª ed., {c}.'
SCH = 'Schwartz, __Principios de Cirugía__, 10.ª ed., {c}.'


def semiologia(u):
    u.h2('Semiología y estudios urológicos: qué se palpa y qué estudio responde cada pregunta', intro='La urología se aborda con un examen dirigido (flancos, hipogastrio, genitales y tacto rectal) y pocos estudios. Cada estudio muestra una parte distinta de la anatomía de la vía urinaria.')
    u.h3('Examen físico')
    u.tabla(['Maniobra', 'Qué explora', 'Hallazgo clave'], [
        ['**Puño-percusión lumbar** (ángulo costovertebral)', 'Riñón: **12.ª costilla y columna**', 'Dolor en **pielonefritis**, cólico renal o hidronefrosis aguda'],
        ['**Palpación bimanual del flanco**', 'Riñón (el derecho, más bajo, se palpa mejor)', 'Masa renal grande: tumor o hidronefrosis'],
        ['**Palpación y percusión del hipogastrio**', 'Vejiga: se hace matidez sobre el pubis cuando contiene más de 150-300 mL', '**Globo vesical** en la retención aguda de orina'],
        ['**Examen de genitales externos**', 'Pene, meato, escroto, testículos, epidídimo y cordón', 'Masa testicular, hidrocele (transilumina), varicocele ("bolsa de gusanos")'],
        ['**Tacto rectal**', '**Cara posterior de la próstata** y vesículas seminales (no se palpan si son normales)', 'Tamaño, simetría, consistencia, **surco medio**, nódulos'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 4 (exploración física) y cap. 3 (síntomas); Manual SCHU, 3.ª ed., cap. 1 (semiología).')
    N(u, 'S-458', 'Visión general del aparato urinario.', ['Riñones, uréteres, vejiga y uretra en el cuerpo femenino y masculino.', 'Seguí el trayecto de la orina de arriba hacia abajo.'], 190)
    u.h3('Estudios: qué pregunta responde cada uno')
    u.tabla(['Estudio', 'Qué muestra', 'Cuándo'], [
        ['**Ecografía** renal y vesical', 'Hidronefrosis, litiasis, masas, **residuo posmiccional**, tamaño prostático', 'Primer estudio casi siempre; sin radiación'],
        ['**Radiografía simple de abdomen**', 'Cálculos **radiopacos** (calcio), siluetas renales', 'Seguimiento de litiasis'],
        ['**TC sin contraste**', 'Litiasis (**todas**, incluso las radiolúcidas), anatomía', '**Estudio de elección en el cólico renal** del adulto'],
        ['**TC con contraste (urotomografía)**', 'Masas renales, vía excretora y **hematuria**', 'Hematuria, tumores, trauma'],
        ['**Urografía excretora** / **pielografía retrógrada**', 'Vía excretora (cálices, pelvis y uréter)', 'Cada vez menos usada; defectos de relleno'],
        ['**Uretrocistografía retrógrada y miccional**', 'Uretra, vejiga, **reflujo vesicoureteral**, extravasación', '**Trauma uretral y vesical**; estenosis; válvulas'],
        ['**Cistoscopía**', 'Mucosa vesical y uretral', '**Hematuria**: tumores, litiasis'],
        ['**Flujometría y estudio urodinámico**', '**Flujo máximo (Qmax)**; presión del detrusor', 'Síntomas urinarios bajos: obstrucción o hipoactividad del detrusor'],
        ['**PSA**, **RM multiparamétrica** y **biopsia**', 'Próstata: sospecha y confirmación de cáncer', 'Antígeno elevado o tacto sospechoso'],
    ], fuente='Smith y Tanagho, 18.ª ed., caps. 5 y 6; Manual SCHU, 3.ª ed., cap. 3.')
    G(u, 288, 'RM de la pelvis masculina: cortes axiales (Gray).', ['Identificá la **próstata**, las **vesículas seminales**, el recto y la vejiga: es el estudio que muestra la anatomía zonal.'], 190)
    N(u, 'S-521', 'RM sagital de las vísceras pelvianas.', ['Vejiga, próstata, recto y sínfisis del pubis en un solo corte.'], 190)
    oral(u, 'El examen urológico incluye la **puño-percusión lumbar**, la palpación del **hipogastrio** (globo vesical), los **genitales externos** y el **tacto rectal**, que palpa la **cara posterior de la próstata**. El primer estudio es la **ecografía** (hidronefrosis, residuo posmiccional, tamaño prostático); el **cólico renal** se estudia con **TC sin contraste**; la **hematuria** con **TC con contraste y cistoscopía**; la **retención y la obstrucción baja** con **flujometría y residuo**; y el **trauma uretral** con **uretrografía retrógrada**.', 'Así lo decís en el oral: semiología urológica')


def rinon(u):
    u.h2('Riñón y suprarrenal: posición, pedículo, vasos, relaciones y qué se lesiona', intro='El riñón es un órgano retroperitoneal con un pedículo muy ordenado. Del pedículo salen las preguntas de la cirugía renal (nefrectomía, trasplante) y del tumor renal (invasión de la vena).')
    N(u, 'S-459', 'Riñones in situ: visión anterior.', ['Cada riñón con la **suprarrenal** sobre el polo superior y el uréter.', 'El **riñón derecho** está **1-2 cm más bajo** (por el hígado).'], 205)
    N(u, 'S-460', 'Riñones in situ: visión posterior.', ['Se proyectan entre **T12 y L3**; la **12.ª costilla** cruza por detrás: la **pleura** queda cerca (neumotórax en la lumbotomía supracostal).'], 205)
    G(u, 201, 'Riñones: relaciones con las vísceras vecinas (Gray).', ['Qué tiene por delante cada riñón: **hígado y duodeno** (derecho), **bazo, páncreas y estómago** (izquierdo), y los **ángulos del colon**.'], 205)
    u.tabla(['Dato', 'Descripción', 'Aplicación'], [
        ['**Ubicación**', 'Retroperitoneales, **T12-L3**, el **hilio a nivel de L1-L2**', 'La proyección en el flanco orienta el abordaje lumbar'],
        ['**Envolturas**', 'Cápsula renal, **grasa perirrenal** y **fascia de Gerota** (la cierra); luego grasa pararrenal', 'La fascia **contiene** el hematoma y la infección (absceso perinefrítico)'],
        ['**Pedículo (de adelante hacia atrás)**', '**Vena → arteria → pelvis renal** ("VAP")', 'Orden de disección en la nefrectomía'],
        ['**Arteria renal**', 'Sale de la aorta a nivel de **L1-L2**; la derecha pasa **por detrás de la vena cava**', 'Se divide en **cinco arterias segmentarias** terminales, **sin anastomosis**'],
        ['**Vena renal izquierda**', 'Cruza **por delante de la aorta**, bajo la mesentérica superior; recibe la **vena gonadal izquierda** y la suprarrenal', '**Varicocele izquierdo**; síndrome del cascanueces; el tumor la invade'],
        ['**Pelvis renal y cálices**', 'Cálices menores → mayores → pelvis → **unión ureteropiélica**', 'Sitio de la **estenosis UPU** y de cálculos coraliformes'],
    ], fuente='Netter, láminas S-459 a S-468; Gray, págs. 201 a 205; Smith y Tanagho, 18.ª ed., caps. 2 y 37.')
    N(u, 'S-462', 'Estructura macroscópica del riñón.', ['**Corteza**, **pirámides medulares**, columnas renales, cálices y pelvis.', 'Las **papilas** drenan en los cálices menores: sitio de la necrosis papilar.'], 190)
    N(u, 'S-467', 'Arterias intrarrenales y segmentos del riñón.', ['**Cinco segmentos**: apical, anterosuperior, anteroinferior, inferior y posterior.', 'La **línea de Brödel** (entre los territorios anterior y posterior) es relativamente avascular: por ahí se abre el riñón en la cirugía con mínima pérdida de sangre.'], 205)
    G(u, 205, 'Vascularización renal (Gray).', ['Aorta, arterias renales, vena cava y venas renales; la vena izquierda es la más larga.'], 205)
    N(u, 'S-468', 'Arterias de los riñones y la vejiga urinaria.', ['**Polo inferior**: arteria polar accesoria frecuente; ramas ureterales de la renal y de la gonadal.'], 190)
    u.h3('Cáncer renal, trauma renal y nefrectomía')
    u.tabla(['Tema', 'Qué hay que saber'], [
        ['**Cáncer renal (carcinoma de células claras)**', 'Hombre mayor de 50, **tabaquismo**, obesidad; la **tríada** (hematuria, dolor lumbar y masa) es **poco frecuente**: la mayoría son **hallazgos incidentales**. **Trombo tumoral** en la **vena renal y la vena cava** (se sospecha ante un **varicocele izquierdo de aparición súbita**); síndromes paraneoplásicos (eritrocitosis, hipercalcemia, fiebre)'],
        ['**Tratamiento del tumor renal**', '**Nefrectomía parcial** en los tumores pequeños (T1) y **nefrectomía radical** en los grandes; la **trombectomía de la cava** puede ser necesaria'],
        ['**Trauma renal**', 'Escala **AAST** grados I a V (contusión, laceración, **lesión del pedículo**). **TC con contraste con fase excretora**; casi todos se tratan **sin cirugía**; **se opera** el paciente **inestable** o con hematoma **expansivo o pulsátil** (la fascia de Gerota lo contiene al comienzo)'],
        ['**Trasplante renal**', 'El injerto se coloca en la **fosa ilíaca**, **extraperitoneal**; vena y arteria renales a los vasos **ilíacos externos** y uréter a la vejiga'],
    ], fuente='Smith y Tanagho, 18.ª ed., caps. 18, 22 y 35; Manual SCHU, 3.ª ed., caps. 23 y 33; Schwartz, 10.ª ed., cap. 40.')
    L(u, 'uro_s40_p7_0.jpg', 'Tumor renal con extensión a la vena renal: TC coronal (A) y pieza de nefrectomía (B).', SCH.format(c='cap. 40 (Urología)'), ['Observá la **prolongación del tumor por la vena renal** hacia la cava: por eso se identifica y se controla la vena **antes** de movilizar el riñón.'], 90)
    L(u, 'uro_s40_p9_0.jpg', 'Traumatismo renal: TC con contraste con laceración y hematoma perirrenal.', SCH.format(c='cap. 40 (Urología)'), ['El hematoma queda **contenido** por la **fascia de Gerota**; mientras esté estable se observa.'], 90)
    u.box('clave', 'Conectá con las UP5 y UP6', 'El **retroperitoneo y sus zonas**, el **páncreas, el duodeno** y las relaciones del riñón con el **colon** están en los atlas de la **UP5** y la **UP6**. En el trauma abdominal (UP9) la **zona 2** del retroperitoneo es la renal.')
    oral(u, 'Los riñones están en el **retroperitoneo**, entre **T12 y L3**, el derecho más bajo por el hígado, envueltos por la **fascia de Gerota**. El **pedículo**, de adelante hacia atrás, es **vena, arteria y pelvis**. La **arteria renal derecha** pasa **detrás de la cava**; la **vena renal izquierda** cruza **por delante de la aorta** y recibe la vena gonadal, por eso el **varicocele es izquierdo**. Las arterias segmentarias son **terminales**, y la **línea de Brödel** es el plano avascular. El **cáncer renal** puede invadir la **vena renal y la cava** (trombo tumoral).', 'Así lo decís en el oral: riñón')


def ureter(u):
    u.h2('Uréter y litiasis: trayecto, estrechamientos, cólico renal y lesión quirúrgica', intro='El uréter se estudia por su **trayecto**, sus **tres estrechamientos** (donde se impactan los cálculos) y sus **relaciones**, que explican la lesión quirúrgica.')
    N(u, 'S-464', 'Vejiga urinaria: orientación y estructura (con los uréteres).', ['Seguí el uréter hasta la **unión ureterovesical**.'], 190)
    u.tabla(['Segmento', 'Recorrido y relaciones', 'Aplicación'], [
        ['**Pelvis renal y UPU**', 'Sale del hilio, **detrás de los vasos renales**', '**1.er estrechamiento**: sitio de la estenosis UPU y de cálculos'],
        ['**Abdominal**', 'Desciende sobre el **psoas**, por delante del músculo; cruza por **delante de los vasos ilíacos** (en la bifurcación ilíaca)', '**2.º estrechamiento** (borde de la pelvis); se identifica en la cirugía colorrectal y vascular'],
        ['**Pelviano**', 'Pared lateral de la pelvis; en la mujer pasa **por debajo de la arteria uterina** (en el ligamento ancho); en el varón, **por debajo del conducto deferente**', '**“El agua pasa bajo el puente”**: se lesiona al ligar la arteria uterina en la **histerectomía**'],
        ['**Intramural y unión ureterovesical**', 'Atraviesa la pared de la vejiga en **sentido oblicuo**', '**3.er estrechamiento**; el mecanismo valvular evita el **reflujo vesicoureteral**'],
    ], fuente='Netter, láminas S-464 a S-468; Smith y Tanagho, 18.ª ed., caps. 13 y 37.')
    u.ul(['**Irrigación segmentaria**: el uréter **abdominal** recibe ramas **por su cara medial** (renal, gonadal, aorta) y el **pelviano**, **por su cara lateral** (ilíaca interna, vesicales): por eso se **moviliza** por el lado opuesto al de los vasos y se preserva la **adventicia**.',
          'Los **traumatismos ureterales** son casi siempre **iatrogénicos** (cirugía ginecológica, colorrectal, vascular y ureteroscopía); se sospechan por **fiebre, urinoma** o **fístula**.'])
    u.h3('Litiasis urinaria y cólico renal')
    L(u, 'uro_t17_p10_0.jpg', 'Sitios de impactación del cálculo en el uréter y su dolor referido.', ST.format(c='cap. 17 (Urolitiasis)'), ['El cálculo se detiene en los **estrechamientos**: unión ureteropiélica, cruce con los vasos ilíacos y unión ureterovesical.', 'A medida que **desciende**, el dolor migra del flanco a la **fosa ilíaca, el testículo o el labio mayor** y aparecen síntomas urinarios irritativos.'], 100)
    L(u, 'uro_t17_p10_1.jpg', 'Cálculo en el uréter con dilatación del sistema excretor por encima (hidronefrosis).', ST.format(c='cap. 17 (Urolitiasis)'), ['El uréter y la pelvis se **dilatan** por encima de la obstrucción: lo que se ve en la ecografía.'], 100)
    u.tabla(['Característica', 'Dato'], [
        ['**Cólico renoureteral**', 'Dolor **lumbar de inicio brusco, intenso, en oleadas**, que irradia hacia la **ingle y los genitales** (nervio genitofemoral, T11-L2); el paciente **no encuentra posición** de alivio; náuseas, hematuria'],
        ['**Estudio**', '**TC sin contraste** (muestra todos los cálculos); ecografía y radiografía simple en el seguimiento'],
        ['**Composición**', '**Oxalato de calcio** (el más frecuente, radiopaco); **ácido úrico** (**radiolúcido**; orina ácida); **estruvita** (infección por *Proteus*, **cálculo coraliforme**); **cistina**'],
        ['**Conducta**', 'Analgesia (**AINE**), hidratación y **terapia expulsiva médica** (tamsulosina) en los cálculos **distales de menos de 10 mm**; **menos de 5 mm** se eliminan solos en la mayoría'],
        ['**Procedimientos**', '**Litotricia extracorpórea (LEOCH)** para cálculos renales de **menos de 2 cm**; **ureteroscopía con láser** para el uréter; **nefrolitotomía percutánea** para los **mayores de 2 cm** o coraliformes'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 17; Manual SCHU, 3.ª ed., cap. 8.')
    u.box('alerta', 'Cólico con fiebre: es una urgencia', 'Un cálculo que **obstruye** la vía urinaria **con infección** (fiebre, escalofríos, leucocitosis) produce **pionefrosis o sepsis urinaria**: se **drena la vía urinaria de inmediato** (**catéter doble J o nefrostomía percutánea**) y se trata el cálculo **después**. Lo mismo si hay **riñón único** o **insuficiencia renal**.')
    oral(u, 'El **uréter** desciende por el **psoas**, **cruza por delante de los vasos ilíacos** y en la mujer pasa **por debajo de la arteria uterina** ("el agua pasa bajo el puente"), por lo que se lesiona en la histerectomía. Los cálculos se impactan en los **tres estrechamientos**: la **unión ureteropiélica**, el **cruce con los vasos ilíacos** y la **unión ureterovesical**. El **cólico renal** produce dolor lumbar en oleadas que irradia a los genitales; se estudia con **TC sin contraste** y se trata con **AINE** y **tamsulosina** si el cálculo es distal y menor de 10 mm. Si hay **fiebre**, se **drena** la vía urinaria de urgencia.', 'Así lo decís en el oral: uréter y litiasis')


def vejiga(u):
    u.h2('Vejiga y fisiología miccional: anatomía, inervación, cáncer vesical y trauma', intro='La vejiga y la micción se entienden con la **inervación**: qué nervio llena, qué nervio vacía y cuál sostiene la continencia. De ahí salen la obstrucción baja, la vejiga neurogénica y la retención.')
    N(u, 'S-465', 'Vejiga urinaria: mujer y varón.', ['**Cúpula, cuerpo, trígono y cuello**.', 'El **trígono** (entre los orificios ureterales y el orificio uretral interno) es la zona más fija y sensible.'], 205)
    G(u, 244, 'Vejiga en el hombre (Gray).', ['Relación con el pubis, la próstata, las vesículas seminales y el recto.'], 190)
    u.ul(['**Capas**: mucosa **urotelial**, submucosa y **músculo detrusor** (tres capas de fibras entrelazadas), y serosa (peritoneo) solo en la **cúpula**.',
          'La vejiga **vacía** es **pelviana**; **llena** asciende por encima del pubis y levanta el **peritoneo**: por eso se puede **punzar la vejiga sobre el pubis sin entrar en el peritoneo** (cateterismo suprapúbico).',
          'El **espacio prevesical (de Retzius)** se llena de sangre en la **fractura de pelvis** y es el espacio de la **lesión extraperitoneal**.',
          '**Irrigación**: arterias **vesicales superiores e inferiores** (de la **ilíaca interna**); venas al plexo venoso vesical.'])
    u.h3('Quién inerva la micción')
    u.tabla(['Sistema', 'Origen', 'Acción'], [
        ['**Parasimpático** (nervios esplácnicos pélvicos)', '**S2-S4**', '**Contrae el detrusor** y relaja el cuello: **vaciamiento**'],
        ['**Simpático** (nervio hipogástrico)', '**T10-L2**', '**Relaja el detrusor** (receptores β) y **contrae el cuello vesical** y la próstata (receptores α): **llenado y continencia**; también la **eyaculación**'],
        ['**Somático** (nervio pudendo, núcleo de Onuf)', '**S2-S4**', '**Esfínter uretral externo** (músculo estriado, voluntario)'],
        ['**Centro de la micción**', 'Protuberancia (centro pontino) y corteza frontal', 'Coordina detrusor y esfínter: la lesión medular lo desconecta (**disinergia**)'],
    ], fuente='Netter, láminas S-513 y S-514; Gray, pág. 284; Smith y Tanagho, 18.ª ed., cap. 38; Manual SCHU, 3.ª ed., cap. 12.')
    N(u, 'S-513', 'Nervios de las vísceras pélvicas: varón.', ['**Plexo hipogástrico inferior**: fibras simpáticas y parasimpáticas hacia la vejiga, la próstata y el recto.'], 205)
    G(u, 284, 'Inervación del sistema reproductor masculino (Gray).', ['Seguí el **nervio hipogástrico** (simpático), los **esplácnicos pélvicos** (parasimpáticos) y el **pudendo**.'], 190)
    u.si_ves([('Chorro débil, goteo, nicturia en un hombre mayor', 'Obstrucción baja por **HPB** (ver próstata)'),
              ('**Globo vesical** y dolor hipogástrico con imposibilidad de orinar', 'Retención aguda de orina'),
              ('**Hematuria indolora** en un fumador', '**Cáncer de vejiga**: cistoscopía y TC'),
              ('Pérdida de orina por rebosamiento con vejiga grande', 'Vejiga hipoactiva u obstrucción crónica'),
              ('Vejiga **hiperactiva** (urgencia y frecuencia)', 'Contracciones del detrusor; **anticolinérgicos** (cuidado con la retención)'),
              ('Trauma de pelvis con **hematuria macroscópica**', 'Lesión de la vejiga: **cistografía**')])
    u.h3('Cáncer de vejiga')
    u.ul(['**Carcinoma urotelial**: **tabaquismo** y exposición a **aminas aromáticas**; **hematuria indolora** (macroscópica o microscópica).',
          '**Diagnóstico**: **cistoscopía** con **resección transuretral (RTU) del tumor**, que da el diagnóstico y la **profundidad** (invasión del músculo detrusor o no).',
          '**No invade el músculo**: RTU, **BCG intravesical** y seguimiento con cistoscopías; **invade el músculo**: **cistectomía radical** con **derivación urinaria** (conducto ileal de Bricker o neovejiga).'])
    u.h3('Trauma vesical')
    u.tabla(['Tipo', 'Mecanismo y anatomía', 'Hallazgo y conducta'], [
        ['**Extraperitoneal** (80-90 %)', 'Fractura de pelvis; la lesión es **por debajo del peritoneo**, en el espacio de Retzius', '**Cistografía retrógrada**: extravasación pelviana; sonda vesical (**manejo conservador**)'],
        ['**Intraperitoneal**', 'Golpe con **vejiga llena**; se rompe la **cúpula** (la zona cubierta por peritoneo)', 'Extravasación a la cavidad: **peritonitis urinaria**, **ascitis urinaria**; **reparación quirúrgica**'],
    ], fuente='Manual SCHU, 3.ª ed., cap. 34; Smith y Tanagho, 18.ª ed., cap. 18.')
    oral(u, 'La **micción** se controla con tres inervaciones: el **parasimpático S2-S4** (nervios esplácnicos pélvicos) contrae el detrusor; el **simpático T10-L2** (hipogástrico) relaja el detrusor y cierra el cuello (continencia, eyaculación); y el **nervio pudendo** (S2-S4) inerva el **esfínter externo voluntario**. La vejiga llena sube sobre el pubis, por eso se **punza por vía suprapúbica** sin tocar el peritoneo. El **cáncer de vejiga** se presenta con **hematuria indolora** y se diagnostica por **cistoscopía con RTU**. En el **trauma**, la lesión **extraperitoneal** (fractura de pelvis) se maneja con sonda y la **intraperitoneal** (cúpula) se repara.', 'Así lo decís en el oral: vejiga')
