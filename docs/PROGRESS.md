# Risk engine progress

- [x] 1. Types in `web/lib/types.ts`: Customer, Recipient, Transaction, RiskSignal and RiskResult.
- [x] 2. Deterministic generator `web/scripts/generate-mock.ts`: 8 customers, 20 recipients (3 flagged), about 300 transactions over 30 days, about 10% fraud patterns; fixed now and fake data.
- [x] 3. Pure risk engine `web/lib/risk-engine.ts`, exported weights, machine-readable signals, score cap/floor and level/action thresholds.
- [x] 4. Russian (default) and Kazakh i18n and template-based explanations with a strongest-signal anti-scam tip.
- [x] 5. Validated POST /api/score and GET /api/transactions routes, with clear 400 errors.
- [x] 6. Add Vitest as the only new dev dependency, about 10 engine tests and an npm test script.
- [x] 7. Run lint, tests and build; fix errors; document signals, mock generation and tests in README.
- [ ] 8. Mark the Pull Request ready and finalize its description.

## Notes

- Started from main a510bed on feature/risk-engine; skeleton progress preserved in docs/PROGRESS-skeleton.md. Next: define types and open the draft PR. hackathon-mvp was absent from cloud/executor skill catalogs and filesystem search; following the explicit task. Node 24 native type stripping avoids adding tsx; timestamps use Asia/Almaty for typical hours.

- Step 1 complete: shared types define KZT amounts, statuses, signal params and the scoring input. Next: deterministic mock generation.

- Step 2 complete: generated 8 fake customers, 20 recipients (3 flagged) and 300 transfers, including 30 pattern transfers. Repeated generation matched SHA-256. Native Node TypeScript adds no dependency; provisional scores will be replaced in step 3. Draft PR creation returned Forbidden from api.github.com; Git pushes work. Next: integrate the risk engine and regenerate scores.

- Step 3 complete: pure engine and centralized config implement all signals, non-stacking amount tiers, inclusive 10-minute history, 85 flagged floor and 100 cap. Mock data now scored chronologically; regeneration remains byte-identical (278 low / 10 medium / 12 high). Next: ru/kk explanations and tips.

- Step 4 complete: Russian/default and Kazakh dictionaries render a summary, signal reasons and one strongest-signal tip; all 300 transfers rendered in both languages without unfilled placeholders. Tips give general advice, without guarantees. Next: validated API routes.

- Step 5 complete: score and transactions APIs validate JSON, IDs, positive KZT amounts, ISO calendar dates, languages, filters and limits. 32 HTTP requests passed against the existing development server, including invalid-input 400s. Scoring is read-only; GET sorts by descending score. Next: Vitest engine tests.

- Step 6 complete: Vitest 4.1.12 is the only added direct dev dependency (v5 conflicts with existing @types/node 20); 12 engine tests and 2 explanation tests passed. Next: lint/build, production API verification and README documentation.

- Step 7 complete: lint, all 15 Vitest tests and production build passed. Fixed generated JSON tuple/literal inference at the loader boundary and added a fixture test checking all 300 stored scores. All 32 API checks passed in both development and production. README documents signal rules, Node 24 native mock generation, API usage and tests. No UI files changed. Next: finalize PR description and mark PR ready, currently blocked by GitHub API access.

- Step 8 blocked: finalized the review description and test instructions in docs/PR_DESCRIPTION.md, but no PR could be created or marked ready: gh pr create returned Forbidden for api.github.com/graphql, and this environment's proxy blocks api.github.com. All implementation and validation steps are committed and pushed. Next: allow GitHub API access in environment network settings, then run `gh pr create --draft --base main --head feature/risk-engine --title "Risk engine + mock data" --body-file docs/PR_DESCRIPTION.md` and `gh pr ready` for that PR; leave step 8 unchecked until readiness is confirmed.

## Client UI

