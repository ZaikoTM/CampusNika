# -*- coding: utf-8 -*-
"""Algoritmos de manejo (2026-10-21), segunda tanda. Reordenan lo que ya dice la fuente de cada ficha; no suman datos nuevos."""
from contenido import I, A, F, D

# ---------------- gin-etg (Consenso FASGO ETG) ----------------
_etg_ntg = D('¿Score pronóstico (FIGO/OMS) de 0 a 6?',
             [A('Bajo riesgo: monoquimioterapia con metotrexato 1 mg/kg IM los días 1, 3, 5 y 7, con ácido folínico los días 2, 4, 6 y 8; 2.ª línea actinomicina D'),
              A('Continuar hasta negativizar la β-hCG y dar 1 ciclo de consolidación'),
              F('Seguimiento mensual con β-hCG durante 12 meses; nuevo embarazo después de los 12 meses')],
             [D('¿Score ≥ 13 (ultra alto riesgo)?',
                [A('EMA/PE (etopósido, metotrexato, actinomicina / etopósido y cisplatino), o iniciar con EMA/CO y rotar'),
                 F('Con 3 ciclos de consolidación; el embarazo no se recomienda de por vida')],
                [A('Alto riesgo (≥ 7): poliquimioterapia EMA/CO (etopósido, metotrexato, actinomicina / ciclofosfamida y vincristina), sin demorar los ciclos'),
                 F('3 ciclos de consolidación tras negativizar; seguimiento mensual 18 meses; embarazo después de los 18 meses')])])
_etg = dict(
    algoritmo=dict(titulo='Embarazo molar y neoplasia trofoblástica gestacional', nodos=[
        I('Sospecha de mola (sangrado, útero grande, hiperémesis, preeclampsia precoz, imagen en «tormenta de nieve», β-hCG muy alta)'),
        A('Evacuación uterina por AMEU o dilatación y raspado, en quirófano, con vía venosa, sangre isogrupo y control ecográfico; sin oxitocina ni prostaglandinas previas; anti-D si es Rh negativa'),
        A('β-hCG semanal hasta 2 valores negativos y luego mensual hasta completar 6 meses'),
        D('¿Hay neoplasia (≥ 3 valores crecientes > 10 % en 14 días, ≥ 4 en meseta en 21 días, coriocarcinoma o β-hCG positiva a los 6 meses)?',
          [A('Estudios de extensión: radiografía o TAC de tórax, TAC abdominopelviana, TAC o RM de cerebro; punción lumbar solo si el score es ≥ 13 y hay signos neurológicos'),
           _etg_ntg],
          [F('Remisión: anticonceptivos orales (elección); esperar 6 meses para un nuevo embarazo tras mola completa')]),
    ]))

# ---------------- obs-ehp ----------------
_ehp = dict(
    algoritmo=dict(titulo='Embarazada Rh negativa: inmunoprofilaxis anti-D', nodos=[
        I('Primera consulta: grupo ABO, Rh (sin investigar D débil), fenotipo y Coombs indirecta; grupo y Rh de la pareja'),
        D('¿La Coombs indirecta es positiva?',
          [A('Ya está sensibilizada: no corresponde la profilaxis; identificar y titular el anticuerpo y hacer seguimiento serológico'),
           F('Evaluar el tratamiento antenatal')],
          [D('¿La mujer es D negativo no sensibilizada?',
             [A('Profilaxis sistemática entre las 28 y 32 semanas: 1 dosis de ≥ 250 µg de anti-D IM o IV'),
              D('¿Hubo un episodio sensibilizante (aborto, ectópico, procedimiento invasivo, sangrado, trauma)?', [A('1.er trimestre: ≥ 100 µg; 2.º y 3.er trimestre: ≥ 250 µg, IM o IV')], [A('Continuar el control habitual')]),
              A('Al nacer, sangre de cordón al recién nacido: ABO, D con D débil y Coombs directa'),
              D('¿El recién nacido es D positivo?', [F('Anti-D posparto dentro de las 72 horas: ≥ 300 µg IM o IV (≥ 250 µg si se cuantificó la hemorragia fetomaterna)')], [F('No corresponde la dosis posparto')])],
             [F('D positivo: sin inmunoprofilaxis')])]),
    ]))

# ---------------- obs-vih ----------------
_vih_parto = D('¿Carga viral indetectable entre las semanas 34 y 36, con TAR sostenido y buena adherencia?',
               [F('Puede intentarse el parto vaginal, sin zidovudina IV')],
               [F('Cesárea electiva a las 38 semanas con zidovudina IV desde 3 horas antes (2 mg/kg la primera hora y luego 1 mg/kg/h hasta el clampeo)')])
