import json, os, re
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/siam/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)

# =====================================================================  PASOS
# (n, texto de la cátedra, fase, target, critico, estado, fx, explica, claves, frase)
P = [
 (1, 'Reúne la totalidad de los materiales necesarios para la ejecución de la práctica', 'Preparación', 'mesa', 0, {}, 'reunir',
  'Se reúne todo antes de empezar para no interrumpir el procedimiento ni dejar solo al paciente: guantes de examen (de látex, o de nitrilo si hay alergia al látex), lubricante (vaselina sólida o líquida, o lidocaína en gel) y gasas o papel para la higiene final.',
  [['reuno'], ['junto', 'material'], ['junto', 'insumos'], ['recopilo'], ['armo', 'material']], 'Reúno todo el material necesario para el tacto rectal.'),
 (2, 'Prepara los materiales sobre una mesa alta de traslado', 'Preparación', 'mesa', 0, {}, 'reunir',
  'Los insumos se ordenan sobre la mesa alta de traslado (carro) para llevarlos juntos, limpios y al alcance de la mano.',
  [['mesa alta'], ['mesa', 'traslado'], ['preparo', 'mesa'], ['ordeno', 'mesa']], 'Preparo los materiales sobre la mesa alta de traslado.'),
 (3, 'Lleva el carro de transporte (con los materiales necesarios) al lado del paciente', 'Preparación', 'lado', 0, {}, 'trasladar',
  'El carro queda junto al paciente, al alcance de la mano dominante, para no tener que salir a buscar insumos durante la exploración.',
  [['llevo', 'carro'], ['llevo', 'mesa'], ['traslado', 'paciente'], ['acerco', 'carro'], ['carro', 'paciente'], ['llevo', 'material']], 'Llevo el carro con el material al lado del paciente.'),
 (4, 'Saluda y se presenta', 'Comunicación', 'paciente', 0, {}, 'hablar',
  'Saludar y presentarse con nombre y apellido genera confianza y permite verificar la identidad del paciente.',
  [['saludo'], ['me presento'], ['buen dia'], ['buenas tardes']], 'Saludo al paciente y me presento con nombre y apellido.'),
 (5, 'Explica el procedimiento a realizar utilizando un lenguaje claro y sencillo.', 'Comunicación', 'paciente', 1, {}, 'hablar',
  'Se explica con palabras simples qué se va a hacer, para qué sirve y qué va a sentir (presión, ganas de defecar), y que puede avisar si algo molesta. Omitir la explicación y el consentimiento es criterio de desaprobación.',
  [['explico'], ['explicacion'], ['lenguaje', 'claro'], ['le cuento', 'procedimiento'], ['le comento', 'procedimiento']], 'Le explico el procedimiento con lenguaje claro y sencillo.'),
 (6, 'Solicita el consentimiento del paciente y su colaboración en el procedimiento', 'Comunicación', 'consent', 1, {'consent': 1}, 'hablar',
  'El tacto rectal es una maniobra invasiva y pudorosa: requiere el consentimiento y la colaboración del paciente. Se le ofrece la presencia de un acompañante o testigo si lo desea. Sin consentimiento no se comienza: es criterio de desaprobación.',
  [['consentimiento'], ['autoriza'], ['permiso'], ['colaboracion'], ['acepta', 'procedimiento']], 'Le solicito su consentimiento y su colaboración para el procedimiento.'),
 (7, 'Se lava las manos con técnica clínica', 'Bioseguridad y posición', 'lavabo', 1, {'manos': 1}, 'lavado',
  'El lavado de manos con técnica clínica antes de colocarse los guantes es una precaución estándar: protege al paciente y al operador. Omitirlo es criterio de desaprobación.',
  [['lavo', 'manos'], ['lavado', 'manos'], ['higienizo', 'manos'], ['lavo', 'mano']], 'Me lavo las manos con técnica clínica.'),
 (8, 'Se coloca los guantes (ó manoplas) de látex', 'Bioseguridad y posición', 'guantes', 1, {'gloves': 'ns'}, 'guante',
  'Se usan guantes de examen (o manoplas) de látex; si el paciente o el operador son alérgicos al látex, de nitrilo. No hace falta técnica estéril: es una maniobra limpia. Explorar sin guantes es criterio de desaprobación.',
  [['me coloco', 'guantes'], ['me pongo', 'guantes'], ['coloco', 'guantes'], ['pongo', 'guantes'], ['manoplas'], ['guantes', 'latex']], 'Me coloco los guantes de examen.'),
 (9, 'Solicita al paciente que se descubra la ropa de la cintura para abajo', 'Bioseguridad y posición', 'paciente', 0, {'desc': 1}, 'desnudar',
  'Se pide que se descubra de la cintura para abajo, resguardando la intimidad (puerta cerrada, biombo, sábana sobre lo que no se explora).',
  [['descubr', 'cintura'], ['se descubra'], ['ropa', 'cintura'], ['ropa interior'], ['desvista'], ['baje', 'pantalon'], ['descubro']], 'Le pido que se descubra la ropa de la cintura para abajo.'),
 (10, 'Solicita al paciente que se ubique en la posición más adecuada para la práctica.', 'Bioseguridad y posición', 'paciente', 0, {'pos': 1}, 'posicion_tr',
  'Posiciones: decúbito lateral izquierdo o de Sims (la más usada y la menos pudorosa), litotomía o ginecológica (permite la palpación bimanual y es de elección en pacientes postrados), genupectoral (exploración detallada y profunda de la mucosa) o de pie inclinado sobre la camilla.',
  [['posicion'], ['decubito'], ['sims'], ['genupectoral'], ['litotomia'], ['ginecologica'], ['de pie', 'inclin'], ['se acueste'], ['se recueste']], 'Le pido que se ubique en la posición adecuada, por ejemplo decúbito lateral izquierdo (Sims).'),
 (11, 'Separa las nalgas del paciente valiéndose de ambas manos ó de los dedos índice y pulgar de la mano no dominante dependiendo de la posición de exploración elegida.', 'Bioseguridad y posición', 'ano', 0, {'sep': 1}, 'separar',
  'Con ambas manos, o con el índice y el pulgar de la mano no dominante según la posición, se separan las nalgas para exponer el margen anal. La mano dominante queda libre para explorar.',
  [['separo', 'nalgas'], ['abro', 'nalgas'], ['separo', 'gluteos'], ['nalgas'], ['gluteos']], 'Separo las nalgas con la mano no dominante para exponer el margen anal.'),
 (12, 'Inspecciona la región y describe sus hallazgos.', 'Inspección y técnica', 'ano', 1, {'insp': 1}, 'inspeccion',
  'Se inspecciona la región perianal antes de tocar: piel, eritema, fisuras, fístulas, hemorroides externas, prolapso, lesiones, restos de heces o sangre, y se describe lo observado. Permite detectar contraindicaciones absolutas (fisura anal aguda, absceso anorrectal supurativo, trombosis hemorroidal aguda): en ese caso no se hace el tacto. Omitir la inspección es criterio de desaprobación.',
  [['inspecciono'], ['inspeccion'], ['observo', 'region'], ['observo', 'zona'], ['miro', 'region'], ['miro', 'zona'], ['examino', 'region'], ['describo', 'hallazgos'], ['perianal']], 'Inspecciono la región perianal y describo lo que observo.'),
 (13, 'Lubrica el dedo índice con vaselina (liquida ó gel) ó lidocaína gel.', 'Inspección y técnica', 'lubricante', 1, {'lub': 1}, 'lubricar',
  'Se lubrica el dedo índice con vaselina (sólida o líquida) o con lidocaína en gel. Sin lubricación la maniobra produce dolor intenso, contracción defensiva del esfínter y riesgo de desgarro de la mucosa: es criterio de desaprobación.',
  [['lubrico'], ['lubrica'], ['vaselina'], ['lidocaina'], ['lubricante']], 'Lubrico el dedo índice con vaselina o lidocaína en gel.'),
 (14, 'Informa al paciente el inicio del procedimiento.', 'Inspección y técnica', 'paciente', 0, {}, 'aviso',
  'Se avisa que se comienza, que va a sentir presión y que respire tranquilo y relaje la zona: favorece la colaboración y la relajación del esfínter.',
  [['aviso', 'comienzo'], ['informo', 'inicio'], ['le aviso'], ['voy a comenzar'], ['comienzo el procedimiento'], ['empiezo']], 'Le aviso al paciente que comienzo el procedimiento.'),
 (15, 'Apoya el dedo índice sobre el margen anal con su extremo distal en dirección al ombligo.', 'Inspección y técnica', 'ano', 1, {'apoyo': 1}, 'apoyar',
  'El dedo se apoya sobre el margen anal con su extremo distal orientado hacia el ombligo, alineado con el eje del canal anal. Introducirlo de golpe o en otra dirección (perpendicular, hacia el sacro) es criterio de desaprobación.',
  [['apoyo', 'dedo'], ['apoyo', 'margen'], ['apoyo', 'indice'], ['apoyo', 'ano']], 'Apoyo el dedo índice sobre el margen anal, con el extremo distal hacia el ombligo.'),
 (16, 'Aplica una presión suave (y sostenida por un breve momento) sobre el esfínter anal hasta lograr su relajación.', 'Inspección y técnica', 'esfinter', 1, {'relaj': 1}, 'presion',
  'Una presión suave y sostenida sobre el esfínter externo lo relaja por fatiga del reflejo de contracción. No se avanza hasta lograr la relajación; forzar el esfínter provoca dolor y traumatismo.',
  [['presion', 'esfinter'], ['presion suave'], ['presiono', 'esfinter'], ['espero', 'relaj'], ['relajacion', 'esfinter'], ['presion', 'sostenida'], ['hasta que se relaje']], 'Aplico una presión suave y sostenida sobre el esfínter hasta que se relaje.'),
 (17, 'Introduce el dedo índice siguiendo la dirección hacia el ombligo.', 'Inspección y técnica', 'recto', 1, {'ins': 1}, 'dedo_in',
  'Con el esfínter relajado se introduce el dedo con suavidad siguiendo el eje del canal anal, hacia el ombligo, y luego la concavidad del sacro dentro de la ampolla rectal. Nunca de golpe ni forzando: es criterio de desaprobación.',
  [['introduzco', 'dedo'], ['introduzco', 'indice'], ['inserto', 'dedo'], ['introduzco'], ['penetro'], ['avanzo', 'dedo'], ['ingreso', 'dedo']], 'Introduzco el dedo índice con suavidad, en dirección al ombligo.'),
 (18, 'Desplaza el pulpejo del dedo índice por la superficie mucosa del recto realizando un “barrido” en el mismo sentido y en sentido contrario al giro de las agujas del reloj reconociendo las estructuras anatómicas locales normales, diferenciándolas de las patológicas y describiéndolas.', 'Inspección y técnica', 'recto', 0, {'barrido': 1}, 'barrido',
  'Se recorre la mucosa con el pulpejo en sentido horario y antihorario, reconociendo lo normal y diferenciándolo de lo patológico: tono, ampolla rectal, masas, pólipos, estenosis, fecaloma, dolor. En el varón se palpa la próstata en la pared anterior (tamaño, consistencia, simetría, superficie, surco medio, dolor) y las vesículas seminales; en la mujer, el cuello uterino.',
  [['barrido'], ['barro'], ['palpo', 'mucosa'], ['recorro', 'recto'], ['sentido horario'], ['agujas del reloj'], ['palpo', 'paredes'], ['palpo', 'prostata'], ['desplazo', 'pulpejo']], 'Realizo el barrido de la mucosa en sentido horario y antihorario, describiendo lo que palpo.'),
 (19, 'Solicita al paciente que realice fuerza “como para apretar el dedo” y constata el tono del esfínter anal.', 'Inspección y técnica', 'esfinter', 0, {'tono': 1}, 'tono',
  'Se pide que apriete el dedo como para retener las heces: se valora el tono basal en reposo y la contracción voluntaria del esfínter (útil en incontinencia fecal y lesiones medulares).',
  [['tono'], ['apriete'], ['apretar', 'dedo'], ['contraiga', 'esfinter'], ['fuerza', 'dedo'], ['haga fuerza'], ['constato', 'esfinter']], 'Le pido que haga fuerza como para apretar mi dedo y constato el tono del esfínter.'),
 (20, 'Retira el dedo del canal ano-rectal.', 'Cierre', 'ano', 0, {'ret': 1}, 'retirar',
  'El dedo se retira con suavidad, sin brusquedad, por el mismo eje.',
  [['retiro', 'dedo'], ['saco', 'dedo'], ['extraigo', 'dedo'], ['retiro', 'canal']], 'Retiro el dedo del canal anorrectal.'),
 (21, 'Examina en el guante (ó manopla) la presencia-ausencia de materia fecal adherida y/o presencia-ausencia de moco, pus ó sangre en la misma, etc.', 'Cierre', 'guantes', 1, {'gex': 1}, 'examinar',
  'El guante aporta datos diagnósticos: heces (color, consistencia), sangre roja (rectorragia), negra y fétida (melena), moco o pus. Omitir este examen es criterio de desaprobación.',
  [['examino', 'guante'], ['reviso', 'guante'], ['inspecciono', 'guante'], ['observo', 'guante'], ['miro', 'guante'], ['examino', 'manopla']], 'Examino el guante en busca de materia fecal, moco, pus o sangre.'),
 (22, 'Se quita los guantes ó manoplas de látex.', 'Cierre', 'guantes', 1, {'gloves': 'none'}, 'guante_off',
  'Los guantes usados se retiran sin tocar su cara externa y se descartan en el residuo de riesgo biológico.',
  [['me quito', 'guantes'], ['retiro', 'guantes'], ['saco', 'guantes'], ['descarto', 'guantes'], ['quito', 'guantes']], 'Me quito los guantes y los descarto.'),
 (23, 'Se lava las manos nuevamente', 'Cierre', 'lavabo', 1, {'manos2': 1}, 'lavado',
  'El lavado de manos al finalizar completa la bioseguridad. Omitirlo es criterio de desaprobación.',
  [['manos', 'nuevamente'], ['manos', 'de nuevo'], ['manos', 'otra vez'], ['vuelvo', 'lavar'], ['lavo', 'manos', 'finalizar']], 'Me lavo las manos nuevamente.'),
 (24, 'Informa al paciente la finalización del procedimiento y sus resultados.', 'Cierre', 'paciente', 0, {}, 'hablar',
  'Se informa que terminó el procedimiento y lo hallado, se le ofrece papel o gasas para higienizarse y se lo ayuda a vestirse resguardando su intimidad.',
  [['informo', 'finaliz'], ['informo', 'termin'], ['finalizo', 'procedimiento'], ['le informo', 'resultado'], ['termino', 'procedimiento'], ['le comunico', 'resultad'], ['resultados']], 'Le informo que finalizó el procedimiento y le comunico los resultados.'),
 (25, 'Registra el procedimiento en la Historia Clínica del paciente.', 'Cierre', 'hc', 1, {'reg': 1}, 'registro',
  'Se registra el procedimiento y los hallazgos (inspección, tono esfinteriano, próstata o cuello uterino, masas, contenido del guante). Es la obligación médico-legal que deja constancia; omitirlo es criterio de desaprobación.',
  [['registro'], ['historia clinica'], ['anoto'], ['asiento'], ['dejo constancia']], 'Registro el procedimiento y los hallazgos en la historia clínica.'),
]
pasos = []
for n, texto, fase, target, crit, est, fx, expl, claves, frase in P:
    p = dict(n=n, texto=texto, fase=fase, target=target, critico=bool(crit), explica=expl, estado=est, claves=claves, frase=frase, fx=fx)
    if n == 7: p['gemelo'] = 23
    if n == 23: p['gemelo'] = 7
    pasos.append(p)

