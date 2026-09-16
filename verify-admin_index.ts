// ============================================================
// CAMPUS NIKA — Fase A.1: Contraseña Maestra Server-Side + RBAC
// Edge Function: verify-admin
// ------------------------------------------------------------
// Recibe la clave maestra del body, la compara contra el secreto
// ADMIN_MASTER_PASSWORD (nunca viaja al cliente), y si coincide,
// promueve profiles.role='admin' para el usuario dueño del JWT
// que llamó a esta función (auth.uid() del token, no algo que
// mande el cliente).
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Cliente con el JWT del usuario que llama (viene en el header
    //    Authorization que el frontend manda automáticamente al invocar
    //    la función con supabase.functions.invoke).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUserClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sesión inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validar la clave maestra contra el secreto del proyecto
    const { masterPassword } = await req.json();
    const claveReal = Deno.env.get("ADMIN_MASTER_PASSWORD");

    if (!claveReal) {
      console.error("[verify-admin] Falta configurar el secreto ADMIN_MASTER_PASSWORD.");
      return new Response(JSON.stringify({ error: "Función mal configurada." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (masterPassword !== claveReal) {
      // Log del intento fallido (útil para detectar fuerza bruta)
      console.warn(`[verify-admin] Clave incorrecta intentada por usuario ${user.id}`);
      return new Response(JSON.stringify({ error: "Clave maestra incorrecta." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Clave correcta: promover el perfil a admin usando el cliente
    //    service_role (bypassa RLS, SOLO existe en este entorno server-side)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      console.error("[verify-admin] Error promoviendo a admin:", updateError);
      return new Response(JSON.stringify({ error: "No se pudo actualizar el rol." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, role: "admin" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[verify-admin] Error inesperado:", err);
    return new Response(JSON.stringify({ error: "Error interno." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
