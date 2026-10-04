# Revisión clínica · Anamnesis obstétrica (SIM)

Estado: **BORRADOR para validar con NotebookLM** contra «Guía de TP N.º 1 · Anamnesis gineco-obstétrica» (lista de cotejo de anamnesis obstétrica) y la bibliografía de la cátedra. Todo lo marcado con ❓ es una decisión mía que necesita confirmación clínica.

## Cómo funciona el simulador

- **Casos (8):** primigesta de 12 semanas, hipertensión crónica con preeclampsia previa, diabetes pregestacional, Rh negativo con aborto previo, adolescente con embarazo no deseado y violencia, cardiopatía valvular con cesárea previa, antecedente de tuberculosis con tabaquismo y embarazo de término sin patología.
- **La embarazada responde** a cada pregunta y la historia clínica se completa en pantalla (carnet perinatal, FUM y EG, embarazos previos, antecedentes, hábitos, grupo y factor, vacunas, peso y tensión arterial).
- **3D:** torso con **abdomen gestante** (la panza crece según la edad gestacional del caso), útero, feto y placenta.
- **Mesa:** carnet perinatal, historia clínica, balanza, tensiómetro, mesa y sillas; distractores: espéculo y Doppler fetal.

Fuente de la lista: Lista de cotejo: Anamnesis obstétrica. Pasos: **22** (incluye los pasos que aparecen solo en algunos casos). Casos: **8**. Preguntas de fundamentos: **9**.

## Criterios de desaprobación (PROPUESTOS ❓)

La lista de cotejo no define criterios de desaprobación automática; el simulador califica la comunicación, el uso del carnet perinatal, la FUM y la edad gestacional, los antecedentes de riesgo, el grupo y factor, las vacunas y la toma de peso y tensión arterial (propuesto, a validar).

- 🤝 **Recepción y escucha** — pasos 1, 2, 5
- 📒 **Carnet perinatal, FUM y edad gestacional** — pasos 6, 7
- ⚠️ **Antecedentes de riesgo: personales, hábitos y violencia** — pasos 12, 13, 14
- 🩸 **Grupo y factor, vacunas** — pasos 18, 19
- ⚖️ **Peso y tensión arterial** — pasos 20, 21

Pasos que el simulador marca como críticos ❓: 6, 7, 12, 13, 14, 18, 19, 21

## Dudas puntuales para NotebookLM

1. La lista agrupa en un solo ítem sub-elementos (TBC, DBT, HTA, preeclampsia, cirugías previas, infertilidad, cardiopatías y otras; tabaco, alcohol, drogas y violencia; vacunas antirrubeólica, antitetánica y antigripal). Los modelé como **un paso por grupo** (22 pasos). ¿La cátedra los evalúa por separado?
2. Sin criterios de desaprobación definidos. Propuse: carnet perinatal y FUM (6, 7), antecedentes de riesgo (12, 13, 14), grupo y factor y vacunas (18, 19), peso y tensión arterial (20, 21). ¿Cuáles son los reales?
3. Vacunación: ¿qué esquema exacto espera la cátedra (dTpa desde la semana 20, antigripal en cualquier trimestre, antirrubeólica contraindicada)?
4. ¿Se pregunta por grupo y factor sanguíneo **antes o después** de la toma de peso y tensión, según la lista? Hoy sigue el orden de la planilla.
5. Actividad física y laboral: ¿qué cantidad de horas semanales se considera aceptable/riesgosa?

## Casos clínicos

**c1 · Camila R. (24 años) — Embarazo de 12 semanas**  
Motivo: Estoy embarazada y vengo a hacerme mi primer control.  
Antecedentes: Primigesta, sin antecedentes.

**c2 · Lucía M. (31 años) — Embarazo de 28 semanas**  
Motivo: Vengo a mi control; tengo la presión alta desde hace años.  
Antecedentes: G3P2. Hipertensión arterial crónica.

**c3 · Gabriela P. (38 años) — Embarazo de 34 semanas**  
Motivo: Tengo diabetes y vengo a controlar mi embarazo.  
Antecedentes: G3P2. Diabetes pregestacional tipo 2.

