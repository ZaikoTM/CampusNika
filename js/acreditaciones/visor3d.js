// CAMPUS NIKA — MedicalProcedureViewer: visor 3D reutilizable para acreditaciones/procedimientos.
// Este módulo SOLO se descarga cuando el usuario entra al simulador (import() dinámico desde motor.js);
// three.js, los loaders y los .glb/.stl nunca forman parte de la carga inicial de la página.
//
// El visor es genérico: todo lo específico de un procedimiento vive en un JSON de configuración:
//   general      fondo, luces de tres puntos, cámara, material
//   tarjetas     elementos de la mesa y del entorno (DOM, clicables)
//   chips        indicadores de progreso
//   pines        etiquetas interactivas (con filtro por sexo/variante)
//   instrumentos instrumental animable (sonda Foley hoy; aguja, catéter, etc. mañana)
//   <variante>   (p. ej. "M" / "F"): piezas a cargar, calibración (pos/rot/escala), uretra/curvas, anclas de etiquetas, silueta, cámaras
// Mallas de la zona objetivo únicamente: no se carga torso ni extremidades.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const geoCache = { stl: new Map(), glb: new Map() }; // evita volver a descargar al cambiar de modo o de variante

export class MedicalProcedureViewer {
  constructor(CFG) {
    this.CFG = CFG;
    this.C = null;
    this.ray = new THREE.Raycaster();
    this.ptr = new THREE.Vector2();
    this.CHIPS = CFG.chips || [];
    this.usable = CFG.usables || [];
  }

  // ---------------------------------------------------------------- HTML
  build(variante) {
    const T = this.CFG.tarjetas || {};
    const carta = ([id, emo, a, b]) => `<button class="hs carta" data-hs="${id}" type="button"><span class="ok">✔</span><span class="emo">${emo}</span><span class="t">${a}<br>${b}</span></button>`;
    const pines = (this.CFG.pines || []).filter((p) => !p.sexo || p.sexo === variante)
      .map((p) => `<button class="hs pin" data-hs="${p.id}" data-capa="${p.capa}" ${p.solo_con ? `data-solo="${p.solo_con}"` : ''} ${p.externo ? 'data-ext="1"' : ''} type="button"><i></i><span>${p.label}</span></button>`).join('');
    const mesa = T.mesa ? `<div class="acr3d-zona"><div class="acr3d-tit">${T.mesa.titulo}</div><div class="hs mesa" data-hs="${T.mesa.id}"><div class="acr3d-grid">${T.mesa.items.map(carta).join('')}</div></div></div>` : '';
    const entorno = T.entorno ? `<div class="acr3d-zona"><div class="acr3d-tit">${T.entorno.titulo}</div><div class="acr3d-grid">${T.entorno.items.map(carta).join('')}</div></div>` : '';
    return `<div class="acr3d sx-${variante}">
      <div class="acr3d-vp">
        <canvas></canvas>
        <svg class="acr3d-lines" aria-hidden="true"></svg>
        <div class="acr3d-pins">${pines}</div>
        <div class="acr3d-load"><div class="acr3d-load-t">Cargando modelo anatómico… <b>0%</b></div><div class="acr3d-load-bar"><i style="width:0%"></i></div><div class="acr3d-load-s"></div></div>
        <div class="acr3d-tools">
          <button data-tool="xray" type="button" title="Ver estructuras profundas">Rayos X</button>
          <button data-tool="cut" type="button" title="Corte sagital">Corte</button>
          <button data-tool="labels" type="button" class="on">Focos</button>
          <span class="sep"></span>
          <button data-tool="piel" type="button" class="on">Piel</button>
          <button data-tool="huesos" type="button" class="on">Huesos</button>
          <button data-tool="organos" type="button" class="on">Órganos</button>
          <span class="sep"></span>
          <button data-tool="v-lat" type="button">Lateral</button>
          <button data-tool="v-fro" type="button">Frontal</button>
          <button data-tool="v-sup" type="button">Superior</button>
          <span class="sep"></span>
          <button data-tool="full" type="button">⛶ Pantalla completa</button>
          <button data-tool="ayuda" type="button" class="ayuda">❓ Cómo usar</button>
        </div>
        <div class="acr3d-nav" aria-label="Controles de cámara">
          <button type="button" data-nav="in" title="Acercar" aria-label="Acercar">＋</button>
          <button type="button" data-nav="out" title="Alejar" aria-label="Alejar">－</button>
          <span class="sep"></span>
          <button type="button" data-nav="l" title="Girar a la izquierda" aria-label="Girar a la izquierda">⟲</button>
          <button type="button" data-nav="r" title="Girar a la derecha" aria-label="Girar a la derecha">⟳</button>
          <button type="button" data-nav="u" title="Subir cámara" aria-label="Subir cámara">▲</button>
          <button type="button" data-nav="d" title="Bajar cámara" aria-label="Bajar cámara">▼</button>
          <span class="sep"></span>
          <button type="button" data-nav="reset" title="Restablecer vista" aria-label="Restablecer vista">⌖</button>
        </div>
        <div class="acr3d-hint">Arrastrá o usá los botones · rueda para acercar</div>
      </div>
      ${mesa}${entorno}
      <div class="acr3d-cred">Modelos 3D: <a href="https://humanatlas.io/3d-reference-library" target="_blank" rel="noopener">Human Reference Atlas</a> (CC BY 4.0) · BodyParts3D, © Life Science Integrated Database Center (CC BY-SA 2.1 Japón) · <a href="https://www.z-anatomy.com" target="_blank" rel="noopener">Z-Anatomy</a> (CC BY-SA 4.0).</div>
    </div>`;
  }

