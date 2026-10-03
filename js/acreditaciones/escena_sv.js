// CAMPUS NIKA — Atlas de acreditaciones: escena 3D de colocación de sonda vesical.
// Anatomía real: huesos, vejiga y útero del Human Reference Atlas (CC BY 4.0) y, en el varón,
// pelvis, vejiga, próstata, uretra, recto y pene de BodyParts3D (CC BY-SA 2.1 Japón).
// La posición de cada pieza vive en data/acreditaciones/siam/sv_modelo.json (calibración sin tocar el código).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
let C = null; // contexto de la escena activa
let CFG = null; // configuración (sv_modelo.json)
const cache = { stl: new Map(), glb: new Map() };

// ---------------------------------------------------------------- HTML (DOM) de la escena
const MESA = [
  ['iodo', '🧼', 'Iodopovidona', 'jabonoso'], ['guantes-ns', '🧤', 'Guantes', 'no estériles'], ['panos-ns', '🧻', 'Paños clínicos', 'no estériles'],
  ['guantes-e', '🧤', 'Guantes', 'estériles'], ['pano-e', '🟦', 'Paño', 'estéril'], ['campo-aux', '🟦', 'Paño estéril', 'adicional'],
  ['pack', '📦', 'Pack estéril', 'con sonda'], ['sonda', '🪢', 'Sonda Foley', '(balón)'], ['gel', '🧴', 'Lidocaína', 'gel'],
  ['jeringa', '💉', 'Jeringa con', 'agua bidestilada'], ['bolsa', '🛍️', 'Bolsa', 'colectora'], ['cinta', '🩹', 'Cinta', 'hipoalergénica'],
];
const ENTORNO = [
  ['lavabo', '🚰', 'Lavabo', ''], ['hc', '📋', 'Historia clínica', 'y solicitud'], ['consent', '📝', 'Consentimiento', 'informado'],
  ['residuos', '🗑️', 'Residuos', ''], ['lado', '🛏️', 'Lado del', 'paciente'], ['gancho', '🪝', 'Ganchillo', 'de la cama'],
];
const carta = ([id, emo, a, b]) => `<button class="hs carta" data-hs="${id}" type="button"><span class="ok">✔</span><span class="emo">${emo}</span><span class="t">${a}<br>${b}</span></button>`;

function pinsDe(sexo) {
  const comunes = [
    ['vejiga', 'Vejiga', 'organos'], ['balon', 'Balón', 'sonda'], ['uretra', 'Uretra', 'organos'],
    ['recto', 'Recto', 'organos'], ['sinfisis', 'Sínfisis pubiana', 'huesos'], ['paciente', 'Paciente', 'piel'],
  ];
  const f = [['utero', 'Útero', 'organos'], ['vagina', 'Vagina', 'organos']];
  const m = [['prostata', 'Próstata', 'organos'], ['prepucio', 'Glande y prepucio', 'piel']];
  return [...comunes, ...(sexo === 'F' ? f : m)];
}

export function build(sexo) {
  return `<div class="acr3d sx-${sexo}">
    <div class="acr3d-vp">
      <canvas></canvas>
      <div class="acr3d-pins">${pinsDe(sexo).map(([id, l, cap]) => `<button class="hs pin" data-hs="${id}" data-capa="${cap}" type="button"><i></i><span>${l}</span></button>`).join('')}</div>
      <div class="acr3d-msg">Cargando modelo anatómico…</div>
      <div class="acr3d-tools">
        <button data-tool="xray" type="button" title="Ver estructuras profundas">Rayos X</button>
        <button data-tool="cut" type="button" class="on" title="Corte sagital">Corte</button>
        <button data-tool="labels" type="button" class="on">Focos</button>
        <span class="sep"></span>
        <button data-tool="piel" type="button" class="on">Piel</button>
        <button data-tool="huesos" type="button" class="on">Huesos</button>
        <button data-tool="organos" type="button" class="on">Órganos</button>
        <span class="sep"></span>
        <button data-tool="v-lat" type="button">Lateral</button>
        <button data-tool="v-fro" type="button">Frontal</button>
        <button data-tool="v-sup" type="button">Superior</button>
      </div>
      <div class="acr3d-hint">Arrastrá para girar · rueda para acercar</div>
    </div>
    <div class="acr3d-zona"><div class="acr3d-tit">🛒 Mesa alta de traslado</div><div class="hs mesa" data-hs="mesa"><div class="acr3d-grid">${MESA.map(carta).join('')}</div></div></div>
    <div class="acr3d-zona"><div class="acr3d-tit">🏥 Entorno del paciente</div><div class="acr3d-grid">${ENTORNO.map(carta).join('')}</div></div>
    <div class="acr3d-cred">Modelos 3D: <a href="https://humanatlas.io/3d-reference-library" target="_blank" rel="noopener">Human Reference Atlas</a> (CC BY 4.0) · BodyParts3D, © Life Science Integrated Database Center, licencia CC BY-SA 2.1 Japón.</div>
  </div>`;
}

