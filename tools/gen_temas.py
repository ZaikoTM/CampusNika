#!/usr/bin/env python3
"""Genera las páginas públicas por tema (temas/<id>.html), el índice temas-clinicos.html,
las imágenes OG por tema y las entradas del sitemap, a partir de los JSON de flashcards.
Uso: python tools/gen_temas.py   (desde la raíz del repo)"""
import json, os, re, html, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fuentes_ar as FA
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://nikamed.com.ar'
FECHA = '2026-10-16'
AREAS = {
    'ginecologia': dict(nombre='Ginecología y Obstetricia', ico='🌸', acc=(236, 72, 153), guia='Salud Integral de la Mujer'),
    'cirugia': dict(nombre='Cirugía', ico='🔪', acc=(14, 165, 233), guia='Introducción a las Especialidades Clínico-Quirúrgicas'),
    'criterios': dict(nombre='Criterios y escalas', ico='📊', acc=(139, 92, 246), guia='Criterios, clasificaciones y escalas clínicas'),
}
e = html.escape

def cargar():
    out, unidades = [], {}
    for f in ('data/nikafarma_patologias.json', 'data/flashcards_cirugia.json', 'data/flashcards_criterios.json'):
        d = json.load(open(os.path.join(ROOT, f), encoding='utf8'))
        unidades.update(d['meta'].get('unidades', {}))
        for p in d['patologias']:
            p.setdefault('area', 'ginecologia')
            out.append(p)
    return out, unidades

def corto(t, n):
    t = re.sub(r'\s+', ' ', t).strip()
    if len(t) <= n: return t
    return t[:n - 1].rsplit(' ', 1)[0].rstrip(',;:.') + '…'

def primera_oracion(t):
    t = re.sub(r'\s+', ' ', t).strip()
    m = re.match(r'(.+?[\.\!\?])(\s|$)', t)
    return m.group(1) if m and len(m.group(1)) > 40 else t

def plano_tx(p):
    return ' '.join(f"{b['titulo']}: " + ' '.join(f"{s['etiqueta']} {s['texto']}" for s in b.get('pasos', [])) for b in p.get('tratamiento', []))

PAPEL = {'cx1': '#c7f9cc', 'cx2': '#bae6fd', 'cx3': '#fde68a', 'cx4': '#fecdd3', 'cx5': '#ddd6fe', 'cx6': '#fed7aa', 'cx7': '#e9d5ff', 'cx8': '#fbcfe8', 'cx9': '#fff3a3', 'cx10': '#bbf7d0', 'cx11': '#c7d2fe',
         'up1': '#fff3a3', 'up2': '#fbcfe8', 'up3-sec1': '#bbf7d0', 'up3-sec2': '#ddd6fe', 'up3-sec3': '#fed7aa', 'up3-sec4': '#bae6fd', 'up3-sec5': '#fecdd3', 'up4': '#e9d5ff'}
RX_DOSIS = re.compile(r'(\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?\s?(?:mg/kg/h|mg/kg/día|mg/kg|mg/día|mg/m²|mg/ml|mg|mcg|µg|µg/kg|UI|mUI/ml|mU/min|UI/l|ml/h|ml|mL|g/día|g|U|%|semanas?|días?|horas?|meses|minutos|h|años|cm|mm|mmHg|mg/dl|ng/ml|µmol/l))(?![A-Za-zÁÉÍÓÚáéíóúñ])')
def fmt(texto):
    partes = re.split(r'(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ¿(])', re.sub(r'\s+', ' ', str(texto)).strip())
    out = []
    for o in partes:
        h = e(o)
        h = RX_DOSIS.sub(r'<mark>\1</mark>', h)
        h = re.sub(r'^([^:<]{2,60}):\s', r'<strong class="tm-lead">\1:</strong> ', h)
        out.append('<span class="tm-or">' + h + '</span>')
    return ''.join(out)

def lista(items, cls=''):
    return '<ul%s>' % (' class="%s"' % cls if cls else '') + ''.join('<li>%s</li>' % fmt(x) for x in items) + '</ul>'

SEC_ICO = {'diagnostico': ('🩺', '#3b82f6'), 'estudios': ('🧪', '#0d9488'), 'banderas': ('🚩', '#dc2626'), 'tratamiento': ('💊', '#db2777'), 'seguimiento': ('📈', '#d97706')}
def seccion(n, titulo, cuerpo, ident):
    ico, col = SEC_ICO.get(ident, ('📌', '#6366f1'))
    return f'<details class="tm-sec" id="{ident}" open style="--sc:{col}"><summary><span class="ic">{ico}</span><span class="tt">{titulo}</span><span class="chev" aria-hidden="true"></span></summary><div class="tm-body">{cuerpo}</div></details>'

