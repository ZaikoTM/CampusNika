// Doctor 3D de NikaPlay a partir de un modelo GLB con esqueleto (doctor_sketchfab.glb).
// Pone el modelo en cada pose apuntando los huesos del esqueleto Biped y renderiza PNG transparentes (1280×1920) con luz de estudio.
// Herramienta de desarrollo: el juego solo usa los PNG resultantes de assets/nikaplay/doctor/.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1280, H = 1920, $ = (s) => document.querySelector(s), V = (x, y, z) => new THREE.Vector3(x, y, z);
const MODELO = new URLSearchParams(location.search).get('m') || 'modelos/doctor_sketchfab.glb';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#vista').appendChild(renderer.domElement);
const escena = new THREE.Scene();
escena.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; escena.environmentIntensity = 0.7;
const camara = new THREE.PerspectiveCamera(18, W / H, 0.05, 100);
escena.add(new THREE.HemisphereLight(0xdceeff, 0xf0dcc8, 0.85));
const key = new THREE.DirectionalLight(0xfff0dc, 2.4); key.position.set(1.6, 3.2, 3.6); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.01; escena.add(key);
const relleno = new THREE.DirectionalLight(0xcfe4ff, 0.9); relleno.position.set(-2.5, 1.5, 3); escena.add(relleno);
const contra = new THREE.DirectionalLight(0xa6d4ff, 1.3); contra.position.set(-1.5, 3, -3); escena.add(contra);

const loader = new GLTFLoader(); loader.setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'));
const gltf = await loader.loadAsync(MODELO); const modelo = gltf.scene; escena.add(modelo);
modelo.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; if (/^(pad|pen)_/.test(o.name)) o.visible = false; } });
const hueso = (n) => { let r = null; modelo.traverse((o) => { if (o.isBone && o.name.indexOf(n) === 0) r = o; }); return r; };
const B = { pelvis: hueso('Bip001_Pelvis'), spine: hueso('Bip001_Spine_'), spine1: hueso('Bip001_Spine1'), neck: hueso('Bip001_Neck'), head: hueso('Bip001_Head'),
  l: { cla: hueso('Bip001_L_Clavicle'), up: hueso('Bip001_L_UpperArm'), fo: hueso('Bip001_L_Forearm'), ma: hueso('Bip001_L_Hand'), f0: hueso('Bip001_L_Finger0_'), f1: hueso('Bip001_L_Finger1_') },
  r: { cla: hueso('Bip001_R_Clavicle'), up: hueso('Bip001_R_UpperArm'), fo: hueso('Bip001_R_Forearm'), ma: hueso('Bip001_R_Hand'), f0: hueso('Bip001_R_Finger0_'), f1: hueso('Bip001_R_Finger1_') },
  lm: { th: hueso('Bip001_L_Thigh'), ca: hueso('Bip001_L_Calf') }, rm: { th: hueso('Bip001_R_Thigh'), ca: hueso('Bip001_R_Calf') } };
const todos = []; modelo.traverse((o) => { if (o.isBone) { o.userData.rest = o.quaternion.clone(); todos.push(o); } });
const posRest = modelo.position.clone();

function mundoQ(o) { return o.getWorldQuaternion(new THREE.Quaternion()); }
/** Hace que el hueso apunte (hacia su hijo) en la dirección de mundo dada. */
function apuntar(h, hijo, dir) {
  h.updateWorldMatrix(true, false); hijo.updateWorldMatrix(true, false);
  const actual = hijo.getWorldPosition(V(0, 0, 0)).sub(h.getWorldPosition(V(0, 0, 0))).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(actual, dir.clone().normalize());
  const nuevo = q.multiply(mundoQ(h)); h.quaternion.copy(mundoQ(h.parent).invert().multiply(nuevo)); h.updateWorldMatrix(true, true);
}
/** Rota un hueso sobre un eje del mundo. */
function girar(h, eje, grados) {
  const q = new THREE.Quaternion().setFromAxisAngle(eje.clone().normalize(), THREE.MathUtils.degToRad(grados));
  h.quaternion.copy(mundoQ(h.parent).invert().multiply(q.multiply(mundoQ(h)))); h.updateWorldMatrix(true, true);
}
/** Brazo: dirección del brazo, del antebrazo y de la mano (x>0 es el lado derecho de la pantalla). */
function brazo(lado, dUp, dFo, dMa) {
  const b = B[lado]; apuntar(b.up, b.fo, dUp); apuntar(b.fo, b.ma, dFo); if (dMa) apuntar(b.ma, b.f1, dMa);
}
const X = V(1, 0, 0), Y = V(0, 1, 0), Z = V(0, 0, 1);

