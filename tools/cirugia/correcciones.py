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
# datos que se suman a una lista de la ficha (idempotente)
APPEND = {
 'cx-tumores-oseos-metastasis': ('estudios', 'Biopsia (recomendaciones del Manual CTO): incisión longitudinal en una zona extirpable, acceso por el compartimento donde surgió el tumor y a través del músculo y no entre dos músculos, evitando contaminar vasos y nervios; coordinar con anatomía patológica, tomar la muestra de partes blandas y de la periferia (el centro puede estar necrosado), estudiar parte por congelación y enviar siempre cultivos.'),
}
CONTRASTE_EXTRA = {
 'cx-accesos-vasculares-hemodialisis': ('coincide', 'Smith y Tanagho, Urología general, 18.ª ed. (2016), cap. 35', [
    'Ambos describen el acceso por fístula arteriovenosa, injerto vascular (autólogo de safena o sintético) o catéter permanente percutáneo; Michans (2002) detalla la fístula radiocefálica, el uso de prótesis de PTFE y el manejo de cada complicación.',
    'Smith y Tanagho agrega que la diálisis peritoneal se elige cuando el acceso vascular es inviable (cerca de 10 % de las diálisis) y que la hemodiálisis es intermitente, de 3 a 5 horas, tres veces por semana.']),
}
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
    for pid, (campo, texto) in APPEND.items():
        if texto not in por[pid].setdefault(campo, []): por[pid][campo].append(texto); n += 1
    for pid, (estado, fuente, puntos) in CONTRASTE_EXTRA.items():
        if pid in por: por[pid]['contraste'] = {'estado': estado, 'fuente': fuente, 'puntos': puntos}
    import collections
    cnt = collections.Counter((x['up'][0], x['unidad']) for x in j['patologias'] if x.get('unidad'))
    canon = {}
    for (u, nom), c in cnt.most_common():
        canon.setdefault(u, nom)
    for x in j['patologias']:
        if x['up'][0] in canon and x['unidad'] != canon[x['up'][0]]: x['unidad'] = canon[x['up'][0]]; n += 1
    for pid, ups in UP_EXTRA.items():
        for u in ups:
            if u not in por[pid]['up']: por[pid]['up'].append(u); n += 1
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8')); print('correcciones aplicadas:', n)
if __name__ == '__main__': main()
