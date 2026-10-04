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
    qAU.dataset.on = (s.leer && !s.fin) ? '1' : '0'; qAU.querySelector('b').textContent = Math.round(au);
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
