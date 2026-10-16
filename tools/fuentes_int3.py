#!/usr/bin/env python3
"""Tercera tanda (2026-10-16): contenido leído de los documentos completos o de páginas oficiales.
Se importa DESPUÉS de fuentes_int y fuentes_int2, así que corrige o completa lo anterior."""

# Qué dice cada guía argentina (leído del texto del documento)
DICE3 = {
    'sac-fanv': ['Documento de toma de posición (SAC y FAC, 2021) ante el informe N.º 9 de la CONETEC sobre anticoagulantes orales directos (ACOD) en FA no valvular. Señala que la FA es cerca del 60 % de las indicaciones de anticoagulación y que en el país se detecta poco, se anticoagula poco y con tiempos en rango terapéutico inadecuados.',
                 'Rechaza limitar los ACOD a pacientes con RIN fuera de rango en más del 50 % de las mediciones y que la indicación y renovación quede solo en hematología: sostiene que deben poder indicarlos cardiología, clínica médica, generalistas y neurología.',
                 'Adhiere a una reducción sensible del precio de los ACOD. No fija puntos de corte del CHA₂DS₂-VASc ni del HAS-BLED: para eso se usan las guías internacionales.'],
}

REF_AR3 = {
    'gpc-prenatal-2023': dict(t='Guía de Práctica Clínica: Atención prenatal de bajo riesgo. Actualización de ocho recomendaciones priorizadas', c='Ministerio de Salud de la Nación, 2023 (Resolución 4173/2023)',
                              u='https://salud.neuquen.gob.ar/wp-content/uploads/2024/08/GPC-Atencion-Prenatal-de-Bajo-Riesgo-2023.pdf', n='Copia publicada por el Ministerio de Salud de Neuquén.',
                              d=['Recomienda ecografía sistemática entre las semanas 19 y 24 en embarazos de bajo riesgo (fuerte a favor; certeza moderada).',
                                 'Sugiere una ecografía de rutina entre las semanas 11 y 13+6 para confirmar vitalidad fetal, edad gestacional y número de fetos (condicional a favor; certeza muy baja). No debe reemplazar la de las semanas 19-24; la Ley 27.611/2020 garantiza una ecografía morfológica entre las semanas 18 y 22.',
                                 'Recomienda suplementar con hierro (60 mg de hierro elemental) y ácido fólico (0,4 mg) por vía oral, en esquema diario (fuerte a favor; certeza moderada); el esquema intermitente solo si no se puede asegurar la toma diaria.',
                                 'Recomienda el testeo universal con PTOG para diabetes gestacional entre las semanas 24 y 28 (fuerte a favor; certeza baja).']),
}
CALC_AR3 = {'eg-fum': ['gpc-prenatal-2023'], 'eg-eco': ['gpc-prenatal-2023'], 'eg-discrepancia': ['gpc-prenatal-2023']}
CALC_AR3_ADD = {'anemia-oms': ['gpc-prenatal-2023']}