CSS_EXTRA = """
.tm-meta{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px}
.tm-fuente{border:1px solid rgba(56,189,248,.35);background:rgba(14,165,233,.08);border-radius:14px;padding:14px 16px;margin:18px 0;font-size:.88rem;color:var(--text-body)}
.tm-fuente b{color:#fff}.tm-fuente a{color:var(--primary-glow);font-weight:800}
.tm-cta{background:linear-gradient(135deg,rgba(14,165,233,.16),rgba(168,85,247,.16));border:1px solid var(--border-bright);border-radius:18px;padding:26px 24px;margin:26px 0;text-align:center}
.tm-cta h2{font-size:1.2rem;font-weight:900;color:#fff;margin-bottom:8px}.tm-cta p{font-size:.92rem;color:var(--text-body);margin-bottom:16px}
.tm-cta .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.tm-rojo li{color:#fecaca}.tm-rojo{border-left:3px solid #f87171;padding-left:16px!important}
.tm-sub{font-size:.95rem;font-weight:900;color:var(--primary-glow);margin:16px 0 6px}
.tm-rel{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:12px}
.tm-rel a{display:block;padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(15,23,42,.6);color:#e2e8f0!important;font-weight:800;font-size:.86rem;text-decoration:none!important;transition:.2s}
.tm-rel a:hover{border-color:var(--violet-glow);transform:translateY(-2px)}
.tm-rel small{display:block;color:var(--text-dim);font-weight:600;margin-top:2px}
.tm-ir{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 18px;position:sticky;top:64px;z-index:5;padding:8px 0;background:linear-gradient(180deg,rgba(2,6,23,.92),rgba(2,6,23,.6));backdrop-filter:blur(8px)}
.tm-ir a{padding:7px 13px;border-radius:99px;border:1px solid var(--border-subtle);background:rgba(15,23,42,.8);color:#e2e8f0;font-weight:800;font-size:.8rem;text-decoration:none;white-space:nowrap}
.tm-ir a:hover{border-color:var(--violet-glow);color:#fff}
.tm-hoja{--paper:#fff3a3;position:relative;background:var(--paper);color:#1e293b;border-radius:10px 10px 26px 10px;padding:34px 26px 24px;margin:8px 0 8px;box-shadow:0 30px 60px -26px rgba(0,0,0,.8)}
.tm-pin{position:absolute;top:-10px;left:50%;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fda4af,#e11d48 60%,#9f1239);box-shadow:0 4px 8px rgba(0,0,0,.4)}
.tm-marca{position:absolute;top:18px;right:20px;display:flex;align-items:center;gap:7px;opacity:.55;pointer-events:none}
.tm-marca img{display:block;height:34px;width:auto}.tm-marca img.v{height:22px}
.tm-titulo{font:700 2.5rem/1.02 'Caveat',cursive;color:#1e293b;margin:0 0 4px;padding-right:200px;border:0}
.tm-uni{font-weight:800;font-size:.8rem;color:rgba(30,41,59,.7);margin-bottom:18px;text-transform:uppercase;letter-spacing:.6px}
.tm-sec{margin:12px 0;border-radius:16px;background:rgba(255,255,255,.62);border:1px solid rgba(0,0,0,.08);overflow:hidden}
.tm-sec>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 14px;font-weight:900;color:#1e293b;border-left:6px solid var(--sc);background:rgba(255,255,255,.55)}
.tm-sec>summary::-webkit-details-marker{display:none}
.tm-sec .ic{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;background:color-mix(in srgb,var(--sc) 16%,#fff);font-size:1.1rem}
.tm-sec .tt{flex:1;font-size:1.02rem}
.tm-sec .chev{width:10px;height:10px;border-right:3px solid #475569;border-bottom:3px solid #475569;transform:rotate(45deg);transition:transform .2s;margin-right:4px}
.tm-sec[open] .chev{transform:rotate(-135deg)}
.tm-body{padding:6px 16px 14px}
.tm-body p,.tm-body li{color:#1e293b!important;font-size:.95rem;line-height:1.55}
.tm-body ul{list-style:none;padding:0!important;margin:6px 0 0!important;display:flex;flex-direction:column;gap:8px}
.tm-body ul li{position:relative;padding:9px 12px 9px 28px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.05)}
.tm-body ul li::before{content:'';position:absolute;left:11px;top:16px;width:8px;height:8px;border-radius:50%;background:var(--sc)}
.tm-body ul.tm-pasos li.tm-paso{display:grid;grid-template-columns:96px 1fr;gap:10px;padding:10px 12px}
.tm-body ul.tm-pasos li.tm-paso::before{display:none}
.tm-paso b{font:700 1.3rem/1.1 'Caveat',cursive;color:#be185d}
.tm-def{padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.75);border-left:5px solid var(--sc);margin:8px 0 4px}
.tm-or{display:block;margin:0 0 4px}.tm-or+.tm-or{margin-top:2px}
.tm-body mark{background:linear-gradient(transparent 55%,rgba(251,191,36,.6) 55%);color:#78350f;font-weight:800;padding:0 2px;border-radius:3px}
.tm-lead{color:#9d174d}
.tm-body .tm-sub{display:inline-block;margin:14px 0 2px;padding:4px 12px;border-radius:99px;font-size:.78rem;color:#fff;background:var(--sc)}
.tm-body ul.tm-rojo{border-left:0;padding-left:0!important}
.tm-body ul.tm-rojo li{background:rgba(254,226,226,.85);border-color:rgba(220,38,38,.25)}
.tm-body ul.tm-rojo li::before{background:#dc2626}
@media(max-width:600px){.tm-hoja{padding:30px 14px 18px}.tm-titulo{font-size:2rem;padding-right:0;margin-top:30px}.tm-marca{top:14px;right:14px}.tm-body ul.tm-pasos li.tm-paso{grid-template-columns:1fr;gap:0}.tm-ir{top:56px;flex-wrap:nowrap;overflow-x:auto}}
.tm-hoja{background:linear-gradient(160deg,rgba(168,85,247,.10),rgba(15,23,42,.78) 38%,rgba(14,165,233,.07));color:#e2e8f0;border:1px solid var(--border-subtle);border-radius:20px;backdrop-filter:blur(10px);box-shadow:0 18px 50px -18px rgba(0,0,0,.7),0 0 0 1px rgba(168,85,247,.12) inset}
.tm-hoja::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;border-radius:20px 20px 0 0;background:linear-gradient(90deg,var(--primary),var(--violet))}
.tm-pin{display:none}
.tm-marca{opacity:.95}.tm-marca img.v{filter:brightness(0) invert(1)}
.tm-titulo{font:900 clamp(1.5rem,3.4vw,2rem)/1.15 'Plus Jakarta Sans',sans-serif;color:#fff;letter-spacing:-.5px;padding-right:190px}
.tm-uni{color:var(--violet-glow)}
.tm-sec{background:rgba(2,6,23,.45);border:1px solid rgba(255,255,255,.07)}
.tm-sec>summary{background:rgba(15,23,42,.65);color:#fff;border-left:5px solid var(--sc)}
.tm-sec .ic{background:color-mix(in srgb,var(--sc) 22%,#0f172a)}
.tm-sec .chev{border-color:#94a3b8}
.tm-body p,.tm-body li{color:#cbd5e1!important}
.tm-body ul li{background:rgba(15,23,42,.7);border:1px solid rgba(255,255,255,.06)}
.tm-def{background:rgba(15,23,42,.7);color:#e2e8f0}
.tm-body mark{background:linear-gradient(transparent 52%,rgba(168,85,247,.45) 52%);color:#fff}
.tm-lead{color:var(--primary-glow)}
.tm-paso b{font:900 .9rem/1.3 'Plus Jakarta Sans',sans-serif;color:var(--violet-glow);letter-spacing:.2px}
.tm-body ul.tm-pasos li.tm-paso{grid-template-columns:110px 1fr}
.tm-body ul.tm-rojo li{background:rgba(127,29,29,.28);border-color:rgba(248,113,113,.35)}
.tm-body ul.tm-rojo li,.tm-body ul.tm-rojo li *{color:#fecaca!important}
.tm-body ul.tm-rojo mark{color:#fff;background:linear-gradient(transparent 52%,rgba(248,113,113,.5) 52%)}
.tm-body .tm-sub{background:linear-gradient(90deg,var(--primary),var(--violet))}
@media(max-width:600px){.tm-titulo{font-size:1.45rem;margin-top:34px}.tm-body ul.tm-pasos li.tm-paso{grid-template-columns:1fr}}
.tm-fig{margin:22px 0;text-align:center}
.tm-fig img{max-width:min(100%,420px);height:auto;border-radius:14px;border:1px solid var(--border-subtle);box-shadow:0 14px 40px -16px rgba(0,0,0,.7)}
.tm-fig figcaption{font-size:.82rem;color:var(--text-dim);margin-top:10px}
.tm-ar{margin-top:10px;padding-top:10px;border-top:1px dashed rgba(148,163,184,.3)}.tm-ar ul{margin:6px 0 0;padding-left:18px;display:grid;gap:6px}.tm-ar small{display:block;color:var(--text-dim)}
.tm-guias{margin-top:12px;border-radius:14px;border:1px solid rgba(148,163,184,.3);background:rgba(255,255,255,.04);overflow:hidden}.tm-guias>input{position:absolute;opacity:0;pointer-events:none}
.tm-gtabs{display:flex;border-bottom:1px solid rgba(148,163,184,.25)}.tm-gtabs label{flex:1;text-align:center;padding:11px 8px;font-weight:800;font-size:.82rem;color:var(--text-dim);cursor:pointer;border-bottom:3px solid transparent;transition:.2s}.tm-gtabs i{font-style:normal;opacity:.7}
.tm-gtabs label:hover{color:#fff}.tm-r1:checked~.tm-gtabs label:nth-child(1),.tm-r2:checked~.tm-gtabs label:nth-child(2){color:#fff;border-bottom-color:var(--primary);background:rgba(56,189,248,.1)}
.tm-gpa,.tm-gpi{display:none;padding:12px 14px;font-size:.84rem;line-height:1.55;color:#cbd5e1}.tm-r1:checked~.tm-gpa,.tm-r2:checked~.tm-gpi{display:block}
.tm-guias ul{margin:0;padding:0;list-style:none;display:grid;gap:14px}.tm-gt1{font-weight:800;color:#fff}.tm-gt1 a{color:var(--primary-glow)}.tm-guias small{display:block;color:var(--text-dim);margin-top:2px}
.tm-gv{display:inline-block;margin:5px 6px 0 0;padding:2px 9px;border-radius:99px;font-size:.72rem;font-weight:800;background:rgba(148,163,184,.18);color:#e2e8f0}
.tm-guias ul.tm-gd{margin:8px 0 0;padding-left:18px;list-style:disc;gap:4px}.tm-gsin{margin:0;color:var(--text-dim)}.tm-grev{margin:0;padding:8px 14px 10px;font-size:.72rem;color:var(--text-dim);border-top:1px solid rgba(148,163,184,.2)}
.tm-aviso{font-size:.78rem;color:var(--text-dim);margin-top:22px;line-height:1.6}
.tm-buscar{width:100%;padding:14px 16px;border-radius:12px;border:1px solid var(--border-subtle);background:rgba(15,23,42,.8);color:#fff;font:inherit;font-weight:600;margin:6px 0 4px}
.tm-buscar:focus{outline:2px solid var(--violet-glow)}
.tm-area{margin:28px 0 6px;font-size:1.25rem;font-weight:900;color:#fff}
.tm-unidad{font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--violet-glow);margin:18px 0 6px}
"""

