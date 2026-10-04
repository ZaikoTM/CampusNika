import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/sim/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8', newline=''), ensure_ascii=False, indent=1)

F1, F2, F3, F4, F5 = 'Presentación y preparación', 'Medición de la altura uterina', 'Maniobras de Leopold y auscultación', 'Fin del examen', 'Cierre'
# (n, texto de la lista de cotejo, fase, target, crítico, estado, fx, explica, claves, frase)
P = [
 (1, 'Preséntese a la embarazada', F1, 'paciente', 0, {'pres': 1}, 'hablar',
  'El primer contacto establece confianza: la profesional se presenta con nombre y rol antes de tocar a la embarazada.',
  [['me presento'], ['soy la doctora'], ['soy el doctor'], ['mi nombre'], ['buen dia'], ['buenas tardes']], 'Buenas tardes, soy la doctora, mi nombre y apellido es ..., voy a controlar su embarazo.'),
 (2, 'Informe a la embarazada sobre el procedimiento que realizará con el objetivo de medir la altura uterina', F1, 'paciente', 0, {'info': 1}, 'hablar',
  'Se explica con lenguaje simple qué se va a hacer (medir la altura del útero, palpar y escuchar al bebé) y para qué: vigilar el crecimiento y la vitalidad fetal. Una embarazada informada coopera y se relaja.',
  [['informo'], ['le explico'], ['explico'], ['procedimiento'], ['voy a medir']], 'Le informo que voy a medir la altura del útero con una cinta, palpar su abdomen y escuchar los latidos del bebé para controlar su crecimiento.'),
 (3, 'Invitar a la embarazada a colocarse en decúbito dorsal', F1, 'camilla', 0, {'pos': 1}, 'decubito_obs',
  'Decúbito dorsal con el abdomen descubierto, el cuerpo alineado y las piernas ligeramente flexionadas para relajar la pared abdominal. Una posición incorrecta falsea la medición.',
  [['decubito dorsal'], ['boca arriba'], ['se acueste'], ['acuestese'], ['colocarse en decubito'], ['recueste']], 'La invito a colocarse en decúbito dorsal, boca arriba, con el abdomen descubierto.'),
 (4, 'Colóquese al lado derecho de la paciente, mirando a la mujer', F1, 'paciente', 0, {'lado': 1}, 'lado_der',
  'El examinador se ubica a la derecha de la paciente, de frente a su cara, para las maniobras 1, 2 y 3 y la medición de la altura uterina.',
  [['lado derecho'], ['a la derecha'], ['me coloco', 'derecha'], ['me ubico', 'derecha'], ['me paro', 'derecha']], 'Me coloco al lado derecho de la paciente, mirándola.'),
 (5, 'Palpe el borde superior del pubis con el dedo índice y mayor de la mano derecha', F2, 'pubis', 1, {'pubis': 1}, 'pubis_palpa',
  'El punto cero de la medición es el borde superior de la sínfisis pubiana: se lo localiza con las yemas de los dedos índice y mayor de la mano derecha. Un punto de partida incorrecto invalida la altura uterina.',
  [['palpo el borde superior del pubis'], ['palpo el pubis'], ['palpo', 'dedos indice y mayor'], ['palpo', 'sinfisis']], 'Palpo el borde superior del pubis con los dedos índice y mayor de la mano derecha.'),
 (6, 'Al mismo tiempo fijar el extremo de la cinta métrica en el borde superior del pubis en la numeración 0 de la cinta (0 el inicio)', F2, 'cinta', 1, {'cinta0': 1}, 'cinta_fija',
  'El extremo cero de la cinta obstétrica (flexible e inextensible) se fija sobre el borde superior del pubis con los dedos que lo palparon.',
  [['fijo la cinta'], ['extremo de la cinta'], ['numeracion 0'], ['cero de la cinta'], ['fijo', 'cinta'], ['cinta', 'pubis']], 'Fijo el extremo de la cinta, en la marca 0, sobre el borde superior del pubis.'),
 (7, 'Deslice entre los dedos índice y mayor de la mano izquierda la cinta hasta alcanzar el fondo uterino con el borde cubital de la mano', F2, 'fondo', 1, {'cinta': 1}, 'cinta_desliza',
  'La cinta se desliza entre los dedos índice y medio de la mano izquierda, siguiendo la línea media del abdomen, hasta que el borde cubital de esa mano alcanza el fondo uterino (donde el útero deja de ser palpable).',
  [['deslizo la cinta'], ['borde cubital'], ['fondo uterino'], ['desliza la cinta'], ['deslizo', 'cinta']], 'Deslizo la cinta entre los dedos índice y mayor de la mano izquierda hasta alcanzar el fondo uterino con el borde cubital de la mano.'),
 (8, 'Observe el número que marque con los dedos lo que representará la altura uterina en cm', F2, 'cinta', 1, {'leer': 1}, 'leer_au',
  'La altura uterina es el número que marca la cinta a nivel del borde cubital: se lee en centímetros. Entre las semanas 20 y 34 coincide aproximadamente con las semanas de amenorrea.',
  [['altura uterina es'], ['observo el numero'], ['leo'], ['marca la cinta'], ['la altura uterina'], ['numero que marca']], 'Observo el número que marca la cinta con mis dedos: es la altura uterina, en centímetros.'),
 (9, 'Dígalo a la embarazada y pregunte si recuerda la medición anterior', F2, 'paciente', 0, {'dice': 1}, 'hablar',
  'Se comunica el valor a la embarazada y se le pregunta si recuerda la medición anterior: permite comparar la velocidad de crecimiento entre controles.',
  [['le digo'], ['medicion anterior'], ['recuerda'], ['dice la medicion'], ['le informo la altura']], 'Le digo la medición a la embarazada y le pregunto si recuerda la medición anterior.'),
 (10, 'Registre los datos hallados en el gráfico de la curva de incremento de la Altura Uterina', F2, 'curva', 1, {'curva': 1}, 'curva_au',
  'La altura uterina se grafica en la curva de incremento de la AU (percentilos 10 y 90 según la edad gestacional): un punto por debajo del percentilo 10 sugiere restricción del crecimiento u oligoamnios; por encima del 90, macrosomía, polihidramnios o embarazo múltiple.',
  [['registro', 'curva'], ['grafico'], ['curva de incremento'], ['registro', 'altura uterina'], ['curva']], 'Registro el dato en el gráfico de la curva de incremento de la altura uterina.'),
 (11, 'Primera maniobra de Leopold: coloque sus manos a los lados del fondo uterino y doble los dedos alrededor de la parte superior (borde cubital). Palpe la forma, el tamaño, la consistencia, la movilidad', F3, 'fondo', 1, {'l1': 1}, 'leopold1',
  'La primera maniobra (de fondo) abarca el fondo con el borde cubital de ambas manos: se reconoce qué polo fetal lo ocupa (cabeza: dura, redonda y peloteable; nalgas: blanda, irregular y poco móvil) y se confirma la altura uterina.',
  [['primera maniobra'], ['maniobra de leopold 1'], ['leopold 1'], ['leopold uno'], ['1 maniobra'], ['primer leopold']], 'Primera maniobra de Leopold: coloco mis manos a los lados del fondo uterino y palpo con el borde cubital su forma, tamaño, consistencia y movilidad.'),
 (12, 'Segunda maniobra de Leopold: una mano a cada lado del útero, a mitad de camino entre la sínfisis y el fondo; presión a un lado empujando al feto hacia el otro y palpe el lado contrario; repita a la inversa', F3, 'paciente', 1, {'l2': 1}, 'leopold2',
  'La segunda maniobra (lateral) identifica la situación y la posición fetal: de un lado se palpa una superficie lisa, convexa y resistente (el dorso) y del otro, partes pequeñas e irregulares (miembros). Se repite empujando al feto hacia el lado contrario.',
  [['segunda maniobra'], ['maniobra de leopold 2'], ['leopold 2'], ['leopold dos'], ['2 maniobra'], ['segundo leopold']], 'Segunda maniobra de Leopold: una mano a cada lado del útero, presiono a un lado empujando al feto y palpo el lado contrario, y repito a la inversa.'),
 (13, 'Coloque el estetoscopio de Pinard sobre el abdomen en ángulo recto, en la zona del dorso fetal (foco máximo de auscultación), con la oreja en firme contacto; cuente los latidos en un minuto con reloj con segundero y tome el pulso materno', F3, 'pinard', 1, {'pinard': 1}, 'pinard',
  'El foco máximo está sobre el dorso fetal (hombro anterior). El Pinard se apoya en ángulo recto, la oreja lo sostiene sin tocarlo con las manos, y se cuentan los latidos durante 1 minuto con un reloj con segundero (normal 110–160 lpm). Simultáneamente se toma el pulso materno para no confundir los latidos maternos con los fetales.',
  [['pinard'], ['auscultacion'], ['auscultar'], ['latidos fetales'], ['foco maximo'], ['frecuencia cardiaca fetal'], ['fcf']], 'Coloco el estetoscopio de Pinard en ángulo recto sobre el dorso fetal, cuento los latidos durante un minuto con el reloj y tomo el pulso materno en simultáneo.'),
 (14, 'Tercera maniobra de Leopold: con el pulgar y el índice agarre la parte inferior del abdomen, inmediatamente por arriba de la sínfisis; presione con delicadeza y firmeza para palpar la parte presentada', F3, 'paciente', 1, {'l3': 1}, 'leopold3',
  'La tercera maniobra (de Pawlik) aprehende con pulgar e índice la parte que se presenta por encima de la sínfisis: permite saber qué polo se presenta (cabeza o nalgas) y si está móvil o fija (encajada).',
  [['tercera maniobra'], ['maniobra de leopold 3'], ['leopold 3'], ['leopold tres'], ['3 maniobra'], ['tercer leopold'], ['pawlik']], 'Tercera maniobra de Leopold: con el pulgar y el índice aprehendo la parte inferior del abdomen, por arriba de la sínfisis, y palpo la parte que se presenta.'),
 (15, 'Oriéntese mirando hacia los pies de la mujer, asegurándose de que tenga las rodillas dobladas', F3, 'paciente', 0, {'pies': 1}, 'pies_obs',
  'Para la cuarta maniobra el examinador se da vuelta y mira hacia los pies de la embarazada, que flexiona las rodillas para relajar los músculos abdominales.',
  [['hacia los pies'], ['mirando los pies'], ['rodillas dobladas'], ['rodillas flexionadas'], ['flexione las rodillas'], ['me oriento']], 'Me oriento mirando hacia los pies de la mujer y le pido que doble las rodillas.'),
 (16, 'Cuarta maniobra de Leopold: una mano a cada lado del útero, palmas justo por debajo del ombligo y dedos dirigidos hacia la sínfisis; presione profundamente con las yemas y mueva los dedos hacia la entrada pélvica', F3, 'paciente', 1, {'l4': 1}, 'leopold4',
  'La cuarta maniobra (pelviana) deprime profundamente hacia la entrada de la pelvis: informa el grado de encajamiento de la parte presentada (si los dedos convergen, la cabeza no está encajada; si divergen, está encajada) y la actitud de la cabeza.',
  [['cuarta maniobra'], ['maniobra de leopold 4'], ['leopold 4'], ['leopold cuatro'], ['4 maniobra'], ['cuarto leopold']], 'Cuarta maniobra de Leopold: apoyo las manos a cada lado del útero, con los dedos hacia la sínfisis, y deprimo profundamente hacia la entrada de la pelvis.'),
 (17, 'Comunica a la paciente que finalizó el examen y le indica que se vista y tome asiento', F4, 'paciente', 0, {'fin': 1}, 'hablar',
  'Se avisa que terminó el examen, se resguarda la intimidad mientras se viste y se la invita a sentarse para comentar los hallazgos.',
  [['finalizo el examen'], ['termino el examen'], ['se vista'], ['tome asiento'], ['finalizamos'], ['hemos terminado']], 'Le comunico que finalizó el examen y le indico que se vista y tome asiento.'),
 (18, 'Escucha y responde a las preguntas, preocupaciones y molestias de la paciente', F5, 'paciente', 0, {'preg': 1}, 'hablar',
  'Se da espacio para dudas y se explican los hallazgos en lenguaje claro, con tranquilidad: la comunicación sostiene la adherencia a los controles prenatales.',
  [['preguntas'], ['dudas'], ['preocupaciones'], ['escucho'], ['molestias']], 'Escucho y respondo las preguntas, preocupaciones y molestias de la paciente.'),
 (19, 'Saluda y se despide', F5, 'paciente', 0, {'sal': 1}, 'hablar',
  'El saludo final cierra la consulta y se acuerda el próximo control.',
  [['me despido'], ['hasta luego'], ['hasta la proxima'], ['nos vemos'], ['saludo y me despido'], ['chau']], 'Saludo y me despido de la paciente hasta el próximo control.'),
]
pasos = []
for n, tx, fa, tg, cr, es, fx, ex, cl, fr in P:
    pasos.append(dict(n=n, texto=tx, fase=fa, target=tg, critico=bool(cr), explica=ex, estado=es, claves=cl, frase=fr, fx=fx))

