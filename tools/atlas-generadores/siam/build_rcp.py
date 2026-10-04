import json, os
os.chdir('C:/Users/Augusto/Desktop/Programacion/campus-nika/campus-nika')
OUT = 'data/acreditaciones/siam/'
J = lambda p: json.load(open(p, encoding='utf8'))
W = lambda p, d: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)

# =====================================================================  PASOS
# (n, texto cátedra, fase, target, critico, estado, fx, explica, claves, frase, extras)
P = [
 (1, 'Saluda y se presenta', 'Evaluación inicial', 'equipo', 0, {}, 'hablar',
  'Al entrar a la sala de reanimación el líder se presenta al equipo con nombre y rol: en una emergencia la comunicación clara evita errores.',
  [['saludo'], ['me presento'], ['buen dia'], ['buenas tardes']], 'Buenas tardes, soy el doctor a cargo, me presento con nombre y apellido.', {}),
 (2, 'Indaga acerca de la situación que determinó su llamado', 'Evaluación inicial', 'equipo', 0, {'situ': 1}, 'hablar',
  'Se pregunta qué pasó, hace cuánto, si fue presenciado, antecedentes y medicación: orienta la causa del paro y las causas reversibles (5H y 5T).',
  [['indago'], ['pregunto', 'situacion'], ['que paso'], ['situacion', 'llamado'], ['pregunto', 'paso'], ['motivo', 'llamado']], 'Indago qué pasó: pregunto por la situación que motivó el llamado, los antecedentes y el tiempo de evolución.', {}),
 (3, 'Se coloca guantes con técnica clínica', 'Evaluación inicial', 'guantes', 1, {'guantes': 1}, 'guante',
  'Precaución estándar frente a sangre y fluidos: se coloca guantes antes de tocar al paciente. Omitirlo es criterio de desaprobación.',
  [['me coloco', 'guantes'], ['me pongo', 'guantes'], ['coloco', 'guantes'], ['pongo', 'guantes']], 'Me coloco los guantes con técnica clínica.', {}),
 (4, 'Observa el monitor multiparamétrico y determina el ritmo cardiaco', 'Evaluación inicial', 'monitor', 1, {'ritmo': 1}, 'monitor_ver',
  'Lo primero es leer el ritmo en el monitor: define el algoritmo. Fibrilación ventricular y taquicardia ventricular sin pulso son ritmos desfibrilables (se descarga); asistolia y actividad eléctrica sin pulso (AESP) no lo son (se da adrenalina y se buscan causas reversibles). Interpretar mal el ritmo es criterio de desaprobación.',
  [['ritmo'], ['monitor'], ['fibrilacion ventricular'], ['asistolia'], ['linea plana'], ['actividad electrica sin pulso'], ['aesp'], ['taquicardia ventricular'], ['tvsp'], ['desfibrilable'], ['nodesfib'], ['fv']], 'Observo el monitor multiparamétrico y determino el ritmo cardíaco.', {}),
 (5, 'Solicita colaboración del equipo de trabajo (determinando capacidad máxima permitida de personas en el shock room) y delega funciones', 'Organización del equipo', 'equipo', 0, {'equipo': 1}, 'equipo',
  'El líder pide ayuda, respeta la cantidad máxima de personas permitida en el shock room y delega roles claros: compresiones, vía aérea, vía venosa y medicación, desfibrilador y registro.',
  [['solicito colaboracion'], ['pido ayuda'], ['delego'], ['capacidad maxima'], ['equipo de trabajo'], ['solicito', 'equipo']], 'Solicito la colaboración del equipo, determino la capacidad máxima de personas en el shock room y delego funciones.', {}),
 (6, 'Da indicaciones generales al personal de enfermería según corresponda: Colocación de vía periférica, sondaje vesical, kit de vía aérea, preparación de medicación, cardio-desfibrilación, etc.', 'Organización del equipo', 'equipo', 0, {'indic': 1}, 'indicar',
  'Se indica a enfermería: colocar una vía periférica (o intraósea), sondaje vesical, preparar el kit de vía aérea, la medicación (adrenalina) y el desfibrilador, para que todo esté listo sin interrumpir las compresiones.',
  [['indicaciones', 'enfermeria'], ['indico', 'via periferica'], ['via periferica'], ['sondaje vesical'], ['kit de via aerea'], ['preparar', 'medicacion'], ['indico', 'enfermeria']], 'Indico a enfermería: colocar una vía periférica, el sondaje vesical, preparar el kit de vía aérea, la medicación y el desfibrilador.', {}),
 (7, 'Determina la necesidad de dispositivos de vía aérea avanzada y protocolo de oxigenación', 'Organización del equipo', 'oxigeno', 0, {'via': 1}, 'oxigenar',
  'Mientras no hay vía aérea avanzada se ventila con bolsa-máscara con reservorio y oxígeno al 100 % (12–15 L/min), 2 ventilaciones de 1 segundo cada 30 compresiones. Se decide cuándo asegurar la vía aérea (tubo endotraqueal o dispositivo supraglótico): una vez colocada, las compresiones son continuas y se ventila a 10 por minuto.',
  [['via aerea avanzada'], ['oxigenacion'], ['necesidad', 'via aerea'], ['dispositivo', 'via aerea'], ['oxigeno al 100']], 'Determino la necesidad de una vía aérea avanzada y el protocolo de oxigenación con oxígeno al 100 %.', {}),
 (8, 'Comprueba el nivel de conciencia del paciente recurriendo a estímulos verbales y dolorosos', 'Evaluación inicial', 'paciente', 1, {'conc': 1}, 'conciencia',
  'Se comprueba la falta de respuesta llamándolo en voz alta y con un estímulo doloroso (sacudir los hombros, presión esternal), junto con la respiración y el pulso carotídeo (no más de 10 segundos). Iniciar compresiones sin comprobar la ausencia de respuesta es criterio de desaprobación.',
  [['nivel de conciencia'], ['estimulo verbal'], ['estimulo doloroso'], ['estimulos'], ['llamo al paciente'], ['respuesta del paciente'], ['respondo', 'paciente']], 'Compruebo el nivel de conciencia con estímulos verbales y dolorosos.', {}),
 (9, 'Informa en voz alta el inicio del protocolo de reanimación avanzada', 'Organización del equipo', 'equipo', 1, {'voz': 1}, 'voz',
  'Se anuncia en voz alta «¡inicio de reanimación avanzada!» para que todo el equipo sincronice sus acciones y registre la hora de comienzo. Omitirlo es criterio de desaprobación.',
  [['en voz alta'], ['inicio', 'reanimacion avanzada'], ['informo', 'reanimacion'], ['anuncio', 'reanimacion'], ['inicio del protocolo']], 'Informo en voz alta: inicio del protocolo de reanimación avanzada.', {}),
 (10, 'Se coloca a un lado del paciente a la atura del tórax', 'Compresiones torácicas', 'torax', 0, {'lado': 1}, 'lado_torax',
  'El reanimador se arrodilla o se para a un lado del paciente, a la altura del tórax, sobre una superficie firme y con espacio para trabajar.',
  [['me coloco', 'lado'], ['a un lado del paciente'], ['altura del torax'], ['me ubico', 'lado']], 'Me coloco a un lado del paciente, a la altura del tórax.', {}),
 (11, 'Localiza el apéndice xifoides', 'Compresiones torácicas', 'xifoides', 0, {'xif': 1}, 'xifoides',
  'Se palpa el apéndice xifoides, el extremo inferior del esternón, como referencia para ubicar el sitio de las compresiones.',
  [['xifoides']], 'Localizo el apéndice xifoides.', {}),
 (12, 'Localiza el sitio correcto para la realización de las compresiones.', 'Compresiones torácicas', 'esternon', 1, {'sitio': 1}, 'sitio',
  'El sitio correcto es la mitad inferior del esternón, en el centro del tórax (línea intermamilar), unos 2 cm por encima del apéndice xifoides. Comprimir sobre el xifoides o sobre las costillas lesiona órganos y es ineficaz: es criterio de desaprobación.',
  [['sitio correcto'], ['mitad inferior del esternon'], ['centro del torax'], ['sitio', 'compresiones'], ['localizo', 'sitio'], ['ubico', 'sitio']], 'Localizo el sitio correcto para las compresiones, en la mitad inferior del esternón.', {}),
 (13, 'Ubica el talón de la mano dominante sobre el sitio elegido para las compresiones', 'Compresiones torácicas', 'esternon', 1, {'talon': 1}, 'talon',
  'El talón de la mano dominante se apoya sobre el sitio elegido, con los dedos levantados del tórax. Una mala ubicación de la mano es criterio de desaprobación.',
  [['talon de la mano'], ['talon', 'mano dominante'], ['apoyo', 'talon'], ['ubico', 'talon']], 'Ubico el talón de la mano dominante sobre el sitio elegido para las compresiones.', {}),
 (14, 'Entrelaza los dedos de la mano no dominante con los dedos de la mano dominante hacia la palma', 'Compresiones torácicas', 'mano', 0, {'manos': 1}, 'dedos',
  'Se entrelazan los dedos de ambas manos y se los levanta de modo que solo el talón de la mano apoye sobre el tórax.',
  [['entrelazo'], ['entrelaza'], ['dedos entrelazados'], ['mano no dominante']], 'Entrelazo los dedos de la mano no dominante con los de la mano dominante hacia la palma.', {}),
 (15, 'Extiende los codos en su totalidad', 'Compresiones torácicas', 'mano', 0, {'codos': 1}, 'codos',
  'Con los codos completamente extendidos la fuerza viene del peso del tronco y no de los brazos: las compresiones son más profundas y el reanimador se cansa menos.',
  [['extiendo', 'codos'], ['codos extendidos'], ['codos', 'totalidad'], ['extiende', 'codos']], 'Extiendo los codos en su totalidad.', {}),
 (16, 'Se inclina hacia adelante formando un ángulo de 90º con el tórax del paciente', 'Compresiones torácicas', 'torax', 0, {'angulo': 1}, 'angulo90',
  'Los hombros quedan justo por encima de las manos, con los brazos perpendiculares al tórax (90°), para que el peso del cuerpo comprima en línea recta.',
  [['90'], ['inclino hacia adelante'], ['angulo de 90'], ['me inclino']], 'Me inclino hacia adelante formando un ángulo de 90° con el tórax del paciente.', {}),
 (17, 'Inicia compresiones torácicas a una frecuencia de 100 a 120 por minuto con una profundidad de 5 a 6 cm permitiendo la descompresión entre compresiones.', 'Compresiones torácicas', 'esternon', 1, {'rcp': 1}, 'compresiones',
  'Compresiones de alta calidad: 100 a 120 por minuto, 5 a 6 cm de profundidad, permitiendo que el tórax se expanda por completo entre una y otra (sin apoyarse) y con interrupciones mínimas (menos de 10 segundos). Una frecuencia o profundidad inadecuadas son criterio de desaprobación.',
  [['inicio', 'compresiones'], ['comienzo', 'compresiones'], ['100 a 120'], ['5 a 6 cm'], ['compresiones toracicas'], ['inicio las compresiones']], 'Inicio las compresiones torácicas a 100 a 120 por minuto, con una profundidad de 5 a 6 cm y permitiendo la descompresión.', {}),
 (18, 'Continúa las compresiones de manera rítmica y sin detenerse. En el caso de contar con ayudante: Realiza 30 compresiones e indica 2 ventilaciones', 'Compresiones torácicas', 'esternon', 1, {'cont': 1}, 'continuar',
  'Se mantiene el ritmo sin detenerse. Con un ayudante y vía aérea no asegurada: ciclos de 30 compresiones y 2 ventilaciones (relación 30:2); el simulador hace sonar las dos ventilaciones cada 30 compresiones. Con vía aérea avanzada: compresiones continuas y 10 ventilaciones por minuto.',
  [['continuo', 'compresiones'], ['sin detenerme'], ['30 compresiones'], ['2 ventilaciones'], ['30 y 2'], ['30 2']], 'Continúo las compresiones de manera rítmica y sin detenerme; con ayudante hago 30 compresiones e indico 2 ventilaciones.', {}),
 (22, 'En caso de obtener retorno de la circulación espontánea: Determinar cuidados post-paro.', 'Cierre', 'paciente', 1, {'rosc': 1}, 'rosc',
  'Con retorno de la circulación espontánea (pulso palpable, presión arterial y salto del CO₂ espirado) se inician los cuidados post-paro: asegurar la vía aérea, ventilar hasta lograr normocapnia y titular el oxígeno para una SpO₂ de 92 a 98 % (evitar la hiperoxia), mantener una presión arterial media de 65 mmHg o más (cristaloides y vasopresores), ECG de 12 derivaciones (el supradesnivel del ST indica angioplastia urgente), manejo controlado de la temperatura si no obedece órdenes, buscar la causa y derivar a terapia intensiva.',
  [['post paro'], ['cuidados post'], ['retorno de la circulacion'], ['rosc'], ['post-paro']], 'Con retorno de la circulación espontánea, determino los cuidados post-paro.', {}),
 (23, 'Comunicar la evolución del paciente de manera respetuosa al familiar u acompañante', 'Cierre', 'familia', 0, {'familia': 1}, 'familia',
  'Se informa a la familia en un lugar tranquilo y privado, fuera del shock room, con lenguaje claro, empatía y sin tecnicismos (protocolo SPIKES): qué ocurrió, qué se hizo y cómo evoluciona el paciente. Se permite la expresión emocional y se ofrece contención.',
  [['familiar'], ['acompanante'], ['comunico', 'evolucion'], ['familia']], 'Comunico la evolución del paciente al familiar de manera respetuosa y con lenguaje claro.', {}),
 (24, 'Registrar los procedimientos realizados en la Historia Clínica', 'Cierre', 'hc', 1, {'reg': 1}, 'registro',
  'Se registran las horas (colapso, inicio de la reanimación, retorno de la circulación o fallecimiento), el ritmo inicial y sus cambios, las descargas (cantidad y energía), la medicación (dosis y hora), la vía aérea y los dispositivos colocados y la evolución: es el documento médico-legal de la reanimación. Omitirlo es criterio de desaprobación.',
  [['registro'], ['historia clinica'], ['anoto'], ['dejo constancia']], 'Registro los procedimientos realizados en la historia clínica.', {}),
]
EXTRA = [   # pasos del algoritmo que dependen del ritmo del caso
 (18.1, 'Solicita el desfibrilador, selecciona la energía (bifásico 200 J) y carga mientras se continúan las compresiones.', 'Algoritmo', 'desfibrilador', 1, {'carga': 1}, 'carga_defi',
  'Ante FV o TV sin pulso se desfibrila lo antes posible. Se pide el desfibrilador, se selecciona la energía (bifásico 120–200 J; 200 J si no se conoce el dispositivo) y se carga mientras otro reanimador sigue comprimiendo. No cargar ni descargar ante un ritmo desfibrilable es criterio de desaprobación.',
  [['solicito', 'desfibrilador'], ['cargo', 'desfibrilador'], ['200 j'], ['200 joules'], ['selecciono', 'energia'], ['cargo'], ['bifasico']], 'Solicito el desfibrilador, selecciono 200 J bifásico y cargo mientras se continúan las compresiones.', {'solo_si': 'desfib'}),
 (18.2, 'Avisa «¡todos fuera!», verifica que nadie toque al paciente, entrega la descarga y vuelve a comprimir de inmediato.', 'Algoritmo', 'desfibrilador', 1, {'descarga': 1}, 'descarga_fx',
  'Antes de descargar se grita «¡todos fuera!» y se verifica que nadie toque al paciente, la camilla ni el oxígeno. También se retira el ambú del tórax. Se entrega la descarga y se reinician las compresiones de inmediato, sin palpar el pulso ni mirar el monitor (el miocardio queda aturdido y necesita soporte mecánico), durante 2 minutos completos. Descargar sin avisar o sin verificar la seguridad es criterio de desaprobación.',
  [['todos fuera'], ['descarga'], ['desfibrilo'], ['entrego la descarga'], ['doy un shock'], ['choque'], ['nadie toque']], 'Aviso: ¡todos fuera! Verifico que nadie toque al paciente, entrego la descarga y vuelvo a comprimir de inmediato.', {'solo_si': 'desfib'}),
 (18.3, 'Indica adrenalina 1 mg EV/IO, que se repite cada 3 a 5 minutos.', 'Algoritmo', 'carro', 1, {'adre': 1}, 'adrenalina',
  'En ritmos no desfibrilables (asistolia y AESP) se administra adrenalina 1 mg EV/IO lo antes posible y se repite cada 3 a 5 minutos, seguida de 20 mL de solución salina y elevación del miembro unos 10 a 20 segundos. La dosis de 1 mg (no 10 mg) es parte de la desaprobación si se indica mal.',
  [['adrenalina'], ['epinefrina']], 'Indico adrenalina 1 mg EV, que se repite cada 3 a 5 minutos.', {'solo_si': 'nodesfib'}),
 (18.4, 'Busca y trata las causas reversibles (5H y 5T).', 'Algoritmo', 'equipo', 0, {'causas': 1}, 'causas',
  'En asistolia y AESP se buscan las causas reversibles: Hipovolemia, Hipoxia, Hidrogeniones (acidosis), Hipo/hiperkalemia, Hipotermia; y Neumotórax a tensión, Taponamiento cardíaco, Tóxicos, Trombosis coronaria y Tromboembolismo pulmonar.',
  [['causas reversibles'], ['5h'], ['hipovolemia'], ['hipoxia'], ['5 h'], ['cinco h']], 'Busco y trato las causas reversibles, las 5 H y las 5 T.', {'solo_si': 'nodesfib'}),
 (18.7, 'Tras la segunda descarga indica adrenalina 1 mg EV/IO, que se repite cada 3 a 5 minutos.', 'Algoritmo', 'carro', 0, {'adre': 1}, 'adrenalina',
  'En FV/TV sin pulso la adrenalina 1 mg EV/IO se administra después de la segunda descarga y luego cada 3 a 5 minutos, mientras se continúan las compresiones.',
  [['adrenalina'], ['epinefrina']], 'Indico adrenalina 1 mg EV tras la segunda descarga, que se repite cada 3 a 5 minutos.', {'solo_si': 'desfib'}),
 (18.8, 'Tras el tercer choque indica amiodarona 300 mg EV.', 'Algoritmo', 'carro', 0, {'amio': 1}, 'amiodarona',
  'En FV/TV sin pulso refractaria, después del tercer choque se administra amiodarona 300 mg EV/IO en bolo; una segunda dosis de 150 mg después del quinto choque si persiste. La lidocaína (1 a 1,5 mg/kg) es una alternativa.',
  [['amiodarona']], 'Tras el tercer choque indico amiodarona 300 mg EV.', {'solo_si': 'refractaria'}),
 (19, 'Realiza reevaluación constante de signos vitales en monitor multiparamétrico', 'Reevaluación', 'monitor', 1, {'reeval': 1}, 'reevaluar',
  'Cada 2 minutos se interrumpen las compresiones menos de 10 segundos para reevaluar el ritmo en el monitor y el pulso. El CO₂ espirado (≥ 10 mmHg durante las compresiones; salto brusco con el retorno) ayuda a juzgar la calidad y el retorno de la circulación.',
  [['reevaluo'], ['reevaluacion'], ['signos vitales'], ['reevalua'], ['controlo el monitor']], 'Realizo la reevaluación constante de los signos vitales en el monitor multiparamétrico.', {}),
 (20, 'Determina la necesidad de continuar maniobras de reanimación y lo comunica a su equipo.', 'Reevaluación', 'equipo', 0, {'decide': 1}, 'decide',
  'Con cada reevaluación el líder decide si hay que seguir y lo comunica al equipo: continuar con las maniobras si no hay retorno, o pasar a los cuidados post-paro si lo hay.',
  [['necesidad de continuar'], ['continuar', 'reanimacion'], ['comunico', 'equipo'], ['continuar las maniobras'], ['continuar', 'maniobras']], 'Determino la necesidad de continuar las maniobras de reanimación y lo comunico a mi equipo.', {}),
 (21, 'Releva la reanimación cada 2 minutos y continuando pasos 18-20 hasta obtener respuesta', 'Reevaluación', 'reloj', 1, {'relevo': 1}, 'relevo',
  'Cada 2 minutos se releva a quien comprime (la fatiga reduce la profundidad), con una pausa mínima, y se repiten los pasos 18 a 20 hasta obtener respuesta. Omitir el relevo es criterio de desaprobación.',
  [['releva'], ['relevo'], ['cada 2 minutos'], ['cada dos minutos'], ['2 minutos']], 'Relevo la reanimación cada 2 minutos y continúo los pasos 18 a 20 hasta obtener respuesta.', {}),
 (22.5, 'En caso de no responder u observar signos de muerte: Determinar hora de la muerte.', 'Cierre', 'reloj', 1, {'muerte': 1}, 'muerte',
  'Si tras la reanimación avanzada prolongada no hay respuesta y persisten los signos de muerte (asistolia sostenida, ausencia de pulso, respiración y reflejos, pupilas midriáticas), se declara el fallecimiento y se determina la hora de la muerte, que se informa al equipo y se registra. En general se suspenden las maniobras tras 20 a 30 minutos de reanimación de calidad sin causas reversibles corregibles y con CO₂ espirado menor de 10 mmHg.',
  [['hora de la muerte'], ['hora', 'muerte'], ['declaro'], ['fallec'], ['certifico'], ['signos de muerte']], 'Determino la hora de la muerte.', {'solo_si': 'muerte'}),
]
pasos = []
for n, tx, fa, tg, cr, es, fx, ex, cl, fr, extra in P + EXTRA:
    p = dict(n=n, texto=tx, fase=fa, target=tg, critico=bool(cr), explica=ex, estado=es, claves=cl, frase=fr, fx=fx); p.update(extra); pasos.append(p)
