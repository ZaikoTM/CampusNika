# -*- coding: utf-8 -*-
"""Temas del programa que Giménez no cubre: se usa Michans 5.ª ed. (texto argentino) cuando no hay guia ni libro mas reciente en las carpetas."""
from base import I, A, F, D
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []
MICH = lambda cap, tit: {'guia': 'Cirugía de Michans, 5.ª ed., cap. %s: %s' % (cap, tit), 'sociedad': 'P. Ferraina y A. Oría (dirs.), Editorial Ateneo (Argentina)', 'anio': '2002',
                         'archivo': 'Capitulos_Michans, cap. %s' % cap, 'tipo': 'libro',
                         'nota': 'Michans 5.ª ed. (El Ateneo, 2002; el programa de la cátedra cita la reimpresión de 2021). El tema no está en Giménez 2.ª ed. (2025) ni se hallaron guías argentinas o chilenas más recientes en las carpetas provistas; se usa Michans, bibliografía esencial de la cátedra.'}

def nueva(up, unidad, *a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = [up]; d['unidad'] = unidad; NUEVAS.append(d)

nueva('cx9', 'UP9 · Trauma, quemaduras y procuración', 'cx-traumatismo-encefalocraneano', 'Traumatismo encefalocraneano (TEC)',
 ['tec', 'traumatismo de craneo', 'traumatismo craneoencefalico', 'hematoma extradural', 'hematoma subdural', 'glasgow', 'hipertension endocraneana'],
 'Lesión de las estructuras craneanas (cobertura o contenido) por la transformación de la energía exógena. Las lesiones pueden ser primarias (absorción de la energía en el impacto) o secundarias (hematomas, hiperemia, edema), y focales o difusas. La mayor incidencia se da entre los 10 y los 20 años, con relación varón-mujer de 3 a 1.',
 ['Se considera que hubo TEC ante toda lesión de la frente o del cuero cabelludo, un déficit neurológico ya recuperado (aturdimiento, pérdida de conciencia, convulsión, amnesia) o signos neurológicos al ingreso.',
  'Gravedad por la escala de Glasgow: leve 13 a 15 (55 % de las admisiones), moderado 9 a 12 (24 %; control estricto: "hablaron y murieron") y grave 8 o menos (21 %).',
  'Fractura de la base del cráneo: signo de Battle o equimosis periorbitaria, hemotímpano, otorragia u otorrea, rinorrea, déficit visual o auditivo, parálisis facial, anosmia.',
  'Hematoma extradural: intervalo lúcido, anisocoria con midriasis homolateral a la fractura y foco motor contralateral; en la TC, imagen hiperdensa biconvexa; urgencia medicoquirúrgica. Hematoma subdural agudo: ocurre en el 45 % de los TEC graves, imagen hiperdensa sobre la convexidad, mortalidad global cercana al 60 %.',
  'La injuria axonal difusa es un coma mayor de 8 horas con Glasgow de 8 o menos, sin lesión expansiva, y causa un tercio de las muertes por TEC.'],
 ['La tomografía computada es el método de elección y se indica de urgencia en todo TEC moderado o grave (Glasgow de 13 o menos), con anisocoria o foco neurológico, o con descenso de 2 puntos del Glasgow en un paciente compensado.',
  'Radiografía simple de cráneo con lesión de partes blandas, amnesia, alteración de la conciencia, signos focales o fístula de LCR; la resonancia no se indica en la urgencia.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Medidas generales', 'texto': 'En el TEC grave, monitorear presión venosa central y presión de perfusión cerebral (PAM menos presión endocraneana); controlar pO2 y pCO2, normalizar la volemia, tratar la hipotensión y las arritmias, sedar y tratar las convulsiones.'},
    {'etiqueta': 'Cirugía', 'texto': 'Nadie se opera sin corregir antes el shock y la hipoxia; las lesiones de tórax o abdomen que amenazan la vida se resuelven primero. Objetivos: remover masas expansivas, focos contusivos de más de 2,5 cm, cerrar brechas y fístulas, derivar el LCR en la hidrocefalia, extraer cuerpos extraños y colocar monitoreo de presión endocraneana en los TEC moderados y graves.'}]}],
 ['Observación neurológica estricta del TEC leve y moderado, sobre todo si hay fractura de cráneo.'],
 ['Toda fractura de cráneo es indicación de observar la evolución, aun sin déficit: con sensorio conservado el 10 % desarrolla hematoma; si está desorientado, el 66 %.',
  'La hipotensión sistémica y el shock son el factor concausal más importante de la lesión cerebral isquémica.',
  'Parámetros críticos: pCO2 mayor de 45, pO2 menor de 50, presión de perfusión cerebral menor de 60 y presión endocraneana mayor de 25 mmHg.'],
 dict(titulo='TEC: evaluación inicial (Michans 2021)', nodos=[
   I('Paciente con traumatismo de cráneo: ABCDE con control de la columna cervical y Glasgow'),
   D('¿Glasgow de 13 o menos, anisocoria, foco neurológico o descenso de 2 puntos?',
     [A('TC de cráneo de urgencia; estabilizar la oxigenación y la perfusión'),
      D('¿Lesión expansiva (hematoma) o brecha que requiere cirugía?',
        [F('Corregir shock e hipoxia y operar; evacuar el hematoma extradural es una urgencia')],
        [F('Cuidados intensivos, monitoreo de la presión endocraneana y de perfusión cerebral, sedación y tratamiento de convulsiones')])],
     [D('¿Hay fractura de cráneo, amnesia, pérdida de conciencia o signos de fractura de base?',
        [F('Radiografía o TC según los criterios; observación neurológica estricta')],
        [F('TEC leve: observación y pautas de alarma')])])]),
 MICH('14', 'Trauma encefalocraneano'))

