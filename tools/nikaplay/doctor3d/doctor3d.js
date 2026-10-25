// Doctor 3D de NikaPlay: modelo procedural en three.js (geometría, materiales PBR e iluminación de estudio).
// Se renderiza con fondo transparente y se guardan PNG de alta resolución en assets/nikaplay/doctor/ (ver README de esa carpeta).
// Herramienta de desarrollo: no se carga en el juego, solo se usan los PNG resultantes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1280, H = 1920;                          // lienzo 2:3 (alto ≈ 1920 px)
const $ = (s) => document.querySelector(s);

/* ------------------------------------------------------------------ renderer, escena, luces */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#vista').appendChild(renderer.domElement);
const escena = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer); escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; escena.environmentIntensity = 0.55;
const camara = new THREE.PerspectiveCamera(20, W / H, 0.1, 100); camara.position.set(0, 2.05, 13.2); camara.lookAt(0, 2.05, 0);
escena.add(new THREE.HemisphereLight(0xd6ecff, 0xf2d6bc, 0.65));
const key = new THREE.DirectionalLight(0xfff1dc, 2.7); key.position.set(3.2, 6.2, 7.5); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 5; key.shadow.camera.bottom = -1; key.shadow.camera.near = 1; key.shadow.camera.far = 20; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 5; escena.add(key);
const relleno = new THREE.DirectionalLight(0xcfe4ff, 0.9); relleno.position.set(-5, 2.5, 5); escena.add(relleno);
const contra = new THREE.DirectionalLight(0xa6d4ff, 1.5); contra.position.set(-3.5, 5.5, -6); escena.add(contra);
const contra2 = new THREE.DirectionalLight(0xffe6c4, 0.9); contra2.position.set(4, 3, -5); escena.add(contra2);

/* ------------------------------------------------------------------ materiales */
function lienzoTela() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { const x = Math.random() * 512, y = Math.random() * 512, l = 20 + Math.random() * 90; g.strokeStyle = 'rgba(' + (Math.random() > .5 ? '255,255,255' : '0,0,0') + ',' + (0.03 + Math.random() * 0.05) + ')'; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 8, y + l); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 3); return t;
}
const tela = lienzoTela();
const M = {
  piel: new THREE.MeshPhysicalMaterial({ color: 0xf2bb94, roughness: 0.52, sheen: 0.5, sheenColor: new THREE.Color(0xff9d86), sheenRoughness: 0.5, clearcoat: 0.12 }),
  pielOsc: new THREE.MeshStandardMaterial({ color: 0xe4a07a, roughness: 0.6 }),
  rubor: new THREE.MeshStandardMaterial({ color: 0xf29a86, roughness: 0.7, transparent: true, opacity: 0.2 }),
  pelo: new THREE.MeshPhysicalMaterial({ color: 0x6b3b1e, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new THREE.Color(0xc98a52) }),
  peloClaro: new THREE.MeshPhysicalMaterial({ color: 0x93562c, roughness: 0.38, clearcoat: 0.5 }),
  bata: new THREE.MeshStandardMaterial({ color: 0xf7f9fd, roughness: 0.78, bumpMap: tela, bumpScale: 1.4, side: THREE.DoubleSide }),
  bataIn: new THREE.MeshStandardMaterial({ color: 0xdde6f2, roughness: 0.85, side: THREE.DoubleSide }),
  ambo: new THREE.MeshStandardMaterial({ color: 0x2f9be6, roughness: 0.6, bumpMap: tela, bumpScale: 0.8 }),
  camisa: new THREE.MeshStandardMaterial({ color: 0x5ab8ee, roughness: 0.62 }),
  pantalon: new THREE.MeshStandardMaterial({ color: 0x4fb4ea, roughness: 0.62, bumpMap: tela, bumpScale: 0.8 }),
  zapato: new THREE.MeshPhysicalMaterial({ color: 0x6a4228, roughness: 0.32, clearcoat: 0.5 }),
  suela: new THREE.MeshStandardMaterial({ color: 0x2a1b12, roughness: 0.7 }),
  corbata: new THREE.MeshStandardMaterial({ color: 0x1f5cc6, roughness: 0.45 }),
  tubo: new THREE.MeshPhysicalMaterial({ color: 0x1f2937, roughness: 0.35, clearcoat: 0.4 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xdfe7f0, metalness: 1, roughness: 0.22 }),
  esclera: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }),
  pupila: new THREE.MeshStandardMaterial({ color: 0x0b0806, roughness: 0.2 }),
  brillo: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  boca: new THREE.MeshStandardMaterial({ color: 0x5a1218, roughness: 0.5 }),
  lengua: new THREE.MeshStandardMaterial({ color: 0xe8707a, roughness: 0.45 }),
  dientes: new THREE.MeshStandardMaterial({ color: 0xfffdf6, roughness: 0.3 }),
  labio: new THREE.MeshStandardMaterial({ color: 0xb85a5a, roughness: 0.45 }),
  credencial: null, reloj: new THREE.MeshStandardMaterial({ color: 0x9aa7b6, metalness: 0.9, roughness: 0.3 }), correa: new THREE.MeshStandardMaterial({ color: 0x2c2c33, roughness: 0.6 }),
};
{ // credencial con el logo de NikaMed
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 160); g.fillStyle = '#1e5fb0'; g.fillRect(0, 0, 256, 34);
  g.fillStyle = '#1e5fb0'; g.font = '900 52px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('NikaMed', 128, 100);
  g.fillStyle = '#6b7f99'; g.font = '700 22px Arial, sans-serif'; g.fillText('MÉDICO', 128, 138);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; M.credencial = new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 });
}
{ // iris con degradé y aro oscuro
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 8, 128, 128, 126); gr.addColorStop(0, '#c98a4a'); gr.addColorStop(0.45, '#8a521f'); gr.addColorStop(0.85, '#4a2a10'); gr.addColorStop(1, '#2a160a');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28; g.strokeStyle = 'rgba(255,220,160,' + (0.05 + Math.random() * 0.12) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 30, 128 + Math.sin(a) * 30); g.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; M.iris = new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.15, clearcoat: 1 });
}

