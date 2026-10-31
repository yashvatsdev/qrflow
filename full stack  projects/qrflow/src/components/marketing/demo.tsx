"use client";
import { useState, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Link2, ScanLine } from "lucide-react";
import { QRPreview } from "@/components/qr/preview";
import { validDestination } from "@/lib/validation/qr";

// Marketing codes encode this fixed URL, never the simulated input.
export const DEMO_QR_URL = "https://github.com/yashvatsdev/qrflow";
export function Demo() {
  const id = useId();
  const reduced = useReducedMotion();
  const [input, setInput] = useState("https://example.com/summer-menu");
  const [destination, setDestination] = useState(input);
  const [scans, setScans] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  function update(e: React.FormEvent) {
    e.preventDefault();
    if (!validDestination(input, window.location.origin)) {
      setError(
        "Enter a valid HTTP or HTTPS URL without spaces or credentials.",
      );
      return;
    }
    setError("");
    setDestination(input);
    setRevision((v) => v + 1);
    setMessage("Destination updated. Your QR code stays the same.");
  }
  return (
    <div
      className="lp-demo"
      id="live-demo"
      aria-label="Interactive QR demonstration"
    >
      <div className="lp-window-bar">
        <span>
          <i /> LIVE PLAYGROUND
        </span>
        <span className="lp-demo-label">Local demo</span>
      </div>
      <div className="lp-demo-body">
        <div className="lp-code-side">
          <div className="lp-qr-frame">
            <QRPreview url={DEMO_QR_URL} />
            <motion.svg
              key={scans}
              className="lp-scan-beam"
              viewBox="0 0 240 240"
              aria-hidden="true"
              initial={{ opacity: 0, y: -70 }}
              animate={
                scans && !reduced
                  ? { opacity: [0, 1, 1, 0], y: [-70, 0, 70, 70] }
                  : { opacity: 0 }
              }
              transition={{ duration: 0.8 }}
            >
              <path d="M12 120H228" stroke="#06b6d4" strokeWidth="2" />
            </motion.svg>
            <span className="lp-qr-corner" />
          </div>
          <span className="lp-mono">THE ORIGINAL. ALWAYS.</span>
          <small>Actual scans open QRFlow on GitHub.</small>
        </div>
        <svg className="lp-connector" viewBox="0 0 56 100" aria-hidden="true">
          <path
            d="M0 50H56M48 43l8 7-8 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <motion.path
            key={revision}
            d="M0 50H56"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 0.6 }}
          />
        </svg>
        <div className="lp-demo-controls">
          <form onSubmit={update} noValidate>
            <label htmlFor={id}>
              Destination URL <span>Try your own link</span>
            </label>
            <input
              id={id}
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-describedby={`${id}-help`}
              aria-invalid={!!error}
              maxLength={2048}
            />
            <button className="lp-button lp-primary" type="submit">
              Update destination <ArrowUpRight size={16} />
            </button>
            <p id={`${id}-help`} className={error ? "lp-error" : "lp-caption"}>
              {error || "A simulated redirect. No account or data saved."}
            </p>
          </form>
          <div className="lp-redirect">
            <span className="lp-mono">
              <Link2 size={12} /> CURRENT DEMO DESTINATION
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={destination}
                initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {destination}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="lp-simulate">
            <button
              className="lp-text-link"
              onClick={() => {
                setScans((v) => v + 1);
                setMessage(
                  `Simulated scan successful. Would redirect to ${destination}`,
                );
              }}
            >
              <ScanLine size={16} /> Simulate scan
            </button>
            <span>
              <b>{scans}</b> demo scans
            </span>
          </div>
        </div>
      </div>
      <div className="lp-demo-status" role="status">
        <Check size={13} />
        <span>
          {message ||
            "Change the destination. Watch the code stay exactly the same."}
        </span>
      </div>
    </div>
  );
}
