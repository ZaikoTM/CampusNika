// Ejecutar: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

function cargarMotor({ insertError = null, filasExistentes = 0, online = true, syncManager } = {}) {
  const store = {};
  const inserts = [];
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  const q = () => {
    const b = { eq: () => b, then: (ok) => ok({ error: null, count: filasExistentes }) };
    return b;
  };
  const client = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }) },
    from: () => ({
      select: () => q(),
      insert: async (row) => { if (insertError) return { error: insertError }; inserts.push(row); return { error: null }; },
    }),
  };
  const win = { NikaSupabase: { client }, SyncManager: syncManager, addEventListener() {}, dispatchEvent() {}, CustomEvent: class {} };
  const ctx = {
    window: win, localStorage, navigator: { onLine: online },
    document: { addEventListener() {}, getElementById: () => null, title: '', hidden: false },
    console: { log() {}, warn() {}, error() {} },
    setTimeout: () => 0, setInterval: () => 0, clearInterval() {}, clearTimeout() {},
    BroadcastChannel: class { postMessage() {} close() {} }, CustomEvent: class {},
    Date, JSON, Math, parseInt, Promise, Object, String, Number, Array, Set, Map,
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/../js/pomodoroEngine.js', 'utf8'), ctx);
  localStorage.setItem('nika_currentUser', JSON.stringify({ id: 'u1' }));
  return { win, store, inserts };
}

const esperar = (ms = 20) => new Promise((r) => setImmediate(() => setTimeout(r, ms)));

test('sube directo y no deja pendientes', async () => {
  const { win, store, inserts } = cargarMotor();
  await win.PomodoroEngine._test.registerStudySession('cirugia', 'UP7', 25);
  assert.strictEqual(inserts.length, 1);
  assert.strictEqual(inserts[0].duration_minutes, 25);
  assert.deepStrictEqual(win.PomodoroEngine._test.readPending(), []);
});

test('si el insert falla queda en cola local con synced:false (aunque SyncManager esté incompleto)', async () => {
  const { win } = cargarMotor({ insertError: { message: 'boom', code: '500' }, syncManager: { algo: 1 } });
  await win.PomodoroEngine._test.registerStudySession('cirugia', 'UP7', 30);
  const p = win.PomodoroEngine._test.readPending();
  assert.strictEqual(p.length, 1);
  assert.strictEqual(p[0].synced, false);
  assert.strictEqual(p[0].duration_minutes, 30);
});

test('dos sesiones distintas se guardan por separado', async () => {
  const { win } = cargarMotor({ insertError: { message: 'boom', code: '500' } });
  await win.PomodoroEngine._test.registerStudySession('cirugia', 'UP7', 30);
  const [fila] = win.PomodoroEngine._test.readPending();
  assert.ok(fila);
  await win.PomodoroEngine._test.registerStudySession('cirugia', 'UP7', 30);
  assert.strictEqual(win.PomodoroEngine._test.readPending().length, 2); // instantes distintos = sesiones distintas
});

test('flushPending sube lo local y lo limpia', async () => {
  const c = cargarMotor();
  c.store.nika_pending_sessions = JSON.stringify([
    { modulo: 'cirugia', up_id: 'UP7', duration_minutes: 30, completed: true, completed_at: '2026-09-29T10:00:00.000Z', synced: false },
  ]);
  await c.win.PomodoroEngine._test.flushPending();
  assert.strictEqual(c.inserts.length, 1);
  assert.strictEqual(c.inserts[0].user_id, 'u1');
  assert.strictEqual(c.inserts[0].synced, undefined);
  assert.deepStrictEqual(c.win.PomodoroEngine._test.readPending(), []);
});

test('flushPending no inserta si la fila ya existe en Supabase', async () => {
  const c = cargarMotor({ filasExistentes: 1 });
  c.store.nika_pending_sessions = JSON.stringify([
    { modulo: 'cirugia', up_id: 'UP7', duration_minutes: 30, completed: true, completed_at: '2026-09-29T10:00:00.000Z', synced: false },
  ]);
  await c.win.PomodoroEngine._test.flushPending();
  assert.strictEqual(c.inserts.length, 0);
  assert.deepStrictEqual(c.win.PomodoroEngine._test.readPending(), []);
});

test('error 23505 (índice único) cuenta como ya guardada', async () => {
  const c = cargarMotor({ insertError: { message: 'dup', code: '23505' } });
  await c.win.PomodoroEngine._test.registerStudySession('cirugia', 'UP7', 20);
  assert.deepStrictEqual(c.win.PomodoroEngine._test.readPending(), []);
});