/* ------------------------------------------------------------------ ayudas de geometría */
const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
function elip(rx, ry, rz, mat, pos = [0, 0, 0], seg = 48) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), mat); m.scale.set(rx, ry, rz); m.position.set(...pos); return sombra(m); }
function capsula(r, largo, mat, pos = [0, 0, 0]) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, largo, 12, 32), mat); m.position.set(...pos); return sombra(m); }
function caja(w, h, d, rad, mat, pos = [0, 0, 0]) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, rad), mat); m.position.set(...pos); return sombra(m); }
/** "Tubo" de esferas con radio variable a lo largo de una curva: sirve para mechones de pelo y similares. */
function mechon(pts, r0, r1, mat, n = 40) {
  const g = new THREE.Group(), curva = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  for (let i = 0; i <= n; i++) { const t = i / n, p = curva.getPoint(t), r = r0 + (r1 - r0) * t; const e = elip(r, r * 1.05, r, mat, [p.x, p.y, p.z], 24); g.add(e); }
  return g;
}
function tubo(pts, radio, mat, cerrado = false) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), cerrado), 96, radio, 16, cerrado), mat); return sombra(m); }

/* ------------------------------------------------------------------ personaje */
const doctor = new THREE.Group(); escena.add(doctor);
const cuerpo = new THREE.Group(); doctor.add(cuerpo);                 // cadera hacia arriba: se inclina y salta
const torso = new THREE.Group(); torso.position.y = 1.15; cuerpo.add(torso);

/* piernas y zapatos (fijos al suelo) */
for (const s of [-1, 1]) {
  const pierna = new THREE.Group(); pierna.position.set(s * 0.24, 0, 0); doctor.add(pierna);
  const cil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.165, 1.12, 40, 1), M.pantalon); cil.position.y = 0.72; pierna.add(sombra(cil));
  pierna.add(elip(0.2, 0.12, 0.2, M.pantalon, [0, 1.28, 0], 32));
  pierna.add(elip(0.175, 0.07, 0.175, M.pantalon, [0, 0.19, 0], 24));
  const zap = new THREE.Group(); zap.position.set(0, 0.0, 0.1); zap.rotation.y = s * 0.2; pierna.add(zap);
  zap.add(elip(0.2, 0.15, 0.44, M.zapato, [0, 0.17, 0.12], 48)); zap.add(elip(0.205, 0.05, 0.45, M.suela, [0, 0.04, 0.12], 48));
  zap.add(elip(0.16, 0.13, 0.2, M.zapato, [0, 0.27, -0.06], 32)); zap.add(elip(0.12, 0.05, 0.16, M.zapato, [0, 0.31, 0.2], 28));
  zap.add(elip(0.15, 0.04, 0.1, M.pantalon, [0, 0.36, -0.1], 24));
}
/* cintura / cinturón */
{ const cint = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.1, 48), M.correa); cint.scale.z = 0.62; cint.position.y = 1.32; doctor.add(sombra(cint)); const hebilla = caja(0.13, 0.09, 0.03, 0.01, M.metal, [0, 1.32, 0.3]); doctor.add(hebilla); }
cuerpo.add(elip(0.47, 0.2, 0.29, M.pantalon, [0, 1.3, 0], 32));

