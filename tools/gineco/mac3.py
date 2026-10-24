# -*- coding: utf-8 -*-
"""Fichas de métodos anticonceptivos, bloque 3: DIU de cobre, SIU-LNG, anticoncepción de emergencia, anticoncepción quirúrgica y puerperio/posaborto."""
from mac_comun import *

# ======================================================================= DIU de cobre
DIU_CU = ficha(
    'mac-diu-cobre', 'DIU de cobre: indicaciones, colocación, contraindicaciones y complicaciones',
    ['diu', 'diu de cobre', 'dispositivo intrauterino', 'diu t de cobre', 't cu 380', 'tcu380a', 'diu con cobre', 'dispositivo intrauterino de cobre', 'larc', 'colocacion de diu',
     'diu posparto', 'diu posplacenta', 'diupp', 'expulsion del diu', 'perforacion uterina', 'diu y epi', 'embarazo con diu', 'contraindicaciones del diu'],
    'Dispositivo de plástico con un vástago vertical rodeado por hilo de cobre y una o dos ramas horizontales, que se coloca dentro de la cavidad uterina; los hilos asoman por el orificio cervical externo. El más usado es la T de cobre 380 (el número indica la superficie de cobre, que determina la duración). Los de menos de 300 mm² de cobre duran alrededor de 3 años; el TCu380 hasta 10 años.',
    diagnostico=[
        'Mecanismo (prefertilización): los iones de cobre vuelven hostil el moco cervical, inhiben la motilidad, la capacitación y la activación de los espermatozoides, y la reacción inflamatoria estéril local aumenta los leucocitos que los fagocitan. Es un efecto espermicida, no abortivo.',
        'Eficacia: menos de 1 embarazo cada 100 por año, con uso correcto (0,6 %) y habitual (0,8 %), porque no depende de la usuaria. Fertilidad inmediata al retirarlo, sin necesidad de «descansar».',
        'Es el método de emergencia más eficaz: reduce el riesgo de embarazo en más del 99 % si se coloca dentro de los 5 días (120 horas) de la relación, o hasta 5 días después de la fecha esperada de la ovulación; no depende del IMC y no tiene interacciones.',
        'Puede usarse en la mayoría de las personas, hayan tenido hijos o no, adolescentes incluidas, y cuando no pueden usarse otros métodos (hipertensión, tabaquismo, lactancia, migraña, trombosis). La nuliparidad no aumenta el riesgo de perforación, expulsión o infección; en menores de 20 años la expulsión es algo mayor. La anemia es categoría 2.',
        'Categoría 4 (no colocar): embarazo confirmado o sospechado; sepsis puerperal; inmediatamente posaborto séptico; cáncer cervical y cáncer endometrial al iniciar; miomas o anomalías que distorsionan la cavidad; EPI actual, cervicitis purulenta o infección por clamidia o gonococo al iniciar; tuberculosis pélvica al iniciar; hemorragia vaginal sin diagnóstico y enfermedad trofoblástica con β-hCG persistentemente elevada o maligna (OMS 2015; la guía las lista expresamente para el SIU-LNG); enfermedad de Wilson; alergia al cobre.',
        'Categoría 3: entre las 48 horas y las 4 semanas posparto (mayor tasa de expulsión y perforación); enfermedad trofoblástica gestacional benigna con β-hCG bajo o indetectable; cáncer de ovario al iniciar; ITS con prácticas de riesgo sin preservativo (2 o 3); VIH grave o avanzado (estadios 3 o 4) al iniciar; LES con trombocitopenia severa al iniciar.',
        'En el cáncer de mama actual el DIU de cobre es categoría 1 (el SIU-LNG es categoría 4).',
        'Con valvulopatía, reemplazo valvular, inmunodepresión, corticoides, quimioterapia o menstruación muy abundante, evaluar cada caso y reforzar el seguimiento.',
    ],
    estudios=[
        'Requisitos: consejería y, a diferencia de otros métodos, examen bimanual (tamaño y posición uterina) y especuloscopía para confirmar una «vagina sana». Descartar un embarazo.',
        'No hacen falta: test de VIH o ITS, análisis de laboratorio, pesquisa de cáncer cervical, examen mamario ni coincidir con los primeros días del ciclo. El consentimiento es oral y los mayores de 13 años acceden de manera autónoma.',
        'Analgesia 30 minutos antes (ibuprofeno, paracetamol u otro; evitar la aspirina porque prolonga el sangrado). Profilaxis antibiótica solo con vagina no sana, riesgo de endocarditis (reemplazo valvular), diabetes, inmunodepresión o asepsia incumplida.',
    ],
    tratamiento=[
        B('Cuándo colocarlo',
          P('Intervalo', 'En cualquier momento con razonable certeza de no embarazo; se prefiere durante la menstruación (primeros 5 días) por la certeza de ausencia de embarazo y la mayor facilidad. Cambio desde otro método: inmediato si lo usó bien, sin esperar el sangrado.'),
          P('Posparto', 'Posalumbramiento (dentro de los 10 minutos de la salida de la placenta), posparto inmediato (hasta 48 horas) o intracesárea, con entrenamiento específico: menor expulsión si es posplacenta o intracesárea. Si pasaron más de 48 horas, esperar al menos 4 semanas.'),
          P('Posaborto', 'Aborto del 1.er o 2.º trimestre sin infección: inmediatamente, dentro de los 12 días. Aborto séptico: postergar hasta completar el tratamiento. En el 2.º trimestre sin entrenamiento, esperar 4 semanas.')),
        B('Colocación y primeros días',
          P('Técnica', 'Examen bimanual, espéculo, antisepsia del cuello, pinza de Pozzi en el labio anterior, histerometría y colocación con técnica de empuje (T de cobre) o de retiro (Multiload). Nunca forzar al atravesar el orificio cervical interno.'),
          P('Después', 'Durante el sangrado y 7 días: sin penetración vaginal, óvulos, tampones, copa menstrual, duchas vaginales ni baños de inmersión. Usar otro método hasta el primer control que confirme que está en la cavidad. Entregar por escrito el modelo, la fecha y el vencimiento.'),
          P('Controles', 'Clínico (hilos con espéculo): luego de la primera menstruación o entre las 3 y 6 semanas, a los 6 meses y luego una vez al año. La ecografía no es de rutina: se pide si los hilos no se ven o son más largos, o ante sangrado o dolor persistentes. Está bien ubicado si queda por encima del orificio cervical interno.')),
        B('Efectos y complicaciones',
          P('Frecuentes', 'Mayor sangrado menstrual, goteo intermenstrual y cólicos, que suelen disminuir a los 3 a 6 meses. El aumento del sangrado es un motivo principal de extracción durante el primer año (4 a 15 %); puede causar anemia.'),
          P('Expulsión', 'Total (todo el DIU bajo el orificio cervical interno) o parcial: extraer y recolocar otro tras descartar embarazo. Hasta 10 % es asintomática. Descenso (por encima del orificio interno): no se extrae, controlar cada 60 a 90 días por 6 meses.'),
          P('Perforación', 'Cerca de 1 en 1.000 inserciones. Con translocación: extracción quirúrgica (laparoscopía, laparotomía o cistoscopía). Se puede colocar otro después de 90 días.'),
          P('Infección', 'Menos de 0,3 % si se respeta la asepsia; se concentra en las primeras semanas (riesgo de EPI 1,5 a 2 % en los 20 días). Con cervicovaginitis al insertar el riesgo se multiplica por 10 a 20.')),
        B('Situaciones especiales',
          P('EPI con DIU', 'No hay evidencia de que retirarlo mejore la evolución: tratar con antibióticos y dejar a criterio del médico y de la persona. Si quiere retirarlo, hacerlo luego de iniciado el antibiótico (30 minutos si es parenteral, 3 horas si es oral); si no mejora en 24 a 48 horas, retirarlo.'),
          P('Embarazo con DIU', 'Hacer ecografía (preferentemente transvaginal). Ortotópico: riesgo de aborto del 50 %; extraer el DIU si está por debajo del saco y se ven los hilos; no extraerlo si está por arriba o en contacto con el saco o no hay hilos visibles. Hay más probabilidad de que sea ectópico, aunque el DIU reduce el riesgo absoluto de ectópico.'),
          P('Citología anormal', 'En general no se retira; sí en caso de conización o braquiterapia.')),
    ],
    seguimiento=[
        'Consultar por flujo con mal olor, dolor pelviano intenso o en aumento, sangrado abundante, dispareunia, falta de menstruación o si siente el DIU.',
        'Se puede hacer el Papanicolaou con el DIU colocado y los controles del DIU son una buena oportunidad para el tamizaje. Si el DIU fue colocado posparto, controlar a los 30 días (folleto) o entre las 4 y 6 semanas.',
        'Reforzar la doble protección: el DIU no previene ITS.',
    ],
    banderas=[
        'DIU posparto inmediato contraindicado con rotura de membranas de más de 18 horas, signos de corioamnionitis, hemorragia posparto no resuelta o traumatismo genital extenso.',
        'Hilos no visibles o más largos, dolor pelviano agudo o sangrado persistente: sospechar expulsión, migración o perforación; pedir ecografía y usar otro método mientras tanto.',
        'Usuaria con DIU y test de embarazo positivo: descartar ectópico antes de cualquier conducta.',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 10.1 y 16), folleto del Ministerio y revista AMAdA 2025, contra tu resumen', estado='difiere',
        puntos=[
            'Difiere: tu resumen marca el DIU posparto entre 48 horas y 4 semanas como «CONTRAINDICADO». Es categoría 3 de la OMS (en general no se recomienda), no categoría 4; tampoco figura en la guía que «triplique» el riesgo: dice que aumentan la expulsión y la perforación. Coincide que hasta 48 horas es seguro y que pasadas las 4 semanas se coloca como en el intervalo.',
            'Coincide: TCu380 hasta 10 años (tu resumen lo marca como «5 a 10 años» según el modelo). Matiz: la guía dice que los de menos de 300 mm² de cobre duran alrededor de 3 años (tu resumen: 3 a 5). La OMS 2025 amplía el cobre a 12 años (revista AMAdA); la ANMAT, según la guía MSAL 2023, no lo extendió más allá de 10.',
            'Se corrige: «ibuprofeno 400 mg» y «ácido tranexámico» no figuran en la guía (solo ibuprofeno, paracetamol u otro analgésico 30 minutos antes de la colocación); no se incluyeron dosis. «Banderas rojas» sí se mantienen.',
            'Coincide y se amplía: la nuliparidad y la adolescencia no son contraindicación; en la EPI con DIU colocado no es obligatorio retirarlo; el cáncer de mama actual es categoría 1 para el DIU de cobre. Se agregan la hemorragia sin diagnóstico (categoría 4 al iniciar), la tuberculosis pélvica, la enfermedad de Wilson y la alergia al cobre.',
        ]),
    fuente=fuente('Resumen del capítulo 10.1 de la guía MSAL 2023, de la sección posparto del capítulo 16 y del folleto de adherencia de los dispositivos intrauterinos. La hemorragia vaginal sin diagnóstico como categoría 4 al iniciar es el criterio OMS 2015 (la guía la lista en el SIU-LNG).', R_F_DIU, R_AMADA),
)

