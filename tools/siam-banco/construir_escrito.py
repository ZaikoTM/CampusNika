#!/usr/bin/env python
"""Arma data/escrito_siam.json (450 preguntas a desarrollar, 50 por UP) desde escrito_crudo.json, aplicando la misma
limpieza que el banco choice (entidades, LaTeX->unicode, ortografia). Mismo esquema que data/escrito_ginecologia.json.
Uso: PYTHONIOENCODING=utf8 python tools/siam-banco/construir_escrito.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from auditoria import limpiar_texto
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
crudo = json.load(open(os.path.join(RAIZ, 'tools/siam-banco/escrito_crudo.json'), encoding='utf-8'))
out = []
for o in crudo:
    out.append({
        'id': o['id'], 'up': o['up'],
        'pregunta': limpiar_texto(o["pregunta"], True),
        'puntos_clave': [limpiar_texto(x, True) for x in o['puntos_clave'] if str(x).strip()],
        'error_peligroso': limpiar_texto(o.get("error_peligroso") or "", True),
        'justificacion': limpiar_texto(o.get("justificacion") or "", True),
        'fuente': limpiar_texto(o.get('fuente') or ''),
    })
ruta = os.path.join(RAIZ, 'data/escrito_siam.json')
with open(ruta, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(out, f, ensure_ascii=False, indent=1); f.write('\n')
print(ruta, len(out), 'preguntas')
