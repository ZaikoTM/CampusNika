# -*- coding: utf-8 -*-
"""Valida la estructura de las fichas de Cirugía (algoritmos y campos). Uso: python tools/cirugia/validar.py"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
j = json.load(open(os.path.join(ROOT, 'data/flashcards_cirugia.json'), encoding='utf8'))
err = 0
def walk(n, pid, prof=0):
    global err
    for a in n:
        if a.get('t') not in ('inicio', 'accion', 'decision', 'fin') or not a.get('txt'): print('NODO MAL', pid, a); err += 1
        if a['t'] == 'decision':
            if not a.get('si') or not a.get('no'): print('DECISION INCOMPLETA', pid, a['txt'][:60]); err += 1
            walk(a.get('si', []), pid, prof + 1); walk(a.get('no', []), pid, prof + 1)
for p in j['patologias']:
    for k in ('id', 'titulo', 'definicion', 'diagnostico', 'tratamiento', 'fuente', 'up'):
        if not p.get(k): print('FALTA', p['id'], k); err += 1
    if p.get('algoritmo'): walk(p['algoritmo']['nodos'], p['id'])
sin = [p['id'] for p in j['patologias'] if not p.get('algoritmo')]
print(len(j['patologias']), 'fichas;', len(sin), 'sin algoritmo;', err, 'errores')
if '-v' in sys.argv: print(sin)
