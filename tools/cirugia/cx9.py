# -*- coding: utf-8 -*-
"""UP9 · Trauma, quemaduras y procuración. Base: Giménez 2.ª ed. (2025), caps. 75 (quemaduras), 76 (atención inicial del traumatizado), 78 (traumatismos torácicos), 79 (traumatismos abdominopelvianos) y 94 (procuración y trasplante)."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- evaluación primaria ----------------
CONTENIDO['cx-trauma-evaluacion-primaria'] = dict(
    algoritmo=dict(titulo='Atención inicial del traumatizado: A\'ABCDEF (Giménez 2025)', nodos=[
        I('El traumatismo es una enfermedad dependiente del tiempo: atención en equipo, con guías de acción y EFAST en el manejo inicial'),
        A('A\': prevenir y controlar la hemorragia externa. A: vía aérea con control de la columna cervical; reconocer a quien necesita una vía aérea definitiva y tener un plan alternativo si falla la intubación (el operador debe estar preparado para una vía aérea quirúrgica)'),
        A('B: reconocer las seis entidades torácicas que amenazan la vida'),
        A('C: condición hemodinámica, descartar focos hemorrágicos y reanimación selectiva según cada caso'),
        A('D: deterioro neurológico, lesiones que requieren descompresión craneal y prevención de lesiones cerebrales secundarias. E: exponer por completo al paciente para no dejar lesiones inadvertidas (la secuencia de Giménez es A\'ABCDEF)'),
        D('¿Hay inestabilidad persistente o lesiones que superan los recursos del centro?',
          [F('Derivar a un centro de trauma')],
          [F('Evaluación secundaria y reevaluación continua')]),
    ]),
    diagnostico=[
        'La asistencia a través de un equipo y la secuencia A\'ABCDEF disminuyen la morbimortalidad del traumatizado. Es una enfermedad dependiente del tiempo.',
        'A: reconocer la vía aérea definitiva y el plan B; B: seis lesiones torácicas que amenazan la vida; C: hemodinamia y focos hemorrágicos; D: neurológico (Glasgow); E: exposición completa para no dejar lesiones inadvertidas.',
    ],
    fuente=FG('76', 'Atención inicial hospitalaria de pacientes traumatizados', 'ABC detallado, derivación y reposición según el manual de la Universidad de Chile (2020).'),
)

# ---------------- shock hemorrágico ----------------
CONTENIDO['cx-shock-hemorragico'] = dict(
    algoritmo=dict(titulo='Shock hemorrágico en el trauma', nodos=[
        I('Hipotensión, taquicardia, palidez o alteración de conciencia tras un trauma: buscar la fuente (tórax, abdomen, pelvis, huesos largos y externa) con EFAST y radiografías'),
        A('Hemostasia inmediata: presión directa, torniquete, fijación pélvica'),
        A('Resucitación hemostática: hemoderivados en relación equilibrada con hipotensión permisiva hasta el control, evitando el exceso de cristaloides; ácido tranexámico precoz según protocolo; prevenir hipotermia, acidosis y coagulopatía (tríada letal)'),
        D('¿Responde a la reanimación?',
          [F('Continuar la evaluación y el tratamiento definitivo de las lesiones')],
          [F('Control quirúrgico o endovascular de la fuente de inmediato (laparotomía, toracotomía, embolización)')]),
    ]),
    fuente=FC('76', 'Atención inicial hospitalaria de pacientes traumatizados'),
)

# ---------------- trauma de tórax ----------------
CONTENIDO['cx-trauma-torax'] = dict(
    algoritmo=dict(titulo='Traumatismo torácico grave (Giménez 2025)', nodos=[
        I('Dificultad respiratoria o hipotensión tras un trauma torácico (responsable del 25 al 50 % de las muertes por trauma): evaluación primaria y EFAST'),
        D('¿Neumotórax a tensión?',
          [F('Descompresión inmediata con aguja y luego tubo pleural')],
          [D('¿Hemotórax masivo o débito persistente?',
             [F('Tubo pleural y toracotomía si el débito inicial es masivo o persistente')],
             [D('¿El paciente llega con signos vitales presentes o paro presenciado inmediatamente antes (herida cardíaca penetrante, taponamiento)?',
                [F('Toracotomía de emergencia: liberar el taponamiento y suturar la herida cardíaca, controlar la hemorragia, clampear el hilio o la aorta torácica descendente, masaje cardíaco abierto; contraindicada si no hay signos vitales en el trauma torácico cerrado o penetrante')],
                [F('Tórax inestable: analgesia, oxigenación y ventilación asistida si hay insuficiencia respiratoria')])])]),
    ]),
    fuente=FG('78', 'Traumatismos torácicos', 'Tubo pleural y tórax inestable según el manual de la Universidad de Chile (2020).'),
)

# ---------------- trauma abdominal ----------------
CONTENIDO['cx-trauma-abdominal'] = dict(
    algoritmo=dict(titulo='Traumatismo abdominopélvico (Giménez 2025)', nodos=[
        I('Trauma abdominopélvico: lo que se jerarquiza es el estado hemodinámico y la presencia de peritonismo; ecografía (EFAST) y radiografía de tórax'),
        D('¿Está inestable o tiene peritonismo (reacción peritoneal) o neumoperitoneo?',
          [F('Laparotomía exploradora (control de daños), incluso con el paciente compensado si hay peritonismo o neumoperitoneo por posible perforación de víscera hueca')],
          [A('TC de abdomen y pelvis con contraste y laboratorio'),
           D('¿Lesión de víscera maciza (hígado, bazo, riñón) en un paciente compensado sin lesiones asociadas?',
             [A('Tratamiento no operatorio según la clasificación AAST y la hemodinamia; embolización selectiva si hay sangrado arterial, fístula arteriovenosa, seudoaneurisma o hematuria macroscópica que no cede'),
              F('Riñón: privilegiar gestos que preserven el órgano (rafia, nefrectomía parcial) si se opera; la lesión de la vena renal siempre se explora')],
             [F('Penetrante: laparotomía si hay peritonitis, inestabilidad o evisceración; exploración selectiva en el estable')])]),
    ]),
    fuente=FG('79', 'Traumatismos abdominopelvianos', 'Penetrante y estable: manual de la Universidad de Chile (2020).'),
)

# ---------------- restricción espinal ----------------
CONTENIDO['cx-restriccion-espinal'] = dict(
    algoritmo=dict(titulo='Restricción del movimiento espinal (consenso intersocietario 2021)', nodos=[
        I('Paciente traumatizado con posible lesión de columna: evaluar el mecanismo y la clínica; no es una indicación automática'),
        D('¿Hay indicación de restricción según el mecanismo y la evaluación clínica?',
          [A('Collar cervical de tamaño apropiado para limitar el movimiento cervical'),
           A('Tabla larga como ayuda para la extracción y el traslado, no como inmovilización prolongada'),
           F('Retirar la tabla lo antes posible en el servicio de urgencias')],
          [F('Sin restricción rutinaria; reevaluar si cambia el cuadro')]),
    ]),
    fuente=FC('76', 'Atención inicial hospitalaria de pacientes traumatizados'),
)

# ---------------- quemaduras ----------------
CONTENIDO['cx-quemaduras'] = dict(
    algoritmo=dict(titulo='Paciente quemado (Giménez 2025)', nodos=[
        I('Quemadura: evaluar extensión, profundidad, edad y localización (Índice de Garcés); vía aérea y posible lesión por inhalación'),
        D('¿Hay sospecha de lesión por inhalación o de intoxicación por monóxido?',
          [A('Oxígeno al 100 % con máscara desde el inicio; ante la duda, laringoscopia e intubación temprana')],
          [A('Vía aérea sin compromiso: vigilar')]),
        D('¿Es una quemadura grave (gran superficie, cara, manos, genitales, circunferencial, eléctrica, química, extremos de edad)?',
          [A('Internarlo en el lugar correcto (unidad de quemados); en las primeras 24 horas: emergencia respiratoria, hidratación con Parkland (3 a 4 mL × kg × % de superficie quemada, la mitad en las primeras 8 horas), monitorización y curaciones'),
           D('¿Hay compromiso circulatorio o ventilatorio por quemadura circunferencial o de compartimentos?',
             [F('Escarotomía o fasciotomía: las únicas urgencias quirúrgicas del quemado')],
             [F('Control del dolor, eliminación del tejido muerto, prevención de secuelas y nutrición enteral precoz')])],
          [F('Quemadura menor: tratamiento ambulatorio con limpieza, analgesia y curaciones; prevención en el hogar')]),
    ]),
    diagnostico=[
        'Los objetivos son controlar el dolor, eliminar el tejido muerto, reducir el riesgo de secuelas y recuperar la función. La mayoría de las quemaduras son menores y curan rápido en el hogar; las graves requieren centros especializados.',
        'La evaluación considera extensión, profundidad, edad y localización (Índice de Garcés). Lo más importante en un gran quemado es internarlo en el lugar correcto.',
    ],
    banderas=[
        'Las únicas urgencias quirúrgicas del quemado son la escarotomía y la fasciotomía.',
        'Sospecha de intoxicación por monóxido: oxígeno al 100 % desde el inicio.',
        'La prevención (hogar, niños y adultos mayores) es el punto más importante.',
    ],
    fuente=FG('75', 'Quemaduras', 'Parkland detallado y criterios de derivación según el manual de la Universidad de Chile (2020).'),
)

# ---------------- procuración y muerte encefálica ----------------
CONTENIDO['cx-procuracion-muerte-encefalica'] = dict(
    algoritmo=dict(titulo='Procuración de órganos (Ley 27.447 y Giménez 2025)', nodos=[
        I('Paciente con lesión encefálica grave en terapia intensiva y signos de muerte encefálica: detectar al potencial donante y notificar al organismo provincial o al INCUCAI (la falta de denuncia es la principal causa de escasez de órganos)'),
        A('Certificar la muerte por criterios neurológicos: cese irreversible y permanente de todas las funciones encefálicas, aunque exista actividad cardiocirculatoria, por métodos clínicos e instrumentales; no confundir con coma ni estado vegetativo permanente (la persona está viva)'),
        D('¿Se certificó la muerte y la persona no manifestó su oposición (donante presunto, mayor de 18 años)?',
          [A('Entrevista a la familia por un profesional entrenado, con empatía y claridad; mantener el soporte del donante hasta la ablación'),
           F('Ablación multiorgánica y trasplante coordinados por el INCUCAI')],
          [F('Si no hay donación ni ablación, suspender las medidas de soporte artificial una vez certificada la muerte')]),
    ]),
    fuente=FC('94', 'Procuración y trasplante de órganos'),
)

NUEVAS = []
