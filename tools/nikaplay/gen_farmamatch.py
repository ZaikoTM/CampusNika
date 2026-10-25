# -*- coding: utf-8 -*-
"""Genera data/nikaplay/farmamatch.json para el juego FarmaMatch.

Fuentes (se leen para verificar que cada fármaco existe y para citar la fuente):
  - data/nikafarma_api.json      (vademécum, aval "verificado" AAFH 2024)
  - data/flashcards_farmacos.json (fichas de Ginecología y Obstetricia, fuente FASGO/FDA)

Las etiquetas cortas (clase, mecanismo, uso) están redactadas a mano a partir de esas fuentes. Ningún dato de dosis.
Cada fila: (id_fuente, nombre, familia, tipo, clase, grupo_clase, mecanismo, grupo_mec, uso, grupo_uso)
 - familia: atb (antibacterianos) | otros (antifúngicos, antivirales, antiparasitarios) | gin (ginecología y obstetricia)
 - los grupos evitan ambigüedad: en una misma ronda no se mezclan dos fármacos con el mismo grupo.
 - uso / grupo_uso = None si no hay un uso distintivo (el fármaco no entra en rondas de "uso").
Uso:  python tools/nikaplay/gen_farmamatch.py
"""
import json, sys, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VADE = os.path.join(ROOT, 'data', 'nikafarma_api.json')
GIN = os.path.join(ROOT, 'data', 'flashcards_farmacos.json')
OUT = os.path.join(ROOT, 'data', 'nikaplay', 'farmamatch.json')

PARED = 'Inhibe la síntesis de la pared bacteriana (se une a las PBP)'
P50 = 'Se une al ribosoma 50S y bloquea la síntesis de proteínas'
A = 'AAFH 2024'
F = 'FASGO / FDA'

