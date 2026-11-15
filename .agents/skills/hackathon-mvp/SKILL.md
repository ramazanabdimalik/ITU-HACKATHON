## Case context
- Case: BCC Bank FINTECH CASE. Goals: prevent financial fraud, protect clients during money transfers, detect suspicious transactions, build intelligent bank security mechanisms using AI.
- Product: "SafeTransfer", an AI-assisted protection layer that scores every money transfer in real time (risk 0-100) and explains the risk in plain language, plus a bank analyst dashboard for suspicious transactions.
- Core feature 1 (client side): transfer form with live risk check, risk level (Low / Medium / High), recommended action (allow / extra confirmation / hold) and a human-friendly explanation with anti-scam tips.
- Core feature 2 (bank side): dashboard of flagged transactions with risk score, reasons, analyst decision (block / allow) and simple statistics charts.
- Risk engine lives in `web/lib/risk-engine.ts` as a pure, testable function, exposed through `/api/score`. All data is fake (`web/data/mock.json`).
- UI languages: Russian (default) and Kazakh. All user-facing strings go through `web/lib/i18n.ts`.
- Design: premium fintech look, calm trustworthy colors, clear typography, risk levels shown with color AND text/icon (not color only).
