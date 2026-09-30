// js/casosPacientes.js
// CAMPUS NIKA — Banco de casos y generador de pacientes para los simuladores con IA
// (Pase de Sala, Shock Room, Consultorio/Legales…).
//
// Problema que resuelve: sin una semilla, el modelo tiende a repetir siempre el mismo paciente y el mismo
// cuadro "de manual". Acá cada sesión recibe un caso ASIGNADO al azar: un cuadro clínico de la unidad elegida
// + un paciente distinto (nombre, edad, sexo, ocupación, contexto y antecedentes). El texto se inyecta en el
// systemPrompt (ver _construirReglaTematica en examen.html) y se mantiene igual durante todos los turnos.
//
// Formato de cada caso:  'sexo|edadMin-edadMax|Diagnóstico objetivo|Presentación inicial'   (sexo: F | M | *)

const CASOS_PACIENTES = {
  cirugia: {
    up1: [
      '*|18-60|Fractura distal de radio (Colles)|caída sobre la mano extendida, dolor y deformidad "en dorso de tenedor"',
      '*|20-70|Fractura de escafoides|caída con la muñeca en extensión, dolor en la tabaquera anatómica y radiografía inicial normal',
      'M|18-45|Luxación anterior de hombro|deportista, brazo en abducción y rotación externa, hombro "en charretera"',
      '*|4-12|Fractura supracondílea de húmero|niño que cae de una hamaca, codo hinchado y dolorido, pulso radial a evaluar',
      '*|22-65|Herida cortante de mano con sección de tendón flexor|cuchillo de cocina, el dedo queda extendido y no flexiona',
      '*|20-60|Síndrome compartimental de antebrazo|fractura reducida con yeso circular, dolor desproporcionado y parestesias',
      '*|16-50|Fractura de clavícula|caída de bicicleta, dolor en el hombro y brazo sostenido con la otra mano',
      '*|35-80|Absceso subcutáneo con celulitis en el antebrazo|inyección hace 4 días, fiebre y zona caliente con fluctuación',
      '*|20-55|Herida punzante en la mano con riesgo de tétanos|clavo oxidado, esquema de vacunación desconocido',
      '*|55-85|Fractura del extremo proximal de húmero|mujer o varón mayor con osteoporosis, caída en el baño',
      'M|18-40|Mordedura humana en el puño ("fight bite")|golpe a la boca de otra persona en una pelea hace 2 días, tumefacción y fiebre',
      '*|30-70|Infección de sitio quirúrgico superficial|herida de una cirugía de hace 7 días con eritema, secreción y fiebre baja',
      '*|20-45|Dedo en martillo (lesión del extensor)|golpe de pelota en la punta del dedo, no extiende la última falange',
    ],
    up2: [
      '*|15-35|Apendicitis aguda (fase flegmonosa)|dolor periumbilical que migra a fosa ilíaca derecha, anorexia y náuseas',
      '*|10-60|Apendicitis aguda complicada con plastrón|5 días de dolor en FID, masa palpable y febrícula',
      'F|20-40|Apendicitis aguda en el embarazo|embarazada de segundo trimestre con dolor abdominal derecho más alto que lo habitual',
      '*|65-90|Apendicitis aguda perforada en adulto mayor|cuadro solapado de 4 días, poco dolor y compromiso del estado general',
      '*|30-70|Colecistitis aguda litiásica|dolor en hipocondrio derecho luego de una comida grasa, signo de Murphy positivo',
      '*|30-75|Úlcera duodenal perforada|dolor epigástrico súbito "en puñalada", abdomen en tabla',
      '*|40-80|Obstrucción intestinal por bridas|cirugía abdominal previa, distensión, vómitos y ausencia de eliminación de gases',
      '*|60-90|Isquemia mesentérica aguda|fibrilación auricular, dolor abdominal intenso con examen abdominal pobre',
      'M|60-85|Aneurisma de aorta abdominal complicado|dolor abdominal y lumbar con hipotensión y masa pulsátil',
      'F|18-40|Embarazo ectópico roto|dolor abdominal bajo brusco, amenorrea de 7 semanas y lipotimia',
      'F|16-35|Torsión de anexo|dolor pélvico súbito con vómitos, quiste ovárico conocido',
      '*|20-70|Cólico renoureteral complicado con pielonefritis|dolor lumbar que irradia a genitales, fiebre y escalofríos',
      '*|25-75|Pancreatitis aguda|dolor epigástrico en cinturón con vómitos, consumo de alcohol reciente',
      '*|70-90|Vólvulo de sigmoides|constipación crónica, distensión abdominal enorme y dolor cólico',
    ],
    up3: [
      '*|50-75|Acalasia|disfagia para sólidos y líquidos de meses, regurgitación y pérdida de peso',
      'M|55-80|Cáncer de esófago (carcinoma epidermoide)|disfagia progresiva, antecedente de tabaquismo y alcohol, baja de peso',
      '*|35-65|Esófago de Barrett por ERGE crónico|pirosis de años sin tratamiento y consulta por primera vez',
      'M|65-85|Divertículo de Zenker|regurgitación de alimentos no digeridos, halitosis y gorgoteo cervical',
      'M|30-65|Hemorragia digestiva alta por úlcera duodenal|melena y epigastralgia, consumo crónico de AINEs',
      'M|40-65|Hemorragia digestiva alta por várices esofágicas|hematemesis masiva en paciente con cirrosis alcohólica',
      '*|20-50|Síndrome de Mallory-Weiss|hematemesis luego de vómitos repetidos tras ingesta de alcohol',
      '*|55-85|Cáncer gástrico|saciedad precoz, epigastralgia, anemia y pérdida de peso',
      '*|40-70|Síndrome de dumping posgastrectomía|cirugía gástrica hace 3 meses, palpitaciones y diarrea tras comer',
      'M|35-65|Perforación esofágica (síndrome de Boerhaave)|dolor torácico intenso y enfisema subcutáneo tras vómitos violentos',
      '*|60-85|Hernia hiatal paraesofágica|dolor posprandial, saciedad y anemia ferropénica',
      '*|15-40|Estenosis esofágica por ingesta de cáusticos|ingesta de un producto de limpieza hace semanas, disfagia progresiva',
      '*|30-60|Úlcera gástrica con hemorragia|dolor epigástrico que empeora al comer y hematemesis leve',
      '*|3-8|Cuerpo extraño esofágico (moneda)|niño que se atragantó, sialorrea y no traga',
    ],
    up4: [
      '*|65-90|Hemorragia digestiva baja por enfermedad diverticular|rectorragia abundante indolora, sin dolor abdominal previo',
      '*|50-85|Diverticulitis aguda complicada (Hinchey III)|dolor en fosa ilíaca izquierda, fiebre y abdomen con defensa',
      '*|20-40|Colitis ulcerosa grave|diarrea sanguinolenta con más de 8 deposiciones diarias, fiebre y taquicardia',
      '*|18-40|Enfermedad de Crohn con fístula perianal|dolor abdominal crónico, diarrea y secreción perianal',
      '*|60-85|Cáncer de colon derecho|astenia, anemia ferropénica y masa palpable en fosa ilíaca derecha',
      '*|50-80|Cáncer de recto|rectorragia, tenesmo y cambio en el calibre de las heces',
      'M|60-90|Vólvulo de sigmoides|distensión abdominal marcada, constipación y dolor cólico',
      '*|30-55|Hemorroides trombosadas|dolor anal intenso y tumefacción azulada luego de un esfuerzo defecatorio',
      '*|25-55|Absceso perianal|dolor pulsátil perianal, fiebre y dificultad para sentarse',
      '*|25-55|Fisura anal|dolor anal muy intenso durante y después de defecar con sangre roja en el papel',
      'M|18-35|Quiste pilonidal abscedado|dolor intenso en la región sacrococcígea y secreción',
      '*|70-90|Colitis isquémica|dolor abdominal a izquierda con diarrea sanguinolenta, cardiopatía previa',
      '*|50-85|Obstrucción intestinal por tumor de sigmoides|constipación creciente, distensión y vómitos fecaloides',
      '*|45-80|Complicación de ileostomía/colostomía|estoma con gasto alto, deshidratación e hipopotasemia',
    ],
    up5: [
      '*|30-70|Colecistitis aguda litiásica|dolor en hipocondrio derecho, fiebre y vómitos, ecografía con litiasis',
      '*|35-75|Colangitis aguda (tríada de Charcot)|ictericia, fiebre con escalofríos y dolor en hipocondrio derecho',
      '*|30-70|Pancreatitis aguda biliar|dolor epigástrico en cinturón con vómitos, litiasis vesicular conocida',
      '*|35-70|Pancreatitis aguda grave con necrosis|dolor persistente, falla respiratoria e hipotensión al cuarto día',
      '*|30-65|Absceso hepático piógeno|fiebre sostenida, dolor en hipocondrio derecho y leucocitosis',
      '*|20-55|Quiste hidatídico hepático complicado|zona endémica, dolor y fiebre, ecografía con imagen multivesicular',
      '*|20-45|Trauma hepático cerrado|accidente de tránsito con dolor en hipocondrio derecho e hipotensión',
      '*|55-80|Cáncer de cabeza de páncreas|ictericia indolora progresiva, prurito, coluria y pérdida de peso',
      '*|55-80|Colangiocarcinoma|ictericia obstructiva con vesícula no palpable y pérdida de peso',
      '*|65-90|Íleo biliar|dolor cólico y vómitos en anciana con antecedente de litiasis vesicular',
      'M|50-70|Hepatocarcinoma en paciente cirrótico|dolor en hipocondrio derecho y descompensación ascítica',
      'M|40-60|Hipertensión portal con ascitis refractaria|distensión abdominal progresiva en paciente con hepatopatía crónica',
      '*|30-55|Pseudoquiste pancreático|masa epigástrica y saciedad, semanas después de una pancreatitis',
      '*|40-70|Colecistitis alitiásica|paciente internado en terapia intensiva con fiebre y dolor abdominal',
    ],
    up6: [
      'M|30-70|Hernia inguinal indirecta|tumoración inguinal que aparece al toser y esfuerzos, se reduce en decúbito',
      'F|65-90|Hernia crural estrangulada|dolor y tumoración bajo el ligamento inguinal con vómitos',
      '*|25-60|Hernia umbilical|abultamiento umbilical doloroso, obesidad y embarazos previos',
      '*|45-75|Eventración incarcerada|cirugía abdominal previa, tumoración en la cicatriz irreductible y dolorosa',
      'M|12-25|Torsión testicular|dolor escrotal súbito con náuseas, testículo elevado y sin reflejo cremastérico',
      'M|18-60|Epididimitis aguda|dolor escrotal progresivo con fiebre y disuria',
      'M|3-60|Hidrocele|aumento de volumen escrotal indoloro que transilumina',
      'M|15-35|Varicocele|sensación de pesadez testicular, "bolsa de gusanos" que aumenta de pie',
      'M|18-35|Pubalgia del deportista|dolor inguinal crónico en futbolista, empeora al correr y patear',
      '*|55-85|Hernia de Spiegel|dolor localizado en el borde externo del recto abdominal y masa poco evidente',
      'F|65-90|Hernia obturatriz|dolor en cara interna del muslo y obstrucción intestinal, signo de Howship-Romberg',
      '*|30-65|Cólico ureteral con dolor inguinal|dolor lumbar irradiado a la ingle y hematuria',
      'M|40-70|Hernia inguinal recidivada|hernioplastia previa y nuevo bulto inguinal con dolor',
      'M|35-60|Neuralgia posherniorrafia|dolor inguinal urente persistente luego de una hernioplastia con malla',
    ],
    up7: [
      'F|25-60|Nódulo tiroideo Bethesda III|nódulo palpable hallado en un control, sin síntomas y PAAF indeterminada',
      'F|25-55|Cáncer papilar de tiroides|nódulo duro de 2 cm con adenopatía cervical',
      '*|55-80|Bocio endotorácico con compresión traqueal|disnea de esfuerzo, estridor y disfagia, bocio conocido',
      'F|25-55|Enfermedad de Graves|pérdida de peso, palpitaciones, temblor, exoftalmos y bocio difuso',
      'F|35-65|Hipocalcemia posoperatoria de tiroidectomía|parestesias periorales y calambres a las 24 h de una tiroidectomía total',
      '*|30-65|Parálisis recurrencial posoperatoria|disfonía y voz bitonal tras cirugía tiroidea',
      '*|2-10|Quiste del conducto tirogloso|masa cervical anterior en la línea media que asciende al deglutir',
      '*|18-35|Quiste branquial|masa cervical lateral blanda, indolora, que se infecta tras un resfrío',
      '*|50-75|Adenopatía cervical metastásica de origen desconocido|masa cervical dura no dolorosa, tabaquista',
      '*|35-65|Adenoma pleomorfo de parótida|tumor indoloro de crecimiento lento delante de la oreja',
      '*|25-60|Sialolitiasis submaxilar|dolor e hinchazón bajo la mandíbula que aumenta al comer',
      '*|60-85|Obstrucción de cánula de traqueostomía|paciente traqueostomizado con disnea súbita y tos',
      '*|30-65|Absceso profundo de cuello|odinofagia, trismo y fiebre tras infección dental',
    ],
    up8: [
      '*|70-95|Fractura de cadera (subcapital)|caída desde su altura, miembro acortado y en rotación externa, no puede caminar',
      '*|18-45|Fractura de pelvis inestable con shock|accidente de moto, dolor pélvico, hipotensión y hematoma perineal',
      'M|20-50|Fractura expuesta de tibia (Gustilo III)|accidente de moto, herida con hueso visible y contaminación',
      '*|25-60|Fractura bimaleolar de tobillo|torcedura con deformidad, edema y equimosis',
      '*|20-60|Síndrome compartimental de pierna|fractura de tibia inmovilizada, dolor desproporcionado y dolor al estiramiento pasivo',
      'M|18-40|Fractura diafisaria de fémur en politraumatizado|accidente vial, muslo deformado y edematoso, shock hipovolémico',
      'M|35-60|Rotura del tendón de Aquiles|chasquido súbito jugando al fútbol, no puede ponerse de puntas',
      '*|18-40|Lesión de ligamento cruzado anterior|torsión de rodilla al esquiar, "pop" y derrame articular',
      '*|30-60|Hernia discal con síndrome de cola de caballo|lumbociatalgia, anestesia en silla de montar y retención urinaria',
      '*|55-80|Fractura patológica por metástasis ósea|dolor de meses en el fémur y fractura con mínimo trauma, cáncer previo',
      '*|10-20|Osteosarcoma de fémur distal|dolor nocturno en la rodilla y masa de crecimiento rápido',
      '*|20-50|Luxación de rodilla con lesión poplítea|accidente de tránsito, rodilla inestable y pie frío sin pulsos',
      '*|25-55|Fractura de calcáneo|caída de altura sobre los talones, dolor y ensanchamiento del talón',
      '*|20-50|Fractura vertebral por estallido|caída de un techo, dolor lumbar intenso y déficit neurológico',
    ],
    up9: [
      '*|20-40|Politraumatismo por accidente de motocicleta|ingresa con collar cervical, taquicardia, hipotensión y dolor torácico y abdominal',
      'M|20-45|Neumotórax a tensión|herida penetrante en tórax, disnea grave, hipotensión y ausencia de murmullo vesicular',
      'M|20-50|Taponamiento cardíaco por herida penetrante|herida precordial, ingurgitación yugular e hipotensión con tonos cardíacos apagados',
      '*|18-50|Trauma abdominal cerrado con lesión esplénica|caída de bicicleta con dolor en hipocondrio izquierdo y signos de shock',
      '*|18-65|Traumatismo encefalocraneano grave|caída de altura, Glasgow 8 y anisocoria',
      '*|20-60|Gran quemado por incendio domiciliario|quemaduras extensas, hollín en la boca y ronquera',
      'M|20-55|Quemadura eléctrica de alta tensión|contacto con cable de alta tensión, quemaduras de entrada y salida y arritmia',
      '*|25-55|Herida de arma de fuego en abdomen|herida penetrante con inestabilidad hemodinámica',
      '*|25-75|Volet costal con contusión pulmonar|accidente de tránsito con dolor torácico y respiración paradójica',
      '*|20-45|Lesión medular cervical|zambullida en aguas poco profundas, tetraparesia y arreflexia',
      '*|25-60|Posible donante con muerte encefálica|hemorragia cerebral con Glasgow 3, sin reflejos de tronco',
      '*|3-12|Quemadura por escaldadura pediátrica|niño con agua caliente en el tronco, ampollas y llanto',
    ],
    up10: [
      '*|60-85|Isquemia aguda de miembro inferior por embolia|fibrilación auricular, dolor súbito en la pierna, palidez, frialdad y ausencia de pulsos',
      'M|55-80|Claudicación intermitente|dolor en la pantorrilla al caminar 200 metros que calma con el reposo, tabaquista',
      '*|55-85|Pie diabético isquémico con gangrena|diabetes de larga data, dedo negro y dolor en reposo',
      'M|65-85|Aneurisma de aorta abdominal sintomático|dolor lumbar y masa pulsátil, tabaquista e hipertenso',
      'M|55-80|Aneurisma poplíteo trombosado|pierna fría y dolorosa con antecedente de masa pulsátil en la corva',
      '*|30-75|Trombosis venosa profunda|dolor, edema y aumento de volumen de la pantorrilla tras un viaje largo',
      '*|30-75|Tromboembolismo pulmonar|disnea súbita y dolor pleurítico con trombosis venosa reciente',
      'F|40-75|Úlcera venosa por insuficiencia venosa crónica|úlcera maleolar interna con várices, edema y pigmentación',
      '*|30-60|Tromboflebitis superficial|cordón doloroso, eritematoso y caliente sobre una várice',
      '*|60-90|Isquemia crítica de miembro|dolor en reposo nocturno que mejora colgando la pierna',
      'M|45-75|Disección aórtica|dolor torácico desgarrante que irradia a la espalda con asimetría de pulsos',
      '*|50-85|Phlegmasia cerulea dolens|miembro inferior edematoso, doloroso y cianótico',
      'M|50-70|Síndrome de Leriche|claudicación glútea, impotencia y pulsos femorales ausentes',
    ],
    up11: [
      'M|60-85|Hiperplasia prostática con retención aguda de orina|imposibilidad de orinar, dolor suprapúbico y globo vesical',
      'M|55-80|Cáncer de próstata|PSA elevado en un control, nocturia y chorro débil',
      '*|25-65|Pielonefritis obstructiva por litiasis|dolor lumbar, fiebre alta y escalofríos con cálculo ureteral conocido',
      '*|18-45|Traumatismo renal|caída de altura con dolor en el flanco y hematuria',
      'M|18-40|Rotura uretral por fractura de pelvis|accidente de tránsito, sangre en el meato y imposibilidad de orinar',
      'M|55-80|Tumor de vejiga|hematuria macroscópica indolora, tabaquista y antecedentes de exposición laboral',
      'M|18-40|Tumor testicular|masa testicular indolora hallada en el autoexamen',
      'M|1-80|Parafimosis|prepucio retraído que no vuelve y glande edematoso doloroso',
      'M|30-65|Gangrena de Fournier|dolor, fiebre y crepitación perineal en diabético',
      '*|30-60|Cólico renoureteral|dolor lumbar intenso e inquieto, náuseas y hematuria microscópica',
      'M|65-90|Retención urinaria por coágulos|hematuria y globo vesical en paciente con HPB',
      'M|20-60|Priapismo|erección dolorosa de más de 6 horas',
      'M|50-80|Estenosis uretral|chorro fino, goteo posmiccional e infecciones urinarias a repetición',
    ],
  },
  ginecologia: {
    UP1: [
      'F|30-55|Papanicolaou alterado (ASC-US)|sin control desde hace 6 años, consulta por resultado alterado',
      'F|40-65|Nódulo mamario BI-RADS 4|mamografía de control con imagen sospechosa y ecografía complementaria',
      'F|18-30|Dismenorrea primaria|dolor menstrual intenso que la incapacita para trabajar o estudiar',
      'F|20-45|Flujo vaginal con prurito (candidiasis)|leucorrea blanca grumosa, prurito y ardor luego de antibióticos',
      'F|25-40|Consulta ginecológica por control anual|consulta de rutina, historia clínica y examen mamario',
      'F|30-50|Dolor pélvico crónico|dolor pélvico de más de 6 meses, dispareunia y ecografía transvaginal a interpretar',
      'F|20-40|Dispareunia|dolor durante las relaciones sexuales, sin infecciones previas',
      'F|22-38|Análisis de la fisiología del ciclo|ciclos irregulares y consulta por fertilidad, temperatura basal y ecografía',
      'F|18-45|Consulta por autoexamen mamario|nódulo palpable en mama, dolor cíclico',
      'F|35-55|Riesgo de morbimortalidad materna evitable|control de la salud integral con factores de riesgo cardiovascular',
    ],
    UP2: [
      'F|6-8|Pubertad precoz central|telarca y crecimiento acelerado a los 7 años',
      'F|13-16|Retraso puberal|sin telarca a los 14 años y talla baja',
      'F|13-16|Síndrome de Turner|talla baja, cuello alado y ausencia de desarrollo mamario',
      'F|0-1|Hiperplasia suprarrenal congénita|recién nacida con genitales ambiguos y deshidratación',
      'F|15-18|Síndrome de insensibilidad androgénica completa|amenorrea primaria con desarrollo mamario y vello escaso',
      'F|1-8|Telarca precoz aislada|botón mamario en una niña de 2 años sin otros signos de pubertad',
      'F|1-6|Sinequia de labios menores|labios menores adheridos, madre preocupada',
      'F|3-9|Vulvovaginitis inespecífica infantil|flujo y prurito vulvar, higiene inadecuada',
      'F|4-12|Sospecha de abuso sexual infantil|lesiones genitales y cambios de conducta, abordaje interdisciplinario',
      'F|6-9|Adrenarca precoz|vello púbico y olor axilar a los 7 años, sin telarca',
      'F|8-14|Quiste ovárico en una niña|dolor abdominal bajo y masa anexial en la ecografía',
      'F|15-19|Síndrome de Kallmann|amenorrea primaria con anosmia y ausencia de caracteres sexuales',
    ],
    UP3_sec_1: [
      'F|14-19|Consulta por anticoncepción en la adolescencia|inicio de relaciones sexuales y consulta sin acompañante',
      'F|20-40|DIU con hilos no visibles|colocación hace 6 meses, no palpa los hilos y consulta por dolor',
      'F|18-35|Enfermedad pélvica inflamatoria aguda|dolor abdominal bajo, fiebre, flujo y dolor a la movilización cervical',
      'F|18-30|Cervicitis por Chlamydia trachomatis|flujo mucopurulento y sangrado poscoital',
      'F|20-45|Sífilis secundaria|exantema palmoplantar sin prurito y condilomas planos',
      'F|25-45|Lesión de alto grado (HSIL) por VPH|Papanicolaou con HSIL y test de VPH positivo',
      'F|18-35|Condilomas acuminados|lesiones verrugosas vulvares y perianales',
      'F|15-19|Embarazo en la adolescencia|amenorrea de 10 semanas, test positivo y miedo a contarlo a la familia',
      'F|20-40|Falla de anticonceptivo oral por interacción|tratamiento con rifampicina y test de embarazo positivo',
      'F|16-35|Anticoncepción de emergencia|relación sin protección hace 36 horas',
      'F|25-45|Anticoncepción en migraña con aura|consulta por método hormonal, cefalea con aura visual',
      'F|18-35|Primoinfección por herpes genital|lesiones vesiculares dolorosas vulvares, fiebre y disuria',
      'F|18-40|Vaginosis bacteriana|flujo grisáceo con olor a pescado, sin prurito',
      'F|20-40|Tricomoniasis|flujo verdoso espumoso y prurito',
    ],
    UP3_sec_2: [
      'F|18-32|Síndrome de ovario poliquístico|ciclos irregulares, hirsutismo, acné y sobrepeso',
      'F|25-38|Falla ovárica prematura|amenorrea secundaria con sofocos antes de los 40',
      'F|35-50|Sangrado uterino anormal por miomatosis|menstruaciones abundantes con coágulos y anemia',
      'F|25-40|Endometriosis|dismenorrea progresiva, dispareunia profunda e infertilidad',
      'F|20-40|Hiperprolactinemia con galactorrea|amenorrea y secreción láctea espontánea por las mamas',
      'F|28-40|Infertilidad primaria|un año de relaciones sin protección sin embarazo, estudios básicos',
      'F|22-40|Amenorrea secundaria por síndrome de Asherman|legrado previo y ausencia de menstruaciones desde entonces',
      'F|25-45|Mastalgia cíclica|dolor mamario bilateral premenstrual',
      'F|18-30|Fibroadenoma mamario|nódulo móvil, bien delimitado e indoloro',
      'F|20-40|Mastitis|dolor, eritema y fiebre en una mama',
      'F|16-40|Solicitud de interrupción legal del embarazo|embarazo de 8 semanas, consulta y consejería',
      'F|16-40|Atención posterior a una agresión sexual|consulta dentro de las primeras 72 horas, profilaxis y acompañamiento',
      'F|35-50|Adenomiosis|menstruaciones abundantes y dolorosas con útero globuloso',
      'F|20-45|Hiperandrogenismo tumoral|virilización rápida con testosterona muy elevada',
    ],
    UP3_sec_3: [
      'F|18-40|Aborto incompleto|amenorrea de 9 semanas con sangrado abundante y dolor cólico',
      'F|18-40|Embarazo ectópico roto|dolor abdominal brusco, sangrado escaso, hipotensión y lipotimia',
      'F|18-45|Mola hidatiforme completa|sangrado con útero mayor que la amenorrea y beta-hCG muy elevada',
      'F|20-40|Absceso tuboovárico|dolor abdominal bajo intenso, fiebre alta y masa anexial',
      'F|15-35|Torsión anexial|dolor pélvico súbito con náuseas y vómitos',
      'F|20-40|Rotura de quiste hemorrágico|dolor súbito luego de una relación sexual con líquido libre en la ecografía',
      'F|18-40|Aborto séptico|maniobras abortivas, fiebre alta y flujo fétido',
      'F|18-40|Amenaza de aborto|sangrado escaso, embarazo de 8 semanas y cuello cerrado',
      'F|18-42|Embarazo de localización desconocida|dolor leve, beta-hCG positiva y ecografía sin saco',
      'F|20-40|Comunicación de malas noticias|pérdida gestacional confirmada en una ecografía',
    ],
    UP3_sec_4: [
      'F|18-42|Preeclampsia grave|embarazo de 34 semanas con cefalea, escotomas y TA 170/110',
      'F|18-42|Eclampsia|convulsión tónico-clónica en una embarazada hipertensa',
      'F|20-42|Síndrome HELLP|dolor epigástrico, náuseas, plaquetopenia y aumento de transaminasas',
      'F|22-42|Placenta previa|sangrado rojo rutilante indoloro a las 32 semanas',
      'F|22-42|Desprendimiento placentario|dolor abdominal intenso, hipertonía uterina y sangrado oscuro',
      'F|18-40|Rotura prematura de membranas pretérmino|pérdida de líquido a las 30 semanas',
      'F|18-40|Amenaza de parto prematuro|contracciones regulares a las 31 semanas',
      'F|20-40|Restricción del crecimiento intrauterino|altura uterina menor a la esperada y Doppler alterado',
      'F|25-42|Diabetes gestacional|curva de tolerancia alterada a las 26 semanas',
      'F|22-40|Colestasis intrahepática del embarazo|prurito palmoplantar intenso nocturno en el tercer trimestre',
      'F|20-38|Isoinmunización Rh|paciente Rh negativa con Coombs indirecta positiva',
      'F|18-40|Sífilis gestacional|VDRL reactiva en el control prenatal',
      'F|18-40|Toxoplasmosis en el embarazo|seroconversión durante el primer trimestre',
      'F|18-40|HIV en el embarazo|diagnóstico en el primer control prenatal',
      'F|20-40|Embarazo gemelar|útero mayor a la amenorrea y dos latidos en la ecografía',
      'F|20-40|Corioamnionitis|fiebre, taquicardia fetal y flujo fétido con membranas rotas',
      'F|18-40|Hiperémesis gravídica|vómitos incoercibles, pérdida de peso y cetonuria',
      'F|18-35|Primer control prenatal|amenorrea de 8 semanas, cálculo de la fecha probable de parto y hábitos',
    ],
    UP3_sec_5: [
      'F|18-38|Trabajo de parto en fase activa|contracciones regulares, dilatación de 5 cm y cabeza encajada',
      'F|22-40|Distocia de hombros|expulsivo con signo de la tortuga en un feto macrosómico',
      'F|20-40|Hemorragia posparto por atonía uterina|puerperio inmediato con sangrado profuso y útero blando',
      'F|20-40|Retención placentaria|sin alumbramiento a los 40 minutos del parto',
      'F|30-42|Acretismo placentario|cesárea previa, alumbramiento imposible y sangrado',
      'F|20-40|Prolapso de cordón|rotura de membranas con desaceleraciones y cordón visible en vagina',
      'F|18-40|Sufrimiento fetal agudo|desaceleraciones tardías repetidas en el monitoreo',
      'F|20-40|Endometritis puerperal|fiebre y loquios fétidos a las 72 horas de una cesárea',
      'F|20-38|Mastitis puerperal|fiebre, dolor y eritema en una mama a las 2 semanas',
      'F|20-40|Dehiscencia de episiotomía|dolor perineal y secreción a los 5 días',
      'F|20-40|Presentación podálica|embarazo de 39 semanas con feto en pelviana',
      'F|18-35|Desgarro perineal grado III|expulsivo instrumental y pérdida de gases por vagina',
      'F|30-42|Inducción con Bishop desfavorable|embarazo prolongado de 41 semanas y cuello inmaduro',
      'F|20-40|Puerperio fisiológico|control a las 48 horas: involución uterina, loquios y lactancia',
    ],
    UP4: [
      'F|55-80|Sangrado posmenopáusico por cáncer de endometrio|metrorragia a los 6 años de la menopausia, obesa e hipertensa',
      'F|45-70|Pólipo endometrial|sangrado irregular y engrosamiento focal en la ecografía',
      'F|45-65|Hiperplasia endometrial atípica|sangrado y biopsia con atipia',
      'F|40-70|Cáncer de cuello uterino avanzado|sangrado poscoital, flujo fétido y dolor lumbar sin controles previos',
      'F|55-85|Prolapso genital|sensación de peso vaginal y bulto que exterioriza al esfuerzo',
      'F|45-70|Incontinencia urinaria de esfuerzo|pérdida de orina al toser y saltar, multípara',
      'F|40-75|Cáncer de mama|nódulo duro e irregular con retracción del pezón',
      'F|50-70|Mamografía de tamizaje alterada|microcalcificaciones agrupadas en el control',
      'F|50-70|Síndrome genitourinario de la menopausia|sequedad, dispareunia y disuria',
      'F|45-56|Síndrome climatérico|sofocos, insomnio y alteraciones del ánimo',
      'F|55-80|Osteoporosis posmenopáusica|fractura por fragilidad tras una caída leve',
      'F|55-80|Masa anexial posmenopáusica|dolor y distensión con Ca 125 elevado',
      'F|55-75|Consulta por sexualidad en la adulta mayor|disminución del deseo y dolor coital',
    ],
  },
};

