# NikaPlay — Registro de avance

## Decisiones tomadas
- Nombre: **NikaPlay**; página propia `nikaplay.html`; entrada en la barra lateral de `campus.html` junto a Liga Pomodoro y NikaFarma (se agrega en la Fase 3, no antes).
- Estructura visual igual a la Liga Pomodoro (encabezado de `pagina-lateral`, pestañas cápsula, columna lateral + contenido), pero en la paleta azul/cian de NikaMed.
- Identidad de jugadores: **`auth.uid()` (user_id)**, no `username` (a diferencia del Versus). Motivo: sobrevive a renombres y es lo que usan RLS, `profiles` y `eventos_uso`.
- Desafío del día: respuesta validada por **RPC en el servidor**; el JS público nunca contiene la solución. Una participación por usuario y día (clave única), día calendario en hora de Argentina.
- Orden del MVP: NikaWord → FarmaMatch → Desafío del día.
- Los puntos de NikaPlay no se mezclan con ELO, notas ni rendimiento académico.
- El Versus 1vs1 no se toca; en NikaPlay solo aparece como tarjeta que enlaza a `versus.html`.
- Migraciones nuevas solo en `supabase/migrations/`.
- D6 (esquema SQL del Versus): se pospone; solo hace falta antes de cualquier fase multijugador.

## Archivos modificados / creados
| Fase | Archivo | Cambio |
|---|---|---|
| 1 | `nikaplay.html` | Prototipo visual (datos de ejemplo, sin Supabase ni sesión) |
| 1 | `css/nikaplay.css` | Estilos nuevos, scopeados a `body[data-pagina="nikaplay"]` y `.np-*` |
| 1 | `js/nikaplay/proto.js` | Lógica solo del prototipo (se reemplaza en Fase 2–3) |
| 1 | `NIKAPLAY_CHANGELOG.md` | Este registro |

No se tocó ningún archivo existente.

## Fase 1b — Lobby visual (aprobadas A, B, C, D)
- A: un solo scroll con tres categorías (Partidas rápidas · Desafíos clínicos · Jugá con otros), sin pestañas.
- B: "El caso del día" como tarjeta destacada (nombre interno: Desafío médico del día).
- C: móvil con carruseles horizontales por categoría (scroll-snap, se ve la tarjeta siguiente).
- D: tres temas, los mismos que el campus: **claro**, **oscuro** (`body.dark-mode`) y **premium** (`body.tema-premium`, solo NikaMed+/admin; incluye el fondo espacial y el selector Premium/Clásico/Oscuro de `campusTema.js`). Los usuarios gratuitos ven el botón claro/oscuro y la invitación al tema Premium.
- Reutiliza `campus-premium.css`, `campus-premium-espacio.css`, `tema-premium-salas.css`, `micro.css`, `paginaLateral.js`, `campusTema.js`, `campusEspacio.js`, `micro.js` (los mismos que Sala de Estudio). Solo se agregaron tokens `--np-*` propios.
- Animaciones (todas bajo `prefers-reduced-motion: no-preference`): entrada escalonada, pulso en "Hoy", destello y latido (ECG) en el destacado, elevación + giro de ícono + flecha en tarjetas, destello en botón principal, apertura de modal.
- Estados: carga con esqueletos (a los 8 s pasa solo a error), error con Reintentar, amigos vacío ("Invitá a un compañero"), progreso con guiones, juegos "Próximamente".
- No hay amigos, puntajes ni partidas reales: todo es maqueta y está rotulado. Sin Supabase, sin `auth-guard.js` (el acceso se limita como en Liga: sin sesión local vuelve al campus).
- Ajuste tras revisión: el ECG pasó a una franja inferior propia (ya no pasa detrás del texto), el destacado suma acentos dorados (`--np-gold`, un tono por tema: ámbar en claro, dorado en oscuro/premium) y el chip "Cierra a las 23:59" se reemplazó por "Un caso nuevo cada día". El horario de cierre se definirá al conectar el desafío real.
- Controles de maqueta ("Ver estado") y franja amarilla: ocultos por defecto, solo se ven con `?demo=1`. **PENDIENTE al integrar datos:** reemplazar la franja por el estado real (sin datos / con datos) y borrar los controles de maqueta.
- Diferencia con la propuesta: no hay botón fijo inferior en móvil (el botón del destacado ocupa todo el ancho y es táctil de 48 px).