/* torso: ambo, camisa y corbata */
torso.add(elip(0.5, 0.7, 0.36, M.ambo, [0, 0.6, 0]));
torso.add(elip(0.44, 0.6, 0.34, M.camisa, [0, 0.7, 0.03]));
{ // corbata
  const forma = new THREE.Shape(); forma.moveTo(-0.07, 0); forma.lineTo(0.07, 0); forma.lineTo(0.12, -0.5); forma.lineTo(0, -0.62); forma.lineTo(-0.12, -0.5); forma.closePath();
  const corb = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3 }), M.corbata); corb.position.set(0, 1.3, 0.4); torso.add(sombra(corb));
  torso.add(elip(0.09, 0.065, 0.06, M.corbata, [0, 1.32, 0.43], 24));
}
/* guardapolvo: dos mitades (lathe abierto al frente) + solapas, cuello y bolsillos */
{
  const perfil = [[0.64, -0.12], [0.62, 0.2], [0.56, 0.5], [0.52, 0.8], [0.56, 1.1], [0.55, 1.3], [0.46, 1.44], [0.33, 1.51], [0.3, 1.55]].map(([r, y]) => new THREE.Vector2(r, y));
  const brecha = 0.3;
  const bata = new THREE.Mesh(new THREE.LatheGeometry(perfil, 96, brecha, Math.PI * 2 - brecha * 2), M.bata); bata.scale.set(1, 1, 0.64); torso.add(sombra(bata));
  for (const s of [-1, 1]) {
    const borde = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.6, 12), M.bata); const x = Math.sin(brecha) * 0.57 * s, z = Math.cos(brecha) * 0.57 * 0.64;
    borde.position.set(x * 0.98, 0.7, z); borde.rotation.z = -s * 0.07; torso.add(sombra(borde));
    const solapa = caja(0.2, 0.62, 0.035, 0.015, M.bata, [s * 0.2, 1.02, 0.4]); solapa.rotation.set(0.05, -s * 0.34, s * 0.2); torso.add(solapa);
    const cuello = caja(0.2, 0.12, 0.05, 0.02, M.bata, [s * 0.2, 1.46, 0.28]); cuello.rotation.set(0.35, -s * 0.5, s * 0.15); torso.add(cuello);
    const ang = s * 0.72, rr = 0.56, bols = caja(0.3, 0.26, 0.035, 0.02, M.bataIn, [Math.sin(ang) * rr, 0.15, Math.cos(ang) * rr * 0.64]); bols.rotation.y = ang * 0.92; torso.add(bols);
    const solB = caja(0.3, 0.05, 0.045, 0.02, M.bata, [Math.sin(ang) * rr, 0.28, Math.cos(ang) * rr * 0.65 + 0.004]); solB.rotation.y = ang * 0.92; torso.add(solB);
  }
  const cred = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.17, 0.02, 4, 0.012), [M.bataIn, M.bataIn, M.bataIn, M.bataIn, M.credencial, M.bataIn]); cred.position.set(0.34, 1.0, 0.49); cred.rotation.set(0.12, -0.45, 0); torso.add(sombra(cred));
  torso.add(caja(0.03, 0.06, 0.03, 0.01, M.metal, [0.34, 1.095, 0.5]));
}
/* estetoscopio */
const estetoscopio = new THREE.Group(); torso.add(estetoscopio);
estetoscopio.add(tubo([[-0.3, 1.5, -0.16], [-0.46, 1.38, 0.18], [-0.44, 1.05, 0.46], [-0.24, 0.74, 0.55], [0.0, 0.62, 0.58], [0.24, 0.76, 0.55], [0.44, 1.07, 0.46], [0.46, 1.38, 0.18], [0.3, 1.5, -0.16], [0, 1.56, -0.22], [-0.3, 1.5, -0.16]], 0.032, M.tubo, true));
const pieza = new THREE.Group(); estetoscopio.add(pieza);
pieza.add(tubo([[0.0, 0.62, 0.58], [0.12, 0.5, 0.6], [0.2, 0.38, 0.58]], 0.03, M.tubo));
{ const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 40), M.metal); cap.rotation.x = Math.PI / 2; const aro = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 16, 40), M.metal); const cen = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.056, 40), new THREE.MeshStandardMaterial({ color: 0x9fb0c2, metalness: 1, roughness: 0.35 })); cen.rotation.x = Math.PI / 2; pieza.add(sombra(cap), sombra(aro), sombra(cen)); pieza.children.slice(-3).forEach((m) => m.position.set(0.22, 0.31, 0.58)); }
pieza.userData.reposo = pieza.position.clone();

