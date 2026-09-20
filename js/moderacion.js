// js/moderacion.js
// CAMPUS NIKA — Moderación de la comunidad + métricas reales del panel de admin.
//
//  - Reportar mensajes del chat global, hilos y respuestas del foro (tabla `reports`).
//  - Bloquear usuarios (tabla `user_blocks`): sus mensajes dejan de mostrarse.
//  - Panel de admin: cola de reportes (descartar / eliminar contenido / suspender usuario)
//    y estadísticas reales (RPC admin_stats y admin_up_stats).
//
// Requiere: window.NikaSupabase.client, window.NikaAuth y sql/01_seguridad_fase1.sql ejecutado.
// Todo lo que viene de usuarios se dibuja con textContent o se escapa: nada de HTML crudo.

(function () {
  'use strict';

  // ---------- Escape HTML global (lo usa campus.html en sus plantillas) ----------
  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  window.nikaEsc = esc;

  const MOTIVOS = [
    ['spam', 'Spam o publicidad'],
    ['acoso', 'Acoso o intimidación'],
    ['ofensivo', 'Lenguaje ofensivo o discriminatorio'],
    ['contenido_inapropiado', 'Contenido inapropiado'],
    ['datos_personales', 'Publica datos personales'],
    ['otro', 'Otro motivo'],
  ];
  const MOTIVO_TXT = Object.fromEntries(MOTIVOS);
  const TIPO_TXT = {
    chat: 'Chat global', forum_thread: 'Hilo del foro', forum_reply: 'Respuesta del foro',
    private_message: 'Mensaje privado', user: 'Usuario',
  };
  const TABLA_POR_TIPO = { chat: 'global_chat', forum_thread: 'forum_threads', forum_reply: 'forum_replies' };

  let bloqueados = new Set();

  function client() { return window.NikaSupabase && window.NikaSupabase.client; }

  async function miId() {
    if (window.NikaAuth && window.NikaAuth.ready) return await window.NikaAuth.ready;
    const c = client();
    if (!c) return null;
    const { data: { user } } = await c.auth.getUser();
    return user ? user.id : null;
  }

  function aviso(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else alert(msg);
  }

  function el(tag, props, children) {
    const n = document.createElement(tag);
    if (props) Object.entries(props).forEach(([k, v]) => {
      if (k === 'style') n.style.cssText = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v);
    });
    (children || []).forEach((c) => n.appendChild(c));
    return n;
  }

  // ------------------------------------------------------------
  // Bloqueados
  // ------------------------------------------------------------
  async function cargarBloqueados() {
    try {
      const c = client();
      const id = await miId();
      if (!c || !id) return;
      const { data, error } = await c.from('user_blocks').select('blocked_id');
      if (!error) bloqueados = new Set((data || []).map((r) => r.blocked_id));
    } catch (_) { /* si falla, no se filtra nada */ }
  }

  function estaBloqueado(userId) { return !!userId && bloqueados.has(userId); }
  function esMio(userId) { return !!userId && !!(window.NikaAuth && window.NikaAuth.userId === userId); }

  async function bloquear(userId) {
    const c = client();
    if (!c || !userId) return false;
    const { error } = await c.from('user_blocks').insert({ blocked_id: userId });
    if (error && error.code !== '23505') { aviso('No se pudo bloquear al usuario.'); return false; }
    bloqueados.add(userId);
    return true;
  }

  async function desbloquear(userId) {
    const c = client();
    if (!c || !userId) return false;
    const id = await miId();
    const { error } = await c.from('user_blocks').delete().eq('blocker_id', id).eq('blocked_id', userId);
    if (error) { aviso('No se pudo desbloquear.'); return false; }
    bloqueados.delete(userId);
    return true;
  }

  // ------------------------------------------------------------
  // Modal genérico
  // ------------------------------------------------------------
  function abrirModal(titulo, contenido) {
    const previo = document.getElementById('nika-mod-overlay');
    if (previo) previo.remove();
    const overlay = el('div', {
      id: 'nika-mod-overlay',
      style: 'position:fixed;inset:0;background:rgba(2,6,23,.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;',
    });
    const box = el('div', {
      style: 'background:var(--card-bg,#fff);color:var(--text-main,#0f172a);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:20px;width:100%;max-width:420px;max-height:85vh;overflow:auto;font-family:inherit;',
    });
    box.appendChild(el('h3', { text: titulo, style: 'margin:0 0 12px;font-size:1.05rem;font-weight:800;' }));
    box.appendChild(contenido);
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    return overlay;
  }

  const ESTILO_CAMPO = 'width:100%;box-sizing:border-box;padding:9px 10px;border-radius:8px;border:1px solid var(--border,#cbd5e1);background:var(--bg-body,#f8fafc);color:inherit;font:inherit;font-size:.85rem;margin-bottom:10px;';
  const ESTILO_BTN = 'padding:8px 14px;border-radius:8px;border:none;font-weight:700;cursor:pointer;font-size:.82rem;';

  // ------------------------------------------------------------
  // Reportar
  // ------------------------------------------------------------
  function reportar(opts) {
    // opts: { tipo, id, userId, nombre, texto, elemento }
    const cont = el('div');
    cont.appendChild(el('p', {
      text: 'Tu reporte llega al equipo de moderación. Es confidencial: la otra persona no ve quién reportó.',
      style: 'font-size:.8rem;color:var(--text-muted,#64748b);margin:0 0 12px;',
    }));
    const sel = el('select', { style: ESTILO_CAMPO });
    MOTIVOS.forEach(([v, t]) => sel.appendChild(el('option', { value: v, text: t })));
    const det = el('textarea', { rows: '3', maxlength: '500', placeholder: 'Detalles (opcional)', style: ESTILO_CAMPO + 'resize:vertical;' });
    cont.appendChild(sel);
    cont.appendChild(det);

    let chk = null;
    if (opts.userId) {
      const lab = el('label', { style: 'display:flex;gap:8px;align-items:center;font-size:.82rem;margin-bottom:14px;cursor:pointer;' });
      chk = el('input', { type: 'checkbox' });
      lab.appendChild(chk);
      lab.appendChild(el('span', { text: 'Bloquear también a ' + (opts.nombre || 'este usuario') + ' (no vas a ver sus mensajes)' }));
      cont.appendChild(lab);
    }

    const fila = el('div', { style: 'display:flex;gap:8px;justify-content:flex-end;' });
    const cancelar = el('button', { type: 'button', text: 'Cancelar', style: ESTILO_BTN + 'background:transparent;color:inherit;border:1px solid var(--border,#cbd5e1);' });
    const enviar = el('button', { type: 'button', text: 'Enviar reporte', style: ESTILO_BTN + 'background:#dc2626;color:#fff;' });
    fila.appendChild(cancelar);
    fila.appendChild(enviar);
    cont.appendChild(fila);

    const overlay = abrirModal('🚩 Reportar contenido', cont);
    cancelar.addEventListener('click', () => overlay.remove());

    enviar.addEventListener('click', async () => {
      enviar.disabled = true;
      const c = client();
      const fila = {
        target_type: opts.tipo,
        target_id: String(opts.id),
        target_user_id: opts.userId || null,
        reason: sel.value,
        details: det.value.trim() || null,
        snapshot: String(opts.texto || '').slice(0, 1000) || null,
      };
      const { error } = await c.from('reports').insert(fila);
      if (error && error.code === '23505') aviso('Ya habías reportado este contenido.');
      else if (error) { aviso('No se pudo enviar el reporte. Probá de nuevo.'); enviar.disabled = false; return; }
      else aviso('Gracias. Recibimos tu reporte.');

      if (chk && chk.checked) {
        const ok = await bloquear(opts.userId);
        if (ok && opts.elemento) opts.elemento.remove();
      }
      overlay.remove();
    });
  }

  // Botones 🚩 (delegación de eventos): <button data-nika-report data-tipo data-id data-uid data-nombre data-texto>
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-nika-report]');
    if (!b) return;
    e.preventDefault();
    reportar({
      tipo: b.dataset.tipo,
      id: b.dataset.id,
      userId: b.dataset.uid || null,
      nombre: b.dataset.nombre || '',
      texto: b.dataset.texto || '',
      elemento: b.closest('[data-nika-item]'),
    });
  });

  // HTML del botón 🚩 (todo escapado). Devuelve '' si es contenido propio.
  function botonReporte(tipo, id, userId, nombre, texto) {
    if (esMio(userId)) return '';
    return '<button type="button" data-nika-report title="Reportar" '
      + 'data-tipo="' + esc(tipo) + '" data-id="' + esc(id) + '" data-uid="' + esc(userId) + '" '
      + 'data-nombre="' + esc(nombre) + '" data-texto="' + esc(String(texto || '').slice(0, 1000)) + '" '
      + 'style="background:none;border:none;cursor:pointer;font-size:.8rem;opacity:.55;padding:0 4px;">🚩</button>';
  }

  // ------------------------------------------------------------
  // Lista de bloqueados (para poder desbloquear)
  // ------------------------------------------------------------
  async function abrirBloqueados() {
    const c = client();
    const cont = el('div');
    const cuerpo = el('div', { text: 'Cargando…', style: 'font-size:.85rem;color:var(--text-muted,#64748b);' });
    cont.appendChild(cuerpo);
    const overlay = abrirModal('🚫 Usuarios bloqueados', cont);
    cont.appendChild(el('button', {
      type: 'button', text: 'Cerrar',
      style: ESTILO_BTN + 'margin-top:12px;background:transparent;color:inherit;border:1px solid var(--border,#cbd5e1);',
    })).addEventListener('click', () => overlay.remove());

    await cargarBloqueados();
    const ids = Array.from(bloqueados);
    cuerpo.textContent = '';
    if (!ids.length) { cuerpo.textContent = 'No bloqueaste a nadie.'; return; }

    const { data } = await c.from('profiles').select('id, username, fullname').in('id', ids);
    const porId = Object.fromEntries((data || []).map((p) => [p.id, p]));
    ids.forEach((id) => {
      const p = porId[id] || {};
      const fila = el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border,#e2e8f0);' });
      fila.appendChild(el('span', { text: (p.fullname || 'Estudiante Nika') + (p.username ? ' (@' + p.username + ')' : ''), style: 'font-size:.85rem;' }));
      const btn = el('button', { type: 'button', text: 'Desbloquear', style: ESTILO_BTN + 'background:var(--nika-primary,#0284c7);color:#fff;padding:5px 10px;' });
      btn.addEventListener('click', async () => { if (await desbloquear(id)) fila.remove(); });
      fila.appendChild(btn);
      cuerpo.appendChild(fila);
    });
  }

  // ------------------------------------------------------------
  // PANEL ADMIN
  // ------------------------------------------------------------
  function setTxt(id, valor) { const n = document.getElementById(id); if (n) n.textContent = valor; }

  async function renderAdminReportes(containerId) {
    const box = document.getElementById(containerId);
    const c = client();
    if (!box || !c) return;
    box.textContent = 'Cargando reportes…';

    const { data, error } = await c.from('reports').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) { box.textContent = 'No se pudieron cargar los reportes.'; return; }

    const abiertos = (data || []).filter((r) => r.status === 'open');
    box.textContent = '';
    if (!abiertos.length) {
      box.appendChild(el('p', { text: 'No hay reportes pendientes. 🎉', style: 'text-align:center;color:var(--text-muted);padding:16px;' }));
      return;
    }

    // Nombres de los autores reportados
    const ids = Array.from(new Set(abiertos.map((r) => r.target_user_id).filter(Boolean)));
    let nombres = {};
    if (ids.length) {
      const { data: ps } = await c.from('profiles').select('id, username, fullname').in('id', ids);
      nombres = Object.fromEntries((ps || []).map((p) => [p.id, (p.fullname || 'Estudiante Nika') + (p.username ? ' (@' + p.username + ')' : '')]));
    }

    const yo = await miId();
    async function cerrar(r, estado, nodo) {
      const { error: e2 } = await c.from('reports').update({ status: estado, resolved_by: yo, resolved_at: new Date().toISOString() }).eq('id', r.id);
      if (e2) { aviso('No se pudo actualizar el reporte.'); return false; }
      nodo.remove();
      return true;
    }

    abiertos.forEach((r) => {
      const item = el('div', { class: 'admin-list-item' });
      const meta = el('div', { class: 'errata-meta' });
      meta.appendChild(el('span', { text: '🚩 ' + (MOTIVO_TXT[r.reason] || r.reason) + ' · ' + (TIPO_TXT[r.target_type] || r.target_type) }));
      meta.appendChild(el('span', { text: new Date(r.created_at).toLocaleDateString('es-AR') }));
      item.appendChild(meta);
      if (r.target_user_id) item.appendChild(el('div', { text: 'Autor: ' + (nombres[r.target_user_id] || r.target_user_id), style: 'font-size:.78rem;font-weight:700;margin:4px 0;' }));
      if (r.snapshot) item.appendChild(el('div', { class: 'errata-q', text: r.snapshot }));
      if (r.details) item.appendChild(el('div', { text: 'Detalle: ' + r.details, style: 'font-size:.78rem;color:var(--text-muted);margin-top:4px;' }));

      const acciones = el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;' });
      const mk = (txt, color) => el('button', { type: 'button', text: txt, style: ESTILO_BTN + 'padding:5px 10px;background:' + color + ';color:#fff;' });

      const bDescartar = mk('Descartar', '#64748b');
      bDescartar.addEventListener('click', () => cerrar(r, 'dismissed', item));
      acciones.appendChild(bDescartar);

      if (TABLA_POR_TIPO[r.target_type]) {
        const bBorrar = mk('Eliminar contenido', '#dc2626');
        bBorrar.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este contenido de forma permanente?')) return;
          const { error: e3 } = await c.from(TABLA_POR_TIPO[r.target_type]).delete().eq('id', r.target_id);
          if (e3) { aviso('No se pudo eliminar: ' + e3.message); return; }
          await cerrar(r, 'actioned', item);
        });
        acciones.appendChild(bBorrar);
      }
      if (r.target_user_id) {
        const bBan = mk('Suspender usuario', '#7c3aed');
        bBan.addEventListener('click', async () => {
          if (!confirm('¿Suspender a este usuario? No podrá publicar en chat ni foro.')) return;
          const { error: e4 } = await c.rpc('admin_set_ban', { p_user: r.target_user_id, p_banned: true });
          if (e4) { aviso('No se pudo suspender: ' + e4.message); return; }
          await cerrar(r, 'actioned', item);
        });
        acciones.appendChild(bBan);
      }
      item.appendChild(acciones);
      box.appendChild(item);
    });
  }

  async function renderAdminUpStats(containerId) {
    const box = document.getElementById(containerId);
    const c = client();
    if (!box || !c) return;
    const { data, error } = await c.rpc('admin_up_stats', { p_limit: 5 });
    box.textContent = '';
    if (error) { box.textContent = 'No se pudieron cargar las estadísticas.'; return; }
    if (!data || !data.length) {
      box.appendChild(el('p', { text: 'Todavía no hay suficientes simulacros (mínimo 10 respuestas por unidad).', style: 'color:var(--text-muted);font-size:.85rem;padding:12px;' }));
      return;
    }
    data.forEach((u) => {
      const item = el('div', { class: 'admin-list-item' });
      const meta = el('div', { class: 'errata-meta' });
      meta.appendChild(el('span', { text: (u.up || '') + ' · ' + (u.modulo || '') }));
      meta.appendChild(el('span', { text: u.pct_fallos + '% de fallos', style: 'color:' + (u.pct_fallos >= 50 ? 'var(--danger)' : 'var(--warning)') + ';' }));
      item.appendChild(meta);
      item.appendChild(el('div', { class: 'errata-q', text: u.total + ' respuestas analizadas' }));
      box.appendChild(item);
    });
  }

  async function actualizarPanelAdmin() {
    const c = client();
    if (!c) return;
    const { data, error } = await c.rpc('admin_stats');
    if (!error && data) {
      setTxt('admin-stat-users', data.usuarios);
      setTxt('admin-stat-users-sub', '+' + data.usuarios_7d + ' esta semana');
      setTxt('admin-stat-exams', data.simulacros);
      setTxt('admin-stat-exams-sub', '+' + data.simulacros_7d + ' esta semana');
      setTxt('admin-stat-avg', data.efectividad_pct == null ? '—' : data.efectividad_pct + '%');
      setTxt('admin-reports-count', data.reportes_abiertos > 0 ? '(' + data.reportes_abiertos + ')' : '');
    } else if (error) {
      console.warn('[Moderacion] admin_stats no disponible (¿corriste sql/01_seguridad_fase1.sql? ¿sos admin?):', error.message);
    }
    renderAdminUpStats('admin-up-stats');
    renderAdminReportes('admin-reports-list');
  }

  window.NikaModeracion = {
    reportar, botonReporte, bloquear, desbloquear, estaBloqueado, esMio,
    cargarBloqueados, abrirBloqueados, actualizarPanelAdmin, renderAdminReportes,
  };

  // Cargar los bloqueos apenas haya sesión
  (async function init() {
    try { await miId(); } catch (_) {}
    cargarBloqueados();
  })();
})();
