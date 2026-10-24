# -*- coding: utf-8 -*-
"""Fichas de métodos anticonceptivos, bloque 5 (2026-10-24): personas con discapacidad, personas trans y no binarias, y cambio de un método por otro (cuadro 4.5).
Fuente: guía MSAL/DNSSR 2023 (cap. 2.5, 5.3, 4, 8, 9, 10, 14) y, para las personas trans, la revista AMAdA 2025 (comentario del CDC 2024)."""
from mac_comun import *
from mac4 import R_OMS25, R_GUIA_LINK

R_TRANS = {'t': 'Atención de la salud integral de personas trans, travestis y no binarias. Guía para equipos de salud (actualización 2020)', 'c': 'Ministerio de Salud de la Nación, Dirección de Géneros y Diversidad', 'u': 'https://bancos.salud.gob.ar/sites/default/files/2020-10/guia-salud-personas-trans-travestis-nobinarias.pdf'}

# ======================================================================= discapacidad
DISC = ficha(
    'mac-discapacidad', 'Anticoncepción en personas con discapacidad',
    ['discapacidad', 'personas con discapacidad', 'pcd', 'consentimiento informado discapacidad', 'ajustes razonables', 'sistemas de apoyo', 'resolucion 65/2015',
     'esterilizacion forzada', 'silla de ruedas', 'discapacidad intelectual', 'ceguera', 'accesibilidad', 'ley 27655'],
    'Las personas con discapacidad (PCD) tienen la misma dignidad y el mismo derecho que todas a decidir si acceden o no a cualquier método anticonceptivo. Muchas veces no se les ofrece por la falsa creencia de que son asexuadas o incapaces de decidir sobre su vida sexual y reproductiva: eso es discriminatorio. Sustituir su voluntad es un delito.',
    diagnostico=[
        'Marco: Convención sobre los Derechos de las Personas con Discapacidad (CDPD; artículo 12, igual reconocimiento ante la ley), Código Civil y Comercial (artículos 22, 23, 31 y 32) y Resolución 65/2015 del Ministerio de Salud de la Nación (capacidad, ajustes razonables y sistemas de apoyo). Las PCD tienen derecho a mantener su fertilidad y a formar una familia si así lo deciden.',
        'Presunción de capacidad: toda persona sin sentencia de restricción de la capacidad específicamente relacionada con la salud debe ser tenida por capaz y consiente por sí misma. En ningún caso hace falta autorización judicial para la anticoncepción transitoria, quirúrgica o de emergencia.',
        'Excepcionalísimo: con sentencia firme y vigente que restringe la capacidad y designa apoyo para la anticoncepción, el consentimiento lo presta la persona, con la asistencia del apoyo que indica la sentencia. Si la sentencia no se refiere a este derecho, consiente sin restricciones. El apoyo nunca representa ni sustituye a la persona.',
        'Condiciones de acceso: accesibilidad (física y comunicacional: camillas, pasillos, lengua de señas, braille, lenguaje sencillo; también privacidad y confidencialidad), diseño universal, ajustes razonables (cambiar el espacio de consulta, el lenguaje, prolongar el tiempo de atención, otros materiales) y medidas de apoyo, que son un derecho, nunca un requisito ni una barrera. Los equipos deben ofrecerlas, no imponerlas.',
        'Anticoncepción quirúrgica: la Ley 26.130, modificada por la Ley 27.655 (2021), garantiza que las PCD, sin excepción, consientan por sí mismas con apoyos y ajustes razonables si los piden; es la persona la titular del derecho y el equipo debe garantizar que manifieste su voluntad de forma autónoma. Hay denuncias de esterilizaciones forzadas en todo el mundo.',
        'Los criterios médicos de elegibilidad son los mismos que para las demás personas. Al informar, además de la condición clínica, evaluar con la persona cómo la discapacidad puede dificultar o no la adherencia a cada método.',
    ],
    tratamiento=[
        B('Elección del método según la discapacidad',
          P('Movilidad reducida', 'Los ACO y el ACI quizá no sean adecuados con mala circulación o extremidades inmóviles (por ejemplo, silla de ruedas) por el mayor riesgo de TVP, aun sin mutaciones trombogénicas: evaluar contraindicarlos; los de solo progestágeno son opciones. El diafragma puede ser dificultoso con ausencia de brazos o manos, brazos cortos, parálisis o movilidad reducida; el preservativo, si dificulta la colocación o retiro, requiere buscar estrategias en conjunto.'),
          P('Discapacidad intelectual o de salud mental', 'Con dificultad para recordar la toma diaria la guía prefiere otros métodos que no requieran una toma diaria.'),
          P('Discapacidad visual', 'Para facilitar su autonomía conviene el ACO de 21 comprimidos (no obliga a distinguir activas de inactivas) o las píldoras de solo progestágeno, que son todas iguales.'),
          P('Higiene menstrual', 'Si tiene dificultad con la higiene durante la menstruación, considerar el efecto del método sobre los ciclos (por ejemplo, amenorrea con SIU-LNG).')),
        B('Cómo atender',
          P('Consejería', 'Ofrecer consejería en MAC en todas las consultas de salud, sin perder oportunidades, y brindar información en formatos accesibles (lectura fácil, braille, lengua de señas).'),
          P('Consentimiento', 'Verbal para los MAC reversibles; firmado para la anticoncepción quirúrgica. Informarse si la persona tiene o necesita un apoyo, sin exigirlo.'),
          P('Salvaguardas', 'Adoptar salvaguardas apropiadas contra la sustitución en la toma de decisiones: la decisión es de la persona titular.')),
    ],
    seguimiento=[
        'El equipo de salud responde administrativa y penalmente si sustituye o consiente por la persona; las PCD y sus apoyos pueden solicitar o interrumpir las medidas de apoyo en cualquier momento.',
    ],
    banderas=[
        'Nunca pedir autorización judicial ni familiar para ningún método anticonceptivo, ni suponer incapacidad por la discapacidad.',
        'Esterilización sin consentimiento propio: constituye un delito y viola la Ley 27.655.',
    ],
    oms2025=['El MEC OMS 2025 reafirma que los criterios de elegibilidad son los mismos para todas las personas; la discapacidad no figura entre las condiciones con categoría propia. La guía MSAL 2023 (basada en la CDPD y la Resolución 65/2015) es la referencia argentina.'],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 2.5, 4.5, 5.3, 8.1.5, 11.1), contra tu resumen', estado='amplia',
        puntos=[
            'Tu resumen no trata la discapacidad. Esta ficha reúne lo que la guía dice en distintos capítulos: derechos y consentimiento (2.5), ofrecimiento de métodos (5.3), elección según el tipo de discapacidad (cap. 8, 9 y 6) y anticoncepción quirúrgica (11.1; Ley 27.655).',
        ]),
    fuente=fuente('Resumen de los apartados 2.5, 5.3, 4.5 y 11.1 de la guía MSAL 2023, con las recomendaciones por tipo de discapacidad de los capítulos 6, 8 y 9.', R_OMS25),
)

