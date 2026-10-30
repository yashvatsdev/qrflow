import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/config";
import { DashboardNav } from "@/components/dashboard/nav";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<main className="loading-state">Opening your workspace…</main>}
    >
      <Protected>{children}</Protected>
    </Suspense>
  );
}
async function Protected({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) redirect("/login?error=configuration");
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  return (
    <div className="dashboard-shell">
      <DashboardNav />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <span>
            Your workspace <span className="muted">/ QRFlow</span>
          </span>
          <span className="account-avatar" title={user.email}>
            {(user.user_metadata.full_name || user.email || "Q")
              .slice(0, 1)
              .toUpperCase()}
          </span>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