EL = {
 'paciente': ('Embarazada', 'Se la saluda, se le explica el examen, se la ubica en decúbito dorsal y se le informan los hallazgos.'),
 'camilla': ('Camilla', 'Decúbito dorsal con el abdomen descubierto.'),
 'pubis': ('Borde superior del pubis', 'Punto cero de la medición de la altura uterina.'),
 'cinta': ('Cinta obstétrica', 'Cinta flexible e inextensible, con el 0 en el borde superior del pubis.'),
 'fondo': ('Fondo uterino', 'Extremo superior del útero: hasta ahí se mide la altura uterina.'),
 'curva': ('Curva de incremento de la AU', 'Gráfico con los percentilos 10 y 90 de la altura uterina según la edad gestacional.'),
 'pinard': ('Estetoscopio de Pinard', 'Cuerno de madera para auscultar los latidos fetales sobre el dorso fetal.'),
 'reloj': ('Reloj con segundero', 'Para contar los latidos fetales durante un minuto y tomar el pulso materno.'),
 'manos': ('Manos', 'Higiene de manos antes de tocar a la embarazada.'),
 'carnet': ('Carnet perinatal', 'Se registran la altura uterina, el peso, la presión arterial y la FCF.'),
}
elementos = {k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasos if p['target'] == k]) for k, v in EL.items()}

