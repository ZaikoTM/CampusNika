# -*- coding: utf-8 -*-
"""Guía de anatomía quirúrgica por UP (Cirugía). Uso: python build.py 1 [2 3 ...]
Motor y estilo reutilizados de tools/guia_cirugia (lib.py, estilo.css). Contenido en contenido/upNN.py -> crear() devuelve lib.Unidad."""
import os, sys, subprocess, importlib, shutil
import pymupdf
HERE = os.path.dirname(os.path.abspath(__file__))
GC = os.path.join(os.path.dirname(HERE), 'guia_cirugia')
sys.path.insert(0, GC); sys.path.insert(0, HERE)
import lib
from lib import fmt
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
OUT = os.path.join(HERE, 'salida')
COL = {1: ('#0ea5e9', '#0369a1', '#e6f6fd'), 2: ('#f59e0b', '#b45309', '#fff6dd'), 3: ('#16a34a', '#166534', '#e7f6ec'), 4: ('#7c3aed', '#5b21b6', '#f1ebff'),
       5: ('#e11d48', '#9f1239', '#fdecef'), 6: ('#0ea5e9', '#0369a1', '#e6f6fd'), 7: ('#14b8a6', '#0f766e', '#e5f8f5'), 8: ('#4f46e5', '#3730a3', '#ecebff'),
       9: ('#7c3aed', '#5b21b6', '#f1ebff'), 10: ('#c026d3', '#86198f', '#fbe9fd'), 11: ('#f97316', '#c2410c', '#fff0e3')}
EXTRA = """
.cv{page:cover;width:210mm;height:297mm;position:relative;overflow:hidden;break-after:page;background:var(--cd);color:#fff;font-family:Pop,sans-serif}
.cv .a{position:absolute;left:18mm;top:70mm;right:18mm}.cv h1{font-size:34pt;line-height:1.1;margin:0 0 8mm;font-weight:bold}
.cv .s{font-size:14pt;font-weight:500;opacity:.95;margin-bottom:10mm}.cv .b{position:absolute;left:18mm;right:18mm;bottom:22mm;font-size:9.5pt;line-height:1.5}
.cv .up{display:inline-block;background:#fff;color:var(--cd);font-weight:bold;font-size:12pt;padding:3mm 7mm;border-radius:20pt;margin-bottom:8mm}
.idx{page-break-after:always}.idx h2{margin-top:0}.idx li{font-size:10.5pt;margin-bottom:4pt}
.how p,.how li{font-size:10pt}
"""

def armar(u):
    c, cd, cl = COL[u.n]
    mods = ''.join('<li><b>%s</b></li>' % fmt(t) for _, t, _ in u.mods)
    cont = ''.join('<li>%s</li>' % fmt(x) for x in u.resumen)
    portada = ('<div class="cv unidad" style="--c:%s;--cd:%s;--cl:%s"><div class="a"><div class="up">UNIDAD PROBLEMA %d</div><h1>Anatomía quirúrgica<br>%s</h1>'
               '<div class="s">%s</div></div><div class="b">NikaMed · Cirugía · Guía de anatomía por unidad<br>%s<br>Elaboración propia a partir de anatomía de referencia y de la bibliografía de la cátedra. '
               'No reemplaza el criterio profesional ni está asociada a ninguna institución · Verificá siempre la información.</div></div>') % (c, cd, cl, u.n, fmt(u.titulo), fmt(u.sub), 'Noviembre 2026')
    indice = ('<div class="unidad idx" style="--c:%s;--cd:%s;--cl:%s"><h2><span class="mn">i</span>Qué vas a encontrar</h2>'
              '<p>Cada región se estudia siempre con el mismo orden: <b>límites y planos</b>, <b>esqueleto y articulaciones</b>, <b>músculos</b>, <b>irrigación</b>, <b>inervación</b>, <b>drenaje linfático y venoso</b>, '
              '<b>recorrido de los elementos</b> y <b>relaciones anatómicas</b>, y al final <b>qué se lesiona y qué se explora</b> (la anatomía aplicada que se toma en el examen).</p>'
              '<h3>Contenido del programa que cubre esta guía</h3><ul>%s</ul><h3>Módulos</h3><ol>%s</ol></div>') % (c, cd, cl, cont, mods)
    return ('<!doctype html><html><head><meta charset="utf-8"><style>%s%s</style></head><body>%s%s'
            '<div class="unidad" style="--c:%s;--cd:%s;--cl:%s">%s</div></body></html>') % (
        open(os.path.join(GC, 'estilo.css'), encoding='utf-8').read(), EXTRA, portada, indice, c, cd, cl, ''.join(u.partes_final))

def render(htm, pdf):
    subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + pdf, '--virtual-time-budget=20000', 'file:///' + htm.replace(chr(92), '/')],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def pie(src, dst, n, titulo):
    d = pymupdf.open(src); N = d.page_count
    for i, p in enumerate(d):
        if i == 0: continue
        r = p.rect
        p.insert_text((40, r.height - 22), 'NikaMed · Anatomía quirúrgica · UP %d · %s' % (n, titulo), fontsize=7.5, color=(.4, .45, .55))
        p.insert_text((r.width - 60, r.height - 22), '%d / %d' % (i + 1, N), fontsize=7.5, color=(.4, .45, .55))
    d.set_metadata({'title': 'Anatomía quirúrgica · UP %d · %s · NikaMed' % (n, titulo), 'author': 'NikaMed'})
    d.save(dst, garbage=4, deflate=True)

def main():
    for a in sys.argv[1:] or ['1']:
        n = int(a); m = importlib.import_module('contenido.up%02d' % n)
        u = m.crear().finalizar()
        htm = os.path.join(OUT, 'up%02d.html' % n); open(htm, 'w', encoding='utf-8').write(armar(u))
        tmp = os.path.join(OUT, 'up%02d_raw.pdf' % n); render(htm, tmp)
        fin = os.path.join(OUT, 'Anatomia_Quirurgica_UP%02d_Cirugia_NikaMed.pdf' % n); pie(tmp, fin, n, u.titulo)
        print('UP', n, pymupdf.open(fin).page_count, 'págs ->', fin)

if __name__ == '__main__':
    main()
