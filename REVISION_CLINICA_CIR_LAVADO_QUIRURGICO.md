# Revisión clínica · Lavado de manos quirúrgico y colocación de guantes (Cirugía)

Estado: **BORRADOR para validar con NotebookLM** contra «Lista de cotejo: Lavado de manos quirúrgico y colocación de guantes – UP 1» (22 ítems) y la bibliografía de la cátedra. Todo lo marcado con ❓ es una decisión mía que necesita confirmación clínica.

## Cómo funciona el simulador

- **Casos (3):** cirugía programada (colecistectomía), **alergia al látex** (hernioplastia: cambian los guantes que corresponden) y urgencia (apendicectomía).
- **3D:** lavabo quirúrgico con canilla de palanca y chorro de agua, **manos y antebrazos reales**, espuma que se extiende de distal a proximal y se enjuaga, aro guía de hasta dónde se lava, **cronómetro** de 3 a 5 minutos, manos en alto, canilla cerrada con el codo, secado con compresa estéril y **colocación de los guantes** sobre un paquete con solapas que se abre.
- **Mesa:** ambo, gorro, barbijo, botas, jabón antiséptico con dosificador, cepillo estéril, limpiauñas, compresas estériles y guantes estériles (o sin látex si hay alergia); distractores: alcohol en gel, jabón en barra, toalla de tela, estropajo, reloj y anillos, guantes de examen.

Fuente de la lista: Lista de cotejo: Lavado de manos quirúrgico y colocación de guantes (UP 1, 22 ítems). Pasos: **22** (incluye los pasos que aparecen solo en algunos casos). Casos: **3**. Preguntas de fundamentos: **10**.

## Criterios de desaprobación (PROPUESTOS ❓)

La lista de cotejo no define criterios de desaprobación automática; el simulador califica la barrera quirúrgica, el cepillado y el lavado de distal a proximal, el secado estéril con las manos en alto y la técnica de enguantado sin contaminar (propuesto, a validar).

- 🥼 **Barrera quirúrgica y accesorios** — pasos 1, 2
- 🧼 **Cepillado y lavado de distal a proximal** — pasos 7, 8, 9
- 🙌 **Manos en alto y secado estéril** — pasos 12, 14
- 🧤 **Enguantado sin contaminar** — pasos 19, 20

Pasos que el simulador marca como críticos ❓: 1, 2, 7, 8, 9, 12, 14, 19, 20

## Dudas puntuales para NotebookLM

1. La lista **no define pasos críticos ni criterios de desaprobación**. Propuse como críticos: vestimenta (1), retirar accesorios (2), cepillado (7), lavado de antebrazos de distal a proximal (8), enjuague (9), manos en alto (12), secado con compresas estériles (14) y los dos primeros tiempos del enguantado (19, 20). ¿Cuáles son los reales?
2. Los tres lavados de la lista llegan a: **2,5 cm por encima del codo**, **3 cm por debajo del codo** y **3 cm por encima de la muñeca**. ¿Es así (orden y zonas) o es una errata de la planilla? ¿Cuántos minutos corresponde a cada uno?
3. La planilla dice que la duración total es de **3 a 5 minutos**. ¿Se evalúa con cronómetro y se penaliza lavarse menos de 3 minutos (lo modelé como acción incorrecta grave)?
4. Paso 13: «Cierra la canilla con el codo **cuando sea manual**». ¿Cómo se evalúa si la canilla es de pedal o automática (caso c3)?
5. Pasos 15 a 22: ¿se evalúa la técnica **abierta** (la de la lista) o también la cerrada? ¿Qué se espera exactamente en «Introduce los dedos en el segundo guante sin contaminar el guante colocado»?
6. Alergia al látex: ¿la cátedra espera que el alumno pregunte o verifique el tipo de guante? Lo modelé sólo en la mesa de instrumental.
7. ¿El alcohol en gel puede reemplazar el cepillado en alguna situación que la cátedra acepte? Hoy es acción incorrecta grave.

## Casos clínicos

**c1 · Martín G. (54 años) — Cirugía programada**  
Motivo: Colecistectomía laparoscópica programada.  
Antecedentes: Litiasis vesicular sintomática. Sin alergias conocidas.

**c2 · Ana P. (41 años) — Alergia al látex, Cirugía programada**  
Motivo: Hernioplastia umbilical programada. Alergia al látex.  
Antecedentes: Hernia umbilical. Alergia al látex (urticaria por contacto).

