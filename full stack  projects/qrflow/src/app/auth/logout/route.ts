import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/config";
export async function POST(request: Request) {
  const origin = appUrl();
  if (request.headers.get("origin") !== origin)
    return new Response("Forbidden", { status: 403 });
  const db = await createClient();
  const { error } = await db.auth.signOut();
  if (error)
    return new Response("Sign out failed. Please try again.", { status: 503 });
  return Response.redirect(`${origin}/login`, 303);
}
