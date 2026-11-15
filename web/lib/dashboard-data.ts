import type { Customer, Recipient, Transaction } from "./types";
import type { DemoTransaction } from "./store";

export interface AnalystDecision { transactionId: string; action: "block" | "allow"; decidedAt: string; }
export interface DashboardTransaction extends Transaction {
  customerName: string;
  recipientName: string;
  maskedAccount: string;
  source: "mock" | "local";
  receivedAt: string;
  analystDecision?: AnalystDecision;
}
export const DECISION_STORAGE_KEY = "safetransfer.analyst-decisions.v1";
let fallback: AnalystDecision[] = [];
function isDecision(value: unknown): value is AnalystDecision {
  if (!value || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  return typeof d.transactionId === "string" && d.transactionId.length > 0 && (d.action === "block" || d.action === "allow") && typeof d.decidedAt === "string" && Number.isFinite(Date.parse(d.decidedAt));
}
export function getAnalystDecisions(): AnalystDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DECISION_STORAGE_KEY) ?? "null");
    const envelope = value as { version?: number; decisions?: unknown[] } | null;
    const saved = envelope?.version === 1 && Array.isArray(envelope.decisions) ? envelope.decisions.filter(isDecision) : [];
    return [...new Map([...saved, ...fallback].map((d) => [d.transactionId, d])).values()];
  } catch { return [...fallback]; }
}
export function saveAnalystDecision(decision: AnalystDecision): boolean {
  if (typeof window === "undefined" || !isDecision(decision)) return false;
  const next = [...new Map([...getAnalystDecisions(), decision].map((d) => [d.transactionId, d])).values()].slice(-1000);
  let saved = true;
  try { localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify({ version: 1, decisions: next })); fallback = []; }
  catch { fallback = next; saved = false; }
  try { window.dispatchEvent(new Event("safetransfer-decisions")); } catch { /* Polling remains available. */ }
  return saved;
}
/** Local records override matching API IDs; decisions override status only. */
export function mergeDashboardTransactions(api: readonly Transaction[], local: readonly DemoTransaction[], decisions: readonly AnalystDecision[], customers: readonly Customer[], recipients: readonly Recipient[]): DashboardTransaction[] {
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const recipientMap = new Map(recipients.map((r) => [r.id, r]));
  const decisionMap = new Map(decisions.map((d) => [d.transactionId, d]));
  const rows = new Map<string, DashboardTransaction>();
  for (const tx of api) rows.set(tx.id, { ...tx, customerName: customerMap.get(tx.customerId)?.name ?? tx.customerId, recipientName: recipientMap.get(tx.recipientId)?.name ?? tx.recipientId, maskedAccount: recipientMap.get(tx.recipientId)?.maskedAccount ?? "DEMO ****", source: "mock", receivedAt: tx.timestamp });
  for (const tx of local) rows.set(tx.id, { ...tx, customerName: customerMap.get(tx.customerId)?.name ?? tx.customerId, source: "local", receivedAt: tx.createdAt });
  return [...rows.values()].map((tx) => {
    const decision = decisionMap.get(tx.id);
    return decision ? { ...tx, status: decision.action === "block" ? "blocked" : "completed", analystDecision: decision } : tx;
  });
}

export function dashboardStats(transactions: readonly Transaction[]) {
  return {
    total: transactions.length,
    flagged: transactions.filter((tx) => tx.riskLevel !== "low").length,
    prevented: transactions.reduce((sum, tx) => sum + (tx.status === "held" || tx.status === "blocked" ? tx.amount : 0), 0),
    average: transactions.length ? transactions.reduce((sum, tx) => sum + tx.riskScore, 0) / transactions.length : 0,
  };
}

export type LevelFilter = "all" | "flagged" | Transaction["riskLevel"];
export type StatusFilter = "all" | Transaction["status"];
export function filterDashboardTransactions(rows: readonly DashboardTransaction[], level: LevelFilter, status: StatusFilter, sort: "risk" | "time", pinned: readonly string[] = []) {
  const positions = new Map(pinned.map((id, i) => [id, i]));
  return rows.filter((tx) => (level === "all" || (level === "flagged" ? tx.riskLevel !== "low" : tx.riskLevel === level)) && (status === "all" || tx.status === status)).sort((a, b) => {
    const aPin = positions.get(a.id), bPin = positions.get(b.id);
    if (aPin !== undefined || bPin !== undefined) return (aPin ?? Infinity) - (bPin ?? Infinity);
    return (sort === "risk" ? b.riskScore - a.riskScore : b.timestamp.localeCompare(a.timestamp)) || b.timestamp.localeCompare(a.timestamp) || a.id.localeCompare(b.id);
  });
}

export function dashboardCharts(rows: readonly Transaction[]) {
  const distribution = { low: 0, medium: 0, high: 0 };
  const frequencies = new Map<Transaction["signals"][number]["id"], number>();
  const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty", year: "numeric", month: "2-digit", day: "2-digit" });
  const latest = rows.reduce((value, tx) => Math.max(value, Date.parse(tx.timestamp)), -Infinity);
  const daily: { day: string; count: number }[] = [];
  if (Number.isFinite(latest)) {
    const end = Date.parse(dayFormat.format(new Date(latest)) + "T00:00:00Z");
    for (let i = 29; i >= 0; i--) daily.push({ day: new Date(end - i * 86400000).toISOString().slice(0, 10), count: 0 });
  }
  const dayMap = new Map(daily.map((d) => [d.day, d]));
  for (const tx of rows) {
    distribution[tx.riskLevel]++;
    if (tx.riskLevel !== "low") {
      const day = dayMap.get(dayFormat.format(new Date(tx.timestamp)));
      if (day) day.count++;
    }
    for (const signal of tx.signals) frequencies.set(signal.id, (frequencies.get(signal.id) ?? 0) + 1);
  }
  return { daily, distribution, signals: [...frequencies].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id)) };
}
