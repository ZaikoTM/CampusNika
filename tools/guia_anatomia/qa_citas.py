# -*- coding: utf-8 -*-
"""Control de calidad: compara los capítulos citados en los PDF del atlas con los capítulos que existen en la sala de Nika (data/cirugia.json)."""
import re, json, os, sys, glob, collections
import pymupdf
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
validos = {k: set(v) for k, v in json.load(open(os.path.join(HERE, 'trabajo', 'caps_validos.json'), encoding='utf-8')).items()}
LIBRO = [('gim', r'Gim[eé]nez'), ('mic', r'Michans'), ('sch', r'Schwartz'), ('tan', r'Tanagho'), ('schu', r'SCHU'), ('gal', r'Galindo')]
rx = re.compile(r'(Gim[eé]nez|Michans|Schwartz|Tanagho|SCHU|Galindo)([^;]{0,95}?)caps?\.\s*((?:\d+(?:\s*(?:,|y|a|-|–)\s*)?)+)')
res = collections.defaultdict(list)
for f in sorted(glob.glob(os.path.join(HERE, 'salida', 'Atlas_Anatomia_Quirurgica_UP*_Cirugia_NikaMed.pdf'))):
    n = int(re.search(r'UP(\d+)', f).group(1))
    d = pymupdf.open(f)
    for p in d:
        t = re.sub(r'\s+', ' ', p.get_text())
        for m in rx.finditer(t):
            lib = m.group(1); k = [c for c, r in LIBRO if re.search(r, lib)][0]
            nums = [int(x) for x in re.findall(r'\d+', m.group(3))]
            # rangos "a": 16 a 20 -> 16..20
            txt = m.group(3)
            if re.search(r'\d+\s*(a|-|–)\s*\d+', txt):
                a, b = [int(x) for x in re.findall(r'\d+', txt)[:2]]
                if a < b and b - a < 15: nums = list(range(a, b + 1))
            malos = [x for x in nums if x not in validos.get(k, set())]
            if malos: res[n].append((p.number + 1, lib, malos, m.group(0)[:110]))
tot = 0
for n in sorted(res):
    print('== UP%d: %d citas con capítulo fuera de la sala' % (n, len(res[n])))
    vistos = set()
    for pg, lib, malos, ctx in res[n]:
        key = (lib, tuple(malos))
        if key in vistos: continue
        vistos.add(key); tot += 1
        print('   p.%d %s cap(s) %s  | %s' % (pg, lib, malos, ctx))
print('total distintos', tot)
