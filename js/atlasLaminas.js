/* Modo láminas · Atlas de anatomía quirúrgica.
   Cada lámina de Netter se muestra con las etiquetas tapadas. Tres formas de practicar:
   · Tocar: destapás casilla por casilla y te autoevaluás.
   · Escribir: escribís el nombre de cada estructura y se corrige (tolera tildes, mayúsculas y pequeños errores).
   · Examen: 8 láminas al azar, 6 estructuras cada una, con puntaje.
   Repaso espaciado: las láminas que marcás “Repasar” vuelven al día siguiente; las que dominás, a los 3, 7, 16 y 35 días.
   Datos: data/atlas_laminas.json · data/atlas_regiones.json · assets/atlas/laminas/S-n.webp. Progreso en localStorage (por usuario). */
(function () {
    'use strict';
    let usuario = '';
    try { const u = JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); if (!u) { location.href = 'index.html'; return; } usuario = u.username || u.email || 'invitado'; } catch (_) { location.href = 'index.html'; return; }

    const COL = { 1: '#0ea5e9', 2: '#f59e0b', 3: '#16a34a', 4: '#7c3aed', 5: '#e11d48', 6: '#0891b2', 7: '#14b8a6', 8: '#4f46e5', 9: '#7c3aed', 10: '#c026d3', 11: '#f97316' };
    const DIAS = [1, 3, 7, 16, 35], DIA = 86400000;
    const KEY = 'nika_atlas_laminas_v1_' + usuario;
    const $ = (id) => document.getElementById(id);
    let datos = [], regiones = null, visibles = [], pos = -1, filtroUp = 0, filtroReg = '', soloRepasar = false, texto = '', prog = {};
    let modo = 'tocar', examen = null, destapadas = 0, aciertos = 0, intentos = 0;

    try { prog = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { prog = {}; }
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (_) {} };
    const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const img = (c) => 'assets/atlas/laminas/' + c + '.webp';
    const upsDe = (p) => (p.u || []).slice().sort((a, b) => a - b);
    const colorDe = (p) => COL[upsDe(p)[0]] || '#0ea5e9';
    const ahora = () => Date.now();
    const vence = (c) => { const x = prog[c]; return !!(x && x.e === 'rep') || !!(x && x.e === 'ok' && x.d && x.d <= ahora()); };

    // ---------- corrección de lo escrito
    const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'en', 'a', 'al', 'con', 'por', 'para', 'un', 'una', 'o']);
    const limpia = (t) => norm(t).replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const toks = (t) => limpia(t).split(' ').filter((w) => w && !VACIAS.has(w));
    function lev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
    function correcto(escrito, etiqueta) {
        const a = limpia(escrito), b = limpia(etiqueta);
        if (a.length < 3) return false;
        if (a === b) return true;
        if (b.includes(a) && a.length >= Math.min(b.length * 0.6, 18)) return true;
        if (1 - lev(a, b) / Math.max(a.length, b.length) >= 0.8) return true;
        const ta = toks(escrito), tb = toks(etiqueta);
        if (!tb.length || !ta.length) return false;
        const ok = tb.filter((w) => ta.some((x) => x === w || (w.length > 4 && x.length > 4 && (x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5)))) || (w.length > 4 && 1 - lev(x, w) / Math.max(x.length, w.length) >= 0.8)));
        return ok.length / tb.length >= 0.75 && ta.length >= Math.max(1, Math.ceil(tb.length * 0.5));
    }

    // ---------- grilla
    function resumen() {
        const total = datos.length, ok = datos.filter((p) => (prog[p.c] || {}).e === 'ok').length, hoy = datos.filter((p) => vence(p.c)).length;
        $('al-resumen').innerHTML = `<b>${ok}</b> de ${total} láminas dominadas${hoy ? ` · <span class="al-hoy">${hoy} para repasar hoy</span>` : ''}`;
        const chip = $('al-chip-rep'); if (chip) chip.textContent = `↻ Para repasar (${hoy})`;
        document.querySelectorAll('#al-ups .al-chip[data-u]').forEach((b) => {
            const n = +b.dataset.u; if (!n) return;
            const l = datos.filter((p) => (p.u || []).includes(n)), k = l.filter((p) => (prog[p.c] || {}).e === 'ok').length;
            b.innerHTML = `UP ${n}<small>${k}/${l.length}</small>`;
        });
    }
    function filtrar() {
        const q = norm(texto).trim(), reg = filtroReg && regiones && regiones.regiones[filtroReg] ? new Set(regiones.regiones[filtroReg].c) : null;
        visibles = datos.filter((p) => (!filtroUp || (p.u || []).includes(filtroUp)) && (!reg || reg.has(p.c)) && (!soloRepasar || vence(p.c)) && (!q || norm(p.t + ' ' + p.c + ' ' + (p.e || []).join(' ')).includes(q)));
        const g = $('al-grid');
        g.innerHTML = visibles.map((p, i) => {
            const x = prog[p.c] || {}, e = x.e, ups = upsDe(p), due = vence(p.c);
            return `<button type="button" class="al-card" style="--c:${colorDe(p)}" data-i="${i}" aria-label="Abrir la lámina ${esc(p.t)}">
                ${e === 'ok' && !due ? '<span class="al-est ok">✓ Dominada</span>' : due ? '<span class="al-est rep">↻ Repasar</span>' : ''}
                <div class="th"><img src="${img(p.c)}" alt="" loading="lazy" decoding="async"></div>
                <div class="tx"><b>${esc(p.t)}</b><div class="meta">${ups.map((n) => `<span class="al-up" style="--c:${COL[n]}">UP ${n}</span>`).join('')}<span class="al-n">${esc(p.c)}</span></div></div></button>`;
        }).join('');
        $('al-vacio').hidden = visibles.length > 0;
        g.querySelectorAll('.al-card').forEach((b) => b.addEventListener('click', () => { examen = null; abrir(+b.dataset.i); }));
        const rb = $('al-reg-info');
        if (rb) { if (filtroReg && regiones && regiones.regiones[filtroReg]) { rb.hidden = false; rb.innerHTML = `Región: <b>${esc(regiones.regiones[filtroReg].n)}</b> · ${visibles.length} láminas <button type="button" id="al-reg-x">quitar ✕</button>`; $('al-reg-x').addEventListener('click', () => { filtroReg = ''; filtrar(); }); } else rb.hidden = true; }
    }

    // ---------- visor
    function actualizarCont() {
        const caps = $('al-lamina').querySelectorAll('.al-cap'), n = caps.length;
        if (examen) $('al-cont').textContent = `Lámina ${examen.i + 1}/${examen.lista.length} · aciertos ${examen.ok}/${examen.tot}`;
        else if (modo === 'escribir') $('al-cont').textContent = `${aciertos} acertadas de ${n}${intentos ? ` · ${intentos} intentos` : ''}`;
        else $('al-cont').textContent = `${destapadas}/${n} destapadas`;
    }
    function cerrarInput() { const x = document.querySelector('.al-inp'); if (x) x.remove(); }
    function destapar(b, ok) { b.classList.add('on'); if (ok) b.classList.add('bien'); }
    function pedir(b, k, p) {
        cerrarInput();
        const r = p.r[k], cont = $('al-lamina'), box = document.createElement('div');
        box.className = 'al-inp';
        const izq = (r[0] + r[2]) / 2 < 500;
        box.style.top = Math.min(r[3] / 10 + 1, 86) + '%'; box.style[izq ? 'left' : 'right'] = (izq ? r[0] / 10 : (1000 - r[2]) / 10) + '%';
        box.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribí el nombre…" aria-label="Nombre de la estructura"><button type="button" class="al-i-ok">✓</button><button type="button" class="al-i-ver" title="Ver la respuesta">👁</button><div class="al-i-msg" aria-live="polite"></div>';
        cont.appendChild(box);
        const inp = box.querySelector('input'), msg = box.querySelector('.al-i-msg');
        let fallos = 0;
        const revisar = () => {
            const v = inp.value.trim(); if (!v) return;
            intentos++;
            if (correcto(v, p.e[k])) { aciertos++; destapar(b, true); box.remove(); if (examen) { examen.ok++; examen.tot++; } actualizarCont(); sigueExamen(); }
            else { fallos++; box.classList.remove('mal'); void box.offsetWidth; box.classList.add('mal'); msg.textContent = fallos >= 2 ? 'Pista: empieza con “' + String(p.e[k]).trim().slice(0, 3) + '…”' : 'Todavía no. Probá de nuevo.'; actualizarCont(); }
        };
        const ver = () => { destapar(b, false); box.remove(); if (examen) { examen.tot++; actualizarCont(); sigueExamen(); } };
        box.querySelector('.al-i-ok').addEventListener('click', revisar);
        box.querySelector('.al-i-ver').addEventListener('click', ver);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); revisar(); } else if (e.key === 'Escape') { e.stopPropagation(); box.remove(); } });
        setTimeout(() => inp.focus({ preventScroll: true }), 30);
    }
    function sigueExamen() {
        if (!examen) return;
        const quedan = $('al-lamina').querySelectorAll('.al-cap.activa:not(.on)').length;
        if (quedan === 0) setTimeout(() => { if (examen.i < examen.lista.length - 1) { examen.i++; mostrar(examen.lista[examen.i]); } else finExamen(); }, 700);
    }
    function mostrar(p) {
        cerrarInput();
        $('al-v-tit').textContent = p.t;
        $('al-v-sub').textContent = upsDe(p).map((n) => 'UP ' + n).join(' · ') + ' · ' + p.c + (examen ? '' : ' · ' + (pos + 1) + ' de ' + visibles.length);
        const cont = $('al-lamina');
        cont.querySelectorAll('.al-cap').forEach((b) => b.remove());
        const im = $('al-img'); im.src = img(p.c); im.alt = p.t;
        destapadas = 0; aciertos = 0; intentos = 0;
        const sel = new Set();
        if (examen) { const ids = (p.r || []).map((_, k) => k); for (let n = ids.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [ids[n], ids[j]] = [ids[j], ids[n]]; } ids.slice(0, 6).forEach((k) => sel.add(k)); }
        (p.r || []).forEach((r, k) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'al-cap'; b.setAttribute('aria-label', 'Estructura ' + (k + 1));
            const pad = 3;
            b.style.left = ((r[0] - pad) / 10) + '%'; b.style.top = ((r[1] - pad) / 10) + '%';
            b.style.width = ((r[2] - r[0] + 2 * pad) / 10) + '%'; b.style.height = ((r[3] - r[1] + 2 * pad) / 10) + '%';
            if (examen && !sel.has(k)) b.classList.add('on');   // en el examen sólo se preguntan 6
            else if (examen) b.classList.add('activa');
            b.addEventListener('click', () => {
                if (b.classList.contains('on')) return;
                if (modo === 'escribir' || examen) pedir(b, k, p);
                else { b.classList.add('on'); destapadas++; actualizarCont(); }
            });
            cont.appendChild(b);
        });
        const m = (p.m || []).filter(Boolean);
        const negrita = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b style="display:inline;color:#fff;letter-spacing:0;text-transform:none;font-size:inherit">$1</b>');
        $('al-mirar').innerHTML = m.length ? '<b>Qué mirar</b><ul>' + m.map((t) => `<li>${negrita(t)}</li>`).join('') + '</ul>' : '';
        $('al-mirar').hidden = true; $('al-pista').style.display = m.length ? '' : 'none'; $('al-pista').textContent = '💡 Qué mirar';
        $('al-visor').hidden = false; document.body.style.overflow = 'hidden';
        $('al-v-cuerpo').scrollTop = 0;
        $('al-eval').style.display = examen ? 'none' : '';
        $('al-modo').style.display = examen ? 'none' : '';
        $('al-modo').textContent = modo === 'escribir' ? '⌨️ Modo: escribir' : '👆 Modo: tocar';
        $('al-tapar').style.display = $('al-mostrar').style.display = examen ? 'none' : '';
        actualizarCont();
    }
    function abrir(i) { if (i < 0 || i >= visibles.length) return; pos = i; mostrar(visibles[i]); }
    function cerrar() { cerrarInput(); $('al-visor').hidden = true; document.body.style.overflow = ''; $('al-fin').hidden = true; examen = null; filtrar(); resumen(); }
    function marcar(e) {
        const p = visibles[pos]; if (!p) return;
        const x = prog[p.c] || {}; let n = x.n || 0;
        if (e === 'ok') { n = Math.min(n + 1, DIAS.length - 1); prog[p.c] = { e: 'ok', n, d: ahora() + DIAS[n] * DIA, t: ahora() }; }
        else prog[p.c] = { e: 'rep', n: 0, d: ahora() + DIA, t: ahora() };
        guardar();
        if (pos < visibles.length - 1) abrir(pos + 1); else cerrar();
    }
    function todas(destapar) {
        $('al-lamina').querySelectorAll('.al-cap').forEach((b) => b.classList.toggle('on', destapar));
        destapadas = destapar ? $('al-lamina').querySelectorAll('.al-cap').length : 0; actualizarCont();
    }

    // ---------- examen
    function iniciarExamen() {
        const base = visibles.length ? visibles.slice() : datos.slice();
        if (!base.length) return;
        for (let n = base.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [base[n], base[j]] = [base[j], base[n]]; }
        examen = { lista: base.slice(0, 8), i: 0, ok: 0, tot: 0, t: ahora() };
        $('al-fin').hidden = true; mostrar(examen.lista[0]);
    }
    function finExamen() {
        const e = examen, pct = e.tot ? Math.round(e.ok / e.tot * 100) : 0, seg = Math.round((ahora() - e.t) / 1000);
        const nota = pct >= 85 ? '¡Excelente! Dominás estas láminas.' : pct >= 60 ? 'Vas bien: repasá las que fallaste.' : 'Todavía hay que practicar: volvé a las láminas en modo escribir.';
        $('al-fin-cuerpo').innerHTML = `<div class="al-nota">${pct}%</div><p><b>${e.ok}</b> de <b>${e.tot}</b> estructuras · ${Math.floor(seg / 60)} min ${seg % 60} s</p><p>${nota}</p>`;
        try { const h = JSON.parse(localStorage.getItem(KEY + '_examenes') || '[]'); h.push({ t: ahora(), ok: e.ok, tot: e.tot }); localStorage.setItem(KEY + '_examenes', JSON.stringify(h.slice(-30))); } catch (_) {}
        $('al-fin').hidden = false;
    }

    function init(json, regs) {
        datos = json.placas || []; regiones = regs;
        const ups = $('al-ups');
        ups.innerHTML = '<button type="button" class="al-chip on" data-u="0">Todas</button>' + Object.keys(COL).map((n) => `<button type="button" class="al-chip" style="--c:${COL[n]}" data-u="${n}">UP ${n}</button>`).join('') + '<button type="button" class="al-chip al-chip-rep" id="al-chip-rep" data-rep="1">↻ Para repasar</button>';
        ups.addEventListener('click', (ev) => {
            const b = ev.target.closest('.al-chip'); if (!b) return;
            if (b.dataset.rep) { soloRepasar = !soloRepasar; b.classList.toggle('on', soloRepasar); }
            else { filtroUp = +b.dataset.u; ups.querySelectorAll('.al-chip[data-u]').forEach((x) => x.classList.toggle('on', x === b)); }
            filtrar();
        });
        let t = 0; $('al-q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { texto = e.target.value; filtrar(); }, 160); });
        $('al-cerrar').addEventListener('click', cerrar);
        $('al-prev').addEventListener('click', () => { if (!examen) abrir(pos - 1); });
        $('al-next').addEventListener('click', () => { if (!examen) abrir(pos + 1); });
        $('al-tapar').addEventListener('click', () => todas(false));
        $('al-mostrar').addEventListener('click', () => todas(true));
        $('al-modo').addEventListener('click', () => { modo = modo === 'tocar' ? 'escribir' : 'tocar'; try { localStorage.setItem(KEY + '_modo', modo); } catch (_) {} mostrar(visibles[pos]); });
        $('al-pista').addEventListener('click', () => { const h = $('al-mirar').hidden = !$('al-mirar').hidden; $('al-pista').textContent = h ? '💡 Qué mirar' : '💡 Ocultar pista'; });
        $('al-zoom').addEventListener('click', () => { const z = $('al-lamina').classList.toggle('zoom'); $('al-zoom').textContent = z ? '🔍 Reducir' : '🔍 Ampliar'; });
        $('al-ok').addEventListener('click', () => marcar('ok'));
        $('al-repasar').addEventListener('click', () => marcar('rep'));
        $('al-examen').addEventListener('click', iniciarExamen);
        $('al-fin-otra').addEventListener('click', iniciarExamen);
        $('al-fin-cerrar').addEventListener('click', cerrar);
        document.addEventListener('keydown', (ev) => {
            if ($('al-visor').hidden || ev.target.tagName === 'INPUT') return;
            if (ev.key === 'Escape') cerrar(); else if (!examen && ev.key === 'ArrowRight') abrir(pos + 1); else if (!examen && ev.key === 'ArrowLeft') abrir(pos - 1);
        });
        try { modo = localStorage.getItem(KEY + '_modo') === 'escribir' ? 'escribir' : 'tocar'; } catch (_) {}
        try {
            const sp = new URLSearchParams(location.search), up = +sp.get('up'), reg = sp.get('region');
            if (up && COL[up]) { filtroUp = up; ups.querySelectorAll('.al-chip[data-u]').forEach((x) => x.classList.toggle('on', +x.dataset.u === up)); }
            if (reg && regs && regs.regiones[reg]) filtroReg = reg;
            if (sp.get('modo') === 'escribir') modo = 'escribir';
        } catch (_) {}
        filtrar(); resumen();
        try { const sp = new URLSearchParams(location.search), c = sp.get('lamina'); if (c) { const i = visibles.findIndex((p) => p.c === c); if (i >= 0) abrir(i); } if (sp.get('examen')) iniciarExamen(); } catch (_) {}
    }

    Promise.all([
        fetch('data/atlas_laminas.json').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
        fetch('data/atlas_regiones.json').then((r) => r.ok ? r.json() : null).catch(() => null)
    ]).then(([a, b]) => init(a, b)).catch((e) => {
        console.error('[Modo láminas]', e);
        $('al-grid').innerHTML = '<p class="al-vacio">No pudimos cargar las láminas. Probá recargar la página.</p>';
    });
})();
