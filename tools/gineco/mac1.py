# -*- coding: utf-8 -*-
"""Fichas de métodos anticonceptivos, bloque 1: marco general, MELA y métodos naturales, barrera, ACO y criterios de elegibilidad de los combinados."""
from mac_comun import *

# ======================================================================= marco
MARCO = ficha(
    'mac-marco', 'Métodos anticonceptivos: eficacia, criterios de elegibilidad de la OMS y consejería',
    ['mac', 'metodos anticonceptivos', 'planificacion familiar', 'indice de pearl', 'eficacia anticonceptiva', 'uso tipico', 'uso perfecto',
     'uso habitual', 'uso correcto', 'doble proteccion', 'larc', 'criterios de elegibilidad', 'cme oms', 'categorias oms', 'consejeria anticonceptiva',
     'anticoncepcion', 'ley 25673', 'practicas previas'],
    'Método anticonceptivo (MAC): método que permite evitar un embarazo no intencional. La eficacia se mide con el índice de Pearl: embarazos cada 100 mujeres o personas con capacidad de gestar (PCG) por año de uso; cuanto menor es el índice, más eficaz es el método. Uso correcto: embarazos con el uso perfecto del método. Uso habitual: embarazos en el uso real, con olvidos y errores. Es una tasa, no un porcentaje: Pearl = (embarazos × 1.200) ÷ meses de exposición.',
    diagnostico=[
        'Eficacia, embarazos cada 100 personas en el primer año (uso habitual / uso correcto; Trussell 2011, cuadro 4.2 de la guía): implante 0,05 / 0,05; DIU-LNG 0,2 / 0,2; DIU de cobre 0,8 / 0,6; vasectomía 0,15 / 0,1; ligadura tubaria 0,5 / 0,5; ACI 3 / 0,05; AMPD 6 / 0,2; ACO, parche y anillo 9 / 0,3; preservativo peneano 18 / 2; preservativo vaginal 21 / 5; diafragma 12 / 6; métodos químicos 28 / 18; métodos naturales 24 / 0,4 a 5.',
        'LARC (reversibles de larga duración): implante subdérmico, DIU de cobre y DIU o SIU de levonorgestrel. No dependen de la persona usuaria, por eso el uso habitual casi iguala al correcto, y son los más eficaces y con mayor continuidad de los reversibles.',
        'Doble protección: preservativo (peneano o vaginal) junto con otro método de alta eficacia. Los preservativos son los únicos MAC que además previenen ITS y VIH; ningún otro método protege.',
        'Criterios médicos de elegibilidad (CME) de la OMS: categoría 1, sin restricción (usar en cualquier circunstancia); categoría 2, las ventajas superan los riesgos (en general usar); categoría 3, los riesgos superan las ventajas (en general no se recomienda salvo que no haya otro método disponible o aceptado); categoría 4, riesgo inadmisible (no debe usarse).',
        'Con criterio clínico limitado las categorías se agrupan: 1 y 2 = sí usar el método; 3 y 4 = no usar. Las categorías 1 y 2 pueden ser manejadas por integrantes del equipo sin formación médica.',
        'Anticoncepción quirúrgica: no usa estas categorías sino A (aceptar), C (cuidado), R (retrasar) y E (especial); evalúan la seguridad de la cirugía, no del método.',
        'Cómo descartar un embarazo (certeza razonable, sin esperar la menstruación): menstruación típica y en fecha con un MAC bien usado; menstruación típica y sin relaciones desde la FUM; primeros 7 días de una menstruación normal; menos de 4 semanas de puerperio sin lactancia; o lactancia exclusiva con amenorrea y menos de 6 meses posparto. No hacer test de orina antes del primer día de atraso.',
    ],
    estudios=[
        'Prácticas previas (cuadro 4.3, OMS 2018): categoría A, esencial y obligatoria; B, contribuye sustancialmente y depende del contexto; C, apropiada como cuidado de la salud pero no contribuye al uso seguro y no debe demorar la entrega del método.',
        'Categoría A: consejería en todos los métodos; para el DIU, además, el examen bimanual y la especuloscopía (vagina sana).',
        'Se aconseja tomar la presión arterial antes de iniciar un método hormonal, pero no se niega el método si no se puede medir.',
        'Categoría C (no son requisito ni motivo para demorar o negar el método): Papanicolaou o colposcopía, examen mamario, laboratorio de rutina, pesquisa de ITS y ecografía. La consulta es una buena oportunidad para ofrecerlos, sin condicionar la entrega.',
    ],
    tratamiento=[
        B('Consejería: qué debe quedar claro',
          P('1 a 3', 'Cómo funciona el método, cuál es su eficacia y quién puede o no usarlo (criterios de elegibilidad).'),
          P('4 a 6', 'Uso correcto y esfuerzo que implica; efectos secundarios y qué hacer ante ellos; riesgos y beneficios para la salud.'),
          P('7 a 10', 'Signos de alarma y cómo reconsultar; interacciones medicamentosas; retorno de la fertilidad al suspender; cómo protegerse de las ITS, incluido el VIH.'),
          P('Adherencia', 'Quienes eligen luego de recibir información completa tienen mayor adherencia y continuidad, y la mayoría mejora el uso con la experiencia.')),
        B('Derechos y consentimiento',
          P('Ley 25.673', 'Programa Nacional de Salud Sexual y Procreación Responsable (2002): canasta gratuita de métodos en el sistema público, obras sociales y prepagas (PMO).'),
          P('Adolescentes', 'Desde los 13 años acceden a información y a todos los MAC reversibles sin compañía de adultos; la anticoncepción quirúrgica desde los 16 años. En menores de 15, escucha empática, información completa y recordar que puede haber violencia sexual no relatada.'),
          P('Consentimiento', 'MAC reversibles: consentimiento informado verbal, con constancia en la historia clínica. Anticoncepción quirúrgica: consentimiento informado firmado (Ley 26.130).'),
          P('Discapacidad', 'Mismos criterios de acceso; si la persona lo solicita se implementan medidas de apoyo y ajustes razonables, que nunca son una barrera.')),
        B('Entrega anticipada',
          P('AHE y preservativos', 'En quienes usan métodos dependientes de la usuaria (preservativo, ACO, ACI, AMPD) conviene entregar la AHE por adelantado, junto con preservativos.'),
          P('Varios meses', 'Se pueden entregar blísteres o ampollas para varios meses de manera segura.')),
    ],
    seguimiento=[
        'Con métodos hormonales: control de la tensión arterial una vez al año y consulta a los pocos meses de iniciar para resolver dudas y verificar el uso correcto.',
        'Las consultas por anticoncepción son una oportunidad para el Papanicolaou, el examen mamario y la consejería sobre ITS, sin condicionar la entrega del método.',
    ],
    banderas=[
        'No negar ni demorar un MAC por no tener Papanicolaou, laboratorio, ecografía o examen mamario (categoría C).',
        'No usar el test de embarazo en orina antes del primer día de atraso (falsos negativos) ni inmediatamente después de un aborto (falsos positivos durante 4 a 6 semanas).',
        'Persona que consulta por anticoncepción y es menor de 15 años: descartar situaciones de abuso o violencia.',
    ],
    algoritmo=dict(titulo='Cómo orientar la elección de un método', nodos=[
        I('Consejería completa y elección libre de la persona: eficacia, criterios de elegibilidad, uso, efectos, alarmas, interacciones, fertilidad y protección contra ITS'),
        D('¿Hay exposición a ITS o VIH?',
          [A('Preservativo peneano o vaginal en cada relación, solo o sumado a otro método (doble protección)')],
          [A('Elegir el método según eficacia y preferencia; ofrecer igualmente el preservativo')]),
        D('¿Los estrógenos están contraindicados (categoría 3 o 4) o está amamantando con menos de 6 meses de puerperio?',
          [A('Métodos sin estrógeno: píldoras de solo progestágeno, AMPD, implante, SIU-LNG o DIU de cobre')],
          [A('Puede elegir cualquier método, incluidos los combinados (píldora, inyectable mensual, parche o anillo)')]),
        D('¿Quiere un método de larga duración que no dependa de la memoria (LARC)?',
          [A('Implante (3 años), DIU de cobre (hasta 10 años) o SIU-LNG (5 años): menos de 1 embarazo cada 100 por año y reversibles de inmediato')],
          [A('Métodos de corta duración (píldoras, inyectables, parche, anillo o barrera), con AHE entregada por adelantado')]),
        D('¿Está en el posparto o el posaborto?',
          [A('Aprovechar la internación (AIPEO): DIU dentro de las 48 horas, implante, píldora de progestágeno solo o anticoncepción quirúrgica, y que se retire con el método')],
          [A('Indicar el método según la situación y pautar el seguimiento')]),
        F('Dejar constancia en la historia clínica de la información dada y del método elegido (consentimiento verbal; escrito en anticoncepción quirúrgica)'),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 4 y 5) y revista AMAdA 2025, contra tu resumen', estado='amplia',
        puntos=[
            'Coincide: definición de MAC, doble protección, fórmula e interpretación del índice de Pearl, uso correcto frente a habitual, definición de LARC y las cuatro categorías de la OMS con su versión simplificada.',
            'Coincide y se amplía: las prácticas A, B y C (el Papanicolaou, el examen mamario y el laboratorio son categoría C). Matiz: para la tensión arterial la guía solo dice «se aconseja» antes de un método hormonal y que no se niegue el método si no puede medirse; no la rotula como categoría A.',
            'Los datos de eficacia de tu resumen coinciden con el cuadro 4.2 de la guía (implante 0,05; SIU 0,2; DIU de cobre 0,6 a 0,8). La guía agrega las cifras de todos los métodos y los criterios para descartar un embarazo.',
            'Actualización: la OMS publicó la 6.ª edición de los CME el 3/11/2025. La guía MSAL 2023 todavía cita la 5.ª edición (2015). Según la revista AMAdA 2025 se mantienen la contraindicación (categoría 4) de los combinados con migraña con aura, hipertensión ≥160/100, trombofilia y TVP/TEP, y se refuerza no usar estrógenos en las primeras 6 semanas posparto; se amplía la vida útil de los DIU (cobre hasta 12 años y LNG hasta 8) pero en Argentina la ANMAT aprobó hasta 10 y 5 años según la guía MSAL 2023.',
        ]),
    fuente=fuente('Resumen de los capítulos 1, 2, 4, 5, 14 y 16 de la guía y del cuadro 4.2 de eficacia (Trussell 2011). Los CME citados son los de la OMS 2015, vigentes en la guía; la edición 2025 se comenta en el bloque de contraste. Material educativo: verificar con la guía vigente y el protocolo de la institución.', R_AMADA),
)

