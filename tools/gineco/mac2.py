# -*- coding: utf-8 -*-
"""Fichas de métodos anticonceptivos, bloque 2: inyectable mensual, parche y anillo, píldoras de solo progestágeno, inyectable trimestral e implante."""
from mac_comun import *

# ======================================================================= ACI
ACI = ficha(
    'mac-aci', 'Anticonceptivo combinado inyectable mensual (ACI)',
    ['aci', 'inyectable mensual', 'anticonceptivo inyectable mensual', 'mesigyna', 'ginediol', 'cyclofem', 'valerato de estradiol', 'enantato de noretisterona',
     'cipionato de estradiol', 'perlutal', 'atrimon', 'inyeccion anticonceptiva', 'inyectable combinado', 'aplicacion mensual'],
    'Inyectable intramuscular mensual con un estrógeno de acción breve y un gestágeno de acción prolongada: valerato de estradiol 5 mg + enantato de noretisterona 50 mg (Mesigyna®, Ginediol®) o cipionato de estradiol 5 mg + acetato de medroxiprogesterona 25 mg (Cyclofem®). Los que combinan un estrógeno de acción prolongada con un gestágeno breve (Perlutal®, Atrimon®) ya no se recomiendan: más dosis de estrógeno y más hipermenorrea y menometrorragia.',
    diagnostico=[
        'Mecanismo: inhibe la ovulación. Eficacia: uso correcto menos de 1 embarazo cada 100 (5 cada 10.000); uso habitual 3 cada 100 (97 % de eficacia). Depende de la puntualidad de la aplicación.',
        'Fertilidad: se recupera de inmediato al suspender. No protege contra ITS ni VIH.',
        'Pueden usarlo las mismas personas que los ACO, con diferencias: patología vesicular sintomática, antecedente de colestasis por ACO, interacciones con rifampicina y anticonvulsivantes, y fumadora ≥ 35 años con menos de 15 cigarrillos son categoría 2 (3 en el ACO); cirrosis descompensada, adenoma hepático y fumadora ≥ 35 con más de 15 cigarrillos son categoría 3 (4 en el ACO). El resto de las categorías 3 y 4 es igual que en los ACO.',
        'Resulta cómodo para quienes quieren un hormonal pero no logran sostener una pastilla diaria. Con mala circulación o extremidades inmóviles (silla de ruedas) hay mayor riesgo de TVP: evaluar contraindicarlo.',
    ],
    fisiopatologia=[
        'El estrógeno de acción breve inhibe la FSH y el gestágeno de depósito inhibe el pico de LH: anovulación mantenida durante el mes.',
    ],
    estudios=[
        'Mismos requisitos que los ACO: consejería, historia clínica y control de la tensión arterial. Papanicolaou, laboratorio y examen mamario no son requisito.',
    ],
    tratamiento=[
        B('Cómo se aplica',
          P('Vía y sitio', 'Intramuscular profunda en cadera, glúteo o parte superior del brazo, según prefiera la persona. Agitar suavemente la ampolla, aplicar todo el contenido y no masajear el sitio.'),
          P('Frecuencia', 'Cada 30 días, el mismo día del calendario que la primera aplicación (primera el día 3: las siguientes todos los días 3), sin importar cuántos días tiene el mes.'),
          P('Margen', 'Puede aplicarse hasta 7 días antes o 7 días después de la fecha y mantiene la eficacia. Se recomienda aplicarla dentro de 3 días y, mejor, siempre el mismo día.'),
          P('Sangrado', 'Suele aparecer entre los 15 y 20 días de la aplicación (el folleto del Ministerio dice 15 a 25) y es menor y menos doloroso que la menstruación. No esperar el sangrado para aplicar la siguiente.')),
        B('Inicio y cambios',
          P('Cuándo', 'Idealmente el primer día de la menstruación (sin respaldo). En otro momento, con razonable certeza de no embarazo y preservativo durante 7 días.'),
          P('Posaborto', 'Primera aplicación inmediata (primer o segundo día tras la evacuación), sin protección adicional.'),
          P('Cambios', 'De un ACI a otro, o a ACO o AOPS: cuando correspondía la aplicación, sin respaldo. A DIU: de inmediato si lo usó bien, con preservativo hasta verificar su ubicación.')),
        B('Beneficios y efectos',
          P('Efectos', 'En los primeros 3 meses, sangrado irregular o prolongado; al año, amenorrea o sangrado infrecuente. También aumento de peso, cefalea, mareos y mastalgia.'),
          P('Entrega', 'Se pueden dar varias ampollas para que se las aplique en otro lugar (farmacia, enfermería). Conservarlas a temperatura ambiente, no en la heladera.')),
    ],
    seguimiento=[
        'Consulta anual después de empezar; aprovechar cada visita para resolver dudas y verificar el uso correcto. Informar por escrito el nombre del inyectable, la frecuencia y la fecha de la próxima.',
        'Se puede dar la AHE por adelantado para el caso de demora en la aplicación.',
    ],
    banderas=[
        'Más de 7 días de demora: la protección se perdió. Preservativo o abstención de la penetración pene-vagina hasta 7 días después de la nueva inyección, y AHE si hubo relaciones sin protección pasado el margen.',
        'La ausencia de sangrado no es perjudicial («la sangre no se acumula»).',
        'Interacciones relevantes: algunos fármacos de la tuberculosis, el VIH y los anticonvulsivantes pueden disminuir la eficacia; no suspender las inyecciones si no se puede consultar.',
    ],
    farmacos=['fx-aci-mensual'],
    algoritmo=dict(titulo='Aplicación mensual atrasada', nodos=[
        I('La fecha de aplicación del ACI ya pasó'),
        D('¿Pasaron 7 días o menos desde la fecha programada?',
          [F('Aplicarla: mantiene la eficacia y no necesita respaldo')],
          [A('Más de 7 días: la protección se perdió; preservativo o abstención de la penetración pene-vagina hasta 7 días después de la nueva inyección'),
           D('¿Tuvo relaciones con penetración sin otro método pasado el margen de 7 días?',
             [A('Indicar anticoncepción hormonal de emergencia')],
             [A('No hace falta AHE')]),
           F('Reiniciar el método de inmediato si lo desea, como si empezara de nuevo (preservativo 7 días): no esperar a la próxima menstruación')]),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 8.2), folleto del Ministerio de Salud y cuadro 4.4, contra tu resumen', estado='difiere',
        puntos=[
            'Coincide: composiciones (Mesigyna® y Cyclofem®), inyección intramuscular profunda cada 30 días en la misma fecha calendario, sangrado a los 15 a 20 días, y las diferencias de categoría con los ACO (vesícula y colestasis, 2 frente a 3; cirrosis descompensada y adenoma, 3 frente a 4).',
            'Difiere: tu resumen dice margen de «±3 días». La guía y el folleto del Ministerio dan 7 días antes o después como margen de seguridad (3 días es la recomendación de mayor cuidado).',
            'Se amplía: qué hacer con más de 7 días de demora, inicio y cambios de método, y que los ACI de estrógeno de acción prolongada (Perlutal® y Atrimon®) ya no se recomiendan.',
        ]),
    fuente=fuente('Resumen del apartado 8.2 de la guía MSAL 2023 y del folleto de adherencia del Ministerio sobre la inyección mensual.', R_F_ACI),
)