**c3 · Rubén L. (67 años) — Urgencia**  
Motivo: Apendicectomía de urgencia.  
Antecedentes: Apendicitis aguda. Sin alergias conocidas.

## Mesa de instrumental

**Vestimenta**
- Ambo quirúrgico — ✅ correcto · CRÍTICO. Pantalón y chaqueta de uso exclusivo del área quirúrgica.
- Gorro quirúrgico — ✅ correcto · CRÍTICO. Evita la caída de cabello y partículas al campo.
- Barbijo quirúrgico — ✅ correcto · CRÍTICO. Barrera para las gotitas de la vía aérea.
- Botas o cofia para el calzado — ✅ correcto · opcional. Cubren el calzado al ingresar al área quirúrgica.

**Lavado y secado**
- Jabón antiséptico con dosificador — ✅ correcto · CRÍTICO. Jabón líquido antiséptico de un dosificador, sin tocar el pico con las manos.
- Cepillo estéril con esponja — ✅ correcto · CRÍTICO. Para cepillar uñas y dedos y fregar con la esponja.
- Limpiauñas estéril — ✅ correcto · opcional. Para quitar los detritus subungueales.
- Compresas estériles — ✅ correcto · CRÍTICO. Compresas estériles de un solo uso para el secado.

**Guantes estériles**
- Guantes estériles (con látex) — ✅ correcto · CRÍTICO. Guantes quirúrgicos estériles en paquete.
- Guantes estériles sin látex — ✅ correcto · CRÍTICO. Para el paciente alérgico al látex.

**Otros insumos**
- Alcohol en gel — ❌ distractor. El alcohol en gel no reemplaza el lavado quirúrgico con jabón antiséptico y cepillado.
- Jabón común en barra — ❌ distractor. Se usa jabón antiséptico líquido con dosificador; la barra se contamina.
- Toalla de tela común — ❌ distractor. Las manos lavadas sólo se secan con compresas estériles.
- Estropajo abrasivo — ❌ distractor. El estropajo lesiona la piel; se usa un cepillo estéril con esponja.
- Reloj, anillos y pulsera — ❌ distractor. Los accesorios se retiran antes de lavarse; no forman parte de la mesa.
- Guantes de examen no estériles — ❌ distractor. Los guantes de examen no son estériles: no sirven para la cirugía.

## Acciones incorrectas que reconoce el chat

- 🚨 GRAVE · Reemplaza el lavado quirúrgico por alcohol en gel — Es criterio de desaprobación: el lavado quirúrgico de esta lista exige jabón antiséptico, cepillado y enjuague; el gel no lo reemplaza.
- 🚨 GRAVE · Deja las manos por debajo de los codos después del lavado o se las seca con el ambo — Es criterio de desaprobación: las manos bajas dejan escurrir agua contaminada desde el codo y el ambo no es estéril.
- 🚨 GRAVE · Cierra la canilla con la mano — Es criterio de desaprobación: tocar la canilla con la mano lavada la contamina; se cierra con el codo.
- 🚨 GRAVE · Se seca con una toalla común o de tela no estéril — Es criterio de desaprobación: sólo se secan con compresas estériles.
- 🚨 GRAVE · Se toca el exterior del guante con la mano sin guante — Es criterio de desaprobación: contamina el guante; la mano sin guante sólo toca la cara interna del doblez.
- 🚨 GRAVE · Se lava durante menos de 3 minutos — Es criterio de desaprobación: la duración total del lavado quirúrgico debe ser de 3 a 5 minutos.
- 🚨 GRAVE · Conserva anillos, pulseras o reloj durante el lavado — Es criterio de desaprobación: bajo las joyas se acumulan gérmenes y el lavado no las alcanza.
- Vuelve a lavar áreas ya lavadas o sube y baja el cepillo por el antebrazo — El lavado va siempre de distal a proximal sin volver sobre zonas ya lavadas.
- 🚨 GRAVE · Apoya los guantes estériles en una superficie no estéril — Es criterio de desaprobación: el paquete va sobre el campo estéril de la mesa.
- 🚨 GRAVE · Se toca la cara, el ambo o un objeto no estéril con las manos lavadas — Es criterio de desaprobación: cualquier contacto con un objeto no estéril obliga a repetir el lavado.
- 🚨 GRAVE · Usa guantes con látex en un paciente alérgico al látex — Es criterio de desaprobación: el látex puede provocar una reacción alérgica grave; se usan guantes sin látex.

## Pasos, fundamento y frase del alumno modelo

