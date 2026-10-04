import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/cir/'
os.makedirs(OUT, exist_ok=True)
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8', newline=''), ensure_ascii=False, indent=1)
def dd(i, t, c, pq, tg, cl, **kw):
    o = dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl); o.update(kw); return o
FA, FB, FC, FD = 'Preparación', 'Lavado', 'Enjuague y secado', 'Guantes estériles'
# (n, texto, fase, target, crítico, estado, fx, explicación, claves, frase)
P = [
 (1, 'Se viste con ambo quirúrgico, gorro, botas y/o cofia y barbijo', FA, 'vestimenta', 1, {'vest': 1}, 'vestir', 'La barrera quirúrgica se completa antes de lavarse: ambo con la chaqueta por dentro del pantalón (para que no roce el lavabo ni la mesa), gorro que cubre todo el cabello, barbijo ajustado sobre nariz y boca y botas o cofia.',
  [['ambo'], ['gorro'], ['barbijo'], ['cofia'], ['botas'], ['me visto']], 'Me visto con ambo quirúrgico (chaqueta por dentro del pantalón), gorro que cubre todo el cabello, botas y barbijo ajustado.'),
 (2, 'Se quita los accesorios de las manos (anillos, pulseras, reloj)', FA, 'accesorios', 1, {'acc': 1}, 'accesorios', 'Bajo los anillos, pulseras y relojes se acumulan microorganismos y el lavado no los alcanza: se retiran por completo antes de empezar.',
  [['anillos'], ['pulsera'], ['reloj'], ['accesorios'], ['joyas'], ['me quito los']], 'Me quito los accesorios de las manos: anillos, pulseras y reloj.'),
 (3, 'Abre la canilla de agua corriente', FA, 'canilla', 0, {'canilla': 1}, 'canilla', 'Se regula el chorro a una temperatura templada y flujo moderado: la presión excesiva salpica el ambo y la humedad transporta gérmenes hacia la vestimenta.',
  [['abro la canilla'], ['abro el grifo'], ['abro el agua'], ['abro la llave']], 'Abro la canilla de agua corriente.'),
 (4, 'Moja las manos con agua corriente', FB, 'manos', 0, {'mojar': 1}, 'mojar', 'Se mojan manos y antebrazos con las manos más altas que los codos, para que el agua escurra hacia el codo.',
  [['mojo las manos'], ['humedezco las manos'], ['mojo'], ['mojar las manos']], 'Mojo las manos con agua corriente.'),
 (5, 'Aplica jabón líquido con dosificador y lo aplica sobre la esponja del cepillo', FB, 'jabon', 0, {'jabon': 1}, 'jabon', 'Se usa jabón antiséptico líquido (clorhexidina o povidona yodada) de un dosificador accionado sin las manos y se carga la esponja del cepillo estéril. Con clorhexidina el lavado dura 3 a 5 minutos; con povidona yodada, 5 a 10.',
  [['jabon'], ['dosificador'], ['esponja del cepillo'], ['jabon liquido']], 'Aplico jabón antiséptico líquido con el dosificador (accionado con el codo) y lo coloco sobre la esponja del cepillo.'),
 (6, 'Si fuera necesario, quita los detritus de debajo de las uñas', FB, 'unas', 0, {'unas': 1}, 'unas', 'Con el limpiauñas estéril, bajo el chorro de agua, se retiran los detritus subungueales (reservorio de gérmenes); en seco se dispersarían.',
  [['detritus'], ['debajo de las unas'], ['limpiaunas'], ['quito la suciedad de las unas']], 'Si fuera necesario, quito los detritus de debajo de las uñas con el limpiauñas.'),
 (7, 'Lava palmas, dorso de las manos y dedos, y cepilla las uñas', FB, 'manos', 1, {'lav1': 1}, 'cepillar', 'Se cepillan sistemáticamente palmas, dorsos, cada dedo con sus cuatro caras, espacios interdigitales y uñas.',
  [['palmas'], ['dorso de las manos'], ['cepillo las unas'], ['cepillo los dedos'], ['lavo las manos']], 'Lavo palmas, dorso de las manos y dedos, y cepillo las uñas.'),
 (8, 'Lava los antebrazos en forma circular, de distal a proximal, hasta 2,5 cm por encima del codo (primer tiempo), evitando volver a las áreas ya lavadas', FB, 'antebrazos', 1, {'antebr': 1}, 'antebrazos', 'El primer tiempo (el más largo, cerca de la mitad del tiempo total) llega hasta 2,5 a 5 cm por encima del codo. El lavado siempre va de la zona más limpia (manos) a la menos limpia (codo); nunca se vuelve sobre un área ya lavada.',
  [['antebrazos'], ['forma circular'], ['distal a proximal'], ['hasta el codo']], 'Lavo los antebrazos en forma circular, de distal a proximal, hasta 2,5 cm por encima del codo, sin volver a las áreas ya lavadas.'),
 (9, 'Se enjuaga con abundante agua desde la porción distal hasta la proximal', FC, 'manos', 1, {'enj1': 1}, 'enjuagar', 'Se enjuaga en un solo sentido, de las puntas de los dedos hacia el codo, sin movimientos de vaivén bajo el agua, para arrastrar el jabón y los gérmenes lejos de las manos.',
  [['enjuag'], ['abundante agua'], ['arrastro el jabon']], 'Me enjuago con abundante agua desde la porción distal hasta la proximal.'),
 (10, 'Repite el procedimiento llegando hasta 3 cm por debajo del codo, enjuaga (segundo lavado)', FB, 'antebrazos', 0, {'lav2': 1}, 'cepillar', 'Segundo tiempo (cerca de un tercio del tiempo total): manos, muñecas y antebrazo hasta 3 cm por debajo del codo, con enjuague unidireccional.',
  [['segundo lavado'], ['por debajo del codo'], ['repito el procedimiento hasta 3 cm por debajo']], 'Repito el procedimiento llegando hasta 3 cm por debajo del codo y enjuago: segundo lavado.'),
 (11, 'Repite el procedimiento llegando hasta 3 cm por encima de la muñeca, enjuaga (tercer lavado)', FB, 'manos', 0, {'lav3': 1}, 'cepillar', 'Tercer tiempo (el más corto): se concentra en manos y muñecas (hasta 3 cm por encima), la zona de mayor contacto con el campo, con enjuague final.',
  [['tercer lavado'], ['por encima de la muneca'], ['3 cm por encima de la muneca']], 'Repito el procedimiento llegando hasta 3 cm por encima de la muñeca y enjuago: tercer lavado.'),
 (12, 'Mantiene las manos en alto, por encima del codo y fuera del ambo quirúrgico', FC, 'manos', 1, {'alto': 1}, 'manos_alto', 'Con los brazos flexionados, las manos más altas que los codos y alejadas del cuerpo (entre la cintura y los hombros) el agua escurre hacia el codo y las manos quedan lo más limpias posible.',
  [['manos en alto'], ['en alto'], ['fuera del ambo'], ['por encima de los codos']], 'Mantengo las manos en alto, por encima de los codos y fuera del ambo quirúrgico.'),
 (13, 'Cierra la canilla con el codo cuando es manual', FC, 'canilla', 0, {'cierra': 1}, 'codo', 'Si la canilla es de palanca se cierra empujando con el codo; si es de pedal o de sensor se retira el pie o la mano del campo del sensor. Nunca se toca con las manos lavadas.',
  [['cierro la canilla'], ['cierro el agua'], ['con el codo'], ['cierro el grifo']], 'Cierro la canilla con el codo.'),
 (14, 'Se seca perfectamente con compresas estériles', FC, 'compresas', 1, {'seca': 1}, 'secar', 'Se seca una mano con un extremo de la compresa estéril, de los dedos hacia el codo y en una sola dirección; la otra con el extremo opuesto, seco. Nunca se vuelve atrás ni se usa la misma cara húmeda en las dos manos.',
  [['compresas esteriles'], ['me seco'], ['secar'], ['seco las manos'], ['seco los brazos']], 'Me seco perfectamente con compresas estériles, mano por mano, de los dedos hacia el codo y sin volver atrás.'),
 (15, 'Se coloca los guantes estériles solo o con ayuda de la instrumentadora', FD, 'guantes', 0, {'gsolo': 1}, 'guantes', 'El enguantado puede hacerlo el propio cirujano o la instrumentadora; en este práctico se evalúa la técnica abierta autónoma (la cerrada se usa cuando el cirujano ya viste la bata estéril y las manos quedan dentro de los puños).',
  [['instrumentadora'], ['solo o con'], ['me coloco los guantes esteriles solo']], 'Me coloco los guantes estériles solo o con la ayuda de la instrumentadora.'),
 (16, 'Coloca los guantes estériles en el campo, sobre la mesa', FD, 'guantes', 0, {'paq': 1}, 'paquete', 'El paquete de guantes se apoya sobre el campo estéril de la mesa, nunca sobre una superficie sin cubrir.',
  [['sobre la mesa'], ['sobre el campo'], ['paquete de guantes'], ['en el campo']], 'Coloco los guantes estériles en el campo, sobre la mesa.'),
 (17, 'Abre el envoltorio', FD, 'guantes', 0, {'abre': 1}, 'abrir', 'Se abre el envoltorio despegando las solapas hacia afuera, sin tocar su interior.',
  [['abro el envoltorio'], ['abro el paquete'], ['envoltorio']], 'Abro el envoltorio.'),
 (18, 'Toma el envoltorio por las puntas para poder abrirlo', FD, 'guantes', 0, {'puntas': 1}, 'abrir', 'Sólo se tocan las puntas externas del envoltorio: el interior es estéril.',
  [['por las puntas'], ['las puntas'], ['de las puntas']], 'Tomo el envoltorio por las puntas para poder abrirlo.'),
 (19, 'Toma un guante por la zona más próxima (doblada) e introduce la mano, sin terminar de estirarlo', FD, 'guantes', 1, {'g1': 1}, 'guante1', 'El primer guante se toma por la cara interna del doblez (la única zona que se puede tocar con la mano sin guante) y se calza sin desplegar el puño ni ajustar los dedos. Regla piel con piel.',
  [['zona doblada'], ['introduzco la mano'], ['un guante por'], ['sin terminar de estirar'], ['zona mas proxima']], 'Tomo un guante por la zona más próxima (doblada), introduzco la mano y coloco el guante sin terminar de estirarlo.'),
 (20, 'Introduce los dedos en el segundo guante, sin contaminar el guante colocado', FD, 'guantes', 1, {'g2a': 1}, 'guante2', 'Regla goma con goma: la mano ya enguantada desliza de 2 a 4 dedos por debajo del doblez externo del segundo guante y se introduce la otra mano sin tocar la piel ni el ambo.',
  [['introduzco los dedos'], ['sin contaminar'], ['dedos en el segundo']], 'Con la mano ya enguantada deslizo los dedos por debajo del doblez del segundo guante e introduzco la otra mano, sin contaminar el guante colocado.'),
 (21, 'Coloca el segundo guante estirándolo por completo', FD, 'guantes', 0, {'est2': 1}, 'estirar', 'El segundo guante se estira por completo, cubriendo el puño del ambo.',
  [['segundo guante', 'estir'], ['estirandolo por completo'], ['estiro el segundo']], 'Coloco el segundo guante estirándolo por completo.'),
 (22, 'Estira por completo el primer guante, por el doblez', FD, 'guantes', 0, {'est1': 1}, 'estirar', 'Con ambas manos enguantadas se estira el primer guante tomándolo por el doblez; recién entonces se acomodan los dedos de los dos guantes y se verifica que no haya perforaciones.',
  [['primer guante', 'doblez'], ['por el doblez'], ['doblez']], 'Estiro por completo el primer guante, por el doblez.'),
]
pasos = [dict(n=n, texto=tx, fase=fa, target=tg, critico=bool(cr), explica=ex, estado=es, claves=cl, frase=fr, fx=fx) for n, tx, fa, tg, cr, es, fx, ex, cl, fr in P]

