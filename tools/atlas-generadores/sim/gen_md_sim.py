import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
R = lambda p: json.load(open(p, encoding='utf8'))
def et(n): return str(n) if float(n).is_integer() else (str(int(n)) + ' bis')
INTRO = {
 'anamg': dict(nombre='Anamnesis ginecológica', archivo='ANAMNESIS_GINECOLOGICA', fuente='«Guía de TP N.º 1 · Anamnesis gineco-obstétrica» (lista de cotejo de anamnesis ginecológica)',
   como=['**Casos (8):** vaginitis candidiásica, sangrado uterino anormal por miomatosis con anemia, endometriosis, síndrome de ovario poliquístico (amenorrea), sangrado postmenopáusico, control de rutina con PAP, enfermedad pélvica inflamatoria y síndrome climatérico.',
         '**La paciente responde** cuando el alumno pregunta (voz y texto): cada respuesta sale del caso y la **historia clínica se completa en pantalla**, con un **familigrama** que se dibuja al final.',
         '**3D:** torso femenino con aparato reproductor (útero, ovarios, trompas, vejiga, pelvis); la estructura relacionada con la última pregunta gineco-obstétrica (menarca, relaciones, paridad, ITS, FUM, anticoncepción) **se ilumina**.',
         '**Mesa:** historia clínica, lapicera, mesa y sillas, hoja de familigrama; distractores: espéculo, camilla ginecológica, estudios ya pedidos.'],
   dudas=['El ítem «Induce o interrumpe el relato con preguntas o aportes» figura en la lista de cotejo **sin negación**. Lo interpreté como conducta a **evitar** (se evalúa «no interrumpe ni induce»). ¿Es correcto o la cátedra lo evalúa de otra forma?',
          'La lista no define **pasos críticos ni criterios de desaprobación**. Propuse: comunicación (1, 2, 6, 7), enfermedad actual (4, 5, 8-10), antecedentes gineco-obstétricos (16-23) y otros antecedentes/familigrama (24-30). ¿Cuáles son los reales?',
          'El inciso «Pregunta (si amerita el caso) uso de anticoncepción»: ¿en qué casos «amerita» (edad fértil, sin menopausia)? Hoy se pide en todos.',
          '¿Qué datos mínimos se esperan en los **datos filiatorios** (nombre, edad, DNI, domicilio, estado civil, ocupación, cobertura)?',
          'Fórmula obstétrica: ¿la cátedra usa **G P C A** o **G P A**? ¿Cómo se pregunta la paridad?',
          '¿Qué se espera del **familigrama**: cuántas generaciones, símbolos y enfermedades a consignar?'],
   critic=True),
 'anamo': dict(nombre='Anamnesis obstétrica', archivo='ANAMNESIS_OBSTETRICA', fuente='«Guía de TP N.º 1 · Anamnesis gineco-obstétrica» (lista de cotejo de anamnesis obstétrica)',
   como=['**Casos (8):** primigesta de 12 semanas, hipertensión crónica con preeclampsia previa, diabetes pregestacional, Rh negativo con aborto previo, adolescente con embarazo no deseado y violencia, cardiopatía valvular con cesárea previa, antecedente de tuberculosis con tabaquismo y embarazo de término sin patología.',
         '**La embarazada responde** a cada pregunta y la historia clínica se completa en pantalla (carnet perinatal, FUM y EG, embarazos previos, antecedentes, hábitos, grupo y factor, vacunas, peso y tensión arterial).',
         '**3D:** torso con **abdomen gestante** (la panza crece según la edad gestacional del caso), útero, feto y placenta.',
         '**Mesa:** carnet perinatal, historia clínica, balanza, tensiómetro, mesa y sillas; distractores: espéculo y Doppler fetal.'],
   dudas=['La lista agrupa en un solo ítem sub-elementos (TBC, DBT, HTA, preeclampsia, cirugías previas, infertilidad, cardiopatías y otras; tabaco, alcohol, drogas y violencia; vacunas antirrubeólica, antitetánica y antigripal). Los modelé como **un paso por grupo** (22 pasos). ¿La cátedra los evalúa por separado?',
          'Sin criterios de desaprobación definidos. Propuse: carnet perinatal y FUM (6, 7), antecedentes de riesgo (12, 13, 14), grupo y factor y vacunas (18, 19), peso y tensión arterial (20, 21). ¿Cuáles son los reales?',
          'Vacunación: ¿qué esquema exacto espera la cátedra (dTpa desde la semana 20, antigripal en cualquier trimestre, antirrubeólica contraindicada)?',
          '¿Se pregunta por grupo y factor sanguíneo **antes o después** de la toma de peso y tensión, según la lista? Hoy sigue el orden de la planilla.',
          'Actividad física y laboral: ¿qué cantidad de horas semanales se considera aceptable/riesgosa?'],
   critic=True),
 'egfpp': dict(nombre='Cálculo de EG y FPP', archivo='CALCULO_EG_FPP', fuente='«Guía de TP N.º 1 · Cálculo de EG y FPP» (no incluye lista de cotejo: la secuencia de pasos es **propuesta**)',
   como=['**Casos (8):** cálculos con la FUM en distintos meses (cruce de año, febrero, marzo), un embarazo de término, un postérmino, **FUM dudosa con ecografía precoz** y **ciclos de 35 días** (corrección de la FUM).',
         '**El alumno escribe el resultado** («la EG es de 16 semanas y 3 días», «la FPP es el 21 de noviembre»): el simulador **verifica los números**; un valor distinto es una acción incorrecta (grave).',
         '**3D:** abdomen gestante cuyo tamaño crece con la EG del caso, más un **gestograma** (línea de tiempo de 280 días con trimestres, FUM, hoy y FPP) y la historia clínica que se completa.',
         '**Mesa:** gestograma (disco), calendario, bolígrafo/cuadernillo, calculadora, carnet perinatal.'],
   dudas=['La guía **no trae lista de cotejo**. Los 9 pasos que propuse son: FUM, confiabilidad de la FUM, corrección por ciclos largos, fecha de la consulta, días transcurridos, EG en semanas y días, FPP por Naegele, ecografía precoz si la FUM es dudosa, clasificación y registro. ¿La cátedra evalúa otra secuencia o usa el gestograma?',
          'Regla de Naegele: la planilla usa **FUM + 7 días − 3 meses (+1 año)**. Para FUM de enero a marzo, ¿la cátedra enseña «+9 meses»? (Es equivalente.)',
          '¿Se acepta la FPP como **280 días** o hay que usar siempre Naegele? (Pueden diferir en 1 a 3 días.)',
          'Corrección por ciclos de 35 días y por ecografía: ¿qué umbral de discrepancia exige la cátedra (más de 7 días antes de las 14 semanas)?',
          'Clasificación: pretérmino < 37, término 37 a 41+6, postérmino ≥ 42; trimestres 1.º hasta 13+6, 2.º hasta 27+6, 3.º desde 28. ¿Coincide con la cátedra?'],
   critic=False),
 'exgin': dict(nombre='Examen ginecológico, toma de PAP y tacto bimanual', archivo='EXAMEN_GINECOLOGICO', fuente='«Guía de TP N.º 2 · Examen ginecológico (toma de PAP y tacto bimanual)» (lista de cotejo de 27 ítems)',
   como=['**Casos (7):** examen normal (primer PAP), ectropión, cervicitis mucopurulenta/EPI, pólipo endocervical, atrofia posmenopáusica, candidiasis y lesión sospechosa del cuello (friable, sangrante).',
         '**3D:** corte sagital de la pelvis femenina (útero, ovarios, trompas, vejiga, vagina) con el **espéculo bivalvo** que se introduce rotando 90°, se abre y se retira; **espátula de Ayre** (giro de 360°) y **citobrush**; dedos del tacto bimanual y mano abdominal sobre el hipogastrio.',
         '**Vistas en pantalla:** «vista externa» de los genitales (los labios se separan al entreabrir) y «vista especular» del cuello con el aspecto propio del caso, los portaobjetos y el fijador.',
         '**Mesa:** guantes, lámpara de pie, sábana, camilla ginecológica, espéculo, espátula de Ayre, citobrush, portaobjetos, fijador en spray, orden de PAP; distractores: gel lubricante, histerómetro, pinza de Pozzi, colposcopio, hisopo.'],
   dudas=['Paso 10: «apoyándolo sobre la horquilla, **ligeramente inclinado hacia la izquierda**, y a medida que se introduce se lo **rota 90° en sentido de las agujas del reloj**». ¿Es el movimiento correcto para una operadora diestra? ¿Qué se evalúa exactamente?',
          'Paso 11: «presionando la valva superior con el pulgar de la **mano izquierda**»: ¿la cátedra supone examinadora diestra?',
          '¿Se humedece el espéculo con agua tibia o solución fisiológica? (Propuse que **el gel lubricante es un criterio grave** porque altera la citología.)',
          'Sin criterios de desaprobación definidos. Propuse: información, intimidad y bioseguridad (4, 6, 7), técnica del espéculo (10, 11, 12, 16), toma y fijación del PAP (13, 14, 15), tacto bimanual (19, 20) y descarte (22). ¿Cuáles son los reales?',
          'Orden de las muestras: **exocérvix (espátula de Ayre) primero y endocérvix (citobrush) después**, cada una en un portaobjetos. ¿Hay variantes en la cátedra (un solo portaobjetos, citología en base líquida)?',
          'Hallazgos del tacto bimanual: ¿qué espera la cátedra que el alumno informe (posición, tamaño, consistencia, movilidad y dolor del útero; anexos; fondos de saco; dolor a la movilización del cuello)?'],
   critic=True),
 'exobs': dict(nombre='Examen obstétrico', archivo='EXAMEN_OBSTETRICO', fuente='«Guía de TP N.º 2 · Examen obstétrico» (lista de cotejo de semiología obstétrica, 19 ítems)',
   como=['**Casos (7):** 36 semanas normal, 28 semanas normal, **AU menor a la esperada** (34 semanas, 28 cm), **AU mayor** (32 semanas, 38 cm) con presentación podálica, **situación transversa**, 40 semanas con cabeza encajada y presentación podálica a las 30 semanas.',
         '**3D:** abdomen gestante con **útero, feto, placenta y cordón**; **cinta obstétrica** que se fija en el pubis y se desliza hasta el fondo; **manos con guante** que hacen las **4 maniobras de Leopold**; **estetoscopio de Pinard** con latido sonoro y conteo de 1 minuto.',
         '**En pantalla:** altura uterina medida, **curva de incremento de la AU** con la medición anterior y la nueva, y hallazgos de cada maniobra según el caso.',
         '**Mesa:** cinta obstétrica, estetoscopio de Pinard, reloj con segundero, gráfico de la curva, carnet perinatal, camilla, alcohol en gel; distractores: estetoscopio común, cinta de costura, espéculo, Doppler y balanza.'],
   dudas=['Orden de los pasos: en la planilla la **auscultación con Pinard (13) va entre la 2.ª y la 3.ª maniobra** y el paso 15 es «mirar hacia los pies». Se respetó el orden de la planilla. ¿Es correcto?',
          'Sin criterios de desaprobación definidos. Propuse: medición de la AU (5-8), registro en la curva (10), maniobras de Leopold (11, 12, 14, 16) y auscultación (13). ¿Cuáles son los reales?',
          'Valores de referencia de la **curva de AU** (percentilos 10 y 90 de Fescina): ¿qué tabla usa la cátedra? Yo usé AU ≈ semanas entre las semanas 20 y 34, con una banda de −3 a +3,5 cm.',
          'FCF normal: 110 a 160 lpm. ¿La cátedra usa 120-160?',
          'Encajamiento en la 4.ª maniobra: ¿qué se informa («dedos convergen» = no encajada; «divergen» = encajada)?',
          'En la **situación transversa**, ¿qué debe decir el alumno en la maniobra 1 y 3 (fondo y excavación vacíos)?'],
   critic=True),
 'exmam': dict(nombre='Examen mamario', archivo='EXAMEN_MAMARIO', fuente='«Guía de TP N.º 3 · Examen mamario» (lista de cotejo de 18 ítems)',
   como=['**Casos (7):** mama normal, **fibroadenoma** (nódulo móvil), **carcinoma** (nódulo duro, piel de naranja, retracción del pezón y adenopatías axilares), **mastopatía fibroquística**, **galactorrea**, **secreción hemática unilateral** (papiloma) y **mastitis lactacional**.',
         '**3D:** torso femenino con **mamas, areola, pezón, tubérculos de Montgomery, red venosa de Haller** y la **glándula con sus nódulos** por transparencia; la **mano palpa por cuadrantes** (del pezón a la periferia y de regreso) en ambas mamas, presiona el pezón (con secreción de distinto color) y lo eleva con la areola; el **autoexamen** se muestra con círculos, tiras verticales y cuña.',
         '**En pantalla:** pictograma de la postura (manos en la cintura / brazos en alto), **mapa de cuadrantes** de ambas mamas que se completa y marca el nódulo hallado.',
         '**Mesa:** bata, biombo, alcohol en gel, camilla, guía del autoexamen; distractores: mamógrafo, gel de ecografía, aguja de punción.'],
   dudas=['Sin criterios de desaprobación definidos. Propuse: información, lavado de manos e intimidad (4, 5), inspección en dos posiciones (6, 7, 8), palpación por cuadrantes (11), pezón (12, 13, 14) y autoexamen (15). ¿Cuáles son los reales?',
          'El paso 4 une «informa sobre el procedimiento» y «procede al lavado de manos». Lo modelé como **un solo paso** con ambos componentes. ¿Es correcto?',
          '¿La cátedra espera que se palpe la **axila** y la fosa supraclavicular también en decúbito, o solo se inspecciona (paso 7)?',
          'Técnica de palpación: la planilla menciona cuadrantes desde el pezón a la periferia; ¿se acepta también el método de **tiras verticales** (espiral)?',
          'Autoexamen: ¿qué día del ciclo (7-10 días del primer día de la menstruación o los días siguientes al sangrado) y con qué frecuencia (mensual)?',
          'Secreciones: ¿qué clasificación espera la cátedra (lechosa, serosa, serohemática, hemática, purulenta)?'],
   critic=True),
}
def generar(id):
    I = INTRO[id]; d = R(f'data/acreditaciones/sim/{id}.json'); ins = R(f'data/acreditaciones/sim/instrumental_{id}.json')
    L = []; w = L.append
    w(f"# Revisión clínica · {I['nombre']} (SIM)\n")
    w(f"Estado: **BORRADOR para validar con NotebookLM** contra {I['fuente']} y la bibliografía de la cátedra. Todo lo marcado con ❓ es una decisión mía que necesita confirmación clínica.\n")
    w('## Cómo funciona el simulador\n')
    for t in I['como']: w('- ' + t)
    w(f"\nFuente de la lista: {d['fuente']}. Pasos: **{len(d['pasos'])}** (incluye los pasos que aparecen solo en algunos casos). Casos: **{len(d['casos'])}**. Preguntas de fundamentos: **{len(d['fundamentos'])}**.\n")
    w('## Criterios de desaprobación (PROPUESTOS ❓)\n')
    w(d.get('criterios_texto', '') + '\n')
    for c in d.get('criterios', []): w(f"- {c['ico']} **{c['titulo']}** — pasos {', '.join(str(x) for x in c['pasos'])}")
    crit = [et(p['n']) for p in d['pasos'] if p['critico']]
    w(f"\nPasos que el simulador marca como críticos ❓: {', '.join(crit) if crit else 'ninguno'}\n")
    w('## Dudas puntuales para NotebookLM\n')
    for i, t in enumerate(I['dudas'], 1): w(f'{i}. {t}')
    w('\n## Casos clínicos\n')
    for c in d['casos']:
        extra = f" — {', '.join(c['extra'])}" if c.get('extra') else ''
        w(f"**{c['id']} · {c['nombre']} ({c['edad']} años){extra}**  ")
        w(f"Motivo: {c['motivo']}  ")
        w(f"Antecedentes: {c['antecedentes']}\n")
    w('## Mesa de instrumental\n')
    for g in ins['grupos']:
        w(f"**{g['titulo']}**")
        for i in ins['items']:
            if i['grupo'] == g['id']:
                m = '✅ correcto' + (' · CRÍTICO' if i.get('critico') else '') + (' · opcional' if i.get('opcional') else '') if i['correcto'] else '❌ distractor'
                w(f"- {i['nombre']} — {m}. {i['descripcion'] if i['correcto'] else i.get('feedback', '')}")
        w('')
    w('## Acciones incorrectas que reconoce el chat\n')
    for x in d['distractores']: w(f"- {'🚨 GRAVE · ' if x['critico'] else ''}{x['texto']} — {x['porque']}")
    w('\n## Pasos, fundamento y frase del alumno modelo\n')
    ej = d['casos'][0]['id']
    for p in d['pasos']:
        fr = (p.get('frases_caso') or {}).get(ej) or p['frase']
        w(f"**{et(p['n'])}. {p['texto']}**{' ⚠ crítico' if p['critico'] else ''}{' *(solo en algunos casos)*' if (p.get('solo_si') or p.get('sin_si') or p.get('solo_contra')) else ''}  ")
        w(f"Fundamento: {p['explica']}  ")
        w(f"Frase modelo: “{fr}”\n")
    w('## Preguntas de fundamentos\n')
    for i, q in enumerate(d['fundamentos'], 1): w(f"{i}. {q['q']}  \n   Respuesta correcta: **{q['o'][q['c']]}**. {q['e']}")
    open(f"REVISION_CLINICA_SIM_{I['archivo']}.md", 'w', encoding='utf8').write('\n'.join(L) + '\n')
    print('MD', id, len(L), 'lineas')
for k in INTRO: generar(k)
