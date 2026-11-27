# -*- coding: utf-8 -*-
"""Atlas de anatomía quirúrgica por UP (Cirugía). Uso: python build.py 1 [2 3 4 ...]
Motor reutilizado de tools/guia_cirugia (lib.py, estilo.css, logo y QR). Contenido: contenido/upNN.py (crear() -> lib.Unidad) y contenido/meta.py (mapa, consejos, videos).
Genera: portada con logo, cómo usar el atlas, índice con páginas, mapa de la unidad (programa -> patologías), lo esencial, módulos con 'Conectá con la unidad',
láminas guiadas, recursos en video y cierre; cabecera con logo y módulo actual, solapa de color, pie y marcadores."""
import os, sys, re, subprocess, importlib
import pymupdf
HERE = os.path.dirname(os.path.abspath(__file__))
GC = os.path.join(os.path.dirname(HERE), 'guia_cirugia')
PP = os.path.join(os.path.dirname(HERE), 'parciales_pdf')
sys.path.insert(0, GC); sys.path.insert(0, HERE)
import lib
from lib import fmt
lib.HERE = HERE   # las láminas se buscan en tools/guia_anatomia/img
from contenido.meta import META
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
OUT = os.path.join(HERE, 'salida'); os.makedirs(OUT, exist_ok=True)
FONTS = os.path.join(PP, 'fonts')
AUTOR = 'Blanc Weigandt, Augusto'; FECHA = 'Noviembre 2026'
W, H = 595.276, 841.89
COL = {1: '#0ea5e9', 2: '#f59e0b', 3: '#16a34a', 4: '#7c3aed', 5: '#e11d48', 6: '#0ea5e9', 7: '#14b8a6', 8: '#4f46e5', 9: '#7c3aed', 10: '#c026d3', 11: '#f97316'}
OSC = {1: '#0369a1', 2: '#b45309', 3: '#166534', 4: '#5b21b6', 5: '#9f1239', 6: '#0369a1', 7: '#0f766e', 8: '#3730a3', 9: '#5b21b6', 10: '#86198f', 11: '#c2410c'}
CLA = {1: '#e6f6fd', 2: '#fff6dd', 3: '#e7f6ec', 4: '#f1ebff', 5: '#fdecef', 6: '#e6f6fd', 7: '#e5f8f5', 8: '#ecebff', 9: '#f1ebff', 10: '#fbe9fd', 11: '#fff0e3'}
NOMBRE = 'Atlas de anatomía quirúrgica · Cirugía'
PIE = 'Atlas de anatomía quirúrgica de elaboración propia · No reemplaza el criterio profesional ni la bibliografía ni está asociado a la cátedra · Verificá siempre la información'

EXTRA = """
.conecta{border:1.2pt solid var(--c);border-left:5pt solid var(--c);border-radius:6pt;background:#fff;margin:2pt 0 9pt 0;padding:0 0 3pt 0;break-inside:avoid}
.conecta .ch{background:var(--cl);color:var(--cd);font-family:Pop,sans-serif;font-weight:bold;font-size:8pt;letter-spacing:.5pt;padding:4pt 9pt;border-radius:4pt 4pt 0 0}
.conecta p{font-size:9.6pt;margin:3pt 9pt 1pt 9pt;text-align:left}
.conecta p.cs{color:#166534}
figure.lam{padding:0;border:1.2pt solid var(--c);border-radius:6pt;overflow:hidden;background:#fff;text-align:center}
figure.lam .lamh{display:flex;align-items:center;gap:7pt;background:var(--c);color:#fff;padding:4pt 9pt;text-align:left}
figure.lam .lamn{font-family:Pop,sans-serif;font-weight:bold;font-size:7pt;letter-spacing:.7pt;background:#fff;color:var(--cd);padding:2pt 7pt;border-radius:10pt;white-space:nowrap}
figure.lam .lamt{font-family:Pop,sans-serif;font-weight:500;font-size:8.6pt;line-height:1.2}
figure.lam img{margin:5pt auto 3pt auto}
figure.lam .mirar{text-align:left;margin:3pt 10pt 4pt 10pt;padding:4pt 9pt 2pt 9pt;border-radius:5pt;background:var(--cl);font-size:8.8pt}
figure.lam .mirar b{font-family:Pop,sans-serif;font-size:7pt;letter-spacing:.6pt;color:var(--cd)}
figure.lam .mirar ol{margin:2pt 0 2pt 14pt;padding:0} figure.lam .mirar li{margin:0 0 1.5pt 0;font-size:8.8pt}
figure.lam .src{margin:0 10pt 5pt 10pt;text-align:left}
.guia-atlas{font-size:9pt;color:#334155;background:#f8fafc;border-left:3pt solid var(--c);border-radius:3pt;padding:3pt 8pt;margin:0 0 6pt 0;text-align:left}
.tocmod{margin:2.2pt 0;font-size:9.6pt}
.mapat td,.mapat th{font-size:8.7pt}
.vid{border:1pt solid var(--line);border-left:4pt solid var(--c);border-radius:5pt;padding:5pt 9pt 3pt 9pt;margin:0 0 6pt 0;break-inside:avoid;background:#fff}
.vid .vt{font-family:Pop,sans-serif;font-weight:bold;font-size:9.4pt;color:var(--cd)} .vid .vu{font-size:8pt;color:#2563eb;word-break:break-all} .vid p{font-size:9pt;margin:2pt 0 1pt 0;text-align:left}
"""


