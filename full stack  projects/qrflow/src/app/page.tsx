import Link from "next/link";
import { ArrowUpRight, Check, ArrowDown } from "lucide-react";
import { Brand } from "@/components/brand";
import { Demo } from "@/components/marketing/demo";
import {
  LandingMotion,
  MarketingNav,
  FeatureLab,
  ProductStory,
  UseCases,
  FAQ,
} from "@/components/marketing/experience";
import "@/components/marketing/landing.css";

export default function Home() {
  return (
    <LandingMotion>
      <MarketingNav />
      <main id="main-content">
        <section className="lp-hero lp-wrap" aria-labelledby="hero-heading">
          <div className="lp-hero-top" data-hero="eyebrow">
            <span className="lp-eyebrow">
              <i /> A small code. A new possibility.
            </span>
            <span className="lp-mono lp-hero-aside">
              BUILT FOR WHAT COMES NEXT
            </span>
          </div>
          <h1 id="hero-heading">
            <span className="lp-line">
              <span data-hero="line">Create. Share. Update.</span>
            </span>
            <span className="lp-line lp-ice">
              <span data-hero="line">Without Reprinting.</span>
            </span>
          </h1>
          <div className="lp-hero-bottom">
            <div className="lp-hero-copy" data-hero="copy">
              <p>
                Your next menu. Your next launch. Your next big idea. One
                dynamic QR code that moves with you.
              </p>
              <div className="lp-actions">
                <Link className="lp-button lp-primary" href="/login">
                  Create your free QR <ArrowUpRight size={18} />
                </Link>
                <a className="lp-text-link" href="#live-demo">
                  Try it below <ArrowDown size={16} />
                </a>
              </div>
              <span className="lp-caption">
                Free to start. No card. No reprints.
              </span>
            </div>
            <div data-hero="demo">
              <Demo />
            </div>
          </div>
          <div className="lp-hero-foot">
            <span className="lp-mono">THE LINK CHANGES. THE CODE DOESN’T.</span>
            <a href="#features" aria-label="Explore features">
              <ArrowDown size={18} />
            </a>
          </div>
        </section>
        <section
          id="features"
          className="lp-section lp-wrap"
          aria-labelledby="features-heading"
        >
          <div className="lp-section-heading" data-reveal>
            <div>
              <span className="lp-eyebrow">
                Less friction. More possibility.
              </span>
              <h2 id="features-heading">
                Small square.
                <br />
                <span className="lp-muted">Serious possibilities.</span>
              </h2>
            </div>
            <p>
              Everything you need to make the connection. Play with the tools
              before you make it yours.
            </p>
          </div>
          <FeatureLab />
        </section>
        <ProductStory />
        <section
          id="use-cases"
          className="lp-section lp-wrap"
          aria-labelledby="use-cases-heading"
        >
          <div className="lp-section-heading" data-reveal>
            <div>
              <span className="lp-eyebrow">Made for your next move</span>
              <h2 id="use-cases-heading">
                A connection.
                <br />
                <span className="lp-muted">In every context.</span>
              </h2>
            </div>
            <p>
              From the table to the ticket, bring the physical world a little
              closer to your digital one.
            </p>
          </div>
          <UseCases />
        </section>
        <section
          id="pricing"
          className="lp-section lp-wrap lp-pricing"
          aria-labelledby="pricing-heading"
        >
          <div data-reveal>
            <span className="lp-eyebrow">Good things start simple</span>
            <h2 id="pricing-heading">
              Your ideas.
              <br />
              <span className="lp-ice">Free to flow.</span>
            </h2>
            <p>
              Everything in the current QRFlow release.
              <br />
              No subscription. No credit card.
            </p>
          </div>
          <div className="lp-price-card" data-reveal>
            <div className="lp-price-top">
              <span>THE FREE PLAN</span>
              <span className="lp-badge">Available now</span>
            </div>
            <div className="lp-price">
              $0 <span>/ current release</span>
            </div>
            <p>
              All the essentials, at no charge. Any future plan changes will be
              communicated clearly.
            </p>
            <ul>
              {[
                "Up to 100 dynamic QR codes",
                "100 management changes per day",
                "Custom colors + PNG and SVG exports",
                "7-day and 30-day recorded scan analytics",
                "Pause, resume, and update destinations",
              ].map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="lp-button lp-primary" href="/login">
              Start creating for free <ArrowUpRight size={18} />
            </Link>
            <small>
              Analytics record up to 10,000 scans per code per UTC day. Valid
              redirects continue beyond that limit.
            </small>
          </div>
        </section>
        <section
          id="faq"
          className="lp-section lp-wrap lp-faq-section"
          aria-labelledby="faq-heading"
        >
          <div data-reveal>
            <span className="lp-eyebrow">A little clarity</span>
            <h2 id="faq-heading">
              Before you
              <br />
              <span className="lp-muted">make the leap.</span>
            </h2>
          </div>
          <FAQ />
        </section>
        <section className="lp-final lp-wrap" aria-labelledby="final-heading">
          <div className="lp-final-mark" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M5 35V5h30M65 5h30v30M95 65v30H65M35 95H5V65"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M25 25h15v15H25zM60 25h15v15H60zM25 60h15v15H25zM60 60h5v5h10v10H60z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="lp-eyebrow" data-reveal>
            Your next connection starts here
          </span>
          <h2 id="final-heading" data-reveal>
            Print once.
            <br />
            <span className="lp-ice">Keep moving.</span>
          </h2>
          <Link className="lp-button lp-primary" href="/login">
            Create your free QR <ArrowUpRight size={18} />
          </Link>
          <p>One code. Whatever comes next.</p>
        </section>
      </main>
      <footer className="lp-footer lp-wrap">
        <Brand />
        <span>Small square. Endless possibility.</span>
        <nav aria-label="Footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/report">Report abuse</Link>
          <a
            href="https://github.com/yashvatsdev/qrflow"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <small>© 2026 QRFlow</small>
      </footer>
    </LandingMotion>
  );
}
