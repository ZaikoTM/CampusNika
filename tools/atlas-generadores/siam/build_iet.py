import json, os, re
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/siam/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)

# =====================================================================  PASOS
# (n, texto cátedra, fase, target, critico, estado, fx, explica, claves, frase)
P = [
 (1, 'Reúne la totalidad de los materiales necesarios para la práctica y los prepara en una “Mesa Alta” de traslado.', 'Preparación', 'mesa', 0, {}, 'reunir',
  'Se reúne y ordena todo antes de empezar: ropa estéril, laringoscopio con hoja curva, tubos endotraqueales (TET) de varios calibres, mandril o guía estéril (si se requiere), jeringa de 10 cc, bolsa de ambú con máscara y reservorio, fuente de oxígeno, saturómetro, estetoscopio, cánula de Guedel, lubricante estéril y cinta de fijación. En una vía aérea no se puede interrumpir el procedimiento para buscar algo.',
  [['reuno'], ['junto', 'material'], ['mesa alta'], ['preparo', 'material']], 'Reúno todo el material necesario y lo preparo en la mesa alta de traslado.'),
 (2, 'Lleva la totalidad de los materiales al lado del paciente.', 'Preparación', 'lado', 0, {}, 'trasladar',
  'El carro queda junto a la cabecera, al alcance de la mano, para no apartarse del paciente durante la laringoscopia.',
  [['llevo', 'material'], ['llevo', 'mesa'], ['llevo', 'carro'], ['traslado', 'paciente'], ['acerco', 'material']], 'Llevo todo el material al lado del paciente.'),
 (3, 'Se lava las manos con técnica clínica.', 'Preparación', 'lavabo', 1, {'manos': 1}, 'lavado',
  'El lavado de manos con técnica clínica antes de vestirse con ropa estéril es la base de la asepsia: la vía aérea inferior es estéril. Omitirlo es criterio de desaprobación.',
  [['lavo', 'manos'], ['lavado', 'manos'], ['higienizo', 'manos']], 'Me lavo las manos con técnica clínica.'),
 (4, 'Se viste con ropa estéril.', 'Preparación', 'ropa', 1, {'esteril': 1}, 'vestir',
  'Camisolín, cofia, antiparras, barbijo, guantes y botas estériles: el tubo se introduce en una vía aérea inferior estéril y el operador queda expuesto a secreciones y aerosoles. Omitirlo es criterio de desaprobación.',
  [['ropa esteril'], ['me visto'], ['camisolin'], ['guantes esteril'], ['barbijo'], ['gorro'], ['cofia'], ['antiparras'], ['botas']], 'Me visto con la ropa estéril completa: camisolín, cofia, antiparras, barbijo, guantes y botas estériles.'),
 (5, 'Verifica el laringoscopio', 'Verificación del equipo', 'laringo', 1, {'lar_ok': 1}, 'luz_lar',
  'Se arma la hoja sobre el mango y se comprueba que la luz encienda y quede fija. Un laringoscopio sin luz en el momento de la laringoscopia obliga a retirarse con el paciente apneico. Omitirlo es criterio de desaprobación.',
  [['verifico', 'laringoscopio'], ['compruebo', 'laringoscopio'], ['pruebo', 'laringoscopio'], ['luz', 'laringoscopio'], ['enciende']], 'Verifico el laringoscopio: armo la hoja y compruebo que la luz encienda.'),
 (6, 'Verifica el correcto funcionamiento del globo del Tubo Endo-Traqueal (TET) elegido', 'Verificación del equipo', 'tetc', 1, {'tet_ok': 1}, 'balon_tet',
  'Se conecta la jeringa de 10 cc a la válvula del piloto y se insufla aire (5 a 10 cc) fuera del paciente para comprobar que el balón no pierde ni se deforma; luego se lo desinfla por completo antes de usar (un balón parcialmente inflado lesiona las cuerdas). Un balón defectuoso no sella la vía aérea. Diámetro interno según la planilla de la cátedra: mujer 7,0–8,0 mm, varón 8,0–9,0 mm. Omitirlo es criterio de desaprobación.',
  [['verifico', 'balon'], ['compruebo', 'balon'], ['pruebo', 'balon'], ['funcionamiento', 'balon'], ['funcionamiento', 'globo'], ['globo', 'tet']], 'Verifico el funcionamiento del balón del tubo endotraqueal: compruebo que infle y desinfle sin pérdidas y lo dejo desinflado.'),
 (7, 'Acomoda al paciente:', 'Posición y monitoreo', 'paciente', 0, {'pos': 1}, 'posicion_iet',
  'Se baja la cabecera de la cama a 0° (plano) de modo que la cabeza del paciente quede a la altura del apéndice xifoides del operador. Paciente en decúbito dorsal con la cabeza en posición de olfateo (elevación del occipucio unos 8 a 10 cm con una almohada o toalla): alinea los ejes oral, faríngeo y laríngeo. Se evalúa la vía aérea: Mallampati (III y IV predicen vía aérea difícil), apertura bucal, movilidad cervical y distancia tiromentoniana. Con sospecha de trauma cervical no se usa la posición de olfateo: se mantiene la inmovilización cervical en eje.',
  [['acomodo', 'paciente'], ['posicion', 'olfateo'], ['olfateo'], ['almohada'], ['decubito dorsal'], ['mallampati'], ['posiciono', 'paciente']], 'Acomodo al paciente en decúbito dorsal con la cama plana, en posición de olfateo, y evalúo la vía aérea (Mallampati).'),
 (8, 'Se ubica a la cabecera del paciente.', 'Posición y monitoreo', 'cabecera', 0, {'cab': 1}, 'cabecera',
  'El operador se coloca detrás de la cabeza, en el eje del paciente, con la camilla a la altura de su apófisis xifoides: así la línea de visión coincide con el eje de la laringoscopia.',
  [['cabecera']], 'Me ubico a la cabecera del paciente.'),
 (9, 'Coloca el saturometro manteniendo la ejecución de la saturometria durante todo el procedimiento', 'Posición y monitoreo', 'saturometro', 1, {'sat': 1}, 'saturometro',
  'La saturación de oxígeno se monitoriza de forma continua: es la única forma de saber cuánto tiempo seguro queda durante la laringoscopia. Si cae por debajo de 90 % se interrumpe el intento y se ventila. Omitirlo es criterio de desaprobación.',
  [['saturometro'], ['oximetro'], ['pulsioximetro'], ['saturacion', 'dedo'], ['coloco', 'sat']], 'Coloco el saturómetro y mantengo la saturometría durante todo el procedimiento.'),
 (10, 'Hiper-extiende la cabeza del paciente llevándola a posterior y elevándole el mentón.', 'Posición y monitoreo', 'cabeza', 0, {'ext': 1}, 'hiperextension',
  'Con la mano derecha se lleva la cabeza hacia atrás y se eleva el mentón (maniobra frente-mentón): despeja la base de la lengua de la pared posterior de la faringe y abre la vía aérea. Atención: con sospecha de trauma cervical está contraindicada; se hace solo tracción o subluxación de la mandíbula con el cuello inmovilizado en eje.',
  [['hiperextiendo'], ['hiperextension'], ['elevo', 'menton'], ['extiendo', 'cabeza'], ['extension', 'cabeza']], 'Hiperextiendo la cabeza llevándola hacia atrás y elevo el mentón.'),
 (11, 'Remueve prótesis dentales (si las hubiere).', 'Posición y monitoreo', 'boca', 0, {'prot': 1}, 'protesis',
  'Se retiran las prótesis removibles: pueden desplazarse y obstruir la vía aérea o dañarse durante la laringoscopia. (En un paciente real, este es el momento de iniciar la sedación y la relajación.)',
  [['protesis'], ['dentadura'], ['retiro', 'dientes'], ['placa dental']], 'Retiro las prótesis dentales, si las hubiera.'),
 (12, 'Inicia la ventilación con máscara de ambú a una frecuencia de 15-18 ventilaciones por minuto.', 'Oxigenación', 'ambu', 1, {'vent': 1}, 'ventilar',
  'Antes de laringoscopiar se ventila con máscara y bolsa de ambú con oxígeno al 100 % (12–15 L/min, con reservorio) a 15–18 por minuto. La máscara se sella con la técnica C-E: el pulgar y el índice de la mano no dominante forman una «C» sobre la máscara y los otros tres dedos una «E» bajo la mandíbula para traccionarla. La preoxigenación crea una reserva de oxígeno que permite tolerar la apnea del intento sin desaturar. Laringoscopiar sin ventilar antes es criterio de desaprobación.',
  [['mascara', 'ambu'], ['mascara', 'ventil'], ['inicio', 'ventilacion'], ['comienzo', 'ventilar'], ['preoxigen'], ['oxigeno', 'mascara']], 'Inicio la ventilación con máscara de ambú, con técnica C-E, a 15-18 ventilaciones por minuto.'),
 (13, 'Solicita al asistente que presione el cartílago cricoides hacia posterior. manteniendo ésta conducta hasta finalizado el procedimiento', 'Oxigenación', 'cricoides', 0, {'sellick': 1}, 'sellick',
  'Maniobra de Sellick: el asistente presiona el cricoides (único anillo cartilaginoso completo de la vía aérea) hacia atrás y comprime el esófago contra el cuerpo de la sexta vértebra cervical, lo que previene la regurgitación y la broncoaspiración. Se mantiene hasta que el balón está inflado y la colocación verificada.',
  [['cricoides'], ['sellick'], ['presion', 'cricoid'], ['asistente', 'presione']], 'Le pido al asistente que presione el cartílago cricoides hacia atrás y lo mantenga hasta el final.'),
 (14, 'Sostiene el laringoscopio con su mano izquierda y con la derecha, abre la boca y acomodar la comisura labial.', 'Laringoscopia', 'boca', 0, {'lar_mano': 1}, 'sostener',
  'El laringoscopio se sostiene siempre con la mano izquierda; con la derecha se abre la boca (técnica de los dedos cruzados) y se retira la comisura labial para no pellizcarla con la hoja.',
  [['sostengo', 'laringoscopio'], ['mano izquierda'], ['abro', 'boca'], ['comisura']], 'Sostengo el laringoscopio con la mano izquierda, abro la boca con la derecha y acomodo la comisura labial.'),
 (15, 'Ingresa con la hoja del laringoscopio del lado derecho de la lengua y empuja la misma hacia la izquierda dejando la hoja del mismo en la línea media.', 'Laringoscopia', 'lengua', 0, {'lar_dentro': 1}, 'hoja_in',
  'La hoja entra por la comisura derecha, desplaza la lengua hacia la izquierda y se centra en la línea media: la lengua queda fuera de la línea de visión. Entrar por el centro empuja la lengua hacia atrás y tapa la glotis.',
  [['lado derecho', 'lengua'], ['derecha', 'lengua', 'hoja'], ['empujo', 'lengua'], ['desplazo', 'lengua'], ['lengua', 'izquierda'], ['linea media']], 'Ingreso con la hoja por el lado derecho de la lengua, la empujo hacia la izquierda y dejo la hoja en la línea media.'),
 (16, 'Desciende hasta la base de la lengua y realiza un movimiento continuo hacia arriba y adelante', 'Laringoscopia', 'epiglotis', 0, {'lar_palanca': 1}, 'levantar',
  'Con la hoja curva la punta se apoya en la vallécula (entre la base de la lengua y la epiglotis) y se levanta en el eje del mango, hacia arriba y adelante, que eleva la epiglotis y expone la glotis. Nunca se hace palanca sobre los dientes: los lesiona y no mejora la visión.',
  [['base de la lengua'], ['valecula'], ['arriba y adelante'], ['desciendo']], 'Desciendo hasta la base de la lengua y hago un movimiento continuo hacia arriba y adelante.'),
 (17, 'Deja el  mango del laringoscopio mirando hacia el techo en un ángulo de 45°.', 'Laringoscopia', 'boca', 0, {'lar_45': 1}, 'angulo45',
  'El mango queda mirando hacia el techo en un ángulo de unos 45°: es la dirección de tracción correcta. Si se inclina hacia atrás (palanca) se rompen los dientes.',
  [['mango', 'techo'], ['angulo de 45'], ['mango', '45']], 'Dejo el mango del laringoscopio mirando hacia el techo, en un ángulo de 45°.'),
 (18, 'Visualiza las cuerdas vocales.', 'Laringoscopia', 'cuerdas', 1, {'cuerdas': 1}, 'cuerdas',
  'Se visualizan las cuerdas vocales, el triángulo blanco que delimita la glotis. Se gradúa la visión (Cormack-Lehane: I glotis completa, II solo comisura posterior, III solo epiglotis, IV ninguna estructura). Pasar el tubo sin ver las cuerdas es criterio de desaprobación.',
  [['visualizo', 'cuerdas'], ['veo', 'cuerdas'], ['visualizo', 'glotis'], ['observo', 'cuerdas']], 'Visualizo las cuerdas vocales.'),
 (19, 'Solicitar (al asistente) el TET y lo toma con la mano derecha sin retirar la mirada de las cuerdas vocales', 'Intubación', 'asistente', 0, {'tet_mano': 1}, 'pedir_tet',
  'Sin apartar la vista de las cuerdas, se pide el tubo al asistente y se lo toma con la mano derecha como una lapicera. Mirar hacia otro lado hace perder la exposición de la glotis.',
  [['solicito', 'tet'], ['solicito', 'tubo'], ['pido', 'tubo'], ['pido', 'tet'], ['asistente', 'tubo'], ['sin retirar', 'mirada']], 'Solicito el tubo endotraqueal al asistente y lo tomo con la mano derecha sin retirar la mirada de las cuerdas.'),
 (20, 'Desliza el TET por la hoja del laringoscopio hasta superar las cuerdas vocales', 'Intubación', 'cuerdas', 1, {'tet': 1}, 'tet_in',
  'El tubo se desliza por el lado derecho de la hoja, sin tapar la visión, hasta que el extremo supera las cuerdas bajo visión directa. Si no se ven las cuerdas no se intuba a ciegas.',
  [['deslizo', 'tubo'], ['deslizo', 'tet'], ['supero', 'cuerdas'], ['paso', 'tubo', 'cuerdas'], ['introduzco', 'tubo'], ['avanzo', 'tubo']], 'Deslizo el tubo por la hoja del laringoscopio hasta superar las cuerdas vocales.'),
 (21, 'Ubica el balón 3 a 4 cm por debajo de las cuerdas vocales.', 'Intubación', 'balon', 1, {'tetp': 1}, 'tet_prof',
  'El balón debe quedar 3 a 4 cm por debajo de las cuerdas vocales, en la tráquea: más arriba lesiona la laringe y más abajo se corre el riesgo de intubación selectiva del bronquio derecho. En el adulto la marca del tubo a la altura de la comisura labial queda aproximadamente entre 21 y 23 cm. Omitir la profundidad correcta es criterio de desaprobación.',
  [['ubico', 'balon'], ['balon', 'debajo'], ['3 a 4'], ['3 4 cm']], 'Ubico el balón del tubo 3 a 4 cm por debajo de las cuerdas vocales.'),
 (22, 'Retira el laringoscopio.', 'Intubación', 'laringo', 0, {'lar_fuera': 1}, 'retirar_lar',
  'Con el tubo en posición se retira el laringoscopio con cuidado, sin arrastrar el tubo, y se lo apoya sin contaminar el campo.',
  [['retiro', 'laringoscopio'], ['saco', 'laringoscopio']], 'Retiro el laringoscopio.'),
 (23, 'Infla el balón a través del piloto con la jeringa de 10 cc', 'Intubación', 'jeringa', 1, {'infl': 1}, 'inflar_tet',
  'Se infla el balón por el piloto con la jeringa de 10 cc (habitualmente bastan 5 a 8 cc de aire) hasta sellar la vía aérea, con una presión de 20 a 30 cm H₂O; por encima de eso se isquemia la mucosa traqueal. Un balón sin inflar permite fugas y aspiración. Omitirlo es criterio de desaprobación.',
  [['inflo', 'jeringa'], ['inflo', 'piloto'], ['10 cc'], ['jeringa', 'piloto']], 'Inflo el balón por el piloto con la jeringa de 10 cc.'),
 (24, 'Verifica la correcta colocación del TET:', 'Verificación', 'pulmones', 1, {'verif': 1}, 'auscultar',
  'La planilla lo desglosa en dos incisos: (24-A) auscultación de ambos pulmones, desde la región infraclavicular descendiendo por la línea medioclavicular: debe ser positiva (murmullo vesicular presente) y simétrica; (24-B) auscultación del epigastrio: debe ser negativa. Se completa con expansión torácica simétrica, vaho en el tubo y capnografía con onda de CO₂. Se ausculta primero el epigastrio: si hay ruidos hidroaéreos es una intubación esofágica y se retira el tubo de inmediato. La intubación selectiva (ruidos solo a la derecha) se corrige desinflando levemente el balón y retirando el tubo 2 a 3 cm. Omitir la verificación es criterio de desaprobación.',
  [['ausculto'], ['auscultacion'], ['capnograf'], ['colocacion', 'tubo'], ['verifico', 'colocacion'], ['expansion', 'torac'], ['epigastrio']], 'Verifico la correcta colocación del tubo: ausculto primero el epigastrio, luego ambos campos pulmonares de forma simétrica, y observo la expansión torácica y el vaho.'),
 (25, 'Ventila con Bolsa de ambú para ventilación manual a una frecuencia de 15-18 ventilaciones por minuto verificando permanentemente la Saturación de Oxigeno (Sat O2)', 'Verificación', 'ambu', 0, {'vent2': 1}, 'ventilar',
  'Se conecta la bolsa de ambú al tubo y se ventila a 15–18 por minuto controlando de forma permanente la saturación de oxígeno.',
  [['ventilo', 'saturacion'], ['ambu', 'saturacion'], ['verificando', 'saturacion'], ['ventilo', 'bolsa']], 'Ventilo con la bolsa de ambú a 15-18 por minuto verificando la saturación de oxígeno.'),
 (26, 'Asegura el TET pegándolo (con cinta adhesiva hipo-alergénica) a las mejillas.', 'Verificación', 'cinta', 0, {'fix': 1}, 'cinta',
  'El tubo se fija con cinta hipoalergénica a las mejillas, constatando la marca de profundidad en la comisura labial (habitualmente entre 21 y 23 cm en el adulto), para detectar cualquier desplazamiento o extubación accidental.',
  [['cinta'], ['fijo', 'tubo'], ['aseguro', 'tubo'], ['mejillas']], 'Aseguro el tubo con cinta hipoalergénica a las mejillas.'),
]
PASO_TRAUMA = (10.5, 'Con sospecha de trauma cervical: realiza la tracción o subluxación mandibular manteniendo la inmovilización cervical en eje, sin hiperextender el cuello.', 'Posición y monitoreo', 'cabeza', 1, {'subluxacion': 1}, 'traccion_mandibular',
  'Con sospecha de lesión cervical la hiperextensión está contraindicada: puede lesionar la médula. Un asistente mantiene la inmovilización manual en eje y el operador abre la vía aérea solo con la tracción o subluxación de la mandíbula, sin mover el cuello. Hiperextender en este paciente es criterio de desaprobación.',
  [['traccion', 'mandib'], ['subluxacion'], ['elevo', 'mandibula'], ['inmovilizacion', 'cervical'], ['inmovilizo'], ['traccion', 'menton']], 'Realizo la tracción mandibular manteniendo la inmovilización cervical en eje, sin hiperextender el cuello.')
