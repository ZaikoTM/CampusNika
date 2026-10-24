/* CAMPUS NIKA · Sincronización de lo que marcás en el Lector Nika sin conexión (js/estudio/pdfLector.js)
   Sin señal, el lector guarda en el dispositivo tus subrayados, dibujos, borrados, progreso de lectura y notas/textos sobre el PDF.
   Este módulo los sube a Supabase cuando vuelve la conexión, sin duplicar nada:
     · subrayados y dibujos → pdf_subrayados (antes de subir, se comprueba que no estén ya en la cuenta)
     · borrados hechos sin señal → se borran en la cuenta
     · progreso de lectura → pdf_progreso (se unen las páginas leídas de los dos lados; gana la última página más reciente)
     · notas y textos sobre el PDF → notas_estudio (las del PDF que está abierto esperan a que lo cierres)
   Se activa solo: al volver internet, al abrir cualquier página con sesión (js/nikaNotificaciones.js) y cada minuto mientras haya algo pendiente.
   API: NikaPdfSync.sincronizar() · contar() · marcarPendiente() */
(function () {
  'use strict';
  if (window.NikaPdfSync) return;

  const FLAG = 'nika_pdf_sync_pend', LS_NOTAS = 'nika_notas_estudio', K_OPS = 'nika_pdf_notas_ops';
  const P_HL = 'nika_pdf_hl_', P_DEL = 'nika_pdf_hldel_', P_PROG = 'nika_pdf_prog_';
  const cli = () => (window.NikaSupabase && window.NikaSupabase.client) || window.supabaseClient || null;
  const leer = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (_) { return def; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const quitar = (k) => { try { localStorage.removeItem(k); } catch (_) {} };
  const claves = (pref) => { const o = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(pref) === 0) o.push(k); } } catch (_) {} return o; };
  const uid = async () => { try { const { data } = await cli().auth.getSession(); return data && data.session && data.session.user ? data.session.user.id : null; } catch (_) { return null; } };
  // error de conexión o del servidor (se reintenta más tarde) frente a error de datos (no tiene sentido reintentar)
  const reintentable = (e) => !e || !navigator.onLine || /failed to fetch|networkerror|network request failed|load failed|timeout/i.test(String(e.message || '')) || e.status === 0 || e.status === 401 || e.status === 429 || e.status >= 500 || !e.status && !e.code;
  const emitir = (d) => { try { window.dispatchEvent(new CustomEvent('nika-pdf-sync', { detail: d })); } catch (_) {} };
  const esPdf = (n) => String(n && n.recurso || '').indexOf('pdf:') === 0;

  function marcarPendiente() { try { localStorage.setItem(FLAG, '1'); } catch (_) {} }

  // Cuántas cosas esperan para subirse
  function contar() {
    let n = 0;
    claves(P_HL).forEach((k) => { n += (leer(k, []) || []).filter((m) => !m.fallo).length; });
    claves(P_DEL).forEach((k) => { n += (leer(k, []) || []).length; });
    claves(P_PROG).forEach((k) => { const p = leer(k, null); if (p && (p.ultima_pagina || (p.leidas && p.leidas.length))) n++; });
    n += (leer(LS_NOTAS, []) || []).filter((x) => x && x.local && esPdf(x)).length;
    n += (leer(K_OPS, []) || []).length;
    return n;
  }

  let corriendo = false;
  async function sincronizar() {
    if (corriendo || !navigator.onLine) return { ok: false, motivo: 'sin-red' };
    const c = cli(); if (!c) return { ok: false, motivo: 'sin-cliente' };
    if (!(await uid())) return { ok: false, motivo: 'sin-sesion' };
    corriendo = true;
    let subidas = 0, fallos = 0;
    try {
      const abierto = (() => { try { const s = window.NikaPdf && window.NikaPdf.estado && window.NikaPdf.estado(); return s ? s.fileId : null; } catch (_) { return null; } })();

      // 1) borrados hechos sin señal
      for (const k of claves(P_DEL)) {
        const resto = [];
        for (const id of (leer(k, []) || [])) {
          try { const r = await c.from('pdf_subrayados').delete().eq('id', id); if (r.error && reintentable(r.error)) { resto.push(id); fallos++; } else subidas++; }
          catch (_) { resto.push(id); fallos++; }
        }
        if (resto.length) escribir(k, resto); else quitar(k);
      }

      // 2) subrayados y dibujos hechos sin señal
      for (const k of claves(P_HL)) {
        const fileId = k.slice(P_HL.length), lista = leer(k, []) || [];
        if (!lista.length) { quitar(k); continue; }
        let remotos = [];
        try { const r = await c.from('pdf_subrayados').select('id,pagina,rects').eq('file_id', fileId); if (r.error) { if (reintentable(r.error)) fallos++; continue; } remotos = r.data || []; }
        catch (_) { fallos++; continue; }
        const firmas = new Map(remotos.map((m) => [m.pagina + '|' + JSON.stringify(m.rects), m.id]));
        const quedan = [], mapa = [];
        for (const m of lista) {
          if (m.fallo) { quedan.push(m); continue; }
          const f = m.pagina + '|' + JSON.stringify(m.rects);
          if (firmas.has(f)) { mapa.push({ local: m.id, id: firmas.get(f) }); subidas++; continue; }   // ya estaba en la cuenta: no se duplica
          try {
            const r = await c.from('pdf_subrayados').insert({ file_id: fileId, pagina: m.pagina, color: m.color, texto: m.texto, rects: m.rects }).select('id').single();
            if (!r.error && r.data) { mapa.push({ local: m.id, id: r.data.id }); firmas.set(f, r.data.id); subidas++; }
            else if (reintentable(r.error)) { quedan.push(m); fallos++; }
            else quedan.push(Object.assign({}, m, { fallo: true }));   // la cuenta lo rechazó (p. ej. color no habilitado): queda en este dispositivo
          } catch (_) { quedan.push(m); fallos++; }
        }
        if (quedan.length) escribir(k, quedan); else quitar(k);
        if (mapa.length) emitir({ tipo: 'marcas', fileId, mapa });
      }

      // 3) progreso de lectura
      for (const k of claves(P_PROG)) {
        const fileId = k.slice(P_PROG.length), loc = leer(k, null);
        if (!loc || !(loc.ultima_pagina || (loc.leidas && loc.leidas.length))) { quitar(k); continue; }
        let rem = null;
        try { const r = await c.from('pdf_progreso').select('ultima_pagina,total_paginas,leidas,updated_at').eq('file_id', fileId).maybeSingle(); if (r.error) { if (reintentable(r.error)) fallos++; continue; } rem = r.data; }
        catch (_) { fallos++; continue; }
        const leidas = Array.from(new Set([].concat((rem && rem.leidas) || [], loc.leidas || []))).sort((a, b) => a - b);
        const ultima = (!rem || (loc.t || 0) > (Date.parse(rem.updated_at) || 0)) ? loc.ultima_pagina : rem.ultima_pagina;
        try {
          const r = await c.from('pdf_progreso').upsert({ file_id: fileId, titulo: loc.titulo || null, ultima_pagina: ultima || 1, total_paginas: loc.total_paginas || (rem && rem.total_paginas) || 0, leidas, updated_at: new Date().toISOString() }, { onConflict: 'user_id,file_id' });
          if (!r.error) { quitar(k); subidas++; } else if (reintentable(r.error)) fallos++;
        } catch (_) { fallos++; }
      }

      // 4) notas y textos sobre el PDF creados sin señal (las del PDF abierto esperan a que lo cierres)
      const notas = leer(LS_NOTAS, []) || [];
      const resto = [];
      for (const n of notas) {
        if (!(n && n.local && esPdf(n)) || n.recurso === 'pdf:' + abierto) { resto.push(n); continue; }
        const fila = Object.assign({}, n); delete fila.id; delete fila.local; delete fila.titulo; delete fila.contenido_html;
        try {
          const r = await c.from('notas_estudio').insert(fila);
          if (!r.error) subidas++; else if (reintentable(r.error)) { resto.push(n); fallos++; } else resto.push(n);
        } catch (_) { resto.push(n); fallos++; }
      }
      if (resto.length !== notas.length) escribir(LS_NOTAS, resto);

      // 5) ediciones y borrados de notas ya guardadas, hechos sin señal
      const ops = leer(K_OPS, []) || [], opsResto = [];
      for (const o of ops) {
        try {
          const r = o.t === 'del' ? await c.from('notas_estudio').delete().eq('id', o.id) : await c.from('notas_estudio').update(o.campos || {}).eq('id', o.id);
          if (r.error && reintentable(r.error)) { opsResto.push(o); fallos++; } else subidas++;
        } catch (_) { opsResto.push(o); fallos++; }
      }
      if (ops.length) { if (opsResto.length) escribir(K_OPS, opsResto); else quitar(K_OPS); }
    } finally { corriendo = false; }

    if (!fallos && contar() === 0) quitar(FLAG);
    if (subidas) {
      emitir({ tipo: 'listo', subidas });
      try { if (window.NikaPdf && window.NikaPdf.activo && window.NikaPdf.activo() && window.NikaPdf.aviso) window.NikaPdf.aviso('☁️ Se subió lo que marcaste sin conexión'); else if (typeof window.showToast === 'function') window.showToast('☁️ Se subió a tu cuenta lo que marcaste sin conexión'); } catch (_) {}
    }
    return { ok: true, subidas, fallos };
  }

  window.addEventListener('online', () => setTimeout(() => { if (contar()) sincronizar(); }, 800 + Math.random() * 2500));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && navigator.onLine && contar()) sincronizar(); });
  setInterval(() => { if (!document.hidden && navigator.onLine && contar()) sincronizar(); }, 60000);
  setTimeout(() => { if (navigator.onLine && contar()) sincronizar(); }, 2500);

  window.NikaPdfSync = { sincronizar, contar, marcarPendiente };
})();
