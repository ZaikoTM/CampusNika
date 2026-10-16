#!/usr/bin/env python3
"""Genera data/guardia_manifest.json: huella (hash) de cada archivo que el Modo Guardia puede descargar.
El modal compara la huella guardada en el dispositivo con la de este manifiesto y baja solo lo que cambió (o se agregó/quitó).
Volver a ejecutar en cada deploy que cambie archivos descargables:  python tools/gen_guardia_manifest.py"""
import hashlib, json, os, re, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = r'(?:html|js|css|json|webp|svg|png|jpg|woff2|pdf)'

def candidatos():
    urls = set()
    src = open(os.path.join(ROOT, 'js/guardiaModal.js'), encoding='utf8').read()
    for m in re.finditer(r"""['"]([A-Za-z0-9_./-]+\.""" + EXT + r""")['"]""", src):
        urls.add(m.group(1))
    # bancos por materia: data/${u}_${mat}.json se arma en tiempo de ejecución; se listan los existentes
    for f in os.listdir(os.path.join(ROOT, 'data')):
        if re.match(r'^(UP\d|\d\d_|up)', f) or re.search(r'_(cirugia|ginecologia|siam)\.json$', f):
            urls.add('data/' + f)
    listas = os.path.join(ROOT, 'data/guardia_listas.json')
    if os.path.exists(listas):
        for l in json.load(open(listas, encoding='utf8')).values():
            urls.update(l)
    return urls

def huella(path):
    b = open(path, 'rb').read()
    if re.search(r'\.(html|js|css|json|svg)$', path):
        b = b.replace(b'\r\n', b'\n')
    return hashlib.sha1(b).hexdigest()[:10]

def main():
    files = {}
    for u in sorted(candidatos()):
        p = os.path.join(ROOT, u.lstrip('/'))
        if os.path.isfile(p):
            files[u] = huella(p)
    # la versión cambia cuando cambia cualquier archivo
    v = hashlib.sha1(json.dumps(files, sort_keys=True).encode()).hexdigest()[:8]
    out = {'v': v, 't': datetime.date.today().isoformat(), 'f': files}
    json.dump(out, open(os.path.join(ROOT, 'data/guardia_manifest.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print('manifiesto', v, len(files), 'archivos')

if __name__ == '__main__':
    main()
