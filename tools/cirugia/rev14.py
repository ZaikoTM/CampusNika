# -*- coding: utf-8 -*-
"""UP5: temas del programa que faltaban (colangitis esclerosante, quiste de coledoco, atresia biliar, trauma duodenopancreatico).
Fuente por prioridad: Galindo, luego Schwartz 10.ª ed., luego Michans 5.ª ed. (2002)."""
from base import I, A, F, D
from rev2 import GAL
from rev11 import SCHW
from rev10 import MICH
from rev6 import nueva as _n
import rev6
CONTENIDO = {}
NUEVAS = []
U5 = 'UP5 · Patología hepatobiliar y pancreática'

def nueva(*a, **k):
    _n(*a, **k); d = rev6.NUEVAS.pop(); d['up'] = ['cx5']; d['unidad'] = U5; NUEVAS.append(d)

nueva('cx-colangitis-esclerosante-primaria', 'Colangitis esclerosante primaria',
 ['colangitis esclerosante', 'cep', 'colangitis cronica', 'estenosis biliares multiples', 'cuentas de rosario'],
 'Enfermedad idiopática caracterizada por estenosis inflamatorias y fibrosas de los conductos biliares intra y extrahepáticos, no relacionadas con traumatismos operatorios, cálculos coledocianos ni colangiocarcinoma. Sería inmunológica en pacientes predispuestos y evoluciona a la cirrosis biliar.',
 ['Se presenta entre los 30 y 45 años, con predominio 2 a 1 en varones: ictericia intermitente, dolor en el hipocondrio derecho, prurito y fatiga, con remisiones y exacerbaciones; hay casos asintomáticos que se descubren por una fosfatasa alcalina muy elevada.',
  'Se asocia a la enfermedad inflamatoria intestinal en el 50 a 70 % (sobre todo colitis ulcerosa) y también a la fibrosis retroperitoneal y la tiroiditis de Riedel. Hay mayor riesgo de cáncer de colon (colonoscopia anual) y de colangiocarcinoma (8 a 15 %; 30 veces más que la población general).',
  'Laboratorio: colestasis con fosfatasa alcalina y gamma-glutamil transpeptidasa muy altas, IgM aumentada; no hay marcadores específicos.'],
 ['La colangiografía es la base del diagnóstico: estrecheces y dilataciones irregulares y múltiples con aspecto de "cuentas de rosario" (por CPRE). La colangiorresonancia, no invasiva, tiene sensibilidad de 88 % y especificidad de 99 %. La ecografía es de poca utilidad. La biopsia hepática no suele ser diagnóstica, pero estadifica y da pronóstico.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Médico', 'texto': 'Hasta hoy poco eficaz: ninguna droga (inmunosupresores, D-penicilamina, colchicina, metotrexato, ácido ursodesoxicólico) modificó la historia natural. Se trata el prurito con colestiramina (resina), alternativamente colestipol o naloxona, y se reponen las vitaminas liposolubles A, D y K.'},
    {'etiqueta': 'Endoscópico', 'texto': 'Dilatación de las estrecheces dominantes.'},
    {'etiqueta': 'Quirúrgico', 'texto': 'El trasplante hepático es el tratamiento más promisorio; la sobrevida media desde el diagnóstico hasta la muerte o el trasplante es de 10 a 15 años (Modelo Mayo para decidirlo).'}]}],
 ['Colonoscopia anual si coexiste colitis ulcerosa y vigilancia del colangiocarcinoma.'],
 ['Fosfatasa alcalina muy elevada en un paciente con colitis ulcerosa: pensar en colangitis esclerosante.', 'Es una causa de colangiocarcinoma (8 a 15 %): vigilancia continua.'],
 dict(titulo='Colangitis esclerosante primaria (Galindo)', nodos=[
   I('Colestasis con fosfatasa alcalina elevada, a veces en un paciente con colitis ulcerosa'),
   A('Colangiorresonancia (o CPRE) para buscar estrecheces múltiples en "cuentas de rosario"'),
   D('¿Estrecheces confirmadas sin causa secundaria (cálculos, cirugía biliar, tóxicos)?',
     [A('Colangitis esclerosante primaria: tratar el prurito, reponer vitaminas A, D y K y vigilar el colangiocarcinoma y el colon'),
      D('¿Cirrosis o insuficiencia hepática progresiva?',
        [F('Trasplante hepático')],
        [F('Control periódico; dilatación endoscópica de la estrechez dominante si hay colangitis')])],
     [F('Colangitis esclerosante secundaria: tratar la causa (litiasis, lesión quirúrgica, tóxico)')])]),
 GAL('445', 'Colangitis crónica (colangitis esclerosante primaria)', 'Capítulo 445 de la Enciclopedia de Cirugía Digestiva (Galindo)'))

