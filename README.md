# SiteForge

SiteForge helps freelancers and small agencies who sell websites to local businesses:

1. **Find** local businesses with no website, or only a social page.
2. **Build** a polished, specific website for one of them in about a minute.
3. **Pitch** it: share a live link and send the owner a short WhatsApp or email message.

Built with Next.js (App Router) and TypeScript, Tailwind CSS, Drizzle ORM with libSQL, Better Auth,
Gemini (`@google/genai`), zod, vitest and Playwright.

## Screenshots

Every screenshot below comes from the automated end-to-end tests in `qa/journeys.spec.ts`, running
on demo data with no API keys. Run `npm run qa:journeys` (with `npm run dev` running) to refresh
them in `docs/screenshots/`.

### Journey 1: search without an account → sign up → build → workspace

| | |
| --- | --- |
| **1. Search first.** No account needed. | **2. Results.** Businesses without a website, filtered by default. |
| ![Landing page with search](docs/screenshots/journey1-1-landing.png) | ![Search results](docs/screenshots/journey1-2-results.png) |
| **3. Sign up without leaving the page.** The dialog keeps the business you picked. | **4. Build page.** Real previews of all three templates; the recommended one is preselected. |
| ![Sign-up dialog](docs/screenshots/journey1-3-signup-dialog.png) | ![Build page with template picker](docs/screenshots/journey1-4-build.png) |
| **5. Workspace.** The built site, with one next step: Get live link. | **6. Live links are a Pro feature.** Free users see the upgrade dialog. |
| ![Site workspace](docs/screenshots/journey1-5-workspace.png) | ![Live links are part of Pro dialog](docs/screenshots/journey1-6-live-link-is-pro.png) |

### Journey 2: free user's second site → upgrade → checkout → build continues

| | |
| --- | --- |
| **1. Monthly limit reached.** "Build site" opens the upgrade dialog. | **2. Pricing.** Free vs Pro. |
| ![Upgrade dialog](docs/screenshots/journey2-1-upgrade-dialog.png) | ![Pricing page](docs/screenshots/journey2-2-pricing.png) |
| **3. Checkout (test mode).** No real charge. | **4. Confirmed.** Redirects back after two seconds. |
| ![Checkout](docs/screenshots/journey2-3-checkout.png) | ![Checkout success](docs/screenshots/journey2-4-success.png) |
| **5. The build the user started finishes on its own.** | |
| ![Site built after upgrade](docs/screenshots/journey2-5-built-after-upgrade.png) | |

### Journey 3: Pro user → live link → send to owner → mark contacted

| | |
| --- | --- |
| **1. Live link ready.** Copy it or go straight to sending. | **2. The public site on a phone.** |
| ![Live link dialog](docs/screenshots/journey3-1-live-link.png) | ![Published site on a phone](docs/screenshots/journey3-2-live-site-phone.png) |
| **3. Send to owner.** A drafted WhatsApp message, editable before sending. | **4. After opening WhatsApp.** A quiet "Mark as contacted?" prompt. |
| ![Outreach panel](docs/screenshots/journey3-3-outreach.png) | ![Mark as contacted prompt](docs/screenshots/journey3-4-mark-contacted.png) |
| **5. Dashboard.** The lead now shows Contacted. | |
| ![Dashboard pipeline](docs/screenshots/journey3-5-dashboard.png) | |

### Journey 4: AI failure → clear error, credit not used → retry

| | |
| --- | --- |
| **1. The build fails** (simulated), says the free credit wasn't used, and offers Try again. | **2. Try again succeeds.** |
| ![Build failed](docs/screenshots/journey4-1-build-failed.png) | ![Site built on retry](docs/screenshots/journey4-2-retry-built.png) |

### Generated sites

The three templates, shown for the same bakery.

| Legacy | Modern | Bold |
| --- | --- | --- |
| ![Legacy template, desktop](docs/screenshots/template-legacy-desktop.png) | ![Modern template, desktop](docs/screenshots/template-modern-desktop.png) | ![Bold template, desktop](docs/screenshots/template-bold-desktop.png) |
| ![Legacy template, phone](docs/screenshots/template-legacy-mobile.png) | ![Modern template, phone](docs/screenshots/template-modern-mobile.png) | ![Bold template, phone](docs/screenshots/template-bold-mobile.png) |

## Quick start (no keys needed)

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. With no API keys set, SiteForge uses built-in sample business data and a
deterministic copywriter, and shows a small **Demo data** chip in the header.

### Demo accounts

| Email           | Password   | Plan | What's there                                        |
| --------------- | ---------- | ---- | --------------------------------------------------- |
| `free@demo.dev` | `demo1234` | Free | Empty pipeline, one free site available this month  |
| `pro@demo.dev`  | `demo1234` | Pro  | Four leads across statuses, one published live link |

Running `npm run db:seed` again resets both accounts.

## Environment variables

