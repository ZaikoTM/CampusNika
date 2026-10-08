/* ==========================================================
   CAMPUS NIKA — Suite de Estudio (estudio.html)
   TRAMO 1: Carga de datos + ruteo básico entre vistas.
   TRAMO 2: Notas (Supabase) y Pomodoro.
   TRAMO 3: Asistente Bibliográfico Nativo (Cátedra / NotebookLM interno).
   ========================================================== */

// Estado en memoria de la sesión de estudio actual
const EstudioState = {
    modulo: 'cirugia',      // Módulo activo
    data: null,             // contenido completo de data/<modulo>.json
    unitsById: {},          // acceso rápido por id de UP (incluye subsecciones sintéticas, ver openUnit)
    currentUpId: null,      // UP (o subsección) abierta actualmente en el detalle
    activeResourceUrl: null // URL del recurso actualmente visualizándose
};

// Mapeo módulo → archivo de datos. Si un módulo no está acá, se intenta
// data/<modulo>.json por defecto (ver initEstudio).
const DATA_FILE_MAP = {
    cirugia: 'data/cirugia.json',
    ginecologia: 'data/gineco_data.json',
    siam: 'data/siam_data.json'
};

// Paleta por módulo: variables CSS que se inyectan sobre :root cuando
// EstudioState.modulo coincide. Cirugía usa la paleta base del archivo
// (no requiere override). Ginecología mantiene el fondo CLARO (identidad
// original de Campus Nika) y usa el rosa/violeta (#f472b6 / #c084fc)
// exclusivamente como acento: botones, bordes activos y detalles — nunca
// como color de fondo de página ni de tarjetas.
const MODULE_THEMES = {
    siam: {
        '--nika-primary': '#0d9488',   // acento verde azulado (botones, tab activa, focus)
        '--nika-accent': '#06b6d4',    // acento cian
        '--nika-dark': '#134e4a',      // títulos
        '--bg-body': '#f2faf9',
        '--bg-page': '#f2faf9',
        '--border': '#cfeae6',
        '--text-main': '#1e293b',
        '--text-muted': '#64748b',
        '--text-dim': '#94a3b8',
        '--card-bg': '#ffffff'
    },
    ginecologia: {
        '--nika-primary': '#f472b6',   // acento rosa (botones, tab activa, focus)
        '--nika-accent': '#c084fc',    // acento violeta (hover, detalles)
        '--nika-dark': '#831843',      // color de títulos: plum oscuro, elegante sobre fondo claro
        '--bg-body': '#fdf6fa',
        '--bg-page': '#fdf6fa',
        '--border': '#f3ddec',
        '--text-main': '#1e293b',
        '--text-muted': '#64748b',
        '--text-dim': '#94a3b8',
        '--card-bg': '#ffffff'
    }
};

// Lee ?modulo= de la URL ANTES de que arranque initEstudio, así todo lo
// que sigue (fetch del JSON, theming, título) ya usa el módulo correcto.
(function resolverModuloDesdeUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const modulo = params.get('modulo');
        if (modulo) EstudioState.modulo = modulo;
    } catch (e) {
        console.warn('[Estudio] No se pudo leer ?modulo= de la URL:', e);
    }
})();

// Aplica la paleta del módulo activo como atributo + variables CSS inline
// sobre <body>, y deja un fallback prolijo para módulos sin tema propio.
function aplicarTemaModulo(modulo) {
    document.body.setAttribute('data-modulo', modulo);
    const theme = MODULE_THEMES[modulo];
    if (!theme) return;
    Object.entries(theme).forEach(([varName, value]) => {
        document.documentElement.style.setProperty(varName, value);
    });

    // Ajustes finos que no son variables CSS reutilizables. Fondo claro con
    // un fondo blanco degradado apenas rosado/violeta (muy sutil), y el
    // rosa/violeta reservado a botones y bordes activos como acento.
    if (!document.getElementById('nika-module-theme-style')) {
        const style = document.createElement('style');
        style.id = 'nika-module-theme-style';
        style.innerHTML = `
            body[data-modulo="ginecologia"] {
                background:
                    radial-gradient(circle at 12% 8%, rgba(244,114,182,0.05), transparent 40%),
                    radial-gradient(circle at 88% 92%, rgba(192,132,252,0.05), transparent 40%),
                    var(--bg-body);
            }
            body[data-modulo="ginecologia"] .up-card:hover,
            body[data-modulo="ginecologia"] .resource-item:hover {
                background: #fff;
                box-shadow: 0 12px 24px -10px rgba(219,39,119,0.18);
            }
            /* Botones y bordes activos con degradado sutil rosa→violeta (acento, no fondo) */
            body[data-modulo="ginecologia"] .btn-hub,
            body[data-modulo="ginecologia"] .btn-continue-action,
            body[data-modulo="ginecologia"] #btn-agendar-repaso {
                background: linear-gradient(135deg, #c084fc, #f472b6) !important;
                color: #fff !important;
                border: none;
            }
            body[data-modulo="ginecologia"] .up-card:hover,
            body[data-modulo="ginecologia"] .content-block:hover {
                border-color: var(--nika-primary);
            }
            body[data-modulo="ginecologia"] .up-tab-btn.active {
                color: var(--nika-primary);
                border-bottom-color: var(--nika-primary);
            }
            body[data-modulo="siam"] {
                background:
                    radial-gradient(circle at 12% 8%, rgba(13,148,136,0.06), transparent 40%),
                    radial-gradient(circle at 88% 92%, rgba(6,182,212,0.06), transparent 40%),
                    var(--bg-body);
            }
            body[data-modulo="siam"] .up-card:hover,
            body[data-modulo="siam"] .resource-item:hover {
                background: #fff;
                box-shadow: 0 12px 24px -10px rgba(13,148,136,0.2);
            }
            body[data-modulo="siam"] .btn-hub,
            body[data-modulo="siam"] .btn-continue-action,
            body[data-modulo="siam"] #btn-agendar-repaso {
                background: linear-gradient(135deg, #06b6d4, #0d9488) !important;
                color: #fff !important;
                border: none;
            }
            body[data-modulo="siam"] .up-card:hover,
            body[data-modulo="siam"] .content-block:hover {
                border-color: var(--nika-primary);
            }
            body[data-modulo="siam"] .up-tab-btn.active {
                color: var(--nika-primary);
                border-bottom-color: var(--nika-primary);
            }
        `;
        document.head.appendChild(style);
    }
}

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

// Forzar desplazamiento natural y adaptaciones responsivas para celulares y tablets
function injectNaturalScrollingStyles() {
    if (!document.getElementById('nika-prog-style')) {
        const st = document.createElement('style'); st.id = 'nika-prog-style';
        st.textContent = `.up-continuar{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:10px 14px;border-radius:12px;background:#fef9c3;border:1px solid #fde68a;color:#854d0e;font-size:.88rem;cursor:pointer;transition:transform .15s,box-shadow .15s;animation:nkContIn .4s ease both}
.up-continuar:hover{transform:translateY(-1px);box-shadow:0 6px 16px -8px rgba(202,138,4,.6)}
.up-continuar>span:first-child{font-size:1.1rem}
@keyframes nkContIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.res-prog,.res-prog span{text-transform:none!important;letter-spacing:0!important}.res-prog{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:.74rem;font-weight:700}
.res-prog .rp-ok{color:#15803d}.res-prog .rp-curso{color:#b45309}.res-prog .rp-no{color:#94a3b8}
.rp-barra{display:block;flex:0 0 70px;height:5px;border-radius:5px;background:rgba(148,163,184,.35);overflow:hidden}.rp-barra b{display:block;height:100%;background:#f59e0b}
body.dark-mode .up-continuar{background:rgba(250,204,21,.12);border-color:rgba(250,204,21,.35);color:#fde68a}
body.dark-mode .res-prog .rp-ok{color:#4ade80}body.dark-mode .res-prog .rp-curso{color:#fbbf24}`;
        document.head.appendChild(st);
    }
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

        /* ==========================================
           ADAPTACIONES PARA CELULARES Y TABLETS
           ========================================== */
        @media (max-width: 768px) {
            #nika-inline-frame-wrapper {
                height: 380px !important;
                min-height: 350px !important;
                max-height: 450px !important;
            }
            button, .up-tab-btn, .resource-item {
                min-height: 44px;
            }
            header, .campus-header, .header-container, nav {
                flex-wrap: wrap !important;
                gap: 10px !important;
            }
            textarea, input[type="text"] {
                font-size: 16px !important;
            }
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
        aplicarTemaModulo(EstudioState.modulo);

        const dataFile = DATA_FILE_MAP[EstudioState.modulo] || `data/${EstudioState.modulo}.json`;
        const res = await fetch(dataFile);
        if (!res.ok) throw new Error(`No se pudo cargar ${dataFile} (HTTP ${res.status})`);

        EstudioState.data = await res.json();
        EstudioState.unitsById = Object.fromEntries(
            EstudioState.data.units.map(u => [u.id, u])
        );

        document.getElementById('dashboard-title').innerText = `Sala de Estudio · ${EstudioState.data.nombre}`;
        renderUpBentoGrid(EstudioState.data.units);

        iniciarMonitorAlertas();
        // Deep-link desde el campus: estudio.html?modulo=cirugia&up=7 (acepta "7" o "up7")
        try {
            const upParam = new URLSearchParams(window.location.search).get('up');
            if (upParam) {
                const id = /^\d+$/.test(upParam) ? 'up' + upParam : upParam;
                if (EstudioState.unitsById[id]) openUP(id);
            }
        } catch (e) { console.warn('[Estudio] ?up= inválido:', e); }
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
        // Las UPs con "secciones" (ej. UP3 de Ginecología) no tienen materiales/
        // videos/objetivos propios: hay que sumarlos entre sus 5 secciones.
        let matCount, vidCount, objCount;
        if (unit.secciones && Array.isArray(unit.secciones)) {
            matCount = unit.secciones.reduce((acc, s) => acc + (s.materiales ? s.materiales.length : 0), 0);
            vidCount = unit.secciones.reduce((acc, s) => acc + (s.videos ? s.videos.length : 0), 0);
            objCount = unit.secciones.reduce((acc, s) => acc + (s.objectives ? s.objectives.length : 0), 0);
        } else {
            matCount = unit.materiales ? unit.materiales.length : 0;
            vidCount = unit.videos ? unit.videos.length : 0;
            objCount = unit.objectives ? unit.objectives.length : 0;
        }
        const totalRecursos = matCount + vidCount;

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
        // UPs con secciones (ej. UP3 Ginecología): buscar dentro de cada sección,
        // etiquetando el resultado con "UP3: <Sección>" para que se entienda de dónde viene.
        if (unit.secciones && Array.isArray(unit.secciones)) {
            unit.secciones.forEach(sec => {
                const materiales = sec.materiales || [];
                const videos = sec.videos || [];
                [...materiales, ...videos].forEach(res => {
                    if (res.title.toLowerCase().includes(q) || (res.type && res.type.toLowerCase().includes(q))) {
                        allResources.push({ ...res, unitTitle: `UP${unit.number}: ${sec.title}`, unitId: unit.id });
                    }
                });
            });
            return;
        }

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
                <h5 style="font-size: 0.95rem; color: #0f172a; margin-bottom: 3px;">${res.title}${badgeObligatorioHtml(res)}</h5>
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

    if (window.PomodoroSyncManager) {
        window.PomodoroSyncManager.actualizarEstado({ up: null, pomodoroActivo: false, faseActual: null });
    }
}