## Fase 2 + NikaWord (en preparación)
- Decisiones: palabras de 6 a 9 letras, con cronómetro (pensado para sumar multijugador online después). Partida = 3 términos.
- Hecho: `data/nikaplay/nikaword.json` — **borrador de 185 términos** (6 letras: 36 · 7: 38 · 8: 62 · 9: 49) en 9 materias. Marcado `estado: "borrador"`, `revisado: false`: redactado sin revisión médica ni citas; hay que validar cada definición antes de publicar.
- Nueva dirección visual para los juegos (pedido del usuario): estética ilustrada, clásica tipo animación/Encarta, como la bandeja de instrumental de las acreditaciones. El lobby se mantiene profesional. **Pendiente: aprobar una muestra de estilo de NikaWord antes de programar la pantalla del juego.**

### NikaWord jugable (implementado)
- Archivos nuevos: `js/nikaplay/core.js` (almacenamiento local por usuario, azar con semilla, récord local, pantalla completa), `js/nikaplay/nikaword.js` (reglas, reloj, pistas, puntaje, pausa/reanudación), `css/nikaword.css` (escenario ilustrado SVG/CSS en claro, oscuro y premium). Modificados: `nikaplay.html` (enlaces), `js/nikaplay/proto.js` (botón Empezar/Continuar, récord en la tarjeta).
- Reglas: 3 términos por partida (6–9 letras), 6 intentos, 2:30 por término con cronómetro opcional (se elige al comenzar), 2 pistas (materia y definición, −20 c/u). Puntos por término: 100 base + 15 por intento sobrante + hasta 30 de tiempo − pistas (mínimo 10 si se resuelve; 0 si no).
- La partida se guarda en el dispositivo: cerrar o recargar deja la partida en pausa (el reloj se detiene) y se puede continuar. El término sale de una semilla guardada en la partida, lista para un modo multijugador.
- Cualquier combinación de letras de la longitud correcta es válida como intento (no hay diccionario).
- Verificación hecha: letras repetidas, pista y puntaje, "faltan letras", pausa y reanudación, fin por tiempo agotado, pantalla final con récord, tres temas y móvil 375 px.
- Pendiente: revisión médica de los 185 términos; resultado oficial/multijugador en servidor (fases siguientes).

### NikaWord: revisión tras la primera prueba del usuario
Problemas: guía de reglas simple, juego poco definido y sin consigna, teclado cortado en pantallas de ~650 px, sin botones claros.
- Guía "Cómo se juega" ilustrada y colorida (3 pasos con ejemplo SEPSIS/SEROSA y leyenda de colores), usada en el lobby, en la pantalla de inicio y en el botón Ayuda del juego (que pausa el reloj).
- HUD con botones rotulados: **Salir**, **Ayuda**, puntos y barra de progreso de términos. Consigna fija ("Adiviná el término médico de N letras · te quedan X intentos"), **Pedir pista**, **Rendirme** (pide confirmar) y tecla **ENVIAR** / borrar.
- Más contraste y nitidez: pared más saturada, fichas con borde fuerte, se quitaron las rotaciones que suavizaban el texto.
- El tablero ahora se ajusta a la altura de la pantalla (verificado a 1366×650 y a 375×812) y los botones de la pantalla de inicio quedan fijos abajo.
- Incidente: un reemplazo con PowerShell (`Get-Content`/`Set-Content` sin codificación) dañó los acentos de `nikaplay.html`; se reparó. Regla: editar con Python/Edit indicando UTF-8.