# Guías internacionales: se reemplazan por la versión con contenido leído
INT3 = {
    'ssc-2026': dict(t='Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2026', c='SCCM y ESICM. Crit Care Med e Intensive Care Med, 23 de marzo de 2026',
                     u='https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026', v='Vigente (2026). Reemplaza la edición 2021.',
                     d=['129 enunciados, 46 nuevos. Para adultos hospitalizados con enfermedad aguda, recomienda NEWS, NEWS2, MEWS o SIRS en lugar de qSOFA como herramienta única de tamizaje de sepsis (fuerte; certeza moderada).',
                        'Shock séptico: PAM inicial de 65 mmHg (fuerte; moderada); en mayores de 65 años sugiere 60-65 mmHg. Cristaloides como primera línea, con al menos 30 mL/kg en las primeras 3 h (condicional; baja) y preferencia por balanceados sobre solución salina 0,9 %.',
                        'Antimicrobianos de inmediato, idealmente dentro de la primera hora, ante shock séptico o sepsis probable o definida (fuerte; certeza muy baja). Sugiere medir lactato de forma seriada para guiar la reanimación.']),
    'esc-af-2024': dict(t='2024 ESC Guidelines for the management of atrial fibrillation (con EACTS)', c='European Society of Cardiology, 2024',
                        u='https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2024/09/17/04/05/2024-ESC-guidelines-for-AF-esc-2024', v='Vigente (2024).',
                        d=['Riesgo tromboembólico con el CHA₂DS₂-VA (sin el punto por sexo): ≥ 2 puntos, anticoagulación recomendada; 1 punto, considerarla. También pueden usarse herramientas validadas localmente.',
                           'Anticoagulantes orales para todos los pacientes elegibles, con preferencia por los directos sobre los antagonistas de la vitamina K (salvo válvula mecánica o estenosis mitral). Los antiagregantes no se recomiendan para prevenir ACV en FA.',
                           'Para evaluar el riesgo de sangrado, considerar el HAS-BLED: sirve para corregir factores modificables y para detectar a quienes tienen 3 o más puntos y necesitan controles más tempranos y frecuentes.']),
    'acs-2025': dict(t='2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes', c='Rao SV et al. J Am Coll Cardiol 2025;85(22):2135-2237 (también en Circulation, 27 de febrero de 2025)',
                     u='https://doi.org/10.1161/CIR.0000000000001309', v='Vigente (2025). Reemplaza las guías de IAMCEST 2013 y de SCASEST 2014. Los pathways de dolor torácico (donde figura HEART) siguen en la guía AHA/ACC 2021.',
                     d=['La troponina cardíaca es el biomarcador de elección, con preferencia por las de alta sensibilidad. Los protocolos con hs-cTn al ingreso (0 h) y a 1-2 h identifican pacientes de muy bajo riesgo (valor predictivo negativo > 99,5 %).',
                        'Los scores GRACE y TIMI (para SCASEST y para IAMCEST) están bien validados y pueden ayudar a decidir la conducta, pero no son herramientas diagnósticas: estratifican el riesgo en pacientes con ACS sospechado o confirmado.',
                        'La guía advierte que no hay evidencia suficiente de que usarlos de rutina en pacientes internados reduzca los eventos cardiovasculares. El score HEART no se nombra en el texto revisado: se encuadra en los pathways de la guía de dolor torácico 2021.']),
    'pe-2026': dict(t='2026 AHA/ACC Guideline for the Evaluation and Management of Acute Pulmonary Embolism in Adults (con ACCP, ACEP, CHEST, SCAI, SHM, SIR, SVM y SVN)', c='Circulation y JACC, 19 de febrero de 2026',
                    u='https://www.acc.org/About-ACC/Press-Releases/2026/02/19/19/27/First-AHAACC-acute-pulmonary-embolism-guideline-prompt-diagnosis-and-treatment-are-key', v='Vigente (2026). Primera guía conjunta AHA/ACC de TEP.',
                    d=['Evaluar la probabilidad pretest de forma estructurada (Wells, Ginebra, PERC): con probabilidad baja o intermedia (< 50 %) se mide dímero D, con umbral ajustado por edad o YEARS (incluida una versión para embarazo); PERC puede evitar el dímero D en probabilidad ultrabaja.',
                       'Angio-TC como estudio de elección; V/Q si no puede recibir contraste. La ecocardiografía sirve para estratificar el ventrículo derecho, no para diagnosticar.',
                       'Categorías clínicas A a E: A y B (pocos síntomas, bajo riesgo) a menudo pueden ser dados de alta desde urgencias; C a E requieren internación. Anticoagulantes directos preferidos sobre warfarina (no en el embarazo, donde se usa heparina).']),
    'stroke-2026': dict(t='2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke', c='AHA/ASA. Stroke, 26 de enero de 2026',
                        u='https://doi.org/10.1161/STR.0000000000000513', v='Vigente (2026). Reemplaza la guía 2018 y su actualización 2019.',
                        d=['Doble antiagregación (clopidogrel + aspirina por 21 días, luego un solo antiagregante) razonable (clase 2a) en ACV menor no cardioembólico con NIHSS ≤ 5 o AIT de alto riesgo (ABCD² ≥ 4) que consultan a las 24-72 h, o con NIHSS 4-5 dentro de las 24 h, sin trombólisis y con causa aterosclerótica presumida.',
                           'Trombólisis dentro de las 4,5 h del inicio (clase 1): tenecteplase 0,25 mg/kg (máx. 25 mg) o alteplase 0,9 mg/kg; ventana extendida razonable con penumbra salvable en imágenes de perfusión (clase 2a).',
                           'Tras la trombólisis, reducir la PAS intensivamente a menos de 140 mmHg no mejora la evolución (clase 3: sin beneficio) y tras una recanalización exitosa puede dañar (clase 3: daño).']),
    'cap-ats-2025': dict(t='Diagnosis and Management of Community-Acquired Pneumonia', c='American Thoracic Society, julio de 2025 (reemplaza la guía ATS/IDSA 2019; no fue respaldada por IDSA)',
                         u='https://contagionlive.com/view/2025-american-thoracic-society-clinical-practice-guideline-updates-for-the-diagnosis-and-management-of-community-acquired-pneumonia', v='Vigente (2025). El enlace es un resumen periodístico de la guía.',
                         d=['Ecografía pulmonar como alternativa aceptable a la radiografía o la TC cuando hay personal entrenado (condicional; evidencia baja).',
                            'Duración: 3 a 5 días en ambulatorios con comorbilidades e internados no graves que alcanzan estabilidad clínica (condicional); 5 días o más en neumonía grave (fuerte; evidencia baja).',
                            'Corticoides sistémicos: en contra en internados no graves (fuerte; baja); a favor, de forma condicional, en neumonía grave. El resumen consultado no nombra el CURB-65: las bandas 0-1 / 2 / 3-5 son las de la escala original.']),
    'acog-222': dict(t='Gestational Hypertension and Preeclampsia (Practice Bulletin 222)', c='ACOG. Obstet Gynecol 2020;135(6):e237-e260 (con corrección interina de las cifras de plaquetas y de las tablas de criterios)', u='https://kansaspqc.kdhe.ks.gov/acog-gestation-htn-and-preeclampsia-practice-bulletin',
                     v='Sigue siendo la referencia de ACOG; no se halló una actualización 2025-2026.',
                     d=['Síndrome HELLP: muchos clínicos usan LDH ≥ 600 UI/L, AST y ALT más de dos veces el límite superior normal y plaquetas < 100.000 (× 10⁹/L); es una de las formas más graves de preeclampsia, con mayor morbimortalidad materna.',
                        'Hipertensión gestacional: PAS ≥ 140 o PAD ≥ 90 mmHg en dos ocasiones separadas por al menos 4 horas después de las 20 semanas; es grave con PAS ≥ 160 o PAD ≥ 110.']),
    'kdigo-2024': dict(t='KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease', c='Kidney International 2024;105(4S):S117-S314', u='https://kdigo.org/guidelines/ckd-evaluation-and-management/', v='Vigente (2024). Hay una actualización focalizada de medicamentos en revisión pública hasta el 4 de noviembre de 2026.',
                       d=['La ecuación CKD-EPI 2021 de creatinina, sin coeficiente de raza, es el estándar para estimar el filtrado glomerular; se sugiere cistatina C si la creatinina es poco confiable o el eFG es limítrofe.',
                          'Estadifica por filtrado (G1 ≥ 90; G2 60-89; G3a 45-59; G3b 30-44; G4 15-29; G5 < 15 mL/min/1,73 m²) y por albuminuria: combinarlos predice mejor los resultados.']),
    'who-hpp-2025': dict(t='WHO consolidated guidelines on prevention and treatment of postpartum haemorrhage (con FIGO e ICM)', c='OMS, 5 de octubre de 2025 (ISBN 9789240115637)', v='Vigente (2025).',
                         d=['Actuar con pérdida ≥ 300 mL si hay un signo hemodinámico anormal (pulso > 100, índice de shock > 1, PAS < 100 o PAD < 60 mmHg), o con pérdida ≥ 500 mL, dentro de las 24 h del parto, con mayor vigilancia en las primeras 2 horas.',
                            'Recomienda medir la pérdida de sangre de forma objetiva con campos calibrados. 51 recomendaciones consolidadas.']),
}