def dd(i, t, c, pq, tg, cl, **kw):
    o = dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl); o.update(kw); return o
distractores = [
 dd('d1', 'Mide la altura uterina desde el ombligo o desde otro punto que no sea el borde superior del pubis', 1, 'Es criterio de desaprobación: el cero de la cinta va en el borde superior de la sínfisis pubiana.', 'pubis', [['desde el ombligo'], ['desde la cicatriz umbilical'], ['desde el apendice xifoides'], ['desde el hueso pubiano'], ['desde las espinas'], ['desde la cresta iliaca']]),
 dd('d2', 'Mide con una cinta métrica común (de costura) o la deja floja', 0, 'Se usa la cinta obstétrica, flexible e inextensible, bien apoyada sobre la piel.', 'cinta', [['cinta de costura'], ['metro de costura'], ['cinta metrica comun'], ['regla']]),
 dd('d3', 'Mide la altura uterina con la paciente sentada o de costado', 1, 'Es criterio de desaprobación: la medición se hace en decúbito dorsal.', 'camilla', [['sentada'], ['de costado'], ['decubito lateral'], ['parada'], ['de pie']]),
 dd('d4', 'Se coloca a la izquierda de la paciente para medir', 0, 'El examinador se ubica al lado derecho de la paciente, de frente a ella.', 'paciente', [['lado izquierdo'], ['a la izquierda de la paciente'], ['me coloco', 'izquierda']]),
 dd('d5', 'Ausculta con el estetoscopio de Pinard sin identificar antes el dorso fetal', 1, 'Es criterio de desaprobación: el foco máximo está sobre el dorso fetal, que se identifica con las maniobras de Leopold.', 'pinard', [['sin identificar el dorso'], ['sin palpar el dorso'], ['ausculto cualquier lugar'], ['sin ubicar el dorso']]),
 dd('d6', 'Sujeta el Pinard con las manos mientras cuenta los latidos', 0, 'El estetoscopio de Pinard se sostiene con la presión de la oreja, sin agarrarlo con las manos.', 'pinard', [['sostengo el pinard con la mano'], ['agarro el pinard'], ['sujeto el pinard'], ['con las manos el pinard']]),
 dd('d7', 'Cuenta los latidos fetales durante 15 segundos o menos', 1, 'Es criterio de desaprobación: los latidos se cuentan durante un minuto completo con reloj con segundero.', 'reloj', [['15 segundos'], ['10 segundos'], ['30 segundos'], ['cuento 15'], ['cuarto de minuto']]),
 dd('d8', 'No toma el pulso materno al auscultar', 0, 'El pulso materno se toma simultáneamente para no confundir los latidos maternos con los fetales.', 'reloj', [['sin tomar el pulso materno'], ['no tomo el pulso'], ['sin pulso materno']]),
 dd('d9', 'Realiza las maniobras de Leopold con las manos frías o con fuerza excesiva', 0, 'Las maniobras se hacen con delicadeza, con las manos tibias, para no desencadenar contracciones ni molestias.', 'paciente', [['con fuerza excesiva'], ['manos frias'], ['con brusquedad'], ['presiono con fuerza']]),
 dd('d10', 'Realiza la cuarta maniobra mirando hacia la cara de la paciente', 1, 'Es criterio de desaprobación: para la cuarta maniobra el examinador mira hacia los pies de la mujer.', 'paciente', [['cuarta maniobra', 'hacia la cara'], ['cuarta maniobra', 'mirando a la paciente'], ['cuarta maniobra', 'de frente']]),
 dd('d11', 'No registra la altura uterina en la curva', 1, 'Es criterio de desaprobación: la altura uterina se grafica en la curva de incremento para detectar desvíos del crecimiento.', 'curva', [['no registro'], ['sin registrar'], ['sin graficar'], ['omito el registro']]),
 dd('d12', 'No informa a la embarazada sobre el procedimiento', 0, 'Se explica qué se va a hacer y para qué antes de tocar a la paciente.', 'paciente', [['sin informar'], ['no le explico'], ['sin explicar']]),
]