pasos = [dict(n=n, texto=tx, fase=fa, target=tg, critico=bool(cr), explica=ex, estado=es, claves=cl, frase=fr, fx=fx) for n, tx, fa, tg, cr, es, fx, ex, cl, fr in P + [PASO_TRAUMA]]
pasos.sort(key=lambda q: q['n'])
for p in pasos:
    if p['n'] == 10: p['sin_si'] = 'trauma'
    if p['n'] == 10.5: p['solo_si'] = 'trauma'
for p in pasos:
    if p['n'] == 12: p['gemelo'] = 25
    if p['n'] == 25: p['gemelo'] = 12

# =====================================================================  ELEMENTOS
EL = {
 'mesa': ('Mesa alta de traslado', 'Donde se reúne y prepara todo el material antes de ir al paciente.'),
 'lado': ('Lado del paciente', 'Zona junto a la cabecera donde queda el carro con el material.'),
 'lavabo': ('Lavabo', 'Lavado de manos con técnica clínica antes de la ropa estéril.'),
 'ropa': ('Ropa estéril', 'Camisolín, gorro, barbijo y guantes estériles.'),
 'laringo': ('Laringoscopio', 'Mango con hoja curva y luz: se verifica, se sostiene con la mano izquierda y se retira al final.'),
 'tetc': ('Tubo endotraqueal (TET)', 'Con balón y piloto. Se verifica el balón antes de usarlo.'),
 'paciente': ('Paciente', 'Se lo acomoda en decúbito dorsal con la cabeza en posición de olfateo.'),
 'cabecera': ('Cabecera del paciente', 'El operador se ubica detrás de la cabeza, en el eje del paciente.'),
 'saturometro': ('Saturómetro', 'Pulsioxímetro de dedo: saturometría continua durante todo el procedimiento.'),
 'cabeza': ('Cabeza y cuello', 'Se hiperextiende la cabeza y se eleva el mentón.'),
 'boca': ('Boca', 'Se retiran las prótesis, se abre la boca y se acomoda la comisura labial.'),
 'ambu': ('Bolsa de ambú', 'Ventilación con máscara antes de laringoscopiar y por el tubo al final.'),
 'cricoides': ('Cartílago cricoides', 'El asistente lo presiona hacia atrás (maniobra de Sellick).'),
 'lengua': ('Lengua', 'La hoja entra por la derecha y la desplaza hacia la izquierda.'),
 'epiglotis': ('Epiglotis y vallécula', 'La punta de la hoja curva se apoya en la vallécula y levanta la epiglotis.'),
 'cuerdas': ('Cuerdas vocales', 'Delimitan la glotis: se visualizan y se atraviesan bajo visión directa.'),
 'asistente': ('Asistente', 'Alcanza el tubo y realiza la presión sobre el cricoides.'),
 'balon': ('Balón del TET', 'Queda 3 a 4 cm por debajo de las cuerdas y se infla por el piloto.'),
 'jeringa': ('Jeringa de 10 cc', 'Para inflar el balón por el piloto.'),
 'pulmones': ('Pulmones', 'Se auscultan ambos campos pulmonares para verificar la posición del tubo.'),
 'cinta': ('Cinta hipoalergénica', 'Fija el tubo a las mejillas.'),
}
elementos = {k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasos if p['target'] == k]) for k, v in EL.items()}

