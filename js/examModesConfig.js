/**
 * Campus Nika — Configuración de Modalidades del Simulador de Examen (Sprint 2)
 * ----------------------------------------------------------------------------
 * Fuente única de verdad para el Paso 2 del embudo (examen.html).
 * Cada modo principal tiene: id, nombre, icono, descripcion y una lista de
 * submodos. Cada submodo trae un `systemPrompt` vacío como placeholder: se
 * completará cuando se conecte la lógica de IA de cada modalidad.
 *
 * IDs 'choice' y 'escrito' se mantienen iguales a los de MODALIDADES en
 * examen.html para no romper el ruteo actual (elegirModalidad, deep-links
 * ?modalidad=choice|escrito, ESCRITO_CFG, etc.).
 */
const EXAM_MODES_CONFIG = [
    {
        id: 'choice',
        nombre: 'Choice Clásico',
        icono: '📝',
        descripcion: 'Opción múltiple con reloj, ranking y revisión con justificación oficial. El clásico.',
        submodos: [
            { id: 'normal', nombre: 'Normal', systemPrompt: '' }
        ]
    },
    {
        id: 'escrito',
        nombre: 'Desarrollo Escrito Base',
        icono: '✍️',
        descripcion: 'Desarrollás cada respuesta y un tribunal de IA te corrige: nota, rúbrica y feedback detallado.',
        submodos: [
            { id: 'normal', nombre: 'Normal', systemPrompt: '' }
        ]
    },
    {
        id: 'pase_sala',
        nombre: 'Pase de Sala',
        icono: '🩺',
        descripcion: 'Recorrida clínica real: interrogás, seguís la evolución del paciente y armás la conducta.',
        submodos: [
            { id: 'interrogatorio_ciego', nombre: 'Interrogatorio Ciego', systemPrompt: '' },
            { id: 'casos_evolutivos', nombre: 'Casos Evolutivos', systemPrompt: '' },
            { id: 'caza_iatrogenias', nombre: 'Caza de Iatrogenias', systemPrompt: '' },
            { id: 'armado_soap', nombre: 'Armado de SOAP', systemPrompt: '' },
            { id: 'simulador_recetario', nombre: 'Simulador de Recetario', systemPrompt: '' }
        ]
    },
    {
        id: 'shock_room',
        nombre: 'Shock Room',
        icono: '🚨',
        descripcion: 'Urgencias contra reloj: triage, decisiones bajo presión y giros clínicos inesperados.',
        submodos: [
            { id: 'time_attack', nombre: 'Time Attack', systemPrompt: '' },
            { id: 'triage', nombre: 'Triage', systemPrompt: '' },
            { id: 'escenarios_caps', nombre: 'Escenarios CAPS', systemPrompt: '' },
            { id: 'plot_twists', nombre: 'Plot Twists', systemPrompt: '' }
        ]
    },
    {
        id: 'consultorio_legales',
        nombre: 'Consultorio y Legales',
        icono: '🗣️',
        descripcion: 'Comunicación clínica y aspectos médico-legales: pacientes difíciles, malas noticias y auditorías.',
        submodos: [
            { id: 'paciente_googleador', nombre: 'Paciente Googleador', systemPrompt: '' },
            { id: 'malas_noticias', nombre: 'Malas Noticias', systemPrompt: '' },
            { id: 'auditoria_hc', nombre: 'Auditoría de HC', systemPrompt: '' }
        ]
    }
];

if (typeof window !== 'undefined') window.EXAM_MODES_CONFIG = EXAM_MODES_CONFIG;
if (typeof module !== 'undefined' && module.exports) module.exports = { EXAM_MODES_CONFIG };