def caso(i, nombre, edad, ant, motivo, eg, au, pres, dorso, fcf, enc, au_prev=None, eg_prev=None, extra=None, hall=None):
    esp = eg
    if au >= esp + 3.5: cls = 'alta'
    elif au <= esp - 3.5: cls = 'baja'
    else: cls = 'normal'
    au_txt = {'normal': 'Entre los percentilos 10 y 90: crecimiento adecuado.', 'baja': 'Por debajo del percentilo 10: sospechar restricción del crecimiento fetal u oligoamnios.', 'alta': 'Por encima del percentilo 90: sospechar macrosomía, polihidramnios o embarazo múltiple.'}[cls]
    lado = 'derecha' if dorso == 'der' else 'izquierda'; otro = 'izquierda' if dorso == 'der' else 'derecha'
    if pres == 'cefalica':
        l1 = 'En el fondo uterino se palpa un polo blando, grande, irregular y poco móvil: corresponde a las nalgas fetales.'
        l3 = 'Por encima de la sínfisis se palpa un polo duro, redondeado, que se mueve entre los dedos (peloteo): es la cabeza fetal.' if not enc else 'Por encima de la sínfisis se palpa un polo duro y redondeado, fijo, que no se moviliza: cabeza encajada.'
        l4 = 'Los dedos convergen hacia la pelvis y chocan con la cabeza: la cabeza no está encajada, está móvil.' if not enc else 'Los dedos no pueden juntarse y divergen hacia la pelvis: la cabeza está encajada.'
        foco = f'Foco máximo en el cuadrante inferior {lado} (sobre el dorso fetal): {fcf} lpm, regular. Pulso materno: 84 lpm, distinto del fetal.'
    elif pres == 'podalica':
        l1 = 'En el fondo uterino se palpa un polo duro, redondeado, móvil y que peloteaba entre los dedos: es la cabeza fetal.'
        l3 = 'Por encima de la sínfisis se palpa un polo blando, irregular y poco definido: son las nalgas fetales.'
        l4 = 'Los dedos descienden hacia la pelvis sin encontrar un polo duro: las nalgas están altas y no encajadas.'
        foco = f'Foco máximo por encima del ombligo, del lado {lado} (dorso fetal): {fcf} lpm, regular. Pulso materno: 82 lpm.'
    else:
        l1 = 'El fondo uterino está ocupado por un polo fetal ausente: el fondo se palpa vacío y el útero es más ancho que alto.'
        l3 = 'Por encima de la sínfisis la excavación está vacía: no hay parte fetal en la entrada de la pelvis.'
        l4 = 'Los dedos llegan a la entrada de la pelvis sin encontrar ninguna parte fetal.'
        foco = f'Foco máximo a nivel del ombligo, del lado {lado} (dorso fetal): {fcf} lpm, regular. Pulso materno: 86 lpm.'
    if pres == 'cefalica': l2 = f'Del lado {lado} se palpa una superficie lisa, convexa y resistente (dorso fetal) y del lado {otro}, partes pequeñas e irregulares (miembros). Situación longitudinal.'
    elif pres == 'podalica': l2 = f'Del lado {lado} se palpa el dorso fetal (liso, convexo y resistente) y del {otro}, partes pequeñas e irregulares (miembros). Situación longitudinal.'
    else: l2 = f'El útero se palpa más ancho que alto: de un lado una masa redonda y dura (cabeza) y del otro, una masa blanda (nalgas); el dorso mira hacia la {lado}. Situación transversa.'
    c = dict(id=i, nombre=nombre, sexo='F', edad=edad, motivo=motivo, indicacion='Control prenatal con examen obstétrico.', antecedentes=ant, alergia=None,
             eg=eg, au=au, au_prev=au_prev, eg_prev=eg_prev, presentacion=pres, dorso=dorso, fcf=fcf, encajada=enc, extra=extra or [], au_txt=au_txt,
             hall_au=f'La altura uterina es de {au} cm (edad gestacional: {eg} semanas).', hall_dice=(f'La embarazada responde: «Sí, la vez anterior me midieron {au_prev} cm».' if au_prev is not None else 'La embarazada responde: «No, es mi primer control en esta clínica».'),
             hall_curva=f'Punto graficado en la curva: AU {au} cm a las {eg} semanas. {au_txt}',
             hall_l1=l1, hall_l2=l2, hall_pinard=foco, hall_l3=l3, hall_l4=l4)
    return c
