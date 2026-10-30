export function appUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw && process.env.NODE_ENV === "production")
    throw new Error("NEXT_PUBLIC_APP_URL must be configured for production.");
  const url = new URL(raw || "http://localhost:3000");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Invalid application URL.");
  if (
    process.env.NODE_ENV === "production" &&
    (url.protocol !== "https:" ||
      ["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.hostname.endsWith(".localhost"))
  )
    throw new Error("A permanent HTTPS production origin is required.");
  return url.origin;
}
export function supabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
export function supabaseConfig() {
  if (!supabaseConfigured()) throw new Error("Supabase is not configured.");
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  };
}