export const CHIPS = [
  ['id', 'Paciente verificado'], ['consent', 'Consentimiento'], ['pos', 'Posición'], ['manos', 'Manos lavadas'],
  ['campo', 'Campo estéril'], ['tested', 'Balón probado'], ['ins', 'Sonda colocada'], ['infl', 'Balón inflado'],
  ['bag', 'Bolsa conectada'], ['fix', 'Sonda fijada'], ['reg', 'Registrado'],
];
export const usable = ['iodo', 'guantes-ns', 'panos-ns', 'guantes-e', 'pano-e', 'campo-aux', 'pack', 'gel', 'jeringa', 'bolsa', 'cinta', 'lavabo', 'hc', 'consent', 'residuos'];

// ---------------------------------------------------------------- materiales (fantoma médico semitransparente)
function material(color, opacity, capa, extra) {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), transparent: true, opacity, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3,
    side: THREE.DoubleSide, depthWrite: false, ...(extra || {}),
  });
  m.userData = { capa, base: opacity };
  C.mats.push(m);
  return m;
}
const ORDEN = { piel: 0, huesos: 1, organos: 2, sonda: 5 };
function registrar(obj, capa, hs) {
  obj.userData.capa = capa;
  obj.renderOrder = ORDEN[capa] || 0;
  if (hs) { obj.userData.hs = hs; (C.hsMeshes[hs] = C.hsMeshes[hs] || []).push(obj); }
  if (obj.material && capa === 'organos') obj.material.depthWrite = true;
}

// ---------------------------------------------------------------- carga de piezas
async function cargarSTL(src) {
  if (!cache.stl.has(src)) {
    cache.stl.set(src, new STLLoader().loadAsync(src).then((g) => {
      g.deleteAttribute('normal'); const m = mergeVertices(g, 0.01); m.computeVertexNormals(); return m;
    }));
  }
  return (await cache.stl.get(src)).clone();
}
async function cargarGLB(src) {
  if (!cache.glb.has(src)) cache.glb.set(src, new GLTFLoader().loadAsync(src));
  return (await cache.glb.get(src)).scene.clone(true);
}

async function pieza(p, grupoModelo) {
  const tk = C;
  let obj;
  if (p.tipo === 'stl') {
    const geo = await cargarSTL(p.src); if (C !== tk) return;
    obj = new THREE.Mesh(geo, material(p.color, p.opacidad, p.capa));
    registrar(obj, p.capa, p.hs);
  } else {
    obj = await cargarGLB(p.src); if (C !== tk) return;
    obj.traverse((m) => { if (m.isMesh) { m.material = material(p.color, p.opacidad, p.capa); registrar(m, p.capa, p.hs); } });
  }
  obj.scale.setScalar(p.escala); obj.rotation.set(...p.rot); obj.position.set(...p.pos);
  obj.name = p.id;
  C.capas[p.capa].add(obj);
}

function tuboProc(def) {
  const curve = new THREE.CatmullRomCurve3(def.pts.map((q) => V(...q)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, def.radio, 18, false), material(def.color, def.opacidad, def.capa));
  registrar(m, def.capa, def.hs);
  C.capas[def.capa].add(m);
  return m;
}

