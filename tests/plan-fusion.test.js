// NikaPlan: la fusión entre dispositivos no debe perder horas de Pomodoro ni temas tildados
const test = require('node:test');
const assert = require('node:assert');
global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
require('../js/planFusion.js');
const F = window.NikaPlanFusion;

const base = () => ({
  id: 'p1', titulo: 'Parcial', materia: 'ginecologia', fecha_examen: '2026-10-26', actualizado_en: '2026-10-20T10:00:00Z',
  dias: [{ id: 'd1', fecha: '2026-10-21', horas: 8, temas: [{ id: 't1', hecho: false }, { id: 't2', hecho: false }], checklist: [] }],
});

test('las horas de Pomodoro de un dispositivo no se pierden si el otro edita después', () => {
  const celu = base(); celu.dias[0].estudiado = 3; celu.actualizado_en = '2026-10-21T09:00:00Z';
  const pc = base(); pc.dias[0].temas[0].hecho = true; pc.dias[0].temas[0].hecho_ts = '2026-10-21T12:00:00Z'; pc.actualizado_en = '2026-10-21T12:00:00Z';
  const m = F.fusionar(celu, pc);
  assert.strictEqual(m.dias[0].estudiado, 3);
  assert.strictEqual(m.dias[0].temas[0].hecho, true);
  const m2 = F.fusionar(pc, celu);
  assert.strictEqual(m2.dias[0].estudiado, 3);
  assert.strictEqual(m2.dias[0].temas[0].hecho, true);
});

test('destildar un tema en el dispositivo más nuevo se respeta', () => {
  const a = base(); a.dias[0].temas[0].hecho = true; a.dias[0].temas[0].hecho_ts = '2026-10-21T08:00:00Z';
  const b = base(); b.dias[0].temas[0].hecho = false; b.dias[0].temas[0].hecho_ts = '2026-10-21T09:00:00Z'; b.actualizado_en = '2026-10-21T09:00:00Z';
  assert.strictEqual(F.fusionar(a, b).dias[0].temas[0].hecho, false);
  assert.strictEqual(F.fusionar(b, a).dias[0].temas[0].hecho, false);
});

test('datos viejos sin marca: lo hecho se conserva', () => {
  const a = base(); a.dias[0].temas[1].hecho = true;
  const b = base(); b.actualizado_en = '2026-10-22T00:00:00Z';
  assert.strictEqual(F.fusionar(b, a).dias[0].temas[1].hecho, true);
});

test('fusionarEnSitio no reemplaza los objetos en pantalla', () => {
  const p = base(); const t0 = p.dias[0].temas[0];
  const otro = base(); otro.dias[0].estudiado = 2;
  F.fusionarEnSitio(p, otro);
  assert.strictEqual(p.dias[0].temas[0], t0);
  assert.strictEqual(p.dias[0].estudiado, 2);
});