# =====================================================================  DISTRACTORES
D = [
 ('d1', 'Comienza sin lavarse las manos ni vestirse con ropa estéril', 1, 'Es criterio de desaprobación: la vía aérea inferior es estéril y el operador debe protegerse de las secreciones.', 'lavabo', [['sin lavar', 'manos'], ['no me lavo'], ['sin lavarme'], ['sin ropa esteril'], ['sin vestirme'], ['no me visto']]),
 ('d2', 'Introduce el laringoscopio sin verificar que la luz funcione', 1, 'Es criterio de desaprobación: sin luz no hay visión y se obliga a retirarse con el paciente apneico.', 'laringo', [['sin verificar', 'laringoscopio'], ['sin probar', 'laringoscopio'], ['no verifico', 'laringoscopio'], ['no pruebo', 'laringoscopio'], ['sin comprobar', 'laringoscopio']]),
 ('d3', 'Usa el tubo sin verificar el balón', 1, 'Es criterio de desaprobación: un balón defectuoso no sella la vía aérea y permite aspiración.', 'tetc', [['sin verificar', 'balon'], ['sin probar', 'balon'], ['no verifico', 'balon'], ['no pruebo', 'balon'], ['sin comprobar', 'balon']]),
 ('d4', 'Realiza el procedimiento sin saturómetro', 1, 'Es criterio de desaprobación: sin monitoreo continuo no se sabe cuándo el paciente desatura.', 'saturometro', [['sin saturometro'], ['sin saturometria'], ['no coloco', 'saturometro'], ['sin oximetro'], ['sin monitoreo']]),
 ('d5', 'Laringoscopia sin ventilar ni oxigenar antes al paciente', 1, 'Es criterio de desaprobación: sin preoxigenación el paciente desatura durante la apnea del intento.', 'ambu', [['sin ventilar'], ['sin oxigenar'], ['sin preoxigenar'], ['no ventilo'], ['sin ambu'], ['sin mascara']]),
 ('d6', 'Hace palanca con el laringoscopio sobre los dientes', 1, 'Es una falla técnica grave: lesiona los dientes y no mejora la visión. La tracción se hace en el eje del mango, hacia arriba y adelante.', 'laringo', [['palanca'], ['apoyo', 'dientes'], ['sobre los dientes'], ['hacia atras', 'laringoscopio'], ['pivoteo']]),
 ('d7', 'Intuba sin visualizar las cuerdas vocales (a ciegas)', 1, 'Es criterio de desaprobación: sin visión directa de la glotis no se pasa el tubo; se retira, se ventila y se reintenta.', 'cuerdas', [['sin visualizar'], ['a ciegas'], ['sin ver', 'cuerdas'], ['sin ver la glotis'], ['sin visualizar', 'glotis']]),
 ('d8', 'Ingresa la hoja por el centro o por la izquierda sin desplazar la lengua', 0, 'La hoja entra por el lado derecho de la lengua y la desplaza hacia la izquierda; de lo contrario la lengua tapa la glotis.', 'lengua', [['por el lado izquierdo'], ['por la izquierda', 'hoja'], ['sin desplazar', 'lengua'], ['por el centro', 'hoja']]),
 ('d9', 'Infla el balón antes de ubicar el tubo en la tráquea', 0, 'El balón se infla una vez que el tubo está en posición, 3 a 4 cm por debajo de las cuerdas.', 'balon', [['inflo', 'antes'], ['inflo el balon antes']]),
 ('d10', 'Avanza el tubo hasta el fondo (riesgo de intubación selectiva)', 0, 'Introducir el tubo de más lo lleva al bronquio derecho (intubación selectiva): hipoventilación del hemitórax izquierdo.', 'cuerdas', [['hasta el fondo'], ['avanzo', 'carina'], ['hasta que no avance']]),
 ('d12', 'Hiperextiende la cabeza de un paciente con sospecha de trauma cervical', 1, 'Es criterio de desaprobación: con sospecha de lesión cervical la hiperextensión puede lesionar la médula; se inmoviliza el cuello en eje y se usa solo la tracción mandibular.', 'cabeza', [['hiperextiendo'], ['hiperextension'], ['extiendo', 'cabeza'], ['frente menton'], ['elevo', 'menton']], 'trauma'),
 ('d11', 'Da por correcta la intubación sin verificar la colocación', 1, 'Es criterio de desaprobación: la intubación esofágica no detectada es letal; siempre se verifica con auscultación, expansión torácica, vaho y capnografía.', 'pulmones', [['sin verificar', 'colocacion'], ['doy por correcto'], ['asumo', 'colocacion'], ['no verifico', 'colocacion']]),
]
distractores = []
for row in D:
    i, t, c, pq, tg, cl = row[:6]
    dd = dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl)
    if len(row) > 6: dd['solo_si'] = row[6]
    distractores.append(dd)