for p in pasos:
    if p['n'] == 22: p['sin_si'] = 'muerte'
    if p['n'] in (18.7,): p['solo_si'] = 'desfib'
pasos.sort(key=lambda q: q['n'])

# =====================================================================  ELEMENTOS
EL = {
 'equipo': ('Equipo de trabajo', 'Médicos, enfermería y técnicos del shock room: se les pide colaboración, se les delegan funciones y se les informa el inicio del protocolo.'),
 'guantes': ('Guantes', 'Precaución estándar antes de tocar al paciente.'),
 'monitor': ('Monitor multiparamétrico', 'Muestra el ECG, la saturación, la presión y el CO₂ espirado. De él se lee el ritmo que define el algoritmo.'),
 'oxigeno': ('Oxígeno y vía aérea', 'Oxigenación al 100 % y dispositivos de vía aérea avanzada.'),
 'paciente': ('Paciente', 'Se comprueba el nivel de conciencia con estímulos verbales y dolorosos y, al final, la respuesta a la reanimación.'),
 'torax': ('Tórax', 'El reanimador se ubica a un lado, a la altura del tórax, y se inclina 90° sobre él.'),
 'xifoides': ('Apéndice xifoides', 'Extremo inferior del esternón: referencia para ubicar el sitio de las compresiones.'),
 'esternon': ('Esternón (sitio de compresión)', 'Mitad inferior del esternón, en el centro del tórax.'),
 'mano': ('Manos del reanimador', 'Talón de la mano dominante apoyado en el esternón, dedos entrelazados y codos extendidos.'),
 'desfibrilador': ('Desfibrilador', 'Se selecciona la energía, se carga y se descarga con todos fuera, solo ante FV o TV sin pulso.'),
 'carro': ('Carro de paro', 'Medicación de la reanimación: adrenalina y amiodarona.'),
 'reloj': ('Cronómetro', 'Marca los ciclos de 2 minutos y la hora de la muerte.'),
 'familia': ('Familiar o acompañante', 'Se le comunica la evolución con respeto y lenguaje claro.'),
 'hc': ('Historia clínica', 'Se registran los procedimientos, las horas y la medicación.'),
}
elementos = {k: dict(nombre=v[0], desc=v[1], pasos=[p['n'] for p in pasos if p['target'] == k]) for k, v in EL.items()}

