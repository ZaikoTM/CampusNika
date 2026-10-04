// Escenas 3D del área SIM (Salud Integral de la Mujer): panza embarazada con feto, manos, cinta obstétrica, estetoscopio de Pinard,
// espéculo, citología, tacto bimanual y examen mamario. Todo en cm, marco del modelo (x lateral, y arriba, z anterior).
// Cada tipo recibe (visor, ins, cfg, C) y registra en C.inst un objeto { sync(has, raiz), tick(t) } (igual que los instrumentos de visor3d.js).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const TIPOS = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeK = (dt, v) => 1 - Math.exp(-dt * v);

// ---------------------------------------------------------------- perfil sagital del abdomen (x ≈ 0): [y (cm), frente z (cm), espalda z (cm)]
const PERFIL = [[-11, -6.42, -8.64], [-8, -5.99, -10.43], [-6, -3.86, -12.68], [-4, -1.05, -16.21], [-2, 0.57, -18.2], [0, 1.4, -19], [2, 2.06, -19.49], [4, 2.91, -19.71], [6, 4.16, -19.62], [8, 5.47, -19.47],
  [10, 6.43, -18.98], [12, 7.14, -18.55], [14, 7.72, -17.97], [16, 8.18, -17.18], [18, 8.4, -16.65], [20, 9.09, -16.32], [22, 9.31, -16.29], [24, 9.28, -16.47], [26, 8.98, -16.76], [28, 8.38, -17.09], [30, 7.64, -17.38],
  [32, 7.02, -17.72], [34, 6.64, -18.11], [36, 6.28, -18.42], [38, 5.95, -18.66], [40, 5.58, -19.02], [42, 5.21, -19.46], [44, 4.79, -19.67], [46, 4.39, -19.74], [48, 3.79, -19.73], [50, 2.95, -19.65], [52, 1.66, -19.47], [54, 0.32, -19.25], [56, -0.68, -18.83], [58, -1.52, -18.41], [60, -1.42, -17.47]];
const interp = (arr, y, k) => { if (y <= arr[0][0]) return arr[0][k]; for (let i = 1; i < arr.length; i++) if (y <= arr[i][0]) { const t = (y - arr[i - 1][0]) / (arr[i][0] - arr[i - 1][0]); return lerp(arr[i - 1][k], arr[i][k], t); } return arr[arr.length - 1][k]; };
export const GRAV = { A: 17, Z0: 14, SZ: 19, SX: 15, SINFISIS: 0.6, PUBIS_Z: -0.8 };      // morph 'gravida' del torso y referencias óseas
const gaus = (y) => Math.exp(-(((y - GRAV.Z0) / GRAV.SZ) ** 2));
export const vEG = (eg) => clamp((eg - 8) / 32, 0, 1) ** 1.1;                          // influencia del morph según la edad gestacional (semanas)
export const frente = (y, v) => interp(PERFIL, y, 1) + GRAV.A * v * gaus(y);              // z de la piel en la línea media
export const espalda = (y) => interp(PERFIL, y, 2);
const dFrente = (y, v) => (frente(y + 0.5, v) - frente(y - 0.5, v));
// altura uterina (cm, medida sobre la piel desde el borde superior del pubis) → y del fondo
export function yDeAU(au, v) { let s = 0, y = GRAV.SINFISIS; while (s < au && y < 58) { const dy = 0.25; const dz = frente(y + dy, v) - frente(y, v); s += Math.hypot(dy, dz); y += dy; } return y; }
export const CRL = (eg) => { const T = [[8, 1.6], [12, 6], [16, 12], [20, 16], [24, 21], [28, 25], [32, 29], [36, 33], [40, 36]]; if (eg <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (eg <= T[i][0]) return lerp(T[i - 1][1], T[i][1], (eg - T[i - 1][0]) / (T[i][0] - T[i - 1][0])); return 37; };
export const AUdeEG = (eg) => (eg < 12 ? 0 : eg < 20 ? (eg - 12) * 1.4 : Math.min(eg + 0.5, 41));

export function anclar(C, cfg, id, v) { if (!C.anclas || !C.rotg) return; C.anclas[id] = v.clone().sub(V(...cfg.origen)).applyEuler(C.rotg.rotation); }
// ---------------------------------------------------------------- mano con guante (palma + 5 dedos articulados)
export function crearMano(mat, lado = 1) {
  const g = new THREE.Group(); const hold = new THREE.Group(); g.add(hold);
  const palma = new THREE.Mesh(new RoundedBoxGeometry(8.0, 1.9, 8.4, 4, 0.8), mat); palma.position.set(0, 0, 4.2); hold.add(palma);
  const muneca = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.3, 2.6, 18), mat); muneca.rotation.x = Math.PI / 2; muneca.position.set(0, 0, -1.4); hold.add(muneca);
  const dedos = [];
  const largos = [[6.2, 3.4, 2.6], [6.9, 3.8, 2.8], [6.4, 3.5, 2.6], [5.2, 2.8, 2.2]]; const xs = [-2.8, -0.9, 1.0, 2.8];
  largos.forEach((L, i) => {
    const raiz = new THREE.Group(); raiz.position.set(xs[i] * lado, 0, 8.3); hold.add(raiz); const segs = [];
    let padre = raiz;
    L.forEach((len, j) => {
      const art = new THREE.Group(); if (j > 0) art.position.z = L[j - 1]; padre.add(art);
      const dd = new THREE.Mesh(new THREE.CapsuleGeometry(0.82 - j * 0.07, len - 1.6, 5, 10), mat); dd.rotation.x = Math.PI / 2; dd.position.z = len / 2 - 0.2; art.add(dd); segs.push(art); padre = art;
    });
    dedos.push(segs);
  });
  const pulgarRaiz = new THREE.Group(); pulgarRaiz.position.set(4.0 * lado, -0.2, 3.0); hold.add(pulgarRaiz); pulgarRaiz.rotation.y = 0.5 * lado; const pulgar = [];
  [4.2, 3.6].forEach((len, j) => { const art = new THREE.Group(); if (j > 0) art.position.z = 4.2; (j ? pulgar[0] : pulgarRaiz).add(art); const dd = new THREE.Mesh(new THREE.CapsuleGeometry(0.95 - j * 0.1, len - 1.8, 5, 10), mat); dd.rotation.x = Math.PI / 2; dd.position.z = len / 2 - 0.2; art.add(dd); pulgar.push(art); });
  // poses: ángulos de flexión (rad) por falange; rotación del pulgar
  const POSES = {
    plana: { d: [0, 0, 0], p: 0, pa: 0 },
    garra: { d: [0.5, 0.75, 0.5], p: 0.2, pa: 0.15 },
    suave: { d: [0.12, 0.2, 0.12], p: 0, pa: 0.05 },
    pinza: { d: [0.9, 1.0, 0.7], p: -0.2, pa: -0.5 },
    puño: { d: [1.3, 1.5, 1.0], p: 0.4, pa: 0.3 },
    apunta: { d: [0.0, 0.1, 0.1], p: 0.2, pa: 0.4, otros: 1.4 },
  };
  g.pose = (nombre, k = 1) => {
    const P = POSES[nombre] || POSES.plana;
    dedos.forEach((segs, i) => { const extra = P.otros && i > 0 ? P.otros : 0; segs.forEach((s, j) => { const base = (extra || P.d[j]) * k; s.rotation.x = -base; }); });
    pulgar.forEach((s, j) => { s.rotation.x = -(P.p * (j + 1) * 0.6) * k; }); pulgarRaiz.rotation.y = (0.5 + P.pa) * lado * (k === 1 ? 1 : 1);
  };
  g.pose('plana');
  g.userData.hold = hold;
  return g;
}