- [x] 1. Shared header, SafeTransfer logo, persisted RU/KK switcher, eight-customer selector and Transfer/Bank dashboard navigation.
- [x] 2. Account card with selected customer, masked card and fake balance.
- [x] 3. Validated recipient/new recipient, formatted KZT amount, device and time simulation form.
- [x] 4. Debounced API-backed live risk SVG gauge, accessible labels, signal chips, skeleton and error state.
- [x] 5. Low success, medium confirmation, high hold/review decision flows; no high-risk send anyway.
- [x] 6. One-click normal, large night/new person, suspicious account and quick-transfer scenarios with verified levels.
- [x] 7. Safe localStorage transaction persistence in web/lib/store.ts for a future dashboard.
- [x] 8. All UI copy localized in Russian and Kazakh.
- [x] 9. Lint, tests, build and UI validation; README screenshots placeholder and demo scenarios.
- [x] 10. Finalize PR title, description and manual tests locally; push branch and provide compare link (PR API omitted by user override).

### Client UI Notes

- Merged feature/risk-engine into main (17bc6d6) without conflicts; npm install, lint, 15 tests and build passed, main push succeeded and all required files were verified. Started feature/client-ui from updated main. hackathon-mvp read; next: shared layout and design tokens. Per user override, do not call PR API; save PR details in docs/PR_DESCRIPTION.md.

- Client UI step 1 complete: shared navigation, customer selector, safe persisted language switch, RU/KK copy, navy/teal theme tokens and locally hosted Inter via next/font. Next: account card.

- Client UI step 2 complete: responsive account card follows the selected customer and shows a clearly fake masked card and KZT demo balance. Next: validated form and new-recipient API support.

- Client UI step 3 complete: labeled/validated form, known and new recipients, KZT formatting and device/time simulation. Extended score API to accept validated DEMO-only new recipient details; scoring stays in the engine. Next: debounced live meter and error/loading states.

- Client UI step 4 complete: 400 ms API debounce, stale-request cancellation, score-key matching, accessible SVG gauge, readable signal chips and loading/error/retry states. Customer changes reset the form. Next: fresh-score submission and low/medium/high decisions.

- Client UI step 5 complete: submit performs a fresh API check; low succeeds, medium requires confirmation, and high can only cancel or request review. Decision screens show localized explanations/tips, focus the heading and keep an immutable submitted snapshot. Next: seeded one-click demo scenarios. Persistence is added in step 7.

- Client UI step 6 complete: one-click seeded scenarios verified with the engine: normal 0/low, large night/new person 60/high, flagged 85/high, quick transfers + new device 35/medium. Scenario timestamp/profile are disclosed, and the user can return to current time. Next: safe local transaction persistence.

- Client UI step 7 complete: versioned validated localStorage store, SSR/empty/corrupt/unavailable fallbacks and ID upserts. Saves completed/held/review requests; high cancellations are blocked with clientDecision=cancelled; medium cancellation never sends. Held-to-review preserves ID and becomes pending_review. Full new account text is not stored, only masked text; unavailable storage shows a warning and retains session data. Next: i18n/accessibility audit.

- Client UI step 8 complete: interface labels, validation, demo scenarios, decisions, storage warnings and accessibility text route through matching RU/KK dictionaries; explanations rerender in the active language. Fixed React lint by moving language writes into an external-store action; storage events and unavailable-storage session fallback are supported. Next: full tests, browser checks and README.

- Client UI step 9 complete: lint, all 27 tests and production build pass. Browser flows passed in development and production at desktop/360 px, including all scenario scores, low/medium/high decisions, review upserts, cancel, validation focus, KK persistence and dashboard navigation, without browser exceptions or mobile overflow. Error/retry, blocked storage/session language fallback, profile reset, keyboard focus and 400 ms debounce also passed. Fixed stale dev CSS by restarting the prior server, declared real CSS variables for the theme, constrained mobile fields/grid, animated the gauge and aborted abandoned submissions. README now includes demo scenarios, persistence semantics and screenshot placeholders; no dependencies or engine scoring logic changed. Next: finalize local PR details and push.

- Client UI step 10 complete: saved title "Client transfer screen", full description and eleven manual test steps in docs/PR_DESCRIPTION.md; branch committed and pushed for comparison with main. No PR API calls, per explicit user override. All Client UI steps are complete; next: user review at https://github.com/ramazanabdimalik/ITU-HACKATHON/compare/main...feature/client-ui. The prior risk-engine PR-readiness item was superseded by the authorized direct merge into main.

