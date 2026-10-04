# Resumen · Atlas de acreditaciones de Salud Integral de la Mujer (SIM)

Acceso: **Ginecología-Obstetricia → Atlas de Acreditaciones** (`gineco_hub.html`) o `acreditaciones.html?area=sim`.

## Las 6 acreditaciones

| Acreditación | Pasos | Casos | Qué se ve en el 3D |
|---|---|---|---|
| Anamnesis ginecológica | 31 | 8 | Torso femenino con útero, ovarios, trompas y vejiga (se iluminan según la pregunta); **historia clínica que se completa**; familigrama |
| Anamnesis obstétrica | 22 | 8 | Torso con **abdomen gestante** según la EG del caso; historia clínica con carnet perinatal, FUM, antecedentes, grupo y factor, vacunas, peso y TA |
| Cálculo de EG y FPP | 9 (+1 según el caso) | 8 | **Gestograma** de 280 días con FUM, hoy y FPP; abdomen gestante que crece con la EG; el simulador **verifica los números** |
| Examen ginecológico, PAP y tacto bimanual | 27 | 7 | Corte sagital de la pelvis con **espéculo** (inserción, rotación de 90°, apertura), **espátula de Ayre**, **citobrush**, dedos del tacto y mano abdominal; **vista externa** de los genitales y **vista especular** del cuello |
| Examen obstétrico | 19 | 7 | Abdomen gestante con útero, feto, placenta y cordón; **cinta obstétrica**, **maniobras de Leopold**, **Pinard** con latido sonoro, **curva de incremento de la AU** |
| Examen mamario | 18 | 7 | Mamas con areola, pezón, tubérculos de Montgomery, red de Haller y glándula con nódulos; **palpación por cuadrantes**, secreciones, **mapa de cuadrantes**, autoexamen |

Todas incluyen: caso clínico, mesa de instrumental con distractores, modo explorar / guiado / práctica / examen, demostración con voz, chat con dictado por voz y reconocimiento de frases, efectos y sonidos por paso, informe NikaMed+, machete y preguntas de fundamentos.

## Qué quedó para corregir con NotebookLM
Los 6 documentos `REVISION_CLINICA_SIM_*.md` (en la raíz del proyecto) traen, por acreditación: cómo funciona, **criterios de desaprobación propuestos** (las listas de cotejo no los definen), **dudas puntuales**, casos, mesa, acciones incorrectas, **cada paso con su fundamento y frase modelo**, y las preguntas de fundamentos. Todo lo marcado con ❓ es una decisión mía a confirmar.

Decisiones que más conviene revisar:
- **Anamnesis ginecológica**: el ítem «induce o interrumpe el relato» está sin negación en la planilla; lo evalué como conducta a evitar.
- **Anamnesis obstétrica**: agrupé los sub-ítems (antecedentes personales, hábitos, vacunas) en un paso por grupo.
- **Cálculo de EG y FPP**: la guía no trae lista de cotejo; la secuencia de 9 pasos es mía.
- **Examen ginecológico**: inclinación a la izquierda y giro de 90° horario del espéculo; el gel lubricante como error grave.
- **Examen obstétrico**: la auscultación con Pinard va entre la 2.ª y la 3.ª maniobra (orden de la planilla); percentilos de la curva de AU aproximados.

## Cómo se probó
- Reconocimiento del chat: **0 frases modelo mal reconocidas** en los casos de las 6 acreditaciones.
- Examen completo simulado (mesa, frases y informe) de cada una: **100 %**, 0 errores.
- Se vieron en el navegador el 3D y las superposiciones de cada acreditación.

## Qué NO pude verificar
- **Sonidos y voz**: no se pueden escuchar en el entorno de prueba (se comprobó que todos los efectos existen y no dan error).
- **Celular**: no se probó en un teléfono real (rige el aviso de girar la pantalla).
- **Publicación en Vercel**: se subió a `main`, pero no vi el sitio publicado.
- **Calibración visual fina** del 3D: las manos y la posición de las herramientas se ajustaron a ojo; conviene mirar cada paso y avisar qué se ve raro.

## Modelos 3D y licencias
Piel femenina, útero, ovarios, trompas, placenta, vejiga y pelvis: **Human Reference Atlas** (CC BY 4.0). Pelvis ósea, huesos y piel masculina de otras acreditaciones: BodyParts3D (CC BY-SA 2.1 JP) y Z-Anatomy (CC BY-SA 4.0). Feto, vagina, espéculo, manos con guante, cinta, Pinard, mamas y nódulos: **procedurales** (creados para el Atlas). Los créditos aparecen al pie del visor 3D.

## Auditoría de SIAM
Ver `AUDITORIA_SIAM.md`: sin inconsistencias de datos; se corrigió un error del examen de artrocentesis (pasos dependientes del caso) y se agregaron preguntas de fundamentos a sonda vesical, tacto rectal, intubación y RCP (a validar).

## Siguiente paso sugerido
1. Corregir los 6 documentos con NotebookLM y pasarme las correcciones (las aplico como en SIAM).
2. Revisar juntos cada 3D en pantalla grande y en el celular.
3. Seguir con las acreditaciones de imágenes de SIAM (TC de cráneo, RMN cerebral, Rx de esqueleto óseo y urograma excretor), que necesitan un visor de imágenes.

Los generadores de datos y modelos quedaron en `tools/atlas-generadores/`.