def caso(i, nombre, sexo, edad, motivo, indic, ant, alergia, extra, h_acc, h_agua, h_seca, h_g):
    return dict(id=i, nombre=nombre, sexo=sexo, edad=edad, motivo=motivo, indicacion=indic, antecedentes=ant, alergia=alergia, extra=extra, h_acc=h_acc, h_agua=h_agua, h_seca=h_seca, h_g=h_g)
casos = [
 caso('c1', 'Martín G.', 'M', 54, 'Colecistectomía laparoscópica programada.', 'Lavado de manos quirúrgico y colocación de guantes estériles antes de la cirugía.', 'Litiasis vesicular sintomática. Sin alergias conocidas.', None, ['Cirugía programada'],
      'Al empezar tenés puesto un reloj, un anillo y una pulsera: hay que retirarlos antes de abrir la canilla.', 'La canilla es manual, de palanca: se cierra con el codo (o se retira el pie o la mano del sensor).', 'La instrumentadora te alcanza compresas estériles dobladas.', 'El paquete de guantes estériles talla 7,5 está sobre la mesa.'),
 caso('c2', 'Ana P.', 'F', 41, 'Hernioplastia umbilical programada. Alergia al látex.', 'Lavado quirúrgico y enguantado con guantes sin látex.', 'Hernia umbilical. Alergia al látex (urticaria por contacto).', 'latex', ['Alergia al látex', 'Cirugía programada'],
      'Retirás el reloj y los anillos antes de lavarte.', 'La canilla es manual, de palanca.', 'Compresas estériles de un solo uso.', 'Por la alergia al látex de la paciente, el paquete que corresponde es el de guantes estériles sin látex.'),
 caso('c3', 'Rubén L.', 'M', 67, 'Apendicectomía de urgencia.', 'Lavado quirúrgico completo aun en la urgencia.', 'Apendicitis aguda. Sin alergias conocidas.', None, ['Urgencia'],
      'Venís directo de la guardia: te quedan el reloj y una pulsera de la guardia.', 'La canilla es de pedal: no se toca con las manos.', 'Compresas estériles de la caja del quirófano.', 'Guantes estériles talla 7,5 en el campo.'),
]
N = lambda v: ('d' + str(v))
dists = [
 dd('d1', 'Reemplaza el lavado quirúrgico por alcohol en gel', 1, 'Es criterio de desaprobación: el lavado quirúrgico de esta lista exige jabón antiséptico, cepillado y enjuague; el gel no lo reemplaza.', 'manos', [['alcohol en gel'], ['con gel'], ['solo alcohol'], ['friccion con alcohol']]),
 dd('d2', 'Deja las manos por debajo de los codos después del lavado o se las seca con el ambo', 1, 'Es criterio de desaprobación: las manos bajas dejan escurrir agua contaminada desde el codo y el ambo no es estéril.', 'manos', [['manos abajo'], ['manos por debajo del codo'], ['me seco en el ambo'], ['me seco con el ambo'], ['bajo las manos']]),
 dd('d3', 'Cierra la canilla con la mano', 1, 'Es criterio de desaprobación: tocar la canilla con la mano lavada la contamina; se cierra con el codo.', 'canilla', [['cierro la canilla con la mano'], ['cierro con la mano'], ['con la mano la canilla']]),
 dd('d4', 'Se seca con una toalla común o de tela no estéril', 1, 'Es criterio de desaprobación: sólo se secan con compresas estériles.', 'compresas', [['toalla comun'], ['toalla de tela'], ['con una toalla'], ['papel comun']]),
 dd('d5', 'Se toca el exterior del guante con la mano sin guante', 1, 'Es criterio de desaprobación: contamina el guante; la mano sin guante sólo toca la cara interna del doblez.', 'guantes', [['toco el exterior'], ['por fuera con la mano desnuda'], ['con la mano sin guante el exterior'], ['toco el guante por fuera']]),
 dd('d6', 'Se lava durante menos de 3 minutos', 1, 'Es criterio de desaprobación: la duración total del lavado quirúrgico debe ser de 3 a 5 minutos.', 'manos', [['un minuto'], ['dos minutos'], ['30 segundos'], ['menos de 3 minutos'], ['rapido el lavado']]),
 dd('d7', 'Conserva anillos, pulseras o reloj durante el lavado', 1, 'Es criterio de desaprobación: bajo las joyas se acumulan gérmenes y el lavado no las alcanza.', 'accesorios', [['con el reloj puesto'], ['con el anillo'], ['sin sacarme el reloj'], ['no me saco los anillos'], ['conservo los anillos']]),
 dd('d8', 'Vuelve a lavar áreas ya lavadas o sube y baja el cepillo por el antebrazo', 0, 'El lavado va siempre de distal a proximal sin volver sobre zonas ya lavadas.', 'antebrazos', [['de proximal a distal'], ['desde el codo hacia la mano'], ['vuelvo a lavar'], ['subo y bajo']]),
 dd('d9', 'Apoya los guantes estériles en una superficie no estéril', 1, 'Es criterio de desaprobación: el paquete va sobre el campo estéril de la mesa.', 'guantes', [['sobre la camilla'], ['sobre una superficie comun'], ['sobre la mesa sin campo'], ['en el lavabo'], ['sobre el carro sin campo']]),
 dd('d10', 'Se toca la cara, el ambo o un objeto no estéril con las manos lavadas', 1, 'Es criterio de desaprobación: cualquier contacto con un objeto no estéril obliga a repetir el lavado.', 'manos', [['me toco la cara'], ['toco el ambo'], ['me rasco'], ['toco el barbijo'], ['toco la canilla']]),
 dd('d11', 'Usa guantes con látex en un paciente alérgico al látex', 1, 'Es criterio de desaprobación: el látex puede provocar una reacción alérgica grave; se usan guantes sin látex.', 'guantes', [['guantes de latex'], ['con latex'], ['guantes comunes de latex']], solo_si='alergia'),
 dd('d12', 'Acomoda los dedos del primer guante antes de haberse colocado el segundo', 0, 'Los dedos se ajustan sólo cuando ambas manos ya tienen puesto el guante estéril; antes obliga a tocar el exterior con la mano desnuda.', 'guantes', [['acomodo los dedos del primer'], ['ajusto los dedos del primer'], ['acomodo los dedos antes'], ['ajusto los dedos antes']]),
 dd('d13', 'Se enjuaga del codo hacia la mano o con movimiento de vaivén bajo el agua', 1, 'Es criterio de desaprobación: el agua arrastra los gérmenes del codo hacia las manos; se enjuaga en un solo sentido, de los dedos al codo.', 'manos', [['enjuago de codo'], ['enjuague de codo'], ['vaiven'], ['meto el codo primero'], ['el agua corra del codo']]),
 dd('d14', 'Seca ambas manos con la misma cara húmeda de la compresa o frota de codo a mano', 1, 'Es criterio de desaprobación: el secado va de los dedos al codo y cada mano usa un extremo seco de la compresa.', 'compresas', [['misma cara de la compresa'], ['misma compresa humeda'], ['seco de codo a mano'], ['la misma cara humeda']]),
]
EL = {'vestimenta': ('Vestimenta quirúrgica', 'Ambo, gorro, barbijo y botas o cofia.'), 'accesorios': ('Accesorios', 'Anillos, pulseras y reloj se retiran antes de lavarse.'), 'canilla': ('Canilla', 'Agua corriente; se cierra con el codo si es manual.'),
      'manos': ('Manos', 'Palmas, dorso, dedos y uñas.'), 'jabon': ('Jabón antiséptico', 'Dosificador, sin tocar el pico.'), 'unas': ('Uñas', 'Se limpian los detritus y se cepillan.'), 'antebrazos': ('Antebrazos', 'Lavado circular de distal a proximal.'),
      'compresas': ('Compresas estériles', 'Secado de dedos a codo en una sola dirección.'), 'guantes': ('Guantes estériles', 'Se toman por el doblez y se estiran por completo.')}
