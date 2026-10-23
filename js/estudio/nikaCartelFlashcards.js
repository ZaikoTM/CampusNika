/* NikaCartelFC — cartel suave que ofrece repasar con flashcards cuando terminás de leer un PDF (o cerrás tras una buena sesión de lectura).
   Abre el mazo de la unidad del material (Ginecología y Cirugía, que son las que tienen tarjetas). Sin mazo, no aparece.
   Una vez por PDF y por día; el "No mostrar más" lo apaga para siempre en ese navegador. */
(function () {
  'use strict';
  if (window.NikaCartelFC) return;
  const OFF = 'nika_fc_cartel_off';
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hoy = () => new Date().toISOString().slice(0, 10);

  // unidad del material abierto, con el mismo criterio de la solapa Flashcards de la unidad
  function unidad() {
    try {
      if (typeof EstudioState === 'undefined') return null;
      const modulo = EstudioState.modulo;
      if (modulo !== 'ginecologia' && modulo !== 'cirugia') return null;
      let up = String(EstudioState.currentUpId || '').toLowerCase().replace('__sec', '-sec');
      if (!up) return null;
      if (modulo === 'cirugia') up = up.replace(/^up(\d+).*$/, 'cx$1');
      return up;
    } catch (_) { return null; }
  }

  function css() {
    if (document.getElementById('nkfc-css')) return;
    const st = document.createElement('style'); st.id = 'nkfc-css';
    st.textContent = `
.nkfc{position:fixed;right:18px;bottom:96px;z-index:2147483000;width:min(340px,calc(100vw - 28px));padding:14px 14px 12px;border-radius:20px;color:#e2e8f0;font-family:inherit;
  background:linear-gradient(150deg,#0b1535,#1e1b4b 58%,#3b0764);border:1px solid rgba(168,85,247,.5);box-shadow:0 22px 44px -14px rgba(2,6,23,.7),0 0 0 1px rgba(255,255,255,.04) inset;
  animation:nkfcEntra .6s cubic-bezier(.22,1.2,.36,1) both;overflow:hidden}
.nkfc.sale{animation:nkfcSale .35s ease forwards}
@keyframes nkfcEntra{from{opacity:0;transform:translateY(26px) scale(.94)}to{opacity:1;transform:none}}
@keyframes nkfcSale{to{opacity:0;transform:translateY(16px) scale(.96)}}
.nkfc::before{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.1) 50%,transparent 65%);background-size:250% 100%;animation:nkfcBrillo 5s linear 1s infinite;pointer-events:none}
@keyframes nkfcBrillo{from{background-position:150% 0}to{background-position:-100% 0}}
.nkfc-fila{display:flex;gap:12px;align-items:flex-start;position:relative}
.nkfc-ic{flex:0 0 auto;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;font-size:1.35rem;background:linear-gradient(135deg,#7e22ce,#6366f1);box-shadow:0 8px 18px -8px #a855f7;animation:nkfcLat 2.8s ease-in-out infinite}
@keyframes nkfcLat{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.1) rotate(-6deg)}}
.nkfc b{display:block;font-size:.95rem;font-weight:800;color:#fff;margin-bottom:2px}
.nkfc p{margin:0;font-size:.8rem;line-height:1.35;color:#cbd5e1;font-weight:600}
.nkfc-acc{display:flex;gap:8px;margin-top:12px;position:relative}
.nkfc-si{flex:1;border:0;cursor:pointer;font:inherit;font-weight:800;font-size:.82rem;padding:9px 12px;border-radius:12px;color:#fff;text-align:center;text-decoration:none;
  background:linear-gradient(135deg,#7e22ce,#a855f7 60%,#6366f1);box-shadow:0 8px 16px -8px #a855f7;transition:transform .2s,box-shadow .2s}
.nkfc-si:hover{transform:translateY(-2px);box-shadow:0 12px 20px -8px #a855f7}.nkfc-si:active{transform:scale(.97)}
.nkfc-no{border:1px solid rgba(255,255,255,.2);background:transparent;color:#cbd5e1;cursor:pointer;font:inherit;font-weight:700;font-size:.8rem;padding:9px 12px;border-radius:12px;transition:background .2s}
.nkfc-no:hover{background:rgba(255,255,255,.1)}
.nkfc-x{position:absolute;right:-4px;top:-6px;border:0;background:transparent;color:#94a3b8;cursor:pointer;font-size:.8rem;padding:4px 6px;border-radius:8px}.nkfc-x:hover{color:#fff;background:rgba(255,255,255,.1)}
.nkfc-nunca{display:block;margin:9px auto 0;border:0;background:none;color:#94a3b8;font:inherit;font-size:.7rem;font-weight:600;cursor:pointer;text-decoration:underline;position:relative}
.nkfc-nunca:hover{color:#e2e8f0}
.nkfc-t{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;background:linear-gradient(90deg,#38bdf8,#a855f7);animation:nkfcTiempo 16s linear forwards}
.nkfc:hover .nkfc-t{animation-play-state:paused}
@keyframes nkfcTiempo{to{transform:scaleX(0)}}
@media (max-width:640px){.nkfc{right:10px;left:10px;width:auto;bottom:84px}}
@media (prefers-reduced-motion:reduce){.nkfc,.nkfc::before,.nkfc-ic,.nkfc-t{animation:none!important}.nkfc-t{display:none}}`;
    document.head.appendChild(st);
  }

  function cerrar(el, ms) { if (!el || el._c) return; el._c = 1; el.classList.add('sale'); setTimeout(() => el.remove(), ms == null ? 360 : ms); }

  // opts: { fileId, titulo, paginas, minutos, completo, host }
  function mostrar(o) {
    try {
      if (!o || !o.fileId || lsGet(OFF) === '1') return false;
      const up = unidad(); if (!up) return false;
      if (lsGet('nika_fc_cartel_' + o.fileId) === hoy()) return false;
      if (document.querySelector('.nkfc')) return false;
      lsSet('nika_fc_cartel_' + o.fileId, hoy());
      css();
      const leyo = o.paginas >= 3 ? 'Leíste ' + o.paginas + ' páginas' + (o.minutos >= 1 ? ' en ' + Math.round(o.minutos) + ' min' : '') + '. ' : '';
      const titulo = o.completo ? '¡Terminaste este PDF! 🎉' : '¡Buena sesión de lectura! 📖';
      const el = document.createElement('div'); el.className = 'nkfc'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      el.innerHTML = '<button class="nkfc-x" type="button" aria-label="Cerrar">✕</button><div class="nkfc-fila"><span class="nkfc-ic">🧠</span><div><b>' + titulo + '</b><p>' + esc(leyo) + '¿Querés repasar lo que leíste con las flashcards de la unidad?</p></div></div>'
        + '<div class="nkfc-acc"><a class="nkfc-si" href="flashcards.html?modo=practicar&up=' + encodeURIComponent(up) + '">Repasar con flashcards</a><button class="nkfc-no" type="button">Ahora no</button></div>'
        + '<button class="nkfc-nunca" type="button">No mostrar más este cartel</button><i class="nkfc-t"></i>';
      (o.host || document.body).appendChild(el);
      const t = setTimeout(() => cerrar(el), 16000);
      el.querySelector('.nkfc-x').onclick = el.querySelector('.nkfc-no').onclick = () => { clearTimeout(t); cerrar(el); };
      el.querySelector('.nkfc-nunca').onclick = () => { lsSet(OFF, '1'); clearTimeout(t); cerrar(el); };
      el.querySelector('.nkfc-si').addEventListener('click', () => { clearTimeout(t); });
      return true;
    } catch (_) { return false; }
  }

  window.NikaCartelFC = { mostrar, unidad };
})();
