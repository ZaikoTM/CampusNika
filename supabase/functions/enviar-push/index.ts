// ============================================================================
// CAMPUS NIKA — Edge Function: enviar-push
// ----------------------------------------------------------------------------
// Manda una notificación Web Push al celular / compu cuando se inserta una fila en `notificaciones`
// (invitaciones a estudiar, notas compartidas, ...), aunque la persona tenga NikaMed cerrado.
// La llama un trigger de la base (ver migración 20261022110000_push_trigger.sql) con el secreto compartido
// PUSH_WEBHOOK_SECRET. No acepta llamadas de nadie más.
// Secretos: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_WEBHOOK_SECRET
// Deploy: supabase functions deploy enviar-push --no-verify-jwt
// ============================================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import webpush from 'npm:web-push@3.6.7';

const SECRETO = Deno.env.get('PUSH_WEBHOOK_SECRET') ?? '';
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:soporte@nikamed.com.ar', Deno.env.get('VAPID_PUBLIC_KEY') ?? '', Deno.env.get('VAPID_PRIVATE_KEY') ?? '');
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const tipoPref = (t: string) => (t === 'reto' ? 'desafio' : t);
function urlDe(n: any): string {
  const d = n.datos ?? {};
  if (n.tipo === 'invitacion_pomodoro') return `campus.html?unirme=${encodeURIComponent(n.de_username ?? '')}&sid=${encodeURIComponent(d.sessionId ?? '')}&tema=${encodeURIComponent(d.tema ?? '')}`;
  if (n.tipo === 'nota_compartida') return 'mis_notas.html';
  if (d.url) return String(d.url);
  return 'campus.html';
}

serve(async (req) => {
  if (req.method !== 'POST' || !SECRETO || req.headers.get('x-push-secret') !== SECRETO) return new Response('forbidden', { status: 403 });
  let n: any;
  try { n = (await req.json()).record; } catch { return new Response('bad request', { status: 400 }); }
  if (!n || !n.para_id) return new Response('sin registro', { status: 400 });

  // preferencias de la persona (si apagó los avisos con la app cerrada o ese tipo, no se envía)
  const { data: pr } = await admin.from('notif_preferencias').select('prefs').eq('user_id', n.para_id).maybeSingle();
  const prefs = (pr?.prefs ?? {}) as any;
  if (prefs.push === false || (prefs.aviso && prefs.aviso[tipoPref(n.tipo)] === false)) return new Response('omitido por preferencias');

  const { data: subs } = await admin.from('push_suscripciones').select('endpoint,p256dh,auth').eq('user_id', n.para_id);
  if (!subs || !subs.length) return new Response('sin suscripciones');

  const carga = JSON.stringify({ titulo: n.titulo, cuerpo: n.cuerpo, tipo: n.tipo, id: n.id, url: urlDe(n), vence: n.vence_en ?? null });
  let enviados = 0;
  await Promise.all(subs.map(async (s: any) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, carga, { TTL: n.tipo === 'invitacion_pomodoro' ? 300 : 86400, urgency: n.tipo === 'invitacion_pomodoro' ? 'high' : 'normal' });
      enviados++;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await admin.from('push_suscripciones').delete().eq('endpoint', s.endpoint);   // suscripción vencida
    }
  }));
  return new Response(JSON.stringify({ enviados }), { headers: { 'Content-Type': 'application/json' } });
});