# =====================================================================  DISTRACTORES
def dd(i, t, c, pq, tg, cl, **kw):
    o = dict(id=i, texto=t, critico=bool(c), porque=pq, target=tg, claves=cl); o.update(kw); return o
distractores = [
 dd('d1', 'Inicia las compresiones sin comprobar la falta de respuesta', 1, 'Es criterio de desaprobación: antes de comprimir se comprueba que el paciente no responde ni respira.', 'paciente', [['sin comprobar', 'conciencia'], ['sin verificar', 'respuesta'], ['sin comprobar', 'respuesta'], ['sin evaluar', 'respuesta']]),
 dd('d2', 'Inicia las compresiones sin haber leído el ritmo en el monitor', 1, 'Es criterio de desaprobación: el ritmo define el algoritmo (descarga o adrenalina).', 'monitor', [['sin mirar', 'monitor'], ['sin leer', 'monitor'], ['sin observar', 'monitor'], ['sin determinar', 'ritmo']]),
 dd('d3', 'Realiza las compresiones a una frecuencia inadecuada', 1, 'Es criterio de desaprobación: la frecuencia correcta es de 100 a 120 por minuto.', 'esternon', [['60 por minuto'], ['60 compresiones'], ['150 por minuto'], ['200 por minuto'], ['compresiones lentas'], ['compresiones rapidas'], ['80 por minuto']]),
 dd('d4', 'Realiza las compresiones con una profundidad inadecuada o sin permitir la descompresión', 1, 'Es criterio de desaprobación: la profundidad correcta es de 5 a 6 cm y el tórax debe expandirse por completo entre compresiones.', 'esternon', [['2 cm'], ['3 cm'], ['sin descompresion'], ['sin permitir la descompresion'], ['me apoyo sobre el torax'], ['compresiones superficiales']]),
 dd('d5', 'Ubica las manos en un sitio incorrecto (sobre el xifoides, el abdomen o las costillas)', 1, 'Es criterio de desaprobación: el sitio correcto es la mitad inferior del esternón.', 'esternon', [['sobre el xifoides'], ['sobre el abdomen'], ['sobre las costillas'], ['mitad superior'], ['sobre el cuello']]),
 dd('d6', 'Interrumpe las compresiones durante un tiempo prolongado', 1, 'Las interrupciones deben ser mínimas (menos de 10 segundos): cada pausa baja la presión de perfusión coronaria.', 'esternon', [['dejo de comprimir'], ['interrumpo', 'prolongad'], ['detengo las compresiones'], ['pauso las compresiones']]),
 dd('d7', 'Descarga ante un ritmo no desfibrilable (asistolia o AESP)', 1, 'Es criterio de desaprobación: la asistolia y la AESP no son desfibrilables; corresponde adrenalina y buscar causas reversibles.', 'desfibrilador', [['descarga'], ['desfibrilo'], ['doy un shock'], ['aplico un shock'], ['indico un shock'], ['doy shock'], ['aplico shock'], ['indico shock'], ['shock electrico'], ['choque'], ['cardiovierto'], ['200 j'], ['200 joules']], solo_si='nodesfib'),
 dd('d8', 'Indica adrenalina en lugar de descargar ante FV o TV sin pulso, o no descarga', 1, 'Es criterio de desaprobación: ante FV o TV sin pulso la prioridad es la desfibrilación.', 'carro', [['solo adrenalina'], ['no desfibrilo'], ['no descargo'], ['sin desfibrilar'], ['sin descargar']], solo_si='desfib'),
 dd('d9', 'Interpreta mal el ritmo: indica un ritmo desfibrilable en un paciente con asistolia o AESP', 1, 'Es criterio de desaprobación: en el monitor se ve un ritmo no desfibrilable (sin actividad eléctrica organizada o con complejos sin pulso).', 'monitor', [['fibrilacion ventricular'], ['taquicardia ventricular'], ['tvsp'], ['ritmo desfibrilable'], ['fv']], solo_si='nodesfib'),
 dd('d10', 'Interpreta mal el ritmo: indica asistolia, AESP o ritmo no desfibrilable en un paciente con FV o TV sin pulso', 1, 'Es criterio de desaprobación: en el monitor se ve un ritmo desfibrilable (caótico o taquicardia ancha sin pulso).', 'monitor', [['asistolia'], ['linea plana'], ['actividad electrica sin pulso'], ['aesp'], ['nodesfib']], solo_si='desfib'),
 dd('d11', 'Descarga sin avisar ni verificar que nadie toque al paciente', 1, 'Es criterio de desaprobación: se grita «¡todos fuera!» y se verifica la seguridad antes de cada descarga.', 'desfibrilador', [['sin avisar'], ['sin gritar'], ['sin decir', 'fuera'], ['sin verificar', 'nadie toque'], ['sin alejar']]),
 dd('d12', 'Indica una dosis incorrecta de adrenalina', 1, 'La dosis de adrenalina es de 1 mg EV/IO cada 3 a 5 minutos; 10 mg es una sobredosis.', 'carro', [['adrenalina', '10 mg'], ['adrenalina', '5 mg'], ['adrenalina', 'cada 10 minutos'], ['adrenalina', 'cada 15']]),
 dd('d13', 'Ventila en exceso (hiperventilación)', 0, 'La hiperventilación aumenta la presión intratorácica y disminuye el retorno venoso: con vía aérea avanzada son 10 ventilaciones por minuto.', 'oxigeno', [['hiperventil'], ['20 ventilaciones'], ['30 ventilaciones'], ['ventilo rapido']]),
 dd('d14', 'Indica atropina en asistolia o AESP', 0, 'La atropina ya no se recomienda en la asistolia ni en la AESP: corresponde adrenalina.', 'carro', [['atropina']]),
 dd('d15', 'No releva a quien comprime (se fatiga)', 0, 'Se releva cada 2 minutos: la fatiga disminuye la profundidad de las compresiones.', 'reloj', [['no releva'], ['sin relevar'], ['sin relevo'], ['no relevo']]),
 dd('d16', 'Indica cuidados post-paro en un paciente que no recuperó la circulación', 1, 'Es criterio de desaprobación: sin retorno de la circulación espontánea no corresponden los cuidados post-paro; se continúa o se determina la hora de la muerte.', 'paciente', [['post paro'], ['cuidados post'], ['retorno de la circulacion'], ['rosc']], solo_si='muerte'),
 dd('d17', 'Declara la muerte de un paciente que recuperó la circulación', 1, 'Es criterio de desaprobación: con retorno de la circulación espontánea se inician los cuidados post-paro.', 'reloj', [['hora de la muerte'], ['declaro'], ['fallec'], ['certifico']], sin_si='muerte'),
]
# =====================================================================  CASOS
def caso(i, nombre, sexo, edad, motivo, ant, ritmo, situ, conc, rosc_txt, desfib=False, nodesfib=False, refractaria=False, muerte=False, muerte_txt=None, extra=None, dea=False):
    c = dict(id=i, nombre=nombre, sexo=sexo, edad=edad, motivo=motivo, indicacion='Reanimación cardiopulmonar avanzada.', antecedentes=ant, alergia=None, ritmo=ritmo,
             desfib=desfib, nodesfib=nodesfib, refractaria=refractaria, muerte=muerte, dea=dea, extra=extra or [],
             situacion='Enfermería: ' + situ, conciencia='Sin respuesta a los estímulos verbales ni dolorosos; sin respiración ni pulso carotídeo.',
             eco5='Equipo: «Doctor, somos cinco en la sala: dos médicos, dos enfermeras y un técnico. Esperamos sus indicaciones».',
             eco6='Enfermería: «Vía periférica en curso, sondaje vesical preparado, kit de vía aérea abierto, adrenalina cargada y el desfibrilador conectado al paciente».',
             eco9='Equipo: «Anotamos la hora de inicio. Reanimación avanzada en marcha».',
             rosc_txt='Retorno de la circulación espontánea: ' + rosc_txt,
             muerte_txt=muerte_txt or 'Sin respuesta tras la reanimación avanzada: asistolia sostenida, sin pulso ni respiración, pupilas midriáticas arreactivas.')
    return c
