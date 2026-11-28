# -*- coding: utf-8 -*-
"""Silueta del cuerpo real (Netter S-2 y S-3): extrae las dos imágenes, define las zonas táctiles y asigna a cada lámina del atlas su región.
Salida: assets/atlas/cuerpo/S-2.webp, S-3.webp  y  data/atlas_regiones.json"""
import os, sys, json, re, unicodedata
import pymupdf
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
NET = r'C:/Users/Augusto/Desktop/Medicina/Netter Atlas de Anatomia Humana 8a Edicion.pdf'
OUT = os.path.join(RAIZ, 'assets', 'atlas', 'cuerpo'); os.makedirs(OUT, exist_ok=True)
idx = {s: p for p, s, _, _ in json.load(open(os.path.join(HERE, 'trabajo', 'netter_idx.json'), encoding='utf-8'))}
d = pymupdf.open(NET)
DIM = {}
CX0, CX1 = 55, 545   # recorte lateral (px de referencia a 75 dpi)
for code in ('S-2', 'S-3'):
    p = d[idx[code] - 1]; W, H = p.rect.width, p.rect.height
    # sólo el cuerpo (sin título ni firma): se recorta la franja superior de título y el pie
    clip = pymupdf.Rect(CX0 * 0.96, 52, CX1 * 0.96, H * 0.952)
    pm = p.get_pixmap(dpi=110, clip=clip, colorspace=pymupdf.csRGB)
    im = Image.frombytes('RGB', (pm.width, pm.height), pm.samples)
    im.save(os.path.join(OUT, code + '.webp'), 'WEBP', quality=82, method=5)
    DIM[code] = (pm.width, pm.height, clip)
    # rótulos (se tapan con el cuerpo "limpio"): se devuelven para mostrar el nombre real de Netter
print({k: v[:2] for k, v in DIM.items()})

# zonas en coordenadas de la imagen mostrada en pantalla de referencia (638 x 775 a 75 dpi, con el título): se pasan a milésimas del recorte
REF_W, REF_H, TOP = 638.0, 775.0, 52 * 75 / 72


def pm(r):
    x0, y0, x1, y1 = r
    ancho = REF_W; alto = REF_H - TOP - (REF_H * 0.0)   # el recorte llega hasta 95,2 % de la página original
    cw = float(CX1 - CX0)
    return [round(max(0, x0 - CX0) / cw * 1000), round((y0 - TOP) / alto * 1000), round(min(cw, x1 - CX0) / cw * 1000), round((y1 - TOP) / alto * 1000)]


VISTAS = {
    'S-2': dict(titulo='Vista anterior', zonas=[
        ('cabeza', 'Cabeza', [(245, 64, 358, 172)]),
        ('cuello', 'Cuello', [(262, 172, 340, 203)]),
        ('torax', 'Tórax', [(208, 205, 355, 268)]),
        ('abdomen', 'Abdomen', [(215, 268, 345, 385)]),
        ('pelvis', 'Pelvis y periné', [(212, 385, 350, 452)]),
        ('hombro', 'Hombro, axila y brazo', [(135, 205, 238, 330), (345, 205, 440, 320)]),
        ('mano', 'Antebrazo y mano', [(75, 330, 190, 470), (385, 315, 525, 420)]),
        ('muslo', 'Cadera y muslo', [(210, 452, 360, 560)]),
        ('pierna', 'Rodilla y pierna', [(225, 560, 350, 715)]),
        ('pie', 'Tobillo y pie', [(228, 715, 392, 775)]),
    ]),
    'S-3': dict(titulo='Vista posterior', zonas=[
        ('cabeza', 'Cabeza', [(250, 75, 322, 150)]),
        ('cuello', 'Cuello', [(262, 150, 314, 192)]),
        ('dorso', 'Dorso y columna', [(185, 195, 350, 380)]),
        ('hombro', 'Hombro, axila y brazo', [(150, 205, 215, 365), (350, 205, 440, 345)]),
        ('mano', 'Antebrazo y mano', [(105, 365, 215, 500), (385, 340, 490, 505)]),
        ('muslo', 'Cadera, glúteo y muslo', [(215, 380, 375, 600)]),
        ('pierna', 'Rodilla y pierna', [(222, 600, 380, 690)]),
        ('pie', 'Tobillo y pie', [(215, 690, 392, 775)]),
    ]),
}
vistas_out = {}
for code, v in VISTAS.items():
    vistas_out[code] = dict(t=v['titulo'], w=DIM[code][0], h=DIM[code][1], z=[dict(id=i, n=n, r=[pm(r) for r in rs]) for i, n, rs in v['zonas']])

