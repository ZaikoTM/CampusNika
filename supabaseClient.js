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
//
// Contrato de retorno (siempre un objeto, nunca lanza):
//   éxito -> { ok: true,  data: <perfil>, error: null }
//   error -> { ok: false, data: null, error: { type, message, status?, code? } }
// donde error.type es uno de:
//   "offline"              el dispositivo no tiene internet (navigator.onLine === false)
//   "unreachable"          hay internet pero no se pudo contactar al servidor (caído, bloqueado, CORS)
//   "timeout"              el servidor no respondió a tiempo
//   "invalid_credentials"  usuario/correo o contraseña incorrectos
//   "email_not_confirmed"  falta confirmar el correo
//   "rate_limit"           demasiados intentos fallidos
//   "validation"           faltan datos o son inválidos
//   "server_config"        la función del servidor no está desplegada / mal configurada
//   "server"               error interno del servidor (5xx)
//   "invalid_response"     respuesta inesperada del servidor
//   "profile"              se autenticó pero no se pudo leer el perfil
//   "unknown"              cualquier otro caso
// (error.message es siempre un texto listo para mostrarle al usuario.)
const LOGIN_TIMEOUT_MS = 15000;

function _errorLogin(type, message, extra = {}) {
    return { ok: false, data: null, error: { type, message, ...extra } };
}

function _esErrorDeRed(err) {
    if (!err) return false;
    const msg = String(err.message || err).toLowerCase();
    return (
        err.name === "AuthRetryableFetchError" ||
        err.status === 0 ||
        /failed to fetch|networkerror|network request failed|load failed|fetch failed/.test(msg)
    );
}

function _errorDeRed(err) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
        return _errorLogin("offline", "No hay conexión a internet. Revisá tu red e intentá de nuevo.");
    }
    return _errorLogin(
        "unreachable",
        "No pudimos comunicarnos con el servidor de inicio de sesión. Probá de nuevo en unos minutos" +
        " o ingresá con tu correo electrónico."
    );
}

