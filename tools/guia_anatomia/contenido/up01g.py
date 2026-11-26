# -*- coding: utf-8 -*-
"""UP 1 · Anatomía de las técnicas básicas, la infección y los accesos (sonda y vías)."""
from .up01e import N, G, L, oral


def tecnicas_infeccion(u):
    u.h2('Anatomía de las técnicas básicas, la infección y los accesos (sonda y vías)', intro='Estos temas del programa de la UP1 parecen “de técnica”, pero todos se resuelven con un criterio anatómico: qué plano, qué vaso y qué nervio hay en el sitio donde actuás.')
    u.h3('Diéresis y hemostasia: se corta por planos y se controla cada plano')
    u.ul(['**Diéresis por planos**: piel → tejido celular subcutáneo → aponeurosis → músculo; cada plano tiene sus vasos. La hemostasia se hace **en el plano en que sangra**: electrocoagulación o ligadura en piel y celular, ligadura del pedículo en el músculo, compresión en el hueso.',
          '**Zonas que sangran más**: el **cuero cabelludo** (los vasos están adheridos a la galea y no se retraen), la cara y la mano (muy vascularizadas). En el miembro superior se usa un **torniquete neumático** en el brazo para operar sin sangre, por **no más de 2 horas** (isquemia, lesión nerviosa por compresión).',
          '**Biopsias**: incisional, excisional o con punch; se orientan **según las líneas de tensión** y, en los miembros, **longitudinales**, para que una reintervención pueda resecar la cicatriz completa.'])
    u.h3('Videocirugía y cirugía mínimamente invasiva')
    u.ul(['Se crea un **neumoperitoneo** con CO2 (presión de 12-15 mmHg). El primer trócar suele ser **umbilical** (técnica abierta de Hasson o aguja de Veress): por debajo del ombligo están la **bifurcación de la aorta (aprox. L4)** y los vasos ilíacos.',
          'Los trócares laterales se colocan **por fuera del borde del recto**, **bajo visión directa** y evitando los **vasos epigástricos inferiores** (se ven por transiluminación): su lesión produce un hematoma de la vaina del recto.',
          'Riesgos anatómicos: lesión de vasos mayores, intestino y vejiga; en el postoperatorio, **hernia en el sitio del trócar** (más en los de 10-12 mm umbilicales).'])
    u.h3('Infección de piel y partes blandas')
    u.tabla(['Cuadro', 'Estructura comprometida', 'Característica'], [
        ['**Foliculitis y forúnculo**', 'Folículo pilosebáceo', 'Nódulo doloroso con pus; zonas con pelo y roce (cuello, glúteos, axila)'],
        ['**Ántrax**', 'Varios folículos contiguos con extensión al tejido celular', 'Placa con múltiples orificios; nuca y espalda; **diabéticos**'],
        ['**Hidrosadenitis supurativa**', '**Glándulas sudoríparas apocrinas** (axila, ingle, periné)', 'Abscesos recurrentes y fístulas'],
        ['**Absceso**', 'Colección en el celular o los planos profundos', '**Fluctuación**; tratamiento: **drenaje** (el antibiótico solo no alcanza)'],
        ['**Celulitis y linfangitis**', 'Dermis y tejido celular; linfáticos superficiales', 'Placa roja caliente; líneas rojas hacia los ganglios'],
        ['**Fascitis necrotizante y gangrena gaseosa**', '**Fascia profunda**: la infección corre por el plano fascial; __Clostridium__ y otros', '**Dolor desproporcionado**, crepitación, toxicidad; **cirugía urgente** (desbridamiento amplio)'],
    ], fuente='Giménez, Cirugía, 2.ª ed. (infección en cirugía); Schwartz, Principios de Cirugía, 10.ª ed.; anatomía de referencia.')
    u.box('clave', 'La fascia como camino y como barrera', 'La **fascia profunda** limita los compartimentos y frena la extensión de una infección superficial, pero cuando el germen llega a ese plano se propaga con rapidez (fascitis, gangrena gaseosa) y también aumenta la presión (síndrome compartimental).')
    u.h3('Accesos para la nutrición y los fluidos')
    u.tabla(['Acceso', 'Trayecto o referencia anatómica', 'Complicaciones y base anatómica'], [
        ['**Sonda nasogástrica (nutrición enteral)**', 'Fosa nasal → nasofaringe → orofaringe → laringofaringe → esófago (resistencia a los **15 cm**: cricofaríngeo) → estómago. Se mide **nariz-oreja-xifoides**', 'Epistaxis (área de Kiesselbach), **pasaje a la vía aérea**, perforación del seno piriforme o del esófago'],
        ['**Gastrostomía / yeyunostomía**', 'A través de la pared anterior hasta el estómago o el yeyuno; se fija el órgano a la pared', 'Fuga al peritoneo, lesión del colon o del hígado interpuestos'],
        ['**Vía venosa central: yugular interna**', 'Entre las dos cabezas del esternocleidomastoideo, **lateral a la carótida**', 'Punción de la carótida, neumotórax'],
        ['**Vía venosa central: subclavia**', 'Debajo de la clavícula, hacia el hueco supraesternal', '**Neumotórax** (la cúpula pleural está debajo), punción de la arteria subclavia'],
        ['**Vía venosa central: femoral**', 'Por debajo del ligamento inguinal; la vena está **medial a la arteria** (de lateral a medial: nervio, arteria, vena, linfáticos)', 'Punción arterial, trombosis, infección'],
    ], fuente='Giménez, Cirugía, 2.ª ed. (nutrición en cirugía); Netter, láminas S-328, S-329 y S-270; anatomía de referencia.')
    u.ul(['La **nutrición parenteral** (soluciones hiperosmolares) exige un **catéter central** cuyo extremo quede en la **vena cava superior, cerca de la aurícula derecha**; se controla con radiografía de tórax.',
          'La **nutrición enteral** es preferible cuando el tubo digestivo funciona: conserva la barrera intestinal y es más segura.'])
    u.h3('Atlas: venas del cuello y triángulo femoral')
    N(u, 'S-328', 'Venas de la cabeza y el cuello.', ['Yugular interna y su relación con la carótida y el esternocleidomastoideo.'], 190)
    N(u, 'S-329', 'Venas superficiales del cuello.', ['Yugular externa y venas superficiales.'], 190)
    N(u, 'S-270', 'Arterias y nervios del muslo: visiones anteriores.', ['Triángulo femoral: nervio, arteria y vena (de lateral a medial) bajo el ligamento inguinal.'], 190)
    oral(u, 'Cualquier técnica la razono por planos: **qué plano, qué vaso y qué nervio**. La **hemostasia** se hace en el plano que sangra; el cuero cabelludo y la mano sangran mucho, y el torniquete del brazo no se deja más de dos horas. En **videocirugía** los trócares laterales van por fuera del recto y bajo visión directa para no lesionar los **vasos epigástricos inferiores**. Las **infecciones de piel** se explican por la estructura: forúnculo (folículo), ántrax (varios folículos, diabéticos), **hidrosadenitis (glándulas apocrinas)**, absceso (se drena) y **gangrena gaseosa** (la infección corre por la fascia profunda: dolor desproporcionado y cirugía urgente). Para nutrir uso la **sonda nasogástrica** (se mide nariz-oreja-xifoides) o una **vía central** (yugular interna, subclavia o femoral) para la parenteral, cuidando el neumotórax y la punción arterial.')