function openUP(upId) {
    const unit = EstudioState.unitsById[upId];
    if (!unit) {
        console.warn(`[Estudio] No se encontró la UP con id "${upId}"`);
        return;
    }

    // UPs con subsecciones seleccionables (ej. UP3 de Ginecología: Adolescente,
    // Adulta Joven, Urgencias, Embarazo, Parto y Puerperio). En vez de abrir el
    // detalle directo, mostramos un submenú y dejamos que abrirSeccionUP() haga
    // el openUpReal() real con la subsección elegida.
    if (unit.secciones && Array.isArray(unit.secciones) && unit.secciones.length > 0) {
        abrirModalSeccionesUP(unit);
        return;
    }

    openUpReal(upId, unit);
}

// Muestra el submenú (modal) de subsecciones de una UP, ej. UP3 de Ginecología.
function abrirModalSeccionesUP(unit) {
    let overlay = document.getElementById('modal-secciones-up');
    if (!overlay) {
        const html = `
        <div id="modal-secciones-up" class="nika-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.55); z-index:9998; align-items:center; justify-content:center;"
             onclick="if (event.target === this) cerrarModalSeccionesUP();">
          <div class="nika-modal-card" style="background:#fff; border-radius:14px; padding:26px 24px; max-width:460px; width:92%; max-height:85vh; overflow-y:auto;">
            <h3 id="secciones-up-titulo" style="margin:0 0 4px 0; font-size:19px; font-weight:800; color:#0f172a;"></h3>
            <p style="margin:0 0 18px 0; font-size:13px; color:#64748b;">Elegí la sección que querés estudiar.</p>
            <div id="secciones-up-lista" style="display:flex; flex-direction:column; gap:10px;"></div>
            <button type="button" onclick="cerrarModalSeccionesUP()" style="margin-top:18px; width:100%; padding:10px; border:1px solid #e2e8f0; background:#f8fafc; border-radius:8px; font-weight:600; cursor:pointer;">Cancelar</button>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        overlay = document.getElementById('modal-secciones-up');
    }

    document.getElementById('secciones-up-titulo').innerText = `UP${unit.number}: ${unit.title}`;
    const lista = document.getElementById('secciones-up-lista');
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--nika-primary').trim() || '#0f6cbf';
    lista.innerHTML = unit.secciones.map((sec, i) => `
        <button type="button" onclick="abrirSeccionUP('${unit.id}', ${i})"
                style="text-align:left; padding:14px 16px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; font-size:0.9rem; font-weight:700; color:#0f172a; transition: all .15s;"
                onmouseover="this.style.borderColor='${accent}'" onmouseout="this.style.borderColor='#e2e8f0'">
            ${i + 1}. ${sec.title}
        </button>
    `).join('');

    overlay.style.display = 'flex';
}

function cerrarModalSeccionesUP() {
    const overlay = document.getElementById('modal-secciones-up');
    if (overlay) overlay.style.display = 'none';
}

// Construye una "unit" sintética a partir de la UP padre + la sección elegida
// (hereda number/id de la padre, pisa title/objectives/contents/materiales/
// videos con los de la sección) y la abre con el flujo normal de detalle.
function abrirSeccionUP(parentId, seccionIndex) {
    const parent = EstudioState.unitsById[parentId];
    if (!parent || !parent.secciones || !parent.secciones[seccionIndex]) return;
    const sec = parent.secciones[seccionIndex];

    const syntheticId = `${parentId}__sec${seccionIndex + 1}`;
    const syntheticUnit = Object.assign({}, parent, sec, {
        id: syntheticId,
        number: parent.number,          // sigue mostrando "UP3"
        parentId: parentId,
        seccionTitle: sec.title,
        secciones: undefined            // evita loop infinito de submenú
    });
    EstudioState.unitsById[syntheticId] = syntheticUnit;

    cerrarModalSeccionesUP();
    openUpReal(syntheticId, syntheticUnit);
}

// Lógica real de apertura de detalle de UP (antes vivía directo en openUP).
// La separamos para que tanto una UP normal como una subsección sintética
// (ver abrirSeccionUP) pasen por acá.
function openUpReal(upId, unit) {
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

    // Presence: le avisa a los amigos qué UP está mirando ("Estudiando UPx...")
    if (window.PomodoroSyncManager) {
        window.PomodoroSyncManager.actualizarEstado({ up: `UP${unit.number}` });
    }

    // Widget "📅 Mi Cronograma de Repaso" (ver PARTE 3 del pedido)
    initRepasoWidget(moduleId, upId, upLabel);

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
        // "Área: tema; tema; tema" -> título + temas en píldoras chicas (menos pared de texto)
        const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        contentsList.innerHTML = unit.contents.map(content => {
            const m = /^([^:]{3,60}):\s+(.+)$/.exec(content);
            const cuerpo = m && /;/.test(m[2])
                ? `<b class="ct-area">${esc(m[1])}</b><span class="ct-temas">${m[2].replace(/\.$/, '').split(/;\s*/).map(t => `<span class="ct-tema">${esc(t)}</span>`).join('')}</span>`
                : `<span>${content}</span>`;
            return `<li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <div class="ct-cuerpo">${cuerpo}</div>
            </li>`;
        }).join('');
    }

    const objNote = document.getElementById('up-objectives-note');
    if (objNote) { objNote.textContent = unit.objectivesNote || ''; objNote.style.display = unit.objectivesNote ? '' : 'none'; }

    const biblioList = document.getElementById('up-biblio-list');
    if (biblioList && unit.bibliography) {
        const booksRepo = (typeof EstudioState !== 'undefined' && EstudioState.data && EstudioState.data.booksRepository)
            ? EstudioState.data.booksRepository
            : {};
        const icono = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>';
        const chips = (arr) => arr.map(key => `<div class="biblio-chip">${icono}<span>${booksRepo[key] || key}</span></div>`).join('');
        const alt = unit.bibliographyAlt || [];
        biblioList.innerHTML = (unit.bibliography.length ? (alt.length ? '<div class="biblio-sub">Obligatoria</div>' : '') + chips(unit.bibliography) : '')
            + (alt.length ? '<div class="biblio-sub">Alternativa y de consulta</div>' + chips(alt) : '');
    }

    const materiales = unit.materiales || [];
    const materialesListEl = document.getElementById('up-materiales-list');
    if (materialesListEl) {
        materialesListEl.innerHTML = materiales.length
            ? materiales.map(renderResourceItem).join('')
            : `<div class="placeholder-panel">No hay materiales cargados aún para esta unidad.</div>`;
    }

    actualizarProgresoRecursos();

    const videos = unit.videos || [];
    const videosListEl = document.getElementById('up-videos-list');
    if (videosListEl) {
        videosListEl.innerHTML = videos.length
            ? videos.map(renderResourceItem).join('')
            : `<div class="placeholder-panel">No hay clases o videos cargados aún para esta unidad.</div>`;
    }
}

// ================= CHECKLIST DE OBJETIVOS (LOCAL-FIRST & OPTIMISTA) =================

async function renderObjectivesChecklist(unit) {
    const objList = document.getElementById('up-objectives-list');
    if (!objList || !unit.objectives) return;

    const moduleId = EstudioState.modulo;
    const upId = unit.id;

    // 1. Obtener identificador de usuario de forma robusta
    let userId = null;
    let usernameKey = 'invitado';

    const rawUser = localStorage.getItem('nika_currentUser');
    if (rawUser) {
        try {
            const activeUser = JSON.parse(rawUser);
            userId = activeUser.id || activeUser.uid || activeUser.username || activeUser.email;
            usernameKey = activeUser.username || activeUser.email || 'usuario';
        } catch (e) {
            userId = rawUser;
            usernameKey = rawUser;
        }
    }

    try {
        const client = window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client);
        if (client && client.auth) {
            const { data: { session } } = await client.auth.getSession();
            if (session && session.user) {
                userId = session.user.id;
            }
        }
    } catch (err) {
        console.warn('[Estudio] Sesión de Supabase no disponible, usando identidad local:', err);
    }

    if (EstudioState.currentUpId !== upId) return;

    // 2. Cargar progreso desde localStorage (rápido, sin bloqueos)
    let progressMap = {};
    const localProgressKey = `nika_progress_${usernameKey}_${moduleId}_${upId}`;
    try {
        const savedLocal = localStorage.getItem(localProgressKey);
        if (savedLocal) {
            progressMap = JSON.parse(savedLocal);
        }
    } catch (e) {
        console.error('[Progreso] Error leyendo localStorage:', e);
    }

    // 3. Sincronizar opcionalmente con Supabase en segundo plano si hay un ID válido
    if (userId && typeof supabaseClient !== 'undefined' && userId.length > 3) {
        try {
            const { data, error } = await supabaseClient
                .from('user_progress')
                .select('objective_index, completed')
                .eq('user_id', userId)
                .eq('module_id', moduleId)
                .eq('up_id', upId);

            if (!error && data && data.length > 0) {
                data.forEach(row => { 
                    progressMap[row.objective_index] = row.completed; 
                });
                localStorage.setItem(localProgressKey, JSON.stringify(progressMap));
            }
        } catch (err) {
            console.warn('[Progreso] Sincronización remota omitida, usando caché local:', err);
        }
    }

    if (EstudioState.currentUpId !== upId) return;
    renderChecklistUI(objList, unit.objectives, progressMap, moduleId, upId, userId, usernameKey);
}

function renderChecklistUI(container, objectives, progressMap, moduleId, upId, userId, usernameKey) {
    const total = objectives.length;
    const completedCount = objectives.filter((_, i) => progressMap[i]).length;
    const pct = total ? Math.round((completedCount / total) * 100) : 0;

    try {
        const activeUsername = usernameKey || 'invitado';
        localStorage.setItem(`nika_surgery_global_pct_${activeUsername}`, pct);
        
        const currentUnit = (typeof EstudioState !== 'undefined' && EstudioState.unitsById) ? EstudioState.unitsById[upId] : null;
        const upName = currentUnit ? `UP${currentUnit.number}` : upId.toUpperCase();

        localStorage.setItem(`nika_last_study_progress_${activeUsername}`, JSON.stringify({
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
            <div style="width:100%; height:6px; background:rgba(148,163,184,.35); border-radius:6px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:#16a34a; transition: width 0.3s ease;"></div>
            </div>
        </div>
    `;

    const canInteract = !!userId;

    const itemsHtml = objectives.map((obj, i) => `
        <li style="list-style:none; display:flex; align-items:flex-start; gap:10px; padding:6px 0;">
            <input type="checkbox" data-index="${i}" class="up-objective-checkbox" ${progressMap[i] ? 'checked' : ''} ${canInteract ? '' : 'disabled'}
                   style="margin-top:4px; width:16px; height:16px; accent-color:#16a34a; cursor:${canInteract ? 'pointer' : 'not-allowed'};">
            <span style="font-size:0.9rem; color:${progressMap[i] ? '#94a3b8' : '#0f172a'}; text-decoration:${progressMap[i] ? 'line-through' : 'none'};">${obj}</span>
        </li>
    `).join('');

    const sessionNoticeHtml = canInteract ? '' : `
        <div style="font-size:0.75rem; color:#ca8a04; margin-bottom:10px;">Iniciá sesión para guardar tu progreso.</div>
    `;

    container.innerHTML = progressBarHtml + sessionNoticeHtml + itemsHtml;

    if (!canInteract) return;

    container.querySelectorAll('.up-objective-checkbox').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            const completed = e.target.checked;

            // 1. Guardado local inmediato (Optimista): la UI responde al instante
            progressMap[index] = completed;
            const localProgressKey = `nika_progress_${usernameKey}_${moduleId}_${upId}`;
            try {
                localStorage.setItem(localProgressKey, JSON.stringify(progressMap));
            } catch (err) {
                console.error('[Progreso] Error guardando local:', err);
            }

            // 2. Refrescar UI al vuelo
            renderChecklistUI(container, objectives, progressMap, moduleId, upId, userId, usernameKey);

            // 3. Sincronizar en segundo plano con Supabase de forma silenciosa
            if (userId && typeof supabaseClient !== 'undefined' && userId.length > 3) {
                toggleObjective(userId, moduleId, upId, index, completed).catch(err => {
                    console.warn('[Progreso] Sync silencioso con Supabase falló:', err);
                });
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
            console.error('[Progreso] Error en Supabase:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('[Progreso] Excepción en Supabase:', err);
        return false;
    }
}

// Badge verde "Obligatorio" para recursos con resource.obligatorio === true
// (ver gineco_data.json: bibliografía obligatoria de cada sección de UP3).
function badgeObligatorioHtml(resource) {
    if (!resource.obligatorio) return '';
    return `<span style="display:inline-block; margin-left:8px; padding:2px 8px; font-size:0.68rem; font-weight:800; letter-spacing:.02em; color:#166534; background:#dcfce7; border-radius:999px; vertical-align:middle;">OBLIGATORIO</span>`;
}

// ================= PROGRESO DE LECTURA DE LOS PDF (checklist + "continuá donde lo dejaste") =================

function nikaDriveId(url) {
    return (url || '').includes('drive.google.com/file/d/') ? ((url.split('/file/d/')[1] || '').split('/')[0] || null) : null;
}

async function nikaProgresoPdfs(ids) {
    const mapa = {};
    ids.forEach(id => { try { const v = localStorage.getItem('nika_pdf_prog_' + id); if (v) mapa[id] = JSON.parse(v); } catch (_) {} });
    try {
        const c = window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client);
        if (c && c.auth) {
            const { data: ses } = await c.auth.getSession();
            if (ses && ses.session) {
                const { data } = await c.from('pdf_progreso').select('file_id,ultima_pagina,total_paginas,leidas,updated_at').in('file_id', ids);
                (data || []).forEach(r => { mapa[r.file_id] = r; });
            }
        }
    } catch (_) {}
    return mapa;
}

let _progPdfTimer = null;
function actualizarProgresoRecursos() {
    clearTimeout(_progPdfTimer);
    _progPdfTimer = setTimeout(async () => {
        const items = [...document.querySelectorAll('#up-materiales-list .resource-item[data-fid]')];
        const lista = document.getElementById('up-materiales-list');
        if (!lista) return;
        const prev = document.getElementById('up-continuar'); if (prev) prev.remove();
        if (!items.length) return;
        const mapa = await nikaProgresoPdfs([...new Set(items.map(i => i.dataset.fid))]);
        let mejor = null;
        items.forEach(it => {
            const r = mapa[it.dataset.fid];
            const tag = it.querySelector('.res-prog');
            if (!tag) return;
            const total = (r && r.total_paginas) || 0;
            const leidas = r && Array.isArray(r.leidas) ? r.leidas.length : 0;
            const pct = total ? Math.round(leidas / total * 100) : 0;
            let html;
            if (total && leidas >= total) html = '<span class="rp rp-ok">✅ Leído completo</span>';
            else if (leidas > 0 || (r && r.ultima_pagina > 1)) {
                html = `<span class="rp rp-curso">⏳ En curso · ${leidas}/${total} págs (${pct}%)</span><i class="rp-barra"><b style="width:${pct}%"></b></i>`;
                const t = r.updated_at ? Date.parse(r.updated_at) : 0;
                if (!mejor || t > mejor.t) mejor = { it, r, t };
            } else html = '<span class="rp rp-no">⬜ Sin leer</span>';
            tag.innerHTML = html;
        });
        if (mejor) {
            const b = document.createElement('div');
            b.id = 'up-continuar'; b.className = 'up-continuar'; b.setAttribute('role', 'button'); b.tabIndex = 0;
            const t = decodeURIComponent(mejor.it.dataset.title || '');
            b.innerHTML = `<span>↪</span><span><b>Continuá donde lo dejaste:</b> ${t.replace(/</g, '&lt;')} · página ${mejor.r.ultima_pagina || 1} de ${mejor.r.total_paginas || '?'}</span>`;
            const ir = () => { window._nikaReanudar = true; mejor.it.click(); };
            b.addEventListener('click', ir); b.addEventListener('keydown', e => { if (e.key === 'Enter') ir(); });
            lista.parentElement.insertBefore(b, lista);
        }
    }, 150);
}
document.addEventListener('nika-pdf-progreso', actualizarProgresoRecursos);

function renderResourceItem(resource) {
    const meta = getResourceMeta(resource);
    const isActive = EstudioState.activeResourceUrl === resource.url ? 'active-resource' : '';
    const actionAttr = `onclick="openInlineViewer('${resource.url}', '${resource.title.replace(/'/g, "\\'")}', this)" style="cursor:pointer;"`;

    const fid = nikaDriveId(resource.url);
    const fidAttr = fid ? ` data-fid="${fid}" data-title="${encodeURIComponent(resource.title)}"` : '';
    const progHtml = fid ? `<span class="res-prog" data-fid="${fid}"></span>` : '';

    return `
        <div class="resource-item ${isActive}" ${actionAttr} data-url="${resource.url}"${fidAttr}>
            <div class="resource-icon" style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: ${meta.bg}; color: ${meta.color}; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${meta.icon}</svg>
            </div>
            <div class="resource-info">
                <h5>${resource.title}${badgeObligatorioHtml(resource)}</h5>
                <span>${meta.label}</span>${progHtml}
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
                        <div id="nika-modo-visor" style="display:none; gap:3px; padding:3px; margin-left:8px; border-radius:10px; background:rgba(255,255,255,0.14);"></div>
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
    let driveId = null;

    // 1. Detección de YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        }
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
        }
    } 
    // 2. Detección de Google Drive PDF
    else if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.split('/file/d/')[1]?.split('/')[0];
        if (fileId) {
            embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            driveId = fileId;
        }
    } 
    // 3. Detección de Google Slides / Presentaciones (PowerPoint)
    else if (url.includes('docs.google.com/presentation/d/')) {
        const presId = url.split('/presentation/d/')[1]?.split('/')[0];
        if (presId) {
            embedUrl = `https://docs.google.com/presentation/d/${presId}/embed?start=false&loop=false&delayms=3000`;
        }
    }

    // Archivos de Drive: lector propio con subrayado y progreso (js/estudio/pdfLector.js). Si no se puede abrir así, cae al visor de Drive.
    const wrapperEl = document.getElementById('nika-inline-frame-wrapper');
    if (window.NikaPdf) window.NikaPdf.cerrar();
    if (iframe) iframe.style.display = '';
    if (driveId && window.NikaPdf && wrapperEl) {
        configurarModoVisor({ fileId: driveId, title, iframe, wrapperEl, embedUrl });
        cambiarModoVisor('nika');
    } else {
        configurarModoVisor(null);
        if (iframe) iframe.src = embedUrl;
    }
    // Al sacar el mouse del video, el iframe pierde el foco: así YouTube oculta el icono de pausa y los controles y se puede tomar apuntes sin estorbo.
    if (iframe && !iframe._nikaSinFoco) {
        iframe._nikaSinFoco = true;
        iframe.addEventListener('mouseleave', () => { try { window.focus(); if (document.activeElement === iframe) iframe.blur(); } catch (_) {} });
    }
    if (container) {
        container.style.display = 'block';
        container.style.width = '100%';
        container.style.position = 'relative';
        container.style.zIndex = '1';
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
}