def nav_footer():
    src = open(os.path.join(ROOT, 'guia-flashcards-medicina.html'), encoding='utf8').read()
    nav = src[src.index('<!-- NAVBAR -->'):src.index('<header class="legal-hero')]
    foot = src[src.index('<!-- FOOTER INSTITUCIONAL -->'):src.index('<script src="js/guias.js')]
    fix = lambda s: re.sub(r'(href|src|srcset)="(?!https?:|mailto:|#|/)', r'\1="/', s)
    return fix(nav), fix(foot)

def estilo_base():
    src = open(os.path.join(ROOT, 'guia-flashcards-medicina.html'), encoding='utf8').read()
    i = src.index('<style>', src.index('<link rel="icon"'))
    j = src.index('</style>', i) + len('</style>')
    return src[i:j]

def head(titulo, desc, url, img, jsonld, extra_meta=''):
    return f"""<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="NikaMed | Campus Nika">
<meta property="og:locale" content="es_AR">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(titulo)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{img}">
<meta name="theme-color" content="#0284c7">
<link rel="icon" type="image/x-icon" href="/favicon.ico?v=2">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Caveat:wght@700&display=swap" rel="stylesheet">
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
{estilo_base()}
<link rel="stylesheet" href="/css/guias.css?v=2">
<link rel="stylesheet" href="/css/navmovil.css?v=3">
<style>{CSS_EXTRA}</style>
</head>
<body>
<div id="g-progress" aria-hidden="true"></div>
"""