ATB = [
 ('amoxicilina', 'Amoxicilina', 'Antibiótico', 'Penicilina', 'peni', PARED, 'bl', 'Otitis, faringitis y sinusitis', 'oro'),
 ('amoxicilina-clavulanico', 'Amoxicilina/Clavulánico', 'Antibiótico', 'Penicilina con inhibidor de betalactamasa', 'peni', PARED, 'bl', 'Infecciones respiratorias, de piel y mordeduras', 'mordedura'),
 ('ampicilina', 'Ampicilina', 'Antibiótico', 'Penicilina', 'peni', PARED, 'bl', 'Infecciones por enterococo y Listeria', 'listeria'),
 ('penicilina', 'Penicilina', 'Antibiótico', 'Penicilina', 'peni', PARED, 'bl', 'Sífilis y faringitis estreptocócica', 'sifilis'),
 ('piperacilina-tazobactam', 'Piperacilina/Tazobactam', 'Antibiótico', 'Penicilina con inhibidor de betalactamasa', 'peni', PARED, 'bl', 'Infecciones graves intraabdominales y por Pseudomonas', 'pseudo-ab'),
 ('cefazolina', 'Cefazolina', 'Antibiótico', 'Cefalosporina de 1.ª generación', 'ceph1', PARED, 'bl', 'Profilaxis antibiótica quirúrgica', 'profilaxis'),
 ('cefalexina', 'Cefalexina', 'Antibiótico', 'Cefalosporina de 1.ª generación', 'ceph1', PARED, 'bl', 'Infecciones leves de piel y urinarias', 'piel-leve'),
 ('cefuroxima', 'Cefuroxima', 'Antibiótico', 'Cefalosporina de 2.ª generación', 'ceph2', PARED, 'bl', None, None),
 ('ceftriaxona', 'Ceftriaxona', 'Antibiótico', 'Cefalosporina de 3.ª generación', 'ceph3', PARED, 'bl', 'Meningitis y neumonía grave de la comunidad', 'meningitis'),
 ('ceftazidima', 'Ceftazidima', 'Antibiótico', 'Cefalosporina de 3.ª generación', 'ceph3', PARED, 'bl', 'Infecciones por Pseudomonas aeruginosa', 'pseudo'),
 ('cefepime', 'Cefepime', 'Antibiótico', 'Cefalosporina de 4.ª generación', 'ceph4', PARED, 'bl', 'Neutropenia febril', 'neutropenia'),
 ('ceftarolina', 'Ceftarolina', 'Antibiótico', 'Cefalosporina de 5.ª generación', 'ceph5', PARED, 'bl', 'Infecciones complicadas de piel y neumonía de la comunidad', 'samr-ceft'),
 ('ertapenem', 'Ertapenem', 'Antibiótico', 'Carbapenem', 'carba', PARED, 'bl', 'Infecciones intraabdominales y urinarias complicadas', 'complicadas'),
 ('meropenem', 'Meropenem', 'Antibiótico', 'Carbapenem', 'carba', PARED, 'bl', 'Infecciones graves por gramnegativos multirresistentes', 'multires'),
 ('aztreonam', 'Aztreonam', 'Antibiótico', 'Monobactam', 'mono', PARED, 'bl', 'Gramnegativos aerobios en alérgicos a penicilina', 'alergia'),
 ('vancomicina', 'Vancomicina', 'Antibiótico', 'Glucopéptido', 'glico', 'Se une a D-Ala-D-Ala e impide armar la pared bacteriana', 'glico', 'Infecciones por SAMR y C. difficile (vía oral)', 'samr'),
 ('teicoplanina', 'Teicoplanina', 'Antibiótico', 'Glucopéptido', 'glico', 'Se une a D-Ala-D-Ala e impide armar la pared bacteriana', 'glico', None, None),
 ('daptomicina', 'Daptomicina', 'Antibiótico', 'Lipopéptido', 'lipo', 'Se inserta en la membrana de grampositivos y la despolariza', 'lipo', 'Bacteriemia y endocarditis por grampositivos', 'endocarditis'),
 ('fosfomicina', 'Fosfomicina', 'Antibiótico', 'Derivado del ácido fosfónico', 'fosfo', 'Inhibe la enzima MurA (síntesis del peptidoglucano)', 'fosfo', 'Cistitis no complicada', 'cistitis'),
 ('gentamicina', 'Gentamicina', 'Antibiótico', 'Aminoglucósido', 'amino', 'Se une al 30S: lectura errónea del ARNm', 'amino', 'Infecciones graves por gramnegativos (sinergia)', 'sinergia'),
 ('amikacina', 'Amikacina', 'Antibiótico', 'Aminoglucósido', 'amino', 'Se une al 30S: lectura errónea del ARNm', 'amino', 'Gramnegativos multirresistentes', 'multires-amino'),
 ('doxiciclina', 'Doxiciclina', 'Antibiótico', 'Tetraciclina', 'tetra', 'Se une al 30S e impide la entrada del ARNt', 'tetra', 'Rickettsiosis, clamidias y brucelosis', 'rickettsia'),
 ('tigeciclina', 'Tigeciclina', 'Antibiótico', 'Glicilciclina', 'glicil', 'Se une al 30S e impide la entrada del ARNt', 'tetra', 'Infecciones complicadas de piel e intraabdominales', 'tige'),
 ('azitromicina', 'Azitromicina', 'Antibiótico', 'Macrólido', 'macro', P50, 'p50', 'Neumonía atípica e infecciones por Chlamydia', 'atipica'),
 ('claritromicina', 'Claritromicina', 'Antibiótico', 'Macrólido', 'macro', P50, 'p50', 'Erradicación de H. pylori', 'hpylori'),
 ('clindamicina', 'Clindamicina', 'Antibiótico', 'Lincosamida', 'linco', P50, 'p50', 'Infecciones por anaerobios y de partes blandas', 'anaerobios'),
 ('linezolid', 'Linezolid', 'Antibiótico', 'Oxazolidinona', 'oxa', 'Se une al 50S e impide formar el complejo 70S', 'oxa', 'Infecciones por SAMR y enterococo resistente a vancomicina', 'erv'),
 ('ciprofloxacina', 'Ciprofloxacina', 'Antibiótico', 'Quinolona', 'quino', 'Inhibe la ADN girasa y la topoisomerasa IV', 'quino', 'Infecciones urinarias y gastroenteritis bacterianas', 'urinaria'),
 ('levofloxacina', 'Levofloxacina', 'Antibiótico', 'Quinolona', 'quino', 'Inhibe la ADN girasa y la topoisomerasa IV', 'quino', 'Neumonía de la comunidad y sinusitis', 'neumonia'),
 ('rifampicina', 'Rifampicina', 'Antibiótico', 'Rifamicina', 'rifa', 'Inhibe la ARN polimerasa dependiente de ADN', 'rifa', 'Tuberculosis y profilaxis de meningococo', 'tbc'),
 ('rifaximina', 'Rifaximina', 'Antibiótico', 'Rifamicina', 'rifa', 'Inhibe la ARN polimerasa dependiente de ADN', 'rifa', 'Encefalopatía hepática y diarrea del viajero', 'hepatica'),
 ('trimetoprima-sulfametoxazol', 'Trimetoprima/Sulfametoxazol', 'Antibiótico', 'Diaminopirimidina + sulfonamida', 'tmp', 'Bloquea en dos pasos la síntesis de ácido fólico', 'folato', 'Infecciones urinarias y neumonía por Pneumocystis', 'pjp'),
 ('metronidazol', 'Metronidazol', 'Antibiótico', 'Nitroimidazol', 'nitro', 'Se activa en anaerobios y daña el ADN', 'nitro', 'Anaerobios, tricomoniasis y vaginosis bacteriana', 'trico'),
 ('colistin', 'Colistin', 'Antibiótico', 'Polimixina', 'poli', 'Desplaza Ca y Mg del LPS y rompe la membrana externa', 'poli', 'Gramnegativos multirresistentes (último recurso)', 'ultimo'),
 ('nitrofurantoina', 'Nitrofurantoína', 'Antibiótico', 'Nitrofurano', 'nitrof', None, None, 'Cistitis no complicada', 'cistitis'),
 ('isoniazida', 'Isoniazida', 'Antibiótico', 'Antituberculoso de primera línea', 'tbc1', 'Inhibe la síntesis de ácidos micólicos', 'micol', 'Tuberculosis (tratamiento y profilaxis)', 'tbc'),
 ('etambutol', 'Etambutol', 'Antibiótico', 'Antituberculoso de primera línea', 'tbc1', 'Altera la síntesis de la pared de micobacterias', 'micol2', 'Tuberculosis (fase inicial)', 'tbc'),
]

