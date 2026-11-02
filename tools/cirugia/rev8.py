# -*- coding: utf-8 -*-
"""Auditoria: fisiopatologia de fichas clave (redactada desde el capitulo citado) y fichas nuevas de Giménez que faltaban en el temario (UP5)."""
from base import I, A, F, D, FG
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []

def nueva(*a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop()
    d['up'] = ['cx5']; d['unidad'] = 'UP5 · Patología hepatobiliar y pancreática'; NUEVAS.append(d)

def fisio(pid, items): CONTENIDO[pid] = {'fisiopatologia': items}

fisio('cx-apendicitis-aguda', [
 'La teoría más aceptada es la obstrucción de la luz apendicular. Las causas endoluminales son el fecalito o apendicolito, los parásitos y los cuerpos extraños; la causa parietal más común es la hiperplasia folicular linfoidea tras una infección viral o bacteriana, típica de los jóvenes, y menos frecuente son los tumores del ciego o del apéndice (Giménez, cap. 70).',
 'La obstrucción eleva la presión intraluminal y distiende la pared. Cuando esa presión supera la de los capilares, cae primero el retorno venoso y luego el flujo arterial, con isquemia y gangrena de la pared (Giménez, cap. 70).'])
fisio('cx-colecistitis-aguda', [
 'La colecistitis aguda se debe casi siempre a la obstrucción del conducto cístico por un cálculo impactado, que distiende la vesícula; ocurre en cerca del 10 % de los pacientes con litiasis vesicular sintomática (Giménez, cap. 53).',
 'La litiasis biliar nace de una alteración de las propiedades estáticas o dinámicas de la bilis y de su sistema excretor; el sitio más frecuente de los cálculos es la vesícula (Giménez, cap. 53).'])
fisio('cx-isquemia-arterial-aguda', [
 'Embolia: un elemento originado en un sitio proximal, casi siempre un trombo de las cavidades cardíacas, se detiene en una arteria sana, con mayor frecuencia en la bifurcación femoral. Como no hay circulación colateral previa, la isquemia es más grave y es una emergencia que exige revascularización inmediata (Giménez, cap. 16).',
 'Trombosis: proceso local sobre una arteria ya enferma, habitualmente la femoral superficial con accidente de placa en el conducto de Hunter, o la trombosis de un bypass previo. Suele presentarse con menos gravedad por la circulación colateral previa (Giménez, cap. 16).'])
fisio('cx-quemaduras', [
 'La lesión activa mecanismos inmunológicos: aumentan el factor de necrosis tumoral alfa, las interleucinas, las prostaglandinas, el tromboxano A2, la prostaciclina y los leucotrienos, con repercusión local y sistémica (Giménez, cap. 75).',
 'La prostaciclina y los leucotrienos aumentan la permeabilidad vascular y dilatan los capilares: se produce edema, hipovolemia, caída del gasto cardíaco y de la presión arterial, y hemoconcentración con aumento del hematocrito (Giménez, cap. 75).'])
fisio('cx-pancreatitis-aguda', [
 'Las causas más frecuentes son la litiasis biliar y el alcohol, seguidas por la hipertrigliceridemia. Otras: anomalías de la convergencia biliopancreática, tumores que obstruyen la papila o el conducto, disfunción del esfínter de Oddi, infecciones, fármacos, causas iatrogénicas (CPRE), autoinmunes, traumáticas, isquémicas e hiperparatiroidismo (Giménez, cap. 59).'])
fisio('cx-litiasis-urinaria-colico-renal', [
 'La formación del cálculo requiere que la sal formadora supere su solubilidad en la orina (supersaturación), con aparición de un nido de cristales (nucleación homogénea o heterogénea) que crece y se agrega hasta alojarse en la vía urinaria (Manual SCHU, cap. 8).',
 'Favorecen la litiasis el déficit de inhibidores de la cristalización (citrato y magnesio), el pH urinario (ácido para el ácido úrico, alcalino para la estruvita), la disminución del volumen urinario y la estasis (Manual SCHU, cap. 8).'])
fisio('cx-torsion-testicular', [
 'La torsión del cordón produce isquemia venosa y luego arterial, con necrosis hemorrágica del testículo; la reperfusión tras la detorsión puede agravar el daño. Las células germinales son las más lábiles a la isquemia (Manual SCHU, cap. 9).',
 'El daño depende del tiempo de evolución y del grado de torsión del cordón (Manual SCHU, cap. 9).'])

nueva('cx-pancreatitis-cronica', 'Pancreatitis crónica: indicaciones de cirugía',
 ['pancreatitis cronica', 'frey', 'beger', 'partington-rochelle', 'insuficiencia pancreatica', 'calcificaciones pancreaticas'],
 'Inflamación persistente del tejido pancreático que destruye el parénquima, el cual se reemplaza por fibrosis y atrofia. Suele asociarse al alcohol, al tabaquismo o a ciertas mutaciones genéticas, y empieza con brotes dolorosos seguidos de un dolor crónico y debilitante en los 3 a 5 años posteriores.',
 ['Dolor abdominal persistente que obliga a escalar de AINE a opioides; insuficiencia exocrina (deposiciones pastosas y malolientes, síndrome de malabsorción y desnutrición) y, en etapas avanzadas, diabetes por insuficiencia endocrina.',
  'Los pacientes con pancreatitis crónica tienen más cáncer de páncreas que la población general.'],
 ['La TC muestra calcificaciones ductales, conducto pancreático dilatado y páncreas atrófico; la colangiopancreato-RM completa el estudio.'],
 [{'titulo': 'Tratamiento quirúrgico', 'pasos': [
    {'etiqueta': 'Objetivos', 'texto': 'Aliviar el dolor, resolver las complicaciones locales y preservar las funciones endocrina y exocrina.'},
    {'etiqueta': 'Indicación de resección', 'texto': 'Principalmente masa inflamatoria con duda de cáncer de páncreas.'},
    {'etiqueta': 'Drenaje sin resección', 'texto': 'Técnicas tipo Partington-Rochelle, que exigen conducto de Wirsung dilatado (más de 7 mm).'},
    {'etiqueta': 'Drenaje con resección de la masa de la cabeza', 'texto': 'Cirugías de Frey, Beger y Berna.'},
    {'etiqueta': 'Pancreatectomía total', 'texto': 'En recurrencia o pancreatitis crónica hereditaria; puede asociarse a autotrasplante de islotes (a 5 años, 59 a 73 % libres de dolor y 27 a 38 % dependen de insulina).'}]}],
 ['Control de la nutrición, la insuficiencia exocrina y la glucemia; suspender alcohol y tabaco.'],
 ['Masa pancreática inflamatoria en un paciente con pancreatitis crónica: descartar cáncer antes de elegir la técnica.', 'Suspender alcohol y tabaco: son los factores predisponentes más importantes.'],
 dict(titulo='Pancreatitis crónica con dolor (Giménez 2025)', nodos=[
   I('Paciente con antecedente de pancreatitis, alcohol o tabaco y dolor abdominal crónico, con calcificaciones, conducto dilatado o atrofia en la TC'),
   A('Tratamiento médico: analgesia escalonada, suspender alcohol y tabaco, reposición de enzimas y control de la diabetes'),
   D('¿Hay masa inflamatoria con duda de cáncer, dolor refractario o complicaciones locales?',
     [D('¿El conducto de Wirsung está dilatado (más de 7 mm) y sin masa en la cabeza?',
        [F('Drenaje sin resección (Partington-Rochelle)')],
        [D('¿Hay masa inflamatoria en la cabeza del páncreas?',
           [F('Drenaje con resección de la cabeza: Frey, Beger o Berna')],
           [F('Pancreatectomía total (± autotrasplante de islotes) si hay recurrencia o forma hereditaria')])])],
     [F('Continuar el manejo médico con control periódico')])]),
 FG('60', 'Indicaciones de cirugía en la pancreatitis crónica'))

nueva('cx-tumores-quisticos-pancreas', 'Tumores quísticos del páncreas',
 ['quistes de pancreas', 'nipm', 'neoplasia quistica mucinosa', 'neoplasia quistica serosa', 'neoplasia intraductal papilar mucinosa'],
 'Lesiones quísticas del páncreas, cada vez más diagnosticadas por la mejor calidad de las imágenes. Incluyen la neoplasia intraductal papilar mucinosa (NIPM), la neoplasia quística mucinosa (NQM) y la neoplasia quística serosa (NQS).',
 ['La NQS es totalmente benigna. La NIPM de tipo 1 y la mixta tienen una historia natural distinta de la del tipo 2.',
  'Los tumores sintomáticos tienen más carcinoma invasor que los asintomáticos.'],
 ['TC y colangiopancreato-RM siempre ante un tumor quístico; en la gran mayoría alcanzan para decidir la conducta. La ecoendoscopia con punción del contenido ayuda en los casos difíciles de diferenciar.'],
 [{'titulo': 'Conducta', 'pasos': [
    {'etiqueta': 'Tendencia actual', 'texto': 'Manejo conservador para evitar resecciones innecesarias; en general se operan los tumores sintomáticos o complicados.'},
    {'etiqueta': 'NIPM y NQM', 'texto': 'Cirugía en la NIPM de tipo 1 y mixta, y en la neoplasia quística mucinosa; en la NIPM de tipo 2 el seguimiento es válido si no hay factores de malignidad.'},
    {'etiqueta': 'NQS', 'texto': 'Se opera solo ante complicaciones locales o dolor.'}]}],
 ['Control periódico de los quistes no operados.'],
 ['Quiste sintomático o con complicaciones: mayor riesgo de carcinoma invasor.'],
 dict(titulo='Tumor quístico del páncreas (Giménez 2025)', nodos=[
   I('Lesión quística pancreática en una imagen'),
   A('TC y colangiopancreato-RM; ecoendoscopia con punción si no se logra diferenciar'),
   D('¿Es una neoplasia quística serosa?',
     [F('Benigna: se opera solo ante complicaciones locales o dolor; si no, control')],
     [D('¿NIPM tipo 1 o mixta, neoplasia quística mucinosa, o tumor sintomático o complicado?',
        [F('Resección quirúrgica')],
        [F('NIPM tipo 2 sin factores de malignidad: seguimiento')])])]),
 FG('63', 'Neoplasia intraductal papilomucinosa, neoplasia quística mucinosa y neoplasia quística serosa'))