def og_imagen(p, a, unidad):
    out = os.path.join(ROOT, 'assets/og/temas', p['id'] + '.jpg')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    W, H = 1200, 630
    acc = a['acc']
    im = Image.new('RGB', (W, H), (4, 12, 32))
    d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H; d.line([(0, y), (W, y)], fill=(int(4 + 6 * t), int(14 + 10 * t), int(40 + 22 * t)))
    glow = Image.new('RGB', (W, H), (0, 0, 0)); g = ImageDraw.Draw(glow)
    g.ellipse([700, -150, 1350, 450], fill=tuple(int(c * .3) for c in acc)); g.ellipse([-250, 380, 450, 900], fill=(25, 30, 95))
    im = ImageChops.add(im, glow.filter(ImageFilter.GaussianBlur(120)))
    d = ImageDraw.Draw(im)
    for x in range(0, W, 60): d.line([(x, 0), (x, H)], fill=(9, 20, 44))
    for y in range(0, H, 60): d.line([(0, y), (W, y)], fill=(9, 20, 44))
    n = Image.open(os.path.join(ROOT, 'assets/N NIKA.png')).convert('RGBA'); v = Image.open(os.path.join(ROOT, 'assets/TEXTO VECTOR NIKA.png')).convert('RGBA')
    nh, vh = 84, 52
    n = n.resize((int(n.width * nh / n.height), nh), Image.LANCZOS); v = v.resize((int(v.width * vh / v.height), vh), Image.LANCZOS)
    pill = Image.new('RGBA', (n.width + v.width + 64, 108), (255, 255, 255, 235)); m = Image.new('L', pill.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, pill.width, pill.height], 54, fill=255)
    im = im.convert('RGBA'); im.paste(pill, (64, 56), m); im.paste(n, (92, 56 + (108 - nh) // 2), n); im.paste(v, (92 + n.width + 18, 56 + (108 - vh) // 2), v)
    d = ImageDraw.Draw(im)
    f_chip = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 28)
    d.text((64, 214), a['nombre'].upper(), font=f_chip, fill=tuple(min(255, c + 70) for c in acc))
    d.rounded_rectangle([64, 256, 184, 266], 5, fill=acc + (255,))
    size = 78
    ft = ImageFont.truetype('C:/Windows/Fonts/bahnschrift.ttf', size)
    def wrap(text, font, maxw):
        words, lines, cur = text.split(), [], ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if d.textlength(t, font=font) <= maxw: cur = t
            else: lines.append(cur); cur = w
        if cur: lines.append(cur)
        return lines
    lines = wrap(p['titulo'], ft, 1070)
    while len(lines) > 3 and size > 52:
        size -= 6; ft = ImageFont.truetype('C:/Windows/Fonts/bahnschrift.ttf', size); lines = wrap(p['titulo'], ft, 1070)
    y = 290
    for ln in lines[:3]:
        d.text((64, y), ln, font=ft, fill=(255, 255, 255)); y += size + 10
    fs = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 30)
    d.text((66, y + 8), corto('Flashcard clínica · ' + re.sub(r'^UP\d+ . ', '', unidad), 70), font=fs, fill=(186, 214, 255))
    d.text((64, H - 56), 'nikamed.com.ar', font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26), fill=tuple(min(255, c + 70) for c in acc))
    im.convert('RGB').save(out, quality=84, optimize=True, progressive=True)

