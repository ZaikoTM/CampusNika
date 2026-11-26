# -*- coding: utf-8 -*-
"""Extrae láminas a color de los atlas de Netter (8.ª ed.) y Gray (3.ª ed.) a img/ como JPEG, sin la marca de agua del sitio de descarga.
Netter: la marca 'booksmedicos.org' está debajo del pie de página -> se recorta el borde inferior.
Gray:   la marca está arriba, junto al número de página -> se recorta el borde superior.
Uso: python laminas.py  (lee LAMINAS de contenido/laminas_lista.py)"""
import os, sys, json, re
import pymupdf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from contenido.laminas_lista import NETTER, GRAY
NET = r'C:/Users/Augusto/Desktop/Medicina/Netter Atlas de Anatomia Humana 8a Edicion.pdf'
GRA = r'C:/Users/Augusto/Desktop/Medicina/Gray Atlas de Anatomia 3a Edicion.pdf'
OUT = os.path.join(HERE, 'img'); os.makedirs(OUT, exist_ok=True)
idx = {s: p for p, s, _, _ in json.load(open(os.path.join(HERE, 'trabajo', 'netter_idx.json'), encoding='utf-8'))}
DPI = 160


def guardar(pg, dst, clip):
    pm = pg.get_pixmap(dpi=DPI, clip=clip, colorspace=pymupdf.csRGB)
    pm.save(dst, jpg_quality=88)
    return os.path.getsize(dst) // 1024


def main():
    n = pymupdf.open(NET); g = pymupdf.open(GRA); tot = 0
    for s in NETTER:
        dst = os.path.join(OUT, 'netter_%s.jpg' % s)
        if os.path.exists(dst): continue
        pg = n[idx[s] - 1]; r = pg.rect
        tot += guardar(pg, dst, pymupdf.Rect(0, 0, r.width, r.height * 0.952))
    for p in GRAY:
        dst = os.path.join(OUT, 'gray_p%d.jpg' % p)
        if os.path.exists(dst): continue
        pg = g[p - 1]; r = pg.rect
        tot += guardar(pg, dst, pymupdf.Rect(0, r.height * 0.075, r.width, r.height))
    print('listo', tot // 1024, 'MB nuevos')


if __name__ == '__main__':
    main()