# =====================================================================  ELEMENTOS
EL = {
 'mesa': ('Mesa alta de traslado', 'Donde se reúne y prepara todo el material antes de ir al paciente.'),
 'lado': ('Lado del paciente', 'Zona junto a la camilla donde queda el carro, al alcance del operador.'),
 'consent': ('Consentimiento del paciente', 'El tacto rectal es invasivo: se solicita el consentimiento y la colaboración del paciente.'),
 'paciente': ('Paciente', 'Con él se dialoga (saludo, explicación, aviso, resultados) y se lo ubica en la posición adecuada.'),
 'lavabo': ('Lavabo', 'Lavado de manos con técnica clínica antes de los guantes y al finalizar.'),
 'guantes': ('Guantes de examen', 'De látex (o nitrilo si hay alergia). Se colocan antes de explorar, se examinan al retirar el dedo y se descartan.'),
 'lubricante': ('Lubricante', 'Vaselina (sólida o líquida) o lidocaína en gel para lubricar el dedo índice.'),
 'ano': ('Región perianal y margen anal', 'Se separan las nalgas, se inspecciona y se apoya el dedo antes de introducirlo; al final se retira.'),
 'esfinter': ('Esfínter anal', 'Se aplica presión suave hasta su relajación y luego se valora su tono pidiendo que apriete el dedo.'),
 'recto': ('Recto', 'Se introduce el dedo hacia el ombligo y se realiza el barrido de la mucosa reconociendo estructuras.'),
 'hc': ('Historia clínica', 'Se registra el procedimiento y los hallazgos al final.'),
}
elementos = {k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasos if p['target'] == k]) for k, v in EL.items()}

