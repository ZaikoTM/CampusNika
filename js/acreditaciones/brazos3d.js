// Brazos articulados de la paciente (hombro → codo → muñeca → mano) para el examen mamario.
// Cinemática inversa de dos huesos: cada pose define dónde queda la muñeca, hacia dónde apunta el codo y hacia dónde mira la palma;
// el brazo se resuelve solo y la mano se acopla a la muñeca. Todo en cm, en el marco del modelo (x lateral, y arriba, z anterior).
import * as THREE from 'three';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const EJE_Y = V(0, 1, 0);

// hombro (centro de la cara de corte del torso: x = ±21.5, y ≈ 41, z ≈ −12) y longitudes de los huesos
const HOMBRO = (sx) => V(sx * 20.5, 42, -12.2);
const L_SUP = 27, L_ANT = 24;

// poses de un brazo; sx = −1 brazo derecho de la paciente (x < 0), +1 izquierdo
const POSES = (sx) => ({
  reposo: { W: V(sx * 24.8, -5, -8.8), polo: V(sx * 0.5, -0.2, -1), palma: V(-sx, 0, 0) },                // colgando a los costados, palma hacia el muslo
  cintura: { W: V(sx * 19.8, 6.5, -7.6), polo: V(sx * 1, 0.1, -0.35), palma: V(-sx, -0.15, 0.25) },       // manos en la cintura, codos hacia afuera
  alto: { W: V(sx * 6.8, 57, -19.5), polo: V(sx * 1, 0.5, 0.35), palma: V(0, 0, 1) },                     // manos detrás de la cabeza/nuca, codos hacia afuera
});

export function crearBrazosPaciente({ matPiel, crearMano, capa }) {
  const lados = [-1, 1].map((sx) => {
    const g = new THREE.Group(); capa.add(g);
    const sup = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 4.5, 1, 28, 1), matPiel);
    const codo = new THREE.Mesh(new THREE.SphereGeometry(3.5, 20, 14), matPiel);
    const hombro = new THREE.Mesh(new THREE.SphereGeometry(4.6, 20, 14), matPiel);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.95, 1, 28, 1), matPiel);       // arriba (+y local) = muñeca, abajo = codo
    const mano = crearMano(matPiel, sx, { piel: true }); mano.pose('suave');
    g.add(sup, codo, hombro, ant, mano);
    const P = POSES(sx);
    const act = { W: P.reposo.W.clone(), polo: P.reposo.polo.clone(), palma: P.reposo.palma.clone() };
    return { sx, g, sup, codo, hombro, ant, mano, P, act, pose: 'reposo' };
  });

  const resolver = (L) => {
    const S = HOMBRO(L.sx), W0 = L.act.W.clone();
    let d = S.distanceTo(W0); const dir = W0.clone().sub(S).normalize();
    d = Math.min(Math.max(d, 8), L_SUP + L_ANT - 0.05);
    const W = S.clone().addScaledVector(dir, d);
    const a = (L_SUP * L_SUP - L_ANT * L_ANT + d * d) / (2 * d); const h = Math.sqrt(Math.max(L_SUP * L_SUP - a * a, 0));
    const polo = L.act.polo.clone(); polo.addScaledVector(dir, -polo.dot(dir)); if (polo.lengthSq() < 1e-6) polo.set(L.sx, 0, -0.3); polo.normalize();
    const E = S.clone().addScaledVector(dir, a).addScaledVector(polo, h);

    // brazo (hombro → codo)
    const u = E.clone().sub(S); const lu = u.length();
    L.sup.position.copy(S).addScaledVector(u, 0.5); L.sup.scale.set(1, lu, 1); L.sup.quaternion.setFromUnitVectors(EJE_Y, u.normalize());
    L.hombro.position.copy(S); L.codo.position.copy(E);
    // base de la mano: z = dirección del antebrazo, y = hacia donde mira la palma, x = y × z
    const f = W.clone().sub(E).normalize();
    const yH = L.act.palma.clone().addScaledVector(f, -L.act.palma.dot(f)); if (yH.lengthSq() < 1e-6) yH.set(0, 0, 1); yH.normalize();
    const xH = new THREE.Vector3().crossVectors(yH, f).normalize();
    // antebrazo: eje a lo largo de f, aplanado en la dirección de la palma (misma base que la mano → la muñeca calza)
    const lf = W.distanceTo(E);
    L.ant.position.copy(E).addScaledVector(f, lf * 0.5); L.ant.scale.set(1, lf, 0.66);
    L.ant.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xH, f, yH.clone().negate()));
    // la malla de la mano tiene la muñeca desplazada 1.8 cm en x respecto de su origen
    L.mano.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xH, yH, f));
    L.mano.position.copy(W).addScaledVector(xH, 1.8 * L.sx).addScaledVector(f, -0.6);
  };

  return {
    lados,
    update(dt, pose, poseDer, poseIzq) {
      const k = 1 - Math.exp(-dt * 6);
      lados.forEach((L, i) => {
        const nombre = (i === 0 ? poseDer : poseIzq) || pose; L.pose = nombre;
        const T = L.P[nombre] || L.P.reposo;
        L.act.W.lerp(T.W, k); L.act.polo.lerp(T.polo, k); L.act.palma.lerp(T.palma, k);
        resolver(L);
      });
    },
    setVisible(v) { lados.forEach((L) => { L.g.visible = v; }); },
  };
}