OTROS = [
 ('fluconazol', 'Fluconazol', 'Antifúngico', 'Triazol', 'azol', 'Inhibe la lanosterol 14α-desmetilasa (síntesis de ergosterol)', 'azol', 'Candidiasis y criptococosis', 'candida'),
 ('voriconazol', 'Voriconazol', 'Antifúngico', 'Triazol', 'azol', 'Inhibe la lanosterol 14α-desmetilasa (síntesis de ergosterol)', 'azol', 'Aspergilosis invasiva', 'asperg'),
 ('caspofungina', 'Caspofungina', 'Antifúngico', 'Equinocandina', 'equino', 'Inhibe la glucano sintetasa de la pared fúngica', 'equino', 'Candidiasis invasiva', 'candida-inv'),
 ('anfotericina', 'Anfotericina B', 'Antifúngico', 'Polieno', 'polieno', 'Forma poros al unirse al ergosterol de la membrana', 'polieno', 'Micosis sistémicas graves', 'mico-grave'),
 ('aciclovir', 'Aciclovir', 'Antiviral', 'Análogo de nucleósido (antiviral)', 'nucl', 'Bloquea la ADN polimerasa viral', 'nucl', 'Herpes simple y herpes zóster', 'herpes'),
 ('ganciclovir', 'Ganciclovir', 'Antiviral', 'Análogo de nucleósido (antiviral)', 'nucl', 'Bloquea la ADN polimerasa viral', 'nucl', 'Infección por citomegalovirus (CMV)', 'cmv'),
 ('oseltamivir', 'Oseltamivir', 'Antiviral', 'Inhibidor de la neuraminidasa', 'neura', 'Inhibe la neuraminidasa e impide la liberación de los virus', 'neura', 'Gripe (influenza A y B)', 'gripe'),
 ('lopinavir-ritonavir', 'Lopinavir/Ritonavir', 'Antiviral', 'Inhibidor de la proteasa viral', 'prote', 'Inhibe la proteasa del VIH e impide madurar los viriones', 'prote', 'Infección por VIH', 'vih'),
 ('albendazol', 'Albendazol', 'Antiparasitario', 'Benzimidazol', 'benzi', 'Se une a la β-tubulina e impide formar microtúbulos', 'tubu', 'Hidatidosis y neurocisticercosis', 'hidatid'),
 ('benznidazol', 'Benznidazol', 'Antiparasitario', 'Nitroimidazol', 'nitro', 'Se reduce en el parásito y daña su ADN', 'nitro', 'Enfermedad de Chagas', 'chagas'),
 ('hidroxicloroquina', 'Hidroxicloroquina', 'Antipalúdico', '4-aminoquinolona', 'aminoq', 'Eleva el pH de la vacuola digestiva del parásito', 'vacuola', 'Malaria (profilaxis y tratamiento)', 'malaria'),
]