INT3.update({
    'ada-2026': dict(t='Standards of Care in Diabetes-2026: Diagnosis and Classification of Diabetes', c='American Diabetes Association. Diabetes Care 2026;49(Suppl 1):S27-S49',
                     u='https://pmc.ncbi.nlm.nih.gov/articles/PMC12690183', v='Vigente (2026); se actualiza cada año.',
                     d=['El diagnóstico puede basarse en HbA1c o en glucosa plasmática (en ayunas, a las 2 h de una PTOG de 75 g, o al azar con síntomas clásicos o crisis hiperglucémica).',
                        'Valores (de un resumen secundario del texto 2026; verificá la tabla 2.1): diabetes con HbA1c ≥ 6,5 %, glucemia en ayunas ≥ 126 mg/dL, 2 h de PTOG ≥ 200 o al azar ≥ 200 con síntomas; prediabetes con HbA1c 5,7-6,4 %, ayunas 100-125 o PTOG 140-199 mg/dL.',
                        'Sin hiperglucemia inequívoca se requiere confirmación; la HbA1c debe medirse con un método certificado NGSP. La glucemia a las 2 h diagnostica más personas con prediabetes y diabetes que los cortes de ayunas o HbA1c.']),
    'easl-2024': dict(t='EASL-EASD-EASO Clinical Practice Guidelines on the management of MASLD', c='J Hepatol 2024;81:492-542 (versión conjunta en Diabetologia)', u='https://cris.haifa.ac.il/en/publications/easleasdeaso-clinical-practice-guidelines-on-the-management-of-me/', v='Vigente (2024).',
                      d=['Búsqueda de casos con tests no invasivos en personas con factores cardiometabólicos, enzimas hepáticas alteradas o esteatosis en imágenes, sobre todo con diabetes tipo 2 u obesidad con otro factor metabólico.',
                         'Abordaje escalonado: primero un score sanguíneo como el FIB-4 y luego elastografía. Cortes de un resumen secundario (verificá la figura del original): FIB-4 < 1,3 riesgo bajo (reevaluar cada 1-3 años); con FIB-4 ≥ 1,3 medir la rigidez hepática, con derivación desde 8,0 kPa; en mayores de 65 años el corte sería 2,0.',
                         'Un estudio de 2025 en 458 pacientes con biopsia halló que el FIB-4 solo tiene exactitud limitada para detectar fibrosis significativa.']),
    'acg-pa-2024': dict(t='ACG Guideline: Management of Acute Pancreatitis', c='Tenner S et al. Am J Gastroenterol 2024;119:419-437', u='https://doi.org/10.14309/ajg.0000000000002645', v='Vigente (2024).',
                        d=['Según resúmenes secundarios: hidratación temprana moderadamente agresiva con Ringer lactato (preferido sobre solución salina), con reevaluación frecuente; uso más prudente de imágenes, nutrición temprana, uso racional de antibióticos y momento quirúrgico estandarizado.',
                           'No se verificó su postura sobre Ranson o BISAP. Un metaanálisis de 2024 (17 estudios) halló que Ranson tiene mayor sensibilidad (0,95 vs 0,67) y BISAP mayor especificidad (0,95 vs 0,74) para predecir gravedad.']),
})

