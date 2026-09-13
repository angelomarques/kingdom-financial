# Kingdom Financial

Personal finance for Ângelo Emanuel Marques. The home screen is a pizza chart of this month's spending, saving, and leftover income. Crossing the spend cap opens a warning. Hitting the savings target asks for an acknowledgment.

The app is a Next.js PWA. It stores data in Cloudflare D1 when credentials are present, and in `.data/ledger.json` when they are not. PostHog is on only when `POSTHOG_KEY` is set.

## How to run it locally

1. Install Node 22 or later.
2. Copy `.env.example` to `.env.local` if you want D1 or PostHog. Leave the file missing, or leave those keys empty, to use the local mock and disabled analytics.
3. Install dependencies and start the app.

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127). You should see September 2026 seed data on the first local run, or an empty plan after **Clear this month**.

Demo states:

- [Empty](http://127.0.0.1:43127/?demo=empty)
- [Loading](http://127.0.0.1:43127/?demo=loading)
- [Error](http://127.0.0.1:43127/?demo=error)

Install from the browser menu. The service worker is `public/sw.js`.

## How to point it at D1

1. Create a D1 database in the Cloudflare dashboard.
2. Set `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_D1_DATABASE_ID` in `.env.local`.
3. Restart `npm run dev`. The app creates the tables on first request.

The schema is `src/lib/finance/schema.sql`. This slice talks to D1 over the HTTP API. It does not deploy a Worker, Queue, or Cron.

## How to run tests

```bash
npm test
```

Playwright is the test runner. Tests reuse a server already listening on port 43127, or they start one.

## Product decisions

See `docs/project-context.md`.
