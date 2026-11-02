# -*- coding: utf-8 -*-
"""UP11: fuente principal = Manual de Urologia SCHU 3.ª ed. (2025) + datos verificados en cada capitulo. Idempotente. Uso: python -I tools/cirugia/schu_fuentes.py (despues de ampliar.py)"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from rev4 import SCHU
ROOT = os.path.dirname(os.path.dirname(HERE))
T = json.load(open(os.path.join(HERE, 'schu_drive.json'), encoding='utf8'))['titulos']
M = {  # id de ficha -> (capitulo SCHU, [datos del capitulo], seccion)
 'cx-retencion-aguda-orina': ('12', [], 'estudios'),
 'cx-litiasis-urinaria-colico-renal': ('8', [
   'Probabilidad de expulsión espontánea del cálculo ureteral: cerca de 80 % si mide menos de 4 mm, 60 % entre 4 y 6 mm y menos de 20 % si supera los 6 mm (Manual SCHU).',
   'Terapia médica expulsiva (líquidos para diuresis mayor de 2 L/día, AINE, tamsulosina 0,4 mg/día; nifedipino 30 mg/día como alternativa): en cálculos no complicados con dolor controlado se espera 30 a 45 días; si no sale, o hay complicación, se ofrece tratamiento quirúrgico.',
   'Cálculo ureteral infectado o con hidropionefrosis: descompresión urgente con catéter doble J o nefrostomía percutánea más antibiótico; el tratamiento definitivo se hace después, ya superado el cuadro séptico.'], 'banderas'),
 'cx-torsion-testicular': ('9', [
   'Sobrevida testicular según el tiempo hasta la cirugía: 90 a 100 % antes de 6 horas, 20 a 50 % entre 6 y 12 horas y menos de 10 % pasadas las 12 horas (Manual SCHU).',
   'La ecografía Doppler (sensibilidad 82 a 100 %) apoya el diagnóstico, pero el juicio clínico pesa más y la imagen nunca debe retrasar la exploración quirúrgica.'], 'banderas'),
 'cx-trauma-urogenital': ('33', [
   'Trauma renal: el diagnóstico se apoya en la tomografía computada y el manejo actual es mucho más conservador, con indicaciones de cirugía excepcionales en el paciente estable (Manual SCHU, cap. 33).',
   'Trauma uretral y vesical: ante sangre en el meato o imposibilidad de orinar, uretrografía retrógrada antes de pasar sonda (Manual SCHU, cap. 34).'], 'banderas'),
 'cx-cancer-prostata-diagnostico': ('26', [
   'La gradación de Gleason fue reformulada por la ISUP (grupos de grado); el puntaje suma el patrón más común y el de mayor grado (Manual SCHU).'], 'banderas'),
 'cx-tumores-renales': ('23', [], 'banderas'),
 'cx-cancer-vejiga-urotelial': ('25', [
   'Hematuria: estudio con cistoscopia y tomografía con urografía; la citología urinaria rinde sobre todo en tumores de alto grado y carcinoma in situ (Manual SCHU).'], 'banderas'),
 'cx-tumores-testiculares-genitales': ('28', [], 'banderas'),
 'cx-obstruccion-urinaria-alta-baja': ('24', [], 'banderas'),
 'cx-fimosis-parafimosis': ('9', [], 'banderas'),
 'cx-varicocele-hidrocele': ('17', [], 'banderas'),
}
def main():
    p = os.path.join(ROOT, 'data/flashcards_cirugia.json')
    raw = open(p, 'rb').read(); j = json.loads(raw.decode('utf8')); por = {x['id']: x for x in j['patologias']}
    for pid, (cap, datos, sec) in M.items():
        f = por[pid]
        if not f['fuente'].get('guia', '').startswith('Manual de Urología (SCHU)'):
            orig = f['fuente'].get('guia', '')
            f['fuente'] = SCHU(cap, T[cap], 'Se cotejó con %s.' % orig if orig else '')
        for d in datos:
            if d not in f.setdefault(sec, []): f[sec].append(d)
    l2 = raw.decode('utf8').splitlines()[1]; ind = len(l2) - len(l2.lstrip(' '))
    out = json.dumps(j, ensure_ascii=False, indent=ind)
    if b'\r\n' in raw: out = out.replace('\n', '\r\n')
    open(p, 'wb').write(out.encode('utf8')); print('ok', len(M))
if __name__ == '__main__': main()