def _ref_li(r):
    t = ('<a href="%s" target="_blank" rel="noopener">%s</a>' % (e(r['u']), e(r['t']))) if r.get('u') else e(r['t'])
    d = ('<ul class="tm-gd">' + ''.join('<li>%s</li>' % e(x) for x in r['d']) + '</ul>') if r.get('d') else ''
    return '<li><div class="tm-gt1">%s</div><small>%s</small>%s%s%s</li>' % (t, e(r['c']), ('<span class="tm-gv">%s</span>' % e(r['v'])) if r.get('v') else '', ('<span class="tm-gv">%s</span>' % e(r['n'])) if r.get('n') else '', d)

def guias_tabs(pid, ar_l, int_l, nota_ar, nota_int):
    vac_ar = e(nota_ar or 'No se localizó una guía argentina específica vigente para este tema: se cita la fuente de la ficha.')
    vac_int = e(nota_int or 'No se revisó una guía internacional más reciente para este tema; la referencia vigente es la fuente citada en la ficha.')
    ini_int = (not ar_l) and bool(int_l)
    return ('<div class="tm-guias"><input type="radio" class="tm-r1" name="g-%s" id="ga-%s"%s aria-label="Guía argentina"><input type="radio" class="tm-r2" name="g-%s" id="gi-%s"%s aria-label="Guías internacionales">' % (pid, pid, '' if ini_int else ' checked', pid, pid, ' checked' if ini_int else '') +
            '<div class="tm-gtabs"><label for="ga-%s">🇦🇷 Guía argentina%s</label><label for="gi-%s">🌐 Guías internacionales%s</label></div>' % (pid, (' <i>%d</i>' % len(ar_l)) if ar_l else '', pid, (' <i>%d</i>' % len(int_l)) if int_l else '') +
            '<div class="tm-gpa">%s</div><div class="tm-gpi">%s</div>' % (('<ul>' + ''.join(_ref_li(r) for r in ar_l) + '</ul>') if ar_l else '<p class="tm-gsin">%s</p>' % vac_ar, ('<ul>' + ''.join(_ref_li(r) for r in int_l) + '</ul>') if int_l else '<p class="tm-gsin">%s</p>' % vac_int) +
            '<p class="tm-grev">Fuentes revisadas el 16/10/2026. Resumen de lo verificado: no reemplaza la lectura del documento.</p></div>')

