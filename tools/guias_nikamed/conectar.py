"""Conecta las Guías NikaMed (completa y rápida) de Ginecología a data/gineco_data.json.
Uso: python tools/guias_nikamed/conectar.py ids.json
ids.json = {"Guia_completa_up1.pdf": "<id de Drive>", ..., "Guia_completa_LIBRO": "<id>", "Guia_rapida_LIBRO": "<id>"}
Es idempotente: borra las entradas '· Guías NikaMed' anteriores y las vuelve a escribir."""
import json, sys, re
ids = json.load(open(sys.argv[1], encoding='utf-8'))
meta = json.load(open('tools/guias_nikamed/meta.json', encoding='utf-8'))
P = 'data/gineco_data.json'
d = json.load(open(P, encoding='utf-8'))
SUF = ' · Guías NikaMed'
url = lambda i: f'https://drive.google.com/file/d/{i}/view?usp=drive_link'
def destino(k):
    if k.startswith('up3-'):
        sec = next(s for u in d['units'] if u['id'] == 'up3' for s in u['secciones'] if s['id'] == k)
        return sec
    return next(u for u in d['units'] if u['id'] == k)
for u in d['units']:
    for t in [u] + u.get('secciones', []):
        t['materiales'] = [m for m in t.get('materiales', []) if not m['title'].endswith(SUF)]
nombre = {'completa': 'Guía completa', 'rapida': 'Guía rápida'}
for m in meta:
    if m['archivo'] not in ids: continue
    t = destino(m['clave'])
    tema = re.sub(r'^UP \d+(?: · Sec\. \d+)? · ', '', m['titulo'])
    t['materiales'].append({'title': f"📖 {nombre[m['tipo']]}: {tema}{SUF}", 'url': url(ids[m['archivo']]), 'type': 'pdf'})
up1 = destino('up1')
for tipo, pags in (('completa', 745), ('rapida', 217)):
    k = f'Guia_{tipo}_LIBRO'
    if k in ids:
        up1['materiales'].insert(0, {'title': f"📖 {nombre[tipo]} de Ginecología y Obstetricia, libro entero ({pags} págs.){SUF}", 'url': url(ids[k]), 'type': 'pdf'})
json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
