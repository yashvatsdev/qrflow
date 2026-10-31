"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import {
  LayoutDashboard,
  QrCode,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Brand } from "@/components/brand";

type Notice = { message: string; tone: "success" | "error"; id: number };
const Feedback = createContext<
  (message: string, tone?: Notice["tone"]) => void
>(() => {});
export function useFeedback() {
  return useContext(Feedback);
}

const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/codes", "My QR codes", QrCode],
  ["/dashboard/analytics", "Analytics", ChartNoAxesCombined],
  ["/dashboard/settings", "Settings", Settings],
] as const;

export function WorkspaceShell({
  children,
  name,
  email,
}: {
  children: ReactNode;
  name: string;
  email: string;
}) {
  const path = usePathname();
  const router = useRouter();
  const [refreshing, refresh] = useTransition();
  const reduced = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeId = useRef(0);
  const logout = useRef<HTMLFormElement>(null);
  const notify = useCallback(
    (message: string, tone: Notice["tone"] = "success") =>
      setNotice({ message, tone, id: ++noticeId.current }),
    [],
  );
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  const section = path.includes("/codes/new")
    ? "Creation studio"
    : path.startsWith("/dashboard/codes/")
      ? "QR details"
      : links.find(([href]) => href === path)?.[1] || "Workspace";
  function navigation(mobile = false) {
    return (
      <>
        <div className="dw-brand-row">
          <Brand />
          {!mobile && (
            <motion.button
              whileTap={reduced ? undefined : { scale: 0.94 }}
              className="dw-icon-button dw-collapse"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
            </motion.button>
          )}
        </div>
        <span className="dw-sidebar-label">WORKSPACE</span>
        <nav aria-label={mobile ? "Mobile workspace" : "Workspace"}>
          {links.map(([href, label, Icon]) => {
            const active =
              href === "/dashboard" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={collapsed && !mobile ? label : undefined}
                onClick={() => setDrawer(false)}
              >
                {active && (
                  <motion.span
                    className="dw-nav-active"
                    layoutId={mobile ? "dw-drawer-active" : "dw-sidebar-active"}
                    transition={{ duration: reduced ? 0 : 0.18 }}
                  />
                )}
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="dw-sidebar-bottom">
          <div className="dw-plan">
            <span>
              <i />
              Free workspace
            </span>
            <p>
              Up to 100 dynamic codes.
              <br />A little room for your next idea.
            </p>
            <Link href="/dashboard/codes/new" onClick={() => setDrawer(false)}>
              Create a QR code <ArrowUpRight size={14} />
            </Link>
          </div>
          <Link href="/" className="dw-website" aria-label="Visit QRFlow">
            <ArrowUpRight size={17} />
            <span>Visit QRFlow</span>
          </Link>
        </div>
      </>
    );
  }
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Feedback.Provider value={notify}>
        <div
          className="dashboard-shell dw-workspace"
          data-collapsed={collapsed}
        >
          <a href="#workspace-content" className="dw-skip">
            Skip to workspace content
          </a>
          <aside className="dw-sidebar">{navigation()}</aside>
          <div className="dw-main">
            <header className="dw-topbar">
              <Dialog.Root open={drawer} onOpenChange={setDrawer}>
                <Dialog.Trigger
                  className="dw-icon-button dw-drawer-trigger"
                  aria-label="Open workspace navigation"
                >
                  <MenuIcon size={21} />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop className="dw-backdrop" />
                  <Dialog.Popup className="dw-drawer">
                    <Dialog.Title className="sr-only">
                      Workspace navigation
                    </Dialog.Title>
                    <Dialog.Close
                      className="dw-icon-button dw-drawer-close"
                      aria-label="Close workspace navigation"
                    >
                      <X size={20} />
                    </Dialog.Close>
                    {navigation(true)}
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>
              <div className="dw-breadcrumb">
                <span>Workspace</span>
                <span>/</span>
                <strong>{section}</strong>
              </div>
              <div className="dw-topbar-right">
                <button
                  className="dw-icon-button"
                  aria-label="Refresh workspace data"
                  title="Refresh workspace data"
                  disabled={refreshing}
                  onClick={() => refresh(() => router.refresh())}
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "dw-spin" : undefined}
                  />
                </button>
                <span className="dw-plan-tag">Free plan</span>
                <Menu.Root>
                  <Menu.Trigger
                    className="dw-profile-trigger"
                    aria-label="Open profile menu"
                  >
                    <span className="account-avatar">
                      {name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="dw-profile-name">{name}</span>
                    <ChevronDown size={14} />
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner sideOffset={10} align="end">
                      <Menu.Popup className="dw-profile-menu">
                        <div className="dw-profile-summary">
                          <strong>{name}</strong>
                          <span>{email}</span>
                        </div>
                        <Menu.Item
                          render={<Link href="/dashboard/settings" />}
                          className="dw-menu-item"
                        >
                          <Settings size={16} />
                          Profile & settings
                        </Menu.Item>
                        <Menu.Item
                          className="dw-menu-item"
                          onClick={() => logout.current?.requestSubmit()}
                        >
                          <LogOut size={16} />
                          Sign out
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
              </div>
              <form ref={logout} action="/auth/logout" method="post" hidden />
            </header>
            <main
              id="workspace-content"
              className="dashboard-content dw-content"
            >
              <motion.div
                key={path}
                initial={{ opacity: 1, y: reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.18 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
          <div
            className="dw-notifications"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence>
              {notice && (
                <motion.div
                  key={notice.id}
                  className={`dw-toast ${notice.tone}`}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : 6 }}
                >
                  {notice.tone === "success" ? (
                    <Check size={17} />
                  ) : (
                    <AlertCircle size={17} />
                  )}
                  <span>{notice.message}</span>
                  <button
                    className="dw-icon-button"
                    aria-label="Dismiss notification"
                    onClick={() => setNotice(null)}
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Feedback.Provider>
    </MotionConfig>
  );
}

export function MetricCard({
  label,
  value,
  note,
  kind = "codes",
}: {
  label: string;
  value: number;
  note?: string;
  kind?: "codes" | "active" | "scans" | "recent";
}) {
  const reduced = useReducedMotion();
  const count = useMotionValue(value);
  const previous = useRef(value);
  const display = useTransform(count, (n) =>
    Math.round(n).toLocaleString("en-US"),
  );
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    const controls = animate(count, value, { duration: reduced ? 0 : 0.4 });
    return () => controls.stop();
  }, [value, reduced, count]);
  const Icon =
    kind === "codes" ? QrCode : kind === "active" ? Check : ChartNoAxesCombined;
  return (
    <motion.article
      className="metric dw-metric"
      whileHover={reduced ? undefined : { y: -2 }}
    >
      <div>
        <span>{label}</span>
        <span className={`dw-metric-icon ${kind}`}>
          <Icon size={16} />
        </span>
      </div>
      <strong>
        <span className="sr-only">{value.toLocaleString("en-US")}</span>
        <motion.span aria-hidden="true">{display}</motion.span>
      </strong>
      {note && <span className="metric-note">{note}</span>}
    </motion.article>
  );
}

export function DeleteDialog({
  open,
  onOpenChange,
  name,
  busy,
  error,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  busy: boolean;
  error: string;
  onDelete: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
      disablePointerDismissal={busy}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="dw-backdrop" />
        <Dialog.Popup
          className="dw-dialog"
          render={
            <motion.div
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
            />
          }
        >
          <span className="dw-dialog-icon">
            <AlertCircle size={23} />
          </span>
          <Dialog.Title>Delete this QR code?</Dialog.Title>
          <Dialog.Description>
            “{name}” and its scan history will be permanently deleted. Every
            printed copy will stop working. This cannot be undone.
          </Dialog.Description>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="button-row">
            <Dialog.Close className="button" disabled={busy}>
              Cancel
            </Dialog.Close>
            <button
              className="button danger"
              disabled={busy}
              onClick={onDelete}
            >
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function WorkspaceLoading() {
  return (
    <div className="dw-loading" role="status" aria-label="Loading workspace">
      <span className="sr-only">Loading your workspace…</span>
      <div className="dw-loading-heading dw-skeleton" />
      <div className="metrics" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div className="dw-skeleton dw-loading-metric" key={i} />
        ))}
      </div>
      <div className="dw-skeleton dw-loading-chart" aria-hidden="true" />
      <div className="dw-loading-rows" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div className="dw-skeleton" key={i} />
        ))}
      </div>
    </div>
  );
}

export function EmptyAction() {
  return (
    <Link className="button primary" href="/dashboard/codes/new">
      <Plus size={16} />
      Create your first QR code
    </Link>
  );
}
