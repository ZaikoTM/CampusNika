// npm test — el modelo que muestra el simulador debe aprobar SIEMPRE su propio corrector, y los errores típicos deben detectarse.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

function cargar() {
  const ctx = {
    window: {}, document: { readyState: 'complete', addEventListener() {}, querySelector: () => ({ innerHTML: '', querySelectorAll: () => [], addEventListener() {} }), getElementById: () => null },
    localStorage: { getItem: () => null, setItem() {} }, console, location: { search: '' }, Math, Date, JSON, Object, Array, String, Number, RegExp, Set, Map, URLSearchParams, Event: class {}, Promise,
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
