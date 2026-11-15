# Visual polish and QA

Keeps the transfer form, main action and live protection visible at 1280×720, and applies consistent visual and RU/KK polish across the client screen and bank dashboard. No business features, risk-weight changes, new libraries, secrets or real data.

## Changes

- Realistic abbreviated Kazakhstani-style demo names replace generic customer/recipient labels. The fixed seed, all 300 transactions, timestamps, IDs, fraud patterns and scores remain unchanged. Existing saved seeded recipients display current names.
- Compact navy-to-teal shield-pattern headers, single-row scenario chips, compact account/form layout and sticky desktop risk panel. Logical tab order, validation and decision paths are preserved.
- Illustrated idle shield with no zero gauge before valid input. Evaluated risk uses smooth gauge animation, level-specific border/glow, and a calm red high-risk header with one restrained pulse. Reduced-motion preferences are respected.
- RU/KK trust strip describes real-time checks, clear explanations and locally saved demo records. Stronger secondary-text contrast, tabular numbers, consistent shadows/radii and hover/focus/error/disabled/busy states.
- Mobile safe-area bottom bar shows current risk and submits the same form; it adds no send-anyway path. Tablet/mobile bank queue uses cards instead of horizontal table scrolling.
- Dashboard uses the same header language, truthful KPI context labels (no invented historical trends), risk-colored charts and illustrated empty states. Aggregates and analyst behavior are unchanged.
- Localized titles/descriptions/Open Graph, language attribute, SVG shield favicon and themed HTTP 404 page. Browser metadata remains localized after Next streams default head tags. Numeric calendar labels avoid untranslated month abbreviations; editable KZT grouping remains valid in both languages.

## Exact demo results

All four scenarios were tested through the real `/api/score` response/UI and submission flows in **RU and KK**, at **1280×720**, **768×900** and **360×900** (24 scenario/language/viewport cases).

| Scenario | Score | Level | Decision |
| --- | ---: | --- | --- |
| Normal transfer | 0 | Low / Низкий / Төмен | Allow → success |
| Large night transfer to a new person | 60 | High / Высокий / Жоғары | Hold → cancel or bank review |
| Transfer to a suspicious account | 85 | High / Высокий / Жоғары | Hold → cancel or bank review |
| Many quick transfers + new device | 35 | Medium / Средний / Орташа | Confirm → success or cancel |

At 1280×720 the largest complete form ended at **713 px**, and the largest risk panel at **697.1 px**. All scenario cards fit without scrolling; the desktop panel remains sticky when content grows. No document/drawer horizontal overflow or browser exceptions were observed in the matrix.

## Validation

Use Node.js 24+; from the repository root:

```bash
cd web
npm install
npm run generate:mock
npm run lint
npm test
npm run build
npm run dev
```

Passed: lint, **45 tests**, production build, all 24 browser cases, desktop/card dashboard layouts, drawer/Escape/focus restoration, localized titles/404/Open Graph, SVG icon, reduced motion, live API error/retry and fail-closed mobile submission. Critical text palettes have an automated WCAG AA contrast guard; editable amount formatting has a round-trip test.

Mock regeneration matched SHA-256. A pre/post comparison confirmed all transactions and non-name customer/recipient fields are unchanged. `risk-engine.ts`, package declarations and lockfile have no diff from main.

## Manual review

1. Open http://localhost:3000 at 1280×720. Check the gradient/shield hero, trust strip, compact chips and two-column idle layout. With empty inputs, expect an illustrated shield and prompt, without a zero gauge.
2. Try all four scenarios and verify the exact table above. The complete form/action and risk card should fit at desktop demo size, including the night/new-recipient inputs. Fixed demo time is disclosed in the account summary and can be reset.
3. Submit normal: success. Submit quick transfers: confirmation with reasons/tip, then confirm or cancel. Submit either high scenario: hold, with cancel/review only. No high-risk send-anyway option.
4. Repeat in KK. Blur a formatted amount before submitting; it must remain valid. Check labels, options, errors, empty states, dates, notifications, titles and `html lang`; only proper names and account identifiers remain data.
5. At 768 px, check the form and dashboard cards. At 360 px, check no horizontal overflow, the fixed safe-area risk/action bar and that it disappears for decision screens. Its action must follow the same validated decision flow.
6. Visit `/dashboard`: check the matching gradient header, unchanged KPIs, neutral snapshot labels, risk chart palette and names. Open a drawer; verify comparison/decision text, keyboard focus, Escape and unchanged analyst status persistence.
7. Enable reduced motion: gauge/pulse should not animate. Make `/api/score` fail: expect the friendly error and retry; submission must not succeed without scoring. Check focus rings, disabled/busy controls and readable risk labels with icons.
8. Switch languages and navigate/reload across both screens and an unknown URL. Check localized titles/descriptions/Open Graph and themed 404, then verify `/icon.svg` serves the shield.

## Delivery

Intended PR title: **Visual polish and QA**. Per user instruction, no PR API calls were made. Review description and exact scores are saved here.

Compare: https://github.com/ramazanabdimalik/ITU-HACKATHON/compare/main...chore/polish
