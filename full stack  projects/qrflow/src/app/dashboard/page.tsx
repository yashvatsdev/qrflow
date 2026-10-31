import Link from "next/link";
import { Suspense } from "react";
import { Plus, ArrowUpRight } from "lucide-react";
import { listCodeSummaries, scanStats, userContext } from "@/lib/qr/service";
import { appUrl } from "@/lib/config";
import { MetricCard, WorkspaceLoading } from "@/components/dashboard/workspace";
import { ScanChart } from "@/components/analytics/chart";
import { CodeList } from "@/components/qr/list";
export default function Overview() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <OverviewData />
    </Suspense>
  );
}
async function OverviewData() {
  const ctx = await userContext();
  const [codes, stats] = await Promise.all([
    listCodeSummaries(ctx),
    scanStats(ctx),
  ]);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LET’S MAKE CONNECTIONS</span>
          <h1>
            Your overview<span className="blue">.</span>
          </h1>
          <p>A little perspective on everything you’ve put out there.</p>
        </div>
        <Link href="/dashboard/codes/new" className="button primary">
          <Plus size={17} /> Create QR code
        </Link>
      </div>
      <div className="metrics">
        {[
          ["Total QR codes", codes.length],
          [
            "Active QR codes",
            codes.filter((c) => c.status === "active").length,
          ],
          ["Total recorded scans", stats.total],
          ["Scans in last 7 days", stats.last7],
        ].map(([label, value]) => (
          <MetricCard
            key={label}
            label={String(label)}
            value={Number(value)}
            kind={
              label === "Total QR codes"
                ? "codes"
                : label === "Active QR codes"
                  ? "active"
                  : "scans"
            }
            note={
              label === "Active QR codes"
                ? "Ready for the next scan"
                : label === "Total QR codes"
                  ? "Made in your workspace"
                  : "Recorded requests, not unique people"
            }
          />
        ))}
      </div>
      <ScanChart daily={stats.daily} />
      <div className="panel-heading recent-heading">
        <h2>Recently created</h2>
        <Link className="text-button" href="/dashboard/codes">
          View all <ArrowUpRight size={16} />
        </Link>
      </div>
      <CodeList codes={codes.slice(0, 4)} origin={appUrl()} compact />
    </>
  );
}
