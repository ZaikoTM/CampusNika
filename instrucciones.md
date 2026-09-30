Hoja de Ruta de Desarrollo - Campus Nika
Fase 1: Prioridad Absoluta - Desbloqueo de UI y Sincronización (Continuación)
Hola, vengo de una sesión anterior que se cortó por límite de mensajes. Ya teníamos el diagnóstico y el plan de acción para arreglar la UI del Pomodoro y los simuladores en Campus Nika.
El problema que bloqueaba la UI: Al terminar un Pomodoro, no me aparece la interfaz del pomodoro en la sala de estudio para iniciar otro, solo aparecen las notas, y tampoco está la parte de registrar en el cronograma. Las políticas RLS están confirmadas: el usuario puede hacer ALL si auth.uid() = user_id.

Plan de arreglo exacto a implementar ahora:

Crear un evento único nika:rendimiento-changed (con debounce) que emitan el Pomodoro, el guardado de examen y nika:sync-done. Propagarlo con BroadcastChannel.

Que campus.html escuche ese evento y llame a renderRendimiento(), para actualizar todas las tarjetas.

Modificar pomodoroEngine.js y pomodoro.js para que el motor libere los controles de la UI y la interfaz (sala de estudio) inmediatamente al terminar el ciclo, sin esperar la red, haciendo el guardado (insert) en segundo plano.

En rendimiento.js, recalcular los "pendientes" leyendo la cola real de syncManager (IndexedDB) y dejar de usar los nika_time_* del localStorage como acumuladores (usarlos solo como caché de visualización).

Acción: Carga los archivos pomodoro.js, pomodoroEngine.js, rendimiento.js, campus.html y examen.js y procede directamente a aplicar y mostrarme las modificaciones en el código basándote en este plan.

Fase 2: Base de Datos y Fixes Críticos Adicionales
Una vez completada la Fase 1, procede con las siguientes correcciones (Revisando estudio.js, campus.html y políticas de Supabase):

Calendario (Error 400): Al guardar un evento, Supabase devuelve 400 Bad Request en estudio.js:1459: new row for relation "calendario_eventos" violates check constraint "calendario_eventos_tipo_check". Ajusta el payload para que el campo tipo envíe un valor válido.

Bug RLS al Subir Foto de Perfil: Falla en campus.html:2493 con StorageApiError: new row violates row-level security policy. Revisa handleSaveProfile para asegurar que el path y el payload sean correctos, e indícame las instrucciones exactas de la política RLS que debo configurar en el bucket avatars.

Integración Calendario y Alertas: En la sala de estudio, vincula la lógica de las alertas programadas para que interactúen directamente con el calendario.

Fase 3: Reparación del Modo Versus (1vs1)
Archivos clave a analizar: versus.html, script del modo versus (versus.js o similar), styles.css.

Error de "Sala Llena" en Invitaciones: Cuando un amigo me invita a un duelo, el sistema rechaza la conexión indicando erróneamente que la sala está llena. Soluciona este bloqueo.

Desincronización de Preguntas (Game Loop Roto): Cuando logro entrar a una sala, hay una desincronización grave. A mi rival le cargan 10 preguntas y puede jugar normal, pero a mí la interfaz me marca "Pregunta 1 de 5", se queda trabado en "Cargando pregunta..." y nunca me muestra las opciones. Arregla el estado del juego para que cargue en sincronía.

UX del Chat 1vs1: El chat rápido del duelo tiene problemas: el ícono del botón se ve roto/descentrado, cuando llega un mensaje nuevo no emite ningún sonido (zumbido), y el botón no cambia de color para notificar que hay mensajes sin leer. Integra un archivo de audio para el zumbido si es necesario.

Fase 4: Mejoras de UI, UX y Componentes Visuales
Archivos clave a analizar: campus.html, estudio.html, rendimiento.js, assistant.js, chatManager.js, friendsManager.js, pomodoroBar.js, styles.css.

Notificación en el Chat Flotante Global: Mueve la inicialización del bot para que persista en estudio.html y otras rutas. Inyecta un badge rojo con un "1" justo arriba del icono del robot cuando llegue un mensaje.

Tarjetas de Rendimiento Expandibles: En "Mi Rendimiento Académico", asigna eventos de clic a todas las tarjetas (Simulacros, Efectividad, Tiempo) para que abran su propio modal con el desglose de su información, igual que funciona actualmente la "Curva del Olvido".

Bug de Scroll en Modal de Amigos: Al abrir el perfil de un usuario, el modal no permite hacer scroll hacia abajo y la información queda cortada. Ajusta el CSS (overflow-y, max-height).

Modo Enfoque (Pomodoro): En estudio.html, revisa las clases CSS que se aplican al iniciar el timer. Hay un solapamiento que oculta por completo la interfaz del pomodoro de la sala y la configuración del cronograma. Evita que estos divs desaparezcan.

Herramienta de Recorte de Avatar: Implementa una interfaz interactiva (como Cropper.js) en el modal de perfil de campus.html que permita hacer zoom, arrastrar y recortar la foto antes de subirla a Supabase.