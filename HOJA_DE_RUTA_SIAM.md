# Hoja de ruta — Módulo S.I.A.M. (Salud Integral del Adulto Mayor, 5° año)

## 1. Qué hay que cubrir (lo que leí de tus PDFs)

| UP | Título | Parcial | Ejes principales |
|----|--------|---------|------------------|
| 1 | El adulto mayor y el agua | P1 | Nefro-urología (hematuria, litiasis, ITU, prostatitis, HBP, tumores, IRC) · AINEs · antibióticos · diuréticos |
| 2 | Vida cotidiana I | P1 | Síndrome metabólico, obesidad, HTA, dislipemias, ACV, síndromes focales, miastenia, tétanos · antihipertensivos, hipolipemiantes · capacidad civil |
| 3 | Vida cotidiana II | P1 | Paratiroides, eritema polimorfo/Stevens-Johnson/Lyell, trastornos motores, vértigo, cerebeloso, Parkinson, reumatología (artrosis, osteoporosis, gota, fibromialgia) · corticoides, antigotosos, antiparkinsonianos |
| 4 | Vida cotidiana III | P1 | Delirium, demencia, Alzheimer, estenosis aórtica/mitral, catarata/glaucoma/DMAE · antidemenciales, psicofármacos |
| 5 | Vida cotidiana IV | P1 | Insuficiencia aórtica/mitral, insuficiencia venosa, TVP, TEP, melanoma y precursores, hemorroides, osteoporosis · calcio, vit. D, anticoagulantes |
| 6 | Su corazón I | P2 | Miocardiopatías (hipertrófica, dilatada, restrictiva, chagásica), insuficiencia cardíaca, Chagas |
| 7 | Su corazón II | P2 | Arritmias (FA, flutter, TV, bloqueos, WPW, QT largo), marcapasos, cardioversión · antiarrítmicos |
| 8 | Sexualidad y descanso | P2 | Sueño normal y trastornos (insomnio, apneas, narcolepsia), disfunciones sexuales · hipnóticos, IPDE-5 |
| 9 | Final de la vida | P2 | Pénfigos, úlceras por presión, cáncer de esófago/estómago, paliativos, dolor, coma, PCR, ética, medicina legal (muerte, certificado de defunción) |

- **Parcial 1 = UP1 a UP5 · Parcial 2 = UP6 a UP9 · Final = ambos juntos.**
- Cada UP mezcla varias materias (Medicina Interna por especialidad, Farmacología, Psicología, Fisiología, Medicina Legal, Oftalmología) más una lista de **Procedimientos**.
- Ojo: los PDF "Contenidos P1/P2" son una versión **más corta** que "Contenidos SIAM". Por ejemplo la UP2 de P1 tiene 1.8k caracteres contra 4.5k de la completa. Hay que fijar en el Sprint 0 qué temas entran de verdad en cada parcial.

## 2. Las 9 acreditaciones (listas de cotejo)

Todas tienen el mismo formato: tabla de pasos con columnas **Lo hace? SI / NO / +/-**, y encabezado de estudiante, fecha, tutor y tutoría.

| Acreditación | Pasos | UP probable* |
|---|---|---|
| Sonda vesical (SV) | 30 | 1 |
| Urograma excretor (UE) | 15 | 1 |
| Tacto rectal (TR) | 25 | 1 / 5 |
| Intubación endotraqueal (IET) | 26 | 2 |
| TC de cráneo (TC) | 27 | 2, 3, 4 |
| Rx de esqueleto óseo (RxO) | 16 | 3, 5 |
| RMN cerebral | 14 | 3, 4 |
| Artrocentesis (ArtroC) | 45 | 3 |
| RCP avanzado | 24 | 7, 9 |

\* Asignación inferida por la lista de procedimientos de cada UP. La confirmamos con vos en el Sprint 0.

## 3. Cómo está armado hoy Ginecología / Cirugía (lo que hay que replicar)

