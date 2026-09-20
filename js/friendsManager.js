// js/friendsManager.js
// CAMPUS NIKA — Amistades bidireccionales en Supabase (tabla public.friendships).
// Reemplaza al viejo localStorage 'nika_friends' / 'nika_friend_requests'.
//
// Cada mutación (enviar, aceptar, rechazar, eliminar) y cada cambio en tiempo
// real dispara el evento window 'nika:friends-changed' para que la interfaz
// se vuelva a dibujar sola.

const NikaFriends = (() => {
  let channel = null;

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function getClient() {
    if (window.NikaScriptsReady) await window.NikaScriptsReady;
    if (window.NikaSupabase && window.NikaSupabase.ready) {
      try { await window.NikaSupabase.ready; } catch (_) {}
    }
    const c = window.NikaSupabase && window.NikaSupabase.client;
    if (!c) throw new Error('No hay conexión con Supabase.');
    return c;
  }

  async function getMyId() {
    const c = await getClient();
    const { data: { session } } = await c.auth.getSession();
    if (!session || !session.user) throw new Error('Necesitás iniciar sesión.');
    return session.user.id;
  }

  function emit() {
    window.dispatchEvent(new CustomEvent('nika:friends-changed'));
  }

  // Todas las filas donde participo (pendientes y aceptadas)
  async function fetchRows() {
    const c = await getClient();
    const me = await getMyId();
    const { data, error } = await c
      .from('friendships')
      .select('id, requester_id, addressee_id, status, created_at')
      .or(`requester_id.eq.${me},addressee_id.eq.${me}`);
    if (error) throw error;
    return { me, rows: data || [] };
  }

  async function fetchProfiles(ids) {
    if (!ids.length) return {};
    const c = await getClient();
    const { data, error } = await c
      .from('profiles')
      .select('id, username, fullname, full_name, nombre, avatar, avatar_url')
      .in('id', ids);
    if (error) throw error;
    const map = {};
    (data || []).forEach((p) => {
      map[p.id] = {
        id: p.id,
        username: p.username || '',
        fullname: p.fullname || p.full_name || p.nombre || p.username || 'Estudiante Nika',
        avatar: p.avatar || p.avatar_url || null,
      };
    });
    return map;
  }

  async function withProfiles(rows, me) {
    const otherIds = [...new Set(rows.map((r) => (r.requester_id === me ? r.addressee_id : r.requester_id)))];
    const profiles = await fetchProfiles(otherIds);
    return rows.map((r) => {
      const otherId = r.requester_id === me ? r.addressee_id : r.requester_id;
      const p = profiles[otherId] || { id: otherId, username: '', fullname: 'Estudiante Nika', avatar: null };
      return { friendshipId: r.id, ...p };
    }).sort((a, b) => a.fullname.localeCompare(b.fullname, 'es'));
  }

  // Amigos confirmados
  async function listFriends() {
    const { me, rows } = await fetchRows();
    return withProfiles(rows.filter((r) => r.status === 'accepted'), me);
  }

  // Solicitudes que me mandaron y todavía no respondí
  async function listIncoming() {
    const { me, rows } = await fetchRows();
    return withProfiles(rows.filter((r) => r.status === 'pending' && r.addressee_id === me), me);
  }

  // Relación con un usuario puntual: 'none' | 'sent' | 'received' | 'friends'
  async function relationWith(userId) {
    const { me, rows } = await fetchRows();
    const r = rows.find((x) =>
      (x.requester_id === me && x.addressee_id === userId) ||
      (x.requester_id === userId && x.addressee_id === me));
    if (!r) return { state: 'none', friendshipId: null };
    if (r.status === 'accepted') return { state: 'friends', friendshipId: r.id };
    return { state: r.requester_id === me ? 'sent' : 'received', friendshipId: r.id };
  }

  // Enviar solicitud. Si esa persona ya me había mandado una, se acepta directo.
  // Devuelve { ok, status: 'sent'|'auto_accepted'|'already_pending'|'already_friends', error? }
  async function sendRequest(targetId) {
    try {
      const c = await getClient();
      const me = await getMyId();
      if (!targetId || targetId === me) return { ok: false, error: 'Usuario inválido.' };

      const rel = await relationWith(targetId);
      if (rel.state === 'friends') return { ok: true, status: 'already_friends' };
      if (rel.state === 'sent') return { ok: true, status: 'already_pending' };
      if (rel.state === 'received') {
        const r = await acceptById(rel.friendshipId);
        return r.ok ? { ok: true, status: 'auto_accepted' } : r;
      }

      const { error } = await c.from('friendships').insert({ requester_id: me, addressee_id: targetId, status: 'pending' });
      if (error) {
        if (error.code === '23505') return { ok: true, status: 'already_pending' }; // carrera entre dos pestañas
        return { ok: false, error: error.message };
      }
      emit();
      return { ok: true, status: 'sent' };
    } catch (err) {
      return { ok: false, error: err.message || 'Error inesperado.' };
    }
  }

  async function _accept(filterFn) {
    try {
      const c = await getClient();
      const me = await getMyId();
      const q = filterFn(c.from('friendships')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('addressee_id', me)
        .eq('status', 'pending'));
      const { data, error } = await q.select('id');
      if (error) return { ok: false, error: error.message };
      if (!data || !data.length) return { ok: false, error: 'La solicitud ya no existe.' };
      emit();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Error inesperado.' };
    }
  }

  const acceptById = (friendshipId) => _accept((q) => q.eq('id', friendshipId));
  const acceptFrom = (senderId) => _accept((q) => q.eq('requester_id', senderId));

  // Rechazar una solicitud, cancelar la mía o eliminar a un amigo
  async function remove(friendshipId) {
    try {
      const c = await getClient();
      const { error } = await c.from('friendships').delete().eq('id', friendshipId);
      if (error) return { ok: false, error: error.message };
      emit();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Error inesperado.' };
    }
  }

  // Tiempo real: cualquier cambio en mis amistades vuelve a dibujar la interfaz
  async function startRealtime() {
    try {
      if (channel) return;
      const c = await getClient();
      channel = c.channel('public:friendships')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => emit())
        .subscribe();
    } catch (err) {
      console.warn('[NikaFriends] Realtime no disponible:', err.message);
    }
  }

  async function stopRealtime() {
    try {
      if (channel) { const c = await getClient(); c.removeChannel(channel); }
    } catch (_) {}
    channel = null;
  }

  return { esc, listFriends, listIncoming, relationWith, sendRequest, acceptById, acceptFrom, remove, startRealtime, stopRealtime };
})();

window.NikaFriends = NikaFriends;