// Selector "Lector NikaMed | Visor Drive": se puede ir y volver entre los dos cuando se quiera.
let _modoVisorCtx = null;
function configurarModoVisor(ctx) {
    _modoVisorCtx = ctx;
    const box = document.getElementById('nika-modo-visor');
    if (!box) return;
    if (!ctx) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.style.display = 'inline-flex';
    box.innerHTML = '<button type="button" data-m="nika">📖 Lector NikaMed</button><button type="button" data-m="drive">Visor Drive</button>';
    box.querySelectorAll('button').forEach((b) => {
        b.style.cssText = 'border:0; border-radius:7px; padding:5px 11px; font:inherit; font-size:0.76rem; font-weight:700; cursor:pointer; color:#fff; background:transparent; transition:background .2s, transform .2s;';
        b.addEventListener('click', () => cambiarModoVisor(b.dataset.m));
    });
}
function marcarModoVisor(modo) {
    document.querySelectorAll('#nika-modo-visor button').forEach((b) => {
        const on = b.dataset.m === modo;
        b.style.background = on ? 'linear-gradient(135deg, #7e22ce, #a855f7)' : 'transparent';
        b.style.boxShadow = on ? '0 3px 10px rgba(168,85,247,0.5)' : 'none';
    });
}
function cambiarModoVisor(modo) {
    const c = _modoVisorCtx; if (!c) return;
    marcarModoVisor(modo);
    if (modo === 'drive') {
        if (window.NikaPdf) window.NikaPdf.cerrar();
        if (c.iframe) { c.iframe.style.display = ''; c.iframe.src = c.embedUrl; }
        return;
    }
    if (c.iframe) c.iframe.src = '';
    window.NikaPdf.abrir({
        wrapper: c.wrapperEl, fileId: c.fileId, title: c.title,
        // si el archivo no se puede abrir con el lector, se muestra el visor de Drive y el selector lo refleja
        fallback: () => { if (c.iframe) { c.iframe.style.display = ''; c.iframe.src = c.embedUrl; } marcarModoVisor('drive'); },
    });
}

function closeInlineViewer() {
    EstudioState.activeResourceUrl = null;
    document.querySelectorAll('.resource-item').forEach(el => el.classList.remove('active-resource'));

    const container = document.getElementById('nika-inline-viewer-container');
    const iframe = document.getElementById('nika-inline-iframe');
    if (window.NikaPdf) window.NikaPdf.cerrar();
    configurarModoVisor(null);
    if (iframe) { iframe.src = ''; iframe.style.display = ''; }
    if (container) {
        container.style.display = 'none';
        const rightSidePanel = document.querySelector('.study-right-column') || document.querySelector('.right-column') || document.querySelector('.col-right');
        if (rightSidePanel) rightSidePanel.style.display = '';
    }
}

