"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import QR from "qrcode";
import { qrOptions } from "@/lib/qr/generate";
import { defaultStyle } from "@/lib/validation/qr";
import type { QRStyle } from "@/types/qr";
export function QRPreview({
  url,
  style = defaultStyle,
}: {
  url: string;
  style?: QRStyle;
}) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    QR.toDataURL(url, {
      ...qrOptions({
        foreground: style.foreground,
        background: style.background,
        resolution: 320,
      }),
      width: 320,
    })
      .then((data) => {
        if (active) {
          setSrc(data);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [url, style.foreground, style.background]);
  // Data URLs are generated locally and do not need image optimization.
  return error ? (
    <p role="alert">Unable to render this QR code.</p>
  ) : src ? (
    <Image
      unoptimized
      className="qr-image"
      src={src}
      width={256}
      height={256}
      alt="Scannable QR code"
    />
  ) : (
    <div className="qr-skeleton" aria-label="Generating QR preview" />
  );
}
export function Downloads({
  url,
  name,
  style,
}: {
  url: string;
  name: string;
  style: QRStyle;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"png" | "svg" | null>(null);
  const [message, setMessage] = useState("");
  async function download(format: "png" | "svg") {
    if (busy) return;
    setBusy(format);
    try {
      setError("");
      setMessage("");
      const data =
        format === "png"
          ? await QR.toDataURL(url, qrOptions(style))
          : URL.createObjectURL(
              new Blob(
                [await QR.toString(url, { ...qrOptions(style), type: "svg" })],
                { type: "image/svg+xml" },
              ),
            );
      const a = document.createElement("a");
      a.href = data;
      a.download = `${name.replace(/[^a-z0-9_-]/gi, "-") || "qrflow"}.${format}`;
      a.click();
      setMessage(`${format.toUpperCase()} download started.`);
      if (format === "svg") setTimeout(() => URL.revokeObjectURL(data), 1000);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <div className="button-row">
        <button
          className="button primary"
          disabled={!!busy}
          onClick={() => download("png")}
        >
          {busy === "png" ? "Preparing PNG…" : "Download PNG"}
        </button>
        <button
          className="button"
          disabled={!!busy}
          onClick={() => download("svg")}
        >
          {busy === "svg" ? "Preparing SVG…" : "Download SVG"}
        </button>
      </div>
      {message && (
        <p role="status" className="dw-download-feedback">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </>
  );
}
