// js/nikaFlashcards.js — Flashcards de tratamientos (post-it + recetario) y Simulador FlashCard.
// Datos: data/nikafarma_patologias.json (fichas con fuente, tipo guía/apunte y unidades problema `up`).
(function () {
  'use strict';
  const URL_DATOS = 'data/nikafarma_patologias.json';
  const KEY_OK = 'nika_fc_ok';
  const PAPEL = { 'up1': '#fff3a3', 'up2': '#fbcfe8', 'up3-sec1': '#bbf7d0', 'up3-sec2': '#ddd6fe', 'up3-sec3': '#fed7aa', 'up3-sec4': '#bae6fd', 'up3-sec5': '#fecdd3', 'up4': '#e9d5ff' };
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  let D = null, cargando = null, modal = null;

  const leerOk = () => { try { return JSON.parse(localStorage.getItem(KEY_OK) || '{}') || {}; } catch (_) { return {}; } };
  const guardarOk = (o) => { try { localStorage.setItem(KEY_OK, JSON.stringify(o)); } catch (_) {} };

  function cargar() {
    if (D) return Promise.resolve(D);
    if (cargando) return cargando;
    cargando = fetch(URL_DATOS, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((j) => {
        D = j;
        D.byId = {}; (j.patologias || []).forEach((p) => { D.byId[p.id] = p; p._h = norm([p.titulo].concat(p.alias || []).join(' ')); p._t = norm([p.definicion, (p.diagnostico || []).join(' ')].join(' ')); });
        return D;
      }).catch((e) => { cargando = null; console.warn('[flashcards]', e); return null; });
    return cargando;
  }

  // ---------- contenido por sección ----------
  const lista = (a, c) => a && a.length ? '<ul' + (c ? ' class="' + c + '"' : '') + '>' + a.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '';
  const SECS = [
    { id: 'tx', ico: '💊', nom: 'Tratamiento', html: (p) => (p.tratamiento || []).map((b) => '<div class="fc-sub">' + esc(b.titulo) + '</div>' + (b.pasos || []).map((s) => '<div class="fc-paso"><b>' + esc(s.etiqueta) + '</b><span>' + esc(s.texto) + '</span></div>').join('')).join('') },
    { id: 'dx', ico: '🩺', nom: 'Diagnóstico y definición', html: (p) => (p.definicion ? '<p>' + esc(p.definicion) + '</p>' : '') + lista(p.diagnostico) },
    { id: 'est', ico: '🧪', nom: 'Estudios', html: (p) => lista(p.estudios) },
    { id: 'seg', ico: '📈', nom: 'Seguimiento', html: (p) => lista(p.seguimiento) },
    { id: 'rojo', ico: '🚩', nom: 'Banderas rojas', html: (p) => lista(p.banderas, 'fc-rojo') },
    { id: 'con', ico: '⚖️', nom: 'Contraste con consensos', html: (p) => p.contraste ? '<p><b>' + esc(((D.meta.contraste || {})[p.contraste.estado]) || '') + '</b> · ' + esc(p.contraste.fuente) + '</p>' + lista(p.contraste.puntos) : '' }
  ];
  const tieneSec = (p, s) => { const h = s.html(p); return !!h && h.replace(/<[^>]+>/g, '').trim().length > 0; };

  function sello(p) {
    const f = p.fuente || {};
    if (f.tipo === 'guia') return '<div class="fc-aviso guia">✔ <span>Basada en guía: ' + esc(f.sociedad) + ' · ' + esc(f.anio) + '</span></div>';
    return '<div class="fc-aviso">⚠️ <span>Verificar veracidad con guías actuales. Fuente: ' + esc(f.sociedad) + '</span></div>';
  }
  const etiquetaFuente = (p) => (p.fuente && p.fuente.tipo === 'guia')
    ? '<span class="fc-tag guia">✔ ' + esc((p.fuente.sociedad || '').split('/')[0].trim()) + ' ' + esc(p.fuente.anio || '') + '</span>'
    : '<span class="fc-tag ver" title="Verificar veracidad con guías actuales">⚠️ Verificar con guías</span>';

  // ---------- modal ----------
  function asegurarModal() {
    if (modal) return modal;
    modal = document.createElement('div'); modal.className = 'fc-modal fc-root'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    document.body.appendChild(modal);
    return modal;
  }
  function cerrar() { if (modal) modal.classList.remove('on'); }

  function abrir(id, seleccion, alCambiar) {
    cargar().then((d) => {
      const p = d && d.byId[id]; if (!p) return;
      const disp = SECS.filter((s) => tieneSec(p, s));
      let sel = (seleccion && seleccion.length ? seleccion : ['tx']).filter((x) => disp.some((s) => s.id === x));
      if (!sel.length) sel = [disp[0].id];
      const m = asegurarModal();
      const papel = PAPEL[(p.up || [])[0]] || '#fff3a3';
      const ok = leerOk();
      const pintar = () => {
        const chips = disp.map((s) => '<button type="button" class="fc-chip' + (sel.includes(s.id) ? ' on' : '') + '" data-fc-sec="' + s.id + '">' + s.ico + ' ' + esc(s.nom) + '</button>').join('') +
          '<button type="button" class="fc-chip' + (sel.length === disp.length ? ' on' : '') + '" data-fc-sec="__all">📖 Completa</button>';
        const cuerpo = disp.filter((s) => sel.includes(s.id)).map((s) => '<div class="fc-bloque"><h5>' + s.ico + ' ' + esc(s.nom) + '</h5>' + s.html(p) + '</div>').join('');
        const unidades = (p.up || []).map((u) => (D.meta.unidades || {})[u] || u).join(' · ');
        m.innerHTML = '<div class="fc-hoja" style="--paper:' + papel + '"><span class="pin"></span>' +
          '<header><div><h3>' + esc(p.titulo) + '</h3><div class="sub">' + esc(unidades) + '</div></div><div style="display:flex;gap:10px;align-items:center"><span class="fc-sello-g" title="NikaMed"></span><button type="button" class="fc-x" data-fc="cerrar" aria-label="Cerrar">✕</button></div></header>' +
          '<div class="fc-elegi">¿Qué querés repasar?</div><div class="fc-chips">' + chips + '</div>' +
          '<div class="fc-papel">' + cuerpo + '</div>' + sello(p) +
          '<div class="fc-pie"><span class="fc-fuente"><b>Fuente:</b> ' + esc((p.fuente || {}).guia || '') + '</span>' +
          '<button type="button" class="fc-btn ' + (ok[p.id] ? 'sec' : 'ok') + '" data-fc="ok">' + (ok[p.id] ? '↩ Marcar para repasar' : '✅ Me lo sé') + '</button></div>' +
          '<div class="fc-legal">' + esc(d.meta.descargo) + '</div></div>';
      };
      pintar(); m.classList.add('on'); m.scrollTop = 0;
      m.onclick = (e) => {
        if (e.target === m) return cerrar();
        const b = e.target.closest('[data-fc],[data-fc-sec]'); if (!b) return;
        if (b.dataset.fc === 'cerrar') return cerrar();
        if (b.dataset.fc === 'ok') { const o = leerOk(); if (o[p.id]) delete o[p.id]; else o[p.id] = 1; guardarOk(o); pintar(); if (alCambiar) alCambiar(); return; }
        const s = b.dataset.fcSec;
        if (s === '__all') sel = sel.length === disp.length ? [disp[0].id] : disp.map((x) => x.id);
        else sel = sel.includes(s) ? (sel.length > 1 ? sel.filter((x) => x !== s) : sel) : sel.concat(s);
        pintar();
      };
    });
  }

  // ---------- mosaico ----------
  function tile(p, i) {
    const ok = leerOk();
    const rot = [-1.6, 1.2, -0.8, 1.8, -1.1, 0.6][i % 6];
    return '<button type="button" class="fc-tile" data-fc-abrir="' + esc(p.id) + '" style="--paper:' + (PAPEL[(p.up || [])[0]] || '#fff3a3') + ';--rot:' + rot + 'deg;--d:' + Math.min(i, 14) * 0.035 + 's">' +
      '<span class="pin"></span>' + (ok[p.id] ? '<span class="ok" title="Ya la sabés">✅</span>' : '') +
      '<h4>' + esc(p.titulo) + '</h4><span class="hint">Tocá y elegí qué repasar</span>' +
      '<span class="tags">' + etiquetaFuente(p) + '</span><span class="fc-sello" title="NikaMed"></span></button>';
  }

  function fichasDe(ups) {
    const set = ups && ups.length ? new Set(ups) : null;
    return (D.patologias || []).filter((p) => !set || (p.up || []).some((u) => set.has(u)));
  }

  function buscar(lista, q) {
    const n = norm(q); if (!n) return lista;
    const ws = n.split(' ');
    return lista.map((p) => {
      let s = 0;
      if (p._h.indexOf(n) >= 0) s = 100;
      else if (ws.every((w) => p._h.indexOf(w) >= 0)) s = 70;
      else if (ws.every((w) => (p._h + ' ' + p._t).indexOf(w) >= 0)) s = 30;
      return { p, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.p);
  }

  // host: contenedor; opts: { ups:[...], agrupar:true/false, titulo }
  function montar(host, opts) {
    opts = opts || {};
    host.classList.add('fc-root');
    host.innerHTML = '<p style="opacity:.7">Preparando flashcards…</p>';
    cargar().then((d) => {
      if (!d) { host.innerHTML = '<div class="fc-vacio">No se pudieron cargar las flashcards. Probá de nuevo más tarde.</div>'; return; }
      let q = '', fuente = '';
      const base = fichasDe(opts.ups);
      const unidadesTodas = Object.keys(d.meta.unidades || {});
      const cuerpoId = 'fc-cuerpo-' + Math.random().toString(36).slice(2, 7);
      host.innerHTML = '<div class="fc-bar"><div class="fc-search"><input type="search" placeholder="Buscar patología, fármaco o tema…" aria-label="Buscar flashcards" autocomplete="off"></div>' +
        '<select class="fc-sel" aria-label="Tipo de fuente"><option value="">Todas las fuentes</option><option value="guia">Solo guías de sociedad</option><option value="apunte">Solo apuntes (verificar)</option></select>' +
        '<div class="fc-prog"><span class="fc-pt"></span><i><b></b></i></div></div>' +
        '<div id="' + cuerpoId + '"></div><div class="fc-legal">' + esc(d.meta.descargo) + '</div>';
      const cuerpo = host.querySelector('#' + cuerpoId);
      const pintar = () => {
        let l = buscar(base, q);
        if (fuente === 'guia') l = l.filter((p) => p.fuente.tipo === 'guia'); else if (fuente === 'apunte') l = l.filter((p) => p.fuente.tipo !== 'guia');
        const ok = leerOk(); const sabidas = base.filter((p) => ok[p.id]).length;
        host.querySelector('.fc-pt').textContent = sabidas + ' / ' + base.length + ' dominadas';
        host.querySelector('.fc-prog b').style.width = (base.length ? sabidas * 100 / base.length : 0) + '%';
        if (!l.length) { cuerpo.innerHTML = '<div class="fc-vacio">No hay flashcards para esa búsqueda' + (opts.ups ? ' en esta unidad' : '') + '.</div>'; return; }
        const porUnidad = opts.agrupar !== false && !opts.ups && !q;
        if (porUnidad) {
          let h = '';
          unidadesTodas.forEach((u) => {
            const g = l.filter((p) => (p.up || [])[0] === u); if (!g.length) return;
            h += '<div class="fc-grupo">' + esc(d.meta.unidades[u]) + ' <small>' + g.length + ' tarjetas</small></div><div class="fc-grid">' + g.map(tile).join('') + '</div>';
          });
          cuerpo.innerHTML = h;
        } else cuerpo.innerHTML = '<div class="fc-grid">' + l.map(tile).join('') + '</div>';
      };
      host.querySelector('.fc-search input').addEventListener('input', (e) => { q = e.target.value; pintar(); });
      host.querySelector('.fc-sel').addEventListener('change', (e) => { fuente = e.target.value; pintar(); });
      host.addEventListener('click', (e) => { const b = e.target.closest('[data-fc-abrir]'); if (b) abrir(b.dataset.fcAbrir, null, pintar); });
      pintar();
    });
  }

  // ---------- Simulador FlashCard ----------
  const AREAS = [
    { id: 'ginecologia', nom: 'Ginecología y Obstetricia', ico: '🌸', ok: true },
    { id: 'cirugia', nom: 'Cirugía', ico: '🔪' }, { id: 'siam', nom: 'S.I.A.M.', ico: '🩺' },
    { id: 'medicinalegal', nom: 'Medicina Legal', ico: '⚖️' }, { id: 'medicinadeportiva', nom: 'Medicina Deportiva', ico: '🏃' }
  ];
  const CONTENIDOS = [
    { id: 'tx', nom: 'Solo tratamiento', desc: 'Esquemas y conducta terapéutica', secs: ['tx'], q: '¿Cuál es el tratamiento?' },
    { id: 'dx', nom: 'Diagnóstico y estudios', desc: 'Criterios, definición y estudios', secs: ['dx', 'est'], q: '¿Cómo se diagnostica y qué se pide?' },
    { id: 'alarma', nom: 'Seguimiento y alarmas', desc: 'Controles y banderas rojas', secs: ['seg', 'rojo'], q: '¿Qué controlar y qué alertas hay?' },
    { id: 'todo', nom: 'Tema completo', desc: 'Definición, diagnóstico, tratamiento y más', secs: ['dx', 'est', 'tx', 'seg', 'rojo'], q: 'Contá el tema completo' }
  ];

  function simulador(host) {
    host.classList.add('fc-root');
    cargar().then((d) => {
      if (!d) { host.innerHTML = '<div class="fc-vacio">No se pudieron cargar las flashcards.</div>'; return; }
      const st = { area: 'ginecologia', alcance: 'final', unidad: 'up3-sec4', cont: 'tx', n: 10, soloPend: false };
      const unidades = Object.keys(d.meta.unidades || {});
      const pintarSetup = () => {
        const ops = (id, arr) => arr.map((o) => '<button type="button" class="fcs-op' + (st[id] === o.id ? ' on' : '') + '" data-set="' + id + '" data-v="' + o.id + '"><b>' + o.nom + '</b><small>' + o.desc + '</small></button>').join('');
        const total = pool().length;
        host.innerHTML = '<div class="fcs-wrap">' +
          '<div class="fcs-paso"><h3>1 · Área</h3><div class="fcs-areas">' + AREAS.map((a) => '<button type="button" class="fcs-area' + (a.ok && st.area === a.id ? ' on' : '') + '" ' + (a.ok ? 'data-area="' + a.id + '"' : 'disabled') + '><b>' + a.ico + ' ' + a.nom + '</b>' + (a.ok ? '<small>Flashcards de ' + d.patologias.length + ' temas</small>' : '<small>Muy pronto</small><span class="fcs-soon">Próximamente</span>') + '</button>').join('') + '</div></div>' +
          '<div class="fcs-paso"><h3>2 · Qué rendir</h3><div class="fcs-ops">' + ops('alcance', [
            { id: 'unidad', nom: 'Una unidad problema', desc: 'Elegís UP1, UP2, secciones de UP3 o UP4' },
            { id: 'parcial', nom: 'Parcial', desc: 'UP1 a UP3, todas las secciones' },
            { id: 'final', nom: 'Final', desc: 'Todo el temario de la materia' }]) + '</div>' +
          (st.alcance === 'unidad' ? '<div style="margin-top:10px"><select class="fc-sel" data-sel="unidad">' + unidades.map((u) => '<option value="' + u + '"' + (st.unidad === u ? ' selected' : '') + '>' + esc(d.meta.unidades[u]) + '</option>').join('') + '</select></div>' : '') + '</div>' +
          '<div class="fcs-paso"><h3>3 · Qué repasar de cada tarjeta</h3><div class="fcs-ops">' + ops('cont', CONTENIDOS) + '</div></div>' +
          '<div class="fcs-paso"><h3>4 · Cantidad</h3><div class="fc-bar"><select class="fc-sel" data-sel="n">' + [5, 10, 20, 0].map((n) => '<option value="' + n + '"' + (st.n === n ? ' selected' : '') + '>' + (n ? n + ' tarjetas' : 'Todas (' + total + ')') + '</option>').join('') + '</select>' +
          '<label style="font-size:.85rem;font-weight:700"><input type="checkbox" data-chk="pend"' + (st.soloPend ? ' checked' : '') + '> Solo las que todavía no domino</label></div></div>' +
          '<div style="margin-top:18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="fc-btn" data-go="1"' + (total ? '' : ' disabled') + '>▶ Empezar · ' + total + ' disponibles</button><span class="fc-legal" style="margin:0">Las tarjetas basadas en apuntes llevan el aviso «verificar con guías actuales».</span></div></div>';
      };
      const pool = () => {
        let ups = null;
        if (st.alcance === 'unidad') ups = [st.unidad]; else if (st.alcance === 'parcial') ups = ['up1', 'up2', 'up3-sec1', 'up3-sec2', 'up3-sec3', 'up3-sec4', 'up3-sec5'];
        const c = CONTENIDOS.find((x) => x.id === st.cont);
        let l = fichasDe(ups).filter((p) => c.secs.some((s) => { const sec = SECS.find((x) => x.id === s); return tieneSec(p, sec); }));
        if (st.soloPend) { const ok = leerOk(); l = l.filter((p) => !ok[p.id]); }
        return l;
      };
      let mazo = [], i = 0, vista = false, repasar = [], sabidas = 0;
      const barajar = (a) => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
      const empezar = (l) => { mazo = barajar(l); if (st.n) mazo = mazo.slice(0, st.n); i = 0; vista = false; repasar = []; sabidas = 0; pintarCarta(); };
      const pintarCarta = () => {
        if (i >= mazo.length) return pintarFin();
        const p = mazo[i], c = CONTENIDOS.find((x) => x.id === st.cont);
        const resp = SECS.filter((s) => c.secs.includes(s.id) && tieneSec(p, s)).map((s) => '<div class="fc-bloque"><h5>' + s.ico + ' ' + esc(s.nom) + '</h5>' + s.html(p) + '</div>').join('');
        host.innerHTML = '<div class="fcs-wrap fcs-mazo"><div class="fcs-top"><span>' + (i + 1) + ' / ' + mazo.length + '</span><span class="fcs-barra"><b style="width:' + (i * 100 / mazo.length) + '%"></b></span><button type="button" class="fc-btn sec" data-salir="1">Salir</button></div>' +
          '<div class="fcs-carta"><div class="fcs-in" style="--paper:' + (PAPEL[(p.up || [])[0]] || '#fff3a3') + '"><span class="pin"></span><span class="fc-sello-g" style="position:absolute;right:14px;top:12px;width:44px;height:44px"></span>' +
          '<div class="fcs-pregunta">' + esc((d.meta.unidades[(p.up || [])[0]] || '')) + '</div><div class="fcs-q">' + esc(p.titulo) + '</div><div class="fcs-pregunta">' + esc(c.q) + '</div>' +
          (vista ? '<div class="fcs-resp fc-papel">' + resp + '</div>' + sello(p) : '<p style="opacity:.6;font-size:.85rem;margin-top:18px">Pensá tu respuesta y después tocá «Mostrar».</p>') +
          '</div></div><div class="fcs-acc">' + (vista
            ? '<button type="button" class="fc-btn sec" data-r="no">😅 A repasar</button><button type="button" class="fc-btn ok" data-r="si">✅ Lo sabía</button>'
            : '<button type="button" class="fc-btn" data-mostrar="1">👀 Mostrar respuesta</button>') + '</div></div>';
      };
      const pintarFin = () => {
        const pct = mazo.length ? Math.round(sabidas * 100 / mazo.length) : 0;
        host.innerHTML = '<div class="fcs-wrap fcs-fin"><div class="big">' + pct + '%</div><p>Sabías <b>' + sabidas + '</b> de <b>' + mazo.length + '</b> tarjetas.</p>' +
          (repasar.length ? '<div class="fcs-rev">' + repasar.map((p) => '<button type="button" data-ver="' + esc(p.id) + '">📌 ' + esc(p.titulo) + '</button>').join('') + '</div>' : '<p>¡Excelente! No quedó nada para repasar.</p>') +
          '<div class="fcs-acc" style="margin-top:16px">' + (repasar.length ? '<button type="button" class="fc-btn" data-again="1">🔁 Repetir las que fallé</button>' : '') +
          '<button type="button" class="fc-btn sec" data-setup="1">⚙️ Nueva configuración</button></div></div>';
      };
      host.onclick = (e) => {
        const t = e.target;
        const a = t.closest('[data-area]'); if (a) { st.area = a.dataset.area; return pintarSetup(); }
        const s = t.closest('[data-set]'); if (s) { st[s.dataset.set] = s.dataset.v; return pintarSetup(); }
        if (t.closest('[data-chk]')) { st.soloPend = t.closest('[data-chk]').checked; return pintarSetup(); }
        if (t.closest('[data-go]')) return empezar(pool());
        if (t.closest('[data-mostrar]')) { vista = true; return pintarCarta(); }
        const r = t.closest('[data-r]');
        if (r) { const p = mazo[i]; if (r.dataset.r === 'si') { sabidas++; const o = leerOk(); o[p.id] = 1; guardarOk(o); } else repasar.push(p); i++; vista = false; return pintarCarta(); }
        if (t.closest('[data-salir]') || t.closest('[data-setup]')) return pintarSetup();
        if (t.closest('[data-again]')) { const l = repasar.slice(); mazo = barajar(l); i = 0; vista = false; repasar = []; sabidas = 0; return pintarCarta(); }
        const v = t.closest('[data-ver]'); if (v) return abrir(v.dataset.ver, ['tx', 'dx']);
      };
      host.onchange = (e) => { const el = e.target.closest('[data-sel]'); if (!el) return; const k = el.dataset.sel; st[k] = k === 'n' ? parseInt(el.value, 10) : el.value; pintarSetup(); };
      pintarSetup();
    });
  }

  window.NikaFlashcards = { cargar, montar, abrir, simulador, datos: () => D };
})();