def A(f): return 'file:///' + os.path.join(GC, f).replace(chr(92), '/')
def QR(n): return 'file:///' + os.path.join(GC, 'img', 'qr', n + '.svg').replace(chr(92), '/')


def logo_html(alto=22):
    c, t2 = '#1458c9', '#0b1f44'
    return (f'<div style="display:flex;align-items:center;gap:{alto*0.35}mm;height:{alto}mm"><img src="{A("assets_n.svg")}" style="height:{alto}mm">'
            f'<div><div style="font-family:Pop;font-weight:bold;font-size:{alto*1.5}pt;line-height:1;color:{c};letter-spacing:1pt">NIKA</div>'
            f'<div style="font-family:Pop;font-weight:bold;font-size:{alto*0.3}pt;letter-spacing:.6pt;color:{t2};margin-top:2pt">CAMPUS DE ENTRENAMIENTO MÉDICO</div>'
            f'<div style="font-family:Pop;font-size:{alto*0.24}pt;letter-spacing:.8pt;color:{c};margin-top:1pt">APRENDER · ENTRENAR · MEJORAR</div></div></div>')


# ---------------------------------------------------------------- parches de lib: láminas guiadas y presentación de atlas
def _foto(self, archivo, titulo, fuente, leyenda=None, alto=100):
    alto = int(alto * 0.8); ruta = 'file:///' + os.path.join(HERE, 'img', archivo).replace(chr(92), '/')
    mirar = ''
    if leyenda:
        mirar = '<div class="mirar"><b>QUÉ MIRAR EN ESTA LÁMINA</b><ol>%s</ol></div>' % ''.join('<li>%s</li>' % fmt(t) for _, t in leyenda)
    self.partes.append('<figure class="foto lam"><div class="lamh"><span class="lamn">LÁMINA @@FIG@@</span><span class="lamt">%s</span></div>'
                       '<img src="%s" style="max-height:%dmm">%s<div class="src">Fuente: %s</div></figure>' % (fmt(titulo), ruta, alto, mirar, fmt(fuente)))


_h3_orig = lib.Unidad.h3


def _h3(self, t):
    _h3_orig(self, t)
    if t.startswith('Atlas') and not getattr(self, '_guia_atlas_dada', False):
        self._guia_atlas_dada = True
        self.partes.append('<p class="guia-atlas"><b>Cómo mirar estas láminas:</b> ubicá primero la región, seguí con el dedo el recorrido que acabás de leer en el texto y, en cada lámina, '
                           'fijate qué estructura se lesiona o se examina en las patologías de la unidad.</p>')


lib.Unidad.foto = _foto
lib.Unidad.h3 = _h3


def inyectar_conecta(u):
    """Después del título y la bajada de cada módulo, agrega 'Conectá con la unidad' con lo que dice el programa, dónde se usa y un consejo."""
    meta = META[u.n]['MODULOS']; k = 0
    for c in u.chunks:
        if c['t'] is None or c['q']: continue
        m = meta[k] if k < len(meta) else None; k += 1
        if not m: continue
        pos = 2 if len(c['parts']) > 1 and c['parts'][1].startswith('<p class="lead"') else 1
        h = ('<div class="conecta"><div class="ch">🔗 CONECTÁ CON LA UNIDAD</div>'
             '<p><b>Qué dice el programa:</b> %s</p><p><b>Dónde lo vas a usar:</b> %s</p><p class="cs">✎ <b>Consejo de estudio:</b> %s</p></div>') % (fmt(m['prog']), fmt(m['patol']), fmt(m['tip']))
        c['parts'].insert(pos, h)


