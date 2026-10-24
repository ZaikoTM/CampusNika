# -*- coding: utf-8 -*-
"""Piezas comunes de las fichas de métodos anticonceptivos (2026-10-24).
Fuente principal: «Métodos anticonceptivos: guía práctica para profesionales de la salud», Ministerio de Salud de la Nación, DNSSR, edición 2023
(carpeta Desktop\\Medicina\\QUINTO AÑO\\Gineco 2025\\MAC). Complementan: Consenso FASGO 2021 de anticoncepción libre de estrógenos, los folletos de adherencia
del Ministerio y la revista AMAdA 21(2) 2025 (criterios OMS 2025 y CDC 2024). Cada ficha trae un bloque «contraste» con lo que difiere del resumen original."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contenido import I, A, F, D

UNIDAD = 'UP3 · Sección 1 — Planificación familiar: métodos anticonceptivos, criterios OMS, LARCs'
UP = ['up3-sec1']
REVISAR = '2027-03'
ARCHIVO = 'Metodos_anticonceptivos_Guia_practica_para_profesionales_de_la_salud_MSAL.pdf'

def P(etiqueta, texto): return {'etiqueta': etiqueta, 'texto': texto}
def B(titulo, *pasos): return {'titulo': titulo, 'pasos': list(pasos)}

R_MSAL = {'t': 'Métodos anticonceptivos: guía práctica para profesionales de la salud (edición 2023)', 'c': 'Ministerio de Salud de la Nación, Dirección Nacional de Salud Sexual y Reproductiva · 1.ª ed., CABA, 2023 · ISBN 978-950-38-0332-5'}
R_FASGO = {'t': 'Consenso FASGO 2021: anticoncepción libre de estrógenos', 'c': 'Federación Argentina de Sociedades de Ginecología y Obstetricia (FASGO), 2021'}
R_AMADA = {'t': 'Criterios médicos de elegibilidad OMS 2025 y CDC 2024: revisión y comentarios', 'c': 'Faranna D, Marrone M. Revista AMAdA 2025;21(2):33-45 (Asociación Médica Argentina de Anticoncepción)'}
R_F_AHE = {'t': 'Folleto de adherencia: anticoncepción hormonal de emergencia (levonorgestrel 1,5 mg)', 'c': 'Ministerio de Salud de la Nación, DNSSR'}
R_F_DIU = {'t': 'Folleto de adherencia: dispositivos intrauterinos (DIU de cobre y DIU hormonal)', 'c': 'Ministerio de Salud de la Nación, DNSSR'}
R_F_ACI = {'t': 'Folleto de adherencia: inyección anticonceptiva mensual', 'c': 'Ministerio de Salud de la Nación, DNSSR'}
R_AIPEO = {'t': 'Guía de anticoncepción inmediata posevento obstétrico (AIPEO), 2021', 'c': 'Ministerio de Salud de la Nación, DNSSR (citada en la guía MSAL 2023)'}


def fuente(nota, *extras):
    return {
        'guia': 'Métodos anticonceptivos: guía práctica para profesionales de la salud (edición 2023)',
        'sociedad': 'Ministerio de Salud de la Nación · DNSSR',
        'anio': 2023,
        'archivo': ARCHIVO,
        'tipo': 'guia',
        'nota': nota,
        'argentinas': [R_MSAL] + list(extras),
    }


def ficha(id, titulo, alias, definicion, **kw):
    f = dict(id=id, area='ginecologia', titulo=titulo, alias=alias, unidad=UNIDAD, estado='guia', definicion=definicion,
             diagnostico=[], estudios=[], tratamiento=[], seguimiento=[], banderas=[], revisarAntes=REVISAR, up=list(UP))
    f.update(kw)
    return f