**c4 · Natalia S. (29 años) — Embarazo de 32 semanas**  
Motivo: Vengo a mi control; mi grupo es negativo.  
Antecedentes: G2P0A1. Rh negativo.

**c5 · Micaela T. (16 años) — Embarazo de 30 semanas**  
Motivo: No sabía que estaba embarazada; vengo con mi mamá.  
Antecedentes: Adolescente, primigesta, sin controles previos.

**c6 · Valeria D. (36 años) — Embarazo de 24 semanas**  
Motivo: Tengo una enfermedad del corazón y estoy embarazada.  
Antecedentes: G2P1C1. Cardiopatía valvular. Infertilidad previa.

**c7 · Romina F. (27 años) — Embarazo de 20 semanas**  
Motivo: Vengo a controlarme; tuve tuberculosis.  
Antecedentes: G3P1A1. Antecedente de tuberculosis tratada.

**c8 · Paula G. (34 años) — Embarazo de 38 semanas**  
Motivo: Vengo a mi control; falta poco para el parto.  
Antecedentes: G3P2. Sin patologías.

## Mesa de instrumental

**Registro**
- Carnet perinatal — ✅ correcto · CRÍTICO. Documento donde se registran los controles del embarazo.
- Historia clínica obstétrica — ✅ correcto · CRÍTICO. Para registrar la anamnesis obstétrica.
- Lapicera y tablilla — ✅ correcto. Para registrar los datos.

**Peso y tensión**
- Balanza de pie — ✅ correcto · CRÍTICO. Para pesar a la embarazada.
- Tensiómetro y brazalete — ✅ correcto · CRÍTICO. Para tomar la tensión arterial.

**Consultorio**
- Mesa y sillas del consultorio — ✅ correcto. Lugar cómodo para conversar.

**Otros insumos**
- Espéculo vaginal — ❌ distractor. No corresponde a la anamnesis.
- Doppler fetal portátil — ❌ distractor. La auscultación fetal pertenece al examen obstétrico, no a la anamnesis.

## Acciones incorrectas que reconoce el chat

- 🚨 GRAVE · Interrumpe el relato de la embarazada — Interrumpir sesga el relato y hace perder datos espontáneos.
- 🚨 GRAVE · No solicita el carnet perinatal — El carnet perinatal es el documento clave del control: omitirlo hace perder controles, estudios y medicación previos.
- 🚨 GRAVE · Omite preguntar por el grupo y factor sanguíneo — Una madre Rh negativa requiere seguimiento (Coombs indirecto) e inmunoglobulina anti-D.
- 🚨 GRAVE · Omite preguntar por violencia, tabaco, alcohol y drogas — Son factores de riesgo materno-fetales que obligan a intervenir.
- 🚨 GRAVE · Indica la vacuna antirrubeólica durante el embarazo — La vacuna antirrubeólica (virus vivo atenuado) está contraindicada en el embarazo; se aplica en el puerperio.
- 🚨 GRAVE · No toma la tensión arterial — La tensión arterial es fundamental para detectar los trastornos hipertensivos del embarazo.
- Hace comentarios que juzgan sobre el embarazo no deseado o el estado civil — Se evitan los juicios de valor: la confianza permite detectar riesgos psicosociales.

## Pasos, fundamento y frase del alumno modelo

**1. Se presenta, saluda a la paciente y acompañante**  
Fundamento: Presentarse y saludar también al acompañante abre la relación con respeto y confianza.  
Frase modelo: “Buenas tardes, soy la doctora, me presento con mi nombre y apellido. Saludo a la paciente y a su acompañante.”

**2. Invita a tomar asiento**  
Fundamento: Invitar a sentarse favorece un ambiente cómodo y de confianza.  
Frase modelo: “La invito a tomar asiento, por favor.”

**3. Interroga sobre datos filiatorios, personales y los registra**  
Fundamento: Nombre, edad, DNI, domicilio, estado civil, ocupación, nivel de instrucción y cobertura de salud.  
Frase modelo: “Le pregunto sus datos filiatorios y personales y los registro.”

