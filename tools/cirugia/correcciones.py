# -*- coding: utf-8 -*-
"""Correcciones de datos detectadas al cotejar las fichas con los capitulos (verificar.py). Idempotente. Uso: python -I tools/cirugia/correcciones.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# (id de ficha, texto actual, texto corregido, respaldo)
C = [
 ('cx-nodulo-tiroideo', 'muy frecuente y casi siempre benigna (más del 90 %)', 'muy frecuente y en su mayoría benigna (entre el 4 y el 15 % corresponde a un cáncer)', 'Giménez cap. 23'),
 ('cx-hemorragia-digestiva-baja', 'La tasa de resangrado al año es cercana al 19 %: identificar el sitio y la causa.', 'El 80 % de las hemorragias digestivas bajas cede espontáneamente, pero el resangrado ocurre hasta en el 25 %: identificar el sitio y la causa.', 'Giménez cap. 83'),
]
# fichas que el programa tambien pide en otra unidad (se suma la unidad; la cobertura la recalcula ampliar.py)
UP_EXTRA = {'cx-torsion-testicular': ['cx6'], 'cx-varicocele-hidrocele': ['cx6'], 'cx-litiasis-urinaria-colico-renal': ['cx6']}
def main():
    p = os.path.join(ROOT, 'data/flashcards_cirugia.json')
    raw = open(p, 'rb').read(); j = json.loads(raw.decode('utf8')); por = {x['id']: x for x in j['patologias']}
    n = 0
    def rep(x, a, b):
        if isinstance(x, str): return x.replace(a, b)
        if isinstance(x, list): return [rep(y, a, b) for y in x]
        if isinstance(x, dict): return {k: rep(v, a, b) for k, v in x.items()}
        return x
    for pid, a, b, _ in C:
        antes = json.dumps(por[pid], ensure_ascii=False)
        if a in antes:
            nuevo = rep(por[pid], a, b); por[pid].clear(); por[pid].update(nuevo); n += 1
    for pid, ups in UP_EXTRA.items():
        for u in ups:
            if u not in por[pid]['up']: por[pid]['up'].append(u); n += 1
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8')); print('correcciones aplicadas:', n)
if __name__ == '__main__': main()
