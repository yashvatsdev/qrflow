import { notFound } from "next/navigation";
import { appUrl } from "@/lib/config";
import { getCode, scanStats, userContext } from "@/lib/qr/service";
import { idSchema } from "@/lib/validation/qr";
import { HttpError } from "@/lib/security/http";
import { CodeDetail } from "@/components/qr/detail";
import { ScanChart } from "@/components/analytics/chart";
export default async function Details({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const ctx = await userContext();
  let code;
  try {
    code = await getCode(ctx, id);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
  const stats = await scanStats(ctx, id);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ONE CODE. ALWAYS CURRENT.</span>
          <h1>{code.name}</h1>
          <p>
            {stats.total.toLocaleString()} total recorded scans ·{" "}
            {stats.last7.toLocaleString()} in the last 7 days
          </p>
        </div>
      </div>
      <CodeDetail code={code} origin={appUrl()} />
      <ScanChart daily={stats.daily} />
    </>
  );
}
