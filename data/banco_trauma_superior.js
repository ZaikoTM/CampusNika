// CAMPUS NIKA — Banco Traumatología: Miembro Superior (60 casos)
// Formato idéntico al del motor de examen.html: { up, q, options:{a,b,c,d}, correct, feedback }
const bancoTraumaSuperior = [
  {
    "up": "Trauma MS",
    "q": "Una mecanógrafa de 48 años consulta por parestesias nocturnas en la cara palmar del pulgar, índice y mayor de la mano derecha, que ceden al agitar la mano. Al examen físico, se busca reproducir la sintomatología mediante la flexión palmar máxima de ambas muñecas durante 60 segundos. ¿Cuál es la maniobra semiológica realizada y el nervio comprometido?",
    "options": {
      "a": "Prueba de Finkelstein por compresión del nervio radial",
      "b": "Maniobra de Phalen por compresión del nervio mediano",
      "c": "Signo de Froment por compresión del nervio cubital",
      "d": "Prueba de Cozen por compresión del nervio musculocutáneo"
    },
    "correct": "b",
    "feedback": "La prueba de Phalen (flexión palmar máxima de muñecas a 90° durante 60 segundos) incrementa la presión hidrostática dentro del túnel carpiano, desencadenando parestesias en el territorio del nervio mediano (1°, 2°, 3° y mitad radial del 4° dedo). El signo del sacudimiento de la mano (Flick sign) es un síntoma de alta especificidad para esta mononeuropatía. ⚠️ Trampa: No confundir con la prueba de Finkelstein (específica de De Quervain) ni con el signo de Froment (específico de parálisis cubital)."
  },
  {
    "up": "Trauma MS",
    "q": "Un motociclista de 32 años sufre un accidente de tránsito y presenta dolor, edema e impotencia funcional en el brazo derecho. Al examen físico, destaca la imposibilidad para realizar la extensión de la muñeca y de los dedos (\"mano péndula\"), con anestesia en el dorso del primer espacio interóseo. ¿Cuál es la estructura nerviosa lesionada y su nivel de atrapamiento óseo clásico?",
    "options": {
      "a": "Nervio axilar por fractura del cuello quirúrgico",
      "b": "Nervio cubital por compresión en el codo",
      "c": "Nervio mediano por luxación anterior de hombro",
      "d": "Nervio radial por atrapamiento en el canal de torsión"
    },
    "correct": "d",
    "feedback": "El nervio radial transcurre en contacto directo con la diáfisis humeral en el canal de torsión (junto a la arteria humeral profunda). Su lesión motora produce parálisis de los extensores de muñeca y dedos, manifestándose como \"mano péndula\", y anestesia en el dorso de la mano (1° espacio interóseo). ⚠️ Trampa: La fractura de diáfisis humeral con déficit del radial se denomina lesión de Holstein-Lewis."
  },
  {
    "up": "Trauma MS",
    "q": "Un arquero de fútbol de 24 años cae apoyando la mano derecha en hiperextensión. La radiografía inicial en la guardia no muestra un trazo evidente de solución de continuidad ósea, pero el paciente presenta dolor agudo e insoportable a la palpación profunda en la tabaquera anatómica. ¿Cuál es la conducta inicial más adecuada para este paciente?",
    "options": {
      "a": "Inmovilización con yeso de escafoides y reevaluación con radiografía en 15 días",
      "b": "Alta con cabestrillo simple y analgesia oral previa movilización precoz en 48 horas",
      "c": "Tomografía computada de urgencia previa colocación de valva antebraquial volar",
      "d": "Cirugía abierta inmediata con osteosíntesis de compresión mediante tornillo de Herbert"
    },
    "correct": "a",
    "feedback": "Ante la sospecha clínica firme de fractura de escafoides (dolor en tabaquera anatómica tras caída en extensión) con radiografías iniciales negativas, la conducta normatizada es inmovilizar con yeso para escafoides (incluyendo la articulación metacarpofalángica del pulgar) durante 10 a 15 días. Al cabo de este período, la reabsorción ósea en el foco hace visible la línea de fractura en la nueva radiografía. ⚠️ Trampa: Jamás dar de alta con cabestrillo ni solicitar cirugía si el trazo no está demostrado. El retraso en la inmovilización conduce a seudoartrosis y necrosis avascular del polo proximal debido a su irrigación retrógrada."
  },
  {
    "up": "Trauma MS",
    "q": "Un niño de 6 años sufre una caída desde una trepadora. La radiografía revela una fractura supracondílea de húmero en extensión con desplazamiento. Cuatro horas después de la reducción cerrada, refiere dolor intenso en antebrazo que aumenta con la extensión pasiva de los dedos, con pulso radial débil pero presente y parestesias. ¿Cuál es la conducta terapéutica prioritaria e inmediata?",
    "options": {
      "a": "Colocación de tracción cutánea en el miembro afectado y elevación de la extremidad",
      "b": "Retiro inmediato del vendaje y reevaluación radiológica bajo anestesia general",
      "c": "Exploración quirúrgica urgente y fasciotomía de los compartimentos del antebrazo",
      "d": "Inyección intraarterial de vasodilatadores y control de pulsos cada dos horas"
    },
    "correct": "c",
    "feedback": "El dolor severo desproporcionado que aumenta con la extensión pasiva de los dedos es el síntoma cardinal del síndrome compartimental agudo (que conduce a la retracción isquémica de Volkmann en la fractura supracondílea pediátrica). Ante signos de isquemia compartimental instalada, la conducta inmediata e impostergable es la fasciotomía quirúrgica descompresiva. ⚠️ Trampa: La presencia de pulso radial no descarta un síndrome compartimental. La prueba de oro semiológica es el dolor a la elongación pasiva de los músculos flexores."
  },
  {
    "up": "Trauma MS",
    "q": "Un deportista de 18 años presenta una fractura diafisaria inestable y desplazada de ambos huesos del antebrazo (radio y cúbito) sin déficit neurovascular. ¿Qué dispositivo de inmovilización provisional debe colocarse en la guardia y cuáles son sus límites anatómicos adecuados?",
    "options": {
      "a": "Férula antebraquiopalmar desde el pliegue cubital hasta la articulación interfalángica",
      "b": "Férula braquiopalmar desde el tercio superior del brazo hasta el pliegue palmar distal",
      "c": "Férula velpeau toracobraquial desde la espina de la escápula hasta la base de los dedos",
      "d": "Yeso circular antebraquial de baja compresión desde el codo hasta la tabaquera anatómica"
    },
    "correct": "b",
    "feedback": "Para inmovilizar de manera efectiva las fracturas diafisarias del antebrazo y controlar los movimientos de pronosupinación, se debe bloquear tanto la articulación proximal (codo a 90°) como la distal (muñeca en posición neutra). Esto se logra exclusivamente con una férula braquiopalmar (desde la inserción del deltoides hasta el pliegue palmar). ⚠️ Trampa: Una férula antebraquiopalmar es insuficiente porque deja libre el codo y permite la rotación del radio sobre el cúbito."
  },
  {
    "up": "Trauma MS",
    "q": "Un ciclista de 28 años cae sobre su antebrazo pronado. La radiografía muestra una fractura de la diáfisis del radio en la unión del tercio medio con el inferior, asociada a una luxación de la articulación radiocubital distal. ¿Cuál es el diagnóstico epónimo de esta lesión?",
    "options": {
      "a": "Fractura-luxación de Monteggia",
      "b": "Fractura-luxación de Essex-Lopresti",
      "c": "Fractura-luxación de Pouteau-Colles",
      "d": "Fractura-luxación de Galeazzi"
    },
    "correct": "d",
    "feedback": "La fractura-luxación de Galeazzi consiste en la fractura de la diáfisis radial (usualmente en la unión del 3° medio con el distal) asociada a la luxación de la articulación radiocubital distal. Por el contrario, Monteggia es la fractura del cúbito proximal con luxación de la cúpula radial. ⚠️ Trampa: Regla mnemotécnica UNER: Monteggia = Misma altura (Cúbito proximal / cúpula radial superior); Galeazzi = Gravedad (Radio distal / radiocubital inferior)."
  },
  {
    "up": "Trauma MS",
    "q": "Un joven de 22 años da un puñetazo contra una pared y presenta dolor y deformidad en la base del primer metacarpiano. La radiografía muestra una fractura intraarticular con un pequeño fragmento articular medial unido al ligamento oblicuo palmar y subluxación dorsoradial de la diáfisis. ¿Cuál es el diagnóstico de esta lesión y el músculo responsable del desplazamiento del fragmento mayor?",
    "options": {
      "a": "Fractura-luxación de Bennett producida por tracción del abductor largo del pulgar",
      "b": "Fractura de Rolando conminuta por acción predominante del extensor corto del pulgar",
      "c": "Fractura del boxeador por cizallamiento del flexor corto de la articulación trapeciometacarpiana",
      "d": "Esguince trapeciometacarpiano por avulsión traumática del aductor propio del pulgar"
    },
    "correct": "a",
    "feedback": "La fractura-luxación de Bennett es una lesión intraarticular de la base del 1° metacarpiano. El fragmento volar pequeño permanece unido al trapecio por el ligamento oblicuo palmar, mientras que la diáfisis del metacarpiano se desplaza hacia dorsorradial y proximal por la tracción del tendón del abductor largo del pulgar (ALP). ⚠️ Trampa: Diferenciar de la fractura de Rolando, la cual es conminuta en \"T\" o \"Y\" con tres o más fragmentos."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 55 años con antecedente de una fractura supracondílea de codo mal consolidada en la infancia (cúbito valgo) consulta por parestesias progresivas en el 4° y 5° dedos de la mano e hipotrofia de la eminecia hipotenar y de la primera comisura interósea. ¿Cuál es el diagnóstico clínico y la estructura nerviosa comprometida?",
    "options": {
      "a": "Atrapamiento del nervio mediano a nivel del pronador redondo",
      "b": "Parálisis del nervio radial por compresión en el supinador",
      "c": "Neurodocitis del nervio cubital en la corredera epitrocleolecraniana",
      "d": "Síndrome del nervio interóseo anterior por atrapamiento aponeurótico"
    },
    "correct": "c",
    "feedback": "La deformidad en cúbito valgo secundaria a consolidaciones viciosas de fracturas del codo genera una tracción y fricción crónica sobre el nervio cubital en el canal epitrócleo-olecraniano. Esto conduce a una parálisis tardía (neurodocitis) caracterizada por hipoestesia en 4° y 5° dedos, garra cubital y atrofia interósea/hipotenar. ⚠️ Trampa: Es una complicación tardía que puede manifestarse hasta 10 o 20 años después del traumatismo inicial."
  },
  {
    "up": "Trauma MS",
    "q": "Una niña de 3 años es llevada a la guardia por su madre tras haber sido tironeada bruscamente del brazo para evitar que se cayera. La niña mantiene el miembro superior en extensión y pronación, adosado al cuerpo, e inicia el llanto ante cualquier intento de movilización del codo. ¿Cuál es el diagnóstico y la maniobra de reducción manual indicada?",
    "options": {
      "a": "Prono doloroso; reducción mediante supinación forzada del antebrazo y flexión del codo",
      "b": "Luxación posterior de codo; reducción por tracción axial en extensión y contratracción",
      "c": "Fractura en tallo verde de radio; inmovilización directa con férula braquiopalmar",
      "d": "Fractura del cóndilo externo; osteosíntesis de urgencia con clavijas de Kirschner"
    },
    "correct": "a",
    "feedback": "El prono doloroso (subluxación de la cúpula radial) es la lesión traumática más frecuente del codo entre los 1 a 4 años. Ocurre por tracción longitudinal brusca de la mano con el antebrazo en pronación, lo que hace que el ligamento anular se deslice y quede atrapado entre la cúpula radial y el cóndilo. La reducción se realiza mediante prensión de la cabeza radial, supinación forzada rápida del antebrazo y flexión del codo. ⚠️ Trampa: No requiere radiografía previa si la historia es típica ni exige inmovilización enyesada posterior. Un leve chasquido y el uso inmediato del miembro por el niño confirman el éxito."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 25 años sufre una fractura cerrada diafisaria de radio y cúbito con edema moderado. El médico residente propone la colocación inmediata de un yeso circular cerrado y completo en la guardia. ¿Por qué está contraindicada la colocación de un yeso circular cerrado en las primeras 24 a 48 horas de un trauma agudo?",
    "options": {
      "a": "Genera retardo de la consolidación por falta de compresión ósea uniforme",
      "b": "Produce hipermovilidad del foco de fractura al no moldear las interlíneas",
      "c": "Provoca incompatibilidad tisular entre la malla tubular y la piel inflamada",
      "d": "Aumenta el riesgo de síndrome compartimental por impedimento del edema agudo"
    },
    "correct": "d",
    "feedback": "Durante las primeras 24 a 48 horas postrauma se desarrolla la fase inflamatoria aguda con edema progresivo de partes blandas. Un yeso cerrado circular no permite la expansión tisular; al actuar como una envoltura rígida no expansible, eleva la presión tisular intracompartimental, pudiendo desencadenar un síndrome compartimental e isquemia muscular. ⚠️ Trampa: En la etapa aguda de urgencia SIEMPRE se debe colocar una férula o valva abierta. El yeso circular se reserva para fases subagudas de mantenimiento."
  },
  {
    "up": "Trauma MS",
    "q": "Un rugbier de 20 años sufre un impacto directo sobre la cara lateral de su hombro derecho. Presenta dolor, equimosis y un relieve óseo prominente en el tercio medio de la clavícula, con elevación del fragmento medial. ¿Qué músculo es responsable de la elevación del fragmento proximal y cuál es el tratamiento ortopédico inicial de elección?",
    "options": {
      "a": "Trapecio superior; inmovilización con yeso toracopalmar en abducción de noventa grados",
      "b": "Pectoral mayor; reducción quirúrgica inmediata con placa y tornillos de compresión",
      "c": "Esternocleidomastoideo; inmovilización conservadora con cabestrillo o vendaje en ocho",
      "d": "Deltoides anterior; tracción continua transesquelética y reposo horizontal en cama"
    },
    "correct": "c",
    "feedback": "En las fracturas del tercio medio de la clavícula (75% del total), el fragmento medial se desplaza hacia cefálico y posterior por la acción del músculo esternocleidomastoideo (ECM), mientras que el fragmento distal cae por el peso del miembro y la tracción del pectoral mayor. La inmovilización ortopédica mediante cabestrillo o vendaje en ocho durante 4 a 6 semanas es el tratamiento de elección en más del 90% de los casos. ⚠️ Trampa: La presencia de un prominente relieve óseo no es indicación de cirugía abierta, salvo que exista amenaza inminente de perforación cutánea o compromiso vasculo-nervioso del plexo braquial/subclavio."
  },
  {
    "up": "Trauma MS",
    "q": "Una mujer de 68 años con osteopenia sufre una caída apoyando la mano en extensión. Presenta dolor en muñeca y deformidad en \"dorso de tenedor\". La radiografía muestra una fractura extraarticular de la metáfisis distal del radio con desplazamiento dorsal y angulación palmar del fragmento distal. ¿Cuál es el diagnóstico de esta lesión?",
    "options": {
      "a": "Fractura de Smith con desplazamiento palmar y deformidad en pala de jardinero",
      "b": "Fractura de Pouteau-Colles con desplazamiento dorsal y angulación apex palmar",
      "c": "Fractura-luxación de Barton con desplazamiento intraarticular y cizallamiento dorsal",
      "d": "Fractura de Hutchinson con compromiso aislado de la apófisis estiloides radial"
    },
    "correct": "b",
    "feedback": "La fractura de Pouteau-Colles es una fractura metafisaria extraarticular del radio distal caracterizada por el desplazamiento del fragmento distal hacia dorsal y radial, con inclinación apex palmar, produciendo la clásica deformidad en \"dorso de tenedor\" en la vista lateral y en \"desviación en bayoneta\" en la vista de frente. ⚠️ Trampa: Si el desplazamiento del fragmento distal fuera hacia palmar, la deformidad sería en \"pala de jardinero\" y correspondería a una fractura de Smith (Colles invertido)."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente sufre una herida cortante profunda en la cara anterointerna de la muñeca. Al examen físico se constata imposibilidad para aducir el pulgar contra el índice, compensando la pinza con una flexión de la articulación interfalángica del pulgar (Signo de Froment positivo). ¿Qué nervio fue seccionado y qué músculo intrínseco se encuentra paralizado?",
    "options": {
      "a": "Nervio cubital; parálisis del músculo aductor propio del pulgar",
      "b": "Nervio mediano; parálisis del músculo oponente del pulgar",
      "c": "Nervio radial; parálisis del músculo abductor largo del pulgar",
      "d": "Nervio musculocutáneo; parálisis del músculo flexor corto del pulgar"
    },
    "correct": "a",
    "feedback": "El nervio cubital inerva al músculo aductor propio del pulgar (adductor pollicis). Al estar paralizado, el paciente no puede aducir el pulgar contra la cara lateral del índice; para sujetar una hoja de papel, compensa contrayendo el flexor largo del pulgar (inervado por el mediano), lo que produce una flexión visible de la articulación interfalángica del pulgar (Signo de Froment positivo). ⚠️ Trampa: El signo de Froment evaluado con la prueba del papel es el signo patognomónico de la lesión del nervio cubital en la mano."
  },
  {
    "up": "Trauma MS",
    "q": "Un hombre de 30 años cae sobre el vértice del codo flexionado. Presenta dolor intenso e impotencia funcional total. A la palpación, la epitróclea, el epicóndilo y el vértice del olécranon han perdido su alineación horizontal en extensión y su disposición en triángulo isósceles a noventa grados de flexión. ¿Qué lesión articular se caracteriza por la alteración de estas referencias anatómicas (Triángulo de Hueter)?",
    "options": {
      "a": "Fractura aislada de la cúpula radial sin compromiso ligamentario",
      "b": "Fractura supracondílea de húmero con desplazamiento posterior",
      "c": "Prono doloroso con atrapamiento del ligamento anular del radio",
      "d": "Luxación posterior de codo por alteración de las relaciones óseas"
    },
    "correct": "d",
    "feedback": "En el codo normal, la epitróclea, el epicóndilo y el olécranon forman una línea horizontal en extensión (Línea de Malgaigne) y un triángulo isósceles en flexión de 90° (Triángulo de Hueter). En la luxación de codo, estas relaciones óseas entre sí se rompen. Por el contrario, en una fractura supracondílea, los tres puntos óseos se desplazan en bloque manteniendo la geometría del triángulo. ⚠️ Trampa: La conservación del triángulo de Hueter diferencia una fractura supracondílea de una luxación de codo."
  },
  {
    "up": "Trauma MS",
    "q": "Un trabajador de la construcción de 40 años cae desde una escalera sobre su mano extendida. Presenta dolor en el codo con dolor puntual a la palpación de la cúpula radial, asociado a dolor espontáneo en la muñeca e inestabilidad de la articulación radiocubital distal. ¿Qué complejo traumático debe sospecharse y qué estructura de partes blandas se encuentra lesionada?",
    "options": {
      "a": "Lesión de Monteggia con rotura completa del ligamento colateral medial",
      "b": "Lesión de Essex-Lopresti con rotura de la membrana interósea del antebrazo",
      "c": "Lesión de Galeazzi con avulsión aislada del tendón del supinador largo",
      "d": "Lesión de Holstein-Lewis con atrapamiento del nervio interóseo posterior"
    },
    "correct": "b",
    "feedback": "La lesión de Essex-Lopresti es un complejo traumático severo que combina una fractura conminuta de la cúpula radial, la rotura longitudinal completa de la membrana interósea del antebrazo y la subluxación/luxación de la articulación radiocubital distal. Se produce por una carga axial masiva. ⚠️ Trampa: Pasar por alto el dolor en la muñeca ante una fractura de cúpula radial conduce a la migración proximal del radio y colapso de la muñeca si se extirpa la cúpula sin reparar la membrana o la articulación distal."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 25 años sufre una luxación glenohumeral anterior que es reducida satisfactoriamente en la guardia mediante maniobras suaves de tracción y contratracción. ¿Qué dispositivo de inmovilización se coloca clásicamente para mantener el miembro adosado al tórax en rotación interna?",
    "options": {
      "a": "Vendaje en ocho cruzado posterior sobre la región interescapular",
      "b": "Férula antebraquiopalmar posterior con muñeca en extensión neutra",
      "c": "Vendaje de Velpeau o inmovilizador de hombro adosado al tórax",
      "d": "Minerva enyesada con apoyo occipital y mentoniano estricto"
    },
    "correct": "c",
    "feedback": "Tras la reducción de una luxación glenohumeral anterior, la inmovilización se efectúa mediante un vendaje de Velpeau o un inmovilizador blando tipo cabestrillo con cincha torácica. Esto mantiene la extremidad en aducción y rotación interna durante 2 a 3 semanas para permitir la cicatrización de la cápsula anterior y el labrum glenoideo (lesión de Bankart). ⚠️ Trampa: El vendaje en ocho es exclusivo de fracturas de clavícula. Jamás inmovilizar el hombro en abducción o rotación externa tras una luxación anterior."
  },
  {
    "up": "Trauma MS",
    "q": "Un ciclista cae impactando directamente la cara superior del hombro. Presenta dolor circunscripto sobre la articulación acromioclavicular y un relieve óseo prominente en la extremidad distal de la clavícula que deprime al presionarlo y reaparece al soltarlo. ¿Cómo se denomina este signo semiológico y qué estructuras ligamentarias están rotas en las lesiones de alto grado?",
    "options": {
      "a": "Signo de la tecla; rotura de ligamentos acromioclaviculares y coracoclaviculares",
      "b": "Signo de la charretera; rotura del manguito rotador y tendón del bíceps",
      "c": "Signo del hachazo; rotura de la cápsula articular glenohumeral anterior",
      "d": "Signo del surco; rotura del ligamento coracoacromial y labrum glenoideo"
    },
    "correct": "a",
    "feedback": "El signo de la tecla de piano es patognomónico de la luxación acromioclavicular de alto grado (Rockwood III o superior). Se produce por la rotura conjunta de los ligamentos acromioclaviculares y de los ligamentos coracoclaviculares (conoide y trapezoide), permitiendo que la masa muscular del ECM eleve la clavícula. ⚠️ Trampa: No confundir el signo de la tecla (acromioclavicular) con el signo de la charretera (glenohumeral anterior)."
  },
  {
    "up": "Trauma MS",
    "q": "Una recepcionista de 35 años refiere dolor punzante en el borde radial de la muñeca. Al realizar la desviación cubital pasiva de la muñeca con el pulgar flexionado dentro del puño cerrado, experimenta un dolor agudo e intolerable sobre la apófisis estiloides del radio. ¿Cuál es la maniobra semiológica realizada y qué compartimento tendinoso está afectado?",
    "options": {
      "a": "Prueba de Phalen; compresión del nervio mediano en el primer túnel dorsal",
      "b": "Prueba de Tinel; irritación del nervio radial en la tabaquera anatómica",
      "c": "Prueba de Cozen; inflamación de los extensoras radiales del carpo",
      "d": "Prueba de Finkelstein; tenosinovitis del abductor largo y extensor corto del pulgar"
    },
    "correct": "d",
    "feedback": "La tenosinovitis estenosante de De Quervain afecta al primer compartimento extensor del carpo, por donde discurren los tendones del abductor largo (ALP) y extensor corto del pulgar (ECP). La maniobra de Finkelstein (desviación cubital forzada de la muñeca con el pulgar flexionado en la palma) estira estos tendones sobre la apófisis estiloides radial, desencadenando un dolor agudo. ⚠️ Trampa: Recordar la anatomía del 1° compartimento dorsal: ALP y ECP. El extensor largo del pulgar (ELP) conforma el límite medial de la tabaquera anatómica y pasa por el 3° compartimento."
  },
  {
    "up": "Trauma MS",
    "q": "Un tenista de 42 años presenta dolor en la cara lateral del codo que se exacerba al realizar la extensión de la muñeca contra resistencia y la pronación del antebrazo. ¿Cuál es el diagnóstico clínico y la inserción tendinosa comprometida?",
    "options": {
      "a": "Epitrocleitis o codo de golfista; inflamación del tendón de los flexores-pronadores",
      "b": "Epicondilitis o codo de tenista; inflamación del tendón del extensor radial corto del carpo",
      "c": "Bursitis olecraniana; distensión de la bolsa sinovial por traumatismo directo repetido",
      "d": "Neurodocitis cubital; irritación del nervio en la corredera epitrocleolecraniana"
    },
    "correct": "b",
    "feedback": "La epicondilitis lateral (codo de tenista) es una tendinopatía por sobreuso de la inserción común de los músculos extensores del antebrazo en el epicondilo lateral del húmero. El músculo más frecuentemente comprometido en su origen es el extensor radial corto del carpo (ERCC). El dolor se despierta con la extensión de la muñeca y supinación contra resistencia. ⚠️ Trampa: La epitrocleitis (codo de golfista) afecta la inserción de la masa flexora-pronadora en la cara medial del codo."
  },
  {
    "up": "Trauma MS",
    "q": "Luego de reducir una luxación glenohumeral anterior en un adulto joven, el médico examina la función neurológica periférica del hombro antes de otorgar la inmovilización. ¿Qué nervio presenta mayor riesgo de paresia o neuropraxia y en qué región anatómica se explora su sensibilidad cutánea?",
    "options": {
      "a": "Nervio radial; sensibilidad en el dorso del primer espacio interóseo",
      "b": "Nervio mediano; sensibilidad en la cara pulpar del dedo índice",
      "c": "Nervio axilar o circunflejo; sensibilidad en la cara lateral del deltoides",
      "d": "Nervio musculocutáneo; sensibilidad en la cara anterior del antebrazo"
    },
    "correct": "c",
    "feedback": "El nervio axilar o circunflejo rodea el cuello quirúrgico del húmero tras emerger del espacio cuadrangular (de Velpeau). Es la estructura neurológica que se lesiona con mayor frecuencia (hasta un 10-15%) durante las luxaciones glenohumerales anteriores y las fracturas de húmero proximal. Su indemnidad se comprueba evaluando la sensibilidad cutánea en el \"parche deltoideo\" (cara lateral del hombro) y la contracción del músculo deltoides. ⚠️ Trampa: Nunca otorgar el alta a una luxación de hombro reducida sin consignar en la historia clínica la exploración de la sensibilidad sobre el muñón del deltoides."
  },
  {
    "up": "Trauma MS",
    "q": "Un varón de 34 años cae sobre la mano extendida con el codo en leve flexión. Presenta dolor en la cara lateral del codo y limitación dolorosa para la pronosupinación. La radiografía muestra una fractura del cuello de la cúpula radial desplazada 3 mm sin bloqueo mecánico. ¿Cuál es la clasificación anatómica y la conducta terapéutica indicada?",
    "options": {
      "a": "Fractura de cúpula radial tipo II de Mason con indicación de tratamiento conservador mediante férula",
      "b": "Fractura de cúpula radial tipo I de Mason con indicación de resección quirúrgica de la cabeza radial",
      "c": "Fractura de cúpula radial tipo III de Mason con indicación de osteosíntesis mediante placa y tornillos",
      "d": "Fractura de cúpula radial tipo IV de Mason con indicación de colocación de prótesis de sustitución"
    },
    "correct": "a",
    "feedback": "La clasificación de Mason divide las fracturas de la cúpula radial en: Tipo I (no desplazada o desplazamiento <2 mm), Tipo II (marginal desplazada >2 mm sin bloqueo articular), Tipo III (conminuta/articular total con bloqueo) y Tipo IV (asociada a luxación de codo). Las Mason Tipo II pequeñas o marginales sin bloqueo mecánico responden adecuadamente a inmovilización breve con férula posterior braquiopalmar e inicio de movilidad precoz. ⚠️ Trampa: No indicar exéresis o prótesis de entrada en Mason I o II. La resección aislada de la cúpula radial está contraindicada si existe inestabilidad longitudinal del antebrazo o lesión de ligamento colateral medial (riesgo de migración proximal del radio)."
  },
  {
    "up": "Trauma MS",
    "q": "Un trabajador sufre un corte profundo con un vidrio en la cara volar del tercer dedo, entre el pliegue palmar distal y la articulación interfalángica proximal. Al examen físico, presenta imposibilidad para flexionar la articulación interfalángica proximal y distal del dedo afectado. ¿A qué zona anatómica de Verdan corresponde la lesión y cuál es la conducta quirúrgica?",
    "options": {
      "a": "Sección de flexores en Zona I de Verdan con indicación de reinserción ósea directa",
      "b": "Sección de flexores en Zona II de Verdan con indicación de reparación quirúrgica",
      "c": "Sección de flexores en Zona III de Verdan con indicación de tenotomía descompresiva",
      "d": "Sección de flexores en Zona IV de Verdan con indicación de inmovilización en extensión"
    },
    "correct": "b",
    "feedback": "La Zona II de Verdan (\"tierra de nadie\" o no man's land) se extiende desde el pliegue palmar distal hasta la inserción del flexor superficial en la falange media. Dentro de esta vaina osteofibrosa estrecha conviven los tendones del flexor digital superficial (FDS) y profundo (FDP). Su sección exige neurorrafia/tenorrafia primaria diferida por cirujano especialista para evitar adherencias frictivas dentro del canal. ⚠️ Trampa: La imposibilidad de flexionar la interfalángica distal evalúa al FDP, mientras que la interfalángica proximal evalúa al FDS. Si ambas fallan en la falange proximal, la sección es completa en Zona II."
  },
  {
    "up": "Trauma MS",
    "q": "Una paciente de 52 años sufre una caída de propia altura y presenta dolor y deformidad en el brazo derecho. La radiografía muestra una fractura espiroidea en la unión del tercio medio con el distal de la diáfisis del húmero, asociada a imposibilidad para extender la muñeca. ¿Cuál es la denominación de esta variante traumática y la complicación neurológica asociada?",
    "options": {
      "a": "Fractura de Galeazzi asociada a parestesia por atrapamiento del nervio mediano",
      "b": "Fractura de Monteggia asociada a compromiso vascular de la arteria humeral",
      "c": "Fractura de Holstein-Lewis asociada a paresia por contusión del nervio radial",
      "d": "Fractura de Essex-Lopresti asociada a neurodocitis por elongación del cubital"
    },
    "correct": "c",
    "feedback": "La fractura de Holstein-Lewis es una variante específica de la fractura diafisaria de húmero que ocurre en la unión del tercio medio con el distal (espiroidea u oblicua). A este nivel, el nervio radial perfora el tabique intermuscular lateral para pasar del compartimento posterior al anterior, quedando fijo y extremadamente vulnerable a la contusión, elongación o atrapamiento entre los cabos óseos. ⚠️ Trampa: No confundir Holstein-Lewis (húmero distal/radial) con Essex-Lopresti (membrana interósea/cúpula radial) o Galeazzi (radio distal/luxación radiocubital)."
  },
  {
    "up": "Trauma MS",
    "q": "Un residente de guardia debe confeccionar una férula antebraquiopalmar de yeso para inmovilizar a un paciente con un esguince severo de la articulación radiocarpiana, asegurando una adecuada técnica de colocación según los protocolos del taller ortopédico. ¿Cuáles son los límites anatómicos precisos para la confección de esta inmovilización?",
    "options": {
      "a": "Desde la articulación acromioclavicular distal hasta la interfalángica distal",
      "b": "Desde el borde inferior de la axila proximal hasta la punta del dedo pulgar",
      "c": "Desde la inserción del músculo deltoides hasta la base de las metacarpofalángicas",
      "d": "Desde tres centímetros debajo del pliegue cubital hasta el pliegue palmar distal"
    },
    "correct": "d",
    "feedback": "Según los manuales oficiales del Taller de Inmovilizaciones de la UNER, la férula antebraquiopalmar se extiende proximalmente desde 3 cm por debajo del pliegue anterior del codo (para permitir la flexión libre del codo a 90°) y distalmente hasta el pliegue palmar distal (permitiendo la flexión completa de las articulaciones metacarpofalángicas de los dedos 2° a 5°), dejando el pulgar totalmente libre. ⚠️ Trampa: Si la férula sobrepasa el pliegue palmar distal e inmoviliza las metacarpofalángicas sin indicación específica, se comete un error técnico que favorece la rigidez articular de los dedos."
  },
  {
    "up": "Trauma MS",
    "q": "Un ciclista cae impactando la cara superior del hombro derecho. La radiografía revela una pérdida de alineación acromioclavicular con un aumento del espacio coracoclavicular superior al 100% respecto al lado contralateral y un relieve óseo reducible. ¿Cuál es la clasificación de la lesión y las estructuras ligamentarias comprometidas?",
    "options": {
      "a": "Luxación acromioclavicular grado III con rotura acromio y coracoclavicular",
      "b": "Luxación acromioclavicular grado I con distensión del ligamento coracoideo",
      "c": "Luxación acromioclavicular grado II con rotura aislada de la cápsula glenoidal",
      "d": "Luxación acromioclavicular grado IV con atrapamiento del músculo subescapular"
    },
    "correct": "a",
    "feedback": "En la clasificación de Rockwood/Allman-Tossy para luxaciones acromioclaviculares: Grado I (distensión AC), Grado II (rotura AC con coracoclaviculares intactos, subluxación <50%), Grado III (rotura completa de ligamentos acromioclaviculares y coracoclaviculares —conoide y trapezoide— con pérdida de contacto articular del 100% y elevación clavicular prominente). ⚠️ Trampa: El signo de la tecla está presente desde el grado III debido al desacople vertical por pérdida del anclaje de los ligamentos coracoclaviculares."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 28 años con antecedente de fractura no inmovilizada del cuello del escafoides hace cuatro meses, consulta por dolor persistente en la muñeca. La resonancia magnética muestra colapso y cambio de señal por falta de perfusión en el polo proximal del hueso. ¿Cuál es el mecanismo vascular responsable de esta complicación?",
    "options": {
      "a": "Necrosis avascular producida por interrupción de la irrigación anterógrada",
      "b": "Necrosis avascular producida por interrupción de la irrigación retrógrada",
      "c": "Seudoartrosis hipertrófica producida por exceso de movilidad del fragmento",
      "d": "Retardo de consolidación producido por infección bacteriana del foco óseo"
    },
    "correct": "b",
    "feedback": "El escafoides recibe entre el 70% y 80% de su aporte sanguíneo a través de ramas de la arteria radial que ingresan por su cresta dorsal en la cara distal y fluyen en sentido retrógrado (de distal a proximal). Una fractura a nivel de la cintura o del cuello interrumpe los vasos intraóseos, dejando al polo proximal ávascular y con un riesgo superior al 30-50% de necrosis avascular y seudoartrosis. ⚠️ Trampa: El flujo sanguíneo del escafoides es RETRÓGRADO (desde el polo distal hacia el proximal). La complicación isquémica siempre afecta al polo PROXIMAL."
  },
  {
    "up": "Trauma MS",
    "q": "Un basquetbolista sufre el impacto directo de la pelota en la punta del segundo dedo de la mano derecha. Presenta la articulación interfalángica distal fija en flexión palmar de 30°, con incapacidad para realizar la extensión activa pero con extensión pasiva conservada. ¿Cuál es el diagnóstico clínico y el tratamiento inicial indicado?",
    "options": {
      "a": "Avulsión del tendón flexor profundo en Zona I con indicación de cirugía",
      "b": "Rotura del capuchón extensor a nivel de la articulación metacarpofalángica",
      "c": "Lesión del tendón extensor en Zona I con indicación de férula en extensión",
      "d": "Subluxación volar de la falange media con indicación de yeso braquiopalmar"
    },
    "correct": "c",
    "feedback": "El dedo en martillo (mallet finger) responde a la disrupción del tendón extensor a nivel de su inserción en la base de la falange distal (Zona I de Verdan para extensores). Al perderse el mecanismo extensor distal, el flexor profundo actúa sin oposición manteniendo la articulación IFD en flexión. El tratamiento ortopédico Gold Standard es la inmovilización ininterrumpida de la IFD en hiperextensión/extensión neutra mediante una férula de Stack durante 6 a 8 semanas. ⚠️ Trampa: No requiere cirugía abierta en lesiones tendinosas puras. La indicación quirúrgica se limita a fragmentos óseos de avulsión que comprometan más del 33% de la superficie articular."
  },
  {
    "up": "Trauma MS",
    "q": "Luego de reducir una luxación posterior de codo mediante tracción axial en un adulto joven, se procede a la evaluación neurovascular antes de colocar la inmovilización. El paciente refiere adormecimiento en la cara palmar y dorsal del 5° dedo y borde cubital del 4° dedo. ¿Qué estructura neurológica presenta mayor riesgo de compresión o elongación en esta afección?",
    "options": {
      "a": "Neuropraxia del nervio radial por elongación en el canal del supinador",
      "b": "Neuropraxia del nervio mediano por atrapamiento en el pronador redondo",
      "c": "Neuropraxia del nervio axilar por tracción del músculo deltoides anterior",
      "d": "Neuropraxia del nervio cubital por compresión en el canal epitroclearse"
    },
    "correct": "d",
    "feedback": "En la luxación posterior de codo (la más frecuente), el desplazamiento retrógrado del bloque olecraniano estira y contusiona el nervio cubital al atravesar el surco epitrocleo-olecraniano posterior. La neuropraxia se manifiesta por parestesias sobre su territorio sensitivo exclusivo (5° dedo y cara cubital del 4° dedo). ⚠️ Trampa: El nervio cubital da sensibilidad al 5° dedo y cara ulnar del 4° dedo. El nervio mediano da sensibilidad a los tres primeros dedos y cara radial del 4° dedo."
  },
  {
    "up": "Trauma MS",
    "q": "Una niña de 5 años presenta dolor e impotencia funcional en el codo tras caer de un columpio. La radiografía muestra una fractura supracondílea de húmero con desplazamiento posterior completo del fragmento distal y pérdida de contacto cortical entre los cabos óseos. ¿A qué grado de la clasificación de Gartland corresponde y cuál es su tratamiento?",
    "options": {
      "a": "Fractura supracondílea grado III de Gartland con indicación de reducción y clavijas",
      "b": "Fractura supracondílea grado I de Gartland con indicación de cabestrillo simple",
      "c": "Fractura supracondílea grado II de Gartland con indicación de férula posterior",
      "d": "Fractura supracondílea tipo Greenstick con indicación de yeso toracopalmar"
    },
    "correct": "a",
    "feedback": "La clasificación de Gartland para fracturas supracondíleas de húmero en niños comprende: Grado I (no desplazada), Grado II (desplazada con periostio posterior intacto) y Grado III (desplazamiento completo con pérdida de contacto cortical y rotura perióstica). Las tipo III son inestables y requieren reducción cerrada bajo anestesia general y fijación percutánea mediante clavijas de Kirschner cruzadas o paralelas. ⚠️ Trampa: El grado III es el que mayor asociación presenta con neuropraxia del nervio interóseo anterior/mediano y atrapamiento de la arteria humoral."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 22 años ingresa a la guardia con dolor y angulación en el antebrazo. La radiografía revela una fractura de la diáfisis del cúbito en la unión del tercio proximal con el medio, acompañada de una luxación anterior de la cabeza del radio. ¿Cuál es el diagnóstico epónimo y la clasificación de Bado correspondiente?",
    "options": {
      "a": "Fractura-luxación de Galeazzi tipo I con indicación de yeso antebraquiopalmar",
      "b": "Fractura-luxación de Monteggia tipo I con indicación de reducción y placa",
      "c": "Fractura-luxación de Essex-Lopresti con indicación de reemplazo de cúpula",
      "d": "Fractura de Pouteau-Colles inestable con indicación de tutores externos"
    },
    "correct": "b",
    "feedback": "La fractura-luxación de Monteggia combina la fractura de la diáfisis del cúbito con la luxación de la cúpula radial. Según la clasificación de Bado: Tipo I (desplazamiento anterior de la cabeza radial y angulación anterior del cúbito —60-70% de los casos—). En el adulto es una lesión articular compleja que requiere reducción anatómica rígida del cúbito mediante placa de compresión con tornillos, lo que habitualmente reduce de forma indirecta la cúpula radial. ⚠️ Trampa: Monteggia = Cúbito fracturado + Cúpula radial luxada. Galeazzi = Radio fracturado + Cúbito distal luxado."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente consulta por dificultad para sujetar objetos pequeños. Al pedirle que forme un círculo apretando las yemas del pulgar y del índice (signo de la \"O\"), junta las falanges en aplastamiento plano por imposibilidad de flexionar la interfalángica del pulgar e interfalángica distal del índice, sin pérdida sensitiva. ¿Qué nervio se encuentra lesionado y qué músculo está paralizado en el pulgar?",
    "options": {
      "a": "Parálisis del nervio cubital por compresión en el canal de Guyon",
      "b": "Parálisis del nervio radial por compresión en la tabaquera anatómica",
      "c": "Parálisis del nervio interóseo anterior por compresión aponeurótica",
      "d": "Parálisis del nervio musculocutáneo por atrapamiento del bíceps"
    },
    "correct": "c",
    "feedback": "El nervio interóseo anterior (NIA) es una rama exclusivamente motora del nervio mediano que nace distal al codo e inerva tres músculos: el flexor largo del pulgar (FLP), el flexor profundo de los dedos (FPD) para el dedo índice y el pronador cuadrado. Su compresión impide flexionar la interfalángica del pulgar y la IFD del índice (signo de la \"O\" o pincer grasp test defectuoso), sin generar ningún déficit sensitivo en la mano. ⚠️ Trampa: La parálisis del NIA es un atrapamiento puramente MOTOR. No existe adormecimiento en los dedos porque las fibras sensitivas van por la rama principal del mediano."
  },
  {
    "up": "Trauma MS",
    "q": "Para el tratamiento ortopédico de una fractura espiroidea desplazada del tercio medio de la diáfisis del húmero en un paciente ambulatorio y colaborador, se decide colocar un dispositivo de inmovilización que utiliza el peso de la extremidad para ejercer tracción continua sobre el foco. ¿Qué dispositivo de inmovilización enyesado está indicado en este caso?",
    "options": {
      "a": "Colocación de un vendaje de Velpeau con rotación externa fija",
      "b": "Colocación de un corsé toracopalmar con abducción a noventa grados",
      "c": "Colocación de una férula antebraquiopalmar con muñeca en extensión",
      "d": "Colocación de un yeso colgante de Caldwell con anilla en la muñeca"
    },
    "correct": "d",
    "feedback": "El yeso colgante de Caldwell es un dispositivo enyesado braquiopalmar que incluye una anilla de alambre incorporada a nivel de la muñeca para pasar una cinta colgada al cuello. Se utiliza en fracturas espiroideas u oblicuas de la diáfisis humeral; el peso del yeso ejerce una tracción gravitacional continua hacia abajo que reduce el acortamiento y alinea los fragmentos en el paciente en bipedestación o sedestación. ⚠️ Trampa: Está contraindicado en fracturas transversales simples debido al riesgo de sobretracción con separación de los bordes y retardo de consolidación/seudoartrosis."
  },
  {
    "up": "Trauma MS",
    "q": "Una paciente de 60 años cae hacia adelante apoyando el dorso de la mano con la muñeca en flexión palmar. Presenta dolor en la región distal del antebrazo y una deformidad clínica visible en \"pala de jardinero\". ¿Cuál es el diagnóstico de esta lesión y la dirección del desplazamiento distal?",
    "options": {
      "a": "Fractura de Smith con desplazamiento palmar del fragmento distal",
      "b": "Fractura de Colles con desplazamiento dorsal del fragmento distal",
      "c": "Fractura de Barton con cizallamiento dorsal de la articular radial",
      "d": "Fractura de Galeazzi con luxación dorsal de la cabeza del cúbito"
    },
    "correct": "a",
    "feedback": "La fractura de Smith (o Colles invertido) es una fractura metafisaria extraarticular del radio distal producida por una caída sobre el dorso de la mano con la muñeca en flexión palmar. El fragmento distal se desplaza y bascula hacia la región palmar/volar, produciendo la deformidad clínica característica en \"pala de jardinero\". ⚠️ Trampa: Colles = Caída en extensión / Desplazamiento dorsal / Dorso de tenedor. Smith = Caída en flexión / Desplazamiento palmar / Pala de jardinero."
  },
  {
    "up": "Trauma MS",
    "q": "Una paciente de 78 años sufre una caída de propia altura. La radiografía de hombro muestra una fractura del húmero proximal desplazada en cuatro partes (cuello quirúrgico, cuello anatómico, troquíter y troquín). ¿A qué grado de la clasificación de Neer corresponde y cuál es su riesgo vascular?",
    "options": {
      "a": "Fractura en dos partes con bajo riesgo de osteonecrosis de la cabeza",
      "b": "Fractura en cuatro partes con alto riesgo de necrosis avascular",
      "c": "Fractura en tres partes con indicación de inmovilización con Velpeau",
      "d": "Fractura no desplazada con indicación de rehabilitación fisiátrica"
    },
    "correct": "b",
    "feedback": "La clasificación de Neer para el húmero proximal evalúa 4 segmentos anatómicos (cabeza/cuello anatómico, diáfisis/cuello quirúrgico, troquíter y troquín). Se considera \"parte\" si está desplazada >1 cm o angulada >45°. Una fractura en 4 partes aísla la cabeza humeral de sus inserciones musculares e interrumpe la arteria circunfleja humeral anterior (rama ascendente), presentando un riesgo de osteonecrosis avascular superior al 70-90%, lo que orienta a la colocación de una prótesis (artroplastía) en pacientes ancianos. ⚠️ Trampa: El cuello anatómico es el sitio por donde ingresan los vasos nutricios de la cabeza. Su compromiso completo destruye la perfusión cefálica."
  },
  {
    "up": "Trauma MS",
    "q": "Un esquiador sufre una caída trabando su bastón en la nieve, provocando una hiperabducción traumática del pulgar. Presenta dolor en la cara cubital de la primera articulación metacarpofalángica e inestabilidad a la maniobra de valgo forzado. ¿Qué estructura ligamentaria está lesionada y qué interposición aponeurótica debe descartarse?",
    "options": {
      "a": "Esguince leve del ligamento colateral radial sin compromiso articular",
      "b": "Fractura de Bennett desplazada con indicación de yeso para escafoides",
      "c": "Rotura del ligamento colateral cubital con riesgo de lesión de Stener",
      "d": "Luxación trapeciometacarpiana con indicación de tracción continua"
    },
    "correct": "c",
    "feedback": "La hiperabducción traumática de la primera articulación metacarpofalángica (pulgar del esquiador o del guardabosques) secciona el ligamento colateral cubital (LCC). Si el extremo roto del ligamento se retrae y queda atrapado por encima de la aponeurosis del músculo aductor del pulgar, se configura la lesión o efecto de Stener, la cual impide la cicatrización espontánea y constituye una indicación quirúrgica absoluta. ⚠️ Trampa: La maniobra de estrés en valgo se realiza comparando con el lado sano. Si hay más de 30° de apertura o falta de tope firme, se confirma la rotura completa."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente consulta por dolor e inflamación severa en el dedo índice derecho 48 horas después de clavarse una espina. Al examen físico presenta: dedo en actitud fijada en flexión, aumento de volumen uniforme en \"salchicha\", dolor intenso a la palpación de la vaina flexora y dolor insoportable a la extensión pasiva. ¿Cuál es el diagnóstico infeccioso basado en los hallazgos semiológicos?",
    "options": {
      "a": "Celulitis superficial tratable exclusivamente con antibióticos por vía oral",
      "b": "Panadizo eritematoso tratado mediante curaciones locales con antisépticos",
      "c": "Paroniquia aguda tratada mediante drenaje bajo la lámina ungueal afectada",
      "d": "Tenosinovitis infecciosa por cumplimiento de los cuatro signos de Kanavel"
    },
    "correct": "d",
    "feedback": "La tenosinovitis supurativa de la vaina flexora es una urgencia quirúrgica de la mano. El diagnóstico es estrictamente clínico mediante los 4 signos cardinales de Kanavel: 1) Dedo fijado en semiflexión (actitud en gancho), 2) Tumefacción simétrica en todo el dedo (\"dedo en salchicha\"), 3) Dolor a la palpación a lo largo de toda la vaina flexora, y 4) Dolor intenso a la extensión pasiva del dedo (el signo más sensible). ⚠️ Trampa: El tratamiento es la exploración quirúrgica urgente con lavado a presión de la vaina y antibioticoterapia parenteral. El manejo retrasado provoca necrosis tendinosa e incontaminación de espacios profundos de la mano."
  },
  {
    "up": "Trauma MS",
    "q": "Un hombre de 45 años cae directamente sobre la punta del codo. La radiografía muestra una fractura transversal desplazada del olécranon con separación de los fragmentos por la tracción del músculo tríceps braquial. ¿Cuál es el principio biomecánico del tratamiento quirúrgico mediante cerclaje en obenque?",
    "options": {
      "a": "Indicación de osteosíntesis con cerclaje en obenque para convertir tracción en compresión",
      "b": "Indicación de tratamiento conservador con férula posterior de yeso a noventa grados",
      "c": "Indicación de exéresis completa del olécranon e inmovilización con vendaje de Velpeau",
      "d": "Indicación de prótesis total de codo por destrucción irreversible del aparato extensor"
    },
    "correct": "a",
    "feedback": "El olécranon forma parte del mecanismo extensor del codo sujetado por el tríceps. En fracturas transversales desplazadas, el principio biomecánico del obenque (tension band wiring) utiliza dos clavijas paralelas intraóseas y un alambre en \"8\" que neutraliza las fuerzas de tracción muscular del tríceps en la cortical posterior y las transforma en fuerzas dinámicas de compresión en la superficie articular anterior. ⚠️ Trampa: El cerclaje en obenque convierte las fuerzas de TRACCIÓN (distracción) en fuerzas de COMPRESIÓN articular durante la flexión."
  },
  {
    "up": "Trauma MS",
    "q": "Un ciclista de ruta que realiza largos trayectos consulta por hipoestesia en el 5° dedo y borde cubital del 4° dedo de la mano izquierda, asociada a debilidad al separar y aproximar los dedos. La sensibilidad en el dorso de la mano y en la eminencia hipotenar está preservada. ¿Cuál es la zona topográfica de compresión del nervio cubital?",
    "options": {
      "a": "Síndrome del túnel carpiano por compresión del nervio mediano a nivel flexor",
      "b": "Síndrome del canal de Guyon por compresión del nervio cubital en la muñeca",
      "c": "Síndrome del pronador por compresión de la rama motora del nervio mediano",
      "d": "Síndrome del canal epitroclearse por compresión del cubital en el codo"
    },
    "correct": "b",
    "feedback": "El canal de Guyon es un túnel osteofibroso en el borde cubital de la muñeca (delimitado por el pisiforme y el gancho del ganchoso). El nervio cubital discurre por él junto a la arteria ulnar. Su compresión (común en ciclistas por apoyo prolongado sobre el manubrio) adormece el 5° y mitad del 4° dedo, pero respeta la sensibilidad del dorso de la mano y de la eminencia hipotenar, ya que la rama cutánea dorsal nace 5 cm proximal a la muñeca. ⚠️ Trampa: Diferencia entre compresión en el codo (canal epitroclearse) y en la muñeca (canal de Guyon): En Guyon la sensibilidad del dorso de la mano está INTACTA porque la rama dorsal cutánea se origina antes de la muñeca."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 62 años consulta por un engrosamiento nodular indoloro en la fascia palmar de la mano derecha, con la presencia de cuerdas que generan una contractura fija en flexión de las articulaciones metacarpofalángica e interfalángica proximal del 4° y 5° dedos, impidiendo apoyar la palma plana sobre la mesa. ¿Cuál es la patología fascial subyacente y el signo de la mesa positivo?",
    "options": {
      "a": "Dedo en gatillo por tenosinovitis estenosante del flexor superficial",
      "b": "Tenosinovitis de De Quervain por atrapamiento del extensor corto",
      "c": "Enfermedad de Dupuytren por retracción fibrosa de la aponeurosis palmar",
      "d": "Ganglión articular palmar por distensión de la cápsula radiocarpiana"
    },
    "correct": "c",
    "feedback": "La enfermedad o contractura de Dupuytren es una fibromatosis benigna progresiva de la aponeurosis palmar y de los septos digitales. Comienza con nódulos subcutáneos indoloros que evolucionan a cuerdas fibrosas que traccionan las articulaciones MCF e IFP hacia la flexión fija. La prueba de Hueston (incapacidad para apoyar la mano plana sobre una mesa) confirma la deformidad funcional. ⚠️ Trampa: Dupuytren afecta la fascia palmar, NO a los tendones flexores. Los tendones flexores están sanos en su interior."
  },
  {
    "up": "Trauma MS",
    "q": "Para inmovilizar una contusión articular con esguince de la articulación interfalángica proximal del tercer dedo en la guardia, el médico del taller ortopédico decide colocar un dispositivo rígido simple utilizando un bajalenguas o lengüeta metálica espumada. ¿Cuáles son los límites anatómicos de la férula digital según las normas del taller de inmovilizaciones?",
    "options": {
      "a": "Férula antebraquiopalmar posterior incluyendo la articulación del codo",
      "b": "Yeso braquiopalmar circular con inclusión del primer dedo en oposición",
      "c": "Vendaje de Velpeau torácico fijando el codo en noventa grados de flexión",
      "d": "Férula digital desde la metacarpofalángica hasta la tercera falange"
    },
    "correct": "d",
    "feedback": "En la normativa técnica del Taller de Inmovilizaciones de la UNER, la férula digital (confeccionada con bajalenguas de madera adaptado, tablilla de aluminio espumado o valva de yeso digital) tiene como límites anatómicos desde la articulación metacarpofalángica (MCF) hasta la cara distal de la tercera falange (pulpejo) del dedo lesionado, manteniendo el dedo en posición funcional de reposo. ⚠️ Trampa: La férula digital inmoviliza exclusivamente el radio digital afectado desde la MCF hasta la interfalángica distal, sin bloquear el resto de la mano ni la muñeca."
  },
  {
    "up": "Trauma MS",
    "q": "Un trabajador de 25 años ingresa a la guardia tras sufrir un aplastamiento del antebrazo con una maquinaria pesada. Presenta edema a tensión, parestesias en los dedos y dolor intolerable desproporcionado que se exacerba a la extensión pasiva de los dedos. La medición de la presión intracompartimental revela un valor de 45 mmHg. ¿Cuál es la indicación terapéutica de urgencia y el abordaje quirúrgico indicado?",
    "options": {
      "a": "Fasciotomía quirúrgica descompresiva inmediata mediante abordaje volar longitudinal curvo de Henry",
      "b": "Inmovilización con férula braquiopalmar en extensión y administración de corticoides intravenosos a dosis altas",
      "c": "Elevación del miembro afectado sobre el nivel del corazón y aplicación de hielo local continuo durante doce horas",
      "d": "Bloqueo plexual anestésico continuo para abolición del vasoespasmo arterial sin apertura de la fascia profunda"
    },
    "correct": "a",
    "feedback": "Una presión intracompartimental superior a 30 mmHg o con una diferencia menor a 30 mmHg respecto a la presión diastólica (delta P) confirma el síndrome compartimental agudo. La elevación de la presión por encima de la perfusión capilar genera isquemia muscular y nerviosa irreversible en 6 horas. El tratamiento de elección es la fasciotomía quirúrgica descompresiva inmediata abriendo los compartimentos volar superficial y profundo mediante la incisión longitudinal curva de Henry. ⚠️ Trampa: Elevar el miembro afectado por encima del corazón está CONTRAINDICADO en el síndrome compartimental porque disminuye aún más la presión de perfusión arterial dentro del compartimento hiperpresivo."
  },
  {
    "up": "Trauma MS",
    "q": "Un varón de 30 años sufre una caída apoyando la mano con el codo en semiflexión. La radiografía muestra una fractura del tercio proximal de la diáfisis del cúbito con angulación posterior de los fragmentos, asociada a una luxación posterior de la cabeza del radio. ¿A qué subtipo de la clasificación de Bado corresponde esta lesión y cuál es la técnica quirúrgica en el adulto?",
    "options": {
      "a": "Monteggia tipo I con indicación de inmovilización conservadora mediante yeso braquiopalmar en supinación",
      "b": "Monteggia tipo II con indicación de reducción abierta y osteosíntesis de la diáfisis cubital con placa y tornillos",
      "c": "Monteggia tipo III con indicación de resección inmediata de la cúpula radial y colocación de tutor externo",
      "d": "Monteggia tipo IV con indicación de artroplastía total de codo por destrucción irreversible del aparato extensor"
    },
    "correct": "b",
    "feedback": "Según la clasificación de Bado para fracturas- luxaciones de Monteggia: Bado I (angulación anterior del cúbito y luxación anterior de cúpula radial), Bado II (angulación posterior o posterolateral del cúbito y luxación posterior/posterolateral de la cúpula radial —10-15%—), Bado III (angulación lateral y luxación lateral) y Bado IV (fractura de ambos huesos con luxación anterior de cúpula). En adultos, la estabilización rígida del cúbito con placa restaura la longitud y reduce anatómicamente la cabeza del radio en la gran mayoría de los casos. ⚠️ Trampa: En adultos, Monteggia NUNCA se trata de manera conservadora con yeso. Requiere reducción abierta y osteosíntesis del cúbito."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente intervenido quirúrgicamente hace seis meses por una fractura conminuta de cúpula radial, en donde se le realizó una exéresis aislada de la cabeza radial sin reparar la membrana interósea, consulta por dolor severo en el borde ulnar de la muñeca y pérdida de la fuerza de prensión. ¿Cuál es la complicación biomecánica secundaria producida por la pérdida del freno proximal?",
    "options": {
      "a": "Inestabilidad rotatoria posterior del codo por insuficiencia pura del ligamento colateral medial",
      "b": "Subluxación dorsal de la cabeza del radio con bloqueo completo para los movimientos de flexoextensión",
      "c": "Migración proximal del radio con discrepancia longitudinarradiocubital e impacción cubitocarpiana",
      "d": "Anquilosis ósea completa de la articulación radiocubital proximal por osificación heterotópica masiva"
    },
    "correct": "c",
    "feedback": "La cúpula radial es el estabilizador primario contra el colapso longitudinal del antebrazo y la valguización del codo. Si se realiza una resección de la cabeza radial (carcinomectomía/resagado) en presencia de una lesión inadvertida de la membrana interósea (complejo de Essex-Lopresti), el radio asciende proximalmente. Esto genera una discrepancia radiocubital con choque o chocamiento del cúbito contra el piramidal/semilunar en la muñeca (síndrome de impacción cubitocarpiana). ⚠️ Trampa: Jamás realizar la exéresis aislada de la cúpula radial sin haber verificado la integridad de la membrana interósea y de la articulación radiocubital distal."
  },
  {
    "up": "Trauma MS",
    "q": "Un joven de 26 años presenta una fractura inestable del cuello del escafoides carpiano con un desplazamiento de 2 mm y angulación del polo distal (deformidad en joroba o humpback ). ¿Cuál es la indicación terapéutica de elección para evitar el colapso carpiano en este tipo de fractura inestable?",
    "options": {
      "a": "Inmovilización con bota de yeso antebraquiopalmar incluyendo el primer dedo durante seis semanas",
      "b": "Colocación de una férula digital de Stack ininterrumpida hasta evidenciar el callo óseo en radiografías",
      "c": "Denervación articular mediante neurectomía del nervio interóseo posterior por abordaje dorsal de muñeca",
      "d": "Reducción abierta y fijación interna de compresión con tornillo canulado percutáneo tipo Herbert"
    },
    "correct": "d",
    "feedback": "Son criterios de inestabilidad en las fracturas de escafoides: desplazamiento >1 mm, angulación del polo distal >15° (deformidad en joroba o humpback), compromiso del polo proximal o diástasis interescapho-lunate asociada. Las fracturas inestables tratadas con yeso presentan una tasa de seudoartrosis mayor al 50%. La indicación precisa es la fijación interna rígida con tornillo de compresión sin cabeza tipo Herbert. ⚠️ Trampa: El tornillo de Herbert queda totalmente hundido dentro del hueso (no sobresale en la superficie articular) ejerciendo compresión interfragmentaria."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente consulta por un cuadro de tenosinovitis infecciosa del quinto dedo que evolucionó torpemente. Presenta dolor, eritema y fluctuación a la palpación en la cara volar del tercio distal del antebrazo, por encima del ligamento anular del carpo. ¿Qué espacio anatómico profundo del antebrazo se encuentra comprometido por la migración del proceso infeccioso desde la bursa cubital?",
    "options": {
      "a": "Espacio profundo de Parona situado por delante del músculo pronador cuadrado",
      "b": "Túnel carpiano flexor ubicado por detrás del retináculo extensor de la muñeca",
      "c": "Compartimento extensor dorsal ubicado dentro de la primera corredera estiloidea",
      "d": "Celda interósea posterior delimitada por la aponeurosis del supinador corto"
    },
    "correct": "a",
    "feedback": "Las bolsas sinoviales flexoras de la mano (bursa radial para el pulgar y bursa cubital para el 5° dedo) se comunican en el 80% de los individuos a nivel del carpo. Si una tenosinovitis supurativa se rompe proximalmente, la colección purulenta diseca hacia el espacio profundo de Parona, ubicado en el tercio distal del antebrazo entre el músculo pronador cuadrado por detrás y los tendones del flexor profundo por delante. ⚠️ Trampa: La tenosinovitis del 1° y 5° dedos puede comunicarse originando el \"absceso en herradura\" de la mano y disecar hacia el espacio de Parona en el antebrazo."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente sufre una herida cortante profunda en la cara anterior de la muñeca, inmediatamente proximal al pliegue palmar. Al examen físico se observa una actitud en \"garra cubital\" caracterizada por hiperextensión de la articulación metacarpofalángica y flexión de las interfalángicas del 4° y 5° dedos. ¿Por qué se produce la llamada \"paradoja cubital\" de Pollen, donde la deformidad en garra es más acentuada en lesiones distales de la muñeca que en lesiones proximales del codo?",
    "options": {
      "a": "Por parálisis aislada del abductor corto del pulgar al perder la inervación motora directa de la rama recurrente",
      "b": "Por conservación de la función del flexor profundo de los dedos que flexiona activamente las interfalángicas",
      "c": "Por contracción espástica compensatoria de los músculos extensores radiales del carpo con la muñeca neutra",
      "d": "Por abolición completa del tono muscular de la masa tenar impidiendo la aducción del primer metacarpiano"
    },
    "correct": "b",
    "feedback": "La \"paradoja cubital\" de Pollen establece que cuanto más distal es la lesión del nervio cubital, más severa y evidente es la deformidad en garra. En secciones distales (muñeca), los vientres musculares del flexor profundo de los dedos 4° y 5° (inervados en el codo) permanecen intactos; al no haber oposición de los lumbricales e interóseos paralizados, el flexor profundo flexiona potentemente las interfalángicas aumentando la garra. En lesiones proximales (codo), el FPD también se paraliza, por lo que la flexión de los dedos es menos acentuada. ⚠️ Trampa: Se llama \"paradoja\" porque una lesión sensitivo- motora más baja o distal produce una deformidad estético-funcional visualmente MÁS acentuada que una lesión alta."
  },
  {
    "up": "Trauma MS",
    "q": "En el taller de inmovilizaciones ortopédicas de la facultad, se le solicita a un estudiante confeccionar una bota de yeso para tratar una fractura no desplazada del cuerpo del escafoides carpiano en la mano dominante de un adulto. ¿Cuáles son los límites anatómicos y la posición articular que debe tener el molde según la técnica normatizada del taller?",
    "options": {
      "a": "Desde el pliegue del codo hasta la falange distal del quinto dedo con la muñeca en flexión palmar de 45°",
      "b": "Desde la axila hasta la punta de todos los dedos con la articulación del codo inmovilizada en extensión neutra",
      "c": "Desde tres centímetros por debajo del pliegue del codo hasta la interfalángica del pulgar en oposición",
      "d": "Desde el tercio medio del brazo hasta el pliegue palmar distal dejando la columna del pulgar libre"
    },
    "correct": "c",
    "feedback": "La bota o yeso para escafoides normatizado en el taller de inmovilizaciones de la UNER abarca desde 3 cm por debajo del pliegue anterior del codo (permitiendo flexión libre a 90°), se extiende por el antebrazo con la muñeca en discreta dorsiflexión (15-20°) e inclinación radial, e incluye la primera columna del pulgar en posición de oposición hasta la articulación interfalángica del pulgar, dejando libre la falange distal y los dedos 2° a 5° a nivel de los pliegues palmares. ⚠️ Trampa: No inmovilizar el codo salvo que sea una fractura inestable desplazada. El pulgar debe quedar inmovilizado en posición de \"agarrar una copa\" o \"pinza en oposición\"."
  },
  {
    "up": "Trauma MS",
    "q": "Un motociclista sufre una fractura oblicua de la diáfisis del radio a 4 cm de la articulación radiocarpiana, asociada a diástasis e inestabilidad de la articulación radiocubital distal (fractura-luxación de Galeazzi). ¿Qué estructura fibrocartilaginosa estabilizadora principal de la articulación radiocubital distal se encuentra desgarrada?",
    "options": {
      "a": "Ligamento anular de la cúpula radial a nivel de la articulación radiocubital proximal",
      "b": "Banda oblicua del retináculo extensor ubicado dentro del segundo compartimento dorsal",
      "c": "Tendón del abductor largo del pulgar en su paso por el primer túnel osteofibroso",
      "d": "Complejo del fibrocartílago triangular ubicado en el receso ulnocarpiano de la muñeca"
    },
    "correct": "d",
    "feedback": "La articulación radiocubital distal (ARCD) depende fundamentalmente de sus estabilizadores blandos. El principal estabilizador de la ARCD es el complejo del fibrocartílago triangular (CFCT), constituido por el disco articular, los ligamentos radiocubitales palmar y dorsal, y la vaina del extensor carpi ulnaris. En la lesión de Galeazzi, la traslación del radio desgarra el CFCT condicionando la luxación del cúbito. ⚠️ Trampa: Si tras la osteosíntesis del radio la ARCD persiste inestable, se debe reparar el fibrocartílago triangular o inmovilizar en supinación con clavija de Kirschner radiocubital transitoria."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente presenta una deformidad en \"ojal\" o boutonnière en el tercer dedo tras sufrir un traumatismo cerrado sobre el dorso de la articulación interfalángica proximal (IFP), mostrando flexión fija de la IFP e hiperextensión de la interfalángica distal (IFD). ¿Qué estructura del aparato extensor sufrió disrupción y qué ocurre con las bandas laterales?",
    "options": {
      "a": "Rotura de la lengüeta central del extensor con migración palmar de las bandas laterales",
      "b": "Sección completa de las bandas laterales con retracción proximal de la lengüeta central",
      "c": "Avulsión del tendón flexor superficial con luxación dorsal de la placa palmar articular",
      "d": "Desgarro de la aponeurosis del interóseo palmar con fibrosis del ligamento retinacular"
    },
    "correct": "a",
    "feedback": "La deformidad en ojal o boutonnière ocurre en la Zona III de extensores. Se inicia por la disrupción de la lengüeta o cinta central del tendón extensor sobre la cara dorsal de la articulación IFP. Al faltar la sujeción dorsal, las bandas laterales se deslazan hacia la cara palmar respecto al eje de rotación de la IFP, actuando paradójicamente como flexoras de la IFP e hiperextensoras de la IFD. ⚠️ Trampa: Diferenciar de la deformidad en cuello de cisne (hiperextensión de IFP y flexión de IFD). En el ojal: flexión de IFP e hiperextensión de IFD."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente sufre una herida profunda por vidrio en la cara volar de la muñeca. Al examen físico se constata incapacidad absoluta para realizar la oposición del pulgar contra la yema de los demás dedos y aplanamiento de la eminencia tenar. ¿Qué rama motora específica del nervio mediano se seccionó y qué músculo principal de la oposición está paralizado?",
    "options": {
      "a": "Rama motora profunda del nervio cubital con parálisis del aductor propio del pulgar",
      "b": "Rama tenar recurrente del nervio mediano con parálisis del músculo oponente del pulgar",
      "c": "Ramo interóseo posterior del nervio radial con parálisis del abductor largo del pulgar",
      "d": "Rama cutánea palmar del nervio musculocutáneo con parálisis del flexor corto profundo"
    },
    "correct": "b",
    "feedback": "La rama tenar recurrente del nervio mediano emerge del tronco principal inmediatamente distal al retináculo flexor (o atravesándolo) e inerva los músculos de la eminencia tenar externa: abductor corto, oponente y cabeza superficial del flexor corto del pulgar. Su sección abole la capacidad de oponer la yema del pulgar a los demás dedos, perdiéndose la pinza fina y atrofiando el relieve tenar (\"mano de simio\"). ⚠️ Trampa: El músculo aductor del pulgar está inervado por el nervio CUBITAL. El oponente del pulgar está inervado por la rama recurrente del MEDIANO."
  },
  {
    "up": "Trauma MS",
    "q": "Un estudiante del taller ortopédico debe confeccionar una valva de yeso para inmovilizar un esguince severo del ligamento colateral cubital de la primera articulación metacarpofalángica ( pulgar del esquiador ). ¿Cuál es la posición funcional recomendada para la columna del pulgar durante el fraguado del molde?",
    "options": {
      "a": "Adosado completamente a la cara palmar del índice en aducción máxima fija",
      "b": "En abducción radial extrema e hiperextensión de la articulación interfalángica",
      "c": "En abducción palmar ligera con la articulación en discreta flexión y oposición",
      "d": "En retroposición forzada con inclinación cubital de la articulación radiocarpiana"
    },
    "correct": "c",
    "feedback": "La inmovilización de la columna del pulgar mediante férula de Spica debe realizarse en la llamada posición funcional o neutra: la articulación trapeciometacarpiana en abducción palmar de 30-40° y oposición moderada, y la articulación metacarpofalángica en flexion ligera (10-15°). Esta posición mantiene tensionados los ligamentos colaterales previniendo su acortamiento y preservando la pinza digital. ⚠️ Trampa: Nunca inmovilizar el pulgar en aducción plana contra la palma (aducción máxima), ya que provoca contractura irreversible de la primera comisura interósea."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 29 años presenta una fractura desplazada de la diáfisis de radio y cúbito en el tercio medio. El equipo quirúrgico decide indicar osteosíntesis rígida con placas y tornillos de compresión dinámicos. ¿Por qué la fractura de la diáfisis del antebrazo en el adulto se considera una \"fractura articular\" desde el punto de vista funcional?",
    "options": {
      "a": "Porque requiere la colocación de tutores externos para prevenir la infección de partes blandas",
      "b": "Porque los trazos de fractura siempre se extienden dentro de la cavidad articular del codo",
      "c": "Porque la consolidación viciosa aumenta la fuerza de prensión de los músculos intrínsecos",
      "d": "Porque cualquier alteración del arco del radio o del eje cúbitodafisario abole la pronosupinación"
    },
    "correct": "d",
    "feedback": "El antebrazo actúa como una articulación tridimensional compleja donde el radio, provisto de una curva fisiológica prona (arco del radio), rota alrededor del eje fijo del cúbito a través de las articulaciones radiocubitales proximal y distal. Una consolidación viciosa de tan solo 10° de angulación o traslación en la diáfisis altera la tensión de la membrana interósea y bloquea mecánicamente la pronosupinación. Por ello, en el adulto, las fracturas de antebrazo requieren reducción anatómica rígida con placa, como si fuera una superficie articular. ⚠️ Trampa: En adultos, el tratamiento de las fracturas diafisarias desplazadas de radio y cúbito es SIEMPRE quirúrgico (osteosíntesis con placa de compresión)."
  },
  {
    "up": "Trauma MS",
    "q": "Al examinar a un paciente con una herida cortante en la cara palmar de la muñeca, el médico mantiene extendidos y fijos los dedos 3°, 4° y 5°, solicitando al paciente que flexione voluntariamente la articulación interfalángica proximal del 2° dedo. ¿Qué tendón flexor específico se está evaluando de manera aislada con esta maniobra semiológica?",
    "options": {
      "a": "Evaluando la integridad del tendón del flexor digitorum superficialis del segundo dedo",
      "b": "Evaluando la integridad del tendón del flexor digitorum profundus del segundo dedo",
      "c": "Evaluando la integridad de los músculos interóseos dorsales y lumbricales de la mano",
      "d": "Evaluando la integridad del tendón del flexor carpi radialis a nivel de la muñeca"
    },
    "correct": "a",
    "feedback": "El flexor digitorum superficialis (FDS) se inserta en la falange media y flexiona la articulación IFP. Los tendones del flexor digitorum profundus (FDP) nacen de un vientre muscular común (salvo para el índice que puede ser independiente); al bloquear la flexión de los demás dedos manteniendo las interfalángicas en extensión completa, se inactiva mecánicamente el FDP. La flexión activa aislada de la IFP obtenida demuestra la integridad del tendón del FDS. ⚠️ Trampa: Para evaluar el flexor PROFUNDO (FDP), se bloquea la articulación interfalángica proximal y se le pide al paciente que flexione activamente la falange distal (IFD)."
  },
  {
    "up": "Trauma MS",
    "q": "Un boxeador ingresa con dolor e impotencia en la base del primer metacarpiano. La radiografía revela una fractura intraarticular conminuta con un trazo en \"T\" que separa los fragmentos articular volar y dorsal de la diáfisis. ¿Cuál es el diagnóstico de esta lesión y la conducta quirúrgica adecuada?",
    "options": {
      "a": "Fractura de Bennett intraarticular simple con indicación de tratamiento ortopédico conservador",
      "b": "Fractura de Rolando conminuta con indicación de reducción abierta u osteosíntesis con placa",
      "c": "Fractura del quinto metacarpiano con indicación de férula digital durante tres semanas",
      "d": "Luxación trapeciometacarpiana pura con indicación de reducción cerrada y yeso colgante"
    },
    "correct": "b",
    "feedback": "La fractura de Rolando es una fractura intraarticular de la base del primer metacarpiano con minución, caracterizada por un trazo en \"T\" o \"Y\" que divide la superficie articular en fragmentos volar y dorsal. A diferencia de la fractura de Bennett (que presenta un solo fragmento articular volar), la fractura de Rolando es comúnmente inestable y conminuta, requiriendo reducción abierta y fijación con placa mini de neutralización o colocación de fijador externo dinámico. ⚠️ Trampa: Bennett = Intraarticular de 2 fragmentos (simple). Rolando = Intraarticular conminuta en \"T\" o \"Y\" (3 o más fragmentos)."
  },
  {
    "up": "Trauma MS",
    "q": "Un paciente de 42 años presenta debilidad progresiva para la extensión de las articulaciones metacarpofalángicas de los dedos de la mano derecha, sin déficit sensitivo en el dorso de la mano. Refiere dolor a la palpación en la cara posteroexterna del antebrazo. ¿Qué rama del nervio radial se encuentra comprimida al atravesar el arcada aponeurótica de Frohse?",
    "options": {
      "a": "Rama cutánea sensitiva superficial del nervio radial en la tabaquera anatómica",
      "b": "Tronco principal del nervio mediano a nivel del espacio bicipital medial del codo",
      "c": "Rama motora profunda o nervio interóseo posterior en la arcada del supinador",
      "d": "Rama profunda motora del nervio cubital en el piso de la celda hipotenar"
    },
    "correct": "c",
    "feedback": "El nervio radial se divide en el codo en una rama sensitiva superficial y una rama motora profunda (nervio interóseo posterior - NIP). El NIP atraviesa el músculo supinador corto bajo una banda aponeurótica fibrosa denominada arcada de Frohse. Su compresión (síndrome del túnel supinador) paraliza los extensores de los dedos y el cubital posterior, pero NO altera la sensibilidad del dorso de la mano, ya que la rama sensitiva discurre por la cara anterolateral del antebrazo. ⚠️ Trampa: El síndrome del nervio interóseo posterior es un atrapamiento puramente MOTOR (provoca parálisis extensora de dedos sin hipoestesia)."
  },
  {
    "up": "Trauma MS",
    "q": "Seis horas después de colocar un yeso circular braquiopalmar por una fractura de antebrazo, un paciente acude a la guardia refiriendo dolor pulsátil insoportable, parestesias y cianosis en los pulpejos de los dedos de la mano. ¿Cuál es la primera maniobra técnica impostergable que debe realizarse inmediatamente en la guardia?",
    "options": {
      "a": "Administrar vasodilatadores por vía parenteral y elevar el miembro sobre una almohada",
      "b": "Solicitar una resonancia magnética urgente para descartar tracción de la arteria humoral",
      "c": "Indicar la apertura quirúrgica inmediata del antebrazo mediante exploración fascial",
      "d": "Cortar longitudinalmente el yeso de extremo a extremo abriendo la malla y las vendas"
    },
    "correct": "d",
    "feedback": "Ante la presencia de signos de isquemia o elevación de la presión tisular bajo un yeso rígido circular, la medida de urgencia inmediata e impostergable es bivalvar o cortar bivalvadamente el yeso de extremo a extremo en sus dos caras, abriendo además la malla tubular y la guata de algodón. Esto reduce la presión intrayeso en más del 50-80%, reestableciendo el flujo sanguíneo capilar. ⚠️ Trampa: No basta con cortar únicamente la capa de yeso exterior; se debe cortar la malla tubular y el algodón subyacente hasta ver la piel del paciente en toda la longitud del molde."
  },
  {
    "up": "Trauma MS",
    "q": "Una paciente de 45 años con antecedentes de diabetes mal controlada consulta por un cuadro de 72 horas de evolución con colección purulenta a tensión bajo el repliegue ungueal lateral del tercer dedo de la mano. ¿Cuál es el diagnóstico infeccioso inicial y su tratamiento de elección?",
    "options": {
      "a": "Paroniquia o panadizo ungueal tratado mediante incisión, drenaje y antibióticos",
      "b": "Tenosinovitis supurativa tratada exclusivamente con inmovilización y amoxicilina oral",
      "c": "Erisipela del miembro superior tratada mediante fasciotomía descompresiva de urgencia",
      "d": "Granuloma piógeno tratado mediante crioterapia superficial en el consultorio externo"
    },
    "correct": "a",
    "feedback": "La paroniquia o panadizo ungueal es la infección de partes blandas más común de la mano, localizada en los repliegues cutáneos perioniquiales. Ante la presencia de una colección purulenta fluctuante a tensión, el tratamiento de elección es la evacuación quirúrgica mediante la elevación del eponiquio/pliegue lateral con hoja de bisturí, debridamiento, lavado y drenaje, complementado con antibioticoterapia contra Staphylococcus aureus. ⚠️ Trampa: Los antibióticos aislados sin drenaje quirúrgico de la colección no curan el panadizo a tensión y favorecen la necrosis del lecho ungueal o la osteomielitis de la falange distal."
  },
  {
    "up": "Trauma MS",
    "q": "Un trabajador manual de 32 años consulta por dolor progresivo en la cara dorsal de la muñeca y pérdida gradual de la fuerza de prensión. La radiografía muestra aumento de densidad (esclerosis), colapso y fragmentación del hueso semilunar. ¿Cuál es el diagnóstico de esta osteonecroopatía epónima?",
    "options": {
      "a": "Enfermedad de Preiser por osteonecrosis idiopática del hueso escafoides",
      "b": "Enfermedad de Kienböck por necrosis avascular del hueso semilunar del carpo",
      "c": "Enfermedad de Madelung por deformidad congénita de la apófisis estiloides",
      "d": "Enfermedad de Kohler por osteocondrosis de los huesos sesamoides de la mano"
    },
    "correct": "b",
    "feedback": "La enfermedad de Kienböck es la osteonecrosis avascular idiopática del hueso semilunar. Afecta típicamente a varones jóvenes dedicados a trabajos manuales pesados o con antecedente de microtraumatismos repetidos. Está favorecida anatómica y biomecánicamente por la variante cúbito minus (cúbito más corto que el radio), lo que incrementa las fuerzas de cizallamiento sobre el semilunar condiciendo a su fragmentación y colapso carpiano (DISI). ⚠️ Trampa: Preiser = Necrosis del escafoides. Kienböck = Necrosis del semilunar. Madelung = Deformidad en tridente del radio distal."
  },
  {
    "up": "Trauma MS",
    "q": "Un joven cae de una altura de tres metros apoyando la mano en hiperextensión. La radiografía de perfil estricto de muñeca muestra la concavidad del hueso semilunar desarticulada del radio y desplazada hacia la cara palmar del canal carpiano, mientras el hueso grande permanece alineado con el radio. ¿Cuál es el diagnóstico de esta emergencia traumática del carpo?",
    "options": {
      "a": "Luxación perilunar del carpo con conservación de la relación radiosemilunar",
      "b": "Subluxación escafoluzada con diastasis interescapho-lunate sin desplazamiento",
      "c": "Luxación anterior del semilunar con pérdida de la alineación radiograndesemilunar",
      "d": "Fractura-luxación de Barton palmar con cizallamiento de la estiloides radial"
    },
    "correct": "c",
    "feedback": "En la radiografía de perfil estricto de la muñeca normal, la concavidad del radio, la del semilunar y la cabeza del hueso grande forman tres copas alineadas en el mismo eje (alineación radiograndesemilunar). En la luxación anterior del semilunar (estadio IV de Mayfield), la fuerza de hiperextensión expulsa el semilunar fuera del foso radial hacia el canal carpiano (signo de la \"copa volcándose\"), mientras el hueso grande retrocede alineándose con el radio. Es una urgencia que puede provocar síndrome del túnel carpiano agudo por compresión directa del nervio mediano. ⚠️ Trampa: En la luxación PERILUNAR (estadio III), el semilunar se mantiene articulado con el radio y es el resto del carpo (hueso grande) el que se desplaza hacia dorsal. En la luxación del SEMILUNAR (estadio IV), el semilunar se luxa hacia palmar."
  },
  {
    "up": "Trauma MS",
    "q": "Durante la confección de una valva posterior de yeso braquiopalmar en el taller ortopédico, el residente debe colocar un adecuado almohadillado de guata para proteger los relieves óseos y prevenir la aparición de escaras por decúbito. ¿Qué prominencias óseas del miembro superior requieren un almohadillado estricto antes del enyesado?",
    "options": {
      "a": "Fosa cubital anterior, abductor corto del pulgar y articulaciones interfalángicas",
      "b": "Tabaquera anatómica, tubérculo del escafoides y canal del músculo pronador",
      "c": "Eminencia tenar, eminencia hipotenar y pliegue palmar distal de la mano",
      "d": "Olecranon, epicóndilo, epitróclea y apófisis estiloides del radio y del cúbito"
    },
    "correct": "d",
    "feedback": "Según los manuales de procedimientos del Taller de Inmovilizaciones de la UNER, durante la confección de cualquier molde o valva de yeso en el miembro superior, es obligatorio acolchar con almohadillado adicional de guata (soft-ban) todos los relieves óseos conspicuos: el olecranon, el epicóndilo y la epitróclea a nivel del codo, y las apófisis estiloides del radio y del cúbito a nivel de la muñeca. La falta de protección sobre estas prominencias genera decúbito y escaras iatrogénicas bajo la compresión del yeso rígido. ⚠️ Trampa: Jamás aplicar las vendas enyesadas directamente sobre la piel o sobre relieves óseos desprotegidos. Las prominencias óseas son las zonas de mayor riesgo de ulceración por presión."
  }
];
