# Risk engine + mock data

Adds the SafeTransfer data layer and deterministic risk engine without changing UI pages.

- Shared customer, recipient, transaction and risk types.
- A seeded generator creates 8 fake customers, 20 recipients (3 flagged) and 300 transfers anchored to a fixed date, including 30 transfers across all five requested suspicious scenarios. Stored scores are computed chronologically.
- A pure scorer implements all seven signals, mutually exclusive amount tiers, the 85-point flagged-recipient floor, 100-point cap, and level/action thresholds. Weights and thresholds live in `RISK_CONFIG`.
- Russian/default and Kazakh template explanations include signal details and one general anti-scam tip chosen by the strongest signal.
- Validated scoring and transaction-list APIs return clear 400 errors for bad inputs. Scoring does not mutate or persist the fixture.

Velocity counts the current transfer plus prior attempts from the same customer within 10 minutes, excludes future records and the current ID, and includes the exact window boundary. Typical hours use Asia/Almaty, with inclusive start/exclusive end and overnight support. Structuring is the interval [475000, 500000) KZT.

## Test instructions

Use Node.js 24+ and npm. From the repository root:

```bash
cd web
npm ci
npm run generate:mock
npm run lint
npm test
npm run build
```

The generator uses Node's native TypeScript support, so no `tsx` dependency is added. Vitest 4 is the only new direct development dependency; it is compatible with the existing Node 20 type definitions.

Validated: byte-identical repeated mock generation; lint; 15 tests covering engine rules/boundaries, explanations and all stored fixture scores; production build including TypeScript; 32 API checks in each of development and production.

To exercise the API:

```bash
npm run dev
```

In another terminal:

```bash
curl 'http://localhost:3000/api/transactions?level=high&limit=5'
curl -X POST http://localhost:3000/api/score \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"customer-1","recipientId":"recipient-18","amount":20000,"deviceId":"device-1","timestamp":"2026-11-15T07:00:00Z","lang":"kk"}'
```

Expect descending high-risk transactions and a high/hold score of at least 85 with a Kazakh explanation. `limit=0`, an unknown customer, a non-positive amount, an invalid timestamp or unsupported language should return 400 and an `error` message.

No external scoring API, credentials, real customer data or business UI was added.