- **Hub**: `gineco_hub.html` / `cirugia_hub.html` con 3 tarjetas (Estudio, Simulador de exámenes, Duelos). Falta `siam_hub.html`.
- **Estudio**: `js/estudio/estudio.js` carga un JSON del área (`data/gineco_data.json`: unidades con objetivos, contenidos, recursos) y tiene un tema de color por `body[data-modulo]`.
- **Banco choice**: un JSON por UP, `data/UP1_ginecologia.json`, con `{id, pregunta, opciones a-d, respuesta_correcta, justificacion}`.
- **Examen a desarrollar**: `data/escrito_<area>.json` (`examen.html` ya arma `escrito_${modulo}.json`).
- **Examen oral / casos / modos**: `js/examModesConfig.js` (temática por materia, modos clásico, time attack, etc.) y `js/casosPacientes.js`.
- **Puntos de enganche ya existentes para SIAM** (hoy vacíos): `data/modulos.json` (estado "proximamente"), `campus.html` (tarjeta de módulos + selector admin con `ups: []`), `examen.html` (`ICONOS_AREA`), `js/admin.js`, `js/rendimiento.js`.
- **Otros archivos que mencionan las áreas**: `programaTemas.js`, `salaEstudio.js`, `foro.js`, `pomodoroBar.js`, `versus.html`, y el SQL del admin.
- **Simulador modelo**: `recetarios.html` + `js/recetariosData.js` + `css/recetarios.css` (casos generados, guía, reglas, corrección).

## 4. Sprints

**Sprint 0 — Cimientos (sin contenido pesado)**
- Fijar el temario real de P1/P2/Final (diferencias entre los PDF) y la asignación acreditación → UP.
- Activar el módulo: `data/modulos.json`, `siam_hub.html`, tarjeta en `campus.html`, selector admin con las 9 UP, iconos y color propio.
- Esqueleto `data/siam_data.json` (9 unidades con título, objetivos, contenidos por materia) y que Estudio lo cargue.
- Resultado: SIAM aparece en el campus con el programa completo navegable y checklists de progreso.

**Sprint 1 — Atlas virtual de acreditaciones (reutilizable en todas las áreas)**
- Referencia: el simulador de auscultación del video. Modelo visual interactivo con puntos clicables ("focos"), pestañas **Explorar / Entrenar**, interruptores de capas (Rayos X, Mapa, Focos) y panel lateral con el estado del paciente.
- Una página `acreditaciones.html` + `js/acreditaciones.js` y un archivo por acreditación en `data/acreditaciones/<area>/<id>.json`. Los 9 atlas de SIAM salen del mismo motor.
- Cada acreditación es un **recorrido paso a paso** sobre una escena (mesa de materiales, paciente, imagen o estudio), con sus pasos exactos de la lista de cotejo:
  - **Explorar:** tocás cada elemento (material, zona del cuerpo, estructura de la imagen) y ves qué es, por qué y en qué paso entra.
  - **Entrenar:** el sistema te guía y te corrige en el momento.
  - **Evaluar:** sin ayudas, con la lista de cotejo como corrección (SI / NO / +/-).
- Tipos de escena según la acreditación:
  - Procedimientos (sonda vesical, tacto rectal, intubación, artrocentesis, RCP): escena con paciente, mesa de materiales y orden de pasos.
  - Imágenes (TC de cráneo, Rx, urograma, RMN): visor con imágenes reales o esquemáticas y puntos para marcar (rótulo, lado, plano, ventana, hallazgos).
- **Corrección estricta**: cada paso tiene un peso y algunos se marcan como **críticos (criterio de desaprobación)**. Si fallás un crítico, el resultado es DESAPROBADO aunque el puntaje total sea alto, y se muestra qué falló y por qué.
- Candidatos a críticos (tenés que validarlos vos, que conocés a la cátedra): consentimiento informado, verificación de identidad y de la indicación, lavado de manos y asepsia, orden de seguridad (por ejemplo cricoides y saturómetro en intubación), lateralidad en imágenes, y la impresión diagnóstica final.
- Después se suman las de Cirugía y Ginecología con el mismo motor.

