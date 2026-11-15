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
- [ ] 7. Localize all new text in RU/KK.
- [ ] 8. Audit responsive layout, semantics, keyboard drawer/focus trap/Esc and AA contrast.
- [ ] 9. Lint, tests, build and browser validation; README Bank dashboard section.
- [ ] 10. Finalize review description and manual tests, push branch and deliver PR/compare link.

### Bank dashboard Notes

- Verified main 48fd83d contains the merged client screen, store and design tokens; read hackathon-mvp and started feature/bank-dashboard. Next: safe dashboard data merge and analyst decision persistence. PR review details will be saved locally using the established proxy workaround; no PR API calls.

- Bank dashboard step 1 complete: immutable ID-based merge, client records overriding matching mock IDs, analyst decisions overriding only status, versioned/validated decision storage with SSR/corrupt/denied-storage handling and session fallback. Async API hook supports error/retry and optimistic decisions. Next: KPI cards.

- Bank dashboard step 2 complete: all-data KPIs include total, medium/high count, held/blocked KZT sum and mean risk. 200 ms count-up respects reduced motion and exposes final values to screen readers; loading skeletons and API error/retry are shown. Replaced the dashboard placeholder using the shared shell. Next: filtered responsive transaction queue.

- Bank dashboard step 3 complete: default medium/high queue, level/status filtering, risk/time sorting, 30-row incremental loading, semantic desktop table and mobile cards, risk/status icons with text and resettable empty state. Next: transaction detail drawer and analyst confirmations.

- Bank dashboard step 4 complete: native modal drawer with focus trap/Esc/restore, reusable extracted score gauge, explainRisk breakdown and weighted bars, profile comparison, explicit block/allow confirmations and immediate persisted status updates. Toast reports decisions and storage failures; scores remain unchanged. Next: accessible charts.

- Bank dashboard step 5 complete: 30 Almaty-calendar-day flagged bars anchored to newest data, risk donut with icon/text legend and frequent-signal bars. Each has localized title, accessible text/data alternative and empty/loading state. KPI/charts use full merged data, not queue filters. Next: automatic client arrivals and live feed.

- Bank dashboard step 6 complete: storage events, same-document custom events and two-second local polling detect new client IDs and analyst updates without API polling. Live feed shows new arrivals with status and detail buttons; matching queue rows are pinned and highlighted, honoring active filters. Client store now emits safe update events. Next: RU/KK text and interaction audit.
