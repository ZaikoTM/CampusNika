# -*- coding: utf-8 -*-
"""Pasa los renders a resolución completa (tools/nikaplay/doctor3d/render/*.png) a WebP con transparencia
en assets/nikaplay/doctor/, que es lo que usa el juego. Uso: python tools/nikaplay/optimizar_doctor.py [ancho]"""
import os, sys, glob
from PIL import Image

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ORIGEN = os.path.join(RAIZ, 'tools', 'nikaplay', 'doctor3d', 'render')
DESTINO = os.path.join(RAIZ, 'assets', 'nikaplay', 'doctor')
ancho = int(sys.argv[1]) if len(sys.argv) > 1 else 800

os.makedirs(DESTINO, exist_ok=True)
rutas = sorted(glob.glob(os.path.join(ORIGEN, 'doctor-*.png')))
# marco común: unión de las cajas visibles de TODAS las poses (+ margen) para que el personaje quede grande y sin saltos entre poses
union = None
for ruta in rutas:
    caja = Image.open(ruta).convert('RGBA').getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if caja: union = caja if union is None else (min(union[0], caja[0]), min(union[1], caja[1]), max(union[2], caja[2]), max(union[3], caja[3]))
im0 = Image.open(rutas[0]); mx, my = round(im0.width * 0.02), round(im0.height * 0.015)
marco = (max(0, union[0] - mx), max(0, union[1] - my), min(im0.width, union[2] + mx), min(im0.height, union[3] + my))
print('marco común', marco)
total = 0
for ruta in rutas:
    im = Image.open(ruta).convert('RGBA').crop(marco)
    alto = round(im.height * ancho / im.width)
    im = im.resize((ancho, alto), Image.LANCZOS)
    salida = os.path.join(DESTINO, os.path.basename(ruta)[:-4] + '.webp')
    im.save(salida, 'WEBP', quality=90, method=4, alpha_quality=100)
    tam = os.path.getsize(salida); total += tam
    print('%-24s %dx%d  %d KB' % (os.path.basename(salida), ancho, alto, tam // 1024))
print('total %d KB' % (total // 1024))
