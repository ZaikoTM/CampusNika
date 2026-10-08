// Genera los documentos de AUDITORÍA de los casos del ECOE FINAL (ficha del caso, rúbrica y prompt completo que recibe la IA).
// Uso: node tools/exportar_pfo_casos.js <carpeta_de_salida>      (por defecto, ./_auditoria_pfo, que está fuera del control de versiones)
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.join(__dirname, '..');
const salida = process.argv[2] || path.join(raiz, '_auditoria_pfo');
fs.mkdirSync(salida, { recursive: true });

// Notas de borrador y decisiones por caso (para que quien audita sepa qué es dato inventado como borrador y qué se decidió ante una duda)
const NOTAS = {
  ped_bor: ['Caso oficial de la estación, auditado: se mantienen los datos de laboratorio y de radiografía; se corrige el manejo de la crisis (corticoide sistémico por vía endovenosa por los vómitos, broncodilatador combinado en la primera hora); el budesonide queda como controlador preventivo.', 'Se agregan al guion respuestas a preguntas fuera de guion y un índice de anemia ferropénica como dato opcional (BORRADOR).', 'A VALIDAR: la transfusión de glóbulos rojos con hemoglobina de 7 g/dl e hipoxemia figura en la rúbrica original; las auditorías no coinciden (una la rechaza como primera línea y otra la valida). Se aceptan transfusión o ferroterapia fundamentada.'],
  ped_nino_sano: ['BORRADOR: datos antropométricos, relato perinatal, alimentación, hitos, vivienda y carnet (el material solo trae las preguntas, no las respuestas).', 'Se siguen las sugerencias: suplementación con vitamina D e hierro hasta los 12 meses; leche de vaca desde los 12 meses; cero pantallas antes de los 2 años; vacunas de los 12 meses: triple viral, hepatitis A y refuerzo de neumococo.', 'Se mantiene del material original: repelente con menos de 30 % de DEET, protector solar cada 2 horas, sueño seguro y prevención de accidentes.'],
  ped_fsf: ['BORRADOR: laboratorio, orina, radiografía y líquido cefalorraquídeo (el material no trae los valores).', 'Se ajustaron signos vitales a la edad: FC 150 y FR 40 (el material decía FC 100 y FR 30).', 'Decisiones por conflicto: se sigue la definición de las sugerencias (fiebre sin foco de menos de 72 horas); en el lactante de 1 a 3 meses de alto riesgo se usa ceftriaxona 100 mg/kg/día (el material indicaba ampicilina más cefotaxima); ceftriaxona contraindicada en menores de 28 días.', 'Antitérmico: paracetamol 10 a 15 mg/kg/dosis cada 6 horas, sin alternar con ibuprofeno.'],
  ped_meningitis: ['BORRADOR: texto de la situación, guion de la madre y datos clínicos (el material no trae el texto de la estación).', 'Se conservan los valores del líquido cefalorraquídeo del material (leucocitos 80/mm3, glucorraquia 35, proteínas 60, diplococos gramnegativos); son compatibles con un cuadro temprano.', 'Decisiones por conflicto: dexametasona 0,15 mg/kg/dosis cada 6 horas junto con la primera dosis de antibiótico (el material decía que no se considera necesaria; las sugerencias la recomiendan); no se indica metoclopramida (el material la indicaba); antitérmico paracetamol en lugar de dipirona.', 'A VALIDAR: dosis de rifampicina para los contactos. El material decía 20 mg/kg cada 12 horas; se cargó el esquema habitual de 10 mg/kg/dosis cada 12 horas por 2 días (máximo 600 mg por dosis).', 'Las sugerencias mencionan agregar vancomicina como cobertura empírica antes de identificar el germen; como acá el Gram ya muestra meningococo, la rúbrica pide ceftriaxona sola.'],
  ped_detencion_crecimiento: ['BORRADOR: guion de la madre (prematurez de 34 semanas y falta de hierro profiláctico como causa de la anemia), laboratorio, orina y ecografía.', 'Se siguen las sugerencias: urocultivo por cateterismo o punción suprapúbica (la bolsa no sirve para confirmar), ecografía renal y vesical en toda infección urinaria febril, cistouretrografía solo si hay criterios, hierro 3 a 6 mg/kg/día.', 'Se mantiene del material: cefalexina 50 a 100 mg/kg/día o amoxicilina-clavulánico 40 mg/kg/día por 7 días; urocultivo de control a los 7 días de terminar el tratamiento.'],
  ped_gea_disenteria: ['BORRADOR: peso, laboratorio y resultado del examen de materia fecal (trofozoítos de Entamoeba histolytica); el material solo dice que se solicitó un estudio.', 'Decisión: con ameba documentada se indica metronidazol 30 mg/kg/día cada 8 horas por 7 días (el material indicaba antibióticos si la disentería no mejoraba en 48 horas).', 'Antitérmico: paracetamol 10 a 15 mg/kg/dosis (el material también mencionaba ibuprofeno); antidiarreicos contraindicados.'],
  ped_gea_deshidratacion: ['BORRADOR: laboratorio, ácido-base y coprocultivo.', 'Decisiones por conflicto (se siguen las sugerencias): Plan B con sales de baja osmolaridad 50 a 100 ml/kg en 4 horas (el material decía 20 ml/kg cada 20 a 30 minutos); gastroclisis por sonda nasogástrica a 20 ml/kg/hora (el material decía 15); Plan C con 20 ml/kg de solución fisiológica o Ringer lactato en 15 a 20 minutos (el material decía 20 a 30 ml/kg en 30 minutos); ibuprofeno no se indica en la deshidratación; metoclopramida y antidiarreicos contraindicados.'],
  ped_bronquiolitis: ['BORRADOR: texto de la situación de la estación, guion de la madre, signos vitales y estudios (el material solo trae la guía de preguntas y la conducta).', 'Se siguen las sugerencias: oxígeno solo si la saturación es menor de 92 % (el material lo indicaba siempre, mezclado con el caso de BOR), sin corticoides, sin antibióticos, sin kinesioterapia de rutina; salbutamol solo como prueba terapéutica que se suspende si no responde; alimentación fraccionada y sonda nasogástrica si la frecuencia respiratoria supera 60 a 80.', 'Escala de Tal: se usó frecuencia respiratoria, sibilancias y tiraje (6 puntos = moderada); las fuentes difieren en si incluyen la frecuencia cardíaca.'],
  ped_talla_baja: ['BORRADOR: casi todo el guion y los estudios. Se plantea hipotiroidismo adquirido como hipótesis de trabajo para hacer coherentes los datos del caso (talla 107 cm, peso 28 kg, bajo rendimiento escolar).', 'Observación: con 28 kg y 107 cm el índice de masa corporal es de 24,5 kg/m², aumentado para la edad; se mantiene porque es un dato del caso y es compatible con hipotiroidismo.', 'No se indica dosis de levotiroxina porque no hay fuente en el material; el caso termina en derivación a endocrinología pediátrica.'],
  ped_vacunas_atrasadas: ['BORRADOR: examen físico, guion y actitud de la madre.', 'Se siguen las sugerencias: diarrea leve sin deshidratación es falsa contraindicación (el material decía diferir las vacunas); rotavirus no corresponde (límites de 14 semanas y 6 días la primera dosis y 8 meses la segunda); esquema 100 % IPV; meningococo en 7 a 23 meses con refuerzo a los 15 meses; antigripal en 2 dosis con 4 semanas de intervalo; el esquema nunca se reinicia.', 'FALTA INFORMACIÓN: no figura en el material la cantidad exacta de dosis de neumococo para la recuperación a los 8 meses; la rúbrica solo pide indicarla.']
};

