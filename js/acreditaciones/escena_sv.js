// CAMPUS NIKA — Atlas de acreditaciones: escena 3D de colocación de sonda vesical.
// Modelo anatómico 3D (three.js) con corte sagital, capas, rayos X, etiquetas y una sonda que se
// introduce por la uretra. Las anatomías están modeladas por código; el motor admite reemplazarlas
// por modelos glTF reales sin cambiar nada de la lógica de pasos.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
let C = null; // contexto de la escena activa

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
  const m = [['prostata', 'Próstata', 'organos'], ['prepucio', 'Prepucio', 'organos']];
  return [...comunes, ...(sexo === 'F' ? f : m)];
}

export function build(sexo) {
  return `<div class="acr3d sx-${sexo}">
    <div class="acr3d-vp">
      <canvas></canvas>
      <div class="acr3d-pins">${pinsDe(sexo).map(([id, l, cap]) => `<button class="hs pin" data-hs="${id}" data-capa="${cap}" type="button"><i></i><span>${l}</span></button>`).join('')}</div>
      <div class="acr3d-msg" hidden></div>
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
  </div>`;
}

export const CHIPS = [
  ['id', 'Paciente verificado'], ['consent', 'Consentimiento'], ['pos', 'Posición'], ['manos', 'Manos lavadas'],
  ['campo', 'Campo estéril'], ['tested', 'Balón probado'], ['ins', 'Sonda colocada'], ['infl', 'Balón inflado'],
  ['bag', 'Bolsa conectada'], ['fix', 'Sonda fijada'], ['reg', 'Registrado'],
];
export const usable = ['iodo', 'guantes-ns', 'panos-ns', 'guantes-e', 'pano-e', 'campo-aux', 'pack', 'gel', 'jeringa', 'bolsa', 'cinta', 'lavabo', 'hc', 'consent', 'residuos'];

// ---------------------------------------------------------------- modelo 3D
function material(color, opacity, capa, extra) {
  const m = new THREE.MeshPhysicalMaterial({
    color, transparent: true, opacity, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35,
    side: THREE.DoubleSide, depthWrite: false, ...(extra || {}),
  });
  m.userData = { capa, base: opacity };
  C.mats.push(m);
  return m;
}
function malla(geo, mat, capa, order, hsId) {
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = order;
  m.userData.capa = capa;
  C.capas[capa].add(m);
  if (hsId) { m.userData.hs = hsId; (C.hsMeshes[hsId] = C.hsMeshes[hsId] || []).push(m); }
  return m;
}
function tubo(pts, r, mat, capa, order, hsId, seg) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => V(...p)));
  return malla(new THREE.TubeGeometry(curve, seg || 64, r, 16, false), mat, capa, order, hsId);
}

