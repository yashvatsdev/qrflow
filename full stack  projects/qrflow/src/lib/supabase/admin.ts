import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config";
// Public redirect capabilities are scoped by an unguessable slug in SQL.
// No privileged credential is needed in the application runtime.
export function redirectClient() {
  const { url, key } = supabaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
