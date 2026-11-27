# -*- coding: utf-8 -*-
"""Atlas completo de anatomía quirúrgica (UP1 a UP11 en un solo PDF) con portada, índice general, índice por estructura e índice por patología.
Uso: python atlas_completo.py   (lee salida/Atlas_Anatomia_Quirurgica_UPnn_Cirugia_NikaMed.pdf y escribe salida/Atlas_Anatomia_Quirurgica_COMPLETO_Cirugia_NikaMed.pdf)"""
import os, sys, re, glob, unicodedata, collections, subprocess, json
import pymupdf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B
from vocab_indice import ESTRUCTURAS, PATOLOGIAS
OUT = B.OUT
SALIDA = os.path.join(OUT, 'Atlas_Anatomia_Quirurgica_COMPLETO_Cirugia_NikaMed.pdf')
FRENTE = os.path.join(OUT, 'frente_completo.pdf')


def norm(t):
    t = unicodedata.normalize('NFD', t.lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')


def esc(t): return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def leer_unidades():
    unidades = []
    for n in range(1, 12):
        f = os.path.join(OUT, 'Atlas_Anatomia_Quirurgica_UP%02d_Cirugia_NikaMed.pdf' % n)
        d = pymupdf.open(f)
        toc = d.get_toc()
        l1 = [t for t in toc if t[0] == 1]
        up = [t for t in l1 if t[1].startswith('UP ')][0]
        i_up = l1.index(up)
        fin = l1[i_up + 1][2] - 1 if i_up + 1 < len(l1) else len(d)   # hasta antes de "Videos y recursos"
        mods = [t for t in toc if t[0] == 2 and up[2] <= t[2] <= fin]
        unidades.append(dict(n=n, f=f, doc=d, paginas=len(d), toc=toc, titulo=up[1], ini=up[2], fin=fin, mods=mods, l1=l1))
    return unidades


def conteos(unidades):
    lam = pre = 0
    for u in unidades:
        for p in u['doc']:
            t = p.get_text()
            lam += len(re.findall(r'L[ÁA]MINA \d+\.\d+', t)); pre += len(re.findall(r'SE PREGUNTA AS[ÍI] · Pregunta', t))
    return lam, pre


def indexar(unidades, offsets):
    """Devuelve {termino: {n_up: [paginas globales]}} para estructuras y patologías."""
    textos = []   # (n_up, pag_global, texto normalizado)
    for u in unidades:
        for i in range(u['ini'] - 1, u['fin']):
            textos.append((u['n'], offsets[u['n']] + i + 1, norm(u['doc'][i].get_text())))
    res = {}
    for lista, clave in ((ESTRUCTURAS, 'e'), (PATOLOGIAS, 'p')):
        for nombre, pat in lista:
            rx = re.compile(pat)
            por_up = collections.defaultdict(list)
            for n, g, t in textos:
                c = len(rx.findall(t))
                if c: por_up[n].append((c, g))
            sel = {}
            for n, l in por_up.items():
                top = sorted(sorted(l, key=lambda x: (-x[0], x[1]))[:3], key=lambda x: x[1])
                sel[n] = [g for _, g in top]
            if sel: res[(clave, nombre)] = sel
    return res


CSS = """
@page{size:A4;margin:0}
body{margin:0}
.fm{page-break-after:always;break-after:page;position:relative;min-height:297mm;padding:16mm 15mm 14mm 15mm;box-sizing:border-box}
.fm h1{font-family:Pop;font-weight:bold;font-size:22pt;margin:0 0 4pt 0;color:#0b1f44}
.fm h2{font-family:Pop;font-weight:bold;font-size:13pt;margin:12pt 0 5pt 0;color:#0b1f44}
.fm .lead{font-size:10pt;color:#475569;margin:0 0 10pt 0;line-height:1.4}
.upb{border-radius:8pt;margin:0 0 8pt 0;overflow:hidden;border:1pt solid #e2e8f0;break-inside:avoid}
.upb .h{display:flex;justify-content:space-between;align-items:center;color:#fff;padding:5pt 10pt;font-family:Pop;font-weight:bold;font-size:10.5pt}
.upb .h span.pg{font-size:8pt;font-weight:normal;opacity:.95}
.upb ol{margin:4pt 10pt 5pt 26pt;padding:0;columns:2;column-gap:14pt}
.upb li{font-size:8.2pt;margin:0 0 1.5pt 0;break-inside:avoid;line-height:1.25}
.upb li i{font-style:normal;color:#64748b;font-size:7.4pt;white-space:nowrap}
.ixcols{column-count:2;column-gap:16pt}
.ixl{font-family:Pop;font-weight:bold;font-size:11pt;color:#fff;background:#0b1f44;border-radius:4pt;padding:1pt 8pt;margin:7pt 0 4pt 0;display:inline-block;break-after:avoid}
.ix{font-size:8.4pt;margin:0 0 3.2pt 0;line-height:1.3;break-inside:avoid}
.ix b{font-weight:bold;color:#0b1f44}
.ix .t{white-space:nowrap;margin-left:4pt;font-family:Pop;font-size:7.4pt}
.k{display:inline-block;border-radius:3pt;padding:0 3pt;margin-right:1pt;color:#fff;font-size:7pt}
.how{display:grid;grid-template-columns:1fr 1fr;gap:9pt;margin:8pt 0}
.how div{background:#f2f7ff;border:1pt solid #cfe0fb;border-radius:7pt;padding:8pt 10pt;font-size:9.2pt;line-height:1.35}
.how b{font-family:Pop;color:#0b1f44}
"""


def construir_html(unidades, offsets, indice, lam, pre, total_pag):
    css = open(os.path.join(B.GC, 'estilo.css'), encoding='utf-8').read()
    COL, OSC, CLA = B.COL, B.OSC, B.CLA
    nmod = sum(len(u['mods']) for u in unidades)
    stats = ''.join('<div style="width:34mm;height:26mm;background:#eef4ff;border-radius:6pt;text-align:center;padding-top:5mm"><div style="font-family:Pop;font-weight:bold;font-size:21pt;color:#1d4ed8">%s</div><div style="font-size:7.4pt;color:#475569">%s</div></div>' % (a, b)
                    for a, b in (('11', 'unidades problema'), (str(nmod), 'módulos'), (str(lam), 'láminas guiadas'), (str(pre), 'preguntas de oral')))
    portada = f'''<section class="fm" style="padding:0;background:#fff">
<div style="position:absolute;inset:0 0 auto 0;height:130mm;background:linear-gradient(135deg,#0b1f44,#1d4ed8 60%,#be123c)"></div>
<div style="position:absolute;right:-30mm;top:-24mm;width:110mm;height:110mm;border-radius:50%;background:#fff;opacity:.09"></div>
<div style="position:absolute;left:15mm;top:14mm;background:#fff;border-radius:8pt;padding:3mm 5mm">{B.logo_html(18)}</div>
<div style="position:absolute;right:15mm;top:16mm;border:1pt solid #fff;color:#fff;font-family:Pop;font-size:7.5pt;padding:4pt 14pt;border-radius:14pt">{B.FECHA.upper()}</div>
<div style="position:absolute;left:15mm;right:15mm;top:58mm;color:#fff">
 <div style="display:inline-block;background:#be123c;font-family:Pop;font-weight:bold;font-size:12pt;letter-spacing:1.4pt;padding:6pt 16pt;border-radius:20pt;margin-bottom:12pt">ATLAS COMPLETO · CIRUGÍA</div>
 <div style="font-family:Pop;font-weight:bold;font-size:33pt;line-height:1.08">Atlas de anatomía quirúrgica</div>
 <div style="font-family:Pop;font-size:13pt;margin-top:9pt;line-height:1.3;opacity:.95">Las 11 Unidades Problema en un solo libro, con índice por estructura y por patología</div>
</div>
<div style="position:absolute;left:15mm;right:15mm;top:142mm;display:flex;gap:5mm">{stats}</div>
<div style="position:absolute;left:15mm;right:15mm;top:177mm;font-size:10.5pt;color:#334155;line-height:1.45">Anatomía de cada región (<b>irrigación, inervación, linfáticos, recorrido y relaciones</b>), explicada para el examen oral y relacionada con las patologías de cada unidad, con láminas a color de atlas, imágenes de los libros de la cátedra, mapas del programa y preguntas de oral con respuesta modelo.</div>
<div style="position:absolute;left:15mm;right:15mm;top:213mm;background:#f2f7ff;border:1pt solid #cfe0fb;border-radius:7pt;padding:10pt 14pt;font-size:9.4pt;line-height:1.35"><b style="font-family:Pop">Aviso importante.</b> Es un atlas de estudio de elaboración propia, escrito a partir de los atlas, la bibliografía de cada unidad y la anatomía de referencia. <b>No reemplaza el criterio profesional ni la bibliografía</b> y no está asociado a la cátedra: verificá siempre la información con tu libro y con tu docente. Ante una duda, la lámina del atlas manda.</div>
<div style="position:absolute;left:15mm;top:246mm"><div style="font-size:7.5pt;color:#64748b">AUTOR</div><div style="font-family:Pop;font-weight:bold;font-size:14pt">{B.AUTOR}</div><div style="font-size:8.5pt;color:#64748b">nikamed.com.ar</div></div>
<div style="position:absolute;right:15mm;top:243mm;background:#fff;border:1pt solid #e2e8f0;border-radius:7pt;text-align:center;padding:2mm"><img src="{B.QR('sala')}" style="width:25mm"><div style="font-size:6.5pt;color:#64748b">Sala de estudio</div></div>
<div style="position:absolute;left:0;right:0;bottom:8mm;text-align:center;font-size:7pt;color:#64748b">Aprender · Entrenar · Mejorar</div>
</section>'''
    como = f'''<section class="fm"><h1>Cómo usar el atlas completo</h1>
<p class="lead">Es el conjunto de los 11 atlas de unidad en un único archivo, para buscar y estudiar sin cambiar de PDF.</p>
<div class="how">
<div><b>1 · Mirá el programa.</b> El <b>índice general</b> lista cada unidad con sus módulos y la página donde empiezan. Tocá cualquier número para saltar.</div>
<div><b>2 · Buscá por estructura.</b> En el <b>índice por estructura</b> (nervios, arterias, venas, regiones y órganos) cada término te lleva a las páginas donde se explica, en la unidad que corresponda.</div>
<div><b>3 · Buscá por patología.</b> El <b>índice por patología</b> te dice dónde se estudia cada cuadro (fractura, hernia, aneurisma…) y qué anatomía hay que nombrar.</div>
<div><b>4 · Estudiá como en el oral.</b> En cada módulo, las cajas “Así lo decís en el oral” y las preguntas del final te enseñan a responder en voz alta.</div>
</div>
<h2>Cómo se lee una referencia</h2>
<p class="lead"><b>UP1·87</b> significa <b>Unidad Problema 1, página 87 del libro completo</b> (la que muestra tu visor). Cada unidad conserva además su propia numeración al pie (“Página x de y”).</p>
<h2>Recursos que acompañan al atlas</h2>
<ul style="font-size:9.6pt;line-height:1.5;margin:0 0 0 14pt;padding:0">
<li>Cada unidad tiene su <b>mapa del programa</b>, la ruta de repaso en tres días y los <b>videos recomendados</b>.</li>
<li>Los códigos QR llevan a la <b>sala de estudio</b> y a las <b>flashcards</b> de la unidad en Nikamed.</li>
<li>Las láminas están numeradas por unidad (“Lámina 8.12”) y cada una trae qué mirar y su fuente.</li>
</ul>
<div style="position:absolute;left:15mm;right:15mm;bottom:14mm;font-size:8pt;color:#64748b">{esc(B.PIE)}</div></section>'''
    # índice general
    gen = ['<section class="fm"><h1>Índice general</h1><p class="lead">Cada unidad con sus módulos. Tocá el número de página para ir.</p>']
    for u in unidades:
        n = u['n']; off = offsets[n]
        lis = ''.join('<li>%s <i>UP%d·%d</i></li>' % (esc(re.sub(r'^\d+\.\s*', '', t[1])), n, off + t[2]) for t in u['mods'])
        gen.append('<div class="upb"><div class="h" style="background:%s"><span>%s</span><span class="pg">págs. %d–%d · <b>UP%d·%d</b></span></div><ol>%s</ol></div>' %
                   (COL[n], esc(u['titulo']), off + 1, off + u['paginas'], n, off + u['ini'], lis))
    gen.append('</section>')

    def seccion(titulo, intro, clave):
        items = sorted([(k[1], v) for k, v in indice.items() if k[0] == clave], key=lambda x: norm(x[0]))
        out = ['<section class="fm"><h1>%s</h1><p class="lead">%s</p><div class="ixcols">' % (titulo, intro)]
        letra = None
        for nombre, por_up in items:
            l = norm(nombre)[0].upper()
            if l != letra:
                letra = l; out.append('<div class="ixl">%s</div>' % l)
            toks = ' '.join('<span class="t">%s</span>' % ' '.join('<b style="color:%s">UP%d·%d</b>' % (OSC[n], n, g) for g in pgs) for n, pgs in sorted(por_up.items()))
            out.append('<div class="ix"><b>%s</b> %s</div>' % (esc(nombre), toks))
        out.append('</div></section>')
        return ''.join(out)
    est = seccion('Índice por estructura', 'Nervios, arterias, venas, regiones, órganos y huesos. Para cada término, hasta tres páginas por unidad donde más se explica.', 'e')
    pat = seccion('Índice por patología', 'Cada cuadro con las unidades y páginas donde se estudia la anatomía que lo explica.', 'p')
    body = portada + como + ''.join(gen) + est + pat
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Atlas completo</title><style>%s%s</style></head><body>%s</body></html>' % (css, CSS, body)


def tokens_de(indice, unidades, offsets):
    toks = {}
    for u in unidades:
        n = u['n']
        toks['UP%d·%d' % (n, offsets[n] + u['ini'])] = offsets[n] + u['ini']
        for t in u['mods']: toks['UP%d·%d' % (n, offsets[n] + t[2])] = offsets[n] + t[2]
    for por_up in indice.values():
        for n, pgs in por_up.items():
            for g in pgs: toks['UP%d·%d' % (n, g)] = g
    return toks


def main():
    unidades = leer_unidades()
    lam, pre = conteos(unidades)
    print('láminas', lam, 'preguntas', pre, 'páginas', sum(u['paginas'] for u in unidades))
    nfrente = 14
    for it in range(4):
        offsets, acum = {}, nfrente
        for u in unidades: offsets[u['n']] = acum; acum += u['paginas']
        indice = indexar(unidades, offsets)
        html = construir_html(unidades, offsets, indice, lam, pre, acum)
        B.render(html, FRENTE)
        real = len(pymupdf.open(FRENTE))
        print('iteración', it, 'frente', real, '(supuesto %d)' % nfrente)
        if real == nfrente: break
        nfrente = real
    # unir
    doc = pymupdf.open(FRENTE)
    for u in unidades: doc.insert_pdf(u['doc'])
    # enlaces desde el frente
    toks = tokens_de(indice, unidades, offsets)
    nlinks = 0
    for pn in range(nfrente):
        pg = doc[pn]
        for w in pg.get_text('words'):
            g = toks.get(w[4].strip('.,;:()'))
            if g:
                pg.insert_link({'kind': pymupdf.LINK_GOTO, 'from': pymupdf.Rect(w[:4]), 'page': g - 1, 'to': pymupdf.Point(0, 0)}); nlinks += 1
    print('enlaces internos:', nlinks)
    # marcadores
    def pag_de(txt, defecto):
        for i in range(nfrente):
            if re.search(r'^\s*' + txt, doc[i].get_text(), re.M): return i + 1
        return defecto
    toc = [[1, 'Portada', 1], [1, 'Cómo usar el atlas completo', 2], [1, 'Índice general', pag_de('Índice general', 3)],
           [1, 'Índice por estructura', pag_de('Índice por estructura', 5)], [1, 'Índice por patología', pag_de('Índice por patología', nfrente - 2)]]
    for u in unidades:
        n = u['n']; off = offsets[n]
        toc.append([1, u['titulo'], off + 1])
        for t in u['toc']:
            if t[0] == 2 and u['ini'] <= t[2] <= u['fin']: toc.append([2, t[1], off + t[2]])
        v = [t for t in u['l1'] if t[1].startswith('Videos')]
        if v: toc.append([2, 'Videos y recursos recomendados', off + v[0][2]])
    doc.set_toc(toc)
    doc.set_metadata({'title': 'Atlas de anatomía quirúrgica · Cirugía (completo, UP1 a UP11)', 'author': B.AUTOR, 'subject': 'Atlas de anatomía quirúrgica NikaMed'})
    if os.path.exists(SALIDA): os.remove(SALIDA)
    doc.save(SALIDA, garbage=4, deflate=True)
    print('listo', len(doc), 'págs', round(os.path.getsize(SALIDA) / 1e6, 1), 'MB ->', SALIDA)


if __name__ == '__main__':
    main()