casos = [
 caso('c1', 'Carlos M.', 'M', 64, 'Dolor precordial intenso y colapso brusco en la guardia.', 'Hipertensión arterial, tabaquista. Sin alergias conocidas.', 'fv',
      'paciente de 64 años con dolor torácico que se desploma en la sala de espera hace 2 minutos. No responde, no respira.', '', 'pulso carotídeo palpable, presión arterial de 112/68 y CO₂ espirado en 38.', desfib=True),
 caso('c2', 'Silvia R.', 'F', 58, 'Palpitaciones y síncope con deterioro rápido.', 'Cardiopatía isquémica previa. Sin alergias conocidas.', 'tvsp',
      'paciente de 58 años con palpitaciones y síncope; llegó con taquicardia y perdió el pulso en el traslado.', '', 'pulso carotídeo palpable, presión arterial de 108/66 y CO₂ espirado en 40.', desfib=True),
 caso('c3', 'Raúl P.', 'M', 71, 'Hallado sin respuesta en la cama de internación.', 'Neumonía grave con oxigenoterapia. Sin alergias conocidas.', 'asistolia',
      'paciente internado por neumonía, hallado sin respuesta; el monitor muestra una línea plana. Venía con mala saturación.', '', 'pulso carotídeo palpable, presión arterial de 96/58 y CO₂ espirado en 35 tras corregir la hipoxia.', nodesfib=True, extra=['Causa a buscar: hipoxia']),
 caso('c4', 'Marta L.', 'F', 77, 'Paro en el postoperatorio inmediato de una cirugía abdominal.', 'Cirugía abdominal hace 6 horas con drenaje hemático abundante.', 'aesp',
      'paciente en el postoperatorio de una cirugía abdominal con sangrado por el drenaje; el monitor muestra complejos organizados, pero no tiene pulso.', '', 'pulso palpable, presión arterial de 90/54 y CO₂ espirado en 34 tras reponer volumen.', nodesfib=True, extra=['Causa a buscar: hipovolemia']),
 caso('c5', 'Jorge T.', 'M', 59, 'Fibrilación ventricular recurrente tras un infarto.', 'Infarto agudo de miocardio en las últimas horas.', 'fv',
      'paciente con infarto agudo de miocardio que entra en fibrilación ventricular recurrente en la unidad coronaria.', '', 'pulso carotídeo palpable, presión arterial de 100/60 y CO₂ espirado en 37 tras el tercer choque y la amiodarona.', desfib=True, refractaria=True, extra=['FV refractaria']),
 caso('c6', 'Hilda B.', 'F', 86, 'Paro en una paciente terminal, con familiar presente.', 'Cáncer avanzado, insuficiencia renal y cardíaca. Sin alergias conocidas.', 'asistolia',
      'paciente de 86 años con enfermedad avanzada, hallada sin respuesta hace más de 20 minutos; la hija está en la puerta de la sala.', '', '', nodesfib=True, muerte=True, extra=['Familiar presente']),
 caso('c7', 'Diego F.', 'M', 45, 'Colapso durante una actividad deportiva.', 'Sin antecedentes conocidos. Sin alergias conocidas.', 'fv',
      'varón de 45 años que se desplomó jugando al fútbol; reanimación básica de testigos hasta la llegada.', '', 'pulso carotídeo palpable, presión arterial de 118/72 y CO₂ espirado en 41.', desfib=True),
 caso('c9', 'Rubén A.', 'M', 62, 'Colapso en la vía pública, presenciado por testigos que llamaron al 107.', 'Tabaquista. Sin alergias conocidas.', 'fv',
      'paro presenciado en la vía pública; los testigos iniciaron compresiones y usaron un DEA antes de que llegue el equipo. El DEA indicó descarga.', '', 'pulso carotídeo palpable, presión arterial de 110/70 y CO₂ espirado en 39.', desfib=True, dea=True, extra=['Extrahospitalario · DEA']),
 caso('c8', 'Elena S.', 'F', 69, 'Colapso con disnea súbita y sospecha de tromboembolismo pulmonar.', 'Reposo prolongado por una fractura de cadera reciente.', 'aesp',
      'paciente con fractura de cadera reciente que presenta disnea súbita y se colapsa; el monitor muestra complejos organizados sin pulso.', '', 'pulso carotídeo palpable, presión arterial de 92/55 y CO₂ espirado en 33 tras el tratamiento de la causa.', nodesfib=True, extra=['Causa a buscar: TEP']),
]

