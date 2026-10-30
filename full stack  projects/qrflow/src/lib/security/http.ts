import { ZodError } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(
    { data },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      {
        error: {
          code: "VALIDATION",
          message: error.issues[0]?.message || "Invalid request.",
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  const e =
    error instanceof HttpError
      ? error
      : new HttpError(
          503,
          "UNAVAILABLE",
          "The service is temporarily unavailable. Please try again.",
        );
  return Response.json(
    { error: { code: e.code, message: e.message } },
    { status: e.status, headers: { "Cache-Control": "no-store" } },
  );
}
export function sameOrigin(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin)
    throw new HttpError(
      403,
      "ORIGIN",
      "This request must originate from QRFlow.",
    );
}
export async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HttpError(415, "CONTENT_TYPE", "Send application/json.");
  // Bound the stream itself, rather than trusting a client-supplied Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "BODY", "A JSON body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new HttpError(413, "BODY_LIMIT", "Request exceeds 8 KB.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "JSON", "Invalid JSON.");
  }
}
