# -*- coding: utf-8 -*-
"""Genera el PDF de práctica 'Parcial integrador' (casos clínicos con opciones múltiples y justificación) con la estética del PDF de Ginecología.
Uso: python tools/parciales_pdf/build.py segundo_cirugia [--demo N]
Datos: data/banco_up06..11.json (cirugía). Títulos de casos: tools/parciales_pdf/titulos/<parcial>.json (clave 'up-id'); si falta uno, se deriva un título provisorio."""
import json, os, re, sys, html
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
A = os.path.join(HERE, 'assets')
FONTS = os.path.join(HERE, 'fonts')
W, H = 595.276, 841.89
NAVY = (0.043, 0.122, 0.267); BLUE = (0.114, 0.435, 0.91); GREY = (0.39, 0.45, 0.55); LINE = (0.82, 0.87, 0.93); PALE = (0.93, 0.96, 1.0)
hexrgb = lambda h: tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
AUTOR = 'Blanc Weigandt, Augusto'; FECHA = 'Octubre 2026'
PIE = 'Casos de práctica de elaboración propia · No reemplazan el criterio profesional ni están asociados a la cátedra · Verificá siempre las respuestas'

PARCIALES = {
    'segundo_cirugia': dict(
        corto='Segundo parcial Cirugía 2026', area='CIRUGÍA', titulo1='SEGUNDO PARCIAL', titulo2='Cirugía 2026',
        archivo='Segundo_Parcial_Cirugia_2026_Blanc_Weigandt_NikaMed.pdf', mat='cirugia',
        unidades=[
            dict(n=6, color='#0ea5e9', titulo='Dolor inguinal en adultos', sub='Hernias de la pared abdominal y del suelo inguinal'),
            dict(n=7, color='#14b8a6', titulo='Tumoración cervical', sub='Patología del cuello, tiroides y paratiroides'),
            dict(n=8, color='#4f46e5', titulo='Patología musculoesquelética de los miembros inferiores', sub='Trauma, lesiones y enfermedades del aparato locomotor'),
            dict(n=9, color='#7c3aed', titulo='Atención prehospitalaria al politraumatizado y procuración', sub='Trauma, quemados, shock y donación de órganos'),
            dict(n=10, color='#c026d3', titulo='Enfermedad vascular periférica', sub='Patología arterial y venosa de los miembros'),
            dict(n=11, color='#f97316', titulo='Obstrucción urinaria baja en el adulto mayor', sub='Patología urológica quirúrgica'),
        ]),
}

# ---------------------------------------------------------------- datos
def limpiar(t):
    return re.sub(r'\s+', ' ', str(t or '')).strip()

def cargar_casos(cfg, demo=None):
    casos = []
    tit = {}
    tp = os.path.join(HERE, 'titulos', cfg['archivo'].split('_Parcial')[0].lower() + '.json')
    tp = os.path.join(HERE, 'titulos', [k for k, v in PARCIALES.items() if v is cfg][0] + '.json')
    if os.path.exists(tp): tit = json.load(open(tp, encoding='utf8'))
    for u in cfg['unidades']:
        b = json.load(open(os.path.join(ROOT, 'data', 'banco_up%02d.json' % u['n']), encoding='utf8'))
        if demo: b = b[:demo]
        for i, q in enumerate(b, 1):
            opc = [re.sub(r'^[A-D]\)\s*', '', limpiar(o)) for o in q['opciones']]
            preg = limpiar(q['pregunta']); k = preg.rfind('¿')
            sit, pr = (preg[:k].strip(), preg[k:]) if k > 20 else ('', preg)
            clave = '%d-%d' % (u['n'], i)
            titulo = tit.get(clave) or ' '.join(limpiar(q['justificacion']).split(' ')[:9]).rstrip('.,:;')
            casos.append(dict(up=u, n=i, sit=sit, preg=pr, opc=opc, corr=str(q['correcta']).strip().upper()[:1], just=limpiar(q['justificacion']), titulo=titulo))
    return casos

# ---------------------------------------------------------------- utilidades de dibujo
def fuentes():
    arch = pymupdf.Archive(FONTS)
    return arch