# =====================================================================  DISTRACTORES
D = [
 ('d1', 'Comienza el procedimiento sin explicar ni solicitar el consentimiento', 1, 'Es criterio de desaprobación: el tacto rectal es invasivo y exige explicación y consentimiento previos.', 'paciente', [['sin consentimiento'], ['sin pedir', 'consentimiento'], ['no pido', 'consentimiento'], ['sin autorizacion'], ['sin explicar'], ['no explico']]),
 ('d2', 'Se coloca los guantes sin lavarse las manos', 1, 'Es criterio de desaprobación: el lavado de manos previo es una precaución estándar de bioseguridad.', 'lavabo', [['sin lavar', 'manos'], ['no me lavo'], ['sin lavarme'], ['no lavo', 'manos']]),
 ('d3', 'Realiza el tacto rectal sin guantes', 1, 'Es criterio de desaprobación: el contacto con mucosas y fluidos exige guantes (o manoplas).', 'guantes', [['sin guantes'], ['no me coloco', 'guantes'], ['sin colocarme', 'guantes'], ['sin manoplas'], ['manos desnudas']]),
 ('d4', 'Introduce el dedo sin lubricar (a seco)', 1, 'Es criterio de desaprobación: sin lubricación hay dolor intenso, contracción del esfínter y riesgo de desgarro de la mucosa.', 'lubricante', [['sin lubric'], ['no lubrico'], ['sin vaselina'], ['sin gel'], ['a seco'], ['en seco']]),
 ('d5', 'Introduce el dedo bruscamente o forzando el esfínter', 1, 'Es criterio de desaprobación: forzar la entrada provoca dolor intolerable y traumatismo iatrogénico; hay que esperar la relajación del esfínter.', 'recto', [['introduzco', 'brusc'], ['introduzco', 'rapido'], ['introduzco', 'de golpe'], ['forzo'], ['fuerzo'], ['a la fuerza'], ['sin esperar'], ['no espero'], ['sin relajar']]),
 ('d6', 'Introduce el dedo en dirección perpendicular o hacia el sacro (no hacia el ombligo)', 1, 'Es criterio de desaprobación: el dedo debe apoyarse y orientarse hacia el ombligo, siguiendo el eje del canal anal.', 'ano', [['perpendicular'], ['hacia el sacro'], ['hacia el coxis'], ['hacia la espalda'], ['hacia atras', 'introduzco']]),
 ('d7', 'Introduce el dedo sin inspeccionar antes la región perianal', 1, 'Es criterio de desaprobación: la inspección previa aporta datos clave y detecta contraindicaciones absolutas.', 'ano', [['sin inspeccion'], ['sin inspeccionar'], ['sin observar'], ['no inspecciono']]),
 ('d8', 'Ubica al paciente sentado', 0, 'No es una posición válida para el tacto rectal. Las posiciones son decúbito lateral izquierdo (Sims), litotomía, genupectoral y de pie inclinado.', 'paciente', [['sentado'], ['sentada'], ['boca abajo'], ['decubito prono']]),
 ('d9', 'Explora con dos dedos o con toda la mano', 0, 'El tacto rectal se hace con el dedo índice lubricado; usar más dedos aumenta el dolor y el riesgo de lesión.', 'recto', [['dos dedos'], ['indice y medio'], ['toda la mano']]),
 ('d10', 'Lubrica con un antiséptico (iodopovidona o alcohol)', 0, 'Los antisépticos no lubrican e irritan la mucosa. Se usa vaselina o lidocaína en gel.', 'lubricante', [['lubrico', 'iodo'], ['lubrico', 'alcohol'], ['iodopovidona', 'dedo'], ['alcohol', 'dedo']]),
 ('d11', 'Reutiliza los mismos guantes con otro paciente o no los descarta', 1, 'Es una falla de bioseguridad: los guantes son de un solo uso y se descartan tras cada paciente.', 'guantes', [['reutilizo', 'guantes'], ['mismos guantes'], ['no descarto', 'guantes']]),
]
distractores = [dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl) for i, t, c, pq, tg, cl in D]