# ======================================================================= MELA y MBCF
MELA = ficha(
    'mac-mela-mbcf', 'Lactancia-amenorrea (MELA) y métodos basados en el conocimiento de la fertilidad',
    ['mela', 'metodo de lactancia y amenorrea', 'lactancia amenorrea', 'metodos naturales', 'mbcf', 'abstinencia periodica', 'ogino knaus', 'metodo del ritmo',
     'billings', 'moco cervical', 'temperatura basal', 'sintotermico', 'dias fijos', 'coito interrumpido', 'collar del ciclo'],
    'MELA: método temporal que aprovecha la infertilidad de la lactancia exclusiva con amenorrea. Métodos basados en el conocimiento de la fertilidad (MBCF o «métodos naturales»): se evita el coito vaginal, o se usa preservativo, durante los días fértiles del ciclo. Ninguno protege contra ITS ni VIH.',
    diagnostico=[
        'MELA, tres condiciones a la vez: lactancia exclusiva, amenorrea y menos de 6 meses posparto. Si cambia alguna y no se desea otro embarazo, hay que agregar otro método.',
        'Condiciones del amamantamiento: 10 tomas cortas o 6 largas en 24 horas, de día y de noche; los otros alimentos no superan el 10 % de lo que ingiere el bebé. Un solo intervalo de 10 horas, o intervalos frecuentes de más de 6 horas entre tomas, discontinúa el método.',
        'Eficacia del MELA: 98 % (2 embarazos cada 100) con uso correcto en los primeros 6 meses.',
        'No recomendar MELA si aparece la menstruación, el bebé tiene más de 6 meses, la lactancia no es exclusiva o tiene intervalos largos, hay consumo problemático de alcohol o drogas, o se usan ciertos fármacos (reserpina, ergotamina, antimetabolitos, cortisona, ciclosporina, bromocriptina, radiactivos, litio, algunos anticoagulantes).',
        'MBCF: la eficacia depende por completo de la persona y su pareja. Uso habitual: 24 embarazos cada 100 en el primer año; uso correcto: de 0,4 a 5 según el método. La tasa de falla es mayor en la adolescencia y la perimenopausia por los ciclos irregulares.',
        'Fisiología útil: la ovulación ocurre en promedio entre los días 14 y 16 (en ciclos regulares puede darse entre el día 7 y el 21); el óvulo puede ser fecundado durante unas 24 horas y los espermatozoides sobreviven hasta 7 días en las criptas cervicales.',
        'El coito interrumpido («acabar afuera») no es una opción segura en los períodos fértiles: su uso habitual tiene una alta tasa de falla.',
    ],
    fisiopatologia=[
        'Tras el parto caen el estrógeno y la progesterona y vuelve gradualmente la secreción de LH y FSH: sin lactancia la ovulación retorna a las 4 a 6 semanas posparto.',
        'En quien amamanta, la succión repetida del pezón desencadena reacciones hipotalámicas que aumentan la producción de leche y suprimen la acción de la LH (anovulación). Eso se mantiene mientras la lactancia sea exclusiva o casi exclusiva.',
        'Si no se amamanta de manera exclusiva, el riesgo de embarazo en los primeros 21 días es bajo, pero después aumenta y la ovulación puede ocurrir antes de la primera menstruación.',
    ],
    tratamiento=[
        B('MELA en la práctica',
          P('Inicio', 'Inmediatamente después del parto, con lactancia exclusiva o casi exclusiva.'),
          P('Plan B', 'Antes de que cambie una condición, decidir con qué método se sigue y entregarlo por anticipado. Desogestrel es una buena opción porque es anovulatorio y no obliga a cambiar cuando la lactancia deja de ser exclusiva.'),
          P('Refuerzo', 'Para aumentar la eficacia se recomienda combinarlo con otro método, por ejemplo la minipíldora de levonorgestrel.'),
          P('Ventajas', 'Promueve la lactancia, se usa de inmediato y está desvinculado del coito. Desventaja: la lactancia tan frecuente es difícil de sostener si se trabaja fuera del hogar.')),
        B('Métodos del calendario',
          P('Días fijos', 'Días fértiles del 8 al 19 del ciclo (se puede usar el «collar del ciclo»): en esos días, sin penetración pene-vagina o con preservativo.'),
          P('Ritmo (Ogino-Knaus)', 'Registrar los ciclos durante un año. Al ciclo más corto se le restan 18 días y al más largo 11. Ejemplo: ciclos de 26 y 32 días → abstenerse del día 8 al 21. Es el más efectivo de los métodos del calendario.'),
          P('Cuidado', 'Con precaución en la adolescencia y cuando los ciclos se vuelven menos frecuentes. Tras un parto o con lactancia, esperar al menos 3 menstruaciones ya regularizadas; tras un aborto, hasta la próxima menstruación.')),
        B('Temperatura basal',
          P('Técnica', 'Tomar la temperatura todos los días, por la mañana antes de levantarse y durante 5 minutos (rectal, vaginal u oral), y registrarla en un gráfico.'),
          P('Lectura', 'Después de la ovulación sube de 0,2 a 0,4 °C. Abstenerse desde el primer día del ciclo hasta el tercer día después de la elevación térmica; la fase infértil dura hasta la menstruación.'),
          P('No sirve', 'En trabajo nocturno, cuadros febriles y mujeres potencialmente anovuladoras (adolescencia y perimenopausia).')),
        B('Moco cervical (Billings) y sintotérmico',
          P('Billings', 'Después de la menstruación hay 2 a 3 días secos; luego aparece un moco blancuzco, turbio y pegajoso que se vuelve claro, transparente y elástico (como un hilo). El último día con ese aspecto es el ápice del moco: la ovulación ocurrió o está ocurriendo en ±24 horas. Período fértil: desde que aparece el moco hasta el cuarto día después del ápice.'),
          P('Evitar', 'Con infecciones cervicovaginales, secreciones por estímulo sexual y durante la lactancia.'),
          P('Sintotérmico', 'Combina temperatura basal, cambios del moco y del cuello uterino.')),
    ],
    seguimiento=[
        'Requieren entrenamiento, motivación y acuerdo con la pareja sobre la abstención o el uso de preservativo en los días fértiles.',
        'Ofrecer la AHE por adelantado para el uso incorrecto de un MBCF.',
    ],
    banderas=[
        'Los métodos naturales exigen negociar con la pareja: las desigualdades de género pueden generar presión o violencia sexual, que hay que visibilizar y abordar.',
        'Si el MELA deja de cumplirse (menstruación, suplementos, intervalos largos o más de 6 meses) y no se busca un embarazo, el riesgo aumenta: pasar de inmediato a otro método.',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 13 y 16.1.2.1), contra tu resumen', estado='difiere',
        puntos=[
            'Difiere: tu resumen pide «amenorrea después de los 56 días posparto» e «intervalos no mayores de 4 h de día y 6 h de noche». Esos números no figuran en la guía MSAL 2023, que define 10 tomas cortas o 6 largas en 24 horas, suplementos ≤ 10 % y la pérdida del método con un intervalo de 10 horas o intervalos frecuentes de más de 6 horas. Prevalece la guía.',
            'Coincide: los tres criterios del MELA (lactancia exclusiva, amenorrea, menos de 6 meses), la eficacia alta y que no protege contra ITS. La guía precisa 98 % (2 embarazos cada 100).',
            'Ritmo: la guía indica registrar los ciclos durante un año (tu resumen: 6 a 12 meses); los 18 y 11 días coinciden. Temperatura basal: sube 0,2 a 0,4 °C en la guía (tu resumen: 0,2 a 0,5). Viabilidad: óvulo unas 24 horas y espermatozoides hasta 7 días en las criptas cervicales (tu resumen: 12 a 24 horas y 72 a 96 horas).',
            'Corrección de la ficha de anticoncepción libre de estrógenos: el esquema «desde el día 30 posparto, al menos 4 veces por día, reemplazo cada 90 días hasta 1 año» del consenso FASGO 2021 describe el anillo vaginal de progesterona (no disponible en Argentina) y no el MELA. El MELA es el de esta ficha.',
        ]),
    fuente=fuente('Resumen de los capítulos 13 (métodos basados en el conocimiento de la fertilidad) y 16 (MELA) de la guía. Los fármacos que interfieren con el MELA y las contraindicaciones por VIH y hepatitis viral activa figuran en el apartado 16.1.2.1.', R_FASGO),
)