CSS = """
@font-face { font-family: Cal; src: url(calibri.ttf); } @font-face { font-family: Cal; font-weight: bold; src: url(calibrib.ttf); }
@font-face { font-family: Cal; font-style: italic; src: url(calibrii.ttf); }
@font-face { font-family: Pop; src: url('Poppins Regular.ttf'); } @font-face { font-family: Pop; font-weight: bold; src: url('Poppins Bold.ttf'); }
body { font-family: Cal; font-size: 10pt; color: #0b1f44; line-height: 1.28; }
.t { font-family: Pop; font-weight: bold; font-size: 12.5pt; color: #0b1f44; margin: 0 0 7pt 0; }
.sit b { font-weight: bold; } p { margin: 0 0 7pt 0; text-align: justify; }
.op { margin: 0 0 4pt 0; } .ok { font-weight: bold; color: #1d6fe8; margin: 8pt 0 6pt 0; font-size: 10.5pt; }
.jh { font-family: Pop; font-size: 7pt; letter-spacing: 1pt; color: #1d6fe8; border-bottom: 1px dotted #9db7dc; padding-bottom: 3pt; margin: 6pt 0 5pt 0; }
.j { font-size: 9.5pt; text-align: justify; }
"""

def texto(page, x, y, s, size=9, font='helv', color=NAVY, **kw):
    page.insert_text((x, y), s, fontsize=size, fontname=font, color=color, **kw)

def reg_fonts(page):
    for name, f in (('pop', 'Poppins Regular.ttf'), ('popb', 'Poppins Bold.ttf'), ('popm', 'Poppins Medium.ttf')):
        page.insert_font(fontname=name, fontfile=os.path.join(A, f))
    for name, f in (('cal', 'calibri.ttf'), ('calb', 'calibrib.ttf')):
        page.insert_font(fontname=name, fontfile=os.path.join(FONTS, f))

def ancho(txt, font, size):
    p = {'pop': 'Poppins Regular.ttf', 'popb': 'Poppins Bold.ttf', 'cal': 'calibri.ttf', 'calb': 'calibrib.ttf'}[font]
    base = A if font.startswith('pop') else FONTS
    return pymupdf.Font(fontfile=os.path.join(base, p)).text_length(txt, size)

def cabecera(page, derecha=''):
    reg_fonts(page)
    page.insert_image(pymupdf.Rect(32, 22, 32 + 20 * 0.0 + 22, 22 + 17), filename=os.path.join(A, 'logo_n.png'))
    texto(page, 58, 34, 'Parcial integrador', 8, 'pop', NAVY)
    page.draw_rect(pymupdf.Rect(0, 0, W, 4), color=None, fill=BLUE)
    if derecha:
        w = ancho(derecha, 'popm' if False else 'pop', 6.5)
        texto(page, W - 40 - w, 34, derecha, 6.5, 'pop', BLUE)

def lineas_pie(page, i, n):
    reg_fonts(page)
    page.draw_line((40, 806), (W - 40, 806), color=LINE, width=0.6)
    texto(page, 40, 816, PIE, 5.8, 'cal', GREY)
    texto(page, 40, 825, '%s · %s · nikamed.com.ar' % (AUTOR, FECHA), 5.8, 'calb', NAVY)
    s = 'Página %d de %d' % (i, n); w = ancho(s, 'calb', 5.8)
    texto(page, W - 40 - w, 825, s, 5.8, 'calb', NAVY)

# ---------------------------------------------------------------- páginas de contenido
def partes_just(c):
    return [p for p in re.split(r'(?<=[.;:])\s+(?=[A-ZÁÉÍÓÚ0-9])', c['just']) if p]

def html_caso(c, primera, partes):
    letras = 'ABCD'
    h = ''
    if primera:
        h += '<div class="t">Caso %d · %s</div>' % (c['n'], html.escape(c['titulo']))
        if c['sit']: h += '<p class="sit"><b>Situación Clínica:</b> %s</p>' % html.escape(c['sit'])
        h += '<p><b>Pregunta %d:</b> %s</p>' % (c['n'], html.escape(c['preg']))
        for L, o in zip(letras, c['opc']): h += '<p class="op"><b>%s)</b> %s</p>' % (L, html.escape(o))
        h += '<div class="ok">Opción correcta: %s</div>' % c['corr']
    h += '<div class="jh">JUSTIFICACIÓN Y REFUTACIÓN DE DISTRACTORES%s</div>' % ('' if primera else ' (continuación)')
    h += '<div class="j"><p>%s</p></div>' % html.escape(' '.join(partes))
    return h