# =====================================================================  CASOS
casos = [
 dict(id='c1', nombre='Luis A.', sexo='M', edad=68, motivo='Polaquiuria, nicturia y chorro urinario débil desde hace meses.', indicacion='Tacto rectal para valorar el tamaño y la consistencia de la próstata.', antecedentes='Hipertensión arterial. Sin alergias conocidas.', alergia=None),
 dict(id='c2', nombre='Silvia R.', sexo='F', edad=54, motivo='Rectorragia: sangre roja rutilante al final de la deposición, con prurito anal.', indicacion='Inspección perianal y tacto rectal.', antecedentes='Constipación crónica. Sin alergias conocidas.', alergia=None),
 dict(id='c3', nombre='Raúl D.', sexo='M', edad=72, motivo='Heces negras, fétidas y pastosas (melena) desde hace 3 días, con astenia.', indicacion='Tacto rectal para constatar la melena y descartar patología orificial.', antecedentes='Uso crónico de antiinflamatorios por artrosis.', alergia=None),
 dict(id='c4', nombre='Hilda M.', sexo='F', edad=83, motivo='Incontinencia fecal y sospecha de fecaloma. Paciente postrada.', indicacion='Tacto rectal para evaluar el tono del esfínter y la ampolla rectal.', antecedentes='ACV con secuelas hace 2 años, postración. Sin alergias conocidas.', alergia=None),
 dict(id='c5', nombre='Diego P.', sexo='M', edad=45, motivo='Proctalgia y prurito anal de 2 semanas de evolución.', indicacion='Inspección y tacto rectal con material libre de látex.', antecedentes='Alergia al látex: urticaria al contacto con guantes.', alergia='latex'),
 dict(id='c6', nombre='Mario G.', sexo='M', edad=63, motivo='Hemospermia y goteo urinario terminal.', indicacion='Tacto rectal para valorar la próstata.', antecedentes='Antecedente familiar de cáncer de próstata. Sin alergias conocidas.', alergia=None),
 dict(id='c7', nombre='Carolina B.', sexo='F', edad=38, motivo='Prurito anal y sensación de masa en el margen anal.', indicacion='Inspección perianal y tacto rectal con material libre de látex.', antecedentes='Alergia al látex. Sin otros antecedentes.', alergia='latex'),
 dict(id='c8', nombre='Teresa L.', sexo='F', edad=61, motivo='Tenesmo rectal y alteración del tránsito intestinal.', indicacion='Tacto rectal para evaluar el canal anal y la ampolla rectal.', antecedentes='Sin antecedentes relevantes ni alergias conocidas.', alergia=None),
]

