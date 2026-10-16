#!/usr/bin/env python3
"""Genera las páginas públicas por tema (temas/<id>.html), el índice temas-clinicos.html,
las imágenes OG por tema y las entradas del sitemap, a partir de los JSON de flashcards.
Uso: python tools/gen_temas.py   (desde la raíz del repo)"""
import json, os, re, html
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://nikamed.com.ar'
FECHA = '2026-10-16'
AREAS = {
    'ginecologia': dict(nombre='Ginecología y Obstetricia', ico='🌸', acc=(236, 72, 153), guia='Salud Integral de la Mujer'),
    'cirugia': dict(nombre='Cirugía', ico='🔪', acc=(14, 165, 233), guia='Introducción a las Especialidades Clínico-Quirúrgicas'),
}
e = html.escape

def cargar():
    out, unidades = [], {}
    for f in ('data/nikafarma_patologias.json', 'data/flashcards_cirugia.json'):
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

def lista(items, cls=''):
    return '<ul%s>' % (' class="%s"' % cls if cls else '') + ''.join('<li>%s</li>' % e(x) for x in items) + '</ul>'

def seccion(n, titulo, cuerpo, ident):
    return f'<div class="legal-card g-sec g-rv" id="{ident}"><h2><span class="num">{n}</span>{titulo}</h2>{cuerpo}</div>'

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
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
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
        dx = ''
        if p.get('definicion'): dx += f"<p>{e(p['definicion'])}</p>"
        if p.get('diagnostico'): dx += '<h3 class="tm-sub">Cómo se diagnostica</h3>' + lista(p['diagnostico'])
        if dx: n += 1; partes.append(seccion(n, 'Definición y diagnóstico', dx, 'diagnostico'))
        if p.get('estudios'): n += 1; partes.append(seccion(n, 'Estudios complementarios', lista(p['estudios']), 'estudios'))
        if p.get('banderas'): n += 1; partes.append(seccion(n, 'Banderas rojas', lista(p['banderas'], 'tm-rojo'), 'banderas'))
        if p.get('tratamiento'):
            tx = ''
            for b in p['tratamiento']:
                tx += f'<h3 class="tm-sub">{e(b["titulo"])}</h3><ul>' + ''.join(f'<li><strong>{e(s["etiqueta"])}:</strong> {e(s["texto"])}</li>' for s in b.get('pasos', [])) + '</ul>'
            n += 1; partes.append(seccion(n, 'Tratamiento', tx, 'tratamiento'))
        if p.get('seguimiento'): n += 1; partes.append(seccion(n, 'Seguimiento', lista(p['seguimiento']), 'seguimiento'))
        tipo = f.get('tipo', 'guia')
        etiqueta = 'Basada en guía' if tipo == 'guia' else 'Fuente validada de la cátedra'
        enlace = f.get('archivo', '')
        enlace_html = f' · <a href="{e(enlace)}" target="_blank" rel="noopener">Ver la fuente</a>' if enlace.startswith('http') else ''
        fuente = f'<div class="tm-fuente"><b>{etiqueta}:</b> {e(f.get("guia",""))} — {e(f.get("sociedad",""))} ({e(str(f.get("anio","")))}){enlace_html}.</div>'
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
        {''.join(partes)}
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
        urls.append((url, img, p['titulo'], desc_meta))

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
    body = head(t_idx, d_idx, SITE + '/temas-clinicos.html', SITE + '/assets/og/nikamed-og-1200x630.png', ld_idx) + nav + f"""
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
    for url, img, t, d in urls:
        add += ('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n'
                '    <image:image>\n      <image:loc>%s</image:loc>\n      <image:title>%s</image:title>\n      <image:caption>%s</image:caption>\n    </image:image>\n  </url>\n') % (url, FECHA, img, e(t), e(d))
    sm = sm.replace('</urlset>', add + '</urlset>')
    open(sp, 'w', encoding='utf8').write(sm)
    print(len(urls), 'temas + índice')

if __name__ == '__main__':
    main()