# ======================================================================= barrera
BARRERA = ficha(
    'mac-barrera', 'Métodos de barrera: preservativos, diafragma, espermicidas y campo de látex',
    ['preservativo', 'condon', 'preservativo masculino', 'preservativo femenino', 'preservativo peneano', 'preservativo vaginal', 'diafragma',
     'espermicida', 'nonoxinol', 'campo de latex', 'barrera', 'alergia al latex', 'doble proteccion', 'ets', 'its'],
    'Métodos que impiden por un mecanismo físico (con o sin espermicida) que los espermatozoides lleguen al útero. Los preservativos peneano y vaginal son los únicos métodos anticonceptivos que además previenen ITS y VIH, y la base de la doble protección.',
    diagnostico=[
        'Eficacia en el primer año (uso habitual / correcto): preservativo peneano 18 / 2; preservativo vaginal 21 / 5; diafragma 12 / 6; espermicidas 28 / 18. Requieren usarse en cada relación y tienen eficacia menor que los LARC y los hormonales.',
        'Preservativo peneano: funda de látex que se coloca sobre el pene erecto antes de la penetración. No necesita prescripción, es gratuito y no tiene efectos secundarios; puede usarse en el posparto y la lactancia. Previene ITS y VIH.',
        'El uso consistente reduce 60 a 80 % el riesgo de clamidia y gonococo. Protege menos contra herpes, VPH, sífilis y otras ITS de contacto con la piel no cubierta, y no evita las epizoonosis (piojo púbico, escabiosis).',
        'Elegibilidad del preservativo: sin contraindicaciones absolutas (ninguna condición es categoría 4). Alergia al látex natural: categoría 3 (no aplica a los preservativos «libres de látex»); alternativas: látex sintético o preservativo vaginal.',
        'Preservativo vaginal: funda tubular con un aro flexible en cada extremo, de material sintético (el FC2 es de látex sintético; el FC1 de poliuretano ya no se produce). Sin contraindicaciones, apto para alérgicas al látex.',
        'Diafragma: aro de goma cubierto por una membrana que tapa el cuello uterino; un profesional entrenado mide el tamaño y se usa siempre con espermicida (gel o crema). Categoría 3: antecedente de síndrome de shock tóxico, infección por VIH o alergia al látex (no aplica a los de plástico). Categoría 4: alto riesgo de VIH, por el uso conjunto con el espermicida.',
        'Espermicidas (nonoxinol-9, cloruro de benzalconio): surfactantes que rompen la membrana de los espermatozoides; de baja eficacia, suelen ser respaldo de otro método. El uso frecuente de nonoxinol-9 produce lesiones genitales que aumentan el riesgo de VIH.',
        'Campo de látex: no es anticonceptivo; sirve en el sexo oral (boca-vulva, boca-vagina o boca-ano) para reducir la transmisión de VIH y otras ITS. No se recomienda el papel film.',
    ],
    tratamiento=[
        B('Preservativo peneano: uso correcto',
          P('Cuándo', 'En cada acto sexual (vaginal, anal u oral), desde antes de cualquier contacto genital. Revisar fecha de vencimiento y estado del envase.'),
          P('Colocar', 'Sobre el pene erecto, apretando la punta para que no quede aire.'),
          P('Retirar', 'Inmediatamente después de eyacular y antes de que ceda la erección; hacer un nudo. Es descartable: no reutilizar. No usar dos juntos: aumenta la rotura por fricción.'),
          P('Lubricante', 'De base acuosa. Evitar aceites, vaselina, lociones, cremas y manteca: dañan el látex y anulan la eficacia. Los antimicóticos vaginales (miconazol, econazol) también dañan el látex.')),
        B('Preservativo vaginal y diafragma',
          P('Vaginal', 'Uno nuevo en cada relación; puede colocarse antes del juego sexual. No hace falta retirarlo de inmediato y no se reutiliza.'),
          P('Diafragma: tiempos', 'Colocarlo menos de 6 horas antes de la relación y retirarlo al menos 6 horas después (la guía menciona 6 a 8 horas), sin superar las 24 horas.'),
          P('Espermicida', 'En el borde, por ambas caras. Si pasó más de 1 hora desde que se aplicó el gel, o hay una nueva relación, agregar una dosis extra.'),
          P('Cuidados', 'Lavar con agua y jabón neutro, secar sin refregar y guardar con fécula de maíz (no talco). Mirarlo con luz potente para ver fisuras u orificios. Después de un parto o aborto del 2.º o 3.er trimestre, reusarlo a las 6 semanas y volver a medirlo.')),
    ],
    seguimiento=[
        'Entregar preservativos sin registro ni prescripción y en lugares visibles del centro de salud.',
        'Ofrecer la AHE por adelantado a quien usa barrera, por el riesgo de falla.',
    ],
    banderas=[
        'Preservativo roto, deslizado o salido, o diafragma desplazado o retirado antes de las 6 horas: anticoncepción hormonal de emergencia y considerar la profilaxis posexposición para VIH (dentro de las 72 horas).',
        '«Pareja estable» no equivale a «sexo seguro»: trabajar esas ideas en la consejería.',
        'Los diafragmas con espermicida y el uso repetido de nonoxinol-9 aumentan el riesgo de infección por VIH.',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 6), contra tu resumen', estado='difiere',
        puntos=[
            'Difiere: tu resumen indica «alergia al látex = categoría 4». Según la guía MSAL 2023 es categoría 3 (para preservativo de látex y diafragma de látex); los preservativos no tienen ninguna categoría 4. La categoría 4 del diafragma es el alto riesgo de VIH, por el espermicida.',
            'Difiere en el material: la guía describe el preservativo peneano como funda de látex y ofrece látex sintético o «libres de látex» a quien es alérgica; el vaginal actual (FC2) es de látex sintético y el de poliuretano (FC1) dejó de producirse. Tu resumen menciona poliuretano o poliisopreno.',
            'Coincide: permanencia del diafragma de al menos 6 horas y no más de 24; es el pilar de la doble protección; mecanismo de barrera. La guía agrega el uso de espermicida (dosis extra), el campo de látex y las cifras de eficacia.',
        ]),
    fuente=fuente('Resumen del capítulo 6 (métodos de barrera) y del capítulo 12 (métodos químicos) de la guía.'),
)

