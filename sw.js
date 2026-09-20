/**
 * ============================================================
 * CAMPUS NIKA — Service Worker
 * ------------------------------------------------------------
 * Objetivo: hacer la app instalable (PWA) y dar tolerancia a
 * conexiones inestables, SIN tocar nunca el tráfico en vivo de
 * Supabase (auth, Realtime, REST) para no romper duelos 1vs1,
 * chat privado, presencia ni sincronización de datos.
 *
 * Estrategias:
 *  - Navegación (HTML):        Network First  -> fallback a caché -> fallback a offline.html
 *  - Código propio (html/js/css): Network First (siempre trae la versión nueva
 *                                 si hay red; si no, usa la última guardada)
 *  - Imágenes/fuentes/íconos:  Stale-While-Revalidate
 *  - Supabase / APIs externas
 *    / WebSockets / peticiones
 *    que no sean GET:           Se ignoran (pasan directo a la red, nunca se cachean)
 * ============================================================
 */

// IMPORTANTE: subí este número cada vez que agregues archivos a PRECACHE_URLS o
// quieras forzar que todos los usuarios descarten la caché anterior.
const SW_VERSION = "nika-v2";
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGES_CACHE = `${SW_VERSION}-pages`;

// Recursos mínimos para que la app abra instalada incluso con mala señal.
// Sumá acá cualquier CSS/JS externo que agregues (por ej. cuando separemos el CSS).
const PRECACHE_URLS = [
    "campus.html",
    "estudio.html",
    "examen.html",
    "versus.html",
    "cirugia_hub.html",
    "offline.html",
    "manifest.json",
    "styles.css",
    "favicon.ico",
    "js/chatManager.js",
    "js/social.js",
    "js/pomodoroSyncManager.js",
    "js/pomodoroEngine.js",
    "js/friendsManager.js",
    "js/rendimiento.js",
    "js/productivity/pomodoro.js",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png",
    "assets/icons/favicon-32.png",
    "assets/icons/favicon-192.png",
];

// ------------------------------------------------------------
// INSTALL — precachea el shell mínimo de la app
// ------------------------------------------------------------
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) =>
            // addAll aborta todo si UNO falla; los agregamos de a uno
            // para que un solo archivo faltante no rompa la instalación.
            Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
        )
    );
    self.skipWaiting();
});

// ------------------------------------------------------------
// ACTIVATE — limpia cachés de versiones viejas
// ------------------------------------------------------------
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key.startsWith("nika-") && key !== STATIC_CACHE && key !== PAGES_CACHE)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ------------------------------------------------------------
// Helpers de estrategia
// ------------------------------------------------------------
function esPeticionSupabaseORealtime(url) {
    return (
        url.hostname.endsWith("supabase.co") ||
        url.hostname.endsWith("supabase.in") ||
        url.protocol === "ws:" ||
        url.protocol === "wss:"
    );
}

function esNavegacionHTML(request) {
    return request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

async function networkFirstParaNavegacion(request) {
    try {
        const respuestaRed = await fetch(request);
        const cache = await caches.open(PAGES_CACHE);
        cache.put(request, respuestaRed.clone());
        return respuestaRed;
    } catch (err) {
        const cache = await caches.open(PAGES_CACHE);
        // ignoreSearch: estudio.html?modulo=cirugia debe encontrar estudio.html en caché
        const cacheada = await cache.match(request, { ignoreSearch: true })
            || await caches.match(request, { ignoreSearch: true });
        return cacheada || caches.match("offline.html");
    }
}

// Código propio (.js / .css / .json): primero la red, así después de cada deploy
// nadie queda con una versión vieja. Sin red, se usa la última copia guardada.
async function networkFirstParaCodigo(request) {
    const cache = await caches.open(STATIC_CACHE);
    try {
        const respuestaRed = await fetch(request);
        if (respuestaRed && respuestaRed.status === 200) {
            cache.put(request, respuestaRed.clone());
        }
        return respuestaRed;
    } catch (err) {
        const cacheada = await cache.match(request, { ignoreSearch: true });
        if (cacheada) return cacheada;
        throw err;
    }
}

function esCodigoPropio(url) {
    return /\.(js|css|json|html)$/i.test(url.pathname);
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cacheada = await cache.match(request);

    const fetchYActualizar = fetch(request)
        .then((respuestaRed) => {
            if (respuestaRed && respuestaRed.status === 200) {
                cache.put(request, respuestaRed.clone());
            }
            return respuestaRed;
        })
        .catch(() => cacheada); // si no hay red, nos quedamos con lo cacheado

    return cacheada || fetchYActualizar;
}

// ------------------------------------------------------------
// FETCH — enrutador principal
// ------------------------------------------------------------
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Nunca interceptar Supabase (Auth/REST/Realtime), WebSockets, ni nada
    // que no sea GET (POST/PATCH/DELETE de inserts, RPC, etc. deben ir siempre en vivo).
    if (esPeticionSupabaseORealtime(url) || request.method !== "GET") {
        return; // deja pasar la petición sin tocarla
    }

    // Solo cacheamos same-origin; recursos de terceros (fonts, CDNs) pasan directo.
    if (url.origin !== self.location.origin) {
        return;
    }

    if (esNavegacionHTML(request)) {
        event.respondWith(networkFirstParaNavegacion(request));
        return;
    }

    if (esCodigoPropio(url)) {
        event.respondWith(networkFirstParaCodigo(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request));
});
