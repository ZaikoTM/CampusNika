/**
 * Campus Nika — Sesiones del Simulador (Sprint 2)
 * ----------------------------------------------------------------------------
 * Estructura base de acceso a la tabla `simulador_sesiones` (ver
 * sql/simulador_sesiones.sql) para las modalidades conversacionales: Pase de
 * Sala, Shock Room, Consultorio y Legales.
 *
 * Todavía NO se llama desde examen.html — queda preparado para cuando se
 * conecte la lógica de IA de cada submodo (systemPrompt en examModesConfig.js).
 *
 * Usa el mismo cliente de Supabase que el resto del Campus: window.NikaSupabase.client.
 */

function getClienteSupabaseSesiones() {
    const cliente = (typeof window !== 'undefined' && window.NikaSupabase && window.NikaSupabase.client) || null;
    if (!cliente) console.warn('[simuladorSesiones] Cliente de Supabase no disponible todavía (window.NikaSupabase.client)');
    return cliente;
}

/**
 * Crea una sesión nueva en estado 'en_curso'.
 * @param {{ userId: string, modo: string, submodo: string, contextoClinico?: object }} datos
 * @returns {Promise<object>} la fila creada
 */
async function crearSesionSimulador({ userId, modo, submodo, contextoClinico = {} }) {
    const supabase = getClienteSupabaseSesiones();
    if (!supabase) throw new Error('Cliente de Supabase no disponible');
    if (!userId || !modo || !submodo) throw new Error('crearSesionSimulador requiere userId, modo y submodo');

    const { data, error } = await supabase
        .from('simulador_sesiones')
        .insert({
            user_id: userId,
            modo,
            submodo,
            contexto_clinico: contextoClinico,
            historial: [],
            estado: 'en_curso'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Agrega un turno (mensaje/acción) al historial de la sesión.
 * @param {string} sesionId
 * @param {object} turno - p.ej. { rol: 'usuario' | 'ia', contenido: '...' }
 * @returns {Promise<object>} la fila actualizada
 */
async function agregarTurnoSesion(sesionId, turno) {
    const supabase = getClienteSupabaseSesiones();
    if (!supabase) throw new Error('Cliente de Supabase no disponible');
    if (!sesionId) throw new Error('agregarTurnoSesion requiere sesionId');

    const { data: actual, error: errorLectura } = await supabase
        .from('simulador_sesiones')
        .select('historial')
        .eq('id', sesionId)
        .single();
    if (errorLectura) throw errorLectura;

    const nuevoHistorial = [...(actual?.historial || []), { ...turno, ts: new Date().toISOString() }];

    const { data, error } = await supabase
        .from('simulador_sesiones')
        .update({ historial: nuevoHistorial })
        .eq('id', sesionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Cierra la sesión con su resultado final.
 * @param {string} sesionId
 * @param {{ notaFinal?: number, pilaresFinal?: object, abogadoDiablo?: object, cancelada?: boolean }} resultado
 * @returns {Promise<object>} la fila actualizada
 */
async function cerrarSesionSimulador(sesionId, { notaFinal = null, pilaresFinal = null, abogadoDiablo = null, cancelada = false } = {}) {
    const supabase = getClienteSupabaseSesiones();
    if (!supabase) throw new Error('Cliente de Supabase no disponible');
    if (!sesionId) throw new Error('cerrarSesionSimulador requiere sesionId');

    const { data, error } = await supabase
        .from('simulador_sesiones')
        .update({
            estado: cancelada ? 'cancelada' : 'finalizada',
            nota_final: notaFinal,
            pilares_final: pilaresFinal,
            abogado_diablo: abogadoDiablo
        })
        .eq('id', sesionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

if (typeof window !== 'undefined') {
    window.SimuladorSesiones = { crearSesionSimulador, agregarTurnoSesion, cerrarSesionSimulador };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { crearSesionSimulador, agregarTurnoSesion, cerrarSesionSimulador };
}