# ======================================================================= parche y anillo
PARCHE = ficha(
    'mac-parche-anillo', 'Parche transdérmico y anillo vaginal combinados',
    ['parche anticonceptivo', 'parche transdermico', 'norelgestromina', 'evra', 'anillo vaginal', 'nuvaring', 'etonogestrel', 'anillo anticonceptivo',
     'parche', 'anillo', 'metodos combinados no orales'],
    'Dos presentaciones de la anticoncepción hormonal combinada con las mismas recomendaciones de uso que los ACO. Parche: plástico delgado y flexible de 4 × 4 cm que libera por día 20 µg de etinilestradiol y 150 µg de norelgestromina. Anillo: anillo flexible y transparente de 54 mm de diámetro externo y 4 mm de corte, de copolímero de acetato de viniletileno (sin látex), que libera por día 15 µg de etinilestradiol y 120 µg de etonogestrel.',
    diagnostico=[
        'Mecanismo: inhiben la ovulación. Eficacia como los ACO: 9 embarazos cada 100 con uso habitual y 0,3 con uso correcto.',
        'El anillo contiene 2,7 mg de etinilestradiol y 11,7 mg de etonogestrel; el etonogestrel es el metabolito activo del desogestrel.',
        'Ventajas: liberación hormonal constante, evitan la absorción gastrointestinal y el primer paso hepático. Parche: mejor adherencia, 2 días adicionales de protección ante un olvido y baja tasa de despegue. Anillo: se inserta y retira fácilmente, puede quitarse en cualquier momento y no interfiere con las relaciones sexuales.',
        'Parche: las tasas de embarazo pueden ser algo mayores en usuarias de 90 kg o más.',
        'Anillo, efectos locales: dolor, irritación, aumento de la secreción vaginal, lesiones epiteliales, incomodidad durante el coito y expulsión. Puede resultar incómodo para quien no está familiarizada con tocar sus genitales.',
        'Elegibilidad: los mismos criterios de categoría 3 y 4 que los ACO. No protegen contra ITS ni VIH. No están incluidos en la canasta de entrega gratuita (sistema público, obras sociales y prepagas).',
    ],
    tratamiento=[
        B('Esquemas',
          P('Parche', 'Un parche nuevo cada semana durante 3 semanas y una cuarta semana sin parche, en la que ocurre el sangrado.'),
          P('Anillo', 'Se introduce en la vagina y se mantiene 3 semanas; en la cuarta semana se retira (aparece el sangrado) y se descarta. Tras 7 días sin anillo se inserta uno nuevo.')),
        B('Inicio y cambios',
          P('Cuándo', 'Las recomendaciones de inicio y de cambio de método son las mismas que para los ACO (primer día de la menstruación; otro día con respaldo de 7 días).'),
          P('Posaborto', 'Parche: el mismo día de la evacuación o al siguiente. Anillo: puede ser simultáneo al inicio de las relaciones sexuales, con preservativo 7 días; recomendar no tener penetración mientras dure el sangrado.')),
    ],
    seguimiento=[
        'Control anual con tensión arterial luego de empezar el método.',
    ],
    banderas=[
        'Las contraindicaciones son las del estrógeno (ver «Anticoncepción hormonal combinada: criterios de elegibilidad»).',
        'Interacciones: rifampicina y anticonvulsivantes inductores bajan la eficacia de los combinados (categoría 3 en ACO y parche; categoría 2 en el ACI).',
    ],
    farmacos=['fx-parche-anillo'],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 8.3 y 8.4), contra tu resumen', estado='difiere',
        puntos=[
            'Coincide: dosis diarias (parche 20 µg + 150 µg; anillo 15 µg + 120 µg), carga del anillo 2,7 mg y 11,7 mg, 3 semanas de uso y 1 de descanso, menor eficacia del parche en 90 kg o más, ventajas farmacocinéticas y efectos locales del anillo.',
            'Sin sustento en la guía MSAL 2023: el «retiro accidental del anillo hasta 3 horas» no figura en las fuentes de la carpeta; no se incluyó. Para el parche, la guía solo menciona los «2 días adicionales de protección».',
            'Se agrega: parche y anillo no están en la canasta gratuita; el anillo no tiene látex.',
        ]),
    fuente=fuente('Resumen de los apartados 8.3 y 8.4 de la guía MSAL 2023 (la guía los presenta como información esencial «a modo informativo»).'),
)