const NOMBRES_F = ['Lucía', 'Camila', 'Valentina', 'Sofía', 'Martina', 'Julieta', 'Agustina', 'Florencia', 'Carolina', 'Paula', 'Romina', 'Natalia', 'Mariana', 'Gabriela', 'Silvana', 'Analía', 'Rocío', 'Milagros', 'Noelia', 'Daniela', 'Ivana', 'Verónica', 'Claudia', 'Graciela', 'Norma', 'Marta', 'Elena', 'Susana', 'Alejandra', 'Lorena', 'Brenda', 'Micaela', 'Antonella', 'Yamila', 'Patricia', 'Liliana', 'Ana', 'Rosa', 'Ester', 'Delfina'];
const NOMBRES_M = ['Mateo', 'Santiago', 'Lucas', 'Nicolás', 'Facundo', 'Matías', 'Tomás', 'Franco', 'Ezequiel', 'Gonzalo', 'Sebastián', 'Maximiliano', 'Diego', 'Pablo', 'Javier', 'Marcelo', 'Ricardo', 'Héctor', 'Osvaldo', 'Rubén', 'Carlos', 'Jorge', 'Raúl', 'Walter', 'Oscar', 'Néstor', 'Alberto', 'Julio', 'Ramón', 'Luis', 'Bruno', 'Agustín', 'Joaquín', 'Ignacio', 'Damián', 'Leandro', 'Cristian', 'Emiliano', 'Fabián', 'Armando'];
const APELLIDOS = ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero', 'Sánchez', 'García', 'Sosa', 'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Giménez', 'Gutiérrez', 'Peralta', 'Castro', 'Ortiz', 'Silva', 'Núñez', 'Luna', 'Cabrera', 'Ríos', 'Morales', 'Domínguez', 'Vega', 'Ledesma', 'Villalba', 'Bustos', 'Coronel'];
const OCUPACIONES = [['docente', 'docente'], ['empleada administrativa', 'empleado administrativo'], ['comerciante', 'comerciante'], ['ama de casa', 'chofer de colectivo'], ['estudiante universitaria', 'estudiante universitario'], ['jubilada', 'jubilado'], ['enfermera', 'albañil'], ['productora agropecuaria', 'productor agropecuario'], ['cocinera', 'cocinero'], ['peluquera', 'mecánico'], ['policía', 'policía'], ['operaria de fábrica', 'operario de fábrica'], ['contadora', 'contador'], ['vendedora ambulante', 'vendedor ambulante'], ['trabajadora rural', 'trabajador rural'], ['panadera', 'panadero'], ['empleada bancaria', 'empleado bancario'], ['costurera', 'electricista'], ['repartidora de aplicaciones', 'repartidor de aplicaciones'], ['limpiadora', 'plomero'], ['abogada', 'taxista']];
const ANTECEDENTES = ['sin antecedentes de relevancia', 'hipertensión arterial en tratamiento', 'diabetes tipo 2', 'tabaquismo de 20 paquetes/año', 'obesidad', 'EPOC', 'anticoagulación crónica', 'alergia a la penicilina', 'consumo de alcohol frecuente', 'cirugía abdominal previa', 'sin obra social', 'vive sola/o y lejos del hospital', 'dislipemia'];
const CONTEXTOS_URGENCIA = ['Llega por sus propios medios a la guardia', 'Ingresa trasladado/a por el SAME', 'Llega a la guardia acompañado/a por un familiar muy preocupado', 'Es derivado/a a la guardia desde un centro de salud', 'Consulta de madrugada en la guardia porque el cuadro no cede'];
const CONTEXTOS_CONSULTA = ['Consulta en el consultorio externo', 'Consulta derivado/a desde un centro de salud', 'Viene a un control programado y refiere el problema', 'Consulta acompañado/a por un familiar'];

