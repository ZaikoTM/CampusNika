# -*- coding: utf-8 -*-
"""Verifica las cifras de cada ficha contra el texto del capitulo citado (Gimenez: gx_NN.txt; SCHU: sc_NN.txt).
Uso: python -I tools/cirugia/verificar.py [id-ficha]   (los textos viven en el scratchpad de la sesion)"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
S = os.environ.get('NIKA_SCRATCH', r'C:/Users/Augusto/AppData/Local/Temp/claude/C--Users-Augusto-Desktop-Programacion-campus-nika-campus-nika/33aa7de8-888a-4310-a30e-8c0efdff8ef0/scratchpad/')
sys.path.insert(0, S)

def gim(n):
    f = S + 'gx_%02d.txt' % n
    if not os.path.exists(f): return None
    t = open(f, encoding='utf8').read()
    t = re.sub(r'<<p\d+>>\n', '', t); t = re.sub(r'-\n', '', t)
    return t

def schu(n):
    f = S + 'sc_%02d.txt' % n
    return open(f, encoding='utf8').read() if os.path.exists(f) else None

def textos(p):
    """(origen, texto) de los capitulos citados por la ficha."""
    g = p['fuente'].get('guia', '') + ' ' + p['fuente'].get('nota', '')
    out = []
    if 'SCHU' in p['fuente'].get('guia', ''):
        m = re.search(r'cap\.\s*(\d+)', p['fuente']['guia']); t = schu(int(m.group(1))) if m else None
        if t: out.append(('SCHU %s' % m.group(1), t))
    if 'fundamentos para la práctica' in g or 'Giménez' in g:
        for m in re.finditer(r'fundamentos para la práctica.{0,90}?cap\.\s*(\d+)(?:\s*(?:y|,)\s*(\d+))?', g):
            for k in m.groups():
                if k:
                    t = gim(int(k))
                    if t: out.append(('Giménez %s' % k, t))
        for m in re.finditer(r'Giménez.{0,60}?cap\.\s*(\d+)', g):
            t = gim(int(m.group(1)))
            if t and not any(o[0] == 'Giménez %s' % m.group(1) for o in out): out.append(('Giménez %s' % m.group(1), t))
    return out

def strings(x):
    if isinstance(x, str): yield x
    elif isinstance(x, list):
        for y in x: yield from strings(y)
    elif isinstance(x, dict):
        for k, y in x.items():
            if k in ('id', 'area', 'up', 'unidad', 'estado', 'alias', 'fuente', 'revisarAntes', 'contraste'): continue
            yield from strings(y)

def cifras(txt):
    """numeros significativos: decimales, porcentajes, rangos y de 2+ digitos."""
    res = set()
    for m in re.finditer(r'(?<![\w.])(\d+(?:[.,]\d+)?)(?:\s*(?:a|-|–)\s*(\d+(?:[.,]\d+)?))?\s*(%|mg|g|mL|ml|mm|cm|horas|h|días|semanas|meses|años|mmHg|U|UI|µg|mcg|L|kg|puntos)?', txt):
        a, b, u = m.groups()
        for v in (a, b):
            if v and (len(v) >= 2 or ',' in v or '.' in v or u): res.add(v.replace('.', ','))
    return res

def en_texto(v, t):
    alt = {v, v.replace(',', '.')}
    return any(re.search(r'(?<![\d,.])' + re.escape(a) + r'(?![\d])', t) for a in alt)

def main():
    j = json.load(open(os.path.join(ROOT, 'data/flashcards_cirugia.json'), encoding='utf8'))
    solo = sys.argv[1] if len(sys.argv) > 1 else None
    tot = sin = 0; informe = []
    for p in j['patologias']:
        if solo and p['id'] != solo: continue
        tx = textos(p)
        if not tx: sin += 1; informe.append((p['id'], None, [])); continue
        bloque = '\n'.join(t for _, t in tx)
        cs = set()
        for s in strings(p): cs |= cifras(s)
        falta = sorted(v for v in cs if not en_texto(v, bloque))
        informe.append((p['id'], [o for o, _ in tx], falta)); tot += 1
    for pid, orig, falta in informe:
        if orig is None: print('SIN TEXTO LOCAL', pid)
        elif falta: print('%s [%s] no halladas: %s' % (pid, ', '.join(orig), ', '.join(falta)))
    print('verificadas', tot, '| sin texto local', sin, '| con cifras no halladas', sum(1 for _, o, f in informe if o and f))

if __name__ == '__main__':
    main()
