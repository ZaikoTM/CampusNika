/* CAMPUS NIKA · métricas de uso (anónimas, sin textos ni datos personales).
   Registra qué sección se abre, desde qué tipo de dispositivo y los errores de JavaScript, para el panel de admin.
   Si la tabla no existe o no hay sesión, no hace nada y no molesta. Máximo ~1 evento por sección cada 30 min. */
(function () {
  'use strict';
  if (window.NikaMetricas) return;
  const dispositivo = (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || innerWidth < 760) ? 'movil' : 'escritorio';
  let cliente = null, userId = null, apagado = false, errores = 0;

  const seccion = () => (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') + (new URLSearchParams(location.search).get('modulo') || new URLSearchParams(location.search).get('m') ? ':' + (new URLSearchParams(location.search).get('modulo') || new URLSearchParams(location.search).get('m')) : '');

  async function listo() {
    if (cliente) return true;
    try {
      const ns = window.NikaSupabase; if (!ns) return false;
      if (ns.ready) await ns.ready;
      cliente = ns.client || null; if (!cliente) return false;
      const { data } = await cliente.auth.getSession();
      userId = data && data.session && data.session.user ? data.session.user.id : null;
    } catch (_) { return false; }
    return !!userId;
  }

  async function evento(sec, accion, extra) {
    if (apagado) return;
    try {
      if (!(await listo())) return;
      const { error } = await cliente.from('eventos_uso').insert({ user_id: userId, seccion: String(sec).slice(0, 60), accion: String(accion || 'vista').slice(0, 30), extra: extra || {}, dispositivo });
      if (error && /relation|does not exist|42P01|PGRST205/i.test(error.message + error.code)) apagado = true;
    } catch (_) { apagado = true; }
  }

  function vista() {
    const s = seccion(), k = 'nk_mt_' + s;
    try { const t = +sessionStorage.getItem(k) || 0; if (Date.now() - t < 30 * 60 * 1000) return; sessionStorage.setItem(k, String(Date.now())); } catch (_) {}
    evento(s, 'vista');
  }

  window.addEventListener('error', (e) => {
    if (!e || !e.filename || /^script error\.?$/i.test(String(e.message || ''))) return;  // 'Script error.' sin archivo viene de scripts de terceros y no se puede corregir
    if (errores >= 3) return; errores++;
    evento(seccion(), 'error', { msg: String((e && e.message) || '').slice(0, 140), src: String((e && e.filename) || '').split('/').pop().slice(0, 50) });
  });

  window.NikaMetricas = { evento };
  const ini = () => setTimeout(vista, 1800);
  if (document.readyState === 'complete') ini(); else window.addEventListener('load', ini);
})();
