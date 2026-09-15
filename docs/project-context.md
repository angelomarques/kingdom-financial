# Kingdom Financial project context

Ângelo Emanuel Marques is the only user. This is personal finance for his own months, not a multi-user product.

## What this slice is

The home screen is one pizza. The three slices are spending, saving, and remaining monthly income. Remaining is `max(0, income - spend - save)`. Amounts are integer euro cents. Display uses `pt-PT` and EUR.

A spend threshold is a warning, not a hard lock. Crossing it opens one `spend_threshold` alert for the month. Reaching the savings target opens one `savings_reached` alert. Each kind fires once per month. Acknowledgment is a stored status change, not a delete.

## Storage

Cloudflare D1 is the production store. The Next.js server talks to D1 over the HTTP API. This slice does not add Workers, Queues, or Cron. Those stay available later for scheduled recaps, not for reading or writing the month.

If `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, or `CLOUDFLARE_D1_DATABASE_ID` is missing, the app writes `.data/ledger.json`. Local writes are serialized through one in-process queue.

The domain type is `MonthSnapshot`. Stores implement `LedgerStore`. Alert derivation lives in `refreshAlerts`, not in the UI.

## Analytics

PostHog runs on the server through `posthog-node`. Distinct id is `angelo`. Host defaults to `https://eu.i.posthog.com`. No key means a silent no-op. There is no browser PostHog SDK, so the app never needs `useEffect` to boot analytics.

## App rules

`useEffect` is banned. Server Components load the month. Server Actions mutate it. Client code is limited to form pending state, action errors, and the `error.tsx` reset button.

Playwright is the test framework. Tests cover the pizza, the three demo states, threshold alerts, and the installable manifest.

The app is a PWA. `public/manifest.webmanifest` plus `public/sw.js` make it installable. The service worker registers from a script in the root layout.

Currency and month boundaries use Europe/Lisbon.

Auth and a second database are out of scope. Ângelo is the only actor.

## Agents

The main coder is the project-local Cursor subagent at `.cursor/agents/main-coder.md`. It uses `composer-2.5`, Cursor's listed Composer 2.5 slug. Delegate implementation to it. Do not send it GitHub or Vercel work.

## Later, not now

Cloudflare Queues, Workers, and Cron are for later jobs such as a month-end recap. They are not required to show the pizza or to open alerts.
