# -*- coding: utf-8 -*-
"""UP 5 · Patología hepatobiliar: anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up05a, up05b, up05c

RESUMEN = ['Hígado: anatomía quirúrgica, segmentación, fisiología, semiología, traumatismos, ruptura espontánea y hemobilia.',
           'Abscesos piógenos y amebianos, quiste hidatídico y sus complicaciones, tumores y quistes benignos, tumores malignos primarios y secundarios, hipertensión portal.',
           'Vías biliares: anatomía quirúrgica, fisiología, semiología, colangiografía operatoria, quiste del colédoco, atresia biliar y traumatismos.',
           'Litiasis biliar, colecistitis aguda, ictericia, colestasis, síndrome coledociano, colangitis, tumores de las vías biliares y procedimientos percutáneos.',
           'Páncreas: anatomía quirúrgica, fisiología, semiología, traumatismos, pancreatitis aguda y crónica, tumores benignos, malignos, quísticos y periampulares.',
           'Estudios complementarios y paracentesis diagnóstica y terapéutica (trabajo práctico).']


def crear():
    u = Unidad(5, '#e11d48', 'Patología hepatobiliar', 'Hígado, hipertensión portal, vías biliares, vesícula, páncreas y paracentesis', RESUMEN, {})
    for f in (up05a.higado, up05a.patologia_hepatica, up05a.portal, up05b.via_biliar, up05b.litiasis, up05c.pancreas, up05c.pancreatitis, up05c.tumores_pancreas, up05c.estudios, up05c.preguntas, up05c.referencias):
        f(u)
    return u
