"use client";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useId,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useInView,
  animate,
} from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Plus,
  Check,
  Link2,
  BarChart3,
  Palette,
  Download,
  RefreshCw,
  Power,
  ScanLine,
  Utensils,
  CalendarDays,
  Store,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { QRPreview, Downloads } from "@/components/qr/preview";
import { readableQR, defaultStyle } from "@/lib/validation/qr";
import { DEMO_QR_URL } from "./demo";
import { AmbientBackground } from "./ambient-background";
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LandingMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          defaults: { duration: 0.8, ease: "power3.out" },
        });
        timeline
          .from(".lp-header .brand, .lp-desktop-nav > *, .lp-nav-actions > *", {
            y: -12,
            opacity: 0,
            stagger: 0.045,
          })
          .from('[data-hero="eyebrow"]', { y: 12, opacity: 0 }, 0.1)
          .from(
            '[data-hero="line"]',
            { yPercent: 105, stagger: 0.12, duration: 1.1 },
            0.2,
          )
          .from('[data-hero="copy"]', { y: 20, opacity: 0 }, 0.5)
          .from('[data-hero="demo"]', { y: 30, opacity: 0, duration: 1 }, 0.65);
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          });
        });
        gsap.fromTo(
          ".lp-final-mark",
          { y: 30, rotate: -8 },
          {
            y: -30,
            rotate: 8,
            ease: "none",
            scrollTrigger: {
              trigger: ".lp-final",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );
  return (
    <MotionConfig reducedMotion="user">
      <div ref={scope} className="qrflow-landing">
        <AmbientBackground />
        <a className="lp-skip" href="#main-content">
          Skip to content
        </a>
        {children}
      </div>
    </MotionConfig>
  );
}
const navLinks = [
  ["Features", "features"],
  ["How it works", "how-it-works"],
  ["Use cases", "use-cases"],
  ["Pricing", "pricing"],
  ["FAQ", "faq"],
];
export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    function scroll() {
      setScrolled(window.scrollY > 30);
      if (window.scrollY < 30) setActive("");
    }
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    navLinks.forEach(([, id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => {
      window.removeEventListener("scroll", scroll);
      observer.disconnect();
    };
  }, []);
  function close() {
    dialog.current?.close();
    toggle.current?.focus();
  }
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1000px)");
    const change = () => {
      if (media.matches) dialog.current?.close();
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return (
    <header className={`lp-header ${scrolled ? "lp-header-scrolled" : ""}`}>
      <nav className="lp-wrap lp-nav" aria-label="Main">
        <Brand />
        <div className="lp-desktop-nav">
          {navLinks.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="lp-nav-actions">
          <Link href="/login" className="lp-login">
            Sign in
          </Link>
          <Link href="/login" className="lp-button lp-primary lp-small">
            Get started <ArrowUpRight size={15} />
          </Link>
        </div>
        <button
          ref={toggle}
          className="lp-menu-button"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          onClick={() => dialog.current?.showModal()}
        >
          <Menu size={23} />
        </button>
      </nav>
      <dialog
        ref={dialog}
        className="lp-mobile-menu"
        aria-label="Navigation"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "a[href],button:not(:disabled)",
            ),
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="lp-mobile-top">
            <Brand />
            <button onClick={close} aria-label="Close navigation">
              <X />
            </button>
          </div>
          <nav aria-label="Mobile">
            {navLinks.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={close}>
                {label}
                <ArrowUpRight size={18} />
              </a>
            ))}
            <Link href="/login" onClick={close}>
              Sign in
              <ArrowUpRight size={18} />
            </Link>
          </nav>
          <Link href="/login" className="lp-button lp-primary" onClick={close}>
            Create your free QR <ArrowUpRight size={18} />
          </Link>
        </motion.div>
      </dialog>
    </header>
  );
}