# ---------------------------------------------------------------- páginas especiales
def conteo(u):
    html = ''.join(u.partes_final)
    return html.count('class="foto lam"'), len(re.findall(r'class="box oral"><div class="bh"><span class="ic">“</span>SE PREGUNTA ASÍ · Pregunta', html))


def portada(u):
    nlam, npre = conteo(u); nmod = len([m for m in META[u.n]['MODULOS'] if m])
    c, cd, cl = COL[u.n], OSC[u.n], CLA[u.n]
    return f'''<section class="cover" id="portada" style="background:#fff">
<div style="position:absolute;inset:0 0 auto 0;height:122mm;background:{cl}"></div>
<div style="position:absolute;right:-32mm;top:-26mm;width:105mm;height:105mm;border-radius:50%;background:{c};opacity:.18"></div>
<div style="position:absolute;right:-12mm;top:98mm;width:46mm;height:46mm;border-radius:50%;background:{c};opacity:.14"></div>
<div style="position:absolute;left:15mm;top:14mm">{logo_html(20)}</div>
<div style="position:absolute;right:15mm;top:15mm;border:1pt solid {c};color:{cd};font-family:Pop;font-size:7.5pt;padding:4pt 14pt;border-radius:14pt;background:#fff">{FECHA.upper()}</div>
<div style="position:absolute;left:15mm;right:15mm;top:56mm">
 <div style="display:inline-block;background:{c};color:#fff;font-family:Pop;font-weight:bold;font-size:12pt;letter-spacing:1.4pt;padding:6pt 16pt;border-radius:20pt;margin-bottom:10pt">ATLAS DE ANATOMÍA QUIRÚRGICA</div><div class="kick" style="color:{cd}">CIRUGÍA · UNIDAD PROBLEMA {u.n}</div>
 <div style="font-family:Pop;font-weight:bold;font-size:31pt;line-height:1.1">{fmt(u.titulo)}</div>
 <div style="font-family:Pop;font-size:12.5pt;color:{cd};margin-top:8pt;line-height:1.3">{fmt(u.sub)}</div>
</div>
<div style="position:absolute;left:0;right:0;top:122mm;height:2.2mm;background:{c}"></div>
<div style="position:absolute;left:15mm;right:15mm;top:131mm;font-size:11pt;color:#475569;line-height:1.4">Anatomía de cada región (<b>irrigación, inervación, linfáticos, recorrido y relaciones</b>), explicada para el examen oral y conectada con las patologías de la unidad. Láminas a color de atlas reales, con su referencia.</div>
<div style="position:absolute;left:15mm;top:156mm;width:95mm"><div style="font-size:7.5pt;color:#64748b">AUTOR</div><div style="font-family:Pop;font-weight:bold;font-size:14pt">{AUTOR}</div><div style="font-size:9pt;color:#64748b">{FECHA}</div></div>
<div style="position:absolute;right:15mm;top:154mm;display:flex;gap:5mm">
 <div style="width:30mm;height:25mm;background:{cl};border-radius:6pt;text-align:center;padding-top:5mm"><div style="font-family:Pop;font-weight:bold;font-size:20pt;color:{cd}">{nmod}</div><div style="font-size:7.5pt;color:#64748b">módulos</div></div>
 <div style="width:30mm;height:25mm;background:{cl};border-radius:6pt;text-align:center;padding-top:5mm"><div style="font-family:Pop;font-weight:bold;font-size:20pt;color:{cd}">{nlam}</div><div style="font-size:7.5pt;color:#64748b">láminas guiadas</div></div>
 <div style="width:30mm;height:25mm;background:{cl};border-radius:6pt;text-align:center;padding-top:5mm"><div style="font-family:Pop;font-weight:bold;font-size:20pt;color:{cd}">{npre}</div><div style="font-size:7.5pt;color:#64748b">preguntas de oral</div></div></div>
<div style="position:absolute;left:15mm;right:15mm;top:190mm;background:#f2f7ff;border:1pt solid #cfe0fb;border-radius:7pt;padding:10pt 14pt">
 <div style="font-family:Pop;font-weight:bold;font-size:10.5pt;margin-bottom:5pt"><span style="display:inline-block;width:14pt;height:14pt;line-height:14pt;text-align:center;border-radius:50%;background:#1d6fe8;color:#fff;font-size:9pt;margin-right:6pt">!</span>Aviso importante</div>
 <div style="font-size:9.6pt;line-height:1.35">Es un atlas de estudio de elaboración propia: el texto está escrito a partir de los atlas, la bibliografía de la unidad y la anatomía de referencia. <b>No reemplaza el criterio profesional, ni la bibliografía, ni es un documento asociado a la cátedra.</b> Las láminas muestran la anatomía real: ante cualquier duda, <b>la lámina manda</b>.</div></div>
<div style="position:absolute;left:15mm;right:15mm;top:233mm;height:46mm;background:#0b1f44;border-radius:8pt;border-top:3pt solid {c};color:#fff">
 <div style="position:absolute;left:14pt;top:16pt;font-family:Pop;font-weight:bold;font-size:12.5pt">Practicá y mucho más</div>
 <div style="position:absolute;left:14pt;top:36pt;width:200pt;font-size:8.2pt;color:#c9d6ee;line-height:1.35">Escaneá el código de la derecha para entrar a la sala de estudio de Cirugía, o el del centro para practicar con las flashcards de esta unidad. En nikamed.com.ar tenés además exámenes simulados y más material.</div>
 <div style="position:absolute;left:14pt;top:82pt;background:{c};border-radius:14pt;font-family:Pop;font-size:9pt;padding:5pt 18pt">nikamed.com.ar</div>
 <div style="position:absolute;right:14pt;top:9pt;width:36mm;height:36mm;background:#fff;border-radius:7pt;text-align:center"><img src="{QR('sala')}" style="width:28mm;margin-top:2.4mm"><div style="font-size:6.5pt;color:#0b1f44;margin-top:-1mm">Sala de estudio de Cirugía</div></div>
 <div style="position:absolute;right:52mm;top:9pt;width:36mm;height:36mm;background:#fff;border-radius:7pt;text-align:center"><img src="{QR('flash_up%d' % u.n)}" style="width:28mm;margin-top:2.4mm"><div style="font-size:6.5pt;color:#0b1f44;margin-top:-1mm">Flashcards de la UP {u.n}</div></div></div>
<div style="position:absolute;left:0;right:0;bottom:8mm;text-align:center;font-size:7pt;color:{cd}">Aprender · Entrenar · Mejorar</div>
</section>'''