# =====================================================================  CASOS
def caso(i, nombre, sexo, edad, motivo, ant, mall, via, verif, prot, indic='Intubación endotraqueal para proteger la vía aérea y ventilar.', trauma=False):
    return dict(trauma=trauma, id=i, nombre=nombre, sexo=sexo, edad=edad, motivo=motivo, indicacion=indic, antecedentes=ant, alergia=None, extra=[mall],
                via_aerea=via, protesis=prot, verif=verif)
casos = [
 caso('c1', 'Ricardo S.', 'M', 58, 'Paro respiratorio por EPOC reagudizado. Glasgow 6.', 'EPOC, tabaquista de larga data.', 'Mallampati II',
      'Mallampati II, apertura bucal normal, cuello móvil y distancia tiromentoniana mayor de 6 cm.', 'murmullo vesicular simétrico, epigastrio silencioso, vaho en el tubo y onda de capnografía.', 'sin prótesis dentales.'),
 caso('c2', 'Lucía G.', 'F', 34, 'Politraumatismo por accidente de tránsito con traumatismo craneoencefálico grave. Glasgow 7. Llega con collar cervical colocado por emergencias.', 'Sin antecedentes. Sin alergias conocidas.', 'Mallampati I',
      'Mallampati I, apertura bucal amplia. Sospecha de lesión cervical: un asistente debe mantener la inmovilización manual en eje.', 'expansión torácica simétrica, murmullo vesicular bilateral, capnografía con onda normal.', 'sin prótesis dentales.', trauma=True),
 caso('c3', 'Alberto D.', 'M', 71, 'Edema agudo de pulmón con insuficiencia respiratoria: saturación 78 % pese al oxígeno.', 'Insuficiencia cardíaca, hipertensión arterial.', 'Mallampati III',
      'Mallampati III: se ve el paladar blando y la base de la úvula; cuello algo rígido. Anticipá una laringoscopia más difícil: tené a mano mandril y bougie.', 'estertores bilaterales conservando la simetría, epigastrio silencioso, vaho y onda de capnografía.', 'tiene una prótesis dental superior removible.'),
 caso('c4', 'Marta E.', 'F', 66, 'Cirugía programada (colecistectomía) bajo anestesia general.', 'Hipertensión arterial. Sin alergias conocidas.', 'Mallampati II',
      'Mallampati II, apertura bucal normal.', 'murmullo vesicular simétrico, capnografía con onda normal y vaho en el tubo.', 'sin prótesis dentales.', 'Intubación endotraqueal para anestesia general.'),
 caso('c5', 'Pablo N.', 'M', 25, 'Sobredosis de opioides con depresión respiratoria. Glasgow 5.', 'Consumo problemático de sustancias.', 'Mallampati I',
      'Mallampati I, apertura bucal amplia.', 'expansión simétrica, murmullo vesicular bilateral y capnografía normal.', 'sin prótesis dentales.'),
 caso('c6', 'Rosa T.', 'F', 79, 'ACV hemorrágico con deterioro del sensorio. Glasgow 6.', 'Hipertensión arterial, fibrilación auricular anticoagulada.', 'Mallampati III',
      'Mallampati III, cuello rígido. Anticipá una laringoscopia más difícil: tené a mano mandril y bougie.', 'murmullo vesicular simétrico, epigastrio silencioso, vaho y capnografía con onda.', 'tiene una prótesis dental superior removible.'),
 caso('c7', 'Jorge M.', 'M', 52, 'Paro cardiorrespiratorio presenciado. Se requiere vía aérea definitiva.', 'Cardiopatía isquémica.', 'Mallampati II',
      'Mallampati II, apertura bucal normal.', 'murmullo vesicular simétrico y capnografía con onda.', 'sin prótesis dentales.'),
 caso('c8', 'Elena V.', 'F', 45, 'Estado asmático refractario con fatiga respiratoria.', 'Asma bronquial de larga data.', 'Mallampati II',
      'Mallampati II, apertura bucal normal.', 'sibilancias bilaterales simétricas, epigastrio silencioso, vaho y capnografía con onda en pico de aleta.', 'sin prótesis dentales.'),
]

