"""Muestra el proximo lote de preguntas con la opcion correcta notoriamente mas larga que las demas.
Uso: python tools/siam-banco/lote.py [N=30] [UP=] [umbral=1.25]
"""
import glob, json, os, re, sys
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
n = int(sys.argv[1]) if len(sys.argv) > 1 else 30
solo = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else None
umbral = float(sys.argv[3]) if len(sys.argv) > 3 else 1.25
tot = pend = 0
mostrados = 0
for f in sorted(glob.glob(os.path.join(RAIZ, 'data/UP*_siam.json'))):
    d = json.load(open(f, encoding='utf-8'))
    for p in d['preguntas']:
        L = {k: len(v) for k, v in p['opciones'].items()}
        c = p['respuesta_correcta']; otros = [v for k, v in L.items() if k != c]
        if L[c] > max(otros) * umbral:
            pend += 1
            if (solo and d['unidad'] != solo) or mostrados >= n:
                continue
            mostrados += 1
            print(f"### {p['id']} correcta={c.upper()} len={L}")
            print('P:', p['pregunta'][:110])
            for k, v in p['opciones'].items(): print(f"  {k}) {v}")
            razones = re.findall(r'La opción ([A-D]) es INCORRECTA porque ([^.]{0,90})', p['justificacion'])
            for letra, r in razones: print(f"  ~{letra}: {r}")
print(f'--- pendientes con umbral {umbral}: {pend}')
