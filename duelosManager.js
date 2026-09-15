/**
 * ============================================================
 * CAMPUS NIKA — Fase 7: Modo Versus 1vs1
 * duelosManager.js
 * ------------------------------------------------------------
 * Responsabilidad: salas numéricas, quick match, ELO,
 * sincronización de preguntas (patrón Host-Cliente vía
 * Realtime Broadcast) y manejo de Presence para timeouts.
 *
 * Depende de: window.NikaSupabase (supabaseClient.js)
 * ============================================================
 */

const DuelosManager = (function () {
    const sb = () => window.NikaSupabase.client;

    // Estado interno del duelo en curso
    let state = {
        roomId: null,
        roomCode: null,
        isHost: false,
        isAI: false,
        username: null,
        rivalUsername: null,
        channel: null,        // canal de Broadcast (estado del duelo)
        presenceChannel: null, // canal de Presence (detección de caída)
        answersChannel: null,  // canal de Postgres Changes sobre versus_answers (reemplaza el polling)
        answersBuffer: {},     // { [questionId]: { host, guest } } — respuestas ya recibidas por Realtime
        answersListeners: {},  // { [questionId]: fn(row) } — resolver activo de _esperarRespuestasDeAmbos
        onStateChange: null,   // callback que consume versus.html
        onOpponentLeft: null,  // callback cuando el rival se desconecta
        onReaction: null,      // callback ante una reacción del rival
        onRivalAnswered: null, // callback cuando el rival ya contestó la pregunta actual
        onChatMessage: null,   // callback ante un mensaje de chat entrante
        graceTimer: null,
    };

    // ------------------------------------------------------------
    // Configuración de dificultad del Modo IA (práctica en solitario)
    // ------------------------------------------------------------
    const DIFICULTADES_IA = {
        facil:   { aciertoProb: 0.40, delayMin: 7000,  delayMax: 12000, label: "Fácil" },
        normal:  { aciertoProb: 0.70, delayMin: 3000,  delayMax: 6000,  label: "Normal" },
        dificil: { aciertoProb: 0.97, delayMin: 500,   delayMax: 1500,  label: "Difícil (Experto)" },
    };

    let aiTimers = [];       // todos los setTimeout/setInterval del duelo IA, para poder limpiarlos
    let aiRespuestaPendiente = null; // resolver de la promesa que espera la respuesta del jugador

    // ------------------------------------------------------------
    // Utilidades
    // ------------------------------------------------------------
    function generarCodigoSala() {
        return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
    }

    function barajarIndependiente(opciones) {
        // Fisher-Yates — cada cliente baraja localmente su propio orden visual.
        // El backend siempre trabaja con el índice lógico de la opción correcta,
        // no con la posición en pantalla, así que barajar acá no rompe nada.
        const arr = [...opciones];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ------------------------------------------------------------
    // 1. Crear sala (por código o desafío directo)
    // ------------------------------------------------------------
    async function crearSala({ tema = null, roomType = "code" } = {}) {
        const username = await window.NikaSupabase.ensureVersusPlayer();
        if (!username) throw new Error("No hay usuario logueado.");

        const roomCode = roomType === "code" ? generarCodigoSala() : null;

        const { data, error } = await sb()
            .from("versus_rooms")
            .insert({
                room_code: roomCode,
                room_type: roomType,
                host_username: username,
                tema,
                status: "waiting",
            })
            .select()
            .single();

        if (error) throw error;

        state.roomId = data.id;
        state.roomCode = data.room_code;
        state.isHost = true;
        state.username = username;

        await _suscribirseASala(data.id);
        return data;
    }

    // ------------------------------------------------------------
    // 2. Unirse a sala por código
    // ------------------------------------------------------------
    async function unirseASalaPorCodigo(roomCode) {
        const username = await window.NikaSupabase.ensureVersusPlayer();
        if (!username) throw new Error("No hay usuario logueado.");

        // Validación: sala debe existir, estar 'waiting' y no vencida
        const { data: room, error: findError } = await sb()
            .from("versus_rooms")
            .select("*")
            .eq("room_code", roomCode)
            .eq("status", "waiting")
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();

        if (findError) throw findError;
        if (!room) throw new Error("Sala no encontrada, llena o vencida.");
        if (room.host_username === username) throw new Error("No podés unirte a tu propia sala.");

        const { data: updated, error: updateError } = await sb()
            .from("versus_rooms")
            .update({ guest_username: username, status: "in_progress", started_at: new Date().toISOString() })
            .eq("id", room.id)
            .eq("status", "waiting") // evita condición de carrera si dos entran a la vez
            .select()
            .single();

        if (updateError) throw updateError;

        state.roomId = updated.id;
        state.roomCode = updated.room_code;
        state.isHost = false;
        state.username = username;
        state.rivalUsername = updated.host_username;

        await _suscribirseASala(updated.id);
        return updated;
    }

    // ------------------------------------------------------------
    // 3. Cola de Quick Match
    // ------------------------------------------------------------
    async function unirseAQuickMatch({ tema = null } = {}) {
        const username = await window.NikaSupabase.ensureVersusPlayer();
        if (!username) throw new Error("No hay usuario logueado.");

        const { data: player } = await sb()
            .from("versus_players")
            .select("elo")
            .eq("username", username)
            .single();

        // Busca un rival ya esperando (mismo tema, ELO similar ±150)
        const eloMin = (player?.elo || 1000) - 150;
        const eloMax = (player?.elo || 1000) + 150;

        let query = sb()
            .from("versus_queue")
            .select("*")
            .neq("username", username)
            .gte("elo", eloMin)
            .lte("elo", eloMax)
            .order("joined_at", { ascending: true })
            .limit(1);

        if (tema) query = query.eq("tema", tema);

        const { data: rivales } = await query;

        if (rivales && rivales.length > 0) {
            // Hay rival esperando: lo saco de la cola y creamos sala juntos
            const rival = rivales[0];
            await sb().from("versus_queue").delete().eq("username", rival.username);

            const sala = await crearSala({ tema, roomType: "quick_match" });
            await sb()
                .from("versus_rooms")
                .update({ guest_username: rival.username, status: "in_progress", started_at: new Date().toISOString() })
                .eq("id", sala.id);

            return { matched: true, roomId: sala.id };
        }

        // No hay rival: me anoto en la cola y espero notificación por Realtime
        await sb().from("versus_queue").upsert({ username, tema, elo: player?.elo || 1000, joined_at: new Date().toISOString() });
        return { matched: false };
    }

    async function salirDeQuickMatch() {
        if (!state.username) return;
        await sb().from("versus_queue").delete().eq("username", state.username);
    }

    // ------------------------------------------------------------
    // 4. Suscripción a la sala (Broadcast + Presence)
    // ------------------------------------------------------------
    async function _suscribirseASala(roomId) {
        const channelName = `versus_room_${roomId}`;
        const channel = sb().channel(channelName, {
            config: { presence: { key: state.username } },
        });

        // --- Broadcast: eventos de estado del duelo (emitidos por el Host) ---
        channel.on("broadcast", { event: "duelo_estado" }, ({ payload }) => {
            if (state.onStateChange) state.onStateChange(payload);
        });

        // --- Broadcast: reacciones rápidas (cualquiera de los dos) ---
        _suscribirseAReacciones(channel);

        // --- Broadcast: "ya respondí esta pregunta" (indicador de progreso del rival) ---
        _suscribirseARespuestaParcial(channel);

        // --- Broadcast: chat rápido del duelo ---
        _suscribirseAChat(channel);

        // --- Presence: detectar caída del Host ---
        channel.on("presence", { event: "sync" }, () => {
            const presentUsers = Object.keys(channel.presenceState());
            if (!state.isHost && state.rivalUsername && !presentUsers.includes(state.rivalUsername)) {
                _iniciarGraciaPorDesconexion();
            }
        });

        channel.on("presence", { event: "leave" }, ({ key }) => {
            if (!state.isHost && key === state.rivalUsername) {
                _iniciarGraciaPorDesconexion();
            }
        });

        await channel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await channel.track({ username: state.username, online_at: new Date().toISOString() });
            }
        });

        state.channel = channel;

        // --- Postgres Changes: respuestas del duelo en tiempo real (reemplaza el polling) ---
        _suscribirseARespuestas(roomId);
    }

    // ------------------------------------------------------------
    // 4b. Suscripción a Postgres Changes sobre versus_answers
    // ------------------------------------------------------------
    // Reemplaza el polling que hacía _esperarRespuestasDeAmbos() cada 400ms
    // contra versus_answers. Cada INSERT llega por Realtime, se guarda en
    // state.answersBuffer (por si llega antes de que alguien la esté
    // esperando) y, si hay un listener activo para esa pregunta, se
    // notifica de inmediato.
    //
    // ⚠️ Requiere que Realtime esté habilitado sobre la tabla en Supabase:
    //   ALTER PUBLICATION supabase_realtime ADD TABLE versus_answers;
    // (según el relevamiento técnico, hoy NO está habilitado — es el
    // primer punto a verificar si esto no dispara nada en producción).
    function _suscribirseARespuestas(roomId) {
        if (state.answersChannel) return; // ya suscripto (evita duplicar canal)

        const channel = sb()
            .channel(`answers_${roomId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "versus_answers", filter: `room_id=eq.${roomId}` },
                ({ new: row }) => _procesarRespuestaEntrante(row)
            )
            .subscribe();

        state.answersChannel = channel;
    }

    function _procesarRespuestaEntrante(row) {
        if (!row || row.room_id !== state.roomId) return;

        // Normalizamos snake_case (columnas de la DB) a camelCase, que es
        // lo que ya consume el resto del código (respuestas.host?.isCorrect, etc).
        const normalizada = {
            username: row.username,
            isCorrect: row.is_correct,
            responseTimeMs: row.response_time_ms,
            questionId: row.question_id,
        };

        const hostUsername = state.isHost ? state.username : state.rivalUsername;
        const guestUsername = state.isHost ? state.rivalUsername : state.username;

        const buffer = state.answersBuffer[row.question_id] || { host: null, guest: null };
        if (normalizada.username === hostUsername) buffer.host = normalizada;
        if (normalizada.username === guestUsername) buffer.guest = normalizada;
        state.answersBuffer[row.question_id] = buffer;

        const listener = state.answersListeners[row.question_id];
        if (listener) listener();
    }

    // Cierra y limpia el canal de respuestas. Se llama al salir de la sala
    // y al finalizar el duelo (ver salirDeSala() y finalizarDuelo()).
    function _cerrarCanalDeRespuestas() {
        if (state.answersChannel) {
            sb().removeChannel(state.answersChannel);
            state.answersChannel = null;
        }
        state.answersBuffer = {};
        state.answersListeners = {};
    }

    // ------------------------------------------------------------
    // 5. Timeout de gracia si el Host se desconecta
    // ------------------------------------------------------------
    function _iniciarGraciaPorDesconexion() {
        if (state.graceTimer) return; // ya está corriendo
        state.graceTimer = setTimeout(async () => {
            state.graceTimer = null;
            await declararVictoriaPorAbandono("abandono_host");
        }, 10000); // 10s de gracia, según lo definido en el plan
    }

    function cancelarGraciaPorDesconexion() {
        if (state.graceTimer) {
            clearTimeout(state.graceTimer);
            state.graceTimer = null;
        }
    }

    // ------------------------------------------------------------
    // 6. Emitir el siguiente estado del duelo (SOLO el Host)
    // ------------------------------------------------------------
    async function emitirEstado(payload) {
        if (!state.isHost) {
            console.warn("[duelosManager] Solo el Host puede emitir el estado del duelo.");
            return;
        }
        await state.channel.send({ type: "broadcast", event: "duelo_estado", payload });
    }

    // ------------------------------------------------------------
    // 6b. Reacciones rápidas (🔥😤💀👏) — cualquiera de los dos las emite
    // ------------------------------------------------------------
    async function emitirReaccion(emoji) {
        if (!state.channel) return;
        await state.channel.send({
            type: "broadcast",
            event: "reaccion",
            payload: { emoji, username: state.username },
        });
    }

    function _suscribirseAReacciones(channel) {
        channel.on("broadcast", { event: "reaccion" }, ({ payload }) => {
            if (state.onReaction) state.onReaction(payload);
        });
    }

    // ------------------------------------------------------------
    // 6c-bis. Indicador de progreso del rival ("ya respondió esta pregunta")
    // ------------------------------------------------------------
    // Como el loop de preguntas está sincronizado por el Host (ambos ven
    // la MISMA pregunta al mismo tiempo), lo que genera presión competitiva
    // en tiempo real no es "en qué número va" (siempre es el mismo para
    // los dos) sino QUIÉN de los dos ya contestó primero. Este broadcast
    // avisa al rival apenas el jugador local elige una opción, para poder
    // mostrar un indicador tipo "⚡ Tu rival ya respondió" mientras el
    // jugador sigue pensando.
    async function emitirRespuestaParcial() {
        if (!state.channel) return;
        await state.channel.send({
            type: "broadcast",
            event: "jugador_respondio",
            payload: { username: state.username },
        });
    }

    function _suscribirseARespuestaParcial(channel) {
        channel.on("broadcast", { event: "jugador_respondio" }, ({ payload }) => {
            if (state.onRivalAnswered) state.onRivalAnswered(payload);
        });
    }

    // ------------------------------------------------------------
    // 6c-ter. Chat rápido del duelo
    // ------------------------------------------------------------
    async function emitirMensajeChat(texto) {
        if (!state.channel || !texto) return;
        await state.channel.send({
            type: "broadcast",
            event: "chat_msg",
            payload: { username: state.username, texto: String(texto).slice(0, 140), enviadoAt: Date.now() },
        });
    }

    function _suscribirseAChat(channel) {
        channel.on("broadcast", { event: "chat_msg" }, ({ payload }) => {
            if (state.onChatMessage) state.onChatMessage(payload);
        });
    }

    // ------------------------------------------------------------
    // 6c. Loop de preguntas (SOLO el Host orquesta el avance)
    // ------------------------------------------------------------
    // preguntas: array de { id, pregunta, opciones:[{id, texto, correcta}] }
    // tiempoPorPregunta: segundos por pregunta
    // modo: 'normal' | 'muerte_subita'
    async function iniciarLoopPreguntas(preguntas, { tiempoPorPregunta = 20, modo = "normal" } = {}) {
        if (!state.isHost) {
            console.warn("[duelosManager] Solo el Host puede iniciar el loop de preguntas.");
            return;
        }

        await sb().from("versus_rooms").update({ question_ids: preguntas.map((p) => p.id) }).eq("id", state.roomId);

        const respuestasHost = {};
        const respuestasGuest = {};
        let hostScore = 0;
        let guestScore = 0;

        for (let i = 0; i < preguntas.length; i++) {
            const pregunta = preguntas[i];
            const startedAt = Date.now();

            await emitirEstado({
                tipo: "pregunta",
                index: i,
                total: preguntas.length,
                questionId: pregunta.id,
                pregunta: pregunta.pregunta,
                opciones: pregunta.opciones,
                startedAt,
                tiempoLimite: tiempoPorPregunta,
                modo,
            });

            const respuestas = await _esperarRespuestasDeAmbos(pregunta.id, tiempoPorPregunta);

            if (respuestas.host?.isCorrect) hostScore++;
            if (respuestas.guest?.isCorrect) guestScore++;

            await emitirEstado({
                tipo: "resultado_pregunta",
                index: i,
                questionId: pregunta.id,
                correctOptionId: pregunta.opciones.find((o) => o.correcta)?.id,
                hostScore,
                guestScore,
            });

            // Modo Muerte Súbita: corta apenas alguien falla
            if (modo === "muerte_subita") {
                const hostFallo = respuestas.host && !respuestas.host.isCorrect;
                const guestFallo = respuestas.guest && !respuestas.guest.isCorrect;
                if (hostFallo || guestFallo) break;
            }

            await _esperar(800); // pausa breve (0.8s) para que se vea el color de acierto/error antes de la siguiente
        }

        await _finalizarPorPuntaje(hostScore, guestScore, preguntas.length, modo);
    }

    // Espera hasta 'segundos' a que ambos jugadores respondan una pregunta
    // específica. Antes hacía polling cada 400ms contra versus_answers;
    // ahora escucha el buffer que llena _procesarRespuestaEntrante() por
    // Postgres Changes (sin más queries que las estrictamente necesarias).
    // Si alguna respuesta ya había llegado antes de que se llamara a esta
    // función (carrera normal entre Realtime y el loop), se toma del buffer.
    function _esperarRespuestasDeAmbos(questionId, segundos) {
        return new Promise((resolve) => {
            const hostUsername = state.isHost ? state.username : state.rivalUsername;
            const guestUsername = state.isHost ? state.rivalUsername : state.username;

            const yaLlegadas = state.answersBuffer[questionId] || { host: null, guest: null };
            const resultado = { host: yaLlegadas.host, guest: yaLlegadas.guest };

            let resuelto = false;
            let timeoutId = null;

            const finalizar = () => {
                if (resuelto) return;
                resuelto = true;
                clearTimeout(timeoutId);
                delete state.answersListeners[questionId];
                resolve(resultado);
            };

            if (resultado.host && resultado.guest) {
                finalizar();
                return;
            }

            state.answersListeners[questionId] = () => {
                const buf = state.answersBuffer[questionId] || {};
                if (buf.host && buf.host.username === hostUsername) resultado.host = buf.host;
                if (buf.guest && buf.guest.username === guestUsername) resultado.guest = buf.guest;
                if (resultado.host && resultado.guest) finalizar();
            };

            // Salvaguarda: si Realtime no está habilitado en la tabla, o si
            // uno de los dos nunca contesta, igual se corta a los N segundos
            // (mismo comportamiento que tenía el polling por timeout).
            timeoutId = setTimeout(finalizar, segundos * 1000);
        });
    }

    function _esperar(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function _finalizarPorPuntaje(hostScore, guestScore, totalPreguntas, modo) {
        const { data: room } = await sb().from("versus_rooms").select("*").eq("id", state.roomId).single();
        if (!room) return;

        let winner;
        let winReason;

        if (hostScore === guestScore) {
            // Tie-break automático por velocidad: gana quien acumuló menor tiempo de respuesta total
            const { data: answers } = await sb()
                .from("versus_answers")
                .select("username, response_time_ms")
                .eq("room_id", state.roomId);

            const tiempos = {};
            (answers || []).forEach((a) => {
                tiempos[a.username] = (tiempos[a.username] || 0) + (a.response_time_ms || 0);
            });

            winner = (tiempos[room.host_username] || Infinity) <= (tiempos[room.guest_username] || Infinity)
                ? room.host_username
                : room.guest_username;
            winReason = "tie_break";
        } else {
            winner = hostScore > guestScore ? room.host_username : room.guest_username;
            winReason = modo === "muerte_subita" ? "muerte_subita" : "respuestas";
        }

        await finalizarDuelo({ winnerUsername: winner, winReason, hostScore, guestScore });

        await emitirEstado({
            tipo: "fin_duelo",
            winnerUsername: winner,
            winReason,
            hostScore,
            guestScore,
            rivalUsername: state.isHost ? room.guest_username : room.host_username,
        });
    }

    // ------------------------------------------------------------
    // 7. Registrar respuesta de un jugador
    // ------------------------------------------------------------
    async function registrarRespuesta({ questionIndex, questionId, selectedOption, isCorrect, responseTimeMs }) {
        await sb().from("versus_answers").insert({
            room_id: state.roomId,
            username: state.username,
            question_index: questionIndex,
            question_id: questionId,
            selected_option: selectedOption,
            is_correct: isCorrect,
            response_time_ms: responseTimeMs,
        });
    }

    // ------------------------------------------------------------
    // 8. Finalizar duelo (calcula ELO, historial, medallas)
    // ------------------------------------------------------------
    async function finalizarDuelo({ winnerUsername, winReason, hostScore, guestScore }) {
        const { data: room } = await sb().from("versus_rooms").select("*").eq("id", state.roomId).single();
        if (!room) return;

        await sb()
            .from("versus_rooms")
            .update({
                status: "finished",
                winner_username: winnerUsername,
                win_reason: winReason,
                host_score: hostScore,
                guest_score: guestScore,
                finished_at: new Date().toISOString(),
            })
            .eq("id", state.roomId);

        const { eloChangeHost, eloChangeGuest } = await _actualizarElo(room.host_username, room.guest_username, winnerUsername);

        await sb().from("versus_history").insert({
            room_id: state.roomId,
            player_a: room.host_username,
            player_b: room.guest_username,
            score_a: hostScore,
            score_b: guestScore,
            winner_username: winnerUsername,
            win_reason: winReason,
            elo_change_a: eloChangeHost,
            elo_change_b: eloChangeGuest,
            tema: room.tema,
        });

        await _evaluarMedallas(room, { winnerUsername, hostScore, guestScore });

        // El duelo terminó: ya no hace falta seguir escuchando versus_answers de esta sala.
        _cerrarCanalDeRespuestas();
    }

    // ------------------------------------------------------------
    // 9. Abandono (desconexión de Host o Guest)
    // ------------------------------------------------------------
    async function declararVictoriaPorAbandono(motivo) {
        const { data: room } = await sb().from("versus_rooms").select("*").eq("id", state.roomId).single();
        if (!room || room.status === "finished") return;

        const winner = motivo === "abandono_host" ? room.guest_username : room.host_username;
        await finalizarDuelo({
            winnerUsername: winner,
            winReason: motivo,
            hostScore: room.host_score,
            guestScore: room.guest_score,
        });

        if (state.onOpponentLeft) state.onOpponentLeft(motivo);
    }

    // ------------------------------------------------------------
    // 10. Cálculo de ELO (fórmula estándar, K=32)
    // ------------------------------------------------------------
    async function _actualizarElo(hostUsername, guestUsername, winnerUsername) {
        const K = 32;
        const { data: players } = await sb()
            .from("versus_players")
            .select("username, elo, wins, losses, win_streak, best_streak")
            .in("username", [hostUsername, guestUsername]);

        const host = players.find((p) => p.username === hostUsername);
        const guest = players.find((p) => p.username === guestUsername);
        if (!host || !guest) return { eloChangeHost: 0, eloChangeGuest: 0 };

        const expectedHost = 1 / (1 + Math.pow(10, (guest.elo - host.elo) / 400));
        const expectedGuest = 1 - expectedHost;

        const scoreHost = winnerUsername === hostUsername ? 1 : winnerUsername === guestUsername ? 0 : 0.5;
        const scoreGuest = 1 - scoreHost;

        const newEloHost = Math.round(host.elo + K * (scoreHost - expectedHost));
        const newEloGuest = Math.round(guest.elo + K * (scoreGuest - expectedGuest));

        const hostWon = winnerUsername === hostUsername;
        const guestWon = winnerUsername === guestUsername;

        await sb()
            .from("versus_players")
            .update({
                elo: newEloHost,
                wins: host.wins + (hostWon ? 1 : 0),
                losses: host.losses + (hostWon ? 0 : 1),
                win_streak: hostWon ? host.win_streak + 1 : 0,
                best_streak: hostWon ? Math.max(host.best_streak, host.win_streak + 1) : host.best_streak,
                rango: _calcularRango(newEloHost),
            })
            .eq("username", hostUsername);

        await sb()
            .from("versus_players")
            .update({
                elo: newEloGuest,
                wins: guest.wins + (guestWon ? 1 : 0),
                losses: guest.losses + (guestWon ? 0 : 1),
                win_streak: guestWon ? guest.win_streak + 1 : 0,
                best_streak: guestWon ? Math.max(guest.best_streak, guest.win_streak + 1) : guest.best_streak,
                rango: _calcularRango(newEloGuest),
            })
            .eq("username", guestUsername);

        return { eloChangeHost: newEloHost - host.elo, eloChangeGuest: newEloGuest - guest.elo };
    }

    function _calcularRango(elo) {
        if (elo >= 1800) return "Leyenda";
        if (elo >= 1500) return "Diamante";
        if (elo >= 1200) return "Oro";
        if (elo >= 1000) return "Plata";
        return "Bronce";
    }

    // ------------------------------------------------------------
    // 11. Medallas por hazañas
    // ------------------------------------------------------------
    async function _evaluarMedallas(room, { winnerUsername, hostScore, guestScore }) {
        const badges = [];

        const { data: winnerPlayer } = await sb()
            .from("versus_players")
            .select("win_streak")
            .eq("username", winnerUsername)
            .maybeSingle();

        if (winnerPlayer?.win_streak > 0 && winnerPlayer.win_streak % 5 === 0) {
            badges.push({ username: winnerUsername, badge_code: "racha_5", room_id: room.id });
        }

        const winnerScore = winnerUsername === room.host_username ? hostScore : guestScore;
        const totalPreguntas = Array.isArray(room.question_ids) ? room.question_ids.length : null;
        if (totalPreguntas && winnerScore === totalPreguntas) {
            badges.push({ username: winnerUsername, badge_code: "perfecto", room_id: room.id });
        }

        if (badges.length > 0) {
            await sb().from("versus_badges").insert(badges);
        }
    }

    // ------------------------------------------------------------
    // 12. Salir / limpiar sala
    // ------------------------------------------------------------
    async function salirDeSala() {
        cancelarGraciaPorDesconexion();
        if (state.channel) {
            await state.channel.untrack();
            sb().removeChannel(state.channel);
        }
        _cerrarCanalDeRespuestas();
        state = { ...state, roomId: null, roomCode: null, channel: null };
    }

    // ==============================================================
    // MODO DUELO vs IA — 100% local, sin red ni impacto en ELO/stats
    // ==============================================================
    // (DIFICULTADES_IA, aiTimers y aiRespuestaPendiente ya están
    // declarados arriba, al principio del módulo — ver §"Configuración
    // de dificultad del Modo IA". No se redeclaran acá porque `const`/`let`
    // duplicados en el mismo scope del IIFE producían un SyntaxError que
    // impedía parsear TODO este archivo, dejando `window.DuelosManager`
    // sin definir. Ese era el bug real detrás de "las tarjetas de
    // dificultad no hacen nada" y "Volver no funciona": ambas acciones
    // dependen de window.DuelosManager, que nunca llegaba a existir.)

    // Arranca una partida de práctica contra la IA. 'preguntas' viene
    // ya armado por versus.html (mismo banco que el modo online).
    async function iniciarDueloVsIA(preguntas, dificultadKey) {
        _limpiarTimersIA();

        const dificultad = DIFICULTADES_IA[dificultadKey] || DIFICULTADES_IA.normal;
        const username = window.NikaSupabase.getNikaCurrentUsername();

        state.isAI = true;
        state.isHost = true; // conceptualmente el jugador siempre es 'host' de su práctica
        state.username = username;
        state.rivalUsername = "IA";
        state.roomId = null;
        state.roomCode = null;

        let myScore = 0;
        let aiScore = 0;
        const tiempoPorPregunta = 20;

        for (let i = 0; i < preguntas.length; i++) {
            if (!state.isAI) return; // se canceló la partida (usuario salió)

            const pregunta = preguntas[i];
            const startedAt = Date.now();

            if (state.onStateChange) {
                state.onStateChange({
                    tipo: "pregunta",
                    index: i,
                    total: preguntas.length,
                    questionId: pregunta.id,
                    pregunta: pregunta.pregunta,
                    opciones: pregunta.opciones,
                    startedAt,
                    tiempoLimite: tiempoPorPregunta,
                    modo: "practica_ia",
                });
            }

            const resultadoPregunta = await _resolverPreguntaVsIA(pregunta, dificultad, tiempoPorPregunta);
            if (!resultadoPregunta) return; // cancelado

            if (resultadoPregunta.jugadorCorrecto) myScore++;
            if (resultadoPregunta.iaCorrecta) aiScore++;

            if (state.onStateChange) {
                state.onStateChange({
                    tipo: "resultado_pregunta",
                    index: i,
                    questionId: pregunta.id,
                    correctOptionId: pregunta.opciones.find((o) => o.correcta)?.id,
                    hostScore: myScore,
                    guestScore: aiScore,
                });
            }

            const sigue = await _esperarCancelableIA(800); // pausa breve (0.8s) para ver el color antes de avanzar
            if (!sigue) return;
        }

        if (!state.isAI) return;
        const ganeYo = myScore >= aiScore; // empate se lo lleva el jugador en modo práctica
        if (state.onStateChange) {
            state.onStateChange({
                tipo: "fin_duelo",
                winnerUsername: ganeYo ? username : "IA",
                winReason: "practica_ia",
                hostScore: myScore,
                guestScore: aiScore,
                rivalUsername: "IA",
                practice: true, // ⚠️ NO toca ELO ni versus_players — es solo testing/entrenamiento
            });
        }
    }

    // Espera en simultáneo: la respuesta del jugador (vía responderPreguntaVsIA),
    // la respuesta simulada de la IA, y el límite de tiempo de la pregunta.
    // Devuelve null si la partida fue cancelada.
    function _resolverPreguntaVsIA(pregunta, dificultad, tiempoLimiteSeg) {
        return new Promise((resolve) => {
            let jugadorRespondio = false;
            let iaRespondio = false;
            let jugadorCorrecto = false;
            let iaCorrecta = false;
            let resuelto = false;

            const finalizarSiCorresponde = () => {
                if (resuelto) return;
                if (jugadorRespondio && iaRespondio) {
                    resuelto = true;
                    resolve({ jugadorCorrecto, iaCorrecta });
                }
            };

            aiRespuestaPendiente = (opcionElegida) => {
                jugadorRespondio = true;
                jugadorCorrecto = !!opcionElegida?.correcta;
                finalizarSiCorresponde();
            };

            const delayIA = dificultad.delayMin + Math.random() * (dificultad.delayMax - dificultad.delayMin);
            const timerIA = setTimeout(() => {
                iaRespondio = true;
                iaCorrecta = Math.random() < dificultad.aciertoProb;
                if (state.onStateChange) state.onStateChange({ tipo: "ia_respondio", iaCorrecta });
                finalizarSiCorresponde();
            }, delayIA);
            aiTimers.push(timerIA);

            const timerLimite = setTimeout(() => {
                if (!jugadorRespondio) { jugadorRespondio = true; jugadorCorrecto = false; }
                if (!iaRespondio) { iaRespondio = true; iaCorrecta = Math.random() < dificultad.aciertoProb; }
                finalizarSiCorresponde();
            }, tiempoLimiteSeg * 1000 + 200);
            aiTimers.push(timerLimite);

            // Permite cancelar esta promesa puntual desde _limpiarTimersIA
            aiTimers.push({
                __cancelResolve: () => {
                    if (resuelto) return;
                    resuelto = true;
                    resolve(null);
                },
            });
        });
    }

    // Llamado desde versus.html cuando el jugador elige una opción en modo IA
    function responderPreguntaVsIA(opcion) {
        if (aiRespuestaPendiente) {
            const resolver = aiRespuestaPendiente;
            aiRespuestaPendiente = null;
            resolver(opcion);
        }
    }

    function _esperarCancelableIA(ms) {
        return new Promise((resolve) => {
            const t = setTimeout(() => resolve(true), ms);
            aiTimers.push(t);
            aiTimers.push({ __cancelResolve: () => resolve(false) });
        });
    }

    // Limpia TODOS los timers/promesas pendientes del duelo IA.
    // Se llama al iniciar una partida nueva y al salir antes de tiempo.
    function _limpiarTimersIA() {
        aiTimers.forEach((t) => {
            if (t && typeof t === "object" && t.__cancelResolve) {
                t.__cancelResolve();
            } else {
                clearTimeout(t);
            }
        });
        aiTimers = [];
        aiRespuestaPendiente = null;
    }

    function cancelarDueloIA() {
        _limpiarTimersIA();
        state.isAI = false;
        state.rivalUsername = null;
    }

    return {
        crearSala,
        unirseASalaPorCodigo,
        unirseAQuickMatch,
        salirDeQuickMatch,
        emitirEstado,
        emitirReaccion,
        emitirRespuestaParcial,
        emitirMensajeChat,
        iniciarLoopPreguntas,
        iniciarDueloVsIA,
        responderPreguntaVsIA,
        cancelarDueloIA,
        DIFICULTADES_IA,
        registrarRespuesta,
        finalizarDuelo,
        declararVictoriaPorAbandono,
        salirDeSala,
        barajarIndependiente,
        cancelarGraciaPorDesconexion,
        get state() {
            return { ...state };
        },
        set onStateChange(cb) {
            state.onStateChange = cb;
        },
        set onOpponentLeft(cb) {
            state.onOpponentLeft = cb;
        },
        set onReaction(cb) {
            state.onReaction = cb;
        },
        set onRivalAnswered(cb) {
            state.onRivalAnswered = cb;
        },
        set onChatMessage(cb) {
            state.onChatMessage = cb;
        },
    };
})();

window.DuelosManager = DuelosManager;
