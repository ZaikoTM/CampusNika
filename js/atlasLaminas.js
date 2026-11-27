/* Modo láminas · Atlas de anatomía quirúrgica.
   Muestra cada lámina de Netter con las etiquetas tapadas; el estudiante destapa casilla por casilla y se autoevalúa.
   Datos: data/atlas_laminas.json (posición de cada etiqueta en milésimas de la imagen) + assets/atlas/laminas/S-n.webp.
   Progreso: localStorage (por usuario). */
(function () {
    'use strict';
    // guardián: sin sesión se vuelve al inicio (igual que el resto del módulo)
    let usuario = '';
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (!u) { location.href = 'index.html'; return; } usuario = u.username || u.email || 'invitado'; } catch (_) { location.href = 'index.html'; return; }

    const COL = { 1: '#0ea5e9', 2: '#f59e0b', 3: '#16a34a', 4: '#7c3aed', 5: '#e11d48', 6: '#0891b2', 7: '#14b8a6', 8: '#4f46e5', 9: '#7c3aed', 10: '#c026d3', 11: '#f97316' };
    const KEY = 'nika_atlas_laminas_v1_' + usuario;
    const $ = (id) => document.getElementById(id);
    let datos = [], visibles = [], pos = -1, filtroUp = 0, texto = '', prog = {};

    try { prog = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { prog = {}; }
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (_) {} };
    const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const img = (c) => 'assets/atlas/laminas/' + c + '.webp';
    const upsDe = (p) => (p.u || []).slice().sort((a, b) => a - b);
    const colorDe = (p) => COL[upsDe(p)[0]] || '#0ea5e9';

    function resumen() {
        const total = datos.length, ok = datos.filter((p) => (prog[p.c] || {}).e === 'ok').length, rep = datos.filter((p) => (prog[p.c] || {}).e === 'rep').length;
        $('al-resumen').innerHTML = `<b>${ok}</b> de ${total} láminas dominadas${rep ? ` · ${rep} para repasar` : ''}`;
    }
    function filtrar() {
        const q = norm(texto).trim();
        visibles = datos.filter((p) => (!filtroUp || (p.u || []).includes(filtroUp)) && (!q || norm(p.t + ' ' + p.c + ' ' + (p.e || []).join(' ')).includes(q)));
        const g = $('al-grid');
        g.innerHTML = visibles.map((p, i) => {
            const e = (prog[p.c] || {}).e, ups = upsDe(p);
            return `<button type="button" class="al-card" style="--c:${colorDe(p)}" data-i="${i}" aria-label="Abrir la lámina ${esc(p.t)}">
                ${e === 'ok' ? '<span class="al-est ok">✓ Dominada</span>' : e === 'rep' ? '<span class="al-est rep">↻ Repasar</span>' : ''}
                <div class="th"><img src="${img(p.c)}" alt="" loading="lazy" decoding="async"></div>
                <div class="tx"><b>${esc(p.t)}</b><div class="meta">${ups.map((n) => `<span class="al-up" style="--c:${COL[n]}">UP ${n}</span>`).join('')}<span class="al-n">${esc(p.c)}</span></div></div></button>`;
        }).join('');
        $('al-vacio').hidden = visibles.length > 0;
        g.querySelectorAll('.al-card').forEach((b) => b.addEventListener('click', () => abrir(+b.dataset.i)));
    }

    // ---------- visor
    let destapadas = 0;
    function actualizarCont() { const n = $('al-lamina').querySelectorAll('.al-cap').length; $('al-cont').textContent = `${destapadas}/${n} destapadas`; }
    function abrir(i) {
        if (i < 0 || i >= visibles.length) return;
        pos = i; const p = visibles[i];
        $('al-v-tit').textContent = p.t;
        $('al-v-sub').textContent = upsDe(p).map((n) => 'UP ' + n).join(' · ') + ' · ' + p.c + ' · ' + (i + 1) + ' de ' + visibles.length;
        const cont = $('al-lamina');
        cont.querySelectorAll('.al-cap').forEach((b) => b.remove());
        const im = $('al-img'); im.src = img(p.c); im.alt = p.t;
        destapadas = 0;
        (p.r || []).forEach((r, k) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'al-cap'; b.setAttribute('aria-label', 'Mostrar el nombre ' + (k + 1));
            const pad = 3; // milésimas de margen para tapar bien el texto
            b.style.left = ((r[0] - pad) / 10) + '%'; b.style.top = ((r[1] - pad) / 10) + '%';
            b.style.width = ((r[2] - r[0] + 2 * pad) / 10) + '%'; b.style.height = ((r[3] - r[1] + 2 * pad) / 10) + '%';
            b.addEventListener('click', () => { if (!b.classList.contains('on')) { b.classList.add('on'); destapadas++; actualizarCont(); } });
            cont.appendChild(b);
        });
        const m = (p.m || []).filter(Boolean);
        const negrita = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b style="display:inline;color:#fff;letter-spacing:0;text-transform:none;font-size:inherit">$1</b>');
        $('al-mirar').innerHTML = m.length ? '<b>Qué mirar</b><ul>' + m.map((t) => `<li>${negrita(t)}</li>`).join('') + '</ul>' : '';
        $('al-mirar').hidden = true; $('al-pista').style.display = m.length ? '' : 'none'; $('al-pista').textContent = '💡 Qué mirar';
        $('al-visor').hidden = false; document.body.style.overflow = 'hidden';
        $('al-v-cuerpo').scrollTop = 0; actualizarCont();
    }
    function cerrar() { $('al-visor').hidden = true; document.body.style.overflow = ''; filtrar(); resumen(); }
    function marcar(e) {
        const p = visibles[pos]; if (!p) return;
        prog[p.c] = { e, t: Date.now() }; guardar();
        if (pos < visibles.length - 1) abrir(pos + 1); else cerrar();
    }
    function todas(destapar) {
        $('al-lamina').querySelectorAll('.al-cap').forEach((b) => b.classList.toggle('on', destapar));
        destapadas = destapar ? $('al-lamina').querySelectorAll('.al-cap').length : 0; actualizarCont();
    }

    function init(json) {
        datos = json.placas || [];
        const ups = $('al-ups');
        ups.innerHTML = '<button type="button" class="al-chip on" data-u="0">Todas</button>' + Object.keys(COL).map((n) => `<button type="button" class="al-chip" style="--c:${COL[n]}" data-u="${n}">UP ${n}</button>`).join('');
        ups.addEventListener('click', (ev) => { const b = ev.target.closest('.al-chip'); if (!b) return; filtroUp = +b.dataset.u; ups.querySelectorAll('.al-chip').forEach((x) => x.classList.toggle('on', x === b)); filtrar(); });
        let t = 0; $('al-q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { texto = e.target.value; filtrar(); }, 160); });
        $('al-cerrar').addEventListener('click', cerrar);
        $('al-prev').addEventListener('click', () => abrir(pos - 1));
        $('al-next').addEventListener('click', () => abrir(pos + 1));
        $('al-tapar').addEventListener('click', () => todas(false));
        $('al-mostrar').addEventListener('click', () => todas(true));
        $('al-pista').addEventListener('click', () => { const h = $('al-mirar').hidden = !$('al-mirar').hidden; $('al-pista').textContent = h ? '💡 Qué mirar' : '💡 Ocultar pista'; });
        $('al-zoom').addEventListener('click', () => { const z = $('al-lamina').classList.toggle('zoom'); $('al-zoom').textContent = z ? '🔍 Reducir' : '🔍 Ampliar'; });
        $('al-ok').addEventListener('click', () => marcar('ok'));
        $('al-repasar').addEventListener('click', () => marcar('rep'));
        document.addEventListener('keydown', (ev) => {
            if ($('al-visor').hidden) return;
            if (ev.key === 'Escape') cerrar(); else if (ev.key === 'ArrowRight') abrir(pos + 1); else if (ev.key === 'ArrowLeft') abrir(pos - 1);
        });
        // deep link: ?up=8 filtra por unidad; ?lamina=S-117 abre esa lámina
        try {
            const sp = new URLSearchParams(location.search), up = +sp.get('up');
            if (up && COL[up]) { filtroUp = up; ups.querySelectorAll('.al-chip').forEach((x) => x.classList.toggle('on', +x.dataset.u === up)); }
        } catch (_) {}
        filtrar(); resumen();
        try { const c = new URLSearchParams(location.search).get('lamina'); if (c) { const i = visibles.findIndex((p) => p.c === c); if (i >= 0) abrir(i); } } catch (_) {}
    }

    fetch('data/atlas_laminas.json').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(init).catch((e) => {
        console.error('[Modo láminas]', e);
        $('al-grid').innerHTML = '<p class="al-vacio">No pudimos cargar las láminas. Probá recargar la página.</p>';
    });
})();
