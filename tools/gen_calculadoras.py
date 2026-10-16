#!/usr/bin/env python3
"""Genera calculadoras.html (página pública, indexable y utilizable sin conexión) a partir de js/calc/*.
Uso: python tools/gen_calculadoras.py  (desde la raíz del repo; requiere node)"""
import json, os, re, subprocess, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_temas as G

ROOT = G.ROOT; SITE = G.SITE; e = html.escape

FAQ = [
    ('¿Qué calculadoras y escalas clínicas hay en NikaMed?', 'Hay {n} herramientas agrupadas por materia: obstetricia y ginecología, cirugía y trauma, emergencias y terapia, clínica médica, pediatría y herramientas generales. Podés buscarlas por nombre o filtrarlas por área.'),
    ('¿De dónde salen las fórmulas y los puntos de corte?', 'Cada calculadora muestra su fundamento: la publicación original de la escala y, cuando se localizó, una guía o consenso argentino (Ministerio de Salud y sociedades científicas). Si no se encontró una guía argentina específica vigente, se aclara.'),
    ('¿Puedo usarlas dentro de NikaFarma y de la sala de estudio?', 'Sí. En NikaFarma se abren desde el botón «Scores y calculadoras» y en la sala de estudio desde el ícono 🧮, sin salir de lo que estás haciendo.'),
    ('¿Funcionan sin conexión?', 'Sí. Los cálculos se hacen en tu dispositivo y los datos del paciente no se envían ni se guardan. Con el Modo Guardia podés descargarlas para usarlas sin internet.'),
    ('¿Reemplazan el criterio clínico?', 'No. Son una herramienta de apoyo para estudio y práctica: los porcentajes de riesgo son aproximados y siempre hay que verificar con las guías vigentes y el protocolo de la institución.'),
]
CSS_EXTRA = '''<style>
.mg-sec{margin:26px 0}.mg-sec h2{font-size:1.15rem;font-weight:900;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:10px}
.mg-sec h2::before{content:'';width:4px;height:18px;background:linear-gradient(180deg,#0ea5e9,#a855f7);border-radius:4px}
.mg-q{border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(15,23,42,.7);margin:8px 0;overflow:hidden}
.mg-q summary{cursor:pointer;padding:14px 16px;font-weight:800;color:#fff;list-style:none;display:flex;justify-content:space-between;gap:12px}
.mg-q summary::-webkit-details-marker{display:none}.mg-q summary::after{content:'+';color:#c084fc;font-size:1.3rem;line-height:1}
.mg-q[open] summary::after{content:'−'}.mg-q p{padding:0 16px 14px;color:#cbd5e1;font-size:.92rem;margin:0}
.mg-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.mg-links a{display:block;padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(15,23,42,.7);color:#e2e8f0;font-weight:800;font-size:.86rem;text-decoration:none;transition:.2s}
.mg-links a:hover{border-color:#c084fc;transform:translateY(-2px)}.mg-links small{display:block;color:#94a3b8;font-weight:600;margin-top:2px}
.cc-pasos{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:0;padding:0;list-style:none;counter-reset:p}
.cc-pasos li{counter-increment:p;padding:14px 16px 14px 54px;position:relative;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(15,23,42,.7);color:#cbd5e1;font-size:.9rem;line-height:1.5}
.cc-pasos li::before{content:counter(p);position:absolute;left:14px;top:14px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#fff;background:linear-gradient(135deg,#0ea5e9,#a855f7)}
.cc-pasos b{display:block;color:#fff}
.cc-herr{scroll-margin-top:90px}
</style>'''

def listar():
    js = r"""
global.window=global; global.location={hash:''}; global.document={};
require('./js/calc/motor.js'); ['obstetricia','cirugia','clinica','general','extra'].forEach(f=>require('./js/calc/datos-'+f+'.js'));
console.log(JSON.stringify(window.NikaCalcs.REG.map(c=>({id:c.id,nombre:c.nombre,desc:c.desc,area:c.area}))));
"""
    out = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True, encoding='utf8')
    return json.loads(out.stdout)