def cabe(html_txt, rect, arch):
    tmp = pymupdf.open(); pg = tmp.new_page(width=W, height=H)
    r = pg.insert_htmlbox(rect, html_txt, css=CSS, archive=arch, scale_low=1)
    ok = r[0] >= 0
    tmp.close(); return ok

def pagina_caso(doc, c, arch, idx_caso):
    rect = pymupdf.Rect(40, 66, W - 62, 792)
    restantes = partes_just(c); primera = True; inicio = doc.page_count
    while True:
        # cuántas oraciones de la justificación entran en esta hoja
        n = len(restantes)
        while n > 1 and not cabe(html_caso(c, primera, restantes[:n]), rect, arch): n -= 1
        trozo = restantes[:n]; resto = restantes[n:]
        page = doc.new_page(width=W, height=H)
        cabecera(page, 'UP %d · CASO %d%s' % (c['up']['n'], c['n'], '' if primera else ' (continuación)'))
        col = hexrgb(c['up']['color'])
        if primera: page.draw_rect(pymupdf.Rect(36, 68, 39, 84), color=None, fill=col)
        r = page.insert_htmlbox(rect, html_caso(c, primera, trozo), css=CSS, archive=arch, scale_low=0.8)
        page.draw_rect(pymupdf.Rect(W - 18, 330, W + 2, 470), color=None, fill=col)
        reg_fonts(page)
        page.insert_textbox(pymupdf.Rect(W - 18, 330, W - 2, 470), 'UP %d' % c['up']['n'], fontsize=6.5, fontname='popb', color=(1, 1, 1), rotate=90, align=1)
        if not resto: break
        restantes = resto; primera = False
    return inicio

def pagina_unidad(doc, u, total):
    page = doc.new_page(width=W, height=H); reg_fonts(page)
    col = hexrgb(u['color'])
    page.draw_rect(pymupdf.Rect(0, 0, W, H), color=None, fill=col)
    page.draw_circle((W - 40, 120), 150, color=None, fill=tuple(min(1, c + 0.12) for c in col))
    page.draw_circle((60, H - 90), 110, color=None, fill=tuple(min(1, c + 0.08) for c in col))
    texto(page, 60, 300, 'UNIDAD PROBLEMA %d' % u['n'], 13, 'popb', (1, 1, 1))
    page.insert_textbox(pymupdf.Rect(60, 318, W - 80, 420), u['titulo'], fontsize=30, fontname='popb', color=(1, 1, 1))
    page.insert_textbox(pymupdf.Rect(60, 430, W - 80, 480), u['sub'], fontsize=12, fontname='pop', color=(1, 1, 1))
    texto(page, 60, 520, '%d casos clínicos' % total, 12, 'popb', (1, 1, 1))
    return doc.page_count - 1

