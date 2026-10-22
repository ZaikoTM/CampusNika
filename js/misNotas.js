/* CAMPUS NIKA · Mis notas: biblioteca de cuadernos por año y materia, notas tipo post-it con texto enriquecido,
   título propio, colores, arrastrar al tacho, impresión del cuaderno y sincronización en la nube (tabla notas_estudio).
   Título y formato viajan empaquetados dentro de la columna "texto": no hace falta ningún SQL extra. */
(function () {
  'use strict';
  const MATERIAS = {
    cirugia: ['Cirugía', '🔪', '#6366f1', '#7c3aed'], ginecologia: ['Ginecología y Obstetricia', '🤰', '#ec4899', '#a855f7'],
    siam: ['S.I.A.M.', '🫀', '#06b6d4', '#0d9488'], pfo: ['PFO', '🎓', '#f59e0b', '#b45309'],
    medicinalegal: ['Medicina Legal', '⚖️', '#be123c', '#d4a017'], medicinadeportiva: ['Medicina Deportiva', '🏃', '#16a34a', '#0ea5e9'],
    _libre: ['Notas sueltas', '✏️', '#64748b', '#334155']
  };
  const ANIOS = [[4, ['medicinalegal', 'medicinadeportiva']], [5, ['siam', 'ginecologia', 'cirugia', 'medicinalegal', 'medicinadeportiva']], [6, ['pfo']]];
  const COLORES = { amarillo: '#fef08a', rosa: '#fbcfe8', celeste: '#bae6fd', verde: '#bbf7d0', naranja: '#fed7aa', lila: '#ddd6fe', blanco: '#ffffff', gris: '#e2e8f0' };
  const ORDENES = { 'anio-asc': 'Por año (4° → 6°)', 'anio-desc': 'Por año (6° → 4°)', 'nombre-asc': 'Nombre (A → Z)', 'nombre-desc': 'Nombre (Z → A)', recientes: 'Más recientes' };
  const LS = 'nika_notas_estudio', LS_ORDEN = 'nika_notas_orden', LS_COLOR = 'nika_notas_color';
  const $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); };
  const mat = (k) => MATERIAS[k] || [k || 'Sin materia', '📓', '#0ea5e9', '#6366f1'];
  const claveCuaderno = (n) => n.modulo || '_libre';
  let todas = [], cli = null, uid = null, actual = null, filtroRecurso = null, estadoNube = 'cargando', rango = null, ocultarT = null;
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (_) {} return null; };
  const lsLeer = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (_) { return []; } };
  const lsGuardar = (a) => { try { localStorage.setItem(LS, JSON.stringify(a)); } catch (_) {} };
  // Sin conexión: copia de las notas de la nube + cola de cambios que se suben solos al volver la señal
  const LS_CACHE = 'nika_notas_cache', LS_COLA = 'nika_notas_cola';
  const cacheLeer = () => { try { return JSON.parse(localStorage.getItem(LS_CACHE) || 'null'); } catch (_) { return null; } };
  const cacheGuardar = () => { try { localStorage.setItem(LS_CACHE, JSON.stringify({ uid, notas: todas.filter((n) => !n.local) })); } catch (_) {} };
  const colaLeer = () => { try { return JSON.parse(localStorage.getItem(LS_COLA) || '[]'); } catch (_) { return []; } };
  const colaGuardar = (c) => { try { localStorage.setItem(LS_COLA, JSON.stringify(c)); } catch (_) {} };
  function encolar(op) {
    let c = colaLeer();
    if (op.op === 'del') c = c.filter((x) => x.id !== op.id);
    else { const prev = c.find((x) => x.op === 'upd' && x.id === op.id); if (prev) { Object.assign(prev.db, op.db); return colaGuardar(c); } }
    c.push(op); colaGuardar(c);
  }
  async function vaciarCola() {
    if (!(uid && cli)) return;
    const resto = [];
    for (const o of colaLeer()) {
      try {
        const r = o.op === 'del' ? await cli.from('notas_estudio').delete().eq('id', o.id) : await cli.from('notas_estudio').update(o.db).eq('id', o.id);
        if (r.error) resto.push(o);
      } catch (_) { resto.push(o); }
    }
    colaGuardar(resto);
  }
  const colorNueva = () => { const c = store(LS_COLOR); return COLORES[c] ? c : 'amarillo'; };

  /* ---------- empaquetado: título + formato dentro de "texto" ---------- */
  function unpack(n) {
    if (typeof n.texto === 'string' && n.texto.indexOf('{"nk":1') === 0) {
      try { const o = JSON.parse(n.texto); n.titulo = n.titulo || o.t || ''; n.contenido_html = n.contenido_html || o.h || null; n.texto = o.p || ''; n.eliminada_en = o.d || null; n.titulo_estilo = (o.e && typeof o.e === 'object') ? o.e : null; } catch (_) {}
    }
    return n;
  }
  const pack = (n) => JSON.stringify({ nk: 1, t: n.titulo || '', h: n.contenido_html || '', p: n.texto || '', d: n.eliminada_en || '', e: n.titulo_estilo || '' });
  const necesitaPack = (n) => !!(n.titulo || n.contenido_html || n.eliminada_en || n.titulo_estilo);
  const DIAS_PAPELERA = 7;
  const vivas = () => todas.filter((n) => !n.eliminada_en);
  const enPapelera = () => todas.filter((n) => n.eliminada_en);
  const diasRestantes = (n) => Math.max(0, Math.ceil(DIAS_PAPELERA - (Date.now() - new Date(n.eliminada_en)) / 86400000));

  /* ---------- texto enriquecido: limpieza ---------- */
  const TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'SPAN', 'FONT', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'MARK', 'SUB', 'SUP', 'BLOCKQUOTE']);
  const PROPS = new Set(['color', 'background-color', 'background', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'text-transform', 'text-align']);
  function limpiar(html) {
    const doc = new DOMParser().parseFromString('<div>' + String(html || '') + '</div>', 'text/html');
    const raiz = doc.body.firstChild;
    (function rec(n) {
      [...n.childNodes].forEach((h) => {
        if (h.nodeType === 3) return;
        if (h.nodeType !== 1 || !TAGS.has(h.tagName)) { if (h.nodeType === 1 && /^(SCRIPT|STYLE|IFRAME|OBJECT)$/.test(h.tagName)) { h.remove(); return; } rec(h); while (h.firstChild) n.insertBefore(h.firstChild, h); h.remove(); return; }
        [...h.attributes].forEach((a) => {
          if (a.name === 'style') {
            const ok = a.value.split(';').map((d) => d.trim()).filter((d) => { const p = d.split(':')[0].trim().toLowerCase(); return PROPS.has(p) && !/url\(|expression|javascript/i.test(d); });
            if (ok.length) h.setAttribute('style', ok.join('; ')); else h.removeAttribute('style');
          } else if (!(h.tagName === 'FONT' && /^(color|face|size)$/.test(a.name))) h.removeAttribute(a.name);
        });
        rec(h);
      });
    })(raiz);
    return raiz.innerHTML;
  }
  const contenido = (n) => (n.contenido_html ? limpiar(n.contenido_html) : esc(n.texto || '').replace(/\n/g, '<br>'));

  /* ---------- carga y sincronización ---------- */
  function filaNube(n) {
    return { recurso: n.recurso || ('libre:' + (n.modulo || '_libre')), recurso_titulo: n.recurso_titulo || null, modulo: n.modulo || null, up_id: n.up_id || null, tipo: n.tipo || 'material',
      posicion: n.posicion == null ? null : n.posicion, texto: necesitaPack(n) ? pack(n) : (n.texto || ''), color: n.color || 'amarillo', creado_en: n.creado_en || new Date().toISOString() };
  }
  async function cargar() {
    let locales = lsLeer();
    try {
      const ns = window.NikaSupabase; if (ns && ns.ready) await ns.ready; cli = ns && ns.client;
      const { data: s } = await cli.auth.getSession(); uid = s && s.session && s.session.user ? s.session.user.id : null;
    } catch (_) {}
    if (uid && cli) {
      await vaciarCola();
      const subidas = new Set();
      for (const n of locales) {
        try { const { error } = await cli.from('notas_estudio').insert(filaNube(n)); if (!error) subidas.add(n.id); else if (/relation|does not exist|PGRST205/i.test(error.message + error.code)) break; } catch (_) {}
      }
      if (subidas.size) { locales = locales.filter((n) => !subidas.has(n.id)); lsGuardar(locales); }
      try {
        const { data, error } = await cli.from('notas_estudio').select('*').order('creado_en', { ascending: false });
        if (error) throw error;
        todas = locales.concat((data || []).map(unpack)); estadoNube = (locales.length || colaLeer().length) ? 'parcial' : 'ok'; cacheGuardar();
      } catch (_) { const c = cacheLeer(); todas = locales.concat(c && (!uid || !c.uid || c.uid === uid) ? c.notas : []); estadoNube = 'offline'; }
    } else {
      const c = cacheLeer();
      if (c && c.notas && c.notas.length) { todas = locales.concat(c.notas); estadoNube = 'offline'; }
      else { todas = locales; estadoNube = 'local'; }
    }
    await purgar(); pintarEstado(); pintarPapelera(); biblioteca();
    if (!store('nika_notas_guia')) setTimeout(() => guia(0), 700);
  }
  function pintarEstado() {
    const el = $('gn-sync'); if (!el) return;
    const t = { ok: ['☁️ Sincronizado en la nube', 'ok'], parcial: ['☁️ Algunas notas siguen solo en este dispositivo', 'warn'], offline: ['📴 Sin conexión · tus cambios se guardan en este dispositivo y se suben solos al volver la señal', 'warn'], local: ['📱 Solo en este dispositivo · iniciá sesión para sincronizar', 'warn'], error: ['⚠️ Sin conexión con la nube: se guarda en este dispositivo', 'err'], cargando: ['Cargando…', ''] }[estadoNube];
    el.textContent = t[0]; el.dataset.e = t[1];
  }

  /* ---------- biblioteca ---------- */
  function tapa(k, g, i) {
    const m = mat(k), ult = g.length ? new Date(Math.max.apply(null, g.map((n) => +new Date(n.creado_en)))).toLocaleDateString('es-AR') : '';
    return '<button type="button" class="gn-cuaderno" data-k="' + esc(k) + '" style="--c1:' + m[2] + ';--c2:' + m[3] + ';--i:' + i + '">'
      + '<span class="gn-espiral" aria-hidden="true">' + '<i></i>'.repeat(7) + '</span><span class="gn-emoji">' + m[1] + '</span><span class="gn-nombre">' + esc(m[0]) + '</span>'
      + '<span class="gn-pie"><b>' + g.length + '</b> ' + (g.length === 1 ? 'nota' : 'notas') + (ult ? ' · ' + ult : '') + '</span></button>';
  }
  function biblioteca() {
    $('gn-cuaderno').hidden = true; $('gn-biblioteca').hidden = false; actual = null; ocultarFormato(true);
    const grupos = {}; vivas().forEach((n) => { (grupos[claveCuaderno(n)] = grupos[claveCuaderno(n)] || []).push(n); });
    const orden = ORDENES[store(LS_ORDEN)] ? store(LS_ORDEN) : 'anio-asc'; pintarOrden(orden);
    const ultimo = (k) => Math.max(0, ...(grupos[k] || []).map((n) => +new Date(n.creado_en)));
    const nombre = (k) => mat(k)[0].toLowerCase();
    let html = '', i = 0;
    if (!vivas().length) html += '<p class="gn-vacio gn-vacio--hero">Todavía no tomaste notas. Abrí un video o material en la sala de estudio y escribí la primera, o creá una nota suelta desde cualquier cuaderno.</p>';
    if (orden === 'anio-asc' || orden === 'anio-desc') {
      const lista = ANIOS.slice(); if (orden === 'anio-desc') lista.reverse();
      lista.forEach(([a, ks]) => { html += '<h3 class="gn-anio"><span>' + a + '° año</span></h3><div class="gn-estantes">' + ks.slice().sort((x, y) => nombre(x).localeCompare(nombre(y))).map((k) => tapa(k, grupos[k] || [], i++)).join('') + '</div>'; });
      const otros = Object.keys(grupos).filter((k) => !MATERIAS[k]).concat(['_libre']);
      html += '<h3 class="gn-anio"><span>Notas sueltas</span></h3><div class="gn-estantes">' + otros.map((k) => tapa(k, grupos[k] || [], i++)).join('') + '</div>';
    } else {
      const ks = [...new Set(ANIOS.flatMap((x) => x[1]).concat(Object.keys(grupos)).concat(['_libre']))];
      if (orden === 'nombre-asc') ks.sort((x, y) => nombre(x).localeCompare(nombre(y)));
      else if (orden === 'nombre-desc') ks.sort((x, y) => nombre(y).localeCompare(nombre(x)));
      else ks.sort((x, y) => ultimo(y) - ultimo(x));
      html += '<div class="gn-estantes">' + ks.map((k) => tapa(k, grupos[k] || [], i++)).join('') + '</div>';
    }
    $('gn-estantes').innerHTML = html;
  }
  function pintarOrden(o) {
    $('gn-orden-txt').textContent = ORDENES[o];
    document.querySelectorAll('#gn-orden-menu li').forEach((li) => li.setAttribute('aria-selected', String(li.dataset.v === o)));
  }

  /* ---------- cuaderno ---------- */
  function abrir(k) {
    actual = k; filtroRecurso = null; $('gn-q2').value = '';
    $('gn-biblioteca').hidden = true; const c = $('gn-cuaderno'); c.hidden = false;
    c.style.setProperty('--c1', mat(k)[2]); c.style.setProperty('--c2', mat(k)[3]);
    c.classList.remove('gn-abre'); void c.offsetWidth; c.classList.add('gn-abre');
    $('gn-titulo').textContent = mat(k)[1] + ' ' + mat(k)[0];
    pintarColorNueva();
    paginas(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const delCuaderno = () => vivas().filter((n) => claveCuaderno(n) === actual);
  const etiquetaRec = (n) => n.recurso_titulo || (n.tipo === 'libre' ? 'Notas sueltas' : n.recurso);
  const visibles = () => {
    const q = $('gn-q2').value.trim().toLowerCase();
    return delCuaderno().filter((n) => (!filtroRecurso || etiquetaRec(n) === filtroRecurso) && (!q || ((n.texto || '') + ' ' + (n.titulo || '') + ' ' + (n.recurso_titulo || '') + ' ' + (n.etiquetas || []).join(' ')).toLowerCase().includes(q)))
      .sort((a, b) => (a.posicion == null ? 1e12 : a.posicion) - (b.posicion == null ? 1e12 : b.posicion) || +new Date(b.creado_en) - +new Date(a.creado_en));
  };

  function paginas() {
    const base = delCuaderno(), recs = {}; base.forEach((n) => { const k = etiquetaRec(n); recs[k] = (recs[k] || 0) + 1; });
    $('gn-indice').innerHTML = '<button type="button" class="gn-tab' + (filtroRecurso ? '' : ' on') + '" data-r="">Todo <b>' + base.length + '</b></button>'
      + Object.keys(recs).map((k) => '<button type="button" class="gn-tab' + (filtroRecurso === k ? ' on' : '') + '" data-r="' + esc(k) + '">' + esc(k.length > 38 ? k.slice(0, 36) + '…' : k) + ' <b>' + recs[k] + '</b></button>').join('');
    const vis = visibles();
    $('gn-cuenta').textContent = vis.length + (vis.length === 1 ? ' nota' : ' notas');
    $('gn-paginas').innerHTML = vis.length ? vis.map(tarjeta).join('')
      : '<p class="gn-vacio">' + (base.length ? 'No hay notas con ese filtro.' : 'Este cuaderno está vacío. Tocá “＋ Nueva nota” para escribir la primera.') + '</p>';
  }

  function tarjeta(n, i) {
    const c = COLORES[n.color] ? n.color : 'amarillo';
    const pos = n.posicion == null ? '' : '<span class="gn-pos">' + (n.tipo === 'video' ? '⏱ ' + fmt(n.posicion) : (n.anotacion === 'pin' ? '📌 ' : n.anotacion === 'texto' ? '📝 ' : '📄 ') + 'Pág. ' + n.posicion) + '</span>';
    const etq = (n.etiquetas || []).length ? '<span class="gn-etq" style="display:flex;flex-wrap:wrap;gap:4px;margin-left:auto">' + n.etiquetas.map((e) => '<i style="font-style:normal;font-size:.68rem;font-weight:800;background:rgba(15,23,42,.12);border-radius:999px;padding:1px 8px">#' + esc(e) + '</i>').join('') + '</span>' : '';
    const origen = n.recurso_titulo && n.tipo !== 'libre' ? '<span class="gn-origen" title="' + esc(n.recurso_titulo) + '">' + esc(n.recurso_titulo) + '</span>' : '';
    const ir = n.modulo && n.tipo !== 'libre' ? '<a class="gn-ir" href="estudio.html?modulo=' + encodeURIComponent(n.modulo) + '">Ir a la sala →</a>' : '';
    return '<article class="gn-nota" data-id="' + esc(n.id) + '" style="--nk:' + COLORES[c] + ';--i:' + Math.min(i || 0, 14) + '">'
      + '<header><button type="button" class="gn-grip" title="Arrastrá la nota al tacho para borrarla" aria-label="Mover nota al tacho">⠿</button>' + pos + origen
      + '<span class="gn-acc"><button type="button" data-a="color" title="Color de la nota" aria-label="Color">🎨</button><button type="button" data-a="imprimir" title="Imprimir esta nota" aria-label="Imprimir nota">🖨️</button><button type="button" data-a="borrar" title="Borrar" aria-label="Borrar nota">🗑️</button></span></header>'
      + '<input class="gn-titulo-in" type="text" maxlength="80" style="' + esc(estiloTitulo(n)) + '" value="' + esc(n.titulo || '') + '" placeholder="Título de la nota" aria-label="Título de la nota">'
      + '<div class="gn-texto" contenteditable="true" spellcheck="false" aria-label="Texto de la nota">' + contenido(n) + '</div>'
      + '<footer><small>' + new Date(n.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + '</small>' + etq + ir + '</footer></article>';
  }

  /* ---------- escritura (nube o local) ---------- */
  async function actualizar(n, campos) {
    Object.assign(n, campos);
    if (n.local) { lsGuardar(lsLeer().map((x) => (x.id === n.id ? Object.assign(x, campos) : x))); return; }
    cacheGuardar();
    const db = {};
    if ('texto' in campos || 'titulo' in campos || 'contenido_html' in campos || 'eliminada_en' in campos || 'titulo_estilo' in campos) db.texto = necesitaPack(n) ? pack(n) : (n.texto || '');
    if ('color' in campos) db.color = campos.color;
    if (!Object.keys(db).length) return;
    if (!(uid && cli) || !navigator.onLine) { encolar({ op: 'upd', id: n.id, db }); estadoNube = 'offline'; pintarEstado(); return; }
    try { const { error } = await cli.from('notas_estudio').update(db).eq('id', n.id); if (error) { encolar({ op: 'upd', id: n.id, db }); estadoNube = 'offline'; pintarEstado(); } } catch (_) { encolar({ op: 'upd', id: n.id, db }); estadoNube = 'offline'; pintarEstado(); }
  }
  async function insertar(n) {
    if (uid && cli) {
      try { const { data, error } = await cli.from('notas_estudio').insert(filaNube(n)).select().single(); if (!error && data) return unpack(data); } catch (_) {}
    }
    const l = Object.assign({}, n, { id: 'l' + Date.now() + Math.random().toString(36).slice(2, 5), local: true });
    lsGuardar(lsLeer().concat([l])); return l;
  }
  async function borrarNota(n) {
    todas = todas.filter((x) => x !== n);
    if (n.local) lsGuardar(lsLeer().filter((x) => x.id !== n.id));
    else {
      cacheGuardar();
      if (!(uid && cli) || !navigator.onLine) { encolar({ op: 'del', id: n.id }); estadoNube = 'offline'; pintarEstado(); }
      else { try { const r = await cli.from('notas_estudio').delete().eq('id', n.id); if (r.error) throw r.error; } catch (_) { encolar({ op: 'del', id: n.id }); estadoNube = 'offline'; pintarEstado(); } }
    }
  }
  async function crear() {
    $('gn-q2').value = '';
    const n = await insertar({ recurso: 'libre:' + actual, recurso_titulo: 'Notas sueltas', modulo: actual === '_libre' ? null : actual, up_id: null, tipo: 'libre', posicion: null, texto: '', titulo: '', contenido_html: null, color: colorNueva(), creado_en: new Date().toISOString() });
    todas.unshift(n); filtroRecurso = null; paginas();
    const el = document.querySelector('.gn-nota[data-id="' + n.id + '"]'); if (el) { el.classList.add('gn-nueva'); const ti = el.querySelector('.gn-titulo-in'); if (ti) ti.focus(); }
  }

  /* ---------- aviso con deshacer ---------- */
  let avisoT = null;
  function aviso(msg, sinDeshacer, deshacer) {
    let b = $('gn-aviso'); if (!b) { b = document.createElement('div'); b.id = 'gn-aviso'; document.body.appendChild(b); }
    b.innerHTML = '<span></span>' + (sinDeshacer ? '' : '<button type="button">Deshacer</button>'); b.firstChild.textContent = msg;
    b.classList.add('on'); clearTimeout(avisoT); avisoT = setTimeout(() => b.classList.remove('on'), 6000);
    const bt = b.querySelector('button'); if (bt) bt.onclick = () => { b.classList.remove('on'); if (deshacer) deshacer(); };
  }
  async function eliminar(n) {
    await actualizar(n, { eliminada_en: new Date().toISOString() });
    paginas(); pintarPapelera();
    aviso('Nota movida a la papelera (se conserva 7 días)', false, async () => { await actualizar(n, { eliminada_en: null }); if (actual) paginas(); pintarPapelera(); });
  }

  /* ---------- papelera de reciclaje ---------- */
  function pintarPapelera() {
    const k = enPapelera().length;
    document.querySelectorAll('.gn-pap-n').forEach((e) => { e.textContent = k ? k : ''; e.hidden = !k; });
  }
  async function purgar() {
    const viejas = enPapelera().filter((n) => diasRestantes(n) <= 0);
    for (const n of viejas) await borrarNota(n);
  }
  function verPapelera() {
    $('gn-biblioteca').hidden = true; $('gn-cuaderno').hidden = true; $('gn-papelera').hidden = false; ocultarFormato(true);
    const l = enPapelera().sort((a, b) => +new Date(b.eliminada_en) - +new Date(a.eliminada_en));
    $('gn-pap-lista').innerHTML = l.length ? l.map((n) => {
      const m = mat(claveCuaderno(n)), c = COLORES[n.color] ? n.color : 'amarillo', d = diasRestantes(n);
      return '<article class="gn-nota gn-nota--pap" data-id="' + esc(n.id) + '" style="--nk:' + COLORES[c] + '"><header><span class="gn-origen">' + m[1] + ' ' + esc(m[0]) + '</span><span class="gn-pos">' + (d <= 1 ? 'Se borra hoy' : 'Quedan ' + d + ' días') + '</span></header>'
        + (n.titulo ? '<div class="gn-pap-tit">' + esc(n.titulo) + '</div>' : '') + '<div class="gn-texto gn-texto--ro">' + (contenido(n) || '<i>(nota vacía)</i>') + '</div>'
        + '<footer class="gn-pap-acc"><button type="button" data-p="restaurar">↩ Restaurar</button><button type="button" data-p="borrar">Eliminar para siempre</button></footer></article>';
    }).join('') : '<p class="gn-vacio gn-vacio--hero">La papelera está vacía. Las notas que elimines se guardan acá durante 7 días por si querés recuperarlas.</p>';
    $('gn-pap-vaciar').hidden = !l.length;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function salirPapelera() { $('gn-papelera').hidden = true; actual ? ($('gn-cuaderno').hidden = false, paginas()) : biblioteca(); }

  /* ---------- guía de uso ---------- */
  const PASOS = [
    ['📚', 'Tu biblioteca de cuadernos', 'Cada materia tiene su cuaderno, agrupados por año. Podés ordenarlos por año (ascendente o descendente), por nombre o por los más recientes con el botón “Ordenar”. Tocá un cuaderno para abrirlo.'],
    ['🔖', 'Notas desde videos y materiales', 'Mientras mirás un video o leés un material en la sala de estudio, escribí una nota: se guarda sola con el minuto o la página. Acá la encontrás en el cuaderno de su materia y, al tocar el marcador, volvés a ese punto.'],
    ['✏️', 'Crear una nota suelta', 'Dentro de un cuaderno tocá “＋ Nueva nota”. Elegí antes el color del post-it con “Post-it nuevo”. Escribí un título arriba y el texto abajo; todo se guarda automáticamente.'],
    ['📌', 'Anotaciones sobre el PDF y etiquetas', 'Lo que escribís o marcás con 📌 directamente sobre un PDF del Lector NikaMed aparece acá como una nota más, con su página y sus etiquetas (#importante, #repasar…). Buscá por etiqueta en el buscador, y compartí una nota con un amigo desde el lector con 📤: le llega una notificación y puede guardarla como copia propia.'],
    ['🎨', 'Formato como en un procesador de texto', 'Al hacer clic en una nota aparece la barra de formato: tipografía, tamaño con − y +, negrita, cursiva, subrayado, tachado, MAYÚSCULAS, minúsculas, color del texto, resaltado, alineación y listas. Seleccioná texto y aplicá.'],
    ['🖍️', 'Colores de cada nota', 'Con el botón 🎨 de la nota cambiás el color del post-it entre 8 opciones. Usalos para separar temas: por ejemplo, amarillo para conceptos y rosa para dudas.'],
    ['🗑️', 'Arrastrar al tacho', 'Agarrá el post-it con el mouse (o con el dedo) desde cualquier parte que no sea el texto y llevalo al tacho que aparece abajo a la derecha. También podés usar el botón 🗑️. Nada se pierde: va a la papelera.'],
    ['♻️', 'Papelera de reciclaje', 'Las notas eliminadas quedan 7 días en la papelera. Podés restaurarlas, eliminarlas para siempre o vaciar la papelera. Pasados los 7 días se borran solas.'],
    ['🖨️', 'Imprimir', 'En un cuaderno, “Imprimir” genera una hoja con todas sus notas (respeta el filtro de la pestaña elegida). Con el 🖨️ de una nota imprimís solo esa. Sale lista para papel o PDF.'],
    ['☁️', 'En todos tus dispositivos', 'Tus notas se guardan en la nube asociadas a tu cuenta: las ves en el celular, la tablet y la computadora. El indicador de arriba te dice si todo está sincronizado.'],
    ['🔎', 'Buscar', 'La búsqueda de la biblioteca recorre todos tus cuadernos; la de cada cuaderno, solo ese cuaderno. Busca en títulos, textos y nombre del material.']
  ];
  let paso = 0;
  function guia(i) {
    paso = Math.max(0, Math.min(PASOS.length - 1, i == null ? 0 : i));
    let m = $('gn-guia');
    if (!m) { m = document.createElement('div'); m.id = 'gn-guia'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Guía de Mis notas'); document.body.appendChild(m); }
    const p = PASOS[paso];
    m.innerHTML = '<div class="gn-guia-card"><button type="button" class="gn-guia-x" data-g="cerrar" aria-label="Cerrar">✕</button>'
      + '<div class="gn-guia-ico" key="' + paso + '">' + p[0] + '</div><h3>' + esc(p[1]) + '</h3><p>' + esc(p[2]) + '</p>'
      + '<div class="gn-guia-ind">' + PASOS.map((_, j) => '<button type="button" data-g="ir" data-j="' + j + '" class="' + (j === paso ? 'on' : '') + '" aria-label="Paso ' + (j + 1) + '"></button>').join('') + '</div>'
      + '<div class="gn-guia-nav"><button type="button" data-g="ant"' + (paso === 0 ? ' disabled' : '') + '>← Anterior</button><span>' + (paso + 1) + ' / ' + PASOS.length + '</span>'
      + (paso === PASOS.length - 1 ? '<button type="button" class="pri" data-g="cerrar">¡Listo!</button>' : '<button type="button" class="pri" data-g="sig">Siguiente →</button>') + '</div></div>';
    m.classList.add('on'); store('nika_notas_guia', '1');
  }
  function cerrarGuia() { const m = $('gn-guia'); if (m) m.classList.remove('on'); }

  /* ---------- arrastrar la nota al tacho (con mouse o con el dedo) ---------- */
  function arrastre() {
    document.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button > 0) return;
      const card = e.target.closest && e.target.closest('.gn-nota'); if (!card || card.classList.contains('gn-fantasma')) return;
      // se puede agarrar desde cualquier parte que no sea escritura o botones
      if (e.target.closest('input, .gn-texto, a, .gn-paleta, .gn-acc button')) return;
      const n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
      const x0 = e.clientX, y0 = e.clientY; let ghost = null, sobre = false;
      const tacho = $('gn-tacho'), r = card.getBoundingClientRect(), dx = x0 - r.left, dy = y0 - r.top;
      const arrancar = () => {
        ghost = card.cloneNode(true); ghost.classList.add('gn-fantasma'); ghost.style.cssText += ';width:' + r.width + 'px;left:' + r.left + 'px;top:' + r.top + 'px;';
        document.body.appendChild(ghost); card.classList.add('gn-arrastrando'); tacho.classList.add('on'); document.body.classList.add('gn-moviendo');
        try { getSelection().removeAllRanges(); } catch (_) {}
      };
      const mover = (ev) => {
        if (!ghost) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return; arrancar(); }
        ev.preventDefault();
        ghost.style.left = (ev.clientX - dx) + 'px'; ghost.style.top = (ev.clientY - dy) + 'px';
        const t = tacho.getBoundingClientRect(); sobre = ev.clientX > t.left - 24 && ev.clientX < t.right + 24 && ev.clientY > t.top - 24 && ev.clientY < t.bottom + 24;
        tacho.classList.toggle('sobre', sobre);
      };
      const soltar = () => {
        document.removeEventListener('pointermove', mover); document.removeEventListener('pointerup', soltar); document.removeEventListener('pointercancel', soltar);
        document.body.classList.remove('gn-moviendo');
        if (!ghost) return;
        tacho.classList.remove('on', 'sobre');
        if (sobre) { ghost.classList.add('gn-cae'); setTimeout(() => ghost.remove(), 420); card.classList.add('gn-fuera'); setTimeout(() => eliminar(n), 220); }
        else { ghost.remove(); card.classList.remove('gn-arrastrando'); }
      };
      document.addEventListener('pointermove', mover, { passive: false }); document.addEventListener('pointerup', soltar); document.addEventListener('pointercancel', soltar);
    });
  }

  /* ---------- color de los post-it nuevos ---------- */
  function pintarColorNueva() {
    const c = colorNueva(), b = $('gn-color-btn'); if (!b) return;
    b.style.setProperty('--sw', COLORES[c]); b.title = 'Color de las notas nuevas: ' + c;
    document.querySelectorAll('#gn-color-pop button').forEach((x) => { x.style.background = COLORES[x.dataset.c]; x.setAttribute('aria-pressed', String(x.dataset.c === c)); });
  }

  /* ---------- barra de formato: aparece solo al escribir (en el título o en el texto) ---------- */
  const enNota = (nodo) => { const el = nodo && (nodo.nodeType === 1 ? nodo : nodo.parentElement); return el && el.closest ? el.closest('.gn-texto') : null; };
  let tituloActivo = null;
  const ESTILO_OK = ['fontWeight', 'fontStyle', 'textDecoration', 'fontFamily', 'fontSize', 'color', 'backgroundColor', 'textTransform', 'textAlign'];
  function estiloTitulo(n) {
    const e = n.titulo_estilo; if (!e || typeof e !== 'object') return '';
    return ESTILO_OK.filter((k) => typeof e[k] === 'string' && !/[;{}<>]|url\(/i.test(e[k])).map((k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' + e[k]).join(';');
  }
  function aplicarTitulo(inp, cmd, val) {
    const card = inp.closest('.gn-nota'), n = card && todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
    const e = Object.assign({}, n.titulo_estilo || {});
    const alt = (k, on, off) => { e[k] = e[k] === on ? off : on; };
    switch (cmd) {
      case 'bold': e.fontWeight = e.fontWeight === '400' ? '800' : '400'; break;
      case 'italic': alt('fontStyle', 'italic', 'normal'); break;
      case 'underline': alt('textDecoration', 'underline', 'none'); break;
      case 'strikeThrough': alt('textDecoration', 'line-through', 'none'); break;
      case 'mayus': alt('textTransform', 'uppercase', 'none'); break;
      case 'minus': alt('textTransform', 'lowercase', 'none'); break;
      case 'titulo': alt('textTransform', 'capitalize', 'none'); break;
      case 'justifyLeft': e.textAlign = 'left'; break;
      case 'justifyCenter': e.textAlign = 'center'; break;
      case 'justifyRight': e.textAlign = 'right'; break;
      case 'fontName': e.fontFamily = "'" + String(val).replace(/[^\w \-]/g, '') + "', sans-serif"; break;
      case 'fontSize': e.fontSize = Math.max(8, Math.min(96, Math.round(val))) + 'px'; break;
      case 'foreColor': e.color = String(val); break;
      case 'hiliteColor': e.backgroundColor = String(val); break;
      case 'removeFormat': ESTILO_OK.forEach((k) => delete e[k]); break;
      default: return;
    }
    inp.style.cssText = estiloTitulo({ titulo_estilo: e });
    actualizar(n, { titulo_estilo: Object.keys(e).length ? e : null });
  }
  function guardarRango() { const s = getSelection(); if (s && s.rangeCount && enNota(s.anchorNode)) { rango = s.getRangeAt(0).cloneRange(); mostrarTam(); } }
  function restaurar() {
    const s = getSelection(); if (!rango) return false;
    const ed = enNota(rango.startContainer); if (!ed || !document.contains(ed)) return false;
    ed.focus(); s.removeAllRanges(); s.addRange(rango); return true;
  }
  function guardarNotaDe(ed) {
    if (!ed) return; const card = ed.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
    const html = limpiar(ed.innerHTML), tx = ed.innerText.replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);
    if (html !== (n.contenido_html || '') || tx !== (n.texto || '')) actualizar(n, { texto: tx, contenido_html: html });
  }
  function mostrarFormato() { clearTimeout(ocultarT); $('gn-fmt').classList.add('on'); }
  function ocultarFormato(ya) {
    clearTimeout(ocultarT);
    const f = () => {
      const a = document.activeElement;
      if (a && a.closest && (a.closest('#gn-fmt') || a.closest('.gn-texto') || a.closest('.gn-titulo-in'))) return;
      $('gn-fmt').classList.remove('on'); tituloActivo = null;
    };
    if (ya) { $('gn-fmt').classList.remove('on'); tituloActivo = null; } else ocultarT = setTimeout(f, 300);
  }
  function mostrarTam() {
    try {
      let el = null;
      if (tituloActivo) el = tituloActivo;
      else { const s = getSelection(); if (!s.rangeCount) return; el = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement); if (!el || !enNota(el)) return; }
      $('gn-tam').value = Math.round(parseFloat(getComputedStyle(el).fontSize)) || 18;
    } catch (_) {}
  }
  function formato() {
    document.addEventListener('selectionchange', guardarRango);
    const barra = $('gn-fmt');
    barra.addEventListener('mousedown', (e) => { if (!e.target.closest('select, input')) e.preventDefault(); });
    document.addEventListener('focusin', (e) => {
      const t = e.target; if (!t.closest) return;
      if (t.closest('.gn-titulo-in')) { tituloActivo = t.closest('.gn-titulo-in'); mostrarFormato(); mostrarTam(); }
      else if (t.closest('.gn-texto')) { tituloActivo = null; mostrarFormato(); }
      else if (t.closest('#gn-fmt')) mostrarFormato();
    });
    document.addEventListener('focusout', (e) => { if (e.target.closest && (e.target.closest('.gn-texto') || e.target.closest('.gn-titulo-in') || e.target.closest('#gn-fmt'))) ocultarFormato(false); });

    const enNotaCmd = (cmd, val) => {
      if (!restaurar()) { aviso('Hacé clic dentro de una nota para darle formato', true); return; }
      if (cmd === 'mayus' || cmd === 'minus' || cmd === 'titulo') {
        const t = getSelection().toString();
        if (t) document.execCommand('insertText', false, cmd === 'mayus' ? t.toUpperCase() : cmd === 'minus' ? t.toLowerCase() : t.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()));
      } else if (cmd === 'fontSize') {
        const s = getSelection(), ed = enNota(s.anchorNode); if (!ed) return;
        if (s.isCollapsed) { const r = document.createRange(); r.selectNodeContents(ed); s.removeAllRanges(); s.addRange(r); }
        document.execCommand('fontSize', false, '7');
        ed.querySelectorAll('font[size="7"]').forEach((f) => { const sp = document.createElement('span'); sp.style.fontSize = val + 'px'; while (f.firstChild) sp.appendChild(f.firstChild); f.replaceWith(sp); });
      } else document.execCommand(cmd, false, val == null ? null : val);
      guardarNotaDe(enNota(getSelection().anchorNode)); guardarRango();
    };
    const ejecutar = (cmd, val) => {
      if (tituloActivo && document.contains(tituloActivo)) { aplicarTitulo(tituloActivo, cmd, val); if (cmd === 'fontSize') $('gn-tam').value = Math.round(val); return; }
      enNotaCmd(cmd, val); if (cmd === 'fontSize') $('gn-tam').value = Math.round(val);
    };
    const tamano = (px) => ejecutar('fontSize', Math.max(8, Math.min(96, Math.round(px))));
    barra.addEventListener('click', (e) => {
      const sz = e.target.closest('[data-sz]'); if (sz) { tamano((parseInt($('gn-tam').value, 10) || 18) + Number(sz.dataset.sz) * 2); return; }
      const b = e.target.closest('[data-cmd]'); if (b) ejecutar(b.dataset.cmd);
    });
    $('gn-fuente').addEventListener('change', (e) => { const v = e.target.value; if (v) ejecutar('fontName', v); e.target.value = ''; });
    $('gn-tam').addEventListener('change', (e) => { const v = parseInt(e.target.value, 10); if (v) tamano(v); });
    $('gn-col-texto').addEventListener('input', (e) => ejecutar('foreColor', e.target.value));
    $('gn-col-resalte').addEventListener('input', (e) => ejecutar('hiliteColor', e.target.value));
  }

  /* ---------- imprimir el cuaderno o una nota ---------- */
  function imprimir(lista, titulo, sub, c1, c2, emoji) {
    if (!lista.length) { aviso('No hay notas para imprimir', true); return; }
    const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const items = lista.map((n) => {
      const pos = n.posicion == null ? '' : '<span class="p">' + (n.tipo === 'video' ? '⏱ ' + fmt(n.posicion) : '📄 Pág. ' + n.posicion) + '</span>';
      const org = n.recurso_titulo && n.tipo !== 'libre' ? '<span class="o">' + esc(n.recurso_titulo) + '</span>' : '';
      return '<section class="n" style="--nk:' + (COLORES[n.color] || COLORES.amarillo) + '"><div class="h">' + pos + org + '</div>'
        + (n.titulo ? '<h3>' + esc(n.titulo) + '</h3>' : '') + '<div class="t">' + contenido(n) + '</div></section>';
    }).join('');
    const css = '@page{size:A4;margin:14mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:"Plus Jakarta Sans",Arial,sans-serif;color:#0f172a}'
      + '.cab{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:14px;color:#fff;background:linear-gradient(135deg,' + c1 + ',' + c2 + ');margin-bottom:16px}'
      + '.cab .e{font-size:34px}.cab h1{margin:0;font-size:22px}.cab p{margin:2px 0 0;font-size:12px;opacity:.9}'
      + '.g{columns:2;column-gap:12px}.n{break-inside:avoid;margin:0 0 12px;padding:10px 12px;border-radius:6px 6px 14px 6px;background:var(--nk);border:1px solid rgba(15,23,42,.18);box-shadow:0 2px 0 rgba(15,23,42,.08)}'
      + '.h{display:flex;gap:6px;flex-wrap:wrap;font-size:10px;margin-bottom:4px}.p{background:#0f172a;color:#fff;border-radius:99px;padding:1px 8px;font-weight:700}.o{opacity:.7;font-weight:700}'
      + '.n h3{margin:2px 0 4px;font-size:14px}.t{font-size:13px;line-height:1.45;word-break:break-word}.t ul,.t ol{margin:4px 0;padding-left:20px}'
      + '.pie{margin-top:14px;font-size:10px;color:#64748b;text-align:center}'
      + (lista.length === 1 ? '.g{columns:1}' : '');
    const doc = '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>' + esc(titulo) + '</title><style>' + css + '</style></head><body>'
      + '<div class="cab"><span class="e">' + emoji + '</span><div><h1>' + esc(titulo) + '</h1><p>' + esc(sub) + ' · ' + lista.length + (lista.length === 1 ? ' nota' : ' notas') + ' · ' + hoy + '</p></div></div>'
      + '<div class="g">' + items + '</div><div class="pie">Campus Nika · Mis notas</div></body></html>';
    if (window.NikaPdf && window.NikaPdf.esMovil()) { window.NikaPdf.imprimir(doc, 'mis-notas-' + titulo); return; }
    const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    const d = f.contentWindow.document; d.open(); d.write(doc); d.close();
    const lanzar = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (_) {} setTimeout(() => f.remove(), 2500); };
    setTimeout(lanzar, 350);
  }

  /* ---------- eventos ---------- */
  function eventos() {
    document.addEventListener('click', (e) => {
      const om = e.target.closest('#gn-orden-btn');
      const menu = $('gn-orden-menu');
      if (om) { menu.classList.toggle('on'); om.setAttribute('aria-expanded', String(menu.classList.contains('on'))); return; }
      const oi = e.target.closest('#gn-orden-menu li');
      if (oi) { store(LS_ORDEN, oi.dataset.v); menu.classList.remove('on'); biblioteca(); return; }
      menu.classList.remove('on');
      const cb = e.target.closest('#gn-color-btn'), cp = $('gn-color-pop');
      if (cb) { cp.classList.toggle('on'); cb.setAttribute('aria-expanded', String(cp.classList.contains('on'))); return; }
      const cs = e.target.closest('#gn-color-pop button');
      if (cs) { store(LS_COLOR, cs.dataset.c); pintarColorNueva(); cp.classList.remove('on'); return; }
      cp.classList.remove('on');
      const g = e.target.closest('[data-g]');
      if (g) { const a = g.dataset.g; if (a === 'cerrar') cerrarGuia(); else if (a === 'sig') guia(paso + 1); else if (a === 'ant') guia(paso - 1); else if (a === 'ir') guia(Number(g.dataset.j)); return; }
      if (e.target.id === 'gn-guia') return cerrarGuia();
      const hr = e.target.closest('[data-href]'); if (hr) { location.href = hr.dataset.href; return; }
      const mi = e.target.closest('[data-menu]');
      if (mi) { const a = mi.dataset.menu; $('gn-menu').classList.remove('on'); if (a === 'guia') guia(0); else if (a === 'papelera') verPapelera(); else if (a === 'biblioteca') { $('gn-papelera').hidden = true; biblioteca(); } return; }
      if (e.target.closest('#gn-menu-btn')) { $('gn-menu').classList.toggle('on'); return; }
      $('gn-menu').classList.remove('on');
      const pp = e.target.closest('[data-p]');
      if (pp) {
        const card = pp.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
        if (pp.dataset.p === 'restaurar') { actualizar(n, { eliminada_en: null }).then(() => { verPapelera(); pintarPapelera(); }); }
        else if (confirm('¿Eliminar esta nota para siempre? No se puede recuperar.')) { borrarNota(n).then(() => { verPapelera(); pintarPapelera(); }); }
        return;
      }
      if (e.target.closest('#gn-pap-vaciar')) { if (confirm('¿Vaciar la papelera? Las notas se eliminan para siempre.')) { Promise.all(enPapelera().map(borrarNota)).then(() => { verPapelera(); pintarPapelera(); }); } return; }
      if (e.target.closest('#gn-pap-volver')) return salirPapelera();
      const cu = e.target.closest('.gn-cuaderno'); if (cu) return abrir(cu.dataset.k);
      const tab = e.target.closest('.gn-tab'); if (tab) { filtroRecurso = tab.dataset.r || null; return paginas(); }
      const pal = e.target.closest('.gn-paleta button');
      if (pal) { const card = pal.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (n) { actualizar(n, { color: pal.dataset.c }); card.style.setProperty('--nk', COLORES[pal.dataset.c]); } const p = pal.closest('.gn-paleta'); if (p) p.remove(); return; }
      const b = e.target.closest('.gn-acc button'), card = e.target.closest('.gn-nota');
      document.querySelectorAll('.gn-paleta').forEach((p) => { if (!card || p.closest('.gn-nota') !== card || !b) p.remove(); });
      if (b && card) {
        const n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
        if (b.dataset.a === 'color') {
          if (card.querySelector('.gn-paleta')) return;
          const p = document.createElement('div'); p.className = 'gn-paleta';
          p.innerHTML = Object.keys(COLORES).map((k) => '<button type="button" data-c="' + k + '" title="' + k + '" style="background:' + COLORES[k] + '"></button>').join('');
          card.appendChild(p);
        } else if (b.dataset.a === 'borrar') { card.classList.add('gn-fuera'); setTimeout(() => eliminar(n), 240); }
        else if (b.dataset.a === 'imprimir') { const m = mat(claveCuaderno(n)); imprimir([n], n.titulo || 'Nota', m[0], m[2], m[3], m[1]); }
      }
    });
    document.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t.classList && t.classList.contains('gn-texto')) guardarNotaDe(t);
      else if (t.classList && t.classList.contains('gn-titulo-in')) {
        const card = t.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id);
        if (n && t.value.trim() !== (n.titulo || '')) actualizar(n, { titulo: t.value.trim().slice(0, 80) });
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { $('gn-orden-menu').classList.remove('on'); $('gn-menu').classList.remove('on'); cerrarGuia(); }
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('gn-titulo-in')) { e.preventDefault(); const tx = e.target.closest('.gn-nota').querySelector('.gn-texto'); if (tx) tx.focus(); }
    });
    $('gn-volver').addEventListener('click', biblioteca);
    $('gn-nueva').addEventListener('click', crear);
    $('gn-imprimir').addEventListener('click', () => { const m = mat(actual); imprimir(visibles(), m[0], filtroRecurso ? 'Cuaderno · ' + filtroRecurso : 'Cuaderno completo', m[2], m[3], m[1]); });
    $('gn-q2').addEventListener('input', paginas);
    $('gn-q').addEventListener('input', () => {
      const q = $('gn-q').value.trim().toLowerCase(), r = $('gn-resultados'), est = $('gn-estantes');
      if (!q) { r.hidden = true; est.hidden = false; return; }
      est.hidden = true; r.hidden = false;
      const f = vivas().filter((n) => ((n.texto || '') + ' ' + (n.titulo || '') + ' ' + (n.recurso_titulo || '')).toLowerCase().includes(q)).slice(0, 60);
      r.innerHTML = f.length ? '<div class="gn-paginas">' + f.map(tarjeta).join('') + '</div>' : '<p class="gn-vacio">Sin resultados.</p>';
    });
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible' || !uid || !cli || (document.activeElement && document.activeElement.closest && document.activeElement.closest('.gn-nota'))) return;
      try { const { data } = await cli.from('notas_estudio').select('*').order('creado_en', { ascending: false }); if (data) { todas = lsLeer().concat(data.map(unpack)); actual ? paginas() : biblioteca(); } } catch (_) {}
    });
  }

  /* barra lateral: contraída por defecto; se abre con "Contraer/Expandir" y en el celular con el botón ☰ */
  function lateral() {
    try { if (store('nika_notas_side') !== '0') document.body.classList.add('ns-colapsado'); } catch (_) {}
    document.querySelectorAll('.ns-link').forEach((a) => { const t = a.querySelector('.ns-t'); if (t && !a.title) a.title = t.textContent.trim(); });
    const col = $('ns-colapsar'), bur = $('ns-burger');
    const pintarCol = () => {
      if (!col) return; const c = document.body.classList.contains('ns-colapsado');
      const i = col.querySelector('.ns-ic'), t = col.querySelector('.ns-t');
      if (i) i.textContent = c ? '⇥' : '⇤'; if (t) t.textContent = c ? 'Expandir' : 'Contraer';
      col.title = c ? 'Expandir la barra lateral' : 'Contraer la barra lateral'; col.setAttribute('aria-label', col.title);
    };
    if (col) { col.addEventListener('click', () => { const c = document.body.classList.toggle('ns-colapsado'); store('nika_notas_side', c ? '1' : '0'); pintarCol(); }); pintarCol(); }
    if (bur) bur.addEventListener('click', () => document.body.classList.toggle('ns-abierto'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('ns-abierto'); });
    document.addEventListener('click', (e) => { if (document.body.classList.contains('ns-abierto') && !e.target.closest('#ns-side') && !e.target.closest('#ns-burger')) document.body.classList.remove('ns-abierto'); });
  }

  lateral(); pintarColorNueva(); arrastre(); formato(); eventos(); cargar();
  window.addEventListener('online', () => { const a = document.activeElement; if (a && (a.isContentEditable || /^(INPUT|TEXTAREA)$/.test(a.tagName))) { setTimeout(() => window.dispatchEvent(new Event('online')), 4000); return; } cargar(); });
})();