# ======================================================================= AOPS
AOPS = ficha(
    'mac-aops', 'Píldoras de solo progestágeno: minipíldora, desogestrel y drospirenona',
    ['aops', 'minipildora', 'pildora de progestageno solo', 'levonorgestrel 30', 'linestrenol', 'desogestrel', 'cerazette', 'drospirenona', 'slinda', 'solo progestageno',
     'pildora sin estrogenos', 'anticoncepcion sin estrogenos', 'ale', 'lactancia'],
    'Anticonceptivos orales de toma diaria y continua sin estrógeno. Minipíldora (no anovulatoria): levonorgestrel 0,03 mg (28 o 35 comprimidos) o linestrenol 0,5 mg. Desogestrel 0,075 mg (anovulatorio; 28 comprimidos). Drospirenona 4 mg (24 comprimidos activos + 4 inertes; consenso FASGO 2021).',
    diagnostico=[
        'Mecanismo: todos espesan el moco cervical. La minipíldora produce anovulación solo en hasta 40 % de los ciclos, por eso actúa sobre el moco; el desogestrel inhibe el pico de LH y logra anovulación en 97 % de los ciclos; la drospirenona suprime la ovulación y tiene actividad antimineralocorticoide equivalente a 25 mg de espironolactona.',
        'Eficacia: uso correcto menos de 1 embarazo cada 100 (3 por 1.000); uso habitual cerca de 9. En el consenso FASGO: desogestrel 0,3 y drospirenona 0,6 cada 100 con uso correcto.',
        'Margen de seguridad (cuadro 9.1): minipíldora 3 horas; desogestrel 12 horas (la drospirenona, 24 horas según el consenso FASGO). Inicio del efecto: minipíldora 2 días (48 horas); desogestrel 7 días.',
        'Con la minipíldora el moco pierde su impenetrabilidad unas 27 horas después de la toma: si se toma 3 horas tarde puede disminuir la eficacia. Con el desogestrel el amplio margen la hace tan eficaz en la lactancia como fuera de ella.',
        'Quién puede usarlas: personas con contraindicación de estrógenos y quienes amamantan (no afectan el volumen ni la composición de la leche). No tienen efecto clínico sobre lípidos, hidratos de carbono ni hemostasia. El desogestrel no disminuye la densidad mineral ósea. Si se toman por error en el embarazo no afectan al feto.',
        'Categoría 4: cáncer de mama actual. Categoría 3: TVP o embolia pulmonar en curso; cardiopatía isquémica, ACV o migraña con aura que aparecen mientras usa el método; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos.',
    ],
    estudios=[
        'Historia clínica y control de la tensión arterial antes de iniciar (no se niega si no se puede medir). No son requisito: examen pélvico o mamario, análisis de sangre, Papanicolaou.',
    ],
    tratamiento=[
        B('Cómo se toman',
          P('Esquema', 'Una pastilla por día a la misma hora, sin descanso entre envases (todas son activas y del mismo color). La drospirenona se toma 24 días y los 4 inertes.'),
          P('Inicio', 'Idealmente el primer día de la menstruación (sin respaldo). Otro día, con razonable certeza de no embarazo: preservativo 7 días con desogestrel y 2 días con minipíldora.'),
          P('Tras AHE', 'El mismo día de la AHE o con la menstruación siguiente, con respaldo de 7 días (desogestrel) o 2 días (minipíldora).')),
        B('Posparto y lactancia',
          P('Inicio', 'Se pueden comenzar de inmediato tras el parto, cesárea o aborto, sin método adicional.'),
          P('Elección', 'Con lactancia exclusiva la minipíldora es muy adecuada (se asocia al MELA y se reemplaza por un anovulatorio cuando cambia una condición); fuera de ella es mejor el desogestrel, anovulatorio y con más margen.'),
          P('Cambio', 'De minipíldora a desogestrel sin interrupción, sumando preservativo 7 días.')),
        B('Olvidos y vómitos',
          P('Minipíldora', 'Menos de 3 horas de atraso: tomarla y seguir, sin respaldo. 3 horas o más (o si no la tomó): tomarla ya, seguir en el horario, preservativo 48 horas y considerar AHE si hubo relaciones.'),
          P('Desogestrel', 'Menos de 12 horas: tomarla y seguir, sin respaldo. 12 horas o más: tomarla ya, seguir, preservativo 7 días y considerar AHE.'),
          P('Vómitos', 'Dentro de las 2 horas de la toma, tomar otra pastilla. Con la minipíldora, si se toma más de 3 horas tarde se procede como en un olvido. Si los vómitos graves duran más de 24 horas, tratarlos como un olvido.'),
          P('Diarrea', 'Método adicional durante los síntomas y 7 días (desogestrel) o 2 días (minipíldora).')),
    ],
    seguimiento=[
        'Consulta a los pocos meses para resolver dudas; se pueden entregar blísteres para varios meses.',
        'Efectos frecuentes: irregularidades del sangrado e incluso amenorrea (también prolonga la amenorrea de la lactancia), cefalea, mareos, cambios de humor o de libido, mastalgia, dolor abdominal, náuseas, acné y cloasma.',
    ],
    banderas=[
        'Inductores enzimáticos (rifampicina, anticonvulsivantes) reducen la eficacia de las píldoras y del implante, pero no del SIU-LNG ni del inyectable AMPD (consenso FASGO 2021).',
        'La píldora de desogestrel contiene lactosa: investigar intolerancia antes de prescribirla.',
        'Si la minipíldora se usa con MELA y se pierde alguna condición del MELA, cambiar a un método anovulatorio.',
    ],
    farmacos=['fx-minipildora', 'fx-desogestrel', 'fx-drospirenona'],
    algoritmo=dict(titulo='Olvido de una píldora de solo progestágeno', nodos=[
        I('Se atrasó o no tomó la pastilla del día'),
        D('¿Toma minipíldora (levonorgestrel o linestrenol)?',
          [D('¿Pasaron menos de 3 horas del horario habitual?',
             [F('Tomarla lo antes posible y seguir: no necesita respaldo')],
             [A('Tomarla ya, seguir en el horario habitual y usar preservativo 48 horas (se necesitan 2 días de toma correcta)'),
              F('Si hubo relaciones con penetración en ese lapso, considerar la AHE')])],
          [D('¿Toma desogestrel y pasaron menos de 12 horas?',
             [F('Tomarla lo antes posible y seguir: no necesita respaldo')],
             [A('Tomarla ya, seguir en el horario habitual y usar un método de respaldo 7 días (se necesitan 7 días de toma correcta)'),
              F('Si hubo relaciones con penetración sin barrera, considerar la AHE')])]),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 9.1) y consenso FASGO 2021, contra tu resumen', estado='coincide',
        puntos=[
            'Coincide: minipíldora de levonorgestrel 30 µg con margen de 3 horas y respaldo de 48 horas; desogestrel 75 µg con margen de 12 horas, efecto a los 7 días y anovulación; drospirenona 4 mg en esquema 24/4 con margen de 24 horas, actividad antimineralocorticoide de 25 mg de espironolactona y eficacia de 0,6 cada 100; el desogestrel no disminuye la masa ósea; cáncer de mama actual como única categoría 4.',
            'Matiz: la drospirenona sola no figura en la guía MSAL 2023 (solo levonorgestrel, linestrenol y desogestrel); sus datos vienen del consenso FASGO 2021. Tu resumen la ubica como de 4.ª generación y el consenso FASGO la describe como de tercera: la clasificación por generaciones varía según la fuente y no figura en la guía, por eso no se usa.',
            'Se amplía: la minipíldora anovula en hasta 40 % de los ciclos y el desogestrel en 97 %; cuándo iniciar cada una; olvidos, vómitos y diarrea; y las condiciones de categoría 3.',
        ]),
    fuente=fuente('Resumen del apartado 9.1 de la guía MSAL 2023; los datos de la drospirenona sola y la ausencia de efecto sobre la masa ósea del desogestrel provienen del consenso FASGO 2021.', R_FASGO),
)

