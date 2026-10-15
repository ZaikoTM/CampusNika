/* CAMPUS NIKA · Voz local (Piper TTS en un Web Worker).
   La síntesis corre en el dispositivo del alumno: sin servidor, sin costo y sin depender de la IA. Las voces se descargan
   una sola vez a la memoria privada del navegador (OPFS) y quedan disponibles sin conexión.
   Protocolo: postMessage({ id, cmd, voz?, texto? }) → { id, tipo: 'progreso'|'listo'|'error', ... } */
import { TtsSession, download, remove, stored } from './vendor/piper/piper-tts-web.js';

const BASE = new URL('./vendor/', import.meta.url);
const WASM = {
  onnxWasm: new URL('ort/', BASE).href,
  piperData: new URL('piper/piper_phonemize.data', BASE).href,
  piperWasm: new URL('piper/piper_phonemize.wasm', BASE).href
};
let sesion = null, vozActual = null, cola = Promise.resolve();

async function asegurar(voz, progreso) {
  if (sesion && vozActual === voz) return sesion;
  TtsSession._instance = null;                 // el paquete reutiliza un único modelo: se reinicia al cambiar de voz
  sesion = null; vozActual = null;
  sesion = await TtsSession.create({ voiceId: voz, wasmPaths: WASM, progress: progreso });
  vozActual = voz;
  return sesion;
}

// Una voz cuenta como guardada solo si el modelo (.onnx) y su configuración (.json) están completos en el almacenamiento del navegador.
const MIN_BYTES = { 'es_AR-daniela-high': 90e6, 'es_MX-ald-medium': 50e6 };
async function completas() {
  const ok = [];
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('piper', { create: true });
    const tam = {};
    for await (const [nombre, h] of dir.entries()) { if (h.kind === 'file') { try { tam[nombre] = (await h.getFile()).size; } catch (_) { tam[nombre] = 0; } } }
    Object.keys(tam).forEach((n) => {
      if (!n.endsWith('.onnx')) return;
      const voz = n.slice(0, -5), min = MIN_BYTES[voz] || 1e6;
      if (tam[n] >= min && (tam[n + '.json'] || 0) > 100) ok.push(voz);
    });
  } catch (_) {}
  return ok;
}
const responder = (id, datos, transfer) => self.postMessage(Object.assign({ id }, datos), transfer || []);

async function atender(m) {
  const { id, cmd, voz, texto } = m;
  try {
    if (cmd === 'guardadas') {
      responder(id, { tipo: 'listo', voces: await completas() });
    } else if (cmd === 'descargar') {
      await download(voz, (p) => { if (p && p.total) responder(id, { tipo: 'progreso', cargado: p.loaded, total: p.total }); });
      // se comprueba que quedó realmente guardada (modo privado, poco espacio o permisos pueden impedirlo sin dar error)
      if (!(await completas()).includes(voz)) {
        try { await remove(voz); } catch (_) {}
        throw new Error('Tu navegador no pudo guardar la voz (¿modo privado o poco espacio?). Probá en una ventana normal o liberá espacio.');
      }
      responder(id, { tipo: 'listo' });
    } else if (cmd === 'borrar') {
      await remove(voz);
      if (vozActual === voz) { sesion = null; vozActual = null; TtsSession._instance = null; }
      responder(id, { tipo: 'listo' });
    } else if (cmd === 'hablar') {
      const s = await asegurar(voz, (p) => { if (p && p.total) responder(id, { tipo: 'progreso', cargado: p.loaded, total: p.total }); });
      const wav = await s.predict(texto);
      const buf = await wav.arrayBuffer();
      responder(id, { tipo: 'listo', wav: buf }, [buf]);
    } else {
      responder(id, { tipo: 'error', mensaje: 'Comando desconocido: ' + cmd });
    }
  } catch (e) {
    responder(id, { tipo: 'error', mensaje: String((e && e.message) || e) });
  }
}

// las síntesis se encolan: un solo trabajo pesado a la vez
self.onmessage = (ev) => { cola = cola.then(() => atender(ev.data)); };
self.postMessage({ id: 0, tipo: 'iniciado' });
