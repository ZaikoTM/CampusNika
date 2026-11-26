# -*- coding: utf-8 -*-
"""UP 2 · Abdomen agudo: anatomía quirúrgica."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up02a, up02b

RESUMEN = ['Abdomen agudo: definición y clasificación (inflamatorio, perforativo, peritonítico, obstructivo y vascular).',
           'Fisiología del dolor abdominal: visceral, parietal y referido; localización según la inervación.',
           'Síndrome doloroso de la fosa ilíaca derecha: diagnóstico diferencial según edad y sexo.',
           'Apendicitis aguda: presentaciones típicas y atípicas, evolución natural, complicaciones y tumores del apéndice.',
           'Métodos complementarios por imágenes en el abdomen agudo.',
           'Pared abdominal, peritoneo, irrigación e inervación de las vísceras abdominales aplicadas a los cuadros de la unidad.']


def crear():
    u = Unidad(2, '#f59e0b', 'Abdomen agudo', 'Pared, peritoneo, dolor, irrigación, apéndice, fosa ilíaca derecha e imágenes', RESUMEN, {})
    for f in (up02a.pared, up02a.peritoneo, up02a.dolor, up02a.irrigacion, up02b.intestino, up02b.apendice, up02b.diferencial, up02b.imagenes, up02b.preguntas, up02b.referencias):
        f(u)
    return u
