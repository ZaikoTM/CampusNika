#!/usr/bin/env python3
"""Fuentes argentinas VERIFICADAS (localizadas en la web el 2026-10-16) para calculadoras y fichas de criterios.
Genera data/fuentes_argentinas.json y js/calc/fuentes-ar.js. Solo se citan documentos efectivamente encontrados;
donde no se halló una guía argentina vigente, la escala queda con su fuente original/internacional."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fuentes_int import DICE, INT, CALC_INT, REF_AR_EXTRA, CALC_AR_EXTRA
from fuentes_int2 import INT2, CALC_INT2, REF_AR2, CALC_AR2, NOTA_AR, NOTA_INT

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REFS = {
    'sac-fanv': dict(t='Documento de toma de posición sobre el uso de anticoagulantes orales directos en fibrilación auricular no valvular', c='Sociedad Argentina de Cardiología y Federación Argentina de Cardiología. Rev Argent Cardiol 2021;89(1)'),
    'nac-2003': dict(t='Neumonía adquirida en la comunidad: guía práctica elaborada por un comité de sociedades médicas (incluye a la SADI)', c='Medicina (Buenos Aires) 2003;63:319-343', u='https://sadi.org.ar/documentos/guias-recomendaciones-y-consensos/21-neumonia-aguda-de-la-comunidad', n='Es de 2003: no se encontró una versión posterior.'),
    'sac-scasest': dict(t='Consenso para el manejo de pacientes con síndrome coronario agudo sin supradesnivel del ST', c='Sociedad Argentina de Cardiología. Rev Argent Cardiol 2014;82(Supl 1)'),
    'hta-2019': dict(t='Guía Nacional de Práctica Clínica: Hipertensión arterial (2019)', c='Ministerio de Salud de la Nación', u='https://www.mendoza.gov.ar/wp-content/uploads/sites/7/2021/11/Guia-Nacional-practica-clinica-hipertension-arterial-2019.pdf'),
    'acv-2019': dict(t='Consenso sobre accidente cerebrovascular isquémico agudo', c='Medicina (Buenos Aires) 2019;79(Supl II):1-46', u='https://www.medicinabuenosaires.com/PMID/31116699.pdf'),
    'erc-2022': dict(t='Guía Nacional de Manejo de la enfermedad renal crónica en adultos en el primer nivel de atención (2022)', c='Ministerio de Salud de la Nación', u='https://salud.neuquen.gob.ar/wp-content/uploads/2024/10/Guia-Nacional-de-Manejo-de-la-ERC-en-adultos-en-el-PNA.pdf'),
    'sap-hierro': dict(t='Deficiencia de hierro y anemia ferropénica: guía para su prevención, diagnóstico y tratamiento', c='Sociedad Argentina de Pediatría. Arch Argent Pediatr 2017;115(Supl 4):s68-s82', u='https://www.sap.org.ar/docs/pdf/consensos_deficiencia-de-hierro-y-anemia-ferropenica-guia-para-su-prevencion-diagnostico-y-tratamiento--71.pdf'),
    'sad-2025': dict(t='Guía para el tratamiento de la diabetes mellitus tipo 2 en el adulto', c='Sociedad Argentina de Diabetes. Rev Soc Arg Diabetes 2025;59(1)', u='https://doi.org/10.47196/diab.v59i1.1167'),
    'dm2-2019': dict(t='Guía de práctica clínica nacional sobre prevención, diagnóstico y tratamiento de la diabetes mellitus tipo 2 (2019)', c='Ministerio de Salud de la Nación', u='https://extranet.who.int/ncdccs/Data/ARG_D1_guia-prevencion-diagnostico-tratamiento-diabetes-mellitus-tipo-2.pdf'),
    'kawasaki-2016': dict(t='Enfermedad de Kawasaki: consenso interdisciplinario e intersociedades (guía práctica clínica)', c='Sociedad Argentina de Pediatría y Sociedad Argentina de Cardiología. Arch Argent Pediatr 2016;114(4):385-390', u='https://sap.org.ar/docs/publicaciones/archivosarg/2016/v114n4a30.pdf'),
    'hpp-2019': dict(t='Consenso de hemorragia posparto', c='FASGO 2019', u='https://www.fasgo.org.ar/archivos/consensos/Consenso_2019_Hemorragia_Post_Parto.pdf'),
    'hta-embarazo': dict(t='Guía para el diagnóstico y tratamiento de la hipertensión en el embarazo', c='Ministerio de Salud de la Nación, consensuada con FASGO, SOGIBA, SATI y otras sociedades', u='https://www.sati.org.ar/wp-content/uploads/2022/04/Guia_Hipertension_con-tapas1.pdf', n='Edición anterior: sus referencias llegan a 2008-2010.'),
    'sap-rcp-neonatal': dict(t='Manual de reanimación cardiopulmonar neonatal, 3.ª edición', c='Sociedad Argentina de Pediatría. Arch Argent Pediatr 2023', u='https://www.sap.org.ar/docs/publicaciones/archivosarg/2023/v121n2a22.pdf'),
    'eda-2015': dict(t='Plan de abordaje integral de la enfermedad diarreica aguda (guía para el equipo de salud)', c='Ministerio de Salud de la Nación, con la Sociedad Argentina de Pediatría y la SADI', u='https://ministeriodesalud.cba.gov.ar/wp-content/uploads/2021/11/Plan-de-Abordaje-Integral-de-la-Enfermedad-Diarreica-Aguda-y-Plan-de-Contingencia-de-Colera.pdf'),
    'its-2004': dict(t='Guía de manejo de las infecciones de transmisión sexual', c='Ministerio de Salud (Resolución 1078/2004)', n='Guía antigua: verificar si hay una actualización vigente.'),
}

CALC = {
    'cha2ds2-vasc': ['sac-fanv'], 'has-bled': ['sac-fanv'], 'curb65': ['nac-2003'], 'heart': ['sac-scasest'], 'timi-nste': ['sac-scasest'],
    'abcd2': ['acv-2019'], 'ckd-epi': ['erc-2022'], 'anemia-oms': ['sap-hierro'], 'ganzoni': ['sap-hierro'], 'hba1c-glu': ['sad-2025', 'dm2-2019'],
    'indice-shock': ['hpp-2019'], 'hellp-tennessee': ['hta-embarazo'], 'apgar': ['sap-rcp-neonatal'],
}
FICHAS = {
    'cr-cha2ds2-vasc': ['sac-fanv'], 'cr-has-bled': ['sac-fanv'], 'cr-curb65': ['nac-2003'], 'cr-heart': ['sac-scasest'], 'cr-timi-nste': ['sac-scasest'],
    'cr-abcd2': ['acv-2019'], 'cr-rankin': ['acv-2019'], 'cr-erc-kdigo': ['erc-2022'], 'cr-anemia-oms': ['sap-hierro'], 'cr-diabetes-ada': ['sad-2025', 'dm2-2019'],
    'cr-clasificacion-hta': ['hta-2019'], 'cr-kawasaki': ['kawasaki-2016'], 'cr-hellp': ['hta-embarazo'], 'cr-apgar': ['sap-rcp-neonatal'],
    'cr-deshidratacion-oms': ['eda-2015'], 'cr-epi-cdc': ['its-2004'],
}

REFS.update(REF_AR_EXTRA)
CALC.update(CALC_AR_EXTRA)
REFS.update(REF_AR2)
for _k, _v in CALC_AR2.items():
    CALC[_k] = CALC.get(_k, []) + _v
INT.update(INT2)
for _k, _v in CALC_INT2.items():
    CALC_INT[_k] = CALC_INT.get(_k, []) + _v
for _k, _v in DICE.items():
    REFS[_k]['d'] = _v

def lista(keys):
    return [{k2: v for k2, v in REFS[k].items()} for k in keys]

def main():
    out = {'refs': REFS, 'calc': CALC, 'fichas': FICHAS, 'int': INT, 'calcInt': CALC_INT, 'notaAr': NOTA_AR, 'notaInt': NOTA_INT}
    json.dump(out, open(os.path.join(ROOT, 'data/fuentes_argentinas.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    js = '// Fuentes argentinas verificadas (generado por tools/fuentes_ar.py)\n(function () {\n  const REFS = ' + json.dumps(REFS, ensure_ascii=False) + ';\n  const MAPA = ' + json.dumps(CALC, ensure_ascii=False) + ';\n' \
         '  const INT = ' + json.dumps(INT, ensure_ascii=False) + ';\n  const MAPAI = ' + json.dumps(CALC_INT, ensure_ascii=False) + ';\n  const NA = ' + json.dumps(NOTA_AR, ensure_ascii=False) + ';\n  const NI = ' + json.dumps(NOTA_INT, ensure_ascii=False) + ';\n  NikaCalcs.REG.forEach((c) => { if (MAPA[c.id]) c.fuenteAr = MAPA[c.id].map((k) => REFS[k]); if (MAPAI[c.id]) c.fuenteInt = MAPAI[c.id].map((k) => INT[k]); if (NA[c.id]) c.notaAr = NA[c.id]; if (NI[c.id]) c.notaInt = NI[c.id]; });\n})();\n'
    open(os.path.join(ROOT, 'js/calc/fuentes-ar.js'), 'w', encoding='utf8').write(js)
    print('ok', len(REFS), 'referencias')

if __name__ == '__main__':
    main()
