const f = process.argv[2];
const d = JSON.parse(require('fs').readFileSync(`data/acreditaciones/${process.argv[3]||'siam'}/${f}.json`,'utf8'));
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
let malTotal = 0;
d.casos.forEach((c) => {
  const okp = (p) => (!p.solo_si || c[p.solo_si]) && (!p.sin_si || !c[p.sin_si]) && (!p.solo_contra || c.contra) && (!p.sin_contra || !c.contra) && (!p.solo || p.solo === c.sexo);
  const okd = (x) => (!x.solo_si || c[x.solo_si]) && (!x.sin_si || !c[x.sin_si]) && (!x.solo_contra || c.contra) && (!x.solo || x.solo === c.sexo);
  function rec(texto) {
    const tx = norm(texto).replace(/no desfibrilable/g, ' nodesfib ').replace(/(no|sin) (fuerzo|forzo|forzar|forzando|fuerza)/g, ' ').replace(/(no|sin) (descarg\w*|desfibril\w*|shock|choque|cardiovert\w*)/g, ' ');
    const extra = (o) => (o.claves_caso && o.claves_caso[c.id]) || [];
    const pt = (cl) => (cl || []).reduce((mx, g) => (g.every((x) => tx.includes(x)) ? Math.max(mx, g.join('').length) : mx), 0);
    let mejor = null;
    d.distractores.forEach((x) => { if (!x.num) return; const T = ' ' + tx + ' '; if (x.num.requiere && !x.num.requiere.some((k) => T.includes(k))) return; const m = tx.match(new RegExp(x.num.re)); if (!m) return; const malo = x.num.campos.some((cc, i) => m[i + 1] !== undefined && String(m[i + 1]) !== String(c[cc])); if (malo) mejor = { tipo: 'd', id: x.id, s: 99 }; });
    if (mejor) return mejor;
    d.distractores.filter(okd).forEach((x) => { const s = pt((x.claves || []).concat(extra(x))); if (s && (!mejor || s > mejor.s)) mejor = { tipo: 'd', id: x.id, s }; });
    if (mejor) return mejor;
    d.pasos.filter(okp).forEach((q) => { const s = pt((q.claves || []).concat(extra(q))); if (s && (!mejor || s > mejor.s)) mejor = { tipo: 'p', n: q.n, s }; });
    return mejor;
  }
  const mal = [];
  d.pasos.filter(okp).forEach((p) => { const r = rec((p.frases_caso && p.frases_caso[c.id]) || p.frase); const g = r && r.tipo === 'p' && d.pasos.find((z) => z.n === r.n); if (!r || r.tipo !== 'p' || (r.n !== p.n && g.gemelo !== p.n)) mal.push(p.n + ' -> ' + JSON.stringify(r)); });
  malTotal += mal.length;
  console.log(c.id, c.nombre, 'pasos', d.pasos.filter(okp).length, mal.length ? 'MAL: ' + mal.join(' | ') : 'ok');
});
console.log('total mal', malTotal);