function toggleViewerFullscreen() {
    if (window.NikaPdf && window.NikaPdf.activo()) { window.NikaPdf.pantalla(); return; }
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

// ================= PAYWALL VISUAL: ASISTENTE NIKA (NotebookLM) =================

// Valor simulado del plan del usuario — se usa como respaldo si el sistema
// real de accesos (NikaAcceso, que ya gatea la pestaña completa vía
// gateTab()) no está cargado en este contexto. Para probar el bloqueo
// visual en local, cambiar 'free' por 'premium' acá.
const userRole = 'free'; // 'free' | 'premium'

// Devuelve el plan efectivo: prioriza NikaAcceso (fuente real de verdad)
// y cae al valor simulado de arriba si no está disponible.
function getNikaUserRole() {
    if (window.NikaAcceso && typeof window.NikaAcceso.tieneAccesoCompleto === 'function') {
        return window.NikaAcceso.tieneAccesoCompleto() ? 'premium' : 'free';
    }
    return userRole;
}

// Aplica (o quita) el blur + candado sobre el input, el botón "Enviar" y la
// caja de respuestas del Asistente Nika, según el plan actual del usuario.
function aplicarPaywallChat() {
    const wrapper = document.getElementById('module-chat-body');
    const overlay = document.getElementById('module-chat-paywall-overlay');
    if (!wrapper || !overlay) return;

    const esPremium = getNikaUserRole() === 'premium';
    wrapper.classList.toggle('module-chat-locked', !esPremium);
    overlay.style.display = esPremium ? 'none' : 'flex';

    const chatInput = document.getElementById('module-chat-input');
    const chatSend = document.getElementById('module-chat-send');
    if (chatInput) chatInput.disabled = !esPremium;
    if (chatSend) chatSend.disabled = !esPremium;
}

// Botón "Pasate a Premium" del overlay: reutiliza el modal real de
// NikaAcceso si está disponible; si no, redirige directo a la suscripción.
function abrirUpsellAsistente() {
    if (window.NikaAcceso && typeof window.NikaAcceso.mostrarModalSoloVip === 'function') {
        window.NikaAcceso.mostrarModalSoloVip('asistente');
        return;
    }
    window.location.href = 'nikamed-plus.html';
}

function renderNotebookLmTab() {
    const panel = document.getElementById('notebooklm-panel');
    if (!panel) {
        console.warn('[Estudio] No se encontró #notebooklm-panel en el DOM.');
        return;
    }

    if (panel.dataset.chatRendered) return;
    panel.dataset.chatRendered = 'true';

    panel.innerHTML = `
        <div style="position:relative;">
            <div id="module-chat-body" style="display:flex; flex-direction:column; height:100%; min-height:420px;">
                <div style="margin-bottom:10px;">
                    <h3 style="margin:0 0 2px 0;">🤖 Asistente Bibliográfico</h3>
                    <span id="module-chat-subtitle" style="font-size:0.8rem; color:#64748b;">Cirugía</span>
                </div>
                <div id="module-chat-messages" style="flex:1; display:flex; flex-direction:column; gap:8px; overflow-y:auto; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; min-height:260px; margin-bottom:10px;"></div>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="module-chat-input" placeholder="Preguntale al asistente sobre esta unidad..."
                           style="flex:1; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;">
                    <button id="module-chat-send" type="button"
                            style="padding:10px 16px; background:var(--nika-primary,#0284c7); color:#fff; border:none; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer;">
                        Enviar
                    </button>
                </div>
            </div>

            <!-- Paywall: se muestra/oculta desde aplicarPaywallChat() según el plan del usuario -->
            <div id="module-chat-paywall-overlay" class="module-chat-paywall-overlay" style="display:none;">
                <div class="module-chat-paywall-card">
                    <div class="module-chat-paywall-lock">🔒</div>
                    <p class="module-chat-paywall-text">
                        <strong>Asistente IA Exclusivo NikaMed+.</strong><br>
                        Resolvé tus dudas médicas al instante con bibliografía oficial.
                    </p>
                    <button type="button" class="module-chat-paywall-btn" onclick="abrirUpsellAsistente()">Pasate a Premium</button>
                </div>
            </div>
        </div>
    `;

    aplicarPaywallChat();
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

    const NIKA_CHAT_URL = 'https://pswjmouuyaxueaqqglko.supabase.co/functions/v1/chat-nika';

    // Nombre "lindo" del módulo activo para mandar al backend (Cirugia / Ginecologia).
    function moduloActivoLabel() {
        const m = (EstudioState.modulo || '').toLowerCase();
        if (m.startsWith('gine')) return 'Ginecologia';
        if (m.startsWith('cirug')) return 'Cirugia';
        return EstudioState.modulo || '';
    }

    // UP activa en formato "UP1", "UP2", etc.
    function unidadActivaLabel() {
        const unit = EstudioState.currentUpId ? EstudioState.unitsById[EstudioState.currentUpId] : null;
        if (unit && unit.number) return `UP${unit.number}`;
        if (EstudioState.currentUpId) return EstudioState.currentUpId.toUpperCase();
        return 'UP1';
    }

    async function handleModuleChat() {
        if (getNikaUserRole() !== 'premium') {
            abrirUpsellAsistente();
            return;
        }

        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Pinta la pregunta del usuario (derecha) y limpia el input.
        appendModuleMsg(text, 'user');
        chatInput.value = '';
        chatInput.focus();

        // 2. Indicador de carga estilo chat, con puntitos animados (izquierda).
        const loadingRow = appendTypingIndicator();

        try {
            // 3 y 4. POST a la Edge Function con { pregunta, modulo, unidad }.
            // El servidor ahora verifica la sesión y que la cuenta sea NikaMed+/admin: hay que mandar el token del usuario.
            let _token = null;
            try {
                const _c = window.NikaSupabase && window.NikaSupabase.client;
                if (_c) { const { data: { session: _s } } = await _c.auth.getSession(); _token = _s && _s.access_token; }
            } catch (_) {}
            const response = await fetch(NIKA_CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(_token ? { 'Authorization': 'Bearer ' + _token } : {}) },
                body: JSON.stringify({
                    pregunta: text,
                    modulo: moduloActivoLabel(),
                    unidad: unidadActivaLabel()
                })
            });

            if (!response.ok) {
                if ([401, 403, 429, 503].includes(response.status)) {
                    const j = await response.json().catch(() => null);
                    if (j && j.mensaje) { loadingRow.remove(); appendModuleMsg('⚠️ ' + j.mensaje, 'error'); return; }
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const respuesta = (data && data.respuesta) ? data.respuesta : 'No se obtuvo respuesta del asistente.';

            // 5. Reemplaza el indicador por la respuesta real, procesando \n.
            loadingRow.remove();
            appendModuleMsg(respuesta, 'bot');

        } catch (err) {
            // 6. Error de red/timeout: mensaje elegante dentro del chat.
            console.error('[Error en Chat Bibliográfico]', err);
            loadingRow.remove();
            appendModuleMsg('⚠️ Tuvimos un problema de conexión con el Asistente Nika. Probá de nuevo en unos segundos.', 'error');
        }
    }

    function appendTypingIndicator() {
        const row = document.createElement('div');
        row.className = 'nika-chat-row nika-chat-row--bot';
        row.innerHTML = `
            <div class="nika-chat-bubble nika-chat-bubble--typing">
                <span class="nika-chat-typing-label">Nika está analizando la bibliografía</span>
                <span class="nika-chat-typing-dots"><span></span><span></span><span></span></span>
            </div>`;
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return row;
    }

    function appendModuleMsg(text, sender) {
        const row = document.createElement('div');
        const isUser = sender === 'user';
        const isError = sender === 'error';
        row.className = `nika-chat-row ${isUser ? 'nika-chat-row--user' : 'nika-chat-row--bot'}`;

        const bubble = document.createElement('div');
        bubble.className = isUser
            ? 'nika-chat-bubble nika-chat-bubble--user'
            : (isError ? 'nika-chat-bubble nika-chat-bubble--error' : 'nika-chat-bubble nika-chat-bubble--bot');

        // Procesa los \n como saltos de línea reales usando nodos de texto
        // (no innerHTML), para no ejecutar HTML que venga del usuario o del backend.
        String(text).split('\n').forEach((line, idx, arr) => {
            bubble.appendChild(document.createTextNode(line));
            if (idx < arr.length - 1) bubble.appendChild(document.createElement('br'));
        });

        row.appendChild(bubble);
        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return row;
    }

    chatSend.addEventListener('click', handleModuleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleModuleChat();
    });
}

// ================= PARTE 3: CALENDARIO Y CRONOGRAMA DE REPASO =================

// Estado del deep-link activo, para que "Agendar repaso de esta UP" sepa qué
// módulo/UP/etiqueta asociar sin tener que volver a pedirlo por parámetros.
const RepasoState = { moduloActual: null, upActual: null, upLabelActual: null };

function getSupabaseClienteActivo() {
    return window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;
}

async function getUsuarioActivo() {
    const client = getSupabaseClienteActivo();
    if (client && client.auth) {
        try {
            const { data: { user } } = await client.auth.getUser();
            if (user) return user;
        } catch (e) { /* seguimos al fallback local */ }
    }
    return null;
}

// Crea (si no existe) e inicializa el widget "📅 Mi Cronograma de Repaso"
// debajo del Pomodoro, cada vez que se abre una UP. Estilo fijo oscuro
// tipo "premium card", igual en Cirugía y en Ginecología.
function initRepasoWidget(moduloId, upId, upLabel) {
    RepasoState.moduloActual = moduloId;
    RepasoState.upActual = upId;
    RepasoState.upLabelActual = upLabel;

    const pomodoroPlaceholder = document.getElementById('pomodoro-placeholder');
    if (!pomodoroPlaceholder) return;

    let widget = document.getElementById('nika-repaso-widget');
    if (!widget) {
        const html = `
        <div id="nika-repaso-widget" style="border:1px solid var(--border,#e2e8f0); border-radius:14px; padding:18px; margin-top:16px; background:var(--card-bg,#fff); box-shadow:0 4px 14px -8px rgba(0,0,0,0.12);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <h4 style="font-size:0.8rem; margin:0; color:var(--nika-dark,#0f172a); font-weight:800; letter-spacing:.02em; display:flex; align-items:center; gap:6px;">📅 Mi Cronograma de Repaso</h4>
                <button type="button" onclick="abrirModalCalendario()" title="Ver calendario completo"
                        style="border:none; background:rgba(244,114,182,0.1); width:26px; height:26px; border-radius:7px; cursor:pointer; font-size:0.85rem; color:var(--nika-primary,#0f6cbf);">🗓️</button>
            </div>
            <div id="repaso-lista" style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px; font-size:0.78rem; color:var(--text-muted,#64748b);">
                <span style="font-style:italic;">Cargando...</span>
            </div>
            <button type="button" id="btn-agendar-repaso"
                    style="width:100%; padding:11px; border:none; border-radius:9px; background:linear-gradient(135deg, #c084fc, #f472b6); color:#fff; font-weight:800; cursor:pointer; font-size:0.8rem; letter-spacing:.01em;">
                + Agendar repaso de esta UP
            </button>
        </div>`;
        pomodoroPlaceholder.insertAdjacentHTML('afterend', html);
        widget = document.getElementById('nika-repaso-widget');
        document.getElementById('btn-agendar-repaso').addEventListener('click', abrirModalAgendarRepaso);
    }

    cargarRepasos();
}

// ---- Modal "Agendar repaso" (glassmorphism): fecha + motivo + guardar ----