_vih = dict(
    algoritmo=dict(titulo='Gestante con VIH: prevención de la transmisión perinatal', nodos=[
        I('Cribado universal de VIH en la gestación y retesteo a las 32 semanas en las negativas; ARN viral si hay sospecha de período ventana'),
        A('Carga viral, CD4, hemograma, perfil hepático, proteinuria y cribado de ITS; test de resistencia si hubo exposiciones previas'),
        D('¿Ya recibe tratamiento antirretroviral?',
          [A('No suspender: ajustar con el infectólogo evitando fármacos con niveles bajos en el 2.º y 3.er trimestre')],
          [D('¿Es un diagnóstico tardío (final del 2.º o 3.er trimestre)?',
             [A('TAR urgente priorizando un inhibidor de integrasa (dolutegravir o raltegravir)')],
             [A('TAR lo antes posible, aun en el primer trimestre: 2 análogos (tenofovir/emtricitabina) + dolutegravir, raltegravir o un inhibidor de proteasa potenciado')])]),
        A('Carga viral a las 34–36 semanas para decidir la vía de parto'),
        _vih_parto,
        A('Parto: mantener las membranas íntegras el mayor tiempo posible; evitar la sonda de Foley y la metilergonovina con inhibidores de proteasa'),
        F('Posparto: lactancia contraindicada (inhibirla) y profilaxis antirretroviral en el recién nacido'),
    ]))

# ---------------- obs-torch ----------------
_torch = dict(
    algoritmo=dict(titulo='Serologías de la primera consulta prenatal', nodos=[
        I('Primera consulta: VDRL, toxoplasmosis (IgG), Chagas, HBsAg, VIH e IgG de rubéola'),
        D('¿Toxoplasmosis: IgM positiva (infección aguda)?',
          [A('Espiramicina 3 g/día hasta la semana 15–18; PCR en líquido amniótico para ver la infección fetal'),
           A('Si el feto está infectado: pirimetamina con ácido folínico más sulfadiazina')],
          [A('IgG negativa: prevención (carne bien cocida, lavar verduras, evitar heces de gato) y serología cada 2–3 meses')]),
        D('¿Chagas positivo (2 pruebas)?', [A('No se trata durante el embarazo; estudiar al recién nacido')], [A('Sin conducta específica')]),
        D('¿HBsAg positivo?', [A('Al recién nacido, en las primeras 12 horas: inmunoglobulina específica 0,5 ml más vacuna 0,5 ml IM')], [A('Vacunar a la embarazada con factores de riesgo')]),
        D('¿Cultivo de introito y recto positivo para estreptococo B a las 35–37 semanas?',
          [A('No tratar la colonización antes del parto'), F('Profilaxis intraparto: penicilina G 5.000.000 UI EV y luego 2.500.000 UI cada 4 h; ampicilina si no hay penicilina; clindamicina si hay alergia')],
          [A('Sin profilaxis, salvo hijo previo con infección por EGB, bacteriuria por EGB, fiebre intraparto, RPM ≥ 18 h o parto prematuro')]),
        D('¿Rubéola: IgG negativa?', [F('Vacunar en el puerperio (la vacuna no se da en el embarazo)')], [A('Inmune: sin conducta')]),
    ]))

# ---------------- obs-covid ----------------
_cov = dict(
    algoritmo=dict(titulo='Gestante o puérpera con COVID-19', nodos=[
        I('Evaluar con CURB-65 o criterios ATS/IDSA, fiebre persistente > 38 °C, radiografía de tórax y marcadores de severidad'),
        D('¿Cumple criterios de ingreso (neumonía, marcadores de gravedad, CURB-65 ≥ 1 o motivos obstétricos)?',
          [A('Internar con abordaje multidisciplinario; HBPM profiláctica durante toda la internación'),
           D('¿Necesita corticoides por neumonía grave?', [A('Dexametasona 6 mg/12 h EV por 48 horas')], [A('Si hay riesgo de parto pretérmino, betametasona 12 mg IM, 2 dosis')])],
          [A('Manejo ambulatorio con pautas de alarma y control')]),
        D('¿La situación materna es grave o crítica?', [F('Cesárea; si la gestante está estable, la infección no es indicación de adelantar el parto')], [F('Parto según indicación obstétrica, preferentemente superado el período de contagio')]),
        A('Lactancia permitida con aislamiento de gotas, mascarilla e higiene de manos; HBPM al alta (mínimo 10 días o hasta 6 semanas posparto con otros factores)'),
    ]))

