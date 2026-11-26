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
// El SDK se sirve primero desde nuestro propio dominio (js/vendor/supabase.js): no depende de jsDelivr/unpkg, que
// algunas redes (colegios, antivirus, proveedores de internet, VPN) bloquean o dejan colgados. Si por algo no está,
// se prueban los CDN y, si todo falla, se SIGUE REINTENTANDO en segundo plano (antes se rendía a los 5 s y el usuario
// quedaba sin conexión a la base hasta recargar: salas de Pomodoro sin reconectar y sesiones "pendientes" para siempre).
const _FUENTES_SDK_PROPIAS = [
    "js/vendor/supabase.js?v=21192",
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
    "https://unpkg.com/@supabase/supabase-js@2",
];
function _sdkListo() { return !!(window.supabase && typeof window.supabase.createClient === "function"); }
function _inyectarSDK(src, msMax) {
    return new Promise((resolve) => {
        const s = document.createElement("script");
        let fin = false;
        const cerrar = (ok) => { if (fin) return; fin = true; clearTimeout(t); if (!ok) { try { s.remove(); } catch (_) {} } resolve(ok); };
        const t = setTimeout(() => cerrar(false), msMax);
        s.src = src; s.async = true;
        s.onload = () => cerrar(_sdkListo());
        s.onerror = () => cerrar(false);
        document.head.appendChild(s);
    });
}
async function _conseguirSDK() {
    let ronda = 0;
    for (;;) {
        if (_sdkListo()) return window.supabase;
        // Margen corto por si la página todavía lo está cargando por su cuenta.
        for (let i = 0; i < 20 && !_sdkListo(); i++) await new Promise((r) => setTimeout(r, 50));
        if (_sdkListo()) return window.supabase;
        for (const fuente of _FUENTES_SDK_PROPIAS) {
            if (_sdkListo()) return window.supabase;
            if (await _inyectarSDK(fuente, 15000)) { console.info("[Nika] SDK de Supabase cargado desde:", fuente); return window.supabase; }
        }
        ronda++;
        console.warn("[Nika] No se pudo cargar el SDK de Supabase (ronda " + ronda + "). Reintentando…");
        await new Promise((r) => setTimeout(r, Math.min(30000, 3000 * ronda)));
    }
}
// Se mantiene el nombre por compatibilidad: rechaza si tarda más de maxEsperaMs, pero la carga sigue en segundo plano.
function _esperarSDKSupabase(maxEsperaMs = 20000) {
    const carga = _conseguirSDK();
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("[supabaseClient] El SDK de Supabase tarda en cargar; se sigue intentando en segundo plano.")), maxEsperaMs);
        carga.then((sdk) => { clearTimeout(t); resolve(sdk); });
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
// Capa común de red del cliente de Supabase:
//  1) Si el servidor dice "JWT expired" se renueva la sesión una vez y se repite la consulta (así no se rompe nada aunque el
//     reloj del dispositivo esté desfasado, que es lo que hace que el navegador crea que el token todavía sirve).
//  2) Si no se puede renovar, se avisa UNA vez con un cartel claro.
//  3) Se vigila la conexión con el servidor y se muestra un indicador chico cuando se cae y cuando vuelve.
let _avisoSesionMostrado = false, _renovando = null;
const _RUTAS_API = /\/rest\/v1\/|\/functions\/v1\/|\/auth\/v1\//;
async function _fetchConAviso(url, opts) {
    const u = String(url);
    const esApi = _RUTAS_API.test(u);
    let r;
    try {
        r = await fetch(url, opts);
    } catch (err) {
        if (esApi && !(err && err.name === 'AbortError')) _estadoRed(false);
        throw err;
    }
    if (!esApi) return r;
    _estadoRed(![502, 503, 504, 522, 523, 524].includes(r.status));
    try {
        if (r.status === 401 && /\/rest\/v1\/|\/functions\/v1\//.test(u) && !(opts && opts.__reintento)) {
            const txt = await r.clone().text().catch(() => '');
            if (/JWT expired|PGRST303/i.test(txt)) {
                const token = await _renovarSesion();
                if (token) {
                    const h = new Headers((opts && opts.headers) || {});
                    h.set('Authorization', 'Bearer ' + token);
                    return fetch(url, Object.assign({}, opts, { headers: h, __reintento: true }));
                }
                _mostrarAvisoSesion();
            }
        }
    } catch (_) {}
    return r;
}
function _renovarSesion() {
    if (_renovando) return _renovando;
    _renovando = (async () => {
        try {
            if (!nikaSupabase) return null;
            const { data, error } = await nikaSupabase.auth.refreshSession();
            return (!error && data && data.session && data.session.access_token) || null;
        } catch (_) { return null; }
    })();
    setTimeout(() => { _renovando = null; }, 4000);
    return _renovando;
}