# =====================================================================  FUNDAMENTOS
Q = [
 ('¿Cuál es una indicación de intubación endotraqueal?', ['Glasgow 8 o menos con riesgo de aspiración', 'Tos productiva sin dificultad respiratoria', 'Disfonía leve', 'Saturación de 96 % con aire ambiente'], 0, 'Un Glasgow ≤ 8 no protege la vía aérea. Otras indicaciones: apnea o paro, insuficiencia respiratoria refractaria, obstrucción de la vía aérea y ventilación mecánica en anestesia general.'),
 ('¿Qué se evalúa con la clasificación de Mallampati?', ['Las estructuras faríngeas visibles con la boca abierta y la lengua protruida, para predecir la dificultad de la laringoscopia', 'El diámetro del tubo endotraqueal', 'La distancia entre el cricoides y la carina', 'La presión del balón'], 0, 'Clase I: paladar blando, fauces, úvula y pilares; II: paladar blando, fauces y úvula; III: paladar blando y base de la úvula; IV: solo paladar duro. A mayor clase, mayor probabilidad de laringoscopia difícil.'),
 ('¿Por qué se ventila con máscara y ambú antes de laringoscopiar?', ['Para preoxigenar y tolerar la apnea del intento sin desaturar', 'Para dilatar las cuerdas vocales', 'Para comprobar el balón del tubo', 'Para sedar al paciente'], 0, 'La ventilación con oxígeno aumenta la reserva de oxígeno y permite intentar con seguridad. Laringoscopiar sin ventilar antes es criterio de desaprobación.'),
 ('Paciente politraumatizada con collar cervical. ¿Cómo se abre la vía aérea?', ['Tracción o subluxación de la mandíbula con inmovilización cervical en eje, sin hiperextender', 'Maniobra frente-mentón con hiperextensión', 'Flexión máxima del cuello', 'Se retira el collar y se coloca la posición de olfateo'], 0, 'Con sospecha de trauma cervical la hiperextensión está contraindicada. Un asistente inmoviliza el cuello en eje y el operador abre la vía aérea solo con la tracción de la mandíbula.'),
 ('¿Cuál es la posición de la cabeza para intubar?', ['Posición de olfateo, con elevación del occipucio', 'Flexión del cuello con el mentón en el pecho', 'Rotación lateral máxima', 'Cabeza sin almohada y cuello en flexión'], 0, 'En la posición de olfateo se alinean los ejes oral, faríngeo y laríngeo, lo que facilita ver la glotis.'),
 ('¿Para qué se realiza la maniobra de Sellick?', ['Presionar el cricoides hacia atrás para ocluir el esófago y prevenir la regurgitación', 'Abrir la boca del paciente', 'Insertar el laringoscopio', 'Fijar el tubo a las mejillas'], 0, 'El cricoides es un anillo completo: al presionarlo hacia atrás comprime el esófago contra la columna cervical.'),
 ('¿Hacia dónde se levanta el laringoscopio con una hoja curva?', ['Hacia arriba y adelante, en el eje del mango, sin palanca sobre los dientes', 'Hacia atrás, apoyando la hoja en los dientes superiores', 'Hacia la izquierda', 'Hacia abajo, hacia el esternón'], 0, 'La hoja curva (Macintosh) se apoya en la vallécula y se levanta hacia arriba y adelante. La palanca sobre los dientes los rompe.'),
 ('¿En qué orden se ausculta para verificar el tubo?', ['Primero el epigastrio (debe ser negativo) y luego ambos pulmones (positivos y simétricos)', 'Solo el pulmón derecho', 'Primero los vértices y no el epigastrio', 'No hace falta auscultar si hay capnografía'], 0, 'Se ausculta primero el epigastrio: si hay ruidos hidroaéreos es una intubación esofágica y se retira el tubo. Después se ausculta en ambos pulmones, que deben ser positivos y simétricos.'),
 ('¿Dónde debe quedar el balón del tubo?', ['3 a 4 cm por debajo de las cuerdas vocales', 'A la altura de las cuerdas vocales', 'En el bronquio derecho', 'Por encima de la epiglotis'], 0, 'Más arriba lesiona la laringe y más abajo aumenta el riesgo de intubación selectiva.'),
 ('Tras intubar, no hay ruidos respiratorios, se oyen borborigmos en el epigastrio y cae la saturación. ¿Qué indica y qué se hace?', ['Intubación esofágica: retirar el tubo de inmediato y reoxigenar', 'Intubación selectiva: avanzar el tubo', 'Neumotórax: inflar más el balón', 'Posición correcta: fijar el tubo'], 0, 'La intubación esofágica no detectada es letal. Se retira el tubo, se ventila con máscara y se reintenta. La intubación selectiva (ruidos solo a la derecha) se corrige retirando el tubo unos centímetros.'),
 ('En la visión de Cormack-Lehane, solo se ve la epiglotis y no la glotis. ¿Qué grado es?', ['Grado III', 'Grado I', 'Grado II', 'Grado IV'], 0, 'I: glotis completa; II: solo la comisura posterior; III: solo la epiglotis; IV: ninguna estructura glótica ni epiglotis.'),
]
fund = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in Q]

machete = {
 'perlas': [
  {'t': 'Antes de empezar', 'x': 'Indicaciones: apnea o paro, Glasgow ≤ 8, insuficiencia respiratoria refractaria, obstrucción y anestesia general. Evaluá la vía aérea: Mallampati, apertura bucal, movilidad cervical, distancia tiromentoniana.'},
  {'t': 'Asepsia y equipo', 'x': 'Lavado de manos y ropa estéril. Probá la luz del laringoscopio y el balón del TET (diámetro interno: mujer 7,0–8,0 mm; varón 8,0–9,0 mm). Omitirlo desaprueba.'},
  {'t': 'Oxigenar primero', 'x': 'Saturómetro puesto durante todo el procedimiento y ventilación con máscara y ambú a 15–18 por minuto ANTES de laringoscopiar. Posición de olfateo, cabeza hiperextendida y mentón elevado. Prótesis fuera.'},
  {'t': 'Sellick', 'x': 'El asistente presiona el cricoides hacia atrás y mantiene la presión hasta el final.'},
  {'t': 'Laringoscopia', 'x': 'Mango en la izquierda; hoja por la derecha de la lengua, empujándola a la izquierda, en la línea media. La punta va a la vallécula y se levanta hacia arriba y adelante: mango al techo a 45°. Nunca palanca sobre los dientes.'},
  {'t': 'Intubación', 'x': 'Visualizá las cuerdas. Pedí el tubo sin dejar de mirar, deslizalo por la hoja hasta pasar las cuerdas y dejá el balón 3–4 cm por debajo. Retirá el laringoscopio e inflá el balón con 10 cc.'},
  {'t': 'Verificar y fijar', 'x': 'Auscultá epigastrio y ambos campos, mirá la expansión torácica, el vaho y la capnografía; ventilá a 15–18 controlando la saturación y fijá con cinta a las mejillas.'},
 ],
 'por_paso': {
  '5': 'Armá la hoja y comprobá que la luz encienda.', '6': 'Inflá y desinflá el balón: sin pérdidas.', '7': 'Olfateo + Mallampati.', '9': 'Saturometría continua.',
  '12': 'Ventilá con máscara ANTES de laringoscopiar.', '13': 'Presión en el cricoides hasta el final.', '15': 'Hoja por la derecha, lengua a la izquierda.',
  '16': 'Punta en la vallécula, arriba y adelante.', '17': 'Mango al techo, 45°. Sin palanca.', '18': 'Sin ver las cuerdas no se intuba.', '21': 'Balón 3–4 cm bajo las cuerdas.',
  '23': 'Inflá con 10 cc por el piloto.', '24': 'Auscultación, expansión, vaho y capnografía.',
 },
}

