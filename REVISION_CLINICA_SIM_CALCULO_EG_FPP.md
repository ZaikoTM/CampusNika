# Revisión clínica · Cálculo de EG y FPP (SIM)

Estado: **BORRADOR para validar con NotebookLM** contra «Guía de TP N.º 1 · Cálculo de EG y FPP» (no incluye lista de cotejo: la secuencia de pasos es **propuesta**) y la bibliografía de la cátedra. Todo lo marcado con ❓ es una decisión mía que necesita confirmación clínica.

## Cómo funciona el simulador

- **Casos (8):** cálculos con la FUM en distintos meses (cruce de año, febrero, marzo), un embarazo de término, un postérmino, **FUM dudosa con ecografía precoz** y **ciclos de 35 días** (corrección de la FUM).
- **El alumno escribe el resultado** («la EG es de 16 semanas y 3 días», «la FPP es el 21 de noviembre»): el simulador **verifica los números**; un valor distinto es una acción incorrecta (grave).
- **3D:** abdomen gestante cuyo tamaño crece con la EG del caso, más un **gestograma** (línea de tiempo de 280 días con trimestres, FUM, hoy y FPP) y la historia clínica que se completa.
- **Mesa:** gestograma (disco), calendario, bolígrafo/cuadernillo, calculadora, carnet perinatal.

Fuente de la lista: Guía de TP N.º 1: Cálculo de EG y FPP. Pasos: **10** (incluye los pasos que aparecen solo en algunos casos). Casos: **8**. Preguntas de fundamentos: **10**.

## Criterios de desaprobación (PROPUESTOS ❓)

La guía no define criterios de desaprobación automática; el simulador califica la obtención y verificación de la FUM, el cálculo de la edad gestacional en semanas y días, la FPP por la regla de Naegele, la datación por ecografía cuando la FUM no es confiable y el registro (propuesto, a validar).

- 📅 **FUM obtenida y verificada** — pasos 1, 2, 2 bis
- 🧮 **Edad gestacional en semanas y días** — pasos 4, 5
- 👶 **Fecha probable de parto (regla de Naegele)** — pasos 6
- 🔊 **Datación por ecografía si la FUM es dudosa** — pasos 7
- 📒 **Registro de la EG y la FPP** — pasos 9

Pasos que el simulador marca como críticos ❓: 1, 2, 2 bis, 4, 5, 6, 7, 9

## Dudas puntuales para NotebookLM

1. La guía **no trae lista de cotejo**. Los 9 pasos que propuse son: FUM, confiabilidad de la FUM, corrección por ciclos largos, fecha de la consulta, días transcurridos, EG en semanas y días, FPP por Naegele, ecografía precoz si la FUM es dudosa, clasificación y registro. ¿La cátedra evalúa otra secuencia o usa el gestograma?
2. Regla de Naegele: la planilla usa **FUM + 7 días − 3 meses (+1 año)**. Para FUM de enero a marzo, ¿la cátedra enseña «+9 meses»? (Es equivalente.)
3. ¿Se acepta la FPP como **280 días** o hay que usar siempre Naegele? (Pueden diferir en 1 a 3 días.)
4. Corrección por ciclos de 35 días y por ecografía: ¿qué umbral de discrepancia exige la cátedra (más de 7 días antes de las 14 semanas)?
5. Clasificación: pretérmino < 37, término 37 a 41+6, postérmino ≥ 42; trimestres 1.º hasta 13+6, 2.º hasta 27+6, 3.º desde 28. ¿Coincide con la cátedra?

## Casos clínicos

**c1 · Camila R. (24 años) — Ciclos regulares**  
Motivo: Primer control prenatal.  
Antecedentes: Primigesta. Sin antecedentes. Sin alergias conocidas.

**c2 · Lucía M. (31 años) — Cruza dos meses de 31 días**  
Motivo: Control prenatal.  
Antecedentes: G2P1. Sin patologías. Sin alergias conocidas.

**c3 · Gabriela P. (38 años) — FPP en el año siguiente**  
Motivo: Consulta por amenorrea.  
Antecedentes: G3P2. Sin patologías. Sin alergias conocidas.

**c4 · Natalia S. (29 años) — Mes de FUM: marzo**  
Motivo: Control prenatal.  
Antecedentes: G1P0. Sin alergias conocidas.

**c5 · Romina T. (27 años) — Embarazo de término**  
Motivo: Control prenatal a término.  
Antecedentes: G2P1. Sin alergias conocidas.

**c6 · Valeria D. (36 años) — FUM dudosa · ecografía precoz**  
Motivo: Control: no recuerda bien la FUM.  
Antecedentes: G2P1. Ciclos irregulares. Dejó los anticonceptivos hace 2 meses. Sin alergias conocidas.

**c7 · Paula G. (34 años) — Ciclos de 35 días**  
Motivo: Control prenatal; ciclos largos.  
Antecedentes: G1P0. Ciclos de 35 días. Sin alergias conocidas.

