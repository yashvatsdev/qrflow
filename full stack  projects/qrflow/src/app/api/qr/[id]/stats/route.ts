import { idSchema } from "@/lib/validation/qr";
import { failure, json } from "@/lib/security/http";
import { scanStats, userContext } from "@/lib/qr/service";
export async function GET(_: Request, c: { params: Promise<{ id: string }> }) {
  try {
    return json(
      await scanStats(await userContext(), idSchema.parse((await c.params).id)),
    );
  } catch (e) {
    return failure(e);
  }
}
