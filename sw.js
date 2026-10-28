/**
 * CAMPUS NIKA — Service Worker (v7 · Modo Sin conexión (offline-first))
 * ------------------------------------------------------------------
 * Estrategias:
 *  • App Shell (HTML, CSS, JS, íconos, manifest)  -> Network-First con tiempo límite (3 s)
 *    y fallback a la copia guardada. Con señal siempre abre la versión NUEVA; sin señal o con
 *    señal muy mala cae a la copia guardada (Modo Sin conexión). [v5: antes era Cache-First y la
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

const SW_VERSION = "nika-v377";   // subir este número en cada deploy grande
const STATIC_CACHE = `${SW_VERSION}-static`;
const DATA_CACHE = `${SW_VERSION}-data`;
const CDN_CACHE = `${SW_VERSION}-cdn`;
const GUARDIA_CACHE = "nika-guardia";   // descargas del Modo Sin conexión: NO se borra al actualizar la app
const TIMEOUT_SHELL_MS = 3000;      // HTML/JS/CSS: si la red tarda más, se usa la copia guardada
const TIMEOUT_DATOS_MS = 5000;
const TIMEOUT_VADEMECUM_MS = 9000;      // ~4 MB: más margen con señal floja

const PRECACHE_URLS = [
    "index.html", "campus.html", "nikaplay.html", "css/nikaplay.css", "css/nikaword.css", "css/nikaworld.css", "css/farmamatch.css", "css/doctor.css", "css/decor.css", "js/nikaplay/core.js", "js/nikaplay/sonido.js", "js/nikaplay/nube.js", "js/nikaplay/social.js", "css/nikaplay-social.css", "js/nikaplay/doctor.js", "js/nikaplay/decor.js", "js/nikaplay/nikaword.js", "js/nikaplay/farmamatch.js", "js/nikaplay/proto.js", "plan_examen.html", "css/plan-examen.css", "css/plan-examen-v2.css", "css/plan-examen-v3.css", "css/tema-premium-salas.css", "js/planExamen.js", "js/planFusion.js", "js/campusVisual.js", "retos.html", "js/nikaVoz.js", "js/vozLocal.js", "js/vozLocalWorker.js", "examen_oral.html", "js/examenOral.js", "js/nikaPdf.js", "js/versusPlus.js", "css/versus-plus.css", "js/desafiosGlobal.js", "js/nikaImprimir.js", "css/nika-imprimir.css", "css/examen-oral.css", "js/retos.js", "js/retoCrear.js", "css/retos.css", "css/retos-form.css", "js/resumenSemanal.js", "css/resumen-semanal.css", "js/estudio/notasEstudio.js", "mis_notas.html", "js/misNotas.js", "css/mis-notas.css", "js/nikaAccesibilidad.js", "js/nikaMetricas.js", "css/accesibilidad.css", "css/campus-visual.css", "js/planPomodoro.js", "js/planImprimir.js", "js/vendor/qrcode-generator.min.js", "css/plan-imprimir.css", "ml_estudio.html", "recorrido.html", "data/recorrido_ginecologia.json", "data/recorrido_cirugia.json", "data/recorrido_medicinadeportiva.json", "js/mlEstudio.js", "css/ml-estudio.css", "data/medicinalegal.json", "data/medicinadeportiva.json", "data/medicinalegal_recorrido.json", "js/programaTemas.js", "data/pfo_data.json", "data/planes/gineco_integrador_up1_3.json", "data/planes/gineco_final_up1_4.json", "data/planes/cirugia_parcial1_up1_5.json", "data/planes/cirugia_parcial2_up6_11.json", "data/planes/cirugia_final_up1_11.json", "data/planes/siam_parcial1_up1_5.json", "data/planes/siam_parcial2_up6_9.json", "data/planes/siam_final_up1_9.json", "nikasim.html", "sala_estudio.html", "css/sala-estudio.css", "js/salaEstudioHub.js", "nikasim-data.js", "js/nikasim.js", "css/nikasim.css", "recetarios.html", "js/recetarios.js", "css/tema-oscuro-paginas.css", "js/temaOscuro.js", "js/chatFlotante.js", "js/nikaNotificaciones.js", "js/campusCuenta.js", "css/campus-cuenta.css", "js/campusAmigos.js", "css/campus-amigos.css", "css/admin-filtros.css", "js/recetariosExamen.js", "js/examIntegridad.js", "css/examen-integridad.css", "js/recetariosShare.js", "js/recetariosData.js", "css/recetarios.css", "assets/TEXTO%20VECTOR%20NIKA.png", "liga.html", "foro.html", "ateneos.html", "estudio.html", "estadisticas.html", "css/estadisticas.css", "js/estadisticas.js", "js/estadisticasNika.js", "examen.html", "versus.html", "cirugia_hub.html", "nikafarma.html",
    "terminos.html", "privacidad.html", "reembolsos.html", "offline.html", "manifest.json", "styles.css", "favicon.ico",
    "supabaseClient.js",
    "js/auth-guard.js", "js/assistant.js", "js/social.js", "js/moderacion.js",
    "js/chatManager.js", "js/friendsManager.js", "js/rendimiento.js", "js/examen.js",
    "js/pomodoroEngine.js", "js/pomodoroSyncManager.js",
    "js/notificacionesManager.js", "js/duelosManager.js",
    "js/offlineStorage.js", "js/syncManager.js", "js/guardiaModal.js", "js/pwa-update.js",
    "js/productivity/pomodoro.js", "js/productivity/notas.js",
    "js/estudio/estudio.js",
    "js/liga.js", "js/paginaLateral.js", "css/pagina-lateral.css", "css/nika-unificado.css", "js/rachas.js", "js/atajos.js", "js/foro.js", "js/nikaMusic.js", "js/nikafarmaPlus.js", "js/nikafarmaPatologias.js", "js/nikaFlashcards.js", "js/ateneoGlobal.js", "css/flashcards.css", "flashcards.html", "js/voiceManager.js", "js/ateneos.js", "js/onboardingTour.js",
    // Bancos locales y datos de respaldo del simulador
    "data/banco_trauma_superior.js", "data/banco_trauma_inferior.js", "data/banco_suturas.js",
    "data/cirugia.json", "preguntas.json", "db_cirugia_organizado.json",
    "assets/icons/icon-192.png", "assets/icons/icon-512.png",
    "assets/icons/favicon-32.png", "assets/icons/favicon-192.png",
    // Archivos que cargan las páginas principales (agregado al reinventar el Modo Sin conexión)
    "acreditaciones.html", "admin.html", "assets/N%20NIKA%20MAXIMA%20CALIDAD%20POSIBLE.png", "assets/N%20NIKA.png", "assets/icons/apple-touch-icon.png", "css/acreditaciones.css", "css/campus-premium-espacio.css", "css/campus-premium.css", "css/examen-navbar.css", "css/micro.css", "css/nika-navbar.css", "css/pfo-estudio.css", "css/pfo.css", "css/productividad.css", "css/sidebar-grupos.css", "css/tema-premium-salas.css", "duelosManager.js", "gineco_hub.html", "js/acreditaciones/fx.js", "js/acreditaciones/monitor.js", "js/acreditaciones/motor.js", "js/avisoVencimiento.js", "js/campusEspacio.js", "js/campusTema.js", "js/casosPacientes.js", "js/estudio/pdfLector.js", "js/estudio/pdfOffline.js", "js/estudio/pdfSync.js", "js/estudio/pdfConvertir.js", "js/nikaConversiones.js", "js/estudio/pdfExtras.js", "js/estudio/pdfExportar.js", "assets/n-nika.svg", "assets/nika-texto.svg", "js/estudio/nikaTiempoLectura.js", "js/estudio/nikaCartelFlashcards.js", "js/estudio/pdfAnotaciones.js", "js/examModesConfig.js", "js/examNavbarMovil.js", "js/examPromptsMaterias.js", "js/formatoEvaluacion.js", "js/micro.js", "js/nikaAcceso.js", "js/novedadesAviso.js", "js/perfilRedes.js", "js/pfoCasoChat.js", "js/pfoEcoe.js", "js/pfoEstudio.js", "js/pomodoroBar.js", "js/presenciaCampus.js", "js/programaTemas.js", "js/salaEstudio.js", "js/sidebarGrupos.js", "js/speechManager.js", "js/splashNika.js", "nikamed-plus.html", "notificacionesManager.js", "pfo_ecoe.html", "pfo_estudio.html", "siam_hub.html",
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
            Promise.all(keys.filter((k) => k.startsWith("nika-") && !vigentes.includes(k) && k !== GUARDIA_CACHE).map((k) => caches.delete(k)))
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
        let cacheada = await cache.match(key) || await caches.match(key);   // también busca en las descargas del Modo Sin conexión
        if (!cacheada && esNavegacionHTML(request)) {
            // URLs "limpias" (/campus en vez de /campus.html)
            const u = new URL(request.url);
            if (!/\.\w+$/.test(u.pathname)) cacheada = await cache.match(new Request(u.origin + u.pathname + ".html")) || await caches.match(new Request(u.origin + u.pathname + ".html"));
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

// Vademécum (~4 MB): se entrega al instante la copia guardada y se actualiza en segundo plano; solo la primera vez espera a la red
async function copiaPrimeroYActualiza(event, request, nombreCache, timeoutMs) {
    const cache = await caches.open(nombreCache);
    const cacheada = await cache.match(request, { ignoreSearch: true });
    const red = fetch(request).then(async (resp) => {
        if (esRespuestaCacheable(resp)) await cache.put(request, resp.clone());
        return resp;
    });
    if (cacheada) { event.waitUntil(red.catch(() => {})); return cacheada; }
    try { return await conTimeout(red, timeoutMs); }
    catch (_) { try { return await red; } catch (e2) { return Response.error(); } }
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
        event.respondWith(copiaPrimeroYActualiza(event, request, DATA_CACHE, TIMEOUT_VADEMECUM_MS));
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
// ---------------------------------------------------------------------------
// Web Push (aviso con la app cerrada): lo manda la Edge Function enviar-push al crearse una notificación.
// Si hay una ventana de NikaMed visible, no se muestra nada (la página ya avisa sola, con sonido).
// ---------------------------------------------------------------------------
self.addEventListener("push", (event) => {
    let d = {};
    try { d = event.data ? event.data.json() : {}; } catch (_) { d = { titulo: "NikaMed", cuerpo: event.data ? event.data.text() : "" }; }
    event.waitUntil((async () => {
        const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        if (ventanas.some((c) => c.visibilityState === "visible")) return;
        const esInv = d.tipo === "invitacion_pomodoro";
        await self.registration.showNotification(d.titulo || "NikaMed", {
            body: d.cuerpo || "",
            icon: "assets/n-nika-192.webp",
            badge: "assets/n-nika-96.webp",
            tag: d.id || ("nn-" + Date.now()),
            renotify: true,
            requireInteraction: esInv,
            vibrate: esInv ? [200, 100, 200, 100, 300] : [120],
            data: { url: d.url || "campus.html", vence: d.vence || null },
            actions: esInv ? [{ action: "unirme", title: "🍅 Unirme" }, { action: "cerrar", title: "Ahora no" }] : [],
        });
    })());
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    if (event.action === "cerrar") return;
    const url = (event.notification.data && event.notification.data.url) || "campus.html";
    event.waitUntil((async () => {
        const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const dest = new URL(url, self.registration.scope).href;
        for (const c of ventanas) {
            if (c.url.startsWith(self.registration.scope) && "focus" in c) { try { await c.focus(); if ("navigate" in c) await c.navigate(dest); return; } catch (_) {} }
        }
        if (self.clients.openWindow) await self.clients.openWindow(dest);
    })());
});

self.addEventListener("sync", (event) => {
    if (event.tag === "nika-sync") event.waitUntil(avisarClientes({ type: "NIKA_SYNC" }));
});

// ---------------- Mensajes desde la página ----------------
self.addEventListener("message", (event) => {
    const d = event.data || {};
    const puerto = event.ports && event.ports[0];

    if (d.type === "SKIP_WAITING") { self.skipWaiting(); return; }

    // CACHE_URLS: {urls:[...]} -> descarga y guarda en la caché persistente del Modo Sin conexión; responde progreso por el MessageChannel
    if (d.type === "CACHE_URLS" && Array.isArray(d.urls)) {
        event.waitUntil((async () => {
            const guardia = await caches.open(GUARDIA_CACHE);
            const fallidas = [];
            let hechas = 0, bytes = 0;
            for (const u of d.urls) {
                try {
                    const req = new Request(u, { cache: "reload" });
                    const url = new URL(req.url);
                    const resp = await fetch(req);
                    if (!resp.ok) throw new Error("HTTP " + resp.status);
                    const copia = resp.clone();
                    try { bytes += (await resp.clone().arrayBuffer()).byteLength; } catch (_) {}
                    await guardia.put(esNavegacionHTMLPath(url) ? claveNavegacion(url) : new Request(url.href), copia);
                } catch (e) {
                    fallidas.push(u);
                }
                hechas++;
                if (puerto) puerto.postMessage({ type: "progress", hechas, total: d.urls.length, url: u, bytes });
            }
            if (puerto) puerto.postMessage({ type: "done", ok: fallidas.length === 0, fallidas, bytes });
        })());
        return;
    }

    // UNCACHE_URLS: {urls:[...]} -> saca esas descargas de la caché del Modo Sin conexión
    if (d.type === "UNCACHE_URLS" && Array.isArray(d.urls)) {
        event.waitUntil((async () => {
            const guardia = await caches.open(GUARDIA_CACHE);
            let borradas = 0;
            for (const u of d.urls) {
                try {
                    const url = new URL(u, self.location.origin);
                    const ok = await guardia.delete(esNavegacionHTMLPath(url) ? claveNavegacion(url) : new Request(url.href));
                    if (ok) borradas++;
                } catch (_) {}
            }
            if (puerto) puerto.postMessage({ type: "done", borradas });
        })());
        return;
    }

    // HAS_URLS: {urls:[...]} -> cuáles están guardadas en el Modo Sin conexión
    if (d.type === "HAS_URLS" && Array.isArray(d.urls)) {
        event.waitUntil((async () => {
            const guardia = await caches.open(GUARDIA_CACHE);
            const presentes = [];
            for (const u of d.urls) {
                try {
                    const url = new URL(u, self.location.origin);
                    const m = await guardia.match(esNavegacionHTMLPath(url) ? claveNavegacion(url) : new Request(url.href));
                    if (m) presentes.push(u);
                } catch (_) {}
            }
            if (puerto) puerto.postMessage({ type: "done", presentes });
        })());
        return;
    }
});

function esNavegacionHTMLPath(url) {
    return /\.html$/i.test(url.pathname);
}
