import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from base import UNIDADES
import cr_a, cr_b, cr_c
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import fuentes_ar as FA
import re
fichas, ids = [], set()
for m in (cr_a, cr_b, cr_c):
    for p in m.FICHAS:
        assert p['id'] not in ids, 'id repetido ' + p['id']; ids.add(p['id'])
        assert p['definicion'] and p['diagnostico'], p['id']
        fichas.append(p)
KEEP = {'cr-ranson', 'cr-atlanta-2012', 'cr-nexus', 'cr-bethesda-tiroides', 'cr-bethesda-cervical', 'cr-hellp', 'cr-epi-cdc', 'cr-hinchey', 'cr-alvarado'}
PAT = re.compile(r'Sociedad Argentina|Sociedad Neurol|Asociación Argentina|Asociación de Anestesia|SAC|SAP|SATI|SADI|SAN|AAEEH|SAEM|SAPTGyC|SOGIBA|AAARBA|INCUCAI|Grupo Argentino|Federación Argentina|Ministerio de Salud|Programa Nacional')
for p in fichas:
    f = p['fuente']
    if p['id'] in FA.FICHAS: f['argentinas'] = FA.lista(FA.FICHAS[p['id']])
    if p['id'] not in KEEP:
        seg = [x for x in f['sociedad'].split(' / ') if not PAT.search(x)]
        f['sociedad'] = ' / '.join(seg) if seg else 'Publicación original'
out = {'meta': {'version': '0.1.0', 'area': 'criterios', 'actualizado': '2026-10-16', 'unidades': UNIDADES,
        'descargo': 'Material educativo para estudiantes de medicina. Resume criterios, clasificaciones y escalas validadas, con la publicación original y la guía de la sociedad científica que las respalda; los puntos de corte pueden actualizarse. No reemplaza la guía vigente, el protocolo de la institución ni el juicio del médico tratante.',
        'regla': 'Cada ficha cita la publicación original y la guía de sociedad científica (priorizando fuentes argentinas cuando existen).'},
       'patologias': fichas}
dest = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'flashcards_criterios.json')
json.dump(out, open(dest, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(fichas), 'fichas', Counter(p['up'][0] for p in fichas), os.path.getsize(dest) // 1024, 'KB')
