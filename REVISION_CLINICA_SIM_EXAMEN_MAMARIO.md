# Revisión clínica · Examen mamario (SIM)

Estado: **VALIDADO con NotebookLM.** Paso 4 unificado, secuencia de inspección y palpación en decúbito y autoexamen mensual a los 7-10 días del inicio de la regla confirmados; se aceptan cuadrantes, espiral o tiras verticales. Referencia: contra «Guía de TP N.º 3 · Examen mamario» (lista de cotejo de 18 ítems) y la bibliografía de la cátedra. Todo lo marcado con ❓ es una decisión mía que necesita confirmación clínica.

## Cómo funciona el simulador

- **Casos (7):** mama normal, **fibroadenoma** (nódulo móvil), **carcinoma** (nódulo duro, piel de naranja, retracción del pezón y adenopatías axilares), **mastopatía fibroquística**, **galactorrea**, **secreción hemática unilateral** (papiloma) y **mastitis lactacional**.
- **3D:** torso femenino con **mamas, areola, pezón, tubérculos de Montgomery, red venosa de Haller** y la **glándula con sus nódulos** por transparencia; la **mano palpa por cuadrantes** (del pezón a la periferia y de regreso) en ambas mamas, presiona el pezón (con secreción de distinto color) y lo eleva con la areola; el **autoexamen** se muestra con círculos, tiras verticales y cuña.
- **En pantalla:** pictograma de la postura (manos en la cintura / brazos en alto), **mapa de cuadrantes** de ambas mamas que se completa y marca el nódulo hallado.
- **Mesa:** bata, biombo, alcohol en gel, camilla, guía del autoexamen; distractores: mamógrafo, gel de ecografía, aguja de punción.

Fuente de la lista: Lista de cotejo: Examen mamario (18 ítems). Pasos: **18** (incluye los pasos que aparecen solo en algunos casos). Casos: **7**. Preguntas de fundamentos: **12**.

## Criterios de desaprobación (PROPUESTOS ❓)

La lista de cotejo no define criterios de desaprobación automática; el simulador califica la información y la intimidad, la inspección en dos posiciones, la palpación ordenada por cuadrantes de ambas mamas, la exploración del pezón y la axila y la enseñanza del autoexamen (propuesto, a validar).

- 🛡️ **Información, lavado de manos e intimidad** — pasos 4, 5
- 👁️ **Inspección en dos posiciones, axila y supraclavicular** — pasos 6, 7, 8
- 🖐️ **Palpación ordenada por cuadrantes** — pasos 11
- 💧 **Pezón: secreción y movilidad** — pasos 12, 13, 14
- 🪞 **Enseñanza del autoexamen** — pasos 15

Pasos que el simulador marca como críticos ❓: 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15

## Dudas puntuales para NotebookLM

1. Sin criterios de desaprobación definidos. Propuse: información, lavado de manos e intimidad (4, 5), inspección en dos posiciones (6, 7, 8), palpación por cuadrantes (11), pezón (12, 13, 14) y autoexamen (15). ¿Cuáles son los reales?
2. El paso 4 une «informa sobre el procedimiento» y «procede al lavado de manos». Lo modelé como **un solo paso** con ambos componentes. ¿Es correcto?
3. ¿La cátedra espera que se palpe la **axila** y la fosa supraclavicular también en decúbito, o solo se inspecciona (paso 7)?
4. Técnica de palpación: la planilla menciona cuadrantes desde el pezón a la periferia; ¿se acepta también el método de **tiras verticales** (espiral)?
5. Autoexamen: ¿qué día del ciclo (7-10 días del primer día de la menstruación o los días siguientes al sangrado) y con qué frecuencia (mensual)?
6. Secreciones: ¿qué clasificación espera la cátedra (lechosa, serosa, serohemática, hemática, purulenta)?

## Casos clínicos

**c1 · Carolina M. (25 años) — Mama normal**  
Motivo: Control mamario de rutina.  
Antecedentes: Sin antecedentes. Sin alergias conocidas.

**c2 · Lucía F. (22 años) — Nódulo móvil**  
Motivo: Noté una «bolita» en la mama derecha.  
Antecedentes: Sin antecedentes. Sin alergias conocidas.

**c3 · Gladys R. (58 años) — Sospecha de cáncer de mama**  
Motivo: Tengo una dureza en la mama izquierda y el pezón metido.  
Antecedentes: Menopausia a los 51 años. Terapia hormonal por 8 años. Madre con cáncer de mama. Sin alergias conocidas.

