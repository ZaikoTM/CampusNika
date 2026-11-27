# -*- coding: utf-8 -*-
"""UP 9 · Enfermedad trauma desde la atención prehospitalaria hasta la procuración de tejido: atlas de anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up09a, up09b

RESUMEN = ['Evaluación primaria y secundaria del politraumatizado (xABCDE, ATLS): vía aérea, cuello, tórax, circulación, neurológico y exposición.',
           'Triage prehospitalario y sistemas de emergencia (contenido no anatómico: se estudia aparte).',
           'Shock hemorrágico en el paciente traumatizado: sitios de sangrado, control de la hemorragia y accesos vasculares.',
           'Traumatismo de tórax, abdomen, pelvis, cráneo y columna: anatomía de las lesiones que se reconocen y tratan en la primera hora.',
           'Quemaduras: profundidad, superficie, reanimación, vía aérea y escarotomía.',
           'Criterios de muerte encefálica y procuración de órganos y tejidos: marco legal y proceso institucional.']


def crear():
    u = Unidad(9, '#7c3aed', 'Enfermedad trauma: de la atención prehospitalaria a la procuración', 'Politrauma, tórax, abdomen, shock, cráneo, quemaduras y muerte encefálica', RESUMEN, {})
    for f in (up09a.cuello, up09a.torax, up09a.corazon, up09b.abdomen, up09b.shock, up09b.tec, up09b.columna, up09b.quemaduras, up09b.muerte_encefalica, up09b.preguntas, up09b.referencias):
        f(u)
    return u
