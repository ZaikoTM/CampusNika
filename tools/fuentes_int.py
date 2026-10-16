#!/usr/bin/env python3
"""Qué dicen las guías argentinas (DICE) y guías internacionales vigentes (INT) para cada calculadora.
Lo usa tools/fuentes_ar.py. Revisado el 2026-10-16: solo se afirma lo verificado en el texto del documento o en la fuente consultada;
donde no se verificó el contenido, la ficha lo dice. Para cambiar una guía por una más nueva basta editar este archivo y ejecutar fuentes_ar.py."""

# Qué dice cada guía argentina (leído del texto del documento)
DICE = {
    'erc-2022': ['Sugiere usar la ecuación CKD-EPI para estimar el filtrado glomerular en el primer nivel de atención, con creatinina estandarizada o trazable a IDMS (recomendación condicional; evidencia muy baja).'],
    'sap-hierro': ['Hemoglobina normal (entre paréntesis, el límite inferior de anemia) en g/dL: 6-23 meses 12,5 (11,0); 2-4 años 12,5 (11,0); 5-7 años 13,0 (11,5).',
                   'Tratamiento oral de elección: 3-6 mg/kg/día de hierro elemental en 1-3 tomas, con sulfato ferroso, lejos de las comidas.',
                   'Vía intramuscular: dosis que no excedan 1,5 mg/kg/día cada 2-3 días. Vía endovenosa (internado, hierro sacarato): no más de 2-3 mg/kg cada 2 días.'],
    'hpp-2019': ['HPP grave: pérdida de 1.000 mL o más, o cualquier pérdida que cause compromiso hemodinámico.',
                 'La estimación visual del sangrado es imprecisa y lo subestima: propone medirlo con una bolsa colectora calibrada.',
                 'Causas: las 4 T (tono, tejido, trauma, trombina). Manejo activo del alumbramiento: uterotónico (ocitocina) inmediato, tracción controlada del cordón y masaje uterino de 5 minutos (recomendación A).',
                 'En el texto revisado no figura un umbral de índice de shock: el valor ≥ 0,9 de la calculadora proviene de la bibliografía internacional.'],
    'hta-embarazo': ['Síndrome HELLP: trombocitopenia (plaquetas < 100.000/mm³) y evidencia de hemólisis con LDH aumentada (la guía usa LDH > 600 UI/L), junto con enzimas hepáticas elevadas.'],
    'kawasaki-2016': ['Inmunoglobulina endovenosa 2 g/kg en 10-12 h entre los días 5 y 10 de la enfermedad (clase I, evidencia A).',
                      'Ácido acetilsalicílico 80-100 mg/kg/día cada 6 h hasta 72 h afebril; luego 3-5 mg/kg/día por 6-8 semanas si no hay compromiso coronario.',
                      'Sin respuesta a las 36-48 h: segunda dosis de inmunoglobulina 2 g/kg; si persiste, metilprednisolona 30 mg/kg por 3 días; infliximab 5 mg/kg en dosis única como alternativa.'],
    'hta-2019': ['Diagnóstico de HTA con cifras ≥ 140/90 mmHg en al menos dos consultas de distintos días; una sola consulta ≥ 180/110 en una persona asintomática permite el diagnóstico salvo causa transitoria.',
                 'Objetivo primario en adultos de 18 a 79 años: presión en consultorio < 140/90 mmHg; se sugieren valores cercanos a 130/80 si se toleran, para reducir eventos cardiovasculares.'],
}

