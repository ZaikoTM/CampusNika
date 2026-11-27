# -*- coding: utf-8 -*-
"""UP 11 · Obstrucción urinaria baja en el adulto mayor: atlas de anatomía quirúrgica de urología."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up11a, up11b

RESUMEN = ['Anatomía prostática y fisiología miccional; síndrome prostático obstructivo.',
           'Hiperplasia prostática benigna: clínica y score IPSS; retención aguda de orina y su manejo inicial.',
           'Cáncer de próstata: tamizaje (PSA y tacto rectal), diagnóstico y estadificación.',
           'Complicaciones de la obstrucción urinaria baja: retención aguda e insuficiencia renal; litiasis, infecciones y trauma urogenital.',
           'Opciones terapéuticas: manejo médico, RTU de próstata y cirugía; tumores renales, vesicales y testiculares.']


def crear():
    u = Unidad(11, '#f97316', 'Obstrucción urinaria baja y urología', 'Riñón, uréter, vejiga, próstata, uretra, escroto y tumores urológicos', RESUMEN, {})
    for f in (up11a.semiologia, up11a.rinon, up11a.ureter, up11a.vejiga, up11b.prostata, up11b.uretra_pene, up11b.escroto, up11b.congenitas, up11b.preguntas, up11b.referencias):
        f(u)
    return u
