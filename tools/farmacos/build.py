# -*- coding: utf-8 -*-
"""Genera data/flashcards_farmacos.json (fichas de fármacos de Ginecología y Obstetricia). Uso: python tools/farmacos/build.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from datos import FARMACOS, ANTIMICROBIANOS, UNIDADES, P
from mac import FARMACOS_MAC, PARCHES_MAC

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def vademecum():
    v = json.load(open(os.path.join(ROOT, 'data/nikafarma_api.json'), encoding='utf8'))
    return {d['id']: d for d in v['drugs']}

def ficha_antimicrobiano(d, usos):
    cl = d.get('class', {})
    txt = lambda x: (x or '').replace('\n', ' ').strip()
    pasos = []
    for ind in d.get('indications', [])[:8]:
        bandas = ind.get('bands', [])
        b = next((x for x in bandas if x.get('id') in ('gt50', 'normal')), bandas[0] if bandas else None)
        if b and txt(b.get('text')):
            pasos.append(P(txt(ind.get('title')), txt(b['text'])))
    pk = d.get('pharmacology', {}).get('pk', {}) or {}
    sg = d.get('safety', {})
    tiempos = []
    if pk.get('half_life'): tiempos.append('Vida media: ' + txt(pk['half_life']) + '.')
    if pk.get('elimination'): tiempos.append('Eliminación: ' + txt(pk['elimination']))
    if pk.get('distribution'): tiempos.append('Distribución: ' + txt(pk['distribution']))
    pd = d.get('pharmacology', {}).get('pd', {}) or {}
    if pd.get('kill'): tiempos.append('Farmacodinamia: ' + txt(pd['kill']) + (' (' + txt(pd['pattern']) + ')' if pd.get('pattern') else '') + '.')
    pre = []
    if sg.get('pregnancy', {}).get('text'): pre.append('Embarazo: ' + txt(sg['pregnancy']['text']))
    if sg.get('lactation', {}).get('text'): pre.append('Lactancia: ' + txt(sg['lactation']['text']))
    if sg.get('precautions'): pre.append('Precauciones: ' + txt(sg['precautions']))
    if d.get('administration', {}).get('observations'): pre.append('Administración: ' + txt(d['administration']['observations']))
    contra = [txt(sg['contraindications'])] if sg.get('contraindications') else ['No figuran en el vademécum de NikaFarma.']
    efectos = [txt(sg['adverse_effects'])] if sg.get('adverse_effects') else []
    pres = d.get('presentations') or []
    dosis = [dict(titulo='Esquemas con función renal normal (vademécum NikaFarma)', pasos=pasos)] if pasos else []
    if pres: dosis.append(dict(titulo='Presentaciones', pasos=[P('Disponibles', '; '.join(txt(x) for x in pres))]))
    return dict(id='fx-' + d['id'], titulo=d['name'], alias=usos + [cl.get('kind', '').lower()], up=['fx5'], clase=(cl.get('kind', '') + ' · ' + cl.get('class', '')).strip(' ·'),
                fuente=dict(tipo='guia', guia='Vademécum NikaFarma (revisado por farmacéuticos de hospital)', sociedad='AAFH', anio=2024),
                indicaciones=['Usos en Ginecología y Obstetricia: ' + ', '.join(usos) + '. Las indicaciones y dosis completas están en NikaFarma.'],
                mecanismo=[txt(d.get('pharmacology', {}).get('mechanism'))] if d.get('pharmacology', {}).get('mechanism') else [],
                dosis=dosis, contraindicaciones=contra, efectos=efectos, tiempos=tiempos, precauciones=pre, vademecum=d['id'])

def aplicar_mac(f):
    """Suma los datos de la guía argentina (MSAL 2023) a fichas de fármacos ya existentes."""
    p = PARCHES_MAC.get(f['id'])
    if not p: return f
    f = dict(f)
    sin = lambda l: [x for x in (l or []) if not (isinstance(x, str) and 'detalla' in x)]
    f['mecanismo'] = sin(f.get('mecanismo')) + p.get('mecanismo', [])
    for k in ('dosis', 'contraindicaciones', 'efectos', 'tiempos'):
        if k in p: f[k] = sin(f.get(k)) + p[k]
    fu = dict(f.get('fuente', {})); fu['argentinas'] = p['argentinas']; fu['nota'] = ((fu.get('nota') or '') + ' ' + p['nota']).strip()
    f['fuente'] = fu
    return f

def main():
    vm = vademecum(); fichas = []
    for f in [aplicar_mac(x) for x in FARMACOS] + FARMACOS_MAC:
        f = dict(f); f.update(area='farmacos', tipo='farmaco', estado='guia', definicion=f.pop('clase'), unidad=UNIDADES[f['up'][0]])
        fichas.append(f)
    for did, usos in ANTIMICROBIANOS:
        f = ficha_antimicrobiano(vm[did], usos); f.update(area='farmacos', tipo='farmaco', estado='guia', definicion=f.pop('clase'), unidad=UNIDADES['fx5'])
        fichas.append(f)
    meta = {'unidades': UNIDADES, 'descargo': 'Resumen educativo de fármacos usados en Ginecología y Obstetricia: toma datos de los prospectos de la FDA, de consensos y guías nacionales y del vademécum de NikaFarma. Las dosis obstétricas fuera de prospecto provienen de las guías indicadas en cada ficha. No reemplaza el prospecto aprobado por la ANMAT, el protocolo de la institución ni el criterio del médico tratante.'}
    out = {'meta': meta, 'patologias': fichas}
    json.dump(out, open(os.path.join(ROOT, 'data/flashcards_farmacos.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(len(fichas), 'fichas de fármacos')

if __name__ == '__main__':
    main()