nueva('cx1', 'UP1 · Trauma de miembro superior y generalidades quirúrgicas', 'cx-soporte-nutricional-quirurgico', 'Soporte nutricional del paciente quirúrgico',
 ['nutricion en cirugia', 'nutricion enteral', 'nutricion parenteral', 'desnutricion', 'requerimientos calorico proteicos', 'harris benedict'],
 'Aporte de nutrientes al paciente quirúrgico que no puede cubrir sus requerimientos por vía oral. La desnutrición calórico-proteica hospitalaria es frecuente: casi la mitad de los pacientes quirúrgicos la presentaba en grado moderado a severo y pasaba inadvertida.',
 ['La desnutrición calórico-proteica empeora la cicatrización (dehiscencias de heridas y anastomosis, escaras), deprime la inmunidad con más infecciones, favorece atelectasias y falla respiratoria, debilita la musculatura y altera la barrera intestinal con translocación bacteriana.',
  'Tres días de ayuno total no causan trastornos funcionales; un ayuno de 15 días, aunque sea parcial, suele asociarse a déficit funcionales.'],
 ['Valorar el grado de depleción, el hipermetabolismo y el hipercatabolismo para definir si el paciente requiere soporte nutricional.'],
 [{'titulo': 'Cuándo, por dónde y cuánto', 'pasos': [
    {'etiqueta': 'Momento de inicio (ASPEN 1993)', 'texto': 'Bien nutrido: entre el 7.º y el 10.º día posoperatorio si la ingesta es insuficiente o se prevé que lo sea. Desnutrido o hipercatabólico: entre el 5.º y el 7.º día. Desnutrición con hipercatabolismo moderado a severo: entre el 3.º y el 5.º día. Se inicia solo con estabilidad clínica y hemodinámica.'},
    {'etiqueta': 'Vía', 'texto': 'Enteral siempre que el aparato digestivo funcione. Parenteral (central o periférica) si hay íleo alto, fístula, hemorragia, diarrea, reposo funcional (pancreatitis, enfermedad inflamatoria) o imposibilidad de colocar sonda u ostomía; puede ser total o complemento de la enteral.'},
    {'etiqueta': 'Nutrición enteral temprana', 'texto': 'En politraumatizados y en trauma de cráneo, dentro de las 24 horas, preferentemente en el yeyuno: el íleo posoperatorio es del estómago y el colon, no del yeyunoíleon, por lo que no se espera a los ruidos hidroaéreos o a los gases.'},
    {'etiqueta': 'Calorías', 'texto': 'Normonutrido normometabólico 25 a 28 kcal/kg/día; hipermetabólico 30 a 35; deplecionado normometabólico 35 a 40; deplecionado hipermetabólico 30 (o la ecuación de Harris-Benedict con el ajuste correspondiente).'},
    {'etiqueta': 'Proteínas', 'texto': 'Relación kcal no proteicas por gramo de nitrógeno de 150 a 200 en normocatabólicos y de 80 a 120 en hipercatabólicos, donde conviene subir el aporte proteico.'}]}],
 ['Monitoreo del balance de nitrógeno y de las complicaciones de la nutrición enteral (mecánicas, gastrointestinales, pulmonares y metabólicas); lavar la sonda con 10 a 20 mL de agua cada 6 horas durante la infusión.'],
 ['Ningún paciente se beneficia de privarse de nutrientes: pasados 15 días de ayuno aparecen déficit funcionales.', 'Iniciar el soporte solo con estabilidad hemodinámica y corregidos la glucemia, los electrólitos y el equilibrio ácido-base.'],
 dict(titulo='Soporte nutricional en cirugía (Michans 2021)', nodos=[
   I('Paciente quirúrgico con ingesta insuficiente o prevista como insuficiente'),
   A('Valorar depleción previa, hipermetabolismo e hipercatabolismo; lograr estabilidad clínica y hemodinámica'),
   D('¿El aparato digestivo es utilizable?',
     [F('Nutrición enteral (en el yeyuno y temprana en el politraumatizado), progresando a los objetivos en 48 a 72 horas')],
     [D('¿Hay íleo alto, fístula, hemorragia, diarrea o reposo digestivo indicado?',
        [F('Nutrición parenteral, central o periférica, hasta poder pasar a la vía enteral')],
        [F('Intentar sonda u ostomía de alimentación para usar la vía enteral')])])]),
 MICH('5', 'Soporte nutricional del paciente quirúrgico'))
