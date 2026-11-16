# ITU-HACKATHON
MVP solution for the BCC Bank case at V Regional ITU Hackathon 2026

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## How to run

Requires Node.js 24+ and npm for the full workflow (including native TypeScript mock generation).

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 for Home, http://localhost:3000/transfer for transfers and http://localhost:3000/dashboard for analysts.

To check and build the app:

```bash
npm run lint
npm test
npm run build
```

To serve the production build, run `npm start` from `web/`.

## Risk engine

`web/lib/risk-engine.ts` exports the pure `scoreTransaction(input, customer, history, recipients)` function and `RISK_CONFIG`. Amounts are in KZT. Each signal includes its ID, weight and machine-readable `params`; scoring does not mutate inputs or consult the clock.

| Signal | Rule | Points |
| --- | --- | --- |
| New recipient | Not in the customer's known recipient IDs | +20 |
| Large amount | More than 3× the customer's average | +15 |
| Very large amount | More than 8× the average; replaces the +15 tier | +30 |
| Unusual hour | Outside the customer's typical hours in Asia/Almaty | +10 |
| New device | Not in the customer's known device IDs | +15 |
| Velocity | At least 3 transfers in 10 minutes, including the current transfer | +20 |
| Flagged recipient | Recipient has `flagged: true` | +40; total score at least 85 |
| Structuring indicator | Amount from 475,000 inclusive to 500,000 exclusive | +10 |

The sum is capped at 100. Scores below 30 are `low` / `allow`, 30–59 are `medium` / `confirm`, and 60+ are `high` / `hold`. Typical hours include the start and exclude the end; overnight ranges are supported, and equal endpoints mean all day. Velocity uses only this customer's history, includes the exact 10-minute boundary, excludes future records and the input's own ID, and counts prior attempts regardless of status.

Russian is the default explanation language; Kazakh is supported with `kk`. `explainRisk` returns a plain-language `summary`, `reasons` array and one `tip` based on the strongest signal (first signal wins ties). Templates use no external API. These are demonstration rules and advice, not a guarantee of safety or a production banking decision.

### Mock data

From `web/`, using Node.js 24+:

```bash
npm run generate:mock
```

This runs `node scripts/generate-mock.ts` with native TypeScript support; no `tsx` or random-data library is needed. The fixed seed and fixed "now" (`2026-11-15T12:00:00.000Z`) produce identical `data/mock.json` output: 8 fake customers, 20 fake recipients (3 flagged) and 300 transfers within the preceding 30 days. Accounts are visibly marked `DEMO` and are not real account numbers.

There are 270 normal transfers and 30 transfers in suspicious scenarios: 6 night/new-recipient amount spikes, 8 transfers in two velocity bursts, 6 new-device amount spikes, 6 transfers to flagged recipients and 4 amounts just below 500,000 KZT. The first two transfers of each burst are below the velocity threshold. Scores and statuses are computed chronologically by the engine; the generator does not use future history. No data is fetched externally.

### API

Start the app with `npm run dev` in `web/`.

- `POST /api/score`: JSON body requires `customerId`, `recipientId`, positive numeric `amount` in KZT, and a non-empty `deviceId`. Optional `timestamp` must be a real ISO date-time with timezone (defaults to server time). Optional `lang` is `ru` or `kk`; the `lang` query parameter is also supported, with the body taking precedence. Unknown customers/recipients and invalid inputs return HTTP 400 with `{ "error": "..." }`. Returns `RiskResult` fields plus `explanation`. Does not save a transaction or change the mock fixture.
- `GET /api/transactions`: returns an array of stored mock transactions, sorted by descending risk score, then newest timestamp, then ID. Optional `level=low|medium|high` and integer `limit=1..300`. Invalid filters and limits return HTTP 400.

```bash
curl 'http://localhost:3000/api/transactions?level=high&limit=5'

curl -X POST http://localhost:3000/api/score \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"customer-1","recipientId":"recipient-18","amount":20000,"deviceId":"device-1","timestamp":"2026-11-15T07:00:00Z","lang":"kk"}'
```

### Tests

From `web/`:

```bash
npm test
npm run lint
npm run build
```

Vitest is the only added direct development dependency. Version 4 is used for compatibility with the existing Node type definitions. The suite covers all signals, amount/hour/window boundaries, future/unrelated/self history exclusion, the score cap, flagged-recipient floor, level/action thresholds, input immutability and Russian/Kazakh explanations.

## Home overview and navigation

