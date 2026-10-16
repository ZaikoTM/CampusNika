// NikaMed · Calculadoras y escalas clínicas: motor declarativo + interfaz.
// Cada calculadora es un objeto { id, area, nombre, desc, campos[], calc(v) o rangos[], fuente }.
// Los datos viven en js/calc/datos-*.js y se registran con NikaCalcs.agregar([...]).
(function () {
  'use strict';
  const REG = [];
  const AREAS = {
    obstetricia: { nombre: 'Obstetricia y Ginecología', ico: '🤰', c: '#ec4899' },
    cirugia: { nombre: 'Cirugía y Trauma', ico: '🔪', c: '#0ea5e9' },
    emergencias: { nombre: 'Emergencias y Terapia', ico: '🚑', c: '#ef4444' },
    clinica: { nombre: 'Clínica médica', ico: '🩺', c: '#8b5cf6' },
    cardio: { nombre: 'Cardiología y Neurología', ico: '🫀', c: '#f97316' },
    gastro: { nombre: 'Gastro y Hepatología', ico: '🧪', c: '#10b981' },
    nefro: { nombre: 'Nefrología y Metabolismo', ico: '💧', c: '#06b6d4' },
    general: { nombre: 'General y Nutrición', ico: '📏', c: '#64748b' },
    pediatria: { nombre: 'Pediatría y Neonatología', ico: '🍼', c: '#f59e0b' },
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d = 1) => (Number.isFinite(x) ? (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toString().replace('.', ',') : '—');

  // ---------- constructores de campos ----------
  const N = (id, label, unit, o = {}) => Object.assign({ t: 'num', id, label, unit: unit || '', step: 'any' }, o);
  const C = (id, label, pts, o = {}) => Object.assign({ t: 'chk', id, label, pts: pts == null ? 1 : pts }, o);
  const S = (id, label, opts, o = {}) => Object.assign({ t: 'sel', id, label, opts }, o);   // opts: [[etiqueta, puntos|valor], ...]
  const D = (id, label, o = {}) => Object.assign({ t: 'date', id, label }, o);
  const Sx = (id) => S(id || 'sexo', 'Sexo', [['Mujer', 'F'], ['Varón', 'M']], { val: true });

  // ---------- puntaje genérico ----------
  function sumaPuntos(campos, v) {
    let t = 0; const det = [];
    campos.forEach((f) => {
      if (f.t === 'chk' && v[f.id]) { t += f.pts; det.push([f.label, f.pts]); }
      else if (f.t === 'sel' && v[f.id] !== '' && v[f.id] != null && !f.val) {
        const o = f.opts[+v[f.id]]; if (o) { t += o[1]; det.push([f.label + ': ' + o[0], o[1]]); }
      }
    });
    return { total: t, detalle: det };
  }
  function porRango(rangos, valor) { return rangos.find((r) => valor <= r.max) || rangos[rangos.length - 1]; }

  function valores(card, c) {
    const v = {};
    c.campos.forEach((f) => {
      const el = card.querySelector('[data-f="' + f.id + '"]'); if (!el) return;
      if (f.t === 'chk') v[f.id] = el.checked;
      else if (f.t === 'num') v[f.id] = el.value === '' ? NaN : parseFloat(String(el.value).replace(',', '.'));
      else if (f.t === 'date') v[f.id] = el.value ? new Date(el.value + 'T12:00:00') : null;
      else if (f.t === 'sel') v[f.id] = el.value === '' ? '' : (f.val ? f.opts[+el.value][1] : el.value);
    });
    return v;
  }
  function completo(c, v) {
    return c.campos.every((f) => {
      if (f.opcional || f.t === 'chk') return true;
      if (f.t === 'num') return Number.isFinite(v[f.id]);
      if (f.t === 'date') return !!v[f.id];
      if (f.t === 'sel') return v[f.id] !== '' && v[f.id] != null;
      return true;
    });
  }
  function evaluar(c, v) {
    if (c.calc) return c.calc(v, { num, sumaPuntos: (cs) => sumaPuntos(cs || c.campos, v), porRango });
    const s = sumaPuntos(c.campos, v);
    const r = porRango(c.rangos, s.total);
    return { principal: { label: c.unidadScore || 'Puntaje', valor: s.total, unidad: c.maximo ? ' / ' + c.maximo : '' }, nivel: r.nivel, titulo: r.titulo, texto: r.texto, detalle: s.detalle };
  }

  // ---------- UI ----------
  function campoHtml(f, cid) {
    const id = cid + '_' + f.id;
    if (f.t === 'chk') return `<label class="cc-chk" for="${id}"><input type="checkbox" id="${id}" data-f="${f.id}"><span>${esc(f.label)}</span>${f.pts ? `<em>${f.pts > 0 ? '+' : ''}${f.pts}</em>` : ''}</label>`;
    if (f.t === 'sel') return `<div class="cc-f"><label for="${id}">${esc(f.label)}</label><select id="${id}" data-f="${f.id}"><option value="">Elegir…</option>${f.opts.map((o, i) => `<option value="${i}">${esc(o[0])}${f.val ? '' : ' (' + (o[1] > 0 ? '+' : '') + o[1] + ')'}</option>`).join('')}</select></div>`;
    if (f.t === 'date') return `<div class="cc-f"><label for="${id}">${esc(f.label)}</label><input type="date" id="${id}" data-f="${f.id}" ${f.hoy ? 'value="' + new Date().toISOString().slice(0, 10) + '"' : ''}></div>`;
    return `<div class="cc-f"><label for="${id}">${esc(f.label)}${f.unit ? ' <small>(' + esc(f.unit) + ')</small>' : ''}</label><input type="number" inputmode="decimal" id="${id}" data-f="${f.id}" step="${f.step}" ${f.min != null ? 'min="' + f.min + '"' : ''} ${f.max != null ? 'max="' + f.max + '"' : ''} placeholder="${f.ph || ''}"></div>`;
  }
  function cardHtml(c) {
    const a = AREAS[c.area] || AREAS.general;
    const num_ = c.campos.filter((f) => f.t === 'num' || f.t === 'date' || f.t === 'sel');
    const chks = c.campos.filter((f) => f.t === 'chk');
    return `<article class="cc-card" id="c-${c.id}" data-area="${c.area}" data-b="${esc((c.nombre + ' ' + c.desc + ' ' + (c.alias || '')).toLowerCase())}" style="--ac:${a.c}">
      <button type="button" class="cc-head" aria-expanded="false" aria-controls="p-${c.id}">
        <span class="ic">${c.ico || a.ico}</span><span class="tt"><b>${esc(c.nombre)}</b><small>${esc(c.desc)}</small></span><i class="chev" aria-hidden="true"></i></button>
      <div class="cc-body" id="p-${c.id}" hidden>
        ${c.intro ? `<p class="cc-intro">${esc(c.intro)}</p>` : ''}
        <div class="cc-grid">${num_.map((f) => campoHtml(f, c.id)).join('')}</div>
        ${chks.length ? `<div class="cc-chks">${chks.map((f) => campoHtml(f, c.id)).join('')}</div>` : ''}
        <div class="cc-out" aria-live="polite"></div>
        <div class="cc-pie"><button type="button" class="cc-btn" data-a="limpiar">↺ Limpiar</button><button type="button" class="cc-btn" data-a="copiar">📋 Copiar resultado</button></div>
        <div class="cc-fuente"><b>Fundamento:</b> ${esc(c.fuente)}${c.nota ? `<br><span>${esc(c.nota)}</span>` : ''}</div>
      </div></article>`;
  }
  function pintar(card, c) {
    const out = card.querySelector('.cc-out'); const v = valores(card, c);
    if (!completo(c, v)) { out.className = 'cc-out'; out.innerHTML = '<p class="cc-esp">Completá los datos para ver el resultado.</p>'; card._res = null; return; }
    let r; try { r = evaluar(c, v); } catch (e) { out.innerHTML = '<p class="cc-esp">No se pudo calcular con esos datos.</p>'; return; }
    if (!r) { out.className = 'cc-out'; out.innerHTML = '<p class="cc-esp">Revisá los datos ingresados.</p>'; return; }
    card._res = r;
    out.className = 'cc-out on n-' + (r.nivel || 'info');
    const p = r.principal;
    out.innerHTML = `<div class="cc-big"><span>${esc(p.label)}</span><b>${esc(typeof p.valor === 'number' ? num(p.valor, p.dec == null ? 1 : p.dec) : p.valor)}<small>${esc(p.unidad || '')}</small></b></div>
      ${r.titulo ? `<div class="cc-tit">${esc(r.titulo)}</div>` : ''}${r.texto ? `<p class="cc-txt">${esc(r.texto)}</p>` : ''}
      ${(r.extra || []).length ? `<dl class="cc-extra">${r.extra.map((x) => `<div><dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl>` : ''}
      ${(r.detalle || []).length ? `<details class="cc-det"><summary>Ver detalle (${r.detalle.length})</summary><ul>${r.detalle.map((x) => `<li>${esc(x[0])} <b>${x[1] > 0 ? '+' : ''}${esc(x[1])}</b></li>`).join('')}</ul></details>` : ''}`;
  }
  function textoCopia(c, card) {
    const r = card._res; if (!r) return '';
    const p = r.principal;
    return `${c.nombre}: ${typeof p.valor === 'number' ? num(p.valor, p.dec == null ? 1 : p.dec) : p.valor}${p.unidad || ''}${r.titulo ? ' · ' + r.titulo : ''}${r.texto ? '\n' + r.texto : ''}${(r.extra || []).map((x) => '\n' + x[0] + ': ' + x[1]).join('')}\nFundamento: ${c.fuente}\n— Calculadoras clínicas · NikaMed (nikamed.com.ar/calculadoras.html). Herramienta de apoyo: verificá con el protocolo de tu institución.`;
  }

  function montar(host, opts) {
    opts = opts || {};
    const usadas = {}; REG.forEach((c) => { usadas[c.area] = (usadas[c.area] || 0) + 1; });
    host.innerHTML = `<div class="cc-barra"><input type="search" id="cc-q" placeholder="Buscar: Ranson, Wells, FPP, CHA2DS2-VASc…" aria-label="Buscar calculadora" autocomplete="off">
      <div class="cc-chips" id="cc-chips"><button type="button" class="on" data-ar="">Todas <i>${REG.length}</i></button>${Object.keys(AREAS).filter((k) => usadas[k]).map((k) => `<button type="button" data-ar="${k}" style="--ac:${AREAS[k].c}">${AREAS[k].ico} ${esc(AREAS[k].nombre)} <i>${usadas[k]}</i></button>`).join('')}</div></div>
      <div class="cc-lista" id="cc-lista">${REG.map(cardHtml).join('')}</div><p class="cc-vacio" id="cc-vacio" hidden>No encontramos ninguna calculadora con esa búsqueda.</p>`;
    const lista = host.querySelector('#cc-lista'); let area = '', q = '';
    const filtrar = () => {
      let n = 0;
      lista.querySelectorAll('.cc-card').forEach((c) => { const ok = (!area || c.dataset.area === area) && (!q || c.dataset.b.includes(q)); c.hidden = !ok; if (ok) n++; });
      host.querySelector('#cc-vacio').hidden = n > 0;
    };
    host.querySelector('#cc-q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); filtrar(); });
    host.querySelector('#cc-chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; area = b.dataset.ar; host.querySelectorAll('#cc-chips button').forEach((x) => x.classList.toggle('on', x === b)); filtrar(); });
    lista.addEventListener('click', (e) => {
      const card = e.target.closest('.cc-card'); if (!card) return; const c = REG.find((x) => x.id === card.id.slice(2));
      const h = e.target.closest('.cc-head');
      if (h) { const abrir = h.getAttribute('aria-expanded') !== 'true'; h.setAttribute('aria-expanded', String(abrir)); card.querySelector('.cc-body').hidden = !abrir; card.classList.toggle('abierta', abrir); if (abrir) { pintar(card, c); try { history.replaceState(null, '', '#' + c.id); } catch (_) {} } return; }
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'limpiar') { card.querySelectorAll('[data-f]').forEach((el) => { if (el.type === 'checkbox') el.checked = false; else if (el.type === 'date') el.value = ''; else el.value = ''; }); pintar(card, c); }
      else if (b.dataset.a === 'copiar') { const t = textoCopia(c, card); if (!t) return; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { b.textContent = '✅ Copiado'; setTimeout(() => { b.textContent = '📋 Copiar resultado'; }, 1600); }).catch(() => { window.prompt('Copiá el resultado:', t); }); }
    });
    lista.addEventListener('input', (e) => { const card = e.target.closest('.cc-card'); if (!card) return; pintar(card, REG.find((x) => x.id === card.id.slice(2))); });
    lista.addEventListener('change', (e) => { const card = e.target.closest('.cc-card'); if (!card) return; pintar(card, REG.find((x) => x.id === card.id.slice(2))); });
    // abrir la calculadora indicada en la URL (#id)
    const id = (location.hash || '').slice(1); const t = id && lista.querySelector('#c-' + CSS.escape(id));
    if (t) { t.querySelector('.cc-head').click(); setTimeout(() => t.scrollIntoView({ block: 'start', behavior: 'smooth' }), 120); }
  }

  window.NikaCalcs = { evaluar, agregar: (a) => { a.forEach((c) => REG.push(c)); }, montar, N, C, S, D, Sx, AREAS, num, REG };
})();
