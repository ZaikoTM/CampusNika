/* CAMPUS NIKA · Mis notas: biblioteca de cuadernos (uno por materia) con páginas de notas editables, estilo GoodNotes. */
(function () {
  'use strict';
  const MATERIAS = {
    cirugia: ['Cirugía', '🔪', '#6366f1', '#7c3aed'], ginecologia: ['Ginecología y Obstetricia', '🤰', '#ec4899', '#a855f7'],
    siam: ['S.I.A.M.', '🫀', '#06b6d4', '#0d9488'], pfo: ['PFO', '🎓', '#f59e0b', '#b45309'],
    medicinalegal: ['Medicina Legal', '⚖️', '#be123c', '#d4a017'], medicinadeportiva: ['Medicina Deportiva', '🏃', '#16a34a', '#0ea5e9'],
    _libre: ['Notas sueltas', '✏️', '#64748b', '#334155']
  };
  const COLORES = ['amarillo', 'rosa', 'celeste', 'verde'];
  const LS = 'nika_notas_estudio';
  const $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); };
  const mat = (k) => MATERIAS[k] || [k || 'Sin materia', '📓', '#0ea5e9', '#6366f1'];
  let todas = [], cli = null, uid = null, actual = null, filtroRecurso = null;

  const lsLeer = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (_) { return []; } };
  const lsGuardar = (a) => { try { localStorage.setItem(LS, JSON.stringify(a)); } catch (_) {} };
  const toast = (m) => { try { if (typeof window.showToast === 'function') return window.showToast(m); } catch (_) {} };

  async function cargar() {
    todas = lsLeer().slice();
    try {
      const ns = window.NikaSupabase; if (ns && ns.ready) await ns.ready; cli = ns && ns.client;
      const { data: s } = await cli.auth.getSession(); uid = s && s.session && s.session.user ? s.session.user.id : null;
      if (uid) { const { data } = await cli.from('notas_estudio').select('*').order('creado_en', { ascending: false }); if (data) todas = todas.filter((n) => n.local).concat(data); }
    } catch (_) {}
    biblioteca();
  }

  const claveCuaderno = (n) => n.modulo || '_libre';

  function biblioteca() {
    $('gn-cuaderno').hidden = true; $('gn-biblioteca').hidden = false; actual = null;
    const grupos = {}; todas.forEach((n) => { (grupos[claveCuaderno(n)] = grupos[claveCuaderno(n)] || []).push(n); });
    const claves = Object.keys(MATERIAS).filter((k) => k !== '_libre').concat(Object.keys(grupos).filter((k) => !MATERIAS[k]));
    const lista = claves.map((k) => [k, grupos[k] || []]);
    if (grupos._libre) lista.push(['_libre', grupos._libre]);
    const total = todas.length;
    $('gn-estantes').innerHTML = (total ? '' : '<p class="gn-vacio gn-vacio--hero">Todavía no tomaste notas. Abrí un video o material en la sala de estudio y escribí la primera: va a aparecer acá, en el cuaderno de su materia.</p>')
      + lista.map(([k, g], i) => {
        const m = mat(k), ult = g.length ? new Date(Math.max.apply(null, g.map((n) => +new Date(n.creado_en)))).toLocaleDateString('es-AR') : '';
        return '<button type="button" class="gn-cuaderno" data-k="' + esc(k) + '" style="--c1:' + m[2] + ';--c2:' + m[3] + ';--i:' + i + '">'
          + '<span class="gn-espiral" aria-hidden="true">' + '<i></i>'.repeat(7) + '</span>'
          + '<span class="gn-emoji">' + m[1] + '</span><span class="gn-nombre">' + esc(m[0]) + '</span>'
          + '<span class="gn-pie"><b>' + g.length + '</b> ' + (g.length === 1 ? 'nota' : 'notas') + (ult ? ' · ' + ult : '') + '</span></button>';
      }).join('');
  }

  function abrir(k) {
    actual = k; filtroRecurso = null; $('gn-q2').value = '';
    $('gn-biblioteca').hidden = true; const c = $('gn-cuaderno'); c.hidden = false;
    c.style.setProperty('--c1', mat(k)[2]); c.style.setProperty('--c2', mat(k)[3]);
    c.classList.remove('gn-abre'); void c.offsetWidth; c.classList.add('gn-abre');
    $('gn-titulo').textContent = mat(k)[1] + ' ' + mat(k)[0];
    paginas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const delCuaderno = () => todas.filter((n) => claveCuaderno(n) === actual);

  function paginas() {
    const q = $('gn-q2').value.trim().toLowerCase();
    const base = delCuaderno();
    // índice por recurso
    const recs = {}; base.forEach((n) => { const k = n.recurso_titulo || (n.tipo === 'libre' ? 'Notas sueltas' : n.recurso); recs[k] = (recs[k] || 0) + 1; });
    $('gn-indice').innerHTML = '<button type="button" class="gn-tab' + (filtroRecurso ? '' : ' on') + '" data-r="">Todo <b>' + base.length + '</b></button>'
      + Object.keys(recs).map((k) => '<button type="button" class="gn-tab' + (filtroRecurso === k ? ' on' : '') + '" data-r="' + esc(k) + '">' + esc(k.length > 38 ? k.slice(0, 36) + '…' : k) + ' <b>' + recs[k] + '</b></button>').join('');
    const vis = base.filter((n) => (!filtroRecurso || (n.recurso_titulo || (n.tipo === 'libre' ? 'Notas sueltas' : n.recurso)) === filtroRecurso) && (!q || ((n.texto || '') + ' ' + (n.recurso_titulo || '')).toLowerCase().includes(q)))
      .sort((a, b) => (a.posicion == null ? 1e12 : a.posicion) - (b.posicion == null ? 1e12 : b.posicion) || +new Date(b.creado_en) - +new Date(a.creado_en));
    $('gn-cuenta').textContent = vis.length + (vis.length === 1 ? ' nota' : ' notas');
    $('gn-paginas').innerHTML = vis.length ? vis.map((n, i) => tarjeta(n, i)).join('')
      : '<p class="gn-vacio">' + (base.length ? 'No hay notas con ese filtro.' : 'Este cuaderno está vacío. Tocá “＋ Nueva nota” para escribir la primera.') + '</p>';
  }

  function tarjeta(n, i) {
    const pos = n.posicion == null ? '' : '<span class="gn-pos">' + (n.tipo === 'video' ? '⏱ ' + fmt(n.posicion) : '📄 Pág. ' + n.posicion) + '</span>';
    const origen = n.recurso_titulo ? '<span class="gn-origen" title="' + esc(n.recurso_titulo) + '">' + esc(n.recurso_titulo) + '</span>' : '';
    const ir = n.modulo && n.tipo !== 'libre' ? '<a class="gn-ir" href="estudio.html?modulo=' + encodeURIComponent(n.modulo) + '">Ir a la sala →</a>' : '';
    return '<article class="gn-nota gn-c-' + esc(COLORES.includes(n.color) ? n.color : 'amarillo') + '" data-id="' + esc(n.id) + '" style="--i:' + Math.min(i, 14) + '">'
      + '<header>' + pos + origen + '<span class="gn-acc"><button type="button" data-a="color" title="Cambiar color" aria-label="Cambiar color">🎨</button><button type="button" data-a="borrar" title="Borrar" aria-label="Borrar nota">🗑️</button></span></header>'
      + '<div class="gn-texto" contenteditable="true" spellcheck="false" data-a="texto" aria-label="Texto de la nota">' + esc(n.texto) + '</div>'
      + '<footer><small>' + new Date(n.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + '</small>' + ir + '</footer></article>';
  }

  async function actualizar(n, campos) {
    Object.assign(n, campos);
    if (n.local) { lsGuardar(lsLeer().map((x) => (x.id === n.id ? Object.assign(x, campos) : x))); return; }
    if (uid && cli) { try { await cli.from('notas_estudio').update(campos).eq('id', n.id); } catch (_) {} }
  }
  async function borrar(n) {
    todas = todas.filter((x) => x !== n);
    if (n.local) lsGuardar(lsLeer().filter((x) => x.id !== n.id));
    else if (uid && cli) { try { await cli.from('notas_estudio').delete().eq('id', n.id); } catch (_) {} }
  }
  async function crear() {
    const fila = { recurso: 'libre:' + actual, recurso_titulo: 'Notas sueltas', modulo: actual === '_libre' ? null : actual, up_id: null, tipo: 'libre', posicion: null, texto: '', color: 'amarillo' };
    let nueva = null;
    if (uid && cli) { try { const { data, error } = await cli.from('notas_estudio').insert(fila).select().single(); if (!error && data) nueva = data; } catch (_) {} }
    if (!nueva) { nueva = Object.assign({ id: 'l' + Date.now(), local: true, creado_en: new Date().toISOString() }, fila); lsGuardar(lsLeer().concat([nueva])); }
    todas.unshift(nueva); filtroRecurso = null; $('gn-q2').value = ''; paginas();
    const el = document.querySelector('.gn-nota[data-id="' + nueva.id + '"] .gn-texto'); if (el) { el.focus(); el.parentElement.classList.add('gn-nueva'); }
  }

  document.addEventListener('click', (e) => {
    const cu = e.target.closest('.gn-cuaderno'); if (cu) return abrir(cu.dataset.k);
    const tab = e.target.closest('.gn-tab'); if (tab) { filtroRecurso = tab.dataset.r || null; return paginas(); }
    const b = e.target.closest('.gn-acc button'), card = e.target.closest('.gn-nota');
    if (b && card) {
      const n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
      if (b.dataset.a === 'color') { const c = COLORES[(COLORES.indexOf(n.color) + 1 + COLORES.length) % COLORES.length] || 'amarillo'; actualizar(n, { color: c }); card.className = card.className.replace(/gn-c-\w+/, 'gn-c-' + c); }
      else if (b.dataset.a === 'borrar' && confirm('¿Borrar esta nota?')) { card.classList.add('gn-fuera'); setTimeout(async () => { await borrar(n); paginas(); }, 260); }
    }
  });
  document.addEventListener('focusout', (e) => {
    const t = e.target.closest && e.target.closest('.gn-texto'); if (!t) return;
    const card = t.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
    const tx = t.innerText.replace(/\n{3,}/g, '\n\n').trim();
    if (tx !== (n.texto || '')) actualizar(n, { texto: tx.slice(0, 1200) });
  });

  $('gn-volver').addEventListener('click', biblioteca);
  $('gn-nueva').addEventListener('click', crear);
  $('gn-q2').addEventListener('input', paginas);
  $('gn-q').addEventListener('input', () => {
    const q = $('gn-q').value.trim().toLowerCase(), r = $('gn-resultados'), est = $('gn-estantes');
    if (!q) { r.hidden = true; est.hidden = false; return; }
    est.hidden = true; r.hidden = false;
    const f = todas.filter((n) => ((n.texto || '') + ' ' + (n.recurso_titulo || '')).toLowerCase().includes(q)).slice(0, 60);
    r.innerHTML = f.length ? '<div class="gn-paginas">' + f.map((n, i) => tarjeta(n, i)).join('') + '</div>' : '<p class="gn-vacio">Sin resultados.</p>';
  });

  cargar();
})();