`/` is a selected-customer overview built from the same API/localStorage/analyst merge as the dashboard. The desktop shell has a three-link sidebar; mobile uses the same three sections in a fixed, safe-area-aware bottom navigation. The notification bell opens the dashboard and counts actual `pending_review` records. The user chip opens the eight-customer selector; RU/KK controls are available there on narrow screens.

Home shows a time-of-day greeting in Almaty time, cloud/shield protection card, existing fake balance, recent four transfers and three template-based insights from the latest flagged transfer. The quick-transfer form opens `/transfer` with validated recipient/amount query values. The seven-day SVG chart supports hover, tap and keyboard tooltips; its period ends on the newest selected-customer transaction, making the fixed fixture reproducible.

Home metrics cover the selected customer: checked transfers, medium/high transfers with `held` or `blocked` status, and the held/blocked share among high-risk transfers. An empty denominator displays a dash, not an invented percentage. The first seeded customer has 41 transfers, 2 stopped suspicious transfers and a 100% stopped share among 2 high-risk transfers. These are labeled demo aggregates, **not measured fraud-detection accuracy**. Analyst Allow/Block decisions update them. The AI label is accompanied by an explicit rule/template demo disclosure; no trained model or external AI service is used.

## Client transfer screen

The home page is the overview; `/transfer` is the client-facing transfer demo. Choose one of eight demo profiles, a known recipient or a new recipient with fake `DEMO-...` details, and a KZT amount. The simulation controls can select a new device or nighttime. No real accounts or money are used.

The live meter calls `/api/score` after a 400 ms debounce. Changes cancel stale requests; submission always asks the API for a fresh decision. Low-risk transfers complete, medium-risk transfers require confirmation, and high-risk transfers can only be cancelled or sent for bank review. The UI never computes risk scores.

RU/KK language choice is persisted safely. Demo transactions use the versioned `safetransfer.transactions.v1` localStorage key; `web/lib/store.ts` exports `getTransactions()` and `saveTransaction()` for the dashboard. A held transfer is updated under the same ID to `pending_review` when review is requested. High-risk cancellation is recorded as `blocked` with `clientDecision: "cancelled"`; cancelled medium-risk confirmations are not sent. Only masked recipient accounts are stored. If browser storage is unavailable, a warning is shown and transactions remain available in session memory. Stored local transactions do not alter the seeded server history used by the risk engine.

`/dashboard` now provides the bank analyst view described below. No database, UI library or animation dependency was added. Inter is bundled through `next/font/local`, including Kazakh Cyrillic glyphs, with its SIL OFL license in `web/app/fonts/`. This user-approved fallback keeps builds independent of blocked Google Fonts downloads.

### Demo scenarios

All scenario buttons select the first demo profile and a disclosed fixed timestamp, so their results do not depend on the current date or hour. Use the current-time button or change the time selector to leave the fixed timestamp.

| Scenario | Expected result | Why |
| --- | --- | --- |
| Normal transfer | 0 · low · success | Known recipient/device, ordinary amount, daytime |
| Large night transfer to a new person | 60 · high · hold | New recipient + 12× average + unusual hour |
| Transfer to a suspicious account | 85 · high · hold | Flagged recipient floor |
| Many quick transfers | 35 · medium · confirmation | Seeded 10-minute burst + new device; velocity alone is 20 points |

Run the app from `web/` with `npm run dev`. For manual testing, try each scenario, continue, and follow its decision screen. On a high-risk hold, request review and inspect localStorage for `status: "pending_review"`. Switch to KK, reload, and verify the selected language is retained. Check the layout at 360 px and desktop widths, tab through controls, and try an empty form. Simulate a failed `/api/score` request to check the error/retry state and that no transfer succeeds without a decision. Block browser storage to check the persistence warning and usable language switch.

### Screenshots

Add approved screenshots using fake data only:

- [ ] Home overview: desktop sidebar, cloud hero, computed cards and chart.
- [ ] Home overview: 360 px Kazakh greeting, account, alert and bottom navigation.
- [ ] Transfer: live high-risk panel or hold decision.
- [ ] Dashboard: analyst queue and mobile detail sheet.

## Bank dashboard

Open `/dashboard` after starting the app from `web/` with `npm run dev`. It uses the shared Inter/violet/lavender design system and RU/KK language switch. The shared user chip remains available, while dashboard KPIs, charts and queue explicitly cover all customers.

