// Isolated test fixtures only. This is never imported by Next.js or deployed.
import { createRoot } from "react-dom/client";
import {
  WorkspaceShell,
  MetricCard,
} from "../../src/components/dashboard/workspace";
import { CodeList } from "../../src/components/qr/list";
import { QREditor } from "../../src/components/qr/editor";
import { CodeDetail } from "../../src/components/qr/detail";
import { ScanChart } from "../../src/components/analytics/chart";
import { defaultStyle } from "../../src/lib/validation/qr";
import type { QRCodeSummary, ScanStats } from "../../src/types/qr";
import "../../src/app/globals.css";
import "../../src/components/dashboard/workspace.css";
import "./fonts.css";

export const codes: QRCodeSummary[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "fixture-owner",
    slug: "AAAAAAAAAAAAAAAAAAAAAA",
    name: "Summer menu",
    destination_url: "https://example.com/menu",
    status: "active",
    style_config: defaultStyle,
    created_at: "2026-10-29T10:00:00Z",
    updated_at: "2026-10-29T10:00:00Z",
    recorded_scans: 23,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "fixture-owner",
    slug: "BBBBBBBBBBBBBBBBBBBBBB",
    name: "Exhibition guide",
    destination_url: "https://example.com/exhibition",
    status: "paused",
    style_config: defaultStyle,
    created_at: "2026-10-28T10:00:00Z",
    updated_at: "2026-10-28T10:00:00Z",
    recorded_scans: 8,
  },
];
const stats: ScanStats = {
  total: 31,
  last7: 12,
  last30: 31,
  daily: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, "0")}`,
    scans: i === 28 ? 23 : i === 25 ? 8 : 0,
  })),
};
const view =
  new URLSearchParams(window.location.search).get("view") || "overview";
const origin = "http://localhost:3000";
createRoot(document.getElementById("root")!).render(
  <WorkspaceShell name="QRFlow test account" email="fixture@example.com">
    <div className="page-heading">
      <div>
        <span className="eyebrow">ISOLATED COMPONENT TEST · FIXTURE DATA</span>
        <h1>
          {view === "editor"
            ? "Create a QR code"
            : view === "edit"
              ? "Edit QR code"
              : view === "detail"
                ? "Summer menu"
                : view === "list"
                  ? "My QR codes"
                  : "Your overview"}
        </h1>
        <p>UI integration fixture. No authenticated production data.</p>
      </div>
    </div>
    {view === "editor" ? (
      <QREditor origin={origin} />
    ) : view === "edit" ? (
      <QREditor origin={origin} code={codes[0]} />
    ) : view === "detail" ? (
      <CodeDetail origin={origin} code={codes[0]} stats={stats} />
    ) : view === "list" || view === "empty" ? (
      <CodeList codes={view === "empty" ? [] : codes} origin={origin} />
    ) : (
      <>
        <div className="metrics">
          <MetricCard label="Total QR codes" value={2} note="Test fixture" />
          <MetricCard
            label="Active QR codes"
            value={1}
            kind="active"
            note="Test fixture"
          />
          <MetricCard
            label="Total recorded scans"
            value={31}
            kind="scans"
            note="Test fixture"
          />
          <MetricCard
            label="Last 7 days"
            value={12}
            kind="recent"
            note="Test fixture"
          />
        </div>
        <ScanChart daily={stats.daily} />
        <div style={{ height: 24 }} />
        <CodeList codes={codes} origin={origin} compact />
      </>
    )}
  </WorkspaceShell>,
);
