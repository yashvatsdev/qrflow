import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseConfig } from "@/lib/config";
export async function createClient() {
  // Session expiry checks depend on the current time. Run Supabase only after
  // a real request arrives, including when Next knows cookies during prefetch.
  await connection();
  const jar = await cookies();
  const { url, key } = supabaseConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Server Component refresh is handled by proxy. */
        }
      },
    },
  });
}
