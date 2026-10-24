# -*- coding: utf-8 -*-
"""Agrega a data/nikafarma_patologias.json las fichas de métodos anticonceptivos (mac-*) y corrige la ficha gin-anticoncepcion-ale. Idempotente.
Uso: python tools/gineco/anticoncepcion.py   (antes: python tools/farmacos/build.py, que genera los fármacos fx-*)"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mac1 import FICHAS_1
from mac2 import FICHAS_2
from mac3 import FICHAS_3
from mac5 import FICHAS_5
from mac4 import FICHAS_4, OMS25, LINKS, R_GUIA_LINK, R_OMS25
from mac_comun import ARCHIVO

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FICHAS = FICHAS_1 + FICHAS_2 + FICHAS_3 + FICHAS_4 + FICHAS_5
for _f in FICHAS:
    if _f['id'] in OMS25: _f['oms2025'] = OMS25[_f['id']]
    if 'oms2025' not in _f:
        _f['oms2025'] = ['Este método no figura entre los temas revisados en la 6.ª edición de los CME de la OMS (3/11/2025): sus recomendaciones de 2015 fueron reafirmadas en julio de 2024, por lo que la guía argentina de 2023 sigue vigente en este punto. Cambios generales de 2025: lactancia con progestágenos y DIU, antirretrovirales, uso repetido de la píldora de emergencia, PrEP (condición nueva).']
    for _r in [R_GUIA_LINK, R_OMS25] + LINKS.get(_f['id'], []):
        if _r['t'] not in [x['t'] for x in _f['fuente']['argentinas']]: _f['fuente']['argentinas'].append(_r)
ID_ALE = 'gin-anticoncepcion-ale'
FRASE_ALG = 'MELA desde el día 30 posparto'


def corregir_ale(f):
    """El esquema «desde el día 30 posparto, ≥ 4 veces por día, reemplazo cada 90 días, hasta un año» del consenso FASGO 2021 es el del anillo vaginal de
    progesterona (no disponible en Argentina), no el MELA."""
    for blq in f['tratamiento']:
        for p in blq['pasos']:
            if p['etiqueta'] == 'MELA':
                p['texto'] = 'Método de lactancia y amenorrea: tres condiciones a la vez (lactancia exclusiva, amenorrea y menos de 6 meses posparto); eficacia de 98 % con uso correcto. Ver la ficha «Lactancia-amenorrea (MELA) y métodos basados en el conocimiento de la fertilidad».'
            if p['etiqueta'] == 'Emergencia':
                p['texto'] = p['texto'] + ' La guía del Ministerio de Salud (2023) admite el levonorgestrel hasta las 120 horas y duplica la dosis con IMC ≥ 30 o peso mayor de 80 kg; ver la ficha de anticoncepción de emergencia.'

    def rec(nodos):
        for n in nodos:
            if FRASE_ALG in n.get('txt', ''):
                n['txt'] = 'En lactancia: MELA mientras cumpla sus tres condiciones (lactancia exclusiva, amenorrea y menos de 6 meses posparto), mejor con minipíldora o desogestrel'
            rec(n.get('si', []))
            rec(n.get('no', []))
    rec(f.get('algoritmo', {}).get('nodos', []))
    f['farmacos'] = ['fx-levonorgestrel-ec', 'fx-medroxiprogesterona']
    f['oms2025'] = ['Esta ficha sigue el consenso FASGO 2021 (criterios de la OMS 2015). La 6.ª edición de la OMS (3/11/2025) mantiene casi todo: cambia la lactancia con progestágenos (AMPD con menos de 6 semanas: categoría 2) y se revisaron las píldoras de emergencia y los antirretrovirales. Ver la sección «Guía OMS 2025» de cada ficha del método.']
    f['contraste'] = {
        'fuente': 'Guía del Ministerio de Salud de la Nación 2023 (cap. 7 y 16), contra el consenso FASGO 2021 de esta ficha',
        'estado': 'difiere',
        'puntos': [
            'Corregido: el esquema que esta ficha llamaba «MELA» («desde el día 30 posparto, al menos 4 veces por día, reemplazo cada 90 días, hasta un año») corresponde en el consenso FASGO al anillo vaginal de progesterona, que no está disponible en Argentina. El MELA exige lactancia exclusiva, amenorrea y menos de 6 meses posparto.',
            'Anticoncepción de emergencia: el consenso FASGO 2021 autoriza el levonorgestrel hasta 72 horas (hasta 120 horas fuera de prospecto) y duplica la dosis con IMC ≥ 26 o peso ≥ 70 kg; la guía del Ministerio 2023 lo admite hasta 120 horas y duplica con IMC ≥ 30 o peso mayor de 80 kg.',
            'Los métodos combinados, los de barrera, los naturales, la anticoncepción quirúrgica y el puerperio están en las fichas «Métodos anticonceptivos» de esta misma unidad, basadas en la guía del Ministerio 2023.',
        ]}
    f['fuente']['nota'] = (f['fuente'].get('nota') or '') + ' Corregida el 24/10/2026 con la guía del Ministerio de Salud de la Nación 2023 (ver el bloque de contraste).'
    return f


def main():
    p = os.path.join(ROOT, 'data/nikafarma_patologias.json')
    raw = open(p, 'rb').read()
    j = json.loads(raw.decode('utf8'))
    fx = {x['id'] for x in json.load(open(os.path.join(ROOT, 'data/flashcards_farmacos.json'), encoding='utf8'))['patologias']}
    # fichas nuevas (sin duplicar)
    ids = [f['id'] for f in FICHAS]
    assert len(ids) == len(set(ids)), 'ids repetidos'
    for f in FICHAS:
        for x in f.get('farmacos', []):
            assert x in fx, ('FARMACO NO EXISTE', f['id'], x)
    pat = [x for x in j['patologias'] if not x['id'].startswith('mac-')]
    i = next(k for k, x in enumerate(pat) if x['id'] == ID_ALE)
    pat[i] = corregir_ale(pat[i])
    pat[i + 1:i + 1] = FICHAS
    j['patologias'] = pat
    # mapa de cobertura del temario
    temas = [t for t in j['cobertura']['temas'] if not str(t.get('ficha', '')).startswith('mac-')]
    GUIA = 'Ministerio de Salud de la Nación · Métodos anticonceptivos: guía práctica para profesionales de la salud (2023)'
    for f in FICHAS:
        temas.append({'tema': f['titulo'], 'unidad': 'UP3 s1', 'estado': 'ficha', 'guias': [GUIA], 'ficha': f['id']})
    j['cobertura']['temas'] = temas
    crlf = b'\r\n' in raw
    out = json.dumps(j, ensure_ascii=False, indent=2)
    if crlf: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8'))
    print(len(FICHAS), 'fichas de métodos anticonceptivos;', len(pat), 'fichas en total')


if __name__ == '__main__':
    main()
