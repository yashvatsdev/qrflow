import "server-only";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "./slug";
import { HttpError } from "@/lib/security/http";
import type { QRCode, QRCodeSummary, ScanStats } from "@/types/qr";
export async function userContext() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user)
    throw new HttpError(401, "UNAUTHENTICATED", "Please sign in to continue.");
  return { db, user };
}
export type Context = Awaited<ReturnType<typeof userContext>>;
function dbError(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "P0001")
    throw new HttpError(
      429,
      "QUOTA",
      "Free plan limit reached: 100 codes and 100 changes per day.",
    );
  throw new HttpError(
    503,
    "DATABASE",
    "Could not complete this request. Please try again.",
  );
}
export async function listCodes({ db, user }: Context): Promise<QRCode[]> {
  const { data, error } = await db
    .from("qr_codes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  dbError(error);
  return data as QRCode[];
}
export async function getCode(
  { db, user }: Context,
  id: string,
): Promise<QRCode> {
  const { data, error } = await db
    .from("qr_codes")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();
  dbError(error);
  if (!data) throw new HttpError(404, "NOT_FOUND", "QR code not found.");
  return data as QRCode;
}
export async function listCodeSummaries({
  db,
  user,
}: Context): Promise<QRCodeSummary[]> {
  // Aggregate through the existing foreign key. Both tables retain owner RLS;
  // this avoids one analytics request per row and never downloads event records.
  const { data, error } = await db
    .from("qr_codes")
    .select("*,scan_events(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  dbError(error);
  return (data || []).map(({ scan_events, ...code }) => ({
    ...code,
    recorded_scans: scan_events[0]?.count ?? 0,
  })) as QRCodeSummary[];
}
export async function createCode({ db, user }: Context, input: unknown) {
  const { data, error } = await db
    .from("qr_codes")
    .insert({ ...(input as object), user_id: user.id, slug: generateSlug() })
    .select()
    .single();
  dbError(error);
  return data as QRCode;
}
export async function updateCode(ctx: Context, id: string, input: unknown) {
  const { data, error } = await ctx.db
    .from("qr_codes")
    .update(input as object)
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .select()
    .maybeSingle();
  dbError(error);
  if (!data) throw new HttpError(404, "NOT_FOUND", "QR code not found.");
  return data as QRCode;
}
export async function deleteCode(ctx: Context, id: string) {
  const { data, error } = await ctx.db
    .from("qr_codes")
    .delete()
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .select("id")
    .maybeSingle();
  dbError(error);
  if (!data) throw new HttpError(404, "NOT_FOUND", "QR code not found.");
}
export async function scanStats(ctx: Context, id?: string): Promise<ScanStats> {
  if (id) await getCode(ctx, id);
  const { data, error } = await ctx.db.rpc("scan_stats", {
    code_id: id ?? null,
  });
  dbError(error);
  return data as ScanStats;
}
