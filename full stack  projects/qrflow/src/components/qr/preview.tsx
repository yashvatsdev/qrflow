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
    QR.toDataURL(url, { ...qrOptions(style), width: 320 })
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
  }, [url, style]);
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
  async function download(format: "png" | "svg") {
    try {
      setError("");
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
      if (format === "svg") setTimeout(() => URL.revokeObjectURL(data), 1000);
    } catch {
      setError("Download failed. Please try again.");
    }
  }
  return (
    <>
      <div className="button-row">
        <button className="button primary" onClick={() => download("png")}>
          Download PNG
        </button>
        <button className="button" onClick={() => download("svg")}>
          Download SVG
        </button>
      </div>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </>
  );
}
