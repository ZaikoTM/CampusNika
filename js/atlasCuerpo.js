/* Silueta del cuerpo · Atlas de anatomía quirúrgica.
   Usa las láminas reales de Netter S-2 (vista anterior) y S-3 (vista posterior) con zonas táctiles.
   Cada región lista las láminas del atlas que la estudian (data/atlas_regiones.json) y lleva al Modo láminas o a las tarjetas. */
(function () {
    'use strict';
    try { if (!JSON.parse(localStorage.getItem('nika_currentUser') || 'null')) { location.href = 'index.html'; return; } } catch (_) { location.href = 'index.html'; return; }
    const $ = (id) => document.getElementById(id);
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    let datos = null, lam = {}, vista = 'S-2', activa = '';

    function dibujar() {
        const v = datos.vistas[vista], fig = $('ac-fig');
        $('ac-img').src = 'assets/atlas/cuerpo/' + vista + '.webp';
        fig.style.aspectRatio = v.w + ' / ' + v.h;
        fig.querySelectorAll('.ac-z').forEach((n) => n.remove());
        v.z.forEach((z) => z.r.forEach((r, k) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'ac-z' + (z.id === activa ? ' on' : ''); b.dataset.id = z.id;
            b.style.cssText = `left:${r[0] / 10}%;top:${r[1] / 10}%;width:${(r[2] - r[0]) / 10}%;height:${(r[3] - r[1]) / 10}%`;
            b.setAttribute('aria-label', z.n); b.title = z.n;
            if (k === 0) b.innerHTML = `<span class="ac-et">${esc(z.n)}</span>`;
            b.addEventListener('click', () => elegir(z.id));
            b.addEventListener('mouseenter', () => fig.querySelectorAll('.ac-z[data-id="' + z.id + '"]').forEach((x) => x.classList.add('hv')));
            b.addEventListener('mouseleave', () => fig.querySelectorAll('.ac-z.hv').forEach((x) => x.classList.remove('hv')));
            fig.appendChild(b);
        }));
    }
    function elegir(id) {
        activa = id;
        document.querySelectorAll('.ac-z').forEach((x) => x.classList.toggle('on', x.dataset.id === id));
        const r = datos.regiones[id]; if (!r) return;
        const cods = r.c.filter((c) => lam[c]);
        const ups = {}; cods.forEach((c) => (lam[c].u || []).forEach((n) => { ups[n] = (ups[n] || 0) + 1; }));
        const chips = Object.keys(ups).sort((a, b) => a - b).map((n) => `<span class="ac-up">UP ${n} · ${ups[n]}</span>`).join('');
        $('ac-panel').innerHTML = `<div class="ac-cab"><h2>${esc(r.n)}</h2><p>${cods.length} láminas del atlas · ${chips ? 'por unidad:' : ''} ${chips}</p>
            <div class="ac-acc"><a class="al-exa" href="atlas_laminas.html?region=${id}">Practicar estas láminas →</a><a class="ac-sec" href="atlas_laminas.html?region=${id}&modo=escribir">⌨️ Escribir los nombres</a><a class="ac-sec" href="atlas_tarjetas.html?region=${id}">🃏 Tarjetas de la región</a></div></div>
            <div class="ac-lams">${cods.slice(0, 36).map((c) => `<a class="ac-l" href="atlas_laminas.html?lamina=${encodeURIComponent(c)}&region=${id}" title="${esc(lam[c].t)}"><img src="assets/atlas/laminas/${c}.webp" alt="" loading="lazy" decoding="async"><span>${esc(lam[c].t)}</span></a>`).join('')}</div>
            ${cods.length > 36 ? `<p class="ac-mas">Y ${cods.length - 36} láminas más: abrí “Practicar estas láminas” para verlas todas.</p>` : ''}`;
        if (window.innerWidth < 900) $('ac-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    Promise.all([
        fetch('data/atlas_regiones.json').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
        fetch('data/atlas_laminas.json').then((r) => r.json())
    ]).then(([a, b]) => {
        datos = a; (b.placas || []).forEach((p) => { lam[p.c] = p; });
        document.querySelectorAll('.ac-vista .al-chip').forEach((bt) => bt.addEventListener('click', () => {
            vista = bt.dataset.v; document.querySelectorAll('.ac-vista .al-chip').forEach((x) => x.classList.toggle('on', x === bt)); dibujar();
        }));
        dibujar();
        try { const r = new URLSearchParams(location.search).get('region'); if (r && datos.regiones[r]) elegir(r); } catch (_) {}
    }).catch((e) => { console.error('[Silueta]', e); $('ac-panel').innerHTML = '<p class="al-vacio">No pudimos cargar los datos. Probá recargar la página.</p>'; });
})();