casos = [
 caso('c1', 'Camila R.', 24, 'Primigesta (G1P0). Sin antecedentes patológicos. Sin alergias conocidas.', 'Control prenatal de rutina. Refiere movimientos fetales activos.', 36, 35, 'cefalica', 'izq', 144, False, 32, 32, ['Embarazo de 36 semanas']),
 caso('c2', 'Lucía M.', 31, 'G2P1 con un parto vaginal previo. Sin patologías. Sin alergias conocidas.', 'Control prenatal. Sin molestias.', 28, 28, 'cefalica', 'der', 150, False, 25, 25, ['Embarazo de 28 semanas']),
 caso('c3', 'Gabriela P.', 38, 'G3P2. Hipertensión arterial crónica. Sin alergias conocidas.', 'Control prenatal; percibe pocos movimientos fetales.', 34, 28, 'cefalica', 'izq', 136, False, 26, 30, ['AU menor a la esperada']),
 caso('c4', 'Natalia S.', 29, 'G1P0. Diabetes gestacional en tratamiento. Sin alergias conocidas.', 'Control prenatal; abdomen muy grande para su embarazo.', 32, 38, 'podalica', 'der', 148, False, 33, 28, ['AU mayor a la esperada']),
 caso('c5', 'Romina T.', 27, 'G2P1 (cesárea previa). Sin alergias conocidas.', 'Control prenatal a las 38 semanas.', 38, 37, 'transversa', 'izq', 140, False, 35, 35, ['Situación transversa']),
 caso('c6', 'Valeria D.', 22, 'G1P0. Sin antecedentes. Sin alergias conocidas.', 'Control prenatal a las 40 semanas, con contracciones irregulares.', 40, 36, 'cefalica', 'izq', 132, True, 37, 38, ['Cabeza encajada']),
 caso('c7', 'Paula G.', 34, 'G3P2. Sin patologías. Sin alergias conocidas.', 'Control prenatal; la ecografía mostró presentación podálica.', 30, 30, 'podalica', 'izq', 146, False, 27, 28, ['Presentación podálica']),
]
for c in casos:
    pass
Q = [
 ('¿Desde dónde se mide la altura uterina?', ['Desde el borde superior de la sínfisis pubiana hasta el fondo uterino', 'Desde el ombligo hasta el apéndice xifoides', 'Desde el borde inferior del pubis hasta el ombligo', 'Desde la espina ilíaca hasta el fondo'], 0, 'La cinta obstétrica se fija con el 0 en el borde superior del pubis y se desliza por la línea media hasta el fondo uterino.'),
 ('¿Con qué parte de la mano se llega al fondo uterino al medir?', ['Con el borde cubital de la mano izquierda', 'Con la yema del pulgar', 'Con el dorso de la mano', 'Con la palma completa'], 0, 'La cinta se desliza entre los dedos índice y medio y el borde cubital delimita el fondo.'),
 ('Entre las semanas 20 y 34, ¿cuánto se espera que mida la altura uterina?', ['Aproximadamente tantos centímetros como semanas de gestación', 'La mitad de las semanas', 'El doble de las semanas', 'Siempre 30 cm'], 0, 'La altura uterina coincide aproximadamente con la edad gestacional en semanas entre las semanas 20 y 34.'),
 ('Una altura uterina por debajo del percentilo 10 sugiere...', ['Restricción del crecimiento fetal u oligoamnios', 'Polihidramnios', 'Macrosomía fetal', 'Embarazo gemelar'], 0, 'Por debajo del percentilo 10: crecimiento restringido, oligoamnios, error de EG o feto muerto.'),
 ('Una altura uterina por encima del percentilo 90 sugiere...', ['Macrosomía, polihidramnios, embarazo múltiple o error de EG', 'Restricción del crecimiento', 'Oligoamnios', 'Placenta previa'], 0, 'Por encima del percentilo 90: feto grande, exceso de líquido amniótico o embarazo múltiple.'),
 ('¿Qué se identifica con la primera maniobra de Leopold?', ['El polo fetal que ocupa el fondo uterino y la altura del fondo', 'La posición del dorso', 'El encajamiento de la cabeza', 'La frecuencia cardíaca fetal'], 0, 'La maniobra de fondo reconoce qué polo (cabeza o nalgas) ocupa el fondo.'),
 ('¿Qué se identifica con la segunda maniobra de Leopold?', ['La posición del dorso fetal y la situación', 'El encajamiento', 'La altura uterina', 'El peso fetal'], 0, 'La maniobra lateral distingue el dorso (liso y resistente) de las partes pequeñas.'),
 ('¿Dónde se coloca el estetoscopio de Pinard?', ['En ángulo recto sobre el dorso fetal, en el foco máximo de auscultación', 'Sobre el ombligo siempre', 'Sobre las partes pequeñas fetales', 'Sobre el fondo uterino siempre'], 0, 'El foco máximo está sobre el hombro anterior, es decir sobre el dorso fetal.'),
 ('¿Cuánto tiempo se cuentan los latidos fetales?', ['Un minuto completo con reloj con segundero', '15 segundos y se multiplica por 4', '5 segundos', 'No se cuentan'], 0, 'Se cuentan durante un minuto con un reloj con segundero (normal: 110 a 160 lpm).'),
 ('¿Por qué se toma el pulso materno mientras se ausculta?', ['Para no confundir los latidos maternos con los fetales', 'Para medir la presión arterial', 'Para calcular la edad gestacional', 'No es necesario'], 0, 'Si la frecuencia es igual a la materna, probablemente se están escuchando latidos maternos.'),
 ('¿Qué parte fetal se palpa con la tercera maniobra de Leopold?', ['La parte que se presenta, por encima de la sínfisis', 'El fondo', 'El dorso', 'El cordón umbilical'], 0, 'La maniobra de Pawlik aprehende la parte presentada y permite saber si está móvil o fija.'),
 ('En la cuarta maniobra de Leopold, ¿hacia dónde mira el examinador?', ['Hacia los pies de la paciente', 'Hacia la cara de la paciente', 'Hacia la pared', 'Da igual'], 0, 'Se da vuelta, mira hacia los pies y deprime hacia la entrada de la pelvis para evaluar el encajamiento.'),
 ('Si en el fondo uterino se palpa un polo blando e irregular y por arriba de la sínfisis uno duro y redondeado, ¿cuál es la presentación?', ['Cefálica', 'Podálica', 'Transversa', 'No se puede saber'], 0, 'Nalgas en el fondo y cabeza abajo: presentación cefálica (situación longitudinal).'),
 ('¿Cuál es el rango normal de la frecuencia cardíaca fetal?', ['110 a 160 latidos por minuto', '60 a 100', '160 a 200', '80 a 120'], 0, 'La FCF basal normal es de 110 a 160 lpm.'),
]
fund = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in Q]

