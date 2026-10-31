import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));
vi.mock("@/lib/config", () => ({
  supabaseConfig: () => ({
    url: "https://example.supabase.co",
    key: "test-publishable-key",
  }),
}));
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";

describe("request-time Supabase client", () => {
  beforeEach(() => vi.resetAllMocks());
  it("does not initialize session handling while request rendering is suspended", async () => {
    let release!: () => void;
    vi.mocked(connection).mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    const jar = { getAll: vi.fn(() => []), set: vi.fn() };
    vi.mocked(cookies).mockResolvedValue(
      jar as unknown as Awaited<ReturnType<typeof cookies>>,
    );
    const client = { auth: {} };
    vi.mocked(createServerClient).mockReturnValue(
      client as ReturnType<typeof createServerClient>,
    );
    const pending = createClient();
    expect(connection).toHaveBeenCalledOnce();
    expect(cookies).not.toHaveBeenCalled();
    expect(createServerClient).not.toHaveBeenCalled();
    release();
    expect(await pending).toBe(client);
    expect(cookies).toHaveBeenCalledOnce();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "test-publishable-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });
});
