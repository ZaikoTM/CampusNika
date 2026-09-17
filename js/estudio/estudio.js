/* ==========================================================
   CAMPUS NIKA — Suite de Estudio (estudio.html)
   TRAMO 1: Carga de datos + ruteo básico entre vistas.
   TRAMO 2: Notas (Supabase) y Pomodoro.
   TRAMO 3: Asistente Bibliográfico Nativo (Cátedra / NotebookLM interno).
   ========================================================== */

// Estado en memoria de la sesión de estudio actual
const EstudioState = {
    modulo: 'cirugia',      // Módulo activo
    data: null,             // contenido completo de data/cirugia.json
    unitsById: {},          // acceso rápido por id de UP
    currentUpId: null       // UP abierta actualmente en el detalle
};

// Metadatos de presentación por tipo de recurso (icono + etiqueta)
const RESOURCE_TYPE_META = {
    pdf:     { label: 'PDF',     iconClass: 'icon-pdf',     icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/>' },
    resumen: { label: 'Resumen', iconClass: 'icon-resumen', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>' },
    apunte:  { label: 'Apunte',  iconClass: 'icon-apunte',  icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>' },
    video:   { label: 'Video',   iconClass: 'icon-video',   icon: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>' }
};

document.addEventListener('DOMContentLoaded', () => {
    initEstudio();
    initModuleChat();
});

async function initEstudio() {
    try {
        const dataFile = `data/${EstudioState.modulo}.json`;
        const res = await fetch(dataFile);
        if (!res.ok) throw new Error(`No se pudo cargar ${dataFile} (HTTP ${res.status})`);

        EstudioState.data = await res.json();
        EstudioState.unitsById = Object.fromEntries(
            EstudioState.data.units.map(u => [u.id, u])
        );

        document.getElementById('dashboard-title').innerText = `Sala de Estudio · ${EstudioState.data.nombre}`;
        renderUpBentoGrid(EstudioState.data.units);
    } catch (err) {
        console.error('[Estudio] Error al inicializar:', err);
        const grid = document.getElementById('up-bento-grid');
        if (grid) {
            grid.innerHTML = `<div class="up-empty-state">No pudimos cargar el contenido de esta materia. Probá recargar la página.</div>`;
        }
    }
}

// ================= RENDER: DASHBOARD =================

function renderUpBentoGrid(units) {
    const grid = document.getElementById('up-bento-grid');
    if (!grid) return;

    if (!units || units.length === 0) {
        grid.innerHTML = `<div class="up-empty-state">No encontramos Unidades Problema que coincidan con tu búsqueda.</div>`;
        return;
    }

    grid.innerHTML = units.map(unit => {
        const matCount = unit.materiales ? unit.materiales.length : 0;
        const vidCount = unit.videos ? unit.videos.length : 0;
        const totalRecursos = matCount + vidCount;
        const objCount = unit.objectives ? unit.objectives.length : 0;

        return `
        <div class="up-card" onclick="openUP('${unit.id}')">
            <div class="up-card-top">
                <span class="up-card-number">UP${unit.number}</span>
                <svg class="up-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <div class="up-card-title">${unit.title}</div>
            <div class="up-card-meta">
                <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    ${objCount} objetivos
                </span>
                <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z"/></svg>
                    ${totalRecursos} recursos
                </span>
            </div>
        </div>
        `;
    }).join('');
}

function filterUnits(query) {
    const q = query.trim().toLowerCase();
    if (!EstudioState.data) return;

    if (!q) {
        renderUpBentoGrid(EstudioState.data.units);
        return;
    }

    const filtered = EstudioState.data.units.filter(unit => {
        const haystack = [
            unit.title,
            ...(unit.objectives || []),
            ...(unit.contents || [])
        ].join(' ').toLowerCase();
        return haystack.includes(q);
    });

    renderUpBentoGrid(filtered);
}

// ================= RUTEO ENTRE VISTAS =================

function showDashboard() {
    EstudioState.currentUpId = null;
    document.getElementById('view-up-detail').style.display = 'none';
    document.getElementById('view-dashboard').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openUP(upId) {
    const unit = EstudioState.unitsById[upId];
    if (!unit) {
        console.warn(`[Estudio] No se encontró la UP con id "${upId}"`);
        return;
    }

    EstudioState.currentUpId = upId;
    renderUpDetail(unit);
    updateModuleChatSubtitle(unit);

    document.getElementById('view-dashboard').style.display = 'none';
    document.getElementById('view-up-detail').style.display = 'block';

    const firstTabBtn = document.querySelector('.up-tab-btn');
    if (firstTabBtn) showUpTab('temario', firstTabBtn);

    const moduleId = EstudioState.modulo;
    const upLabel = unit.title || upId;

    if (typeof NotasModule !== 'undefined' && typeof NotasModule.destroy === 'function') {
        NotasModule.destroy();
    }
    if (typeof PomodoroModule !== 'undefined' && typeof PomodoroModule.destroy === 'function') {
        PomodoroModule.destroy();
    }

    if (typeof NotasModule !== 'undefined') {
        NotasModule.open(moduleId, upId, 'notas-placeholder');
    }

    if (typeof PomodoroModule !== 'undefined') {
        PomodoroModule.open(moduleId, upId, upLabel, 'pomodoro-placeholder');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= RENDER: DETALLE DE UP =================

function renderUpDetail(unit) {
    if (!unit) return;

    const numEl = document.getElementById('up-detail-number');
    const titleEl = document.getElementById('up-detail-title');
    if (numEl) numEl.innerText = `UP${unit.number}`;
    if (titleEl) titleEl.innerText = unit.title;

    renderObjectivesChecklist(unit);

    const contentsList = document.getElementById('up-contents-list');
    if (contentsList && unit.contents) {
        contentsList.innerHTML = unit.contents.map(content => `
            <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${content}</span>
            </li>
        `).join('');
    }

    const biblioList = document.getElementById('up-biblio-list');
    if (biblioList && unit.bibliography) {
        const booksRepo = (typeof EstudioState !== 'undefined' && EstudioState.data && EstudioState.data.booksRepository) 
            ? EstudioState.data.booksRepository 
            : {};
        biblioList.innerHTML = unit.bibliography.map(key => `
            <div class="biblio-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>
                ${booksRepo[key] || key}
            </div>
        `).join('');
    }

    const materiales = unit.materiales || [];
    const materialesListEl = document.getElementById('up-materiales-list');
    if (materialesListEl) {
        materialesListEl.innerHTML = materiales.length
            ? materiales.map(renderResourceItem).join('')
            : `<div class="placeholder-panel">No hay materiales cargados aún para esta unidad.</div>`;
    }

    const videos = unit.videos || [];
    const videosListEl = document.getElementById('up-videos-list');
    if (videosListEl) {
        videosListEl.innerHTML = videos.length
            ? videos.map(renderResourceItem).join('')
            : `<div class="placeholder-panel">No hay clases o videos cargados aún para esta unidad.</div>`;
    }
}

// ================= CHECKLIST DE OBJETIVOS =================

async function renderObjectivesChecklist(unit) {
    const objList = document.getElementById('up-objectives-list');
    if (!objList || !unit.objectives) return;

    const moduleId = EstudioState.modulo;
    const upId = unit.id;

    objList.innerHTML = unit.objectives.map(obj => `
        <li style="list-style:none; display:flex; align-items:flex-start; gap:10px; padding:6px 0; opacity:0.55;">
            <input type="checkbox" disabled style="margin-top:4px; width:16px; height:16px; accent-color:#16a34a;">
            <span style="font-size:0.9rem; color:#0f172a;">${obj}</span>
        </li>
    `).join('');

    let userId = null;
    if (typeof window.NikaAuth !== 'undefined' && window.NikaAuth.ready) {
        userId = await window.NikaAuth.ready;
    }

    if (EstudioState.currentUpId !== upId) return;

    let progressMap = {};
    if (userId && typeof supabaseClient !== 'undefined') {
        try {
            const { data, error } = await supabaseClient
                .from('user_progress')
                .select('objective_index, completed')
                .eq('user_id', userId)
                .eq('module_id', moduleId)
                .eq('up_id', upId);

            if (!error && data) {
                data.forEach(row => { progressMap[row.objective_index] = row.completed; });
            }
        } catch (err) {
            console.error('[Progreso] Excepción al cargar checklist:', err);
        }
    }

    if (EstudioState.currentUpId !== upId) return;
    renderChecklistUI(objList, unit.objectives, progressMap, moduleId, upId, userId);
}

function renderChecklistUI(container, objectives, progressMap, moduleId, upId, userId) {
    const total = objectives.length;
    const completedCount = objectives.filter((_, i) => progressMap[i]).length;
    const pct = total ? Math.round((completedCount / total) * 100) : 0;

    const progressBarHtml = `
        <div style="margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.78rem; font-weight:700; color:#0284c7;">Progreso: ${completedCount}/${total} objetivos</span>
                <span style="font-size:0.78rem; font-weight:800; color:#16a34a;">${pct}%</span>
            </div>
            <div style="width:100%; height:6px; background:#e2e8f0; border-radius:6px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:#16a34a; transition: width 0.3s ease;"></div>
            </div>
        </div>
    `;

    const itemsHtml = objectives.map((obj, i) => `
        <li style="list-style:none; display:flex; align-items:flex-start; gap:10px; padding:6px 0;">
            <input type="checkbox" data-index="${i}" class="up-objective-checkbox" ${progressMap[i] ? 'checked' : ''} ${userId ? '' : 'disabled'}
                   style="margin-top:4px; width:16px; height:16px; accent-color:#16a34a; cursor:${userId ? 'pointer' : 'not-allowed'};">
            <span style="font-size:0.9rem; color:${progressMap[i] ? '#94a3b8' : '#0f172a'}; text-decoration:${progressMap[i] ? 'line-through' : 'none'};">${obj}</span>
        </li>
    `).join('');

    const sessionNoticeHtml = userId ? '' : `
        <div style="font-size:0.75rem; color:#ca8a04; margin-bottom:10px;">Iniciá sesión para guardar tu progreso.</div>
    `;

    container.innerHTML = progressBarHtml + sessionNoticeHtml + itemsHtml;

    if (!userId) return;

    container.querySelectorAll('.up-objective-checkbox').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            const completed = e.target.checked;

            progressMap[index] = completed;
            renderChecklistUI(container, objectives, progressMap, moduleId, upId, userId);

            const ok = await toggleObjective(userId, moduleId, upId, index, completed);
            if (!ok) {
                progressMap[index] = !completed;
                renderChecklistUI(container, objectives, progressMap, moduleId, upId, userId);
            }
        });
    });
}

async function toggleObjective(userId, moduleId, upId, index, completed) {
    try {
        if (typeof supabaseClient === 'undefined') return false;

        const { error } = await supabaseClient
            .from('user_progress')
            .upsert({
                user_id: userId,
                module_id: moduleId,
                up_id: upId,
                objective_index: index,
                completed: completed,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,module_id,up_id,objective_index' });

        if (error) {
            console.error('[Progreso] Error al guardar el objetivo:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('[Progreso] Excepción al guardar el objetivo:', err);
        return false;
    }
}

function renderResourceItem(resource) {
    const meta = RESOURCE_TYPE_META[resource.type] || RESOURCE_TYPE_META.pdf;
    return `
        <a class="resource-item" href="${resource.url}" target="_blank" rel="noopener noreferrer">
            <div class="resource-icon ${meta.iconClass}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${meta.icon}</svg>
            </div>
            <div class="resource-info">
                <h5>${resource.title}</h5>
                <span>${meta.label}</span>
            </div>
            <div class="resource-open-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
        </a>
    `;
}

// ================= TAREA 3: Asistente Bibliográfico Nativo (Cátedra) =================

// El HTML solo trae un contenedor vacío: <div id="notebooklm-panel"></div>
// (dentro de <div class="up-tab-panel" id="tab-notebooklm">). Esta función
// inyecta el markup real del chat ahí adentro. Es idempotente: si ya se
// dibujó una vez, no lo vuelve a dibujar (evita perder el historial de
// mensajes al cambiar de pestaña).
function renderNotebookLmTab() {
    const panel = document.getElementById('notebooklm-panel');
    if (!panel) {
        console.warn('[Estudio] No se encontró #notebooklm-panel en el DOM.');
        return;
    }

    if (panel.dataset.chatRendered) return; // ya está armado, no lo pisamos
    panel.dataset.chatRendered = 'true';

    panel.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%; min-height:420px;">
            <div style="margin-bottom:10px;">
                <h3 style="margin:0 0 2px 0;">🤖 Asistente Bibliográfico</h3>
                <span id="module-chat-subtitle" style="font-size:0.8rem; color:#64748b;">Cirugía</span>
            </div>
            <div id="module-chat-messages" style="flex:1; display:flex; flex-direction:column; gap:8px; overflow-y:auto; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; min-height:260px; margin-bottom:10px;"></div>
            <div style="display:flex; gap:8px;">
                <input type="text" id="module-chat-input" placeholder="Preguntale al asistente sobre esta unidad..."
                       style="flex:1; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;">
                <button id="module-chat-send" type="button"
                        style="padding:10px 16px; background:#0284c7; color:#fff; border:none; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer;">
                    Enviar
                </button>
            </div>
        </div>
    `;
}

function updateModuleChatSubtitle(unit) {
    const subtitleEl = document.getElementById('module-chat-subtitle');
    if (subtitleEl && unit) {
        subtitleEl.textContent = `Cirugía · ${unit.title || EstudioState.currentUpId}`;
    }
}

function initModuleChat() {
    // Aseguramos que el markup del chat exista en el DOM antes de buscarlo.
    renderNotebookLmTab();

    const chatInput = document.getElementById('module-chat-input');
    const chatSend = document.getElementById('module-chat-send');
    const chatMessages = document.getElementById('module-chat-messages');

    if (!chatSend || !chatInput || !chatMessages) {
        console.warn('[Estudio] No se pudieron inicializar los elementos del chat. Revisá que #notebooklm-panel exista en estudio.html.');
        return;
    }

    // Evitar duplicar event listeners si la vista se recarga
    if (chatSend.dataset.listenerAttached) return;
    chatSend.dataset.listenerAttached = 'true';

    // Fallback duro: si por algún motivo el cliente global de Supabase
    // no está disponible o no expone sus propiedades internas, usamos
    // estas constantes directamente. Así el chat nunca se rompe por
    // detección fallida del cliente.
    const FALLBACK_SUPABASE_URL = 'https://pswjmouuyaxueaqqglko.supabase.co';
    const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2ptb3V1eWF4dWVhcXFnbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDA2NzMsImV4cCI6MjEwNTAxNjY3M30.xZbJfZg9QR9jyT4ZcjeLi125Fzub33kajCYy2X_kwHk';

    async function handleModuleChat() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendModuleMsg(text, 'user');
        chatInput.value = '';

        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.style.cssText = "background: #fef9c3; border: 1px solid rgba(202,138,4,0.3); color: #713f12; padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; font-style: italic; align-self: flex-start;";
        loadingDiv.innerHTML = "Consultando fuentes privadas de la cátedra...";
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Detectar la UP activa (ej: 'UP1', 'UP2', etc.)
            const unit = EstudioState.currentUpId ? EstudioState.unitsById[EstudioState.currentUpId] : null;
            let upActiva = 'UP1';
            if (unit && unit.number) {
                upActiva = `UP${unit.number}`;
            } else if (EstudioState.currentUpId) {
                upActiva = EstudioState.currentUpId.toUpperCase();
            }

            // Intentamos leer del cliente global; si no está disponible,
            // usamos el fallback fijo. Nunca lanza error por esto.
            const client = window.supabaseClient || window.supabase || null;
            const supabaseUrl = client?.supabaseUrl || window.SUPABASE_URL || FALLBACK_SUPABASE_URL;
            const supabaseKey = client?.supabaseKey || window.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

            const functionUrl = `${supabaseUrl}/functions/v1/consultar-up`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey
                },
                body: JSON.stringify({ 
                    pregunta: text, 
                    up: upActiva 
                })
            });

            document.getElementById(loadingId)?.remove();

            if (!response.ok) {
                const errDetail = await response.text();
                throw new Error(`Error en la Edge Function (${response.status}): ${errDetail}`);
            }

            // El backend actual (consultar-up) responde con JSON completo
            // ({ respuesta: "..." }), no con un stream. Lo parseamos y
            // mostramos SOLO el texto limpio de la propiedad "respuesta".
            const data = await response.json();
            const respuesta = data && data.respuesta ? data.respuesta : 'No se obtuvo respuesta del asistente.';
            appendModuleMsg(respuesta, 'bot');

        } catch (err) {
            document.getElementById(loadingId)?.remove();
            console.error('[Error en Chat Bibliográfico]', err);
            appendModuleMsg("No pude procesar la consulta en este momento. Verificá la consola para más detalles.", 'bot');
        }
    }

    function appendModuleMsg(text, sender) {
        const div = document.createElement('div');
        if (sender === 'user') {
            div.style.cssText = "background: #0284c7; color: #fff; padding: 10px 14px; border-radius: 10px; max-width: 85%; font-size: 0.85rem; align-self: flex-end; word-break: break-word;";
        } else {
            div.style.cssText = "background: #ffffff; border: 1px solid #e2e8f0; color: #1e293b; padding: 10px 14px; border-radius: 10px; max-width: 85%; font-size: 0.85rem; align-self: flex-start; word-break: break-word; line-height: 1.5;";
        }
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatSend.addEventListener('click', handleModuleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleModuleChat();
    });
}

// ================= TABS DE LA VISTA DETALLE =================

function showUpTab(tabName, btn) {
    document.querySelectorAll('.up-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.up-tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');
}