# =====================================================================  FUNDAMENTOS
Q = [
 ('¿Cuáles son los ritmos desfibrilables de un paro cardíaco?', ['Fibrilación ventricular y taquicardia ventricular sin pulso', 'Asistolia y actividad eléctrica sin pulso', 'Bradicardia sinusal y bloqueo AV', 'Fibrilación auricular y flutter'], 0, 'Solo la FV y la TV sin pulso se descargan. La asistolia y la AESP no son desfibrilables: se da adrenalina y se buscan las causas reversibles.'),
 ('¿Cuál es la frecuencia y la profundidad de las compresiones torácicas en el adulto?', ['100 a 120 por minuto y 5 a 6 cm', '60 a 80 por minuto y 2 cm', '140 por minuto y 8 cm', '100 por minuto y 3 cm'], 0, 'Compresiones de alta calidad: 100 a 120 por minuto, 5 a 6 cm de profundidad, permitiendo la descompresión completa entre ellas.'),
 ('¿Dónde se comprime?', ['En la mitad inferior del esternón, en el centro del tórax', 'Sobre el apéndice xifoides', 'En el lado izquierdo del tórax, sobre el ápex', 'En el abdomen, sobre el epigastrio'], 0, 'El sitio es la mitad inferior del esternón; el xifoides es solo la referencia para ubicarlo.'),
 ('Si el paciente no tiene la vía aérea asegurada y hay un ayudante, ¿qué relación se usa?', ['30 compresiones y 2 ventilaciones', '15 compresiones y 2 ventilaciones', '5 compresiones y 1 ventilación', 'Solo compresiones, sin ventilar nunca'], 0, 'Relación 30:2. Con vía aérea avanzada se ventila a 10 por minuto sin pausar las compresiones.'),
 ('¿Cada cuánto se releva a quien comprime?', ['Cada 2 minutos', 'Cada 10 minutos', 'Cada 30 segundos', 'No se releva'], 0, 'La fatiga reduce la profundidad de las compresiones: se releva cada 2 minutos (cada ciclo) con una pausa mínima.'),
 ('¿Qué se administra ante asistolia o AESP?', ['Adrenalina 1 mg EV/IO cada 3 a 5 minutos y se buscan causas reversibles', 'Atropina 3 mg', 'Una descarga de 200 J', 'Bicarbonato de sodio de rutina'], 0, 'En los ritmos no desfibrilables se da adrenalina lo antes posible y se buscan y tratan las 5H y las 5T. La atropina ya no se recomienda.'),
 ('En FV refractaria, ¿qué antiarrítmico se indica tras el tercer choque?', ['Amiodarona 300 mg EV', 'Atropina 1 mg', 'Furosemida', 'Nitroglicerina'], 0, 'Después del tercer choque se administra amiodarona 300 mg en bolo y, si persiste, una segunda dosis de 150 mg.'),
 ('¿Cuáles son las causas reversibles (5H y 5T)?', ['Hipovolemia, hipoxia, acidosis, alteraciones del potasio e hipotermia; neumotórax a tensión, taponamiento, tóxicos, trombosis coronaria y TEP', 'Hipertensión, hipoglucemia, hipertermia, hiperlipemia y hipocalcemia', 'Solo hipoxia y acidosis', 'No existen causas reversibles'], 0, 'Se buscan y tratan en el paro, sobre todo en la asistolia y la AESP.'),
 ('Durante las compresiones el CO₂ espirado es de 6 mmHg. ¿Qué indica?', ['Compresiones de baja calidad: hay que mejorar la profundidad, la frecuencia o relevar', 'Retorno de la circulación espontánea', 'Hiperventilación', 'Que el tubo está en el esófago'], 0, 'Un CO₂ espirado menor de 10 mmHg sugiere compresiones inadecuadas. Un salto brusco hacia 35–40 mmHg indica retorno de la circulación.'),
 ('¿Qué indica un ascenso brusco del CO₂ espirado con aparición de un pulso palpable?', ['Retorno de la circulación espontánea: se inician los cuidados post-paro', 'Que se debe seguir con las compresiones sin pausas', 'Hiperventilación', 'Que se debe declarar la hora de la muerte'], 0, 'Con retorno de la circulación espontánea se pasa a los cuidados post-paro: oxigenación, presión arterial, ECG de 12 derivaciones y búsqueda de la causa.'),
]
fund = [dict(q=q, o=o, c=c, e=e) for q, o, c, e in Q]

