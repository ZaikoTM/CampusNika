# -*- coding: utf-8 -*-
"""UP11: fichas nuevas sobre el Manual de Urologia SCHU 3.ª ed. (ITU, ITS con ulceras genitales, criptorquidia, hipospadias)."""
from base import I, A, F, D
from rev4 import SCHU, U11, P
CONTENIDO = {}
NUEVAS = []

def nueva(id, titulo, alias, definicion, diagnostico, estudios, tratamiento, seguimiento, banderas, algoritmo, fuente, fisiopatologia=None):
    d = {'id': id, 'area': 'cirugia', 'titulo': titulo, 'alias': alias, 'up': ['cx11'], 'unidad': U11, 'estado': 'verificar',
         'definicion': definicion, 'diagnostico': diagnostico, 'estudios': estudios, 'tratamiento': tratamiento, 'seguimiento': seguimiento,
         'banderas': banderas, 'algoritmo': algoritmo, 'fuente': fuente, 'revisarAntes': 'Contrastar con la guía o el protocolo vigente de la institución antes de aplicar.'}
    if fisiopatologia: d['fisiopatologia'] = fisiopatologia
    NUEVAS.append(d)

nueva('cx-itu-cistitis-pielonefritis', 'Infección del tracto urinario: cistitis, pielonefritis y recurrente',
 ['itu', 'infeccion urinaria', 'cistitis', 'pielonefritis', 'bacteriuria asintomatica', 'urosepsis'],
 'Presencia y multiplicación de microorganismos en la vía urinaria con invasión de tejidos, generalmente con bacteriuria, piuria y síntomas. Se clasifica en localizada (cistitis, sin síntomas sistémicos) y sistémica (fiebre o hipotermia, calofríos, hipotensión, delirium o dolor lumbar), con o sin factores de riesgo; la urosepsis es la disfunción orgánica por una infección de origen urinario o genital masculino.',
 ['Cistitis: disuria, polaquiuria, urgencia y dolor suprapúbico sin flujo vaginal patológico; el diagnóstico es clínico y el urocultivo no es obligatorio.',
  'Pielonefritis: fiebre mayor de 38 °C, calofríos, dolor en el flanco, náuseas, vómitos y puño percusión positiva, con o sin síntomas bajos.',
  'Agente más frecuente: Escherichia coli (cerca de 85 % ambulatorio); luego Proteus mirabilis, Klebsiella pneumoniae y Staphylococcus saprophyticus. El catéter urinario permanente causa más del 90 % de las ITU intrahospitalarias.',
  'Bacteriuria asintomática: no se trata, salvo en embarazadas y antes de procedimientos urológicos.'],
 ['Tira reactiva (leucocito esterasa y nitritos), orina completa y urocultivo: significativo con 100.000 UFC/mL o más en orina espontánea.',
  'Si hay síntomas de pielonefritis: hemograma, PCR y función renal; ecografía renal para descartar obstrucción y tomografía si la fiebre persiste más de 72 horas de tratamiento o se sospecha complicación.'],
 [{'titulo': 'Cistitis aguda', 'pasos': [
    {'etiqueta': 'Fosfomicina', 'texto': '3 g en dosis única.'},
    {'etiqueta': 'Nitrofurantoína', 'texto': '100 mg cada 8 a 12 horas por 5 días; la sensibilidad de E. coli se mantiene sobre 95 %.'},
    {'etiqueta': 'Otras', 'texto': 'Cotrimoxazol forte cada 12 horas por 3 días (no en el embarazo), amoxicilina-clavulánico 500 mg cada 8 horas por 5 días o cefadroxilo 500 mg cada 12 horas por 3 días. La ciprofloxacina es alternativa por la selección de cepas resistentes.'}]},
  {'titulo': 'Pielonefritis', 'pasos': [
    {'etiqueta': 'No complicada', 'texto': 'Ambulatoria si tolera la vía oral: fluoroquinolona o cefalosporina, ajustada al urocultivo y al antibiograma.'},
    {'etiqueta': 'Con hospitalización', 'texto': 'Tratamiento endovenoso con aminoglucósido, cefalosporina, penicilina de espectro extendido o carbapenémico según la flora local, y pase a la vía oral con buena tolerancia.'}]},
  {'titulo': 'ITU recurrente', 'pasos': [
    {'etiqueta': 'Definición', 'texto': 'Tres o más episodios al año, o dos en los últimos seis meses. Menos de 15 días desde el fin del tratamiento es recurrencia; 15 días o más, reinfección.'},
    {'etiqueta': 'Medidas', 'texto': 'Ingesta de 2 a 3 L/día, suspender espermicidas, micción poscoital e higiene; estrógeno vaginal en la posmenopáusica, inmunoprofilaxis, probióticos o profilaxis antibiótica en dosis bajas.'}]}],
 ['Cistitis: control clínico; urocultivo si los síntomas persisten al terminar el antibiótico o reaparecen a las dos semanas.',
  'ITU recurrente: confirmar cada episodio con urocultivo y estudiar con imagen y cistoscopia ante sospecha de litiasis, obstrucción o residuo posmiccional elevado.'],
 ['Fiebre que persiste más de 72 horas con antibiótico: descartar obstrucción o absceso.',
  'Pielonefritis obstructiva con signos sistémicos: drenaje urgente de la vía urinaria.',
  'Elegir el empírico con resistencia local menor de 20 % en cistitis y menor de 10 % en pielonefritis; no usar fluoroquinolona de primera línea si se usó en los últimos 6 meses.'],
 dict(titulo='Infección urinaria (Manual SCHU 2025)', nodos=[
   I('Síntomas urinarios: disuria, polaquiuria, urgencia, dolor suprapúbico o fiebre y dolor lumbar'),
   D('¿Hay síntomas o signos sistémicos (fiebre, calofríos, hipotensión, delirium) o dolor lumbar?',
     [A('ITU sistémica: urocultivo, hemograma, PCR, función renal y ecografía renal para descartar obstrucción'),
      D('¿Obstrucción, sepsis o intolerancia a la vía oral?',
        [F('Hospitalizar, antibiótico endovenoso empírico según la flora local y drenaje urgente de la vía urinaria si hay obstrucción; ajustar al antibiograma')],
        [F('Pielonefritis no complicada: tratamiento ambulatorio con fluoroquinolona o cefalosporina ajustado al cultivo')])],
     [A('ITU localizada (cistitis): el diagnóstico es clínico; tira reactiva u orina completa'),
      D('¿Es embarazada, o tiene factores de riesgo o recurrencias?',
        [F('Urocultivo y antibiótico según antibiograma; estudiar causas si es recurrente')],
        [F('Tratamiento empírico corto: fosfomicina 3 g única, nitrofurantoína 5 días u otra opción según resistencia local')])])]),
 SCHU('13', 'Infecciones del tracto urinario'))

