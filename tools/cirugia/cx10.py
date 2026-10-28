# -*- coding: utf-8 -*-
"""UP10 · Enfermedad vascular periférica. Base: Giménez 2.ª ed. (2025), caps. 16 (isquemia arterial aguda), 17 (isquemia crónica), 18 (aneurismas de aorta y poplíteo), 20 (flebopatías) y 89 (cirugía endovascular)."""
from base import I, A, F, D, FG, FC

CONTENIDO = {}

# ---------------- isquemia arterial crónica / claudicación ----------------
CONTENIDO['cx-eami-claudicacion'] = dict(
    algoritmo=dict(titulo='Enfermedad arterial obstructiva crónica (consenso argentino y Giménez 2025)', nodos=[
        I('Claudicación intermitente, dolor de reposo, úlceras o gangrena: índice tobillo-brazo, eco-Doppler y evaluación del riesgo cardiovascular global'),
        A('Todos: dejar de fumar, estatina, antihipertensivos, control de la diabetes, ejercicio supervisado y antiagregación en sintomáticos'),
        D('¿Hay isquemia crítica (dolor de reposo, úlceras o gangrena) o claudicación limitante refractaria al tratamiento médico?',
          [A('Revascularización: endovascular (primera línea recomendada en el mundo: balones, stents, balones o stents con fármacos, aterectomía) o quirúrgica (bypass con vena autóloga o prótesis)'),
           F('Sin opción de revascularización la amputación llega al 40 % a los 6 meses; sumar cuidado avanzado de heridas en centros especializados')],
          [F('Tratamiento médico y control periódico')]),
    ]),
    fuente=FC('17', 'Isquemia arterial crónica (enfermedad arterial obstructiva crónica de los miembros inferiores)'),
)

# ---------------- isquemia arterial aguda ----------------
CONTENIDO['cx-isquemia-arterial-aguda'] = dict(
    algoritmo=dict(titulo='Isquemia arterial aguda de un miembro (Giménez 2025)', nodos=[
        I('Dolor súbito, palidez, frialdad, ausencia de pulsos, parestesias o déficit motor: valoración inmediata por el cirujano vascular para definir la viabilidad del miembro (diagnóstico fundamentalmente clínico)'),
        A('Heparina no fraccionada endovenosa apenas se sospecha, analgesia y protección del miembro'),
        D('¿El miembro es viable?',
          [A('Internación, anticoagulación y angiografía dentro de las primeras 24 horas para definir la terapéutica'),
           F('Revascularización según la causa: embolectomía con Fogarty, trombectomía, trombólisis dirigida o bypass')],
          [D('¿La viabilidad está amenazada?',
             [F('Emergencia vascular: llevar de inmediato al quirófano híbrido o a la sala de hemodinamia')],
             [F('Miembro no viable: amputación primaria dentro de las primeras 24 horas')])]),
        A('Todo paciente revascularizado pasa el posoperatorio en cuidados intensivos por el posible síndrome de revascularización (síndrome compartimental, mioglobinuria: fasciotomía si la isquemia fue prolongada)'),
    ]),
    fuente=FG('16', 'Isquemia arterial aguda de los miembros', 'La conducta inmediata y la reperfusión según el manual de la Universidad de Chile (2020).'),
)

