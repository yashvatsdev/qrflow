import { Suspense } from "react";
import { Brand } from "@/components/brand";
import { supabaseConfigured } from "@/lib/config";
import { connection } from "next/server";
export default function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="auth-page">
      <Brand />
      <Suspense fallback={<p>Loading sign in…</p>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const { error } = await searchParams;
  const messages: Record<string, string> = {
    configuration: "Sign-in is awaiting the operator’s Supabase configuration.",
    oauth:
      "Google sign-in could not start. Please try again or contact the operator.",
    callback: "Sign-in was canceled or the link expired. Please try again.",
  };
  return (
    <div className="auth-card">
      <span className="eyebrow">YOUR NEXT LINK STARTS HERE</span>
      <h1>
        Make your
        <br />
        next connection.
      </h1>
      <p>Sign in to create, customize, and manage your dynamic QR codes.</p>
      {error && (
        <p className="notice" role="alert">
          {messages[error] || "Sign-in could not complete. Please try again."}
        </p>
      )}
      <form action="/auth/login" method="post">
        <button className="button google-button" type="submit">
          <span aria-hidden="true">G</span> Continue with Google <span>↗</span>
        </button>
      </form>
      {!supabaseConfigured() && (
        <p className="notice">
          Authentication is awaiting the operator’s Supabase configuration.
        </p>
      )}
      <p className="muted">
        If sign in fails or was canceled, please try again. Your QR codes stay
        in your account.
      </p>
      <a href="/privacy">How we use your data</a>
    </div>
  );
}
