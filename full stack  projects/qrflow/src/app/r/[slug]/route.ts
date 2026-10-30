import { redirectClient } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/config";
import { resolveRedirect, unavailable } from "@/lib/qr/redirect";
async function handle(
  request: Request,
  c: { params: Promise<{ slug: string }> },
  track: boolean,
) {
  try {
    const db = redirectClient();
    return await resolveRedirect(
      (await c.params).slug,
      appUrl(),
      {
        async find(slug) {
          const { data, error } = await db
            .rpc("resolve_public_qr", { public_slug: slug })
            .abortSignal(AbortSignal.timeout(4000));
          if (error) throw error;
          return data;
        },
        async record() {
          const { error } = await db
            .rpc("record_public_scan", { public_slug: (await c.params).slug })
            .abortSignal(AbortSignal.timeout(1200));
          if (error) throw error;
        },
      },
      track && request.headers.get("purpose") !== "prefetch",
    );
  } catch {
    return unavailable(
      503,
      "Temporarily unavailable",
      "Please try again in a moment.",
    );
  }
}
export async function GET(
  r: Request,
  c: { params: Promise<{ slug: string }> },
) {
  return handle(r, c, true);
}
export async function HEAD(
  r: Request,
  c: { params: Promise<{ slug: string }> },
) {
  return handle(r, c, false);
}
