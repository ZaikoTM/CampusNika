/**
 * ============================================================
 * CAMPUS NIKA — Fase 7: Modo Versus 1vs1
 * supabaseClient.js
 * ------------------------------------------------------------
 * Responsabilidad ÚNICA: inicializar el cliente de Supabase
 * y exponerlo al resto de la app (duelosManager.js,
 * notificacionesManager.js, versus.html).
 *
 * Este archivo NO contiene lógica de negocio (salas, ELO,
 * matchmaking, notificaciones). Eso vive en los managers.
 * ============================================================
 */

// ------------------------------------------------------------
// 1. Credenciales del proyecto Supabase
// ------------------------------------------------------------
// TODO: reemplazar por las credenciales reales del proyecto.
// La anon key es pública por diseño (protegida por RLS en la DB),
// así que es seguro tenerla en el frontend.
const SUPABASE_URL = "https://pswjmouuyaxueaqqglko.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DPSe7yJoTpBCFFKZdKI9pg_v40eqnvr";

// ------------------------------------------------------------
// 2. Carga del SDK de Supabase (CDN, sin bundler)
// ------------------------------------------------------------
// Se asume que en el <head> de versus.html se incluye:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// lo que expone la variable global `supabase`.

if (typeof window.supabase === "undefined") {
    console.error(
        "[supabaseClient] El SDK de Supabase no está cargado. " +
        "Asegurate de incluir <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> " +
        "ANTES de este archivo en versus.html."
    );
}

// ------------------------------------------------------------
// 3. Cliente único (singleton) reutilizado por toda la app
// ------------------------------------------------------------
const nikaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            eventsPerSecond: 10, // límite razonable para un duelo 1vs1
        },
    },
});

// ------------------------------------------------------------
// 4. Identidad del jugador actual
// ------------------------------------------------------------
// Campus Nika usa localStorage (nika_currentUser) en vez de
// Supabase Auth. Esta función es el puente entre ambos mundos:
// da el username que se usa como clave en todas las tablas
// versus_*.
function getNikaCurrentUsername() {
    try {
        const raw = localStorage.getItem("nika_currentUser");
        if (!raw) return null;
        const user = JSON.parse(raw);
        return user?.username || null;
    } catch (err) {
        console.error("[supabaseClient] Error leyendo nika_currentUser:", err);
        return null;
    }
}

// ------------------------------------------------------------
// 5. Asegura que el jugador exista en versus_players
// ------------------------------------------------------------
// Se llama al entrar a versus.html. Si el username ya existe,
// no pisa su ELO/racha (upsert con ignoreDuplicates en columnas
// que no sean la PK no es directo en Supabase, así que hacemos
// un select previo).
async function ensureVersusPlayer() {
    const username = getNikaCurrentUsername();
    if (!username) {
        console.warn("[supabaseClient] No hay usuario logueado (nika_currentUser vacío).");
        return null;
    }

    const { data: existing, error: selectError } = await nikaSupabase
        .from("versus_players")
        .select("username")
        .eq("username", username)
        .maybeSingle();

    if (selectError) {
        console.error("[supabaseClient] Error verificando jugador:", selectError);
        return null;
    }

    if (existing) return username;

    // Traemos fullname/avatar desde localStorage para no pedirlos de nuevo
    let fullname = username;
    let avatar = null;
    try {
        const userLocal = JSON.parse(localStorage.getItem("nika_currentUser"));
        fullname = userLocal?.fullname || username;
        avatar = userLocal?.avatar || null;
    } catch (_) {
        /* usa defaults */
    }

    const { error: insertError } = await nikaSupabase
        .from("versus_players")
        .insert({ username, fullname, avatar });

    if (insertError) {
        console.error("[supabaseClient] Error creando jugador en versus_players:", insertError);
        return null;
    }

    return username;
}

// ------------------------------------------------------------
// 6. Export global (sin módulos ES, coherente con el resto del proyecto)
// ------------------------------------------------------------
window.NikaSupabase = {
    client: nikaSupabase,
    getNikaCurrentUsername,
    ensureVersusPlayer,
};