nueva('cx-quiste-coledoco', 'Quiste del colédoco (quistes biliares)',
 ['quiste de coledoco', 'quistes biliares', 'dilatacion quistica congenita', 'todani', 'union pancreatobiliar anomala'],
 'Dilatación quística congénita del árbol biliar extrahepático, intrahepático o de ambos, asociada a una anomalía de la unión pancreatobiliar. Es rara en Occidente (1 en 100.000 a 150.000), más frecuente en mujeres (3 a 8 veces) y en Oriente; en la mitad se diagnostica en la adultez.',
 ['Más del 90 % tiene una unión anómala del conducto pancreático con el colédoco más de 1 cm proximal a la ampolla: el conducto común largo permite el reflujo de secreciones pancreáticas, que inflama, aumenta la presión biliar y forma el quiste.',
  'Clasificación en cinco tipos: I fusiforme, más del 50 %; II divertículo sacular, menos del 5 %; III coledococele, cerca de 5 %; IVa (intra y extrahepáticos) y IVb (solo extrahepáticos), 5 a 10 %; V intrahepáticos, cerca de 1 %.',
  'Los adultos presentan ictericia o colangitis; menos de la mitad tiene la tríada de dolor, ictericia y masa.'],
 ['Ecografía o TC confirman el diagnóstico; para planificar la cirugía se necesita estudio endoscópico, transhepático o colangiorresonancia que defina la anatomía biliar.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Tipos I, II y IV', 'texto': 'Escisión del árbol biliar extrahepático, con colecistectomía y hepaticoyeyunoanastomosis en Y de Roux. En el tipo IV puede sumarse una resección segmentaria del hígado si hay cálculos, estenosis o abscesos intrahepáticos, o si las dilataciones se limitan a un lóbulo.'},
    {'etiqueta': 'Tipo III', 'texto': 'Esfinterotomía.'},
    {'etiqueta': 'Por qué extirpar', 'texto': 'El colangiocarcinoma aparece en el 15 % de los adultos con quiste coledociano: se recomienda la extirpación completa al diagnosticarlo.'}]}],
 ['Seguimiento posoperatorio de la anastomosis biliodigestiva y vigilancia del árbol biliar remanente.'],
 ['Riesgo de colangiocarcinoma de 15 % en adultos: no dejar el quiste in situ.'],
 dict(titulo='Quiste del colédoco (Schwartz 10.ª ed.)', nodos=[
   I('Ictericia, colangitis o dolor con masa y dilatación quística de la vía biliar en ecografía o TC'),
   A('Colangiorresonancia, CPRE o estudio transhepático para definir el tipo (clasificación en cinco tipos)'),
   D('¿Tipo III (coledococele)?',
     [F('Esfinterotomía')],
     [F('Tipos I, II y IV: escisión del árbol biliar extrahepático con colecistectomía y Y de Roux; resección hepática segmentaria en el IV si hay patología intrahepática localizada')])]),
 SCHW('32', 'Vesícula biliar y sistema biliar extrahepático: quistes biliares'))

nueva('cx-atresia-biliar', 'Atresia de vías biliares',
 ['atresia biliar', 'atresia de vias biliares', 'kasai', 'portoenterostomia', 'colestasis neonatal'],
 'Resultado de un proceso inflamatorio destructivo, de causa desconocida, que afecta los conductos biliares extrahepáticos del recién nacido; sin tratamiento, los pacientes mueren antes de los 2 años por hepatopatía cirrótica. Incidencia de un caso cada 12.000 a 15.000 nacidos vivos.',
 ['Sospechar ante colestasis extrahepática en el recién nacido, con hepatomegalia y tendencia a hemorragias por malabsorción de vitamina K.',
  'Clasificación japonesa: A, atresia del colédoco con un quiste en el hilio; B, atresia del hepático común; C, atresia de los hepáticos derecho e izquierdo. Hay anomalías congénitas asociadas en el 12 a 27 %, sobre todo cardiovasculares.'],
 ['Sondeo duodenal y materia fecal sin pigmentos biliares (diferenciar de hepatitis graves); ecografía con dilatación intrahepática, quistes y ausencia de la vía biliar distal; la falta de excreción del radioisótopo tiene efectividad de 97 % y la biopsia percutánea de 82 %; laparotomía exploradora si hay dudas.'],
 [{'titulo': 'Tratamiento quirúrgico', 'pasos': [
    {'etiqueta': 'Atresia quística (tipo 1)', 'texto': 'Hepatoyeyunostomía en Y de Roux; son las antes llamadas corregibles, del 8 al 15 % de los casos.'},
    {'etiqueta': 'Tipos 2 y 3', 'texto': 'Portoenterostomía en Y de Roux (operación de Kasai): se anastomosa un asa yeyunal al hilio hepático tras escindir los remanentes biliares.'},
    {'etiqueta': 'Si falla', 'texto': 'Trasplante hepático.'}]}],
 ['Control de la colestasis, la nutrición y la evolución hepática tras la cirugía.'],
 ['El sondeo duodenal puede dar falsos negativos frente a las hepatitis graves: hay que diferenciarlas.'],
 dict(titulo='Atresia biliar (Michans)', nodos=[
   I('Recién nacido con ictericia colestásica, heces acólicas y hepatomegalia'),
   A('Ecografía, estudio radioisotópico y biopsia hepática percutánea; laparotomía si persisten las dudas'),
   D('¿Atresia quística (tipo 1)?',
     [F('Hepatoyeyunostomía en Y de Roux')],
     [F('Portoenterostomía de Kasai (tipos 2 y 3); trasplante hepático si falla')])]),
 MICH('38', 'Vías biliares: atresia biliar'))