# ---------------------------------------------------------------- portada, guía, índice
def portada(doc, cfg, total, n_unid):
    page = doc.new_page(width=W, height=H); reg_fonts(page)
    page.draw_rect(pymupdf.Rect(0, 0, W, 330), color=None, fill=(0.93, 0.96, 1.0))
    page.draw_circle((W - 30, 40), 130, color=None, fill=(0.88, 0.93, 1.0)); page.draw_circle((W - 20, 330), 70, color=None, fill=(0.85, 0.91, 1.0)); page.draw_circle((5, 330), 40, color=None, fill=(0.88, 0.93, 1.0))
    page.insert_image(pymupdf.Rect(46, 40, 46 + 200, 40 + 66), filename=os.path.join(A, 'logo.png'))
    page.draw_rect(pymupdf.Rect(W - 150, 38, W - 46, 58), color=BLUE, fill=None, width=0.6, radius=0.5)
    texto(page, W - 140, 51, FECHA.upper(), 6.5, 'pop', BLUE)
    texto(page, 46, 168, 'CASOS CLÍNICOS · %s' % cfg['area'], 7, 'pop', BLUE)
    texto(page, 46, 207, cfg['titulo1'], 27, 'popb', NAVY)
    texto(page, 46, 247, cfg['titulo2'], 33, 'popb', BLUE)
    page.draw_rect(pymupdf.Rect(0, 285, W, 289), color=None, fill=BLUE)
    page.insert_textbox(pymupdf.Rect(46, 305, W - 60, 350), '%d casos clínicos con opciones múltiples y justificación de cada respuesta, organizados por unidad problema.' % total, fontsize=9, fontname='pop', color=GREY)
    texto(page, 46, 380, 'AUTOR', 5.5, 'pop', GREY); texto(page, 46, 400, AUTOR, 12, 'popb', NAVY); texto(page, 46, 415, FECHA, 8, 'pop', GREY)
    for x0, num, lab in ((330, str(total), 'casos clínicos'), (452, str(n_unid), 'unidades problema')):
        page.draw_rect(pymupdf.Rect(x0, 372, x0 + 112, 430), color=None, fill=PALE, radius=0.12)
        texto(page, x0 + 56 - ancho(num, 'popb', 17) / 2, 400, num, 17, 'popb', BLUE)
        texto(page, x0 + 56 - ancho(lab, 'pop', 6.5) / 2, 416, lab, 6.5, 'pop', GREY)
    page.draw_rect(pymupdf.Rect(46, 462, W - 46, 570), color=LINE, fill=(0.96, 0.98, 1.0), width=0.8, radius=0.04)
    page.draw_circle((66, 483), 7, color=None, fill=BLUE); texto(page, 64, 486, '!', 8, 'popb', (1, 1, 1))
    texto(page, 82, 486, 'Aviso importante', 10, 'popb', NAVY)
    page.insert_textbox(pymupdf.Rect(62, 496, W - 64, 545), 'Son casos de práctica realizados de manera propia. Constituyen una herramienta de entrenamiento para los exámenes: no reemplazan el criterio profesional del área, ni son un documento asociado a la cátedra.', fontsize=8, fontname='pop', color=NAVY)
    texto(page, 62, 556, 'Verificá siempre las respuestas por tu cuenta.', 7.5, 'popb', BLUE)
    page.draw_rect(pymupdf.Rect(46, 590, W - 46, 790), color=None, fill=NAVY, radius=0.06)
    page.draw_rect(pymupdf.Rect(46, 590, W - 46, 594), color=None, fill=BLUE)
    texto(page, 70, 635, 'Practicá estos exámenes y mucho más', 13, 'popb', (1, 1, 1))
    page.insert_textbox(pymupdf.Rect(70, 650, 360, 700), 'Para practicar estos exámenes y mucho más podés acceder a Nikamed.com.ar y practicar de manera gratuita.', fontsize=8, fontname='pop', color=(0.78, 0.85, 0.95))
    page.draw_rect(pymupdf.Rect(70, 722, 200, 744), color=None, fill=BLUE, radius=0.5)
    texto(page, 88, 736, 'nikamed.com.ar', 9, 'popb', (1, 1, 1))
    page.draw_rect(pymupdf.Rect(386, 610, 506, 760), color=None, fill=(1, 1, 1), radius=0.08)
    page.insert_image(pymupdf.Rect(396, 618, 496, 718), filename=os.path.join(A, 'qr.png'))
    texto(page, 446 - ancho('Escaneá y practicá', 'pop', 6.5) / 2, 740, 'Escaneá y practicá', 6.5, 'pop', NAVY)
    texto(page, W / 2 - ancho('Aprender · Entrenar · Mejorar', 'pop', 6) / 2, 806, 'Aprender · Entrenar · Mejorar', 6, 'pop', BLUE)

