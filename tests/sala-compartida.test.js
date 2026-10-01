// Ejecutar: node --test tests/
// Sala de espera del Pomodoro compartido: hasta 4 invitados, solo invitados, reloj en espera hasta que el Host inicia.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

function cargar() {
  const store = {};
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  const win = { NikaSupabase: { client: {}, getNikaCurrentUsername: () => 'host' }, addEventListener() {}, dispatchEvent() {}, CustomEvent: class {} };
  const ctx = {
    window: win, localStorage, navigator: { onLine: false },
    document: { addEventListener() {}, getElementById: () => null, title: '', hidden: false },
    console: { log() {}, warn() {}, error() {} },
    setTimeout: () => 0, setInterval: () => 0, clearInterval() {}, clearTimeout() {},
    BroadcastChannel: class { postMessage() {} close() {} }, CustomEvent: class {},
    Date, JSON, Math, parseInt, Promise, Object, String, Number, Array, Set, Map, Worker: undefined, Blob: class {}, URL: { createObjectURL: () => '' },
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/../js/pomodoroEngine.js', 'utf8'), ctx);
  localStorage.setItem('nika_currentUser', JSON.stringify({ id: 'u1', username: 'host' }));
  return win.PomodoroEngine;
}

test('abrir sala no arranca el reloj', () => {
  const E = cargar();
  const r = E.openRoom();
  assert.ok(r.ok);
  assert.strictEqual(E.getState().status, 'idle');
  assert.strictEqual(E.getState().shared.role, 'host');
});

test('hasta 4 invitados; el quinto se rechaza', () => {
  const E = cargar();
  E.openRoom();
  ['a', 'b', 'c', 'd'].forEach((u) => assert.ok(E.becomeHost(u).ok));
  const r = E.becomeHost('e');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'full');
});

test('solo entra quien fue invitado', () => {
  const E = cargar();
  E.openRoom();
  E.becomeHost('a');
  assert.strictEqual(E.registerGuestJoined('intruso').reason, 'no_invitado');
  assert.ok(E.registerGuestJoined('a').ok);
  assert.deepStrictEqual(Array.from(E.getSharedInfo().guests.filter((g) => g.joined).map((g) => g.username)), ['a']);
});

test('una invitacion rechazada libera el lugar; al salir un invitado tambien', () => {
  const E = cargar();
  E.openRoom();
  ['a', 'b', 'c', 'd'].forEach((u) => E.becomeHost(u));
  assert.ok(E.releaseInvite('d'));
  assert.ok(E.becomeHost('e').ok);
  E.registerGuestJoined('a');
  E.partnerLeft('a');
  assert.ok(E.becomeHost('f').ok);
});

test('el reloj arranca recien cuando el Host inicia, con la duracion completa', () => {
  const E = cargar();
  E.openRoom();
  E.becomeHost('a'); E.registerGuestJoined('a');
  assert.strictEqual(E.getState().status, 'idle');
  E.start();
  const st = E.getState();
  assert.strictEqual(st.status, 'running');
  assert.ok(st.remainingSeconds >= E.getMinutes('work') * 60 - 1);
});

test('no se puede abrir una sala con el reloj ya en marcha', () => {
  const E = cargar();
  E.start();
  assert.strictEqual(E.openRoom().ok, false);
});