# ======================================================================= SIU-LNG
SIU = ficha(
    'mac-siu-lng', 'DIU con levonorgestrel (SIU-LNG): Mirena, Kyleena y Blusiri',
    ['siu', 'siu lng', 'diu hormonal', 'dispositivo intrauterino con levonorgestrel', 'sistema intrauterino', 'mirena', 'kyleena', 'blusiri', 'diu liberador de levonorgestrel',
     'diu con levonorgestrel', 'sangrado menstrual abundante', 'menorragia', 'amenorrea', 'larc'],
    'Dispositivo en forma de T que libera levonorgestrel de manera constante dentro del útero. Modelos: 52 mg (Mirena®, 5 años; disponible en la canasta de la DNSSR), 19,5 mg (Kyleena®, 5 años) y 13,5 mg (Blusiri®, 3 años). Está especialmente indicado en menstruaciones muy abundantes.',
    diagnostico=[
        'Mecanismo: altera el moco cervical y evita la proliferación endometrial (endometrio en reposo, resistente a la estimulación estrogénica), lo que reduce el sangrado. Puede inhibir la ovulación en los primeros ciclos, pero su interferencia sobre la función ovárica es mínima. Casi no se absorbe al resto del organismo.',
        'Eficacia: 0,2 embarazos cada 100 por año, igual con uso habitual y correcto. Duración anticonceptiva: 5 años para los de 52 y 19,5 mg (hay estudios hasta 8 años, pero la ANMAT no lo extendió); 3 años para el de 13,5 mg. Si se coloca desde los 45 años con indicación anticonceptiva, puede usarse hasta 7 años.',
        'Es efectivo luego de 7 días de colocado: preservativo durante la primera semana (folleto del Ministerio).',
        'Beneficios no anticonceptivos: menos sangrado y anemia, menos dismenorrea, menor riesgo de EPI (moco cervical), prevención de la hiperplasia endometrial, menor riesgo de embarazo ectópico y tratamiento alternativo de la endometriosis profunda. Es una alternativa a los tratamientos quirúrgicos del sangrado abundante, aun sin necesidad de anticoncepción.',
        'Fertilidad inmediata al retirarlo: cerca de 80 % de concepción durante el primer año.',
        'Categoría 4: las mismas del DIU de cobre (embarazo, sepsis puerperal, posaborto séptico, hemorragia vaginal sin diagnóstico, cáncer cervical o endometrial al iniciar, miomas o anomalías que distorsionan la cavidad, EPI actual, cervicitis purulenta, clamidia o gonococo al iniciar, tuberculosis pélvica al iniciar, enfermedad trofoblástica con β-hCG persistentemente elevada o maligna) y, además, el cáncer de mama actual.',
        'Categoría 3: entre las 48 horas y las 4 semanas posparto; cáncer de ovario al iniciar; alto riesgo de ITS; VIH grave o avanzado al iniciar; TVP o embolia pulmonar; cardiopatía isquémica o migraña con aura durante el uso; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos.',
    ],
    estudios=[
        'Los mismos requisitos que el DIU de cobre, y además controlar la tensión arterial por ser un método con hormona.',
    ],
    tratamiento=[
        B('Colocación y reemplazo',
          P('Momento', 'Los mismos momentos que el DIU de cobre: durante la menstruación o en cualquier momento con razonable certeza de no embarazo; posparto hasta 48 horas o desde la cuarta semana; posaborto inmediato.'),
          P('Reinserción', 'Al vencer, la extracción y la colocación del nuevo deben hacerse en el mismo procedimiento: diferirlo aumenta el riesgo de embarazo y de infección.'),
          P('Técnica y eventos', 'Igual que el DIU de cobre (el introductor se carga con el deslizador y se deja el anillo según la histerometría); mismas complicaciones y recomendaciones poscolocación.')),
        B('Efectos',
          P('Sangrado', 'Más prolongado o intenso los primeros 3 a 6 meses; luego sangrados más leves, infrecuentes o amenorrea (50 % de las usuarias a los 2 años). Goteo persistente al principio. Si es molesto: ACO de baja dosis cíclico o continuo durante 3 meses.'),
          P('Hormonales', 'Parte del levonorgestrel se absorbe: acné, cefalea, tensión mamaria (rara, cede en 6 meses). Quistes foliculares ováricos en los primeros ciclos, casi siempre asintomáticos y que se reabsorben.'),
          P('Sangrado súbito', 'Una hemorragia anormal repentina en una usuaria se evalúa como en cualquier persona: descartar embarazo y neoplasia ginecológica.')),
    ],
    seguimiento=[
        'Control igual que el DIU de cobre: primera menstruación o 3 a 6 semanas, 6 meses y luego anual. Si colocó el DIU para el sangrado abundante, valorar hemoglobina.',
        'Explicar antes de colocarlo que la amenorrea «no es mala» ni la sangre «se acumula»: el cambio del sangrado es un motivo importante de abandono.',
    ],
    banderas=[
        'Cáncer de mama actual: categoría 4 para el SIU-LNG (el DIU de cobre es categoría 1).',
        'Dolor pelviano, flujo fétido, fiebre o sangrado abundante después de la colocación: descartar infección, expulsión o perforación.',
    ],
    farmacos=['fx-siu-levonorgestrel'],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 10.2), contra tu resumen', estado='difiere',
        puntos=[
            'Difiere: tu resumen dice que libera 20 µg/día y 14 µg/día a los 5 años, y que la amenorrea aparece en 25 a 50 % a los 6 a 12 meses. La guía MSAL 2023 no da tasas de liberación (el MEC OMS 2025 define el SIU-LNG como el de 20 µg/24 horas; el dato de 14 µg no está en las fuentes y no se incluyó) y dice que el DIU-LNG produce amenorrea en 50 % de las usuarias a los 2 años.',
            'Difiere: «gold standard del SUA y la adenomiosis, con reducción de 90 a 95 %» no figura en la guía: ésta lo describe como especialmente indicado en menstruaciones muy abundantes y como alternativa a los tratamientos quirúrgicos, sin cifras. La ficha de sangrado uterino anormal y la de adenomiosis de NikaFarma citan sus propias fuentes.',
            'Coincide: duración de 5 años del Mirena® (52 mg), mecanismo (moco espeso y atrofia endometrial), spotting inicial, cáncer de mama actual como categoría 4 frente a categoría 1 del DIU de cobre.',
            'Se amplía: modelos de 19,5 y 13,5 mg con su duración, uso hasta 7 años desde los 45 años, reinserción en el mismo acto y las categorías 3.',
        ]),
    fuente=fuente('Resumen del apartado 10.2 de la guía MSAL 2023 y del folleto de adherencia de los dispositivos intrauterinos.', R_F_DIU),
)