# =====================================================================  FUNDAMENTOS (preguntas)
Q = [
 ('¿Cuál de las siguientes es una indicación del tacto rectal?', ['Rectorragia', 'Fisura anal aguda dolorosa', 'Absceso anorrectal supurativo', 'Trombosis hemorroidal aguda'], 0, 'La rectorragia es una indicación anorrectal. Las otras tres son contraindicaciones absolutas: el tacto agravaría el dolor y puede diseminar la infección.'),
 ('¿Cuál es una contraindicación absoluta del tacto rectal?', ['Absceso anorrectal supurativo', 'Nicturia', 'Hemospermia', 'Tenesmo rectal'], 0, 'Las contraindicaciones absolutas son la fisura anal aguda, el absceso anorrectal supurativo y la trombosis hemorroidal aguda. Los demás son síntomas que justifican el tacto.'),
 ('¿Cuál es la posición más utilizada, y la menos pudorosa, para el tacto rectal?', ['Decúbito lateral izquierdo (Sims)', 'Genupectoral', 'Sentado', 'Decúbito prono'], 0, 'El decúbito lateral izquierdo o de Sims, con caderas y rodillas flexionadas, es la más usada. La genupectoral se reserva para una exploración detallada y profunda de la mucosa.'),
 ('¿Hacia dónde se orienta el extremo distal del dedo índice al apoyarlo y al introducirlo?', ['Hacia el ombligo', 'Hacia el sacro', 'Hacia la espalda', 'Perpendicular al margen anal'], 0, 'Se orienta hacia el ombligo, siguiendo el eje del canal anal. Introducirlo perpendicular o hacia el sacro es traumático y desaprueba.'),
 ('¿Con qué se lubrica el dedo explorador?', ['Vaselina (sólida o líquida) o lidocaína en gel', 'Iodopovidona', 'Alcohol al 70 %', 'No hace falta si el paciente colabora'], 0, 'Se usa vaselina o lidocaína en gel. Los antisépticos irritan la mucosa y no lubrican. Explorar a seco desaprueba.'),
 ('Próstata aumentada de tamaño, simétrica, lisa, de consistencia elástica y con surco medio conservado: ¿qué sugiere?', ['Hiperplasia benigna de próstata', 'Cáncer de próstata', 'Prostatitis aguda', 'Próstata normal de un joven'], 0, 'Esos hallazgos sugieren hiperplasia benigna. El cáncer suele dar un nódulo duro, asimétrico, con surco medio borrado. La prostatitis aguda es dolorosa y está contraindicado masajearla.'),
 ('Heces negras, pastosas y fétidas en el guante, ¿qué indican?', ['Melena (sangrado digestivo alto)', 'Rectorragia de un hemorroide', 'Hallazgo normal', 'Fecaloma'], 0, 'La melena indica sangre digerida, habitualmente de origen digestivo alto. La sangre roja rutilante sugiere patología orificial o rectal baja.'),
 ('¿Qué posición permite la palpación bimanual y es de elección en pacientes postrados?', ['Litotomía (decúbito dorsal o ginecológica)', 'De pie inclinado', 'Genupectoral', 'Sims'], 0, 'La posición de litotomía permite la palpación bimanual y es la elección en pacientes postrados; sirve para próstata y vesículas seminales.'),
]
fund = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in Q]