nueva('cx-trauma-duodenopancreatico', 'Traumatismo duodenopancreático',
 ['trauma duodenal', 'trauma pancreatico', 'traumatismo de pancreas', 'lesion duodenal', 'duodeno-pancreatico'],
 'Lesiones del duodeno y del páncreas, retroperitoneales y de difícil diagnóstico. Las duodenales son menos del 4 % de las laparotomías por trauma abdominal (la segunda porción en el 35 %) y las pancreáticas cerca del 12 %; más de dos tercios son por traumatismos penetrantes. Toda lesión se considera grave.',
 ['El diagnóstico se retrasa por la ubicación retroperitoneal y las lesiones asociadas; un golpe en el epigastrio puede estallar el duodeno por aumento brusco de la presión en un asa cerrada entre el píloro y el ángulo de Treitz.',
  'No se miden amilasas para confirmar o descartar la lesión. Clasificación OISS: duodeno grado I a V y páncreas grado I a V, según el hematoma, la laceración y el daño del conducto.'],
 ['TC con contraste oral y endovenoso en el paciente compensado; puede tardar 24 a 48 horas en mostrar lesiones pancreáticas leves, por lo que un resultado negativo en ese lapso no la excluye. En el paciente descompensado no hay indicación de TC: laparotomía tras la reanimación. La ecografía y el lavado peritoneal diagnóstico no deben usarse para detectar lesiones aisladas.',
  'La CPRE en el paciente estable permite descartar una lesión del conducto pancreático y del hepatocolédoco. La duda diagnóstica obliga a la laparotomía exploradora.'],
 [{'titulo': 'Tratamiento', 'pasos': [
    {'etiqueta': 'Prioridades', 'texto': 'Primero la vida, luego el órgano y por último la función. Tratar el shock, asegurar la vía aérea y manejar desde el inicio la hipotermia, la acidosis y las coagulopatías. Si el paciente está in extremis: cirugía de control de daños.'},
    {'etiqueta': 'Duodeno', 'texto': 'Una lesión pequeña se repara con resección de los bordes y sutura en un plano. La sutura duodenal tiende a dehiscencia y fístula, por lo que se protege con sonda o con exclusión del píloro. Si el defecto supera 3 cm, resección segmentaria con anastomosis término-terminal; en la segunda porción, resección con duodenoyeyunoanastomosis en Y de Roux.'}]}],
 ['Vigilar fístula duodenal y complicaciones pancreáticas tardías.'],
 ['La morbimortalidad es alta por las fugas o dehiscencias de cualquier reparación y por las lesiones abdominales asociadas.', 'Un estudio negativo en las primeras 24 a 48 horas no descarta una lesión pancreática leve.'],
 dict(titulo='Trauma duodenopancreático (Galindo)', nodos=[
   I('Traumatismo abdominal cerrado o penetrante con sospecha de lesión retroperitoneal'),
   D('¿Hemodinamia inestable?',
     [F('Reanimación y laparotomía; cirugía de control de daños si está in extremis')],
     [A('TC con contraste oral y endovenoso; CPRE si se sospecha lesión del conducto pancreático'),
      D('¿Hay lesión duodenal o pancreática, o persiste la duda diagnóstica?',
        [F('Laparotomía: reparar el duodeno (sutura protegida, resección segmentaria o Y de Roux) y tratar el páncreas según el estado del conducto')],
        [F('Una TC negativa en las primeras 24 a 48 horas no descarta una lesión pancreática leve: la duda diagnóstica obliga a la laparotomía exploradora')])])]),
 GAL('491', 'Traumatismos duodenopancreáticos', 'Capítulo 491 de la Enciclopedia de Cirugía Digestiva (Galindo)'))
