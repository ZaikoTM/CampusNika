# -*- coding: utf-8 -*-
"""Fichas de métodos anticonceptivos, bloque 4 (2026-10-24): adolescencia, perimenopausia y VIH; y la sección «Guía OMS 2025» (6.ª edición de los CME) de todas las fichas.
Las categorías de 2025 se leyeron del texto del documento «Medical eligibility criteria for contraceptive use, sixth edition» (OMS, 3/11/2025, ISBN 978-92-4-011558-3),
copia hospedada por la Sociedad Española de Contracepción; el comentario argentino es el de la revista AMAdA 21(2) 2025."""
from mac_comun import *
import mac_comun

R_OMS25 = {'t': 'Medical eligibility criteria for contraceptive use, sixth edition (OMS, 3 de noviembre de 2025)', 'c': 'Organización Mundial de la Salud · ISBN 978-92-4-011558-3', 'u': 'https://www.who.int/publications/i/item/9789240115583'}
R_GUIA_LINK = {'t': 'Guía MSAL 2023: copia en el repositorio CLACAI', 'c': 'Versión digital de la guía del Ministerio de Salud de la Nación', 'u': 'https://www.clacaidigital.info/handle/123456789/2486'}
R_AIPEO_U = {'t': 'Guía de anticoncepción inmediata posevento obstétrico (AIPEO), 2021', 'c': 'Ministerio de Salud de la Nación, DNSSR', 'u': 'https://bancos.salud.gob.ar/recurso/guia-anticoncepcion-inmediata-posevento-obstetrico-aipeo'}
R_MENORES15 = {'t': 'Atención a niñas y adolescentes menores de 15 años (Nota informativa 4, 2020)', 'c': 'Ministerio de Salud de la Nación, DNSSR', 'u': 'https://bancos.salud.gob.ar/sites/default/files/2021-01/atencion-ninasadolescentes-menores-15-nota-4.pdf'}
R_PREP = {'t': 'Guía de directrices clínicas sobre el uso de PrEP (2019)', 'c': 'Ministerio de Salud de la Nación, Dirección de respuesta al VIH, ITS, hepatitis virales y tuberculosis', 'u': 'https://bancos.salud.gob.ar/sites/default/files/2020-01/0000001669cnt-directrices-clinicas-centros-prevencion-profilaxis-pre-exposicion-arg.pdf'}
R_IGUAL = {'t': 'Indetectable = Intransmisible (I=I). Documento de consenso, 2019', 'c': 'Ministerio de Salud de la Nación, Dirección de Sida, ETS, Hepatitis y TBC', 'u': 'https://bancos.salud.gob.ar/sites/default/files/202001/0000001546cnt-2019-08-28_indetectable-igual-intrasmisible.pdf'}
R_PERINAT = {'t': 'Prevención de la transmisión perinatal de sífilis, hepatitis B y VIH (2016)', 'c': 'Ministerio de Salud de la Nación', 'u': 'https://bancos.salud.gob.ar/sites/default/files/2019-10/2016-07_prevencion-transmision-perinatal-hepatitis-b-vih.pdf'}

