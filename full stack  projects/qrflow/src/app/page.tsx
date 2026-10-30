import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Download,
  Layers3,
  Link2,
  Palette,
  RefreshCw,
  Check,
  Utensils,
  CalendarDays,
  Store,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Demo } from "@/components/marketing/demo";
const features = [
  {
    icon: Link2,
    title: "Print once. Go anywhere.",
    text: "A permanent QR link with a destination you can change. Keep the print, update what comes next.",
  },
  {
    icon: BarChart3,
    title: "Every recorded scan, in view.",
    text: "See daily activity, compare the last 7 and 30 days, and understand which codes get used.",
  },
  {
    icon: Palette,
    title: "Make it yours.",
    text: "Choose your colors, preview the result, and keep your QR easy to scan.",
  },
  {
    icon: Download,
    title: "Ready for the real world.",
    text: "Download sharp PNGs or scalable SVGs for packaging, menus, and posters.",
  },
  {
    icon: RefreshCw,
    title: "A new link. In an instant.",
    text: "Update your destination. Your original printed code stays exactly the same.",
  },
  {
    icon: Layers3,
    title: "Less managing. More doing.",
    text: "Name, find, edit, pause, and organize your QR codes in one focused workspace.",
  },
];
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
    "There is no automatic expiry in the MVP. Codes work while active and while QRFlow is available. Pausing or deleting a code disables its redirect.",
  ],
  [
    "Is QRFlow free?",
    "The MVP includes up to 100 codes and 100 management changes per day at no charge. Recorded scans are capped at 10,000 per code per UTC day; valid redirects continue beyond that cap.",
  ],
];
export default function Home() {
  return (
    <>
      <header className="site-header">
        <nav className="container nav">
          <Brand />
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#use-cases">Use cases</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            <Link className="sign-in" href="/login">
              Sign in
            </Link>
            <Link className="button primary compact" href="/login">
              Get started <ArrowUpRight size={16} />
            </Link>
          </div>
        </nav>
      </header>
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="intro-label">
              <span className="status-dot" /> YOUR NEXT LINK STARTS HERE
            </div>
            <h1>
              Create. Share.
              <br />
              Update.
              <br />
              <span>
                Without
                <br className="desktop-break" /> Reprinting.
              </span>
            </h1>
            <p>
              Create beautiful dynamic QR codes, track every scan, and update
              destinations anytime. One QR code, endless possibilities.
            </p>
            <div className="button-row">
              <Link href="/login" className="button primary large">
                Get started free <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="text-button">
                See how it works <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-assurance">
              <span>
                <Check size={14} /> No credit card
              </span>
              <span>
                <Check size={14} /> Free to get started
              </span>
            </div>
          </div>
          <Demo />
        </section>
        <div className="promise-strip">
          <div className="container">
            <span>MADE FOR WHAT’S NEXT</span>
            <p>
              Your menu changes. Your event evolves.{" "}
              <strong>Your QR code keeps up.</strong>
            </p>
            <span aria-hidden="true">↓</span>
          </div>
        </div>
        <section id="features" className="section container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SMALL CODE. BIG POSSIBILITIES.</span>
              <h2>
                Everything behind
                <br />a better QR code.
              </h2>
            </div>
            <p>
              From the first scan to your next update.
              <br />
              The tools you need, without the extra work.
            </p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="feature" key={title}>
                <span className="feature-icon">
                  <Icon size={23} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="section how-section">
          <div className="container">
            <span className="eyebrow">FROM IDEA TO OUT THERE</span>
            <h2>
              Three steps.
              <br />
              Endless next chapters.
            </h2>
            <div className="steps">
              {[
                [
                  "01",
                  "Create",
                  "Give your code a name and a destination. Pick your colors and preview it before you save.",
                ],
                [
                  "02",
                  "Share",
                  "Download a crisp PNG or SVG. Put it on your menu, packaging, poster, or business card.",
                ],
                [
                  "03",
                  "Track & update",
                  "See recorded scans. Change your destination whenever you need to. No reprinting required.",
                ],
              ].map(([n, title, text]) => (
                <article key={n}>
                  <span className="step-number">{n}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="use-cases" className="section container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OFFLINE MEETS ONLINE</span>
              <h2>
                At home in
                <br />
                your world.
              </h2>
            </div>
            <p>
              One connection between what you make
              <br />
              and where you want people to go.
            </p>
          </div>
          <div className="use-grid">
            {[
              {
                icon: Utensils,
                title: "A menu that’s always fresh.",
                label: "RESTAURANTS",
                text: "Seasonal specials change. Your table cards don’t have to.",
              },
              {
                icon: CalendarDays,
                title: "The latest, before they arrive.",
                label: "EVENTS",
                text: "Keep schedules, venues, and details one scan away.",
              },
              {
                icon: Store,
                title: "Your next customer connection.",
                label: "BUSINESSES",
                text: "Connect packaging and signage to your latest offering.",
              },
              {
                icon: Sparkles,
                title: "Everything you’re making next.",
                label: "CREATORS",
                text: "Send your audience to your newest work from the same code.",
              },
            ].map(({ icon: Icon, title, label, text }) => (
              <article className="use-card" key={label}>
                <Icon size={30} />
                <span>{label}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="pricing" className="section container pricing">
          <div>
            <span className="eyebrow">START WITH POSSIBILITY</span>
            <h2>
              Your first code.
              <br />
              On us.
            </h2>
            <p>
              One honest free plan for the MVP.
              <br />
              No subscriptions. No checkout. Just create.
            </p>
          </div>
          <article className="price-card">
            <div className="price-title">
              <h3>Free</h3>
              <span>THE MVP PLAN</span>
            </div>
            <p className="price">
              $0<span> / month</span>
            </p>
            <ul>
              {[
                "Up to 100 dynamic QR codes",
                "100 management changes per day",
                "Custom colors and live previews",
                "PNG and SVG downloads",
                "Recorded scan analytics",
                "Change, pause, or delete anytime",
              ].map((t) => (
                <li key={t}>
                  <Check size={17} />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/login" className="button primary large">
              Create your first QR code <ArrowRight size={18} />
            </Link>
            <small>
              10,000 recorded scans per code per day. No unique-visitor
              tracking.
            </small>
          </article>
        </section>
        <section id="faq" className="section container faq-section">
          <div>
            <span className="eyebrow">A FEW GOOD QUESTIONS</span>
            <h2>
              Before you
              <br />
              make your mark.
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing container">
          <span className="eyebrow">PRINT IT. THEN RETHINK IT.</span>
          <h2>
            Your next destination
            <br />
            is just a scan away.
          </h2>
          <Link href="/login" className="button primary large">
            Get started free <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer className="site-footer container">
        <div>
          <Brand />
          <p>Create. Share. Update. Without Reprinting.</p>
        </div>
        <div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/report">Report abuse</Link>
          <a href="https://github.com/yashvatsdev/qrflow">
            GitHub <ArrowUpRight size={13} />
          </a>
        </div>
        <small>© 2026 QRFlow</small>
      </footer>
    </>
  );
}