  pesoTotal(variante) { return (this.CFG[variante].piezas || []).reduce((a, p) => a + (p.peso || 0), 0); }

  // ---------------------------------------------------------------- materiales
  material(color, opacity, capa, extra) {
    const g = this.CFG.general.material || {};
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color), transparent: true, opacity, roughness: g.rugosidad ?? 0.3, metalness: 0,
      clearcoat: g.clearcoat ?? 0.5, clearcoatRoughness: 0.25, side: THREE.DoubleSide, depthWrite: false, ...(extra || {}),
    });
    m.userData = { capa, base: opacity };
    this.C.mats.push(m);
    return m;
  }
  registrar(obj, capa, hs) {
    const ORDEN = { piel: 0, huesos: 1, organos: 2, sonda: 5 };
    obj.userData.capa = capa; obj.renderOrder = ORDEN[capa] || 0;
    if (hs) { obj.userData.hs = hs; (this.C.hsMeshes[hs] = this.C.hsMeshes[hs] || []).push(obj); }
    if (obj.material && capa === 'organos') obj.material.depthWrite = true;
  }

  // ---------------------------------------------------------------- carga con progreso (LoadingManager)
  cargarPiezas(piezas, onProg) {
    const bytes = new Map(); const total = piezas.reduce((a, p) => a + (p.peso || 5e5), 0) || 1;
    const rep = (txt) => onProg && onProg(Math.min(1, [...bytes.values()].reduce((a, b) => a + b, 0) / total), txt);
    const manager = new THREE.LoadingManager();
    const draco = new DRACOLoader(manager).setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
    const gltf = new GLTFLoader(manager).setDRACOLoader(draco);
    const stl = new STLLoader(manager);
    const lanzar = (p) => {
      const key = p.src; const cache = geoCache[p.tipo];
      if (cache.has(key)) { bytes.set(key, p.peso || 5e5); rep(p.nombre); return cache.get(key); }
      const pr = new Promise((ok, no) => {
        const prog = (ev) => { bytes.set(key, Math.min(ev.loaded, p.peso || ev.loaded)); rep(p.nombre); };
        if (p.tipo === 'stl') stl.load(p.src, (g) => { g.deleteAttribute('normal'); const m = mergeVertices(g, 0.01); m.computeVertexNormals(); bytes.set(key, p.peso || 5e5); rep(p.nombre); ok(m); }, prog, no);
        else gltf.load(p.src, (g) => { bytes.set(key, p.peso || 5e5); rep(p.nombre); ok(g.scene); }, prog, no);
      });
      cache.set(key, pr);
      return pr;
    };
    return Promise.all(piezas.map((p) => lanzar(p).then((r) => ({ p, r })))).then((res) => { draco.dispose(); return res; });
  }

  // ---------------------------------------------------------------- modelo
  tuboProc(def, grupoModelo) {
    const curve = new THREE.CatmullRomCurve3(def.pts.map((q) => V(...q)));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, def.radio, 18, false), this.material(def.color, def.opacidad, def.capa));
    this.registrar(m, def.capa, def.hs);
    this.C.capas[def.capa].add(m);
    return m;
  }

  async construir(variante, onProg) {
    const C = this.C; const cfg = this.CFG[variante]; const o = V(...cfg.origen);
    const gm = new THREE.Group(); gm.position.copy(o).negate(); C.scene.add(gm); C.gm = gm;
    ['piel', 'huesos', 'organos', 'sonda'].forEach((k) => { C.capas[k] = new THREE.Group(); gm.add(C.capas[k]); });
    // silueta pélvica inmediata (no torso completo)
    if (cfg.piel) {
      const perfil = cfg.piel.radios.map(([r, y]) => new THREE.Vector2(r, y));
      const piel = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), this.material(0x5b9bff, 0.1, 'piel', { roughness: 0.15, clearcoat: 0.9 }));
      this.registrar(piel, 'piel', null); piel.scale.set(1, 1, cfg.piel.escala_z); piel.position.set(...cfg.piel.pos.map((v, i) => v + cfg.origen[i]));
      C.capas.piel.add(piel);
    }
    Object.values(cfg.procedurales || {}).forEach((d) => this.tuboProc(d));
    C.anclas = {}; Object.entries(cfg.pines).forEach(([k, v]) => { C.anclas[k] = V(...v).sub(o); });
    this.instrumentos(variante);
    C.corte = cfg.corte_x - o.x; C.plane.constant = C.corte;
    const res = await this.cargarPiezas(cfg.piezas, onProg);
    if (this.C !== C) return;
    res.forEach(({ p, r }) => {
      let obj;
      if (p.tipo === 'stl') { obj = new THREE.Mesh(r.clone(), this.material(p.color, p.opacidad, p.capa)); this.registrar(obj, p.capa, p.hs); }
      else {
        obj = r.clone(true);
        obj.traverse((m) => {
          if (!m.isMesh) return;
          m.geometry = m.geometry.clone(); m.geometry.computeVertexNormals();
          m.material = this.material(p.color, p.opacidad, p.capa, p.piel_real ? { roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.6 } : undefined);
          if (p.piel_real) { m.material.userData.skin = true; C.skinMats.push(m.material); }
          this.registrar(m, p.capa, p.hs);
        });
      }
      obj.scale.setScalar(p.escala); obj.rotation.set(...p.rot); obj.position.set(...p.pos); obj.name = p.id;
      C.capas[p.capa].add(obj);
    });
    this.aplicarLook();
  }

  // instrumental animable
  instrumentos(variante) {
    const C = this.C; const cfg = this.CFG[variante]; const gen = this.CFG.general;
    C.inst = [];
    (this.CFG.instrumentos || []).forEach((ins) => {
      if (ins.tipo === 'sonda_foley') {
        const ure = cfg.uretra.map((p) => V(...p));
        const meato = ure[0].clone();
        const cola = cfg.meatus_tail.map((d) => meato.clone().add(V(...d))).reverse();
        const bolsaPos = cola[0].clone().add(V(0, -3.8, 0));
        const curva = new THREE.CatmullRomCurve3([...cola, ...ure, V(...cfg.balon), V(...cfg.punta)], false, 'centripetal');
        const geo = new THREE.TubeGeometry(curva, 320, gen.grosor_sonda || 0.2, 14, false);
        const cat = new THREE.Mesh(geo, this.material(ins.color, 1, 'sonda', { emissive: 0x0891b2, emissiveIntensity: 0.65, depthWrite: true }));
        this.registrar(cat, 'sonda', null); C.capas.sonda.add(cat); cat.visible = false;
        const bal = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 22), this.material(ins.color_balon, 0.9, 'sonda', { emissive: 0x0284c7, emissiveIntensity: 0.45 }));
        this.registrar(bal, 'sonda', ins.hs_balon); bal.position.copy(V(...cfg.balon)); bal.scale.setScalar(0.001); C.capas.sonda.add(bal);
        const g = new THREE.Group();
        const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1.4), this.material(ins.color_bolsa, 0.5, 'sonda', { depthWrite: true }));
        const orina = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 1.2), this.material(ins.color_orina, 0.85, 'sonda', { depthWrite: true })); orina.position.y = -1.8;
        cuerpo.renderOrder = 5; orina.renderOrder = 5; g.add(cuerpo, orina); g.position.copy(bolsaPos).add(V(0, -3.5, 0)); g.scale.setScalar(0.001); C.capas.sonda.add(g);
        const con = this.tuboProc({ pts: [cola[0].toArray(), bolsaPos.clone().add(V(0, -1.5, 0)).toArray()], radio: 0.2, color: ins.color, opacidad: 1, capa: 'sonda', hs: null }); con.visible = false;
        C.inst.push({ tipo: ins.tipo, clases: ins.clases, cat: { mesh: cat, total: geo.index.count, per: 14 * 6, cur: 0, goal: 0 }, bal: { mesh: bal, cur: 0.001, goal: 0.001 }, bolsa: { g, cur: 0.001, goal: 0.001 }, con });
      }
      // otros tipos (aguja, catéter…) se agregan aquí con su propia animación
    });
  }

  // ---------------------------------------------------------------- vista
  pick(e) {
    const C = this.C; if (!C) return null;
    const r = C.canvas.getBoundingClientRect();
    this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ptr, C.camera);
    const cand = Object.values(C.hsMeshes).flat().filter((m) => m.visible && C.capas[m.userData.capa] && C.capas[m.userData.capa].visible && (!C.skinOpaque || C.extIds.has(m.userData.hs)));
    const hits = this.ray.intersectObjects(cand, false).filter((h) => !C.opt.cut || C.plane.distanceToPoint(h.point) >= -0.01);
    return hits.length ? hits[0].object.userData.hs : null;
  }
  aplicarLook() {
    const C = this.C; const o = C.opt;
    C.mats.forEach((m) => {
      if (m.userData.skin) { m.clippingPlanes = o.cut ? [C.plane] : null; m.needsUpdate = true; return; }
      const capa = m.userData.capa; let op = m.userData.base;
      if (capa === 'piel') op = o.xray ? 0.03 : m.userData.base;
      else if (capa === 'huesos') op = o.xray ? 0.9 : m.userData.base;
      else if (capa === 'organos') op = o.xray ? Math.min(m.userData.base, 0.6) : m.userData.base;
      m.opacity = op; m.clippingPlanes = o.cut ? [C.plane] : null; m.needsUpdate = true;
    });
    Object.entries(C.capas).forEach(([k, g]) => { g.visible = o.capas[k]; });
  }

  /** Monta la escena y descarga las mallas. Devuelve una promesa que se resuelve al terminar la carga. */
  mount(root, variante) {
    this.dispose();
    const vp = root.querySelector('.acr3d-vp');
    const canvas = vp.querySelector('canvas');
    const barra = vp.querySelector('.acr3d-load');
    const G = this.CFG.general;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); }
    catch (e) {
      barra.innerHTML = '<div class="acr3d-load-t">Tu dispositivo no permite mostrar el modelo 3D. Podés seguir el recorrido con los elementos de abajo.</div>';
      root.classList.add('sin3d'); return Promise.resolve();
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(G.fondo);
    const camera = new THREE.PerspectiveCamera(G.camara.fov, 1, 0.5, 600);
    const controls = new OrbitControls(camera, canvas);
    Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, minDistance: G.camara.min, maxDistance: G.camara.max, screenSpacePanning: true });
    // iluminación de tres puntos: ambiente suave, luz frontal y luz de contorno (rim)
    scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1b2a4a, G.luces.ambiente));
    const key = new THREE.DirectionalLight(0xffffff, G.luces.frontal); key.position.set(40, 30, 55); scene.add(key);
    const rim = new THREE.DirectionalLight(new THREE.Color(G.luces.color_contorno), G.luces.contorno); rim.position.set(-45, 15, -40); scene.add(rim);

    const C = this.C = {
      root, vp, canvas, renderer, scene, camera, controls, mats: [], capas: {}, hsMeshes: {}, plane: new THREE.Plane(V(-1, 0, 0), 0),
      opt: { xray: false, cut: false, labels: true, capas: { piel: true, huesos: true, organos: true, sonda: true } },
      hl: null, sel: null, hover: null, goal: null, variante, raf: 0, anclas: {}, inst: [], skinMats: [], skinOpaque: false,
      extIds: new Set((this.CFG.pines || []).filter((q) => q.externo).map((q) => q.id)),
    };
    C.pins = [...vp.querySelectorAll('.pin')];
    C.svgLineas = vp.querySelector('.acr3d-lines'); C.lineas = {};
    const et = this.CFG[variante].etiquetas || {};
    C.pins.forEach((p) => {
      const [dx, dy] = et[p.dataset.hs] || [70, -30];
      p.style.setProperty('--dx', dx + 'px'); p.style.setProperty('--dy', dy + 'px'); p.dataset.dx = dx; p.dataset.dy = dy;
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); C.svgLineas.appendChild(ln); C.lineas[p.dataset.hs] = ln;
    });
    const cam = this.CFG[variante].camara; C.vistas = { lat: cam.lat, fro: cam.fro, sup: cam.sup };
    controls.target.set(...cam.objetivo); camera.position.set(...(cam.ini || cam.lat));

    const resize = () => { const w = vp.clientWidth, h = vp.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    C.ro = new ResizeObserver(resize); C.ro.observe(vp); resize();

    vp.querySelector('.acr3d-tools').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tool]'); if (!b || this.C !== C) return;
      const t = b.dataset.tool;
      if (t === 'full') { root.dispatchEvent(new CustomEvent('acr-full')); return; }
      if (t === 'ayuda') { root.dispatchEvent(new CustomEvent('acr-ayuda')); return; }
      if (t.startsWith('v-')) { C.goal = V(...C.vistas[t.slice(2, 5)]); return; }
      if (t === 'xray' || t === 'cut' || t === 'labels') C.opt[t] = !C.opt[t]; else C.opt.capas[t] = !C.opt.capas[t];
      b.classList.toggle('on', t === 'xray' || t === 'cut' || t === 'labels' ? C.opt[t] : C.opt.capas[t]);
      this.aplicarLook();
    });
    controls.addEventListener('start', () => { C.goal = null; C.lento = false; });
    const mover = (acc) => {
      C.goal = null; C.lento = false;
      const off = camera.position.clone().sub(controls.target);
      if (acc === 'in' || acc === 'out') off.multiplyScalar(acc === 'in' ? 0.92 : 1.09);
      else {
        const s = new THREE.Spherical().setFromVector3(off); const d = 0.07;
        if (acc === 'l') s.theta -= d; else if (acc === 'r') s.theta += d; else if (acc === 'u') s.phi -= d; else s.phi += d;
        s.phi = Math.min(Math.PI - 0.06, Math.max(0.06, s.phi)); off.setFromSpherical(s);
      }
      camera.position.copy(controls.target).add(off);
    };
    let rep = 0;
    const parar = () => { clearInterval(rep); rep = 0; };
    const nav = vp.querySelector('.acr3d-nav');
    nav.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-nav]'); if (!b || this.C !== C) return;
      const a = b.dataset.nav;
      if (a === 'reset') { C.goal = V(...(cam.ini || cam.lat)); C.lento = false; return; }
      mover(a); parar(); rep = setInterval(() => mover(a), 55);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => nav.addEventListener(ev, parar));
    let down = null;
    canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    canvas.addEventListener('pointerup', (e) => {
      if (!down || this.C !== C || root.classList.contains('estatica')) return;
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const id = this.pick(e); if (!id) return;
      const pin = vp.querySelector(`.pin[data-hs="${id}"]`); if (pin) pin.click();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.C !== C || root.classList.contains('estatica')) return;
      const id = this.pick(e); C.hover = id; canvas.style.cursor = id ? 'pointer' : 'grab';
    });

    const tmp = V(0, 0, 0);
    const loop = (t) => {
      if (this.C !== C) return;
      C.raf = requestAnimationFrame(loop);
      if (C.goal) { camera.position.lerp(C.goal, C.lento ? 0.04 : 0.08); if (camera.position.distanceTo(C.goal) < 0.3) { C.goal = null; C.lento = false; } }
      controls.update();
      C.inst.forEach((s) => {
        const k = s.cat; k.cur += (k.goal - k.cur) * 0.03; if (Math.abs(k.goal - k.cur) < 0.002) k.cur = k.goal;
        k.mesh.visible = k.cur > 0.003; k.mesh.geometry.setDrawRange(0, Math.floor((k.total * k.cur) / k.per) * k.per);
        const b = s.bal; b.cur += (b.goal - b.cur) * 0.07; b.mesh.scale.setScalar(Math.max(b.cur, 0.001)); b.mesh.visible = k.cur > 0.97;
        const g = s.bolsa; g.cur += (g.goal - g.cur) * 0.1; g.g.scale.setScalar(Math.max(g.cur, 0.001)); g.g.visible = g.cur > 0.01;
        s.con.visible = g.cur > 0.05 && k.cur > 0.05;
      });
      const pulso = 0.5 + 0.4 * Math.sin(t / 170);
      Object.entries(C.hsMeshes).forEach(([id, ms]) => ms.forEach((m) => {
        const mt = m.material; if (!mt.emissive) return;
        if (id === C.hl) { mt.emissive.setHex(0xffb020); mt.emissiveIntensity = pulso; }
        else if (id === C.sel) { mt.emissive.setHex(0x14b8a6); mt.emissiveIntensity = 0.55; }
        else if (id === C.hover) { mt.emissive.setHex(0x22d3ee); mt.emissiveIntensity = 0.4; }
        else if (id === 'balon') { mt.emissive.setHex(0x0284c7); mt.emissiveIntensity = 0.45; }
        else { mt.emissiveIntensity = 0; }
      }));
      if (C.skinMats.length) {
        const objetivo = C.opt.xray ? 0.03 : (C.inst.some((s) => s.cat.goal > 0) ? 0.14 : C.skinMats[0].userData.base);
        C.skinMats.forEach((m) => { m.opacity += (objetivo - m.opacity) * 0.08; m.depthWrite = m.opacity > 0.6; });
        C.skinOpaque = C.capas.piel.visible && C.skinMats[0].opacity > 0.45;
      }
      renderer.render(scene, camera);
      const w = vp.clientWidth, h = vp.clientHeight;
      C.pins.forEach((p) => {
        const a = C.anclas[p.dataset.hs]; if (!a) return;
        tmp.copy(a).project(camera);
        const conInst = p.dataset.solo === 'instrumento' ? C.inst.some((s) => s.cat.cur > 0.97) : true;
        const vis = C.opt.labels && C.opt.capas[p.dataset.capa] !== false && tmp.z < 1 && conInst && !(C.skinOpaque && !p.dataset.ext);
        p.classList.toggle('oculto', !vis);
        const ln = C.lineas[p.dataset.hs]; if (ln) ln.style.display = vis ? '' : 'none';
        if (vis) {
          const px = ((tmp.x + 1) / 2) * w, py = ((1 - tmp.y) / 2) * h;
          p.style.transform = `translate(${px}px, ${py}px)`;
          if (ln) {
            const dx = +p.dataset.dx, dy = +p.dataset.dy; const wl = p.lastElementChild.offsetWidth || 70;
            ln.setAttribute('x1', px); ln.setAttribute('y1', py); ln.setAttribute('x2', px + 13 + dx + (dx < 0 ? wl : 0)); ln.setAttribute('y2', py + dy);
          }
        }
      });
    };
    C.raf = requestAnimationFrame(loop);

    const pct = barra.querySelector('b'), fill = barra.querySelector('.acr3d-load-bar i'), sub = barra.querySelector('.acr3d-load-s');
    const mb = (this.pesoTotal(variante) / 1e6).toFixed(1);
    return this.construir(variante, (f, nombre) => {
      if (this.C !== C) return;
      const p = Math.round(f * 100); pct.textContent = p + '%'; fill.style.width = p + '%'; sub.textContent = `${mb} MB · ${nombre || ''}`;
    }).then(() => {
      if (this.C !== C) return;
      barra.hidden = true;
      if (!(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) {   // entrada cinematográfica: la cámara se acerca al paciente
        const fin = camera.position.clone(); const tg = controls.target;
        camera.position.copy(tg).add(fin.clone().sub(tg).multiplyScalar(1.75)); C.goal = fin; C.lento = true;
      }
    })
      .catch((e) => { console.error('[Visor3D]', e); if (this.C === C) barra.innerHTML = '<div class="acr3d-load-t">No se pudo cargar el modelo 3D.</div>'; });
  }

  /** El motor llama a sync() cada vez que cambia el estado del procedimiento (clases s-* sobre la raíz). */
  sync(root) {
    if (!this.C) return;
    const has = (k) => root.classList.contains(k);
    this.C.inst.forEach((s) => { s.cat.goal = has(s.clases.avance) ? 1 : 0; s.bal.goal = has(s.clases.inflar) ? 1.3 : 0.001; s.bolsa.goal = has(s.clases.bolsa) ? 1 : 0.001; });
  }
  hl(id) { if (this.C) this.C.hl = id || null; }
  sel(id) { if (this.C) this.C.sel = id || null; }

  dispose() {
    const c = this.C; if (!c) return; this.C = null;
    cancelAnimationFrame(c.raf);
    if (c.ro) c.ro.disconnect();
    if (c.controls) c.controls.dispose();
    c.mats.forEach((m) => m.dispose());
    if (c.renderer) c.renderer.dispose();
  }
}

export function crearVisor(cfg) { return new MedicalProcedureViewer(cfg); }
export default crearVisor;