QS = [
 ('¿Cuánto debe durar en total el lavado de manos quirúrgico?', ['De 3 a 5 minutos', '30 segundos', '1 minuto', 'Más de 15 minutos'], 0, 'La duración total del lavado quirúrgico debe ser de 3 a 5 minutos.'),
 ('¿En qué dirección se lavan los antebrazos?', ['De distal a proximal, sin volver a las áreas ya lavadas', 'De proximal a distal', 'De un lado a otro, indistintamente', 'Sólo las manos'], 0, 'Siempre de la zona más limpia (manos) a la menos limpia (codo).'),
 ('Terminado el lavado, ¿cómo se mantienen las manos?', ['En alto, por encima del codo y fuera del ambo', 'Hacia abajo, para que escurra el agua', 'Apoyadas en el ambo', 'Sobre la camilla'], 0, 'Con las manos en alto el agua escurre hacia el codo y no contamina las manos.'),
 ('¿Con qué se cierra una canilla manual?', ['Con el codo', 'Con la mano mojada', 'Con una compresa estéril usada', 'No se cierra'], 0, 'Tocarla con la mano la contamina.'),
 ('¿Con qué se secan las manos y los antebrazos?', ['Con compresas estériles', 'Con una toalla de tela común', 'Con el ambo', 'Se dejan secar al aire sin tocar nada y se enguantan mojadas'], 0, 'Sólo material estéril toca las manos lavadas.'),
 ('¿Qué accesorios se retiran antes del lavado?', ['Anillos, pulseras y reloj', 'Sólo el reloj', 'Ninguno', 'Sólo el gorro'], 0, 'Todos los accesorios de las manos y las muñecas.'),
 ('¿Por dónde se toma el primer guante estéril?', ['Por la zona doblada, que es la cara interna', 'Por los dedos', 'Por la palma exterior', 'Indistintamente'], 0, 'La mano sin guante sólo toca la cara interna del doblez.'),
 ('¿Cómo se coloca el segundo guante?', ['Con los dedos de la mano enguantada, sin contaminar el guante colocado', 'Con la mano desnuda, por el exterior', 'Con la ayuda del barbijo', 'Apoyándolo en el ambo'], 0, 'La mano enguantada sólo toca el exterior estéril del segundo guante.'),
 ('¿Cuántos lavados se realizan?', ['Tres, cada uno llegando a una zona más corta', 'Uno solo', 'Cinco', 'Ninguno si se usa gel'], 0, 'Primero hasta 2,5 cm (a 5 cm) por encima del codo, luego hasta 3 cm por debajo del codo y por último hasta 3 cm por encima de la muñeca.'),
 ('Si el paciente es alérgico al látex, ¿qué guantes se usan?', ['Guantes estériles sin látex', 'Guantes de látex de todos modos', 'Guantes de examen no estériles', 'Ninguno'], 0, 'El látex puede provocar una reacción alérgica grave.'),
 ('¿Cuánto dura el lavado quirúrgico con clorhexidina y con povidona yodada?', ['Clorhexidina 3 a 5 minutos; povidona 5 a 10 minutos', 'Ambas 30 segundos', 'Clorhexidina 10 minutos; povidona 1 minuto', 'Ambas 15 minutos'], 0, 'La clorhexidina tiene mayor efecto residual y menor tiempo de lavado.'),
 ('¿Cuándo se acomodan los dedos de los guantes?', ['Cuando ambas manos ya están enguantadas', 'Apenas se coloca el primer guante', 'Nunca', 'Con la mano desnuda antes del segundo guante'], 0, 'Ajustar el primer guante antes de colocar el segundo obliga a tocar su exterior con la mano desnuda.'),
]
fund = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in QS]
mach = {'perlas': [
 {'t': 'Antes del lavado', 'x': 'Ambo, gorro, barbijo y botas o cofia. Sacate anillos, pulseras y reloj. Abrí la canilla.'},
 {'t': 'Lavado (3 a 5 minutos)', 'x': 'Mojá con las manos altas, jabón antiséptico, cepillá uñas, palmas, dorsos y dedos. Antebrazos en círculos, de distal a proximal, hasta 2,5 cm por encima del codo, sin volver atrás. Enjuagá de la mano al codo.'},
 {'t': 'Segundo y tercer lavado', 'x': 'Segundo: hasta 3 cm por debajo del codo. Tercero: hasta 3 cm por encima de la muñeca. Enjuagá cada vez.'},
 {'t': 'Secado', 'x': 'Manos en alto, fuera del ambo. Cerrá la canilla con el codo y secate con compresas estériles, de los dedos al codo.'},
 {'t': 'Guantes', 'x': 'Paquete sobre el campo, abrilo por las puntas. Primer guante por la zona doblada sin terminar de estirar; segundo con los dedos enguantados sin contaminar; estirá ambos por completo.'}],
 'por_paso': {'8': 'Distal a proximal, sin volver atrás.', '12': 'Manos en alto, fuera del ambo.', '14': 'Compresas estériles.', '19': 'Primer guante por la zona doblada.'}}