def guia(doc, cfg, pagina_unidad_final, conteos):
    page = doc.new_page(width=W, height=H); cabecera(page)
    texto(page, 40, 95, 'Cómo usar este documento', 22, 'popb', NAVY)
    page.insert_textbox(pymupdf.Rect(40, 108, W - 50, 150), 'Cada caso clínico ocupa su propia hoja. Un marcador de color en el borde derecho, a media altura, indica en qué unidad problema estás, para estudiar de forma ordenada y saber siempre dónde estás ubicado.', fontsize=8.5, fontname='cal', color=GREY)
    texto(page, 40, 175, 'CÓMO LEER CADA CASO', 6.5, 'pop', BLUE)
    filas = [('Caso 12 · Título resaltado', 'Título resaltado: describe el tema principal del caso y ordena el estudio.'),
             ('Justificación y refutación', 'Recuadro de justificación: explica por qué la opción es correcta y por qué las otras no lo son.'),
             ('Datos clave', 'Negrita: datos clave de la situación clínica y de la pregunta.')]
    y = 185
    for a, b in filas:
        page.draw_rect(pymupdf.Rect(40, y, W - 40, y + 36), color=LINE, fill=None, width=0.7, radius=0.1)
        texto(page, 54, y + 21, a, 8, 'calb', NAVY)
        page.insert_textbox(pymupdf.Rect(220, y + 8, W - 54, y + 34), b, fontsize=8, fontname='cal', color=NAVY); y += 46
    texto(page, 40, 345, 'MARCADORES DE COLOR POR UNIDAD', 6.5, 'pop', BLUE)
    y = 360
    for u in cfg['unidades']:
        page.draw_rect(pymupdf.Rect(48, y, 60, y + 30), color=None, fill=hexrgb(u['color']), radius=0.4)
        texto(page, 74, y + 12, 'UP %d' % u['n'], 8.5, 'popb', NAVY)
        texto(page, 74, y + 25, u['titulo'][:72], 7, 'cal', GREY)
        s = '%d casos · pág. %d' % (conteos[u['n']], pagina_unidad_final[u['n']])
        texto(page, W - 50 - ancho(s, 'popb', 7), y + 18, s, 7, 'popb', hexrgb(u['color']))
        y += 42
    texto(page, 40, y + 20, 'ESTRUCTURA', 6.5, 'pop', BLUE)
    tot = sum(conteos.values())
    page.insert_textbox(pymupdf.Rect(40, y + 28, W - 50, y + 110), 'El documento reúne %d casos clínicos de %d unidades problema. Cuando un caso es demasiado largo para una sola hoja, se reduce levemente o se divide de forma prolija: la hoja siguiente se identifica como continuación y retoma la justificación completa, sin cortar ninguna pregunta ni recuadro.' % (tot, len(cfg['unidades'])), fontsize=9, fontname='cal', color=NAVY)
    return page

def indice(doc, cfg, casos, pag_caso, pag_unidad, base):
    """dibuja el índice paginado; devuelve cantidad de páginas. base = índice de la primera página del cuerpo en el documento final"""
    filas = []
    for u in cfg['unidades']:
        filas.append(('u', u))
        for c in [c for c in casos if c['up'] is u]: filas.append(('c', c))
    paginas = []; actual = []; y = 118
    for f in filas:
        h = 22 if f[0] == 'u' else 11.4
        if y + h > 780: paginas.append(actual); actual = []; y = 90
        actual.append((f, y)); y += h + (4 if f[0] == 'u' else 0)
    paginas.append(actual)
    return paginas

LINKS = []

def dibujar_indice(doc, cfg, paginas, pag_caso, pag_unidad, base, pag_indice0):
    for k, filas in enumerate(paginas):
        page = doc.new_page(width=W, height=H); cabecera(page)
        if k == 0:
            texto(page, 40, 80, 'Índice', 22, 'popb', NAVY); texto(page, 40, 100, 'Tocá cualquier caso para ir directo a su hoja.', 8, 'cal', GREY)
        for (f, y) in filas:
            if f[0] == 'u':
                u = f[1]; page.draw_rect(pymupdf.Rect(40, y - 12, W - 40, y + 8), color=None, fill=hexrgb(u['color']), radius=0.25)
                texto(page, 50, y + 1, 'Unidad Problema %d — %s' % (u['n'], u['titulo'][:62]), 8, 'popb', (1, 1, 1))
                s = 'pág. %d' % (base + pag_unidad[u['n']] + 1); texto(page, W - 50 - ancho(s, 'popb', 8), y + 1, s, 8, 'popb', (1, 1, 1))
                LINKS.append((page.number, {'kind': pymupdf.LINK_GOTO, 'from': pymupdf.Rect(40, y - 12, W - 40, y + 8), 'page': base + pag_unidad[u['n']]}))
            else:
                c = f[1]; pg = base + pag_caso[(c['up']['n'], c['n'])]
                page.draw_rect(pymupdf.Rect(42, y - 6, 46, y - 2), color=None, fill=BLUE)
                lab = 'Caso %d - %s' % (c['n'], c['titulo']); lab = lab if len(lab) < 92 else lab[:90] + '…'
                texto(page, 52, y, lab, 7, 'cal', NAVY)
                s = str(pg + 1); texto(page, W - 46 - ancho(s, 'calb', 7), y, s, 7, 'calb', BLUE)
                page.draw_line((52 + ancho(lab, 'cal', 7) + 4, y + 1), (W - 52 - ancho(s, 'calb', 7), y + 1), color=LINE, width=0.4, dashes='[1 2] 0')
                LINKS.append((page.number, {'kind': pymupdf.LINK_GOTO, 'from': pymupdf.Rect(40, y - 8, W - 40, y + 3), 'page': pg}))