# ======================================================================= trans
TRANS = ficha(
    'mac-trans', 'Anticoncepción en personas trans y no binarias',
    ['personas trans', 'varones trans', 'mujeres trans', 'no binarie', 'no binaries', 'travestis', 'identidad de genero', 'ley 26743', 'testosterona', 'persona con capacidad de gestar',
     'pcg', 'diversidad', 'salud menstrual'],
    'La guía usa «personas con capacidad de gestar» (PCG) junto con «mujeres» y «adolescentes» para nombrar a todas las personas que consultan por anticoncepción y mantienen relaciones que permiten la reproducción: varones trans, personas no binarias y otras identidades. Todas tienen derecho a recibir asesoramiento y métodos sin discriminación.',
    diagnostico=[
        'Enfoque: el acceso a la información y a los métodos es un derecho de todas las personas. Pueden menstruar quienes tienen útero, ovarios y vagina (mujeres cis, lesbianas, varones trans, personas no binarias, entre otras identidades): la menstruación no tiene relación con la identidad de género y se aborda sin asignarla solo a las mujeres.',
        'Derechos (cap. 2): vivir la identidad de género autopercibida sin discriminación; acceder a tratamientos o cirugías de modificación corporal según la Ley 26.743 de identidad de género; recibir anticoncepción gratuita, incluida la ligadura tubaria y la vasectomía; acceder a la IVE/ILE (Ley 27.610) y a la reproducción médicamente asistida sin importar la identidad de género (Ley 26.862).',
        'SIU-LNG: la amenorrea que produce es un motivo de elección en quienes desean o necesitan disminuir o interrumpir sus menstruaciones de forma sostenida, por ejemplo varones trans, personas no binarias, anemia crónica o sangrados abundantes. Su acción es local y casi siempre continúan ovulando.',
        'Mujeres trans y travestis: son población clave con prevalencia de VIH muy superior a la general; recomendar preservativo en todas las prácticas, el testeo y la PrEP (ver ficha de VIH).',
        'Testosterona: no es un anticonceptivo. Según el comentario de la revista AMAdA sobre el CDC 2024 (U.S. MEC y SPR), hay que aclararlo explícitamente y la consejería es obligatoria; el DIU y el implante son seguros en personas trans con útero. Ese punto no figura en el texto del MEC OMS 2025 que se leyó.',
    ],
    tratamiento=[
        B('Cómo atender',
          P('Lenguaje', 'Usar términos inclusivos (personas con capacidad de gestar), respetar el nombre y la identidad autopercibida y no dar por supuesto el sexo de la pareja ni las prácticas.'),
          P('Consejería', 'Misma estructura que para todos: eficacia, elegibilidad, efectos, alarmas, interacciones y protección contra ITS. Preguntar si usa o piensa usar testosterona y explicar que no previene el embarazo.'),
          P('Métodos', 'Los criterios médicos de elegibilidad son los habituales según la condición clínica. Cuando se busca amenorrea, valorar SIU-LNG, implante o AMPD; el DIU de cobre (sin hormonas) y el implante (sin estrógeno) también son opciones.')),
    ],
    seguimiento=[
        'Para el abordaje integral, la guía remite a «Atención de la salud integral de personas trans, travestis y no binarias» (Ministerio de Salud, actualización 2020).',
    ],
    banderas=[
        'No asumir que una persona que recibe testosterona está protegida de un embarazo.',
        'No negar un método ni la consejería por la identidad de género.',
    ],
    oms2025=['El texto del MEC OMS 2025 no tiene una sección específica para personas trans. La revista AMAdA 2025 comenta que la edición 2025 incluye evidencia de seguridad del DIU y los implantes en personas trans con útero y que el CDC 2024 agrega a quienes usan testosterona; verificar en el documento original antes de citarlo.'],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 1, 2, 3 y 14) y revista AMAdA 2025, contra tu resumen', estado='no_contrastado',
        puntos=[
            'Tu resumen no incluye personas trans. La guía MSAL 2023 las menciona en el lenguaje inclusivo (PCG), en los derechos y en la indicación del SIU-LNG, pero no tiene un capítulo propio; lo que se agrega sobre testosterona viene del comentario de AMAdA al CDC 2024 y debe confirmarse en el original.',
        ]),
    fuente=fuente('Resumen de los capítulos 1 a 3, 4.1 y 14.1.2.2 de la guía MSAL 2023; el comentario sobre testosterona y el CDC 2024 proviene de la revista AMAdA 2025.', R_TRANS, R_OMS25),
)

