import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { userContext, createCode, listCodes } = vi.hoisted(() => ({
  userContext: vi.fn(),
  createCode: vi.fn(),
  listCodes: vi.fn(),
}));
vi.mock("@/lib/qr/service", () => ({ userContext, createCode, listCodes }));
import { POST, GET } from "@/app/api/qr/route";
import { HttpError } from "@/lib/security/http";
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://qrflow.example");
  vi.clearAllMocks();
});
describe("QR API", () => {
  it("denies unauthenticated access before listing data", async () => {
    userContext.mockRejectedValue(
      new HttpError(401, "UNAUTHENTICATED", "Please sign in."),
    );
    expect((await GET()).status).toBe(401);
    expect(listCodes).not.toHaveBeenCalled();
  });
  it("validates bad inputs before inserting a record", async () => {
    userContext.mockResolvedValue({ user: { id: "owner" } });
    const result = await POST(
      new Request("https://qrflow.example/api/qr", {
        method: "POST",
        headers: {
          origin: "https://qrflow.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Bad",
          destination_url: "javascript:alert(1)",
        }),
      }),
    );
    expect(result.status).toBe(400);
    expect(createCode).not.toHaveBeenCalled();
  });
  it("creates valid input with a structured 201 response", async () => {
    const ctx = { user: { id: "owner" } };
    userContext.mockResolvedValue(ctx);
    createCode.mockResolvedValue({ id: "new" });
    const result = await POST(
      new Request("https://qrflow.example/api/qr", {
        method: "POST",
        headers: {
          origin: "https://qrflow.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Menu",
          destination_url: "https://example.com/menu",
        }),
      }),
    );
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ data: { id: "new" } });
    expect(createCode).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ name: "Menu" }),
    );
  });
});