# =====================================================================  MACHETE
machete = {
 'perlas': [
  {'t': 'Antes de empezar', 'x': 'Verificá la indicación. Indicaciones anorrectales: proctalgia, incontinencia fecal, tenesmo, rectorragia, alteración del tránsito, prurito anal, prolapso. Urológicas: incontinencia, polaquiuria, nicturia, hemospermia, hematuria, oliguria, goteo terminal. Contraindicaciones absolutas: fisura anal aguda, absceso anorrectal supurativo, trombosis hemorroidal aguda.'},
  {'t': 'Bioseguridad', 'x': 'Lavado de manos con técnica clínica antes de los guantes y al terminar. Guantes de examen o manoplas de látex (nitrilo si hay alergia). Maniobra limpia: no hace falta técnica estéril. Se descartan al finalizar. Es criterio de desaprobación omitirlos.'},
  {'t': 'Comunicación', 'x': 'Saludá, presentate, explicá con lenguaje claro y pedí consentimiento y colaboración antes de tocar. Avisá cuando comenzás y cuando terminás, y comunicá los resultados.'},
  {'t': 'Posiciones', 'x': 'Sims (decúbito lateral izquierdo): la más usada. Litotomía: bimanual, próstata y postrados. Genupectoral: mucosa rectal en detalle. De pie inclinado sobre la camilla.'},
  {'t': 'Técnica', 'x': 'Separá las nalgas e inspeccioná y describí. Lubricá el índice (vaselina o lidocaína gel). Apoyalo en el margen anal con la punta hacia el ombligo, presión suave y sostenida hasta que el esfínter se relaje, e introducí siguiendo esa dirección. Nunca a seco, brusco ni forzado.'},
  {'t': 'Qué palpar', 'x': 'Barrido horario y antihorario: tono, ampolla, paredes, masas, pólipos, estenosis, fecaloma, dolor. Varón: próstata (tamaño, consistencia, simetría, superficie, surco medio, dolor) y vesículas seminales. Mujer: cuello uterino. Pedí que apriete el dedo para valorar el tono.'},
  {'t': 'Al retirar', 'x': 'Examiná el guante: heces, moco, pus o sangre (roja = rectorragia; negra y fétida = melena). Sacate los guantes, lavate las manos de nuevo y registrá en la historia clínica los hallazgos.'},
 ],
 'por_paso': {
  '5': 'Explicación y consentimiento: sin ellos no se empieza.',
  '6': 'Pedí consentimiento y ofrecé un acompañante si el paciente lo desea.',
  '10': 'Sims es la posición más usada; litotomía para próstata y bimanual.',
  '12': 'Mirá antes de tocar: si ves fisura aguda, absceso o trombosis hemorroidal, no hay tacto.',
  '13': 'Vaselina o lidocaína en gel. Nunca a seco.',
  '15': 'Punta del dedo hacia el ombligo.',
  '16': 'Esperá a que el esfínter se relaje antes de avanzar.',
  '18': 'Barrido horario y antihorario. En el varón, próstata en la pared anterior.',
  '21': 'El guante habla: sangre, moco, pus, heces.',
  '25': 'Registrá tono, hallazgos y contenido del guante.',
 },
}

TR = dict(
 id='tr', area='siam', titulo='Tacto rectal', icono='🖐️',
 resumen='Recorrido virtual del tacto rectal, con 25 pasos de la lista de cotejo de la cátedra.',
 umbral=60, fuente='Lista de cotejo: Evaluación en tacto rectal (25 ítems)',
 elementos=elementos, distractores=distractores, casos=casos, fundamentos=fund,
 criterios_texto='Desaprueba si omite: la explicación y el consentimiento (5, 6); el lavado de manos y los guantes (7, 8, 22, 23); la lubricación (13); la introducción suave y orientada hacia el ombligo (15, 16, 17); o la inspección previa, el examen del guante y el registro (12, 21, 25). Se aprueba con al menos 60 % del puntaje y ningún paso crítico fallido.',
 criterios=[
  dict(ico='🗣️', titulo='Explicación y consentimiento', pasos=[5, 6]),
  dict(ico='🧼', titulo='Bioseguridad: lavado de manos y guantes', pasos=[7, 8, 22, 23]),
  dict(ico='🧴', titulo='Lubricar antes de explorar', pasos=[13]),
  dict(ico='☝️', titulo='Introducción suave y orientada al ombligo', pasos=[15, 16, 17]),
  dict(ico='📝', titulo='Inspección previa, guante y registro', pasos=[12, 21, 25]),
 ],
 final_criticos='explicación y consentimiento, bioseguridad (lavado y guantes), lubricación, introducción suave y registro',
 machete=machete, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/siam/tr_modelo.json', peso_modelo='3 a 5 MB', instrumental='data/acreditaciones/siam/instrumental_tr.json',
 pasos=pasos, mesa_pasos=[1, 2],
)
W(OUT + 'tr.json', TR)

# =====================================================================  INSTRUMENTAL
S = J(OUT + 'instrumental_sv.json'); byid = {i['id']: i for i in S['items']}
def base(i, **kw):
    o = dict(byid[i]); [o.pop(k, None) for k in ('sexo', 'solo_alergia', 'latex', 'feedback_latex', 'feedback', 'falta', 'critico', 'correcto')]
    o.update(kw); return o
