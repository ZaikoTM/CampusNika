// CAMPUS NIKA — ProcedureWorkbench: caso clínico + mesa de instrumental inmersiva (fase previa al simulador 3D).
// 100 % configurable por JSON (data/acreditaciones/<area>/instrumental_<id>.json):
//   bandeja_img            imagen de la bandeja receptora
//   grupos[]               estantes (se reparten a ambos lados de la bandeja)
//   items[]                { id, grupo, img, nombre, detalle, descripcion, ficha:[[campo,valor]], sexo?, solo_alergia?, latex?,
//                            correcto, critico, falta?, feedback?, feedback_latex? }
//                          correcto:true → requerido (falta = mensaje si no está en la bandeja) · correcto:false → distractor (feedback)
//                          latex:true → pasa a ser incorrecto (crítico) si el caso tiene alergia al látex · solo_alergia:'latex' → sólo aparece en ese caso
// El caso clínico (opt.caso) define el sexo del paciente y las alergias, y por lo tanto qué insumos son correctos.
// No importa three.js: la escena 3D se inicializa recién después de validar la mesa.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SIN_HOVER = typeof matchMedia === 'function' && matchMedia('(hover: none)').matches;
const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class ProcedureWorkbench {
  constructor(cfg) { this.cfg = cfg; this.el = null; this.caso = null; }

  // ---------------------------------------------------------------- reglas según el caso
  visibles() {
    const c = this.caso || {};
    return this.cfg.items.filter((i) => (!i.sexo || i.sexo === c.sexo) && (!i.solo_alergia || i.solo_alergia === c.alergia));
  }
  item(id) { return this.cfg.items.find((i) => i.id === id); }
  /** corrección efectiva del insumo para el caso actual */
  ef(i) {
    const alerg = this.caso && this.caso.alergia === 'latex' && i.latex;
    return alerg ? { correcto: false, critico: true, feedback: i.feedback_latex } : { correcto: i.correcto, critico: !!i.critico, feedback: i.feedback, falta: i.falta };
  }

  /** Evalúa la bandeja: faltantes (requeridos ausentes), incorrectos (distractores presentes) y ok. */
  evaluar(sel) {
    const items = this.visibles();
    const faltantes = items.filter((i) => this.ef(i).correcto && !sel.has(i.id)).map((i) => ({ ...i, critico: this.ef(i).critico }));
    const incorrectos = items.filter((i) => !this.ef(i).correcto && sel.has(i.id)).map((i) => ({ ...i, critico: this.ef(i).critico, feedback: this.ef(i).feedback }));
    return { faltantes, incorrectos, ok: !faltantes.length && !incorrectos.length, seleccion: [...sel] };
  }

  /**
   * @param {HTMLElement} cont
   * @param {{caso:object, casos?:object[], modo:'practica'|'examen', onValidar:(res)=>void, onCaso?:(c)=>void}} opt
   */
  mount(cont, opt) {
    this.dispose();
    this.el = cont; this.opt = opt; this.caso = opt.caso; this.sel = new Set(); this.intentos = 0; this.ocupado = false;
    cont.onclick = (e) => this.clic(e);
    this.pintarCaso();
  }

  // ---------------------------------------------------------------- 1) caso clínico
  pintarCaso() {
    const c = this.caso; const otro = this.opt.modo === 'practica' && this.opt.casos && this.opt.casos.length > 1;
    this.el.innerHTML = `<div class="wb wb-caso-pant">
      ${this.opt.modo === 'demo' ? '<div class="wb-demo-banner"><span class="tag">▶ DEMOSTRACIÓN</span><span id="wb-demo-txt"></span><button type="button" id="wb-saltar">Saltar ✕</button></div>' : ''}
      <div class="wb-hoja">
        <div class="wb-hoja-cab"><span>📋</span><div><h2>Caso clínico</h2><p>Indicación de sondaje vesical</p></div></div>
        <div class="wb-hoja-grid">
          <div><label>Paciente</label><b>${esc(c.nombre || 'Paciente')}</b></div>
          <div><label>Sexo</label><b>${c.sexo === 'F' ? 'Mujer' : 'Varón'}</b></div>
          <div><label>Edad</label><b>${c.edad} años</b></div>
          <div><label>Alergias</label><b class="${c.alergia ? 'rojo' : ''}">${c.alergia === 'latex' ? 'Látex' : 'Sin alergias conocidas'}</b></div>
        </div>
        <div class="wb-hoja-bloque"><label>Motivo de consulta</label><p>${esc(c.motivo)}</p></div>
        <div class="wb-hoja-bloque"><label>Antecedentes</label><p>${esc(c.antecedentes || '—')}</p></div>
        <div class="wb-hoja-bloque"><label>Indicación médica</label><p>${esc(c.indicacion || 'Sondaje vesical.')}</p></div>
        <p class="wb-hoja-nota">Elegí el instrumental según este paciente: sexo, calibre, material y alergias.</p>
        <div class="acr-row">${this.opt.modo === 'demo' ? '' : '<button class="acr-btn" id="wb-ir-mesa">Ir a la mesa de instrumental →</button>'}${otro ? '<button class="acr-btn sec" id="wb-otro">Otro caso</button>' : ''}</div>
      </div></div>`;
  }

  // ---------------------------------------------------------------- 2) mesa
  pintarEscena() {
    const cont = this.el; const c = this.caso;
    cont.innerHTML = `<div class="wb">
      ${this.opt.modo === 'demo' ? '<div class="wb-demo-banner"><span class="tag">▶ DEMOSTRACIÓN</span><span id="wb-demo-txt"></span><button type="button" id="wb-saltar">Saltar ✕</button></div>' : ''}
      <div class="wb-cab">
        <div><h2>${esc(this.cfg.titulo)}</h2><p>${esc(this.cfg.consigna)}</p></div>
        <button type="button" class="wb-caso-btn" id="wb-ver-caso">📋 Ver caso clínico</button>
      </div>
      <div class="wb-caso"><b>${esc(c.nombre || 'Paciente')}</b> · ${c.sexo === 'F' ? 'mujer' : 'varón'} de ${c.edad} años · ${esc(c.motivo)}${c.alergia === 'latex' ? ' <b class="rojo">· ALERGIA AL LÁTEX</b>' : ''}</div>
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
    cont.onmouseover = (e) => this.hover(e);
    cont.onmouseout = (e) => { if (!SIN_HOVER && !e.relatedTarget?.closest?.('.wb-obj, .wb-bi, .wb-ficha')) this.ocultarFicha(); };
    cont.ondragstart = (e) => {
      const o = e.target.closest('[data-id]'); if (!o || this.ocupado) return;
      e.dataTransfer.setData('text/plain', o.dataset.id); e.dataTransfer.effectAllowed = 'move'; this.ocultarFicha();
    };
    cont.ondragover = (e) => { if (e.target.closest('.wb-bandeja, .wb-zona')) { e.preventDefault(); e.target.closest('.wb-bandeja')?.classList.add('sobre'); } };
    cont.ondragleave = (e) => { if (!e.relatedTarget?.closest?.('.wb-bandeja')) this.el?.querySelector('.wb-bandeja')?.classList.remove('sobre'); };
    cont.ondrop = (e) => {
      const id = e.dataTransfer.getData('text/plain'); this.el.querySelector('.wb-bandeja')?.classList.remove('sobre'); if (!id) return;
      if (e.target.closest('.wb-bandeja')) { e.preventDefault(); this.agregar(id, true); }
      else if (e.target.closest('.wb-zona')) { e.preventDefault(); this.quitar(id, true); }
    };
  }

  pintarMesa() {
    const items = this.visibles();
    const izq = [], der = [];
    this.cfg.grupos.forEach((g, k) => { items.filter((i) => i.grupo === g.id).forEach((i) => (k % 2 === 0 ? izq : der).push(i)); });
    const html = (arr) => arr.map((i, k) => `<button type="button" class="wb-obj" data-id="${i.id}" draggable="true" style="--r:${((k * 37 + i.id.length * 11) % 9) - 4}deg;--d:${(k % 6) * 40}ms">
      <span class="wb-foto"><img src="${esc(i.img)}" alt="${esc(i.nombre)}" draggable="false"></span><span class="wb-nom">${esc(i.nombre)}</span></button>`).join('');
    this.el.querySelector('#wb-izq').innerHTML = html(izq);
    this.el.querySelector('#wb-der').innerHTML = html(der);
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
    const r = bi.querySelector('img').getBoundingClientRect();
    bi.remove();
    this.el.querySelector('#wb-vacia').hidden = this.sel.size > 0;
    this.contador();
    if (sinVuelo || reducido || !dst) fin();
    else this.volar({ getBoundingClientRect: () => r }, dst.querySelector('img'), it.img, fin, true);
    this.actualizarBoton();
  }

  // reacción de la bandeja: práctica = feedback inmediato (cian / sacudida roja); examen = pulso neutro (no revela nada)
  reaccion(it) {
    const b = this.el?.querySelector('#wb-bandeja'); if (!b) return;
    const clase = this.opt.modo !== 'examen' ? (this.ef(it).correcto ? 'pulso-ok' : 'sacude') : 'pulso-neutro';
    b.classList.remove('pulso-ok', 'sacude', 'pulso-neutro'); void b.offsetWidth; b.classList.add(clase);
    setTimeout(() => b.classList.remove(clase), 700);
  }
  contador() {
    const n = this.el.querySelector('#wb-n'); n.textContent = this.sel.size;
    n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop');
  }
  actualizarBoton() {
    const btn = this.el?.querySelector('#wb-pasar'); if (!btn) return;
    const listo = this.opt.modo !== 'examen' ? this.evaluar(this.sel).ok : this.sel.size > 0;
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
    const o = e.target.closest('.wb-obj, .wb-bi'); if (!o || o.classList.contains('ausente')) return;
    if (this.fichaId !== o.dataset.id) this.mostrarFicha(o.dataset.id, o, false);
  }

  clic(e) {
    if (e.target.id === 'wb-saltar') { this.cancelado = true; if (this.opt.onSaltar) this.opt.onSaltar(); return; }
    if (e.target.id === 'wb-ir-mesa') { this.pintarEscena(); return; }
    if (e.target.id === 'wb-otro') {
      const otros = this.opt.casos.filter((c) => c.id !== this.caso.id); this.caso = otros[Math.floor(Math.random() * otros.length)];
      if (this.opt.onCaso) this.opt.onCaso(this.caso); this.pintarCaso(); return;
    }
    if (e.target.id === 'wb-ver-caso') { this.sel.clear(); this.pintarCaso(); return; }
    const alt = e.target.closest('[data-alt]'); if (alt) { const id = alt.dataset.alt; this.ocultarFicha(); this.sel.has(id) ? this.quitar(id) : this.agregar(id); return; }
    const bi = e.target.closest('.wb-bi'); if (bi) { this.quitar(bi.dataset.id); return; }
    const ob = e.target.closest('.wb-obj');
    if (ob) {
      if (ob.classList.contains('ausente')) return;
      if (SIN_HOVER) this.mostrarFicha(ob.dataset.id, ob, true); else this.agregar(ob.dataset.id);
      return;
    }
    if (e.target.id === 'wb-pasar' || e.target.closest('#wb-pasar')) { this.validar(); return; }
    if (e.target.id === 'wb-cerrar') { this.el.querySelector('#wb-modal').hidden = true; return; }
    if (e.target.id === 'wb-continuar') { this.corregirYContinuar(); return; }
    if (!e.target.closest('.wb-ficha')) this.ocultarFicha();
  }

  // ---------------------------------------------------------------- validación
  validar() {
    if (this.ocupado) return;
    const res = this.evaluar(this.sel);
    if (this.opt.modo === 'examen' || res.ok) { this.salir(res); return; }   // examen: avanza igual y se registra en silencio
    // práctica: aviso clínico y continuación con la bandeja corregida
    this.intentos++;
    const b = this.el.querySelector('#wb-bandeja'); b.classList.remove('sacude', 'alerta'); void b.offsetWidth; b.classList.add('sacude', 'alerta');
    setTimeout(() => b.classList.remove('sacude', 'alerta'), 900);
    const m = this.el.querySelector('#wb-modal'); m.hidden = false;
    m.innerHTML = `<div class="wb-dlg" role="alertdialog" aria-modal="true">
      <h3>⚠ La bandeja no estaba bien armada</h3>
      <p class="wb-dlg-sub">Esto es lo que habría que corregir antes de ir con el paciente. Te completo la bandeja y seguimos con el procedimiento.</p>
      ${res.incorrectos.length ? `<div class="acr-fase" style="margin-top:6px">Elementos que no corresponden</div>${res.incorrectos.map((i) => `<div class="wb-err"><img src="${esc(i.img)}" alt=""><div><b>${esc(i.nombre)}${i.critico ? ' · grave' : ''}</b><br>${esc(i.feedback)}</div></div>`).join('')}` : ''}
      ${res.faltantes.length ? `<div class="acr-fase" style="margin-top:6px">Faltaban elementos${res.faltantes.some((i) => i.critico) ? ' (hay críticos)' : ''}</div>${res.faltantes.map((i) => `<div class="wb-err ${i.critico ? '' : 'leve'}"><img src="${esc(i.img)}" alt=""><div><b>${esc(i.nombre)}${i.critico ? ' · crítico' : ''}</b><br>${esc(i.falta)}</div></div>`).join('')}` : ''}
      <div class="acr-row"><button class="acr-btn" id="wb-continuar">Entendido, completar y continuar →</button><button class="acr-btn sec" id="wb-cerrar">Volver a la mesa</button></div>
    </div>`;
  }
  corregirYContinuar() {
    const r = this.evaluar(this.sel);
    this.el.querySelector('#wb-modal').hidden = true;
    r.incorrectos.forEach((i) => this.quitar(i.id));
    r.faltantes.forEach((i, k) => { setTimeout(() => { if (this.el) this.agregar(i.id); }, 140 * (k + 1)); });
    setTimeout(() => { if (this.el) this.salir({ ...this.evaluar(this.sel), corregido: true, avisos: r }); }, 140 * (r.faltantes.length + 1) + 900);
  }
  narrar(txt) { const n = this.el?.querySelector('#wb-demo-txt'); if (n) { n.textContent = txt; n.classList.remove('nuevo'); void n.offsetWidth; n.classList.add('nuevo'); } }
  /** demostración automática: muestra el caso, inspecciona cada insumo y arma la bandeja correcta */
  async demo() {
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms)); const vivo = () => this.el && !this.cancelado;
    this.narrar('Primero se lee el caso clínico: de él depende qué sonda y qué insumos elegir.'); await esperar(4200); if (!vivo()) return;
    this.pintarEscena(); await esperar(900); if (!vivo()) return;
    this.narrar('Ahora se arma la bandeja con todo lo necesario para este paciente, inspeccionando cada insumo.');
    await esperar(1700);
    const req = this.visibles().filter((i) => this.ef(i).correcto);
    let n = 0;
    for (const it of req) {
      if (!vivo()) return; const largo = n++ < 4;
      const o = this.objMesa(it.id); if (!o) continue;
      this.mostrarFicha(it.id, o, false); this.narrar(`${it.nombre}: ${it.descripcion}`); await esperar(largo ? 2400 : 1300); if (!vivo()) return;
      this.agregar(it.id); await esperar(largo ? 900 : 650);
    }
    this.ocultarFicha();
    this.narrar('Bandeja completa: todo lo necesario y nada de más. Pasamos con el paciente.'); await esperar(2400); if (!vivo()) return;
    this.salir(this.evaluar(this.sel));
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