# ======================================================================= AHE
AHE = ficha(
    'mac-ahe', 'Anticoncepción de emergencia: levonorgestrel, Yuzpe y DIU de cobre',
    ['ahe', 'anticoncepcion de emergencia', 'pildora del dia despues', 'anticoncepcion hormonal de emergencia', 'levonorgestrel 1,5', 'plan b', 'yuzpe', 'ulipristal',
     'diu de emergencia', 'doble dosis', 'relacion sin proteccion', 'violacion', 'pae', 'preservativo roto'],
    'La anticoncepción hormonal de emergencia (AHE) es la última oportunidad para evitar un embarazo después de una relación sin protección o de la falla de un método. En Argentina existe levonorgestrel 1,5 mg en un comprimido o 0,75 mg en dos. Otros métodos de emergencia: DIU de cobre (el más eficaz), método de Yuzpe y, no disponible en el país, acetato de ulipristal 30 mg.',
    diagnostico=[
        'Mecanismo del levonorgestrel: bloquea o retrasa la ovulación (inhibe el pico preovulatorio de LH) y espesa el moco cervical. No impide la implantación, no afecta el endometrio y no interrumpe ni daña un embarazo ya establecido: no es abortiva. Si se toma luego del pico de LH, no evita el embarazo.',
        'Eficacia: 95 % dentro de las primeras 12 horas, que baja con los días; 58 % entre las 49 y 72 horas; puede tomarse hasta las 120 horas (5 días) con menor efectividad. Protege solo la relación cercana a la toma.',
        'Quién puede usarla: sin riesgo y sin límite de edad ni de veces; no requiere examen físico ni laboratorio. Categorías 1 o 2 de la OMS (categoría 2: cardiopatía grave, migraña y enfermedad hepática grave). Solo no debe usarse con embarazo confirmado, pero puede darse ante la duda: no daña el embarazo ni produce malformaciones.',
        'Doble dosis (3 mg de levonorgestrel): IMC ≥ 30 o peso mayor de 80 kg (guía MSAL 2023, con evidencia controvertida); y con inductores del CYP450 (efavirenz, ritonavir, algunos antituberculosos y antiepilépticos, hierba de San Juan). El consenso FASGO 2021 usa umbrales más bajos: IMC ≥ 26 o peso ≥ 70 kg.',
        'DIU de cobre de emergencia: reduce el riesgo de embarazo en más del 99 %, se coloca dentro de los 5 días (120 horas) de la relación, no depende del IMC, no interactúa con fármacos y deja un método de larga duración. Requiere consejería previa, historia, especuloscopía y tacto bimanual. El consenso FASGO también incluye el SIU-LNG como método instrumental.',
        'Yuzpe (si no hay levonorgestrel), con píldoras combinadas en dos tomas separadas por 12 horas: 4 comprimidos de 30 µg de etinilestradiol (8 en total), 5 de 20 µg (10 en total) o 7 de 15 µg (14 en total). También se puede lograr 1,5 mg con 25 comprimidos de minipíldora de levonorgestrel 0,03 mg cada 12 horas (50 en total).',
        'Acetato de ulipristal 30 mg (modulador selectivo del receptor de progesterona): eficaz hasta 120 horas; no se encuentra disponible en Argentina.',
    ],
    tratamiento=[
        B('Cómo se indica',
          P('Dosis', 'Levonorgestrel 1,5 mg en una dosis única (la preferida: menos olvidos y efectos secundarios) o 0,75 mg dos comprimidos juntos o separados por 12 horas. Con un vaso de agua, lo antes posible.'),
          P('Doble dosis', '3 mg (dos comprimidos de 1,5 mg juntos) en obesidad, peso mayor de 80 kg o inductores enzimáticos.'),
          P('Vómitos', 'Si vomita dentro de las 2 horas, repetir la dosis; se pueden usar antieméticos.'),
          P('Entrega', 'Gratuita en hospitales y centros de salud, cubierta por obras sociales y prepagas (PMO) y de venta libre sin receta (Resolución 1062/2023). La persona tiene derecho a recibirla todas las veces que la pida y desde los 13 años en forma autónoma.')),
        B('Después de la AHE',
          P('Método regular', 'Puede iniciarse de inmediato cualquier método, incluso el DIU de cobre. Pastillas de solo progestágeno o AMPD: el mismo día, con respaldo hasta 7 días de tomas o de aplicado (2 días con minipíldora).'),
          P('Menstruación', 'El 50 % menstrúa en la fecha prevista, el 35 % antes y el 13 % tarda: hacer un test si el atraso supera una semana.'),
          P('ITS', 'No protege contra ITS ni VIH: ofrecer testeo basal de VIH, sífilis y hepatitis, y profilaxis posexposición dentro de las 72 horas si corresponde.'),
          P('Entrega anticipada', 'Dar la AHE por adelantado a quienes usan preservativo, ACO, ACI, AMPD y métodos naturales.')),
    ],
    seguimiento=[
        'Consultar si hay síntomas de embarazo o ausencia de menstruación; la AHE no siempre evita el embarazo ni protege de relaciones posteriores en el mismo ciclo.',
        'Si el embarazo se produjo, informar el derecho a la interrupción voluntaria o legal (Ley 27.610).',
        'El uso reiterado no es dañino, pero indica un método de uso regular inadecuado: conversar para cambiar a uno más eficaz y con el que la persona se sienta cómoda.',
    ],
    banderas=[
        'Ofrecerla siempre ante sexo sin protección, sin requerir consejería previa: toda persona del equipo de salud, médica o no, tiene la obligación de ofrecerla.',
        'Violación: AHE y profilaxis posexposición de VIH y otras ITS (urgencia, 72 horas); el DIU de emergencia solo si la persona quiere y puede transitar el procedimiento.',
        'No demorar: la efectividad cae con el tiempo. La AHE no es abortiva ni altera un embarazo ya establecido.',
    ],
    farmacos=['fx-levonorgestrel-ec'],
    algoritmo=dict(titulo='Relación sin protección o falla del método', nodos=[
        I('Relación con penetración pene-vagina sin protección, falla o uso incorrecto del método, expulsión del DIU o violación'),
        A('Ofrecer AHE de inmediato, sin requisitos ni examen previo; dar información sobre ITS'),
        D('¿Pasaron más de 120 horas (5 días)?',
          [A('El levonorgestrel pierde eficacia. Valorar el DIU de cobre dentro de los 5 días siguientes al día esperado de la ovulación y, si no corresponde, hacer un test de embarazo si falta la menstruación')],
          [D('¿Quiere y puede recibir un DIU de cobre (consejería, especuloscopía y tacto bimanual)?',
             [F('DIU de cobre: el método de emergencia más eficaz (> 99 %), independiente del IMC y sin interacciones; sigue como método de larga duración')],
             [A('Levonorgestrel 1,5 mg en dosis única, lo antes posible (95 % en las primeras 12 horas; 58 % entre las 49 y 72 horas)'),
              D('¿IMC ≥ 30, peso mayor de 80 kg o toma inductores enzimáticos (efavirenz, ritonavir, antiepilépticos, antituberculosos, hierba de San Juan)?',
                [A('Duplicar la dosis: 3 mg (dos comprimidos de 1,5 mg juntos)')],
                [A('Una sola dosis de 1,5 mg')]),
              A('Si vomita en las 2 horas siguientes, repetir la dosis'),
              F('Iniciar un método regular ya, entregar AHE y preservativos por adelantado y pautar test si hay demora de la menstruación')])]),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 7), folleto del Ministerio, consenso FASGO 2021 y revista AMAdA 2025, contra tu resumen', estado='difiere',
        puntos=[
            'Difiere: tu resumen duplica la dosis con «IMC ≥ 26 o peso ≥ 70 kg» (umbral del consenso FASGO 2021). La guía MSAL 2023 y el folleto vigente del Ministerio indican doblar con IMC ≥ 30 o peso mayor de 80 kg, reconociendo que la evidencia es escasa y controvertida y que se mantiene la recomendación mientras no haya más datos. La ficha muestra ambos umbrales.',
            'Difiere: «vomitó dentro de las 2 a 4 horas, repetir» — la guía y el folleto dicen dentro de las 2 horas. Y «sin contraindicaciones, categoría 1»: la OMS la clasifica en categorías 1 o 2 (cardiopatía grave, migraña y hepatopatía grave son categoría 2).',
            'Coincide: 1,5 mg en dosis única o 0,75 mg dos veces; 95 % en 12 horas y 58 % entre 49 y 72 horas; hasta 120 horas; mecanismo antiovulatorio y no abortivo; inductores del CYP450 y 3 mg; ulipristal no disponible en Argentina; DIU de cobre dentro de 120 horas con más de 99 % de eficacia y larga duración.',
            'Corrección: tu resumen presenta «Requiere descarte previo de ITS/sepsis» para el DIU de emergencia; la guía pide anamnesis, especuloscopía y tacto bimanual para evaluar los criterios de elegibilidad, no un estudio de ITS. Y la «falla menor de 0,1 %» no figura en la guía: dice «más del 99 %».',
            'Actualización: la OMS 2025 (revista AMAdA) revisa las píldoras de emergencia con inductores del CYP3A4, uso repetido en un ciclo y obesidad (el LNG puede ser menos eficaz con IMC ≥ 30; sin problemas de seguridad).',
        ]),
    fuente=fuente('Resumen del capítulo 7 de la guía MSAL 2023, del capítulo 10.1.3 (DIU de cobre en emergencia) y del folleto de adherencia de la AHE; el SIU-LNG como método instrumental, del consenso FASGO 2021.', R_F_AHE, R_FASGO, R_AMADA),
)

