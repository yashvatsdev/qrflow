"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Pause, Play, Trash2, Copy, Check } from "lucide-react";
import type { QRCode } from "@/types/qr";
import { QRPreview, Downloads } from "./preview";
import { QREditor } from "./editor";
export function CodeDetail({ code, origin }: { code: QRCode; origin: string }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const url = `${origin}/r/${code.slug}`;
  async function mutate(method: "PATCH" | "DELETE") {
    setBusy(true);
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
        throw new Error(result.error?.message || "Request failed.");
      if (method === "DELETE") router.push("/dashboard/codes");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }
  if (editing)
    return (
      <>
        <button className="text-button" onClick={() => setEditing(false)}>
          ← Back to details
        </button>
        <QREditor origin={origin} code={code} />
      </>
    );
  return (
    <div className="detail-layout">
      <section className="panel detail-code">
        <QRPreview url={url} style={code.style_config} />
        <Downloads url={url} name={code.name} style={code.style_config} />
      </section>
      <section className="panel detail-info">
        <div className="panel-heading">
          <h2>Code details</h2>
          <span className={`badge ${code.status}`}>{code.status}</span>
        </div>
        <dl>
          <dt>Destination</dt>
          <dd>
            <a
              href={code.destination_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {code.destination_url}
            </a>
          </dd>
          <dt>Permanent QR link</dt>
          <dd>
            <a
              className="public-url"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              {url}
            </a>
            <button
              className="icon-button"
              aria-label="Copy permanent link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                } catch {
                  setError("Could not copy. Select and copy the link above.");
                }
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </dd>
          <dt>Created</dt>
          <dd>
            {new Date(code.created_at).toLocaleString("en-US", {
              timeZone: "UTC",
            })}{" "}
            UTC
          </dd>
        </dl>
        <div className="button-row">
          <button className="button" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit QR code
          </button>
          <button
            disabled={busy}
            className="button"
            onClick={() => mutate("PATCH")}
          >
            {code.status === "active" ? (
              <Pause size={15} />
            ) : (
              <Play size={15} />
            )}{" "}
            {code.status === "active" ? "Pause" : "Resume"}
          </button>
          <button className="button danger" onClick={() => setConfirm(true)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
        {confirm && (
          <div
            className="delete-confirm"
            role="alertdialog"
            aria-label="Confirm QR deletion"
          >
            <h3>Delete this QR code?</h3>
            <p>
              The printed code will stop working. This also permanently deletes
              its scan history.
            </p>
            <div className="button-row">
              <button
                disabled={busy}
                className="button danger"
                onClick={() => mutate("DELETE")}
              >
                {busy ? "Deleting…" : "Delete permanently"}
              </button>
              <button className="button" onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
