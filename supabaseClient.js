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
// un username, primero lo resolvemos a su email vía la tabla
// "profiles" (que es pública para lectura) antes de autenticar.

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

// Login: acepta email o username. Si es username, resuelve el email real
// vía la función RPC resolve_email_by_username (no expone la tabla completa)
// antes de llamar a signInWithPassword.
async function iniciarSesion({ identifier, password }) {
    await NikaSupabaseReady;
    let email = identifier.trim().toLowerCase();

    if (!email.includes("@")) {
        const { data: emailResuelto, error: rpcError } = await nikaSupabase
            .rpc("resolve_email_by_username", { p_username: email });

        if (rpcError || !emailResuelto) {
            return { error: { message: "Usuario no encontrado." } };
        }
        email = emailResuelto;
    }

    const { data, error } = await nikaSupabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    const perfilCacheado = await _cachearSesionLocal(data.user);
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
// Paso 1: el usuario pide el link de reset desde el modal. redirectTo debe
// apuntar a la URL pública real donde vive index.html (o donde se quiera
// atender el retorno); Supabase agrega los tokens de recovery al hash de esa
// URL. Por seguridad, Supabase Auth siempre responde éxito exista o no el
// email, así que del lado del cliente no hay forma (ni se debe) distinguir
// "no encontrado" de "enviado" — evita filtrar qué correos están registrados.
async function solicitarResetPassword(email) {
    await NikaSupabaseReady;
    const { error } = await nikaSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) return { error };
    return { data: true, error: null };
}

// Paso 2: cuando el usuario vuelve desde el link del mail, el SDK de
// Supabase detecta automáticamente el token de recovery en el hash de la URL
// (detectSessionInUrl está en true por defecto) y dispara este evento con
// una sesión temporal ya activa. index.html solo necesita suscribirse acá
// para saber cuándo abrir el modal de "nueva contraseña" — no hay que leer
// ni parsear el hash a mano.
function onPasswordRecovery(callback) {
    NikaSupabaseReady.then(() => {
        nikaSupabase.auth.onAuthStateChange((event, _session) => {
            if (event === "PASSWORD_RECOVERY") callback();
        });
    }).catch(() => {
        /* ya se logueó el error en _esperarSDKSupabase */
    });
}

// Paso 3: con la sesión de recovery activa, updateUser() ya alcanza para
// fijar la contraseña nueva (no hace falta el token explícito: el SDK lo
// intercambió por la sesión en el paso anterior). Al terminar el usuario
// queda logueado con la sesión normal, así que refrescamos el caché local.
async function actualizarPassword(newPassword) {
    await NikaSupabaseReady;
    const { data, error } = await nikaSupabase.auth.updateUser({ password: newPassword });
    if (error) return { error };

    const perfilCacheado = await _cachearSesionLocal(data.user);
    return { data: perfilCacheado, error: null };
}

// Fase A.1 — llama a la Edge Function verify-admin: si la clave maestra es
// correcta, el servidor promueve profiles.role a 'admin' para el usuario
// actualmente logueado. Requiere sesión activa (usa el JWT del usuario).
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

    // Refresca el caché local con el rol nuevo
    await _cachearSesionLocal(session.user);
    return { data, error: null };
}

// Al cargar cualquier página: si hay sesión de Supabase activa pero no hay
// caché local (ej. login persistido por otra pestaña, o el localStorage se
// limpió pero el token de sesión sigue vivo), reconstruye nika_currentUser.
async function restaurarSesionSiExiste() {
    await NikaSupabaseReady;
    const { data: { session } } = await nikaSupabase.auth.getSession();
    if (!session) return null;
    return _cachearSesionLocal(session.user);
}

// Escribe/actualiza el espejo en localStorage que el resto de index.html
// sigue leyendo (perfil, dashboard, admin, amigos, etc. no se tocaron).
async function _cachearSesionLocal(authUser) {
    if (!authUser) return null;
    await NikaSupabaseReady;

    const { data: perfil, error } = await nikaSupabase
        .from("profiles")
        .select("username, fullname, avatar, role, email")
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
        email: perfil.email || authUser.email,
        avatar: perfil.avatar,
        role: perfil.role,
    };

    localStorage.setItem("nika_currentUser", JSON.stringify(usuarioParaCache));
    return usuarioParaCache;
}

// ------------------------------------------------------------
// 7. GESTOR DE BANCOS JSON (Fase A.3 — persistencia multi-área en Supabase)
// ------------------------------------------------------------
// Tabla public.bancos_json (modulo, up_id, data, actualizado_por), con
// upsert por la clave compuesta (modulo, up_id). La escritura está
// protegida por RLS via is_admin(); si el usuario logueado no es admin,
// Supabase devuelve un error de policy que el admin dashboard reporta.

// Alta o actualización de un banco. Usa upsert para que re-subir el mismo
// (modulo, up_id) reemplace el banco anterior en vez de duplicar filas.
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

// Trae un único banco (modulo + up_id). Es lo que consulta el simulador
// (examen.html / cirugia_hub.html) antes de recurrir al caché local.
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

// Trae todos los bancos de un área (para el listado de estado del admin dashboard).
async function listarBancosJSON(modulo) {
    await NikaSupabaseReady;
    const { data, error } = await nikaSupabase
        .from("bancos_json")
        .select("modulo, up_id, data, updated_at")
        .eq("modulo", modulo);

    if (error) return { error };
    return { data, error: null };
}

// Consumo híbrido: intenta Supabase primero y, si falla la red o no hay
// datos, cae a la copia en localStorage guardada en la última sincronización
// exitosa. Pensada para ser llamada desde examen.html / cirugia_hub.html.
async function cargarPreguntasUP({ modulo, upId }) {
    try {
        const { data, error } = await obtenerBancoJSON({ modulo, upId });
        if (!error && data && Array.isArray(data.data) && data.data.length) {
            // Refresca el respaldo local con lo último confirmado en Supabase.
            localStorage.setItem(`nika_banco_${modulo}_${upId}`, JSON.stringify(data.data));
            return { questions: data.data, source: "supabase" };
        }
    } catch (err) {
        console.warn("[supabaseClient] Falla de red consultando bancos_json, se usa caché local:", err);
    }

    const local = localStorage.getItem(`nika_banco_${modulo}_${upId}`);
    if (local) return { questions: JSON.parse(local), source: "local" };
    return { questions: [], source: "none" };
}

// ------------------------------------------------------------
// 8. Export global (sin módulos ES, coherente con el resto del proyecto)
// ------------------------------------------------------------
window.NikaSupabase = {
    // Getter: siempre devuelve el valor MÁS RECIENTE de nikaSupabase, sea
    // null (todavía no listo) o el cliente ya inicializado. Evita que algún
    // módulo se quede con una referencia congelada a "undefined" por haber
    // leído window.NikaSupabase.client antes de tiempo.
    get client() {
        return nikaSupabase;
    },
    // Promesa que resuelve con el cliente listo. Cualquier módulo que
    // necesite garantías (no solo "probar suerte") debe hacer:
    //   await window.NikaSupabase.ready;
    // antes de operar contra Supabase.
    ready: NikaSupabaseReady,
    getNikaCurrentUsername,
    ensureVersusPlayer,
    registrarUsuario,
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
};
