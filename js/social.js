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
            .select('id, username, fullname, full_name, nombre, avatar, avatar_url, role')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            console.warn('[NikaSocial] No se pudo leer el perfil:', error.message);
            return null;
        }
        return normProfile(data);
    }

    /**
     * Trae los amigos confirmados de un usuario cualquiera (no necesariamente
     * el que está logueado) — pensado para la lista desplegable "Amigos" del
     * modal de Perfil Público. Dos consultas (friendships + profiles) porque
     * no hay una FK directa para resolverlo en un solo select con join.
     * @param {string} userId
     * @returns {Promise<{ok: boolean, data: object[], error?: string}>}
     */
    async function cargarAmigosDeUsuario(userId) {
        const client = getClient();
        if (!client || !userId) return { ok: false, error: 'No hay conexión con Supabase.', data: [] };

        const { data: rows, error } = await client
            .from('friendships')
            .select('id, requester_id, addressee_id, status')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

        if (error) {
            console.error('[NikaSocial] Error al cargar amigos del usuario:', error);
            return { ok: false, error: error.message, data: [] };
        }

        const otherIds = [...new Set((rows || []).map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id)))];
        if (!otherIds.length) return { ok: true, data: [] };

        const { data: profiles, error: profError } = await client
            .from('profiles')
            .select('id, username, fullname, full_name, nombre, avatar, avatar_url, role')
            .in('id', otherIds);

        if (profError) {
            console.error('[NikaSocial] Error al cargar perfiles de amigos:', profError);
            return { ok: false, error: profError.message, data: [] };
        }

        const normalizados = (profiles || [])
            .map(normProfile)
            .sort((a, b) => (a.fullname || '').localeCompare(b.fullname || '', 'es'));

        return { ok: true, data: normalizados };
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
    // Filtro de lenguaje SOLO para el chat global (el chat privado entre amigos es libre y no pasa por acá).
    // Tapa con asteriscos las groserías y los insultos discriminatorios más comunes, sin importar tildes ni mayúsculas.
    const PALABRAS_GLOBAL = ['hijo de puta', 'hijos de puta', 'hdp', 'la puta que', 'puta', 'puto', 'putos', 'putas', 'mierda', 'concha', 'conchudo', 'conchuda', 'pelotudo', 'pelotuda', 'forro', 'forra', 'verga', 'pija',
        'maricon', 'maricón', 'trolo', 'sudaca', 'mogolico', 'mogólico', 'retrasado', 'retrasada', 'negro de mierda', 'cagon de mierda'];
    const _sinTildes = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    function filtrarChatGlobal(texto) {
        let out = String(texto || '');
        const plano = _sinTildes(out).toLowerCase();       // misma longitud que el original (las tildes se descomponen y se quitan)
        if (plano.length !== out.length) return out;
        const marcas = new Array(out.length).fill(false);
        PALABRAS_GLOBAL.forEach((w) => {
            const base = _sinTildes(w).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp('(^|[^a-z0-9])(' + base + ')(?=$|[^a-z0-9])', 'g');
            let m; while ((m = re.exec(plano))) { const ini = m.index + m[1].length; for (let i = ini + 1; i < ini + m[2].length; i++) marcas[i] = true; }
        });
        return out.split('').map((ch, i) => (marcas[i] && ch !== ' ' ? '*' : ch)).join('');
    }

    async function enviarMensajeChat(message) {
        try {
            const text = filtrarChatGlobal((message || '').trim());
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
            .select('id, user_id, message, created_at, profiles ( username, fullname, full_name, nombre, avatar, avatar_url, role )')
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
    async function crearHiloForo(moduleId, upId, title, content, extra) {
        try {
            if (!moduleId || !upId) return { ok: false, error: 'Falta el contexto de módulo/UP.' };
            const cleanTitle = (title || '').trim();
            const cleanContent = (content || '').trim();
            if (!cleanTitle || !cleanContent) return { ok: false, error: 'Título y contenido son obligatorios.' };

            const client = getClient();
            if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };

            const userId = await getUserId();
            if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para publicar en el foro.' };

            const base = { user_id: userId, module: moduleId, up_id: upId, title: cleanTitle, content: cleanContent };
            // extra: adjuntos (attachment_url / attachment_name / attachment_type). Si la base todavía no tiene
            // esas columnas (falta correr sql/foro_feed.sql) se reintenta sin adjunto y se avisa.
            let { data, error } = await client.from('forum_threads').insert({ ...base, ...(extra || {}) }).select().single();
            if (error && extra && /attachment|column|schema cache/i.test(error.message || '')) {
                ({ data, error } = await client.from('forum_threads').insert(base).select().single());
                if (!error) return { ok: true, data, aviso: 'Se publicó sin el adjunto: falta ejecutar sql/foro_feed.sql en Supabase.' };
            }

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
            .select('*, profiles ( username, fullname, full_name, nombre, avatar, avatar_url, role ), forum_replies ( count )')
            .order('created_at', { ascending: false })
            .limit(100);

        if (moduleId) query = query.eq('module', moduleId);
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
    async function responderHilo(threadId, content, parentId) {
        try {
            const cleanContent = (content || '').trim();
            if (!threadId) return { ok: false, error: 'Falta el hilo al que responder.' };
            if (!cleanContent) return { ok: false, error: 'La respuesta no puede estar vacía.' };

            const client = getClient();
            if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };

            const userId = await getUserId();
            if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para responder.' };

            const fila = { thread_id: threadId, user_id: userId, content: cleanContent };
            if (parentId) fila.parent_id = parentId; // comentario anidado (requiere sql/foro_feed.sql)
            const { data, error } = await client
                .from('forum_replies')
                .insert(fila)
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
            .select('*, profiles ( username, fullname, full_name, nombre, avatar, avatar_url, role )')
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
            .select('user_id, elo_score, wins, losses, current_streak, profiles ( username, fullname, full_name, nombre, avatar, avatar_url, role )')
            .order('elo_score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[NikaSocial] Error al cargar el ranking global:', error);
            return { ok: false, error: error.message, data: [] };
        }

        return { ok: true, data: normRows(data) };
    }

    /**
     * Ranking que NUNCA queda vacío. cargarRankingGlobal() lee solo user_ranking, que tiene
     * filas únicamente de quienes ya jugaron un duelo: con la plataforma recién arrancada (o si
     * la RLS de esa tabla oculta filas ajenas) el podio aparecía desierto aunque hubiera usuarios.
     * Acá se parte de los perfiles registrados y se les suma lo que exista de:
     *   - user_ranking   (elo_score, wins, losses, current_streak)
     *   - versus_players (elo)
     * Sin dato de duelos, el ELO base es 1000. Orden: ELO desc, victorias desc, nombre.
     */
    async function cargarRankingCompleto(limit = 20) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.', data: [] };

        const [perfiles, rankings, players] = await Promise.all([
            client.from('profiles').select('id, username, fullname, full_name, nombre, avatar, avatar_url, role').limit(500),
            client.from('user_ranking').select('user_id, elo_score, wins, losses, current_streak').limit(1000),
            client.from('versus_players').select('username, elo').limit(1000),
        ]);

        if (perfiles.error) {
            console.error('[NikaSocial] No se pudieron leer los perfiles del ranking:', perfiles.error);
            // Último recurso: al menos lo que exista en user_ranking
            return cargarRankingGlobal(limit);
        }
        if (rankings.error) console.warn('[NikaSocial] user_ranking no disponible:', rankings.error.message);
        if (players.error) console.warn('[NikaSocial] versus_players no disponible:', players.error.message);

        const porUser = new Map((rankings.data || []).map((r) => [r.user_id, r]));
        const eloPorUsername = new Map((players.data || []).map((p) => [String(p.username || '').toLowerCase(), p.elo]));

        const filas = (perfiles.data || []).map((p) => {
            const r = porUser.get(p.id) || {};
            const eloVersus = eloPorUsername.get(String(p.username || '').toLowerCase());
            const elo = typeof r.elo_score === 'number' ? r.elo_score : (typeof eloVersus === 'number' ? eloVersus : 1000);
            return {
                user_id: p.id,
                elo_score: elo,
                wins: r.wins || 0,
                losses: r.losses || 0,
                current_streak: r.current_streak || 0,
                profiles: normProfile(p),
            };
        });

        filas.sort((a, b) => (b.elo_score - a.elo_score) || (b.wins - a.wins)
            || String(a.profiles?.fullname || '').localeCompare(String(b.profiles?.fullname || ''), 'es'));

        return { ok: true, data: filas.slice(0, limit) };
    }

    /** Reacciones de varias publicaciones a la vez: devuelve filas { thread_id, user_id, tipo }. */
    async function cargarReaccionesForo(threadIds) {
        const client = getClient();
        if (!client || !threadIds || !threadIds.length) return { ok: true, data: [] };
        const { data, error } = await client.from('forum_reactions').select('thread_id, user_id, tipo').in('thread_id', threadIds);
        if (error) return { ok: false, error: error.message, data: [] };
        return { ok: true, data: data || [] };
    }

    /** Pone o saca una reacción (👍 util · ❤️ excelente · 💡 duda) del usuario en una publicación. */
    async function alternarReaccionForo(threadId, tipo, activa) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };
        const userId = await getUserId();
        if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para reaccionar.' };
        const q = activa
            ? client.from('forum_reactions').delete().eq('thread_id', threadId).eq('user_id', userId).eq('tipo', tipo)
            : client.from('forum_reactions').insert({ thread_id: threadId, user_id: userId, tipo });
        const { error } = await q;
        if (error) return { ok: false, error: error.message };
        return { ok: true };
    }

    /** Sube una imagen o PDF (máx. 8 MB) al bucket forum-files y devuelve { url, name, type }. */
    async function subirAdjuntoForo(file) {
        const client = getClient();
        if (!client) return { ok: false, error: 'No hay conexión con Supabase.' };
        const userId = await getUserId();
        if (!userId) return { ok: false, error: 'Necesitás iniciar sesión para adjuntar archivos.' };
        const esImagen = /^image\/(jpeg|png|webp|gif)$/.test(file.type);
        const esPdf = file.type === 'application/pdf';
        if (!esImagen && !esPdf) return { ok: false, error: 'Solo se pueden adjuntar imágenes (JPG, PNG, WEBP, GIF) o PDF.' };
        if (file.size > 8 * 1024 * 1024) return { ok: false, error: 'El archivo supera los 8 MB.' };
        const limpio = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
        const path = `${userId}/${Date.now()}_${limpio}`;
        const { error } = await client.storage.from('forum-files').upload(path, file, { contentType: file.type, upsert: false });
        if (error) return { ok: false, error: /bucket|not found/i.test(error.message) ? 'Falta crear el bucket forum-files (ejecutá sql/foro_feed.sql).' : error.message };
        const { data } = client.storage.from('forum-files').getPublicUrl(path);
        return { ok: true, url: data.publicUrl, name: file.name, type: esImagen ? 'image' : 'pdf' };
    }

    return {
        DEFAULT_AVATAR,
        // Chat global
        enviarMensajeChat, filtrarChatGlobal, cargarMensajesChat, suscribirseAChatGlobal,
        // Foro
        crearHiloForo, cargarHilosForo, responderHilo, cargarRespuestasHilo,
        cargarReaccionesForo, alternarReaccionForo, subirAdjuntoForo,
        // Ranking
        actualizarElo, cargarRankingGlobal, cargarRankingCompleto,
        // Perfil público
        cargarAmigosDeUsuario
    };
})();