def como_usar(u):
    c = COL[u.n]
    return f'''<section class="sheet unidad" id="tuto" style="--c:{c};--cl:{CLA[u.n]};--cd:{OSC[u.n]};break-after:page">
<div class="kick">ANTES DE EMPEZAR</div><div class="big">Cómo estudiar con este atlas</div>
<p class="lead">Armé este atlas pensando en cómo se rinde anatomía en Cirugía: te preguntan <b>un caso</b> (una herida, una fractura, un abdomen agudo) y tenés que ir <b>de la anatomía a la clínica</b> sin trabarte. Por eso cada región se estudia siempre con el mismo hilo: <b>qué es, por dónde va, qué lo irriga e inerva, qué tiene al lado y qué pasa si se lesiona</b>.</p>
<h3>1 · El camino de cada módulo (hacelo siempre en este orden)</h3>
<ol style="font-size:10pt"><li><b>Leé “Conectá con la unidad”</b>: te dice qué parte del programa cubre el módulo, en qué patologías lo vas a usar y un consejo para estudiarlo.</li>
<li><b>Leé el texto y las tablas</b> con un lápiz: subrayá lo que no sabías.</li>
<li><b>Mirá las láminas del atlas</b> con el recuadro <b>“Qué mirar”</b>: son anatomía real, a color. No las pases de largo: es lo que vas a tener en la cabeza en el oral.</li>
<li><b>Leé en voz alta el bloque “Así lo decís en el oral”</b>: es el discurso modelo, de estudiante a estudiante. Después tapalo e intentá repetirlo con tus palabras.</li>
<li><b>Cerrá con las preguntas de oral</b> del final de la unidad.</li></ol>
<h3>2 · Cómo leer las láminas</h3>
<p>Cada lámina tiene un <b>título</b>, la <b>imagen</b>, los puntos a identificar (<b>qué mirar</b>) y la <b>fuente</b> (atlas de Netter o de Gray, libros de la unidad o imágenes con licencia abierta). Un atlas se estudia <b>con el texto al lado</b>: cuando leas una relación (“el nervio pasa por detrás de la epitróclea”), buscala en la lámina y señalala. Si una imagen es en blanco y negro, es porque no existe en color (radiografías, algunos esquemas de los libros).</p>
<h3>3 · Qué significa cada recuadro</h3>
<div class="box clave"><div class="bh"><span class="ic">★</span>DATO CLAVE</div><p>Lo que se pregunta con más frecuencia.</p></div>
<div class="box alerta"><div class="bh"><span class="ic">!</span>OJO: ERROR FRECUENTE</div><p>La confusión típica que hace perder puntos.</p></div>
<div class="box tip"><div class="bh"><span class="ic">✎</span>REGLA PARA RECORDAR</div><p>Mnemotecnias y atajos.</p></div>
<div class="box clin"><div class="bh"><span class="ic">♥</span>CLÍNICA</div><p>Qué le pasa al paciente cuando esa estructura se lesiona.</p></div>
<div class="box oral"><div class="bh"><span class="ic">“</span>SE PREGUNTA ASÍ</div><p>El discurso del oral y las preguntas con su respuesta modelo.</p></div>
<div class="conecta" style="margin-top:6pt"><div class="ch">🔗 CONECTÁ CON LA UNIDAD</div><p>Al empezar cada módulo: relaciona el tema con el programa y con las patologías.</p></div>
<h3>4 · Moverte por el PDF</h3>
<p>El índice y el mapa son <b>seleccionables</b> (tocá una línea y saltás a la página); también tenés los <b>marcadores</b> del panel lateral y el buscador (Ctrl + F). El color de la unidad aparece en los títulos y en la solapa del borde derecho de cada página; arriba, en la cabecera, siempre ves en qué módulo estás.</p>
</section>'''