IET = dict(
 id='iet', area='siam', titulo='Intubación endotraqueal', icono='🫁',
 resumen='Recorrido virtual de la intubación endotraqueal, con 26 pasos de la lista de cotejo de la cátedra.',
 umbral=60, fuente='Lista de cotejo: Evaluación en intubación endotraqueal (26 ítems)',
 elementos=elementos, distractores=distractores, casos=casos, fundamentos=fund,
 criterios_texto='Desaprueba si omite: el lavado de manos y la ropa estéril (3, 4); la verificación del laringoscopio y del balón del tubo (5, 6); la saturometría continua y la ventilación con ambú antes de laringoscopiar (9, 12); la visualización de las cuerdas antes de pasar el tubo (18, 20); o la posición del balón, su inflado y la verificación de la colocación (21, 23, 24). Se aprueba con al menos 60 % del puntaje y ningún paso crítico fallido.',
 criterios=[
  dict(ico='🧼', titulo='Asepsia: lavado de manos y ropa estéril', pasos=[3, 4]),
  dict(ico='🔦', titulo='Verificar laringoscopio y balón del tubo', pasos=[5, 6]),
  dict(ico='🫧', titulo='Saturometría y ventilar con ambú antes de laringoscopiar', pasos=[9, 12]),
  dict(ico='👁️', titulo='Ver las cuerdas antes de pasar el tubo', pasos=[18, 20]),
  dict(ico='✅', titulo='Balón en posición, inflado y colocación verificada', pasos=[21, 23, 24]),
 ],
 final_criticos='asepsia, verificación del equipo, saturometría y ventilación previa, visualización de las cuerdas y verificación de la colocación',
 hallazgo_pasos={'7': 'via_aerea', '11': 'protesis', '24': 'verif'}, hallazgo_rotulo='🩺 Evaluás:',
 machete=machete, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/siam/iet_modelo.json', peso_modelo='1 a 2 MB', instrumental='data/acreditaciones/siam/instrumental_iet.json',
 mesa_pasos=[1], pasos=pasos,
)
W(OUT + 'iet.json', IET)

# =====================================================================  INSTRUMENTAL
S = J(OUT + 'instrumental_sv.json'); byid = {i['id']: i for i in S['items']}
def b(i, **kw):
    o = dict(byid[i]); [o.pop(k, None) for k in ('sexo', 'solo_alergia', 'latex', 'feedback_latex', 'feedback', 'falta', 'critico', 'correcto', 'ficha')]; o.update(kw); return o
def nuevo(id, grupo, nombre, detalle, correcto, critico, descripcion, ficha, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=descripcion, ficha=ficha); o.update(kw); return o
items = [
 nuevo('laringoscopio', 'via', 'Laringoscopio con hoja curva Macintosh n.º 3', 'Mango + hoja · luz LED', True, True,
       'Permite ver la glotis. La hoja curva se apoya en la vallécula y levanta la epiglotis. La n.º 3 (o 4) corresponde al adulto.', [['Hoja', 'Macintosh n.º 3'], ['Luz', 'LED'], ['Pilas', 'Cargadas'], ['Lote', 'LR-44021']],
       falta='Falta el laringoscopio: sin él no hay visión directa de la glotis.'),
 nuevo('hoja_miller0', 'via', 'Hoja recta Miller n.º 0', 'Neonatal · hoja recta', False, False,
       'Hoja recta pequeña para recién nacidos.', [['Hoja', 'Miller n.º 0'], ['Uso', 'Neonatal']],
       feedback='La hoja Miller n.º 0 es neonatal. En el adulto se usa una hoja curva Macintosh n.º 3 (o 4).'),
 nuevo('tet_f', 'via', 'Tubo endotraqueal 7,5 mm con balón', 'Adulto · mujer · con balón y piloto', True, True,
       'Diámetro interno para una mujer adulta según la cátedra: 7,0 a 8,0 mm. Tiene balón de baja presión y piloto para inflarlo.', [['Calibre', '7,5 mm ID'], ['Balón', 'Alto volumen · baja presión'], ['Esterilidad', 'Estéril'], ['Lote', 'TE-70112']],
       correcto_para='F', falta='Falta el tubo endotraqueal del calibre adecuado para la mujer (7,0–8,0 mm).',
       feedback_otro='Para un varón adulto corresponde un tubo de 8,0–9,0 mm: uno de 7,5 mm es más fino de lo adecuado y aumenta la resistencia al flujo.'),
 nuevo('tet_m', 'via', 'Tubo endotraqueal 8,5 mm con balón', 'Adulto · varón · con balón y piloto', True, True,
       'Diámetro interno para un varón adulto según la cátedra: 8,0 a 9,0 mm. Tiene balón de baja presión y piloto para inflarlo.', [['Calibre', '8,5 mm ID'], ['Balón', 'Alto volumen · baja presión'], ['Esterilidad', 'Estéril'], ['Lote', 'TE-80231']],
       correcto_para='M', falta='Falta el tubo endotraqueal del calibre adecuado para el varón (8,0–9,0 mm).',
       feedback_otro='Para una mujer adulta corresponde un tubo de 7,0–8,0 mm: uno de 8,5 mm es demasiado grueso y aumenta el riesgo de lesión laríngea.'),
 nuevo('tet_ped', 'via', 'Tubo endotraqueal 4,0 mm sin balón', 'Pediátrico', False, False, 'Tubo fino sin balón para niños pequeños.', [['Calibre', '4,0 mm'], ['Balón', 'Sin balón']],
       feedback='El tubo de 4,0 mm sin balón es pediátrico: no sirve en un adulto, ni sella la vía aérea.'),
 nuevo('mandril', 'via', 'Mandril o guía estéril', 'Se introduce dentro del tubo', True, False, 'Da rigidez y forma al tubo cuando se anticipa una laringoscopia difícil (Mallampati III-IV, cuello rígido). Es opcional.', [['Tipo', 'Guía maleable'], ['Esterilidad', 'Estéril']], opcional=True),
 nuevo('guedel', 'via', 'Cánula orofaríngea de Guedel n.º 4', 'Adulto', True, False, 'Mantiene la vía aérea permeable al ventilar con máscara. Es opcional si no se necesita.', [['Tamaño', 'N.º 4'], ['Material', 'Plástico']], opcional=True),
 nuevo('aspirador', 'via', 'Aspirador con cánula de Yankauer', 'Succión rígida', True, False, 'Por si hay secreciones o vómito. Es opcional.', [['Cánula', 'Yankauer'], ['Succión', 'Rígida']], opcional=True),
 nuevo('estetoscopio', 'vent', 'Estetoscopio', 'Adulto', True, True, 'Sirve para auscultar primero el epigastrio y luego ambos campos pulmonares y verificar la colocación del tubo.', [['Tipo', 'Doble campana'], ['Uso', 'Adulto']], falta='Falta el estetoscopio para auscultar y verificar la colocación del tubo.'),
 nuevo('ambu', 'vent', 'Bolsa de ambú con máscara y reservorio', 'Adulto · con oxígeno', True, True, 'Para ventilar con máscara antes de laringoscopiar y por el tubo después, a 15–18 por minuto.', [['Volumen', 'Adulto 1600 mL'], ['Reservorio', 'Sí'], ['Máscara', 'N.º 4'], ['Lote', 'AM-20987']], falta='Falta la bolsa de ambú con máscara: no se puede preoxigenar ni ventilar.'),
 nuevo('oxigeno', 'vent', 'Fuente de oxígeno', 'Con caudalímetro', True, True, 'Alimenta la bolsa de ambú con oxígeno al 100 %.', [['Gas', 'Oxígeno medicinal'], ['Flujo', '10–15 L/min']], falta='Falta la fuente de oxígeno para la ventilación.'),
 nuevo('saturometro', 'vent', 'Saturómetro (pulsioxímetro)', 'De dedo', True, True, 'Monitoriza la saturación de oxígeno de forma continua durante todo el procedimiento.', [['Tipo', 'De dedo'], ['Medición', 'SpO₂ y pulso']], falta='Falta el saturómetro: no hay monitoreo continuo.'),
 nuevo('kit_esteril', 'prot', 'Ropa estéril', 'Camisolín, cofia, antiparras, barbijo, guantes y botas', True, True, 'El tubo se introduce en una vía aérea estéril y el operador se expone a secreciones.', [['Contenido', 'Camisolín · cofia · antiparras · barbijo · guantes · botas'], ['Esterilidad', 'Estéril'], ['Talle', '7,5']], falta='Falta la ropa estéril: camisolín, cofia, antiparras, barbijo, guantes y botas.'),
 b('guantes_ns', grupo='prot', nombre='Guantes de examen no estériles', detalle='No alcanzan para este procedimiento', correcto=False, critico=False,
   feedback='Para intubar se necesita ropa estéril completa (incluidos guantes estériles). Los guantes de examen no estériles no alcanzan.', ficha=[['Tipo', 'Examen, no estériles']]),
 b('jeringa10', grupo='otros', nombre='Jeringa de 10 cc', detalle='Para inflar el balón por el piloto', correcto=True, critico=True,
   descripcion='Se acopla al piloto del tubo para inflar el balón con 10 cc de aire.', falta='Falta la jeringa de 10 cc para inflar el balón del tubo.', ficha=[['Capacidad', '10 mL'], ['Esterilidad', 'Estéril']]),
 b('cinta', grupo='otros', nombre='Cinta hipoalergénica', detalle='Para fijar el tubo a las mejillas', correcto=True, critico=False,
   descripcion='Fija el tubo a las mejillas para evitar su desplazamiento o la extubación accidental.', falta='Falta la cinta hipoalergénica para fijar el tubo.', ficha=[['Ancho', '2,5 cm'], ['Material', 'Hipoalergénica']]),
 b('gel', grupo='otros', nombre='Lidocaína en gel 2 %', detalle='Lubricante hidrosoluble', correcto=True, critico=False, opcional=True,
   descripcion='Puede usarse para lubricar el tubo. Es opcional.', ficha=[['Contenido', 'Lidocaína 2 %']]),
]
F = {'sonda_m': ('otros', 'La sonda Foley es para el sondaje vesical. En la intubación no se usa.'), 'sng': ('otros', 'La sonda nasogástrica es para la vía digestiva. Colocarla en lugar del tubo no asegura la vía aérea.'),
     'bolsa': ('otros', 'La bolsa colectora es para el drenaje urinario. No se usa en la intubación.'), 'aguja': ('otros', 'No se usan agujas en la intubación.'),
     'iodo': ('otros', 'La iodopovidona no se usa en este procedimiento.')}
