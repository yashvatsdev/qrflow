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

- Responsive marketing site, live scannable demonstration, real privacy disclosure and abuse-report link.
- Google login, protected workspace, profile summary and logout.
- Three-step creation, custom colors with contrast validation, fixed quiet zones, PNG (512/1024/2048 px) and SVG downloads.
- QR search, status filters, details, edits, pause/resume, and confirmed deletion.
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

## Deployment

Vercel project: `techtroop/qrflow` (`prj_AdOQVZEaGNFGSbXXftCGP8wQJ65Y`). Permanent domain: `https://qrflow-ashy.vercel.app`. Production requires `NEXT_PUBLIC_APP_URL` set to this permanent HTTPS origin plus the two public Supabase connection values. Never generate production QR codes against a preview or localhost URL. The app refuses an invalid production origin.

The existing Git repository is rooted above this application; its application path is `full stack  projects/qrflow`. Any Git-connected Vercel setup must use that root directory. Direct CLI deployment runs from this app directory. Stage only this app's files, never neighboring projects.

## Operational limits

Verified production origin: `https://qrflow-ashy.vercel.app`. Lint, TypeScript production build, 42 unit tests, and three public browser tests passed. Google consent registration, web client creation, Supabase Google provider setup, and exact production/local callback allowlisting are complete. A normal Google login reached the production dashboard. The live verification code was created through the UI; its downloaded 512-pixel PNG decoded to the permanent production URL, and its SVG was saved and verified as a vector file. The original URL returned 302 to the edited destination, pause returned 410 without Location, and resume restored 302. Read-only database assertions confirmed owner visibility and denied code, event, and aggregate access under another user's RLS context.

The editor return-to-details fix is deployed and verified live: saving an edit and selecting "View QR details" closes the success panel and restores the management controls. Current runtime commit: `003e58e`; verified Vercel deployment: `dpl_HJopffTdpTJSE8TZGrc98o6R4pmP`. The GitHub account connection fixed Vercel's author-membership gate without changing commit identity or access checks. All three public browser regression tests passed again on this deployment.

The automated authenticated lifecycle test remains explicitly skipped without a Playwright storage state; authenticated checks used the normal Brave session and live HTTP/database checks. Google OAuth branding includes the verified homepage, privacy-policy link, and exact production hostname. With explicit approval, the external OAuth app was published and Google reports its status as **In production**. Deletion of the single named verification code and its test scan history is the remaining cleanup/deletion-verification item, pending the browser-required confirmation. The production site and public Google sign-in configuration are live.

Google provider credentials and console configuration are external setup requirements. A build passing does not verify a live Google login. The issue-tracker abuse-report fallback is public: configure `ABUSE_REPORT_EMAIL` with an operator-monitored address for private reports. Dynamic link services can be used for phishing; reports need operator review. The database quotas bound stored events, not all incoming traffic or infrastructure costs. There is no automatic link reputation checking, retention cleanup, account-deletion UI, or availability guarantee.

Payments, subscriptions, teams, custom domains, logos in QR codes, bulk generation, geolocation, AI, and background workers are intentionally deferred.
