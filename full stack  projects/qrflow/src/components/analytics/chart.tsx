"use client";
import { useId, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartNoAxesCombined, ArrowUpRight } from "lucide-react";
import type { DailyScans } from "@/types/qr";

export function ScanChart({ daily }: { daily: DailyScans[] }) {
  const [days, setDays] = useState(30);
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const data = useMemo(() => daily.slice(-days), [daily, days]);
  const total = data.reduce((sum, day) => sum + day.scans, 0);
  return (
    <section
      className="panel chart-panel dw-chart-panel"
      aria-labelledby={`${id}-title`}
    >
      <div className="panel-heading">
        <div>
          <h2 id={`${id}-title`}>Scan activity</h2>
          <p>Recorded redirect requests · UTC</p>
        </div>
        <div className="dw-range-control" role="group" aria-label="Time period">
          {[7, 30].map((n) => (
            <button
              key={n}
              aria-pressed={days === n}
              onClick={() => setDays(n)}
            >
              Last {n} days
            </button>
          ))}
        </div>
      </div>
      <div className="dw-chart-summary" aria-live="polite">
        <strong>{total.toLocaleString("en-US")}</strong>
        <span>recorded scans in this period</span>
        <span className="dw-chart-key">
          <i />
          Recorded scans
        </span>
      </div>
      {total ? (
        <div
          className="chart dw-chart"
          aria-label={`Daily recorded scans over the last ${days} days; ${total} total`}
        >
          <ResponsiveContainer width="100%" height={260} minWidth={0}>
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: -16, right: 12, top: 15, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#273444"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => v.slice(5)}
                stroke="#9ca3af"
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tick={{ fontSize: 10 }}
                tickMargin={12}
              />
              <YAxis
                allowDecimals={false}
                stroke="#9ca3af"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #344358",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#f9fafb",
                }}
                labelStyle={{ color: "#9ca3af", marginBottom: 6 }}
                itemStyle={{ color: "#9dc8ff" }}
                labelFormatter={(label) => `${label} · UTC`}
                cursor={{ stroke: "#52637a", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                name="Recorded scans"
                stroke="#9dc8ff"
                fill={`url(#${id}-fill)`}
                strokeWidth={2}
                activeDot={{
                  r: 4,
                  strokeWidth: 3,
                  stroke: "#111827",
                  fill: "#9dc8ff",
                }}
                isAnimationActive={!reduced}
                animationDuration={220}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="dw-chart-hint">
            Focus the chart and use the arrow keys to explore. Daily values are
            also available below.
          </p>
        </div>
      ) : (
        <div className="dw-chart-empty">
          <span className="dw-empty-icon">
            <ChartNoAxesCombined size={27} />
          </span>
          <strong>No scans in this period yet</strong>
          <p>
            When someone scans an active code, recorded activity will appear
            here.
          </p>
          <span>Try another range or share your QR code.</span>
        </div>
      )}
      <details className="chart-data">
        <summary>
          View daily scan data <ArrowUpRight size={14} />
        </summary>
        <div className="dw-table-scroll">
          <table>
            <caption className="sr-only">
              Daily recorded scan counts for the last {days} days, UTC
            </caption>
            <thead>
              <tr>
                <th scope="col">Date (UTC)</th>
                <th scope="col">Recorded scans</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.scans.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
