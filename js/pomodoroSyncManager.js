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
 * POMODORO COMPARTIDO (Host / Invitado): además del canal global de presence,
 * cada sesión compartida usa su PROPIO canal `pomo_sala_<sessionId>`:
 *   Host -> Invitado : 'cmd'   (snapshots de Start/Pause/Stop/fin + latido cada 5 s)
 *   Invitado -> Host : 'hello' (al entrar, y cada 2 s hasta recibir el primer 'cmd')
 *                      'bye'   (al salir)
 * Presence de la sala detecta si el otro extremo se cayó.
 *
 * Depende de: window.NikaSupabase (supabaseClient.js) y window.PomodoroEngine
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
    const HOST_GRACE_MS = 60 * 1000;      // el Invitado espera 1 min a un Host desconectado antes de soltarse
    const SOLICITUD_TTL_MS = 60 * 1000;   // validez de un pedido "Acompañar en el estudio"

    let canal = null;
    let heartbeatInterval = null;
    let onFriendsStateChange = null; // callback: (estadosPorUsername) => void
    let onInviteReceived = null;     // callback: (payload) => void ("Fulano te invitó a su Pomodoro")
    let onJoinConfirmed = null;      // callback: (payload) => void ("Fulano se unió a tu Pomodoro")
    let onJoinRequest = null;        // callback: (payload) => void ("Fulano pide acompañarte")
    let estadoLocal = { up: null, pomodoroActivo: false, faseActual: null, tiempoTotal: null, tiempoRestante: null, tema: null, salaCompartida: null, rolPomodoro: null };
    let sala = null;                 // sala compartida activa (ver abrirSala)
    let solicitudPendiente = null;   // { to, at }: pedí unirme a ese usuario y espero su invitación

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
        // `autoAceptar` NO viene del payload (se podría falsificar): se calcula acá,
        // solo si yo mismo había pedido acompañar a ese usuario hace menos de 1 minuto.
        canal.on("broadcast", { event: "invitacion_pomodoro" }, ({ payload }) => {
            if (!payload || payload.toUsername !== username) return;
            const esperada = !!(solicitudPendiente && solicitudPendiente.to === payload.fromUsername
                && (Date.now() - solicitudPendiente.at) < SOLICITUD_TTL_MS);
            if (esperada) solicitudPendiente = null;
            if (onInviteReceived) onInviteReceived({ ...payload, autoAceptar: esperada });
        });

        // Un amigo pide acompañar mi sesión ("Acompañar en el estudio (Invitado)")
        canal.on("broadcast", { event: "solicitud_union" }, ({ payload }) => {
            if (payload && payload.toUsername === username && onJoinRequest) onJoinRequest(payload);
        });
        // Una persona que invité dijo "ahora no" (o no respondió): libero su lugar y aviso.
        canal.on("broadcast", { event: "invitacion_rechazada" }, ({ payload }) => {
            if (!payload || payload.toUsername !== username) return;
            const eng = window.PomodoroEngine;
            const info = eng && eng.getSharedInfo && eng.getSharedInfo();
            if (!info || info.role !== "host" || (payload.sessionId && payload.sessionId !== info.sessionId)) return;
            if (eng.releaseInvite(payload.fromUsername)) _notificar({ tipo: "invitacion_rechazada", username: payload.fromUsername, motivo: payload.motivo });
        });
        canal.on("broadcast", { event: "union_rechazada" }, ({ payload }) => {
            if (!payload || payload.toUsername !== username) return;
            solicitudPendiente = null;
            _notificar({ tipo: "rechazada", username: payload.fromUsername, motivo: payload.motivo });
        });

        // El invitado avisa que efectivamente arrancó/se unió, para que el host
        // (que no tiene forma de "ver" que el otro ya está corriendo) también
        // refleje la sincronización en su propia barra/estado.
        canal.on("broadcast", { event: "pomodoro_confirmado" }, ({ payload }) => {
            if (payload && payload.toUsername === username && onJoinConfirmed) onJoinConfirmed(payload);
        });

        await canal.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await canal.track({ ...estadoLocal, username, updated_at: new Date().toISOString() });
                _iniciarHeartbeat();
                _reabrirSalaSiCorresponde(); // recargué la página en medio de una sesión compartida
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
        if (document.hidden) return;
        _latido();
        // Invitado que vuelve de segundo plano: pide el estado al Host y re-evalúa la presencia
        const s = sala;
        if (s && s.role === "guest" && !s.cerrada) {
            s.gotCmd = false; _iniciarHello(s);
            setTimeout(() => { if (sala === s) _evaluarSocio(s); }, 3000);
        }
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
    async function actualizarEstado({ up, pomodoroActivo, faseActual, tiempoTotal, tiempoRestante, tema, salaCompartida, rolPomodoro } = {}) {
        estadoLocal = {
            up: up !== undefined ? up : estadoLocal.up,
            pomodoroActivo: pomodoroActivo !== undefined ? pomodoroActivo : estadoLocal.pomodoroActivo,
            faseActual: faseActual !== undefined ? faseActual : estadoLocal.faseActual,
            tiempoTotal: tiempoTotal !== undefined ? tiempoTotal : estadoLocal.tiempoTotal,           // minutos configurados de la fase
            tiempoRestante: tiempoRestante !== undefined ? tiempoRestante : estadoLocal.tiempoRestante, // segundos restantes al momento del reporte
            tema: tema !== undefined ? tema : estadoLocal.tema,                                         // "UP6 · Título" que se está estudiando
            salaCompartida: salaCompartida !== undefined ? salaCompartida : estadoLocal.salaCompartida,
            rolPomodoro: rolPomodoro !== undefined ? rolPomodoro : estadoLocal.rolPomodoro,             // 'host' | 'guest' | null
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
    async function invitarASincronizar(toUsername, extra) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!canal) throw new Error("Presence no iniciado.");

        await canal.send({
            type: "broadcast",
            event: "invitacion_pomodoro",
            payload: {
                fromUsername: username,
                toUsername,
                hostUsername: username,
                sessionId: (extra && extra.sessionId) || null,
                tema: (extra && extra.tema) || estadoLocal.tema || null,
                estadoActual: estadoLocal,
                sentAt: new Date().toISOString(),
            },
        });
    }

    // ------------------------------------------------------------
    // 4.c "Acompañar en el estudio (Invitado)": pido unirme a la sesión de un amigo.
    //     El amigo (Host) acepta con aceptarSolicitud() y me devuelve una invitación.
    // ------------------------------------------------------------
    async function solicitarUnirse(toUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!canal) throw new Error("Presence no iniciado.");
        solicitudPendiente = { to: toUsername, at: Date.now() };
        await canal.send({
            type: "broadcast",
            event: "solicitud_union",
            payload: { fromUsername: username, toUsername, sentAt: new Date().toISOString() },
        });
    }

    async function aceptarSolicitud(toUsername) {
        const eng = window.PomodoroEngine;
        if (!eng || typeof eng.becomeHost !== "function") return { ok: false, reason: "sin_motor" };
        const r = eng.becomeHost(toUsername);
        if (!r.ok) { await rechazarSolicitud(toUsername, r.reason); return r; }
        await invitarASincronizar(toUsername, { sessionId: r.sessionId, tema: r.tema });
        return r;
    }

    // El invitado le responde al Host que no se une ("rechazada") o que no contestó ("sin_respuesta").
    async function rechazarInvitacion(hostUsername, sessionId, motivo) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username || !canal || !hostUsername) return;
        try {
            await canal.send({
                type: "broadcast",
                event: "invitacion_rechazada",
                payload: { fromUsername: username, toUsername: hostUsername, sessionId: sessionId || null, motivo: motivo || "rechazada" },
            });
        } catch (_) {}
    }

    async function rechazarSolicitud(toUsername, motivo) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username || !canal) return;
        try {
            await canal.send({
                type: "broadcast",
                event: "union_rechazada",
                payload: { fromUsername: username, toUsername, motivo: motivo || "no_disponible" },
            });
        } catch (_) {}
    }

    // ------------------------------------------------------------
    // 4.d SALA COMPARTIDA (canal propio por sesión)
    // ------------------------------------------------------------
    function _notificar(evt) {
        try { if (window.PomodoroEngine && window.PomodoroEngine.notifyShared) window.PomodoroEngine.notifyShared(evt); } catch (_) {}
    }

    // Único punto de salida a la sala. NUNCA envía si el canal no está "joined"
    // (si no, el SDK cae al fallback REST y los mensajes llegan en un solo sentido).
    async function _enviarSala(s, event, payload, reintentos) {
        const max = reintentos === undefined ? 2 : reintentos;
        for (let i = 0; i <= max; i++) {
            if (!s || s.cerrada || !s.canal) return "sin_canal";
            if (s.canal.state !== "joined") { await new Promise((r) => setTimeout(r, 300)); continue; }
            try {
                const res = await s.canal.send({ type: "broadcast", event, payload });
                if (res === "ok") return "ok";
            } catch (_) {}
            await new Promise((r) => setTimeout(r, 300 * (i + 1)));
        }
        return "error";
    }

    async function abrirSala(shared) {
        if (!shared || !shared.sessionId) return;
        const username = window.NikaSupabase && window.NikaSupabase.getNikaCurrentUsername();
        if (!username) return;
        if (sala && sala.sessionId === shared.sessionId && sala.role === shared.role) return;
        await salirDeSala(false);

        const nombre = `pomo_sala_${shared.sessionId}`;
        try {
            const previo = sb().getChannels().find((c) => c.topic === `realtime:${nombre}`);
            if (previo) await sb().removeChannel(previo);
        } catch (_) {}

        const s = { sessionId: shared.sessionId, role: shared.role, hostUsername: shared.hostUsername, username,
                    canal: null, helloTimer: null, graceTimer: null, gotCmd: false, cerrada: false, anunciados: new Set() };
        sala = s;
        const ch = sb().channel(nombre, { config: { broadcast: { self: false, ack: true }, presence: { key: username } } });
        s.canal = ch;

        // Host -> Invitado: snapshots del reloj
        ch.on("broadcast", { event: "cmd" }, ({ payload }) => {
            if (s.role !== "guest" || !payload || s.cerrada) return;
            s.gotCmd = true;
            _detenerHello(s);
            if (window.PomodoroEngine) window.PomodoroEngine.applyRemoteCommand(payload);
        });

        // Invitado -> Host: "estoy adentro, mandame el estado"
        ch.on("broadcast", { event: "hello" }, ({ payload }) => {
            if (s.role !== "host" || !payload || !payload.username || s.cerrada) return;
            const eng = window.PomodoroEngine;
            const info = eng && eng.getSharedInfo && eng.getSharedInfo();
            if (!info || info.role !== "host" || info.sessionId !== s.sessionId) return;
            // Solo entra quien el Host invitó o cuyo pedido aceptó, y hasta MAX_GUESTS (4) personas.
            const r = eng.registerGuestJoined(payload.username);
            if (!r.ok) {
                _enviarSala(s, "rechazo", { toUsername: payload.username, motivo: r.reason === "sala_llena" ? "sala_llena" : "no_invitado" }, 0);
                return;
            }
            const snap = eng.getSharedSnapshot("sync");
            if (snap) _enviarSala(s, "cmd", snap, 1);
            _anunciarInvitado(s, payload.username);
        });

        ch.on("broadcast", { event: "bye" }, ({ payload }) => {
            if (s.role !== "host" || !payload || s.cerrada) return;
            if (s.anunciados) s.anunciados.delete(payload.username); // si vuelve a entrar, se anuncia de nuevo
            if (window.PomodoroEngine) window.PomodoroEngine.partnerLeft(payload.username);
        });

        ch.on("broadcast", { event: "rechazo" }, ({ payload }) => {
            if (s.role !== "guest" || !payload || payload.toUsername !== s.username || s.cerrada) return;
            _notificar({ tipo: payload.motivo === "no_invitado" ? "no_invitado" : "sala_llena", username: s.hostUsername });
            if (window.PomodoroEngine) window.PomodoroEngine.leaveShared({ reason: payload.motivo || "sala_llena", notify: false });
        });

        const evaluar = () => _evaluarSocio(s);
        ch.on("presence", { event: "sync" }, evaluar);
        ch.on("presence", { event: "join" }, evaluar);
        ch.on("presence", { event: "leave" }, evaluar);

        await new Promise((resolve) => {
            const t = setTimeout(() => { console.warn("[pomodoroSyncManager] Timeout abriendo la sala."); resolve(false); }, 10000);
            ch.subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    try { await ch.track({ username, role: s.role, online_at: new Date().toISOString() }); } catch (_) {}
                    clearTimeout(t);
                    if (s.role === "guest") { s.gotCmd = false; _iniciarHello(s); }
                    resolve(true);
                } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    clearTimeout(t);
                    resolve(false);
                }
            });
        });
    }

    // "@x se unió": el aviso puede llegar por Presence o por el 'hello' (el primero que llegue); se anuncia UNA vez.
    function _anunciarInvitado(s, username) {
        if (s.anunciados.has(username)) return;
        s.anunciados.add(username);
        _notificar({ tipo: "guest_joined", username });
    }

    function _evaluarSocio(s) {
        if (s.cerrada || sala !== s) return;
        const eng = window.PomodoroEngine;
        if (!eng) return;
        const otros = Object.keys(s.canal.presenceState()).filter((k) => k !== s.username);
        if (s.role === "host") {
            const info = eng.getSharedInfo && eng.getSharedInfo();
            const guests = (info && info.guests) || [];
            guests.filter((g) => g.joined).forEach((g) => {
                const presente = otros.includes(g.username);
                eng.setGuestOnline(g.username, presente);
                if (presente) _anunciarInvitado(s, g.username);
            });
        } else {
            const hostOnline = otros.includes(s.hostUsername);
            eng.setPartnerOnline(hostOnline);
            if (hostOnline) _cancelarGracia(s); else _iniciarGracia(s);
        }
    }

    // El Invitado no queda "atrapado" si el Host desaparece: al minuto se suelta y guarda su tiempo.
    function _iniciarGracia(s) {
        if (s.graceTimer) return;
        s.graceTimer = setTimeout(() => {
            s.graceTimer = null;
            if (sala !== s || s.cerrada) return;
            // Pestaña en segundo plano o canal propio caído: la que está dormida es ESTA conexión, no el Host.
            // El reloj sigue corriendo por hora de fin; se reconecta al volver y se re-evalúa, sin soltar al invitado.
            if (document.hidden || !s.canal || s.canal.state !== "joined") { _iniciarGracia(s); return; }
            const presentes = Object.keys(s.canal.presenceState()).filter((k) => k !== s.username);
            if (presentes.includes(s.hostUsername)) return;
            _notificar({ tipo: "host_offline", username: s.hostUsername });
            if (window.PomodoroEngine) window.PomodoroEngine.leaveShared({ reason: "host_offline", notify: false });
        }, HOST_GRACE_MS);
    }
    function _cancelarGracia(s) { if (s.graceTimer) { clearTimeout(s.graceTimer); s.graceTimer = null; } }

    function _iniciarHello(s) {
        _detenerHello(s);
        let n = 0;
        const pedir = () => {
            if (s.cerrada || s.gotCmd || n >= 30) return _detenerHello(s);
            n++;
            _enviarSala(s, "hello", { username: s.username }, 0).catch(() => {});
        };
        pedir();
        s.helloTimer = setInterval(pedir, 2000);
    }
    function _detenerHello(s) { if (s.helloTimer) { clearInterval(s.helloTimer); s.helloTimer = null; } }

    // Host -> Invitado. Devuelve una promesa (el motor no la espera).
    function emitirComando(snap) {
        if (!sala || sala.role !== "host") return Promise.resolve("sin_sala");
        return _enviarSala(sala, "cmd", snap, 1);
    }

    // Salir de la sala; con `notificar` avisa al otro extremo ANTES de cerrar el canal.
    async function salirDeSala(notificar) {
        const s = sala;
        if (!s) return;
        sala = null;
        if (notificar) {
            try {
                if (s.role === "host") await _enviarSala(s, "cmd", { sessionId: s.sessionId, seq: Date.now(), type: "end" }, 0);
                else await _enviarSala(s, "bye", { username: s.username }, 0);
            } catch (_) {}
        }
        s.cerrada = true;
        _detenerHello(s);
        _cancelarGracia(s);
        try { await s.canal.untrack(); } catch (_) {}
        try { await sb().removeChannel(s.canal); } catch (_) {}
    }

    function _reabrirSalaSiCorresponde() {
        const eng = window.PomodoroEngine;
        const info = eng && eng.getSharedInfo && eng.getSharedInfo();
        if (info) abrirSala(info).catch(() => {});
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
        salirDeSala(false).catch(() => {});
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
        solicitarUnirse,
        aceptarSolicitud,
        rechazarSolicitud,
        rechazarInvitacion,
        confirmarUnion,
        abrirSala,
        salirDeSala,
        emitirComando,
        set onFriendsStateChange(cb) {
            onFriendsStateChange = cb;
        },
        set onInviteReceived(cb) {
            onInviteReceived = cb;
        },
        set onJoinConfirmed(cb) {
            onJoinConfirmed = cb;
        },
        set onJoinRequest(cb) {
            onJoinRequest = cb;
        },
    };
})();

window.PomodoroSyncManager = PomodoroSyncManager;
