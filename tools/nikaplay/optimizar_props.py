# -*- coding: utf-8 -*-
"""Recorta cada render prop-*.png (tools/nikaplay/doctor3d/render/) a su caja visible y lo guarda como WebP en assets/nikaplay/props/.
Uso: python tools/nikaplay/optimizar_props.py [ancho_max]"""
import os, sys, glob
from PIL import Image

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ORIGEN = os.path.join(RAIZ, 'tools', 'nikaplay', 'doctor3d', 'render')
DESTINO = os.path.join(RAIZ, 'assets', 'nikaplay', 'props')
ancho_max = int(sys.argv[1]) if len(sys.argv) > 1 else 640
os.makedirs(DESTINO, exist_ok=True)
for ruta in sorted(glob.glob(os.path.join(ORIGEN, 'prop-*.png'))):
    im = Image.open(ruta).convert('RGBA')
    caja = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if caja: im = im.crop(caja)
    if im.width > ancho_max: im = im.resize((ancho_max, round(im.height * ancho_max / im.width)), Image.LANCZOS)
    salida = os.path.join(DESTINO, os.path.basename(ruta)[5:-4] + '.webp')
    im.save(salida, 'WEBP', quality=88, method=4, alpha_quality=100)
    print('%-16s %dx%d %d KB' % (os.path.basename(salida), im.width, im.height, os.path.getsize(salida) // 1024))