machete = {'perlas': [
 {'t': 'Antes de empezar', 'x': 'Presentate, explicá el examen, decúbito dorsal con el abdomen descubierto y colocate a la derecha de la paciente, de frente a ella.'},
 {'t': 'Altura uterina', 'x': 'Cero de la cinta en el borde superior del pubis; deslizala por la línea media entre los dedos índice y medio de la mano izquierda hasta el fondo (borde cubital). Leé en cm, decíselo a la paciente, preguntá la medición anterior y graficala en la curva.'},
 {'t': 'Leopold 1 y 2', 'x': '1: manos a los lados del fondo, ¿qué polo hay? 2: una mano a cada lado, empujá y palpá: dorso (liso, convexo, resistente) vs. partes pequeñas.'},
 {'t': 'Auscultación', 'x': 'Pinard en ángulo recto sobre el dorso fetal, oreja firme sin sostenerlo con la mano; 1 minuto con reloj con segundero (110–160 lpm) y pulso materno en simultáneo.'},
 {'t': 'Leopold 3 y 4', 'x': '3: pulgar e índice por arriba de la sínfisis, parte presentada, ¿móvil o fija? 4: mirando hacia los pies, rodillas dobladas, dedos hacia la entrada pélvica: ¿encajada?'},
 {'t': 'Cierre', 'x': 'Avisá que terminó, que se vista y se siente, escuchá sus preguntas y despedite.'}],
 'por_paso': {'5': 'Cero de la medición: borde superior del pubis.', '7': 'Borde cubital de la mano izquierda hasta el fondo.', '10': 'Graficá la AU: P10–P90.', '13': 'Pinard sobre el dorso fetal, 1 minuto y pulso materno.', '15': 'Para la 4.ª maniobra, mirando hacia los pies.'}}

CRIT = dict(
 criterios_texto='Desaprueba si omite o realiza mal: el punto de partida y la técnica de medición de la altura uterina (pasos 5 a 8) o su registro en la curva (10); las cuatro maniobras de Leopold (11, 12, 14 y 16); o la auscultación de la frecuencia cardíaca fetal con el estetoscopio de Pinard durante un minuto (13).',
 criterios=[
  dict(ico='📏', titulo='Medición de la altura uterina: pubis, cinta y fondo', pasos=[5, 6, 7, 8]),
  dict(ico='📈', titulo='Registro en la curva de incremento de la AU', pasos=[10]),
  dict(ico='🤲', titulo='Maniobras de Leopold completas y en orden', pasos=[11, 12, 14, 16]),
  dict(ico='🩺', titulo='Auscultación de la FCF con Pinard durante un minuto', pasos=[13])],
 final_criticos='medición de la altura uterina, registro en la curva, maniobras de Leopold y auscultación de la FCF')

