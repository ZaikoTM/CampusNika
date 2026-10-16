# -*- coding: utf-8 -*-
"""Segunda parte del contenido nuevo de Ginecología (ver contenido.py). Los algoritmos se arman con variables intermedias para mantener claras las ramas."""
from contenido import I, A, D, F

# ---------------- obs-dg ----------------
_dg_si = [A('Diabetes gestacional: educación, plan alimentario (+300 kcal/día desde las 12 semanas) y automonitoreo'),
          D('¿Se alcanzan las metas en 1 a 2 semanas (ayunas 70-95, 1 h < 140, 2 h < 120 mg/dL)?',
            [A('Continuar las medidas; terminación a las 39-40+6 semanas si el control es bueno y la circunferencia abdominal fetal no supera el p90')],
            [A('Insulina: 0,1-0,2 U/kg (NPH basal con o sin bolos de rápida); terminación entre las 38 y 39+6 semanas')])]
_dg = dict(
    tamizaje=['Tamizaje universal con PTOG de 75 g entre las 24 y 28 semanas (GPC 2023: fuerte a favor); si no se hizo, puede hacerse después de la 28.',
              'Con múltiples factores de riesgo y PTOG negativa, considerar una segunda entre las 31 y 33 semanas.',
              'Valores compatibles con diabetes en el primer trimestre (ayunas ≥ 126, azar ≥ 200 con síntomas o ≥ 200 a los 120 min) se tratan como diabetes pregestacional.',
              'Antecedente de cirugía bariátrica: no hacer PTOG (dumping); usar glucemia en ayunas o automonitoreo capilar durante una semana.'],
    algoritmo=dict(titulo='Diabetes gestacional (Consenso FASGO 2024)', nodos=[
        I('Embarazada sin diabetes conocida'),
        D('Primer trimestre: ¿glucemia en ayunas ≥ 126, al azar ≥ 200 con síntomas o ≥ 200 a las 2 horas de la PTOG?',
          [F('Diabetes pregestacional: tratar como tal')],
          [A('Entre las 24 y 28 semanas: PTOG con 75 g de glucosa (segunda PTOG entre las 31 y 33 con múltiples factores de riesgo)')]),
        D('¿PTOG alterada? (IADPSG: ayunas ≥ 92, 1 h ≥ 180 o 2 h ≥ 153 mg/dL; ALAD: ayunas ≥ 100 o 2 h ≥ 140 mg/dL)', _dg_si, [F('Sin diabetes gestacional: control prenatal habitual')]),
    ]))

# ---------------- obs-anemia ----------------
_an_ferro = [A('Sulfato ferroso 600 mg/día (120 mg de hierro elemental) por vía oral, al menos hasta 3 meses después del parto o hasta normalizar las reservas'),
             A('Vía parenteral solo en hiperémesis o intolerancia grave')]
_an_otra = D('¿VCM > 100 con polilobocitos (megaloblástica)?', [A('Ácido fólico 1 mg/día por vía oral')],
             [A('Estudiar otras causas: hemoglobinopatías (beta talasemia) y anemia grave con leucopenia o trombocitosis')])
_anemia = dict(
    fisiopatologia=['Anemia fisiológica: el volumen plasmático aumenta cerca de 900 mL y la masa globular cerca de un 25 %, por lo que la hemoglobina y el hematocrito caen entre el 3.º y el 5.º mes (mínimos entre el 5.º y el 8.º).',
                    'Ferropénica: microcítica hipocrómica; la ferritina mide las reservas. Por ácido fólico: VCM > 100 con polilobocitos, sobre todo después de la semana 30 o en el puerperio.',
                    'En Argentina la hemoglobinopatía más común es la beta talasemia, con requerimientos de folatos muy aumentados y a veces ferropenia asociada.'],
    tamizaje=['GPC 2023: suplementar con hierro (60 mg de hierro elemental) y ácido fólico (0,4 mg) por vía oral en esquema diario a las embarazadas de bajo riesgo (fuerte a favor; certeza moderada).',
              'Hemoglobina en la primera consulta y en los controles; anemia si hay < 11 g/dL (OMS) o < 10,5 g/dL en el segundo trimestre (CDC).',
              'Prevención de defectos del tubo neural: ácido fólico antes de la concepción hasta la semana 12.'],
    algoritmo=dict(titulo='Anemia en el embarazo', nodos=[
        I('Hemoglobina < 11 g/dL o hematocrito < 33 %'),
        A('Hemograma, ferritina y ácido fólico según sospecha'),
        D('¿Microcítica hipocrómica con ferritina baja (ferropénica)?', _an_ferro, [_an_otra]),
    ]))

# ---------------- gin-ectopico ----------------
_ec_mtx = D('¿Cumple criterios para metotrexato (estable, embarazo no roto, sin contraindicaciones, masa < 3,5-4 cm sin actividad cardíaca)?',
            [A('Metotrexato IM: monodosis 50 mg/m² (β-hCG en los días 4 y 7: si cae < 15 %, segunda dosis) o doble dosis si la β-hCG es > 3000')],
            [D('¿β-hCG decreciente o estancada, en un caso muy seleccionado?',
               [A('Conducta expectante con β-hCG cada 48 horas (con β-hCG < 200 se resuelve espontáneamente en el 88 %)')],
               [F('Tratamiento quirúrgico')])])
