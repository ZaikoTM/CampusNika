# -*- coding: utf-8 -*-
"""Fisiopatologia (decimosexta tanda): hernias con Schwartz 10.ª ed. (cap. 37) y Harrison 21.ª ed. (cap. 330)."""
from rev18 import CONTENIDO as _r18
CONTENIDO = {}

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-hernia-inguinal', list(_r18['cx-hernia-inguinal']['fisiopatologia']) + [
 'El testículo desciende en el tercer trimestre precedido por el gubernáculo y un divertículo peritoneal que se transforma en el proceso vaginal, que se cierra entre las semanas 36 y 40. La falla de cierre deja un proceso vaginal permeable, lo que eleva la incidencia de hernias en prematuros; en adultos, el 12 % conserva la permeabilidad sin síntomas, pero el contralateral permeable multiplica por cuatro el riesgo de hernia a 5 años (Schwartz, cap. 37).',
 'Se suman factores que aumentan la presión intraabdominal (tos, EPOC, esfuerzo, estreñimiento, prostatismo, embarazo, ascitis, obesidad), el tabaquismo, los antecedentes familiares, la síntesis defectuosa de colágeno y las colagenopatías (Ehlers-Danlos, Marfan, osteogénesis imperfecta) (Schwartz, cap. 37).'])
fisio('cx-hernia-complicada', [
 'Las hernias inguinales pueden debutar como urgencias quirúrgicas por incarceración y estrangulación del contenido del saco. Las femorales y las sintomáticas tienen mayor riesgo de complicarse: la incidencia acumulativa de estrangulación en las femorales fue de 2,8 % a 3 meses y 4,5 % a 2 años, y la operación urgente se asocia con un aumento de siete veces en la mortalidad respecto de la programada (Schwartz, cap. 37).',
 'La obstrucción se describe como simple o estrangulada si hay insuficiencia vascular e isquemia intestinal evidentes. Con estrangulamiento operado en las primeras 24 a 30 horas del inicio de los síntomas la mortalidad es cercana al 8 % y se triplica después; cerca de un tercio de los pacientes con obstrucción intestinal muestra datos de isquemia significativa (Harrison, cap. 330).'])
