#!/usr/bin/env python3
"""Genera calculadoras.html (página pública, indexable y utilizable sin conexión) a partir de js/calc/*.
Uso: python tools/gen_calculadoras.py  (desde la raíz del repo; requiere node)"""
import json, os, re, subprocess, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_temas as G

ROOT = G.ROOT; SITE = G.SITE; e = html.escape

def listar():
    js = r"""
global.window=global; global.location={hash:''}; global.document={};
require('./js/calc/motor.js'); ['obstetricia','cirugia','clinica','general'].forEach(f=>require('./js/calc/datos-'+f+'.js'));
console.log(JSON.stringify(window.NikaCalcs.REG.map(c=>({id:c.id,nombre:c.nombre,desc:c.desc,area:c.area}))));
"""
    out = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True, encoding='utf8')
    return json.loads(out.stdout)

def main():
    calcs = listar()
    n = len(calcs)
    titulo = 'Calculadoras médicas y escalas clínicas en español | NikaMed'
    desc = f'{n} calculadoras y escalas clínicas gratis: edad gestacional y FPP, Ranson, Wells, CHA₂DS₂-VASc, CURB-65, NEWS2, MELD, CKD-EPI y más, con su fundamento. Funcionan sin conexión.'
    url = SITE + '/calculadoras.html'
    fake = {'id': 'calculadoras', 'titulo': 'Calculadoras médicas y escalas clínicas'}
    G.og_imagen(fake, dict(G.AREAS['cirugia'], nombre='Herramientas clínicas'), 'Fundamentadas y gratis')
    img = SITE + '/assets/og/temas/calculadoras.jpg'
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": "Calculadoras médicas y escalas clínicas", "url": url, "description": desc, "inLanguage": "es-AR", "isPartOf": {"@type": "WebSite", "name": "NikaMed | Campus Nika", "url": SITE + "/"}},
        {"@type": "ItemList", "numberOfItems": n, "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": c['nombre'], "url": f"{url}#{c['id']}"} for i, c in enumerate(calcs)]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "NikaMed", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": "Calculadoras clínicas", "item": url}]}]}
    nav, foot = G.nav_footer()
    head = G.head(titulo, desc, url, img, ld).replace('</head>', '<link rel="stylesheet" href="/css/calculadoras.css?v=1">\n</head>', 1)
    body = head + nav + f"""
    <header class="legal-hero art-hero g-hero">
        <span class="g-orb a"></span><span class="g-orb b"></span>
        <div class="g-hero-ico">🧮</div>
        <span class="legal-eyebrow">Herramientas clínicas gratuitas</span>
        <h1>Calculadoras médicas y escalas clínicas</h1>
        <p class="legal-meta">{n} calculadoras con su fundamento · Actualizado el 16 de octubre de 2026</p>
        <div class="g-chips"><span class="g-chip">Con fuente citada</span><span class="g-chip">Sin conexión</span><span class="g-chip">Gratis</span></div>
    </header>
    <main style="max-width:940px">
        <div class="cc-aviso"><strong>Herramienta de apoyo para estudio y práctica.</strong> Cada calculadora cita su fundamento (publicación original y guías de sociedades científicas). No reemplaza el juicio clínico, las guías vigentes ni el protocolo de tu institución. Los porcentajes de riesgo son aproximados.</div>
        <div id="calc-app"><noscript>Activá JavaScript para usar las calculadoras.</noscript></div>
        <div class="tm-cta g-rv" style="margin-top:30px"><h2>Estudiá estas escalas con flashcards</h2><p>En NikaMed encontrás las escalas y criterios más usados como flashcards clínicas, con corrección y práctica sin conexión.</p>
            <div class="row"><a class="btn-primary" href="/index.html#crear-cuenta">Crear cuenta gratis</a><a class="btn-ghost" href="/temas-clinicos.html">Ver temas clínicos</a></div></div>
    </main>
    {foot}
<script src="/js/calc/motor.js?v=1"></script>
<script src="/js/calc/datos-obstetricia.js?v=1"></script>
<script src="/js/calc/datos-cirugia.js?v=1"></script>
<script src="/js/calc/datos-clinica.js?v=1"></script>
<script src="/js/calc/datos-general.js?v=1"></script>
<script>NikaCalcs.montar(document.getElementById('calc-app'));</script>
<script src="/js/guias.js?v=2" defer></script>
<script src="/js/navmovil.js?v=1" defer></script>
</body></html>
"""
    open(os.path.join(ROOT, 'calculadoras.html'), 'w', encoding='utf8').write(body)
    # sitemap
    sp = os.path.join(ROOT, 'sitemap.xml'); sm = open(sp, encoding='utf8').read()
    sm = re.sub(r'\s*<url>\s*<loc>' + re.escape(url) + r'</loc>.*?</url>', '', sm, flags=re.S)
    add = ('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n'
           '    <image:image>\n      <image:loc>%s</image:loc>\n      <image:title>Calculadoras médicas y escalas clínicas | NikaMed</image:title>\n      <image:caption>%s</image:caption>\n    </image:image>\n  </url>\n') % (url, G.FECHA, img, e(desc))
    sm = sm.replace('</urlset>', add + '</urlset>')
    open(sp, 'w', encoding='utf8').write(sm)
    print(n, 'calculadoras')

if __name__ == '__main__':
    main()
