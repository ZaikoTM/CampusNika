/**
 * ============================================================
 * CAMPUS NIKA — Feature 6: Pomodoro Sincronizado ("Modo Biblioteca")
 * pomodoroSyncManager.js
 * ------------------------------------------------------------
 * Responsabilidad: publicar el estado de estudio del usuario
 * (UP que está viendo + si tiene un Pomodoro activo) usando
 * Supabase Presence, y permitir que un amigo se "una" a ese
 * ciclo para estudiar sincronizado.
 *
 * Presence (no una tabla nueva) porque el estado es efímero:
 * si el usuario cierra la pestaña, Supabase limpia la presencia
 * sola. No necesitamos histórico ni persistencia en DB.
 *
 * Depende de: window.NikaSupabase (supabaseClient.js)
 * ============================================================
 */

const PomodoroSyncManager = (function () {
    const sb = () => window.NikaSupabase.client;
    const SALA_BIBLIOTECA = "biblioteca_global"; // un único canal de presence compartido

    // Heartbeat: cada cuánto reafirmamos que seguimos "vivos" y cuánto toleramos
    // sin noticias de un usuario antes de tratarlo como Offline en la UI. Esto
    // cubre los casos que untrack() (beforeunload/pagehide) no llega a atajar:
    // se cuelga el navegador, se corta la luz/batería, pierde señal de golpe, etc.
    const HEARTBEAT_MS = 45 * 1000;
    const STALE_MS = 2 * 60 * 1000;

    let canal = null;
    let heartbeatInterval = null;
    let onFriendsStateChange = null; // callback: (estadosPorUsername) => void
    let onInviteReceived = null;     // callback: (payload) => void ("Fulano te invitó a su Pomodoro")
    let onJoinConfirmed = null;      // callback: (payload) => void ("Fulano se unió a tu Pomodoro")
    let estadoLocal = { up: null, pomodoroActivo: false, faseActual: null, tiempoTotal: null, tiempoRestante: null };

    // ------------------------------------------------------------
    // 1. Conectarse al canal de presence al entrar a la plataforma
    // ------------------------------------------------------------
    async function iniciar() {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) {
            console.warn("[pomodoroSyncManager] No hay usuario logueado, no se inicia presence.");
            return;
        }

        _configurarLimpiezaAlSalir();

        canal = sb().channel(SALA_BIBLIOTECA, {
            config: { presence: { key: username } },
        });

        canal.on("presence", { event: "sync" }, () => {
            if (onFriendsStateChange) onFriendsStateChange(_snapshotPorUsuario());
        });

        // Invitación directa a sincronizar Pomodoro con un amigo
        canal.on("broadcast", { event: "invitacion_pomodoro" }, ({ payload }) => {
            if (payload.toUsername === username && onInviteReceived) onInviteReceived(payload);
        });

        // El invitado avisa que efectivamente arrancó/se unió, para que el host
        // (que no tiene forma de "ver" que el otro ya está corriendo) también
        // refleje la sincronización en su propia barra/estado.
        canal.on("broadcast", { event: "pomodoro_confirmado" }, ({ payload }) => {
            if (payload.toUsername === username && onJoinConfirmed) onJoinConfirmed(payload);
        });

        await canal.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await canal.track({ ...estadoLocal, username, updated_at: new Date().toISOString() });
                _iniciarHeartbeat();
            }
        });
    }

    function _latido() {
        if (!canal) return;
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) return;
        try { canal.track({ ...estadoLocal, username, updated_at: new Date().toISOString() }); } catch (_) {}
    }

    function _iniciarHeartbeat() {
        _detenerHeartbeat();
        heartbeatInterval = setInterval(_latido, HEARTBEAT_MS);
        // Al volver de segundo plano (laptop que "despertó", cambio de pestaña)
        // mandamos un latido inmediato en vez de esperar hasta el próximo tick.
        document.addEventListener('visibilitychange', _onVisibilityChange);
    }

    function _detenerHeartbeat() {
        if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
        document.removeEventListener('visibilitychange', _onVisibilityChange);
    }

    function _onVisibilityChange() {
        if (!document.hidden) _latido();
    }

    // El cierre de pestaña/navegador no siempre da tiempo a un ciclo completo del
    // SDK; canal.untrack() es un envío best-effort (no espera respuesta), así que
    // se dispara en ambos eventos para maximizar las chances de que llegue a tiempo.
    function _configurarLimpiezaAlSalir() {
        const limpiar = () => { try { if (canal) canal.untrack(); } catch (_) {} };
        window.addEventListener('beforeunload', limpiar);
        window.addEventListener('pagehide', limpiar);
    }

    function _snapshotPorUsuario() {
        if (!canal) return {};
        const presenceState = canal.presenceState(); // { username: [{...}] }
        const ahora = Date.now();
        const resultado = {};
        Object.entries(presenceState).forEach(([username, metas]) => {
            const meta = metas[0]; // solo la última pestaña/instancia
            if (!meta) return;
            const ts = meta.updated_at ? new Date(meta.updated_at).getTime() : 0;
            // Sin heartbeat reciente: lo tratamos como Offline aunque Supabase
            // todavía no haya limpiado su presencia (conexión cortada de golpe).
            if (ahora - ts > STALE_MS) return;
            resultado[username] = meta;
        });
        return resultado;
    }

    // ------------------------------------------------------------
    // 2. Actualizar mi propio estado (llamado desde estudio.js / pomodoro.js
    //    cada vez que cambia de UP o arranca/pausa/termina el timer)
    //
    //    NOTA: combina (merge) con el estado previo en vez de sobreescribirlo
    //    entero. estudio.js reporta solo `up` al abrir/cerrar una UP, y
    //    pomodoro.js reporta solo `pomodoroActivo`/`faseActual` al arrancar,
    //    pausar o cambiar de fase — si uno pisara al otro, uno de los dos
    //    campos se perdería en cada llamada.
    // ------------------------------------------------------------
    async function actualizarEstado({ up, pomodoroActivo, faseActual, tiempoTotal, tiempoRestante } = {}) {
        estadoLocal = {
            up: up !== undefined ? up : estadoLocal.up,
            pomodoroActivo: pomodoroActivo !== undefined ? pomodoroActivo : estadoLocal.pomodoroActivo,
            faseActual: faseActual !== undefined ? faseActual : estadoLocal.faseActual,
            tiempoTotal: tiempoTotal !== undefined ? tiempoTotal : estadoLocal.tiempoTotal,           // minutos configurados de la fase
            tiempoRestante: tiempoRestante !== undefined ? tiempoRestante : estadoLocal.tiempoRestante, // segundos restantes al momento del reporte
        };
        if (!canal) return;

        const username = window.NikaSupabase.getNikaCurrentUsername();
        await canal.track({ ...estadoLocal, username, updated_at: new Date().toISOString() });
    }

    // ------------------------------------------------------------
    // 3. Lista de amigos con su estado actual (solo filtra la lista
    //    de amigos del usuario contra el snapshot de presence global)
    // ------------------------------------------------------------
    function estadoDeAmigos(listaUsernamesAmigos) {
        const snapshot = _snapshotPorUsuario();
        return listaUsernamesAmigos
            .filter((u) => snapshot[u])
            .map((u) => ({ username: u, ...snapshot[u] }));
    }

    // ------------------------------------------------------------
    // 4. Invitar a un amigo a sincronizar el Pomodoro ("Unirme al Pomodoro")
    // ------------------------------------------------------------
    async function invitarASincronizar(toUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!canal) throw new Error("Presence no iniciado.");

        await canal.send({
            type: "broadcast",
            event: "invitacion_pomodoro",
            payload: {
                fromUsername: username,
                toUsername,
                estadoActual: estadoLocal,
                sentAt: new Date().toISOString(),
            },
        });
    }

    // ------------------------------------------------------------
    // 4.b Confirmar al host que ya estoy sincronizado con su Pomodoro
    //     (así su barra también muestra "Sincronizado con @vos")
    // ------------------------------------------------------------
    async function confirmarUnion(toUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username || !canal || !toUsername) return;
        try {
            await canal.send({
                type: "broadcast",
                event: "pomodoro_confirmado",
                payload: { fromUsername: username, toUsername, confirmedAt: new Date().toISOString() },
            });
        } catch (_) {}
    }

    // ------------------------------------------------------------
    // 5. Salir (al cerrar sesión o navegar fuera de la plataforma)
    // ------------------------------------------------------------
    function detener() {
        _detenerHeartbeat();
        if (canal) {
            try { canal.untrack(); } catch (_) {}
            sb().removeChannel(canal);
            canal = null;
        }
    }

    return {
        iniciar,
        detener,
        actualizarEstado,
        estadoDeAmigos,
        invitarASincronizar,
        confirmarUnion,
        set onFriendsStateChange(cb) {
            onFriendsStateChange = cb;
        },
        set onInviteReceived(cb) {
            onInviteReceived = cb;
        },
        set onJoinConfirmed(cb) {
            onJoinConfirmed = cb;
        },
    };
})();

window.PomodoroSyncManager = PomodoroSyncManager;
