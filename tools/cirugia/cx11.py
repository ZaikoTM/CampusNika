# -*- coding: utf-8 -*-
"""UP11 · Obstrucción urinaria baja y urología. El Giménez 2.ª ed. no trae urología: los algoritmos reordenan lo que ya dice cada ficha (guías EAU)."""
from base import I, A, F, D

CONTENIDO = {}

CONTENIDO['cx-hpb-obstruccion-urinaria-baja'] = dict(
    algoritmo=dict(titulo='Hiperplasia prostática benigna con síntomas urinarios bajos (guía EAU)', nodos=[
        I('Chorro débil, dificultad al iniciar, goteo, nocturia, urgencia y vaciado incompleto: historia, tacto rectal, sedimento de orina, residuo posmiccional y puntaje de síntomas'),
        D('¿Síntomas leves o poco molestos?',
          [F('Vigilancia activa y medidas conductuales (líquidos, cafeína, alcohol, revisar fármacos)')],
          [A('Alfabloqueantes como primera línea en síntomas moderados a graves'),
           D('¿Volumen prostático mayor de 40 mL con riesgo de progresión?',
             [A('Agregar un inhibidor de la 5-alfa reductasa (reduce la retención y la cirugía); tadalafilo o antimuscarínicos/β3 para los síntomas de llenado según el caso')],
             [A('Continuar el alfabloqueante')]),
           D('¿Complicación o falla del tratamiento médico (retención, infección, litiasis, deterioro renal)?',
             [F('Cirugía: RTU de próstata (30 a 80 mL); incisión transuretral (< 30 mL sin lóbulo medio); enucleación endoscópica o prostatectomía abierta (> 80 mL)')],
             [F('Control periódico')])]),
    ]),
)

CONTENIDO['cx-retencion-aguda-orina'] = dict(
    algoritmo=dict(titulo='Retención aguda de orina (guía EAU)', nodos=[
        I('Dolor suprapúbico con globo vesical palpable y percutible: ecografía vesical, función renal y orina'),
        A('Alivio inmediato con sondaje vesical uretral; si no es posible o hay lesión uretral, sonda suprapúbica'),
        A('Vigilar la diuresis posobstructiva y la hematuria ex vacuo; buscar la causa (HPB, estenosis uretral, litiasis, fármacos, estreñimiento)'),
        D('¿La causa es una HPB?',
          [A('Alfabloqueante y prueba sin sonda'),
           D('¿Recurre la retención?', [F('Cirugía')], [F('Control ambulatorio')])],
          [F('Tratar la causa que se identifique')]),
    ]),
)

CONTENIDO['cx-litiasis-urinaria-colico-renal'] = dict(
    algoritmo=dict(titulo='Cólico renal y litiasis urinaria (guía EAU)', nodos=[
        I('Dolor en flanco irradiado a la ingle, náuseas y hematuria: ecografía como primera imagen; TC sin contraste de baja dosis para confirmar; en el embarazo, ecografía'),
        D('¿Hay obstrucción infectada, anuria o riñón único?',
          [F('Descompresión urgente con catéter doble J o nefrostomía percutánea y antibióticos; diferir el tratamiento del cálculo hasta resolver la infección')],
          [A('Analgesia con AINE como primera elección (opioides como segunda línea)'),
           D('¿El cálculo es menor de 5 mm?',
             [F('Observación y control')],
             [A('Terapia expulsiva médica con alfabloqueantes en cálculos distales de 5 a 10 mm'),
              F('Intervención si no se expulsa: ureteroscopia o litotricia extracorpórea; nefrolitotomía percutánea en cálculos renales mayores de 20 mm')])]),
    ]),
)

CONTENIDO['cx-torsion-testicular'] = dict(
    algoritmo=dict(titulo='Escroto agudo y torsión testicular (guía EAU)', nodos=[
        I('Dolor escrotal súbito e intenso, náuseas y vómitos, testículo alto y horizontal, sin reflejo cremastérico: el diagnóstico es clínico'),
        D('¿Se sospecha torsión testicular?',
          [A('Exploración quirúrgica urgente (ventana de salvataje de 4 a 6 horas; obligatoria dentro de las 24 horas) con detorsión y orquidopexia; la ecografía Doppler no debe retrasar la cirugía'),
           F('Detorsión manual mientras se prepara la cirugía, sin retrasarla')],
          [F('Apéndice testicular: manejo conservador con analgesia y antiinflamatorios; cirugía si hay dudas o dolor persistente')]),
    ]),
)

CONTENIDO['cx-trauma-urogenital'] = dict(
    algoritmo=dict(titulo='Trauma urogenital (guía EAU)', nodos=[
        I('Hematuria visible o no visible con hipotensión, desaceleración, trauma penetrante o fractura pélvica: TC con contraste; uretrografía retrógrada ante sangre en el meato; cistografía retrógrada (300 a 350 mL) ante fractura pélvica con hematuria macroscópica'),
        D('¿Es una lesión renal?',
          [F('Manejo no operatorio en el contuso estable (vigilancia y reimagen); embolización si hay sangrado activo; exploración si hay inestabilidad')],
          [D('¿Es una lesión vesical?',
             [F('Intraperitoneal: reparación quirúrgica siempre; extraperitoneal simple: conservador con sonda')],
             [D('¿Es una lesión uretral posterior en un varón?',
                [F('Derivación suprapúbica y uretroplastia diferida (3 meses o más); evitar la uretroplastia inmediata')],
                [F('Uréter: reparación inmediata de las lesiones reconocidas; derivación con catéter doble J o nefrostomía en las tardías')])])]),
    ]),
)

CONTENIDO['cx-cancer-prostata-diagnostico'] = dict(
    algoritmo=dict(titulo='Diagnóstico del cáncer de próstata (guía EAU-EANM-ESTRO-ESUR-ISUP-SIOG)', nodos=[
        I('PSA (umbral habitual de 3 a 4 ng/mL) y tacto rectal'),
        D('¿El tacto rectal es sospechoso?',
          [A('Resonancia multiparamétrica o biopsia directa si hay sospecha de extensión extraprostática')],
          [D('¿El PSA está entre 3 y 10 ng/mL?',
             [A('Repetir a las 4 semanas; considerar la densidad de PSA y la resonancia')],
             [A('PSA elevado persistente: resonancia multiparamétrica antes de la biopsia')])]),
        A('Resonancia multiparamétrica antes de la biopsia: PI-RADS 3 a 5 justifica biopsia dirigida'),
        F('Clasificar con el grupo ISUP (Gleason 3+4 = grupo 2; 4+3 = grupo 3; 4+4 = grupo 4) y estadificar; tratamiento según riesgo y expectativa de vida: vigilancia activa, prostatectomía radical o radioterapia con o sin hormonoterapia'),
    ]),
)

NUEVAS = []