**Sprint 2 — Banco de 100 choice por UP (900), lo armás vos con NotebookLM**
- Yo preparo antes: el formato de archivo, el importador y los prompts para NotebookLM (ver anexo).
- Cada UP: 5 bloques de 20 preguntas, 4 opciones, con respuesta correcta y justificación.
- Reglas del prompt: cubrir todos los temas del temario sin dejar ninguno afuera, priorizar lo más tomado en mesas anteriores, responder y justificar con la bibliografía, repartir la letra correcta en forma pareja (a/b/c/d) y que la opción correcta no sea siempre la más larga.
- La **justificación se muestra solo en NikaMed+ y en admin**. El plan gratuito ve la respuesta correcta sin el detalle.
- Cuando me pases los archivos: los valido (formato, 4 opciones, letras repartidas, duplicados, largo de opciones), los integro a `examen.html` y a Duelos.

**Sprint 3 — Segundo banco de 50 choice por UP (450)**
- Preguntas por tema, orientadas a lo que se toma en finales y exámenes previos (usando las mesas y el parcial vertical como guía de estilo y énfasis).
- Etiquetado por tema y por materia para el repaso dirigido.

**Sprint 4 — Examen a desarrollar**
- `data/escrito_siam.json` con consignas por UP (en el formato de `escrito_ginecologia.json`) y pauta de corrección.

**Sprint 5 — Examen oral**
- Escenarios por UP para el modo oral con tribunal, más la configuración de SIAM en `examModesConfig.js` y casos de pacientes (`casosPacientes.js`).
- Variantes geriátricas: polifarmacia, delirium, final de vida, comunicación con familia.

**Sprint 6 — Integración y pulido**
- Rendimiento por UP, Pomodoro, foro, ranking de Duelos, repaso espaciado, caché offline (`sw.js`) y pruebas en celular.

## 5. Decisiones que necesito de vos

1. **Fuente y calidad**: las preguntas se arman desde el temario y tus materiales, y conviene que alguien de la cátedra o vos revisen una muestra por UP antes de publicar. Todo el contenido es material de estudio.
2. **PDFs extra de la carpeta**: puedo usar Compendio SIAM, Mesas primer llamado, ABC Tomografía y Melanoma como fuente. El "Primer parcial vertical" es escaneado (sin texto), habría que leerlo por imagen.
3. **Identidad visual**: color propio para SIAM (propongo verde azulado, ya que rosa es Ginecología y azul Cirugía).

## Anexo A — Formato de archivo para las preguntas (el mismo de Ginecología)

Un archivo por UP, `data/UP1_siam.json`, con 100 preguntas:

```json
{
  "modulo": "siam",
  "unidad": "UP1",
  "titulo": "El adulto mayor y el agua",
  "preguntas": [
    {
      "id": 1,
      "tema": "Infecciones del tracto urinario",
      "materia": "Medicina Interna (Nefro-Urología)",
      "pregunta": "...",
      "opciones": { "a": "...", "b": "...", "c": "...", "d": "..." },
      "respuesta_correcta": "c",
      "justificacion": "... (con cita de la bibliografía)"
    }
  ]
}
```

## Anexo B — Prompt base para NotebookLM (cambiás solo la UP y la lista de temas)