## Bank dashboard

- [x] 1. Merge API transactions, client local transactions and persisted analyst decisions safely.
- [x] 2. KPI cards: total, medium/high flagged, held/blocked KZT amount and average risk; animated count-up.
- [x] 3. Responsive flagged transaction table/cards, level/status filters, risk/time sorting and empty state.
- [x] 4. Accessible detail drawer with gauge, weighted signals, behavior comparison and confirmed block/allow actions with toast.
- [x] 5. Accessible daily flagged, risk distribution and frequent-signal charts using SVG/CSS.
- [x] 6. Live feed: detect client transfers, pin new arrivals and highlight them.
- [x] 7. Localize all new text in RU/KK.
- [x] 8. Audit responsive layout, semantics, keyboard drawer/focus trap/Esc and AA contrast.
- [x] 9. Lint, tests, build and browser validation; README Bank dashboard section.
- [x] 10. Finalize review description and manual tests, push branch and deliver PR/compare link.

### Bank dashboard Notes

- Verified main 48fd83d contains the merged client screen, store and design tokens; read hackathon-mvp and started feature/bank-dashboard. Next: safe dashboard data merge and analyst decision persistence. PR review details will be saved locally using the established proxy workaround; no PR API calls.

- Bank dashboard step 1 complete: immutable ID-based merge, client records overriding matching mock IDs, analyst decisions overriding only status, versioned/validated decision storage with SSR/corrupt/denied-storage handling and session fallback. Async API hook supports error/retry and optimistic decisions. Next: KPI cards.

- Bank dashboard step 2 complete: all-data KPIs include total, medium/high count, held/blocked KZT sum and mean risk. 200 ms count-up respects reduced motion and exposes final values to screen readers; loading skeletons and API error/retry are shown. Replaced the dashboard placeholder using the shared shell. Next: filtered responsive transaction queue.

- Bank dashboard step 3 complete: default medium/high queue, level/status filtering, risk/time sorting, 30-row incremental loading, semantic desktop table and mobile cards, risk/status icons with text and resettable empty state. Next: transaction detail drawer and analyst confirmations.

- Bank dashboard step 4 complete: native modal drawer with focus trap/Esc/restore, reusable extracted score gauge, explainRisk breakdown and weighted bars, profile comparison, explicit block/allow confirmations and immediate persisted status updates. Toast reports decisions and storage failures; scores remain unchanged. Next: accessible charts.

- Bank dashboard step 5 complete: 30 Almaty-calendar-day flagged bars anchored to newest data, risk donut with icon/text legend and frequent-signal bars. Each has localized title, accessible text/data alternative and empty/loading state. KPI/charts use full merged data, not queue filters. Next: automatic client arrivals and live feed.

- Bank dashboard step 6 complete: storage events, same-document custom events and two-second local polling detect new client IDs and analyst updates without API polling. Live feed shows new arrivals with status and detail buttons; matching queue rows are pinned and highlighted, honoring active filters. Client store now emits safe update events. Next: RU/KK text and interaction audit.

- Bank dashboard step 7 complete: KPI/table/filter/status/decision/chart/feed/error text and accessibility labels have matching RU/KK dictionaries; language switching re-explains signals. Dashboard explicitly covers all clients and hides the client-only profile selector. Optional browser notification failures cannot turn successful persistence into failure. Next: modal notifications, focus/semantics and responsive audit.

- Bank dashboard step 8 complete: production browser verified desktop and 360 px table/cards/drawer without overflow, native modal plus explicit Tab/Shift+Tab trap, Esc close, focus restoration, confirmation cancellation and semantic comparison table. Notifications are inside the active modal and remain dismissible; body scroll is restored. Fixed screen-reader chart-table overflow with a clipped wrapper. Risk/status legends use icons plus AA-contrast text; reduced motion is respected. Next: final regression tests, storage/API fault checks and README.

