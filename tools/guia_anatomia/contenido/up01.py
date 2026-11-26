# -*- coding: utf-8 -*-
"""UP 1 · Trauma de miembro superior en el adulto joven: anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up01a, up01b, up01c

RESUMEN = ['Anatomía de la piel, planos de una herida y líneas de tensión (herida incisa y contusa, sutura, cicatrización).',
           'Vía aérea y laringe: anatomía de la intubación traqueal, ventajas y complicaciones.',
           'Columna, canal raquídeo y espacios epidural y subaracnoideo: raquídea, peridural, accidentes y secuelas.',
           'Miembro superior: esqueleto, plexo braquial, arterias, venas, linfáticos y nervios periféricos.',
           'Regiones (axila, brazo, fosa cubital, antebrazo), muñeca y mano: túneles, tendones, vainas y espacios.',
           'Anatomía aplicada de las fracturas, luxaciones y heridas de mano (qué se lesiona y cómo se explora).']


def crear():
    u = Unidad(1, '#0ea5e9', 'Trauma de miembro superior', 'Piel, vía aérea, neuroeje, plexo braquial, vasos, nervios, antebrazo y mano', RESUMEN, {})
    for f in (up01a.piel, up01a.via_aerea, up01a.columna, up01b.esqueleto, up01b.plexo, up01b.arterias, up01b.venas_linfaticos,
              up01c.nervios, up01c.regiones, up01c.mano):
        f(u)
    up01c.choices(u)
    return u
