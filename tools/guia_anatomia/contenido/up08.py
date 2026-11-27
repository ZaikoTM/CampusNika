# -*- coding: utf-8 -*-
"""UP 8 · Patología musculoesquelética de miembros inferiores: atlas de anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up08a, up08b

RESUMEN = ['Fundamentos y nomenclatura; biología ósea; diagnóstico por imágenes (radiografía, ecografía, RM, TC, centellograma, PET).',
           'Lesiones osteoarticulares: fracturas, luxaciones, politraumatismo, fracturas expuestas y complicaciones.',
           'Tratamiento ortopédico: inmovilizaciones, yesos, férulas, tracciones y osteosíntesis.',
           'Traumatismos regionales de miembros inferiores y pelvis; columna vertebral; radiculopatías cervicales y lumbosacras.',
           'Tumores musculoesqueléticos: óseos, metástasis y partes blandas.',
           'Patología del pie y tobillo: calcáneo, astrágalo, metatarsianos, fracturas por estrés.',
           'Discapacidad y pérdida de autonomía en el adulto mayor (contenido no anatómico: se estudia aparte).']


def crear():
    u = Unidad(8, '#4f46e5', 'Patología musculoesquelética de miembros inferiores', 'Pelvis, cadera, muslo, rodilla, pierna, tobillo y pie, nervios, columna y tumores', RESUMEN, {})
    for f in (up08a.fundamentos, up08a.pelvis, up08a.muslo, up08b.rodilla_pierna, up08b.tobillo_pie, up08b.nervios, up08b.columna, up08b.tumores, up08b.preguntas, up08b.referencias):
        f(u)
    return u