nueva('cx-its-ulceras-genitales', 'Infecciones de transmisión sexual con úlcera genital',
 ['its', 'ets', 'herpes genital', 'sifilis', 'chancroide', 'linfogranuloma venereo', 'granuloma inguinal', 'uretritis'],
 'Las úlceras genitales más frecuentes son herpes genital (la causa más común), linfogranuloma venéreo, chancroide, granuloma inguinal y sífilis. El enfoque actual de las ITS es sindromático: se inicia el tratamiento empírico antes de tener el resultado de laboratorio.',
 ['Herpes genital: infección viral crónica por VHS-1 o VHS-2 (el 2 es más genital y más recurrente).',
  'Sífilis (Treponema pallidum): chancro indoloro de fondo limpio en el punto de inoculación; incubación de 3 a 90 días. Formas precoces (primaria, secundaria y latente precoz) en el primer año; tardías (latente tardía y terciaria) después.',
  'Chancroide (Haemophilus ducreyi): úlcera blanda y dolorosa; linfogranuloma venéreo (Chlamydia trachomatis L1 a L3): úlcera transitoria con adenopatía inguinal; granuloma inguinal: úlcera indolora, serpiginosa y sin adenitis, con cuerpos de Donovan en la muestra.'],
 ['Pruebas para sífilis (RPR o VDRL) al momento de la consulta y a los 3 meses; serología de VIH y hepatitis B y C; IgG e IgM para VHS.',
  'Gonorrea y clamidia: test en secreción uretral o primera orina.'],
 [{'titulo': 'Tratamiento según el síndrome (Manual SCHU)', 'pasos': [
    {'etiqueta': 'Linfogranuloma venéreo', 'texto': 'Doxiciclina 100 mg cada 12 horas por 21 días; alternativas: eritromicina 500 mg cada 6 horas (embarazo), azitromicina 1 g al día o tetraciclina por 21 días. Abstinencia hasta 7 días del inicio del tratamiento y tratar a las parejas de los últimos 30 días.'},
    {'etiqueta': 'Chancroide', 'texto': 'Azitromicina 1 g dosis única, o ceftriaxona 250 mg intramuscular dosis única, o ciprofloxacina 500 mg cada 12 horas por 3 días; eritromicina 500 mg cada 8 horas por 7 días en embarazadas. Reevaluar a la semana y tratar a las parejas de los últimos 10 días.'},
    {'etiqueta': 'Granuloma inguinal', 'texto': 'Azitromicina 1 g por semana o 500 mg diarios por 21 días; alternativas doxiciclina, ciprofloxacina o eritromicina por 21 días. Tratar a las parejas de los últimos 60 días.'}]}],
 ['Control a la semana en chancroide, y hasta verificar la curación en el resto; tratar siempre a las parejas.'],
 ['Toda ITS obliga a descartar las demás, incluido el VIH.',
  'La embarazada se trata con esquemas propios (eritromicina), sin doxiciclina ni quinolonas.'],
 dict(titulo='Úlcera genital: enfoque sindromático (Manual SCHU 2025)', nodos=[
   I('Úlcera genital: interrogar conducta sexual, examinar lesión y ganglios inguinales'),
   A('Estudio inicial: RPR o VDRL, VIH, hepatitis B y C, IgG e IgM de VHS, test de gonorrea y clamidia'),
   D('¿Úlcera indolora de fondo limpio (chancro)?',
     [F('Sospechar sífilis: confirmar con serología y tratar según estadio (precoz o tardía)')],
     [D('¿Úlcera dolorosa y blanda con adenopatía?',
        [F('Chancroide: azitromicina 1 g única o ceftriaxona 250 mg intramuscular; reevaluar a la semana')],
        [D('¿Úlcera serpiginosa, indolora y sin adenitis?',
           [F('Granuloma inguinal: cuerpos de Donovan; azitromicina por 21 días')],
           [F('Herpes genital (la causa más común) o linfogranuloma venéreo (doxiciclina por 21 días): confirmar y tratar a las parejas')])])])]),
 SCHU('14', 'Enfermedades de transmisión sexual'))