**4. Invita a la paciente a relatar el motivo que la lleva a la consulta y lo registra**  
Fundamento: Se registra el motivo de consulta con las palabras de la embarazada.  
Frase modelo: “Le pregunto qué la trae a la consulta y registro el motivo de consulta.”

**5. Escucha atentamente el relato**  
Fundamento: Escucha activa, sin interrumpir: la embarazada puede aportar datos relevantes de manera espontánea.  
Frase modelo: “Escucho atentamente el relato, sin interrumpirla.”

**6. Solicita el carnet perinatal** ⚠ crítico  
Fundamento: El carnet perinatal resume los controles, los estudios y la medicación del embarazo en curso: se lo solicita al comienzo para revisar los datos.  
Frase modelo: “Le solicito el carnet perinatal para revisar los controles del embarazo.”

**7. Pregunta sobre la FUM e interroga sobre la edad gestacional** ⚠ crítico  
Fundamento: La FUM permite calcular la edad gestacional y la fecha probable de parto; se la confirma con ecografía precoz si es dudosa.  
Frase modelo: “Le pregunto la fecha de la última menstruación (FUM) y de cuántas semanas está.”

**8. Pregunta sobre embarazos previos**  
Fundamento: Gestas, partos, cesáreas, abortos y resultados perinatales previos (prematurez, preeclampsia, diabetes gestacional).  
Frase modelo: “Le pregunto sobre embarazos previos: partos, cesáreas y abortos.”

**9. Pregunta sobre el uso de anticoncepción**  
Fundamento: Método usado antes del embarazo y planes anticonceptivos después del parto.  
Frase modelo: “Le pregunto sobre el uso de anticoncepción antes del embarazo.”

**10. Pregunta si fue un embarazo deseado o no**  
Fundamento: Si fue planificado y deseado: orienta la aceptación, el apoyo y los riesgos psicosociales.  
Frase modelo: “Le pregunto si fue un embarazo deseado o no.”

**11. Pregunta sobre un Papanicolau previo**  
Fundamento: Fecha y resultado del último PAP: el embarazo es una oportunidad para completar el tamizaje cervical.  
Frase modelo: “Le pregunto sobre un Papanicolau previo.”

**12. Pregunta sobre genitorragia** ⚠ crítico  
Fundamento: Sangrado genital durante el embarazo: amenaza de aborto, placenta previa, desprendimiento: debe indagarse siempre.  
Frase modelo: “Le pregunto sobre genitorragia: si tuvo pérdidas de sangre en este embarazo.”

**13. Pregunta por antecedentes personales: TBC, DBT, HTA, preeclampsia, cirugías previas, infertilidad, cardiopatías y otras** ⚠ crítico  
Fundamento: Tuberculosis, diabetes, hipertensión, preeclampsia previa, cirugías, infertilidad, cardiopatías y otras: definen el riesgo obstétrico.  
Frase modelo: “Pregunto por antecedentes personales: tuberculosis, diabetes, hipertensión, preeclampsia, cirugías previas, infertilidad, cardiopatías y otras.”

**14. Interroga sobre hábitos: tabaco, alcohol, drogas y violencia** ⚠ crítico  
Fundamento: Tabaco, alcohol, drogas y violencia (de pareja o familiar): factores de riesgo materno y fetal que obligan a intervenir.  
Frase modelo: “Interrogo sobre hábitos: tabaco, alcohol, drogas y si sufre violencia.”

**15. Interroga sobre el uso de medicamentos**  
Fundamento: Medicación habitual, ácido fólico, hierro y automedicación: algunos fármacos son teratogénicos.  
Frase modelo: “Interrogo sobre el uso de medicamentos, ácido fólico y hierro.”

**16. Pregunta sobre aspectos sociales, laborales y culturales: actividad física, actividad laboral y recreación**  
Fundamento: Actividad física semanal, horas de trabajo y actividades recreativas: orientan hábitos y estrés.  
Frase modelo: “Pregunto sobre aspectos sociales, laborales y culturales: actividad física, trabajo y actividades de recreación.”

