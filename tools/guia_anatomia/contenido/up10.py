# -*- coding: utf-8 -*-
"""UP 10 · Enfermedad vascular periférica: atlas de anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up10a, up10b

RESUMEN = ['Enfermedad arterial periférica: fisiopatología, clasificación de Fontaine, claudicación e isquemia crítica; índice tobillo-brazo y estudios Doppler.',
           'Isquemia arterial aguda, aneurismas (aorta abdominal, poplíteo), disección aórtica y enfermedad carotídea.',
           'Isquemia mesentérica, Buerger y Raynaud; traumatismos arteriales; nociones de cirugía vascular y endovascular.',
           'Insuficiencia venosa crónica y várices; trombosis venosa profunda y tromboembolismo pulmonar; accesos vasculares y hemodiálisis.',
           'Pie diabético y su relación con la enfermedad vascular.',
           'Factores de riesgo cardiovascular y prevención secundaria (contenido no anatómico: se estudia aparte).']


def crear():
    u = Unidad(10, '#c026d3', 'Enfermedad vascular periférica', 'Arterias, aorta, carótida, venas, pie diabético, accesos y cirugía endovascular', RESUMEN, {})
    for f in (up10a.semiologia, up10a.arterial_mmii, up10a.isquemia_aguda, up10a.aorta, up10a.carotida, up10a.mesenterica, up10b.miembro_superior, up10b.venas, up10b.pie, up10b.trauma_endovascular, up10b.preguntas, up10b.referencias):
        f(u)
    return u
