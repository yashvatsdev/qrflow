import { randomBytes } from "node:crypto";
export function generateSlug() {
  return randomBytes(16).toString("base64url");
}