> Usando solo las fuentes cargadas, generá el bloque N de 20 preguntas de opción múltiple de la UP X ("título"). Cubrí TODOS los temas del temario de la UP, sin dejar ninguno afuera, y priorizá los temas que más se tomaron en las mesas anteriores. Cada pregunta tiene 4 opciones (a, b, c, d) con una sola correcta. Distribuí la letra correcta de forma pareja en el bloque (5 de cada letra aprox.), no hagas que la opción correcta sea la más larga ni la más detallada, y que los distractores sean plausibles y de longitud parecida. Usá casos clínicos de adulto mayor además de preguntas de concepto. Para cada pregunta indicá el tema y la materia, la respuesta correcta y una justificación que explique por qué es correcta y por qué las otras no, citando la fuente. Verificá cada respuesta contra la bibliografía antes de entregarla. Devolvelo en el JSON del Anexo A.

Para controlar que no queden temas afuera, pedile al final: "Listá cada tema del temario de la UP y cuántas preguntas lo cubren hasta ahora".

## Anexo C — Criterios de desaprobación (según lo que indicó Augusto)

Se aplican como **pasos críticos**: fallar uno = DESAPROBADO, sin importar el puntaje.

| Acreditación | Paso(s) de la lista de cotejo | Crítico |
|---|---|---|
| Sonda vesical | 18 (comprueba la indemnidad inflando-desinflando el balón) | No verificar el balón |
| Intubación endotraqueal | 12 (ventilación con ambú 15-18/min **antes** del laringoscopio), 7 (acomodar: incluye evaluación de Mallampati*), 13 (cricoides), 9 (saturómetro) | Ventilar antes del laringoscopio; criterios de Mallampati |
| RCP avanzado | 4 y 17-22 (ritmo, compresiones 100-120/min a 5-6 cm, 30:2, relevo cada 2 min, reevaluación) | Algoritmo completo y orden correcto |
| Artrocentesis | 15 (sitio de punción), 10 (consentimiento), 40 (pautas de alarma)* | Sitio de punción, indicaciones/contraindicaciones*, pautas de alarma |
| Tacto rectal | 10 (posición del paciente), 15-19 (técnica)* | Técnica, posiciones, indicaciones/contraindicaciones* |
| TC de cráneo | 16, 23-27 (hallazgos, sangre, línea media, comparación e impresión diagnóstica) | Hallazgos e impresión diagnóstica |
| Rx de esqueleto | 12-16 (hallazgos óseos/blandos, impresión diagnóstica) | Hallazgos e impresión diagnóstica |
| Urograma excretor | 12-15 (anatomía, fase, hallazgos, impresión diagnóstica) | Hallazgos e impresión diagnóstica |
| RMN cerebral | 11-14 (estructuras, normal/patológica, signos, impresión diagnóstica) | Hallazgos e impresión diagnóstica |

\* Estos criterios (Mallampati, indicaciones y contraindicaciones, pautas de alarma, posiciones) **no figuran como pasos separados** en las listas de cotejo. Se agregan en el atlas como una "fase de fundamentos" previa o posterior al procedimiento, con preguntas de la cátedra, y cuentan como crítico.

Además, en TODAS las acreditaciones de procedimiento quedan como críticos transversales a confirmar: consentimiento informado, lavado de manos y asepsia, y registro en la historia clínica.

## Anexo D — Esquemas de los atlas

Se arman como esquemas SVG interactivos (no hay imágenes reales cargadas). Por acreditación:
- **Sonda vesical:** corte anatómico pélvico femenino y masculino con el recorrido de la sonda, balón inflable y bolsa colectora.
- **Tacto rectal:** corte sagital pelvis con recto, próstata y esfínteres, y selector de posiciones (litotomía, decúbito lateral izquierdo, genupectoral, de pie inclinado).
- **Intubación:** perfil de la vía aérea con lengua, epiglotis, cuerdas vocales y la hoja del laringoscopio; escala de Mallampati I-IV.
- **Artrocentesis:** rodilla con rótula, puntos de punción y planos.
- **RCP avanzado:** tórax con sitio de compresiones, monitor con ritmos y algoritmo.
- **TC, RMN, Rx y urograma:** visor con cortes esquemáticos, selector de ventana/secuencia, lado D/I, rótulo y puntos marcables para hallazgos.