// Indicador de conexión: aparece solo cuando hay un problema real y se va solo cuando se recupera.
let _fallasRed = 0, _pildoraRed = null, _ocultarRed = null;
function _pildora(texto, tipo) {
    if (typeof document === 'undefined' || !document.body) return;
    if (!_pildoraRed) {
        _pildoraRed = document.createElement('div');
        _pildoraRed.id = 'nk-estado-red';
        _pildoraRed.setAttribute('role', 'status'); _pildoraRed.setAttribute('aria-live', 'polite');
        _pildoraRed.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:2147482000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 28px);padding:8px 14px;border-radius:999px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;box-shadow:0 8px 24px rgba(0,0,0,.35);font:600 12.5px/1.2 system-ui,sans-serif;pointer-events:none';
        document.body.appendChild(_pildoraRed);
    }
    const color = tipo === 'ok' ? '#22c55e' : tipo === 'offline' ? '#f59e0b' : '#ef4444';
    _pildoraRed.innerHTML = '<span style="width:9px;height:9px;border-radius:50%;background:' + color + ';flex:none"></span><span></span>';
    _pildoraRed.lastChild.textContent = texto;
    _pildoraRed.style.display = 'flex';
    clearTimeout(_ocultarRed);
    if (tipo === 'ok') _ocultarRed = setTimeout(() => { if (_pildoraRed) _pildoraRed.style.display = 'none'; }, 2500);
}
function _estadoRed(ok) {
    if (ok) {
        const habiaProblema = _fallasRed >= 2 || (_pildoraRed && _pildoraRed.style.display !== 'none' && !_ocultarRed);
        _fallasRed = 0;
        if (habiaProblema) _pildora('Conexión restablecida ✓', 'ok');
        return;
    }
    _fallasRed++;
    if (_fallasRed < 2) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) _pildora('Sin internet · se reconecta solo', 'offline');
    else _pildora('Sin conexión con el servidor · reintentando…', 'error');
}
if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => { _fallasRed = 2; _estadoRed(false); });
    window.addEventListener('online', () => { _fallasRed = 2; _pildora('Conexión restablecida ✓', 'ok'); _fallasRed = 0; });
}

// Reloj del dispositivo: si está desfasado, el navegador cree que los tokens duran más de lo real y las consultas fallan.
function _revisarRelojDispositivo(session) {
    try {
        if (!session || !session.expires_at || !session.expires_in) return;
        const emitido = session.expires_at - session.expires_in;       // segundos, hora del servidor
        const desfase = Math.round(Date.now() / 1000 - emitido);        // + = el dispositivo está adelantado
        if (Math.abs(desfase) < 150) return;
        if (sessionStorage.getItem('nk_reloj_avisado')) return;
        sessionStorage.setItem('nk_reloj_avisado', '1');
        const min = Math.round(Math.abs(desfase) / 60);
        _avisoSimple('La hora de tu dispositivo está ' + (desfase > 0 ? 'adelantada' : 'atrasada') + ' unos ' + min + ' min. Activá la hora automática del sistema; si no, pueden fallar el ingreso y las estadísticas.');
    } catch (_) {}
}
function _avisoSimple(texto) {
    const mostrar = () => {
        const d = document.createElement('div');
        d.setAttribute('role', 'alert');
        d.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483000;max-width:min(520px,calc(100vw - 24px));background:#0f172a;color:#e2e8f0;border:1px solid #f59e0b;border-radius:14px;padding:12px 14px;box-shadow:0 14px 40px rgba(0,0,0,.45);font:500 13.5px/1.45 system-ui,sans-serif;display:flex;gap:10px;align-items:flex-start';
        const t = document.createElement('span'); t.textContent = '⏰ ' + texto; t.style.flex = '1';
        const x = document.createElement('button'); x.textContent = '✕'; x.setAttribute('aria-label', 'Cerrar aviso');
        x.style.cssText = 'background:transparent;color:#94a3b8;border:0;font-size:16px;cursor:pointer';
        x.onclick = () => d.remove();
        d.append(t, x); document.body.appendChild(d);
        setTimeout(() => d.remove(), 20000);
    };
    if (document.body) mostrar(); else document.addEventListener('DOMContentLoaded', mostrar);
}
function _mostrarAvisoSesion() {
    if (_avisoSesionMostrado) return;
    if (/(^|\/)index\.html$|\/$/.test(location.pathname)) return;   // en el login no hace falta
    _avisoSesionMostrado = true;
    const mostrar = () => {
        const d = document.createElement('div');
        d.setAttribute('role', 'alert');
        d.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483000;max-width:min(560px,calc(100vw - 24px));background:#0f172a;color:#e2e8f0;border:1px solid #38bdf8;border-radius:16px;padding:14px 16px;box-shadow:0 18px 50px rgba(0,0,0,.45);font:500 14px/1.45 system-ui,sans-serif;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
        d.innerHTML = '<span style="flex:1 1 240px"><b style="color:#fff">Tu sesión venció 🔒</b><br>Por seguridad hay que volver a iniciar sesión para ver tus estadísticas, amigos y sesiones. Tus datos están a salvo.</span>';
        const b = document.createElement('button');
        b.textContent = 'Iniciar sesión de nuevo';
        b.style.cssText = 'background:#0ea5e9;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-weight:700;cursor:pointer';
        b.onclick = async () => { try { await cerrarSesion(); } catch (_) {} location.replace('index.html'); };
        const x = document.createElement('button');
        x.textContent = '✕'; x.setAttribute('aria-label', 'Cerrar aviso');
        x.style.cssText = 'background:transparent;color:#94a3b8;border:0;font-size:16px;cursor:pointer';
        x.onclick = () => d.remove();
        d.append(b, x); document.body.appendChild(d);
    };
    if (document.body) mostrar(); else document.addEventListener('DOMContentLoaded', mostrar);
}

