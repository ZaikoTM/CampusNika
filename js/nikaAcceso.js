/**
 * ============================================================
 * CAMPUS NIKA — Control de acceso NikaMed+
 * js/nikaAcceso.js
 * ------------------------------------------------------------
 * Un solo lugar para las reglas de negocio de la cuenta:
 *
 *  1. Simuladores de IA: los usuarios `free` tienen 2 usos gratuitos por
 *     simulador (escrito, pase_sala, shock_room, consultorio_legales, ecoe_final).
 *     El conteo y la decisión los hace el SERVIDOR (RPC consumir_uso_simulador,
 *     ver sql/02_simuladores_limite.sql), pero iniciarSimulacion() también
 *     mantiene un candado local ofuscado (ver sección 1.b) como red de
 *     seguridad: garantiza que el descuento sea inmediato y que un error de
 *     red o de la RPC nunca regale usos gratis de más. El servidor sigue
 *     siendo la autoridad cuando responde bien (se sincroniza el candado
 *     local a su valor real en cada llamada exitosa).
 *     `choice` es libre e ilimitado.
 *     - campus.html  -> abrirSimulador(): solo CONSULTA los cupos (no descuenta) y avisa
 *                       antes de navegar si ya no quedan.
 *     - examen.html  -> iniciarSimulacion(): DESCUENTA 1 uso en el instante en que una
 *                       simulación nueva arranca de verdad. Es el candado real: cubre la
 *                       URL escrita a mano y la elección de modalidad dentro de la página.
 *  2. Herramientas exclusivas (Asistente Nika / NotebookLM).
 *  3. Distintivo visual NikaMed+ (clase `nika-vip` en <body>).
 *
 * Reglas de cuenta:
 *   - tipo_cuenta 'vip' o 'premium'  -> NikaMed+ (ilimitado + distintivo).
 *   - role 'admin'                   -> acceso completo, sin distintivo.
 *   - cualquier otro                 -> free.
 *
 * IMPORTANTE: lo que se lee de localStorage (nika_currentUser) es solo para
 * pintar la interfaz rápido: el usuario puede editarlo. La autoridad es el
 * servidor (RPC). Para blindar del todo una herramienta de IA, la Edge Function
 * que la sirve debe validar el plan también.
 *
 * Se usa en: campus.html, estudio.html y examen.html.
 * Depende de: window.NikaSupabase (supabaseClient.js)
 * ============================================================
 */

