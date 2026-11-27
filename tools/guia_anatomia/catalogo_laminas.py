# -*- coding: utf-8 -*-
"""Extrae del contenido del atlas el catálogo de láminas de Netter: código, título, qué mirar y unidades donde aparece. Salida: trabajo/catalogo_laminas.json"""
import ast, glob, os, json, re, collections, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
cat = {}
for f in sorted(glob.glob(os.path.join(HERE, 'contenido', 'up*.py'))):
    m = re.match(r'up(\d\d)', os.path.basename(f))
    if not m: continue
    n = int(m.group(1))
    tree = ast.parse(open(f, encoding='utf-8').read())
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'N' and len(node.args) >= 4:
            try:
                code = ast.literal_eval(node.args[1]); tit = ast.literal_eval(node.args[2]); mir = ast.literal_eval(node.args[3])
            except Exception:
                continue
            c = cat.setdefault(code, dict(code=code, titulo=tit, mirar=mir, ups=[]))
            if n not in c['ups']: c['ups'].append(n)
json.dump(cat, open(os.path.join(HERE, 'trabajo', 'catalogo_laminas.json'), 'w', encoding='utf-8'), ensure_ascii=False)
cnt = collections.Counter(u for c in cat.values() for u in c['ups'])
print(len(cat), 'láminas únicas', sorted(cnt.items()))
