# -*- coding: utf-8 -*-
"""UP11: fichas rehechas sobre el Manual de Urología de la Sociedad Chilena de Urología (SCHU), 3.ª ed. (2025). Se agregan por tandas, a medida que se lee cada capítulo."""
from base import I, A, F, D

CONTENIDO = {}
NUEVAS = []
U11 = 'UP11 · Obstrucción urinaria baja y urología'
P = lambda t: [{'titulo': t[0], 'pasos': [{'etiqueta': e, 'texto': x} for e, x in t[1]]}]
SCHU = lambda cap, tit, extra='': {'guia': 'Manual de Urología (SCHU), 3.ª ed., cap. %s: %s' % (cap, tit), 'sociedad': 'Sociedad Chilena de Urología (SCHU)', 'anio': '2025',
                                   'archivo': 'Manual de Urología SCHU 3ed (libro completo), cap. %s' % cap, 'tipo': 'libro',
                                   'nota': ('Manual de urología de referencia en español, más actual que Smith y Tanagho 18.ª ed. (2016). ' + extra).strip()}

# ---------------- hiperplasia prostática benigna (cap. 10) ----------------
CONTENIDO['cx-hpb-obstruccion-urinaria-baja'] = dict(
    algoritmo=dict(titulo='Síntomas urinarios bajos e hiperplasia prostática benigna (Manual SCHU 2025)', nodos=[
        I('Hombre con síntomas del tracto urinario inferior (LUTS): historia, examen físico con tacto rectal, orina, APE según el caso, IPSS, uroflujometría y volumen residual posmiccional; descartar otras causas de LUTS'),
        D('¿Síntomas leves y con mínimo impacto en la calidad de vida, sin complicaciones?',
          [F('Observación vigilada: información, estilo de vida (reducir líquidos antes de dormir, moderar cafeína y alcohol, micción relajada con doble vaciado) y control periódico con uroflujometría, residuo, IPSS y APE (el 85 % no progresa al año y el 65 % a los 5 años)')],
          [A('Síntomas moderados o con impacto: cambios de estilo de vida y tratamiento farmacológico, ajustando según la respuesta'),
           D('¿Predominan los síntomas de vaciado?',
             [A('Bloqueador alfa 1 (tamsulosina, silodosina, alfuzosina, doxazosina, terazosina): alivio en horas a días; si el volumen prostático es mayor de 40 mL o el APE mayor de 1,4 a 1,6 ng/mL, sumar un inhibidor de la 5 alfa reductasa (finasteride o dutasteride; efecto a los 6 a 12 meses) como terapia combinada'),
              A('Si hay síntomas de llenado: sumar antimuscarínico (si el residuo es menor de 150 mL) o mirabegron; tadalafilo en quienes tienen además disfunción eréctil')],
             [A('Síntomas de llenado: antimuscarínicos o agonistas beta 3, con control del residuo posmiccional')]),
           D('¿No mejora, no tolera el tratamiento médico, tiene complicaciones (retención, infección, litiasis vesical, hematuria, insuficiencia renal) o prefiere una solución definitiva?',
             [D('¿El volumen prostático es mayor de 70 a 80 cc?',
                [F('Adenomectomía abierta o enucleación endoscópica con láser')],
                [D('¿Es menor de 30 cc y sin lóbulo medio?',
                   [F('Incisión prostática transuretral (TUIP)')],
                   [F('RTU prostática monopolar o bipolar (30 a 80 cc) o ablación o enucleación con láser')])])],
             [F('Continuar el tratamiento médico con controles periódicos')])]),
    ]),
    fisiopatologia=[
        'El crecimiento prostático benigno (CPB) se hace clínicamente relevante cuando se asocia a síntomas del tracto urinario inferior (LUTS) molestos; no todos los hombres con CPB tienen LUTS y algunos con LUTS no tienen CPB (otras causas: hipoactividad o hiperactividad del detrusor, litiasis ureteral distal, poliuria nocturna, tumor vesical, dolor pelviano crónico, estenosis uretral, vejiga neurogénica, infección urinaria).',
        'La 5 alfa reductasa convierte la testosterona en dihidrotestosterona, el andrógeno principal del crecimiento prostático; los alfabloqueantes corrigen el componente dinámico (relajan el músculo liso del cuello vesical, la cápsula y la uretra prostática).',
    ],
    definicion='Crecimiento benigno de la próstata que, por obstrucción a la salida de la vejiga, produce síntomas del tracto urinario inferior (de vaciado, de llenado y posmiccionales) y puede complicarse con infección urinaria, litiasis vesical, hematuria, insuficiencia renal posrenal y retención urinaria aguda.',
    diagnostico=[
        'La evaluación clínica tiene tres objetivos: descartar otros diagnósticos, establecer la severidad de los síntomas (IPSS) e identificar a los pacientes con riesgo de progresión rápida y complicaciones que se beneficiarían de un tratamiento precoz.',
        'Complicaciones: infección urinaria, litiasis vesical, hematuria, insuficiencia renal posrenal y retención urinaria aguda; su frecuencia depende de la severidad de la obstrucción y del manejo oportuno.',
    ],
    estudios=[
        'Orina completa; APE: además de la pesquisa de cáncer, sin cáncer predice el tamaño prostático (más de 40 mL con APE mayor de 1,6, 2,0 y 2,3 ng/mL en hombres de más de 50, 60 y 70 años) y el riesgo de progresión, retención y cirugía; la guía EAU 2024 lo recomienda cuando el diagnóstico de cáncer cambia la conducta.',
        'Uroflujometría (flujo máximo, flujo promedio, volumen vaciado, patrón) y volumen residual posmiccional; el aumento del residuo puede indicar una vejiga descompensada aún poco sintomática.',
    ],
    tratamiento=[{'titulo': 'Tratamiento médico', 'pasos': [
        {'etiqueta': 'Observación', 'texto': 'LUTS leves a moderados sin complicaciones y poco molestos; el 85 % no progresa al año (65 % a los 5 años). Incluye información, tranquilizar sobre la ausencia de cáncer, estilo de vida y controles con uroflujometría, residuo, IPSS y APE.'},
        {'etiqueta': 'Alfabloqueantes', 'texto': 'Terazosina, doxazosina, tamsulosina, alfuzosina y silodosina, de eficacia comparable; subtipo 1A (70 % de los receptores prostáticos). Primera línea en LUTS moderados a severos con alivio rápido.'},
        {'etiqueta': 'Inhibidores de la 5 alfa reductasa', 'texto': 'Finasteride (tipo 2) y dutasteride (tipos 1 y 2): reducen el volumen de la glándula con mejoría a los 6 a 12 meses; indicados en próstatas mayores de 40 mL o con APE mayor de 1,4 a 1,6 ng/mL por el riesgo de progresión.'},
        {'etiqueta': 'Terapia combinada', 'texto': 'Alfabloqueante más inhibidor de la 5 alfa reductasa: alivio inmediato y prevención de la progresión a largo plazo.'},
        {'etiqueta': 'Otros', 'texto': 'Antimuscarínicos (oxibutinina, solifenacina, tolterodina, trospio, darifenacina, fesoterodina) en síntomas de llenado y no con residuo superior a 150 mL; tadalafilo (único IPDE5 aprobado para LUTS); mirabegron 50 mg (agonista beta 3) para urgencia.'},
    ]}, {'titulo': 'Tratamiento quirúrgico (decisión compartida)', 'pasos': [
        {'etiqueta': 'Adenomectomía abierta', 'texto': 'Vía transvesical (Freyer) o retropúbica (Millin); para volúmenes mayores de 70 a 80 cc y litiasis vesical concomitante; mejora síntomas en 63 a 86 % y el flujo máximo en 375 %, con estadía de unos 5 días y transfusión en 6,8 a 8,2 %; detrás de la enucleación endoscópica en las guías por su morbilidad.'},
        {'etiqueta': 'RTU prostática', 'texto': 'Monopolar o bipolar, para 30 a 80 cc; eyaculación retrógrada en el 65 %, disfunción eréctil en el 6,5 % y estenosis uretral en el 3,8 %.'},
        {'etiqueta': 'TUIP', 'texto': 'De elección en LUTS refractarios con próstata menor de 30 cc y sin lóbulo medio: dos incisiones del cuello vesical al veru montanum, sin resecar tejido.'},
        {'etiqueta': 'Láser', 'texto': 'Ablación (KTP, resultados similares a la RTU, retratamiento del 7,7 % a 5 años, seguro con anticoagulación) o enucleación endoscópica con láser (holmio y otros), que trata cualquier volumen; sin muestra para anatomía patológica en la ablación.'},
    ]}],
    seguimiento=['Controles periódicos con IPSS, uroflujometría, residuo posmiccional y APE tanto en observación como con tratamiento.'],
    banderas=[
        'Retención aguda, litiasis vesical, hematuria recurrente, infección recurrente o insuficiencia renal posrenal: indicación de cirugía.',
        'Evitar antimuscarínicos con residuo posmiccional mayor de 150 mL.',
        'El APE alto en un hombre con LUTS obliga a pensar en cáncer de próstata antes de atribuirlo al adenoma.',
    ],
    fuente=SCHU('10', 'Hiperplasia prostática benigna', 'Se conserva la guía EAU como fuente de referencia en los puntos de corte de volumen.'),
    contraste={'estado': 'coincide', 'fuente': 'Guía EAU de LUTS no neurogénicos', 'puntos': ['El manual SCHU sigue la guía EAU 2024 y sitúa la enucleación endoscópica por delante de la adenomectomía abierta en las guías.']},
)