# ======================================================================= adolescencia
ADOL = ficha(
    'mac-adolescencia', 'Anticoncepción en la adolescencia',
    ['adolescencia', 'adolescentes', 'anticoncepcion en adolescentes', 'consejeria adolescentes', 'menores de 15', 'consentimiento adolescentes', 'larc adolescentes',
     'esi', 'educacion sexual integral', 'ley 26150', 'derechos adolescentes'],
    'Adolescencia: de los 10 a los 19 años (OMS); temprana hasta los 14 y tardía de los 15 a los 19. Casi cualquier método se puede usar de manera segura: la edad por sí sola no es una razón médica para negar un método. La consulta por anticoncepción de una persona adolescente es una urgencia: siempre debe irse con una respuesta anticonceptiva.',
    diagnostico=[
        'Marco legal: desde los 13 años pueden pedir y consentir cualquier práctica de salud que no implique un riesgo grave para su salud o su vida, y acceder en forma autónoma a todos los MAC reversibles (también a la AHE y a los preservativos). Antes de los 13 es recomendable procurar el asentimiento de un adulto de confianza, que no reemplaza su consentimiento.',
        'El Código Civil y Comercial considera adultas para las decisiones sobre su cuerpo a las personas desde los 16 años: desde esa edad acceden a la ligadura tubaria y la vasectomía con consentimiento informado firmado.',
        'Siempre descartar violencia sexual (sobre todo en menores de 15 años). Si hay embarazo, brindar consejería en derechos, informar los riesgos de continuarlo en la niñez o adolescencia y garantizar sin dilaciones la IVE/ILE si es su decisión.',
        'Los criterios de elegibilidad por patologías son los mismos que en las adultas. Para los LARC: el implante es categoría 1 y los dos tipos de DIU son categoría 2 (OMS). La OMS 2025 mantiene el DIU como categoría 2 hasta los 20 años.',
        'Eficacia en jóvenes: el proyecto CHOICE mostró que, en menores de 21 años, el embarazo no planificado con píldoras, parche o anillo casi duplica el de las mayores, mientras que con LARC y AMPD es bajo sin diferencia por edad. El riesgo con píldora, parche o anillo es 20 veces mayor que con LARC. Más de la mitad abandona los ACO en el primer año.',
        'DIU: es seguro aun en nulíparas. Las de 14 a 19 años pueden expulsarlo más (útero más pequeño) sin que sea contraindicación; no hace falta ecografía previa, pero si la histerometría es menor de 6 cm usar un DIU más chico u otro método. El SIU-LNG sirve cuando se busca amenorrea (varones trans, personas no binarias, anemia crónica, sangrados abundantes).',
        'AMPD: en menores de 18 años, que aún no completaron el pico de masa ósea, considerar antes otras opciones.',
    ],
    tratamiento=[
        B('Consejería con adolescentes',
          P('Confidencialidad', 'Privacidad de la consulta y respeto de la decisión, sin juicios ni valores personales; hablar de derechos («vos podés»). Preguntas abiertas: «¿En qué puedo ayudarte?».'),
          P('Qué ofrecer', 'Información clara sobre todos los métodos (incluidos los LARC y los que cubre la canasta gratuita), el método elegido, preservativos y AHE por adelantado.'),
          P('Preservativo', 'No dar por sentado que saben usarlo: demostrar con una maqueta y pedirles que lo expliquen. Entregar preservativos en la consulta, informar sobre lubricantes y campo de látex, y trabajar cómo negociar su uso (doble protección).'),
          P('Temas', 'Consentimiento en todas las prácticas sexuales («confianza», «prueba de amor»), decidir cuándo iniciar relaciones, ciclo menstrual y anatomía, VIH e ITS con acceso al testeo, derecho a la IVE/ILE ante un embarazo no intencional.')),
        B('Elección del método',
          P('LARC', 'Los que reciben buen asesoramiento sobre LARC los eligen y usan con satisfacción; ofrecerlos y facilitar su colocación el mismo día. Ofrecerlos en el posevento obstétrico reduce el segundo embarazo adolescente.'),
          P('Corta duración', 'Si eligen píldoras, parche o anillo, trabajar la adherencia y dar AHE por adelantado.'),
          P('Siempre', 'Preservativo: único método que protege contra ITS y VIH.')),
    ],
    seguimiento=[
        'Aprovechar cada contacto con el sistema de salud para la consejería; articular con escuelas (ASIE: asesorías en salud integral en escuelas secundarias) y con la ESI (Ley 26.150, 2006).',
    ],
    banderas=[
        'Menor de 15 años que consulta por anticoncepción o embarazo: evaluar violencia o abuso; si se sospecha abuso sexual, activar los mecanismos de protección de derechos.',
        'Cada consulta es una oportunidad única: no postergar la respuesta anticonceptiva ni exigir acompañamiento de adultos desde los 13 años.',
    ],
    oms2025=[
        'Edad (CHC): de la menarca a los 40 años, categoría 1; desde los 40, categoría 2. DIU (cobre y LNG): menores de 20 años, categoría 2; desde los 20, categoría 1. Nulíparas: DIU categoría 2.',
        'El MEC 2025 señala que los combinados pueden bajar la densidad mineral ósea en adolescentes, sobre todo con dosis muy bajas (menos de 30 µg de etinilestradiol), y que el AMPD en menores de 18 años es categoría 2. Obesidad (IMC ≥ 30) con combinados: categoría 2.',
        'La OMS 2025 reafirma el DIU y el implante como primera línea en adolescentes, con énfasis en consejería y confidencialidad (revista AMAdA).',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 14) y MEC OMS 2025, contra tu resumen', estado='amplia',
        puntos=[
            'Tu resumen casi no trata a las adolescentes (solo que la nuliparidad y la adolescencia no contraindican el DIU, y la precaución del AMPD en menores de 18). Esta ficha agrega la autonomía desde los 13 años, la anticoncepción quirúrgica desde los 16, la consejería y los datos de eficacia en jóvenes.',
            'Coincide: DIU seguro en nulíparas y adolescentes, con más expulsión en menores de 20 años; AMPD en menores de 18 con otras opciones primero. El MEC clasifica el DIU como categoría 2 en estos casos (no categoría 1).',
        ]),
    fuente=fuente('Resumen del capítulo 14 de la guía MSAL 2023 y de los capítulos 2 y 10 para el marco legal y el DIU. La nota informativa del Ministerio sobre menores de 15 años amplía la atención de niñas y adolescentes.', R_MENORES15, R_OMS25),
)