// ---------------------------------------------------------------- GRAVIDA: útero gestante + feto + placenta + cordón, según la EG del caso
TIPOS.gravida = (visor, ins, cfg, C) => {
  const mat = (c, o, ex) => visor.material(c, o, 'organos', Object.assign({ roughness: 0.45, clearcoat: 0.4 }, ex || {}));
  const mUt = mat('#e58aa0', 0.34, { emissive: 0x7a2e45, emissiveIntensity: 0.12 });
  const ut = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mUt); ut.renderOrder = 3; C.capas.organos.add(ut);
  const rootF = new THREE.Group(); C.capas.organos.add(rootF);
  const mFeto = mat('#f0b8a2', 0.96, { emissive: 0x7a4a3a, emissiveIntensity: 0.16, depthWrite: true, roughness: 0.55 });
  const feto = new THREE.Group(); rootF.add(feto); const fetoPivot = new THREE.Group(); feto.add(fetoPivot);
  const mPl = mat('#b04a52', 0.9, { emissive: 0x5e1d25, emissiveIntensity: 0.15, depthWrite: true });
  const pl = new THREE.Group(); C.capas.organos.add(pl);
  const cord = new THREE.Mesh(new THREE.BufferGeometry(), mat('#e9d9c9', 0.95, { depthWrite: true })); C.capas.organos.add(cord);
  const marca = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.16, 8, 32), mat('#34d399', 0.95, { emissive: 0x10b981, emissiveIntensity: 0.9 })); marca.visible = false; marca.renderOrder = 8; C.capas.sonda.add(marca);
  let cargado = { feto: null, pl: null };
  const cargar = (src, cb) => { import('three/addons/loaders/GLTFLoader.js').then(async ({ GLTFLoader }) => { const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js'); const ld = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/')); ld.load(src, (gl) => cb(gl.scene)); }); };
  cargar(ins.feto || 'assets/anatomia/sim/feto.glb', (s) => { s.traverse((m) => { if (m.isMesh) { m.material = mFeto; m.renderOrder = 4; } }); s.scale.setScalar(100); fetoPivot.add(s); s.position.set(0, -17, 0); cargado.feto = s; });
  cargar(ins.placenta || 'assets/anatomia/sim/placenta.glb', (s) => { s.traverse((m) => { if (m.isMesh) { m.material = mPl; m.renderOrder = 4; } }); s.scale.setScalar(100); pl.add(s); cargado.pl = s; });
  const ent = { tipo: 'gravida', st: {}, cat: { goal: 0 }, eg: 0, geo: null, torsoMesh: null };
  ent.sync = (has, raiz) => { ent.raiz = raiz || ent.raiz; ent.st = { au: has('s-au'), fondo: has('s-fondo'), l1: has('s-l1'), l2: has('s-l2'), l3: has('s-l3'), l4: has('s-l4'), egm: has('s-egm'), eg: has('s-eg') }; };
  // geometría derivada de la EG, expuesta para las demás instrumentos (mano, cinta, Pinard)
  const calc = (eg, caso) => {
    const v = vEG(eg); const au = AUdeEG(eg); const yF = eg < 12 ? 2.5 : yDeAU(au, v); const yBajo = -1.5;
    const fondo = frente(yF, v); const ayy = Math.max(2.2, (yF - 1.2 - yBajo) / 2); const yc = yBajo + ayy;
    const ax = Math.max(2.4, Math.min(13, ayy * 0.84)); const frontC = frente(yc, v) - 1.6;
    let azz = Math.min(Math.max(2, frontC - espalda(yc) - 7), ax * 0.82); const zc = frontC - azz;
    return { v, au, yF, yc, ayy, ax, azz, zc, fondo, frontC };
  };
  ent.geo = (eg) => calc(eg);
  const dir = { x: 0, y: 0 };
  ent.tick = (t) => {
    const caso = (ent.raiz && ent.raiz.__caso) || {}; const eg = caso.eg != null ? caso.eg : (ins.eg_defecto || 36);
    if (!ent.raiz) return;
    if (!ent.torsoMesh) { C.capas.piel.traverse((m) => { if (m.isMesh && m.morphTargetInfluences && m.morphTargetInfluences.length) ent.torsoMesh = m; }); }
    const G = calc(eg); ent.G = G; ent.eg = eg;
    if (ent.torsoMesh) ent.torsoMesh.morphTargetInfluences[0] = G.v;
    ut.position.set(-0.4, G.yc, G.zc); ut.scale.set(G.ax, G.ayy, G.azz); ut.visible = eg >= 6;
    { const dim = !!ent.dim; mFeto.opacity += ((dim ? 0.2 : 0.88) - mFeto.opacity) * 0.12; mUt.opacity += ((dim ? 0.1 : 0.28) - mUt.opacity) * 0.12; mFeto.userData.base = mFeto.opacity; mUt.userData.base = mUt.opacity; }
    // feto: tamaño por EG, posición y actitud según el caso
    const sc = CRL(eg) / 34.4; const pres = caso.presentacion || 'cefalica'; const dorso = caso.dorso === 'der' ? 1 : -1;
    feto.position.set(-0.4, G.yc, G.zc); feto.scale.setScalar(Math.min(sc, 1.2));
    let rx = 0, ry = 0, rz = 0;
    if (pres === 'cefalica') { rz = Math.PI; } else if (pres === 'transversa') { rz = Math.PI / 2 * dorso; }
    ry = caso.dorso === 'izq' ? 0.9 : caso.dorso === 'der' ? -0.9 : 0.4;   // el dorso mira a la izquierda (+x) o a la derecha (−x) de la madre
    fetoPivot.rotation.set(rx, 0, rz); feto.rotation.set(0, ry, 0);
    const holgura = Math.min(1, (G.azz * 2) / (34.4 * sc * 0.55)); if (holgura < 1) feto.scale.multiplyScalar(0.92 + 0.08 * holgura);
    feto.visible = eg >= 8 && (!!cargado.feto);
    // latido fetal visible (leve pulso) cuando se ausculta
    const lat = ent.st && ent.st.l3 ? 0 : 0;
    const bpm = caso.fcf || 140; const pulso = 1 + 0.012 * Math.sin(t / 1000 * Math.PI * 2 * bpm / 60);
    feto.scale.multiplyScalar(pulso);
    // placenta: pared posterior / fúndica; cordón hasta el ombligo fetal
    const escP = clamp(eg / 40, 0.25, 1) * 0.9; pl.scale.setScalar(escP); pl.position.set(-0.4 + (caso.placenta === 'lateral' ? 5 : 0), G.yc + G.ayy * 0.35, G.zc - G.azz * 0.82); pl.rotation.set(0, 0, 0);
    pl.visible = eg >= 12 && !!cargado.pl;
    const p0 = V(-0.4, G.yc, G.zc - G.azz * 0.55), p1 = V(-0.4 + 3, G.yc - 2, G.zc - G.azz * 0.2), p2 = V(-0.4 + 1, G.yc + 1, G.zc - G.azz * 0.7), p3 = V(-0.4, G.yc + G.ayy * 0.3, G.zc - G.azz * 0.8);
    if (!ent.cordGeo || ent.cordEg !== Math.round(eg)) { const cur = new THREE.CatmullRomCurve3([p3, p2, p1, p0]); const gg = new THREE.TubeGeometry(cur, 24, Math.max(0.2, 0.55 * sc), 8, false); cord.geometry.dispose(); cord.geometry = gg; ent.cordGeo = gg; ent.cordEg = Math.round(eg); }
    cord.visible = eg >= 14;
    anclar(C, cfg, 'fondo', V(0, G.yF, G.fondo + 0.3)); anclar(C, cfg, 'ombligo', V(0, 19, frente(19, G.v) + 0.2));
    marca.visible = !!ent.st.fondo; if (marca.visible) { marca.position.set(0, G.yF + 0.2, G.fondo + 0.3); marca.rotation.x = Math.PI / 2 - Math.atan(dFrente(G.yF, G.v)) ; marca.scale.setScalar(1 + 0.15 * Math.sin(t / 220)); }
  };
  C.gravida = ent;
  C.inst.push(ent);
};

// ---------------------------------------------------------------- superficie del abdomen gestante (para apoyar manos, Pinard y cinta)
export function superficie(G, x, y) {
  const fr = frente(y, G.v); const tt = (y - G.yc) / G.ayy; const hy = Math.max(0, 1 - tt * tt);
  const W = Math.max(5, (G.ax + 1.8) * Math.sqrt(hy) + 5 * (1 - Math.sqrt(hy)));       // semiancho de la sección del abdomen
  const prof = Math.max(3.5, G.azz * 2 * Math.sqrt(hy) + 3);                              // profundidad desde el frente
  const u = clamp(Math.abs(x) / W, 0, 0.995);
  return fr - prof * (1 - Math.sqrt(1 - u * u));
}
export function normalEn(G, x, y) {
  const e = 0.4; const dx = (superficie(G, x + e, y) - superficie(G, x - e, y)) / (2 * e); const dy = (superficie(G, x, y + e) - superficie(G, x, y - e)) / (2 * e);
  return V(-dx, -dy, 1).normalize();
}
// apoya una mano: palma hacia el cuerpo, dedos hacia 'dedos' (vector del mundo), con giro 'roll' alrededor del eje de los dedos
export function colocarMano(mano, G, x, y, dedos, hover = 0.5, roll = 0) {
  const p = V(x, y, superficie(G, x, y)); const n = normalEn(G, x, y);
  const f = dedos.clone().sub(n.clone().multiplyScalar(dedos.dot(n))).normalize();
  const yA = n.clone().negate(); const xA = new THREE.Vector3().crossVectors(yA, f).normalize(); const m = new THREE.Matrix4().makeBasis(xA, yA, f);
  mano.quaternion.setFromRotationMatrix(m); if (roll) mano.rotateZ(roll);
  mano.position.copy(p).addScaledVector(n, hover);
}
const textura = (fn, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };

