/**
 * CAMPUS NIKA — Service Worker (v3)
 * ------------------------------------------------------------
 * Cambios respecto a v2:
 *  - Network First con TIEMPO LÍMITE (4 s): con señal mala se usa la copia guardada
 *    en vez de esperar a que la red falle del todo.
 *  - Solo se cachean respuestas correctas (nunca 404/500).
 *  - Se cachean los CDN de scripts y fuentes (SDK de Supabase, Chart.js, Google Fonts)
 *    para que la app abra sin conexión.
 *  - Precaché ampliado (supabaseClient, auth-guard, estudio, notas, cirugia.json, legales).
 *  - Sigue sin tocar NUNCA Supabase, WebSockets ni peticiones que no sean GET.
 */

const SW_VERSION = "nika-v3";
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGES_CACHE = `${SW_VERSION}-pages`;
const CDN_CACHE = `${SW_VERSION}-cdn`;
const TIMEOUT_RED_MS = 4000;

const PRECACHE_URLS = [
    "index.html", "campus.html", "estudio.html", "examen.html", "versus.html", "cirugia_hub.html",
    "terminos.html", "privacidad.html", "offline.html", "manifest.json", "styles.css", "favicon.ico",
    "supabaseClient.js",
    "data/cirugia.json",
    "js/auth-guard.js", "js/assistant.js", "js/social.js", "js/moderacion.js",
    "js/chatManager.js", "js/friendsManager.js", "js/rendimiento.js",
    "js/pomodoroEngine.js", "js/pomodoroSyncManager.js",
    "js/notificacionesManager.js", "js/duelosManager.js",
    "js/productivity/pomodoro.js", "js/productivity/notas.js",
    "js/estudio/estudio.js",
    "assets/icons/icon-192.png", "assets/icons/icon-512.png",
    "assets/icons/favicon-32.png", "assets/icons/favicon-192.png",
];

// Hosts de terceros cuyo contenido estático sí se cachea (scripts y fuentes)
const CDN_HOSTS = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) =>
            // de a uno: si falta un archivo no se cae toda la instalación
            Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
        )
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    const vigentes = [STATIC_CACHE, PAGES_CACHE, CDN_CACHE];
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k.startsWith("nika-") && !vigentes.includes(k)).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ---------------- Helpers ----------------
function esSupabaseORealtime(url) {
    return url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in")
        || url.protocol === "ws:" || url.protocol === "wss:";
}
function esNavegacionHTML(request) {
    return request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}
function esCodigoPropio(url) {
    return /\.(js|css|json|html)$/i.test(url.pathname);
}
function conTimeout(promesa, ms) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("timeout")), ms);
        promesa.then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
    });
}
function esRespuestaCacheable(resp) {
    return resp && resp.ok && resp.type !== "opaqueredirect";
}

// Red primero, pero con tiempo límite: si tarda, se usa la copia guardada
// y la descarga sigue en segundo plano para dejar la caché al día.
async function redPrimeroConTimeout(event, request, nombreCache, opcionesMatch, fallbackFinal) {
    const cache = await caches.open(nombreCache);
    const red = fetch(request).then(async (resp) => {
        if (esRespuestaCacheable(resp)) await cache.put(request, resp.clone());
        return resp;
    });
    try {
        return await conTimeout(red, TIMEOUT_RED_MS);
    } catch (err) {
        const cacheada = await cache.match(request, opcionesMatch) || await caches.match(request, opcionesMatch);
        if (cacheada) {
            event.waitUntil(red.catch(() => {}));
            return cacheada;
        }
        try {
            return await red; // sin copia: no queda otra que esperar a la red
        } catch (e2) {
            return fallbackFinal ? fallbackFinal() : Response.error();
        }
    }
}

// Scripts/fuentes de CDN: primero la copia guardada, y se refresca en segundo plano.
// Admite respuestas "opacas" (scripts cargados con <script src> desde otro origen).
async function cdnStaleWhileRevalidate(event, request) {
    const cache = await caches.open(CDN_CACHE);
    const cacheada = await cache.match(request);
    const actualizar = fetch(request).then((resp) => {
        if (resp && (resp.ok || resp.type === "opaque")) cache.put(request, resp.clone());
        return resp;
    }).catch(() => cacheada);
    if (cacheada) { event.waitUntil(actualizar); return cacheada; }
    return actualizar;
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cacheada = await cache.match(request);
    const red = fetch(request).then((resp) => {
        if (esRespuestaCacheable(resp)) cache.put(request, resp.clone());
        return resp;
    }).catch(() => cacheada);
    return cacheada || red;
}

// ---------------- Enrutador ----------------
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (esSupabaseORealtime(url) || request.method !== "GET") return; // siempre en vivo

    if (url.origin !== self.location.origin) {
        if (CDN_HOSTS.includes(url.hostname)) event.respondWith(cdnStaleWhileRevalidate(event, request));
        return; // Google Identity, Drive, YouTube, etc. pasan directo
    }

    if (esNavegacionHTML(request)) {
        event.respondWith(redPrimeroConTimeout(event, request, PAGES_CACHE, { ignoreSearch: true }, () => caches.match("offline.html")));
        return;
    }
    if (esCodigoPropio(url)) {
        event.respondWith(redPrimeroConTimeout(event, request, STATIC_CACHE, { ignoreSearch: true }));
        return;
    }
    event.respondWith(staleWhileRevalidate(request));
});