GIN_ROWS = [
 ('fx-oxitocina', 'Oxitocina', 'Hormona uterotónica', 'utero', 'Estimula las contracciones del músculo liso uterino', 'utero', 'Prevención de la hemorragia posparto', 'hpp'),
 ('fx-carbetocina', 'Carbetocina', 'Análogo sintético de la oxitocina, termoestable', 'carbet', 'Agonista sintético de la oxitocina: estimula las contracciones uterinas', 'utero', None, None),
 ('fx-metilergonovina', 'Metilergonovina', 'Alcaloide del cornezuelo (ergotínico)', 'ergot', 'Aumenta el tono y la frecuencia de las contracciones uterinas (efecto tetánico)', 'utero', 'Atonía uterina y hemorragia posparto', 'hpp'),
 ('fx-carboprost', 'Carboprost', 'Prostaglandina F2α', 'pgf', 'Provoca contracciones miometriales similares a las del trabajo de parto', 'utero', 'Hemorragia posparto refractaria por atonía', 'hpp'),
 ('fx-misoprostol', 'Misoprostol', 'Prostaglandina E1', 'pge', 'Análogo de la prostaglandina E1: uterotónico', 'utero', 'Maduración cervical e inducción del trabajo de parto', 'induccion'),
 ('fx-acido-tranexamico', 'Ácido tranexámico', 'Antifibrinolítico', 'antifib', 'Impide la unión del plasminógeno a la fibrina y estabiliza el coágulo', 'fibri', 'Hemorragia posparto (primeras 3 horas)', 'hpp'),
 ('fx-sulfato-magnesio', 'Sulfato de magnesio', 'Anticonvulsivante (profilaxis de eclampsia)', 'mg', 'Reduce la acetilcolina en la placa neuromuscular y deprime el sistema nervioso central', 'mgmec', 'Prevención y tratamiento de la eclampsia', 'eclampsia'),
 ('fx-labetalol', 'Labetalol', 'Bloqueante alfa y beta', 'labet', 'Bloquea receptores beta y alfa-1 adrenérgicos', 'ab', 'Crisis hipertensiva y preeclampsia grave', 'htn'),
 ('fx-nifedipina', 'Nifedipina', 'Antagonista del calcio', 'ca', 'Bloquea el ingreso de calcio al músculo liso vascular', 'calcio', 'Tocólisis en la amenaza de parto pretérmino', 'pretermino'),
 ('fx-metildopa', 'Alfa-metildopa', 'Antihipertensivo de acción central', 'central', 'Agonista alfa adrenérgico central: disminuye la resistencia periférica', 'alfa2', 'Hipertensión leve a moderada del embarazo', 'htn'),
 ('fx-betametasona', 'Betametasona', 'Corticoide', 'cortico', 'Glucocorticoide que acelera la maduración fetal', 'madura', 'Maduración pulmonar fetal ante riesgo de parto prematuro', 'pretermino'),
 ('fx-progesterona', 'Progesterona micronizada', 'Progestágeno', 'proges', None, None, 'Prevención del parto pretérmino (cuello corto o antecedente)', 'pretermino'),
 ('fx-clomifeno', 'Citrato de clomifeno', 'Modulador selectivo del receptor de estrógeno', 'serm', 'Bloquea el feedback negativo y aumenta las gonadotrofinas', 'ovul', 'Inducción de la ovulación (alternativa accesible)', 'ovulacion'),
 ('fx-cabergolina', 'Cabergolina', 'Agonista dopaminérgico', 'dopa', 'Agonista dopaminérgico: inhibe la secreción de prolactina', 'prl', 'Hiperprolactinemia', 'prl-uso'),
 ('fx-letrozol', 'Letrozol', 'Inhibidor de la aromatasa', 'arom', 'Inhibe la aromatasa: evita convertir andrógenos en estrógenos', 'arom', 'Inducción de la ovulación en SOP (primera elección)', 'ovulacion'),
 ('fx-metotrexato', 'Metotrexato', 'Antagonista del folato', 'folato-g', 'Inhibe la dihidrofolato reductasa y frena la síntesis de ADN', 'dhfr', 'Embarazo ectópico tubárico no roto, estable', 'ectopico'),
]


