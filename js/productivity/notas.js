// js/productivity/notas.js
// Módulo de Notas Sincronizadas — Campus Nika (Cloud Sync Blindado)

const NotasModule = (() => {
  let debounceTimer = null;
  let currentModuleId = null;
  let currentUpId = null;
  let textareaEl = null;
  let statusEl = null;

  const DEBOUNCE_MS = 1000;

  function localKey(moduleId, upId) {
    return `nika_note_${moduleId}_${upId}`;
  }

  function setStatus(text, mode) {
    if (!statusEl) return;
    const colorMap = { saved: '#16a34a', saving: '#ca8a04', error: '#dc2626', idle: '#94a3b8' };
    const dotColor = colorMap[mode] || '#16a34a';
    statusEl.innerHTML = `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${dotColor}; margin-right:4px;"></span> ${text}`;
  }

  function renderShell(container) {
    container.innerHTML = `
      <div style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 1px solid rgba(234, 179, 8, 0.35); border-radius: 14px; padding: 18px; box-shadow: 0 4px 15px rgba(202, 138, 4, 0.06); font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-weight: 800; color: #713f12; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">📌 Apuntes de la Unidad</span>
          <span id="notas-status" style="font-size: 0.7rem; font-weight: 700; color: #713f12; display: flex; align-items: center;">
            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#16a34a; margin-right:4px;"></span> Cargando...
          </span>
        </div>
        <textarea
          id="notas-textarea"
          placeholder="Escribí tus perlas clínicas, dudas o resúmenes..."
          style="width: 100%; min-height: 220px; resize: vertical; border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 10px; padding: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.85rem; color: #422006; background: #fffdf0; outline: none; box-sizing: border-box; transition: border-color 0.2s;"
        ></textarea>
      </div>
    `;
    textareaEl = container.querySelector('#notas-textarea');
    statusEl = container.querySelector('#notas-status');
    textareaEl.addEventListener('input', handleInput);
  }

  function loadFromLocalStorage(moduleId, upId) {
    return localStorage.getItem(localKey(moduleId, upId)) || '';
  }

  function saveToLocalStorage(moduleId, upId, content) {
    localStorage.setItem(localKey(moduleId, upId), content);
  }

  // BUSCADOR ROBUSTO DE SUPABASE
  function getDbClient() {
    return window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || window.supabase;
  }

  // Solo se confía en la sesión real de Supabase (no en datos editables de localStorage).
  async function getUserId() {
    try {
      const client = getDbClient();
      if (client && client.auth) {
        const { data: { session } } = await client.auth.getSession();
        if (session && session.user) return session.user.id;
      }
    } catch (e) {}
    return null;
  }

  async function fetchFromSupabase(moduleId, upId) {
    try {
      const client = getDbClient();
      if (!client) return null;
      const userId = await getUserId();
      if (!userId) return null;

      const { data, error } = await client
        .from('study_notes') // CORREGIDO a study_notes
        .select('content, updated_at')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('up_id', upId)
        .maybeSingle();

      if (error) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  async function upsertToSupabase(moduleId, upId, content) {
    try {
      const userId = await getUserId();
      if (!userId) {
        setStatus('Iniciá sesión', 'error');
        return;
      }

      const client = getDbClient();
      if (!client) {
        setStatus('Guardado Local', 'saved');
        return;
      }

      setStatus('Guardando...', 'saving');

      // INYECCIÓN MANUAL: Soluciona el problema de los constraints eliminados
      const { data: existing } = await client
        .from('study_notes') // CORREGIDO a study_notes
        .select('id')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('up_id', upId)
        .maybeSingle();

      let err = null;

      if (existing) {
        const { error } = await client
          .from('study_notes') // CORREGIDO a study_notes
          .update({ content: content, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        err = error;
      } else {
        const { error } = await client
          .from('study_notes') // CORREGIDO a study_notes
          .insert({
            user_id: userId,
            module_id: moduleId,
            up_id: upId,
            content: content,
            updated_at: new Date().toISOString()
          });
        err = error;
      }

      if (err) {
        console.warn('[Notas] Error:', err.message);
        setStatus('Guardado Local', 'saved');
        return;
      }

      setStatus('Sincronizado', 'saved');
    } catch (err) {
      setStatus('Guardado Local', 'saved');
    }
  }

  function handleInput() {
    const content = textareaEl.value;
    saveToLocalStorage(currentModuleId, currentUpId, content);
    setStatus('Escribiendo...', 'idle');

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      upsertToSupabase(currentModuleId, currentUpId, content);
    }, DEBOUNCE_MS);
  }

  async function open(moduleId, upId, containerId = 'notas-placeholder') {
    currentModuleId = moduleId;
    currentUpId = upId;

    const container = document.getElementById(containerId);
    if (!container) return;

    renderShell(container);

    textareaEl.value = loadFromLocalStorage(moduleId, upId);
    
    const userId = await getUserId();
    if (!userId) {
        setStatus('Modo Local (Iniciá Sesión)', 'idle');
        return;
    }
    
    setStatus('Conectando...', 'saving');

    const remote = await fetchFromSupabase(moduleId, upId);
    
    if (remote && typeof remote.content === 'string' && document.activeElement !== textareaEl) {
      if (textareaEl.value.trim() === '' || remote.content.length > textareaEl.value.length) {
          textareaEl.value = remote.content;
          saveToLocalStorage(moduleId, upId, remote.content);
      }
    }
    
    setStatus('Sincronizado', 'saved');
  }

  function destroy() {
    clearTimeout(debounceTimer);
    if (textareaEl) textareaEl.removeEventListener('input', handleInput);
    textareaEl = null;
    statusEl = null;
  }

  return { open, destroy };
})();