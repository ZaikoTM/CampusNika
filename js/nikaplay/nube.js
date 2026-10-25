/* NikaPlay — capa de datos (Supabase). Todo pasa por las funciones de sql/nikaplay.sql: el cliente nunca escribe puntos, ELO ni XP directo.
   Si no hay conexión o sesión, cada llamada falla con un mensaje legible y el juego sigue funcionando en modo local. */
(function () {
  'use strict';
  var NP = window.NikaPlay = window.NikaPlay || {}, cli = null, yoId = null;

  function limpiar(m) { return String(m || 'No pudimos conectar. Probá de nuevo.').replace(/^.*?ERROR:\s*/, '').replace(/\n.*/s, ''); }
  function cliente() {
    if (cli) return Promise.resolve(cli);
    return Promise.resolve(window.NikaScriptsReady).then(function () { return window.NikaSupabase && window.NikaSupabase.ready; }).then(function () {
      cli = window.NikaSupabase && window.NikaSupabase.client; if (!cli) throw new Error('Sin conexión con el servidor'); return cli;
    });
  }
  function rpc(nombre, args) {
    return cliente().then(function (c) { return c.rpc(nombre, args || {}); }).then(function (r) { if (r.error) throw new Error(limpiar(r.error.message)); return r.data; });
  }
  function yo() {
    if (yoId) return Promise.resolve(yoId);
    return cliente().then(function (c) { return c.auth.getSession(); }).then(function (r) { yoId = r.data && r.data.session && r.data.session.user.id; if (!yoId) throw new Error('Iniciá sesión para usar esta función'); return yoId; });
  }
  function filas(tabla, sel, filtro) {
    return cliente().then(function (c) { var q = c.from(tabla).select(sel); return filtro ? filtro(q) : q; }).then(function (r) { if (r.error) throw new Error(limpiar(r.error.message)); return r.data || []; });
  }
  /** Agrega nombre y avatar (profiles_public) a filas que traen user_id. */
  function conNombres(rows, campo) {
    campo = campo || 'user_id'; var ids = rows.map(function (r) { return r[campo]; }).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    if (!ids.length) return Promise.resolve(rows);
    return filas('profiles_public', 'id,username,fullname,avatar', function (q) { return q.in('id', ids); }).then(function (ps) {
      var m = {}; ps.forEach(function (p) { m[String(p.id)] = p; });
      return rows.map(function (r) { var p = m[String(r[campo])] || {}; r.nombre = p.fullname || p.username || 'Jugador'; r.username = p.username || ''; r.avatar = p.avatar || ''; return r; });
    }).catch(function () { return rows; });
  }

  NP.nube = {
    rpc: rpc, yo: yo, cliente: cliente, conNombres: conNombres,
    guardarPartida: function (o) { return rpc('nikaplay_guardar_partida', { p_juego: o.juego, p_n: o.n, p_ritmo: o.ritmo, p_puntos: o.puntos, p_aciertos: o.aciertos, p_errores: o.errores, p_tiempo_ms: o.tiempo_ms || 0, p_semilla: o.semilla == null ? null : o.semilla, p_reto: o.reto || null }).then(function (d) { return Array.isArray(d) ? d[0] : d; }); },
    miPerfil: function () { return rpc('nikaplay_mi_perfil').then(function (d) { return Array.isArray(d) ? d[0] : d; }); },
    rankingElo: function (juego, alcance) { return rpc('nikaplay_ranking_elo', { p_juego: juego || 'general', p_alcance: alcance || 'global', p_limite: 50 }); },
    rankingProgreso: function (periodo, alcance) { return rpc('nikaplay_ranking_progreso', { p_periodo: periodo || 'semana', p_alcance: alcance || 'global', p_limite: 50 }); },
    buscar: function (q) { return rpc('nikaplay_buscar_usuarios', { p_q: q, p_limite: 12 }); },
    invitar: function (para, sala, juego, msj) { return rpc('nikaplay_invitar', { p_para: para, p_sala: sala || null, p_juego: juego || 'nikaword', p_mensaje: msj || null }); },
    misInvitaciones: function () { return rpc('nikaplay_mis_invitaciones'); },
    responderInvitacion: function (id, aceptar) { return rpc('nikaplay_responder_invitacion', { p_id: id, p_aceptar: !!aceptar }); },
    crearReto: function (o) { return rpc('nikaplay_crear_reto', { p_juego: 'nikaword', p_semilla: o.semilla, p_n: o.n, p_ritmo: o.ritmo, p_puntos: o.puntos }); },
    verReto: function (id) { return rpc('nikaplay_ver_reto', { p_id: id }).then(function (d) { return Array.isArray(d) ? d[0] : d; }); },
    crearSala: function (cfg, max, privada) { return rpc('nikaplay_crear_sala', { p_juego: 'nikaword', p_config: cfg, p_max: max, p_privada: privada !== false, p_puntuable: true }).then(function (d) { return Array.isArray(d) ? d[0] : d; }); },
    unirse: function (codigo) { return rpc('nikaplay_unirse_sala', { p_codigo: codigo }); },
    salir: function (id) { return rpc('nikaplay_salir_sala', { p_sala: id }); },
    listo: function (id, v) { return rpc('nikaplay_sala_listo', { p_sala: id, p_listo: v }); },
    iniciar: function (id) { return rpc('nikaplay_iniciar_sala', { p_sala: id }); },
    enviarResultado: function (id, r) { return rpc('nikaplay_sala_enviar', { p_sala: id, p_puntos: r.puntos, p_aciertos: r.aciertos, p_errores: r.errores, p_tiempo_ms: r.tiempo_ms || 0 }); },
    abandonar: function (id) { return rpc('nikaplay_abandonar_sala', { p_sala: id }); },
    cerrarSala: function (id, forzar) { return rpc('nikaplay_cerrar_sala', { p_sala: id, p_forzar: !!forzar }); },
    mensaje: function (id, t) { return rpc('nikaplay_sala_mensaje', { p_sala: id, p_texto: t }); },
    reaccion: function (id, e) { return rpc('nikaplay_sala_reaccion', { p_sala: id, p_emoji: e }); },
    sala: function (id) { return filas('nikaplay_salas', '*', function (q) { return q.eq('id', id).limit(1); }).then(function (r) { return r[0] || null; }); },
    jugadores: function (id) { return filas('nikaplay_sala_jugadores', '*', function (q) { return q.eq('sala_id', id).order('unido_at'); }).then(function (r) { return conNombres(r); }); },
    mensajes: function (id) { return filas('nikaplay_sala_mensajes', '*', function (q) { return q.eq('sala_id', id).order('id', { ascending: false }).limit(60); }).then(function (r) { return conNombres(r.reverse()); }); },
    /** Suscripción en vivo a una sala. h: { cambio(), mensaje(fila), reaccion(fila) }. Devuelve una función para cancelar. */
    suscribir: function (id, h) {
      var canal = null, vivo = true;
      cliente().then(function (c) {
        if (!vivo) return; var f = 'sala_id=eq.' + id;
        canal = c.channel('nikaplay-sala-' + id)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'nikaplay_salas', filter: 'id=eq.' + id }, function () { h.cambio && h.cambio(); })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'nikaplay_sala_jugadores', filter: f }, function () { h.cambio && h.cambio(); })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nikaplay_sala_mensajes', filter: f }, function (p) { h.mensaje && h.mensaje(p.new); })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nikaplay_sala_reacciones', filter: f }, function (p) { h.reaccion && h.reaccion(p.new); })
          .subscribe();
      }).catch(function () {});
      return function () { vivo = false; if (canal && cli) { try { cli.removeChannel(canal); } catch (_) {} } };
    },
    /** Invitaciones nuevas para mí (tiempo real). */
    suscribirInvitaciones: function (cb) {
      var canal = null; yo().then(function (uid) { return cliente().then(function (c) {
        canal = c.channel('nikaplay-inv-' + uid).on('postgres_changes', { event: '*', schema: 'public', table: 'nikaplay_invitaciones', filter: 'para_id=eq.' + uid }, function () { cb(); }).subscribe();
      }); }).catch(function () {});
      return function () { if (canal && cli) { try { cli.removeChannel(canal); } catch (_) {} } };
    }
  };
})();
