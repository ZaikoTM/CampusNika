# -*- coding: utf-8 -*-
"""UP 6 · Dolor inguinal: pared abdominal, hernias y escroto."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up06a, up06b

RESUMEN = ['Enfermedades quirúrgicas de las paredes abdominales: descripción anatómica, hernias (definición, componentes, clasificaciones), semiología y bases quirúrgicas.',
           'Hernias frecuentes (inguinal, crural, umbilical) e infrecuentes (epigástrica, lumbar, de Spiegel, obturatriz); complicaciones.',
           'Eventraciones, evisceración, neumoperitoneo de Goñi Moreno y eventración de los orificios de trócar.',
           'Diagnóstico diferencial del dolor inguinal: músculo-tendinoso, neurogénico, referido (litiasis ureteral, apendicitis retrocecal).',
           'Patología escrotal: torsión testicular y del apéndice testicular, hidrocele, varicocele, traumatismo, epididimitis y orquitis viral.',
           'Trabajo práctico: hernias, exploración física y diagnóstico.']


def crear():
    u = Unidad(6, '#0ea5e9', 'Dolor inguinal: pared abdominal, hernias y escroto', 'Región inguinal, hernias, eventración, dolor inguinal y patología escrotal', RESUMEN, {})
    for f in (up06a.pared_inguinal, up06a.hernias, up06b.dolor_inguinal, up06b.escroto, up06b.preguntas, up06b.referencias):
        f(u)
    return u