# ======================================================================= perimenopausia
PERI = ficha(
    'mac-perimenopausia', 'Anticoncepción en la perimenopausia',
    ['perimenopausia', 'anticoncepcion en mayores de 40', 'menopausia', 'transicion menopausica', 'cuando suspender el anticonceptivo', 'fsh', 'sofocos', 'sangrado perimenopausia',
     'ahc despues de los 40', 'diu en perimenopausia', 'climaterio'],
    'La perimenopausia es la transición entre los ciclos ovulatorios y el cese de la ovulación y la menstruación; su inicio y fin no están bien definidos. La menopausia se reconoce solo retrospectivamente: un año de amenorrea en mayores de 50 años o dos años en menores de 50 (suele ocurrir entre los 45 y 55 años). Hay ciclos ovulatorios y anovulatorios: quien tiene relaciones con penetración y no desea un embarazo necesita anticoncepción hasta confirmar la menopausia.',
    diagnostico=[
        'Ningún método está contraindicado solo por la edad, pero la edad aumenta el riesgo de patologías que condicionan la elección (cardio y cerebrovasculares, mamarias y cervicouterinas). Hay que asegurar el acceso a consultas de seguimiento por si cambian las condiciones de salud.',
        'Embarazo después de los 40: aumenta el riesgo de alteraciones cromosómicas fetales, aborto espontáneo, complicaciones y morbimortalidad materno-fetal.',
        'Combinados (AHC) desde los 40 años y sin otra condición adversa: categoría 2, se pueden usar hasta la menopausia, con la menor dosis de estrógeno que dé buen control del ciclo. Beneficios: densidad ósea, control del ciclo y dismenorrea, síntomas vasomotores (más con regímenes extendidos de 3 a 6 meses), protección contra cáncer de ovario y endometrio por más de 15 años, quistes ováricos, patología mamaria benigna y cáncer colorrectal.',
        'Controversias de los combinados: cáncer de mama (evidencia no concluyente; no aumenta la muerte por cáncer de mama); riesgo cardiovascular y de TEV (aumenta con la edad, la obesidad, el tabaquismo y los antecedentes familiares); leve aumento del riesgo de ACV isquémico con migraña con aura o dosis de estrógeno mayores de 50 µg.',
        'No se recomiendan combinados: ≥ 35 años que fuman menos de 15 cigarrillos por día (categoría 3) o 15 o más (categoría 4); hipertensión (categoría 3 o 4 según el caso); enfermedad cardiovascular, ACV, migraña con aura y múltiples factores de riesgo (edad avanzada, tabaquismo, diabetes, hipertensión). Medir la presión antes, al menos 6 meses después de iniciar y una vez por año en mayores de 40.',
        'Solo progestágenos: el AMPD reduce síntomas vasomotores y la dismenorrea, pero en mayores de 50 se suele cambiar a otro método; puede demorar hasta 1 año el retorno de la fertilidad (informarlo a quien se acerca a los 40) y con múltiples factores de riesgo cardiovascular es categoría 3. No se asoció aumento de ACV o infarto, con riesgo de TEV leve o nulo. Implantes y SIU-LNG pueden ser tan efectivos como la anticoncepción quirúrgica.',
        'DIU: en la perimenopausia la expulsión es menor en mayores de 40 años y la inserción puede ser más difícil por la menor elasticidad del canal cervical. El SIU-LNG trata el sangrado abundante, la dismenorrea, la endometriosis, la adenomiosis y la hiperplasia de endometrio.',
        'Los métodos basados en el conocimiento de la fertilidad son poco seguros (ciclos irregulares y anovulatorios). La ligadura tubaria no cambia sus beneficios respecto de otras edades.',
    ],
    tratamiento=[
        B('Cuándo suspender el método (cap. 15.1.3)',
          P('Combinados', 'Sin factores de riesgo cardiovascular se pueden continuar hasta los 55 años; con factores, cambiar a un método de solo progestágeno (implante o AOPS). En menores de 50 no hace falta interrumpirlos para evaluar la función ovárica. Desde los 50: dos FSH ≥ 30 UI/L separadas por 6 a 8 semanas, a partir del día 14 de haber dejado el método, y usar un método no hormonal mientras tanto.'),
          P('Solo progestágeno', 'En ≥ 50 años con amenorrea (píldoras, implante o SIU-LNG): dos FSH ≥ 30 UI/L separadas por 6 a 8 semanas permiten suspender luego de un año; o continuar hasta los 55. Con SIU-LNG y amenorrea, agregar estradiol (< 20 pg/ml con FSH ≥ 30 confirma falla ovárica). La amenorrea no es un indicador confiable de falla ovárica con anticoncepción hormonal.'),
          P('Inyectable de progestágeno', 'Desde los 50, dos FSH ≥ 30 UI/L separadas por 90 días y tomadas justo antes de la aplicación; se suspende a los 50 y se sigue con método no hormonal hasta 2 años de amenorrea, o se rota a otro progestágeno.'),
          P('SIU-LNG', 'Si se colocó desde los 45 años con indicación anticonceptiva, la OMS dice que se puede usar hasta 7 años (la FSRH hasta los 55).'),
          P('DIU de cobre', 'Retirarlo tras un año de amenorrea en ≥ 50 años y tras dos años en menores de 50. Si tiene 300 mm² de cobre o más y se colocó desde los 40, puede usarse hasta la menopausia.')),
        B('Síntomas y sangrado',
          P('Sequedad vaginal', 'Lubricantes de base acuosa; recordar que las cremas y aceites reducen la protección de los métodos de barrera.'),
          P('Sangrado con DIU', 'Primero ácido mefenámico 500 mg hasta 3 veces por día durante 5 días u otro AINE; segundo, evaluar ácido tranexámico; no usar aspirina. Descartar miomas, pólipos y neoplasia; si continúa muy abundante o hay anemia, retirar el DIU.')),
    ],
    seguimiento=[
        'Volver a consultar: ante cambios en las condiciones de salud, al cumplir 50 años, con nuevos síntomas menstruales (más dolor, sangrado irregular o abundante) y si el sangrado continúa 3 a 6 meses después de colocar un DIU.',
        'Al discontinuar el método, seguir con preservativos para prevenir ITS y VIH.',
    ],
    banderas=[
        'Sangrado nuevo, abundante o irregular en ≥ 40 años: las alteraciones menstruales y otras patologías ginecológicas son frecuentes; descartar causa orgánica antes de atribuirlo al método.',
        'AMPD o combinados con múltiples factores de riesgo cardiovascular: categoría 3 o 4.',
    ],
    oms2025=[
        'Edad con combinados: de la menarca a los 40 años, categoría 1; desde los 40, categoría 2 (la guía MSAL 2023 también usa categoría 2 desde los 40). El MEC 2025 sostiene que los combinados pueden preservar la masa ósea en la perimenopausia.',
        'La OMS 2025 mantiene la contraindicación (categoría 4) de los combinados en hipertensión ≥ 160/100, migraña con aura y TVP/TEP, y reafirma tabaquismo ≥ 35 años: menos de 15 cigarrillos, categoría 3 (ACI 2); 15 o más, categoría 4 (ACI 3).',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 15) y MEC OMS 2025, contra tu resumen', estado='amplia',
        puntos=[
            'Tu resumen menciona la perimenopausia solo para contraindicar el AMPD («precaución en perimenopáusicas con factores de riesgo para osteoporosis»). La guía MSAL 2023 dice otra cosa: en mayores de 50 años se recomienda considerar cambiar de método, pero la perimenopausia no es una contraindicación; si hay riesgo de osteoporosis, considerar otras opciones.',
            'Tu resumen no incluye la edad de suspensión: la guía da los criterios con FSH (dos valores ≥ 30 UI/L), el límite de 55 años y la duración del DIU colocado desde los 40 y 45 años.',
        ]),
    fuente=fuente('Resumen del capítulo 15 de la guía MSAL 2023 (apartados 15.1.1 a 15.1.3).', R_OMS25),
)