**c4 · Marcela V. (40 años) — Mastopatía fibroquística**  
Motivo: Dolor y bultos en ambas mamas antes de la menstruación.  
Antecedentes: Nuligesta. Sin alergias conocidas.

**c5 · Soledad A. (30 años) — Galactorrea**  
Motivo: Sale leche de mis pechos y no estoy amamantando.  
Antecedentes: Nuligesta. Amenorrea secundaria hace 6 meses. Sin alergias conocidas.

**c6 · Alicia P. (45 años) — Secreción hemática unilateral**  
Motivo: Mancho el corpiño con sangre de la mama derecha.  
Antecedentes: G2P2. Sin alergias conocidas.

**c7 · Natalia G. (29 años) — Mastitis lactacional**  
Motivo: Dolor, calor y enrojecimiento en la mama izquierda; estoy amamantando.  
Antecedentes: Puérpera de 3 semanas, lactancia materna. Sin alergias conocidas.

## Mesa de instrumental

**Privacidad e higiene**
- Bata de la paciente — ✅ correcto · CRÍTICO. Para que la paciente se descubra resguardando su pudor.
- Biombo — ✅ correcto · CRÍTICO. Para que la paciente se cambie con privacidad.
- Alcohol en gel — ✅ correcto · CRÍTICO. Higiene de manos antes de examinar.
- Camilla — ✅ correcto · CRÍTICO. Para el decúbito dorsal en la palpación.

**Educación**
- Guía del autoexamen mamario — ✅ correcto · opcional. Material para enseñar el autoexamen a la paciente.

**Otros insumos**
- Mamógrafo — ❌ distractor. La mamografía es un estudio complementario; no forma parte del examen clínico.
- Gel conductor para ecografía — ❌ distractor. La ecografía mamaria se indica después del examen clínico.
- Jeringa y aguja para punción — ❌ distractor. La punción se indica según los hallazgos, no en el examen clínico de rutina.

## Acciones incorrectas que reconoce el chat

- 🚨 GRAVE · Palpa las mamas sin haberlas inspeccionado antes — Es criterio de desaprobación: la inspección (con las manos en la cintura y con los brazos en alto) precede a la palpación y detecta retracciones y asimetrías.
- 🚨 GRAVE · Palpa solo la mama que le preocupa a la paciente — Es criterio de desaprobación: se examinan siempre ambas mamas y las axilas, comparándolas.
- 🚨 GRAVE · Palpa los cuadrantes sin orden ni sistema — Es criterio de desaprobación: se palpa cuidadosa y ordenadamente por cuadrantes, desde el pezón a la periferia y de regreso.
- 🚨 GRAVE · Omite la exploración de las axilas y las fosas supraclaviculares — Es criterio de desaprobación: las adenopatías axilares y supraclaviculares orientan la extensión de la enfermedad.
- 🚨 GRAVE · No resguarda la intimidad de la paciente — Es criterio de desaprobación: se utiliza bata y biombo y solo se descubren las mamas durante el examen.
- Presiona o comprime la mama con fuerza excesiva o con las uñas — La palpación se hace con la palma y las yemas de los dedos, con presión graduada, sin pellizcar ni usar las uñas.
- 🚨 GRAVE · Indica a la paciente que no hace falta hacerse el autoexamen ni consultar ante cambios — Es criterio de desaprobación: se debe enseñar el autoexamen y la consulta ante cualquier cambio.
- 🚨 GRAVE · Omite la presión del pezón para ver si hay secreción — Es criterio de desaprobación: la secreción es un dato clave (hemática, serosa, lechosa o purulenta).
- Palpa con la paciente sentada sin extender el brazo o sin posición adecuada, descartando el decúbito — Para la palpación se coloca a la paciente en decúbito dorsal con las manos bajo la nuca, aplanando la mama sobre el tórax.
- 🚨 GRAVE · No se lava las manos antes de examinar — Es criterio de desaprobación: la higiene de manos es obligatoria antes de tocar a la paciente.

## Pasos, fundamento y frase del alumno modelo

**1. Saluda y se presenta**  
Fundamento: Saludar y presentarse con nombre y rol genera confianza antes de un examen íntimo.  
Frase modelo: “Buenas tardes, soy la doctora, me presento con mi nombre y apellido.”

**2. Invita a sentarse a la paciente y al familiar**  
Fundamento: Se invita a sentarse a la paciente y a su acompañante para conversar antes del examen.  
Frase modelo: “Invito a sentarse a la paciente y a su familiar.”