// ---------------------------------------------------------------- OBS: examen obstétrico (altura uterina, Leopold, Pinard, curva de AU)
TIPOS.obs = (visor, ins, cfg, C) => {
  const mG = visor.material('#72c9f2', 0.98, 'sonda', { roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.2, emissive: 0x0b4f78, emissiveIntensity: 0.16, depthWrite: true });
  const raiz = new THREE.Group(); C.capas.sonda.add(raiz);
  const manoD = crearMano(mG, 1), manoI = crearMano(mG, -1); [manoD, manoI].forEach((m) => { m.traverse((o) => { if (o.isMesh) o.renderOrder = 9; }); m.visible = false; raiz.add(m); });
  // cinta obstétrica: cinta flexible con marcas de cm (0 en el borde superior del pubis)
  const N = 44; const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
  for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const gCinta = new THREE.BufferGeometry(); gCinta.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gCinta.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); gCinta.setIndex(idx);
  const tex = textura((ctx, w, h) => { ctx.fillStyle = '#fff8dc'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#1f2937'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center';
    for (let cm = 0; cm <= 50; cm++) { const x = 8 + cm * (w - 16) / 50; ctx.fillRect(x - 0.8, 0, 1.6, cm % 5 === 0 ? 26 : 12); if (cm % 5 === 0) ctx.fillText(String(cm), x, 52); } ctx.fillStyle = '#dc2626'; ctx.fillRect(0, h - 10, w, 10); }, 2048, 64);
  const mCinta = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }); mCinta.depthTest = false;
  const cinta = new THREE.Mesh(gCinta, mCinta); cinta.renderOrder = 8; cinta.frustumCulled = false; cinta.visible = false; raiz.add(cinta);
  // estetoscopio de Pinard (cuerno de madera): campana ancha en el abdomen, extremo plano para la oreja
  const perfilP = [[3.6, 0], [3.4, 0.6], [2.4, 3.6], [1.1, 7.6], [0.9, 9.6], [0.9, 17.6]].map(([r, h]) => new THREE.Vector2(r, h));
  const mMad = visor.material('#c8955a', 0.98, 'sonda', { roughness: 0.55, clearcoat: 0.3, emissive: 0x4a2a10, emissiveIntensity: 0.18, depthWrite: true });
  const pinard = new THREE.Group(); pinard.add(new THREE.Mesh(new THREE.LatheGeometry(perfilP, 28), mMad));
  const oreja = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.5, 24), mMad); oreja.position.y = 17.8; pinard.add(oreja);
  pinard.visible = false; raiz.add(pinard); pinard.traverse((o) => { if (o.isMesh) o.renderOrder = 9; });
  const ondas = []; for (let i = 0; i < 3; i++) { const o = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 28), visor.material('#fb7185', 0.8, 'sonda', { emissive: 0xfb7185, emissiveIntensity: 1 })); o.visible = false; o.renderOrder = 10; ondas.push(o); raiz.add(o); }
  const marca = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.5, 28), new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthTest: false })); marca.renderOrder = 10; marca.visible = false; raiz.add(marca);
  // HUD (altura uterina, curva de incremento y FCF) dentro del visor
  const hud = document.createElement('div'); hud.className = 'sim-hud obs'; hud.innerHTML = `
    <div class="sim-au" data-on="0"><small>ALTURA UTERINA</small><b>0</b><span>cm</span></div>
    <div class="sim-fcf" data-on="0"><i class="lat">♥</i><div><small>FCF · conteo en 1 min</small><b>0</b><span>lpm</span></div><div class="sim-reloj"><i></i></div></div>
    <svg class="sim-curva" data-on="0" viewBox="0 0 220 150" aria-label="Curva de incremento de la altura uterina">
      <rect x="0" y="0" width="220" height="150" rx="10" class="fondo"/>
      <path class="banda" d="" /><path class="p50" d="" fill="none"/>
      <g class="ejes"></g><circle class="prev" r="4"/><circle class="nuevo" r="5.5"/><text class="tit" x="10" y="14">Curva de AU (cm) según la EG</text><text class="lect" x="110" y="146" text-anchor="middle"></text></svg>`;
  C.vp.appendChild(hud);
  const qAU = hud.querySelector('.sim-au'), qF = hud.querySelector('.sim-fcf'), qC = hud.querySelector('.sim-curva');
  const sx = (eg) => 28 + (eg - 14) * (180 / 28), sy = (au) => 128 - (au - 8) * (100 / 34);
  { let d1 = '', d2 = '', d3 = ''; for (let eg = 14; eg <= 42; eg += 2) { d1 += (d1 ? 'L' : 'M') + sx(eg).toFixed(1) + ' ' + sy(Math.max(8, eg - 3)).toFixed(1); d2 += (d2 ? 'L' : 'M') + sx(eg).toFixed(1) + ' ' + sy(Math.max(8, eg)).toFixed(1); }
    for (let eg = 42; eg >= 14; eg -= 2) d3 += 'L' + sx(eg).toFixed(1) + ' ' + sy(Math.min(42, eg + 3.5)).toFixed(1);
    qC.querySelector('.banda').setAttribute('d', d1 + d3 + 'Z'); qC.querySelector('.p50').setAttribute('d', d2);
    let s = ''; for (let eg = 16; eg <= 40; eg += 4) s += `<line x1="${sx(eg)}" y1="28" x2="${sx(eg)}" y2="128"/><text x="${sx(eg)}" y="138" text-anchor="middle">${eg}</text>`; for (let au = 12; au <= 40; au += 8) s += `<line x1="28" y1="${sy(au)}" x2="208" y2="${sy(au)}"/><text x="22" y="${sy(au) + 3}" text-anchor="end">${au}</text>`; qC.querySelector('.ejes').innerHTML = s; }
  const ent = { tipo: 'obs', st: {}, cat: { goal: 0 } };
  ent.sync = (has, raizEl) => { ent.raiz = raizEl || ent.raiz; const c = ins.clases; ent.st = {}; Object.keys(c).forEach((k) => { ent.st[k] = has(c[k]); }); };
  let ultimo = 0, prog = 0, prox = 0, fcfT = 0;
  ent.tick = (t) => {
    const dt = ultimo ? Math.min(0.1, (t - ultimo) / 1000) : 0.016; ultimo = t; const s = ent.st; const gr = C.gravida; if (!gr || !gr.G || !ent.raiz) return;
    const caso = ent.raiz.__caso || {}; const G = gr.G; const eg = gr.eg; const au = caso.au != null ? caso.au : AUdeEG(eg);
    const yAU = yDeAU(au, G.v); const y0 = GRAV.SINFISIS;
    const fase = s.fin ? 'fin' : s.l4 ? 'l4' : s.l3 ? 'l3' : s.pinard ? 'pinard' : s.l2 ? 'l2' : s.l1 ? 'l1' : s.curva ? 'curva' : s.cinta ? 'cinta' : s.cinta0 ? 'cinta0' : s.pubis ? 'pubis' : '';
    const enAU = ['pubis', 'cinta0', 'cinta', 'curva'].includes(fase);
    gr.dim = enAU;
    prog = lerp(prog, s.cinta ? 1 : 0, easeK(dt, 2.2));
    const yFin = lerp(y0, yAU, prog); let arc = 0; let pz0 = superficie(G, 0, y0) + 0.3, py0 = y0;
    for (let i = 0; i <= N; i++) { const y = lerp(y0, yFin, i / N); const z = superficie(G, 0, y) + 0.3; const a = i * 2;
      if (i) arc += Math.hypot(y - py0, z - pz0); py0 = y; pz0 = z;
      pos[a * 3] = -1.0; pos[a * 3 + 1] = y; pos[a * 3 + 2] = z; pos[(a + 1) * 3] = 1.0; pos[(a + 1) * 3 + 1] = y; pos[(a + 1) * 3 + 2] = z;
      uv[a * 2] = arc / 50; uv[a * 2 + 1] = 0; uv[(a + 1) * 2] = arc / 50; uv[(a + 1) * 2 + 1] = 1; }
    gCinta.attributes.position.needsUpdate = true; gCinta.attributes.uv.needsUpdate = true; gCinta.computeBoundingSphere();
    cinta.visible = enAU && (s.cinta0 || s.cinta);
    const mD = manoD, mI = manoI; mD.visible = mI.visible = false; ondas.forEach((o) => { o.visible = false; }); pinard.visible = false; marca.visible = false;
    if (fase === 'pubis' || fase === 'cinta0') { mD.visible = true; mD.pose('apunta'); colocarMano(mD, G, -1.5, y0 + 1.6, V(0, -1, 0.15), 0.6, 0); }
    if (fase === 'cinta') { mD.visible = true; mD.pose('apunta'); colocarMano(mD, G, -1.5, y0 + 1.6, V(0, -1, 0.15), 0.6, 0); mI.visible = true; mI.pose('plana'); colocarMano(mI, G, 1.4, yFin - 0.3, V(1, 0, 0), 0.5, Math.PI / 2); }
    if (fase === 'curva' || (fase === 'cinta' && prog > 0.97)) { marca.visible = true; marca.position.set(0, yAU, superficie(G, 0, yAU) + 0.7); marca.lookAt(marca.position.clone().add(normalEn(G, 0, yAU))); marca.scale.setScalar(1 + 0.12 * Math.sin(t / 200)); }
    const yF = G.yF;
    if (fase === 'l1') { const k = 0.5 + 0.5 * Math.sin(t / 650); mD.visible = mI.visible = true; mD.pose('garra', 0.6 + 0.4 * k); mI.pose('garra', 0.6 + 0.4 * k); colocarMano(mD, G, -G.ax * 0.55 - 1 + k * 0.8, yF - 2.2, V(1, -0.2, 0), 0.5, 0); colocarMano(mI, G, G.ax * 0.55 + 1 - k * 0.8, yF - 2.2, V(-1, -0.2, 0), 0.5, 0); }
    if (fase === 'l2') { const k = Math.sin(t / 800); const yM = lerp(G.yc, y0 + 6, 0.35); mD.visible = mI.visible = true; mD.pose('suave'); mI.pose('suave');
      colocarMano(mD, G, -G.ax * 0.85 + 1.5 * (k > 0 ? k : 0), yM, V(0, 1, 0.3), 0.5, 0); colocarMano(mI, G, G.ax * 0.85 - 1.5 * (k < 0 ? -k : 0), yM, V(0, 1, 0.3), 0.5, 0); }
    if (fase === 'pinard') {
      const lado = caso.dorso === 'der' ? -1 : 1; const pres = caso.presentacion || 'cefalica';
      const yP = pres === 'cefalica' ? G.yc - G.ayy * 0.4 : pres === 'transversa' ? G.yc : G.yc + G.ayy * 0.3; const xP = lado * Math.min(G.ax * 0.5, 5);
      const n = normalEn(G, xP, yP); const p = V(xP, yP, superficie(G, xP, yP));
      anclar(C, cfg, 'foco', p);
      pinard.visible = true; pinard.position.copy(p).addScaledVector(n, 0.2); pinard.quaternion.setFromUnitVectors(V(0, 1, 0), n.clone().lerp(V(0, 0.3, 1), 0.2).normalize());
      mD.visible = true; mD.pose('suave'); colocarMano(mD, G, xP + lado * 1.8, yP - 3.5, V(0, 1, 0.2), 0.5, 0);
      const bpm = caso.fcf || 140; const f1 = (t / 1000) * bpm / 60; const f = f1 - Math.floor(f1);
      ondas.forEach((o, i) => { const ph = (f + i * 0.33) % 1; o.visible = true; o.position.copy(p).addScaledVector(n, 0.5 + ph * 1.5); o.quaternion.setFromUnitVectors(V(0, 0, 1), n); o.scale.setScalar(0.6 + ph * 2.2); o.material.opacity = 0.9 * (1 - ph); });
      if (t > prox) { prox = t + 60000 / bpm; if (window.AcrFX && !window.AcrFX.mudo()) AcrFX.sonido('latido'); }
    }
    if (fase === 'l3') { mD.visible = true; mD.pose('pinza', 0.6 + 0.4 * Math.sin(t / 500)); colocarMano(mD, G, 0, y0 + 4.6, V(0, 1, 0), 0.6, Math.PI / 2); }
    if (fase === 'l4') { const k = 0.5 + 0.5 * Math.sin(t / 700); mD.visible = mI.visible = true; mD.pose('plana'); mI.pose('plana'); const yb = G.yc - G.ayy * 0.55; colocarMano(mD, G, -G.ax * 0.6 + k * 1.2, yb - k * 1.2, V(0.35, -1, 0), 0.5, 0); colocarMano(mI, G, G.ax * 0.6 - k * 1.2, yb - k * 1.2, V(-0.35, -1, 0), 0.5, 0); }
    qAU.dataset.on = (s.leer && !s.l1) ? '1' : '0'; qAU.querySelector('b').textContent = Math.round(au);
    qC.dataset.on = (s.curva && !s.l1) ? '1' : '0';
    if (qC.dataset.on === '1') { const pv = qC.querySelector('.prev'), nv = qC.querySelector('.nuevo');
      if (caso.au_prev != null && caso.eg_prev) { pv.setAttribute('cx', sx(caso.eg_prev)); pv.setAttribute('cy', sy(caso.au_prev)); pv.style.display = ''; } else pv.style.display = 'none';
      nv.setAttribute('cx', sx(eg)); nv.setAttribute('cy', sy(au)); qC.querySelector('.lect').textContent = caso.au_txt || ''; }
    qF.dataset.on = fase === 'pinard' ? '1' : '0';
    if (fase === 'pinard') { fcfT += dt; const bpm = caso.fcf || 140; const k = Math.min(1, fcfT / 6); qF.querySelector('b').textContent = Math.round(bpm * k); qF.querySelector('.sim-reloj i').style.width = (k * 100) + '%'; qF.querySelector('.lat').style.animationDuration = (60 / bpm) + 's'; } else fcfT = 0;
  };
  C.inst.push(ent);
};