The data hook merges `/api/transactions`, client records from `safetransfer.transactions.v1` and analyst decisions from `safetransfer.analyst-decisions.v1`. Matching local IDs override API records; analyst decisions override status only. Block sets `blocked`; Allow sets `completed`. Neither action changes risk scores or engine weights. Decisions are confirmed in the drawer and persist in the current browser; malformed/empty storage is handled safely. If storage is denied, decisions still update for the session and a warning explains that they were not persisted. The seeded API fixture remains unchanged.

The KPI cards and charts cover all merged records, independently of queue filters. Flagged means medium or high risk. The held/blocked amount includes exactly those two statuses, excluding `pending_review` and `completed`; it is a demo sum, not a claim about real prevented fraud. Average risk is the arithmetic mean, or zero for empty data. Counters respect reduced motion.

The queue defaults to medium/high risk. Filter by risk and status, sort by risk or transaction time, and load more than the first 30 matches as needed. Desktop uses a semantic table; mobile uses cards. Select any record to inspect its score, per-signal point breakdown, explanation/tip and typical-versus-current customer behavior. The modal drawer traps focus, supports Escape and restores focus on close. The score floor/cap can make the final score differ from the sum of displayed signals.

Charts use SVG/CSS without libraries: flagged transfers per Almaty calendar day, risk distribution and signal frequency. The daily chart covers 30 days ending on the newest transaction date, so the fixed seed remains useful; distribution/frequencies use all merged data. Chart titles, legends and text/data alternatives remain accessible when empty.

The live feed observes storage/custom events and polls local data every two seconds. New client IDs appear without reloading; the latest three are shown in the feed, and up to ten new IDs are pinned above queue rows that match the active filters. Low-risk arrivals remain visible in the feed even when the queue is filtered to flagged records. Status changes reuse the transaction ID and do not create duplicate feed entries.

### Analyst demo checks

1. Load `/dashboard` with empty browser storage: expect 300 total records and 22 flagged. Check all KPI values, charts, level/status filters, risk/time sort and the resettable empty state.
2. Open a flagged record with a row click or keyboard button. Inspect signal points and customer comparison. Tab/Shift+Tab stay inside; Escape closes and restores focus.
3. Block a record, cancel once to verify no change, then confirm. Expect the status and KPI/chart data to update immediately and a toast inside the drawer. Allow it with a second confirmation, reload, and verify the decision persists while the original score remains.
4. In another tab on the same origin, use the client screen's suspicious-account scenario and request bank review. Expect one new feed entry, a pinned matching row with `pending_review`, and total 301/flagged 23. Decisions made in another dashboard tab synchronize too.
5. Test RU/KK, 360 px and desktop widths, keyboard focus, reduced motion and chart alternatives. Make the API fail: local records remain visible and retry restores the merged history. Block localStorage: language switching and decisions still work for the session, with a persistence warning.

Run `npm run lint`, `npm test` and `npm run build` from `web/`. Unit tests cover data precedence, status-only overrides, KPI arithmetic, filters/sort/pinning, Almaty chart boundaries, empty summaries, dictionary parity and safe analyst storage.

## Redesign v2 and QA

All three screens share indigo-violet accents, soft lavender backgrounds, white rounded cards, cloud/shield SVG art, tabular money/scores and visible keyboard focus. No external images, UI/chart libraries or dependencies were added. Working sidebar, user/language controls and mobile navigation replace decorative dead controls.

At 1280×720 the transfer form and live risk panel fit side by side, including the night/new-recipient scenario. An empty form shows the illustrated shield rather than a zero gauge. The red high-risk decision presents the gauge, up to three reasons, a tip and Cancel/Request review actions. Mobile keeps the risk/action strip above the bottom navigation; decision toasts also avoid covering navigation. Reduced-motion preferences disable gauge/pulse transitions. The bank drawer becomes a keyboard-operable bottom sheet on mobile.

RU/KK applies to controls, titles, descriptions, Open Graph and the themed 404 page. Calendar labels use numeric dates and 24-hour Almaty time. Editable KZT amounts use space grouping and a decimal comma, preserving valid parsing in both languages. The bundled Inter variable font covers Kazakh letters.

The four fixed demo results remain **0/low**, **60/high**, **85/high** and **35/medium**. QA covers each in RU and KK at widths 1280, 768 and 360, with actual API responses, decisions, Home metrics/prefill, navigation, pending counts, storage updates, chart tooltips and drawer focus. All 53 unit tests, lint and production build pass. Additional checks cover API failure/retry, fail-closed submission, empty data, denied storage, persisted language and cross-tab updates. No engine weights or existing API/scenario semantics changed.
