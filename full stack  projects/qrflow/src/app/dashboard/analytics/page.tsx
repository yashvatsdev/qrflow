import { scanStats, userContext } from "@/lib/qr/service";
import { Suspense } from "react";
import { ScanChart } from "@/components/analytics/chart";
import { MetricCard, WorkspaceLoading } from "@/components/dashboard/workspace";
export default function Analytics() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <AnalyticsData />
    </Suspense>
  );
}
async function AnalyticsData() {
  const stats = await scanStats(await userContext());
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">FOLLOW THE CONNECTIONS</span>
          <h1>
            Scan analytics<span className="blue">.</span>
          </h1>
          <p>
            Real recorded requests. A clearer view of what’s getting scanned.
          </p>
        </div>
      </div>
      <div className="metrics three">
        {[
          ["All-time scans", stats.total],
          ["Last 7 days", stats.last7],
          ["Last 30 days", stats.last30],
        ].map(([name, value]) => (
          <MetricCard
            label={String(name)}
            value={Number(value)}
            key={name}
            kind="scans"
            note="Recorded requests · UTC"
          />
        ))}
      </div>
      <ScanChart daily={stats.daily} />
      <p className="notice">
        Recorded redirect requests may include bots and repeat scans. These are
        not unique visitors. No raw IP addresses or visitor fingerprints are
        stored. Daily charts use UTC.
      </p>
    </>
  );
}