ALG = dict(titulo='Valores de referencia del control obstétrico', boton_titulo='Ver valores de referencia', boton_sub='AU, FCF y maniobras de Leopold', aviso='los valores de referencia',
 flecha='▼ Interpretación de la altura uterina', flecha_final='▼ Conducta', pie='Altura uterina ≈ semanas de gestación entre las semanas 20 y 34 (percentilos 10 y 90 de la curva).',
 comun=[dict(t='Altura uterina', x='Del borde superior del pubis al fondo uterino, en cm, con cinta obstétrica.', flag='leer'), dict(t='FCF normal', x='110 a 160 lpm, regular; contar 1 minuto y tomar el pulso materno.', flag='pinard')],
 columnas=[
  dict(titulo='AU < percentilo 10', cls='nd', nodos=[dict(t='Sospechar', x='Restricción del crecimiento, oligoamnios, error de EG.', flag='curva'), dict(t='Conducta', x='Ecografía obstétrica y Doppler; control de la vitalidad fetal.', flag='curva')]),
  dict(titulo='AU entre P10 y P90', cls='nd', nodos=[dict(t='Crecimiento adecuado', x='Continuar el control prenatal de rutina.', flag='curva')]),
  dict(titulo='AU > percentilo 90', cls='fv', nodos=[dict(t='Sospechar', x='Macrosomía, polihidramnios, embarazo múltiple, error de EG.', flag='curva'), dict(t='Conducta', x='Ecografía obstétrica; descartar diabetes gestacional.', flag='curva')])],
 final=[dict(t='Leopold 1 y 2', x='Polo del fondo, situación y posición (lado del dorso).', flag='l2'), dict(t='Leopold 3 y 4', x='Parte presentada y encajamiento.', flag='l4')])