REGIONES = {
    'cabeza': ('Cabeza', 'cabeza|craneo|cranea|meninge|encefalo|cerebr|facial|craneal|parotida|orbita|boca|lengua|nariz|polígono|poligono|senos venosos|sien|oreja|mandibula|submandibular|duramadre|tronco encefalico|salival'),
    'cuello': ('Cuello', 'cuello|tiroides|laringe|traquea|paratiroides|cervical|triangulo|platisma|faringe|yugular|carotida|hioides|cricoid|tirohioid'),
    'torax': ('Tórax', 'torax|toracic|pulmon|corazon|pericardi|mediastino|costilla|esofago|mama|intercostal|diafragma|bronquio|pleura|coronaria|ligamento arterioso'),
    'abdomen': ('Abdomen', 'abdomen|abdominal|higado|estomago|intestino|colon|pancreas|bazo|vesicula|biliar|duodeno|apendice|peritoneo|mesenteri|epiplon|porta|celiaco|rinon|renal|inguinal|hernia|retroperiton|ciego|yeyuno|ileon|ileocec|gastric|hepatic|linea alba|vaina de los rectos|espermatic'),
    'pelvis': ('Pelvis y periné', 'pelvis|pelvic|perine|vejiga|prostata|recto\\b|rectal|ano\\b|anal|uretra|utero|escroto|testicul|pene\\b|ureter|genital|suelo pelvico|isquioanal'),
    'hombro': ('Hombro, axila y brazo', 'hombro|axila|axilar|brazo|codo|humero|clavicula|escapula|plexo braquial|deltoid|manguito|escapular|braquial|supracondil'),
    'mano': ('Antebrazo y mano', 'antebrazo|mano|munec|carpo|carpiano|dedos|radio\\b|cubito|palmar|tendones flexores|tenar|hipotenar|guyon|radial|cubital|mediano'),
    'muslo': ('Cadera y muslo', 'cadera|muslo|femur|gluteo|femoral|ciatico|canal aductor|acetabulo|trocanter|isquiotibial|cuadriceps|aductor'),
    'pierna': ('Rodilla y pierna', 'rodilla|pierna|tibia|perone|poplite|menisco|ligamento cruzado|compartimento|safena|rotula'),
    'pie': ('Tobillo y pie', 'pie\\b|tobillo|calcaneo|astragalo|planta|maleolo|tarso|metatars|dorso del pie|pedia'),
    'dorso': ('Dorso y columna', 'columna|vertebr|medula|espinal|raquide|dorso|dermatoma|neuroeje|epidural|lumbar|sacro|disco'),
}


def norm(t):
    t = unicodedata.normalize('NFD', str(t).lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')


lam = json.load(open(os.path.join(RAIZ, 'data', 'atlas_laminas.json'), encoding='utf-8'))['placas']
rx = {k: re.compile(v[1]) for k, v in REGIONES.items()}
asign = {k: [] for k in REGIONES}
for p in lam:
    tit = norm(p['t']); eti = norm(' '.join(p.get('e') or []))
    pts = {}
    for k, r in rx.items():
        a = len(r.findall(tit)); b = len(r.findall(eti))
        s = a * 4 + min(b, 12)
        if a >= 1 or s >= 5: pts[k] = s
    for k, s in sorted(pts.items(), key=lambda x: -x[1])[:2]:
        asign[k].append((s, p['c']))
out = dict(version=1, vistas=vistas_out, regiones={k: dict(n=REGIONES[k][0], c=[c for _, c in sorted(asign[k], key=lambda x: -x[0])]) for k in REGIONES})
json.dump(out, open(os.path.join(RAIZ, 'data', 'atlas_regiones.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print({k: len(v['c']) for k, v in out['regiones'].items()}, 'sin región:', len([p for p in lam if not any(p['c'] in dict((c, 1) for _, c in asign[k]) for k in asign)]))