_ectopico = dict(
    tamizaje=['β-hCG cuantitativa y ecografía transvaginal combinadas (sensibilidad 87-99 %, especificidad 94-99 %).',
              'β-hCG > 2000 mUI/mL sin embarazo intrauterino visible es altamente sospechosa de ectópico.',
              'β-hCG seriada a las 0 y 48 horas: ascenso ≥ 35 % sugiere embarazo intrauterino viable; descenso > 21 %, embarazo fallido; curva plana o ascenso < 35 %, ectópico o aborto.'],
    algoritmo=dict(titulo='Embarazo ectópico tubárico (FASGO 2025)', nodos=[
        I('Amenorrea, dolor y/o sangrado: β-hCG cuantitativa y ecografía transvaginal con Doppler'),
        D('¿Hay inestabilidad hemodinámica o sospecha de rotura?', [F('Cirugía de urgencia (laparoscopia de elección; laparotomía si hay inestabilidad)')], [_ec_mtx]),
    ]))

# ---------------- gin-sua ----------------
_sua_est = D('¿Sangrado agudo hemodinámicamente estable?',
             [A('Hormonal: ACO monofásico (30-35 µg de etinilestradiol) cada 8 h por 7 días y luego 1 por día durante 3 semanas, o acetato de medroxiprogesterona 20 mg cada 8 h')],
             [A('SUA crónico: AINE o ácido tranexámico oral 2-4 g/día por 5 días; DIU-LNG, progestágenos o ACO; análogo de GnRH como último recurso'),
              A('Tratar la anemia: es la causa más común de déficit de hierro')])
_sua = dict(
    algoritmo=dict(titulo='Sangrado uterino anormal (FASGO 2022)', nodos=[
        I('Descartar embarazo y evaluar el estado hemodinámico; clasificar la causa con PALM-COEIN'),
        D('¿Sangrado agudo con inestabilidad hemodinámica?',
          [A('Reanimación con cristaloides y sangre; ácido tranexámico 1 g en 100 mL en 10 minutos'),
           A('Taponaje con sonda Foley o gasas; embolización uterina y, rara vez, histerectomía de rescate')],
          [_sua_est]),
    ]),
    farmacos=['fx-acido-tranexamico'])

# ---------------- gin-endometriosis ----------------
_en_dolor = D('¿Dolor persistente, endometrioma > 5 cm o compromiso intestinal o urinario?',
              [A('Cirugía conservadora laparoscópica (escisión o ablación); SIU-LNG; tercer nivel: danazol, gestrinona o análogos de GnRH con add-back')],
              [A('Continuar y seguir la respuesta con escalas de dolor')])
_endo = dict(
    algoritmo=dict(titulo='Endometriosis (FASGO 2019)', nodos=[
        I('Dolor pélvico menstrual invalidante y progresivo o dificultad para el embarazo: ecografía transvaginal y/o resonancia de pelvis'),
        D('¿Busca embarazo de inmediato?',
          [A('No dar tratamiento médico supresor: no mejora los resultados y retrasa la gestación'),
           A('Cirugía o reproducción asistida según el caso; los análogos de GnRH 3 a 6 meses antes de la FIV pueden mejorar las tasas')],
          [A('Analgesia con AINE con o sin paracetamol'),
           A('Gestágenos continuos (dienogest 2 mg/día, desogestrel 75 µg, noretisterona 2,5 mg) o anticonceptivos combinados'),
           _en_dolor]),
    ]))

# ---------------- gin-amenorreas ----------------
_am_hiper = D('¿Hay hiperandrogenismo?',
              [A('Estudiar SOP, hiperplasia suprarrenal no clásica y tumores ováricos o suprarrenales')],
              [A('Causa funcional (la más frecuente en las secundarias): corregir el ejercicio excesivo, la dieta y el estrés')])
_am_prl = D('¿Prolactina elevada?',
            [A('Estudiar hiperprolactinemia y RM de silla turca')],
            [A('FSH y LH: FSH elevada → hipogonadismo hipergonadotrófico (cariotipo); FSH y LH bajas o normales → origen hipotálamo-hipofisario'),
             A('Prueba de progesterona: sangrado en 14 días indica normoestrogenismo con útero que responde'),
             _am_hiper])
_amen = dict(
    algoritmo=dict(titulo='Amenorreas primaria y secundaria', nodos=[
        I('Sin menarca a los 16 años, o ausencia de menstruación por más de 3 meses: β-hCG, TSH y prolactina'),
        D('¿β-hCG positiva?', [F('Embarazo')], [_am_prl]),
    ]))

# ---------------- gin-miomatosis ----------------
_mio_si = D('¿Desea conservar la fertilidad?',
            [A('Miomectomía (laparotómica, laparoscópica, histeroscópica o transvaginal)')],
            [A('Médico: ácido mefenámico, anticonceptivos o progestágenos; análogos de GnRH (transitorios)'),
             A('Embolización de arterias uterinas en sintomáticos sin deseo quirúrgico; histerectomía como tratamiento definitivo')])