items = [
 base('guantes_ns', grupo='prot', nombre='Guantes de examen de látex', detalle='Par · no estériles · látex', correcto=True, critico=True, latex=True,
      descripcion='Protegen al operador y al paciente durante el tacto rectal. Es una maniobra limpia: alcanzan guantes de examen (o manoplas) no estériles.',
      falta='Faltan los guantes de examen: sin ellos no se puede realizar el tacto rectal (bioseguridad).',
      feedback_latex='El paciente es alérgico al látex: los guantes de látex están contraindicados. Corresponde usar guantes de nitrilo u otro material sin látex.',
      ficha=[['Tipo', 'Examen, no estériles'], ['Material', 'Látex'], ['Talle', 'M'], ['Vencimiento', '02/2029'], ['Lote', 'GN-90120']]),
 dict(id='guantes_nitrilo', grupo='prot', nombre='Guantes de nitrilo (sin látex)', detalle='Par · no estériles · libres de látex', img='assets/instrumental/guantes_nitrilo.svg', solo_alergia='latex', correcto=True, critico=True,
      descripcion='Guantes de examen sin látex, indicados en pacientes alérgicos al látex. Protegen igual que los de látex.',
      falta='Falta el guante sin látex: el paciente es alérgico al látex y se necesitan guantes de nitrilo.',
      ficha=[['Tipo', 'Examen, no estériles'], ['Material', 'Nitrilo (sin látex)'], ['Talle', 'M'], ['Vencimiento', '06/2029'], ['Lote', 'GN-33871']]),
 base('vaselina', grupo='lub', nombre='Vaselina (sólida o líquida)', detalle='Lubricante · uso general', correcto=True, critico=True, uno_de='lubricante',
      descripcion='Lubrica el dedo explorador y disminuye la fricción, el dolor y el riesgo de lesionar la mucosa anal. Es una de las dos opciones válidas (la otra es la lidocaína en gel).',
      falta='Falta el lubricante (vaselina o lidocaína en gel): explorar “a seco” produce dolor, contracción del esfínter y riesgo de desgarro.',
      ficha=[['Contenido', '100 g'], ['Presentación', 'Pote de uso general'], ['Vencimiento', '08/2029'], ['Lote', 'VS-10094']]),
 base('gel', grupo='lub', nombre='Lidocaína en gel 2 %', detalle='Lubricante con anestésico local', correcto=True, critico=True, uno_de='lubricante',
      descripcion='Lubrica y anestesia localmente la zona. Es una alternativa válida a la vaselina.',
      falta='Falta el lubricante (vaselina o lidocaína en gel): explorar “a seco” produce dolor, contracción del esfínter y riesgo de desgarro.'),
 base('gasas', grupo='prot', nombre='Gasas o papel (no estériles)', detalle='Para higienizar al paciente al finalizar', correcto=True, critico=False, opcional=True,
      descripcion='Sirven para limpiar al paciente al terminar. No hace falta que sean estériles. Son opcionales.',
      ficha=[['Medidas', '10 × 10 cm'], ['Cantidad', '10 unidades'], ['Esterilidad', 'No estériles'], ['Vencimiento', '11/2028'], ['Lote', 'GS-70419']]),
 base('panos_ns', grupo='prot', nombre='Paños clínicos no estériles', detalle='Para resguardar la intimidad y la cama', correcto=True, critico=False, opcional=True,
      descripcion='Cubren lo que no se explora y protegen la cama de restos de lubricante o materia fecal. Son opcionales.'),
]
F = {
 'sonda_m': 'La sonda Foley es para el sondaje vesical. El tacto rectal es una exploración digital: no requiere sonda.',
 'bolsa': 'La bolsa colectora es para el drenaje urinario. No se usa en el tacto rectal.',
 'iodo': 'La iodopovidona es un antiséptico cutáneo: no lubrica ni hace falta en este procedimiento, y puede irritar la mucosa.',
 'alcohol': 'El alcohol irrita la mucosa anorrectal y no lubrica.',
 'guantes_e': 'Los guantes estériles no son necesarios: el tacto rectal es una maniobra limpia. Alcanzan guantes de examen.',
 'pano_e': 'No se arma un campo estéril para el tacto rectal.',
 'jeringa10': 'No se usan jeringas en el tacto rectal.',
 'aguja': 'No se usan agujas en el tacto rectal.',
 'rinonera': 'No hace falta un cuenco estéril en este procedimiento.',
 'cinta': 'No se necesita cinta: no hay nada que fijar en el tacto rectal.',
}
GR = {'sonda_m': 'otros', 'bolsa': 'otros', 'iodo': 'lub', 'alcohol': 'lub', 'guantes_e': 'prot', 'pano_e': 'prot', 'jeringa10': 'otros', 'aguja': 'otros', 'rinonera': 'otros', 'cinta': 'otros'}
for k, fb in F.items():
    it = base(k, grupo=GR[k], correcto=False, critico=False, feedback=fb)
    it.pop('sexo', None)
    if k == 'sonda_m': it['nombre'] = 'Sonda Foley 16 Fr, 2 vías'
    items.append(it)
