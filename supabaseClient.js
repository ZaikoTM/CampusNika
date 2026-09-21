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
// Se asume que en el <head> de campus.html se incluye, ANTES que este
// archivo:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// lo que expone la variable global `supabase`.
//
// En vez de asumir que window.supabase YA está disponible en el instante
// exacto en que este script corre (lo que rompe todo con
// "Cannot read properties of undefined (reading 'createClient')" ante
// cualquier hipo de red, caché de Service Worker sirviendo una versión
// vieja, o un simple reordenamiento accidental de los <script>), esperamos
// activamente a que aparezca, con un timeout razonable.
function _esperarSDKSupabase(maxEsperaMs = 5000, intervaloMs = 50) {
    return new Promise((resolve, reject) => {
        if (window.supabase && typeof window.supabase.createClient === "function") {
            resolve(window.supabase);
            return;
        }
        const inicio = Date.now();
        const intervalId = setInterval(() => {
            if (window.supabase && typeof window.supabase.createClient === "function") {
                clearInterval(intervalId);
                resolve(window.supabase);
            } else if (Date.now() - inicio > maxEsperaMs) {
                clearInterval(intervalId);
                reject(new Error(
                    "[supabaseClient] Timeout esperando el SDK de Supabase (window.supabase). " +
                    "Revisá que <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> " +
                    "esté ANTES de supabaseClient.js en el <head>, que no haya un Service Worker sirviendo " +
                    "una versión vieja cacheada, y que el CDN no esté bloqueado (ad-blocker / sin conexión)."
                ));
            }
        }, intervaloMs);
    });
}

// ------------------------------------------------------------
// 3. Cliente único (singleton) reutilizado por toda la app
// ------------------------------------------------------------
// nikaSupabase arranca en null y se completa recién cuando el SDK
// confirma que está listo. Todas las funciones de este archivo lo leen
// en el momento en que se LLAMAN (no cuando se definen), así que en la
// práctica ya está listo para cuando el usuario interactúa con la app,
// siempre que el resto del código espere window.NikaSupabase.ready
// (ver auth-guard.js) antes de operar.
let nikaSupabase = null;

