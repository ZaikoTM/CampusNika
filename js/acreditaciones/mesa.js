// CAMPUS NIKA — ProcedureWorkbench: mesa de instrumental inmersiva (fase previa al simulador 3D).
// 100 % configurable por JSON (data/acreditaciones/<area>/instrumental_<id>.json):
//   bandeja_img            imagen de la bandeja receptora
//   grupos[]               estantes (se reparten a ambos lados de la bandeja)
//   items[]                { id, grupo, img, nombre, detalle, descripcion, ficha:[[campo,valor]], sexo?, correcto, critico, falta?, feedback? }
//                          correcto:true → requerido (falta = mensaje si no está en la bandeja) · correcto:false → distractor (feedback)
// No importa three.js: la escena 3D se inicializa recién después de validar la mesa.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SIN_HOVER = typeof matchMedia === 'function' && matchMedia('(hover: none)').matches;
const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class ProcedureWorkbench {
  constructor(cfg) { this.cfg = cfg; this.el = null; }

  visibles(sexo) { return this.cfg.items.filter((i) => !i.sexo || i.sexo === sexo); }
  item(id) { return this.cfg.items.find((i) => i.id === id); }

  /** Evalúa la bandeja: faltantes (requeridos ausentes), incorrectos (distractores presentes) y ok. */
  evaluar(sel, sexo) {
    const items = this.visibles(sexo);
    const faltantes = items.filter((i) => i.correcto && !sel.has(i.id));
    const incorrectos = items.filter((i) => !i.correcto && sel.has(i.id));
    return { faltantes, incorrectos, ok: !faltantes.length && !incorrectos.length, seleccion: [...sel] };
  }

  /**
   * @param {HTMLElement} cont
   * @param {{sexo:'F'|'M', modo:'practica'|'examen', caso?:object, onValidar:(res)=>void, onSexo?:(s)=>void}} opt
   */
  mount(cont, opt) {
    this.dispose();
    this.el = cont; this.opt = opt; this.sel = new Set(); this.intentos = 0; this.ocupado = false;
    cont.innerHTML = `<div class="wb">
      <div class="wb-cab">
        <div><h2>${esc(this.cfg.titulo)}</h2><p>${esc(this.cfg.consigna)}</p></div>
        ${opt.modo === 'practica' ? `<span class="acr-sexo"><button data-wb-sx="F" class="${opt.sexo === 'F' ? 'on' : ''}">♀ Mujer</button><button data-wb-sx="M" class="${opt.sexo === 'M' ? 'on' : ''}">♂ Varón</button></span>` : ''}
      </div>
      ${opt.caso ? `<div class="wb-caso"><b>Paciente:</b> ${opt.caso.sexo === 'F' ? 'mujer' : 'varón'} de ${opt.caso.edad} años. ${esc(opt.caso.motivo)}</div>` : ''}
      <div class="wb-escena" id="wb-escena">
        <div class="wb-pano"></div>
        <div class="wb-zona izq" id="wb-izq"></div>
        <div class="wb-centro">
          <div class="wb-bandeja" id="wb-bandeja">
            <img class="wb-bandeja-img" src="${esc(this.cfg.bandeja_img)}" alt="Bandeja de acero quirúrgico" draggable="false">
            <div class="wb-bandeja-in" id="wb-in"><div class="wb-vacia" id="wb-vacia">Arrastrá acá los insumos<br>o tocalos para agregarlos</div></div>
            <div class="wb-contador">Bandeja <span id="wb-n">0</span></div>
          </div>
          <button class="wb-pasar" id="wb-pasar" type="button"><span>Pasar al procedimiento con el paciente</span> →</button>
        </div>
        <div class="wb-zona der" id="wb-der"></div>
      </div>
      <div class="wb-ficha" id="wb-ficha" hidden></div>
      <div class="wb-modal" id="wb-modal" hidden></div>
    </div>`;
    this.pintarMesa();
    this.actualizarBoton();
    cont.onclick = (e) => this.clic(e);
    cont.onmouseover = (e) => this.hover(e);
    cont.onmouseout = (e) => { if (!SIN_HOVER && !e.relatedTarget?.closest?.('.wb-obj, .wb-bi, .wb-ficha')) this.ocultarFicha(); };
    cont.ondragstart = (e) => {
      const c = e.target.closest('[data-id]'); if (!c || this.ocupado) return;
      e.dataTransfer.setData('text/plain', c.dataset.id); e.dataTransfer.effectAllowed = 'move'; this.ocultarFicha();
    };
    cont.ondragover = (e) => { if (e.target.closest('.wb-bandeja, .wb-zona')) { e.preventDefault(); e.target.closest('.wb-bandeja')?.classList.add('sobre'); } };
    cont.ondragleave = (e) => { if (!e.relatedTarget?.closest?.('.wb-bandeja')) this.el.querySelector('.wb-bandeja')?.classList.remove('sobre'); };
    cont.ondrop = (e) => {
      const id = e.dataTransfer.getData('text/plain'); this.el.querySelector('.wb-bandeja')?.classList.remove('sobre'); if (!id) return;
      if (e.target.closest('.wb-bandeja')) { e.preventDefault(); this.agregar(id, true); }
      else if (e.target.closest('.wb-zona')) { e.preventDefault(); this.quitar(id, true); }
    };
  }

  // ---------------------------------------------------------------- mesa
  pintarMesa() {
    const items = this.visibles(this.opt.sexo);
    const izq = [], der = [];
    this.cfg.grupos.forEach((g, k) => { items.filter((i) => i.grupo === g.id).forEach((i) => (k % 2 === 0 ? izq : der).push(i)); });
    const html = (arr) => arr.map((i, k) => `<button type="button" class="wb-obj" data-id="${i.id}" draggable="true" style="--r:${((k * 37 + i.id.length * 11) % 9) - 4}deg;--d:${(k % 6) * 40}ms">
      <img src="${esc(i.img)}" alt="${esc(i.nombre)}" draggable="false"><span class="wb-nom">${esc(i.nombre)}</span></button>`).join('');
    this.el.querySelector('#wb-izq').innerHTML = html(izq);
    this.el.querySelector('#wb-der').innerHTML = html(der);
    this.el.querySelector('#wb-in').querySelectorAll('.wb-bi').forEach((n) => n.remove());
    this.el.querySelector('#wb-vacia').hidden = false;
    this.el.querySelector('#wb-n').textContent = '0';
  }

  objMesa(id) { return this.el.querySelector(`.wb-obj[data-id="${id}"]`); }
  objBandeja(id) { return this.el.querySelector(`.wb-bi[data-id="${id}"]`); }

  // ---------------------------------------------------------------- vuelo (FLIP) entre mesa y bandeja
  volar(src, dst, imgSrc, fin, rebote) {
    if (reducido || !src || !dst || !src.getBoundingClientRect) { fin(); return; }
    const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
    const c = document.createElement('img'); c.src = imgSrc; c.className = 'wb-vuelo'; c.draggable = false;
    Object.assign(c.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.appendChild(c);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), s = Math.min(b.width / a.width, b.height / a.height);
    const an = c.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', offset: 0 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 46}px) scale(${(1 + s) / 2 + 0.08}) rotate(${rebote ? -6 : 6}deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`, offset: 1 },
    ], { duration: 560, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'forwards' });
    let hecho = false;
    const listo = () => { if (hecho) return; hecho = true; c.remove(); fin(); };
    an.onfinish = listo; an.oncancel = listo;
    setTimeout(listo, 760); // respaldo si el navegador pausa las animaciones (pestaña en segundo plano)
  }

  agregar(id, sinVuelo) {
    if (this.sel.has(id) || this.ocupado) return;
    const it = this.item(id); const src = this.objMesa(id); if (!it || !src) return;
    this.sel.add(id); this.ocultarFicha();
    const bi = document.createElement('div');
    bi.className = 'wb-bi oculto'; bi.dataset.id = id; bi.draggable = true;
    bi.style.setProperty('--r', ((id.length * 13) % 11) - 5 + 'deg');
    bi.innerHTML = `<img src="${esc(it.img)}" alt="${esc(it.nombre)}" draggable="false">`;
    this.el.querySelector('#wb-in').appendChild(bi);
    this.el.querySelector('#wb-vacia').hidden = true;
    src.classList.add('ausente');
    this.contador();
    const aterrizar = () => { bi.classList.remove('oculto'); bi.classList.add('asienta'); this.reaccion(it); };
    if (sinVuelo) aterrizar(); else this.volar(src.querySelector('img'), bi, it.img, aterrizar, false);
    this.actualizarBoton();
  }

  quitar(id, sinVuelo) {
    if (!this.sel.has(id)) return;
    const it = this.item(id); const bi = this.objBandeja(id); const dst = this.objMesa(id); if (!it || !bi) return;
    this.sel.delete(id); this.ocultarFicha();
    const fin = () => { dst?.classList.remove('ausente'); dst?.classList.add('vuelve'); setTimeout(() => dst?.classList.remove('vuelve'), 500); };
    const origen = bi.querySelector('img'); const r = origen.getBoundingClientRect();
    bi.remove();
    this.el.querySelector('#wb-vacia').hidden = this.sel.size > 0;
    this.contador();
    if (sinVuelo || reducido || !dst) fin();
    else { const fantasma = { getBoundingClientRect: () => r }; this.volar(fantasma, dst.querySelector('img'), it.img, fin, true); }
    this.actualizarBoton();
  }

  // reacción de la bandeja: práctica = feedback inmediato (cian / sacudida roja); examen = pulso neutro (no revela nada)
  reaccion(it) {
    const b = this.el.querySelector('#wb-bandeja'); if (!b) return;
    const clase = this.opt.modo === 'practica' ? (it.correcto ? 'pulso-ok' : 'sacude') : 'pulso-neutro';
    b.classList.remove('pulso-ok', 'sacude', 'pulso-neutro'); void b.offsetWidth; b.classList.add(clase);
    setTimeout(() => b.classList.remove(clase), 700);
  }
  contador() {
    const n = this.el.querySelector('#wb-n'); n.textContent = this.sel.size;
    n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop');
  }
  actualizarBoton() {
    const btn = this.el.querySelector('#wb-pasar'); if (!btn) return;
    const listo = this.opt.modo === 'practica' ? this.evaluar(this.sel, this.opt.sexo).ok : this.sel.size > 0;
    btn.classList.toggle('listo', listo);
  }

  // ---------------------------------------------------------------- inspección flotante
  mostrarFicha(id, ancla, conBoton) {
    const it = this.item(id); const f = this.el.querySelector('#wb-ficha'); if (!it || !f) return;
    const en = this.sel.has(id);
    f.innerHTML = `<div class="wb-f-img"><img src="${esc(it.img)}" alt="" draggable="false"></div>
      <div class="wb-f-txt"><h3>${esc(it.nombre)}</h3><div class="wb-f-det">${esc(it.detalle)}</div>
      <table>${(it.ficha || []).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
      <p>${esc(it.descripcion)}</p>
      ${conBoton ? `<button type="button" class="wb-f-btn" data-alt="${id}">${en ? 'Quitar de la bandeja' : 'Agregar a la bandeja'}</button>` : ''}</div>`;
    f.hidden = false; f.classList.remove('entra'); void f.offsetWidth; f.classList.add('entra');
    const r = ancla.getBoundingClientRect(); const w = f.offsetWidth || 420, h = f.offsetHeight || 220;
    let x = r.right + 14, y = r.top - 10;
    if (x + w > window.innerWidth - 10) x = r.left - w - 14;
    if (x < 10) x = Math.max(10, Math.min(window.innerWidth - w - 10, r.left));
    if (y + h > window.innerHeight - 10) y = window.innerHeight - h - 10;
    f.style.left = x + 'px'; f.style.top = Math.max(10, y) + 'px';
    this.fichaId = id;
  }
  ocultarFicha() { const f = this.el?.querySelector('#wb-ficha'); if (f) f.hidden = true; this.fichaId = null; }
  hover(e) {
    if (SIN_HOVER) return;
    const o = e.target.closest('.wb-obj, .wb-bi'); if (!o) return;
    if (o.classList.contains('ausente')) return;
    if (this.fichaId !== o.dataset.id) this.mostrarFicha(o.dataset.id, o, false);
  }

  clic(e) {
    const alt = e.target.closest('[data-alt]'); if (alt) { const id = alt.dataset.alt; this.ocultarFicha(); this.sel.has(id) ? this.quitar(id) : this.agregar(id); return; }
    const sx = e.target.closest('[data-wb-sx]');
    if (sx) { this.opt.sexo = sx.dataset.wbSx; this.sel.clear(); if (this.opt.onSexo) this.opt.onSexo(this.opt.sexo); this.el.querySelectorAll('[data-wb-sx]').forEach((b) => b.classList.toggle('on', b.dataset.wbSx === this.opt.sexo)); this.pintarMesa(); this.actualizarBoton(); return; }
    const bi = e.target.closest('.wb-bi'); if (bi) { this.quitar(bi.dataset.id); return; }
    const ob = e.target.closest('.wb-obj');
    if (ob) {
      if (ob.classList.contains('ausente')) return;
      if (SIN_HOVER) this.mostrarFicha(ob.dataset.id, ob, true); else this.agregar(ob.dataset.id);
      return;
    }
    if (e.target.id === 'wb-pasar' || e.target.closest('#wb-pasar')) { this.validar(); return; }
    if (e.target.id === 'wb-cerrar') { this.el.querySelector('#wb-modal').hidden = true; return; }
    if (e.target.id === 'wb-auto') { this.autocorregir(); return; }
    if (!e.target.closest('.wb-ficha')) this.ocultarFicha();
  }

  // ---------------------------------------------------------------- validación
  validar() {
    if (this.ocupado) return;
    const res = this.evaluar(this.sel, this.opt.sexo);
    if (this.opt.modo === 'examen' || res.ok) { this.salir(res); return; }
    this.intentos++;
    const b = this.el.querySelector('#wb-bandeja'); b.classList.remove('sacude', 'alerta'); void b.offsetWidth; b.classList.add('sacude', 'alerta');
    setTimeout(() => b.classList.remove('sacude', 'alerta'), 900);
    const m = this.el.querySelector('#wb-modal'); m.hidden = false;
    m.innerHTML = `<div class="wb-dlg" role="alertdialog" aria-modal="true">
      <h3>⚠ Revisá la bandeja antes de ir con el paciente</h3>
      ${res.incorrectos.length ? `<div class="acr-fase" style="margin-top:6px">Elementos que no corresponden</div>${res.incorrectos.map((i) => `<div class="wb-err"><img src="${esc(i.img)}" alt=""><div><b>${esc(i.nombre)}</b><br>${esc(i.feedback)}</div></div>`).join('')}` : ''}
      ${res.faltantes.length ? `<div class="acr-fase" style="margin-top:6px">Faltan elementos${res.faltantes.some((i) => i.critico) ? ' (hay críticos)' : ''}</div>${res.faltantes.map((i) => `<div class="wb-err ${i.critico ? '' : 'leve'}"><img src="${esc(i.img)}" alt=""><div><b>${esc(i.nombre)}${i.critico ? ' · crítico' : ''}</b><br>${esc(i.falta)}</div></div>`).join('')}` : ''}
      <div class="acr-row"><button class="acr-btn" id="wb-cerrar">Volver a la mesa</button>${this.intentos >= 2 ? '<button class="acr-btn sec" id="wb-auto">Corregir la bandeja por mí</button>' : ''}</div>
    </div>`;
  }
  autocorregir() {
    const r = this.evaluar(this.sel, this.opt.sexo);
    this.el.querySelector('#wb-modal').hidden = true;
    r.incorrectos.forEach((i) => this.quitar(i.id, true));
    let k = 0;
    r.faltantes.forEach((i) => { setTimeout(() => { if (this.el) this.agregar(i.id); }, 120 * k++); });
  }
  /** transición de salida: la mesa se desvanece con desenfoque y recién entonces se avisa para montar el 3D */
  salir(res) {
    this.ocupado = true; this.ocultarFicha();
    const root = this.el.querySelector('.wb'); root.classList.add('saliendo');
    setTimeout(() => this.opt.onValidar(res), reducido ? 0 : 650);
  }

  dispose() {
    if (this.el) { this.el.onclick = this.el.onmouseover = this.el.onmouseout = this.el.ondragstart = this.el.ondragover = this.el.ondragleave = this.el.ondrop = null; this.el.innerHTML = ''; }
    document.querySelectorAll('.wb-vuelo').forEach((n) => n.remove());
    this.el = null;
  }
}

export function crearMesa(cfg) { return new ProcedureWorkbench(cfg); }
export default crearMesa;
