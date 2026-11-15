# Risk engine progress

- [x] 1. Types in `web/lib/types.ts`: Customer, Recipient, Transaction, RiskSignal and RiskResult.
- [x] 2. Deterministic generator `web/scripts/generate-mock.ts`: 8 customers, 20 recipients (3 flagged), about 300 transactions over 30 days, about 10% fraud patterns; fixed now and fake data.
- [x] 3. Pure risk engine `web/lib/risk-engine.ts`, exported weights, machine-readable signals, score cap/floor and level/action thresholds.
- [x] 4. Russian (default) and Kazakh i18n and template-based explanations with a strongest-signal anti-scam tip.
- [ ] 5. Validated POST /api/score and GET /api/transactions routes, with clear 400 errors.
- [ ] 6. Add Vitest as the only new dev dependency, about 10 engine tests and an npm test script.
- [ ] 7. Run lint, tests and build; fix errors; document signals, mock generation and tests in README.
- [ ] 8. Mark the Pull Request ready and finalize its description.

## Notes

- Started from main a510bed on feature/risk-engine; skeleton progress preserved in docs/PROGRESS-skeleton.md. Next: define types and open the draft PR. hackathon-mvp was absent from cloud/executor skill catalogs and filesystem search; following the explicit task. Node 24 native type stripping avoids adding tsx; timestamps use Asia/Almaty for typical hours.

- Step 1 complete: shared types define KZT amounts, statuses, signal params and the scoring input. Next: deterministic mock generation.

- Step 2 complete: generated 8 fake customers, 20 recipients (3 flagged) and 300 transfers, including 30 pattern transfers. Repeated generation matched SHA-256. Native Node TypeScript adds no dependency; provisional scores will be replaced in step 3. Draft PR creation returned Forbidden from api.github.com; Git pushes work. Next: integrate the risk engine and regenerate scores.

- Step 3 complete: pure engine and centralized config implement all signals, non-stacking amount tiers, inclusive 10-minute history, 85 flagged floor and 100 cap. Mock data now scored chronologically; regeneration remains byte-identical (278 low / 10 medium / 12 high). Next: ru/kk explanations and tips.

- Step 4 complete: Russian/default and Kazakh dictionaries render a summary, signal reasons and one strongest-signal tip; all 300 transfers rendered in both languages without unfilled placeholders. Tips give general advice, without guarantees. Next: validated API routes.
