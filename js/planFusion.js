/* NikaPlan · sincronización entre dispositivos SIN pisar progreso.
   Antes cada plan se guardaba entero y "ganaba" el último que se tocó: si en el celular se acreditaban horas de Pomodoro y en la PC se
   tildaba un tema más tarde, se perdía el progreso del otro dispositivo (26 % en uno y 2 % en el otro).
   Ahora los planes se fusionan campo por campo:
     · horas estudiadas por día (Pomodoro): gana el valor MAYOR (solo crece),
     · temas / checklist: gana el último cambio de cada ítem (hecho_ts); si es un dato viejo sin marca, "hecho" se conserva,
     · la estructura (días, fechas, temas) sale del plan editado más recientemente. */
(function () {
  'use strict';
  const PREFIJO = 'nika_planes_examen_v1_';
  const items = (d) => (d.temas || []).concat(d.checklist || []);
  const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  function fusionarDia(base, otro) {
    if (!otro) return;
    base.estudiado = r2(Math.max(base.estudiado || 0, otro.estudiado || 0));
    if (!base.estudiado) delete base.estudiado;
    const mapa = {};
    items(otro).forEach((x) => { mapa[x.id] = x; });
    items(base).forEach((x) => {
      const o = mapa[x.id]; if (!o) return;
      const ta = x.hecho_ts || '', tb = o.hecho_ts || '';
      if (ta || tb) { if (tb > ta) { x.hecho = !!o.hecho; x.hecho_ts = tb; } }
      else if (o.hecho) x.hecho = true;
    });
  }

  // Devuelve un plan nuevo con lo mejor de los dos (a y b son el mismo plan en dos dispositivos)
  function fusionar(a, b) {
    if (!a) return b ? JSON.parse(JSON.stringify(b)) : b;
    if (!b) return JSON.parse(JSON.stringify(a));
    const aNuevo = String(a.actualizado_en || '') >= String(b.actualizado_en || '');
    const base = JSON.parse(JSON.stringify(aNuevo ? a : b)), otro = aNuevo ? b : a;
    Object.defineProperty(base, '__origen', { value: aNuevo ? 'a' : 'b', enumerable: false, configurable: true });
    const dias = {}; (otro.dias || []).forEach((d) => { dias[d.id] = d; });
    (base.dias || []).forEach((d) => fusionarDia(d, dias[d.id]));
    const t = [a.actualizado_en, b.actualizado_en].filter(Boolean).sort();
    if (t.length) base.actualizado_en = t[t.length - 1];
    return base;
  }

  // Aplica el progreso de "otro" sobre el plan "p" SIN reemplazar sus objetos (lo que el usuario está editando no se pierde)
  function fusionarEnSitio(p, otro) {
    if (!p || !otro) return;
    const dias = {}; (otro.dias || []).forEach((d) => { dias[d.id] = d; });
    (p.dias || []).forEach((d) => fusionarDia(d, dias[d.id]));
    if (String(otro.actualizado_en || '') > String(p.actualizado_en || '')) p.actualizado_en = otro.actualizado_en;
  }

  const aFila = (p, userId) => {
    const { id, titulo, materia, fecha_examen, creado_en, actualizado_en, ...datos } = p;
    return { id, user_id: userId, titulo, materia, fecha_examen, datos, actualizado_en: actualizado_en || new Date().toISOString() };
  };
  const deFila = (r) => Object.assign({ id: r.id, titulo: r.titulo, materia: r.materia, fecha_examen: r.fecha_examen, creado_en: r.creado_en, actualizado_en: r.actualizado_en }, r.datos || {});
  const mismo = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function leerLocal(userId) { try { return JSON.parse(localStorage.getItem(PREFIJO + userId) || '[]') || []; } catch (_) { return []; } }
  function guardarLocal(userId, planes) { try { localStorage.setItem(PREFIJO + userId, JSON.stringify(planes)); } catch (_) {} }

  // Trae la nube, fusiona con lo local, guarda lo local y devuelve { planes, aSubir } (aSubir = planes que la nube todavía no tiene completos)
  async function sincronizar(client, userId, localOpcional) {
    const { data, error } = await client.from('planes_examen').select('*').eq('user_id', userId);
    if (error) throw error;
    const locales = localOpcional || leerLocal(userId);
    const remotos = (data || []).map(deFila);
    const idsLocal = new Map(locales.map((p) => [p.id, p]));
    const idsRemoto = new Map(remotos.map((p) => [p.id, p]));
    const planes = [], aSubir = [];
    new Set([...idsLocal.keys(), ...idsRemoto.keys()]).forEach((id) => {
      const l = idsLocal.get(id), r = idsRemoto.get(id);
      if (l && !r) { planes.push(l); aSubir.push(l); return; }
      if (!l && r) { planes.push(r); return; }
      const m = fusionar(l, r);
      planes.push(m);
      if (!mismo(aFila(m, userId).datos, aFila(r, userId).datos) || String(m.actualizado_en) !== String(r.actualizado_en)) aSubir.push(m);
    });
    guardarLocal(userId, planes);
    return { planes, aSubir };
  }

  async function subirPlan(client, userId, plan) {
    const { error } = await client.from('planes_examen').upsert(aFila(plan, userId));
    if (error) throw error;
  }

  // Lo usa el Pomodoro: sube UN plan fusionándolo antes con lo que hay en la nube (nunca pisa el progreso de otro dispositivo)
  async function empujar(client, userId, plan) {
    const { data, error } = await client.from('planes_examen').select('*').eq('id', plan.id).eq('user_id', userId).maybeSingle();
    if (error) throw error;
    const m = data ? fusionar(plan, deFila(data)) : plan;
    await subirPlan(client, userId, m);
    const locales = leerLocal(userId);
    const i = locales.findIndex((x) => x.id === m.id);
    if (i >= 0) { locales[i] = fusionar(locales[i], m); guardarLocal(userId, locales); }
    return m;
  }

  window.NikaPlanFusion = { fusionar, fusionarEnSitio, sincronizar, subirPlan, empujar, leerLocal, guardarLocal, aFila, deFila };
})();
