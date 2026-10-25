// Renderiza un modelo GLB suelto (props de decorado) a PNG transparente. ?m=modelos/x.glb&n=nombre&ry=grados&rx=grados&ancho=1024&guardar=1
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const q = new URLSearchParams(location.search), W = +q.get('ancho') || 1024, H = +q.get('alto') || W;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
document.getElementById('v').appendChild(renderer.domElement);
const escena = new THREE.Scene(); escena.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; escena.environmentIntensity = 0.9;
escena.add(new THREE.HemisphereLight(0xdceeff, 0xf0dcc8, 0.8));
const key = new THREE.DirectionalLight(0xfff0dc, 2.2); key.position.set(2, 3, 4); escena.add(key);
const fill = new THREE.DirectionalLight(0xcfe4ff, 0.8); fill.position.set(-3, 1, 3); escena.add(fill);
const loader = new GLTFLoader(); loader.setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'));
const g = await loader.loadAsync(q.get('m')), m = g.scene; escena.add(m);
m.rotation.y = THREE.MathUtils.degToRad(+q.get('ry') || 0); m.rotation.x = THREE.MathUtils.degToRad(+q.get('rx') || 0); m.updateWorldMatrix(true, true);
const caja = new THREE.Box3().setFromObject(m), c = caja.getCenter(new THREE.Vector3()), s = caja.getSize(new THREE.Vector3());
m.position.sub(c);
const cam = new THREE.PerspectiveCamera(20, W / H, 0.01, 1000), r = Math.max(s.x / (W / H), s.y) * 0.62 / Math.tan(THREE.MathUtils.degToRad(10)) + s.z / 2;
cam.position.set(0, 0, r); cam.lookAt(0, 0, 0); renderer.render(escena, cam);
document.getElementById('e').textContent = 'Tamaño ' + s.toArray().map((v) => v.toFixed(2)).join(' × ');
if (q.get('guardar')) { const b = await new Promise((ok) => renderer.domElement.toBlob(ok, 'image/png')); const res = await fetch('http://localhost:5518/guardar?nombre=prop-' + q.get('guardar') + '.png', { method: 'POST', body: b }); document.getElementById('e').textContent += ' · ' + (await res.text()); }