# Guías internacionales vigentes. v = vigencia; d = qué dice (solo lo verificado)
INT = {
    'ssc-2026': dict(t='Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2026', c='SCCM y ESICM. Crit Care Med e Intensive Care Med, 23 de marzo de 2026',
                     u='https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026', v='Vigente (2026). Reemplaza la edición 2021.',
                     d=['129 enunciados, 46 nuevos. Incorpora optimización de antibióticos, metas de presión arterial en adultos mayores, retiro de líquidos tras la reanimación y continuidad de cuidados al alta.',
                        'Sugiere usar una herramienta estandarizada de tamizaje de sepsis en lugar de no usarla (certeza de evidencia muy baja).']),
    'esc-af-2024': dict(t='2024 ESC Guidelines for the management of atrial fibrillation (con EACTS)', c='European Society of Cardiology, 2024',
                        u='https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2024/09/17/04/05/2024-ESC-guidelines-for-AF-esc-2024', v='Vigente (2024).',
                        d=['Propone el CHA₂DS₂-VA (sin el punto por sexo femenino): ≥ 2 puntos, anticoagulación recomendada (clase I); 1 punto, considerarla (clase IIa).',
                           'Permite evaluar el riesgo con herramientas validadas localmente o con el CHA₂DS₂-VA más otros factores de riesgo.']),
    'acs-2025': dict(t='2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes', c='Circulation, 27 de febrero de 2025',
                     u='https://doi.org/10.1161/CIR.0000000000001309', v='Vigente (2025). Se complementa con la guía de dolor torácico AHA/ACC 2021.',
                     d=['No se resumió qué dice sobre HEART o TIMI: consultá el texto original.', 'La política clínica de ACEP indica que el score HEART puede usarse como instrumento de predicción en dolor torácico.']),
    'pe-2026': dict(t='2026 AHA/ACC Guideline for the Evaluation and Management of Acute Pulmonary Embolism in Adults (con ACCP, ACEP, CHEST, SCAI, SHM, SIR, SVM y SVN)', c='Circulation y JACC, 19 de febrero de 2026',
                    u='https://www.acc.org/About-ACC/Press-Releases/2026/02/19/19/27/First-AHAACC-acute-pulmonary-embolism-guideline-prompt-diagnosis-and-treatment-are-key', v='Vigente (2026). Primera guía conjunta AHA/ACC de TEP.',
                    d=['Recomienda evaluar la probabilidad pretest de forma estructurada con Wells, Ginebra o PERC, combinada con estrategias de dímero D (umbral ajustado por edad, YEARS, incluida una versión para embarazo).',
                       'Angio-TC como estudio de elección; la ecocardiografía sirve para estratificar el ventrículo derecho, no para diagnosticar. Define categorías clínicas A-E.',
                       'No se verificó el texto exacto de las recomendaciones sobre cada score.']),
    'stroke-2026': dict(t='2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke', c='AHA/ASA. Stroke, 26 de enero de 2026',
                        u='https://doi.org/10.1161/STR.0000000000000513', v='Vigente (2026). Reemplaza la guía 2018 y su actualización 2019.',
                        d=['Para ACV menor no cardioembólico y AIT, su algoritmo de doble antiagregación usa ABCD², NIHSS y tiempo de inicio (por ejemplo NIHSS ≤ 3 con ABCD² ≥ 4).',
                           'Con déficit no incapacitante dentro de 4,5 h prefiere doble antiagregación a trombólisis. Verificá umbrales y clases de recomendación en el texto.']),
    'cap-ats-2025': dict(t='Diagnosis and Management of Community-Acquired Pneumonia', c='American Thoracic Society, julio de 2025 (reemplaza la guía ATS/IDSA 2019; no fue respaldada por IDSA)',
                         u='https://www.guidelinecentral.com/insights/nov-2025-atsidsa-cap-guideline-timeline/', v='Vigente (2025).',
                         d=['Ecografía pulmonar como alternativa aceptable a la radiografía si hay experiencia; sin antibióticos empíricos en ambulatorios sin comorbilidades con virus respiratorio positivo.',
                            'Tratamientos de menos de 5 días aceptables salvo casos graves; corticoides sugeridos en neumonía grave sin coinfección por influenza.',
                            'No se verificó cómo trata el CURB-65: las bandas 0-1 / 2 / 3-5 son las habituales de la escala original.']),
    'who-hpp-2025': dict(t='WHO consolidated guidelines on prevention and treatment of postpartum haemorrhage (con FIGO e ICM)', c='OMS, 5 de octubre de 2025 (ISBN 9789240115637)', v='Vigente (2025).',
                         d=['Actuar con pérdida ≥ 300 mL si hay un signo hemodinámico anormal (pulso > 100, índice de shock > 1, PAS < 100 o PAD < 60 mmHg), o con pérdida ≥ 500 mL, dentro de las 24 h del parto.',
                            'Recomienda medir la pérdida de sangre de forma objetiva con campos calibrados. 51 recomendaciones consolidadas.']),
    'acog-222': dict(t='Gestational Hypertension and Preeclampsia (Practice Bulletin 222)', c='ACOG, 2020', v='Sigue siendo la referencia de ACOG; no se halló una actualización 2025-2026. Se complementa con la guía ISSHP 2021.',
                     d=['No se resumió el contenido sobre HELLP: consultá el documento original.']),
    'kdigo-2024': dict(t='KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease', c='Kidney International 2024;105(4S):S117-S314', v='Vigente (2024). No se halló una revisión 2026.',
                       d=['La ecuación CKD-EPI 2021 de creatinina, sin coeficiente de raza, es el estándar para estimar el filtrado glomerular; se sugiere cistatina C si la creatinina es poco confiable o el eFG es limítrofe.',
                          'Estadifica por filtrado (G1 ≥ 90; G2 60-89; G3a 45-59; G3b 30-44; G4 15-29; G5 < 15 mL/min/1,73 m²) y por albuminuria: combinarlos predice mejor los resultados.']),
    'ada-2026': dict(t='Standards of Care in Diabetes-2026: Diagnosis and Classification of Diabetes', c='American Diabetes Association. Diabetes Care 2026;49(Suppl 1):S27-S49',
                     u='https://doi.org/10.2337/dc26-S002', v='Vigente (2026); se actualiza cada año.',
                     d=['La HbA1c es una de las pruebas aceptadas, junto con la glucosa plasmática. Criterios habituales: HbA1c ≥ 6,5 %, glucemia en ayunas ≥ 126 mg/dL, glucemia a las 2 h de la PTOG ≥ 200 o al azar ≥ 200 con síntomas (umbrales tomados de un resumen secundario: verificá en el documento).']),
    'wses-2020': dict(t='Jerusalem guidelines: diagnosis and treatment of acute appendicitis (actualización 2020)', c='World Society of Emergency Surgery. World J Emerg Surg 2020',
                      u='https://wjes.biomedcentral.com/articles/10.1186/s13017-020-00306-3', v='Última edición hallada (2020); no se encontró una actualización 2025.',
                      d=['Los scores AIR y Adult Appendicitis Score son los de mejor desempeño en adultos. Desaconseja usar Alvarado para confirmar apendicitis por su baja especificidad, aunque sí sirve para descartarla en pacientes de bajo riesgo.']),
    'acg-pa-2024': dict(t='ACG Guideline: Management of Acute Pancreatitis', c='Tenner S et al. Am J Gastroenterol 2024;119:419-437', u='https://doi.org/10.14309/ajg.0000000000002645', v='Vigente (2024).',
                        d=['No se resumió su postura sobre Ranson o BISAP. Un metaanálisis de 2024 (17 estudios) halló que Ranson tiene mayor sensibilidad (0,95 vs 0,67) y BISAP mayor especificidad (0,95 vs 0,74) para predecir gravedad.']),
}

CALC_INT = {
    'qsofa': ['ssc-2026'], 'sirs': ['ssc-2026'], 'sofa': ['ssc-2026'], 'pam': ['ssc-2026'], 'deficit-hco3': ['ssc-2026'],
    'cha2ds2-vasc': ['esc-af-2024'], 'has-bled': ['esc-af-2024'],
    'heart': ['acs-2025'], 'timi-nste': ['acs-2025'],
    'wells-tep': ['pe-2026'], 'perc': ['pe-2026'], 'geneva': ['pe-2026'],
    'abcd2': ['stroke-2026'], 'curb65': ['cap-ats-2025'],
    'indice-shock': ['who-hpp-2025'], 'hellp-tennessee': ['acog-222'],
    'ckd-epi': ['kdigo-2024'], 'clearance-24h': ['kdigo-2024'], 'prot-creat': ['kdigo-2024'],
    'hba1c-glu': ['ada-2026'], 'na-corregido': ['ada-2026'],
    'alvarado': ['wses-2020'], 'ranson': ['acg-pa-2024'], 'bisap': ['acg-pa-2024'], 'glasgow-imrie': ['acg-pa-2024'],
}
