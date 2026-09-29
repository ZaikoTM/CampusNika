// supabase/functions/login-usuario/index.ts
// ---------------------------------------------------------------------
// LOGIN POR NOMBRE DE USUARIO con límite de intentos (Campus Nika).
//
//  * El navegador manda { identificador, password }. El correo se resuelve ACÁ,
//    en el servidor, y nunca se devuelve al navegador.
//  * 5 intentos fallidos por usuario (y 20 por IP) en 15 minutos => bloqueo de 15 minutos.
//  * Respuesta idéntica si el usuario no existe o la contraseña es incorrecta
//    (no se puede averiguar qué usuarios existen).
//  * Si sale bien, devuelve los tokens de sesión y el navegador los activa con setSession().
//  * CORS dinámico: se responde con el MISMO origen que hizo la petición si está en la
//    lista de permitidos (nikamed.com.ar, Vercel, localhost con cualquier puerto).
//    Las cabeceras CORS viajan en TODAS las respuestas (éxito, errores y preflight).
//
// IMPORTANTE al desplegar: desactivá "Verify JWT" en esta función. El navegador llama
// antes de tener sesión y usa la clave publicable (sb_publishable_...), que no es un JWT.
//   supabase functions deploy login-usuario --no-verify-jwt
// ---------------------------------------------------------------------
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Si algún día servís el sitio desde otro dominio, agregalo acá.
const ORIGENES_PERMITIDOS = [
  "https://nikamed.com.ar",
  "https://www.nikamed.com.ar",
  "https://nikamed-campus.vercel.app",
];
// Pruebas locales: http://localhost:<cualquier puerto>, http://127.0.0.1:<puerto> y http://[::1]:<puerto>
const PATRON_LOCAL = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d{1,5})?$/;

const MAX_FALLOS_USUARIO = 5;
const MAX_FALLOS_IP = 20;
const VENTANA_MIN = 15;
const BLOQUEO_MIN = 15;
const MENSAJE_GENERICO = "Usuario o contraseña incorrectos.";
const MENSAJE_NO_DISPONIBLE = "Servicio no disponible. Probá más tarde.";

function origenPermitido(origen: string): boolean {
  if (!origen) return false;
  return ORIGENES_PERMITIDOS.includes(origen) || PATRON_LOCAL.test(origen);
}

function cabeceras(req: Request): Record<string, string> {
  const origen = req.headers.get("origin") ?? "";
  const h: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
  // Solo se devuelve Allow-Origin si el origen está permitido y se devuelve EXACTAMENTE ese origen
  // (nunca un origen fijo distinto del que llamó, que es lo que hacía fallar el preflight).
  if (origenPermitido(origen)) h["Access-Control-Allow-Origin"] = origen;
  return h;
}

function responder(req: Request, estado: number, cuerpo: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...cabeceras(req), ...extra } });
}

const dormir = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

async function manejar(req: Request): Promise<Response> {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    const h = cabeceras(req);
    delete h["Content-Type"];
    return new Response(null, { status: 204, headers: h });
  }
  if (req.method !== "POST") return responder(req, 405, { error: "Método no permitido." });

  let cuerpo: { identificador?: unknown; password?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return responder(req, 400, { error: "Solicitud inválida." });
  }
  const identificador = typeof cuerpo.identificador === "string" ? cuerpo.identificador.trim() : "";
  const password = typeof cuerpo.password === "string" ? cuerpo.password : "";
  if (identificador.length < 3 || identificador.length > 80 || password.length < 1 || password.length > 200) {
    return responder(req, 400, { error: "Completá usuario y contraseña." });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const claveServicio = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SECRET_KEY");
  const clavePublica = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SB_PUBLISHABLE_KEY");
  if (!url || !claveServicio || !clavePublica) {
    console.error("[login-usuario] Faltan variables de entorno (SUPABASE_URL / claves).");
    return responder(req, 500, { error: MENSAJE_NO_DISPONIBLE });
  }

  const admin = createClient(url, claveServicio, { auth: { persistSession: false, autoRefreshToken: false } });

  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "desconocida")
    .split(",")[0].trim();
  const claveUsuario = "u:" + identificador.toLowerCase();
  const claveIp = "i:" + ip;

  // 1) ¿Está bloqueado? (si no se puede verificar, se rechaza: nunca se saltea el límite)
  const bloqueo = await admin.rpc("login_bloqueado", { p_keys: [claveUsuario, claveIp] });
  if (bloqueo.error) {
    console.error("[login-usuario] login_bloqueado falló:", bloqueo.error.message);
    return responder(req, 500, { error: MENSAJE_NO_DISPONIBLE });
  }
  const segundos = Number(bloqueo.data ?? 0);
  if (segundos > 0) {
    return responder(
      req, 429,
      { error: `Demasiados intentos fallidos. Probá de nuevo en ${Math.ceil(segundos / 60)} min.`, retry_after: segundos },
      { "Retry-After": String(segundos) },
    );
  }

  const registrarFallo = async () => {
    await admin.rpc("login_registrar_fallo", { p_key: claveUsuario, p_max: MAX_FALLOS_USUARIO, p_ventana_min: VENTANA_MIN, p_bloqueo_min: BLOQUEO_MIN });
    await admin.rpc("login_registrar_fallo", { p_key: claveIp, p_max: MAX_FALLOS_IP, p_ventana_min: VENTANA_MIN, p_bloqueo_min: BLOQUEO_MIN });
  };

  // 2) Resolver el correo (solo en el servidor)
  let email: string | null = null;
  if (identificador.includes("@")) {
    email = identificador.toLowerCase();
  } else {
    const patron = identificador.replace(/[\\%_]/g, (c) => "\\" + c); // sin comodines: coincidencia exacta
    const { data: perfil } = await admin.from("profiles").select("id").ilike("username", patron).limit(1).maybeSingle();
    if (perfil && typeof perfil.id === "string") {
      // El correo se toma de Supabase Auth (fuente de verdad). profiles.email puede estar vacío
      // o haber sido editado por el propio usuario.
      const { data: u } = await admin.auth.admin.getUserById(perfil.id);
      email = u?.user?.email ?? null;
    }
  }

  if (!email) {
    await dormir(250 + Math.random() * 250); // que no se note si el usuario existe o no
    await registrarFallo();
    return responder(req, 401, { error: MENSAJE_GENERICO });
  }

  // 3) Verificar la contraseña con Supabase Auth
  const anon = createClient(url, clavePublica, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    if (error && (error as { code?: string }).code === "email_not_confirmed") {
      return responder(req, 403, { error: "Confirmá tu correo antes de iniciar sesión." });
    }
    await registrarFallo();
    return responder(req, 401, { error: MENSAJE_GENERICO });
  }

  // 4) Éxito: se reinicia el contador del usuario y se devuelven solo los tokens
  await admin.rpc("login_limpiar", { p_key: claveUsuario });
  const s = data.session;
  return responder(req, 200, {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    expires_in: s.expires_in,
    expires_at: s.expires_at,
    token_type: s.token_type,
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    return await manejar(req);
  } catch (err) {
    // Cualquier excepción inesperada también devuelve cabeceras CORS: así el navegador
    // muestra el error real del servidor y no un falso "bloqueo de CORS".
    console.error("[login-usuario] Error no controlado:", err);
    return responder(req, 500, { error: MENSAJE_NO_DISPONIBLE });
  }
});
