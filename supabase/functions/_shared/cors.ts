// supabase/functions/_shared/cors.ts
// ---------------------------------------------------------------------
// CORS unificado para TODAS las Edge Functions de Campus Nika.
//
// Uso en cada función (import relativo, funciona con `supabase functions deploy`):
//
//   import { withCors } from "../_shared/cors.ts";
//   Deno.serve(withCors(async (req) => { ...tu lógica, devolvés un Response normal... }));
//
// withCors se encarga de:
//   1) Responder el preflight OPTIONS de inmediato (204, sin cuerpo).
//   2) Agregar las cabeceras CORS a TODAS las respuestas (éxito, 4xx, 5xx).
//   3) Atrapar cualquier excepción no controlada y devolver un 500 CON cabeceras CORS,
//      para que un error interno no se vea en el navegador como un falso "bloqueo de CORS".
// ---------------------------------------------------------------------

export const ORIGENES_PERMITIDOS: string[] = [
  "https://nikamed.com.ar",
  "https://www.nikamed.com.ar",
  "https://nikamed-campus.vercel.app",
];

// Desarrollo local: http(s)://localhost[:puerto] y http(s)://127.0.0.1[:puerto]
export const PATRON_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/;

// Si el origen no está en la lista, se responde con el dominio oficial: el navegador
// bloqueará igualmente al origen no autorizado, pero nunca se refleja un origen desconocido.
export const ORIGEN_POR_DEFECTO = "https://nikamed.com.ar";

export function getCorsHeaders(req: Request): Record<string, string> {
  const origen = req.headers.get("Origin") ?? "";
  const permitido = ORIGENES_PERMITIDOS.includes(origen) || PATRON_LOCAL.test(origen);
  return {
    "Access-Control-Allow-Origin": permitido ? origen : ORIGEN_POR_DEFECTO,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function withCors(
  handler: (req: Request) => Response | Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const cors = getCorsHeaders(req);

    // Preflight: se corta acá, antes de tocar cualquier otra lógica.
    // OJO: un 204 no puede llevar cuerpo (new Response("ok", { status: 204 }) lanza TypeError en Deno).
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    let res: Response;
    try {
      res = await handler(req);
    } catch (err) {
      console.error("[cors] Error no controlado en la función:", err);
      res = new Response(JSON.stringify({ error: "Error interno del servidor." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = new Headers(res.headers);
    for (const [clave, valor] of Object.entries(cors)) headers.set(clave, valor);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  };
}
