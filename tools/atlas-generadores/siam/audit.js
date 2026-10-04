const fs=require('fs'); const R=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const fx=fs.readFileSync('js/acreditaciones/fx.js','utf8');
const fxok=(k)=>fx.includes(' '+k+':')||fx.includes('{'+k+':');
const asset=(p)=>p&&fs.existsSync(p);
let total=0; const bad=(id,m)=>{total++;console.log('  ✗',id,m);};
for(const id of ['sv','tr','iet','rcp','artro']){
  console.log('==',id);
  const d=R(`data/acreditaciones/siam/${id}.json`), m=R(`data/acreditaciones/siam/${id==='sv'?'sv':id}_modelo.json`), ins=R(`data/acreditaciones/siam/instrumental_${id}.json`);
  const nums=new Set(d.pasos.map(p=>String(p.n)));
  const flagsEstado=new Set(); d.pasos.forEach(p=>Object.keys(p.estado||{}).forEach(k=>flagsEstado.add(k)));
  d.pasos.forEach(p=>{
    if(!fxok(p.fx)) bad(id,`paso ${p.n}: fx '${p.fx}' no existe`);
    if(!d.elementos[p.target]) bad(id,`paso ${p.n}: target '${p.target}' sin elemento`);
    if(!p.claves||!p.claves.length) bad(id,`paso ${p.n}: sin claves`);
    if(!p.frase) bad(id,`paso ${p.n}: sin frase`);
    if(!p.explica||p.explica.length<40) bad(id,`paso ${p.n}: explicación corta`);
  });
  const pines=new Set((m.pines||[]).map(p=>p.id)); const usables=new Set(m.usables||[]);
  const tarj=new Set(); Object.values(m.tarjetas||{}).forEach(t=>t.items.forEach(i=>tarj.add(i[0])));
  Object.keys(d.elementos).forEach(k=>{ if(!pines.has(k)&&!tarj.has(k)) console.log('  · elemento sin pin ni tarjeta:',k); });
  (m.chips||[]).forEach(([k])=>{ if(!flagsEstado.has(k)) bad(id,`chip '${k}' sin estado en ningún paso`); });
  (d.criterios||[]).forEach(c=>c.pasos.forEach(n=>{ const s=String(n); if(!nums.has(s)&&!/ bis|[a-z]$/.test(s)) bad(id,`criterio '${c.titulo}' paso ${s} inexistente`); }));
  Object.entries(d.hallazgo_pasos||{}).forEach(([n,f])=>d.casos.forEach(c=>{ if(c[f]===undefined&&nums.has(n)) { const ap=d.pasos.find(p=>String(p.n)===n); if(!ap.solo_si && !ap.solo_contra && !(f==='rosc_txt')) bad(id,`caso ${c.id} sin campo '${f}' (paso ${n})`); } }));
  ins.items.forEach(i=>{ if(!asset(i.img)) bad(id,`imagen faltante ${i.img}`); if(i.correcto&&i.critico&&!i.falta) bad(id,`ítem crítico '${i.id}' sin mensaje 'falta'`); if(!i.correcto&&!i.feedback&&!i.latex) console.log('  · distractor sin feedback:',i.id); });
  (m.M.piezas||[]).forEach(p=>{ if(!asset(p.src)) bad(id,`pieza 3D faltante ${p.src}`); });
  console.log('  pasos',d.pasos.length,'casos',d.casos.length,'distractores',d.distractores.length,'fund',d.fundamentos.length,'críticos',d.pasos.filter(p=>p.critico).length);
  // cada caso: pasos aplicables y al menos un crítico
  d.casos.forEach(c=>{ const ap=d.pasos.filter(p=>(!p.solo_si||c[p.solo_si])&&(!p.sin_si||!c[p.sin_si])&&(!p.solo_contra||c.contra)&&(!p.sin_contra||!c.contra)&&(!p.solo||p.solo===c.sexo)); if(!ap.some(p=>p.critico)) bad(id,`caso ${c.id} sin pasos críticos`); });
  // preguntas: respuesta correcta en rango y opciones únicas
  d.fundamentos.forEach((q,i)=>{ if(q.c<0||q.c>=q.o.length) bad(id,`fund ${i} c fuera de rango`); if(new Set(q.o).size!==q.o.length) bad(id,`fund ${i} opciones repetidas`); });
}
console.log('PROBLEMAS',total);
