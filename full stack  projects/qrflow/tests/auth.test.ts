import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { exchange, oauth, logout } = vi.hoisted(() => ({
  exchange: vi.fn(),
  oauth: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: exchange,
      signInWithOAuth: oauth,
      signOut: logout,
    },
  }),
}));
import { GET as callback } from "@/app/auth/callback/route";
import { POST as login } from "@/app/auth/login/route";
import { POST as signout } from "@/app/auth/logout/route";
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://qrflow.example");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test");
  vi.clearAllMocks();
});
describe("OAuth boundaries", () => {
  it("exchanges a PKCE code and ignores external next destinations", async () => {
    exchange.mockResolvedValue({ error: null });
    const result = await callback(
      new Request(
        "https://qrflow.example/auth/callback?code=pkce&next=https://evil.example",
      ),
    );
    expect(exchange).toHaveBeenCalledWith("pkce");
    expect(result.headers.get("location")).toBe(
      "https://qrflow.example/dashboard",
    );
  });
  it("routes failed or missing callbacks to a safe login URL", async () => {
    exchange.mockResolvedValue({ error: { message: "invalid" } });
    expect(
      (
        await callback(
          new Request("https://qrflow.example/auth/callback?code=bad"),
        )
      ).headers.get("location"),
    ).toBe("https://qrflow.example/login?error=callback");
  });
  it("requires same-origin login and logout posts", async () => {
    const r = new Request("https://qrflow.example/auth/login", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });
    expect((await login(r)).status).toBe(403);
    expect((await signout(r)).status).toBe(403);
    expect(oauth).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });
  it("starts Google PKCE against the canonical callback", async () => {
    oauth.mockResolvedValue({
      data: { url: "https://project.supabase.co/auth/v1/authorize" },
      error: null,
    });
    const r = await login(
      new Request("https://qrflow.example/auth/login", {
        method: "POST",
        headers: { origin: "https://qrflow.example" },
      }),
    );
    expect(r.status).toBe(303);
    expect(oauth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://qrflow.example/auth/callback",
        skipBrowserRedirect: true,
      },
    });
  });
});
