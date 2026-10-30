import { createClient } from "@/lib/supabase/server";
import { appUrl, supabaseConfigured } from "@/lib/config";
export async function POST(request: Request) {
  const origin = appUrl();
  if (request.headers.get("origin") !== origin)
    return new Response("Forbidden", { status: 403 });
  if (!supabaseConfigured())
    return Response.redirect(`${origin}/login?error=configuration`, 303);
  try {
    const db = await createClient();
    const { data, error } = await db.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url)
      return Response.redirect(`${origin}/login?error=oauth`, 303);
    return Response.redirect(data.url, 303);
  } catch {
    return Response.redirect(`${origin}/login?error=oauth`, 303);
  }
}
