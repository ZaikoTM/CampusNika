// Escenas 3D del área Cirugía (Introducción a las especialidades clínico-quirúrgicas). Todo en cm.
// Cada tipo recibe (visor, ins, cfg, C) y registra en C.inst un objeto { sync(has, raiz), tick(t) } (igual que sim3d.js).
// Reutiliza la mano real (assets/anatomia/manos/mano_real.glb) vía crearMano de sim3d.js.
import * as THREE from 'three';
import { crearMano } from './sim3d.js?v=12';

export const TIPOS = {};
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

  // --- ambiente: pared de azulejos, lavabo de acero con canilla
  const pared = new THREE.Mesh(new THREE.BoxGeometry(70, 46, 1.5), mAzulej); pared.position.set(0, 24, -22); raiz.add(pared);
  for (let i = -3; i <= 3; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.15, 46, 0.2), mat('#9cc3d0', 1)); l.position.set(i * 9.5, 24, -21.1); raiz.add(l); }
  const lavabo = new THREE.Mesh(new THREE.BoxGeometry(50, 7, 22), mAcero); lavabo.position.set(0, -2, -10); raiz.add(lavabo);
  const cubeta = new THREE.Mesh(new THREE.BoxGeometry(44, 1.2, 17), mat('#aeb9c2', 1, { roughness: 0.25 })); cubeta.position.set(0, 1.7, -10); raiz.add(cubeta);
  const cano = new THREE.Group(); cano.position.set(0, 1, -20); raiz.add(cano);
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 16, 16), mAcero); c1.position.y = 8; cano.add(c1);
  const c2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 11, 16), mAcero); c2.rotation.x = Math.PI / 2; c2.position.set(0, 16, 5); cano.add(c2);
  const palanca = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 12), mat('#9aa7b1', 1, { roughness: 0.3 })); palanca.position.set(0, 14.4, 2); cano.add(palanca);
  const pico = V(0, 1, -20 + 10.5).add(V(0, 15, 0));
  // chorro de agua
  const chorro = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 14, 12, 1, true), mAgua); chorro.position.set(0, pico.y - 7, pico.z); chorro.visible = false; chorro.renderOrder = 6; raiz.add(chorro);
  const gotas = []; for (let i = 0; i < 26; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mAgua); g.visible = false; g.renderOrder = 6; raiz.add(g); gotas.push({ m: g, ph: Math.random() * 6.28, v: 6 + Math.random() * 6 }); }
  // dosificador de jabón + cepillo + limpiauñas
  const dosif = new THREE.Group(); dosif.position.set(-22, 4, -16); raiz.add(dosif);
  dosif.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 9, 20), mat('#f59e0b', 0.9)), { position: V(0, 4.5, 0) }));
  const bomba = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4, 10), mAcero); bomba.position.set(0, 11, 0); dosif.add(bomba);
  const pico2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 4), mAcero); pico2.position.set(0, 12.8, 2); dosif.add(pico2);
  const cepillo = new THREE.Group(); cepillo.visible = false; raiz.add(cepillo);
  cepillo.add(new THREE.Mesh(new THREE.BoxGeometry(7, 1.6, 2.4), mat('#38bdf8', 1)));
  const cerdas = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.1, 2), mat('#f8fafc', 1, { roughness: 1, clearcoat: 0 })); cerdas.position.y = -1.3; cepillo.add(cerdas);
  const palito = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 6, 8), mat('#fde68a', 1)); palito.visible = false; raiz.add(palito);

  // --- brazos: antebrazo + mano real (palma hacia el eje)
  const manos = [1, -1].map((lado) => {
    const g = new THREE.Group(); raiz.add(g);
    const mano = crearMano(mPiel, lado); g.add(mano);
    const ante = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 3.0, 24, 22), mPiel); ante.rotation.x = Math.PI / 2; ante.position.set(0, 0, -15.4); g.add(ante);
    const codo = new THREE.Mesh(new THREE.SphereGeometry(4.3, 18, 14), mPiel); codo.position.set(0, 0, -27.4); g.add(codo);
    // anillos, pulsera y reloj (se quitan en el paso 2)
    const joyas = new THREE.Group(); g.add(joyas);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.2, 8, 20), mat('#facc15', 1, { metalness: 0.8, roughness: 0.2 })); anillo.position.set(-0.9 * lado, 0.6, 9.5); anillo.rotation.x = Math.PI / 2; joyas.add(anillo);
    const reloj = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 1.2, 22), mat('#1e293b', 1, { roughness: 0.3 })); reloj.position.set(0, 0, -5.8); reloj.rotation.z = Math.PI / 2; joyas.add(reloj);
    const pulsera = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.35, 8, 28), mat('#e11d48', 1)); pulsera.position.set(0, 0, -9); joyas.add(pulsera);
    // espuma: esferas sobre la mano y el antebrazo, ordenadas de distal a proximal
    const esp = []; const eg = new THREE.Group(); g.add(eg);
    const N = 150; for (let i = 0; i < N; i++) {
      const t = i / (N - 1); // 0 = punta de dedos, 1 = codo
      const z = lerp(14, -27, t); const ang = Math.random() * 6.28; const r = (z > 0 ? 2.6 : z > -3 ? 3.6 : lerp(3.4, 4.9, clamp((-z - 3) / 24, 0, 1))) + 0.25;
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.55 + Math.random() * 0.45, 8, 6), mEspuma); s.position.set(Math.cos(ang) * (z > 0 ? r * 1.8 : r), Math.sin(ang) * r * (z > 0 ? 0.55 : 1), z); s.visible = false; s.renderOrder = 5; eg.add(s); esp.push({ m: s, t, base: s.scale.x });
    }
    const aro = new THREE.Mesh(new THREE.TorusGeometry(5.3, 0.22, 8, 36), mat('#22d3ee', 0.95, { emissive: 0x22d3ee, emissiveIntensity: 0.9, depthWrite: false })); aro.rotation.y = Math.PI / 2; aro.visible = false; aro.renderOrder = 7; g.add(aro);
    const doblez = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.55, 8, 24), mGuante); doblez.position.z = -5; doblez.visible = false; g.add(doblez);
    return { lado, g, mano, ante, codo, joyas, esp, aro, doblez, guante: 0, glove: false };
  });
  const [mR, mL] = manos;

  // --- guantes estériles: paquete con solapas sobre una mesita lateral + par de guantes
  const mesa = new THREE.Mesh(new THREE.BoxGeometry(26, 2, 20), mat('#94a3b8', 1, { roughness: 0.3 })); mesa.position.set(36, 2, 0); mesa.visible = false; raiz.add(mesa);
  const paq = new THREE.Group(); paq.position.set(36, 3.2, 0); paq.visible = false; raiz.add(paq);
  const base = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 14), mPapel); paq.add(base);
  const solapaI = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 14), mPapel); solapaI.geometry.translate(4.5, 0, 0); solapaI.position.set(-9, 0.3, 0); paq.add(solapaI);
  const solapaD = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 14), mPapel); solapaD.geometry.translate(-4.5, 0, 0); solapaD.position.set(9, 0.3, 0); paq.add(solapaD);
  const par = [1, -1].map((l) => { const gm = crearMano(mGuante, l); gm.scale.setScalar(0.62); gm.rotation.set(0, 0, 0); gm.position.set(l * 4.2, 0.9, -5); gm.visible = false; paq.add(gm); return gm; });

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
  const poneBrazo = (m, x, y, z, alto, yaw) => {
    // mano a la altura 'y'; antebrazo hacia atrás/abajo; 'alto' = 0 (horizontal hacia el lavabo) a 1 (manos en alto, codos abajo)
    m.g.position.set(x, y, z);
    const tilt = lerp(-0.55, -1.05, alto); // dedos hacia arriba
    m.g.quaternion.setFromEuler(new THREE.Euler(tilt, yaw * m.lado, 0, 'YXZ'));
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
    chorro.scale.x = chorro.scale.z = 0.85 + 0.15 * Math.sin(t / 60); chorro.material.opacity = 0.45 + 0.15 * Math.sin(t / 90);
    gotas.forEach((g, i) => { g.m.visible = agua; if (!agua) return; const y = ((t / 1000) * g.v + g.ph * 3) % 14; g.m.position.set(Math.cos(g.ph + i) * 0.7 * (y / 14 + 0.3), pico.y - y, pico.z + Math.sin(g.ph + i) * 0.5); g.m.scale.setScalar(0.7 + 0.5 * Math.sin(t / 130 + i)); });
    // joyas
    prog.acc = lerp(prog.acc, s('acc') ? 1 : 0, easeK(dt, 2.4));
    manos.forEach((m) => { m.joyas.visible = prog.acc < 0.98; m.joyas.position.y = prog.acc * 22; m.joyas.scale.setScalar(1 - prog.acc * 0.9); });
    // postura de los brazos: lavado (horizontal sobre el lavabo) vs manos en alto
    prog.alto = lerp(prog.alto, s('alto') ? 1 : 0, easeK(dt, 2.2)); prog.codo = lerp(prog.codo, s('cierra') ? 1 : 0, easeK(dt, 3));
    const sec = s('seca'); const guantes = s('paq');
    const yMano = lerp(10, 24, prog.alto), zMano = lerp(-2, 6, prog.alto);
    let shake = 0; if (faseLav && !s('enj1') && !s('alto')) shake = Math.sin(t / 130) * 1.2;
    poneBrazo(mR, 7.5 + shake * 0.2, yMano + Math.abs(shake) * 0.3, zMano, prog.alto, 1.55); poneBrazo(mL, -7.5 - shake * 0.2, yMano + Math.abs(shake) * 0.3, zMano, prog.alto, 1.55);
    if (prog.codo > 0.02) { mR.g.position.x -= prog.codo * 2.2; mR.g.position.y -= prog.codo * 4; } // el codo baja a empujar la palanca
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
    if (cepillo.visible) { const tt = t / 1000; const z0 = brushOn ? lerp(10, -22, (Math.sin(tt * 2.2) * 0.5 + 0.5)) : 8; const wp = V(7.5 * (Math.floor(tt / 3) % 2 ? -1 : 1) * (brushOn ? 1 : 0.6), yMano + 2.4, zMano - z0 * 0.38); cepillo.position.lerp(wp, k * 1.5); cepillo.rotation.set(0.3, 0, Math.sin(tt * 9) * 0.25); }
    palito.visible = s('unas') && !s('lav1'); if (palito.visible) palito.position.set(mR.g.position.x - 1, yMano + 1.5 + Math.sin(t / 120) * 0.5, zMano + 11 - Math.sin(t / 220) * 0.8), palito.rotation.set(1.2, 0, 0.3);
    // cronómetro de la fase de lavado
    const durMs = { 0: 0, 1: 7000, 2: 7000, 3: 7000 }; if (faseLav && !s('alto')) tiempo = Math.min(300, tiempo + dt * (180 / 21)); else if (!faseLav) tiempo = 0;
    hr.dataset.on = (faseLav && !s('seca')) ? '1' : '0'; const seg = Math.round(tiempo); hr.querySelector('b').textContent = `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`; hr.querySelector('u').style.width = `${(tiempo / 300) * 100}%`; hr.classList.toggle('ok', tiempo >= 180);
    // toalla estéril: de los dedos al codo, una sola dirección
    prog.toalla = lerp(prog.toalla, sec ? 1 : 0, easeK(dt, 0.7)); toalla.visible = sec && !guantes;
    if (toalla.visible) { const q = (t / 1700) % 1; const z = lerp(8, -18, q); toalla.position.set(mR.g.position.x - 0.5, mR.g.position.y + 2 + 0.3 * Math.sin(q * 12), mR.g.position.z - z * 0.4); toalla.rotation.set(0.5, 0, 0); }
    // paquete y guantes
    mesa.visible = paq.visible = s('paq') || s('abre'); prog.abre = lerp(prog.abre, s('abre') ? 1 : 0, easeK(dt, 2.5));
    solapaI.rotation.z = -prog.abre * 2.7; solapaD.rotation.z = prog.abre * 2.7; par.forEach((gm) => { gm.visible = prog.abre > 0.5; });
    // colocación: 1.º guante en la mano derecha, 2.º en la izquierda, estiramientos
    manos.forEach((m, i) => { const puesto = i === 0 ? s('g1') : s('g2a'); if (puesto !== m.glove) { m.glove = puesto; m.g.traverse((o) => { if (o.isMesh && !o.userData.fijo && (o === m.ante || o === m.codo || m.mano.children.some((h) => h.children.includes(o)) || o.parent === m.mano.userData.hold)) { /* se recolorea abajo */ } }); } });
    const recol = (m, col) => { m.mano.traverse((o) => { if (o.isMesh && o.material !== col) o.material = o.material.isMeshPhysicalMaterial && o.userData.cuff ? o.material : col; }); };
    recol(mR, s('g1') ? mGuante : mPiel); recol(mL, s('g2a') ? mGuante : mPiel);
    // los guantes del paquete desaparecen al usarlos
    par[0].visible = prog.abre > 0.5 && !s('g1'); par[1].visible = prog.abre > 0.5 && !s('g2a');
    // movimiento hacia el paquete al ponerse los guantes
    if (guantes) { const fase = s('g2a') ? 2 : s('g1') ? 1 : s('puntas') ? 0.5 : 0; const wob = Math.sin(t / 260) * 0.3; mR.g.position.set(30 + wob, 12, 6); mR.g.quaternion.setFromEuler(new THREE.Euler(-0.6, 1.2, 0, 'YXZ')); mL.g.position.set(-8 + (fase >= 2 ? 22 : 0), 12 + (fase >= 2 ? 0 : 6), 4); mL.g.quaternion.setFromEuler(new THREE.Euler(-0.7, 1.55, 0, 'YXZ')); }
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
