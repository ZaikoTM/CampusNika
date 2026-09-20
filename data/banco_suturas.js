// CAMPUS NIKA — Banco Taller de Suturas (60 casos)
// Formato idéntico al del motor de examen.html: { up, q, options:{a,b,c,d}, correct, feedback }
const bancoSuturas = [
  {
    "up": "Suturas",
    "q": "Un residente de cirugía se dispone a afrontar el plano muscular y tejido subcutáneo profundo en una herida limpia de muslo. Requiere una sutura sintética multifilamento trenzada, de gran fuerza tensil inicial, que mantenga una resistencia aproximada de 2 a 3 semanas y sufra degradación fisiológica por hidrólisis sin dejar cuerpo extraño permanente. ¿Cuál es el material de sutura indicado para este plano?",
    "options": {
      "a": "Catgut cromado de origen animal digerido por proteólisis",
      "b": "Poliglactina 910 multifilamento absorbible por hidrólisis",
      "c": "Polipropileno monofilamento no absorbible inerte en piel",
      "d": "Polidioxanona monofilamento sintético de lenta absorción"
    },
    "correct": "b",
    "feedback": "La Poliglactina 910 (Vicryl®) es una sutura sintética trenzada de excelente manejo y resistencia inicial (mantiene ~60% a los 14 días). Su degradación no depende de proteólisis enzimática (como el catgut), sino de hidrólisis química predecible (completándose entre 60 y 90 días), lo que minimiza la reacción inflamatoria. ⚠️ Trampa: El Catgut se degrada por proteólisis fagocitaria dando reacciones tisulares impredecibles. El PDS es monofilamento de absorción lenta (180 días) para aponeurosis, no ideal en subcutáneo común."
  },
  {
    "up": "Suturas",
    "q": "Una paciente ingresa a la guardia con una laceración contuso-cortante profunda en la cara anterior de la tibia. Al intentar el cierre simple, los bordes tienden a la invaginación y existe tensión moderada que genera espacio muerto en el fondo de la herida. ¿Qué técnica de sutura interrupted evertora permite afrontar el plano profundo y superficial eliminando el espacio muerto?",
    "options": {
      "a": "Sutura continua anclada con monofilamento fino",
      "b": "Punto simple invaginante de tipo Lembert seroso",
      "c": "Sutura intradérmica continua con nudo sepultado",
      "d": "Punto de colchonero vertical de tipo Donatti"
    },
    "correct": "d",
    "feedback": "El punto de Donatti (colchonero vertical o \"lejos-lejos / cerca- cerca\") toma un bocado profundo que aproxima la fascia y la dermis profunda (eliminando espacios muertos) y un bocado superficial cercano al borde que asegura una eversión precisa de la epidermis sin invaginar la cicatriz. ⚠️ Trampa: Lembert es un punto invaginante exclusivo de vísceras huecas (digestivo). La sutura intradérmica no debe usarse sola bajo tensión."
  },
  {
    "up": "Suturas",
    "q": "En una intervención por hernia incisional, el equipo quirúrgico debe fijar una malla sintética de polipropileno a la aponeurosis del músculo oblicuo mayor. Se busca un hilo monofilamento no absorbible, inerte, de resistencia indefinida que no albergue bacterias. ¿Cuál es el hilo de elección para la fijación de la prótesis?",
    "options": {
      "a": "Polipropileno monofilamento azul de alta resistencia",
      "b": "Ácido poliglicólico multifilamento trenzado verde",
      "c": "Seda natural trenzada negra de alta capilaridad",
      "d": "Catgut simple monofilamento amarillo de bajo calibre"
    },
    "correct": "a",
    "feedback": "El Polipropileno (Prolene®) es un monofilamento sintético no absorbible, extremadamente inerte, que mantiene su fuerza tensil de forma indefinida y no posee capilaridad (por lo que no transporta gérmenes), siendo el estándar de oro para fijar prótesis sintéticas (mallas de hernia) y en cirugía vascular. ⚠️ Trampa: La seda es trenzada natural con alta capilaridad (contraindicada junto a mallas por riesgo de infección crónica y rechazo). El Vicryl se absorbe y provocaría el desprendimiento de la malla a los dos meses."
  },
  {
    "up": "Suturas",
    "q": "Durante una laparotomía exploradora por traumatismo abdominal cerrado, se realiza la enterorrafia de una perforación en el intestino delgado. El cirujano requiere una aguja que atraviese la mucosa y seromuscular delicada sin seccionar ni desgarrar el tejido visceral. ¿Qué tipo de aguja según la sección transversal de su punta está indicada?",
    "options": {
      "a": "Aguja triangular cortante de un tercio de círculo",
      "b": "Aguja reverso-cortante de tres octavos de círculo",
      "c": "Aguja cónica ahusada de medio círculo sin filo",
      "d": "Aguja espatulada plana de un cuarto de círculo"
    },
    "correct": "c",
    "feedback": "Las suturas gastrointestinales y de vísceras huecas exigen agujas cónicas (round body / cilíndricas) que dilatan las fibras musculares y mucosas al pasar, sin cortar ni seccionar el tejido, lo que evita desgarros y fugas anastomóticas. ⚠️ Trampa: Las agujas cortantes o triangulares se reservan para tejidos duros como la piel o la aponeurosis; si se usan en el intestino, provocan desgarros y dehiscencia seromuscular."
  },
  {
    "up": "Suturas",
    "q": "Al efectuar el cierre de una aponeurosis abdominal sometida a cierta tensión, el cirujano advierte que el primer nudo simple tiende a deslizarse y aflojarse antes de poder cruzar la segunda lazada de fijación. ¿Qué técnica de nudo manual o instrumentado previene este aflojamiento inicial?",
    "options": {
      "a": "Nudo simple incompleto de una sola asa rápida",
      "b": "Nudo de cirujano con doble lazada de fricción",
      "c": "Nudo deslizante de dos unidades en sentido idéntico",
      "d": "Nudo cuadrado instrumentado de una sola vuelta"
    },
    "correct": "b",
    "feedback": "El nudo de cirujano inicia con una doble lazada en la primera seminudo (dos vueltas del hilo). Esta fricción incrementada mantiene enfrentados los bordes bajo tensión mientras el operador prepara la segunda seminudo en sentido opuesto (en espejo) para cuadrarlo. ⚠️ Trampa: El nudo deslizante (\"abuelita\") se hace repitiendo lazadas en la misma dirección y se corre bajo tensión. El nudo simple de una vuelta no retiene tensión."
  },
  {
    "up": "Suturas",
    "q": "Durante el cierre de un muñón apendicular o el sepultamiento de una sutura gástrica, se requiere realizar un punto seromuscular separado que logre la invaginación limpia de la serosa. ¿Cuál es el punto de sutura invaginante seroseroso o seromuscular característico?",
    "options": {
      "a": "Punto de Lembert seromuscular invaginante",
      "b": "Punto de Smead-Jones para aponeurosis",
      "c": "Punto de Donatti evertor de piel profunda",
      "d": "Punto de Halsted evertor de subcutáneo"
    },
    "correct": "a",
    "feedback": "El punto de Lembert es una sutura seromuscular interrumpida o continua que toma la serosa y la capa muscular sin penetrar la mucosa. Al anudarse, produce la invaginación y enfrentamiento sero-seroso, principio clave para lograr la hemostasia y el sello de fibrina rápido en la cirugía digestiva. ⚠️ Trampa: Donatti es evertor para piel. Smead-Jones es un punto de retención aponeurótico de alta resistencia."
  },
  {
    "up": "Suturas",
    "q": "Se planifica el cierre de la aponeurosis en una laparotomía media en un paciente diabético y obeso. Se busca una sutura absorbible monofilamento de degradación muy lenta que mantenga más del 50% de su fuerza tensil a la cuarta semana. ¿Qué material de sutura satisface estos requisitos de soporte prolongado?",
    "options": {
      "a": "Catgut cromado de absorción enzimática rápida",
      "b": "Poliglactina 910 que pierde resistencia a los 14 días",
      "c": "Seda multifilamento natural de elevada capilaridad",
      "d": "Polidioxanona monofilamento de absorción lenta"
    },
    "correct": "d",
    "feedback": "La Polidioxanona (PDS®) es un monofilamento sintético absorbible de muy lenta degradación por hidrólisis. Retiene ~70% de su fuerza tensil a las 2 semanas y ~50% a las 4 semanas, absorbiéndose completamente recién hacia los 180 días. Es ideal para fascias de lenta cicatrización en pacientes con factores de riesgo de evisceración. ⚠️ Trampa: La Poliglactina 910 (Vicryl) pierde la mayor parte de su resistencia a los 21 días, siendo insuficiente para una pared abdominal de riesgo."
  },
  {
    "up": "Suturas",
    "q": "Ingresa un paciente con una herida contusa sucia por mordedura de perro en la pierna de 36 horas de evolución, con edema, detritos y signos de infección incipiente. ¿Cuál es la conducta y el tipo de cierre indicado tras la limpieza quirúrgica?",
    "options": {
      "a": "Cierre primario inmediato en un solo plano con nylon",
      "b": "Cierre por segunda intención con injerto de piel",
      "c": "Cierre primario retardado o por tercera intención",
      "d": "Cierre por primera intención previa sutura en X"
    },
    "correct": "c",
    "feedback": "Las heridas muy contaminadas, con más de 12-24 horas de evolución, o por mordeduras no deben cerrarse de entrada por el alto riesgo de flemones o anaerobiosis. Se realiza debridamiento (Friedrich), curaciones periódicas por 3 a 5 días y, al verificar tejido de granulación limpio, se efectúa el cierre primario retardado (tercera intención). ⚠️ Trampa: Nunca suturar de entrada (primera intención) una herida infectada o por mordedura evolucionada. La segunda intención implica dejar cicatrizar solo por granulación sin suturar jamás."
  },
  {
    "up": "Suturas",
    "q": "Un niño de 4 años presenta una herida incisa lineal limpia de 1,5 cm en el pómulo que no está sometida a tensión. Para evitar el dolor de la infiltración anestésica y la ansiedad de las agujas, se opta por un método de síntesis atraumático. ¿Qué producto es adecuado para el cierre de esta herida superficial?",
    "options": {
      "a": "Adhesivo tisular de 2-octil cianoacrilato",
      "b": "Puntos separados de seda negra 3-0 con aguja cónica",
      "c": "Sutura continua de catgut simple 2-0 con aguja plana",
      "d": "Puntos de colchonero horizontal con prolene 2-0"
    },
    "correct": "a",
    "feedback": "El 2-octil cianoacrilato (Dermabond®) es un polímero líquido que se aplica en la superficie epidérmica (nunca dentro de la herida) en laceraciones lineales, limpia y sin tensión. Forma una película flexible e impermeable que desprende espontáneamente en 5 a 10 días con excelente resultado estético y sin requerir anestesia infiltrativa ni retiro de puntos. ⚠️ Trampa: Está contraindicado aplicar el pegamento dentro de la brecha o en heridas sometidas a tensión o flexión articular."
  },
  {
    "up": "Suturas",
    "q": "Al suturar la piel de la palma de la mano o de la planta del pie donde la dermis es gruesa y resistente, se requiere una aguja que penetre el tejido fibroso sin que el Filo corte hacia la herida provocando desgarros. ¿Qué geometría de aguja cortante es la más segura para la piel resistente?",
    "options": {
      "a": "Aguja cónica ahusada atraumática con punta roma",
      "b": "Aguja reverso-cortante con filo en el borde externo",
      "c": "Aguja espatulada oftálmica con doble bisel lateral",
      "d": "Aguja trocar con punta de diamante sin filo del cuerpo"
    },
    "correct": "b",
    "feedback": "En las agujas reverso-cortantes (reverse cutting), el tercer filo cortante triangular se ubica en la curvatura convexa externa de la aguja. Esto evita que al traccionar el hilo para anudar, el borde filoso corte hacia el margen de la herida (lo que ocurriría con una aguja cortante convencional con filo interno), reduciendo el riesgo de desgarro en pieles resistentes. ⚠️ Trampa: Las agujas cónicas se deslizan en piel dura produciendo doblando de la aguja. Las espatuladas son para córnea e intrancular."
  },
  {
    "up": "Suturas",
    "q": "En los consensos actuales de técnica quirúrgica, la sutura de Catgut (simple o cromado) ha caído en desuso para el cierre de pared abdominal y piel. ¿Cuál es el motivo fisiopatológico principal de su reemplazo por sintéticos?",
    "options": {
      "a": "Por su resistencia indefinida que genera granulomas",
      "b": "Por su hidrólisis rápida en presencia de bilis o pus",
      "c": "Por su memoria elástica que dificulta el anudado",
      "d": "Por su reacción inflamatoria y reabsorción variable"
    },
    "correct": "d",
    "feedback": "El Catgut se obtiene de la submucosa del intestino de oveja o serosa de buey (proteína animal). Su degradación ocurre por digestión enzimática fagocitaria, lo que desencadena una intensa reacción inflamatoria a cuerpo extraño. Además, en presencia de infección, pus o bilis, la reabsorción se acelera de forma impredecible, perdiendo resistencia precozmente. ⚠️ Trampa: El Catgut NO es sintético ni se degrada por hidrólisis. Su causa de reemplazo es la reacción proteica y la impredecibilidad de su fuerza tensil."
  },
  {
    "up": "Suturas",
    "q": "Una paciente joven consulta por una incisión laparoscópica limpia en la región umbilical. Para optimizar el resultado estético, se decide utilizar un cierre continuo intradérmico. ¿Qué técnica y material se emplean para este cierre subcuticular?",
    "options": {
      "a": "Punto discontinuo de Smead-Jones con acero",
      "b": "Sutura continua anclada de seda multifilamento",
      "c": "Sutura intradérmica continua con monofilamento",
      "d": "Puntos separados en U con polipropileno grueso"
    },
    "correct": "c",
    "feedback": "La sutura subcuticular continua pasa horizontalmente por la dermis profunda paralela a la piel, aproximando los bordes epidérmicos sin atravesar la capa córnea externa. Al utilizar un monofilamento (ej. Nylon o Monocryl), se evita la marca en \"escalera de mano\" de las punciones externas, obteniendo el mejor resultado cosmético. ⚠️ Trampa: La seda es multifilamento y genera reacción y marcas marcas si se usa en piel. Smead-Jones es para aponeurosis."
  },
  {
    "up": "Suturas",
    "q": "En la profundización de un abordaje de laparotomía, se produce el sangrado activo de un vaso arterial de mayor calibre en la aponeurosis que no se controla con electrocauterio. ¿Qué técnica de hemostasia por sutura fija el vaso al tejido adyacente para evitar su deslizamiento?",
    "options": {
      "a": "Punto hemostático transfictivo o en figura de 8",
      "b": "Punto invaginante seromuscular de tipo Connell",
      "c": "Sutura continua subcuticular con nudo externo",
      "d": "Punto simple invaginante de tipo Cushing"
    },
    "correct": "a",
    "feedback": "El punto transfictivo (o en X / figura de 8) atraviesa el tejido vecino antes de rodear el vaso sangrante o la base del tejido fibroso. Esto ancla la ligadura al parénquima impidiendo que la pulsación arterial o la tracción deslicen el nudo fuera del cabo vascular. ⚠️ Trampa: Connell y Cushing son puntos continuos invaginantes para cirugía gastrointestinal."
  },
  {
    "up": "Suturas",
    "q": "Un cirujano necesita fijar temporalmente un tubo de drenaje pleural a la piel del tórax. Desea un hilo de excelente manejabilidad y anudado firme que no se deslice, pero comprende que no debe usarse en profundidades infectadas por su capilaridad. ¿Qué material de sutura cumple con estas características clásicas?",
    "options": {
      "a": "Polipropileno monofilamento no absorbible",
      "b": "Seda natural multifilamento no absorbible",
      "c": "Polidioxanona monofilamento absorbible",
      "d": "Catgut cromado multifilamento absorbible"
    },
    "correct": "b",
    "feedback": "La seda es una proteína natural trenzada de inigualable flexibilidad y docilidad, lo que permite realizar nudos extremadamente firmes que no se aflojan. Por esta razón se usa para fijar drenajes a la piel. Sin embargo, su estructura trenzada presenta alta capilaridad y reactividad, por lo que está contraindicada en suturas profundas con riesgo de infección. ⚠️ Trampa: El prolene es monofilamento deslizante que requiere más nudos para fijar drenajes. El catgut se absorbe y pierde el drenaje."
  },
  {
    "up": "Suturas",
    "q": "Una herida longitudinal en el antebrazo presenta bordes deprimidos e invertidos tras la colocación de puntos simples. ¿Qué técnica de sutura interrumpida está diseñada para lograr la eversión de los bordes y controlar la hemostasia del borde cutáneo?",
    "options": {
      "a": "Punto de Lembert seromuscular invaginante",
      "b": "Punto de Connell continuo invaginante",
      "c": "Punto en U o colchonero horizontal evertor",
      "d": "Punto de Smead-Jones para aponeurosis"
    },
    "correct": "c",
    "feedback": "El punto de colchonero horizontal (o punto en U) distribuye la tensión paralela a la herida y eavierte de forma natural los bordes cutáneos. Además, posee un fuerte efecto hemostático sobre los bordes sangrantes de la incisión. ⚠️ Trampa: Lembert y Connell son invaginantes. Smead-Jones se usa para aponeurosis abdominal en puntos separados gruesos."
  },
  {
    "up": "Suturas",
    "q": "Al utilizar materiales monofilamentos sintéticos como el polipropileno (Prolene) o nylon, se debe prestar especial atención a la confección de los nudos. ¿Qué complicación técnica ocurre si se realizan nudos imperfectos o deslizantes en hilos con alta memoria elástica?",
    "options": {
      "a": "Desgarro transectante inmediato de la dermis",
      "b": "Reacción inflamatoria por cuerpo extraño acelerada",
      "c": "Necrosis avascular de los bordes suturados",
      "d": "Deslizamiento y falla de la hemostasia o cierre"
    },
    "correct": "d",
    "feedback": "Los hilos monofilamentos sintéticos (Prolene®, Nylon®) poseen rigidez y \"memoria elástica\" (tendencia a volver a su forma recta original). Si los nudos se realizan como nudos deslizantes o se efectúan menos de 4 a 6 seminudos cruzados, el nudo se deshace bajo la tensión tisular, provocando dehiscencia o sangrado. ⚠️ Trampa: La memoria elástica no causa necrosis ni infección por sí misma, sino el aflojamiento y apertura del nudo."
  },
  {
    "up": "Suturas",
    "q": "Una paciente de 28 años evoluciona en el posoperatorio de una exéresis de nevus facial sin complicaciones. La herida fue suturada con monofilamento 5-0. ¿En qué plazo temporal deben retirarse las suturas cutáneas en la cara para prevenir marcas permanentes de los puntos?",
    "options": {
      "a": "Retiro precoz entre los 3 y 5 días del posoperatorio",
      "b": "Retiro tardío entre los 10 y 14 días del posoperatorio",
      "c": "Retiro diferido entre los 15 y 21 días del posoperatorio",
      "d": "Retiro prolongado a los 30 días con control ambulatorio"
    },
    "correct": "a",
    "feedback": "La piel de la cara y cuello posee excelente vascularización, lo que acelera la primera fase de cicatrización. El retiro precoz de los puntos (3 a 5 días) previene la epitelización de los trayectos de punción (marcas en escalera de mano o quistes de inclusión), logrando el mejor resultado cosmético. En miembros o tronco se retiran a los 7-10 días, y en manos o zonas de tensión a los 10-14 días. ⚠️ Trampa: Dejar los puntos más de 7 días en cara causa marcas de sutura permanentes e inestéticas."
  },
  {
    "up": "Suturas",
    "q": "Para realizar la síntesis cutánea con técnica aséptica adecuada, el cirujano solicita el instrumental quirúrgico básico de prensión y maniobra de la aguja. ¿Cuál es la pareja de instrumentos quirúrgicos indispensable para esta maniobra?",
    "options": {
      "a": "Pinza de Pean y tijera de Metzenbaum fina",
      "b": "Pinza de Kocher con dientes y bisturí 24",
      "c": "Portaagujas Mayo-Hegar y pinza de disección",
      "d": "Pinza de Halsted mosquito y separador Farabeuf"
    },
    "correct": "c",
    "feedback": "La técnica de síntesis exige tomar la aguja en la unión de su tercio medio y posterior con la punta del portaagujas Mayo-Hegar, mientras se estabiliza y eavierte el borde del tejido con una pinza de disección (con dientes para piel, anatómica sin dientes para mucosas/visceras). ⚠️ Trampa: La pinza de Kocher es traumática para prensión de bordes cutáneos delgados. La pinza Pean es hemostática no diseñada para agujas."
  },
  {
    "up": "Suturas",
    "q": "Al cerrar una herida limpia en el dorso o miembros inferiores en la guardia, se busca un hilo no absorbible sintético de monofilamento, de baja reactividad tisular, económico y seguro. ¿Cuál es el material estándar de elección para la piel en estas regiones?",
    "options": {
      "a": "Poliglactina 910 multifilamento Violeta",
      "b": "Nylon o poliamida monofilamento sintético",
      "c": "Catgut simple natural multifilamento",
      "d": "Polidioxanona monofilamento sintética"
    },
    "correct": "b",
    "feedback": "El Nylon (Poliamida monofilamento) es el estándar sintético para la sutura de piel por su elevada fuerza tensil, suavidad de paso tisular, mínima reacción inflamatoria, nula capilaridad y bajo costo comparativo. ⚠️ Trampa: El Vicryl en piel deja marcas e irritación y puede infectarse si los puntos quedan expuestos a la superficie."
  },
  {
    "up": "Suturas",
    "q": "Durante el cierre de una laparotomía mediana, se procede a la aproximación del tejido celular subcutáneo espeso para prevenir la formación de seromas y eliminar el espacio muerto. ¿Qué técnica y material se recomiendan para este plano subcutáneo?",
    "options": {
      "a": "Puntos evertores en U con seda trenzada gruesa",
      "b": "Sutura continua de acero quirúrgico no absorbible",
      "c": "Puntos invaginantes de Lembert con polipropileno",
      "d": "Puntos separados de Vicryl con nudo invertido"
    },
    "correct": "d",
    "feedback": "Para aproximar el tejido celular subcutáneo espeso, se emplean puntos separados absorbibles (Poliglactina 910 / Vicryl 3-0 o 4-0) aplicados con técnica de nudo invertido o sepultado (de profundo a superficial y de superficial a profundo). Esto entierra la lazada en el fondo del plano evitando que el nudo extruya o irrite la dermis. ⚠️ Trampa: La seda no debe dejarse en subcutáneo por riesgo de granuloma y fístula de hilo. El acero no se utiliza en subcutáneo."
  },
  {
    "up": "Suturas",
    "q": "Durante una gastrostomía o gastrorrafia, el residente realiza una sutura continua invaginante de la pared gástrica en la cual la aguja penetra todas las capas del órgano, incluyendo la mucosa. ¿Cómo se denomina esta técnica de sutura continua invaginante transfixiante?",
    "options": {
      "a": "Sutura continua invaginante seromuscular de Cushing",
      "b": "Sutura continua invaginante transfixiante de Connell",
      "c": "Sutura discontinua evertora profunda de Halsted",
      "d": "Sutura continua intradérmica invaginante de Parker"
    },
    "correct": "b",
    "feedback": "La sutura de Connell es una sutura continua invaginante que abarca todas las capas de la pared visceral (transfixiante / perforante, atravesando mucosa, submucosa, muscular y serosa). Logra hemostasia de la mucosa e invaginación de los bordes. Se diferencia de la sutura de Cushing en que esta última es continua e invaginante pero seromuscular (no perforante). ⚠️ Trampa: No confundir Connell (transfixiante/perforante) con Cushing (seromuscular/no perforante). Ambas son continuas e invaginantes."
  },
  {
    "up": "Suturas",
    "q": "En una colectomía izquierda programada, el cirujano necesita realizar la transección del colon y el sellado lineal de ambos extremos con grapas de titanio, cortando simultáneamente el tejido entre las líneas de engrapado. ¿Qué instrumento mecánico de sutura realiza el engrapado y corte simultáneo?",
    "options": {
      "a": "Engrapadora lineal cortante de tipo GIA",
      "b": "Engrapadora lineal no cortante de tipo TA",
      "c": "Engrapadora intraluminal circular tipo CEEA",
      "d": "Engrapadora de ligadura vascular de tipo LDS"
    },
    "correct": "a",
    "feedback": "La engrapadora lineal cortante GIA (Gastrointestinal Anastomosis) coloca dos hileras dobles de grapas de titanio escalonadas y avanza simultáneamente una cuchilla central que divide el tejido entre ambas hileras, permitiendo realizar la transección o la confección de anastomosis laterales de forma rápida y hermética. ⚠️ Trampa: La engrapadora TA (Thoracoabdominal) es lineal pero NO cortante (solo engrapa sin cortar). La CEEA es circular intraluminal."
  },
  {
    "up": "Suturas",
    "q": "Durante la fase de proliferación y posterior remodelación de una herida quirúrgica limpia, los fibroblastos sintetizan inicialmente un tipo de colágeno inmaduro que progresivamente es reemplazado por otro de mayor fuerza tensil. ¿Cuál es la secuencia fisiológica de sustitución del colágeno en la cicatrización?",
    "options": {
      "a": "Sustitución progresiva de Colágeno Tipo I por Colágeno Tipo II",
      "b": "Sustitución progresiva de Colágeno Tipo IV por Colágeno Tipo III",
      "c": "Sustitución progresiva de Colágeno Tipo III por Colágeno Tipo I",
      "d": "Sustitución progresiva de Colágeno Tipo II por Colágeno Tipo IV"
    },
    "correct": "c",
    "feedback": "En la fase proliferativa temprana (días 3 a 14), los fibroblastos sintetizan predominantemente Colágeno Tipo III (reticular, inmaduro, de fibras delgadas y baja resistencia). Durante la fase de remodelación o maduración (a partir de la tercera semana), el Colágeno Tipo III es reabsorbido por colagenasas y reemplazado por Colágeno Tipo I (maduro, organizado en haces gruesos y con enlaces cruzados covalentes), el cual otorga la verdadera fuerza tensil a la cicatriz. ⚠️ Trampa: El colágeno embrionario inicial es el Tipo III, no el I ni el IV. El colágeno maduro definitivo de la piel y aponeurosis es el Tipo I."
  },
  {
    "up": "Suturas",
    "q": "Un trabajador sufre una laceración lineal contuso-cortante en la cara posterior de la rodilla (superficie de extensión articular), la cual fue suturada en la guardia con nylon monofilamento 3-0. ¿Cuál es el período de tiempo adecuado para el retiro de los puntos en esta región para evitar la dehiscencia?",
    "options": {
      "a": "Retiro precoz de los puntos entre los 3 y 5 días",
      "b": "Retiro estándar de los puntos entre los 6 y 8 días",
      "c": "Retiro diferido de los puntos entre los 9 y 11 días",
      "d": "Retiro tardío de los puntos entre los 12 y 14 días"
    },
    "correct": "d",
    "feedback": "Las heridas ubicadas en zonas de alta tensión mecánica, sobre articulaciones en flexoextensión (rodilla, codo), en la espalda o en las plantas de los pies requieren mantener la sutura entre 12 y 14 días. Retirar los puntos antes en estas zonas conduce inevitablemente a la dehiscencia de la herida debido a la tracción constante que supera la fuerza tensil incipiente de la cicatriz (que a los 7 días es menor al 10%). ⚠️ Trampa: El retiro a los 3-5 días es exclusivo de la cara y el cuello. Retirar a los 7 días en una rodilla es una causa común de dehiscencia posoperatoria en guardia."
  },
  {
    "up": "Suturas",
    "q": "Durante el cierre por planos de una laparotomía mediana, se selecciona la calibración de las suturas según el sistema USP para la aponeurosis, el tejido celular subcutáneo y la piel. ¿Qué combinación estandarizada de calibres es la correcta para estos tres planos?",
    "options": {
      "a": "Aponeurosis 4-0, Subcutáneo 1-0 y Piel calibre 0",
      "b": "Aponeurosis 1 o 0, Subcutáneo 3-0 y Piel 4-0 o 5-0",
      "c": "Aponeurosis 5-0, Subcutáneo 2-0 y Piel calibre 1",
      "d": "Aponeurosis 3-0, Subcutáneo 0 y Piel calibre 2-0"
    },
    "correct": "b",
    "feedback": "La calibración del hilo sigue la norma internacional USP (a mayor número con cero, menor es el diámetro del hilo). La aponeurosis requiere calibres gruesos (USP 1 o 0) para soportar la presión intraabdominal; el tejido celular subcutáneo se afronta con hilos finos absorbibles (USP 3-0 o 4-0) para evitar masa de cuerpo extraño; y la piel se cierra con monofilamentos finos (USP 4-0 o 5-0) para un mejor resultado estético. ⚠️ Trampa: Cuanto más ceros tiene el hilo (ej. 5-0 vs 1-0), MÁS FINO es. Calibre 1- 0 es más grueso que 4-0."
  },
  {
    "up": "Suturas",
    "q": "Al comparar las propiedades biomecánicas de las suturas continuas frente a las discontinuas (puntos separados) en el cierre aponeurótico de urgencia: ¿Cuál es la propiedad característica de los puntos separados ante la dehiscencia parcial o infección local?",
    "options": {
      "a": "Mantiene la integridad del cierre si se rompe o infecta un punto aislado",
      "b": "Distribuye la tensión de manera totalmente uniforme en toda la línea incisional",
      "c": "Requiere menor tiempo quirúrgico de ejecución y consume menos material de sutura",
      "d": "Permite la eversión espontánea de los bordes sin necesidad de tracción manual"
    },
    "correct": "a",
    "feedback": "La gran ventaja biomecánica de la sutura discontinua (puntos separados) es la seguridad individual de los nudos: si un punto se corta, se afloja o debe retirarse por una infección localizada, el resto de la línea incisional permanece afrontada e intacta. Su desventaja es que consume más tiempo y material. ⚠️ Trampa: La distribución uniforme de la tensión y la rapidez de ejecución son ventajas de la sutura CONTINUA, no de los puntos separados."
  },
  {
    "up": "Suturas",
    "q": "Un cirujano evalúa la resistencia mecánica de una cicatriz abdominal a las 3 semanas (21 días) del posoperatorio en comparación con la resistencia de la piel sana previa a la incisión. ¿Qué porcentaje aproximado de la fuerza tensil original ha recuperado la cicatriz a los 21 días?",
    "options": {
      "a": "Aproximadamente el 5% de la fuerza tensil previa",
      "b": "Aproximadamente el 10% de la fuerza tensil previa",
      "c": "Aproximadamente el 20% de la fuerza tensil previa",
      "d": "Aproximadamente el 80% de la fuerza tensil previa"
    },
    "correct": "c",
    "feedback": "A la primera semana posoperatoria, la fuerza tensil de la herida es de apenas un 3-5%. A las 3 semanas (21 días, final de la fase proliferativa e inicio de la remodelación), alcanza aproximadamente un 20% de la resistencia de la piel sana. Hacia el tercer mes alcanza un 70-80%, límite máximo alcanzable por una cicatriz madura. ⚠️ Trampa: Creer que a las 3 semanas la herida ya tiene el 80% de resistencia es un error grave que conduce a eventos de evisceración por esfuerzo precoz."
  },
  {
    "up": "Suturas",
    "q": "En una enterorrafia en dos planos, el cirujano efectúa el plano seromuscular externo invaginante mediante puntos separados que toman la serosa y la muscular sin atravesar la mucosa. ¿Qué técnica de punto separado invaginante no perforante es la indicada para este plano?",
    "options": {
      "a": "Punto continuo invaginante perforante de Connell",
      "b": "Punto de colchonero vertical evertor de Donatti",
      "c": "Punto seromuscular continuo transfixiante de Cushing",
      "d": "Punto separado invaginante seromuscular de Lembert"
    },
    "correct": "d",
    "feedback": "El punto de Lembert separado es la sutura seromuscular invaginante clásica para el segundo plano (plano de refuerzo) en anastomosis digestivas o en la invaginación de divertículos o perforaciones. Toma la serosa y la muscular sin penetrar la mucosa (no perforante), logrando el contacto íntimo sero- seroso. ⚠️ Trampa: Donatti es evertor en piel. Connell y Cushing son continuos. Halsted es colchonero horizontal."
  },
  {
    "up": "Suturas",
    "q": "Durante una resección anterior baja de recto por adenocarcinoma, se realiza la anastomosis colorrectal mecánica intraluminal termino-terminal. ¿Qué tipo de engrapadora mecánica circular se utiliza para confeccionar esta anastomosis?",
    "options": {
      "a": "Engrapadora lineal cortante de doble hilera tipo GIA",
      "b": "Engrapadora intraluminal circular de titanio tipo CEEA",
      "c": "Engrapadora lineal de oclusión vascular tipo TA",
      "d": "Engrapadora de clips metálicos hemostáticos tipo Hemoclip"
    },
    "correct": "b",
    "feedback": "La engrapadora intraluminal circular CEEA / EEA (Circular End- to-End Anastomosis) está diseñada específicamente para anastomosis termino- terminales o termino-laterales en órganos tubulares (esófago, recto, colon). Coloca una doble hilera circular de grapas de titanio y posee una cuchilla cilíndrica central que secciona el exceso de tejido creando la luz anastomótica. ⚠️ Trampa: La GIA es lineal cortante (para anastomosis laterales). La TA es lineal no cortante (para muñones)."
  },
  {
    "up": "Suturas",
    "q": "Un paciente ingresa por guardia con una herida cortante en el cuero cabelludo que requirió debridamiento y sutura con monofilamento 3-0. ¿Cuál es el tiempo adecuado para el retiro de los puntos en el cuero cabelludo?",
    "options": {
      "a": "Retiro de puntos entre los 7 y 10 días",
      "b": "Retiro de puntos entre los 3 y 4 días",
      "c": "Retiro de puntos entre los 15 y 18 días",
      "d": "Retiro de puntos entre los 21 y 25 días"
    },
    "correct": "a",
    "feedback": "En el cuero cabelludo, debido a la tensión moderada de la galea aponeurótica y el grosor cutáneo, el retiro de puntos se normatiza entre los 7 y 10 días posoperatorios. ⚠️ Trampa: Retirar a los 3-5 días en cuero cabelludo genera dehiscencia por tensión de la galea; dejar más de 12 días favorece la infección de los folículos pilosos."
  },
  {
    "up": "Suturas",
    "q": "Un cirujano realiza el cierre seromuscular continuo invaginante de una enterotomía sin atravesar la mucosa intestinal. ¿Cómo se denomina esta sutura continua invaginante no transfixiante?",
    "options": {
      "a": "Sutura continua invaginante perforante de Connell",
      "b": "Sutura discontinua evertora cutánea de Donatti",
      "c": "Sutura continua invaginante seromuscular de Cushing",
      "d": "Sutura discontinua de retención masiva de Smead-Jones"
    },
    "correct": "c",
    "feedback": "La sutura de Cushing es una técnica continua e invaginante que corre paralela al eje de la incisión, tomando la capa seromuscular sin penetrar la mucosa (no perforante o no transfixiante). Se diferencia de la sutura de Connell en que esta última sí atraviesa todas las capas incluyendo la mucosa. ⚠️ Trampa: Connell = Perforante/Transfixiante. Cushing = No perforante/Seromuscular."
  },
  {
    "up": "Suturas",
    "q": "Durante una gastrectomía subtotal, el equipo quirúrgico requiere ocluir linealmente el muñón duodenal antes de realizar la sección manual con bisturí, sin cortar mecánicamente la víscera. ¿Qué engrapadora mecánica realiza la oclusión lineal mediante grapas de titanio sin hoja de corte integrada?",
    "options": {
      "a": "Engrapadora intraluminal circular de tipo CEEA",
      "b": "Engrapadora lineal cortante con cuchilla tipo GIA",
      "c": "Engrapadora de ligadura y transección tipo LDS",
      "d": "Engrapadora lineal de oclusión no cortante tipo TA"
    },
    "correct": "d",
    "feedback": "La engrapadora TA (Thoracoabdominal) es una engrapadora lineal de oclusión que aplica una doble o triple hilera de grapas de titanio en forma de \"B\" invertida para cerrar muñones víscerales o vasculares (como el muñón duodenal o el parénquima pulmonar), sin realizar la sección del tejido (carece de cuchilla). ⚠️ Trampa: La GIA sí tiene cuchilla e integra el corte. La TA solo engrapa y requiere que el cirujano corte con bisturí por arriba de la línea de grapas."
  },
  {
    "up": "Suturas",
    "q": "Un paciente consulta a los 12 meses de una laparotomía preguntando si su cicatriz alcanzará exactamente la misma resistencia elástica y tensil que tenía su piel antes de la cirugía. ¿Cuál es el porcentaje máximo de fuerza tensil que logra alcanzar una cicatriz madura respecto a la piel sana?",
    "options": {
      "a": "Alcanza aproximadamente un 50% de la fuerza previa",
      "b": "Alcanza aproximadamente un 80% de la fuerza previa",
      "c": "Alcanza exactamente un 100% de la fuerza previa",
      "d": "Alcanza aproximadamente un 120% de la fuerza previa"
    },
    "correct": "b",
    "feedback": "Una cicatriz madura completa su fase de remodelación al año del traumatismo o incisión, pero NUNCA recupera el 100% de la resistencia elástica ni de la fuerza tensil de la piel sana no lesionada. El límite fisiológico máximo de recuperación de la fuerza tensil en una matriz cicatrizal es de aproximadamente un 70% a 80%. ⚠️ Trampa: La cicatriz quirúrgica jamás vuelve a tener el 100% de la fuerza original de la piel previa."
  },
  {
    "up": "Suturas",
    "q": "Al realizar un cierre aponeurótico mediante una sutura continua (surget), el cirujano evalúa el riesgo biomecánico si el hilo se rompe o se afloja en un extremo. ¿Cuál es la principal desventaja biomecánica de la sutura continua?",
    "options": {
      "a": "La rotura del hilo en cualquier punto compromete toda la línea de cierre",
      "b": "Requiere la colocación de un mayor número de nudos en el trayecto",
      "c": "Genera una mayor reacción inflamatoria por aumento de cuerpo extraño",
      "d": "Produce la eversión permanente de los bordes impidiendo la cicatrización"
    },
    "correct": "a",
    "feedback": "La sutura continua (surget) se mantiene por la tensión transmitida a lo largo de un único hilo corrido desde el nudo inicial hasta el final. Si el hilo se corta, se desanuda o se rompe en cualquier punto de su trayecto, toda la línea incisional pierde tensión, conduciendo a la dehiscencia completa de la herida. ⚠️ Trampa: La sutura continua consume MENOS hilo y requiere MENOS nudos (solo en los extremos) que los puntos separados."
  },
  {
    "up": "Suturas",
    "q": "Una paciente consulta en la guardia por una laceración incisa limpia en el párpado superior y la región ciliar derecha. ¿Qué calibre de monofilamento y qué tiempo de retiro de puntos están indicados para esta región facial?",
    "options": {
      "a": "Monofilamento calibre 2-0 y retiro de puntos a los 14 días",
      "b": "Monofilamento calibre 1-0 y retiro de puntos a los 10 días",
      "c": "Monofilamento calibre 5-0 o 6-0 y retiro de puntos a los 3 a 5 días",
      "d": "Monofilamento calibre 3-0 y retiro de puntos a los 8 a 12 días"
    },
    "correct": "c",
    "feedback": "En la piel de la cara y región periocular se emplean monofilamentos de nylon o polipropileno muy finos (calibres 5-0 o 6-0) para minimizar el trauma del trayecto. Debido a la excelente vascularización facial, la epitelización ocurre rápidamente y los puntos deben retirarse entre los 3 y 5 días para evitar marcas e inestéticas en \"escalera de mano\". ⚠️ Trampa: Usar calibre 2-0 o dejar los puntos 10-14 días en cara es una mala práctica quirúrgica que deja cicatrices hipertróficas y marcas de sutura permanentes."
  },
  {
    "up": "Suturas",
    "q": "Durante el refuerzo de una anastomosis en el tracto digestivo, el cirujano busca colocar puntos separados de colchonero horizontal que logren la invaginación seromuscular. ¿Cómo se denomina el punto de colchonero horizontal invaginante seromuscular?",
    "options": {
      "a": "Punto de colchonero vertical evertor de Donatti",
      "b": "Punto continuo invaginante perforante de Connell",
      "c": "Punto seromuscular continuo transfixiante de Cushing",
      "d": "Punto de colchonero horizontal invaginante de Halsted"
    },
    "correct": "d",
    "feedback": "El punto de Halsted es la variante invaginante del colchonero horizontal (U) aplicada al tracto digestivo. Consiste en una lazada en U interrumpida seromuscular no perforante que invagina la serosa con excelente afrontamiento y reparto de tensión. ⚠️ Trampa: Donatti es colchonero vertical evertor para piel. Halsted es colchonero horizontal invaginante para serosa."
  },
  {
    "up": "Suturas",
    "q": "Durante una apendicetomía convencional, tras la ligadura del muñón cecal, se efectúa una sutura continua circular alrededor de la base apendicular para invaginar el muñón. ¿Qué técnica de sutura circular se emplea para esta invaginación?",
    "options": {
      "a": "Sutura continua anclada de tipo Reverdin",
      "b": "Sutura continua circular de tipo Jareta",
      "c": "Sutura discontinua evertora de Donatti",
      "d": "Sutura de retención masiva de Smead-Jones"
    },
    "correct": "b",
    "feedback": "La jareta (purse-string) es una sutura continua circular que rodea en 360° la luz o la base de una estructura tubular (como la base apendicular o el sitio de enterostomía). Al traccionar ambos extremos del hilo, la circunferencia se estrecha e invagina el centro de la pared dentro de la luz visceral. ⚠️ Trampa: Reverdin es un punto continuo anclado. Smead-Jones es para cierre aponeurótico de retención."
  },
  {
    "up": "Suturas",
    "q": "Tras completar una anastomosis digestiva circular termino-terminal con una engrapadora CEEA, el cirujano retira el instrumento y examina la carcasa del cabezal antes de dar por concluida la anastomosis. ¿Qué hallazgo en la engrapadora confirma la continuidad de los anillos o \"donuts\" tisulares?",
    "options": {
      "a": "Presencia de dos anillos tisulares circulares completos y sin brechas",
      "b": "Liberación de la cuchilla de corte en la cara externa de la grapa",
      "c": "Expulsión automática de los clips hemostáticos de titanio al exterior",
      "d": "Cierre hermético de la línea de engrapado lineal en doble hilera"
    },
    "correct": "a",
    "feedback": "Al retirar la engrapadora CEEA tras realizar una anastomosis circular, es un paso crítico e impostergable desmontar el cabezal e inspeccionar los dos anillos de tejido cortados (\"donuts\" o rosquillas: uno proximal y otro distal). La presencia de dos rosquillas tisulares circulares totalmente continuas y sin muescas confirma que la anastomosis se completó en los 360° de la circunferencia. ⚠️ Trampa: Si alguno de los dos donuts está incompleto o desgarro, significa que hay un defecto o brecha en la anastomosis que debe reforzarse manualmente con puntos de Lembert o Rehbein para prevenir la fístula posoperatoria."
  },
  {
    "up": "Suturas",
    "q": "Un paciente evoluciona al 7° día de una colecistectomía laparoscópica con heridas de los accesos quirúrgicos sin complicaciones en la pared abdominal. ¿Cuál es el intervalo de días normatizado para el retiro de puntos en el abdomen y el tronco?",
    "options": {
      "a": "Retiro de puntos entre los 2 y 3 días posoperatorios",
      "b": "Retiro de puntos entre los 14 y 21 días posoperatorios",
      "c": "Retiro de puntos entre los 7 y 10 días posoperatorios",
      "d": "Retiro de puntos entre los 25 y 30 días posoperatorios"
    },
    "correct": "c",
    "feedback": "En el abdomen, tórax y pelvis, donde la tensión mecánica es moderada, el tiempo normatizado para el retiro de los puntos de sutura cutánea es de 7 a 10 días posoperatorios. ⚠️ Trampa: Retirar antes de los 7 días en abdomen expone a dehiscencia cutánea; dejarlos más de 10-12 días favorece granulomas por sutura."
  },
  {
    "up": "Suturas",
    "q": "Durante la fase de remodelación de la cicatrización (desde el día 21 hasta el año de evolución), ocurren cambios moleculares que incrementan la fuerza tensil sin aumentar la cantidad total de colágeno. ¿Qué procesos moleculares son responsables del aumento de la fuerza tensil durante esta fase?",
    "options": {
      "a": "Reabsorción rápida de la matriz extracelular por acción de macrófagos",
      "b": "Acumulación masiva de colágeno inmaduro tipo III sin degradación",
      "c": "Síntesis exclusiva de proteoglicanos y vasos sanguíneos endoteliales",
      "d": "Maduración de enlaces cruzados y equilibrio entre síntesis y lisis"
    },
    "correct": "d",
    "feedback": "En la fase de remodelación (a partir del día 21), la cantidad total de colágeno no aumenta, sino que se estabiliza debido a un equilibrio fino entre la síntesis por fibroblastos y la degradación por metaloproteinasas (colagenasas). El incremento neto de la fuerza tensil se debe a la reorganización de las fibras paralelas a las líneas de tensión y al establecimiento de enlaces cruzados covalentes (cross-linking) inter e intramoleculares entre las cadenas de Colágeno Tipo I. ⚠️ Trampa: En la remodelación NO aumenta el colágeno total, sino la Calidad y estructura de los enlaces cruzados del colágeno preexistente."
  },
  {
    "up": "Suturas",
    "q": "Un paciente obeso, tosedor crónico y con antecedentes de EPOC es reintervenido por urgencia tras una evisceración. Para la resíntesis de la pared abdominal se decide aplicar un punto de retención masiva aponeurótica en \"lejos-lejos / cerca-cerca\" que abarca la fascia y el peritoneo sin estrangular los bordes. ¿Cómo se denomina esta técnica de punto separado de retención aponeurótica masiva?",
    "options": {
      "a": "Punto de retención masiva aponeurótica de Smead-Jones",
      "b": "Punto de colchonero horizontal invaginante de Halsted",
      "c": "Punto seromuscular continuo transfixiante de Cushing",
      "d": "Punto intradérmico continuo evertor con monofilamento"
    },
    "correct": "a",
    "feedback": "El punto de Smead-Jones (o punto en \"far-far / near-near\") es una técnica de síntesis monoplanar de retención aponeurótica para laparotomías de alto riesgo de evisceración. Toma una lazada ancha (\"lejos-lejos\") que abarca la vaina aponeurótica y el peritoneo, e invierte el trayecto con una lazada estrecha (\"cerca- cerca\") sobre el borde de la aponeurosis. Esto distribuye la tensión de cierre a lo largo de una mayor masa tisular sin comprometer la microcirculación del margen aponeurótico. ⚠️ Trampa: No confundir el punto de Smead-Jones (técnica en masa aponeurótica) con el punto de Donatti (técnica de eversión cutánea)."
  },
  {
    "up": "Suturas",
    "q": "Al efectuar el cierre aponeurótico continuo de una laparotomía mediana mediante la técnica de \"pequeños bocados\" (small bites), se debe respetar estrictamente la relación entre la longitud del hilo empleado y la longitud de la incisión para prevenir la hernia incisional. ¿Cuál es la relación estandarizada recomendada entre la longitud de la sutura y la longitud de la herida (SL/WL)?",
    "options": {
      "a": "Relación de sutura a herida de uno a uno (1:1)",
      "b": "Relación de sutura a herida de cuatro a uno (4:1)",
      "c": "Relación de sutura a herida de diez a uno (10:1)",
      "d": "Relación de sutura a herida de dos a uno (2:1)"
    },
    "correct": "b",
    "feedback": "Según la norma biomecánica de Jenkin y los consensos internacionales de pared abdominal, la longitud total del hilo consumido en un cierre aponeurótico continuo debe ser al menos 4 veces la longitud de la incisión (SL/WL $\\ge$ 4:1). La técnica de \"pequeños bocados\" (small bites) coloca puntos a 5 mm del borde de la fascia y separados 5 mm entre sí, reduciendo drásticamente la tasa de hernias incisionales y el dolor posoperatorio. ⚠️ Trampa: Una relación menor a 4:1 implica un hilo demasiado tenso o bocados demasiado distanciados, lo que conduce a la laceración de la aponeurosis y a la eventración."
  },
  {
    "up": "Suturas",
    "q": "Un médico residente intenta aplicar un adhesivo tisular sintético de 2-octil cianoacrilato en una incisión quirúrgica. El cirujano a cargo detiene la maniobra al advertir una mala praxis en la técnica de aplicación del producto. ¿Cuál constituye una contraindicación absoluta para el uso de adhesivos tisulares sintéticos?",
    "options": {
      "a": "Aplicación exclusiva sobre la capa epidérmica externa seca",
      "b": "Indicación en incisiones quirúrgicas sometidas a tracción",
      "c": "Aplicación dentro de la brecha profunda en contacto vascular",
      "d": "Empleo en laceraciones lineales superficiales sin tensión"
    },
    "correct": "c",
    "feedback": "Los adhesivos tisulares de cianoacrilato (2-octil cianoacrilato) son polímeros de aplicación exclusivamente TÓPICA SUPERFICIAL (EPIDÉRMICA). Está absolutamente contraindicado introducirlos dentro del lecho profundo de la herida o en contacto con vasos, nervios o vísceras, ya que desencadenan una intensa reacción de cuerpo extraño, retrasan la cicatrización dermal, interfieren con la síntesis de colágeno y pueden causar embolia o necrosis tisular. ⚠️ Trampa: El cianoacrilato NUNCA se aplica dentro de la herida; actúa como una barrera tópica sobre los bordes ya evertidos y aproximados."
  },
  {
    "up": "Suturas",
    "q": "Un paciente consulta en la guardia tras sufrir una mordedura humana en el antebrazo con 24 horas de evolución. Presenta una herida contuso-lacerada con edema, eritema perilesional y secreción fétida. ¿Cuál es el esquema de síntesis y cierre indicado para este caso?",
    "options": {
      "a": "Cierre primario inmediato en un solo plano con monofilamento",
      "b": "Cierre por segunda intención con injerto cutáneo inmediato",
      "c": "Cierre primario simple previa colocación de drenaje tubular",
      "d": "Cierre por tercera intención o primario retardado tras debridado"
    },
    "correct": "d",
    "feedback": "Las heridas por mordedura (humana o animal) inoculan flora polimicrobiana anaerobia y aerobia de alta virulencia (Eikenella corrodens, Pasteurella multocida, Staphylococcus). Tras más de 12-24 horas, el cierre primario inmediato está totalmente contraindicado por el altísimo riesgo de abscesos profundos y flemones. Se realiza toilette, debridamiento, curaciones abiertas y, tras 3 a 5 días de evolución favorable sin infección, se efectúa el cierre primario retardado (tercera intención). ⚠️ Trampa: Suturar de entrada una mordedura evolucionada es una mala praxis grave por riesgo de flemón y sepsis de partes blandas."
  },
  {
    "up": "Suturas",
    "q": "Durante una laparotomía, se produce el sangrado activo por retracción de una arteria en el mesenterio que no cede con la electrocoagulación simple. Se requiere realizar una ligadura que quede anclada al tejido fibroso para evitar su deslizamiento. ¿Qué técnica de punto hemostático es la adecuada para este control vascular?",
    "options": {
      "a": "Punto transfictivo hemostático en figura de ocho",
      "b": "Punto de colchonero vertical evertor de Donatti",
      "c": "Punto seromuscular continuo perforante de Connell",
      "d": "Punto de retención aponeurótica de Smead-Jones"
    },
    "correct": "a",
    "feedback": "El punto transfictivo (o ligadura en figura de 8) transfixia el parénquima o tejido fibroso subyacente al vaso sangrante antes de rodearlo. Esto crea un anclaje mecánico firme en el tejido vecino que impide que el nudo se deslice o se degenere por la pulsación arterial del vaso retraído. ⚠️ Trampa: Donatti es evertor cutáneo; Connell y Cushing son invaginantes gastrointestinales."
  },
  {
    "up": "Suturas",
    "q": "Una paciente evoluciona al décimo día posoperatorio de una cirugía de reemplazo articular suturada mediante agrafes cutáneos metálicos. Se procede a la extracción de las grapas en el consultorio. ¿Qué técnica e instrumental deben utilizarse para el retiro seguro de las grapas metálicas?",
    "options": {
      "a": "Retiro mediante tracción directa con pinza de disección",
      "b": "Retiro mediante el uso del extractor o desengrapadora",
      "c": "Retiro mediante corte lateral con tijera de Metzenbaum",
      "d": "Retiro mediante palpación e incisión con bisturí de hoja 11"
    },
    "correct": "b",
    "feedback": "Las grapas o agrafes cutáneos metálicos se retiran exclusivamente mediante una pinza especial desengrapadora (extractor de agrafes). El instrumento presiona el centro de la barra metálica externa, lo que abre de forma simétrica las dos patas intraepidérmicas inferiores, permitiendo su extracción vertical atraumática sin desgarrar la piel. ⚠️ Trampa: Traccionar la grapa con pinzas comunes de disección deforma el metal e imparte un severo dolor y desgarro en la cicatriz."
  },
  {
    "up": "Suturas",
    "q": "Al sexto día posoperatorio de una peritonitis apendicular, un paciente presenta un esfuerzo repentino de tos, seguido del empapado masivo del vendaje con un líquido rosado \"en agua de lavar carne\" y la protrusión de asas delgadas a través de la herida. ¿Cuál es el diagnóstico de esta complicación de la pared y la conducta inmediata?",
    "options": {
      "a": "Colocación de faja elastizada y reposo absoluto en cama",
      "b": "Curación plana ambulatoria y antibioticoterapia oral",
      "c": "Reintervención quirúrgica inmediata y lavaje cavitario",
      "d": "Cierre cutáneo en la cama con puntos simples de nylon"
    },
    "correct": "c",
    "feedback": "La evisceración aguda (salida de vísceras abdominales a través de la dehiscencia completa de todos los planos de la pared) es una urgencia quirúrgica absoluta. Requiere cobertura inmediata con compresas embebidas en solución fisiológica estéril, estabilización e reintervención quirúrgica urgente en quirófano para lavaje, debridamiento de bordes y resíntesis de la pared (habitualmente con puntos de retención masiva de Smead-Jones). ⚠️ Trampa: Intenta solucionar una evisceración con fajas o puntos en la cama del paciente es una falta grave; expone a peritonitis secundaria y necrosis intestinal."
  },
  {
    "up": "Suturas",
    "q": "Al analizar la reactividad tisular de los materiales de síntesis, se compara la respuesta inflamatoria provocada por los monofilamentos sintéticos frente a los multifilamentos orgánicos. ¿Cuál es el comportamiento de los monofilamentos sintéticos en el proceso de cicatrización?",
    "options": {
      "a": "Los multifilamentos naturales generan menor inflamación",
      "b": "Los monofilamentos sintéticos inducen reacción proteica",
      "c": "Los multifilamentos sintéticos sufren hidrólisis rápida",
      "d": "Los monofilamentos sintéticos provocan mínima reacción"
    },
    "correct": "d",
    "feedback": "La reactividad tisular depende del origen y la estructura del hilo. Los monofilamentos sintéticos (Polipropileno, Nylon, PDS) poseen una superficie lisa no porosa e inerte que desencadena una respuesta inflamatoria de cuerpo extraño mínima. En cambio, los multifilamentos orgánicos o naturales (Seda, Catgut) inducen marcada respuesta leucocitaria y fibroblástica. ⚠️ Trampa: Los multifilamentos naturales (ej. seda o catgut) son los MÁS reactivos, no los menos reactivos."
  },
  {
    "up": "Suturas",
    "q": "Un paciente reconsulta a los 6 meses de una colecistectomía convencional por presentar un nódulo eritematoso, indurado y doloroso sobre la cicatriz, el cual fistuliza espontáneamente drenando material seropurulento y un fragmento de hilo. ¿Cuál es la causa fisiopatológica de esta complicación tardía de la cicatrización?",
    "options": {
      "a": "Granuloma por cuerpo extraño y fístula de hilo por seda",
      "b": "Reacción alérgica inmediata al polipropileno monofilamento",
      "c": "Infección viral latente del lecho quirúrgico cicatrizado",
      "d": "Formación espontánea de queloide por deficiencia de zinc"
    },
    "correct": "a",
    "feedback": "La seda es un multifilamento no absorbible de origen proteico (gusano de seda). Cuando se emplea en planos profundos (subcutáneo o fascia), su alta capilaridad alberga bacterias que escapan a la fagocitosis. Esto genera una reacción granulomatosa de cuerpo extraño a largo plazo que fistuliza hacia la piel para expulsar el material de sutura (\"fístula de hilo\"). ⚠️ Trampa: La seda está contraindicada en planos profundos o sospecha de contaminación debido a la fístula de hilo."
  },
  {
    "up": "Suturas",
    "q": "Al inspeccionar una laparotomía suturada con puntos simples de nylon al cuarto día posoperatorio, se observa una franja de necrosis isquémica en los bordes cutáneos delimitada exactamente por el trayecto de los puntos. ¿Qué error de técnica en la colocación de la sutura produjo la necrosis bordear?",
    "options": {
      "a": "Tensión inadecuada con inversión de bordes epidérmicos",
      "b": "Tensión excesiva del nudo con estrangulación vascular",
      "c": "Infección precoz por bacterias gramnegativas anaerobias",
      "d": "Reacción alérgica por contacto al monofilamento de nylon"
    },
    "correct": "b",
    "feedback": "La función de la sutura es aproximar, no estrangular. Si los nudos se anudan con fuerza excesiva, el bocado tisular se comprime por encima de la presión de perfusión capilar (20-30 mmHg), lo que produce colapso microvascular, edema, isquemia focal y necrosis por decúbito de los bordes cutáneos. ⚠️ Trampa: La necrosis no se debe al tipo de hilo ni a la alergia, sino al error técnico de tensionar demasiado la lazada."
  },
  {
    "up": "Suturas",
    "q": "Un cirujano evalúa el empleo de una sutura continua (surget) versus puntos separados para la síntesis cutánea en una herida por laparotomía traumática potencialmente contaminada. ¿Cuál es la contraindicación biomecánica principal de la sutura continua en heridas con riesgo infeccioso?",
    "options": {
      "a": "Indicada en heridas infectadas por su rápido cierre",
      "b": "Indicada en piel palmar por su escasa elasticidad",
      "c": "Contraindicada en heridas contaminadas por riesgo de dehiscencia",
      "d": "Contraindicada en aponeurosis sana por provocar eventración"
    },
    "correct": "c",
    "feedback": "En heridas contaminadas o con riesgo de infección del sitio quirúrgico, la sutura continua está contraindicada. Si se forma una colección o absceso subcutáneo, la necesidad de retirar la sutura continua obliga a desbridar toda la línea incisional de extremo a extremo, dejando la herida completamente abierta. Los puntos separados permiten retirar únicamente 1 o 2 puntos sobre la zona fluctuante para drenar el pus, manteniendo el resto del cierre estable. ⚠️ Trampa: En campos potencialmente infectados se contraindica el surget continuo por la imposibilidad de drenaje localizado."
  },
  {
    "up": "Suturas",
    "q": "En un paciente desnutrido y séptico que requiere el cierre de una laparotomía de urgencia, se selecciona un hilo absorbible que mantenga la fuerza tensil aponeurótica durante al menos dos meses. ¿Qué material de sutura monofilamento absorbible es el indicado en este contexto?",
    "options": {
      "a": "Catgut simple monofilamento de origen animal",
      "b": "Poliglactina 910 multifilamento de absorción rápida",
      "c": "Seda trenzada natural no absorbible con capilaridad",
      "d": "Polidioxanona monofilamento de absorción prolongada"
    },
    "correct": "d",
    "feedback": "La Polidioxanona (PDS®) es el monofilamento absorbible de degradación por hidrólisis más lenta disponible (conserva el 50% de su resistencia a la 4ª-6ª semana y se absorbe a los 180 días). En pacientes con sepsis, desnutrición o hipoproteinemia, la cicatrización aponeurótica es lenta; el PDS proporciona el soporte mecánico prolongado requerido sin la permanencia de un cuerpo extraño no absorbible. ⚠️ Trampa: El Vicryl pierde su resistencia a los 21 días, siendo insuficiente para fascias en pacientes debilitados."
  },
  {
    "up": "Suturas",
    "q": "En el posoperatorio de una cirugía abdominal, se busca identificar precozmente los signos clínicos de una dehiscencia aponeurótica oculta antes de que se produzca la evisceración completa. ¿Cuál es el signo semiológico precoz cardinal de la dehiscencia aponeurótica subyacente?",
    "options": {
      "a": "Salida de líquido serosanguinolento rosado por la herida",
      "b": "Presencia de eritema perilesional sin drenaje de secreción",
      "c": "Aparición de hematoma subcutáneo disecante e indoloro",
      "d": "Enfisema subcutáneo crepitante en el sitio incisional"
    },
    "correct": "a",
    "feedback": "El signo patognomónico precoz (\"signo del alfiler\") de la dehiscencia aponeurótica oculta (precursora de la evisceración) es la exudación abundante a través de la sutura de un líquido salmón o serosanguinolento característico (\"en agua de lavar carne\"). Este líquido corresponde al exudado peritoneal enriquecido con hemoglobina que drena desde la cavidad abdominal a través del defecto aponeurótico desbridado. ⚠️ Trampa: Esperar a ver las asas intestinales expuestas es un diagnóstico tardío de evisceración. El líquido en \"agua de lavar carne\" es el signo precoz de dehiscencia fascial."
  },
  {
    "up": "Suturas",
    "q": "En la confección del segundo plano (seromuscular) de una anastomosis digestiva en dos planos, se busca lograr un contacto íntimo que selle la serosa e impida la fuga anastomótica. ¿Qué técnica de punto invaginante seromuscular interrumpido es la normatizada?",
    "options": {
      "a": "Cierre evertor en un solo plano con acero quirúrgico",
      "b": "Cierre invaginante seromuscular con Lembert o Halsted",
      "c": "Cierre transfixiante mucoso continuo con catgut simple",
      "d": "Cierre subcuticular intradérmico con nylon monofilamento"
    },
    "correct": "b",
    "feedback": "El segundo plano (o plano de refuerzo) en las anastomosis digestivas convencionales se realiza con puntos separados seromusculares invaginantes (Lembert o Halsted) utilizando hilos absorbibles finos o monofilamentos. Este plano aproxima íntimamente las serosas, induciendo la formación precoz de un sello de fibrina seroseroso que previene las microfugas. ⚠️ Trampa: El segundo plano digestivo NUNCA debe atravesar la mucosa (debe ser estricto seromuscular no perforante)."
  },
  {
    "up": "Suturas",
    "q": "Un paciente sufre un traumatismo con pérdida masiva de sustancia cutánea en el muslo con contaminación bacteriana severa, impidiendo la aproximación de los bordes. ¿Qué tipo de cicatrización y manejo de la herida se desarrolla en este escenario?",
    "options": {
      "a": "Cierre primario inmediato mediante puntos de retención",
      "b": "Cierre por tercera intención tras tres días de curación",
      "c": "Cicatrización por granulación pasiva y reepitelización",
      "d": "Cierre con adhesivos tisulares y parches de hidrocoloide"
    },
    "correct": "c",
    "feedback": "La cicatrización por segunda intención ocurre en heridas con pérdida masiva de tejido, heridas infectadas o lechos cavitados donde los bordes no pueden afrontarse. El defecto se completa progresivamente desde el fondo y los bordes mediante la formación de tejido de granulación (miofibroblastos, colágeno III y neoangiógenesis) seguido de la reepitelización centrípeta. ⚠️ Trampa: No debe intentarse el cierre primario bajo tensión en heridas cavitadas con pérdida de sustancia, ya que sobreviene la necrosis y sepsis local."
  },
  {
    "up": "Suturas",
    "q": "Durante la evaluación de los factores de riesgo de infección del sitio quirúrgico, se discute el concepto de capilaridad de las suturas. ¿A qué propiedad física de los hilos multifilamento corresponde la capilaridad?",
    "options": {
      "a": "Propiedad de repelencia de fluidos tisulares en hilos",
      "b": "Propiedad de degradación enzimática de polímeros sintéticos",
      "c": "Propiedad de elasticidad mecánica bajo tensión ejercida",
      "d": "Propiedad de absorción y transporte bacteriano por el hilo"
    },
    "correct": "d",
    "feedback": "La capilaridad es la propiedad física de los hilos multifilamento (trenzados o torcidos) por la cual los fluidos y las bacterias son absorbidos e impulsados a lo largo de los intersticios entre las hebras del hilo (efecto mecha). Esto permite la translocación de microorganismos desde la superficie cutánea hacia los planos profundos, incrementando el riesgo de infección del sitio quirúrgico. ⚠️ Trampa: Los monofilamentos carecen de intersticios y, por ende, NO tienen capilaridad (son impermeables al transporte bacteriano)."
  },
  {
    "up": "Suturas",
    "q": "Al realizar el cierre del plano subcutáneo con sutura absorbible sintética, el cirujano ejecuta una maniobra técnica específica para evitar que la lazada sobresalga bajo la piel. ¿Qué técnica de anudado se emplea para sepultar el nudo en el fondo del plano?",
    "options": {
      "a": "Técnica de nudo invertido o enterrado hacia el fondo",
      "b": "Técnica de nudo evertor expuesto hacia la dermis",
      "c": "Técnica de nudo deslizante en superficie epidérmica",
      "d": "Técnica de nudo de cirujano traccionado hacia afuera"
    },
    "correct": "a",
    "feedback": "Para aproximar el plano celular subcutáneo, la aguja debe introducirse de profundo a superficial en el primer borde y de superficial a profundo en el segundo borde. Al traccionar y anudar el hilo, el nudo se desplaza y queda enterrado en la profundidad del lecho (nudo invertido), orientando los dos de los hilos hacia abajo y evitando que la masa del nudo presione la dermis o extruya. ⚠️ Trampa: Anudar hacia la superficie (nudo evertido) provoca granulomas por extrusión del nudo a través de la cicatriz."
  },
  {
    "up": "Suturas",
    "q": "En presencia de un campo quirúrgico con contaminación bacteriana activa, el cirujano opta por utilizar polipropileno monofilamento para la síntesis de la fascia aponeurótica. ¿Por qué el monofilamento de polipropileno es seguro de utilizar en campos contaminados?",
    "options": {
      "a": "Sufre degradación proteolítica rápida en medio ácido",
      "b": "Carece de intersticios permitiendo su uso en infección",
      "c": "Incrementa la proliferación bacteriana multifilamentosa",
      "d": "Pierde su fuerza tensil a las veinticuatro horas"
    },
    "correct": "b",
    "feedback": "El Polipropileno (Prolene®) es un monofilamento sintético no absorbible de superficie lisa y no porosa. Al no poseer intersticios ni capilaridad, las bacterias no pueden alojarse en su matriz lejos del alcance de los macrófagos y PMN (cuya envergadura es mayor a los espacios de un hilo trenzado). Por ello, es la sutura no absorbible de elección en campos contaminados o vascularizados. ⚠️ Trampa: La seda o el poliéster trenzado están contraindicados en infección porque las bacterias se esconden entre sus hebras trenzadas."
  },
  {
    "up": "Suturas",
    "q": "Durante una invaginación del muñón apendicular o el aseguramiento de un tubo de colecystostomía, se realiza una sutura continua circular en la serosa digestiva. ¿Qué técnica de sutura continua concéntrica invaginante es la indicada?",
    "options": {
      "a": "Sutura continua intradérmica con aguja triangular",
      "b": "Sutura discontinuo evertor de Donatti con aguja plana",
      "c": "Sutura continua circular seromuscular con aguja cónica",
      "d": "Sutura de retención masiva aponeurótica de Smead-Jones"
    },
    "correct": "c",
    "feedback": "La jareta es una sutura continua circular que se confecciona tomando bocados seromusculares no perforantes con una aguja cónica atraumática alrededor de una víscera o tubo. Al traccionar ambos extremos del hilo, la circunferencia disminuye concéntricamente, invaginando el lecho seroso de forma estanca y atraumática. ⚠️ Trampa: Usar una aguja triangular cortante en la jareta desgarra la pared visceral e inestabiliza la invaginación."
  },
  {
    "up": "Suturas",
    "q": "Para evitar la necrosis por estrangulamiento o la dehiscencia por desgarro al suturar una herida en la piel, se debe respetar la regla de simetría y distancia de los bocados. ¿Cómo se define la regla de oro para la colocación equidistante de los puntos?",
    "options": {
      "a": "Colocar puntos a un milímetro del borde cada dos centímetros",
      "b": "Colocar puntos a tres centímetros del borde cada un milímetro",
      "c": "Colocar puntos pegados al margen sin guardar distancia alguna",
      "d": "Colocar puntos a distancia simétrica del borde y entre sí"
    },
    "correct": "d",
    "feedback": "Para lograr una cicatrización fisiológica sin distorsión de la arquitectura cutánea, la distancia de entrada de la aguja respecto al borde de la herida debe ser igual a la profundidad de la toma y simétrica en ambos márgenes, y la distancia entre dos puntos contiguos debe ser habitualmente equivalente al doble de la distancia al borde. Esta simetría asegura un reparto de tensión homogéneo y evita la isquemia o los pliegues inestéticos. ⚠️ Trampa: Bocados asimétricos o desproporcionados producen desalineación de los bordes cutáneos, eversión/inversión defectuosa y cicatrización viciosa."
  }
];