# ======================================================================= VIH
VIH = ficha(
    'mac-vih', 'Anticoncepción en personas con VIH y sus parejas',
    ['vih', 'anticoncepcion y vih', 'personas con vih', 'pcvih', 'tarv', 'antirretrovirales', 'efavirenz', 'ritonavir', 'interacciones arv', 'serodiscordantes', 'indetectable',
     'i=i', 'prep', 'profilaxis preexposicion', 'dolutegravir', 'doble proteccion vih'],
    'La anticoncepción en personas con VIH (PcVIH) y sus parejas respeta la diversidad y la autonomía: con algunas consideraciones no difiere de la de las personas sin VIH. Lo propio es la interacción de ciertos antirretrovirales (ARV) con los anticonceptivos hormonales; no hay contraindicación absoluta por recibir TARV. Los embarazos no intencionales son hasta 3 veces más frecuentes en PcVIH.',
    diagnostico=[
        'El preservativo (vaginal o peneano) es el único MAC que además previene la transmisión del VIH y otras ITS, pero su eficacia anticonceptiva es menor que la de los combinados o los DIU. En Argentina solo 6,3 % de las mujeres con VIH usa un MAC distinto del preservativo: ofrecer otras opciones y doble protección. Cada persona elige según los CME.',
        'Combinados: las restricciones no difieren de las de las personas sin VIH, pero algunos esquemas de TARV (por ejemplo, con dislipemia) pueden ser una contraindicación relativa; usar el TARV de menor impacto metabólico.',
        'Interacciones (cuadro 17.1, ARV disponibles en Argentina a agosto de 2019, adaptado de hiv-druginteractions.org): solo el efavirenz baja significativamente los progestágenos y probablemente la eficacia de la AHE de levonorgestrel y de las píldoras (desogestrel o levonorgestrel) e implantes de solo progestágeno. Conducta: MAC alternativo o adicional, o rotar el TARV; en la AHE, dosis única de 3 mg de levonorgestrel.',
        'Los esquemas con cobicistat (darunavir/cobicistat, elvitegravir/cobicistat y bictegravir) bajan el etinilestradiol y suben los progestágenos (sobre todo la drospirenona): usar al menos 30 µg de etinilestradiol; los ACO con drospirenona están contraindicados; monitorear la toxicidad por progestágenos. Darunavir/ritonavir baja progestágenos y etinilestradiol: al menos 30 µg de etinilestradiol y considerar otro método o rotar el TARV (sin impacto en el implante de etonogestrel).',
        'AMPD: efectivo y seguro, cómodo (inyección trimestral) y sin interacciones relevantes con ningún esquema de TARV disponible; no hay evidencia concluyente de que aumente la adquisición o la transmisión del VIH. SIU-LNG: sin interacciones significativas con el TARV.',
        'DIU (cobre o LNG): las complicaciones (expulsión, perforación, EPI) son bajas y no difieren de las personas sin VIH; es apropiado si no hay patología cervical y hay seguimiento. Enfermedad clínica grave o avanzada (estadios 3 o 4 de la OMS): categoría 3 para iniciarlo.',
        'Anticoncepción quirúrgica, diafragmas y métodos naturales: sin contraindicaciones especiales por el VIH (el diafragma con espermicida es categoría 3 con VIH y 4 con alto riesgo de VIH). La lactancia está contraindicada en personas con VIH para evitar la transmisión vertical, y con ella el MELA.',
        'Indetectable = Intransmisible (I=I): con TARV efectivo y carga viral indetectable por al menos 6 meses no se transmite el VIH por vía sexual; confirmar siempre la supresión por laboratorio. No aplica a otras ITS: promover su detección y tratamiento.',
    ],
    tratamiento=[
        B('Planificación reproductiva en parejas serodiscordantes',
          P('Con supresión', 'Si la persona con VIH recibe TARV y mantiene la supresión virológica documentada durante al menos 6 meses, no hacen falta métodos adicionales para prevenir la transmisión del VIH.'),
          P('Sin supresión', 'Trabajo multidisciplinario para optimizar el TARV y la adherencia antes de la concepción. Si no es posible, considerar con fuerza la PrEP en la persona VIH negativa con capacidad de gestar durante la periconcepción.'),
          P('Embarazo', 'Ofrecer el test de VIH al menos en la consulta inicial y en el segundo y el tercer trimestre, aunque la pareja con VIH esté indetectable.')),
        B('Cuadro 17.1 completo: ARV y anticonceptivos hormonales',
          P('INTR', 'Zidovudina, lamivudina, abacavir, tenofovir (TDF y TAF): sin interacciones significativas; sin ajuste de dosis.'),
          P('Nevirapina y etravirina', 'Sin impacto significativo; sin ajuste.'),
          P('Efavirenz', 'Disminuye significativamente los progestágenos y probablemente la eficacia (incluida la AHE de levonorgestrel y las píldoras de solo progestágeno e implantes). MAC alternativo o adicional, o rotar el TARV; AHE: levonorgestrel 3 mg en dosis única.'),
          P('Rilpivirina', 'Aumenta el etinilestradiol sin afectar la eficacia anticonceptiva; sin ajuste.'),
          P('Darunavir/ritonavir', 'Baja progestágenos y etinilestradiol; sin impacto significativo en el implante de etonogestrel. Formulaciones con al menos 30 µg de etinilestradiol; considerar otro MAC o rotar el TARV.'),
          P('Darunavir/cobicistat', 'Baja el etinilestradiol y sube los progestágenos (sobre todo drospirenona); probablemente sin impacto en la eficacia de los métodos de solo progestágeno con levonorgestrel, desogestrel o implante de etonogestrel. Al menos 30 µg de etinilestradiol; contraindicados los ACO con drospirenona; considerar otro MAC o rotar el TARV.'),
          P('Raltegravir y dolutegravir', 'Sin interacciones significativas; sin ajuste.'),
          P('Bictegravir y elvitegravir/cobicistat', 'Bajan el etinilestradiol y suben los progestágenos (sobre todo drospirenona). Al menos 30 µg de etinilestradiol; ACO con drospirenona contraindicados; monitorear la toxicidad por progestágenos.'),
          P('Maraviroc', 'Sin interacciones significativas; sin ajuste.'),
          P('AMPD', 'No se describieron interacciones de relevancia con ninguno de los esquemas de TARV disponibles.')),
        B('Situaciones particulares',
          P('Adolescentes con VIH', 'Con estado clínico y metabólico estable se siguen las recomendaciones de la adolescencia, teniendo en cuenta las interacciones con el TARV.'),
          P('Puerperio inmediato', 'Se siguen las recomendaciones del puerperio (estrógenos no antes de los 21 días ni durante la lactancia), con las interacciones del TARV.'),
          P('Siempre', 'Recomendar el preservativo en todas las prácticas con posibilidad de transmisión y proveerlo sin restricciones de cantidad, horario ni edad.')),
    ],
    seguimiento=[
        'Revisar el esquema de TARV cada vez que se indica o cambia un anticonceptivo hormonal (y viceversa): puede requerir ajuste de dosis, otro método o rotar el TARV.',
        'Promover la detección y el tratamiento temprano de ITS en las PcVIH y sus parejas, en la etapa preconcepcional y durante el embarazo.',
    ],
    banderas=[
        'ACO con drospirenona y ARV que aumentan los progestágenos: contraindicados.',
        'AHE con efavirenz: duplicar el levonorgestrel (3 mg).',
        'I=I solo previene la transmisión sexual del VIH, no la de otras ITS.',
    ],
    algoritmo=dict(titulo='Elegir un anticonceptivo en una persona con VIH', nodos=[
        I('Persona con VIH que quiere anticoncepción: conocer el esquema de TARV y el estadio clínico'),
        D('¿Toma efavirenz u otro ARV con interacción relevante (cuadro 17.1)?',
          [A('Preferir métodos sin interacción: DIU de cobre, SIU-LNG o inyectable trimestral; si usa un hormonal que interactúa, sumar otro método o rotar el TARV'),
           A('Si necesita AHE: levonorgestrel 3 mg en dosis única')],
          [A('Elegir según los criterios médicos de elegibilidad habituales')]),
        D('¿Tiene enfermedad clínica grave o avanzada (estadios 3 o 4)?',
          [A('DIU: categoría 3 para iniciarlo; elegir otro método o evaluar caso por caso')],
          [A('El DIU (cobre o LNG) es una opción apropiada si no hay patología cervical y hay seguimiento')]),
        F('Preservativo en todas las relaciones (doble protección) y recordar que I=I solo previene la transmisión sexual del VIH'),
    ]),
    oms2025=[
        'Antirretrovirales (Tabla 4.1 del MEC 2025), categorías para combinados, píldora de progestágeno, AMPD / NET-EN e implante: análogos de nucleósidos (abacavir, tenofovir, zidovudina, lamivudina, emtricitabina): 1 en todos. Efavirenz: combinados 2, píldora 2, NET-EN 2, implante 2 y AMPD 1. Etravirina, nevirapina y rilpivirina: 1. Inhibidores de la proteasa potenciados con ritonavir (atazanavir, lopinavir, darunavir): 1. Inhibidores de la integrasa (raltegravir, dolutegravir): 1.',
        'DIU (cobre y LNG) con cualquier ARV: al iniciar, categoría 2 (estadios 1 o 2) o 3 (estadios 3 o 4); continuación, categoría 2.',
        'PrEP (condición nueva en 2025): tenofovir-emtricitabina, anillo de dapivirina y cabotegravir: categoría 1 para todos los métodos. Alto riesgo de VIH: categoría 1 para todos (DIU con nota).',
        'Diferencia con la guía argentina: el cuadro 17.1 de la guía MSAL 2023 (ARV disponibles a agosto de 2019, adaptado de Liverpool) es más cauteloso con los esquemas potenciados que el MEC 2025, que los clasifica 1. Para la práctica argentina prevalece el cuadro 17.1 y el prospecto del esquema de TARV de la persona.',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 17) y MEC OMS 2025', estado='no_contrastado',
        puntos=[
            'Tu resumen no incluye VIH. Esta ficha es nueva y está basada en el capítulo 17 de la guía MSAL 2023 con la actualización de categorías del MEC OMS 2025 en su sección propia.',
            'El cuadro 17.1 se reconstruyó fila por fila leyendo la posición de cada fármaco en el PDF de la guía (nevirapina y etravirina: sin impacto; efavirenz: baja progestágenos; rilpivirina: sube el etinilestradiol; darunavir/ritonavir; darunavir/cobicistat, bictegravir y elvitegravir/cobicistat: suben progestágenos). El bictegravir comparte la celda de la recomendación con el elvitegravir/cobicistat en la guía; verificar con hiv-druginteractions.org ante un caso real.',
        ]),
    fuente=fuente('Resumen del capítulo 17 de la guía MSAL 2023 (apartados 17.1 a 17.3 y cuadro 17.1) y del apartado 7.1 (AHE e inductores). La sección «Guía OMS 2025» usa la Tabla 4.1 del documento de la OMS.', R_PREP, R_IGUAL, R_PERINAT, R_OMS25),
)

