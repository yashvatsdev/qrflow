"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { QRPreview, Downloads } from "./preview";
import { createSchema, defaultStyle } from "@/lib/validation/qr";
import type { QRCode, QRStyle } from "@/types/qr";
export function QREditor({
  origin,
  code,
  onDone,
}: {
  origin: string;
  code?: QRCode;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(code?.name || "");
  const [destination, setDestination] = useState(code?.destination_url || "");
  const [style, setStyle] = useState<QRStyle>(
    code?.style_config || defaultStyle,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<QRCode | null>(null);
  const publicUrl = `${origin}/r/${(saved || code)?.slug || "preview-not-a-published-code"}`;
  function validate() {
    const result = createSchema(origin).safeParse({
      name,
      destination_url: destination,
      style_config: style,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return false;
    }
    setError("");
    return true;
  }
  async function save() {
    if (!validate()) return;
    setBusy(true);
    try {
      const response = await fetch(code ? `/api/qr/${code.id}` : "/api/qr", {
        method: code ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          destination_url: destination,
          style_config: style,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || "Could not save your QR code.",
        );
      setSaved(result.data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  if (saved)
    return (
      <section className="panel saved-panel">
        <span className="success-icon">
          <Check size={28} />
        </span>
        <h2>
          {code ? "Your QR code is updated." : "Your next connection is ready."}
        </h2>
        <p>The printed code always points to this permanent QRFlow link.</p>
        <QRPreview url={publicUrl} style={saved.style_config} />
        <a
          className="public-url"
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
        >
          {publicUrl}
        </a>
        <Downloads
          url={publicUrl}
          name={saved.name}
          style={saved.style_config}
        />
        <button
          className="text-button"
          onClick={() =>
            onDone ? onDone() : router.push(`/dashboard/codes/${saved.id}`)
          }
        >
          View QR details <ArrowRight size={16} />
        </button>
      </section>
    );
  return (
    <div className="editor-layout">
      <section className="panel editor-panel">
        <ol className="editor-steps">
          {["Destination", "Design", "Review"].map((title, i) => (
            <li
              key={title}
              className={step === i ? "current" : step > i ? "complete" : ""}
            >
              <span>{step > i ? <Check size={13} /> : i + 1}</span>
              {title}
            </li>
          ))}
        </ol>
        {step === 0 ? (
          <div className="form-step">
            <span className="feature-icon">
              <Link2 size={23} />
            </span>
            <h2>Where are we going?</h2>
            <p>Give your QR code a name and a destination.</p>
            <label htmlFor="qr-name">QR code name</label>
            <input
              id="qr-name"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Restaurant menu"
              autoComplete="off"
            />
            <label htmlFor="destination">Destination URL</label>
            <input
              id="destination"
              type="url"
              maxLength={2048}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://your-website.com"
            />
            <small>
              You can change this later without reprinting your code.
            </small>
          </div>
        ) : step === 1 ? (
          <div className="form-step">
            <h2>A little more you.</h2>
            <p>Dark modules on a light background work best.</p>
            <div className="color-fields">
              <label>
                Foreground
                <input
                  aria-label="Foreground color"
                  type="color"
                  value={style.foreground}
                  onChange={(e) =>
                    setStyle({ ...style, foreground: e.target.value })
                  }
                />
                <span>{style.foreground}</span>
              </label>
              <label>
                Background
                <input
                  aria-label="Background color"
                  type="color"
                  value={style.background}
                  onChange={(e) =>
                    setStyle({ ...style, background: e.target.value })
                  }
                />
                <span>{style.background}</span>
              </label>
            </div>
            <label htmlFor="resolution">PNG download resolution</label>
            <select
              id="resolution"
              value={style.resolution}
              onChange={(e) =>
                setStyle({ ...style, resolution: Number(e.target.value) })
              }
            >
              <option value={512}>512 × 512 px</option>
              <option value={1024}>1024 × 1024 px</option>
              <option value={2048}>2048 × 2048 px</option>
            </select>
            <small>A four-module quiet zone is always included.</small>
          </div>
        ) : (
          <div className="form-step">
            <h2>Ready for what’s next?</h2>
            <p>
              Check your details. Your permanent link is assigned when you
              create the code.
            </p>
            <dl>
              <dt>Name</dt>
              <dd>{name}</dd>
              <dt>Destination</dt>
              <dd>{destination}</dd>
              <dt>Download size</dt>
              <dd>
                {style.resolution} × {style.resolution} px
              </dd>
              <dt>Public URL</dt>
              <dd>{code ? publicUrl : "Created securely when you save"}</dd>
            </dl>
          </div>
        )}
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <div className="editor-actions">
          {step > 0 ? (
            <button
              className="button"
              disabled={busy}
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              className="button primary"
              onClick={() => {
                if (validate()) setStep(step + 1);
              }}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button className="button primary" disabled={busy} onClick={save}>
              {busy ? "Saving…" : code ? "Save changes" : "Create QR code"}{" "}
              <Check size={17} />
            </button>
          )}
        </div>
      </section>
      <aside className="panel preview-panel">
        <span className="eyebrow">
          {code ? "YOUR PERMANENT CODE" : "DESIGN PREVIEW"}
        </span>
        <div className="preview-stage">
          <QRPreview url={publicUrl} style={style} />
        </div>
        <h3>{name || "Your next connection"}</h3>
        <p>
          {code
            ? "Same QR code. Whatever comes next."
            : "A design preview. Create the code to get your permanent scannable link."}
        </p>
        <span className="badge active">
          <span className="status-dot" /> Dynamic QR code
        </span>
      </aside>
    </div>
  );
}
