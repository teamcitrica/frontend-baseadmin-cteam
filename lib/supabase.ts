import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase Singleton - UNA sola instancia en toda la aplicación
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: 'lienzo-auth', // Key única consistente
        }
      }
    );
  }
  return supabaseInstance;
};

// Export para compatibilidad con imports existentes
export const supabase = getSupabase();

export default supabase;