**17. Pregunta sobre antecedentes familiares: TBC, DBT, HTA, preeclampsia, cirugías, infertilidad, cardiopatías y otras**  
Fundamento: Los mismos antecedentes en los familiares directos: diabetes, hipertensión, preeclampsia, malformaciones y embarazos múltiples.  
Frase modelo: “Pregunto sobre antecedentes familiares.”

**18. Pregunta sobre grupo y factor sanguíneo** ⚠ crítico  
Fundamento: El grupo y factor Rh definen el riesgo de isoinmunización: una madre Rh negativa necesita inmunoglobulina anti-D.  
Frase modelo: “Pregunto sobre el grupo y factor sanguíneo.”

**19. Pregunta sobre la vigencia de las vacunas: antirrubeólica, antitetánica y antigripal** ⚠ crítico  
Fundamento: Antitetánica (dTpa desde la semana 20), antigripal y antirrubeólica (no se aplica en el embarazo): protegen a la madre y al recién nacido.  
Frase modelo: “Pregunto sobre la vigencia de las vacunas: antirrubeólica, antitetánica y antigripal.”

**20. Pesa a la paciente**  
Fundamento: El peso y la ganancia de peso se controlan en cada visita y se grafican en el carnet.  
Frase modelo: “Pesa a la paciente en la balanza y registro el peso.”

**21. Toma la tensión arterial** ⚠ crítico  
Fundamento: La tensión arterial detecta trastornos hipertensivos del embarazo; se toma sentada, en reposo, con el brazalete adecuado.  
Frase modelo: “Tomo la tensión arterial a la paciente.”

**22. Saluda y se despide**  
Fundamento: Se agradece la consulta, se acuerda el próximo control y se despide cordialmente.  
Frase modelo: “Me despido de la paciente y acordamos el próximo control.”

## Preguntas de fundamentos

1. ¿Para qué sirve el carnet perinatal?  
   Respuesta correcta: **Resume los controles, estudios y medicación del embarazo en curso**. Se solicita al inicio para revisar la información del embarazo.
2. ¿Para qué se pregunta la FUM en la gestante?  
   Respuesta correcta: **Para calcular la edad gestacional y la fecha probable de parto**. La FUM permite estimar la EG y la FPP; se confirma con ecografía precoz si es dudosa.
3. ¿Qué significa G3 P2 A0?  
   Respuesta correcta: **3 embarazos, 2 partos y ningún aborto**. G gestas; P partos; A abortos.
4. ¿Qué riesgo implica una madre Rh negativa con pareja Rh positivo?  
   Respuesta correcta: **Isoinmunización: Coombs indirecto e inmunoglobulina anti-D**. Se solicita Coombs indirecto y se indica inmunoglobulina anti-D si corresponde.
5. ¿Cuál es una vacuna contraindicada durante el embarazo?  
   Respuesta correcta: **Antirrubeólica (virus vivo)**. Las vacunas con virus vivos atenuados están contraindicadas; la dTpa se aplica desde la semana 20.
6. ¿Qué se registra al tomar la tensión arterial en la gestante?  
   Respuesta correcta: **Cifras para detectar trastornos hipertensivos del embarazo**. Una TA ≥ 140/90 mmHg obliga a descartar preeclampsia.
7. ¿Por qué se indaga por violencia en la anamnesis obstétrica?  
   Respuesta correcta: **Es un factor de riesgo materno y fetal que obliga a intervenir**. La violencia aumenta el riesgo de parto prematuro, bajo peso y lesiones.
8. Una pérdida de sangre durante el embarazo debe...  
   Respuesta correcta: **Indagarse siempre y estudiarse**. Puede ser amenaza de aborto, placenta previa o desprendimiento.
9. ¿Qué antecedentes personales se interrogan en la embarazada?  
   Respuesta correcta: **TBC, DBT, HTA, preeclampsia, cirugías, infertilidad y cardiopatías**. Definen el riesgo obstétrico y el nivel de atención.