### NikaWord: consigna justa (segunda revisión del usuario)
Problema: sin ninguna referencia era imposible adivinar; la materia sola era demasiado amplia.
- **Gratis en cada término:** la **definición** como consigna (estilo crucigrama), la materia, la cantidad de letras y la **primera letra ya escrita** en cada fila.
- **Pistas pagas (−20 c/u, hasta 2):** revelan una letra en su lugar, que aparece como ficha "pista" en la fila activa del tablero (posición fija por partida y término).
- Las definiciones que delataban el término (Glucógeno, Uretritis, Opioide) se reescribieron; se comprobó que ninguna otra contiene el término ni su raíz.
- La definición ya no es una pista paga, pero igual se muestra completa en la pantalla de resultado.

### NikaWord: flujo continuo (tercera revisión del usuario)
- Al resolver o fallar un término ya no se corta con una pantalla de resultado: aparece un **cartel corto** sobre el tablero (sello, término, definición y puntos) y el juego **pasa solo al siguiente** (≈2,3 s si acertó, ≈3,2 s si falló). Tocar el cartel, el botón o cualquier tecla salta al siguiente de inmediato.
- El desglose de puntos y las definiciones se ven al final, en el parte médico (cada término con su definición para repasar).
- Si se cierra o recarga durante el cartel, la partida avanza al siguiente término en pausa.
- **PENDIENTE (pedido del usuario): mejorar los íconos del juego** (estetoscopio, reloj, ayuda, salir, etc.; hoy son trazos lineales simples) para que respeten mejor el estilo ilustrado.

### NikaWord: partida configurable con reloj único y penalización (cuarta revisión)
- **Cantidad de términos a elección:** presets 3 · 5 · 10 · 15 · 20 o cualquier número de 1 a 50 (campo numérico con − / +). Por defecto, 5.
- **Reloj único para toda la partida** = segundos por término × cantidad. Ritmos: **Justo 45 s/término**, **Intenso 30 s/término** y **Práctica** (sin reloj). Si el reloj llega a cero, la partida termina (el término en curso cuenta como no resuelto).
- **Errores contados y penalizados:** cada intento fallido (y rendirse) resta **10 s** del reloj, con aviso "−10 s" sobre el reloj y contador de errores visible. En Práctica se cuentan pero no restan tiempo.
- **Puntaje:** por término, 100 + 15 por intento sobrante − 20 por pista (mín. 10 si se resuelve; 0 si no). Al final, bono de tiempo de 1 punto cada 2 s sobrantes (solo con reloj y sin haberse agotado).
- **Récord por configuración** (cantidad + ritmo), porque los puntos escalan con la cantidad; la práctica no suma al récord. La tarjeta del lobby muestra el récord de la última configuración usada.
- Pantalla final: aciertos, errores, tiempo usado, bono y lista de términos jugados con su definición.
- Cambios de datos locales: las partidas guardadas con el formato anterior (v1) se descartan.
- Pendiente de ajuste fino con el uso real: valores de 45 s / 30 s por término y los 10 s de penalización.

### Rapidez = más puntos (pedido del usuario)
- **NikaWord:** bono de rapidez por término de hasta +40, proporcional al tiempo que tardaste respecto del ritmo elegido (45 s Justo / 30 s Intenso). Los errores restan tiempo y por eso también bajan el bono. El cartel entre términos muestra "incluye +N por rapidez". El bono de fin de partida por tiempo sobrante se mantiene. Sin reloj (Práctica) no hay bono de rapidez.
- **FarmaMatch:** bono de rapidez por ronda de hasta +40 (referencia: 5 pares × 12 s o 8 s).