# ======================================================================= cambio de método
def _dui(dest):
    return ('Dentro de los 5 días desde el inicio del sangrado: se puede empezar ' + dest + ' sin protección adicional y retirar el DIU en ese momento. Con más de 5 días: se puede empezar si hay certeza razonable de que no hay embarazo; con actividad sexual en el ciclo actual, retirar el DIU en el sangrado siguiente; sin actividad sexual en el ciclo, abstenerse de la penetración pene-vagina o usar protección adicional 7 días, o retirar el DIU en el sangrado siguiente.')

CAMBIO = ficha(
    'mac-cambio-metodo', 'Cambio de un método anticonceptivo por otro: cuándo empezar y cuándo usar respaldo',
    ['cambio de metodo', 'reemplazo de un mac por otro', 'cuadro 4.5', 'metodo de respaldo', 'pasar de aco a', 'cambio de anticonceptivo', 'de inyectable a pastillas', 'cambiar de diu',
     'transicion entre metodos', 'respaldo 7 dias'],
    'Regla general de la guía: al cambiar de método no hace falta esperar la menstruación si la persona usó bien el método anterior o hay razonable certeza de que no hay embarazo, y la protección debe ser continua. Se habla de «método de respaldo» (preservativo, espermicidas, coito interrumpido o abstinencia) cuando el nuevo método todavía no es efectivo.',
    diagnostico=[
        'Tiempo hasta ser efectivo: ACO y parche o anillo, 7 días de toma correcta (si no se empieza el primer día de la menstruación); minipíldora, 2 días; desogestrel, 7 días; AMPD y ACI, 7 días de aplicados; implante, 7 días de colocado (inmediato si se coloca dentro de los 5 primeros días del ciclo); DIU de cobre, inmediato tras la colocación; SIU-LNG, 7 días. Con los DIU se usa preservativo hasta verificar en un control que están en la cavidad.',
        'Margen para pasar desde un inyectable de AMPD a ACO, AOPS o implante: sin respaldo si se empieza hasta 15 semanas después de la última inyección.',
        'Desde el DIU a otro método hormonal, la clave es el momento del ciclo: dentro de los 5 días del sangrado no hace falta nada más; después, depende de si hubo relaciones en el ciclo.',
    ],
    tratamiento=[
        B('Desde ACO',
          P('A otro ACO con menos estrógeno', 'Empezar al día siguiente del último comprimido activo, sin tomar los inactivos ni la semana libre (probablemente no haya sangrado). Si empieza luego del blíster completo o la semana libre, preservativo durante la primera semana. Con igual o mayor dosis o distinta composición: seguir como si fuera el mismo.'),
          P('A ACI o AMPD', 'Inmediatamente si usó bien el ACO; sin esperar el sangrado y sin respaldo. Si el cambio es en la primera semana de toma, respaldo 7 días.'),
          P('A implante', 'Inmediatamente si usó bien el ACO, sin respaldo; en la primera semana de toma, respaldo 7 días.'),
          P('A AOPS', 'Al día siguiente del último comprimido activo, sin tomar los inactivos; sin respaldo (probablemente no haya sangrado ese mes).'),
          P('A DIU de cobre o SIU-LNG', 'Inmediatamente si lo usó bien o hay certeza razonable de no embarazo, sin esperar el sangrado; preservativo hasta verificar la ubicación.')),
        B('Desde ACI',
          P('A otro ACI', 'Cuando correspondía la aplicación del que usaba; sin respaldo.'),
          P('A ACO, AOPS o AMPD', 'Cuando correspondía la siguiente inyección; sin respaldo.'),
          P('A implante', 'Cuando debía repetirse la inyección, sin respaldo (se puede colocar días o semanas antes para no perder la oportunidad).'),
          P('A DIU', 'Inmediatamente si usó bien el inyectable o hay certeza razonable de no embarazo; preservativo hasta verificar el DIU.')),
        B('Desde AMPD',
          P('A ACO o AOPS', 'Cuando correspondía la siguiente aplicación; sin respaldo si empieza hasta 15 semanas después de la última inyección.'),
          P('A ACI', 'Cuando correspondía el que usaba; sin respaldo.'),
          P('A implante', 'En el momento en que debería repetirse la inyección (sin respaldo hasta 15 semanas después de la última); también pocos días antes, superponiendo los efectos.'),
          P('A DIU', 'Inmediatamente si lo usó bien o hay certeza razonable de no embarazo; preservativo hasta verificar el DIU.')),
        B('Desde implante',
          P('A ACO, ACI, AMPD o AOPS', 'Empezar el nuevo método el día de la extracción del implante, sin respaldo.'),
          P('A DIU', 'Inmediatamente si lo usó bien o hay certeza razonable de no embarazo; preservativo hasta verificar el DIU.')),
        B('Desde píldoras de solo progestágeno (AOPS)',
          P('A ACO, ACI o AMPD', 'Cuando se desee, suspendiendo ese día el AOPS, sin interrupción. Si era minipíldora, respaldo 7 días.'),
          P('A implante', 'Cuando se desee, suspendiendo ese día el AOPS; respaldo 7 días.'),
          P('De minipíldora a desogestrel', 'Sin interrupción, con preservativo 7 días.'),
          P('A DIU', 'Inmediatamente si usó bien el AOPS; preservativo hasta verificar el DIU (el SIU-LNG protege desde los 7 días).')),
        B('Desde DIU',
          P('A ACO', _dui('el ACO')),
          P('A ACI o AMPD', _dui('el inyectable')),
          P('A implante o AOPS', _dui('el implante o las pastillas')),
          P('A otro DIU', 'Al vencer, extraer y colocar el nuevo en el mismo procedimiento; preservativo hasta verificar la ubicación.')),
    ],
    seguimiento=[
        'Anotar siempre la fecha del cambio y, si hay respaldo, el día en que termina. Dar AHE por adelantado cuando el nuevo método tarda en ser efectivo.',
    ],
    banderas=[
        'No dejar a la persona sin protección «hasta la próxima menstruación»: la guía lo desaconseja.',
        'El implante y el DIU recién colocados sin respaldo en la primera semana (o hasta verificar el DIU) son fuente frecuente de falla.',
    ],
    oms2025=['Las recomendaciones de prácticas seleccionadas (SPR) se actualizaron en la 4.ª edición de 2025, que acompaña al MEC; la guía MSAL 2023 se basa en las SPR de 2018. No se leyó el texto de las SPR 2025: verificar allí los tiempos de cambio de método antes de cambiar una conducta.'],
    contraste=dict(
        fuente='Guía MSAL 2023 (cuadro 4.5 y capítulos 8 a 10), contra tu resumen', estado='amplia',
        puntos=[
            'Tu resumen no trae el cuadro de cambio de método. Esta ficha lo reproduce completo por método de origen (cuadro 4.5, basado en las SPR de la OMS 2018) y lo coteja con los apartados de «cambio de método» de cada capítulo.',
        ]),
    fuente=fuente('Resumen del cuadro 4.5 de la guía MSAL 2023 («Reemplazo de un MAC por otro») y de los apartados de cambio de método de los capítulos 8, 9 y 10.', R_OMS25),
)

FICHAS_5 = [DISC, TRANS, CAMBIO]
