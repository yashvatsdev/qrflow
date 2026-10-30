"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { Brand } from "@/components/brand";
const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/codes", "My QR codes", QrCode],
  ["/dashboard/analytics", "Analytics", ChartNoAxesCombined],
  ["/dashboard/settings", "Settings", Settings],
] as const;
export function DashboardNav() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <Brand />
      <span className="sidebar-label">WORKSPACE</span>
      <nav>
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={
              (href === "/dashboard" ? path === href : path.startsWith(href))
                ? "active"
                : ""
            }
          >
            <Icon size={19} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="plan-note">
          <span className="status-dot" /> Free plan
          <p>100 codes. Endless possibilities.</p>
          <Link href="/dashboard/codes/new">
            Create a QR code <ArrowUpRight size={15} />
          </Link>
        </div>
        <form action="/auth/logout" method="post">
          <button className="logout">
            <LogOut size={18} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
