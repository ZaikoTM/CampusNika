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

    let canal = null;
    let onFriendsStateChange = null; // callback: (estadosPorUsername) => void
    let onInviteReceived = null;     // callback: (payload) => void ("Fulano te invitó a su Pomodoro")
    let estadoLocal = { up: null, pomodoroActivo: false, faseActual: null };

    // ------------------------------------------------------------
    // 1. Conectarse al canal de presence al entrar a la plataforma
    // ------------------------------------------------------------
    async function iniciar() {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) {
            console.warn("[pomodoroSyncManager] No hay usuario logueado, no se inicia presence.");
            return;
        }

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

        await canal.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await canal.track({ ...estadoLocal, username, updated_at: new Date().toISOString() });
            }
        });
    }

    function _snapshotPorUsuario() {
        if (!canal) return {};
        const presenceState = canal.presenceState(); // { username: [{...}] }
        const resultado = {};
        Object.entries(presenceState).forEach(([username, metas]) => {
            resultado[username] = metas[0]; // solo la última pestaña/instancia
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
    async function actualizarEstado({ up, pomodoroActivo, faseActual } = {}) {
        estadoLocal = {
            up: up !== undefined ? up : estadoLocal.up,
            pomodoroActivo: pomodoroActivo !== undefined ? pomodoroActivo : estadoLocal.pomodoroActivo,
            faseActual: faseActual !== undefined ? faseActual : estadoLocal.faseActual,
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
    // 5. Salir (al cerrar sesión o navegar fuera de la plataforma)
    // ------------------------------------------------------------
    function detener() {
        if (canal) {
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
        set onFriendsStateChange(cb) {
            onFriendsStateChange = cb;
        },
        set onInviteReceived(cb) {
            onInviteReceived = cb;
        },
    };
})();

window.PomodoroSyncManager = PomodoroSyncManager;