for k, (g, fb) in F.items():
    it = b(k, grupo=g, correcto=False, critico=False, feedback=fb)
    if k == 'sonda_m': it['nombre'] = 'Sonda Foley 16 Fr, 2 vías'
    items.append(it)
INS = dict(id='iet', titulo='Mesa de instrumental · Intubación endotraqueal',
 consigna='Leé el caso clínico y armá la mesa con todo lo necesario para ese paciente: el calibre del tubo depende del sexo. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='indicación de intubación endotraqueal', indicacion_def='Intubación endotraqueal.',
 mision=['qué tubo endotraqueal corresponde al paciente (calibre según el sexo);', 'qué equipo de vía aérea, ventilación y monitoreo hace falta… y cuáles sobran.'],
 demo_caso='Primero se lee el caso clínico: de él depende el calibre del tubo y el equipo que se prepara.',
 grupos=[dict(id='via', titulo='Vía aérea'), dict(id='vent', titulo='Ventilación y monitoreo'), dict(id='prot', titulo='Protección'), dict(id='otros', titulo='Otros insumos')],
 items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_iet.json', INS)

# =====================================================================  MODELO 3D
M = J(OUT + 'sv_modelo.json')
glb = lambda id, f, capa, color, op, hs, nom, peso, **kw: dict(id=id, tipo='glb', src=f'assets/anatomia/iet/{f}.glb', escala=100, rot=[0, 0, 0], pos=[0, 0, 0], capa=capa, color=color, opacidad=op, hs=hs, nombre=nom, peso=peso, **kw)
PIV = [0, 157.0, 0.9]; ABRIR = [0.30, 0, 0]
piezas = [
 glb('piel', 'piel', 'piel', '#d8a387', 0.30, None, 'Cuerpo del paciente', 140448, piel_real=True),
 glb('vertebras', 'vertebras', 'huesos', '#e8e1cf', 0.55, None, 'Vértebras cervicales C3-C7', 88572),
 glb('columna', 'columna', 'huesos', '#e8e1cf', 0.55, None, 'Atlas y axis', 11968),
 glb('mandibula', 'mandibula', 'huesos', '#e8e1cf', 0.55, None, 'Mandíbula y maxilar', 64056, pivote=PIV, rot_pivote=ABRIR),
 glb('dientes_sup', 'dientes_sup', 'huesos', '#f8fafc', 0.95, 'dientes', 'Dientes superiores', 47180),
 glb('dientes_inf', 'dientes_inf', 'huesos', '#f8fafc', 0.95, 'dientes', 'Dientes inferiores', 48504, pivote=PIV, rot_pivote=ABRIR),
 glb('hioides', 'hioides', 'huesos', '#e8e1cf', 0.7, None, 'Hioides', 5724),
 glb('lengua', 'lengua', 'organos', '#d9707a', 0.82, 'lengua', 'Lengua', 41780, pivote=PIV, rot_pivote=[0.24, 0, 0]),
 glb('paladar', 'paladar', 'organos', '#f08aa0', 0.8, 'paladar', 'Paladar blando y úvula', 19396),
 glb('faringe', 'faringe', 'organos', '#e07a8a', 0.4, 'faringe', 'Faringe', 24992),
 glb('epiglotis', 'epiglotis', 'organos', '#f4a6b0', 0.9, 'epiglotis', 'Epiglotis', 12612),
 glb('laringe', 'laringe', 'organos', '#b8c7d9', 0.85, 'laringe', 'Cartílago tiroides y aritenoides', 49732),
 glb('cricoides', 'cricoides', 'organos', '#9fb3c8', 0.9, 'cricoides', 'Cartílago cricoides', 20000),
 glb('traquea', 'traquea', 'organos', '#ffb4a2', 0.55, 'traquea', 'Tráquea y bronquios', 21868),
 glb('pulmones', 'pulmones', 'organos', '#f4a9a8', 0.4, 'pulmones', 'Pulmones', 52968),
]
proc = {
 'esofago': dict(pts=[[0, 147.0, -1.6], [0, 143, -2.6], [0, 138, -2.9], [0, 130, -2.4], [0, 122, -1.6]], radio=0.8, color='#c97a6b', opacidad=0.55, capa='organos', hs='esofago'),
 'cuerda_d': dict(pts=[[0.2, 147.55, 2.0], [0.42, 147.45, 1.45], [0.55, 147.4, 0.95]], radio=0.14, color='#f8f1f1', opacidad=0.98, capa='organos', hs='cuerdas'),
 'cuerda_i': dict(pts=[[-0.2, 147.55, 2.0], [-0.42, 147.45, 1.45], [-0.55, 147.4, 0.95]], radio=0.14, color='#f8f1f1', opacidad=0.98, capa='organos', hs='cuerdas'),
}
RUTA = [[0, 156.4, 18.0], [0, 154.6, 13.2], [0, 152.9, 9.0], [0, 151.7, 6.6], [0, 150.5, 4.2], [0, 149.2, 2.6], [0, 147.8, 1.4], [0, 146.2, 0.9], [0, 144.4, 0.5], [0, 142.0, 0.2], [0, 139.4, 0.0]]
VAR = dict(
 origen=[0, 148.0, 3.0], corte_x=0.0, rotacion=[-1.5707963, 3.1415927, 0], piezas=piezas, procedurales=proc,
 laringo=dict(bisagra=[0, 151.9, 11.6], hoja=[[0, 0], [-0.5, -2.8], [-1.5, -5.4], [-2.3, -7.6], [-2.6, -8.9], [-2.4, -9.4]], mango=dict(dir=[-0.93, 0.37], largo=11), grosor=0.5, luz=420, giro=-0.41),
 tet=dict(ruta=RUTA, fuera=[0, 152.9, 9.0], pasa_cuerdas=[0, 146.2, 0.9], balon=[0, 144.1, 0.45]),
 ventila=dict(mascara=[0, 153.0, 10.0], bolsa_tet=[0, 156.4, 20.5], cuello_bolsa=[[0, 156.4, 18.0], [0, 156.4, 19.4]]),
 presion=dict(punto=[0, 146.4, 5.4]),
 pines=dict(paciente=[0, 172, 2], cabeza=[0, 163, 3], boca=[0, 152.8, 9.0], lengua=[0, 152.0, 5.0], epiglotis=[0, 150.0, 2.3], cuerdas=[0, 147.6, 1.4], laringe=[0, 148.6, 3.0],
            cricoides=[0, 146.4, 2.0], traquea=[0, 140.5, -0.3], esofago=[0, 141.5, -2.4], faringe=[0, 152.5, 1.2], paladar=[0, 155.0, 3.0], pulmones=[3, 130, -1.2], balon=[0, 144.1, 0.45]),
 camara=dict(lat=[24, -1.5, 0], fro=[0, 3, 26], sup=[0.01, 28, 0], objetivo=[0, -1.5, 0], ini=[22, 10, 16]),
 etiquetas=dict(paciente=[0, -50], cabeza=[120, -70], boca=[-40, -90], lengua=[-130, 20], epiglotis=[-110, 75], cuerdas=[110, 30], laringe=[60, -60], cricoides=[130, 85],
                traquea=[60, 95], esofago=[150, -10], faringe=[-110, -45], paladar=[40, -95], pulmones=[110, 120], balon=[-60, 110]),
)
G = dict(M['general']); G['vistas'] = dict(fro='Cabecera'); G['corte_inicial'] = True; G['camara'] = dict(M['general']['camara'], foco=17, min=6)
OVERLAY = ('<div class="hud-sat" aria-hidden="true"><b>SpO₂</b><span class="v">98</span><i class="lat"></i></div>'
 '<div class="inset-lar" aria-hidden="true"><div class="inset-tit">🎥 Vista laringoscópica</div>'
 '<svg viewBox="0 0 200 170"><defs><radialGradient id="vlm" cx="50%" cy="48%" r="60%"><stop offset="0" stop-color="#e7938f"/><stop offset=".6" stop-color="#c9696a"/><stop offset="1" stop-color="#5b1f27"/></radialGradient>'
 '<linearGradient id="vlc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7f5"/><stop offset="1" stop-color="#e8d3cf"/></linearGradient>'
 '<linearGradient id="vlt" x1="0" x2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".5" stop-color="#7dd3fc"/><stop offset="1" stop-color="#bae6fd"/></linearGradient>'
 '<clipPath id="vlclip"><circle cx="100" cy="88" r="78"/></clipPath></defs>'
 '<circle cx="100" cy="88" r="80" fill="#0b0f1d"/><g clip-path="url(#vlclip)"><rect width="200" height="170" fill="url(#vlm)"/>'
 '<g class="vl-epi"><path d="M28 20 C60 6 140 6 172 20 C176 44 150 62 100 64 C50 62 24 44 28 20 Z" fill="#f2b3ae" stroke="#c9696a" stroke-width="1.2"/><path d="M52 24 C80 14 120 14 148 24" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/></g>'
 '<g class="vl-glotis"><path d="M100 62 L66 128 Q100 146 134 128 Z" fill="#12060a"/><g class="vl-tra" opacity=".9"><ellipse cx="100" cy="118" rx="20" ry="9" fill="none" stroke="#3b1219" stroke-width="2"/><ellipse cx="100" cy="124" rx="14" ry="6" fill="none" stroke="#3b1219" stroke-width="2"/></g>'
 '<path class="vl-cd" d="M100 62 L62 130 L74 134 L102 78 Z" fill="url(#vlc)" stroke="#d9b8b3"/><path class="vl-ci" d="M100 62 L138 130 L126 134 L98 78 Z" fill="url(#vlc)" stroke="#d9b8b3"/>'
 '<ellipse cx="72" cy="140" rx="12" ry="9" fill="#d98c88" stroke="#a24f52"/><ellipse cx="128" cy="140" rx="12" ry="9" fill="#d98c88" stroke="#a24f52"/></g>'
 '<g class="vl-tubo"><rect x="86" y="70" width="28" height="140" rx="13" fill="url(#vlt)" stroke="#0284c7" stroke-width="1.4" opacity=".92"/><ellipse cx="100" cy="72" rx="13" ry="7" fill="#e0f2fe" stroke="#0284c7"/></g>'
 '<ellipse cx="100" cy="88" rx="78" ry="78" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/></g>'
 '<text x="100" y="166" text-anchor="middle" font-size="9" font-weight="700" fill="#cbd5e1" font-family="Plus Jakarta Sans,Arial,sans-serif">Cormack-Lehane I</text></svg></div>')
IM = dict(
 general=G, overlay_html=OVERLAY,
 tarjetas=dict(
  mesa=dict(titulo='🛒 Mesa alta de traslado', id='mesa', items=[['laringo', '🔦', 'Laringoscopio', 'hoja curva'], ['tetc', '🧵', 'Tubo endotraqueal', 'con balón'], ['jeringa', '💉', 'Jeringa', 'de 10 cc'], ['ambu', '🫁', 'Bolsa de ambú', 'con máscara'], ['saturometro', '🩸', 'Saturómetro', ''], ['cinta', '🩹', 'Cinta', 'hipoalergénica']]),
  entorno=dict(titulo='🏥 Entorno del paciente', items=[['lavabo', '🚰', 'Lavabo', ''], ['ropa', '🥼', 'Ropa estéril', ''], ['cabecera', '🛏️', 'Cabecera', 'del paciente'], ['asistente', '🧑‍⚕️', 'Asistente', ''], ['lado', '🛒', 'Lado del', 'paciente']])),
 chips=[['esteril', 'Ropa estéril'], ['lar_ok', 'Laringoscopio ok'], ['tet_ok', 'Balón del TET ok'], ['pos', 'Posición'], ['sat', 'Saturometría'], ['vent', 'Preoxigenado'], ['cuerdas', 'Cuerdas visualizadas'], ['tet', 'TET pasó las cuerdas'], ['tetp', 'TET en posición'], ['infl', 'Balón inflado'], ['verif', 'Colocación verificada'], ['fix', 'TET fijado']],
 usables=['lavabo', 'ropa', 'laringo', 'tetc', 'saturometro', 'ambu', 'jeringa', 'cinta', 'asistente', 'cabecera'],
 pines=[
  dict(id='boca', label='Boca', capa='organos', externo=True), dict(id='cabeza', label='Cabeza y cuello', capa='piel', externo=True), dict(id='paciente', label='Paciente', capa='piel', externo=True),
  dict(id='lengua', label='Lengua', capa='organos'), dict(id='epiglotis', label='Epiglotis y vallécula', capa='organos'), dict(id='cuerdas', label='Cuerdas vocales', capa='organos'),
  dict(id='laringe', label='Laringe', capa='organos'), dict(id='cricoides', label='Cartílago cricoides', capa='organos'), dict(id='traquea', label='Tráquea', capa='organos'),
  dict(id='esofago', label='Esófago', capa='organos'), dict(id='faringe', label='Faringe', capa='organos'), dict(id='paladar', label='Paladar blando y úvula', capa='organos'),
  dict(id='pulmones', label='Pulmones', capa='organos'), dict(id='balon', label='Balón del TET', capa='sonda', solo_con='instrumento')],
 instrumentos=[
  dict(id='laringoscopio', tipo='laringoscopio', clases=dict(mano='s-lar_mano', dentro='s-lar_dentro', palanca='s-lar_palanca', fuera='s-lar_fuera')),
  dict(id='tet', tipo='tet', color='#bfe8ff', color_balon='#38bdf8', radio=0.52, clases=dict(mano='s-tet_mano', avance='s-tet', profundo='s-tetp', inflar='s-infl')),
  dict(id='ventila', tipo='ventila', clases=dict(mascara='s-vent', laringo='s-lar_mano', bolsa_tet='s-vent2')),
  dict(id='presion', tipo='presion', clases=dict(activa='s-sellick', suelta='s-infl'))],
 M=VAR, F=VAR)
W(OUT + 'iet_modelo.json', IM)

# =====================================================================  INDEX
IX = J(OUT + 'index.json')
for a in IX['acreditaciones']:
    if a['id'] == 'iet': a['estado'] = 'activo'
W(OUT + 'index.json', IX)
print('ok', os.path.getsize(OUT + 'iet.json'))
