import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/config";
import {
  WorkspaceShell,
  WorkspaceLoading,
} from "@/components/dashboard/workspace";
import "@/components/dashboard/workspace.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="dw-auth-loading">
          <WorkspaceLoading />
        </main>
      }
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
    <WorkspaceShell
      name={
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : user.email || "QRFlow member"
      }
      email={user.email || ""}
    >
      {children}
    </WorkspaceShell>
  );
}
