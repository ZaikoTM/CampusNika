// js/social.js
// CAMPUS NIKA — Ecosistema Social (Frente 4 / Fase Final Frente 2)
// Habla con Supabase de verdad: Chat Global en tiempo real, Foro por UP
// (hilos + respuestas) y actualización de ELO. La integración visual
// (paneles, listas, tabla de posiciones) vive en campus.html y llama a
// estas funciones.
//
// Requiere que window.NikaAuth.ready y el cliente global de Supabase
// (window.NikaSupabase.client, alias "supabase" en campus.html) ya estén
// disponibles — ambos se inicializan en supabaseClient.js / auth-guard.js.

const NikaSocial = (() => {

    const DEFAULT_AVATAR = 'assets/N%20NIKA.png';

    function getClient() {
        if (window.NikaSupabase && window.NikaSupabase.client) return window.NikaSupabase.client;
        if (typeof supabase !== 'undefined') return supabase;
        return null;
    }

    async function getUserId() {
        if (window.NikaAuth && window.NikaAuth.ready) {
            return await window.NikaAuth.ready;
        }
        const client = getClient();
        if (client) {
            const { data: { user } } = await client.auth.getUser();
            return user ? user.id : null;
        }
        return null;
    }

    // Tu tabla profiles tiene columnas duplicadas (fullname/full_name y avatar/avatar_url).
    // El Campus guarda en fullname/avatar, así que se priorizan esas y se devuelven ambos
    // juegos de nombres para que cualquier pantalla los pueda leer.
    function normProfile(p) {
        if (!p) return null;
        const nombre = p.fullname || p.full_name || p.nombre || p.username || null;
        const avatar = p.avatar || p.avatar_url || null;
        return { ...p, fullname: nombre, full_name: nombre, avatar, avatar_url: avatar };
    }

    // Aplica normProfile al join "profiles" de cada fila (soporta objeto o array)
    function normRows(rows) {
        return (rows || []).map((r) => {
            if (!r || !r.profiles) return r;
            const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            return { ...r, profiles: normProfile(p) };
        });
    }

    async function getProfile(userId) {
        const client = getClient();
        if (!client || !userId) return null;
        const { data, error } = await client
            .from('profiles')
            .select('id, username, fullname, full_name, nombre, avatar, avatar_url')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            console.warn('[NikaSocial] No se pudo leer el perfil:', error.message);
            return null;
        }
        return normProfile(data);
    }

    // ============================================================
    // CHAT GLOBAL (tiempo real con Supabase Realtime)
    // ============================================================

    let chatChannel = null;

    /**
     * Envía un mensaje al chat global.
     * @param {string} message - Contenido del mensaje (1-1000 caracteres).
     * @returns {Promise<{ok: boolean, data?: object, error?: string}>}
     */
    async function enviarMensajeChat(message) {
        try {
            const text = (message || '').trim();
            if (!text) return { ok: false, error: 'El mensaje está vacío.' };
            if (text.length > 1000) return { ok: false, error: 'El mensaje supera los 1000 caracteres.' };

            const client = getClient();
            if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };

            const userId = await getUserId();
            if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para chatear.' };

            const { data, error } = await client
                .from('global_chat')
                .insert({ user_id: userId, message: text })
                .select()
                .single();

            if (error) return { ok: false, error: error.message };
            return { ok: true, data };
        } catch (err) {
            console.error('[NikaSocial] Excepción en enviarMensajeChat:', err);
            return { ok: false, error: 'Error inesperado al enviar el mensaje.' };
        }
    }

    /**
     * Trae los últimos N mensajes del chat global (orden cronológico).
     * @param {number} limit
     */
    async function cargarMensajesChat(limit = 50) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.', data: [] };

        const { data, error } = await client
            .from('global_chat')
            .select('id, user_id, message, created_at, profiles ( username, fullname, full_name, nombre, avatar, avatar_url )')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[NikaSocial] Error al cargar el chat global:', error);
            return { ok: false, error: error.message, data: [] };
        }

        return { ok: true, data: normRows(data).reverse() };
    }

    /**
     * Se suscribe al canal Realtime del chat global. Llama a onMessage(row)
     * por cada mensaje nuevo insertado por cualquier usuario.
     * Devuelve una función para desuscribirse (limpieza al cerrar el panel).
     */
    function suscribirseAChatGlobal(onMessage) {
        const client = getClient();
        if (!client) return () => {};

        if (chatChannel) {
            client.removeChannel(chatChannel);
            chatChannel = null;
        }

        chatChannel = client
            .channel('public:global_chat')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'global_chat' },
                async (payload) => {
                    const row = payload.new;
                    // El evento realtime no trae el join a "profiles": lo resolvemos
                    // aparte para poder mostrar nombre y avatar del autor.
                    const profile = await getProfile(row.user_id);
                    onMessage({ ...row, profiles: profile });
                }
            )
            .subscribe();

        return () => {
            if (chatChannel) {
                client.removeChannel(chatChannel);
                chatChannel = null;
            }
        };
    }

    // ============================================================
    // FORO POR UNIDAD PROBLEMA (forum_threads + forum_replies)
    // ============================================================

    /**
     * Crea un hilo nuevo en el foro de una Unidad Problema.
     * @param {string} moduleId - ej. 'cirugia'
     * @param {string} upId - ej. 'up1'
     * @param {string} title - título del hilo (1-200 caracteres)
     * @param {string} content - contenido inicial (1-5000 caracteres)
     * @returns {Promise<{ok: boolean, data?: object, error?: string}>}
     */
    async function crearHiloForo(moduleId, upId, title, content) {
        try {
            if (!moduleId || !upId) return { ok: false, error: 'Falta el contexto de módulo/UP.' };
            const cleanTitle = (title || '').trim();
            const cleanContent = (content || '').trim();
            if (!cleanTitle || !cleanContent) return { ok: false, error: 'Título y contenido son obligatorios.' };

            const client = getClient();
            if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };

            const userId = await getUserId();
            if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para publicar en el foro.' };

            const { data, error } = await client
                .from('forum_threads')
                .insert({
                    user_id: userId,
                    module: moduleId,
                    up_id: upId,
                    title: cleanTitle,
                    content: cleanContent
                })
                .select()
                .single();

            if (error) return { ok: false, error: error.message };
            return { ok: true, data };
        } catch (err) {
            console.error('[NikaSocial] Excepción en crearHiloForo:', err);
            return { ok: false, error: 'Error inesperado al crear el hilo.' };
        }
    }

    /**
     * Lista los hilos de un módulo (y opcionalmente una UP puntual), con
     * datos del autor y cantidad de respuestas.
     * @param {string} moduleId
     * @param {string|null} upId - si se omite, trae todas las UP del módulo.
     */
    async function cargarHilosForo(moduleId, upId = null) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.', data: [] };

        let query = client
            .from('forum_threads')
            .select('id, user_id, module, up_id, title, content, created_at, profiles ( username, fullname, full_name, nombre, avatar, avatar_url ), forum_replies ( count )')
            .eq('module', moduleId)
            .order('created_at', { ascending: false });

        if (upId) query = query.eq('up_id', upId);

        const { data, error } = await query;

        if (error) {
            console.error('[NikaSocial] Error al cargar hilos del foro:', error);
            return { ok: false, error: error.message, data: [] };
        }

        return { ok: true, data: normRows(data) };
    }

    /**
     * Publica una respuesta dentro de un hilo existente.
     * @param {string|number} threadId
     * @param {string} content
     */
    async function responderHilo(threadId, content) {
        try {
            const cleanContent = (content || '').trim();
            if (!threadId) return { ok: false, error: 'Falta el hilo al que responder.' };
            if (!cleanContent) return { ok: false, error: 'La respuesta no puede estar vacía.' };

            const client = getClient();
            if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };

            const userId = await getUserId();
            if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para responder.' };

            const { data, error } = await client
                .from('forum_replies')
                .insert({ thread_id: threadId, user_id: userId, content: cleanContent })
                .select()
                .single();

            if (error) return { ok: false, error: error.message };
            return { ok: true, data };
        } catch (err) {
            console.error('[NikaSocial] Excepción en responderHilo:', err);
            return { ok: false, error: 'Error inesperado al responder el hilo.' };
        }
    }

    /**
     * Trae las respuestas de un hilo, más antiguas primero.
     */
    async function cargarRespuestasHilo(threadId) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.', data: [] };

        const { data, error } = await client
            .from('forum_replies')
            .select('id, thread_id, user_id, content, created_at, profiles ( username, fullname, full_name, nombre, avatar, avatar_url )')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[NikaSocial] Error al cargar respuestas del hilo:', error);
            return { ok: false, error: error.message, data: [] };
        }

        return { ok: true, data: normRows(data) };
    }

    // ============================================================
    // RANKING ELO (user_ranking)
    // ============================================================

    /**
     * Actualiza el Elo, wins/losses y racha de un usuario tras un duelo del
     * Modo Versus 1vs1 o un simulacro puntuado. Lee la fila actual (si
     * existe), calcula los nuevos totales y hace upsert.
     *
     * @param {string} userId
     * @param {boolean} won - true si ganó el duelo / superó el umbral del simulacro
     * @param {number} eloDelta - variación de puntos a aplicar (positiva o negativa)
     * @returns {Promise<{ok: boolean, data?: object, error?: string}>}
     */
    async function actualizarElo(userId, won, eloDelta) {
        try {
            if (!userId) return { ok: false, error: 'Falta el user_id.' };
            if (typeof eloDelta !== 'number' || isNaN(eloDelta)) {
                return { ok: false, error: 'eloDelta inválido.' };
            }

            const client = getClient();
            if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };

            const { data: current, error: readError } = await client
                .from('user_ranking')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (readError) return { ok: false, error: readError.message };

            const base = current || { elo_score: 1000, wins: 0, losses: 0, current_streak: 0 };
            const newStreak = won ? Math.max(1, (base.current_streak || 0) + 1) : 0;
            const newElo = Math.max(0, (base.elo_score || 1000) + eloDelta);

            const { data, error } = await client
                .from('user_ranking')
                .upsert({
                    user_id: userId,
                    elo_score: newElo,
                    wins: (base.wins || 0) + (won ? 1 : 0),
                    losses: (base.losses || 0) + (won ? 0 : 1),
                    current_streak: newStreak,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) return { ok: false, error: error.message };
            return { ok: true, data };
        } catch (err) {
            console.error('[NikaSocial] Excepción en actualizarElo:', err);
            return { ok: false, error: 'Error inesperado al actualizar el ranking.' };
        }
    }

    /**
     * Trae el ranking global ordenado por elo_score descendente, con datos
     * del perfil de cada estudiante. Pensado para pintar el podio/leaderboard.
     * @param {number} limit
     */
    async function cargarRankingGlobal(limit = 20) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.', data: [] };

        const { data, error } = await client
            .from('user_ranking')
            .select('user_id, elo_score, wins, losses, current_streak, profiles ( username, fullname, full_name, nombre, avatar, avatar_url )')
            .order('elo_score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[NikaSocial] Error al cargar el ranking global:', error);
            return { ok: false, error: error.message, data: [] };
        }

        return { ok: true, data: normRows(data) };
    }

    return {
        DEFAULT_AVATAR,
        // Chat global
        enviarMensajeChat, cargarMensajesChat, suscribirseAChatGlobal,
        // Foro
        crearHiloForo, cargarHilosForo, responderHilo, cargarRespuestasHilo,
        // Ranking
        actualizarElo, cargarRankingGlobal
    };
})();