CRIT = dict(criterios_texto='La lista de cotejo no define criterios de desaprobación automática; el simulador califica la barrera quirúrgica, el cepillado y el lavado de distal a proximal, el secado estéril con las manos en alto y la técnica de enguantado sin contaminar (propuesto, a validar).',
  criterios=[dict(ico='🥼', titulo='Barrera quirúrgica y accesorios', pasos=[1, 2]), dict(ico='🧼', titulo='Cepillado y lavado de distal a proximal', pasos=[7, 8, 9]), dict(ico='🙌', titulo='Manos en alto y secado estéril', pasos=[12, 14]), dict(ico='🧤', titulo='Enguantado sin contaminar', pasos=[19, 20])],
  final_criticos='la barrera quirúrgica, el lavado de distal a proximal, el secado estéril con las manos en alto y la técnica de enguantado')
ALG = dict(titulo='Lavado quirúrgico: secuencia', boton_titulo='Ver la secuencia del lavado', boton_sub='Tres lavados y enguantado', aviso='la secuencia del lavado', flecha='▼ Lavado', flecha_final='▼ Enguantado', pie='La duración total del lavado debe ser de 3 a 5 minutos.',
 comun=[dict(t='Preparación', x='Ambo, gorro, barbijo, botas; sin accesorios.', flag='vest'), dict(t='Agua y jabón', x='Canilla abierta, jabón antiséptico en el cepillo.', flag='jabon')],
 columnas=[dict(titulo='Primer lavado', cls='nd', nodos=[dict(t='Manos y uñas', x='Palmas, dorso, dedos y uñas.', flag='lav1'), dict(t='Antebrazos', x='De distal a proximal hasta 2,5 cm sobre el codo.', flag='antebr'), dict(t='Enjuague', x='De la mano al codo.', flag='enj1')]),
  dict(titulo='Segundo y tercer lavado', cls='nd', nodos=[dict(t='Segundo', x='Hasta 3 cm por debajo del codo.', flag='lav2'), dict(t='Tercero', x='Hasta 3 cm por encima de la muñeca.', flag='lav3')])],
 final=[dict(t='Secado', x='Manos en alto, canilla con el codo, compresas estériles.', flag='seca'), dict(t='Guantes', x='Por el doblez, sin contaminar; estirar ambos.', flag='g1')])