let nikaSupabase = null;

function _crearCliente(supabaseSDK) {
    const opciones = {
        global: { fetch: _fetchConAviso },
        realtime: {
            params: {
                eventsPerSecond: 10, // límite razonable para un duelo 1vs1
            },
            // El latido del socket corre en un Web Worker: los navegadores (y las PWA) frenan los temporizadores de
            // las pestañas en segundo plano y eso cortaba la presencia aunque el sitio siguiera abierto.
            worker: true,
            heartbeatIntervalMs: 20000,
        },
    };
    let c;
    try {
        c = supabaseSDK.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, opciones);
    } catch (err) {
        // Navegadores con el almacenamiento bloqueado (modo privado estricto, cookies de terceros, antivirus): sesión en memoria.
        console.warn("[Nika] No se pudo crear el cliente con almacenamiento local, se usa memoria:", err && err.message);
        const mem = {};
        c = supabaseSDK.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, Object.assign({}, opciones, {
            auth: { persistSession: false, storage: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } } },
        }));
    }
    c.auth.onAuthStateChange((evento, ses) => { if (evento === 'TOKEN_REFRESHED') _revisarRelojDispositivo(ses); });
    // Solo con TOKEN_REFRESHED: ahí el token se acaba de emitir. SIGNED_IN también salta al volver a una pestaña
    // en segundo plano con un token viejo, y eso daba falsos avisos de "hora adelantada".
    return c;
}

let _clientePromesa = null;
function _asegurarCliente() {
    if (!_clientePromesa) {
        _clientePromesa = _conseguirSDK().then((sdk) => {
            nikaSupabase = _crearCliente(sdk);
            try { window.dispatchEvent(new CustomEvent('nika:supabase-listo')); } catch (_) {}
            return nikaSupabase;
        });
        _clientePromesa.catch((err) => { console.error('[supabaseClient] No se pudo crear el cliente:', err && err.message || err); });
    }
    return _clientePromesa;
}

