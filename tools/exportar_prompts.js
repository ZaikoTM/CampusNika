// Genera PROMPTS_SIMULADORES_SIAM_CIRUGIA.md con los prompts reales de js/examPromptsMaterias.js (para auditarlos con NotebookLM).
// Uso: node tools/exportar_prompts.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.join(__dirname, '..');
const ctx = { window: {}, console };
ctx.EXAM_PROMPTS_POR_MATERIA = {}; ctx.TEMAS_ESTACION_POR_MATERIA = {}; ctx.DESCRIPCIONES_POR_MATERIA = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, 'js/examPromptsMaterias.js'), 'utf8'), ctx);
const P = ctx.EXAM_PROMPTS_POR_MATERIA, D = ctx.DESCRIPCIONES_POR_MATERIA, T = ctx.TEMAS_ESTACION_POR_MATERIA;
const NM = { siam: 'S.I.A.M.', cirugia: 'CIRUGÍA' };
const SIM = { pase_sala: 'PASE DE SALA', shock_room: 'SHOCK ROOM', consultorio_legales: 'CONSULTORIO Y LEGALES', ecoe_final: 'EXAMEN FINAL ECOE' };
let o = '# Prompts de los simuladores de IA — S.I.A.M. y Cirugía\n\nDocumento para auditar con NotebookLM. Lo generó `tools/exportar_prompts.js` desde `js/examPromptsMaterias.js` (es el texto exacto que recibe la IA).\n' +
  'Nota 1: en el ECOE (todas las materias) `examen.html` agrega además una regla de PARTE PRÁCTICA: cuando el alumno pide redactar la receta, se abre el Recetario en modo examen (5 min, sin ayudas) en un iframe y su resultado vuelve a la conversación para entrar en la evaluación.\n' +
  'Nota 2: al terminar cada caso, `examen.html` agrega automáticamente el formato de salida JSON de 4 pilares (semiología, diagnóstico, terapéutica, vocabulario); no está repetido acá.\n\n' +
  '## Qué conviene verificar\n- Que cada unidad (UP) listada coincida con el programa/bibliografía de la materia.\n- Que los cuadros y ejemplos clínicos de cada simulador correspondan a la materia (nada de otra especialidad).\n- Que los criterios de evaluación y los errores críticos sean los que exige la cátedra.\n- Que las descripciones (lo que ve el alumno) sean correctas, incluyendo la cantidad de UP.\n\n';
Object.keys(NM).forEach((k) => {
  o += `\n---\n\n# ${NM[k]}\n`;
  Object.keys(SIM).forEach((sim) => {
    o += `\n## ${SIM[sim]}\n`;
    Object.keys(P[k][sim]).forEach((sub) => {
      const d = D[k] && D[k][sim] && D[k][sim][sub];
      o += `\n### ${sim} / ${sub}\n`;
      if (d) o += `\n**Descripción corta (tarjeta):** ${d.corta}\n\n**Descripción larga (modal):**\n\n${d.larga}\n`;
      o += `\n**PROMPT:**\n\n\`\`\`\n${P[k][sim][sub]}\n\`\`\`\n`;
    });
  });
  if (T[k] && T[k].ecoe_final) o += `\n## Temas sorteables del ECOE (${NM[k]})\n\n` + T[k].ecoe_final.estacion_aleatoria.map((t) => '- ' + t).join('\n') + '\n';
});
fs.writeFileSync(path.join(raiz, 'PROMPTS_SIMULADORES_SIAM_CIRUGIA.md'), o);
console.log('ok', o.length, 'caracteres');