# ======================================================================= AQ
AQ = ficha(
    'mac-quirurgica', 'Anticoncepción quirúrgica: ligadura tubaria y vasectomía',
    ['anticoncepcion quirurgica', 'aq', 'ligadura tubaria', 'ligadura de trompas', 'lt', 'vasectomia', 'esterilizacion', 'ley 26130', 'ley 27655',
     'consentimiento informado', 'contracepcion quirurgica', 'salpingoclasia'],
    'Métodos anticonceptivos permanentes, en general irreversibles, que se hacen con cirugías sencillas. Ligadura tubaria (LT): oclusión bilateral de las trompas uterinas mediante ligadura, sección u obstrucción. Vasectomía: ligadura de los conductos deferentes a nivel escrotal.',
    diagnostico=[
        'Marco legal: Ley 26.130 (2006) de Contracepción Quirúrgica, modificada por la Ley 27.655 (2021): toda persona mayor de edad puede acceder con consentimiento informado por escrito. Es gratuita en el sistema público, obras sociales y prepagas (la Resolución 755/06 obliga a cubrir el 100 %).',
        'Edad: la guía MSAL 2023 aplica el artículo 26 del Código Civil y Comercial y la fija en 16 años («mayor de edad: es decir, 16 años»).',
        'No se pueden exigir requisitos que la ley no menciona: no hace falta haber tenido hijos, ni la conformidad del cónyuge o conviviente, ni autorización judicial. Las personas con discapacidad, sin excepción, consienten por sí mismas, con apoyos y ajustes razonables si los piden; con capacidad restringida por sentencia, el consentimiento se presta con el apoyo designado. Sustituir la voluntad es un delito.',
        'Consejería: información objetiva y completa sobre la práctica, la existencia de otros métodos (los LARC pueden ser una alternativa), la técnica quirúrgica, los riesgos, la efectividad y la reversibilidad (escasa y no gratuita). Si responde que podría querer más hijos, recomendar otro método. Sin presiones y con tiempo para pensar.',
        'LT: eficacia 99,5 %; no interfiere en las hormonas, ni en la menstruación o la ovulación, ni en el goce sexual. Reversión difícil, costosa y no garantizada; menos de 4 % solicita la recanalización; se puede recurrir a la fertilización asistida (Ley 26.862). No protege contra ITS.',
        'Vasectomía: eficacia mayor de 99,5 % si se usa otro método durante los 3 meses posteriores. Se eyacula semen sin espermatozoides. Complicaciones (1 a 2 %): hematomas e infección de la herida. Entre 2 y 4 % pide revertirla (éxito de embarazo del 16 al 85 %).',
        'Categorías para la cirugía (OMS 2015): A (aceptar), C (cuidado: rutina con preparación y precauciones adicionales), R (retrasar hasta evaluar o corregir; dar método temporal) y E (especial: personal experimentado y equipo para anestesia general).',
    ],
    tratamiento=[
        B('Ligadura tubaria',
          P('Cuándo', 'Cualquier momento con razonable certeza de no embarazo (de intervalo); usar un método seguro hasta la operación y hasta la menstruación siguiente. Posparto: dentro de los 7 días o después de los 42 días (OMS); conviene en las primeras 48 horas. También intracesárea (después de la histerorrafia y la hemostasia) o posaborto.'),
          P('Embarazo', 'No requiere cesárea: no condiciona la vía de terminación. La consejería y el consentimiento firmado se hacen en los controles prenatales; el hospital debe realizarla sin otro requisito.'),
          P('Vía', 'Minilaparotomía suprapúbica o laparoscopía en el intervalo; minilaparotomía infraumbilical en el posparto. Técnica: ligar, seccionar, clips o coagulación bipolar. Requiere anestesia general o peridural.'),
          P('Posoperatorio', 'Internación de 24 a 48 horas (alta el mismo día si es laparoscópica); reposo; evitar esfuerzos y relaciones durante una semana o hasta que cedan los dolores; control entre los 7 y 14 días.')),
        B('Vasectomía',
          P('Cuándo', 'En cualquier momento en que se solicite, luego del asesoramiento y el consentimiento.'),
          P('Técnica', 'Punción (sin bisturí) o pequeña incisión escrotal; anestesia local, ambulatoria, hasta unos 30 minutos.'),
          P('Después', 'Reposo 2 días, ropa ajustada, sin relaciones por al menos 3 días. La desaparición de los espermatozoides tarda 3 meses: usar otro método (y eyacular para eliminar los acumulados). Espermograma a los 3 meses si está disponible; no poder hacerlo no impide la práctica.')),
        B('Criterios de la cirugía (cuadro 11.1)',
          P('Aceptar', 'Nulípara, lactancia, posparto menor de 7 o mayor de 42 días, preeclampsia leve, tabaquismo, cefaleas, NIC, enfermedad benigna de la mama, hepatitis viral no activa, antecedente de EPI con embarazo posterior, vaginitis, mayor riesgo de ITS o VIH.'),
          P('Cuidado', 'Edad joven, obesidad (IMC > 30), HTA leve o tratada, antecedente de cardiopatía isquémica o ACV, epilepsia, miomas, EPI sin embarazo posterior, diabetes sin enfermedad vascular, anemia con Hb de 7 a 10 g/dl, cirugía previa, cáncer de mama actual.'),
          P('Retrasar', 'Embarazo, posparto de 7 a 42 días, preeclampsia grave o eclampsia, RPM de 24 horas o más, sepsis, hemorragia severa, trauma genital severo, TVP o embolia en curso, EPI o cervicitis en curso, hepatitis activa, hemoglobina menor de 7 g/dl, infección de la piel abdominal, sangrado vaginal sin diagnóstico, cáncer ginecológico a la espera de tratamiento.'),
          P('Especial', 'Cirrosis severa descompensada, trastornos de la coagulación, enfermedad pulmonar crónica, múltiples factores de riesgo cardiovascular, útero fijo, hernia, hipertiroidismo, LES con anticuerpos antifosfolípidos, TVP con anticoagulación, VIH grave o avanzado, tuberculosis pelviana, diabetes complicada, endometriosis.')),
    ],
    seguimiento=[
        'Informar las pautas de alarma: sangrado, tumoración, rubor, calor, dolor o pus en la herida; fiebre; desmayo o mareos; dolor abdominal intenso.',
        'Después de la cirugía no hace falta otro método para protegerse del embarazo (en la LT); en la vasectomía, tras los 3 meses.',
        'Ninguna de las dos protege contra ITS: seguir con el preservativo.',
    ],
    banderas=[
        'La anticoncepción quirúrgica no puede condicionarse: sin hijos previos, sin conformidad de la pareja y sin autorización judicial.',
        'Un método anticonceptivo seguro hasta el día de la operación y hasta la siguiente menstruación en la LT; 3 meses en la vasectomía.',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 11 y 14), contra tu resumen', estado='difiere',
        puntos=[
            'Difiere (importante para el examen): tu resumen dice «mayor de edad (18 años)». La guía MSAL 2023 dice «mayor de edad: es decir, 16 años», según el artículo 26 del Código Civil y Comercial, y el capítulo de adolescentes confirma que desde los 16 años pueden acceder a la anticoncepción quirúrgica. Prevalece la guía.',
            'Coincide: consentimiento informado escrito, sin autorización del cónyuge ni judicial ni exigencia de hijos; categorías A (aceptar), C (cuidado), R (retrasar) y E (especial); en la vasectomía hay que usar otro método los 3 meses o hasta confirmar azoospermia con espermograma.',
            'Se corrige: tu resumen menciona sólo la Ley 26.130. La guía agrega la modificación por la Ley 27.655 (2021), que garantiza que las personas con discapacidad consientan por sí mismas con apoyos, y la cobertura del 100 % (Resolución 755/06).',
        ]),
    fuente=fuente('Resumen del capítulo 11 de la guía MSAL 2023 (cuadros 11.1 y 11.2) y de los capítulos 14 y 16 para las edades y la ligadura posparto.'),
)