// `ready` rechaza si el SDK tarda más de 20 s (el resto de la app lo trata como "sin conexión"), pero la carga sigue
// y apenas llega el cliente queda disponible en NikaSupabase.client y se emite el evento 'nika:supabase-listo'.
const NikaSupabaseReady = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('[supabaseClient] El SDK de Supabase tarda en cargar; se sigue intentando en segundo plano.')), 20000);
    _asegurarCliente().then((c) => { clearTimeout(t); resolve(c); });
}).catch((err) => {
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

// ------------------------------------------------------------
// Cloudflare Turnstile (captcha gratuito, casi invisible): protege registro, inicio de sesión y recuperación de contraseña.
//  · NIKA_TURNSTILE_SITEKEY es la clave de SITIO (pública). Vacía = sin captcha: todo funciona como antes.
//  · Para que el servidor lo EXIJA: Supabase → Authentication → Attack Protection → Enable Captcha → Turnstile (con la Secret Key).
//  · El widget solo se muestra si Cloudflare duda de que sea una persona; si no, la verificación es invisible.
// ------------------------------------------------------------
const NIKA_TURNSTILE_SITEKEY = '0x4AAAAAAFkAM1_umZIIX5RM';
let _turnstileCarga = null;
function _cargarTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (!_turnstileCarga) {
        _turnstileCarga = new Promise((ok, no) => {
            const s = document.createElement('script');
            s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            s.async = true; s.onload = () => ok(); s.onerror = () => { _turnstileCarga = null; no(new Error('turnstile')); };
            document.head.appendChild(s);
        });
    }
    return _turnstileCarga;
}
// Devuelve un token de un solo uso (o undefined si el captcha está apagado o no pudo cargar).
// Primero intenta en modo invisible; si falla (bloqueadores, escudos del navegador, red lenta), repite con el
// recuadro visible para que la persona pueda resolverlo a mano.
async function _captchaToken() {
    if (!NIKA_TURNSTILE_SITEKEY) return undefined;
    try { await _cargarTurnstile(); } catch (_) { return undefined; }
    // Si en la pantalla de ingreso ya se resolvió por adelantado (mientras la persona escribía), se usa ese token: el login es instantáneo.
    if (_capPrevio) { try { await _capPrevio; } catch (_) {} }
    if (_capToken && Date.now() - _capToken.t < 240000) { const t = _capToken.v; _capToken = null; return t; }
    _capToken = null;
    const t = await _captchaIntento(false, 9000);
    return t || _captchaIntento(true);
}
let _capToken = null, _capPrevio = null;
function _captchaPrecalentar() {
    if (!NIKA_TURNSTILE_SITEKEY || _capPrevio || _capToken) return;
    _capPrevio = _cargarTurnstile().then(() => _captchaIntento(false, 20000)).then((v) => { if (v) _capToken = { v, t: Date.now() }; }).catch(() => {}).then(() => { _capPrevio = null; });
}
if (typeof document !== 'undefined' && /(^|\/)index\.html$|\/$/.test(location.pathname)) {
    const _pre = () => setTimeout(_captchaPrecalentar, 600);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _pre); else _pre();
}
function _captchaIntento(visible, tope_ms) {
    return new Promise((resolve) => {
        const caja = document.createElement('div');
        caja.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483600;padding:14px;border-radius:16px;background:#0f172a;box-shadow:0 24px 60px rgba(0,0,0,.55);display:' + (visible ? 'block' : 'none');
        if (visible) {
            const m = document.createElement('div');
            m.textContent = 'Un último paso: confirmá que sos una persona';
            m.style.cssText = 'color:#e2e8f0;font:600 13px system-ui,sans-serif;text-align:center;margin-bottom:10px';
            caja.appendChild(m);
        }
        document.body.appendChild(caja);
        const cont = document.createElement('div'); caja.appendChild(cont);
        let id = null, terminado = false;
        const fin = (t) => {
            if (terminado) return; terminado = true; clearTimeout(tope);
            try { window.turnstile.remove(id); } catch (_) {}
            caja.remove(); resolve(t || undefined);
        };
        const tope = setTimeout(() => fin(undefined), visible ? 60000 : (tope_ms || 9000));
        try {
            id = window.turnstile.render(cont, {
                sitekey: NIKA_TURNSTILE_SITEKEY, appearance: visible ? 'always' : 'interaction-only', theme: 'dark',
                callback: fin, 'error-callback': () => fin(undefined),
                'before-interactive-callback': () => { caja.style.display = 'block'; },
                'after-interactive-callback': () => { if (!visible) caja.style.display = 'none'; },
            });
        } catch (_) { fin(undefined); }
    });
}

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

    const captchaToken = await _captchaToken();
    const { data, error } = await nikaSupabase.auth.signUp({
        email: emailNorm,
        password,
        options: {
            data: { fullname, username: usernameNorm, avatar: avatar || null },
            captchaToken,
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
            const captchaToken = await _captchaToken();
            resultado = await nikaSupabase.auth.signInWithPassword({ email: id.toLowerCase(), password, options: { captchaToken } });
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
    const captchaToken = await _captchaToken();
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
            body: JSON.stringify({ identificador: id, password, captchaToken }),
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
        if (estado === 400 && /persona|captcha|verificar/i.test(mensajeServidor)) {
            return _errorLogin("validation", "No pudimos completar la verificación de seguridad. No es un problema de tu cuenta ni del sitio. Probá una de estas opciones:\n\n1) Recargá con Ctrl + F5 e intentá de nuevo.\n2) Si usás Brave u otro bloqueador, desactivá los escudos para nikamed.com.ar.\n3) Ingresá con tu correo o con el botón de Google.", { status: estado });
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
    const captchaToken = await _captchaToken();
    const { error } = await nikaSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
        captchaToken,
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
    // Modo Sin conexión: 1) online -> Supabase; 2) sin señal o falla -> IndexedDB (descargado desde el modal);
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
            status: "pending"
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
    captchaToken: _captchaToken,
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