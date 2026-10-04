/* NikaSim · base de datos desacoplada del Centro de Simulación.
 * Para sumar contenido alcanza con editar este objeto:
 *   - años (years[]) → áreas/materias (areas[]) → acreditaciones[] y tours3D[]
 *   - cada acreditación se enlaza con data/acreditaciones/<area>/index.json (campo `area` + `id`): la cantidad de pasos y el
 *     estado (activo / próximamente) se leen de ese índice en tiempo real, así no hay que duplicar datos al sumar acreditaciones.
 *   - `status` de este archivo sólo se usa como valor de respaldo si el índice no responde.
 * Estados posibles: "Disponible" · "Próximamente" · "En desarrollo".
 */
const NIKASIM_DATABASE = {
  mascota: {
    nombre: 'Nika',
    saludo: '¡Hola! Soy Nika, tu instructora virtual. Elegí tu año y tu materia y practicá cada destreza paso a paso, como en la acreditación real.',
    tips: [
      'Practicá primero en modo guiado: yo te muestro cada paso con su fundamento. Después probá el examen, sin ayudas.',
      'En la acreditación real los pasos críticos son eliminatorios: si fallás uno, desaprobás aunque tengas buen puntaje.',
      'Podés dictar tus acciones por voz con el micrófono de la bitácora. ¡Hablá como si estuvieras frente al tribunal!',
      'Armá bien la mesa de instrumental: elegir un insumo equivocado también cuenta como error.',
      'Mirá el machete antes de rendir: resume cada acreditación en una pantalla.',
      'Cada acreditación tiene preguntas de fundamentos para estudiar el porqué de cada paso.'
    ],
    alCambiarAnio: 'Estás en {anio}. Elegí la materia y vemos qué destrezas podés practicar.',
    alElegirArea: '¡Buena elección! En {area} podés practicar {n} destrezas. Empezá por las disponibles.',
    sinContenido: 'Este año todavía está en preparación. ¡Pronto vas a poder practicar acá!'
  },
  defaultYear: '5to',
  years: [
    { id: '1ro', name: '1° Año', areas: [], aviso: 'Estamos preparando las acreditaciones y recorridos de este año.' },
    { id: '2do', name: '2° Año', areas: [], aviso: 'Estamos preparando las acreditaciones y recorridos de este año.' },
    { id: '3ro', name: '3° Año', areas: [], aviso: 'Estamos preparando las acreditaciones y recorridos de este año.' },
    { id: '4to', name: '4° Año', areas: [], aviso: 'Estamos preparando las acreditaciones y recorridos de este año.' },
    {
      id: '5to',
      name: '5° Año',
      areas: [
        {
          id: 'siam',
          name: 'SIAM',
          fullName: 'SIAM · Salud Integral del Adulto y Anciano',
          icon: '🫀',
          description: 'Procedimientos clínicos del adulto: sondaje, tacto rectal, vía aérea, reanimación y punciones articulares.',
          tours3D: [
            { id: 'guardia', title: 'Guardia & Shock Room', icon: '🚑', status: 'Próximamente', steps: 'Triage, box de reanimación y carro de paro', description: 'Recorré la guardia como en una emergencia real: ingreso, evaluación inicial y shock room equipado.' }
          ],
          acreditaciones: [
            { id: 'sv', area: 'siam', title: 'Colocación de sonda vesical', icon: '🚽', steps: 30, status: 'Disponible' },
            { id: 'tr', area: 'siam', title: 'Tacto rectal', icon: '🩺', steps: 26, status: 'Disponible' },
            { id: 'iet', area: 'siam', title: 'Intubación endotraqueal', icon: '🫁', steps: 27, status: 'Disponible' },
            { id: 'rcp', area: 'siam', title: 'RCP avanzado', icon: '❤️‍🔥', steps: 31, status: 'Disponible' },
            { id: 'artro', area: 'siam', title: 'Artrocentesis', icon: '🦵', steps: 48, status: 'Disponible' }
          ]
        },
        {
          id: 'sim',
          name: 'SIM',
          fullName: 'SIM · Salud Integral de la Mujer',
          icon: '🤰',
          description: 'Ginecología y obstetricia: anamnesis, examen ginecológico, cálculo de edad gestacional, examen obstétrico y mamario.',
          tours3D: [
            { id: 'partos', title: 'Sala de Partos y Triage Obstétrico', icon: '👶', status: 'Próximamente', steps: 'Triage, trabajo de parto y sala de partos', description: 'Explorá el triage obstétrico y la sala de partos: monitoreo fetal, camilla de parto y área neonatal.' }
          ],
          acreditaciones: [
            { id: 'anamg', area: 'sim', title: 'Anamnesis ginecológica', icon: '🗂️', steps: 31, status: 'Disponible' },
            { id: 'anamo', area: 'sim', title: 'Anamnesis obstétrica', icon: '🤰', steps: 22, status: 'Disponible' },
            { id: 'egfpp', area: 'sim', title: 'Cálculo de EG y FPP', icon: '📅', steps: 9, status: 'Disponible' },
            { id: 'exgin', area: 'sim', title: 'Examen ginecológico, PAP y tacto bimanual', icon: '🔬', steps: 27, status: 'Disponible' },
            { id: 'exobs', area: 'sim', title: 'Examen obstétrico', icon: '🫄', steps: 19, status: 'Disponible' },
            { id: 'exmam', area: 'sim', title: 'Examen mamario', icon: '🎀', steps: 18, status: 'Disponible' }
          ]
        },
        {
          id: 'iecq',
          name: 'IECQ',
          fullName: 'IECQ · Introducción a las Especialidades Clínico-Quirúrgicas',
          icon: '🔪',
          description: 'Cirugía: asepsia, procedimientos, vía aérea y lectura de imágenes.',
          tours3D: [
            { id: 'quirofano', title: 'Quirófano Central y Áreas Estériles', icon: '🏥', status: 'Próximamente', steps: 'Área negra, gris y blanca', description: 'Recorré el bloque quirúrgico desde la zona negra hasta el quirófano: vestuarios, antequirófano, pileta de lavado y sala.' }
          ],
          acreditaciones: [
            { id: 'lav', area: 'cir', title: 'Lavado de manos quirúrgico y guantes', icon: '🧼', steps: 22, status: 'Disponible' },
            { id: 'parac', area: 'cir', title: 'Paracentesis (diagnóstica y evacuadora)', icon: '💉', steps: 50, status: 'Próximamente' },
            { id: 'ost', area: 'cir', title: 'Cuidado de ostomías', icon: '🩹', steps: 11, status: 'Próximamente' },
            { id: 'vaer', area: 'cir', title: 'Taller de vía aérea', icon: '🫁', steps: 13, status: 'Próximamente' },
            { id: 'eco', area: 'cir', title: 'Lectura de ecografía de abdomen', icon: '🔊', steps: 11, status: 'Próximamente' },
            { id: 'rxab', area: 'cir', title: 'Lectura de Rx de abdomen', icon: '🩻', steps: 16, status: 'Próximamente' },
            { id: 'mano', area: 'cir', title: 'Lectura de manometría', icon: '📈', steps: 10, status: 'Próximamente' }
          ]
        }
      ]
    },
    {
      id: '6to',
      name: '6° Año (PFO)',
      areas: [],
      aviso: 'La Práctica Final Obligatoria tendrá su propio centro de destrezas. Estamos preparándolo.'
    }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = { NIKASIM_DATABASE };
