# -*- coding: utf-8 -*-
"""Vuelca compacto un tramo de preguntas para escribir título y refutaciones. Uso: python dump.py <up> <desde> <hasta>"""
import json, re, sys, os
up, a, b = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bk = json.load(open(os.path.join(ROOT, 'data', 'banco_up%02d.json' % up), encoding='utf8'))
cl = lambda t: re.sub(r'\s+', ' ', str(t)).strip()
for i, q in enumerate(bk, 1):
    if not (a <= i <= b): continue
    st = cl(q['pregunta']); k = st.rfind('¿'); stem = (st[max(0, k - 150):] if k > 0 else st[-300:])
    ops = ' | '.join(cl(o)[:100] for o in q['opciones'])
    print('#%d-%d [%s] %s\n  %s\n  J: %s' % (up, i, q['correcta'], stem[:260], ops, cl(q['justificacion'])[:380]))
