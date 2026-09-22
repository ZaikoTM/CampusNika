/**
 * CAMPUS NIKA — Service Worker (v5 · Modo Guardia Offline-First)
 * ------------------------------------------------------------------
 * Estrategias:
 *  • App Shell (HTML, CSS, JS, íconos, manifest)  -> Network-First con tiempo límite (3 s)
 *    y fallback a la copia guardada. Con señal siempre abre la versión NUEVA; sin señal o con
 *    señal muy mala cae a la copia guardada (Modo Guardia). [v5: antes era Cache-First y la
 *    PWA instalada abría la versión vieja hasta la apertura siguiente]
 *  • Vademécum /data/nikafarma_api.json           -> Network-First con tiempo límite y
 *    fallback a la Cache API (la página además cae a IndexedDB si todo falla).
 *  • Datos JSON (data/*.json, preguntas.json, db_cirugia_organizado.json)
 *                                                  -> Network-First con tiempo límite.
 *  • CDN (Supabase SDK, Chart.js, Google Fonts)    -> Stale-While-Revalidate (admite opacas).
 *  • Supabase (REST / Auth / Realtime) y no-GET    -> NUNCA se interceptan (Network-Only);
 *    si fallan, la app usa la cola sync_queue de IndexedDB.
 *  • '?nika_ping'                                  -> pasa directo a la red (sirve para
 *    detectar "señal de mentira" desde js/syncManager.js).
 *  • Background Sync ('nika-sync')                 -> avisa a la pestaña abierta para vaciar la cola.
 *  • Mensajes: CACHE_URLS (descarga por lotes desde el modal de Guardia) y SKIP_WAITING.
 */

const SW_VERSION = "nika-v5";   // subir este número en cada deploy grande
const STATIC_CACHE = `${SW_VERSION}-static`;
const DATA_CACHE = `${SW_VERSION}-data`;
const CDN_CACHE = `${SW_VERSION}-cdn`;
const TIMEOUT_SHELL_MS = 3000;      // HTML/JS/CSS: si la red tarda más, se usa la copia guardada
const TIMEOUT_DATOS_MS = 5000;
const TIMEOUT_VADEMECUM_MS = 9000;      // ~4 MB: más margen con señal floja

