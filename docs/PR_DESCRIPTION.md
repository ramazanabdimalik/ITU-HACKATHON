# Redesign v2

Rebuilds the three-screen demo around the supplied cloud/shield reference: indigo-violet accents, soft lavender background, rounded white cards and calm SVG illustrations. Existing scoring, API contracts, seeded scenarios, local transaction storage and analyst decisions are preserved.

## Changes

- Working desktop sidebar and mobile three-item bottom navigation: Home `/`, Transfer `/transfer`, Bank dashboard `/dashboard`. The notification bell uses the actual pending-review count; the user chip opens the eight-customer selector. No dead decorative controls.
- Attached-reference follow-up: compact mobile account/actions, two-line greeting, faint SVG clouds and recent transfers immediately below the security/alert cards; localized weekday chart labels retain dated tooltips.
- New selected-customer Home overview: Almaty greeting, cloud/shield protection hero, computed demo statistics, existing fake balance, quick-transfer prefill, interactive seven-day SVG area chart, four recent transfers and three explanations/tips derived from `explainRisk`.
- Statistics describe stored demo records, not model accuracy. For the first seeded customer: 41 checked, 2 suspicious held/blocked, 100% of its 2 high-risk records held/blocked. No high-risk denominator displays a dash. The AI label explicitly discloses rules/templates without a trained model.
- Amount-first transfer form and live gauge retain the real scoring API. Desktop form/panel fit at 1280×720. Mobile action/risk strip and decision toasts sit above bottom navigation. HIGH has a red alert, semicircle gauge, at most three reasons, safety tip and Cancel/Request review only.
- Analyst KPIs, table/mobile cards and SVG charts share the violet palette. The detail drawer becomes a rounded mobile bottom sheet with preserved focus trap, Escape, confirmation and persistent Block/Allow actions.
- Full RU/KK copy, localized metadata/404/cloud favicon, readable 12 px minimum labels, tabular money/scores, visible focus, 44 px touch controls and reduced-motion support.
- Bundles pinned `@fontsource-variable/inter` 5.3.0, the explicitly authorized single dependency exception. Only Latin, Cyrillic and Cyrillic Extended normal faces are declared, weights 400–700. The package has no separate subset CSS entrypoints, so `web/app/fonts/inter.css` selects its three local WOFF2 files with upstream Unicode ranges. Kazakh glyphs come from Inter, not a fallback. No build-time font download, Google font import, environment setting or external image is required. The requested system stack is the last fallback.

## Exact demo scores

The four buttons use the existing fixed scenario timestamp and first customer. Results are identical in RU/KK and at all tested viewport sizes; no weights changed.

| Russian scenario name | Kazakh scenario name | Score | Level | Submit flow |
| --- | --- | ---: | --- | --- |
| Обычный перевод | Қалыпты аударым | 0 | Low / Низкий / Төмен | Success |
| Крупный ночной перевод новому человеку | Жаңа адамға түнгі ірі аударым | 60 | High / Высокий / Жоғары | Hold → cancel or bank review |
| Подозрительный счёт | Күдікті шот | 85 | High / Высокий / Жоғары | Hold → cancel or bank review |
| Много быстрых переводов | Көп жылдам аударым | 35 | Medium / Средний / Орташа | Confirmation → success or cancel |

The quick-transfer scenario includes the existing new-device signal; velocity alone is 20 points. API scoring remains authoritative; the UI does not recalculate scores. Local arrivals and analyst decisions do not change the seeded server scoring history.

## Run and validate

Node.js 24+; from the repository root:

```bash
cd web
npm install
npm run lint
npm test
npm run build
npm start
```

Open http://localhost:3000. For development, use `npm run dev` instead of `npm start`.

Validation: lint, all **53 unit tests**, production build, and the real-API browser matrix for **24 scenario/language/viewport cases** (RU/KK × 1280×720, 768×900, 360×900 × four scenarios). Browser checks include computed Home metrics, customer changes, query prefill, chart tooltips, pending counts, all submission decisions, analyst confirmation, drawer focus trap/Escape/restore, navigation with an undismissed toast, metadata/404, and no horizontal overflow or uncaught browser exceptions.

At 1280×720 the largest form ends at **700 px** and the largest live risk panel at **684.6 px**.

Additional checks cover persisted language, direct query/customer changes, reduced motion, API failure/retry and fail-closed submission, empty Home data, denied storage/session fallback, and cross-tab review/count updates. Existing engine, API, mock fixture, scenario definitions, and store are unchanged. Dependency manifests/lockfile change only for the explicitly approved Inter package.

## Manual review

1. At `/` in 1280×720, inspect the sidebar, cloud hero and cards. Switch profiles using the user chip: greeting, balance, totals, recents and insights should follow the profile. The bank dashboard remains an all-customer view.
2. Hover/tap a chart point or focus/click a dated button; the tooltip shows its actual count. Check keyboard focus and empty-state behavior.
3. Select a known recipient and amount in Quick transfer; Continue opens `/transfer` with both values filled. Direct links also respect the customer parameter; subsequent manual customer selection still works.
4. Run every scenario in the table in both languages. Verify its exact score and level; normal completes, medium asks for confirmation, high only offers cancellation/review. Request review and check `pending_review` and the notification count.
5. At 360 and 768 px, check the three-item navigation, mobile Home account/alert and transfer action strip above navigation. No horizontal scrolling or covered controls. In HIGH decision, check the two full-width actions and safety tip.
6. Open `/dashboard`: filter/sort, open a record, inspect signal bars/profile comparison, confirm Block or Allow, and reload to verify persistence. On mobile the drawer is a bottom sheet. Tab/Shift+Tab remain inside; Escape restores the opener. Leave the toast visible and navigate successfully.
7. In another tab on the same origin, submit a suspicious transfer for review. The dashboard feed/count and bell update without reload; returning Home reflects the same stored record.
8. Switch RU/KK, navigate and reload; check all text, metadata and `html lang`, including an unknown URL. Enable reduced motion. Fail `/api/score`: a friendly retry appears and submit cannot complete. Deny localStorage: session behavior remains usable with persistence warnings.

## Delivery

PR title: **Redesign v2**. Per instruction, no PR API calls are made; this document is the review description. The branch is pushed and then merged into main using the explicitly authorized merge/check/push procedure.

Stable comparison against the pre-redesign main (remains useful after merge):
https://github.com/ramazanabdimalik/ITU-HACKATHON/compare/9de27b1...chore/redesign-v2