**1. Se viste con ambo quirúrgico, gorro, botas y/o cofia y barbijo** ⚠ crítico  
Fundamento: La barrera quirúrgica se completa antes de lavarse: ambo, gorro que cubre todo el pelo, barbijo que cubre nariz y boca y botas o cofia.  
Frase modelo: “Me visto con ambo quirúrgico, gorro, botas y barbijo.”

**2. Se quita los accesorios de las manos (anillos, pulseras, reloj)** ⚠ crítico  
Fundamento: Bajo los anillos, pulseras y relojes se acumulan microorganismos y el lavado no los alcanza: se retiran por completo antes de empezar.  
Frase modelo: “Me quito los accesorios de las manos: anillos, pulseras y reloj.”

**3. Abre la canilla de agua corriente**  
Fundamento: Se regula el chorro de agua corriente a una temperatura templada, sin salpicar el ambo.  
Frase modelo: “Abro la canilla de agua corriente.”

**4. Moja las manos con agua corriente**  
Fundamento: Se mojan manos y antebrazos con las manos más altas que los codos, para que el agua escurra hacia el codo.  
Frase modelo: “Mojo las manos con agua corriente.”

**5. Aplica jabón líquido con dosificador y lo aplica sobre la esponja del cepillo**  
Fundamento: Se usa jabón antiséptico líquido de un dosificador (sin tocar el pico) y se carga la esponja del cepillo estéril.  
Frase modelo: “Aplico jabón líquido con el dosificador y lo coloco sobre la esponja del cepillo.”

**6. Si fuera necesario, quita los detritus de debajo de las uñas**  
Fundamento: Con el limpiauñas estéril se retiran los detritus subungueales, que son un reservorio de gérmenes.  
Frase modelo: “Si fuera necesario, quito los detritus de debajo de las uñas con el limpiauñas.”

**7. Lava palmas, dorso de las manos y dedos, y cepilla las uñas** ⚠ crítico  
Fundamento: Se cepillan sistemáticamente palmas, dorsos, cada dedo con sus cuatro caras, espacios interdigitales y uñas.  
Frase modelo: “Lavo palmas, dorso de las manos y dedos, y cepillo las uñas.”

**8. Lava los antebrazos en forma circular, de distal a proximal, hasta 2,5 cm por encima del codo, evitando volver a las áreas ya lavadas** ⚠ crítico  
Fundamento: El lavado siempre va de la zona más limpia (manos) a la menos limpia (codo); nunca se vuelve sobre un área ya lavada.  
Frase modelo: “Lavo los antebrazos en forma circular, de distal a proximal, hasta 2,5 cm por encima del codo, sin volver a las áreas ya lavadas.”

**9. Se enjuaga con abundante agua desde la porción distal hasta la proximal** ⚠ crítico  
Fundamento: Se enjuaga con las manos en alto, de las puntas de los dedos hacia el codo, para arrastrar el jabón y los gérmenes lejos de las manos.  
Frase modelo: “Me enjuago con abundante agua desde la porción distal hasta la proximal.”

**10. Repite el procedimiento llegando hasta 3 cm por debajo del codo, enjuaga (segundo lavado)**  
Fundamento: Segundo lavado: el área es más corta (hasta 3 cm por debajo del codo) y se enjuaga de nuevo.  
Frase modelo: “Repito el procedimiento llegando hasta 3 cm por debajo del codo y enjuago: segundo lavado.”

**11. Repite el procedimiento llegando hasta 3 cm por encima de la muñeca, enjuaga (tercer lavado)**  
Fundamento: Tercer lavado: sólo manos y la zona de la muñeca (hasta 3 cm por encima), con enjuague final.  
Frase modelo: “Repito el procedimiento llegando hasta 3 cm por encima de la muñeca y enjuago: tercer lavado.”

**12. Mantiene las manos en alto, por encima del codo y fuera del ambo quirúrgico** ⚠ crítico  
Fundamento: Con las manos más altas que los codos el agua escurre hacia el codo y las manos quedan lo más limpias posible; se mantienen lejos del cuerpo y del ambo.  
Frase modelo: “Mantengo las manos en alto, por encima de los codos y fuera del ambo quirúrgico.”

**13. Cierra la canilla con el codo cuando es manual**  
Fundamento: Si la canilla no es de pie o automática, se cierra con el codo para no volver a contaminar las manos.  
Frase modelo: “Cierro la canilla con el codo.”

**14. Se seca perfectamente con compresas estériles** ⚠ crítico  
Fundamento: Se seca con una compresa estéril por cada mano, de los dedos hacia el codo y en una sola dirección, sin volver atrás.  
Frase modelo: “Me seco perfectamente con compresas estériles, de los dedos hacia el codo.”

