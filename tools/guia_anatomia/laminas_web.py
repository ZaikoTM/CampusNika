# -*- coding: utf-8 -*-
"""Genera el material del 'Modo láminas': imagen WebP de cada lámina de Netter usada en el atlas y la posición de cada etiqueta (para taparla).
Salida: assets/atlas/laminas/S-n.webp y data/atlas_laminas.json"""
import os, sys, json, io
import pymupdf
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
NET = r'C:/Users/Augusto/Desktop/Medicina/Netter Atlas de Anatomia Humana 8a Edicion.pdf'
OUT_IMG = os.path.join(RAIZ, 'assets', 'atlas', 'laminas')
OUT_JSON = os.path.join(RAIZ, 'data', 'atlas_laminas.json')
os.makedirs(OUT_IMG, exist_ok=True)
DPI = 118
cat = json.load(open(os.path.join(HERE, 'trabajo', 'catalogo_laminas.json'), encoding='utf-8'))
idx = {s: p for p, s, _, _ in json.load(open(os.path.join(HERE, 'trabajo', 'netter_idx.json'), encoding='utf-8'))}
d = pymupdf.open(NET)
placas = []
omitidas = []


def orden_num(c): return int(c.split('-')[1])


for code in sorted(cat, key=orden_num):
    c = cat[code]
    if code not in idx: omitidas.append((code, 'sin índice')); continue
    p = d[idx[code] - 1]
    W, H = p.rect.width, p.rect.height
    util = pymupdf.Rect(0, 0, W, H * 0.952)           # sin la marca de agua inferior
    cajas = []
    for b in p.get_text('blocks'):
        if b[6] != 0: continue
        x0, y0, x1, y1, txt = b[0], b[1], b[2], b[3], b[4].strip()
        if y0 < 58 or y1 > util.y1 - 2: continue       # franja del título y pie
        if not txt or len(txt) > 130 or txt.count('\n') > 5: continue   # párrafos explicativos: no se tapan
        if txt.replace('\n', '').isdigit(): continue
        cajas.append((x0, y0, x1, y1, ' '.join(txt.split())))
    if len(cajas) < 4:
        omitidas.append((code, 'pocas etiquetas (%d)' % len(cajas))); continue
    pm = p.get_pixmap(dpi=DPI, clip=util, colorspace=pymupdf.csRGB)
    im = Image.frombytes('RGB', (pm.width, pm.height), pm.samples)
    im.save(os.path.join(OUT_IMG, code + '.webp'), 'WEBP', quality=72, method=5)
    uw, uh = util.width, util.height
    r = [[round(x0 / uw * 1000), round(y0 / uh * 1000), round(x1 / uw * 1000), round(y1 / uh * 1000)] for x0, y0, x1, y1, _ in cajas]
    t = [tx for *_, tx in cajas]
    placas.append(dict(c=code, t=c['titulo'], u=c['ups'], m=c['mirar'][:3], w=pm.width, h=pm.height, r=r, e=t))
json.dump(dict(version=1, placas=placas), open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
peso = sum(os.path.getsize(os.path.join(OUT_IMG, f)) for f in os.listdir(OUT_IMG)) / 1e6
print(len(placas), 'láminas,', round(peso, 1), 'MB de imágenes;', round(os.path.getsize(OUT_JSON) / 1e3), 'KB de datos')
print('omitidas:', omitidas)