EX = dict(id='lav', area='cir', titulo='Lavado de manos quirúrgico y colocación de guantes', icono='🧼',
 resumen='Lavado de manos quirúrgico en tres tiempos (3 a 5 minutos), secado estéril con las manos en alto y colocación de guantes estériles sin contaminar, con casos de cirugía programada, alergia al látex y urgencia.',
 umbral=60, fuente='Lista de cotejo: Lavado de manos quirúrgico y colocación de guantes (UP 1, 22 ítems)', elementos={k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasos if p['target'] == k]) for k, v in EL.items()},
 distractores=dists, casos=casos, fundamentos=fund, voz=True, algoritmo=ALG,
 hallazgo_pasos={'2': 'h_acc', '3': 'h_agua', '14': 'h_seca', '16': 'h_g'}, hallazgo_rotulos={'2': '👁️ Observás:', '3': '👁️ Observás:', '14': '👁️ Observás:', '16': '👁️ Observás:'}, hallazgo_voz={},
 machete=mach, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/cir/lav_modelo.json', peso_modelo='1 MB', instrumental='data/acreditaciones/cir/instrumental_lav.json', mesa_pasos=[], pasos=pasos)
EX.update(CRIT); W(OUT + 'lav.json', EX)
def it(id, grupo, nombre, detalle, correcto, critico, desc, ficha, **kw):
    o = dict(id=id, grupo=grupo, nombre=nombre, detalle=detalle, img=f'assets/instrumental/{id}.svg', correcto=correcto, critico=critico, descripcion=desc, ficha=ficha); o.update(kw); return o
