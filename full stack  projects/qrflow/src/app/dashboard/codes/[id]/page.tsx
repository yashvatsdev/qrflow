import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WorkspaceLoading } from "@/components/dashboard/workspace";
import { appUrl } from "@/lib/config";
import { getCode, scanStats, userContext } from "@/lib/qr/service";
import { idSchema } from "@/lib/validation/qr";
import { HttpError } from "@/lib/security/http";
import { CodeDetail } from "@/components/qr/detail";
export default function Details(props: Parameters<typeof DetailsData>[0]) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <DetailsData {...props} />
    </Suspense>
  );
}
async function DetailsData({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
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
      <CodeDetail
        code={code}
        origin={appUrl()}
        stats={stats}
        initialEditing={(await searchParams).edit === "1"}
      />
    </>
  );
}