**c8 · Mónica V. (40 años) — Embarazo postérmino**  
Motivo: Control a las 42 semanas.  
Antecedentes: G4P3. Sin alergias conocidas.

## Mesa de instrumental

**Cálculo**
- Gestograma (disco) — ✅ correcto · CRÍTICO. Disco giratorio para ubicar la FUM y leer la EG y la FPP.
- Calendario — ✅ correcto · CRÍTICO. Para contar los días y los meses desde la FUM.
- Bolígrafo y cuadernillo — ✅ correcto. Para hacer el cálculo por escrito.
- Calculadora — ✅ correcto · opcional. Para dividir los días por 7.

**Registro**
- Carnet perinatal — ✅ correcto · CRÍTICO. Donde se registra la EG, la FPP y el método de datación.

**Otros insumos**
- Espéculo vaginal — ❌ distractor. No se necesita para el cálculo de la EG.
- Balanza de pie — ❌ distractor. El peso no interviene en el cálculo de la EG y la FPP.

## Acciones incorrectas que reconoce el chat

- 🚨 GRAVE · Informa una edad gestacional incorrecta (semanas o días mal calculados) — Es criterio de desaprobación: un error en la edad gestacional lleva a decisiones equivocadas sobre prematurez y posmadurez.
- 🚨 GRAVE · Informa una fecha probable de parto incorrecta — Es criterio de desaprobación: aplicar mal la regla de Naegele da una fecha equivocada.
- 🚨 GRAVE · Clasifica mal el embarazo (pretérmino, de término o postérmino) — Es criterio de desaprobación: pretérmino es menor de 37 semanas; de término de 37 a 41+6; postérmino desde la semana 42.
- 🚨 GRAVE · Usa una ecografía del tercer trimestre para fechar la gestación — Es criterio de desaprobación: las ecografías tardías tienen un error muy grande; solo la del primer trimestre sirve para fechar.
- 🚨 GRAVE · Toma una FUM dudosa como confiable sin verificarla — Es criterio de desaprobación: si la FUM no es segura o los ciclos son irregulares, la edad se establece por ecografía precoz.
- Informa la FPP como una fecha exacta e inmodificable — Solo una minoría de los partos ocurre en la FPP: se la informa como una fecha aproximada; el término abarca de la semana 37 a la 41+6.
- 🚨 GRAVE · Cuenta los días a partir de la fecha de concepción o de la última relación sexual — Es criterio de desaprobación: la edad gestacional se cuenta desde el primer día de la última menstruación, no desde la concepción.
- 🚨 GRAVE · No registra la EG y la FPP en el carnet perinatal — Es criterio de desaprobación: son datos clave de todos los controles posteriores.

## Pasos, fundamento y frase del alumno modelo

**1. Interroga a la paciente sobre la fecha del primer día de su última menstruación (FUM)** ⚠ crítico  
Fundamento: La FUM es el primer día del último sangrado menstrual normal. Es el dato base del cálculo: la gestación de feto único dura en promedio 280 días (40 semanas) contados desde ese día.  
Frase modelo: “Le pregunto el primer día de su última menstruación (FUM).”

**2. Verifica que la FUM sea confiable: ciclos regulares de 28 días, sin anticonceptivos hormonales recientes ni sangrados dudosos** ⚠ crítico  
Fundamento: Una FUM es confiable si la mujer la recuerda con certeza, tiene ciclos regulares de 28 días y no usó anticonceptivos hormonales ni lactó en los meses previos. Si no, el cálculo por FUM no es válido y se fecha por ecografía precoz.  
Frase modelo: “Verifico que la FUM sea confiable: pregunto por la regularidad de los ciclos y por el uso de anticonceptivos.”

**2 bis. Corrige la FUM según la duración del ciclo (ciclo de 35 días: se suman 7 días)** ⚠ crítico *(solo en algunos casos)*  
Fundamento: Con ciclos más largos que 28 días la ovulación se retrasa: se suman a la FUM los días que exceden de 28 (en un ciclo de 35 días, 7 días) antes de calcular la EG y la FPP.  
Frase modelo: “Corrijo la FUM: como el ciclo es de 35 días, le sumo 7 días a la FUM antes de calcular.”

**3. Establece la fecha de la consulta (fecha de referencia del cálculo)**  
Fundamento: La edad gestacional se calcula hasta la fecha de referencia, que es la fecha de la consulta o de la ecografía.  
Frase modelo: “Establezco la fecha de hoy como fecha de referencia del cálculo.”

**4. Calcula los días transcurridos desde la FUM hasta la fecha de la consulta** ⚠ crítico  
Fundamento: Se cuentan los días completos entre la FUM y hoy: se suman los días que faltan para terminar el mes de la FUM, los meses completos y los días del mes actual.  
Frase modelo: “Calculo los días transcurridos desde la FUM hasta hoy: 115 días.”

