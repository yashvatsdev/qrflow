import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
import {
  createCode,
  getCode,
  updateCode,
  deleteCode,
  listCodes,
  listCodeSummaries,
  scanStats,
  type Context,
} from "@/lib/qr/service";
import { defaultStyle } from "@/lib/validation/qr";
function context(data: unknown, error: unknown = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    "select",
    "eq",
    "order",
    "insert",
    "update",
    "delete",
    "maybeSingle",
    "single",
  ])
    chain[method] = vi.fn().mockReturnValue(chain);
  chain.then = vi.fn((resolve) => resolve({ data, error }));
  const db = {
    from: vi.fn(() => chain),
    rpc: vi.fn().mockResolvedValue({ data, error }),
  };
  return {
    ctx: { db, user: { id: "owner" } } as unknown as Context,
    chain,
    db,
  };
}
describe("owned QR service", () => {
  it("sets owner and high-entropy slug on creation", async () => {
    const { ctx, chain } = context({ id: "new" });
    await createCode(ctx, {
      name: "Menu",
      destination_url: "https://example.com",
      style_config: defaultStyle,
    });
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "owner",
        slug: expect.stringMatching(/^[A-Za-z0-9_-]{22}$/),
      }),
    );
  });
  it("scopes reads and lists to the signed-in owner", async () => {
    const { ctx, chain } = context({ id: "id" });
    await getCode(ctx, "id");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "owner");
    await listCodes(ctx);
    expect(chain.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });
  it("scopes updates to both owner and id", async () => {
    const { ctx, chain } = context({ id: "id" });
    await updateCode(ctx, "id", { destination_url: "https://example.com/new" });
    expect(chain.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(chain.eq).toHaveBeenCalledWith("id", "id");
    expect(chain.update).toHaveBeenCalledWith({
      destination_url: "https://example.com/new",
    });
  });
  it("aggregates list scan counts without fetching events or losing owner scope", async () => {
    const { ctx, chain } = context([
      { id: "first", name: "Menu", scan_events: [{ count: 23 }] },
      { id: "second", name: "Ticket", scan_events: [{ count: 0 }] },
    ]);
    expect(await listCodeSummaries(ctx)).toEqual([
      { id: "first", name: "Menu", recorded_scans: 23 },
      { id: "second", name: "Ticket", recorded_scans: 0 },
    ]);
    expect(chain.select).toHaveBeenCalledWith("*,scan_events(count)");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(chain.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });
  it("scopes deletion and hides records owned by others", async () => {
    const { ctx, chain } = context(null);
    await expect(deleteCode(ctx, "other")).rejects.toMatchObject({
      status: 404,
    });
    expect(chain.eq).toHaveBeenCalledWith("user_id", "owner");
    await expect(getCode(ctx, "other")).rejects.toMatchObject({ status: 404 });
    await expect(
      updateCode(ctx, "other", { status: "paused" }),
    ).rejects.toMatchObject({ status: 404 });
  });
  it("maps quota/database errors without leaking them", async () => {
    await expect(
      createCode(context(null, { code: "P0001" }).ctx, {}),
    ).rejects.toMatchObject({ status: 429 });
    await expect(
      listCodes(context(null, { code: "XX000" }).ctx),
    ).rejects.toMatchObject({ status: 503 });
  });
  it("requests aggregate analytics under the caller session", async () => {
    const { ctx, db } = context({ total: 2, last7: 1, last30: 2, daily: [] });
    expect(await scanStats(ctx)).toMatchObject({ total: 2 });
    expect(db.rpc).toHaveBeenCalledWith("scan_stats", { code_id: null });
  });
});
