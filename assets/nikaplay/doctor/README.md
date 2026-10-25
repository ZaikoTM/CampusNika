# Doctor de NikaPlay (NikaWorld y FarmaMatch)

El juego busca aquí las ilustraciones del doctor. **Si no hay ninguna, usa el doctor dibujado en SVG** (`js/nikaplay/doctor.js`), así que no hace falta tenerlas todas para que todo funcione.

## Cómo se activan
1. Generá las ilustraciones (ver especificaciones y prompt abajo).
2. Guardalas en esta carpeta con **estos nombres exactos** (PNG con fondo transparente real):

| Archivo | Cuándo aparece |
|---|---|
| `doctor-idle.png` | **Obligatorio.** Posición neutral. Si falta, se usa el doctor SVG. |
| `doctor-hola.png` | Saludo al empezar |
| `doctor-senala.png` | Señala el tablero / la configuración |
| `doctor-piensa.png` | Pensando (mano en el mentón) |
| `doctor-ok.png` | Acierto parcial / letras que sirven |
| `doctor-victoria.png` | Festeja (término resuelto, ronda perfecta, buena partida) |
| `doctor-ups.png` | Sorpresa por un error |
| `doctor-apura.png` | Preocupado: queda poco tiempo |
| `doctor-pista.png` | Usa el estetoscopio al pedir una pista |
| `doctor-derrota.png` | Decepción simpática y ánimo |
| `doctor-cambio.png` | Señala hacia el siguiente término |

Si falta una pose cualquiera (menos `idle`) se muestra `doctor-idle.png` en su lugar, con la animación de CSS correspondiente. Agregar un archivo nuevo la activa al recargar la página (subí `?v=` del `<script>` si hay caché).

## Requisitos de las imágenes
- **Todas las poses con el mismo lienzo** (mismo ancho y alto en píxeles), personaje centrado y con los pies apoyados en el borde inferior. Así no hay saltos de tamaño ni de posición al cambiar de pose.
- Proporción vertical sugerida **2:3** (por ejemplo 1536 × 2304 px, o 1024 × 1536 px). El CSS adopta la proporción del archivo `doctor-idle.png`.
- Fondo **transparente real** (canal alfa), sin halos blancos, sin textos, sin globos ni marcos.
- Margen suficiente alrededor de manos y cabeza para que las animaciones no queden cortadas.
- Mismo personaje en todas las poses (cara, pelo, ropa, colores, iluminación).
- Peso razonable: se recomienda PNG optimizado (o `.webp`, cambiando `ext` en `doctor.js`).

## Prompt sugerido para el generador de imágenes
> Doctor de dibujos animados estilo render 3D de videojuego educativo clásico: joven, simpático, cabello castaño con mechones definidos, ojos grandes y expresivos, guardapolvo blanco con pliegues y reflejos, ambo y pantalón celeste, corbata, estetoscopio detallado alrededor del cuello, credencial "NikaMed", zapatos marrones. Cuerpo entero, ambos brazos y manos visibles, sin recortes, sin texto, sobre **fondo transparente**. Pose: [POSE]. Usá la imagen adjunta como referencia de identidad y de estilo y mantené exactamente el mismo personaje, proporciones, colores e iluminación.

Generá primero el personaje maestro (`doctor-idle`), aprobalo y recién después pedí las otras diez poses usando ese personaje como referencia.

## Poses para [POSE]
`idle`: de pie, relajado, sonriendo · `hola`: saludando con una mano · `senala`: señalando hacia un costado con el índice · `piensa`: mano en el mentón, mirando hacia arriba · `ok`: sonriendo con el pulgar arriba · `victoria`: festejando con ambos brazos en alto · `ups`: sorprendido, manos al costado de la cara · `apura`: preocupado, mirando su reloj de pulsera · `pista`: sosteniendo la pieza del estetoscopio hacia adelante · `derrota`: decepcionado pero simpático, hombros caídos · `cambio`: señalando hacia la derecha con el brazo extendido.
