# -*- coding: utf-8 -*-
"""Contenido nuevo de las flashcards de Ginecología y Obstetricia (2026-10-16): screening/prevención, fisiopatología, algoritmos de manejo y fármacos.
Los algoritmos reordenan lo que ya dice la fuente de cada ficha (consenso o apunte) en forma de decisión; el screening y la fisiopatología provienen de la misma
fuente o de ACOG PB 222, ISUOG 2020, GAP SEGO 2021, GPC Atención prenatal de bajo riesgo 2023 y FASGO HPP 2019 (leídos completos). Revisar antes de tomar como definitivo."""

def I(t): return {'t': 'inicio', 'txt': t}
def A(t): return {'t': 'accion', 'txt': t}
def F(t): return {'t': 'fin', 'txt': t}
def D(t, si, no): return {'t': 'decision', 'txt': t, 'si': si, 'no': no}

NOTA = 'Secciones agregadas el 16/10/2026 (screening, fisiopatología, algoritmo y fármacos): reordenan esta misma fuente y se completan con las guías citadas; revisar con el docente antes de tomarlas como definitivas.'

CONTENIDO = {
    'obs-hipertension': dict(
        calculadora='pe-aspirina',
        fisiopatologia=['La preeclampsia nace de un fallo de la transformación fisiológica de las arterias espiraladas en el primer trimestre o principios del segundo, o de lesiones vasculares de la placenta: limita el flujo uteroplacentario.',
                        'Esa isquemia uteroplacentaria crónica se manifiesta en la unidad fetoplacentaria como restricción del crecimiento, oligohidramnios, desprendimiento de placenta y compromiso fetal, y aumenta el riesgo de parto prematuro espontáneo o indicado.',
                        'Intervienen factores angiogénicos (sFlt-1, PlGF y endoglina soluble) y el daño endotelial: de ahí el compromiso renal, hepático, neurológico y hematológico (ACOG 222).'],
        tamizaje=['Primer trimestre (11 a 13+6 semanas): cribado combinado con factores maternos, presión arterial media, IP de arterias uterinas y PlGF. Con un 10 % de falsos positivos detecta cerca del 89 % de las preeclampsias precoces (< 34 sem) (GAP SEGO 2021).',
                  'Por la ficha: alto riesgo si el riesgo es ≥ 1:100 para preeclampsia < 37 semanas o ≥ 1:50 para < 34 semanas con el algoritmo FMF → aspirina 150 mg por la noche de las 12 a las 36 semanas.',
                  'Cribado por factores clínicos (ACOG 222): aspirina 81 mg/día entre las 12 y las 28 semanas (mejor antes de las 16) si hay un factor de alto riesgo (preeclampsia previa, embarazo múltiple, hipertensión crónica, diabetes, enfermedad renal, enfermedad autoinmune) o más de un factor moderado.',
                  'El Doppler de uterinas por sí solo tiene bajo valor predictivo (ACOG); el estudio ASPRE mostró que la aspirina antes de las 16 semanas reduce cerca de un 62 % la preeclampsia pretérmino.',
                  'Medir la presión y buscar proteinuria en cada control prenatal: hipertensión es ≥ 140/90 mmHg en dos ocasiones separadas por al menos 4 horas después de las 20 semanas.'],
        algoritmo=dict(titulo='Embarazada con hipertensión después de las 20 semanas', nodos=[
            I('Presión ≥ 140/90 mmHg después de las 20 semanas: hemograma con plaquetas, función renal, hepatograma y proteinuria; evaluar el estado fetal'),
            D('¿Presión ≥ 160/110 mmHg o signos de gravedad (cefalea, alteraciones visuales, dolor epigástrico, plaquetas < 100.000, creatinina o transaminasas elevadas, edema pulmonar)?',
              [A('Emergencia hipertensiva: internar y bajar la presión'),
               A('Labetalol 20 mg EV (40 mg a los 10 min y luego 80 mg), o nifedipina 20 mg VO cada 30 min (máx. 5 dosis), o hidralazina 5 mg EV cada 20 min'),
               A('Sulfato de magnesio: ataque 4 g EV y 1 g/h por 24 horas; vigilar reflejo patelar y diuresis'),
               D('¿Hay criterios de interrupción (hipertensión refractaria, eclampsia, HELLP o compromiso fetal)?', [F('Estabilizar a la madre y finalizar el embarazo')], [A('Corticoides si < 34 semanas y reevaluar con frecuencia')])],
              [D('¿La presión se mantiene ≥ 140/90 mmHg?',
                 [A('Antihipertensivo oral: labetalol, nifedipina de liberación prolongada o alfa-metildopa; meta < 140/90 con diastólica no menor de 70'), A('Suspender IECA, ARA-II, espironolactona y atenolol')],
                 [A('Vigilancia estrecha clínica, de laboratorio y fetal')]),
               A('Preeclampsia sin criterios de gravedad: finalizar a las 37 semanas (ACOG)')])]),
        farmacos=['fx-sulfato-magnesio', 'fx-labetalol', 'fx-nifedipina', 'fx-metildopa', 'fx-hidralazina']),

    'obs-hpp': dict(
        fisiopatologia=['Las 4 T explican la causa: Tono (atonía uterina), Tejido (restos y adherencias placentarias), Trauma (lesiones del tracto genital) y Trombina (trastornos de la coagulación).',
                        'La pérdida suele subestimarse hasta en un 50 %: los cambios fisiológicos del embarazo (aumento del volumen plasmático) hacen que una gestante sana tolere hasta un 10 % de la volemia sin signos.',
                        'La taquicardia y la vasoconstricción periférica son los signos más precoces de shock; el índice de shock (frecuencia cardíaca ÷ PAS) es normal entre 0,7 y 0,9 en obstetricia y es el predictor más preciso de hipovolemia.',
                        'El fibrinógeno es el indicador de laboratorio más sensible de la pérdida; su caída refleja pérdida, fibrinólisis y hemodilución (valores < 200 mg/dL predicen gravedad). La acidosis y la hipotermia empeoran la coagulopatía.'],
        tamizaje=['Prevención: manejo activo del alumbramiento en todos los partos (recomendación A): uterotónico inmediato, tracción controlada del cordón y masaje uterino durante 5 minutos.',
                  'Medir la pérdida con bolsa colectora calibrada (la estimación visual es imprecisa) y vigilar signos vitales y el índice de shock.',
                  'Preparar el kit de código rojo (pinzas, balones intrauterinos, sueros, ácido tranexámico de 2 g y uterotónicos) y compatibilizar a las pacientes en riesgo.'],
        algoritmo=dict(titulo='Hemorragia posparto: manejo estratégico (FASGO 2019)', nodos=[
            I('Pérdida > 500 mL en parto vaginal o > 1.000 mL en cesárea, o cualquier pérdida con signos de hipovolemia'),
            A('Activar el código rojo y pedir ayuda; dos vías de calibre 14-18, oxígeno, monitoreo y laboratorio (hemograma, coagulación, fibrinógeno, lactato, grupo y factor)'),
            A('Control inicial: verificar que la placenta salió íntegra, masajear el útero y examinar cuello y vagina con valvas'),
            D('¿El útero está atónico (tono)?',
              [A('Uterotónicos: oxitocina, carbetocina 100 µg EV, misoprostol 600 µg VO o metilergonovina 0,2 mg IM'), A('Compresión bimanual y balón intrauterino (éxito del 72 al 94 % con Bakri)')],
              [D('¿Hay restos placentarios (tejido) o desgarros (trauma)?', [A('Extraer los restos y reparar las lesiones del canal')], [A('Sospechar coagulopatía (trombina): fibrinógeno, plasma y crioprecipitado según laboratorio')])]),
            A('Reposición: bolos de 250 a 500 mL de cristaloides entibiados y ácido tranexámico 1 g en infusión lenta (idealmente en las primeras 3 horas; repetir a los 30 minutos si persiste)'),
            D('¿Persiste el sangrado o la hipoperfusión a los 30-60 minutos?',
              [A('Hemoderivados: 2 unidades de glóbulos rojos (protocolo 1:1:1 o 1:1:2 si el laboratorio no es óptimo); metas: Hb > 7,5 g/dL, plaquetas > 50.000, fibrinógeno > 200 mg/dL'),
               A('Cirugía: suturas de compresión (B-Lynch, Hayman), ligadura de arterias uterinas o hipogástricas, embolización; histerectomía como último recurso')],
              [F('Reevaluar a los 30 minutos: pulso < 90, TAS > 100, mejor estado mental y diuresis > 30 mL/h')])]),
        farmacos=['fx-oxitocina', 'fx-carbetocina', 'fx-metilergonovina', 'fx-carboprost', 'fx-misoprostol', 'fx-acido-tranexamico']),

    'obs-rciu': dict(
        calculadora='rciu-isuog',
        fisiopatologia=['RCIU precoz (< 32 semanas): se asocia a mala implantación placentaria, anomalías de las arterias espiraladas y malperfusión vascular materna; es frecuente la hipertensión del embarazo y el espectro de alteraciones Doppler abarca la arteria umbilical, la cerebral media y el ductus venoso (ISUOG 2020).',
                        'El aumento progresivo del IP de la arteria umbilical refleja menos superficie placentaria útil para el intercambio y mayor poscarga fetal; en la etapa final aparece flujo diastólico ausente y luego reverso.',
                        'La caída del IP de la cerebral media es la vasodilatación del «brain-sparing»: respuesta hemodinámica a la hipoxemia fetal con redistribución del gasto cardíaco hacia el cerebro, el corazón y las suprarrenales.',
                        'La onda a ausente o reversa del ductus venoso se asocia a la hipoxia extrema, a la mayor presión auricular por la poscarga elevada y a la acidemia: mayor asociación con muerte perinatal.',
                        'RCIU tardío (≥ 32 semanas): lesiones placentarias leves e inespecíficas; las alteraciones de arteria umbilical y venosas son raras y la principal señal es la redistribución cerebral.'],
        tamizaje=['Datar el embarazo con ecografía del primer trimestre y medir el crecimiento fetal en cada control; el RCIU tardío (70 % de los casos) es un desafío de detección.',
                  'El IP de las arterias uterinas en el cribado combinado del primer trimestre se asocia a preeclampsia y a RCIU (GAP SEGO 2021).',
                  'Solo el 30 % de los RCIU tiene factores de riesgo previos: no alcanza con vigilar a los grupos de riesgo.'],
        algoritmo=dict(titulo='Feto con peso estimado < p10: estadios y conducta (Consenso 2017)', nodos=[
            I('PFE < p10, con edad gestacional bien datada y sin malformaciones: Doppler de arteria umbilical, cerebral media, índice cerebro-placentario, uterinas y ductus venoso'),
            D('¿Menos de 34 semanas (RCIU precoz)?',
              [D('¿Hay flujo diastólico ausente o reverso en la arteria umbilical, o alteración del ductus venoso?',
                 [D('¿Onda a del ductus ausente o reversa, o desaceleraciones? (estadio IV)', [A('Control cada 12 horas o menos; cesárea a las 26 semanas')],
                    [D('¿Flujo reverso en la umbilical, IP del ductus > p95 o variabilidad < 3 ms? (estadio III)', [A('Control cada 2 a 3 días; cesárea a las 30 semanas')], [A('Estadio II (fin de diástole ausente): control dos veces por semana; cesárea a las 34 semanas')])])],
                 [A('Estadio I (IP umbilical > p95, PFE < p3, RCP < p5 o ACM < p5): control semanal; finalizar a las 37 semanas por inducción')]),
               A('Complementos: corticoides entre las 24 y 34 semanas en el estadio III con riesgo de parto en 48 h y en todos los estadios IV; sulfato de magnesio con parto inminente entre las 24 y 34 semanas')],
              [D('¿Índice cerebro-placentario o arterias uterinas alterados (RCIU tardío)?',
                 [A('Control semanal; inducción con monitoreo a las 37-38 semanas'), A('Con ACM < p5: control cada 3 a 4 días con ductus venoso y finalización entre las 34 y 37 semanas')],
                 [A('PEG sin insuficiencia placentaria: control cada 2 semanas con índice cerebro-placentario; evolución espontánea hasta las 40-41 semanas')])])]),
        farmacos=['fx-betametasona', 'fx-sulfato-magnesio']),

    'obs-ppp': dict(
        tamizaje=['Longitud cervical por ecografía transvaginal como predictor: < 25 mm antes de las 28 semanas, < 20 mm entre las 28 y 31+6 y < 15 mm desde las 32; no medirla de rutina en bajo riesgo.',
                  'Urocultivo en el primer control (≈ 12 semanas) y tratamiento de la bacteriuria asintomática; pesquisa y tratamiento de la vaginosis antes de las 20 semanas.',
                  'Fibronectina fetal ≥ 50 ng/mL desde las 22 semanas: útil por su valor predictivo negativo; hisopado vaginal-anal para EGB.'],
        algoritmo=dict(titulo='Amenaza de parto pretérmino (SOGIBA 2018 / FASGO 2014)', nodos=[
            I('Contracciones (1 cada 10 minutos, de 25 a 30 segundos, durante 60 minutos) con borramiento ≤ 50 % y dilatación ≤ 3 cm entre las 22 y las 36+6 semanas'),
            A('Internar; urocultivo, hisopado vaginal-anal para EGB, evaluación fetal y aviso a neonatología'),
            D('¿Está entre las 24 y 34 semanas?',
              [A('Corticoides: betametasona 12 mg IM cada 24 h (2 dosis) aun si el parto es inminente'),
               A('Tocolisis 48 horas (nifedipina, atosibán o indometacina) entre las 23 y 33+6, para completar los corticoides y trasladar'),
               D('¿El parto es inminente entre las 24 y 32+6 semanas?', [A('Sulfato de magnesio EV para neuroprotección: ataque 5 g y 1 g/h hasta el parto o 24 h; suspender la tocolisis')], [A('Observación y reevaluación del cuello')])],
              [A('Considerar corticoides desde las 23+0; después de las 34 semanas, sin corticoides de rutina')]),
            A('Si hay trabajo de parto sin hisopado negativo: profilaxis de EGB con penicilina G 5.000.000 UI y luego 2.500.000 UI cada 4 h'),
            F('Prevención secundaria: progesterona micronizada vaginal 100-200 mg/día en asintomáticas con antecedente o cuello corto')]),
        farmacos=['fx-nifedipina', 'fx-betametasona', 'fx-sulfato-magnesio', 'fx-progesterona', 'fx-penicilina']),

    'obs-rpm': dict(
        algoritmo=dict(titulo='Rotura prematura de membranas (FASGO 2018)', nodos=[
            I('Salida de líquido por vagina: confirmar con espéculo estéril (evitar el tacto), cristalización, nitrazina o inmunocromatografía'),
            D('¿Corioamnionitis, desprendimiento, muerte fetal o malformación letal, o compromiso materno o fetal?',
              [F('Interrumpir de inmediato, a cualquier edad gestacional')],
              [D('¿Tiene 37 semanas o más?',
                 [A('Iniciar la interrupción dentro de las 12 horas (inducir si las condiciones lo permiten); expectar no más de 24-36 horas, internada y con control diario'), A('Profilaxis de EGB si no hay hisopado negativo')],
                 [D('¿Entre las 34 y las 36+6 semanas?',
                    [A('Finalizar dentro de las 24 horas; corticoides si no los recibió, sin demorar el parto')],
                    [D('¿Entre las 24 y las 33+6 semanas?',
                       [A('Internación, reposo y control diario; laboratorio cada 72 h y ecografía o cardiotocografía cada 7 días'), A('Un ciclo de corticoides: betametasona 12 mg IM cada 24 h por 2 dosis'),
                        A('Antibióticos 48 h: azitromicina 500 mg + ampicilina 2 g y luego 1 g; si el EGB es positivo, amoxicilina 500 mg cada 8 h hasta 7 días'), A('Finalizar a partir de las 34+0 semanas')],
                       [A('Menos de 24 semanas: manejo individual con asesoramiento y neonatología')])])])]),
        ]),
        farmacos=['fx-betametasona', 'fx-azitromicina', 'fx-clindamicina', 'fx-gentamicina', 'fx-penicilina']),

    'gin-aborto': dict(
        algoritmo=dict(titulo='Aborto espontáneo según el estadio', nodos=[
            I('Embarazo < 20 semanas con metrorragia y dolor: β-hCG, ecografía transvaginal, hemograma, grupo y factor'),
            D('¿Embrión vital con cuello cerrado (amenaza)?', [A('Reposo y evitar el coito; progestágenos solo si había fase lútea inadecuada o inducción de ovulación')],
              [D('¿Aborto en curso o incompleto, con restos en la cavidad?',
                 [A('Estabilizar hemodinámicamente; evacuar con aspiración manual endouterina (≤ 12 semanas) o legrado, con oxitócicos y profilaxis antibiótica'), A('Misoprostol como premedicación: 5 a 9 semanas, 200 µg 3 horas antes')],
                 [D('¿Hay fiebre o signos de infección?', [A('Antibióticos de amplio espectro y evacuación rápida: penicilina + gentamicina + metronidazol')], [A('Huevo muerto retenido o aborto completo: confirmar por ecografía; si la retención supera 1 mes, controlar el fibrinógeno')])])]),
            A('Siempre: anti-D 300 µg dentro de las 72 horas en Rh negativas, pautas de alarma, analgesia y anticoncepción')]),
        farmacos=['fx-misoprostol', 'fx-oxitocina', 'fx-penicilina', 'fx-gentamicina', 'fx-metronidazol']),

    'gin-sop': dict(
        tamizaje=['Al diagnóstico: peso, IMC, circunferencia de cintura, perfil lipídico, presión arterial y glucemia (riesgo cardiometabólico); presión arterial anual.',
                  'En adolescentes no usar ecografía ni HAM para diagnosticar (no hacer ecografía pélvica hasta 8 años después de la menarca).'],
        algoritmo=dict(titulo='Síndrome de ovario poliquístico (FASGO 2025)', nodos=[
            I('Al menos 2 de 3 criterios (disfunción ovulatoria, hiperandrogenismo, ovarios poliquísticos o HAM elevada) tras excluir otras causas'),
            D('¿Desea embarazo?',
              [A('Letrozol: droga de primera elección para inducir la ovulación'), A('Alternativa: citrato de clomifeno (embarazo múltiple 5-7 %, hiperestimulación 0,3 %)'),
               D('¿No responde al letrozol o al clomifeno?', [A('Gonadotrofinas a dosis bajas, drilling ovárico laparoscópico o FIV/ICSI')], [F('Seguimiento del embarazo')])],
              [A('Estilo de vida: alimentación saludable y ejercicio (primera línea)'), A('Anticonceptivos orales combinados para el hirsutismo o la irregularidad menstrual'),
               D('¿IMC ≥ 25 y alteración metabólica?', [A('Agregar metformina 500 mg/día, hasta 2500 mg/día en adultas')], [A('Antiandrógenos si el hirsutismo persiste tras 6 meses de ACO')])])]),
        farmacos=['fx-clomifeno']),

    'gin-epi': dict(
        algoritmo=dict(titulo='Enfermedad pélvica inflamatoria (SOGIBA 2017)', nodos=[
            I('Dolor o sensibilidad uterina y/o anexial y dolor a la movilización cervical: iniciar tratamiento empírico'),
            A('β-hCG si puede estar embarazada; pesquisa de ITS y serología para VIH'),
            D('¿Criterios de internación (diagnóstico incierto, sin respuesta oral, enfermedad severa, absceso tubo-ovárico, intolerancia oral o embarazo)?',
              [A('Internada: clindamicina 900 mg cada 8 h + gentamicina; o ceftriaxona 1 g/día + metronidazol 500 mg EV cada 8 h + doxiciclina 100 mg cada 12 h; hasta 24-48 h de mejoría y luego vía oral hasta 14 días')],
              [A('Ambulatoria: ceftriaxona 500 mg IM única + doxiciclina 100 mg cada 12 h + metronidazol 500 mg cada 12 h, 10-14 días; reevaluar a las 72 horas'), A('No usar quinolonas: alta resistencia del gonococo')]),
            A('Evaluar y tratar a las parejas de los 60 días previos')]),
        farmacos=['fx-ceftriaxona', 'fx-doxiciclina', 'fx-metronidazol', 'fx-clindamicina', 'fx-gentamicina', 'fx-azitromicina']),

    'gin-flujo': dict(
        algoritmo=dict(titulo='Flujo genital (FASGO 2023)', nodos=[
            I('Flujo genital: medir pH vaginal, test de aminas, examen en fresco y Gram'),
            D('¿Cumple 3 de 4 criterios de Amsel (flujo blanco-grisáceo, pH > 4,5, células clave, aminas positivas)?',
              [A('Vaginosis bacteriana: metronidazol 500 mg cada 12 h por 7 días (o clindamicina); no tratar a la pareja; sin alcohol durante el tratamiento')],
              [D('¿Levaduras en el examen en fresco (candidiasis)?',
                 [A('Azol tópico u oral en dosis única o esquema corto (clotrimazol 500 mg óvulo o fluconazol 150 mg); evitar los azoles orales en el primer trimestre')],
                 [A('Sospechar tricomoniasis: cultivo o prueba de amplificación; metronidazol 500 mg cada 12 h por 7 días y tratar a la pareja')])])]),
        farmacos=['fx-metronidazol', 'fx-clindamicina', 'fx-fluconazol']),

    'gin-climaterio': dict(
        algoritmo=dict(titulo='Climaterio y menopausia (FASGO)', nodos=[
            I('Menopausia clínica (12 meses de amenorrea): evaluar el riesgo cardiovascular, de cáncer de mama y de trombosis'),
            D('¿Síntomas vasomotores moderados o graves, menos de 60 años y menos de 10 años de menopausia?',
              [A('Terapia hormonal a la menor dosis efectiva por el menor tiempo: estrógeno + progestágeno si tiene útero; estrógeno solo si no lo tiene'), A('Vía transdérmica con litiasis biliar, hipertrigliceridemia, HTA no estabilizada o riesgo trombótico')],
              [D('¿Contraindicación o no desea hormonas?', [A('Paroxetina, sertralina, venlafaxina, gabapentina, pregabalina o clonidina; con tamoxifeno evitar paroxetina y fluoxetina')], [A('Medidas no farmacológicas y control')])]),
            D('¿Atrofia urogenital?', [A('Estrógenos locales a baja dosis: estriol 50 µg, estrógenos conjugados 0,3-0,625 mg o promestrieno')], [F('Seguimiento')])]),
        farmacos=['fx-estradiol', 'fx-progesterona']),

    'gin-hiperprolactinemia': dict(
        algoritmo=dict(titulo='Hiperprolactinemia y prolactinoma', nodos=[
            I('Prolactina > 25 ng/mL en ayunas, tras reposo: repetir y pedir TSH'),
            A('Descartar embarazo, fármacos, hipotiroidismo y falla renal o hepática; luego RM de silla turca con y sin gadolinio'),
            D('¿Macroprolactinoma, galactorrea o mastalgia importantes, infertilidad, alteración del ciclo o hipoestrogenismo?',
              [A('Agonista dopaminérgico: cabergolina 0,5 mg dos veces por semana (o bromocriptina 2,5 mg dos a tres veces al día)'),
               D('¿Compresión, falta de respuesta o intolerancia?', [A('Cirugía transesfenoidal (recidiva hasta el 50 %)')], [A('Continuar y controlar la prolactina')])],
              [A('Asintomática, por fármacos o por hipotiroidismo: corregir la causa o vigilar (microadenoma sin deseo de embarazo)')])]),
        farmacos=['fx-cabergolina']),

    'obs-induccion-parto': dict(
        calculadora='bishop',
        algoritmo=dict(titulo='Inducción del trabajo de parto (FASGO 2019)', nodos=[
            I('Indicación médica de inducción: evaluar el cuello (Bishop)'),
            D('¿Cuello desfavorable?',
              [A('Maduración cervical: misoprostol vaginal 25 µg cada 3-6 h (u oral 25 µg cada 2 h), dinoprostona 10 mg o sonda de Foley de 60 mL durante al menos 12 horas'), A('La oxitocina sola no se recomienda para madurar el cuello')],
              [A('Amniotomía si la dilatación es ≥ 4 cm y la presentación está insinuada'), A('Oxitocina por bomba: 5 UI en 500 mL, inicio 1 mU/min y duplicar cada 20 minutos hasta una dinámica eficaz')]),
            D('¿Sin fase activa tras unas 12 horas de oxitocina con rotura de membranas y dinámica adecuada?', [F('Fracaso de inducción')], [F('Continuar el trabajo de parto')])]),
        farmacos=['fx-misoprostol', 'fx-oxitocina']),

    'gin-fop': dict(
        algoritmo=dict(titulo='Falla ovárica precoz', nodos=[
            I('Pérdida del ciclo antes de los 40 años durante al menos 6 meses, con hipoestrogenismo'),
            A('Dos dosajes de FSH > 40 UI/L separados por más de 1 mes, estradiol < 20 pg/mL y prueba de progesterona negativa'),
            D('¿Es menor de 30 años?', [A('Estudio genético (bandeo G): cariotipo')], [A('HAM; TSH, prolactina y tolerancia a la glucosa')]),
            A('Terapia hormonal hasta la edad de la menopausia natural: estradiol micronizado 4 mg/día VO (o parches) + progesterona micronizada 200 mg/día, 14 días por mes'),
            F('Fertilidad: criopreservación de ovocitos, fertilización asistida u ovodonación')]),
        farmacos=['fx-estradiol', 'fx-progesterona']),

    'obs-sifilis': dict(
        algoritmo=dict(titulo='Sífilis en el embarazo (Guía del Ministerio de Salud)', nodos=[
            I('VDRL/RPR a la gestante y a su pareja en el control prenatal'),
            D('¿VDRL reactiva?',
              [D('¿Sífilis primaria, secundaria o latente precoz (< 1 año)?', [A('Penicilina G benzatínica 2,4 millones UI IM, 2 dosis con 1 semana de intervalo')],
                 [D('¿Neurosífilis?', [A('Penicilina G sódica 2-4 millones UI cada 4 horas por 10-14 días')], [A('Latente tardía o de duración desconocida: penicilina G benzatínica 2,4 millones UI IM, 3 dosis con 1 semana de intervalo')])]),
               A('Tratar siempre a la pareja; VDRL mensual hasta el parto; si se interrumpe el esquema, reiniciarlo con todas las dosis')],
              [F('Sin sífilis: repetir el tamizaje según el control prenatal')])]),
        farmacos=['fx-penicilina']),

}