const NikaSupabaseReady = _esperarSDKSupabase()
    .then((supabaseSDK) => {
        nikaSupabase = supabaseSDK.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            realtime: {
                params: {
                    eventsPerSecond: 10, // límite razonable para un duelo 1vs1
                },
            },
        });
        return nikaSupabase;
    })
    .catch((err) => {
        console.error(err.message || err);
        throw err;
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
    await NikaSupabaseReady;
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
// 6. AUTENTICACIÓN REAL (Fase A.2 — reemplaza el login "casero"
//    basado 100% en localStorage que causaba el bug de "cuenta
//    no encontrada" al cambiar de dispositivo/navegador).
// ------------------------------------------------------------
// Campus Nika sigue permitiendo login por username O email, pero
// Supabase Auth solo entiende email. Por eso, si el usuario ingresa
// un username, lo resuelve el servidor (Edge Function "login-usuario"):
// el correo nunca llega al navegador.

// Registro: crea el usuario en Supabase Auth y dispara el trigger que
// crea automáticamente su fila en "profiles" (username, fullname, avatar).
async function registrarUsuario({ fullname, username, email, password, avatar }) {
    await NikaSupabaseReady;
    const usernameNorm = username.trim();
    const emailNorm = email.trim().toLowerCase();

    // Chequeo previo de username duplicado (case-insensitive).
    // Usa profiles_public (vista sin email) porque todavía no hay sesión.
    const { data: existente } = await nikaSupabase
        .from("profiles_public")
        .select("username")
        .ilike("username", usernameNorm)
        .maybeSingle();

    if (existente) {
        return { error: { message: "El usuario ya existe." } };
    }

    const { data, error } = await nikaSupabase.auth.signUp({
        email: emailNorm,
        password,
        options: {
            data: { fullname, username: usernameNorm, avatar: avatar || null },
        },
    });

    if (error) return { error };

    const perfil = await _cachearSesionLocal(data.user);
    return { data: perfil, error: null };
}

// Login: acepta email o username.
//  - Con email: login directo contra Supabase Auth (que aplica sus propios límites).
//  - Con username: lo resuelve el SERVIDOR (Edge Function "login-usuario"), que además
//    limita los intentos fallidos. El navegador nunca recibe el correo de nadie.
async function iniciarSesion({ identifier, password }) {
    await NikaSupabaseReady;
    const id = identifier.trim();

    if (id.includes("@")) {
        const { data, error } = await nikaSupabase.auth.signInWithPassword({ email: id.toLowerCase(), password });
        
        if (error) {
            console.log("Error completo de Supabase:", error);
            
            // CORRECCIÓN ROBUSTA: Evaluamos el mensaje y también el código de estado (status)
            const errMsg = error.message ? error.message.toLowerCase() : "";
            
            if (errMsg.includes("email not confirmed") || (error.status === 400 && errMsg.includes("invalid login"))) {
                return { error: { message: "Verificá tu correo electrónico para ingresar, o revisá que tus datos sean correctos." } };
            } else if (errMsg.includes("invalid login credentials")) {
                return { error: { message: "El correo o la contraseña son incorrectos." } };
            }
            
            return { error };
        }
        
        const perfilCacheado = await _cachearSesionLocal(data.user);
        return { data: perfilCacheado, error: null };
    }

    let respuesta;
    let cuerpo = {};
    try {
        respuesta = await fetch(`${SUPABASE_URL}/functions/v1/login-usuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ identificador: id, password }),
        });
        cuerpo = await respuesta.json().catch(() => ({}));
    } catch (err) {
        console.warn("[supabaseClient] No se pudo contactar login-usuario:", err);
        return { error: { message: "No hay conexión. Revisá tu internet e intentá de nuevo." } };
    }

    if (!respuesta.ok || !cuerpo.access_token || !cuerpo.refresh_token) {
        if (!cuerpo.error) console.warn("[supabaseClient] login-usuario respondió", respuesta.status, "(¿está desplegada y con 'Verify JWT' desactivado?)");
        
        const errorServidor = cuerpo.error ? cuerpo.error.toLowerCase() : "";
        if (errorServidor.includes("email not confirmed")) {
           return { error: { message: "Verificá tu correo electrónico para ingresar, o revisá que tus datos sean correctos." } };
        }

        return { error: { message: cuerpo.error || "No se pudo iniciar sesión. Probá con tu correo." } };
    }

    const { data: sesion, error: sessionError } = await nikaSupabase.auth.setSession({
        access_token: cuerpo.access_token,
        refresh_token: cuerpo.refresh_token,
    });
    if (sessionError || !sesion || !sesion.user) {
        return { error: sessionError || { message: "No se pudo iniciar sesión." } };
    }

    const perfilCacheado = await _cachearSesionLocal(sesion.user);
    return { data: perfilCacheado, error: null };
}

async function cerrarSesion() {
    await NikaSupabaseReady;
    await nikaSupabase.auth.signOut();
    localStorage.removeItem("nika_currentUser");
}

// ------------------------------------------------------------
// 6.1 RECUPERACIÓN DE CONTRASEÑA (Fase A.2)
// ------------------------------------------------------------
async function solicitarResetPassword(email) {
    await NikaSupabaseReady;
    const { error } = await nikaSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) return { error };
    return { data: true, error: null };
}

function onPasswordRecovery(callback) {
    NikaSupabaseReady.then(() => {
        nikaSupabase.auth.onAuthStateChange((event, _session) => {
            if (event === "PASSWORD_RECOVERY") callback();
        });
    }).catch(() => {});
}

async function actualizarPassword(newPassword) {
    await NikaSupabaseReady;
    const { data, error } = await nikaSupabase.auth.updateUser({ password: newPassword });
    if (error) return { error };

    const perfilCacheado = await _cachearSesionLocal(data.user);
    return { data: perfilCacheado, error: null };
}

async function solicitarRolAdmin(masterPassword) {
    await NikaSupabaseReady;
    const { data: { session } } = await nikaSupabase.auth.getSession();
    if (!session) {
        return { error: { message: "Iniciá sesión primero." } };
    }

    const { data, error } = await nikaSupabase.functions.invoke("verify-admin", {
        body: { masterPassword },
    });

    if (error) return { error };

    await _cachearSesionLocal(session.user);
    return { data, error: null };
}

async function restaurarSesionSiExiste() {
    await NikaSupabaseReady;
    const { data: { session } } = await nikaSupabase.auth.getSession();
    if (!session) return null;
    return _cachearSesionLocal(session.user);
}

async function _cachearSesionLocal(authUser) {
    if (!authUser) return null;
    await NikaSupabaseReady;

    const { data: perfil, error } = await nikaSupabase
        .from("profiles")
        .select("username, fullname, avatar, role")
        .eq("id", authUser.id)
        .single();

    if (error || !perfil) {
        console.error("[supabaseClient] No se pudo leer el perfil tras autenticar:", error);
        return null;
    }

    const usuarioParaCache = {
        id: authUser.id,
        fullname: perfil.fullname,
        username: perfil.username,
        email: authUser.email,
        avatar: perfil.avatar,
        role: perfil.role,
    };

    localStorage.setItem("nika_currentUser", JSON.stringify(usuarioParaCache));
    return usuarioParaCache;
}

// ------------------------------------------------------------
// 7. GESTOR DE BANCOS JSON (Fase A.3 — persistencia multi-área en Supabase)
// ------------------------------------------------------------
async function guardarBancoJSON({ modulo, upId, data }) {
    await NikaSupabaseReady;
    const { data: { user } } = await nikaSupabase.auth.getUser();

    const { data: fila, error } = await nikaSupabase
        .from("bancos_json")
        .upsert(
            {
                modulo,
                up_id: upId,
                data,
                actualizado_por: user ? user.id : null,
            },
            { onConflict: "modulo,up_id" }
        )
        .select()
        .single();

    if (error) return { error };
    return { data: fila, error: null };
}

async function obtenerBancoJSON({ modulo, upId }) {
    await NikaSupabaseReady;
    const { data, error } = await nikaSupabase
        .from("bancos_json")
        .select("modulo, up_id, data, actualizado_por, updated_at")
        .eq("modulo", modulo)
        .eq("up_id", upId)
        .maybeSingle();

    if (error) return { error };
    return { data, error: null };
}

async function listarBancosJSON(modulo) {
    await NikaSupabaseReady;
    const { data, error } = await nikaSupabase
        .from("bancos_json")
        .select("modulo, up_id, data, updated_at")
        .eq("modulo", modulo);

    if (error) return { error };
    return { data, error: null };
}

async function cargarPreguntasUP({ modulo, upId }) {
    // Modo Guardia: 1) online -> Supabase; 2) sin señal o falla -> IndexedDB (descargado desde el modal);
    // 3) último recurso -> copia vieja en localStorage.
    const OS = window.OfflineStorage;
    const SM = window.SyncManager;
    const hayRed = navigator.onLine && !(SM && SM.estaOffline && SM.estaOffline());

    if (hayRed) {
        try {
            const res = await Promise.race([
                obtenerBancoJSON({ modulo, upId }),
                new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
            ]);
            if (!res.error && res.data && Array.isArray(res.data.data) && res.data.data.length) {
                const preguntas = res.data.data;
                // Si el alumno ya la había descargado para la guardia, se refresca esa copia
                try { if (OS && await OS.obtenerUPLocal(modulo, upId)) await OS.guardarUPLocal(modulo, upId, preguntas); } catch (_) {}
                try { localStorage.setItem(`nika_banco_${modulo}_${upId}`, JSON.stringify(preguntas)); } catch (_) { /* cuota de 5 MB */ }
                return { questions: preguntas, source: "supabase" };
            }
            if (res.error && /failed to fetch|network|load failed/i.test(String(res.error.message || ""))) {
                if (SM && SM.marcarRedCaida) SM.marcarRedCaida();
            }
        } catch (err) {
            console.warn("[supabaseClient] Falla de red consultando bancos_json, se usa la copia offline:", err);
            if (SM && SM.marcarRedCaida && /timeout|failed to fetch/i.test(String(err && err.message))) SM.marcarRedCaida();
        }
    }

    try {
        if (OS) {
            const guardadas = await OS.obtenerUPLocal(modulo, upId);
            if (guardadas && guardadas.length) return { questions: guardadas, source: "offline-db" };
        }
    } catch (err) {
        console.warn("[supabaseClient] IndexedDB no disponible:", err);
    }

    try {
        const local = localStorage.getItem(`nika_banco_${modulo}_${upId}`);
        if (local) return { questions: JSON.parse(local), source: "local" };
    } catch (_) {}
    return { questions: [], source: "none" };
}

// ------------------------------------------------------------
// 9. BANDEJA DE ERRATAS
// ------------------------------------------------------------
async function reportarErrata(preguntaTexto, justificacion) {
    await NikaSupabaseReady;
    const { data: { session } } = await nikaSupabase.auth.getSession();
    
    if (!session) {
        return { error: { message: "Debes iniciar sesión para reportar un error." } };
    }

    const usuarioLocal = JSON.parse(localStorage.getItem("nika_currentUser") || "{}");

    const { data, error } = await nikaSupabase
        .from("erratas")
        .insert({
            reporter_id: session.user.id,
            reporter_username: usuarioLocal.username || "Usuario",
            question_text: preguntaTexto,
            justification: justificacion,
            status: "pendiente"
        });

    if (error) {
        console.error("[supabaseClient] Error al reportar errata:", error);
        return { error };
    }
    
    return { data: true, error: null };
}

// ------------------------------------------------------------
// 8. Export global (sin módulos ES, coherente con el resto del proyecto)
// ------------------------------------------------------------
window.NikaSupabase = {
    get client() {
        return nikaSupabase;
    },
    ready: NikaSupabaseReady,
    getNikaCurrentUsername: typeof getNikaCurrentUsername !== 'undefined' ? getNikaCurrentUsername : undefined,
    ensureVersusPlayer: typeof ensureVersusPlayer !== 'undefined' ? ensureVersusPlayer : undefined,
    registrarUsuario: typeof registrarUsuario !== 'undefined' ? registrarUsuario : undefined,
    iniciarSesion,
    cerrarSesion,
    restaurarSesionSiExiste,
    solicitarRolAdmin,
    solicitarResetPassword,
    onPasswordRecovery,
    actualizarPassword,
    guardarBancoJSON,
    obtenerBancoJSON,
    listarBancosJSON,
    cargarPreguntasUP,
    reportarErrata,
};