def main():
    vade = {d['id']: d for d in json.load(open(VADE, encoding='utf-8'))['drugs']}
    gin = {p['id']: p for p in json.load(open(GIN, encoding='utf-8'))['patologias']}
    drogas, faltan = [], []

    def nuevo(id_, n, fam, tipo, clase, cg, mec, mg, uso, ug, fuente):
        drogas.append({'id': id_, 'n': n, 'fam': fam, 'tipo': tipo, 'clase': clase, 'cg': cg, 'mec': mec, 'mg': mg, 'uso': uso, 'ug': ug, 'fuente': fuente})

    for fam, filas in (('atb', ATB), ('otros', OTROS)):
        for (sid, n, tipo, clase, cg, mec, mg, uso, ug) in filas:
            if sid not in vade: faltan.append(sid); continue
            nuevo(sid, n, fam, tipo, clase, cg, mec, mg, uso, ug, A)
    for (sid, n, clase, cg, mec, mg, uso, ug) in GIN_ROWS:
        if sid not in gin: faltan.append(sid); continue
        nuevo(sid, n, 'gin', 'Ginecología y Obstetricia', clase, cg, mec, mg, uso, ug, F)
    if faltan:
        print('FALTAN en las fuentes:', faltan); sys.exit(1)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out = {'version': 1, 'estado': 'borrador', 'revisado': False,
           'aviso': 'Etiquetas cortas redactadas a partir del vademécum AAFH 2024 y de las fichas FASGO/FDA; el campo "uso" es orientativo y no incluye dosis. Pendiente de revisión final.',
           'drogas': drogas}
    json.dump(out, open(OUT, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    from collections import Counter
    print(len(drogas), 'fármacos', dict(Counter(d['fam'] for d in drogas)))
    for m, g in (('clase', 'cg'), ('mec', 'mg'), ('uso', 'ug')):
        for fam in ('atb', 'otros', 'gin'):
            gs = set(d[g] for d in drogas if d['fam'] == fam and d[m])
            print(' ', m, fam, 'grupos distintos:', len(gs))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
