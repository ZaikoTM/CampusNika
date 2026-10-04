// Escenas 3D del área Cirugía (Introducción a las especialidades clínico-quirúrgicas). Todo en cm.
// Cada tipo recibe (visor, ins, cfg, C) y registra en C.inst un objeto { sync(has, raiz), tick(t) } (igual que sim3d.js).
// Reutiliza la mano real (assets/anatomia/manos/mano_real.glb) vía crearMano de sim3d.js.
import * as THREE from 'three';
import { crearMano } from './sim3d.js?v=12';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// carga de modelos reales (Draco) con caché de módulo
const _cache = {}; let _loader = null;
const cargarGLB = (url) => _cache[url] || (_cache[url] = new Promise((ok) => {
  _loader = _loader || new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'));
  _loader.load(url, (g) => ok(g.scene), undefined, () => ok(null));
}));

export const TIPOS = {};
// guante quirúrgico real: eje del modelo (dedos +x, palma -y, pulgar +z) → marco de la mano de sim3d (dedos +z, palma +y, pulgar +x)
function guanteReal(lado, mat0, esc = 0.82, zOff = 7.2) {
  const h = new THREE.Group(); h.matrixAutoUpdate = false;
  const k = esc * 100; const sx = lado < 0 ? -1 : 1;
  h.matrix.set(0, 0, sx * k, 0, 0, -k, 0, 0, k, 0, 0, zOff, 0, 0, 0, 1); h.matrixWorldNeedsUpdate = true;
  cargarGLB('assets/anatomia/cir/guante.glb').then((m) => { if (!m) return; const g = m.clone(true);
    g.traverse((o) => { if (o.isMesh) { const mt = o.material.clone(); mt.map = null; mt.color = new THREE.Color(mat0.color || '#f0dcc0'); mt.roughness = 0.42; mt.metalness = 0; if (mt.clearcoat !== undefined) mt.clearcoat = 0.25; mt.side = lado < 0 ? THREE.DoubleSide : THREE.FrontSide; o.material = mt; o.renderOrder = 9; o.frustumCulled = false; } });
    h.add(g); });
  return h;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeK = (dt, v) => 1 - Math.exp(-dt * v);
const smooth = (t) => t * t * (3 - 2 * t);

// ---------------------------------------------------------------- LAVADO QUIRÚRGICO + COLOCACIÓN DE GUANTES ESTÉRILES
TIPOS.lavado = (visor, ins, cfg, C) => {
  const raiz = new THREE.Group(); C.capas.sonda.add(raiz);
  const mat = (c, o, ex) => visor.material(c, o, 'sonda', Object.assign({ roughness: 0.5, clearcoat: 0.2, depthWrite: true }, ex || {}));
  const mPiel = mat('#e9b89a', 1, { roughness: 0.62, clearcoat: 0.08 });
  const mGuante = mat('#f2e2c6', 1, { roughness: 0.38, clearcoat: 0.55, emissive: 0x6b5a3a, emissiveIntensity: 0.12 });
  const mAcero = mat('#c7d0d8', 1, { roughness: 0.28, clearcoat: 0.5, metalness: 0.5 });
  const mAzulej = mat('#cfe7ef', 1, { roughness: 0.4, clearcoat: 0.3 });
  const mEspuma = mat('#ffffff', 0.92, { roughness: 0.9, clearcoat: 0, emissive: 0xffffff, emissiveIntensity: 0.25 });
  const mAgua = mat('#7dd3fc', 0.55, { roughness: 0.1, clearcoat: 1, emissive: 0x1d6fa5, emissiveIntensity: 0.35, depthWrite: false });
  const mTela = mat('#bae6fd', 1, { roughness: 0.85, clearcoat: 0 });
  const mPapel = mat('#e8f1f5', 1, { roughness: 0.9, clearcoat: 0 });

  // --- reflejos de ambiente (acero, cromo, látex)
  try { const pm = new THREE.PMREMGenerator(C.renderer); C.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; C.scene.environmentIntensity = 0.9; } catch (_) {}
  // --- pared de azulejos con juntas
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#e9f3f6'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#a9c4cc'; g.lineWidth = 5; g.strokeRect(0, 0, 256, 256);
    const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(120,160,175,.12)'); g.fillStyle = gr; g.fillRect(6, 6, 244, 244); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 7.5); t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const pared = new THREE.Mesh(new THREE.PlaneGeometry(100, 75), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2 })); pared.position.set(0, 34, -24); raiz.add(pared);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(100, 70), new THREE.MeshStandardMaterial({ color: '#cdd6dc', roughness: 0.5 })); suelo.rotation.x = -Math.PI / 2; suelo.position.set(0, -42, 10); raiz.add(suelo);
  // --- mesada y pileta de acero inoxidable (con la abertura recortada) + cuerpo del mueble
  const mAcero2 = new THREE.MeshStandardMaterial({ color: '#dfe5ea', metalness: 0.75, roughness: 0.33 });
  const mAceroOsc = new THREE.MeshStandardMaterial({ color: '#c9d1d8', metalness: 0.7, roughness: 0.38, side: THREE.BackSide });
  const sh = new THREE.Shape(); sh.moveTo(-36, -7); sh.lineTo(36, -7); sh.lineTo(36, 27); sh.lineTo(-36, 27); sh.lineTo(-36, -7);
  const hole = new THREE.Path(); const hx = 25, hz = 10, rr = 5, cy = 10; hole.moveTo(-hx + rr, cy - hz); hole.lineTo(hx - rr, cy - hz); hole.quadraticCurveTo(hx, cy - hz, hx, cy - hz + rr); hole.lineTo(hx, cy + hz - rr); hole.quadraticCurveTo(hx, cy + hz, hx - rr, cy + hz); hole.lineTo(-hx + rr, cy + hz); hole.quadraticCurveTo(-hx, cy + hz, -hx, cy + hz - rr); hole.lineTo(-hx, cy - hz + rr); hole.quadraticCurveTo(-hx, cy - hz, -hx + rr, cy - hz); sh.holes.push(hole);
  const mesada = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 2 }), mAcero2); mesada.rotation.x = -Math.PI / 2; mesada.position.set(0, -1, 0); raiz.add(mesada);
  const tina = new THREE.Mesh(new THREE.BoxGeometry(50, 18, 20), mAceroOsc); tina.position.set(0, -7, -10); raiz.add(tina);
  const desague = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), new THREE.MeshStandardMaterial({ color: '#4b5560', metalness: 1, roughness: 0.5 })); desague.rotation.x = -Math.PI / 2; desague.position.set(0, -15.9, -10); raiz.add(desague);
  const mueble = new THREE.Mesh(new THREE.BoxGeometry(70, 40, 1.2), new THREE.MeshStandardMaterial({ color: '#d3dae0', metalness: 0.7, roughness: 0.36 })); mueble.position.set(0, -19, 7.2); raiz.add(mueble);
  const lateralM = new THREE.Mesh(new THREE.BoxGeometry(1.2, 40, 34), new THREE.MeshStandardMaterial({ color: '#c6cdd4', metalness: 0.7, roughness: 0.38 })); [-35.4, 35.4].forEach((x) => { const l = lateralM.clone(); l.position.set(x, -19, -10); raiz.add(l); });
  // --- canilla real (cuello de cisne, cromada): se rota para que el pico apunte hacia el frente
  const cano = new THREE.Group(); cano.position.set(0, 2, -21); raiz.add(cano); const palanca = { rotation: { x: 0 } };
  const pico = V(0, 31, -7);
  cargarGLB('assets/anatomia/cir/canilla.glb').then((m) => { if (!m) return; const f = m.clone(true); f.scale.setScalar(100);
    f.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshStandardMaterial({ color: '#e8edf1', metalness: 1, roughness: 0.16 }); });
    f.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(f); let tx = bb.max.x, ty = bb.max.y, tz = 0, best = -1e9, bsx = 0, bn = 0;
    f.traverse((o) => { if (o.isMesh) { const pos = o.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { const v = V(pos.getX(i), pos.getY(i), pos.getZ(i)).multiplyScalar(100);
      if (v.y > bb.min.y + (bb.max.y - bb.min.y) * 0.55 && v.x > best) { best = v.x; tx = v.x; ty = v.y; tz = v.z; } if (v.y < bb.min.y + 3) { bsx += v.x; bn++; } } } });
    const bxm = bn ? bsx / bn : bb.min.x; f.rotation.y = -Math.PI / 2; const holder = new THREE.Group(); holder.add(f); cano.add(holder);
    holder.position.set(tz, -bb.min.y, -bxm);           // pico centrado en x=0 y poste apoyado en la mesada
    pico.set(0, 2 + (ty - bb.min.y) - 0.8, -21 + (tx - bxm)); });
  // chorro de agua
  const chorro = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 1, 12, 1, true), mAgua); chorro.position.set(0, 15, -7); chorro.visible = false; chorro.renderOrder = 6; raiz.add(chorro);
  const gotas = []; for (let i = 0; i < 26; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mAgua); g.visible = false; g.renderOrder = 6; raiz.add(g); gotas.push({ m: g, ph: Math.random() * 6.28, v: 6 + Math.random() * 6 }); }
  // dosificador de jabón + cepillo + limpiauñas
  const dosif = new THREE.Group(); dosif.position.set(-29, 2.2, -14); raiz.add(dosif);
  cargarGLB('assets/anatomia/cir/dosificador.glb').then((m) => { if (!m) return; const d = m.clone(true); d.scale.setScalar(100); d.rotation.y = 0.6; d.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshPhysicalMaterial({ color: '#1f2933', roughness: 0.28, clearcoat: 0.7, metalness: 0.1 }); }); dosif.add(d); });
  const cepillo = new THREE.Group(); cepillo.visible = false; raiz.add(cepillo);
  cepillo.add(new THREE.Mesh(new THREE.BoxGeometry(7, 1.6, 2.4), mat('#38bdf8', 1)));
  const cerdas = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.1, 2), mat('#f8fafc', 1, { roughness: 1, clearcoat: 0 })); cerdas.position.y = -1.3; cepillo.add(cerdas);
  const palito = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 6, 8), mat('#fde68a', 1)); palito.visible = false; raiz.add(palito);

  // --- brazos: antebrazo + mano real (palma hacia el eje)
  const manos = [1, -1].map((lado) => {
    const g = new THREE.Group(); raiz.add(g);
    const mano = crearMano(mPiel, lado); g.add(mano);
    const ante = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 2.35, 24, 24), mPiel); ante.rotation.x = Math.PI / 2; ante.position.set(0, 0, -15.4); g.add(ante);
    const codo = new THREE.Mesh(new THREE.SphereGeometry(3.3, 18, 14), mPiel); codo.position.set(0, 0, -27.4); g.add(codo);
    const manga = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.9, 14, 26), mat('#38bdf8', 1, { roughness: 0.8, clearcoat: 0 })); manga.rotation.x = Math.PI / 2; manga.position.set(0, 0, -26); g.add(manga);
    // anillos, pulsera y reloj (se quitan en el paso 2)
    const joyas = new THREE.Group(); g.add(joyas);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.2, 8, 20), mat('#facc15', 1, { metalness: 0.8, roughness: 0.2 })); anillo.position.set(-0.9 * lado, 0.6, 9.5); anillo.rotation.x = Math.PI / 2; joyas.add(anillo);
    const reloj = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.1, 22), mat('#1e293b', 1, { roughness: 0.3 })); reloj.position.set(0, 0, -6.2); reloj.rotation.z = Math.PI / 2; joyas.add(reloj);
    const pulsera = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.3, 8, 28), mat('#e11d48', 1)); pulsera.position.set(0, 0, -9); joyas.add(pulsera);
    // espuma: esferas sobre la mano y el antebrazo, ordenadas de distal a proximal
    const esp = []; const eg = new THREE.Group(); g.add(eg);
    const N = 150; for (let i = 0; i < N; i++) {
      const t = i / (N - 1); // 0 = punta de dedos, 1 = codo
      const z = lerp(14, -27, t); const ang = Math.random() * 6.28; const r = (z > 0 ? 2.6 : z > -3 ? 3.6 : lerp(3.4, 4.9, clamp((-z - 3) / 24, 0, 1))) + 0.25;
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.55 + Math.random() * 0.45, 8, 6), mEspuma); s.position.set(Math.cos(ang) * (z > 0 ? r * 1.8 : r), Math.sin(ang) * r * (z > 0 ? 0.55 : 1), z); s.visible = false; s.renderOrder = 5; eg.add(s); esp.push({ m: s, t, base: s.scale.x });
    }
    const aro = new THREE.Mesh(new THREE.TorusGeometry(5.3, 0.22, 8, 36), mat('#22d3ee', 0.95, { emissive: 0x22d3ee, emissiveIntensity: 0.9, depthWrite: false })); aro.rotation.y = Math.PI / 2; aro.visible = false; aro.renderOrder = 7; g.add(aro);
    const doblez = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.55, 8, 24), mGuante); doblez.position.z = -5; doblez.visible = false; g.add(doblez);
    const gl = guanteReal(lado, { color: '#f0dcc0' }, 0.82, 7.2); gl.visible = false; g.add(gl);
    const M = { lado, g, mano, ante, codo, joyas, esp, aro, doblez, gl, guante: 0, glove: false, rh: null };
    // antebrazo y mano reales (first person hands): lado 1 = izquierda (pulgar +x), lado -1 = derecha
    cargarGLB('assets/anatomia/cir/brazos.glb').then((root) => { if (!root) return; const L = lado > 0 ? 'L' : 'R'; let mh = null, an = null;
      root.traverse((o) => { if (o.name === 'Mano' + L) mh = o; if (o.name === 'Ante' + L) an = o; });
      const piel = new THREE.MeshPhysicalMaterial({ color: '#e7b496', roughness: 0.55, clearcoat: 0.12, clearcoatRoughness: 0.5 });
      [mh, an].forEach((o) => { if (!o) return; const c = o.clone(); c.scale.setScalar(100); c.material = piel; c.renderOrder = 8; c.frustumCulled = false; g.add(c); if (o === mh) M.rh = c; });
      if (M.rh) { mano.visible = false; ante.visible = false; codo.visible = false; M.mano0 = mano; } });
    return M;
  });
  const [mR, mL] = manos;

  // --- guantes estériles: paquete con solapas sobre una mesita lateral + par de guantes
  const mesa = new THREE.Mesh(new THREE.BoxGeometry(26, 2, 20), mat('#94a3b8', 1, { roughness: 0.3 })); mesa.position.set(0, 12, 20); mesa.visible = false; raiz.add(mesa);
  const paq = new THREE.Group(); paq.position.set(0, 13.2, 20); paq.visible = false; raiz.add(paq);
  const base = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 14), mPapel); paq.add(base);
  const solapaI = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 14), mPapel); solapaI.geometry.translate(4.5, 0, 0); solapaI.position.set(-9, 0.3, 0); paq.add(solapaI);
  const solapaD = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 14), mPapel); solapaD.geometry.translate(-4.5, 0, 0); solapaD.position.set(9, 0.3, 0); paq.add(solapaD);
  const par = [1, -1].map((l) => { const gm = new THREE.Group(); gm.add(guanteReal(l, { color: '#f0dcc0' }, 0.5, 0)); gm.position.set(l * 5.5, 0.9, -5); gm.rotation.set(0, l < 0 ? 0.2 : -0.2, 0); gm.visible = false; paq.add(gm); return gm; });

  // --- HUD: vestimenta, cronómetro, indicaciones
  const hud = document.createElement('div'); hud.className = 'cir-hud lav';
  hud.innerHTML = `<div class="cir-vest"><b>Vestimenta</b><span data-v="ambo">👕 Ambo</span><span data-v="gorro">🧢 Gorro</span><span data-v="barbijo">😷 Barbijo</span><span data-v="botas">🥾 Botas</span></div>
    <div class="cir-reloj" data-on="0"><small>⏱ LAVADO QUIRÚRGICO</small><b>0:00</b><i><u></u></i><em>mínimo 3 min · máximo 5 min</em></div>
    <div class="cir-nota" data-on="0"></div>`;
  C.vp.appendChild(hud); const hv = hud.querySelectorAll('.cir-vest span'); const hr = hud.querySelector('.cir-reloj'); const hnota = hud.querySelector('.cir-nota');
  const nota = (t) => { if (hnota.textContent !== t) { hnota.textContent = t; hnota.dataset.on = t ? '1' : '0'; } };

  // --- estado
  const ent = { tipo: 'lavado', st: {}, cat: { goal: 0 } }; let has = () => false; let cov = [0, 0], covObj = [0, 0]; let tiempo = 0, wet = 0, prog = { toalla: 0, g1: 0, g2: 0, est1: 0, est2: 0, abre: 0, alto: 0, codo: 0, cierra: 0, acc: 0 };
  let ultimoT = 0, cap = null; const toalla = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 9), mTela); toalla.visible = false; raiz.add(toalla);
  ent.sync = (h, r) => { has = h; ent.raiz = r || ent.raiz; ent.has = h; };
  const _m4 = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
  const poneBrazo = (m, x, y, z, a) => {
    // dedos hacia arriba y adelante con elevación 'a', antebrazo hacia atrás/abajo (codo cerca del lavabo), palmas enfrentadas
    m.g.position.set(x, y, z); const sn = Math.sin(a), cs = Math.cos(a);
    _z.set(0, sn, -cs); _x.set(0, m.lado > 0 ? cs : -cs, m.lado > 0 ? sn : -sn); _y.crossVectors(_z, _x).normalize();
    _m4.makeBasis(_x, _y, _z); m.g.quaternion.setFromRotationMatrix(_m4);
  };

  ent.tick = (t) => {
    const dt = Math.min(0.05, (t - ultimoT) / 1000 || 0.016); ultimoT = t; const k = easeK(dt, 3.2);
    const s = (n) => has('s-' + n);
    // vestimenta
    hv.forEach((e) => e.classList.toggle('on', s('vest')));
    // fases del lavado
    const faseLav = s('lav3') ? 3 : s('lav2') ? 2 : (s('lav1') || s('antebr')) ? 1 : 0;
    const agua = s('canilla') && !s('cierra');
    chorro.visible = agua; palanca.rotation.x = lerp(palanca.rotation.x, agua ? -0.5 : 0, k);
    const Hch = Math.max(4, pico.y + 14); chorro.scale.y = Hch; chorro.position.set(pico.x, pico.y - Hch / 2, pico.z);
    chorro.scale.x = chorro.scale.z = 0.85 + 0.15 * Math.sin(t / 60); chorro.material.opacity = 0.45 + 0.15 * Math.sin(t / 90);
    gotas.forEach((g, i) => { g.m.visible = agua; if (!agua) return; const y = ((t / 1000) * g.v + g.ph * 3) % Hch; g.m.position.set(pico.x + Math.cos(g.ph + i) * 0.7 * (y / Hch + 0.3), pico.y - y, pico.z + Math.sin(g.ph + i) * 0.5); g.m.scale.setScalar(0.7 + 0.5 * Math.sin(t / 130 + i)); });
    // joyas
    prog.acc = lerp(prog.acc, s('acc') ? 1 : 0, easeK(dt, 2.4));
    manos.forEach((m) => { m.joyas.visible = prog.acc < 0.98; m.joyas.position.y = prog.acc * 22; m.joyas.scale.setScalar(1 - prog.acc * 0.9); });
    // postura de los brazos: lavado (horizontal sobre el lavabo) vs manos en alto
    prog.alto = lerp(prog.alto, s('alto') ? 1 : 0, easeK(dt, 2.2)); prog.codo = lerp(prog.codo, s('cierra') ? 1 : 0, easeK(dt, 3));
    const sec = s('seca'); const guantes = s('paq');
    const yMano = lerp(23, 27, prog.alto), zMano = lerp(2, 5, prog.alto), ang = lerp(0.62, 0.95, prog.alto);
    let shake = 0; if (faseLav && !s('enj1') && !s('alto')) shake = Math.sin(t / 130) * 1.2;
    poneBrazo(mR, -4.2 - shake * 0.2, yMano + Math.abs(shake) * 0.3, zMano, ang); poneBrazo(mL, 4.2 + shake * 0.2, yMano + Math.abs(shake) * 0.3, zMano, ang);
    if (prog.codo > 0.02) { mL.g.position.x += prog.codo * 3; mL.g.position.y -= prog.codo * 3; } // el codo baja a empujar la palanca
    // pose de dedos
    manos.forEach((m) => { const pose = (faseLav && !s('alto')) ? 'garra' : 'suave'; m.mano.pose(pose, pose === 'garra' ? 0.35 + 0.25 * Math.sin(t / 200) : 0.5); });
    // espuma: cobertura objetivo
    const objetivo = !s('jabon') ? 0 : (s('lav3') ? 0.38 : s('lav2') ? 0.82 : s('antebr') ? 1 : s('lav1') ? 0.28 : 0.05);
    if (faseLav !== ent.fl) { ent.fl = faseLav; ent.tf = t; } const loc = (t - (ent.tf || t)) / 1000;
    const enj = faseLav === 1 ? (s('enj1') || s('alto')) : faseLav >= 2 ? (loc > 3.6 || s('alto')) : s('alto');
    const tgt = enj ? 0 : objetivo; manos.forEach((m, i) => { cov[i] = lerp(cov[i], tgt, easeK(dt, enj ? 0.9 : 1.1)); m.esp.forEach((e) => { const on = e.t <= cov[i] + 0.001 && cov[i] > 0.02; e.m.visible = on; if (on) { const q = clamp((cov[i] - e.t) * 6, 0, 1); e.m.scale.setScalar(e.base * (0.6 + 0.4 * q) * (1 + 0.08 * Math.sin(t / 150 + e.t * 40))); } }); });
    // aro guía (hasta dónde se lava)
    manos.forEach((m) => { m.aro.visible = faseLav > 0 && !enj && !s('alto'); const zz = faseLav === 1 ? -27.4 + 2.5 : faseLav === 2 ? -27.4 - 3 : -3; m.aro.position.z = lerp(m.aro.position.z, zz, k); });
    // cepillo y limpiauñas
    cepillo.visible = s('jabon') && !s('alto') && (faseLav >= 1 || s('unas') === false); const brushOn = faseLav > 0 && !enj;
    cepillo.visible = s('jabon') && !s('alto') && !s('seca');
    if (cepillo.visible) { const tt = t / 1000; const z0 = brushOn ? lerp(10, -22, (Math.sin(tt * 2.2) * 0.5 + 0.5)) : 8; const wp = V(-4.2 * (Math.floor(tt / 3) % 2 ? -1 : 1) * (brushOn ? 1 : 0.6), yMano + 5 + (10 - z0) * 0.25, zMano - 4 - z0 * 0.3); cepillo.position.lerp(wp, k * 1.5); cepillo.rotation.set(0.3, 0, Math.sin(tt * 9) * 0.25); }
    palito.visible = s('unas') && !s('lav1'); if (palito.visible) palito.position.set(mR.g.position.x + 1.5, yMano + 15 + Math.sin(t / 120) * 0.5, zMano - 12 - Math.sin(t / 220) * 0.8), palito.rotation.set(1.2, 0, 0.3);
    // cronómetro de la fase de lavado
    const durMs = { 0: 0, 1: 7000, 2: 7000, 3: 7000 }; if (faseLav && !s('alto')) tiempo = Math.min(300, tiempo + dt * (180 / 21)); else if (!faseLav) tiempo = 0;
    hr.dataset.on = (faseLav && !s('seca')) ? '1' : '0'; const seg = Math.round(tiempo); hr.querySelector('b').textContent = `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`; hr.querySelector('u').style.width = `${(tiempo / 300) * 100}%`; hr.classList.toggle('ok', tiempo >= 180);
    // toalla estéril: de los dedos al codo, una sola dirección
    prog.toalla = lerp(prog.toalla, sec ? 1 : 0, easeK(dt, 0.7)); toalla.visible = sec && !guantes;
    if (toalla.visible) { const q = (t / 1700) % 1; const z = lerp(8, -18, q); toalla.position.set(mR.g.position.x + 2.2, mR.g.position.y + 8 + (8 - z) * 0.45, mR.g.position.z - 3 - (8 - z) * 0.3); toalla.rotation.set(0.9, 0, 0); }
    // paquete y guantes
    mesa.visible = paq.visible = s('paq') || s('abre'); prog.abre = lerp(prog.abre, s('abre') ? 1 : 0, easeK(dt, 2.5));
    solapaI.rotation.z = -prog.abre * 2.7; solapaD.rotation.z = prog.abre * 2.7; par.forEach((gm) => { gm.visible = prog.abre > 0.5; });
    // colocación: 1.º guante en la mano derecha, 2.º en la izquierda, estiramientos
    manos.forEach((m, i) => { const puesto = i === 0 ? s('g1') : s('g2a'); m.glove = puesto; m.gl.visible = puesto; if (m.rh) m.rh.visible = !puesto; else m.mano.visible = !puesto; });
    // los guantes del paquete desaparecen al usarlos
    par[0].visible = prog.abre > 0.5 && !s('g1'); par[1].visible = prog.abre > 0.5 && !s('g2a');
    // movimiento hacia el paquete al ponerse los guantes
    if (guantes) { const fase = s('g2a') ? 2 : s('g1') ? 1 : 0; const wob = Math.sin(t / 260) * 0.4;
      poneBrazo(mR, -9 + wob, 19, 17, 0.25); poneBrazo(mL, 9 - wob + (fase >= 1 ? 0 : 0), 19 + (fase === 0 ? 3 : 0), 17, 0.25); }
    prog.est1 = lerp(prog.est1, s('est1') ? 1 : 0, easeK(dt, 3)); prog.est2 = lerp(prog.est2, s('est2') ? 1 : 0, easeK(dt, 3));
    mR.doblez.visible = s('g1') && !s('est1'); mL.doblez.visible = s('g2a') && !s('est2');
    if (s('est1')) mR.ante.scale.set(1.03, 1, 1.03); if (s('est2')) mL.ante.scale.set(1.03, 1, 1.03);
    // indicaciones
    nota(s('est1') ? 'Guantes colocados y estirados por completo' : s('g2a') ? 'Segundo guante: sin tocar el exterior del primero' : s('g1') ? 'Primer guante: tomado por la zona doblada' : s('abre') ? 'Sólo se toca el doblez interno del guante' : s('seca') ? 'Compresa estéril: de los dedos al codo, sin volver atrás' : s('cierra') ? 'Canilla cerrada con el codo' : s('alto') ? 'Manos por encima de los codos y fuera del ambo' : '');
    // cámara ligera hacia el paquete en los pasos de guantes
    if (C.controls && guantes && !ent._cam) { ent._cam = 1; } if (!guantes) ent._cam = 0;
  };
  C.inst.push(ent);
};
