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

TEMAS = {6: ['Hernias inguinales directas e indirectas, crural y otras hernias de la pared (Spiegel, lumbares, obturatriz, epigástrica)', 'Complicaciones herniarias y técnicas de hernioplastia (Lichtenstein, TAPP y TEP)', 'Eventraciones, evisceraciones y abdomen abierto', 'Patología escrotal: torsión, epididimitis, hidrocele, varicocele y trauma testicular', 'Diagnósticos diferenciales del dolor inguinal'], 7: ['Patología tiroidea: nódulos, clasificación de Bethesda, cáncer y bocio', 'Complicaciones de la cirugía tiroidea y de la paratiroides', 'Quistes y malformaciones cervicales; masas y adenopatías del cuello', 'Glándulas salivales: tumores y sialolitiasis', 'Vía aérea, traqueostomía y cricotiroidotomía', 'Síndrome de burnout'], 8: ['Trauma pelviano, de cadera y de los miembros inferiores', 'Lesiones de rodilla, tobillo y pie; fracturas expuestas y síndrome compartimental', 'Trauma de columna y lesión medular', 'Tumores óseos y de partes blandas', 'Discapacidad, rehabilitación y comunicación de malas noticias'], 9: ['Evaluación inicial del politraumatizado (ATLS), shock hemorrágico y vía aérea', 'Trauma de tórax, abdomen y cuello', 'Quemaduras, lesión por inhalación y lesiones por agentes químicos y eléctricos', 'Muerte encefálica, procuración de órganos y trasplante (INCUCAI)', 'Comunicación de malas noticias (SPIKES), bioética y desgaste profesional'], 10: ['Isquemia arterial aguda y crónica; clasificaciones de Fontaine y Rutherford', 'Aneurismas y disección de la aorta', 'Enfermedad venosa: várices, CEAP, trombosis venosa profunda y tromboembolismo pulmonar', 'Accesos vasculares y catéteres venosos centrales', 'Otros síndromes vasculares: Raynaud, Buerger, May-Thurner y atrapamiento poplíteo'], 11: ['Hiperplasia prostática benigna y síntomas del tracto urinario inferior', 'Cáncer de próstata: tamizaje, estadificación y tratamiento', 'Litiasis urinaria y urgencias urológicas (torsión, priapismo, fractura de pene, Fournier)', 'Trauma genitourinario', 'Tumores de riñón, vejiga, testículo y pene', 'Accesos vasculares para hemodiálisis']}

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
    t = html.unescape(re.sub(r'\s+', ' ', str(t or ''))).strip()
    return re.sub(r'\s*\(?UNER\s*/?\s*\)?', '', t)   # el documento no menciona ninguna universidad

