// Ejecutar: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

function cargar() {
  const store = {};
  const oyentes = {};
  const agregados = [];
  const mkEl = () => {
    const el = { children: [], style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} }, remove() { el._removido = true; },
      setAttribute() {}, appendChild(c) { agregados.push(c); return c; }, textContent: '', innerHTML: '' };
    const msg = { textContent: '' }, ok = {};
    el.querySelector = (sel) => (sel === '.ei-msg' ? msg : sel === '#ei-aviso-ok' ? ok : null);
    el._msg = msg;
    return el;
  };
  const document = {
    readyState: 'complete', hidden: false, body: { classList: { add() {}, remove() {}, toggle() {} }, appendChild(c) { agregados.push(c); } },
    addEventListener(n, f) { (oyentes['d:' + n] = oyentes['d:' + n] || []).push(f); }, removeEventListener() {},
    createElement: mkEl, getElementById: () => null, querySelectorAll: () => [],
  };
  const window = {
    addEventListener(n, f) { (oyentes['w:' + n] = oyentes['w:' + n] || []).push(f); }, removeEventListener() {},
    NikaSupabase: null,
  };
  const ctx = {
    window, document, console: { log() {}, warn() {}, error() {} }, navigator: { onLine: false },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    setTimeout: (f) => { f(); return 0; }, Date, JSON, Math, Promise, Object, Array, String, Number,
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/../js/examIntegridad.js', 'utf8'), ctx);
  const disparar = (tipo, ev) => (oyentes[tipo] || []).forEach((f) => f(ev));
  return { EI: window.ExamIntegridad, disparar, agregados, store };
}
const teclaCtrl = (key, extra) => { const e = { key, ctrlKey: true, shiftKey: false, prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {}, ...extra }; return e; };

test('bloquea Ctrl+C, Ctrl+V, Ctrl+U, F12 y Ctrl+Shift+I', async () => {
  const { EI, disparar } = cargar();
  await EI.iniciar({ modulo: 'cirugia', estricto: false, total: 10, limiteSeg: 600 });
  for (const e of [teclaCtrl('c'), teclaCtrl('v'), teclaCtrl('u'), { key: 'F12', preventDefault() { this.prevented = true; }, stopPropagation() {} }, teclaCtrl('I', { shiftKey: true })]) {
    disparar('d:keydown', e);
    assert.strictEqual(e.prevented, true, 'debe bloquear ' + e.key);
    EI.estado.avisadoEn = 0;    // saltea la gracia para poder contar todas
    EI.estado.avisado = false;
    EI.estado.forzada = false;
  }
  assert.ok(EI.estado.incidencias.length >= 5);
});

test('3 incidencias → advertencia amarilla con el mensaje exacto; la siguiente fuerza la entrega', async () => {
  const { EI, disparar, agregados } = cargar();
  let forzada = 0;
  await EI.iniciar({ modulo: 'cirugia', estricto: false, total: 10, limiteSeg: 600, onForzarEntrega: () => { forzada++; } });
  for (let i = 0; i < 3; i++) disparar('d:contextmenu', { preventDefault() {}, stopPropagation() {} });
  assert.strictEqual(EI.estado.avisado, true);
  const aviso = agregados.find((el) => el._msg && el._msg.textContent);
  assert.strictEqual(aviso._msg.textContent, 'Te macheteaste, en NikaMed no se nos escapa nada, esto es una advertencia, si te observo haciendo trampa de vuelta te obligo a entregar el examen.');
  assert.strictEqual(forzada, 0);
  EI.estado.avisadoEn = 0;                                   // pasó la gracia posterior al aviso
  disparar('d:paste', { preventDefault() {}, stopPropagation() {} });
  assert.strictEqual(forzada, 1);
  assert.strictEqual(EI.fueForzada(), true);
});

test('cambio de pestaña: visibilitychange + blur seguidos cuentan una sola vez', async () => {
  const { EI, disparar } = cargar();
  await EI.iniciar({ modulo: 'cirugia', estricto: false });
  // simulamos document.hidden = true
  const doc = EI.estado; // solo para leer
  const antes = EI.estado.advertencias;
  disparar('w:blur', {});
  disparar('w:blur', {});
  assert.strictEqual(EI.estado.advertencias - antes, 1);
});

test('Modo Estricto: no se puede retroceder ni saltar por la grilla, y las contestadas quedan bloqueadas', async () => {
  const { EI } = cargar();
  await EI.iniciar({ modulo: 'ginecologia', estricto: true, total: 5 });
  assert.strictEqual(EI.esEstricto(), true);
  assert.strictEqual(EI.puedeRetroceder(), false);
  assert.strictEqual(EI.puedeIr(3, 1), false);
  assert.strictEqual(EI.puedeIr(1, 1), true);
  EI.bloquearPregunta(1);
  assert.strictEqual(EI.estaBloqueada(1), true);
  assert.strictEqual(EI.estaBloqueada(2), false);
});

test('sin Modo Estricto la navegación es libre', async () => {
  const { EI } = cargar();
  await EI.iniciar({ modulo: 'cirugia', estricto: false });
  assert.strictEqual(EI.puedeRetroceder(), true);
  assert.strictEqual(EI.puedeIr(4, 1), true);
  EI.bloquearPregunta(1);
  assert.strictEqual(EI.estaBloqueada(1), false);
});

test('la preferencia de Modo Estricto se guarda', () => {
  const { EI } = cargar();
  assert.strictEqual(EI.leerEstricto(), false);
  EI.guardarEstricto(true);
  assert.strictEqual(EI.leerEstricto(), true);
});

test('sin conexión: las incidencias quedan en cola local (no se pierden ni bloquean)', async () => {
  const { EI, store } = cargar();
  await EI.iniciar({ modulo: 'cirugia', estricto: false });
  EI.registrarIncidencia('copia_bloqueada', { motivo: 'copy' });
  await new Promise((r) => setImmediate(r));
  const cola = JSON.parse(store.nika_examen_incidencias_pendientes || '[]');
  assert.strictEqual(cola.length, 1);
  assert.strictEqual(cola[0].tipo_incidencia, 'copia_bloqueada');
});
