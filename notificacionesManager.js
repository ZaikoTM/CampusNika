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
    // 'tema' es un texto corto que describe el duelo (materia · área · preguntas · tiempo): lo ve el amigo en la invitación.
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

        // 1) Aviso en tiempo real al canal personal del destinatario (si está en la Arena)
        try {
            const canal = sb().channel(`versus_notif_${toUsername}`);
            await new Promise((ok) => { const t = setTimeout(ok, 2500); canal.subscribe((st) => { if (st === "SUBSCRIBED") { clearTimeout(t); ok(); } }); });
            await canal.send({ type: "broadcast", event: "nuevo_desafio", payload: desafio });
            setTimeout(() => { try { sb().removeChannel(canal); } catch (_) {} }, 1500);
        } catch (e) { console.warn("[notificacionesManager] aviso en vivo:", e && e.message); }

        // 2) Mensaje en el chat privado, con la tarjeta Aceptar / Rechazar (llega aunque esté en otra sección del campus)
        try {
            if (window.ChatManager && typeof window.ChatManager.enviarMensaje === "function") {
                const detalle = tema ? " (" + tema + ")" : "";
                await window.ChatManager.enviarMensaje(toUsername, "⚔️ @" + fromUsername + " te desafió a un duelo 1vs1 en la Arena Nika" + detalle + ". [[desafio:" + desafio.id + "]]");
            }
        } catch (e) { console.warn("[notificacionesManager] mensaje de chat del desafío:", e && e.message); }

        return desafio;
    }

    // Estado actual de un desafío enviado: 'pending' | 'accepted' | 'rejected' | 'expired'
    async function estadoDesafio(desafioId) {
        const { data } = await sb().from("versus_challenges").select("status, expires_at").eq("id", desafioId).maybeSingle();
        if (!data) return "expired";
        if (data.status === "pending" && data.expires_at && new Date(data.expires_at) <= new Date()) return "expired";
        return data.status;
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
            .maybeSingle();

        if (error) throw error;
        if (!desafio) throw new Error("Este desafío ya no está disponible (venció o ya fue respondido).");

        // Une al invitado a la sala ya creada por el Host. Las salas de desafío directo
        // NO tienen room_code (es null), así que se entra por id: buscarla por código
        // devolvía siempre "sala no encontrada / llena".
        return window.DuelosManager.unirseASalaPorId(desafio.room_id);
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
        estadoDesafio,
        aceptarDesafio,
        rechazarDesafio,
        set onChallengeReceived(cb) {
            onChallengeReceived = cb;
        },
    };
})();

window.NotificacionesManager = NotificacionesManager;
