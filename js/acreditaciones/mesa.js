// CAMPUS NIKA — ProcedureWorkbench: mesa de instrumental / armado de bandeja (fase previa al simulador 3D).
// 100 % configurable por JSON (data/acreditaciones/<area>/instrumental_<id>.json):
//   grupos[]  estantes de la mesa
//   items[]   { id, grupo, emoji|img, nombre, detalle, descripcion, sexo?, correcto, critico, falta?, feedback? }
//             correcto:true  → elemento requerido (falta = mensaje si no está en la bandeja)
//             correcto:false → distractor/trampa (feedback = por qué es incorrecto)
// Este módulo no importa three.js: la escena 3D se inicializa recién después de validar la mesa.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class ProcedureWorkbench {
  constructor(cfg) { this.cfg = cfg; this.el = null; }

  visibles(sexo) { return this.cfg.items.filter((i) => !i.sexo || i.sexo === sexo); }

  /** Evalúa la bandeja: devuelve faltantes (requeridos ausentes), incorrectos (distractores presentes) y ok. */
  evaluar(sel, sexo) {
    const items = this.visibles(sexo);
    const faltantes = items.filter((i) => i.correcto && !sel.has(i.id));
    const incorrectos = items.filter((i) => !i.correcto && sel.has(i.id));
    return { faltantes, incorrectos, ok: !faltantes.length && !incorrectos.length, seleccion: [...sel] };
  }

  /**
   * @param {HTMLElement} cont contenedor
   * @param {{sexo:'F'|'M', modo:'practica'|'examen', caso?:object, onValidar:(res)=>void, onSexo?:(s)=>void}} opt
   */
  mount(cont, opt) {
    this.dispose();
    this.el = cont; this.opt = opt; this.sel = new Set(); this.foco = null; this.intentos = 0;
    cont.innerHTML = `<div class="acr-wb">
      <div class="acr-wb-cab">
        <div><h2>${esc(this.cfg.titulo)}</h2><p>${esc(this.cfg.consigna)}</p></div>
        ${opt.modo === 'practica' ? `<span class="acr-sexo"><button data-wb-sx="F" class="${opt.sexo === 'F' ? 'on' : ''}">♀ Mujer</button><button data-wb-sx="M" class="${opt.sexo === 'M' ? 'on' : ''}">♂ Varón</button></span>` : ''}
      </div>
      ${opt.caso ? `<div class="acr-caso"><b>Paciente:</b> ${opt.caso.sexo === 'F' ? 'mujer' : 'varón'} de ${opt.caso.edad} años. ${esc(opt.caso.motivo)}</div>` : ''}
      <div class="acr-wb-grid">
        <div class="acr-wb-mesa" id="wb-mesa"></div>
        <aside class="acr-wb-lado">
          <div class="acr-wb-ins" id="wb-ins"></div>
          <div class="acr-wb-bandeja" id="wb-bandeja"><div class="acr-wb-bt">🍽️ Bandeja estéril <span id="wb-n">0</span></div><div class="acr-wb-bl" id="wb-bl"></div></div>
          <button class="acr-btn acr-wb-pasar" id="wb-pasar">Pasar al procedimiento con el paciente →</button>
        </aside>
      </div>
      <div class="acr-wb-modal" id="wb-modal" hidden></div>
    </div>`;
    this.pintarMesa(); this.pintarBandeja(); this.pintarInspeccion();
    cont.onclick = (e) => this.clic(e);
    cont.ondragstart = (e) => { const c = e.target.closest('[data-id]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.id); e.dataTransfer.effectAllowed = 'move'; } };
    cont.ondragover = (e) => { if (e.target.closest('#wb-bandeja, #wb-mesa')) e.preventDefault(); };
    cont.ondrop = (e) => {
      const id = e.dataTransfer.getData('text/plain'); if (!id) return;
      if (e.target.closest('#wb-bandeja')) { e.preventDefault(); this.agregar(id); }
      else if (e.target.closest('#wb-mesa')) { e.preventDefault(); this.quitar(id); }
    };
  }

  pintarMesa() {
    const items = this.visibles(this.opt.sexo);
    this.el.querySelector('#wb-mesa').innerHTML = this.cfg.grupos.map((g) => {
      const its = items.filter((i) => i.grupo === g.id);
      if (!its.length) return '';
      return `<div class="acr-wb-estante"><div class="acr-wb-et">${esc(g.titulo)}</div><div class="acr-wb-fila">${its.map((i) => {
        const en = this.sel.has(i.id);
        return `<button type="button" class="acr-wb-it ${en ? 'en-bandeja' : ''} ${this.foco === i.id ? 'foco' : ''}" data-id="${i.id}" draggable="${!en}">
          ${i.img ? `<img src="${esc(i.img)}" alt="">` : `<span class="e">${i.emoji}</span>`}<span class="n">${esc(i.nombre)}</span></button>`;
      }).join('')}</div></div>`;
    }).join('');
  }

  pintarBandeja() {
    const items = this.visibles(this.opt.sexo).filter((i) => this.sel.has(i.id));
    this.el.querySelector('#wb-n').textContent = items.length;
    this.el.querySelector('#wb-bl').innerHTML = items.length
      ? items.map((i) => `<span class="acr-wb-ch" data-id="${i.id}" draggable="true"><span>${i.img ? '' : i.emoji}</span> ${esc(i.nombre)}<button type="button" data-quitar="${i.id}" aria-label="Quitar">✕</button></span>`).join('')
      : '<div class="acr-wb-vacia">Arrastrá acá los elementos o usá el botón «Agregar a la bandeja».</div>';
  }

  pintarInspeccion() {
    const cont = this.el.querySelector('#wb-ins');
    const it = this.foco ? this.cfg.items.find((i) => i.id === this.foco) : null;
    if (!it) { cont.innerHTML = '<div class="acr-wb-ins-vacio">🔍 Tocá un elemento de la mesa para inspeccionarlo.</div>'; return; }
    const en = this.sel.has(it.id);
    cont.innerHTML = `<div class="acr-wb-ficha">
      <div class="acr-wb-foto">${it.img ? `<img src="${esc(it.img)}" alt="">` : `<span>${it.emoji}</span>`}</div>
      <div class="acr-wb-fd"><h3>${esc(it.nombre)}</h3><div class="acr-wb-det">${esc(it.detalle)}</div><p>${esc(it.descripcion)}</p>
        <button type="button" class="acr-btn ${en ? 'sec' : ''}" data-alt="${it.id}">${en ? 'Quitar de la bandeja' : 'Agregar a la bandeja'}</button></div></div>`;
  }

  agregar(id) { this.sel.add(id); this.foco = id; this.refrescar(); }
  quitar(id) { this.sel.delete(id); this.refrescar(); }
  refrescar() { this.pintarMesa(); this.pintarBandeja(); this.pintarInspeccion(); }

  clic(e) {
    const q = e.target.closest('[data-quitar]'); if (q) { this.quitar(q.dataset.quitar); return; }
    const alt = e.target.closest('[data-alt]'); if (alt) { const id = alt.dataset.alt; this.sel.has(id) ? this.quitar(id) : this.agregar(id); return; }
    const sx = e.target.closest('[data-wb-sx]');
    if (sx) { this.opt.sexo = sx.dataset.wbSx; this.sel.clear(); this.foco = null; if (this.opt.onSexo) this.opt.onSexo(this.opt.sexo); this.el.querySelectorAll('[data-wb-sx]').forEach((b) => b.classList.toggle('on', b.dataset.wbSx === this.opt.sexo)); this.refrescar(); return; }
    const it = e.target.closest('.acr-wb-it'); if (it) { this.foco = it.dataset.id; this.refrescar(); return; }
    const ch = e.target.closest('.acr-wb-ch'); if (ch && !e.target.closest('button')) { this.foco = ch.dataset.id; this.refrescar(); return; }
    if (e.target.id === 'wb-pasar') this.validar();
    if (e.target.id === 'wb-cerrar') this.el.querySelector('#wb-modal').hidden = true;
    if (e.target.id === 'wb-auto') { this.autocorregir(); }
  }

  validar() {
    const res = this.evaluar(this.sel, this.opt.sexo);
    if (this.opt.modo === 'examen') { this.opt.onValidar(res); return; }       // examen: avanza y registra en silencio
    if (res.ok) { this.opt.onValidar(res); return; }                              // práctica: sólo avanza si está correcta
    this.intentos++;
    const m = this.el.querySelector('#wb-modal'); m.hidden = false;
    m.innerHTML = `<div class="acr-wb-dlg" role="alertdialog" aria-modal="true">
      <h3>⚠ Revisá la bandeja antes de ir con el paciente</h3>
      ${res.incorrectos.length ? `<div class="acr-fase" style="margin-top:6px">Elementos que no corresponden</div>${res.incorrectos.map((i) => `<div class="acr-info mal"><b>${i.emoji} ${esc(i.nombre)}</b><br>${esc(i.feedback)}</div>`).join('')}` : ''}
      ${res.faltantes.length ? `<div class="acr-fase" style="margin-top:6px">Faltan elementos${res.faltantes.some((i) => i.critico) ? ' (hay críticos)' : ''}</div>${res.faltantes.map((i) => `<div class="acr-info ${i.critico ? 'mal' : ''}"><b>${i.emoji} ${esc(i.nombre)}${i.critico ? ' · crítico' : ''}</b><br>${esc(i.falta)}</div>`).join('')}` : ''}
      <div class="acr-row"><button class="acr-btn" id="wb-cerrar">Volver a la mesa</button>${this.intentos >= 2 ? '<button class="acr-btn sec" id="wb-auto">Corregir la bandeja por mí</button>' : ''}</div>
    </div>`;
  }

  autocorregir() {
    const r = this.evaluar(this.sel, this.opt.sexo);
    r.incorrectos.forEach((i) => this.sel.delete(i.id)); r.faltantes.forEach((i) => this.sel.add(i.id));
    this.el.querySelector('#wb-modal').hidden = true; this.refrescar();
  }

  dispose() { if (this.el) { this.el.onclick = this.el.ondragstart = this.el.ondragover = this.el.ondrop = null; this.el.innerHTML = ''; } this.el = null; }
}

export function crearMesa(cfg) { return new ProcedureWorkbench(cfg); }
export default crearMesa;
