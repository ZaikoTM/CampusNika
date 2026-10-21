// Versus: el Anfitrión debe recibir sus propios estados del duelo (antes se quedaba en "Esperando la primera pregunta…")
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

function cargar() {
  const enviados = [];
  const canal = {
    state: 'joined',
    on() { return canal; },
    subscribe(cb) { if (cb) setTimeout(() => cb('SUBSCRIBED'), 0); return canal; },
    track: async () => 'ok',
    untrack: async () => 'ok',
    presenceState: () => ({ yo: [{}], rival: [{}] }),
    send: async (m) => { enviados.push(m); return 'ok'; },
  };
  const rooms = { insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'room1', room_code: '123456' }, error: null }) }) }) };
  const client = {
    channel: () => canal, removeChannel: async () => {}, getChannels: () => [],
    from: () => rooms, rpc: async () => ({ data: null, error: null }),
  };
  const sandbox = {
    window: { NikaSupabase: { client, ensureVersusPlayer: async () => 'yo', getNikaCurrentUsername: () => 'yo' } },
    console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, Math, Date, Set,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(__dirname + '/../duelosManager.js', 'utf8') + '\nthis.DM = DuelosManager;', sandbox);
  return { DM: sandbox.DM, enviados };
}

test('el anfitrión recibe localmente la pregunta que emite y el invitado la recibe por broadcast', async () => {
  const { DM, enviados } = cargar();
  await DM.crearSala({ roomType: 'code' });
  const recibidos = [];
  DM.onStateChange = (p) => recibidos.push(p);
  await DM.emitirEstado({ tipo: 'pregunta', index: 0, total: 3, questionId: 'q1', pregunta: '¿Algo?', opciones: [] });
  assert.strictEqual(recibidos.length, 1, 'el anfitrión debe ver su propia pregunta');
  assert.strictEqual(recibidos[0].questionId, 'q1');
  assert.ok(enviados.some((m) => m.event === 'duelo_estado' && m.payload.questionId === 'q1'), 'y además se envía al invitado');
});