// Roving focus gives both tab groups the same arrow/Home/End keyboard behavior.
function tabKeys(
  event: KeyboardEvent,
  index: number,
  count: number,
  select: (index: number) => void,
) {
  let next = index;
  if (event.key === "ArrowRight" || event.key === "ArrowDown")
    next = (index + 1) % count;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
    next = (index + count - 1) % count;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = count - 1;
  else return;
  event.preventDefault();
  select(next);
  (
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[
      next
    ] as HTMLElement
  )?.focus();
}
const featureItems = [
  {
    title: "Dynamic destinations",
    icon: Link2,
    heading: "New destination. Same connection.",
    text: "Switch the destination of a printed QR code. Your menus, packaging, and posters stay right where they are.",
  },
  {
    title: "Scan analytics",
    icon: BarChart3,
    heading: "See the connections adding up.",
    text: "Compare recent activity with 7-day and 30-day views. Recorded requests help you see what’s getting attention.",
  },
  {
    title: "Custom QR colors",
    icon: Palette,
    heading: "A little more you.",
    text: "Choose your foreground and background. We’ll check the contrast so your design stays easy to scan.",
  },
  {
    title: "Instant updates",
    icon: RefreshCw,
    heading: "A fresh link. In a click.",
    text: "Change your plans without changing your print. Try a seasonal menu switch in this local demo.",
  },
  {
    title: "PNG & SVG exports",
    icon: Download,
    heading: "From screen to everything.",
    text: "Download a real, scannable file. PNG for everyday use, or a scalable SVG for your next big print.",
  },
  {
    title: "Active / paused",
    icon: Power,
    heading: "You’re in control.",
    text: "Pause a code when you need to. Resume it when you’re ready. Try the simulated scan in both states.",
  },
];
export function FeatureLab() {
  const id = useId();
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [range, setRange] = useState(7);
  const [foreground, setForeground] = useState<string>(defaultStyle.foreground);
  const [background, setBackground] = useState<string>(defaultStyle.background);
  const [season, setSeason] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");
  const readable = readableQR(foreground, background);
  const style = useMemo(
    () => ({
      foreground: readable ? foreground : defaultStyle.foreground,
      background: readable ? background : defaultStyle.background,
      resolution: 1024 as const,
    }),
    [readable, foreground, background],
  );
  const current = featureItems[selected];
  return (
    <div className="lp-lab" data-reveal>
      <div
        className="lp-feature-tabs"
        role="tablist"
        aria-label="Explore QRFlow features"
        aria-orientation="vertical"
      >
        {featureItems.map(({ title, icon: Icon }, i) => (
          <button
            key={title}
            id={`${id}-tab-${i}`}
            role="tab"
            aria-selected={selected === i}
            aria-controls={`${id}-panel`}
            tabIndex={selected === i ? 0 : -1}
            onKeyDown={(e) => tabKeys(e, i, featureItems.length, setSelected)}
            onClick={() => {
              setSelected(i);
              setStatus("");
            }}
          >
            <Icon size={18} />
            <span>{title}</span>
            <ArrowUpRight className="lp-tab-arrow" size={17} />
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${selected}`}
        tabIndex={0}
        className="lp-feature-panel"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <div className="lp-feature-intro">
              <span className="lp-eyebrow">
                {selected === 4
                  ? "Real files. Ready to download."
                  : "Interactive preview · no data saved"}
              </span>
              <h3>{current.heading}</h3>
              <p>{current.text}</p>
            </div>
            <div className="lp-feature-visual">
              {selected === 1 ? (
                <SampleChart range={range} setRange={setRange} />
              ) : (
                <div className="lp-feature-qr">
                  <QRPreview url={DEMO_QR_URL} style={style} />
                  <small>Scans open QRFlow on GitHub.</small>
                </div>
              )}
              <div className="lp-feature-options">
                {(selected === 0 || selected === 3) && (
                  <>
                    <span className="lp-mono">SIMULATED DESTINATION</span>
                    <div className="lp-mini-destination">
                      <Link2 size={18} />
                      <span>
                        example.com/{season ? "autumn" : "summer"}-menu
                      </span>
                      <Check size={16} />
                    </div>
                    <button
                      className="lp-button"
                      onClick={() => {
                        setSeason((v) => !v);
                        setStatus(
                          "Demo destination updated. The original code is unchanged.",
                        );
                      }}
                    >
                      <RefreshCw size={15} /> Switch to{" "}
                      {season ? "summer" : "autumn"} menu
                    </button>
                    <small>Same encoded URL. Updated demo destination.</small>
                  </>
                )}
                {(selected === 2 || selected === 4) && (
                  <>
                    <div className="lp-color-fields">
                      <label>
                        Foreground
                        <input
                          type="color"
                          aria-label="Foreground"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                        />
                        <span>{foreground}</span>
                      </label>
                      <label>
                        Background
                        <input
                          type="color"
                          aria-label="Background"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                        />
                        <span>{background}</span>
                      </label>
                    </div>
                    {!readable ? (
                      <p className="lp-error" role="alert">
                        Use dark modules on a light background with at least
                        4.5:1 contrast. Preview keeps safe colors.
                      </p>
                    ) : (
                      <p className="lp-color-valid">
                        <Check size={14} /> Contrast check passed
                      </p>
                    )}
                    {selected === 4 && (
                      <div className="lp-export">
                        <Downloads
                          url={DEMO_QR_URL}
                          name="qrflow-demo"
                          style={style}
                        />
                        <small>
                          1024px PNG · vector SVG · includes quiet zone.
                          <br />
                          {!readable
                            ? "Exports use the safe preview colors."
                            : "Exports use your selected colors."}
                        </small>
                      </div>
                    )}
                  </>
                )}
                {selected === 1 && (
                  <div className="lp-chart-note">
                    <BarChart3 size={24} />
                    <strong>Every connection tells a story.</strong>
                    <p>
                      Sample data for illustration. Recorded redirects can
                      include automated requests, and are not unique people.
                    </p>
                  </div>
                )}
                {selected === 5 && (
                  <>
                    <div
                      className={`lp-code-state ${paused ? "is-paused" : ""}`}
                    >
                      <i />
                      {paused ? "Paused" : "Active"}
                      <span>Demo code</span>
                    </div>
                    <button
                      className="lp-button"
                      onClick={() => {
                        setPaused((v) => !v);
                        setStatus("");
                      }}
                    >
                      <Power size={16} />
                      {paused ? "Resume demo code" : "Pause demo code"}
                    </button>
                    <button
                      className="lp-text-link"
                      onClick={() =>
                        setStatus(
                          paused
                            ? "Demo scan blocked. This code is paused (410)."
                            : "Simulated scan successful. An active code redirects to its destination (302).",
                        )
                      }
                    >
                      <ScanLine size={16} /> Test demo scan
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="lp-lab-status" role="status">
          {status}
        </p>
      </div>
    </div>
  );
}

const sample7 = [18, 28, 21, 42, 35, 56, 48];
const sample30 = [24, 34, 28, 44, 35, 52, 41, 62, 55, 70, 51, 65, 72, 61, 80];
function SampleChart({
  range = 7,
  setRange,
}: {
  range?: number;
  setRange?: (range: number) => void;
}) {
  const reduced = useReducedMotion();
  const data = range === 7 ? sample7 : sample30;
  const sum = range === 7 ? 248 : 1724;
  const chart = useRef<HTMLDivElement>(null);
  const visible = useInView(chart, { once: true });
  const count = useMotionValue(sum);
  const displayCount = useTransform(count, (value) =>
    Math.round(value).toLocaleString("en-US"),
  );
  useEffect(() => {
    if (!visible) return;
    count.set(0);
    const controls = animate(count, sum, {
      duration: reduced ? 0 : 0.7,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [visible, sum, reduced, count]);
  return (
    <div ref={chart} className="lp-chart">
      <div className="lp-chart-top">
        <span className="lp-mono">SAMPLE SCAN ACTIVITY</span>
        {setRange && (
          <div
            className="lp-segment"
            role="group"
            aria-label="Sample analytics range"
          >
            {[7, 30].map((n) => (
              <button
                key={n}
                aria-pressed={range === n}
                onClick={() => setRange(n)}
              >
                {n} days
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        className="lp-chart-value"
        role="group"
        aria-label={`${sum.toLocaleString("en-US")} sample recorded scans`}
        key={range}
      >
        <motion.strong
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
        >
          {displayCount}
        </motion.strong>
        <span>sample recorded scans</span>
      </div>
      <svg
        viewBox="0 0 420 150"
        role="img"
        aria-label={`${range}-day sample activity chart: ${sum} recorded scans`}
      >
        <path
          d="M0 30H420M0 80H420M0 130H420"
          stroke="#273444"
          strokeDasharray="3 5"
        />
        {data.map((n, i) => (
          <motion.rect
            key={`${range}-${i}`}
            x={i * (420 / data.length) + 4}
            y={140 - n * 1.4}
            width={420 / data.length - 9}
            height={n * 1.4}
            rx="3"
            fill={i === data.length - 1 ? "#9dc8ff" : "#3b82f6"}
            initial={{ scaleY: reduced ? 1 : 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: reduced ? 0 : i * 0.025 }}
            style={{
              transformOrigin: "center bottom",
              transformBox: "fill-box",
            }}
          />
        ))}
      </svg>
      <div className="lp-chart-axis">
        <span>{range} days ago</span>
        <span>Today</span>
      </div>
      <small>Illustrative data. Not live account analytics.</small>
    </div>
  );
}

const scenes = [
  {
    title: "Create.",
    sub: "Start with a destination.",
    text: "A link to your menu, your work, your next event. Create one dynamic QR code and make it yours.",
  },
  {
    title: "Share.",
    sub: "Give it a place in the world.",
    text: "On the table. In the window. On a ticket. Your QR code is ready for wherever your audience finds you.",
  },
  {
    title: "Update.",
    sub: "Your plans evolve. Your print stays.",
    text: "New season, new menu. Update the destination and keep every printed code working for what comes next.",
  },
  {
    title: "Track.",
    sub: "See what’s making a connection.",
    text: "Explore recorded scan activity in your dashboard. A clearer view of the codes people are finding.",
  },
];
export function ProductStory() {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)",
        () => {
          const root = scope.current!;
          const panels = gsap.utils.toArray<HTMLElement>(".lp-scene", root);
          root.dataset.pinned = "true";
          // Desktop overlays are purely visual; the full text remains in reading order.
          gsap.set(panels.slice(1), { opacity: 0, y: 42 });
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 80px",
              end: "+=2000",
              pin: true,
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });
          panels.forEach((panel, i) => {
            if (i) {
              timeline
                .to(panels[i - 1], { opacity: 0, y: -32, duration: 0.3 }, i)
                .to(panel, { opacity: 1, y: 0, duration: 0.4 }, i + 0.15);
            }
            timeline.to(
              `.lp-story-progress [data-step="${i}"]`,
              { color: "#9dc8ff", duration: 0.2 },
              i,
            );
          });
          timeline.to(
            ".lp-story-fill",
            { scaleX: 1, ease: "none", duration: 3.7 },
            0,
          );
          timeline.to({}, { duration: 0.6 });
          return () => {
            delete root.dataset.pinned;
          };
        },
      );
      return () => mm.revert();
    },
    { scope },
  );
  return (
    <section
      ref={scope}
      className="lp-story"
      id="how-it-works"
      aria-labelledby="story-heading"
    >
      <div className="lp-wrap">
        <div className="lp-story-heading">
          <span className="lp-eyebrow">One code. The whole journey.</span>
          <h2 id="story-heading">Made to keep moving.</h2>
        </div>
        <div className="lp-story-progress" aria-hidden="true">
          {scenes.map((s, i) => (
            <span key={s.title} data-step={i}>
              {s.title}
            </span>
          ))}
          <div className="lp-story-track">
            <span className="lp-story-fill" />
          </div>
        </div>
        <div className="lp-scene-stage">
          {scenes.map((s, i) => (
            <article className="lp-scene" key={s.title}>
              <div className="lp-scene-copy">
                <span className="lp-eyebrow">{s.sub}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="lp-mono">
                  {i === 3
                    ? "SAMPLE ANALYTICS · ILLUSTRATION"
                    : "ONE IDENTICAL QR THROUGH EVERY SCENE"}
                </span>
              </div>
              <div className={`lp-scene-visual lp-scene-${i}`}>
                {i === 3 ? (
                  <SampleChart />
                ) : i === 1 ? (
                  <div className="lp-menu-print">
                    <span>THE EVERYDAY</span>
                    <strong>
                      Good food.
                      <br />
                      Great company.
                    </strong>
                    <div className="lp-print-rule" />
                    <div className="lp-print-bottom">
                      <QRPreview url={DEMO_QR_URL} />
                      <p>
                        Something good
                        <br />
                        is on the menu.
                        <br />
                        <b>SCAN TO EXPLORE</b>
                      </p>
                    </div>
                    <small>Sample menu · QR opens GitHub</small>
                  </div>
                ) : (
                  <div className="lp-story-code">
                    <QRPreview url={DEMO_QR_URL} />
                    <div>
                      <span className="lp-mono">
                        {i === 0
                          ? "YOUR FIRST CONNECTION"
                          : "DESTINATION UPDATED"}
                      </span>
                      <strong>
                        example.com/{i === 0 ? "summer" : "autumn"}-menu
                      </strong>
                      <span className="lp-code-state">
                        <i />
                        Same code.{" "}
                        {i === 0 ? "Ready to share." : "Fresh destination."}
                      </span>
                    </div>
                    <small>Demo destination · actual scan opens GitHub</small>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="lp-story-scroll lp-mono">
          SCROLL TO FOLLOW THE CONNECTION <ArrowRight size={14} />
        </p>
      </div>
    </section>
  );
}

const useCases = [
  {
    name: "Restaurants",
    icon: Utensils,
    title: "Today’s special. Always current.",
    text: "Seasonal menus, daily specials, a new wine list. Update what guests discover without replacing a single table card.",
    brand: "THE EVERYDAY",
    headline: "A taste of\nsomething new.",
    detail: "SEASONAL MENU · MADE FRESH",
    destination: "example.com/menu",
    kind: "restaurant",
  },
  {
    name: "Events",
    icon: CalendarDays,
    title: "Every detail. Up to date.",
    text: "Lineups change. Venues move. Keep a single code on every poster and ticket, with the latest details one scan away.",
    brand: "AFTER HOURS",
    headline: "Meet you\nunder the lights.",
    detail: "FRIDAY · DOORS AT 7 PM",
    destination: "example.com/lineup",
    kind: "event",
  },
  {
    name: "Businesses",
    icon: Store,
    title: "Make every package a beginning.",
    text: "Connect packaging to a product guide, a new collection, or your latest offer. Give every physical touchpoint somewhere useful to go.",
    brand: "FORM & FIELD",
    headline: "Thoughtfully\nmade. For you.",
    detail: "DISCOVER YOUR NEW EVERYDAY",
    destination: "example.com/collection",
    kind: "business",
  },
  {
    name: "Creators",
    icon: Sparkles,
    title: "Your work keeps evolving.",
    text: "A new portfolio, a fresh release, your next exhibition. Let your printed cards lead to whatever you’re creating next.",
    brand: "ALEX MORGAN / STUDIO",
    headline: "Ideas into\nthe everyday.",
    detail: "SELECTED WORKS · INDEPENDENT DESIGN",
    destination: "example.com/portfolio",
    kind: "creator",
  },
];
export function UseCases() {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const item = useCases[selected];
  return (
    <div className="lp-usecases" data-reveal>
      <div className="lp-use-tabs" role="tablist" aria-label="QRFlow use cases">
        {useCases.map(({ name, icon: Icon }, i) => (
          <button
            key={name}
            id={`${id}-tab-${i}`}
            role="tab"
            aria-selected={selected === i}
            tabIndex={selected === i ? 0 : -1}
            aria-controls={`${id}-panel`}
            onKeyDown={(e) => tabKeys(e, i, 4, setSelected)}
            onClick={() => setSelected(i)}
          >
            <Icon size={17} />
            {name}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${selected}`}
        tabIndex={0}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            className="lp-use-content"
            key={selected}
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <div className={`lp-use-art lp-art-${item.kind}`}>
              <div className="lp-use-print">
                <span className="lp-print-brand">{item.brand}</span>
                <strong>{item.headline}</strong>
                <span className="lp-print-detail">{item.detail}</span>
                <div className="lp-use-code">
                  <QRPreview url={DEMO_QR_URL} />
                  <span>
                    SCAN TO DISCOVER
                    <ArrowUpRight size={16} />
                  </span>
                </div>
                <small>Illustrative design · code opens QRFlow on GitHub</small>
              </div>
            </div>
            <div className="lp-use-copy">
              <span className="lp-eyebrow">For {item.name.toLowerCase()}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="lp-use-destination">
                <Link2 size={16} />
                <span>{item.destination}</span>
                <span className="lp-badge">Example</span>
              </div>
              <Link className="lp-text-link" href="/login">
                Make your connection <ArrowUpRight size={18} />
              </Link>
              <div className="lp-carousel-controls">
                <span className="lp-mono">
                  {item.name} / {useCases.length} possibilities
                </span>
                <button
                  aria-label="Previous use case"
                  onClick={() => setSelected((v) => (v + 3) % 4)}
                >
                  <ArrowRight
                    size={18}
                    style={{ transform: "rotate(180deg)" }}
                  />
                </button>
                <button
                  aria-label="Next use case"
                  onClick={() => setSelected((v) => (v + 1) % 4)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
const faqs = [
  [
    "What makes a QR code dynamic?",
    "It points to a permanent QRFlow URL, which redirects to your current destination. You can change that destination without changing the printed code.",
  ],
  [
    "Can I change the link after printing?",
    "Yes. Edit the destination in your dashboard and the same code will send future scans to the new page.",
  ],
  [
    "What does scan tracking measure?",
    "Analytics count recorded redirect requests, including possible automated requests. They do not represent unique people. We do not store raw IP addresses or fingerprint visitors.",
  ],
  [
    "Which formats can I download?",
    "PNG at 512, 1024, or 2048 pixels, or SVG for resolution-independent printing. All codes include a quiet zone for scanning.",
  ],
  [
    "Do my QR codes expire?",
    "There is no automatic expiry in the current release. Codes work while active and while QRFlow is available. Pausing or deleting a code disables its redirect.",
  ],
  [
    "Is QRFlow free?",
    "The current release includes up to 100 codes and 100 management changes per day at no charge. Recorded scans are capped at 10,000 per code per UTC day; valid redirects continue beyond that cap.",
  ],
];
export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <div className="lp-faq" data-reveal>
      {faqs.map(([q, a], i) => (
        <div className="lp-faq-item" key={q}>
          <h3>
            <button
              aria-expanded={open === i}
              aria-controls={`${id}-${i}`}
              id={`${id}-button-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {q}
              <Plus
                size={19}
                style={{ transform: open === i ? "rotate(45deg)" : undefined }}
              />
            </button>
          </h3>
          <motion.div
            id={`${id}-${i}`}
            role="region"
            aria-labelledby={`${id}-button-${i}`}
            aria-hidden={open !== i}
            initial={false}
            animate={{
              height: open === i ? "auto" : 0,
              opacity: open === i ? 1 : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="lp-faq-answer"
          >
            <p>{a}</p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