function modelo(sexo) {
  const { scene } = C;
  ['piel', 'huesos', 'organos', 'sonda'].forEach((k) => { C.capas[k] = new THREE.Group(); scene.add(C.capas[k]); });

  // Piel (silueta holográfica del tronco inferior)
  const perfil = [[12.2, -15], [14.4, -9], [16, -3], [16.2, 4], [14.2, 12], [12.4, 21]].map(([r, y]) => new THREE.Vector2(r, y));
  const piel = malla(new THREE.LatheGeometry(perfil, 56, 0, Math.PI * 2), material(0x4f8bd6, 0.16, 'piel'), 'piel', 0);
  piel.scale.set(1, 1, 0.72); piel.position.set(0, 2, -1.5);

  // Huesos
  const hueso = () => material(0xeadfc6, 0.7, 'huesos', { roughness: 0.6 });
  const anillo = malla(new THREE.TorusGeometry(8.2, 1.25, 14, 56), hueso(), 'huesos', 1);
  anillo.rotation.x = Math.PI / 2; anillo.scale.set(1, 0.86, 1); anillo.position.set(0, -0.5, -0.5);
  [-1, 1].forEach((s) => {
    const ala = malla(new THREE.SphereGeometry(7.2, 28, 20), hueso(), 'huesos', 1);
    ala.scale.set(0.3, 0.95, 0.92); ala.position.set(s * 9.4, 4.2, -1.8); ala.rotation.z = s * -0.25;
    tubo([[s * 7.4, -0.6, 4.8], [s * 4.6, -1.6, 6.9], [s * 0.7, -2.2, 7.6]], 0.95, hueso(), 'huesos', 1, 24);
    tubo([[s * 8.3, -1.2, 1.5], [s * 8.6, -6, 0.5], [s * 6.2, -9.5, -2.2]], 1.0, hueso(), 'huesos', 1, 24);
  });
  tubo([[0, 6, -11.6], [0, -1, -12.6], [0, -7.2, -10.6]], 2.3, hueso(), 'huesos', 1, 28);
  malla(new THREE.SphereGeometry(1.2, 16, 12), hueso(), 'huesos', 1, 'sinfisis').position.set(0, -2.0, 7.7);

  // Órganos comunes
  const vej = malla(new THREE.SphereGeometry(1, 40, 28), material(0xfbbf24, 0.62, 'organos', { clearcoat: 0.8 }), 'organos', 2, 'vejiga');
  vej.scale.set(4.3, 3.9, 4.3); vej.position.set(0, 0.4, 1.6);
  tubo([[0, 12.5, -8.6], [0, 6, -10], [0, 0, -9.4], [0, -6, -7.6], [0, -9.8, -6.8]], 1.7, material(0xc98f6b, 0.62, 'organos'), 'organos', 2, 'recto', 40);

  let uretraPts; let colaFuera; let bolsaPos;
  if (sexo === 'F') {
    const ut = new THREE.LatheGeometry([[0.01, 0], [1.1, 0.3], [2.2, 1.6], [2.9, 3.4], [2.4, 5.4], [1.2, 6.6], [0.01, 6.9]].map(([r, y]) => new THREE.Vector2(r, y)), 36);
    const u = malla(ut, material(0xf472b6, 0.66, 'organos'), 'organos', 2, 'utero');
    u.scale.set(1.15, 1, 0.8); u.position.set(0, -0.2, -4.4); u.rotation.x = 0.78;
    tubo([[0, 0.4, -4.0], [0, -2.5, -2.0], [0, -5.4, 0.6], [0, -7.8, 4.3]], 1.15, material(0xf9a8d4, 0.55, 'organos'), 'organos', 2, 'vagina', 40);
    uretraPts = [[0, -3.2, 2.3], [0, -5.0, 3.7], [0, -7.0, 5.1], [0, -7.8, 5.5]];
    colaFuera = [[0, -15.5, 9.6], [0, -11.5, 8.2], [0, -8.8, 6.6]];
    bolsaPos = V(0, -19.2, 9.6);
  } else {
    const pr = malla(new THREE.SphereGeometry(1, 28, 20), material(0xfb923c, 0.72, 'organos'), 'organos', 2, 'prostata');
    pr.scale.set(2.5, 2.1, 2.3); pr.position.set(0, -4.5, 1.7);
    [-1, 1].forEach((s) => { const sv = malla(new THREE.SphereGeometry(1, 16, 12), material(0xfdba74, 0.6, 'organos'), 'organos', 2); sv.scale.set(0.9, 0.7, 2); sv.position.set(s * 2.2, -2.8, -1.6); sv.rotation.x = 0.5; });
    uretraPts = [[0, -3.2, 2.0], [0, -5.2, 2.3], [0, -6.9, 3.1], [0, -8.2, 4.5], [0, -9.1, 6.6], [0, -9.6, 9.6], [0, -9.2, 13], [0, -8.5, 17.4]];
    tubo(uretraPts.slice(4), 1.55, material(0xf3c9a0, 0.4, 'piel'), 'piel', 0, null, 40);
    const gl = malla(new THREE.SphereGeometry(1.6, 20, 14), material(0xf0a0a0, 0.55, 'piel'), 'piel', 0, 'prepucio'); gl.position.set(0, -8.4, 17.7);
    const esc = malla(new THREE.SphereGeometry(1, 24, 18), material(0xf3c9a0, 0.4, 'piel'), 'piel', 0); esc.scale.set(3.6, 3.4, 3.4); esc.position.set(0, -12.4, 1.6);
    colaFuera = [[0, -13.5, 22.8], [0, -10.2, 21.2], [0, -8.2, 19.6]];
    bolsaPos = V(0, -17.2, 22.8);
  }
  tubo(uretraPts, 0.38, material(0xfb7185, 0.55, 'organos'), 'organos', 3, 'uretra', 48);

  // Sonda: de la bolsa al balón; se dibuja de afuera hacia adentro
  const tip = [0, -0.6, 2.1];
  const ruta = [...colaFuera, ...uretraPts.slice().reverse(), [0, -3.0, 2.3], tip];
  const curva = new THREE.CatmullRomCurve3(ruta.map((p) => V(...p)));
  const geo = new THREE.TubeGeometry(curva, 220, 0.2, 12, false);
  C.cat = { mesh: malla(geo, material(0x22d3ee, 0.98, 'sonda', { emissive: 0x0e7490, emissiveIntensity: 0.5, depthWrite: true }), 'sonda', 5), total: geo.index.count, per: 12 * 6, cur: 0, goal: 0 };
  C.cat.mesh.visible = false;

  // Balón
  const bal = malla(new THREE.SphereGeometry(1, 28, 20), material(0x38bdf8, 0.85, 'sonda', { emissive: 0x0369a1, emissiveIntensity: 0.35 }), 'sonda', 6, 'balon');
  bal.position.set(0, -2.4, 2.2); bal.scale.setScalar(0.001);
  C.bal = { mesh: bal, cur: 0.001, goal: 0.001 };

  // Bolsa colectora
  const g = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(5, 6.5, 1.3), material(0xbae6fd, 0.45, 'sonda', { depthWrite: true }));
  const orina = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3, 1.1), material(0xfde047, 0.75, 'sonda', { depthWrite: true })); orina.position.y = -1.6;
  cuerpo.renderOrder = 5; orina.renderOrder = 5;
  g.add(cuerpo, orina); g.position.copy(bolsaPos); g.scale.setScalar(0.001); C.capas.sonda.add(g);
  C.bolsa = { g, cur: 0.001, goal: 0.001 };

  // Anclas de las etiquetas
  C.anclas = sexo === 'F'
    ? { vejiga: V(0, 1.4, 1.6), balon: V(0, -2.4, 2.2), uretra: V(0, -5.0, 3.9), recto: V(0, 2, -9.8), sinfisis: V(0, -2, 7.9), paciente: V(0, 18, -1), utero: V(0, 3.4, -2.6), vagina: V(0, -3.8, -0.5) }
    : { vejiga: V(0, 1.4, 1.6), balon: V(0, -2.4, 2.2), uretra: V(0, -9.4, 9.8), recto: V(0, 2, -9.8), sinfisis: V(0, -2, 7.9), paciente: V(0, 18, -1), prostata: V(0, -4.5, 1.7), prepucio: V(0, -8.4, 17.9) };
}