def indice(u, pags):
    c = COL[u.n]
    def fila(href, txt, key, st=''):
        return '<a class="tocrow" href="#%s" style="%s"><span>%s</span><span class="dots"></span><b>%s</b></a>' % (href, st, txt, pags.get(key, '·'))
    h = '<div class="kick">ÍNDICE</div><div class="big">Contenido del atlas</div><p class="nota">Tocá cualquier línea para saltar a esa página.</p>'
    h += fila('portada', 'Portada', 'portada', 'margin:4pt 0;font-size:10pt')
    h += fila('tuto', 'Cómo estudiar con este atlas', 'tuto', 'margin:4pt 0;font-size:10pt')
    h += fila('mapa', 'Mapa de la unidad: programa, patologías y módulos', 'mapa', 'margin:4pt 0;font-size:10pt')
    h += fila('esencial', 'Lo que más se pregunta y ruta de repaso', 'esencial', 'margin:4pt 0;font-size:10pt')
    h += '<div style="margin:9pt 0 3pt 0;border-left:6pt solid %s;padding:3pt 8pt;background:%s;border-radius:3pt"><b style="font-family:Pop;font-size:10.3pt;color:%s">UP %d · %s</b></div>' % (c, CLA[u.n], OSC[u.n], u.n, fmt(u.titulo))
    for k, (i, t, pr) in enumerate(u.mods, 1):
        h += fila(i, '<b style="color:%s">%d.</b> %s' % (c, k, fmt(t)), i, 'margin-left:10pt;font-size:9.6pt;margin-top:2.6pt;margin-bottom:2.6pt')
    h += '<div style="height:6pt"></div>'
    h += fila('videos', 'Para reforzar: videos y recursos recomendados', 'videos', 'margin:4pt 0;font-size:10pt')
    h += fila('nikamed', 'Qué es NikaMed', 'nikamed', 'margin:4pt 0;font-size:10pt')
    return '<section class="sheet unidad" id="indice" style="--c:%s;--cl:%s;--cd:%s;break-after:page">%s</section>' % (c, CLA[u.n], OSC[u.n], h)


def mapa(u, pags):
    c = COL[u.n]; meta = META[u.n]['MODULOS']
    h = '<div id="mapa"></div><div class="kick">MAPA DE LA UNIDAD %d</div><div class="big" style="font-size:17pt">Cómo se conecta cada módulo con el programa y con las patologías</div>' % u.n
    h += ('<p>Esta tabla es el puente entre la anatomía y la unidad problema: para cada módulo ves <b>qué punto del programa cubre</b>, <b>en qué patologías o situaciones lo vas a usar</b> y en qué página está. '
          'Cuando estudies una patología de la unidad, volvé a esta tabla y repasá los módulos que la sostienen.</p>')
    h += '<table class="mapat"><thead><tr><th>#</th><th>Módulo</th><th>Qué dice el programa</th><th>Dónde lo usás (patologías y situaciones)</th><th>Pág.</th></tr></thead><tbody>'
    k = 0
    for (i, t, pr), m in zip(u.mods, meta + [None] * 20):
        k += 1
        if not m: continue
        h += '<tr><td><a href="#%s">%d</a></td><td><a href="#%s"><b>%s</b></a></td><td>%s</td><td>%s</td><td>%s</td></tr>' % (i, k, i, fmt(t), fmt(m['prog']), fmt(m['patol']), pags.get(i, '·'))
    h += '</tbody></table>'
    return '<section class="sheet unidad" style="--c:%s;--cl:%s;--cd:%s;break-after:page">%s</section>' % (c, CLA[u.n], OSC[u.n], h)