EX = dict(id='exobs', area='sim', titulo='Examen obstétrico', icono='🫄',
 resumen='Recorrido virtual del examen obstétrico con 19 pasos de la lista de cotejo: medición de la altura uterina con cinta, las cuatro maniobras de Leopold, auscultación de la frecuencia cardíaca fetal con estetoscopio de Pinard y registro en la curva de incremento.',
 umbral=60, fuente='Lista de cotejo: Semiología obstétrica (19 ítems)',
 elementos=elementos, distractores=distractores, casos=casos, fundamentos=fund, voz=True, algoritmo=ALG,
 hallazgo_pasos={'8': 'hall_au', '9': 'hall_dice', '10': 'hall_curva', '11': 'hall_l1', '12': 'hall_l2', '13': 'hall_pinard', '14': 'hall_l3', '16': 'hall_l4'},
 hallazgo_rotulos={'8': '📏 Medís:', '9': '🗣', '10': '📈', '11': '🤲 Palpás:', '12': '🤲 Palpás:', '13': '🩺 Auscultás:', '14': '🤲 Palpás:', '16': '🤲 Palpás:'},
 hallazgo_voz={'9': 'f'},
 machete=machete, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/sim/exobs_modelo.json', peso_modelo='2 a 3 MB', instrumental='data/acreditaciones/sim/instrumental_exobs.json', mesa_pasos=[], pasos=pasos)
EX.update(CRIT)
W(OUT + 'exobs.json', EX)

# ------------------------------------------------------------------ instrumental
def it(id, grupo, nombre, detalle, correcto, critico, desc, ficha, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=desc, ficha=ficha); o.update(kw); return o
items = [
 it('cinta_obstetrica', 'medir', 'Cinta obstétrica', 'Flexible e inextensible · 0 a 50 cm', True, True, 'Cinta con el 0 en el extremo, para medir la altura uterina desde el borde superior del pubis hasta el fondo.', [['Material', 'Flexible, inextensible'], ['Longitud', '50 cm']], falta='Falta la cinta obstétrica: sin ella no se puede medir la altura uterina.'),
 it('pinard', 'auscultar', 'Estetoscopio de Pinard', 'Cuerno de madera', True, True, 'Permite auscultar los latidos fetales apoyando la campana sobre el dorso fetal y la oreja en el extremo plano.', [['Material', 'Madera'], ['Uso', 'Auscultación fetal']], falta='Falta el estetoscopio de Pinard para auscultar los latidos fetales.'),
 it('reloj_segundero', 'auscultar', 'Reloj con segundero', 'Para contar durante 1 minuto', True, True, 'Para contar los latidos fetales durante un minuto y tomar el pulso materno.', [['Función', 'Cronómetro / segundero']], falta='Falta un reloj con segundero para contar los latidos durante un minuto.'),
 it('curva_au', 'registro', 'Gráfico de la curva de incremento de la AU', 'Percentilos 10 y 90', True, True, 'Curva donde se registra la altura uterina según la edad gestacional.', [['Percentilos', '10 y 90']], falta='Falta el gráfico de la curva de incremento de la altura uterina.'),
 it('carnet_perinatal', 'registro', 'Carnet perinatal', 'Historia clínica perinatal', True, False, 'Se registran la altura uterina, la presión arterial, el peso y la FCF en cada control.', [['Documento', 'Carnet perinatal']], opcional=True),
 it('camilla_obs', 'confort', 'Camilla con almohada', 'Para decúbito dorsal', True, False, 'Superficie cómoda para que la embarazada se acueste en decúbito dorsal.', [['Uso', 'Decúbito dorsal']]),
 it('alcohol_gel', 'confort', 'Alcohol en gel', 'Higiene de manos', True, False, 'Higiene de manos antes de tocar a la embarazada.', [['Uso', 'Higiene de manos']]),
 it('estetoscopio_c', 'otros', 'Estetoscopio común', 'Para auscultación adulta', False, False, 'Estetoscopio biauricular.', [['Uso', 'Auscultación adulta']], feedback='En el examen obstétrico de la lista de cotejo se usa el estetoscopio de Pinard (cuerno de madera); un estetoscopio común no sirve para localizar el foco máximo fetal.'),
 it('cinta_costura', 'otros', 'Cinta métrica de costura', 'Tela', False, False, 'Cinta de tela.', [['Uso', 'Costura']], feedback='Se usa la cinta obstétrica (flexible e inextensible); una cinta de costura se estira y falsea la medición.'),
 it('especulo', 'otros', 'Espéculo vaginal', 'Descartable', False, False, 'Instrumento para el examen ginecológico.', [['Uso', 'Examen ginecológico']], feedback='El espéculo no se usa en el examen obstétrico abdominal.'),
 it('doppler', 'otros', 'Doppler fetal portátil', 'Detector de latidos', False, False, 'Detector ultrasónico de latidos fetales.', [['Uso', 'Auscultación fetal']], feedback='La lista de cotejo indica auscultar con el estetoscopio de Pinard y contar un minuto con reloj; el Doppler es una alternativa pero no es lo que se evalúa.'),
 it('balanza_pie', 'otros', 'Balanza de pie', 'Peso materno', False, False, 'Balanza.', [['Uso', 'Peso corporal']], feedback='El peso se registra en el control prenatal, pero no forma parte de este examen.', opcional=False),
]
INS = dict(id='exobs', titulo='Consultorio de control prenatal · Examen obstétrico',
 consigna='Leé el caso clínico y reuní lo que hace falta para el examen obstétrico: medición, auscultación y registro. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='control prenatal con examen obstétrico', indicacion_def='Control prenatal con examen obstétrico.',
 mision=['qué instrumentos hacen falta para medir y auscultar;', 'qué insumos no corresponden.'],
 demo_caso='Primero se lee el caso: la edad gestacional y los antecedentes orientan lo que se espera encontrar.',
 grupos=[dict(id='medir', titulo='Medición'), dict(id='auscultar', titulo='Auscultación'), dict(id='registro', titulo='Registro'), dict(id='confort', titulo='Confort e higiene'), dict(id='otros', titulo='Otros insumos')],
 items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_exobs.json', INS)

# ------------------------------------------------------------------ modelo 3D
M = J('data/acreditaciones/siam/sv_modelo.json')
glb = lambda id, carpeta, f, capa, color, op, hs, nom, peso, **kw: dict(id=id, tipo='glb', src=f'assets/anatomia/{carpeta}/{f}.glb', escala=100, rot=[0, 0, 0], pos=[0, 0, 0], capa=capa, color=color, opacidad=op, hs=hs, nombre=nom, peso=peso, **kw)
piezas = [
 glb('piel', 'sim', 'torso_f', 'piel', '#e8b89c', 0.46, None, 'Paciente', 1255052, piel_real=True),
 glb('pelvis', 'hra', 'pelvis_f', 'huesos', '#e8e1cf', 0.55, 'pelvis', 'Pelvis ósea', 120000),
]
OVERLAY = ''
VAR = dict(origen=[0, 17, 6], corte_x=0.0, rotacion=[-1.5707963, 3.1415927, 0], piezas=piezas, procedurales={},
 pines=dict(pubis=[-1.5, 0.6, 2.4], fondo=[0, 30, 12], ombligo=[0, 19, 9.6], foco=[-5, 12, 14]),
 camara=dict(lat=[60, 14, 0], fro=[0, 14, 60], sup=[3, 66, 0.01], objetivo=[0, 0, 0], ini=[36, 38, 26]),
 etiquetas=dict(pubis=[-110, 40], fondo=[110, -60], ombligo=[110, 30], foco=[-110, -50]))
G = dict(M['general']); G['vistas'] = dict(fro='Pies'); G['camara'] = dict(M['general']['camara'], foco=26, min=10, max=140)
IM = dict(general=G, overlay_html=OVERLAY,
 tarjetas=dict(
  mesa=dict(titulo='🧰 Material del control', id='mesa', items=[['cinta', '📏', 'Cinta', 'obstétrica'], ['pinard', '🩺', 'Estetoscopio', 'de Pinard'], ['reloj', '⏱️', 'Reloj con', 'segundero'], ['curva', '📈', 'Curva', 'de la AU'], ['manos', '🫧', 'Higiene', 'de manos']]),
  entorno=dict(titulo='🏥 Consultorio', items=[['paciente', '🤰', 'Embarazada', ''], ['camilla', '🛏️', 'Camilla', ''], ['carnet', '📒', 'Carnet', 'perinatal']])),
 chips=[['pos', 'Decúbito dorsal'], ['cinta0', 'Cinta en el pubis'], ['leer', 'AU medida'], ['curva', 'AU graficada'], ['l1', 'Leopold 1'], ['l2', 'Leopold 2'], ['pinard', 'FCF'], ['l3', 'Leopold 3'], ['l4', 'Leopold 4']],
 usables=['cinta', 'pinard', 'reloj', 'curva', 'manos', 'paciente', 'camilla', 'carnet', 'pubis'],
 pines=[dict(id='pubis', label='Borde superior del pubis (0 de la cinta)', capa='piel', externo=True), dict(id='fondo', label='Fondo uterino', capa='piel', externo=True), dict(id='ombligo', label='Ombligo', capa='piel', externo=True), dict(id='foco', label='Foco de auscultación', capa='sonda', solo_con='instrumento')],
 instrumentos=[dict(id='gravida', tipo='gravida', eg_defecto=36), dict(id='obs', tipo='obs', clases=dict(pubis='s-pubis', cinta0='s-cinta0', cinta='s-cinta', leer='s-leer', curva='s-curva', l1='s-l1', l2='s-l2', pinard='s-pinard', l3='s-l3', l4='s-l4', fin='s-fin'))],
 M=VAR, F=VAR)
W(OUT + 'exobs_modelo.json', IM)
print('ok exobs', len(pasos), 'pasos', len(casos), 'casos')
