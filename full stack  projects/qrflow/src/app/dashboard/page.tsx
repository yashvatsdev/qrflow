import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { listCodes, scanStats, userContext } from "@/lib/qr/service";
import { ScanChart } from "@/components/analytics/chart";
import { CodeList } from "@/components/qr/list";
export default async function Overview() {
  const ctx = await userContext();
  const [codes, stats] = await Promise.all([listCodes(ctx), scanStats(ctx)]);
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
          <article className="metric" key={label}>
            <span>{label}</span>
            <strong>{Number(value).toLocaleString()}</strong>
            <span className="metric-note">
              {label === "Active QR codes"
                ? "Ready for the next scan"
                : label === "Total QR codes"
                  ? "Made in your workspace"
                  : "Recorded requests, not unique people"}
            </span>
          </article>
        ))}
      </div>
      <ScanChart daily={stats.daily} />
      <div className="panel-heading recent-heading">
        <h2>Recently created</h2>
        <Link className="text-button" href="/dashboard/codes">
          View all <ArrowUpRight size={16} />
        </Link>
      </div>
      <CodeList codes={codes.slice(0, 4)} compact />
    </>
  );
}