// ---------------------------------------------------------------- montaje / ciclo
const VISTAS = { lat: [36, -1, 4], fro: [0, -1, 40], sup: [0.01, 42, 3] };
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();

function pick(e) {
  if (!C) return null;
  const r = C.canvas.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, C.camera);
  const cand = Object.values(C.hsMeshes).flat().filter((m) => m.visible && C.opt.capas[m.userData.capa] !== false && C.capas[m.userData.capa].visible);
  const hits = ray.intersectObjects(cand, false).filter((h) => !C.opt.cut || C.plane.distanceToPoint(h.point) >= -0.01);
  return hits.length ? hits[0].object.userData.hs : null;
}

function aplicarLook() {
  const o = C.opt;
  C.mats.forEach((m) => {
    const capa = m.userData.capa;
    let op = m.userData.base;
    if (capa === 'piel') op = o.xray ? 0.04 : m.userData.base;
    else if (capa === 'huesos') op = o.xray ? 0.95 : m.userData.base;
    else if (capa === 'organos') op = o.xray ? m.userData.base * 0.55 : m.userData.base;
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
  scene.fog = new THREE.Fog(0x0a1530, 90, 160);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
  camera.position.set(...VISTAS.lat);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, -3, 3); controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 10; controls.maxDistance = 100; controls.screenSpacePanning = true;
  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1b2a4a, 0.9));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.1); d1.position.set(30, 40, 30); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x22d3ee, 0.55); d2.position.set(-30, 10, -30); scene.add(d2);
  const grid = new THREE.GridHelper(120, 24, 0x1d3a66, 0x142a4d); grid.position.y = -24; scene.add(grid);

  C = {
    root, vp, canvas, renderer, scene, camera, controls, mats: [], capas: {}, hsMeshes: {}, plane: new THREE.Plane(V(-1, 0, 0), 0),
    opt: { xray: false, cut: true, labels: true, capas: { piel: true, huesos: true, organos: true, sonda: true } },
    hl: null, sel: null, hover: null, goal: null, sexo, raf: 0,
  };
  modelo(sexo);
  C.pins = [...vp.querySelectorAll('.pin')];
  aplicarLook();

  const resize = () => {
    const w = vp.clientWidth, h = vp.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  C.ro = new ResizeObserver(resize); C.ro.observe(vp); resize();

  vp.querySelector('.acr3d-tools').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]'); if (!b || !C) return;
    const t = b.dataset.tool;
    if (t.startsWith('v-')) { const v = VISTAS[t.slice(2, 5)]; if (v) C.goal = V(...v); return; }
    if (t === 'xray' || t === 'cut' || t === 'labels') C.opt[t] = !C.opt[t]; else C.opt.capas[t] = !C.opt.capas[t];
    b.classList.toggle('on', t === 'xray' || t === 'cut' || t === 'labels' ? C.opt[t] : C.opt.capas[t]);
    aplicarLook();
  });
  controls.addEventListener('start', () => { C.goal = null; });

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
    if (!C) return;
    C.raf = requestAnimationFrame(loop);
    if (C.goal) { camera.position.lerp(C.goal, 0.08); if (camera.position.distanceTo(C.goal) < 0.3) C.goal = null; }
    controls.update();
    const k = C.cat; k.cur += (k.goal - k.cur) * 0.035; if (Math.abs(k.goal - k.cur) < 0.002) k.cur = k.goal;
    k.mesh.visible = k.cur > 0.003;
    k.mesh.geometry.setDrawRange(0, Math.floor((k.total * k.cur) / k.per) * k.per);
    const b = C.bal; b.cur += (b.goal - b.cur) * 0.07; b.mesh.scale.setScalar(Math.max(b.cur, 0.001)); b.mesh.visible = k.cur > 0.97;
    const g = C.bolsa; g.cur += (g.goal - g.cur) * 0.1; g.g.scale.setScalar(Math.max(g.cur, 0.001)); g.g.visible = g.cur > 0.01;
    const pulso = 0.45 + 0.35 * Math.sin(t / 170);
    Object.entries(C.hsMeshes).forEach(([id, ms]) => ms.forEach((m) => {
      const mt = m.material;
      if (id === C.hl) { mt.emissive.setHex(0xf59e0b); mt.emissiveIntensity = pulso; }
      else if (id === C.sel) { mt.emissive.setHex(0x0d9488); mt.emissiveIntensity = 0.5; }
      else if (id === C.hover) { mt.emissive.setHex(0x14b8a6); mt.emissiveIntensity = 0.35; }
      else if (id === 'balon') { mt.emissive.setHex(0x0369a1); mt.emissiveIntensity = 0.35; }
      else { mt.emissiveIntensity = 0; }
    }));
    renderer.render(scene, camera);
    const w = vp.clientWidth, h = vp.clientHeight;
    C.pins.forEach((p) => {
      const a = C.anclas[p.dataset.hs]; if (!a) return;
      tmp.copy(a).project(camera);
      const vis = C.opt.labels && C.opt.capas[p.dataset.capa] !== false && tmp.z < 1 && !(p.dataset.hs === 'balon' && !(C.cat.cur > 0.97));
      p.classList.toggle('oculto', !vis);
      if (vis) p.style.transform = `translate(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px)`;
    });
  };
  C.raf = requestAnimationFrame(loop);
}

// El motor llama a sync() cada vez que cambia el estado del procedimiento (clases s-* sobre la raíz)
export function sync(root) {
  if (!C) return;
  const has = (k) => root.classList.contains(k);
  C.cat.goal = has('s-ins') ? 1 : 0;
  C.bal.goal = has('s-infl') ? 1.25 : 0.001;
  C.bolsa.goal = has('s-bag') ? 1 : 0.001;
}
export function hl(id) { if (C) C.hl = id || null; }
export function sel(id) { if (C) C.sel = id || null; }

export function dispose() {
  if (!C) return;
  cancelAnimationFrame(C.raf);
  if (C.ro) C.ro.disconnect();
  if (C.controls) C.controls.dispose();
  if (C.scene) C.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  C.mats.forEach((m) => m.dispose());
  if (C.renderer) C.renderer.dispose();
  C = null;
}

export default { build, mount, sync, hl, sel, dispose, CHIPS, usable };
