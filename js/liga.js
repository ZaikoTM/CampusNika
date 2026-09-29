// js/liga.js
// CAMPUS NIKA — Liga Pomodoro (ranking de estudio con rangos médicos argentinos)
//
// Datos: RPC liga_pomodoro(p_desde) y liga_pomodoro_detalle(p_user, p_desde)
// (ver sql/liga_pomodoro.sql: study_sessions tiene RLS "solo lo mío", por eso el
// ranking entre usuarios pasa por funciones SECURITY DEFINER que solo devuelven
// agregados y sesiones completadas).
//
// Rango = horas de estudio HISTÓRICAS acumuladas (no cambia al cambiar de pestaña):
//   Ciclo Clínico        < 10 h
//   Practicante PFO      10 h – 39 h
//   Residente R1         40 h – 99 h
//   Residente Superior   100 h – 249 h   (R3/R4)
//   Jefe de Residentes   250 h o más

const NikaLiga = (() => {
  const TZ = 'America/Argentina/Buenos_Aires';
  const RANGOS = [
    { nivel: 5, min: 250 * 60, nombre: 'Jefe de Residentes', icono: '👑', clase: 'lg-rango-elite' },
    { nivel: 4, min: 100 * 60, nombre: 'Residente Superior (R3/R4)', icono: '🩺', clase: 'lg-rango-4' },
    { nivel: 3, min: 40 * 60, nombre: 'Residente R1', icono: '🥼', clase: 'lg-rango-3' },
    { nivel: 2, min: 10 * 60, nombre: 'Practicante PFO', icono: '📋', clase: 'lg-rango-2' },
    { nivel: 1, min: 0, nombre: 'Ciclo Clínico', icono: '📚', clase: 'lg-rango-1' },
  ];
  const PERIODOS = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Esta semana' },
    { id: 'mes', label: 'Este mes' },
    { id: 'global', label: 'Histórico global' },
  ];

  let periodo = 'semana';
  let filas = [];
  let yo = null; // id del usuario autenticado
  let cargaId = 0;

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const client = () => (window.NikaSupabase && (window.NikaSupabase.client || window.NikaSupabase.supabase)) || window.supabaseClient || null;

  function rangoDe(minutosTotal) {
    return RANGOS.find((r) => minutosTotal >= r.min) || RANGOS[RANGOS.length - 1];
  }
  // Prefiere el nivel calculado por la función SQL (misma jerarquía); si no viene, lo calcula por minutos.
  function rangoDeFila(f) {
    return (f && f.nivel_rango && RANGOS.find((r) => r.nivel === f.nivel_rango)) || rangoDe(f ? f.minutos_total : 0);
  }

  // Inicio del período en hora de Argentina (UTC-3 fijo, sin DST). null = histórico.
  function desdeDe(id) {
    if (id === 'global') return null;
    const partes = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
    let [y, m, d] = partes;
    if (id === 'semana') {
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
      d -= (dow + 6) % 7; // lunes
    } else if (id === 'mes') {
      d = 1;
    }
    return new Date(Date.UTC(y, m - 1, d, 3, 0, 0)).toISOString(); // 00:00 ART = 03:00 UTC
  }

  const fmtMin = (m) => { m = Math.round(m || 0); const h = Math.floor(m / 60); return h > 0 ? `${h} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`; };
  const nombreModulo = (m) => (window.NikaRendimiento ? window.NikaRendimiento.labelModulo(m) : (m || 'Sin área'));
  const nombreUp = (u) => (window.NikaRendimiento ? (window.NikaRendimiento.normUp(u) || u || '—') : (u || '—'));

  // ---------- Vista ----------
  function raiz() { return document.getElementById('liga-section'); }

  function abrir() {
    const sec = raiz();
    if (!sec) return;
    ['dashboard-hero-section', 'modulos-section', 'admin-dashboard-section', 'foro-section', 'ateneos-section'].forEach((id) => {
      const el = document.getElementById(id); if (el) el.style.display = 'none';
    });
    sec.style.display = '';   // lo manda el CSS de la página (grid en liga.html)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth <= 900 && typeof window.toggleSidebar === 'function' && document.getElementById('appSidebar')?.classList.contains('sidebar-open')) window.toggleSidebar();
    pintarTabs();
    cargar();
  }

  function volver() {
    // Ya no viven dentro del campus: cada una es su propia página
    window.location.href = 'campus.html';
  }

  function pintarTabs() {
    const cont = document.getElementById('liga-tabs');
    if (!cont) return;
    cont.innerHTML = PERIODOS.map((p) =>
      `<button type="button" class="lg-tab ${p.id === periodo ? 'active' : ''}" onclick="NikaLiga.cambiarPeriodo('${p.id}')">${p.label}</button>`).join('');
  }

  function cambiarPeriodo(id) {
    if (id === periodo) return;
    periodo = id;
    pintarTabs();
    cargar();
  }

  async function cargar() {
    const lista = document.getElementById('liga-lista');
    const podio = document.getElementById('liga-podio');
    const barra = document.getElementById('liga-barra-pos');
    if (!lista) return;
    const mi = ++cargaId;
    lista.innerHTML = '<div class="lg-vacio">Cargando la liga...</div>';
    podio.innerHTML = '';
    barra.style.display = 'none';

    const c = client();
    if (!c) { lista.innerHTML = '<div class="lg-vacio">No hay conexión con el servidor.</div>'; return; }
    try {
      const { data: { user } } = await c.auth.getUser();
      yo = user ? user.id : null;
      const { data, error } = await c.rpc('liga_pomodoro', { p_desde: desdeDe(periodo) });
      if (mi !== cargaId) return; // llegó una respuesta vieja
      if (error) throw error;
      filas = data || [];
      pintar();
    } catch (err) {
      if (mi !== cargaId) return;
      console.warn('[Liga] No se pudo cargar:', err);
      const falta = /function|does not exist|schema cache/i.test((err && err.message) || '');
      lista.innerHTML = `<div class="lg-vacio">${falta ? 'Falta instalar la función <code>liga_pomodoro</code> en Supabase (ver sql/liga_pomodoro.sql).' : 'No se pudo cargar la liga. Probá de nuevo en unos segundos.'}</div>`;
    }
  }

  function avatar(f) { return esc(f.avatar || 'assets/N%20NIKA.png'); }

  function pintar() {
    const lista = document.getElementById('liga-lista');
    const podio = document.getElementById('liga-podio');
    if (!filas.length) {
      podio.innerHTML = '';
      lista.innerHTML = '<div class="lg-vacio">Todavía nadie completó un Pomodoro en este período. ¡Sé el primero en la liga!</div>';
      pintarBarra();
      return;
    }

    // Podio: 2° · 1° · 3° (el 1° al centro y más alto)
    const orden = [1, 0, 2].filter((i) => filas[i]);
    const medallas = ['oro', 'plata', 'bronce'];
    const icono = ['🥇', '🥈', '🥉'];
    podio.innerHTML = orden.map((i) => {
      const f = filas[i], r = rangoDeFila(f);
      return `<div class="lg-podio-item lg-${medallas[i]}" onclick="NikaLiga.verPerfil('${f.user_id}')" title="Ver perfil">
        <span class="lg-podio-medalla">${icono[i]}</span>
        <img src="${avatar(f)}" alt="" class="lg-podio-avatar">
        <strong class="lg-podio-nombre">${esc(f.fullname)}</strong>
        <span class="lg-rango ${r.clase}">${r.icono} ${esc(r.nombre)}</span>
        <span class="lg-podio-min">${fmtMin(f.minutos_periodo)}</span>
        <div class="lg-podio-base">${i + 1}°</div>
      </div>`;
    }).join('');

    lista.innerHTML = filas.map((f, i) => {
      const r = rangoDeFila(f);
      const soyYo = f.user_id === yo;
      const pos = i + 1;
      return `<div class="lg-fila ${soyYo ? 'es-yo' : ''} ${pos <= 3 ? 'top-' + pos : ''}" id="lg-fila-${f.user_id}">
        <div class="lg-fila-main">
          <span class="lg-pos">${pos <= 3 ? ['🥇', '🥈', '🥉'][i] : pos}</span>
          <img src="${avatar(f)}" alt="" class="lg-avatar">
          <div class="lg-info">
            <strong class="lg-nombre">${esc(f.fullname)}${soyYo ? ' <em>(vos)</em>' : ''}</strong>
            <span class="lg-rango ${r.clase}">${r.icono} ${esc(r.nombre)}</span>
          </div>
          <div class="lg-num"><strong>${fmtMin(f.minutos_periodo)}</strong><span>${f.sesiones_periodo} ${f.sesiones_periodo === 1 ? 'sesión' : 'sesiones'}</span></div>
          <div class="lg-acciones">
            <button type="button" class="lg-btn" onclick="NikaLiga.verPerfil('${f.user_id}')">👤 Perfil</button>
            <button type="button" class="lg-btn lg-btn-detalle" aria-expanded="false" onclick="NikaLiga.alternarDetalle('${f.user_id}', this)">▼ Detalle</button>
          </div>
        </div>
        <div class="lg-detalle" id="lg-detalle-${f.user_id}" style="display:none;"></div>
      </div>`;
    }).join('');
    pintarBarra();
  }

  function pintarBarra() {
    const barra = document.getElementById('liga-barra-pos');
    if (!barra) return;
    const label = PERIODOS.find((p) => p.id === periodo).label.toLowerCase();
    if (!yo) { barra.style.display = 'none'; return; }
    const idx = filas.findIndex((f) => f.user_id === yo);
    barra.style.display = 'flex';
    if (idx === -1) {
      barra.innerHTML = `<div class="lg-barra-txt"><strong>Todavía no estás en la liga (${label})</strong><span>Completá un Pomodoro para entrar al ranking.</span></div>`;
      return;
    }
    const f = filas[idx];
    let falta;
    if (idx === 0) falta = '¡Sos el número 1! 🏆';
    else {
      const dif = filas[idx - 1].minutos_periodo - f.minutos_periodo;
      falta = `Te faltan <strong>${fmtMin(dif + 1)}</strong> para el puesto ${idx}°`;
    }
    barra.innerHTML = `
      <div class="lg-barra-num">#${idx + 1}</div>
      <div class="lg-barra-txt"><strong>Tu posición (${label}): ${fmtMin(f.minutos_periodo)} · ${f.sesiones_periodo} ${f.sesiones_periodo === 1 ? 'sesión' : 'sesiones'}</strong><span>${falta}</span></div>
      <button type="button" class="lg-btn" onclick="NikaLiga.irAMiFila()">Ver mi fila ↑</button>`;
  }

  function irAMiFila() {
    const el = document.getElementById('lg-fila-' + yo);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('lg-flash'); setTimeout(() => el.classList.remove('lg-flash'), 1400); }
  }

  async function alternarDetalle(userId, btn) {
    const box = document.getElementById('lg-detalle-' + userId);
    if (!box) return;
    const abierto = box.style.display !== 'none';
    if (abierto) { box.style.display = 'none'; btn.setAttribute('aria-expanded', 'false'); btn.textContent = '▼ Detalle'; return; }
    box.style.display = 'block';
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = '▲ Ocultar';
    if (box.dataset.periodo === periodo && box.dataset.cargado === '1') return;
    box.innerHTML = '<div class="lg-vacio">Cargando sesiones...</div>';
    try {
      const { data, error } = await client().rpc('liga_pomodoro_detalle', { p_user: userId, p_desde: desdeDe(periodo) });
      if (error) throw error;
      const ses = data || [];
      if (!ses.length) { box.innerHTML = '<div class="lg-vacio">Sin sesiones en este período.</div>'; return; }
      const total = ses.reduce((a, s) => a + (Number(s.duration_minutes) || 0), 0);
      box.innerHTML = `
        <div class="lg-tabla-wrap"><table class="lg-tabla">
          <thead><tr><th>Materia</th><th>UP</th><th>Duración</th><th>Fecha</th></tr></thead>
          <tbody>${ses.map((s) => `<tr>
            <td>${esc(nombreModulo(s.modulo))}</td><td>${esc(nombreUp(s.up_id))}</td>
            <td>${fmtMin(s.duration_minutes)}</td>
            <td>${new Date(s.completed_at).toLocaleString('es-AR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>`).join('')}
          </tbody>
          <tfoot><tr><td colspan="2">Total auditado (${ses.length}${ses.length >= 300 ? '+' : ''} sesiones)</td><td colspan="2"><strong>${fmtMin(total)}</strong></td></tr></tfoot>
        </table></div>`;
      box.dataset.cargado = '1';
      box.dataset.periodo = periodo;
    } catch (err) {
      console.warn('[Liga] Detalle:', err);
      box.innerHTML = '<div class="lg-vacio">No se pudo cargar el detalle.</div>';
    }
  }

  function verPerfil(userId) {
    if (typeof window.abrirPerfilPublico === 'function') window.abrirPerfilPublico(userId);
  }

  return { abrir, volver, cambiarPeriodo, alternarDetalle, verPerfil, irAMiFila, rangoDe, RANGOS, fmtMin };
})();

window.NikaLiga = NikaLiga;
