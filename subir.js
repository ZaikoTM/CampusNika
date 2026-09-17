const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 1. Tu URL de Supabase y tu Service Role Key (la clave secreta de la API en el panel)
const SUPABASE_URL = 'https://pswjmouuyaxueaqqglko.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2ptb3V1eWF4dWVhcXFnbGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MDY3MywiZXhwIjoyMTA1MDE2NjczfQ.X9I9q13nUiqBI7VgilHvknFE_cNDMVZfPf7g7bqA4po';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Genera automáticamente la lista de UP1.txt a UP11.txt, sin escribirlas a mano.
// Cada una se asocia a su identificador exacto: UP1.txt -> up = 'up1', etc.
const TOTAL_UPS = 11;
const archivos = Array.from({ length: TOTAL_UPS }, (_, i) => {
  const numero = i + 1;
  return {
    up: `up${numero}`,
    titulo: `UP${numero}`,
    ruta: `UP${numero}.txt`
  };
});

async function subirApuntes() {
  console.log('🚀 Iniciando la subida de apuntes a Supabase...');

  for (const item of archivos) {
    if (fs.existsSync(item.ruta)) {
      const texto = fs.readFileSync(item.ruta, 'utf-8');
      console.log(`📤 Subiendo ${item.titulo} (${texto.length} caracteres)...`);

      const { error } = await supabase
        .from('material_up')
        .upsert({
          up: item.up,
          titulo: item.titulo,
          texto_resumen: texto,
          updated_at: new Date().toISOString()
        }, { onConflict: 'up' });

      if (error) {
        console.error(`❌ Error subiendo ${item.titulo}:`, error.message);
      } else {
        console.log(`✅ ¡Subido con éxito: ${item.titulo}!`);
      }
    } else {
      console.log(`⚠️ No se encontró el archivo local: ${item.ruta}`);
    }
  }
  console.log('🏁 Proceso finalizado.');
}

subirApuntes();
