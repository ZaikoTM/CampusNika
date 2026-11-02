# -*- coding: utf-8 -*-
"""Psicologia de la catedra (UP2 y UP7): estres preoperatorio, estres quirurgico, estres laboral y burnout.
Fuentes de la carpeta QUINTO AÑO\\Cirugia 2025\\bibliografia: Giacomantone y Mejia (estres preoperatorio y riesgo quirurgico), Correa Padilla (2013),
Calabrese (2006) y Gatto (desgaste psiquico en el equipo de salud)."""
from base import I, A, F, D
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []
U2 = 'UP2 · Abdomen agudo'
U7 = 'UP7 · Tumoración cervical'

def nueva(up, unidad, *a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = [up]; d['unidad'] = unidad; NUEVAS.append(d)

def fuente(guia, sociedad, anio, archivo, nota=''):
    return {'guia': guia, 'sociedad': sociedad, 'anio': anio, 'archivo': archivo, 'tipo': 'libro',
            'nota': ('Bibliografía esencial de la unidad (psicología). ' + nota).strip()}

nueva('cx2', U2, 'cx-estres-preoperatorio-adaptacion', 'Estrés preoperatorio y adaptación psicológica a la cirugía',
 ['estres preoperatorio', 'ansiedad preoperatoria', 'adaptacion preoperatoria', 'riesgo quirurgico psicologico', 'selye', 'sindrome general de adaptacion', 'mecanismos de defensa'],
 'Situación de estrés psicológico que genera la enfermedad, la internación en un ambiente extraño y el conocimiento (real o imaginado) de los peligros de la anestesia y la cirugía. Obliga a movilizar recursos emocionales para adaptarse en el pre y el posoperatorio, y esa adaptación no siempre es exitosa.',
 ['Una adaptación normal siempre supone cierto grado de ansiedad preoperatoria (angustia-señal ante la amenaza); los mecanismos de defensa (negación y otros) actúan de manera variada y flexible, y el paciente puede manejar la ansiedad, elaborar y aceptar la realidad y responder adecuadamente.',
  'En la adaptación patológica se usan de forma rígida y estereotipada unas pocas defensas que no controlan bien la ansiedad o distorsionan la realidad. Los grupos descriptos son la reacción paranoide y las defensas maníacas, exitosas o fallidas.',
  'La personalidad es el factor determinante: los pacientes con personalidad patológica (paranoide, narcisista, borderline, rasgos maníacos) tuvieron un riesgo 10 veces mayor de presentar una adaptación preoperatoria patológica. En la adaptación normal predominan antecedentes neuróticos.',
  'La cirugía de urgencia sin tiempo para anticipar el peligro puede producir un estrés postraumático agudo (angustia automática, recuerdos y pesadillas repetidos, síntomas somáticos que remedan complicaciones como angina o tromboembolismo pulmonar); cede en pocas semanas, en general durante el primer mes, y si dura más de tres meses es crónico.'],
 ['Evaluación psicológica preoperatoria con historia evolutiva y personal (conductas habituales ante los acontecimientos vitales y situaciones traumáticas) y antecedentes psiquiátricos. Ante manifestaciones somáticas de angustia en el posoperatorio, la evaluación del estado psicológico ayuda al diagnóstico diferencial con complicaciones orgánicas.'],
 [{'titulo': 'Conducta', 'pasos': [
    {'etiqueta': 'Reconocer el riesgo', 'texto': 'Identificar a los pacientes con adaptación patológica (personalidad patológica, defensas rígidas, reacción paranoide o defensas maníacas) mediante la historia evolutiva y los antecedentes psiquiátricos.'},
    {'etiqueta': 'Estrés postraumático agudo', 'texto': 'Es de carácter transitorio y de pronóstico favorable, con recuperación sin secuelas, sobre todo si se trata de forma temprana (las medidas terapéuticas se desarrollan en los capítulos 10 y 11 del libro).'}]}],
 ['Seguimiento de la evolución emocional en el posoperatorio y de los síntomas de estrés postraumático agudo en la cirugía de urgencia.'],
 ['Los síntomas somáticos de angustia pueden simular una complicación quirúrgica orgánica: evaluar también el estado psicológico.', 'Los pacientes con personalidad patológica tienen 10 veces más riesgo de una adaptación preoperatoria patológica.'],
 dict(titulo='Estrés preoperatorio (Giacomantone y Mejía)', nodos=[
   I('Paciente que va a ser operado o está en el posoperatorio con ansiedad o síntomas inexplicables'),
   A('Evaluar la adaptación: flexibilidad de las defensas, personalidad y antecedentes psiquiátricos'),
   D('¿Defensas rígidas, reacción paranoide, defensas maníacas o personalidad patológica?',
     [F('Adaptación patológica (mayor riesgo psicológico): requiere abordaje específico antes y después de la cirugía')],
     [D('¿Síntomas somáticos posoperatorios (dolor torácico, disnea) sin hallazgo orgánico?',
        [F('Pensar en estrés postraumático agudo o equivalentes de angustia, sin dejar de descartar la complicación orgánica')],
        [F('Adaptación normal: ansiedad esperable; informar y acompañar')])])]),
 fuente('Estrés preoperatorio y riesgo quirúrgico, caps. 1, 5, 9 y 10', 'G. Giacomantone y R. Mejía (Argentina)', 's. f.', 'Estres preoperatorio y riesgo quirúrgico - Giacomantone Mejía.pdf',
        'Libro de la bibliografía esencial de UP2; el programa lo cita como 1994 y el texto menciona bibliografía de 1995, por eso se deja sin año de edición.'))

nueva('cx2', U2, 'cx-estres-quirurgico-respuesta-metabolica', 'Estrés quirúrgico y respuesta del organismo a la lesión',
 ['estres quirurgico', 'respuesta al estres', 'respuesta endocrino metabolica', 'selye', 'anestesia peridural', 'cortisol'],
 'Respuesta inconsciente al daño tisular, expresada por cambios autonómicos, metabólicos y hormonales que siguen a la injuria o al trauma. Se distingue del estrés prequirúrgico, que es la alteración emocional por la anticipación psicológica de la cirugía y se desencadena antes de la anestesia o del dolor.',
 ['Selye (1936) conceptualizó el estrés como un síndrome específico formado por todos los cambios inespecíficos inducidos en un sistema biológico (síndrome general de adaptación), con un efecto general similar ante distintos estímulos, capacidad de adaptación o resistencia y papel central del eje adrenocortical con secreción de glucocorticoides.',
  'El trauma quirúrgico produce una respuesta metabólica, endocrina, hemodinámica e inmunológica que puede durar días o semanas.'],
 ['No requiere estudios específicos: se interpreta con la clínica y la evolución del paciente.'],
 [{'titulo': 'Modulación por la anestesia', 'pasos': [
    {'etiqueta': 'Técnicas y fármacos', 'texto': 'Las técnicas anestésicas (en especial la peridural) y los medicamentos usados durante la anestesia pueden disminuir los efectos deletéreos del estrés quirúrgico, porque reducen la respuesta de estrés y modifican la función inmunitaria con un efecto directo sobre las células inmunológicas.'}]}],
 ['Control de la evolución metabólica e inmunológica en cirugías extensas.'],
 ['La respuesta al estrés puede mantenerse días o semanas tras el trauma quirúrgico.'],
 dict(titulo='Estrés quirúrgico (Correa Padilla, 2013)', nodos=[
   I('Paciente sometido a una cirugía mayor o a un trauma'),
   A('El daño tisular activa la respuesta autonómica, endocrina (eje adrenocortical) y metabólica'),
   D('¿Se puede atenuar la respuesta con la técnica anestésica?',
     [F('Anestesia peridural y fármacos anestésicos reducen la respuesta de estrés y sus efectos sobre la inmunidad')],
     [F('La respuesta evoluciona durante días o semanas: vigilancia clínica')])]),
 fuente('Estrés quirúrgico y anestesia (Correa Padilla), Invest. Medicoquir. 2013;5(1):142-158', 'J. M. Correa Padilla, Centro de Investigaciones Médico Quirúrgicas (Cuba)', '2013', 'Estrés quirúrgico y anestesia Correa Padilla.pdf'))

nueva('cx7', U7, 'cx-estres-laboral-burnout', 'Estrés laboral y síndrome de burnout en el equipo de salud',
 ['burnout', 'sindrome de burnout', 'desgaste psiquico', 'estres laboral', 'agotamiento emocional', 'despersonalizacion', 'maslach', 'sindrome de tomas'],
 'El estrés laboral son las reacciones físicas y emocionales nocivas que ocurren cuando las exigencias del trabajo no igualan las capacidades, recursos o necesidades del trabajador. El burnout (síndrome de desgaste profesional o de agotamiento) es una respuesta al estrés crónico del trabajo con personas, definida por Maslach (1982) como síndrome de fatiga emocional, despersonalización y logro personal reducido; fue descripto por Freudenberger en 1974.',
 ['Tres dimensiones del Inventario de Maslach: agotamiento emocional, despersonalización (actitudes de cinismo hacia las personas destinatarias del trabajo; es el elemento clave porque las otras pueden verse también en la depresión) y baja realización personal.',
  'Es un proceso crónico, con síntomas intermitentes o continuos, que aparece cuando fallan las estrategias de afrontamiento. Cuatro estadios: leve (quejas, cefaleas, cambios de carácter), moderado (insomnio, dificultad de concentración, automedicación), grave (ausentismo, baja productividad, cinismo, abuso de alcohol o psicofármacos) y extremo (aislamiento, crisis existencial, riesgo suicida).',
  'Síntomas fisiológicos (fatiga, cefaleas, hipertensión, úlceras, insomnio), psicológicos (irritabilidad, ansiedad, rasgos depresivos) y conductuales (hostilidad, ausentismo, consumo de café, alcohol, tabaco y psicofármacos). En la CIE-10 figura como síndrome de agotamiento (Z73.0).',
  'Factores: sobrecarga y falta de control del tiempo, injusticia, falta de recompensa, conflicto de valores, mala relación interpersonal, desajuste entre las expectativas y la realidad laboral, estructura jerárquica rígida, inseguridad laboral, bajos ingresos y temor a los juicios por mala praxis.',
  'Impacto en la salud: gastritis, úlcera gastroduodenal, hipertensión arterial, arritmias, deterioro psicoemocional (angustia, depresión, ansiedad), conductas de riesgo y errores médicos. En anestesiólogos latinoamericanos el estrés laboral llega al 59 a 96 %, con gastritis en el 45 %.'],
 ['El diagnóstico es clínico, apoyado en el Inventario de Maslach.'],
 [{'titulo': 'Prevención y abordaje', 'pasos': [
    {'etiqueta': 'Diagnóstico precoz', 'texto': 'Reconocer las manifestaciones e indicar terapia médica y psicológica cuando el cuadro lo requiere; el tratamiento sigue siendo complejo y de escasos resultados.'},
    {'etiqueta': 'Cambios de fondo', 'texto': 'Hábitos de alimentación, sueño, descanso y esparcimiento; calendarios laborales, familiares y sociales equilibrados; más participación y satisfacción laboral.'},
    {'etiqueta': 'Institucional', 'texto': 'Estabilidad y remuneración adecuadas, recursos materiales y humanos, trabajo en equipos interdisciplinarios, rotación por áreas, grupos de reflexión, alternar horas asistenciales con tareas de elaboración, y protocolos para medir el nivel de burnout en cada población profesional.'}]}],
 ['Seguimiento del estado emocional y del ausentismo; atención médica temprana de los cuadros iniciales.'],
 ['El síndrome se contagia entre los profesionales por aprendizaje por observación durante la socialización laboral.', 'En los casos graves hay riesgo de abuso de psicofármacos, accidentes y suicidio (en el burnout intenso es 6 veces mayor que en la población general).'],
 dict(titulo='Burnout en el equipo de salud (Gatto y Calabrese)', nodos=[
   I('Profesional de la salud con agotamiento, cinismo hacia los pacientes y pérdida de rendimiento'),
   A('Explorar agotamiento emocional, despersonalización y baja realización personal (Inventario de Maslach)'),
   D('¿Hay sintomatología grave (ausentismo, abuso de alcohol o psicofármacos, riesgo suicida)?',
     [F('Atención médica y psicológica sin demora y evaluación del riesgo suicida en los estadios extremos')],
     [F('Prevención y afrontamiento: descanso, horarios equilibrados, grupos de reflexión, trabajo en equipo y medidas institucionales')])]),
 fuente('Desgaste psíquico en el equipo de salud: síndrome de burnout (Gatto) e Impacto del estrés laboral en el anestesiólogo (Calabrese, 2006)', 'M. E. Gatto (Argentina) y G. Calabrese (Uruguay)', '2006', 'EstrDesgaste psíquico en el Equipo de Salud.pdf; Estrés en anestesiólogos.pdf',
        'El texto de Gatto no trae año de edición; el de Calabrese es de 2006.'))
