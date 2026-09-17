/**
 * ============================================================
 * CAMPUS NIKA — Feature 5: Chat Privado + Compartir Pregunta
 * chatManager.js
 * ------------------------------------------------------------
 * Responsabilidad: mensajería directa 1 a 1 entre amigos
 * (persistida en `private_messages`) con Realtime, más el
 * envío de "tarjetas de pregunta" para debatir un caso del
 * banco/simulacro directamente en el chat.
 *
 * Depende de: window.NikaSupabase (supabaseClient.js)
 * Patrón calcado de notificacionesManager.js / duelosManager.js
 * para no romper convenciones ya usadas en el proyecto.
 *
 * Tabla esperada (crear en Supabase, ver chat_schema.sql):
 *   private_messages (
 *     id uuid pk default gen_random_uuid(),
 *     from_username text not null,
 *     to_username text not null,
 *     content text,               -- null si el mensaje es solo una pregunta compartida
 *     shared_question jsonb,     -- { id, up, q, options } cuando se comparte una pregunta
 *     created_at timestamptz default now(),
 *     read_at timestamptz
 *   )
 * ============================================================
 */

const ChatManager = (function () {
    const sb = () => window.NikaSupabase.client;

    // channelName determinístico: siempre el mismo sin importar quién
    // de los dos abre el chat primero (usernames ordenados alfabéticamente).
    function _canalPara(userA, userB) {
        const [a, b] = [userA, userB].sort();
        return `dm_${a}__${b}`;
    }

    let canalActivo = null;
    let conversacionActual = null; // username del amigo con el que estoy chateando
    let onMensaje = null;          // callback: (row) => void, para pintar burbujas
    let onListaChanged = null;     // callback: () => void, para refrescar bandeja/badges

    // ------------------------------------------------------------
    // 1. Abrir/suscribirse a una conversación 1 a 1
    // ------------------------------------------------------------
    async function abrirConversacion(friendUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");

        await cerrarConversacion(); // limpia canal previo si había otro chat abierto

        conversacionActual = friendUsername;
        canalActivo = sb().channel(_canalPara(username, friendUsername));

        canalActivo.on("broadcast", { event: "nuevo_mensaje" }, ({ payload }) => {
            // Solo me interesa si el mensaje corresponde a esta conversación
            const esMio = payload.from_username === username || payload.to_username === username;
            if (esMio && onMensaje) onMensaje(payload);
            if (onListaChanged) onListaChanged();
        });

        await canalActivo.subscribe();

        return historial(friendUsername);
    }

    function cerrarConversacion() {
        if (canalActivo) {
            sb().removeChannel(canalActivo);
            canalActivo = null;
        }
        conversacionActual = null;
        return Promise.resolve();
    }

    // ------------------------------------------------------------
    // 2. Historial de una conversación (últimos 100 mensajes)
    // ------------------------------------------------------------
    async function historial(friendUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");

        const { data, error } = await sb()
            .from("private_messages")
            .select("*")
            .or(
                `and(from_username.eq.${username},to_username.eq.${friendUsername}),` +
                `and(from_username.eq.${friendUsername},to_username.eq.${username})`
            )
            .order("created_at", { ascending: true })
            .limit(100);

        if (error) throw error;
        return data || [];
    }

    // ------------------------------------------------------------
    // 3. Enviar mensaje de texto
    // ------------------------------------------------------------
    async function enviarMensaje(toUsername, contenido) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!contenido || !contenido.trim()) return null;

        const row = await _insertarYNotificar({ from_username: username, to_username: toUsername, content: contenido.trim() });
        return row;
    }

    // ------------------------------------------------------------
    // 4. Compartir una pregunta del simulacro/banco (la genialidad clave)
    //    'pregunta' es el objeto tal cual viene de preguntas.json / examen.js
    // ------------------------------------------------------------
    async function compartirPregunta(toUsername, pregunta) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!pregunta) throw new Error("No hay pregunta para compartir.");

        // Guardamos solo lo necesario para renderizar la tarjeta en el chat,
        // sin arrastrar campos internos del examen (índices, flags, etc).
        const snapshot = {
            id: pregunta.id ?? null,
            up: pregunta.up ?? null,
            q: pregunta.q || pregunta.pregunta || "",
            options: pregunta.options || (pregunta.opciones
                ? Object.fromEntries(pregunta.opciones.map((o, i) => [String.fromCharCode(97 + i), o.texto || o.label || o]))
                : null),
        };

        const row = await _insertarYNotificar({
            from_username: username,
            to_username: toUsername,
            content: null,
            shared_question: snapshot,
        });

        return row;
    }

    async function _insertarYNotificar(payloadInsert) {
        const { data: row, error } = await sb()
            .from("private_messages")
            .insert(payloadInsert)
            .select()
            .single();

        if (error) throw error;

        // Notifico por Realtime a ambos extremos del canal determinístico,
        // así el que tiene la conversación abierta la ve al instante.
        const canalNombre = _canalPara(payloadInsert.from_username, payloadInsert.to_username);
        await sb().channel(canalNombre).send({ type: "broadcast", event: "nuevo_mensaje", payload: row });

        return row;
    }

    // ------------------------------------------------------------
    // 5. Bandeja: conteo de no leídos por amigo + marcar como leído
    // ------------------------------------------------------------
    async function contarNoLeidos() {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) return {};

        const { data, error } = await sb()
            .from("private_messages")
            .select("from_username")
            .eq("to_username", username)
            .is("read_at", null);

        if (error) throw error;

        const porUsuario = {};
        (data || []).forEach((m) => {
            porUsuario[m.from_username] = (porUsuario[m.from_username] || 0) + 1;
        });
        return porUsuario;
    }

    async function marcarComoLeido(friendUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) return;

        await sb()
            .from("private_messages")
            .update({ read_at: new Date().toISOString() })
            .eq("from_username", friendUsername)
            .eq("to_username", username)
            .is("read_at", null);

        if (onListaChanged) onListaChanged();
    }

    return {
        abrirConversacion,
        cerrarConversacion,
        historial,
        enviarMensaje,
        compartirPregunta,
        contarNoLeidos,
        marcarComoLeido,
        get conversacionActual() {
            return conversacionActual;
        },
        set onMensaje(cb) {
            onMensaje = cb;
        },
        set onListaChanged(cb) {
            onListaChanged = cb;
        },
    };
})();

window.ChatManager = ChatManager;