nueva('cx-criptorquidia-teste-no-descendido', 'Criptorquidia y teste no descendido',
 ['criptorquidia', 'testiculo no descendido', 'teste retractil', 'ectopia testicular', 'orquidopexia'],
 'La criptorquidia es el teste ubicado en algún punto del trayecto normal del descenso; la ectopia testicular es el teste fuera de ese trayecto (la más frecuente, inguinal suprafascial). El teste retráctil baja con facilidad al escroto y permanece allí.',
 ['El teste retráctil debe tener asimetría de volumen menor de 20 % para considerarse no patológico; entre 10 y 25 % pueden volverse criptorquídicos o perder volumen, por lo que requieren seguimiento.',
  'Teste no palpable: el que no se palpa tras examinar en las mejores condiciones (niño tranquilo, ambiente cálido, examinador con experiencia).',
  'Desde los 6 meses de edad aparecen cambios histológicos por la mayor temperatura, con degeneración de células germinales (de 1 % en normales a 20 % a los 2 años, 40 % a los 6 y 45 % a los 10): riesgo de infertilidad y de cáncer testicular.'],
 ['Ecografía inguinal; en el teste no palpable, examen bajo anestesia y laparoscopia exploradora.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Oportunidad', 'texto': 'El teste puede bajar hasta pasada la minipubertad (2 a 4 meses). Derivar a los 6 meses y operar antes de los 2 años.'},
    {'etiqueta': 'Palpable', 'texto': 'Orquidopexia: liberar el gubernáculum y el conducto peritoneovaginal, disecar el cordón hacia el retroperitoneo y fijar el teste en el escroto sin tensión.'},
    {'etiqueta': 'No palpable', 'texto': 'Laparoscopia: teste intraabdominal viable (40 %), ausente con vasos ciegos (20 %), atrófico inguinal (30 %) o normal en el canal inguinal (10 %). La técnica depende del hallazgo.'}]}],
 ['Seguimiento del volumen y la ubicación testicular; el riesgo de cáncer persiste, sobre todo si el descenso fue pospuberal.'],
 ['Derivar a los 6 meses; la cirugía no debe postergarse después de los 2 años.',
  'Teste retráctil: control periódico, porque puede ascender.'],
 dict(titulo='Teste no descendido (Manual SCHU 2025)', nodos=[
   I('Niño con escroto vacío o hipoplásico: examinar en ambiente cálido, con el niño tranquilo'),
   D('¿El teste se palpa?',
     [D('¿Baja fácilmente al escroto y se queda allí?',
        [F('Teste retráctil: control periódico (puede ascender); operar si se vuelve criptorquídico o pierde volumen')],
        [F('Criptorquidia o ectopia palpable: orquidopexia entre los 6 y los 24 meses')])],
     [A('Teste no palpable: ecografía inguinal y examen bajo anestesia'),
      D('¿Aparece en el canal inguinal bajo anestesia?',
        [F('Orquidopexia inguinal')],
        [F('Laparoscopia exploradora: descenso en uno o dos tiempos si es viable; orquiectomía si está atrófico o no es viable')])])]),
 SCHU('35', 'Urología pediátrica: criptorquidia'))