INT3.update({
    'isuog-fgr-2020': dict(t='ISUOG Practice Guidelines: diagnosis and management of small-for-gestational-age fetus and fetal growth restriction', c='Ultrasound Obstet Gynecol 2020;56:298-312 (doi 10.1002/uog.22134)', u='https://doi.org/10.1002/uog.22134', v='Edición 2020: no se halló una actualización.',
                           d=['RCIU precoz (< 32 sem): CA/PFE < p3 o flujo diastólico ausente en la arteria umbilical; o CA/PFE < p10 combinada con IP de uterinas y/o umbilical > p95. RCIU tardío (≥ 32 sem): CA/PFE < p3, o al menos dos de tres: CA/PFE < p10, cruce de más de 2 cuartiles, CPR < p5 o IP umbilical > p95 (consenso Delphi).',
                              'Interrupción según Doppler y cCTG: ductus venoso con onda a en la línea de base o por debajo o STV < 2,6 ms (26+0 a 28+6) / < 3,0 ms (29+0 a 31+6); flujo reverso o STV < 3,5 ms (32+0 a 33+6); flujo ausente o STV < 4,5 ms (desde 34+0); IP umbilical > p95 o CA/PFE < p3 (36+0 a 37+6); redistribución cerebral (38+0 a 39+0). Corticoides si se interrumpe antes de las 34+0 (grado B).',
                              'PEG tardío: programar el parto desde las 38+0 y no pasar las 39+0 semanas (grado A); crecimiento cada 2 semanas y Doppler semanal.']),
    'sego-1t-2021': dict(t='Guía de la exploración ecográfica del I trimestre', c='Guía de Asistencia Práctica de la Sección de Ecografía Obstétrico-Ginecológica de la SEGO, julio de 2021', u='https://bibliotecavirtual.sego.es/uploads/app/1297/elements/file/file1680162423.pdf', v='Vigente (2021).',
                         d=['La TN se mide con LCN de 45 a 84 mm (11+0 a 13+6 semanas), con equipo de gama media-alta, al menos 25 minutos de exploración y control de calidad. Se considera aumentada por encima del p95 o del p99 (3,5 mm); corte de alto riesgo del cribado combinado: mayor de 1 en 270.',
                            'El ADN fetal libre no está indicado con anomalías estructurales o TN > 3,5 mm. Se recomienda cribar preeclampsia junto con la ecografía del primer trimestre: la detección de la forma precoz (< 34 sem, 10 % de falsos positivos) es 58 % con la historia materna, 70 % con el IP de uterinas, 80 % con PAM + IP y 89 % con PAM + IP + PlGF.',
                            'El estudio ASPRE mostró que la aspirina en dosis ≥ 100 mg/noche antes de las 16 semanas reduce cerca de un 62 % la preeclampsia pretérmino. Hay calculadoras de riesgo online (FMF; Medicina Fetal Barcelona).']),
})
CALC_INT3 = {'pe-aspirina': ['acog-222', 'sego-1t-2021'], 'tn-lcn': ['sego-1t-2021'], 'uta-doppler': ['sego-1t-2021'], 'rciu-isuog': ['isuog-fgr-2020']}
NOTA_AR3 = {
    'pe-aspirina': 'Se revisó la guía argentina de hipertensión del embarazo (Ministerio de Salud): la ficha de preeclampsia cita el cribado combinado de las 11 a 13+6 semanas; no se verificó un criterio de aspirina distinto del de ACOG.',
    'tn-lcn': 'No se localizó una guía argentina específica sobre translucencia nucal; la referencia es la guía de la SEGO.',
    'uta-doppler': 'No se localizó una guía argentina específica sobre el Doppler de arterias uterinas.',
    'rciu-isuog': 'No se localizó una guía argentina específica vigente sobre RCIU: se usa la guía ISUOG 2020.',
}