async function iniciarSesion({ identifier, password }) {
    try {
        await NikaSupabaseReady;
    } catch (err) {
        console.error("[supabaseClient] El SDK de Supabase no cargó:", err);
        return _errorLogin(
            "unreachable",
            "No se pudo cargar el sistema de autenticación. Recargá la página y, si sigue igual, " +
            "desactivá el bloqueador de anuncios o revisá tu conexión."
        );
    }

    const id = String(identifier || "").trim();
    if (!id || !password) {
        return _errorLogin("validation", "Completá usuario y contraseña.");
    }

    // ---------- Camino 1: login con correo (directo contra Supabase Auth) ----------
    if (id.includes("@")) {
        let resultado;
        try {
            resultado = await nikaSupabase.auth.signInWithPassword({ email: id.toLowerCase(), password });
        } catch (err) {
            console.warn("[supabaseClient] Falló signInWithPassword:", err);
            return _esErrorDeRed(err) ? _errorDeRed(err) : _errorLogin("unknown", "No se pudo iniciar sesión. Intentá de nuevo.");
        }

        const { data, error } = resultado;
        if (error) {
            console.log("Error completo de Supabase:", error);

            if (_esErrorDeRed(error)) return _errorDeRed(error);

            const errMsg = error.message ? error.message.toLowerCase() : "";
            const errCode = error.code ? String(error.code).toLowerCase() : "";

            if (errCode === "email_not_confirmed" || errMsg.includes("email not confirmed")) {
                return _errorLogin("email_not_confirmed", "Confirmá tu correo electrónico antes de iniciar sesión. Revisá tu bandeja de entrada (y spam).", { status: error.status, code: error.code });
            }
            if (errCode === "invalid_credentials" || errMsg.includes("invalid login credentials") || (error.status === 400 && errMsg.includes("invalid login"))) {
                return _errorLogin("invalid_credentials", "Verificá tu correo electrónico para ingresar, o revisá que tus datos sean correctos.", { status: error.status, code: error.code });
            }
            if (error.status === 429 || errCode.includes("rate_limit")) {
                return _errorLogin("rate_limit", "Demasiados intentos. Esperá unos minutos e intentá de nuevo.", { status: error.status, code: error.code });
            }
            if (error.status >= 500) {
                return _errorLogin("server", "El servidor tuvo un problema. Intentá de nuevo en unos minutos.", { status: error.status, code: error.code });
            }
            return _errorLogin("unknown", error.message || "No se pudo iniciar sesión.", { status: error.status, code: error.code });
        }

        return _finalizarLogin(data && data.user);
    }

    // ---------- Camino 2: login con usuario (Edge Function "login-usuario") ----------
    let respuesta;
    let cuerpo = {};
    const controlador = typeof AbortController !== "undefined" ? new AbortController() : null;
    const temporizador = controlador ? setTimeout(() => controlador.abort(), LOGIN_TIMEOUT_MS) : null;
    try {
        respuesta = await fetch(`${SUPABASE_URL}/functions/v1/login-usuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ identificador: id, password }),
            signal: controlador ? controlador.signal : undefined,
        });
        cuerpo = await respuesta.json().catch(() => ({}));
    } catch (err) {
        console.warn("[supabaseClient] No se pudo contactar login-usuario:", err);
        if (err && err.name === "AbortError") {
            return _errorLogin("timeout", "El servidor tardó demasiado en responder. Intentá de nuevo.");
        }
        // Un fetch que falla ANTES de recibir respuesta (sin internet, servidor caído o bloqueo CORS)
        // llega acá como TypeError. Solo se dice "sin conexión" si realmente el navegador está offline.
        return _errorDeRed(err);
    } finally {
        if (temporizador) clearTimeout(temporizador);
    }

    const mensajeServidor = cuerpo && typeof cuerpo.error === "string" ? cuerpo.error : "";

    if (!respuesta.ok || !cuerpo.access_token || !cuerpo.refresh_token) {
        const estado = respuesta.status;
        if (!mensajeServidor) {
            console.warn("[supabaseClient] login-usuario respondió", estado, "(¿está desplegada y con 'Verify JWT' desactivado?)", cuerpo);
        }

        if (estado === 429) {
            return _errorLogin("rate_limit", mensajeServidor || "Demasiados intentos fallidos. Probá de nuevo en unos minutos.", { status: estado });
        }
        if (estado === 403) {
            return _errorLogin("email_not_confirmed", mensajeServidor || "Confirmá tu correo antes de iniciar sesión.", { status: estado });
        }
        if (estado === 401 && mensajeServidor) {
            return _errorLogin("invalid_credentials", mensajeServidor, { status: estado });
        }
        if (estado === 400) {
            return _errorLogin("validation", mensajeServidor || "Completá usuario y contraseña.", { status: estado });
        }
        if (estado === 401 || estado === 404) {
            // 401 sin nuestro mensaje = lo rechazó el gateway de Supabase ("Verify JWT" activado);
            // 404 = la función no está desplegada.
            return _errorLogin("server_config", "El ingreso con nombre de usuario no está disponible en este momento. Ingresá con tu correo electrónico.", { status: estado });
        }
        if (estado >= 500) {
            return _errorLogin("server", mensajeServidor || "El servidor tuvo un problema. Intentá de nuevo en unos minutos o ingresá con tu correo.", { status: estado });
        }
        return _errorLogin("invalid_response", mensajeServidor || "Respuesta inesperada del servidor. Probá con tu correo.", { status: estado });
    }

    let sesion, sessionError;
    try {
        ({ data: sesion, error: sessionError } = await nikaSupabase.auth.setSession({
            access_token: cuerpo.access_token,
            refresh_token: cuerpo.refresh_token,
        }));
    } catch (err) {
        console.warn("[supabaseClient] Falló setSession:", err);
        return _esErrorDeRed(err) ? _errorDeRed(err) : _errorLogin("unknown", "No se pudo iniciar sesión.");
    }
    if (sessionError || !sesion || !sesion.user) {
        if (_esErrorDeRed(sessionError)) return _errorDeRed(sessionError);
        return _errorLogin("unknown", (sessionError && sessionError.message) || "No se pudo iniciar sesión.", { status: sessionError && sessionError.status });
    }

    return _finalizarLogin(sesion.user);
}

// Paso común a ambos caminos: cachea el perfil en localStorage y arma la respuesta de éxito.
async function _finalizarLogin(authUser) {
    if (!authUser) return _errorLogin("unknown", "No se pudo iniciar sesión.");
    let perfilCacheado = null;
    try {
        perfilCacheado = await _cachearSesionLocal(authUser);
    } catch (err) {
        console.error("[supabaseClient] Error cacheando el perfil:", err);
        if (_esErrorDeRed(err)) return _errorDeRed(err);
    }
    if (!perfilCacheado) {
        return _errorLogin("profile", "Iniciaste sesión, pero no pudimos cargar tu perfil. Intentá de nuevo en unos segundos.");
    }
    return { ok: true, data: perfilCacheado, error: null };
}

async function cerrarSesion() {
    await NikaSupabaseReady;
    await nikaSupabase.auth.signOut();
    // Rastro de rol/tipo de cuenta que usa nikaAcceso.js para decidir acceso
    // NikaMed+ (ver _cachearSesionLocal más arriba, que es quien lo escribe).
    localStorage.removeItem("nika_currentUser");
    // Clave suelta que examen.html llegó a leer en paralelo en una versión
    // vieja del paywall; se limpia igual por las dudas de que algún código
    // legado todavía la escriba en algún lado.
    localStorage.removeItem("tipo_cuenta");

    // OJO: a propósito NO se toca acá el candado de usos gratis
    // (nk_acc_5b1 / nk_acc_c9e / _nk_acc_dvs / _nk_acc_dvc en nikaAcceso.js,
    // ni nk_sfx_9f2 / nk_sfx_c7d / _nk_dvs / _nk_dvc en examen.html): es
    // cortesía POR DISPOSITIVO, no por cuenta. Borrarlo en cada logout le
    // regalaría usos gratis infinitos a cualquiera con solo cerrar e iniciar
    // sesión de nuevo.
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

    // tipo_cuenta ('free' | 'vip' | 'premium') define el acceso NikaMed+ (ver js/nikaAcceso.js).
    // Si la columna todavía no existe (falta correr sql/02_simuladores_limite.sql) se reintenta
    // sin ella para no romper el login de nadie; en ese caso todos figuran como 'free'.
    let { data: perfil, error } = await nikaSupabase
        .from("profiles")
        .select("username, fullname, avatar, role, tipo_cuenta")
        .eq("id", authUser.id)
        .single();

    if (error && /tipo_cuenta/i.test(error.message || "")) {
        console.warn("[supabaseClient] profiles.tipo_cuenta no existe todavía; corré sql/02_simuladores_limite.sql.");
        ({ data: perfil, error } = await nikaSupabase
            .from("profiles")
            .select("username, fullname, avatar, role")
            .eq("id", authUser.id)
            .single());
    }

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
        tipo_cuenta: String(perfil.tipo_cuenta || "free").toLowerCase(),
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