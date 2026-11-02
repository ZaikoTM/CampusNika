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
 'cx-pancreatitis-aguda': ('coincide', 'Harrison, Principios de Medicina Interna, 21.ª ed. (2023), cap. 348', [
    'Ambos prefieren el Ringer lactato a la solución salina y titulan la reanimación a la diuresis (más de 0,5 mL/kg/h) con control seriado; Harrison detalla un bolo inicial de 15 a 20 mL/kg seguido de 2 a 3 mL/kg/h y la medición de hematocrito y BUN cada 8 a 12 horas.',
    'Sobre la nutrición, Harrison indica la vía enteral a los 2 o 3 días del ingreso en las formas graves, en lugar de la parenteral total; el consenso argentino espera de 3 a 5 días para evaluar la tolerancia. Ambos prefieren la vía enteral.',
    'Ambos recomiendan la colecistectomía en el mismo internamiento si la pancreatitis biliar es leve; Harrison plantea la esfinterotomía endoscópica antes del egreso para quienes no son candidatos a cirugía.']),
 'cx-trombosis-venosa-profunda': ('coincide', 'Harrison, Principios de Medicina Interna, 21.ª ed. (2023), cap. 279', [
    'El filtro de vena cava inferior coincide con la ficha: se indica con contraindicación absoluta para anticoagular o ante TEV recurrente con dosis terapéuticas; en general no se usa como prevención primaria y debe retirarse cuando ya no hace falta.',
    'Harrison agrega que el estudio ATTRACT (692 pacientes con TVP femoral o iliofemoral) no redujo el síndrome postrombótico con trombólisis dirigida por catéter en conjunto, con una tendencia favorable en la TVP iliofemoral; y que las medias de compresión (30 a 40 o 20 a 30 mmHg) alivian la molestia pero no previenen el síndrome postrombótico.',
    'Como profilaxis hospitalaria enumera heparina no fraccionada 5.000 U dos o tres veces al día, enoxaparina 40 mg al día, dalteparina o fondaparinux 2,5 mg al día, y compresión neumática intermitente cuando los anticoagulantes están contraindicados.']),
 'cx-pie-diabetico': ('coincide', 'Harrison, Principios de Medicina Interna, 21.ª ed. (2023), cap. 405', [
    'La úlcera infectada es un diagnóstico clínico: un cultivo superficial puede contener múltiples especies sin significado, por lo que los cultivos se toman de la base desbridada, del drenaje purulento o de la aspiración; coincide con la ficha. La infección suele ser polimicrobiana (cocos grampositivos incluido MRSA, bacilos gramnegativos y anaerobios).',
    'Una herida que llega al hueso es evidencia clínica de osteomielitis; se pide radiografía en las úlceras crónicas que no responden y la resonancia es el estudio más específico. La osteomielitis se trata con antibióticos prolongados y desbridamiento del hueso infectado cuando es posible.',
    'Hay que considerar la insuficiencia vascular en todos los pacientes: la derivación arterial periférica suele ser eficaz para cicatrizar y evitar la amputación del miembro isquémico.']),
 'cx-diverticulitis': ('coincide', 'Harrison, Principios de Medicina Interna, 21.ª ed. (2023), cap. 328', [
    'En la diverticulitis no complicada, Harrison recoge dos estudios aleatorizados (AVOD, con 623 pacientes, y DIABOLO, con 528) en los que los antibióticos no cambiaron el tiempo de resolución, las complicaciones ni la recurrencia, y los resultados de DIABOLO favorecieron la observación ambulatoria; coincide con la ficha, que no indica antibióticos de rutina.']),
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