// ---------------------------------------------------------------- HC: historia clínica que se completa en pantalla + familigrama + resaltado anatómico
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function familigrama(c) {
  const F = c.familia || {}; const W = 260, H = 150; const f = (s, x, y, enf, vivo, resalta) => {
    const m = s === 'F' ? `<circle cx="${x}" cy="${y}" r="13" class="fg ${resalta ? 'yo' : ''}"/>` : `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" class="fg ${resalta ? 'yo' : ''}"/>`;
    const x2 = vivo === false ? `<path d="M${x - 15} ${y - 15} L${x + 15} ${y + 15}" class="mu"/>` : '';
    return m + x2 + `<text x="${x}" y="${y + 26}" class="fg-t" text-anchor="middle">${esc(enf || '')}</text>`; };
  let s = `<svg viewBox="0 0 ${W} ${H}" class="sim-fg" aria-label="Familigrama">`;
  const pa = F.padre || {}, ma = F.madre || {};
  s += `<path d="M70 38 L190 38" class="fg-l"/><path d="M130 38 L130 80" class="fg-l"/>`;
  s += f('M', 70, 28, pa.enf, pa.vivo, false) + f('F', 190, 28, ma.enf, ma.vivo, false);
  const hm = F.hermanos || []; const hijos = F.hijos || [];
  const todos = [{ yo: true }].concat(hm.map((h) => ({ h })));
  s += `<path d="M${130 - 36 * todos.length / 2 * 0.5} 80 L${130 + 36 * todos.length / 2 * 0.5} 80" class="fg-l"/>`;
  todos.forEach((p, i) => { const x = 130 + (i - (todos.length - 1) / 2) * 52; s += `<path d="M${x} 80 L${x} 96" class="fg-l"/>` + (p.yo ? f('F', x, 108, c.edad + ' a.', true, true) : f(p.h.sexo, x, 108, p.h.enf, true, false)); });
  return s + '</svg>';
}
TIPOS.hc = (visor, ins, cfg, C) => {
  const panel = document.createElement('div'); panel.className = 'sim-hc'; panel.innerHTML = `<button type="button" class="hc-cab" aria-expanded="true"><b>🗂️ Historia clínica</b><small class="hc-n">0</small><i>▾</i></button><div class="hc-cuerpo"></div>`;
  C.vp.appendChild(panel); const cuerpo = panel.querySelector('.hc-cuerpo'); const cab = panel.querySelector('.hc-cab'); cab.onclick = () => { const a = panel.classList.toggle('plegado'); cab.setAttribute('aria-expanded', String(!a)); };
  const filas = ins.filas || []; let caso0 = null; const els = {};
  const armar = (c) => { caso0 = c; cuerpo.innerHTML = filas.map((f) => `<div class="hc-f" data-f="${f.f}"><span class="k">${esc(f.t)}</span><span class="v"></span></div>`).join('') + '<div class="hc-fg" data-f="famili"></div>';
    filas.forEach((f) => { els[f.f] = cuerpo.querySelector(`[data-f="${f.f}"]`); const v = els[f.f].querySelector('.v'); const txt = c[f.c]; v.textContent = (f.f === 'trat') ? [c.h_cons, c.h_estudios, c.h_dx, c.h_trat].filter(Boolean).join(' · ') : (txt || ''); els[f.f].querySelector('.v').dataset.txt = v.textContent; });
    cuerpo.querySelector('.hc-fg').innerHTML = familigrama(c); };
  const HL = { menarca: ['ovarios', 'trompas', 'utero'], irs: ['utero'], parejas: ['utero'], paridad: ['utero'], its: ['utero'], genito: ['utero'], fum: ['ovarios', 'utero'], anticon: ['utero', 'ovarios'] };
  const ent = { tipo: 'hc', st: {}, cat: { goal: 0 } }; let ultimoOn = '';
  ent.sync = (has, raiz) => { ent.raiz = raiz || ent.raiz; ent.has = has; };
  ent.tick = (t) => {
    if (!ent.raiz) return; const c = ent.raiz.__caso; if (!c) return; if (!caso0 || caso0.id !== c.id) { armar(c); ultimoOn = ''; }
    const has = ent.has || (() => false); let n = 0; let activo = '';
    filas.forEach((f) => { const on = has('s-' + f.f) || (f.f === 'trat' && has('s-trat')); const el = els[f.f]; if (!el) return; if (on) { n++; if (HL[f.f]) activo = f.f; } if (el.classList.contains('on') !== on) { el.classList.toggle('on', on); } });
    cuerpo.querySelector('.hc-fg').classList.toggle('on', has('s-famili')); panel.querySelector('.hc-n').textContent = n;
    panel.style.display = n || has('s-famili') ? '' : 'none';
    const rs = (panel.style.display !== 'none' && !panel.classList.contains('plegado')) ? panel.offsetWidth + 10 : 0; if (rs !== C.reserva) { C.reserva = rs; C.resize && C.resize(); }
    if (n !== ent.nPrev) { ent.nPrev = n; cuerpo.scrollTo({ top: cuerpo.scrollHeight, behavior: 'smooth' }); }
    const fgOn = has('s-famili'); if (fgOn !== ent.fgPrev) { ent.fgPrev = fgOn; if (fgOn) setTimeout(() => cuerpo.scrollTo({ top: cuerpo.scrollHeight, behavior: 'smooth' }), 120); }
    // resaltado anatómico de la estructura relacionada con la última pregunta gineco-obstétrica
    const sel = new Set(HL[activo] || []);
    ['utero', 'ovarios', 'trompas'].forEach((id) => { const ms = C.hsMeshes && C.hsMeshes[id]; if (!ms) return; ms.forEach((m) => { if (!m.material || !m.material.emissive) return; const k = sel.has(id) ? 0.55 + 0.35 * Math.sin(t / 260) : 0.1; m.material.emissive.set(sel.has(id) ? 0xf43f5e : 0x7a2e45); m.material.emissiveIntensity = k; }); });
  };
  C.inst.push(ent);
};

