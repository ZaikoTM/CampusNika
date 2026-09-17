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
    currentUpId: null,      // UP abierta actualmente en el detalle
    activeResourceUrl: null // URL del recurso actualmente visualizándose
};

// Metadatos e íconos dinámicos según el tipo de recurso
function getResourceMeta(resource) {
    const titleLower = (resource.title || '').toLowerCase();
    const url = (resource.url || '').toLowerCase();

    if (resource.type === 'pdf') {
        return {
            label: 'PDF',
            bg: '#fee2e2',
            color: '#dc2626',
            icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="7" y="17" font-size="6" font-weight="bold" fill="currentColor">PDF</text>'
        };
    } else if (titleLower.includes('presentación') || url.includes('presentation') || url.includes('docs.google.com/presentation')) {
        return {
            label: 'Presentación',
            bg: '#ffedd5',
            color: '#ea580c',
            icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 8h10M7 12h6"/>'
        };
    } else if (url.includes('youtube.com') || url.includes('youtu.be') || resource.type === 'video') {
        return {
            label: 'Video YouTube',
            bg: '#fee2e2',
            color: '#ef4444',
            icon: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/>'
        };
    }
    
    return {
        label: 'Recurso',
        bg: '#e0f2fe',
        color: '#0284c7',
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/>'
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initEstudio();
    initModuleChat();
    injectNaturalScrollingStyles();
    updateSearchPlaceholder();

    // Atajo de teclado: ESC para cerrar el visor incrustado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeInlineViewer();
        }
    });
});

// Forzar desplazamiento natural conjunto para la barra lateral (notas/pomodoro)
function injectNaturalScrollingStyles() {
    if (document.getElementById('nika-natural-scroll-style')) return;
    const style = document.createElement('style');
    style.id = 'nika-natural-scroll-style';
    style.innerHTML = `
        .study-right-column, .right-column, .col-right, .up-sidebar, .right-sidebar {
            position: static !important;
            top: auto !important;
        }
        .resource-item.active-resource {
            border-color: #0284c7 !important;
            background-color: #f0f9ff !important;
            box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
        }
    `;
    document.head.appendChild(style);
}

function updateSearchPlaceholder() {
    const input = document.getElementById('search-up-input');
    if (input) {
        input.placeholder = "Buscá PDFs, presentaciones, apuntes o videos en las unidades...";
        input.setAttribute('oninput', 'filterResources(this.value)');
    }
}

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

// Buscador global de recursos, presentaciones y videos
function filterResources(query) {
    const q = query.trim().toLowerCase();
    const grid = document.getElementById('up-bento-grid');
    if (!EstudioState.data || !grid) return;

    if (!q) {
        renderUpBentoGrid(EstudioState.data.units);
        return;
    }

    let allResources = [];
    EstudioState.data.units.forEach(unit => {
        const materiales = unit.materiales || [];
        const videos = unit.videos || [];
        
        [...materiales, ...videos].forEach(res => {
            if (res.title.toLowerCase().includes(q) || (res.type && res.type.toLowerCase().includes(q))) {
                allResources.push({ ...res, unitTitle: `UP${unit.number}: ${unit.title}`, unitId: unit.id });
            }
        });
    });

    if (allResources.length === 0) {
        grid.innerHTML = `<div class="up-empty-state" style="grid-column: 1/-1;">No encontramos recursos o videos que coincidan con "${q}".</div>`;
        return;
    }

    grid.innerHTML = `
        <div style="grid-column: 1/-1; margin-bottom: 10px; font-weight: 700; color: #0f172a;">
            Resultados de búsqueda (${allResources.length} recursos encontrados):
        </div>
    ` + allResources.map(res => {
        const meta = getResourceMeta(res);
        const isActive = EstudioState.activeResourceUrl === res.url ? 'active-resource' : '';
        const actionAttr = `onclick="openInlineViewer('${res.url}', '${res.title.replace(/'/g, "\\'")}', this)" style="cursor:pointer;"`;

        return `
        <div class="resource-item ${isActive}" ${actionAttr} data-url="${res.url}" style="grid-column: 1/-1; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; display: flex; align-items: center; gap: 15px; text-decoration: none; transition: all 0.2s;">
            <div class="resource-icon" style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: ${meta.bg}; color: ${meta.color}; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${meta.icon}</svg>
            </div>
            <div class="resource-info" style="flex: 1;">
                <h5 style="font-size: 0.95rem; color: #0f172a; margin-bottom: 3px;">${res.title}</h5>
                <span style="font-size: 0.78rem; color: #64748b;">${meta.label} · <strong style="color: #0284c7;">${res.unitTitle}</strong></span>
            </div>
            <div class="resource-open-btn" style="color: #94a3b8;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
        </div>
        `;
    }).join('');
}

