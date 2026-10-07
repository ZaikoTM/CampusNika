#!/usr/bin/env python
"""Arma data/UP{n}_siam.json (uno por unidad, mismo esquema que data/UP1_ginecologia.json)
a partir de tools/siam-banco/fuente_choices.json aplicando las correcciones de auditoria.py.

Uso:  PYTHONIOENCODING=utf8 python tools/siam-banco/construir_banco.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from auditoria import limpiar_pregunta

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
fuente = json.load(open(os.path.join(RAIZ, 'tools/siam-banco/fuente_choices.json'), encoding='utf-8'))
siam = json.load(open(os.path.join(RAIZ, 'data/siam_data.json'), encoding='utf-8'))
titulos = {u['number']: u['title'] for u in siam['units']}

total = 0
for u in fuente['unidades']:
    n = int(u['up'][2:])
    preguntas = [limpiar_pregunta(p) for p in u['preguntas']]
    out = {'modulo': 'siam', 'unidad': u['up'], 'seccion': u.get('seccion'), 'titulo': titulos.get(n, u['up']), 'preguntas': preguntas}
    ruta = os.path.join(RAIZ, 'data', f'{u["up"]}_siam.json')
    with open(ruta, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')
    total += len(preguntas)
    print(f'{ruta}: {len(preguntas)} preguntas')
print('total', total)
