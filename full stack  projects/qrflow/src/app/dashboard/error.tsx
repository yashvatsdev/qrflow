"use client";
import { AlertCircle, RefreshCw } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel empty-state dw-empty" role="alert">
      <span className="dw-empty-icon">
        <AlertCircle size={27} />
      </span>
      <h1>Couldn’t load your workspace.</h1>
      <p>
        We couldn’t retrieve your workspace data. Please try again in a moment.
      </p>
      <button onClick={reset} className="button primary">
        <RefreshCw size={15} />
        Try again
      </button>
    </section>
  );
}
