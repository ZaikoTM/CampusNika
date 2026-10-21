# -*- coding: utf-8 -*-
"""Suma screening, fisiopatología, algoritmos y fármacos a las fichas de Ginecología (data/nikafarma_patologias.json). Idempotente. Uso: python tools/gineco/ampliar.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contenido import CONTENIDO, NOTA
from contenido2 import CONTENIDO2
from contenido3 import CONTENIDO3
from contenido4 import CONTENIDO4
from contenido5 import CONTENIDO5
CONTENIDO3 = dict(CONTENIDO3, **CONTENIDO4, **CONTENIDO5)
CONTENIDO = dict(CONTENIDO, **CONTENIDO2)
for _k, _v in CONTENIDO3.items(): CONTENIDO[_k] = dict(CONTENIDO.get(_k, {}), **_v)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    p = os.path.join(ROOT, 'data/nikafarma_patologias.json')
    raw = open(p, 'rb').read()
    j = json.loads(raw.decode('utf8'))
    fx = {x['id'] for x in json.load(open(os.path.join(ROOT, 'data/flashcards_farmacos.json'), encoding='utf8'))['patologias']}
    por_id = {x['id']: x for x in j['patologias']}
    n = 0
    for pid, c in CONTENIDO.items():
        f = por_id.get(pid)
        if not f: print('SIN FICHA', pid); continue
        for k in ('tamizaje', 'fisiopatologia', 'algoritmo', 'farmacos', 'calculadora'):
            if k in c:
                if k == 'farmacos':
                    falta = [x for x in c[k] if x not in fx]
                    if falta: print('FARMACO NO EXISTE', pid, falta)
                f[k] = c[k]
        if 'fuente' in c: f['fuente'].update({k: v for k, v in c['fuente'].items()}); f['fuente'].pop('nota', None); f['fuente'].pop('revisarAntes', None)
        nota = (f['fuente'].get('nota') or '')
        if NOTA not in nota: f['fuente']['nota'] = (nota + ' ' + NOTA).strip()
        n += 1
    crlf = b'\r\n' in raw
    out = json.dumps(j, ensure_ascii=False, indent=2)
    if crlf: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8'))
    print(n, 'fichas ampliadas')

if __name__ == '__main__':
    main()
