# -*- coding: utf-8 -*-
"""Ajusta data/cirugia.json: libros de traumatología limpios en UP8, marca de material obligatorio y vínculo capítulo -> flashcards (campo `fichas`). Idempotente. Uso: python tools/cirugia/sala.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'data/cirugia.json')
raw = open(P, 'rb').read(); c = json.loads(raw.decode('utf8'))
fc = json.load(open(os.path.join(ROOT, 'data/flashcards_cirugia.json'), encoding='utf8'))['patologias']
por = {u['id']: u for u in c['units']}
fid = lambda m: (re.search(r'/d/([^/]+)/', m['url']) or [None, None])[1]

# ---- 1) libros de traumatología sin subrayados (UP8) y reemplazo del Orrego viejo (con subrayados) en todas las unidades
OLD_ORR = '16sn7JImW9idSYSehZye6xMi0p-Y5FBu4'
NEW = {'orr': '1b_e5wel1NGdV8DebFvM6CeFyBamV6GAI', 'cto': '1Jx5KLrJnXauLgdu9SsWFbA4tZ9QgNwJT', 'qx': '1-XOGJ2ey3_tWmmtJUExGxw5X_pYz8jLY', 'choice': '1uBg86UAaFfSe4IUy4SYzxdEImh9rtMm0'}
url = lambda i: 'https://drive.google.com/file/d/%s/view?usp=drive_link' % i
for u in c['units']:
    for m in u['materiales']:
        if fid(m) == OLD_ORR: m['url'] = url(NEW['orr'])
u8 = por['up8']['materiales']
LIBROS = [('📚 Libro completo · Manual CTO de Medicina y Cirugía 11.ª ed.: Traumatología y cirugía ortopédica', NEW['cto']),
          ('📚 Libro completo · Ortopedia y Traumatología Básica (Orrego y Morán)', NEW['orr']),
          ('📚 Libro completo · Traumatología (Dr. William Guzmán, QxMedic)', NEW['qx']),
          ("Choice's de Traumatología de miembro inferior", NEW['choice'])]
u8[:] = [m for m in u8 if fid(m) not in (OLD_ORR, NEW['orr'], NEW['cto'], NEW['qx'], NEW['choice'])]
i = next((k for k, m in enumerate(u8) if m['title'].startswith('Contenidos UP')), 0) + 1
for t, f in reversed(LIBROS): u8.insert(i, {'type': 'pdf', 'title': t, 'url': url(f)})

# ---- 1b) Manual de Urología SCHU en UP11: libro completo y capítulos (ids de Drive en data/schu_drive.json)
SD = os.path.join(ROOT, 'tools/cirugia/schu_drive.json')
if os.path.exists(SD):
    sd = json.load(open(SD, encoding='utf8'))
    u11 = por['up11']['materiales']
    u11[:] = [m for m in u11 if 'Manual de Urología SCHU' not in m['title']]
    u11.append({'type': 'pdf', 'title': '📚 Libro completo · Manual de Urología SCHU, 3.ª edición (casi 400 MB, tarda en abrir)', 'url': url(sd['libro'])})
    for k in sorted(sd['caps'], key=int):
        u11.append({'type': 'pdf', 'title': '📖 Cap. %s %s · Manual de Urología SCHU 3.ª ed.' % (k, sd['titulos'][k]), 'url': url(sd['caps'][k])})

# ---- 2) obligatorio (bibliografía esencial del programa de cada unidad)
ESENCIAL = {  # libro (texto del título) -> unidades donde es bibliografía esencial
    'Giménez': {'up1', 'up2', 'up3', 'up4', 'up5', 'up6', 'up7', 'up9', 'up10'},
    'Galindo': {'up3', 'up4', 'up5', 'up6'},
    'Michans': {'up1', 'up2', 'up7'},
    'Smith y Tanagho': {'up11'},
}
BIBLIO = {  # títulos exactos de bibliografía esencial por unidad
    'up2': ['Estrés preoperatorio y riesgo quirúrgico (Giacomantone y Mejía)'],
    'up7': ['Estrés en anestesiólogos', 'Desgaste psíquico en el equipo de salud'],
    'up8': ['Discapacidad: comunicar a padres, niños y adolescentes (Lillo)', 'Discapacidad y familia: desgaste emocional'],
    'up9': ['Comunicación en situaciones críticas'],
}
for uid, u in por.items():
    for m in u['materiales']:
        m.pop('obligatorio', None)
        t = m['title']
        if t.startswith('📖') and any(k in t and uid in v for k, v in ESENCIAL.items()): m['obligatorio'] = True
        if t in BIBLIO.get(uid, []): m['obligatorio'] = True

# ---- 3) capítulo -> flashcards que lo citan
def caps(texto, clave):
    out = set()
    for m in re.finditer(clave + r'[^:;]{0,80}?cap\.?\s*([0-9]+(?:\s*(?:y|,)\s*[0-9]+)*)', texto):
        out |= {int(x) for x in re.findall(r'\d+', m.group(1))}
    return out
idx = {'Giménez': {}, 'Smith y Tanagho': {}, 'Manual de Urología SCHU': {}}
for p in fc:
    f = p.get('fuente', {}); txt = ' '.join([f.get('guia', ''), f.get('nota', '')])
    if str(f.get('guia', '')).startswith('Cirugía: fundamentos'):
        for n in caps(f['guia'], 'Cirugía: fundamentos'): idx['Giménez'].setdefault(n, []).append(p['id'])
    for n in caps(txt, 'Giménez'): idx['Giménez'].setdefault(n, []).append(p['id'])
    if 'Smith y Tanagho' in txt:
        for n in caps(txt, 'Smith y Tanagho'): idx['Smith y Tanagho'].setdefault(n, []).append(p['id'])
    if 'Manual de Urología (SCHU)' in txt:
        for n in caps(txt, r'Manual de Urología \(SCHU\)'): idx['Manual de Urología SCHU'].setdefault(n, []).append(p['id'])
tot = 0
for u in c['units']:
    for m in u['materiales']:
        m.pop('fichas', None)
        mm = re.match(r'^📖\s+Cap\.\s*(\d+)\s.*·\s*(Giménez|Smith y Tanagho|Manual de Urología SCHU)', m['title'])
        if not mm: continue
        ids = list(dict.fromkeys(i for i in idx[mm.group(2)].get(int(mm.group(1)), []) if any(u['id'].replace('up', 'cx') in x['up'] for x in fc if x['id'] == i)))
        if ids: m['fichas'] = ids; tot += 1
out = json.dumps(c, ensure_ascii=False, indent=2).replace('\n', '\r\n')
open(P, 'wb').write(out.encode('utf8'))
print('obligatorios', sum(1 for u in c['units'] for m in u['materiales'] if m.get('obligatorio')), '| capítulos con fichas', tot)
