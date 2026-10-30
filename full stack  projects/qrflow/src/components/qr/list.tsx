"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, QrCode, ArrowUpRight } from "lucide-react";
import type { QRCode } from "@/types/qr";
export function CodeList({
  codes,
  compact = false,
}: {
  codes: QRCode[];
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = codes.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      `${c.name} ${c.destination_url}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="panel code-list">
      {!compact && (
        <div className="list-tools">
          <div className="search-field">
            <Search size={18} />
            <label className="sr-only" htmlFor="search">
              Search QR codes
            </label>
            <input
              id="search"
              placeholder="Search your QR codes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="sr-only" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      )}
      {filtered.length ? (
        <div>
          {filtered.map((c) => (
            <Link
              className="code-row"
              key={c.id}
              href={`/dashboard/codes/${c.id}`}
            >
              <span className="code-row-icon">
                <QrCode size={25} />
              </span>
              <div className="code-row-name">
                <strong>{c.name}</strong>
                <span>{c.destination_url}</span>
              </div>
              <span className={`badge ${c.status}`}>
                <span className="status-dot" />
                {c.status}
              </span>
              <time dateTime={c.created_at}>
                {new Date(c.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </time>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <QrCode size={40} />
          <h2>
            {codes.length
              ? "No matching QR codes"
              : "Your next connection starts here."}
          </h2>
          <p>
            {codes.length
              ? "Try a different search or status."
              : "Create your first QR code and give your ideas somewhere to go."}
          </p>
          {!codes.length && (
            <Link className="button primary" href="/dashboard/codes/new">
              Create your first QR code
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