### FarmaMatch implementado (primera versión)
- Archivos nuevos: `js/nikaplay/farmamatch.js`, `css/farmamatch.css`, `data/nikaplay/farmamatch.json` (**generado**) y `tools/nikaplay/gen_farmamatch.py` (genera el JSON desde `data/nikafarma_api.json` y `data/flashcards_farmacos.json`; ejecutar `python tools/nikaplay/gen_farmamatch.py` tras cambiar etiquetas). Modificados: `nikaplay.html` (enlaces) y `js/nikaplay/proto.js` (lobby genérico para ambos juegos).
- **Contenido:** 64 fármacos (37 antibacterianos, 11 antifúngicos/antivirales/antiparasitarios, 16 de ginecología y obstetricia). Etiquetas cortas de clase, mecanismo y uso redactadas a partir del vademécum AAFH 2024 y de las fichas FASGO/FDA; contrastadas con el texto fuente (las de obstetricia una por una). El "uso" de los antimicrobianos es orientativo (conocimiento general; el vademécum no trae usos resumidos). Sin dosis. Marcado `estado: "borrador"`.
- **Mecánica "Farmacia de guardia":** rondas de 5 frascos/ampollas (SVG) que se arrastran —o se tocan: frasco y luego cajón— al cajón con la etiqueta correcta (clase, mecanismo, uso o mixto; área: todas, antimicrobianos, ginecología y obstetricia). Dentro de una ronda no hay dos fármacos con el mismo grupo de etiqueta (sin ambigüedad). Teclado: frascos y cajones son botones enfocables.
- **Reloj y puntos:** reloj único (Justo 12 s/par, Intenso 8 s/par, Práctica sin reloj); error = −8 s; +20 por par, +30 por ronda sin errores, bono de rapidez por ronda, pista (resalta un par) −20, bono de tiempo final. Récord por configuración. Cartel entre rondas con las 5 respuestas y la fuente.
- Verificado a 1366×650 y 375×812: tocar, arrastrar (eventos de puntero simulados), error con penalización, ronda completa con cartel y pantalla final con récord; temas claro, oscuro y premium (dos de ellos solo en captura).
- Pendiente: probar arrastre real con mouse y con dedo, tiempo agotado en FarmaMatch, revisión médica final del contenido, íconos mejorados y ampliar el catálogo a otras áreas (cardiovascular, analgésicos, endocrino).

### FarmaMatch: rediseño "Botica antigua" (pedido del usuario, referencia ilustrada)
Problema: la primera versión parecía un clon de "unir con flechas" y se parecía demasiado a NikaWord.
- **Nueva dirección de arte:** botica / estudio médico antiguo. Pared con luz de lámpara y ventana, repisa de madera con **frascos de vidrio con corcho y etiqueta de pergamino** (ahora los frascos son las *respuestas*: clase, mecanismo o uso), **recetas de pergamino con lacre de color** (los fármacos) sobre una bandeja de madera, cartel colgado con clavos, barra superior azul marino con ribete dorado, reloj de bronce y botones azul/dorado (como el "Jugar" de la referencia). Tipografía serif del sistema (Georgia), sin dependencias nuevas.
- **Mecánica:** se arrastra (o se toca y se toca) la receta hasta el frasco. Los frascos tienen colores por posición, para no revelar la respuesta. Al acertar, el frasco brilla en verde y muestra el nombre del fármaco.
- **Doctor ilustrado (SVG)** que comenta la partida ("¡Muy bien!", "¡Ups! −8 s", pistas) con cara y animación distintas según acierto o error. Se oculta en pantallas angostas o bajas.
- **Portada de inicio:** placa de pergamino "FarmaMatch", frascos decorativos y botón "Jugar ▶"; configuración y guía como hojas de pergamino.
- Animación de entrada solo la primera vez de cada ronda (antes se repetía en cada toque).
- Verificado a 1366×650 y 375×812; claro y oscuro (premium en móvil). Pendiente: más tiempo de uso real; el doctor no aparece en móvil.
- Corrección previa: los manejadores de eventos de NikaWord y FarmaMatch estaban cruzados (error de consola); cada juego ahora responde solo dentro de su pantalla.