# ---------------- gin-infertilidad ----------------
_inf = dict(
    algoritmo=dict(titulo='Pareja que no logra el embarazo', nodos=[
        I('12 meses de relaciones sin protección (6 meses si la mujer tiene 35 años o más): estudio simultáneo y escalonado de la pareja'),
        A('Interrogatorio de ambos (regularidad menstrual, cirugías pelvianas, EPI, tóxicos, edad, IMC) y examen físico'),
        A('Mujer: FSH, LH y estradiol del día 2 al 4, prolactina, TSH, AMH, ecografía transvaginal con recuento de folículos antrales y cultivos cervicovaginales'),
        A('Varón: espermograma con abstinencia de 2 a 7 días (concentración, movilidad y morfología)'),
        D('¿La mujer ovula (ciclos regulares)?', [A('Histerosalpingografía en la primera fase del ciclo (permeabilidad tubaria)')], [A('Estudiar la causa de la anovulación (SOP, hiperprolactinemia, tiroides, insuficiencia ovárica)')]),
        F('Con los resultados, definir el tratamiento específico o derivar a reproducción asistida (consensos FASGO)'),
    ]))

# ---------------- gin-masa-anexial ----------------
_masa = dict(
    algoritmo=dict(titulo='Masa anexial', nodos=[
        I('β-hCG en edad fértil, examen pélvico con bimanual y rectovaginal; ecografía transvaginal con Doppler (O-RADS, IOTA o RMI/ROMA)'),
        D('¿Tiene signos de malignidad (sólida irregular, ≥ 4 papilas, ascitis, flujo intratumoral, multilocular irregular > 10 cm)?',
          [A('CA 125 (y HE4); en menores de 40 años pensar en células germinales (hCG, LDH, αFP, inhibina)'), F('Derivar de inmediato a ginecología oncológica: cirugía por oncólogo')],
          [D('¿Es una lesión de bajo riesgo (unilocular o septada simple, asintomática)?',
             [F('Seguimiento ecográfico sin cirugía; no hace falta medir marcadores')],
             [A('Riesgo intermedio: ecografía y CA 125 cada 4 semanas durante 3 meses'),
              F('Si el riesgo aumenta, derivar a oncología; en posmenopáusicas puede ser preferible la cirugía (laparoscopia con extracción en bolsa)')])]),
    ]))

# ---------------- gin-hiperplasia-endometrio ----------------
_hip_atip = D('¿Tiene deseo de fertilidad?',
              [A('Tratamiento hormonal y reevaluación histológica cada 3 meses, al menos durante 1 año'), F('Descartar un adenocarcinoma coexistente antes de elegir esta opción')],
              [F('Histerectomía; conservar o extirpar los ovarios según edad, deseo, historia familiar y comorbilidades')])
_hip = dict(
    algoritmo=dict(titulo='Hiperplasia de endometrio', nodos=[
        I('Metrorragia de causa desconocida, sangrado posmenopáusico o endometrio engrosado: biopsia de endometrio (al menos 15 días después de la menstruación)'),
        D('¿Hay atipia?', [_hip_atip],
          [D('¿Desea fertilidad?',
             [A('Inductores de la ovulación seguidos de progestágenos')],
             [A('Manejo hormonal (no es indicación de histerectomía): progestágenos en la segunda mitad del ciclo; anticonceptivos combinados en adolescentes y premenopáusicas sexualmente activas'),
              F('Control histológico periódico: la compleja sin atipia revierte sola en el 56 %')])]),
    ]))

# ---------------- gin-polipo-endometrial ----------------
_pol = dict(
    algoritmo=dict(titulo='Pólipo endometrial', nodos=[
        I('Sospecha en la ecografía transvaginal (sangrado anormal o hallazgo)'),
        D('¿Es sintomático (sangrado)?',
          [A('Polipectomía histeroscópica (nunca a ciegas) con visión directa y estudio histológico')],
          [A('Repetir la ecografía transvaginal posmenstrual tras 4–6 ciclos antes de operar'), F('Si persiste, polipectomía histeroscópica')]),
        A('El carcinoma de endometrio es más frecuente en quienes tuvieron adenomas: controlar a la posmenopáusica con pólipos repetidos'),
    ]))

CONTENIDO4 = {'gin-etg': _etg, 'obs-ehp': _ehp, 'obs-vih': _vih, 'obs-torch': _torch, 'obs-covid': _cov, 'gin-infertilidad': _inf,
              'gin-masa-anexial': _masa, 'gin-hiperplasia-endometrio': _hip, 'gin-polipo-endometrial': _pol}
