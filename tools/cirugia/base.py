# -*- coding: utf-8 -*-
"""Ayudas comunes para el contenido de las flashcards de Cirugía basado en Giménez 2.ª ed. (2025)."""

def I(t): return {'t': 'inicio', 'txt': t}
def A(t): return {'t': 'accion', 'txt': t}
def F(t): return {'t': 'fin', 'txt': t}
def D(t, si, no): return {'t': 'decision', 'txt': t, 'si': si, 'no': no}

NOTA_GIM = 'Contenido reescrito el 28/10/2026 sobre Giménez 2.ª ed. (2025), el texto argentino más actualizado; donde existe una guía o consenso argentino se cita y prevalece. Revisar con el docente antes de tomarlo como definitivo.'

def FG(cap, tit, extra=None, guia=None):
    """Fuente basada en Giménez 2025. `extra` agrega una nota; `guia` (dict) pone una guía argentina como fuente principal y a Giménez como complementaria."""
    f = {'guia': 'Cirugía: fundamentos para la práctica clínico-quirúrgica, 2.ª ed., cap. %s: %s' % (cap, tit),
         'sociedad': 'M. E. Giménez (dir.), Universidad de Buenos Aires · Editorial Médica Panamericana (Argentina)',
         'anio': '2025', 'archivo': 'GIMENEZ 2EDOCR enfoque.pdf (cap. %s)' % cap, 'tipo': 'libro',
         'nota': ((extra + ' ') if extra else '') + NOTA_GIM}
    if guia:
        g = dict(guia); g['nota'] = ((g.get('nota') + ' ') if g.get('nota') else '') + 'Complementa: Giménez 2.ª ed. (2025), cap. %s. %s' % (cap, NOTA_GIM)
        return g
    return f

def FC(cap, tit):
    """Fuente complementaria: conserva la fuente actual de la ficha (por ejemplo una guía argentina) y suma a Giménez como complemento."""
    return {'_complementa': 'Complementa: Giménez 2.ª ed. (2025), cap. %s: %s.' % (cap, tit)}
