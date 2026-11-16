import { dashboardCharts } from "./dashboard-data";
import type { DashboardTransaction } from "./dashboard-data";
import { explainRisk } from "./explain";
import { bankDictionaries, redesignDictionaries } from "./i18n";
import type { Language } from "./i18n";
export function demoBalance(customerId: string) { return 2500000 + (Number(customerId.split("-").at(-1)) || 1) * 175000; }
export function homeData(all: readonly DashboardTransaction[], customerId: string) {
  const rows = all.filter((tx) => tx.customerId === customerId).sort((a, b) => b.timestamp.localeCompare(a.timestamp) || b.receivedAt.localeCompare(a.receivedAt) || a.id.localeCompare(b.id));
  const stopped = (tx: DashboardTransaction) => tx.status === "held" || tx.status === "blocked";
  const high = rows.filter((tx) => tx.riskLevel === "high");
  return { rows, total: rows.length, stopped: rows.filter((tx) => tx.riskLevel !== "low" && stopped(tx)).length,
    highShare: high.length ? high.filter(stopped).length / high.length * 100 : null,
    recent: rows.slice(0, 4), latestFlagged: rows.find((tx) => tx.riskLevel !== "low"), highRisk: high[0], daily: dashboardCharts(rows).daily.slice(-7) };
}
export function homeInsights(tx: DashboardTransaction | undefined, lang: Language) {
  if (!tx) return [];
  const bank = bankDictionaries[lang], copy = redesignDictionaries[lang];
  const explanation = explainRisk({ score: tx.riskScore, level: tx.riskLevel, action: tx.riskLevel === "high" ? "hold" : tx.riskLevel === "medium" ? "confirm" : "allow", signals: tx.signals }, lang);
  const items = tx.signals.slice(0, 3).map((s, i) => ({ title: bank[s.id], text: explanation.reasons[i] }));
  if (items.length < 3) items.push({ title: copy.tip, text: explanation.tip });
  if (items.length < 3) items.push({ title: copy.insightReview, text: explanation.summary });
  return items.slice(0, 3);
}
