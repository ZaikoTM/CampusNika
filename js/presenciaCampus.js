// js/presenciaCampus.js
// CAMPUS NIKA — "Última vez activo" y "usuarios en línea (últimos 5 min)".
// Latido a Supabase (RPC nika_heartbeat) mientras la pestaña está visible. Si todavía no corriste
// sql/presencia_ultima_vez.sql, todo falla en silencio y la interfaz sigue funcionando sin estos datos.

const NikaPresencia = (() => {
  const LATIDO_MS = 60 * 1000;
  const ONLINE_MS = 3 * 60 * 1000;          // "en línea" = activo en los últimos 3 min
  let timer = null, disponible = true;

  const cliente = () => (window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase)) || window.supabaseClient || null;
  const hayUsuario = () => { try { return !!JSON.parse(localStorage.getItem('nika_currentUser') || 'null'); } catch (_) { return false; } };

  async function rpc(nombre, args) {
    const c = cliente();
    if (!c || !disponible || !hayUsuario()) return { data: null, error: { message: 'no disponible' } };
    try {
      const r = await c.rpc(nombre, args || {});
      if (r.error && /function|does not exist|schema cache/i.test(r.error.message || '')) {
        disponible = false;
        console.warn('[Presencia] Falta correr sql/presencia_ultima_vez.sql en Supabase:', r.error.message);
      }
      return r;
    } catch (e) { return { data: null, error: e }; }
  }

  function latido() { if (!document.hidden) rpc('nika_heartbeat'); }
  function iniciar() {
    if (timer) return;
    setTimeout(latido, 1500);
    timer = setInterval(latido, LATIDO_MS);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) latido(); });
  }

  // "activo hace 5 min", "activo hace 2 h", "activo ayer"…
  function haceTiempo(ts) {
    if (!ts) return 'sin actividad reciente';
    const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 90) return 'activo ahora';
    const m = Math.floor(s / 60);
    if (m < 60) return `activo hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `activo hace ${h} h`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'activo ayer' : d < 30 ? `activo hace ${d} días` : 'activo hace más de un mes';
  }
  const estaEnLinea = (ts) => !!ts && (Date.now() - new Date(ts).getTime()) < ONLINE_MS;

  // { [userId]: ISO } de mis amigos
  async function ultimaVezAmigos() {
    const r = await rpc('nika_ultima_vez_amigos');
    const mapa = {};
    (r.data || []).forEach((x) => { mapa[x.id] = x.last_seen_at; });
    return mapa;
  }
  async function conteoEnLinea(min = 5) { const r = await rpc('nika_conteo_en_linea', { p_minutos: min }); return typeof r.data === 'number' ? r.data : null; }
  async function usuariosEnLinea(min = 5, limite = 40) { const r = await rpc('nika_usuarios_en_linea', { p_minutos: min, p_limite: limite }); return r.data || []; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  return { iniciar, haceTiempo, estaEnLinea, ultimaVezAmigos, conteoEnLinea, usuariosEnLinea, get disponible() { return disponible; } };
})();
window.NikaPresencia = NikaPresencia;