### Integración en el campus, NikaWorld nuevo y FarmaMatch v3 (pedidos del usuario)
- **Campus (`campus.html`)**: la tarjeta "Desafiar compañero" del dashboard se reemplazó; ahora hay una fila de 5: Sala de Estudio · Simuladores · NikaFarma · NikaSim · **NikaPlay 🎮** (a la derecha de NikaSim). En la barra lateral, "⚔️ Duelos 1vs1" pasó a **🎮 NikaPlay** (con etiqueta NUEVO). Los duelos se alcanzan desde NikaPlay (tarjeta "Duelos 1vs1" → `versus.html`); la función `openVersusModal()` sigue existiendo para notificaciones y otros accesos.
- `sw.js`: versión `nika-v370` y precache de los archivos de NikaPlay. `nikaplay.html` ahora exige sesión real (`supabaseClient.js` + `auth-guard.js`, como Liga). Con esto ya no se puede abrir sin login (sin sesión redirige a `index.html`).
- **NikaWorld** (antes "NikaWord"): rediseño completo con la estética de la imagen de referencia: laboratorio celeste con ventana, biblioteca, libros y taza; logo "NikaWorld" con globo giratorio y chispa; pantalla de inicio con doctor, panel "Cómo se juega" (3 bloques ilustrados) y panel azul "Armá tu partida" con "¡Comenzar!" naranja; cronómetro ilustrado, teclado tipo botones, cartel de definición, tablero tipo tablet. Temas claro/oscuro/premium. El doctor reacciona a eventos reales (inicio, letras que sirven, error, poco tiempo, pista, término resuelto/fallado, final) y hay confeti al festejar. Archivos: `css/nikaworld.css` (nuevo), `js/nikaplay/nikaword.js`.
- **FarmaMatch**: sin trampa de colores (las recetas ya no revelan la familia: lacre neutro); frascos más grandes con etiquetas legibles; barra de instrumentos horizontal; escena más rica (biblioteca, ventana, lámpara, libros, taza) y el mismo doctor.
- **Doctor compartido**: `js/nikaplay/doctor.js` + `css/doctor.css` (joven de pelo castaño, ambo azul, estetoscopio y credencial; 11 estados) y kit de decorado `js/nikaplay/decor.js` + `css/decor.css`.
- **Doctor con ilustraciones PNG (pendiente de que el usuario las genere)**: no es posible producir renders 3D raster desde el entorno de desarrollo. Se dejó listo el sistema: si existen `assets/nikaplay/doctor/doctor-<pose>.png` (11 poses, ver README de esa carpeta) se usan automáticamente, escaladas por CSS sin deformar y con la misma caja; si no existen, se usa el doctor SVG. Probado con PNG de prueba (se borraron).

## Estado de fases
- Fase 0 — Auditoría: **aprobada**.
- Fase 1 — Prototipo y especificación: **implementada**, pendiente de tu revisión visual.
- Fases 2–11: pendientes.

## Especificación funcional (Fase 1)
**Navegación:** pestañas *Individuales* · *Con amigos* · *Mis récords*. Columna lateral: Desafío del día, Resumen de jugador, Clasificación de hoy.

**Tarjeta de juego:** ícono, nombre, descripción de una línea, duración estimada, estado (*Disponible* / *Próximamente*). Al tocar abre un modal con reglas y botón Empezar. Las tarjetas bloqueadas explican que llegan más adelante.

**Estados:** cargando (esqueletos), sin datos (invitación a jugar), error (mensaje claro + Reintentar, sin pérdida de progreso).

**Reglas de diseño:** sin cuentas regresivas que apuren respuestas clínicas; recompensas sobrias (puntos, racha sin penalización); toda partida termina con una explicación; `prefers-reduced-motion` respetado; responsive verificado a 1280 px y 375 px.

**Fuera de alcance de la Fase 1:** conexión a Supabase, partidas reales, ranking real, entrada en la barra lateral, `sw.js`.

## Cómo probar
```
python -m http.server 5517
```
Abrir `http://localhost:5517/nikaplay.html`. Probar los botones "Ver estado", las pestañas y abrir NikaWord/Médico Detective.

## Cómo revertir
Borrar `nikaplay.html`, `css/nikaplay.css`, `js/nikaplay/` y este archivo. Nada más depende de ellos.