machete = {
 'perlas': [
  {'t': 'Antes de empezar', 'x': 'Presentate, preguntá qué pasó, ponete guantes, leé el ritmo en el monitor y comprobá que no responde ni respira. Pedí ayuda, delegá y gritá el inicio de la reanimación.'},
  {'t': 'Compresiones de calidad', 'x': 'Mitad inferior del esternón, talón de la mano dominante, dedos entrelazados, codos extendidos y hombros sobre las manos (90°). 100 a 120 por minuto, 5 a 6 cm, descompresión completa, pausas de menos de 10 segundos. 30:2 con ayudante.'},
  {'t': 'Ritmos desfibrilables (FV / TVSP)', 'x': 'Descarga lo antes posible (bifásico 120–200 J), «¡todos fuera!», y reiniciá compresiones de inmediato por 2 minutos. Adrenalina 1 mg tras la 2.ª descarga y cada 3–5 min; amiodarona 300 mg tras la 3.ª.'},
  {'t': 'Ritmos no desfibrilables (asistolia / AESP)', 'x': 'Adrenalina 1 mg EV/IO lo antes posible y cada 3–5 min. Buscá y tratá las 5H y las 5T. Nunca se descarga.'},
  {'t': 'Cada 2 minutos', 'x': 'Reevaluá el ritmo en el monitor (menos de 10 s), decidí si continuar y relevá a quien comprime. El CO₂ espirado ≥ 10 mmHg indica compresiones eficaces; un salto a 35–40 indica retorno de la circulación.'},
  {'t': 'Cierre', 'x': 'Con retorno de la circulación: cuidados post-paro. Sin respuesta y con signos de muerte: determiná la hora de la muerte. Informá a la familia con respeto y registrá todo en la historia clínica.'},
 ],
 'por_paso': {'4': 'FV y TVSP se descargan; asistolia y AESP no.', '8': 'Estímulo verbal y doloroso, respiración y pulso: menos de 10 s.', '12': 'Mitad inferior del esternón.', '17': '100–120 por minuto, 5–6 cm, descompresión completa.', '18.1': 'Carga mientras otro comprime.', '18.2': '«¡Todos fuera!» y a comprimir de inmediato.', '18.3': 'Adrenalina 1 mg cada 3–5 min.', '21': 'Relevo cada 2 minutos.'},
}
ALGORITMO = dict(titulo='Algoritmo de reanimación cardiopulmonar avanzada', comun=[
  dict(t='Paro cardíaco confirmado', x='Sin respuesta, sin respiración y sin pulso. Pedir ayuda, iniciar RCP y conectar el monitor/desfibrilador.', flag='conc'),
  dict(t='Compresiones de calidad', x='100–120/min · 5–6 cm · descompresión completa · pausas < 10 s · 30:2 · relevo cada 2 min.', flag='rcp'),
  dict(t='Analizar el ritmo', x='Leer el ritmo en el monitor: ¿desfibrilable o no?', flag='ritmo')],
 columnas=[
  dict(titulo='⚡ Desfibrilable · FV / TV sin pulso', cls='fv', nodos=[
   dict(t='Cargar y descargar', x='Bifásico 120–200 J. «¡Todos fuera!». Reiniciar compresiones de inmediato.', flag='descarga'),
   dict(t='2 minutos de RCP', x='Acceso EV/IO. Reevaluar el ritmo.', flag='relevo'),
   dict(t='Adrenalina', x='1 mg tras la 2.ª descarga y cada 3–5 min.', flag='adre'),
   dict(t='Amiodarona', x='300 mg tras la 3.ª descarga (luego 150 mg).', flag='amio')]),
  dict(titulo='➖ No desfibrilable · Asistolia / AESP', cls='nd', nodos=[
   dict(t='Adrenalina lo antes posible', x='1 mg EV/IO, repetir cada 3–5 min.', flag='adre'),
   dict(t='Buscar causas reversibles', x='5H: hipovolemia, hipoxia, hidrogeniones, hipo/hiperpotasemia, hipotermia. 5T: neumotórax a tensión, taponamiento, tóxicos, trombosis coronaria y pulmonar.', flag='causas'),
   dict(t='2 minutos de RCP', x='Reevaluar el ritmo y relevar a quien comprime.', flag='relevo')])],
 final=[dict(t='Retorno de la circulación espontánea', x='Cuidados post-paro: vía aérea, oxigenación, presión arterial, ECG, causa y derivación.', flag='rosc'),
        dict(t='Sin respuesta y con signos de muerte', x='Determinar la hora de la muerte, informar a la familia y registrar.', flag='muerte')])

