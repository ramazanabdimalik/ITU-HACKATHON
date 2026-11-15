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

Open http://localhost:3000.

To check and build the app:

```bash
npm run lint
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
