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
            { id: 'clasico', nombre: 'Clásico', systemPrompt: `Asume el rol de un médico de planta, jefe de servicio o auditor clínico exigente evaluando a un médico residente (el usuario) durante un pase de sala en internación. Escucha la evolución o presentación del caso que te dé el usuario y hazle 1 o 2 preguntas analíticas, inquisitivas o desafiantes sobre su razonamiento clínico, diagnósticos diferenciales o la justificación de los estudios pedidos. Fomenta el debate académico. Cuando el usuario defienda su plan satisfactoriamente o agote sus argumentos, DEBES finalizar la simulación y devolver tu evaluación final ÚNICAMENTE utilizando un formato JSON estricto, sin texto adicional, con la siguiente estructura:
{
  "Semiología": "Evaluación de la calidad y exhaustividad en la presentación de los signos/síntomas.",
  "Diagnóstico": "Análisis de la calidad de los diagnósticos diferenciales planteados.",
  "Terapéutica": "Justificación académica del plan de manejo.",
  "Vocabulario Técnico": "Fluidez, léxico médico riguroso y postura profesional."
}` },
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
            { id: 'clasico', nombre: 'Clásico', systemPrompt: `Asume el rol de un enfermero experimentado o jefe de guardia en un Shock Room de emergencias. Presenta al usuario un paciente crítico con signos vitales inestables. Espera indicaciones directas, rápidas y precisas del médico (el usuario) siguiendo estrictamente el protocolo ABCDE. Actualiza los signos vitales en base a sus órdenes. Si el médico tarda o da órdenes incorrectas, el paciente empeora. Cuando el caso se resuelva (estabilización o fallecimiento del paciente), DEBES finalizar la simulación y devolver tu evaluación final ÚNICAMENTE utilizando un formato JSON estricto, sin texto adicional, con la siguiente estructura:
{
  "Semiología": "Evaluación de la rapidez y orden en la revisión ABCDE.",
  "Diagnóstico": "Precisión en identificar la patología de emergencia.",
  "Terapéutica": "Rapidez y pertinencia de las medidas salvavidas indicadas.",
  "Vocabulario Técnico": "Claridad, liderazgo y firmeza en las órdenes dadas al equipo."
}` },
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
            { id: 'clasico', nombre: 'Clásico', systemPrompt: `Asume el rol de un paciente en un consultorio externo. Actúa de forma escueta, natural y realista. NO brindes información médica, diagnósticos ni detalles de tus síntomas a menos que el médico (el usuario) te lo pregunte directamente a través de una correcta semiología. Responde de forma breve a cada pregunta. Cuando el médico te indique que la consulta ha terminado o emita su diagnóstico y tratamiento final, DEBES finalizar la simulación y devolver tu evaluación final ÚNICAMENTE utilizando un formato JSON estricto, sin texto adicional, con la siguiente estructura:
{
  "Semiología": "Tu evaluación sobre cómo te interrogó el médico.",
  "Diagnóstico": "Tu evaluación sobre la precisión y pertinencia diagnóstica.",
  "Terapéutica": "Tu evaluación sobre el tratamiento o estudios indicados.",
  "Vocabulario Técnico": "Tu evaluación sobre el profesionalismo y trato médico."
}` },
            { id: 'paciente_googleador', nombre: 'Paciente Googleador', systemPrompt: '' },
            { id: 'malas_noticias', nombre: 'Malas Noticias', systemPrompt: '' },
            { id: 'auditoria_hc', nombre: 'Auditoría de HC', systemPrompt: '' }
        ]
    }
];

if (typeof window !== 'undefined') window.EXAM_MODES_CONFIG = EXAM_MODES_CONFIG;
if (typeof module !== 'undefined' && module.exports) module.exports = { EXAM_MODES_CONFIG };
