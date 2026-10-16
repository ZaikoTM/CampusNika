#!/usr/bin/env python3
"""Vectoriza la N de NIKA (3 caras con degradado) y el texto NIKA (2 colores) a SVG limpios.
Entradas: assets/n-nika-hd-1024.webp y assets/nika-texto-hd.webp. Salidas: assets/n-nika.svg y assets/nika-texto.svg"""
import os, numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def contornos(mask, eps):
    cs, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if cv2.contourArea(c) < 12: continue
        ap = cv2.approxPolyDP(c, eps, True).reshape(-1, 2)
        out.append(ap)
    return out

def path_d(polys, f=1):
    return ' '.join('M' + ' L'.join('%.1f %.1f' % (x / f, y / f) for x, y in p) + 'Z' for p in polys)

def n_svg():
    im = np.array(Image.open(os.path.join(ROOT, 'assets/n-nika-hd-1024.webp')).convert('RGBA'))
    H, W = im.shape[:2]
    a = im[..., 3]
    full = (a > 100).astype(np.uint8) * 255
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # rectas internas (coordenadas de la imagen de 1024): borde inferior-izquierdo y superior-derecho de la cinta diagonal
    def signed(p, q, sign):
        (x1, y1), (x2, y2) = p, q
        d = (x2 - x1) * (yy - y1) - (y2 - y1) * (xx - x1)
        return d * sign / np.hypot(x2 - x1, y2 - y1)
    s1 = signed((25, 152), (687, 920), -1)      # >0: lado superior-derecho de L1
    s2 = signed((290, 189), (730, 578), 1)      # >0: lado inferior-izquierdo de L2
    # L2 se prolonga hasta el borde derecho: pendiente de la recta
    ribbon = (s1 >= 0) & (s2 >= 0)
    left = (s1 < 0) & (xx < 520)
    right = (s2 < 0) & (xx > 600)
    caras = {'izq': left, 'cinta': ribbon, 'der': right}
    defs, shapes = '', ''
    for k, m in caras.items():
        mk = ((m & (full > 0)).astype(np.uint8)) * 255
        mk = cv2.morphologyEx(mk, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        ys, xs = np.nonzero(mk)
        if len(xs) < 50: continue
        cols = im[ys, xs, :3].astype(np.float32)
        # degradado lineal por regresión: color ≈ c0 + gx·x + gy·y ; se toma la dirección de mayor variación
        A = np.stack([xs - xs.mean(), ys - ys.mean(), np.ones_like(xs)], 1).astype(np.float32)
        coef, *_ = np.linalg.lstsq(A, cols, rcond=None)          # 3 x 3
        lum = coef[:2] @ np.array([0.3, 0.55, 0.15])          # gradiente de luminosidad (gx, gy)
        d = lum / (np.hypot(*lum) + 1e-9)                        # dirección del degradado
        proj = (xs - xs.mean()) * d[0] + (ys - ys.mean()) * d[1]
        lo, hi = np.percentile(proj, 1), np.percentile(proj, 99)
        stops = ''
        for i in range(7):
            t = i / 6.0
            sel = (proj >= lo + (hi - lo) * max(0, t - 0.08)) & (proj <= lo + (hi - lo) * min(1, t + 0.08))
            c = cols[sel].mean(0) if sel.any() else cols.mean(0)
            stops += '<stop offset="%.2f" stop-color="#%02x%02x%02x"/>' % (t, *[int(round(v)) for v in c])
        x1, y1 = xs.mean() + d[0] * lo, ys.mean() + d[1] * lo
        x2, y2 = xs.mean() + d[0] * hi, ys.mean() + d[1] * hi
        defs += '<linearGradient id="g%s" gradientUnits="userSpaceOnUse" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f">%s</linearGradient>' % (k, x1, y1, x2, y2, stops)
        polys = contornos(mk, 0.9)
        shapes += '<path fill="url(#g%s)" stroke="url(#g%s)" stroke-width="1.2" stroke-linejoin="round" d="%s"/>' % (k, k, path_d(polys))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" aria-label="N de NIKA"><defs>%s</defs>%s</svg>' % (W, H, defs, shapes))
    open(os.path.join(ROOT, 'assets/n-nika.svg'), 'w', encoding='utf8').write(svg)
    return len(svg)

def texto_svg():
    t = Image.open(os.path.join(ROOT, 'assets/nika-texto-hd.webp')).convert('RGBA')
    k = 4
    t = t.resize((t.width * k, t.height * k), Image.LANCZOS)
    im = np.array(t); a = im[..., 3]
    rgb = im[..., :3].astype(np.float32)
    azul = (rgb[..., 2] > 170) & (rgb[..., 0] < 110) & (a > 100)   # solo el acento azul claro de la «A»
    azul = cv2.morphologyEx(azul.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)) > 0
    navy = (a > 100)                                                  # toda la tipografía; el acento se dibuja encima
    shapes = ''
    for mask, col in ((navy, '#0b1b3b'), (azul, '#1e90ff')):
        mk = mask.astype(np.uint8) * 255
        mk = cv2.GaussianBlur(mk, (0, 0), 1.4); mk = (mk > 127).astype(np.uint8) * 255
        # color real medio de la región
        if mask.any():
            sel = mask & (a > 250)
            c = rgb[sel].mean(0) if sel.any() else rgb[mask].mean(0); col = '#%02x%02x%02x' % tuple(int(v) for v in c)
        shapes += '<path fill="%s" fill-rule="evenodd" d="%s"/>' % (col, path_d(contornos(mk, 1.2), k))
    w, h = t.width // k, t.height // k
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" aria-label="NIKA">%s</svg>' % (w, h, shapes)
    open(os.path.join(ROOT, 'assets/nika-texto.svg'), 'w', encoding='utf8').write(svg)
    return len(svg)

if __name__ == '__main__':
    print('n-nika.svg', n_svg() // 1024, 'KB')
    print('nika-texto.svg', texto_svg() // 1024, 'KB')
