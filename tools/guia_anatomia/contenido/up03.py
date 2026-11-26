# -*- coding: utf-8 -*-
"""UP 3 · Disfagia, esófago y estómago: anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up03a, up03b

RESUMEN = ['Disfagia: causas orgánicas y funcionales; deglución, faringe y esófago.',
           'Hemorragia digestiva alta: causas, diagnóstico y abordaje inicial.',
           'Patología benigna esofágica: esofagitis, estenosis, trastornos motores, divertículo de Zenker, reflujo y esófago de Barrett.',
           'Patología gástrica benigna: úlcera péptica, gastritis, hernia hiatal, pólipos, tumores benignos y bezoares.',
           'Cáncer esofágico y gástrico; estómago operado (dumping, asa aferente, vólvulo, fístula gastroyeyunocólica, gastritis alcalina).',
           'Estudios complementarios: endoscopia, manometría y seriada esofagogastroduodenal.']


def crear():
    u = Unidad(3, '#16a34a', 'Disfagia y patología esofagogástrica', 'Deglución, esófago, unión esofagogástrica, estómago, duodeno, hemorragia digestiva alta y estómago operado', RESUMEN, {})
    for f in (up03a.deglucion, up03a.esofago, up03a.union_hiato, up03a.motores, up03b.estomago, up03b.duodeno_hda, up03b.estomago_operado, up03b.cancer, up03b.estudios, up03b.preguntas, up03b.referencias):
        f(u)
    return u
