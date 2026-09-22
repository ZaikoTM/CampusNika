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

    // ------------------------------------------------------------
    // 0. Alerta sonora estilo MSN (Web Audio API, sin archivos mp3)
    //    Dos tonos cortos ascendentes ("bip-BIP") al recibir un mensaje
    //    de otra persona. Se crea un AudioContext por reproducción (más
    //    simple y evita quedarse con un contexto "suspended" por las
    //    políticas de autoplay del navegador).
    // ------------------------------------------------------------
    let _audioCtx = null;
    function _getAudioCtx() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            if (!_audioCtx || _audioCtx.state === 'closed') _audioCtx = new Ctx();
            if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
            return _audioCtx;
        } catch (_) { return null; }
    }

    function _tono(ctx, freq, inicio, duracion, volumen) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio);
        // Ataque/decaimiento rápidos para que suene a "bip", no a un pitido plano
        gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
        gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + inicio + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracion);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + inicio);
        osc.stop(ctx.currentTime + inicio + duracion + 0.02);
    }

    function _reproducirSonidoMensaje() {
        const ctx = _getAudioCtx();
        if (!ctx) return;
        try {
            // Dos tonos cortos ascendentes, tipo notificación clásica de MSN Messenger
            _tono(ctx, 660, 0, 0.11, 0.16);   // primer bip (más grave)
            _tono(ctx, 880, 0.1, 0.14, 0.16); // segundo bip (más agudo)
        } catch (_) {}
    }

    let canalActivo = null;
    let conversacionActual = null; // username del amigo con el que estoy chateando
    let onMensaje = null;          // callback: (row) => void, para pintar burbujas
    let onListaChanged = null;     // callback: () => void, para refrescar bandeja/badges
    let onPresenciaCambio = null;  // callback: (enLinea: boolean) => void, para el header del chat
    let onLecturaCambio = null;    // callback: (friendUsername) => void, cuando el otro extremo lee mis mensajes
    let sonidoActivado = true;     // permite silenciar la alerta sonora desde afuera

    // ------------------------------------------------------------
    // 1. Abrir/suscribirse a una conversación 1 a 1
    // ------------------------------------------------------------
    async function abrirConversacion(friendUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");

        await cerrarConversacion(); // limpia canal previo si había otro chat abierto

        conversacionActual = friendUsername;
        // Presence habilitado en el mismo canal determinístico: cada uno de los dos
        // extremos se "trackea" con su username como key, así el otro lado sabe si
        // está online sin necesidad de una tabla ni polling.
        canalActivo = sb().channel(_canalPara(username, friendUsername), {
            config: { presence: { key: username } },
        });

        canalActivo.on("broadcast", { event: "nuevo_mensaje" }, ({ payload }) => {
            // Solo me interesa si el mensaje corresponde a esta conversación
            const esMio = payload.from_username === username || payload.to_username === username;
            if (esMio && onMensaje) onMensaje(payload);
            // Sonido tipo MSN solo cuando el mensaje lo mandó la otra persona
            // (nunca cuando el eco del broadcast es de mi propio mensaje).
            if (esMio && payload.from_username !== username && sonidoActivado) {
                _reproducirSonidoMensaje();
            }
            if (onListaChanged) onListaChanged();
        });

        canalActivo.on("broadcast", { event: "mensajes_leidos" }, ({ payload }) => {
            // El otro extremo marcó como leídos los mensajes que yo le mandé.
            // payload: { reader: username_que_leyo, owner: a_quien_le_leyeron }
            if (!payload) return;
            const esMiConversacion = payload.reader === friendUsername && payload.owner === username;
            if (esMiConversacion && onLecturaCambio) onLecturaCambio(friendUsername);
        });

        const _notificarPresencia = () => {
            if (!onPresenciaCambio) return;
            const estado = canalActivo.presenceState();
            const amigoEnLinea = Object.prototype.hasOwnProperty.call(estado, friendUsername);
            onPresenciaCambio(amigoEnLinea);
        };

        canalActivo.on("presence", { event: "sync" }, _notificarPresencia);
        canalActivo.on("presence", { event: "join" }, _notificarPresencia);
        canalActivo.on("presence", { event: "leave" }, _notificarPresencia);

        await canalActivo.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                try { await canalActivo.track({ online_at: new Date().toISOString() }); } catch (_) {}
            }
        });

        return historial(friendUsername);
    }

    function cerrarConversacion() {
        if (canalActivo) {
            try { canalActivo.untrack(); } catch (_) {}
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

    // Averigua por qué la política RLS rechazó el mensaje, para decírselo al usuario
    async function _explicarRechazo(toUsername) {
        try {
            const { data: { session } } = await sb().auth.getSession();
            if (!session) return 'Tu sesión venció. Iniciá sesión de nuevo.';
            const local = window.NikaSupabase.getNikaCurrentUsername() || '';
            const { data: perfil } = await sb().from('profiles').select('username').eq('id', session.user.id).maybeSingle();
            const enPerfil = perfil && perfil.username;
            if (!enPerfil) return 'Tu perfil no tiene un nombre de usuario guardado y el chat lo necesita. Completalo en Mi Perfil.';
            if (enPerfil.toLowerCase() !== String(local).toLowerCase()) {
                return `Tu sesión usa el usuario "${local}" pero tu perfil es "${enPerfil}". Cerrá sesión y volvé a entrar.`;
            }
            if (window.NikaFriends) {
                const amigos = await window.NikaFriends.listFriends();
                if (!amigos.some((f) => String(f.username).toLowerCase() === String(toUsername).toLowerCase())) {
                    return 'Solo podés chatear con tus amigos confirmados.';
                }
            }
        } catch (err) {
            console.warn('[ChatManager] No se pudo diagnosticar el rechazo:', err);
        }
        return 'Supabase rechazó el mensaje por permisos. Revisá que se haya ejecutado sql/private_messages_rls.sql completo.';
    }

    async function _insertarYNotificar(payloadInsert) {
        const { data: row, error } = await sb()
            .from("private_messages")
            .insert(payloadInsert)
            .select()
            .single();

        if (error) {
            console.error('[ChatManager] Supabase rechazó el mensaje:', error);
            // 42501 = la política RLS rechazó el mensaje: se explica el motivo real
            const motivo = error.code === '42501'
                ? await _explicarRechazo(payloadInsert.to_username)
                : `No se pudo enviar el mensaje (${error.message || 'error desconocido'}).`;
            const e = new Error(motivo);
            e.friendly = true; // el mensaje es apto para mostrarle al usuario
            throw e;
        }

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

        const { data } = await sb()
            .from("private_messages")
            .update({ read_at: new Date().toISOString() })
            .eq("from_username", friendUsername)
            .eq("to_username", username)
            .is("read_at", null)
            .select("id");

        // Solo avisamos por Realtime si realmente había algo para marcar como
        // leído, así el otro extremo actualiza sus ticks a "✓✓ azul" al toque.
        if (data && data.length) {
            try {
                await sb().channel(_canalPara(username, friendUsername)).send({
                    type: "broadcast",
                    event: "mensajes_leidos",
                    payload: { reader: username, owner: friendUsername },
                });
            } catch (err) {
                console.warn('[ChatManager] No se pudo notificar la lectura:', err);
            }
        }

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
        get onPresenciaCambio() {
            return onPresenciaCambio;
        },
        set onPresenciaCambio(cb) {
            onPresenciaCambio = cb;
        },
        get onLecturaCambio() {
            return onLecturaCambio;
        },
        set onLecturaCambio(cb) {
            onLecturaCambio = cb;
        },
        get sonidoActivado() {
            return sonidoActivado;
        },
        set sonidoActivado(v) {
            sonidoActivado = !!v;
        },
    };
})();

window.ChatManager = ChatManager;
