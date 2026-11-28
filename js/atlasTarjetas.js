/* Tarjetas de anatomía · Atlas de anatomía quirúrgica.
   data/atlas_tarjetas.json: relaciones/datos (de las tablas del atlas), clínica (“si ves esto, pensá en esto”) y preguntas de oral.
   Repaso espaciado de 5 cajas: las que fallás vuelven en esta misma sesión; las que sabés, a 1, 3, 7 y 16 días. Progreso en localStorage. */
(function () {
    'use strict';
    let usuario = '';
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (!u) { location.href = 'index.html'; return; } usuario = u.username || u.email || 'invitado'; } catch (_) { location.href = 'index.html'; return; }
    const COL = { 1: '#0ea5e9', 2: '#f59e0b', 3: '#16a34a', 4: '#7c3aed', 5: '#e11d48', 6: '#0891b2', 7: '#14b8a6', 8: '#4f46e5', 9: '#7c3aed', 10: '#c026d3', 11: '#f97316' };
    const DIAS = [0, 1, 3, 7, 16], DIA = 86400000, POR_SESION = 20;
    const KEY = 'nika_atlas_tarjetas_v1_' + usuario;
    const $ = (id) => document.getElementById(id);
    let todas = [], prog = {}, regiones = null, filtroUp = 0, filtroTipo = '', filtroReg = '', cola = [], idx = 0, vuelta = false, sesion = { ok: 0, dif: 0, no: 0, total: 0 };
    try { prog = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { prog = {}; }
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (_) {} };
    const ahora = () => Date.now();

    function elegibles() {
        const reg = filtroReg && regiones && regiones.regiones[filtroReg] ? new Set(regiones.regiones[filtroReg].c) : null;
        return todas.filter((t) => (!filtroUp || t.u === filtroUp) && (!filtroTipo || t.t === filtroTipo) && (!reg || (t.l && reg.has(t.l))));
    }
    function estado() {
        const l = elegibles(), hoy = l.filter((t) => { const p = prog[t.i]; return p && p.d <= ahora(); }).length, nuevas = l.filter((t) => !prog[t.i]).length, dom = l.filter((t) => (prog[t.i] || {}).n >= 3).length;
        $('at-resumen').innerHTML = `${l.length} tarjetas · <b>${dom}</b> dominadas · <span class="al-hoy">${hoy} para repasar hoy</span> · ${nuevas} nuevas`;
        const b = $('at-empezar'); b.disabled = !l.length; b.textContent = hoy || nuevas ? `▶ Empezar sesión (${Math.min(POR_SESION, hoy + nuevas)})` : '▶ Practicar igual';
        const rb = $('at-reg'); if (filtroReg && regiones && regiones.regiones[filtroReg]) { rb.hidden = false; rb.innerHTML = `Región: <b>${regiones.regiones[filtroReg].n}</b> <button type="button" id="at-reg-x">quitar ✕</button>`; $('at-reg-x').addEventListener('click', () => { filtroReg = ''; estado(); }); } else rb.hidden = true;
        document.querySelectorAll('#at-ups .al-chip[data-u]').forEach((x) => { const n = +x.dataset.u; if (!n) return; const k = todas.filter((t) => t.u === n); x.innerHTML = `UP ${n}<small>${k.length}</small>`; });
    }
    function armarCola() {
        const l = elegibles(), vencidas = l.filter((t) => prog[t.i] && prog[t.i].d <= ahora()), nuevas = l.filter((t) => !prog[t.i]);
        const mez = (a) => { for (let n = a.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [a[n], a[j]] = [a[j], a[n]]; } return a; };
        let c = mez(vencidas).concat(mez(nuevas));
        if (!c.length) c = mez(l.slice());
        return c.slice(0, POR_SESION);
    }
    function empezar() {
        cola = armarCola(); if (!cola.length) return;
        idx = 0; sesion = { ok: 0, dif: 0, no: 0, total: cola.length };
        $('at-zona').hidden = false; $('at-fin').hidden = true; mostrar();
        $('at-zona').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function mostrar() {
        const t = cola[idx]; vuelta = false;
        $('at-card').classList.remove('vuelta'); $('at-botones').hidden = true;
        $('at-ctx').innerHTML = `<span class="al-up" style="--c:${COL[t.u]}">UP ${t.u}</span> ${(t.c || t.m || '').replace(/</g, '&lt;')}`;
        $('at-q').innerHTML = t.q; $('at-a').innerHTML = t.a;
        const lam = $('at-lam');
        if (t.l) { lam.hidden = false; lam.href = 'atlas_laminas.html?lamina=' + encodeURIComponent(t.l); lam.querySelector('img').src = 'assets/atlas/laminas/' + t.l + '.webp'; } else lam.hidden = true;
        $('at-bar').style.width = (idx / cola.length * 100) + '%'; $('at-pos').textContent = `${idx + 1} de ${cola.length}`;
    }
    function voltear() { if (vuelta) return; vuelta = true; $('at-card').classList.add('vuelta'); $('at-botones').hidden = false; }
    function responder(r) {
        const t = cola[idx], p = prog[t.i] || { n: 0 };
        let n = p.n || 0;
        if (r === 0) { n = 0; sesion.no++; cola.push(t); }          // vuelve en esta sesión
        else if (r === 1) { n = Math.max(1, n); sesion.dif++; }
        else { n = Math.min(n + 1, DIAS.length - 1); sesion.ok++; }
        prog[t.i] = { n, d: ahora() + (r === 0 ? 10 * 60000 : Math.max(1, DIAS[n]) * DIA), t: ahora() };
        guardar(); idx++;
        if (idx >= cola.length) fin(); else mostrar();
    }
    function fin() {
        $('at-zona').hidden = true; $('at-fin').hidden = false;
        $('at-fin-t').innerHTML = `<p>✅ Las sabías: <b>${sesion.ok}</b> · 🤔 Con dudas: <b>${sesion.dif}</b> · ❌ Las que volvieron a repasarse: <b>${sesion.no}</b></p>`;
        estado();
    }

    function init(a, regs) {
        todas = a.tarjetas || []; regiones = regs;
        const ups = $('at-ups');
        ups.innerHTML = '<button type="button" class="al-chip on" data-u="0">Todas las UP</button>' + Object.keys(COL).map((n) => `<button type="button" class="al-chip" style="--c:${COL[n]}" data-u="${n}">UP ${n}</button>`).join('');
        ups.addEventListener('click', (ev) => { const b = ev.target.closest('.al-chip'); if (!b) return; filtroUp = +b.dataset.u; ups.querySelectorAll('.al-chip').forEach((x) => x.classList.toggle('on', x === b)); estado(); });
        $('at-tipos').addEventListener('click', (ev) => { const b = ev.target.closest('.al-chip'); if (!b) return; filtroTipo = b.dataset.t; $('at-tipos').querySelectorAll('.al-chip').forEach((x) => x.classList.toggle('on', x === b)); estado(); });
        $('at-empezar').addEventListener('click', empezar);
        $('at-otra').addEventListener('click', empezar);
        $('at-salir').addEventListener('click', () => { $('at-zona').hidden = true; estado(); });
        $('at-card').addEventListener('click', (e) => { if (e.target.closest('.at-lam')) return; voltear(); });
        $('at-botones').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) responder(+b.dataset.r); });
        document.addEventListener('keydown', (e) => {
            if ($('at-zona').hidden) return;
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); voltear(); }
            else if (vuelta && ['1', '2', '3'].includes(e.key)) responder(+e.key - 1);
        });
        try { const sp = new URLSearchParams(location.search), up = +sp.get('up'), reg = sp.get('region'); if (up && COL[up]) { filtroUp = up; ups.querySelectorAll('.al-chip').forEach((x) => x.classList.toggle('on', +x.dataset.u === up)); } if (reg && regs && regs.regiones[reg]) filtroReg = reg; } catch (_) {}
        estado();
    }
    Promise.all([
        fetch('data/atlas_tarjetas.json').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
        fetch('data/atlas_regiones.json').then((r) => r.ok ? r.json() : null).catch(() => null)
    ]).then(([a, b]) => init(a, b)).catch((e) => { console.error('[Tarjetas]', e); $('at-resumen').textContent = 'No pudimos cargar las tarjetas. Probá recargar la página.'; });
})();