_mioma = dict(
    algoritmo=dict(titulo='Miomatosis uterina', nodos=[
        I('Mioma diagnosticado por ecografía'),
        D('¿Sintomático (sangrado, dolor, compresión, infertilidad) o con sospecha de malignización?', [_mio_si],
          [F('Conducta expectante: más del 70 % solo requiere seguimiento; en la menopausia los miomas dejan de crecer')]),
    ]))

# ---------------- gin-adenomiosis ----------------
_adeno = dict(
    algoritmo=dict(titulo='Adenomiosis', nodos=[
        I('Útero aumentado, sangrado uterino anormal o dismenorrea: ecografía transvaginal con Doppler y/o resonancia'),
        D('¿Desea embarazo?',
          [A('DIU de levonorgestrel (primera elección) o dienogest oral continuo; el sangrado suele recurrir a los 6 meses de suspender')],
          [A('DIU de levonorgestrel para el sangrado (no es curativo)'),
           A('Histerectomía (única curativa) o embolización uterina si hay contraindicación quirúrgica')]),
    ]))

# ---------------- gin-tamizaje-ccu ----------------
_cc_vph = D('¿VPH positivo?',
            [D('¿Citología ASC-US o mayor?', [A('Colposcopía y biopsia dirigida')], [A('Repetir el VPH a los 12 meses; si sigue positivo, colposcopía')])],
            [F('Repetir el test de VPH cada 5 años')])
_ccu = dict(
    tamizaje=['Inicio: a los 3 años del comienzo de la actividad sexual o desde los 25 años. No usar el test de VPH en menores de 30 años (infecciones transitorias, sobrediagnóstico).',
              'Fin: a los 65 años con VPH o a los 70 con solo citología, si hubo pruebas negativas previas y sin antecedentes de patología.',
              '30 años o más: tamizaje primario con test de VPH; si es negativo, repetir cada 5 años (toma dirigida o autotoma con cepillo vaginal).'],
    algoritmo=dict(titulo='Tamizaje de cáncer de cuello uterino (Nueva Guía 2022)', nodos=[
        I('Mujer que inicia el tamizaje (3 años del inicio de relaciones o desde los 25 años)'),
        D('¿Tiene 30 años o más?', [A('Test de VPH como tamizaje primario'), _cc_vph],
          [A('Citología (Papanicolaou) anual; tras dos anuales negativas consecutivas, cada 3 años')]),
        A('Finalizar a los 65 años con VPH o a los 70 con citología, con pruebas previas negativas'),
    ]))

# ---------------- obs-control-prenatal ----------------
_cp = dict(
    calculadora='eg-fum',
    tamizaje=['Primera consulta (antes de las 12 semanas): grupo y factor, hemoglobina, glucemia, orina completa y urocultivo, VDRL, VIH con consentimiento, hepatitis B, Chagas, toxoplasmosis, examen ginecológico con citología y colposcopía, examen odontológico y mamario.',
              'Ecografía: sistemática entre las semanas 19 y 24 (fuerte); entre la 11 y la 13+6 se sugiere (condicional). La Ley 27.611/2020 garantiza una ecografía morfológica entre las semanas 18 y 22 (GPC 2023).',
              'PTOG con 75 g entre las 24 y 28 semanas; hierro (60 mg) y ácido fólico (0,4 mg) diarios por vía oral (GPC 2023).',
              'Anti-D entre las 28 y 32 semanas en Rh negativas no sensibilizadas; cultivo de EGB entre las 35 y 37 semanas.'],
    algoritmo=dict(titulo='Control prenatal de bajo riesgo: calendario', nodos=[
        I('Control precoz, antes de las 12 semanas'),
        A('Primera consulta: laboratorio básico, serologías, examen ginecológico con citología, examen odontológico y mamario; ácido fólico'),
        A('11 a 13+6 semanas: ecografía de datación y vitalidad; cribado combinado de preeclampsia y aneuploidías'),
        A('19 a 24 semanas: ecografía morfológica'),
        A('24 a 28 semanas: PTOG con 75 g; anti-D entre las 28 y 32 en Rh negativas'),
        A('35 a 37 semanas: cultivo de estreptococo del grupo B'),
        D('¿Embarazo múltiple, preeclampsia, hemorragias u otros factores de riesgo?',
          [F('Control de alto riesgo')],
          [F('Control habitual: mensual hasta las 31+6, cada 15 días hasta las 36+6 y luego semanal; mínimo 5 controles')]),
    ]))

CONTENIDO2 = {'obs-dg': _dg, 'obs-anemia': _anemia, 'gin-ectopico': _ectopico, 'gin-sua': _sua, 'gin-endometriosis': _endo, 'gin-amenorreas': _amen,
              'gin-miomatosis': _mioma, 'gin-adenomiosis': _adeno, 'gin-tamizaje-ccu': _ccu, 'obs-control-prenatal': _cp}
