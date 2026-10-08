// Genera data/pfo/procedimientos.json a partir de las listas de cotejo de las acreditaciones (data/acreditaciones/*/<id>.json).
// El ECOE FINAL usa esos pasos para la parte práctica escrita de un procedimiento (la IA corrige lo que el alumno describe).
// Uso: node tools/generar_procedimientos_pfo.js
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const FUENTES = [
  ['siam', 'sv'], ['siam', 'tr'], ['siam', 'iet'], ['siam', 'rcp'], ['siam', 'artro'],
  ['sim', 'anamg'], ['sim', 'anamo'], ['sim', 'egfpp'], ['sim', 'exgin'], ['sim', 'exmam'], ['sim', 'exobs'],
  ['cir', 'lav'],
];
const salida = { version: 1, tiempo_max_min: 5, procedimientos: {} };
FUENTES.forEach(([area, id]) => {
  const d = JSON.parse(fs.readFileSync(path.join(raiz, 'data', 'acreditaciones', area, id + '.json'), 'utf8'));
  salida.procedimientos[id] = {
    id, area, titulo: d.titulo, icono: d.icono, umbral: d.umbral || 60,
    criterios_texto: d.criterios_texto || '',
    pasos: d.pasos.map((p) => ({ n: p.n, texto: p.texto, fase: p.fase || '', critico: !!p.critico })),
  };
});
fs.writeFileSync(path.join(raiz, 'data', 'pfo', 'procedimientos.json'), JSON.stringify(salida, null, 1));
console.log('procedimientos:', Object.keys(salida.procedimientos).length);
