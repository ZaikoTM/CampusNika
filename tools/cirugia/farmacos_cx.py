# -*- coding: utf-8 -*-
"""Fármacos de Cirugía: crea fichas de antimicrobianos (desde el vademecum NikaFarma) y enlaza cada ficha de Cirugía con los fármacos que menciona.
Idempotente. Uso: python -I tools/cirugia/farmacos_cx.py   (despues de ampliar.py)"""
import json, os, re, sys, unicodedata
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'farmacos'))
import build as fb

# id del vademecum -> expresion (sobre el texto sin tildes y en minusculas). El orden importa: los compuestos van primero.
PATRONES = [
 ('amoxicilina-clavulanico', r'amoxicilina[\s/\-+]*(?:acido\s+)?clavulanic\w*|amoxicilina[\s/\-+]*clav\w*'),
 ('ampicilina-sulbactam', r'ampicilina[\s/\-+]*sulbactam'),
 ('piperacilina-tazobactam', r'piperacilina[\s/\-+]*tazobactam|piperacilina'),
 ('trimetoprima-sulfametoxazol', r'cotrimoxazol|trimetoprima[\s/\-+]*sulfametoxazol|\btmp[\s\-/]*smx\b'),
 ('amoxicilina', r'amoxicilina'), ('ampicilina', r'ampicilina'),
 ('cefazolina', r'cefazolina'), ('cefuroxima', r'cefuroxima'), ('cefalexina', r'cefalexina'), ('cefepime', r'cefepime'),
 ('cefotaxima', r'cefotaxima'), ('ceftazidima', r'ceftazidima'), ('ceftriaxona', r'ceftriaxona'),
 ('ciprofloxacina', r'ciprofloxacin\w*'), ('levofloxacina', r'levofloxacin\w*'),
 ('nitrofurantoina', r'nitrofurantoina'), ('fosfomicina', r'fosfomicina'),
 ('meropenem', r'meropenem'), ('imipenem', r'imipenem'), ('ertapenem', r'ertapenem'),
 ('vancomicina', r'vancomicina'), ('teicoplanina', r'teicoplanina'), ('linezolid', r'linezolid'),
 ('amikacina', r'amikacina'), ('gentamicina', r'gentamicina'), ('metronidazol', r'metronidazol'), ('clindamicina', r'clindamicina'),
 ('azitromicina', r'azitromicina'), ('doxiciclina', r'doxiciclina'), ('penicilina', r'penicilina(?!s?\s+de\s+espectro)'), ('fluconazol', r'fluconazol'),
 ('albendazol', r'albendazol'), ('rifaximina', r'rifaximina'), ('colistin', r'colisti\w*'),
]
UNIDAD_FX = 'fx6'; NOMBRE_FX = 'Antimicrobianos en Cirugía y Urología'

def sin_tildes(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')

def textos(x):
    if isinstance(x, str): yield x
    elif isinstance(x, list):
        for y in x: yield from textos(y)
    elif isinstance(x, dict):
        for k, y in x.items():
            if k in ('id', 'alias', 'fuente', 'revisarAntes', 'contraste', 'farmacos', 'unidad'): continue
            yield from textos(y)

def menciones(p):
    t = sin_tildes(' \n '.join(textos(p))); out = []
    for did, rx in PATRONES:
        m = re.search(r'(?<![a-z])(?:' + rx + r')(?![a-z])', t)
        if m:
            out.append(did); t = t[:m.start()] + ' ' * (m.end() - m.start()) + t[m.end():]   # evita contar 'amoxicilina' dentro del compuesto
            while True:
                m = re.search(r'(?<![a-z])(?:' + rx + r')(?![a-z])', t)
                if not m: break
                t = t[:m.start()] + ' ' * (m.end() - m.start()) + t[m.end():]
    return out

def guardar(path, obj, raw, ind):
    out = json.dumps(obj, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(path, 'wb').write(out.encode('utf8'))

def main():
    pc = os.path.join(ROOT, 'data/flashcards_cirugia.json'); pf = os.path.join(ROOT, 'data/flashcards_farmacos.json')
    rc = open(pc, 'rb').read(); rf = open(pf, 'rb').read()
    cx = json.loads(rc.decode('utf8')); fx = json.loads(rf.decode('utf8'))
    vm = fb.vademecum(); existentes = {f['id'] for f in fx['patologias']}
    uso = {}
    for p in cx['patologias']:
        ids = menciones(p)
        p['farmacos'] = ['fx-' + d for d in ids]
        for d in ids: uso.setdefault(d, []).append(p['titulo'])
    nuevos = 0
    for d, tits in uso.items():
        if 'fx-' + d in existentes or d not in vm: continue
        f = fb.ficha_antimicrobiano(vm[d], tits[:4])
        f.update(area='farmacos', tipo='farmaco', estado='guia', definicion=f.pop('clase'), unidad=NOMBRE_FX); f['up'] = [UNIDAD_FX]
        f['indicaciones'] = ['Aparece en las fichas de Cirugía y Urología: ' + '; '.join(tits[:4]) + '. Las indicaciones y dosis completas están en NikaFarma.']
        fx['patologias'].append(f); existentes.add(f['id']); nuevos += 1
    # los ids sin ficha (no estan en el vademecum) no se enlazan
    for p in cx['patologias']:
        p['farmacos'] = [i for i in p['farmacos'] if i in existentes]
        if not p['farmacos']: del p['farmacos']
    fx['meta']['unidades'][UNIDAD_FX] = NOMBRE_FX
    l2 = rc.decode('utf8').splitlines()[1]; guardar(pc, cx, rc, len(l2) - len(l2.lstrip(' ')))
    l2 = rf.decode('utf8').splitlines()[1]; guardar(pf, fx, rf, len(l2) - len(l2.lstrip(' ')))
    print('fichas de Cirugía con fármacos:', sum(1 for p in cx['patologias'] if p.get('farmacos')), '| fichas de fármacos nuevas:', nuevos, '| total fármacos:', len(fx['patologias']))

if __name__ == '__main__':
    main()