def main():
    calcs = listar()
    n = len(calcs)
    titulo = 'Calculadoras médicas y escalas clínicas en español | NikaMed'
    FAQ[:] = [(q, a.replace('{n}', str(n))) for q, a in FAQ]
    desc = f'{n} calculadoras y escalas clínicas gratis: edad gestacional y FPP, Ranson, Wells, CHA₂DS₂-VASc, CURB-65, NEWS2, MELD, CKD-EPI y más, con su fundamento. Funcionan sin conexión.'
    url = SITE + '/calculadoras.html'
    fake = {'id': 'calculadoras', 'titulo': 'Calculadoras médicas y escalas clínicas'}
    G.og_imagen(fake, dict(G.AREAS['cirugia'], nombre='Herramientas clínicas'), 'Fundamentadas y gratis')
    img = SITE + '/assets/og/temas/calculadoras.jpg'
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": "Calculadoras médicas y escalas clínicas", "url": url, "description": desc, "inLanguage": "es-AR", "isPartOf": {"@type": "WebSite", "name": "NikaMed | Campus Nika", "url": SITE + "/"}},
        {"@type": "ItemList", "numberOfItems": n, "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": c['nombre'], "url": f"{url}#{c['id']}"} for i, c in enumerate(calcs)]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "NikaMed", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": "Calculadoras clínicas", "item": url}]}]}
    faq_html = ''.join(f'<details class="mg-q"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in FAQ)
    nav, foot = G.nav_footer()
    head = G.head(titulo, desc, url, img, ld).replace('</head>', '<link rel="stylesheet" href="/css/calculadoras.css?v=5">\n' + CSS_EXTRA + '\n</head>', 1)
    body = head + nav + f"""
    <header class="legal-hero art-hero g-hero">
        <span class="g-orb a"></span><span class="g-orb b"></span>
        <div class="g-hero-ico">🧮</div>
        <span class="legal-eyebrow">Herramientas clínicas gratuitas</span>
        <h1>Calculadoras médicas y escalas clínicas</h1>
        <p class="legal-meta">{n} calculadoras con su fundamento · Actualizado el 16 de octubre de 2026</p>
        <div class="g-chips"><span class="g-chip">Con fuente citada</span><span class="g-chip">Sin conexión</span><span class="g-chip">Gratis</span></div>
    </header>
    <main style="max-width:980px">    <main style="max-width:980px">
        <div class="glass-box summary g-rv"><p><strong>Calculadoras médicas y escalas clínicas de NikaMed:</strong> {n} herramientas con su fundamento citado, pensadas para estudiar y para la guardia. Buscalas por nombre, filtrá por materia y marcá tus favoritas con la estrella. Los cálculos se hacen en tu dispositivo.</p></div>
        <div class="legal-card g-sec g-rv"><h2>Cómo usarlas</h2>
            <ol class="cc-pasos"><li><b>Buscá o filtrá</b>Escribí el nombre (Wells, FPP, CURB-65…) o elegí una materia.</li><li><b>Completá los datos</b>Tocá la calculadora y cargá los valores del paciente.</li><li><b>Leé el resultado</b>Verás el puntaje, la interpretación y el detalle de cada ítem.</li><li><b>Revisá el fundamento</b>Cada una cita su fuente y, si existe, la guía argentina.</li></ol></div>
        <div class="cc-aviso"><strong>Herramienta de apoyo para estudio y práctica.</strong> No reemplaza el juicio clínico, las guías vigentes ni el protocolo de tu institución. Los porcentajes de riesgo son aproximados.</div>
        <div id="calc-app" class="cc-herr"><noscript>Activá JavaScript para usar las calculadoras.</noscript></div>
        <div class="mg-sec" id="preguntas-frecuentes"><h2>Preguntas frecuentes</h2>{faq_html}</div>
        <div class="mg-sec"><h2>Seguí estudiando</h2><div class="mg-links"><a href="/temas-clinicos.html">Temas clínicos<small>213 fichas con diagnóstico y tratamiento</small></a><a href="/guia-flashcards-medicina.html">Flashcards de medicina<small>Cómo repasar con recuperación activa</small></a><a href="/guia-plan-de-estudio-finales-medicina.html">Plan de estudio para finales<small>Organizá tus semanas</small></a><a href="/guia-urgencias-obstetricas.html">Urgencias obstétricas<small>Guía de guardia</small></a></div></div>
        <div class="tm-cta g-rv" style="margin-top:30px"><h2>Usalas dentro del campus</h2><p>En NikaMed las calculadoras están también en NikaFarma y en la sala de estudio, junto al vademécum, las flashcards y los simuladores.</p>
            <div class="row"><a class="btn-primary" href="/index.html#crear-cuenta">Crear cuenta gratis</a><a class="btn-ghost" href="/temas-clinicos.html">Ver temas clínicos</a></div></div>
    </main>
    {foot}
<script src="/js/calc/motor.js?v=4"></script>
<script src="/js/calc/datos-obstetricia.js?v=4"></script>
<script src="/js/calc/datos-cirugia.js?v=4"></script>
<script src="/js/calc/datos-clinica.js?v=4"></script>
<script src="/js/calc/datos-general.js?v=4"></script>
<script src="/js/calc/datos-extra.js?v=4"></script>
<script src="/js/calc/fuentes-ar.js?v=4"></script>
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