const CasosPacientes = (() => {
  const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function parsear(linea) {
    const [sexo, edad, dx, pres] = linea.split('|');
    const [min, max] = edad.split('-').map(Number);
    return { sexo, min, max, dx, pres };
  }

  // Unidades candidatas según la temática elegida en el modal
  function unidades(modulo, tematicaTexto, tematicaId) {
    const pool = CASOS_PACIENTES[modulo];
    if (!pool) return [];
    const claves = Object.keys(pool);
    const id = String(tematicaId || '');
    if (modulo === 'cirugia') {
      let m = /^up(\d+)$/i.exec(id);
      if (m) return ['up' + m[1]];
      const t = String(tematicaTexto || '');
      if (/primer parcial|UP 1 a 5/i.test(t)) return ['up1', 'up2', 'up3', 'up4', 'up5'];
      if (/segundo parcial|UP 6 a 11/i.test(t)) return ['up6', 'up7', 'up8', 'up9', 'up10', 'up11'];
      return claves;
    }
    const m = /^up(\d+)$/i.exec(id);
    if (m) return claves.filter((k) => k === 'UP' + m[1] || k.startsWith('UP' + m[1] + '_'));
    if (claves.includes(id)) return [id];
    const t = String(tematicaTexto || '');
    if (/UP ?1 a UP ?3|parcial/i.test(t)) return claves.filter((k) => /^UP[123]/.test(k));
    return claves;
  }

  // Devuelve el bloque de texto para el systemPrompt (o '' si no hay banco para la materia)
  function generar(modulo, tematicaTexto, tematicaId, modoId) {
    const ups = unidades(modulo, tematicaTexto, tematicaId);
    if (!ups.length) return '';
    const unidad = azar(ups);
    const c = parsear(azar(CASOS_PACIENTES[modulo][unidad]));
    const sexo = c.sexo === '*' ? azar(['F', 'M']) : c.sexo;
    const edad = entre(c.min, c.max);
    const nombre = `${azar(sexo === 'F' ? NOMBRES_F : NOMBRES_M)} ${azar(APELLIDOS)}`;
    const adulto = edad >= 18;
    const validas = OCUPACIONES.filter((o) => (!/jubilad/.test(o[0]) || edad >= 60) && (!/estudiante/.test(o[0]) || edad <= 30));
    const ocupacion = adulto ? `, ${azar(validas)[sexo === 'F' ? 0 : 1]}` : '';
    const antec = edad >= 30 && modulo === 'cirugia' ? ` Antecedente de contexto (podés usarlo o ajustarlo si no contradice el cuadro): ${azar(ANTECEDENTES)}.` : '';
    return '\n\nCASO ASIGNADO PARA ESTA SESIÓN (obligatorio: usá exactamente este paciente y este cuadro, no lo reemplaces por otro "de manual" ni cambies el nombre; no reveles el diagnóstico al alumno): ' +
      `${nombre}, ${edad} ${edad === 1 ? 'año' : 'años'}, ${sexo === 'F' ? 'sexo femenino' : 'sexo masculino'}${ocupacion}. ${azar(modoId === 'shock_room' ? CONTEXTOS_URGENCIA : CONTEXTOS_URGENCIA.concat(CONTEXTOS_CONSULTA))}. ` +
      `Cuadro objetivo (lo tiene que descubrir el alumno): ${c.dx}. Presentación inicial: ${c.pres}.${antec} ` +
      'Mantené este mismo paciente, datos y cuadro durante TODA la sesión.';
  }

  const total = (modulo) => Object.values(CASOS_PACIENTES[modulo] || {}).reduce((n, l) => n + l.length, 0);
  return { generar, unidades, total, parsear };
})();

if (typeof window !== 'undefined') { window.CASOS_PACIENTES = CASOS_PACIENTES; window.CasosPacientes = CasosPacientes; }
if (typeof module !== 'undefined' && module.exports) module.exports = { CASOS_PACIENTES, CasosPacientes };