function siluetaPiel(cfg) {
  const perfil = cfg.piel.radios.map(([r, y]) => new THREE.Vector2(r, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), material(0x5b9bff, 0.1, 'piel', { roughness: 0.2, clearcoat: 0.8 }));
  registrar(m, 'piel', null);
  m.scale.set(1, 1, cfg.piel.escala_z); m.position.set(...cfg.piel.pos);
  C.capas.piel.add(m);
}

async function modelo(sexo) {
  const cfg = CFG[sexo];
  const o = V(...cfg.origen);
  // todo el modelo se desplaza para centrar la pelvis en el origen
  const gm = new THREE.Group(); gm.position.copy(o).negate(); C.scene.add(gm); C.gm = gm;
  const sh = (a) => V(...a).sub(o);
  ['piel', 'huesos', 'organos', 'sonda'].forEach((k) => { C.capas[k] = new THREE.Group(); gm.add(C.capas[k]); });
  // capas dentro del grupo desplazado: las piezas se agregan a sus capas, que ya están dentro de gm
  siluetaPiel({ ...cfg, piel: { ...cfg.piel, pos: cfg.piel.pos.map((v, i) => v + cfg.origen[i]) } });
  Object.entries(cfg.procedurales || {}).forEach(([, d]) => tuboProc(d));
  C.pines = {}; Object.entries(cfg.pines).forEach(([k, v]) => { C.pines[k] = V(...v).sub(o); });

  // Sonda: de la bolsa al balón, siguiendo la curva de la uretra (meato → cuello vesical)
  const ure = cfg.uretra.map((p) => V(...p));
  const meato = ure[0].clone();
  const cola = cfg.meatus_tail.map((d) => meato.clone().add(V(...d))).reverse();
  const bolsaPos = cola[0].clone().add(V(0, -3.8, 0));
  const ruta = [...cola, ...ure, V(...cfg.balon), V(...cfg.punta)];
  const curva = new THREE.CatmullRomCurve3(ruta, false, 'centripetal');
  const geo = new THREE.TubeGeometry(curva, 320, 0.2, 14, false);
  const cat = new THREE.Mesh(geo, material(0x22e0ff, 1, 'sonda', { emissive: 0x0891b2, emissiveIntensity: 0.65, depthWrite: true }));
  registrar(cat, 'sonda', null); C.capas.sonda.add(cat);
  C.cat = { mesh: cat, total: geo.index.count, per: 14 * 6, cur: 0, goal: 0 };
  cat.visible = false;
  // tramo de la curva hasta cada punto, para que el balón aparezca recién cuando la punta llega a la vejiga
  const bal = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 22), material(0x38d4ff, 0.9, 'sonda', { emissive: 0x0284c7, emissiveIntensity: 0.45 }));
  registrar(bal, 'sonda', 'balon'); bal.position.copy(V(...cfg.balon)); bal.scale.setScalar(0.001);
  C.capas.sonda.add(bal); C.bal = { mesh: bal, cur: 0.001, goal: 0.001 };
  // bolsa colectora
  const g = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1.4), material(0xbae6fd, 0.5, 'sonda', { depthWrite: true }));
  const orina = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 1.2), material(0xffe34d, 0.85, 'sonda', { depthWrite: true })); orina.position.y = -1.8;
  cuerpo.renderOrder = 5; orina.renderOrder = 5;
  g.add(cuerpo, orina); g.position.copy(bolsaPos).add(V(0, -3.5, 0)); g.scale.setScalar(0.001);
  C.capas.sonda.add(g); C.bolsa = { g, cur: 0.001, goal: 0.001 };
  // tubo de conexión cola → bolsa
  tuboProc({ pts: [cola[0].toArray(), bolsaPos.clone().add(V(0, -1.5, 0)).toArray()], radio: 0.2, color: '#22e0ff', opacidad: 1, capa: 'sonda', hs: null }).name = 'conexion';

  C.anclas = C.pines;
  C.corte = cfg.corte_x - o.x;
  C.plane.constant = C.corte;
  await Promise.all(cfg.piezas.map((p) => pieza(p, gm)));
  if (C) { C.vp.querySelector('.acr3d-msg').hidden = true; aplicarLook(); }
}