# ---------------- aneurisma de aorta abdominal ----------------
CONTENIDO['cx-aneurisma-aorta-abdominal'] = dict(
    algoritmo=dict(titulo='Aneurisma de aorta abdominal y poplíteo (Giménez 2025)', nodos=[
        I('Dilatación de la aorta infrarrenal mayor de 3 cm (hombres exfumadores mayores de 65 años; detección temprana con ecografía en tabaquistas mayores de 65 años de ambos sexos)'),
        D('¿Está roto o sintomático?',
          [F('Cirugía urgente o EVAR de emergencia con hipotensión permisiva; alta mortalidad')],
          [D('¿Llegó a 55 mm, crece rápido o tiene síntomas?',
             [A('El equipo multidisciplinario decide con la anatomía, la clínica y las preferencias del paciente (decisión compartida)'),
              A('Abordaje de preferencia endovascular (EVAR): favorecen EVAR la edad avanzada, las comorbilidades y la cirugía abdominal previa; favorecen la cirugía abierta la edad joven, esperanza de vida mayor de 10 años, trastorno del tejido conectivo y anatomía no apta'),
              F('Seguimiento posoperatorio imprescindible para detectar endoleaks')],
             [F('Control periódico con ecografía y control de factores de riesgo (dejar de fumar)')])]),
        A('Aneurisma poplíteo (el más común de los periféricos, al menos el 70 %): tratar el asintomático de 2 cm o más por el riesgo de complicaciones isquémicas agudas y pérdida del miembro (excluirlo: dos abordajes quirúrgicos y uno endovascular)'),
    ]),
    diagnostico=[
        'Historia natural: crece hasta romperse; por eso se detecta temprano y se trata a los 55 mm. Población más afectada: hombres exfumadores mayores de 65 años.',
        'Aneurisma poplíteo: los asintomáticos de 2 cm o más se tratan por el alto riesgo de isquemia aguda y pérdida de la extremidad.',
    ],
    fuente=FG('18', 'Aneurisma de aorta abdominal y poplíteo', 'Vigilancia y rotura según el manual de la Universidad de Chile (2020).'),
)

# ---------------- trombosis venosa profunda ----------------
CONTENIDO['cx-trombosis-venosa-profunda'] = dict(
    algoritmo=dict(titulo='Trombosis venosa profunda', nodos=[
        I('Edema, dolor y aumento de volumen unilateral de un miembro: probabilidad clínica (Wells), dímero D y eco-Doppler venoso'),
        D('¿Se confirma una trombosis venosa profunda?',
          [A('Anticoagulación inmediata (heparina de bajo peso molecular o anticoagulantes orales directos) por al menos 3 meses según el factor desencadenante'),
           D('¿Hay contraindicación de anticoagulación o tromboembolismo pulmonar recurrente?',
             [F('Filtro de vena cava; trombolisis si hay TEP con inestabilidad')],
             [F('Seguimiento, medias de compresión y profilaxis perioperatoria futura según el riesgo')])],
          [F('Buscar otras causas del edema unilateral y repetir el estudio si la sospecha persiste')]),
    ]),
    fuente=FC('20', 'Flebopatías superficiales y profundas'),
)

# ---------------- insuficiencia venosa y várices ----------------
CONTENIDO['cx-insuficiencia-venosa-varices'] = dict(
    algoritmo=dict(titulo='Insuficiencia venosa crónica y várices', nodos=[
        I('Várices, edema, pesadez, trastornos tróficos o úlcera: eco-Doppler para definir el patrón de reflujo'),
        A('Medidas conservadoras: medias de compresión, elevación de los miembros, ejercicio y control del peso'),
        D('¿Hay síntomas persistentes, complicaciones o úlcera venosa?',
          [A('Intervención según el reflujo: escleroterapia, ablación endovenosa térmica o química, cirugía (safenectomía, flebectomías)'),
           F('Úlcera: compresión, curación avanzada y corrección del reflujo para evitar la recurrencia')],
          [F('Control y medidas conservadoras')]),
    ]),
    fuente=FC('20', 'Flebopatías superficiales y profundas'),
)

# ---------------- pie diabético ----------------
CONTENIDO['cx-pie-diabetico'] = dict(
    algoritmo=dict(titulo='Pie diabético', nodos=[
        I('Úlcera o lesión en el pie de un paciente diabético: examen de pulsos, neuropatía (monofilamento), clasificación de la herida y de la infección'),
        D('¿Hay infección (absceso, celulitis extensa, necrosis húmeda)?',
          [F('Antibióticos según la gravedad y drenaje o desbridamiento quirúrgico urgente de los abscesos')],
          [D('¿Hay isquemia crítica?',
             [F('Evaluación vascular y revascularización')],
             [F('Descarga de la presión, curación y control metabólico estricto')])]),
    ]),
    fuente=FC('17', 'Isquemia arterial crónica'),
)

NUEVAS = []
