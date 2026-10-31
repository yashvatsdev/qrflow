"use client";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Link2,
  Palette,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { QRPreview, Downloads } from "./preview";
import {
  createSchema,
  defaultStyle,
  validDestination,
  styleSchema,
  readableQR,
} from "@/lib/validation/qr";
import { useFeedback } from "@/components/dashboard/workspace";
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
  const notify = useFeedback();
  const reduced = useReducedMotion();
  const id = useId();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(code?.name || "");
  const [destination, setDestination] = useState(code?.destination_url || "");
  const [style, setStyle] = useState<QRStyle>(
    code?.style_config || defaultStyle,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<QRCode | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const publicUrl = `${origin}/r/${(saved || code)?.slug || "preview-not-a-published-code"}`;
  const readable = readableQR(style.foreground, style.background);
  // Invalid draft colors never turn the live preview into an unreadable code.
  const previewStyle = readable ? style : defaultStyle;
  function validateStep() {
    if (step === 0 && (!name.trim() || name.trim().length > 80)) {
      setError("Give your QR code a name between 1 and 80 characters.");
      return false;
    }
    if (step === 0 && !validDestination(destination, origin)) {
      setError(
        "Enter a valid HTTP or HTTPS destination outside this redirect service.",
      );
      return false;
    }
    if (step === 1 && !styleSchema.safeParse(style).success) {
      setError(
        "Use dark modules on a light background with at least 4.5:1 contrast.",
      );
      return false;
    }
    setError("");
    return true;
  }
  function go(next: number) {
    setError("");
    setStep(next);
  }
  async function save() {
    if (busy) return;
    const validation = createSchema(origin).safeParse({
      name,
      destination_url: destination,
      style_config: style,
    });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(code ? `/api/qr/${code.id}` : "/api/qr", {
        method: code ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message ||
            "Could not save your QR code. Please try again.",
        );
      setSaved(result.data);
      notify(
        code
          ? "QR code updated. Its permanent link is unchanged."
          : "Your QR code is ready to share.",
      );
      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not save. Please try again.";
      setError(message);
      notify(message, "error");
    } finally {
      setBusy(false);
    }
  }
  if (saved)
    return (
      <motion.section
        className="panel saved-panel dw-saved"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className="success-icon"
          initial={{ scale: reduced ? 1 : 0.85 }}
          animate={{ scale: 1 }}
        >
          <Check size={27} />
        </motion.span>
        <div>
          <span className="eyebrow">READY FOR THE REAL WORLD</span>
          <h2>
            {code
              ? "Your QR code is updated."
              : "Your next connection is ready."}
          </h2>
          <p>The printed code always points to this permanent QRFlow link.</p>
        </div>
        <div className="dw-saved-code">
          <QRPreview url={publicUrl} style={saved.style_config} />
        </div>
        <a
          className="public-url"
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
        >
          {publicUrl}
          <ExternalLink size={13} />
        </a>
        <Downloads
          url={publicUrl}
          name={saved.name}
          style={saved.style_config}
        />
        <button
          className="button primary"
          onClick={() =>
            onDone ? onDone() : router.push(`/dashboard/codes/${saved.id}`)
          }
        >
          View QR details
          <ArrowRight size={16} />
        </button>
      </motion.section>
    );
  return (
    <div className="editor-layout dw-studio">
      <section className="panel editor-panel">
        <ol className="editor-steps" aria-label="Creation progress">
          {["Destination", "Design", "Review"].map((label, i) => (
            <li
              key={label}
              className={step === i ? "current" : step > i ? "complete" : ""}
              aria-current={step === i ? "step" : undefined}
            >
              <span>{step > i ? <Check size={12} /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) {
              if (validateStep()) go(step + 1);
            } else void save();
          }}
          noValidate
          aria-busy={busy}
        >
          <fieldset disabled={busy} className="dw-editor-fieldset">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                className="form-step"
                initial={{ opacity: 0, x: reduced ? 0 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : -6 }}
                transition={{ duration: reduced ? 0 : 0.14 }}
                onAnimationComplete={() => title.current?.focus()}
              >
                <span className="dw-studio-step-icon">
                  {step === 0 ? (
                    <Link2 size={20} />
                  ) : step === 1 ? (
                    <Palette size={20} />
                  ) : (
                    <ShieldCheck size={20} />
                  )}
                </span>
                <h2 ref={title} tabIndex={-1}>
                  {step === 0
                    ? "Where are we going?"
                    : step === 1
                      ? "A little more you."
                      : "Ready for what’s next?"}
                </h2>
                <p>
                  {step === 0
                    ? "Start with a name you’ll recognize and the link you want to share."
                    : step === 1
                      ? "Your brand, with a little breathing room. Keep dark modules on a light background."
                      : code
                        ? "Review your changes. Your permanent QR link stays the same."
                        : "Check your details. We’ll securely assign your permanent link when you save."}
                </p>
                {step === 0 ? (
                  <>
                    <label htmlFor={`${id}-name`}>QR code name</label>
                    <input
                      id={`${id}-name`}
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Restaurant menu"
                      autoComplete="off"
                    />
                    <div className="dw-field-meta">
                      <span>A clear name keeps your workspace organized.</span>
                      <span>{name.length}/80</span>
                    </div>
                    <label htmlFor={`${id}-destination`}>Destination URL</label>
                    <input
                      id={`${id}-destination`}
                      type="url"
                      maxLength={2048}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="https://your-website.com"
                      autoComplete="url"
                      aria-describedby={`${id}-destination-help`}
                    />
                    <small id={`${id}-destination-help`}>
                      You can change this later without reprinting your code.
                    </small>
                  </>
                ) : step === 1 ? (
                  <>
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
                    <p
                      className={
                        readable ? "dw-contrast-good" : "dw-contrast-error"
                      }
                      role="status"
                    >
                      {readable ? (
                        <Check size={14} />
                      ) : (
                        <ShieldCheck size={14} />
                      )}{" "}
                      {readable
                        ? "Contrast check passed. Ready to scan."
                        : "Contrast is too low. Preview uses safe colors until you fix it."}
                    </p>
                    <label htmlFor={`${id}-resolution`}>
                      PNG download resolution
                    </label>
                    <select
                      id={`${id}-resolution`}
                      value={style.resolution}
                      onChange={(e) =>
                        setStyle({
                          ...style,
                          resolution: Number(e.target.value),
                        })
                      }
                    >
                      <option value={512}>512 × 512 px</option>
                      <option value={1024}>1024 × 1024 px</option>
                      <option value={2048}>2048 × 2048 px</option>
                    </select>
                    <small>
                      PNG for everyday use. SVG for any print size. A
                      four-module quiet zone is always included.
                    </small>
                  </>
                ) : (
                  <dl className="dw-review">
                    <dt>Name</dt>
                    <dd>{name}</dd>
                    <dt>Destination</dt>
                    <dd>{destination}</dd>
                    <dt>Download size</dt>
                    <dd>
                      {style.resolution} × {style.resolution} px + vector SVG
                    </dd>
                    <dt>Colors</dt>
                    <dd>
                      <i style={{ background: style.foreground }} />
                      <i style={{ background: style.background }} />
                      {style.foreground} / {style.background}
                    </dd>
                    <dt>Permanent URL</dt>
                    <dd>
                      {code ? publicUrl : "Created securely when you save"}
                    </dd>
                  </dl>
                )}
              </motion.div>
            </AnimatePresence>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <div className="editor-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="button"
                  onClick={() => go(step - 1)}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              ) : (
                <span className="dw-step-count">Step {step + 1} of 3</span>
              )}
              <button type="submit" className="button primary">
                {busy ? (
                  <>
                    <RefreshCw size={15} className="dw-spin" />
                    Saving…
                  </>
                ) : step < 2 ? (
                  <>
                    Continue
                    <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    {code ? "Save changes" : "Create QR code"}
                    <Check size={15} />
                  </>
                )}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      <aside className="panel preview-panel dw-live-preview">
        <div className="dw-preview-heading">
          <span className="eyebrow">
            {code ? "YOUR PERMANENT CODE" : "LIVE DESIGN PREVIEW"}
          </span>
          <span className="dw-preview-live">
            <i />
            Live
          </span>
        </div>
        <div className="preview-stage">
          <QRPreview url={publicUrl} style={previewStyle} />
        </div>
        <h3>{name || "Your next connection"}</h3>
        <p>
          {code
            ? "Same QR code. Whatever comes next."
            : "A design preview. Save to get your permanent, scannable link."}
        </p>
        <span className="badge active">
          <span className="status-dot" />
          Dynamic QR code
        </span>
        <div className="dw-preview-destination">
          <span>
            <Link2 size={13} />
            DESTINATION
          </span>
          <strong>{destination || "Your destination will appear here"}</strong>
        </div>
        <div className="dw-preview-specs">
          <span>
            Format<b>PNG + SVG</b>
          </span>
          <span>
            PNG size<b>{style.resolution}px</b>
          </span>
          <span>
            Quiet zone<b>4 modules</b>
          </span>
        </div>
        {step === 2 && (
          <button
            className="button primary dw-preview-save"
            disabled={busy}
            onClick={save}
          >
            {busy ? "Saving…" : code ? "Save changes" : "Create QR code"}
            <Check size={15} />
          </button>
        )}
        <small>
          Destination changes never alter an existing code’s permanent URL.
        </small>
      </aside>
    </div>
  );
}
