// ============================================================================
// CAMPUS NIKA — Edge Function: turn-credentials
// ----------------------------------------------------------------------------
// Entrega credenciales TEMPORALES del servidor TURN de Cloudflare a quien tenga sesión iniciada, para que las
// llamadas conecten también en redes restrictivas (datos móviles compartidos, wifis de facultades, firewalls).
// La clave de Cloudflare vive solo en los secretos de Supabase; el navegador nunca la ve.
// Secretos: CF_TURN_KEY_ID, CF_TURN_API_TOKEN
//   npx supabase secrets set CF_TURN_KEY_ID=... CF_TURN_API_TOKEN=...
// Deploy: supabase functions deploy turn-credentials --no-verify-jwt   (la sesión se valida acá adentro)
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { withCors } from '../_shared/cors.ts';

const KEY_ID = Deno.env.get('CF_TURN_KEY_ID') ?? '';
const TOKEN = Deno.env.get('CF_TURN_API_TOKEN') ?? '';
const TTL = 6 * 3600;   // seis horas: alcanza para una llamada larga

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(withCors(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') return json({ error: 'metodo' }, 405);
  if (!KEY_ID || !TOKEN) return json({ error: 'turn_no_configurado' }, 503);

  // solo usuarios con sesión válida
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'sesion' }, 401);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(jwt);
  if (error || !data?.user) return json({ error: 'sesion' }, 401);

  const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${KEY_ID}/credentials/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttl: TTL }),
  });
  if (!r.ok) return json({ error: 'cloudflare', status: r.status }, 502);
  const c = await r.json();
  const ice = Array.isArray(c.iceServers) ? c.iceServers : [c.iceServers];
  return json({ iceServers: ice, ttl: TTL });
}));
