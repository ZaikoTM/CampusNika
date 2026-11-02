# -*- coding: utf-8 -*-
"""UP10: temas del programa que Giménez no cubre; se usa Schwartz 10.ª ed. (cap. 22 y 23), mas actual que Michans."""
from base import I, A, F, D
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []
SCHW = lambda cap, tit: {'guia': 'Schwartz, Principios de Cirugía, 10.ª ed., cap. %s: %s' % (cap, tit), 'sociedad': 'F. C. Brunicardi y col., McGraw-Hill', 'anio': '2015',
                         'archivo': 'Capitulos_Schwartz, cap. %s' % cap, 'tipo': 'libro',
                         'nota': 'El tema no está en Giménez 2.ª ed. (2025) ni se hallaron guías argentinas o chilenas en las carpetas provistas; se usa Schwartz, más actual que Michans.'}
U10 = 'UP10 · Enfermedades vasculares periféricas'

def nueva(*a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = ['cx10']; d['unidad'] = U10; NUEVAS.append(d)

nueva('cx-aneurisma-aorta-toracica-diseccion', 'Aneurisma de la aorta torácica y disección aórtica',
 ['aneurisma toracico', 'diseccion aortica', 'stanford', 'debakey', 'marfan', 'aorta ascendente'],
 'Dilatación de la aorta torácica (aneurisma) o separación de las capas de su pared por una rotura de la íntima (disección). La disección se clasifica por los segmentos afectados: Stanford A (afecta la aorta ascendente) o B (descendente), o DeBakey I a III.',
 ['Aneurisma: se asocia a degeneración de la capa media, disección, alteraciones genéticas (síndromes de Marfan, Loeys-Dietz y Ehlers-Danlos, aorta bivalva), aortitis, infección y traumatismo.',
  'Disección: dolor intenso en el pecho o la espalda, "desgarrante", que migra en dirección distal al avanzar la disección; el dolor en el tórax anterior sugiere afección de la aorta ascendente. El diagnóstico se demora hasta 24 horas de hospitalización en el 39 %.'],
 ['Angio-TC, angiorresonancia o ecocardiografía transesofágica según la estabilidad del paciente.'],
 [{'titulo': 'Aneurisma de la aorta torácica', 'pasos': [
    {'etiqueta': 'Indicación quirúrgica', 'texto': 'Reparación electiva en asintomáticos con aorta ascendente mayor de 5,5 cm o descendente mayor de 6,0 cm, o con crecimiento mayor de 0,5 cm al año; todo aneurisma sintomático se repara. En conjuntivopatías se opera con menor diámetro (4,0 a 5,0 cm en la ascendente y 5,5 a 6,0 cm en la descendente).'},
    {'etiqueta': 'Técnica', 'texto': 'Reparación abierta con injerto o prótesis endovascular en la aorta descendente, que exige al menos 2 cm de aorta sana proximal y distal para el sellado.'}]},
  {'titulo': 'Disección aórtica aguda', 'pasos': [
    {'etiqueta': 'Tratamiento inicial', 'texto': 'Terapia antiimpulso: reducir la tensión de la pared, la fuerza de expulsión del ventrículo izquierdo y la tasa de variación de la presión (dP/dT) con bloqueadores beta, vasodilatadores, calcioantagonistas o inhibidores de la ECA, en cuidados intensivos.'},
    {'etiqueta': 'Stanford A (ascendente)', 'texto': 'La mayoría requiere sustitución urgente de la aorta ascendente con injerto (a menudo con paro circulatorio hipotérmico).'},
    {'etiqueta': 'Stanford B (descendente)', 'texto': 'Tratamiento médico; intervención endovascular o abierta si se complica con mala perfusión visceral o de miembros, o con rotura.'}]}],
 ['Control de la presión arterial y seguimiento por imágenes de la aorta de por vida.'],
 ['Dolor torácico o dorsal intenso y migratorio: pensar en disección; el diagnóstico tardío (hasta 39 % pasadas 24 horas) tiene consecuencias desastrosas.', 'El síndrome de perfusión anómala abdominal suele ser letal: reconocer pronto la isquemia visceral.'],
 dict(titulo='Disección aórtica aguda (Schwartz 10.ª ed.)', nodos=[
   I('Dolor intenso torácico o dorsal "desgarrante" con sospecha de disección aórtica'),
   A('Control de la presión y de la frecuencia (terapia antiimpulso con bloqueadores beta) y estudio por angio-TC, angiorresonancia o ecocardiografía transesofágica'),
   D('¿Compromete la aorta ascendente (Stanford A)?',
     [F('Cirugía urgente: sustitución de la aorta ascendente con injerto')],
     [D('¿Disección descendente complicada (mala perfusión, rotura)?',
        [F('Intervención endovascular (endoprótesis) o abierta')],
        [F('Tratamiento médico en cuidados intensivos y control por imágenes')])])]),
 SCHW('22', 'Aneurismas de la aorta torácica y disección aórtica'))

nueva('cx-raynaud-buerger', 'Síndrome de Raynaud y enfermedad de Buerger',
 ['raynaud', 'vasoespasmo', 'buerger', 'tromboangeitis obliterante', 'trombovasculitis obliterante', 'isquemia de dedos'],
 'El síndrome de Raynaud es un vasoespasmo periférico intermitente, sobre todo de las manos, ante frío, tabaco o estrés. La enfermedad de Buerger (trombovasculitis obliterante) es una inflamación segmentaria no ateroesclerótica de arterias de pequeño y mediano calibre, venas y nervios de las extremidades.',
 ['Raynaud: palidez intensa, luego cianosis y hiperemia reactiva; 70 a 90 % son mujeres, la mayoría menores de 40 años. El término abarca las formas primaria y secundaria: entre el 11 y el 65 % desarrolla después una colagenopatía.',
  'Buerger: varón joven fumador (síntomas antes de los 40 años; rango de 20 a 50). Claudicación de pie, pierna, brazo o mano que avanza a dolor en reposo y úlceras de los dedos; flebitis migratoria superficial en hasta 16 %. El tabaco es esencial para el diagnóstico y la progresión.'],
 ['Raynaud: mediciones no invasivas en el laboratorio vascular; la angiografía se reserva para ulceración digital o sospecha de causa embólica u obstructiva.',
  'Buerger: excluir diabetes, hiperlipidemia y enfermedades autoinmunes; angiografía de los cuatro miembros: enfermedad distal (infrapoplítea y distal a la humeral), oclusiones segmentarias y colaterales "en sacacorchos".'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Raynaud', 'texto': 'No tiene cura, el tratamiento solo palía. Guantes, calentadores, evitar herramientas vibrantes y frío, abstinencia del tabaco (responde el 90 %). Si es persistente: calcioantagonistas (diltiazem, nifedipina) de elección, fluoxetina; prostaglandinas intravenosas en los graves. Cirugía limitada a desbridar úlceras y amputar dedos gangrenados; la simpatectomía de la extremidad superior alivia al 60 a 70 %.'},
    {'etiqueta': 'Buerger', 'texto': 'Interrupción estricta del tabaco: remisión y mayor chance de evitar la amputación (pérdida de extremidad 35 % si deja de fumar contra 67 % si continúa). La cirugía de revascularización sirve poco porque suele faltar un vaso receptor y las venas autógenas son limitadas.'}]}],
 ['Seguimiento del hábito tabáquico y cuidado de los dedos con isquemia; en Raynaud secundario, estudiar colagenopatías.'],
 ['Raynaud con ulceración digital: descartar causa embólica u obstructiva con angiografía.', 'En Buerger, la única medida que modifica la evolución es suspender el tabaco.'],
 dict(titulo='Isquemia de dedos: Raynaud y Buerger (Schwartz 10.ª ed.)', nodos=[
   I('Paciente joven con palidez, cianosis y dolor de los dedos, o claudicación de la mano o el pie'),
   D('¿Episodios intermitentes por frío o estrés con hiperemia reactiva?',
     [A('Síndrome de Raynaud: medidas conservadoras (frío, tabaco, vibración)'),
      D('¿Persiste o es grave?',
        [F('Calcioantagonistas; prostaglandinas en los graves; desbridar úlceras; simpatectomía si falla')],
        [F('Control; estudiar colagenopatías si es secundario')])],
     [D('¿Varón joven fumador con isquemia distal de varios miembros?',
        [F('Enfermedad de Buerger: suspender el tabaco, angiografía de los 4 miembros y cuidado local')],
        [F('Buscar ateroesclerosis, embolia o vasculitis; angiografía')])])]),
 SCHW('23', 'Enfermedades arteriales: síndrome de Raynaud y enfermedad de Buerger'))
