"use client";
import Link from "next/link";
import { useState, useMemo, useId } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Search,
  QrCode,
  ArrowUpRight,
  Pencil,
  Pause,
  Play,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import type { QRCodeSummary } from "@/types/qr";
import { QRPreview, Downloads } from "./preview";
import {
  DeleteDialog,
  EmptyAction,
  useFeedback,
} from "@/components/dashboard/workspace";

export function CodeList({
  codes,
  origin,
  compact = false,
}: {
  codes: QRCodeSummary[];
  origin: string;
  compact?: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const notify = useFeedback();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [rows, setRows] = useState(codes);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<QRCodeSummary | null>(null);
  const [download, setDownload] = useState<string | null>(null);
  const [previous, setPrevious] = useState(codes);
  if (previous !== codes) {
    setPrevious(codes);
    setRows(codes);
  }
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (c) =>
            (status === "all" || c.status === status) &&
            `${c.name} ${c.destination_url}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "scans"
              ? b.recorded_scans - a.recorded_scans
              : sort === "oldest"
                ? a.created_at.localeCompare(b.created_at)
                : b.created_at.localeCompare(a.created_at),
        ),
    [rows, status, query, sort],
  );
  async function mutate(code: QRCodeSummary, method: "PATCH" | "DELETE") {
    if (busy) return;
    setBusy(code.id);
    setError("");
    try {
      const response = await fetch(`/api/qr/${code.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method === "PATCH"
          ? {
              body: JSON.stringify({
                status: code.status === "active" ? "paused" : "active",
              }),
            }
          : {}),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || "Could not update this code. Please retry.",
        );
      if (method === "DELETE") {
        setConfirm(null);
        setRows((previous) => previous.filter((c) => c.id !== code.id));
        notify("QR code and its scan history deleted.");
      } else {
        setRows((previous) =>
          previous.map((c) =>
            c.id === code.id ? { ...c, ...result.data } : c,
          ),
        );
        notify(
          `QR code ${result.data.status === "paused" ? "paused" : "resumed"}.`,
        );
      }
      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Request failed. Please retry.";
      setError(message);
      notify(message, "error");
    } finally {
      setBusy(null);
    }
  }
  return (
    <section
      className="panel code-list dw-code-list"
      aria-label={compact ? "Recent QR codes" : "QR code management"}
    >
      {!compact && (
        <div className="dw-list-toolbar">
          <div className="search-field">
            <Search size={17} />
            <label className="sr-only" htmlFor={`${id}-search`}>
              Search QR codes
            </label>
            <input
              id={`${id}-search`}
              placeholder="Search by name or destination…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                aria-label="Clear search"
                className="dw-icon-button"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            )}
          </div>
          <div className="dw-list-filters">
            <SlidersHorizontal size={15} />
            <label className="sr-only" htmlFor={`${id}-status`}>
              Status
            </label>
            <select
              id={`${id}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
            <label className="sr-only" htmlFor={`${id}-sort`}>
              Sort QR codes
            </label>
            <select
              id={`${id}-sort`}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
              <option value="scans">Most scanned</option>
            </select>
          </div>
        </div>
      )}
      {error && !confirm && (
        <div className="dw-inline-error" role="alert">
          <span>{error}</span>
          <button
            className="text-button"
            onClick={() => {
              setError("");
              router.refresh();
            }}
          >
            <RefreshCw size={14} />
            Refresh list
          </button>
        </div>
      )}
      {filtered.length ? (
        <>
          <div className="dw-table-head" aria-hidden="true">
            <span>QR code / destination</span>
            <span>Status</span>
            <span>Scans</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          <motion.ul
            className="dw-code-rows"
            layout={reduced ? false : "position"}
          >
            <AnimatePresence initial={false}>
              {filtered.map((c) => (
                <motion.li
                  className="dw-code-item"
                  key={c.id}
                  layout={reduced ? false : "position"}
                  initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
                  transition={{ duration: reduced ? 0 : 0.18 }}
                >
                  <div className="dw-code-row">
                    <Link
                      href={`/dashboard/codes/${c.id}`}
                      className="dw-code-identity"
                    >
                      <span className="dw-code-thumb">
                        <QRPreview
                          url={`${origin}/r/${c.slug}`}
                          style={c.style_config}
                        />
                      </span>
                      <span>
                        <strong>{c.name}</strong>
                        <span className="dw-code-destination">
                          {c.destination_url}
                        </span>
                      </span>
                    </Link>
                    <span className={`badge ${c.status}`}>
                      <span className="status-dot" />
                      {c.status}
                    </span>
                    <span className="dw-row-scans">
                      <strong>
                        {c.recorded_scans.toLocaleString("en-US")}
                      </strong>
                      <span> recorded scans</span>
                    </span>
                    <time dateTime={c.created_at}>
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                    <div className="dw-row-actions">
                      <Link
                        className="dw-icon-button"
                        href={`/dashboard/codes/${c.id}?edit=1`}
                        aria-label={`Edit ${c.name}`}
                        title="Edit QR code"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        className="dw-icon-button"
                        disabled={!!busy}
                        onClick={() => mutate(c, "PATCH")}
                        aria-label={`${c.status === "active" ? "Pause" : "Resume"} ${c.name}`}
                        title={c.status === "active" ? "Pause" : "Resume"}
                      >
                        {busy === c.id ? (
                          <RefreshCw size={15} className="dw-spin" />
                        ) : c.status === "active" ? (
                          <Pause size={15} />
                        ) : (
                          <Play size={15} />
                        )}
                      </button>
                      <button
                        className="dw-icon-button"
                        onClick={() =>
                          setDownload(download === c.id ? null : c.id)
                        }
                        aria-expanded={download === c.id}
                        aria-label={`Downloads for ${c.name}`}
                        title="Downloads"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                      {!compact && (
                        <button
                          className="dw-icon-button dw-danger-icon"
                          disabled={!!busy}
                          aria-label={`Delete ${c.name}`}
                          title="Delete QR code"
                          onClick={() => {
                            setError("");
                            setConfirm(c);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {download === c.id && (
                      <motion.div
                        className="dw-row-downloads"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduced ? 0 : 0.18 }}
                      >
                        <span>Print-ready files for {c.name}</span>
                        <Downloads
                          url={`${origin}/r/${c.slug}`}
                          name={c.name}
                          style={c.style_config}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          <div className="dw-list-footer" role="status">
            {filtered.length} of {rows.length}{" "}
            {rows.length === 1 ? "code" : "codes"}
            <span>
              {compact ? "Your newest connections" : "All dates shown in UTC"}
            </span>
          </div>
        </>
      ) : (
        <div className="empty-state dw-empty">
          <span className="dw-empty-icon">
            <QrCode size={28} />
          </span>
          <h2>
            {rows.length
              ? "No matching QR codes"
              : "Your next connection starts here."}
          </h2>
          <p>
            {rows.length
              ? "Try a different name, destination, or status."
              : "Create your first dynamic code. Share it once, then keep its destination up to date."}
          </p>
          {!rows.length ? (
            <EmptyAction />
          ) : (
            <button
              className="button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear search & filters
            </button>
          )}
        </div>
      )}
      <DeleteDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        name={confirm?.name || ""}
        busy={!!busy}
        error={error}
        onDelete={() => {
          if (confirm) void mutate(confirm, "DELETE");
        }}
      />
    </section>
  );
}
