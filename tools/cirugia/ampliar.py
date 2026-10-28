# -*- coding: utf-8 -*-
"""Aplica el contenido de tools/cirugia/cxN.py a data/flashcards_cirugia.json. Idempotente. Uso: python tools/cirugia/ampliar.py"""
import json, os, sys, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.dirname(os.path.dirname(HERE))
MODS = [m for m in ('cx1', 'cx2', 'cx3', 'cx4', 'cx5', 'cx6', 'cx7', 'cx8', 'cx9', 'cx10', 'cx11', 'rev', 'rev2', 'rev3') if os.path.exists(os.path.join(HERE, m + '.py'))]
UNIDADES = {}

def main():
    p = os.path.join(ROOT, 'data/flashcards_cirugia.json')
    raw = open(p, 'rb').read(); j = json.loads(raw.decode('utf8'))
    por = {x['id']: x for x in j['patologias']}
    n = nn = 0
    for m in MODS:
        mod = importlib.import_module(m)
        for pid, c in getattr(mod, 'CONTENIDO', {}).items():
            f = por.get(pid)
            if not f: print('SIN FICHA', pid); continue
            for k, v in c.items():
                if k == 'fuente' and '_complementa' in v:   # se conserva la fuente actual y se agrega Giménez como complemento
                    nota = f['fuente'].get('nota') or ''
                    if v['_complementa'] not in nota: f['fuente']['nota'] = (nota + ' ' + v['_complementa']).strip()
                else: f[k] = v
            n += 1
        for c in getattr(mod, 'NUEVAS', []):
            if c['id'] in por:
                por[c['id']].clear(); por[c['id']].update(c)
            else:
                j['patologias'].append(c); por[c['id']] = c
            nn += 1
    # cobertura: títulos por unidad, en el orden de las fichas
    cob = {}
    for x in j['patologias']:
        for u in x['up']: cob.setdefault(u, []).append(x['titulo'])
    j['cobertura']['temas'] = {u: cob[u] for u in sorted(cob, key=lambda s: int(s[2:]))}
    j['meta']['version'] = '0.2.0'; j['meta']['actualizado'] = '2026-10-28'
    j['meta']['descargo'] = 'Material educativo para estudiantes de medicina. Resume guías y consensos argentinos recientes y la bibliografía validada de la cátedra, con Giménez, Cirugía 2.ª ed. (2025) como texto base; cada ficha cita su fuente. No reemplaza la guía vigente completa, el protocolo de la institución ni el juicio del médico tratante.'
    j['meta']['regla'] = 'Se parte de Giménez, Cirugía 2.ª ed. (2025), el texto argentino más actualizado; si existe una guía o consenso argentino reciente, se cita y prevalece. Donde Giménez no alcanza (traumatología, urología y otros) se usa la guía o el manual más reciente de la bibliografía, justificado en cada ficha.'
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))   # conserva la sangría original del archivo
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8'))
    print(n, 'fichas actualizadas,', nn, 'nuevas;', len(j['patologias']), 'en total')

if __name__ == '__main__':
    main()
