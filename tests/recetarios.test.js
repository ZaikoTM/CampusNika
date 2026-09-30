// npm test — el modelo que muestra el simulador debe aprobar SIEMPRE su propio corrector, y los errores típicos deben detectarse.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

function cargar() {
  const ctx = {
    window: {}, document: { readyState: 'complete', addEventListener() {}, querySelector: () => ({ innerHTML: '', querySelectorAll: () => [], addEventListener() {} }), getElementById: () => null },
    localStorage: { getItem: () => null, setItem() {} }, console, location: { search: '' }, Math, Date, JSON, Object, Array, String, Number, RegExp, Set, Map, URLSearchParams, Event: class {}, Promise, setTimeout: () => 0, navigator: { onLine: false }, btoa: (s) => Buffer.from(s, "binary").toString("base64"), atob: (s) => Buffer.from(s, "base64").toString("binary"), unescape, escape, encodeURIComponent, decodeURIComponent,
  };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/../js/recetariosData.js', 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/../js/recetarios.js', 'utf8'), ctx);
  return ctx;
}
const ctx = cargar();
const R = ctx.RECETARIOS, T = ctx.NikaRecetarios._test;
const corrector = (id) => (R.DOCS[id].layout === 'certificado' ? T.corregirCertificado : { receta: T.corregirReceta, psicofarmacos: T.corregirPsico, examenes: T.corregirExamenes }[id]);

function cargarModelo(id, c) {
  Object.keys(T.hojas).forEach((k) => delete T.hojas[k]);
  const m = T.modeloDe(R.DOCS[id], c);
  Object.entries(m).forEach(([k, v]) => { T.hojas[k] = { ...v }; });
  return m;
}

for (const id of R.ORDEN) {
  test(`el modelo de «${id}» aprueba el 100 % en 150 casos al azar`, () => {
    for (let i = 0; i < 150; i++) {
      const c = R.DOCS[id].caso();
      if (c.trampa) continue;                       // en los casos trampa el modelo es NO extender
      cargarModelo(id, c);
      const fallos = corrector(id)(R.DOCS[id], c).filter((x) => !x.ok);
      assert.strictEqual(fallos.length, 0, `fallos: ${JSON.stringify(fallos.map((x) => x.label))} · caso: ${c.texto}`);
    }
  });
}

test('detecta nombre en orden invertido y falta de firma', () => {
  const c = R.DOCS.buena_salud.caso(); c.trampa = null;
  cargarModelo('buena_salud', c);
  T.hojas.c1.cuerpo = T.hojas.c1.cuerpo.replace(`${c.p.apellido}, ${c.p.nombre}`, `${c.p.nombre} ${c.p.apellido}`);
  T.hojas.c1.firma = false;
  const malos = T.corregirCertificado(R.DOCS.buena_salud, c).filter((x) => !x.ok).map((x) => x.label);
  assert.ok(malos.some((l) => /Apellido/.test(l)));
  assert.ok(malos.some((l) => /Firma/.test(l)));
});

test('receta: la marca comercial sin «Sugiero» resta puntos', () => {
  const c = R.DOCS.receta.caso(); cargarModelo('receta', c);
  T.hojas.r1.cuerpo = T.hojas.r1.cuerpo.replace(c.d.dci, c.d.marcas[0]);
  const malos = T.corregirReceta(R.DOCS.receta, c).filter((x) => !x.ok).map((x) => x.label);
  assert.ok(malos.some((l) => /genérico/.test(l)));
});

test('exámenes: «perfil lipídico» y falta de sufijo -emia se penalizan', () => {
  const c = R.DOCS.examenes.caso(); cargarModelo('examenes', c);
  T.hojas.r1.cuerpo = 'Solicito\nPerfil lipidico\nGlucosa\nMotivo: control';
  const malos = T.corregirExamenes(R.DOCS.examenes, c).filter((x) => !x.ok).map((x) => x.label);
  assert.ok(malos.some((l) => /genérica/.test(l)));
  assert.ok(malos.some((l) => /emia/.test(l)));
});

test('psicofármacos: la receta de archivo exige DNI, edad y dirección', () => {
  const c = R.DOCS.psicofarmacos.caso(); cargarModelo('psicofarmacos', c);
  T.hojas.r2.encabezado = `${c.p.apellido}, ${c.p.nombre}`;
  const malos = T.corregirPsico(R.DOCS.psicofarmacos, c).filter((x) => !x.ok).map((x) => x.label);
  assert.ok(malos.some((l) => /R2 · N\.° de DNI/.test(l)));
  assert.ok(malos.some((l) => /R2 · Dirección/.test(l)));
});

test('el link compartido reconstruye el mismo caso y el modelo sigue aprobando', () => {
  for (const id of R.ORDEN) {
    for (let i = 0; i < 40; i++) {
      const c0 = R.DOCS[id].caso();
      const seed = JSON.parse(JSON.stringify(R.compactar(c0)));
      const c1 = R.reconstruir(seed);
      assert.ok(c1, `no reconstruyó ${id}`);
      assert.strictEqual(c1.texto, c0.texto);
      if (c1.trampa) continue;
      cargarModelo(id, c1);
      const fallos = corrector(id)(R.DOCS[id], c1).filter((x) => !x.ok);
      assert.strictEqual(fallos.length, 0, `${id}: ${JSON.stringify(fallos.map((x) => x.label))}`);
    }
  }
});

test('el link rechaza datos alterados (regex maliciosa, catálogo inexistente, tipos raros)', () => {
  const c = R.DOCS.receta.caso(); const s = JSON.parse(JSON.stringify(R.compactar(c)));
  const mal = (f) => { const x = JSON.parse(JSON.stringify(s)); f(x); assert.strictEqual(R.reconstruir(x), null); };
  mal((x) => { x.p.a = '(a+)+$'; });
  mal((x) => { x.k.dci = 'Inventadol'; });
  mal((x) => { x.p.e = 'abc'; });
  mal((x) => { x.t = 'noexiste'; });
  mal((x) => { x.p.o = 'Obra <script>'; });
  assert.strictEqual(R.reconstruir(null), null);
});

test('codificación base64url ida y vuelta con tildes', () => {
  const o = { a: 'Ñengará · Gómez', n: 5 };
  assert.strictEqual(JSON.stringify(R.deBase64Url(R.aBase64Url(o))), JSON.stringify(o));
  assert.strictEqual(R.deBase64Url('%%%'), null);
});
