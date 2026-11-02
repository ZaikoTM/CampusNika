# -*- coding: utf-8 -*-
"""Anios de edicion de la bibliografia: en los titulos de los libros completos de la sala y en la fuente de las fichas. Idempotente.
Verificados en los propios libros: CTO 11.ª ed. (c) 2019; Orrego y Moran, julio de 2014; Michans 5.ª ed. 2021 (programa de la catedra); Gimenez 2.ª ed. 2025; Manual SCHU 3.ª ed. 2025.
No verificables en el PDF: Schwartz 10.ª ed. (2015, edicion en español de McGraw-Hill), Smith y Tanagho 18.ª ed. (2016) y QxMedic (sin año de edicion; su ultima referencia es de 2023)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TITULOS = [
 ('Giménez, Cirugía: Fundamentos para la práctica clínico-quirúrgica, 2.ª edición ·', 'Giménez, Cirugía: Fundamentos para la práctica clínico-quirúrgica, 2.ª edición (2025) ·'),
 ('Schwartz, Principios de Cirugía, 10.ª edición"', 'Schwartz, Principios de Cirugía, 10.ª edición (2015)"'),
 ('Michans, Cirugía 5.ª edición (parte 1 de 2)', 'Michans, Cirugía 5.ª edición, 2021 (parte 1 de 2)'),
 ('Michans, Cirugía 5.ª edición (parte 2 de 2)', 'Michans, Cirugía 5.ª edición, 2021 (parte 2 de 2)'),
 ('Manual CTO de Medicina y Cirugía 11.ª ed.: Traumatología y cirugía ortopédica"', 'Manual CTO de Medicina y Cirugía 11.ª ed. (2019): Traumatología y cirugía ortopédica"'),
 ('Ortopedia y Traumatología Básica (Orrego y Morán)"', 'Ortopedia y Traumatología Básica (Orrego y Morán, 2014)"'),
 ('Traumatología (Dr. William Guzmán, QxMedic)"', 'Traumatología (Dr. William Guzmán, QxMedic, sin año de edición)"'),
 ('Smith y Tanagho, Urología General, 18.ª edición (McAninch y Lue)"', 'Smith y Tanagho, Urología General, 18.ª edición, 2016 (McAninch y Lue)"'),
 ('Manual de Urología SCHU, 3.ª edición (casi 400 MB', 'Manual de Urología SCHU, 3.ª edición, 2025 (casi 400 MB'),
]
def main():
    p = os.path.join(ROOT, 'data/cirugia.json'); s = open(p, 'rb').read().decode('utf8'); n = 0
    for a, b in TITULOS:
        if a in s: s = s.replace(a, b); n += 1
    open(p, 'wb').write(s.encode('utf8'))
    pf = os.path.join(ROOT, 'data/flashcards_cirugia.json'); raw = open(pf, 'rb').read(); j = json.loads(raw.decode('utf8')); m = 0
    for x in j['patologias']:
        f = x['fuente']; g = f.get('guia', '')
        if 'Manual CTO' in g and f.get('anio') != '2019': f['anio'] = '2019'; m += 1
        if 'Michans' in g and f.get('anio') == '2002': f['anio'] = '2021'; m += 1
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(pf, 'wb').write(out.encode('utf8')); print('titulos con año:', n, '| fichas con año corregido:', m)
if __name__ == '__main__': main()
