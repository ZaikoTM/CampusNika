// js/guardiaModal.js
// ============================================================================
// CAMPUS NIKA — Modo Sin conexión · paquetes por materia
// ----------------------------------------------------------------------------
// Qué se puede llevar sin señal, organizado por año y materia:
//   • Salas de estudio (datos de cada materia: objetivos, contenidos, bibliografía, casos y procedimientos)
//   • Bancos de preguntas Choice y bancos del Simulador Escrito de Cirugía, Ginecología y SIAM
//   • PFO (6.° año): sala de estudio, casos clínicos y procedimientos
//   • Atlas de acreditaciones (pasos y listas de cotejo)
//   • NikaFarma (vademécum) y Recetarios
// Todo queda en una caché PERSISTENTE (no se borra al actualizar la app) y el progreso que se genere
// sin señal se sube solo cuando vuelve la conexión (js/syncManager.js).
//
// Uso:  GuardiaModal.abrir();     o cualquier elemento con  data-guardia-open
// Requiere: js/offlineStorage.js, supabaseClient.js (window.NikaSupabase)
// ============================================================================

const GuardiaModal = (() => {
  const K_META = 'nika_guardia_meta';
  const URL_FARMA = 'data/nikafarma_api.json';
  const EST_FARMA = 4.0 * 1024 * 1024;
  const DIAS_VIGENCIA = 14;                       // pasado este tiempo se sugiere actualizar

  const ACR = ["data/acreditaciones/pfo/index.json", "data/acreditaciones/siam/artro.json", "data/acreditaciones/siam/artro_modelo.json", "data/acreditaciones/siam/iet.json", "data/acreditaciones/siam/iet_modelo.json", "data/acreditaciones/siam/index.json", "data/acreditaciones/siam/instrumental_artro.json", "data/acreditaciones/siam/instrumental_iet.json", "data/acreditaciones/siam/instrumental_rcp.json", "data/acreditaciones/siam/instrumental_sv.json", "data/acreditaciones/siam/instrumental_tr.json", "data/acreditaciones/siam/rcp.json", "data/acreditaciones/siam/rcp_modelo.json", "data/acreditaciones/siam/sv.json", "data/acreditaciones/siam/sv_modelo.json", "data/acreditaciones/siam/tr.json", "data/acreditaciones/siam/tr_modelo.json", "data/acreditaciones/sim/anamg.json", "data/acreditaciones/sim/anamg_modelo.json", "data/acreditaciones/sim/anamo.json", "data/acreditaciones/sim/anamo_modelo.json", "data/acreditaciones/sim/egfpp.json", "data/acreditaciones/sim/egfpp_modelo.json", "data/acreditaciones/sim/exgin.json", "data/acreditaciones/sim/exgin_modelo.json", "data/acreditaciones/sim/exmam.json", "data/acreditaciones/sim/exmam_modelo.json", "data/acreditaciones/sim/exobs.json", "data/acreditaciones/sim/exobs_modelo.json", "data/acreditaciones/sim/index.json", "data/acreditaciones/sim/instrumental_anamg.json", "data/acreditaciones/sim/instrumental_anamo.json", "data/acreditaciones/sim/instrumental_egfpp.json", "data/acreditaciones/sim/instrumental_exgin.json", "data/acreditaciones/sim/instrumental_exmam.json", "data/acreditaciones/sim/instrumental_exobs.json", "data/acreditaciones/cir/index.json", "data/acreditaciones/cir/instrumental_lav.json", "data/acreditaciones/cir/lav.json", "data/acreditaciones/cir/lav_modelo.json"];
  const upsGin = ['UP1', 'UP2', 'UP3_sec_1', 'UP3_sec_2', 'UP3_sec_3', 'UP3_sec_4', 'UP3_sec_5', 'UP4'];
  const upsSiam = ['UP1', 'UP2', 'UP3', 'UP4', 'UP5', 'UP6', 'UP7', 'UP8', 'UP9'];
  const upsCir = Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(2, '0'));
  const banco = (mat, ids) => ids.map((u) => `data/${u}_${mat}.json`);
  const KB = 1024, MB = 1024 * 1024;

  const BASE_URLS = ['campus.html', 'estudio.html', 'sala_estudio.html', 'examen.html', 'nikasim.html', 'acreditaciones.html', 'pfo_estudio.html',
    'recetarios.html', 'nikafarma.html', 'cirugia_hub.html', 'siam_hub.html', 'gineco_hub.html', 'offline.html', 'styles.css', 'supabaseClient.js',
    'js/rendimiento.js', 'js/examen.js', 'js/offlineStorage.js', 'js/syncManager.js', 'js/guardiaModal.js', 'js/estudio/estudio.js', 'js/estudio/pdfLector.js', 'js/estudio/pdfOffline.js', 'js/estudio/pdfSync.js', 'js/estudio/pdfConvertir.js', 'js/estudio/pdfExtras.js', 'js/estudio/pdfExportar.js', 'assets/n-nika.svg', 'assets/nika-texto.svg', 'js/estudio/pdfAnotaciones.js', 'js/nikaNotificaciones.js',
    'js/pfoEstudio.js', 'css/pfo-estudio.css', 'css/pfo.css', 'js/acreditaciones/motor.js', 'js/recetarios.js', 'js/recetariosData.js', 'css/recetarios.css',
    'data/modulos.json'];

  // grupo -> paquetes. `bancos` se guardan en IndexedDB desde Supabase; `urls` en la caché persistente; `farma` en IndexedDB.
  const GRUPOS = [
    { id: 'cir', icono: '🔪', titulo: 'Cirugía', sub: '5.° año', paquetes: [
      { id: 'cir-estudio', icono: '📚', titulo: 'Sala de Estudio de Cirugía', desc: 'Las 11 Unidades Problema: objetivos, contenidos, bibliografía y materiales.', urls: ['data/cirugia.json', 'js/estudio/cirugiaData.js'], est: 60 * KB },
      { id: 'cir-choice', icono: '🩺', titulo: 'Simulador Choice (UP 1 a 11)', desc: 'Banco de preguntas de opción múltiple de las 11 UP, con respaldo local de las UP 6 a 11.', bancos: { modulo: 'cirugia', ups: upsCir }, urls: ['data/banco_up06.json', 'data/banco_up07.json', 'data/banco_up08.json', 'data/banco_up09.json', 'data/banco_up10.json', 'data/banco_up11.json', 'preguntas.json', 'db_cirugia_organizado.json'], est: 2.2 * MB },
      { id: 'cir-local', icono: '🦴', titulo: 'Traumatología y suturas', desc: 'Bancos locales de trauma de miembro superior e inferior y de suturas.', urls: ['data/banco_trauma_superior.js', 'data/banco_trauma_inferior.js', 'data/banco_suturas.js'], est: 230 * KB },
    ] },
    { id: 'gin', icono: '🤰', titulo: 'Ginecología y Obstetricia', sub: '5.° año', paquetes: [
      { id: 'gin-estudio', icono: '📚', titulo: 'Sala de Estudio de Ginecología', desc: 'Unidades y secciones con objetivos, contenidos y materiales.', urls: ['data/gineco_data.json'], est: 56 * KB },
      { id: 'gin-choice', icono: '🩺', titulo: 'Simulador Choice de Ginecología', desc: 'Banco de preguntas de UP1 a UP4 con las cinco secciones de la UP3.', urls: banco('ginecologia', upsGin), est: 1.4 * MB },
    ] },
    { id: 'siam', icono: '🫀', titulo: 'S.I.A.M.', sub: '5.° año', paquetes: [
      { id: 'siam-estudio', icono: '📚', titulo: 'Sala de Estudio de SIAM', desc: 'Las 9 Unidades Problema con objetivos, contenidos y materiales.', urls: ['data/siam_data.json'], est: 67 * KB },
      { id: 'siam-choice', icono: '🩺', titulo: 'Simulador Choice de SIAM', desc: 'Banco de preguntas de las UP 1 a 9.', urls: banco('siam', upsSiam), est: 1.6 * MB },
    ] },
    { id: 'pfo', icono: '🎓', titulo: 'PFO · Práctica Final Obligatoria', sub: '6.° año', paquetes: [
      { id: 'pfo-estudio', icono: '📚', titulo: 'Sala de Estudio PFO', desc: 'Los 8 módulos, el recorrido de Generalidades, tutoriales de procedimientos y casos clínicos con su respuesta modelo.', urls: ['data/pfo_data.json', 'data/pfo/estudio.json', 'data/pfo/casos_estudio.json', 'data/pfo/procedimientos.json', 'data/pfo/procedimientos_guias.json'], est: 360 * KB },
    ] },
    { id: 'atlas', icono: '🥽', titulo: 'NikaSim · Atlas de procedimientos', sub: 'todas las materias', paquetes: [
      { id: 'atlas-pasos', icono: '📋', titulo: 'Pasos y listas de cotejo', desc: 'Todos los procedimientos con sus pasos, fundamentos y criterios. Los modelos 3D necesitan conexión.', urls: ACR, est: 830 * KB },
    ] },
    { id: 'consulta', icono: '📖', titulo: 'Consulta rápida', sub: 'tu material siempre a mano', paquetes: [
      { id: 'calculadoras', icono: '🧮', titulo: 'Calculadoras y escalas clínicas', desc: 'Más de 75 calculadoras (Ranson, Wells, CHA₂DS₂-VASc, NEWS2, MELD, FPP…) con su fundamento. Funcionan sin conexión.', urls: ['calculadoras.html'], lista: 'calculadoras', est: 260 * KB },
      { id: 'temas-gin', icono: '🤰', titulo: 'Temas clínicos · Ginecología y Obstetricia', desc: 'Las 51 fichas con diagnóstico, tratamiento y banderas rojas, en formato de lectura.', urls: ['temas-clinicos.html'], lista: 'temas-gin', est: 6.3 * MB },
      { id: 'temas-cir', icono: '🔪', titulo: 'Temas clínicos · Cirugía', desc: 'Las 90 fichas de las 11 unidades problema, en formato de lectura.', urls: ['temas-clinicos.html'], lista: 'temas-cir', est: 7.7 * MB },
      { id: 'temas-cri', icono: '📊', titulo: 'Temas clínicos · Criterios y escalas', desc: 'Criterios, clasificaciones y escalas (Ranson, Wells, Tokio, Child-Pugh, NEWS2…) en formato de lectura.', urls: ['temas-clinicos.html'], lista: 'temas-cri', est: 5.0 * MB },
      { id: 'temas-far', icono: '💊', titulo: 'Temas clínicos · Fármacos', desc: 'Fichas de fármacos de Ginecología y Obstetricia: indicaciones, dosis, contraindicaciones, efectos adversos y vida media.', urls: ['temas-clinicos.html'], lista: 'temas-far', est: 1.5 * MB },
      { id: 'guias', icono: '🧭', titulo: 'Guías de estudio', desc: 'Cómo estudiar, ECOE, abdomen agudo, trauma, urgencias obstétricas y más.', urls: ['guias.html'], lista: 'guias', est: 780 * KB },
      { id: 'notas', icono: '📓', titulo: 'Mis notas y apuntes', desc: 'Leé y editá tus notas sin señal: los cambios se guardan en el dispositivo y se suben solos al volver la conexión.', urls: ['mis_notas.html'], lista: 'notas', est: 850 * KB },
      { id: 'plan', icono: '🗓️', titulo: 'Plan de estudio y planificador', desc: 'Mirá y marcá tu plan sin conexión; se sincroniza al volver la señal (queda el cambio más reciente).', urls: ['plan_examen.html'], lista: 'plan', est: 800 * KB },
      { id: 'glosario', icono: '🔤', titulo: 'Glosario médico', desc: 'Términos clínicos para consultar sin señal.', urls: ['glosario.html'], lista: 'glosario', est: 190 * KB },
    ] },
    { id: 'herr', icono: '🧰', titulo: 'Herramientas', sub: 'para la guardia', paquetes: [
      { id: 'farma', icono: '💊', titulo: 'Vademécum NikaFarma', desc: 'Fármacos, síndromes, patógenos y calculadoras.', farma: true, est: EST_FARMA },
      { id: 'flashcards', icono: '🃏', titulo: 'Flashcards de NikaFarma', desc: 'Tarjetas clínicas de tratamientos y temas: explorar, practicar y rendir el simulador de flashcards sin señal.', urls: ['flashcards.html', 'data/nikafarma_patologias.json', 'data/flashcards_cirugia.json', 'data/flashcards_criterios.json', 'data/flashcards_farmacos.json', 'js/nikaFlashcards.js', 'css/flashcards.css', 'assets/fonts/caveat-latin.woff2', 'assets/fonts/caveat-latin-ext.woff2', 'assets/fonts/plusjakarta-latin.woff2', 'assets/fonts/plusjakarta-latin-ext.woff2', 'assets/N%20NIKA.png', 'assets/TEXTO%20VECTOR%20NIKA.png', 'js/nikafarmaPatologias.js', 'nikafarma.html',
        'css/pagina-lateral.css', 'css/nika-unificado.css', 'css/nikasim.css', 'css/campus-premium.css', 'css/campus-premium-espacio.css', 'css/tema-premium-salas.css', 'css/micro.css',
        'js/paginaLateral.js', 'js/auth-guard.js', 'js/nikaAcceso.js', 'js/rachas.js', 'js/atajos.js', 'js/campusTema.js', 'js/campusEspacio.js', 'js/micro.js', 'assets/N%20NIKA.png', 'assets/icons/favicon-32.png', 'favicon.ico', 'manifest.json'], est: 700 * KB },
      { id: 'recetarios', icono: '📝', titulo: 'Recetarios y certificados', desc: 'Para practicar la parte documental sin señal.', urls: ['recetarios.html', 'js/recetarios.js', 'js/recetariosData.js', 'js/recetariosShare.js', 'js/recetariosExamen.js', 'css/recetarios.css'], est: 150 * KB },
    ] },
  ];
  // Unidades elegibles de cada banco Choice (para no bajar el área completa)
  const UNI = {
    'cir-choice': upsCir.map((u, i) => ({ id: u, label: 'UP ' + (i + 1) })),
    'gin-choice': upsGin.map((u) => ({ id: u, label: u.replace('_sec_', ' · Sección ').replace('UP', 'UP ').replace('  ', ' ') })),
    'siam-choice': upsSiam.map((u) => ({ id: u, label: u.replace('UP', 'UP ') })),
  };
  // Devuelve una copia del paquete con SOLO las unidades elegidas
  function _subpack(p, ids) {
    const q = Object.assign({}, p);
    if (p.id === 'cir-choice') {
      q.bancos = { modulo: 'cirugia', ups: ids };
      const locales = ids.filter((u) => Number(u) >= 6).map((u) => `data/banco_up${u}.json`);
      q.urls = locales.concat(['preguntas.json', 'db_cirugia_organizado.json']);
    } else {
      const mat = p.id === 'gin-choice' ? 'ginecologia' : 'siam';
      q.urls = ids.map((u) => `data/${u}_${mat}.json`);
    }
    q.est = Math.max(60 * KB, Math.round(p.est * ids.length / UNI[p.id].length));
    return q;
  }
  const TODOS = GRUPOS.flatMap((g) => g.paquetes.map((p) => Object.assign({ grupo: g.id }, p)));

  let _montado = false, _ocupado = false, _estado = {};

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (window.OfflineStorage ? OfflineStorage.formatearBytes(n) : `${Math.round(n / KB)} KB`);
  const meta = () => { try { return JSON.parse(localStorage.getItem(K_META) || '{}') || {}; } catch (_) { return {}; } };
  const guardarMeta = (m) => { try { localStorage.setItem(K_META, JSON.stringify(m)); } catch (_) {} };
  const hayRed = () => navigator.onLine && !(window.SyncManager && SyncManager.estaOffline && SyncManager.estaOffline());
  const dias = (ts) => Math.floor((Date.now() - ts) / 86400000);

  // ------------------------------------------------------------
  // Versiones: cada archivo descargable tiene una huella en data/guardia_manifest.json. Se guarda la huella de lo que
  // quedó en el dispositivo y, al abrir, se compara: solo se bajan los archivos nuevos o modificados y se quitan los eliminados.
  // ------------------------------------------------------------
  let _man = null;
  async function _manifiesto() {
    if (!hayRed()) return _man;
    try { const r = await fetch('data/guardia_manifest.json', { cache: 'no-cache' }); if (r.ok) _man = await r.json(); } catch (_) {}
    return _man;
  }
  const _huellas = (urls, fallidas) => { const o = {}; (urls || []).forEach((u) => { if (_man && _man.f[u] && !(fallidas || []).includes(u)) o[u] = _man.f[u]; }); return o; };
  function _calcDiff(guard, todas, soloGuardadas) {
    if (!_man || !todas.length) return null;
    const base = soloGuardadas && guard ? Object.keys(guard) : todas;
    if (!guard) return { cambios: base.filter((u) => _man.f[u]), quitados: [], legacy: true };
    return { cambios: base.filter((u) => _man.f[u] && guard[u] !== _man.f[u]), quitados: Object.keys(guard).filter((u) => !todas.includes(u) || !_man.f[u]), legacy: false };
  }
  async function _diff(p) {
    const m = meta()[p.id]; if (!m || p.farma || p.bancos && !(p.urls && p.urls.length) && !p.lista) return null;
    let q = p; try { q = await _conLista(p); } catch (_) { return null; }
    return _calcDiff(m.files, q.urls || [], !!UNI[p.id]);
  }
  const _diffBase = () => { const m = meta(); return Object.keys(m).some((k) => k !== '_base') ? _calcDiff((m._base || {}).files, BASE_URLS, false) : null; };
  const _cuantos = (d) => (d ? d.cambios.length + d.quitados.length : 0);

  // ------------------------------------------------------------
  // CSS + HTML
  // ------------------------------------------------------------
  function _css() {
    if (document.getElementById('guardia-modal-css')) return;
    const st = document.createElement('style');
    st.id = 'guardia-modal-css';
    st.textContent = `
      #guardia-overlay{position:fixed;inset:0;z-index:9500;background:rgba(2,6,23,.7);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:14px}
      #guardia-overlay.on{display:flex}
      #guardia-box{width:min(780px,100%);max-height:94vh;overflow:auto;background:var(--card-bg,#fff);color:var(--text-main,#1e293b);border:1px solid var(--border,#e2e8f0);
        border-radius:22px;box-shadow:0 36px 80px -24px rgba(0,0,0,.6);font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:gmIn .35s cubic-bezier(.2,.9,.3,1.1) both;scroll-behavior:smooth}
      @keyframes gmIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
      .gm-hero{position:relative;overflow:hidden;padding:22px 24px 18px;color:#fff;background:linear-gradient(135deg,#0f766e,#0284c7 55%,#4338ca);border-radius:22px 22px 0 0}
      .gm-hero::after{content:"";position:absolute;right:-50px;top:-50px;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.12)}
      .gm-hero h3{margin:0;font-size:1.3rem;font-weight:800;display:flex;align-items:center;gap:10px;position:relative;z-index:1}
      .gm-hero h3 .sh{font-size:1.7rem;animation:gmFlota 3s ease-in-out infinite;display:inline-block}
      @keyframes gmFlota{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      .gm-hero p{margin:6px 0 0;font-size:.85rem;opacity:.92;max-width:560px;line-height:1.5;position:relative;z-index:1}
      .gm-x{position:absolute;right:14px;top:14px;z-index:2;border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:1rem;transition:transform .25s,background .2s}
      .gm-x:hover{transform:rotate(90deg);background:rgba(255,255,255,.35)}
      .gm-body{padding:16px 22px 22px}
      .gm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      @media(max-width:620px){.gm-stats{grid-template-columns:1fr}}
      .gm-stat{padding:11px 13px;border:1px solid var(--border,#e2e8f0);border-radius:14px;background:var(--bg-body,#f8fafc);font-size:.78rem;line-height:1.4}
      .gm-stat b{display:block;font-size:.95rem;margin-top:2px}
      .gm-stat .ok{color:#16a34a}.gm-stat .no{color:#d97706}
      .gm-bar{height:7px;border-radius:8px;background:var(--border,#e2e8f0);overflow:hidden;margin-top:7px}
      .gm-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#0ea5e9,#6366f1);transition:width .3s}
      .gm-warn{margin-top:12px;padding:10px 13px;border-radius:12px;background:rgba(234,179,8,.15);border:1px solid rgba(234,179,8,.45);color:#a16207;font-size:.8rem;font-weight:600}
      body.dark-mode .gm-warn{color:#facc15}
      .gm-cta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}
      .gm-btn{border:1px solid var(--border,#e2e8f0);background:var(--card-bg,#fff);color:inherit;font-weight:800;font-size:.84rem;font-family:inherit;padding:11px 16px;border-radius:12px;cursor:pointer;min-height:44px;transition:transform .15s,box-shadow .2s,background .2s}
      .gm-btn:hover{transform:translateY(-1px)} .gm-btn[disabled]{opacity:.5;cursor:not-allowed;transform:none}
      .gm-btn.pri{background:linear-gradient(135deg,#0ea5e9,#4f46e5);border-color:transparent;color:#fff;box-shadow:0 10px 24px -10px rgba(79,70,229,.8)}
      .gm-btn.peligro{color:#dc2626}
      .gm-est{font-size:.78rem;color:var(--text-muted,#64748b)}
      .gm-msg{font-size:.8rem;color:var(--text-muted,#64748b);margin-top:10px;min-height:1.2em}
      .gm-grupo{margin-top:20px}
      .gm-prox{opacity:.8;border-style:dashed}
      .gm-ups{margin-top:8px;border:1px dashed var(--border,#cbd5e1);border-radius:12px;padding:8px 10px;background:var(--bg-body,#f8fafc)}
      .gm-ups>summary{cursor:pointer;font-weight:800;font-size:.78rem;color:var(--nika-primary,#0284c7);list-style:none}
      .gm-ups>summary::-webkit-details-marker{display:none}
      .gm-ups-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:8px}
      .gm-ups-g label{display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;padding:6px 8px;border:1px solid var(--border,#e2e8f0);border-radius:9px;background:var(--card-bg,#fff);cursor:pointer}
      .gm-ups-f{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}
      .gm-destacado{animation:gmDest 2.4s ease-out}
      @keyframes gmDest{0%,60%{box-shadow:0 0 0 3px rgba(14,165,233,.55);border-radius:16px;background:rgba(14,165,233,.08)}100%{box-shadow:0 0 0 0 rgba(14,165,233,0)}}
      .gm-gh{display:flex;align-items:center;gap:10px;margin-bottom:8px}
      .gm-gh .ic{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:linear-gradient(135deg,rgba(14,165,233,.18),rgba(99,102,241,.18))}
      .gm-gh h4{margin:0;font-size:.98rem;font-weight:800;flex:1} .gm-gh h4 small{font-weight:600;color:var(--text-muted,#64748b);font-size:.72rem;margin-left:6px}
      .gm-link{border:0;background:none;color:var(--nika-primary,#0284c7);font-weight:800;font-size:.76rem;font-family:inherit;cursor:pointer}
      .gm-list{display:flex;flex-direction:column;gap:8px}
      .gm-pack{display:flex;gap:12px;align-items:center;padding:12px 13px;border:1px solid var(--border,#e2e8f0);border-radius:14px;transition:border-color .2s,box-shadow .2s,transform .2s;background:var(--card-bg,#fff)}
      .gm-pack:hover{border-color:var(--nika-primary,#0284c7);box-shadow:0 10px 24px -16px rgba(2,132,199,.7);transform:translateY(-1px)}
      .gm-pack .ic{font-size:1.3rem;width:38px;text-align:center;flex:none}
      .gm-pack .t{flex:1;min-width:0}.gm-pack .t b{display:block;font-size:.86rem}.gm-pack .t small{display:block;color:var(--text-muted,#64748b);font-size:.74rem;line-height:1.4;margin-top:2px}
      .gm-chip{display:inline-block;font-size:.68rem;font-weight:800;padding:3px 9px;border-radius:999px;margin-top:6px}
      .gm-chip.ok{background:rgba(22,163,74,.13);color:#15803d}.gm-chip.viejo{background:rgba(234,179,8,.18);color:#a16207}.gm-chip.no{background:rgba(100,116,139,.14);color:var(--text-muted,#64748b)}.gm-chip.err{background:rgba(220,38,38,.12);color:#b91c1c}
      .gm-act{display:flex;gap:6px;flex:none}
      .gm-mini{border:1px solid var(--border,#e2e8f0);background:var(--bg-body,#f8fafc);color:inherit;border-radius:10px;font-family:inherit;font-weight:800;font-size:.76rem;padding:8px 12px;cursor:pointer;min-height:38px;transition:transform .15s,background .2s}
      .gm-mini:hover{transform:translateY(-1px)} .gm-mini.dl{background:var(--nika-primary,#0284c7);border-color:transparent;color:#fff} .gm-mini[disabled]{opacity:.5;cursor:not-allowed}
      .gm-pack.trabajando .gm-mini{pointer-events:none;opacity:.6}
      .gm-pbar{height:5px;border-radius:5px;background:var(--border,#e2e8f0);overflow:hidden;margin-top:8px}.gm-pbar i{display:block;height:100%;width:0;background:#0ea5e9;transition:width .25s}
      .gm-info{margin-top:20px;border:1px dashed var(--border,#e2e8f0);border-radius:14px;padding:12px 14px;font-size:.8rem;line-height:1.55}
      .gm-info summary{cursor:pointer;font-weight:800}.gm-info ul{margin:8px 0 0;padding-left:18px}
      @media(max-width:560px){.gm-pack{flex-wrap:wrap}.gm-act{width:100%;justify-content:flex-end}}
      @media (prefers-reduced-motion:reduce){#guardia-box,.gm-hero h3 .sh{animation:none}}
    `;
    document.head.appendChild(st);
  }

  function _html() {
    const ov = document.createElement('div');
    ov.id = 'guardia-overlay';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Modo Sin conexión');
    ov.innerHTML = `
      <div id="guardia-box">
        <header class="gm-hero">
          <button class="gm-x" data-gm="cerrar" aria-label="Cerrar">✕</button>
          <h3><span class="sh">🛡️</span> Modo Sin conexión</h3>
          <p>Llevate tus materias para estudiar y rendir sin señal. Lo que hagas sin conexión se guarda y se sube solo cuando vuelva internet.</p>
        </header>
        <div class="gm-body">
          <div class="gm-stats">
            <div class="gm-stat" id="gm-s-red">Conexión<b>…</b></div>
            <div class="gm-stat" id="gm-s-esp">Espacio<b>…</b><div class="gm-bar"><i id="gm-esp-bar"></i></div></div>
            <div class="gm-stat" id="gm-s-cola">Pendiente de subir<b>…</b></div>
          </div>
          <div id="gm-warn"></div>
          <div class="gm-cta">
            <button class="gm-btn pri" data-gm="todo" id="gm-todo">⬇️ Descargar todo</button>
            <button class="gm-btn" data-gm="actualizar-todo" id="gm-upd" style="display:none">🔄 Actualizar cambios</button>
            <span class="gm-est" id="gm-est"></span>
            <span style="flex:1"></span>
            <button class="gm-btn peligro" data-gm="borrar-todo">🗑️ Borrar descargas</button>
          </div>
          <div class="gm-bar" id="gm-bar-wrap" style="display:none"><i id="gm-bar"></i></div>
          <div class="gm-msg" id="gm-msg"></div>
          <div id="gm-grupos"></div>
          <div id="gm-pdfs"></div>
          <details class="gm-info">
            <summary>¿Qué funciona sin conexión y qué no?</summary>
            <ul>
              <li><b>Sin conexión:</b> salas de estudio (datos de cada materia), simuladores Choice (preguntas, con modo práctica), casos y procedimientos de la PFO, pasos del Atlas, NikaFarma y Recetarios.</li>
              <li><b>PDFs:</b> los que descargues en «PDFs de las materias» se leen sin conexión en el Lector Nika, con tus subrayados y notas.</li>
              <li><b>Necesita conexión:</b> el Simulador Escrito y la corrección con IA, Pase de Sala, Shock Room, Consultorios y Legales, el ECOE FINAL, el chat de práctica, Ateneos, Foro, Duelos, los PDF que no descargaste, las presentaciones de Google Drive, los videos de YouTube y los modelos 3D.</li>
              <li>Tus resultados y notas hechos sin señal se guardan en el dispositivo y se suben solos al volver la conexión.</li>
            </ul>
          </details>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => {
      if (e.target === ov && !_ocupado) return cerrar();
      const b = e.target.closest('[data-gm]');
      if (!b) return;
      const a = b.dataset.gm, id = b.dataset.id;
      if (a === 'cerrar' && !_ocupado) cerrar();
      else if (a === 'todo') descargarTodo();
      else if (a === 'actualizar-todo') actualizarTodo();
      else if (a === 'delta') actualizarCambios(id);
      else if (a === 'borrar-todo') borrarTodo();
      else if (a === 'pack') descargarPack(id);
      else if (a === 'quitar') quitarPack(id);
      else if (a === 'grupo') descargarGrupo(id);
      else if (a === 'sel') descargarSeleccion(id);
      else if (a === 'ups-todas' || a === 'ups-ninguna') { const f = document.getElementById('gm-p-' + id); if (f) f.querySelectorAll('input[data-up]').forEach((i) => { i.checked = a === 'ups-todas'; }); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on') && !_ocupado) cerrar(); });
  }

  // ------------------------------------------------------------
  // Service Worker
  // ------------------------------------------------------------
  async function _sw() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, rej) => setTimeout(() => rej(new Error('sin SW')), 4000))]);
      return reg.active || null;
    } catch (_) { return null; }
  }
  async function _mensajeSW(msg, alProgreso, tope = 120000) {
    const sw = await _sw();
    if (!sw) return { ok: false, fallidas: msg.urls || [], bytes: 0, presentes: [] };
    return new Promise((resolve) => {
      const canal = new MessageChannel();
      const t = setTimeout(() => resolve({ ok: false, fallidas: msg.urls || [], bytes: 0, presentes: [] }), tope);
      canal.port1.onmessage = (ev) => {
        const m = ev.data || {};
        if (m.type === 'progress' && alProgreso) alProgreso(m.hechas, m.total, m.bytes);
        if (m.type === 'done') { clearTimeout(t); resolve({ ok: m.ok !== false, fallidas: m.fallidas || [], bytes: m.bytes || 0, presentes: m.presentes || [], borradas: m.borradas || 0 }); }
      };
      sw.postMessage(msg, [canal.port2]);
    });
  }

  // ------------------------------------------------------------
  // Estado de cada paquete
  // ------------------------------------------------------------
  async function _estados() {
    const m = meta();
    const out = {};
    await _manifiesto();
    let enSW = [];
    try {
      const muestras = TODOS.filter((p) => !p.proximamente && p.urls && p.urls.length).flatMap((p) => (UNI[p.id] ? p.urls : [p.urls[0]]));
      const r = await _mensajeSW({ type: 'HAS_URLS', urls: muestras }, null, 8000);
      enSW = r.presentes || [];
    } catch (_) {}
    let locales = {};
    try {
      for (const mod of ['cirugia']) {
        const lista = await OfflineStorage.listarUPsLocales(mod);
        locales[mod] = lista.length;
      }
    } catch (_) {}
    let farma = null; try { farma = await OfflineStorage.infoNikaFarmaLocal(); } catch (_) {}
    TODOS.filter((p) => !p.proximamente).forEach((p) => {
      let ok = false, parcial = false;
      if (p.farma) ok = !!farma;
      else {
        const urlsOk = !p.urls || !p.urls.length || (UNI[p.id] ? p.urls.some((u) => enSW.includes(u)) : enSW.includes(p.urls[0]));
        const bancosOk = !p.bancos || (locales[p.bancos.modulo] || 0) >= Math.min(p.bancos.ups.length, 11);
        ok = urlsOk && bancosOk && !!m[p.id] && !(UNI[p.id] && m[p.id].ups && m[p.id].ups.length < UNI[p.id].length);
        parcial = !ok && ((p.urls && enSW.includes(p.urls[0])) || (p.bancos && (locales[p.bancos.modulo] || 0) > 0) || !!(UNI[p.id] && m[p.id] && m[p.id].ups));
      }
      out[p.id] = { ok, parcial, ts: (m[p.id] && m[p.id].ts) || (farma && farma.updatedAt) || 0, bytes: (m[p.id] && m[p.id].bytes) || (farma && farma.bytes) || 0 };
    });
    for (const p of TODOS.filter((x) => !x.proximamente && out[x.id] && out[x.id].ok)) { try { out[p.id].diff = await _diff(p); } catch (_) {} }
    out.__base = _diffBase();
    return out;
  }

  async function refrescar() {
    if (!_montado) return;
    try { _estado = await _estados(); } catch (_) { _estado = {}; }
    // tarjetas de estado
    const red = hayRed();
    $('#gm-s-red').innerHTML = `Conexión<b class="${red ? 'ok' : 'no'}">${red ? '🟢 En línea' : '🟠 Sin señal'}</b>`;
    try {
      const e = await OfflineStorage.estimarAlmacenamiento();
      if (e.disponible && e.quota) {
        const pct = Math.min(100, Math.max(1, Math.round((e.usage / e.quota) * 100)));
        $('#gm-s-esp').innerHTML = `Espacio usado<b>${fmt(e.usage)} <span style="font-weight:600;font-size:.74rem;color:var(--text-muted,#64748b)">de ${fmt(e.quota)}</span></b><div class="gm-bar"><i id="gm-esp-bar" style="width:${pct}%"></i></div>`;
      } else $('#gm-s-esp').innerHTML = 'Espacio<b>—</b>';
    } catch (_) { $('#gm-s-esp').innerHTML = 'Espacio<b>—</b>'; }
    try {
      const c = await OfflineStorage.contarCola();
      const pp = window.NikaPdfSync ? NikaPdfSync.contar() : 0;   // marcas y notas de PDF hechas sin señal
      const tot = c.total + pp;
      $('#gm-s-cola').innerHTML = `Pendiente de subir<b class="${tot ? 'no' : 'ok'}">${tot ? `${tot} acción${tot === 1 ? '' : 'es'}${c.fallidos ? ` (${c.fallidos} con error)` : ''}` : '✓ Todo sincronizado'}</b>`;
    } catch (_) { $('#gm-s-cola').innerHTML = 'Pendiente de subir<b>—</b>'; }
    $('#gm-warn').innerHTML = red ? '' : '<div class="gm-warn">🟡 Estás sin conexión: podés usar lo que ya descargaste, pero para bajar más contenido necesitás señal.</div>';
    $('#gm-todo').disabled = _ocupado || !red;

    // paquetes
    $('#gm-grupos').innerHTML = GRUPOS.map((g) => `
      <section class="gm-grupo" id="gm-g-${g.id}">
        <div class="gm-gh"><span class="ic">${g.icono}</span><h4>${esc(g.titulo)}<small>${esc(g.sub)}</small></h4>
          <button class="gm-link" data-gm="grupo" data-id="${g.id}" ${red && !_ocupado ? '' : 'disabled'}>Descargar sección</button></div>
        <div class="gm-list">${g.paquetes.map((p) => _filaHtml(p, red)).join('')}</div>
      </section>`).join('');
    _estimado();
    _pdfs(red);
  }

  // PDFs de las materias para leer sin conexión en el Lector Nika (js/estudio/pdfOffline.js)
  let _pdfOffPromesa = null, _pdfSyncCargado = false;
  function _pdfs(red) {
    if (!window.NikaPdfOffline) {
      if (!_pdfOffPromesa) _pdfOffPromesa = new Promise((ok) => { const sc = document.createElement('script'); sc.src = 'js/estudio/pdfOffline.js?v=3'; sc.onload = () => ok(true); sc.onerror = () => { _pdfOffPromesa = null; ok(false); }; document.head.appendChild(sc); });
      _pdfOffPromesa.then((ok) => { if (ok && _montado) _pdfs(hayRed()); });
      return;
    }
    if (!window.NikaPdfSync && !_pdfSyncCargado) { _pdfSyncCargado = true; const sc = document.createElement('script'); sc.src = 'js/estudio/pdfSync.js?v=1'; document.head.appendChild(sc); }
    NikaPdfOffline.pintar($('#gm-pdfs'), { red });
  }

  function _filaHtml(p, red) {
    if (p.proximamente) return `<div class="gm-pack gm-prox" id="gm-p-${p.id}"><span class="ic">${p.icono}</span><div class="t"><b>${esc(p.titulo)}</b><small>${esc(p.desc)}</small><span class="gm-chip viejo">Próximamente</span></div></div>`;
    const st = _estado[p.id] || {};
    let chip = '<span class="gm-chip no">Sin descargar</span>', boton = '';
    if (st.ok) {
      const d = st.diff, n = _cuantos(d);
      const viejo = !d && st.ts && dias(st.ts) >= DIAS_VIGENCIA;
      const fecha = `${st.bytes ? fmt(st.bytes) + ' · ' : ''}${st.ts ? new Date(st.ts).toLocaleDateString('es-AR') : ''}`;
      if (d && n) {
        chip = `<span class="gm-chip viejo">🔄 ${d.legacy ? 'Descargado con una versión anterior' : 'Actualización disponible'} · ${d.cambios.length} archivo${d.cambios.length === 1 ? '' : 's'} nuevo${d.cambios.length === 1 ? '' : 's'} o modificado${d.cambios.length === 1 ? '' : 's'}${d.quitados.length ? ' · ' + d.quitados.length + ' quitado' + (d.quitados.length === 1 ? '' : 's') : ''}</span>`;
        boton = `<button class="gm-mini dl" data-gm="delta" data-id="${p.id}" ${red && !_ocupado ? '' : 'disabled'}>🔄 Actualizar cambios</button><button class="gm-mini" data-gm="quitar" data-id="${p.id}" title="Quitar de este dispositivo" ${_ocupado ? 'disabled' : ''}>🗑️</button>`;
      } else {
        chip = `<span class="gm-chip ${viejo ? 'viejo' : 'ok'}">${d ? '✓ Al día' : (viejo ? '⚠️ Para actualizar' : '✓ Listo')} · ${fecha}</span>`;
        boton = `<button class="gm-mini" data-gm="pack" data-id="${p.id}" title="${d ? 'Volver a descargar todo el paquete' : ''}" ${red && !_ocupado ? '' : 'disabled'}>${d ? 'Reinstalar' : 'Actualizar'}</button><button class="gm-mini" data-gm="quitar" data-id="${p.id}" title="Quitar de este dispositivo" ${_ocupado ? 'disabled' : ''}>🗑️</button>`;
      }
    } else {
      if (st.parcial) chip = '<span class="gm-chip viejo">Incompleto</span>';
      boton = `<button class="gm-mini dl" data-gm="pack" data-id="${p.id}" ${red && !_ocupado ? '' : 'disabled'}>⬇️ Descargar · ${fmt(p.est)}</button>`;
    }
    const m = meta()[p.id] || {};
    if (UNI[p.id] && m.ups && m.ups.length && m.ups.length < UNI[p.id].length) {
      chip = `<span class="gm-chip viejo">Parcial · ${m.ups.map((u) => (UNI[p.id].find((x) => x.id === u) || { label: u }).label).join(', ')}</span>`;
    }
    const sel = UNI[p.id] ? `<details class="gm-ups"><summary>🎯 Elegir unidades</summary>
        <div class="gm-ups-g">${UNI[p.id].map((u) => `<label><input type="checkbox" data-up="${esc(u.id)}" ${!m.ups || m.ups.includes(u.id) ? 'checked' : ''}><span>${esc(u.label)}</span></label>`).join('')}</div>
        <div class="gm-ups-f"><button class="gm-link" data-gm="ups-todas" data-id="${p.id}">Todas</button><button class="gm-link" data-gm="ups-ninguna" data-id="${p.id}">Ninguna</button>
        <button class="gm-mini dl" data-gm="sel" data-id="${p.id}" ${red && !_ocupado ? '' : 'disabled'}>⬇️ Descargar selección</button></div></details>` : '';
    return `<div class="gm-pack" id="gm-p-${p.id}"><span class="ic">${p.icono}</span>
      <div class="t"><b>${esc(p.titulo)}</b><small>${esc(p.desc)}</small>${chip}<div class="gm-pbar" style="display:none"><i></i></div>${sel}</div>
      <div class="gm-act">${boton}</div></div>`;
  }

  function _estimado() {
    const falta = TODOS.filter((p) => !p.proximamente && !(_estado[p.id] && _estado[p.id].ok));
    const tot = falta.reduce((a, p) => a + (p.est || 0), 0);
    const conCambios = TODOS.filter((p) => _estado[p.id] && _estado[p.id].diff && _cuantos(_estado[p.id].diff));
    const nBase = _cuantos(_estado.__base), nArch = conCambios.reduce((a, p) => a + _cuantos(_estado[p.id].diff), 0) + nBase;
    $('#gm-est').textContent = (falta.length ? `Faltan ${falta.length} paquete${falta.length === 1 ? '' : 's'} · ≈ ${fmt(tot)}` : '✓ Todo descargado') + (_man ? ` · Contenido v${_man.v}` : '');
    const u = $('#gm-upd'); if (u) { u.style.display = nArch ? '' : 'none'; u.disabled = _ocupado || !hayRed(); u.textContent = `🔄 Actualizar cambios (${nArch} archivo${nArch === 1 ? '' : 's'})`; }
  }

  // ------------------------------------------------------------
  // Descargas
  // ------------------------------------------------------------
  function _barraFila(id, f) {
    const row = document.getElementById('gm-p-' + id); if (!row) return;
    const w = row.querySelector('.gm-pbar'); w.style.display = 'block';
    w.firstElementChild.style.width = Math.round(Math.max(0, Math.min(1, f)) * 100) + '%';
    row.classList.add('trabajando');
  }

  async function _farma(alProgreso) {
    const r = await fetch(URL_FARMA, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    let json;
    if (r.body && r.body.getReader) {
      const reader = r.body.getReader(); const partes = []; let leidos = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        partes.push(value); leidos += value.length;
        alProgreso(Math.min(0.97, leidos / EST_FARMA));
      }
      const buf = new Uint8Array(leidos); let o = 0;
      partes.forEach((p) => { buf.set(p, o); o += p.length; });
      json = JSON.parse(new TextDecoder('utf-8').decode(buf));
    } else json = await r.json();
    await OfflineStorage.guardarNikaFarmaLocal(json);
    alProgreso(1);
    const info = await OfflineStorage.infoNikaFarmaLocal();
    return info ? info.bytes : 0;
  }

  // Listas de archivos que cambian con el contenido (temas, guías, calculadoras…): se piden al descargar
  let _listas = null;
  async function _listaDe(nombre) {
    if (!_listas) { const r = await fetch('data/guardia_listas.json', { cache: 'no-cache' }); if (!r.ok) throw new Error('lista no disponible'); _listas = await r.json(); }
    return _listas[nombre] || [];
  }
  async function _conLista(p) {
    if (!p.lista) return p;
    const l = await _listaDe(p.lista);
    return Object.assign({}, p, { urls: Array.from(new Set((p.urls || []).concat(l))) });
  }

  // Devuelve { ok, errores[], bytes }
  async function _bajarPack(p) {
    try { p = await _conLista(p); } catch (e) { return { ok: false, errores: ['No se pudo leer la lista de archivos: ' + e.message], bytes: 0 }; }
    const errores = []; let bytes = 0, falladas = [];
    const partes = (p.bancos ? p.bancos.ups.length : 0) + (p.urls && p.urls.length ? 1 : 0) + (p.farma ? 1 : 0);
    let hechas = 0;
    const avance = (extra) => _barraFila(p.id, (hechas + (extra || 0)) / Math.max(1, partes));
    avance(0);

    if (p.bancos) {
      let okB = 0;
      for (const up of p.bancos.ups) {
        try {
          if (!window.NikaSupabase || !NikaSupabase.obtenerBancoJSON) throw new Error('Sin conexión con la base');
          const res = await NikaSupabase.obtenerBancoJSON({ modulo: p.bancos.modulo, upId: up });
          if (res.error) throw new Error(res.error.message || 'Error de red');
          const preguntas = res.data && res.data.data;
          if (!Array.isArray(preguntas) || !preguntas.length) throw new Error('sin preguntas cargadas');
          const g = await OfflineStorage.guardarUPLocal(p.bancos.modulo, up, preguntas);
          bytes += g.bytes || 0; okB++;
        } catch (e) {
          errores.push(`UP ${Number(up) || up}: ${e.message}`);
          if (window.SyncManager && /failed to fetch|network/i.test(String(e.message))) SyncManager.marcarRedCaida();
        }
        hechas++; avance(0);
      }
      if (!okB && !(p.urls && p.urls.length)) return { ok: false, errores, bytes };
    }
    if (p.urls && p.urls.length) {
      const r = await _mensajeSW({ type: 'CACHE_URLS', urls: p.urls }, (h, t) => avance(h / t));
      bytes += r.bytes || 0;
      falladas = r.fallidas || [];
      if (r.fallidas && r.fallidas.length) errores.push(`${r.fallidas.length} archivo(s) sin descargar`);
      if (!r.ok && !r.bytes && r.fallidas.length === p.urls.length) return { ok: false, errores: errores.length ? errores : ['El Service Worker no respondió'], bytes };
      hechas++; avance(0);
    }
    if (p.farma) {
      try { bytes += await _farma((f) => avance(f)); } catch (e) { errores.push('Vademécum: ' + e.message); return { ok: false, errores, bytes }; }
      hechas++; avance(0);
    }
    // éxito si bajó lo principal (tolera UPs puntuales sin banco cargado)
    const ok = !errores.length || (p.bancos && errores.length < p.bancos.ups.length);
    return { ok, errores, bytes, urls: p.urls || [], fallidas: falladas };
  }

  function _fin(msg) { $('#gm-msg').textContent = msg || ''; }

  async function descargarPack(id) {
    const p = TODOS.find((x) => x.id === id); if (!p || _ocupado) return;
    if (!hayRed()) { _fin('Necesitás conexión para descargar.'); return; }
    _ocupado = true; OfflineStorage.pedirAlmacenamientoPersistente();
    _fin(`Descargando “${p.titulo}”…`);
    await _manifiesto();
    const r = await _bajarPack(p);
    if (r.ok) { const m = meta(); m[p.id] = { ts: Date.now(), bytes: r.bytes || (m[p.id] && m[p.id].bytes) || p.est, v: _man && _man.v, files: _huellas(r.urls, r.fallidas) }; guardarMeta(m); }
    _ocupado = false;
    _fin(r.ok ? `✅ “${p.titulo}” listo para usar sin conexión.${r.errores.length ? ' Con avisos: ' + r.errores.join(' · ') : ''}` : `⚠️ No se pudo descargar “${p.titulo}”: ${r.errores.join(' · ')}`);
    await refrescar();
    if (r.ok && typeof window.showToast === 'function') window.showToast('🛡️ Descargado: ' + p.titulo);
  }

  async function descargarSeleccion(id) {
    const p = TODOS.find((x) => x.id === id); if (!p || _ocupado || !UNI[id]) return;
    const fila = document.getElementById('gm-p-' + id);
    const ids = Array.from(fila.querySelectorAll('input[data-up]:checked')).map((i) => i.dataset.up);
    if (!ids.length) { _fin('Elegí al menos una unidad.'); return; }
    if (!hayRed()) { _fin('Necesitás conexión para descargar.'); return; }
    _ocupado = true; OfflineStorage.pedirAlmacenamientoPersistente();
    const q = _subpack(p, ids);
    _fin(`Descargando ${ids.length} unidad${ids.length === 1 ? '' : 'es'} de “${p.titulo}”…`);
    await _manifiesto();
    const rb = await _mensajeSW({ type: 'CACHE_URLS', urls: BASE_URLS }); _guardarBase(rb);
    const r = await _bajarPack(q);
    if (r.ok) { const m = meta(); const previo = (m[id] && m[id].ups) || []; const ups = Array.from(new Set(previo.concat(ids))); m[id] = { ts: Date.now(), bytes: r.bytes || p.est, ups, v: _man && _man.v, files: Object.assign({}, (m[id] && m[id].files) || {}, _huellas(r.urls, r.fallidas)) }; guardarMeta(m); }
    _ocupado = false;
    _fin(r.ok ? `✅ ${ids.length} unidad${ids.length === 1 ? '' : 'es'} lista${ids.length === 1 ? '' : 's'} para usar sin conexión.` : `⚠️ No se pudo descargar: ${r.errores.join(' · ')}`);
    await refrescar();
  }

  async function _lote(paquetes) {
    if (_ocupado) return;
    if (!hayRed()) { _fin('Necesitás conexión para descargar.'); return; }
    if (!paquetes.length) { _fin('No hay nada para descargar.'); return; }
    _ocupado = true; OfflineStorage.pedirAlmacenamientoPersistente();
    $('#gm-bar-wrap').style.display = 'block';
    let hechos = 0, bien = 0; const malos = [];
    // la base de la app siempre acompaña
    _fin('Preparando la app para uso sin conexión…');
    await _manifiesto();
    _guardarBase(await _mensajeSW({ type: 'CACHE_URLS', urls: BASE_URLS }));
    for (const p of paquetes) {
      $('#gm-bar').style.width = Math.round((hechos / paquetes.length) * 100) + '%';
      _fin(`Descargando ${hechos + 1} de ${paquetes.length}: ${p.titulo}…`);
      const r = await _bajarPack(p);
      if (r.ok) { bien++; const m = meta(); m[p.id] = { ts: Date.now(), bytes: r.bytes || p.est, v: _man && _man.v, files: _huellas(r.urls, r.fallidas) }; guardarMeta(m); } else malos.push(p.titulo);
      hechos++;
      await refrescarFila(p.id);
    }
    $('#gm-bar').style.width = '100%';
    _ocupado = false;
    _fin(malos.length ? `Listo: ${bien} paquete(s) descargados. No se pudo: ${malos.join(', ')}.` : `✅ Todo listo (${bien} paquete${bien === 1 ? '' : 's'}). Ya podés usar Campus Nika sin conexión.`);
    await refrescar();
    setTimeout(() => { const w = $('#gm-bar-wrap'); if (w) w.style.display = 'none'; }, 1800);
  }
  function _guardarBase(rb) { const m = meta(); m._base = { v: _man && _man.v, files: _huellas(BASE_URLS, rb && rb.fallidas) }; guardarMeta(m); }

  // Baja solo lo nuevo/modificado y quita lo eliminado; actualiza las huellas guardadas.
  async function _aplicarDelta(clave, d) {
    let fallidas = [];
    if (d.cambios.length) { const r = await _mensajeSW({ type: 'CACHE_URLS', urls: d.cambios }); fallidas = r.fallidas || []; }
    if (d.quitados.length) await _mensajeSW({ type: 'UNCACHE_URLS', urls: d.quitados }, null, 30000);
    const m = meta(); const e = m[clave] || (m[clave] = {});
    const files = Object.assign({}, e.files || {});
    d.cambios.forEach((u) => { if (!fallidas.includes(u) && _man.f[u]) files[u] = _man.f[u]; });
    d.quitados.forEach((u) => { delete files[u]; });
    e.files = files; e.v = _man.v; e.ts = Date.now(); guardarMeta(m);
    return fallidas.length;
  }
  async function actualizarCambios(id) {
    const p = TODOS.find((x) => x.id === id); if (!p || _ocupado) return;
    if (!hayRed()) { _fin('Necesitás conexión para actualizar.'); return; }
    _ocupado = true;
    try {
      await _manifiesto(); const d = await _diff(p);
      if (!d || !_cuantos(d)) { _fin(`“${p.titulo}” ya está al día.`); }
      else {
        _fin(`Actualizando “${p.titulo}”: ${d.cambios.length} archivo(s) nuevo(s) o modificado(s)${d.quitados.length ? ', ' + d.quitados.length + ' quitado(s)' : ''}…`);
        _barraFila(id, 0.2);
        const f = await _aplicarDelta(id, d);
        _fin(f ? `⚠️ “${p.titulo}”: ${f} archivo(s) no se pudieron actualizar; reintentá.` : `✅ “${p.titulo}” actualizado (solo lo que cambió).`);
      }
    } catch (e) { _fin('No se pudo actualizar: ' + e.message); }
    _ocupado = false; await refrescar();
  }
  async function actualizarTodo() {
    if (_ocupado) return;
    if (!hayRed()) { _fin('Necesitás conexión para actualizar.'); return; }
    _ocupado = true;
    let total = 0, fallos = 0;
    try {
      await _manifiesto();
      const db = _diffBase();
      if (db && _cuantos(db)) { total += _cuantos(db); fallos += await _aplicarDelta('_base', db); }
      for (const p of TODOS.filter((x) => !x.proximamente && _estado[x.id] && _estado[x.id].ok)) {
        const d = await _diff(p);
        if (d && _cuantos(d)) { _fin(`Actualizando “${p.titulo}”…`); total += _cuantos(d); fallos += await _aplicarDelta(p.id, d); }
      }
      _fin(total ? (fallos ? `⚠️ ${fallos} archivo(s) no se pudieron actualizar; reintentá.` : `✅ Actualizado: ${total} archivo(s) nuevos, modificados o quitados.`) : 'Todo está al día.');
    } catch (e) { _fin('No se pudo actualizar: ' + e.message); }
    _ocupado = false; await refrescar();
  }
  async function refrescarFila() { /* el estado completo se repinta al terminar el lote */ }

  function descargarTodo() { _lote(TODOS.filter((p) => !p.proximamente && !(_estado[p.id] && _estado[p.id].ok))); }
  function descargarGrupo(gid) { _lote(TODOS.filter((p) => !p.proximamente && p.grupo === gid && !(_estado[p.id] && _estado[p.id].ok))); }

  async function quitarPack(id) {
    const p = TODOS.find((x) => x.id === id); if (!p || _ocupado) return;
    if (!confirm(`¿Quitar “${p.titulo}” de este dispositivo?`)) return;
    _ocupado = true;
    try {
      if (p.bancos) { const l = await OfflineStorage.listarUPsLocales(p.bancos.modulo); for (const x of l) await OfflineStorage.eliminarUPLocal(x.modulo, x.upId); }
      if (p.farma) { await OfflineStorage.eliminarNikaFarmaLocal(); await _mensajeSW({ type: 'UNCACHE_URLS', urls: [URL_FARMA] }, null, 10000); }
      if (p.urls && p.urls.length) { let q = p; try { q = await _conLista(p); } catch (_) {} await _mensajeSW({ type: 'UNCACHE_URLS', urls: q.urls }, null, 30000); }
      const m = meta(); delete m[p.id]; guardarMeta(m);
      _fin(`🗑️ “${p.titulo}” quitado.`);
    } catch (e) { _fin('No se pudo quitar: ' + e.message); }
    _ocupado = false;
    await refrescar();
  }

  async function borrarTodo() {
    if (_ocupado) return;
    if (!confirm('¿Borrar todas las descargas de este dispositivo, incluidos los PDFs guardados? (Tu progreso pendiente de subir NO se borra.)')) return;
    _ocupado = true;
    try {
      const l = await OfflineStorage.listarUPsLocales('cirugia'); for (const x of l) await OfflineStorage.eliminarUPLocal(x.modulo, x.upId);
      await OfflineStorage.eliminarNikaFarmaLocal();
      let urls = [...new Set(TODOS.flatMap((p) => p.urls || []).concat([URL_FARMA], BASE_URLS))];
      try { await _listaDe('guias'); Object.values(_listas).forEach((l) => { urls = urls.concat(l); }); urls = [...new Set(urls)]; } catch (_) {}
      await _mensajeSW({ type: 'UNCACHE_URLS', urls }, null, 30000);
      if (window.NikaPdfOffline) await NikaPdfOffline.borrarTodo();
      guardarMeta({});
      _fin('🗑️ Descargas borradas.');
    } catch (e) { _fin('No se pudo borrar: ' + e.message); }
    _ocupado = false;
    await refrescar();
  }

  // ------------------------------------------------------------
  // Abrir / cerrar
  // ------------------------------------------------------------
  async function abrir(opts) {
    if (!window.OfflineStorage) { alert('El módulo de almacenamiento offline no está cargado.'); return; }
    if (!_montado) { _css(); _html(); _montado = true; }
    _fin(''); $('#gm-bar-wrap').style.display = 'none';
    $('#guardia-overlay').classList.add('on');
    await refrescar();
    // Si se abrió desde un simulador, se lleva a la persona directo a su materia y se resalta
    const g = opts && opts.grupo ? $('#gm-g-' + opts.grupo) : null;
    if (g) { g.scrollIntoView({ block: 'start', behavior: 'smooth' }); g.classList.add('gm-destacado'); setTimeout(() => g.classList.remove('gm-destacado'), 2600); }
  }
  function cerrar() { const o = $('#guardia-overlay'); if (o) o.classList.remove('on'); }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-guardia-open]');
    if (t) { e.preventDefault(); abrir({ grupo: t.getAttribute('data-guardia-grupo') || '' }); }
  });
  window.addEventListener('nika:sync-state', () => { if (_montado && $('#guardia-overlay').classList.contains('on') && !_ocupado) refrescar(); });
  window.addEventListener('online', () => { if (_montado && $('#guardia-overlay').classList.contains('on') && !_ocupado) refrescar(); });
  window.addEventListener('offline', () => { if (_montado && $('#guardia-overlay').classList.contains('on') && !_ocupado) refrescar(); });

  return { abrir, cerrar, refrescar };
})();

window.GuardiaModal = GuardiaModal;