# ======================================================================= AMPD
AMPD = ficha(
    'mac-ampd', 'Inyectable trimestral: acetato de medroxiprogesterona de depósito (AMPD)',
    ['ampd', 'dmpa', 'depo provera', 'medroxiprogesterona', 'inyectable trimestral', 'inyectable cada 3 meses', 'anticonceptivo inyectable', 'densidad mineral osea',
     'amenorrea', 'progestageno de deposito', 'inyectable solo de progestageno'],
    'Acetato de medroxiprogesterona de depósito 150 mg (Depo-Provera®), inyección intramuscular cada 3 meses (90 días o 13 semanas). Es un progestágeno sin estrógeno que actúa por anovulación; la formulación subcutánea usa 104 mg con duración similar.',
    diagnostico=[
        'Mecanismo: inhibición de la ovulación. Eficacia: con uso correcto menos de 1 embarazo cada 100 (2 por 1.000); con uso habitual 6 cada 100.',
        'Fertilidad: con frecuencia se demora; suele recuperarse a los 10 meses de la última inyección, sin importar cuánto tiempo se usó. No protege contra ITS ni VIH.',
        'Puede usarse durante la lactancia y cuando los estrógenos están contraindicados; es privada, no requiere acción diaria y facilita la adherencia. Si se aplica en un embarazo no conocido no afecta su curso.',
        'Densidad mineral ósea: se asocia con una pérdida leve que se recupera al suspender; no se demostró mayor riesgo de fracturas a ninguna edad. Antes de usarlo en menores de 18 años (pico de masa ósea), con otros factores de riesgo de osteoporosis (edad, bajo IMC, antecedente familiar de fractura de cadera, tabaquismo, glucocorticoides, alcohol, artritis reumatoidea) y en mayores de 50 años, considerar otras opciones.',
        'Categoría 4: cáncer de mama actual. Categoría 3: primeras 6 semanas posparto con lactancia; TVP o embolia pulmonar en curso; migraña con aura si ya lo usaba; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos; múltiples factores de riesgo cardiovascular; hipertensión ≥ 160/100 o con enfermedad vascular; cardiopatía isquémica y ACV; sangrado vaginal sin diagnóstico; diabetes con complicaciones.',
        'Los inductores enzimáticos no modifican su eficacia (consenso FASGO 2021). La OMS le da recomendaciones de elegibilidad propias, distintas del resto de los progestágenos.',
    ],
    tratamiento=[
        B('Cómo se aplica',
          P('Esquema', 'Inyección intramuscular profunda en cadera, glúteo o parte superior del brazo, cada 13 semanas. No masajear el sitio.'),
          P('Margen', 'Puede adelantarse hasta 2 semanas o atrasarse hasta 4 semanas manteniendo la eficacia. Luego se cuentan 13 semanas desde esa aplicación.'),
          P('Atraso', 'Si pasaron más de 4 semanas: barrera durante los siguientes 7 días o abstención de la penetración pene-vagina hasta recibir la inyección. No esperar la próxima menstruación para reiniciar (descartar embarazo y usar preservativo 7 días).')),
        B('Inicio',
          P('Cuándo', 'En cualquier momento del ciclo. En los primeros 7 días de la menstruación no necesita respaldo; en otro momento, con razonable certeza de no embarazo y respaldo 7 días.'),
          P('Posparto', 'Si no amamanta, de inmediato. Si amamanta, desde las 6 semanas. En circunstancias especiales (por ejemplo, dificultad para volver) se puede adelantar al alta, según la DNSSR.'),
          P('Posaborto y AHE', 'Posaborto: inmediatamente (primer o segundo día tras la evacuación). Tras una AHE: el mismo día o dentro de los 7 días de la menstruación, con respaldo hasta 7 días de aplicada.'),
          P('Cambios', 'A ACO o AOPS: cuando correspondía la siguiente aplicación. A implante: ese día o unos días antes. A DIU: cuando lo desee si lo usó bien.')),
        B('Efectos y manejo',
          P('Sangrado', 'Irregular o frecuente los primeros meses y generalmente amenorrea al año. Si es leve: ácido mefenámico 500 mg hasta 3 veces por día durante 5 días u otro AINE. Si es abundante: pastillas combinadas durante 21 días por algunos ciclos y evaluar el cambio de método.'),
          P('Otros', 'Aumento gradual de peso, cefalea, mareos, distensión abdominal, cambios de humor y de libido.'),
          P('Beneficios', 'Protege el endometrio (útil en hiperplasia), puede disminuir las convulsiones epilépticas y reduce el sangrado uterino.')),
    ],
    seguimiento=[
        'Control anual de la tensión arterial. En quienes quieren seguir usándolo, reevaluar cada 2 años riesgos, beneficios y deseos; el consenso FASGO desaconseja el uso prolongado (más de 2 años) con factores de riesgo de baja masa ósea y a partir de los 50 años.',
        'Se pueden entregar ampollas para varias aplicaciones.',
    ],
    banderas=[
        'Sangrado irregular que persiste varios meses, reaparece tras un período normal o hace sospechar otra causa: descartar patología subyacente.',
        'Pérdida de densidad ósea en menores de 18 años, mayores de 50 y con factores de riesgo de osteoporosis: considerar otros métodos.',
    ],
    farmacos=['fx-medroxiprogesterona'],
    algoritmo=dict(titulo='Aplicación trimestral atrasada o adelantada', nodos=[
        I('Corresponde la nueva inyección de AMPD (13 semanas desde la anterior)'),
        D('¿Está dentro de las 2 semanas antes o las 4 semanas después de la fecha?',
          [F('Aplicarla: mantiene la eficacia. Contar 13 semanas desde esta aplicación')],
          [A('Más de 4 semanas de atraso: la protección se perdió'),
           A('Descartar embarazo y aplicar la inyección, con preservativo durante 7 días (o sin penetración pene-vagina hasta entonces)'),
           F('No esperar a la próxima menstruación para reiniciar')]),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 9.2) y consenso FASGO 2021, contra tu resumen', estado='difiere',
        puntos=[
            'Difiere: tu resumen dice que se aplica «cada 12 semanas (3 meses)». La guía MSAL 2023 y el consenso FASGO indican cada 13 semanas (90 días). El margen de 2 semanas antes y 4 después coincide con la guía.',
            'Difiere: la «amenorrea en el 50 % de las usuarias al primer año» no figura en la guía (dice que generalmente hay amenorrea al año); la demora del retorno de la fertilidad es de 10 meses desde la última inyección, no un rango de 6 a 10 meses.',
            'Coincide: potente anovulatorio, falla de 0,2 con uso correcto (6 con uso habitual), pérdida transitoria de masa ósea con precaución en menores de 18 años, categoría 4 solo en cáncer de mama actual.',
            'Se amplía: la perimenopausia no es una contraindicación; la guía recomienda considerar otras opciones por encima de los 50 años y con factores de riesgo de osteoporosis.',
        ]),
    fuente=fuente('Resumen del apartado 9.2 de la guía MSAL 2023. La formulación subcutánea de 104 mg, el desaconsejar el uso mayor de 2 años en quien tiene riesgo de baja masa ósea y la indemnidad frente a los inductores enzimáticos provienen del consenso FASGO 2021.', R_FASGO),
)

