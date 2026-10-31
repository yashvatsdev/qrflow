# QRFlow

Create. Share. Update. Without Reprinting.

Dynamic QR-code MVP built with Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind CSS, Base UI, qrcode, and Recharts. Geist fonts are self-hosted so builds do not need Google Fonts.

## Run locally

Use Node.js 24 and pnpm 11.18.0. Copy `.env.example` to `.env.local`, then set the Supabase URL and publishable key. Use `http://localhost:3000` for `NEXT_PUBLIC_APP_URL` locally.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Database and OAuth

The dedicated Supabase project is `cmoppsdcywqihmpgpnmh`. The version-controlled migration in `supabase/migrations/20261030175527_qrflow.sql` creates profiles, QR records, scan events, owner RLS, automatic profile creation, bounded quotas, and analytics functions. It has been applied to that project. Do not replay it against an existing database or another project. `supabase/tests/security.sql` runs read-only permission assertions inside a rolled-back transaction.

Google provider setup:

1. Create a Web application OAuth client in the dedicated Google Cloud project `qrflow-513218`.
2. Set its authorized redirect URI to `https://cmoppsdcywqihmpgpnmh.supabase.co/auth/v1/callback`.
3. In Supabase Authentication > Sign In / Providers > Google, enter the client ID and client secret and enable Google. Never put the client secret in application code or browser environment variables.
4. In Supabase Authentication > URL Configuration, set the Site URL to `https://qrflow-ashy.vercel.app`. Allow `https://qrflow-ashy.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` as redirect URLs.
5. If the Google consent app remains in Testing, add the intended test accounts in Google Auth Platform > Audience. Public availability requires the appropriate publishing state.

The app uses a PKCE callback with a fixed dashboard destination, verified server sessions, cookie refresh, same-origin mutation checks, Zod validation, bounded JSON bodies, and per-user ownership checks backed by RLS. No service-role key is needed in the app: public redirect functions expose only a single link's destination/status when supplied its 128-bit random slug. Anonymous clients have no direct QR-table or scan-table access. The SQL intentionally grants those two bounded capability functions to the public API; security advisors flag their `SECURITY DEFINER` status. The private quota tables intentionally have no user policies.

## Features

- Cinematic responsive landing page with GSAP scroll storytelling, Motion interactions, an editable local QR demonstration, six working feature previews, use-case tabs, and accessible FAQ/navigation. Real privacy disclosure and abuse-report link.
- Google login, protected workspace, profile summary and logout.
- Three-step creation, custom colors with contrast validation, fixed quiet zones, PNG (512/1024/2048 px) and SVG downloads.
- QR search, status filters, details, edits, pause/resume, and confirmed deletion.
- Refined dashboard with a collapsible sidebar, mobile drawer, profile menu, real metric cards, inline QR management actions, sorting, server-confirmed status changes, notifications, and loading skeletons. The split-pane three-step studio preserves permanent QR URLs while editing destinations; details include Overview, Analytics, and Settings tabs.
- Permanent `/r/[slug]` links, uncached 302 redirects, paused/unknown/unavailable pages, and best-effort scan recording.
- Owner-scoped aggregate analytics and daily UTC charts, including 7- and 30-day ranges and a readable data table.

The free plan permits 100 codes per account and 100 management writes per UTC day. Recording is capped at 10,000 requests per code per day; valid redirects continue after the cap. Analytics are recorded requests, not unique people; bots and repeat scans can count. No raw visitor IPs or fingerprints are stored by the application. Infrastructure providers can retain operational logs under their policies.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Vitest covers URL and input validation, QR decoding, slug entropy, API responses, ownership query scoping, quota handling, OAuth boundaries, and redirect behavior. Playwright covers the public pages, protected routes, errors, and responsive overflow. Its authenticated lifecycle test requires a normal signed-in browser state at the gitignored `.e2e/storage.json`; without it, that test explicitly skips. Run against a deployed origin by setting `E2E_BASE_URL`. Do not commit session files or enable sensitive traces.

`e2e/workspace-components.spec.ts` uses the existing Vitest/Vite dependency to run actual dashboard client components in an isolated Playwright fixture server. Its deterministic test records and intercepted API responses are test-only: no fixture routes, sessions, or mock records are added to the Next.js app. These checks cover successful and failed mutations, confirmation/cancel behavior, form persistence, stable QR images, keyboard navigation, 320–1440px layouts, reduced motion, and Axe accessibility checks. They supplement the authenticated lifecycle test; they do not substitute for verifying real CRUD against Supabase. Per-code list counts use `scan_events(count)` through the existing foreign key with owner filtering and RLS, rather than downloading events or making one stats request per row.