def esencial(u):
    c = COL[u.n]; m = META[u.n]
    h = '<div id="esencial"></div><div class="kick">ANTES DE EMPEZAR LA UNIDAD %d</div><div class="big" style="font-size:17pt">Lo esencial y cómo repasarla</div>' % u.n
    h += '<div class="box top" style="margin-top:8pt"><div class="bh"><span class="ic">★</span>LO QUE MÁS SE PREGUNTA EN ESTA UNIDAD</div><ul>%s</ul></div>' % ''.join('<li>%s</li>' % fmt(x) for x in m['TOP'])
    h += '<h3>Ruta de repaso en tres días</h3><div class="dias">' + ''.join('<div class="dia"><b class="t">%s</b><ul>%s</ul></div>' % (fmt(t), ''.join('<li>%s</li>' % fmt(x) for x in its)) for t, its in m['RUTA']) + '</div>'
    h += '<div class="box consejo"><div class="bh"><span class="ic">➜</span>CONSEJO DE UN ESTUDIANTE A OTRO</div><p>No estudies anatomía como una lista de nombres: estudiala como un <b>recorrido</b>. Elegí una estructura (por ejemplo el nervio mediano) y seguila de proximal a distal diciendo en voz alta <b>con qué se relaciona</b> y <b>qué pasa si se corta ahí</b>. Si podés contarlo sin mirar la lámina, lo sabés para el oral. Repasá a los 1, 3 y 7 días y dejá las tablas para la última vuelta.</p></div>'
    h += ('<div class="qrs"><div class="qrb"><img src="%s"><div><div class="qt2">Sala de estudio de Cirugía</div><p>Material de la materia, recorrido por unidades y práctica en nikamed.com.ar.</p></div></div>'
          '<div class="qrb"><img src="%s"><div><div class="qt2">Flashcards de la UP %d</div><p>Repasá esta unidad con tarjetas de estudio, de forma gratuita.</p></div></div></div>') % (QR('sala'), QR('flash_up%d' % u.n), u.n)
    return '<section class="sheet unidad" style="--c:%s;--cl:%s;--cd:%s;break-after:page">%s</section>' % (c, CLA[u.n], OSC[u.n], h)


def videos(u):
    c = COL[u.n]
    h = '<div id="videos"></div><div class="kick">PARA REFORZAR</div><div class="big" style="font-size:17pt">Videos y recursos recomendados</div>'
    h += ('<p>La anatomía se entiende mejor viendo también <b>movimiento y disecciones</b>. Estos recursos complementan el atlas; son sitios educativos conocidos y cada uno tiene su propia modalidad de acceso (algunos son gratuitos y otros, por suscripción). '
          '<b>Usalos para reforzar, no para reemplazar la bibliografía de la cátedra</b>, y contrastá siempre los datos con tus libros.</p>')
    for t, url, d in META[u.n]['VIDEOS']:
        h += '<div class="vid"><div class="vt">%s</div><div class="vu">%s</div><p>%s</p></div>' % (fmt(t), url, fmt(d))
    h += '<div class="box consejo" style="margin-top:8pt"><div class="bh"><span class="ic">➜</span>CÓMO USAR UN VIDEO PARA ESTUDIAR</div><ul><li>Miralo <b>después</b> de leer el módulo, no antes: así sabés qué buscar.</li><li>Pausá en cada estructura y nombrala en voz alta con sus relaciones.</li><li>Dibujá en un papel el recorrido (nervio o vaso) mientras lo ves.</li><li>Anotá lo que el video agrega y no está en el atlas, y verificalo en tu libro.</li></ul></div>'
    return '<section class="sheet unidad" style="--c:%s;--cl:%s;--cd:%s;break-after:page">%s</section>' % (c, CLA[u.n], OSC[u.n], h)