Copy `.env.example` to `.env` and fill in what you need. Every key is optional in development.

| Variable                | Purpose                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | `file:local.db` locally, or a Turso URL (`libsql://…`) in production                          |
| `DATABASE_AUTH_TOKEN`   | Turso auth token (leave empty for a local file)                                              |
| `BETTER_AUTH_SECRET`    | Session signing secret. **Required in production** (`openssl rand -base64 32`)               |
| `BETTER_AUTH_URL`       | Public URL of the app, e.g. `https://siteforge.example.com`. Also used for live links        |
| `GEMINI_API_KEY`        | Enables Gemini for site copy and outreach drafts. Without it, the mock copywriter is used     |
| `GEMINI_MODEL`          | Gemini model name. Defaults to `gemini-flash-latest`                                          |
| `GOOGLE_PLACES_API_KEY` | Enables Google Places (New) Text Search. Without it, mock places are used                     |
| `PRO_PRICE_MONTHLY`     | Price shown for Pro (default `19`)                                                           |
| `PRO_CURRENCY`          | ISO currency code for the price (default `USD`)                                              |

## Scripts

| Script                | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | Development server                                              |
| `npm run build`       | Production build                                                |
| `npm run typecheck`   | Route type generation + `tsc --noEmit`                          |
| `npm run lint`        | ESLint                                                          |
| `npm run test`        | Unit tests (vitest): templates, copywriter, entitlements, places |
| `npm run db:generate` | Generate a migration after editing `src/lib/db/schema.ts`       |
| `npm run db:migrate`  | Apply migrations in `drizzle/`                                  |
| `npm run db:seed`     | Create the demo accounts                                        |
| `npm run qa:screens`  | Playwright screenshots of every key screen (needs `npm run dev`) |
| `npm run qa:journeys` | Playwright end-to-end journeys (needs `npm run dev`)            |

Playwright QA runs against a server you start yourself. Set `QA_BASE_URL` to point it elsewhere, and
`PLAYWRIGHT_CHROMIUM` to use a preinstalled Chromium instead of `npx playwright install chromium`.
Working screenshots land in `qa/screenshots/` (not committed); the README images in
`docs/screenshots/` are refreshed by the journey and template specs.

## Plugging in real services

All external services sit behind small interfaces with a factory that picks the real or mock
implementation from the environment. Adding a key needs no code changes.

- **Gemini**: set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`). Prompts live in
  `src/lib/ai/prompts.ts`; every response is validated with zod, retried once with the validation
  errors, and review quotes are checked against the real reviews before they are used.
- **Google Places**: set `GOOGLE_PLACES_API_KEY` with the Places API (New) enabled. See the caching
  notes at the top of `src/lib/places/google.ts`; stored records are refreshed after 24 hours.
- **Billing**: `src/lib/billing/provider.ts` defines the `BillingProvider` interface; the stub in
  `src/lib/billing/mock.ts` flips the plan immediately (search for `TODO(billing)`). To add Stripe or
  Razorpay, implement the interface with a hosted checkout plus a webhook route that sets
  `user.plan`, and return it from `getBillingProvider()`.

Plan gating lives only in `src/lib/entitlements.ts`. Every gated route calls it on the server.

## Deploying (Vercel + Turso)

1. Create a database: `turso db create siteforge`, then `turso db show siteforge --url` and
   `turso db tokens create siteforge`.
2. Apply migrations from your machine:
   `DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npm run db:migrate`
   (optionally run `db:seed` the same way for demo accounts).
3. Import the repository in Vercel and set `DATABASE_URL`, `DATABASE_AUTH_TOKEN`,
   `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your production URL) and any API keys.
4. Deploy. Published sites are served at `https://your-domain/s/<slug>`.

The rate limiter for AI endpoints is in memory (`src/lib/rate-limit.ts`). Replace it with a shared
store such as Upstash Redis before running more than one instance.

## Project layout

```
src/
  app/                 routes: landing, search, build, sites workspace, dashboard, pricing,
                       checkout, account, auth pages, /s/[slug] public sites, API route handlers
  components/ui/       design-system primitives (Button, SearchBox, Chip, Dialog, Menu, Toast,
                       Skeleton, Tabs, StatusSelect, TextField)
  components/          feature components (search results, build flow, workspace, pipeline)
  lib/db/              Drizzle schema and client
  lib/places/          places providers (mock, Google), website classification
  lib/ai/              copy providers (Gemini, mock), prompts, schemas, guardrails
  lib/billing/         billing interface and test-mode stub
  lib/templates/       Legacy, Modern and Bold site templates (pure functions → HTML)
  lib/entitlements.ts  all plan gating
  lib/render.ts        content + template → HTML, server-side watermark, CSP
  tests/               vitest unit tests
qa/                    Playwright screenshot and journey specs
```

A hidden page at `/dev/ui` shows every UI primitive in each state (development only).
