#!/usr/bin/env python3
"""Genera data/guardia_listas.json: listas de archivos (sin query) que el Modo Guardia descarga para
temas clínicos, guías, calculadoras, mis notas y plan de estudio. Se vuelve a ejecutar cuando cambian esas páginas."""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def deps(page):
    """Recursos locales (css, js, imágenes, fuentes) que carga una página HTML."""
    s = open(os.path.join(ROOT, page), encoding='utf8').read()
    out = []
    for m in re.finditer(r'(?:href|src|srcset)="([^"#]+)"', s):
        for u in re.split(r'\s*,\s*', m.group(1)):
            u = u.split(' ')[0]
            if re.match(r'^(https?:|mailto:|data:|tel:|javascript:)', u) or not u: continue
            u = u.split('?')[0].lstrip('/')
            if re.search(r'\.(css|js|png|jpe?g|webp|svg|ico|woff2?|json)$', u) and os.path.exists(os.path.join(ROOT, u)):
                out.append(u)
    return list(dict.fromkeys(out))

def con_deps(pages):
    r = []
    for p in pages:
        r.append(p); r += deps(p)
    return list(dict.fromkeys(r))

def main():
    pats = {}
    for f in ('data/nikafarma_patologias.json', 'data/flashcards_cirugia.json'):
        d = json.load(open(os.path.join(ROOT, f), encoding='utf8'))
        for p in d['patologias']: pats[p['id']] = p.get('area') or 'ginecologia'
    comun = ['css/guias.css', 'css/navmovil.css', 'js/guias.js', 'js/navmovil.js', 'assets/n-nika-96.webp', 'assets/n-nika-192.webp', 'assets/N%20NIKA.png', 'favicon.ico',
             'assets/fonts/plusjakarta-latin.woff2', 'assets/fonts/plusjakarta-latin-ext.woff2']
    def temas(area):
        ids = sorted(i for i, a in pats.items() if a == area)
        paginas = ['temas/%s.html' % i for i in ids]
        imgs = ['assets/temas/%s-480.webp' % i for i in ids if os.path.exists(os.path.join(ROOT, 'assets/temas/%s-480.webp' % i))]
        return ['temas-clinicos.html'] + comun + paginas + imgs
    guias = sorted(os.path.basename(f) for f in glob.glob(os.path.join(ROOT, 'guia-*.html'))) + ['guias.html']
    out = {
        'temas-gin': temas('ginecologia'),
        'temas-cir': temas('cirugia'),
        'guias': guias + comun + ['assets/capturas/nikamed-home.webp', 'assets/capturas/nikamed-temas.webp', 'assets/capturas/nikamed-tema.webp', 'assets/capturas/nikamed-guias.webp', 'assets/capturas/nikamed-flashcards.webp'],
        'calculadoras': ['calculadoras.html'] + comun + ['css/calculadoras.css'] + sorted('js/calc/' + os.path.basename(f) for f in glob.glob(os.path.join(ROOT, 'js/calc/*.js'))),
        'notas': con_deps(['mis_notas.html']) + ['js/misNotas.js'],
        'plan': con_deps(['plan_examen.html']) + ['js/planExamen.js', 'js/programaTemas.js', 'data/pfo_data.json', 'data/medicinalegal.json', 'data/medicinadeportiva.json'] + sorted('data/planes/' + os.path.basename(f) for f in glob.glob(os.path.join(ROOT, 'data/planes/*.json'))),
        'glosario': ['glosario.html'] + comun,
    }
    for k in out: out[k] = list(dict.fromkeys(out[k]))
    json.dump(out, open(os.path.join(ROOT, 'data/guardia_listas.json'), 'w', encoding='utf8'), ensure_ascii=False)
    print({k: len(v) for k, v in out.items()})
    # tamaño estimado en MB
    for k, v in out.items():
        t = sum(os.path.getsize(os.path.join(ROOT, u.replace('%20', ' '))) for u in v if os.path.exists(os.path.join(ROOT, u.replace('%20', ' '))))
        print(k, round(t / 1048576, 2), 'MB')

if __name__ == '__main__':
    main()
