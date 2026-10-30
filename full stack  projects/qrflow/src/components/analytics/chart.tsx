"use client";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyScans } from "@/types/qr";
export function ScanChart({ daily }: { daily: DailyScans[] }) {
  const [days, setDays] = useState(30);
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>Scan activity</h2>
          <p>Recorded redirect requests · UTC</p>
        </div>
        <label className="sr-only" htmlFor="period">
          Time period
        </label>
        <select
          id="period"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`Daily recorded scans over the last ${days} days; ${daily.slice(-days).reduce((n, d) => n + d.scans, 0)} total`}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={daily.slice(-days)}
            margin={{ left: -25, right: 12, top: 20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#273444" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(5)}
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              allowDecimals={false}
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #273444",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="scans"
              name="Recorded scans"
              stroke="#60a5fa"
              fill="#3b82f6"
              fillOpacity={0.12}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="chart-data">
        <summary>View daily scan data</summary>
        <table>
          <thead>
            <tr>
              <th>Date (UTC)</th>
              <th>Recorded scans</th>
            </tr>
          </thead>
          <tbody>
            {daily.slice(-days).map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.scans}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
