#!/usr/bin/env python
"""Pule data/siam_data.json (idempotente, correr despues de construir_sala.py):
 - bibliografia oficial (obligatoria / de consulta) desde tools/siam-banco/bibliografia/upN.txt (pdftotext de los PDF de la catedra)
 - objetivos: quita el sufijo repetido y lo pasa a una nota unica por unidad
 - contenidos: quita el item 'Procedimientos' (ya figura en los objetivos)"""
import json, os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
AQUI = os.path.dirname(os.path.abspath(__file__))
ARREGLOS = {'Buenos Arites': 'Buenos Aires', 'diagnsotico': 'diagnostico', 'tahn': 'than', 'treatmen ': 'treatment ', 'Diagnsosis': 'Diagnosis',
            'Cerebro- Vascular': 'Cerebro-Vascular', 'Neuromodulacion': 'Neuromodulación', 'Mac-King': 'Mac-King'}
SUFIJOS = [': definir, reconocer la clínica, diagnosticar y plantear el tratamiento', ': mecanismo de acción, indicaciones, efectos adversos y contraindicaciones',
           ': comprender los conceptos y aplicarlos al adulto mayor']
NOTA = 'En cada ítem se evalúa: patologías → definir, reconocer la clínica, diagnosticar y plantear el tratamiento · fármacos → mecanismo de acción, indicaciones, efectos adversos y contraindicaciones · fisiología y psicología → comprender los conceptos y aplicarlos al adulto mayor.'

def entradas(s):
    out = []
    for blk in re.split(r'\n\s*\n', s):
        cur = []
        for l in [x.strip() for x in blk.split('\n') if x.strip()]:
            if cur and re.match(r"^[A-ZÁÉÍÓÚÑ][\wáéíóúñü\-' ]+, [A-Z]", l) and re.search(r'[\.\)\d:]$', cur[-1]) and len(' '.join(cur)) > 60:
                out.append(' '.join(cur)); cur = []
            cur.append(l)
        if cur: out.append(' '.join(cur))
    res, i = [], 0
    out = [re.sub(r'\s+', ' ', e).strip() for e in out]
    while i < len(out):
        if i + 2 < len(out) and out[i + 1] in ('ó', 'o'):
            res.append(out[i] + ' — o bien — ' + out[i + 2]); i += 3
        else:
            res.append(out[i]); i += 1
    res = [e for e in res if e not in ('ó', 'o')]
    for a, b in ARREGLOS.items():
        res = [e.replace(a, b) for e in res]
    return res

ruta = os.path.join(RAIZ, 'data/siam_data.json')
d = json.load(open(ruta, encoding='utf-8'))
for u in d['units']:
    n = u['number']
    t = open(os.path.join(AQUI, 'bibliografia', f'up{n}.txt'), encoding='utf-8').read().replace('\r', '').replace('\f', '\n')
    t = t.split('OBLIGATORIA:', 1)[1]
    ob, alt = t.split('ALTERNATIVA Y/O DE CONSULTA:', 1)
    u['bibliography'], u['bibliographyAlt'] = entradas(ob), entradas(alt)
    nuevos = []
    for o in u['objectives']:
        for s in SUFIJOS:
            if o.endswith(s): o = o[:-len(s)]; break
        nuevos.append(o)
    u['objectives'] = nuevos
    u['objectivesNote'] = NOTA
    u['contents'] = [c for c in u['contents'] if not c.startswith('Procedimiento')]
json.dump(d, open(ruta, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
print('ok', [(u['number'], len(u['bibliography']), len(u['bibliographyAlt']), len(u['contents'])) for u in d['units']])
