import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Falta configurar VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — las pantallas que todavía no se migraron a PHP no van a funcionar, pero el resto de la app sí."
  );
}

// Si faltan las llaves (como en esta compilación para cPanel), se usa un
// valor de relleno válido en formato, para que createClient() no rompa
// toda la aplicación al cargar — las pantallas que sí dependan de Supabase
// van a fallar solas al usarlas, en vez de tirar abajo TODA la app.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
