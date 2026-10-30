import { appUrl } from "@/lib/config";
import { idSchema, updateSchema } from "@/lib/validation/qr";
import { body, failure, json, sameOrigin } from "@/lib/security/http";
import { deleteCode, getCode, updateCode, userContext } from "@/lib/qr/service";
type C = { params: Promise<{ id: string }> };
export async function GET(_: Request, c: C) {
  try {
    return json(
      await getCode(await userContext(), idSchema.parse((await c.params).id)),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(r: Request, c: C) {
  try {
    sameOrigin(r, appUrl());
    const ctx = await userContext();
    return json(
      await updateCode(
        ctx,
        idSchema.parse((await c.params).id),
        updateSchema(appUrl()).parse(await body(r)),
      ),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(r: Request, c: C) {
  try {
    sameOrigin(r, appUrl());
    await deleteCode(await userContext(), idSchema.parse((await c.params).id));
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