(function () {
    'use strict';

    const LIMITE_GRATIS = 2;
    const URL_PLAN = 'nikamed-plus.html';
    const URL_CAMPUS = 'campus.html';

    // Las claves coinciden con el parámetro ?modalidad= de examen.html y con la
    // lista blanca de la función SQL consumir_uso_simulador().
    const SIMULADORES = {
        choice:              { titulo: 'Simulador Choice',       icono: '🩺', ia: false, desc: 'Examen cronometrado de opción múltiple' },
        escrito:             { titulo: 'Simulador Escrito',      icono: '✍️', ia: true,  desc: 'Desarrollá respuestas evaluadas por IA' },
        pase_sala:           { titulo: 'Pase de Sala',           icono: '🛏️', ia: true,  desc: 'Recorrida clínica con paciente IA' },
        shock_room:          { titulo: 'Shock Room',             icono: '🚨', ia: true,  desc: 'Urgencias contra reloj' },
        consultorio_legales: { titulo: 'Consultorios y Legales', icono: '🗣️', ia: true,  desc: 'Comunicación clínica y medicolegal' },
        ecoe_final:          { titulo: 'Examen Final ECOE',      icono: '👨‍⚕️', ia: true,  desc: 'Estación de Cirugía a ciegas' },
    };

    const FUNCIONES_VIP = {
        asistente: { nombre: 'Asistente Nika (NotebookLM)' },
    };

    const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const urlSimulador = (mod) => `examen.html?modalidad=${encodeURIComponent(mod)}`;
    // Navegación en un solo lugar (permite probar el flujo sin recargar la página).
    let _navegar = (url, reemplazar) => { if (reemplazar) location.replace(url); else location.href = url; };
    const _ir = (url, reemplazar) => _navegar(url, reemplazar);
    const avisar = (msg) => { if (typeof window.showToast === 'function') window.showToast(msg); else console.info('[NikaAcceso]', msg); };

    // ------------------------------------------------------------
    // 1.b Candado LOCAL de respaldo (ofuscado) — NO es la fuente de verdad (esa
    //     sigue siendo el servidor, ver comentario del encabezado), pero
    //     iniciarSimulacion() lo usa como garantía dura: si la RPC tarda, falla
    //     o el SQL todavía no está desplegado, el candado local es el que
    //     efectivamente frena al alumno en el uso #3, en vez de dejarlo pasar
    //     gratis para siempre (que era el bug reportado). Mismo esquema que
    //     examen.html: registro único en Base64+checksum, duplicado en
    //     localStorage y en una cookie propia (para que un simple
    //     localStorage.clear() no "regale" usos de nuevo), con checksum atado a
    //     una semilla de dispositivo. Namespacing propio (nk_acc_*) para no
    //     pisar el contador cosmético que ya vive en examen.html.
    // ------------------------------------------------------------
    const LEDGER_KEY = 'nk_acc_5b1';
    const LEDGER_COOKIE = 'nk_acc_c9e';
    const SEED_KEY = '_nk_acc_dvs';
    const SEED_COOKIE = '_nk_acc_dvc';

    // La semilla de dispositivo TAMBIÉN se duplica en cookie (antes solo vivía en
    // localStorage): si no, un `localStorage.clear()` la regenera de cero y el
    // checksum de un ledger que sobrevivió en la cookie deja de cerrar — eso
    // hacía que TODO se leyera como "manipulado" (0 usos en todas las tarjetas)
    // con solo limpiar localStorage, sin que hiciera falta tocar nada del ledger
    // en sí. Con la semilla también en cookie, sobrevive mientras sobreviva
    // cualquiera de los dos storages.
    function _deviceSeed() {
        let s = null;
        try { s = localStorage.getItem(SEED_KEY); } catch (_) { s = null; }
        const sCookie = _getCookie(SEED_COOKIE);
        if (!s && sCookie) s = sCookie;         // localStorage se limpió, la cookie sobrevivió
        if (s && !sCookie) _setCookie(SEED_COOKIE, s); // cookie se limpió, localStorage sobrevivió: resincroniza
        if (!s) {
            s = Math.random().toString(36).slice(2) + Date.now().toString(36);
            try { localStorage.setItem(SEED_KEY, s); } catch (_) {}
            _setCookie(SEED_COOKIE, s);
        } else {
            try { localStorage.setItem(SEED_KEY, s); } catch (_) {} // resincroniza el que faltaba
        }
        return s;
    }
    function _checksum(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
        return (h >>> 0).toString(36);
    }
    function _getCookie(nombre) {
        const m = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }
    function _setCookie(nombre, valor) {
        const unAnio = 365 * 24 * 60 * 60;
        document.cookie = `${nombre}=${encodeURIComponent(valor)}; max-age=${unAnio}; path=/; SameSite=Lax`;
    }
    function _decodificarYValidar(raw) {
        try {
            const decoded = JSON.parse(atob(raw));
            if (!decoded || typeof decoded !== 'object' || !decoded.d || !decoded.c) return null;
            if (_checksum(JSON.stringify(decoded.d) + _deviceSeed()) !== decoded.c) return null;
            return decoded.d;
        } catch (_) { return null; }
    }
    // Devuelve { modo: usosConsumidos }. Reglas:
    //  - Ninguna copia existe (primera vez / limpieza total) => {} => 2 usos gratis.
    //  - Las dos copias existen y decodifican igual => se usa ese valor.
    //  - Solo UNA copia existe (la otra se limpió a mano, ej. localStorage.clear()
    //    sin tocar cookies) => NO se trata como manipulación: se confía en la
    //    copia que sobrevivió (es la real, y es tan o más restrictiva que
    //    "recién empezado") y se resincroniza la que falta.
    //  - Las dos existen pero decodifican distinto, o el checksum de la que se usa
    //    no cierra (contenido tocado a mano) => ahí sí, fail closed: null (0 usos
    //    para todo).
    function _leerLedgerLocal() {
        let raw = null;
        try { raw = localStorage.getItem(LEDGER_KEY); } catch (_) { raw = null; }
        const rawCookie = _getCookie(LEDGER_COOKIE);
        if (!raw && !rawCookie) return {};
        if (raw && rawCookie && raw === rawCookie) {
            const d = _decodificarYValidar(raw);
            return d === null ? null : d;
        }
        if (raw && !rawCookie) {
            const d = _decodificarYValidar(raw);
            if (d === null) return null;
            _setCookie(LEDGER_COOKIE, raw); // resincroniza la copia que falta
            return d;
        }
        if (!raw && rawCookie) {
            const d = _decodificarYValidar(rawCookie);
            if (d === null) return null;
            try { localStorage.setItem(LEDGER_KEY, rawCookie); } catch (_) {}
            return d;
        }
        // Las dos existen pero NO coinciden entre sí: valor distinto en cada lado,
        // eso sí es indicio real de edición manual => fail closed.
        return null;
    }
    function _guardarLedgerLocal(d) {
        const payload = { d, c: _checksum(JSON.stringify(d) + _deviceSeed()) };
        const raw = btoa(JSON.stringify(payload));
        try { localStorage.setItem(LEDGER_KEY, raw); } catch (_) {}
        _setCookie(LEDGER_COOKIE, raw);
    }
    // Usos restantes SIN tocar la red — lectura instantánea para pintar tarjetas
    // (badge del Paso 2 en examen.html) sin esperar ninguna RPC. Estado limpio /
    // primera vez => LIMITE_GRATIS (2), nunca 0 ni null.
    function _restantesLocal(mod) {
        const reg = _leerLedgerLocal();
        if (reg === null) return 0;
        return Math.max(0, LIMITE_GRATIS - (reg[mod] || 0));
    }
    function _consumirLocal(mod) {
        const reg = _leerLedgerLocal();
        if (reg === null) return 0;
        reg[mod] = (reg[mod] || 0) + 1;
        _guardarLedgerLocal(reg);
        return Math.max(0, LIMITE_GRATIS - reg[mod]);
    }
    // Alinea el ledger local al valor real que devolvió el servidor (fuente de
    // verdad cuando responde bien) — por ejemplo si el alumno ya gastó usos
    // desde otro dispositivo.
    function _sincronizarLocal(mod, restantesServidor) {
        if (typeof restantesServidor !== 'number' || !isFinite(restantesServidor)) return;
        const reg = _leerLedgerLocal();
        if (reg === null) return; // no reescribimos un ledger marcado como manipulado
        reg[mod] = Math.max(0, LIMITE_GRATIS - Math.max(0, Math.min(LIMITE_GRATIS, restantesServidor)));
        _guardarLedgerLocal(reg);
    }
    // Reset completo del candado local (ledger + semilla de dispositivo, en
    // localStorage Y en cookies) — para pruebas manuales desde la consola:
    //   NikaAcceso.resetearUsosLocal()
    // Deja los 5 simuladores con IA en 2/2 usos gratis de nuevo, en este navegador.
    function resetearUsosLocal() {
        try { localStorage.removeItem(LEDGER_KEY); } catch (_) {}
        try { localStorage.removeItem(SEED_KEY); } catch (_) {}
        _setCookie(LEDGER_COOKIE, '');
        _setCookie(SEED_COOKIE, '');
        document.cookie = `${LEDGER_COOKIE}=; max-age=0; path=/;`;
        document.cookie = `${SEED_COOKIE}=; max-age=0; path=/;`;
        console.info('[NikaAcceso] Candado local reseteado: 2/2 usos gratis en todos los simuladores.');
    }

    // ------------------------------------------------------------
    // 1. Estado de la cuenta (lectura rápida desde el caché local)
    // ------------------------------------------------------------
    function _usuario() {
        try { return JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) { return null; }
    }
    function estaLogueado() { return !!_usuario(); }
    function tipoCuenta() { const u = _usuario(); return String((u && u.tipo_cuenta) || 'free').toLowerCase(); }
    function esVip() { const t = tipoCuenta(); return t === 'vip' || t === 'premium'; }

    // ------------------------------------------------------------
    // FIX FUGA DE ROLES: `nika_currentUser` en localStorage es solo un caché de
    // lectura rápida para pintar la UI. NO es confiable como única fuente para
    // otorgar acceso ilimitado: en cualquier dispositivo donde antes se haya
    // probado una cuenta vip/premium/admin (común en QA), ese rastro puede
    // quedar pegado en localStorage y nunca se borra automáticamente al
    // cambiar de cuenta. Si `tieneAccesoCompleto()` confiara en esa caché sin
    // más, un estudiante logueado en ese mismo navegador heredaría el pase
    // libre de la cuenta anterior — que es exactamente el bug reportado
    // ("cuenta VIP/premium/admin, ilimitado" para un estudiante común).
    //
    // Regla nueva: el acceso completo SOLO puede ser `true` una vez que el
    // SERVIDOR lo confirmó en esta carga de página (vía refrescarPerfil() o
    // _leerUsos(), ambas llaman a Supabase). Hasta que eso pase,
    // tieneAccesoCompleto() devuelve `false` por defecto — que es el estado
    // seguro (trata al usuario como free/limitado), nunca al revés. Ver el
    // auto-refresh al final de esta sección, que dispara la confirmación en
    // cuanto NikaAuth.ready resuelve, sin depender de que algún otro código
    // llame primero a gateTab()/verificarVipFresco().
    // ------------------------------------------------------------
    let _perfilVerificado = false;
    function tieneAccesoCompleto() {
        if (!_perfilVerificado) return false; // sin confirmación del servidor todavía -> nunca privilegiado
        const u = _usuario();
        // Comparación case-insensitive, igual que el servidor (las funciones SQL
        // usan lower(coalesce(role::text,'')) = 'admin'). Si acá se comparaba
        // exacto ('admin' vs 'Admin'/'ADMIN'), una cuenta admin real quedaba
        // tratada como free en el cliente aunque el servidor la reconociera bien.
        return esVip() || String((u && u.role) || '').toLowerCase() === 'admin';
    }

    function _guardarEnCache(parcial) {
        try {
            const u = _usuario();
            if (!u) return;
            localStorage.setItem('nika_currentUser', JSON.stringify({ ...u, ...parcial }));
        } catch (_) {}
    }

    async function _client() {
        if (!window.NikaSupabase) return null;
        try { await window.NikaSupabase.ready; } catch (_) { return null; }
        return window.NikaSupabase.client || null;
    }

    // Trae el plan ACTUAL desde la base (el caché puede estar viejo: p. ej. el usuario
    // acaba de pagar en otra pestaña y todavía figura como free).
    let _refrescando = null;
    function refrescarPerfil() {
        if (_refrescando) return _refrescando;
        _refrescando = (async () => {
            try {
                const c = await _client();
                if (!c) return null;
                const { data: { session } } = await c.auth.getSession();
                if (!session) return null;
                const { data, error } = await c.from('profiles').select('tipo_cuenta, role').eq('id', session.user.id).maybeSingle();
                if (error || !data) return null;
                // Reemplaza (no mezcla) tipo_cuenta/role con lo que respondió el
                // servidor para ESTA cuenta, y recién acá se habilita
                // tieneAccesoCompleto() a devolver true si corresponde.
                _guardarEnCache({ tipo_cuenta: data.tipo_cuenta || 'free', role: data.role || null });
                _perfilVerificado = true;
                _notificarVerificacion();
                return data;
            } catch (_) {
                return null;
            } finally {
                _refrescando = null; // solo se deduplican pedidos SIMULTÁNEOS; un reintento siempre consulta de nuevo
            }
        })();
        return _refrescando;
    }

    async function verificarVipFresco() {
        await refrescarPerfil();
        return tieneAccesoCompleto();
    }

    // ------------------------------------------------------------
    // Fuente de verdad ÚNICA para "¿este usuario ve el muro de pago?", pensada
    // para que CUALQUIER página (examen.html incluida) delegue acá en vez de
    // mantener su propia copia de la lógica de rol contra localStorage — que es
    // justo lo que causaba la fuga original. Mismo default seguro que
    // tieneAccesoCompleto(): antes de la confirmación del servidor, free=true.
    // ------------------------------------------------------------
    function esUsuarioFree() { return !tieneAccesoCompleto(); }

    // Notifica a quien se suscribió cuando _perfilVerificado pasa a true (o ya
    // lo esté). Sirve para que una página que ya pintó su UI con el default
    // seguro (free) la vuelva a pintar en cuanto confirme el servidor — evita
    // que un usuario VIP genuino vea el muro de pago "flashear" un instante.
    const _callbacksVerificacion = [];
    function alVerificarPerfil(cb) {
        if (typeof cb !== 'function') return;
        if (_perfilVerificado) { cb(); return; }
        _callbacksVerificacion.push(cb);
    }
    function _notificarVerificacion() {
        const copia = _callbacksVerificacion.splice(0);
        copia.forEach((cb) => { try { cb(); } catch (e) { console.error('[NikaAcceso] callback alVerificarPerfil falló:', e); } });
    }

    // Dispara la confirmación de servidor apenas hay sesión, SIN esperar a que
    // algún otro módulo llame gateTab()/verificarVipFresco() primero. auth-guard.js
    // puede cargarse dinámicamente (ver sus propios comentarios) y no siempre
    // termina de correr antes que este script: chequear window.NikaAuth una
    // única vez y de forma sincrónica podía caer justo antes de que existiera,
    // dejando el auto-refresh muerto para el resto de la página (el perfil
    // solo se confirmaba si alguien llamaba refrescarPerfil()/obtenerUsos() a
    // mano, nunca solo). Por eso ahora reintenta con un pequeño polling en vez
    // de un único chequeo.
    (function _esperarNikaAuthYVerificar(intentos) {
        intentos = intentos || 0;
        if (window.NikaAuth && window.NikaAuth.ready && typeof window.NikaAuth.ready.then === 'function') {
            window.NikaAuth.ready.then((userId) => { if (userId) refrescarPerfil(); });
            return;
        }
        if (intentos > 100) { // ~10s a 100ms: si para entonces no apareció, algo más grave está roto (auth-guard.js no cargó)
            console.warn('[NikaAcceso] window.NikaAuth nunca apareció; no se pudo auto-verificar el perfil al cargar la página.');
            return;
        }
        setTimeout(() => _esperarNikaAuthYVerificar(intentos + 1), 100);
    })();

    // ------------------------------------------------------------
    // 2. Simuladores de IA — llamadas al servidor
    // ------------------------------------------------------------
    // Estado del usuario (solo lectura): { tipo_cuenta, ilimitado, limite, usos: {escrito: 1, ...} }
    async function obtenerUsos() {
        const { data, error } = await _leerUsos();
        if (error) { console.warn('[NikaAcceso] simulador_usos:', error.message || error); return null; }
        return data;
    }

    // Diagnóstico: dejá esto en `true` mientras estás debuggeando el límite de usos
    // gratis; podés apagarlo (false) para producción sin tocar nada más.
    const NIKA_DEBUG_USOS = true;
    function _log(...args) { if (NIKA_DEBUG_USOS) console.log('[NikaAcceso:usos]', ...args); }

    // Verifica Y descuenta 1 uso, de forma atómica en el servidor.
    // Firma real y ÚNICA de la función en Supabase:
    //   consumir_uso_simulador(p_simulador text) RETURNS jsonb
    // (la vieja consumir_uso_simulador(p_user_id uuid, p_modo text, p_limite int)
    // RETURNS boolean, que leía otra tabla aparte — usos_gratis_simulador — y no
    // respetaba VIP/premium/admin, ya se borró de la base; si volvés a ver acá
    // un 404 "Could not find the function ... in the schema cache", es señal de
    // que alguien la volvió a crear, no de que este código esté mal).
    // El usuario sale de la sesión activa (auth.uid() del lado del servidor),
    // NUNCA se manda desde el cliente.
    // Devuelve { permitido, ilimitado, usos, limite, restantes } o { error }.
    async function consumirUso(mod) {
        const c = await _client();
        if (!c) return { error: new Error('sin_cliente') };
        const params = { p_simulador: mod };
        _log('llamando RPC consumir_uso_simulador con params:', params);
        const resp = await c.rpc('consumir_uso_simulador', params);
        // resp trae { data, error, status, statusText, count } — los logueamos
        // TAL CUAL vinieron, sin filtrar nada, para poder ver la razón exacta.
        _log('RPC consumir_uso_simulador respondió — status:', resp.status, '| data:', resp.data, '| error:', resp.error);
        if (resp.error) return { error: resp.error };
        // Defensivo: la función actual devuelve jsonb ({ permitido, ilimitado,
        // usos, limite, restantes }), pero si el día de mañana alguien la vuelve
        // a cambiar a boolean plano, esto evita el bug silencioso de antes
        // (acceder a `true.permitido` da `undefined` sin tirar error en JS).
        if (typeof resp.data === 'boolean') {
            _log(`la RPC devolvió un booleano plano (${resp.data}) — se normaliza a { permitido: ${resp.data} }`);
            return { permitido: resp.data };
        }
        return resp.data;
    }

    const _sinSesion = (err) => /not_authenticated|jwt|401|28000/i.test(String((err && (err.message || err.code)) || ''));

    // Lectura con el error a la vista (para distinguir "sesión vencida" de "servidor caído").
    async function _leerUsos() {
        const c = await _client();
        if (!c) return { error: new Error('sin_cliente') };
        const { data, error } = await c.rpc('simulador_usos');
        if (error || !data) return { error: error || new Error('sin_datos') };
        if (data.tipo_cuenta) _guardarEnCache({ tipo_cuenta: data.tipo_cuenta, role: data.role || null });
        // Esta RPC también corre contra el usuario autenticado en el servidor:
        // cuenta como confirmación válida para desbloquear tieneAccesoCompleto().
        _perfilVerificado = true;
        _notificarVerificacion();
        return { data };
    }

    // ------------------------------------------------------------
    // 3. Abrir un simulador desde el campus (grilla, hub y sidebar): SOLO CONSULTA
    // ------------------------------------------------------------
    // No descuenta nada: entrar a examen.html no es empezar una simulación (todavía hay que
    // elegir modalidad, temática, etc.). Si ya no quedan usos, se frena acá con el modal
    // promocional para no hacerle perder el viaje al alumno. El descuento real ocurre en
    // iniciarSimulacion().
    let _enCurso = false;
    async function abrirSimulador(mod) {
        const meta = SIMULADORES[mod];
        if (!meta) return;
        if (!meta.ia) { _ir(urlSimulador(mod)); return; } // Choice: libre e ilimitado

        if (!estaLogueado()) {
            avisar('Iniciá sesión para usar los simuladores con IA.');
            if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
            return;
        }
        if (_enCurso) return;
        _enCurso = true;
        document.body.style.cursor = 'progress';
        try {
            const { data, error } = await _leerUsos();
            if (error) {
                if (_sinSesion(error)) {
                    avisar('Tu sesión expiró. Iniciá sesión de nuevo.');
                    if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
                    return;
                }
                // Falla de red / SQL sin desplegar: no castigamos al alumno; el candado real está en iniciarSimulacion().
                console.warn('[NikaAcceso] No se pudieron consultar los cupos; se deja pasar:', error.message || error);
                _ir(urlSimulador(mod));
                return;
            }
            const usados = parseInt((data.usos || {})[mod], 10) || 0;
            if (!data.ilimitado && usados >= (data.limite || LIMITE_GRATIS)) { cerrarModal(); mostrarModalLimite(mod); return; }
            _ir(urlSimulador(mod));
        } finally {
            _enCurso = false;
            document.body.style.cursor = '';
        }
    }

    // ------------------------------------------------------------
    // 3.b Candado REAL — para examen.html: se llama cuando una simulación de IA nueva arranca.
    //     Descuenta 1 uso de forma INMEDIATA y GARANTIZADA en el ledger local (antes de
    //     tocar la red), y además intenta sincronizar con el servidor (fuente de verdad
    //     cuando responde). Un error de red o de la RPC (SQL sin desplegar, tipos, etc.)
    //     ya NO regala usos: el candado local ya se aplicó, pase lo que pase con la RPC.
    //     Devuelve true si puede empezar; false si no (ya se mostró el modal promocional).
    //     No se llama al restaurar un caso guardado, al reintentar un turno ni en Choice.
    // ------------------------------------------------------------
    let _iniciando = false;
    async function iniciarSimulacion(mod) {
        const meta = SIMULADORES[mod];
        _log('iniciarSimulacion() llamada con modo:', mod, '| meta:', meta);
        if (!meta || !meta.ia) { _log('decisión: true (modo sin IA o inexistente, sin límite)'); return true; }
        if (tieneAccesoCompleto()) { _log('decisión: true (cuenta VIP/premium/admin, ilimitado)'); return true; }
        if (_iniciando) { _log('decisión: false (doble clic — ya hay una simulación iniciándose)'); return false; }
        _iniciando = true;
        document.body.style.cursor = 'progress';
        try {
            // 1) Candado local, resuelto ANTES de tocar la red y ANTES de exigir sesión:
            //    los 2 usos de cortesía son del DISPOSITIVO, no de la cuenta — un alumno
            //    sin sesión iniciada todavía puede gastarlos. Si ya no quedan, ahí sí se
            //    corta (y recién ahí, si además no hay sesión, hace falta loguearse para
            //    poder pasar a NikaMed+).
            const restantesLocalAntes = _restantesLocal(mod);
            _log(`candado local para "${mod}" ANTES de la RPC: ${restantesLocalAntes} uso(s) restante(s) (límite ${LIMITE_GRATIS})`);
            if (restantesLocalAntes <= 0) {
                _log('decisión: false (candado LOCAL ya en 0 — ni se llama a la RPC)');
                cerrarModal();
                if (!estaLogueado()) { avisar('Iniciá sesión para seguir usando los simuladores con IA.'); return false; }
                mostrarModalLimite(mod);
                return false;
            }
            // 2) Descuento INMEDIATO Y OBLIGATORIO en el mismo tick del clic — es la
            //    garantía real de "2 clics = 2 usos gastados", independiente de
            //    cuánto tarde o si falla la llamada asíncrona al servidor.
            const restantesLocalPost = _consumirLocal(mod);
            _log(`candado local descontado: ahora ${restantesLocalPost} uso(s) restante(s) para "${mod}" (antes de confirmar con el servidor)`);

            // 3) Sin sesión iniciada no hay a quién consultarle al servidor (la RPC
            //    necesita un usuario autenticado): la cortesía se resuelve 100% con el
            //    candado local recién aplicado arriba, y se sigue de largo.
            if (!estaLogueado()) { _log('decisión: true (sin sesión — cortesía resuelta 100% local)'); return true; }

            // 4) Con sesión: mejor esfuerzo para sincronizar con el servidor. Si responde
            //    bien, es la autoridad (por ejemplo el alumno ya gastó usos desde otro
            //    dispositivo) y se alinea el ledger local a su valor real. Si falla por
            //    red/SQL, NO se revierte el descuento local del paso 2 — eso es
            //    justamente lo que evita que un error "regale" intentos infinitos.
            const r = await consumirUso(mod);
            if (r && r.error) {
                if (_sinSesion(r.error)) {
                    _log('decisión: true (la RPC dice que la sesión expiró; se respeta igual el candado local, no se le hace perder el uso)');
                    avisar('Tu sesión expiró. Iniciá sesión de nuevo.');
                    return true;
                }
                _log('decisión: true (la RPC falló — red/SQL sin desplegar/etc. — se respeta el candado local ya aplicado). Error completo:', r.error);
                console.warn('[NikaAcceso] No se pudo confirmar el uso con el servidor; se respeta el candado local:', r.error.message || r.error);
                return true; // el candado local del paso 1/2 ya hizo su trabajo
            }
            _log('respuesta completa de la RPC (data):', r);
            if (typeof r.restantes === 'number') {
                _log(`sincronizando candado local al valor del servidor: restantes=${r.restantes}`);
                _sincronizarLocal(mod, r.restantes);
            }
            if (!r.permitido) {
                _log(`decisión: false — la RPC del SERVIDOR dice permitido=false para "${mod}" (r.usos=${JSON.stringify(r.usos)}, r.limite=${r.limite}, r.restantes=${r.restantes}, r.ilimitado=${r.ilimitado}). Esto significa que, según el registro real en Supabase, esta cuenta YA CONSUMIÓ sus usos gratis de este simulador (posiblemente en una prueba anterior a este fix, cuando el gateo se disparaba 2 veces por clic) — el candado local por sí solo no puede "inventar" usos que el servidor no tiene registrados.`);
                cerrarModal();
                mostrarModalLimite(mod);
                return false;
            }
            _log('decisión: true (RPC permitido=true)');
            return true;
        } finally {
            _iniciando = false;
            document.body.style.cursor = '';
        }
    }

    // ------------------------------------------------------------
    // 4. Herramientas exclusivas (pestañas / botones con candado)
    // ------------------------------------------------------------
    async function gateTab(elemento, feature, abrir) {
        if (tieneAccesoCompleto()) { abrir(); return; }
        const v = await verificarVipFresco(); // ¿pagó hace un momento?
        if (v) { aplicarEstadoVip(); abrir(); return; }
        mostrarModalSoloVip(feature);
    }

    // ------------------------------------------------------------
    // 5. Distintivo visual NikaMed+
    // ------------------------------------------------------------
    function badgeHTML() { return '<span class="nika-vip-badge" title="Cuenta NikaMed+">✨ NikaMed+</span>'; }

    function aplicarEstadoVip() {
        if (!document.body) return;
        document.body.classList.toggle('nika-vip', esVip());
        document.querySelectorAll('[data-vip-tab]').forEach((el) => el.classList.toggle('is-unlocked', tieneAccesoCompleto()));
    }

    // ------------------------------------------------------------
    // 6. Hub de Simuladores: pinta los badges de uso de cada tarjeta
    // ------------------------------------------------------------
    function pintarHub(root, info) {
        if (!root) return;
        const logueado = estaLogueado();
        const ilimitado = info ? !!info.ilimitado : tieneAccesoCompleto();
        const limite = (info && info.limite) || LIMITE_GRATIS;
        const usos = (info && info.usos) || {};

        root.querySelectorAll('[data-sim]').forEach((el) => {
            const mod = el.getAttribute('data-sim');
            const meta = SIMULADORES[mod];
            const badge = el.querySelector('.sim-hub-badge');
            if (!meta || !badge) return;
            let texto = `${limite} usos gratis`, clase = 'is-free', bloqueado = false;
            if (!meta.ia) { texto = 'Gratis · ilimitado'; }
            else if (ilimitado) { texto = 'NikaMed+ · ilimitado'; clase = 'is-vip'; }
            else if (logueado && info) {
                const restantes = Math.max(0, limite - (parseInt(usos[mod], 10) || 0));
                if (restantes <= 0) { texto = 'Agotado · requiere NikaMed+'; clase = 'is-out'; bloqueado = true; }
                else if (restantes < limite) { texto = `Te ${restantes === 1 ? 'queda 1 uso' : `quedan ${restantes} usos`}`; clase = 'is-warn'; }
            }
            badge.textContent = texto;
            badge.className = `sim-hub-badge ${clase}`;
            el.classList.toggle('is-locked', bloqueado);
        });

        const plan = root.querySelector('[data-sim-plan]');
        if (plan) plan.style.display = ilimitado ? 'none' : '';
    }

    // ------------------------------------------------------------
    // 6.b Candados visuales genéricos, reusables en cualquier página que no
    //     tenga su propio render de tarjetas (a diferencia de examen.html, que
    //     arma su grid a partir de EXAM_MODES_CONFIG y debe delegar en
    //     esUsuarioFree() en vez de usar esto — ver notas del Paso 1).
    //     - Si `root` tiene elementos [data-sim] (hub de simuladores), pinta
    //       sus badges con la misma lógica que pintarHub().
    //     - Cualquier elemento [data-nika-premium] recibe la clase
    //       .nika-locked mientras el usuario sea free (según esUsuarioFree()).
    // ------------------------------------------------------------
    async function renderizarEstadoPaywall(root) {
        root = root || document;
        if (root.querySelectorAll('[data-sim]').length) {
            const info = await obtenerUsos();
            pintarHub(root, info);
        }
        const free = esUsuarioFree();
        root.querySelectorAll('[data-nika-premium]').forEach((el) => {
            el.classList.toggle('nika-locked', free);
        });
        aplicarEstadoVip();
    }

    // ------------------------------------------------------------
    // 7. Modales (autocontenidos: funcionan en cualquier página)
    // ------------------------------------------------------------
    function _inyectarCss() {
        if (document.getElementById('nika-acceso-css')) return;
        const style = document.createElement('style');
        style.id = 'nika-acceso-css';
        style.textContent = `
            .nika-acceso-overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(2,6,23,0.72); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 18px; animation: nikaAccesoFade .18s ease; }
            .nika-acceso-card { position: relative; width: 100%; max-width: 420px; background: var(--card-bg, #fff); color: var(--text-main, #0f172a); border: 1px solid rgba(192,132,252,0.55); border-radius: 18px; padding: 30px 26px 24px; text-align: center; box-shadow: 0 0 0 1px rgba(168,85,247,0.25), 0 30px 60px -12px rgba(76,29,149,0.55), 0 0 42px -8px rgba(168,85,247,0.55); font-family: inherit; overflow: hidden; }
            .nika-acceso-card::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, #7e22ce, #a855f7, #c084fc); }
            .nika-acceso-ico { font-size: 2.4rem; margin-bottom: 6px; }
            .nika-acceso-tag { display: inline-block; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.5px; color: #fff; background: linear-gradient(135deg, #a855f7, #c084fc); padding: 3px 11px; border-radius: 999px; margin-bottom: 12px; box-shadow: 0 0 12px rgba(168,85,247,0.5); }
            .nika-acceso-card h3 { font-size: 1.15rem; font-weight: 800; margin: 0 0 10px; color: var(--text-main, #0f172a); }
            .nika-acceso-card p { font-size: 0.92rem; line-height: 1.5; margin: 0 0 20px; color: var(--text-muted, #475569); }
            .nika-acceso-actions { display: flex; gap: 10px; flex-direction: column-reverse; }
            @media (min-width: 460px) { .nika-acceso-actions { flex-direction: row; } .nika-acceso-actions .nika-acceso-btn { flex: 1; } }
            .nika-acceso-btn { border: none; border-radius: 10px; padding: 12px 16px; font-weight: 800; font-size: 0.88rem; cursor: pointer; font-family: inherit; transition: transform .15s, box-shadow .15s; }
            .nika-acceso-btn:hover { transform: translateY(-1px); }
            .nika-acceso-btn--cta { background: linear-gradient(135deg, #7e22ce, #a855f7 60%, #c084fc); color: #fff; box-shadow: 0 8px 20px -6px rgba(168,85,247,0.65); }
            .nika-acceso-btn--sec { background: transparent; color: var(--text-muted, #475569); border: 1px solid var(--border, #e2e8f0); }
            @keyframes nikaAccesoFade { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    let _modalEl = null;

    function cerrarModal() {
        if (_modalEl) { _modalEl.remove(); _modalEl = null; }
        document.removeEventListener('keydown', _onTecla);
    }
    function _onTecla(e) { if (e.key === 'Escape' && _modalEl && !_modalEl.dataset.bloqueante) cerrarModal(); }

    function _mostrarModal({ icono, titulo, mensaje, cta, secundario, bloqueante }) {
        _inyectarCss();
        cerrarModal();
        const ov = document.createElement('div');
        ov.className = 'nika-acceso-overlay';
        if (bloqueante) ov.dataset.bloqueante = '1';
        ov.innerHTML = `
            <div class="nika-acceso-card" role="dialog" aria-modal="true" aria-labelledby="nika-acceso-titulo">
                <div class="nika-acceso-ico">${icono}</div>
                <span class="nika-acceso-tag">✨ NikaMed+</span>
                <h3 id="nika-acceso-titulo">${esc(titulo)}</h3>
                <p>${esc(mensaje)}</p>
                <div class="nika-acceso-actions">
                    <button type="button" class="nika-acceso-btn nika-acceso-btn--sec" data-act="sec">${esc(secundario.texto)}</button>
                    <button type="button" class="nika-acceso-btn nika-acceso-btn--cta" data-act="cta">${esc(cta)}</button>
                </div>
            </div>`;
        document.body.appendChild(ov);
        _modalEl = ov;
        ov.querySelector('[data-act="cta"]').addEventListener('click', () => { _ir(URL_PLAN); });
        ov.querySelector('[data-act="sec"]').addEventListener('click', () => { if (secundario.alHacerClic) secundario.alHacerClic(); else cerrarModal(); });
        if (!bloqueante) ov.addEventListener('click', (e) => { if (e.target === ov) cerrarModal(); });
        document.addEventListener('keydown', _onTecla);
        ov.querySelector('[data-act="cta"]').focus();
    }

    // Límite de usos gratuitos alcanzado. (opts.bloqueante = no se puede cerrar; hoy no se usa.)
    function mostrarModalLimite(mod, opts) {
        const bloqueante = !!(opts && opts.bloqueante);
        const meta = SIMULADORES[mod];
        _mostrarModal({
            icono: '🔒',
            titulo: meta ? `${meta.titulo}: sin usos gratuitos` : 'Sin usos gratuitos',
            mensaje: `Alcanzaste el límite de ${LIMITE_GRATIS} simulaciones gratuitas. Suscribite a NikaMed+ para entrenar sin límites.`,
            cta: 'Conocer NikaMed+',
            secundario: bloqueante
                ? { texto: 'Volver al campus', alHacerClic: () => { _ir(URL_CAMPUS); } }
                : { texto: 'Ahora no' },
            bloqueante,
        });
    }

    // Herramienta exclusiva para miembros NikaMed+ (p. ej. 'asistente').
    function mostrarModalSoloVip(feature) {
        const f = FUNCIONES_VIP[feature] || { nombre: 'Esta herramienta' };
        _mostrarModal({
            icono: '🔒',
            titulo: f.nombre,
            mensaje: `${f.nombre} es una herramienta exclusiva para miembros NikaMed+. Suscribite para desbloquearla y estudiar sin límites.`,
            cta: 'Conocer NikaMed+',
            secundario: { texto: 'Ahora no' },
        });
    }

    // ------------------------------------------------------------
    // Export
    // ------------------------------------------------------------
    window.NikaAcceso = {
        LIMITE_GRATIS, SIMULADORES,
        // estado de cuenta
        estaLogueado, tipoCuenta, esVip, tieneAccesoCompleto, refrescarPerfil, verificarVipFresco,
        esUsuarioFree, alVerificarPerfil,
        // simuladores
        obtenerUsos, consumirUso, abrirSimulador, iniciarSimulacion, pintarHub, renderizarEstadoPaywall,
        // candado local (lectura instantánea, sin red — usado por examen.html para pintar el Paso 2)
        usosRestantesLocal: _restantesLocal,
        // reset manual para pruebas: NikaAcceso.resetearUsosLocal() en la consola
        resetearUsosLocal,
        // herramientas exclusivas
        gateTab, mostrarModalLimite, mostrarModalSoloVip, cerrarModal,
        // visual
        badgeHTML, aplicarEstadoVip,
        __setNavegador(fn) { _navegar = fn; }, // solo para pruebas automáticas
    };
})();
