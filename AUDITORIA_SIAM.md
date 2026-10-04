# Auditoría de las acreditaciones SIAM

Revisión automática y manual de las 5 acreditaciones SIAM (sonda vesical, tacto rectal, intubación endotraqueal, RCP avanzado y artrocentesis).

## Verificaciones realizadas
- Todos los pasos tienen efecto visual y sonido, elemento asociado, palabras clave, frase modelo y fundamento; todas las imágenes del instrumental y las piezas 3D existen; los chips de estado, los criterios de desaprobación y los hallazgos por caso son consistentes (0 inconsistencias).
- Reconocimiento del chat: 0 frases modelo mal reconocidas en ningún caso de las 5 acreditaciones.
- Examen completo simulado (mesa, 45 frases y informe) en artrocentesis (derrame grande, escaso y contraindicación), RCP, sonda vesical y tacto rectal.

## Error corregido
- En artrocentesis los pasos que dependen del caso (derrame grande o escaso) se aplicaban a todos los casos porque el motor evaluaba solo la primera condición. Ahora se cumplen **todas** las condiciones (`solo_si`, `sin_si`, `solo_contra`, `sin_contra`).

## Mejoras aplicadas
- Más preguntas de fundamentos (sonda vesical +4, tacto rectal +4, intubación +3, RCP +4), **pendientes de validar con NotebookLM**.
- Selector de sexo oculto cuando todos los casos son del mismo sexo (área SIM).

## Preguntas agregadas (a validar)

### SV
- ¿Qué calibre de sonda Foley se usa habitualmente en la mujer adulta?  
  Respuesta correcta: **14 a 16 Fr**. En la mujer se usan calibres finos (14 a 16 Fr) porque la uretra es corta y de poco calibre; en el varón, 16 a 18 Fr.
- ¿Cuál es el volumen habitual con que se infla el balón de una sonda Foley de adulto?  
  Respuesta correcta: **10 mL de agua destilada**. Se infla con 10 mL de agua destilada (nunca aire) para que la sonda quede fija en la vejiga.
- ¿Cómo se mantiene el sistema de drenaje para prevenir infecciones urinarias?  
  Respuesta correcta: **Cerrado, con la bolsa por debajo del nivel de la vejiga y sin tocar el piso**. El sistema cerrado y el drenaje por gravedad previenen el reflujo y la infección asociada al catéter.
- Antes de sondar a un varón, ¿qué se hace con el prepucio?  
  Respuesta correcta: **Se retrae para higienizar el glande y se vuelve a su lugar al final**. Dejarlo retraído provoca parafimosis, una urgencia por edema del glande.

### TR
- ¿Qué parte del dedo se apoya primero sobre el margen anal?  
  Respuesta correcta: **La pulpa del dedo índice, con presión suave y sostenida**. La presión suave sobre el esfínter externo lo relaja antes de avanzar.
- ¿Qué se evalúa en la pared anterior del recto en el varón?  
  Respuesta correcta: **La próstata: tamaño, consistencia, simetría, surco medio y dolor**. La próstata se palpa por la pared anterior del recto.
- ¿Cuándo se debe suspender el tacto rectal?  
  Respuesta correcta: **Si hay dolor intenso o una contraindicación absoluta**. El dolor intenso o el espasmo del esfínter obligan a detener la maniobra.
- Al retirar el dedo, ¿qué se observa en el guante?  
  Respuesta correcta: **Color, consistencia y presencia de sangre, moco o pus**. Melena, sangre roja, moco o pus orientan el diagnóstico.

### IET
- ¿Cuál es la ventaja de la maniobra de elevación de la mandíbula en un traumatizado?  
  Respuesta correcta: **Abre la vía aérea sin extender el cuello**. En trauma se estabiliza el cuello en línea y se usa tracción mandibular.
- ¿Qué indica la capnografía con onda sostenida tras intubar?  
  Respuesta correcta: **Que el tubo está en la tráquea**. Es el método más confiable de confirmación de la posición del tubo.
- ¿Cuánto tiempo máximo debe durar cada intento de laringoscopia?  
  Respuesta correcta: **Hasta 30 segundos; si falla, se ventila y se reintenta**. Intentos prolongados provocan hipoxia: se ventila entre intentos.

### RCP
- ¿Qué se hace inmediatamente después de entregar la descarga?  
  Respuesta correcta: **Reiniciar las compresiones de inmediato por 2 minutos**. El miocardio queda aturdido y necesita soporte mecánico: no se palpa el pulso tras el choque.
- ¿Qué dosis de adrenalina se usa en el paro cardíaco del adulto?  
  Respuesta correcta: **1 mg EV/IO cada 3 a 5 minutos**. La dosis es de 1 mg seguida de 20 mL de solución salina.
- ¿Cuál es la energía inicial de un desfibrilador bifásico?  
  Respuesta correcta: **120 a 200 J (200 J si no se conoce el dispositivo)**. En monofásicos se usan 360 J.
- Durante la RCP con vía aérea avanzada, ¿cuántas ventilaciones por minuto se dan?  
  Respuesta correcta: **10 por minuto, sin pausar las compresiones**. La hiperventilación disminuye el retorno venoso y la perfusión coronaria.
