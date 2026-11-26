# -*- coding: utf-8 -*-
"""UP 7 · Tumoración cervical: anatomía quirúrgica del cuello."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'guia_cirugia'))
from lib import Unidad
from . import up07a, up07b

RESUMEN = ['Cuello: estructuras anatómicas relevantes, planos, regiones, referencias y técnicas de exploración física; niveles ganglionares.',
           'Enfermedades quirúrgicas de la glándula tiroides: bocio nodular, adenomas y carcinomas, principios de cirugía tiroidea y complicaciones.',
           'Tumores extratiroideos y laterales del cuello: abordaje de masas benignas y malignas, de origen ganglionar, congénito o infeccioso.',
           'Patología quirúrgica de las glándulas salivales: tumores benignos y malignos, abordaje y complicaciones.',
           'Traqueostomía: indicaciones, tipos, técnica, cuidados y complicaciones; rol en la vía aérea difícil.',
           'Estrés laboral y síndrome de burnout (contenido no anatómico: se estudia aparte).']


def crear():
    u = Unidad(7, '#14b8a6', 'Tumoración cervical', 'Cuello, tiroides, paratiroides, masas cervicales, glándulas salivales y traqueostomía', RESUMEN, {})
    for f in (up07a.cuello, up07a.tiroides_anatomia, up07a.patologia_tiroides, up07b.masas, up07b.salivales, up07b.traqueostomia, up07b.estudios, up07b.preguntas, up07b.referencias):
        f(u)
    return u