## Doctor 3D real (GLB descargado)
- El doctor dibujado a mano se reemplazó por renders de un modelo 3D real (`doctor_sketchfab.glb`): 11 poses WebP transparentes en `assets/nikaplay/doctor/` (~470 KB), recortadas con un marco común.
- Herramientas de desarrollo: `tools/nikaplay/doctor3d/modelo.html` (posado y render), `receptor_png.py`, `optimizar_doctor.py`. Modelos y PNG pesados quedan fuera de git.
- NikaWord vuelve a llamarse NikaWord. Si faltan las imágenes, el juego usa el doctor SVG anterior.
- Pendiente: usar otros modelos descargados (pizarra, monitor, frascos, consola) como decorado renderizado.
- Escenario del consultorio en NikaWord: pared con zócalo, rayos de luz animados, piso con baldosas, partículas flotantes, rayos X y monitor con ECG (renders 3D de los modelos descargados, `assets/nikaplay/props/`, generados con `tools/nikaplay/doctor3d/props.html` + `optimizar_props.py`). Se quitaron libros y taza.
- Doctor más grande con foco de luz y sombra de contacto; globo del logo rediseñado (esfera única) y estrella sin recorte; el tablero se ajusta solo al alto libre (`ajustar()`) y el teclado es más grande.
- NikaWord responsive: escala automática por zoom (≥1900 px: 1.2×, ≥2400: 1.6×, ≥3200: 2.4×) con unidad `--u` en lugar de dvh; en celulares y tablets la partida entra sin scroll (`ajustar()` calcula fichas y teclado); fichas rectangulares que llenan el tablero; tablero y teclado del mismo ancho.
- Efectos: volteo + brillo + salto al acertar, rebote al escribir, botón «¡Comenzar!» con destello, bloques de reglas con entrada escalonada.
- Vida del juego (NikaWord): sonidos sintetizados (`js/nikaplay/sonido.js`, con botón de silencio y vibración), frases del doctor personalizadas y más cortas, racha con bonus (+10 por nivel, tope +40), contador de puntos animado, destellos de escena (error, tensión, victoria), compartir y desafiar con enlace `?reto=semilla.n.ritmo` (mismos términos, sin base de datos).
- Lobby: color por juego, degradés, orbes de fondo animados, brillo al pasar el mouse. FarmaMatch queda «Próximamente»: por ahora solo NikaWord y Duelos 1vs1 están habilitados.
- Pendiente (necesita tablas en Supabase, a proponer antes): invitaciones a amigos, ranking de progreso y ranking ELO.
- Conexión a Supabase (tras ejecutar `sql/nikaplay.sql`): `js/nikaplay/nube.js` (capa de datos, solo vía RPC), `js/nikaplay/social.js` + `css/nikaplay-social.css` (progreso con nivel/XP/rango/ELO, rankings ELO y de progreso global/amigos, buscador de compañeros, solicitudes de amistad con `NikaFriends`, invitaciones en tiempo real, salas multijugador con código, listo/iniciar, cuenta regresiva común, chat, reacciones y resultados con cambio de ELO). NikaWord guarda cada partida (XP/nivel en la pantalla final), los desafíos usan ids de la base (`?reto=<uuid>`) y la partida de sala usa la semilla compartida. Probado solo con datos simulados; falta la prueba con sesión real y dos usuarios.
- Salas abandonadas: `sql/nikaplay_parche_1.sql` (salir en plena partida = abandonar con 0 puntos; cierre forzado al pasar el tiempo máximo de la sala; `nikaplay_limpiar_salas()` con pg_cron cada 5 min si está activo). La lista de amigos del lobby muestra 5 y «Ver todos» abre el listado completo con filtro. Iconos SVG en lugar de emojis en la parte social y fichas con degradé en las tarjetas de juegos.
- Corrección: el fondo animado del lobby forzaba `position: relative` sobre todos los hijos del body (rompía el encabezado fijo y los modales); ahora solo afecta a `.pl-main`.
- Pantalla de inicio de NikaWord: doctor animado saludando (video con fondo verde → WebP animado transparente con `tools/nikaplay/video_a_webp.py`, `assets/nikaplay/doctor/saluda.webp`, ~1 MB). Acabado visual: textura de hexágonos médicos, sombras de contacto, vidrio en tablero/teclado, definición con más aire, relieve al presionar teclas, avatar con respiración. Sonido del reloj: ticks más fuertes (≤30 s y ≤10 s) y desbloqueo del audio con el primer gesto.