- Bank dashboard step 9 complete: lint, all 39 tests and production build pass. Production browser verified KPI counts (300/22), charts, decision confirm/cancel and reload persistence, filters/empty/sorting, RU/KK persistence, 360 px cards/drawer, focus trap/Esc/restore and cross-tab client arrivals (301/23, pinned pending_review). Additional browser checks passed for empty API/chart states, malformed decisions, API failure with local records and retry, denied storage/session language and optimistic decision warnings. README documents data precedence, KPI/chart scope, live-feed filters and manual checks. No libraries or engine weights changed. Next: finalize local review description and push.

- Bank dashboard step 10 complete: saved title "Bank analyst dashboard", final description, validation evidence and eleven manual test steps in docs/PR_DESCRIPTION.md. All dashboard steps are committed and pushed; review at https://github.com/ramazanabdimalik/ITU-HACKATHON/compare/main...feature/bank-dashboard. No PR API calls under the established user override; no engine weights or dependencies changed. Next: user review/merge on GitHub.

## Polish

- [x] 1. Realistic Kazakhstan-style fake names; deterministic regeneration and unchanged fraud/scenario results.
- [x] 2. Complete RU/KK language consistency for labels, options, states and notifications.
- [x] 3. Compact gradient/shield hero, one-row scenario chips and side-by-side client form/risk at 1280×720.
- [x] 4. Illustrated idle risk panel, smooth gauge and level-specific border/glow/icon treatment.
- [x] 5. Localized three-item trust strip under hero.
- [x] 6. Consistent typography, tabular amounts/scores, spacing, contrast and control states.
- [x] 7. 360 px mobile sticky risk/action bar, no overflow and dashboard cards.
- [x] 8. Dashboard gradient header, KPI icon/trend treatment and consistent charts/empty states.
- [x] 9. Page metadata, shield favicon, Open Graph, localized 404 and language attribute.
- [x] 10. Lint/tests/build and four scenarios in both languages at 1280/768/360; exact scores in review description.
- [x] 11. Final review title/description, all commits pushed and GitHub compare link.

### Polish Notes

- Step 0 complete: merged feature/bank-dashboard into main as 290cb4b without conflicts; npm install, lint, 39 tests and build passed, main push succeeded. Started chore/polish from updated main; hackathon-mvp read. No further main commits and no PR API calls. Next: fake names without changing deterministic transaction data.

- Polish step 1 complete: replaced generic names with fixed realistic abbreviated Kazakh/Russian fake names and regenerated data. Verified that every transaction, score, ID and all non-name customer/recipient fields are byte-equivalent to the baseline; no RNG calls added. Next: language consistency.

- Polish step 2 complete: audited translated labels/states/options; localized Kazakh profile/demo/footer labels and Қарағанды. Seeded names replace obsolete generic labels on older saved records without altering stored scores. Proper names and account identifiers stay data. Next: compact above-fold client layout.

- Polish step 3 complete: compact gradient/shield hero, single-row scenario chips with full accessible names, compact account/form and desktop side-by-side grid. Preserved logical field/tab order and existing validation/submission behavior. Shared header spacing reduced; final 1280×720 bounds checked in QA. Next: risk panel treatments.

- Polish step 4 complete: illustrated shield idle state with translated instant-check prompt (no gauge until valid input), compact animated gauge, green/amber/red panel border/glow and tinted high-risk header with one 240 ms icon pulse. Motion respects reduced-motion preferences. Next: localized trust strip.

- Polish step 5 complete: compact icon/text trust strip for real-time checking, clear explanations and browser-local saved demo records in RU/KK. Privacy wording describes saved records accurately; scoring still uses the existing API. Next: shared typography, contrast and controls.

- Polish step 6 complete: stronger secondary-text contrast, shared real shadow token, tabular numeric fields/data, compact consistent controls and hover/focus/disabled/busy/error states. Fixed a KK numeric-format edge case with shared space-grouped KZT entry formatting and a round-trip test; no scoring changes. Next: mobile risk/action bar and overflow checks.

- Polish step 7 complete: safe-area-aware fixed mobile bar shows live risk text/icon/score and submits the same validated form; hides during decision screens, with no extra send path. Content/focus padding avoids occlusion. Dashboard uses cards below 1024 px, including tablet, rather than a horizontally scrolling table. Next: dashboard visual alignment.

