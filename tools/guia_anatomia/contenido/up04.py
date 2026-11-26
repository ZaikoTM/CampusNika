# -*- coding: utf-8 -*-
"""UP 4 · Enfermedad colorrectal: anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up04a, up04b, up04c

RESUMEN = ['Colon: anatomía, fisiología y semiología. Traumatismos, megacolon, vólvulos y fecaloma.',
           'Enfermedad diverticular, enfermedad inflamatoria intestinal, trastornos vasculares del colon, pólipos, poliposis y cáncer colorrectal.',
           'Región anorrectal: anatomía, hemorroides, fisura, abscesos y fístulas, quiste sacrococcígeo, prolapso y cáncer de recto y de ano.',
           'Hemorragia digestiva baja: evaluación, diagnóstico diferencial y abordaje inicial.',
           'Ostomías: tipos, indicaciones, cuidados y complicaciones.',
           'Métodos diagnósticos del colon y del recto-ano.']


def crear():
    u = Unidad(4, '#7c3aed', 'Enfermedad colorrectal', 'Colon, recto, canal anal, hemorragia digestiva baja y ostomías', RESUMEN, {})
    for f in (up04a.colon, up04a.vasos_colon, up04a.patologia_colon, up04b.recto, up04b.canal_anal, up04c.hemorragia_baja, up04c.ostomias, up04c.estudios, up04c.preguntas, up04c.referencias):
        f(u)
    return u