FICHAS_4 = [ADOL, PERI, VIH]

# ======================================================================= Guía OMS 2025 en las fichas existentes
OMS25 = {
    'mac-marco': [
        'Edición: sexta de los criterios médicos de elegibilidad (CME) de la OMS, publicada el 3 de noviembre de 2025 (218 páginas), junto con la 4.ª edición de las recomendaciones de prácticas seleccionadas (SPR). Conserva las 4 categorías y la simplificación 1-2 = sí / 3-4 = no.',
        'Qué se revisó (Tabla 4.1 y sección 2 del documento): 4 temas existentes (anticonceptivos de solo progestágeno en la lactancia, DIU en la lactancia, anticonceptivos hormonales con terapia antirretroviral y uso repetido de las píldoras de emergencia, con los inductores del CYP3A4) y 2 temas nuevos: PrEP del VIH y enfermedad inflamatoria intestinal (esta última sin recomendación por evidencia insuficiente). Las demás recomendaciones de 2015 (unas 2.000) fueron reafirmadas por el grupo de desarrollo en julio de 2024.',
        'Se verificaron en el texto de 2025 y coinciden con 2015 y con la guía argentina: tabaquismo, hipertensión, TVP/TEP, migraña con aura, y lactancia o posparto con combinados.',
        'DIU: el MEC 2025 define el SIU-LNG como el de 20 µg/24 horas. La revista AMAdA atribuye a la actualización 2025 una vida útil de 12 años para el DIU de cobre y de 8 para el SIU-LNG; esa cifra no figura en el texto del MEC. En Argentina rige lo aprobado por la ANMAT (10 y 5 años según la guía MSAL 2023).',
        'Importante para el estudio: la guía del Ministerio de Salud (2023) y el programa de la materia citan los CME de 2015. Para el examen usá las categorías de la guía argentina; esta sección sirve para saber qué cambió.',
    ],
    'mac-cme-combinados': [
        'Se verificaron en el texto de 2025 y coinciden con la guía MSAL 2023: tabaquismo ≥ 35 años (menos de 15 cigarrillos: COC, parche y anillo 3, inyectable 2; 15 o más: 4 y 3); hipertensión con antecedentes sin poder evaluar la presión o controlada: 3 en todos; TVP/TEP actual o antecedente: 4; migraña con aura: 4; migraña sin aura: menores de 35 años inicio 2 / continuación 3, y desde los 35 años inicio 3 / continuación 4.',
        'Posparto sin lactancia: menos de 21 días, categoría 3 (4 con otros factores de TEV); de 21 a 42 días, categoría 2 (3 con otros factores); más de 42 días, categoría 1. Lactancia: menos de 6 semanas 4, de 6 semanas a 6 meses 3, desde los 6 meses 2.',
        'Obesidad (IMC ≥ 30): combinados categoría 2; no limita los LARC ni los progestágenos (revista AMAdA). Edad: desde los 40 años, categoría 2.',
    ],
    'mac-aco': [
        'Sin cambios de categoría para el ACO en 2025 en lo verificado (ver la ficha de criterios de elegibilidad de los combinados). Antirretrovirales: efavirenz categoría 2; abacavir, tenofovir, zidovudina, lamivudina, nevirapina, rilpivirina, etravirina, inhibidores de la proteasa e integrasa, categoría 1 (ver la ficha de VIH).',
        'El MEC 2025 mantiene que las recomendaciones son las mismas para todas las formulaciones de ACO de dosis bajas (hasta 35 µg de etinilestradiol), sea cual fuere el gestágeno; la evidencia sugiere que levonorgestrel, noretisterona y norgestimato tienen el menor riesgo de TEV (las diferencias absolutas son muy pequeñas).',
    ],
    'mac-aci': [
        'El MEC 2025 califica las categorías de los inyectables combinados como una «mejor estimación preliminar», entre las de los ACO y las de los progestágenos solos, y las reevaluará con nuevos datos. Mesigyna® y Cyclofem® son las formulaciones consideradas.',
    ],
    'mac-parche-anillo': [
        'El MEC 2025 asigna al parche y al anillo las mismas categorías que a los ACO (mejor estimación preliminar). Señala que el parche puede ser menos eficaz con 90 kg o más y que, con IMC ≥ 30, el aumento de peso del anillo no difirió del de los ACO.',
        'Con PrEP (tenofovir-emtricitabina, anillo de dapivirina, cabotegravir): categoría 1.',
    ],
    'mac-aops': [
        'Lactancia (2025): menos de 6 semanas posparto, píldora de progestágeno 2; de 6 semanas a 6 meses, 1; desde los 6 meses, 1. Posparto sin lactancia: 1. Nuevas evidencias muestran que el implante colocado antes de las 6 semanas no perjudica la lactancia ni el crecimiento infantil.',
        'Antirretrovirales: efavirenz categoría 2 con la píldora; los demás grupos, categoría 1.',
    ],
    'mac-ampd': [
        'Cambio importante: lactancia con menos de 6 semanas posparto, el AMPD / NET-EN pasa a ser categoría 2 en el MEC 2025 (la guía MSAL 2023 cita la categoría 3 de 2015 y recomienda evaluar). Sigue siendo categoría 1 de las 6 semanas en adelante. Posparto sin lactancia: 1.',
        'Menarca a menos de 18 años: categoría 2 (por la pérdida de masa ósea). Antirretrovirales: AMPD categoría 1 con efavirenz; NET-EN categoría 2.',
    ],
    'mac-implante': [
        'Lactancia (2025): menos de 6 semanas, categoría 2; de 6 semanas en adelante, categoría 1. Posparto sin lactancia: 1. Con efavirenz: categoría 2; los demás ARV, categoría 1.',
    ],
    'mac-diu-cobre': [
        'Posparto (BF o no, incluida la cesárea), revisado en 2025: menos de 48 horas (incluida la inserción en el posalumbramiento), categoría 1; de 48 horas a menos de 4 semanas, categoría 3; desde las 4 semanas, categoría 1; sepsis puerperal, categoría 4. La inserción posplacenta tiene menos expulsiones que la posparto diferida, y menos aún si es en la cesárea.',
        'Edad: menores de 20 años categoría 2; desde los 20, categoría 1. Nuligestas: categoría 2. Embarazo: categoría 4.',
        'Con VIH: al iniciar, categoría 2 (estadios 1 o 2) o 3 (estadios 3 o 4); continuación, categoría 2.',
    ],
    'mac-siu-lng': [
        'El MEC 2025 define al SIU-LNG como el de 20 µg/24 horas. Posparto (revisado): menos de 48 horas, categoría 1 sin lactancia y 2 con lactancia; de 48 horas a menos de 4 semanas, categoría 3; desde las 4 semanas, categoría 1; sepsis puerperal, categoría 4.',
        'Edad: menores de 20 años categoría 2; nuligestas categoría 2. Con VIH: mismas categorías que el DIU de cobre.',
    ],
    'mac-ahe': [
        'Categorías de las píldoras de emergencia (MEC 2025) para combinados (Yuzpe), levonorgestrel y ulipristal: enfermedad cardiovascular grave, migraña y enfermedad hepática grave, categoría 2; embarazo ectópico previo, obesidad y violación, categoría 1; lactancia: levonorgestrel y Yuzpe 1, ulipristal 2 (suspender la lactancia 1 semana).',
        'Inductores del CYP3A4 (rifampicina, fenitoína, fenobarbital, carbamazepina, efavirenz, oxcarbazepina, primidona, rifabutina, hierba de San Juan): categoría 1, con la aclaración de que pueden reducir la eficacia. Con efavirenz el levonorgestrel 1,5 mg bajó 56 % sus niveles; con 3 mg la exposición fue similar a la de los controles, aunque la vida media fue 46 % más corta (sin estudios de falla).',
        'Uso repetido en un mismo ciclo: categoría 1 (evidencia de muy baja certeza; un estudio observó más embarazo ectópico con el uso repetido de levonorgestrel). Obesidad: pueden ser menos eficaces con IMC ≥ 30 que con IMC < 25, sin problemas de seguridad: respalda la doble dosis que recomienda la guía argentina.',
    ],
    'mac-quirurgica': [
        'Esterilización femenina posparto (2025): menos de 7 días, aceptar; de 7 a menos de 42 días, retrasar; desde los 42 días, aceptar. Nuliparidad, paridad y lactancia: aceptar. Sin cambios respecto de la guía MSAL 2023.',
    ],
    'mac-puerperio': [
        'Combinados: lactancia menos de 6 semanas 4; de 6 semanas a 6 meses 3; desde los 6 meses 2. Sin lactancia: menos de 21 días 3 (4 con otros factores); de 21 a 42 días 2 (3 con otros factores); más de 42 días 1.',
        'Progestágenos (píldora, inyectables e implante) con lactancia: menos de 6 semanas 2 (el AMPD pasó de 3 a 2); desde las 6 semanas 1. Sin lactancia: 1.',
        'DIU de cobre: menos de 48 horas 1; 48 horas a 4 semanas 3; desde 4 semanas 1; sepsis puerperal 4. SIU-LNG: menos de 48 horas, 1 sin lactancia y 2 con lactancia; el resto igual.',
        'Comentario argentino (AMAdA 2025): la OMS refuerza la contraindicación de los combinados en las primeras 6 semanas y aclara que los progestágenos y el DIU pueden usarse desde el posparto inmediato, incluso con lactancia exclusiva.',
    ],
}

# Enlaces a las guías argentinas (se suman a las fuentes ya cargadas)
LINKS = {
    'mac-marco': [R_GUIA_LINK, R_OMS25],
    'mac-puerperio': [R_GUIA_LINK, R_AIPEO_U, R_OMS25],
    'mac-vih': [R_GUIA_LINK],
}
