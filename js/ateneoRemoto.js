// js/ateneoRemoto.js — barra remota de la llamada de Ateneos cuando vive en la ventana anfitriona (ateneo-host.html).
// No carga el motor de voz: solo le manda órdenes a esa ventana por BroadcastChannel, así navegar no corta la llamada.
(function () {
  'use strict';
  if (window.NikaAteneoRemoto) return;
  window.NikaAteneoRemoto = true;
  let bc = null; try { bc = new BroadcastChannel('nika-ateneo-host'); } catch (_) { return; }
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const st = document.createElement('style');
  st.textContent = '#ar-bar{position:fixed;left:14px;bottom:96px;z-index:99990;display:none;align-items:center;gap:8px;padding:7px 10px 7px 14px;border-radius:999px;background:rgba(15,23,42,.94);color:#f1f5f9;font:700 .8rem/1.2 "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 18px 32px -14px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.14)}'
    + '#ar-bar.on{display:flex;animation:arIn .3s ease}@keyframes arIn{from{opacity:0;transform:translateY(10px)}}'
    + '#ar-bar .pt{width:9px;height:9px;border-radius:50%;background:#22c55e;animation:arP 1.8s infinite}@keyframes arP{70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}}'
    + '#ar-bar .nm{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '#ar-bar button{border:0;border-radius:999px;width:34px;height:34px;cursor:pointer;background:rgba(255,255,255,.12);color:#fff;font-size:.95rem;transition:transform .15s,background .2s}'
    + '#ar-bar button:hover{transform:scale(1.1);background:rgba(255,255,255,.22)}#ar-bar button.off{background:#ef4444}#ar-bar button.out{background:#dc2626;width:auto;padding:0 12px;font-size:.74rem;font-weight:800}'
    + '#ar-bar{cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none}#ar-bar button{cursor:pointer}#ar-bar.mov{cursor:grabbing}'
    + '#ar-bar.vert{flex-direction:column;border-radius:26px;padding:14px 9px;gap:9px;width:64px;box-sizing:border-box}'
    + '#ar-bar.vert .nm{max-width:52px;white-space:normal;text-align:center;font-size:.64rem;line-height:1.15;overflow:hidden;max-height:3.5em}'
    + '#ar-bar.vert #ar-n{font-size:.66rem}#ar-bar.vert button.out{width:44px;padding:0;height:30px}'
    + '#ar-bar.mini{padding:5px;gap:0;border-radius:50%;width:46px;height:46px;justify-content:center;background:#16a34a}'
    + '#ar-bar.mini .nm,#ar-bar.mini #ar-n,#ar-bar.mini button,#ar-bar.mini .pt{display:none}#ar-bar.mini::after{content:"📞";font-size:1.2rem}'
    + '#ar-inv{position:fixed;right:16px;bottom:18px;z-index:99991;width:min(330px,calc(100vw - 32px));padding:14px;border-radius:18px;background:#fff;color:#0f172a;border:1px solid #e2e8f0;box-shadow:0 24px 50px -18px rgba(0,0,0,.5);font:600 .85rem/1.4 "Plus Jakarta Sans",system-ui,sans-serif;display:none}'
    + '#ar-inv.on{display:block;animation:arIn .3s ease}#ar-inv .f{display:flex;gap:8px;margin-top:10px}#ar-inv button{flex:1;border:0;border-radius:12px;padding:9px;font-weight:800;cursor:pointer;background:#0284c7;color:#fff}#ar-inv button.no{background:#e2e8f0;color:#334155}';
  document.head.appendChild(st);
  const bar = document.createElement('div'); bar.id = 'ar-bar';
  bar.innerHTML = '<i class="pt"></i><span class="nm" id="ar-nm"></span><span id="ar-n" style="opacity:.7"></span>'
    + '<button type="button" id="ar-mic" title="Micrófono">🎤</button><button type="button" id="ar-cam" title="Cámara">📷</button>'
    + '<button type="button" id="ar-win" title="Ir a la ventana de la llamada">🪟</button><button type="button" id="ar-rot" title="Girar la barra (horizontal / vertical)">⟳</button><button type="button" id="ar-min" title="Minimizar">–</button><button type="button" class="out" id="ar-out" title="Salir de la llamada">Salir</button>';
  document.body.appendChild(bar);
  const inv = document.createElement('div'); inv.id = 'ar-inv'; document.body.appendChild(inv);
  const q = (id) => document.getElementById(id);
  let ultimo = 0, est = null, tinv = null;
  const enviar = (m) => { try { bc.postMessage(m); } catch (_) {} };
  q('ar-mic').onclick = () => enviar({ cmd: 'mic' });
  q('ar-cam').onclick = () => enviar({ cmd: 'cam' });
  q('ar-out').onclick = () => enviar({ cmd: 'salir' });
  q('ar-win').onclick = () => { try { const w = window.open('', 'nika-ateneo-host'); if (w) w.focus(); } catch (_) {} };
  function pintar() {
    const vivo = est && est.conectado && Date.now() - ultimo < 20000;
    bar.classList.toggle('on', !!vivo);
    if (!vivo) return;
    q('ar-nm').textContent = est.nombre || 'Llamada';
    q('ar-n').textContent = '· ' + est.n + '/4';
    q('ar-mic').textContent = est.mic ? '🎤' : '🔇'; q('ar-mic').classList.toggle('off', !est.mic);
    q('ar-cam').classList.toggle('off', !est.cam);
  }
  bc.onmessage = (e) => {
    const m = e.data || {};
    if (m.estado) { est = m.estado; ultimo = Date.now(); pintar(); }
    if (m.invitacion) {
      const p = m.invitacion;
      inv.innerHTML = '<div><b>📹 ' + esc(p.deNombre || p.de) + '</b> te invita a una llamada de Ateneos</div><div class="f"><button type="button" id="ar-si">Unirme</button><button type="button" class="no" id="ar-no">Ahora no</button></div>';
      inv.classList.add('on'); clearTimeout(tinv); tinv = setTimeout(() => inv.classList.remove('on'), 90000);
      q('ar-no').onclick = () => inv.classList.remove('on');
      q('ar-si').onclick = () => { inv.classList.remove('on'); enviar({ cmd: 'unirse', sala: p.sala }); };
    }
  };
  setInterval(pintar, 2000);

  // ---- arrastrar, minimizar y recordar la posición ----
  const K_POS = 'nika_ar_pos', K_MIN = 'nika_ar_min';
  const ponerPos = (x, y) => { bar.style.left = x + 'px'; bar.style.top = y + 'px'; bar.style.bottom = 'auto'; bar.style.right = 'auto'; };
  const dentro = (x, y) => { const r = bar.getBoundingClientRect(); return [Math.min(Math.max(0, x), Math.max(0, innerWidth - r.width)), Math.min(Math.max(0, y), Math.max(0, innerHeight - r.height))]; };
  try { const p = JSON.parse(localStorage.getItem(K_POS) || 'null'); if (p) ponerPos(p.x, p.y); } catch (_) {}
  const minimizar = (v) => { bar.classList.toggle('mini', v); try { localStorage.setItem(K_MIN, v ? '1' : '0'); } catch (_) {} setTimeout(() => { const r = bar.getBoundingClientRect(); if (bar.style.left) { const q = dentro(r.left, r.top); ponerPos(q[0], q[1]); } }, 0); };
  try { if (localStorage.getItem(K_MIN) === '1') bar.classList.add('mini'); } catch (_) {}
  q('ar-min').onclick = (e) => { e.stopPropagation(); minimizar(true); };
  const K_VERT = 'nika_ar_vert';
  const girar = (v) => { bar.classList.toggle('vert', v); try { localStorage.setItem(K_VERT, v ? '1' : '0'); } catch (_) {} setTimeout(() => { const r = bar.getBoundingClientRect(); const p = dentro(r.left, r.top); ponerPos(p[0], p[1]); }, 0); };
  try { if (localStorage.getItem(K_VERT) === '1') bar.classList.add('vert'); } catch (_) {}
  q('ar-rot').onclick = (e) => { e.stopPropagation(); girar(!bar.classList.contains('vert')); };
  let arr = null, movido = false;
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = bar.getBoundingClientRect(); arr = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY }; movido = false;
    try { bar.setPointerCapture(e.pointerId); } catch (_) {}
  });
  bar.addEventListener('pointermove', (e) => {
    if (!arr) return;
    if (!movido && Math.abs(e.clientX - arr.x0) + Math.abs(e.clientY - arr.y0) < 5) return;
    movido = true; bar.classList.add('mov'); const p = dentro(e.clientX - arr.dx, e.clientY - arr.dy); ponerPos(p[0], p[1]);
  });
  const soltar = () => {
    if (!arr) return; const fueClic = !movido; arr = null; bar.classList.remove('mov');
    if (movido) { const r = bar.getBoundingClientRect(); try { localStorage.setItem(K_POS, JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) })); } catch (_) {} }
    else if (fueClic && bar.classList.contains('mini')) minimizar(false);   // un toque sobre la burbuja la expande
  };
  bar.addEventListener('pointerup', soltar); bar.addEventListener('pointercancel', soltar);
  bar.addEventListener('dblclick', (e) => { if (e.target.closest('button')) return; try { localStorage.removeItem(K_POS); } catch (_) {} bar.style.left = bar.style.top = bar.style.right = ''; bar.style.bottom = ''; });
  window.addEventListener('resize', () => { if (bar.style.left) { const r = bar.getBoundingClientRect(); const p = dentro(r.left, r.top); ponerPos(p[0], p[1]); } });
})();