RCP = dict(
 id='rcp', area='siam', titulo='RCP avanzado', icono='❤️‍🔥',
 resumen='Recorrido virtual de la reanimación cardiopulmonar avanzada en el shock room, con 24 pasos de la lista de cotejo de la cátedra y el algoritmo según el ritmo del monitor.',
 umbral=60, fuente='Lista de cotejo: Reanimación cardio-pulmonar avanzada (24 ítems)',
 elementos=elementos, distractores=distractores, casos=casos, fundamentos=fund, monitor=True, voz=True, algoritmo=ALGORITMO,
 criterios_texto='Desaprueba si omite: los guantes (3); la lectura del ritmo y la comprobación de la ausencia de respuesta (4, 8, 9); las compresiones de calidad: sitio, posición, 100–120 por minuto y 5–6 cm (12, 13, 17); la continuidad y el relevo (18, 19, 21); o el algoritmo según el ritmo: descarga si es desfibrilable, adrenalina si no lo es. Se aprueba con al menos 60 % del puntaje y ningún paso crítico fallido.',
 criterios=[
  dict(ico='🧤', titulo='Bioseguridad: guantes', pasos=[3]),
  dict(ico='📟', titulo='Leer el ritmo, comprobar respuesta y dar la voz de inicio', pasos=[4, 8, 9]),
  dict(ico='🫀', titulo='Compresiones de calidad: sitio, manos, 100–120/min y 5–6 cm', pasos=[12, 13, 17]),
  dict(ico='⚡', titulo='Algoritmo: descarga si es desfibrilable, adrenalina si no', pasos=['18a', '18b', '18c']),
  dict(ico='🔁', titulo='Continuidad, reevaluación y relevo cada 2 minutos', pasos=[18, 19, 21])],
 final_criticos='guantes, lectura del ritmo y comprobación de la respuesta, compresiones de calidad, algoritmo según el ritmo y relevo cada 2 minutos',
 hallazgo_pasos={'2': 'situacion', '5': 'eco5', '6': 'eco6', '8': 'conciencia', '9': 'eco9', '22': 'rosc_txt', '22.5': 'muerte_txt'},
 hallazgo_rotulos={'2': '🗣', '5': '🗣', '6': '🗣', '8': '🩺 Evaluás:', '9': '🗣', '22': '🩺 Evaluás:', '22.5': '🩺 Evaluás:'},
 hallazgo_voz={'2': 'f', '5': 'm', '6': 'f', '9': 'm'},
 machete=machete, examen=dict(tiempos=[5, 10, 15, 30], penalizacion_incorrecta=3, penalizacion_repetida=1),
 visor='data/acreditaciones/siam/rcp_modelo.json', peso_modelo='1 a 2 MB', instrumental='data/acreditaciones/siam/instrumental_rcp.json',
 mesa_pasos=[], pasos=pasos,
)
W(OUT + 'rcp.json', RCP)
print('pasos', len(pasos), [p['n'] for p in pasos if p['critico']])
