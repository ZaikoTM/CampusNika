/* CAMPUS NIKA — NikaPlan: imprimir / exportar el plan de estudio (A4, color o blanco y negro) y compartir por WhatsApp.
   Se abre desde la vista del plan (botón "Imprimir / PDF"). Genera una hoja A4 por sección dentro de un iframe aislado
   (así el CSS de impresión no toca la app) y usa el diálogo de impresión del navegador para imprimir o "Guardar como PDF".
   La imagen para compartir se dibuja en un canvas propio, igual que en los recetarios. */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const aFecha = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const hoyISO = () => iso(new Date());
  const difDias = (a, b) => Math.round((aFecha(a) - aFecha(b)) / 86400000);
  const fLarga = (s) => { const d = aFecha(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
  const fCorta = (s) => { const d = aFecha(s); return `${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()}/${d.getMonth() + 1}`; };
  const fH = (h) => (Math.round((h || 0) * 10) / 10).toString().replace('.', ',') + ' h';
  const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); };

  // ---- temas visuales por materia (el color es lo primordial: gineco rosado, cirugía celeste, etc.) ----
  const TEMAS = {
    ginecologia: { nombre: 'Ginecología y Obstetricia', c1: '#ec4899', c2: '#a855f7', soft: '#fdf2f8', ink: '#831843', ico: '🤰' },
    cirugia: { nombre: 'Cirugía', c1: '#38bdf8', c2: '#6366f1', soft: '#f0f9ff', ink: '#1e3a8a', ico: '🔪' },
    siam: { nombre: 'S.I.A.M.', c1: '#06b6d4', c2: '#0d9488', soft: '#ecfeff', ink: '#134e4a', ico: '🫀' },
    pfo: { nombre: 'PFO · 6.º año', c1: '#f59e0b', c2: '#b45309', soft: '#fffbeb', ink: '#78350f', ico: '🎓' },
    medicinadeportiva: { nombre: 'Medicina Deportiva', c1: '#f97316', c2: '#16a34a', soft: '#fff7ed', ink: '#7c2d12', ico: '🏃' },
    medicinalegal: { nombre: 'Medicina Legal', c1: '#e11d48', c2: '#d4a017', soft: '#fff1f2', ink: '#4c0519', ico: '⚖️' },
  };
  const temaDe = (p) => TEMAS[p.materia] || { nombre: p.materia || 'Plan de estudio', c1: '#6366f1', c2: '#a855f7', soft: '#f5f3ff', ink: '#312e81', ico: '📚' };
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mezcla = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => pad(Math.round(v + (B[i] - v) * t).toString(16))).join(''); };

  // ---- datos del plan ----
  const items = (d) => (d.temas || []).concat(d.checklist || []);
  const progreso = (d) => { const it = items(d); return it.length ? it.filter((x) => x.hecho).length / it.length : 0; };
  const horasPlan = (p) => p.dias.reduce((a, d) => a + (d.horas || 0), 0);
  const horasHechas = (p) => p.dias.reduce((a, d) => { const h = d.horas || 0; return a + Math.max(h * progreso(d), Math.min(h, d.estudiado || 0)); }, 0);
  const unidadesDe = (p) => { const u = []; p.dias.forEach((d) => { const k = String(d.unidad || '').split(' + ')[0]; if (k && k !== 'Integración' && !u.includes(k)) u.push(k); }); return u; };
  const corto = (u) => String(u || '').replace(/\s*[-–]\s*Secci[oó]n\s*/i, ' · S').slice(0, 14);
  const esRepaso = (p, d) => d.unidad === 'Integración' && p.dias.indexOf(d) !== p.dias.length - 1;
  const esFinal = (p, d) => p.dias.indexOf(d) === p.dias.length - 1;

  // ---- QR (qrcode-generator, alojado en js/vendor: funciona sin conexión a servidores externos) ----
  let qrLib = null;
  function cargarQR() {
    if (qrLib) return qrLib;
    qrLib = new Promise((ok) => {
      if (window.qrcode) return ok(window.qrcode);
      const s = document.createElement('script');
      s.src = 'js/vendor/qrcode-generator.min.js?v=1';
      s.onload = () => ok(window.qrcode || null); s.onerror = () => ok(null); document.head.appendChild(s);
    });
    return qrLib;
  }
  function qrSvg(lib, texto, color) {
    if (!lib) return '';
    try { const q = lib(0, 'M'); q.addData(texto); q.make(); return q.createSvgTag({ cellSize: 3, margin: 0, scalable: true }).replace(/fill="black"/g, `fill="${color}"`).replace(/fill="#000000"/g, `fill="${color}"`); } catch (_) { return ''; }
  }

  // ---- paginado aproximado: cada hoja es min-height A4 y, si algo se pasa, fluye a la siguiente sin cortarse ----
  const lineasDia = (d, opt) => {
    let n = 3 + (d.temas || []).length + Math.ceil((d.temas || []).reduce((a, t) => a + (opt.detalle ? String(t.detalle || '').length : 0), 0) / 105);
    if (opt.duros) n += (d.datos_duros || []).length;
    n += (d.checklist || []).length;
    if (opt.agenda) n += (d.agenda || []).length;
    return n;
  };

  function estilo(bn) {
    return `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; padding: 0; background: #e5e7eb; }
body { font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, Arial, sans-serif; color: #1f2937; font-size: 10.5pt; line-height: 1.38; }
.hoja { position: relative; width: 210mm; min-height: 297mm; margin: 0 auto 10mm; background: #fff; padding: 12mm 12mm 18mm; overflow: hidden; break-after: page; page-break-after: always; box-shadow: 0 6px 24px rgba(0,0,0,.18); }
.hoja:last-child { break-after: auto; page-break-after: auto; }
@media print { html, body { background: #fff; } .hoja { margin: 0; box-shadow: none; } }
.cab { display: flex; align-items: center; gap: 10px; padding-bottom: 8px; margin-bottom: 10px; border-bottom: 2.4px solid var(--c1); }
.cab img { width: 34px; height: 34px; border-radius: 9px; }
.cab .t { flex: 1; min-width: 0; } .cab b { display: block; font-size: 13pt; color: var(--ink); line-height: 1.15; }
.cab small { color: #6b7280; font-weight: 700; letter-spacing: .02em; }
.cab .sec { font-weight: 800; font-size: 9pt; text-transform: uppercase; letter-spacing: .1em; color: #fff; background: linear-gradient(135deg, var(--c1), var(--c2)); padding: 4px 11px; border-radius: 99px; white-space: nowrap; }
.pie { position: absolute; left: 12mm; right: 12mm; bottom: 8mm; display: flex; justify-content: space-between; align-items: center; font-size: 8pt; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 5px; }
.pie b { color: var(--ink); } .pie .marca { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; }
.pie .marca i { width: 9px; height: 9px; border-radius: 3px; background: linear-gradient(135deg, var(--c1), var(--c2)); display: inline-block; }
h2 { margin: 0 0 6px; font-size: 14pt; color: var(--ink); } h3 { margin: 10px 0 4px; font-size: 10.5pt; color: var(--ink); }
/* portada */
.port { border-radius: 16px; padding: 16mm 12mm 12mm; color: #fff; background: linear-gradient(135deg, var(--c1), var(--c2)); position: relative; overflow: hidden; }
.port::after { content: ''; position: absolute; width: 90mm; height: 90mm; right: -25mm; top: -25mm; border-radius: 50%; background: rgba(255,255,255,.16); }
.port .mat { display: inline-block; background: rgba(255,255,255,.22); border: 1px solid rgba(255,255,255,.5); padding: 3px 12px; border-radius: 99px; font-weight: 800; font-size: 9.5pt; }
.port h1 { margin: 10px 0 4px; font-size: 22pt; line-height: 1.12; position: relative; z-index: 1; } .port p { margin: 0; opacity: .95; position: relative; z-index: 1; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; position: relative; z-index: 1; }
.kpi { background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.45); border-radius: 12px; padding: 6px 8px; text-align: center; }
.kpi b { display: block; font-size: 16pt; line-height: 1.1; } .kpi span { font-size: 8pt; opacity: .95; }
.fila { display: flex; gap: 10px; margin-top: 10px; align-items: stretch; }
.caja { flex: 1; border: 1.4px solid var(--c1); border-radius: 12px; padding: 8px 10px; background: var(--soft); }
.caja b { color: var(--ink); } .qr { width: 34mm; flex: none; text-align: center; font-size: 7.5pt; color: #6b7280; } .qr svg { width: 30mm; height: 30mm; }
.sem { border-radius: 12px; padding: 8px 12px; margin-top: 10px; font-weight: 700; border: 1.6px solid; }
.sem.verde { background: #ecfdf5; border-color: #10b981; color: #065f46; } .sem.amarillo { background: #fffbeb; border-color: #f59e0b; color: #78350f; } .sem.rojo { background: #fef2f2; border-color: #ef4444; color: #7f1d1d; }
.sem.nuevo, .sem.fin { background: var(--soft); border-color: var(--c1); color: var(--ink); }
.uni { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; } .uni span { font-size: 8.5pt; font-weight: 800; padding: 2px 9px; border-radius: 99px; color: #fff; }
.leyenda { font-size: 8.5pt; color: #4b5563; margin-top: 8px; }
/* calendario */
.cal { width: 100%; border-collapse: separate; border-spacing: 4px; table-layout: fixed; }
.cal th { font-size: 8.5pt; color: #fff; background: linear-gradient(135deg, var(--c1), var(--c2)); border-radius: 8px; padding: 4px 0; }
.cal td { height: 38mm; vertical-align: top; border: 1.2px solid #e5e7eb; border-radius: 10px; padding: 4px 5px; font-size: 8pt; position: relative; background: #fff; }
.cal td.fuera { background: #f9fafb; border-color: #f3f4f6; color: #d1d5db; }
.cal td .n { font-size: 11pt; font-weight: 900; color: var(--ink); } .cal td .h { position: absolute; right: 5px; top: 5px; font-size: 7.5pt; font-weight: 800; color: #6b7280; }
.cal td .u { display: inline-block; margin-top: 2px; font-size: 7pt; font-weight: 800; color: #fff; padding: 1px 6px; border-radius: 99px; }
.cal td .tt { display: block; margin-top: 3px; font-size: 7.4pt; line-height: 1.22; color: #374151; overflow: hidden; max-height: 20mm; }
.cal td.rep { border-style: dashed; border-color: var(--c2); background: var(--soft); } .cal td.ex { background: linear-gradient(135deg, var(--c1), var(--c2)); color: #fff; border-color: var(--ink); } .cal td.ex .n, .cal td.ex .h, .cal td.ex .tt { color: #fff; }
.cal td.hoy { box-shadow: inset 0 0 0 2.4px var(--ink); }
.cal td .ok { position: absolute; right: 5px; bottom: 4px; font-size: 11pt; color: #10b981; font-weight: 900; }
.leyenda-cal { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 8pt; color: #4b5563; } .leyenda-cal i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; vertical-align: -1px; margin-right: 4px; }
/* agenda */
.dia { border: 1.4px solid #e5e7eb; border-left: 5px solid var(--c1); border-radius: 12px; margin-bottom: 7px; padding: 6px 9px; break-inside: avoid; page-break-inside: avoid; background: #fff; }
.dia.rep { border-left-style: dashed; background: var(--soft); } .dia.ex { border-left-color: var(--ink); background: var(--soft); }
.dia .h { display: flex; align-items: center; gap: 8px; } .dia .num { min-width: 11mm; text-align: center; font-weight: 900; color: #fff; background: linear-gradient(135deg, var(--c1), var(--c2)); border-radius: 9px; padding: 2px 4px; font-size: 9.5pt; }
.dia .num small { display: block; font-size: 6.5pt; letter-spacing: .1em; opacity: .9; }
.dia .tit { flex: 1; font-weight: 800; color: var(--ink); line-height: 1.2; } .dia .tit small { display: block; font-weight: 600; color: #6b7280; font-size: 8pt; }
.dia .hs { font-weight: 900; color: var(--ink); font-size: 10pt; white-space: nowrap; }
.dia ul { list-style: none; margin: 5px 0 0; padding: 0; } .dia li { display: flex; gap: 6px; padding: 1.5px 0; font-size: 9.2pt; }
.cb { flex: none; width: 3.4mm; height: 3.4mm; border: 1.4px solid var(--ink); border-radius: 1mm; margin-top: 2px; position: relative; } .cb.on::after { content: '✓'; position: absolute; left: 0.3mm; top: -1.2mm; font-size: 9pt; font-weight: 900; color: var(--ink); }
.pr { font-size: 6.8pt; font-weight: 900; text-transform: uppercase; border-radius: 99px; padding: 1px 6px; color: #fff; background: #ef4444; align-self: flex-start; margin-top: 1px; } .pr.media { background: #f59e0b; } .pr.sec { background: #64748b; }
.det { font-size: 8.4pt; color: #4b5563; margin: 0 0 1px 17px; } .tr { font-size: 8.2pt; color: #b91c1c; margin: 0 0 2px 17px; font-weight: 600; }
.dd { margin-top: 5px; background: var(--soft); border-radius: 8px; padding: 4px 8px; font-size: 8.6pt; } .dd b { color: var(--ink); } .dd ul { margin: 2px 0 0; } .dd li { padding: 0; }
/* tabla */
.tab { width: 100%; border-collapse: collapse; font-size: 9pt; } .tab th { text-align: left; background: linear-gradient(135deg, var(--c1), var(--c2)); color: #fff; padding: 5px 7px; font-size: 8.5pt; }
.tab th:first-child { border-radius: 8px 0 0 0; } .tab th:last-child { border-radius: 0 8px 0 0; }
.tab td { padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; } .tab tr:nth-child(even) td { background: var(--soft); } .tab tr.hoy td { box-shadow: inset 0 0 0 1.6px var(--ink); } .tab td.c { text-align: center; white-space: nowrap; }
/* hoy */
.hoyc { border: 2px solid var(--c1); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; background: var(--soft); }
.hoyc h2 { font-size: 15pt; } .grande li { font-size: 11pt; padding: 3px 0; } .grande .cb { width: 4.6mm; height: 4.6mm; }
.bloques { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px; } .bloques div { border: 1.4px solid var(--c2); border-radius: 10px; padding: 6px 8px; font-size: 8.8pt; } .bloques b { color: var(--ink); display: block; }
.lineas { margin-top: 8px; } .lineas i { display: block; height: 7.5mm; border-bottom: 1px dotted #9ca3af; }
/* repaso */
.dos { columns: 2; column-gap: 8mm; } .rep-u { break-inside: avoid; margin-bottom: 8px; border-left: 4px solid var(--c1); padding-left: 8px; } .rep-u h3 { margin: 0 0 3px; }
.rep-u li { font-size: 9pt; margin-bottom: 2px; }
/* blanco y negro */
body.bn { --c1: #111; --c2: #444; --soft: #f5f5f5; --ink: #000; }
body.bn .port { background: #fff; color: #000; border: 2.4px solid #000; } body.bn .port::after { display: none; }
body.bn .port .mat, body.bn .kpi { background: #fff; border-color: #000; color: #000; }
body.bn .cab .sec, body.bn .cal th, body.bn .dia .num, body.bn .tab th { background: #000 !important; color: #fff; }
body.bn .cal td.ex { background: #000; } body.bn .cal td .u, body.bn .uni span { background: #000 !important; }
body.bn .cal td.rep { background: repeating-linear-gradient(135deg, #fff 0 6px, #eee 6px 12px); }
body.bn .sem { background: #fff !important; border-color: #000 !important; color: #000 !important; }
body.bn .pr, body.bn .pr.media, body.bn .pr.sec { background: #000; } body.bn .tr { color: #000; }
body.bn .pie .marca i { background: #000; }
`;
  }

  // ---- construcción de las hojas ----
  function construir(p, o) {
    const T = temaDe(p), unidades = unidadesDe(p), n = p.dias.length;
    const colores = {}; unidades.forEach((u, i) => { colores[u] = o.bn ? mezcla('#111111', '#9a9a9a', unidades.length > 1 ? i / (unidades.length - 1) : 0) : mezcla(T.c1, T.c2, unidades.length > 1 ? i / (unidades.length - 1) : 0); });
    const colU = (u) => colores[String(u || '').split(' + ')[0]] || (o.bn ? '#555' : T.c2);
    const logo = new URL('assets/N%20NIKA.png', location.href).href;
    const hojas = []; let numero = 0;
    const total = () => hojas.length;
    const hoja = (seccion, cuerpo) => { numero++; hojas.push(`<section class="hoja"><div class="cab"><img src="${logo}" alt="NikaMed"><div class="t"><b>${esc(p.titulo)}</b><small>NikaMed · ${esc(T.nombre)} · examen ${esc(fLarga(p.fecha_examen))}</small></div><span class="sec">${esc(seccion)}</span></div>${cuerpo}<div class="pie"><span class="marca"><i></i><b>NikaMed</b> · nikamed.com.ar · NikaPlan</span><span>${esc(p.titulo)}</span><span class="pg">${numero}</span></div></section>`); };
    const r = (window.NikaPlan && window.NikaPlan.ritmo) ? window.NikaPlan.ritmo(p) : null;
    const dias = difDias(p.fecha_examen, hoyISO());
    const hechasH = horasHechas(p), totalH = horasPlan(p);
    const hechos = p.dias.filter((d) => progreso(d) >= 1).length;
    const tildes = o.tildes;
    const caja = (hecho) => `<i class="cb ${tildes && hecho ? 'on' : ''}"></i>`;

    // 1) portada
    if (o.portada) {
      hoja('Tu plan', `<div class="port"><span class="mat">${T.ico} ${esc(T.nombre)}</span><h1>${esc(p.titulo)}</h1><p>Examen: <b>${esc(fLarga(p.fecha_examen))}</b>${dias >= 0 ? ` · faltan <b>${dias}</b> ${dias === 1 ? 'día' : 'días'}` : ''}</p>
        <div class="kpis"><div class="kpi"><b>${n}</b><span>días de plan</span></div><div class="kpi"><b>${fH(totalH)}</b><span>de estudio</span></div><div class="kpi"><b>${unidades.length}</b><span>unidades</span></div><div class="kpi"><b>${tildes ? hechos + '/' + n : '☐'}</b><span>${tildes ? 'días completos' : 'tu avance'}</span></div></div></div>
        <div class="uni">${unidades.map((u) => `<span style="background:${colores[u]}">${esc(u)}</span>`).join('')}</div>
        ${r && tildes ? `<div class="sem ${esc(r.nivel)}">${r.ico} ${esc(r.titulo)}. ${esc(r.texto)}</div>` : ''}
        <div class="fila"><div class="caja"><b>Cómo usar esta carpeta</b><br>1. En el <b>calendario</b> ves todo el plan de un vistazo.<br>2. La <b>agenda</b> te dice qué estudiar cada día; tildá cada tema al terminarlo.<br>3. La hoja de <b>hoy</b> es para llevar encima.<br>4. Los <b>datos duros</b> son para la noche anterior al examen.</div>
        ${o.qr ? `<div class="qr">${o.qrSvg || ''}<div>Escaneá y conocé NikaMed</div></div>` : ''}</div>
        <p class="leyenda">Plan armado en <b>NikaMed</b> (NikaPlan). Impreso el ${esc(fLarga(hoyISO()))}.</p>`);
    }

    // 2) calendario: una hoja por mes
    if (o.calendario) {
      const ini = aFecha(p.dias[0].fecha), fin = aFecha(p.fecha_examen);
      const porFecha = {}; p.dias.forEach((d, i) => { porFecha[d.fecha] = { d, i }; });
      let m = new Date(ini.getFullYear(), ini.getMonth(), 1);
      while (m <= fin && numero < 40) {
        const y = m.getFullYear(), mes = m.getMonth(), primero = (new Date(y, mes, 1).getDay() + 6) % 7, nd = new Date(y, mes + 1, 0).getDate();
        let tr = '', celda = 0;
        const filas = Math.ceil((primero + nd) / 7);
        for (let f = 0; f < filas; f++) {
          tr += '<tr>';
          for (let c = 0; c < 7; c++, celda++) {
            const dia = celda - primero + 1;
            if (dia < 1 || dia > nd) { tr += '<td class="fuera"></td>'; continue; }
            const f8 = `${y}-${pad(mes + 1)}-${pad(dia)}`, x = porFecha[f8];
            const clases = [];
            if (f8 === hoyISO()) clases.push('hoy');
            let cont = `<span class="n">${dia}</span>`;
            if (f8 === p.fecha_examen) { clases.push('ex'); cont += `<span class="h">★</span><span class="tt"><b>EXAMEN</b><br>${esc(p.titulo)}</span>`; }
            else if (x) {
              if (esRepaso(p, x.d)) clases.push('rep');
              cont += `<span class="h">${fH(x.d.horas)}</span>`;
              if (x.d.unidad && x.d.unidad !== 'Integración') cont += `<span class="u" style="background:${colU(x.d.unidad)}">${esc(corto(x.d.unidad))}</span>`;
              cont += `<span class="tt">${esc(esRepaso(p, x.d) ? 'Repaso' : (x.d.titulo || '').slice(0, 54))}</span>`;
              if (tildes && progreso(x.d) >= 1) cont += '<span class="ok">✓</span>';
            }
            tr += `<td class="${clases.join(' ')}">${cont}</td>`;
          }
          tr += '</tr>';
        }
        hoja('Calendario', `<h2>${esc(MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1))} ${y}</h2>
          <table class="cal"><thead><tr>${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${tr}</tbody></table>
          <div class="leyenda-cal">${unidades.map((u) => `<span><i style="background:${colores[u]}"></i>${esc(u)}</span>`).join('')}<span><i style="background:${o.bn ? '#000' : T.c1}"></i>Día de examen ★</span><span><i style="border:1.4px dashed #555"></i>Repaso integrador</span></div>`);
        m = new Date(y, mes + 1, 1);
      }
    }

    // 3) agenda: días, repartidos por altura estimada
    const bloqueDia = (d, i, opt) => {
      const cls = esFinal(p, d) ? 'ex' : esRepaso(p, d) ? 'rep' : '';
      const li = (d.temas || []).map((t) => `<li>${caja(t.hecho)}<span>${t.prio ? `<span class="pr ${esc(t.prio)}">${esc(t.prio === 'alta' ? 'Alta' : t.prio === 'media' ? 'Media' : 'Apoyo')}</span> ` : ''}${esc(t.texto)}</span></li>${opt.detalle && t.detalle ? `<p class="det">${esc(t.detalle)}</p>` : ''}${opt.detalle && t.trampa ? `<p class="tr">⚠️ Trampa: ${esc(t.trampa)}</p>` : ''}`).join('');
      const ck = (d.checklist || []).map((t) => `<li>${caja(t.hecho)}<span>${esc(t.texto)}</span></li>`).join('');
      const dd = opt.duros && (d.datos_duros || []).length ? `<div class="dd"><b>Datos duros</b><ul>${d.datos_duros.map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div>` : '';
      const ag = opt.agenda && (d.agenda || []).length ? `<div class="dd"><b>Bloques</b><ul>${d.agenda.map((b) => `<li>• <b>${esc(b.bloque)}</b> (${esc(b.horas)}): ${esc(b.tarea)}</li>`).join('')}</ul></div>` : '';
      return `<div class="dia ${cls}"><div class="h"><span class="num"><small>DÍA</small>${i + 1}</span><span class="tit">${esc(d.titulo || 'Día de estudio')}<small>${esc(fLarga(d.fecha))}${d.unidad ? ' · ' + esc(d.unidad) : ''}</small></span><span class="hs">${fH(d.horas)}</span></div><ul>${li}${ck}</ul>${dd}${ag}</div>`;
    };
    if (o.agenda) {
      const CAP = 52; let acc = [], ln = 0;
      const cierra = () => { if (acc.length) hoja('Agenda', `<h2>Agenda día por día</h2>${acc.join('')}`); acc = []; ln = 0; };
      p.dias.forEach((d, i) => {
        const l = lineasDia(d, { detalle: o.detalle, duros: o.duros, agenda: o.bloques });
        if (ln + l > CAP && acc.length) cierra();
        acc.push(bloqueDia(d, i, { detalle: o.detalle, duros: o.duros, agenda: o.bloques })); ln += l + 1;
      });
      cierra();
    }

    // 4) hoy
    if (o.hoy) {
      const h = hoyISO();
      const d = p.dias.find((x) => x.fecha === h) || p.dias.find((x) => x.fecha > h) || p.dias[p.dias.length - 1];
      const i = p.dias.indexOf(d);
      const li = (d.temas || []).map((t) => `<li>${caja(t.hecho)}<span>${t.prio ? `<span class="pr ${esc(t.prio)}">${esc(t.prio === 'alta' ? 'Alta' : t.prio === 'media' ? 'Media' : 'Apoyo')}</span> ` : ''}<b>${esc(t.texto)}</b></span></li>${o.detalle && t.detalle ? `<p class="det">${esc(t.detalle)}</p>` : ''}${o.detalle && t.trampa ? `<p class="tr">⚠️ Trampa: ${esc(t.trampa)}</p>` : ''}`).join('');
      const ck = (d.checklist || []).map((t) => `<li>${caja(t.hecho)}<span>${esc(t.texto)}</span></li>`).join('');
      hoja('Hoy', `<div class="hoyc"><h2>${esc(d.fecha === h ? 'Hoy · ' : 'Próximo día · ')}${esc(fLarga(d.fecha))}</h2><div style="font-weight:800;color:var(--ink)">Día ${i + 1} de ${n} · ${esc(d.titulo || '')} · ${fH(d.horas)}${d.unidad ? ' · ' + esc(d.unidad) : ''}</div></div>
        <h3>Temas del día</h3><div class="dia grande" style="border-left-color:var(--c1)"><ul>${li}</ul></div>
        ${ck ? `<h3>Para fijar</h3><div class="dia grande"><ul>${ck}</ul></div>` : ''}
        ${(d.agenda || []).length ? `<h3>Cómo repartir las horas</h3><div class="bloques">${d.agenda.map((b) => `<div><b>${esc(b.bloque)} · ${esc(b.horas)}</b>${esc(b.tarea)}</div>`).join('')}</div>` : ''}
        ${(d.datos_duros || []).length ? `<h3>Datos duros del día</h3><div class="dd"><ul>${d.datos_duros.map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div>` : ''}
        <h3>Mis notas</h3><div class="lineas"><i></i><i></i><i></i><i></i></div>`);
    }

    // 5) tabla resumen
    if (o.tabla) {
      const CAP = 28;
      for (let k = 0; k < p.dias.length; k += CAP) {
        const filas = p.dias.slice(k, k + CAP).map((d, j) => `<tr class="${d.fecha === hoyISO() ? 'hoy' : ''}"><td class="c"><b>${k + j + 1}</b></td><td class="c">${esc(fCorta(d.fecha))}</td><td>${esc(d.titulo || '')}</td><td class="c">${esc(d.unidad || '')}</td><td class="c">${esc(String((d.temas || []).length))}</td><td class="c">${fH(d.horas)}</td><td class="c">${tildes ? (progreso(d) >= 1 ? '✓' : Math.round(progreso(d) * 100) + '%') : '☐'}</td></tr>`).join('');
        hoja('Tabla', `<h2>Resumen del plan</h2><table class="tab"><thead><tr><th>Día</th><th>Fecha</th><th>Tema principal</th><th>Unidad</th><th>Temas</th><th>Horas</th><th>Hecho</th></tr></thead><tbody>${filas}</tbody></table><p class="leyenda">Total: ${fH(totalH)} en ${n} días${tildes ? ` · hechas ${fH(hechasH)}` : ''}.</p>`);
      }
    }

    // 6) repaso final: datos duros agrupados por unidad
    if (o.repaso) {
      const grupos = {};
      p.dias.forEach((d) => { (d.datos_duros || []).forEach((x) => { const k = String(d.unidad || 'Generales').split(' + ')[0]; if (k === 'Integración') return; (grupos[k] = grupos[k] || { t: d.titulo, l: [] }).l.push(x); }); });
      const claves = Object.keys(grupos);
      if (claves.length) {
        const CAP = 56; let acc = [], ln = 0;
        const cierra = () => { if (acc.length) hoja('Repaso final', `<h2>Repaso final · datos duros</h2><p class="leyenda">Para la noche anterior: leélo en voz alta y tapá la columna para ponerte a prueba.</p><div class="dos">${acc.join('')}</div>`); acc = []; ln = 0; };
        claves.forEach((k) => {
          const l = grupos[k].l.length * 2 + 2;
          if (ln + l > CAP * 2 && acc.length) cierra();
          acc.push(`<div class="rep-u" style="border-left-color:${colores[k] || (o.bn ? '#000' : T.c1)}"><h3>${esc(k)} · ${esc((grupos[k].t || '').slice(0, 60))}</h3><ul style="margin:0;padding-left:14px">${grupos[k].l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`); ln += l;
        });
        cierra();
      } else {
        hoja('Repaso final', '<h2>Repaso final</h2><p class="leyenda">Este plan no tiene datos duros cargados. Agregalos en cada día para verlos acá.</p>');
      }
    }

    // numeración "n / total"
    const tot = hojas.length;
    return hojas.map((h, i) => h.replace(/<span class="pg">\d+<\/span>/, `<span class="pg">${i + 1} / ${tot}</span>`)).join('');
  }

  function documento(p, o) {
    const T = temaDe(p);
    const vars = o.bn ? '' : `--c1:${T.c1};--c2:${T.c2};--soft:${T.soft};--ink:${T.ink};`;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(p.titulo)} · NikaMed</title><meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet"><style>body{${vars}}${estilo(o.bn)}</style></head>
<body class="${o.bn ? 'bn' : ''}">${construir(p, o)}</body></html>`;
  }

  // ---- imagen para compartir (canvas): tarjeta del plan con calendario corto, ritmo y marca ----
  async function imagenCompartir(p, o, lib) {
    const T = temaDe(p), W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const c1 = o.bn ? '#111' : T.c1, c2 = o.bn ? '#555' : T.c2, ink = o.bn ? '#000' : T.ink, soft = o.bn ? '#f3f3f3' : T.soft;
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, W, 360); g.addColorStop(0, c1); g.addColorStop(1, c2);
    x.fillStyle = g; x.fillRect(0, 0, W, 360);
    x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.arc(W - 120, 40, 230, 0, Math.PI * 2); x.fill();
    const logo = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = 'assets/N%20NIKA.png'; });
    if (logo) x.drawImage(logo, 48, 44, 64, 64);
    x.fillStyle = '#fff'; x.font = '800 34px "Plus Jakarta Sans", Arial'; x.fillText('NikaMed', 128, 70); x.font = '600 22px "Plus Jakarta Sans", Arial'; x.fillText('NikaPlan · Preparación de examen', 128, 102);
    x.font = '800 54px "Plus Jakarta Sans", Arial';
    const tit = p.titulo; const palabras = tit.split(' '); let linea = '', y = 200; const lineas = [];
    palabras.forEach((w) => { const t = linea ? linea + ' ' + w : w; if (x.measureText(t).width > W - 120 && linea) { lineas.push(linea); linea = w; } else linea = t; }); lineas.push(linea);
    lineas.slice(0, 2).forEach((l, i) => x.fillText(l + (i === 1 && lineas.length > 2 ? '…' : ''), 60, y + i * 62));
    x.font = '600 28px "Plus Jakarta Sans", Arial'; x.fillText(`${T.nombre} · examen ${fLarga(p.fecha_examen)}`, 60, 330);
    // KPIs
    const dias = difDias(p.fecha_examen, hoyISO());
    const kp = [[dias >= 0 ? String(dias) : '—', dias === 1 ? 'día para el examen' : 'días para el examen'], [fH(horasPlan(p)), 'de estudio'], [String(p.dias.length), 'días de plan']];
    kp.forEach((k, i) => { const bx = 48 + i * 330, by = 400, bw = 312; x.fillStyle = soft; x.fillRect(bx, by, bw, 150); x.strokeStyle = c1; x.lineWidth = 3; x.strokeRect(bx, by, bw, 150); x.fillStyle = ink; x.font = '900 60px "Plus Jakarta Sans", Arial'; x.fillText(k[0], bx + 24, by + 74); x.font = '700 24px "Plus Jakarta Sans", Arial'; x.fillStyle = '#4b5563'; x.fillText(k[1], bx + 24, by + 118); });
    // tira de días (hasta 28)
    x.fillStyle = ink; x.font = '800 30px "Plus Jakarta Sans", Arial'; x.fillText('Tu recorrido', 48, 625);
    const unid = unidadesDe(p), col = {}; unid.forEach((u, i) => { col[u] = o.bn ? mezcla('#111111', '#9a9a9a', unid.length > 1 ? i / (unid.length - 1) : 0) : mezcla(T.c1, T.c2, unid.length > 1 ? i / (unid.length - 1) : 0); });
    const dd = p.dias.slice(0, 35); const cols = 7, cw = 138, chh = 96;
    dd.forEach((d, i) => {
      const cx = 48 + (i % cols) * (cw + 8), cy = 650 + Math.floor(i / cols) * (chh + 8);
      const rep = esRepaso(p, d), fin = esFinal(p, d);
      x.fillStyle = fin ? ink : rep ? soft : (col[String(d.unidad || '').split(' + ')[0]] || c2); x.fillRect(cx, cy, cw, chh);
      if (rep) { x.strokeStyle = c2; x.setLineDash([8, 6]); x.lineWidth = 3; x.strokeRect(cx, cy, cw, chh); x.setLineDash([]); }
      x.fillStyle = rep ? ink : '#fff'; x.font = '900 30px "Plus Jakarta Sans", Arial'; x.fillText(String(aFecha(d.fecha).getDate()), cx + 12, cy + 40);
      x.font = '700 18px "Plus Jakarta Sans", Arial'; x.fillText(fH(d.horas), cx + 12, cy + 66); x.fillText(fin ? '★ examen' : rep ? 'repaso' : corto(d.unidad).slice(0, 9), cx + 12, cy + 88);
      if (progreso(d) >= 1 && o.tildes) { x.fillStyle = '#fff'; x.font = '900 28px Arial'; x.fillText('✓', cx + cw - 36, cy + 38); }
    });
    // pie con QR
    const base = 1180;
    x.fillStyle = soft; x.fillRect(0, base - 20, W, H - base + 20);
    x.fillStyle = ink; x.font = '800 30px "Plus Jakarta Sans", Arial'; x.fillText('Armá el tuyo gratis en nikamed.com.ar', 48, base + 40);
    x.font = '600 24px "Plus Jakarta Sans", Arial'; x.fillStyle = '#4b5563'; x.fillText('NikaPlan · calendario, agenda, hoy y repaso final', 48, base + 82);
    if (o.qr && lib) {
      try {
        const svg = qrSvg(lib, 'https://nikamed.com.ar', '#000');
        const img = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
        if (img) { x.fillStyle = '#fff'; x.fillRect(W - 220, base - 4, 180, 180); x.drawImage(img, W - 210, base + 6, 160, 160); }
      } catch (_) {}
    }
    return new Promise((ok) => c.toBlob((b) => ok(b), 'image/png'));
  }

  // ---- diálogo ----
  let overlay = null;
  const OPC = { portada: true, calendario: true, agenda: true, hoy: true, tabla: true, repaso: true, detalle: false, duros: false, bloques: false, tildes: true, qr: true, bn: false };
  function cerrar() { if (overlay) { overlay.remove(); overlay = null; document.body.style.overflow = ''; } }
  async function abrir(plan) {
    const p = plan || (window.NikaPlan && window.NikaPlan._estado && window.NikaPlan._estado.plan);
    if (!p) return toast('Abrí un plan primero');
    cerrar();
    const T = temaDe(p);
    const o = Object.assign({}, OPC);
    try { Object.assign(o, JSON.parse(localStorage.getItem('nika_plan_imprimir') || '{}')); } catch (_) {}
    overlay = document.createElement('div'); overlay.className = 'ppi-ov';
    const ch = (k, t, sub) => `<label class="ppi-ch"><input type="checkbox" data-k="${k}" ${o[k] ? 'checked' : ''}><span class="bx">✓</span><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
    overlay.innerHTML = `<div class="ppi-m" role="dialog" aria-modal="true" aria-label="Imprimir o exportar el plan" style="--c1:${T.c1};--c2:${T.c2};--soft:${T.soft};--ink:${T.ink}">
      <div class="ppi-top"><div><span class="ppi-k">NikaPlan</span><h3>🖨️ Imprimir / exportar mi plan</h3><small>${esc(p.titulo)}</small></div><button type="button" class="ppi-x" aria-label="Cerrar">×</button></div>
      <div class="ppi-cuerpo">
        <div class="ppi-col">
          <h4>¿Qué querés imprimir?</h4>
          ${ch('portada', '📌 Portada', 'Resumen del plan, semáforo y cómo usarlo')}
          ${ch('calendario', '📅 Calendario', 'Un mes por hoja, con colores por unidad')}
          ${ch('agenda', '📋 Agenda', 'Día por día, con casilleros para tildar')}
          ${ch('hoy', '🎯 Hoy', 'La hoja del día para llevar encima')}
          ${ch('tabla', '🗃️ Tabla', 'Una fila por día, para ver todo junto')}
          ${ch('repaso', '🧠 Repaso final', 'Todos los datos duros por unidad')}
          <h4>Detalles</h4>
          ${ch('detalle', 'Detalle y trampas de cada tema')}
          ${ch('duros', 'Datos duros dentro de cada día', 'Siempre salen en «Hoy» y en «Repaso final»')}
          ${ch('bloques', 'Bloques de horas de cada día')}
          ${ch('tildes', 'Incluir mis tildes y progreso', 'Si lo apagás, sale en limpio para tildar a mano')}
          ${ch('qr', 'Código QR de NikaMed', 'Lleva a nikamed.com.ar')}
          <h4>Estilo</h4>
          <div class="ppi-modo"><button type="button" data-bn="0" class="${o.bn ? '' : 'on'}">🎨 Color · ${esc(T.nombre)}</button><button type="button" data-bn="1" class="${o.bn ? 'on' : ''}">⚫ Blanco y negro</button></div>
        </div>
        <div class="ppi-prev"><div class="ppi-prev-h">Vista previa A4 <span id="ppi-n"></span></div><div class="ppi-marco"><iframe id="ppi-if" title="Vista previa del plan"></iframe></div></div>
      </div>
      <div class="ppi-pie"><button type="button" class="ppi-b pri" data-a="imprimir">🖨️ Imprimir / Guardar PDF</button><button type="button" class="ppi-b" data-a="imagen">🖼️ Descargar imagen</button><button type="button" class="ppi-b wa" data-a="wa">💬 Compartir por WhatsApp</button><small>Para guardar el PDF elegí «Guardar como PDF» como impresora.</small></div></div>`;
    document.body.appendChild(overlay); document.body.style.overflow = 'hidden';
    const fr = overlay.querySelector('#ppi-if');
    let lib = null;
    const render = async () => {
      if (o.qr && !lib) lib = await cargarQR();
      o.qrSvg = o.qr ? qrSvg(lib, 'https://nikamed.com.ar', o.bn ? '#000' : T.ink) : '';
      fr.srcdoc = documento(p, o);
      try { localStorage.setItem('nika_plan_imprimir', JSON.stringify(Object.assign({}, o, { qrSvg: undefined }))); } catch (_) {}
    };
    fr.addEventListener('load', () => {
      try {
        const doc = fr.contentDocument, n = doc.querySelectorAll('.hoja').length;
        overlay.querySelector('#ppi-n').textContent = `· ${n} ${n === 1 ? 'hoja' : 'hojas'}`;
        const w = fr.parentElement.clientWidth, esc2 = Math.min(1, (w - 8) / 794);
        fr.style.width = '794px'; fr.style.height = Math.ceil(doc.documentElement.scrollHeight) + 'px'; fr.style.transform = `scale(${esc2})`; fr.style.transformOrigin = 'top left';
        fr.parentElement.style.height = Math.ceil(doc.documentElement.scrollHeight * esc2) + 'px';
      } catch (_) {}
    });
    overlay.addEventListener('click', async (e) => {
      if (e.target === overlay || e.target.closest('.ppi-x')) return cerrar();
      const bn = e.target.closest('[data-bn]'); if (bn) { o.bn = bn.dataset.bn === '1'; overlay.querySelectorAll('[data-bn]').forEach((b) => b.classList.toggle('on', b === bn)); return render(); }
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'imprimir') {
        if (!fr.contentWindow) return;
        try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (_) { toast('No se pudo abrir la impresión: probá desde otro navegador'); }
      } else {
        a.disabled = true; const txt = a.textContent; a.textContent = 'Preparando…';
        try {
          if (o.qr && !lib) lib = await cargarQR();
          const blob = await imagenCompartir(p, o, lib);
          const nombre = `nikaplan-${(p.titulo || 'plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.png`;
          if (a.dataset.a === 'imagen') {
            const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = nombre; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast('🖼️ Imagen descargada');
          } else {
            const texto = `Mi plan de estudio en NikaMed: ${p.titulo}. Examen: ${fLarga(p.fecha_examen)}. Armá el tuyo gratis en https://nikamed.com.ar`;
            const file = new File([blob], nombre, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: texto, title: 'Mi plan · NikaMed' }); } catch (_) {} }
            else {
              const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = nombre; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
              window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
              toast('Descargamos la imagen: adjuntala en el chat de WhatsApp');
            }
          }
        } catch (err) { toast('No se pudo preparar la imagen'); console.warn('[NikaPlanImprimir]', err); }
        a.disabled = false; a.textContent = txt;
      }
    });
    overlay.addEventListener('change', (e) => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; o[k] = e.target.checked; render(); });
    document.addEventListener('keydown', function esc3(e) { if (!overlay) { document.removeEventListener('keydown', esc3); return; } if (e.key === 'Escape') cerrar(); });
    render();
  }

  window.NikaPlanImprimir = { abrir, cerrar, _documento: documento };
})();