items = [
 it('ambo_q', 'vest', 'Ambo quirúrgico', 'Limpio, de uso exclusivo', True, True, 'Pantalón y chaqueta de uso exclusivo del área quirúrgica.', [['Uso', 'Barrera']], falta='Falta el ambo quirúrgico.'),
 it('gorro_q', 'vest', 'Gorro quirúrgico', 'Cubre todo el cabello', True, True, 'Evita la caída de cabello y partículas al campo.', [['Uso', 'Barrera']], falta='Falta el gorro quirúrgico.'),
 it('barbijo_q', 'vest', 'Barbijo quirúrgico', 'Cubre nariz y boca', True, True, 'Barrera para las gotitas de la vía aérea.', [['Uso', 'Barrera']], falta='Falta el barbijo.'),
 it('botas_q', 'vest', 'Botas o cofia para el calzado', 'Descartables', True, False, 'Cubren el calzado al ingresar al área quirúrgica.', [['Uso', 'Barrera']], opcional=True),
 it('jabon_antiseptico', 'lavado', 'Jabón antiséptico con dosificador', 'Clorhexidina o povidona yodada', True, True, 'Jabón líquido antiséptico de un dosificador, sin tocar el pico con las manos.', [['Uso', 'Lavado']], falta='Falta el jabón antiséptico con dosificador.'),
 it('cepillo_q', 'lavado', 'Cepillo estéril con esponja', 'Descartable', True, True, 'Para cepillar uñas y dedos y fregar con la esponja.', [['Uso', 'Cepillado']], falta='Falta el cepillo estéril con esponja.'),
 it('limpiaunas', 'lavado', 'Limpiauñas estéril', 'Palillo', True, False, 'Para quitar los detritus subungueales.', [['Uso', 'Uñas']], opcional=True),
 it('compresas_e', 'lavado', 'Compresas estériles', 'Para secar', True, True, 'Compresas estériles de un solo uso para el secado.', [['Uso', 'Secado']], falta='Faltan las compresas estériles para secar.'),
 it('guantes_e', 'guantes', 'Guantes estériles (con látex)', 'Talla 7,5', True, True, 'Guantes quirúrgicos estériles en paquete.', [['Material', 'Látex'], ['Estéril', 'Sí']], latex=True, falta='Faltan los guantes estériles.'),
 it('guantes_sin_latex', 'guantes', 'Guantes estériles sin látex', 'Talla 7,5', True, True, 'Para el paciente alérgico al látex.', [['Material', 'Sin látex']], solo_alergia='latex', falta='Faltan los guantes estériles sin látex que exige la alergia.'),
 it('alcohol_gel', 'otros', 'Alcohol en gel', 'Higiene de manos', False, False, 'Higiene de manos de rutina.', [['Uso', 'Higiene']], feedback='El alcohol en gel no reemplaza el lavado quirúrgico con jabón antiséptico y cepillado.'),
 it('jabon_barra', 'otros', 'Jabón común en barra', 'No antiséptico', False, False, 'Jabón doméstico.', [['Uso', 'Doméstico']], feedback='Se usa jabón antiséptico líquido con dosificador; la barra se contamina.'),
 it('toalla_tela', 'otros', 'Toalla de tela común', 'No estéril', False, False, 'Toalla de uso general.', [['Estéril', 'No']], feedback='Las manos lavadas sólo se secan con compresas estériles.'),
 it('estropajo', 'otros', 'Estropajo abrasivo', 'Esponja áspera', False, False, 'Esponja de cocina.', [['Uso', 'Limpieza']], feedback='El estropajo lesiona la piel; se usa un cepillo estéril con esponja.'),
 it('reloj_anillos', 'otros', 'Reloj, anillos y pulsera', 'Accesorios', False, False, 'Accesorios de las manos.', [['Uso', 'Personal']], feedback='Los accesorios se retiran antes de lavarse; no forman parte de la mesa.'),
 it('guantes_nitrilo', 'otros', 'Guantes de examen no estériles', 'Caja', False, False, 'Para el examen físico.', [['Estéril', 'No']], feedback='Los guantes de examen no son estériles: no sirven para la cirugía.'),
]
INS = dict(id='lav', titulo='Antequirófano · Lavado quirúrgico', consigna='Preparás el antequirófano para el lavado quirúrgico y el enguantado: vestimenta, jabón antiséptico, cepillo, compresas y guantes estériles. Pasá el cursor (o tocá) cada insumo para inspeccionarlo; arrastralo a la bandeja o hacé clic para agregarlo.',
 caso_sub='lavado quirúrgico', indicacion_def='Lavado quirúrgico y guantes estériles.', mision=['qué barrera y qué insumos estériles hacen falta;', 'qué elementos no corresponden a un lavado quirúrgico.'], demo_caso='Primero se lee el caso: una alergia al látex cambia los guantes que corresponden.',
 grupos=[dict(id='vest', titulo='Vestimenta'), dict(id='lavado', titulo='Lavado y secado'), dict(id='guantes', titulo='Guantes estériles'), dict(id='otros', titulo='Otros insumos')], items=items, bandeja_img='assets/instrumental/bandeja.svg')
