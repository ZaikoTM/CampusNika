# -*- coding: utf-8 -*-
"""UP 11 · Parte B: próstata, uretra y pene, escroto y testículo, anomalías congénitas e infecciones, preguntas y referencias."""
from .up01e import N, G, L, oral
from .up11a import ST, SCHU, SCH


def prostata(u):
    u.h2('Próstata: anatomía zonal, hiperplasia benigna, retención aguda y cáncer', intro='Es el centro de la unidad (“obstrucción urinaria baja en el adulto mayor”). La anatomía de la próstata —**qué zona crece y cuál se palpa**— explica por qué la HPB obstruye y por qué el cáncer se detecta con el tacto rectal.')
    N(u, 'S-496', 'Próstata y vesículas seminales.', ['Próstata **debajo de la vejiga**, **por delante del recto**, rodeando la **uretra prostática**.', 'Las **vesículas seminales** y los conductos deferentes desembocan en los **conductos eyaculadores**.'], 205)
    G(u, 247, 'Próstata (Gray).', ['Zonas, uretra prostática y relación con el recto; RM abajo.'], 205)
    G(u, 248, 'Zonas de la próstata (Gray): periférica, central y de transición.', ['Compará el modelo zonal con la RM axial.'], 205)
    G(u, 249, 'Próstata y vesículas seminales (Gray).', ['Cápsula, vesículas y ampollas de los conductos deferentes.'], 190)
    u.tabla(['Zona (McNeal)', 'Proporción', 'Qué se origina ahí', 'Dato clave'], [
        ['**Periférica**', '≈ 70 %', '**Cáncer de próstata** (≈ 70 %)', 'Es la que se **palpa en el tacto rectal** (cara posterior)'],
        ['**Central**', '≈ 25 %', 'Pocos tumores', 'Rodea los conductos eyaculadores'],
        ['**De transición**', '≈ 5 % (crece con la edad)', '**Hiperplasia prostática benigna (HPB)**', 'Rodea la **uretra proximal**: al crecer la **comprime** → síntomas obstructivos; **no se palpa bien** en el tacto'],
        ['**Estroma fibromuscular anterior**', '—', 'Sin glándula', 'Contiene fibras musculares lisas (receptores **α**)'],
    ], fuente='Netter, lámina S-496; Gray, págs. 247 a 249; Smith y Tanagho, 18.ª ed., caps. 23 y 38.')
    u.ul(['**Relaciones**: **por detrás**, el **recto** (separados por la **fascia de Denonvilliers**); **por delante**, el pubis y el **plexo venoso dorsal (de Santorini)**, que sangra en la cirugía; **arriba**, la vejiga; **abajo**, el **esfínter externo** y el diafragma urogenital.',
          '**Uretra prostática**: tiene una elevación posterior, el **veru montanum**, donde desembocan los **conductos eyaculadores**.',
          '**Irrigación**: arterias vesical inferior y rectal media (de la **ilíaca interna**).',
          '**Haces neurovasculares (de Walsh)**: corren **en las caras posterolaterales** de la próstata e inervan los **cuerpos cavernosos**; la **prostatectomía radical** los puede lesionar (**disfunción eréctil**) y se **conservan** cuando es posible.',
          '**Drenaje venoso**: el **plexo de Batson** (venas vertebrales sin válvulas) comunica con la columna: por eso la **metástasis ósea (blástica)** vertebral y pélvica del cáncer de próstata.'])
    L(u, 'uro_t38_p2_0.jpg', 'Cortes sagitales de la pelvis masculina: relación de la próstata con la vejiga, la uretra y el recto.', ST.format(c='cap. 38 (Trastornos de vejiga, próstata y vesículas seminales)'), ['Seguí la **uretra prostática** a través de la glándula y comparala con la vejiga y el recto de cada panel.', 'Cuando la glándula crece hacia la vejiga y la uretra, la **salida** se estrecha.'], 90)
    G(u, 289, 'RM de la pelvis masculina: imagen axial y sagital (Gray).', ['Próstata, vesículas seminales y recto en la imagen.'], 190)
    u.h3('Hiperplasia prostática benigna (HPB)')
    u.tabla(['Aspecto', 'Datos clave'], [
        ['**Síntomas**', '**Obstructivos** (chorro débil, retardo, goteo terminal, vaciado incompleto) e **irritativos** (frecuencia, urgencia, **nicturia**)'],
        ['**Cuantificación**', '**IPSS**: 0-7 leve, 8-19 moderado, 20-35 grave'],
        ['**Tacto rectal**', 'Próstata aumentada, **lisa, simétrica, elástica**, con **surco medio conservado**'],
        ['**Estudios**', '**Ecografía** (volumen y **residuo posmiccional**), **flujometría** (Qmax menor de 10 mL/s sugiere obstrucción), **PSA** (puede estar elevado por la HPB), orina y creatinina'],
        ['**Tratamiento médico**', '**α-bloqueantes** (tamsulosina: relajan el músculo liso del cuello y la próstata; rápidos); **inhibidores de la 5α-reductasa** (finasteride y dutasteride: **reducen el volumen** y bajan el **PSA ≈ 50 %**)'],
        ['**Tratamiento quirúrgico**', '**RTU de próstata** (el estándar); **enucleación con láser (HoLEP)**; **adenomectomía** abierta en próstatas muy grandes (más de 80-100 g). **Indicaciones**: retención recurrente, **litiasis vesical**, infecciones recurrentes, **hidronefrosis o insuficiencia renal**, hematuria o falla del tratamiento médico'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 38; Manual SCHU, 3.ª ed., cap. 10 (HPB).')
    u.box('alerta', 'Complicaciones de la RTU de próstata', '**Síndrome post-RTU**: hiponatremia dilucional por absorción del líquido de irrigación (confusión, hipertensión, bradicardia); **eyaculación retrógrada** (la complicación más frecuente); **hemorragia**; **estenosis de uretra** o del cuello; **incontinencia**. Por eso la **irrigación** se hace con presión baja y el tiempo de resección es limitado.')
    u.h3('Retención aguda de orina')
    u.ul(['**Imposibilidad súbita de orinar con dolor** hipogástrico y **globo vesical**. Causas: **HPB** (la más frecuente), fármacos (**anticolinérgicos, descongestivos, opioides**), estreñimiento, infección, cirugía, estenosis de uretra, coágulos.',
          '**Tratamiento**: **sondaje vesical uretral** (descomprime); si **no pasa** la sonda, **cateterismo suprapúbico** (punción por encima del pubis: la vejiga llena queda por fuera del peritoneo).',
          '**Después del sondaje**: puede haber **diuresis posobstructiva** (se controlan líquidos y electrolitos) y **hematuria ex vacuo**; se estudia la causa y se prueba un tratamiento (α-bloqueante) antes de retirar la sonda.',
          '**Obstrucción crónica**: la vejiga se hipertrofia (**trabeculada, con divertículos**), aparece **incontinencia por rebosamiento**, **hidronefrosis** bilateral e **insuficiencia renal posrenal**.'])
    u.h3('Cáncer de próstata')
    u.tabla(['Aspecto', 'Datos clave'], [
        ['**Quién**', 'Hombre mayor de 50-55; antecedentes familiares; es el **tumor maligno más frecuente en el varón**'],
        ['**Clínica**', 'Generalmente **asintomático** (zona periférica: no obstruye al comienzo); en la enfermedad avanzada: **dolor óseo**, síntomas obstructivos, hematuria'],
        ['**Sospecha**', '**PSA** elevado (valor y velocidad) y/o **tacto rectal anormal**: próstata **dura, nodular, irregular**, con **surco medio borrado**'],
        ['**Diagnóstico**', '**RM multiparamétrica** y **biopsia** (guiada por imagen, por vía transrectal o perineal), con la clasificación de **Gleason / grupos ISUP**'],
        ['**Metástasis**', 'Ganglios pelvianos y **huesos** (lesiones **blásticas**, columna y pelvis; **plexo de Batson**)'],
        ['**Tratamiento**', '**Vigilancia activa** (bajo riesgo), **prostatectomía radical**, **radioterapia**, **deprivación androgénica** (análogos de la GnRH, antiandrógenos) en la enfermedad avanzada'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 23; Manual SCHU, 3.ª ed., caps. 4 y 26.')
    oral(u, 'La próstata se divide en zonas: la **periférica** (70 %, donde nace el **cáncer** y la que se **palpa** por el recto), la **central** y la de **transición**, que **rodea la uretra** y es donde crece la **HPB**; por eso la HPB **obstruye** pero no siempre se palpa. Por detrás está el **recto** (fascia de Denonvilliers) y por los lados los **haces neurovasculares** que inervan los cuerpos cavernosos (**disfunción eréctil** en la prostatectomía). La **retención aguda** se sondea y, si no pasa la sonda, se hace **cateterismo suprapúbico**. El **cáncer de próstata** se sospecha por el **PSA y el tacto**, se confirma con **biopsia** y da **metástasis óseas blásticas** por el **plexo de Batson**.', 'Así lo decís en el oral: próstata')


def uretra_pene(u):
    u.h2('Uretra y pene: segmentos, trauma uretral y urgencias del pene', intro='La uretra masculina se divide en cuatro segmentos con una anatomía muy distinta: lo que importa para el trauma es **cuál es la porción lesionada** y **qué fascia limita el hematoma**.')
    N(u, 'S-503', 'Uretra masculina.', ['**Prostática, membranosa, bulbar y peniana**; la **fosa navicular** en el glande.'], 205)
    N(u, 'S-502', 'Pene: estructura.', ['**Cuerpos cavernosos** (con la **túnica albugínea**) y **cuerpo esponjoso** que rodea la uretra.'], 190)
    N(u, 'S-501', 'Pene y genitales externos masculinos: disección profunda.', ['**Fascia de Buck** (envuelve los tres cuerpos) y **fascia de Colles** (perineal).'], 190)
    G(u, 252, 'Pene (Gray).', ['Cortes del pene: cuerpos cavernosos y esponjoso, albugínea y fascia profunda.'], 190)
    u.tabla(['Segmento', 'Longitud y relaciones', 'Aplicación'], [
        ['**Prostática**', '≈ 3 cm; atraviesa la próstata; **veru montanum**', 'Se estrecha en la **HPB** (obstrucción)'],
        ['**Membranosa**', '≈ 1-2 cm; atraviesa el **diafragma urogenital** y está rodeada por el **esfínter externo**; es la **más fija y estrecha**', 'Se **rompe** en la **fractura de pelvis** (trauma **posterior**)'],
        ['**Bulbar**', 'Parte **proximal de la uretra esponjosa**, dentro del **bulbo** del pene (la más expuesta al periné)', 'Se rompe en la **caída a horcajadas** (trauma **anterior**)'],
        ['**Peniana**', 'Resto de la uretra esponjosa; **fosa navicular** al final', 'Estenosis; **hipospadias** (meato en cara ventral)'],
    ], fuente='Netter, láminas S-500 a S-503; Smith y Tanagho, 18.ª ed., cap. 41; Manual SCHU, 3.ª ed., cap. 34.')
    u.h3('Trauma uretral: posterior y anterior')
    u.tabla(['', '**Posterior** (prostática y membranosa)', '**Anterior** (bulbar y peniana)'], [
        ['**Mecanismo**', '**Fractura de pelvis** (tracción y desgarro de la uretra membranosa)', '**Caída a horcajadas** (la uretra bulbar se comprime contra el pubis); instrumentación'],
        ['**Clínica**', '**Sangre en el meato**, **próstata ascendida (“flotante”)**, hematoma perineal y **retención**', '**Sangre en el meato**, **hematoma en “mariposa” (perineal)** que se limita por la **fascia de Colles**; retención'],
        ['**Estudio**', '**Uretrografía retrógrada** (**antes** de pasar cualquier sonda)', 'Igual'],
        ['**Conducta**', '**Cateterismo suprapúbico** y reparación diferida', 'Sonda o **cateterismo suprapúbico**; reparación según la lesión'],
    ], fuente='Manual SCHU, 3.ª ed., cap. 34; Smith y Tanagho, 18.ª ed., cap. 18.')
    u.box('alerta', 'No se pasa sonda a ciegas', 'Ante **trauma pelviano o perineal con sangre en el meato**: **no** se coloca una sonda uretral hasta una **uretrografía retrógrada**; una sonda a ciegas puede **convertir una lesión parcial en completa**. El atlas de la **UP8** muestra la fractura de pelvis y la **UP9** el algoritmo del trauma.')
    u.h3('Urgencias del pene')
    u.tabla(['Urgencia', 'Qué es', 'Conducta'], [
        ['**Fractura de pene**', 'Rotura de la **túnica albugínea** de los cuerpos cavernosos durante la erección (“crujido”, dolor, **hematoma “en berenjena”**)', '**Cirugía urgente** (reparación de la albugínea); verificar la uretra'],
        ['**Priapismo isquémico**', 'Erección dolorosa **de más de 4 horas** sin estímulo (anemia falciforme, fármacos)', '**Urgencia**: aspiración e irrigación del cuerpo cavernoso, fenilefrina'],
        ['**Parafimosis**', 'El prepucio retraído queda **atrapado detrás del glande** y lo estrangula', '**Reducción manual** o dorsotomía'],
        ['**Fimosis**', 'Prepucio que no se retrae', 'Corticoide tópico o circuncisión'],
        ['**Cáncer de pene**', 'Carcinoma epidermoide (VPH, fimosis, mala higiene)', '**Penectomía** parcial; **ganglios inguinales**'],
    ], fuente='Smith y Tanagho, 18.ª ed., caps. 24 y 41; Manual SCHU, 3.ª ed., caps. 29 y 34.')
    oral(u, 'La **uretra masculina** tiene cuatro segmentos: **prostática, membranosa, bulbar y peniana**. La **membranosa** es la más fija y se rompe en la **fractura de pelvis** (trauma **posterior**: sangre en el meato, próstata ascendida); la **bulbar** se rompe en la **caída a horcajadas** (trauma **anterior**: hematoma perineal “en mariposa” limitado por la **fascia de Colles**). **Antes de sondar** se hace una **uretrografía retrógrada**; si hay lesión, **cateterismo suprapúbico**. La **fractura de pene** es la rotura de la **albugínea** y se opera de urgencia.', 'Así lo decís en el oral: uretra y pene')


def escroto(u):
    u.h2('Escroto y testículo: capas, vasos, linfáticos, escroto agudo y cáncer testicular', intro='La anatomía del testículo explica sus enfermedades: por qué la **torsión** exige cirugía en horas, por qué el **varicocele es izquierdo** y por qué el cáncer testicular **no** drena a la ingle.')
    N(u, 'S-497', 'Escroto y su contenido.', ['Capas desde la piel hasta el testículo: **dartos, fascias espermáticas externa, cremastérica e interna, túnica vaginal y albugínea**.'], 205)
    N(u, 'S-498', 'Testículo, epidídimo y conducto deferente.', ['**Epidídimo** (cabeza, cuerpo, cola) en la cara posterior; **conducto deferente** en el cordón espermático.'], 205)
    N(u, 'S-499', 'Vasculatura del testículo.', ['**Arteria testicular** (de la aorta, a nivel de L2), **cremastérica** y **deferencial**.', '**Plexo pampiniforme**: venas que rodean la arteria y enfrían la sangre.'], 205)
    G(u, 250, 'Escroto (Gray).', ['Capas, cordón espermático y su relación con el canal inguinal.'], 190)
    u.tabla(['Dato', 'Descripción', 'Aplicación'], [
        ['**Capas** (de afuera a adentro)', 'Piel, **dartos**, fascia espermática externa (del oblicuo externo), **cremastérica** (del oblicuo interno), fascia espermática interna (de la fascia transversal), **túnica vaginal** (parietal y visceral) y **albugínea**', 'Cada capa corresponde a una capa de la pared abdominal (**UP6**)'],
        ['**Irrigación**', '**Testicular** (aorta, L2), cremastérica (epigástrica inferior), deferencial (vesical)', 'Por eso el testículo **sobrevive** a la ligadura de la testicular si hay colaterales'],
        ['**Venas**', '**Derecha** → vena cava inferior; **izquierda** → **vena renal izquierda** (en ángulo recto, mayor presión)', '**Varicocele izquierdo** (≈ 95 %)'],
        ['**Linfáticos**', 'Testículo → **ganglios paraaórticos y paracavos** (nivel de **L1-L2**, junto al pedículo renal); **escroto → ganglios inguinales**', 'El **cáncer testicular** da metástasis **retroperitoneales** y no inguinales'],
    ], fuente='Netter, láminas S-497 a S-499; Gray, págs. 250 y 251; Smith y Tanagho, 18.ª ed., cap. 24.')
    u.box('alerta', 'Varicocele derecho aislado o de aparición brusca', 'Si el varicocele es **derecho**, o **aparece de golpe** en un adulto y **no se vacía en decúbito**, hay que **descartar una masa retroperitoneal** (tumor renal que invade la vena renal o la cava): la vena gonadal desemboca en la **cava** (derecha) o en la **renal** (izquierda).')
    u.h3('Escroto agudo')
    u.tabla(['', '**Torsión testicular**', '**Epididimitis**', '**Torsión del apéndice testicular**'], [
        ['**Edad**', '**12-18 años** (también neonatos)', 'Adulto sexualmente activo', '**Niños** (7-12 años)'],
        ['**Dolor**', '**Brusco**, intenso, náuseas', 'Gradual, fiebre, disuria', 'Moderado, localizado'],
        ['**Examen**', 'Testículo **elevado y horizontal**; **reflejo cremastérico ausente**; **signo de Prehn negativo** (no alivia al elevar)', '**Prehn positivo** (alivia); epidídimo engrosado', '**Punto azul** (“blue dot”) en el polo superior'],
        ['**Estudio**', '**Ecografía Doppler** (sin flujo); **no demorar** la cirugía', 'Cultivo, Doppler con hiperflujo', 'Doppler normal'],
        ['**Conducta**', '**Exploración quirúrgica urgente** (menos de 6 horas): **destorsión y orquidopexia bilateral**', 'Antibióticos', 'Analgesia'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 24; Manual SCHU, 3.ª ed., cap. 9.')
    u.ul(['**Torsión**: el testículo rota sobre el cordón (deformidad “en badajo de campana”, falta de fijación de la túnica vaginal); la **isquemia** comienza en minutos y el testículo se salva si se opera dentro de las **6 horas**.',
          '**Hidrocele**: líquido en la **túnica vaginal**; **transilumina**. **Hernia inguinoescrotal**: se agranda con la tos y no se puede “llegar arriba” (ver **UP6**).'])
    u.h3('Cáncer de testículo')
    u.tabla(['Aspecto', 'Datos clave'], [
        ['**Quién**', '**Varón de 15 a 35 años**; **criptorquidia** previa (riesgo mayor)'],
        ['**Clínica**', '**Masa testicular indolora, dura**; a veces ginecomastia'],
        ['**Marcadores**', '**AFP** (no se eleva en el seminoma puro), **β-hCG** y **LDH**'],
        ['**Estudio**', '**Ecografía escrotal**; TC de abdomen y tórax (ganglios paraaórticos)'],
        ['**Tratamiento**', '**Orquidectomía radical por vía inguinal** (con ligadura alta del cordón): **no se biopsia ni se opera por el escroto** (altera el drenaje linfático); **seminoma**: radioterapia o quimioterapia (muy sensible); **no seminoma**: quimioterapia y linfadenectomía retroperitoneal'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 24; Manual SCHU, 3.ª ed., cap. 28.')
    oral(u, 'El testículo se irriga por la **arteria testicular** (aorta, L2) y drena por el **plexo pampiniforme**: la vena **izquierda** desemboca en la **renal izquierda** en ángulo recto, por eso el **varicocele** es **izquierdo**. Los **linfáticos** del testículo van a los **ganglios paraaórticos**, y los del escroto a los **inguinales**. La **torsión testicular** (adolescente, dolor brusco, testículo elevado, reflejo cremastérico ausente, Prehn negativo) se opera en menos de **6 horas**. El **cáncer testicular** se estudia con **ecografía y marcadores (AFP, β-hCG, LDH)** y se trata con **orquidectomía radical por vía inguinal**.', 'Así lo decís en el oral: escroto y testículo')


def congenitas(u):
    u.h2('Anomalías congénitas, infecciones y pelvis: lo que completa la unidad', intro='Tres temas breves que cierran el programa: las **anomalías del desarrollo** (que se entienden con la embriología), las **infecciones** urogenitales y la **anatomía pelviana** de la inervación y los vasos.')
    u.h3('Embriología y anomalías (resumen anatómico)')
    u.ul(['El **riñón definitivo (metanefros)** se forma por la unión de la **yema ureteral** y el **blastema metanéfrico**; luego **asciende** desde la pelvis y recibe sucesivas arterias (la **arteria renal** se origina de la aorta a nivel definitivo).',
          'La **vejiga** deriva del **seno urogenital** y el **uraco** une el ápice con el ombligo (**uraco persistente**).',
          '**Testículo**: se forma en el abdomen y **desciende** por el **canal inguinal** guiado por el **gubernáculo**; el **conducto peritoneovaginal** se obliteran (si persiste: **hernia indirecta o hidrocele**).'])
    u.tabla(['Anomalía', 'Qué es', 'Dato clave'], [
        ['**Estenosis de la unión ureteropiélica**', 'Obstrucción de la salida de la pelvis renal', 'Causa más frecuente de **hidronefrosis neonatal**; pieloplastia'],
        ['**Riñón en herradura**', 'Los polos inferiores se unen por un **istmo**, **retenido bajo la arteria mesentérica inferior**', 'Más litiasis, infecciones y obstrucción; más riesgo en trauma'],
        ['**Duplicación ureteral** (Weigert-Meyer)', 'Dos uréteres: el del **polo superior** desemboca **más abajo** (ureterocele, obstrucción) y el del **inferior** más arriba (reflujo)', '**Regla de Weigert-Meyer**'],
        ['**Reflujo vesicoureteral**', 'Mala longitud del trayecto submucoso del uréter', 'Infecciones y **cicatrices renales**; cistografía miccional'],
        ['**Válvulas de uretra posterior**', 'Membranas en la uretra prostática', '**Varón recién nacido**: chorro débil, vejiga distendida, hidronefrosis bilateral'],
        ['**Hipospadias** y **epispadias**', 'Meato en la **cara ventral** (hipospadias) o dorsal del pene', '**No circuncidar** antes de la reparación'],
        ['**Criptorquidia**', 'Testículo no descendido (canal inguinal o abdomen)', '**Orquidopexia** antes de los 18 meses; riesgo de cáncer e infertilidad'],
    ], fuente='Smith y Tanagho, 18.ª ed., caps. 2, 13 y 37; Manual SCHU, 3.ª ed., cap. 35 (urología pediátrica).')
    u.h3('Infecciones urogenitales')
    u.tabla(['Infección', 'Dato anatómico y clínico', 'Conducta'], [
        ['**Cistitis**', 'Más frecuente en la **mujer** (uretra corta: ≈ 4 cm)', 'Antibiótico oral; urocultivo si es recurrente'],
        ['**Pielonefritis**', 'Fiebre, **dolor lumbar con puño-percusión positiva**', 'Antibióticos; **ecografía** para descartar obstrucción'],
        ['**Pionefrosis / sepsis urinaria obstructiva**', 'Infección sobre **obstrucción** (cálculo)', '**Drenaje urgente** de la vía urinaria'],
        ['**Prostatitis aguda**', 'Fiebre, disuria y **próstata dolorosa y caliente** al tacto', '**No masajear** la próstata; antibióticos'],
        ['**Absceso perinefrítico**', 'Se contiene por la **fascia de Gerota**', 'Drenaje y antibióticos'],
        ['**Gangrena de Fournier**', 'Fascitis necrosante del **periné y genitales** por flora mixta (diabéticos); se extiende por las **fascias de Colles y de Scarpa**', '**Desbridamiento quirúrgico de urgencia** y antibióticos'],
    ], fuente='Smith y Tanagho, 18.ª ed., cap. 14; Manual SCHU, 3.ª ed., cap. 13 (ITU).')
    u.h3('Pelvis: vasos y nervios que se lesionan en la cirugía urológica')
    N(u, 'S-507', 'Arterias de la pelvis mayor.', ['**Ilíaca interna** y sus ramas: umbilical (vesical superior), vesical inferior, rectal media, **pudenda interna** y glútea.'], 205)
    N(u, 'S-509', 'Arterias y venas de las vísceras pélvicas: visión sagital.', ['Vasos de la vejiga, la próstata y el recto; el **plexo venoso** prostático y vesical.'], 205)
    G(u, 258, 'Irrigación arterial de la pelvis (Gray).', ['Ramas parietales y viscerales de la ilíaca interna.'], 205)
    N(u, 'S-512', 'Arterias y venas del periné masculino.', ['**Arteria pudenda interna** y sus ramas (bulbouretral, dorsal del pene, cavernosa).'], 190)
    u.ul(['**Nervio pudendo** (S2-S4): inerva el esfínter externo y la piel perineal; **canal de Alcock**; su lesión produce **incontinencia y disfunción sexual**.',
          '**Plexo hipogástrico inferior**: la cirugía pelviana radical (**prostatectomía, cistectomía**) lo daña: **disfunción eréctil, incontinencia y eyaculación**.',
          'El **uréter** y la **arteria uterina** son los vecinos de riesgo en la pelvis femenina.'])
    oral(u, 'Entre las **anomalías congénitas**, el **riñón en herradura** queda **retenido bajo la arteria mesentérica inferior** y la **duplicación ureteral** sigue la **regla de Weigert-Meyer** (el uréter del polo superior desemboca más abajo y se obstruye; el del inferior, más arriba y refluye). La **criptorquidia** se corrige antes de los 18 meses. La **gangrena de Fournier** es una fascitis necrosante del periné que se trata con **desbridamiento urgente**; la **sepsis urinaria obstructiva** se trata con **drenaje urgente** de la vía urinaria.', 'Así lo decís en el oral: congénitas, infecciones y pelvis')


def preguntas(u):
    u.h2('Preguntas típicas del oral con respuesta modelo', intro='Respondelas en voz alta y compará. Todas unen la anatomía con las patologías de la unidad.')
    qa = [
        ('¿Cómo se divide la próstata y qué patología nace en cada zona?',
         '**Zona periférica** (≈ 70 %): **cáncer** (≈ 70 %) y es la que se **palpa** por el recto. **Zona central** (≈ 25 %). **Zona de transición** (≈ 5 %): **hiperplasia prostática benigna**, rodea la uretra proximal y la comprime.'),
        ('Un hombre de 68 años tiene chorro débil, nicturia y tacto con próstata lisa y elástica. ¿Qué pedís y cómo lo tratás?',
         '**HPB**: **IPSS**, **ecografía** con **residuo posmiccional**, **flujometría**, **PSA** y orina/creatinina. Tratamiento: **α-bloqueantes** (tamsulosina) y/o **inhibidores de la 5α-reductasa** (reducen el PSA ≈ 50 %); **RTU** si hay complicaciones (retención, litiasis, infecciones, hidronefrosis).'),
        ('¿Cómo se maneja una retención aguda de orina?',
         '**Sonda uretral** para descomprimir; si **no pasa**, **cateterismo suprapúbico** (la vejiga llena queda por fuera del peritoneo). Se vigila la **diuresis posobstructiva**, se busca la causa y se retira la sonda tras un **α-bloqueante**.'),
        ('¿Cuáles son las complicaciones de la RTU de próstata?',
         '**Síndrome post-RTU** (hiponatremia dilucional), **eyaculación retrógrada**, hemorragia, estenosis uretral e incontinencia.'),
        ('¿Por qué el cáncer de próstata produce metástasis óseas vertebrales?',
         'Por el **plexo venoso de Batson** (venas vertebrales **sin válvulas**) que comunica el plexo prostático con la columna; las lesiones son **blásticas**.'),
        ('¿Cuáles son los tres estrechamientos del uréter?',
         'La **unión ureteropiélica**, el **cruce con los vasos ilíacos** (borde de la pelvis) y la **unión ureterovesical**: donde se impactan los cálculos.'),
        ('Un paciente con cólico renal tiene fiebre y escalofríos. ¿Qué hacés?',
         '**Obstrucción con infección** = urgencia: **drenaje de la vía urinaria** (**catéter doble J o nefrostomía**), antibióticos y tratar el cálculo **después**.'),
        ('¿Por qué se lesiona el uréter en la histerectomía?',
         'Porque en la pelvis pasa **por debajo de la arteria uterina** (“el agua pasa bajo el puente”) a unos 2 cm del cuello; se puede ligar junto con la arteria.'),
        ('Explicá la inervación de la micción.',
         '**Parasimpático S2-S4** contrae el detrusor (vaciamiento); **simpático T10-L2** relaja el detrusor y cierra el cuello (llenado, continencia, eyaculación); **pudendo S2-S4** inerva el **esfínter externo** voluntario.'),
        ('Un hombre sufre una fractura de pelvis y tiene sangre en el meato. ¿Qué hacés?',
         '**No** paso sonda a ciegas: **uretrografía retrógrada**. Es una **lesión uretral posterior** (uretra membranosa); se coloca **cateterismo suprapúbico** y se repara de forma diferida.'),
        ('Adolescente con dolor testicular brusco, testículo alto y reflejo cremastérico ausente.',
         '**Torsión testicular**: **Doppler** sin demorar; **exploración quirúrgica de urgencia** (menos de 6 horas) con **orquidopexia bilateral**.'),
        ('¿Por qué el varicocele es izquierdo y cuándo preocupa un varicocele derecho?',
         'La **vena gonadal izquierda** desemboca en la **renal izquierda** en ángulo recto (mayor presión); la derecha, en la **cava**. Un varicocele **derecho** o de aparición brusca obliga a **descartar una masa retroperitoneal**.'),
        ('¿Cómo se trata el cáncer de testículo y por qué no se biopsia por el escroto?',
         '**Orquidectomía radical inguinal**: el **drenaje linfático** del testículo va a los **ganglios paraaórticos**; la vía escrotal **lo altera** y puede diseminar a los inguinales.'),
    ]
    for i, (q, a) in enumerate(qa, 1):
        u.box('oral', 'Pregunta %d' % i, ['**%s**' % q, a])


def referencias(u):
    u.h2('Referencias y créditos de las imágenes', intro='Qué libros respaldan cada parte y de dónde viene cada lámina.')
    u.h3('Atlas de anatomía (láminas a color)')
    u.ul(['Netter, F. H. __Netter. Atlas de Anatomía Humana__, 8.ª ed. Elsevier. Láminas citadas con su código (S-n) al pie de cada figura.',
          'Gray. __Atlas de Anatomía__, 3.ª ed. (Drake, Vogl, Mitchell y col.). Elsevier. Láminas citadas con su página al pie de cada figura.'])
    u.h3('Libros de la unidad')
    u.ul(['McAninch, J. y Lue, T. __Smith y Tanagho. Urología general__, 18.ª ed. (2016): caps. 2 (embriología), 3 y 4 (síntomas y examen), 5 y 6 (laboratorio y radiología), 12 y 13 (obstrucción y reflujo), 14 (infecciones), 17 (urolitiasis), 18 (lesiones), 21 a 24 (tumores), 37 y 38 (uréter, vejiga, próstata) y 41 (pene y uretra).',
          'Manual de Urología SCHU, 3.ª ed. (2025): caps. 1 (semiología), 8 (litiasis), 10 (HPB), 12 (disfunciones vesicales), 13 (ITU), 25 y 26 (cáncer de vejiga y de próstata), 28 (testicular), 33 y 34 (trauma urinario y genital).',
          'Schwartz, __Principios de Cirugía__, 10.ª ed., cap. 40 (Urología). Las imágenes con la etiqueta “Schwartz” y “Smith y Tanagho” provienen de estos capítulos.'])
    u.box('alerta', 'Cómo usar esta guía', 'El texto descriptivo es de elaboración propia, a partir de los atlas, los libros de la unidad y la anatomía de referencia; **no está transcripto de un libro en particular**. Ante cualquier duda, **la lámina del atlas manda**. Las cifras (porcentajes, tamaños, plazos) se citan para estudiar y **pueden variar entre ediciones y guías**: verificá con el libro de tu cátedra.')