// ---------------------------------------------------------------- montaje / ciclo
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();

function pick(e) {
  if (!C) return null;
  const r = C.canvas.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, C.camera);
  const cand = Object.values(C.hsMeshes).flat().filter((m) => m.visible && C.capas[m.userData.capa] && C.capas[m.userData.capa].visible);
  const hits = ray.intersectObjects(cand, false).filter((h) => !C.opt.cut || C.plane.distanceToPoint(h.point) >= -0.01);
  return hits.length ? hits[0].object.userData.hs : null;
}

function aplicarLook() {
  const o = C.opt;
  C.mats.forEach((m) => {
    const capa = m.userData.capa; let op = m.userData.base;
    if (capa === 'piel') op = o.xray ? 0.03 : m.userData.base;
    else if (capa === 'huesos') op = o.xray ? 0.9 : m.userData.base;
    else if (capa === 'organos') op = o.xray ? Math.min(m.userData.base, 0.6) : m.userData.base;
    m.opacity = op;
    m.clippingPlanes = o.cut ? [C.plane] : null;
    m.needsUpdate = true;
  });
  Object.entries(C.capas).forEach(([k, g]) => { g.visible = o.capas[k]; });
}

export function mount(root, sexo) {
  dispose();
  const vp = root.querySelector('.acr3d-vp');
  const canvas = vp.querySelector('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (e) {
    const m = vp.querySelector('.acr3d-msg'); m.hidden = false; m.textContent = 'Tu dispositivo no permite mostrar el modelo 3D. Podés seguir el recorrido con los elementos de abajo.';
    root.classList.add('sin3d');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1530);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 600);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 14; controls.maxDistance = 120; controls.screenSpacePanning = true;
  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1b2a4a, 1.0));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.2); d1.position.set(40, 50, 40); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x22d3ee, 0.6); d2.position.set(-40, 10, -30); scene.add(d2);
  const grid = new THREE.GridHelper(160, 32, 0x1d3a66, 0x142a4d); grid.position.y = -28; scene.add(grid);

  C = {
    root, vp, canvas, renderer, scene, camera, controls, mats: [], capas: {}, hsMeshes: {}, plane: new THREE.Plane(V(-1, 0, 0), 0),
    opt: { xray: false, cut: true, labels: true, capas: { piel: true, huesos: true, organos: true, sonda: true } },
    hl: null, sel: null, hover: null, goal: null, sexo, raf: 0, anclas: {},
  };
  const tk = C;
  C.pins = [...vp.querySelectorAll('.pin')];

  const resize = () => {
    const w = vp.clientWidth, h = vp.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  C.ro = new ResizeObserver(resize); C.ro.observe(vp); resize();

  vp.querySelector('.acr3d-tools').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]'); if (!b || !C) return;
    const t = b.dataset.tool;
    if (t.startsWith('v-')) { C.goal = V(...C.vistas[t.slice(2, 5)]); return; }
    if (t === 'xray' || t === 'cut' || t === 'labels') C.opt[t] = !C.opt[t]; else C.opt.capas[t] = !C.opt.capas[t];
    b.classList.toggle('on', t === 'xray' || t === 'cut' || t === 'labels' ? C.opt[t] : C.opt.capas[t]);
    aplicarLook();
  });
  controls.addEventListener('start', () => { if (C) C.goal = null; });

  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || !C || C.root.classList.contains('estatica')) return;
    if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const id = pick(e); if (!id) return;
    const pin = C.vp.querySelector(`.pin[data-hs="${id}"]`); if (pin) pin.click();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!C || C.root.classList.contains('estatica')) return;
    const id = pick(e); C.hover = id; canvas.style.cursor = id ? 'pointer' : 'grab';
  });

  const tmp = V(0, 0, 0);
  const loop = (t) => {
    if (C !== tk) return;
    C.raf = requestAnimationFrame(loop);
    if (C.goal) { camera.position.lerp(C.goal, 0.08); if (camera.position.distanceTo(C.goal) < 0.3) C.goal = null; }
    controls.update();
    if (C.cat) {
      const k = C.cat; k.cur += (k.goal - k.cur) * 0.03; if (Math.abs(k.goal - k.cur) < 0.002) k.cur = k.goal;
      k.mesh.visible = k.cur > 0.003;
      k.mesh.geometry.setDrawRange(0, Math.floor((k.total * k.cur) / k.per) * k.per);
      const b = C.bal; b.cur += (b.goal - b.cur) * 0.07; b.mesh.scale.setScalar(Math.max(b.cur, 0.001)); b.mesh.visible = k.cur > 0.97;
      const g = C.bolsa; g.cur += (g.goal - g.cur) * 0.1; g.g.scale.setScalar(Math.max(g.cur, 0.001)); g.g.visible = g.cur > 0.01;
      const con = C.capas.sonda.getObjectByName('conexion'); if (con) con.visible = g.cur > 0.05 && k.cur > 0.05;
    }
    const pulso = 0.5 + 0.4 * Math.sin(t / 170);
    Object.entries(C.hsMeshes).forEach(([id, ms]) => ms.forEach((m) => {
      const mt = m.material; if (!mt.emissive) return;
      if (id === C.hl) { mt.emissive.setHex(0xffb020); mt.emissiveIntensity = pulso; }
      else if (id === C.sel) { mt.emissive.setHex(0x14b8a6); mt.emissiveIntensity = 0.55; }
      else if (id === C.hover) { mt.emissive.setHex(0x22d3ee); mt.emissiveIntensity = 0.4; }
      else if (id === 'balon') { mt.emissive.setHex(0x0284c7); mt.emissiveIntensity = 0.45; }
      else { mt.emissiveIntensity = 0; }
    }));
    renderer.render(scene, camera);
    const w = vp.clientWidth, h = vp.clientHeight;
    C.pins.forEach((p) => {
      const a = C.anclas[p.dataset.hs]; if (!a) return;
      tmp.copy(a).project(camera);
      const vis = C.opt.labels && C.opt.capas[p.dataset.capa] !== false && tmp.z < 1 && !(p.dataset.hs === 'balon' && !(C.cat && C.cat.cur > 0.97));
      p.classList.toggle('oculto', !vis);
      if (vis) p.style.transform = `translate(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px)`;
    });
  };
  C.raf = requestAnimationFrame(loop);

  (CFG ? Promise.resolve() : fetch('data/acreditaciones/siam/sv_modelo.json', { cache: 'no-cache' }).then((r) => r.json()).then((j) => { CFG = j; }))
    .then(() => {
      if (C !== tk) return;
      const cam = CFG[sexo].camara;
      C.vistas = { lat: cam.lat, fro: cam.fro, sup: cam.sup };
      controls.target.set(...cam.objetivo); camera.position.set(...cam.lat);
      return modelo(sexo);
    })
    .catch((e) => { console.error('[SV 3D]', e); if (C === tk) { const m = vp.querySelector('.acr3d-msg'); m.hidden = false; m.textContent = 'No se pudo cargar el modelo 3D.'; } });
  window.__sv = { get C() { return C; }, get CFG() { return CFG; } };
}

// El motor llama a sync() cada vez que cambia el estado del procedimiento (clases s-* sobre la raíz)
export function sync(root) {
  if (!C || !C.cat) return;
  const has = (k) => root.classList.contains(k);
  C.cat.goal = has('s-ins') ? 1 : 0;
  C.bal.goal = has('s-infl') ? 1.3 : 0.001;
  C.bolsa.goal = has('s-bag') ? 1 : 0.001;
}
export function hl(id) { if (C) C.hl = id || null; }
export function sel(id) { if (C) C.sel = id || null; }

export function dispose() {
  if (!C) return;
  const c = C; C = null;
  cancelAnimationFrame(c.raf);
  if (c.ro) c.ro.disconnect();
  if (c.controls) c.controls.dispose();
  c.mats.forEach((m) => m.dispose());
  if (c.renderer) c.renderer.dispose();
}

export default { build, mount, sync, hl, sel, dispose, CHIPS, usable };