- Polish step 8 complete: shared gradient/shield header on dashboard, compact icon KPIs with truthful snapshot/context labels rather than invented historical trends, amber/red chart treatment aligned with risk colors, illustrated empty chart states and unchanged aggregates. Next: metadata, icon and localized 404.

- Polish step 9 complete: localized page titles/descriptions and Open Graph text/locale, self-contained SVG shield favicon and custom themed RU/KK 404. Language changes update html lang and page metadata; no invented deployment URL. Next: full scenario/layout QA and exact score evidence.

- Polish QA checkpoint: tightened high-scenario card spacing, integrated the fixed timestamp into the account card, kept visible commission information and safe 44 px fields, and changed calendar labels to numeric dates for consistent KK rendering. Build passes. Found and fixed root 404 metadata inheritance using its supported metadata export; full 24-case matrix is still in progress.

- Polish step 10 complete: lint, 45 tests and production build pass. All 24 real-API scenario/decision cases passed in RU/KK at 1280×720, 768×900 and 360×900, including dashboard/drawer, metadata/404 and no horizontal overflow/browser exceptions. Largest desktop form bottom 713 px; risk panel 697.1 px. Motion/error/retry/fail-closed submission and HTTP 404/icon checks passed. Added guarded late-head localization and contrast/name/metadata tests; all critical text palette pairs meet AA. Exact 0/low, 60/high, 85/high and 35/medium results are recorded in docs/PR_DESCRIPTION.md. Regeneration SHA matches and transactions are unchanged. Next: final push and compare link.

- Polish step 11 complete: all source, QA evidence, review title "Visual polish and QA", exact scenario scores and manual steps are committed and pushed on chore/polish. No PR API calls or further main commits. Review: https://github.com/ramazanabdimalik/ITU-HACKATHON/compare/main...chore/polish. Next: user review/merge.

## Docs

- [x] 1. Russian jury README with Kazakh tagline, architecture, real risk weights, explanations, limitations, commands, exact scenarios and four screenshot placeholders.
- [x] 2. Russian three-minute click-by-click demo script and five-minute timed pitch outline.
- [x] 3. Twelve concise Russian jury questions and honest implementation-based answers.
- [x] 4. Check tracked data/secrets and env handling; verify lint, tests and build.
- [ ] 5. Save Submission docs review description, push everything and provide compare link.

### Docs Notes

- Step 0 complete: merged chore/polish into main (9de27b1), no conflicts; npm install, lint, 45 tests and build passed, main push succeeded. Created docs/submission from updated main; hackathon-mvp read. Documentation only, no PR API calls. Exact four scenarios recomputed against the engine: 0/low, 60/high, 85/high, 35/medium. Next: jury README.

- Docs step 1 complete: jury README rewritten in Russian with Kazakh tagline, Mermaid architecture, code-derived weights/thresholds, exact four results and visible scenario names, current-vs-future AI distinction, honest storage/integration/accuracy limitations, commands and four screenshot placeholders. Next: timed demo/pitch script.

- Docs step 2 complete: three-minute Russian script has exact visible chip/button names, spoken lines, reproducible two-tab preparation and failure fallbacks. Five-minute pitch totals five minutes with a separate two-minute demo, avoiding a timing overrun. Next: twelve jury Q&As.

- Docs step 3 complete: twelve Russian Q&As cover accuracy/false positives, current rules vs future AI, SMS complementarity, API/privacy boundaries, scaling/integration, Kazakhstan regulatory review, explanation safety, failure/tampering limits, thresholds and pilot metrics. No invented performance or accuracy claims. Next: repository/secret/env audit and final checks.

- Docs step 4 complete: scanned 241 reachable text blobs across Git history for recognized credential/private-key/credential-URL patterns: zero hits; no tracked sensitive env/key files. Verified env ignore cases and comment-only example; fixture IDs/DEMO accounts and generator confirm synthetic financial data. Lint, all 45 tests and build passed. Documentation links/fences, four screenshot placeholders and 12 ordered Q&As passed checks. Diff from main contains documentation only. Next: final Submission docs description and compare link.