W(OUT + 'instrumental_lav.json', INS)
M = J('data/acreditaciones/siam/sv_modelo.json')
VAR = dict(origen=[0, 24, 0], corte_x=0.0, rotacion=[0, 0, 0], piezas=[], procedurales={}, pines={}, camara=dict(lat=[66, 34, 18], fro=[0, 34, 70], sup=[0.01, 96, 12], objetivo=[0, 24, 2], ini=[24, 40, 56]), etiquetas={})
G = dict(M['general']); G['camara'] = dict(M['general']['camara'], foco=34, min=14, max=110); G['vistas'] = dict(lat='Lateral', fro='Frontal', sup='Superior')
IM = dict(general=G, overlay_html='', tarjetas=dict(mesa=dict(titulo='🧰 Antequirófano', id='mesa', items=[['vestimenta', '🥼', 'Vestimenta', 'quirúrgica'], ['accesorios', '💍', 'Accesorios', ''], ['jabon', '🧴', 'Jabón', 'antiséptico'], ['compresas', '🧻', 'Compresas', 'estériles'], ['guantes', '🧤', 'Guantes', 'estériles']]), entorno=dict(titulo='🚿 Lavabo', items=[['canilla', '🚰', 'Canilla', ''], ['manos', '🖐️', 'Manos', ''], ['unas', '💅', 'Uñas', ''], ['antebrazos', '💪', 'Antebrazos', '']])),
  chips=[['canilla', 'Agua'], ['jabon', 'Jabón'], ['lav1', '1.er lavado'], ['lav2', '2.º lavado'], ['lav3', '3.er lavado'], ['alto', 'Manos en alto'], ['seca', 'Secado'], ['g1', 'Guantes']],
  usables=['vestimenta', 'accesorios', 'canilla', 'manos', 'jabon', 'unas', 'antebrazos', 'compresas', 'guantes'], pines=[],
  instrumentos=[dict(id='lav', tipo='lavado', clases=dict(vest='s-vest', acc='s-acc', canilla='s-canilla', mojar='s-mojar', jabon='s-jabon', unas='s-unas', lav1='s-lav1', antebr='s-antebr', enj1='s-enj1', lav2='s-lav2', lav3='s-lav3', alto='s-alto', cierra='s-cierra', seca='s-seca', gsolo='s-gsolo', paq='s-paq', abre='s-abre', puntas='s-puntas', g1='s-g1', g2a='s-g2a', est1='s-est1', est2='s-est2'))], M=VAR, F=VAR)
W(OUT + 'lav_modelo.json', IM)
IDX = dict(area='cir', nombre='Cirugía · Introducción a las especialidades clínico-quirúrgicas', acreditaciones=[
 dict(id='lav', titulo='Lavado de manos quirúrgico y guantes', icono='🧼', pasos=22, estado='activo'),
 dict(id='parac', titulo='Paracentesis (diagnóstica y evacuadora)', icono='💉', pasos=50, estado='proximamente'),
 dict(id='ost', titulo='Cuidado de ostomías', icono='🩹', pasos=11, estado='proximamente'),
 dict(id='vaer', titulo='Taller de vía aérea', icono='🫁', pasos=13, estado='proximamente'),
 dict(id='eco', titulo='Lectura de ecografía de abdomen', icono='🔊', pasos=11, estado='proximamente'),
 dict(id='rxab', titulo='Lectura de Rx de abdomen', icono='🩻', pasos=16, estado='proximamente'),
 dict(id='mano', titulo='Lectura de manometría', icono='📈', pasos=10, estado='proximamente')])
W(OUT + 'index.json', IDX)
print('ok lav', len(pasos), len(casos), len(dists), len(items))