def main():
    pats, unidades = cargar()
    nav, foot = nav_footer()
    os.makedirs(os.path.join(ROOT, 'temas'), exist_ok=True)
    por_up = {}
    for p in pats:
        for u in p.get('up', []): por_up.setdefault(u, []).append(p)
    urls = []
    for p in pats:
        a = AREAS[p['area']]
        up0 = (p.get('up') or [''])[0]
        unidad = unidades.get(up0, p.get('unidad', ''))
        f = p.get('fuente') or {}
        url = f"{SITE}/temas/{p['id']}.html"
        img = f"{SITE}/assets/og/temas/{p['id']}.jpg"
        og_imagen(p, a, unidad)
        titulo = f"{p['titulo']}: diagnóstico y tratamiento (resumen) | NikaMed"
        lead = primera_oracion(p.get('definicion', ''))
        desc = corto(f"{p['titulo']}: {lead} Resumen clínico para estudiantes de Medicina con tratamiento y banderas rojas. Practicalo gratis en NikaMed.", 300)
        desc_meta = corto(f"{p['titulo']}: resumen clínico para estudiantes de Medicina con diagnóstico, tratamiento y banderas rojas según {f.get('sociedad','la bibliografía de la cátedra')}. Gratis en NikaMed.", 158)
        # ---- cuerpo
        partes = []
        n = 0
        IDX = []
        dx = ''
        if p.get('definicion'): dx += '<p class="tm-def">' + fmt(p['definicion']) + '</p>'
        crit = p['area'] == 'criterios'
        if p.get('diagnostico'): dx += '<h3 class="tm-sub">' + ('Criterios' if crit else 'Cómo se diagnostica') + '</h3>' + lista(p['diagnostico'])
        if dx: n += 1; partes.append(seccion(n, 'Qué es y criterios' if crit else 'Definición y diagnóstico', dx, 'diagnostico')); IDX.append(('diagnostico', 'Diagnóstico'))
        if p.get('estudios'): n += 1; partes.append(seccion(n, 'Cómo se usa' if crit else 'Estudios complementarios', lista(p['estudios']), 'estudios')); IDX.append(('estudios', 'Cómo se usa' if crit else 'Estudios'))
        if p.get('banderas'): n += 1; partes.append(seccion(n, 'Tené en cuenta' if crit else 'Banderas rojas', lista(p['banderas'], 'tm-rojo'), 'banderas')); IDX.append(('banderas', 'Tené en cuenta' if crit else 'Banderas rojas'))
        if p.get('tratamiento'):
            tx = ''
            for b in p['tratamiento']:
                tx += f'<h3 class="tm-sub">{e(b["titulo"])}</h3><ul class="tm-pasos">' + ''.join(f'<li class="tm-paso"><b>{e(s["etiqueta"])}</b><span>{fmt(s["texto"])}</span></li>' for s in b.get('pasos', [])) + '</ul>'
            n += 1; partes.append(seccion(n, 'Interpretación y conducta' if crit else 'Tratamiento', tx, 'tratamiento')); IDX.append(('tratamiento', 'Interpretación' if crit else 'Tratamiento'))
        if p.get('seguimiento'): n += 1; partes.append(seccion(n, 'Seguimiento', lista(p['seguimiento']), 'seguimiento')); IDX.append(('seguimiento', 'Seguimiento'))
        tipo = f.get('tipo', 'guia')
        etiqueta = 'Basada en guía' if tipo == 'guia' else 'Fuente validada de la cátedra'
        enlace = f.get('archivo', '')
        enlace_html = f' · <a href="{e(enlace)}" target="_blank" rel="noopener">Ver la fuente</a>' if enlace.startswith('http') else ''
        fuente = f'<div class="tm-fuente"><b>{etiqueta}:</b> {e(f.get("guia",""))} — {e(f.get("sociedad",""))} ({e(str(f.get("anio","")))}){enlace_html}.</div>'
        ar_l, int_l, nota_ar, nota_int = FA.guias_ficha(p['id'], p.get('calculadora'))
        for r in f.get('argentinas', []):
            if not any(x['t'] == r['t'] for x in ar_l): ar_l.append(r)
        if ar_l or int_l:
            fuente = fuente[:-6] + guias_tabs(p['id'], ar_l, int_l, nota_ar, nota_int) + '</div>'
        # imagen real de la tarjeta (generada con el propio Simulador FlashCard)
        figura = ''
        small = os.path.join(ROOT, 'assets/temas', p['id'] + '-480.webp')
        if os.path.exists(small):
            from PIL import Image as _I
            w, h = _I.open(small).size
            figura = (f'<figure class="tm-fig g-rv"><a href="/assets/temas/{p["id"]}.webp" target="_blank" rel="noopener">'
                      f'<img src="/assets/temas/{p["id"]}-480.webp" width="{w}" height="{h}" loading="lazy" '
                      f'alt="Flashcard de {e(p["titulo"])} de NikaMed: diagnóstico, estudios, banderas rojas y tratamiento"></a>'
                      f'<figcaption>Así se ve la flashcard de <strong>{e(p["titulo"])}</strong> en NikaMed. Tocá la imagen para verla en grande y guardala para repasar.</figcaption></figure>')
        calc_html = ('<div class="tm-cta g-rv"><h2>Calculá esta escala</h2><p>Ingresá los datos del paciente y obtené el puntaje con su interpretación.</p><div class="row"><a class="btn-primary" href="/calculadoras.html#%s">🧮 Abrir la calculadora</a></div></div>' % p['calculadora']) if p.get('calculadora') else ''
        # relacionadas
        rel = []
        for u in p.get('up', []):
            for q in por_up.get(u, []):
                if q['id'] != p['id'] and q not in rel: rel.append(q)
        rel = rel[:6]
        rel_html = ''
        if rel:
            rel_html = '<div class="legal-card g-sec g-rv" id="relacionados"><h2>Temas relacionados</h2><div class="tm-rel">' + ''.join(
                f'<a href="/temas/{q["id"]}.html">{e(q["titulo"])}<small>{e(unidades.get((q.get("up") or [""])[0], ""))}</small></a>' for q in rel) + '</div></div>'
        faq = [{"@type": "Question", "name": f"¿Cuál es el tratamiento de {p['titulo']}?", "acceptedAnswer": {"@type": "Answer", "text": corto(plano_tx(p), 900)}}] if p.get('tratamiento') else []
        if p.get('banderas'):
            faq.append({"@type": "Question", "name": f"¿Cuáles son las banderas rojas de {p['titulo']}?", "acceptedAnswer": {"@type": "Answer", "text": corto(' '.join(p['banderas']), 700)}})
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "NikaMed", "item": SITE + "/"},
                {"@type": "ListItem", "position": 2, "name": "Temas clínicos", "item": SITE + "/temas-clinicos.html"},
                {"@type": "ListItem", "position": 3, "name": p['titulo'], "item": url}]},
            {"@type": "Article", "headline": corto(p['titulo'] + ': diagnóstico y tratamiento', 110), "description": desc_meta, "inLanguage": "es-AR",
             "image": img, "url": url, "mainEntityOfPage": url, "dateModified": FECHA, "datePublished": FECHA,
             "author": {"@type": "Organization", "name": "NikaMed", "url": SITE + "/"},
             "publisher": {"@type": "Organization", "name": "NikaMed | Campus Nika", "url": SITE + "/", "logo": {"@type": "ImageObject", "url": SITE + "/assets/N%20NIKA.png"}},
             "isAccessibleForFree": True, "educationalLevel": "Estudiantes de Medicina", "about": p['titulo'],
             "citation": f"{f.get('sociedad','')} {f.get('anio','')}: {f.get('guia','')}".strip()},
        ] + ([{"@type": "FAQPage", "mainEntity": faq}] if faq else [])}
        body = head(titulo, desc_meta, url, img, ld) + nav + f"""
    <header class="legal-hero art-hero g-hero">
        <span class="g-orb a"></span><span class="g-orb b"></span>
        <div class="g-hero-ico">{a['ico']}</div>
        <span class="legal-eyebrow">{e(a['nombre'])}</span>
        <h1>{e(p['titulo'])}</h1>
        <p class="legal-meta">{e(unidad)} · Actualizado el 16 de octubre de 2026</p>
        <div class="g-chips"><span class="g-chip">Gratis</span><span class="g-chip">{etiqueta}</span><span class="g-chip">Resumen clínico</span></div>
    </header>

    <main>
        <a class="back-link" href="/temas-clinicos.html">← Todos los temas clínicos</a>
        <div class="glass-box summary g-rv"><p><strong>{e(p['titulo'])}</strong> en NikaMed: {e(lead)} Esta ficha forma parte de las flashcards clínicas gratuitas de <strong>NikaMed · Campus Nika</strong> para estudiantes de Medicina de Argentina, con diagnóstico, estudios, banderas rojas, tratamiento y seguimiento.</p></div>
        {fuente}
        <nav class="tm-ir" aria-label="Ir a una sección">{''.join(f'<a href="#{i}">{SEC_ICO[i][0]} {t}</a>' for i, t in IDX)}</nav>
        <article class="tm-hoja" style="--paper:{PAPEL.get(up0, '#fff3a3')}"><span class="tm-pin"></span>
            <div class="tm-marca" aria-hidden="true"><img src="/assets/n-nika-96.webp" alt="" width="46" height="46"><img class="v" src="/assets/TEXTO%20VECTOR%20NIKA.png" alt="" width="84" height="34"></div>
            <h2 class="tm-titulo">{e(p['titulo'])}</h2><div class="tm-uni">{e(unidad)} · Flashcard NikaMed</div>
            {''.join(partes)}
        </article>
        {figura}
        {calc_html}
        <div class="tm-cta g-rv"><h2>Practicá esta ficha en NikaMed</h2><p>Escribí tu respuesta, verificá si es correcta y repasá sin conexión. El Simulador FlashCard de NikaMed es gratis para todos los estudiantes.</p>
            <div class="row"><a class="btn-primary" href="/index.html#crear-cuenta">Crear cuenta gratis</a><a class="btn-ghost" href="/guia-flashcards-medicina.html">Cómo funciona el Simulador FlashCard</a></div></div>
        {rel_html}
        <p class="tm-aviso">Material educativo para estudiantes de medicina, elaborado a partir de {e(f.get('sociedad','la bibliografía de la cátedra'))} ({e(str(f.get('anio','')))}). No reemplaza la guía vigente completa, el protocolo de la institución ni el juicio del médico tratante.</p>
    </main>

    {foot}
<script src="/js/guias.js?v=2" defer></script>
<script src="/js/navmovil.js?v=1" defer></script>
</body></html>
"""
        open(os.path.join(ROOT, 'temas', p['id'] + '.html'), 'w', encoding='utf8').write(body)
        card = f"{SITE}/assets/temas/{p['id']}.webp" if os.path.exists(small) else ''
        urls.append((url, img, p['titulo'], desc_meta, card))

    # ---- índice
    ind = ''
    for ak, a in AREAS.items():
        ps = [p for p in pats if p['area'] == ak]
        ind += f'<h2 class="tm-area">{a["ico"]} {e(a["nombre"])} <small style="color:var(--text-dim);font-weight:700">· {len(ps)} temas</small></h2>'
        ups = [u for u in unidades if any(u in p.get('up', []) for p in ps)]
        for u in ups:
            lst = [p for p in ps if u in p.get('up', [])]
            if not lst: continue
            ind += f'<div class="tm-unidad" data-u>{e(unidades[u])}</div><div class="tm-rel">' + ''.join(
                f'<a href="/temas/{p["id"]}.html" data-t="{e((p["titulo"] + " " + " ".join(p.get("alias", []) if isinstance(p.get("alias"), list) else [])).lower())}">{e(p["titulo"])}<small>{e((p.get("fuente") or {}).get("sociedad",""))}</small></a>' for p in lst) + '</div>'
    t_idx = 'Temas clínicos de Medicina: diagnóstico y tratamiento en resumen | NikaMed'
    d_idx = f'{len(pats)} temas clínicos de Ginecología, Obstetricia y Cirugía con diagnóstico, tratamiento y banderas rojas, basados en guías y consensos argentinos. Gratis en NikaMed.'
    ld_idx = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": "Temas clínicos de Medicina", "url": SITE + "/temas-clinicos.html", "description": d_idx, "inLanguage": "es-AR",
         "isPartOf": {"@type": "WebSite", "name": "NikaMed | Campus Nika", "url": SITE + "/"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "NikaMed", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Temas clínicos", "item": SITE + "/temas-clinicos.html"}]}]}
    body = head(t_idx, d_idx, SITE + '/temas-clinicos.html', SITE + '/assets/og/nikamed-og-1200x630.jpg', ld_idx) + nav + f"""
    <header class="legal-hero art-hero g-hero">
        <span class="g-orb a"></span><span class="g-orb b"></span>
        <div class="g-hero-ico">🃏</div>
        <span class="legal-eyebrow">Biblioteca gratuita</span>
        <h1>Temas clínicos de Medicina</h1>
        <p class="legal-meta">{len(pats)} fichas con diagnóstico, tratamiento y banderas rojas · Actualizado el 16 de octubre de 2026</p>
        <div class="g-chips"><span class="g-chip">Ginecología y Obstetricia</span><span class="g-chip">Cirugía</span><span class="g-chip">Basado en guías</span></div>
    </header>
    <main>
        <div class="glass-box summary g-rv"><p>Biblioteca de <strong>flashcards clínicas de NikaMed</strong>: cada tema resume la definición, el diagnóstico, los estudios, las banderas rojas, el tratamiento y el seguimiento según guías y consensos de sociedades científicas y la bibliografía de la cátedra. Podés practicarlas gratis dentro del Simulador FlashCard.</p></div>
        <input class="tm-buscar" id="tm-q" type="search" placeholder="Buscar un tema: apendicitis, preeclampsia, fractura de cadera…" aria-label="Buscar tema">
        <div id="tm-lista">{ind}</div>
        <div class="tm-cta g-rv"><h2>Practicá estos temas en NikaMed</h2><p>Escribí tu respuesta, verificá si es correcta y repasá sin conexión.</p><div class="row"><a class="btn-primary" href="/index.html#crear-cuenta">Crear cuenta gratis</a><a class="btn-ghost" href="/guia-flashcards-medicina.html">Cómo funciona</a></div></div>
        <p class="tm-aviso">Material educativo para estudiantes de medicina. No reemplaza la guía vigente completa, el protocolo de la institución ni el juicio del médico tratante.</p>
    </main>
    {foot}
<script src="/js/guias.js?v=2" defer></script>
<script src="/js/navmovil.js?v=1" defer></script>
<script>
(function(){{var q=document.getElementById('tm-q');if(!q)return;q.addEventListener('input',function(){{var s=q.value.trim().toLowerCase();
document.querySelectorAll('#tm-lista a[data-t]').forEach(function(a){{a.style.display=(!s||a.dataset.t.indexOf(s)>-1)?'':'none';}});
document.querySelectorAll('#tm-lista .tm-unidad').forEach(function(u){{var g=u.nextElementSibling;var v=g&&g.querySelector('a:not([style*="none"])');u.style.display=v?'':'none';if(g)g.style.display=v?'':'none';}});}});}})();
</script>
</body></html>
"""
    open(os.path.join(ROOT, 'temas-clinicos.html'), 'w', encoding='utf8').write(body)

    # ---- sitemap
    sp = os.path.join(ROOT, 'sitemap.xml')
    sm = open(sp, encoding='utf8').read()
    sm = re.sub(r'\s*<url>\s*<loc>https://nikamed\.com\.ar/(temas/[^<]*|temas-clinicos\.html)</loc>.*?</url>', '', sm, flags=re.S)
    add = '  <url>\n    <loc>%s/temas-clinicos.html</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n' % (SITE, FECHA)
    for url, img, t, d, card in urls:
        add += ('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n'
                '    <image:image>\n      <image:loc>%s</image:loc>\n      <image:title>%s</image:title>\n      <image:caption>%s</image:caption>\n    </image:image>\n%s  </url>\n') % (url, FECHA, img, e(t), e(d),
                ('    <image:image>\n      <image:loc>%s</image:loc>\n      <image:title>Flashcard de %s | NikaMed</image:title>\n      <image:caption>Tarjeta clínica de %s con diagnóstico, estudios, banderas rojas y tratamiento.</image:caption>\n    </image:image>\n' % (card, e(t), e(t))) if card else '')
    sm = sm.replace('</urlset>', add + '</urlset>')
    open(sp, 'w', encoding='utf8').write(sm)
    print(len(urls), 'temas + índice')

if __name__ == '__main__':
    main()
