import { slugSchema, validDestination } from "@/lib/validation/qr";
export type ResolvedQR = {
  id: string;
  status: string;
  destination_url: string;
};
type Resolver = {
  find: (slug: string) => Promise<ResolvedQR | null>;
  record: (id: string) => Promise<void>;
};
const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export function unavailable(status: number, title: string, message: string) {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · QRFlow</title><body style="margin:0;background:#0b0f14;color:#f9fafb;font:17px/1.6 system-ui;display:grid;min-height:100dvh;place-items:center"><main style="max-width:520px;padding:32px"><a style="color:#93c5fd" href="/">QRFlow</a><h1>${title}</h1><p>${message}</p><a style="color:#93c5fd" href="/report">Report this QR code</a></main></body></html>`,
    {
      status,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
export async function resolveRedirect(
  slug: string,
  origin: string,
  resolver: Resolver,
  track = true,
) {
  if (!slugSchema.safeParse(slug).success)
    return unavailable(
      404,
      "QR code not found",
      "Check the link or contact the person who shared it.",
    );
  let qr: ResolvedQR | null;
  try {
    qr = await resolver.find(slug);
  } catch {
    return unavailable(
      503,
      "Temporarily unavailable",
      "Please try scanning this code again in a moment.",
    );
  }
  if (!qr)
    return unavailable(
      404,
      "QR code not found",
      "This code may have been deleted.",
    );
  if (qr.status !== "active")
    return unavailable(
      410,
      "This QR code is paused",
      "Its owner has temporarily disabled this link.",
    );
  if (!validDestination(qr.destination_url, origin))
    return unavailable(
      410,
      "Destination unavailable",
      "Please contact the owner of this QR code.",
    );
  if (track)
    try {
      await resolver.record(qr.id);
    } catch {
      /* Analytics must never prevent a valid redirect. */
    }
  return new Response(null, {
    status: 302,
    headers: { ...headers, Location: qr.destination_url },
  });
}
