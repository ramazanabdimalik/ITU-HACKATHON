# Client transfer screen

Adds the main SafeTransfer client demo: a responsive RU/KK transfer screen with live API-backed risk protection, without building the bank dashboard.

## Changes

- Navy/teal design tokens, off-white canvas, rounded cards, self-hosted Inter through next/font/local, visible focus and reduced-motion support.
- Shared navigation and dashboard placeholder, eight demo profiles, account card, fake balance and safe persisted language switching.
- Labeled transfer form with KZT formatting, known/new recipients, friendly validation and device/time simulation. New recipients use DEMO-only account details; the score API validates them and delegates scoring to the existing engine.
- 400 ms debounced meter with request cancellation, animated SVG gauge, icon/text risk levels, readable signals, skeleton and error/retry states.
- Fresh scoring on submission: low completes; medium requires confirmation; high only offers cancellation or bank review. Abandoned submissions are aborted.
- Four repeatable seeded scenarios: normal 0/low, night/new person 60/high, flagged recipient 85/high, and seeded burst + new device 35/medium. Fixed profile/time is disclosed.
- Versioned localStorage persistence with validated reads, ID upserts, masked account details and session fallback/warnings. Held transfers become pending_review under the same ID. High cancellations are blocked with clientDecision=cancelled; medium cancellations are not sent.

No new libraries, secrets, real data or scoring-rule changes. Local demo transactions are available to a future dashboard via getTransactions(); API risk history remains the seeded server dataset. The dashboard route is intentionally a localized placeholder.

## Validation

Use Node.js 24+; from the repository root:

```bash
cd web
npm install
npm run lint
npm test
npm run build
npm run dev
```

Lint passed, all 27 tests passed, and the production build passed. Browser flows passed in development and production at desktop and 360 px, without horizontal overflow or browser exceptions. Verified live scenarios, all decision branches, review persistence, validation focus, KK reload persistence, dashboard navigation, API failure/retry, blocked storage, keyboard focus and debounce coalescing. Production CSS/font/theme rendering was inspected.

## Manual test steps

1. Open http://localhost:3000; switch among all eight profiles and verify the account card changes and form resets.
2. Select Normal transfer: expect 0 / low. Continue: expect success and a completed local transaction.
3. Select Many quick transfers: expect 35 / medium, including velocity and new-device signals. Continue: review the explanation/tip, then confirm. Repeat and cancel: no transfer should be sent.
4. Select Large night transfer to a new person: expect 60 / high. Continue: expect a hold, explanatory signals and a tip. There must be no send-anyway or confirm button.
5. Select Transfer to a suspicious account: expect 85 / high. Continue, then ask for bank review. Inspect safetransfer.transactions.v1 in localStorage: the same transaction ID should now have status pending_review with no duplicate held entry.
6. Repeat a high scenario and cancel: no money is sent; the local record is blocked with clientDecision cancelled.
7. Start a blank form and submit. Expect friendly required-field messages and focus on the first invalid field. Try negative/excess-precision amounts and non-DEMO new accounts.
8. Type a valid amount quickly: the meter should debounce for 400 ms and show a skeleton, then the current result. Rapidly change scenarios: old results must not replace the current result.
9. Switch to KK, reload, and check language retention, explanations, controls and decision screens. Test 360 px and desktop widths; tab through every control and check visible focus.
10. Make /api/score fail: expect friendly retry and no successful submission. Restore access and retry. Block localStorage: language switching remains usable for the session and a completed/held demo shows the storage warning.
11. Visit Bank dashboard: expect the localized placeholder, then return to the transfer screen.

## Review delivery

Per user override, no PR API calls were made for this task. Intended PR title: **Client transfer screen**. This description is saved locally for review; compare main...feature/client-ui on GitHub.