def cierre(u):
    return f'''<section class="cover" id="nikamed" style="background:#fff">
<div style="position:absolute;left:15mm;right:15mm;top:22mm">
 {logo_html(16)}
 <div class="kick" style="margin-top:14pt">QUÉ ES NIKAMED</div>
 <div class="big">Practicá en NikaMed</div>
 <p style="font-size:10.6pt;line-height:1.45">NikaMed es un campus de entrenamiento médico para estudiantes de Medicina de toda Argentina. Nació para poder practicar con preguntas bien justificadas y estudiar en un solo lugar. Soy Weigandt, Augusto, creador de la plataforma y autor de este atlas.</p>
 <div style="margin-top:12pt;display:grid;grid-template-columns:1fr 1fr;gap:8pt">
  <div class="box def"><div class="bh">SIMULADOR DE EXÁMENES</div><p>Preguntas de opción múltiple, cronometradas y con la justificación de cada respuesta.</p></div>
  <div class="box trat"><div class="bh">FLASHCARDS</div><p>Tratamientos, algoritmos de manejo y mucho más, para repasar de forma rápida.</p></div>
  <div class="box tip"><div class="bh">NIKAFARMA</div><p>Consulta de fármacos y tratamientos con guías argentinas.</p></div>
  <div class="box clave"><div class="bh">SALA DE ESTUDIO Y POMODORO</div><p>Materiales de cada materia en un solo lugar y salas para estudiar acompañado.</p></div></div>
 <div style="margin-top:14mm;height:62mm;background:#0b1f44;border-radius:8pt;border-top:3pt solid #1d6fe8;color:#fff;position:relative">
  <div style="position:absolute;left:16pt;top:20pt;font-family:Pop;font-weight:bold;font-size:14pt">Escaneá los códigos<br>o entrá al sitio</div>
  <div style="position:absolute;left:16pt;top:98pt;background:#1d6fe8;border-radius:14pt;font-family:Pop;font-size:10pt;padding:6pt 20pt">nikamed.com.ar</div>
  <div style="position:absolute;right:18pt;top:14pt;width:44mm;height:44mm;background:#fff;border-radius:7pt;text-align:center"><img src="{QR('sala')}" style="width:35mm;margin-top:3mm"><div style="font-size:7pt;color:#0b1f44;margin-top:-1mm">Sala de estudio de Cirugía</div></div>
  <div style="position:absolute;right:76mm;top:14pt;width:44mm;height:44mm;background:#fff;border-radius:7pt;text-align:center"><img src="{QR('flash_up%d' % u.n)}" style="width:35mm;margin-top:3mm"><div style="font-size:7pt;color:#0b1f44;margin-top:-1mm">Flashcards de la UP {u.n}</div></div></div>
</div>
<div style="position:absolute;left:0;right:0;bottom:8mm;text-align:center;font-size:7pt;color:#1d6fe8">Aprender · Entrenar · Mejorar</div>
</section>'''


def armar(u, pags):
    css = open(os.path.join(GC, 'estilo.css'), encoding='utf-8').read()
    c = COL[u.n]
    cuerpo = ('<section class="unidad" style="--c:%s;--cl:%s;--cd:%s">%s</section>' % (c, CLA[u.n], OSC[u.n], ''.join(u.partes_final)))
    body = portada(u) + como_usar(u) + indice(u, pags) + mapa(u, pags) + esencial(u) + cuerpo + videos(u) + cierre(u)
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>%s</title><style>%s%s</style></head><body>%s</body></html>' % (NOMBRE, css, EXTRA, body)


def render(htm, pdf):
    hp = os.path.join(OUT, 'atlas.html'); open(hp, 'w', encoding='utf-8').write(htm)
    if os.path.exists(pdf): os.remove(pdf)
    subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + pdf, '--virtual-time-budget=30000', 'file:///' + hp.replace(chr(92), '/')],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=900)
    assert os.path.exists(pdf)


def hex2rgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


