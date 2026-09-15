/**
 * ============================================================
 * CAMPUS NIKA — Fase 7: Modo Versus 1vs1
 * notificacionesManager.js
 * ------------------------------------------------------------
 * Responsabilidad: canal Realtime personal de cada usuario
 * para recibir desafíos directos de amigos y mostrar el toast
 * flotante de "Aceptar / Rechazar".
 *
 * Depende de: window.NikaSupabase (supabaseClient.js)
 * ============================================================
 */

const NotificacionesManager = (function () {
    const sb = () => window.NikaSupabase.client;

    let personalChannel = null;
    let onChallengeReceived = null; // callback que dibuja el toast en versus.html / index.html

    // ------------------------------------------------------------
    // 1. Suscribirse al canal personal (uno por username)
    // ------------------------------------------------------------
    async function iniciar() {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) {
            console.warn("[notificacionesManager] No hay usuario logueado, no se inicia el canal.");
            return;
        }

        personalChannel = sb().channel(`versus_notif_${username}`);

        personalChannel.on("broadcast", { event: "nuevo_desafio" }, ({ payload }) => {
            if (onChallengeReceived) onChallengeReceived(payload);
        });

        await personalChannel.subscribe();

        // También reviso desafíos pendientes que hayan llegado mientras estaba offline
        await _revisarDesafiosPendientes(username);
    }

    async function _revisarDesafiosPendientes(username) {
        const { data: pendientes } = await sb()
            .from("versus_challenges")
            .select("*")
            .eq("to_username", username)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString());

        if (pendientes && pendientes.length > 0 && onChallengeReceived) {
            pendientes.forEach((desafio) => onChallengeReceived(desafio));
        }
    }

    // ------------------------------------------------------------
    // 2. Enviar un desafío directo a un amigo
    // ------------------------------------------------------------
    async function enviarDesafio({ toUsername, tema = null }) {
        const fromUsername = window.NikaSupabase.getNikaCurrentUsername();
        if (!fromUsername) throw new Error("No hay usuario logueado.");

        // Crea la sala primero (el que desafía es el Host)
        const sala = await window.DuelosManager.crearSala({ tema, roomType: "friend_challenge" });

        const { data: desafio, error } = await sb()
            .from("versus_challenges")
            .insert({
                from_username: fromUsername,
                to_username: toUsername,
                room_id: sala.id,
                tema,
            })
            .select()
            .single();

        if (error) throw error;

        // Notificación en tiempo real al canal personal del destinatario
        await sb()
            .channel(`versus_notif_${toUsername}`)
            .send({ type: "broadcast", event: "nuevo_desafio", payload: desafio });

        return desafio;
    }

    // ------------------------------------------------------------
    // 3. Aceptar / Rechazar desafío
    // ------------------------------------------------------------
    async function aceptarDesafio(desafioId) {
        const { data: desafio, error } = await sb()
            .from("versus_challenges")
            .update({ status: "accepted" })
            .eq("id", desafioId)
            .eq("status", "pending")
            .select()
            .single();

        if (error) throw error;

        // Une al invitado a la sala ya creada por el Host
        const roomCode = await _obtenerCodigoSala(desafio.room_id);
        return window.DuelosManager.unirseASalaPorCodigo(roomCode);
    }

    async function rechazarDesafio(desafioId) {
        await sb().from("versus_challenges").update({ status: "rejected" }).eq("id", desafioId).eq("status", "pending");
    }

    async function _obtenerCodigoSala(roomId) {
        const { data } = await sb().from("versus_rooms").select("room_code").eq("id", roomId).single();
        return data?.room_code;
    }

    // ------------------------------------------------------------
    // 4. Cerrar canal (al salir de la app)
    // ------------------------------------------------------------
    function detener() {
        if (personalChannel) {
            sb().removeChannel(personalChannel);
            personalChannel = null;
        }
    }

    return {
        iniciar,
        detener,
        enviarDesafio,
        aceptarDesafio,
        rechazarDesafio,
        set onChallengeReceived(cb) {
            onChallengeReceived = cb;
        },
    };
})();

window.NotificacionesManager = NotificacionesManager;
