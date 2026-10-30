import { describe, it, expect, vi } from "vitest";
import QR from "qrcode";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import {
  validDestination,
  createSchema,
  updateSchema,
  defaultStyle,
  readableQR,
  slugSchema,
} from "@/lib/validation/qr";
import { generateSlug } from "@/lib/qr/slug";
import { resolveRedirect } from "@/lib/qr/redirect";
import { body, failure, sameOrigin, HttpError } from "@/lib/security/http";
import { qrOptions, qrSvg } from "@/lib/qr/generate";
const origin = "https://qrflow.example";
describe("destination validation", () => {
  it.each([
    "https://example.com/menu",
    "http://example.com",
    "https://example.com/a?q=1",
  ])("accepts %s", (url) => expect(validDestination(url, origin)).toBe(true));
  it.each([
    "javascript:alert(1)",
    "data:text/html,bad",
    "ftp://example.com",
    "https://user:pass@example.com",
    "/relative",
    "https://example.com/\n",
    "https://qrflow.example/r/abc",
    "https://qrflow.example/%72/abc",
    "https://qrflow.example//r/abc",
    "https:\\evil.test",
  ])("rejects %s", (url) => expect(validDestination(url, origin)).toBe(false));
  it("rejects malformed and oversized URLs", () => {
    expect(validDestination("not a url", origin)).toBe(false);
    expect(validDestination("https://a.com/" + "a".repeat(2048), origin)).toBe(
      false,
    );
  });
  it("requires valid name, URL, style and rejects unknown fields", () => {
    expect(
      createSchema(origin).safeParse({
        name: "",
        destination_url: "https://example.com",
      }).success,
    ).toBe(false);
    expect(
      createSchema(origin).safeParse({
        name: "Menu",
        destination_url: "https://example.com",
        user_id: "attacker",
      }).success,
    ).toBe(false);
    expect(updateSchema(origin).safeParse({}).success).toBe(false);
    expect(updateSchema(origin).safeParse({ slug: "replace" }).success).toBe(
      false,
    );
    expect(updateSchema(origin).safeParse({ status: "deleted" }).success).toBe(
      false,
    );
  });
  it("enforces dark modules, contrast, and bounded resolution", () => {
    expect(readableQR("#000000", "#ffffff")).toBe(true);
    expect(readableQR("#ffffff", "#000000")).toBe(false);
    expect(
      createSchema(origin).safeParse({
        name: "Menu",
        destination_url: "https://example.com",
        style_config: { ...defaultStyle, resolution: 20000 },
      }).success,
    ).toBe(false);
  });
});
describe("QR engine", () => {
  it("does not reset custom style during status-only updates", () => {
    expect(updateSchema(origin).parse({ status: "paused" })).toEqual({
      status: "paused",
    });
  });
  it("creates unpredictable URL-safe 128-bit slugs", () => {
    const slugs = new Set(Array.from({ length: 500 }, generateSlug));
    expect(slugs.size).toBe(500);
    for (const slug of slugs)
      expect(slugSchema.safeParse(slug).success).toBe(true);
  });
  it("produces a decodable PNG containing the permanent URL", async () => {
    const url = `${origin}/r/${generateSlug()}`;
    const png = PNG.sync.read(await QR.toBuffer(url, qrOptions(defaultStyle)));
    expect(
      jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
    ).toBe(url);
    expect(png.width).toBe(1024);
  });
  it("exports an SVG with a quiet zone", async () => {
    expect(
      await qrSvg(`${origin}/r/${generateSlug()}`, defaultStyle),
    ).toContain("<svg");
    expect(qrOptions(defaultStyle).margin).toBe(4);
  });
});
describe("public redirect", () => {
  const slug = generateSlug();
  const qr = {
    id: "test",
    status: "active",
    destination_url: "https://example.com/current",
  };
  it("uses 302, prevents caching, and records a scan", async () => {
    const record = vi.fn();
    const result = await resolveRedirect(slug, origin, {
      find: async () => qr,
      record,
    });
    expect(result.status).toBe(302);
    expect(result.headers.get("location")).toBe(qr.destination_url);
    expect(result.headers.get("cache-control")).toContain("no-store");
    expect(record).toHaveBeenCalledWith(qr.id);
  });
  it("keeps the slug working after destination updates", async () => {
    let destination = "https://example.com/old";
    const resolver = {
      find: async () => ({ ...qr, destination_url: destination }),
      record: async () => {},
    };
    expect(
      (await resolveRedirect(slug, origin, resolver)).headers.get("location"),
    ).toBe(destination);
    destination = "https://example.com/new";
    expect(
      (await resolveRedirect(slug, origin, resolver)).headers.get("location"),
    ).toBe(destination);
  });
  it("does not redirect paused or unknown codes", async () => {
    const record = vi.fn();
    expect(
      (
        await resolveRedirect(slug, origin, {
          find: async () => ({ ...qr, status: "paused" }),
          record,
        })
      ).status,
    ).toBe(410);
    expect(
      (await resolveRedirect(slug, origin, { find: async () => null, record }))
        .status,
    ).toBe(404);
    expect(record).not.toHaveBeenCalled();
  });
  it("rejects malformed slugs before querying", async () => {
    const find = vi.fn();
    expect(
      (await resolveRedirect("bad", origin, { find, record: vi.fn() })).status,
    ).toBe(404);
    expect(find).not.toHaveBeenCalled();
  });
  it("survives analytics failure and excludes HEAD scans", async () => {
    const record = vi.fn().mockRejectedValue(new Error("database unavailable"));
    expect(
      (await resolveRedirect(slug, origin, { find: async () => qr, record }))
        .status,
    ).toBe(302);
    record.mockClear();
    await resolveRedirect(
      slug,
      origin,
      { find: async () => qr, record },
      false,
    );
    expect(record).not.toHaveBeenCalled();
  });
  it("handles lookup failure and unsafe stored destinations", async () => {
    expect(
      (
        await resolveRedirect(slug, origin, {
          find: async () => {
            throw new Error("offline");
          },
          record: vi.fn(),
        })
      ).status,
    ).toBe(503);
    expect(
      (
        await resolveRedirect(slug, origin, {
          find: async () => ({ ...qr, destination_url: `${origin}/r/${slug}` }),
          record: vi.fn(),
        })
      ).status,
    ).toBe(410);
  });
});
describe("request boundary", () => {
  it("rejects cross-origin mutations", () => {
    expect(() =>
      sameOrigin(
        new Request(origin, { headers: { origin: "https://evil.example" } }),
        origin,
      ),
    ).toThrow(HttpError);
  });
  it("handles bad JSON and streaming limits", async () => {
    await expect(
      body(
        new Request(origin, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{bad",
        }),
      ),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      body(
        new Request(origin, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ x: "x".repeat(9000) }),
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("does not leak internal errors", async () => {
    const response = failure(new Error("secret SQL internals"));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret");
  });
});