def posproceso(src, dst, u, pags):
    doc = pymupdf.open(src); n = doc.page_count
    NSVG = pymupdf.open('pdf', pymupdf.open(os.path.join(GC, 'assets_nh.svg')).convert_to_pdf())
    fp = lambda f: os.path.join(FONTS, f)
    col = hex2rgb(COL[u.n]); navy = (0.043, 0.122, 0.267); grey = (0.39, 0.45, 0.55)
    mods = [(pags[i], k, t) for k, (i, t, pr) in enumerate(u.mods, 1)]
    ini_mod = min(p for p, _, _ in mods); fin_mod = pags['videos']
    fPopB = pymupdf.Font(fontfile=fp('Poppins Bold.ttf')); fPop = pymupdf.Font(fontfile=fp('Poppins Regular.ttf')); fCalB = pymupdf.Font(fontfile=fp('calibrib.ttf'))
    for i in range(n):
        p = i + 1; page = doc[i]
        if p == 1 or p == n: continue
        for nombre, f in (('pop', 'Poppins Regular.ttf'), ('popb', 'Poppins Bold.ttf'), ('calb', 'calibrib.ttf'), ('cal', 'calibri.ttf')):
            page.insert_font(fontname=nombre, fontfile=fp(f))
        page.draw_rect(pymupdf.Rect(0, 0, W, 4), color=None, fill=col)
        page.show_pdf_page(pymupdf.Rect(40, 14, 62, 36), NSVG, 0)
        txt = 'ATLAS DE ANATOMÍA QUIRÚRGICA'; wpill = fPopB.text_length(txt, 7.6) + 18
        page.draw_rect(pymupdf.Rect(70, 16, 70 + wpill, 32), color=None, fill=col, radius=0.5)
        page.insert_text((79, 27.5), txt, fontsize=7.6, fontname='popb', color=(1, 1, 1))
        actual = None
        if ini_mod <= p < fin_mod:
            for ps, k, t in mods:
                if p >= ps: actual = (k, t)
        s = ('UP %d · %s' % (u.n, u.titulo.upper())) if not actual else ('%d · %s' % (actual[0], actual[1]))
        s = s if len(s) <= 58 else s[:55] + '…'
        w = fPop.text_length(s, 6.4)
        page.insert_text((W - 40 - w, 28), s, fontsize=6.4, fontname='pop', color=col)
        page.draw_rect(pymupdf.Rect(W - 18, 330, W + 2, 470), color=None, fill=col)
        page.insert_textbox(pymupdf.Rect(W - 18, 330, W - 2, 470), 'UP %d' % u.n, fontsize=6.5, fontname='popb', color=(1, 1, 1), rotate=90, align=1)
        page.draw_line((40, 806), (W - 40, 806), color=(0.82, 0.87, 0.93), width=0.6)
        page.insert_text((40, 816), PIE, fontsize=5.6, fontname='cal', color=grey)
        page.insert_text((40, 825), '%s · %s · nikamed.com.ar' % (AUTOR, FECHA), fontsize=5.8, fontname='calb', color=navy)
        s = 'Página %d de %d' % (p, n); w = fCalB.text_length(s, 5.8)
        page.insert_text((W - 40 - w, 825), s, fontsize=5.8, fontname='calb', color=navy)
    toc = [[1, 'Portada', 1], [1, 'Cómo estudiar con este atlas', pags['tuto']], [1, 'Índice', pags['indice']], [1, 'Mapa de la unidad', pags['mapa']], [1, 'Lo esencial y ruta de repaso', pags['esencial']],
           [1, 'UP %d · %s' % (u.n, u.titulo), ini_mod]]
    for ps, k, t in mods: toc.append([2, '%d. %s' % (k, t), ps])
    toc += [[1, 'Videos y recursos recomendados', pags['videos']], [1, 'Qué es NikaMed', pags['nikamed']]]
    doc.set_toc(toc)
    doc.set_metadata({'title': 'Atlas de anatomía quirúrgica · UP %d · %s · NikaMed' % (u.n, u.titulo), 'author': AUTOR, 'subject': 'Anatomía quirúrgica de Cirugía, UP %d' % u.n, 'keywords': 'Cirugía, anatomía, UP %d, NikaMed' % u.n})
    doc.save(dst, garbage=4, deflate=True)


def main():
    for a in sys.argv[1:] or ['1']:
        n = int(a); m = importlib.import_module('contenido.up%02d' % n)
        u = m.crear(); inyectar_conecta(u); u.finalizar()
        raw = os.path.join(OUT, 'up%02d_raw.pdf' % n); pags = {}
        for paso in (1, 2):
            render(armar(u, pags), raw)
            d = pymupdf.open(raw); pags = {}
            for pg in d:
                for l in pg.get_links():
                    if l.get('nameddest'): pags[l['nameddest']] = l['page'] + 1
            pags['indice'] = [i + 1 for i, pg in enumerate(d) if 'Contenido del atlas' in pg.get_text()][0]
            d.close()
        fin = os.path.join(OUT, 'Atlas_Anatomia_Quirurgica_UP%02d_Cirugia_NikaMed.pdf' % n)
        posproceso(raw, fin, u, pags)
        os.remove(raw)
        print('UP', n, pymupdf.open(fin).page_count, 'págs ->', fin)


if __name__ == '__main__':
    main()
