// js/offlineStorage.js
// ============================================================================
// CAMPUS NIKA — Capa de persistencia local (IndexedDB) para el Modo Guardia
// ----------------------------------------------------------------------------
// Base:  CampusNikaDB  (v1)
// Stores:
//   bancos_up   key = "<modulo>_<upId>"  (ej. "cirugia_01")  -> preguntas de una UP
//   nikafarma   key = "full" | "meta"                         -> vademécum completo + metadatos
//   sync_queue  key = id                                      -> acciones pendientes de subir
//                                                                {id, tipo, payload, timestamp, intentos, ...}
//
// Sin librerías externas. Todo devuelve Promesas. Expuesto como window.OfflineStorage.
//
// Tipos válidos de la cola: 'resultado_examen' | 'progreso_estudio' | 'errata'
// ============================================================================

const OfflineStorage = (() => {
  const DB_NAME = 'CampusNikaDB';
  const DB_VERSION = 1;
  const STORE_UP = 'bancos_up';
  const STORE_FARMA = 'nikafarma';
  const STORE_QUEUE = 'sync_queue';
  const TIPOS_VALIDOS = ['resultado_examen', 'progreso_estudio', 'errata'];

  let _dbPromise = null;

  // ------------------------------------------------------------
  // Apertura de la base (una sola vez, con migración de esquema)
  // ------------------------------------------------------------
  function abrir() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Este navegador no soporta IndexedDB.'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(STORE_UP)) {
          const s = db.createObjectStore(STORE_UP, { keyPath: 'key' });
          s.createIndex('modulo', 'modulo', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_FARMA)) {
          db.createObjectStore(STORE_FARMA, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          const q = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
          q.createIndex('timestamp', 'timestamp', { unique: false });
          q.createIndex('tipo', 'tipo', { unique: false });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        // Si otra pestaña actualiza el esquema, cerramos para no bloquearla.
        db.onversionchange = () => { db.close(); _dbPromise = null; };
        resolve(db);
      };
      req.onerror = () => { _dbPromise = null; reject(req.error || new Error('No se pudo abrir CampusNikaDB.')); };
      req.onblocked = () => console.warn('[OfflineStorage] Apertura bloqueada por otra pestaña.');
    });
    return _dbPromise;
  }

  // Helper genérico: ejecuta una operación sobre un store y devuelve su resultado.
  async function _tx(store, modo, fn) {
    const db = await abrir();
    return new Promise((resolve, reject) => {
      let resultado;
      const tx = db.transaction(store, modo);
      const os = tx.objectStore(store);
      try {
        const req = fn(os);
        if (req) req.onsuccess = () => { resultado = req.result; };
      } catch (e) { reject(e); return; }
      tx.oncomplete = () => resolve(resultado);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Transacción abortada (¿sin espacio?).'));
    });
  }

  const _bytes = (obj) => { try { return new Blob([JSON.stringify(obj)]).size; } catch (_) { return 0; } };
  const _id = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const _keyUP = (modulo, upId) => `${modulo}_${upId}`;

  // ============================================================
  // A. BANCOS DE PREGUNTAS POR UP
  // ============================================================
  async function guardarUPLocal(modulo, upId, preguntas) {
    if (!modulo || upId === undefined || upId === null) throw new Error('guardarUPLocal: falta modulo o upId.');
    if (!Array.isArray(preguntas)) throw new Error('guardarUPLocal: "preguntas" debe ser un array.');
    const registro = {
      key: _keyUP(modulo, upId),
      modulo,
      upId: String(upId),
      preguntas,
      total: preguntas.length,
      bytes: _bytes(preguntas),
      updatedAt: new Date().toISOString(),
    };
    await _tx(STORE_UP, 'readwrite', (s) => s.put(registro));
    return { key: registro.key, total: registro.total, bytes: registro.bytes };
  }

  async function obtenerUPLocal(modulo, upId) {
    const r = await _tx(STORE_UP, 'readonly', (s) => s.get(_keyUP(modulo, upId)));
    return r ? r.preguntas : null;
  }

  // Metadatos de las UPs descargadas (sin cargar las preguntas en memoria del UI)
  async function listarUPsLocales(modulo) {
    const todos = await _tx(STORE_UP, 'readonly', (s) => s.getAll());
    return (todos || [])
      .filter((r) => !modulo || r.modulo === modulo)
      .map(({ key, modulo: m, upId, total, bytes, updatedAt }) => ({ key, modulo: m, upId, total, bytes, updatedAt }))
      .sort((a, b) => a.key.localeCompare(b.key, 'es', { numeric: true }));
  }

  async function eliminarUPLocal(modulo, upId) {
    await _tx(STORE_UP, 'readwrite', (s) => s.delete(_keyUP(modulo, upId)));
  }

  // ============================================================
  // B. VADEMÉCUM NIKAFARMA
  // ============================================================
  // Se guardan 2 registros: "full" (el JSON entero) y "meta" (liviano, para mostrar estado).
  async function guardarNikaFarmaLocal(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') throw new Error('guardarNikaFarmaLocal: JSON inválido.');
    const bytes = _bytes(jsonData);
    const meta = {
      key: 'meta',
      version: (jsonData.meta && jsonData.meta.generated_at) || null,
      schema: (jsonData.meta && jsonData.meta.schema_version) || null,
      farmacos: Array.isArray(jsonData.drugs) ? jsonData.drugs.length : 0,
      fichas: Array.isArray(jsonData.entries) ? jsonData.entries.length : 0,
      bytes,
      updatedAt: new Date().toISOString(),
    };
    const db = await abrir();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FARMA, 'readwrite');
      const os = tx.objectStore(STORE_FARMA);
      os.put({ key: 'full', data: jsonData, updatedAt: meta.updatedAt });
      os.put(meta);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('No se pudo guardar el vademécum (¿sin espacio?).'));
    });
    return meta;
  }

  async function obtenerNikaFarmaLocal() {
    const r = await _tx(STORE_FARMA, 'readonly', (s) => s.get('full'));
    return r ? r.data : null;
  }

  async function infoNikaFarmaLocal() {
    const r = await _tx(STORE_FARMA, 'readonly', (s) => s.get('meta'));
    return r || null;
  }

  async function eliminarNikaFarmaLocal() {
    await _tx(STORE_FARMA, 'readwrite', (s) => s.clear());
  }

  // ============================================================
  // C. COLA DE SINCRONIZACIÓN SALIENTE
  // ============================================================
  async function encolarAccion(tipo, payload, extra = {}) {
    if (!TIPOS_VALIDOS.includes(tipo)) throw new Error(`Tipo de acción inválido: "${tipo}".`);
    const item = {
      id: _id(),
      tipo,
      payload,
      timestamp: Date.now(),
      intentos: 0,
      estado: 'pendiente',       // 'pendiente' | 'fallido' (agotó reintentos: requiere acción manual)
      ultimoError: null,
      proximoIntento: 0,         // epoch ms; el syncManager respeta el backoff
      ...extra,
    };
    await _tx(STORE_QUEUE, 'readwrite', (s) => s.add(item));
    return item;
  }

  async function obtenerColaPendiente({ incluirFallidos = false } = {}) {
    const todos = await _tx(STORE_QUEUE, 'readonly', (s) => s.getAll());
    return (todos || [])
      .filter((i) => incluirFallidos || i.estado !== 'fallido')
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async function obtenerColaFallida() {
    const todos = await _tx(STORE_QUEUE, 'readonly', (s) => s.getAll());
    return (todos || []).filter((i) => i.estado === 'fallido').sort((a, b) => a.timestamp - b.timestamp);
  }

  async function contarCola() {
    const todos = await _tx(STORE_QUEUE, 'readonly', (s) => s.getAll());
    const lista = todos || [];
    const fallidos = lista.filter((i) => i.estado === 'fallido').length;
    return { pendientes: lista.length - fallidos, fallidos, total: lista.length };
  }

  // Actualiza campos de un item (intentos, estado, ultimoError, proximoIntento...)
  async function actualizarItemCola(id, cambios) {
    const db = await abrir();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      const os = tx.objectStore(STORE_QUEUE);
      const g = os.get(id);
      g.onsuccess = () => {
        if (!g.result) return;
        os.put({ ...g.result, ...cambios });
      };
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async function eliminarDeCola(id) {
    await _tx(STORE_QUEUE, 'readwrite', (s) => s.delete(id));
  }

  // ============================================================
  // D. ALMACENAMIENTO
  // ============================================================
  async function estimarAlmacenamiento() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        return { usage: usage || 0, quota: quota || 0, disponible: true };
      }
    } catch (_) {}
    return { usage: 0, quota: 0, disponible: false };
  }

  // Pide al navegador que NO borre los datos si hay poco espacio (mejor en PWA instalada).
  async function pedirAlmacenamientoPersistente() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      }
    } catch (_) {}
    return false;
  }

  function formatearBytes(n) {
    if (!n) return '0 KB';
    if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    abrir,
    // bancos
    guardarUPLocal, obtenerUPLocal, listarUPsLocales, eliminarUPLocal,
    // vademécum
    guardarNikaFarmaLocal, obtenerNikaFarmaLocal, infoNikaFarmaLocal, eliminarNikaFarmaLocal,
    // cola
    encolarAccion, obtenerColaPendiente, obtenerColaFallida, contarCola, actualizarItemCola, eliminarDeCola,
    // utilidades
    estimarAlmacenamiento, pedirAlmacenamientoPersistente, formatearBytes,
    TIPOS_VALIDOS,
  };
})();

window.OfflineStorage = OfflineStorage;
