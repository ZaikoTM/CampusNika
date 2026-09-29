// Pegar en DevTools (campus.html abierto y con sesión iniciada).
// 1) Rescata la cola offline (IndexedDB sync_queue, incluidos "fallidos") y
// 2) opcionalmente reconstruye lo que solo quedó en localStorage nika_time_*.
// Sin duplicados: omite filas con mismo user_id + completed_at + modulo + up_id.
(async () => {
  const UID = 'a3e43ef0-a24d-46d9-9612-8c27ea78af83';
  const DRY_RUN = true;            // ponelo en false para insertar de verdad
  const INCLUIR_LOCALSTORAGE = 'auto'; // 'auto': si la cola no aporta nada nuevo, usa nika_time_*; true: siempre; false: nunca
  // Pomodoros de hoy que no quedaron registrados en ningún lado: cargalos a mano (hora aprox. de FIN de cada uno).
  // Ej: { modulo: 'cirugia', up_id: 'UP6', minutes: 25, fin: '2026-09-29T15:30' }
  // Hoy: 3 h de UP7 Cirugía = 6 bloques de 30 min (ajustá 'fin' si querés horas reales).
  const hoy = new Date().toISOString().slice(0, 10);
  const MANUAL = [0, 1, 2, 3, 4, 5].map(i => ({ modulo: 'cirugia', up_id: 'UP7', minutes: 30, fin: new Date(Date.now() - (5 - i) * 35 * 60000).toISOString() }));
  const L = (...a) => console.log('[Rescate]', ...a);

  const c = window.NikaSupabase?.client || window.NikaSupabase?.supabase || window.supabaseClient;
  const { data: { session } } = await c.auth.getSession();
  if (!session || session.user.id !== UID) return console.error('[Rescate] La sesión activa no es', UID);

  // --- leer la cola IndexedDB
  const db = await new Promise((ok, ko) => { const r = indexedDB.open('CampusNikaDB'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
  const items = await new Promise((ok, ko) => { const r = db.transaction('sync_queue').objectStore('sync_queue').getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
  let filas = items.filter(i => i.tipo === 'progreso_estudio' && i.payload?.row)
    .map(i => ({ id: i.id, row: { ...i.payload.row, user_id: UID } }));
  L('Ítems en cola:', filas.length);

  // --- existentes en Supabase
  const { data: exist, error } = await c.from('study_sessions').select('modulo,up_id,duration_minutes,completed_at').eq('user_id', UID).limit(5000);
  if (error) return console.error('[Rescate] No se pudo leer study_sessions:', error);
  const k = r => [r.modulo, r.up_id, new Date(r.completed_at).getTime()].join('|');
  const ya = new Set(exist.map(k));

  // --- diferencias de localStorage (nika_time_* vs Supabase): en 'auto' solo si la cola no aporta nada nuevo
  const colaAporta = filas.some(f => !ya.has(k(f.row)));
  const usarLS = INCLUIR_LOCALSTORAGE === true || (INCLUIR_LOCALSTORAGE === 'auto' && !colaAporta);
  if (usarLS) L('Cola vacía o sin novedades: calculando diferencia con localStorage (nika_time_*)…');
  if (usarLS) {
    const conf = {}; exist.forEach(r => { const q = r.modulo + '|' + r.up_id; conf[q] = (conf[q] || 0) + (r.duration_minutes || 0); });
    const enCola = {}; filas.forEach(f => { const q = f.row.modulo + '|' + f.row.up_id; enCola[q] = (enCola[q] || 0) + f.row.duration_minutes; });
    Object.keys(localStorage).filter(x => x.startsWith('nika_time_')).forEach(key => {
      const [modulo, ...up] = key.slice(10).split('_'); const up_id = up.join('_');
      const dif = (parseInt(localStorage[key], 10) || 0) - (conf[modulo + '|' + up_id] || 0) - (enCola[modulo + '|' + up_id] || 0);
      if (dif > 0) filas.push({ id: null, row: { user_id: UID, modulo, up_id, duration_minutes: dif, completed: true, completed_at: new Date().toISOString() } });
    });
  }

  const up7 = exist.find(r => r.modulo === 'cirugia' && /(^|\D)0*7$/.test(String(r.up_id)));
  if (up7) MANUAL.forEach(m => { m.up_id = up7.up_id; });
  L('up_id usado para UP7:', MANUAL[0] && MANUAL[0].up_id, up7 ? '(tomado de tus filas existentes)' : '(no había UP7 previa: verificá el formato en la tabla)');
  MANUAL.forEach(m => filas.push({ id: null, row: { user_id: UID, modulo: m.modulo, up_id: m.up_id, duration_minutes: m.minutes, completed: true, completed_at: new Date(m.fin).toISOString() } }));
  try { JSON.parse(localStorage.getItem('nika_pending_sessions') || '[]').forEach(r => filas.push({ id: null, row: { ...r, user_id: UID, synced: undefined } })); } catch (_) {}
  const nuevas = filas.filter(f => !ya.has(k(f.row)));
  L(`Nuevas: ${nuevas.length} · ya en Supabase: ${filas.length - nuevas.length} · minutos: ${nuevas.reduce((a, f) => a + f.row.duration_minutes, 0)}`);
  console.table(nuevas.map(f => f.row));
  if (DRY_RUN) return L('DRY_RUN activo: no se insertó nada. Cambialo a false.');

  const rows = nuevas.map(f => f.row);
  let r = await c.from('study_sessions').insert(rows);
  if (r.error && /completed/i.test(r.error.message)) r = await c.from('study_sessions').insert(rows.map(({ completed, ...x }) => x));
  if (r.error) return console.error('[Rescate] ❌ Falló, la cola local queda intacta (synced:false):', r.error);
  L('✅ Confirmado en Supabase:', rows.length);

  // limpiar de la cola las ya subidas (o duplicadas)
  const borrar = filas.filter(f => f.id);
  await new Promise(ok => { const t = db.transaction('sync_queue', 'readwrite'); borrar.forEach(f => t.objectStore('sync_queue').delete(f.id)); t.oncomplete = ok; });
  L('Cola limpiada:', borrar.length);
  window.NikaRendimiento?.avisarCambio?.({ origen: 'rescate' });
  window.dispatchEvent(new CustomEvent('nika:sync-done'));
})();
