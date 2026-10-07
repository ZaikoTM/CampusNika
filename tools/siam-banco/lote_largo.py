"""Lista preguntas donde la opcion correcta es la MAS LARGA y propone alargar el distractor mas largo con una "cola".
Uso: python tools/siam-banco/lote_largo.py [N=60]     (salta ~43 % de las preguntas para que la correcta siga siendo la mas larga en ~1/3)
Parche: {"SIAM-UP1-005": {"c+": ", y con agravamiento progresivo"}}  -> agrega la cola a la opcion c antes del punto final."""
import glob, json, os, sys, zlib
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
n = int(sys.argv[1]) if len(sys.argv) > 1 else 60
pend = hechos = 0
for f in sorted(glob.glob(os.path.join(RAIZ, 'data/UP*_siam.json'))):
    for p in json.load(open(f, encoding='utf-8'))['preguntas']:
        L = {k: len(v) for k, v in p['opciones'].items()}; c = p['respuesta_correcta']
        if L[c] != max(L.values()):
            continue
        if zlib.crc32(p['id'].encode()) % 7 < 3:      # ~43 %: se deja como esta (la correcta sigue siendo la mas larga)
            continue
        pend += 1
        if hechos >= n:
            continue
        hechos += 1
        d = max((k for k in L if k != c), key=lambda k: L[k])
        falta = L[c] - L[d] + 4
        print(f"### {p['id']} c={c.upper()}({L[c]}) -> alargar {d}(+{falta}+) | {p['pregunta'][:90]}")
        print(f"   [{c}] {p['opciones'][c]}")
        print(f"   [{d}] {p['opciones'][d]}")
print('--- pendientes:', pend)
