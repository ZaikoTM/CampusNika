/* CAMPUS NIKA · Texto con formato para las notas del Lector NikaMed (pdfNotas.js, pdfAnotaciones.js)
   Una barra de formato liviana (tipografía, tamaño, negrita, cursiva, subrayado, color, imagen y «Más») que se enlaza a cualquier editor
   contenteditable, y la limpieza del HTML que se guarda (misma lista permitida que «Mis notas»: nada de scripts).
   · Con texto seleccionado el formato se aplica a la selección.
   · Sin selección: en una caja de texto sobre el PDF se aplica a toda la caja (opts.caja); en el cuaderno, a todo el texto o a lo que escribas después.
   · Imágenes: se pegan (Ctrl+V, capturas, imágenes copiadas de una web), se sueltan o se eligen; se reducen y comprimen antes de guardarse,
     y se les cambia el tamaño tocándolas (arrastrando la esquina o con 25 / 50 / 75 / 100 %).
   · Estilo favorito (⭐): fuente y color que usan por defecto las cajas y notas nuevas; viaja con las preferencias del lector. */
(function () {
  'use strict';
  if (window.NikaRich) return;
  const TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'SPAN', 'FONT', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'MARK', 'SUB', 'SUP', 'BLOCKQUOTE', 'IMG']);
  const PROPS = new Set(['color', 'background-color', 'background', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'text-transform', 'text-align', 'line-height']);
  const IMG_OK = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i;
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const aHtml = (txt) => esc(txt).replace(/\n/g, '<br>');
  const avisar = (t) => { try { if (window.NikaPdf && window.NikaPdf.aviso) window.NikaPdf.aviso(t); else if (typeof window.showToast === 'function') window.showToast(t); } catch (_) {} };

  function limpiar(html) {
    const doc = new DOMParser().parseFromString('<div>' + String(html || '') + '</div>', 'text/html');
    const raiz = doc.body.firstChild;
    (function rec(n) {
      [...n.childNodes].forEach((h) => {
        if (h.nodeType === 3) return;
        if (h.nodeType === 1 && h.tagName === 'IMG') {
          const src = h.getAttribute('src') || '';
          if (!IMG_OK.test(src)) { h.remove(); return; }
          const m = /(?:^|;)\s*width:\s*([\d.]+)%/.exec(h.getAttribute('style') || ''), w = m ? Math.max(5, Math.min(100, parseFloat(m[1]))) : 0;   // el ancho elegido se conserva (en %)
          [...h.attributes].forEach((a) => h.removeAttribute(a.name));
          h.setAttribute('src', src); h.setAttribute('style', 'max-width:100%;height:auto' + (w ? ';width:' + w + '%' : '')); return;
        }
        if (h.nodeType !== 1 || !TAGS.has(h.tagName)) { if (h.nodeType === 1 && /^(SCRIPT|STYLE|IFRAME|OBJECT)$/.test(h.tagName)) { h.remove(); return; } rec(h); while (h.firstChild) n.insertBefore(h.firstChild, h); h.remove(); return; }
        [...h.attributes].forEach((a) => {
          if (a.name === 'style') {
            const ok = a.value.split(';').map((d) => d.trim()).filter((d) => { const p = d.split(':')[0].trim().toLowerCase(); return PROPS.has(p) && !/url\(|expression|javascript/i.test(d); });
            if (ok.length) h.setAttribute('style', ok.join('; ')); else h.removeAttribute('style');
          } else if (!(h.tagName === 'FONT' && /^(color|face|size)$/.test(a.name))) h.removeAttribute(a.name);
        });
        rec(h);
      });
    })(raiz);
    return raiz.innerHTML;
  }

  const FUENTES = [
    ['Plus Jakarta Sans, system-ui, sans-serif', 'Moderna'],
    ['Georgia, "Times New Roman", serif', 'Con serif (libro)'],
    ['"Segoe UI", Arial, Helvetica, sans-serif', 'Clásica'],
    ['Consolas, "Courier New", monospace', 'Máquina de escribir'],
    ['"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive', 'Manuscrita'],
    ['"Trebuchet MS", Verdana, sans-serif', 'Redondeada'],
    ['"Arial Narrow", "Roboto Condensed", Arial, sans-serif', 'Condensada']
  ];
  // tamaños: en el cuaderno son píxeles; sobre el PDF son múltiplos de la letra de la caja, para que escalen con el zoom
  const TAM_PX = [11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40];
  const TAM_EM = [.6, .75, .9, 1, 1.2, 1.5, 1.8, 2.2, 3];
  const COL_TEXTO = ['#0f172a', '#475569', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#ffffff', '#92400e'];
  const COL_RESALTE = ['#fde047', '#fdba74', '#fca5a5', '#f9a8d4', '#d8b4fe', '#93c5fd', '#6ee7b7', '#bef264'];
  const I = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICO = {
    izq: I('M4 6h16M4 10h10M4 14h16M4 18h10'), cen: I('M4 6h16M7 10h10M4 14h16M7 18h10'), der: I('M4 6h16M10 10h10M4 14h16M10 18h10'),
    ul: I('M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01'), ol: I('M10 6h10M10 12h10M10 18h10M4 4.5l1.5-1V8M4 14h3l-3 3.5h3'),
    limpiar: I('M5 6V4.5h14V6M12 4.5V19M9 19h6M4 4l16 16'), tach: I('M5 12h14M16 7.5A4 3 0 0 0 12 6c-2.5 0-4 1.2-4 3s1.5 2.5 4 3 4 1.2 4 3-1.5 3-4 3a4 3 0 0 1-4-1.5'),
    mas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/></svg>',
    img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-9 9"/></svg>',
    resalte: I('M4 20h7M14.5 4.5l5 5L9 20l-5 .5.5-5z'), arch: I('M4 8l2-3h5l2 3h7v11H4z'), pegar: I('M9 4h6v3H9zM7 5.5H5v15h14v-15h-2'),
    estrella: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/></svg>'
  };
  const fmtEm = (v) => Math.round(v * 100) + ' %';

  // ---- estilo favorito (fuente y color): se guarda con las preferencias del lector, que ya viajan a la cuenta
  function favorito() { try { const u = JSON.parse(localStorage.getItem('nika_pdf_ui') || 'null'); const f = u && u.fav; return f && (f.f || f.c) ? f : null; } catch (_) { return null; } }
  function guardarFavorito(f) {
    try {
      const u = JSON.parse(localStorage.getItem('nika_pdf_ui') || 'null') || {};
      if (f) u.fav = { f: f.f || '', c: f.c || '' }; else delete u.fav;
      localStorage.setItem('nika_pdf_ui', JSON.stringify(u));
      if (window.NikaPdf && window.NikaPdf.sincronizarPrefs) window.NikaPdf.sincronizarPrefs();
    } catch (_) {}
  }
  // envuelve el contenido nuevo con el estilo favorito (para que quede guardado y no solo se vea mientras se escribe)
  function conFavorito(html) {
    const f = favorito(); if (!f || !html) return html;
    const sp = document.createElement('span'); if (f.f) sp.style.fontFamily = f.f; if (f.c) sp.style.color = f.c; sp.innerHTML = html;
    return limpiar(sp.outerHTML);
  }

  function barraHtml() {
    return `<div class="nkr-bar" role="toolbar" aria-label="Formato del texto">`
      + `<button type="button" class="nkr-dd" data-dd="fuente" title="Tipografía" aria-haspopup="listbox"><b>Aa</b><span>Letra</span><i>▾</i></button>`
      + `<button type="button" class="nkr-dd" data-dd="tam" title="Tamaño de letra" aria-haspopup="listbox"><span>Tamaño</span><i>▾</i></button>`
      + `<span class="nkr-sep"></span>`
      + `<button type="button" data-c="bold" title="Negrita (Ctrl+B)"><b>N</b></button><button type="button" data-c="italic" title="Cursiva (Ctrl+I)"><i>C</i></button><button type="button" data-c="underline" title="Subrayado (Ctrl+U)"><u>S</u></button>`
      + `<button type="button" class="nkr-cl" data-dd="color" title="Color del texto" aria-haspopup="true"><span class="a">A</span></button>`
      + `<span class="nkr-sep"></span>`
      + `<button type="button" data-dd="imagen" title="Insertar una imagen (también podés pegarla con Ctrl+V)" aria-haspopup="true">${ICO.img}</button>`
      + `<button type="button" data-dd="mas" title="Más opciones: tachado, resaltado, alineación, listas, estilo favorito…" aria-haspopup="true">${ICO.mas}</button>`
      + `</div>`;
  }

  function css() {
    if (document.getElementById('nkr-css')) return;
    const st = document.createElement('style'); st.id = 'nkr-css';
    st.textContent = `
.nkr-bar{display:flex;flex-wrap:wrap;gap:2px;align-items:center;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkr-bar svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:block}
.nkr-bar button{border:0;background:transparent;color:#1e293b;border-radius:8px;min-width:28px;height:28px;padding:0 6px;cursor:pointer;font:800 12px/1 inherit;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:4px;transition:background .15s,transform .15s}
.nkr-bar button:hover{background:rgba(15,23,42,.09)}.nkr-bar button:active{transform:scale(.94)}
.nkr-bar button.on{background:rgba(124,58,237,.22);color:#4c1d95}
.nkr-dd{padding:0 7px!important}.nkr-dd b{font-size:13px;font-weight:800}.nkr-dd i{font-style:normal;font-size:9px;opacity:.6}.nkr-dd span{max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nkr-sep{width:1px;height:16px;background:rgba(15,23,42,.16);margin:0 3px}
.nkr-cl .a{font-weight:900;font-size:14px;border-bottom:3px solid #dc2626;line-height:1;padding:0 2px}
.nkr-pop{position:fixed;z-index:2147483300;min-width:160px;max-width:270px;max-height:min(360px,72vh);overflow:auto;padding:6px;border-radius:14px;background:rgba(15,23,42,.97);color:#e2e8f0;border:1px solid rgba(168,85,247,.55);box-shadow:0 18px 40px rgba(2,6,23,.55);font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:nkrPop .16s cubic-bezier(.2,.9,.3,1.2);scrollbar-width:thin;scrollbar-color:#7c3aed transparent}
@keyframes nkrPop{from{opacity:0;transform:translateY(-4px) scale(.97)}to{opacity:1;transform:none}}
.nkr-pop button.it{display:flex;width:100%;align-items:center;gap:10px;border:0;background:transparent;color:inherit;text-align:left;padding:8px 11px;border-radius:9px;cursor:pointer;font-size:14px;font-weight:600;transition:background .12s}
.nkr-pop button.it:hover{background:rgba(168,85,247,.28)}.nkr-pop button.it small{margin-left:auto;font-size:11px;opacity:.55}
.nkr-pop button.it svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;opacity:.85}
.nkr-pop hr{border:0;border-top:1px solid rgba(255,255,255,.12);margin:5px 4px}
.nkr-pop .fila{display:flex;gap:4px;padding:2px 4px}.nkr-pop .fila button{flex:1;border:0;background:rgba(255,255,255,.07);color:inherit;border-radius:9px;height:34px;cursor:pointer;display:grid;place-items:center;transition:background .12s}.nkr-pop .fila button:hover{background:rgba(168,85,247,.35)}
.nkr-pop .fila svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.nkr-pop .sw{display:grid;grid-template-columns:repeat(6,26px);gap:7px;padding:6px}
.nkr-pop .sw button{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.35);cursor:pointer;padding:0;transition:transform .12s;position:relative}.nkr-pop .sw button:hover{transform:scale(1.2);border-color:#fff}
.nkr-pop .sw button.fav::after{content:'★';position:absolute;inset:0;display:grid;place-items:center;font-size:12px;color:#fff;text-shadow:0 0 3px #000}
.nkr-pop .sw button.no{background:linear-gradient(135deg,#fff 45%,#dc2626 46%,#dc2626 54%,#fff 55%)}
.nkr-pop label.otro{display:flex;align-items:center;gap:8px;margin:2px 6px 4px;padding:6px 8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.07)}.nkr-pop label.otro:hover{background:rgba(168,85,247,.28)}
.nkr-pop label.otro input{width:26px;height:22px;padding:0;border:0;background:none;cursor:pointer}
.nkr-ov{position:fixed;z-index:2147483300;pointer-events:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.nkr-ov .b{position:absolute;inset:-2px;border:2px solid #7c3aed;border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,.6)}
.nkr-ov .h{position:absolute;right:-9px;bottom:-9px;width:16px;height:16px;border-radius:50%;background:#7c3aed;border:2px solid #fff;cursor:nwse-resize;pointer-events:auto;touch-action:none;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.nkr-ov .bar{position:absolute;left:0;bottom:calc(100% + 8px);display:flex;gap:2px;padding:3px;border-radius:11px;background:#0f172a;box-shadow:0 10px 24px rgba(0,0,0,.45);pointer-events:auto;white-space:nowrap}
.nkr-ov .bar.abajo{bottom:auto;top:calc(100% + 8px)}
.nkr-ov .bar button{border:0;background:transparent;color:#e2e8f0;border-radius:8px;height:28px;min-width:38px;padding:0 7px;font:800 12px/1 inherit;font-family:inherit;cursor:pointer}.nkr-ov .bar button:hover{background:#334155}.nkr-ov .bar button.on{background:#7c3aed}`;
    document.head.appendChild(st);
  }

  // ---- menús desplegables propios (reemplazan a los <select> del navegador)
  let popAbierto = null;
  function cerrarPop() { if (!popAbierto) return; popAbierto.el.remove(); document.removeEventListener('pointerdown', popAbierto.fuera, true); document.removeEventListener('keydown', popAbierto.tecla, true); window.removeEventListener('resize', cerrarPop); if (popAbierto.btn) popAbierto.btn.classList.remove('on'); popAbierto = null; }
  function abrirPop(btn, html, alElegir) {
    cerrarPop();
    const p = document.createElement('div'); p.className = 'nkr-pop'; p.innerHTML = html;
    (document.fullscreenElement || document.body).appendChild(p);
    const r = btn.getBoundingClientRect();
    p.style.left = Math.max(8, Math.min(innerWidth - p.offsetWidth - 8, r.left)) + 'px';
    let top = r.bottom + 6; if (top + p.offsetHeight > innerHeight - 8) top = Math.max(8, r.top - p.offsetHeight - 6);
    p.style.top = top + 'px';
    p.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!e.target.closest('input')) e.preventDefault(); });
    p.addEventListener('click', (e) => { const it = e.target.closest('[data-v]'); if (it) { cerrarPop(); alElegir(it.dataset.v); } });
    p.addEventListener('input', (e) => { if (e.target.matches('input[type=color]')) { const v = e.target.value; cerrarPop(); alElegir(v); } });
    const fuera = (e) => { if (!p.contains(e.target) && !btn.contains(e.target)) cerrarPop(); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); cerrarPop(); } };
    document.addEventListener('pointerdown', fuera, true); document.addEventListener('keydown', tecla, true); window.addEventListener('resize', cerrarPop);
    btn.classList.add('on'); popAbierto = { el: p, fuera, tecla, btn };
  }

  // ---- imágenes: se reducen y comprimen antes de guardarse (una captura pesa cientos de KB si no)
  function reducirImagen(file, max, calidad) {
    return new Promise((ok, mal) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/jpeg', calidad));
      };
      img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('imagen')); };
      img.src = url;
    });
  }
  async function imagenAData(file) {
    let u = await reducirImagen(file, 1100, .8);
    if (u.length > 330000) u = await reducirImagen(file, 800, .7);
    if (u.length > 330000) u = await reducirImagen(file, 600, .6);
    return u;
  }

  // ---- tamaño de una imagen: se toca y aparece el marco con la esquina para arrastrar y los tamaños rápidos
  let ov = null;
  function quitarOv() { if (!ov) return; ov.el.remove(); window.removeEventListener('scroll', ov.pos, true); window.removeEventListener('resize', ov.pos); document.removeEventListener('pointerdown', ov.fuera, true); ov = null; }
  function seleccionarImg(img, ed, hecho) {
    quitarOv();
    const el = document.createElement('div'); el.className = 'nkr-ov';
    el.innerHTML = '<div class="b"></div><div class="bar"><button type="button" data-w="25">25 %</button><button type="button" data-w="50">50 %</button><button type="button" data-w="75">75 %</button><button type="button" data-w="100">100 %</button><button type="button" data-del title="Quitar la imagen">🗑</button></div><i class="h" title="Arrastrá para cambiar el tamaño"></i>';
    (document.fullscreenElement || document.body).appendChild(el);
    const bar = el.querySelector('.bar');
    const pos = () => {
      if (!document.body.contains(img)) { quitarOv(); return; }
      const r = img.getBoundingClientRect(); el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.width = r.width + 'px'; el.style.height = r.height + 'px';
      bar.classList.toggle('abajo', r.top < 50);
      bar.querySelectorAll('[data-w]').forEach((b) => b.classList.toggle('on', Math.abs(parseFloat(img.style.width) - +b.dataset.w) < 1));
    };
    const ancho = () => { const cs = getComputedStyle(ed); return ed.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0); };
    const poner = (pct) => { img.style.width = Math.max(5, Math.min(100, pct)).toFixed(1) + '%'; img.style.height = 'auto'; pos(); };
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.w) { poner(+b.dataset.w); hecho(); }
      else if (b.hasAttribute('data-del')) { img.remove(); quitarOv(); hecho(); }
    });
    el.querySelector('.h').addEventListener('pointerdown', (e) => {
      if (e.button) return; e.preventDefault(); e.stopPropagation();
      const x0 = e.clientX, w0 = img.getBoundingClientRect().width, cw = Math.max(40, ancho());
      const mv = (ev) => poner(((w0 + (ev.clientX - x0)) / cw) * 100);
      const fin = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin); hecho(); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
    });
    const fuera = (e) => { if (!el.contains(e.target) && e.target !== img) quitarOv(); };
    document.addEventListener('pointerdown', fuera, true); window.addEventListener('scroll', pos, true); window.addEventListener('resize', pos);
    ov = { el, pos, fuera, img }; pos();
  }

  /* Enlaza una barra (creada con barraHtml) a un editor contenteditable.
     opts: { unidad:'px'|'em', caja:{ fuente(v), tam(v), color(v), alinear(v) }, alCambiar(ed, escribiendo) } */
  function enlazar(barra, ed, opts) {
    css();
    opts = opts || {};
    const em = opts.unidad === 'em';
    let rango = null;
    const guardar = () => { const s = getSelection(); if (s && s.rangeCount && ed.contains(s.anchorNode)) rango = s.getRangeAt(0).cloneRange(); };
    ['keyup', 'mouseup', 'focus', 'input', 'touchend'].forEach((ev) => ed.addEventListener(ev, guardar));
    document.addEventListener('selectionchange', () => { if (document.activeElement === ed) guardar(); });
    barra.addEventListener('mousedown', (e) => { e.preventDefault(); });
    barra.addEventListener('pointerdown', (e) => { e.preventDefault(); });

    const volver = () => { ed.focus({ preventScroll: true }); if (rango) { const s = getSelection(); s.removeAllRanges(); s.addRange(rango); } };
    const hecho = () => { guardar(); if (opts.alCambiar) opts.alCambiar(ed); };
    const sinSel = () => { const s = getSelection(); return !s.rangeCount || s.isCollapsed || !ed.contains(s.anchorNode); };
    const todo = () => { const r = document.createRange(); r.selectNodeContents(ed); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    const vacio = () => !ed.textContent.trim();
    const css1 = (v) => { try { document.execCommand('styleWithCSS', false, v); } catch (_) {} };
    const factorAncestros = (n) => { let f = 1; for (let p = n.parentElement; p && p !== ed; p = p.parentElement) { const m = /font-size:\s*([\d.]+)em/.exec(p.getAttribute('style') || ''); if (m) f *= parseFloat(m[1]); } return f; };

    function tamano(val) {
      const v = parseFloat(val); if (!v) return;
      volver();
      if (em && sinSel() && opts.caja) { opts.caja.tam(v); hecho(); return; }
      if (sinSel()) { if (vacio()) return; todo(); }
      css1(false); document.execCommand('fontSize', false, '7'); css1(true);
      const nuevos = [];
      ed.querySelectorAll('font[size="7"]').forEach((f) => {
        f.querySelectorAll('[style*="font-size"]').forEach((x) => { x.style.fontSize = ''; if (!x.getAttribute('style')) x.removeAttribute('style'); });
        const sp = document.createElement('span');
        sp.style.fontSize = em ? (v / factorAncestros(f)).toFixed(3) + 'em' : v + 'px';
        if (!em) sp.style.lineHeight = '1.3';
        while (f.firstChild) sp.appendChild(f.firstChild); f.replaceWith(sp); nuevos.push(sp);
      });
      if (nuevos.length) {   // la selección queda sobre lo que se acaba de cambiar, para seguir dándole formato
        const r = document.createRange(); r.setStartBefore(nuevos[0]); r.setEndAfter(nuevos[nuevos.length - 1]);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      }
      hecho();
    }
    function ejecutar(cmd, val) {
      volver(); css1(true);
      if (opts.caja && sinSel()) {
        if (cmd === 'fontName') { opts.caja.fuente(val); hecho(); return; }
        if (cmd === 'foreColor') { opts.caja.color(val); hecho(); return; }
        if (/^justify/.test(cmd)) { opts.caja.alinear(cmd === 'justifyCenter' ? 'center' : cmd === 'justifyRight' ? 'right' : 'left'); hecho(); return; }
      }
      if (!opts.caja && sinSel() && !vacio() && (cmd === 'fontName' || cmd === 'foreColor' || cmd === 'hiliteColor')) todo();
      if (cmd === 'removeFormat' && sinSel()) todo();
      document.execCommand(cmd, false, val == null ? null : val);
      hecho();
    }
    async function insertarImagenes(archivos) {
      let n = 0;
      for (const f of archivos) {
        try { const u = await imagenAData(f); volver(); document.execCommand('insertHTML', false, `<img src="${u}" style="max-width:100%;height:auto"><br>`); hecho(); n++; }
        catch (_) { avisar('No se pudo insertar esa imagen'); }
      }
      return n;
    }
    ed._rich = { insertarImagenes };
    const traerImagen = (url) => fetch(url).then((r) => r.blob()).then((b) => { if (!/^image\//.test(b.type)) throw new Error('no es imagen'); return insertarImagenes([new File([b], 'imagen', { type: b.type })]); })
      .catch(() => avisar('No se pudo traer esa imagen. Guardala y subila con el botón de imagen.'));
    async function pegarDelPortapapeles() {
      try {
        const items = await navigator.clipboard.read(); const files = [];
        for (const it of items) { const t = it.types.find((x) => /^image\//.test(x)); if (t) files.push(new File([await it.getType(t)], 'captura', { type: t })); }
        if (files.length) insertarImagenes(files); else avisar('No hay ninguna imagen copiada');
      } catch (_) { avisar('Tu navegador no dejó leer el portapapeles. Probá con Ctrl+V dentro de la nota.'); }
    }
    function estiloActual() {
      volver(); const s = getSelection(); let n = s.rangeCount ? s.anchorNode : ed; if (n && n.nodeType === 3) n = n.parentElement;
      if (!n || !ed.contains(n)) n = ed; const cs = getComputedStyle(n); return { f: cs.fontFamily, c: cs.color };
    }
    const menu = (btn, kf) => {
      const k = kf || btn.dataset.dd;
      if (!kf && popAbierto && popAbierto.btn === btn) { cerrarPop(); return; }
      const fav = favorito();
      if (k === 'fuente') {
        const favF = fav && fav.f ? `<button type="button" class="it" data-v="${esc(fav.f)}" style="font-family:${esc(fav.f)}">Mi favorita<small>★</small></button><hr>` : '';
        abrirPop(btn, favF + FUENTES.map(([v, n]) => `<button type="button" class="it" data-v="${esc(v)}" style="font-family:${esc(v)}">${n}</button>`).join(''), (v) => ejecutar('fontName', v));
      } else if (k === 'tam') abrirPop(btn, (em ? TAM_EM : TAM_PX).map((v) => `<button type="button" class="it" data-v="${v}"><span style="font-size:${em ? Math.min(22, 13 * v) : Math.min(22, v)}px">${em ? fmtEm(v) : v + ' px'}</span>${em && v === 1 ? '<small>normal</small>' : ''}</button>`).join(''), (v) => tamano(v));
      else if (k === 'color') {
        const lista = (fav && fav.c ? [fav.c] : []).concat(COL_TEXTO);
        abrirPop(btn, `<div class="sw">${lista.map((c, i) => `<button type="button" class="${i === 0 && fav && fav.c ? 'fav' : ''}" data-v="${esc(c)}" style="background:${esc(c)}" aria-label="${esc(c)}"${i === 0 && fav && fav.c ? ' title="Mi color favorito"' : ''}></button>`).join('')}</div><label class="otro">🎨 Otro color<input type="color" value="#2563eb"></label>`, (v) => { const a = btn.querySelector('.a'); if (a) a.style.borderBottomColor = v; ejecutar('foreColor', v); });
      } else if (k === 'resalte') {
        abrirPop(btn, `<div class="sw">${COL_RESALTE.map((c) => `<button type="button" data-v="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}<button type="button" class="no" data-v="transparent" title="Quitar resaltado" aria-label="Quitar resaltado"></button></div><label class="otro">🎨 Otro color<input type="color" value="#fde047"></label>`, (v) => ejecutar('hiliteColor', v));
      } else if (k === 'imagen') {
        abrirPop(btn, `<button type="button" class="it" data-v="archivo">${ICO.arch}Elegir un archivo…</button><button type="button" class="it" data-v="pegar">${ICO.pegar}Pegar del portapapeles</button><small style="display:block;padding:4px 11px 6px;opacity:.6;font-size:11px">También con Ctrl+V o arrastrando</small>`, (v) => {
          if (v === 'pegar') { pegarDelPortapapeles(); return; }
          const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.multiple = true;
          i.onchange = () => { if (i.files && i.files.length) insertarImagenes([...i.files]); }; i.click();
        });
      } else if (k === 'mas') {
        abrirPop(btn, `<button type="button" class="it" data-v="strikeThrough">${ICO.tach}Tachado</button><button type="button" class="it" data-v="resalte">${ICO.resalte}Resaltar con color…</button><hr>`
          + `<div class="fila"><button type="button" data-v="justifyLeft" title="Alinear a la izquierda">${ICO.izq}</button><button type="button" data-v="justifyCenter" title="Centrar">${ICO.cen}</button><button type="button" data-v="justifyRight" title="Alinear a la derecha">${ICO.der}</button><button type="button" data-v="insertUnorderedList" title="Viñetas">${ICO.ul}</button><button type="button" data-v="insertOrderedList" title="Lista numerada">${ICO.ol}</button></div><hr>`
          + `<button type="button" class="it" data-v="removeFormat">${ICO.limpiar}Quitar el formato</button>`
          + `<button type="button" class="it" data-v="favGuardar">${ICO.estrella}Guardar mi estilo favorito<small>letra y color</small></button>${fav ? `<button type="button" class="it" data-v="favQuitar">${ICO.estrella}Quitar mi estilo favorito</button>` : ''}`,
          (v) => {
            if (v === 'resalte') { menu(btn, 'resalte'); return; }
            if (v === 'favGuardar') { const e = estiloActual(); guardarFavorito(e); avisar('⭐ Listo: tus cajas y notas nuevas usarán esta letra y este color'); return; }
            if (v === 'favQuitar') { guardarFavorito(null); avisar('Estilo favorito quitado'); return; }
            ejecutar(v);
          });
      }
    };
    barra.addEventListener('click', (e) => {
      const dd = e.target.closest('[data-dd]'); if (dd) { menu(dd); return; }
      const b = e.target.closest('[data-c]'); if (b) ejecutar(b.dataset.c);
    });
    // pegar: capturas e imágenes copiadas se insertan reducidas; el resto conserva el formato básico, limpio
    ed.addEventListener('paste', (e) => {
      const cd = e.clipboardData; if (!cd) return;
      let imgs = [...(cd.items || [])].filter((i) => i.kind === 'file' && /^image\//.test(i.type)).map((i) => i.getAsFile()).filter(Boolean);
      if (!imgs.length) imgs = [...(cd.files || [])].filter((f) => /^image\//.test(f.type));
      if (imgs.length) { e.preventDefault(); insertarImagenes(imgs); return; }
      const h = cd.getData('text/html'), t = cd.getData('text/plain');
      const m = h && /<img[^>]+src=["']((?:https?:|data:image)[^"']+)["']/i.exec(h);
      if (m && !t.trim()) { e.preventDefault(); traerImagen(m[1].replace(/&amp;/g, '&')); return; }   // imagen copiada desde una página web
      e.preventDefault();
      if (h) document.execCommand('insertHTML', false, limpiar(h.replace(/<!--[\s\S]*?-->/g, '').replace(/font-size:[^;"']+;?/gi, '').replace(/line-height:[^;"']+;?/gi, '')).replace(/<img[^>]*>/gi, ''));
      else document.execCommand('insertText', false, t);
      hecho();
    });
    ed.addEventListener('dragover', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
    ed.addEventListener('drop', (e) => {
      const fs = e.dataTransfer && [...e.dataTransfer.files].filter((f) => /^image\//.test(f.type)); if (!fs || !fs.length) return;
      e.preventDefault(); ed.focus(); insertarImagenes(fs);
    });
    ed.addEventListener('click', (e) => { if (e.target.tagName === 'IMG' && ed.contains(e.target)) seleccionarImg(e.target, ed, hecho); });
    ed.addEventListener('input', () => { if (opts.alCambiar) opts.alCambiar(ed, true); });
    return { guardar, volver, insertarImagenes };
  }

  window.NikaRich = { limpiar, aHtml, esc, FUENTES, barraHtml, enlazar, css, cerrarPop, favorito, conFavorito };
})();
