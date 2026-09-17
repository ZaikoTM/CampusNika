// ==========================================
// CAMPUS NIKA - AUTH GUARD (Smart Gate)
// ==========================================
// Expone window.NikaAuth = { userId, session, ready }
// - ready: Promise que resuelve el userId (o null) una vez verificada la sesión.
//   Cualquier módulo (notas.js, pomodoro.js, estudio.js) debe hacer
//   `await window.NikaAuth.ready;` antes de consultar Supabase con user_id,
//   para evitar condiciones de carrera con este script.

window.NikaAuth = {
    userId: null,
    session: null,
    ready: null
};

window.NikaAuth.ready = new Promise((resolve) => {
    // auth-guard.js ahora puede cargarse dinámicamente (ver el loader con
    // respaldo de CDN en el <head> de campus.html), lo que significa que
    // para cuando este script corre, "DOMContentLoaded" puede haber
    // disparado YA. Si solo escucháramos ese evento, este código nunca
    // correría. Por eso: si el DOM ya está listo, arrancamos directo;
    // si no, esperamos el evento como antes.
    function _iniciarAuthGuard() {
        (async () => {
        // Verificamos si el cliente de Supabase está disponible.
        // OJO: supabaseClient.js NO expone una variable global "supabaseClient",
        // expone window.NikaSupabase.client (ver punto 8 de supabaseClient.js).
        // Ese desajuste era la causa real del error
        // "[AuthGuard] supabaseClient no está definido".
        //
        // Además, en vez de asumir que window.NikaSupabase.client ya está
        // inicializado en este instante, esperamos su promesa "ready": eso
        // cubre cualquier demora real en la carga del SDK del CDN (red lenta,
        // caché de Service Worker sirviendo una versión vieja, etc.) sin
        // explotar en falso.
        if (typeof window.NikaSupabase === 'undefined') {
            console.error('[AuthGuard] window.NikaSupabase no está definido. Verificá que supabaseClient.js se cargue antes que js/auth-guard.js.');
            resolve(null);
            return;
        }

        let supabaseClient;
        try {
            supabaseClient = await window.NikaSupabase.ready;
        } catch (err) {
            console.error('[AuthGuard] El SDK de Supabase nunca terminó de inicializar:', err);
            resolve(null);
            return;
        }

        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            // Detectamos la ruta actual del navegador
            const path = window.location.pathname;
            const isPublicPage = path.endsWith('index.html') || path === '/' || path.endsWith('/');

            // REGLA 1: Sin sesión en página privada -> Redirigir a Landing (index.html)
            if (!session && !isPublicPage) {
                window.location.href = 'index.html';
                resolve(null);
                return;
            }

            // REGLA 2: Con sesión en la Landing -> Redirigir al Campus privado (campus.html)
            if (session && isPublicPage) {
                window.location.href = 'campus.html';
                // No resolvemos con datos "finales" porque la página va a navegar,
                // pero igual completamos la promesa por si algún script llega a ejecutar antes del redirect.
            }

            // Exponemos sesión y user_id de forma global para el resto de los módulos
            window.NikaAuth.session = session;
            window.NikaAuth.userId = session ? session.user.id : null;

            // Mantenemos el user_id sincronizado si la sesión cambia en caliente
            // (ej. el usuario cierra sesión desde otra pestaña)
            supabaseClient.auth.onAuthStateChange((_event, newSession) => {
                window.NikaAuth.session = newSession;
                window.NikaAuth.userId = newSession ? newSession.user.id : null;

                if (!newSession && !isPublicPage) {
                    window.location.href = 'index.html';
                }
            });

            resolve(window.NikaAuth.userId);
        } catch (err) {
            console.error("[AuthGuard] Error al verificar la sesión:", err);
            resolve(null);
        }
        })();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", _iniciarAuthGuard);
    } else {
        _iniciarAuthGuard();
    }
});
