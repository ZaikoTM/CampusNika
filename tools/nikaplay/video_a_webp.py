# -*- coding: utf-8 -*-
"""Convierte el video del doctor (fondo verde) en un WebP animado con transparencia para la pantalla de inicio de NikaWord.
Uso: python tools/nikaplay/video_a_webp.py <video.mp4> [segundos=3.2] [fps=12] [ancho=420]
Quita el fondo verde (chroma key con suavizado y limpieza de bordes), recorta al personaje y arma un bucle ida y vuelta (sin saltos)."""
import sys, os, numpy as np, cv2
from PIL import Image

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
src = sys.argv[1]
seg = float(sys.argv[2]) if len(sys.argv) > 2 else 3.2
fps = int(sys.argv[3]) if len(sys.argv) > 3 else 12
ancho = int(sys.argv[4]) if len(sys.argv) > 4 else 420
salida = os.path.join(RAIZ, 'assets', 'nikaplay', 'doctor', 'saluda.webp')
poster = os.path.join(RAIZ, 'assets', 'nikaplay', 'doctor', 'saluda-poster.webp')

v = cv2.VideoCapture(src); vfps = v.get(cv2.CAP_PROP_FPS); total = int(v.get(cv2.CAP_PROP_FRAME_COUNT))
paso = max(1, round(vfps / fps)); frames = []
i = 0
while i < min(total, int(seg * vfps)):
    v.set(cv2.CAP_PROP_POS_FRAMES, i); ok, f = v.read()
    if not ok: break
    frames.append(f); i += paso


def clave(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, val = hsv[..., 0], hsv[..., 1] / 255, hsv[..., 2] / 255
    # verde del fondo: tono ~60-85 (escala 0-180) con saturación media/alta
    verde = np.clip(1 - np.abs(h - 72) / 22, 0, 1) * np.clip((s - .25) / .25, 0, 1)
    alfa = 1 - verde
    alfa = cv2.GaussianBlur(alfa, (0, 0), 1.0)
    alfa = np.clip((alfa - .15) / .7, 0, 1)
    # quitar el reflejo verde en los bordes (despill): el canal G no puede pasar del promedio de R y B
    b, g, r = bgr[..., 0].astype(np.float32), bgr[..., 1].astype(np.float32), bgr[..., 2].astype(np.float32)
    g2 = np.minimum(g, (r + b) / 2 + 6)
    out = np.dstack([r, g2, b, alfa * 255]).astype(np.uint8)
    return out


rgba = [clave(f) for f in frames]
# caja común del personaje
union = None
for a in rgba:
    m = (a[..., 3] > 40).astype(np.uint8)
    # ignorar ruido: abrir
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    ys, xs = np.where(m > 0)
    if len(xs):
        caja = (xs.min(), ys.min(), xs.max(), ys.max()); union = caja if union is None else (min(union[0], caja[0]), min(union[1], caja[1]), max(union[2], caja[2]), max(union[3], caja[3]))
mx = 8
x0, y0, x1, y1 = max(0, union[0] - mx), max(0, union[1] - mx), min(rgba[0].shape[1], union[2] + mx), union[3] + 1
print('caja', x0, y0, x1, y1)
imgs = []
for a in rgba:
    c = a[y0:y1, x0:x1]
    # limpiar motas sueltas del fondo: quedarse con el componente grande
    al = (c[..., 3] > 40).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(al)
    if n > 1:
        grande = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); c = c.copy(); c[..., 3] = np.where(lab == grande, c[..., 3], 0)
    im = Image.fromarray(c, 'RGBA'); h = round(im.height * ancho / im.width); imgs.append(im.resize((ancho, h), Image.LANCZOS))
bucle = imgs + imgs[-2:0:-1]     # ida y vuelta
dur = int(1000 / fps)
bucle[0].save(salida, 'WEBP', save_all=True, append_images=bucle[1:], duration=dur, loop=0, quality=72, method=4, alpha_quality=90)
imgs[0].save(poster, 'WEBP', quality=88, method=4, alpha_quality=100)
print('frames', len(bucle), 'tam', os.path.getsize(salida) // 1024, 'KB', imgs[0].size)
