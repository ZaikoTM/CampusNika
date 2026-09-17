// ==========================================
// CAMPUS NIKA - Cliente Global de Supabase
// ==========================================
// Debe cargarse ANTES que auth-guard.js, notas.js, pomodoro.js y estudio.js
// en el <head> o al inicio del <body> de cada página HTML.
// Requiere el SDK de Supabase cargado previamente, por ejemplo:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://pswjmouuyaxueaqqglko.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2ptb3V1eWF4dWVhcXFnbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDA2NzMsImV4cCI6MjEwNTAxNjY3M30.xZbJfZg9QR9jyT4ZcjeLi125Fzub33kajCYy2X_kwHk';

if (typeof supabase === 'undefined') {
    console.error('[SupabaseClient] El SDK de Supabase no está cargado. Verificá que el <script> del CDN de @supabase/supabase-js esté antes de este archivo.');
} else {
    // 'var' (no 'const'/'let') a propósito: en un script clásico, una var
    // de nivel superior se registra automáticamente como propiedad de window
    // Y como identificador global accesible por otros scripts (auth-guard.js
    // hace `typeof supabaseClient === 'undefined'`, que necesita esto último).
    var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Redundante pero explícito, por si algún script solo mira window.*
    window.supabaseClient = supabaseClient;
    window.SUPABASE_URL = SUPABASE_URL;
    window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

    console.log('[SupabaseClient] Cliente inicializado correctamente.');
}