function inyectarModalAgendarRepasoSiHaceFalta() {
    if (document.getElementById('modal-agendar-repaso')) return;
    const html = `
    <style>
        /* ---- CSS forzado del modal Timeboxing ----
           Inyectado en línea junto con el propio HTML del modal para que
           NINGUNA regla externa de styles.css (cascada, orden de carga,
           especificidad, resets genéricos de "button"/"input") pueda
           pisarlo. Todo con !important a propósito. */
        #modal-agendar-repaso .nika-agendar-tabs {
            display: flex !important;
            gap: 4px !important;
            background: rgba(15, 23, 42, 0.55) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 999px !important;
            padding: 5px !important;
            margin-bottom: 20px !important;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35) !important;
        }
        #modal-agendar-repaso .nika-agendar-tab-btn {
            flex: 1 !important;
            padding: 9px 10px !important;
            border: none !important;
            border-radius: 999px !important;
            background: transparent !important;
            color: #94a3b8 !important;
            font-size: 0.76rem !important;
            font-weight: 700 !important;
            cursor: pointer !important;
        }
        #modal-agendar-repaso .nika-agendar-tab-btn.active {
            border-radius: 99px !important;
            background: linear-gradient(120deg, var(--nika-accent, #38bdf8), var(--nika-primary, #0284c7)) !important;
            color: #0b1329 !important;
            box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.45) !important;
        }
        #modal-agendar-repaso input[type="time"] {
            width: 100% !important;
            padding: 9px 10px !important;
            border-radius: 8px !important;
            border: 1px solid rgba(255, 255, 255, 0.14) !important;
            background: rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
            font-size: 0.82rem !important;
            color-scheme: dark !important;
        }
        #modal-agendar-repaso input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(1) brightness(1.4) !important;
            cursor: pointer !important;
        }
    </style>
    <div id="modal-agendar-repaso" style="display:none; position:fixed; inset:0; background:rgba(11,19,41,0.55); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:9999; align-items:center; justify-content:center;"
         onclick="if (event.target === this) cerrarModalAgendarRepaso();">
        <div style="background:rgba(30,41,59,0.75); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:26px; width:92%; max-width:400px; max-height:88vh; overflow-y:auto; color:#e2e8f0; box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);">
            <h3 style="margin:0 0 4px 0; font-size:1.05rem; font-weight:800; color:#f1f5f9;">Agendar en mi calendario</h3>
            <p id="modal-agendar-subtitulo" style="margin:0 0 16px 0; font-size:0.78rem; color:#94a3b8;"></p>

            <!-- ===== Tabs: Eventos / Planificador Diario ===== -->
            <div class="nika-agendar-tabs">
                <button type="button" id="tab-btn-eventos" class="nika-agendar-tab-btn active" onclick="cambiarTabAgendar('eventos')">📅 Próximo Examen</button>
                <button type="button" id="tab-btn-timeboxing" class="nika-agendar-tab-btn" onclick="cambiarTabAgendar('timeboxing')">⏱️ Organizá tu Día</button>
            </div>

            <!-- ===== Panel: Eventos (contenido original) ===== -->
            <div id="tab-panel-eventos" class="nika-agendar-tab-panel">
                <label style="display:block; font-size:0.72rem; font-weight:700; color:#cbd5e1; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em;">Fecha</label>
                <input type="date" id="input-fecha-repaso"
                       style="width:100%; padding:10px 12px; border-radius:9px; border:1px solid rgba(255,255,255,0.14); background:rgba(15,23,42,0.6); color:#e2e8f0; margin-bottom:16px; font-size:0.85rem;">

                <label style="display:block; font-size:0.72rem; font-weight:700; color:#cbd5e1; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em;">Motivo</label>
                <input type="text" id="select-motivo-repaso" placeholder="Ej: Examen Parcial, Repaso UP1..."
                       style="width:100%; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#ffffff; margin-bottom:22px; font-size:0.85rem; box-sizing:border-box;">

                <div style="display:flex; gap:10px; margin-bottom:22px;">
                    <button type="button" onclick="cerrarModalAgendarRepaso()"
                            style="flex:1; padding:11px; border-radius:9px; border:1px solid rgba(255,255,255,0.14); background:transparent; color:#cbd5e1; font-weight:700; cursor:pointer; font-size:0.82rem;">Cancelar</button>
                    <button type="button" id="btn-guardar-repaso" onclick="guardarRepasoDesdeModal()"
                            style="flex:1.3; padding:11px; border-radius:9px; border:none; background:linear-gradient(135deg, var(--nika-accent, #c084fc), var(--nika-primary, #f472b6)); color:#0b1329; font-weight:800; cursor:pointer; font-size:0.82rem;">Guardar en mi Calendario</button>
                </div>

                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:14px;">
                    <label style="display:block; font-size:0.72rem; font-weight:700; color:#cbd5e1; margin-bottom:8px; text-transform:uppercase; letter-spacing:.04em;">Tus próximos eventos</label>
                    <div id="modal-repaso-lista-existentes" style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;">
                        <span style="font-style:italic; font-size:0.78rem; color:#94a3b8;">Cargando...</span>
                    </div>
                </div>
            </div>

            <!-- ===== Panel: Planificador Diario (Timeboxing) ===== -->
            <div id="tab-panel-timeboxing" class="nika-agendar-tab-panel" style="display:none;">
                <p id="timeboxing-fecha-label" style="margin:0 0 14px 0; font-size:0.78rem; color:#94a3b8;"></p>

                <div style="display:flex; gap:10px; margin-bottom:12px;">
                    <div style="flex:1;">
                        <label style="display:block; font-size:0.68rem; font-weight:700; color:#cbd5e1; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em;">Inicio</label>
                        <input type="time" id="input-hora-inicio-block">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; font-size:0.68rem; font-weight:700; color:#cbd5e1; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em;">Fin</label>
                        <input type="time" id="input-hora-fin-block">
                    </div>
                </div>

                <label style="display:block; font-size:0.68rem; font-weight:700; color:#cbd5e1; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em;">Tarea</label>
                <input type="text" id="input-tarea-block" placeholder="Ej: Estudiar UP1, Hacer Simulacros..."
                       style="width:100%; padding:10px 12px; border-radius:9px; border:1px solid rgba(255,255,255,0.14); background:rgba(15,23,42,0.6); color:#e2e8f0; margin-bottom:14px; font-size:0.85rem;">

                <button type="button" id="btn-agregar-bloque" onclick="agregarBloqueTimeboxing()"
                        class="nika-agendar-tab-add-btn"
                        style="display:block !important; width:100% !important; padding:11px !important; border:none !important; border-radius:9px !important; background:linear-gradient(135deg, var(--nika-accent, #c084fc), var(--nika-primary, #f472b6)) !important; color:#0b1329 !important; font-weight:800 !important; cursor:pointer !important; font-size:0.82rem !important; text-align:center !important; box-sizing:border-box !important;">+ Agregar Bloque</button>

                <div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:18px; padding-top:14px;">
                    <label style="display:block; font-size:0.72rem; font-weight:700; color:#cbd5e1; margin-bottom:8px; text-transform:uppercase; letter-spacing:.04em;">Bloques de hoy</label>
                    <div id="timeboxing-lista-bloques" style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
                        <span style="font-style:italic; font-size:0.78rem; color:#94a3b8;">Todavía no agregaste bloques para hoy.</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

// Alterna entre la pestaña "Eventos" y "Planificador Diario" dentro del modal.
function cambiarTabAgendar(tab) {
    const panelEventos = document.getElementById('tab-panel-eventos');
    const panelTimeboxing = document.getElementById('tab-panel-timeboxing');
    const btnEventos = document.getElementById('tab-btn-eventos');
    const btnTimeboxing = document.getElementById('tab-btn-timeboxing');
    if (!panelEventos || !panelTimeboxing || !btnEventos || !btnTimeboxing) return;

    const esEventos = tab === 'eventos';
    panelEventos.style.display = esEventos ? 'block' : 'none';
    panelTimeboxing.style.display = esEventos ? 'none' : 'block';
    btnEventos.classList.toggle('active', esEventos);
    btnTimeboxing.classList.toggle('active', !esEventos);

    if (!esEventos) renderBloquesTimeboxing();
}

function abrirModalAgendarRepaso() {
    inyectarModalAgendarRepasoSiHaceFalta();
    const overlay = document.getElementById('modal-agendar-repaso');
    const subtitulo = document.getElementById('modal-agendar-subtitulo');
    const fechaInput = document.getElementById('input-fecha-repaso');

    subtitulo.textContent = `${({ ginecologia: 'Ginecología', siam: 'S.I.A.M.' }[RepasoState.moduloActual] || 'Cirugía')} · ${RepasoState.upLabelActual || RepasoState.upActual}`;

    // Sugerencia por defecto: hoy + 3 días (el usuario la puede cambiar libremente).
    const sugerida = new Date();
    sugerida.setDate(sugerida.getDate() + 3);
    fechaInput.value = fechaLocalISO(sugerida);
    fechaInput.min = fechaLocalISO();

    document.getElementById('select-motivo-repaso').value = '';
    overlay.style.display = 'flex';
    cambiarTabAgendar('eventos');
    renderListaEventosEnModal();
}

function cerrarModalAgendarRepaso() {
    const overlay = document.getElementById('modal-agendar-repaso');
    if (overlay) overlay.style.display = 'none';
}

// Lista, dentro del propio modal, los próximos eventos del usuario (de
// cualquier módulo) con un ícono de tacho para eliminarlos directamente.
async function renderListaEventosEnModal() {
    const cont = document.getElementById('modal-repaso-lista-existentes');
    if (!cont) return;

    const user = await getUsuarioActivo();
    const client = getSupabaseClienteActivo();
    if (!user || !client) {
        cont.innerHTML = `<span style="font-style:italic; font-size:0.78rem; color:#94a3b8;">Iniciá sesión para ver tus eventos.</span>`;
        return;
    }

    try {
        const hoy = fechaLocalISO();
        const { data, error } = await client
            .from('calendario_eventos')
            .select('id, titulo, tipo, fecha')
            .eq('user_id', user.id)
            .gte('fecha', hoy)
            .order('fecha', { ascending: true })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            cont.innerHTML = `<span style="font-style:italic; font-size:0.78rem; color:#94a3b8;">No tenés eventos agendados todavía.</span>`;
            return;
        }

        const iconoTipo = { repaso: '📘', examen: '📝', bloque_estudio: '⏰', otro: '📌' };
        cont.innerHTML = data.map(ev => `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 10px; background:rgba(255,255,255,0.04); border-radius:8px;">
                <span style="font-size:0.78rem; color:#e2e8f0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;" onclick="editarEvento('${ev.id}')" title="Editar evento">${iconoTipo[ev.tipo] || '📅'} ${escaparHtmlBasico(ev.titulo || '')} <span style="color:#94a3b8;">· ${ev.fecha}</span></span>
                <span style="flex-shrink:0; display:flex; gap:4px;">
                    <button type="button" onclick="editarEvento('${ev.id}')" title="Editar evento"
                            style="border:none; background:rgba(148,163,184,0.18); width:26px; height:26px; border-radius:7px; cursor:pointer; font-size:0.8rem;">✏️</button>
                    <button type="button" onclick="eliminarEvento('${ev.id}')" title="Eliminar evento"
                            style="border:none; background:rgba(239,68,68,0.15); color:#ef4444; width:26px; height:26px; border-radius:7px; cursor:pointer; font-size:0.8rem;">🗑️</button>
                </span>
            </div>
        `).join('');
    } catch (err) {
        console.warn('[Calendario] No se pudo cargar la lista de eventos:', err);
        cont.innerHTML = `<span style="font-style:italic; font-size:0.78rem; color:#94a3b8;">No se pudo cargar tu lista de eventos.</span>`;
    }
}

// Elimina un evento de calendario_eventos por su ID (Supabase), y refresca
// todas las vistas que puedan estar mostrando el calendario en pantalla.
async function eliminarEvento(eventId) {
    if (!confirm('¿Seguro que querés borrar este evento?')) return;

    const client = getSupabaseClienteActivo();
    const user = await getUsuarioActivo();
    if (!client || !user) {
        alert('Iniciá sesión para eliminar eventos.');
        return;
    }

    try {
        const { error } = await client
            .from('calendario_eventos')
            .delete()
            .eq('id', eventId)
            .eq('user_id', user.id); // refuerzo: solo puede borrar sus propios eventos
        if (error) throw error;

        await refrescarVistasCalendario();
    } catch (err) {
        console.error('[Calendario] No se pudo eliminar el evento:', err);
        alert('No se pudo eliminar el evento. Probá de nuevo en un momento.');
    }
}

// Compatibilidad con los onclick anteriores
function eliminarEventoCalendario(eventId) { return eliminarEvento(eventId); }

// Repinta todo lo que muestre eventos: lista del modal, cronograma, bloques de hoy y calendario mensual.
async function refrescarVistasCalendario() {
    await cargarBloquesHoy();
    renderListaEventosEnModal();
    renderBloquesTimeboxing();
    cargarRepasos();
    const cal = document.getElementById('modal-calendario-nika');
    if (cal && cal.style.display === 'flex') {
        await cargarEventosDelMes();
        renderCalendarioGrid();
    }
}

// ---- Edición de eventos (modal precargado) ----
const EventoEditState = { evento: null };

function inyectarModalEditarEventoSiHaceFalta() {
    if (document.getElementById('modal-editar-evento')) return;
    const campo = 'width:100%; padding:10px 12px; border-radius:9px; border:1px solid rgba(255,255,255,0.14); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:0.85rem; box-sizing:border-box;';
    const label = 'display:block; font-size:0.68rem; font-weight:700; color:#cbd5e1; margin:12px 0 6px; text-transform:uppercase; letter-spacing:.04em;';
    document.body.insertAdjacentHTML('beforeend', `
    <div id="modal-editar-evento" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:10001; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;"
         onclick="if (event.target === this) cerrarModalEditarEvento();">
        <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px; width:100%; max-width:400px; max-height:90vh; overflow-y:auto; color:#e2e8f0;">
            <h3 style="margin:0; font-size:1.05rem; font-weight:800;">✏️ Editar evento</h3>
            <label style="${label}">Título / motivo</label>
            <input type="text" id="edit-ev-titulo" maxlength="120" style="${campo}">
            <label style="${label}">Fecha</label>
            <input type="date" id="edit-ev-fecha" style="${campo}">
            <label style="${label}">Tipo</label>
            <select id="edit-ev-tipo" style="${campo}">
                <option value="examen">📝 Examen</option>
                <option value="repaso">📘 Repaso</option>
                <option value="bloque_estudio">⏰ Bloque de estudio</option>
                <option value="otro">📌 Otro</option>
            </select>
            <div style="display:flex; gap:10px;">
                <div style="flex:1;"><label style="${label}">Módulo</label>
                    <select id="edit-ev-modulo" style="${campo}">
                        <option value="">— Sin módulo —</option>
                        <option value="cirugia">Cirugía</option>
                        <option value="ginecologia">Ginecología</option>
                        <option value="siam">S.I.A.M.</option>
                    </select></div>
                <div style="flex:1;"><label style="${label}">UP (número)</label>
                    <input type="number" id="edit-ev-up" min="1" max="99" placeholder="Ej: 7" style="${campo}"></div>
            </div>
            <div id="edit-ev-horas" style="display:none; gap:10px;">
                <div style="flex:1;"><label style="${label}">Inicio</label><input type="time" id="edit-ev-hora-inicio" style="${campo}"></div>
                <div style="flex:1;"><label style="${label}">Fin</label><input type="time" id="edit-ev-hora-fin" style="${campo}"></div>
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button type="button" onclick="cerrarModalEditarEvento()" style="flex:1; padding:11px; border:1px solid rgba(255,255,255,0.14); background:transparent; color:#e2e8f0; border-radius:9px; cursor:pointer; font-weight:700;">Cancelar</button>
                <button type="button" id="btn-guardar-edicion-evento" onclick="guardarEdicionEvento()" style="flex:1.4; padding:11px; border:none; background:linear-gradient(135deg,#0284c7,#2563eb); color:#fff; border-radius:9px; cursor:pointer; font-weight:800;">Guardar cambios</button>
            </div>
        </div>
    </div>`);
    document.getElementById('edit-ev-tipo').addEventListener('change', (e) => {
        document.getElementById('edit-ev-horas').style.display = e.target.value === 'bloque_estudio' ? 'flex' : 'none';
    });
}

function numeroDeUp(upId) {
    const m = String(upId || '').match(/^up(\d+)/i);
    return m ? m[1] : '';
}

async function editarEvento(id) {
    const client = getSupabaseClienteActivo();
    const user = await getUsuarioActivo();
    if (!client || !user) { alert('Iniciá sesión para editar eventos.'); return; }
    try {
        const { data, error } = await client.from('calendario_eventos')
            .select('*').eq('id', id).eq('user_id', user.id).single();
        if (error) throw error;
        EventoEditState.evento = data;
        inyectarModalEditarEventoSiHaceFalta();
        document.getElementById('edit-ev-titulo').value = data.titulo || '';
        document.getElementById('edit-ev-fecha').value = data.fecha || '';
        document.getElementById('edit-ev-tipo').value = data.tipo || 'otro';
        document.getElementById('edit-ev-modulo').value = data.modulo || '';
        document.getElementById('edit-ev-up').value = numeroDeUp(data.up_id);
        document.getElementById('edit-ev-hora-inicio').value = horaCorta(data.hora_inicio);
        document.getElementById('edit-ev-hora-fin').value = horaCorta(data.hora_fin);
        document.getElementById('edit-ev-horas').style.display = data.tipo === 'bloque_estudio' ? 'flex' : 'none';
        document.getElementById('modal-editar-evento').style.display = 'flex';
    } catch (err) {
        console.error('[Calendario] No se pudo abrir el evento:', err);
        alert('No se pudo cargar el evento para editarlo.');
    }
}

function cerrarModalEditarEvento() {
    const m = document.getElementById('modal-editar-evento');
    if (m) m.style.display = 'none';
    EventoEditState.evento = null;
}

async function guardarEdicionEvento() {
    const ev = EventoEditState.evento;
    if (!ev) return;
    const titulo = document.getElementById('edit-ev-titulo').value.trim();
    const fecha = document.getElementById('edit-ev-fecha').value;
    const tipo = document.getElementById('edit-ev-tipo').value;
    const modulo = document.getElementById('edit-ev-modulo').value || null;
    const upNum = document.getElementById('edit-ev-up').value.trim();
    if (!titulo) { alert('El título no puede quedar vacío.'); return; }
    if (!fecha) { alert('Elegí una fecha.'); return; }

    const cambios = { titulo, fecha, tipo, modulo };
    // Si el número de UP no cambió se conserva el up_id original (puede ser una subsección, ej. up3__sec2).
    cambios.up_id = upNum ? (upNum === numeroDeUp(ev.up_id) ? ev.up_id : `up${upNum}`) : null;
    if (tipo === 'bloque_estudio') {
        const hi = document.getElementById('edit-ev-hora-inicio').value;
        const hf = document.getElementById('edit-ev-hora-fin').value;
        if (!hi || !hf || hf <= hi) { alert('Indicá una hora de inicio y una de fin posterior.'); return; }
        cambios.hora_inicio = hi; cambios.hora_fin = hf;
    }

    const client = getSupabaseClienteActivo();
    const user = await getUsuarioActivo();
    if (!client || !user) return;
    const btn = document.getElementById('btn-guardar-edicion-evento');
    btn.disabled = true; btn.textContent = 'Guardando...';
    try {
        const { error } = await client.from('calendario_eventos')
            .update(cambios).eq('id', ev.id).eq('user_id', user.id);
        if (error) throw error;
        cerrarModalEditarEvento();
        await refrescarVistasCalendario();
    } catch (err) {
        console.error('[Calendario] No se pudo guardar la edición:', err);
        alert('No se pudieron guardar los cambios. Probá de nuevo.');
    } finally {
        btn.disabled = false; btn.textContent = 'Guardar cambios';
    }
}

// calendario_eventos_tipo_check solo admite 'examen' | 'bloque_estudio' | 'repaso' | 'otro'.
// El motivo es texto libre: se usa en el título y aquí se traduce a un tipo válido.
function tipoEventoDesdeMotivo(motivo) {
    const t = String(motivo || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/final|parcial|examen|recuperatorio|evaluacion|prueba/.test(t)) return 'examen';
    if (/bloque|planific/.test(t)) return 'bloque_estudio';
    if (/repaso|repasar|repas|estudi/.test(t) || !t) return 'repaso';
    return 'otro';
}

async function guardarRepasoDesdeModal() {
    const btn = document.getElementById('btn-guardar-repaso');
    const fecha = document.getElementById('input-fecha-repaso').value;
    const motivo = document.getElementById('select-motivo-repaso').value.trim();
    if (!fecha) {
        alert('Elegí una fecha para el evento.');
        return;
    }

    const user = await getUsuarioActivo();
    const client = getSupabaseClienteActivo();
    if (!user || !client) {
        alert('Iniciá sesión para agendar un repaso.');
        return;
    }

    const nombreModulo = ({ ginecologia: 'Ginecología', siam: 'S.I.A.M.' })[RepasoState.moduloActual] || 'Cirugía';

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const { error } = await client.from('calendario_eventos').insert({
            user_id: user.id,
            titulo: `${motivo || 'Repaso'} · ${nombreModulo} - ${RepasoState.upLabelActual || RepasoState.upActual}`,
            tipo: tipoEventoDesdeMotivo(motivo),
            modulo: RepasoState.moduloActual,
            up_id: RepasoState.upActual,
            fecha: fecha
        });
        if (error) throw error;

        cerrarModalAgendarRepaso();
        cargarRepasos();
        renderListaEventosEnModal();
    } catch (err) {
        console.error('[Repaso] No se pudo agendar:', err);
        alert('No se pudo guardar el evento. Probá de nuevo en un momento.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar en mi Calendario';
    }
}


// Estilos de los bloques del planificador (estudio.html no carga styles.css).
(function inyectarEstilosBloques() {
    if (document.getElementById('nika-bloques-style')) return;
    const st = document.createElement('style');
    st.id = 'nika-bloques-style';
    st.textContent = `
        .nika-bloques-titulo { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; opacity: .65; margin: 4px 0 2px; }
        .nika-bloque { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border: 1px solid rgba(148,163,184,0.35); border-left: 4px solid #94a3b8; border-radius: 10px; background: rgba(148,163,184,0.08); }
        .nika-bloque-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .nika-bloque-hora { font-size: 0.72rem; font-weight: 800; opacity: .8; }
        .nika-bloque-tarea { font-size: 0.85rem; font-weight: 700; word-break: break-word; }
        .nika-bloque-ctx { font-size: 0.7rem; opacity: .7; }
        .nika-bloque-estado { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
        .nika-bloque-acciones { display: flex; flex-wrap: wrap; gap: 6px; }
        .nika-bloque-btn { border: 1px solid rgba(148,163,184,0.5); background: transparent; color: inherit; font-size: 0.72rem; font-weight: 700; padding: 5px 9px; border-radius: 7px; cursor: pointer; min-height: 0 !important; }
        .nika-bloque-btn:hover { background: rgba(148,163,184,0.2); }
        .nika-bloque-btn.is-muted { opacity: .7; }
        .nika-bloque.is-en_curso { border-left-color: #22c55e; } .nika-bloque.is-en_curso .nika-bloque-estado { color: #22c55e; }
        .nika-bloque.is-pendiente { border-left-color: #f59e0b; } .nika-bloque.is-pendiente .nika-bloque-estado { color: #f59e0b; }
        .nika-bloque.is-expirado { border-left-color: #ef4444; } .nika-bloque.is-expirado .nika-bloque-estado { color: #ef4444; }
        .nika-evento-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(244,114,182,0.06); border-radius: 8px; cursor: pointer; transition: background .15s; }
        .nika-evento-item:hover { background: rgba(244,114,182,0.14); }
        .nika-evento-titulo { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-main,#1e293b); }
        .nika-evento-cuando { color: #f472b6; white-space: nowrap; font-size: 0.72rem; }
        .nika-evento-acciones { display: flex; gap: 4px; flex-shrink: 0; }
        .nika-evento-btn { border: none; background: rgba(148,163,184,0.18); width: 26px; height: 26px; border-radius: 7px; cursor: pointer; font-size: 0.78rem; padding: 0; min-height: 0 !important; }
        .nika-evento-btn:hover { background: rgba(148,163,184,0.35); }
        .nika-evento-btn.is-danger { background: rgba(239,68,68,0.15); }
        .nika-evento-btn.is-danger:hover { background: rgba(239,68,68,0.3); }
        .nika-bloque.is-completado, .nika-bloque.is-descartado { opacity: .55; }
        .nika-bloque.is-completado .nika-bloque-tarea { text-decoration: line-through; }
    `;
    document.head.appendChild(st);
})();

// ================= PLANIFICADOR DIARIO (bloques en calendario_eventos) =================
// Cada bloque es una fila de calendario_eventos (tipo 'bloque_estudio') con hora_inicio,
// hora_fin, modulo, up_id y estado ('pendiente' | 'en_curso' | 'completado' | 'descartado').
// "Expirado" NO se guarda: es un estado calculado (pendiente cuya hora_fin ya pasó), para que
// el bloque nunca se borre solo y el usuario decida si lo marca como hecho o lo descarta.
// Requiere las columnas hora_inicio / hora_fin / estado (ver sql/calendario_bloques.sql).

const BloquesState = { fecha: null, hoy: [] };

// Fecha LOCAL en YYYY-MM-DD (toISOString() devuelve UTC y de noche caía en "mañana").
function fechaLocalISO(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function horaCorta(t) { return t ? String(t).slice(0, 5) : ''; }
function minutosDe(t) { const [h, m] = horaCorta(t).split(':').map(Number); return (h || 0) * 60 + (m || 0); }
function ahoraEnMinutos() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

function estadoEfectivoBloque(b) {
    if (b.estado === 'completado' || b.estado === 'descartado' || b.estado === 'en_curso') return b.estado;
    return ahoraEnMinutos() >= minutosDe(b.hora_fin) ? 'expirado' : 'pendiente';
}

function toastBloque(texto, tipo) {
    if (typeof showToast === 'function') showToast(texto, tipo || 'success');
    else console.info('[Planificador]', texto);
}

async function cargarBloquesHoy() {
    const user = await getUsuarioActivo();
    const client = getSupabaseClienteActivo();
    BloquesState.fecha = fechaLocalISO();
    if (!user || !client) { BloquesState.hoy = []; return BloquesState.hoy; }
    try {
        const { data, error } = await client
            .from('calendario_eventos')
            .select('id, titulo, tipo, modulo, up_id, fecha, hora_inicio, hora_fin, estado')
            .eq('user_id', user.id)
            .eq('fecha', BloquesState.fecha)
            .eq('tipo', 'bloque_estudio')
            .order('hora_inicio', { ascending: true });
        if (error) throw error;
        BloquesState.hoy = data || [];
    } catch (err) {
        console.warn('[Planificador] No se pudieron leer los bloques de hoy:', err);
        BloquesState.hoy = [];
    }
    return BloquesState.hoy;
}

async function refrescarBloques() {
    await cargarBloquesHoy();
    renderBloquesTimeboxing();
    cargarRepasos();
}

async function agregarBloqueTimeboxing() {
    const inicioInput = document.getElementById('input-hora-inicio-block');
    const finInput = document.getElementById('input-hora-fin-block');
    const tareaInput = document.getElementById('input-tarea-block');

    const inicio = inicioInput.value;
    const fin = finInput.value;
    const tarea = tareaInput.value.trim();

    if (!inicio || !fin) { alert('Elegí una hora de inicio y una hora de fin para el bloque.'); return; }
    if (!tarea) { alert('Contanos qué vas a hacer en ese bloque (ej: Estudiar UP1).'); return; }
    if (fin <= inicio) { alert('La hora de fin tiene que ser posterior a la hora de inicio.'); return; }

    const user = await getUsuarioActivo();
    const client = getSupabaseClienteActivo();
    if (!user || !client) { alert('Iniciá sesión para planificar tu día.'); return; }

    const btn = document.getElementById('btn-agregar-bloque');
    if (btn) btn.disabled = true;
    try {
        const { error } = await client.from('calendario_eventos').insert({
            user_id: user.id,
            titulo: tarea,
            tipo: 'bloque_estudio',
            modulo: RepasoState.moduloActual || EstudioState.modulo || null,
            up_id: RepasoState.upActual || null,
            fecha: fechaLocalISO(),
            hora_inicio: inicio,
            hora_fin: fin,
            estado: 'pendiente'
        });
        if (error) throw error;

        inicioInput.value = ''; finInput.value = ''; tareaInput.value = '';
        // Permiso para la notificación del navegador (se pide una sola vez, al planificar)
        try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (_) {}
        await refrescarBloques();
        renderListaEventosEnModal();
    } catch (err) {
        console.error('[Planificador] No se pudo guardar el bloque:', err);
        alert('No se pudo guardar el bloque. Revisá que la base tenga las columnas hora_inicio, hora_fin y estado.');
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function cambiarEstadoBloque(id, estado) {
    const client = getSupabaseClienteActivo();
    if (!client) return;
    const bloque = BloquesState.hoy.find(b => String(b.id) === String(id));
    try {
        const { error } = await client.from('calendario_eventos')
            .update({ estado, completado: estado === 'completado' })
            .eq('id', id);
        if (error) throw error;
        if (bloque) bloque.estado = estado;
        if (estado === 'en_curso' && bloque) iniciarPomodoroDeBloque(bloque);
        await refrescarBloques();
    } catch (err) {
        console.error('[Planificador] No se pudo cambiar el estado:', err);
        toastBloque('No se pudo actualizar el bloque.', 'warning');
    }
}

// "En curso" arranca el Pomodoro sobre la UP asignada al bloque.
function iniciarPomodoroDeBloque(b) {
    const eng = window.PomodoroEngine;
    if (!eng) return;
    if (!b.up_id) { toastBloque('Bloque en curso. (No tiene UP asignada, no se inició el Pomodoro.)'); return; }
    try {
        const st = eng.getState();
        if (st.status === 'running') { toastBloque('Ya tenés un Pomodoro en marcha.'); return; }
        const unit = (EstudioState.unitsById || {})[b.up_id];
        const ctx = { moduleId: b.modulo || EstudioState.modulo, upId: b.up_id, upLabel: (unit && unit.title) || b.up_id };
        eng.reset('work', ctx);
        eng.start(ctx);
        toastBloque(`▶ Pomodoro iniciado · ${ctx.upLabel}`);
    } catch (err) {
        console.warn('[Planificador] No se pudo iniciar el Pomodoro:', err);
    }
}

async function eliminarBloqueTimeboxing(id) {
    const client = getSupabaseClienteActivo();
    if (!client) return;
    try {
        const { error } = await client.from('calendario_eventos').delete().eq('id', id);
        if (error) throw error;
        await refrescarBloques();
        renderListaEventosEnModal();
    } catch (err) {
        console.error('[Planificador] No se pudo eliminar el bloque:', err);
    }
}

function etiquetaModuloUp(b) {
    const nombres = { cirugia: 'Cirugía', ginecologia: 'Ginecología', siam: 'S.I.A.M.' };
    const unit = (EstudioState.unitsById || {})[b.up_id];
    const up = unit ? `UP${unit.number}` : (b.up_id ? String(b.up_id).toUpperCase() : '');
    return [nombres[b.modulo] || b.modulo, up].filter(Boolean).join(' · ');
}

function htmlBloque(b) {
    const est = estadoEfectivoBloque(b);
    const etiquetas = { pendiente: 'Pendiente', en_curso: 'En curso', completado: 'Completado', expirado: 'Expirado · no completado', descartado: 'Descartado' };
    const btn = (txt, estado, extra = '') =>
        `<button type="button" class="nika-bloque-btn ${extra}" onclick="cambiarEstadoBloque('${b.id}','${estado}')">${txt}</button>`;
    const acciones = [];
    if (est === 'pendiente' || est === 'expirado') acciones.push(btn('▶ Iniciar', 'en_curso'));
    if (est !== 'completado' && est !== 'descartado') acciones.push(btn('✔ Hecho', 'completado'));
    if (est === 'expirado') acciones.push(btn('Descartar', 'descartado', 'is-muted'));
    if (est === 'completado' || est === 'descartado') acciones.push(btn('↺ Reabrir', 'pendiente', 'is-muted'));
    acciones.push(`<button type="button" class="nika-bloque-btn is-muted" onclick="eliminarBloqueTimeboxing('${b.id}')" title="Eliminar bloque">🗑️</button>`);
    const ctx = etiquetaModuloUp(b);
    return `
    <div class="nika-bloque is-${est}">
        <div class="nika-bloque-info">
            <span class="nika-bloque-hora">${horaCorta(b.hora_inicio)} – ${horaCorta(b.hora_fin)}</span>
            <span class="nika-bloque-tarea">${escaparHtmlBasico(b.titulo || '')}</span>
            ${ctx ? `<span class="nika-bloque-ctx">${escaparHtmlBasico(ctx)}</span>` : ''}
            <span class="nika-bloque-estado">${etiquetas[est]}</span>
        </div>
        <div class="nika-bloque-acciones">${acciones.join('')}</div>
    </div>`;
}

// Lista completa de hoy dentro del modal "Organizá tu Día".
async function renderBloquesTimeboxing() {
    const cont = document.getElementById('timeboxing-lista-bloques');
    const fechaLabel = document.getElementById('timeboxing-fecha-label');
    if (!cont) return;

    if (fechaLabel) {
        const hoyFormateado = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
        fechaLabel.textContent = `Organizá tu ${hoyFormateado}`;
    }
    if (BloquesState.fecha !== fechaLocalISO()) await cargarBloquesHoy();

    if (BloquesState.hoy.length === 0) {
        cont.innerHTML = `<span style="font-style:italic; font-size:0.78rem; color:#94a3b8;">Todavía no agregaste bloques para hoy.</span>`;
        return;
    }
    cont.innerHTML = BloquesState.hoy.map(htmlBloque).join('');
}

// Escape mínimo para no inyectar HTML con lo que el usuario tipeó como tarea.
function escaparHtmlBasico(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- Alertas: revisión cada 30 s mientras la pestaña esté abierta ----------
function _alertasVistas() {
    try { return new Set(JSON.parse(localStorage.getItem('nika_alertas_bloques_' + fechaLocalISO()) || '[]')); } catch (_) { return new Set(); }
}
function _marcarAlerta(clave) {
    const s = _alertasVistas(); s.add(clave);
    try { localStorage.setItem('nika_alertas_bloques_' + fechaLocalISO(), JSON.stringify([...s])); } catch (_) {}
}

function beepAlerta(doble) {
    try { window.dispatchEvent(new CustomEvent('nika:alerta-sonido')); } catch (_) {}
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const tono = (freq, t0, dur) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = freq;
            g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
            g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
            o.connect(g); g.connect(ctx.destination);
            o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.02);
        };
        tono(880, 0, 0.18);
        if (doble) tono(1175, 0.24, 0.24);
        setTimeout(() => { try { ctx.close(); } catch (_) {} }, 900);
    } catch (_) { /* audio bloqueado hasta la primera interacción */ }
}

async function revisarAlertasBloques() {
    if (BloquesState.fecha !== fechaLocalISO()) await cargarBloquesHoy();
    const ahora = ahoraEnMinutos();
    const vistas = _alertasVistas();

    BloquesState.hoy.forEach(b => {
        if (b.estado === 'completado' || b.estado === 'descartado') return;
        const ini = minutosDe(b.hora_inicio), fin = minutosDe(b.hora_fin);
        const tarea = b.titulo || 'bloque de estudio';

        // Aviso previo: faltan 5 min para empezar
        if (b.estado !== 'en_curso' && ini - ahora > 0 && ini - ahora <= 5 && !vistas.has(b.id + ':pre-ini')) {
            _marcarAlerta(b.id + ':pre-ini');
            toastBloque(`⏰ En ${ini - ahora} min empieza: ${tarea}`);
            beepAlerta(false);
        }
        // Inicio exacto: notificación del navegador + sonido
        if (ahora >= ini && ahora < Math.min(fin, ini + 3) && !vistas.has(b.id + ':ini')) {
            _marcarAlerta(b.id + ':ini');
            toastBloque(`▶ Es hora de tu bloque: ${tarea}`);
            beepAlerta(true);
            try {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Es hora de tu bloque de estudio', { body: `${horaCorta(b.hora_inicio)}–${horaCorta(b.hora_fin)} · ${tarea}`, tag: 'bloque-' + b.id });
                }
            } catch (_) {}
        }
        // Aviso previo: faltan 5 min para terminar (solo si ya arrancó)
        if (ahora >= ini && fin - ahora > 0 && fin - ahora <= 5 && !vistas.has(b.id + ':pre-fin')) {
            _marcarAlerta(b.id + ':pre-fin');
            toastBloque(`⌛ Quedan ${fin - ahora} min de: ${tarea}`);
            beepAlerta(false);
        }
    });
    // Repinta para que un bloque pase a "Expirado" sin recargar
    renderBloquesTimeboxing();
    cargarRepasos();
}

function iniciarMonitorAlertas() {
    if (window._nikaMonitorAlertas) return;
    window._nikaMonitorAlertas = setInterval(revisarAlertasBloques, 30000);
    setTimeout(revisarAlertasBloques, 2000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) revisarAlertasBloques(); });
}

// Cronograma de la sala: bloques de hoy (con controles de estado) + próximos eventos.
async function cargarRepasos() {
    const lista = document.getElementById('repaso-lista');
    if (!lista) return;

    const user = await getUsuarioActivo();
    const client = getSupabaseClienteActivo();
    if (!user || !client) {
        lista.innerHTML = `<span style="font-style:italic;">Iniciá sesión para ver tu cronograma.</span>`;
        return;
    }

    try {
        const hoy = fechaLocalISO();
        if (BloquesState.fecha !== hoy || !BloquesState.hoy.length) await cargarBloquesHoy();

        const { data, error } = await client
            .from('calendario_eventos')
            .select('id, titulo, tipo, fecha')
            .eq('user_id', user.id)
            .gte('fecha', hoy)
            .order('fecha', { ascending: true })
            .limit(12);
        if (error) throw error;
        // Los bloques de hoy ya se muestran arriba, con sus controles de estado
        const proximos = (data || []).filter(ev => !(ev.tipo === 'bloque_estudio' && ev.fecha === hoy)).slice(0, 5);

        const iconoTipo = { repaso: '📘', examen: '📝', bloque_estudio: '⏰', otro: '📌' };
        const partes = [];

        if (BloquesState.hoy.length) {
            partes.push(`<div class="nika-bloques-titulo">Hoy</div>` + BloquesState.hoy.map(htmlBloque).join(''));
        }
        if (proximos.length) {
            partes.push((BloquesState.hoy.length ? `<div class="nika-bloques-titulo">Próximos</div>` : '') + proximos.map(ev => {
                const dias = Math.round((new Date(ev.fecha + 'T00:00:00') - new Date(hoy + 'T00:00:00')) / 86400000);
                const cuando = dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`;
                return `<div class="nika-evento-item" onclick="editarEvento('${ev.id}')" title="Editar evento">
                        <span class="nika-evento-titulo">${iconoTipo[ev.tipo] || '📅'} ${escaparHtmlBasico(ev.titulo || '')}</span>
                        <strong class="nika-evento-cuando">${cuando}</strong>
                        <span class="nika-evento-acciones">
                            <button type="button" class="nika-evento-btn" title="Editar" onclick="event.stopPropagation(); editarEvento('${ev.id}')">✏️</button>
                            <button type="button" class="nika-evento-btn is-danger" title="Eliminar" onclick="event.stopPropagation(); eliminarEvento('${ev.id}')">🗑️</button>
                        </span>
                    </div>`;
            }).join(''));
        }
        lista.innerHTML = partes.length ? partes.join('') : `<span style="font-style:italic;">Sin repasos agendados todavía.</span>`;
    } catch (err) {
        console.warn('[Repaso] No se pudo cargar el cronograma:', err);
        lista.innerHTML = `<span style="font-style:italic;">No se pudo cargar el cronograma.</span>`;
    }
}

// ---- Modal de calendario mensual (minimalista, oscuro, bordes sutiles) ----

const CalendarioModalState = { mesVisible: new Date(), eventos: [], diaSel: null };

function inyectarModalCalendarioSiHaceFalta() {
    if (document.getElementById('modal-calendario-nika')) return;
    const html = `
    <div id="modal-calendario-nika" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center;"
         onclick="if (event.target === this) cerrarModalCalendario();">
        <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px; width:92%; max-width:380px; color:#e2e8f0;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <button type="button" onclick="cambiarMesCalendario(-1)" style="background:none; border:none; color:#cbd5e1; font-size:1.1rem; cursor:pointer;">‹</button>
                <span id="calendario-mes-label" style="font-weight:700; font-size:0.95rem;"></span>
                <button type="button" onclick="cambiarMesCalendario(1)" style="background:none; border:none; color:#cbd5e1; font-size:1.1rem; cursor:pointer;">›</button>
            </div>
            <div id="calendario-grid" style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; font-size:0.72rem; text-align:center;"></div>
            <div style="display:flex; gap:12px; margin-top:16px; font-size:0.68rem; color:#94a3b8; justify-content:center; flex-wrap:wrap;">
                <span>🔴 Examen</span><span>🔵 Repaso</span><span>🟠 Bloque</span><span>🟣 Otro</span>
            </div>
            <div id="calendario-dia-detalle" style="margin-top:14px; max-height:32vh; overflow-y:auto;"></div>
            <button type="button" onclick="cerrarModalCalendario()" style="margin-top:16px; width:100%; padding:9px; border:1px solid rgba(255,255,255,0.12); background:transparent; color:#e2e8f0; border-radius:8px; cursor:pointer; font-size:0.8rem;">Cerrar</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

async function abrirModalCalendario() {
    inyectarModalCalendarioSiHaceFalta();
    const overlay = document.getElementById('modal-calendario-nika');
    overlay.style.display = 'flex';
    await cargarEventosDelMes();
    renderCalendarioGrid();
}

function cerrarModalCalendario() {
    const overlay = document.getElementById('modal-calendario-nika');
    if (overlay) overlay.style.display = 'none';
}

async function cambiarMesCalendario(delta) {
    CalendarioModalState.mesVisible.setMonth(CalendarioModalState.mesVisible.getMonth() + delta);
    await cargarEventosDelMes();
    renderCalendarioGrid();
}

async function cargarEventosDelMes() {
    const client = getSupabaseClienteActivo();
    const user = await getUsuarioActivo();
    CalendarioModalState.eventos = [];
    if (!client || !user) return;

    const y = CalendarioModalState.mesVisible.getFullYear();
    const m = CalendarioModalState.mesVisible.getMonth();
    const desde = fechaLocalISO(new Date(y, m, 1));
    const hasta = fechaLocalISO(new Date(y, m + 1, 0));

    try {
        const { data, error } = await client
            .from('calendario_eventos')
            .select('id, titulo, tipo, fecha')
            .eq('user_id', user.id)
            .gte('fecha', desde)
            .lte('fecha', hasta);
        if (!error && data) CalendarioModalState.eventos = data;
    } catch (err) {
        console.warn('[Calendario] No se pudieron cargar los eventos del mes:', err);
    }
}

function renderCalendarioGrid() {
    const grid = document.getElementById('calendario-grid');
    const label = document.getElementById('calendario-mes-label');
    if (!grid || !label) return;

    const y = CalendarioModalState.mesVisible.getFullYear();
    const m = CalendarioModalState.mesVisible.getMonth();
    const nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    label.textContent = `${nombresMes[m]} ${y}`;

    const hoyStr = fechaLocalISO();
    const primerDiaSemana = new Date(y, m, 1).getDay(); // 0=domingo
    const diasEnMes = new Date(y, m + 1, 0).getDate();

    const eventosPorDia = {};
    CalendarioModalState.eventos.forEach(ev => {
        const dia = Number(ev.fecha.slice(8, 10));
        if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
        eventosPorDia[dia].push(ev.tipo);
    });
    // Si el mes cambió, la selección de otro mes ya no aplica
    if (CalendarioModalState.diaSel && CalendarioModalState.diaSel.slice(0, 7) !== `${y}-${String(m + 1).padStart(2, '0')}`) {
        CalendarioModalState.diaSel = null;
    }

    let html = ['D','L','M','M','J','V','S'].map(d => `<div style="color:#64748b; font-weight:700; padding-bottom:4px;">${d}</div>`).join('');
    for (let i = 0; i < primerDiaSemana; i++) html += `<div></div>`;

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const esHoy = fechaStr === hoyStr;
        const tipos = eventosPorDia[dia] || [];
        const dots = tipos.map(t => {
            const color = t === 'examen' ? '#ef4444' : t === 'repaso' ? '#22d3ee' : t === 'bloque_estudio' ? '#f59e0b' : '#a855f7';
            return `<span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:${color}; margin:0 1px;"></span>`;
        }).join('');

        const sel = CalendarioModalState.diaSel === fechaStr;
        const conEventos = tipos.length > 0;
        html += `
            <div ${conEventos ? `onclick="seleccionarDiaCalendario('${fechaStr}')" title="Ver eventos del día"` : ''}
                 style="padding:6px 0; border-radius:8px; ${conEventos ? 'cursor:pointer;' : ''} ${sel ? 'background:rgba(37,99,235,0.28);' : ''} ${esHoy ? 'border:1px solid #a855f7;' : ''}">
                <div>${dia}</div>
                <div style="height:6px;">${dots}</div>
            </div>`;
    }

    grid.innerHTML = html;
    renderDiaSeleccionado();
}

