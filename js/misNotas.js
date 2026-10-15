/* CAMPUS NIKA · Mis notas: biblioteca de cuadernos por año y materia, notas tipo post-it con texto enriquecido,
   título propio, colores, arrastrar al tacho y sincronización en la nube (Supabase, tabla notas_estudio). */
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
  const LS = 'nika_notas_estudio', LS_ORDEN = 'nika_notas_orden', LS_COLOR = 'nika_notas_color';
  const $ = (i) => document.getElementById(i);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); };
  const mat = (k) => MATERIAS[k] || [k || 'Sin materia', '📓', '#0ea5e9', '#6366f1'];
  const claveCuaderno = (n) => n.modulo || '_libre';
  let todas = [], cli = null, uid = null, actual = null, filtroRecurso = null, sinColumnas = false, estadoNube = 'cargando', rango = null;
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (_) {} return null; };
  const lsLeer = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (_) { return []; } };
  const lsGuardar = (a) => { try { localStorage.setItem(LS, JSON.stringify(a)); } catch (_) {} };
  const colorNueva = () => { const c = store(LS_COLOR); return COLORES[c] ? c : 'amarillo'; };

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
  async function cargar() {
    let locales = lsLeer();
    try {
      const ns = window.NikaSupabase; if (ns && ns.ready) await ns.ready; cli = ns && ns.client;
      const { data: s } = await cli.auth.getSession(); uid = s && s.session && s.session.user ? s.session.user.id : null;
    } catch (_) {}
    if (uid && cli) {
      // las notas que quedaron solo en este dispositivo se suben a la nube
      const subidas = new Set();
      for (const n of locales) {
        const fila = filaNube(n); if (!fila) continue;
        try { const { error } = await cli.from('notas_estudio').insert(fila); if (!error) subidas.add(n.id); else if (/relation|does not exist|PGRST205/i.test(error.message + error.code)) { estadoNube = 'error'; break; } } catch (_) {}
      }
      if (subidas.size) { locales = locales.filter((n) => !subidas.has(n.id)); lsGuardar(locales); }
      try {
        const { data, error } = await cli.from('notas_estudio').select('*').order('creado_en', { ascending: false });
        if (error) throw error;
        todas = locales.concat(data || []); estadoNube = locales.length ? 'parcial' : 'ok';
      } catch (_) { todas = locales; estadoNube = 'error'; }
    } else { todas = locales; estadoNube = 'local'; }
    pintarEstado(); biblioteca();
  }
  function filaNube(n) {
    return { recurso: n.recurso || ('libre:' + (n.modulo || '_libre')), recurso_titulo: n.recurso_titulo || null, modulo: n.modulo || null, up_id: n.up_id || null, tipo: n.tipo || 'material',
      posicion: n.posicion == null ? null : n.posicion, texto: n.texto || '', color: n.color || 'amarillo', creado_en: n.creado_en || new Date().toISOString(),
      ...(sinColumnas ? {} : { titulo: n.titulo || null, contenido_html: n.contenido_html || null }) };
  }
  function pintarEstado() {
    const el = $('gn-sync'); if (!el) return;
    const t = { ok: ['☁️ Sincronizado en la nube', 'ok'], parcial: ['☁️ Sincronizando…', 'warn'], local: ['📱 Solo en este dispositivo · iniciá sesión para sincronizar', 'warn'], error: ['⚠️ Sin conexión con la nube: se guarda en este dispositivo', 'err'], cargando: ['Cargando…', ''] }[estadoNube];
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
    $('gn-cuaderno').hidden = true; $('gn-biblioteca').hidden = false; actual = null;
    const grupos = {}; todas.forEach((n) => { (grupos[claveCuaderno(n)] = grupos[claveCuaderno(n)] || []).push(n); });
    const orden = store(LS_ORDEN) || 'anio-asc'; $('gn-orden').value = orden;
    const ultimo = (k) => Math.max(0, ...(grupos[k] || []).map((n) => +new Date(n.creado_en)));
    const nombre = (k) => mat(k)[0].toLowerCase();
    let html = '', i = 0;
    const total = todas.length;
    if (!total) html += '<p class="gn-vacio gn-vacio--hero">Todavía no tomaste notas. Abrí un video o material en la sala de estudio y escribí la primera, o creá una nota suelta desde cualquier cuaderno.</p>';
    if (orden === 'anio-asc' || orden === 'anio-desc') {
      const lista = ANIOS.slice(); if (orden === 'anio-desc') lista.reverse();
      lista.forEach(([a, ks]) => {
        html += '<h3 class="gn-anio"><span>' + a + '° año</span></h3><div class="gn-estantes">' + ks.slice().sort((x, y) => nombre(x).localeCompare(nombre(y))).map((k) => tapa(k, grupos[k] || [], i++)).join('') + '</div>';
      });
      const otros = Object.keys(grupos).filter((k) => !MATERIAS[k]).concat(grupos._libre ? ['_libre'] : []);
      html += '<h3 class="gn-anio"><span>Notas sueltas</span></h3><div class="gn-estantes">' + (otros.length ? otros : ['_libre']).map((k) => tapa(k, grupos[k] || [], i++)).join('') + '</div>';
    } else {
      let ks = [...new Set(ANIOS.flatMap((x) => x[1]).concat(Object.keys(grupos)).concat(['_libre']))];
      if (orden === 'nombre-asc') ks.sort((x, y) => nombre(x).localeCompare(nombre(y)));
      else if (orden === 'nombre-desc') ks.sort((x, y) => nombre(y).localeCompare(nombre(x)));
      else ks.sort((x, y) => ultimo(y) - ultimo(x));
      html += '<div class="gn-estantes">' + ks.map((k) => tapa(k, grupos[k] || [], i++)).join('') + '</div>';
    }
    $('gn-estantes').innerHTML = html;
  }

  /* ---------- cuaderno ---------- */
  function abrir(k) {
    actual = k; filtroRecurso = null; $('gn-q2').value = '';
    $('gn-biblioteca').hidden = true; const c = $('gn-cuaderno'); c.hidden = false;
    c.style.setProperty('--c1', mat(k)[2]); c.style.setProperty('--c2', mat(k)[3]);
    c.classList.remove('gn-abre'); void c.offsetWidth; c.classList.add('gn-abre');
    $('gn-titulo').textContent = mat(k)[1] + ' ' + mat(k)[0];
    $('gn-color-nueva').value = colorNueva();
    paginas(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const delCuaderno = () => todas.filter((n) => claveCuaderno(n) === actual);
  const etiquetaRec = (n) => n.recurso_titulo || (n.tipo === 'libre' ? 'Notas sueltas' : n.recurso);

  function paginas() {
    const q = $('gn-q2').value.trim().toLowerCase(), base = delCuaderno();
    const recs = {}; base.forEach((n) => { const k = etiquetaRec(n); recs[k] = (recs[k] || 0) + 1; });
    $('gn-indice').innerHTML = '<button type="button" class="gn-tab' + (filtroRecurso ? '' : ' on') + '" data-r="">Todo <b>' + base.length + '</b></button>'
      + Object.keys(recs).map((k) => '<button type="button" class="gn-tab' + (filtroRecurso === k ? ' on' : '') + '" data-r="' + esc(k) + '">' + esc(k.length > 38 ? k.slice(0, 36) + '…' : k) + ' <b>' + recs[k] + '</b></button>').join('');
    const vis = base.filter((n) => (!filtroRecurso || etiquetaRec(n) === filtroRecurso) && (!q || ((n.texto || '') + ' ' + (n.titulo || '') + ' ' + (n.recurso_titulo || '')).toLowerCase().includes(q)))
      .sort((a, b) => (a.posicion == null ? 1e12 : a.posicion) - (b.posicion == null ? 1e12 : b.posicion) || +new Date(b.creado_en) - +new Date(a.creado_en));
    $('gn-cuenta').textContent = vis.length + (vis.length === 1 ? ' nota' : ' notas');
    $('gn-paginas').innerHTML = vis.length ? vis.map(tarjeta).join('')
      : '<p class="gn-vacio">' + (base.length ? 'No hay notas con ese filtro.' : 'Este cuaderno está vacío. Tocá “＋ Nueva nota” para escribir la primera.') + '</p>';
  }

  function tarjeta(n, i) {
    const c = COLORES[n.color] ? n.color : 'amarillo';
    const pos = n.posicion == null ? '' : '<span class="gn-pos">' + (n.tipo === 'video' ? '⏱ ' + fmt(n.posicion) : '📄 Pág. ' + n.posicion) + '</span>';
    const origen = n.recurso_titulo && n.tipo !== 'libre' ? '<span class="gn-origen" title="' + esc(n.recurso_titulo) + '">' + esc(n.recurso_titulo) + '</span>' : '';
    const ir = n.modulo && n.tipo !== 'libre' ? '<a class="gn-ir" href="estudio.html?modulo=' + encodeURIComponent(n.modulo) + '">Ir a la sala →</a>' : '';
    return '<article class="gn-nota" data-id="' + esc(n.id) + '" style="--nk:' + COLORES[c] + ';--i:' + Math.min(i || 0, 14) + '">'
      + '<header><button type="button" class="gn-grip" title="Arrastrá al tacho para borrar" aria-label="Mover nota al tacho">⠿</button>' + pos + origen
      + '<span class="gn-acc"><button type="button" data-a="color" title="Color de la nota" aria-label="Color">🎨</button><button type="button" data-a="borrar" title="Borrar" aria-label="Borrar nota">🗑️</button></span></header>'
      + '<input class="gn-titulo-in" type="text" maxlength="80" value="' + esc(n.titulo || '') + '" placeholder="Título de la nota" aria-label="Título de la nota">'
      + '<div class="gn-texto" contenteditable="true" spellcheck="false" aria-label="Texto de la nota">' + contenido(n) + '</div>'
      + '<footer><small>' + new Date(n.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + '</small>' + ir + '</footer></article>';
  }

  /* ---------- escritura (nube o local) ---------- */
  async function actualizar(n, campos) {
    Object.assign(n, campos);
    if (n.local) { lsGuardar(lsLeer().map((x) => (x.id === n.id ? Object.assign(x, campos) : x))); return; }
    if (!(uid && cli)) return;
    const intento = async (c) => { try { return (await cli.from('notas_estudio').update(c).eq('id', n.id)).error; } catch (e) { return e; } };
    let err = await intento(campos);
    if (err && /titulo|contenido_html|column|schema/i.test(String(err.message || err))) {
      sinColumnas = true; const c2 = Object.assign({}, campos); delete c2.titulo; delete c2.contenido_html; if (Object.keys(c2).length) err = await intento(c2); else err = null;
      aviso('Para guardar título y formato en la nube falta ejecutar el SQL 20261016100000_notas_formato.sql', true);
    }
    if (err) { estadoNube = 'error'; pintarEstado(); }
  }
  async function insertar(n) {
    if (uid && cli) {
      try {
        let { data, error } = await cli.from('notas_estudio').insert(filaNube(n)).select().single();
        if (error && /titulo|contenido_html|column|schema/i.test(error.message || '')) { sinColumnas = true; ({ data, error } = await cli.from('notas_estudio').insert(filaNube(n)).select().single()); }
        if (!error && data) return Object.assign(data, sinColumnas ? { titulo: n.titulo, contenido_html: n.contenido_html } : {});
      } catch (_) {}
    }
    const l = Object.assign({}, n, { id: 'l' + Date.now() + Math.random().toString(36).slice(2, 5), local: true });
    lsGuardar(lsLeer().concat([l])); return l;
  }
  async function borrarNota(n) {
    todas = todas.filter((x) => x !== n);
    if (n.local) lsGuardar(lsLeer().filter((x) => x.id !== n.id));
    else if (uid && cli) { try { await cli.from('notas_estudio').delete().eq('id', n.id); } catch (_) {} }
  }
  async function crear() {
    const t = $('gn-q2'); t.value = '';
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
    const copia = Object.assign({}, n); await borrarNota(n); paginas();
    aviso('Nota eliminada', false, async () => { const r = await insertar(Object.assign(copia, { id: undefined, local: false })); todas.unshift(r); if (actual) paginas(); });
  }

  /* ---------- arrastrar al tacho ---------- */
  function arrastre() {
    document.addEventListener('pointerdown', (e) => {
      const g = e.target.closest && e.target.closest('.gn-grip'); if (!g) return;
      const card = g.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
      e.preventDefault();
      const r = card.getBoundingClientRect(), tacho = $('gn-tacho');
      const ghost = card.cloneNode(true); ghost.classList.add('gn-fantasma'); ghost.style.cssText += ';width:' + r.width + 'px;left:' + r.left + 'px;top:' + r.top + 'px;';
      document.body.appendChild(ghost); card.classList.add('gn-arrastrando'); tacho.classList.add('on');
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      let sobre = false;
      const mover = (ev) => {
        ghost.style.left = (ev.clientX - dx) + 'px'; ghost.style.top = (ev.clientY - dy) + 'px';
        const t = tacho.getBoundingClientRect(); sobre = ev.clientX > t.left - 20 && ev.clientX < t.right + 20 && ev.clientY > t.top - 20 && ev.clientY < t.bottom + 20;
        tacho.classList.toggle('sobre', sobre);
      };
      const soltar = () => {
        document.removeEventListener('pointermove', mover); document.removeEventListener('pointerup', soltar); document.removeEventListener('pointercancel', soltar);
        tacho.classList.remove('on', 'sobre');
        if (sobre) { ghost.classList.add('gn-cae'); setTimeout(() => ghost.remove(), 380); card.classList.add('gn-fuera'); setTimeout(() => eliminar(n), 200); }
        else { ghost.remove(); card.classList.remove('gn-arrastrando'); }
      };
      document.addEventListener('pointermove', mover); document.addEventListener('pointerup', soltar); document.addEventListener('pointercancel', soltar);
      mover(e);
    });
  }

  /* ---------- barra de formato (como un procesador de texto) ---------- */
  const enNota = (nodo) => { const el = nodo && (nodo.nodeType === 1 ? nodo : nodo.parentElement); return el && el.closest ? el.closest('.gn-texto') : null; };
  function guardarRango() { const s = getSelection(); if (s && s.rangeCount && enNota(s.anchorNode)) rango = s.getRangeAt(0).cloneRange(); }
  function restaurar() {
    const s = getSelection(); if (!rango) return false;
    const ed = enNota(rango.startContainer); if (!ed) return false;
    ed.focus(); s.removeAllRanges(); s.addRange(rango); return true;
  }
  function guardarNotaDe(ed) {
    if (!ed) return; const card = ed.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
    const html = limpiar(ed.innerHTML), tx = ed.innerText.replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);
    if (html !== (n.contenido_html || '') || tx !== (n.texto || '')) actualizar(n, { texto: tx, contenido_html: html });
  }
  function formato() {
    document.addEventListener('selectionchange', guardarRango);
    const barra = $('gn-fmt');
    barra.addEventListener('mousedown', (e) => { if (!e.target.closest('select, input')) e.preventDefault(); });
    const aplicar = (fn) => { if (!restaurar()) { aviso('Hacé clic dentro de una nota para darle formato', true); return; } fn(); guardarNotaDe(enNota(getSelection().anchorNode)); guardarRango(); };
    barra.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cmd]'); if (!b) return;
      const c = b.dataset.cmd;
      aplicar(() => {
        if (c === 'mayus' || c === 'minus' || c === 'titulo') {
          const t = getSelection().toString(); if (!t) return;
          const r = c === 'mayus' ? t.toUpperCase() : c === 'minus' ? t.toLowerCase() : t.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
          document.execCommand('insertText', false, r);
        } else document.execCommand(c, false, null);
      });
    });
    $('gn-fuente').addEventListener('change', (e) => { const v = e.target.value; if (v) aplicar(() => document.execCommand('fontName', false, v)); e.target.value = ''; });
    $('gn-tam').addEventListener('change', (e) => {
      const v = e.target.value; e.target.value = ''; if (!v) return;
      aplicar(() => {
        document.execCommand('fontSize', false, '7');
        const ed = enNota(getSelection().anchorNode); if (!ed) return;
        ed.querySelectorAll('font[size="7"]').forEach((f) => { const s = document.createElement('span'); s.style.fontSize = v + 'px'; while (f.firstChild) s.appendChild(f.firstChild); f.replaceWith(s); });
      });
    });
    $('gn-col-texto').addEventListener('input', (e) => aplicar(() => document.execCommand('foreColor', false, e.target.value)));
    $('gn-col-resalte').addEventListener('input', (e) => aplicar(() => document.execCommand('hiliteColor', false, e.target.value)));
    $('gn-color-nueva').addEventListener('change', (e) => store(LS_COLOR, e.target.value));
  }

  /* ---------- eventos ---------- */
  function eventos() {
    document.addEventListener('click', (e) => {
      const cu = e.target.closest('.gn-cuaderno'); if (cu) return abrir(cu.dataset.k);
      const tab = e.target.closest('.gn-tab'); if (tab) { filtroRecurso = tab.dataset.r || null; return paginas(); }
      const pal = e.target.closest('.gn-paleta button');
      if (pal) { const card = pal.closest('.gn-nota'), n = todas.find((x) => String(x.id) === card.dataset.id); if (n) { actualizar(n, { color: pal.dataset.c }); card.style.setProperty('--nk', COLORES[pal.dataset.c]); } const p = pal.closest('.gn-paleta'); if (p) p.remove(); return; }
      const b = e.target.closest('.gn-acc button'), card = e.target.closest('.gn-nota');
      document.querySelectorAll('.gn-paleta').forEach((p) => { if (!card || !p.closest('.gn-nota') || p.closest('.gn-nota') !== card || !b) p.remove(); });
      if (b && card) {
        const n = todas.find((x) => String(x.id) === card.dataset.id); if (!n) return;
        if (b.dataset.a === 'color') {
          if (card.querySelector('.gn-paleta')) return;
          const p = document.createElement('div'); p.className = 'gn-paleta';
          p.innerHTML = Object.keys(COLORES).map((k) => '<button type="button" data-c="' + k + '" title="' + k + '" style="background:' + COLORES[k] + '"></button>').join('');
          card.appendChild(p);
        } else if (b.dataset.a === 'borrar') { card.classList.add('gn-fuera'); setTimeout(() => eliminar(n), 240); }
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
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('gn-titulo-in')) { e.preventDefault(); const tx = e.target.closest('.gn-nota').querySelector('.gn-texto'); if (tx) tx.focus(); } });
    $('gn-volver').addEventListener('click', biblioteca);
    $('gn-nueva').addEventListener('click', crear);
    $('gn-q2').addEventListener('input', paginas);
    $('gn-orden').addEventListener('change', (e) => { store(LS_ORDEN, e.target.value); biblioteca(); });
    $('gn-q').addEventListener('input', () => {
      const q = $('gn-q').value.trim().toLowerCase(), r = $('gn-resultados'), est = $('gn-estantes');
      if (!q) { r.hidden = true; est.hidden = false; return; }
      est.hidden = true; r.hidden = false;
      const f = todas.filter((n) => ((n.texto || '') + ' ' + (n.titulo || '') + ' ' + (n.recurso_titulo || '')).toLowerCase().includes(q)).slice(0, 60);
      r.innerHTML = f.length ? '<div class="gn-paginas">' + f.map(tarjeta).join('') + '</div>' : '<p class="gn-vacio">Sin resultados.</p>';
    });
    // al volver a la pestaña, se refresca desde la nube (por si editaste desde otro dispositivo)
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible' || !uid || !cli || document.activeElement && document.activeElement.closest && document.activeElement.closest('.gn-nota')) return;
      try { const { data } = await cli.from('notas_estudio').select('*').order('creado_en', { ascending: false }); if (data) { todas = lsLeer().concat(data); actual ? paginas() : biblioteca(); } } catch (_) {}
    });
  }

  arrastre(); formato(); eventos(); cargar();
})();