const PRECACHE_URLS = [
    "index.html", "campus.html", "estudio.html", "examen.html", "versus.html", "cirugia_hub.html", "nikafarma.html",
    "terminos.html", "privacidad.html", "offline.html", "manifest.json", "styles.css", "favicon.ico",
    "supabaseClient.js",
    "js/auth-guard.js", "js/assistant.js", "js/social.js", "js/moderacion.js",
    "js/chatManager.js", "js/friendsManager.js", "js/rendimiento.js", "js/examen.js",
    "js/pomodoroEngine.js", "js/pomodoroSyncManager.js",
    "js/notificacionesManager.js", "js/duelosManager.js",
    "js/offlineStorage.js", "js/syncManager.js", "js/guardiaModal.js", "js/pwa-update.js",
    "js/productivity/pomodoro.js", "js/productivity/notas.js",
    "js/estudio/estudio.js",
    // Bancos locales y datos de respaldo del simulador
    "data/banco_trauma_superior.js", "data/banco_trauma_inferior.js", "data/banco_suturas.js",
    "data/cirugia.json", "preguntas.json", "db_cirugia_organizado.json",
    "assets/icons/icon-192.png", "assets/icons/icon-512.png",
    "assets/icons/favicon-32.png", "assets/icons/favicon-192.png",
];

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
    const vigentes = [STATIC_CACHE, DATA_CACHE, CDN_CACHE];
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
function esVademecum(url) {
    return /\/data\/nikafarma_api\.json$/i.test(url.pathname) || /\/nikafarma_api\.json$/i.test(url.pathname);
}
function esDatoJSON(url) {
    if (!/\.json$/i.test(url.pathname)) return false;
    if (/\/manifest\.json$/i.test(url.pathname)) return false;
    return /\/data\//i.test(url.pathname) || /\/(preguntas|db_cirugia_organizado|modulos)\.json$/i.test(url.pathname);
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
// Clave normalizada de navegación: examen.html?modulo=cirugia -> /examen.html
function claveNavegacion(url) {
    const path = url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname;
    return new Request(url.origin + path);
}
function huboCambio(vieja, nueva) {
    if (!vieja || !nueva) return false;
    const a = vieja.headers.get("etag") || vieja.headers.get("last-modified");
    const b = nueva.headers.get("etag") || nueva.headers.get("last-modified");
    return !!(a && b && a !== b);
}
let _avisoActualizacion = false;
async function avisarClientes(msg) {
    const lista = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    lista.forEach((c) => c.postMessage(msg));
}
function avisarActualizacion() {
    if (_avisoActualizacion) return;
    _avisoActualizacion = true;
    avisarClientes({ type: "NIKA_UPDATE_AVAILABLE" });
}

// ---------------- Estrategias ----------------

// App Shell: red primero (3 s) y, si falla o tarda, la copia guardada
async function shellRedPrimero(event, request, key, fallbackFinal) {
    const cache = await caches.open(STATIC_CACHE);
    const red = fetch(request).then(async (resp) => {
        if (esRespuestaCacheable(resp)) await cache.put(key, resp.clone());
        return resp;
    });
    try {
        return await conTimeout(red, TIMEOUT_SHELL_MS);
    } catch (_) {
        let cacheada = await cache.match(key);
        if (!cacheada && esNavegacionHTML(request)) {
            // URLs "limpias" (/campus en vez de /campus.html)
            const u = new URL(request.url);
            if (!/\.\w+$/.test(u.pathname)) cacheada = await cache.match(new Request(u.origin + u.pathname + ".html"));
        }
        if (cacheada) {
            event.waitUntil(red.catch(() => {}));   // la descarga sigue y deja la caché al día
            return cacheada;
        }
        try { return await red; } catch (_) { return fallbackFinal ? fallbackFinal() : Response.error(); }
    }
}

// Datos: red primero con tiempo límite; si tarda o falla, copia guardada
async function redPrimeroConTimeout(event, request, nombreCache, timeoutMs) {
    const cache = await caches.open(nombreCache);
    const red = fetch(request).then(async (resp) => {
        if (esRespuestaCacheable(resp)) await cache.put(request, resp.clone());
        return resp;
    });
    try {
        return await conTimeout(red, timeoutMs);
    } catch (_) {
        const cacheada = await cache.match(request, { ignoreSearch: true }) || await caches.match(request, { ignoreSearch: true });
        if (cacheada) {
            event.waitUntil(red.catch(() => {}));     // la descarga sigue y deja la caché al día
            return cacheada;
        }
        try { return await red; } catch (e2) { return Response.error(); }
    }
}

// CDN: copia guardada primero y refresco en segundo plano (admite respuestas opacas)
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

// ---------------- Enrutador ----------------
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Supabase, WebSockets y todo lo que no sea GET: siempre directo (Network-Only)
    if (esSupabaseORealtime(url) || request.method !== "GET") return;
    // Ping de conectividad real: sin caché
    if (url.searchParams.has("nika_ping")) return;
    // Descargas parciales (audio/video): que las resuelva el navegador
    if (request.headers.has("range")) return;

    if (url.origin !== self.location.origin) {
        if (CDN_HOSTS.includes(url.hostname)) event.respondWith(cdnStaleWhileRevalidate(event, request));
        return; // Google Identity, Drive, YouTube, etc. pasan directo
    }

    if (esVademecum(url)) {
        event.respondWith(redPrimeroConTimeout(event, request, DATA_CACHE, TIMEOUT_VADEMECUM_MS));
        return;
    }
    if (esDatoJSON(url)) {
        event.respondWith(redPrimeroConTimeout(event, request, DATA_CACHE, TIMEOUT_DATOS_MS));
        return;
    }
    if (esNavegacionHTML(request)) {
        event.respondWith(shellRedPrimero(event, request, claveNavegacion(url), () => caches.match("offline.html")));
        return;
    }
    // Resto del App Shell (JS, CSS, íconos, manifest, fuentes propias)
    event.respondWith(shellRedPrimero(event, request, request));
});

// ---------------- Background Sync ----------------
self.addEventListener("sync", (event) => {
    if (event.tag === "nika-sync") event.waitUntil(avisarClientes({ type: "NIKA_SYNC" }));
});

// ---------------- Mensajes desde la página ----------------
self.addEventListener("message", (event) => {
    const d = event.data || {};
    const puerto = event.ports && event.ports[0];

    if (d.type === "SKIP_WAITING") { self.skipWaiting(); return; }

    // CACHE_URLS: {urls:[...]} -> descarga y guarda; responde progreso por el MessageChannel
    if (d.type === "CACHE_URLS" && Array.isArray(d.urls)) {
        event.waitUntil((async () => {
            const staticC = await caches.open(STATIC_CACHE);
            const dataC = await caches.open(DATA_CACHE);
            const fallidas = [];
            let hechas = 0;
            for (const u of d.urls) {
                try {
                    const req = new Request(u, { cache: "reload" });
                    const url = new URL(req.url);
                    const resp = await fetch(req);
                    if (!resp.ok) throw new Error("HTTP " + resp.status);
                    const destino = (esVademecum(url) || esDatoJSON(url)) ? dataC : staticC;
                    await destino.put(esNavegacionHTMLPath(url) ? claveNavegacion(url) : req, resp.clone());
                } catch (e) {
                    fallidas.push(u);
                }
                hechas++;
                if (puerto) puerto.postMessage({ type: "progress", hechas, total: d.urls.length, url: u });
            }
            if (puerto) puerto.postMessage({ type: "done", ok: fallidas.length === 0, fallidas });
        })());
    }
});

function esNavegacionHTMLPath(url) {
    return /\.html$/i.test(url.pathname);
}
