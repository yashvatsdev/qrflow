"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel empty-state">
      <h1>Couldn’t load your workspace.</h1>
      <p>Your data is safe. Please try again in a moment.</p>
      <button onClick={reset} className="button primary">
        Try again
      </button>
    </section>
  );
}