// ================= RUTEO ENTRE VISTAS =================

function showDashboard() {
    EstudioState.currentUpId = null;
    closeInlineViewer();
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
    closeInlineViewer();
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

    try {
        const rawUser = localStorage.getItem('nika_currentUser');
        const activeUser = rawUser ? JSON.parse(rawUser) : null;
        const userSuffix = activeUser ? activeUser.username : 'invitado';
        
        localStorage.setItem(`nika_surgery_global_pct_${userSuffix}`, pct);
        
        const currentUnit = (typeof EstudioState !== 'undefined' && EstudioState.unitsById) ? EstudioState.unitsById[upId] : null;
        const upName = currentUnit ? `UP${currentUnit.number}` : upId.toUpperCase();

        localStorage.setItem(`nika_last_study_progress_${userSuffix}`, JSON.stringify({
            modulo: 'Cirugía',
            up: upName,
            porcentaje: pct,
            url: 'estudio.html?modulo=cirugia'
        }));
    } catch(e) {
        console.error("[Progreso] Error sincronizando panel principal:", e);
    }

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
    const meta = getResourceMeta(resource);
    const isActive = EstudioState.activeResourceUrl === resource.url ? 'active-resource' : '';
    const actionAttr = `onclick="openInlineViewer('${resource.url}', '${resource.title.replace(/'/g, "\\'")}', this)" style="cursor:pointer;"`;

    return `
        <div class="resource-item ${isActive}" ${actionAttr} data-url="${resource.url}">
            <div class="resource-icon" style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: ${meta.bg}; color: ${meta.color}; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${meta.icon}</svg>
            </div>
            <div class="resource-info">
                <h5>${resource.title}</h5>
                <span>${meta.label}</span>
            </div>
            <div class="resource-open-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
        </div>
    `;
}

// ================= VISOR INTEGRADO ABAJO DE LOS CONTENIDOS =================

function openInlineViewer(url, title, element) {
    EstudioState.activeResourceUrl = url;

    // Actualizar marcas activas en la interfaz
    document.querySelectorAll('.resource-item').forEach(el => el.classList.remove('active-resource'));
    if (element) {
        element.classList.add('active-resource');
    } else {
        const found = document.querySelector(`.resource-item[data-url="${url}"]`);
        if (found) found.classList.add('active-resource');
    }

    const activePanel = document.querySelector('.up-tab-panel.active') || document.querySelector('.up-tabs-content') || document.getElementById('view-up-detail');
    if (!activePanel) return;

    let container = document.getElementById('nika-inline-viewer-container');
    if (!container) {
        const containerHTML = `
            <div id="nika-inline-viewer-container" style="display:none; margin-top: 24px; margin-bottom: 20px; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="background: #0b4f8c; color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.1rem;">📖</span>
                        <h4 id="nika-inline-title" style="font-size: 1rem; font-weight: 700; margin: 0; color: #fff;">Visualizando Recurso</h4>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button onclick="toggleViewerFullscreen()" id="nika-fs-btn" style="background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; font-weight: 600;">Pantalla Completa</button>
                        <button onclick="closeInlineViewer()" style="background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; font-weight: 600;">✕ Cerrar</button>
                    </div>
                </div>
                <div id="nika-inline-frame-wrapper" style="position: relative; width: 100%; height: 60vh; min-height: 450px; max-height: 700px; background: #f1f5f9;">
                    <iframe id="nika-inline-iframe" src="" style="width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
                </div>
            </div>
        `;
        activePanel.insertAdjacentHTML('beforeend', containerHTML);
        container = document.getElementById('nika-inline-viewer-container');
    } else {
        activePanel.appendChild(container);
    }

    const iframe = document.getElementById('nika-inline-iframe');
    const titleEl = document.getElementById('nika-inline-title');
    if (titleEl) titleEl.innerText = title;

    let embedUrl = url;

    // 1. Detección de YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        }
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
        }
    } 
    // 2. Detección de Google Drive PDF
    else if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.split('/file/d/')[1]?.split('/')[0];
        if (fileId) {
            embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
    } 
    // 3. Detección de Google Slides / Presentaciones (PowerPoint)
    else if (url.includes('docs.google.com/presentation/d/')) {
        const presId = url.split('/presentation/d/')[1]?.split('/')[0];
        if (presId) {
            embedUrl = `https://docs.google.com/presentation/d/${presId}/embed?start=false&loop=false&delayms=3000`;
        }
    }

    if (iframe) iframe.src = embedUrl;
    if (container) {
        container.style.display = 'block';
        container.style.width = '100%';
        container.style.position = 'relative';
        container.style.zIndex = '1';
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
}