// --- ejecuta el motor del examen en un contexto simulado para obtener el prompt real de cada caso
const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {}, appendChild() {}, remove() {}, set innerHTML(v) {}, set textContent(v) {}, querySelector: () => null });
const leer = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');
const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, URLSearchParams,
  EXAM_PROMPTS_POR_MATERIA: {}, TEMAS_ESTACION_POR_MATERIA: {}, DESCRIPCIONES_POR_MATERIA: {},
  document: { querySelector: () => el(), createElement: el, body: { appendChild() {} }, addEventListener() {} },
  localStorage: { getItem: (k) => (k === 'nika_currentUser' ? JSON.stringify({ role: 'admin' }) : null), setItem() {}, removeItem() {} },
  fetch: async (url) => ({ json: async () => JSON.parse(leer(url)) }),
  matchMedia: () => ({ matches: false }), navigator: { onLine: true }, confirm: () => true,
};
sandbox.window = sandbox; sandbox.addEventListener = () => {};
vm.createContext(sandbox);
vm.runInContext(leer('js/examPromptsMaterias.js'), sandbox);
vm.runInContext(leer('js/formatoEvaluacion.js'), sandbox);
vm.runInContext(leer('js/pfoEcoe.js'), sandbox);

(async () => {
  const ids = fs.readdirSync(path.join(raiz, 'data/pfo/casos')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  const indice = ['# Auditoría de los casos de Pediatría del ECOE FINAL', '', 'Cada archivo trae: la ficha del caso, la rúbrica con puntaje, las decisiones y datos de borrador, y el prompt completo que recibe la IA.', ''];
  for (const id of ids) {
    const c = JSON.parse(leer('data/pfo/casos/' + id + '.json'));
    const prompt = await sandbox.__PFO.prompt(c.area, id);
    let md = `# ${c.nombre}\n\nIdentificador: \`${id}\` · Estación: ${c.area} · Duración: ${c.duracionMin} minutos · Estado: **${c.estado || 'borrador'}**\n\n`;
    md += `## Notas de borrador y decisiones (para validar)\n${(NOTAS[id] || ['Sin notas.']).map((n) => '- ' + n).join('\n')}\n\n`;
    md += `## Situación de partida\n${c.situacion}\n\n## Objetivos\n${c.objetivos.map((o, i) => (i + 1) + '. ' + o).join('\n')}\n\n`;
    md += `## Interlocutor\n${c.interlocutor}\n\n## Guion del paciente\n${c.guion_paciente}\n\n## Datos clínicos (se entregan solo si el alumno examina)\n${c.datos_clinicos}\n\n`;
    md += `## Estudios (se entregan solo si el alumno los pide)\n${c.estudios.map((e) => '- **' + e.clave + ':** ' + e.texto).join('\n')}\n\n`;
    md += `## Rúbrica (100 puntos; umbral ${c.umbral_aprobacion})\n\n| N.º | Bloque | Ítem | Máx. | Regular (mitad) | Suficiente (máximo) |\n|---|---|---|---|---|---|\n${c.rubrica.map((r) => `| ${r.id} | ${r.bloque} | ${r.texto} | ${r.max} | ${r.regular} | ${r.suficiente} |`).join('\n')}\n\n`;
    md += `## Errores críticos (si el alumno comete uno, la estación no supera 5)\n${(c.errores_criticos || []).map((x) => '- ' + x).join('\n')}\n\n`;
    md += `## Prompt completo que recibe la IA\n\n\`\`\`\n${prompt}\n\`\`\`\n`;
    fs.writeFileSync(path.join(salida, id + '.md'), md);
    indice.push(`- [${c.nombre}](${id}.md) — ${c.duracionMin} min, ${c.rubrica.length} ítems`);
  }
  fs.writeFileSync(path.join(salida, '00_INDICE.md'), indice.join('\n') + '\n');
  console.log('ok', ids.length, 'casos en', salida);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