def cargar_casos(cfg, demo=None):
    casos = []; tit = {}
    clave_p = [k for k, v in PARCIALES.items() if v is cfg][0]
    td = os.path.join(HERE, 'titulos')
    for f in sorted(os.listdir(td)) if os.path.isdir(td) else []:
        if f.startswith(clave_p) and f.endswith('.json'): tit.update(json.load(open(os.path.join(td, f), encoding='utf8')))
    for u in cfg['unidades']:
        b = json.load(open(os.path.join(ROOT, 'data', 'banco_up%02d.json' % u['n']), encoding='utf8'))
        if demo: b = b[:demo]
        for i, q in enumerate(b, 1):
            opc = [re.sub(r'^[A-D]\)\s*', '', limpiar(o)) for o in q['opciones']]
            preg = limpiar(q['pregunta']); k = preg.rfind('¿')
            sit, pr = (preg[:k].strip(), preg[k:]) if k > 20 else ('', preg)
            clave = '%d-%d' % (u['n'], i); t = tit.get(clave) or {}
            if isinstance(t, str): t = {'t': t}
            titulo = t.get('t') or ' '.join(limpiar(q['justificacion']).split(' ')[:6]).rstrip('.,:;')
            casos.append(dict(up=u, n=i, sit=sit, preg=pr, opc=opc, corr=str(q['correcta']).strip().upper()[:1], just=re.sub(r'Para el (Choice|Oral):\s*', '', limpiar(q['justificacion'])), titulo=titulo, ref=t.get('r') or {}))
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
p { margin: 0 0 7pt 0; text-align: justify; } .op { margin: 0 0 4pt 0; }
.jh { font-family: Pop; font-size: 7pt; letter-spacing: 1pt; color: #1d6fe8; border-bottom: 1px dotted #9db7dc; padding-bottom: 3pt; margin: 8pt 0 6pt 0; }
.okb { background-color: #e7f6ec; border-left: 4pt solid #16a34a; padding: 6pt 8pt 2pt 8pt; margin: 4pt 0 8pt 0; }
.okb .h { font-family: Pop; font-weight: bold; font-size: 8.5pt; color: #166534; margin: 0 0 4pt 0; }
.okb p { margin: 0 0 5pt 0; font-size: 9.5pt; color: #0b1f44; }
.nob { background-color: #fdecec; border-left: 4pt solid #dc2626; padding: 5pt 8pt 1pt 8pt; margin: 0 0 6pt 0; }
.nob .h { font-family: Pop; font-weight: bold; font-size: 8pt; color: #991b1b; margin: 0 0 2pt 0; }
.nob p { margin: 0 0 4pt 0; font-size: 9.5pt; color: #0b1f44; }
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
def negrita(t):
    return re.sub(r'[*]{2}(.+?)[*]{2}', lambda m: '<b>' + m.group(1) + '</b>', t)

def parrafos(txt):
    """parte la justificación en párrafos cortos (2-3 oraciones) para que se lea espaciada"""
    ss = [p for p in re.split(r'(?<=[.;:])\s+(?=[A-ZÁÉÍÓÚ0-9])', txt) if p]
    out = []; cur = []
    for x in ss:
        cur.append(x)
        if len(' '.join(cur)) > 230: out.append(' '.join(cur)); cur = []
    if cur: out.append(' '.join(cur))
    return out

def bloques_just(c):
    L = 'ABCD'; ok = L.index(c['corr']) if c['corr'] in L else 0
    corr = '<div class="okb"><div class="h">✔ OPCIÓN CORRECTA: %s</div><p><b>%s)</b> %s</p>%s</div>' % (
        c['corr'], c['corr'], html.escape(c['opc'][ok]), '<p>' + '</p><p>'.join(negrita(html.escape(x)) for x in parrafos(c['just'])) + '</p>')
    out = [corr]
    inc = [l for l in L if l != c['corr']]
    if c['ref']:
        for l in inc:
            if l in c['ref']:
                out.append('<div class="nob"><div class="h">✘ OPCIÓN %s DESCARTADA</div><p><b>%s)</b> %s <br/>%s</p></div>' % (l, l, html.escape(c['opc'][L.index(l)]), html.escape(c['ref'][l])))
    return out

def html_caso(c, primera, bloques):
    letras = 'ABCD'; h = ''
    if primera:
        h += '<div class="t">Caso %d · %s</div>' % (c['n'], html.escape(c['titulo']))
        if c['sit']: h += '<p><b>Situación Clínica:</b> %s</p>' % html.escape(c['sit'])
        h += '<p><b>Pregunta %d:</b> %s</p>' % (c['n'], html.escape(c['preg']))
        for L, o in zip(letras, c['opc']): h += '<p class="op"><b>%s)</b> %s</p>' % (L, html.escape(o))
    h += '<div class="jh">JUSTIFICACIÓN Y REFUTACIÓN DE DISTRACTORES%s</div>' % ('' if primera else ' (continuación)')
    return h + ''.join(bloques)

def cabe(html_txt, rect, arch):
    tmp = pymupdf.open(); pg = tmp.new_page(width=W, height=H)
    r = pg.insert_htmlbox(rect, html_txt, css=CSS, archive=arch, scale_low=1)
    ok = r[0] >= 0
    tmp.close(); return ok

def pagina_caso(doc, c, arch, idx_caso):
    rect = pymupdf.Rect(40, 66, W - 62, 792)
    restantes = bloques_just(c); primera = True; inicio = doc.page_count
    while True:
        n = len(restantes)
        while n > 1 and not cabe(html_caso(c, primera, restantes[:n]), rect, arch): n -= 1
        trozo = restantes[:n]; resto = restantes[n:]
        page = doc.new_page(width=W, height=H)
        cabecera(page, 'UP %d · CASO %d%s' % (c['up']['n'], c['n'], '' if primera else ' (continuación)'))
        col = hexrgb(c['up']['color'])
        if primera: page.draw_rect(pymupdf.Rect(36, 68, 39, 84), color=None, fill=col)
        page.insert_htmlbox(rect, html_caso(c, primera, trozo), css=CSS, archive=arch, scale_low=0.8)
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

def contenidos(doc, cfg):
    page = doc.new_page(width=W, height=H); cabecera(page)
    texto(page, 40, 95, 'Contenidos de este parcial', 22, 'popb', NAVY)
    page.insert_textbox(pymupdf.Rect(40, 108, W - 50, 140), 'Los temas principales de cada unidad problema que abarcan los casos de este documento.', fontsize=8.5, fontname='cal', color=GREY)
    y = 150
    for u in cfg['unidades']:
        col = hexrgb(u['color']); alto = 28 + 12.5 * len(TEMAS[u['n']])
        page.draw_rect(pymupdf.Rect(40, y, W - 40, y + alto), color=LINE, fill=(0.985, 0.99, 1.0), width=0.7, radius=0.04)
        page.draw_rect(pymupdf.Rect(40, y, 46, y + alto), color=None, fill=col)
        texto(page, 56, y + 15, 'UP %d · %s' % (u['n'], u['titulo'][:70]), 8.5, 'popb', NAVY)
        yy = y + 29
        for t in TEMAS[u['n']]:
            page.draw_circle((62, yy - 2.5), 1.5, color=None, fill=col); texto(page, 70, yy, t, 8, 'cal', NAVY); yy += 12.5
        y += alto + 8
    return page

def pagina_nikamed(doc):
    page = doc.new_page(width=W, height=H); cabecera(page)
    texto(page, 40, 95, 'Qué es NikaMed', 22, 'popb', NAVY)
    page.insert_textbox(pymupdf.Rect(40, 108, W - 50, 150), 'NikaMed es un campus de entrenamiento médico para estudiantes de Medicina de toda Argentina. Nació para poder practicar con preguntas bien justificadas y estudiar en un solo lugar.', fontsize=9.5, fontname='cal', color=NAVY)
    page.insert_textbox(pymupdf.Rect(40, 142, W - 50, 190), 'Soy Weigandt, Augusto, creador de la plataforma y autor de este documento. Estos casos y muchos más los podés practicar gratis en NikaMed.', fontsize=9.5, fontname='calb', color=NAVY)
    texto(page, 40, 205, 'QUÉ VAS A ENCONTRAR', 6.5, 'pop', BLUE)
    items = [('Simulador de exámenes', 'Practicá con preguntas de opción múltiple, cronometradas y con la justificación de cada respuesta.'),
             ('Flashcards', 'Tratamientos, algoritmos de manejo y mucho más, para repasar de forma rápida y ordenada.'),
             ('NikaFarma', 'Una sección para consultar fármacos y tratamientos actualizados con guías argentinas.'),
             ('Duelos', 'Competí contra tus compañeros y medí tu nivel mientras jugás.'),
             ('Salas de estudio', 'Material actualizado y método Pomodoro para organizar tu tiempo de estudio.')]
    y = 215
    for t, d in items:
        page.draw_rect(pymupdf.Rect(40, y, W - 40, y + 38), color=LINE, fill=(0.985, 0.99, 1.0), width=0.7, radius=0.1)
        page.draw_rect(pymupdf.Rect(40, y, 45, y + 38), color=None, fill=BLUE)
        texto(page, 56, y + 15, t, 9.5, 'popb', NAVY)
        page.insert_textbox(pymupdf.Rect(56, y + 19, W - 54, y + 38), d, fontsize=8.3, fontname='cal', color=GREY); y += 46
    page.insert_textbox(pymupdf.Rect(40, y + 6, W - 50, y + 40), 'Tenés todo esto disponible, y mucho más. Escaneá el QR o entrá a nikamed.com.ar y empezá.', fontsize=10, fontname='calb', color=BLUE)
    y += 52
    page.draw_rect(pymupdf.Rect(40, y, W - 40, y + 150), color=None, fill=NAVY, radius=0.06)
    page.draw_rect(pymupdf.Rect(40, y, W - 40, y + 4), color=None, fill=BLUE)
    texto(page, 62, y + 50, 'Practicá en NikaMed', 12, 'popb', (1, 1, 1))
    page.insert_textbox(pymupdf.Rect(62, y + 62, 330, y + 100), 'Escaneá el código o entrá al sitio y empezá a practicar.', fontsize=8, fontname='pop', color=(0.78, 0.85, 0.95))
    page.draw_rect(pymupdf.Rect(62, y + 108, 190, y + 128), color=None, fill=BLUE, radius=0.5)
    texto(page, 78, y + 122, 'nikamed.com.ar', 8.5, 'popb', (1, 1, 1))
    page.draw_rect(pymupdf.Rect(W - 190, y + 14, W - 62, y + 136), color=None, fill=(1, 1, 1), radius=0.08)
    page.insert_image(pymupdf.Rect(W - 182, y + 18, W - 70, y + 118), filename=os.path.join(A, 'qr.png'))
    texto(page, W - 126 - ancho('Escaneá y practicá', 'pop', 6.5) / 2, y + 130, 'Escaneá y practicá', 6.5, 'pop', NAVY)
    return page

def indice(doc, cfg, casos, pag_caso, pag_unidad, base):
    filas = []
    for u in cfg['unidades']:
        filas.append(('u', u))
        for c in [c for c in casos if c['up'] is u]: filas.append(('c', c))
    paginas = []; actual = []; y = 128
    for f in filas:
        h = 24 if f[0] == 'u' else 14.2
        if f[0] == 'u' and y + 60 > 790: paginas.append(actual); actual = []; y = 80
        if y + h > 790: paginas.append(actual); actual = []; y = 80
        if f[0] == 'u' and actual: y += 8
        actual.append((f, y)); y += h
    paginas.append(actual)
    return paginas

LINKS = []

def dibujar_indice(doc, cfg, paginas, pag_caso, pag_unidad, base, pag_indice0):
    for k, filas in enumerate(paginas):
        page = doc.new_page(width=W, height=H); cabecera(page)
        if k == 0:
            texto(page, 40, 82, 'Índice', 22, 'popb', NAVY); texto(page, 40, 102, 'Tocá cualquier caso para ir directo a su hoja.', 8, 'cal', GREY)
        for (f, y) in filas:
            if f[0] == 'u':
                u = f[1]; page.draw_rect(pymupdf.Rect(40, y - 12, W - 40, y + 8), color=None, fill=hexrgb(u['color']), radius=0.25)
                texto(page, 50, y + 1.5, 'Unidad Problema %d — %s' % (u['n'], u['titulo'][:60]), 8, 'popb', (1, 1, 1))
                s = 'pág. %d' % (base + pag_unidad[u['n']] + 1); texto(page, W - 50 - ancho(s, 'popb', 8), y + 1.5, s, 8, 'popb', (1, 1, 1))
                LINKS.append((page.number, {'kind': pymupdf.LINK_GOTO, 'from': pymupdf.Rect(40, y - 12, W - 40, y + 8), 'page': base + pag_unidad[u['n']]}))
            else:
                c = f[1]; pg = base + pag_caso[(c['up']['n'], c['n'])]
                page.draw_rect(pymupdf.Rect(46, y - 5.5, 49.5, y - 2), color=None, fill=hexrgb(c['up']['color']))
                s = str(pg + 1); ws = ancho(s, 'calb', 7.5)
                lab = 'Caso %d · %s' % (c['n'], c['titulo']); orig = lab
                maxw = W - 52 - ws - 60 - 56
                while ancho(lab, 'cal', 7.5) > maxw and len(lab) > 10: lab = lab[:-2]
                if lab != orig: lab = lab.rstrip() + '…'
                texto(page, 56, y, lab, 7.5, 'cal', NAVY)
                texto(page, W - 46 - ws, y, s, 7.5, 'calb', BLUE)
                x0 = 56 + ancho(lab, 'cal', 7.5) + 6; x1 = W - 46 - ws - 6
                if x1 > x0 + 8: page.draw_line((x0, y + 1), (x1, y + 1), color=LINE, width=0.5, dashes='[1 2] 0')
                LINKS.append((page.number, {'kind': pymupdf.LINK_GOTO, 'from': pymupdf.Rect(40, y - 8, W - 40, y + 4), 'page': pg}))

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
    paginas = indice(None, cfg, casos, pag_caso, pag_unidad, 0)
    base = 4 + len(paginas)       # portada + guía + contenidos + NikaMed + índice
    final = pymupdf.open()
    portada(final, cfg, len(casos), len(cfg['unidades']))
    pu_final = {n: base + p + 1 for n, p in pag_unidad.items()}
    guia(final, cfg, pu_final, conteos)
    contenidos(final, cfg)
    pagina_nikamed(final)
    dibujar_indice(final, cfg, paginas, pag_caso, pag_unidad, base, 2)
    final.insert_pdf(cuerpo)
    pagina_sobre(final)
    pagina_nikamed(final)
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