# ======================================================================= ACO
ACO = ficha(
    'mac-aco', 'Anticonceptivos orales combinados (ACO): uso, olvidos y beneficios',
    ['aco', 'pildora anticonceptiva', 'pastillas anticonceptivas', 'anticonceptivos orales combinados', 'pildora combinada', 'etinilestradiol', 'olvido de pastillas',
     'olvido de la pildora', 'beneficios no anticonceptivos', 'anticonceptivos hormonales combinados', 'ahc', 'monofasico', 'trifasico'],
    'Estrógeno (etinilestradiol 35, 30, 20 o 15 µg; valerato de estradiol 2 mg; 17β-estradiol 1,5 mg) más un gestágeno (ciproterona, levonorgestrel, desogestrel, norgestimato, gestodeno, drospirenona, dienogest o nomegestrol), de toma diaria. Blísteres de 21 comprimidos activos o de 28 (21 + 7 inactivos o 24 + 4 inactivos). Los monofásicos son los más usados.',
    diagnostico=[
        'Eficacia: uso habitual 9 embarazos cada 100 por año; uso correcto menos de 1 (3 por 1.000). Un método de corta duración. La fertilidad se recupera de inmediato al suspender y no aumenta.',
        'No protegen contra ITS ni VIH: recomendar preservativo.',
        'Pueden usarlos las personas sanas, jóvenes o mayores de 35 años no fumadoras. Las condiciones de categoría 3 y 4 están en la ficha «Anticoncepción hormonal combinada: criterios de elegibilidad».',
        'Con mala circulación o extremidades inmóviles (por ejemplo, silla de ruedas) hay mayor riesgo de TVP: evaluar contraindicarlos. En personas con dificultad para recordar la toma diaria se prefieren otros métodos.',
    ],
    fisiopatologia=[
        'El estrógeno exógeno inhibe con fuerza la FSH y el componente gestágeno inhibe el pico de LH: se detienen el desarrollo folicular, la ovulación y la formación del cuerpo lúteo (los folículos empiezan a crecer pero se atresian).',
        'El estrógeno estabiliza el endometrio y permite sangrados más regulares en la semana sin toma.',
        'No «ahorran» óvulos ni aumentan la fertilidad al suspenderlos. El efecto anticonceptivo se logra recién luego de 7 días de toma correcta.',
    ],
    estudios=[
        'Requisitos: consejería, historia clínica y control de la tensión arterial (OMS 2015). Si no se puede medir la presión, no se invalida el método: la morbimortalidad del embarazo es mayor.',
        'No son requisito ni motivo para postergar: análisis de sangre, Papanicolaou, ecografía, examen mamario o pélvico.',
    ],
    tratamiento=[
        B('Cómo se toma',
          P('21 comprimidos', 'Uno por día, a la misma hora. Al terminar, 7 días sin pastillas (aparece el sangrado) y reiniciar el 8.º día aunque siga sangrando.'),
          P('28 comprimidos', 'Uno por día sin pausa, empezando por los activos; los inactivos (4 o 7) corresponden a la semana del sangrado. El blíster siguiente se empieza al día siguiente.'),
          P('Descansos', 'No hace falta interrumpir la toma por meses para «descansar». En la semana sin pastillas la protección sigue si se tomaron bien los 7 comprimidos activos previos.'),
          P('Sangrado', 'Para retrasarlo, empezar el blíster siguiente sin pausa. Para adelantarlo, acortar (nunca prolongar) la pausa o los inactivos.')),
        B('Inicio y cambio de método',
          P('Cuándo', 'Idealmente el primer día de la menstruación (eficaz desde el inicio). Otro día: razonable certeza de no embarazo y preservativo durante 7 días (eficacia desde el comprimido n.º 8).'),
          P('Posaborto', 'El mismo día de la evacuación o al día siguiente, sin protección adicional.'),
          P('Posparto', 'Con lactancia, desde los 6 meses. Sin lactancia: menos de 21 días, categoría 3 (4 si hay otros factores de riesgo de TEV); entre 21 y 42 días, categoría 2 (3 con otros factores); más de 42 días, categoría 1.'),
          P('Cambios', 'A otro ACO con menos estrógeno: sin intervalo, saltando la semana libre. A AOPS: al día siguiente del último activo, sin respaldo. A implante o inyectable: de inmediato. A DIU: de inmediato, con preservativo hasta verificar su ubicación.')),
        B('Olvidos y situaciones especiales',
          P('1 comprimido activo', 'Tomarlo apenas se recuerda y seguir con el horario habitual, aunque se tomen dos juntos. No se altera la eficacia ni hace falta respaldo.'),
          P('2 o más', 'Tomar la última pastilla olvidada ya, seguir en el horario habitual y actuar según la semana (ver algoritmo). Entregar AHE por adelantado.'),
          P('Vómitos', 'Si vomita dentro de las 2 horas de una pastilla activa, tomar otra lo antes posible y seguir; el blíster termina un día antes.'),
          P('Diarrea', 'Preservativo durante los síntomas y 7 días más. Si dura más que los comprimidos activos, omitir la semana libre. Si los vómitos o la diarrea intensos duran 2 días o más, proceder como en un olvido.')),
        B('Beneficios para la salud (cuadro 8.2)',
          P('Protegen contra', 'Cáncer de endometrio, cáncer de ovario, cáncer de colon y enfermedad pélvica inflamatoria sintomática.'),
          P('Pueden proteger', 'De quistes ováricos y de la anemia por déficit de hierro.'),
          P('Reducen', 'Síndrome premenstrual, dismenorrea, problemas del sangrado menstrual, dolor de ovulación, vello excesivo, síntomas del síndrome de ovario poliquístico (sangrado irregular, acné, hirsutismo) y de la endometriosis.')),
    ],
    seguimiento=[
        'Pactar una consulta a los pocos meses para resolver dudas y verificar el uso correcto; luego control anual con tensión arterial. No hace falta control médico mensual: entregar varios blísteres.',
        'El sangrado irregular suele cesar luego de unos 3 ciclos. Consultar si continúa, aumenta o aparece después de un período regular.',
        'Efectos frecuentes: spotting inicial, cefalea (analgésicos; paracetamol preferentemente), mareos, náuseas, mastalgia, cambios de peso o ánimo, acné. Pequeño aumento de la presión que cae al suspender. Muy raros: TVP o embolia pulmonar; extremadamente raros: ACV e infarto.',
    ],
    banderas=[
        'Cualquier cefalea que empeore o aparezca con el método debe evaluarse (sospechar aura, ACV o hipertensión).',
        'Interacciones (cuadro 8.3, categoría OMS para ACO): rifampicina y rifabutina, anticonvulsivantes (fenitoína, carbamazepina, barbitúricos, primidona, topiramato, oxcarbazepina, felbamato, etosuximida) y lamotrigina son categoría 3; el ACI es categoría 2 para varios de ellos. Los ACO también pueden bajar la lamotrigina y provocar convulsiones. Antibióticos de amplio espectro, antifúngicos y antiparasitarios: categoría 1.',
        'Con rifampicina o anticonvulsivantes inductores es preferible usar otro método (el implante y las píldoras de solo progestágeno también se afectan; el DIU hormonal y el AMPD no).',
    ],
    farmacos=['fx-aco-combinado'],
    algoritmo=dict(titulo='Olvido de pastillas anticonceptivas combinadas', nodos=[
        I('Olvidó una o más pastillas activas del blíster'),
        D('¿Olvidó una sola pastilla activa?',
          [F('Tomarla lo antes posible y seguir en el horario habitual (aunque sean dos juntas): la eficacia no se altera y no necesita respaldo')],
          [A('Dos o más: tomar la última pastilla olvidada ya y seguir en el horario habitual (aunque sean dos juntas)'),
           D('¿El olvido fue en la primera semana?',
             [A('Agregar preservativo durante 7 días'),
              D('¿Tuvo relaciones sin otra protección en los últimos 5 a 7 días?',
                [F('Indicar además la AHE')],
                [F('No hace falta AHE')])],
             [D('¿Fue en la segunda semana?',
                [F('Preservativo durante 7 días')],
                [D('¿Fue en la tercera semana?',
                   [F('Preservativo 7 días y empezar el envase siguiente al día siguiente, sin la semana libre ni los comprimidos inactivos (no habrá sangrado en la fecha esperada)')],
                   [F('Cuarta semana de un blíster de 28 (comprimidos inactivos): no hay problema')])])])]),
    ]),
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 8.1) y Cuadro 8.1, contra tu resumen', estado='difiere',
        puntos=[
            'Coincide: composición y esquemas 21/7 y 24/4, inicio el primer día del ciclo sin respaldo, mecanismo (FSH por el estrógeno, pico de LH por el gestágeno), beneficios no anticonceptivos (endometrio, ovario, EPI; la guía agrega colon), interacciones con rifampicina, carbamazepina y fenitoína (topiramato y oxcarbazepina también), y la cautela en silla de ruedas.',
            'Difiere: tu resumen habla de un «margen de 12 horas» y de olvidos de «más de 24 a 48 horas». La guía no usa esos márgenes para los ACO: cuenta pastillas activas olvidadas (una: sin consecuencias; dos o más: se actúa según la semana). El margen de 12 horas pertenece al desogestrel.',
            'Se amplía el olvido de dos o más: primera semana con relaciones en los últimos 5 a 7 días, indicar AHE; segunda semana, preservativo 7 días; tercera semana, empezar el envase siguiente sin pausa. La guía sigue las recomendaciones de la FSRH (Reino Unido 2020).',
            'Sin sustento en la guía: la clasificación de los gestágenos por generaciones, los porcentajes de reducción del sangrado y la espera de 28 días tras suspender un inductor enzimático. No se incluyeron.',
        ]),
    fuente=fuente('Resumen del capítulo 8 (apartados 8.1 a 8.1.7, cuadros 8.1 a 8.3) de la guía MSAL 2023. Los olvidos siguen las guías FSRH 2020 citadas por la guía.'),
)

