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
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TIPOS as SIMT } from './sim3d.js?v=8';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const geoCache = { stl: new Map(), glb: new Map() }; // evita volver a descargar al cambiar de modo o de variante

export class MedicalProcedureViewer {
  constructor(CFG) {
    if (typeof window !== "undefined") window.AcrVisor = this;
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
          <button data-tool="v-lat" type="button">${(this.CFG.general.vistas || {}).lat || 'Lateral'}</button>
          <button data-tool="v-fro" type="button">${(this.CFG.general.vistas || {}).fro || 'Frontal'}</button>
          <button data-tool="v-sup" type="button">${(this.CFG.general.vistas || {}).sup || 'Superior'}</button>
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
        ${this.CFG.overlay_html || ''}
        <div class="acr3d-hint">Arrastrá o usá los botones · rueda para acercar</div>
      </div>
      ${this.CFG.dock_html || ''}
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
    const gm = new THREE.Group(); gm.position.copy(o).negate();
    const rotg = new THREE.Group(); rotg.rotation.order = 'YXZ'; rotg.rotation.set(...(cfg.rotacion || [0, 0, 0])); rotg.add(gm); C.scene.add(rotg); C.gm = gm; C.rotg = rotg;
    ['piel', 'huesos', 'organos', 'sonda'].forEach((k) => { C.capas[k] = new THREE.Group(); gm.add(C.capas[k]); });
    // silueta pélvica inmediata (no torso completo)
    if (cfg.piel) {
      const perfil = cfg.piel.radios.map(([r, y]) => new THREE.Vector2(r, y));
      const piel = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), this.material(0x5b9bff, 0.1, 'piel', { roughness: 0.15, clearcoat: 0.9 }));
      this.registrar(piel, 'piel', null); piel.scale.set(1, 1, cfg.piel.escala_z); piel.position.set(...cfg.piel.pos.map((v, i) => v + cfg.origen[i]));
      C.capas.piel.add(piel);
    }
    Object.values(cfg.procedurales || {}).forEach((d) => this.tuboProc(d));
    C.anclas = {}; Object.entries(cfg.pines).forEach(([k, v]) => { C.anclas[k] = V(...v).sub(o).applyEuler(rotg.rotation); });
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
      if (p.pivote) { const gp = new THREE.Group(); gp.position.set(...p.pivote); obj.position.sub(gp.position); gp.rotation.set(...(p.rot_pivote || [0, 0, 0])); gp.add(obj); C.capas[p.capa].add(gp); }
      else C.capas[p.capa].add(obj);
      if (p.anim) { C.anim = C.anim || {}; (C.anim[p.anim] = C.anim[p.anim] || []).push(obj); }
    });
    if (this.CFG.general.corte_inicial) { C.opt.cut = true; const bc = C.vp.querySelector('[data-tool="cut"]'); if (bc) bc.classList.add('on'); }
    this.aplicarLook();
  }

  // instrumental animable
  instrumentos(variante) {
    const C = this.C; const cfg = this.CFG[variante]; const gen = this.CFG.general;
    C.inst = [];
    (this.CFG.instrumentos || []).forEach((ins) => {
      if (SIMT[ins.tipo]) { SIMT[ins.tipo](this, ins, cfg, C); return; }
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
      if (ins.tipo === 'dedo') {
        const d = cfg.dedo; const pts = [...d.cola, ...d.canal].map((p) => V(...p)); const piv = V(...d.pivote);
        const curva = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
        const rad = ins.radio || 0.7;
        const geo = new THREE.TubeGeometry(curva, 260, rad, 16, false);
        const g = new THREE.Group(); g.position.copy(piv);
        const mat = this.material(ins.color, 0.97, 'sonda', { emissive: 0x0891b2, emissiveIntensity: 0.5, depthWrite: true });
        const dedo = new THREE.Mesh(geo, mat); dedo.position.copy(piv).multiplyScalar(-1); dedo.visible = false;
        this.registrar(dedo, 'sonda', null);
        mat.depthTest = false; mat.opacity = 0.9; dedo.renderOrder = 10;   // se ve a través de la pared rectal translúcida
        const tip = new THREE.Mesh(new THREE.SphereGeometry(rad, 20, 14), mat); tip.visible = false; tip.renderOrder = 10;
        g.add(dedo, tip); C.capas.sonda.add(g);
        C.inst.push({ tipo: ins.tipo, clases: ins.clases, cat: { mesh: dedo, total: geo.index.count, per: 16 * 6, cur: 0, goal: 0 },
          bal: { mesh: new THREE.Object3D(), cur: 0.001, goal: 0.001 }, bolsa: { g: new THREE.Object3D(), cur: 0.001, goal: 0.001 }, con: new THREE.Object3D(),
          dedo: { g, tip, curva, piv, barr: false } });
      }

      if (ins.tipo === 'laringoscopio') {
        const L = cfg.laringo; const g = new THREE.Group(); g.position.set(...L.bisagra); const pose = new THREE.Group(); g.add(pose);
        const tip0 = V(0, ...L.hoja[L.hoja.length - 1]); const pv = new THREE.Group(); pv.position.copy(tip0); pose.add(pv); const cont = new THREE.Group(); cont.position.copy(tip0).negate(); pv.add(cont);
        const matM = this.material('#a8b5c6', 1, 'sonda', { metalness: 0.25, roughness: 0.4, clearcoat: 0.3, emissive: 0x233449, emissiveIntensity: 0.5, depthWrite: true });
        const matH = this.material('#e2e8f0', 1, 'sonda', { metalness: 0.25, roughness: 0.3, clearcoat: 0.4, emissive: 0x3b4d63, emissiveIntensity: 0.55, depthWrite: true });
        const pts = L.hoja.map(([y, z]) => V(0, y, z)); const curva = new THREE.CatmullRomCurve3(pts);
        const hoja = new THREE.Mesh(new THREE.TubeGeometry(curva, 48, L.grosor || 0.5, 12, false), matH); hoja.scale.x = 1.7; matH.depthTest = false; hoja.renderOrder = 9; cont.add(hoja);
        const dir = V(0, L.mango.dir[0], L.mango.dir[1]).normalize();
        const mango = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, L.mango.largo, 24), matM);
        mango.quaternion.setFromUnitVectors(V(0, 1, 0), dir); mango.position.copy(dir).multiplyScalar(L.mango.largo / 2 + 0.3); cont.add(mango);
        for (let i = 0; i < 6; i++) { const aro = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.09, 8, 24), matH); aro.quaternion.setFromUnitVectors(V(0, 0, 1), dir); aro.position.copy(dir).multiplyScalar(2 + i * 1.5); cont.add(aro); }
        const bis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), matM); bis.quaternion.setFromUnitVectors(V(0, 1, 0), dir); cont.add(bis);
        const tip = pts[pts.length - 1]; const dl = tip.clone().sub(pts[pts.length - 3]).normalize();
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfffbe0 })); bulb.position.copy(tip); cont.add(bulb);
        const spot = new THREE.SpotLight(0xfff0bd, 0, 0, 0.55, 0.75, 1.1); spot.position.copy(tip); const tg = new THREE.Object3D(); tg.position.copy(tip).add(dl.clone().multiplyScalar(8)); cont.add(tg, spot); spot.target = tg;
        const conoMat = new THREE.MeshBasicMaterial({ color: 0xfff2b8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
        const cono = new THREE.Mesh(new THREE.ConeGeometry(3.4, 9, 28, 1, true), conoMat); cono.quaternion.setFromUnitVectors(V(0, -1, 0), dl); cono.position.copy(tip).add(dl.clone().multiplyScalar(4.5)); cono.renderOrder = 8; cont.add(cono);
        g.traverse((m) => { if (m.isMesh && m.material && m.material.userData && m.material.userData.capa) this.registrar(m, 'sonda', 'laringoscopio'); });
        g.visible = false; C.capas.sonda.add(g);
        const E = { cur: 0, goal: 0 };
        const POS = [[0, 0, 0, 0], [0, 3.0, 11, 0.0], [0, 0, 0, 0], [0, 0.2, 1.1, L.giro || -0.41]];   // [x, y, z, giro] por etapa; la etapa 0 se oculta
        const ent = { tipo: ins.tipo, cat: { goal: 0 },
          sync: (has) => { const c = ins.clases; E.goal = has(c.fuera) ? 0 : has(c.palanca) ? 3 : has(c.dentro) ? 2 : has(c.mano) ? 1 : 0; ent.cat.goal = E.goal > 0 ? 1 : 0; },
          tick: (t) => {
            E.cur += (E.goal - E.cur) * 0.06; if (Math.abs(E.goal - E.cur) < 0.002) E.cur = E.goal;
            g.visible = E.cur > 0.04; if (!g.visible) return;
            const a = Math.min(2, Math.floor(E.cur)), f = E.cur - a;
            const P0 = a === 0 ? [0, 8, 26, 0] : POS[a], P1 = POS[a + 1] || POS[a];
            const m = (i) => P0[i] + (P1[i] - P0[i]) * f;
            pose.position.set(0, m(1), m(2)); pv.rotation.x = m(3);
            const on = E.cur > 1.5 ? 1 : 0.35 * (E.cur > 0.5 ? 1 : 0);
            spot.intensity += (on * L.luz - spot.intensity) * 0.1; conoMat.opacity += (on * 0.2 - conoMat.opacity) * 0.1;
            bulb.scale.setScalar(1 + 0.15 * Math.sin(t / 140));
          } };
        C.inst.push(ent);
      }
      if (ins.tipo === 'tet') {
        const T = cfg.tet; const pts = T.ruta.map((p) => V(...p)); const curva = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
        const rad = ins.radio || 0.5; const geo = new THREE.TubeGeometry(curva, 320, rad, 14, false);
        const mat = this.material(ins.color, 0.92, 'sonda', { emissive: 0x38bdf8, emissiveIntensity: 0.28, depthWrite: true });
        mat.depthTest = false; const tubo = new THREE.Mesh(geo, mat); tubo.visible = false; tubo.renderOrder = 10; this.registrar(tubo, 'sonda', 'tet'); C.capas.sonda.add(tubo);
        const bal = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), this.material(ins.color_balon, 0.8, 'sonda', { emissive: 0x0284c7, emissiveIntensity: 0.4 }));
        this.registrar(bal, 'sonda', 'balon'); bal.position.copy(V(...T.balon)); bal.scale.set(0.001, 0.001, 0.001); C.capas.sonda.add(bal);
        const conector = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.6, 16), this.material('#2563eb', 1, 'sonda', { depthWrite: true })); conector.visible = false; C.capas.sonda.add(conector);
        const u = (p) => { let mejor = 0, d0 = 1e9; for (let i = 0; i <= 600; i++) { const q = curva.getPointAt(i / 600); const d = q.distanceTo(V(...p)); if (d < d0) { d0 = d; mejor = i / 600; } } return mejor; };
        const U = { fuera: u(T.fuera), cuerdas: u(T.pasa_cuerdas), fondo: 1 };
        const inicio = pts[0].clone(), sig = curva.getPointAt(0.03); conector.position.copy(inicio); conector.quaternion.setFromUnitVectors(V(0, 1, 0), sig.clone().sub(inicio).normalize());
        const e = { cat: { mesh: tubo, total: geo.index.count, per: 14 * 6, cur: 0, goal: 0 }, bal: { mesh: bal, cur: 0.001, goal: 0.001 }, bolsa: { g: new THREE.Object3D(), cur: 0.001, goal: 0.001 }, con: new THREE.Object3D(), tipo: ins.tipo };
        e.sync = (has) => { const c = ins.clases; e.cat.goal = has(c.profundo) ? U.fondo : has(c.avance) ? U.cuerdas : has(c.mano) ? U.fuera : 0; e.bal.goal = has(c.inflar) ? 1.25 : 0.5; };
        e.tick2 = () => { conector.visible = e.cat.cur > 0.003; };
        C.inst.push(e);
      }
      if (ins.tipo === 'ventila') {
        const V0 = cfg.ventila; const g = new THREE.Group(); g.visible = false; C.capas.sonda.add(g);
        const mask = new THREE.Group(); mask.position.set(...V0.mascara); mask.rotation.x = Math.PI / 2;
        const dom = new THREE.Mesh(new THREE.SphereGeometry(3.4, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), this.material('#7dd3fc', 0.5, 'sonda', { emissive: 0x0ea5e9, emissiveIntensity: 0.25 })); mask.add(dom);
        const borde = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.35, 10, 32), this.material('#e0f2fe', 0.9, 'sonda', { depthWrite: true })); borde.rotation.x = Math.PI / 2; mask.add(borde);
        const bolsaM = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), this.material('#bae6fd', 0.85, 'sonda', { emissive: 0x38bdf8, emissiveIntensity: 0.3 })); bolsaM.scale.set(2.4, 2.4, 3.2); bolsaM.position.set(0, 4.8, 0); mask.add(bolsaM);
        g.add(mask);
        const bolsaT = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), this.material('#bae6fd', 0.85, 'sonda', { emissive: 0x38bdf8, emissiveIntensity: 0.3 })); bolsaT.position.set(...V0.bolsa_tet); bolsaT.scale.set(2.2, 2.2, 3.4); g.add(bolsaT);
        const conT = this.tuboProc({ pts: V0.cuello_bolsa, radio: 0.45, color: '#38bdf8', opacidad: 0.95, capa: 'sonda', hs: null }); conT.visible = false;
        let modo = 0;
        C.inst.push({ tipo: ins.tipo, cat: { goal: 0 },
          sync: (has) => { const c = ins.clases; modo = has(c.bolsa_tet) ? 2 : (has(c.mascara) && !has(c.laringo)) ? 1 : 0; },
          tick: (t) => {
            const mm = (window.AcrMonitor && window.AcrMonitor.activo && window.AcrMonitor.ventilando) ? 1 : modo;
            g.visible = mm > 0; mask.visible = mm === 1; bolsaT.visible = mm === 2; conT.visible = mm === 2; if (!g.visible) return;
            const s = 1 + 0.2 * Math.sin(t / 520);
            if (mm === 1) bolsaM.scale.set(2.4 * s, 2.4 * s, 3.2 * (0.9 + 0.2 * Math.sin(t / 520))); else bolsaT.scale.set(2.2 * s, 2.2 * s, 3.4 * (0.9 + 0.2 * Math.sin(t / 520)));
          } });
      }
      if (ins.tipo === 'presion') {
        const P = cfg.presion; const g = new THREE.Group(); g.position.set(...P.punto); g.visible = false; C.capas.sonda.add(g);
        const mat = this.material('#f59e0b', 0.95, 'sonda', { emissive: 0xf59e0b, emissiveIntensity: 0.6, depthWrite: true });
        const dedo = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 2.4, 6, 12), mat); dedo.rotation.x = Math.PI / 2; dedo.position.z = 1.9; g.add(dedo);
        const fl = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.5, 16), mat); fl.rotation.x = -Math.PI / 2; fl.position.z = 4.6; g.add(fl);
        let on = false;
        C.inst.push({ tipo: ins.tipo, cat: { goal: 0 }, sync: (has) => { const c = ins.clases; on = has(c.activa) && !has(c.suelta); },
          tick: (t) => { g.visible = on; if (on) g.position.z = P.punto[2] + 0.35 * Math.sin(t / 260); } });
      }

      if (ins.tipo === 'compresion') {
        const K = cfg.compresion; const g = new THREE.Group(); g.position.set(...K.sitio); g.visible = false; C.capas.sonda.add(g);
        // manos enguantadas (nitrilo) entrelazadas: el talón de la mano apoya en el esternón y los brazos suben con los codos extendidos
        const mG = this.material('#72c9f2', 0.98, 'sonda', { roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.2, emissive: 0x0b4f78, emissiveIntensity: 0.16, depthWrite: true });
        const mM = this.material('#2dd4bf', 0.95, 'sonda', { roughness: 0.7, clearcoat: 0, emissive: 0x0f766e, emissiveIntensity: 0.18, depthWrite: true });
        const esf = (rx, ry, rz, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat || mG); m.scale.set(rx, ry, rz); m.position.set(x, y, z); g.add(m); return m; };
        const cil = (r1, r2, L, x, y, z, rx, ry, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, L, 20), mat || mG); m.position.set(x, y, z); m.rotation.set(rx || 0, 0, ry || 0); g.add(m); return m; };
        // dorso de las manos entrelazadas (visto desde arriba/lateral): masa redondeada, el talón apoya en el esternón
        esf(4.6, 3.7, 1.9, 0, 0, 1.4);                                   // dorso mano superior
        esf(4.3, 3.3, 1.4, 1.2, 0, 0.5);                                 // mano inferior (talón sobre el esternón)
        for (let i = 0; i < 4; i++) esf(0.95, 0.95, 0.85, 4.1, -2.5 + i * 1.65, 1.0);   // nudillos
        for (let i = 0; i < 4; i++) { const d = esf(1.7, 0.78, 0.75, 6.1, -2.4 + i * 1.6, 0.9); d.rotation.z = (i - 1.5) * 0.06; }   // dedos entrelazados
        esf(2.0, 0.85, 0.8, 1.2, 4.0, 1.5).rotation.z = -0.5;           // pulgar derecho
        esf(2.0, 0.85, 0.8, 1.2, -4.0, 1.5).rotation.z = 0.5;           // pulgar izquierdo
        // muñecas y antebrazos con manga, brazos extendidos y ligeramente abiertos
        cil(1.7, 1.9, 3.5, -4.6, 0, 2.6, 0, 0, null).rotation.set(0, 1.0, 0);
        const br = cil(2.1, 2.5, K.brazos, -6.2, 0, 4.0 + K.brazos / 2, Math.PI / 2, 0, mM);
        br.rotation.set(Math.PI / 2, 0, 0);
        const proc = [...g.children].filter((x) => x !== br);                                          // manos procedurales (respaldo si el modelo no carga)
        if (K.manos) {                                                                                     // manos reales entrelazadas (escaneo CC-BY, ver LICENSE_manos.txt)
          const ld = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'));
          ld.load(K.manos.src, (gl) => {
            const w = new THREE.Group(); const D = Math.PI / 180;
            gl.scene.traverse((m) => { if (m.isMesh) { m.material = mG; m.geometry.computeVertexNormals(); this.registrar(m, 'sonda', 'mano'); } });
            w.add(gl.scene); w.scale.setScalar(K.manos.escala); w.rotation.set(...K.manos.rot.map((v) => v * D), 'YXZ'); w.position.set(...K.manos.pos);
            g.add(w); proc.forEach((x) => g.remove(x)); window.__manos = w;
          }, undefined, () => {});
        }
        g.traverse((m) => { if (m.isMesh) this.registrar(m, 'sonda', 'mano'); });
        const ent = { tipo: ins.tipo, cat: { goal: 0 }, st: { mano: false, rcp: false, rosc: false, muerte: false } };
        ent.sync = (has) => { const c = ins.clases; ent.st = { mano: has(c.mano), rcp: has(c.rcp), rosc: has(c.rosc), muerte: has(c.muerte) }; ent.cat.goal = ent.st.rcp && !ent.st.rosc && !ent.st.muerte ? 1 : 0; };
        let t0 = 0;
        ent.tick = (t) => {
          const s = ent.st; const A = C.anim || {}; const comprime = s.rcp && !s.rosc && !s.muerte;
          const pausa = window.AcrMonitor && window.AcrMonitor.activo && !window.AcrMonitor.rcpActiva();
          g.visible = (s.mano || s.rcp) && !s.rosc && !s.muerte;
          let p = 0;
          if (comprime && !pausa) { if (!t0) t0 = t; const mon = window.AcrMonitor && window.AcrMonitor.activo; const f = mon ? window.AcrMonitor.rcpFase() : (((t - t0) / 1000) * (K.frecuencia || 110) / 60) % 1; p = f < 0.45 ? Math.sin((f / 0.45) * Math.PI / 2) : Math.cos(((f - 0.45) / 0.55) * Math.PI / 2); } else t0 = 0;
          const prof = (K.profundidad || 4.5) * p;
          g.position.z = K.sitio[2] - prof;
          (A.esternon || []).forEach((o) => { o.position.z = -prof; });
          const lat = s.rosc && !s.muerte ? Math.pow(Math.max(0, Math.sin(t / 1000 * 2 * Math.PI * 78 / 60)), 3) * 0.06 : 0;
          (A.corazon || []).forEach((o) => { o.scale.set(1, 1, 1 - 0.16 * p + lat); });
        };
        C.inst.push(ent);
      }
      if (ins.tipo === 'artro') {
        const A = cfg.artro; const E = V(...A.entrada), Dn = V(...A.dentro); const dir = Dn.clone().sub(E); const prof = dir.length(); dir.normalize();
        const root = new THREE.Group(); C.capas.sonda.add(root);
        const qd = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), dir);
        const mat = (c, o, ex) => { const m = this.material(c, o, 'sonda', Object.assign({ depthWrite: true }, ex || {})); m.depthTest = false; return m; };
        const cx = (r, rb) => { const g = new THREE.CylinderGeometry(r, rb === undefined ? r : rb, 1, 20); g.rotateZ(Math.PI / 2); return g; };    // eje a lo largo de +X, largo 1
        const mAc = mat('#d5dde5', 1, { metalness: 0.5, roughness: 0.22, clearcoat: 0.6, emissive: 0x3b4d63, emissiveIntensity: 0.45 });
        const mVid = mat('#dff3fb', 0.42, { roughness: 0.1, emissive: 0x7dd3fc, emissiveIntensity: 0.18 }); mVid.depthWrite = false;
        const mHub = mat('#16a34a', 1, { emissive: 0x16a34a, emissiveIntensity: 0.35 });
        const mLiq = mat('#f5e27a', 0.9, { emissive: 0xf5e27a, emissiveIntensity: 0.22 });
        const mPl = mat('#e2e8f0', 1, { roughness: 0.4, emissive: 0x3b4d63, emissiveIntensity: 0.4 });
        const jer = new THREE.Group(); jer.quaternion.copy(qd); jer.visible = false; root.add(jer);
        const aguja = new THREE.Mesh(cx(0.07), mAc); jer.add(aguja);                              // aguja (punta en el origen, hacia -x)
        const cono = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.2, 0.7, 16).rotateZ(Math.PI / 2), mHub); jer.add(cono);
        const barril = new THREE.Mesh(cx(0.55), mVid); jer.add(barril);
        const liq = new THREE.Mesh(cx(0.5), mLiq); jer.add(liq);
        const bridas = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 20).rotateZ(Math.PI / 2), mPl); jer.add(bridas);
        const varilla = new THREE.Mesh(cx(0.14), mPl); jer.add(varilla);
        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16).rotateZ(Math.PI / 2), mat('#334155', 1)); jer.add(piston);
        const pulgar = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.15, 18).rotateZ(Math.PI / 2), mPl); jer.add(pulgar);
        const llave = new THREE.Group(); llave.visible = false; jer.add(llave);                  // llave de 3 vías (para el derrame importante)
        llave.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.9, 14), mat('#38bdf8', 1, { emissive: 0x0284c7, emissiveIntensity: 0.4 })));
        const palanca = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.2), mat('#1d4ed8', 1)); palanca.position.y = 0.55; llave.add(palanca);
        const dims = { aneste: { L: 2.8, Lb: 4.4, rb: 0.5, hub: '#f59e0b' }, extrae: { L: 4.2, Lb: 5.0, rb: 0.55, hub: '#16a34a' }, grande: { L: 4.2, Lb: 7.2, rb: 0.95, hub: '#16a34a' } };
        let tipo = ''; let Lc = 4.2, Lbc = 5;
        const armar = (k) => {
          if (tipo === k) return; tipo = k; const d = dims[k]; Lc = d.L; Lbc = d.Lb;
          aguja.scale.x = d.L; aguja.position.x = -d.L / 2; cono.position.x = -d.L - 0.35; mHub.color.set(d.hub); mHub.emissive.set(d.hub);
          barril.scale.set(d.Lb, d.rb / 0.55, d.rb / 0.55); barril.position.x = -d.L - 0.7 - d.Lb / 2; liq.scale.set(0.001, d.rb / 0.5 * 0.88, d.rb / 0.5 * 0.88);
          bridas.position.x = -d.L - 0.7 - d.Lb; bridas.scale.set(1, d.rb / 0.55 * 1.0, d.rb / 0.55 * 1.0);
          piston.scale.set(1, d.rb / 0.5 * 0.98, d.rb / 0.5 * 0.98); llave.position.x = -d.L - 0.25;
        };
        armar('extrae');
        // ---- derrame (elipsoide en el receso suprarrotuliano), roncha anestésica, marcador del sitio, paño fenestrado, antisepsia y apósito
        const dc = V(...A.derrame_centro), dr = A.derrame_radios;
        const mDer = this.material('#f5e27a', 0.52, 'organos', { roughness: 0.08, clearcoat: 1, emissive: 0xf5e27a, emissiveIntensity: 0.28, depthWrite: false });
        const der = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 22), mDer); der.position.copy(dc); der.scale.set(...dr); C.capas.organos.add(der); der.userData.capa = 'organos'; der.renderOrder = 3;
        const mRon = mat('#fff1ea', 0.9, { emissive: 0xffd9c9, emissiveIntensity: 0.3 });
        const ronc = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mRon); ronc.position.set(A.lateral_x + 0.12, E.y, E.z); ronc.scale.setScalar(0.001); root.add(ronc);
        const mMarca = mat('#34d399', 0.95, { emissive: 0x10b981, emissiveIntensity: 0.9 });
        const marca = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.12, 10, 36), mMarca); marca.position.set(A.lateral_x - 0.05, E.y, E.z); marca.rotation.y = Math.PI / 2; marca.visible = false; root.add(marca);
        const mRoj = mat('#ef4444', 0.95, { emissive: 0xdc2626, emissiveIntensity: 0.9 });
        const prohib = new THREE.Group(); prohib.position.set(A.lateral_x - 0.1, E.y, E.z); prohib.rotation.y = Math.PI / 2; prohib.visible = false; root.add(prohib);
        prohib.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.2, 10, 40), mRoj)); { const bar = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 0.2), mRoj); bar.rotation.z = Math.PI / 4; prohib.add(bar); }
        const mCel = mat('#f87171', 0.45, { emissive: 0xdc2626, emissiveIntensity: 0.5 });
        const celu = new THREE.Mesh(new THREE.CircleGeometry(4.2, 36), mCel); celu.position.set(A.lateral_x + 0.03, E.y + 0.6, E.z + 0.4); celu.rotation.y = -Math.PI / 2; celu.visible = false; root.add(celu);
        const plano = (o) => { o.rotation.y = -Math.PI / 2; return o; };                       // lámina que mira hacia el lateral (-x)
        const mA1 = mat('#b45309', 0.5, { emissive: 0xb45309, emissiveIntensity: 0.25 });
        const a1 = []; [[6.8, 0], [5.4, 1.2], [6.2, 2.1]].forEach(([r, d]) => { const m = plano(new THREE.Mesh(new THREE.CircleGeometry(r, 40), mA1)); m.position.set(A.lateral_x + 0.06, E.y + d * 0.2, E.z + d * 0.15); m.scale.setScalar(0.001); m.visible = false; root.add(m); a1.push(m); });
        const mA2 = mat('#d97706', 0.78, { emissive: 0xf59e0b, emissiveIntensity: 0.55 });
        const a2 = []; for (let i = 0; i < 6; i++) { const m = plano(new THREE.Mesh(new THREE.RingGeometry(0.7 + i * 0.8, 0.7 + i * 0.8 + 0.22, 48), mA2)); m.position.set(A.lateral_x + 0.05, E.y, E.z); m.scale.setScalar(0.001); m.visible = false; root.add(m); a2.push(m); }
        const sh = new THREE.Shape(); sh.moveTo(-11, -11); sh.lineTo(11, -11); sh.lineTo(11, 11); sh.lineTo(-11, 11); sh.lineTo(-11, -11);
        const hole = new THREE.Path(); hole.absarc(0, 0, 6.2, 0, Math.PI * 2, true); sh.holes.push(hole);
        const mPano = this.material('#5fd0c0', 0.94, 'sonda', { roughness: 0.8, clearcoat: 0, emissive: 0x0f766e, emissiveIntensity: 0.22, depthWrite: true });
        const pano = plano(new THREE.Mesh(new THREE.ShapeGeometry(sh, 40), mPano)); pano.position.set(A.lateral_x - 0.28, E.y, E.z); pano.scale.setScalar(0.001); pano.visible = false; root.add(pano);
        const mApo = mat('#f8fafc', 1, { emissive: 0xe2e8f0, emissiveIntensity: 0.35 });
        const apos = new THREE.Group(); apos.position.set(A.lateral_x - 0.12, E.y, E.z); apos.visible = false; root.add(apos);
        { const pad = plano(new THREE.Mesh(new THREE.PlaneGeometry(6, 5), mApo)); apos.add(pad); const gasa = plano(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), mat('#cbd5e1', 1))); gasa.position.x = -0.03; apos.add(gasa);
          [-2.2, 2.2].forEach((dz) => { const t = plano(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 7.4), mat('#fde68a', 0.95))); t.position.z = dz; t.position.x = -0.02; apos.add(t); }); }
        // frasco colector con tubo (derrame importante)
        const bot = new THREE.Group(); bot.position.set(A.lateral_x - 8.5, E.y - 7.5, E.z - 1); bot.visible = false; root.add(bot);
        const bFr = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 6.2, 22), mat('#dff3fb', 0.4, { roughness: 0.1 })); bFr.material.depthWrite = false; bot.add(bFr);
        const bTapa = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.8, 18), mat('#2563eb', 1)); bTapa.position.y = 3.5; bot.add(bTapa);
        const bLiq = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 1, 22), mLiq); bLiq.scale.y = 0.001; bot.add(bLiq);
        let tubo = null;
        const ent = { tipo: ins.tipo, cat: { goal: 0 }, st: {}, root: null, jer, der };
        ent.sync = (has, raiz) => {
          const c = ins.clases; ent.st = {}; Object.keys(c).forEach((k) => { ent.st[k] = has(c[k]); }); ent.st.expo = has('s-expo'); ent.raiz = raiz || ent.raiz;
          if (ent.raiz) { const cs = getComputedStyle(ent.raiz); const col = (cs.getPropertyValue('--liq') || '').trim(); if (col) { mDer.color.set(col); mDer.emissive.set(col); mLiq.color.set(col); mLiq.emissive.set(col); }
            ent.vol = ent.raiz.dataset.vol || 'moderado'; ent.ml = parseFloat(ent.raiz.dataset.ml || '30') || 30; ent.contra = (ent.raiz.dataset.contra || '').toLowerCase(); }
        };
        let depth = -9, asp = 0, ultimo = 0, fill = 0, base = 1, rt = 0;
        const ease = (a, b, k) => a + (b - a) * k;
        ent.tick = (t) => {
          const dt = ultimo ? Math.min(0.1, (t - ultimo) / 1000) : 0.016; ultimo = t; const s = ent.st; const k = 1 - Math.exp(-dt * 6);
          const vol = ent.vol || 'moderado'; const ml = vol === 'escaso' ? 6 : (ent.ml || 30); const contra = !!s.contra;
          // derrame
          const baseSc = vol === 'grande' ? 1.38 : vol === 'escaso' ? 0.34 : 1; const tglt = !!ent.contra && !s.contra ? 0.95 : 1;
          let fr = 0; if (s.vacio) fr = 0.94; else if (s.evac) fr = 0.5; else if (s.aspira) fr = 0.08;
          const aspMeta = s.vacio ? ml : s.evac ? ml * 0.55 : s.aspira ? Math.min(3, ml * 0.2) : 0;
          if (!s.aspira) asp = 0; else asp = ease(asp, aspMeta, 1 - Math.exp(-dt * (vol === 'grande' ? 0.9 : 1.4)));
          const sc = baseSc * tglt * (1 - (asp / Math.max(1, ml)) * 0.93);
          der.scale.set(dr[0] * (0.25 + 0.75 * Math.min(1, sc)), dr[1] * (0.3 + 0.7 * Math.min(1, sc)), dr[2] * (0.2 + 0.8 * Math.min(1, sc))); der.visible = !(vol === 'escaso' && !s.aspira && false);
          mDer.opacity = 0.5 * Math.min(1, 0.2 + sc) ;
          // HUD de mL aspirados
          if (ent.raiz) { const hud = ent.raiz.querySelector('.art-hud'); if (hud) { hud.dataset.on = asp > 0.2 ? '1' : '0'; const b = hud.querySelector('.art-ml'); if (b) b.textContent = Math.round(asp); } }
          // roncha, marcador, rechazo
          const ronGoal = s.anest ? 1 : 0; const rs = ronc.scale.x; ronc.scale.setScalar(ease(rs, ronGoal * 0.55, k) + (ronGoal ? 0 : 0.0005));
          marca.visible = (s.sitio && !s.a1 && !contra) || false; if (marca.visible) { const p = 1 + 0.18 * Math.sin(t / 220); marca.scale.setScalar(p); }
          prohib.visible = contra; if (contra) prohib.scale.setScalar(1 + 0.08 * Math.sin(t / 200));
          celu.visible = !!ent.contra && ent.contra.indexOf('celulitis') >= 0 && (s.expo || contra);
          // antisepsia, campo y apósito
          a1.forEach((m, i) => { const on = s.a1 ? 1 : 0; m.visible = on > 0 || m.scale.x > 0.01; m.scale.setScalar(ease(m.scale.x, on, 1 - Math.exp(-dt * (2.2 - i * 0.4)))); });
          a2.forEach((m, i) => { const on = s.a2 ? 1 : 0; m.visible = on > 0 || m.scale.x > 0.01; const kk = on ? 1 - Math.exp(-dt * Math.max(0.35, 3.2 - i * 0.55)) : 0.3; m.scale.setScalar(ease(m.scale.x, on, kk)); });
          pano.visible = s.pano || pano.scale.x > 0.02; pano.scale.setScalar(ease(pano.scale.x, s.pano ? 1 : 0.001, 1 - Math.exp(-dt * 3.5)));
          apos.visible = !!s.apos;
          // jeringa
          let goal = -9; let want = 'extrae'; let pl = 0;
          if (contra) { goal = -9; }
          else if (s.anest && !s.aguja) { want = 'aneste'; if (s.espera) goal = -9; else { rt += dt; goal = 0.5 + 1.7 * (0.5 + 0.5 * Math.sin(rt * 1.4)); pl = 0.35 + 0.3 * Math.sin(rt * 1.4); } }
          else if (s.aguja && !s.punza) { goal = -5.5; }
          else if (s.punza && !s.dentro) { goal = prof * 0.5; }
          else if (s.dentro && !s.retira) { goal = prof; }
          else if (s.retira) { goal = -9; }
          if (s.llave) want = 'grande';
          armar(want);
          depth = ease(depth, goal, 1 - Math.exp(-dt * (s.punza ? 2.4 : 4)));
          const visible = depth > -8.5 && (s.anest || s.aguja) && !contra;
          jer.visible = visible; jer.position.copy(E).addScaledVector(dir, depth);
          // llenado del barril y émbolo
          let fl = 0;
          if (want === 'aneste') fl = 0.5 - pl * 0.5;
          else if (s.llave && s.evac && !s.vacio) fl = 0.5 + 0.5 * Math.sin(t / 700);
          else fl = Math.min(1, asp / (want === 'grande' ? 20 : 10));
          fill = ease(fill, fl, 1 - Math.exp(-dt * 6));
          liq.visible = !(want === 'aneste') || true; mLiq.color.set(want === 'aneste' ? '#f1f5f9' : mLiq.color.getStyle());
          const Lb = Lbc; liq.scale.x = Math.max(0.001, Lb * (want === 'aneste' ? 0.55 : fill)); liq.position.x = -Lc - 0.7 - liq.scale.x / 2;
          const px = -Lc - 0.7 - Lb * (want === 'aneste' ? 0.35 + 0.4 * (pl) : Math.max(0.02, fill));
          piston.position.x = px; varilla.scale.x = Lb + 0.6; varilla.position.x = px - (Lb + 0.6) / 2; pulgar.position.x = px - Lb - 0.6; bridas.position.x = -Lc - 0.7 - Lb;
          llave.visible = !!s.llave;
          // frasco colector
          bot.visible = !!s.llave && !contra;
          if (bot.visible) {
            bLiq.scale.y = Math.max(0.001, 5.6 * Math.min(1, asp / Math.max(1, ml))); bLiq.position.y = -3.1 + bLiq.scale.y / 2;
            if (!tubo) {
              const h = E.clone().addScaledVector(dir, prof).addScaledVector(dir, -(Lc + 0.25));
              const p0 = h, p3 = new THREE.Vector3(bot.position.x, bot.position.y + 3.9, bot.position.z);
              const cur = new THREE.CatmullRomCurve3([p0, p0.clone().add(V(-1.6, 0.4, 0.5)), V((p0.x + p3.x) / 2 - 1.5, (p0.y + p3.y) / 2 + 0.3, (p0.z + p3.z) / 2 + 0.4), p3]);
              tubo = new THREE.Mesh(new THREE.TubeGeometry(cur, 40, 0.14, 8, false), mat('#bae6fd', 0.8, { emissive: 0x38bdf8, emissiveIntensity: 0.3 })); root.add(tubo);
            }
            tubo.visible = true;
          } else if (tubo) tubo.visible = false;
        };
        C.inst.push(ent);
      }
      // otros tipos (catéter…) se agregan aquí con su propia animación
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

    const resize = () => { const w = vp.clientWidth, h = vp.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; const r = Math.min(C.reserva || 0, w * 0.6); if (r > 1) camera.setViewOffset(w, h, r / 2, 0, w, h); else camera.clearViewOffset(); camera.updateProjectionMatrix(); };
    C.resize = resize;
    C.ro = new ResizeObserver(resize); C.ro.observe(vp); resize();

    vp.querySelector('.acr3d-tools').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tool]'); if (!b || this.C !== C) return;
      const t = b.dataset.tool;
      if (t === 'full') { root.dispatchEvent(new CustomEvent('acr-full')); return; }
      if (t === 'ayuda') { root.dispatchEvent(new CustomEvent('acr-ayuda')); return; }
      if (t.startsWith('v-')) { C.tgoal = null; C.goal = V(...C.vistas[t.slice(2, 5)]); return; }
      if (t === 'xray' || t === 'cut' || t === 'labels') C.opt[t] = !C.opt[t]; else C.opt.capas[t] = !C.opt.capas[t];
      b.classList.toggle('on', t === 'xray' || t === 'cut' || t === 'labels' ? C.opt[t] : C.opt.capas[t]);
      this.aplicarLook();
    });
    controls.addEventListener('start', () => { C.goal = null; C.tgoal = null; C.lento = false; });
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
      if (C.tgoal) {
        controls.target.lerp(C.tgoal, 0.07);
        const off = camera.position.clone().sub(controls.target); const d = off.length(); const nd = d + (C.dgoal - d) * 0.07;
        camera.position.copy(controls.target).add(off.setLength(nd));
        if (controls.target.distanceTo(C.tgoal) < 0.05 && Math.abs(nd - C.dgoal) < 0.2) C.tgoal = null;
      }
      controls.update();
      C.inst.forEach((s) => {
        if (s.tick) { s.tick(t); return; }
        const k = s.cat; k.cur += (k.goal - k.cur) * 0.03; if (Math.abs(k.goal - k.cur) < 0.002) k.cur = k.goal;
        k.mesh.visible = k.cur > 0.003; k.mesh.geometry.setDrawRange(0, Math.floor((k.total * k.cur) / k.per) * k.per);
        const b = s.bal; b.cur += (b.goal - b.cur) * 0.07; b.mesh.scale.setScalar(Math.max(b.cur, 0.001)); b.mesh.visible = k.cur > 0.97;
        const g = s.bolsa; g.cur += (g.goal - g.cur) * 0.1; g.g.scale.setScalar(Math.max(g.cur, 0.001)); g.g.visible = g.cur > 0.01;
        s.con.visible = g.cur > 0.05 && k.cur > 0.05;
        if (s.tick2) s.tick2();
        if (s.dedo) { const e = s.dedo; e.tip.visible = k.cur > 0.02; if (e.tip.visible) e.tip.position.copy(e.curva.getPointAt(Math.min(k.cur, 0.999))).sub(e.piv); e.g.rotation.y = e.barr ? Math.sin(t / 240) * 0.25 : 0; }
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
    this.C.inst.forEach((s) => {
      if (s.sync) { s.sync(has, root); return; }
      if (s.dedo) { s.cat.goal = has(s.clases.avance) && !has(s.clases.retira) ? 1 : 0; s.dedo.barr = has(s.clases.barrido) && s.cat.goal > 0; return; }
      s.cat.goal = has(s.clases.avance) ? 1 : 0; s.bal.goal = has(s.clases.inflar) ? 1.3 : 0.001; s.bolsa.goal = has(s.clases.bolsa) ? 1 : 0.001; });
  }
  hl(id) { if (!this.C) return; this.C.hl = id || null; if (id) this.enfocar(id); }
  /** lleva la cámara (con suavidad) hacia una estructura; sin estructura, vuelve a la vista general */
  enfocar(id) {
    const C = this.C; if (!C) return;
    const cam = this.CFG[C.variante].camara; const a = id && id !== 'paciente' ? C.anclas[id] : null;
    C.tgoal = a ? a.clone() : V(...cam.objetivo);
    C.dgoal = a ? ((this.CFG.general.camara || {}).foco || 26) : V(...cam.lat).distanceTo(V(...cam.objetivo));
    C.goal = null; C.lento = false;
  }
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