nueva('cx-hipospadias', 'Hipospadias',
 ['hipospadias', 'hipospadia', 'curvatura peneana', 'meato ectopico'],
 'Defecto congénito del pene por hipoplasia de los tejidos de la cara ventral: meato uretral ventral (entre el glande y el periné), prepucio alado y curvatura peneana ventral (cuerda); no siempre están los tres componentes. Incidencia de 1 en 250 a 300 recién nacidos varones.',
 ['Factores sospechados: endocrinopatías, bajo peso al nacer, edad materna avanzada, diabetes materna y disruptores ambientales (pesticidas).',
  'Con pene muy pequeño (menor que el percentil 3) o genitales ambiguos se sospecha una variación del desarrollo sexual y se evalúa con endocrinología.'],
 ['Diagnóstico clínico al nacer; no circuncidar, porque el prepucio se usa en la reparación.'],
 [{'titulo': 'Tratamiento quirúrgico', 'pasos': [
    {'etiqueta': 'Momento', 'texto': 'Entre los 6 y los 18 meses, después de la minipubertad y antes del retiro del pañal.'},
    {'etiqueta': 'Objetivos (en orden)', 'texto': 'Corregir la curvatura, lograr un meato normotópico y un glande cónico, una uretra de buen calibre y una cobertura cutánea adecuada. No hay una técnica ideal.'},
    {'etiqueta': 'Casos distales', 'texto': 'Sin curvatura, valorar el beneficio: la cirugía busca recuperar la función y no es solo cosmética. Con pene pequeño, testosterona previa tras la evaluación endocrinológica.'}]}],
 ['Control posoperatorio de la uretra y de la curvatura.'],
 ['No circuncidar a un niño con hipospadias.', 'Hipospadias con genitales ambiguos o criptorquidia: pensar en una variación del desarrollo sexual.'],
 dict(titulo='Hipospadias (Manual SCHU 2025)', nodos=[
   I('Recién nacido con meato ventral, prepucio alado o curvatura del pene'),
   A('No circuncidar; examen de los genitales y buscar criptorquidia'),
   D('¿Pene muy pequeño, genitales ambiguos o teste no palpable?',
     [A('Evaluar una variación del desarrollo sexual con endocrinología; testosterona previa si corresponde'), F('Cirugía entre los 6 y los 18 meses')],
     [D('¿Hipospadias muy distal y sin curvatura?',
        [F('Valorar el beneficio de operar: la indicación es funcional, no cosmética')],
        [F('Uretroplastia entre los 6 y los 18 meses, antes del retiro del pañal')])])]),
 SCHU('35', 'Urología pediátrica: hipospadias'))