# Guías por ficha clínica (sin calculadora): claves de REFS (argentinas) y de INT (internacionales)
FICHAS_GUIAS = {
    'obs-hipertension': {'ar': ['hta-embarazo'], 'int': ['acog-222']},
    'obs-rciu': {'ar': [], 'int': ['isuog-fgr-2020']},
    'obs-hpp': {'ar': ['hpp-2019'], 'int': ['who-hpp-2025']},
    'obs-anemia': {'ar': ['gpc-prenatal-2023'], 'int': ['who-hb-2024']},
    'obs-control-prenatal': {'ar': ['gpc-prenatal-2023'], 'int': ['acog-co700']},
    'obs-induccion-parto': {'ar': [], 'int': ['acog-cpg9']},
    'obs-dg': {'ar': ['gpc-prenatal-2023'], 'int': []},
    'cx-pancreatitis-aguda': {'ar': [], 'int': ['acg-pa-2024']},
    'cx-apendicitis-aguda': {'ar': [], 'int': ['wses-2020']},
    'cx-hemorragia-digestiva-alta': {'ar': [], 'int': ['acg-ugib-2021']},
    'cx-quemaduras': {'ar': [], 'int': ['aba-2024']},
    'cx-trombosis-venosa-profunda': {'ar': [], 'int': ['ash-dx-2018', 'ash-prof-2018']},
    'cx-hpb-obstruccion-urinaria-baja': {'ar': [], 'int': ['eau-2026']},
    'cx-evaluacion-preoperatoria': {'ar': [], 'int': ['acc-periop-2024']},
}
