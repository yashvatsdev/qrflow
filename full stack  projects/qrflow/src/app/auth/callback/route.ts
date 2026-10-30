import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/config";
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const origin = appUrl();
  if (code)
    try {
      const db = await createClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) return Response.redirect(`${origin}/dashboard`, 303);
    } catch {}
  return Response.redirect(`${origin}/login?error=callback`, 303);
}
