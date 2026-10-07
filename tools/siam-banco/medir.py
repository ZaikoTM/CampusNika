import glob, json, os, collections
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
tot = lon = 0; letras = collections.Counter(); exc = []
for f in sorted(glob.glob(os.path.join(RAIZ, 'data/UP*_siam.json'))):
    d = json.load(open(f, encoding='utf-8'))
    por = [0, 0]
    for p in d['preguntas']:
        L = {k: len(v) for k, v in p['opciones'].items()}; c = p['respuesta_correcta']; tot += 1; letras[c] += 1
        es = L[c] == max(L.values()); lon += es; por[0] += es; por[1] += 1
    print(d['unidad'], f'correcta mas larga: {por[0]}/{por[1]} ({por[0]*100//por[1]}%)')
print(f'TOTAL correcta mas larga: {lon}/{tot} ({lon*100//tot}%) | letras', dict(sorted(letras.items())))
