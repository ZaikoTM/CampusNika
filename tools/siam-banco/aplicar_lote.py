"""Fusiona un lote de parches (JSON por stdin: {"SIAM-UP1-001": {"a": "texto", ...}}) en tools/siam-banco/parches/UPn.json
y reconstruye el banco. Uso: python tools/siam-banco/aplicar_lote.py < lote.json"""
import json, os, re, subprocess, sys
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
lote = json.load(sys.stdin)
por_up = {}
for pid, ops in lote.items():
    up = re.match(r'SIAM-(UP\d)-', pid).group(1)
    por_up.setdefault(up, {})[pid] = ops
for up, d in por_up.items():
    ruta = os.path.join(RAIZ, 'tools/siam-banco/parches', up + '.json')
    actual = json.load(open(ruta, encoding='utf-8')) if os.path.exists(ruta) else {}
    for pid, ops in d.items(): actual.setdefault(pid, {}).update(ops)
    with open(ruta, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(actual, f, ensure_ascii=False, indent=1); f.write('\n')
print('parches aplicados:', {k: len(v) for k, v in por_up.items()})
subprocess.run([sys.executable, os.path.join(RAIZ, 'tools/siam-banco/construir_banco.py')], stdout=subprocess.DEVNULL, check=True)
