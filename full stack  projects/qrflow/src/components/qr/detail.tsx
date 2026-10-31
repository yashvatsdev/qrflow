"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Pencil,
  Pause,
  Play,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { QRCode, ScanStats } from "@/types/qr";
import { QRPreview, Downloads } from "./preview";
import { QREditor } from "./editor";
import { ScanChart } from "@/components/analytics/chart";
import { DeleteDialog, useFeedback } from "@/components/dashboard/workspace";

export function CodeDetail({
  code,
  origin,
  stats,
  initialEditing = false,
}: {
  code: QRCode;
  origin: string;
  stats: ScanStats;
  initialEditing?: boolean;
}) {
  const [editing, setEditing] = useState(initialEditing);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(0);
  const router = useRouter();
  const notify = useFeedback();
  const reduced = useReducedMotion();
  const id = useId();
  const [current, setCurrent] = useState(code);
  const [previous, setPrevious] = useState(code);
  if (previous !== code) {
    setPrevious(code);
    setCurrent(code);
  }
  const url = `${origin}/r/${current.slug}`;
  async function mutate(method: "PATCH" | "DELETE") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/qr/${current.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method === "PATCH"
          ? {
              body: JSON.stringify({
                status: current.status === "active" ? "paused" : "active",
              }),
            }
          : {}),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || "Request failed. Please retry.",
        );
      if (method === "DELETE") {
        setConfirm(false);
        notify("QR code and scan history deleted.");
        router.push("/dashboard/codes");
      } else {
        setCurrent(result.data);
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
      setBusy(false);
    }
  }
  if (editing)
    return (
      <>
        <button
          className="text-button dw-back-link"
          onClick={() => setEditing(false)}
        >
          <ArrowLeft size={15} />
          Back to details
        </button>
        <QREditor
          origin={origin}
          code={current}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </>
    );
  return (
    <div className="dw-detail">
      <div className="dw-detail-tabs" role="tablist" aria-label="QR details">
        {["Overview", "Analytics", "Settings"].map((name, i) => (
          <button
            key={name}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={tab === i}
            aria-controls={`${id}-panel`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % 3;
              else if (e.key === "ArrowLeft") next = (i + 2) % 3;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = 2;
              else return;
              e.preventDefault();
              setTab(next);
              (
                e.currentTarget.parentElement?.children[next] as HTMLElement
              ).focus();
            }}
          >
            {name}
            {tab === i && (
              <motion.span
                layoutId={`${id}-underline`}
                transition={{ duration: reduced ? 0 : 0.16 }}
              />
            )}
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${tab}`}
        tabIndex={0}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: reduced ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.12 }}
          >
            {tab === 0 ? (
              <>
                <div className="detail-layout">
                  <section className="panel detail-code">
                    <div className="dw-detail-qr">
                      <QRPreview url={url} style={current.style_config} />
                    </div>
                    <span className={`badge ${current.status}`}>
                      <span className="status-dot" />
                      {current.status}
                    </span>
                    <p>
                      Your permanent connection.
                      <br />
                      Update the destination, keep the code.
                    </p>
                    <Downloads
                      url={url}
                      name={current.name}
                      style={current.style_config}
                    />
                  </section>
                  <section className="panel detail-info">
                    <div className="panel-heading">
                      <h2>Code details</h2>
                      <span className="dw-subtle-tag">Dynamic QR</span>
                    </div>
                    <dl>
                      <dt>Name</dt>
                      <dd>{current.name}</dd>
                      <dt>Destination</dt>
                      <dd>
                        <a
                          href={current.destination_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {current.destination_url}
                          <ExternalLink size={12} />
                        </a>
                      </dd>
                      <dt>Permanent QR link</dt>
                      <dd className="dw-permanent-link">
                        <a
                          className="public-url"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {url}
                        </a>
                        <button
                          className="dw-icon-button"
                          aria-label="Copy permanent link"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(url);
                              setCopied(true);
                              notify("Permanent link copied.");
                            } catch {
                              setError(
                                "Could not copy. Select and copy the link above.",
                              );
                            }
                          }}
                        >
                          {copied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </dd>
                      <dt>Created</dt>
                      <dd>
                        {new Date(current.created_at).toLocaleString("en-US", {
                          timeZone: "UTC",
                        })}{" "}
                        UTC
                      </dd>
                    </dl>
                    <div className="button-row">
                      <button
                        className="button"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil size={15} />
                        Edit QR code
                      </button>
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => mutate("PATCH")}
                      >
                        {busy ? (
                          <RefreshCw size={15} className="dw-spin" />
                        ) : current.status === "active" ? (
                          <Pause size={15} />
                        ) : (
                          <Play size={15} />
                        )}{" "}
                        {current.status === "active" ? "Pause" : "Resume"}
                      </button>
                    </div>
                  </section>
                </div>
                <div className="dw-detail-stats">
                  <div>
                    <span>Total recorded scans</span>
                    <strong>{stats.total.toLocaleString("en-US")}</strong>
                  </div>
                  <div>
                    <span>Last 7 days</span>
                    <strong>{stats.last7.toLocaleString("en-US")}</strong>
                  </div>
                  <div>
                    <span>Last 30 days</span>
                    <strong>{stats.last30.toLocaleString("en-US")}</strong>
                  </div>
                  <button className="text-button" onClick={() => setTab(1)}>
                    Explore analytics
                    <ExternalLink size={14} />
                  </button>
                </div>
              </>
            ) : tab === 1 ? (
              <>
                <ScanChart daily={stats.daily} />
                <p className="dw-data-note">
                  Recorded redirects can include bots and repeat scans. They are
                  not unique visitors.
                </p>
              </>
            ) : (
              <section className="panel dw-code-settings">
                <div>
                  <h2>Destination & design</h2>
                  <p>
                    Change the link or update your QR colors. Your permanent URL
                    stays the same.
                  </p>
                  <button className="button" onClick={() => setEditing(true)}>
                    <Pencil size={15} />
                    Edit QR code
                  </button>
                </div>
                <div>
                  <h2>Availability</h2>
                  <p>
                    {current.status === "active"
                      ? "This code currently redirects visitors to its destination."
                      : "This code is paused. Scans show an unavailable page until you resume it."}
                  </p>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => mutate("PATCH")}
                  >
                    {current.status === "active" ? (
                      <Pause size={15} />
                    ) : (
                      <Play size={15} />
                    )}{" "}
                    {current.status === "active" ? "Pause" : "Resume"}
                  </button>
                </div>
                <div className="dw-danger-zone">
                  <h2>Delete QR code</h2>
                  <p>
                    Permanently remove this code and its recorded scan history.
                    Printed copies will stop working.
                  </p>
                  <button
                    className="button danger"
                    disabled={busy}
                    onClick={() => {
                      setError("");
                      setConfirm(true);
                    }}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {error && !confirm && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <DeleteDialog
        open={confirm}
        onOpenChange={setConfirm}
        name={current.name}
        busy={busy}
        error={error}
        onDelete={() => mutate("DELETE")}
      />
    </div>
  );
}