/* cuello y cabeza */
const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.4, 40), M.piel); cuello.position.y = 1.58; torso.add(sombra(cuello));
const cabeza = new THREE.Group(); cabeza.position.set(0, 2.0, 0.02); cabeza.scale.setScalar(0.88); torso.add(cabeza);
{
  cabeza.add(elip(0.6, 0.64, 0.58, M.piel, [0, 0.02, 0], 64));                                       // cráneo
  cabeza.add(elip(0.5, 0.4, 0.5, M.piel, [0, -0.22, 0.08], 64));                                      // mandíbula
  cabeza.add(elip(0.16, 0.12, 0.1, M.piel, [-0.3, -0.17, 0.42], 32)); cabeza.add(elip(0.16, 0.12, 0.1, M.piel, [0.3, -0.17, 0.42], 32)); // mejillas
  cabeza.add(elip(0.1, 0.06, 0.03, M.rubor, [-0.34, -0.14, 0.5], 24)); cabeza.add(elip(0.1, 0.06, 0.03, M.rubor, [0.34, -0.14, 0.5], 24));
  for (const s of [-1, 1]) { cabeza.add(elip(0.09, 0.15, 0.06, M.piel, [s * 0.6, -0.02, -0.02], 32)); cabeza.add(elip(0.05, 0.09, 0.03, M.pielOsc, [s * 0.62, -0.02, 0.0], 24)); }
  cabeza.add(elip(0.062, 0.058, 0.06, M.piel, [0, -0.1, 0.56], 40));                                // nariz
  cabeza.add(elip(0.034, 0.03, 0.03, M.pielOsc, [-0.034, -0.135, 0.555], 16)); cabeza.add(elip(0.034, 0.03, 0.03, M.pielOsc, [0.034, -0.135, 0.555], 16));
}
/* pelo: casquete + flequillo ondulado + mechones */
const pelo = new THREE.Group(); cabeza.add(pelo);
{
  const cas = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.56), M.pelo); cas.scale.set(0.67, 0.7, 0.66); cas.position.set(0, 0.08, -0.04); cas.rotation.x = -0.32; pelo.add(sombra(cas));
  pelo.add(elip(0.62, 0.5, 0.5, M.pelo, [0, 0.08, -0.22], 48));
  pelo.add(mechon([[-0.5, 0.36, 0.2], [-0.36, 0.58, 0.34], [-0.1, 0.72, 0.38], [0.2, 0.78, 0.28], [0.46, 0.66, 0.08]], 0.19, 0.12, M.pelo, 46));
  pelo.add(mechon([[-0.52, 0.28, 0.2], [-0.4, 0.5, 0.38], [-0.12, 0.64, 0.46], [0.18, 0.7, 0.4]], 0.12, 0.08, M.peloClaro, 40));
  pelo.add(mechon([[-0.15, 0.66, 0.34], [0.1, 0.9, 0.22], [0.34, 0.92, 0.0], [0.52, 0.76, -0.14]], 0.16, 0.07, M.pelo, 44));
  pelo.add(mechon([[0.02, 0.76, 0.24], [0.26, 0.88, 0.1], [0.46, 0.74, -0.08]], 0.09, 0.05, M.peloClaro, 36));
  pelo.add(mechon([[-0.28, 0.5, 0.44], [-0.04, 0.68, 0.5], [0.24, 0.66, 0.44]], 0.1, 0.06, M.pelo, 36));
  for (const s of [-1, 1]) { pelo.add(elip(0.07, 0.2, 0.15, M.pelo, [s * 0.57, 0.12, 0.05], 28)); pelo.add(elip(0.06, 0.13, 0.1, M.pelo, [s * 0.6, 0.18, -0.12], 24)); }
  pelo.add(elip(0.5, 0.3, 0.3, M.pelo, [0, 0.0, -0.4], 40));
}
/* ojos, cejas y boca (rasgos animables) */
const ojos = []; const cejas = []; const rasgos = new THREE.Group(); cabeza.add(rasgos);
for (const s of [-1, 1]) {
  const o = new THREE.Group(); o.position.set(s * 0.2, 0.07, 0.46); rasgos.add(o);
  const esc = elip(0.17, 0.19, 0.11, M.esclera, [0, 0, 0], 48); o.add(esc);
  const mirada = new THREE.Group(); o.add(mirada);
  const iris = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), M.iris); iris.scale.set(0.108, 0.12, 0.045); iris.position.set(0, 0, 0.098); mirada.add(iris);
  const pup = elip(0.052, 0.06, 0.03, M.pupila, [0, 0, 0.127], 24); mirada.add(pup);
  mirada.add(elip(0.032, 0.036, 0.012, M.brillo, [0.04, 0.05, 0.138], 16)); mirada.add(elip(0.015, 0.017, 0.008, M.brillo, [-0.035, -0.045, 0.134], 12));
  const parpado = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), M.piel); parpado.scale.set(0.176, 0.2, 0.125); parpado.position.set(0, 0.0, 0.002); parpado.rotation.x = -Math.PI * 0.5 + 0.0; o.add(sombra(parpado));
  const parpadoI = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), M.piel); parpadoI.scale.set(0.174, 0.198, 0.123); parpadoI.rotation.x = Math.PI * 0.5; o.add(parpadoI);
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 12, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.5 })); arco.position.set(0, -0.04, 0.13); o.add(arco);
  ojos.push({ grupo: o, mirada, parpado, parpadoI, arco, s });
  const ceja = new THREE.Group(); ceja.position.set(s * 0.2, 0.34, 0.5); rasgos.add(ceja);
  const tb = tubo([[-0.14, -0.025, 0], [-0.05, 0.03, 0.01], [0.05, 0.04, 0.01], [0.15, -0.005, 0]], 0.04, M.pelo); ceja.add(tb); ceja.add(elip(0.04, 0.04, 0.04, M.pelo, [-0.135, -0.02, 0], 16)); ceja.add(elip(0.04, 0.04, 0.04, M.pelo, [0.145, -0.005, 0], 16));
  cejas.push({ grupo: ceja, s });
}
const boca = new THREE.Group(); boca.position.set(0, -0.27, 0.49); rasgos.add(boca);
function construirBoca(tipo) {
  while (boca.children.length) boca.remove(boca.children[0]);
  const lab = M.labio;
  if (tipo === 'sonrisa') { boca.add(tubo([[-0.24, 0.07, -0.03], [-0.13, -0.035, 0.03], [0, -0.075, 0.05], [0.13, -0.035, 0.03], [0.24, 0.07, -0.03]], 0.02, new THREE.MeshStandardMaterial({ color: 0x9a4444, roughness: 0.45 }))); for (const s of [-1, 1]) boca.add(elip(0.02, 0.035, 0.014, M.pielOsc, [s * 0.27, 0.09, -0.035], 12)); return; }
  const f = new THREE.Shape();
  if (tipo === 'grande') { f.moveTo(-0.22, 0.04); f.quadraticCurveTo(0, 0.1, 0.22, 0.04); f.quadraticCurveTo(0.18, -0.2, 0, -0.22); f.quadraticCurveTo(-0.18, -0.2, -0.22, 0.04); }
  else if (tipo === 'oh') { f.absellipse(0, -0.04, 0.08, 0.11, 0, Math.PI * 2, false); }
  else if (tipo === 'triste') { f.moveTo(-0.16, -0.07); f.quadraticCurveTo(0, 0.07, 0.16, -0.07); f.quadraticCurveTo(0, 0.045, -0.16, -0.07); }
  else if (tipo === 'preocupado') { f.moveTo(-0.17, -0.02); f.quadraticCurveTo(-0.08, 0.05, 0, 0.0); f.quadraticCurveTo(0.08, -0.05, 0.17, -0.02); f.quadraticCurveTo(0.08, -0.1, 0, -0.06); f.quadraticCurveTo(-0.08, -0.02, -0.17, -0.02); }
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: 0.03, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 4 }), tipo === 'triste' ? lab : M.boca); m.position.z = 0.015; boca.add(sombra(m));
  if (tipo === 'grande') { const d = new THREE.Shape(); d.moveTo(-0.2, 0.045); d.quadraticCurveTo(0, 0.095, 0.2, 0.045); d.lineTo(0.185, 0.0); d.quadraticCurveTo(0, 0.04, -0.185, 0.0); d.closePath(); const di = new THREE.Mesh(new THREE.ExtrudeGeometry(d, { depth: 0.02, bevelEnabled: false }), M.dientes); di.position.z = 0.04; boca.add(di); boca.add(elip(0.1, 0.045, 0.02, M.lengua, [0, -0.15, 0.045], 24)); }
  if (tipo === 'oh') { boca.add(elip(0.05, 0.05, 0.015, M.lengua, [0, -0.1, 0.045], 20)); }
}
/* brazos */
function mano(tipo) {
  const g = new THREE.Group(); const palma = elip(0.115, 0.13, 0.07, M.piel, [0, -0.1, 0], 32); g.add(palma);
  const curvas = { abierta: [0.12, 0.1, 0.1, 0.12], puno: [1.5, 1.6, 1.6, 1.5], senala: [0.0, 1.6, 1.6, 1.6], pulgar: [1.5, 1.6, 1.6, 1.5], relajada: [0.45, 0.55, 0.6, 0.6], agarra: [0.9, 1.0, 1.0, 0.9] }[tipo] || [0.3, 0.3, 0.3, 0.3];
  const dedos = [];
  curvas.forEach((c, i) => {
    const x = -0.075 + i * 0.05, largo = [0.11, 0.13, 0.12, 0.095][i], base = new THREE.Group(); base.position.set(x, -0.2, 0.0); base.rotation.x = -(c * 0.55); g.add(base);
    base.add(capsula(0.027, largo, M.piel, [0, -largo / 2 - 0.015, 0]));
    const punta = new THREE.Group(); punta.position.set(0, -largo - 0.03, 0); punta.rotation.x = -(c * 0.7); base.add(punta); punta.add(capsula(0.024, largo * 0.7, M.piel, [0, -largo * 0.35 - 0.01, 0]));
    dedos.push(base);
  });
  const pulgar = new THREE.Group(); pulgar.position.set(0.1, -0.1, 0.03); pulgar.rotation.z = 0.7; g.add(pulgar);
  const up = tipo === 'pulgar'; pulgar.rotation.set(up ? 0.1 : -0.4, 0, up ? -0.15 : 0.8 + (tipo === 'abierta' ? 0.2 : 0));
  pulgar.add(capsula(0.033, 0.1, M.piel, [0, -0.07, 0])); const pp = new THREE.Group(); pp.position.set(0, -0.14, 0); pp.rotation.x = -0.35; pulgar.add(pp); pp.add(capsula(0.029, 0.07, M.piel, [0, -0.04, 0]));
  if (up) { pulgar.position.set(0.09, -0.12, 0.04); pulgar.rotation.set(0, 0, 3.0); }
  return g;
}
function brazo(s) {
  const hombro = new THREE.Group(); hombro.position.set(s * 0.6, 1.5, 0); torso.add(hombro);
  hombro.add(elip(0.18, 0.18, 0.18, M.bata, [0, 0, 0], 32));
  hombro.add(capsula(0.145, 0.42, M.bata, [0, -0.3, 0]));
  const codo = new THREE.Group(); codo.position.set(0, -0.62, 0); hombro.add(codo);
  codo.add(elip(0.14, 0.14, 0.14, M.bata, [0, 0, 0], 28));
  codo.add(capsula(0.122, 0.34, M.bata, [0, -0.28, 0]));
  const muneca = new THREE.Group(); muneca.position.set(0, -0.64, 0); codo.add(muneca);
  const puno = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.14, 0.12, 36), M.camisa); puno.position.y = 0.05; muneca.add(sombra(puno));
  const puno2 = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.08, 36), M.piel); puno2.position.y = -0.03; muneca.add(puno2);
  return { hombro, codo, muneca, mano: null, s };
}
const brazos = { izq: brazo(-1), der: brazo(1) };
function ponerMano(b, tipo) { if (b.mano) b.muneca.remove(b.mano); b.mano = mano(tipo); b.mano.position.y = -0.02; b.muneca.add(b.mano); }
// reloj de pulsera (solo para la pose "apura")
const reloj = new THREE.Group(); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32), M.reloj); c.rotation.z = Math.PI / 2; const car = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.055, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })); car.rotation.z = Math.PI / 2; reloj.add(sombra(c), car); const cor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32), M.correa); cor.rotation.z = Math.PI / 2; reloj.add(cor); reloj.position.set(0.0, 0.0, 0.0); reloj.visible = false; }

