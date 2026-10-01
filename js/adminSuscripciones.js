// js/adminSuscripciones.js
// CAMPUS NIKA — Panel de suscripciones NikaMed+ (admin-suscripciones.html).
//
// Acceso: solo role='admin'. La comprobación de esta página es de comodidad (redirige);
// la seguridad real está en la base: las policies RLS (profiles_select_admin, pagos_*_select_admin)
// y las funciones admin_extender_nikamed / admin_quitar_nikamed, que vuelven a validar is_admin().
// Todo texto que viene de la base se dibuja con textContent: nada de HTML crudo.
// Requiere 07_rango_nikamed_plus.sql y 08_admin_suscripciones.sql ejecutados.

(function () {
  'use strict';

  const PRECIOS = { mensual: 5000, semestral: 25000, anual: 45000 };
  const DIAS = { mensual: 30, semestral: 183, anual: 365 };
  const AVATAR = 'assets/N%20NIKA.png';
  const DIA_MS = 86400000;
  const POR_VENCER_DIAS = 7;
  const PAGINA = 40;

  let c = null;
  let perfiles = [];
  let pagos = [];
  const estado = { subsFiltro: 'todos', subsQ: '', usrQ: '', usrMax: PAGINA, pagosFiltro: 'aprobados' };
  const cargado = { pagos: false, reportes: false };

  const $ = (id) => document.getElementById(id);
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function toast(msg) {
    const t = $('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 3200);
  }
  window.showToast = toast; // moderacion.js avisa con esto
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const fmtFecha = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';
  const fmtMoney = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
  const nombreDe = (p) => (p && (p.fullname || p.username)) || 'Estudiante Nika';

  // ------------------------------------------------------------
  // Estado de suscripción de un perfil
  // ------------------------------------------------------------
  function suscripcion(p) {
    const premium = String(p.tipo_cuenta || '').toLowerCase() === 'premium';
    if (!premium) return { premium: false, clave: 'free' };
    const fin = p.fecha_fin_suscripcion ? new Date(p.fecha_fin_suscripcion) : null;
    if (!fin) return { premium: true, clave: 'activo', fin: null, dias: null };
    const dias = Math.ceil((fin.getTime() - Date.now()) / DIA_MS);
    if (dias < 0) return { premium: true, clave: 'vencido', fin, dias };
    if (dias <= POR_VENCER_DIAS) return { premium: true, clave: 'porvencer', fin, dias };
    return { premium: true, clave: 'activo', fin, dias };
  }

  // ------------------------------------------------------------
  // Carga de datos
  // ------------------------------------------------------------
  async function cargarPerfiles() {
    const { data, error } = await c.from('profiles')
      .select('id, username, fullname, avatar, role, tipo_cuenta, plan_activo, fecha_inicio_suscripcion, fecha_fin_suscripcion, created_at')
      .order('fullname', { ascending: true }).limit(3000);
    if (error) { console.error('[AdminSuscripciones] perfiles:', error); toast('No se pudieron leer los perfiles (¿corriste 07_rango_nikamed_plus.sql?).'); return; }
    perfiles = data || [];
  }

  async function cargarPagos() {
    const filas = [];
    const mp = await c.from('pagos_mercadopago').select('*').order('creado_en', { ascending: false }).limit(150);
    const idsMp = new Set();
    if (!mp.error) {
      (mp.data || []).forEach((r) => {
        if (r.mp_payment_id) idsMp.add(String(r.mp_payment_id));
        filas.push({
          fecha: r.procesado_en || r.creado_en, user_id: r.user_id, plan: r.plan,
          monto: Number(r.monto) || PRECIOS[r.plan] || 0, estado: String(r.estado || 'pending'), ref: r.mp_payment_id,
        });
      });
    } else console.warn('[AdminSuscripciones] pagos_mercadopago:', mp.error.message);

    const pp = await c.from('pagos_procesados').select('*').limit(150);
    if (!pp.error) {
      (pp.data || []).forEach((r) => {
        if (idsMp.has(String(r.payment_id))) return; // ya está en pagos_mercadopago
        filas.push({
          fecha: r.created_at || r.procesado_en || r.creado_en || r.fecha || null, user_id: r.user_id, plan: r.plan,
          monto: PRECIOS[r.plan] || 0, estado: 'approved', ref: r.payment_id,
        });
      });
    } else console.warn('[AdminSuscripciones] pagos_procesados:', pp.error.message);

    filas.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    pagos = filas;
    cargado.pagos = true;
  }

  async function contarReportes() {
    const { count, error } = await c.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open');
    const b = $('badge-reportes');
    if (error) { b.textContent = '–'; return null; }
    b.textContent = String(count || 0);
    b.classList.toggle('alerta', (count || 0) > 0);
    return count || 0;
  }

  // ------------------------------------------------------------
  // KPIs
  // ------------------------------------------------------------
  function pintarKpis(reportesAbiertos) {
    const subs = perfiles.map(suscripcion);
    const activos = subs.filter((s) => s.premium && s.clave !== 'vencido').length;
    const porVencer = subs.filter((s) => s.clave === 'porvencer').length;
    const vencidos = subs.filter((s) => s.clave === 'vencido').length;
    const mes = new Date(); const iniMes = new Date(mes.getFullYear(), mes.getMonth(), 1).getTime();
    const ingresos = pagos.filter((p) => p.estado === 'approved' && p.fecha && new Date(p.fecha).getTime() >= iniMes)
      .reduce((a, p) => a + p.monto, 0);

    const defs = [
      { cls: 'vip', t: 'NikaMed+ activos', v: activos, s: `${perfiles.length ? Math.round(activos * 100 / perfiles.length) : 0}% de los usuarios`, tile: 'tile-subs' },
      { cls: 'warn', t: 'Por vencer', v: porVencer, s: `en ${POR_VENCER_DIAS} días o menos`, tile: 'tile-subs', filtro: 'porvencer' },
      { cls: 'bad', t: 'Vencidos', v: vencidos, s: 'pendientes de baja', tile: 'tile-subs', filtro: 'vencidos' },
      { cls: 'ok', t: 'Ingresos del mes', v: cargado.pagos ? fmtMoney(ingresos) : '…', s: 'pagos aprobados', tile: 'tile-pagos' },
      { cls: '', t: 'Usuarios', v: perfiles.length, s: 'registrados', tile: 'tile-usuarios' },
      { cls: reportesAbiertos > 0 ? 'bad' : '', t: 'Reportes abiertos', v: reportesAbiertos == null ? '–' : reportesAbiertos, s: 'chat y foro', tile: 'tile-reportes' },
    ];
    const box = $('as-kpis'); box.textContent = '';
    defs.forEach((d, i) => {
      const b = el('button', 'as-kpi ' + d.cls); b.type = 'button'; b.style.animationDelay = (i * 0.05) + 's';
      b.append(el('span', null, d.t), el('b', null, String(d.v)), el('small', null, d.s));
      b.addEventListener('click', () => {
        if (d.filtro) setFiltroSubs(d.filtro);
        abrirTile(d.tile, true);
      });
      box.appendChild(b);
    });
    $('badge-subs').textContent = String(activos + vencidos);
    $('badge-usuarios').textContent = String(perfiles.length);
  }

  // ------------------------------------------------------------
  // Acciones manuales (RPC con validación is_admin en la base)
  // ------------------------------------------------------------
  async function accion(boton, fn, okMsg) {
    boton.disabled = true;
    const original = boton.textContent; boton.textContent = '…';
    try {
      const { error } = await fn();
      if (error) { toast('No se pudo: ' + error.message); return; }
      toast(okMsg);
      await recargar(false);
    } finally { boton.disabled = false; boton.textContent = original; }
  }

  function panelAcciones(p, s) {
    const acc = el('div', 'as-acc');
    const sel = el('select');
    [['mensual', 'Mensual · 30 días'], ['semestral', 'Semestral · 183 días'], ['anual', 'Anual · 365 días']].forEach(([k, t]) => {
      const o = el('option', null, t); o.value = k; sel.appendChild(o);
    });
    const bAct = el('button', 'as-btn chico primario', s.premium ? 'Extender' : 'Activar NikaMed+'); bAct.type = 'button';
    bAct.addEventListener('click', () => {
      const dias = DIAS[sel.value];
      if (!confirm(`¿${s.premium ? 'Extender' : 'Activar'} NikaMed+ a ${nombreDe(p)} por ${dias} días?`)) return;
      accion(bAct, () => c.rpc('admin_extender_nikamed', { p_user: p.id, p_dias: dias }), 'NikaMed+ actualizado ✨');
    });
    acc.append(sel, bAct);
    if (s.premium) {
      const bQ = el('button', 'as-btn chico peligro', 'Quitar NikaMed+'); bQ.type = 'button';
      bQ.addEventListener('click', () => {
        if (!confirm(`¿Quitar NikaMed+ a ${nombreDe(p)}? Vuelve a cuenta gratuita.`)) return;
        accion(bQ, () => c.rpc('admin_quitar_nikamed', { p_user: p.id }), 'NikaMed+ quitado');
      });
      acc.appendChild(bQ);
    }
    const dato = el('div', 'as-dato',
      s.premium ? `Plan ${p.plan_activo || '—'} · desde ${fmtFecha(p.fecha_inicio_suscripcion)} · hasta ${fmtFecha(p.fecha_fin_suscripcion)}`
                : `Cuenta gratuita · registrado el ${fmtFecha(p.created_at)}`);
    acc.appendChild(dato);
    return acc;
  }

  function filaPerfil(p, i, conBarra) {
    const s = suscripcion(p);
    const row = el('div', 'as-row' + (s.premium ? ' vip' : '')); row.style.animationDelay = Math.min(i, 12) * 0.03 + 's';
    const main = el('button', 'as-row-main'); main.type = 'button';
    const av = el('img', 'as-av'); av.src = p.avatar || AVATAR; av.alt = ''; av.loading = 'lazy';
    av.addEventListener('error', () => { av.src = AVATAR; }, { once: true });
    const who = el('div', 'as-who');
    who.append(el('b', null, nombreDe(p)), el('small', null, '@' + (p.username || '—') + (s.fin ? ' · vence ' + fmtFecha(s.fin) : '')));
    main.append(av, who);
    if (p.role === 'admin') main.appendChild(el('span', 'as-tag gris', 'Admin'));
    if (s.premium) {
      main.appendChild(el('span', 'as-tag vip', '✨ NikaMed+'));
      const txt = s.clave === 'vencido' ? 'Vencido' : s.clave === 'porvencer' ? `${Math.max(s.dias, 0)} d` : s.dias == null ? 'Sin vencimiento' : `${s.dias} días`;
      main.appendChild(el('span', 'as-tag ' + (s.clave === 'vencido' ? 'bad' : s.clave === 'porvencer' ? 'warn' : 'ok'), txt));
    } else main.appendChild(el('span', 'as-tag gris', 'Gratis'));
    row.appendChild(main);

    if (conBarra && s.premium && s.fin && p.fecha_inicio_suscripcion) {
      const total = new Date(s.fin) - new Date(p.fecha_inicio_suscripcion);
      const resto = Math.max(0, new Date(s.fin) - Date.now());
      const pct = total > 0 ? Math.min(100, Math.round(resto * 100 / total)) : 0;
      const barra = el('div', 'as-barra' + (s.clave === 'vencido' ? ' bad' : s.clave === 'porvencer' ? ' warn' : ''));
      const i2 = el('i'); i2.style.width = '0%'; barra.appendChild(i2); row.appendChild(barra);
      requestAnimationFrame(() => requestAnimationFrame(() => { i2.style.width = pct + '%'; }));
    }
    const acc = panelAcciones(p, s); row.appendChild(acc);
    main.addEventListener('click', () => row.classList.toggle('abierta'));
    return row;
  }

  // ------------------------------------------------------------
  // Mosaico: suscriptores
  // ------------------------------------------------------------
  function setFiltroSubs(f) {
    estado.subsFiltro = f;
    document.querySelectorAll('#subs-filtros .as-chip').forEach((b) => b.classList.toggle('on', b.dataset.f === f));
    pintarSubs();
  }
  function pintarSubs() {
    const lista = $('subs-lista'); lista.textContent = '';
    const q = norm(estado.subsQ);
    const filas = perfiles.map((p) => ({ p, s: suscripcion(p) })).filter(({ p, s }) => {
      if (!s.premium) return false;
      if (estado.subsFiltro === 'activos' && !(s.clave === 'activo' || s.clave === 'porvencer')) return false;
      if (estado.subsFiltro === 'porvencer' && s.clave !== 'porvencer') return false;
      if (estado.subsFiltro === 'vencidos' && s.clave !== 'vencido') return false;
      return !q || norm(nombreDe(p)).includes(q) || norm(p.username).includes(q);
    }).sort((a, b) => (a.s.fin ? a.s.fin.getTime() : Infinity) - (b.s.fin ? b.s.fin.getTime() : Infinity));
    if (!filas.length) { lista.appendChild(el('div', 'as-vacio', 'No hay suscriptores para este filtro.')); return; }
    filas.forEach(({ p }, i) => lista.appendChild(filaPerfil(p, i, true)));
  }

  // ------------------------------------------------------------
  // Mosaico: usuarios
  // ------------------------------------------------------------
  function pintarUsuarios() {
    const lista = $('usr-lista'); lista.textContent = '';
    const q = norm(estado.usrQ);
    const filas = perfiles.filter((p) => !q || norm(nombreDe(p)).includes(q) || norm(p.username).includes(q));
    if (!filas.length) { lista.appendChild(el('div', 'as-vacio', 'No se encontraron usuarios.')); return; }
    filas.slice(0, estado.usrMax).forEach((p, i) => lista.appendChild(filaPerfil(p, i, false)));
    if (filas.length > estado.usrMax) {
      const mas = el('button', 'as-btn as-mas', `Mostrar más (${filas.length - estado.usrMax} restantes)`); mas.type = 'button';
      mas.addEventListener('click', () => { estado.usrMax += PAGINA; pintarUsuarios(); });
      lista.appendChild(mas);
    }
  }

  // ------------------------------------------------------------
  // Mosaico: pagos
  // ------------------------------------------------------------
  function pintarPagos() {
    const lista = $('pagos-lista'); lista.textContent = '';
    const porId = new Map(perfiles.map((p) => [p.id, p]));
    const filas = pagos.filter((p) => estado.pagosFiltro === 'todos' || p.estado === 'approved').slice(0, 60);
    $('badge-pagos').textContent = String(pagos.filter((p) => p.estado === 'approved').length);
    if (!filas.length) { lista.appendChild(el('div', 'as-vacio', 'Todavía no hay pagos para mostrar.')); return; }
    filas.forEach((pg, i) => {
      const u = porId.get(pg.user_id);
      const row = el('div', 'as-pago'); row.style.animationDelay = Math.min(i, 12) * 0.03 + 's';
      const av = el('img', 'as-av'); av.src = (u && u.avatar) || AVATAR; av.alt = '';
      av.addEventListener('error', () => { av.src = AVATAR; }, { once: true });
      const who = el('div', 'as-who');
      who.append(el('b', null, nombreDe(u)), el('small', null, `${fmtFecha(pg.fecha)} · plan ${pg.plan || '—'}${pg.ref ? ' · #' + pg.ref : ''}`));
      const tag = el('span', 'as-tag ' + (pg.estado === 'approved' ? 'ok' : pg.estado === 'pending' ? 'warn' : 'bad'),
        pg.estado === 'approved' ? 'Aprobado' : pg.estado === 'pending' ? 'Pendiente' : pg.estado);
      row.append(av, who, el('span', 'monto', fmtMoney(pg.monto)), tag);
      lista.appendChild(row);
    });
  }

  // ------------------------------------------------------------
  // Mosaicos desplegables
  // ------------------------------------------------------------
  function skeleton(box) { box.textContent = ''; for (let i = 0; i < 3; i++) box.appendChild(el('div', 'as-sk')); }

  async function alAbrir(id) {
    if (id === 'tile-pagos' && !cargado.pagos) {
      skeleton($('pagos-lista')); await cargarPagos(); pintarPagos(); pintarKpis(await contarReportes());
    } else if (id === 'tile-pagos') pintarPagos();
    if (id === 'tile-reportes' && !cargado.reportes) {
      cargado.reportes = true;
      if (window.NikaModeracion) await window.NikaModeracion.renderAdminReportes('reportes-box');
      else $('reportes-box').textContent = 'No se pudo cargar el módulo de reportes.';
    }
  }
  function abrirTile(id, scroll) {
    const t = $(id); if (!t) return;
    if (!t.classList.contains('abierto')) {
      t.classList.add('abierto'); t.querySelector('.as-head').setAttribute('aria-expanded', 'true'); alAbrir(id);
    }
    if (scroll) setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }
  function conectarTiles() {
    document.querySelectorAll('.as-tile .as-head').forEach((h) => {
      h.addEventListener('click', () => {
        const t = h.closest('.as-tile');
        const abrir = !t.classList.contains('abierto');
        t.classList.toggle('abierto', abrir); h.setAttribute('aria-expanded', String(abrir));
        if (abrir) alAbrir(t.id);
      });
    });
    $('subs-filtros').addEventListener('click', (e) => { const b = e.target.closest('.as-chip'); if (b) setFiltroSubs(b.dataset.f); });
    $('pagos-filtros').addEventListener('click', (e) => {
      const b = e.target.closest('.as-chip'); if (!b) return;
      estado.pagosFiltro = b.dataset.f;
      document.querySelectorAll('#pagos-filtros .as-chip').forEach((x) => x.classList.toggle('on', x === b));
      pintarPagos();
    });
    let t1, t2;
    $('subs-q').addEventListener('input', (e) => { clearTimeout(t1); t1 = setTimeout(() => { estado.subsQ = e.target.value; pintarSubs(); }, 120); });
    $('usr-q').addEventListener('input', (e) => { clearTimeout(t2); t2 = setTimeout(() => { estado.usrQ = e.target.value; estado.usrMax = PAGINA; pintarUsuarios(); }, 120); });
    $('as-refrescar').addEventListener('click', () => recargar(true));
  }

  async function recargar(avisar) {
    const b = $('as-refrescar'); b.firstChild.nodeValue = '⏳ ';
    await cargarPerfiles();
    if (cargado.pagos) await cargarPagos();
    const rep = await contarReportes();
    pintarKpis(rep); pintarSubs(); pintarUsuarios(); if (cargado.pagos) pintarPagos();
    b.firstChild.nodeValue = '🔄 ';
    if (avisar) toast('Datos actualizados');
  }

  // ------------------------------------------------------------
  // Arranque: solo admin
  // ------------------------------------------------------------
  async function iniciar() {
    try {
      if (!window.NikaSupabase) throw new Error('sin cliente');
      c = await window.NikaSupabase.ready;
      const { data: { session } } = await c.auth.getSession();
      if (!session) { location.replace('index.html'); return; }
      const { data: yo } = await c.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (!yo || yo.role !== 'admin') { location.replace('campus.html'); return; }
    } catch (e) {
      console.error('[AdminSuscripciones] acceso:', e);
      location.replace('campus.html'); return;
    }
    document.body.classList.remove('as-verificando');
    skeleton($('subs-lista')); skeleton($('usr-lista'));
    conectarTiles();
    await cargarPerfiles();
    pintarKpis(null); pintarSubs(); pintarUsuarios();
    const rep = await contarReportes(); pintarKpis(rep);
  }
  iniciar();
})();