# ======================================================================= CME combinados
CME_COMB = ficha(
    'mac-cme-combinados', 'Anticoncepción hormonal combinada: criterios de elegibilidad (categorías 3 y 4)',
    ['contraindicaciones de los anticonceptivos combinados', 'contraindicaciones estrogenos', 'categoria 4', 'categoria 3', 'cme combinados', 'estrogenos contraindicados',
     'tabaquismo', 'migraña con aura', 'hipertension', 'tromboembolismo', 'lupus', 'lactancia', 'cirrosis', 'ahc', 'aco aci parche anillo'],
    'Los anticonceptivos hormonales combinados (ACO, ACI, parche y anillo) tienen estrógeno y comparten los criterios de elegibilidad, con pocas diferencias para el ACI. La guía MSAL 2023 reproduce los CME de la OMS 2015.',
    diagnostico=[
        'CATEGORÍA 4 (no usar): lactancia exclusiva y menos de 6 semanas posparto; posparto menor de 21 días sin lactancia y con otros factores de riesgo de TEV (antecedente de TVP, trombofilia, inmovilidad, transfusión en el parto, IMC > 30, hemorragia posparto, poscesárea inmediato, preeclampsia, tabaquismo).',
        'Categoría 4 (cardiovascular): mayores de 35 años que fuman más de 15 cigarrillos por día; múltiples factores de riesgo cardiovascular arterial importantes (fumadora, diabética, hipertensa, mayor de 40); hipertensión con valores ≥ 160/100 o con enfermedad vascular; cardiopatía isquémica actual o pasada; ACV actual o pasado; valvulopatía complicada.',
        'Categoría 4 (tromboembolismo): TVP o embolia pulmonar actual o antecedente, con o sin anticoagulación; cirugía mayor con inmovilización prolongada; mutaciones trombogénicas (factor V de Leiden, protrombina, déficit de proteína S, C o antitrombina); LES con anticuerpos antifosfolípidos positivos o desconocidos.',
        'Categoría 4 (otras): migraña con aura a cualquier edad; migraña sin aura en mayores de 35 años que continúan el método; cáncer de mama actual; hepatitis viral aguda (al iniciar); cirrosis descompensada; tumores hepáticos (adenoma hepatocelular y hepatocarcinoma); diabetes de más de 20 años o con nefropatía, retinopatía, neuropatía u otra enfermedad vascular (según la severidad).',
        'CATEGORÍA 3 (en general no usar, salvo que no haya otro método): lactancia entre las 6 semanas y los 6 meses; posparto menor de 21 días sin lactancia y sin otros factores de TEV; mayores de 35 años que fuman menos de 15 cigarrillos por día; múltiples factores de riesgo cardiovascular (según severidad).',
        'Categoría 3 (hipertensión y migraña): antecedente de hipertensión sin poder evaluar la presión (incluye hipertensión del embarazo); hipertensión adecuadamente controlada; presión elevada de 140-159 / 90-99; migraña sin aura en menores de 35 años que inicia migraña con el método, o en mayores de 35 al iniciarlo.',
        'Categoría 3 (otras): cáncer de mama pasado sin enfermedad por al menos 5 años; diabetes con complicaciones o con otra enfermedad vascular (según severidad); patología vesicular sintomática en tratamiento; antecedente de colestasis por ACO; hepatitis aguda o su exacerbación al iniciar; rifampicina, rifabutina, anticonvulsivantes inductores (fenitoína, carbamazepina, barbitúricos, primidona, topiramato, oxcarbazepina) y lamotrigina.',
        'Diferencias del ACI (la OMS da categoría distinta): patología vesicular sintomática, antecedente de colestasis por ACO, interacciones con rifampicina y anticonvulsivantes y fumadora ≥ 35 años con menos de 15 cigarrillos pasan de categoría 3 (ACO) a 2 (ACI); cirrosis descompensada, adenoma hepático y fumadora ≥ 35 años con más de 15 cigarrillos pasan de categoría 4 a 3.',
        'Obesidad: según la OMS 2025 (AMAdA), IMC > 30 es categoría 2 para los combinados y no limita los LARC ni los progestágenos.',
    ],
    tratamiento=[
        B('Alternativas cuando los estrógenos no se pueden usar',
          P('AOPS e implante', 'Categorías 1 y 2 en: posparto inmediato con o sin lactancia, fumadora mayor de 35, múltiples factores de riesgo cardiovascular, hipertensión, antecedente de TVP/TEP, cirugía mayor con inmovilización, valvulopatía complicada, mutaciones trombogénicas, migraña, diabetes complicada, patología vesicular y colestasis por ACO. Categoría 4 solo en cáncer de mama actual.'),
          P('Categoría 3 para progestágenos', 'TVP/TEP en curso; cardiopatía isquémica, ACV o migraña con aura que aparecen durante el uso; cáncer de mama pasado con menos de 5 años; cirrosis grave; adenoma y tumores malignos del hígado; LES con anticuerpos antifosfolípidos. En el implante, además, sangrado vaginal sin diagnosticar.'),
          P('DIU', 'Se puede usar en condiciones en las que no se pueden usar otros anticonceptivos (hipertensión, tabaquismo, lactancia, migraña, trombosis), independientemente de la edad y del peso.')),
    ],
    banderas=[
        'Migraña con aura: contraindica los combinados a cualquier edad (riesgo de ACV isquémico).',
        'Fumadora de 35 años o más con 15 o más cigarrillos por día: categoría 4 (la guía escribe «más de 15»; la OMS 2015 usa ≥ 15).',
        'Tensión arterial ≥ 160/100 o hipertensión con enfermedad vascular: categoría 4. Entre 140-159/90-99: categoría 3.',
    ],
    contraste=dict(
        fuente='Guía MSAL 2023 (cap. 8.1.5 y 8.2.5) y revista AMAdA 2025, contra tu resumen', estado='coincide',
        puntos=[
            'Coincide casi todo: tabaquismo ≥ 35 años y > 15 cigarrillos, HTA ≥ 160/100, TVP/TEP, cirugía mayor con inmovilización, mutaciones trombogénicas, cardiopatía isquémica y ACV, migraña con aura, cáncer de mama, LES con anticuerpos antifosfolípidos, lactancia < 6 semanas (categoría 4) y 6 semanas a 6 meses (categoría 3), puerperio < 21 días con factores de TEV, hepatopatía grave.',
            'Coincide la diferencia del ACI: la patología vesicular y la colestasis previa son categoría 2 para ACI (3 para ACO) y la cirrosis descompensada y el adenoma son categoría 3 para ACI (4 para ACO).',
            'Se amplía: valvulopatía complicada, múltiples factores de riesgo cardiovascular, diabetes complicada y migraña sin aura mayor de 35 años que continúa (categoría 4); y las condiciones de categoría 3.',
            'Matiz: la «hepatitis viral aguda» es categoría 4 para iniciar el método, no para continuarlo. La «cirugía mayor planificada» contraindica el método solo si requiere inmovilización prolongada. Tu resumen no cita el IMC: la OMS 2025 lo mantiene en categoría 2.',
        ]),
    fuente=fuente('Resumen de los apartados 8.1.5 y 8.2.5 y del capítulo 9 (alternativas sin estrógeno) de la guía. Categorías de la OMS 2015; la edición OMS 2025 se menciona según la revista AMAdA.', R_AMADA),
)

FICHAS_1 = [MARCO, MELA, BARRERA, ACO, CME_COMB]