def pagina_sobre(doc):
    page = doc.new_page(width=W, height=H); cabecera(page)
    texto(page, 40, 95, 'Sobre este documento', 20, 'popb', NAVY)
    page.insert_textbox(pymupdf.Rect(40, 110, W - 50, 160), 'Este es un documento de práctica y entrenamiento. Reúne preguntas desarrolladas de manera independiente, pensadas como herramienta para prepararse de cara al examen.', fontsize=9, fontname='cal', color=GREY)
    pts = [('Material de práctica propio', 'Casos y preguntas elaborados de manera independiente como herramienta de entrenamiento para los exámenes.'),
           ('No reemplaza el criterio profesional', 'No sustituye la formación, el juicio clínico ni el criterio profesional del área.'),
           ('Sin vínculo con la cátedra', 'No es un documento asociado a la cátedra ni cuenta con su aval o revisión.'),
           ('Verificá siempre las respuestas', 'Contrastá cada respuesta y su justificación con la bibliografía y con tu criterio antes de darlas por válidas.')]
    y = 190
    for i, (a, b) in enumerate(pts, 1):
        page.draw_circle((58, y + 8), 11, color=None, fill=BLUE); texto(page, 55, y + 12, str(i), 9, 'popb', (1, 1, 1))
        texto(page, 80, y + 6, a, 10, 'popb', NAVY)
        page.insert_textbox(pymupdf.Rect(80, y + 12, W - 60, y + 50), b, fontsize=8.5, fontname='cal', color=GREY); y += 62

# ---------------------------------------------------------------- principal
def main():
    clave = sys.argv[1]; demo = None
    if '--demo' in sys.argv: demo = int(sys.argv[sys.argv.index('--demo') + 1])
    cfg = PARCIALES[clave]; casos = cargar_casos(cfg, demo)
    arch = pymupdf.Archive(FONTS)
    cuerpo = pymupdf.open(); pag_caso = {}; pag_unidad = {}; conteos = {}
    for u in cfg['unidades']:
        lista = [c for c in casos if c['up'] is u]; conteos[u['n']] = len(lista)
        pag_unidad[u['n']] = pagina_unidad(cuerpo, u, len(lista))
        for c in lista: pag_caso[(u['n'], c['n'])] = pagina_caso(cuerpo, c, arch, c['n'])
    # índice (dry run para saber cuántas páginas ocupa)
    paginas = indice(None, cfg, casos, pag_caso, pag_unidad, 0)
    base = 2 + len(paginas)       # portada + guía + índice
    final = pymupdf.open()
    portada(final, cfg, len(casos), len(cfg['unidades']))
    pu_final = {n: base + p + 1 for n, p in pag_unidad.items()}
    guia(final, cfg, pu_final, conteos)
    dibujar_indice(final, cfg, paginas, pag_caso, pag_unidad, base, 2)
    final.insert_pdf(cuerpo)
    final.insert_pdf if False else None
    pagina_sobre(final)
    for pn, lk in LINKS: final[pn].insert_link(lk)
    n = final.page_count
    for i, pg in enumerate(final):
        if i >= 1: lineas_pie(pg, i + 1, n)
    final.set_metadata({'title': '%s %s · Casos de práctica' % (cfg['titulo1'].title(), cfg['titulo2']), 'author': AUTOR, 'subject': 'Casos clínicos de %s — herramienta de entrenamiento' % cfg['area'].title(), 'keywords': 'Cirugía, casos clínicos, NikaMed', 'creator': 'NikaMed'})
    out = os.path.join(HERE, 'salida'); os.makedirs(out, exist_ok=True)
    ruta = os.path.join(out, ('DEMO_' if demo else '') + cfg['archivo'])
    try: final.subset_fonts()
    except Exception as e: print('subset_fonts:', e)
    final.save(ruta, garbage=4, deflate=True, deflate_fonts=True)
    print(ruta, n, 'páginas', round(os.path.getsize(ruta) / 1e6, 1), 'MB')

if __name__ == '__main__':
    main()