**5. Expresa la edad gestacional en semanas y días (días transcurridos ÷ 7)** ⚠ crítico  
Fundamento: Los días transcurridos se dividen por 7: el cociente son las semanas completas y el resto, los días. Ej.: 115 días = 16 semanas y 3 días.  
Frase modelo: “Expreso la edad gestacional en semanas y días: 16 semanas y 3 días.”

**6. Calcula la fecha probable de parto (FPP) con la regla de Naegele: FUM + 7 días − 3 meses (+ 1 año)** ⚠ crítico  
Fundamento: Regla de Naegele: a la fecha de la FUM se le suman 7 días y se le restan 3 meses (si el mes es abril o posterior, y se suma un año); si el mes es enero a marzo se suman 9 meses. Da la fecha en que se cumplen las 40 semanas.  
Frase modelo: “Calculo la FPP con la regla de Naegele: FUM más 7 días, menos 3 meses; la fecha probable de parto es el 21 de noviembre.”

**7. Confirma o corrige la edad gestacional con la ecografía del primer trimestre (longitud cráneo-caudal)** ⚠ crítico *(solo en algunos casos)*  
Fundamento: Si la FUM no es confiable o la ecografía del primer trimestre difiere de la FUM en más de 7 días antes de las 14 semanas, se toma la edad por ecografía (longitud cráneo-caudal). Las ecografías tardías no sirven para fechar.  
Frase modelo: “Confirmo la edad gestacional con la ecografía del primer trimestre, midiendo la longitud cráneo-caudal.”

**8. Clasifica el embarazo según la edad gestacional (pretérmino, de término o postérmino) y el trimestre**  
Fundamento: Según la EG: pretérmino (< 37 semanas), de término (37 a 41 semanas y 6 días) y postérmino (≥ 42 semanas). Trimestres: 1.º hasta la semana 13+6, 2.º de la 14 a la 27+6 y 3.º desde la semana 28.  
Frase modelo: “Clasifico el embarazo como pretérmino y lo ubico en el trimestre que corresponde.”

**9. Registra la edad gestacional y la FPP en el carnet perinatal y en la historia clínica** ⚠ crítico  
Fundamento: La EG, la FPP y el método usado para fecharla (FUM o ecografía) se anotan en el carnet perinatal y en la historia clínica y se informan a la paciente, aclarando que solo una minoría de los partos ocurre exactamente en la FPP.  
Frase modelo: “Registro la edad gestacional y la fecha probable de parto en el carnet perinatal y en la historia clínica.”

## Preguntas de fundamentos

1. ¿Desde qué momento se cuenta la edad gestacional?  
   Respuesta correcta: **Desde el primer día de la última menstruación**. La edad gestacional se cuenta desde la FUM (aunque la concepción ocurra unos 14 días después).
2. ¿Cuántos días dura en promedio un embarazo de feto único contados desde la FUM?  
   Respuesta correcta: **280 días (40 semanas)**. 40 semanas = 280 días desde la FUM, o 266 días desde la concepción.
3. ¿Cómo se aplica la regla de Naegele con una FUM en mayo?  
   Respuesta correcta: **Se suman 7 días y se restan 3 meses, sumando un año**. Para FUM de abril a diciembre: +7 días, −3 meses y +1 año; de enero a marzo: +7 días y +9 meses.
4. Una paciente cursa 115 días desde su FUM. ¿Cuál es su edad gestacional?  
   Respuesta correcta: **16 semanas y 3 días**. 115 ÷ 7 = 16, resto 3.
5. ¿Qué se hace con una FUM dudosa?  
   Respuesta correcta: **Se fecha con la ecografía del primer trimestre (LCC)**. La ecografía precoz (LCC) es el mejor método de datación cuando la FUM no es confiable.
6. En una mujer con ciclos regulares de 35 días, ¿qué corrección se aplica a la FUM?  
   Respuesta correcta: **Se le suman 7 días**. La ovulación se retrasa tantos días como excede el ciclo de 28.
7. ¿Desde qué edad gestacional un embarazo es de término?  
   Respuesta correcta: **37 semanas**. De término: 37 a 41+6 semanas; pretérmino: menos de 37; postérmino: 42 o más.
8. ¿Qué trimestre cursa una gestante de 29 semanas?  
   Respuesta correcta: **El tercer trimestre (desde la semana 28)**. 1.º hasta la 13+6; 2.º de la 14 a la 27+6; 3.º desde la 28.
9. ¿Qué ecografía tiene mayor precisión para datar el embarazo?  
   Respuesta correcta: **La del primer trimestre (hasta la semana 13+6)**. Su error es de ± 5 a 7 días; el error crece a medida que avanza la gestación.
10. ¿Por qué es importante calcular bien la EG?  
   Respuesta correcta: **Para evitar partos prematuros iatrogénicos y reducir la morbimortalidad neonatal**. Un error de cálculo puede llevar a inducir un parto antes de término o a no detectar un postérmino.
