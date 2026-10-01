/**
 * ============================================================
 * CAMPUS NIKA — Feature 5: Chat Privado + Compartir Pregunta
 * chatManager.js
 * ------------------------------------------------------------
 * Responsabilidad: mensajería directa 1 a 1 entre amigos
 * (persistida en `private_messages`) con Realtime, más el
 * envío de "tarjetas de pregunta" para debatir un caso del
 * banco/simulacro directamente en el chat.
 *
 * Depende de: window.NikaSupabase (supabaseClient.js)
 * Patrón calcado de notificacionesManager.js / duelosManager.js
 * para no romper convenciones ya usadas en el proyecto.
 *
 * Tabla esperada (crear en Supabase, ver chat_schema.sql):
 *   private_messages (
 *     id uuid pk default gen_random_uuid(),
 *     from_username text not null,
 *     to_username text not null,
 *     content text,               -- null si el mensaje es solo una pregunta compartida
 *     shared_question jsonb,     -- { id, up, q, options } cuando se comparte una pregunta
 *     created_at timestamptz default now(),
 *     read_at timestamptz
 *   )
 * ============================================================
 */

const ChatManager = (function () {
    const sb = () => window.NikaSupabase.client;

    // channelName determinístico: siempre el mismo sin importar quién
    // de los dos abre el chat primero (usernames ordenados alfabéticamente).
    function _canalPara(userA, userB) {
        const [a, b] = [userA, userB].sort();
        return `dm_${a}__${b}`;
    }

    // ------------------------------------------------------------
    // 0. Alerta sonora estilo MSN (Web Audio API, sin archivos mp3)
    //    Dos tonos cortos ascendentes ("bip-BIP") al recibir un mensaje
    //    de otra persona. Se crea un AudioContext por reproducción (más
    //    simple y evita quedarse con un contexto "suspended" por las
    //    políticas de autoplay del navegador).
    // ------------------------------------------------------------
    let _audioCtx = null;
    let _audioDesbloqueado = false;

    function _getAudioCtx() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            if (!_audioCtx || _audioCtx.state === 'closed') _audioCtx = new Ctx();
            return _audioCtx;
        } catch (_) { return null; }
    }

    // Los navegadores (sobre todo iOS/Chrome mobile) bloquean el audio hasta el primer gesto
    // del usuario: se crea/resume el contexto en el primer toque o tecla.
    function _desbloquearAudio() {
        if (_audioDesbloqueado) return;
        const ctx = _getAudioCtx();
        if (!ctx) return;
        ctx.resume().then(() => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            g.gain.value = 0.0001;
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.01); // "abre" el contexto en iOS
            _audioDesbloqueado = true;
            ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
                document.removeEventListener(ev, _desbloquearAudio, true));
        }).catch(() => {});
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
        document.addEventListener(ev, _desbloquearAudio, { capture: true, passive: true }));

    function _tono(ctx, freq, inicio, duracion, volumen) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio);
        // Ataque/decaimiento rápidos para que suene a "bip", no a un pitido plano
        gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
        gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + inicio + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracion);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + inicio);
        osc.stop(ctx.currentTime + inicio + duracion + 0.02);
    }

    function _reproducirSonidoMensaje() {
        try { window.dispatchEvent(new CustomEvent('nika:alerta-sonido')); } catch (_) {}
        const ctx = _getAudioCtx();
        if (!ctx) return;
        const tocar = () => {
            try {
                // Dos tonos cortos ascendentes, tipo notificación clásica de MSN Messenger
                _tono(ctx, 660, 0, 0.11, 0.16);   // primer bip (más grave)
                _tono(ctx, 880, 0.1, 0.14, 0.16); // segundo bip (más agudo)
                if (navigator.vibrate) navigator.vibrate(120); // "zumbido" físico en celular
            } catch (_) {}
        };
        if (ctx.state === 'running') tocar();
        else ctx.resume().then(tocar).catch(() => {});
    }

    let canalActivo = null;
    let conversacionActual = null; // username del amigo con el que estoy chateando
    let onMensaje = null;          // callback: (row) => void, para pintar burbujas
    let onListaChanged = null;     // callback: () => void, para refrescar bandeja/badges
    let onPresenciaCambio = null;  // callback: (enLinea: boolean) => void, para el header del chat
    let onLecturaCambio = null;    // callback: (friendUsername) => void, cuando el otro extremo lee mis mensajes
    let sonidoActivado = true;     // permite silenciar la alerta sonora desde afuera

    // ------------------------------------------------------------
    // 0b. Estado nuevo: presencia global, ticks y confirmaciones
    // ------------------------------------------------------------
    const CANAL_GLOBAL = "nika_global";
    const _norm = (u) => String(u || "").trim().toLowerCase();
    const _yo = () => window.NikaSupabase.getNikaCurrentUsername();

    let canalGlobal = null;
    let _promesaGlobal = null;
    let presenciaGlobal = new Set();
    let onPresenciaGlobal = null;
    // Suscriptores extra (la interfaz los registra apenas inicia sesión, sin abrir ningún chat):
    // se avisa a todos cuando cambian los no leídos o quién está conectado.
    const _escListaExtra = [], _escPresenciaExtra = [];
    let presenciaNombres = [];      // usernames tal como se conectaron (con sus mayúsculas)
    // Respaldo: quien dio señales de vida (latido a la base, NikaPresencia) en los últimos minutos figura "en línea"
    // aunque su pestaña esté en otra sección que no mantiene el canal de presencia, o Realtime tarde en sincronizar.
    let respaldoPresencia = new Set(), respaldoNombres = [], _timerRespaldo = null;
    function _notificarPresenciaExtra() {
        if (onPresenciaGlobal) { try { onPresenciaGlobal(new Set(presenciaGlobal)); } catch (_) {} }
        _escPresenciaExtra.forEach((f) => { try { f(new Set(presenciaGlobal)); } catch (e) { console.error(e); } });
        if (conversacionActual && onPresenciaCambio) { try { onPresenciaCambio(_amigoEnLinea(conversacionActual)); } catch (_) {} }
    }
    async function actualizarRespaldoPresencia() {
        const NF = window.NikaFriends, NP = window.NikaPresencia;
        if (!NF || !NP || !_yo()) return;
        try {
            const [amigos, mapa] = await Promise.all([NF.listFriends(), NP.ultimaVezAmigos()]);
            const nuevo = new Set(), nombres = [];
            amigos.forEach((a) => { if (NP.estaEnLinea(mapa[a.id])) { nuevo.add(_norm(a.username)); nombres.push(a.username); } });
            const cambio = nuevo.size !== respaldoPresencia.size || [...nuevo].some((u) => !respaldoPresencia.has(u));
            respaldoPresencia = nuevo; respaldoNombres = nombres;
            if (cambio) _notificarPresenciaExtra();
        } catch (_) { /* sin sesión o sin conexión: queda lo que diga Realtime */ }
    }

    function _avisarLista() { if (onListaChanged) { try { onListaChanged(); } catch (_) {} } _escListaExtra.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }
    let onEntregaCambio = null;     // (friendUsername, ids[]) => void
    let lecturaAutomatica = true;   // poné false desde la UI si el chat está minimizado
    let _visibilidadRegistrada = false;

    const RANGO = { sent: 1, delivered: 2, read: 3 };
    const estadosEntrega = new Map();  // id -> 'sent' | 'delivered' | 'read'
    const idsPorAmigo = new Map();     // amigo(norm) -> Set(ids de mis mensajes)
    const _idsEntrantes = new Set();
    const _idsPintados = new Set();

    function _suscribirYEsperar(canal, alSuscribir, ms = 8000) {
        return new Promise((resolve) => {
            const t = setTimeout(() => { console.warn('[ChatManager] Timeout suscribiendo', canal.topic); resolve(false); }, ms);
            canal.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    try { await alSuscribir(); } catch (_) {}
                    clearTimeout(t); resolve(true);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    clearTimeout(t); resolve(false);
                }
            });
        });
    }

    function _limpiarTopic(nombre) {
        try {
            const previo = sb().getChannels().find((c) => c.topic === `realtime:${nombre}`);
            if (previo) return sb().removeChannel(previo);
        } catch (_) {}
        return Promise.resolve();
    }

    // ---------- Presencia global (la que faltaba: el DM solo veía a quien tenía ESE chat abierto) ----------
    function _amigoEnLinea(friend) {
        const f = _norm(friend);
        if (presenciaGlobal.has(f) || respaldoPresencia.has(f)) return true;
        if (canalActivo && _norm(conversacionActual) === f) {
            return Object.keys(canalActivo.presenceState()).some((k) => _norm(k) === f);
        }
        return false;
    }

    function iniciarPresenciaGlobal() {
        if (!_yo()) return Promise.resolve();
        if (!_promesaGlobal) {
            _promesaGlobal = _iniciarPresenciaGlobal().catch((e) => {
                console.warn('[ChatManager] No se pudo iniciar la presencia global:', e);
                _promesaGlobal = null;
            });
        }
        return _promesaGlobal;
    }

    async function _iniciarPresenciaGlobal() {
        const username = _yo();
        await _limpiarTopic(CANAL_GLOBAL);

        const canal = sb().channel(CANAL_GLOBAL, {
            config: { broadcast: { self: false }, presence: { key: username } },
        });
        canalGlobal = canal;

        const refrescar = () => {
            presenciaNombres = Object.keys(canal.presenceState());
            presenciaGlobal = new Set(presenciaNombres.map(_norm));
            if (onPresenciaGlobal) onPresenciaGlobal(new Set(presenciaGlobal));
            _escPresenciaExtra.forEach((f) => { try { f(new Set(presenciaGlobal)); } catch (e) { console.error(e); } });
            if (conversacionActual && onPresenciaCambio) onPresenciaCambio(_amigoEnLinea(conversacionActual));
        };
        canal.on('presence', { event: 'sync' }, refrescar);
        canal.on('presence', { event: 'join' }, refrescar);
        canal.on('presence', { event: 'leave' }, refrescar);

        // Ping SIN contenido (solo ids): sonido/badge aunque el chat esté cerrado
        canal.on('broadcast', { event: 'dm_ping' }, ({ payload }) => _alRecibirMensaje(payload, 'ping'));
        canal.on('broadcast', { event: 'mensaje_recibido' }, ({ payload }) => _alRecibirEntrega(payload));
        canal.on('broadcast', { event: 'mensajes_leidos' }, ({ payload }) => _alRecibirLectura(payload));

        await _suscribirYEsperar(canal, async () => {
            await canal.track({ username, online_at: new Date().toISOString() });
            _confirmarPendientes(); // todo lo que llegó mientras estaba offline pasa a "recibido"
        });
        actualizarRespaldoPresencia();
        if (!_timerRespaldo) _timerRespaldo = setInterval(() => { if (!document.hidden) actualizarRespaldoPresencia(); }, 30000);

        // Respaldo: además del aviso del remitente (dm_ping), se escuchan los INSERT de mis mensajes en la base.
        // Si la tabla no tiene Realtime activado esto simplemente no hace nada (el aviso y el sondeo siguen).
        try {
            await _limpiarTopic('nika_inbox');
            sb().channel('nika_inbox')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `to_username=eq.${username}` },
                    (p) => { if (p && p.new) _alRecibirMensaje(p.new, 'dm'); })
                .subscribe();
        } catch (e) { console.warn('[ChatManager] Sin respaldo Realtime de mensajes:', e && e.message); }

        if (!_visibilidadRegistrada) {
            _visibilidadRegistrada = true;
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) return;
                if (canalGlobal && canalGlobal.state === 'joined') {
                    canalGlobal.track({ username: _yo(), online_at: new Date().toISOString() }).catch(() => {});
                }
                _confirmarPendientes();
                if (conversacionActual && lecturaAutomatica) marcarComoLeido(conversacionActual);
            });
        }
    }

    async function detenerPresenciaGlobal() {
        if (canalGlobal) {
            try { await canalGlobal.untrack(); } catch (_) {}
            try { await sb().removeChannel(canalGlobal); } catch (_) {}
        }
        canalGlobal = null; _promesaGlobal = null; presenciaGlobal = new Set();
    }

    function estaEnLinea(friend) { return _amigoEnLinea(friend); }

    // ---------- Ticks ----------
    const _SVG_1 = '<svg viewBox="0 0 18 12" aria-hidden="true"><path d="M1.5 6.5 5 10 12 2"/></svg>';
    const _SVG_2 = '<svg viewBox="0 0 18 12" aria-hidden="true"><path d="M1.5 6.5 5 10 12 2"/><path d="M6 6.5 9.5 10 16.5 2"/></svg>';

    function tickHTML(estado) {
        const e = RANGO[estado] ? estado : 'sent';
        const etiqueta = { sent: 'Enviado', delivered: 'Recibido', read: 'Leído' }[e];
        return `<span class="chat-bubble-tick tick-${e}" data-estado="${e}" title="${etiqueta}" aria-label="${etiqueta}">${e === 'sent' ? _SVG_1 : _SVG_2}</span>`;
    }

    function _subirEstado(id, nuevo) {
        const actual = estadosEntrega.get(id);
        if (!actual || RANGO[nuevo] > RANGO[actual]) { estadosEntrega.set(id, nuevo); return true; }
        return false;
    }

    function estadoDeEntrega(row) {
        let e = row.read_at ? 'read' : row.delivered_at ? 'delivered' : 'sent';
        const mem = estadosEntrega.get(row.id);
        if (mem && RANGO[mem] > RANGO[e]) e = mem;
        return e;
    }

    function _registrarEnviado(row) {
        if (!row || !row.id) return;
        const k = _norm(row.to_username);
        if (!idsPorAmigo.has(k)) idsPorAmigo.set(k, new Set());
        idsPorAmigo.get(k).add(row.id);
        _subirEstado(row.id, row.read_at ? 'read' : row.delivered_at ? 'delivered' : 'sent');
    }

    // Repinta el tick de una burbuja: requiere data-msg-id en el .chat-bubble
    function _pintarTick(id, estado) {
        let sel;
        try { sel = `[data-msg-id="${CSS.escape(String(id))}"] .chat-bubble-tick`; } catch (_) { return; }
        document.querySelectorAll(sel).forEach((el) => {
            if (el.dataset.estado === estado) return;
            const tpl = document.createElement('template');
            tpl.innerHTML = tickHTML(estado).trim();
            const nuevo = tpl.content.firstElementChild;
            nuevo.classList.add('tick-anim');
            el.replaceWith(nuevo);
        });
    }

    // Evento hacia el otro extremo: por el canal global y, si está abierto, por el DM
    async function _emitirEvento(friend, event, payload) {
        const envios = [];
        if (canalGlobal && canalGlobal.state === 'joined') {
            envios.push(canalGlobal.send({ type: 'broadcast', event, payload }));
        }
        if (canalActivo && canalActivo.state === 'joined' && _norm(conversacionActual) === _norm(friend)) {
            envios.push(canalActivo.send({ type: 'broadcast', event, payload }));
        }
        await Promise.allSettled(envios);
    }

    // ---------- Recepción (sonido + ✓✓ + lectura automática) ----------
    // ref: fila completa (canal DM) o { id, from_username, to_username } (ping global)
    async function _alRecibirMensaje(ref, origen) {
        const yo = _yo();
        if (!yo || !ref || !ref.id) return;
        // Solo mensajes ENTRANTES: nunca suena ni confirma si el remitente soy yo
        if (_norm(ref.to_username) !== _norm(yo) || _norm(ref.from_username) === _norm(yo)) return;

        if (!_idsEntrantes.has(ref.id)) {
            _idsEntrantes.add(ref.id);
            if (sonidoActivado) _reproducirSonidoMensaje();
            _confirmarRecepcion(ref);
        }

        if (_norm(conversacionActual) === _norm(ref.from_username) && !_idsPintados.has(ref.id)) {
            let fila = origen === 'dm' ? ref : null;
            if (!fila) {
                const { data } = await sb().from('private_messages').select('*').eq('id', ref.id).maybeSingle();
                fila = data;
            }
            if (fila && !_idsPintados.has(ref.id)) {
                _idsPintados.add(ref.id);
                if (onMensaje) { try { onMensaje(fila); } catch (e) { console.error(e); } }
            }
            if (lecturaAutomatica && !document.hidden) marcarComoLeido(ref.from_username);
        }
        _avisarLista();
    }

    async function _confirmarRecepcion(ref) {
        const yo = _yo();
        _emitirEvento(ref.from_username, 'mensaje_recibido', { receiver: yo, owner: ref.from_username, ids: [ref.id] });
        try {
            await sb().from('private_messages')
                .update({ delivered_at: new Date().toISOString() })
                .eq('id', ref.id).is('delivered_at', null);
        } catch (_) {}
    }

    async function _confirmarPendientes() {
        const yo = _yo();
        if (!yo) return;
        const { data, error } = await sb().from('private_messages')
            .update({ delivered_at: new Date().toISOString() })
            .eq('to_username', yo).is('delivered_at', null)
            .select('id, from_username');
        if (error || !data || !data.length) return;
        const porEmisor = {};
        data.forEach((m) => { (porEmisor[m.from_username] = porEmisor[m.from_username] || []).push(m.id); });
        Object.entries(porEmisor).forEach(([emisor, ids]) =>
            _emitirEvento(emisor, 'mensaje_recibido', { receiver: yo, owner: emisor, ids }));
    }

    // El OTRO recibió mis mensajes -> ✓✓ gris
    function _alRecibirEntrega(payload) {
        if (!payload || _norm(payload.owner) !== _norm(_yo())) return;
        (payload.ids || []).forEach((id) => { if (_subirEstado(id, 'delivered')) _pintarTick(id, 'delivered'); });
        if (onEntregaCambio) onEntregaCambio(payload.receiver, payload.ids || []);
    }

    // El OTRO leyó mis mensajes -> ✓✓ azul
    function _alRecibirLectura(payload) {
        if (!payload || _norm(payload.owner) !== _norm(_yo())) return;
        const friend = payload.reader;
        (idsPorAmigo.get(_norm(friend)) || new Set()).forEach((id) => {
            if (_subirEstado(id, 'read')) _pintarTick(id, 'read');
        });
        if (_norm(friend) === _norm(conversacionActual)) { // respaldo por DOM (historial recién cargado)
            document.querySelectorAll('.chat-bubble.mine[data-msg-id]').forEach((el) => {
                const id = el.getAttribute('data-msg-id');
                if (_subirEstado(id, 'read')) _pintarTick(id, 'read');
            });
        }
        if (onLecturaCambio) onLecturaCambio(friend);
    }

    // ------------------------------------------------------------
    // 1. Abrir/suscribirse a una conversación 1 a 1
    // ------------------------------------------------------------
    async function abrirConversacion(friendUsername) {
        const username = _yo();
        if (!username) throw new Error("No hay usuario logueado.");

        await cerrarConversacion(); // limpia canal previo si había otro chat abierto
        iniciarPresenciaGlobal().catch(() => {}); // idempotente

        const nombre = _canalPara(username, friendUsername);
        await _limpiarTopic(nombre);

        conversacionActual = friendUsername;
        // Presence en el mismo canal determinístico + presencia global (ver iniciarPresenciaGlobal)
        const canal = sb().channel(nombre, {
            config: { broadcast: { self: false }, presence: { key: username } },
        });
        canalActivo = canal;

        canal.on("broadcast", { event: "nuevo_mensaje" }, ({ payload }) => {
            if (!payload) return;
            const involucrado = _norm(payload.from_username) === _norm(username) || _norm(payload.to_username) === _norm(username);
            if (involucrado) _alRecibirMensaje(payload, 'dm'); // pinta, suena (solo si es ajeno) y confirma
        });
        canal.on("broadcast", { event: "mensaje_recibido" }, ({ payload }) => _alRecibirEntrega(payload));
        canal.on("broadcast", { event: "mensajes_leidos" }, ({ payload }) => _alRecibirLectura(payload));

        const _notificarPresencia = () => {
            if (onPresenciaCambio) onPresenciaCambio(_amigoEnLinea(friendUsername));
        };
        canal.on("presence", { event: "sync" }, _notificarPresencia);
        canal.on("presence", { event: "join" }, _notificarPresencia);
        canal.on("presence", { event: "leave" }, _notificarPresencia);

        await _suscribirYEsperar(canal, async () => {
            await canal.track({ username, online_at: new Date().toISOString() });
        });
        _notificarPresencia();

        return historial(friendUsername);
    }

    async function cerrarConversacion() {
        if (canalActivo) {
            const c = canalActivo;
            canalActivo = null;
            try { await c.untrack(); } catch (_) {}
            try { await sb().removeChannel(c); } catch (_) {}
        }
        conversacionActual = null;
    }

    // ------------------------------------------------------------
    // 2. Historial de una conversación (últimos 100 mensajes)
    // ------------------------------------------------------------
    async function historial(friendUsername) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");

        const { data, error } = await sb()
            .from("private_messages")
            .select("*")
            .or(
                `and(from_username.eq.${username},to_username.eq.${friendUsername}),` +
                `and(from_username.eq.${friendUsername},to_username.eq.${username})`
            )
            .order("created_at", { ascending: true })
            .limit(100);

        if (error) throw error;
        (data || []).forEach((m) => { if (_norm(m.from_username) === _norm(username)) _registrarEnviado(m); });
        return data || [];
    }

    // ------------------------------------------------------------
    // 3. Enviar mensaje de texto
    // ------------------------------------------------------------
    async function enviarMensaje(toUsername, contenido) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!contenido || !contenido.trim()) return null;

        const row = await _insertarYNotificar({ from_username: username, to_username: toUsername, content: contenido.trim() });
        return row;
    }

    // ------------------------------------------------------------
    // 4. Compartir una pregunta del simulacro/banco (la genialidad clave)
    //    'pregunta' es el objeto tal cual viene de preguntas.json / examen.js
    // ------------------------------------------------------------
    async function compartirPregunta(toUsername, pregunta) {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) throw new Error("No hay usuario logueado.");
        if (!pregunta) throw new Error("No hay pregunta para compartir.");

        // Guardamos solo lo necesario para renderizar la tarjeta en el chat,
        // sin arrastrar campos internos del examen (índices, flags, etc).
        const snapshot = {
            id: pregunta.id ?? null,
            up: pregunta.up ?? null,
            q: pregunta.q || pregunta.pregunta || "",
            options: pregunta.options || (pregunta.opciones
                ? Object.fromEntries(pregunta.opciones.map((o, i) => [String.fromCharCode(97 + i), o.texto || o.label || o]))
                : null),
        };

        const row = await _insertarYNotificar({
            from_username: username,
            to_username: toUsername,
            content: null,
            shared_question: snapshot,
        });

        return row;
    }

    // Averigua por qué la política RLS rechazó el mensaje, para decírselo al usuario
    async function _explicarRechazo(toUsername) {
        try {
            const { data: { session } } = await sb().auth.getSession();
            if (!session) return 'Tu sesión venció. Iniciá sesión de nuevo.';
            const local = window.NikaSupabase.getNikaCurrentUsername() || '';
            const { data: perfil } = await sb().from('profiles').select('username').eq('id', session.user.id).maybeSingle();
            const enPerfil = perfil && perfil.username;
            if (!enPerfil) return 'Tu perfil no tiene un nombre de usuario guardado y el chat lo necesita. Completalo en Mi Perfil.';
            if (enPerfil.toLowerCase() !== String(local).toLowerCase()) {
                return `Tu sesión usa el usuario "${local}" pero tu perfil es "${enPerfil}". Cerrá sesión y volvé a entrar.`;
            }
            if (window.NikaFriends) {
                const amigos = await window.NikaFriends.listFriends();
                if (!amigos.some((f) => String(f.username).toLowerCase() === String(toUsername).toLowerCase())) {
                    return 'Solo podés chatear con tus amigos confirmados.';
                }
            }
        } catch (err) {
            console.warn('[ChatManager] No se pudo diagnosticar el rechazo:', err);
        }
        return 'Supabase rechazó el mensaje por permisos. Revisá que se haya ejecutado sql/private_messages_rls.sql completo.';
    }

    async function _insertarYNotificar(payloadInsert) {
        const { data: row, error } = await sb()
            .from("private_messages")
            .insert(payloadInsert)
            .select()
            .single();

        if (error) {
            console.error('[ChatManager] Supabase rechazó el mensaje:', error);
            // 42501 = la política RLS rechazó el mensaje: se explica el motivo real
            const motivo = error.code === '42501'
                ? await _explicarRechazo(payloadInsert.to_username)
                : `No se pudo enviar el mensaje (${error.message || 'error desconocido'}).`;
            const e = new Error(motivo);
            e.friendly = true; // el mensaje es apto para mostrarle al usuario
            throw e;
        }

        _registrarEnviado(row);
        if (!canalGlobal) await iniciarPresenciaGlobal();

        // (a) DM: por el canal YA suscripto (nunca crear otro con el mismo nombre)
        if (canalActivo && canalActivo.state === "joined" && _norm(conversacionActual) === _norm(payloadInsert.to_username)) {
            try { await canalActivo.send({ type: "broadcast", event: "nuevo_mensaje", payload: row }); }
            catch (err) { console.warn('[ChatManager] Falló el broadcast al DM:', err); }
        }
        // (b) Ping global sin contenido: sonido/badge en el otro aunque tenga el chat cerrado
        if (canalGlobal && canalGlobal.state === "joined") {
            try {
                await canalGlobal.send({
                    type: "broadcast", event: "dm_ping",
                    payload: { id: row.id, from_username: row.from_username, to_username: row.to_username },
                });
            } catch (err) { console.warn('[ChatManager] Falló el ping global:', err); }
        }

        return row;
    }

    // ------------------------------------------------------------
    // 5. Bandeja: conteo de no leídos por amigo + marcar como leído
    // ------------------------------------------------------------
    async function contarNoLeidos() {
        const username = window.NikaSupabase.getNikaCurrentUsername();
        if (!username) return {};

        const { data, error } = await sb()
            .from("private_messages")
            .select("from_username")
            .eq("to_username", username)
            .is("read_at", null);

        if (error) throw error;

        const porUsuario = {};
        (data || []).forEach((m) => {
            porUsuario[m.from_username] = (porUsuario[m.from_username] || 0) + 1;
        });
        return porUsuario;
    }

    async function marcarComoLeido(friendUsername) {
        const username = _yo();
        if (!username) return;

        const { data } = await sb()
            .from("private_messages")
            .update({ read_at: new Date().toISOString() })
            .eq("from_username", friendUsername)
            .eq("to_username", username)
            .is("read_at", null)
            .select("id");

        // Solo avisamos si realmente había algo para marcar como leído:
        // el otro extremo pasa sus ticks a "✓✓ azul" al toque.
        if (data && data.length) {
            _emitirEvento(friendUsername, "mensajes_leidos", { reader: username, owner: friendUsername });
        }

        _avisarLista();
    }

    return {
        abrirConversacion,
        cerrarConversacion,
        iniciarPresenciaGlobal,
        detenerPresenciaGlobal,
        estaEnLinea,
        usuariosEnLinea() { return presenciaNombres.concat(respaldoNombres.filter((n) => !presenciaGlobal.has(_norm(n)))); },
        actualizarRespaldoPresencia,
        alCambiarLista(cb) { if (typeof cb === 'function') _escListaExtra.push(cb); },
        alCambiarPresencia(cb) { if (typeof cb === 'function') _escPresenciaExtra.push(cb); },
        tickHTML,
        estadoDeEntrega,
        sonarMensaje: _reproducirSonidoMensaje, // para el chat global
        get lecturaAutomatica() { return lecturaAutomatica; },
        set lecturaAutomatica(v) { lecturaAutomatica = !!v; },
        set onEntregaCambio(cb) { onEntregaCambio = cb; },
        set onPresenciaGlobal(cb) { onPresenciaGlobal = cb; },
        historial,
        enviarMensaje,
        compartirPregunta,
        contarNoLeidos,
        marcarComoLeido,
        get conversacionActual() {
            return conversacionActual;
        },
        set onMensaje(cb) {
            onMensaje = cb;
        },
        set onListaChanged(cb) {
            onListaChanged = cb;
        },
        get onPresenciaCambio() {
            return onPresenciaCambio;
        },
        set onPresenciaCambio(cb) {
            onPresenciaCambio = cb;
        },
        get onLecturaCambio() {
            return onLecturaCambio;
        },
        set onLecturaCambio(cb) {
            onLecturaCambio = cb;
        },
        get sonidoActivado() {
            return sonidoActivado;
        },
        set sonidoActivado(v) {
            sonidoActivado = !!v;
        },
    };
})();

window.ChatManager = ChatManager;