function closeInlineViewer() {
    EstudioState.activeResourceUrl = null;
    document.querySelectorAll('.resource-item').forEach(el => el.classList.remove('active-resource'));

    const container = document.getElementById('nika-inline-viewer-container');
    const iframe = document.getElementById('nika-inline-iframe');
    if (iframe) iframe.src = '';
    if (container) {
        container.style.display = 'none';
        const rightSidePanel = document.querySelector('.study-right-column') || document.querySelector('.right-column') || document.querySelector('.col-right');
        if (rightSidePanel) rightSidePanel.style.display = '';
    }
}

function toggleViewerFullscreen() {
    const container = document.getElementById('nika-inline-viewer-container');
    const wrapper = document.getElementById('nika-inline-frame-wrapper');
    const fsBtn = document.getElementById('nika-fs-btn');
    const rightSidePanel = document.querySelector('.study-right-column') || document.querySelector('.right-column') || document.querySelector('.col-right');

    if (!container.classList.contains('is-fs')) {
        container.classList.add('is-fs');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.zIndex = '99999';
        container.style.margin = '0';
        container.style.borderRadius = '0';
        wrapper.style.height = 'calc(100vh - 55px)';
        wrapper.style.maxHeight = 'none';
        if (fsBtn) fsBtn.innerText = 'Restaurar Pantalla';
        
        if (rightSidePanel) rightSidePanel.style.display = 'none';
    } else {
        container.classList.remove('is-fs');
        container.style.position = 'relative';
        container.style.top = 'auto';
        container.style.left = 'auto';
        container.style.width = '100%';
        container.style.height = 'auto';
        container.style.zIndex = '1';
        container.style.margin = '24px 0 20px 0';
        container.style.borderRadius = '12px';
        wrapper.style.height = '60vh';
        wrapper.style.maxHeight = '700px';
        if (fsBtn) fsBtn.innerText = 'Pantalla Completa';
        
        if (rightSidePanel) rightSidePanel.style.display = '';
    }
}

// ================= TAREA 3: Asistente Bibliográfico Nativo (Cátedra) =================

function renderNotebookLmTab() {
    const panel = document.getElementById('notebooklm-panel');
    if (!panel) {
        console.warn('[Estudio] No se encontró #notebooklm-panel en el DOM.');
        return;
    }

    if (panel.dataset.chatRendered) return;
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
    renderNotebookLmTab();

    const chatInput = document.getElementById('module-chat-input');
    const chatSend = document.getElementById('module-chat-send');
    const chatMessages = document.getElementById('module-chat-messages');

    if (!chatSend || !chatInput || !chatMessages) {
        console.warn('[Estudio] No se pudieron inicializar los elementos del chat.');
        return;
    }

    if (chatSend.dataset.listenerAttached) return;
    chatSend.dataset.listenerAttached = 'true';

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
            const unit = EstudioState.currentUpId ? EstudioState.unitsById[EstudioState.currentUpId] : null;
            let upActiva = 'UP1';
            if (unit && unit.number) {
                upActiva = `UP${unit.number}`;
            } else if (EstudioState.currentUpId) {
                upActiva = EstudioState.currentUpId.toUpperCase();
            }

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
    closeInlineViewer(); // Ocultar visor al cambiar de solapa
    document.querySelectorAll('.up-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.up-tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');
}