/* ------------------------------------------------------------------ poses */
const R = (a) => (a * Math.PI) / 180;
const POSES = {
  // izq = brazo del personaje que aparece a la izquierda de la pantalla (x negativo)
  idle:     { giro: R(-4), cab: [R(2), R(-3), R(-2)], ojos: 'abiertos', mir: [0, 0], ceja: [0, 0], boca: 'sonrisa', izq: { h: [R(6), R(8), R(-9)], c: [R(-14), R(4)], m: 'relajada' }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
  hola:     { giro: R(-4), cab: [R(2), R(-6), R(-6)], ojos: 'feliz', mir: [0, 0], ceja: [6, 0], boca: 'grande', izq: { h: [R(0), R(-10), R(-150)], c: [R(-8), R(-20)], m: 'abierta' }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
  senala:   { giro: R(-10), cab: [R(2), R(14), R(-4)], ojos: 'abiertos', mir: [-0.5, 0], ceja: [2, 0], boca: 'sonrisa', izq: { h: [R(-10), R(15), R(-100)], c: [R(-6), R(-6)], m: 'senala' }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
  piensa:   { giro: R(-6), cab: [R(-6), R(10), R(8)], ojos: 'abiertos', mir: [-0.4, 0.5], ceja: [4, 12], boca: 'preocupado', izq: { h: [R(-70), R(10), R(-12)], c: [R(-125), R(-6)], m: 'relajada' }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
  ok:       { giro: R(-5), cab: [R(2), R(-4), R(-3)], ojos: 'feliz', mir: [0, 0], ceja: [4, 0], boca: 'grande', izq: { h: [R(-35), R(-20), R(-28)], c: [R(-95), R(4)], m: 'pulgar' }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
  victoria: { giro: 0, salto: 0.12, cab: [R(-4), 0, 0], ojos: 'feliz', mir: [0, 0], ceja: [8, 0], boca: 'grande', izq: { h: [0, 0, R(-150)], c: [R(-10), R(-10)], m: 'puno' }, der: { h: [0, 0, R(150)], c: [R(-10), R(10)], m: 'puno' } },
  ups:      { giro: R(4), cab: [R(-4), 0, R(3)], ojos: 'sorpresa', mir: [0, 0], ceja: [16, 0], boca: 'oh', izq: { h: [R(-30), R(-25), R(-62)], c: [R(-100), R(-8)], m: 'abierta' }, der: { h: [R(-30), R(25), R(62)], c: [R(-100), R(8)], m: 'abierta' } },
  apura:    { giro: R(-6), cab: [R(6), R(-8), R(5)], ojos: 'abiertos', mir: [-0.5, -0.2], ceja: [8, -16], boca: 'preocupado', izq: { h: [R(-60), R(10), R(-12)], c: [R(-115), R(-6)], m: 'puno', reloj: true }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
  pista:    { giro: R(-6), cab: [R(2), R(-8), R(-3)], ojos: 'abiertos', mir: [0.4, 0.1], ceja: [6, 4], boca: 'sonrisa', izq: { h: [R(-5), R(8), R(-30)], c: [R(-8), R(-4)], m: 'relajada' }, der: { h: [R(-50), R(-10), R(24)], c: [R(-78), R(-12)], m: 'agarra', pieza: true } },
  derrota:  { giro: R(2), cab: [R(14), 0, R(-6)], ojos: 'medio', mir: [0, -0.5], ceja: [-2, -18], boca: 'triste', izq: { h: [R(6), 0, R(-8)], c: [R(-8), 0], m: 'relajada' }, der: { h: [R(6), 0, R(8)], c: [R(-8), 0], m: 'relajada' }, cae: 0.06 },
  cambio:   { giro: R(-12), cab: [R(2), R(18), R(-3)], ojos: 'abiertos', mir: [-0.6, 0], ceja: [4, 0], boca: 'sonrisa', izq: { h: [R(-12), R(30), R(-95)], c: [R(-5), R(-4)], m: 'senala' }, der: { h: [R(10), R(-8), R(30)], c: [R(-10), R(-95)], m: 'puno', cadera: true } },
};
function poner(nombre) {
  const p = POSES[nombre]; if (!p) return;
  cuerpo.position.y = (p.salto || 0) - (p.cae || 0); cuerpo.rotation.set(0, p.giro || 0, 0);
  cabeza.rotation.set(...p.cab);
  // ojos
  for (const o of ojos) {
    const tipo = p.ojos, abierto = { abiertos: 0.0, sorpresa: -0.18, medio: 0.55, feliz: 1 }[tipo];
    o.parpado.rotation.x = -Math.PI * 0.5 + (tipo === 'feliz' ? 1.55 : 0.4 * (abierto > 0 ? abierto * 1.4 : abierto));
    o.parpado.visible = true; o.parpadoI.visible = tipo === 'feliz'; o.arco.visible = tipo === 'feliz'; o.mirada.visible = tipo !== 'feliz';
    if (tipo === 'feliz') { o.parpado.rotation.x = -0.02; o.parpado.scale.set(0.18, 0.205, 0.132); o.parpado.position.z = 0.012; } else { o.parpado.scale.set(0.176, 0.2, 0.125); o.parpado.position.z = 0.002; }
    o.mirada.position.set(p.mir[0] * 0.05, p.mir[1] * 0.05, 0); o.mirada.scale.setScalar(tipo === 'sorpresa' ? 0.82 : 1);
  }
  for (const c of cejas) { c.grupo.position.y = 0.34 + p.ceja[0] * 0.006; c.grupo.rotation.z = -c.s * R(p.ceja[1]) * 1; }
  construirBoca(p.boca); boca.position.set(0, -0.28, 0.5);
  for (const [lado, b] of [['izq', brazos.izq], ['der', brazos.der]]) {
    const q = p[lado]; b.hombro.rotation.set(...q.h); b.codo.rotation.set(q.c[0], 0, q.c[1]); ponerMano(b, q.m);
    if (q.reloj) { b.muneca.add(reloj); reloj.visible = true; reloj.position.set(0, 0.0, 0); } else if (reloj.parent === b.muneca) { b.muneca.remove(reloj); }
  }
  // estetoscopio: la pieza vuelve a su lugar o la sostiene la mano
  pieza.position.set(0, 0, 0);
  if (p.der.pieza) { const mw = new THREE.Vector3(); brazos.der.mano.getWorldPosition(mw); const loc = torso.worldToLocal(mw.clone()); pieza.position.set(loc.x - 0.22, loc.y - 0.31 - 0.14, loc.z - 0.58 + 0.1); }
  doctor.updateMatrixWorld(true);
}
function dibujar() { renderer.render(escena, camara); }
function renderizar(nombre) { poner(nombre); dibujar(); return renderer.domElement.toDataURL('image/png'); }
async function guardar(nombre) {
  poner(nombre); dibujar();
  const blob = await new Promise((r) => renderer.domElement.toBlob(r, 'image/png'));
  const res = await fetch('http://localhost:5518/guardar?nombre=doctor-' + nombre + '.png', { method: 'POST', body: blob });
  return res.ok ? await res.text() : 'error ' + res.status;
}
window.doctor3d = { poner, dibujar, renderizar, guardar, POSES, escena, camara, renderer, doctor, brazos, cabeza, torso, M };

/* ------------------------------------------------------------------ interfaz */
const cont = $('#poses'); const nombres = Object.keys(POSES);
nombres.forEach((n) => { const b = document.createElement('button'); b.textContent = n; b.onclick = () => { poner(n); dibujar(); cont.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); }; cont.appendChild(b); });
$('#todo').onclick = async () => { for (const n of nombres) { $('#estado').textContent = 'Guardando ' + n + '…'; $('#estado').textContent = n + ': ' + await guardar(n); } $('#estado').textContent += ' · listo'; };
const inicial = (location.hash || '#idle').slice(1); poner(POSES[inicial] ? inicial : 'idle'); dibujar();
$('#estado').textContent = 'Lienzo ' + W + '×' + H + ' · three r' + THREE.REVISION;
