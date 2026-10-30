import { appUrl } from "@/lib/config";
import { createSchema } from "@/lib/validation/qr";
import { body, failure, json, sameOrigin } from "@/lib/security/http";
import { createCode, listCodes, userContext } from "@/lib/qr/service";
export async function GET() {
  try {
    return json(await listCodes(await userContext()));
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request, appUrl());
    const ctx = await userContext();
    const input = createSchema(appUrl()).parse(await body(request));
    return json(await createCode(ctx, input), 201);
  } catch (e) {
    return failure(e);
  }
}