# ======================================================================= implante
IMPLANTE = ficha(
    'mac-implante', 'Implante subdérmico anticonceptivo',
    ['implante', 'implante subdermico', 'implanon', 'nexplanon', 'etonogestrel', 'jadelle', 'levoplant', 'sino implant', 'larc', 'implante anticonceptivo',
     'varilla subdermica', 'colocacion de implante', 'adolescentes'],
    'Varillas flexibles de liberación prolongada que se colocan debajo de la piel del brazo; solo contienen progestágeno. Implanon® / Nexplanon®: 1 varilla de 4 cm × 2 mm con 68 mg de etonogestrel (3 años según ANMAT). Jadelle®: 2 varillas con 75 mg de levonorgestrel cada una (150 mg), 5 años. Levoplant® / Sino-implant II: 2 varillas con 75 mg de levonorgestrel, 3 años.',
    diagnostico=[
        'Mecanismo: principalmente inhibe la ovulación; además espesa el moco cervical. Después del tiempo previsto de duración la dosis disminuye y baja la efectividad.',
        'Eficacia: 0,05 % de embarazos en el primer año (5 cada 10.000); no depende de la persona. La eficacia del implante de etonogestrel es similar sin importar el IMC. Con levonorgestrel y más de 80 kg la eficacia puede bajar hacia el final de su duración: considerar retirar el Jadelle a los 4 años.',
        'Fertilidad inmediata al retirarlo. Se puede usar en la lactancia y en el posevento obstétrico inmediato. No protege contra ITS ni VIH.',
        'Elegibilidad: categorías 1 y 2 en casi todos los casos (como los AOPS). Categoría 4: cáncer de mama actual. Categoría 3: TVP o embolia pulmonar en curso; cardiopatía isquémica o ACV mientras lo usaba; migraña con aura de aparición durante el uso; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos; sangrado vaginal de causa desconocida antes de evaluarlo. El peso no es contraindicación.',
        'Es un método que suelen aceptar y elegir las adolescentes. Desde los 13 años se accede de manera autónoma; el consentimiento es oral, con constancia en la historia clínica.',
    ],
    estudios=[
        'Antes de colocarlo: conversar para dar información completa e identificar contraindicaciones. Se recomienda controlar la tensión arterial, pero no se niega si no se puede. No son requisito: examen pélvico o mamario, análisis de sangre ni Papanicolaou.',
    ],
    tratamiento=[
        B('Momento de la colocación',
          P('Ciclo', 'Dentro de los primeros 5 días del ciclo no necesita respaldo. En el resto del ciclo, con razonable certeza de no embarazo, más método de respaldo por 7 días. Se prioriza no perder la oportunidad: colocarlo el mismo día que se solicita.'),
          P('Puerperio', 'Menos de 6 semanas: de inmediato (categoría 2 si amamanta). De 6 semanas a 6 meses con amenorrea y lactancia exclusiva o casi exclusiva: colocarlo. Posaborto: inmediatamente.'),
          P('Cambios', 'Desde un inyectable: cuando correspondía la siguiente aplicación, sin respaldo. Desde ACO bien usados: de inmediato (respaldo 7 días si es la primera semana de pastillas).')),
        B('Técnica',
          P('Quién', 'Un profesional entrenado, con anestesia local y en condiciones asépticas; demora pocos minutos.'),
          P('Dónde', 'Subdérmico, en la cara interna de la parte superior del brazo no dominante, evitando el surco entre el bíceps y el tríceps (grandes vasos y nervios). Siempre verificar por palpación que quedó colocado y pedir a la persona que lo palpe.'),
          P('Complicaciones', 'Enrojecimiento, calor o dolor en la zona (infección) o varilla que se asoma por la incisión. Si no es palpable: ecografía, radiografía, tomografía o resonancia, y método no hormonal hasta ubicarlo; los implantes profundos requieren extracción por profesionales entrenados.')),
        B('Efectos y consejería',
          P('Sangrado', 'Irregularidades menstruales los primeros meses, incluso amenorrea, sin importancia clínica; suelen disminuir aunque a veces continúan.'),
          P('Retiro', 'Los efectos secundarios son el principal motivo de retiro: alteración del sangrado (ausencia o aumento), aumento de peso y cefalea. Explicarlos antes de colocarlo mejora la continuidad.')),
    ],
    seguimiento=[
        'Consultar ante dolor, enrojecimiento o calor en el sitio de inserción. Al vencer (3 años en el de etonogestrel), se puede reemplazar por uno nuevo en el mismo acto de la extracción.',
    ],
    banderas=[
        'Inductores enzimáticos (rifampicina, anticonvulsivantes) reducen la eficacia del implante (consenso FASGO 2021).',
        'Implante no palpable después de colocarlo: usar un método no hormonal hasta confirmar su ubicación.',
    ],
    farmacos=['fx-implante'],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 9.3) y consenso FASGO 2021, contra tu resumen', estado='difiere',
        puntos=[
            'Coincide: Implanon® / Nexplanon® con una varilla de 68 mg de etonogestrel y 3 años; Jadelle® con dos varillas y 150 mg totales de levonorgestrel y 5 años; mecanismo (anovulación y moco); índice de Pearl de 0,05; la alteración del sangrado como principal causa de extracción; categoría 4 solo en cáncer de mama actual; colocación en el brazo no dominante.',
            'Sin sustento en las fuentes de la carpeta (no se incluyeron): Norplant® («6 cápsulas, 216 mg»), «único modelo provisto en Argentina hasta los 24 años por el plan oficial» y «amenorrea en 20 a 30 %». La guía menciona en cambio Levoplant® / Sino-implant II.',
            'Se amplía: la ANMAT aprobó 3 años para el implante de etonogestrel aunque hay estudios de eficacia hasta 5 años; recomendaciones por peso para los de levonorgestrel; momento de colocación; consentimiento oral y autonomía desde los 13 años.',
        ]),
    fuente=fuente('Resumen del apartado 9.3 de la guía MSAL 2023. La ubicación recomendada de la inserción y la actitud ante un implante no palpable se complementan con el consenso FASGO 2021.', R_FASGO),
)

FICHAS_2 = [ACI, PARCHE, AOPS, AMPD, IMPLANTE]
