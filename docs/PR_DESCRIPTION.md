# Bank analyst dashboard

Replaces the `/dashboard` placeholder with the SafeTransfer analyst workspace, reusing the shared layout, Inter/navy/teal design system, risk gauge, icons, explanation templates and RU/KK language switch.

## Changes

- ID-based merge of API history, local client transfers and versioned local analyst decisions. Local records override matching API IDs; decisions change status only. Empty, malformed and denied storage are handled safely, with session fallback and an explicit persistence warning.
- Animated KPI cards for total records, medium/high-risk count, held/blocked KZT amount and average risk, independent of queue filters. Reduced motion is supported.
- Flagged-by-default queue with risk/status filters, risk/time sorting, incremental loading, desktop table, mobile cards and resettable empty state.
- Keyboard-operable native modal drawer with explicit focus trap, Escape/backdrop close and focus restoration. Shows score, per-signal points/explanations, customer-behavior comparison and confirmed Block/Allow decisions with a modal-accessible notification. Block sets blocked; Allow sets completed. Neither changes scores or engine weights.
- SVG/CSS charts for daily flagged transfers, risk distribution and signal frequency, with text/data alternatives and empty states. Daily bins cover 30 Almaty calendar days ending on the newest transaction date; other aggregates cover all merged records.
- Live feed via storage/custom events and two-second local polling. New client IDs are highlighted and matching queue rows are pinned; updates to existing IDs do not duplicate arrivals.

No new libraries, real data, secrets, database or engine-weight changes. Decisions are local to the browser; the API fixture remains unchanged. The client-profile selector is hidden on the all-customer analyst view.

## Validation

From the repository root, using Node.js 24+:

```bash
cd web
npm install
npm run lint
npm test
npm run build
npm run dev
```

Lint passed, all 39 tests passed, and the production build passed. Unit coverage includes merge precedence/immutability, status-only decisions, KPI arithmetic, filters/sort/pinning, 30-day Almaty chart boundaries, empty summaries, dictionary parity and analyst storage failures.

Production browser checks passed for desktop and 360 px, without horizontal overflow or browser exceptions: fresh KPI counts (300 total/22 flagged), charts, confirmed/cancelled decisions, reload persistence, filters/empty/sorting, RU/KK persistence, focus trapping/Escape/restoration, and cross-tab client arrivals with pending_review and updated counts (301/23). Fault checks covered empty API/chart states, API failure with retained local records and successful retry, malformed decisions, denied storage/session language and decision persistence warnings.

## Manual test steps

1. Open http://localhost:3000/dashboard with fresh browser storage. Expect 300 total records, 22 flagged, 2,549,938 KZT held/blocked and average risk about 4.3. The queue defaults to medium/high; KPIs/charts cover all records.
2. Change level/status filters and risk/time sort. Try low + held for an empty state, then reset. Select all levels and load more rows.
3. Open a row by clicking it or pressing Enter on its customer button. Inspect the score, readable signal points, score-floor/cap note, tip and typical-versus-current comparison.
4. Tab/Shift+Tab must stay in the drawer. Escape closes it and restores focus. Check close button and backdrop behavior, including a record that disappears from the active filter after a decision.
5. Choose Block and cancel the confirmation: no change. Choose Block again and confirm: status becomes blocked immediately and a notification appears inside the drawer. Dismiss it. Original risk score remains unchanged.
6. Choose Allow and confirm: status becomes completed, even for high risk. Check the confirmation warning, changed held/blocked sum and unchanged risk score. Reload: the decision should persist under one transaction ID in safetransfer.analyst-decisions.v1.
7. Keep the dashboard open. In another tab on the same origin, use the client suspicious-account scenario, continue and request bank review. Expect one new feed entry, a highlighted/pinned matching queue row with pending_review, total 301 and flagged 23. Open it from the feed. Normal low-risk arrivals remain in the feed even if filtered out of the queue.
8. Switch RU/KK, reload, and check filters, statuses, explanations, charts and confirmation text. Test desktop and 360 px cards/drawer, visible keyboard focus and reduced motion.
9. Return an empty API array: expect zero KPIs and sensible chart/queue empty states. Make the API return an error: retained local records remain available; restore access and retry to merge the full history.
10. Corrupt local decision storage: no crash. Block localStorage: decisions still update for this session with a warning; language switching remains usable. These fallback decisions are not guaranteed after reload.
11. Navigate back to Transfer and verify its scenarios and client decision flows still work. No real bank operation is performed.

## Review delivery

Intended PR title: **Bank analyst dashboard**. Per the established user override for the blocked PR API, review details are saved here and the branch is pushed without PR API calls.

Compare: https://github.com/ramazanabdimalik/ITU-HACKATHON/compare/main...feature/bank-dashboard
