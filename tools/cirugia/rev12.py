# -*- coding: utf-8 -*-
"""UP1: herida cortante profunda de la mano (objetivo del programa). Fuente: Schwartz 10.ª ed., cap. 44 (Giménez no cubre mano)."""
from base import I, A, F, D
from rev6 import nueva as _n
import rev6
from rev11 import SCHW
CONTENIDO = {}
NUEVAS = []

def nueva(*a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = ['cx1']; d['unidad'] = 'UP1 · Trauma de miembro superior y generalidades quirúrgicas'; NUEVAS.append(d)

nueva('cx-herida-mano-tendones-nervios-vasos', 'Herida cortante profunda de la mano: tendones, nervios y vasos',
 ['herida de mano', 'lesion de tendones flexores', 'lesion de tendones extensores', 'lesion nerviosa de la mano', 'lesion vascular de la mano', 'dedo en martillo', 'ferula'],
 'Herida cortante que puede comprometer los tendones flexores o extensores, los nervios digitales o los vasos de la mano. Debe explorarse de forma dirigida para reconocer estas lesiones antes de cerrar la herida.',
 ['Tendones: la pérdida de la caída normal de los dedos hace sospechar la lesión; si el paciente no coopera, la extensión de la muñeca produce flexión pasiva de los dedos (tenodesis) y evidencia el déficit.',
  'Nervios: en una lesión cortante, un déficit sensitivo implica lesión nerviosa hasta que se demuestre lo contrario.',
  'Vasos: una laceración parcial de una arteria a nivel de la muñeca puede causar hemorragia exsanguinante; el dedo tiene dos sitios de flujo arterial y puede sobrevivir con uno.'],
 ['Examen de la movilidad de cada tendón, de la sensibilidad y de la perfusión; radiografía si se sospecha fractura o cuerpo extraño.'],
 [{'titulo': 'Conducta inicial', 'pasos': [
    {'etiqueta': 'Hemorragia', 'texto': 'Presión local continua por no menos de 10 minutos; si no cede, torniquete en el miembro superior 100 mmHg por encima de la presión sistólica y por menos de 2 horas. Pedir valoración urgente por otro especialista ante una lesión arterial y no ligar a ciegas por el riesgo de incluir nervios.'},
    {'etiqueta': 'Tendones flexores', 'texto': 'Siempre se reparan en el quirófano; no es necesario el mismo día, pero cuanto antes, más fácil recuperar los cabos proximales retraídos. Cerrar la piel con material no absorbible y ferular con la muñeca en flexión leve (cerca de 20°). El principio actual es la reparación primaria con movilización temprana controlada.'},
    {'etiqueta': 'Tendones extensores', 'texto': 'No pasan por una vaina en los dedos, por lo que una reparación primaria puede hacerse en urgencias con supervisión y equipo apropiados. El dedo en martillo cerrado se trata con férula en extensión de la articulación interfalángica distal durante seis semanas.'},
    {'etiqueta': 'Nervios', 'texto': 'La reparación requiere equipo microquirúrgico y no debe hacerse en urgencias; no exige exploración inmediata, pero la temprana facilita identificar las estructuras y deja menos cicatriz. El retraso puede obligar a usar un injerto.'},
    {'etiqueta': 'Inmovilización', 'texto': 'Posición de protección: articulaciones metacarpofalángicas a 90°, interfalángicas a 0° y muñeca en 20° de extensión.'}]}],
 ['Control de la herida y de la infección, y rehabilitación guiada de la movilidad.'],
 ['Déficit sensitivo tras una herida cortante: lesión nerviosa hasta demostrar lo contrario.', 'Hemorragia activa: compresión local y torniquete por menos de 2 horas; no clampear a ciegas.'],
 dict(titulo='Herida cortante profunda de la mano (Schwartz 10.ª ed.)', nodos=[
   I('Herida cortante profunda de la mano o los dedos'),
   D('¿Hemorragia activa o signos de compromiso vascular?',
     [A('Compresión local continua 10 minutos; torniquete 100 mmHg sobre la sistólica por menos de 2 horas; valoración urgente por especialista')],
     [A('Explorar movilidad de cada tendón, sensibilidad digital y perfusión')]),
   D('¿Hay déficit de movimiento (tendón) o de sensibilidad (nervio)?',
     [F('Lavado, cierre de piel con material no absorbible, férula en posición de protección y reparación del tendón o nervio en quirófano (la nerviosa con microcirugía)')],
     [F('Lavar, desbridar y cerrar la herida, inmovilizar, indicar cuidados domiciliarios, signos de alarma y seguimiento')])]),
 SCHW('44', 'Cirugía de mano y muñeca'))
