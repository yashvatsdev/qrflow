import { z } from "zod";

export function validDestination(input: string, origin: string): boolean {
  try {
    if (input.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(input))
      return false;
    const url = new URL(input);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return false;
    // No QRFlow destination may point back into its own redirect service.
    const path = decodeURIComponent(url.pathname)
      .replace(/\/+/g, "/")
      .toLowerCase();
    if (
      url.origin === new URL(origin).origin &&
      (path === "/r" || path.startsWith("/r/"))
    )
      return false;
    return !!url.hostname;
  } catch {
    return false;
  }
}
function luminance(hex: string) {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
export function readableQR(foreground: string, background: string) {
  return (luminance(background) + 0.05) / (luminance(foreground) + 0.05) >= 4.5;
}
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const styleSchema = z
  .object({
    foreground: color,
    background: color,
    resolution: z.union([z.literal(512), z.literal(1024), z.literal(2048)]),
  })
  .strict()
  .refine(
    (s) => readableQR(s.foreground, s.background),
    "Use dark modules on a light background with at least 4.5:1 contrast.",
  );
export const defaultStyle = {
  foreground: "#0b0f14",
  background: "#ffffff",
  resolution: 1024,
} as const;
export function createSchema(origin: string) {
  return z
    .object({
      name: z.string().trim().min(1).max(80),
      destination_url: z
        .string()
        .max(2048)
        .refine(
          (v) => validDestination(v, origin),
          "Enter a valid HTTP or HTTPS URL outside this redirect service.",
        ),
      style_config: styleSchema.default(defaultStyle),
    })
    .strict();
}
export function updateSchema(origin: string) {
  return createSchema(origin)
    .partial()
    .extend({
      style_config: styleSchema.optional(),
      status: z.enum(["active", "paused"]).optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, "Provide at least one field.");
}
export const idSchema = z.uuid();
export const slugSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);
