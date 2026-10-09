// NikaSim · Centro de Simulación Clínica: render reactivo de los 3 niveles (año → materia → catálogo) sin recargar la página.
// Datos: nikasim-data.js (NIKASIM_DATABASE). Pasos y estado de cada acreditación se sincronizan con data/acreditaciones/<area>/index.json.
(function () {
  'use strict';
  const DB = window.NIKASIM_DATABASE || (typeof NIKASIM_DATABASE !== 'undefined' ? NIKASIM_DATABASE : null);
  if (!DB) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = { year: DB.defaultYear || DB.years[0].id, area: null };
  const idxCache = {};

  // ---- resultados guardados por el atlas (mismo almacenamiento que acreditaciones.html)
  const resultados = () => {
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return JSON.parse(localStorage.getItem(`nika_acr_${(u && u.username) || 'invitado'}`) || '{}'); } catch (_) { return {}; }
  };
  const indice = (area) => {
    if (!idxCache[area]) idxCache[area] = fetch(`data/acreditaciones/${area}/index.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    return idxCache[area];
  };

  // ---- navegación por hash: #5to  ó  #5to/iecq
  const leerHash = () => {
    const [y, a] = decodeURIComponent(location.hash.replace(/^#/, '')).split('/');
    const year = DB.years.find((v) => v.id === y);
    S.year = year ? year.id : (DB.defaultYear || DB.years[0].id);
    S.area = year && a && year.areas.some((x) => x.id === a) ? a : null;
  };
  const ir = (year, area) => { const h = '#' + year + (area ? '/' + area : ''); if (location.hash === h) render(); else location.hash = h; };

  // ---- nivel 1
  function pintarAnios() {
    $('#ns-years').innerHTML = DB.years.map((y) => `<button type="button" class="ns-year ${y.id === S.year ? 'on' : ''}" role="tab" aria-selected="${y.id === S.year}" data-y="${y.id}">${y.areas.length ? '<i class="ns-dot" title="Disponible"></i>' : ''}${esc(y.name)}</button>`).join('');
  }

  // ---- tarjeta de acreditación (idéntica en espíritu a acreditaciones.html)
  function tarjetaAcr(a, i, res) {
    const on = a._estado === 'Disponible';
    const r = res[`${a.area}/${a.id}`] && res[`${a.area}/${a.id}`].examen;
    const pill = !on ? `<span class="ns-pill ${a._estado === 'En desarrollo' ? 'dev' : ''}">${esc(a._estado)}</span>`
      : r ? `<span class="ns-pill ${r.aprobado ? 'ok' : 'bad'}">${r.aprobado ? 'Acreditada' : 'No acreditada'} · mejor ${r.mejor}%</span>` : '<span class="ns-pill ok">Disponible</span>';
    const cuerpo = `<div class="ns-ico">${a.icon || '🩺'}</div><h4>${esc(a.title)}</h4><small>${a._pasos} pasos en la lista de cotejo</small>${pill}${on ? '<span class="ns-go">Practicar y rendir →</span>' : ''}`;
    return on ? `<a class="ns-card" style="animation-delay:${i * 50}ms" href="acreditaciones.html?area=${encodeURIComponent(a.area)}&id=${encodeURIComponent(a.id)}">${cuerpo}</a>`
      : `<div class="ns-card off" style="animation-delay:${i * 50}ms" aria-disabled="true">${cuerpo}</div>`;
  }

  function tarjetaTour(t, i) {
    const on = t.status === 'Disponible' && t.url;
    return `<div class="ns-card ns-tour ${on ? '' : 'off'}" style="animation-delay:${i * 60}ms">
      <div class="ns-vista"><span>${t.icon || '🏥'}</span></div>
      <div class="ns-cuerpo"><div style="display:flex;gap:6px;flex-wrap:wrap"><span class="ns-pill cian">Exploración 3D</span>${on ? '' : `<span class="ns-pill dev">${esc(t.status)}</span>`}</div>
        <h4>${esc(t.title)}</h4><p>${esc(t.description || '')}</p><small>${esc(t.steps || '')}</small>
        ${on ? `<a class="ns-go" href="${esc(t.url)}">Comenzar recorrido →</a>` : '<span class="ns-go" style="color:var(--text-muted)">Comenzar recorrido → (pronto)</span>'}</div></div>`;
  }

  // ---- nivel 2: materias del año
  function pintarAreas(year) {
    if (!year.areas.length) {
      return `<div class="ns-paso"><b>2</b><h3>Elegí la materia</h3></div><div class="ns-vacio ns-fade"><b>🚧</b>${esc(year.aviso || 'Pronto sumaremos contenido para este año.')}</div>`;
    }
    return `<div class="ns-paso"><b>2</b><h3>Elegí la materia</h3><small>${esc(year.name)}</small></div>
      <div class="ns-grid">${year.areas.map((a, i) => {
        const n = a.acreditaciones.length, nd = a.acreditaciones.filter((x) => x.status === 'Disponible').length;
        return `<button type="button" class="ns-card" style="animation-delay:${i * 60}ms" data-a="${a.id}"><div class="ns-ico">${a.icon || '🩺'}</div><h4>${esc(a.name)}</h4><p>${esc(a.description || '')}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="ns-pill ok">${nd} de ${n} acreditaciones</span>${a.tours3D && a.tours3D.length ? `<span class="ns-pill cian">${a.tours3D.length} recorrido 3D</span>` : ''}</div><span class="ns-go">Ingresar →</span></button>`;
      }).join('')}</div>`;
  }

  // ---- nivel 3: catálogo del área
  async function pintarCatalogo(year, area) {
    const idx = {}; const areasUsadas = [...new Set(area.acreditaciones.map((a) => a.area))];
    await Promise.all(areasUsadas.map(async (ar) => { const j = await indice(ar); if (j) (j.acreditaciones || []).forEach((x) => { idx[`${ar}/${x.id}`] = x; }); }));
    const acrs = area.acreditaciones.map((a) => {
      const x = idx[`${a.area}/${a.id}`];
      return Object.assign({}, a, { _pasos: x && x.pasos ? x.pasos : a.steps, _estado: x ? (x.estado === 'activo' ? 'Disponible' : 'Próximamente') : a.status });
    });
    const res = resultados();
    return `<nav class="ns-miga" aria-label="Ruta"><button type="button" data-y="${year.id}">${esc(year.name)}</button><span>›</span><b>${esc(area.name)}</b></nav>
      <div class="ns-area-cab ns-fade"><div class="ns-ico">${area.icon || '🩺'}</div><div><h2>${esc(area.fullName || area.name)}</h2><p>${esc(area.description || '')}</p></div></div>
      <div class="ns-paso"><b>3</b><h3>Catálogo del área</h3></div>
      <section class="ns-sec" style="margin-top:6px"><h3>Acreditaciones &amp; destrezas clínicas <span>${acrs.filter((a) => a._estado === 'Disponible').length}/${acrs.length}</span></h3>
        <div class="ns-grid">${acrs.map((a, i) => tarjetaAcr(a, i, res)).join('')}</div></section>
      <section class="ns-sec"><h3>Recorridos virtuales 3D <span>${(area.tours3D || []).length}</span></h3>
        ${(area.tours3D || []).length ? `<div class="ns-grid">${area.tours3D.map(tarjetaTour).join('')}</div>` : '<div class="ns-vacio">Pronto sumaremos recorridos para esta materia.</div>'}</section>`;
  }

  let token = 0;
  async function render() {
    leerHash(); const mi = ++token;
    const year = DB.years.find((y) => y.id === S.year) || DB.years[0];
    pintarAnios();
    const cont = $('#ns-contenido');
    if (!S.area) { cont.innerHTML = pintarAreas(year); if (window.NikaSimMascota && mi > 1) window.NikaSimMascota.decir(year.areas.length ? ((DB.mascota || {}).alCambiarAnio || '').replace('{anio}', year.name) : ((DB.mascota || {}).sinContenido || ''), { feliz: true }); return; }
    const area = year.areas.find((a) => a.id === S.area);
    cont.innerHTML = '<div class="ns-vacio ns-fade">Cargando catálogo…</div>';
    const html = await pintarCatalogo(year, area);
    if (mi === token) { cont.innerHTML = html; if (window.NikaSimMascota) window.NikaSimMascota.decir(((DB.mascota || {}).alElegirArea || '').replace('{area}', area.name).replace('{n}', area.acreditaciones.filter((x) => x.status === 'Disponible').length), { salto: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  // ---- eventos
  document.addEventListener('click', (e) => {
    const y = e.target.closest('[data-y]'); if (y) { ir(y.dataset.y, null); return; }
    const a = e.target.closest('button[data-a]'); if (a) { ir(S.year, a.dataset.a); return; }
    const l = e.target.closest('[data-ir]'); if (l) { e.preventDefault(); const [yy, aa] = l.dataset.ir.split('/'); ir(yy, aa); document.body.classList.remove('ns-abierto'); }
  });
  window.addEventListener('hashchange', render);

  // ---- sidebar colapsable + menú móvil
  try { if (localStorage.getItem('nikasim_side') === '1') document.body.classList.add('ns-colapsado'); } catch (_) {}
  $('#ns-colapsar').addEventListener('click', () => { const c = document.body.classList.toggle('ns-colapsado'); try { localStorage.setItem('nikasim_side', c ? '1' : '0'); } catch (_) {} });
  $('#ns-burger').addEventListener('click', () => document.body.classList.toggle('ns-abierto'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('ns-abierto'); });
  document.addEventListener('click', (e) => { if (document.body.classList.contains('ns-abierto') && !e.target.closest('#ns-side') && !e.target.closest('#ns-burger')) document.body.classList.remove('ns-abierto'); });

  // ---- Nika, la mascota: sigue el cursor con los ojos, saluda, salta al tocarla y da consejos
  const Nika = (function () {
    const btn = $('#ns-nika'), txt = $('#ns-saludo'); let tipo = 0, hablando = 0, ult = 0; const M = DB.mascota || {};
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animar(c, ms) { btn.classList.remove(c); void btn.offsetWidth; btn.classList.add(c); setTimeout(() => btn.classList.remove(c), ms); }
    function decir(msg, o) {
      o = o || {}; clearInterval(hablando); if (!msg) return; ult = Date.now();
      if (reduce) { txt.textContent = msg; return; }
      let i = 0; txt.textContent = ''; btn.classList.add('habla');
      hablando = setInterval(() => { i += 2; txt.textContent = msg.slice(0, i); if (i >= msg.length) { clearInterval(hablando); btn.classList.remove('habla'); } }, 22);
      if (o.salto) animar('salta', 700); if (o.feliz) animar('feliz', 720);
    }
    const consejo = () => { const t = M.tips || []; if (!t.length) return; decir(t[tipo++ % t.length], { salto: true }); };
    btn.addEventListener('click', consejo);
    if (!reduce) document.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.4);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      btn.style.setProperty('--ex', (dx / d * 5 * k).toFixed(1) + 'px'); btn.style.setProperty('--ey', (dy / d * 3.5 * k).toFixed(1) + 'px');
    });
    setTimeout(() => animar('saluda', 2400), 600);
    setInterval(() => { if (document.hidden || Date.now() - ult < 25000) return; consejo(); }, 30000);
    return { decir, animar, saludo: () => decir(M.saludo || '', { salto: true }) };
  })();
  window.NikaSimMascota = Nika;

  render(); Nika.saludo();
})();