**3. Inicia el interrogatorio y pregunta sobre antecedentes de patología mamaria** ⚠ crítico  
Fundamento: Se pregunta por dolor, nódulos, secreciones, cambios en la piel o el pezón, cirugías mamarias, uso de hormonas, lactancia, menarca, menopausia y antecedentes familiares de cáncer de mama y ovario.  
Frase modelo: “Inicio el interrogatorio y pregunto sobre antecedentes de patología mamaria.”

**4. Informa a la paciente y a su acompañante sobre el procedimiento que realizará para palpar las mamas y procede al lavado de manos** ⚠ crítico  
Fundamento: Se explica en qué consiste el examen y que no debería doler, y se realiza el lavado de manos (con alcohol en gel o agua y jabón) antes de tocar a la paciente.  
Frase modelo: “Informo a la paciente y a su acompañante sobre el procedimiento para palpar las mamas y me lavo las manos.”

**5. Resguarda la intimidad y privacidad de la paciente: le indica que se coloque una bata y se ubique detrás del biombo** ⚠ crítico  
Fundamento: Se resguarda el pudor de la paciente con una bata y un biombo, y solo se descubren las mamas durante el examen.  
Frase modelo: “Resguardo su intimidad: le indico que se coloque una bata y se ubique detrás del biombo.”

**6. Invita a la paciente a sentarse con las manos en la cintura, descubrirse hasta la cintura y observa ambas mamas, el pezón y la areola** ⚠ crítico  
Fundamento: Con la paciente sentada, con las manos en la cintura (contrae los pectorales) y descubierta hasta la cintura, se comparan ambas mamas en simetría, forma y tamaño, y se observan el pezón y la areola.  
Frase modelo: “La invito a sentarse con las manos en la cintura, descubrirse hasta la cintura y observo ambas mamas, el pezón y la areola.”

**7. En la misma posición, con los brazos en alto, inspecciona la región axilar y supraclavicular** ⚠ crítico  
Fundamento: Con los brazos en alto se evidencian retracciones y asimetrías que no se ven con los brazos abajo, y se inspeccionan las regiones axilares y supraclaviculares en busca de adenopatías.  
Frase modelo: “Con los brazos en alto inspecciono la región axilar y supraclavicular.”

**8. Registra y observa su tamaño y conformación, prominencias o depresiones, edemas y procesos inflamatorios visibles en la superficie de la mama** ⚠ crítico  
Fundamento: Se registra el tamaño, la simetría, las prominencias o retracciones, el edema de la piel («piel de naranja») y los signos inflamatorios (eritema, calor).  
Frase modelo: “Registro y observo el tamaño y la conformación de las mamas, prominencias o depresiones, edemas y procesos inflamatorios visibles.”

**9. Identifica los cambios de pigmentación en el pezón, las areolas y las grietas**  
Fundamento: Se observan el color de la areola y el pezón, las grietas, las erosiones y el eczema (enfermedad de Paget).  
Frase modelo: “Identifico los cambios de pigmentación en el pezón y las areolas, y las grietas.”

**10. Reconoce la existencia de los tubérculos de Montgomery en la areola primaria y la red venosa de Haller en la superficie de la glándula mamaria**  
Fundamento: Los tubérculos de Montgomery son glándulas sebáceas de la areola (se hacen prominentes en el embarazo); la red venosa de Haller es la red de venas subcutáneas, más visible en el embarazo o ante un tumor.  
Frase modelo: “Reconozco los tubérculos de Montgomery en la areola primaria y la red venosa de Haller en la superficie de la glándula.”

**11. Le pide que se coloque en decúbito dorsal con las manos debajo de la región cervical y palpa cuidadosa y ordenadamente cada mama por cuadrantes, desde el pezón hacia la periferia y de regreso** ⚠ crítico  
Fundamento: En decúbito dorsal con las manos bajo la nuca se aplana la mama sobre el tórax. Con la palma y las yemas de los dedos se palpa cada cuadrante (superoexterno, superointerno, inferointerno e inferoexterno) desde el pezón hacia la periferia y de regreso, comparando ambas mamas y la prolongación axilar.  
Frase modelo: “Le pido que se coloque en decúbito dorsal con las manos debajo de la nuca y palpo cuidadosa y ordenadamente cada mama por cuadrantes, desde el pezón a la periferia y de regreso.”

**12. Realiza la palpación de la areola y el pezón, presionando el pezón entre los dedos pulgar e índice** ⚠ crítico  
Fundamento: Se palpa la areola y se presiona suavemente el pezón entre el pulgar y el índice para evaluar su consistencia y expresar secreciones.  
Frase modelo: “Palpo la areola y el pezón, presionando el pezón entre los dedos pulgar e índice.”