// ---------------------------------------------------------------- GESTO: gestograma (línea de tiempo del embarazo) para el cálculo de la EG y la FPP
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dia = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const fmt = (n) => { const d = new Date(n * 86400000); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`; };
TIPOS.gesto = (visor, ins, cfg, C) => {
  const el = document.createElement('div'); el.className = 'sim-gesto'; C.vp.appendChild(el);
  let cid = null; const ent = { tipo: 'gesto', st: {}, cat: { goal: 0 } };
  const armar = (c) => {
    cid = c.id; const f0 = dia(c.fum_iso), f1 = f0 + 280, h = dia(c.hoy_iso); const X = (d) => 16 + ((d - f0) / 280) * 388; const eg = Math.round(h - f0);
    let ticks = ''; for (let d = Math.ceil(f0 / 30.4) * 30; d <= f1; d += 0) break;
    const ini = new Date(f0 * 86400000); let y = ini.getUTCFullYear(), m = ini.getUTCMonth() + 1; for (let i = 0; i < 11; i++) { const n = Date.UTC(y, m, 1) / 86400000; if (n > f1) break; if (n >= f0) ticks += `<path d="M${X(n)} 36 L${X(n)} 52" class="g-t"/><text x="${X(n) + 2}" y="62" class="g-m">${MESES[m % 12]}</text>`; m++; if (m > 11) { m = 0; y++; } }
    let sem = ''; for (const s of [12, 20, 28, 37, 40]) sem += `<text x="${X(f0 + s * 7)}" y="30" class="g-s" text-anchor="middle">${s}s</text>`;
    el.innerHTML = `<svg viewBox="0 0 420 108" class="g-svg" aria-label="Gestograma">
      <rect x="16" y="36" width="${X(f0 + 84) - 16}" height="16" class="tri1"/><rect x="${X(f0 + 84)}" y="36" width="${X(f0 + 189) - X(f0 + 84)}" height="16" class="tri2"/><rect x="${X(f0 + 189)}" y="36" width="${X(f1) - X(f0 + 189)}" height="16" class="tri3"/>
      <rect class="g-prog" x="16" y="36" width="0" height="16" data-w="${X(h) - 16}"/>${ticks}${sem}
      <g class="g-m-fum"><path d="M${X(f0)} 52 L${X(f0)} 70"/><circle cx="${X(f0)}" cy="76" r="9"/><text x="${X(f0)}" y="80" text-anchor="middle">🩸</text><text x="${X(f0)}" y="96" text-anchor="middle" class="g-l">FUM ${fmt(f0)}</text></g>
      <g class="g-m-hoy"><path d="M${X(h)} 52 L${X(h)} 70"/><circle cx="${X(h)}" cy="76" r="9"/><text x="${X(h)}" y="80" text-anchor="middle">📍</text><text x="${X(h)}" y="96" text-anchor="middle" class="g-l">Hoy ${fmt(h)}</text></g>
      <g class="g-m-fpp"><path d="M${X(f1)} 52 L${X(f1)} 70"/><circle cx="${X(f1)}" cy="76" r="9"/><text x="${X(f1)}" y="80" text-anchor="middle">👶</text><text x="${X(f1)}" y="96" text-anchor="middle" class="g-l" text-anchor="end">FPP ${fmt(f1)}</text></g>
      <text x="16" y="14" class="g-tit">Gestograma · 280 días</text><text x="404" y="14" class="g-eg" text-anchor="end"></text></svg>`;
    ent.f0 = f0; ent.h = h; ent.egTxt = `${Math.floor(eg / 7)}+${eg % 7}`;
  };
  ent.sync = (has, raiz) => { ent.raiz = raiz || ent.raiz; ent.has = has; };
  ent.tick = () => {
    if (!ent.raiz) return; const c = ent.raiz.__caso; if (!c || !c.fum_iso) { el.style.display = 'none'; return; } if (cid !== c.id) armar(c);
    const has = ent.has || (() => false); el.style.display = has('s-fum') ? '' : 'none';
    el.querySelector('.g-m-fum').classList.toggle('on', has('s-fum')); el.querySelector('.g-m-hoy').classList.toggle('on', has('s-hoy')); el.querySelector('.g-m-fpp').classList.toggle('on', has('s-fpp'));
    const pr = el.querySelector('.g-prog'); if (pr) pr.setAttribute('width', has('s-dias') ? pr.dataset.w : 0);
    const tg = el.querySelector('.g-eg'); if (tg) tg.textContent = has('s-eg') ? 'EG ' + ent.egTxt + ' sem' : '';
  };
  C.inst.push(ent);
};

// ---------------------------------------------------------------- GIN: examen ginecológico (espéculo, toma de PAP, tacto bimanual)
const svgExterna = (c) => {
  const lesion = c.vulva === 'lesion' ? '<g class="lesion"><circle cx="76" cy="104" r="4.2"/><circle cx="84" cy="112" r="3.2"/><circle cx="68" cy="112" r="3.4"/></g>' : '';
  const flujo = c.vulva === 'leucorrea' || c.pared === 'candidiasis' ? '<path class="flujo" d="M92 132 C100 148 108 148 112 130 C106 140 98 140 92 132Z"/>' : '';
  return `<svg viewBox="0 0 200 200" class="sv-ext">
  <ellipse cx="100" cy="100" rx="94" ry="94" class="piel"/>
  <g class="vello">${Array.from({ length: 36 }, (_, i) => `<circle cx="${70 + (i * 17) % 60}" cy="${22 + (i * 11) % 34}" r="1.4"/>`).join('')}</g>
  <path class="mayor" d="M100 44 C60 52 58 120 80 160 C88 172 96 168 100 156 Z"/><path class="mayor" d="M100 44 C140 52 142 120 120 160 C112 172 104 168 100 156 Z"/>
  <g class="menores"><path class="menor izq" d="M100 70 C80 76 80 118 92 144 C96 150 100 146 100 138 Z"/><path class="menor der" d="M100 70 C120 76 120 118 108 144 C104 150 100 146 100 138 Z"/></g>
  <ellipse class="introito" cx="100" cy="118" rx="9" ry="16"/><circle class="clitoris" cx="100" cy="76" r="4.2"/><circle class="meato" cx="100" cy="95" r="2.6"/>
  <text x="100" y="62" class="et" text-anchor="middle">Monte de Venus</text><text x="150" y="82" class="et">Clítoris</text><text x="150" y="124" class="et">Introito</text><text x="150" y="150" class="et">Horquilla</text>
  ${lesion}${flujo}
  <g class="dedos"><ellipse class="dedo" cx="52" cy="104" rx="20" ry="7" transform="rotate(-20 52 104)"/><ellipse class="dedo" cx="148" cy="104" rx="20" ry="7" transform="rotate(20 148 104)"/></g>
  </svg>`;
};
const svgEspecular = (c) => {
  const cv = c.cervix || 'normal'; const mult = c.parto === 'multipara';
  const pared = c.pared === 'candidiasis' ? '#f3c9c4' : c.pared === 'atrofica' ? '#f6d0cb' : '#e9857f';
  const exo = cv === 'atrofia' ? '#f8d5cf' : cv === 'cervicitis' ? '#e0534a' : cv === 'lesion' ? '#e58a86' : '#f0a5ad';
  const os = mult ? '<rect class="os" x="-14" y="-3" width="28" height="6" rx="3"/>' : '<circle class="os" r="5.4"/>';
  const extra = cv === 'ectropion' ? '<ellipse class="ectro" rx="24" ry="22"/>' : cv === 'cervicitis' ? '<path class="moco" d="M-16 4 C-6 26 8 26 16 4 C10 16 -8 16 -16 4Z"/><circle class="moco" cx="0" cy="0" r="9" opacity=".7"/>'
    : cv === 'polipo' ? '<ellipse class="polipo" cx="2" cy="14" rx="7" ry="15"/>' : cv === 'lesion' ? '<path class="friable" d="M-22 -8 C-10 -26 8 -20 20 -6 C26 8 12 22 -4 18 C-18 14 -26 4 -22 -8Z"/><circle class="sangre" cx="6" cy="8" r="3"/><circle class="sangre" cx="-8" cy="4" r="2.4"/>' : '';
  const placas = c.pared === 'candidiasis' ? Array.from({ length: 16 }, (_, i) => `<ellipse class="placa" cx="${Math.cos(i * 1.7) * 66}" cy="${Math.sin(i * 1.7) * 66}" rx="7" ry="4" transform="rotate(${i * 40} ${Math.cos(i * 1.7) * 66} ${Math.sin(i * 1.7) * 66})"/>`).join('') : '';
  const rugas = Array.from({ length: 7 }, (_, i) => `<path class="ruga" d="M${-96 + i * 6} ${-30 + i * 10} Q0 ${-70 - i * 4} ${96 - i * 6} ${-30 + i * 10}" fill="none"/>`).join('');
  return `<svg viewBox="-100 -100 200 200" class="sv-esp"><defs><radialGradient id="svgPared"><stop offset=".4" stop-color="${pared}"/><stop offset="1" stop-color="#8f3a3a"/></radialGradient><clipPath id="svgCirc"><circle r="96"/></clipPath></defs>
    <g clip-path="url(#svgCirc)"><circle r="100" fill="url(#svgPared)"/>${rugas}${placas}
    <g class="cervix"><ellipse rx="44" ry="42" fill="${exo}" class="exo"/>${extra}${os}</g>
    <g class="valvas"><path d="M-100 -98 L100 -98 L100 -62 C40 -80 -40 -80 -100 -62Z"/><path d="M-100 98 L100 98 L100 62 C40 80 -40 80 -100 62Z"/></g>
    <g class="ayre"><path d="M70 90 L8 8" class="vara"/><path d="M12 12 C-2 6 -4 -6 6 -10 C16 -8 22 4 12 12Z" class="punta"/></g>
    <g class="cito"><path d="M70 90 L4 6" class="vara2"/><g class="cerdas">${Array.from({ length: 12 }, (_, i) => `<path d="M${4 - i * 0.6} ${6 - i * 1.6} l${i % 2 ? 7 : -7} ${i % 2 ? -3 : 3}"/>`).join('')}</g></g>
    <g class="spray">${Array.from({ length: 14 }, (_, i) => `<circle cx="${-30 + i * 6}" cy="${-10 + (i % 3) * 8}" r="${1.4 + (i % 4)}"/>`).join('')}</g></g></svg>`;
};
TIPOS.gin = (visor, ins, cfg, C) => {
  const A = cfg.gin; const I = V(...A.introito), O = V(...A.os);
  const curva = new THREE.CatmullRomCurve3([I, V(...A.p1), V(...A.p2), O]); const LARGO = curva.getLength();
  const raiz = new THREE.Group(); C.capas.sonda.add(raiz);
  const mVag = visor.material('#f1a9b8', 0.34, 'organos', { roughness: 0.55, clearcoat: 0.3, emissive: 0x8a3b52, emissiveIntensity: 0.18 });
  const vag = new THREE.Mesh(new THREE.TubeGeometry(curva, 36, A.radio, 20, false), mVag); vag.renderOrder = 2; C.capas.organos.add(vag); vag.userData.capa = 'organos';
  const mEsp = visor.material('#d6eef7', 0.5, 'sonda', { roughness: 0.2, clearcoat: 0.8, emissive: 0x6bb7d6, emissiveIntensity: 0.28, depthWrite: true });
  const mEspB = visor.material('#7dd3fc', 0.95, 'sonda', { roughness: 0.3, emissive: 0x0284c7, emissiveIntensity: 0.45, depthWrite: true });
  // espéculo bivalvo: dos valvas semicilíndricas con bisagra, mango y tornillo
  const esp = new THREE.Group(); raiz.add(esp); esp.visible = false; const LV = 8.2, RV = 1.2;
  const valva = (sup) => { const g = new THREE.CylinderGeometry(RV, RV * 0.95, LV, 24, 1, true, sup ? 0 : Math.PI, Math.PI); g.rotateX(Math.PI / 2); g.translate(0, 0, LV / 2); const m = new THREE.Mesh(g, mEsp); m.renderOrder = 6; const piv = new THREE.Group(); piv.add(m); esp.add(piv); return piv; };
  const vSup = valva(true), vInf = valva(false);
  const mango = new THREE.Group(); esp.add(mango); [-1, 1].forEach((s) => { const b = new THREE.Mesh(new RoundedBoxGeometry(0.9, 8, 1.1, 3, 0.3), mEspB); b.position.set(0, -4.6 * 1 + (s > 0 ? 0 : 0), -1.2); b.rotation.x = 0; b.position.y = -4.2; b.position.x = s * 0.55; mango.add(b); });
  const tor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.6, 12), mEspB); tor.rotation.z = Math.PI / 2; tor.position.set(0, 0.2, -2.2); mango.add(tor);
  [esp].forEach((g) => g.traverse((m) => { if (m.isMesh) m.renderOrder = 6; }));
  // instrumentos de toma de muestra: espátula de Ayre y citobrush
  const mMad = visor.material('#e7c590', 0.98, 'sonda', { roughness: 0.6, emissive: 0x6b4a1a, emissiveIntensity: 0.2, depthWrite: true });
  const ayre = new THREE.Group(); { const v = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 14), mMad); v.position.z = -7; ayre.add(v); const p = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 2.2), mMad); p.position.z = 0.4; ayre.add(p); } ayre.visible = false; raiz.add(ayre);
  const cito = new THREE.Group(); { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 14, 8), mEspB); v.rotation.x = Math.PI / 2; v.position.z = -7; cito.add(v); for (let i = 0; i < 24; i++) { const a = i * 0.9; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), mMad); c.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.2 + (i % 8) * 0.18); c.rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4); cito.add(c); } } cito.visible = false; raiz.add(cito);
  // dedos del tacto (índice y medio) y manos
  const mG = visor.material('#72c9f2', 0.97, 'sonda', { roughness: 0.34, clearcoat: 0.5, emissive: 0x0b4f78, emissiveIntensity: 0.16, depthWrite: true });
  const dedos = new THREE.Group(); raiz.add(dedos); dedos.visible = false; const dx = [-0.55, 0.55].map((x) => { const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 7, 6, 12), mG); d.rotation.x = Math.PI / 2; d.position.x = x; d.renderOrder = 7; dedos.add(d); return d; });
  const mano = crearMano(mG, 1); mano.visible = false; raiz.add(mano); const manoAb = crearMano(mG, -1); manoAb.visible = false; raiz.add(manoAb);
  mano.traverse((o) => { if (o.isMesh) o.renderOrder = 7; }); manoAb.traverse((o) => { if (o.isMesh) o.renderOrder = 7; });
  // inset de vista (externa / especular)
  const vista = document.createElement('div'); vista.className = 'sim-vista'; vista.innerHTML = '<div class="sv-tit"></div><div class="sv-cont"></div><div class="sv-cap"></div>'; C.vp.appendChild(vista);
  const portas = document.createElement('div'); portas.className = 'sim-portas'; portas.innerHTML = '<div class="pt"><i class="pt-1"></i><small>Exocérvix</small></div><div class="pt"><i class="pt-2"></i><small>Endocérvix</small></div><div class="pt-fijador">FIJADO</div>'; C.vp.appendChild(portas);
  let caso0 = null; const ent = { tipo: 'gin', st: {}, cat: { goal: 0 } };
  ent.sync = (has, raizEl) => { ent.raiz = raizEl || ent.raiz; const c = ins.clases; ent.st = {}; Object.keys(c).forEach((k) => { ent.st[k] = has(c[k]); }); };
  const punto = (d) => { if (d <= 0) { const t = curva.getTangentAt(0); return I.clone().addScaledVector(t, d); } return curva.getPointAt(Math.min(1, d / LARGO)); };
  const tang = (d) => curva.getTangentAt(clamp(d / LARGO, 0, 1));
  let ultimo = 0, prof = -14, roll = -Math.PI / 2, abre = 0, modo = '', cid = null, tAyre = 0, tCito = 0, mA = 0, tFija = 0;
  const colocar = (g, d, rollang, extra = 0) => {
    const T = tang(d); const x = V(1, 0, 0).sub(T.clone().multiplyScalar(T.x)).normalize(); const y = new THREE.Vector3().crossVectors(T, x).normalize();
    const m = new THREE.Matrix4().makeBasis(x, y, T); g.quaternion.setFromRotationMatrix(m); g.rotateZ(rollang); g.position.copy(punto(d));
  };
  ent.tick = (t) => {
    if (!ent.raiz) return; const dt = ultimo ? Math.min(0.1, (t - ultimo) / 1000) : 0.016; ultimo = t; const s = ent.st; const c = ent.raiz.__caso || {};
    if (!c.id) return; if (cid !== c.id) { cid = c.id; }
    const k = easeK(dt, 3.2);
    // espéculo
    const fase = s.retira ? 'fuera' : s.esp ? 'dentro' : 'antes';
    const dMeta = s.retira ? -14 : s.esp ? Math.min(LARGO - 1.0, 7.4) : -14;
    prof = lerp(prof, dMeta, easeK(dt, s.retira ? 1.6 : 1.8)); roll = lerp(roll, s.esp && !s.retira ? 0 : -Math.PI / 2, easeK(dt, 1.8));
    const abMeta = s.valvas && !s.cierra ? 0.34 : 0; abre = lerp(abre, abMeta, easeK(dt, 3));
    esp.visible = (s.esp && prof > -13) || prof > -13; if (!s.esp) esp.visible = false;
    colocar(esp, prof, roll); vSup.rotation.x = -abre; vInf.rotation.x = abre;
    if (!s.esp) esp.visible = false;
    // herramientas
    const usaAyre = s.ayre && !s.cito, usaCito = s.cito && !s.fija && !s.retira;
    tAyre = usaAyre ? tAyre + dt : 0; tCito = usaCito ? tCito + dt : 0;
    ayre.visible = usaAyre && s.valvas; cito.visible = usaCito && s.valvas;
    if (ayre.visible) { const d = Math.min(LARGO - 0.4, 3 + Math.min(1, tAyre * 0.8) * (LARGO - 3.4)); colocar(ayre, d, tAyre * 3.2); }
    if (cito.visible) { const d = Math.min(LARGO - 0.2, 3 + Math.min(1, tCito * 0.8) * (LARGO - 3.2)); colocar(cito, d, Math.sin(tCito * 3) * 1.1); }
    // tacto bimanual: dedos dentro de la vagina + mano abdominal sobre el hipogastrio
    const bim = s.bimd && !s.bimr; dedos.visible = bim;
    if (bim) { const d = lerp(0, LARGO - 1.0, clamp((t % 4000) / 1600, 0, 1)); colocar(dedos, d - 4.2, 0); }
    mano.visible = false; manoAb.visible = false;
    const yH = 7.6; const zH = (A.hipogastrio || [0, 7.6, 7.2])[2];
    if (s.bima && !s.bimr) { manoAb.visible = true; manoAb.pose('plana'); const pr = 0.4 * Math.sin(t / 380); manoAb.position.set(-1.3, yH, zH + 0.9 - pr * 0.5); manoAb.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2 + 0.35, 0, Math.PI)); manoAb.scale.setScalar(1); }
    if (s.abre2 && !s.bimd) { mano.visible = true; mano.pose('pinza', 0.8); const o = I.clone().add(V(2.5, -3, 4)); mano.position.copy(o); mano.quaternion.setFromEuler(new THREE.Euler(-0.9, 2.4, 0)); }
    if (s.abre && !s.esp) { mano.visible = true; mano.pose('pinza', 0.8); const o = I.clone().add(V(2.5, -3, 4)); mano.position.copy(o); mano.quaternion.setFromEuler(new THREE.Euler(-0.9, 2.4, 0)); }
    // útero resalta durante el tacto bimanual
    const ms = C.hsMeshes && C.hsMeshes.utero; if (ms) ms.forEach((m) => { if (m.material && m.material.emissive) { m.material.emissive.set(bim && s.bima ? 0xf43f5e : 0x7a2e45); m.material.emissiveIntensity = bim && s.bima ? 0.5 + 0.3 * Math.sin(t / 240) : 0.12; } });
    // inset
    let m = ''; if (s.vulva && !s.esp) m = 'ext'; if (s.valvas && !s.retira) m = 'esp'; if (s.abre2 && !s.bimd) m = m || 'ext';
    if (m !== modo || caso0 !== c.id) { modo = m; caso0 = c.id; const cont = vista.querySelector('.sv-cont'); vista.dataset.on = m ? '1' : '0';
      if (m === 'ext') { cont.innerHTML = svgExterna(c); vista.querySelector('.sv-tit').textContent = 'Vista externa · genitales'; }
      else if (m === 'esp') { cont.innerHTML = svgEspecular(c); vista.querySelector('.sv-tit').textContent = 'Vista especular · cuello uterino'; }
      else cont.innerHTML = ''; }
    const ve = vista.querySelector('svg'); if (ve) {
      ve.classList.toggle('abierta', !!(s.abre || s.abre2)); ve.classList.toggle('ayre-on', usaAyre); ve.classList.toggle('cito-on', usaCito); ve.classList.toggle('spray-on', !!s.fija && !s.retira); ve.classList.toggle('con-valvas', !!s.valvas); }
    vista.querySelector('.sv-cap').textContent = m === 'esp' ? (s.cuello ? c.vista_txt || '' : 'Valvas separadas: ubicá el cuello') : (m === 'ext' ? c.ext_txt || '' : '');
    portas.dataset.s1 = s.ayre ? '1' : '0'; portas.dataset.s2 = s.cito ? '1' : '0'; portas.dataset.fij = s.fija ? '1' : '0'; portas.style.display = s.ayre ? '' : 'none';
    anclar(C, cfg, 'cuello', O.clone().add(V(0, 0.4, 0.4))); anclar(C, cfg, 'introito', I.clone());
  };
  C.inst.push(ent);
};

// ---------------------------------------------------------------- MAM: examen mamario (inspección, palpación por cuadrantes, expresión del pezón, autoexamen)
const CUADR = { CSE: [-1, 1], CSI: [1, 1], CIE: [-1, -1], CII: [1, -1] };   // [lado: -1 externo (según la mama), arriba/abajo]
TIPOS.mam = (visor, ins, cfg, C) => {
  const M = cfg.mam; const R = M.R || 7.5; const TH = M.th || 0.95;
  const raiz = new THREE.Group(); C.capas.sonda.add(raiz);
  const mat = (c, o, ex) => visor.material(c, o, 'organos', Object.assign({ roughness: 0.5, clearcoat: 0.3 }, ex || {}));
  const mGl = mat('#f3d9a4', 0.5, { emissive: 0xb9893a, emissiveIntensity: 0.18 }); const mNod = mat('#c0392b', 0.95, { emissive: 0x7f1d1d, emissiveIntensity: 0.35, depthWrite: true });
  const mAr = visor.material('#b9715a', 0.98, 'piel', { roughness: 0.6, clearcoat: 0.1, depthWrite: true }); const mPe = visor.material('#a45a47', 0.98, 'piel', { roughness: 0.6, clearcoat: 0.1, depthWrite: true });
  const mMo = visor.material('#d9a28f', 0.98, 'piel', { depthWrite: true }); const mVen = visor.material('#5b8def', 0.8, 'piel', { emissive: 0x1d4ed8, emissiveIntensity: 0.3, depthWrite: true });
  const lados = [{ id: 'D', c: V(...M.pezon_d), lado: -1 }, { id: 'I', c: V(...M.pezon_i), lado: 1 }];
  const pt = (L, th, ph, r = R) => V(L.c.x + r * Math.sin(th) * Math.cos(ph), L.c.y + r * Math.sin(th) * Math.sin(ph), L.c.z - R + r * Math.cos(th));
  const nrm = (L, th, ph) => V(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th));
  // por mama: glándula, areola, pezón, tubérculos de Montgomery, red venosa de Haller, parches de piel y nódulo
  lados.forEach((L) => {
    const g = new THREE.Group(); g.position.copy(L.c); g.position.z -= R; raiz.add(g); L.g = g;
    const gl = new THREE.Group(); g.add(gl); L.gl = gl;
    for (let i = 0; i < 26; i++) { const th = Math.acos(1 - Math.random() * (1 - Math.cos(TH * 0.9))), ph = Math.random() * 6.283; const r = R * (0.45 + Math.random() * 0.4); const lob = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mGl); lob.position.set(r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)); lob.scale.setScalar(0.8 + Math.random() * 0.9); gl.add(lob); }
    const dctos = new THREE.Group(); gl.add(dctos);
    for (let i = 0; i < 9; i++) { const ph = i * 0.7; const pts = [V(0, 0, R * 0.98), V(2.5 * Math.cos(ph), 2.5 * Math.sin(ph), R * 0.8), V(4.4 * Math.cos(ph), 4.4 * Math.sin(ph), R * 0.55)]; const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.09, 6, false), mGl); dctos.add(t); }
    const are = new THREE.Mesh(new THREE.CircleGeometry(2.0, 36), mAr); are.position.z = R + 0.05; are.renderOrder = 4; g.add(are); L.are = are;
    const nip = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.9, 16), mPe); nip.rotation.x = Math.PI / 2; nip.position.z = R + 0.45; nip.renderOrder = 5; g.add(nip); L.nip = nip;
    for (let i = 0; i < 8; i++) { const a = i * 0.8; const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mMo); m.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.4, R + 0.1); m.renderOrder = 5; g.add(m); }
    const ven = new THREE.Group(); ven.visible = false; g.add(ven); L.ven = ven;
    for (let i = 0; i < 6; i++) { const ph = i * 1.05 + 0.3; const pts = []; for (let k = 0; k <= 8; k++) { const th = 0.28 + k * 0.08; const pp = pt({ c: V(0, 0, R) }, th, ph + Math.sin(k) * 0.12, R + 0.1); pts.push(pp.sub(V(0, 0, R)).add(V(0, 0, 0))); } ven.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.06, 5, false), mVen)); }
    const nod = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mNod); nod.visible = false; nod.renderOrder = 6; g.add(nod); L.nod = nod;
    const naranja = new THREE.Mesh(new THREE.SphereGeometry(R + 0.12, 32, 20, 0, Math.PI * 2, 0, TH), visor.material('#d9892b', 0.0, 'piel', { roughness: 1, clearcoat: 0, depthWrite: false })); naranja.visible = false; naranja.renderOrder = 4; g.add(naranja); L.piel = naranja;
    const gotas = []; for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat('#fff7e0', 0.95, { emissive: 0xfff7e0, emissiveIntensity: 0.5, depthWrite: true })); d.visible = false; d.renderOrder = 7; g.add(d); gotas.push(d); } L.gotas = gotas;
    L.g.traverse((m) => { if (m.isMesh) m.userData.capa = m.userData.capa || 'organos'; });
  });
  const mG = visor.material('#72c9f2', 0.98, 'sonda', { roughness: 0.34, clearcoat: 0.55, emissive: 0x0b4f78, emissiveIntensity: 0.16, depthWrite: true });
  const mano = crearMano(mG, 1); mano.traverse((o) => { if (o.isMesh) o.renderOrder = 9; }); mano.visible = false; raiz.add(mano);
  const mano2 = crearMano(mG, -1); mano2.traverse((o) => { if (o.isMesh) o.renderOrder = 9; }); mano2.visible = false; raiz.add(mano2);
  // HUD: mapa de cuadrantes de ambas mamas + postura
  const hud = document.createElement('div'); hud.className = 'sim-hud mam';
  const mapa = (id, lado) => `<div class="mm" data-m="${id}"><b>${id === 'D' ? 'Mama derecha' : 'Mama izquierda'}</b><svg viewBox="-60 -60 120 120"><circle r="50" class="borde"/><path class="q q-CSE" d="M0 0 L${lado === -1 ? '-' : ''}50 0 A50 50 0 0 ${lado === -1 ? 1 : 0} 0 -50Z"/><path class="q q-CSI" d="M0 0 L${lado === -1 ? '' : '-'}50 0 A50 50 0 0 ${lado === -1 ? 0 : 1} 0 -50Z"/><path class="q q-CIE" d="M0 0 L${lado === -1 ? '-' : ''}50 0 A50 50 0 0 ${lado === -1 ? 0 : 1} 0 50Z"/><path class="q q-CII" d="M0 0 L${lado === -1 ? '' : '-'}50 0 A50 50 0 0 ${lado === -1 ? 1 : 0} 0 50Z"/><circle r="9" class="areola"/><circle r="3" class="pez"/><circle class="nodulo" r="4" cx="0" cy="0"/><circle class="axila" r="5" cx="${lado === -1 ? -56 : 56}" cy="-34"/></svg><small class="mm-t"></small></div>`;
  hud.innerHTML = `<div class="sim-postura" data-on="0"><svg viewBox="0 0 100 120"><circle cx="50" cy="18" r="10"/><path d="M50 28 L50 70 M50 36 L30 58 M50 36 L70 58 M50 70 L38 106 M50 70 L62 106"/><g class="arms-alto"><path d="M50 36 L28 10 M50 36 L72 10"/></g></svg><span></span></div><div class="sim-mapas" data-on="0">${mapa('D', -1)}${mapa('I', 1)}</div>`;
  C.vp.appendChild(hud); const post = hud.querySelector('.sim-postura'), mapas = hud.querySelector('.sim-mapas');
  const ent = { tipo: 'mam', st: {}, cat: { goal: 0 } }; let ultimo = 0, t0 = 0, cid = null, tAuto = 0, sec = 0;
  ent.sync = (has, raizEl) => { ent.raiz = raizEl || ent.raiz; const c = ins.clases; ent.st = {}; Object.keys(c).forEach((k) => { ent.st[k] = has(c[k]); }); };
  // dirección de cada cuadrante (ángulo en el plano x-y del pezón; +x = izquierda de la paciente)
  const ANG = (L, q) => { const ext = q.endsWith('E') ? -1 : +1; /* externo = hacia el costado de esa mama */ const lateral = L.lado === -1 ? -1 : 1; const dx = lateral * (q.endsWith('E') ? 1 : -1); const dy = q.startsWith('CS') ? 1 : -1; return Math.atan2(dy * 0.8, dx); };
  ent.tick = (t) => {
    if (!ent.raiz) return; const dt = ultimo ? Math.min(0.1, (t - ultimo) / 1000) : 0.016; ultimo = t; const s = ent.st; const c = ent.raiz.__caso || {}; if (!c.id) return;
    // configuración de nódulos, piel y pezón por caso
    if (cid !== c.id) { cid = c.id; lados.forEach((L) => { const afecta = (c.lado || 'D') === L.id; const nod = L.nod; nod.visible = !!(afecta && c.nod_tam);
      if (nod.visible) { const q = c.cuadrante || 'CSE'; const th = (q === 'retroareolar' ? 0.12 : 0.55), ph = ANG(L, q === 'retroareolar' ? 'CSE' : q); const r = R * 0.8; nod.position.set(r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)); nod.scale.setScalar(Math.max(0.5, c.nod_tam / 2)); nod.material.color.set(c.nod_duro ? '#7f1d1d' : '#c0392b'); }
      L.ven.visible = !!(afecta && c.venas); L.piel.visible = !!(afecta && (c.piel === 'naranja' || c.piel === 'eritema')); if (L.piel.visible) { L.piel.material.color.set(c.piel === 'eritema' ? '#e11d48' : '#d9892b'); L.piel.material.opacity = 0.0; L.piel.userData.base = c.piel === 'eritema' ? 0.35 : 0.3; }
      L.nip.position.z = R + (afecta && c.pezon === 'retraido' ? 0.05 : 0.45); L.nip.scale.set(1, afecta && c.pezon === 'retraido' ? 0.35 : 1, 1); }); }
    // postura y mapas
    post.dataset.on = (s.posA && !s.palp) ? '1' : '0'; post.querySelector('.arms-alto').style.opacity = s.brazos ? 1 : 0; post.querySelector('span').textContent = s.brazos ? 'Brazos en alto' : 'Manos en la cintura';
    mapas.dataset.on = (s.palp || s.auto) ? '1' : '0';
    // palpación: 4 cuadrantes por mama, mama derecha y luego izquierda
    const iniciando = s.palp && !s.pezon; if (iniciando && !t0) t0 = t; if (!s.palp) t0 = 0;
    mano.visible = false; mano2.visible = false; lados.forEach((L) => { L.gotas.forEach((d) => { d.visible = false; }); });
    const Q = ['CSE', 'CSI', 'CII', 'CIE']; const DUR = 2200; const tr = t0 ? t - t0 : 0; const total = DUR * 8;
    const info = {}; if (s.palp) { const k = Math.floor(clamp(tr, 0, total - 1) / DUR); const fq = (clamp(tr, 0, total - 1) % DUR) / DUR; const L = lados[k < 4 ? 0 : 1]; const q = Q[k % 4];
      if (tr < total && !s.pezon) { const th = clamp(fq < 0.5 ? fq * 2 : (1 - fq) * 2, 0.05, 1) * 0.82 * TH; const ph = ANG(L, q) + Math.sin(fq * 14) * 0.22; const p = pt(L, th, ph, R + 0.5); const n = nrm(L, th, ph);
        mano.visible = true; mano.pose('plana'); const f = V(Math.cos(ph), Math.sin(ph), 0); colocarManoSup(mano, p, n, f); }
      lados.forEach((Lx, li) => Q.forEach((qq, qi) => { const idx = li * 4 + qi; const prog = tr >= (idx + 1) * DUR || s.pezon; const act = Math.floor(tr / DUR) === idx && tr < total && !s.pezon; const el = mapas.querySelector(`[data-m="${Lx.id}"] .q-${qq}`); el.classList.toggle('hecho', !!prog); el.classList.toggle('act', !!act); })); }
    mapas.querySelectorAll('.mm').forEach((mm) => { const id = mm.dataset.m; const afecta = (c.lado || 'D') === id; const nodo = mm.querySelector('.nodulo'); const qq = c.cuadrante || 'CSE'; const L = lados.find((x) => x.id === id);
      const hecho = (qs) => mm.querySelector('.q-' + qs) && mm.querySelector('.q-' + qs).classList.contains('hecho'); const vis = afecta && c.nod_tam && (qq === 'retroareolar' ? hecho('CSE') : hecho(qq)); nodo.style.opacity = vis ? 1 : 0;
      if (vis) { const a = ANG(L, qq === 'retroareolar' ? 'CSE' : qq); const rr = qq === 'retroareolar' ? 0 : 27; nodo.setAttribute('cx', Math.cos(a) * rr); nodo.setAttribute('cy', -Math.sin(a) * rr); nodo.setAttribute('r', Math.max(3, c.nod_tam * 1.6)); }
      mm.querySelector('.axila').style.opacity = (afecta && c.adenopatia && (s.brazos || s.palp)) ? 1 : 0; mm.querySelector('.mm-t').textContent = (afecta && vis) ? (c.nod_txt || '') : (s.palp ? '' : ''); });
    // pezón: presión con pulgar e índice, secreción y movilidad
    if (s.pezon && !s.auto) { const L = lados.find((x) => x.id === (c.lado || 'D')) || lados[0]; const p = pt(L, 0.02, 0, R + 0.9); mano.visible = true; mano.pose('pinza', 0.9); colocarManoSup(mano, p, V(0, 0.2, 1).normalize(), V(0, 1, 0.1)); }
    const sc = c.secrecion; lados.forEach((L) => { const afecta = c.sec_bilateral || (c.lado || 'D') === L.id; if (s.secr && sc && sc !== 'ninguna' && afecta) { sec += dt; L.gotas.forEach((d, i) => { const ph = (sec * 0.8 + i / L.gotas.length) % 1; d.visible = true; d.position.set((i - 2.5) * 0.06, -ph * 2.6, R + 0.6 + ph * 0.3); d.material.color.set(sc === 'hematica' ? '#8b0000' : sc === 'purulenta' ? '#d8c24a' : sc === 'lechosa' ? '#fffdf0' : '#e5e5c8'); d.material.emissive.set(sc === 'hematica' ? '#4a0000' : '#fff7e0'); d.scale.setScalar(1 - ph * 0.5); }); } });
    lados.forEach((L) => { const mov = s.movil && (c.lado || 'D') === L.id; const fija = c.pezon === 'retraido' || c.adherido; L.are.position.z = R + 0.05 + (mov && !fija ? 0.5 * Math.sin(t / 260) ** 2 : 0); L.nip.position.z += 0; if (L.piel.visible) L.piel.material.opacity = (L.piel.userData.base || 0.3) * (s.tam ? 1 : 0.0); });
    // autoexamen: patrones de palpación (círculos / líneas verticales / cuña)
    if (s.auto) { tAuto += dt; const L = lados[0]; const patron = Math.floor(tAuto / 4) % 3; const f = (tAuto % 4) / 4; let th = 0.1, ph = 0; if (patron === 0) { th = 0.8 * TH * (0.15 + 0.85 * f); ph = f * 18; } else if (patron === 1) { const xx = -0.8 + (Math.floor(f * 4) / 3) * 1.6; ph = xx > 0 ? 0 : 3.14; th = 0.2 + Math.abs(xx) * 0.5 + 0.35 * Math.abs(Math.sin(f * 24)); } else { ph = f * 6.28; th = 0.5 * TH * (Math.floor(f * 6) % 2 ? 1 : 0.2) + 0.1; }
      const p = pt(L, th, ph, R + 0.5); mano2.visible = true; mano2.pose('plana'); colocarManoSup(mano2, p, nrm(L, th, ph), V(Math.cos(ph), Math.sin(ph), 0)); } else tAuto = 0;
    lados.forEach((L) => { L.g.visible = true; });
    anclar(C, cfg, 'pezonD', lados[0].c.clone().add(V(0, 0, 0.6))); anclar(C, cfg, 'pezonI', lados[1].c.clone().add(V(0, 0, 0.6)));
  };
  C.inst.push(ent);
};
function colocarManoSup(mano, p, n, f) {
  const fd = f.clone().sub(n.clone().multiplyScalar(f.dot(n))).normalize(); const yA = n.clone().negate(); const xA = new THREE.Vector3().crossVectors(yA, fd).normalize();
  mano.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, fd)); mano.position.copy(p).addScaledVector(n, 0.35);
}