// pose: { cuerpo: {gx(inclina adelante), gz(inclina costado), gy(gira)}, cabeza:{gx,gy,gz}, l:[up,fo,ma], r:[up,fo,ma], salto, agacha }
// "l" es el brazo que aparece a la DERECHA de la pantalla (x+), "r" el de la IZQUIERDA (x-).
const POSES = {
  idle:     { cabeza: { gy: -8, gz: 2 }, l: [V(0.18, -1, 0.05), V(0.1, -1, 0.35), V(0.05, -1, 0.5)], r: [V(-0.55, -0.95, 0.15), V(-0.2, -0.7, 0.65), V(0.4, -0.3, 0.8)] },
  hola:     { cabeza: { gy: -10, gz: -6 }, l: [V(0.18, -1, 0.05), V(0.1, -1, 0.35), V(0.05, -1, 0.5)], r: [V(-0.85, 0.35, 0.25), V(-0.45, 1, 0.25), V(-0.4, 1, 0.3)] },
  senala:   { cuerpo: { gy: 8 }, cabeza: { gy: -22 }, l: [V(0.18, -1, 0.05), V(0.1, -1, 0.35), V(0.05, -1, 0.5)], r: [V(-1, 0.05, 0.35), V(-1, 0.12, 0.3), V(-1, 0.15, 0.3)] },
  piensa:   { cabeza: { gx: 8, gy: -14, gz: 8 }, l: [V(0.25, -1, 0.1), V(-0.7, -0.35, 0.8), V(-1, 0, 0.3)], r: [V(-0.3, -0.9, 0.35), V(0.15, 0.55, 0.85), V(0.2, 0.8, 0.5)] },
  ok:       { cabeza: { gz: -3 }, l: [V(0.18, -1, 0.05), V(0.1, -1, 0.35), V(0.05, -1, 0.5)], r: [V(-0.45, -0.7, 0.55), V(-0.25, 0.6, 0.75), V(-0.2, 1, 0.3)] },
  victoria: { salto: 0.05, cabeza: { gx: -6 }, l: [V(0.5, 0.85, 0.1), V(0.45, 1, 0.1), V(0.4, 1, 0.1)], r: [V(-0.5, 0.85, 0.1), V(-0.45, 1, 0.1), V(-0.4, 1, 0.1)] },
  ups:      { cuerpo: { gx: -4 }, cabeza: { gx: -6 }, l: [V(0.65, -0.2, 0.3), V(0.35, 0.85, 0.5), V(0.2, 1, 0.3)], r: [V(-0.65, -0.2, 0.3), V(-0.35, 0.85, 0.5), V(-0.2, 1, 0.3)] },
  apura:    { cabeza: { gx: 6, gy: -14, gz: 5 }, l: [V(0.18, -1, 0.05), V(0.1, -1, 0.35), V(0.05, -1, 0.5)], r: [V(-0.2, -0.95, 0.3), V(0.55, 0.15, 0.85), V(0.7, 0.4, 0.5)] },
  pista:    { cabeza: { gy: -8 }, l: [V(0.18, -1, 0.05), V(0.1, -1, 0.35), V(0.05, -1, 0.5)], r: [V(-0.3, -0.95, 0.3), V(0.2, 0.2, 0.95), V(0.25, 0.3, 0.9)] },
  derrota:  { cuerpo: { gx: 5 }, cabeza: { gx: 22, gz: -6 }, l: [V(0.12, -1, 0.0), V(0.05, -1, 0.15), V(0.0, -1, 0.3)], r: [V(-0.12, -1, 0.0), V(-0.05, -1, 0.15), V(0.0, -1, 0.3)] },
  cambio:   { cuerpo: { gy: -8 }, cabeza: { gy: 22 }, l: [V(1, 0.08, 0.3), V(1, 0.15, 0.3), V(1, 0.2, 0.3)], r: [V(-0.55, -0.95, 0.15), V(-0.2, -0.7, 0.65), V(0.4, -0.3, 0.8)] },
};
let marco = null;
function poner(nombre) {
  const p = POSES[nombre]; if (!p) return;
  todos.forEach((o) => o.quaternion.copy(o.userData.rest)); modelo.position.copy(posRest); modelo.updateMatrixWorld(true);
  if (p.cuerpo) { const c = p.cuerpo; if (c.gx) girar(B.spine1, X, c.gx); if (c.gz) girar(B.spine1, Z, c.gz); if (c.gy) girar(B.spine1, Y, c.gy); }
  if (p.cabeza) { const c = p.cabeza; if (c.gx) girar(B.head, X, c.gx); if (c.gy) girar(B.head, Y, c.gy); if (c.gz) girar(B.head, Z, c.gz); }
  brazo('l', ...p.l); brazo('r', ...p.r);
  modelo.position.y = posRest.y + (p.salto || 0) * (marco ? marco.alto : 1); modelo.updateMatrixWorld(true);
}
// encuadre común a todas las poses: pies abajo y margen arriba para los brazos en alto
poner('idle'); { const bb = new THREE.Box3().setFromObject(modelo), s = bb.getSize(V(0, 0, 0)), c = bb.getCenter(V(0, 0, 0)); marco = { alto: s.y, base: bb.min.y, cx: c.x, cz: c.z }; }
{ const ext = marco.alto * 1.34, dist = ext / 2 / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)); camara.position.set(marco.cx, marco.base + ext * 0.5 - marco.alto * 0.03, marco.cz + dist); camara.lookAt(marco.cx, marco.base + ext * 0.5 - marco.alto * 0.03, marco.cz);
  key.position.set(marco.cx + 1.6, marco.base + marco.alto * 1.8, marco.cz + 3.6); key.target.position.set(marco.cx, marco.base + marco.alto * 0.5, marco.cz); escena.add(key.target);
  const sc = key.shadow.camera; sc.left = -marco.alto; sc.right = marco.alto; sc.top = marco.alto * 1.3; sc.bottom = -marco.alto * 0.3; sc.near = 0.1; sc.far = 20; sc.updateProjectionMatrix(); }
const dibujar = () => renderer.render(escena, camara);
async function guardar(n) {
  poner(n); dibujar(); const blob = await new Promise((r) => renderer.domElement.toBlob(r, 'image/png'));
  const res = await fetch('http://localhost:5518/guardar?nombre=doctor-' + n + '.png', { method: 'POST', body: blob }); return res.ok ? await res.text() : 'error ' + res.status;
}
window.doc3d = { poner, dibujar, guardar, POSES, B, modelo, camara, renderer, marco };

const cont = $('#poses'), nombres = Object.keys(POSES);
nombres.forEach((n) => { const b = document.createElement('button'); b.textContent = n; b.onclick = () => { poner(n); dibujar(); cont.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); }; cont.appendChild(b); });
$('#todo').onclick = async () => { for (const n of nombres) { $('#estado').textContent = n + ': ' + await guardar(n); } $('#estado').textContent += ' · listo'; };
const inicial = (location.hash || '#idle').slice(1); poner(POSES[inicial] ? inicial : 'idle'); dibujar();
$('#estado').textContent = MODELO + ' · ' + W + '×' + H;