function seleccionarDiaCalendario(fechaStr) {
    CalendarioModalState.diaSel = CalendarioModalState.diaSel === fechaStr ? null : fechaStr;
    renderCalendarioGrid();
}

// Listado de eventos del día tocado, con Editar / Eliminar.
function renderDiaSeleccionado() {
    const cont = document.getElementById('calendario-dia-detalle');
    if (!cont) return;
    const dia = CalendarioModalState.diaSel;
    if (!dia) { cont.innerHTML = ''; return; }
    const evs = CalendarioModalState.eventos.filter(e => e.fecha === dia);
    if (!evs.length) { cont.innerHTML = ''; return; }
    const iconoTipo = { repaso: '📘', examen: '📝', bloque_estudio: '⏰', otro: '📌' };
    const fechaLegible = new Date(dia + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    cont.innerHTML = `<div style="font-size:0.72rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:8px;">${fechaLegible}</div>` +
        evs.map(ev => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 10px; margin-bottom:6px; background:rgba(255,255,255,0.05); border-radius:8px;">
            <span style="font-size:0.78rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;" onclick="editarEvento('${ev.id}')">${iconoTipo[ev.tipo] || '📅'} ${escaparHtmlBasico(ev.titulo || '')}</span>
            <span style="flex-shrink:0; display:flex; gap:4px;">
                <button type="button" onclick="editarEvento('${ev.id}')" title="Editar" style="border:none; background:rgba(148,163,184,0.18); width:26px; height:26px; border-radius:7px; cursor:pointer;">✏️</button>
                <button type="button" onclick="eliminarEvento('${ev.id}')" title="Eliminar" style="border:none; background:rgba(239,68,68,0.15); width:26px; height:26px; border-radius:7px; cursor:pointer;">🗑️</button>
            </span>
        </div>`).join('');
}

// ================= TABS DE LA VISTA DETALLE =================

function showUpTab(tabName, btn) {
    closeInlineViewer(); // Ocultar visor al cambiar de solapa
    document.querySelectorAll('.up-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.up-tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');

    // Recalcular el paywall cada vez que se abre el Asistente: por si el
    // usuario se suscribió a NikaMed+ en el medio de la sesión.
    if (tabName === 'notebooklm' && typeof aplicarPaywallChat === 'function') {
        aplicarPaywallChat();
    }
}