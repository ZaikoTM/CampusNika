/* Guías de estudio NikaMed: interacciones (sin dependencias). Todo degrada bien sin JS. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('g-js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };
  var page = location.pathname.replace(/^.*\//, '').replace('.html', '') || 'guias';

  /* barra de progreso de lectura */
  var bar = $('#g-progress');
  function prog() {
    if (!bar) return;
    var h = root.scrollHeight - root.clientHeight;
    bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, h > 0 ? root.scrollTop / h : 0)) + ')';
  }
  addEventListener('scroll', prog, { passive: true }); prog();

  /* revelado al scrollear, con escalonado */
  var rv = $$('.g-rv');
  rv.forEach(function (el, i) { el.style.setProperty('--d', Math.min((i % 6) * 70, 350) + 'ms'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
        $$('[data-count]', e.target).forEach(contar);
        $$('.g-bars', e.target).forEach(function (b) { if (b._draw) b._draw(); });
      });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(contar);
    setTimeout(function () { $$('.g-bars').forEach(function (b) { if (b._draw) b._draw(); }); }, 50);
  }

  /* contadores animados */
  function contar(el) {
    if (el._done) return; el._done = true;
    var to = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suf') || '', dec = (String(to).split('.')[1] || '').length;
    if (reduce) { el.textContent = to.toLocaleString('es-AR') + suf; return; }
    var t0 = performance.now(), dur = 1100;
    (function f(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* brillo que sigue al cursor en las tarjetas */
  $$('.g-sec').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });

  /* índice: resalta la sección visible */
  var tocLinks = $$('.art-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) { tocLinks.forEach(function (a) { a.classList.remove('on'); }); map[e.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io2.observe(s); });
  }

  /* checklists (se guardan en el navegador) */
  $$('.g-check').forEach(function (box) {
    var key = 'nika_g_' + page + '_' + box.getAttribute('data-key');
    var saved = store.get(key) || [];
    var ins = $$('input', box), ring = $('.g-ring', box), num = $('.g-ring i', box), msg = $('.g-check-msg', box);
    function upd() {
      var n = ins.filter(function (i) { return i.checked; }).length, p = Math.round(n / ins.length * 100);
      ring.style.setProperty('--p', p); num.textContent = p + '%';
      msg.textContent = n === ins.length ? '¡Lista completa! Ya tenés lo esencial.' : n + ' de ' + ins.length + ' completados';
      ins.forEach(function (i) { i.closest('label').classList.toggle('done', i.checked); });
    }
    ins.forEach(function (i, k) {
      i.checked = saved.indexOf(k) > -1;
      i.addEventListener('change', function () {
        store.set(key, ins.map(function (x, j) { return x.checked ? j : -1; }).filter(function (j) { return j > -1; }));
        upd();
      });
    });
    upd();
  });

  /* barras comparativas */
  $$('.g-bars').forEach(function (box) {
    var data = JSON.parse($('script', box).textContent), mode = 'semanas';
    var rows = $('.g-rows', box), btns = $$('.g-seg button', box);
    function max() { return Math.max.apply(null, data.map(function (d) { return d[mode]; })); }
    function draw() {
      var m = max();
      rows.innerHTML = '';
      data.forEach(function (d) {
        var r = document.createElement('div'); r.className = 'g-bar-row';
        r.innerHTML = '<span class="nm">' + d.n + '</span><span class="tr"><span class="fl" style="--c:' + d.c + '"></span></span><span class="vl">' + d[mode] + (mode === 'semanas' ? ' sem' : ' h') + '</span>';
        rows.appendChild(r);
        var f = $('.fl', r); requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.width = Math.max(4, d[mode] / m * 100) + '%'; }); });
      });
    }
    box._draw = draw;
    btns.forEach(function (b) {
      b.addEventListener('click', function () { mode = b.getAttribute('data-m'); btns.forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); });
    });
  });

  /* pomodoro de práctica */
  $$('.g-pomo').forEach(function (box) {
    var ring = $('.g-pomo-ring', box), txt = $('.g-pomo-ring i', box), lab = $('.g-pomo-lab', box), go = $('.g-go', box), rs = $('.g-rs', box);
    var FOCO = 25 * 60, PAUSA = 5 * 60, fase = 'foco', left = FOCO, t = null, run = false;
    function fmt(s) { var m = Math.floor(s / 60), x = s % 60; return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
    function paint() {
      var tot = fase === 'foco' ? FOCO : PAUSA;
      txt.textContent = fmt(left); ring.style.setProperty('--p', Math.round(left / tot * 100));
      ring.classList.toggle('rest', fase !== 'foco');
      lab.textContent = fase === 'foco' ? 'Bloque de foco: una sola tarea, sin celular.' : 'Pausa corta: pará, tomá agua y estirate.';
      box.classList.toggle('run', run);
      go.textContent = run ? 'Pausar' : (left === (fase === 'foco' ? FOCO : PAUSA) ? 'Empezar' : 'Seguir');
    }
    function tick() {
      left--;
      if (left <= 0) { fase = fase === 'foco' ? 'pausa' : 'foco'; left = fase === 'foco' ? FOCO : PAUSA; }
      paint();
    }
    go.addEventListener('click', function () {
      run = !run;
      if (run) t = setInterval(tick, 1000); else clearInterval(t);
      paint();
    });
    rs.addEventListener('click', function () { run = false; clearInterval(t); fase = 'foco'; left = FOCO; paint(); });
    paint();
  });

  /* planificador de semanas */
  $$('.g-planner').forEach(function (box) {
    var f = $('input[name=fecha]', box), u = $('input[name=uni]', box), h = $('input[name=hs]', box), out = $('.g-pl-out', box);
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var def = new Date(hoy.getTime() + 28 * 864e5);
    f.min = hoy.toISOString().slice(0, 10);
    f.value = def.toISOString().slice(0, 10);
    function calc() {
      var d = new Date(f.value + 'T00:00:00'), n = Math.max(1, parseInt(u.value, 10) || 1), hs = Math.max(1, parseInt(h.value, 10) || 1);
      var dias = Math.round((d - hoy) / 864e5);
      out.innerHTML = '';
      if (!f.value || isNaN(dias)) return;
      if (dias < 1) { out.innerHTML = '<p class="g-pl-msg">Elegí una fecha futura para armar el plan.</p>'; return; }
      var sem = Math.max(1, Math.ceil(dias / 7)), estudio = Math.max(1, sem - 1), por = Math.ceil(n / estudio);
      var head = document.createElement('p'); head.className = 'g-note';
      head.innerHTML = '<b style="color:#fff">' + dias + ' días</b> hasta el examen: ' + sem + ' semana' + (sem > 1 ? 's' : '') + '. Con ' + hs + ' h por semana son unas <b style="color:#fff">' + (hs * sem) + ' horas</b> en total.';
      out.appendChild(head);
      var rest = n;
      for (var i = 1; i <= sem; i++) {
        var w = document.createElement('div'), ultima = i === sem && sem > 1;
        w.className = 'g-pl-week' + (ultima ? ' fin' : (i === sem - 1 && sem > 2 ? ' rep' : ''));
        w.style.setProperty('--d', (i * 50) + 'ms');
        var txt;
        if (ultima) txt = 'Simulacros con tiempo y repaso de los errores. Nada de temas nuevos.';
        else { var k = Math.min(por, rest); rest -= k; txt = (k > 0 ? 'Estudio y práctica de ' + k + ' unidad' + (k > 1 ? 'es' : '') + ' (preguntas y casos).' : 'Repaso espaciado de lo ya visto.') + ' Cerrá cada día comparando lo planificado con lo cumplido.'; }
        w.innerHTML = '<b>Semana ' + i + '</b><span>' + txt + '</span>';
        out.appendChild(w);
      }
      if (sem === 1) { var a = document.createElement('p'); a.className = 'g-pl-msg'; a.textContent = 'Tenés una sola semana: priorizá las unidades donde más te equivocás y simulá con tiempo.'; out.appendChild(a); }
    }
    [f, u, h].forEach(function (el) { el.addEventListener('input', calc); });
    calc();
  });

  /* quiz */
  $$('.g-quiz').forEach(function (box) {
    var data = JSON.parse($('script', box).textContent), i = 0, ok = 0, bloqueado = false;
    var body = $('.g-q-body', box), pb = $('.g-q-bar i', box), cnt = $('.g-q-count', box);
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function show() {
      var q = data[i]; bloqueado = false;
      cnt.textContent = 'Pregunta ' + (i + 1) + ' de ' + data.length; pb.style.width = (i / data.length * 100) + '%';
      body.innerHTML = '<div class="g-q-text">' + esc(q.q) + '</div><div class="g-opts">' + q.o.map(function (o, k) {
        return '<button type="button" class="g-opt" data-k="' + k + '"><span class="l">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>';
      }).join('') + '</div><div class="g-exp-slot" aria-live="polite"></div>';
      $$('.g-opt', body).forEach(function (b) { b.addEventListener('click', function () { pick(b, q); }); });
    }
    function pick(b, q) {
      if (bloqueado) return; bloqueado = true;
      var k = +b.getAttribute('data-k'), good = k === q.c;
      if (good) ok++;
      $$('.g-opt', body).forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-k') === q.c) x.classList.add('ok'); });
      if (!good) b.classList.add('bad');
      var slot = $('.g-exp-slot', body);
      slot.innerHTML = '<div class="g-exp"><b>' + (good ? '¡Correcto! ' : 'Casi. ') + '</b>' + esc(q.e) + '</div><button type="button" class="g-btn g-next">' + (i === data.length - 1 ? 'Ver resultado' : 'Siguiente') + '</button>';
      $('.g-next', slot).addEventListener('click', function () { i++; if (i < data.length) show(); else fin(); });
    }
    function fin() {
      pb.style.width = '100%'; cnt.textContent = 'Resultado';
      var p = Math.round(ok / data.length * 100);
      body.innerHTML = '<div class="g-result"><div class="big">' + ok + ' / ' + data.length + '</div><p>' +
        (p === 100 ? '¡Perfecto! Dominás lo esencial de esta guía.' : p >= 60 ? 'Muy bien. Repasá las secciones donde dudaste.' : 'Buen primer paso. Volvé a leer la guía y probá de nuevo.') +
        '</p><div class="g-confetti"></div><button type="button" class="g-btn g-again">Reintentar</button><a class="g-btn ghost" style="text-decoration:none;display:inline-block" href="index.html#crear-cuenta">Seguir practicando en NikaMed</a></div>';
      if (p >= 60 && !reduce) {
        var c = $('.g-confetti', body), em = ['🎉', '✨', '🩺', '💜', '⭐'];
        for (var n = 0; n < 16; n++) {
          var s = document.createElement('i'); s.textContent = em[n % em.length];
          s.style.left = (10 + Math.random() * 80) + '%'; s.style.setProperty('--x', (Math.random() * 80 - 40) + 'px'); s.style.setProperty('--r', (Math.random() * 360) + 'deg');
          s.style.animationDelay = (Math.random() * 0.3) + 's'; c.appendChild(s);
        }
      }
      $('.g-again', body).addEventListener('click', function () { i = 0; ok = 0; show(); });
    }
    show();
  });
})();