INS = dict(id='tr', titulo='Mesa de instrumental · Tacto rectal',
 consigna='Leé el caso clínico y armá la mesa con todo lo necesario para ese paciente: el tacto rectal es una maniobra limpia. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='indicación de tacto rectal', indicacion_def='Tacto rectal.',
 mision=['qué guantes corresponden a este paciente (¿hay alergia al látex?);', 'qué lubricante usar… y qué insumos sobran, porque no es un procedimiento estéril.'],
 demo_caso='Primero se lee el caso clínico: de él depende qué guantes elegir (látex o sin látex).',
 grupos=[dict(id='prot', titulo='Protección y limpieza'), dict(id='lub', titulo='Lubricantes y antisépticos'), dict(id='otros', titulo='Otros insumos')],
 items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_tr.json', INS)

# svg de guantes de nitrilo
s = open('assets/instrumental/guantes_ns.svg', encoding='utf8').read()
for a, b in [('#38bdf8', '#a78bfa'), ('#7dd3fc', '#c4b5fd'), ('#0369a1', '#5b21b6'), ('GUANTES DE EXAMEN', 'GUANTES DE NITRILO')]: s = s.replace(a, b)
open('assets/instrumental/guantes_nitrilo.svg', 'w', encoding='utf8').write(s)
print(re.findall(r'>([^<>]{3,40})</text>', s))

# =====================================================================  MODELO 3D
M = J(OUT + 'sv_modelo.json')
def pieza(base_p, **kw): o = dict(base_p); o.update(kw); return o
pm = {p['id']: p for p in M['M']['piezas']}
stl = lambda id, f, color, op, hs, nom, peso: dict(id=id, tipo='stl', src=f'assets/anatomia/bp3d/{f}.stl', escala=0.1, rot=[-1.5707963, 0, 0], pos=[0, 0, 0], capa='organos', color=color, opacidad=op, hs=hs, nombre=nom, peso=peso)
MM = dict(
 origen=[0, 83.2, 8.0], corte_x=0.0,
 piezas=[pm['piel_cuerpo'], pm['cadera_i'], pm['cadera_d'], pm['sacro'], pieza(pm['vejiga'], hs=None, opacidad=0.35),
         pieza(pm['recto'], opacidad=0.62), pm['prostata'],
         stl('esfinter', 'FMA21930', '#ff5d73', 0.85, 'esfinter', 'Esfínter anal externo', 183484),
         stl('vesic_d', 'FMA19387', '#f5d36a', 0.8, 'vesiculas', 'Vesícula seminal derecha', 54284),
         stl('vesic_i', 'FMA19388', '#f5d36a', 0.8, 'vesiculas', 'Vesícula seminal izquierda', 54084)],
 procedurales={},
 dedo=dict(cola=[[0, 70.6, 0.1], [0, 72.4, 1.6]], canal=[[0, 74.2, 3.0], [0, 75.2, 3.9], [0, 76.5, 5.0], [0, 78.0, 5.5], [0, 79.5, 4.9], [0, 81.0, 4.6], [0, 82.5, 4.3]], pivote=[0, 74.2, 3.0]),
 pines=dict(paciente=[0, 97.5, 8.0], ano=[0, 74.0, 3.4], esfinter=[0, 77.2, 4.3], recto=[0, 83.5, 4.5], prostata=[0, 78.2, 8.4], vesiculas=[0, 80.4, 6.6]),
 camara=dict(lat=[48, -4, -3], fro=[0, -4, -46], sup=[0.01, 42, -3], objetivo=[0, -4, -3], ini=[36, -2, -38]),
 etiquetas=dict(paciente=[0, -60], ano=[-110, 90], esfinter=[-150, 30], recto=[130, -40], prostata=[140, 20], vesiculas=[140, -10]),
)
pf = {p['id']: p for p in M['F']['piezas']}
rt = M['F']['procedurales']['recto']; vg = M['F']['procedurales']['vagina']
FF = dict(
 origen=[-0.85, 5.9, -9.0], corte_x=-0.85,
 piezas=[pf['piel_cuerpo'], pf['pelvis'], pieza(pf['vejiga'], hs=None, opacidad=0.35), pf['utero']],
 procedurales=dict(
  recto=rt, vagina=vg,
  esfinter=dict(pts=[[-1.0, -5.0, -10.1], [-1.0, -6.6, -9.4]], radio=1.0, color='#ff5d73', opacidad=0.85, capa='organos', hs='esfinter')),
 dedo=dict(cola=[[-1.0, -11.0, -7.7], [-1.0, -8.8, -8.6]], canal=[[-1.0, -6.4, -9.5], [-1.0, -3.5, -10.6], [-1.0, 0.0, -12.0], [-1.0, 3.0, -12.8]], pivote=[-1.0, -6.4, -9.5]),
 pines=dict(paciente=[-0.9, 17.5, -9.0], ano=[-1.0, -7.4, -9.0], esfinter=[-1.0, -5.6, -9.8], recto=[-1.0, 1.0, -12.4], vagina=[-1.0, -2.2, -6.2], utero=[-0.9, 3.8, -4.9]),
 camara=dict(lat=[48, -6, -3], fro=[0, -6, -46], sup=[0.01, 42, -3], objetivo=[0, -6, -3], ini=[-36, -2, -38]),
 etiquetas=dict(paciente=[0, -60], ano=[-110, 90], esfinter=[-150, 30], recto=[130, -40], vagina=[130, 40], utero=[110, -80]),
)
G = dict(M['general']); G['vistas'] = dict(fro='Posterior')
TRM = dict(
 general=G,
 tarjetas=dict(
  mesa=dict(titulo='🛒 Mesa alta de traslado', id='mesa', items=[['guantes', '🧤', 'Guantes', 'de examen'], ['lubricante', '🧴', 'Lubricante', 'vaselina o lidocaína gel']]),
  entorno=dict(titulo='🏥 Entorno del paciente', items=[['lavabo', '🚰', 'Lavabo', ''], ['consent', '📝', 'Consentimiento', 'del paciente'], ['hc', '📋', 'Historia clínica', ''], ['lado', '🛏️', 'Lado del', 'paciente']])),
 chips=[['consent', 'Consentimiento'], ['manos', 'Manos lavadas'], ['pos', 'Posición'], ['insp', 'Inspección'], ['lub', 'Lubricado'], ['ins', 'Dedo introducido'], ['barrido', 'Barrido'], ['tono', 'Tono evaluado'], ['gex', 'Guante examinado'], ['manos2', 'Manos (final)'], ['reg', 'Registrado']],
 usables=['guantes', 'lubricante', 'lavabo', 'consent', 'hc'],
 pines=[
  dict(id='ano', label='Margen anal', capa='organos', externo=True),
  dict(id='esfinter', label='Esfínter anal', capa='organos'),
  dict(id='recto', label='Recto', capa='organos'),
  dict(id='prostata', label='Próstata', capa='organos', sexo='M'),
  dict(id='vesiculas', label='Vesículas seminales', capa='organos', sexo='M'),
  dict(id='vagina', label='Vagina', capa='organos', sexo='F'),
  dict(id='utero', label='Útero y cuello', capa='organos', sexo='F'),
  dict(id='paciente', label='Paciente', capa='piel', externo=True)],
 instrumentos=[dict(id='dedo', tipo='dedo', color='#7dd3fc', radio=0.7, clases=dict(avance='s-ins', retira='s-ret', barrido='s-barrido'))],
 M=MM, F=FF)
W(OUT + 'tr_modelo.json', TRM)

# =====================================================================  INDEX
IX = J(OUT + 'index.json')
for a in IX['acreditaciones']:
    if a['id'] == 'tr': a['estado'] = 'activo'
W(OUT + 'index.json', IX)
print('tr.json', os.path.getsize(OUT + 'tr.json'), 'ok')