Local dashboard verification (2026-10-31): lint, type checking, production build, 43 unit tests, and 14 browser tests passed; the authenticated lifecycle test skipped without saved state. Axe reported no WCAG A/AA violations in the sampled overview, list, studio, detail, empty, and confirmation-dialog states. Read-only checks on the dedicated Supabase project confirmed owner analytics, zero visibility under another user, RLS, anonymous table restrictions, and immutable identity permissions. The user confirmed the redesigned local overview loads real account data after sign-in. Windows/Brave automation failed to initialize in this session, so a fresh signed-in CRUD lifecycle through the redesigned UI remains unverified. This dashboard redesign has not been deployed.

The landing-page tests also exercise destination validation and unchanged QR payloads, simulated scans, all six feature controls, PNG decoding and SVG exports, tab keyboard navigation, FAQ state, mobile dialog behavior, desktop pin progression/resize cleanup, and reduced motion. Marketing destination changes, scans, and charts are clearly labelled local simulations; they do not write account data. Every marketing QR encodes the fixed public project repository URL. Desktop story pinning requires at least 1024×720 and no reduced-motion preference; other layouts show all four scenes in natural reading order. All landing CSS is scoped to `.qrflow-landing` to preserve the workspace UI.

Local landing verification (2026-10-31): lint, type checking, production build, 42 unit tests, and 9 browser tests passed. The authenticated lifecycle test skipped because no saved session was supplied. Overflow checks covered widths from 320 to 1920 pixels; screenshots were reviewed at mobile, tablet, and desktop sizes. Axe WCAG A/AA checks reported no violations in the sampled feature panels at 320, 768, and 1440 pixels, and in the open mobile dialog. These automated checks complement keyboard and visual review; they do not certify every possible accessibility state. This landing redesign has not been deployed.

## Deployment

Current production release (2026-10-31): runtime commit `a1fb354bc2297beafbdc16f696eb0f231ae519a1`, Vercel deployment `dpl_2bvGWS2NL2jKXJCqbSZJsGoNKaGF`, served at `https://qrflow-ashy.vercel.app`. This publishes both redesigns, the animated background, request-time Supabase initialization, and page-level navigation loading boundaries. All 44 unit tests and nine public browser tests passed; the authenticated lifecycle test skipped without saved state. The local verification notes above describe the pre-deployment state. Publishing used Vercel CLI from the local commit; automatic approval review rejected the separate GitHub `main` push because that remote update was not explicitly authorized, so GitHub remains unchanged.

Vercel project: `techtroop/qrflow` (`prj_AdOQVZEaGNFGSbXXftCGP8wQJ65Y`). Permanent domain: `https://qrflow-ashy.vercel.app`. Production requires `NEXT_PUBLIC_APP_URL` set to this permanent HTTPS origin plus the two public Supabase connection values. Never generate production QR codes against a preview or localhost URL. The app refuses an invalid production origin.

The existing Git repository is rooted above this application; its application path is `full stack  projects/qrflow`. Any Git-connected Vercel setup must use that root directory. Direct CLI deployment runs from this app directory. Stage only this app's files, never neighboring projects.

## Operational limits

Verified production origin: `https://qrflow-ashy.vercel.app`. Lint, TypeScript production build, 42 unit tests, and three public browser tests passed. Google consent registration, web client creation, Supabase Google provider setup, and exact production/local callback allowlisting are complete. A normal Google login reached the production dashboard. The live verification code was created through the UI; its downloaded 512-pixel PNG decoded to the permanent production URL, and its SVG was saved and verified as a vector file. The original URL returned 302 to the edited destination, pause returned 410 without Location, and resume restored 302. Read-only database assertions confirmed owner visibility and denied code, event, and aggregate access under another user's RLS context.

The earlier editor return-to-details fix was deployed and verified live: saving an edit and selecting "View QR details" closes the success panel and restores the management controls. Previous verified runtime commit: `003e58e`; rollback deployment: `dpl_HJopffTdpTJSE8TZGrc98o6R4pmP`. The GitHub account connection fixed Vercel's author-membership gate without changing commit identity or access checks. All three public browser regression tests passed on that earlier deployment. The latest release is recorded under Deployment above.

The automated authenticated lifecycle test remains explicitly skipped without a Playwright storage state; authenticated checks used the normal Brave session and live HTTP/database checks. Google OAuth branding includes the verified homepage, privacy-policy link, and exact production hostname. With explicit approval, the external OAuth app was published and Google reports its status as **In production**. Deletion of the single named verification code and its test scan history is the remaining cleanup/deletion-verification item, pending the browser-required confirmation. The production site and public Google sign-in configuration are live.

Google provider credentials and console configuration are external setup requirements. A build passing does not verify a live Google login. The issue-tracker abuse-report fallback is public: configure `ABUSE_REPORT_EMAIL` with an operator-monitored address for private reports. Dynamic link services can be used for phishing; reports need operator review. The database quotas bound stored events, not all incoming traffic or infrastructure costs. There is no automatic link reputation checking, retention cleanup, account-deletion UI, or availability guarantee.

Payments, subscriptions, teams, custom domains, logos in QR codes, bulk generation, geolocation, AI, and background workers are intentionally deferred.
