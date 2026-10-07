#!/usr/bin/env python
"""Arma data/UP{n}_siam.json (uno por unidad, mismo esquema que data/UP1_ginecologia.json)
a partir de tools/siam-banco/fuente_choices.json aplicando las correcciones de auditoria.py.

Uso:  PYTHONIOENCODING=utf8 python tools/siam-banco/construir_banco.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from auditoria import limpiar_pregunta, limpiar_texto

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
fuente = json.load(open(os.path.join(RAIZ, 'tools/siam-banco/fuente_choices.json'), encoding='utf-8'))
siam = json.load(open(os.path.join(RAIZ, 'data/siam_data.json'), encoding='utf-8'))
titulos = {u['number']: u['title'] for u in siam['units']}

# parches de longitud/redaccion: tools/siam-banco/parches/UPn.json = {"SIAM-UPn-001": {"a": "texto", ...}, ...}
parches = {}
pdir = os.path.join(RAIZ, 'tools/siam-banco/parches')
if os.path.isdir(pdir):
    for nombre in sorted(os.listdir(pdir)):
        if nombre.endswith('.json'):
            parches.update(json.load(open(os.path.join(pdir, nombre), encoding='utf-8')))

total = 0
for u in fuente['unidades']:
    n = int(u['up'][2:])
    preguntas = [limpiar_pregunta(p) for p in u['preguntas']]
    for p in preguntas:
        for letra, txt in (parches.get(p['id']) or {}).items():
            if letra in p['opciones']:
                p['opciones'][letra] = limpiar_texto(txt)
            elif letra in ('p', 'j'):                            # 'p' = enunciado, 'j' = justificacion
                campo = 'pregunta' if letra == 'p' else 'justificacion'
                # txt = texto nuevo completo, o ["viejo", "nuevo"] para reemplazar solo un fragmento
                if isinstance(txt, list):
                    p[campo] = limpiar_texto(p[campo].replace(txt[0], txt[1]))
                else:
                    p[campo] = limpiar_texto(txt)
    out = {'modulo': 'siam', 'unidad': u['up'], 'seccion': u.get('seccion'), 'titulo': titulos.get(n, u['up']), 'preguntas': preguntas}
    ruta = os.path.join(RAIZ, 'data', f'{u["up"]}_siam.json')
    with open(ruta, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')
    total += len(preguntas)
    print(f'{ruta}: {len(preguntas)} preguntas')
print('total', total)