**13. Observa si al presionar existe algún tipo de secreción** ⚠ crítico  
Fundamento: Se observa el aspecto de la secreción: lechosa (galactorrea), serosa, serohemática o hemática (papiloma intraductal o neoplasia) o purulenta (infección). La secreción unilateral, espontánea y de un solo conducto exige estudio.  
Frase modelo: “Observo si al presionar existe algún tipo de secreción.”

**14. Levanta el pezón junto con la areola para comprobar si hay buena movilidad o adherencia** ⚠ crítico  
Fundamento: Se eleva el complejo areola-pezón para evaluar su movilidad: la fijación o adherencia a planos profundos o la retracción sugieren una neoplasia subyacente.  
Frase modelo: “Levanto el pezón junto con la areola para comprobar si hay buena movilidad o adherencia.”

**15. Enseña a la paciente a realizar el autoexamen de mamas** ⚠ crítico  
Fundamento: Se enseña el autoexamen mensual (unos días después de la menstruación; en la posmenopausia, siempre el mismo día): frente al espejo y en decúbito, con la pulpa de los dedos, en círculos, en tiras verticales o en cuña, sin olvidar la axila y el pezón. Se consulta ante cualquier cambio.  
Frase modelo: “Le enseño a la paciente a realizar el autoexamen de mamas.”

**16. Invita a la paciente a vestirse**  
Fundamento: Se la invita a vestirse con privacidad y se la espera sentada para comentar los hallazgos.  
Frase modelo: “La invito a vestirse.”

**17. Escucha y responde las preguntas, preocupaciones y molestias de la paciente**  
Fundamento: Se da espacio para dudas, se explican los hallazgos con claridad y se indican los estudios y controles (mamografía, ecografía mamaria).  
Frase modelo: “Escucho y respondo las preguntas, preocupaciones y molestias de la paciente.”

**18. Saluda y se despide**  
Fundamento: El saludo final cierra la consulta.  
Frase modelo: “Saludo y me despido de la paciente.”

## Preguntas de fundamentos

1. ¿En qué posición se inspeccionan las mamas?  
   Respuesta correcta: **Sentada, con las manos en la cintura y luego con los brazos en alto**. La inspección en esas dos posiciones evidencia retracciones y asimetrías.
2. ¿En qué posición se palpan las mamas?  
   Respuesta correcta: **Decúbito dorsal con las manos bajo la nuca**. Aplana la mama sobre el tórax y facilita la palpación.
3. ¿Cómo se palpa cada mama?  
   Respuesta correcta: **Por cuadrantes, desde el pezón a la periferia y de regreso**. Palpación ordenada por cuadrantes, con palma y yemas de los dedos.
4. ¿Cuáles son los cuadrantes de la mama?  
   Respuesta correcta: **Superoexterno, superointerno, inferoexterno e inferointerno (más la prolongación axilar)**. El cuadrante superoexterno es el más frecuente de tumores por su mayor cantidad de glándula.
5. ¿Qué son los tubérculos de Montgomery?  
   Respuesta correcta: **Glándulas sebáceas de la areola**. Se hacen más prominentes durante el embarazo.
6. ¿Qué es la red venosa de Haller?  
   Respuesta correcta: **La red de venas subcutáneas de la mama**. Se vuelve más visible en el embarazo, la lactancia o ante un tumor.
7. Un nódulo duro, irregular, adherido y con retracción del pezón sugiere...  
   Respuesta correcta: **Cáncer de mama**. Son signos de malignidad: requiere mamografía, ecografía y biopsia.
8. Un nódulo liso, móvil y elástico en una mujer joven sugiere...  
   Respuesta correcta: **Fibroadenoma**. El fibroadenoma es el tumor benigno más frecuente en mujeres jóvenes.
9. Una secreción hemática unilateral por un solo conducto sugiere...  
   Respuesta correcta: **Papiloma intraductal (o neoplasia): requiere estudio**. La secreción espontánea unilateral de un solo conducto exige estudio.
10. Una secreción lechosa bilateral fuera de la lactancia se llama...  
   Respuesta correcta: **Galactorrea (descartar hiperprolactinemia)**. Se estudia la prolactina, la TSH y los fármacos.
11. ¿Cuándo se recomienda hacerse el autoexamen mamario?  
   Respuesta correcta: **Una vez por mes, unos días después de la menstruación**. En la posmenopausia, siempre el mismo día de cada mes.
12. Fijación del pezón y de la areola a planos profundos sugiere...  
   Respuesta correcta: **Neoplasia subyacente**. La movilidad conservada del complejo areola-pezón es normal.