**15. Se coloca los guantes estériles solo o con ayuda de la instrumentadora**  
Fundamento: El enguantado puede hacerlo el propio cirujano (técnica cerrada o abierta) o la instrumentadora; en este práctico se coloca solo.  
Frase modelo: “Me coloco los guantes estériles solo o con la ayuda de la instrumentadora.”

**16. Coloca los guantes estériles en el campo, sobre la mesa**  
Fundamento: El paquete de guantes se apoya sobre el campo estéril de la mesa, nunca sobre una superficie sin cubrir.  
Frase modelo: “Coloco los guantes estériles en el campo, sobre la mesa.”

**17. Abre el envoltorio**  
Fundamento: Se abre el envoltorio despegando las solapas hacia afuera, sin tocar su interior.  
Frase modelo: “Abro el envoltorio.”

**18. Toma el envoltorio por las puntas para poder abrirlo**  
Fundamento: Sólo se tocan las puntas externas del envoltorio: el interior es estéril.  
Frase modelo: “Tomo el envoltorio por las puntas para poder abrirlo.”

**19. Toma un guante por la zona más próxima (doblada) e introduce la mano, sin terminar de estirarlo** ⚠ crítico  
Fundamento: El primer guante se toma por la cara interna del doblez (la única zona que se puede tocar con la mano sin guante) y se calza sin terminar de estirar.  
Frase modelo: “Tomo un guante por la zona más próxima (doblada), introduzco la mano y coloco el guante sin terminar de estirarlo.”

**20. Introduce los dedos en el segundo guante, sin contaminar el guante colocado** ⚠ crítico  
Fundamento: Con la mano ya enguantada se toma el segundo guante por el exterior (solo con los dedos enguantados) y se introduce la otra mano sin tocar la piel ni el ambo.  
Frase modelo: “Introduzco los dedos en el segundo guante, sin contaminar el guante colocado.”

**21. Coloca el segundo guante estirándolo por completo**  
Fundamento: El segundo guante se estira por completo, cubriendo el puño del ambo.  
Frase modelo: “Coloco el segundo guante estirándolo por completo.”

**22. Estira por completo el primer guante, por el doblez**  
Fundamento: Por último se estira el primer guante tomándolo por el doblez con la mano ya enguantada.  
Frase modelo: “Estiro por completo el primer guante, por el doblez.”

## Preguntas de fundamentos

1. ¿Cuánto debe durar en total el lavado de manos quirúrgico?  
   Respuesta correcta: **De 3 a 5 minutos**. La duración total del lavado quirúrgico debe ser de 3 a 5 minutos.
2. ¿En qué dirección se lavan los antebrazos?  
   Respuesta correcta: **De distal a proximal, sin volver a las áreas ya lavadas**. Siempre de la zona más limpia (manos) a la menos limpia (codo).
3. Terminado el lavado, ¿cómo se mantienen las manos?  
   Respuesta correcta: **En alto, por encima del codo y fuera del ambo**. Con las manos en alto el agua escurre hacia el codo y no contamina las manos.
4. ¿Con qué se cierra una canilla manual?  
   Respuesta correcta: **Con el codo**. Tocarla con la mano la contamina.
5. ¿Con qué se secan las manos y los antebrazos?  
   Respuesta correcta: **Con compresas estériles**. Sólo material estéril toca las manos lavadas.
6. ¿Qué accesorios se retiran antes del lavado?  
   Respuesta correcta: **Anillos, pulseras y reloj**. Todos los accesorios de las manos y las muñecas.
7. ¿Por dónde se toma el primer guante estéril?  
   Respuesta correcta: **Por la zona doblada, que es la cara interna**. La mano sin guante sólo toca la cara interna del doblez.
8. ¿Cómo se coloca el segundo guante?  
   Respuesta correcta: **Con los dedos de la mano enguantada, sin contaminar el guante colocado**. La mano enguantada sólo toca el exterior estéril del segundo guante.
9. ¿Cuántos lavados se realizan?  
   Respuesta correcta: **Tres, cada uno llegando a una zona más corta**. Primero hasta 2,5 cm por encima del codo, luego hasta 3 cm por debajo del codo y por último hasta 3 cm por encima de la muñeca.
10. Si el paciente es alérgico al látex, ¿qué guantes se usan?  
   Respuesta correcta: **Guantes estériles sin látex**. El látex puede provocar una reacción alérgica grave.
