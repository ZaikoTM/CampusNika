// js/pwa-update.js
// CAMPUS NIKA — Registro del Service Worker + actualización automática de la PWA.
// Reemplaza los bloques "PWA: SERVICE WORKER" que hoy están dentro de campus.html y examen.html
// (y de cualquier otra página que registre sw.js). Se incluye con:
//     <script src="js/pwa-update.js"></script>
(function () {
    if (!('serviceWorker' in navigator)) return;

    const teniaControlador = !!navigator.serviceWorker.controller;
    let recargando = false;
    let pendiente = false;

    // Nunca recargamos en medio de un examen (isExamActive vive en examen.html)
    function examenEnCurso() {
        return typeof isExamActive !== 'undefined' && isExamActive === true;
    }
    function avisar(msg) {
        if (typeof showToast === 'function') showToast(msg);
    }
    function recargarSiEsSeguro() {
        if (recargando) return;
        if (examenEnCurso()) {
            if (!pendiente) {
                pendiente = true;
                avisar('✨ Hay una versión nueva de Campus Nika. Se aplicará al terminar el examen.');
                const t = setInterval(() => {
                    if (!examenEnCurso()) { clearInterval(t); recargarSiEsSeguro(); }
                }, 5000);
            }
            return;
        }
        recargando = true;
        location.reload();
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then((reg) => {
            // Buscar versión nueva cada vez que la PWA vuelve a primer plano y cada 30 min
            const buscar = () => reg.update().catch(() => {});
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') buscar();
            });
            setInterval(buscar, 30 * 60 * 1000);
        }).catch((err) => console.error('[SW] No se pudo registrar:', err));
    });

    // Un SW nuevo tomó el control (skipWaiting + clients.claim en sw.js) -> recargar una sola vez.
    // Se ignora la primera instalación (no había controlador previo).
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (teniaControlador) recargarSiEsSeguro();
    });

    navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'NIKA_UPDATE_AVAILABLE') avisar('✨ Campus Nika se actualizó.');
    });
})();