# ======================================================================= puerperio y posaborto
PUERPERIO = ficha(
    'mac-puerperio', 'Anticoncepción en el puerperio, la lactancia y el posaborto (AIPEO)',
    ['aipeo', 'anticoncepcion posparto', 'anticoncepcion en el puerperio', 'anticoncepcion en la lactancia', 'anticoncepcion posaborto', 'anticoncepcion inmediata posevento obstetrico',
     'diu posparto', 'diu intracesarea', 'implante posparto', 'lactancia y anticonceptivos', 'puerperio', 'posaborto'],
    'La anticoncepción inmediata posevento obstétrico (AIPEO) aprovecha la internación del parto, la cesárea o el aborto para ofrecer y colocar un método antes del alta. En Argentina casi 100 % de los partos son institucionales y la internación dura en promedio 48 horas (DEIS 2018).',
    diagnostico=[
        'Lactancia exclusiva: el bebé recibe solo leche humana (ni agua), 10 tomas cortas o 6 largas en 24 horas, de día y de noche. Casi exclusiva: otros líquidos o alimentos no superan el 10 % de lo ingerido.',
        'Ovulación: sin lactancia vuelve a las 4 a 6 semanas posparto; con lactancia exclusiva se prolonga la anovulación. El riesgo de embarazo aumenta con la primera menstruación, con la introducción de alimentos y con intervalos de 10 horas entre tomas. El riesgo de TEV es el mismo en quien amamanta y quien no, y vuelve a lo basal alrededor de las 6 semanas.',
        'Categorías OMS 2015 (cuadro 16.3). ACO, ACI, parche y anillo: lactancia exclusiva hasta 6 semanas → 4; de 6 semanas a 6 meses → 3; desde los 6 meses → 2. Sin lactancia: menos de 21 días → 3 (4 con otros factores de TEV); de 21 a 42 días → 2 (3 con otros factores); más de 42 días → 1.',
        'AOPS e implante: categoría 2 en las primeras 6 semanas con lactancia y categoría 1 después. AMPD: categoría 3 en las primeras 6 semanas con lactancia y 1 después. DIU de cobre (y SIU-LNG): menos de 48 horas → 1; entre 48 horas y 4 semanas → 3; más de 4 semanas → 1. La sepsis puerperal es categoría 4.',
        'Los LARC en el posevento obstétrico previenen embarazos a largo plazo sin acción de la usuaria, evitan una nueva consulta (oportunidad perdida) y reducen la repitencia del aborto. El estudio de un hospital público porteño (AMAdA 2025): 62,3 % de los nacimientos de 2024 fueron de embarazos no planificados y en el 84,6 % de ellos no había método previo; solo el 49 % recibió consejería durante el embarazo.',
        'Posaborto: la fertilidad se recupera pronto (ovulación entre los días 9 y 11 después de la evacuación en el primer trimestre y a las 4 semanas en el segundo). Ninguna condición posaborto contraindica un método: se puede elegir cualquiera según los CME.',
    ],
    tratamiento=[
        B('Métodos y momento de inicio en el puerperio (cuadro 16.1)',
          P('MELA y barrera', 'MELA y preservativos: inmediatamente. Diafragma: a las 6 semanas, midiéndolo de nuevo. Espermicidas: inmediatamente. Métodos naturales: tras 3 ciclos regulares.'),
          P('Sin estrógeno', 'Píldoras de solo progestágeno e implante: inmediatamente (categoría 2 con lactancia en las primeras 6 semanas). AMPD: desde las 6 semanas (categoría 3 antes), salvo que no amamante.'),
          P('Con estrógeno', 'ACO, parche, anillo y ACI: con lactancia a partir de los 6 meses; sin lactancia desde los 21 días (hasta los 42 días solo si no hay otros factores de TEV).'),
          P('DIU y AQ', 'DIU de cobre o SIU-LNG: dentro de las 48 horas posparto (de preferencia en los 10 minutos posalumbramiento o intracesárea) o desde la 4.ª semana. Ligadura tubaria: dentro de los 7 días; si no, esperar 6 semanas. Vasectomía: en cualquier momento. AHE: en cualquier momento.')),
        B('DIU posparto inmediato (DIUPP)',
          P('Expulsión', 'Más alta que en el intervalo (10 a 15 % frente a 1 %), pero compensada por la continuidad. Los hilos no se ven al inicio y bajan solos hacia la vagina; no traccionar.'),
          P('Contraindicado', 'Rotura de membranas de más de 18 horas, corioamnionitis, hemorragia posparto no resuelta o traumatismo genital extenso que se interrumpiría.'),
          P('Control', 'Entre las 4 y 6 semanas para verificar que no se expulsó.')),
        B('Posaborto: cuándo empezar',
          P('Inmediato', 'DIU (aborto del 1.er o 2.º trimestre sin infección; el séptico es categoría 4), implante, píldoras de solo progestágeno y AMPD (primer o segundo día), ACO (el mismo día o el siguiente), ACI (primer o segundo día), parche (mismo día o siguiente), preservativos.'),
          P('Con matiz', 'Anillo: simultáneo al inicio de las relaciones, con preservativo 7 días. Diafragma: inmediato en el 1.er trimestre; esperar unas 6 semanas en el 2.º. Ligadura tubaria como procedimiento de intervalo (1.er trimestre) o posparto (2.º), salvo infección o pérdida grave.'),
          P('Relaciones', 'Recomendar esperar a que cese el sangrado y desaparezcan los signos de infección antes de la penetración vaginal.')),
    ],
    seguimiento=[
        'La DNSSR recomienda que la persona se retire del alta con el método elegido, y dejar consejería, contrarreferencia y entrega periódica de métodos de corta duración.',
        'La consejería se hace idealmente durante los controles prenatales (también para elegir ligadura tubaria, DIU o implante) y se completa en la internación.',
    ],
    banderas=[
        'No colocar DIU entre las 48 horas y las 4 semanas posparto (categoría 3 por expulsión y perforación) ni en la sepsis puerperal (categoría 4).',
        'Evitar los estrógenos en las primeras 6 semanas posparto (categoría 4 con lactancia exclusiva).',
        'Elegir la ligadura tubaria no obliga a una cesárea.',
    ],
    algoritmo=dict(titulo='Elección en el puerperio', nodos=[
        I('Puérpera que quiere anticoncepción: consejería y elección propia, preferentemente desde el control prenatal'),
        D('¿Quiere un método de larga duración o la ligadura tubaria?',
          [A('Antes del alta: DIU (en los 10 minutos del alumbramiento, hasta 48 horas o intracesárea), implante, o ligadura tubaria (dentro de los 7 días, preferentemente en las primeras 48 horas)')],
          [D('¿Amamanta de forma exclusiva o casi exclusiva?',
             [A('MELA mientras cumpla sus tres condiciones, mejor combinado con minipíldora (o desogestrel si ya no cumple); implante inmediato; AMPD desde las 6 semanas'),
              F('Evitar los estrógenos hasta los 6 meses (categoría 3 de 6 semanas a 6 meses; 4 antes de las 6 semanas)')],
             [D('¿Pasaron 21 días y no tiene otros factores de riesgo de TEV?',
                [F('Los combinados pasan a categoría 2 (21 a 42 días) y a categoría 1 después de los 42 días')],
                [F('Elegir un método sin estrógeno (progestágeno solo, implante, DIU) o barrera: los combinados son categoría 3 o 4')])])]),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 16) y revista AMAdA 2025, contra tu resumen', estado='amplia',
        puntos=[
            'Coincide: la contraindicación de los estrógenos antes de las 6 semanas con lactancia exclusiva (categoría 4) y de las 6 semanas a los 6 meses (categoría 3); puerperio menor de 21 días sin lactancia con factores de TEV (categoría 4); DIU hasta 48 horas y después de 4 semanas.',
            'Se amplía: la guía aporta el cuadro completo por método y momento, la AIPEO, el DIUPP (posplacenta, 10 %–15 % de expulsión), el posaborto y las categorías 3 de los progestágenos solos.',
            'La OMS 2025 (revista AMAdA) refuerza la contraindicación de los combinados en las primeras 6 semanas y aclara el uso de progestágenos solos y DIU desde el posparto inmediato, incluso en lactancia exclusiva.',
        ]),
    fuente=fuente('Resumen del capítulo 16 de la guía MSAL 2023 (cuadros 16.1, 16.2 y 16.3) y del apartado 10.1.11. Complementa la revista AMAdA 2025, que incluye los datos de un hospital público de la Ciudad de Buenos Aires.', R_AIPEO, R_AMADA),
)

FICHAS_3 = [DIU_CU, SIU, AHE, AQ, PUERPERIO]
