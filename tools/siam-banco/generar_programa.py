#!/usr/bin/env python
"""Inserta/actualiza el bloque `siam` de PROGRAMA_TEMAS (js/programaTemas.js) a partir de data/siam_data.json."""
import json, os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
d = json.load(open(os.path.join(RAIZ, 'data/siam_data.json'), encoding='utf-8'))
q = lambda t: json.dumps(t, ensure_ascii=False)
bloque = ['  siam: {']
for u in d['units']:
    bloque.append(f"    'UP {u['number']}': {{\n      titulo: {q(u['title'])},\n      temas: [")
    bloque += [f"        {q(c)}," for c in u['contents']]
    bloque.append('      ],\n    },')
bloque.append('  },')
p = os.path.join(RAIZ, 'js/programaTemas.js')
raw = open(p, encoding='utf-8', newline='').read(); nl = '\r\n' if '\r\n' in raw else '\n'
s = raw.replace('\r\n', '\n')
s = re.sub(r"  siam: \{\n.*?\n  \},\n(?=\};)", '', s, flags=re.S)
i = s.index('\n};\n\nconst ProgramaTemas')
s = s[:i + 1] + '\n'.join(bloque) + '\n' + s[i + 1:]
open(p, 'w', encoding='utf-8', newline='').write(s.replace('\n', nl))
print('ok')
