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
    + '#ar-inv{position:fixed;right:16px;bottom:18px;z-index:99991;width:min(330px,calc(100vw - 32px));padding:14px;border-radius:18px;background:#fff;color:#0f172a;border:1px solid #e2e8f0;box-shadow:0 24px 50px -18px rgba(0,0,0,.5);font:600 .85rem/1.4 "Plus Jakarta Sans",system-ui,sans-serif;display:none}'
    + '#ar-inv.on{display:block;animation:arIn .3s ease}#ar-inv .f{display:flex;gap:8px;margin-top:10px}#ar-inv button{flex:1;border:0;border-radius:12px;padding:9px;font-weight:800;cursor:pointer;background:#0284c7;color:#fff}#ar-inv button.no{background:#e2e8f0;color:#334155}';
  document.head.appendChild(st);
  const bar = document.createElement('div'); bar.id = 'ar-bar';
  bar.innerHTML = '<i class="pt"></i><span class="nm" id="ar-nm"></span><span id="ar-n" style="opacity:.7"></span>'
    + '<button type="button" id="ar-mic" title="Micrófono">🎤</button><button type="button" id="ar-cam" title="Cámara">📷</button>'
    + '<button type="button" id="ar-win" title="Ir a la ventana de la llamada">🪟</button><button type="button" class="out" id="ar-out" title="Salir de la llamada">Salir</button>';
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
    const vivo = est && est.conectado && Date.now() - ultimo < 6000;
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
})();
