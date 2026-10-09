// Sala de Estudio · hub: año → materia → (estudio | simulador | duelos | atlas 3D). Datos desacoplados: para sumar una materia alcanza con editar AÑOS.
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Cada materia activa define sus destinos. `acr` = área del atlas de acreditaciones (siam / sim / cir).
  const MATERIAS_5 = [
    { id: 'siam', nombre: 'Salud Integral del Adulto Mayor', sigla: 'S.I.A.M.', icono: '🫀', color: 'siam', hub: 'siam_hub.html',
      desc: 'Las 9 Unidades Problema con objetivos de cátedra, bibliografía, material y videos; simulador de parciales y duelos con tus compañeros.',
      chips: ['9 Unidades Problema', '892 preguntas', 'Examen escrito', '5 acreditaciones 3D'],
      estudio: 'estudio.html?modulo=siam', simulador: 'examen.html?modulo=siam', duelos: 'versus.html?modulo=siam', atlas: 'acreditaciones.html?area=siam' },
    { id: 'gineco', nombre: 'Salud Integral de la Mujer', sigla: 'Ginecología y Obstetricia', icono: '🤰', color: 'gineco', hub: 'gineco_hub.html',
      desc: 'Ginecología, obstetricia y salud de la mujer en todo el curso de vida: estudio por unidad, simulador, duelos y examen mamario, obstétrico y ginecológico en 3D.',
      chips: ['4 UP · 8 secciones', '800 preguntas', '6 acreditaciones 3D'],
      estudio: 'estudio.html?modulo=ginecologia', simulador: 'examen.html?modulo=ginecologia', duelos: 'versus.html?modulo=ginecologia', atlas: 'acreditaciones.html?area=sim' },
    { id: 'cirugia', nombre: 'Introducción a las Especialidades Clínico-Quirúrgicas', sigla: 'Cirugía', icono: '🔪', color: 'cirugia', hub: 'cirugia_hub.html',
      desc: 'Las 11 Unidades Problema de cirugía: programa, material, simulador de exámenes y duelos, más asepsia y lavado quirúrgico en el atlas 3D.',
      chips: ['11 Unidades Problema', '1.100 preguntas', 'Estaciones ECOE'],
      estudio: 'estudio.html?modulo=cirugia', simulador: 'examen.html?modulo=cirugia', duelos: 'versus.html', atlas: 'acreditaciones.html?area=cir' },
  ];
  const esAdmin = () => { try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); return !!u && String(u.role || '').toLowerCase() === 'admin'; } catch (_) { return false; } };
  const esPlus = () => esAdmin() || !!(window.NikaAcceso && NikaAcceso.tieneAccesoCompleto && NikaAcceso.tieneAccesoCompleto());
  const pronto = (...n) => n.map((nombre) => ({ nombre, pronto: true }));
  const AÑOS = [
    { id: '1ro', nombre: '1° Año', materias: pronto('Salud Individual', 'Salud Colectiva', 'Crecimiento y Desarrollo') },
    { id: '2do', nombre: '2° Año', materias: pronto('Nutrición', 'Sexualidad, Género y Reproducción', 'Trabajo y Tiempo Libre', 'El Ser Humano y su Medio') },
    { id: '3ro', nombre: '3° Año', materias: pronto('Injuria', 'Defensa') },
    { id: '4to', nombre: '4° Año', materias: pronto('Salud del Niño y del Adolescente', 'Salud Integral del Adulto Joven', 'Medicina Legal') },
    { id: '5to', nombre: '5° Año', materias: MATERIAS_5 },
    { id: '6to', nombre: '6° Año (PFO)', materias: [{ id: 'pfo', color: 'pfo', icono: '🎓', sigla: 'PFO · SALA DE ESTUDIO', nombre: 'Práctica Final Obligatoria', desc: 'Todo para preparar el último año: recorrido por el reglamento, contenidos de cada rotación, procedimientos paso a paso con práctica en NikaSim y bibliografía actualizada.', chips: ['8 módulos', 'Procedimientos paso a paso', 'Bibliografía actualizada'], estudio: 'estudio.html?modulo=pfo', simulador: 'pfo_ecoe.html', atlas: 'acreditaciones.html?area=siam', hub: 'estudio.html?modulo=pfo' }] },
  ];

  const S = { year: '5to' };
  const leerHash = () => { const y = decodeURIComponent(location.hash.replace(/^#/, '')); S.year = AÑOS.some((a) => a.id === y) ? y : '5to'; };

  function pintarAnios() {
    $('#ns-years').innerHTML = AÑOS.map((y) => `<button type="button" class="ns-year ${y.id === S.year ? 'on' : ''}" role="tab" aria-selected="${y.id === S.year}" data-y="${y.id}">${y.materias.some((m) => !m.pronto) ? '<i class="ns-dot" title="Disponible"></i>' : ''}${esc(y.nombre)}</button>`).join('');
  }

  function tarjeta(m, i) {
    if (m.pronto) {
      return `<article class="se-card off" style="--i:${i}"><div class="se-banda"><span class="se-ico">🚧</span></div>
        <div class="se-cuerpo"><span class="ns-pill dev">En desarrollo</span><h4>${esc(m.nombre)}</h4><p>Estamos preparando el contenido de esta materia.</p>
        <span class="se-entrar off">Próximamente</span></div></article>`;
    }
    return `<article class="se-card ${m.color}" style="--i:${i}">
      <div class="se-banda"><span class="se-ico">${m.icono}</span><span class="se-sigla">${esc(m.sigla)}</span></div>
      <div class="se-cuerpo">
        <h4>${esc(m.nombre)}</h4>
        <p>${esc(m.desc)}</p>
        <div class="se-chips">${m.chips.map((c) => `<span class="ns-pill ok">${esc(c)}</span>`).join('')}</div>
        <a class="se-entrar" href="${m.estudio}">📖 Entrar a la Sala de Estudio <i>→</i></a>
        <div class="se-rapido" aria-label="Accesos rápidos">
          <a href="${m.simulador}" title="${m.id === 'pfo' ? 'Simulador: ECOE FINAL (NikaMed+)' : 'Simulador de exámenes'}"><span>📝</span>Simulador</a>
          ${m.duelos ? `<a href="${m.duelos}" title="Duelos 1vs1"><span>⚔️</span>Duelos</a>` : ''}
          <a href="${m.atlas}" title="Atlas 3D de acreditaciones"><span>🥽</span>NikaSim</a>
          <a href="${m.hub}" title="Menú completo de la materia"><span>🧭</span>Menú</a>
        </div>
      </div></article>`;
  }

  function render() {
    leerHash(); pintarAnios();
    const y = AÑOS.find((a) => a.id === S.year);
    $('#se-anio-txt').textContent = y.nombre;
    const cont = $('#se-contenido');
    if (!y.materias.length) { cont.innerHTML = `<div class="ns-vacio ns-fade"><b>🚧</b>${esc(y.aviso || 'Pronto sumaremos contenido para este año.')}</div>`; return; }
    cont.innerHTML = `<div class="se-grid">${y.materias.map(tarjeta).join('')}</div>`;
    // En tablet y celular (y en general) toda la tarjeta abre la sala: no hace falta apuntarle al botón «Entrar»
    cont.querySelectorAll('.se-card:not(.off)').forEach((c) => {
      const ir = c.querySelector('.se-entrar[href]'); if (!ir) return;
      c.style.cursor = 'pointer';
      c.addEventListener('click', (e) => { if (e.target.closest('a, button')) return; location.href = ir.getAttribute('href'); });
    });
  }

  // atajos: continuar donde quedó (último módulo abierto en la sala de estudio)
  function atajos() {
    const box = $('#se-atajos'); if (!box) return;
    let ult = null; try { ult = localStorage.getItem('nika_ultimo_modulo_estudio'); } catch (_) {}
    const m = MATERIAS_5.find((x) => x.estudio.endsWith('modulo=' + ult) || x.id === ult);
    box.innerHTML = (m ? `<a class="se-atajo pri" href="${m.estudio}">▶ Seguir con ${esc(m.sigla)}</a>` : '') +
      '<a class="se-atajo" href="nikasim.html">🥽 Centro de Simulación</a><a class="se-atajo" href="campus.html">🏠 Campus</a>';
  }

  document.addEventListener('click', (e) => {
    const y = e.target.closest('[data-y]');
    if (y) { location.hash = '#' + y.dataset.y; }
  });
  window.addEventListener('hashchange', render);

  try { if (localStorage.getItem('nikasim_side') === '1') document.body.classList.add('ns-colapsado'); } catch (_) {}
  $('#ns-colapsar').addEventListener('click', () => { const c = document.body.classList.toggle('ns-colapsado'); try { localStorage.setItem('nikasim_side', c ? '1' : '0'); } catch (_) {} });
  $('#ns-burger').addEventListener('click', () => document.body.classList.toggle('ns-abierto'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('ns-abierto'); });
  document.addEventListener('click', (e) => { if (document.body.classList.contains('ns-abierto') && !e.target.closest('#ns-side') && !e.target.closest('#ns-burger')) document.body.classList.remove('ns-abierto'); });

  // recordar el último módulo que se abrió desde acá
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.se-entrar'); if (!a) return;
    const m = /modulo=([a-z]+)/.exec(a.getAttribute('href') || ''); try { if (m) localStorage.setItem('nika_ultimo_modulo_estudio', m[1]); } catch (_) {}
  });

  render(); atajos();
})();
