/* NikaPdf — lector de PDFs de Drive dentro de NikaMed, con subrayado y progreso de lectura por usuario.
   - El PDF se descarga desde la API de Drive (clave restringida a nikamed.com.ar) y se dibuja con pdf.js: no se sube nada a NikaMed.
   - Subrayados y progreso se guardan en Supabase (sql/pdf_lector.sql) con RLS: cada usuario ve solo lo suyo. Sin sesión, quedan en el navegador.
   - Si el archivo no se puede abrir así (descarga bloqueada, no es PDF, sin conexión), se vuelve al visor de Drive de siempre.
   Herramientas: Seleccionar (V) · Subrayar (H) · Borrar (E) · colores 1-4 · panel de subrayados · pantalla completa.
   Uso: NikaPdf.abrir({ wrapper, fileId, title, fallback }) / NikaPdf.reabrir() / NikaPdf.cerrar() / NikaPdf.pantalla() */
(function () {
  'use strict';
  const API_KEY = 'AIzaSyB0MSmTC-gBB7hiw-MUqst1-m1iN8e-eDQ';   // clave pública de Drive, restringida por dominio (https://nikamed.com.ar/*)
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const COLORES = { amarillo: '#fde047', verde: '#86efac', rosa: '#f9a8d4', azul: '#93c5fd' };
  const NOMBRES = { amarillo: 'Amarillo', verde: 'Verde', rosa: 'Rosa', azul: 'Azul' };
  // Paleta completa y 6 favoritos por usuario (se guardan en el navegador). Las marcas viejas siguen usando los nombres de siempre.
  const PALETA = ['#fde047', '#fbbf24', '#fb923c', '#f87171', '#ef4444', '#dc2626', '#f9a8d4', '#f472b6', '#ec4899', '#d946ef', '#c084fc', '#a78bfa',
    '#818cf8', '#93c5fd', '#60a5fa', '#38bdf8', '#22d3ee', '#2dd4bf', '#86efac', '#4ade80', '#a3e635', '#bef264', '#d6d3d1', '#94a3b8',
    '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff'];
  const FAV_DEF = ['#fde047', '#86efac', '#f9a8d4', '#93c5fd', '#f87171', '#c4b5fd'];
  const HEX = /^#[0-9a-f]{6}$/i;
  const colorDe = (c) => COLORES[c] || (HEX.test(c || '') ? c.toLowerCase() : COLORES.amarillo);
  const colorGuardar = (c) => { c = String(c || '').toLowerCase(); const k = Object.keys(COLORES).find((x) => COLORES[x] === c); return k || c; };   // los 4 clásicos siguen guardándose con su nombre
  function favoritos() {
    try { const f = JSON.parse(localStorage.getItem('nika_pdf_favs') || 'null'); if (Array.isArray(f) && f.length === 6 && f.every((x) => HEX.test(x))) return f.map((x) => x.toLowerCase()); } catch (_) {}
    return FAV_DEF.slice();
  }
  const guardarFavs = (f) => { try { localStorage.setItem('nika_pdf_favs', JSON.stringify(f)); } catch (_) {} };
  const ESCALAS = [0.6, 0.8, 1, 1.25, 1.5, 1.8, 2.2, 2.6];
  const ICO = {
    sel: '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.5L10 19z"/></svg>',
    sub: '<svg viewBox="0 0 24 24"><path d="M4 20h7M14.5 4.5l5 5L9 20l-5 .5.5-5z"/><path d="M13 6l5 5"/></svg>',
    bor: '<svg viewBox="0 0 24 24"><path d="M3 17l8-12 9 6-7 10H7z"/><path d="M9 21h11"/></svg>',
    lista: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    fs: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    fsx: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    pincel: '<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9.5 9.5H4.5v-6z"/><path d="M12.5 5.5l6 6"/><path d="M4 21h4"/></svg>',
    area: '<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2" stroke-dasharray="3 2"/><path d="M8 14h8"/></svg>',
    drive: '<svg viewBox="0 0 24 24"><path d="M8 3h8l6 10-4 7H6l-4-7z"/></svg>',
    ajustar: '<svg viewBox="0 0 24 24"><path d="M4 12h16M7 8l-3 4 3 4M17 8l3 4-3 4"/></svg>',
  };

  let S = null;           // sesión de lectura actual
  let ultimoOp = null;    // últimos argumentos de abrir() (para reabrir)
  let libPromesa = null;

  const $ = (sel, r) => (r || document).querySelector(sel);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const cliente = () => window.supabaseClient || (window.NikaSupabase && window.NikaSupabase.client) || null;

  function cargarLib() {
    if (window.pdfjsLib) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; return Promise.resolve(); }
    if (libPromesa) return libPromesa;
    libPromesa = new Promise((ok, mal) => {
      const s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js';
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; ok(); };
      s.onerror = () => { libPromesa = null; mal(new Error('No se pudo cargar pdf.js')); };
      document.head.appendChild(s);
    });
    return libPromesa;
  }

  function css() {
    if ($('#nkpdf-css')) return;
    const st = document.createElement('style'); st.id = 'nkpdf-css';
    st.textContent = `
.nkpdf{position:absolute;inset:0;display:flex;flex-direction:column;background:#e2e8f0;font-family:inherit;overflow:hidden}
.nkpdf-bar svg,.nkpdf-panel svg,.nkpdf-toast svg,.nkpdf-pop svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.nkpdf-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;color:#e2e8f0;font-size:.78rem;font-weight:700;
  background:linear-gradient(120deg,#0b1535,#1e1b4b 55%,#2e1065);border-bottom:1px solid rgba(168,85,247,.45);box-shadow:0 6px 18px rgba(15,23,42,.35);position:relative;z-index:5}
.nkpdf-grupo{display:flex;align-items:center;gap:3px;padding:3px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.nkpdf-bar button{display:inline-flex;align-items:center;gap:6px;background:transparent;border:0;color:#cbd5e1;border-radius:9px;padding:6px 10px;font:inherit;cursor:pointer;transition:background .18s,transform .18s,color .18s,box-shadow .18s;position:relative}
.nkpdf-bar button:hover{background:rgba(255,255,255,.14);color:#fff;transform:translateY(-1px)}
.nkpdf-bar button:active{transform:translateY(0) scale(.96)}
.nkpdf-bar button.on{color:#fff;background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1);box-shadow:0 4px 14px rgba(168,85,247,.55)}
.nkpdf-bar button.on svg{animation:nkpdfPop .35s ease}
@keyframes nkpdfPop{0%{transform:scale(.7) rotate(-12deg)}60%{transform:scale(1.2) rotate(6deg)}100%{transform:none}}
.nkpdf-col{width:22px;height:22px;padding:0!important;border-radius:50%!important;border:2px solid rgba(255,255,255,.35)!important;transition:transform .18s,border-color .18s!important}
.nkpdf-col:hover{transform:scale(1.18)!important}
.nkpdf-col.on{border-color:#fff!important;box-shadow:0 0 0 3px rgba(255,255,255,.28)!important;transform:scale(1.12)}
.nkpdf-bar input{width:46px;text-align:center;border-radius:7px;border:0;padding:5px;font:inherit;font-weight:800;color:#0f172a}
.nkpdf-pagtxt{display:flex;align-items:center;gap:5px;padding:0 6px}
.nkpdf-zoom{min-width:44px;text-align:center}
.nkpdf-prog{display:flex;align-items:center;gap:8px;min-width:130px}
.nkpdf-prog i{display:block;height:7px;flex:1;min-width:60px;border-radius:7px;background:rgba(255,255,255,.16);overflow:hidden}
.nkpdf-prog i b{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a855f7);transition:width .5s;box-shadow:0 0 10px rgba(168,85,247,.8)}
.nkpdf-sep{flex:1}
.nkpdf-cnt{background:#a855f7;color:#fff;border-radius:999px;font-size:.66rem;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}
.nkpdf-hint{width:100%;font-weight:600;font-size:.72rem;color:#c4b5fd;opacity:.95;display:flex;align-items:center;gap:6px}
.nkpdf-cuerpo{flex:1;position:relative;min-height:0;display:flex}
.nkpdf-scroll{flex:1;overflow:auto;padding:14px 0;-webkit-overflow-scrolling:touch}
.nkpdf.m-sub .nkpdf-scroll{cursor:text}
.nkpdf.m-area .nkpdf-scroll{cursor:crosshair;touch-action:none}
.nkpdf.m-pincel .nkpdf-scroll,.nkpdf.m-bor .nkpdf-scroll{cursor:none;touch-action:none}
.nkpdf.m-pincel .nk-tx,.nkpdf.m-bor .nk-tx{user-select:none;-webkit-user-select:none}
.nk-hl svg,.nk-live{position:absolute;left:0;top:0;pointer-events:none;mix-blend-mode:multiply;opacity:.55}
.nkpdf-aro{position:absolute;z-index:8;pointer-events:none;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px rgba(15,23,42,.65),inset 0 0 0 1px rgba(15,23,42,.25);transform:translate(-50%,-50%);display:none}
.nkpdf-tam{display:none;align-items:center;gap:8px;padding:3px 10px}
.nkpdf.m-pincel .nkpdf-tam,.nkpdf.m-bor .nkpdf-tam{display:flex}
.nkpdf-tam input[type=range]{width:96px;accent-color:#a855f7;padding:0;height:4px}
.nkpdf-tam .nkpdf-num{width:54px!important;padding:4px 6px!important;border-radius:8px;text-align:center;font-weight:800;color:#0f172a;border:0}
.nkpdf-tam em{font-style:normal;font-size:.68rem;color:#c4b5fd;margin-left:-4px}
.nkpdf-item .cp{margin-right:4px}
.nkpdf.m-area .nk-tx{user-select:none;-webkit-user-select:none}
.nkpdf-rect{position:absolute;pointer-events:none;border:2px dashed rgba(15,23,42,.55);border-radius:3px;z-index:3}
.nkpdf-volver{position:absolute;left:12px;bottom:12px;z-index:30;display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:0;border-radius:999px;font:inherit;font-weight:800;font-size:.82rem;color:#fff;cursor:pointer;background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1);box-shadow:0 8px 22px rgba(168,85,247,.55);animation:nkpdfIn .3s ease both;transition:transform .18s,box-shadow .18s}
.nkpdf-volver:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(168,85,247,.7)}
.nkpdf.m-bor .nk-tx{user-select:none;-webkit-user-select:none}
.nkpdf.m-bor .nkpdf-scroll{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 24 24' fill='%23fecaca' stroke='%23991b1b' stroke-width='1.8' stroke-linejoin='round'%3E%3Cpath d='M3 17l8-12 9 6-7 10H7z'/%3E%3C/svg%3E") 4 22,pointer}
.nk-pg{position:relative;margin:0 auto 14px;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,.25);border-radius:3px}
.nk-pg canvas{display:block;width:100%;height:100%;border-radius:3px}
.nkpdf-fantasma{display:none;position:absolute;z-index:6;pointer-events:none}
.nkpdf-fantasma.pin{font-size:30px;line-height:1;transform:translate(-50%,-100%) rotate(-12deg);transform-origin:50% 100%;filter:drop-shadow(0 4px 4px rgba(15,23,42,.4));animation:nkpdfFant .9s ease-in-out infinite}
.nkpdf-fantasma.texto{font:700 13px 'Plus Jakarta Sans',system-ui,sans-serif;color:rgba(15,23,42,.55);padding:5px 12px 6px 20px;border-radius:8px;border:2px dashed #7c3aed;background:rgba(253,230,138,.7);animation:nkpdfFant2 1.2s ease-in-out infinite}
@keyframes nkpdfFant{0%,100%{transform:translate(-50%,-100%) rotate(-12deg)}50%{transform:translate(-50%,-108%) rotate(8deg) scale(1.08)}}
@keyframes nkpdfFant2{0%,100%{opacity:.75}50%{opacity:1;transform:translateY(-2px)}}
.nk-hl{position:absolute;inset:0;pointer-events:none}
.nk-hl i{position:absolute;mix-blend-mode:multiply;border-radius:2px;opacity:.62;animation:nkpdfHl .35s ease both;transform-origin:left center}
@keyframes nkpdfHl{from{opacity:0;transform:scaleX(.2)}to{opacity:.62;transform:none}}
.nk-tx{position:absolute;inset:0;overflow:hidden;line-height:1}
.nk-tx span{position:absolute;white-space:pre;color:transparent;cursor:inherit;transform-origin:0 0}
.nk-tx ::selection{background:rgba(59,130,246,.35)}
.nk-pg .nk-leida{position:absolute;top:8px;right:8px;background:#16a34a;color:#fff;font-size:.7rem;font-weight:800;border-radius:999px;padding:2px 9px;opacity:.9;pointer-events:none;animation:nkpdfPop .4s ease}
.nk-pg .nk-num{position:absolute;bottom:6px;right:10px;font-size:.66rem;color:#94a3b8;pointer-events:none}
.nkpdf-pop{position:fixed;z-index:2147483600;display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:12px;background:#0f172a;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:nkpdfIn .15s ease both}
@keyframes nkpdfIn{from{opacity:0;transform:translateY(4px) scale(.96)}to{opacity:1;transform:none}}
.nkpdf-pop .c{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.7);cursor:pointer;transition:transform .15s}
.nkpdf-pop .c:hover{transform:scale(1.2)}
.nkpdf-pop .x{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:8px;padding:4px 9px;font:inherit;font-size:.74rem;font-weight:700;cursor:pointer}
.nkpdf-pop .x:hover{background:#dc2626}
.nkpdf-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#334155;font-weight:700;background:#f1f5f9;z-index:6}
.nkpdf-msg .sp{width:34px;height:34px;border:4px solid #cbd5e1;border-top-color:#7c3aed;border-radius:50%;animation:nkpdfSp .8s linear infinite}
@keyframes nkpdfSp{to{transform:rotate(360deg)}}
.nkpdf-carga{width:min(460px,92%);display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.nkpdf-robot{width:110px;height:126px;animation:nkpdfFlota 2.6s ease-in-out infinite;filter:drop-shadow(0 10px 14px rgba(15,23,42,.25))}
.nkpdf-robot svg{width:100%;height:100%;overflow:visible}
.nkpdf-robot .rb-ojo{transform-box:fill-box;transform-origin:center;animation:nkpdfParp 4s infinite}
.nkpdf-robot .rb-bq{transform-box:fill-box;transform-origin:70% 10%;animation:nkpdfBrazo 1.4s ease-in-out infinite}
.nkpdf-robot .rb-bs{transform-box:fill-box;transform-origin:30% 10%;animation:nkpdfBrazo 1.4s ease-in-out .7s infinite reverse}
.nkpdf-robot .rb-boca{transform-box:fill-box;transform-origin:center;animation:nkpdfHabla 1.1s ease-in-out infinite}
@keyframes nkpdfFlota{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-9px) rotate(2deg)}}
@keyframes nkpdfParp{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes nkpdfBrazo{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(14deg)}}
@keyframes nkpdfHabla{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.5)}}
.nkpdf-globo{position:relative;background:#fff;border:2px solid #c4b5fd;border-radius:16px;padding:11px 14px;font-size:.86rem;line-height:1.35;color:#334155;font-weight:600;box-shadow:0 8px 22px rgba(124,58,237,.14);min-height:62px;display:flex;align-items:center;animation:nkpdfIn .35s ease both}
.nkpdf-globo:before{content:"";position:absolute;top:-9px;left:50%;margin-left:-8px;width:14px;height:14px;background:#fff;border-left:2px solid #c4b5fd;border-top:2px solid #c4b5fd;transform:rotate(45deg)}
.nkpdf-peso{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;font-size:.74rem;font-weight:800;background:#ede9fe;color:#6d28d9}
.nkpdf-peso.p2{background:#fef3c7;color:#b45309}.nkpdf-peso.p3{background:#ffe4e6;color:#be123c}
.nkpdf-barra{width:100%;height:14px;border-radius:999px;background:#e2e8f0;overflow:hidden;box-shadow:inset 0 1px 3px rgba(15,23,42,.18)}
.nkpdf-barra b{display:block;height:100%;width:6%;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#a855f7,#38bdf8);background-size:200% 100%;animation:nkpdfBarra 1.2s linear infinite;transition:width .35s ease}
@keyframes nkpdfBarra{to{background-position:-200% 0}}
.nkpdf-stat{font-size:.76rem;color:#64748b;font-weight:700;font-variant-numeric:tabular-nums}
.nkpdf-toast{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:7;display:flex;gap:10px;align-items:center;padding:9px 14px;border-radius:12px;background:#0f172a;color:#fff;font-size:.8rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:nkpdfIn .3s ease both;max-width:92%}
.nkpdf-toast button{background:linear-gradient(135deg,#7e22ce,#a855f7);border:0;color:#fff;border-radius:8px;padding:5px 11px;font:inherit;cursor:pointer}
.nkpdf-toast .z{background:transparent;color:#94a3b8;padding:5px 6px}
.nkpdf-panel{position:absolute;top:0;right:0;bottom:0;width:min(320px,86%);z-index:6;display:flex;flex-direction:column;background:#0f172a;color:#e2e8f0;box-shadow:-12px 0 30px rgba(0,0,0,.4);transform:translateX(105%);transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.nkpdf-panel.on{transform:none}
.nkpdf-panel h4{margin:0;padding:12px 14px;font-size:.85rem;font-weight:800;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center}
.nkpdf-panel h4 button{background:none;border:0;color:#94a3b8;font-size:1.1rem;cursor:pointer}
.nkpdf-bar button:disabled{opacity:.35;cursor:default}.nkpdf-aviso{position:absolute;left:50%;bottom:18px;transform:translateX(-50%) translateY(10px);background:rgba(15,23,42,.92);color:#fff;padding:7px 14px;border-radius:999px;font-size:.78rem;font-weight:700;opacity:0;pointer-events:none;transition:.2s;z-index:30}.nkpdf-aviso.on{opacity:1;transform:translateX(-50%)}
.nkpdf-atajos{position:absolute;inset:0;background:rgba(2,6,23,.55);display:flex;align-items:center;justify-content:center;z-index:40}.nkpdf-atajos>div{background:#0f172a;color:#e2e8f0;border-radius:14px;padding:14px 18px;width:min(420px,92%);max-height:88%;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.5)}.nkpdf-atajos h4{display:flex;justify-content:space-between;margin:0 0 8px;font-size:.95rem}.nkpdf-atajos h4 button{background:none;border:0;color:#94a3b8;cursor:pointer}.nkpdf-atajos p{display:flex;gap:10px;align-items:center;margin:5px 0;font-size:.8rem}.nkpdf-atajos kbd{min-width:104px;text-align:center;background:#1e293b;border:1px solid #334155;border-radius:6px;padding:2px 7px;font:700 .72rem monospace;color:#c4b5fd}
.nkpdf-lista{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px}
.nkpdf-vacio{color:#94a3b8;font-size:.8rem;line-height:1.5;padding:14px 6px;text-align:center}
.nkpdf-item{border-radius:10px;padding:9px 10px;background:rgba(255,255,255,.06);border-left:4px solid var(--c);cursor:pointer;transition:background .15s,transform .15s}
.nkpdf-item:hover{background:rgba(255,255,255,.12);transform:translateX(-2px)}
.nkpdf-item small{display:flex;justify-content:space-between;align-items:center;color:#a5b4fc;font-weight:800;font-size:.68rem;margin-bottom:3px}
.nkpdf-item p{margin:0;font-size:.78rem;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.nkpdf-item button{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:.9rem}
.nkpdf-item button:hover{color:#f87171}
#nika-inline-viewer-container:fullscreen{width:100vw!important;height:100vh!important;margin:0!important;border-radius:0!important;background:#fff}
.nkpdf-favs{gap:5px}
.nkpdf-mas{display:inline-grid!important;place-items:center;font-size:.9rem;font-weight:800;line-height:1;color:#e2e8f0;border:2px dashed rgba(255,255,255,.5)!important;background:transparent!important}
.nkpdf-mas:hover{background:rgba(255,255,255,.18)!important;border-style:solid!important}
.nkpdf-paleta{position:absolute;z-index:40;width:292px;max-width:calc(100% - 16px);padding:14px;border-radius:18px;color:#e2e8f0;background:linear-gradient(150deg,#0b1535,#1e1b4b 60%,#312e81);border:1px solid rgba(168,85,247,.55);box-shadow:0 22px 46px rgba(2,6,23,.65);animation:nkEtaPop .3s cubic-bezier(.34,1.4,.64,1);font-weight:600}
.nkpdf-paleta h5{margin:0 0 4px;font-size:.92rem;font-weight:800;color:#fff}
.nkpdf-paleta p{margin:0 0 10px;font-size:.72rem;line-height:1.35;color:#a5b4fc}
.pl-slots{display:flex;gap:7px;margin-bottom:12px}
.pl-s{flex:1;height:34px;border-radius:11px;border:2px solid rgba(255,255,255,.28);cursor:pointer;font:inherit;font-weight:800;font-size:.78rem;color:rgba(15,23,42,.75);transition:transform .2s,border-color .2s,box-shadow .2s}
.pl-s:hover{transform:translateY(-2px)}.pl-s.on{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.28),0 8px 14px -6px rgba(0,0,0,.6);transform:translateY(-2px) scale(1.06)}
.pl-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}
.pl-c{aspect-ratio:1;border-radius:10px;border:2px solid transparent;cursor:pointer;transition:transform .18s cubic-bezier(.34,1.6,.64,1),border-color .18s;padding:0}
.pl-c:hover{transform:scale(1.22);border-color:#fff;z-index:1;position:relative}
.pl-pie{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;font-size:.74rem}
.pl-pie label{display:flex;align-items:center;gap:6px;margin-right:auto;cursor:pointer}.pl-pie input[type=color]{width:34px;height:26px;padding:0;border:0;border-radius:8px;background:none;cursor:pointer}
.pl-pie button{border:1px solid rgba(255,255,255,.25);background:transparent;color:#e2e8f0;border-radius:9px;padding:6px 10px;font:inherit;font-weight:700;font-size:.74rem;cursor:pointer}.pl-pie button:hover{background:rgba(255,255,255,.12)}
.pl-pie .pl-ok{border:0;background:linear-gradient(135deg,#7e22ce,#a855f7);color:#fff}
.nkpdf-tip{position:absolute;z-index:60;width:max-content;max-width:min(300px,calc(100% - 16px));padding:11px 13px;border-radius:14px;color:#e2e8f0;font-weight:600;font-size:.76rem;line-height:1.4;pointer-events:none;background:linear-gradient(150deg,#0b1535,#1e1b4b 70%);border:1px solid rgba(168,85,247,.55);box-shadow:0 16px 34px rgba(2,6,23,.6);opacity:0;transform:translateY(-6px) scale(.97);transition:opacity .16s,transform .2s cubic-bezier(.34,1.4,.64,1)}
.nkpdf-tip.on{opacity:1;transform:none}
.nkpdf-tip b{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:3px;font-size:.84rem;font-weight:800;color:#fff}
.nkpdf-tip kbd{padding:1px 6px;border-radius:6px;font:inherit;font-size:.68rem;font-weight:800;background:rgba(255,255,255,.14);color:#a5f3fc}
.nkpdf-tip .rec{padding:1px 8px;border-radius:999px;font-size:.64rem;font-weight:800;background:linear-gradient(90deg,#22c55e,#06b6d4);color:#04210f}
.nkpdf-tip i{display:block;margin-top:6px;font-style:normal;font-size:.7rem;color:#a5b4fc}
.nkpdf-lim{position:absolute;inset:0;z-index:70;display:grid;place-items:center;padding:14px;background:rgba(2,6,23,.58);backdrop-filter:blur(4px);animation:nkEtaPop .25s ease}
.nkpdf-lim>div{width:min(430px,100%);max-height:100%;overflow:auto;padding:20px;border-radius:20px;color:#e2e8f0;background:linear-gradient(150deg,#0b1535,#1e1b4b 65%,#312e81);border:1px solid rgba(168,85,247,.55);box-shadow:0 26px 54px rgba(2,6,23,.7);font-weight:600;font-size:.82rem}
.nkpdf-lim h4{margin:0 0 4px;font-size:1.05rem;font-weight:800;color:#fff}.nkpdf-lim .sub{margin:0 0 14px;color:#a5b4fc;font-size:.76rem}
.nkpdf-lim .op{display:flex;align-items:center;gap:8px;padding:9px 11px;margin-bottom:7px;border-radius:12px;border:1px solid rgba(255,255,255,.14);cursor:pointer;transition:background .2s,border-color .2s}.nkpdf-lim .op:hover{background:rgba(255,255,255,.07)}.nkpdf-lim .op.on{border-color:#a855f7;background:rgba(168,85,247,.16)}
.nkpdf-lim input[type=number]{width:62px;padding:5px;border-radius:8px;border:0;font:inherit;font-weight:800;text-align:center;color:#0f172a}
.nkpdf-lim .cols{display:flex;gap:7px;flex-wrap:wrap;margin:6px 0 4px}.nkpdf-lim .cols button{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.3);cursor:pointer;padding:0;transition:transform .18s}.nkpdf-lim .cols button.off{opacity:.3;transform:scale(.8)}
.nkpdf-lim .tipos{display:flex;gap:14px;flex-wrap:wrap;margin:8px 0}.nkpdf-lim label.ck{display:flex;align-items:center;gap:6px;cursor:pointer}
.nkpdf-lim .cuenta{margin:12px 0;padding:11px 13px;border-radius:13px;font-weight:800;background:rgba(14,165,233,.14);border:1px solid rgba(56,189,248,.4);color:#bae6fd}
.nkpdf-lim .cuenta.cero{background:rgba(148,163,184,.14);border-color:rgba(148,163,184,.35);color:#cbd5e1}
.nkpdf-lim .peligro{margin:10px 0;padding:12px 13px;border-radius:13px;background:rgba(239,68,68,.15);border:1px solid rgba(248,113,113,.5);color:#fecaca;line-height:1.45}
.nkpdf-lim input[type=text]{width:100%;box-sizing:border-box;margin-top:8px;padding:10px;border-radius:10px;border:2px solid rgba(248,113,113,.5);background:rgba(15,23,42,.6);color:#fff;font:inherit;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.nkpdf-lim .acc{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
.nkpdf-lim .acc button{border:1px solid rgba(255,255,255,.22);background:transparent;color:#e2e8f0;border-radius:11px;padding:9px 14px;font:inherit;font-weight:800;font-size:.8rem;cursor:pointer;transition:transform .2s,opacity .2s}.nkpdf-lim .acc button:hover:not(:disabled){transform:translateY(-1px)}
.nkpdf-lim .acc .go{border:0;color:#fff;background:linear-gradient(135deg,#0284c7,#6366f1 60%,#a855f7)}.nkpdf-lim .acc .del{border:0;color:#fff;background:linear-gradient(135deg,#dc2626,#ef4444)}.nkpdf-lim .acc button:disabled{opacity:.4;cursor:not-allowed}
.nkpdf-bar button.nkpdf-eta{gap:6px;padding:5px 11px;border-radius:999px;background:rgba(34,211,238,.14);border:1px solid rgba(34,211,238,.4);color:#a5f3fc;font-weight:800;position:relative;overflow:hidden}
.nkpdf-bar button.nkpdf-eta:hover{background:rgba(34,211,238,.26);color:#fff}
.nkpdf-eta .nk-eta-ic{display:inline-block;animation:nkEtaLat 2.6s ease-in-out infinite}
@keyframes nkEtaLat{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.2) rotate(-10deg)}}
.nkpdf-eta.calc .nk-eta-num{background:linear-gradient(90deg,rgba(255,255,255,.25),rgba(255,255,255,.9),rgba(255,255,255,.25)) 0/120px 100% no-repeat;-webkit-background-clip:text;background-clip:text;color:transparent;animation:nkTlShimmer 1.3s linear infinite}
.nkpdf-eta.menos1h{border-color:rgba(74,222,128,.6)!important;color:#bbf7d0!important;background:rgba(34,197,94,.18)!important;box-shadow:0 0 14px rgba(74,222,128,.45)}
.nkpdf-eta.listo{border-color:rgba(74,222,128,.7)!important;color:#bbf7d0!important;background:rgba(34,197,94,.22)!important}
.nkpdf-etapop{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;width:min(310px,90vw);padding:14px;border-radius:16px;background:linear-gradient(150deg,#0b1535,#1e1b4b 60%,#312e81);border:1px solid rgba(168,85,247,.5);box-shadow:0 18px 40px rgba(2,6,23,.6);color:#e2e8f0;font-weight:600;font-size:.78rem;z-index:20;animation:nkEtaPop .32s cubic-bezier(.34,1.4,.64,1);cursor:default}
@keyframes nkEtaPop{from{opacity:0;transform:translateX(-50%) translateY(-8px) scale(.94)}to{opacity:1;transform:translateX(-50%)}}
.nkpdf-etapop h5{margin:0 0 8px;font-size:.95rem;font-weight:800;color:#fff}
.nkpdf-etapop .f{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.nkpdf-etapop .f b{color:#a5f3fc;text-align:right}
.nkpdf-etapop .n{margin-top:8px;color:#a5b4fc;font-size:.7rem;line-height:1.35}
.nkpdf-etapop .mb{height:6px;border-radius:6px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:6px}.nkpdf-etapop .mb i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22d3ee,#a855f7);transition:width .7s cubic-bezier(.22,1,.36,1)}
@media (max-width:760px){.nkpdf-bar{gap:6px;padding:6px 8px}.nkpdf-txt{display:none}.nkpdf-prog{min-width:90px}.nkpdf-hint{display:none}.nkpdf-eta .nk-eta-ful{display:none}}
@media (prefers-reduced-motion:reduce){.nkpdf-eta .nk-eta-ic,.nkpdf-eta.calc .nk-eta-num,.nkpdf-etapop{animation:none!important}}
@media (prefers-reduced-motion:reduce){.nkpdf *{animation:none!important;transition:none!important}.nkpdf-pop,.nkpdf-toast{animation:none!important}}`;
    document.head.appendChild(st);
  }

  // ---------- persistencia (Supabase con RLS; sin sesión, localStorage) ----------
  async function usuarioId() {
    try { const c = cliente(); if (!c || !c.auth) return null; const { data } = await c.auth.getSession(); return (data && data.session && data.session.user && data.session.user.id) || null; } catch (_) { return null; }
  }
  const lsKey = (k, f) => `nika_pdf_${k}_${f}`;
  const lsGet = (k, f, def) => { try { const v = localStorage.getItem(lsKey(k, f)); return v ? JSON.parse(v) : def; } catch (_) { return def; } };
  const lsSet = (k, f, v) => { try { localStorage.setItem(lsKey(k, f), JSON.stringify(v)); } catch (_) {} };

  async function cargarMarcas(fileId) {
    const uid = await usuarioId(); S.uid = uid;
    if (!uid) { S.marcas = lsGet('hl', fileId, []); S.prog = lsGet('prog', fileId, null); return; }
    const c = cliente();
    try {
      const [a, b] = await Promise.all([
        c.from('pdf_subrayados').select('id,pagina,color,texto,rects').eq('file_id', fileId).order('created_at'),
        c.from('pdf_progreso').select('ultima_pagina,total_paginas,leidas').eq('file_id', fileId).maybeSingle(),
      ]);
      S.marcas = (a.data || []).map((m) => ({ id: m.id, pagina: m.pagina, color: m.color, texto: m.texto, rects: m.rects }));
      S.prog = b.data || null;
      S.remoto = !a.error;
    } catch (_) { S.marcas = lsGet('hl', fileId, []); S.prog = lsGet('prog', fileId, null); }
  }

  async function guardarMarca(m) {
    if (S.uid && S.remoto !== false) {
      try {
        const { data, error } = await cliente().from('pdf_subrayados').insert({ file_id: S.fileId, pagina: m.pagina, color: m.color, texto: m.texto, rects: m.rects }).select('id').single();
        if (!error && data) { m.id = data.id; return; }
        if (error && error.code === '23514' && !S.avisoColor) { S.avisoColor = true; aviso('Ese color se guardó solo en este dispositivo (falta activar los colores libres en tu cuenta)'); }
      } catch (_) {}
    }
    m.id = m.id || ('l' + Date.now() + Math.random().toString(36).slice(2, 6)); m.local = true;
    lsSet('hl', S.fileId, S.marcas.filter((x) => x.local));
  }
  async function borrarMarca(m) {
    if (m.id && !m.local && S.uid) { try { await cliente().from('pdf_subrayados').delete().eq('id', m.id); } catch (_) {} }
    lsSet('hl', S.fileId, S.marcas.filter((x) => x.local && x !== m));
  }

  let _t = null;
  async function persistir(s) {
    if (!s || !s.n) return;
    const p = { ultima_pagina: s.actual, total_paginas: s.n, leidas: Array.from(s.leidas).sort((a, b) => a - b) };
    s.prog = p;
    if (window.NikaTiempo && s.tl) window.NikaTiempo.guardar(s.tl, s.actual, !!s.cerrando);
    const avisar = () => { try { document.dispatchEvent(new CustomEvent('nika-pdf-progreso')); } catch (_) {} };
    if (s.uid && s.remoto !== false) {
      try { await cliente().from('pdf_progreso').upsert({ file_id: s.fileId, titulo: s.title, ...p, updated_at: new Date().toISOString() }, { onConflict: 'user_id,file_id' }); avisar(); return; } catch (_) {}
    }
    lsSet('prog', s.fileId, p); avisar();
  }
  function guardarProgreso() {
    clearTimeout(_t);
    const s = S; _t = setTimeout(() => { if (S === s) persistir(s); }, 1500);
  }

  // ---------- render ----------
  const esTrazo = (m) => !!(m.rects && m.rects[0] && m.rects[0].t === 'p');
  function dTrazo(pts, W, H) { return pts.map((q, i) => (i ? 'L' : 'M') + (q[0] * W).toFixed(1) + ' ' + (q[1] * H).toFixed(1)).join(' ') + (pts.length === 1 ? ' l0.01 0' : ''); }
  function pintarMarcas(pg) {
    const capa = pg.el.querySelector('.nk-hl'); if (!capa) return;
    capa.innerHTML = '';
    const W = pg.el.offsetWidth || parseFloat(pg.el.style.width) || 1, H = pg.el.offsetHeight || parseFloat(pg.el.style.height) || 1;
    const trazos = [];
    S.marcas.filter((m) => m.pagina === pg.num).forEach((m) => {
      (m.rects || []).forEach((r) => {
        if (r.t === 'p') { trazos.push([m, r]); return; }
        const i = document.createElement('i');
        i.style.cssText = `left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%;background:${colorDe(m.color)}`;
        capa.appendChild(i);
      });
    });
    if (trazos.length) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H);
      trazos.forEach(([m, r]) => {
        const pa = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pa.setAttribute('d', dTrazo(r.p, W, H)); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', colorDe(m.color));
        pa.setAttribute('stroke-width', Math.max(1, r.w * W)); pa.setAttribute('stroke-linecap', 'round'); pa.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(pa);
      });
      capa.appendChild(svg);
    }
  }
  function repintarTodas() { S.pags.forEach((pg) => { if (pg.hecho) pintarMarcas(pg); }); panel(); }

  async function renderizar(pg) {
    if (pg.hecho || pg.cargando || !S) return;
    pg.cargando = true; const tok = S.tok;
    try {
      const page = await S.pdf.getPage(pg.num);
      if (!S || S.tok !== tok) return;
      const vp = page.getViewport({ scale: S.escala });
      pg.el.style.width = vp.width + 'px'; pg.el.style.height = vp.height + 'px';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cv = pg.el.querySelector('canvas'); cv.width = Math.floor(vp.width * dpr); cv.height = Math.floor(vp.height * dpr);
      pg.tarea = page.render({ canvasContext: cv.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      await pg.tarea.promise; pg.tarea = null;
      if (!S || S.tok !== tok) return;
      const tx = pg.el.querySelector('.nk-tx'); tx.innerHTML = '';
      const contenido = await page.getTextContent();
      if (S.tl) S.tl.chars[pg.num] = contenido.items.reduce((a, it) => a + (it.str ? it.str.length : 0), 0);
      await window.pdfjsLib.renderTextLayer({ textContentSource: contenido, container: tx, viewport: vp, textDivs: [] }).promise;
      pg.hecho = true; pintarMarcas(pg); if (window.NikaPdfAnot) window.NikaPdfAnot.pintar(S, pg); marcarLeida(pg);
    } catch (e) { if (!(e && e.name === 'RenderingCancelledException')) console.warn('[NikaPdf] página', pg.num, e && e.message ? e.message : e); }
    pg.cargando = false;
  }
  function liberar(pg) {
    if (!pg.hecho && !pg.cargando) return;
    if (pg.tarea) { try { pg.tarea.cancel(); } catch (_) {} pg.tarea = null; }
    const cv = pg.el.querySelector('canvas'); cv.width = 1; cv.height = 1;
    pg.el.querySelector('.nk-tx').innerHTML = ''; pg.hecho = false; pg.cargando = false;
  }

  function marcarLeida(pg) {
    const b = pg.el.querySelector('.nk-leida');
    if (S.leidas.has(pg.num) && !b) { const d = document.createElement('div'); d.className = 'nk-leida'; d.textContent = '✓ Leída'; pg.el.appendChild(d); }
    else if (!S.leidas.has(pg.num) && b) b.remove();
  }

  function actualizarBarra() {
    const n = S.n, l = S.leidas.size, pct = n ? Math.round((l / n) * 100) : 0;
    $('.nkpdf-prog i b', S.root).style.width = pct + '%';
    $('.nkpdf-prog span', S.root).textContent = `${l}/${n} págs · ${pct}%`;
    const inp = $('.nkpdf-pag', S.root); if (inp && document.activeElement !== inp) inp.value = S.actual;
    const bl = $('.nkpdf-leer', S.root); if (bl) { bl.classList.toggle('on', S.leidas.has(S.actual)); $('.nkpdf-txt', bl).textContent = S.leidas.has(S.actual) ? 'Leída' : 'Marcar leída'; }
    const z = $('.nkpdf-zoom', S.root); if (z) z.textContent = Math.round(S.escala * 100) + '%';
    actualizarEta();
    if (S.n && S.leidas.size >= S.n && S.leidas.size > (S.leidas0 || 0) && !S.fcAvisado) { const sx = S; setTimeout(() => { if (S === sx) cartelFlashcards(sx, true, sx.root); }, 1400); }
    const c = $('.nkpdf-cnt', S.root); if (c) { c.textContent = S.marcas.length; c.style.display = S.marcas.length ? '' : 'none'; }
  }

  // ---------- colores favoritos y paleta ----------
  function htmlFavoritos() {
    const f = favoritos();
    return f.map((c, i) => `<button class="nkpdf-col${c === S.color ? ' on' : ''}" data-color="${c}" data-n="${i + 1}" style="background:${c}" aria-label="Color favorito ${i + 1}"></button>`).join('')
      + '<button class="nkpdf-col nkpdf-mas" data-accion="paleta" aria-label="Más colores y favoritos" aria-haspopup="true">＋</button>';
  }
  function pintarFavoritos() { const g = $('.nkpdf-favs', S.root); if (g) { g.innerHTML = htmlFavoritos(); marcarColor(); } }
  function paleta(btn) {
    const ya = $('.nkpdf-paleta', S.root); if (ya) { ya.remove(); return; }
    cerrarPop(); const mi = S; let f = favoritos(), slot = Math.max(0, f.indexOf(mi.color));
    const p = document.createElement('div'); p.className = 'nkpdf-paleta'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Colores favoritos');
    const dibujar = () => {
      p.innerHTML = `<h5>🎨 Tus 6 colores favoritos</h5><p>Tocá uno para usarlo. Para cambiarlo, dejalo marcado y elegí un color de abajo: queda guardado para la próxima.</p>
        <div class="pl-slots">${f.map((c, i) => `<button type="button" class="pl-s${i === slot ? ' on' : ''}" data-slot="${i}" style="background:${c}" aria-label="Favorito ${i + 1}">${i + 1}</button>`).join('')}</div>
        <div class="pl-grid">${PALETA.map((c) => `<button type="button" class="pl-c" data-c="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div>
        <div class="pl-pie"><label>Color propio <input type="color" class="pl-pick" value="${f[slot]}"></label><button type="button" class="pl-rest">Restaurar</button><button type="button" class="pl-ok">Listo</button></div>`;
    };
    const poner = (c) => { f[slot] = c.toLowerCase(); guardarFavs(f); mi.color = f[slot]; pintarFavoritos(); if (mi.modo !== 'sub' && mi.modo !== 'pincel') modo('sub'); dibujar(); };
    dibujar();
    p.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.slot != null) { slot = +b.dataset.slot; mi.color = f[slot]; marcarColor(); dibujar(); }
      else if (b.dataset.c) poner(b.dataset.c);
      else if (b.classList.contains('pl-rest')) { f = FAV_DEF.slice(); guardarFavs(f); mi.color = f[slot]; pintarFavoritos(); dibujar(); }
      else if (b.classList.contains('pl-ok')) cierra();
    });
    p.addEventListener('input', (e) => { if (e.target.classList.contains('pl-pick')) { f[slot] = e.target.value.toLowerCase(); guardarFavs(f); mi.color = f[slot]; pintarFavoritos(); const sl = $('.pl-s.on', p); if (sl) sl.style.background = f[slot]; } });
    const rr = mi.root.getBoundingClientRect(), br = btn.getBoundingClientRect();
    mi.root.appendChild(p);
    p.style.top = (br.bottom - rr.top + 8) + 'px'; p.style.left = Math.max(8, Math.min(rr.width - p.offsetWidth - 8, br.left - rr.left - 20)) + 'px';
    const fuera = (ev) => { if (!p.contains(ev.target) && !btn.contains(ev.target)) cierra(); };
    function cierra() { p.remove(); document.removeEventListener('pointerdown', fuera, true); }
    setTimeout(() => document.addEventListener('pointerdown', fuera, true), 0);
  }

  // ---------- limpiar marcas (por página, rango, color o todo) con doble confirmación ----------
  async function borrarLote(lista) {
    S.marcas = S.marcas.filter((m) => !lista.includes(m)); repintarTodas(); actualizarBarra();
    const ids = lista.filter((m) => m.id && !m.local).map((m) => m.id);
    if (S.uid && ids.length) { for (let i = 0; i < ids.length; i += 100) { try { await cliente().from('pdf_subrayados').delete().in('id', ids.slice(i, i + 100)); } catch (_) {} } }
    lsSet('hl', S.fileId, S.marcas.filter((x) => x.local));
  }
  async function restaurarLote(lista) {
    for (const o of lista) { const m = { pagina: o.pagina, color: o.color, texto: o.texto, rects: o.rects }; S.marcas.push(m); await guardarMarca(m); }
    repintarTodas(); actualizarBarra();
  }
  function limpiar() {
    if (!S) return; const ya = $('.nkpdf-lim', S.root); if (ya) { ya.remove(); return; }
    cerrarPop(); const mi = S;
    const cfg = { alcance: 'pagina', de: mi.actual, a: mi.actual, colores: null, sub: true, trazo: true };
    const ov = document.createElement('div'); ov.className = 'nkpdf-lim'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Limpiar marcas');
    const sel = () => mi.marcas.filter((m) => {
      if (cfg.alcance === 'pagina' && m.pagina !== mi.actual) return false;
      if (cfg.alcance === 'rango' && (m.pagina < Math.min(cfg.de, cfg.a) || m.pagina > Math.max(cfg.de, cfg.a))) return false;
      if (cfg.colores && !cfg.colores.has(colorDe(m.color))) return false;
      return esTrazo(m) ? cfg.trazo : cfg.sub;
    });
    const coloresDoc = () => [...new Set(mi.marcas.map((m) => colorDe(m.color)))];
    const resumen = (l) => { const t = l.filter(esTrazo).length, s = l.length - t, pags = new Set(l.map((m) => m.pagina)).size; return l.length ? `${l.length} ${l.length === 1 ? 'marca' : 'marcas'} (${s} subrayados, ${t} trazos) en ${pags} ${pags === 1 ? 'página' : 'páginas'}` : ''; };
    const paso1 = () => {
      const cd = coloresDoc(); if (!cfg.colores) cfg.colores = new Set(cd);
      const l = sel();
      ov.innerHTML = `<div><h4>🧹 Limpiar marcas</h4><p class="sub">Elegí qué querés borrar. Antes de borrar te pido confirmar.</p>
        <label class="op${cfg.alcance === 'pagina' ? ' on' : ''}"><input type="radio" name="al" value="pagina" ${cfg.alcance === 'pagina' ? 'checked' : ''}> Solo esta página (la ${mi.actual})</label>
        <label class="op${cfg.alcance === 'rango' ? ' on' : ''}"><input type="radio" name="al" value="rango" ${cfg.alcance === 'rango' ? 'checked' : ''}> Un rango de páginas: de <input type="number" min="1" max="${mi.n}" value="${cfg.de}" data-r="de"> a <input type="number" min="1" max="${mi.n}" value="${cfg.a}" data-r="a"></label>
        <label class="op${cfg.alcance === 'todo' ? ' on' : ''}"><input type="radio" name="al" value="todo" ${cfg.alcance === 'todo' ? 'checked' : ''}> Todo el documento</label>
        <div class="sub" style="margin:10px 0 2px">Colores a borrar (tocá para sacar uno)</div>
        <div class="cols">${cd.map((c) => `<button type="button" data-col="${c}" class="${cfg.colores.has(c) ? '' : 'off'}" style="background:${c}" aria-label="Color ${c}"></button>`).join('') || '<span class="sub">No hay marcas todavía.</span>'}</div>
        <div class="tipos"><label class="ck"><input type="checkbox" data-t="sub" ${cfg.sub ? 'checked' : ''}> Subrayados de texto</label><label class="ck"><input type="checkbox" data-t="trazo" ${cfg.trazo ? 'checked' : ''}> Trazos de pincel</label></div>
        <div class="cuenta${l.length ? '' : ' cero'}">${l.length ? 'Se borrarían ' + resumen(l) : 'No hay marcas con esos filtros.'}</div>
        <div class="acc"><button type="button" data-a="cancelar">Cancelar</button><button type="button" class="go" data-a="seguir" ${l.length ? '' : 'disabled'}>Continuar →</button></div></div>`;
    };
    const paso2 = () => {
      const l = sel(), grande = cfg.alcance === 'todo' || l.length >= 20;
      ov.innerHTML = `<div><h4>⚠️ ¿Seguro que querés borrar?</h4>
        <div class="peligro">Vas a borrar <b>${resumen(l)}</b>${cfg.alcance === 'todo' ? ' de <b>todo el documento</b>' : cfg.alcance === 'rango' ? ` (páginas ${Math.min(cfg.de, cfg.a)} a ${Math.max(cfg.de, cfg.a)})` : ''}.<br>Después vas a tener 15 segundos para deshacerlo.</div>
        ${grande ? '<div class="sub" style="margin:0">Para confirmar, escribí <b>BORRAR</b>:</div><input type="text" data-conf placeholder="BORRAR" autocomplete="off" spellcheck="false">'
          : '<label class="ck" style="display:flex;gap:7px;align-items:center;cursor:pointer"><input type="checkbox" data-conf2> Sí, quiero borrar estas marcas</label>'}
        <div class="acc"><button type="button" data-a="volver">← Volver</button><button type="button" class="del" data-a="borrar" disabled>🗑 Borrar definitivamente</button></div></div>`;
      const btn = $('[data-a="borrar"]', ov), t = $('[data-conf]', ov), c = $('[data-conf2]', ov);
      const ok = () => { btn.disabled = t ? t.value.trim().toUpperCase() !== 'BORRAR' : !(c && c.checked); };
      if (t) { t.addEventListener('input', ok); setTimeout(() => t.focus(), 50); } if (c) c.addEventListener('change', ok);
    };
    ov.addEventListener('click', async (e) => {
      if (e.target === ov) { ov.remove(); return; }
      const col = e.target.closest('[data-col]'); if (col) { const c = col.dataset.col; if (cfg.colores.has(c)) cfg.colores.delete(c); else cfg.colores.add(c); paso1(); return; }
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'cancelar') ov.remove();
      else if (b.dataset.a === 'seguir') paso2();
      else if (b.dataset.a === 'volver') paso1();
      else if (b.dataset.a === 'borrar') {
        const l = sel(); ov.remove(); if (!l.length) return;
        const copia = l.map((m) => ({ pagina: m.pagina, color: m.color, texto: m.texto, rects: m.rects }));
        await borrarLote(l);
        toast(`Se borraron ${l.length} ${l.length === 1 ? 'marca' : 'marcas'}`, 'Deshacer', async () => { await restaurarLote(copia); aviso('Marcas restauradas'); });
      }
    });
    ov.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'al') { cfg.alcance = t.value; paso1(); }
      else if (t.dataset.t) { cfg[t.dataset.t] = t.checked; paso1(); }
      else if (t.dataset.r) { cfg[t.dataset.r] = Math.max(1, Math.min(mi.n, +t.value || 1)); cfg.alcance = 'rango'; paso1(); }
    });
    paso1(); mi.root.appendChild(ov);
  }

  // ---------- explicaciones al pasar el mouse por los botones ----------
  const TIPS = {
    m_sel: { t: 'Seleccionar', k: 'V', d: 'Elegí texto del PDF para subrayarlo con el color activo. También podés tocar un subrayado para cambiarle el color, copiarlo o borrarlo.' },
    m_sub: { t: 'Subrayar', k: 'H', d: 'Subraya el texto que selecciones, al instante. Solo prolijo en PDFs con texto. 💡 El Pincel funciona mejor y sirve en cualquier PDF.' },
    m_pincel: { t: 'Pincel', k: 'P', rec: 1, d: 'Marcá a mano alzada, con cualquier PDF (también escaneados). Es más preciso y más vistoso que Subrayar, por eso lo recomendamos. Ajustá el grosor con el deslizador.', n: 'Mantené Mayús o activá «Línea recta» para trazar rectas.' },
    m_bor: { t: 'Goma', k: 'E', d: 'Pasala por encima de lo marcado y se quita cada marca que toques. Para borrar muchas juntas usá 🧹 Limpiar.' },
    m_texto: { t: 'Texto sobre el PDF', k: 'T', d: 'Tocá un lugar de la página y escribí una nota. Podés moverla, cambiarle la letra y el color.' },
    m_pin: { t: 'Marcador con nota', k: 'M', d: 'Pone un 📌 en un punto exacto y abre una nota atada a ese lugar. Se sincroniza con tus Notas de lectura.' },
    a_limpiar: { t: 'Limpiar marcas', d: 'Borra muchas marcas de una vez: solo esta página, un rango de páginas o todo el documento, y se puede filtrar por color o tipo. Siempre te pide confirmar y podés deshacer 15 segundos.' },
    a_undo: { t: 'Deshacer', k: 'Ctrl+Z', d: 'Vuelve atrás la última marca, borrado o cambio de color.' },
    a_redo: { t: 'Rehacer', k: 'Ctrl+Y', d: 'Repite lo último que deshiciste.' },
    a_supr: { t: 'Borrar marca', k: 'Supr', d: 'Borra la marca que tenés seleccionada (tocala antes). Para borrar varias, usá la Goma o 🧹 Limpiar.' },
    a_lapiz: { t: 'Solo lápiz', d: 'Ideal para tablets: con el dedo movés la página y solo el lápiz dibuja o escribe. Así no marcás sin querer al hacer scroll.' },
    a_recta: { t: 'Línea recta', d: 'El Pincel traza una recta perfecta desde donde empezás. Muy útil para subrayar renglones con prolijidad. También funciona manteniendo Mayús.' },
    a_zm: { t: 'Alejar', k: '−', d: 'Reduce el tamaño de la página para ver más contenido.' },
    a_zp: { t: 'Acercar', k: '+', d: 'Agranda la página, útil para leer letra chica o marcar con más precisión.' },
    a_ajustar: { t: 'Ajustar al ancho', d: 'Adapta la página al ancho disponible de la pantalla.' },
    a_leer: { t: 'Marcar página leída', d: 'Marca o desmarca esta página como leída. También se marca sola cuando te quedás unos segundos en ella. Alimenta tu progreso y el tiempo estimado.' },
    a_eta: { t: 'Tiempo restante', d: 'Cuánto te falta para terminar este PDF según tu ritmo real de lectura. Tocalo para ver el detalle y la hora estimada de fin.' },
    a_notas: { t: 'Notas de lectura', d: 'Abrí un cuaderno al costado para tomar notas mientras leés. Se guardan en Mis notas.' },
    a_lista: { t: 'Mis subrayados', d: 'Lista de todo lo que marcaste en este PDF. Tocá una para ir a esa página.' },
    a_drive: { t: 'Visor de Drive', d: 'Abre este archivo con el visor original de Google Drive, sin herramientas de marcado.' },
    a_atajos: { t: 'Atajos de teclado', k: '?', d: 'Todas las teclas rápidas del lector.' },
    a_fs: { t: 'Pantalla completa', k: 'F', d: 'Lee a pantalla completa. Salís con el mismo botón o con Esc.' },
    paleta: { t: 'Más colores', d: 'Elegí entre muchos colores y armá tu propia paleta de 6 favoritos para tenerlos siempre a mano.' },
    color: { t: 'Color favorito', d: 'Es el color con el que subrayás y pintás. Usá las teclas 1 a 6 para cambiar rápido. Con ＋ cambiás cuáles son tus favoritos.' },
    rango: { t: 'Tamaño', k: '[  ]', d: 'Grosor del Pincel y de la Goma. Movés la barra o escribís el número (2 a 120 px) y Enter. También con las teclas [ y ].' },
    pag: { t: 'Ir a una página', d: 'Escribí un número de página y tocá Enter para saltar directo.' },
    prog: { t: 'Tu avance', d: 'Páginas leídas sobre el total. Se guarda en tu cuenta y se sincroniza entre dispositivos.' },
  };
  function tipDe(b) {
    if (b.dataset.modo) return TIPS['m_' + b.dataset.modo];
    if (b.dataset.accion === 'paleta') return TIPS.paleta;
    if (b.dataset.accion) return TIPS['a_' + b.dataset.accion];
    if (b.classList.contains('nkpdf-col')) { const t = Object.assign({}, TIPS.color); t.k = b.dataset.n; return t; }
    if (b.classList.contains('nkpdf-rango') || b.classList.contains('nkpdf-num')) return TIPS.rango;
    if (b.classList.contains('nkpdf-pag')) return TIPS.pag;
    if (b.closest('.nkpdf-prog')) return TIPS.prog;
    return null;
  }
  function tooltips(mi) {
    const bar = $('.nkpdf-bar', mi.root); let tip = null, t = null;
    const ocultar = () => { clearTimeout(t); if (tip) { const x = tip; tip = null; x.classList.remove('on'); setTimeout(() => x.remove(), 180); } };
    const mostrar = (el) => {
      if (S !== mi) return;
      const quitar = el.getAttribute('title'); if (quitar) { el.dataset.tipTitulo = quitar; el.removeAttribute('title'); }
      let d = tipDe(el); if (!d && el.dataset.tipTitulo) d = { t: el.textContent.trim() || 'Ayuda', d: el.dataset.tipTitulo };
      if (!d) return; ocultar();
      const x = document.createElement('div'); x.className = 'nkpdf-tip'; x.setAttribute('role', 'tooltip');
      x.innerHTML = `<b>${esc(d.t)}${d.k ? '<kbd>' + esc(d.k) + '</kbd>' : ''}${d.rec ? '<span class="rec">⭐ Recomendado</span>' : ''}</b>${esc(d.d)}${d.n ? '<i>' + esc(d.n) + '</i>' : ''}`;
      mi.root.appendChild(x); tip = x;
      const rr = mi.root.getBoundingClientRect(), br = el.getBoundingClientRect();
      x.style.top = (br.bottom - rr.top + 10) + 'px';
      x.style.left = Math.max(8, Math.min(rr.width - x.offsetWidth - 8, br.left - rr.left + br.width / 2 - x.offsetWidth / 2)) + 'px';
      requestAnimationFrame(() => x.classList.add('on'));
    };
    const objetivo = (e) => e.target.closest && e.target.closest('button, .nkpdf-rango, .nkpdf-num, .nkpdf-pag, .nkpdf-prog');
    bar.addEventListener('pointerover', (e) => { if (e.pointerType !== 'mouse') return; const el = objetivo(e); if (!el || !bar.contains(el)) return; clearTimeout(t); t = setTimeout(() => mostrar(el), 280); });
    bar.addEventListener('pointerout', (e) => { if (e.pointerType !== 'mouse') return; const el = objetivo(e); if (el && !el.contains(e.relatedTarget)) ocultar(); });
    bar.addEventListener('focusin', (e) => { const el = objetivo(e); if (el && e.target.matches(':focus-visible')) mostrar(el); });
    bar.addEventListener('focusout', ocultar);
    bar.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') { ocultar(); return; }
      const el = objetivo(e); if (!el) return; clearTimeout(t); t = setTimeout(() => { mostrar(el); t = setTimeout(ocultar, 4500); }, 520);   // en el celular: mantené apretado para ver la ayuda
    });
    ['pointerup', 'pointercancel', 'pointermove'].forEach((ev) => bar.addEventListener(ev, (e) => { if (e.pointerType !== 'mouse' && ev !== 'pointerup') clearTimeout(t); }));
    mi.scroll.addEventListener('scroll', ocultar, { passive: true });
  }

  // ---------- cartel para repasar con flashcards ----------
  function statsSesion(s) {
    let p = 0, seg = 0;
    if (s.tl) Object.values(s.tl.tp).forEach((v) => { if (window.NikaTiempo && window.NikaTiempo.valido(v)) { p++; seg += v; } });
    return { paginas: p, minutos: seg / 60 };
  }
  function cartelFlashcards(s, completo, host) {
    if (!window.NikaCartelFC || s.fcAvisado) return;
    const st = statsSesion(s);
    s.fcAvisado = true;
    window.NikaCartelFC.mostrar({ fileId: s.fileId, titulo: s.title, paginas: st.paginas, minutos: st.minutos, completo, host });
  }

  // ---------- tiempo estimado (chip de la barra + panel) ----------
  function actualizarEta() {
    if (!S || !S.tl || !window.NikaTiempo || !S.root) return;
    const T = window.NikaTiempo, b = $('.nkpdf-eta', S.root); if (!b) return;
    const e = T.estimarSesion(S.tl, S.leidas, S.n); if (!e) return;
    S.eta = e; const num = $('.nk-eta-num', b), ful = $('.nk-eta-ful', b);
    b.classList.remove('calc');
    if (!e.restantes) { b.classList.add('listo'); b.classList.remove('menos1h'); T.pintar(num, '¡Terminado!'); if (ful) ful.textContent = ''; }
    else {
      b.classList.remove('listo'); b.classList.toggle('menos1h', e.seg < 3600);
      T.pintar(num, (e.fuente === 'estandar' ? '~' : '') + T.fmt(e.seg)); if (ful) ful.textContent = 'restantes';
    }
    const p = $('.nkpdf-etapop', S.root); if (p) rellenarEta(p);
  }
  function rellenarEta(p) {
    const T = window.NikaTiempo, e = S.eta; if (!e) return;
    const t = e.tasa >= 60 ? (Math.floor(e.tasa / 60) + ' min ' + String(Math.round(e.tasa % 60)).padStart(2, '0') + ' s') : (Math.round(e.tasa) + ' s');
    p.querySelector('[data-r]').innerHTML = `<h5>⏱ ${e.restantes ? 'Te quedan ~' + T.fmt(e.seg) : '¡Terminaste este PDF!'}</h5>
      <div class="f"><span>Páginas pendientes</span><b>${e.restantes} de ${S.n}</b></div>
      <div class="f"><span>Tu ritmo</span><b>${t} por página</b></div>
      ${e.restantes ? `<div class="f"><span>Si seguís de corrido, terminás</span><b>${T.fmtFin(e.seg)}</b></div>` : ''}
      <div class="f"><span>Hoy leíste</span><b data-hoy></b></div><div class="mb"><i data-mb></i></div>
      <div class="n">${esc(T.fuenteTxt(e))}${e.nMedidas ? ' · ' + e.nMedidas + ' págs medidas' : ''}. Se recalcula solo cada 30 s mientras leés.</div>`;
    T.racha().then((r) => {
      const h = p.querySelector('[data-hoy]'), m = p.querySelector('[data-mb]'); if (!h || !m) return;
      h.textContent = Math.round(r.hoy / 60) + ' / ' + Math.round(r.meta / 60) + ' min' + (r.racha ? ' · 🔥 ' + r.racha + (r.racha === 1 ? ' día' : ' días') : '');
      requestAnimationFrame(() => { m.style.width = Math.min(100, Math.round(r.hoy / r.meta * 100)) + '%'; });
    });
  }
  function panelEta(b) {
    const ya = $('.nkpdf-etapop', S.root);
    if (ya) { ya.remove(); b.setAttribute('aria-expanded', 'false'); return; }
    if (!S.eta) { aviso('Todavía no hay datos: leé unas páginas y se calcula solo'); return; }
    const p = document.createElement('div'); p.className = 'nkpdf-etapop'; p.innerHTML = '<div data-r></div>';
    b.parentNode.appendChild(p); b.setAttribute('aria-expanded', 'true'); rellenarEta(p);
    const cierra = (ev) => { if (!p.contains(ev.target) && !b.contains(ev.target)) { p.remove(); b.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', cierra, true); } };
    setTimeout(() => document.addEventListener('pointerdown', cierra, true), 0);
  }

  function paginaActual() {
    const sc = S.scroll, r = sc.getBoundingClientRect(); let mejor = S.actual, area = -1;
    S.pags.forEach((pg) => {
      const b = pg.el.getBoundingClientRect(); const v = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top);
      if (v > area) { area = v; mejor = pg.num; }
    });
    return mejor;
  }

  function irA(n, suave) {
    n = Math.max(1, Math.min(S.n, n | 0)); const pg = S.pags[n - 1]; if (!pg) return;
    S.scroll.scrollTo({ top: pg.el.offsetTop - 10, behavior: suave ? 'smooth' : 'auto' });
  }

  function reconstruir() {
    // cambia el zoom: se vuelve a dimensionar y dibujar todo conservando la página actual
    const actual = S.actual; S.tok++;
    S.pags.forEach((pg) => { if (pg.tarea) { try { pg.tarea.cancel(); } catch (_) {} pg.tarea = null; } });
    S.pags.forEach((pg) => { pg.hecho = false; pg.cargando = false; pg.el.style.width = S.base.w * S.escala + 'px'; pg.el.style.height = S.base.h * S.escala + 'px'; });
    S.pags.forEach((pg) => S.io.unobserve(pg.el)); S.pags.forEach((pg) => S.io.observe(pg.el));
    actualizarBarra();
    requestAnimationFrame(() => irA(actual));
  }
  function ajustarAncho() {
    if (!S) return;
    const ancho = Math.max(280, S.scroll.clientWidth - 28);
    S.escala = Math.max(0.6, Math.min(2.6, ancho / S.base.w)); reconstruir();
  }


  // ---------- toque sobre marcas (texto, áreas y trazos) ----------
  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function tocaMarca(m, W, H, px, py, rpx) {
    return (m.rects || []).some((r) => {
      if (r.t === 'p') {
        const half = r.w * W / 2 + rpx; const P = r.p;
        if (P.length === 1) return Math.hypot(px - P[0][0] * W, py - P[0][1] * H) <= half;
        for (let i = 1; i < P.length; i++) if (distSeg(px, py, P[i - 1][0] * W, P[i - 1][1] * H, P[i][0] * W, P[i][1] * H) <= half) return true;
        return false;
      }
      return px >= r.x * W - rpx && px <= (r.x + r.w) * W + rpx && py >= r.y * H - rpx && py <= (r.y + r.h) * H + rpx;
    });
  }
  const marcasEn = (pg, px, py, rpx) => S.marcas.filter((m) => m.pagina === pg.num && tocaMarca(m, pg.el.offsetWidth, pg.el.offsetHeight, px, py, rpx));

  // ---------- pincel (trazo libre, tamaño ajustable) y borrador de arrastre ----------
  function paginaBajo(e) { return S.pags.find((p) => p.el.contains(e.target)); }
  function desplazarConDedo(e) {   // «Solo lápiz»: con touch-action:none el navegador no desplaza, así que lo hacemos a mano
    let y0 = e.clientY; const sc = S.scroll;
    const mv = (ev) => { sc.scrollTop -= ev.clientY - y0; y0 = ev.clientY; };
    const fin = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  }
  function iniciarTrazo(e, mi) {
    if (S !== mi || e.button) return;
    if (S.soloLapiz && e.pointerType === 'touch' && (S.modo === 'pincel' || S.modo === 'bor')) return desplazarConDedo(e);
    const pg = paginaBajo(e); if (!pg || !pg.hecho) return;
    const sparse = pg.el.querySelectorAll('.nk-tx span').length < 8;
    const modoPincel = S.modo === 'pincel' || (S.modo === 'sub' && sparse);
    if (S.modo === 'bor') return borrarArrastrando(e, mi, pg);
    if (!modoPincel) return;
    e.preventDefault(); cerrarPop();
    const b0 = pg.el.getBoundingClientRect(); const W = b0.width, H = b0.height;
    const norm = (ev) => [Math.min(1, Math.max(0, (ev.clientX - b0.left) / W)), Math.min(1, Math.max(0, (ev.clientY - b0.top) / H))];
    const pts = [norm(e)];
    const live = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); live.setAttribute('class', 'nk-live'); live.setAttribute('width', W); live.setAttribute('height', H);
    const pa = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', colorDe(S.color));
    pa.setAttribute('stroke-width', S.tam); pa.setAttribute('stroke-linecap', 'round'); pa.setAttribute('stroke-linejoin', 'round'); live.appendChild(pa); pg.el.appendChild(live);
    const dibujar = () => pa.setAttribute('d', dTrazo(pts, W, H));
    dibujar();
    const mover = (ev) => {
      const q = norm(ev), u = pts[pts.length - 1];
      if (Math.hypot((q[0] - u[0]) * W, (q[1] - u[1]) * H) < 1.5) return;
      if (ev.shiftKey || S.recta) { pts.length = 1; }               // con Mayús (o el botón Línea recta): recta desde el inicio
      pts.push(q); dibujar();
    };
    const fin = async (ev) => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      live.remove(); if (S !== mi) return;
      const lim = [pts[0]]; for (let i = 1; i < pts.length; i++) { const u = lim[lim.length - 1]; if (Math.hypot((pts[i][0] - u[0]) * W, (pts[i][1] - u[1]) * H) >= 2.5 || i === pts.length - 1) lim.push(pts[i]); }
      const m = { pagina: pg.num, color: colorGuardar(S.color), texto: 'Trazo de pincel', rects: [{ t: 'p', w: S.tam / W, p: lim.map((q) => [+q[0].toFixed(4), +q[1].toFixed(4)]) }] };
      S.marcas.push(m); reg({ t: 'add', ms: [m] }); pintarMarcas(pg); actualizarBarra(); panel(); await guardarMarca(m);
    };
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  }

  function borrarArrastrando(e, mi, pg0) {
    e.preventDefault(); cerrarPop();
    const quitadas = [];
    const pasar = (ev) => {
      const pg = S.pags.find((p) => { const b = p.el.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom; }) || pg0;
      const b = pg.el.getBoundingClientRect(); const hit = marcasEn(pg, ev.clientX - b.left, ev.clientY - b.top, S.tam / 2);
      if (!hit.length) return;
      hit.forEach((m) => { quitadas.push(m); });
      S.marcas = S.marcas.filter((m) => !hit.includes(m)); pintarMarcas(pg); actualizarBarra(); panel();
    };
    pasar(e);
    const mover = (ev) => pasar(ev);
    const fin = async () => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      if (quitadas.length) reg({ t: 'del', ms: quitadas.slice() });
      for (const m of quitadas) await borrarMarca(m);
    };
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  }

  // aro que muestra el tamaño del pincel/borrador siguiendo al cursor
  // vista previa de lo que se va a colocar (📌 o caja de texto) siguiendo al cursor, para que se sienta la herramienta antes de tocar
  function moverFantasma(e) {
    const f = $('.nkpdf-fantasma', S.root); if (!f) return;
    const r = $('.nkpdf-cuerpo', S.root).getBoundingClientRect();
    const sobrePagina = S.pags.some((p) => p.el.contains(e.target)) && !(e.target.closest && e.target.closest('.nk-an > *'));
    if (!(S.modo === 'pin' || S.modo === 'texto') || e.pointerType === 'touch' || !sobrePagina || e.clientX > r.right - 6 || e.clientX < r.left || e.clientY < r.top || e.clientY > r.bottom) { f.style.display = 'none'; return; }
    f.className = 'nkpdf-fantasma ' + S.modo; f.textContent = S.modo === 'pin' ? '📌' : 'Escribí acá…';
    f.style.display = 'block'; f.style.left = (e.clientX - r.left) + 'px'; f.style.top = (e.clientY - r.top) + 'px';
  }
  function moverAro(e) {
    if (!S) return; moverFantasma(e); const aro = $('.nkpdf-aro', S.root); if (!aro) return;
    if (!(S.modo === 'pincel' || S.modo === 'bor')) { aro.style.display = 'none'; return; }
    const r = $('.nkpdf-cuerpo', S.root).getBoundingClientRect();
    if (e.clientX > r.right - 6 || e.clientX < r.left || e.clientY < r.top || e.clientY > r.bottom) { aro.style.display = 'none'; return; }
    aro.style.display = 'block'; aro.style.width = aro.style.height = S.tam + 'px';
    aro.style.left = (e.clientX - r.left) + 'px'; aro.style.top = (e.clientY - r.top) + 'px';
    aro.style.background = S.modo === 'pincel' ? colorDe(S.color) + '66' : 'rgba(248,113,113,.25)';
  }

  // ---------- pasar al visor de Drive y volver ----------
  function quitarVolver() { document.querySelectorAll('.nkpdf-volver').forEach((b) => b.remove()); }
  function mostrarVolver(wrapper) {
    quitarVolver();
    const toggle = document.getElementById('nika-modo-visor'); if (toggle && toggle.style.display !== 'none' && toggle.children.length) return;   // ya hay selector en el encabezado
    const b = document.createElement('button'); b.type = 'button'; b.className = 'nkpdf-volver'; b.innerHTML = '📖 Abrir con el lector NikaMed';
    b.addEventListener('click', () => { b.remove(); if (ultimoOp) abrir(ultimoOp); });
    wrapper.appendChild(b);
  }
  function aDrive() {
    const mi = S; if (!mi) return; const f = mi.fallback, w = mi.wrapper; const ifr = $('iframe', w);
    cerrar(); if (ifr) ifr.style.display = '';
    if (f) f('manual');
    mostrarVolver(w);
  }

  // ---------- subrayar / borrar ----------
  function cerrarPop() { const p = $('.nkpdf-pop'); if (p) p.remove(); }
  function popover(x, y, html, alClick) {
    cerrarPop();
    const p = document.createElement('div'); p.className = 'nkpdf-pop'; p.innerHTML = html;
    p.style.left = Math.max(8, Math.min(window.innerWidth - 230, x - 100)) + 'px'; p.style.top = Math.max(8, y) + 'px';
    p.addEventListener('mousedown', (e) => e.preventDefault());
    p.addEventListener('click', (e) => { const t = e.target.closest('[data-c],[data-x]'); if (t) alClick(t); });
    (document.fullscreenElement || document.body).appendChild(p);
  }

  function recolectar() {
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const rango = sel.getRangeAt(0);
    if (!S.scroll.contains(rango.commonAncestorContainer)) return null;
    const texto = sel.toString().replace(/\s+/g, ' ').trim(); if (!texto) return null;
    const porPagina = new Map();
    Array.from(rango.getClientRects()).forEach((r) => {
      if (r.width < 2 || r.height < 2) return;
      const pg = S.pags.find((p) => { const b = p.el.getBoundingClientRect(); const cy = r.top + r.height / 2, cx = r.left + r.width / 2; return cy >= b.top && cy <= b.bottom && cx >= b.left && cx <= b.right; });
      if (!pg) return;
      const b = pg.el.getBoundingClientRect();
      const q = { x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: r.width / b.width, h: r.height / b.height };
      if (!porPagina.has(pg.num)) porPagina.set(pg.num, []);
      porPagina.get(pg.num).push(q);
    });
    return porPagina.size ? { sel, rango, texto, porPagina } : null;
  }

  async function aplicarSubrayado(d, color) {
    const nuevas = [];
    d.porPagina.forEach((rects, num) => { nuevas.push({ pagina: num, color, texto: d.texto.slice(0, 600), rects }); });
    cerrarPop(); d.sel.removeAllRanges();
    if (nuevas.length) reg({ t: 'add', ms: nuevas });
    for (const m of nuevas) {
      S.marcas.push(m); const pg = S.pags[m.pagina - 1]; if (pg) pintarMarcas(pg);
      await guardarMarca(m);
    }
    actualizarBarra(); panel();
  }

  function seleccion() {
    if (!S || S.modo === 'bor' || S.modo === 'pincel') return;
    const d = recolectar(); if (!d) return;
    if (S.modo === 'sub') { aplicarSubrayado(d, colorGuardar(S.color)); return; }
    const fin = d.rango.getBoundingClientRect();
    popover(fin.left + fin.width / 2, fin.bottom + 8,
      favoritos().map((c) => `<span class="c" data-c="${c}" title="Subrayar con este color" style="background:${c}"></span>`).join('') + '<button class="x" data-x="cancelar">✕</button>',
      (t) => { if (t.dataset.x) { cerrarPop(); return; } S.color = t.dataset.c; marcarColor(); aplicarSubrayado(d, colorGuardar(t.dataset.c)); });
  }

  // ---------- deshacer / rehacer ----------
  function botonesUndo() {
    if (!S) return;
    const u = $('[data-accion="undo"]', S.root), r = $('[data-accion="redo"]', S.root);
    if (u) u.disabled = !S.undo.length; if (r) r.disabled = !S.redo.length;
  }
  function reg(a) { S.undo.push(a); if (S.undo.length > 100) S.undo.shift(); S.redo = []; botonesUndo(); }
  async function quitarMs(ms) { S.marcas = S.marcas.filter((x) => !ms.includes(x)); repintarTodas(); actualizarBarra(); for (const m of ms) await borrarMarca(m); }
  async function ponerMs(ms) { ms.forEach((m) => { delete m.id; delete m.local; S.marcas.push(m); }); repintarTodas(); actualizarBarra(); for (const m of ms) await guardarMarca(m); }
  async function fijarColor(m, c) {
    m.color = c; repintarTodas();
    if (m.id && !m.local && S.uid) { try { await cliente().from('pdf_subrayados').update({ color: c }).eq('id', m.id); } catch (_) {} }
    else lsSet('hl', S.fileId, S.marcas.filter((x) => x.local));
  }
  async function aplicar(a, dir) {      // dir: 1 = rehacer, -1 = deshacer
    if (a.t === 'add') return dir < 0 ? quitarMs(a.ms) : ponerMs(a.ms);
    if (a.t === 'del') return dir < 0 ? ponerMs(a.ms) : quitarMs(a.ms);
    if (a.t === 'color') return fijarColor(a.m, dir < 0 ? a.de : a.a);
  }
  async function deshacer() {
    if (!S || !S.undo.length) { aviso('No hay nada para deshacer'); return; }
    const a = S.undo.pop(); S.redo.push(a); botonesUndo(); S.sel = null; await aplicar(a, -1); aviso('Deshecho');
  }
  async function rehacer() {
    if (!S || !S.redo.length) { aviso('No hay nada para rehacer'); return; }
    const a = S.redo.pop(); S.undo.push(a); botonesUndo(); S.sel = null; await aplicar(a, 1); aviso('Rehecho');
  }
  function aviso(t) {
    if (!S) return; let a = $('.nkpdf-aviso', S.root); if (!a) { a = document.createElement('div'); a.className = 'nkpdf-aviso'; S.root.appendChild(a); }
    a.textContent = t; a.classList.add('on'); clearTimeout(a._t); a._t = setTimeout(() => a.classList.remove('on'), 1400);
  }
  const ATAJOS = [['V', 'Seleccionar'], ['H', 'Subrayar'], ['P / A', 'Pincel'], ['E', 'Borrador'], ['T', 'Texto sobre el PDF'], ['M', 'Marcador 📌 con nota'], ['1 – 6', 'Tus colores favoritos'], ['[  ]', 'Tamaño del pincel y borrador'],
    ['Mayús (al trazar)', 'Línea recta desde donde empezás'], ['Ctrl + Z', 'Deshacer'], ['Ctrl + Y', 'Rehacer'], ['Supr', 'Borrar la marca seleccionada (tocala antes)'],
    ['Esc', 'Cerrar menú / deseleccionar'], ['+  −', 'Acercar / alejar'], ['F', 'Pantalla completa'], ['?', 'Ver esta ayuda']];
  function atajos() {
    if (!S) return; const ya = $('.nkpdf-atajos', S.root); if (ya) { ya.remove(); return; }
    const d = document.createElement('div'); d.className = 'nkpdf-atajos';
    d.innerHTML = '<div><h4><span>⌨ Atajos de teclado</span><button aria-label="Cerrar">✕</button></h4>' + ATAJOS.map((a) => `<p><kbd>${esc(a[0])}</kbd><span>${esc(a[1])}</span></p>`).join('') + '</div>';
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('button')) d.remove(); });
    S.root.appendChild(d);
  }
  async function eliminar(m) {
    reg({ t: 'del', ms: [m] }); if (S.sel === m) S.sel = null;
    S.marcas = S.marcas.filter((x) => x !== m); repintarTodas(); actualizarBarra(); await borrarMarca(m);
  }

  function clickEnMarca(e) {
    if (S && (S.modo === 'texto' || S.modo === 'pin')) {
      const pg0 = paginaBajo(e);
      if (pg0 && pg0.hecho && !e.target.closest('.nk-an > *') && window.NikaPdfAnot && !(S.soloLapiz && e.pointerType === 'touch')) window.NikaPdfAnot.colocar(S, e, pg0, S.modo);
      return;
    }
    if (!S || !window.getSelection().isCollapsed) return;
    if (S.modo === 'bor' || S.modo === 'pincel') return;
    const pg = paginaBajo(e); if (!pg) { cerrarPop(); return; }
    const b = pg.el.getBoundingClientRect();
    const hit = marcasEn(pg, e.clientX - b.left, e.clientY - b.top, 3); const m = hit[hit.length - 1];
    if (!m) { cerrarPop(); return; }
    S.sel = m;
    if (S.modo === 'sub') return;
    const conTexto = m.texto && !esTrazo(m) && !m.area;
    popover(e.clientX, e.clientY + 10,
      favoritos().map((c) => `<span class="c" data-c="${c}" title="Cambiar a este color" style="background:${c}"></span>`).join('') + (conTexto ? '<button class="x" data-x="copiar">📋 Copiar</button>' : '') + '<button class="x" data-x="borrar">🗑 Borrar</button>',
      async (t) => {
        cerrarPop();
        if (t.dataset.x === 'borrar') { eliminar(m); return; }
        if (t.dataset.x === 'copiar') { try { await navigator.clipboard.writeText(m.texto); } catch (_) {} return; }
        if (t.dataset.c && colorDe(t.dataset.c) !== colorDe(m.color)) {
          const nuevo = colorGuardar(t.dataset.c);
          reg({ t: 'color', m, de: m.color, a: nuevo }); await fijarColor(m, nuevo);
        }
      });
  }

  // ---------- modos, colores, panel ----------
  const AYUDA = {
    sel: 'Seleccioná texto para subrayarlo · tocá un subrayado para cambiarle el color o borrarlo',
    sub: 'Modo subrayar: lo que selecciones se subraya al instante · en páginas escaneadas (sin texto) funciona como pincel',
    pincel: 'Pincel: arrastrá para marcar a mano alzada (consejo: mantené Mayús, o activá el botón Línea recta, para trazar una recta desde donde empezás) · ajustá el tamaño con el deslizador o con [ y ] · sirve en cualquier PDF, también escaneados',
    texto: 'Texto: tocá un lugar de la página y escribí · arrastrá ⠿ para moverlo · el círculo violeta cambia el ancho · usá la barra oscura para letra, color, etiquetas, compartir o borrar',
    pin: 'Marcador: tocá un lugar de la página y se abre una nota atada a ese punto · después tocá el 📌 para leerla o editarla · se sincroniza con tus Notas de lectura',
    bor: 'Borrador: pasalo por encima de lo marcado (texto, pincel o áreas) para quitarlo · ajustá el tamaño con el deslizador o con [ y ]',
  };
  function modo(m) {
    S.modo = m; cerrarPop();
    S.root.classList.remove('m-sel', 'm-sub', 'm-bor', 'm-area', 'm-pincel', 'm-texto', 'm-pin'); if (S.modo !== 'texto' && window.NikaPdfAnot) window.NikaPdfAnot.deseleccionar(); const aro0 = $('.nkpdf-aro', S.root); if (aro0) aro0.style.display = 'none'; S.root.classList.add('m-' + m); const fan = $('.nkpdf-fantasma', S.root); if (fan) fan.style.display = 'none';
    S.root.querySelectorAll('[data-modo]').forEach((b) => b.classList.toggle('on', b.dataset.modo === m));
    const h = $('.nkpdf-hint span', S.root); if (h) h.textContent = AYUDA[m];
  }
  function marcarColor() {
    S.root.querySelectorAll('[data-color]').forEach((b) => b.classList.toggle('on', b.dataset.color === S.color));
  }
  function panel(forzar) {
    const p = $('.nkpdf-panel', S.root); if (!p) return;
    if (typeof forzar === 'boolean') { S.panelAbierto = forzar; p.classList.toggle('on', forzar); S.root.querySelector('[data-accion="lista"]').classList.toggle('on', forzar); }
    if (!S.panelAbierto) return;
    const lista = $('.nkpdf-lista', p);
    const ms = S.marcas.slice().sort((a, b) => a.pagina - b.pagina);
    lista.innerHTML = ms.length ? '' : '<div class="nkpdf-vacio">Todavía no subrayaste nada en este archivo.<br>Elegí la herramienta 🖍 Subrayar y seleccioná un texto.</div>';
    ms.forEach((m) => {
      const it = document.createElement('div'); it.className = 'nkpdf-item'; it.style.setProperty('--c', colorDe(m.color));
      it.innerHTML = `<small><span>Página ${m.pagina}</span><button title="Borrar subrayado">🗑</button></small><p>${esc(m.texto || (esTrazo(m) ? 'Trazo de pincel' : m.area ? 'Área marcada' : ''))}</p>`;
      it.addEventListener('click', (e) => { if (e.target.closest('button')) { eliminar(m); return; } irA(m.pagina, true); });
      lista.appendChild(it);
    });
  }

  // ---------- pantalla completa ----------
  function contenedor() { return S && S.wrapper.closest('#nika-inline-viewer-container'); }
  function enPantalla() { const c = contenedor(); return !!(c && (document.fullscreenElement === c || c.classList.contains('nkpdf-fsfix'))); }
  function actualizarFs(reajustar) {
    if (!S) return;
    const on = enPantalla();
    const b = $('[data-accion="fs"]', S.root); if (b) { b.innerHTML = (on ? ICO.fsx : ICO.fs) + `<span class="nkpdf-txt">${on ? 'Salir' : 'Pantalla completa'}</span>`; b.classList.toggle('on', on); }
    const fb = document.getElementById('nika-fs-btn'); if (fb) fb.innerText = on ? 'Restaurar Pantalla' : 'Pantalla Completa';
    if (reajustar) setTimeout(() => { if (S) ajustarAncho(); }, 250);
  }
  function pantalla() {
    const c = contenedor(); if (!c) return;
    if (document.fullscreenElement === c) { document.exitFullscreen().catch(() => {}); return; }
    if (c.classList.contains('nkpdf-fsfix')) { quitarFicticia(c); actualizarFs(true); return; }
    if (c.requestFullscreen) c.requestFullscreen().catch(() => ficticia(c)); else ficticia(c);
  }
  function ficticia(c) {          // respaldo (iOS u otros sin Fullscreen API): capa fija por encima de todo
    c.dataset.estilo = c.getAttribute('style') || ''; c.classList.add('nkpdf-fsfix', 'is-fs');
    c.style.cssText += ';position:fixed;inset:0;width:100vw;height:100dvh;margin:0;border-radius:0;z-index:2147483000;background:#fff';
        actualizarFs(true);
  }
  function quitarFicticia(c) {
    c.classList.remove('nkpdf-fsfix', 'is-fs'); c.setAttribute('style', c.dataset.estilo || '');
      }
  document.addEventListener('fullscreenchange', () => { if (S) actualizarFs(true); });

  // ---------- UI ----------
  function toast(texto, boton, alClick) {
    const t = document.createElement('div'); t.className = 'nkpdf-toast';
    t.innerHTML = `<span>${esc(texto)}</span><button>${esc(boton)}</button><button class="z" aria-label="Cerrar">✕</button>`;
    t.querySelector('button').addEventListener('click', () => { alClick(); t.remove(); });
    t.querySelector('.z').addEventListener('click', () => t.remove());
    S.root.appendChild(t); setTimeout(() => t.remove(), 14000);
  }

  function mensaje(root, html) {
    let m = $('.nkpdf-msg', root); if (!m) { m = document.createElement('div'); m.className = 'nkpdf-msg'; root.appendChild(m); }
    m.innerHTML = html; return m;
  }

  // Pantalla de carga: el robot Nika explica qué se está haciendo y por qué demora (más si el archivo pesa mucho)
  const ROBOT = '<svg viewBox="0 0 200 230" aria-hidden="true"><defs><linearGradient id="nkrB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#eef2f7"/><stop offset="1" stop-color="#cdd7e3"/></linearGradient><linearGradient id="nkrV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16395f"/><stop offset="1" stop-color="#08162b"/></linearGradient></defs><ellipse cx="100" cy="222" rx="36" ry="6.5" fill="#020617" opacity=".25"/><g class="rb-bq"><path d="M62 134 C48 136 38 152 40 172 C41 183 53 185 59 176 C66 162 68 146 68 138 Z" fill="url(#nkrB)" stroke="#c4d0dd" stroke-width="1.6"/></g><g class="rb-bs"><path d="M138 134 C152 136 162 152 160 172 C159 183 147 185 141 176 C134 162 132 146 132 138 Z" fill="url(#nkrB)" stroke="#c4d0dd" stroke-width="1.6"/></g><path d="M62 152 C62 130 80 122 100 122 C120 122 138 130 138 152 C138 184 124 208 100 208 C76 208 62 184 62 152 Z" fill="url(#nkrB)" stroke="#c4d0dd" stroke-width="1.6"/><circle cx="100" cy="190" r="6.5" fill="#38bdf8"/><path d="M100 186v8M96 190h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><rect x="22" y="64" width="19" height="40" rx="9.5" fill="#cfd8e3" stroke="#b3c0ce" stroke-width="1.4"/><rect x="159" y="64" width="19" height="40" rx="9.5" fill="#cfd8e3" stroke="#b3c0ce" stroke-width="1.4"/><rect x="32" y="38" width="136" height="90" rx="42" fill="url(#nkrB)" stroke="#c4d0dd" stroke-width="1.6"/><rect x="45" y="52" width="110" height="64" rx="30" fill="url(#nkrV)"/><path class="rb-ojo" d="M66 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path class="rb-ojo" d="M106 92 a14 14 0 0 1 28 0 Z" fill="#35e0f7"/><path class="rb-boca" d="M91 99 Q100 112 109 99 Q100 103 91 99 Z" fill="#35e0f7" stroke="#35e0f7" stroke-width="2" stroke-linejoin="round"/></svg>';
  const fmtMB = (b) => b >= 1e9 ? (b / 1e9).toFixed(2).replace('.', ',') + ' GB' : Math.round(b / 1e6) + ' MB';
  function cargaUI(root) {
    root.querySelector('.nkpdf-msg')?.remove();
    const m = document.createElement('div'); m.className = 'nkpdf-msg';
    m.innerHTML = `<div class="nkpdf-carga"><div class="nkpdf-robot">${ROBOT}</div><span class="nkpdf-peso" hidden></span><div class="nkpdf-globo" aria-live="polite"><span>¡Hola! Soy Nika 🤖 Estoy conectando con Drive para traerte el PDF…</span></div><div class="nkpdf-barra"><b></b></div><div class="nkpdf-stat">Conectando…</div></div>`;
    root.appendChild(m);
    const q = (s) => m.querySelector(s);
    const globo = q('.nkpdf-globo span'), barra = q('.nkpdf-barra b'), stat = q('.nkpdf-stat'), peso = q('.nkpdf-peso');
    const CONECTA = ['¡Hola! Soy Nika 🤖 Estoy conectando con Drive para traerte el PDF…', 'Buscando tu archivo en Drive 🔎', 'Ya casi: pidiendo el archivo al servidor…', 'Tu progreso y tus marcas se guardan solos en tu cuenta ✨', 'Consejo: el Pincel marca mejor que Subrayar y sirve en cualquier PDF 🖍️'];
    const GENERAL = ['Descargando tu PDF… ya falta menos 📥', 'Tip: con las teclas 1 a 6 cambiás de color rápido 🎨', 'Tip: el botón ⏱ te dice cuánto te falta para terminar este PDF', 'Tip: con 🧹 Limpiar borrás marcas por página, rango o color', 'Mientras esperás, estirá un poco el cuello 😄'];
    let frases = CONECTA, k = 0, timer = null, anim = null, t0 = Date.now(), tot = 0, real = 0, falso = 2, tope = 24, fase = 'conecta', n = 0;
    const decir = (t) => { globo.parentNode.style.animation = 'none'; void globo.offsetWidth; globo.parentNode.style.animation = ''; globo.textContent = t; };
    const rotar = () => { if (!m.isConnected) { clearInterval(timer); clearInterval(anim); return; } if (!frases.length) return; k = (k + 1) % frases.length; decir(frases[k]); };
    // la barra nunca se queda quieta: avanza despacito hacia un tope según la fase y la descarga real la empuja cuando hay datos
    const pintar = () => {
      if (!m.isConnected) { clearInterval(anim); return; }
      falso += (tope - falso) * 0.035;
      barra.style.width = Math.max(3, Math.min(100, Math.max(real, falso))) + '%';
      if (fase === 'conecta') stat.textContent = 'Conectando con Drive… ' + Math.round((Date.now() - t0) / 1000) + ' s';
    };
    timer = setInterval(rotar, 3400); anim = setInterval(pintar, 300); pintar();
    return {
      tamano(total) {
        tot = total; fase = 'baja'; tope = 92;
        const mb = total / 1e6, cl = mb < 25 ? 0 : mb < 120 ? 1 : mb < 500 ? 2 : 3;
        peso.hidden = false; peso.className = 'nkpdf-peso' + (cl === 2 ? ' p2' : cl === 3 ? ' p3' : '');
        peso.textContent = (['⚡ Archivo liviano', '📦 Archivo mediano', '🐘 Archivo pesado', '🏔️ Libro enorme'][cl]) + ' · ' + fmtMB(total);
        const fr = {
          0: ['Es liviano: en unos segundos lo tenés listo ⚡', 'Lo descargo completo para que puedas subrayar, marcar y guardar tu progreso.'],
          1: ['Pesa ' + fmtMB(total) + ': lo bajo entero a tu dispositivo para que después se mueva sin trabarse.', 'Con el PDF ya descargado, subrayar y pasar de página es instantáneo ✨', 'Tus marcas y tu progreso se guardan solos en tu cuenta.'],
          2: ['Este PDF pesa ' + fmtMB(total) + ': demora un poco más, pero vale la pena 🐘', 'Lo descargo completo de Drive porque el lector necesita tener todas las páginas para dejarte subrayar y buscar.', 'Mientras tanto, tomá agua 💧'],
          3: ['¡Este es un libro enorme (' + fmtMB(total) + ')! 🏔️ Puede tardar varios minutos según tu internet.', 'Lo bajo entero para que todas las páginas queden disponibles y puedas subrayarlas.', 'Mejor en compu y con buena conexión.'],
        }[cl];
        frases = fr.concat(GENERAL); k = 0; decir(fr[0]);
        if (cl >= 2 && !(navigator.deviceMemory > 4) && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) frases.push('Estás en el celular: si se cierra por falta de memoria, probá en una compu o con un capítulo más chico.');
      },
      avance(bytes) {
        n = bytes; if (fase === 'conecta') { fase = 'baja'; tope = tot ? 92 : 88; frases = GENERAL; k = -1; rotar(); }
        const seg = Math.max(0.5, (Date.now() - t0) / 1000), vel = bytes / seg;
        real = tot ? Math.min(98, bytes / tot * 100) : 0;
        const p = Math.max(real, falso);
        const falta = vel > 0 && tot ? Math.ceil((tot - bytes) / vel) : 0;
        const eta = falta > 90 ? 'unos ' + Math.ceil(falta / 60) + ' min' : falta > 0 ? falta + ' s' : '';
        stat.textContent = tot ? `${Math.round(real)}% · ${fmtMB(bytes)} de ${fmtMB(tot)} · ${(vel / 1e6).toFixed(1).replace('.', ',')} MB/s` + (eta && real < 99 ? ' · faltan ' + eta : '') : fmtMB(bytes) + ' descargados · ' + (vel / 1e6).toFixed(1).replace('.', ',') + ' MB/s';
      },
      armando() { fase = 'arma'; tope = 99.5; real = Math.max(real, 92); clearInterval(timer); frases = ['¡Listo! Estoy preparando las páginas… 📖', 'Acomodando tus subrayados y tu progreso ✨', 'Último paso: armando el visor 🚀']; k = 0; decir(frases[0]); timer = setInterval(rotar, 2200); stat.textContent = 'Abriendo el visor'; },
      fin() { clearInterval(timer); clearInterval(anim); },
    };
  }

  async function abrir(op) {
    cerrar(); css(); ultimoOp = op; quitarVolver();
    const { wrapper, fileId, title, fallback } = op;
    const fbAzul = document.getElementById('nika-fs-btn'); if (fbAzul) fbAzul.style.display = 'none';   // el lector trae su propio botón de pantalla completa
    const iframe = $('iframe', wrapper); if (iframe) iframe.style.display = 'none';
    const root = document.createElement('div'); root.className = 'nkpdf m-sel'; wrapper.appendChild(root);
    const ui = cargaUI(root);
    S = { root, fileId, title, wrapper, fallback, tok: 1, escala: 1, leidas: new Set(), marcas: [], pags: [], actual: 1, segs: 0, uid: null, modo: 'sel', color: favoritos()[0], panelAbierto: false, tam: 16, undo: [], redo: [], sel: null, recta: false };
    const mi = S;
    const volver = (motivo) => { ui.fin(); if (S !== mi) return; const f = mi.fallback; cerrar(); if (iframe) iframe.style.display = ''; if (f) f(motivo); };
    try {
      await cargarLib();
      // PDF subido a Drive: descarga directa. Presentaciones y documentos de Google (nativos): se exportan a PDF.
      const base = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`;
      let resp = await fetch(`${base}?alt=media&key=${API_KEY}`);
      if (!resp.ok) resp = await fetch(`${base}/export?mimeType=application%2Fpdf&key=${API_KEY}`);
      if (!resp.ok) throw new Error('drive ' + resp.status);
      const total = Number(resp.headers.get('content-length') || 0);
      if (total > 2e9) { try { resp.body && resp.body.cancel(); } catch (_) {} throw new Error('archivo demasiado grande para el lector'); }   // por encima de 2 GB el navegador no lo aguanta en memoria: se ve con el visor de Drive
      if (total) ui.tamano(total);
      let buf;
      if (total && resp.body && resp.body.getReader) {
        // descarga con progreso (los libros pesados tardan): se arma directo en un solo bloque de memoria
        try { buf = new Uint8Array(total); } catch (_) { throw new Error('sin memoria para el archivo'); }
        let n = 0, ult = 0; const rd = resp.body.getReader();
        for (;;) {
          const { done, value } = await rd.read(); if (done) break;
          if (S !== mi) { try { rd.cancel(); } catch (_) {} return; }
          if (n + value.length > buf.length) { const g = new Uint8Array(n + value.length); g.set(buf.subarray(0, n)); buf = g; }
          buf.set(value, n); n += value.length;
          const ahora = Date.now(); if (ahora - ult > 200) { ult = ahora; ui.avance(n); }
        }
        ui.avance(n);
        if (n !== buf.length) buf = buf.subarray(0, n);
      } else buf = new Uint8Array(await resp.arrayBuffer());
      ui.armando();
      if (String.fromCharCode(buf[0], buf[1], buf[2], buf[3]) !== '%PDF') throw new Error('no es un PDF');
      if (S !== mi) return;
      mi.pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      mi.n = mi.pdf.numPages;
      await cargarMarcas(fileId);
      if (S !== mi) return;
      mi.leidas = new Set((mi.prog && mi.prog.leidas) || []);
      if (mi.prog && mi.prog.total_paginas === 0 && mi.leidas.size) mi.leidas = new Set(Array.from({ length: mi.n }, (_, i) => i + 1));   // marcado como leído a mano desde la lista
      mi.leidas0 = mi.leidas.size;
      if (window.NikaTiempo) { try { window.NikaTiempo.css(); mi.tl = window.NikaTiempo.nuevo(fileId, mi.n); await window.NikaTiempo.cargar(mi.tl); } catch (_) {} }
      const p1 = await mi.pdf.getPage(1); const v1 = p1.getViewport({ scale: 1 });
      const ancho = Math.max(280, wrapper.clientWidth - 28);
      mi.escala = Math.max(0.6, Math.min(1.8, ancho / v1.width)); mi.base = { w: v1.width, h: v1.height };
      ui.fin(); armar(mi);
    } catch (e) {
      if (S === mi) volver(e && e.message);
    }
  }

  function armar(mi) {
    const root = mi.root; root.innerHTML = '';
    root.insertAdjacentHTML('beforeend', `
      <div class="nkpdf-bar">
        <div class="nkpdf-grupo" role="toolbar" aria-label="Herramientas">
          <button data-modo="sel" class="on" title="Seleccionar (V)">${ICO.sel}<span class="nkpdf-txt">Seleccionar</span></button>
          <button data-modo="sub" title="Subrayar (H)">${ICO.sub}<span class="nkpdf-txt">Subrayar</span></button>
          <button data-modo="pincel" title="Pincel (P) · marca a mano alzada, sirve en PDFs escaneados">${ICO.pincel}<span class="nkpdf-txt">Pincel</span></button>
          <button data-modo="bor" title="Borrador (E)">${ICO.bor}<span class="nkpdf-txt">Borrar</span></button>
          <button data-accion="limpiar" title="Limpiar marcas">🧹<span class="nkpdf-txt">Limpiar</span></button>
          <button data-modo="texto" title="Escribir texto sobre el PDF (T): tocá donde quieras escribir">📝<span class="nkpdf-txt">Texto</span></button>
          <button data-modo="pin" title="Marcador 📌 (M): tocá la página y se abre una nota atada a ese lugar">📌<span class="nkpdf-txt">Marcador</span></button>
        </div>
        <div class="nkpdf-grupo" aria-label="Edición">
          <button data-accion="undo" title="Deshacer (Ctrl+Z)" disabled>↶<span class="nkpdf-txt">Deshacer</span></button>
          <button data-accion="redo" title="Rehacer (Ctrl+Y)" disabled>↷<span class="nkpdf-txt">Rehacer</span></button>
          <button data-accion="supr" title="Borrar la marca seleccionada (Supr). Tocá una marca para seleccionarla">🗑<span class="nkpdf-txt">Borrar marca</span></button>
          <button data-accion="lapiz" title="Solo lápiz (tablets): con el dedo se mueve la página y solo el lápiz dibuja o escribe">✍️<span class="nkpdf-txt">Solo lápiz</span></button>
          <button data-accion="recta" title="Línea recta: el pincel traza una recta desde donde empezás (también con Mayús)">📏<span class="nkpdf-txt">Línea recta</span></button>
        </div>
        <div class="nkpdf-grupo nkpdf-favs" aria-label="Colores favoritos">${htmlFavoritos()}</div>
        <div class="nkpdf-grupo nkpdf-tam" title="Tamaño del pincel y del borrador ( [ y ] )"><span style="font-size:.7rem">Tamaño</span><input type="range" class="nkpdf-rango" min="4" max="64" value="${mi.tam}" aria-label="Tamaño"><input type="number" class="nkpdf-num" min="2" max="120" step="1" inputmode="numeric" value="${mi.tam}" aria-label="Tamaño en píxeles (podés escribir el valor)"><em>px</em></div>
        <div class="nkpdf-grupo">
          <button data-accion="zm" title="Alejar (−)">−</button><span class="nkpdf-zoom">100%</span><button data-accion="zp" title="Acercar (+)">＋</button>
          <button data-accion="ajustar" title="Ajustar al ancho">${ICO.ajustar}</button>
        </div>
        <div class="nkpdf-grupo"><span class="nkpdf-pagtxt">pág. <input class="nkpdf-pag" type="number" min="1" max="${mi.n}" value="1" aria-label="Ir a la página"> / ${mi.n}</span>
          <button class="nkpdf-leer" data-accion="leer" title="Marcar esta página como leída">${ICO.ok}<span class="nkpdf-txt">Marcar leída</span></button></div>
        <div class="nkpdf-prog" title="Tu avance de lectura"><i><b></b></i><span></span></div>
        <div class="nkpdf-grupo" style="position:relative"><button class="nkpdf-eta calc" data-accion="eta" title="Tiempo estimado para terminar este PDF" aria-expanded="false"><span class="nk-eta-ic">⏱</span><span class="nk-eta-num">calculando…</span><span class="nk-eta-ful">restantes</span></button></div>
        <div class="nkpdf-grupo"><button data-accion="notas" class="nkpdf-notas" title="Tomar notas mientras leés (se guardan en Mis notas)">📒<span class="nkpdf-txt">Notas</span></button></div>
        <span class="nkpdf-sep"></span>
        <div class="nkpdf-grupo">
          <button data-accion="lista" title="Mis subrayados">${ICO.lista}<span class="nkpdf-txt">Subrayados</span><span class="nkpdf-cnt" style="display:none">0</span></button>
          <button data-accion="drive" title="Ver este archivo con el visor de Drive">${ICO.drive}<span class="nkpdf-txt">Visor Drive</span></button>
          <button data-accion="atajos" title="Atajos de teclado (?)">⌨<span class="nkpdf-txt">Atajos</span></button>
          <button data-accion="fs" title="Pantalla completa (F)">${ICO.fs}<span class="nkpdf-txt">Pantalla completa</span></button>
        </div>
        <div class="nkpdf-hint"><span>${AYUDA.sel}</span></div>
      </div>
      <div class="nkpdf-cuerpo">
        <div class="nkpdf-scroll"></div>
        <i class="nkpdf-aro"></i><i class="nkpdf-fantasma" aria-hidden="true"></i>
        <aside class="nkpdf-panel" aria-label="Mis subrayados"><h4><span>📝 Mis subrayados</span><button data-accion="cerrar-lista" aria-label="Cerrar">✕</button></h4><div class="nkpdf-lista"></div></aside>
      </div>`);
    mi.scroll = $('.nkpdf-scroll', root);
    tooltips(mi);
    for (let i = 1; i <= mi.n; i++) {
      const el = document.createElement('div'); el.className = 'nk-pg'; el.dataset.p = i;
      el.style.width = mi.base.w * mi.escala + 'px'; el.style.height = mi.base.h * mi.escala + 'px';
      el.innerHTML = '<canvas></canvas><div class="nk-hl"></div><div class="nk-tx"></div><div class="nk-an"></div><span class="nk-num">' + i + '</span>';
      mi.scroll.appendChild(el); mi.pags.push({ num: i, el, hecho: false, cargando: false });
    }
    mi.io = new IntersectionObserver((es) => {
      es.forEach((en) => { const pg = mi.pags[+en.target.dataset.p - 1]; if (en.isIntersecting) renderizar(pg); else liberar(pg); });
    }, { root: mi.scroll, rootMargin: '700px 0px' });
    mi.pags.forEach((pg) => mi.io.observe(pg.el));

    // actividad para el reloj de lectura (si no tocás ni scrolleás por un rato, no cuenta)
    if (mi.tl) ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => mi.scroll.addEventListener(ev, () => window.NikaTiempo.tocar(mi.tl), { passive: true }));
    mi.scroll.addEventListener('pointerdown', (e) => iniciarTrazo(e, mi));
    mi.scroll.addEventListener('pointermove', moverAro);
    mi.scroll.addEventListener('pointerleave', () => { const a = $('.nkpdf-aro', mi.root); if (a) a.style.display = 'none'; const f = $('.nkpdf-fantasma', mi.root); if (f) f.style.display = 'none'; });
    const rango = $('.nkpdf-rango', root), num = $('.nkpdf-num', root);
    // el tamaño se puede mover con la barra o escribir con números (2 a 120 px); ambos campos quedan sincronizados
    const fijarTam = (v, origen) => { v = Math.max(2, Math.min(120, Math.round(+v) || mi.tam)); mi.tam = v; if (origen !== 'r') rango.value = Math.min(64, v); if (origen !== 'n') num.value = v; };
    mi.fijarTam = fijarTam;
    rango.addEventListener('input', () => fijarTam(rango.value, 'r'));
    num.addEventListener('input', () => { const v = +num.value; if (v >= 2 && v <= 120) fijarTam(v, 'n'); });
    num.addEventListener('change', () => fijarTam(num.value));
    num.addEventListener('keydown', (e) => { if (e.key === 'Enter') { fijarTam(num.value); num.blur(); } e.stopPropagation(); });
    num.addEventListener('wheel', (e) => { if (document.activeElement === num) { e.preventDefault(); fijarTam(mi.tam + (e.deltaY < 0 ? 1 : -1)); } }, { passive: false });
    mi.scroll.addEventListener('mouseup', () => setTimeout(seleccion, 10));
    mi.scroll.addEventListener('touchend', () => setTimeout(seleccion, 350));
    mi.scroll.addEventListener('click', clickEnMarca);
    mi.scroll.addEventListener('scroll', () => { cerrarPop(); const a = paginaActual(); if (a !== mi.actual) { mi.actual = a; mi.segs = 0; actualizarBarra(); guardarProgreso(); } }, { passive: true });

    const zoom = (d) => { const i = ESCALAS.reduce((b, v, k) => (Math.abs(v - mi.escala) < Math.abs(ESCALAS[b] - mi.escala) ? k : b), 0); mi.escala = ESCALAS[Math.max(0, Math.min(ESCALAS.length - 1, i + d))]; reconstruir(); };
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-modo],[data-color],[data-accion]'); if (!b || S !== mi) return;
      if (b.dataset.modo) { modo(b.dataset.modo); return; }
      if (b.dataset.color) { mi.color = b.dataset.color; marcarColor(); if (mi.modo !== 'sub' && mi.modo !== 'pincel') modo('sub'); return; }
      switch (b.dataset.accion) {
        case 'zm': zoom(-1); break;
        case 'zp': zoom(1); break;
        case 'ajustar': ajustarAncho(); break;
        case 'leer': if (mi.leidas.has(mi.actual)) mi.leidas.delete(mi.actual); else mi.leidas.add(mi.actual); marcarLeida(mi.pags[mi.actual - 1]); actualizarBarra(); guardarProgreso(); break;
        case 'eta': panelEta(b); break;
        case 'paleta': paleta(b); break;
        case 'limpiar': limpiar(); break;
        case 'lista': panel(!mi.panelAbierto); break;
        case 'notas': if (window.NikaPdfNotas) window.NikaPdfNotas.abrir(mi); else aviso('Las notas no están disponibles en este momento'); break;
        case 'cerrar-lista': panel(false); break;
        case 'fs': pantalla(); break;
        case 'drive': aDrive(); break;
        case 'atajos': atajos(); break;
        case 'undo': deshacer(); break;
        case 'redo': rehacer(); break;
        case 'supr': if (mi.sel && mi.marcas.includes(mi.sel)) eliminar(mi.sel); else aviso('Tocá primero una marca para seleccionarla'); break;
        case 'lapiz': mi.soloLapiz = !mi.soloLapiz; b.classList.toggle('on', mi.soloLapiz); mi.root.classList.toggle('solo-lapiz', mi.soloLapiz); aviso(mi.soloLapiz ? 'Solo lápiz: el dedo mueve la página, el lápiz dibuja' : 'Dedo y lápiz dibujan'); break;
        case 'recta': mi.recta = !mi.recta; b.classList.toggle('on', mi.recta); if (mi.recta && mi.modo !== 'pincel') modo('pincel'); aviso(mi.recta ? 'Línea recta activada' : 'Línea recta desactivada'); break;
      }
    });
    $('.nkpdf-pag', root).addEventListener('change', (e) => irA(+e.target.value, true));
    mi.teclas = (e) => {
      if (S !== mi) return;
      const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!document.body.contains(root) || !(root.offsetParent || enPantalla())) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); deshacer(); } else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); rehacer(); }
        return;
      }
      if (e.altKey) return;
      if (k === 'delete' || k === 'backspace') { if (mi.sel && mi.marcas.includes(mi.sel)) { e.preventDefault(); cerrarPop(); eliminar(mi.sel); } else aviso('Tocá primero una marca para seleccionarla'); return; }
      if (k === 'escape') { cerrarPop(); mi.sel = null; const at = $('.nkpdf-atajos', root); if (at) at.remove(); return; }
      if (k === '?' || (k === '/' && e.shiftKey)) { atajos(); return; }
      if (k === 'v') modo('sel'); else if (k === 'h') modo('sub'); else if (k === 'p' || k === 'a') modo('pincel'); else if (k === 'e') modo('bor'); else if (k === 't') modo('texto'); else if (k === 'm') modo('pin');
      else if (k === '[' || k === ']') { mi.fijarTam(mi.tam + (k === ']' ? 4 : -4)); }
      else if (k === 'f') pantalla();
      else if (['1', '2', '3', '4', '5', '6'].includes(k)) { mi.color = favoritos()[+k - 1]; marcarColor(); if (mi.modo !== 'pincel') modo('sub'); }
      else if (k === '+' || k === '=') zoom(1); else if (k === '-') zoom(-1);
    };
    document.addEventListener('keydown', mi.teclas);
    if (mi.tl) { mi.tlKey = () => window.NikaTiempo.tocar(mi.tl); document.addEventListener('keydown', mi.tlKey, { passive: true }); }

    // una página cuenta como leída si estuvo ~4 s como la principal en pantalla
    mi.reloj = setInterval(() => {
      if (S !== mi || document.hidden) return;
      mi.segs++;
      if (mi.tl && window.NikaTiempo) {
        window.NikaTiempo.tick(mi.tl, mi.actual);
        mi.tlN = (mi.tlN || 0) + 1;
        if (mi.tlN % 30 === 0) { actualizarEta(); window.NikaTiempo.guardar(mi.tl, mi.actual); }
      }
      if (mi.segs === 4 && !mi.leidas.has(mi.actual)) { mi.leidas.add(mi.actual); marcarLeida(mi.pags[mi.actual - 1]); actualizarBarra(); guardarProgreso(); }
    }, 1000);

    marcarColor(); actualizarBarra(); actualizarFs(); actualizarEta();
    if (window.NikaPdfAnot) window.NikaPdfAnot.cargar(mi);
    const ult = mi.prog && mi.prog.ultima_pagina;
    if (ult && ult > 1 && ult <= mi.n && window._nikaReanudar) { window._nikaReanudar = false; irA(ult, true); }
    else if (ult && ult > 1 && ult <= mi.n) toast(`Seguías en la página ${ult} de ${mi.n}`, 'Continuar', () => irA(ult, true));
    else if (!mi.marcas.length) toast('Novedad: 📝 escribí y 📌 poné marcadores sobre el PDF, o subrayá un texto', 'Probar 📌', () => modo('pin'));
    mi.actual = 1;
  }

  function cerrar() {
    cerrarPop();
    if (!S) return;
    const c = contenedor();
    if (c && c.classList.contains('nkpdf-fsfix')) quitarFicticia(c);
    if (c && document.fullscreenElement === c) document.exitFullscreen().catch(() => {});
    clearInterval(S.reloj); clearTimeout(_t); if (S.io) S.io.disconnect();
    if (S.teclas) document.removeEventListener('keydown', S.teclas);
    if (S.tlKey) document.removeEventListener('keydown', S.tlKey);
    const fbAzul = document.getElementById('nika-fs-btn'); if (fbAzul) fbAzul.style.display = '';
    const s = S; s.cerrando = true; persistir(s);
    if (!s.fcAvisado && s.leidas && s.leidas.size - (s.leidas0 || 0) >= 10) setTimeout(() => cartelFlashcards(s, s.leidas.size >= s.n, null), 700);
    S = null; s.tok = -1;
    try { s.pdf && s.pdf.destroy(); } catch (_) {}
    if (s.root && s.root.parentNode) s.root.remove();
  }

  window.NikaPdf = { abrir, cerrar, pantalla, modo: (m) => { if (S) modo(m); }, reabrir: () => { if (ultimoOp) abrir(ultimoOp); }, activo: () => !!S, pagina: () => (S && S.actual) || null, listo: () => !!(S && S.pags && S.pags.length && S.pags[0].el && S.pags[0].el.offsetHeight > 0), irA: (n, suave) => { if (S) irA(n, suave); } };
})();
